export function buildEmptyListMessageHtml(message, hint = "") {
  const base = String(message || "").trim();
  const extra = String(hint || "").trim();
  if (!extra) return `<div class="empty">${base}</div>`;
  return `<div class="empty">${base}<br><span style="opacity:.6">${extra}</span></div>`;
}

export function appendEndMarker(html, isExhausted) {
  return `${String(html || "")}${isExhausted ? '<div class="end">— end —</div>' : ""}`;
}

export function buildStickyDaySectionsHtml(items, deps) {
  const { getStartTime, getDayKey, getLabel, renderItem } = deps || {};

  let currentDay = null;
  const sections = [];
  for (const item of items || []) {
    const ts = getStartTime(item);
    const dayKey = getDayKey(ts || 0);
    if (dayKey !== currentDay) {
      currentDay = dayKey;
      sections.push({
        ts: Math.floor(ts || 0),
        label: getLabel(ts || null),
        rows: [],
      });
    }
    sections[sections.length - 1].rows.push(renderItem(item));
  }

  return sections
    .map((section, idx) => {
      const extraClass = idx === 0 ? " list-day-label-first" : "";
      const ts = Number.isFinite(section.ts) ? Math.floor(section.ts) : 0;
      return `<section class="list-day-sec"><div class="list-day-label${extraClass}" data-day-ts="${ts}" data-day-label="${section.label}">${section.label}</div>${section.rows.join("")}</section>`;
    })
    .join("");
}

export function resolveOlderHintState({
  forceHide = null,
  tab = "",
  scrollTop = 0,
  itemHeight = 60,
}) {
  if (forceHide === true) {
    return {
      hidden: true,
      isToTop: false,
      text: "scroll for older…",
      isButton: false,
    };
  }

  const supportsHint = ["clips", "snapshot", "alerts", "recordings"].includes(
    String(tab || ""),
  );
  const canShowHint = forceHide !== false && supportsHint;
  if (!canShowHint) {
    return {
      hidden: true,
      isToTop: false,
      text: "scroll for older…",
      isButton: false,
    };
  }

  const showTop =
    Number(scrollTop || 0) >= Math.max(120, Number(itemHeight || 60) * 3.5);
  return {
    hidden: false,
    isToTop: showTop,
    text: showTop ? "Click to return to top" : "scroll for older…",
    isButton: showTop,
  };
}
