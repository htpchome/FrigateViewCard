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
