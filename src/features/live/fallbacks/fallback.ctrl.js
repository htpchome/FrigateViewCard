import {
  applyFallbackImageHandlers,
  setFallbackImageSourceIfChanged,
} from "./fallback-image.js";
import { runFallbackRefreshCycleForCard } from "./fallback-refresh.js";
import {
  loadFallbackAltForCard,
  loadFallbackPrimaryForCard,
} from "./fallback-url.js";

export class LiveFallbackController {
  constructor(
    host,
    {
      getOrigin = () =>
        globalThis.window?.location?.origin ||
        globalThis.location?.origin ||
        "",
    } = {},
  ) {
    this._host = host;
    this._getOrigin = getOrigin;
  }

  originForAdapters() {
    this._host._fallbackOrigin = this._getOrigin();
    return this._host._fallbackOrigin;
  }

  async loadPrimary(entity) {
    return await loadFallbackPrimaryForCard({
      card: this._host,
      entity,
      origin: this.originForAdapters(),
    });
  }

  loadAlternate(entity) {
    return loadFallbackAltForCard({
      card: this._host,
      entity,
      origin: this.originForAdapters(),
    });
  }

  async refreshImage() {
    const host = this._host;
    return await runFallbackRefreshCycleForCard({
      card: host,
      applyHandlers: (payload) =>
        applyFallbackImageHandlers({
          ...payload,
          t: host._localization.t,
        }),
      applySource: setFallbackImageSourceIfChanged,
    });
  }
}

export function getLiveFallbackController(host) {
  if (host._liveFallbackController instanceof LiveFallbackController) {
    return host._liveFallbackController;
  }
  const controller = new LiveFallbackController(host);
  host._liveFallbackController = controller;
  return controller;
}
