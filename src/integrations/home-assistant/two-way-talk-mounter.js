import {
  buildVideoOptionsForView,
  createVideoElement,
  mountNodeIntoSlot,
} from "../../shared/media/video-factory.js";

const HA_TALK_NEGOTIATION_TIMEOUT_MS = 7000;

function stopMediaStream(stream) {
  stream?.getTracks?.().forEach((track) => {
    try {
      track.stop();
    } catch (_) {}
  });
}

function resolveMicrophoneTrack(stream) {
  return stream?.getAudioTracks?.()?.[0] || null;
}

export function createHaDirectTwoWayTalkMounter({
  getHass,
  getStreamMuted,
  waitForStreamStart,
  attachVideoFit,
  assignCommittedEngine,
  onCommittedStream,
  scheduleResumeLive,
  scopeKey,
}) {
  const tryMount = async (slot, startup = null, options = {}) => {
    const hass = getHass?.();
    const entity = String(options?.entity || "").trim();
    const localStream = options?.microphoneStream || null;
    const microphoneTrack = resolveMicrophoneTrack(localStream);
    const commit = options?.commit !== false;
    const onEnded = options?.onEnded;
    if (
      !slot ||
      !entity ||
      !microphoneTrack ||
      !hass?.callWS ||
      !hass?.connection?.subscribeMessage ||
      typeof RTCPeerConnection === "undefined"
    ) {
      return false;
    }

    const clientConfig = await hass.callWS({
      type: "camera/webrtc/get_client_config",
      entity_id: entity,
    });

    const video = createVideoElement(
      buildVideoOptionsForView(
        "live",
        {
          muted: options?.muted ?? getStreamMuted?.(),
          controls: false,
        },
        { scopeKey },
      ),
    );
    mountNodeIntoSlot(slot, video);
    attachVideoFit?.(video);

    const pc = new RTCPeerConnection(clientConfig?.configuration);
    const remoteStream =
      typeof MediaStream !== "undefined" ? new MediaStream() : null;
    const pendingCandidates = [];
    let sessionId = "";
    let unsubscribePromise = null;
    let destroyed = false;
    let streamStarted = false;
    let recoveryEnabled = commit;
    let recoveryScheduled = false;
    let endedNotified = false;
    let negotiationTimer = null;
    let resolveNegotiationGuard = null;
    const negotiationGuardPromise = new Promise((resolve) => {
      resolveNegotiationGuard = resolve;
    });

    const clearNegotiationTimer = () => {
      if (!negotiationTimer) return;
      clearTimeout(negotiationTimer);
      negotiationTimer = null;
    };

    const settleNegotiationGuard = (result) => {
      if (!resolveNegotiationGuard) return;
      resolveNegotiationGuard(result);
      resolveNegotiationGuard = null;
    };

    const notifyEnded = () => {
      if (destroyed || endedNotified) return;
      endedNotified = true;
      stopMediaStream(localStream);
      onEnded?.();
    };

    const scheduleRecovery = (reason) => {
      if (
        destroyed ||
        !streamStarted ||
        !recoveryEnabled ||
        recoveryScheduled
      ) {
        return;
      }
      recoveryScheduled = true;
      notifyEnded();
      scheduleResumeLive?.(reason);
    };

    const destroy = () => {
      if (destroyed) return;
      destroyed = true;
      clearNegotiationTimer();
      settleNegotiationGuard(false);
      stopMediaStream(localStream);
      try {
        video.pause?.();
        for (const track of remoteStream?.getTracks?.() || []) {
          track.stop?.();
        }
        video.srcObject = null;
      } catch (_) {}
      try {
        for (const transceiver of pc.getTransceivers?.() || []) {
          transceiver.stop?.();
        }
        pc.close();
      } catch (_) {}
      if (unsubscribePromise) {
        void unsubscribePromise
          .then((unsubscribe) => {
            if (typeof unsubscribe === "function") unsubscribe();
          })
          .catch(() => {});
      }
    };

    const engine = {
      type: "ha_direct",
      video,
      pc,
      localStream,
      remoteStream,
      microphoneStream: localStream,
      destroy,
      activateRecovery: () => {
        recoveryEnabled = true;
        recoveryScheduled = false;
      },
      deactivateRecovery: () => {
        recoveryEnabled = false;
      },
    };
    if (commit) assignCommittedEngine?.(engine);

    if (clientConfig?.dataChannel) {
      pc.createDataChannel(clientConfig.dataChannel);
    }
    pc.addTransceiver(microphoneTrack, {
      direction: "sendonly",
      streams: [localStream],
    });
    pc.addTransceiver("video", { direction: "recvonly" });
    pc.addTransceiver("audio", { direction: "recvonly" });

    microphoneTrack.addEventListener?.("ended", () => {
      scheduleRecovery("ha-direct-talk-microphone-ended");
    });

    pc.addEventListener("connectionstatechange", () => {
      if (pc.connectionState === "connected") clearNegotiationTimer();
      if (["disconnected", "failed"].includes(pc.connectionState)) {
        scheduleRecovery("ha-direct-talk-connection-lost");
      }
    });
    pc.addEventListener("iceconnectionstatechange", () => {
      if (["connected", "completed"].includes(pc.iceConnectionState)) {
        clearNegotiationTimer();
      }
      if (["disconnected", "failed"].includes(pc.iceConnectionState)) {
        scheduleRecovery("ha-direct-talk-connection-lost");
      }
    });

    let resolveFirstRenderedFrame = null;
    const firstRenderedFramePromise = new Promise((resolve) => {
      resolveFirstRenderedFrame = resolve;
    });

    pc.addEventListener("track", (event) => {
      if (destroyed) {
        try {
          event.track?.stop?.();
        } catch (_) {}
        return;
      }
      if (remoteStream) {
        remoteStream.addTrack(event.track);
        video.srcObject = remoteStream;
      } else if (event.streams?.[0]) {
        video.srcObject = event.streams[0];
      }
      video.play?.().catch?.(() => {});
      if (event.track?.kind === "video" && video.requestVideoFrameCallback) {
        video.requestVideoFrameCallback(() => {
          if (!resolveFirstRenderedFrame) return;
          resolveFirstRenderedFrame(true);
          resolveFirstRenderedFrame = null;
        });
      }
    });

    pc.addEventListener("icecandidate", (event) => {
      if (destroyed || !event.candidate) return;
      const candidate = event.candidate.toJSON();
      if (!sessionId) {
        pendingCandidates.push(candidate);
        return;
      }
      hass
        .callWS({
          type: "camera/webrtc/candidate",
          entity_id: entity,
          session_id: sessionId,
          candidate,
        })
        .catch(() => {});
    });

    const handleOfferEvent = async (event) => {
      if (destroyed) return;
      if (event?.type === "session") {
        sessionId = event.session_id || "";
        while (pendingCandidates.length) {
          const candidate = pendingCandidates.shift();
          await hass
            .callWS({
              type: "camera/webrtc/candidate",
              entity_id: entity,
              session_id: sessionId,
              candidate,
            })
            .catch(() => {});
        }
        return;
      }
      if (event?.type === "answer") {
        try {
          await pc.setRemoteDescription({
            type: "answer",
            sdp: event.answer,
          });
        } catch (_) {
          destroy();
        }
        return;
      }
      if (event?.type === "candidate") {
        const candidate =
          event.candidate?.sdpMid ||
          event.candidate?.sdpMLineIndex != null
            ? new RTCIceCandidate(event.candidate)
            : new RTCIceCandidate({
                candidate: event.candidate?.candidate,
                sdpMid: "0",
              });
        pc.addIceCandidate(candidate).catch(() => {});
        return;
      }
      if (event?.type === "error") {
        if (streamStarted) {
          scheduleRecovery("ha-direct-talk-signaling-error");
        } else {
          destroy();
        }
      }
    };

    try {
      const offer = await pc.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true,
      });
      await pc.setLocalDescription(offer);
      unsubscribePromise = Promise.resolve(
        hass.connection.subscribeMessage(handleOfferEvent, {
          type: "camera/webrtc/offer",
          entity_id: entity,
          offer: offer.sdp,
        }),
      );
      unsubscribePromise.catch(() => {
        if (streamStarted) {
          scheduleRecovery("ha-direct-talk-signaling-error");
        } else {
          destroy();
        }
      });
    } catch (error) {
      destroy();
      throw error;
    }

    const negotiationTimeoutMs = Math.max(
      1,
      Number(options?.negotiationTimeoutMs) ||
        HA_TALK_NEGOTIATION_TIMEOUT_MS,
    );
    negotiationTimer = setTimeout(() => {
      if (destroyed || streamStarted) return;
      destroy();
    }, negotiationTimeoutMs);

    const waitMs = Math.max(
      1,
      Number(startup?.waitMs) || HA_TALK_NEGOTIATION_TIMEOUT_MS,
    );
    const started = await Promise.race([
      waitForStreamStart(slot, waitMs, {
        minCurrentTime: 0.05,
        minDecodedFrames: 1,
        requireReadyState: 2,
        strict: true,
      }),
      firstRenderedFramePromise,
      negotiationGuardPromise,
    ]);
    resolveFirstRenderedFrame = null;
    if (!started) {
      destroy();
      return false;
    }

    streamStarted = true;
    clearNegotiationTimer();
    if (!commit) {
      return { ok: true, type: "webrtc", engine, slot };
    }
    onCommittedStream?.("webrtc");
    return { ok: true, type: "webrtc", engine, slot };
  };

  return { tryMount };
}
