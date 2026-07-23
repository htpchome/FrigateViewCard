export function buildEmptyListMessageHtml(message, hint = "") {
  const base = String(message || "").trim();
  const extra = String(hint || "").trim();
  if (!extra) return `<div class="empty">${base}</div>`;
  return `<div class="empty">${base}<br><span style="opacity:.6">${extra}</span></div>`;
}

export function appendEndMarker(html, isExhausted) {
  return `${String(html || "")}${isExhausted ? '<div class="end">— end —</div>' : ""}`;
}
