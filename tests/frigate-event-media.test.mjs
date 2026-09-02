import test from "node:test";
import assert from "node:assert/strict";

import { EVENT_PRE_POST_ROLL_SECONDS } from "../src/constants.js";
import { resolveFrigateEventPrePostRollRange } from "../src/integrations/frigate/event-media.js";

test("Frigate event playback range adds the configured pre-roll and post-roll", () => {
  assert.equal(EVENT_PRE_POST_ROLL_SECONDS, 5);
  assert.deepEqual(
    resolveFrigateEventPrePostRollRange({
      event: { start_time: 100.8, end_time: 110.2 },
      enabled: true,
    }),
    {
      start: 95,
      end: 116,
      durationSec: 21,
    },
  );
});

test("Frigate event playback range requires the toggle and a completed event", () => {
  assert.equal(
    resolveFrigateEventPrePostRollRange({
      event: { start_time: 100, end_time: 110 },
      enabled: false,
    }),
    null,
  );
  assert.equal(
    resolveFrigateEventPrePostRollRange({
      event: { start_time: 100, end_time: null },
      enabled: true,
    }),
    null,
  );
});
