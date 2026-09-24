import { test } from "node:test";
import assert from "node:assert/strict";

import {
  applyContainedVideoFit,
  attachContainedVideoFit,
} from "../src/shared/media/video-fit.js";

test("contained video fit applies stable live-media dimensions", () => {
  const video = { style: {} };

  applyContainedVideoFit(video);

  assert.deepEqual(video.style, {
    display: "block",
    width: "100%",
    height: "100%",
    objectPosition: "center center",
    objectFit: "contain",
  });
});

test("contained video fit accepts a video as the media root", () => {
  const video = {
    tagName: "VIDEO",
    style: {},
    querySelector() {
      throw new Error("a video root must not be queried");
    },
  };

  attachContainedVideoFit(video);

  assert.equal(video.style.objectFit, "contain");
});

test("contained video fit discovers light and shadow DOM video children", () => {
  const lightVideo = { style: {} };
  const shadowVideo = { style: {} };
  const lightRoot = {
    querySelector: (selector) => (selector === "video" ? lightVideo : null),
    shadowRoot: {
      querySelector: () => shadowVideo,
    },
  };
  const shadowRoot = {
    querySelector: () => null,
    shadowRoot: {
      querySelector: (selector) =>
        selector === "video" ? shadowVideo : null,
    },
  };

  attachContainedVideoFit(lightRoot);
  attachContainedVideoFit(shadowRoot);

  assert.equal(lightVideo.style.objectFit, "contain");
  assert.equal(shadowVideo.style.objectFit, "contain");
});
