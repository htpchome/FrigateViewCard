const TALK_SOUNDWAVE_FFT_SIZE = 128;
const TALK_SOUNDWAVE_FRAME_MS = 1000 / 30;
const TALK_SOUNDWAVE_IDLE_ENERGY = 0.075;
const TALK_SOUNDWAVE_MICROPHONE_LAYERS = Object.freeze([
  {
    color: "microphonePrimary",
    frequency: 1.85,
    phaseOffset: 0,
    speed: 1,
    direction: 1,
    amplitudeScale: 1,
    lineWidth: 1.15,
    alpha: 0.96,
  },
  {
    color: "microphoneSecondary",
    frequency: 2.35,
    phaseOffset: 1.45,
    speed: 0.82,
    direction: -1,
    amplitudeScale: 0.82,
    lineWidth: 0.9,
    alpha: 0.76,
  },
  {
    color: "microphoneTertiary",
    frequency: 2.8,
    phaseOffset: -0.8,
    speed: 1.18,
    direction: 1,
    amplitudeScale: 0.66,
    lineWidth: 0.8,
    alpha: 0.64,
  },
]);

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

function defaultAudioContextFactory() {
  const AudioContextClass =
    globalThis.AudioContext || globalThis.webkitAudioContext;
  return AudioContextClass ? new AudioContextClass() : null;
}

function streamHasAudio(stream) {
  return (stream?.getAudioTracks?.() || []).length > 0;
}

function resolveRemoteStream(session) {
  const explicitRemote = session?.engine?.remoteStream;
  if (streamHasAudio(explicitRemote)) return explicitRemote;

  const mountedRemote = session?.engine?.video?.srcObject;
  return streamHasAudio(mountedRemote) ? mountedRemote : null;
}

function createAnalyserBranch(context, stream) {
  if (!context || !streamHasAudio(stream)) return null;
  const source = context.createMediaStreamSource(stream);
  const analyser = context.createAnalyser();
  analyser.fftSize = TALK_SOUNDWAVE_FFT_SIZE;
  analyser.smoothingTimeConstant = 0.72;
  source.connect(analyser);
  return {
    source,
    analyser,
    samples: new Uint8Array(analyser.fftSize),
  };
}

export function calculateTalkSoundwaveEnergy(analyser, samples) {
  if (!analyser || !samples?.length) return 0;
  analyser.getByteTimeDomainData(samples);
  let sum = 0;
  let peak = 0;
  for (const sample of samples) {
    const normalized = (sample - 128) / 128;
    sum += normalized * normalized;
    peak = Math.max(peak, Math.abs(normalized));
  }
  const rms = Math.sqrt(sum / samples.length);
  const responsiveLevel = Math.max(rms, peak * 0.18);
  if (responsiveLevel <= 0.006) return 0;
  const decibels = 20 * Math.log10(responsiveLevel);
  const normalizedLevel = clamp((decibels + 42) / 30, 0, 1);
  return Math.pow(normalizedLevel, 0.88);
}

function drawWave(context, {
  width,
  height,
  color,
  energy,
  phase,
  direction,
  speed = 1,
  phaseOffset = 0,
  frequency = 2,
  amplitudeScale = 1,
  lineWidth = 1,
  alpha = 1,
}) {
  const midpoint = height / 2;
  const responsiveEnergy = Math.pow(clamp(energy, 0, 1), 1.15);
  const amplitude =
    height * (0.006 + responsiveEnergy * 0.43) * amplitudeScale;
  const steps = Math.max(52, Math.round(width / 1.5));
  context.beginPath();
  for (let index = 0; index <= steps; index += 1) {
    const progress = index / steps;
    const centered = (progress - 0.5) * 3.1;
    const envelope = Math.pow(
      4 / (4 + Math.pow(centered, 4)),
      3.2,
    );
    const primary = Math.sin(
      progress * Math.PI * 2 * frequency +
        phase * speed * direction +
        phaseOffset,
    );
    const x = progress * width;
    const y = midpoint + primary * amplitude * envelope;
    if (index === 0) context.moveTo(x, y);
    else context.lineTo(x, y);
  }
  context.globalAlpha = alpha;
  context.strokeStyle = color;
  context.lineWidth = lineWidth;
  context.lineCap = "round";
  context.lineJoin = "round";
  context.shadowColor = color;
  context.shadowBlur = energy > 0.08 ? 3 : 1.5;
  context.stroke();
  context.shadowBlur = 0;
}

export function buildTwoWayTalkSoundwaveMarkup({ active = false } = {}) {
  return `<div class="two-way-talk-soundwave shadow-small" data-two-way-talk-soundwave ${active ? "" : "hidden"} aria-hidden="true"><canvas data-two-way-talk-soundwave-canvas></canvas></div>`;
}

