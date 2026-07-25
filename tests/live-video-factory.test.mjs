import { test } from "node:test";
import assert from "node:assert/strict";

import {
  configureVideoElement,
  createVideoElement,
  mountNodeIntoSlot,
} from "../src/live/live-video-factory.js";

function createFakeVideoElement() {
  const attrs = new Map();
  return {
    autoplay: false,
    playsInline: false,
    muted: false,
    defaultMuted: false,
    controls: false,
    preload: "",
    src: "",
    style: { cssText: "" },
    setAttribute(name, value) {
      attrs.set(name, String(value));
    },
    removeAttribute(name) {
      attrs.delete(name);
    },
    getAttribute(name) {
      return attrs.get(name);
    },
    hasAttribute(name) {
      return attrs.has(name);
    },
  };
}

function withFakeDocument(run) {
  const previousDocument = globalThis.document;
  globalThis.document = {
    createElement: (tag) => {
      if (String(tag).toLowerCase() !== "video") {
        throw new Error("Unexpected tag: " + tag);
      }
      return createFakeVideoElement();
    },
  };
  try {
    run();
  } finally {
    globalThis.document = previousDocument;
  }
}

test("createVideoElement applies liveEngine defaults", () => {
  withFakeDocument(() => {
    const video = createVideoElement({
      profile: "liveEngine",
      muted: true,
    });

    assert.equal(video.autoplay, true);
    assert.equal(video.playsInline, true);
    assert.equal(video.controls, false);
    assert.equal(video.muted, true);
    assert.equal(
      video.style.cssText,
      "width:100%;height:100%;display:block;background:var(--c-bg-deep)",
    );
    assert.equal(video.hasAttribute("playsinline"), true);
    assert.equal(video.hasAttribute("webkit-playsinline"), true);
  });
});

test("popup profile enables controls and preload metadata", () => {
  withFakeDocument(() => {
    const video = createVideoElement({
      profile: "popupPlayback",
      autoplay: false,
      muted: true,
      src: "/clip.mp4",
    });

    assert.equal(video.autoplay, false);
    assert.equal(video.controls, true);
    assert.equal(video.preload, "metadata");
    assert.equal(video.src, "/clip.mp4");
  });
});

test("configureVideoElement applies attribute overrides and removals", () => {
  const video = createFakeVideoElement();
  video.setAttribute("data-stale", "1");

  configureVideoElement(video, {
    profile: "recordingPlayback",
    muted: true,
    attributes: {
      "data-overlay": "enabled",
      controlslist: "nodownload",
      "data-stale": false,
    },
  });

  assert.equal(video.controls, true);
  assert.equal(video.preload, "metadata");
  assert.equal(video.muted, true);
  assert.equal(video.getAttribute("data-overlay"), "enabled");
  assert.equal(video.getAttribute("controlslist"), "nodownload");
  assert.equal(video.hasAttribute("data-stale"), false);
});

test("configureVideoElement supports visual style configuration", () => {
  const video = createFakeVideoElement();

  configureVideoElement(video, {
    profile: "liveEngine",
    objectFit: "cover",
    aspectRatio: "16 / 9",
    filter: "brightness(1.1)",
    borderRadius: "12px",
    boxShadow: "0 0 10px rgba(0,0,0,0.35)",
  });

  assert.equal(video.style.objectFit, "cover");
  assert.equal(video.style.aspectRatio, "16 / 9");
  assert.equal(video.style.filter, "brightness(1.1)");
  assert.equal(video.style.borderRadius, "12px");
  assert.equal(video.style.boxShadow, "0 0 10px rgba(0,0,0,0.35)");

  configureVideoElement(video, {
    profile: "liveEngine",
    borderRadius: null,
    boxShadow: null,
  });

  assert.equal(video.style.borderRadius, "");
  assert.equal(video.style.boxShadow, "");
});

test("mountNodeIntoSlot replaces slot contents before append", () => {
  const appendCalls = [];
  const slot = {
    innerHTML: "before",
    appendChild(node) {
      appendCalls.push(node);
    },
  };
  const node = { id: "video-node" };

  mountNodeIntoSlot(slot, node);

  assert.equal(slot.innerHTML, "");
  assert.equal(appendCalls.length, 1);
  assert.equal(appendCalls[0], node);
});
