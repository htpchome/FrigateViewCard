import { test } from "node:test";
import assert from "node:assert/strict";

import {
  applyFallbackImageHandlers,
  resolveFallbackDisplaySource,
  resolveFallbackObjectFit,
  setFallbackImageSourceIfChanged,
} from "../src/live/live-fallback-image.js";

test("resolveFallbackDisplaySource prefers primary then alt", () => {
  assert.equal(
    resolveFallbackDisplaySource({
      primarySrc: "https://ha.local/primary.jpg",
      altSrc: "https://ha.local/alt.jpg",
    }),
    "https://ha.local/primary.jpg",
  );

  assert.equal(
    resolveFallbackDisplaySource({
      primarySrc: "",
      altSrc: "https://ha.local/alt.jpg",
    }),
    "https://ha.local/alt.jpg",
  );

  assert.equal(
    resolveFallbackDisplaySource({
      primarySrc: "",
      altSrc: "",
    }),
    "",
  );
});

test("resolveFallbackObjectFit returns cover for near-16:9 in matching panel", () => {
  assert.equal(
    resolveFallbackObjectFit({
      naturalWidth: 1920,
      naturalHeight: 1080,
      containerWidth: 1600,
      containerHeight: 900,
    }),
    "cover",
  );

  assert.equal(
    resolveFallbackObjectFit({
      naturalWidth: 1280,
      naturalHeight: 720,
      containerWidth: 1200,
      containerHeight: 1000,
    }),
    "contain",
  );
});

test("applyFallbackImageHandlers assigns callbacks, status, and alt", () => {
  const statusEl = { hidden: false };
  const img = {
    src: "",
    alt: "",
    style: {},
    naturalWidth: 1920,
    naturalHeight: 1080,
    parentElement: {
      clientWidth: 1600,
      clientHeight: 900,
    },
    onerror: null,
    onload: null,
  };

  applyFallbackImageHandlers({
    img,
    statusEl,
    altSrc: "https://ha.local/alt.jpg",
    entity: "camera.front",
  });

  assert.equal(statusEl.hidden, true);
  assert.equal(img.alt, "camera.front snapshot");
  assert.equal(typeof img.onerror, "function");
  assert.equal(typeof img.onload, "function");

  img.src = "https://ha.local/primary.jpg";
  img.onerror();
  assert.equal(img.src, "https://ha.local/alt.jpg");

  img.onerror();
  assert.equal(statusEl.hidden, false);

  img.onload();
  assert.equal(statusEl.hidden, true);
  assert.equal(img.style.objectFit, "cover");
});

test("setFallbackImageSourceIfChanged updates source only when different", () => {
  const img = { src: "https://ha.local/a.jpg" };

  setFallbackImageSourceIfChanged({
    img,
    src: "https://ha.local/a.jpg",
  });
  assert.equal(img.src, "https://ha.local/a.jpg");

  setFallbackImageSourceIfChanged({
    img,
    src: "https://ha.local/b.jpg",
  });
  assert.equal(img.src, "https://ha.local/b.jpg");
});
