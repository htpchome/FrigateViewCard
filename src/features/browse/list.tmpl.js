import { buildStickyDaySectionsHtml } from "../../shared/list-render.js";
import { escapeHtml, escapeHtmlAttribute } from "../../shared/html.js";

const STICKY_DAY_TABS = Object.freeze(["alerts", "clips", "snapshot"]);

export function resolveBrowseListHeadingLabel({
  tab = "",
  timestamp = null,
  getWeekday,
  getMonthDay,
  capitalize,
  t,
} = {}) {
  const heading =
    {
      recordings: ["runtime.browse.recordings", "Recordings"],
      clips: ["runtime.browse.recentClips", "Recent Clips"],
      snapshot: ["runtime.browse.recentSnaps", "Recent Snaps"],
      alerts: ["runtime.browse.recentAlerts", "Recent Alerts"],
      kept: ["runtime.browse.favorites", "Favorites"],
    }[tab];
  const fallback = heading
    ? t?.(heading[0]) || heading[1]
    : capitalize(tab || "");
  if (!timestamp || !STICKY_DAY_TABS.includes(tab)) return fallback;
  const weekday = getWeekday(timestamp);
  const date = getMonthDay(timestamp, {
    ordinal: true,
  });
  return t?.("runtime.browse.datedHeading", {
    weekday,
    date,
    title: fallback,
  }) || `${weekday} - ${date} - ${fallback}`;
}

export function resolveBrowseRecordingsHeadingLabel({
  timestamp = null,
  windowEnd = null,
  nowSec,
  getWeekday,
  getMonthDay,
  t,
} = {}) {
  const target = Math.floor(timestamp || windowEnd || nowSec);
  const weekday = getWeekday(target);
  const date = getMonthDay(target, {
    ordinal: true,
  });
  const title = t?.("runtime.browse.recordings") || "Recordings";
  return t?.("runtime.browse.datedHeading", {
    weekday,
    date,
    title,
  }) || `${weekday} - ${date} - ${title}`;
}

export function resolveBrowseControlsHeadingLabel({
  cameraName,
  ptzReady = false,
  t,
} = {}) {
  const key = ptzReady
    ? "runtime.browse.ptzReady"
    : "runtime.browse.ptzUnavailable";
  const fallback = ptzReady ? "Frigate PTZ ready" : "PTZ unavailable";
  return `${cameraName} · ${t?.(key) || fallback}`;
}

export function buildBrowseEmptyMarkup({
  message = "",
  messageKey = "",
  hint = "",
  hintKey = "",
} = {}) {
  const messageAttribute = messageKey
    ? ` data-fvc-i18n="${escapeHtmlAttribute(messageKey)}"`
    : "";
  if (!hint) {
    return `<div class="empty"${messageAttribute}>${escapeHtml(message)}</div>`;
  }
  const hintAttribute = hintKey
    ? ` data-fvc-i18n="${escapeHtmlAttribute(hintKey)}"`
    : "";
  return `<div class="empty"><span${messageAttribute}>${escapeHtml(message)}</span><br><span style="opacity:.6"${hintAttribute}>${escapeHtml(hint)}</span></div>`;
}

export function shouldShowBrowseStickyDayHeaders(tab) {
  return STICKY_DAY_TABS.includes(tab);
}

export function buildBrowseStickyDaySectionsMarkup({
  items = [],
  getDayKey,
  getLabel,
  renderItem,
} = {}) {
  return buildStickyDaySectionsHtml(items, {
    getStartTime: (item) => item?.start_time,
    getDayKey,
    getLabel,
    renderItem,
  });
}

export function buildBrowseEventsContentMarkup({
  items = [],
  showStickyDayHeaders = false,
  getDayKey,
  getLabel,
  renderItem,
  exhausted = false,
} = {}) {
  const content = showStickyDayHeaders
    ? buildBrowseStickyDaySectionsMarkup({
        items,
        getDayKey,
        getLabel,
        renderItem,
      })
    : items.map((item) => renderItem(item)).join("");
  return `${content}${exhausted ? '<div class="end" data-fvc-i18n="runtime.browse.end">— end —</div>' : ""}`;
}

export function buildBrowseKeptContentMarkup({
  items = [],
  renderItem,
} = {}) {
  return items.map((item) => renderItem(item)).join("");
}

export function buildBrowseReviewsContentMarkup({
  items = [],
  getDayKey,
  getLabel,
  renderItem,
} = {}) {
  return buildBrowseStickyDaySectionsMarkup({
    items,
    getDayKey,
    getLabel,
    renderItem,
  });
}

const opaqueCameraColor = (color) =>
  String(color || "")
    .replace(".5", "1")
    .replace("rgba", "rgb")
    .replace(",1)", ")");

export function buildBrowseLegendMarkup({
  labels = [],
  cameras = [],
  eventsMode = "",
  cameraColors = [],
  getLabelColor,
  capitalize,
  getCameraName,
} = {}) {
  let html = labels
    .map(
      (label) =>
        `<span class="lg"><i style="background:${escapeHtmlAttribute(getLabelColor(label))}"></i>${escapeHtml(capitalize(label))}</span>`,
    )
    .join("");
  if (eventsMode === "all") {
    cameras.forEach((camera, index) => {
      const color = cameraColors[index % cameraColors.length];
      html += `<span class="lg"><i style="background:${escapeHtmlAttribute(opaqueCameraColor(color))}"></i>${escapeHtml(getCameraName(camera))} rec</span>`;
    });
  } else {
    html += `<span class="lg"><i style="background:${escapeHtmlAttribute(opaqueCameraColor(cameraColors[0]))}"></i>Rec</span>`;
  }
  return html;
}
