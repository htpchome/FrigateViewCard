import { ICONS } from "../../icons.js";
import { normalizePageRoute, PAGE_IDS } from "../navigation/router.js";
import { buildLiveMuteControlMarkup } from "./view.tmpl.js";

export class LiveAudioController {
  constructor(host, { icons = ICONS, setTimer = setTimeout } = {}) {
    this._host = host;
    this._icons = icons;
    this._setTimer = setTimer;
  }

  resolveMuted() {
    return this._host._streamMuted;
  }

  buildControlMarkup({ buttonClass = "square-btn" } = {}) {
    return buildLiveMuteControlMarkup({
      icons: this._icons,
      streamMuted: this.resolveMuted(),
      buttonClass,
    });
  }

  buildMobileInlineControlMarkup() {
    const host = this._host;
    if (normalizePageRoute(host._pageId) !== PAGE_IDS.mobileView) return "";
    const muted = this.resolveMuted();
    const talkAudioActive =
      host._twoWayTalkActiveForCurrentCamera() && !muted;
    return buildLiveMuteControlMarkup({
      icons: this._icons,
      streamMuted: muted,
      buttonClass: "icon-btn",
      buttonId: "mobile-view-mute-btn",
      region: "",
      extraClass: `mobile-view-inline-mute-btn${talkAudioActive ? " talk-audio-active" : ""}`,
      pressed: !muted,
    });
  }

  setMuted(muted) {
    const host = this._host;
    host._streamMuted = !!muted;
    host._twoWayTalkSession?.engine?.setIncomingAudioMuted?.(
      host._streamMuted,
    );
    const engine = host._engine;
    if (!engine) return;

    const applyToVideo = (video) => {
      if (!video) return false;
      if (typeof video.muted === "boolean") video.muted = host._streamMuted;
      if (typeof video.defaultMuted === "boolean") {
        video.defaultMuted = host._streamMuted;
      }
      if (!host._streamMuted) {
        if (typeof video.volume === "number") video.volume = 1;
        video.play?.().catch(() => {});
      }
      return true;
    };

    if (typeof engine.muted === "boolean") engine.muted = host._streamMuted;
    if (typeof engine.defaultMuted === "boolean") {
      engine.defaultMuted = host._streamMuted;
    }
    if (engine.video && typeof engine.video.muted === "boolean") {
      engine.video.muted = host._streamMuted;
    }
    if (engine.video && typeof engine.video.defaultMuted === "boolean") {
      engine.video.defaultMuted = host._streamMuted;
    }
    if (!host._streamMuted && engine.video) {
      if (typeof engine.video.volume === "number") engine.video.volume = 1;
      engine.video.play?.().catch(() => {});
    }

    let video =
      engine.tagName?.toLowerCase() === "video"
        ? engine
        : engine.querySelector?.("video") ||
          engine.shadowRoot?.querySelector?.("video");
    if (!video) video = host._findVideoDeep(engine);
    applyToVideo(video);

    // Legacy live players can attach or replace their nested video shortly
    // after their host is running, so synchronize the replacement as well.
    [120, 400, 900].forEach((delay) => {
      this._setTimer(() => {
        if (engine !== host._engine) return;
        applyToVideo(host._findVideoDeep(engine));
      }, delay);
    });
  }

  syncMuteButtons() {
    const host = this._host;
    const buttons = [
      host._$("#mute-btn"),
      host._$("#mobile-view-mute-btn"),
      host._$("#two-way-talk-mute-btn"),
    ].filter(Boolean);
    if (!buttons.length) return;
    const talkActive = host._twoWayTalkActiveForCurrentCamera();
    const muted = host._resolveLiveMuteControlMuted();
    const labelKey = talkActive
      ? muted
        ? "runtime.live.unmuteIncoming"
        : "runtime.live.muteIncoming"
      : muted
        ? "runtime.live.unmute"
        : "runtime.live.mute";
    const fallbackLabel = talkActive
      ? muted
        ? "Unmute incoming audio"
        : "Mute incoming audio"
      : muted
        ? "Unmute live view"
        : "Mute live view";
    const label = host._localization?.t?.(labelKey) || fallbackLabel;
    buttons.forEach((button) => {
      const inlineTalkMute = button.id === "two-way-talk-mute-btn";
      const hideMute =
        host._viewMode === "grid" || (inlineTalkMute && !talkActive);
      if (button.id === "mobile-view-mute-btn" || inlineTalkMute) {
        const audioEnabled = !muted;
        button.classList.toggle("active", audioEnabled);
        button.classList.toggle(
          "talk-audio-active",
          talkActive && audioEnabled,
        );
        button.setAttribute("aria-pressed", audioEnabled ? "true" : "false");
      }
      button.hidden = hideMute;
      button.style.display = hideMute ? "none" : "";
      if (hideMute) return;
      button.setAttribute("data-fvc-i18n-title", labelKey);
      button.setAttribute("data-fvc-i18n-aria-label", labelKey);
      button.title = label;
      button.setAttribute("aria-label", label);
      button.innerHTML = muted ? this._icons.volOff : this._icons.volOn;
    });
  }

  applyMuteChange(nextMuted, { source = "button" } = {}) {
    const host = this._host;
    host._setLiveMuted(nextMuted);
    host._cameraGroupLiveController?.syncAudio?.();
    host._renderMuteButton();

    // Only HA Direct needs a remount when its initially-muted player cannot
    // recover audio; card-managed Frigate/go2rtc must keep its active engine.
    const nativeOverlayUnmute =
      source === "native-controls" && host._rotateOverlayActive;
    const needsHaDirectRecovery =
      host._useHaDirectStreamPath() &&
      !host._twoWayTalkActiveForCurrentCamera() &&
      !nextMuted &&
      (!nativeOverlayUnmute || host._engineMountedMuted);
    if (needsHaDirectRecovery) {
      host._mountEngine(null, { quiet: true });
      return;
    }
    if (!nextMuted) host._engineMountedMuted = false;
  }

  toggleMute() {
    const host = this._host;
    host._applyLiveMuteChange(!host._resolveLiveMuteControlMuted(), {
      source: "button",
    });
  }
}

export function getLiveAudioController(host) {
  if (host._liveAudioController instanceof LiveAudioController) {
    return host._liveAudioController;
  }
  const controller = new LiveAudioController(host);
  host._liveAudioController = controller;
  return controller;
}
