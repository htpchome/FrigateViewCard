import { setLocalizedText } from "../localization/localized-dom.js";
import {
  applyActiveStreamTypeForCard,
  applyStreamFallbackVisibilityForCard,
  applyStreamLoadingStateForCard,
} from "./stream.state.js";

export class LiveStreamStatusController {
  constructor(host) {
    this._host = host;
  }

  currentStreamHint() {
    const host = this._host;
    const active = String(host._activeStreamType || "")
      .trim()
      .toLowerCase();
    if (active === "webrtc" || active === "mse" || active === "hls") {
      return active;
    }
    const lastHint = String(host._lastLiveStreamHint || "")
      .trim()
      .toLowerCase();
    if (lastHint === "webrtc" || lastHint === "mse" || lastHint === "hls") {
      return lastHint;
    }
    return host._preferredStreamType();
  }

  setLoading(loading, text = "Loading…") {
    const host = this._host;
    const label = host._$("#stream-loading .label");
    const defaultLabel = text === "Loading…";
    if (defaultLabel) {
      setLocalizedText(label, "runtime.live.loading", host._localization.t);
    } else {
      label?.removeAttribute("data-fvc-i18n");
    }
    applyStreamLoadingStateForCard({
      card: host,
      loading,
      text: defaultLabel ? host._localization.t("runtime.live.loading") : text,
    });
  }

  setActiveType(type) {
    const host = this._host;
    if (host._gridPageController?.captureBackgroundLiveStreamType?.(type)) {
      return;
    }
    applyActiveStreamTypeForCard({
      card: host,
      type,
    });
    host._syncTwoWayTalkRuntimeState();
    host._syncTwoWayTalkButton();
    host._liveViewResizeController?.sync();
  }

  setFallbackVisible(visible, refreshImage = false) {
    const host = this._host;
    applyStreamFallbackVisibilityForCard({
      card: host,
      visible,
      refreshImage,
    });
    host._liveViewResizeController?.sync();
  }

  applyResolvedState(streamState) {
    if (!streamState) return;
    this.setLoading(streamState.loading);
    this.setFallbackVisible(
      streamState.fallbackVisible,
      streamState.refreshFallbackImage,
    );
    if (streamState.enableNativeControls) {
      this._host._setLiveNativeControls(true);
    }
  }
}

export function getLiveStreamStatusController(host) {
  if (host._liveStreamStatusController instanceof LiveStreamStatusController) {
    return host._liveStreamStatusController;
  }
  const controller = new LiveStreamStatusController(host);
  host._liveStreamStatusController = controller;
  return controller;
}
