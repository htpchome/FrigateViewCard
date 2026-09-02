import { buildHaCameraStreamState } from "../../integrations/home-assistant/playback.js";
import {
  resolveDisplayedFrameDimensions,
  resolveDisplayedFrameGeometry,
} from "../../shared/media/frame-capture.js";
import { attachVideoZoom } from "../../shared/media/video-zoom.ctrl.js";
import {
  CAMERA_GROUP_LAYOUTS,
  cameraGroupSecondaryEntity,
  isCameraGroup,
  normalizeCameraGroupLayout,
} from "./model.js";

const GROUP_CLASS_NAMES = [
  "camera-group-live",
  "camera-group-live--side-by-side",
  "camera-group-live--stacked",
  "camera-group-live--focus-a",
  "camera-group-live--focus-b",
  "camera-group-mobile-member",
];

export class CameraGroupLiveController {
  constructor(host, { icons = {} } = {}) {
    this._host = host;
    this._icons = icons;
    this._mediaState = null;
    this._signature = "";
    this._secondaryZoom = null;
    this._activeAudioMember = "A";
    this._focusedMember = "";
  }

  get activeAudioMember() {
    return this._activeAudioMember;
  }

  get focusedMember() {
    return this._focusedMember;
  }

  isActive() {
    const camera = this._host._activeCam;
    return (
      isCameraGroup(camera) &&
      this._host._viewMode === "single" &&
      this._host._isPreviewPageActive?.() !== true &&
      this._host._isLikelyPhoneClient?.() !== true &&
      this._host._isMobilePhoneViewport?.() !== true &&
      !this._host._activeGroupMemberOverride
    );
  }

  isMobileMemberMode() {
    return (
      isCameraGroup(this._host._activeCam) &&
      this._host._viewMode === "single" &&
      this._host._isPreviewPageActive?.() !== true &&
      (this._host._isLikelyPhoneClient?.() === true ||
        this._host._isMobilePhoneViewport?.() === true)
    );
  }

  secondaryEntity() {
    return cameraGroupSecondaryEntity(this._host._activeCam);
  }

  activeVideo() {
    if (this.isActive() && this._activeAudioMember === "B") {
      return (
        this._secondaryZoom?.video ||
        this._host._findVideoDeep?.(
          this._host._$("#camera-group-secondary-engine"),
        ) || null
      );
    }
    return (
      this._host._engine?.video ||
      this._host._findVideoDeep?.(this._host._engine) ||
      this._host._liveVideoZoomController?.video ||
      this._host._findVideoDeep?.(this._host._$("#engine")) ||
      null
    );
  }

