import { test } from "node:test";
import assert from "node:assert/strict";

import { CleanupController } from "../src/card/cleanup-controller.js";

test("CleanupController aborts listeners and runs registered cleanups once", () => {
  const controller = new CleanupController();
  const target = new EventTarget();
  let handled = 0;
  let cleaned = 0;

  controller.addEventListener(target, "ping", () => {
    handled += 1;
  });
  controller.addCleanup(() => {
    cleaned += 1;
  });

  target.dispatchEvent(new Event("ping"));
  controller.dispose();
  controller.dispose();
  target.dispatchEvent(new Event("ping"));

  assert.equal(handled, 1);
  assert.equal(cleaned, 1);
});
