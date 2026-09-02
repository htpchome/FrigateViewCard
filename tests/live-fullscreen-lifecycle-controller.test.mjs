import { test } from "node:test";
import assert from "node:assert/strict";

import { LiveFullscreenLifecycleController } from "../src/features/live/fullscreen-lifecycle.ctrl.js";

class FakeTarget extends EventTarget {
  playCalls = 0;

  play() {
    this.playCalls += 1;
    return Promise.resolve();
  }
}

const createFixture = () => {
  const initialVideo = new FakeTarget();
  let currentVideo = initialVideo;
  const resumeReasons = [];
  let exitCount = 0;
  const controller = new LiveFullscreenLifecycleController({
    getCurrentVideo: () => currentVideo,
    scheduleResumeLive: (reason) => resumeReasons.push(reason),
    onFullscreenExit: () => {
      exitCount += 1;
    },
  });

  return {
    controller,
    initialVideo,
    resumeReasons,
    getExitCount: () => exitCount,
    setCurrentVideo: (video) => {
      currentVideo = video;
    },
  };
};

test("document fullscreen exit resumes the current live video once", () => {
  const fixture = createFixture();
  fixture.controller.beginDocumentFullscreen(fixture.initialVideo);
  assert.equal(fixture.controller.active, true);

  fixture.controller.handleDocumentFullscreenChange({});
  fixture.controller.handleDocumentFullscreenChange(null);
  fixture.controller.handleDocumentFullscreenChange(null);

  assert.equal(fixture.controller.active, false);
  assert.equal(fixture.initialVideo.playCalls, 1);
  assert.deepEqual(fixture.resumeReasons, ["live-fullscreen-exit"]);
  assert.equal(fixture.getExitCount(), 1);
});

test("document fullscreen request cancellation does not trigger recovery", () => {
  const fixture = createFixture();
  fixture.controller.beginDocumentFullscreen(fixture.initialVideo);
  fixture.controller.cancel();
  fixture.controller.handleDocumentFullscreenChange(null);

  assert.equal(fixture.initialVideo.playCalls, 0);
  assert.deepEqual(fixture.resumeReasons, []);
  assert.equal(fixture.getExitCount(), 0);
});

test("native video fullscreen exit resumes a replacement live video", () => {
  const fixture = createFixture();
  const replacementVideo = new FakeTarget();
  fixture.controller.beginNativeVideoFullscreen(fixture.initialVideo);
  assert.equal(fixture.controller.active, true);
  fixture.setCurrentVideo(replacementVideo);

  fixture.initialVideo.dispatchEvent(new Event("webkitendfullscreen"));
  fixture.initialVideo.dispatchEvent(new Event("webkitendfullscreen"));

  assert.equal(fixture.controller.active, false);
  assert.equal(fixture.initialVideo.playCalls, 0);
  assert.equal(replacementVideo.playCalls, 1);
  assert.deepEqual(fixture.resumeReasons, ["live-fullscreen-exit"]);
});

test("native fullscreen recovery falls back to its session video", () => {
  const fixture = createFixture();
  fixture.controller.beginNativeVideoFullscreen(fixture.initialVideo);
  fixture.setCurrentVideo(null);

  fixture.initialVideo.dispatchEvent(new Event("webkitendfullscreen"));

  assert.equal(fixture.initialVideo.playCalls, 1);
  assert.deepEqual(fixture.resumeReasons, ["live-fullscreen-exit"]);
});
