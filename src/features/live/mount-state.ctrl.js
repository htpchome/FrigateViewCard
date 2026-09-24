import { invalidateMountTrackingIfActive } from "./mount-lifecycle.js";
import { adoptMountedAttemptResult } from "./mount-result.js";

export class LiveMountStateController {
  constructor(host) {
    this._host = host;
  }

  cleanupEngine(options = {}) {
    const host = this._host;
    host._go2rtcRaceMounter?.cancelPendingWebRtcAttempts?.();
    return host._mseGraceController.cleanupEngine(options);
  }

  clearEngineSlot() {
    const engineSlot = this._host._$("#engine");
    if (engineSlot) engineSlot.innerHTML = "";
  }

  cancelPendingMount(reason = "", options = {}) {
    void reason;
    const host = this._host;
    this.applyTrackingState(
      invalidateMountTrackingIfActive({
        mountSeq: host._mountSeq,
        mountInProgress: host._mountInProgress,
        mountStartedAt: host._mountStartedAt,
        mountTargetEntity: host._mountTargetEntity,
      }),
    );
    this.cleanupEngine(options);
  }

  applyTrackingState(nextState) {
    const host = this._host;
    host._mountSeq = nextState.mountSeq;
    host._mountInProgress = nextState.mountInProgress;
    host._mountStartedAt = nextState.mountStartedAt;
    host._mountTargetEntity = nextState.mountTargetEntity;
  }

  adoptAttemptResult(slot, result, options = {}) {
    const host = this._host;
    return adoptMountedAttemptResult({
      targetSlot: slot,
      result,
      preservePendingSlots: options.preservePendingSlots === true,
      streamMuted: host._streamMuted,
      rotateOverlayActive: host._rotateOverlayActive,
      assignEngine: (engine) => host._assignLiveEngine(engine),
      setEngineMountedMuted: (muted) => {
        host._engineMountedMuted = muted;
      },
      setActiveStreamType: (type) => host._setActiveStreamType(type),
      setStreamLoading: (loading) => host._setStreamLoading(loading),
      setStreamFallbackVisible: (visible) =>
        host._setStreamFallbackVisible(visible),
      setLiveNativeControls: (enabled) =>
        host._setLiveNativeControls(enabled),
    });
  }
}

export function getLiveMountStateController(host) {
  if (host._liveMountStateController instanceof LiveMountStateController) {
    return host._liveMountStateController;
  }
  const controller = new LiveMountStateController(host);
  host._liveMountStateController = controller;
  return controller;
}
