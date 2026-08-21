import { test } from "node:test";
import assert from "node:assert/strict";

import {
  buildVideoOptionsForView,
  configureVideoElement,
  createVideoElement,
  disableNativePictureInPicture,
  enableNativePictureInPicture,
  getVideoViewDefaultOptions,
  getScopedVideoViewDefaultOptions,
  mountNodeIntoSlot,
  resetVideoViewDefaultOptions,
  resetScopedVideoViewDefaultOptions,
  resolveVideoProfileNameForView,
  setScopedVideoViewDefaultOptions,
  setVideoViewDefaultOptions,
  supportsNativeHlsPlayback,
} from "../src/shared/media/video-factory.js";

function createFakeVideoElement() {
  const attrs = new Map();
  const classSet = new Set();
  const dataset = {};
  const style = { cssText: "" };
  let classNameValue = "";

  const syncClassNameFromSet = () => {
    classNameValue = [...classSet].join(" ");
  };

  return {
    autoplay: false,
    playsInline: false,
    muted: false,
    defaultMuted: false,
    controls: false,
    preload: "",
    src: "",
    style,
    dataset,
    get className() {
      return classNameValue;
    },
    set className(value) {
      classSet.clear();
      const text = String(value || "").trim();
      if (text) {
        for (const token of text.split(/\s+/)) {
          classSet.add(token);
        }
      }
      syncClassNameFromSet();
    },
    classList: {
      add(...tokens) {
        for (const token of tokens) {
          const next = String(token || "").trim();
          if (!next) continue;
          classSet.add(next);
        }
        syncClassNameFromSet();
      },
      contains(token) {
        return classSet.has(String(token || "").trim());
      },
    },
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
    assert.equal(video.disablePictureInPicture, false);
    assert.equal(video.hasAttribute("disablepictureinpicture"), false);
    assert.equal(video.disableRemotePlayback, true);
    assert.equal(video.getAttribute("x-webkit-airplay"), "deny");
  });
});

test("Firefox video creation suppresses native PiP controls", () => {
  withFakeDocument(() => {
    const video = createVideoElement({
      profile: "liveEngine",
      navigatorObj: { userAgent: "Mozilla/5.0 Firefox/153.0" },
    });

    assert.equal(video.disablePictureInPicture, true);
    assert.equal(video.hasAttribute("disablepictureinpicture"), true);
  });
});

test("native PiP suppression sets both the video property and attribute", () => {
  const video = createFakeVideoElement();

  assert.equal(disableNativePictureInPicture(video), true);
  assert.equal(video.disablePictureInPicture, true);
  assert.equal(video.hasAttribute("disablepictureinpicture"), true);
});

