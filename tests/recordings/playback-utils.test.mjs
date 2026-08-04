import { test } from "node:test";
import assert from "node:assert/strict";

import { buildRecordingPlaybackPlan } from "../../src/features/recordings/utils/playback.js";

test("buildRecordingPlaybackPlan caps recording chunk length and formats camera name", () => {
  assert.deepEqual(
    buildRecordingPlaybackPlan({
      clientId: "client-a",
      camera: "front_door",
      start: 100,
      end: 5000,
      preferHls: false,
    }),
    {
      chunkEnd: 3700,
      clipDurationSec: 3600,
      displayCamera: "front door",
      sourceCandidates: [
        "/api/frigate/client-a/recording/front_door/start/100/end/3700",
        "/api/frigate/client-a/vod/front_door/start/100/end/3700/index.m3u8",
        "/api/frigate/client-a/vod/front_door/start/100/end/3700/master.m3u8",
      ],
    },
  );
});

test("buildRecordingPlaybackPlan prefers HLS sources when requested", () => {
  assert.deepEqual(
    buildRecordingPlaybackPlan({
      clientId: "client-a",
      camera: "front door",
      start: 100,
      end: 200,
      preferHls: true,
    }).sourceCandidates,
    [
      "/api/frigate/client-a/vod/front%20door/start/100/end/200/index.m3u8",
      "/api/frigate/client-a/vod/front%20door/start/100/end/200/master.m3u8",
      "/api/frigate/client-a/recording/front%20door/start/100/end/200",
    ],
  );
});
