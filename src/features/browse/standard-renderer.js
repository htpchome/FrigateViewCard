import { CAM_COLORS, cap, camDisplayName, labelColor } from "../../helpers.js";
import {
  appendEndMarker,
  buildStickyDaySectionsHtml,
  resolveActiveDayLabelFromScroll,
} from "../../shared/list-render.js";
import {
  buildMobileViewCamSwitcherMarkup,
  resolveMobileViewEventsCountText,
  resolveMobileViewOnlineLabel,
  resolveMobileViewStatusColor,
  resolveMobileViewStreamTypeText,
  resolveMobileViewSubtitleText,
  resolveMobileViewTitleText,
} from "../mobile-view/page.tmpl.js";
import { ICONS } from "../../icons.js";

function cameraName(camera) {
  return cap(camDisplayName(camera));
}

function buildStandardCamSwitcherButtons({
  previewPageEnabled,
  includeStatus,
  cameras,
  activeCamIdx,
  isSingleView,
  icons,
  getCameraName,
  isCameraAvailable,
}) {
  const backButton = previewPageEnabled
    ? `<button class="glass-btn cam-tab preview-back-btn" type="button" data-preview-back title="Back to preview page" aria-label="Back to preview page">${icons.left} Back</button>`
    : "";
  const cameraButtons = (cameras || [])
    .map((camera, index) => {
      const name = getCameraName(camera);
      const active = isSingleView && index === activeCamIdx;
      const ok = !includeStatus || isCameraAvailable(camera);
      return `<button class="glass-btn cam-tab shadow-small ${active ? "active" : ""}" data-camidx="${index}"><span class="cam-dot" style="color:${ok ? "#4ade80" : "#ef4444"}">●</span> ${name}</button>`;
    })
    .join("");
  return `${backButton}${cameraButtons}`;
}

export function buildStandardPageCamSwitcherMarkup(
  host,
  { includeStatus = true, mobile = false } = {},
) {
  const args = {
    previewPageEnabled: host._isPreviewPageEnabled?.() === true,
    includeStatus,
    cameras: host._config.cameras,
    activeCamIdx: host._activeCamIdx,
    isSingleView: host._viewMode === "single",
    icons: ICONS,
    getCameraName: cameraName,
    isCameraAvailable: (camera) =>
      host._hass?.states?.[camera.entity]?.state !== "unavailable",
    pickerOpen: host._mobileCamSwitcherOpen === true,
  };
  return mobile
    ? buildMobileViewCamSwitcherMarkup(args)
    : buildStandardCamSwitcherButtons(args);
}

export function renderStandardPageCamSwitcher(host, { mobile = false } = {}) {
  const el = host._$("#cam-switcher");
  if (!el) return;
  if (
    host._config.cameras.length < 2 &&
    host._isPreviewPageEnabled?.() !== true
  ) {
    el.style.display = "none";
    return;
  }
  el.style.display = "";
  el.innerHTML = `${buildStandardPageCamSwitcherMarkup(host, {
    includeStatus: true,
    mobile,
  })}`;
}

export function syncStandardPageStatus(host, { mobile = false } = {}) {
  const ent = host._hass?.states?.[host._activeCam?.entity];
  if (!ent) return;
  const dot = host._$("#on-dot");
  const lbl = host._$("#on-lbl");
  const title = host._$("#info-title");
  const ok = ent.state !== "unavailable";
  if (dot) {
    dot.style.color = mobile
      ? resolveMobileViewStatusColor(ok)
      : ok
        ? "#4ade80"
        : "#ef4444";
  }
  if (lbl) {
    lbl.textContent = mobile
      ? resolveMobileViewOnlineLabel(ok)
      : ok
        ? "Online"
        : "Offline";
  }
  if (title) {
    const activeCamera = host._activeCam;
    const titleText = mobile
      ? resolveMobileViewTitleText({
          title: host._config.title,
          cameras: host._config.cameras,
          activeCamera,
          getCameraName: cameraName,
        })
      : host._config.title ||
        (host._config.cameras.length > 1 ? cameraName(activeCamera) : "Camera");
    title.textContent = titleText;
  }
}

export function renderStandardPageStats(host, { mobile = false } = {}) {
  const eventsCount = host._allDisplayEvents().length;
  const eventCountEl = host._$("#ev-count");
  if (eventCountEl) {
    eventCountEl.textContent = mobile
      ? resolveMobileViewEventsCountText(eventsCount)
      : String(eventsCount);
  }
  const streamEl = host._$("#stream-type");
  if (streamEl) {
    streamEl.textContent = mobile
      ? resolveMobileViewStreamTypeText(host._activeStreamType)
      : host._activeStreamType || "--";
  }
}

export function standardPageSubtitleText(host, { mobile = false } = {}) {
  return mobile
    ? resolveMobileViewSubtitleText(host._config)
    : host._config?.subtitle || "Frigate";
}

export function renderStandardPageSubtitle(host, { mobile = false } = {}) {
  const el = host._$("#tl-range");
  if (!el) return;
  el.textContent = standardPageSubtitleText(host, { mobile });
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

export function renderStandardPageListLabel(host, ts = null) {
  const labelEl = host._$("#browse-head-label");
  const browseHead = host._$("#browse-head");
  const prev = host._$("#rec-day-prev");
  const next = host._$("#rec-day-next");
  if (!labelEl || !browseHead) return;

  browseHead.style.display = "flex";
  if (host._tab === "recordings") {
    labelEl.textContent = standardPageRecordingsHeadingLabel(
      host,
      ts || host._winEnd,
    );
    const showButtons = !host._$("#card")?.classList.contains("mobile");
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

  const list = host._$("#list");
  const browse = host._$("#browse");
  const label = host._$("#browse-head-label");
  if (!list || !browse || !label) return;

  const nextLabel = resolveActiveDayLabelFromScroll({ list, browse });
  if (nextLabel) {
    label.textContent = nextLabel;
  }
}

export function renderStandardPageLegend(host) {
  const el = host._$("#legend");
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
