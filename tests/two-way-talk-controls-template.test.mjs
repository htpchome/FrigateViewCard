import { test } from "node:test";
import assert from "node:assert/strict";

import {
  buildTwoWayTalkButtonMarkup,
  buildTwoWayTalkControlRowMarkup,
  buildTwoWayTalkMicrophoneMuteButtonMarkup,
  resolveMicrophoneButtonLabel,
  resolveTwoWayTalkButtonLabel,
} from "../src/features/two-way-talk/controls.tmpl.js";

const icons = {
  micOn: "<svg data-icon=\"mic-on\"></svg>",
  micOff: "<svg data-icon=\"mic-off\"></svg>",
};

test("two-way-talk labels describe pending, active, and muted states", () => {
  assert.equal(
    resolveTwoWayTalkButtonLabel({ connecting: true }).key,
    "runtime.twoWayTalk.cancelConnection",
  );
  assert.equal(
    resolveTwoWayTalkButtonLabel({
      connecting: false,
      active: true,
      microphoneMuted: true,
    }).key,
    "runtime.twoWayTalk.endMuted",
  );
  assert.equal(
    resolveMicrophoneButtonLabel(true).key,
    "runtime.twoWayTalk.unmuteMicrophone",
  );
});

test("two-way-talk button templates preserve state and localized labels", () => {
  const talkMarkup = buildTwoWayTalkButtonMarkup({
    icons,
    active: true,
    microphoneMuted: false,
    visible: true,
    translate: (key) =>
      key === "runtime.twoWayTalk.disable" ? 'Arrêter le "micro"' : key,
  });
  assert.match(talkMarkup, /info-row-mic-btn active round-btn/);
  assert.match(talkMarkup, /aria-pressed="true"/);
  assert.match(talkMarkup, /title="Arrêter le &quot;micro&quot;"/);
  assert.match(talkMarkup, /data-icon="mic-on"/);

  const microphoneMarkup = buildTwoWayTalkMicrophoneMuteButtonMarkup({
    icons,
    active: true,
    microphoneMuted: true,
  });
  assert.doesNotMatch(microphoneMarkup, /talk-audio-active/);
  assert.match(microphoneMarkup, /aria-pressed="false"/);
  assert.match(microphoneMarkup, /data-icon="mic-off"/);
});

test("two-way-talk control row composes soundwave and incoming audio markup", () => {
  const markup = buildTwoWayTalkControlRowMarkup({
    icons,
    active: true,
    visible: true,
    soundwaveEnabled: true,
    incomingAudioMuteMarkup: '<button id="incoming-audio"></button>',
  });

  assert.match(markup, /two-way-talk-control-row has-inline-mute has-soundwave/);
  assert.match(markup, /data-two-way-talk-soundwave/);
  assert.ok(
    markup.indexOf('id="two-way-talk-microphone-mute-btn"') <
      markup.indexOf('id="two-way-talk-btn"'),
  );
  assert.match(markup, /id="incoming-audio"/);
});
