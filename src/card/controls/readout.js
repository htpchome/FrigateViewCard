import {
  buildControlsReadoutEmptyMarkup,
  buildControlsReadoutLinesMarkup,
} from "./shell-nav.tmpl.js";

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

const eventTargetMatchesControlsPad = (target) =>
  target instanceof Element && target.id === "controls-pad";

export function isControlsPadTarget(targetOrEvent) {
  if (eventTargetMatchesControlsPad(targetOrEvent)) return true;
  const path = targetOrEvent?.composedPath?.();
  return Array.isArray(path) && path.some(eventTargetMatchesControlsPad);
}

export function isControlsReadoutClearTarget(target) {
  return (
    target instanceof Element && !!target.closest("#controls-readout-clear")
  );
}

export function resolveControlsPadPressReadoutEntry(event) {
  if (!isControlsPadTarget(event)) return "";
  const action = event?.detail?.action;
  return action ? `[${action}]` : "";
}

export function resolveControlsPadToggleReadoutEntry(event) {
  if (!isControlsPadTarget(event)) return "";
  if (event?.detail?.action !== "mic") return "";
  return event?.detail?.active ? "[mic:on]" : "[mic:off]";
}

export function resolveControlsReadoutMarkup(lines, escapeText, emptyMessage) {
  if (!Array.isArray(lines) || lines.length === 0) {
    return buildControlsReadoutEmptyMarkup(
      typeof emptyMessage === "string" ? emptyMessage : undefined,
    );
  }

  const escapedLines = lines.map((line) =>
    typeof escapeText === "function" ? escapeText(line) : String(line || ""),
  );
  return buildControlsReadoutLinesMarkup(escapedLines);
}
