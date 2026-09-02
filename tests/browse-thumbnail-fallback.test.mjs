import test from "node:test";
import assert from "node:assert/strict";

import {
  buildBrowseThumbnailImageMarkup,
  syncPreservedBrowseThumbnail,
} from "../src/features/browse/thumbnail.tmpl.js";

const createImage = (attributes = {}, { display = "" } = {}) => {
  const values = new Map(Object.entries(attributes));
  const image = {
    dataset: { thumbId: values.get("data-thumb-id") || "" },
    style: { display },
    nextElementSibling: { style: { display: display === "none" ? "flex" : "none" } },
    getAttribute: (name) => values.get(name) ?? null,
    setAttribute: (name, value) => {
      values.set(name, String(value));
      if (name === "data-thumb-id") image.dataset.thumbId = String(value);
    },
    removeAttribute: (name) => values.delete(name),
  };
  return image;
};

test("browse thumbnail markup falls back from an event image to its review image", () => {
  const html = buildBrowseThumbnailImageMarkup({
    src: "/event/thumbnail.jpg?a=1&b=2",
    fallbackSrc: "/review/front/review_thumbnail.webp",
    thumbId: "event-1",
  });

  assert.match(html, /src="\/event\/thumbnail\.jpg\?a=1&amp;b=2"/);
  assert.match(html, /data-thumb-primary-src="\/event\/thumbnail\.jpg\?a=1&amp;b=2"/);
  assert.match(html, /data-thumb-fallback-src="\/review\/front\/review_thumbnail\.webp"/);
  assert.match(html, /data-thumb-fallback-attempted/);
  assert.doesNotMatch(
    buildBrowseThumbnailImageMarkup({ src: "/event/thumbnail.jpg" }),
    / data-thumb-fallback-src="/,
  );
});

test("a preserved failed event thumbnail starts a newly available review fallback", () => {
  const current = createImage(
    {
      src: "/event/thumbnail.jpg",
      "data-thumb-primary-src": "/event/thumbnail.jpg",
      "data-thumb-id": "event-1",
    },
    { display: "none" },
  );
  const next = createImage({
    src: "/event/thumbnail.jpg",
    "data-thumb-primary-src": "/event/thumbnail.jpg",
    "data-thumb-id": "event-1",
    "data-thumb-fallback-src": "/review/front/review_thumbnail.webp",
  });

  assert.equal(syncPreservedBrowseThumbnail(current, next), true);
  assert.equal(
    current.getAttribute("src"),
    "/review/front/review_thumbnail.webp",
  );
  assert.equal(current.getAttribute("data-thumb-fallback-attempted"), "1");
  assert.equal(current.style.display, "");
  assert.equal(current.nextElementSibling.style.display, "none");
});

test("an already failed review fallback is preserved without retrying", () => {
  const attributes = {
    src: "/review/front/review_thumbnail.webp",
    "data-thumb-primary-src": "/event/thumbnail.jpg",
    "data-thumb-id": "event-1",
    "data-thumb-fallback-src": "/review/front/review_thumbnail.webp",
    "data-thumb-fallback-attempted": "1",
  };
  const current = createImage(attributes, { display: "none" });
  const next = createImage({
    ...attributes,
    src: "/event/thumbnail.jpg",
    "data-thumb-fallback-attempted": undefined,
  });

  assert.equal(syncPreservedBrowseThumbnail(current, next), true);
  assert.equal(
    current.getAttribute("src"),
    "/review/front/review_thumbnail.webp",
  );
  assert.equal(current.style.display, "none");
});
