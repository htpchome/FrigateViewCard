import {
  resolveHlsStartup,
  resolveMseStartup,
  resolveWebRtcStartup,
} from "./startup-policy.js";
import {
  buildVideoOptionsForView,
  createVideoElement,
  mountNodeIntoSlot,
} from "../../shared/media/video-factory.js";

const WEBRTC_NEGOTIATION_TIMEOUT_MS = 4000;

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

function resolveGo2RtcCodecs(isSupported) {
  const codecs = [
    "avc1.640029",
    "avc1.64002A",
    "avc1.640033",
    "hvc1.1.6.L153.B0",
    "mp4a.40.2",
    "mp4a.40.5",
    "flac",
    "opus",
  ];
  return codecs
    .filter((codec) => isSupported(`video/mp4; codecs="${codec}"`))
    .join(",");
}

function normalizeGo2RtcCodecs(value) {
  if (!value) return "";
  const source = String(value).trim();
  const match = source.match(/codecs\s*=\s*"([^"]+)"/i);
  if (match && match[1]) return match[1].trim();
  if (/^video\//i.test(source)) return "";
  return source;
}

function resolveMediaSourceCapability(browserWindow = globalThis.window) {
  const MediaSourceCtor =
    browserWindow?.MediaSource || browserWindow?.ManagedMediaSource || null;
  if (!MediaSourceCtor) return null;

  const isTypeSupportedImpl = MediaSourceCtor.isTypeSupported;
  if (typeof isTypeSupportedImpl !== "function") return null;

  return {
    MediaSourceCtor,
    isTypeSupported: (mime) => {
      try {
        return isTypeSupportedImpl.call(MediaSourceCtor, mime) === true;
      } catch (_) {
        return false;
      }
    },
  };
}

function startVideoPlayback(video, { load = false } = {}) {
  if (!video) return;
  try {
    if (load) video.load?.();
    const playResult = video.play?.();
    playResult?.catch?.(() => {});
  } catch (_) {}
}

function startFirefoxLiveCatchup(video, isFirefox) {
  if (!video || !isFirefox()) return () => {};
  let firstFrameAt = 0;
  let hardSeekUsed = false;
  const timer = setInterval(() => {
    try {
      const buffered = video.buffered;
      if (!buffered || !buffered.length) return;
      const end = buffered.end(buffered.length - 1);
      const current = Number(video.currentTime) || 0;
      if (current > 0.05 && !firstFrameAt) firstFrameAt = Date.now();
      const lag = end - current;
      if (!Number.isFinite(lag) || lag <= 0) return;

      const sinceFirstFrame = firstFrameAt ? Date.now() - firstFrameAt : 0;
      if (sinceFirstFrame > 0 && sinceFirstFrame < 4000) {
        if (lag > 3.0 && !hardSeekUsed) {
          video.currentTime = Math.max(0, end - 0.08);
          video.playbackRate = 1.0;
          hardSeekUsed = true;
        } else if (lag > 1.5) {
          video.playbackRate = 1.08;
        } else if (lag > 0.7) {
          video.playbackRate = 1.04;
        } else {
          video.playbackRate = 1.0;
        }
        return;
      }

      if (lag > 2.8 && !hardSeekUsed && sinceFirstFrame >= 4000) {
        video.currentTime = Math.max(0, end - 0.2);
        video.playbackRate = 1.0;
        hardSeekUsed = true;
      } else if (lag > 2.0) {
        video.playbackRate = 1.05;
      } else if (lag > 1.0) {
        video.playbackRate = 1.02;
      } else {
        video.playbackRate = 1.0;
      }
    } catch (_) {}
  }, 500);
  return () => clearInterval(timer);
}

function resolveCommittedResult({
  commit,
  type,
  engine,
  slot,
  onCommittedStream,
}) {
  if (!commit) return { ok: true, type, engine, slot };
  onCommittedStream(type);
  return true;
}

