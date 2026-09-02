import { wideTimelineStackVisualDepth } from "./timeline.model.js";

const escapeHtml = (value) =>
  String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

const rounded = (value) => Math.round(Number(value) * 100) / 100;

export const buildWideTimelinePanelMarkup = ({
  icons = {},
  open = false,
  scaleHours = 12,
} = {}) => `<aside class="wide-timeline-panel" id="wide-timeline-panel" data-fvc-region="timeline" aria-label="Camera event timeline" aria-hidden="${open ? "false" : "true"}">
    <div class="wide-timeline-header">
      <div class="wide-timeline-heading">
        <span>Timeline</span>
        <span class="wide-timeline-day" id="wide-timeline-day"></span>
      </div>
      <div class="wide-timeline-scale" role="group" aria-label="Timeline scale">
        <button type="button" data-wide-timeline-scale="in" title="Show less time" aria-label="Show less time">−</button>
        <output id="wide-timeline-scale-output" aria-live="polite">${scaleHours}h</output>
        <button type="button" data-wide-timeline-scale="out" title="Show more time" aria-label="Show more time">+</button>
      </div>
    </div>
    <div class="wide-timeline-viewport" id="wide-timeline-viewport" tabindex="0" aria-label="Scrollable event timeline">
      <div class="wide-timeline-content" id="wide-timeline-content"></div>
    </div>
  </aside>
  <button class="wide-timeline-toggle" id="wide-timeline-toggle" type="button" data-wide-timeline-toggle aria-controls="wide-timeline-panel" aria-expanded="${open ? "true" : "false"}" title="${open ? "Drag to resize or click to collapse Timeline" : "Open Timeline"}" aria-label="${open ? "Collapse Timeline" : "Open Timeline"}">${open ? icons.left || "" : icons.right || ""}</button>`;

const buildTimelineTickMarkup = (tick) => {
  const y = rounded(tick.y);
  const minorClass = tick.minor ? " is-minor" : "";
  return `<div class="wide-timeline-tick${tick.dayLabel ? " is-day-start" : ""}${minorClass}" style="--timeline-y:${y}px">
      ${tick.timeLabel ? `<span class="wide-timeline-tick-time">${escapeHtml(tick.timeLabel)}</span>` : ""}
      <span class="wide-timeline-tick-mark" aria-hidden="true"></span>
      ${tick.dayLabel ? `<span class="wide-timeline-day-divider">${escapeHtml(tick.dayLabel)}</span>` : ""}
    </div>`;
};

const buildTimelineMarkerMarkup = (entry) =>
  `<span class="wide-timeline-marker is-${entry.kind}" style="--timeline-marker-y:${rounded(entry.markerY)}px" title="${escapeHtml(entry.label)}" aria-hidden="true"></span>`;

const buildTimelineConnectorMarkup = (entry, group, entryIndex) => {
  const relativeDepth = wideTimelineStackVisualDepth(group, entryIndex);
  return `<line class="wide-timeline-link is-${entry.kind}" data-wide-timeline-link-stack="${escapeHtml(group.id)}" data-wide-timeline-link-index="${entryIndex}" x1="18" y1="${rounded(entry.markerY)}" x2="${rounded(38 + relativeDepth * 1.8)}" y2="${rounded(group.cardCenterY + relativeDepth * 8)}" vector-effect="non-scaling-stroke"></line>`;
};

