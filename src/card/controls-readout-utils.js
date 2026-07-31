import {
  buildControlsReadoutEmptyMarkup,
  buildControlsReadoutLinesMarkup,
} from "./shell-nav-markup.js";

export function normalizeControlsReadoutLine(text) {
  return String(text || "").trim();
}

export function appendControlsReadoutLine(lines, text, maxLines = 200) {
  const line = normalizeControlsReadoutLine(text);
  if (!line) {
    return lines || [];
  }

  const nextLines = [...(lines || []), line];
  return nextLines.slice(-Math.max(1, Number(maxLines) || 1));
}

export function clearControlsReadoutLines() {
  return [];
}

export function resolveControlsReadoutMarkup(lines, escapeText) {
  if (!Array.isArray(lines) || lines.length === 0) {
    return buildControlsReadoutEmptyMarkup();
  }

  const escapedLines = lines.map((line) =>
    typeof escapeText === "function" ? escapeText(line) : String(line || ""),
  );
  return buildControlsReadoutLinesMarkup(escapedLines);
}
