import { build, transform } from "esbuild";
import {
  chmod,
  copyFile,
  mkdir,
  stat,
  writeFile,
} from "node:fs/promises";

const outputFile = "dist/frigate-view-card.js";
const editorOutputFile = "dist/frigate-view-card-editor.js";
const hlsOutputFile = "dist/frigate-view-card-hls-1.5.17.js";
const hlsLicenseOutputFile =
  "dist/frigate-view-card-hls-1.5.17.LICENSE.txt";
const outputBanner =
  "/** FrigateView Card - generated file. Edit src/ instead. */";

const buildBundle = async ({ entryPoint, outfile }) => {
  const { outputFiles } = await build({
    entryPoints: [entryPoint],
    bundle: true,
    format: "esm",
    target: "es2020",
    treeShaking: false,
    outfile,
    write: false,
    logLevel: "silent",
  });
  const bundled = outputFiles[0]?.text;
  if (!bundled) throw new Error(`esbuild did not produce ${outfile}`);
  const modernized = bundled
    .replace(/^var\s+/gm, "const ")
    .replaceAll("/* @__PURE__ */ ", "");
  const { code: minified } = await transform(modernized, {
    loader: "js",
    format: "esm",
    target: "es2020",
    minify: true,
    legalComments: "none",
  });
  const output = `${outputBanner}\n${minified}`;
  await writeFile(outfile, output, "utf8");
  return output;
};

await mkdir("dist", { recursive: true });
const editorOutput = await buildBundle({
  entryPoint: "src/editor/index.js",
  outfile: editorOutputFile,
});
// Write the watched runtime artifact last so dev sync never copies a stale
// editor bundle alongside a newly built card.
const output = await buildBundle({
  entryPoint: "src/index.js",
  outfile: outputFile,
});
// Keep HLS.js outside the startup bundle. Runtime loads it only when native HLS
// is unavailable and the selected recording source requires it.
await copyFile("node_modules/hls.js/dist/hls.min.js", hlsOutputFile);
await copyFile("node_modules/hls.js/LICENSE", hlsLicenseOutputFile);
await chmod(hlsOutputFile, 0o644);
await chmod(hlsLicenseOutputFile, 0o644);

const outputSizeKib = (Buffer.byteLength(output) / 1024).toFixed(1);
const editorOutputSizeKib = (
  Buffer.byteLength(editorOutput) / 1024
).toFixed(1);
const hlsOutputSizeKib = ((await stat(hlsOutputFile)).size / 1024).toFixed(1);
console.info(`  ${outputFile}  ${outputSizeKib} KiB (minified)`);
console.info(`  ${editorOutputFile}  ${editorOutputSizeKib} KiB (lazy)`);
console.info(`  ${hlsOutputFile}  ${hlsOutputSizeKib} KiB (lazy)`);
