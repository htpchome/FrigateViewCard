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

export function resolveOlderHintMetrics({ list, browse }) {
  const listScrollable =
    !!list &&
    Number(list.scrollHeight || 0) > Number(list.clientHeight || 0) + 2;
  const scroller = listScrollable ? list : browse;
  const scrollTop = Number(scroller?.scrollTop || 0);
  const sample = list?.querySelector(".list-item, .rev, .rec");
  const itemHeight = Number(sample?.getBoundingClientRect?.().height || 60);
  return {
    scrollTop,
    itemHeight,
  };
}

export function applyOlderHintDomState(hintEl, state) {
  if (!hintEl || !state) return;

  hintEl.hidden = !!state.hidden;
  hintEl.classList.toggle("to-top", !!state.isToTop);
  hintEl.textContent = String(state.text || "");

  if (state.isButton) {
    hintEl.setAttribute("role", "button");
    hintEl.setAttribute("tabindex", "0");
    return;
  }

  hintEl.removeAttribute("role");
  hintEl.removeAttribute("tabindex");
}

export function resolveActiveDayLabelFromScroll({ list, browse }) {
  if (!list || !browse) return "";

  const labels = Array.from(list.querySelectorAll(".list-day-label"));
  if (!labels.length) return "";

  const listScrollable =
    Number(list.scrollHeight || 0) > Number(list.clientHeight || 0) + 2;
  const scroller = listScrollable ? list : browse;
  const anchorTop = Number(scroller.getBoundingClientRect().top || 0) + 2;
  let active = labels[0];
  for (const dayLabel of labels) {
    if (Number(dayLabel.getBoundingClientRect().top || 0) <= anchorTop) {
      active = dayLabel;
    } else {
      break;
    }
  }

  return String(active?.dataset?.dayLabel || active?.textContent || "");
}

export function runListPostRenderSync({
  syncBrowseHead,
  syncOlderHint,
  forceHide = null,
  scheduleDeferredOlderHint = false,
}) {
  if (typeof syncBrowseHead === "function") {
    syncBrowseHead();
  }
  if (typeof syncOlderHint !== "function") return;

  syncOlderHint(forceHide);
  if (!scheduleDeferredOlderHint) return;

  requestAnimationFrame(() => syncOlderHint(forceHide));
  setTimeout(() => syncOlderHint(forceHide), 200);
}

export function resolveListMarkup({
  items,
  emptyMessage,
  emptyHint = "",
  buildContentHtml,
}) {
  const hasItems = Array.isArray(items) && items.length > 0;
  if (!hasItems) {
    return {
      isEmpty: true,
      html: buildEmptyListMessageHtml(emptyMessage, emptyHint),
    };
  }

  const html =
    typeof buildContentHtml === "function" ? buildContentHtml(items) : "";
  return {
    isEmpty: false,
    html: String(html || ""),
  };
}

export function resolveListLabelTimestamp(items, fallbackTs = null) {
  const ts = items?.[0]?.start_time;
  return ts || fallbackTs || null;
}

export function applyListMarkupWithOlderHint({
  setHtml,
  html,
  isEmpty,
  syncOlderHint,
  emptyForceHide = null,
  contentForceHide = null,
  syncOnContent = true,
}) {
  if (typeof setHtml === "function") {
    setHtml(html);
  }

  if (isEmpty) {
    if (typeof syncOlderHint === "function") {
      syncOlderHint(emptyForceHide);
    }
    return false;
  }

  if (syncOnContent && typeof syncOlderHint === "function") {
    syncOlderHint(contentForceHide);
  }
  return true;
}

export function createOlderHintSyncer(syncOlderHint) {
  return (forceHide = null) => {
    if (typeof syncOlderHint === "function") {
      syncOlderHint(forceHide);
    }
  };
}
