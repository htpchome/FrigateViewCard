import { hideFallbackStatus } from "./live-fallback-status.js";

export const isLiveTransportType = (type) => {
  const active = String(type || "")
    .trim()
    .toLowerCase();
  return active === "webrtc" || active === "mse" || active === "hls";
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
