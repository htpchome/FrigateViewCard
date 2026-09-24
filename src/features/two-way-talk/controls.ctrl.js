import { DEVICE_PROFILE } from "../../helpers.js";
import { ICONS } from "../../icons.js";
import { buildLiveMuteControlMarkup } from "../live/view.tmpl.js";
import { normalizePageRoute, PAGE_IDS } from "../navigation/router.js";
import {
  buildTwoWayTalkButtonMarkup,
  buildTwoWayTalkControlRowMarkup,
  buildTwoWayTalkMicrophoneMuteButtonMarkup,
  buildTwoWayTalkMobileSlotMarkup,
  resolveMicrophoneButtonLabel,
  resolveTwoWayTalkButtonLabel,
} from "./controls.tmpl.js";

export class TwoWayTalkControlsController {
  constructor(
    host,
    { icons = ICONS, deviceProfile = DEVICE_PROFILE } = {},
  ) {
    this._host = host;
    this._icons = icons;
    this._deviceProfile = deviceProfile;
  }

  shouldRenderSoundwave() {
    const host = this._host;
    return (
      (host._isCardViewPageActive?.() === true &&
        host._cardViewPageController?.usesOverlayPresentation?.() === true) ||
      (this._deviceProfile.isDesktop === true &&
        !host._isMobileTabletViewport())
    );
  }

  buildInfoButtonMarkup() {
    const host = this._host;
    const pageId = normalizePageRoute(host._pageId);
    if (pageId !== PAGE_IDS.singleView && pageId !== PAGE_IDS.wideView) {
      return "";
    }
    return host._buildTwoWayTalkControlRowMarkup();
  }

  buildMobileButtonMarkup() {
    const host = this._host;
    if (normalizePageRoute(host._pageId) !== PAGE_IDS.mobileView) {
      return "";
    }
    const visible = host._shouldRenderTwoWayTalkButtonForActiveCamera();
    return buildTwoWayTalkMobileSlotMarkup({
      visible,
      buttonMarkup: host._buildTwoWayTalkButtonMarkup(),
    });
  }

  buildMobileMicrophoneMuteButtonMarkup() {
    const host = this._host;
    if (normalizePageRoute(host._pageId) !== PAGE_IDS.mobileView) return "";
    return host._buildTwoWayTalkMicrophoneMuteButtonMarkup({
      buttonId: "mobile-view-microphone-mute-btn",
      extraClass: "mobile-view-microphone-mute-btn",
    });
  }

  buildControlRowMarkup({ includeIncomingAudioMute = true } = {}) {
    const host = this._host;
    const active = host._twoWayTalkActiveForCurrentCamera();
    const connecting = host._twoWayTalkStarting === true && !active;
    const microphoneMuted =
      host._twoWayTalkMicrophoneMutedForCurrentCamera();
    const muted = host._resolveLiveMuteControlMuted();
    const soundwaveEnabled =
      host._shouldRenderTwoWayTalkSoundwave?.() === true;
    const incomingAudioMuteMarkup = includeIncomingAudioMute
      ? buildLiveMuteControlMarkup({
          icons: this._icons,
          streamMuted: muted,
          buttonClass: "icon-btn",
          buttonId: "two-way-talk-mute-btn",
          region: "",
          extraClass: `two-way-talk-inline-mute-btn${active && !muted ? " talk-audio-active" : ""}`,
          pressed: !muted,
          hidden: !active,
        })
      : "";
    return buildTwoWayTalkControlRowMarkup({
      icons: this._icons,
      active,
      connecting,
      microphoneMuted,
      visible: host._shouldRenderTwoWayTalkButtonForActiveCamera(),
      soundwaveEnabled,
      incomingAudioMuteMarkup,
      translate: host._localization?.t,
    });
  }

  buildMicrophoneMuteButtonMarkup({
    buttonId = "two-way-talk-microphone-mute-btn",
    extraClass = "",
  } = {}) {
    const host = this._host;
    return buildTwoWayTalkMicrophoneMuteButtonMarkup({
      icons: this._icons,
      active: host._twoWayTalkActiveForCurrentCamera(),
      microphoneMuted: host._twoWayTalkMicrophoneMutedForCurrentCamera(),
      buttonId,
      extraClass,
      translate: host._localization?.t,
    });
  }

  buildButtonMarkup() {
    const host = this._host;
    const active = host._twoWayTalkActiveForCurrentCamera();
    return buildTwoWayTalkButtonMarkup({
      icons: this._icons,
      connecting: host._twoWayTalkStarting === true && !active,
      active,
      microphoneMuted: host._twoWayTalkMicrophoneMutedForCurrentCamera(),
      visible: host._shouldRenderTwoWayTalkButtonForActiveCamera(),
      translate: host._localization?.t,
    });
  }

