import { build } from "esbuild";
import { readFile, writeFile } from "node:fs/promises";

await build({
  entryPoints: ["src/index.js"],
  bundle: true,
  format: "esm",
  target: "es2020",
  treeShaking: false,
  outfile: "frigate-view-card.js",
  banner: {
    js: "/** FrigateView Card - generated file. Edit src/ instead. */",
  },
  logLevel: "info",
});

const outputFile = "frigate-view-card.js";
const generated = await readFile(outputFile, "utf8");
const modernized = generated
  .replace(/^var\s+/gm, "const ")
  .replaceAll("/* @__PURE__ */ ", "");

await writeFile(outputFile, modernized, "utf8");
