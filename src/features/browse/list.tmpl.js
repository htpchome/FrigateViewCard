import {
  appendEndMarker,
  buildStickyDaySectionsHtml,
} from "../../shared/list-render.js";

const STICKY_DAY_TABS = Object.freeze(["alerts", "clips", "snapshot"]);

export function resolveBrowseListHeadingLabel({
  tab = "",
  timestamp = null,
  getWeekday,
  getMonthDay,
  capitalize,
} = {}) {
  const fallback =
    {
      recordings: "Recordings",
      clips: "Recent Clips",
      snapshot: "Recent Snaps",
      alerts: "Recent Alerts",
      kept: "Kept",
    }[tab] || capitalize(tab || "");
  if (!timestamp || !STICKY_DAY_TABS.includes(tab)) return fallback;
  return `${getWeekday(timestamp)} - ${getMonthDay(timestamp, {
    ordinal: true,
  })} - ${fallback}`;
}

export function resolveBrowseRecordingsHeadingLabel({
  timestamp = null,
  windowEnd = null,
  nowSec,
  getWeekday,
  getMonthDay,
} = {}) {
  const target = Math.floor(timestamp || windowEnd || nowSec);
  return `${getWeekday(target)} - ${getMonthDay(target, {
    ordinal: true,
  })} - Recordings`;
}

export function resolveBrowseControlsHeadingLabel({
  cameraName,
  ptzReady = false,
} = {}) {
  return `${cameraName} · ${ptzReady ? "Frigate PTZ ready" : "PTZ unavailable"}`;
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
  return appendEndMarker(content, exhausted);
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
        `<span class="lg"><i style="background:${getLabelColor(label)}"></i>${capitalize(label)}</span>`,
    )
    .join("");
  if (eventsMode === "all") {
    cameras.forEach((camera, index) => {
      const color = cameraColors[index % cameraColors.length];
      html += `<span class="lg"><i style="background:${opaqueCameraColor(color)}"></i>${getCameraName(camera)} rec</span>`;
    });
  } else {
    html += `<span class="lg"><i style="background:${opaqueCameraColor(cameraColors[0])}"></i>Rec</span>`;
  }
  return html;
}
