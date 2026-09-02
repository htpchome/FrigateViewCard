import { test } from "node:test";
import assert from "node:assert/strict";

import {
  startGo2RtcTwoWayTalkSession,
  startHaDirectTwoWayTalkSession,
} from "../src/features/two-way-talk/session.js";

async function withFakeMicrophone(run) {
  const previousNavigator = Object.getOwnPropertyDescriptor(
    globalThis,
    "navigator",
  );
  const requests = [];
  let stopCalls = 0;
  const track = {
    enabled: true,
    stop() {
      stopCalls += 1;
    },
  };
  const stream = {
    getTracks: () => [track],
    getAudioTracks: () => [track],
  };
  Object.defineProperty(globalThis, "navigator", {
    configurable: true,
    value: {
      mediaDevices: {
        async getUserMedia(options) {
          requests.push(options);
          return stream;
        },
      },
    },
  });

  try {
    return await run({ requests, stream, track, getStopCalls: () => stopCalls });
  } finally {
    if (previousNavigator) {
      Object.defineProperty(globalThis, "navigator", previousNavigator);
    } else {
      delete globalThis.navigator;
    }
  }
}

test("go2rtc two-way talk captures default browser audio and owns its mounted engine", async () => {
  await withFakeMicrophone(async ({ requests, stream, track, getStopCalls }) => {
    let destroyCalls = 0;
    let endedCalls = 0;
    let mountedOptions = null;
    const engine = {
      destroy() {
        destroyCalls += 1;
      },
    };

    const session = await startGo2RtcTwoWayTalkSession({
      mountMicrophoneStream: async (options) => {
        mountedOptions = options;
        return engine;
      },
      onEnded: () => {
        endedCalls += 1;
      },
    });

    assert.deepEqual(requests, [{ audio: true, video: false }]);
    assert.equal(mountedOptions.localStream, stream);
    assert.equal(typeof mountedOptions.onEnded, "function");
    assert.equal(session.type, "frigate_go2rtc");
    assert.equal(session.engine, engine);
    assert.equal(session.microphoneMuted, false);

    assert.equal(session.setMicrophoneMuted(true), true);
    assert.equal(session.microphoneMuted, true);
    assert.equal(track.enabled, false);
    assert.equal(destroyCalls, 0);

    assert.equal(session.setMicrophoneMuted(false), false);
    assert.equal(session.microphoneMuted, false);
    assert.equal(track.enabled, true);
    assert.equal(destroyCalls, 0);

    await session.stop();
    await session.stop();

    assert.equal(destroyCalls, 1);
    assert.equal(getStopCalls(), 1);
    assert.equal(endedCalls, 1);
  });
});

test("ha-direct two-way talk remains an explicit mounted transport session", async () => {
  await withFakeMicrophone(async ({ stream }) => {
    const engine = { destroy() {} };
    const session = await startHaDirectTwoWayTalkSession({
      mountMicrophoneStream: async ({ localStream }) => {
        assert.equal(localStream, stream);
        return engine;
      },
    });

    assert.equal(session.type, "ha_direct");
    assert.equal(session.engine, engine);
  });
});

test("failed two-way talk mounts release microphone capture", async () => {
  await withFakeMicrophone(async ({ getStopCalls }) => {
    await assert.rejects(
      startGo2RtcTwoWayTalkSession({
        mountMicrophoneStream: async () => null,
      }),
      /Unable to establish frigate_go2rtc two-way talk/,
    );
    assert.equal(getStopCalls(), 1);
  });
});
