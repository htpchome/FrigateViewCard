import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import fs from "node:fs";
import test from "node:test";

const repositoryFile = (path) => new URL(`../${path}`, import.meta.url);

test("HACS release artifact is generated under dist", () => {
  const manifest = JSON.parse(
    fs.readFileSync(repositoryFile("hacs.json"), "utf8"),
  );
  const packageJson = JSON.parse(
    fs.readFileSync(repositoryFile("package.json"), "utf8"),
  );

  assert.equal(manifest.filename, "frigate-view-card.js");
  assert.equal(manifest.content_in_root, false);
  assert.match(packageJson.scripts.check, /dist\/frigate-view-card\.js/);
  assert.equal(fs.existsSync(repositoryFile("dist/frigate-view-card.js")), true);
  assert.equal(
    fs.existsSync(repositoryFile("dist/frigate-view-card-editor.js")),
    true,
  );
  assert.equal(
    fs.existsSync(
      repositoryFile("dist/frigate-view-card-hls-1.5.17.js"),
    ),
    true,
  );
  assert.equal(
    fs.existsSync(
      repositoryFile("dist/frigate-view-card-hls-1.5.17.LICENSE.txt"),
    ),
    true,
  );
  assert.equal(fs.existsSync(repositoryFile("frigate-view-card.js")), false);
});

test("HACS release artifact is production-minified", () => {
  const bundle = fs.readFileSync(
    repositoryFile("dist/frigate-view-card.js"),
    "utf8",
  );
  const [banner] = bundle.split("\n", 1);

  assert.match(banner, /^\/\*\* FrigateView Card - generated file\./);
  assert.ok(Buffer.byteLength(bundle) < 1_500_000);
  assert.match(bundle, /frigate-view-card-hls-1\.5\.17\.js/);
  assert.match(bundle, /frigate-view-card-editor\.js/);
});

test("lazy HLS release asset matches the pinned integrity hash", () => {
  const hlsAsset = fs.readFileSync(
    repositoryFile("dist/frigate-view-card-hls-1.5.17.js"),
  );
  const integrity = createHash("sha384").update(hlsAsset).digest("base64");

  assert.equal(
    integrity,
    "9v3HcdYrO3D+OPDTjZ40RXocgE4GtXVCd3/mCS62JsM93JXgI1afJVuwjFvsu6ni",
  );
});