export const buildWideTimelineCardMarkup = ({
  group,
  formatTime = () => "",
  icons = {},
  sliding = false,
  slideDirection = 1,
} = {}) => {
  const count = group.entries.length;
  const activeIndex = Math.min(
    count - 1,
    Math.max(0, Number(group.activeIndex) || 0),
  );
  const entry = group.entries[activeIndex];
  if (!entry) return "";
  const stackClass = count > 1 ? " has-stack" : "";
  const alertClass = entry.kind === "alert" ? " is-alert" : " is-event";
  const slideClass = sliding
    ? Number(slideDirection) < 0
      ? " is-sliding-previous"
      : " is-sliding-next"
    : "";
  const underlays = Array.from(
    { length: Math.min(2, count - 1) },
    (_, index) => {
      const stackedEntry = group.entries[(activeIndex + index + 1) % count];
      const stackedAlertClass =
        stackedEntry?.kind === "alert" ? " alert" : "";
      const stackedThumbnail = stackedEntry?.thumbnailUrl
        ? `<img src="${escapeHtml(stackedEntry.thumbnailUrl)}" data-thumb-id="${escapeHtml(stackedEntry.id)}" loading="lazy" decoding="async" alt="" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"><span class="wide-timeline-underlay-placeholder tph" style="display:none" aria-hidden="true">${icons.person || ""}</span>`
        : `<span class="wide-timeline-underlay-placeholder tph" aria-hidden="true">${icons.person || ""}</span>`;
      return `<span class="wide-timeline-card-underlay et depth-${index + 1}${stackedAlertClass}" aria-hidden="true">${stackedThumbnail}</span>`;
    },
  ).join("");
  const thumbnail = entry.thumbnailUrl
    ? `<img src="${escapeHtml(entry.thumbnailUrl)}" data-thumb-id="${escapeHtml(entry.id)}" loading="lazy" decoding="async" alt="" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"><span class="wide-timeline-card-placeholder tph" style="display:none" aria-hidden="true">${icons.person || ""}</span>`
    : `<span class="wide-timeline-card-placeholder tph" aria-hidden="true">${icons.person || ""}</span>`;
  const timeLabel = formatTime(entry.startTime);
  const clickLabel = `${entry.kind === "alert" ? "Play alert" : entry.hasClip ? "Play clip" : "View snapshot"}: ${entry.label}, ${timeLabel}`;
  const cycle = count > 1
    ? `<button class="wide-timeline-stack-cycle" type="button" data-wide-timeline-stack-next="${escapeHtml(group.id)}" title="Show next event in this stack" aria-label="Show next event in this stack"><span>${activeIndex + 1}/${count}</span>${icons.chevron || icons.right || ""}</button>`
    : "";
  const stackTitle = count > 1
    ? ` title="${count} events stacked — use the mouse wheel or stack button to browse"`
    : "";

  return `<article class="wide-timeline-stack${stackClass}${alertClass}${slideClass}" style="--timeline-card-y:${rounded(group.cardTop)}px" data-wide-timeline-stack="${escapeHtml(group.id)}"${stackTitle}>
      ${underlays}
      <button class="wide-timeline-card-main et${entry.kind === "alert" ? " alert" : ""}${entry.thumbnailUrl ? " has-thumbnail" : " is-placeholder"}" type="button" data-wide-timeline-entry="${escapeHtml(entry.id)}" aria-label="${escapeHtml(clickLabel)}">
        ${thumbnail}
        <span class="wide-timeline-card-label">${escapeHtml(entry.label)}</span>
        <span class="wide-timeline-card-time">${escapeHtml(timeLabel)}</span>
        <span class="wide-timeline-card-duration ed">${escapeHtml(entry.duration)}s</span>
      </button>
      ${cycle}
    </article>`;
};

export const buildWideTimelineContentMarkup = ({
  layout,
  ticks = [],
  formatTime = () => "",
  icons = {},
  slidingStackId = "",
  slideDirection = 1,
} = {}) => {
  if (!layout?.groups?.length) return "";
  const links = layout.groups
    .flatMap((group) =>
      group.entries.map((entry, entryIndex) =>
        buildTimelineConnectorMarkup(entry, group, entryIndex),
      ),
    )
    .join("");
  const markers = layout.groups
    .flatMap((group) => group.entries.map(buildTimelineMarkerMarkup))
    .join("");
  const cards = layout.groups
    .map((group) =>
      buildWideTimelineCardMarkup({
        group,
        formatTime,
        icons,
        sliding: group.id === slidingStackId,
        slideDirection,
      }),
    )
    .join("");
  const contentHeight = Math.ceil(layout.contentHeight);

  return `<div class="wide-timeline-canvas" style="height:${contentHeight}px;--timeline-base-height:${contentHeight}px;--timeline-card-width:${rounded(layout.cardWidth)}px;--timeline-card-height:${rounded(layout.cardHeight)}px">
      <span class="wide-timeline-axis" aria-hidden="true"></span>
      ${ticks.map(buildTimelineTickMarkup).join("")}
      <svg class="wide-timeline-links" viewBox="0 0 100 ${contentHeight}" preserveAspectRatio="none" aria-hidden="true">${links}</svg>
      ${markers}
      ${cards}
    </div>`;
};

export const buildWideTimelineEmptyMarkup = ({ loading = false } = {}) =>
  `<div class="wide-timeline-empty" role="status">${loading ? "Loading timeline…" : "No alerts or events in this window"}</div>`;
