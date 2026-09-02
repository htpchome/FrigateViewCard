import assert from "node:assert/strict";
import test from "node:test";

import { hasHaCameraWebRtcPlaybackCapability } from "../src/integrations/home-assistant/camera-capabilities.js";

test("Home Assistant camera capability detection recognizes WebRTC playback", () => {
  assert.equal(
    hasHaCameraWebRtcPlaybackCapability({
      frontend_stream_types: ["hls", "web_rtc"],
    }),
    true,
  );
  assert.equal(
    hasHaCameraWebRtcPlaybackCapability({
      frontend_stream_types: ["hls"],
    }),
    false,
  );
  assert.equal(hasHaCameraWebRtcPlaybackCapability(null), false);
});