export class TwoWayTalkSoundwaveController {
  constructor({
    resolveCanvas,
    isEnabled = () => true,
    createAudioContext = defaultAudioContextFactory,
    requestFrame = (callback) => requestAnimationFrame(callback),
    cancelFrame = (frame) => cancelAnimationFrame(frame),
    setTimer = (callback, delay) => setTimeout(callback, delay),
    clearTimer = (timer) => clearTimeout(timer),
    getDocument = () => globalThis.document,
    getStyle = (element) => globalThis.getComputedStyle?.(element),
  } = {}) {
    this._resolveCanvas = resolveCanvas;
    this._isEnabled = isEnabled;
    this._createAudioContext = createAudioContext;
    this._requestFrame = requestFrame;
    this._cancelFrame = cancelFrame;
    this._setTimer = setTimer;
    this._clearTimer = clearTimer;
    this._getDocument = getDocument;
    this._getStyle = getStyle;
    this._context = null;
    this._session = null;
    this._microphoneBranch = null;
    this._incomingBranch = null;
    this._canvas = null;
    this._canvasContext = null;
    this._frame = 0;
    this._timer = null;
    this._activationFrame = 0;
    this._activationTimer = null;
    this._pendingSession = null;
    this._running = false;
    this._microphoneEnergy = 0;
    this._incomingEnergy = 0;
    this._colors = null;
    this._onVisibilityChange = () => this._handleVisibilityChange();
  }

  startAfterPaint(session) {
    this.stop();
    if (!this._isEnabled?.() || !streamHasAudio(session?.localStream)) {
      return false;
    }

    this._pendingSession = session;
    this._activationFrame = this._requestFrame(() => {
      this._activationFrame = 0;
      if (this._pendingSession !== session) return;
      this._activationTimer = this._setTimer(() => {
        this._activationTimer = null;
        if (this._pendingSession !== session) return;
        this._pendingSession = null;
        this.start(session);
      }, 0);
    });
    return true;
  }

  start(session) {
    this.stop();
    if (!this._isEnabled?.() || !streamHasAudio(session?.localStream)) {
      return false;
    }

    try {
      const context = this._createAudioContext?.();
      if (!context) return false;
      const microphoneBranch = createAnalyserBranch(
        context,
        session.localStream,
      );
      if (!microphoneBranch) {
        const closeResult = context.close?.();
        void closeResult?.catch?.(() => {});
        return false;
      }
      const remoteStream = resolveRemoteStream(session);
      this._context = context;
      this._session = session;
      this._microphoneBranch = microphoneBranch;
      this._incomingBranch =
        remoteStream && remoteStream !== session.localStream
          ? createAnalyserBranch(context, remoteStream)
          : null;
      this._running = true;
      this.syncCanvas();
      this._getDocument?.()?.addEventListener?.(
        "visibilitychange",
        this._onVisibilityChange,
      );
      void context.resume?.().catch?.(() => {});
      this._scheduleFrame();
      return true;
    } catch (_) {
      this.stop();
      return false;
    }
  }

  syncCanvas() {
    const canvas = this._resolveCanvas?.() || null;
    if (canvas === this._canvas) return;
    this._canvas = canvas;
    this._canvasContext = canvas?.getContext?.("2d") || null;
    this._colors = null;
  }

  stop() {
    this._running = false;
    this._pendingSession = null;
    if (this._activationTimer !== null) {
      this._clearTimer(this._activationTimer);
    }
    if (this._activationFrame) {
      this._cancelFrame(this._activationFrame);
    }
    if (this._timer !== null) this._clearTimer(this._timer);
    if (this._frame) this._cancelFrame(this._frame);
    this._activationTimer = null;
    this._activationFrame = 0;
    this._timer = null;
    this._frame = 0;
    this._getDocument?.()?.removeEventListener?.(
      "visibilitychange",
      this._onVisibilityChange,
    );
    for (const branch of [this._microphoneBranch, this._incomingBranch]) {
      try {
        branch?.source?.disconnect?.();
        branch?.analyser?.disconnect?.();
      } catch (_) {}
    }
    const context = this._context;
    this._context = null;
    this._session = null;
    this._microphoneBranch = null;
    this._incomingBranch = null;
    this._microphoneEnergy = 0;
    this._incomingEnergy = 0;
    this._canvas = null;
    this._canvasContext = null;
    this._colors = null;
    try {
      const closeResult = context?.close?.();
      void closeResult?.catch?.(() => {});
    } catch (_) {}
  }

  _handleVisibilityChange() {
    if (!this._running) return;
    if (this._getDocument?.()?.visibilityState === "hidden") {
      if (this._timer !== null) this._clearTimer(this._timer);
      if (this._frame) this._cancelFrame(this._frame);
      this._timer = null;
      this._frame = 0;
      return;
    }
    this._scheduleFrame();
  }