export function createGo2RtcMounter({
  resolver,
  getStreamMuted,
  waitForStreamStart,
  attachVideoFit,
  assignCommittedEngine,
  onCommittedStream,
  scheduleResumeLive,
  isFirefox,
  scopeKey,
  resetMseDiagnostics,
  markMseChunk,
  nowMs = () => Date.now(),
}) {
  const tryMountMse = async (slot, startup = null, options = {}) => {
    const {
      waitMs,
      minCurrentTime,
      minDecodedFrames,
      requireReadyState,
      strict,
    } = resolveMseStartup(startup || {});
    const { entity, abortSignal, commit } =
      resolver.resolveMountRequest(options);
    const muted = options?.muted ?? getStreamMuted();
    if (!entity) return false;
    if (abortSignal?.aborted) return false;
    const WebSocketCtor = window?.WebSocket;
    const mediaSourceCapability = resolveMediaSourceCapability(window);
    if (!WebSocketCtor || !mediaSourceCapability) return false;
    const { MediaSourceCtor, isTypeSupported } = mediaSourceCapability;

    const wsUrl = await resolver.websocketUrlForEntity(entity);
    if (!wsUrl || abortSignal?.aborted) return false;

    const video = createVideoElement(
      buildVideoOptionsForView(
        "live",
        {
          muted,
          controls: false,
        },
        { scopeKey },
      ),
    );

    const mediaSource = new MediaSourceCtor();
    video.src = URL.createObjectURL(mediaSource);

    mountNodeIntoSlot(slot, video);
    attachVideoFit(video);
    startVideoPlayback(video);

    const ws = new WebSocketCtor(wsUrl);
    ws.binaryType = "arraybuffer";
    const startupAbort = new AbortController();
    let abortBound = false;
    let streamStarted = false;
    let destroyed = false;
    let recoveryEnabled = commit;
    let recoveryScheduled = false;
    resetMseDiagnostics(nowMs());

    let sourceBuffer = null;
    let mseRequested = false;
    let queue = [];

    const appendNext = () => {
      if (!sourceBuffer || sourceBuffer.updating || !queue.length) return;
      try {
        sourceBuffer.appendBuffer(queue.shift());
      } catch (_) {
        queue = [];
      }
    };

    const stopCatchup = startFirefoxLiveCatchup(video, isFirefox);
    const requestMse = () => {
      if (destroyed) return;
      if (mseRequested) return;
      if (ws.readyState !== WebSocketCtor.OPEN) return;
      const codecs = resolveGo2RtcCodecs(isTypeSupported);
      mseRequested = true;
      ws.send(JSON.stringify({ type: "mse", value: codecs }));
    };

    const destroy = () => {
      destroyed = true;
      try {
        if (!startupAbort.signal.aborted) startupAbort.abort();
      } catch (_) {}
      try {
        ws.close();
      } catch (_) {}
      try {
        stopCatchup();
      } catch (_) {}
      try {
        if (video.src) URL.revokeObjectURL(video.src);
      } catch (_) {}
      if (abortSignal && abortBound) {
        abortSignal.removeEventListener("abort", onAbort);
        abortBound = false;
      }
    };

    const onAbort = () => {
      destroy();
    };
    if (abortSignal) {
      abortSignal.addEventListener("abort", onAbort, { once: true });
      abortBound = true;
    }

    const engine = {
      video,
      ws,
      destroy,
      activateRecovery: () => {
        recoveryEnabled = true;
        recoveryScheduled = false;
      },
      deactivateRecovery: () => {
        recoveryEnabled = false;
      },
    };
    if (commit) assignCommittedEngine(engine);

    mediaSource.addEventListener(
      "sourceopen",
      () => {
        requestMse();
      },
      { once: true },
    );

    ws.addEventListener("open", () => {
      if (destroyed) {
        try {
          ws.close();
        } catch (_) {}
        return;
      }
      if (mediaSource.readyState === "open") requestMse();
    });

    ws.addEventListener("error", () => {
      if (!startupAbort.signal.aborted) startupAbort.abort();
    });

    ws.addEventListener("close", () => {
      if (!startupAbort.signal.aborted) startupAbort.abort();
      if (
        !destroyed &&
        streamStarted &&
        recoveryEnabled &&
        !recoveryScheduled
      ) {
        recoveryScheduled = true;
        scheduleResumeLive("mse-ws-closed");
      }
    });

    ws.addEventListener("message", (event) => {
      if (destroyed) return;
      if (typeof event.data === "string") {
        let msg;
        try {
          msg = JSON.parse(event.data);
        } catch (_) {
          return;
        }

        if (
          msg?.type === "mse" &&
          msg.value &&
          mediaSource.readyState === "open"
        ) {
          if (sourceBuffer) return;
          try {
            const codecs = normalizeGo2RtcCodecs(msg.value);
            if (!codecs) return;
            const mime = `video/mp4; codecs="${codecs}"`;
            if (!isTypeSupported(mime)) return;
            sourceBuffer = mediaSource.addSourceBuffer(mime);
            sourceBuffer.mode = "segments";
            sourceBuffer.addEventListener("updateend", appendNext);
            startVideoPlayback(video);
            appendNext();
          } catch (_) {}
        }
        return;
      }

      if (!(event.data instanceof ArrayBuffer)) return;
      markMseChunk(nowMs());
      queue.push(event.data);
      appendNext();
    });

    const started = await waitForStreamStart(slot, waitMs, {
      minCurrentTime,
      minDecodedFrames,
      requireReadyState,
      strict,
      abortSignal: startupAbort.signal,
    });
    if (!started) {
      destroy();
      return false;
    }
    streamStarted = true;

    return resolveCommittedResult({
      commit,
      type: "mse",
      engine,
      slot,
      onCommittedStream,
    });
  };

  const tryMountWebRtc = async (slot, startup = null, options = {}) => {
    const {
      waitMs,
      minCurrentTime,
      minDecodedFrames,
      requireReadyState,
      strict,
    } = resolveWebRtcStartup({
      startup: startup || {},
    });
    const { entity, abortSignal, commit } =
      resolver.resolveMountRequest(options);

    if (abortSignal?.aborted) return false;
    if (!("RTCPeerConnection" in window) || !("WebSocket" in window)) {
      return false;
    }
    if (!entity) return false;

    const wsUrl = await resolver.websocketUrlForEntity(entity);
    if (!wsUrl || abortSignal?.aborted) return false;

    const microphoneStream = options?.microphoneStream || null;
    const microphoneTrack = resolveMicrophoneTrack(microphoneStream);
    if (microphoneStream && !microphoneTrack) return false;
    const onMicrophoneSessionEnded =
      options?.onEnded || options?.onMicrophoneSessionEnded;

    const video = createVideoElement(
      buildVideoOptionsForView(
        "live",
        {
          muted: options?.muted ?? getStreamMuted(),
          controls: false,
        },
        { scopeKey },
      ),
    );

    mountNodeIntoSlot(slot, video);
    attachVideoFit(video);

    const pc = new RTCPeerConnection({
      bundlePolicy: "max-bundle",
      sdpSemantics: "unified-plan",
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });
    const ws = new WebSocket(wsUrl);
    let abortBound = false;
    let destroyed = false;
    let streamStarted = false;
    let recoveryScheduled = false;
    let recoveryEnabled = commit;
    let microphoneEndNotified = false;
    const negotiationTimeoutMs = Math.max(
      1,
      Number(options?.negotiationTimeoutMs) || WEBRTC_NEGOTIATION_TIMEOUT_MS,
    );
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

    const notifyMicrophoneSessionEnded = () => {
      if (destroyed || !microphoneStream || microphoneEndNotified) {
        return;
      }
      microphoneEndNotified = true;
      stopMediaStream(microphoneStream);
      onMicrophoneSessionEnded?.();
    };

    const destroy = () => {
      if (destroyed) return;
      destroyed = true;
      clearNegotiationTimer();
      settleNegotiationGuard(false);
      try {
        video.pause?.();
      } catch (_) {}
      try {
        for (const track of video.srcObject?.getTracks?.() || []) {
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
      try {
        ws.close();
      } catch (_) {}
      stopMediaStream(microphoneStream);
      if (abortSignal && abortBound) {
        abortSignal.removeEventListener("abort", onAbort);
        abortBound = false;
      }
    };

    const onAbort = () => {
      destroy();
    };
    if (abortSignal) {
      abortSignal.addEventListener("abort", onAbort, { once: true });
      abortBound = true;
    }

    const engine = {
      type: "frigate_go2rtc",
      video,
      pc,
      ws,
      localStream: microphoneStream,
      microphoneStream,
      destroy,
      activateRecovery: () => {
        recoveryEnabled = true;
        recoveryScheduled = false;
      },
      deactivateRecovery: () => {
        recoveryEnabled = false;
      },
    };
    if (commit) assignCommittedEngine(engine);

    if (microphoneTrack) {
      pc.addTransceiver(microphoneTrack, {
        direction: "sendonly",
        streams: [microphoneStream],
      });
    }
    pc.addTransceiver("video", { direction: "recvonly" });
    pc.addTransceiver("audio", { direction: "recvonly" });

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
      notifyMicrophoneSessionEnded();
      scheduleResumeLive(reason);
    };

    microphoneTrack?.addEventListener?.("ended", () => {
      scheduleRecovery("webrtc-talk-microphone-ended");
    });

    pc.addEventListener("connectionstatechange", () => {
      if (pc.connectionState === "connected") clearNegotiationTimer();
      if (["disconnected", "failed"].includes(pc.connectionState)) {
        scheduleRecovery("webrtc-connection-lost");
      }
    });
    pc.addEventListener("iceconnectionstatechange", () => {
      if (["connected", "completed"].includes(pc.iceConnectionState)) {
        clearNegotiationTimer();
      }
      if (["disconnected", "failed"].includes(pc.iceConnectionState)) {
        scheduleRecovery("webrtc-connection-lost");
      }
    });
    ws.addEventListener("close", () => {
      scheduleRecovery("webrtc-ws-closed");
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
      if (event.streams && event.streams[0]) {
        video.srcObject = event.streams[0];
      } else {
        const mediaStream = video.srcObject || new MediaStream();
        mediaStream.addTrack(event.track);
        video.srcObject = mediaStream;
      }
      video.play().catch(() => {});
      if (video.requestVideoFrameCallback) {
        video.requestVideoFrameCallback(() => {
          if (!resolveFirstRenderedFrame) return;
          resolveFirstRenderedFrame(true);
          resolveFirstRenderedFrame = null;
        });
      }
    });

    pc.addEventListener("icecandidate", (event) => {
      if (destroyed) return;
      if (ws.readyState !== WebSocket.OPEN) return;
      const candidate = event.candidate
        ? event.candidate.toJSON().candidate
        : "";
      ws.send(JSON.stringify({ type: "webrtc/candidate", value: candidate }));
    });

    ws.addEventListener("message", (event) => {
      if (destroyed) return;
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
      } else if (msg?.type === "webrtc/candidate") {
        pc.addIceCandidate({ candidate: msg.value, sdpMid: "0" }).catch(
          () => {},
        );
      }
    });

    ws.addEventListener("open", async () => {
      if (destroyed || abortSignal?.aborted) {
        try {
          ws.close();
        } catch (_) {}
        return;
      }
      try {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        if (
          destroyed ||
          abortSignal?.aborted ||
          ws.readyState !== WebSocket.OPEN
        ) {
          try {
            ws.close();
          } catch (_) {}
          return;
        }
        ws.send(JSON.stringify({ type: "webrtc/offer", value: offer.sdp }));
        if (!negotiationTimer) {
          negotiationTimer = setTimeout(() => {
            if (destroyed || streamStarted) return;
            destroy();
          }, negotiationTimeoutMs);
        }
      } catch (_) {}
    });

    const started = await Promise.race([
      waitForStreamStart(slot, waitMs, {
        minCurrentTime,
        minDecodedFrames,
        requireReadyState,
        strict,
        abortSignal,
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

    return resolveCommittedResult({
      commit,
      type: "webrtc",
      engine,
      slot,
      onCommittedStream,
    });
  };

  const tryMountHls = async (slot, startup = null, options = {}) => {
    const { waitMs } = resolveHlsStartup(startup || {});
    const { entity, abortSignal, commit } =
      resolver.resolveMountRequest(options);
    if (abortSignal?.aborted) return false;
    if (!entity) return false;

    const hlsSource = await resolver.hlsUrlForEntity(entity);
    if (!hlsSource?.url || abortSignal?.aborted) {
      try {
        hlsSource?.destroy?.();
      } catch (_) {}
      return false;
    }

    const video = createVideoElement(
      buildVideoOptionsForView(
        "live",
        {
          muted: options?.muted ?? getStreamMuted(),
          controls: false,
          src: hlsSource.url,
        },
        { scopeKey },
      ),
    );

    mountNodeIntoSlot(slot, video);
    attachVideoFit(video);

    let abortBound = false;
    let destroyed = false;
    let streamStarted = false;
    let recoveryScheduled = false;
    let recoveryEnabled = commit;
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
      scheduleResumeLive(reason);
    };
    video.addEventListener("error", () => scheduleRecovery("hls-error"));
    video.addEventListener("ended", () => scheduleRecovery("hls-ended"));
    const destroy = () => {
      destroyed = true;
      try {
        video.pause();
        video.removeAttribute("src");
        video.load();
      } catch (_) {}
      try {
        hlsSource.destroy?.();
      } catch (_) {}
      try {
        if (video.src?.startsWith("blob:")) URL.revokeObjectURL(video.src);
      } catch (_) {}
      if (abortSignal && abortBound) {
        abortSignal.removeEventListener("abort", onAbort);
        abortBound = false;
      }
    };

    const onAbort = () => {
      destroy();
    };
    if (abortSignal) {
      abortSignal.addEventListener("abort", onAbort, { once: true });
      abortBound = true;
    }

    const engine = {
      video,
      destroy,
      activateRecovery: () => {
        recoveryEnabled = true;
        recoveryScheduled = false;
      },
      deactivateRecovery: () => {
        recoveryEnabled = false;
      },
    };
    if (commit) assignCommittedEngine(engine);
    startVideoPlayback(video, { load: true });

    const started = await waitForStreamStart(slot, waitMs, {
      minCurrentTime: 0.05,
      minDecodedFrames: 1,
      requireReadyState: 2,
      strict: false,
      abortSignal,
    });
    if (!started) {
      destroy();
      return false;
    }
    streamStarted = true;

    return resolveCommittedResult({
      commit,
      type: "hls",
      engine,
      slot,
      onCommittedStream,
    });
  };

  return {
    tryMountMse,
    tryMountWebRtc,
    tryMountHls,
  };
}
