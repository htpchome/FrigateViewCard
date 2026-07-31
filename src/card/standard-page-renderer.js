import { CAM_COLORS, cap, camDisplayName, labelColor } from "../helpers.js";
import {
  buildCamSwitcherMarkup,
  resolveSubtitleText,
} from "./shell-nav-markup.js";
import {
  buildMobileViewCamSwitcherMarkup,
  resolveMobileViewEventsCountText,
  resolveMobileViewOnlineLabel,
  resolveMobileViewStatusColor,
  resolveMobileViewStreamTypeText,
  resolveMobileViewSubtitleText,
  resolveMobileViewTitleText,
} from "../mobile-view/mobile-view-page-markup.js";
import { ICONS } from "../icons.js";

function cameraName(camera) {
  return cap(camDisplayName(camera));
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
  };
  return mobile
    ? buildMobileViewCamSwitcherMarkup(args)
    : buildCamSwitcherMarkup(args);
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
    : resolveSubtitleText(host._config);
}

export function renderStandardPageSubtitle(host, { mobile = false } = {}) {
  const el = host._$("#tl-range");
  if (!el) return;
  el.textContent = standardPageSubtitleText(host, { mobile });
}

export function renderStandardPageLegend(host) {
  const el = host._$("#legend");
  if (!el) return;
  const labels = host._labels();
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
