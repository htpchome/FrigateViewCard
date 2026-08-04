import {
  buildHaCameraStreamState,
  createHaCameraStreamElement,
} from "../../integrations/home-assistant/playback.js";
import {
  buildHaDirectMountPlan,
  resolveHaDirectMountUnavailableState,
  resolveHaDirectReadyState,
  resolveHaDirectStabilizedState,
} from "./startup-policy.js";

export function createHaDirectMounter({
  getHass,
  getPreferredStreamType,
  getStreamMuted,
  getRotateOverlayActive,
  isCurrentEngine,
  waitForStreamStart,
  attachVideoFit,
  assignCommittedEngine,
  applyResolvedStreamUiState,
  setLiveNativeControls,
}) {
  const scheduleFollowUp = (streamEl, haDirectPlan) => {
    void (async () => {
      const ok = await waitForStreamStart(
        streamEl,
        haDirectPlan.waitMs,
        haDirectPlan.waitOptions,
      );
      const readyState = resolveHaDirectReadyState({
        rotateOverlayActive: getRotateOverlayActive(),
        isCurrentEngine: isCurrentEngine(streamEl),
        waitSucceeded: ok,
      });
      if (readyState.shouldApply) {
        applyResolvedStreamUiState(readyState);
      }
    })();

    setTimeout(() => {
      const stabilizedState = resolveHaDirectStabilizedState({
        rotateOverlayActive: getRotateOverlayActive(),
        isCurrentEngine: isCurrentEngine(streamEl),
      });
      if (stabilizedState.shouldApply) {
        applyResolvedStreamUiState(stabilizedState);
      }
    }, 1200);
  };

  const tryMount = async (slot, startup = null, options = {}) => {
    const preferredStreamType = getPreferredStreamType();
    const haDirectPlan = buildHaDirectMountPlan({
      startup: startup || {},
      preferredStreamType,
    });
    const commit = options.commit !== false;
    const entity = String(options.entity || "").trim();
    if (!entity) return false;

    const stateObj = buildHaCameraStreamState(
      getHass(),
      entity,
      haDirectPlan.streamType,
      preferredStreamType,
    );
    if (!stateObj) {
      if (commit) {
        applyResolvedStreamUiState(resolveHaDirectMountUnavailableState());
      }
      return false;
    }

    const streamEl = createHaCameraStreamElement({
      hass: getHass(),
      stateObj,
      controls: false,
      muted: options?.muted ?? getStreamMuted(),
      defaultMuted: options.defaultMuted,
      styleText:
        options.styleText ||
        "width:100%;height:100%;display:block;background:var(--c-bg-deep)",
    });
    if (!streamEl) return false;

    slot.innerHTML = "";
    slot.appendChild(streamEl);
    attachVideoFit(streamEl);

    const engine = streamEl;
    if (!commit) {
      return {
        ok: true,
        type: haDirectPlan.streamType,
        engine,
        slot,
      };
    }

    assignCommittedEngine(engine);
    if (getRotateOverlayActive()) {
      setLiveNativeControls(true);
    }
    scheduleFollowUp(streamEl, haDirectPlan);
    return {
      ok: true,
      type: haDirectPlan.streamType,
      engine,
      slot,
    };
  };

  return {
    tryMount,
  };
}