  _scheduleFrame() {
    if (!this._running || this._timer !== null || this._frame) return;
    if (this._getDocument?.()?.visibilityState === "hidden") return;
    this._timer = this._setTimer(() => {
      this._timer = null;
      if (!this._running) return;
      this._frame = this._requestFrame((timestamp) => {
        this._frame = 0;
        this._draw(timestamp);
        this._scheduleFrame();
      });
    }, TALK_SOUNDWAVE_FRAME_MS);
  }

  _draw(timestamp) {
    this.syncCanvas();
    const canvas = this._canvas;
    const context = this._canvasContext;
    const rect = canvas?.getBoundingClientRect?.();
    const width = Number(rect?.width || 0);
    const height = Number(rect?.height || 0);
    if (!canvas || !context || width <= 0 || height <= 0) return;

    const pixelRatio = clamp(Number(globalThis.devicePixelRatio || 1), 1, 2);
    const targetWidth = Math.max(1, Math.round(width * pixelRatio));
    const targetHeight = Math.max(1, Math.round(height * pixelRatio));
    if (canvas.width !== targetWidth || canvas.height !== targetHeight) {
      canvas.width = targetWidth;
      canvas.height = targetHeight;
    }
    context.setTransform?.(pixelRatio, 0, 0, pixelRatio, 0, 0);
    context.clearRect(0, 0, width, height);

    const microphoneTarget = calculateTalkSoundwaveEnergy(
      this._microphoneBranch?.analyser,
      this._microphoneBranch?.samples,
    );
    const incomingTarget = clamp(
      calculateTalkSoundwaveEnergy(
        this._incomingBranch?.analyser,
        this._incomingBranch?.samples,
      ) * 1.15,
      0,
      1,
    );
    this._microphoneEnergy +=
      (microphoneTarget - this._microphoneEnergy) *
      (microphoneTarget > this._microphoneEnergy ? 0.58 : 0.14);
    this._incomingEnergy +=
      (incomingTarget - this._incomingEnergy) *
      (incomingTarget > this._incomingEnergy ? 0.68 : 0.16);

    if (!this._colors) {
      const style = this._getStyle?.(canvas);
      this._colors = {
        microphonePrimary:
          style
            ?.getPropertyValue?.("--fvc-talk-wave-hot")
            ?.trim() || "#ff3cac",
        microphoneSecondary:
          style
            ?.getPropertyValue?.("--fvc-talk-wave-violet")
            ?.trim() || "#9b5cff",
        microphoneTertiary:
          style
            ?.getPropertyValue?.("--fvc-talk-wave-cyan")
            ?.trim() || "#22d3ee",
        incoming:
          style
            ?.getPropertyValue?.("--fvc-talk-wave-incoming")
            ?.trim() || "#5eead4",
        baseline:
          style
            ?.getPropertyValue?.("--fvc-talk-wave-baseline")
            ?.trim() || "#dbeafe",
      };
    }

    const microphoneMuted = this._session?.microphoneMuted === true;
    context.globalCompositeOperation = "source-over";
    context.globalAlpha = microphoneMuted ? 0.52 : 0.06;
    context.strokeStyle = microphoneMuted
      ? this._colors.microphoneSecondary
      : this._colors.baseline;
    context.lineWidth = microphoneMuted ? 0.9 : 0.7;
    context.beginPath();
    context.moveTo(0, height / 2);
    context.lineTo(width, height / 2);
    context.stroke();

    if (microphoneMuted) {
      context.globalAlpha = 1;
      return;
    }

    context.globalCompositeOperation = "lighter";
    const phase = Number(timestamp || 0) * 0.0065;
    drawWave(context, {
      width,
      height,
      color: this._colors.incoming,
      energy: this._incomingEnergy,
      phase,
      direction: -1,
      speed: 0.68,
      phaseOffset: 0.5,
      frequency: 1.55,
      amplitudeScale: 0.72,
      lineWidth: 0.8,
      alpha: this._incomingBranch ? 0.7 : 0.16,
    });
    const displayedMicrophoneEnergy = Math.max(
      this._microphoneEnergy,
      TALK_SOUNDWAVE_IDLE_ENERGY,
    );
    for (const layer of TALK_SOUNDWAVE_MICROPHONE_LAYERS) {
      drawWave(context, {
        width,
        height,
        color: this._colors[layer.color],
        energy: displayedMicrophoneEnergy,
        phase,
        direction: layer.direction,
        speed: layer.speed,
        phaseOffset: layer.phaseOffset,
        frequency: layer.frequency,
        amplitudeScale: layer.amplitudeScale,
        lineWidth: layer.lineWidth,
        alpha: layer.alpha,
      });
    }
    context.globalCompositeOperation = "source-over";
    context.globalAlpha = 1;
  }
}
