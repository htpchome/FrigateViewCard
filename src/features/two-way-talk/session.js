function resolveNavigatorMediaDevices() {
  return typeof navigator !== "undefined" ? navigator.mediaDevices : null;
}

async function requestMicrophoneStream() {
  const mediaDevices = resolveNavigatorMediaDevices();
  if (!mediaDevices?.getUserMedia) {
    throw new Error("Microphone capture is not supported in this browser");
  }
  return await mediaDevices.getUserMedia({ audio: true, video: false });
}

function stopMediaStream(stream) {
  stream?.getTracks?.().forEach((track) => {
    try {
      track.stop();
    } catch (_) {}
  });
}

async function startMountedTwoWayTalkSession({
  type,
  mountMicrophoneStream,
  onEnded,
}) {
  if (typeof mountMicrophoneStream !== "function") {
    throw new Error(`Missing ${type} two-way talk mount handler`);
  }

  const localStream = await requestMicrophoneStream();
  let engine = null;
  let stopped = false;
  let ended = false;
  let microphoneMuted = false;

  const notifyEnded = () => {
    if (ended) return;
    ended = true;
    onEnded?.();
  };

  try {
    engine = await mountMicrophoneStream({
      localStream,
      onEnded: notifyEnded,
    });
    if (!engine) {
      throw new Error(`Unable to establish ${type} two-way talk`);
    }
  } catch (error) {
    stopMediaStream(localStream);
    throw error;
  }

  const stop = async () => {
    if (stopped) return;
    stopped = true;
    try {
      await engine?.destroy?.();
    } finally {
      stopMediaStream(localStream);
      notifyEnded();
    }
  };

  const setMicrophoneMuted = (muted) => {
    microphoneMuted = muted === true;
    for (const track of localStream.getAudioTracks?.() || []) {
      track.enabled = !microphoneMuted;
    }
    return microphoneMuted;
  };

  return {
    type,
    stop,
    setMicrophoneMuted,
    engine,
    localStream,
    get microphoneMuted() {
      return microphoneMuted;
    },
  };
}

export async function startGo2RtcTwoWayTalkSession({
  mountMicrophoneStream,
  onEnded,
}) {
  return await startMountedTwoWayTalkSession({
    type: "frigate_go2rtc",
    mountMicrophoneStream,
    onEnded,
  });
}

export async function startHaDirectTwoWayTalkSession({
  mountMicrophoneStream,
  onEnded,
}) {
  return await startMountedTwoWayTalkSession({
    type: "ha_direct",
    mountMicrophoneStream,
    onEnded,
  });
}
