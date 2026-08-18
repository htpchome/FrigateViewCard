import { CAM_COLORS, cap, camDisplayName, labelColor } from "../../helpers.js";
import {
  appendEndMarker,
  buildStickyDaySectionsHtml,
  resolveActiveDayLabelFromScroll,
} from "../../shared/list-render.js";
import {
  hasCameraPtz,
  hasPtzFocusCapability,
  hasPtzPanTiltCapability,
  hasPtzZoomCapability,
} from "../ptz/index.js";

function cameraName(camera) {
  return cap(camDisplayName(camera));
}

export function standardPageListHeadingLabel(host, ts = null) {
  const fallback =
    {
      recordings: "Recordings",
      clips: "Recent Clips",
      snapshot: "Recent Snaps",
      alerts: "Recent Alerts",
      kept: "Kept",
    }[host._tab] || cap(host._tab || "");
  if (!ts || !["alerts", "clips", "snapshot"].includes(host._tab)) {
    return fallback;
  }
  return `${host._weekday(ts)} - ${host._monthDay(ts, { ordinal: true })} - ${fallback}`;
}

export function standardPageRecordingsHeadingLabel(host, ts = null) {
  const target = Math.floor(ts || host._winEnd || Date.now() / 1000);
  return `${host._weekday(target)} - ${host._monthDay(target, { ordinal: true })} - Recordings`;
}

export function standardPageControlsHeadingLabel(host) {
  const camera = host._activeCam || {};
  const ptzInfo = host._activeCameraPtzInfo?.() || null;
  const ptzConfigured = hasCameraPtz(camera);
  const ptzReady =
    ptzConfigured &&
    (hasPtzPanTiltCapability(ptzInfo) ||
      hasPtzZoomCapability(ptzInfo) ||
      hasPtzFocusCapability(ptzInfo));
  return `${cameraName(camera)} · ${ptzReady ? "Frigate PTZ ready" : "PTZ unavailable"}`;
}

export function renderStandardPageListLabel(host, ts = null) {
  const browseHead = host._pageShellRegion("browseHeader");
  const labelEl = host._pageShellRegionElement(
    "browseHeader",
    "#browse-head-label",
  );
  const prev = host._pageShellRegionElement("browseHeader", "#rec-day-prev");
  const next = host._pageShellRegionElement("browseHeader", "#rec-day-next");
  if (!labelEl || !browseHead) return;

  browseHead.style.display = "flex";
  if (host._tab === "recordings") {
    labelEl.textContent = standardPageRecordingsHeadingLabel(
      host,
      ts || host._winEnd,
    );
    const mobilePhoneViewport = host._isMobilePhoneViewport?.() === true;
    const showButtons = !mobilePhoneViewport;
    if (prev) prev.style.display = showButtons ? "inline-flex" : "none";
    if (next) next.style.display = showButtons ? "inline-flex" : "none";
    void (
      host._recordingsBrowseNavController?.updateBrowseNav?.() ??
      host._updateRecordingsBrowseNav?.()
    );
    return;
  }

  if (prev) prev.style.display = "none";
  if (next) next.style.display = "none";
  if (host._tab === "controls") {
    labelEl.textContent = standardPageControlsHeadingLabel(host);
    return;
  }
  labelEl.textContent = standardPageListHeadingLabel(host, ts);
}

export function standardPageShowStickyDayHeaders(host) {
  return ["alerts", "clips", "snapshot"].includes(host._tab);
}

export function renderStandardPageStickyDaySections(host, items, renderItem) {
  return buildStickyDaySectionsHtml(items, {
    getStartTime: (item) => item?.start_time,
    getDayKey: (ts) => host._dayKey(ts),
    getLabel: (ts) => standardPageListHeadingLabel(host, ts),
    renderItem,
  });
}

export function renderStandardPageEventsContent(host, items) {
  const content = standardPageShowStickyDayHeaders(host)
    ? renderStandardPageStickyDaySections(host, items, (item) =>
        host._eventCardHTML(item, false),
      )
    : items.map((item) => host._eventCardHTML(item, false)).join("");
  return appendEndMarker(content, host._exhausted);
}

export function renderStandardPageKeptContent(host, items) {
  return items.map((item) => host._eventCardHTML(item, false)).join("");
}

export function renderStandardPageReviewsContent(host, items) {
  return renderStandardPageStickyDaySections(host, items, (item) =>
    host._reviewListItemHTML(item),
  );
}

export function syncStandardPageBrowseHeadFromScroll(host) {
  if (!standardPageShowStickyDayHeaders(host)) return;

  const browse = host._pageShellRegion("browse");
  const list = host._pageShellRegionElement("browse", "#list");
  const label = host._pageShellRegionElement(
    "browseHeader",
    "#browse-head-label",
  );
  if (!list || !browse || !label) return;

  const nextLabel = resolveActiveDayLabelFromScroll({ list, browse });
  if (nextLabel) {
    label.textContent = nextLabel;
  }
}

export function renderStandardPageLegend(host) {
  const el = host._pageShellRegionElement("filterPanel", "#legend");
  if (!el) return;
  const labels =
    host._browseFilterController?.labels?.() ?? host._labels?.() ?? [];
  let html = labels
    .map(
      (label) =>
        `<span class="lg"><i style="background:${labelColor(label)}"></i>${cap(label)}</span>`,
    )
    .join("");
  if (host._eventsMode === "all") {
    host._config.cameras.forEach((camera, index) => {
      html += `<span class="lg"><i style="background:${CAM_COLORS[index % CAM_COLORS.length].replace(".5", "1").replace("rgba", "rgb").replace(",1)", ")")}"></i>${cameraName(camera)} rec</span>`;
    });
  } else {
    html += `<span class="lg"><i style="background:${CAM_COLORS[0].replace(".5", "1").replace("rgba", "rgb").replace(",1)", ")")}"></i>Rec</span>`;
  }
  el.innerHTML = html;
}
