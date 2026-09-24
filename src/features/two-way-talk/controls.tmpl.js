import { escapeHtmlAttribute } from "../../shared/html.js";
import { buildTwoWayTalkSoundwaveMarkup } from "./soundwave.ctrl.js";

const TWO_WAY_TALK_LABELS = Object.freeze({
  cancel: {
    key: "runtime.twoWayTalk.cancelConnection",
    fallback: "Cancel two-way talk connection",
  },
  endMuted: {
    key: "runtime.twoWayTalk.endMuted",
    fallback: "End two-way talk (microphone muted)",
  },
  disable: {
    key: "runtime.twoWayTalk.disable",
    fallback: "Disable two-way talk",
  },
  enable: {
    key: "runtime.twoWayTalk.enable",
    fallback: "Enable two-way talk",
  },
  muteMicrophone: {
    key: "runtime.twoWayTalk.muteMicrophone",
    fallback: "Mute microphone",
  },
  unmuteMicrophone: {
    key: "runtime.twoWayTalk.unmuteMicrophone",
    fallback: "Unmute microphone",
  },
});

export const resolveTwoWayTalkButtonLabel = ({
  connecting,
  active,
  microphoneMuted,
}) =>
  connecting
    ? TWO_WAY_TALK_LABELS.cancel
    : active
      ? microphoneMuted
        ? TWO_WAY_TALK_LABELS.endMuted
        : TWO_WAY_TALK_LABELS.disable
      : TWO_WAY_TALK_LABELS.enable;

export const resolveMicrophoneButtonLabel = (muted) =>
  muted
    ? TWO_WAY_TALK_LABELS.unmuteMicrophone
    : TWO_WAY_TALK_LABELS.muteMicrophone;

const resolveLocalizedLabel = ({ descriptor, translate }) =>
  escapeHtmlAttribute(translate?.(descriptor.key) || descriptor.fallback);

export function buildTwoWayTalkMicrophoneMuteButtonMarkup({
  icons = {},
  active = false,
  microphoneMuted = false,
  buttonId = "two-way-talk-microphone-mute-btn",
  extraClass = "",
  translate,
} = {}) {
  const { key, fallback } = resolveMicrophoneButtonLabel(microphoneMuted);
  const label = resolveLocalizedLabel({
    descriptor: { key, fallback },
    translate,
  });
  const microphoneActive = active && !microphoneMuted;
  const className = [
    "icon-btn",
    "mute-btn",
    "two-way-talk-microphone-mute-btn",
    extraClass,
    microphoneActive ? "talk-audio-active" : "",
    microphoneActive ? "active" : "",
  ]
    .filter(Boolean)
    .join(" ");
  return `<button class="${className}" id="${buttonId}" type="button" ${active ? "" : "hidden"} aria-pressed="${microphoneActive ? "true" : "false"}" title="${label}" aria-label="${label}" data-fvc-i18n-title="${key}" data-fvc-i18n-aria-label="${key}">${microphoneMuted ? icons.micOff || "" : icons.micOn || ""}</button>`;
}

export function buildTwoWayTalkButtonMarkup({
  icons = {},
  active = false,
  connecting = false,
  microphoneMuted = false,
  visible = false,
  translate,
} = {}) {
  const { key, fallback } = resolveTwoWayTalkButtonLabel({
    connecting,
    active,
    microphoneMuted,
  });
  const label = resolveLocalizedLabel({
    descriptor: { key, fallback },
    translate,
  });
  return `<button class="info-row-mic-btn${active ? " active" : ""}${connecting ? " connecting" : ""}${microphoneMuted ? " microphone-muted" : ""} round-btn" id="two-way-talk-btn" type="button" ${visible ? "" : "hidden"} aria-pressed="${active ? "true" : "false"}" aria-busy="${connecting ? "true" : "false"}" title="${label}" aria-label="${label}" data-fvc-i18n-title="${key}" data-fvc-i18n-aria-label="${key}">${active ? icons.micOn || "" : icons.micOff || ""}</button>`;
}

export function buildTwoWayTalkMobileSlotMarkup({
  visible = false,
  buttonMarkup = "",
} = {}) {
  return `<div class="mobile-view-two-way-talk-slot" id="mobile-view-two-way-talk-slot" data-fvc-region="two-way-talk" ${visible ? "" : "hidden"}>${buttonMarkup}</div>`;
}

export function buildTwoWayTalkControlRowMarkup({
  icons = {},
  active = false,
  connecting = false,
  microphoneMuted = false,
  visible = false,
  soundwaveEnabled = false,
  microphoneButtonId = "two-way-talk-microphone-mute-btn",
  microphoneExtraClass = "",
  incomingAudioMuteMarkup = "",
  translate,
} = {}) {
  const soundwaveActive = active && soundwaveEnabled;
  return `<div class="two-way-talk-control-row${active ? " has-inline-mute" : ""}${soundwaveActive ? " has-soundwave" : ""}">
      ${soundwaveEnabled ? buildTwoWayTalkSoundwaveMarkup({ active: soundwaveActive }) : ""}
      ${buildTwoWayTalkMicrophoneMuteButtonMarkup({
        icons,
        active,
        microphoneMuted,
        buttonId: microphoneButtonId,
        extraClass: microphoneExtraClass,
        translate,
      })}
      ${buildTwoWayTalkButtonMarkup({
        icons,
        active,
        connecting,
        microphoneMuted,
        visible,
        translate,
      })}
      ${incomingAudioMuteMarkup}
    </div>`;
}
