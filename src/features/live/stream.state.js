import { hideFallbackStatus } from "./fallbacks/fallback-status.js";

export const isLiveTransportType = (type) => {
  const active = String(type || "")
    .trim()
    .toLowerCase();
  return active === "webrtc" || active === "mse" || active === "hls";
};

export const resolveCameraAvailabilitySnapshot = ({
  previous = null,
  entity = "",
  state = null,
} = {}) => {
  const current = {
    entity: String(entity || ""),
    available: state?.state !== "unavailable",
  };
  return {
    current,
    recovered:
      Boolean(current.entity) &&
      previous?.entity === current.entity &&
      previous?.available === false &&
      current.available === true,
  };
};

export const resolveActiveStreamTypeState = ({ type, lastLiveStreamHint }) => {
  const activeStreamType = type || "--";
  return {
    activeStreamType,
    lastLiveStreamHint: isLiveTransportType(activeStreamType)
      ? String(activeStreamType).trim().toLowerCase()
      : lastLiveStreamHint,
  };
};

export const applyStreamLoadingState = ({ shadowRoot, loading, text }) => {
  const el = shadowRoot?.querySelector?.("#stream-loading");
  if (!el) return;
  el.hidden = !loading;
  const label = el.querySelector?.(".label");
  if (label) label.textContent = text;
};

export const applyStreamLoadingStateForCard = ({ card, loading, text }) => {
  if (!card) return;
  applyStreamLoadingState({
    shadowRoot: card.shadowRoot,
    loading,
    text,
  });
};

export const applyStreamFallbackState = ({
  shadowRoot,
  visible,
  refreshImage,
  onRefresh,
}) => {
  const placeholder = shadowRoot?.querySelector?.("#stream-fallback");
  const status = shadowRoot?.querySelector?.("#stream-fallback-status");
  if (!placeholder) return;
  placeholder.hidden = !visible;
  if (!visible) hideFallbackStatus(status);
  if (visible && refreshImage) onRefresh?.();
};

export const applyStreamFallbackVisibility = ({
  shadowRoot,
  visible,
  refreshImage,
  refreshFallbackImage,
}) => {
  applyStreamFallbackState({
    shadowRoot,
    visible,
    refreshImage,
    onRefresh: () => refreshFallbackImage?.(),
  });
};

export const applyStreamFallbackVisibilityForCard = ({
  card,
  visible,
  refreshImage,
}) => {
  if (!card) return;
  applyStreamFallbackVisibility({
    shadowRoot: card.shadowRoot,
    visible,
    refreshImage,
    refreshFallbackImage: () => card._refreshStreamFallbackImage?.(),
  });
};

export const applyActiveStreamTypeForCard = ({ card, type }) => {
  if (!card) return;
  const nextState = resolveActiveStreamTypeState({
    type,
    lastLiveStreamHint: card._lastLiveStreamHint,
  });
  card._activeStreamType = nextState.activeStreamType;
  card._lastLiveStreamHint = nextState.lastLiveStreamHint;
  card._renderStats?.();
};

export const resolveSnapshotFallbackState = ({
  refreshImage = false,
} = {}) => ({
  activeStreamType: "snapshot",
  loading: false,
  fallbackVisible: true,
  refreshFallbackImage: refreshImage === true,
});
