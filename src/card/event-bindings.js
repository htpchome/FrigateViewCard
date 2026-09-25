import { CARD_TAG } from "../constants.js";

export const bindCardShadowEvents = (card) => {
  const shadowRoot = card.shadowRoot;

  card._onShadowClick = (event) => card._click(event);
  shadowRoot.addEventListener("click", card._onShadowClick);

  card._onShadowError = (event) => {
    const img = event.target;
    if (!(img instanceof HTMLImageElement)) return;
    const id = img.dataset.thumbId;
    if (!id) return;
    img.style.display = "none";
    const placeholder = img.nextElementSibling;
    if (placeholder) placeholder.style.display = "flex";
  };
  shadowRoot.addEventListener("error", card._onShadowError, true);

  card._onCirclePadPress = (event) => {
    void card._handleCirclePadPtzEvent(event, "press");
  };
  card._onCirclePadRelease = (event) => {
    void card._handleCirclePadPtzEvent(event, "release");
  };
  card._onPtzControlPointerDown = (event) => {
    const pointerType = String(event?.pointerType || "").toLowerCase();
    if (pointerType) {
      card._lastLiveOverlayPointerType =
        pointerType === "mouse" ? "mouse" : "touch";
    }
    card._mobileCamSwitcherController?.handlePointerDown?.(
      event,
      event.target,
    );
    if (card._linkedLightController?.handlePointerDown?.(event)) return;
    void card._handlePtzControlPointerDown(event);
  };
  card._onPtzControlPointerStop = (event) => {
    if (event.type === "pointerup") {
      if (
        card._mobileCamSwitcherController?.handlePointerUp?.(
          event,
          event.target,
        )
      ) {
        return;
      }
    } else {
      card._mobileCamSwitcherController?.cancelPointer?.();
    }
    card._linkedLightController?.handlePointerStop?.(event);
    void card._handlePtzControlPointerStop(event);
  };

  shadowRoot.addEventListener("circle-pad-press", card._onCirclePadPress);
  shadowRoot.addEventListener("circle-pad-release", card._onCirclePadRelease);
  shadowRoot.addEventListener("pointerdown", card._onPtzControlPointerDown);
  shadowRoot.addEventListener("pointerup", card._onPtzControlPointerStop);
  shadowRoot.addEventListener("pointercancel", card._onPtzControlPointerStop);
  shadowRoot.addEventListener(
    "lostpointercapture",
    card._onPtzControlPointerStop,
  );
};

export const bindCardGlobalEvents = (
  card,
  {
    documentTarget = document,
    windowTarget = window,
  } = {},
) => {
  card._onDocVisibility = () => {
    if (documentTarget.visibilityState === "visible") {
      card._scheduleResumeLive("doc-visible");
      card._wideViewPageController?.resumeCompanionMedia?.();
      return;
    }
    card._popupPlaybackTargetController?.release("popup");
    void card._stopPtzMotion("document-hidden");
  };
  documentTarget.addEventListener(
    "visibilitychange",
    card._onDocVisibility,
  );

  card._onWindowBlur = () => {
    void card._stopPtzMotion("window-blur");
  };
  card._onPageHide = () => {
    void card._stopPtzMotion("page-hide");
    card._popupPlaybackTargetController?.release("popup");
  };
  card._onWindowPtzPointerStop = (event) => {
    void card._handlePtzControlPointerStop(event);
  };
  windowTarget.addEventListener("blur", card._onWindowBlur);
  windowTarget.addEventListener("pagehide", card._onPageHide);
  windowTarget.addEventListener(
    "pointerup",
    card._onWindowPtzPointerStop,
    true,
  );
  windowTarget.addEventListener(
    "pointercancel",
    card._onWindowPtzPointerStop,
    true,
  );

  card._onFullscreenChange = () => {
    card._liveFullscreenLifecycleController?.handleDocumentFullscreenChange(
      documentTarget.fullscreenElement ||
        documentTarget.webkitFullscreenElement ||
        null,
    );
    card._syncFullscreenButtonsVisibility();
    card._liveViewResizeController?.sync();
  };
  documentTarget.addEventListener(
    "fullscreenchange",
    card._onFullscreenChange,
  );
  documentTarget.addEventListener(
    "webkitfullscreenchange",
    card._onFullscreenChange,
  );

  card._onViewportChange = () => {
    const visualViewport = windowTarget.visualViewport;
    const viewportWidth = Math.round(
      visualViewport?.width || windowTarget.innerWidth || 0,
    );
    const viewportHeight = Math.round(
      visualViewport?.height || windowTarget.innerHeight || 0,
    );
    const viewportSizeChanged =
      viewportWidth !== card._lastViewportWidth ||
      viewportHeight !== card._lastViewportHeight;

    if (viewportSizeChanged) {
      card._lastViewportWidth = viewportWidth;
      card._lastViewportHeight = viewportHeight;
      card._syncBrowseHeadModeClass();
      card._applyCardStyle();
    }

    card._scheduleRotateOverlayUpdate();
    card._liveViewResizeController?.sync();
  };
  windowTarget.addEventListener("resize", card._onViewportChange, {
    passive: true,
  });
  card._onOrientationChange = () => {
    card._onViewportChange();
  };
  windowTarget.addEventListener(
    "orientationchange",
    card._onOrientationChange,
  );
  windowTarget.visualViewport?.addEventListener(
    "resize",
    card._onViewportChange,
    { passive: true },
  );
  windowTarget.visualViewport?.addEventListener(
    "scroll",
    card._onViewportChange,
    { passive: true },
  );

  card._onEditorPreviewDraft = (event) => {
    if (event?.detail?.cardTag !== CARD_TAG) return;
    card._applyEditorPreviewDraft(
      event.detail?.config || null,
      event.detail?.routeIntent || null,
    );
  };
  windowTarget.addEventListener(
    "frigate-view-card-preview-draft",
    card._onEditorPreviewDraft,
  );

  card._onDocumentPointerDown = (event) => {
    card._linkedLightController?.handleDocumentPointerDown?.(event);
    if (!card._mobileCamSwitcherOpen) return;
    const path =
      typeof event?.composedPath === "function" ? event.composedPath() : [];
    if (Array.isArray(path) && path.includes(card)) return;
    card._mobileCamSwitcherController?.close();
  };
  documentTarget.addEventListener(
    "pointerdown",
    card._onDocumentPointerDown,
    { capture: true, passive: true },
  );
};
