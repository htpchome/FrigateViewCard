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
    if (!("WebSocket" in window) || !("MediaSource" in window)) {
      return false;
    }

    const wsUrl = await resolver.websocketUrlForEntity(entity);
    if (!wsUrl) return false;

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

    const mediaSource = new MediaSource();
    video.src = URL.createObjectURL(mediaSource);

    mountNodeIntoSlot(slot, video);
    attachVideoFit(video);

    const ws = new WebSocket(wsUrl);
    ws.binaryType = "arraybuffer";
    const startupAbort = new AbortController();
    let abortBound = false;
    let streamStarted = false;
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
      if (mseRequested) return;
      if (ws.readyState !== WebSocket.OPEN) return;
      const codecs = resolveGo2RtcCodecs(MediaSource.isTypeSupported);
      mseRequested = true;
      ws.send(JSON.stringify({ type: "mse", value: codecs }));
    };

    const destroy = () => {
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

    const engine = { video, ws, destroy };
    if (commit) assignCommittedEngine(engine);

    mediaSource.addEventListener(
      "sourceopen",
      () => {
        requestMse();
      },
      { once: true },
    );

    ws.addEventListener("open", () => {
      if (mediaSource.readyState === "open") requestMse();
    });

    ws.addEventListener("error", () => {
      if (!startupAbort.signal.aborted) startupAbort.abort();
    });

    ws.addEventListener("close", () => {
      if (!startupAbort.signal.aborted) startupAbort.abort();
      if (streamStarted && commit) {
        scheduleResumeLive("mse-ws-closed");
      }
    });

    ws.addEventListener("message", (event) => {
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
            if (!MediaSource.isTypeSupported(mime)) return;
            sourceBuffer = mediaSource.addSourceBuffer(mime);
            sourceBuffer.mode = "segments";
            sourceBuffer.addEventListener("updateend", appendNext);
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
    if (!wsUrl) return false;

    const video = createVideoElement(
      buildVideoOptionsForView(
        "live",
        {
          muted: getStreamMuted(),
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

    const destroy = () => {
      try {
        ws.close();
      } catch (_) {}
      try {
        pc.close();
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

    const engine = { video, pc, ws, destroy };
    if (commit) assignCommittedEngine(engine);

    pc.addTransceiver("video", { direction: "recvonly" });
    pc.addTransceiver("audio", { direction: "recvonly" });

    let resolveFirstRenderedFrame = null;
    const firstRenderedFramePromise = new Promise((resolve) => {
      resolveFirstRenderedFrame = resolve;
    });

    pc.addEventListener("track", (event) => {
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
      if (ws.readyState !== WebSocket.OPEN) return;
      const candidate = event.candidate
        ? event.candidate.toJSON().candidate
        : "";
      ws.send(JSON.stringify({ type: "webrtc/candidate", value: candidate }));
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
      } else if (msg?.type === "webrtc/candidate") {
        pc.addIceCandidate({ candidate: msg.value, sdpMid: "0" }).catch(
          () => {},
        );
      }
    });

    ws.addEventListener("open", async () => {
      try {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        ws.send(JSON.stringify({ type: "webrtc/offer", value: offer.sdp }));
      } catch (_) {}
    });

    const started = await Promise.race([
      waitForStreamStart(video, waitMs, {
        minCurrentTime,
        minDecodedFrames,
        requireReadyState,
        strict,
        abortSignal,
      }),
      firstRenderedFramePromise,
    ]);
    resolveFirstRenderedFrame = null;
    if (!started) {
      destroy();
      return false;
    }

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
    if (!hlsSource?.url) return false;

    const video = createVideoElement(
      buildVideoOptionsForView(
        "live",
        {
          muted: getStreamMuted(),
          controls: false,
          src: hlsSource.url,
        },
        { scopeKey },
      ),
    );

    mountNodeIntoSlot(slot, video);
    attachVideoFit(video);

    let abortBound = false;
    const destroy = () => {
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

    const engine = { video, destroy };
    if (commit) assignCommittedEngine(engine);

    const started = await waitForStreamStart(video, waitMs, {
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
