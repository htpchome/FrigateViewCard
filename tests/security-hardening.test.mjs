import { readFileSync } from "node:fs";
import { test } from "node:test";
import assert from "node:assert/strict";

import { buildEventListItemHtml } from "../src/data/event-list.model.js";
import { buildPopupCarouselItemMarkup } from "../src/features/popup/carousel.js";
import { buildPopupInfoMarkup } from "../src/features/popup/info.js";
import {
  PopupMediaLoaderController,
  resolveRecordingHlsJsUrl,
} from "../src/features/popup/media-loader.ctrl.js";
import {
  buildPreviewCameraButtonMarkup,
  buildPreviewMetaMarkup,
} from "../src/features/preview/page.tmpl.js";
import { buildSingleViewCamSwitcherMarkup } from "../src/features/single-view/page.tmpl.js";
import { escapeHtml, escapeHtmlAttribute } from "../src/shared/html.js";
import { buildEmptyListMessageHtml } from "../src/shared/list-render.js";

const injection = '\"><img src=x onerror="globalThis.compromised=true">';

test("shared HTML encoding handles both text and attribute contexts", () => {
  const expected =
    "&quot;&gt;&lt;img src=x onerror=&quot;globalThis.compromised=true&quot;&gt;";
  assert.equal(escapeHtml(injection), expected);
  assert.equal(escapeHtmlAttribute(injection), expected);
});

test("event, popup, preview, and camera markup encode external metadata", () => {
  const eventHtml = buildEventListItemHtml(
    {
      id: injection,
      labelColorValue: "#fff",
      labelText: injection,
      score: "",
      reviewBar: "",
      zone: injection,
      subl: "",
      thumb: "",
      badge: "",
      mediaActions: "",
      camLabel: "",
      favBtn: "",
      duration: 1,
      showDurationBadge: true,
      timeLabel: injection,
      dayLabel: injection,
      description: injection,
    },
    { icons: {}, expanded: true, compact: false },
  );
  const popup = buildPopupInfoMarkup({
    event: { sub_label: injection },
    model: {
      mediaType: "clip",
      camera: injection,
      time: injection,
      shortDate: injection,
      titleLabel: injection,
      dayDate: injection,
      duration: injection,
      objects: injection,
      zone: injection,
      score: injection,
      downloadActions: [
        {
          kind: "event",
          id: injection,
          file: "clip.mp4",
          label: injection,
          icon: "download",
        },
      ],
    },
    icons: { download: "<svg></svg>" },
    resolveLabelColor: () => "#fff",
  }).infoHtml;
  const carousel = buildPopupCarouselItemMarkup({
    event: { id: injection },
    title: injection,
    label: injection,
    time: injection,
  });
  const preview = buildPreviewMetaMarkup({
    showTitleBars: true,
    name: injection,
    online: true,
    sourceLabel: injection,
    alertsCount: injection,
  });
  const previewButton = buildPreviewCameraButtonMarkup({
    index: 0,
    entity: injection,
    name: injection,
  });
  const cameraSwitcher = buildSingleViewCamSwitcherMarkup({
    cameras: [{ name: injection }],
    getCameraName: (camera) => camera.name,
    isCameraAvailable: () => true,
  });
  const empty = buildEmptyListMessageHtml(injection, injection);

  for (const markup of [
    eventHtml,
    popup,
    carousel,
    preview,
    previewButton,
    cameraSwitcher,
    empty,
  ]) {
    assert.doesNotMatch(markup, /<img src=x/);
    assert.doesNotMatch(markup, /onerror="globalThis\.compromised/);
    assert.match(markup, /&lt;img/);
  }
});

test("development services bind to localhost and use public sample media", () => {
  const compose = readFileSync(
    new URL("../.devcontainer/docker-compose.yml", import.meta.url),
    "utf8",
  );
  const frigateConfig = readFileSync(
    new URL("../.devcontainer/frigate/config.yml", import.meta.url),
    "utf8",
  );
  const publishedPorts = compose
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => /^- "[^\"]+"(?:\s+#.*)?$/.test(line));

  assert.ok(publishedPorts.length > 0);
  publishedPorts.forEach((line) => assert.match(line, /^- "127\.0\.0\.1:/));
  assert.doesNotMatch(frigateConfig, /ffmpeg:http:\/\/(?:\d{1,3}\.){3}\d{1,3}/);
  assert.match(frigateConfig, /commondatastorage\.googleapis\.com/);
});

test("recording HLS fallback is local, version-pinned, and integrity-checked", async () => {
  const loaderSource = readFileSync(
    new URL("../src/features/popup/media-loader.ctrl.js", import.meta.url),
    "utf8",
  );
  const previousWindow = globalThis.window;
  const previousDocument = globalThis.document;
  const scripts = [];
  const localHlsUrl =
    "https://home-assistant.test/local/frigate-view-card-hls-1.5.17.js";
  class LoadedHls {}
  globalThis.window = {};
  globalThis.document = {
    createElement: (tagName) => {
      assert.equal(tagName, "script");
      const script = { remove: () => {} };
      scripts.push(script);
      return script;
    },
    head: {
      appendChild: (script) => {
        globalThis.window.Hls = LoadedHls;
        script.onload?.();
      },
    },
  };

  try {
    assert.doesNotMatch(loaderSource, /cdn\.jsdelivr\.net|unpkg\.com/);
    assert.equal(
      resolveRecordingHlsJsUrl(
        "https://home-assistant.test/local/frigate-view-card.js?hacstag=1959",
      ),
      localHlsUrl,
    );
    const controller = new PopupMediaLoaderController({}, {
      resolveRecordingHlsJsUrl: () => localHlsUrl,
    });
    assert.equal(await controller._getHlsJsCtor(), LoadedHls);
    assert.equal(await controller._getHlsJsCtor(), LoadedHls);
    assert.equal(scripts.length, 1);
    assert.equal(scripts[0].src, localHlsUrl);
    assert.equal(
      scripts[0].integrity,
      "sha384-9v3HcdYrO3D+OPDTjZ40RXocgE4GtXVCd3/mCS62JsM93JXgI1afJVuwjFvsu6ni",
    );
    assert.equal(scripts[0].crossOrigin, "anonymous");
    assert.equal(scripts[0].referrerPolicy, "no-referrer");
  } finally {
    globalThis.window = previousWindow;
    globalThis.document = previousDocument;
  }
});