test("nested player videos have stale PiP suppression cleared", () => {
  const video = createFakeVideoElement();
  video.disablePictureInPicture = true;
  video.setAttribute("disablepictureinpicture", "");

  assert.equal(enableNativePictureInPicture(video), true);
  assert.equal(video.disablePictureInPicture, false);
  assert.equal(video.hasAttribute("disablepictureinpicture"), false);
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

test("resolveVideoProfileNameForView maps view keys with safe fallback", () => {
  assert.equal(resolveVideoProfileNameForView("live"), "liveEngine");
  assert.equal(resolveVideoProfileNameForView("popup"), "popupPlayback");
  assert.equal(
    resolveVideoProfileNameForView("recording"),
    "recordingPlayback",
  );
  assert.equal(resolveVideoProfileNameForView("unknown"), "liveEngine");
});

test("createVideoElement supports viewType-based profile selection", () => {
  withFakeDocument(() => {
    const popupVideo = createVideoElement({
      viewType: "popup",
      autoplay: false,
      muted: true,
    });
    assert.equal(popupVideo.controls, true);
    assert.equal(popupVideo.preload, "metadata");

    const recordingVideo = createVideoElement({
      viewType: "recording",
      muted: true,
    });
    assert.equal(recordingVideo.controls, true);
    assert.equal(recordingVideo.preload, "metadata");
  });
});

test("configureVideoElement applies class and dataset hooks", () => {
  const video = createFakeVideoElement();
  video.dataset.overlay = "old";

  configureVideoElement(video, {
    viewType: "popup",
    className: "fvc-video",
    classNames: ["overlay-enabled", "rounded"],
    dataset: {
      view: "popup",
      overlay: true,
      stale: null,
    },
  });

  assert.equal(video.className, "fvc-video overlay-enabled rounded");
  assert.equal(video.classList.contains("overlay-enabled"), true);
  assert.equal(video.dataset.view, "popup");
  assert.equal(video.dataset.overlay, "1");
  assert.equal("stale" in video.dataset, false);
});

test("supportsNativeHlsPlayback returns true when HLS MIME type is supported", () => {
  const previousDocument = globalThis.document;
  globalThis.document = {
    createElement: (tag) => {
      if (String(tag).toLowerCase() !== "video") {
        throw new Error("Unexpected tag: " + tag);
      }
      return {
        canPlayType: (mime) =>
          mime === "application/vnd.apple.mpegurl" ? "probably" : "",
      };
    },
  };
  try {
    assert.equal(supportsNativeHlsPlayback(), true);
  } finally {
    globalThis.document = previousDocument;
  }
});

test("supportsNativeHlsPlayback returns false when HLS MIME types are unsupported", () => {
  const previousDocument = globalThis.document;
  globalThis.document = {
    createElement: (tag) => {
      if (String(tag).toLowerCase() !== "video") {
        throw new Error("Unexpected tag: " + tag);
      }
      return {
        canPlayType: () => "",
      };
    },
  };
  try {
    assert.equal(supportsNativeHlsPlayback(), false);
  } finally {
    globalThis.document = previousDocument;
  }
});

test("buildVideoOptionsForView returns per-view defaults with safe fallback", () => {
  assert.deepEqual(buildVideoOptionsForView("live"), { viewType: "live" });
  assert.deepEqual(buildVideoOptionsForView("popup"), { viewType: "popup" });
  assert.deepEqual(buildVideoOptionsForView("recording"), {
    viewType: "recording",
  });
  assert.deepEqual(buildVideoOptionsForView("unknown"), {
    viewType: "live",
  });
});

test("buildVideoOptionsForView merges style/dataset/attributes/classNames", () => {
  const merged = buildVideoOptionsForView("popup", {
    muted: true,
    style: { objectFit: "cover" },
    dataset: { overlay: "1" },
    attributes: { controlslist: "nodownload" },
    classNames: ["rounded", "overlay-enabled"],
  });

  assert.equal(merged.viewType, "popup");
  assert.equal(merged.muted, true);
  assert.deepEqual(merged.style, { objectFit: "cover" });
  assert.deepEqual(merged.dataset, { overlay: "1" });
  assert.deepEqual(merged.attributes, { controlslist: "nodownload" });
  assert.deepEqual(merged.classNames, ["rounded", "overlay-enabled"]);
});

test("runtime view defaults can be set and read per view", () => {
  resetVideoViewDefaultOptions();
  setVideoViewDefaultOptions("popup", {
    controls: false,
    style: { objectFit: "contain" },
  });

  const runtime = getVideoViewDefaultOptions("popup");
  assert.equal(runtime.controls, false);
  assert.deepEqual(runtime.style, { objectFit: "contain" });
});

test("buildVideoOptionsForView applies runtime defaults before overrides", () => {
  resetVideoViewDefaultOptions();
  setVideoViewDefaultOptions("popup", {
    controls: false,
    style: { objectFit: "contain", borderRadius: "8px" },
    dataset: { source: "runtime" },
    classNames: ["runtime-class"],
  });

  const merged = buildVideoOptionsForView("popup", {
    style: { objectFit: "cover" },
    dataset: { source: "override" },
    classNames: ["override-class"],
  });

  assert.equal(merged.controls, false);
  assert.deepEqual(merged.style, {
    objectFit: "cover",
    borderRadius: "8px",
  });
  assert.deepEqual(merged.dataset, { source: "override" });
  assert.deepEqual(merged.classNames, ["runtime-class", "override-class"]);
});

test("resetVideoViewDefaultOptions clears one view or all views", () => {
  resetVideoViewDefaultOptions();
  setVideoViewDefaultOptions("popup", { controls: false });
  setVideoViewDefaultOptions("recording", { muted: false });

  resetVideoViewDefaultOptions("popup");
  assert.deepEqual(getVideoViewDefaultOptions("popup"), {});
  assert.deepEqual(getVideoViewDefaultOptions("recording"), { muted: false });

  resetVideoViewDefaultOptions();
  assert.deepEqual(getVideoViewDefaultOptions("recording"), {});
});

test("scoped runtime defaults are isolated per scope key", () => {
  const scopeA = {};
  const scopeB = {};
  resetScopedVideoViewDefaultOptions(null, { scopeKey: scopeA });
  resetScopedVideoViewDefaultOptions(null, { scopeKey: scopeB });

  setScopedVideoViewDefaultOptions(
    "popup",
    { controls: false },
    { scopeKey: scopeA },
  );

  assert.deepEqual(
    getScopedVideoViewDefaultOptions("popup", { scopeKey: scopeA }),
    {
      controls: false,
    },
  );
  assert.deepEqual(
    getScopedVideoViewDefaultOptions("popup", { scopeKey: scopeB }),
    {},
  );
});

test("buildVideoOptionsForView applies scoped defaults over global defaults", () => {
  const scope = {};
  resetVideoViewDefaultOptions();
  resetScopedVideoViewDefaultOptions(null, { scopeKey: scope });

  setVideoViewDefaultOptions("popup", {
    controls: false,
    style: { objectFit: "contain" },
  });
  setScopedVideoViewDefaultOptions(
    "popup",
    {
      controls: true,
      style: { objectFit: "cover" },
      classNames: ["scope-class"],
    },
    { scopeKey: scope },
  );

  const merged = buildVideoOptionsForView(
    "popup",
    { classNames: ["override-class"] },
    { scopeKey: scope },
  );

  assert.equal(merged.controls, true);
  assert.deepEqual(merged.style, { objectFit: "cover" });
  assert.deepEqual(merged.classNames, ["scope-class", "override-class"]);
});

test("buildVideoOptionsForView merges global scoped and override object layers", () => {
  const scope = {};
  resetVideoViewDefaultOptions();
  resetScopedVideoViewDefaultOptions(null, { scopeKey: scope });

  setVideoViewDefaultOptions("popup", {
    style: { objectFit: "contain" },
    dataset: { source: "global" },
    attributes: { controlslist: "nodownload" },
    classNames: ["global-class"],
  });
  setScopedVideoViewDefaultOptions(
    "popup",
    {
      style: { borderRadius: "8px" },
      dataset: { source: "scoped" },
      classNames: ["scoped-class"],
    },
    { scopeKey: scope },
  );

  const merged = buildVideoOptionsForView(
    "popup",
    {
      style: { objectFit: "cover" },
      classNames: ["override-class"],
    },
    { scopeKey: scope },
  );

  assert.deepEqual(merged.style, {
    objectFit: "cover",
    borderRadius: "8px",
  });
  assert.deepEqual(merged.dataset, { source: "scoped" });
  assert.deepEqual(merged.attributes, { controlslist: "nodownload" });
  assert.deepEqual(merged.classNames, [
    "global-class",
    "scoped-class",
    "override-class",
  ]);
});
