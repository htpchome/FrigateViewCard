import { test } from "node:test";
import assert from "node:assert/strict";

import { hasTwoWayTalkCapability } from "../src/features/two-way-talk/index.js";

test("hasTwoWayTalkCapability detects generic two-way talk fields", () => {
  assert.equal(hasTwoWayTalkCapability(null), false);
  assert.equal(hasTwoWayTalkCapability({ two_way_talk: true }), true);
  assert.equal(hasTwoWayTalkCapability({ features: ["pt", "talk"] }), true);
  assert.equal(hasTwoWayTalkCapability({ capabilities: ["microphone"] }), true);
  assert.equal(
    hasTwoWayTalkCapability({ profile: { supports_two_way_audio: true } }),
    true,
  );
  assert.equal(
    hasTwoWayTalkCapability({ features: [{ name: "backchannel" }] }),
    true,
  );
  assert.equal(hasTwoWayTalkCapability({ features: ["pt", "zoom"] }), false);
});

test("hasTwoWayTalkCapability detects go2rtc backchannel from producer medias", () => {
  assert.equal(
    hasTwoWayTalkCapability({
      producers: [
        {
          medias: ["video, recvonly, H264", "audio, sendonly, PCMA/8000"],
        },
      ],
    }),
    true,
  );

  assert.equal(
    hasTwoWayTalkCapability({
      producers: [
        {
          medias: ["video, recvonly, H264", "audio, recvonly, AAC"],
        },
      ],
    }),
    false,
  );
});
