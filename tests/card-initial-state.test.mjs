import { test } from "node:test";
import assert from "node:assert/strict";

import { createInitialCardRuntimeState } from "../src/card/initial-state.js";

test("card runtime state starts with the established navigation and media defaults", () => {
  const state = createInitialCardRuntimeState({
    singleViewPageId: "single-view",
  });

  assert.equal(state._pageId, "single-view");
  assert.equal(state._lastNonPreviewPageId, "single-view");
  assert.equal(state._viewMode, "single");
  assert.equal(state._eventsMode, "camera");
  assert.equal(state._tab, "alerts");
  assert.equal(state._streamMuted, true);
  assert.equal(state._activeStreamType, "--");
  assert.equal(state._followNowWindow, true);
  assert.equal(state._rotateOverlayMode, "none");
  assert.equal(state._engineMountedMuted, true);
  assert.equal(state._mountInProgress, false);
  assert.equal(state._deepLinkApplied, false);
});

test("each card receives independent mutable runtime collections", () => {
  const first = createInitialCardRuntimeState({
    singleViewPageId: "single-view",
  });
  const second = createInitialCardRuntimeState({
    singleViewPageId: "single-view",
  });
  const mutableKeys = [
    "_camCache",
    "_events",
    "_recordings",
    "_reviews",
    "_kept",
    "_daysWithActivity",
    "_calendarActivityByCam",
    "_calendarActivityInFlight",
    "_slideshowHandledReviewIds",
    "_domCache",
    "_fallbackImgUrlCache",
    "_recordingsDayRequestCache",
    "_pendingMountDestroyers",
  ];

  mutableKeys.forEach((key) => {
    assert.notStrictEqual(first[key], second[key], key);
  });
});
