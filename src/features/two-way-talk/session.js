function resolveNavigatorMediaDevices() {
  return typeof navigator !== "undefined" ? navigator.mediaDevices : null;
}

async function requestMicrophoneStream() {
  const mediaDevices = resolveNavigatorMediaDevices();
  if (!mediaDevices?.getUserMedia) {
    throw new Error("Microphone capture is not supported in this browser");
  }
  return mediaDevices.getUserMedia({
    audio: {
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true,
    },
    video: false,
  });
}

function stopMediaStream(stream) {
  stream?.getTracks?.().forEach((track) => {
    try {
      track.stop();
    } catch (_) {}
  });
}

function createPeerConnection(configuration) {
  return new RTCPeerConnection(
    configuration || {
      bundlePolicy: "max-bundle",
      sdpSemantics: "unified-plan",
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    },
  );
}

function bindLocalAudioTrack(pc, stream) {
  const [audioTrack] = stream.getAudioTracks();
  if (!audioTrack) {
    throw new Error("No microphone audio track available");
  }
  pc.addTrack(audioTrack, stream);
  pc.addTransceiver("video", { direction: "recvonly" });
}

export async function startGo2RtcTwoWayTalkSession({ websocketUrl, onEnded }) {
  if (!websocketUrl) {
    throw new Error("Missing go2rtc WebSocket URL");
  }

  const localStream = await requestMicrophoneStream();
  const pc = createPeerConnection();
  const ws = new WebSocket(websocketUrl);
  let ended = false;

  const notifyEnded = () => {
    if (ended) return;
    ended = true;
    onEnded?.();
  };

  bindLocalAudioTrack(pc, localStream);

  const stop = () => {
    try {
      ws.close();
    } catch (_) {}
    try {
      pc.close();
    } catch (_) {}
    stopMediaStream(localStream);
    notifyEnded();
  };

  pc.addEventListener("icecandidate", (event) => {
    if (ws.readyState !== WebSocket.OPEN || !event.candidate) return;
    ws.send(
      JSON.stringify({
        type: "webrtc/candidate",
        value: event.candidate.toJSON().candidate,
      }),
    );
  });

  ws.addEventListener("message", (event) => {
    let msg;
    try {
      msg = JSON.parse(event.data);
    } catch (_) {
      return;
    }
    if (msg?.type === "webrtc/answer") {
      pc.setRemoteDescription({
        type: "answer",
        sdp: msg.value,
      }).catch(() => {});
      return;
    }
    if (msg?.type === "webrtc/candidate") {
      pc.addIceCandidate({ candidate: msg.value, sdpMid: "0" }).catch(() => {});
    }
  });
  ws.addEventListener("close", () => notifyEnded(), { once: true });
  ws.addEventListener("error", () => notifyEnded(), { once: true });

  await new Promise((resolve, reject) => {
    const handleOpen = async () => {
      try {
        const offer = await pc.createOffer({
          offerToReceiveAudio: false,
          offerToReceiveVideo: true,
        });
        await pc.setLocalDescription(offer);
        ws.send(JSON.stringify({ type: "webrtc/offer", value: offer.sdp }));
        resolve();
      } catch (error) {
        reject(error);
      }
    };
    const handleError = () => {
      reject(new Error("Unable to open go2rtc talkback socket"));
    };
    ws.addEventListener("open", handleOpen, { once: true });
    ws.addEventListener("error", handleError, { once: true });
  }).catch((error) => {
    stop();
    throw error;
  });

  return {
    type: "frigate_go2rtc",
    stop,
    pc,
    ws,
    localStream,
  };
}

export async function startHaDirectTwoWayTalkSession({
  hass,
  entityId,
  onEnded,
}) {
  if (!hass?.callWS || !hass?.connection || !entityId) {
    throw new Error("Missing Home Assistant WebRTC session context");
  }

  const clientConfig = await hass.callWS({
    type: "camera/webrtc/get_client_config",
    entity_id: entityId,
  });
  const localStream = await requestMicrophoneStream();
  const pc = createPeerConnection(clientConfig?.configuration);
  const pendingCandidates = [];
  let sessionId = "";
  let unsubscribe = null;
  let ended = false;

  const notifyEnded = () => {
    if (ended) return;
    ended = true;
    onEnded?.();
  };

  bindLocalAudioTrack(pc, localStream);

  if (clientConfig?.dataChannel) {
    pc.createDataChannel(clientConfig.dataChannel);
  }

  const stop = async () => {
    try {
      pc.close();
    } catch (_) {}
    stopMediaStream(localStream);
    try {
      const unsub = await unsubscribe;
      if (typeof unsub === "function") unsub();
    } catch (_) {}
    notifyEnded();
  };

  pc.addEventListener("icecandidate", (event) => {
    if (!event.candidate) return;
    if (!sessionId) {
      pendingCandidates.push(event.candidate.toJSON());
      return;
    }
    hass
      .callWS({
        type: "camera/webrtc/candidate",
        entity_id: entityId,
        session_id: sessionId,
        candidate: event.candidate.toJSON(),
      })
      .catch(() => {});
  });

  const offer = await pc.createOffer({
    offerToReceiveAudio: false,
    offerToReceiveVideo: true,
  });
  await pc.setLocalDescription(offer);

  unsubscribe = hass.connection.subscribeMessage(
    async (event) => {
      if (event?.type === "session") {
        sessionId = event.session_id || "";
        while (pendingCandidates.length) {
          const candidate = pendingCandidates.shift();
          await hass
            .callWS({
              type: "camera/webrtc/candidate",
              entity_id: entityId,
              session_id: sessionId,
              candidate,
            })
            .catch(() => {});
        }
        return;
      }
      if (event?.type === "answer") {
        pc.setRemoteDescription({
          type: "answer",
          sdp: event.answer,
        }).catch(() => {});
        return;
      }
      if (event?.type === "candidate") {
        const candidate =
          event.candidate?.sdpMid || event.candidate?.sdpMLineIndex != null
            ? new RTCIceCandidate(event.candidate)
            : new RTCIceCandidate({
                candidate: event.candidate?.candidate,
                sdpMid: "0",
              });
        pc.addIceCandidate(candidate).catch(() => {});
        return;
      }
      if (event?.type === "error") {
        await stop();
      }
    },
    {
      type: "camera/webrtc/offer",
      entity_id: entityId,
      offer: offer.sdp,
    },
  );

  return {
    type: "ha_direct",
    stop,
    pc,
    localStream,
  };
}