  syncSoundwaveSurface() {
    const host = this._host;
    const active =
      host._twoWayTalkActiveForCurrentCamera() &&
      host._shouldRenderTwoWayTalkSoundwave();
    host.shadowRoot
      ?.querySelectorAll?.(".two-way-talk-control-row")
      ?.forEach((row) => row.classList.toggle("has-soundwave", active));
    host.shadowRoot
      ?.querySelectorAll?.("[data-two-way-talk-soundwave]")
      ?.forEach((surface) => {
        surface.hidden = !active;
      });
    host._twoWayTalkSoundwaveController?.syncCanvas();
  }

  syncActionSlot() {
    const host = this._host;
    const infoRow = host._pageShellRegion("information");
    if (!infoRow) return;

    const existingSlot = host._pageShellRegionElement(
      "information",
      `[data-fvc-region="two-way-talk"]`,
    );
    if (!existingSlot) return;

    const actionMarkup = host._buildTwoWayTalkInfoButtonMarkup();
    if (!actionMarkup) {
      existingSlot.innerHTML = "";
      existingSlot.hidden = true;
      return;
    }

    existingSlot.hidden = false;
    if (!existingSlot.querySelector("#two-way-talk-btn")) {
      existingSlot.innerHTML = actionMarkup;
    }
  }

  syncMobileViewSlot() {
    const host = this._host;
    if (!host._isMobileViewPageActive()) return;
    const slot = host._pageShellRegion("twoWayTalk");
    if (!slot) return;
    slot.hidden = !host._shouldRenderTwoWayTalkButtonForActiveCamera();
  }

  syncButton() {
    const host = this._host;
    host._syncTwoWayTalkActionSlot();
    host._syncMobileViewTwoWayTalkSlot();
    const button = host._pageShellRegionElement(
      "twoWayTalk",
      "#two-way-talk-btn",
    );
    const visible = host._shouldRenderTwoWayTalkButtonForActiveCamera();
    const active = host._twoWayTalkActiveForCurrentCamera();
    const connecting = host._twoWayTalkStarting === true && !active;
    host._$("#card")?.classList?.toggle?.(
      "two-way-talk-active",
      active || connecting,
    );
    if (active) host._dismissLinkedLightDimmers();
    const microphoneMuted =
      host._twoWayTalkMicrophoneMutedForCurrentCamera();
    const { key, fallback } = resolveTwoWayTalkButtonLabel({
      connecting,
      active,
      microphoneMuted,
    });
    const label = host._localization?.t?.(key) || fallback;
    host.shadowRoot
      ?.querySelectorAll?.(".two-way-talk-control-row")
      ?.forEach((row) => row.classList.toggle("has-inline-mute", active));
    if (button) {
      button.hidden = !visible;
      button.disabled = !visible;
      button.classList.toggle("active", active);
      button.classList.toggle("connecting", connecting);
      button.classList.toggle("microphone-muted", microphoneMuted);
      button.setAttribute("aria-pressed", active ? "true" : "false");
      button.setAttribute("aria-busy", connecting ? "true" : "false");
      button.setAttribute("data-fvc-i18n-title", key);
      button.setAttribute("data-fvc-i18n-aria-label", key);
      button.setAttribute("title", label);
      button.setAttribute("aria-label", label);
      button.innerHTML = active ? this._icons.micOn : this._icons.micOff;
    }
    host.shadowRoot
      ?.querySelectorAll?.(".two-way-talk-microphone-mute-btn")
      ?.forEach((microphoneMuteButton) => {
        const microphoneState =
          resolveMicrophoneButtonLabel(microphoneMuted);
        const microphoneLabel =
          host._localization?.t?.(microphoneState.key) ||
          microphoneState.fallback;
        microphoneMuteButton.hidden = !active;
        microphoneMuteButton.style.display = active ? "" : "none";
        microphoneMuteButton.classList.toggle("active", !microphoneMuted);
        microphoneMuteButton.classList.toggle(
          "talk-audio-active",
          !microphoneMuted,
        );
        microphoneMuteButton.setAttribute(
          "aria-pressed",
          microphoneMuted ? "false" : "true",
        );
        microphoneMuteButton.setAttribute(
          "data-fvc-i18n-title",
          microphoneState.key,
        );
        microphoneMuteButton.setAttribute(
          "data-fvc-i18n-aria-label",
          microphoneState.key,
        );
        microphoneMuteButton.setAttribute("title", microphoneLabel);
        microphoneMuteButton.setAttribute("aria-label", microphoneLabel);
        microphoneMuteButton.innerHTML = microphoneMuted
          ? this._icons.micOff
          : this._icons.micOn;
      });
    host._syncTwoWayTalkSoundwaveSurface?.();
    host._renderMuteButton();
    host._syncToolbarButtons?.();
  }
}

export function getTwoWayTalkControlsController(host) {
  if (host._twoWayTalkControlsController instanceof TwoWayTalkControlsController) {
    return host._twoWayTalkControlsController;
  }
  const controller = new TwoWayTalkControlsController(host);
  host._twoWayTalkControlsController = controller;
  return controller;
}
