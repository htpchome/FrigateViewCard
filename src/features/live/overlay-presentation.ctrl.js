import { CARD_VIEW_OVERLAY_TIMING } from "../../constants.js";
import { MediaOverlayControlsController } from "../../shared/media/overlay-controls.ctrl.js";

const CARD_VIEW_OVERLAYS_IDLE_CLASS = "card-view-overlays-idle";
const CARD_VIEW_OVERLAYS_TOUCH_IDLE_CLASS =
  "card-view-overlays-touch-idle";

export class LiveOverlayPresentationController {
  constructor(
    host,
    {
      createOverlayController = (options) =>
        new MediaOverlayControlsController(options),
      setTimer = (callback, delay) => globalThis.setTimeout(callback, delay),
      clearTimer = (timer) => globalThis.clearTimeout(timer),
    } = {},
  ) {
    this._host = host;
    this._createOverlayController = createOverlayController;
    this._setTimer = setTimer;
    this._clearTimer = clearTimer;
  }

  init() {
    const host = this._host;
    const wrap = host._$("#live-stage");
    if (!wrap) return;
    this._disposeOverlayController();
    if (!wrap.classList.contains("live-stage--overlay")) return;

    const card = host._$("#card");
    const overlayCardView =
      host._isCardViewPageActive() &&
      host._cardViewPageController?.usesOverlayPresentation?.() === true;
    const overlayMobileView =
      host._isMobileViewPageActive() &&
      host._config?.mobile_view_header_overlay === true;
    const interactionSurface = overlayCardView
      ? host._$(".card-view-live-panel") || wrap
      : overlayMobileView
        ? host._$("#mobile-top") || wrap
        : wrap;
    const show = (interaction = {}) => {
      if (interaction.pointerType) {
        host._lastLiveOverlayPointerType = interaction.pointerType;
      }
      wrap.classList.add("live-controls-visible");
      card?.classList?.add("card-view-overlays-visible");
      if (overlayCardView) this._clearCardViewIdleClasses(card);
    };
    const hideNow = () => {
      wrap.classList.remove("live-controls-visible");
      card?.classList?.remove("card-view-overlays-visible");
      this._clearScheduledHide();
    };
    const hideSoon = (ms = 1400, interaction = {}) => {
      this._clearScheduledHide();
      const touchInteraction = interaction.pointerType === "touch";
      host._liveControlsHideTimer = this._setTimer(() => {
        wrap.classList.remove("live-controls-visible");
        card?.classList?.remove("card-view-overlays-visible");
        if (overlayCardView) {
          this._applyCardViewIdleClasses(card, touchInteraction);
        }
        host._liveControlsHideTimer = null;
      }, ms);
    };
    const cancelScheduledHide = () => this._clearScheduledHide();

    host._liveOverlayControlsController = this._createOverlayController({
      surface: interactionSurface,
      wrap,
      show,
      hideNow,
      hideSoon,
      cancelScheduledHide,
      revealDurationMs: overlayCardView
        ? CARD_VIEW_OVERLAY_TIMING.mouse.controlsHideMs
        : 1300,
      touchRevealDurationMs: overlayCardView
        ? CARD_VIEW_OVERLAY_TIMING.touch.controlsHideMs
        : 2300,
      autoHideMouse: overlayCardView,
    });
    host._liveOverlayControlsController.bind();
  }

  showTemporarily(ms = 2200) {
    const host = this._host;
    const wrap = host._$("#live-stage.live-stage--overlay");
    if (!wrap) return;
    const card = host._$("#card");
    const overlayCardView =
      host._isCardViewPageActive() &&
      host._cardViewPageController?.usesOverlayPresentation?.() === true;
    const touchInteraction =
      overlayCardView && host._lastLiveOverlayPointerType === "touch";
    wrap.classList.add("live-controls-visible");
    card?.classList?.add("card-view-overlays-visible");
    if (overlayCardView) this._clearCardViewIdleClasses(card);
    this._clearScheduledHide();
    host._liveControlsHideTimer = this._setTimer(
      () => {
        const nextWrap = host._$("#live-stage.live-stage--overlay");
        nextWrap?.classList.remove("live-controls-visible");
        const nextCard = host._$("#card");
        nextCard?.classList?.remove("card-view-overlays-visible");
        if (
          host._isCardViewPageActive() &&
          host._cardViewPageController?.usesOverlayPresentation?.() === true
        ) {
          this._applyCardViewIdleClasses(nextCard, touchInteraction);
        }
        host._liveControlsHideTimer = null;
      },
      overlayCardView
        ? CARD_VIEW_OVERLAY_TIMING[
            touchInteraction ? "touch" : "mouse"
          ].controlsHideMs
        : Math.max(500, Number(ms) || 2200),
    );
  }

  dispose() {
    this._clearScheduledHide();
    this._disposeOverlayController();
  }

  _clearScheduledHide() {
    const host = this._host;
    if (host._liveControlsHideTimer == null) {
      host._liveControlsHideTimer = null;
      return;
    }
    this._clearTimer(host._liveControlsHideTimer);
    host._liveControlsHideTimer = null;
  }

  _disposeOverlayController() {
    const host = this._host;
    if (!host._liveOverlayControlsController) return;
    try {
      host._liveOverlayControlsController.dispose();
    } catch (_) {}
    host._liveOverlayControlsController = null;
  }

  _clearCardViewIdleClasses(card) {
    card?.classList?.remove(CARD_VIEW_OVERLAYS_IDLE_CLASS);
    card?.classList?.remove(CARD_VIEW_OVERLAYS_TOUCH_IDLE_CLASS);
  }

  _applyCardViewIdleClasses(card, touchInteraction) {
    card?.classList?.toggle(
      CARD_VIEW_OVERLAYS_IDLE_CLASS,
      !touchInteraction,
    );
    card?.classList?.toggle(
      CARD_VIEW_OVERLAYS_TOUCH_IDLE_CLASS,
      touchInteraction,
    );
  }
}

export function getLiveOverlayPresentationController(host) {
  if (
    host._liveOverlayPresentationController instanceof
    LiveOverlayPresentationController
  ) {
    return host._liveOverlayPresentationController;
  }
  const controller = new LiveOverlayPresentationController(host);
  host._liveOverlayPresentationController = controller;
  return controller;
}