  async captureDisplayedFrame({
    documentObj = globalThis.document,
    styleResolver = (element) => globalThis.getComputedStyle?.(element),
    mimeType = "image/jpeg",
    quality = 0.92,
  } = {}) {
    if (!this.isActive()) return null;
    const wrap = this._host._$("#eng-wrap");
    const wrapRect = wrap?.getBoundingClientRect?.();
    const wrapWidth = Number(wrapRect?.width) || 0;
    const wrapHeight = Number(wrapRect?.height) || 0;
    if (!wrapWidth || !wrapHeight) {
      throw new Error("The grouped live view is not ready.");
    }

    const paneSpecs = [
      {
        member: "A",
        engine: this._host._$("#engine"),
        zoom: this._host._liveVideoZoomController,
      },
      {
        member: "B",
        engine: this._host._$("#camera-group-secondary-engine"),
        zoom: this._secondaryZoom,
      },
    ]
      .filter(
        ({ member }) => !this._focusedMember || member === this._focusedMember,
      )
      .map(({ member, engine, zoom }) => {
        const pane = this._host._$(
          `.camera-group-live-pane[data-camera-group-member="${member}"]`,
        );
        const paneRect = pane?.getBoundingClientRect?.();
        const video =
          this._host._findVideoDeep?.(engine) || engine?.video || null;
        const source = resolveDisplayedFrameDimensions(video);
        const viewportWidth = Number(paneRect?.width) || 0;
        const viewportHeight = Number(paneRect?.height) || 0;
        const computedStyle = video ? styleResolver?.(video) : null;
        const zoomState = zoom?.video === video ? zoom.state : null;
        const geometry = resolveDisplayedFrameGeometry({
          sourceWidth: source.width,
          sourceHeight: source.height,
          viewportWidth,
          viewportHeight,
          objectFit:
            computedStyle?.objectFit || video?.style?.objectFit || "contain",
          zoomState,
        });
        if (!video || !paneRect || !geometry) {
          throw new Error("The displayed grouped camera frame is not ready.");
        }
        return { video, paneRect, geometry };
      });

    const sourceScale = paneSpecs.reduce((largest, spec) => {
      const { sourceRect, destinationRect } = spec.geometry;
      const scale = Math.max(
        sourceRect.width / Math.max(1, destinationRect.width),
        sourceRect.height / Math.max(1, destinationRect.height),
      );
      return Math.max(largest, scale);
    }, 1);
    const dimensionLimit = Math.min(4096 / wrapWidth, 4096 / wrapHeight);
    const outputScale = Math.max(
      0.01,
      Math.min(4, sourceScale, dimensionLimit),
    );
    const canvas = documentObj?.createElement?.("canvas");
    const context = canvas?.getContext?.("2d");
    if (!canvas || !context) {
      throw new Error("Snapshot capture is not supported in this browser.");
    }
    canvas.width = Math.max(1, Math.round(wrapWidth * outputScale));
    canvas.height = Math.max(1, Math.round(wrapHeight * outputScale));
    context.fillStyle = styleResolver?.(wrap)?.backgroundColor || "#111111";
    context.fillRect?.(0, 0, canvas.width, canvas.height);

    for (const { video, paneRect, geometry } of paneSpecs) {
      const { sourceRect, destinationRect } = geometry;
      const destinationX =
        paneRect.left - wrapRect.left + destinationRect.x;
      const destinationY = paneRect.top - wrapRect.top + destinationRect.y;
      context.drawImage(
        video,
        sourceRect.x,
        sourceRect.y,
        sourceRect.width,
        sourceRect.height,
        destinationX * outputScale,
        destinationY * outputScale,
        destinationRect.width * outputScale,
        destinationRect.height * outputScale,
      );
    }

    return await new Promise((resolve, reject) => {
      if (typeof canvas.toBlob !== "function") {
        reject(new Error("Snapshot encoding is not supported in this browser."));
        return;
      }
      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else reject(new Error("The grouped frame could not be encoded."));
        },
        mimeType,
        quality,
      );
    });
  }

  setActiveAudioMember(member) {
    const next = member === "B" && this.isActive() ? "B" : "A";
    if (next === this._activeAudioMember) {
      this.syncAudio();
      return;
    }
    this._activeAudioMember = next;
    this.syncAudio();
    this._host._syncPictureInPictureButtons?.();
  }

  toggleFocusedMember(member) {
    if (!this.isActive()) return false;
    const normalizedMember = member === "B" ? "B" : "A";
    this._focusedMember =
      this._focusedMember === normalizedMember ? "" : normalizedMember;
    if (this._focusedMember) {
      this.setActiveAudioMember(normalizedMember);
    }
    this._syncFocusedMember();
    this._refreshZoomGeometry();
    return true;
  }

  toggleMobileMember() {
    if (!this.isMobileMemberMode()) return false;
    const secondaryEntity = this.secondaryEntity();
    if (!secondaryEntity) return false;
    const showingSecondary =
      this._host._activeGroupMemberOverride === secondaryEntity;
    void this._host._switchCamera?.(this._host._activeCamIdx, {
      source: "manual",
      groupMemberEntity: showingSecondary ? "" : secondaryEntity,
    });
    return true;
  }

  syncAudio() {
    const active = this.isActive() ? this._activeAudioMember : "A";
    const muted = this._host._streamMuted === true;
    const primaryPane = this._host._$(
      '.camera-group-live-pane[data-camera-group-member="A"]',
    );
    const secondaryPane = this._host._$(
      '.camera-group-live-pane[data-camera-group-member="B"]',
    );
    const primaryVideo =
      this._host._findVideoDeep?.(this._host._$("#engine")) || null;
    const secondaryVideo =
      this._host._findVideoDeep?.(
        this._host._$("#camera-group-secondary-engine"),
      ) || null;
    this._applyVideoMuted(primaryVideo, muted || active !== "A");
    this._applyVideoMuted(secondaryVideo, muted || active !== "B");
    [
      [primaryPane, "A"],
      [secondaryPane, "B"],
    ].forEach(([pane, member]) => {
      pane?.classList?.toggle("is-audio-active", active === member);
      const button = pane?.querySelector?.("[data-camera-group-audio]");
      if (!button) return;
      const selected = active === member;
      button.setAttribute("aria-pressed", selected ? "true" : "false");
      const svg = selected ? this._icons.volOn : this._icons.volOff;
      const label = button.querySelector("span")?.textContent || member;
      if (svg) button.innerHTML = `${svg}<span>${label}</span>`;
    });
  }

  syncAlertState() {
    const entities = [
      this._host._activeCam?.entity || "",
      this.secondaryEntity(),
    ];
    entities.forEach((entity, index) => {
      const pane = this._host._$(
        `.camera-group-live-pane[data-camera-group-member="${index === 0 ? "A" : "B"}"]`,
      );
      if (!pane) return;
      pane.classList.remove("grid-alert", "grid-detection");
      const severities = [
        this._host._gridCellSeverity?.(entity) || "",
        this._host._previewAlertController?.previewCellSeverity?.(entity) || "",
        this._host._wideViewCompanionController?.cellSeverity?.(entity) || "",
      ];
      const severity = severities.includes("alert")
        ? "alert"
        : severities.includes("detection")
          ? "detection"
          : "";
      if (severity === "alert") pane.classList.add("grid-alert");
      if (severity === "detection") pane.classList.add("grid-detection");
    });
  }

  sync({ force = false } = {}) {
    const wrap = this._host._$("#eng-wrap");
    const secondaryPane = this._host._$(
      '.camera-group-live-pane[data-camera-group-member="B"]',
    );
    if (!wrap || !secondaryPane) return;
    if (!this.isActive()) {
      const mobileMemberMode = this.isMobileMemberMode();
      this.teardown();
      wrap.classList.remove(...GROUP_CLASS_NAMES);
      if (mobileMemberMode) wrap.classList.add("camera-group-mobile-member");
      secondaryPane.hidden = true;
      this._activeAudioMember = "A";
      this._syncMobileMemberButton();
      this.syncAudio();
      return;
    }

    const secondaryEntity = this.secondaryEntity();
    const layout = normalizeCameraGroupLayout(
      this._host._activeCam?.group?.layout,
    );
    wrap.classList.remove(...GROUP_CLASS_NAMES);
    wrap.classList.add(
      "camera-group-live",
      layout === CAMERA_GROUP_LAYOUTS.stacked
        ? "camera-group-live--stacked"
        : "camera-group-live--side-by-side",
    );
    secondaryPane.hidden = false;
    this.syncAlertState();
    const signature = [
      this._host._activeCam?.entity || "",
      secondaryEntity,
      layout,
      this._host._cameraConnectionType?.(secondaryEntity) || "",
      this._host._currentLiveStreamHint?.() || "",
    ].join("|");
    if (this._signature && this._signature !== signature) {
      this._activeAudioMember = "A";
    }
    if (!force && signature === this._signature && this._mediaState) {
      this._syncFocusedMember();
      this.syncAudio();
      return;
    }
    this._syncFocusedMember();
    this._mountSecondary(secondaryEntity, signature);
  }

  teardown({ resetFocus = true } = {}) {
    this._secondaryZoom?.dispose?.();
    this._secondaryZoom = null;
    if (this._mediaState) {
      this._mediaState.destroyed = true;
      for (const cleanup of this._mediaState.cleanup || []) {
        try {
          cleanup();
        } catch (_) {}
      }
    }
    this._mediaState = null;
    this._signature = "";
    if (resetFocus) this._focusedMember = "";
    const target = this._host._$("#camera-group-secondary-engine");
    if (target) target.innerHTML = "";
    this._host
      ._$('.camera-group-live-pane[data-camera-group-member="B"]')
      ?.classList?.remove("is-ready", "grid-alert", "grid-detection");
    this._syncFocusedMember();
  }

  _mountSecondary(entity, signature) {
    this.teardown({ resetFocus: false });
    if (!entity || !this.isActive()) return;
    const target = this._host._$("#camera-group-secondary-engine");
    const pane = this._host._$(
      '.camera-group-live-pane[data-camera-group-member="B"]',
    );
    if (!target || !pane) return;
    pane.classList.remove("is-ready");
    const stateObj =
      buildHaCameraStreamState(
        this._host._hass,
        entity,
        this._host._currentLiveStreamHint?.(),
        this._host._preferredStreamType?.(),
      ) || this._host._hass?.states?.[entity] || null;
    const mediaState = { destroyed: false, cleanup: [] };
    this._mediaState = mediaState;
    this._signature = signature;
    this._host._gridMediaController?.mountCameraCellMedia?.(target, {
      entity,
      stateObj,
      useLive: true,
      liveStreamHint: this._host._currentLiveStreamHint?.(),
      gridState: mediaState,
      fallbackOnLiveError: true,
      snapshotPlaceholderWhileLive: true,
      onLiveReady: (engine) => {
        if (mediaState.destroyed || this._mediaState !== mediaState) return;
        pane.classList.add("is-ready");
        this._attachSecondaryZoom(engine, mediaState);
        this.syncAudio();
      },
    });
  }

  _attachSecondaryZoom(engine, mediaState, retries = 12) {
    if (
      !engine ||
      !mediaState ||
      mediaState.destroyed ||
      this._mediaState !== mediaState
    ) {
      return;
    }
    const target = this._host._$("#camera-group-secondary-engine");
    const video =
      engine?.video ||
      this._host._findVideoDeep?.(engine) ||
      this._host._findVideoDeep?.(target) ||
      null;
    if (video) {
      this._secondaryZoom?.dispose?.();
      this._secondaryZoom = attachVideoZoom(video);
      this._mediaState.cleanup.push(() => {
        this._secondaryZoom?.dispose?.();
        this._secondaryZoom = null;
      });
      return;
    }
    if (retries <= 0) return;
    const retry = setTimeout(
      () => this._attachSecondaryZoom(engine, mediaState, retries - 1),
      160,
    );
    mediaState.cleanup.push(() => clearTimeout(retry));
  }

  _applyVideoMuted(video, muted) {
    if (!video) return;
    video.muted = muted;
    video.defaultMuted = muted;
    if (!muted) {
      video.volume = 1;
      video.play?.()?.catch?.(() => {});
    }
  }

  _syncFocusedMember() {
    const wrap = this._host._$("#eng-wrap");
    if (!wrap) return;
    wrap.classList.toggle(
      "camera-group-live--focus-a",
      this._focusedMember === "A",
    );
    wrap.classList.toggle(
      "camera-group-live--focus-b",
      this._focusedMember === "B",
    );
    for (const member of ["A", "B"]) {
      const pane = this._host._$(
        `.camera-group-live-pane[data-camera-group-member="${member}"]`,
      );
      const focused = this._focusedMember === member;
      const obscured = Boolean(this._focusedMember) && !focused;
      pane?.setAttribute?.("aria-hidden", obscured ? "true" : "false");
      const button = pane?.querySelector?.("[data-camera-group-focus]");
      if (!button) continue;
      const label = member === "B" ? "second camera" : "main camera";
      const title = focused ? "Show both cameras" : `Focus ${label}`;
      button.setAttribute("aria-pressed", focused ? "true" : "false");
      button.setAttribute("aria-label", title);
      button.setAttribute("title", title);
      button.innerHTML = focused
        ? this._icons.cameraGroupSplit || this._icons.grid || ""
        : this._icons.singleView || "";
    }
  }

  _syncMobileMemberButton() {
    const pane = this._host._$(
      '.camera-group-live-pane[data-camera-group-member="A"]',
    );
    const button = pane?.querySelector?.("[data-camera-group-mobile-toggle]");
    if (!button) return;
    const showingSecondary =
      this._host._activeGroupMemberOverride === this.secondaryEntity();
    const targetMember = showingSecondary ? "A" : "B";
    const title = `Show camera ${targetMember}`;
    button.setAttribute("aria-pressed", showingSecondary ? "true" : "false");
    button.setAttribute("aria-label", title);
    button.setAttribute("title", title);
    button.innerHTML = `${this._icons.singleView || ""}<span>${targetMember}</span>`;
  }

  _refreshZoomGeometry() {
    const refresh = () => {
      this._host._liveVideoZoomController?.refresh?.();
      this._secondaryZoom?.refresh?.();
    };
    const frame = globalThis.requestAnimationFrame?.(refresh);
    if (!frame) queueMicrotask(refresh);
  }
}
