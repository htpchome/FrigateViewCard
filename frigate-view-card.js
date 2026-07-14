/**
 * FrigateView Card Version 1.0.1
 * ---------------------------------------------------------------
 * 
 * 
 * 
 * ---------------------------------------------------------------
 */

const VERSION = "1.0.23";

import {
    LitElement,
    html,
    css,
} from "https://cdn.jsdelivr.net/gh/lit/dist@3/core/lit-core.min.js";

const CARD_TAG = "frigate-view-card";
const DAY = 86400;
const RECORDINGS_WINDOW = 24 * 3600;
const EVENT_FETCH_BATCH = 100;
const REVIEW_FETCH_BATCH = 100;
const WINDOW_FETCH_PAGE_LIMIT = 10;
const isIOS =
  /iPad|iPhone|iPod/.test(navigator.userAgent) ||
  (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
const ICONS = {
  live: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M17 10.5V7a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-3.5l4 4v-11l-4 4z"/></svg>',
  recordings:
    '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M18 4l2 4h-3l-2-4h-2l2 4h-3l-2-4H8l2 4H7L5 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4h-4z"/></svg>',
  clips:
    '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-8 12.5v-9l6 4.5-6 4.5z"/></svg>',
  snapshot:
    '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 15.2A3.2 3.2 0 0 1 8.8 12 3.2 3.2 0 0 1 12 8.8 3.2 3.2 0 0 1 15.2 12 3.2 3.2 0 0 1 12 15.2M20 4h-3.17L15 2H9L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2z"/></svg>',
  alerts:
    '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L4 5v6c0 5 3.4 9.7 8 11 4.6-1.3 8-6 8-11V5l-8-3zm-1 14l-4-4 1.4-1.4L11 13.2l5.6-5.6L18 9l-7 7z"/></svg>',
  clock:
    '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z"/></svg>',
  pin: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>',
  back: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>',
  download:
    '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg>',
  star: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>',
  starO:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>',
  bullseye:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2A10 10 0 0 0 2 12A10 10 0 0 0 12 22A10 10 0 0 0 22 12A10 10 0 0 0 12 2M12 4A8 8 0 0 1 20 12A8 8 0 0 1 12 20A8 8 0 0 1 4 12A8 8 0 0 1 12 4M12 6A6 6 0 0 0 6 12A6 6 0 0 0 12 18A6 6 0 0 0 18 12A6 6 0 0 0 12 6M12 8A4 4 0 0 1 16 12A4 4 0 0 1 12 16A4 4 0 0 1 8 12A4 4 0 0 1 12 8Z" /></svg>',  
  calendar:
    '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 18H5V8h14v13z"/></svg>',
  filter:
    '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M10 18h4v-2h-4v2zM3 6v2h18V6H3zm3 7h12v-2H6v2z"/></svg>',
  expand:
    '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/></svg>',
  chevron:
    '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6z"/></svg>',
  rotate:
    '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 6v3l4-4-4-4v3c-4.42 0-8 3.58-8 8 0 1.57.46 3.03 1.24 4.26L6.7 14.8A5.87 5.87 0 0 1 6 12c0-3.31 2.69-6 6-6zm6.76 1.74L17.3 9.2A5.87 5.87 0 0 1 18 12c0 3.31-2.69 6-6 6v-3l-4 4 4 4v-3c4.42 0 8-3.58 8-8 0-1.57-.46-3.03-1.24-4.26z"/></svg>',
  volOff:
    '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M16.5 12A4.5 4.5 0 0 0 14 7.97v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/></svg>',
  volOn:
    '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3A4.5 4.5 0 0 0 14 7.97v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>',
  grid: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 3v8h8V3H3zm6 6H5V5h4v4zm-6 4v8h8v-8H3zm6 6H5v-4h4v4zm4-16v8h8V3h-8zm6 6h-4V5h4v4zm-6 4v8h8v-8h-8zm6 6h-4v-4h4v4z"/></svg>',
  person:
    '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>',
  frigateview:
    '<svg viewBox="100 300 820 155" xmlns="http://www.w3.org/2000/svg"><desc>FrigateView</desc><path style="stroke:none;stroke-width:1;stroke-dasharray:none;stroke-linecap:butt;stroke-dashoffset:0;stroke-linejoin:miter;stroke-miterlimit:4;fill:#161618;fill-rule:nonzero;opacity:1" transform="translate(-30.73 177.492)scale(1.93682)" d="M118.652 71.916v9.36H89.13v10.801h29.523v9.361H89.13v20.882h-10.8V71.916z"/><path style="stroke:none;stroke-width:1;stroke-dasharray:none;stroke-linecap:butt;stroke-dashoffset:0;stroke-linejoin:miter;stroke-miterlimit:4;fill:#161618;fill-rule:nonzero;opacity:1" transform="translate(41.364 177.49)scale(1.93682)" d="M83.872 82.716h10.081v6.841c2.953-4.896 7.921-6.84 14.834-6.84h4.464v8.64h-4.464c-9.29 0-14.834 5.905-14.834 12.097v18.866h-10.08z"/><path style="stroke:none;stroke-width:1;stroke-dasharray:none;stroke-linecap:butt;stroke-dashoffset:0;stroke-linejoin:miter;stroke-miterlimit:4;fill:#161618;fill-rule:nonzero;opacity:1" transform="translate(82.504 177.492)scale(1.93682)" d="M103.601 82.716v39.604h-10.08V82.716z"/><rect style="stroke:none;stroke-width:1;stroke-dasharray:none;stroke-linecap:butt;stroke-dashoffset:0;stroke-linejoin:miter;stroke-miterlimit:4;fill:#71787e;fill-rule:nonzero;opacity:1" x="-5.04" y="-3.24" rx="0" ry="0" width="10.081" height="6.481" transform="translate(273.397 323.056)scale(1.93682)"/><path style="stroke:none;stroke-width:1;stroke-dasharray:none;stroke-linecap:butt;stroke-dashoffset:0;stroke-linejoin:miter;stroke-miterlimit:4;fill:#161618;fill-rule:nonzero;opacity:1" transform="translate(142.187 177.49)scale(1.93682)" d="M78.185 125.776h10.873c2.304 4.32 5.76 5.833 9.576 5.833 8.21 0 12.025-4.177 12.025-10.01v-3.96c-2.376 3.529-6.48 5.4-13.537 5.4-14.4 0-20.737-7.704-20.737-20.52 0-13.394 6.84-20.523 20.737-20.523 7.129 0 11.233 1.873 13.537 5.329v-4.609h10.081v41.548c0 9.36-9.432 17.065-22.106 17.065-9.576 0-18.29-4.608-20.45-15.553m20.377-12.457c7.633 0 12.097-3.744 12.097-10.8 0-6.77-4.248-10.802-12.097-10.802-7.632 0-12.097 3.745-12.097 10.801 0 6.769 4.249 10.801 12.097 10.801"/><path style="stroke:none;stroke-width:1;stroke-dasharray:none;stroke-linecap:butt;stroke-dashoffset:0;stroke-linejoin:miter;stroke-miterlimit:4;fill:#161618;fill-rule:nonzero;opacity:1" transform="translate(234.991 177.49)scale(1.93682)" d="M76.276 102.518c0-13.393 6.84-20.522 20.738-20.522 7.129 0 11.233 1.873 13.537 5.329v-4.609h10.081v39.604h-10.08v-4.68c-2.377 3.528-6.481 5.4-13.538 5.4-14.401 0-20.738-7.705-20.738-20.522m22.178 10.801c7.633 0 12.097-3.744 12.097-10.8 0-6.77-4.248-10.802-12.097-10.802-7.632 0-12.097 3.745-12.097 10.801 0 6.769 4.248 10.801 12.097 10.801"/><path style="stroke:none;stroke-width:1;stroke-dasharray:none;stroke-linecap:butt;stroke-dashoffset:0;stroke-linejoin:miter;stroke-miterlimit:4;fill:#161618;fill-rule:nonzero;opacity:1" transform="translate(312.315 177.492)scale(1.93682)" d="M88.481 108.279V91.357h-5.184v-8.64h5.184V71.914h10.081v10.801h15.265v8.641H98.562v16.634c0 3.888 2.376 4.968 5.112 4.968h10.153v9.36h-12.385c-6.408 0-12.961-2.807-12.961-14.04"/><path style="stroke:none;stroke-width:1;stroke-dasharray:none;stroke-linecap:butt;stroke-dashoffset:0;stroke-linejoin:miter;stroke-miterlimit:4;fill:#161618;fill-rule:nonzero;opacity:1" transform="translate(386.992 177.49)scale(1.93682)" d="M76.42 102.518c0-13.393 8.28-20.522 22.178-20.522 14.401 0 22.178 7.705 22.178 20.522v1.512H86.573c.576 5.833 4.753 9.29 12.025 9.29 5.257 0 9-1.73 10.8-5.185h10.874c-2.16 9.72-9.937 14.905-21.674 14.905-14.401 0-22.178-7.705-22.178-20.522m32.907-5.832c-1.872-3.169-5.472-4.969-10.729-4.969-5.112 0-8.857 1.728-10.729 4.969z"/><path style="stroke:none;stroke-width:1;stroke-dasharray:none;stroke-linecap:butt;stroke-dashoffset:0;stroke-linejoin:miter;stroke-miterlimit:4;fill:#71787e;fill-rule:nonzero;opacity:1" transform="translate(458.247 177.492)scale(1.93682)" d="m80.525 71.915 18.001 50.405h-3.815L76.709 71.915z"/><path style="stroke:none;stroke-width:1;stroke-dasharray:none;stroke-linecap:butt;stroke-dashoffset:0;stroke-linejoin:miter;stroke-miterlimit:4;fill:#161618;fill-rule:nonzero;opacity:1" transform="translate(670.207 365.593)scale(1.93682)" d="M7.093-25.202h3.816L-7.093 25.202h-3.816z"/><path style="stroke:none;stroke-width:1;stroke-dasharray:none;stroke-linecap:butt;stroke-dashoffset:0;stroke-linejoin:miter;stroke-miterlimit:4;fill:#71787e;fill-rule:nonzero;opacity:1" transform="translate(508.662 177.492)scale(1.93682)" d="M100.36 82.716v39.604h-3.6V82.716z"/><rect style="stroke:none;stroke-width:1;stroke-dasharray:none;stroke-linecap:butt;stroke-dashoffset:0;stroke-linejoin:miter;stroke-miterlimit:4;fill:#161618;fill-rule:nonzero;opacity:1" x="-1.8" y="-1.62" rx="0" ry="0" width="3.6" height="3.24" transform="translate(699.555 319.918)scale(1.93682)"/><path style="stroke:none;stroke-width:1;stroke-dasharray:none;stroke-linecap:butt;stroke-dashoffset:0;stroke-linejoin:miter;stroke-miterlimit:4;fill:#71787e;fill-rule:nonzero;opacity:1" transform="translate(557.54 177.49)scale(1.93682)" d="M78.292 102.518c0-13.393 7.56-20.522 20.306-20.522 12.745 0 20.306 7.129 20.306 20.522H81.893c0 11.305 5.184 16.922 16.705 16.922 9.793 0 15.265-3.96 16.49-12.674h3.6c-1.512 10.657-8.785 16.274-20.09 16.274-13.177 0-20.306-7.705-20.306-20.522m36.867-3.24c-1.008-9.433-6.408-13.681-16.561-13.681s-15.553 4.248-16.561 13.68z"/><path style="stroke:none;stroke-width:1;stroke-dasharray:none;stroke-linecap:butt;stroke-dashoffset:0;stroke-linejoin:miter;stroke-miterlimit:4;fill:#71787e;fill-rule:nonzero;opacity:1" transform="translate(649.512 177.49)scale(1.93682)" d="M103.6 82.716H100l12.025 39.604h3.6zm-34.49 0 11.664 39.604h3.6L72.71 82.716z"/><path style="stroke:none;stroke-width:1;stroke-dasharray:none;stroke-linecap:butt;stroke-dashoffset:0;stroke-linejoin:miter;stroke-miterlimit:4;fill:#161618;fill-rule:nonzero;opacity:1" transform="translate(888.24 376.05)scale(1.93682)" d="M7.633-19.802h-3.6L-7.634 19.802h3.6z"/><path style="stroke:none;stroke-width:1;stroke-dasharray:none;stroke-linecap:butt;stroke-dashoffset:0;stroke-linejoin:miter;stroke-miterlimit:4;fill:#161618;fill-rule:nonzero;opacity:1" transform="translate(828.061 376.05)scale(1.93682)" d="M4.212-19.802-7.813 19.802h3.6L7.814-19.802z"/></svg>',

};

// ── helpers ──────────────────────────────────────────────────
function cap(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
}
function parseWs(r) {
  if (typeof r === "string") {
    try {
      return JSON.parse(r);
    } catch (_) {
      return [];
    }
  }
  return r;
}

function normalizePositiveInteger(value, fallback) {
  const parsed = parseInt(String(value ?? "").trim(), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

const LABEL_COLORS = {
  person: "#3b82f6",
  car: "#a855f7",
  motion: "#f59e0b",
  dog: "#10b981",
  cat: "#f472b6",
  bicycle: "#22d3ee",
  bird: "#eab308",
  package: "#f97316",
  face: "#818cf8",
  truck: "#fb7185",
  bus: "#34d399",
};
const PALETTE = [
  "#3b82f6",
  "#a855f7",
  "#f59e0b",
  "#10b981",
  "#f472b6",
  "#22d3ee",
  "#eab308",
  "#f97316",
  "#818cf8",
  "#fb7185",
  "#34d399",
  "#ef4444",
];
function labelColor(l) {
  if (!l) return "#f59e0b";
  if (LABEL_COLORS[l]) return LABEL_COLORS[l];
  let h = 0;
  for (const c of l) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return PALETTE[h % PALETTE.length];
}
// per-camera recording bar colours (distinct from event marker colours)
const CAM_COLORS = [
  "rgba(30,80,200,.5)",
  "rgba(210,80,30,.5)",
  "rgba(30,170,80,.5)",
  "rgba(170,30,180,.5)",
];
function mkCamState() {
  return {
    clientId: "frigate",
    cam: "",
    events: [],
    recordings: [],
    reviews: [],
    kept: [],
    discovered: false,
  };
}
function camDisplayName(c) {
  return c.name || (c.entity || "").replace(/^camera\./, "").replace(/_/g, " ");
}

// ── styles ───────────────────────────────────────────────────
const STYLES = `
  :host {
    height: var(--card-host-height, calc(100dvh - var(--header-height, 56px))) !important;
    max-height: var(--card-host-height, calc(100dvh - var(--header-height, 56px))) !important;
    --rotate-vw: 100vw;
    --rotate-vh: 100dvh;
    --rotate-ox: 0px;
    --rotate-oy: 0px;
    min-height: 0;
    display: block !important;
    margin:0 !important;
    padding:0 !important;
    overflow: hidden;
    box-sizing: border-box !important;
    position: relative; /* This confines the absolute layout bounds strictly to this component */
  }
  :host {
    --popup-z-index: 1000;
    --popup-bg: white;
    --handle-color: #e0e0e0;
  }

  /* ── theme variables (dark = default) ── */
    .card {
        --c-bg-main:   var(--card-background-color);
        --c-bg-panel:  var(--secondary-background-color);
        --c-bg-panel-light: color-mix(in srgb, var(--secondary-background-color) 50%, white);
        --c-bg-deep:   #111111;
        --c-text:      var(--primary-text-color);
        --c-text2:     var(--secondary-text-color);
        --c-text3:     #5c7099;
        --c-text4:     #3a4d6e;
        --c-border:    var(--secondary-background-color);
        --c-border2:   var(--state-inactive-color);
        --c-primary:   var(--primary-color);
        --c-acc:       var(--accent-color);
        --c-acc-bg:    var(--light-primary-color);
        --c-acc-bdr:   var(--dark-primary-color);
        --c-on:        #4ade80;
        --c-green:     #c2f2c1;
        --c-red:       #dc3146;
    }
  .card.theme-light {
        --c-bg-main:        #1c2233;
        --c-bg-panel:  rgba(255,255,255,.04);
        --c-bg-deep:   #0d1117;
        --c-text:      #f0f4ff;
        --c-text2:     #9bb0d4;
        --c-text3:     #5c7099;
        --c-text4:     #3a4d6e;
        --c-border:    rgba(255,255,255,.05);
        --c-border2:   rgba(255,255,255,.08);
        --c-primary:   rgba(59,130,246,.18);
        --c-acc:       #3b82f6;
        --c-acc-bg:    rgba(59,130,246,.18);
        --c-acc-bdr:   rgba(59,130,246,.35);
        --c-green:     #c2f2c1;
        --c-red:       #dc3146;
  }

  /* ── responsive layout ── */
  ha-card {
    --ha-card-background: var(--c-bg-main) !important;
    padding: 0 !important;
    margin: 0 !important;
    min-height: 0 !important;
    height: auto;
    }
  .card{
    --ha-card-background: var(--c-bg-main) !important;
    color:var(--c-text);
    overflow:hidden;
    box-sizing: border-box;
    border-radius:var(--ha-card-border-radius,13px);
    font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
    display:flex;
    flex-direction:column;
    box-shadow: var(--ha-box-shadow-m);
    height:100%;
    padding:0;
    margin: 0 auto;
    position:relative;
    top:0;
    left:0;
    }

  .layout{display:flex;flex-direction:column;max-height:100dvh;height: 100%;width:100%;}
  .layout.wide{flex-direction:row;}
  .card .col-left{flex:0 1 auto; min-height:0; align-self: start;flex-direction:column;width:100%; display:flex;}
  .card .col-left > *{flex:0 0 auto;}
  .card .col-left > .feed-area{flex:1 1 auto;min-height:0;}
  .card .col-right{flex:1 1 auto; min-height:0; flex-direction:column;width:100%; display:flex;}
  .resize-handle{display:block;width:100%;height:6px;cursor:row-resize;background:var(--c-border2,#333);position:relative;flex-shrink:0;z-index:10;transition:background .15s;}
  .layout:not(.wide) .resize-handle{display:none;}
  .resize-handle:hover,.resize-handle.active{background:var(--c-acc,#3b82f6);}
  .resize-handle::after{content:'';position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:32px;height:2px;background:rgba(255,255,255,.4);border-radius:1px;}
  .layout.wide .resize-handle{width:6px;height:auto;cursor:col-resize;}
  .layout.wide .resize-handle::after{width:2px;height:32px;}
  .card #eng-wrap{min-height:0;flex-shrink: 0;}
  .card .browse{flex:1 1 0;flex-direction: column; padding:0 10px;margin:0;min-height:0;height:100%;overflow-y:auto;position:relative}
  .card .browse::-webkit-scrollbar{width:8px;}
  .card .browse::-webkit-scrollbar-track{background:transparent;}
  .card .browse::-webkit-scrollbar-thumb{background:var(--c-text4);border-radius:4px;background-clip:content-box;border:2px solid transparent;}

  /* ── event list ── */
  .list{flex:1;flex-direction: column;min-height:0;} 
  .list-sec{padding:6px 2px}  
  .list-head{justify-content:space-between;align-items:center;margin-bottom:8px;}
  .list-day-sec{position:relative;}
  .list-day-label{position:sticky;top:0;z-index:2;padding:2px 0 8px;margin:0 0 4px;font-size:0.82rem;font-weight:700;color:var(--c-text2);letter-spacing:.02em;line-height:1.50;pointer-events:none;background:var(--c-bg-main);border:none;}
  .list-day-label::before{content:"";position:absolute;left:0px;right:0px;top:-3px;height:3px;background:var(--c-bg-main);}
  .list-item{display:flex;flex-wrap:wrap;gap:9px;align-items:center;padding:2px 10px 2px 2px;
    background:var(--c-bg-panel);border:1px solid var(--c-border2);
    border-radius:8px;margin-bottom:5px;cursor:pointer}
  .list-item:hover{background: var(--c-bg-main);
    border-color:var(--c-acc-bdr,rgba(59,130,246,.25));}
  .list-item.compact{padding:2px 10px 2px 2px;flex-wrap:wrap;}
  .list-item.compact .et{width:112px;height:63px;border-radius:5px;}
  .list-item.compact .eact .ico{width:28.8px;height:28.8px;}
  .list-item.compact .eact .ico svg{width:13.2px;height:13.2px;}
  .shadow-small{box-shadow: var(--ha-box-shadow-s);transition: transform 0.2s, box-shadow 0.2s;}
  .shadow-small:hover{transform: scale(1.005);box-shadow: var(--ha-box-shadow-s);}
  .tabs{display:flex;gap:5px;flex-wrap: wrap;padding:8px 12px;border-bottom:1px solid var(--c-border);overflow-x:auto;scrollbar-width:none;position:sticky;z-index:auto;top:0;background-color:var(--c-bg-panel) !important;}
  .tabs::-webkit-scrollbar{display:none;}


  .newtoast{font-size:0.75rem;font-weight:700;color:var(--c-on);}
  .empty{text-align:center;padding:16px;color:var(--c-text3);font-size:0.9rem;line-height:1.5;}
  .more,.end{display:flex;min-height:0;align-items:center;justify-content:center;font-size:0.75rem;color:var(--c-text4);padding:6px;}
  .more.to-top{cursor:pointer;color:var(--c-text2);}

  /* ── feed area ── */
  .feed-area{position:relative;width:100%;}
    #eng-wrap{background:var(--c-bg-deep);position:relative;width:100%;aspect-ratio:16/9;overflow:hidden;max-height:var(--stream-h,none);z-index:0;isolation:isolate;transition:opacity .22s ease,border-radius .25s ease,box-shadow .25s ease;}
    .card.mobile-rotate-live,
    .card.mobile-rotate-live-exit{overflow:hidden;height:var(--rotate-vh);max-height:var(--rotate-vh);}
    .card.mobile-rotate-live #eng-wrap,
    .card.mobile-rotate-live-exit #eng-wrap{position:fixed;top:var(--rotate-oy);left:var(--rotate-ox);z-index:1400;width:var(--rotate-vw);height:var(--rotate-vh);max-width:none;max-height:none;aspect-ratio:auto;border-radius:0;background:#000;box-shadow:none;transform:none;}
    .card.mobile-rotate-live #engine,
    .card.mobile-rotate-live-exit #engine{position:absolute;inset:0;}
    .card.mobile-rotate-live #engine > *,
    .card.mobile-rotate-live-exit #engine > *{position:absolute;inset:0;width:100% !important;height:100% !important;max-width:none !important;max-height:none !important;}
    .card.mobile-rotate-live #engine video,
    .card.mobile-rotate-live-exit #engine video,
    .card.mobile-rotate-live #stream-fallback img,
    .card.mobile-rotate-live-exit #stream-fallback img{object-fit:cover;object-position:center center;}
    .card.mobile-rotate-live #eng-wrap{animation:liveOverlayIn .28s ease both;}
    .card.mobile-rotate-live-exit #eng-wrap{animation:liveOverlayOut .24s ease both;}
    .card.mobile-rotate-live .stream-loading,
    .card.mobile-rotate-live-exit .stream-loading{display:none !important;}
  #stream-fallback{position:absolute;inset:0;z-index:2;background:var(--c-bg-deep);
    pointer-events:none;line-height:0;}
  #stream-fallback[hidden]{display:none;}
  #stream-fallback img{width:100%;height:100%;max-width:none;max-height:none;object-fit:contain;object-position:center center;display:block;background:var(--c-bg-deep);}
  #stream-fallback::after{content:none;}
  #engine{position:absolute;inset:0;z-index:1;min-height:0;flex-shrink:0;}
  #engine video{width:100%;height:100%;display:block;object-fit:contain;var(--c-bg-deep);}
  #engine ha-camera-stream,#engine ha-hls-player,#engine webrtc-camera{width:100%;height:100%;display:block;}
  .stream-fallback-status{position:absolute;left:8px;bottom:8px;z-index:3;display:flex;align-items:center;gap:6px;padding:4.8px 9.6px;border-radius:999px;background:rgba(0,0,0,.62);border:1px solid rgba(255,255,255,.2);color:#fff;font-size:0.825rem;font-weight:600;line-height:1;backdrop-filter:blur(2px);}
  .stream-fallback-status[hidden]{display:none;}
  .stream-loading{position:absolute;top:8px;right:8px;display:flex;align-items:center;gap:6px;padding:4.8px 9.6px;border-radius:999px;background:rgba(0,0,0,.55);border:1px solid rgba(255,255,255,.2);color:#fff;font-size:0.825rem;font-weight:600;line-height:1;z-index:3;backdrop-filter:blur(2px);}
  .stream-loading[hidden]{display:none;}
  .stream-loading .dot{width:10px;height:10px;border:2px solid rgba(255,255,255,.3);border-top-color:#fff;border-radius:50%;animation:spin .9s linear infinite;}
  .overlay-fs{position:absolute;top:8px;left:8px;z-index:3;width:36px;height:36px;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.55);border:1px solid rgba(255,255,255,.22);border-radius:7px;color:#fff;cursor:pointer;backdrop-filter:blur(2px);}
  .overlay-fs[hidden]{display:none !important;}
  .overlay-fs svg{width:16.8px;height:16.8px;}
  .overlay-fs:hover{background:rgba(59,130,246,.65);border-color:rgba(147,197,253,.9);}
  #eng-wrap:fullscreen .overlay-fs,
  #eng-wrap:-webkit-full-screen .overlay-fs,
  #viewer:fullscreen .overlay-fs,
  #viewer:-webkit-full-screen .overlay-fs{display:none !important;}
  .viewer{width:100%;aspect-ratio:16/9;min-height:240px;max-height:70dvh;
    background:var(--c-bg-deep);display:flex;align-items:center;justify-content:center;z-index:2;position:relative;overflow:hidden;border-radius:7px;}
  .viewer video,.viewer img.snap{width:100%;height:100%;object-fit:contain;
    background:var(--c-bg-deep);}
  .viewer .ld{color:var(--c-text2);font-size:0.975rem;}
  .ph{width:100%;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;color:var(--c-text4);background:linear-gradient(145deg,#1a2540,#0d1520);}
  .ph svg{width:40px;height:40px;opacity:.35;}
  .ph-spin{width:24px;height:24px;border:3px solid rgba(255,255,255,.1);border-top-color:var(--c-acc);border-radius:50%;animation:spin .8s linear infinite;}
  @keyframes spin{to{transform:rotate(360deg);}}
    @keyframes liveOverlayIn{from{opacity:.9;}to{opacity:1;}}
    @keyframes liveOverlayOut{from{opacity:1;}to{opacity:.92;}}


  /* ── info row ── */
  .info-row{display:flex;flex-wrap: wrap;padding:10px 16px 8px;
    border-bottom:1px solid var(--c-border);}
  .info-title{font-size:1.05rem;font-weight:700;color:var(--c-text);}
  .stats{display:flex;flex-wrap: wrap;gap:16px;justify-self:end;margin-left:auto;justify-self:end;} 
  .stat{display:flex;flex-direction:column;align-items:flex-end;}
  .sv{font-size:1.05rem;font-weight:700;color:var(--c-acc-bdr);} .sl{font-size:0.75rem;color:var(--c-text4);text-transform:uppercase;letter-spacing:.06em;}
  .info-mute{width:36px;height:36px;display:flex;align-items:center;justify-content:center;background:var(--c-bg-panel);border:1px solid var(--c-border2);border-radius:7px;color:var(--c-text2);cursor:pointer;flex-shrink:0;}
    .sv.stream-type{text-transform:uppercase;font-size:0.95rem;}
  .info-mute svg{width:24px;height:24px;}
  .info-mute:hover{color:var(--c-acc-bdr);border-color:var(--c-acc-bdr);}

  /* ── camera switcher ── */

  .tabs{display:flex;gap:5px;flex-wrap: wrap;padding:8px 12px;border-bottom:1px solid var(--c-border);overflow-x:auto;scrollbar-width:none;position:sticky;z-index:auto;top:0;background-color:var(--c-bg-panel) !important;}
  .tabs::-webkit-scrollbar{display:none;}

  .cam-switcher{display:flex;align-items:center;gap:4px;flex-wrap: wrap;padding:6px 12px;border-bottom:1px solid var(--c-border);overflow-x:auto;}
  .cam-tabs{display:flex;gap:4px;flex:1;flex-wrap: wrap;overflow-x:auto;scrollbar-width:none;}
  .cam-tabs::-webkit-scrollbar{display:none;}
  .cam-tab{display:inline-flex;align-items:center;gap:4px;background:var(--c-bg);border:1px solid var(--c-border2);color:var(--c-text2);border-radius:12px;padding:8px 6px;font-size:0.825rem;font-weight:600;cursor:pointer;white-space:nowrap;transition:all .15s;}
  .cam-tab:hover{background:var(--c-acc-bg);border-color:var(--c-acc-bdr);color:var(--c-text);}
  .cam-tab.active{background:var(--c-acc-bg);border-color:var(--primary-color);color:var(--c-text);}
  .cam-tab svg{width:14.4px;height:14.4px;flex-shrink:0;}
  .cam-dot{font-size:0.7rem;vertical-align:middle;}

  /* ── pill button ── */
  .pill{display:inline-flex;align-items:center;gap:4px;background:var(--c-acc-bg);border:1px solid var(--c-border2);border-radius:12px;padding:4px;font-size:1rem;font-weight:600;color:var(--c-text2);cursor:pointer;white-space:nowrap;flex-shrink:0;max-width:36px;max-height:30px}
  .pill svg{width:24px;height:24px;opacity:0.85;}
  .pill:hover{background:var(--c-acc-bdr);border-color:var(--c-acc-bg);color:var(--c-text);}
  .pill.active{background:var(--c-primary);border-color:var(--c-acc-bdr);color:var(--c-text);} 
  .pill.active svg{opacity:1;}
  .pill.icon-only{padding:4px;max-width:36px;max-height:30px}
  .pill.icon-only svg{width:24px;height:24px;opacity:0.85;}

  /* ── timeline ── */
  .tl-tools{display:flex;gap:4px;}
  .tool{display:inline-flex;gap:4px;align-items:center;background:var(--c-bg);border:1px solid var(--c-border2);color:var(--c-text2);border-radius:6px;padding:4px;cursor:pointer;max-height:30px;max-width:36px;flex-shrink:0;}
  .tool svg{width:24px;height:24px;display:block;}
  .tool:hover{color:var(--c-acc-bdr);border-color:var(--c-acc-bdr);}

  /* ── filter + cal ── */
  .filter-panel,.cal-panel{background:var(--c-bg-panel);border:1px solid var(--c-border2);border-radius:6px;padding:8px;margin-bottom:7px;position:sticky;top: 10;}
  .frow{display:flex;align-items:center;gap:5px;flex-wrap:wrap;margin-bottom:4px;} .frow:last-child{margin-bottom:0;} .frow-l{font-size:0.75rem;color:var(--c-text3);width:38px;text-transform:uppercase;flex-shrink:0;}
  .chip{background:var(--c-bg-panel);border:1px solid var(--c-border2);color:var(--c-text2);border-radius:10px;padding:3.6px 10.8px;font-size:0.825rem;cursor:pointer;}
  .chip.on{background:var(--c-acc-bg);border-color:var(--c-acc-bdr);color:var(--c-acc-bdr);}
  .cal-head{display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;} .cal-head b{font-size:0.9rem;} .cal-head button{background:none;border:none;color:var(--c-acc-bdr);font-size:1.275rem;cursor:pointer;padding:0 6px;}
  .cal-dow,.cal-grid{display:grid;grid-template-columns:repeat(7,1fr);gap:1px;text-align:center;}
  .cal-dow span{font-size:0.675rem;color:var(--c-text4);padding:2px 0;}
  .cday{position:relative;background:none;border:none;color:var(--c-text);font-size:0.825rem;padding:6px 0;border-radius:4px;cursor:pointer;} .cday:hover{background:var(--c-acc-bg);} .cdot{position:absolute;bottom:2px;left:50%;transform:translateX(-50%);width:3px;height:3px;border-radius:50%;background:#ef4444;}

  .frigate-view{position:absolute;bottom:3px;left:6px;max-height:24px;pointer-events: none;}
  .frigate-view svg{height:24px;pointer-events: none;}
  .et{width:112px;height:63px;border-radius:6px;overflow:hidden;flex-shrink:0;background:#0d1520;position:relative;}
  .et img{width:100%;height:100%;object-fit:cover;display:block;}
  .tph{width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,#1a2840,#0d1520);color:#2a3d5e;} 
  .tph svg{width:20px;height:20px;}
  .ed{position:absolute;bottom:2px;right:3px;font-size:0.675rem;font-weight:700;color:#fff;background:rgba(0,0,0,.65);border-radius:3px;padding:1.2px 3.6px;}
  .ei{flex:1;min-width:0;}
  .etop{display:flex;align-items:center;gap:5px;margin-bottom:3px;flex-wrap:wrap;}
  .tb{font-size:0.75rem;font-weight:700;padding:2.4px 7.2px;border-radius:6px;}
  .cam-badge{font-size:0.675rem;color:var(--c-text2);background:var(--c-bg-panel);padding:1.2px 7.2px;border-radius:6px;}
  .subl{font-size:0.75rem;font-weight:600;color:#a5b4fc;background:rgba(99,102,241,.16);padding:2.4px 7.2px;border-radius:6px;}
  .bc,.bs{font-size:0.675rem;font-weight:700;padding:1.2px 6px;border-radius:5px;text-transform:uppercase;} .bc{background:rgba(74,222,128,.14);color:#4ade80;} .bs{background:rgba(148,163,184,.16);color:#cbd5e1;}
  .esc{font-size:0.825rem;font-weight:700;color:#4ade80;background:rgba(74,222,128,.12);border-radius:5px;padding:1.2px 6px;}
  .meta-day{color:inherit;font-size:inherit;font-weight:inherit;line-height:inherit;}
  .meta-sep{opacity:.72;}
  .em{display:flex;gap:8px;flex-wrap:wrap;font-size:0.75rem;color:var(--c-text3);} .em span{display:flex;align-items:center;gap:4px;} 
  .em svg{width:10.8px;height:10.8px;}
  .desc{margin-top:4px;font-size:0.825rem;color:var(--c-text2);line-height:1.45;background:var(--c-bg-panel);border-radius:5px;padding:6px 8.4px;}
  .eact{display:flex;flex-direction:row;align-items:center;gap:4px;flex-shrink:0;}
  .ico{width:31.2px;height:31.2px;display:flex;align-items:center;justify-content:center;background:var(--c-bg-panel);border:1px solid var(--c-border2);border-radius:5px;color:var(--c-text2);cursor:pointer;}
  .ico svg{width:15.6px;height:15.6px;} .ico:hover{color:var(--c-acc-bdr);border-color:var(--c-acc-bdr);}
  .ico.fav.on{color:#fbbf24;border-color:rgba(251,191,36,.4);background:rgba(251,191,36,.12);}

  /* ── recordings ── */
  .rec{display:flex;align-items:center;gap:9px;padding:8px 10px;background:var(--c-bg-panel);border:1px solid var(--c-border2);border-radius:8px;margin-bottom:5px;cursor:pointer;}
  .rec:hover{background:rgba(255,255,255,.07);}
  .ric{width:36px;height:36px;border-radius:5px;background:rgba(30,80,200,.25);
    color:var(--c-acc-bdr);display:flex;align-items:center;justify-content:center;} 
  .ric svg{width:16.8px;height:16.8px;}
  .rinf{flex:1;} 
  .rt{font-size:0.9rem;font-weight:600;color:var(--c-text);} 
  .rsub{font-size:0.75rem;color:var(--c-text3);margin-top:1px;} 
  .rp{color:var(--c-on);}

  /* ── reviews ── */
  .rev{display:flex;gap:5px;flex-wrap: wrap;align-items:center;padding:2px 10px 2px 2px;background:var(--c-bg-panel);border:1px solid var(--c-border2);border-radius:8px;margin-bottom:5px;cursor:pointer;}
  .rev[data-review-open]:hover{background:rgba(255,255,255,.07);border-color:rgba(59,130,246,.25);}
  .rev-sev{width:3px;align-self:stretch;border-radius:3px;margin-right:0;} 
  .rev-sev.alert{background:#ef4444;} 
  .rev-sev.detection{background:#f59e0b;}
  .rev-nogap {display:flex;gap:1px;}
  .rev-inf{flex:1;} 
  .rev-t{font-size:0.9rem;font-weight:600;color:var(--c-text);} 
  .rev-m{display:flex;align-items:center;gap:6px;flex-wrap:wrap;font-size:0.75rem;color:var(--c-text3);margin-top:1px;} 
  .rev-m .time-meta,.rev-m .review-meta{display:inline-flex;align-items:center;gap:4px;} 
  .rev-m svg{width:10.8px;height:10.8px;}
  .rev-th{width:112px;height:63px;border-radius:5px;overflow:hidden;flex-shrink:0;background:#0d1520;} 
  .rev-th img{width:100%;height:100%;object-fit:cover;display:block;} 
  .rev-ph{width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,#1a2840,#0d1520);color:#2a3d5e;} 
  .rev-ph svg{width:18px;height:18px;}

  /* ── toast ── */
  .toast{position:fixed;left:50%;bottom:24px;transform:translateX(-50%);z-index:99;background:rgba(15,21,40,.96);border:1px solid rgba(239,68,68,.4);color:#fca5a5;padding:8px 14px;border-radius:6px;font-size:0.9rem;box-shadow:0 8px 24px rgba(0,0,0,.5);max-width:90%;}
  .diag{font-size:0.75rem;color:#fca5a5;background:rgba(239,68,68,.08);border:1px solid rgba(239,68,68,.25);border-radius:5px;padding:6px 8px;margin-bottom:7px;}

/* ========================================================= */
.popup-content {position: absolute;bottom: 0;left: 0;width: 100%;height: 95%;max-height: 95%;  min-height: 95%;box-sizing: border-box;z-index: var(--popup-z-index);background: var(--popup-bg);
    border-top-left-radius: var(--ha-card-border-radius, 14px);border-top-right-radius: var(--ha-card-border-radius, 14px);overflow: hidden;box-shadow: 0 -8px 40px rgba(0, 0, 0, 0.15);  display: flex;flex-direction: column;overscroll-behavior: contain;transform: translateY(100%);will-change: transform;visibility: hidden;transition: transform 0.3s cubic-bezier(0.25, 1, 0.5, 1), visibility 0.3s ease;}
.popup-content.is-open {transform: translateY(0);visibility: visible;}
.popup-header {display: flex;justify-content: center;align-items: center;height: 32px;width: 100%;
  flex-shrink: 0;cursor: grab;touch-action: none;}
.popup-close-row {position: absolute;top: 3px;right: 10px;z-index: 5;pointer-events: none;}
.popup-close-row .close-btn {pointer-events: auto;}
.popup-header::before {content: '';width: 40px;height: 4px;background-color: var(--handle-color);  border-radius: 3px;}
.popup-body {padding: 0 24px 24px 24px;overflow-y: auto;flex-grow: 1;display: flex;  flex-direction: column;gap: 12px;-webkit-overflow-scrolling: touch;overscroll-behavior-y: contain;}
.popup-shell-ver {margin: 0;font-size: 18px;font-weight: 800;line-height: 1.2;color: var(--c-text2);}
.popup-info-head {margin: 0;font-size: 18px;font-weight: 800;color: var(--c-text2);
    line-height: 1.35;text-transform: uppercase;letter-spacing: .03em;}
.popup-info-head[hidden] {display: none;}
.recording-scrub {display:flex;align-items:center;}
.recording-scrub[hidden] {display:none;}
.recording-scrub-track {position:relative;width:100%;height:10px;border-radius:999px;background:var(--c-green);cursor:pointer;touch-action:none;overflow:visible;}
.recording-scrub-markers {position:absolute;inset:0;}
.recording-scrub-alert {position:absolute;top:-3px;bottom:-3px;background:var(--c-red);border-radius:999px;min-width:6px;}
.recording-scrub-cursor {position:absolute;top:-5px;bottom:-5px;width:2px;background:rgba(255,255,255,.95);border-radius:999px;left:0;transform:translateX(-1px);pointer-events:none;box-shadow:0 0 0 1px rgba(0,0,0,.25);}
.popup-info {background: var(--c-bg-panel);border: 1px solid var(--c-border2);border-radius: 9px;
    padding: 10px 12px;display: flex;flex-direction: column;gap: 8px;}
.popup-info[hidden] {display: none;}
.popup-info-title {display: flex;align-items: center;gap: 8px;flex-wrap: wrap;}
.popup-info-title .tb {font-size: 0.825rem;}
.popup-info-grid {display: grid;grid-template-columns: repeat(2, minmax(0, 1fr));gap: 6px 10px;}
.popup-info-row {display: flex;align-items: baseline;gap: 6px;min-width: 0;}
.popup-info-k {font-size: 0.75rem;color: var(--c-text3);text-transform: uppercase;
    letter-spacing: .05em;flex-shrink: 0;}
.popup-info-v {font-size: 0.9rem;color: var(--c-text);white-space: nowrap;overflow: hidden;
    text-overflow: ellipsis;}
.popup-info-actions {display: flex;gap: 8px;justify-content: flex-end;}
.popup-action {width: 52px;height: 52px;display: flex;align-items: center;justify-content: center;
    background: var(--c-bg-panel);border: 1px solid var(--c-border2);border-radius: 6px;
    color: var(--c-text2);cursor: pointer;}
.popup-action svg {width: 26px;height: 26px;}
.popup-action:hover {color: var(--c-acc-bdr);border-color: var(--c-acc-bdr);}
.close-btn {width: 40px;height: 40px;border-radius: 50%;display: flex;align-items: center;  justify-content: center;font-size: 24px;line-height: 1;cursor: pointer;border: 1px solid #ccc;
  background-color: #f5f5f5;color: #333;transition: all 0.2s ease;}
.close-btn:hover {background-color: #e0e0e0;color: #000;}

`; //==================END CSS SECTION=====================

// ── editor ───────────────────────────────────────────────────
// card.js — main FrigateViewCard custom element
class FrigateViewCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._onShadowClick = (e) => this._click(e);
    this.shadowRoot.addEventListener("click", this._onShadowClick);
    this._missingThumbIds = new Set();
    this._onShadowError = (e) => {
      const img = e.target;
      if (!(img instanceof HTMLImageElement)) return;
      const id = img.dataset.thumbId;
      if (!id) return;
      this._missingThumbIds.add(id);
      img.style.display = "none";
      const fallback = img.nextElementSibling;
      if (fallback) fallback.style.display = "flex";
    };
    this.shadowRoot.addEventListener("error", this._onShadowError, true);
    this._hass = null;
    this._config = null;
    this._started = false;
    this._activeCamIdx = 0;
    this._camCache = {}; // entity → mkCamState()
    this._viewMode = "single"; // 'single' | 'grid'
    this._eventsMode = "camera"; // 'camera' | 'all'
    this._events = [];
    this._recordings = [];
    this._reviews = [];
    this._kept = [];
    this._tab = "alerts";
    this._playing = null;
    this._browseOpen = false;
    this._winEnd = 0;
    this._winStart = 0;
    this._loading = false;
    this._exhausted = false;
    this._daysWithActivity = new Set();
    this._filterLabel = "all";
    this._filterZone = "all";
    this._favOnly = false;
    this._calMonth = null;
    this._engine = null;
    this._unsub = null;
    this._rotateTimer = null;
    this._cardWidth = 0;
    this._playSeq = 0;
    this._streamMuted = true; // start muted; user can toggle via our mute button
    this._activeStreamType = "--";
    this._domCache = {}; // querySelector result cache — cleared on re-render
    this._go2rtcWsUrlCache = new Map(); // key => {url, exp}
    this._go2rtcHlsUrlCache = new Map(); // key => {url|null, exp}
    this._go2rtcHlsProbeInFlight = new Map(); // key => Promise<url|null>
    this._fallbackImgUrlCache = new Map(); // entity => {url, exp}
    this._fallbackReqId = 0;
    this._switchLoadT = null;
    this._popupDrag = null;
    this._popupHandlers = null;
    this._popupMediaCleanup = null;
    this._recordingScrubCleanup = null;
    this._recordingScrubState = null;
    this._recordingAlertCache = new Map();
    this._mountSeq = 0;
    this._pendingMountDestroyers = [];
    this._pendingWebRTCTakeoverTimer = null;
    this._wasVisible = false;
    this._resumeLiveT = null;
    this._lastLiveKick = 0;
    this._rotateOverlayActive = false;
    this._rotateOverlayRaf = 0;
    this._rotateOverlayExitT = null;
    this._rotateOverlaySyncVideo = null;
    this._onRotateOverlayVolumeChange = null;
    this._rotateStyledVideo = null;
    this._rotateStyledVideoCssText = "";
    this._engineMountedMuted = true;
    this._mountInProgress = false;
    this._mountTargetEntity = "";
    this._onDocVisibility = () => {
      if (document.visibilityState === "visible") {
        this._scheduleResumeLive("doc-visible");
      }
    };
    document.addEventListener("visibilitychange", this._onDocVisibility);
    this._onFullscreenChange = () => this._syncFullscreenButtonsVisibility();
    document.addEventListener("fullscreenchange", this._onFullscreenChange);
    document.addEventListener(
      "webkitfullscreenchange",
      this._onFullscreenChange,
    );
    this._onViewportRotate = () => this._scheduleRotateOverlayUpdate();
    window.addEventListener("resize", this._onViewportRotate, {
      passive: true,
    });
    window.addEventListener("orientationchange", this._onViewportRotate);
    window.visualViewport?.addEventListener("resize", this._onViewportRotate, {
      passive: true,
    });
    window.visualViewport?.addEventListener("scroll", this._onViewportRotate, {
      passive: true,
    });
  }
  connectedCallback() {
    if (this.parentElement) {
      this._parentOrigStyle = {
        height: this.parentElement.style.height,
        margin: this.parentElement.style.margin,
      };
      this.parentElement.style.height = "100%";
      this.parentElement.style.margin = "0";
      this.parentElement.style.padding = "0";
      if (this._config?.tight_margins && !this._isPanelView()) {
        this._adjustSectionRowGap();
      }
      this._applyLayoutMode();
      if (this._config?.wide_view) {
        this._syncColHeight();
      }
    }
    this._scheduleRotateOverlayUpdate();
  }

  _syncColHeight() {
    requestAnimationFrame(() => {
      const l = this.shadowRoot.querySelector(".col-left");
      const r = this.shadowRoot.querySelector(".col-right");
      if (!l || !r) return;
      const h = l.offsetHeight;
      if (h > 0) r.style.maxHeight = h + "px";
    });
  }
  _applyLayoutMode() {
    const layout = this.shadowRoot.querySelector("#layout");
    if (!layout) return;
    const isWide = !!this._config?.wide_view;
    layout.classList.toggle("wide", isWide);
    const colL = layout.querySelector(".col-left");
    const colR = layout.querySelector(".col-right");
    if (colL && colR) {
      if (isWide) {
        const pct = Math.min(
          Math.max(parseInt(this._config?.col_left_width_pct, 10) || 50, 10),
          90,
        );
        colL.style.width = pct + "%";
        colR.style.width = 100 - pct + "%";
      } else {
        colL.style.width = "";
        colR.style.width = "";
      }
    }
  }

  _adjustSectionRowGap() {
    // 1. Climb out of the card to find the view container
    let element = this;
    while (element) {
      // Look for the Sections view component
      if (element.tagName === "HUI-SECTIONS-VIEW") {
        // 2. Inject the custom CSS variable directly into the view element
        element.style.setProperty("--ha-view-sections-row-gap", "0px");
        break;
      }

      // Cross shadow boundaries if they exist, otherwise look at parentNode
      element = element.parentNode || element.host;
    }
  }

  _isPanelView() {
    // In panel view the card is the sole child of the sections-view,
    // sitting directly inside the sections-view shadow root (no
    // intermediate section-wrapper or column element).
    // In sections / masonry / sidebar the card is nested deeper —
    // inside a column element within the sections-view.
    let el = this;
    while (el) {
      if (el.tagName === "HUI-SECTIONS-VIEW" && el.shadowRoot) {
        // Walk the sections-view shadow root looking for a
        // column / section wrapper between it and our card.
        return !this._hasAncestorInShadow(el.shadowRoot, this);
      }
      el = el.parentNode || el.host;
    }
    return false;
  }

  _hasAncestorInShadow(root, target) {
    // Returns true if `target` is found nested inside `root` with at
    // least one intermediate element (i.e. not a direct child).
    const walk = (node, depth) => {
      if (!node || depth > 15) return false;
      for (const child of node.children || []) {
        if (child === target) return depth > 0;
        if (child.shadowRoot && walk(child.shadowRoot, depth + 1)) return true;
        if (walk(child, depth)) return true;
      }
      return false;
    };
    return walk(root, 0);
  }

  static getConfigElement() {
    return document.createElement(CARD_TAG + "-editor");
  }
  static getStubConfig() {
    return {
      cameras: [{ entity: "camera.front_door", name: "Front Door" }],
      title: "Frigate",
      theme: "default",
      window_days: 3,
      window_hours: 72,
      stream_height_unit: "vh",
    };
  }
  setConfig(config) {
    const wasStarted = this._started === true;
    const prevConfig = this._config;
    let cameras;
    const normalizeCamera = (c) => {
      if (typeof c === "string") {
        return { entity: c, name: null };
      }
      if (c && typeof c === "object") {
        return {
          entity: c.entity || c.camera_entity || null,
          name: c.name || null,
        };
      }
      return { entity: null, name: null };
    };

    if (Array.isArray(config.cameras) && config.cameras.length) {
      cameras = config.cameras.map(normalizeCamera).filter((c) => c.entity);
    } else if (typeof config.cameras === "string" && config.cameras) {
      cameras = [normalizeCamera(config.cameras)].filter((c) => c.entity);
    } else if (config.cameras && typeof config.cameras === "object") {
      cameras = [normalizeCamera(config.cameras)].filter((c) => c.entity);
    } else if (config.camera_entity) {
      cameras = [{ entity: config.camera_entity, name: config.title || null }];
    } else if (config.camera) {
      cameras = [normalizeCamera(config.camera)].filter((c) => c.entity);
    } else if (config.entity && /^camera\./.test(String(config.entity))) {
      cameras = [{ entity: String(config.entity), name: config.title || null }];
    } else if (Array.isArray(config.entities) && config.entities.length) {
      cameras = config.entities
        .map((e) => (typeof e === "string" ? e : e?.entity))
        .filter((e) => typeof e === "string" && /^camera\./.test(e))
        .map((e) => ({ entity: e, name: null }));
    } else if (prevConfig?.cameras?.length) {
      cameras = prevConfig.cameras.map(normalizeCamera).filter((c) => c.entity);
    } else {
      cameras = [];
    }

    if (!cameras.length) {
      // Final safety fallback: keep card mountable instead of red error state.
      cameras = [{ entity: "camera.front_door", name: "Front Door" }];
    }
    if (cameras.length > 4) cameras = cameras.slice(0, 4);

    const legacyWindowHours = parseInt(config.window_hours, 10);
    const nextConfig = {
      cameras,
      title: config.title || null,
      subtitle: config.subtitle || null,
      window_days:
        normalizePositiveInteger(config.window_days, null) ||
        (Number.isFinite(legacyWindowHours) && legacyWindowHours > 0
          ? Math.max(1, Math.ceil(legacyWindowHours / 24))
          : 3),
      refresh_seconds: Math.max(15, config.refresh_seconds || 45),
      browse_expanded: config.browse_expanded === true,
      hidden_tabs: Array.isArray(config.hidden_tabs)
        ? config.hidden_tabs.map((id) => (id === "reviews" ? "alerts" : id))
        : [],
      stream_height: config.stream_height ? Number(config.stream_height) : null,
      stream_height_unit: config.stream_height_unit || "vh",
      theme: ["default", "light", "future"].includes(config.theme)
        ? config.theme
        : config.theme === "light"
          ? "light"
          : config.theme === "future"
            ? "future"
            : "default",
      tight_margins: config.tight_margins === true,
      wide_view: config.wide_view === true,
      col_left_width_pct: Number(config.col_left_width_pct) || 50,
    };
    this._config = nextConfig;
    this._browseOpen = this._config.browse_expanded;
    for (const c of cameras) {
      if (!this._camCache[c.entity]) this._camCache[c.entity] = mkCamState();
    }

    if (!wasStarted || !prevConfig) {
      this._renderShell();
      return;
    }

    const prevCams = prevConfig.cameras || [];
    const nextCams = nextConfig.cameras || [];
    const camerasChanged =
      prevCams.length !== nextCams.length ||
      prevCams.some((c, i) => c?.entity !== nextCams[i]?.entity);
    const hiddenTabsChanged =
      JSON.stringify(prevConfig.hidden_tabs || []) !==
      JSON.stringify(nextConfig.hidden_tabs || []);
    const needsShellRerender = hiddenTabsChanged;
    const needsEngineRemount = camerasChanged;

    if (needsEngineRemount) {
      this._cleanupEngine();
      this._activeCamIdx = Math.min(
        this._activeCamIdx,
        Math.max(0, nextCams.length - 1),
      );
    }

    if (needsShellRerender) {
      this._renderShell();
      this._mountEngine(null, { quiet: true });
      this._renderAll();
      return;
    }

    // Soft-update preview for schema edits without remounting live stream.
    this._applyCardStyle();
    this._applyLayoutMode();
    if (nextConfig.wide_view) this._syncColHeight();
    this._syncStatus();
    this._renderRange();
    this._renderStats();
    this._renderCamSwitcher();

    if (needsEngineRemount) {
      this._mountEngine(null, { quiet: true });
    }
  }
  set hass(hass) {
    this._hass = hass;
    if (!this._config) return;
    if (!this._started) {
      this._started = true;
      this._start();
      return;
    }
    this._syncStatus();
    this._applyCardStyle(); // re-evaluate theme colors on each update
    this._kickLiveIfStale();
  }
  get _activeCam() {
    return (
      this._config?.cameras[this._activeCamIdx] || this._config?.cameras[0]
    );
  }
  getCardSize() {
    return 1;
  }
  getGridSize() {
    return { columns: 2, rows: 3 };
  }
  disconnectedCallback() {
    if (this._refresh) clearInterval(this._refresh);
    if (this._unsub) {
      try {
        this._unsub.then((u) => u && u());
      } catch (_) {}
      this._unsub = null;
    }
    if (this._ro) this._ro.disconnect();
    this._ro = null;
    if (this._io) this._io.disconnect();
    this._io = null;
    if (this._resumeLiveT) clearTimeout(this._resumeLiveT);
    this._clearPopupMediaCleanup();
    if (this._onDocVisibility) {
      document.removeEventListener("visibilitychange", this._onDocVisibility);
    }
    if (this._onShadowError) {
      this.shadowRoot.removeEventListener("error", this._onShadowError, true);
    }
    if (this._popupHandlers) {
      const h = this._popupHandlers;
      h.header.removeEventListener("mousedown", h.onMouseDown);
      h.header.removeEventListener("touchstart", h.onTouchStart);
      document.removeEventListener("mousemove", h.onMouseMove);
      document.removeEventListener("touchmove", h.onTouchMove);
      document.removeEventListener("mouseup", h.onMouseUp);
      document.removeEventListener("touchend", h.onTouchEnd);
      this._popupHandlers = null;
    }
    if (this._onFullscreenChange) {
      document.removeEventListener(
        "fullscreenchange",
        this._onFullscreenChange,
      );
      document.removeEventListener(
        "webkitfullscreenchange",
        this._onFullscreenChange,
      );
    }
    if (this._onViewportRotate) {
      window.removeEventListener("resize", this._onViewportRotate);
      window.removeEventListener("orientationchange", this._onViewportRotate);
      window.visualViewport?.removeEventListener(
        "resize",
        this._onViewportRotate,
      );
      window.visualViewport?.removeEventListener(
        "scroll",
        this._onViewportRotate,
      );
    }
    if (this._rotateOverlayRaf) cancelAnimationFrame(this._rotateOverlayRaf);
    this._rotateOverlayRaf = 0;
    if (this._rotateOverlayExitT) clearTimeout(this._rotateOverlayExitT);
    this._rotateOverlayExitT = null;
    this._clearRotateOverlayAudioSync();
    this._clearRotateVideoFullscreenStyle();
    if (this._parentOrigStyle && this.parentElement) {
      this.parentElement.style.height = this._parentOrigStyle.height;
      this.parentElement.style.margin = this._parentOrigStyle.margin;
    }
    this._cleanupEngine();
  }
  // ── init ─────────────────────────────────────────────────
  async _start() {
    await this._discoverAll();
    const now = Math.floor(Date.now() / 1000);
    this._winEnd = now;
    this._winStart = now - this._config.window_days * DAY;

    this._mountEngine();
    await this._loadWindow(true);
    this._loadCalendar();
    this._subscribe();
    this._refresh = setInterval(() => {
      if (this._isNowWindow()) this._loadWindow(true);
    }, this._config.refresh_seconds * 1000);
    this._setupResizeObserver();
  }

  // Discover all cameras in parallel for faster startup
  async _discoverAll() {
    await Promise.all(
      this._config.cameras.map((c) => this._discoverOne(c.entity)),
    );
  }
  async _discoverOne(entity) {
    const cache = this._camCache[entity] || mkCamState();
    if (cache.discovered) return;
    const ent = this._hass.states[entity];
    if (!ent) return;
    cache.clientId =
      ent.attributes?.client_id || ent.attributes?.mqtt_client_id || "frigate";
    cache.cam = ent.attributes?.camera_name || entity.replace(/^camera\./, "");
    cache.discovered = true;
    this._camCache[entity] = cache;
  }

  // ── stream (browser-aware protocol) ────────────────────────
  _isFirefox() {
    const ua = navigator.userAgent || "";
    return /firefox/i.test(ua) && !/seamonkey/i.test(ua);
  }

  _isEdge() {
    const ua = navigator.userAgent || "";
    return /edg\//i.test(ua);
  }

  _isSafari() {
    const ua = navigator.userAgent || "";
    return /safari/i.test(ua) && !/chrome|chromium|crios|fxios|edg\//i.test(ua);
  }

  _useLegacyHaStreamPath() {
    // Keep conservative behavior for browsers explicitly marked as sensitive.
    return isIOS || this._isSafari() || this._isEdge();
  }

  _isEditorPreviewContext() {
    // In Lovelace card editor preview, avoid opening live stream sessions.
    let el = this;
    let depth = 0;
    while (el && depth < 48) {
      const tag = String(el.tagName || "").toUpperCase();
      if (
        tag === "HUI-CARD-PREVIEW" ||
        tag === "HUI-DIALOG-EDIT-CARD" ||
        tag === "HUI-CARD-OPTIONS"
      ) {
        return true;
      }
      const root = el.getRootNode?.();
      if (root?.host && root.host !== el) {
        el = root.host;
        depth += 1;
        continue;
      }
      el = el.parentNode || el.host;
      depth += 1;
    }
    return false;
  }

  _ffDebug(msg, data = null) {
    return;
  }

  _preferredStreamType() {
    return "webrtc";
  }

  _hlsStateObj(entity, streamType = null) {
    const raw = this._hass.states[entity];
    if (!raw) return null;
    const attrs = { ...raw.attributes };
    attrs.frontend_stream_type = streamType || this._preferredStreamType();
    return { ...raw, attributes: attrs };
  }

  _cleanupEngine() {
    if (this._pendingWebRTCTakeoverTimer) {
      clearTimeout(this._pendingWebRTCTakeoverTimer);
      this._pendingWebRTCTakeoverTimer = null;
    }
    this._clearRotateOverlayAudioSync();
    this._clearRotateVideoFullscreenStyle();
    const pending = this._pendingMountDestroyers || [];
    this._pendingMountDestroyers = [];
    for (const destroy of pending) {
      try {
        destroy();
      } catch (_) {}
    }
    const eng = this._engine;
    if (!eng) return;
    try {
      if (typeof eng.destroy === "function") eng.destroy();
      if (eng.ws && typeof eng.ws.close === "function") eng.ws.close();
      if (eng.pc && typeof eng.pc.close === "function") eng.pc.close();
    } catch (_) {}
    this._engine = null;
  }

  _streamAttemptSlot() {
    const slot = document.createElement("div");
    slot.style.cssText =
      "position:absolute;inset:0;visibility:hidden;pointer-events:none;overflow:hidden;";
    return slot;
  }

  _adoptMountedAttempt(targetSlot, result) {
    if (!targetSlot || !result?.slot || !result?.engine) return;
    targetSlot.innerHTML = "";
    while (result.slot.firstChild) {
      targetSlot.appendChild(result.slot.firstChild);
    }
    this._engine = result.engine;
    this._engineMountedMuted = this._streamMuted;
    this._setActiveStreamType(result.type);
    this._setStreamLoading(false);
    this._setStreamFallbackVisible(false);
    if (this._rotateOverlayActive) this._setLiveNativeControls(true);
  }

  async _raceMountAttempts(attempts) {
    return await new Promise((resolve) => {
      if (!attempts.length) {
        resolve(null);
        return;
      }
      let settled = 0;
      let resolved = false;
      const finish = (result) => {
        if (resolved) return;
        resolved = true;
        resolve(result);
      };
      for (const attempt of attempts) {
        attempt
          .then((result) => {
            settled += 1;
            if (result?.ok) {
              finish(result);
              return;
            }
            if (settled >= attempts.length) finish(null);
          })
          .catch(() => {
            settled += 1;
            if (settled >= attempts.length) finish(null);
          });
      }
    });
  }

  _go2rtcCodecs(isSupported) {
    const codecs = [
      "avc1.640029",
      "avc1.64002A",
      "avc1.640033",
      "hvc1.1.6.L153.B0",
      "mp4a.40.2",
      "mp4a.40.5",
      "flac",
      "opus",
    ];
    return codecs
      .filter((c) => isSupported(`video/mp4; codecs=\"${c}\"`))
      .join(",");
  }

  _normalizeGo2RTCCodecs(value) {
    if (!value) return "";
    const s = String(value).trim();
    const m = s.match(/codecs\s*=\s*"([^"]+)"/i);
    if (m && m[1]) return m[1].trim();
    if (/^video\//i.test(s)) return "";
    return s;
  }

  _waitForStreamStart(streamEl, timeoutMs = 3500, opts = {}) {
    const minCurrentTime = Number(opts.minCurrentTime ?? 0.05);
    const minDecodedFrames = Number(opts.minDecodedFrames ?? 1);
    const requireReadyState = Number(opts.requireReadyState ?? 0);
    const strict = opts.strict === true;
    return new Promise((resolve) => {
      let frameCallbackBound = false;
      let eventBound = false;
      const done = (ok) => {
        clearInterval(tick);
        clearTimeout(to);
        resolve(ok);
      };

      const tick = setInterval(() => {
        // stream elements often host the video inside shadow DOM.
        const v =
          streamEl.querySelector("video") ||
          streamEl.shadowRoot?.querySelector("video");
        if (!v) return;
        if (!frameCallbackBound && v.requestVideoFrameCallback) {
          frameCallbackBound = true;
          v.requestVideoFrameCallback(() => done(true));
        }

        // Fallback signals for browsers without requestVideoFrameCallback.
        if (!eventBound) {
          eventBound = true;
          const finish = () => {
            if (!strict) done(true);
          };
          v.addEventListener("loadeddata", finish, { once: true });
          v.addEventListener("canplay", finish, { once: true });
          v.addEventListener("playing", finish, { once: true });
          v.addEventListener("timeupdate", finish, { once: true });
        }

        const decoded =
          Number(v.webkitDecodedFrameCount) ||
          Number(v.getVideoPlaybackQuality?.().totalVideoFrames) ||
          0;
        const ready = Number(v.readyState) || 0;
        const timeOk = v.currentTime >= minCurrentTime;
        const decodeOk = decoded >= minDecodedFrames;
        if (ready >= requireReadyState && (timeOk || decodeOk)) done(true);
      }, 180);

      const to = setTimeout(() => done(false), timeoutMs);
    });
  }

  _startFirefoxLiveCatchup(video) {
    if (!video || !this._isFirefox()) return () => {};
    let firstFrameAt = 0;
    let hardSeekUsed = false;
    const t = setInterval(() => {
      try {
        const b = video.buffered;
        if (!b || !b.length) return;
        const end = b.end(b.length - 1);
        const cur = Number(video.currentTime) || 0;
        if (cur > 0.05 && !firstFrameAt) firstFrameAt = Date.now();
        const lag = end - cur;
        if (!Number.isFinite(lag) || lag <= 0) return;

        const sinceFirstFrame = firstFrameAt ? Date.now() - firstFrameAt : 0;

        // Startup phase: bias harder toward live edge so Firefox does
        // not sit behind by a few seconds after initial connect.
        if (sinceFirstFrame > 0 && sinceFirstFrame < 4000) {
          if (lag > 3.0 && !hardSeekUsed) {
            video.currentTime = Math.max(0, end - 0.08);
            video.playbackRate = 1.0;
            hardSeekUsed = true;
          } else if (lag > 1.5) video.playbackRate = 1.08;
          else if (lag > 0.7) video.playbackRate = 1.04;
          else video.playbackRate = 1.0;
          return;
        }

        // Steady state: keep near live edge with mild catch-up;
        // allow one hard correction only if still far behind.
        if (lag > 2.8 && !hardSeekUsed && sinceFirstFrame >= 4000) {
          video.currentTime = Math.max(0, end - 0.2);
          video.playbackRate = 1.0;
          hardSeekUsed = true;
        } else if (lag > 2.0) {
          video.playbackRate = 1.05;
        } else if (lag > 1.0) {
          video.playbackRate = 1.02;
        } else {
          video.playbackRate = 1.0;
        }
      } catch (_) {}
    }, 500);
    return () => clearInterval(t);
  }

  _applyVideoFit(videoEl) {
    if (!videoEl) return;
    const fit = () => {
      const w = Number(videoEl.videoWidth) || 0;
      const h = Number(videoEl.videoHeight) || 0;
      const ar = h > 0 ? w / h : 0;
      const host = videoEl.parentElement;
      const cw = Number(host?.clientWidth) || 0;
      const ch = Number(host?.clientHeight) || 0;
      const car = ch > 0 ? cw / ch : 0;
      const near169 = ar > 0 && Math.abs(ar - 16 / 9) < 0.08;
      const nearPanel = ar > 0 && car > 0 && Math.abs(ar - car) < 0.06;

      videoEl.style.display = "block";
      videoEl.style.width = "100%";
      videoEl.style.height = "100%";
      videoEl.style.objectPosition = "center center";
      videoEl.style.objectFit = near169 && nearPanel ? "cover" : "contain";
    };

    fit();
    videoEl.addEventListener("loadedmetadata", fit, { once: true });
  }

  _attachVideoFit(streamEl, retries = 12) {
    if (!streamEl) return;
    const v =
      streamEl.tagName?.toLowerCase() === "video"
        ? streamEl
        : streamEl.querySelector("video") ||
          streamEl.shadowRoot?.querySelector("video");
    if (v) {
      this._applyVideoFit(v);
      return;
    }
    if (retries <= 0) return;
    setTimeout(() => this._attachVideoFit(streamEl, retries - 1), 160);
  }

  _setStreamLoading(loading, text = "Loading…") {
    const el = this.shadowRoot?.querySelector("#stream-loading");
    if (!el) return;
    el.hidden = !loading;
    const label = el.querySelector(".label");
    if (label) label.textContent = text;
  }

  _setActiveStreamType(type) {
    this._activeStreamType = type || "--";
    this._renderStats();
  }

  _setStreamFallbackVisible(visible, refreshImage = false) {
    const fallback = this.shadowRoot?.querySelector("#stream-fallback");
    const status = this.shadowRoot?.querySelector("#stream-fallback-status");
    if (fallback) {
      fallback.hidden = !visible;
      if (!visible && status) status.hidden = true;
      if (visible && refreshImage) this._refreshStreamFallbackImage();
    }
  }

  async _streamFallbackUrl(entity) {
    if (!entity) return "";
    const cached = this._fallbackImgUrlCache.get(entity);
    if (cached && cached.url && cached.exp > Date.now()) return cached.url;

    const base = `/api/camera_proxy/${entity}`;
    const signed = await this._signed(base);

    const abs =
      /^https?:\/\//i.test(signed) || signed.startsWith("data:")
        ? signed
        : `${window.location.origin}${signed}`;
    this._fallbackImgUrlCache.set(entity, {
      url: abs,
      exp: Date.now() + 55 * 60 * 1000,
    });
    return abs;
  }

  _streamFallbackAltUrl(entity) {
    if (!entity) return "";
    const state = this._hass?.states?.[entity];
    const pic = state?.attributes?.entity_picture || "";
    if (!pic) return "";
    return /^https?:\/\//i.test(pic) || pic.startsWith("data:")
      ? pic
      : `${window.location.origin}${pic}`;
  }

  async _refreshStreamFallbackImage() {
    const img = this.shadowRoot?.querySelector("#stream-fallback-img");
    const status = this.shadowRoot?.querySelector("#stream-fallback-status");
    if (!img) return;
    const reqId = ++this._fallbackReqId;
    const entity = this._activeCam?.entity;
    const primarySrc = await this._streamFallbackUrl(entity);
    if (reqId !== this._fallbackReqId) return;
    const altSrc = this._streamFallbackAltUrl(entity);
    const src = primarySrc || altSrc;
    if (!src) return;
    if (status) status.hidden = true;
    img.onerror = () => {
      if (altSrc && img.src !== altSrc) {
        img.src = altSrc;
        return;
      }
      if (status) status.hidden = false;
    };
    img.onload = () => {
      if (status) status.hidden = true;
      const w = Number(img.naturalWidth) || 0;
      const h = Number(img.naturalHeight) || 0;
      const ar = h > 0 ? w / h : 0;
      const host = img.parentElement;
      const cw = Number(host?.clientWidth) || 0;
      const ch = Number(host?.clientHeight) || 0;
      const car = ch > 0 ? cw / ch : 0;
      const near169 = ar > 0 && Math.abs(ar - 16 / 9) < 0.08;
      const nearPanel = ar > 0 && car > 0 && Math.abs(ar - car) < 0.06;
      img.style.objectFit = near169 && nearPanel ? "cover" : "contain";
    };
    if (img.src !== src) img.src = src;
    img.alt = entity ? `${entity} snapshot` : "Camera snapshot";
  }

  async _go2rtcWebSocketUrl() {
    const { clientId, cam } = this._cc();
    if (!clientId || !cam) return null;
    const cacheKey = `${clientId}:${cam}`;
    const cached = this._go2rtcWsUrlCache.get(cacheKey);
    if (cached && cached.url && cached.exp > Date.now()) {
      return cached.url;
    }

    let path = `/api/frigate/${encodeURIComponent(clientId)}/mse/api/ws?src=${encodeURIComponent(cam)}`;

    // Frigate go2rtc websocket may require a signed HA path when accessed via
    // remote URLs/reverse proxies (seen as ws close 1006 in Firefox).
    try {
      const r = await this._hass.callWS({
        type: "auth/sign_path",
        path,
        expires: 3600,
      });
      if (r?.path) path = r.path;
      this._ffDebug("Signed go2rtc ws path", path);
    } catch (e) {
      this._ffDebug("Failed to sign go2rtc ws path", e?.message || String(e));
    }

    const abs = path.startsWith("http")
      ? path
      : `${window.location.origin}${path}`;
    const wsUrl = abs.replace(/^http/i, "ws");
    // Signed path expires in 1h; refresh a bit early.
    this._go2rtcWsUrlCache.set(cacheKey, {
      url: wsUrl,
      exp: Date.now() + 55 * 60 * 1000,
    });
    this._ffDebug("go2rtc websocket url", wsUrl);
    return wsUrl;
  }

  async _go2rtcHlsUrl() {
    const { clientId, cam } = this._cc();
    if (!clientId || !cam) return null;
    const cacheKey = `${clientId}:${cam}`;
    const cached = this._go2rtcHlsUrlCache.get(cacheKey);
    if (cached && cached.exp > Date.now()) return cached.url || null;

    const inFlight = this._go2rtcHlsProbeInFlight.get(cacheKey);
    if (inFlight) return inFlight;

    const candidates = [
      `/api/frigate/${encodeURIComponent(clientId)}/hls/${encodeURIComponent(cam)}/index.m3u8`,
      `/api/frigate/${encodeURIComponent(clientId)}/live/${encodeURIComponent(cam)}/index.m3u8`,
      `/api/frigate/${encodeURIComponent(clientId)}/vod/${encodeURIComponent(cam)}/index.m3u8`,
    ];

    const probePromise = (async () => {
      for (const p of candidates) {
        const signed = await this._signed(p);
        const abs = signed.startsWith("http")
          ? signed
          : `${window.location.origin}${signed}`;
        try {
          const resp = await fetch(abs, {
            method: "GET",
            cache: "no-store",
            credentials: "same-origin",
          });
          if (!resp.ok) continue;
          const ct = String(
            resp.headers.get("content-type") || "",
          ).toLowerCase();
          if (
            ct.includes("application/vnd.apple.mpegurl") ||
            ct.includes("application/x-mpegurl") ||
            ct.includes("audio/mpegurl") ||
            abs.toLowerCase().includes(".m3u8")
          ) {
            this._go2rtcHlsUrlCache.set(cacheKey, {
              url: abs,
              exp: Date.now() + 30 * 60 * 1000,
            });
            return abs;
          }
        } catch (_) {}
      }
      // Negative cache to avoid hammering known-missing endpoints every mount.
      this._go2rtcHlsUrlCache.set(cacheKey, {
        url: null,
        exp: Date.now() + 2 * 60 * 1000,
      });
      return null;
    })().finally(() => {
      this._go2rtcHlsProbeInFlight.delete(cacheKey);
    });

    this._go2rtcHlsProbeInFlight.set(cacheKey, probePromise);
    return probePromise;
  }

  async _tryMountGo2RTCMSE(slot, startup = null, options = {}) {
    const waitMs = Math.max(500, Number(startup?.waitMs ?? 8000));
    const minCurrentTime = Number(startup?.minCurrentTime ?? 0.2);
    const minDecodedFrames = Number(startup?.minDecodedFrames ?? 2);
    const requireReadyState = Number(startup?.requireReadyState ?? 3);
    const strict = startup?.strict !== false;
    const commit = options.commit !== false;

    if (!("WebSocket" in window) || !("MediaSource" in window)) {
      this._ffDebug("MSE unavailable in browser", {
        hasWebSocket: "WebSocket" in window,
        hasMediaSource: "MediaSource" in window,
      });
      return false;
    }

    const wsUrl = await this._go2rtcWebSocketUrl();
    if (!wsUrl) {
      this._ffDebug("Missing go2rtc websocket URL");
      return false;
    }
    this._ffDebug("Attempting direct go2rtc MSE stream mount");

    const video = document.createElement("video");
    video.autoplay = true;
    video.playsInline = true;
    video.muted = this._streamMuted;
    video.controls = false;
    video.style.cssText =
      "width:100%;height:100%;display:block;background:var(--c-bg-deep)";

    const ms = new MediaSource();
    video.src = URL.createObjectURL(ms);

    slot.innerHTML = "";
    slot.appendChild(video);
    this._attachVideoFit(video);

    const ws = new WebSocket(wsUrl);
    ws.binaryType = "arraybuffer";

    let sb = null;
    let queue = [];

    const appendNext = () => {
      if (!sb || sb.updating || !queue.length) return;
      try {
        sb.appendBuffer(queue.shift());
      } catch (_) {
        queue = [];
      }
    };

    const stopCatchup = this._startFirefoxLiveCatchup(video);
    const destroy = () => {
      try {
        ws.close();
      } catch (_) {}
      try {
        stopCatchup();
      } catch (_) {}
      try {
        if (video.src) URL.revokeObjectURL(video.src);
      } catch (_) {}
    };

    const engine = { video, ws, destroy };
    if (commit) this._engine = engine;

    ms.addEventListener(
      "sourceopen",
      () => {
        this._ffDebug("MediaSource opened", {
          wsReadyState: ws.readyState,
        });
        if (ws.readyState !== WebSocket.OPEN) return;
        const codecs = this._go2rtcCodecs(MediaSource.isTypeSupported);
        this._ffDebug("Sending MSE codecs", codecs || "<empty>");
        ws.send(JSON.stringify({ type: "mse", value: codecs }));
      },
      { once: true },
    );

    ws.addEventListener("open", () => {
      this._ffDebug("go2rtc websocket opened");
      if (ms.readyState === "open") {
        const codecs = this._go2rtcCodecs(MediaSource.isTypeSupported);
        this._ffDebug("Sending MSE codecs on ws open", codecs || "<empty>");
        ws.send(JSON.stringify({ type: "mse", value: codecs }));
      }
    });

    ws.addEventListener("error", () => {
      this._ffDebug("go2rtc websocket error");
    });

    ws.addEventListener("close", (ev) => {
      this._ffDebug("go2rtc websocket closed", {
        code: ev.code,
        reason: ev.reason,
        wasClean: ev.wasClean,
      });
    });

    ws.addEventListener("message", (ev) => {
      if (typeof ev.data === "string") {
        let msg;
        try {
          msg = JSON.parse(ev.data);
        } catch (_) {
          this._ffDebug("Received non-JSON text message");
          return;
        }

        this._ffDebug("Received go2rtc JSON message", msg?.type || "<unknown>");
        if (msg?.type === "mse" && msg.value && ms.readyState === "open") {
          try {
            const codecs = this._normalizeGo2RTCCodecs(msg.value);
            if (!codecs) {
              this._ffDebug(
                "Could not parse codecs from go2rtc mse message",
                msg.value,
              );
              return;
            }
            const mime = `video/mp4; codecs=\"${codecs}\"`;
            this._ffDebug("Creating SourceBuffer", mime);
            if (!MediaSource.isTypeSupported(mime)) return;
            sb = ms.addSourceBuffer(mime);
            sb.mode = "segments";
            sb.addEventListener("updateend", appendNext);
            appendNext();
          } catch (e) {
            this._ffDebug(
              "SourceBuffer creation failed",
              e?.message || String(e),
            );
          }
        }
        return;
      }

      if (!(ev.data instanceof ArrayBuffer)) return;
      this._ffDebug("Received binary MSE chunk", ev.data.byteLength);
      queue.push(ev.data);
      appendNext();
    });

    const started = await this._waitForStreamStart(slot, waitMs, {
      minCurrentTime,
      minDecodedFrames,
      requireReadyState,
      strict,
    });
    if (!started) {
      this._ffDebug("Direct go2rtc MSE did not start within timeout");
      destroy();
      return false;
    }

    if (!commit) return { ok: true, type: "mse", engine, slot };
    this._setActiveStreamType("mse");
    this._ffDebug("Direct go2rtc MSE started successfully");
    this._setStreamLoading(false);
    this._setStreamFallbackVisible(false);
    return true;
  }

  async _tryMountGo2RTCWebRTC(slot, startup = null, options = {}) {
    const waitMs = Math.max(500, Number(startup?.waitMs ?? 7000));
    const minCurrentTime = Number(
      startup?.minCurrentTime ?? (this._isFirefox() ? 0.15 : 0.05),
    );
    const minDecodedFrames = Number(
      startup?.minDecodedFrames ?? (this._isFirefox() ? 2 : 1),
    );
    const requireReadyState = Number(
      startup?.requireReadyState ?? (this._isFirefox() ? 3 : 0),
    );
    const strict = startup?.strict ?? (this._isFirefox() ? true : false);
    const commit = options.commit !== false;

    if (!("RTCPeerConnection" in window) || !("WebSocket" in window)) {
      return false;
    }

    const wsUrl = await this._go2rtcWebSocketUrl();
    if (!wsUrl) return false;

    const video = document.createElement("video");
    video.autoplay = true;
    video.playsInline = true;
    video.muted = this._streamMuted;
    video.controls = false;
    video.style.cssText =
      "width:100%;height:100%;display:block;background:var(--c-bg-deep)";

    slot.innerHTML = "";
    slot.appendChild(video);
    this._attachVideoFit(video);

    const pc = new RTCPeerConnection({
      bundlePolicy: "max-bundle",
      sdpSemantics: "unified-plan",
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });
    const ws = new WebSocket(wsUrl);

    const destroy = () => {
      try {
        ws.close();
      } catch (_) {}
      try {
        pc.close();
      } catch (_) {}
    };

    const engine = { video, pc, ws, destroy };
    if (commit) this._engine = engine;

    pc.addTransceiver("video", { direction: "recvonly" });
    pc.addTransceiver("audio", { direction: "recvonly" });

    pc.addEventListener("track", (ev) => {
      if (ev.streams && ev.streams[0]) {
        video.srcObject = ev.streams[0];
      } else {
        const ms = video.srcObject || new MediaStream();
        ms.addTrack(ev.track);
        video.srcObject = ms;
      }
      video.play().catch(() => {});
    });

    pc.addEventListener("icecandidate", (ev) => {
      if (ws.readyState !== WebSocket.OPEN) return;
      const candidate = ev.candidate ? ev.candidate.toJSON().candidate : "";
      ws.send(JSON.stringify({ type: "webrtc/candidate", value: candidate }));
    });

    ws.addEventListener("message", (ev) => {
      let msg;
      try {
        msg = JSON.parse(ev.data);
      } catch (_) {
        return;
      }
      if (msg?.type === "webrtc/answer") {
        pc.setRemoteDescription({
          type: "answer",
          sdp: msg.value,
        }).catch(() => {});
      } else if (msg?.type === "webrtc/candidate") {
        pc.addIceCandidate({ candidate: msg.value, sdpMid: "0" }).catch(
          () => {},
        );
      }
    });

    ws.addEventListener("open", async () => {
      try {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        ws.send(JSON.stringify({ type: "webrtc/offer", value: offer.sdp }));
      } catch (_) {}
    });

    const started = await this._waitForStreamStart(slot, waitMs, {
      minCurrentTime,
      minDecodedFrames,
      requireReadyState,
      strict,
    });
    if (!started) {
      destroy();
      return false;
    }
    if (!commit) return { ok: true, type: "webrtc", engine, slot };
    this._setActiveStreamType("webrtc");
    this._setStreamLoading(false);
    this._setStreamFallbackVisible(false);
    return true;
  }

  async _tryMountGo2RTCHLS(slot, startup = null, options = {}) {
    const waitMs = Math.max(500, Number(startup?.waitMs ?? 5000));
    const commit = options.commit !== false;
    const hlsUrl = await this._go2rtcHlsUrl();
    if (!hlsUrl) return false;

    const video = document.createElement("video");
    video.autoplay = true;
    video.playsInline = true;
    video.muted = this._streamMuted;
    video.controls = false;
    video.style.cssText =
      "width:100%;height:100%;display:block;background:var(--c-bg-deep)";
    video.src = hlsUrl;

    slot.innerHTML = "";
    slot.appendChild(video);
    this._attachVideoFit(video);

    const destroy = () => {
      try {
        video.pause();
        video.removeAttribute("src");
        video.load();
      } catch (_) {}
    };
    const engine = { video, destroy };
    if (commit) this._engine = engine;

    const started = await this._waitForStreamStart(video, waitMs, {
      minCurrentTime: 0.05,
      minDecodedFrames: 1,
      requireReadyState: 2,
      strict: false,
    });
    if (!started) {
      destroy();
      return false;
    }
    if (!commit) return { ok: true, type: "hls", engine, slot };
    this._setActiveStreamType("hls");
    this._setStreamLoading(false);
    this._setStreamFallbackVisible(false);
    return true;
  }

  async _mountEngine(forcedType = null, options = {}) {
    const quiet = options?.quiet === true;
    const slot = this.shadowRoot.querySelector("#engine");
    if (!slot) return;
    const entity = this._activeCam?.entity;
    if (!entity) return;
    if (this._mountInProgress && this._mountTargetEntity === entity) return;
    this._engineMountedMuted = this._streamMuted;
    const mountToken = ++this._mountSeq;
    this._mountInProgress = true;
    this._mountTargetEntity = entity;
    try {
      this._cleanupEngine();
      slot.innerHTML = "";
      if (!quiet) {
        this._setActiveStreamType("--");
        this._setStreamFallbackVisible(true, true);
        this._setStreamLoading(true);
      } else {
        this._setStreamFallbackVisible(false);
        this._setStreamLoading(false);
      }

      if (this._isEditorPreviewContext()) {
        // Keep preview lightweight and connection-safe in editor mode.
        this._setActiveStreamType("snapshot");
        this._setStreamLoading(false);
        this._setStreamFallbackVisible(true, true);
        return;
      }

      if (this._useLegacyHaStreamPath()) {
        const streamType = forcedType || this._preferredStreamType();
        this._ffDebug("Mounting legacy HA stream type", streamType);
        this._setActiveStreamType(streamType);
        const stateObj = this._hlsStateObj(entity, streamType);
        if (!stateObj) {
          this._setStreamLoading(false);
          this._setStreamFallbackVisible(false);
          return;
        }

        const s = document.createElement("ha-camera-stream");
        s.hass = this._hass;
        s.stateObj = stateObj;
        s.controls = false;
        s.muted = this._streamMuted;
        s.style.cssText = "width:100%;height:100%;display:block";

        slot.innerHTML = "";
        slot.appendChild(s);
        this._engine = s;
        this._engineMountedMuted = this._streamMuted;
        this._attachVideoFit(s);
        if (this._rotateOverlayActive) this._setLiveNativeControls(true);

        this._waitForStreamStart(s, 8000, {
          minCurrentTime: 0.05,
          minDecodedFrames: 1,
          requireReadyState: 0,
          strict: false,
        }).then((ok) => {
          if (ok && this._engine === s) {
            this._setStreamLoading(false);
            this._setStreamFallbackVisible(false);
            if (this._rotateOverlayActive) this._setLiveNativeControls(true);
          }
        });
        setTimeout(() => {
          if (this._engine === s) {
            this._setStreamLoading(false);
            this._setStreamFallbackVisible(false);
            if (this._rotateOverlayActive) this._setLiveNativeControls(true);
          }
        }, 1200);
        return;
      }

      if (forcedType) {
        const starters = {
          webrtc: () => this._tryMountGo2RTCWebRTC(slot, { waitMs: 7000 }),
          mse: () =>
            this._tryMountGo2RTCMSE(slot, {
              waitMs: 7000,
              minCurrentTime: 0.05,
              minDecodedFrames: 1,
              requireReadyState: 2,
              strict: false,
            }),
          hls: () => this._tryMountGo2RTCHLS(slot, { waitMs: 5000 }),
        };
        if (await starters[forcedType]?.()) return;
      } else {
        const attempts = [
          {
            type: "webrtc",
            start: () =>
              this._tryMountGo2RTCWebRTC(
                this._streamAttemptSlot(),
                { waitMs: 7000 },
                { commit: false },
              ),
          },
          {
            type: "mse",
            start: () =>
              this._tryMountGo2RTCMSE(
                this._streamAttemptSlot(),
                {
                  waitMs: 7000,
                  minCurrentTime: 0.05,
                  minDecodedFrames: 1,
                  requireReadyState: 2,
                  strict: false,
                },
                { commit: false },
              ),
          },
        ];

        const activeAttempts = attempts.map((attempt) => {
          const promise = Promise.resolve()
            .then(() => attempt.start())
            .catch(() => false);
          return { type: attempt.type, promise };
        });

        this._pendingMountDestroyers = activeAttempts.map((attempt) => () => {
          attempt.promise.then((result) => {
            if (result?.engine?.destroy) {
              try {
                result.engine.destroy();
              } catch (_) {}
            }
          });
        });

        const winner = await this._raceMountAttempts(
          activeAttempts.map((attempt) => attempt.promise),
        );

        if (mountToken !== this._mountSeq) {
          if (winner?.engine?.destroy) winner.engine.destroy();
          return;
        }

        const destroyLosers = async () => {
          for (const attempt of activeAttempts) {
            const result = await attempt.promise.catch(() => null);
            if (!result?.ok || result.type === winner?.type) continue;
            try {
              result.engine?.destroy?.();
            } catch (_) {}
          }
          this._pendingMountDestroyers = [];
        };

        const scheduleWebRTCTakeover = () => {
          if (!winner?.ok || winner.type === "webrtc") return false;
          const webrtcAttempt = activeAttempts.find(
            (attempt) => attempt.type === "webrtc",
          );
          if (!webrtcAttempt) return false;

          let takeoverExpired = false;
          this._pendingWebRTCTakeoverTimer = setTimeout(() => {
            takeoverExpired = true;
            this._pendingWebRTCTakeoverTimer = null;
            webrtcAttempt.promise.then((result) => {
              try {
                result?.engine?.destroy?.();
              } catch (_) {}
            });
          }, 30000);

          webrtcAttempt.promise
            .then((result) => {
              if (
                !result?.ok ||
                takeoverExpired ||
                mountToken !== this._mountSeq ||
                this._activeStreamType === "webrtc"
              ) {
                if (takeoverExpired || mountToken !== this._mountSeq) {
                  try {
                    result?.engine?.destroy?.();
                  } catch (_) {}
                }
                return;
              }
              if (this._pendingWebRTCTakeoverTimer) {
                clearTimeout(this._pendingWebRTCTakeoverTimer);
                this._pendingWebRTCTakeoverTimer = null;
              }
              try {
                this._engine?.destroy?.();
              } catch (_) {}
              this._adoptMountedAttempt(slot, result);
            })
            .catch(() => {});

          return true;
        };

        if (winner?.ok) {
          this._adoptMountedAttempt(slot, winner);
          if (scheduleWebRTCTakeover()) {
            activeAttempts
              .filter(
                (attempt) =>
                  attempt.type !== winner.type && attempt.type !== "webrtc",
              )
              .forEach((attempt) => {
                attempt.promise.then((result) => {
                  try {
                    result?.engine?.destroy?.();
                  } catch (_) {}
                });
              });
            this._pendingMountDestroyers = [
              () => {
                if (this._pendingWebRTCTakeoverTimer) {
                  clearTimeout(this._pendingWebRTCTakeoverTimer);
                  this._pendingWebRTCTakeoverTimer = null;
                }
              },
              ...activeAttempts
                .filter(
                  (attempt) =>
                    attempt.type !== winner.type && attempt.type !== "webrtc",
                )
                .map((attempt) => () => {
                  attempt.promise.then((result) => {
                    try {
                      result?.engine?.destroy?.();
                    } catch (_) {}
                  });
                }),
            ];
          } else {
            destroyLosers();
          }
          return;
        }
        await destroyLosers();
      }

      // go2rtc attempts failed: show snapshot fallback.
      this._setActiveStreamType("snapshot");
      this._setStreamLoading(false);
      this._setStreamFallbackVisible(true);
    } finally {
      if (mountToken === this._mountSeq) {
        this._mountInProgress = false;
        this._mountTargetEntity = "";
      }
    }
  }
  // ── view mode ─────────────────────────────────────────────
  _setViewMode(mode) {
    this._viewMode = mode;
    const card = this.shadowRoot.querySelector(".card");
    const engWrap = this.shadowRoot.querySelector("#eng-wrap");

    if (engWrap) engWrap.style.display = "";

    this._eventsMode = "camera";
    this._mountEngine();
    this._renderAll();

    //this._renderCamSwitcher();
    this._applyBrowse();
    this.shadowRoot
      .querySelectorAll("[data-viewmode]")
      .forEach((p) =>
        p.classList.toggle("active", p.dataset.viewmode === mode),
      );
  }
  // ── camera switching ──────────────────────────────────────
  async _switchCamera(idx) {
    const popupOpen = this._$("#myPopup")?.classList.contains("is-open");
    if (idx === this._activeCamIdx && this._viewMode === "single" && !popupOpen)
      return;

    const prevEnt = this._activeCam?.entity;
    if (prevEnt && this._camCache[prevEnt]) {
      this._camCache[prevEnt].events = this._events;
      this._camCache[prevEnt].recordings = this._recordings;
    }
    this._activeCamIdx = idx;
    const newEnt = this._activeCam?.entity;
    if (!this._camCache[newEnt]) this._camCache[newEnt] = mkCamState();
    if (!this._camCache[newEnt].discovered) this._discoverOne(newEnt);
    const cached = this._camCache[newEnt];
    this._events = cached.events || [];
    this._recordings = cached.recordings || [];
    this._reviews = cached.reviews || [];
    this._kept = cached.kept || [];
    // Camera button should always return to single live view.
    this._viewMode = "single";
    if (popupOpen) this._closePopup();
    const engWrap = this.shadowRoot.querySelector("#eng-wrap");
    if (engWrap) engWrap.style.display = "";
    this.shadowRoot
      .querySelectorAll("[data-viewmode]")
      .forEach((p) =>
        p.classList.toggle("active", p.dataset.viewmode === "single"),
      );
    //this._renderCamSwitcher();
    this._renderCamSwitcher();
    this._syncStatus();
    this._renderStats();
    this._streamMuted = true;
    this._renderMuteButton();
    this._mountEngine();
    clearTimeout(this._switchLoadT);
    const loadDelay = this._isFirefox() ? 500 : 100;
    this._switchLoadT = setTimeout(() => this._loadWindow(true), loadDelay);
  }
  // ── data ─────────────────────────────────────────────────
  _cc() {
    return this._camCache[this._activeCam?.entity] || mkCamState();
  }
  async _ws(p) {
    return parseWs(await this._hass.callWS(p));
  }
  _isNowWindow() {
    return Math.abs(this._winEnd - Math.floor(Date.now() / 1000)) < 120;
  }
  async _fetchWindowedEvents(clientId, cam, after, before) {
    const items = [];
    const seen = new Set();
    const afterTs = Math.floor(after);
    let cursorBefore = Math.floor(before);
    for (let page = 0; page < WINDOW_FETCH_PAGE_LIMIT; page++) {
      const batch = await this._ws({
        type: "frigate/events/get",
        instance_id: clientId,
        cameras: [cam],
        after: afterTs,
        before: cursorBefore,
        limit: EVENT_FETCH_BATCH,
      });
      if (!Array.isArray(batch) || !batch.length) break;
      for (const item of batch) {
        if (!item?.id || seen.has(item.id)) continue;
        seen.add(item.id);
        items.push(item);
      }
      const oldest = Math.min(
        ...batch.map((item) => Math.floor(item?.start_time || before)),
      );
      if (batch.length < EVENT_FETCH_BATCH || oldest <= afterTs) break;
      cursorBefore = oldest - 1;
    }
    return items;
  }
  async _fetchWindowedReviews(clientId, cam, after, before) {
    const items = [];
    const seen = new Set();
    const afterTs = Math.floor(after);
    let cursorBefore = Math.floor(before);
    for (let page = 0; page < WINDOW_FETCH_PAGE_LIMIT; page++) {
      const batch = await this._ws({
        type: "frigate/reviews/get",
        instance_id: clientId,
        cameras: [cam],
        after: afterTs,
        before: cursorBefore,
        limit: REVIEW_FETCH_BATCH,
      });
      if (!Array.isArray(batch) || !batch.length) break;
      for (const item of batch) {
        if (!item?.id || seen.has(item.id)) continue;
        seen.add(item.id);
        items.push(item);
      }
      const oldest = Math.min(
        ...batch.map((item) => Math.floor(item?.start_time || before)),
      );
      if (batch.length < REVIEW_FETCH_BATCH || oldest <= afterTs) break;
      cursorBefore = oldest - 1;
    }
    return items;
  }
  async _loadWindow(replace) {
    if (this._loading) return;
    this._loading = true;
    if (replace) this._exhausted = false;
    const { clientId, cam } = this._cc();
    if (!clientId || !cam) {
      this._loading = false;
      return;
    }
    const after = this._winStart,
      before = this._winEnd;
    const recAfter = Math.max(0, before - RECORDINGS_WINDOW);
    const evPromise = this._fetchWindowedEvents(clientId, cam, after, before)
      .then((ev) => {
        this._events = Array.isArray(ev) ? ev : [];
        const ent = this._activeCam?.entity;
        if (ent && this._camCache[ent]) {
          this._camCache[ent].events = this._events;
        }
        // Render list ASAP once events arrive.
        this._renderList();
        this._renderStats();
      })
      .catch((e) => {
        console.error("[Frigate] events", e);
        this._events = [];
      });

    const recPromise = this._ws({
      type: "frigate/recordings/get",
      instance_id: clientId,
      camera: cam,
      after: recAfter,
      before,
    })
      .then((rec) => {
        this._recordings = Array.isArray(rec) ? rec : [];
      })
      .catch(() => {
        this._recordings = [];
      });

    await Promise.allSettled([evPromise, recPromise]);
    const ent = this._activeCam?.entity;
    if (ent && this._camCache[ent]) {
      this._camCache[ent].events = this._events;
      this._camCache[ent].recordings = this._recordings;
    }
    if (this._tab === "alerts") await this._loadReviews();
    this._loading = false;
    if (this._eventsMode === "all") this._loadAllCamsBackground();
    this._renderAll();
  }
  async _loadKept() {
    const { clientId, cam } = this._cc();
    try {
      const k = await this._ws({
        type: "frigate/events/get",
        instance_id: clientId,
        cameras: [cam],
        favorites: true,
        limit: 200,
      });
      this._kept = Array.isArray(k) ? k : [];
      const ent = this._activeCam?.entity;
      if (ent && this._camCache[ent]) this._camCache[ent].kept = this._kept;
    } catch (_) {
      this._kept = [];
    }
  }
  async _loadReviews() {
    const { clientId, cam } = this._cc();
    try {
      const r = await this._fetchWindowedReviews(
        clientId,
        cam,
        this._winStart,
        this._winEnd,
      );
      this._reviews = Array.isArray(r) ? r : [];
    } catch (_) {
      this._reviews = [];
    }
  }
  async _loadCalendar() {
    const { clientId, cam } = this._cc();
    try {
      const sum = await this._ws({
        type: "frigate/events/summary",
        instance_id: clientId,
        timezone: this._tz(),
      });
      if (Array.isArray(sum))
        this._daysWithActivity = new Set(
          sum.filter((s) => s.camera === cam && s.day).map((s) => s.day),
        );
    } catch (_) {}
  }
  _tz() {
    return (
      this._hass?.config?.time_zone ||
      Intl.DateTimeFormat().resolvedOptions().timeZone ||
      "UTC"
    );
  }
  _tzOffsetMinutesAt(epochMs, tz = this._tz()) {
    const dtf = new Intl.DateTimeFormat("en-US", {
      timeZone: tz,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hourCycle: "h23",
    });
    const parts = dtf.formatToParts(new Date(epochMs));
    const pick = (type) =>
      Number(parts.find((p) => p.type === type)?.value || 0);
    const y = pick("year");
    const m = pick("month");
    const d = pick("day");
    const hh = pick("hour");
    const mm = pick("minute");
    const ss = pick("second");
    const asUtcMs = Date.UTC(y, m - 1, d, hh, mm, ss);
    return (asUtcMs - epochMs) / 60000;
  }
  _tzDateTimeToEpochSeconds(y, mo, d, hh = 0, mm = 0, ss = 0) {
    // Convert a wall-clock datetime in HA timezone to Unix seconds.
    let epochMs = Date.UTC(y, mo - 1, d, hh, mm, ss);
    for (let i = 0; i < 3; i++) {
      const offMin = this._tzOffsetMinutesAt(epochMs);
      epochMs = Date.UTC(y, mo - 1, d, hh, mm, ss) - offMin * 60000;
    }
    return Math.floor(epochMs / 1000);
  }
  _tzParts(tsSec) {
    const dtf = new Intl.DateTimeFormat("en-US", {
      timeZone: this._tz(),
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hourCycle: "h23",
    });
    const parts = dtf.formatToParts(new Date(tsSec * 1000));
    const pick = (type) =>
      Number(parts.find((p) => p.type === type)?.value || 0);
    return {
      year: pick("year"),
      month: pick("month"),
      day: pick("day"),
      hour: pick("hour"),
      minute: pick("minute"),
      second: pick("second"),
    };
  }
  async _subscribe() {
    const { clientId } = this._cc();
    if (!this._hass?.connection || !clientId) return;
    try {
      this._unsub = this._hass.connection.subscribeMessage(
        (msg) => {
          if (msg?.type === "end" && this._isNowWindow())
            this._scheduleReload();
        },
        { type: "frigate/events/subscribe", instance_id: clientId },
      );
    } catch (_) {}
  }
  _scheduleReload() {
    clearTimeout(this._rt);
    this._rt = setTimeout(() => this._loadWindow(true), 1500);
  }
  // ── shell ─────────────────────────────────────────────────
  _renderShell() {
    const title =
      this._config.title ||
      (this._config.cameras.length === 1
        ? cap(camDisplayName(this._config.cameras[0]))
        : "Cameras") ||
      "Camera";
    const sub = this._config.subtitle || "Frigate";
    const multiCam = this._config.cameras.length > 1;
    const ht = new Set(this._config.hidden_tabs || []);
    const tabOrder = ["alerts", "clips", "snapshot", "recordings", "kept"];
    const activeTab =
      !ht.has(this._tab) && tabOrder.includes(this._tab)
        ? this._tab
        : tabOrder.find((id) => !ht.has(id)) || "alerts";
    this._tab = activeTab;
    const tab = (id, icon, label) =>
      ht.has(id)
        ? ""
        : id === activeTab
          ? `<div class="pill active" data-tab="${id}" title="${label}">${icon}</div>`
          : `<div class="pill icon-only" data-tab="${id}" title="${label}">${icon}</div>`;

    this.shadowRoot.innerHTML = `<style>${STYLES}</style>
    <ha-card class="card ${this._config.theme === "light" ? "theme-light" : this._config.theme === "future" ? "theme-future" : ""}" id="card">

        <div class="layout" id="layout">

          <div class="col-left" id="col-left">
            <div class="feed-area">
              <div id="eng-wrap">
                <div id="engine">
                  <div class="ph">${ICONS.live}<span>Connecting…</span></div>
                </div>
                  <button class="overlay-fs live-fs-btn" id="live-fs-btn" title="Fullscreen live" aria-label="Fullscreen live">${ICONS.expand}</button>
                  <div id="stream-fallback" hidden>
                    <img id="stream-fallback-img" alt="Camera snapshot">
                  </div>
                  <div class="stream-fallback-status" id="stream-fallback-status" hidden>Snapshot unavailable</div>
                  <div class="stream-loading" id="stream-loading" hidden>
                    <span class="dot"></span><span class="label">Loading…</span>
                  </div>
              </div>
            </div>

            <div class="info-row">
              <div>
                <div class="info-title" id="info-title">${title}</div>
                <span class="section-label" id="tl-range">${sub}</span>
              </div>
              <div class="stats">
                                <div class="stat"><div class="sv">v${VERSION}</div><div class="sl">Version</div></div>
                                <div class="stat"><div class="sv stream-type" id="stream-type">--</div><div class="sl">Stream</div></div>
                <button class="info-mute" id="mute-btn" title="${this._streamMuted ? "Unmute live view" : "Mute live view"}" aria-label="${this._streamMuted ? "Unmute live view" : "Mute live view"}">${this._streamMuted ? ICONS.volOff : ICONS.volOn}</button>
                <div class="stat">
                  <div class="sv" id="ev-count">—</div>
                  <div class="sl">Events</div></div>
                  <div class="stat"><div class="sv" id="on-dot" style="color:#4ade80">●</div>
                  <div class="sl" id="on-lbl">Online</div>
                </div>
              </div>
            </div>
            ${multiCam ? `<div class="cam-switcher" id="cam-switcher"></div>` : ""}
          </div>
          <div class="resize-handle" id="resize-handle"></div>
          <div class="col-right" id="col-right"> 
            <div class="tabs">
              ${tab("alerts", ICONS.alerts, "Alerts")}
              ${tab("clips", ICONS.clips, "Clips")}
              ${tab("snapshot", ICONS.snapshot, "Snapshots")}
              ${tab("recordings", ICONS.recordings, "Recordings")}
              ${tab("kept", ICONS.star, "Kept events")}
              <div class="tl-tools" style=" margin-left: auto;">
                <button class="tool" id="now-btn" title="Today">${ICONS.bullseye}</button>
                <button class="tool" id="filter-btn" title="Filter">${ICONS.filter}</button>
                <button class="tool" id="cal-btn" title="Calendar">${ICONS.calendar}</button>
              </div>
            </div>
         
            <div class="browse" id="browse" style="display:none">
              <div style="background:#555555;height:29px;width:100%;position:sticky;top:0;left:0;z-index:1;">Text</div>
              <div class="filter-panel" id="filter-panel" style="display:none"></div>
              <div class="cal-panel" id="cal-panel" style="display:none"></div>

              <div class="list-sec">
                <div class="list-head">
                  <span class="section-label" id="list-label">Recent Alerts</span>
                  <span class="newtoast" id="newtoast" style="display:none">new ✦</span>
                </div>
                <div class="diag" id="diag" style="display:none"></div>
                <div class="list" id="list">
                  <div class="empty">Loading…</div>
                </div>
                                
              </div>              
            </div>
            <div class="frigate-view">${ICONS.frigateview}</div>
            <div class="more" id="older-hint" hidden>scroll for older…</div>
          </div>
        </div>
        <!--<div class="toast" id="toast" style="display:none"></div>-->


          <div id="myPopup" class="popup-content">
                        <div class="popup-close-row">
              <button class="close-btn" aria-label="Close">&times;</button> 
            </div>
            <div class="popup-header"></div>          
            <div class="popup-body">
              <div class="viewer" id="viewer" style="display:none"></div>
                                                                                                                <h2 class="popup-info-head" id="popup-info-head" hidden></h2>
                            <div class="recording-scrub" id="recording-scrub" hidden><div class="recording-scrub-track" id="recording-scrub-track"><div class="recording-scrub-markers" id="recording-scrub-markers"></div><div class="recording-scrub-cursor" id="recording-scrub-cursor"></div></div></div>
                            <div class="popup-info" id="popup-info" hidden></div>
                            <h1 class="popup-shell-ver" id="popup-shell-ver">v${VERSION}</h1>
            </div>
          </div>
      </ha-card>`;
    this._domCache = {}; // invalidate DOM element cache after full re-render
    this._initPopupInteractions();
    this._applyBrowse();
    this._applyCardStyle();
    this._applyLayoutMode();
    this._bindListScroll();
    this._initResizeHandle();
  }

  _initResizeHandle() {
    const handle = this.shadowRoot.querySelector("#resize-handle");
    if (!handle) return;
    let dragging = false;
    let startX = 0;
    let startLeftWidth = 0;
    let layoutWidth = 0;

    const onMouseDown = (e) => {
      e.preventDefault();
      dragging = true;
      startX = e.clientX;
      const layout = this.shadowRoot.querySelector("#layout");
      layoutWidth = layout.getBoundingClientRect().width;
      const colL = this.shadowRoot.querySelector(".col-left");
      startLeftWidth = colL.getBoundingClientRect().width;
      handle.classList.add("active");
      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
    };

    const onMouseMove = (e) => {
      if (!dragging) return;
      const colL = this.shadowRoot.querySelector(".col-left");
      const colR = this.shadowRoot.querySelector(".col-right");
      const minPct = 10;
      const maxPct = 90;
      const dx = e.clientX - startX;
      let newLeftWidth = startLeftWidth + dx;
      let pct = (newLeftWidth / layoutWidth) * 100;
      pct = Math.max(minPct, Math.min(maxPct, pct));
      if (colL) colL.style.width = pct + "%";
      if (colR) colR.style.width = 100 - pct + "%";
      this._syncColHeight();
    };

    const onMouseUp = () => {
      dragging = false;
      handle.classList.remove("active");
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };

    handle.addEventListener("mousedown", onMouseDown);
  }

  _bindListScroll() {
    const list = this._$("#list");
    const browse = this._$("#browse");
    if (!list && !browse) return;

    const onScroll = () => {
      this._syncOlderHint();
      if (
        (this._tab === "clips" || this._tab === "snapshot") &&
        !this._loading &&
        !this._exhausted
      ) {
        const listScrollable =
          list && list.scrollHeight > list.clientHeight + 2;
        const scroller = listScrollable ? list : browse;
        if (!scroller) return;
        const nearBottom =
          scroller.scrollTop + scroller.clientHeight >=
          scroller.scrollHeight - 80;
        if (nearBottom) this._loadOlder();
      }
    };

    if (list) list.addEventListener("scroll", onScroll, { passive: true });
    if (browse && browse !== list)
      browse.addEventListener("scroll", onScroll, { passive: true });
  }

  _scrollEventsToTop() {
    const list = this._$("#list");
    const browse = this._$("#browse");
    const listScrollable = list && list.scrollHeight > list.clientHeight + 2;
    const scroller = listScrollable ? list : browse;
    if (!scroller) return;
    scroller.scrollTo({ top: 0, behavior: "smooth" });
  }

  _applyCardStyle() {
    const card = this.shadowRoot.querySelector(".card");
    if (!card) return;

    // Stream height — sets :host height/max-height via --card-host-height,
    // and #eng-wrap max-height via --stream-h.
    const vh = this._config.stream_height;
    if (vh) {
      const unit = this._config.stream_height_unit || "vh";
      this.style.setProperty("--card-host-height", `${vh}${unit}`);
      card.style.setProperty("--stream-h", `${vh}${unit}`);
    } else {
      this.style.removeProperty("--card-host-height");
      // Check if HA Sections injected a card height on the host element
      const haCardH = getComputedStyle(this)
        .getPropertyValue("--ha-card-height")
        .trim();
      if (haCardH) {
        card.style.setProperty("--stream-h", haCardH);
      } else {
        card.style.removeProperty("--stream-h");
      }
    }
    const themeSetting = this._config.theme || "default";
    card.classList.toggle("theme-light", themeSetting === "light");
    card.classList.toggle("theme-future", themeSetting === "future");
  }
  _isCardVisible() {
    if (!this.isConnected) return false;
    if (document.visibilityState === "hidden") return false;
    const style = getComputedStyle(this);
    if (style.display === "none" || style.visibility === "hidden") return false;
    const r = this.getBoundingClientRect();
    return r.width > 2 && r.height > 2;
  }
  _scheduleResumeLive(reason = "") {
    if (this._resumeLiveT) clearTimeout(this._resumeLiveT);
    this._resumeLiveT = setTimeout(() => {
      this._resumeLiveIfNeeded(reason);
    }, 140);
    if (this._isFirefox()) {
      // Firefox may need a second kick after layout settles on tab return.
      setTimeout(() => this._kickLiveIfStale(true), 900);
    }
  }
  _isMobileTabletViewport() {
    const coarse = window.matchMedia?.("(pointer: coarse)")?.matches || false;
    const w = window.innerWidth || 0;
    const h = window.innerHeight || 0;
    const maxEdge = Math.max(w, h);
    const minEdge = Math.min(w, h);
    // Coarse-pointer devices up to typical tablet sizes.
    return coarse && maxEdge <= 1400 && minEdge <= 1100;
  }
  _isLandscapeViewport() {
    return (
      window.matchMedia?.("(orientation: landscape)")?.matches ||
      (window.innerWidth || 0) > (window.innerHeight || 0)
    );
  }
  _clearRotateOverlayAudioSync() {
    if (this._rotateOverlaySyncVideo && this._onRotateOverlayVolumeChange) {
      try {
        this._rotateOverlaySyncVideo.removeEventListener(
          "volumechange",
          this._onRotateOverlayVolumeChange,
        );
      } catch (_) {}
    }
    this._rotateOverlaySyncVideo = null;
    this._onRotateOverlayVolumeChange = null;
  }
  _clearRotateVideoFullscreenStyle() {
    const v = this._rotateStyledVideo;
    if (!v) return;
    try {
      if (this._rotateStyledVideoCssText) {
        v.setAttribute("style", this._rotateStyledVideoCssText);
      } else {
        v.removeAttribute("style");
      }
    } catch (_) {}
    this._rotateStyledVideo = null;
    this._rotateStyledVideoCssText = "";
  }
  _applyRotateVideoFullscreenStyle(video) {
    if (!video) return;
    if (this._rotateStyledVideo !== video) {
      this._clearRotateVideoFullscreenStyle();
      this._rotateStyledVideo = video;
      this._rotateStyledVideoCssText = video.getAttribute("style") || "";
    }
    const vv = window.visualViewport;
    const vw = Math.max(1, Math.round(vv?.width || window.innerWidth || 0));
    const vh = Math.max(1, Math.round(vv?.height || window.innerHeight || 0));
    const ox = Math.round(vv?.offsetLeft || 0);
    const oy = Math.round(vv?.offsetTop || 0);
    video.style.setProperty("position", "fixed", "important");
    video.style.setProperty("top", `${oy}px`, "important");
    video.style.setProperty("left", `${ox}px`, "important");
    video.style.setProperty("width", `${vw}px`, "important");
    video.style.setProperty("height", `${vh}px`, "important");
    video.style.setProperty("max-width", "none", "important");
    video.style.setProperty("max-height", "none", "important");
    video.style.setProperty("z-index", "1402", "important");
    video.style.setProperty("object-fit", "contain", "important");
    video.style.setProperty("background", "var(--c-bg-deep)", "important");
    video.style.setProperty("transform", "none", "important");
    video.style.setProperty("margin", "0", "important");
    video.setAttribute("playsinline", "");
    video.setAttribute("webkit-playsinline", "true");
  }
  _bindRotateOverlayAudioSync(video) {
    if (!video) return;
    if (this._rotateOverlaySyncVideo === video) return;
    this._clearRotateOverlayAudioSync();
    this._rotateOverlaySyncVideo = video;
    this._onRotateOverlayVolumeChange = () => {
      const mutedNow = !!video.muted;
      if (mutedNow === this._streamMuted) return;
      this._applyLiveMuteChange(mutedNow, { source: "native-controls" });
    };
    video.addEventListener("volumechange", this._onRotateOverlayVolumeChange);
  }
  _setLiveNativeControls(enabled) {
    const expected = !!enabled;
    const apply = () => {
      if (!!this._rotateOverlayActive !== expected) return;
      const host = this._$("#engine");
      const v =
        this._findVideoDeep(host) ||
        this._findVideoDeep(this._engine) ||
        this._engine?.video ||
        null;
      if (!v) return;
      v.controls = expected;
      if (!expected) v.removeAttribute("controls");
      v.setAttribute("playsinline", "");
      v.setAttribute("webkit-playsinline", "true");
      if (expected) this._applyRotateVideoFullscreenStyle(v);
      else this._clearRotateVideoFullscreenStyle();
      if (expected) this._bindRotateOverlayAudioSync(v);
    };
    if (!expected) {
      this._clearRotateOverlayAudioSync();
      this._clearRotateVideoFullscreenStyle();
    }
    apply();
    [120, 420, 900].forEach((delay) => setTimeout(apply, delay));
  }
  _scheduleRotateOverlayUpdate() {
    if (this._rotateOverlayRaf) cancelAnimationFrame(this._rotateOverlayRaf);
    this._rotateOverlayRaf = requestAnimationFrame(() => {
      this._rotateOverlayRaf = 0;
      const vv = window.visualViewport;
      const vw = Math.max(1, Math.round(vv?.width || window.innerWidth || 0));
      const vh = Math.max(1, Math.round(vv?.height || window.innerHeight || 0));
      const ox = Math.round(vv?.offsetLeft || 0);
      const oy = Math.round(vv?.offsetTop || 0);
      this.style.setProperty("--rotate-vw", `${vw}px`);
      this.style.setProperty("--rotate-vh", `${vh}px`);
      this.style.setProperty("--rotate-ox", `${ox}px`);
      this.style.setProperty("--rotate-oy", `${oy}px`);
      this._updateRotateOverlayState();
    });
  }
  _updateRotateOverlayState() {
    const card = this._$("#card");
    if (!card) return;
    const popupOpen = this._$("#myPopup")?.classList.contains("is-open");
    const shouldOverlay =
      !popupOpen &&
      this._isMobileTabletViewport() &&
      this._isLandscapeViewport();

    if (this._rotateOverlayExitT) {
      clearTimeout(this._rotateOverlayExitT);
      this._rotateOverlayExitT = null;
    }

    if (shouldOverlay) {
      card.classList.remove("mobile-rotate-live-exit");
      card.classList.add("mobile-rotate-live");
      this._rotateOverlayActive = true;
      this._setStreamLoading(false);
      this._setLiveNativeControls(true);
      this._syncFullscreenButtonsVisibility();
      return;
    }

    if (!this._rotateOverlayActive) {
      card.classList.remove("mobile-rotate-live", "mobile-rotate-live-exit");
      return;
    }

    this._rotateOverlayActive = false;
    this._setLiveNativeControls(false);
    card.classList.remove("mobile-rotate-live");
    card.classList.add("mobile-rotate-live-exit");
    this._rotateOverlayExitT = setTimeout(() => {
      const c = this._$("#card");
      if (c) c.classList.remove("mobile-rotate-live-exit");
      this._rotateOverlayExitT = null;
      this._syncFullscreenButtonsVisibility();
    }, 260);
    this._syncFullscreenButtonsVisibility();
  }
  _kickLiveIfStale(force = false) {
    if (!this._started || !this._hass || !this._config) return;
    if (!this._isCardVisible()) return;
    if (this._$("#myPopup")?.classList.contains("is-open")) return;
    if (this._mountInProgress) return;
    if (this._$("#stream-loading") && !this._$("#stream-loading").hidden)
      return;
    const now = Date.now();
    if (!force && now - this._lastLiveKick < 4000) return;

    const engineHost = this._$("#engine");
    const v =
      this._findVideoDeep(engineHost) ||
      this._findVideoDeep(this._engine) ||
      this._engine?.video ||
      null;

    let stale = !v;
    if (v) {
      const ready = Number(v.readyState) || 0;
      const ended = !!v.ended;
      const paused = !!v.paused;
      const hasFrames =
        (Number(v.currentTime) || 0) > 0.05 ||
        (Number(v.webkitDecodedFrameCount) || 0) > 0;
      stale = ended || ready < 2 || (paused && hasFrames);
    }

    if (stale) {
      this._lastLiveKick = now;
      this._mountEngine();
    }
  }
  _resumeLiveIfNeeded(_reason = "") {
    if (!this._started || !this._hass || !this._config) return;
    if (!this._isCardVisible()) return;
    const popupOpen = this._$("#myPopup")?.classList.contains("is-open");
    if (popupOpen) return;
    const engWrap = this._$("#eng-wrap");
    if (engWrap) engWrap.style.display = "";
    this._kickLiveIfStale(true);
  }
  _setupResizeObserver() {
    if (this._ro) this._ro.disconnect();
    this._ro = new ResizeObserver((entries) => {
      const w = entries[0].contentRect.width;
      const h = entries[0].contentRect.height;
      const prevW = this._cardWidth || 0;
      this._cardWidth = w;
      const visibleNow = w > 2 && h > 2;
      if (visibleNow && !this._wasVisible) {
        this._scheduleResumeLive("resize-visible");
      }
      this._wasVisible = visibleNow;
      if (prevW > 0 && Math.round(w) === Math.round(prevW)) return;
      const card = this.shadowRoot.querySelector(".card");
      if (!card) return;
      const wide = w >= 560,
        mobile = w < 420;
      card.classList.toggle("wide", wide);
      card.classList.toggle("mobile", mobile);
      this._applyBrowse();
      this._scheduleRotateOverlayUpdate();
    });
    this._ro.observe(this);
    if (!this._io && "IntersectionObserver" in window) {
      this._io = new IntersectionObserver(
        (entries) => {
          const e = entries[0];
          if (e?.isIntersecting) {
            this._scheduleResumeLive("intersection");
          }
        },
        { threshold: 0.15 },
      );
      this._io.observe(this);
    }
  }
  // ── cam switcher ──────────────────────────────────────────
  _renderCamSwitcher() {
    const el = this.shadowRoot.querySelector("#cam-switcher");
    if (!el) return;
    if (this._config.cameras.length < 2) {
      el.style.display = "none";
      return;
    }
    el.style.display = "";

    const tabs = this._config.cameras
      .map((c, i) => {
        const name = cap(camDisplayName(c));
        const active = this._viewMode === "single" && i === this._activeCamIdx;
        const ok = this._hass?.states[c.entity]?.state !== "unavailable";
        return `<button class="cam-tab ${active ? "active" : ""}" data-camidx="${i}"><span class="cam-dot" style="color:${ok ? "#4ade80" : "#ef4444"}">●</span> ${name}</button>`;
      })
      .join("");

    el.innerHTML = `<div class="cam-tabs">${tabs}</div>`;
  }
  // ── interactions ──────────────────────────────────────────
  _openPopup() {
    const popup = this._$("#myPopup");
    if (!popup) return;
    popup.classList.add("is-open");
    popup.style.transform = "translateY(0)";
    this._syncFullscreenButtonsVisibility();
    this._scheduleRotateOverlayUpdate();
  }
  _stopPopupMedia() {
    this._clearPopupMediaCleanup();
    const viewer = this._$("#viewer");
    if (!viewer) return;

    viewer.querySelectorAll("video").forEach((v) => {
      try {
        v.pause();
        v.removeAttribute("src");
        v.querySelectorAll("source").forEach((s) => s.removeAttribute("src"));
        v.load();
      } catch (_) {}
    });

    viewer.innerHTML = "";
    viewer.style.display = "none";
    this._hidePopupInfo();
    this._playing = null;
  }
  _closePopup() {
    const popup = this._$("#myPopup");
    if (!popup) return;
    popup.classList.remove("is-open");
    popup.style.transform = "translateY(100%)";
    this._syncFullscreenButtonsVisibility();
    this._scheduleRotateOverlayUpdate();

    this._stopPopupMedia();

    const engine = this._$("#engine");
    if (engine) engine.style.display = "";
    this._mountEngine();
  }
  _initPopupInteractions() {
    const header = this.shadowRoot.querySelector(".popup-header");
    if (!header) return;
    if (this._popupHandlers) {
      const h = this._popupHandlers;
      h.header.removeEventListener("mousedown", h.onMouseDown);
      h.header.removeEventListener("touchstart", h.onTouchStart);
      document.removeEventListener("mousemove", h.onMouseMove);
      document.removeEventListener("touchmove", h.onTouchMove);
      document.removeEventListener("mouseup", h.onMouseUp);
      document.removeEventListener("touchend", h.onTouchEnd);
      this._popupHandlers = null;
    }
    this._popupDrag = { isDragging: false, startY: 0, currentY: 0 };
    const drag = this._popupDrag;
    const dragThreshold = 100;
    const start = (clientY) => {
      const popup = this._$("#myPopup");
      if (!popup) return;
      drag.isDragging = true;
      drag.startY = clientY;
      drag.currentY = 0;
      popup.style.transition = "none";
    };
    const move = (clientY, ev = null) => {
      const popup = this._$("#myPopup");
      if (!popup) return;
      if (!drag.isDragging || !popup.classList.contains("is-open")) return;
      if (ev?.cancelable) ev.preventDefault();
      drag.currentY = clientY - drag.startY;
      if (drag.currentY > 0) {
        popup.style.transform = `translateY(${drag.currentY}px)`;
      }
    };
    const end = () => {
      const popup = this._$("#myPopup");
      if (!popup) return;
      if (!drag.isDragging) return;
      drag.isDragging = false;
      popup.style.transition = "";
      if (drag.currentY > dragThreshold) this._closePopup();
      else popup.style.transform = "translateY(0)";
      drag.currentY = 0;
    };
    const onMouseDown = (e) => start(e.clientY);
    const onTouchStart = (e) => start(e.touches[0].clientY);
    const onMouseMove = (e) => move(e.clientY);
    const onTouchMove = (e) => move(e.touches[0].clientY, e);
    const onMouseUp = () => end();
    const onTouchEnd = () => end();
    header.addEventListener("mousedown", onMouseDown);
    header.addEventListener("touchstart", onTouchStart);
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("touchmove", onTouchMove, {
      passive: false,
    });
    document.addEventListener("mouseup", onMouseUp);
    document.addEventListener("touchend", onTouchEnd);
    this._popupHandlers = {
      header,
      onMouseDown,
      onTouchStart,
      onMouseMove,
      onTouchMove,
      onMouseUp,
      onTouchEnd,
    };
  }
  _click(e) {
    const target = e.target;
    if (target.closest(".close-btn")) return this._closePopup();
    if (this._handleToolbarClick(target)) return;
    if (this._handleSidebarClick(target)) return;
    if (this._handleListClick(e, target)) return;
    if (this._handleEventClick(target)) return;
  }
  _handleToolbarClick(target) {
    if (target.closest("#live-fs-btn")) {
      this._fullscreen(this._$("#eng-wrap"), { preferLive: true });
      return true;
    }
    if (target.closest("#popup-fs-btn")) {
      this._fullscreen(this._$("#viewer"));
      return true;
    }
    if (target.closest("#mute-btn")) {
      this._toggleMute();
      return true;
    }
    if (target.closest("#filter-btn")) {
      this._toggleFilter();
      return true;
    }
    if (target.closest("#cal-btn")) {
      this._toggleCal();
      return true;
    }
    if (target.closest("#now-btn")) {
      this._goNow();
      return true;
    }
    return false;
  }
  _handleSidebarClick(target) {
    const setvm = target.closest("[data-setviewmode]");
    if (setvm) {
      this._setViewMode(setvm.dataset.setviewmode);
      return true;
    }
    const viewm = target.closest("[data-viewmode]");
    if (viewm) {
      this._setViewMode(viewm.dataset.viewmode);
      return true;
    }
    const camTab = target.closest("[data-camidx]");
    if (camTab) {
      this._switchCamera(Number(camTab.dataset.camidx));
      return true;
    }
    const calDay = target.closest("[data-cal-day]");
    if (calDay) {
      this._pickDay(calDay.dataset.calDay);
      return true;
    }
    const calNav = target.closest("[data-cal-nav]");
    if (calNav) {
      this._calNav(Number(calNav.dataset.calNav));
      return true;
    }
    const fopt = target.closest("[data-flabel]");
    if (fopt) {
      this._filterLabel = fopt.dataset.flabel;
      this._renderFilter();
      this._renderList();
      return true;
    }
    const zopt = target.closest("[data-fzone]");
    if (zopt) {
      this._filterZone = zopt.dataset.fzone;
      this._renderFilter();
      this._renderList();
      return true;
    }
    const favo = target.closest("[data-favonly]");
    if (favo) {
      this._favOnly = favo.dataset.favonly === "1";
      this._renderFilter();
      this._renderList();
      return true;
    }
    return false;
  }
  _handleListClick(e, target) {
    const dl = target.closest("[data-dl]");
    if (dl) {
      e.stopPropagation();
      this._download(dl.dataset.dl, dl.dataset.dlFile);
      return true;
    }
    const fav = target.closest("[data-fav]");
    if (fav) {
      e.stopPropagation();
      this._toggleFav(fav.dataset.fav);
      return true;
    }
    const revOpen = target.closest("[data-review-open]");
    if (revOpen) {
      const rid = revOpen.closest("[data-review-id]")?.dataset.reviewId;
      const review = rid ? this._reviews.find((r) => r.id === rid) : null;
      this._showClipById(revOpen.dataset.reviewOpen, {
        mediaType: "alert",
        startTime: review?.start_time,
        camera: review?.camera,
      });
      return true;
    }
    const pill = target.closest("[data-tab]");
    if (pill) {
      this._setTab(pill.dataset.tab);
      return true;
    }
    const olderHint = target.closest("#older-hint");
    if (olderHint && olderHint.classList.contains("to-top")) {
      e.stopPropagation();
      this._scrollEventsToTop();
      return true;
    }
    const tick = target.closest("[data-tick]");
    if (tick) {
      this._open(tick.dataset.tick);
      return true;
    }
    const recDl = target.closest("[data-rec-dl-start]");
    if (recDl) {
      e.stopPropagation();
      const rs = Number(recDl.dataset.recDlStart);
      const re = Number(recDl.dataset.recDlEnd);
      if (Number.isFinite(rs) && Number.isFinite(re) && re > rs) {
        this._downloadRecRange(rs, re);
      }
      return true;
    }
    const recRow = target.closest("[data-rs]");
    if (recRow) {
      this._showRecording(+recRow.dataset.rs, +recRow.dataset.re);
      return true;
    }
    return false;
  }
  _handleEventClick(target) {
    const card = target.closest("[data-ev]");
    if (!card) return false;
    this._open(card.dataset.ev);
    return true;
  }
  _setTab(tab) {
    this._tab = tab;
    this.shadowRoot
      .querySelectorAll("[data-tab]")
      .forEach((p) => p.classList.toggle("active", p.dataset.tab === tab));
    this._renderListLabel();
    if (tab === "alerts") this._loadReviews().then(() => this._renderList());
    if (tab === "kept") this._loadKept().then(() => this._renderList());
    this._renderList();
  }
  // ── playback ──────────────────────────────────────────────
  _allDisplayEvents() {
    if (this._eventsMode === "all") {
      const seen = new Set();
      const all = [];
      for (const c of this._config.cameras) {
        const cc = this._camCache[c.entity];
        if (cc)
          for (const ev of cc.events || [])
            if (!seen.has(ev.id)) {
              seen.add(ev.id);
              all.push(ev);
            }
      }
      return all.sort((a, b) => b.start_time - a.start_time);
    }
    return this._events;
  }

  _findEventById(id) {
    if (!id) return null;
    const all = this._allDisplayEvents();
    let ev = all.find((e) => e.id === id);
    if (ev) return ev;
    for (const c of this._config.cameras) {
      const cc = this._camCache[c.entity];
      ev = (cc?.events || []).find((e) => e.id === id);
      if (ev) return ev;
    }
    ev = (this._kept || []).find((e) => e.id === id);
    return ev || null;
  }

  _hidePopupInfo() {
    const head = this._$("#popup-info-head");
    const info = this._$("#popup-info");
    this._teardownRecordingScrub();
    const scrub = this._$("#recording-scrub");
    if (scrub) scrub.hidden = true;
    if (head) {
      head.textContent = "";
      head.hidden = true;
    }
    if (info) {
      info.innerHTML = "";
      info.hidden = true;
    }
  }

  _teardownRecordingScrub() {
    if (this._recordingScrubCleanup) {
      try {
        this._recordingScrubCleanup();
      } catch (_) {}
    }
    this._recordingScrubCleanup = null;
    this._recordingScrubState = null;
  }

  _setRecordingScrubCursor(timeSec) {
    const state = this._recordingScrubState;
    if (!state?.cursor || !Number.isFinite(timeSec)) return;
    const span = Math.max(1, state.end - state.start);
    const pct = ((timeSec - state.start) / span) * 100;
    state.cursor.style.left = `${Math.max(0, Math.min(100, pct))}%`;
  }

  _closestRecordingAlertStart(targetSec, alerts, thresholdSec) {
    let nearest = null;
    let best = Infinity;
    for (const a of alerts) {
      if (targetSec >= a.start && targetSec <= a.end) return a.start;
      const d = Math.abs(targetSec - a.start);
      if (d < best) {
        best = d;
        nearest = a.start;
      }
    }
    return best <= thresholdSec ? nearest : null;
  }

  _seekRecordingScrubToRatio(ratio) {
    const state = this._recordingScrubState;
    if (!state?.video) return;
    const span = Math.max(1, state.end - state.start);
    const rawTarget = state.start + Math.max(0, Math.min(1, ratio)) * span;
    const snapThreshold = Math.max(4, span * 0.03);
    const snapped = this._closestRecordingAlertStart(
      rawTarget,
      state.alerts,
      snapThreshold,
    );
    const target = Number.isFinite(snapped) ? snapped : rawTarget;
    const current = Math.max(
      0,
      Math.min(state.end - state.start, target - state.start),
    );
    try {
      state.video.currentTime = current;
      state.video.play?.().catch(() => {});
    } catch (_) {}
    this._setRecordingScrubCursor(target);
  }

  async _fetchRecordingAlerts(clientId, cam, start, end) {
    const cacheKey = `${clientId}|${cam}|${Math.floor(start)}|${Math.floor(end)}`;
    if (this._recordingAlertCache.has(cacheKey)) {
      return this._recordingAlertCache.get(cacheKey);
    }
    const reviews = await this._fetchWindowedReviews(clientId, cam, start, end);
    const alerts = (Array.isArray(reviews) ? reviews : [])
      .filter((r) => String(r?.severity || "") === "alert")
      .map((r) => {
        const rs = Math.max(start, Number(r?.start_time || start));
        const re = Math.min(end, Number(r?.end_time || rs + 1));
        return {
          id: r?.id || `${rs}-${re}`,
          start: rs,
          end: re > rs ? re : rs + 1,
        };
      })
      .sort((a, b) => a.start - b.start);
    this._recordingAlertCache.set(cacheKey, alerts);
    return alerts;
  }

  async _initRecordingScrub({ clientId, cam, start, end, video, token }) {
    const scrub = this._$("#recording-scrub");
    const track = this._$("#recording-scrub-track");
    const markers = this._$("#recording-scrub-markers");
    const cursor = this._$("#recording-scrub-cursor");
    if (!scrub || !track || !markers || !cursor || !video) return;

    this._teardownRecordingScrub();
    scrub.hidden = false;
    markers.innerHTML = "";

    const alerts = await this._fetchRecordingAlerts(
      clientId,
      cam,
      start,
      end,
    ).catch(() => []);
    if (token !== this._playSeq) return;

    const span = Math.max(1, end - start);
    for (const a of alerts) {
      const left = ((a.start - start) / span) * 100;
      const width = Math.max(0.75, ((a.end - a.start) / span) * 100);
      markers.innerHTML += `<span class="recording-scrub-alert" style="left:${Math.max(0, left)}%;width:${Math.min(100, width)}%"></span>`;
    }

    const clientXToRatio = (clientX) => {
      const rect = track.getBoundingClientRect();
      if (!rect.width) return 0;
      return Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    };
    let dragging = false;
    const onPointerDown = (ev) => {
      dragging = true;
      track.setPointerCapture?.(ev.pointerId);
      this._seekRecordingScrubToRatio(clientXToRatio(ev.clientX));
    };
    const onPointerMove = (ev) => {
      if (!dragging) return;
      this._seekRecordingScrubToRatio(clientXToRatio(ev.clientX));
    };
    const onPointerUp = (ev) => {
      dragging = false;
      track.releasePointerCapture?.(ev.pointerId);
    };
    const onTime = () => {
      this._setRecordingScrubCursor(start + Number(video.currentTime || 0));
    };

    track.addEventListener("pointerdown", onPointerDown);
    track.addEventListener("pointermove", onPointerMove);
    track.addEventListener("pointerup", onPointerUp);
    track.addEventListener("pointercancel", onPointerUp);
    video.addEventListener("timeupdate", onTime);

    this._recordingScrubState = { start, end, alerts, video, cursor };
    this._setRecordingScrubCursor(start);
    this._recordingScrubCleanup = () => {
      track.removeEventListener("pointerdown", onPointerDown);
      track.removeEventListener("pointermove", onPointerMove);
      track.removeEventListener("pointerup", onPointerUp);
      track.removeEventListener("pointercancel", onPointerUp);
      video.removeEventListener("timeupdate", onTime);
      markers.innerHTML = "";
    };
  }

  _popupInfoModel(ev = null, opts = {}) {
    const id = ev?.id || opts.id || "";
    const mediaType = opts.mediaType || (ev?.has_clip ? "clip" : "snapshot");
    const showWithoutEvent = mediaType === "recording";
    const hasContent = !!ev || !!id || showWithoutEvent;
    if (!hasContent) return null;

    const titleLabel = ev?.label ? cap(ev.label) : cap(mediaType || "event");
    const score =
      opts.score != null
        ? opts.score
        : ev?.top_score != null
          ? `${Math.round(ev.top_score * 100)}%`
          : "-";
    const zone = opts.zone || (ev?.zones?.length ? ev.zones[0] : "-");
    const objects =
      opts.objects ||
      (ev?.data?.objects?.length
        ? ev.data.objects.map(cap).join(", ")
        : ev?.label
          ? cap(ev.label)
          : "-");
    const startTs = opts.startTime ?? ev?.start_time;
    const time = startTs ? this._time(startTs) : "-";
    const duration =
      opts.durationSec != null
        ? `${Math.max(1, Math.round(opts.durationSec))}s`
        : ev
          ? `${this._dur(ev)}s`
          : "-";
    const camera =
      (opts.camera || ev?.camera || this._cc().cam || "").replace(/_/g, " ") ||
      "-";
    const hasClip = ev?.has_clip ?? mediaType === "clip";
    const downloadFile =
      mediaType === "recording"
        ? ""
        : mediaType === "snapshot"
          ? "snapshot.jpg"
          : hasClip
            ? "clip.mp4"
            : "snapshot.jpg";
    const downloadLabel =
      mediaType === "recording"
        ? "Download recording"
        : downloadFile === "snapshot.jpg"
          ? "Download snapshot"
          : "Download clip";

    return {
      id,
      mediaType,
      titleLabel,
      score,
      zone,
      objects,
      time,
      duration,
      camera,
      downloadFile,
      downloadLabel,
      recStart: opts.recStart,
      recEnd: opts.recEnd,
    };
  }

  _renderPopupInfo(ev = null, opts = {}) {
    const head = this._$("#popup-info-head");
    const info = this._$("#popup-info");
    const scrub = this._$("#recording-scrub");
    if (!info || !head) return;

    const model = this._popupInfoModel(ev, opts);
    if (!model) {
      this._hidePopupInfo();
      return;
    }

    if (model.mediaType !== "recording") {
      this._teardownRecordingScrub();
      if (scrub) scrub.hidden = true;
    }

    head.textContent = `${cap(model.mediaType || "media")} - ${model.camera} - ${model.time}`;
    head.hidden = false;

    const isRecordingDl =
      model.mediaType === "recording" &&
      Number.isFinite(model.recStart) &&
      Number.isFinite(model.recEnd);
    const downloadBtn = isRecordingDl
      ? `<button class="popup-action" data-rec-dl-start="${Math.floor(model.recStart)}" data-rec-dl-end="${Math.floor(model.recEnd)}" title="${model.downloadLabel}" aria-label="${model.downloadLabel}">${ICONS.download}</button>`
      : model.id
        ? `<button class="popup-action" data-dl="${model.id}" data-dl-file="${model.downloadFile}" title="${model.downloadLabel}" aria-label="${model.downloadLabel}">${ICONS.download}</button>`
        : "";

    info.innerHTML = `
          <div class="popup-info-title">
            <span class="tb" style="background:${labelColor(ev?.label || model.mediaType)}33;color:${labelColor(ev?.label || model.mediaType)}">${model.titleLabel}</span>
            ${ev?.sub_label ? `<span class="subl">${ev.sub_label}</span>` : ""}
          </div>
          <div class="popup-info-grid">
            <div class="popup-info-row"><span class="popup-info-k">Time</span><span class="popup-info-v">${model.time}</span></div>
            <div class="popup-info-row"><span class="popup-info-k">Duration</span><span class="popup-info-v">${model.duration}</span></div>
            <div class="popup-info-row"><span class="popup-info-k">Objects</span><span class="popup-info-v">${model.objects}</span></div>
            <div class="popup-info-row"><span class="popup-info-k">Zone</span><span class="popup-info-v">${model.zone}</span></div>
            <div class="popup-info-row"><span class="popup-info-k">Score</span><span class="popup-info-v">${model.score}</span></div>
            <div class="popup-info-row"><span class="popup-info-k">Camera</span><span class="popup-info-v">${model.camera}</span></div>
          </div>
                                        <div class="popup-info-actions">${downloadBtn}</div>
        `;
    info.hidden = false;
  }

  _setLiveMuted(muted) {
    this._streamMuted = !!muted;
    const eng = this._engine;
    if (!eng) return;

    const applyToVideo = (video) => {
      if (!video) return false;
      if (typeof video.muted === "boolean") video.muted = this._streamMuted;
      if (typeof video.defaultMuted === "boolean")
        video.defaultMuted = this._streamMuted;
      if (!this._streamMuted) {
        if (typeof video.volume === "number") video.volume = 1;
        video.play?.().catch(() => {});
      }
      return true;
    };

    if (typeof eng.muted === "boolean") eng.muted = this._streamMuted;
    if (typeof eng.defaultMuted === "boolean")
      eng.defaultMuted = this._streamMuted;
    if (eng.video && typeof eng.video.muted === "boolean")
      eng.video.muted = this._streamMuted;
    if (eng.video && typeof eng.video.defaultMuted === "boolean")
      eng.video.defaultMuted = this._streamMuted;
    if (!this._streamMuted && eng.video) {
      if (typeof eng.video.volume === "number") eng.video.volume = 1;
      eng.video.play?.().catch(() => {});
    }

    let v =
      eng.tagName?.toLowerCase() === "video"
        ? eng
        : eng.querySelector?.("video") ||
          eng.shadowRoot?.querySelector?.("video");
    if (!v) v = this._findVideoDeep(eng);
    applyToVideo(v);

    // Legacy live players can attach or replace their nested video slightly
    // after the host element is already running, so re-apply briefly.
    [120, 400, 900].forEach((delay) => {
      setTimeout(() => {
        if (eng !== this._engine) return;
        const liveVideo = this._findVideoDeep(eng);
        applyToVideo(liveVideo);
      }, delay);
    });
  }

  _renderMuteButton() {
    const btn = this._$("#mute-btn");
    if (!btn) return;
    const label = this._streamMuted ? "Unmute live view" : "Mute live view";
    btn.title = label;
    btn.setAttribute("aria-label", label);
    btn.innerHTML = this._streamMuted ? ICONS.volOff : ICONS.volOn;
  }

  _timezoneDisplay() {
    const tz = this._hass?.config?.time_zone || "UTC";
    try {
      const parts = new Intl.DateTimeFormat(undefined, {
        timeZone: tz,
        timeZoneName: "longGeneric",
      }).formatToParts(new Date());
      const tzName = parts.find((p) => p.type === "timeZoneName")?.value || tz;
      return `${tzName} (${tz})`;
    } catch (_) {
      return tz.replace(/_/g, " ");
    }
  }

  _applyLiveMuteChange(nextMuted, { source = "button" } = {}) {
    this._setLiveMuted(nextMuted);
    this._renderMuteButton();

    // Edge/iOS legacy live players can fail to start audio when the stream
    // was originally mounted muted. Apply the same recovery whether unmute
    // came from our button or native rotated-overlay controls.
    const nativeOverlayUnmute =
      source === "native-controls" && this._rotateOverlayActive;
    const needsLegacyRecovery =
      this._useLegacyHaStreamPath() &&
      !nextMuted &&
      (!nativeOverlayUnmute || this._engineMountedMuted);
    if (needsLegacyRecovery) {
      this._mountEngine(null, { quiet: true });
      return;
    }
    if (!nextMuted) this._engineMountedMuted = false;
  }

  _toggleMute() {
    const nextMuted = !this._streamMuted;
    this._applyLiveMuteChange(nextMuted, { source: "button" });
  }

  _syncFullscreenButtonsVisibility() {
    const liveBtn = this._$("#live-fs-btn");
    const popupBtn = this._$("#popup-fs-btn");
    const popupOpen = this._$("#myPopup")?.classList.contains("is-open");
    const isFullscreen = !!(
      document.fullscreenElement || document.webkitFullscreenElement
    );
    if (liveBtn)
      liveBtn.hidden = !!popupOpen || isFullscreen || this._rotateOverlayActive;
    if (popupBtn) popupBtn.hidden = isFullscreen;
  }

  _open(id) {
    const ev = this._allDisplayEvents().find((e) => e.id === id);
    if (!ev) return;
    if (this._tab === "snapshot" || (!ev.has_clip && ev.has_snapshot))
      this._showSnapshot(ev);
    else if (ev.has_clip) this._showClip(ev);
    else this._showSnapshot(ev);
  }
  _enter() {
    this.shadowRoot.querySelector("#engine").style.display = "none";
    const v = this.shadowRoot.querySelector("#viewer");
    v.style.display = "flex";
    this._openPopup();
  }
  _ensurePopupFullscreenButton(kind = "media") {
    const viewer = this._$("#viewer");
    if (!viewer) return;
    const label =
      kind === "alert"
        ? "Fullscreen alert"
        : kind === "recording"
          ? "Fullscreen recording"
          : "Fullscreen media";
    const existing = viewer.querySelector("#popup-fs-btn");
    if (existing) {
      existing.title = label;
      existing.setAttribute("aria-label", label);
      return;
    }
    const btn = document.createElement("button");
    btn.className = "overlay-fs popup-fs-btn";
    btn.id = "popup-fs-btn";
    btn.title = label;
    btn.setAttribute("aria-label", label);
    btn.innerHTML = ICONS.expand;
    viewer.appendChild(btn);
  }
  _clearPopupMediaCleanup() {
    if (!this._popupMediaCleanup) return;
    try {
      this._popupMediaCleanup();
    } catch (_) {}
    this._popupMediaCleanup = null;
  }
  _bindPopupMediaListener(target, type, handler, options) {
    if (!target) return null;
    target.addEventListener(type, handler, options);
    return () => target.removeEventListener(type, handler, options);
  }
  _renderPopupMedia({ playingId, html, fullscreenKind, infoEvent, infoOpts }) {
    this._enter();
    this._playing = playingId ? { id: playingId } : null;
    this.shadowRoot.querySelector("#viewer").innerHTML = html;
    this._ensurePopupFullscreenButton(fullscreenKind);
    this._renderPopupInfo(infoEvent, infoOpts);
  }
  _media(id, file, dl) {
    return `/api/frigate/${this._cc().clientId}/notifications/${id}/${file}${dl ? "?download=true" : ""}`;
  }
  _showClip(ev) {
    const src = this._media(ev.id, isIOS ? "master.m3u8" : "clip.mp4");
    this._renderPopupMedia({
      playingId: ev.id,
      html: `<video controls autoplay muted playsinline><source src="${src}" /></video>`,
      fullscreenKind: "clip",
      infoEvent: ev,
      infoOpts: { mediaType: "clip" },
    });
  }
  _showClipById(id, opts = {}) {
    if (!id) return;
    const src = this._media(id, isIOS ? "master.m3u8" : "clip.mp4");
    this._renderPopupMedia({
      playingId: id,
      html: `<video controls autoplay muted playsinline><source src="${src}" /></video>`,
      fullscreenKind: opts.mediaType || "clip",
      infoEvent: this._findEventById(id),
      infoOpts: {
        id,
        mediaType: opts.mediaType || "clip",
        startTime: opts.startTime,
        camera: opts.camera,
      },
    });
  }
  _showSnapshot(ev) {
    this._renderPopupMedia({
      playingId: ev.id,
      html: `<img class="snap" src="${this._media(ev.id, "snapshot.jpg")}">`,
      fullscreenKind: "snapshot",
      infoEvent: ev,
      infoOpts: { mediaType: "snapshot" },
    });
  }
  //Play Recordings
  async _showRecording(s, e) {
    const start = s;
    const token = ++this._playSeq; // cancel any in-flight load
    this._enter();
    this._clearPopupMediaCleanup();
    this._playing = { rec: s };
    const { clientId, cam } = this._cc();
    const maxChunk = 7200;
    const chunkEnd = Math.min(e, start + maxChunk);
    const clipDur = chunkEnd - start; // real clip length in seconds
    const recCam = (cam || "").replace(/_/g, " ");
    this._renderPopupInfo(null, {
      mediaType: "recording",
      startTime: start,
      durationSec: clipDur,
      camera: recCam,
      objects: "-",
      zone: "-",
      score: "-",
      recStart: s,
      recEnd: e,
    });
    const viewer = this.shadowRoot.querySelector("#viewer");
    viewer.innerHTML = '<div class="ld">Loading…</div>';
    const url = await this._signed(
      `/api/frigate/${clientId}/recording/${cam}/start/${start}/end/${chunkEnd}`,
    );
    if (this._playSeq !== token) return;
    viewer.innerHTML = `<video controls autoplay playsinline muted><source src="${url}" type="video/mp4" /></video>`;
    this._ensurePopupFullscreenButton("recording");
    const video = viewer.querySelector("video");
    if (video) {
      this._initRecordingScrub({
        clientId,
        cam,
        start: s,
        end: e,
        video,
        token,
      });
    }
    this._popupMediaCleanup = null;
  }
  async _signed(path) {
    try {
      const r = await this._hass.callWS({
        type: "auth/sign_path",
        path,
        expires: 3600,
      });
      return r?.path || path;
    } catch (_) {
      return path;
    }
  }
  _findFullscreenVideo(el) {
    if (!el) return null;
    if (el.tagName?.toLowerCase() === "video") return el;

    const direct = el.querySelector?.("video");
    if (direct) return direct;

    const hosts = el.querySelectorAll?.(
      "ha-camera-stream,ha-hls-player,webrtc-camera",
    );
    if (hosts && hosts.length) {
      for (const h of hosts) {
        const v =
          h.shadowRoot?.querySelector("video") || h.querySelector?.("video");
        if (v) return v;
      }
    }

    return el.shadowRoot?.querySelector?.("video") || null;
  }

  _findVideoDeep(root, maxDepth = 7) {
    if (!root || maxDepth < 0) return null;
    if (root.tagName?.toLowerCase?.() === "video") return root;

    const direct = root.querySelector?.("video");
    if (direct) return direct;

    const kids = root.children ? Array.from(root.children) : [];
    for (const k of kids) {
      const v = this._findVideoDeep(k, maxDepth - 1);
      if (v) return v;
      if (k.shadowRoot) {
        const sv = this._findVideoDeep(k.shadowRoot, maxDepth - 1);
        if (sv) return sv;
      }
    }

    return null;
  }

  _fullscreen(el, opts = {}) {
    if (!el) return;
    let video = this._findFullscreenVideo(el);
    if (!video) video = this._findVideoDeep(el);
    if (!video && opts.preferLive) {
      video =
        this._findVideoDeep(this._$("#engine")) ||
        this._findVideoDeep(this._engine);
    }
    const iOS =
      /iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

    // iOS Safari often only supports fullscreen via the video element API.
    if (iOS && video) {
      const enterVideoFs =
        video.webkitEnterFullscreen || video.webkitEnterFullScreen;
      if (typeof enterVideoFs === "function") {
        try {
          enterVideoFs.call(video);
          return;
        } catch (_) {}
      }
    }

    let reqTarget = el;
    let req = el.requestFullscreen || el.webkitRequestFullscreen;
    if (!req && video) {
      reqTarget = video;
      req = video.requestFullscreen || video.webkitRequestFullscreen;
    }
    if (typeof req === "function") {
      try {
        req.call(reqTarget);
      } catch (_) {}
    }
  }
  _goNow() {
    const now = Math.floor(Date.now() / 1000);
    this._winEnd = now;
    this._winStart = now - this._config.window_days * DAY;
    this._exhausted = false;
    this._calMonth = null;
    this._loadWindow(true);
  }
  _download(id, file) {
    const a = document.createElement("a");
    a.href = this._media(id, file, true);
    a.download = `${this._cc().cam}_${id}_${file}`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }
  // ── favorites (realtime) ──────────────────────────────────
  _toggleFav(id) {
    const ev = this._findEventById(id);
    if (!ev) return;
    const next = !ev.retain_indefinitely;

    this._events.forEach((item) => {
      if (item.id === id) item.retain_indefinitely = next;
    });
    Object.values(this._camCache).forEach((state) => {
      (state?.events || []).forEach((item) => {
        if (item.id === id) item.retain_indefinitely = next;
      });
    });

    if (next) {
      if (!this._kept.find((e) => e.id === id))
        this._kept = [{ ...ev }, ...this._kept];
    } else {
      this._kept = this._kept.filter((e) => e.id !== id);
    }
    const ent = this._activeCam?.entity;
    if (ent && this._camCache[ent]) this._camCache[ent].kept = this._kept;
    this._renderList();
    const { clientId } = this._cc();
    this._hass
      .callWS({
        type: "frigate/event/retain",
        instance_id: clientId,
        event_id: id,
        retain: next,
      })
      .catch((err) => {
        this._events.forEach((item) => {
          if (item.id === id) item.retain_indefinitely = !next;
        });
        Object.values(this._camCache).forEach((state) => {
          (state?.events || []).forEach((item) => {
            if (item.id === id) item.retain_indefinitely = !next;
          });
        });
        if (next) {
          this._kept = this._kept.filter((e) => e.id !== id);
        } else if (!this._kept.find((e) => e.id === id)) {
          this._kept = [{ ...ev, retain_indefinitely: false }, ...this._kept];
        }
        this._renderList();
        console.warn("[Frigate] retain failed", err);
        this._toast("Could not save — check Frigate port config.");
      });
  }
  // ── browse / filter ───────────────────────────────────────
  _applyBrowse() {
    const b = this.shadowRoot.querySelector("#browse");
    if (b) b.style.display = "block";
  }
  _toggleBrowse() {
    this._browseOpen = !this._browseOpen;
    this._applyBrowse();
  }
  _toast(msg, ms = 3500) {
    const t = this.shadowRoot.querySelector("#toast");
    if (!t) return;
    t.textContent = msg;
    t.style.display = "block";
    clearTimeout(this._toastT);
    this._toastT = setTimeout(() => {
      t.style.display = "none";
    }, ms);
  }
  _toggleFilter() {
    const p = this.shadowRoot.querySelector("#filter-panel");
    const open = p.style.display === "none";
    this.shadowRoot.querySelector("#cal-panel").style.display = "none";
    p.style.display = open ? "block" : "none";
    if (open) this._renderFilter();
  }
  _toggleCal() {
    const p = this.shadowRoot.querySelector("#cal-panel");
    const open = p.style.display === "none";
    this.shadowRoot.querySelector("#filter-panel").style.display = "none";
    p.style.display = open ? "block" : "none";
    if (open) {
      if (!this._calMonth) {
        const z = this._tzParts(this._winEnd);
        this._calMonth = new Date(z.year, z.month - 1, 1);
      }
      this._renderCal();
    }
  }
  // ── calendar ──────────────────────────────────────────────
  _calNav(d) {
    const m = this._calMonth || new Date();
    m.setMonth(m.getMonth() + d);
    this._calMonth = new Date(m);
    this._renderCal();
  }
  _pickDay(ds) {
    const [y, mo, da] = ds.split("-").map(Number);
    this._winStart = this._tzDateTimeToEpochSeconds(y, mo, da, 0, 0, 0);
    this._winEnd = Math.min(
      this._tzDateTimeToEpochSeconds(y, mo, da, 23, 59, 59),
      Math.floor(Date.now() / 1000),
    );
    this.shadowRoot.querySelector("#cal-panel").style.display = "none";
    this._loadWindow(true);
  }
  _renderCal() {
    const p = this.shadowRoot.querySelector("#cal-panel");
    if (!p) return;
    const m = this._calMonth || new Date();
    const y = m.getFullYear(),
      mo = m.getMonth();
    const first = new Date(y, mo, 1);
    const startDow = (first.getDay() + 6) % 7;
    const days = new Date(y, mo + 1, 0).getDate();
    let cells = "";
    for (let i = 0; i < startDow; i++) cells += "<span></span>";
    for (let d = 1; d <= days; d++) {
      const ds = `${y}-${String(mo + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      cells += `<button class="cday" data-cal-day="${ds}">${d}${this._daysWithActivity.has(ds) ? '<i class="cdot"></i>' : ""}</button>`;
    }
    p.innerHTML = `<div class="cal-head"><button data-cal-nav="-1">‹</button><b>${m.toLocaleDateString([], { month: "long", year: "numeric", timeZone: this._tz() })}</b><button data-cal-nav="1">›</button></div>
      <div class="cal-dow"><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span><span>S</span></div>
      <div class="cal-grid">${cells}</div>`;
  }
  _renderFilter() {
    const p = this.shadowRoot.querySelector("#filter-panel");
    if (!p) return;
    const lbls = ["all", ...this._labels()];
    const zones = ["all", ...this._zones()];
    const chip = (val, cur, attr) =>
      `<button class="chip ${val === cur ? "on" : ""}" data-${attr}="${val}">${val === "all" ? "All" : cap(val)}</button>`;
    p.innerHTML = `<div class="frow"><span class="frow-l">Label</span>${lbls.map((l) => chip(l, this._filterLabel, "flabel")).join("")}</div>
      <div class="frow"><span class="frow-l">Zone</span>${zones.map((z) => chip(z, this._filterZone, "fzone")).join("")}</div>
      <div class="frow"><span class="frow-l">Show</span>
        <button class="chip ${!this._favOnly ? "on" : ""}" data-favonly="0">All</button>
        <button class="chip ${this._favOnly ? "on" : ""}" data-favonly="1">★ Favorites</button></div>`;
  }
  async _loadOlder() {
    const before = this._events.length
      ? Math.floor(Math.min(...this._events.map((e) => e.start_time)))
      : this._winStart;
    this._loading = true;
    const { clientId, cam } = this._cc();
    try {
      const older = await this._ws({
        type: "frigate/events/get",
        instance_id: clientId,
        cameras: [cam],
        before,
        limit: 50,
      });
      const arr = Array.isArray(older)
        ? older.filter((o) => !this._events.some((e) => e.id === o.id))
        : [];
      if (!arr.length) this._exhausted = true;
      else {
        this._events = this._events.concat(arr);
        this._winStart = Math.min(
          this._winStart,
          ...arr.map((e) => e.start_time),
        );
      }
    } catch (_) {}
    this._loading = false;
    this._renderList();
    this._renderRange();
  }
  // ── render ────────────────────────────────────────────────
  _syncStatus() {
    const ent = this._hass?.states?.[this._activeCam?.entity];
    if (!ent) return;
    const dot = this._$("#on-dot"),
      lbl = this._$("#on-lbl"),
      title = this._$("#info-title");
    const ok = ent.state !== "unavailable";
    if (dot) dot.style.color = ok ? "#4ade80" : "#ef4444";
    if (lbl) lbl.textContent = ok ? "Online" : "Offline";
    if (title) {
      const c = this._activeCam;
      const n =
        this._config.title ||
        (this._config.cameras.length > 1 ? cap(camDisplayName(c)) : "Camera");
      title.textContent = n;
    }
  }
  // Cached querySelector — avoids repeated DOM lookups on every render tick
  _$(sel) {
    return (
      this._domCache[sel] ||
      (this._domCache[sel] = this.shadowRoot.querySelector(sel))
    );
  }
  _renderAll() {
    this._renderStats();
    this._renderMuteButton();
    this._syncFullscreenButtonsVisibility();
    this._renderLegend();
    this._renderRange();
    this._renderCamSwitcher();
    this._renderList();
    this._syncStatus();
  }
  _renderStats() {
    const el = this._$("#ev-count");
    if (el) el.textContent = String(this._allDisplayEvents().length);
    const stream = this._$("#stream-type");
    if (stream) stream.textContent = this._activeStreamType || "--";
  }
  _renderRange() {
    const el = this._$("#tl-range");
    if (!el) return;
    el.textContent = this._config?.subtitle || "Frigate";
  }
  _renderLegend() {
    const el = this._$("#legend");
    if (!el) return;
    const labels = this._labels();
    let html = labels
      .map(
        (l) =>
          `<span class="lg"><i style="background:${labelColor(l)}"></i>${cap(l)}</span>`,
      )
      .join("");
    if (this._eventsMode === "all") {
      this._config.cameras.forEach((c, i) => {
        html += `<span class="lg"><i style="background:${CAM_COLORS[i % CAM_COLORS.length].replace(".5", "1").replace("rgba", "rgb").replace(",1)", ")")}"></i>${cap(camDisplayName(c))} rec</span>`;
      });
    } else {
      html += `<span class="lg"><i style="background:${CAM_COLORS[0].replace(".5", "1").replace("rgba", "rgb").replace(",1)", ")")}"></i>Rec</span>`;
    }
    el.innerHTML = html;
  }
  _time(ts) {
    return new Date(ts * 1000)
      .toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
        timeZone: this._tz(),
      })
      .toLowerCase();
  }
  _weekday(ts) {
    return new Date(ts * 1000).toLocaleDateString("en-US", {
      weekday: "short",
      timeZone: this._tz(),
    });
  }
  _monthDay(ts, { ordinal = false } = {}) {
    const parts = new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      timeZone: this._tz(),
    }).formatToParts(new Date(ts * 1000));
    const month = parts.find((p) => p.type === "month")?.value || "";
    const day = Number(parts.find((p) => p.type === "day")?.value || 0);
    return `${month} ${ordinal ? this._ordinal(day) : day}`.trim();
  }
  _ordinal(n) {
    const mod100 = n % 100;
    if (mod100 >= 11 && mod100 <= 13) return `${n}th`;
    const mod10 = n % 10;
    if (mod10 === 1) return `${n}st`;
    if (mod10 === 2) return `${n}nd`;
    if (mod10 === 3) return `${n}rd`;
    return `${n}th`;
  }
  _dateTimeLabel(ts) {
    return `${this._weekday(ts)} - ${this._monthDay(ts)} - ${this._time(ts)}`;
  }
  _listHeadingLabel(ts = null) {
    const fallback =
      {
        recordings: "Recordings",
        clips: "Recent Clips",
        snapshot: "Recent Snaps",
        alerts: "Recent Alerts",
        kept: "Kept",
      }[this._tab] || cap(this._tab || "");
    if (!ts || !["alerts", "clips", "snapshot"].includes(this._tab)) {
      return fallback;
    }
    return `${this._weekday(ts)} - ${this._monthDay(ts, { ordinal: true })} - ${fallback}`;
  }
  _showStickyDayHeaders() {
    return ["alerts", "clips", "snapshot"].includes(this._tab);
  }
  _renderListLabel(ts = null) {
    const lbl = this._$("#list-label");
    const head = this.shadowRoot?.querySelector(".list-head");
    if (head) head.style.display = this._showStickyDayHeaders() ? "none" : "";
    if (!lbl) return;
    lbl.textContent = this._listHeadingLabel(ts);
  }
  _dayKey(ts) {
    const parts = new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      timeZone: this._tz(),
    }).formatToParts(new Date(ts * 1000));
    const pick = (type) => parts.find((p) => p.type === type)?.value || "00";
    return `${pick("year")}-${pick("month")}-${pick("day")}`;
  }
  _renderStickyDaySections(items, renderItem) {
    let currentDay = null;
    const sections = [];
    for (const item of items) {
      const ts = item?.start_time;
      const dayKey = this._dayKey(ts || 0);
      if (dayKey !== currentDay) {
        currentDay = dayKey;
        sections.push({
          label: this._listHeadingLabel(ts || null),
          rows: [],
        });
      }
      sections[sections.length - 1].rows.push(renderItem(item));
    }
    return sections
      .map(
        (section) =>
          `<section class="list-day-sec"><div class="list-day-label">${section.label}</div>${section.rows.join("")}</section>`,
      )
      .join("");
  }
  _dur(ev) {
    return Math.max(
      1,
      Math.round((ev.end_time || Date.now() / 1000) - ev.start_time),
    );
  }
  _zones() {
    const z = new Set();
    this._allDisplayEvents().forEach((e) =>
      (e.zones || []).forEach((x) => z.add(x)),
    );
    return [...z];
  }
  _labels() {
    const l = new Set();
    this._allDisplayEvents().forEach((e) => e.label && l.add(e.label));
    return [...l];
  }
  _filtered() {
    let list = this._allDisplayEvents();
    if (this._tab === "clips") list = list.filter((e) => e.has_clip);
    else if (this._tab === "snapshot")
      list = list.filter((e) => e.has_snapshot);
    if (this._filterLabel !== "all")
      list = list.filter((e) => e.label === this._filterLabel);
    if (this._filterZone !== "all")
      list = list.filter((e) => (e.zones || []).includes(this._filterZone));
    if (this._favOnly) list = list.filter((e) => e.retain_indefinitely);
    return list;
  }
  _mergeRecs(recs) {
    if (!recs.length) return [];
    const segs = [...recs].sort((a, b) => a.start_time - b.start_time);
    const out = [];
    let cur = { ...segs[0] };
    for (let i = 1; i < segs.length; i++) {
      const s = segs[i];
      const ce = cur.end_time || cur.start_time;
      if (s.start_time - ce <= 60) {
        cur.end_time = Math.max(ce, s.end_time || s.start_time);
        cur.events = (cur.events || 0) + (s.events || 0);
      } else {
        out.push(cur);
        cur = { ...s };
      }
    }
    out.push(cur);
    return out;
  }
  _splitRecsHourly(recs) {
    const merged = this._mergeRecs(recs).sort(
      (a, b) => a.start_time - b.start_time,
    );
    if (!merged.length) return [];

    const now = Math.floor(this._winEnd || Date.now() / 1000);
    const currentHourStart = Math.floor(now / 3600) * 3600;
    const firstHourStart = currentHourStart - 23 * 3600;
    const out = [];

    for (let i = 0; i < 24; i++) {
      const bucketStart = firstHourStart + i * 3600;
      const bucketEnd = bucketStart + 3600;
      const rowEnd = Math.min(bucketEnd, now);

      // Keep only buckets that actually overlap recordings.
      let overlap = false;
      let events = 0;
      for (const r of merged) {
        const rs = Math.floor(r.start_time);
        const re = Math.floor(r.end_time || now);
        if (rs < bucketEnd && re > bucketStart) {
          overlap = true;
          events += r.events || 0;
        }
      }

      if (overlap && rowEnd > bucketStart) {
        out.push({
          start_time: bucketStart,
          end_time: rowEnd,
          events,
        });
      }
    }

    return out;
  }
  _favIcon(ev) {
    return ev.retain_indefinitely
      ? `<button class="ico fav on" data-fav="${ev.id}">${ICONS.star}</button>`
      : `<button class="ico fav" data-fav="${ev.id}">${ICONS.starO}</button>`;
  }

  _eventCardHTML(ev, expanded, compact = false) {
    const col = labelColor(ev.label);
    const score =
      ev.top_score != null ? Math.round(ev.top_score * 100) + "%" : "";
    const reviewSev =
      ev.severity === "alert"
        ? "alert"
        : ev.severity === "detection"
          ? "detection"
          : "";
    const reviewBar =
      this._tab === "kept" && reviewSev
        ? `<div class="rev-sev ${reviewSev}"></div>`
        : "";
    const zone = ev.zones && ev.zones.length ? ev.zones[0] : "";
    const subl = ev.sub_label
      ? `<span class="subl">${ev.sub_label}</span>`
      : "";
    const desc =
      expanded && ev.data?.description
        ? `<div class="desc">${ev.data.description}</div>`
        : "";
    const thumbFile = "thumbnail.jpg";
    const thumbSrc = this._media(ev.id, thumbFile);
    const thumbMissing = this._missingThumbIds.has(ev.id);
    const thumb =
      ev.has_snapshot || ev.has_clip
        ? thumbMissing
          ? `<div class="tph">${ICONS.person}</div>`
          : `<img src="${thumbSrc}" loading="lazy" data-thumb-id="${ev.id}" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"><div class="tph" style="display:none">${ICONS.person}</div>`
        : `<div class="tph">${ICONS.person}</div>`;
    const badge = ev.has_clip
      ? '<span class="bc">clip</span>'
      : ev.has_snapshot
        ? '<span class="bs">snap</span>'
        : "";
    const dlClip = ev.has_clip
      ? `<button class="ico" data-dl="${ev.id}" data-dl-file="clip.mp4" title="Download clip">${ICONS.download}</button>`
      : "";
    const dlSnap = ev.has_snapshot
      ? `<button class="ico" data-dl="${ev.id}" data-dl-file="snapshot.jpg" title="Download snapshot">${ICONS.snapshot}</button>`
      : "";
    // show camera name in multi-cam all-events mode
    const camLabel =
      this._eventsMode === "all" && this._config.cameras.length > 1
        ? `<span class="cam-badge">${(ev.camera || "").replace(/_/g, " ")}</span>`
        : "";
    // compact: wrap everything in a tighter layout, actions horizontal
    return `<div class="list-item${compact ? " compact" : ""} shadow-small" data-ev="${ev.id}">
      ${reviewBar}
      <div class="et">${thumb}<div class="ed">${this._dur(ev)}s</div></div>
      <div class="ei">
        <div class="etop"><span class="tb" style="background:${col}33;color:${col}">${cap(ev.label)}</span>${subl}${badge}${camLabel}${score ? `<span class="esc">${score}</span>` : ""}</div>
        <div class="em"><span>${ICONS.clock}${this._dateTimeLabel(ev.start_time)}</span>${zone ? `<span>${ICONS.pin}${zone}</span>` : ""}</div>
        ${desc}
      </div>
      <div class="eact${compact ? " h" : ""}">${this._favIcon(ev)}${dlClip}${dlSnap}</div>
    </div>`;
  }
  _renderList() {
    const list = this._$("#list");
    if (!list) return;
    if (this._tab === "recordings") {
      // Don't blow away the recording list while the user is watching a recording
      const viewerActive = this._$("#viewer")?.style.display !== "none";
      if (viewerActive && this._playing?.rec != null) return;
      this._syncOlderHint(false);
      return this._renderRecordings(list);
    }
    if (this._tab === "alerts") {
      this._syncOlderHint(false);
      return this._renderReviews(list);
    }
    if (this._tab === "kept") {
      this._renderListLabel();
      if (!this._kept.length) {
        list.innerHTML = `<div class="empty">No kept events<br><span style="opacity:.6">star an event to keep it</span></div>`;
        this._syncOlderHint(false);
        return;
      }
      list.innerHTML = this._kept
        .map((ev) => this._eventCardHTML(ev, false))
        .join("");
      this._syncOlderHint(false);
      return;
    }
    const events = this._filtered();
    this._renderListLabel(events[0]?.start_time || null);
    if (!events.length) {
      list.innerHTML = `<div class="empty">No events in this window</div>`;
      this._syncOlderHint(false);
      return;
    }
    list.innerHTML =
      (this._showStickyDayHeaders()
        ? this._renderStickyDaySections(events, (ev) =>
            this._eventCardHTML(ev, false),
          )
        : events.map((ev) => this._eventCardHTML(ev, false)).join("")) +
      (this._exhausted ? '<div class="end">— end —</div>' : "");
    this._syncOlderHint();
    requestAnimationFrame(() => this._syncOlderHint());
    setTimeout(() => this._syncOlderHint(), 200);
  }
  _syncOlderHint(forceHide = null) {
    const hint = this._$("#older-hint");
    if (!hint) return;
    if (forceHide === true) {
      hint.hidden = true;
      hint.classList.remove("to-top");
      return;
    }
    const supportsHint = ["clips", "snapshot", "alerts", "recordings"].includes(
      this._tab,
    );
    const canShowHint = forceHide !== false && supportsHint;
    hint.hidden = !canShowHint;
    if (!canShowHint) {
      hint.classList.remove("to-top");
      hint.textContent = "scroll for older…";
      hint.removeAttribute("role");
      hint.removeAttribute("tabindex");
      return;
    }

    const list = this._$("#list");
    const browse = this._$("#browse");
    const listScrollable = list && list.scrollHeight > list.clientHeight + 2;
    const scroller = listScrollable ? list : browse;
    const scrollTop = scroller?.scrollTop || 0;
    const sample = list?.querySelector(".list-item, .rev, .rec");
    const itemH = sample?.getBoundingClientRect?.().height || 60;
    const showTop = scrollTop >= Math.max(120, itemH * 3.5);

    hint.classList.toggle("to-top", showTop);
    hint.textContent = showTop ? "Click to return to top" : "scroll for older…";
    if (showTop) {
      hint.setAttribute("role", "button");
      hint.setAttribute("tabindex", "0");
    } else {
      hint.removeAttribute("role");
      hint.removeAttribute("tabindex");
    }
  }
  _renderRecordings(list) {
    const recs = this._splitRecsHourly(this._recordings).sort(
      (a, b) => b.start_time - a.start_time,
    );
    if (!recs.length) {
      list.innerHTML =
        '<div class="empty">No recordings in the last 24 hours</div>';
      this._syncOlderHint(true);
      return;
    }
    list.innerHTML = recs
      .map((r) => {
        const rs = Math.floor(r.start_time),
          re = Math.floor(r.end_time || Date.now() / 1000);
        const d = Math.max(1, re - rs);
        const mm = Math.floor(d / 60),
          ss = d % 60;
        const dur = `${mm ? mm + "m " : ""}${ss}s`;
        return `<div class="rec shadow-small" data-rs="${rs}" data-re="${re}">
        <div class="ric">${ICONS.recordings}</div>
        <div class="rinf">
          <div class="rt">${this._time(r.start_time)} – ${this._time(r.end_time || Date.now() / 1000)}</div>
          <div class="rsub">${dur}${r.events ? " · " + r.events + " ev" : ""}</div>
        </div>
        <div class="rp">▶</div>
      </div>`;
      })
      .join("");
    this._syncOlderHint(false);
  }
  _renderReviews(list) {
    this._renderListLabel(this._reviews[0]?.start_time || null);
    if (!this._reviews.length) {
      list.innerHTML = '<div class="empty">No alerts in this window</div>';
      this._syncOlderHint(true);
      return;
    }
    const allRevs = [...this._reviews].sort(
      (a, b) => b.start_time - a.start_time,
    );
    this._renderListLabel(allRevs[0]?.start_time || null);
    if (!allRevs.length) {
      list.innerHTML = '<div class="empty">No alerts in this window</div>';
      this._syncOlderHint(true);
      return;
    }
    list.innerHTML = this._renderStickyDaySections(allRevs, (r) => {
      const sev = r.severity === "alert" ? "alert" : "detection";
      const objs = (r.data?.objects || []).map(cap).join(", ");
      const title = r.data?.metadata?.title || objs || cap(r.severity);
      const firstDet = (r.data?.detections && r.data.detections[0]) || "";
      const reviewed = r.has_been_reviewed;
      const favEv = firstDet ? this._findEventById(firstDet) : null;
      const favBtn = firstDet
        ? favEv?.retain_indefinitely
          ? `<button class="ico fav on" data-fav="${firstDet}" title="Unfavorite">${ICONS.star}</button>`
          : `<button class="ico fav" data-fav="${firstDet}" title="Favorite">${ICONS.starO}</button>`
        : "";
      const hasReviewMedia = !!(
        favEv &&
        (favEv.has_snapshot || favEv.has_clip)
      );
      const reviewThumbFile = "thumbnail.jpg";
      const thumb = firstDet
        ? this._missingThumbIds.has(firstDet)
          ? `<div class="rev-th"><div class="rev-ph">${ICONS.person}</div></div>`
          : hasReviewMedia
            ? `<div class="rev-th"><img src="${this._media(firstDet, reviewThumbFile)}" loading="lazy" data-thumb-id="${firstDet}" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"><div class="rev-ph" style="display:none">${ICONS.person}</div></div>`
            : `<div class="rev-th"><div class="rev-ph">${ICONS.person}</div></div>`
        : "";
      return `
      <div class="rev ${sev} shadow-small" data-review-id="${r.id}" ${firstDet ? `data-review-open="${firstDet}"` : ""}>
        <div class="rev-nogap">
          <div class="rev-sev ${sev}"></div>${thumb}
        </div>
        <div class="rev-inf">
          <div class="rev-t">${title}</div>
          <div class="rev-m">
            <span class="time-meta">${ICONS.clock}${this._dateTimeLabel(r.start_time)}</span>
            <span class="review-meta">
              ${cap(sev)}${reviewed ? " · ✓" : firstDet ? " · tap" : ""}
            </span>
          </div>
        </div>
        ${favBtn}
      </div>`;
    });
    this._syncOlderHint(false);
  }
  // ── clip download range ───────────────────────────────────
  async _downloadRecRange(dlStart, dlEnd) {
    const { clientId, cam } = this._cc();
    const base = `/api/frigate/${clientId}/recording/${cam}/start/${dlStart}/end/${Math.min(dlEnd, dlStart + 7200)}`;
    const signed = await this._signed(base);
    const url = signed + (signed.includes("?") ? "&" : "?") + "download=true";
    const a = document.createElement("a");
    a.href = url;
    a.download = `${cam}_${this._time(dlStart).replace(/:/g, "-")}.mp4`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }
}
//=========================================================================
// editor.js — FrigateViewCardEditor config panel
class FrigateViewCardEditor extends HTMLElement {
  setConfig(config) {
    this._config = this._normalizeConfig(config);
    this._rendered = true;
    this._render();
  }

  set hass(hass) {
    this._hass = hass;
    const themeKey = this._hass?.themes?.darkMode ? "dark" : "light";
    const key = `${this._frigateEntities().join(",")}|${themeKey}`;
    if (key !== this._lastEntityKey) {
      this._lastEntityKey = key;
      if (this._rendered) this._render();
    }
  }

  _normalizeCameras(config) {
    let cams = [];
    if (Array.isArray(config?.cameras)) {
      cams = config.cameras;
    } else if (config?.camera_entity) {
      cams = [{ entity: config.camera_entity, name: config.title || "" }];
    }
    const normalized = cams
      .map((c) => {
        if (typeof c === "string") return { entity: c, name: "" };
        return {
          entity: c?.entity || c?.camera_entity || "",
          name: c?.name || "",
        };
      })
      .filter((c) => c.entity)
      .slice(0, 4);
    return normalized;
  }

  _normalizeConfig(config) {
    const src = config && typeof config === "object" ? { ...config } : {};
    const cameras = this._normalizeCameras(src);
    if (Array.isArray(src.hidden_tabs)) {
      src.hidden_tabs = src.hidden_tabs.map((id) =>
        id === "reviews" ? "alerts" : id,
      );
    }
    delete src.camera_entity;
    return { ...src, cameras };
  }

  _frigateEntities() {
    if (!this._hass) return [];
    return Object.keys(this._hass.states)
      .filter((e) => e.startsWith("camera."))
      .filter((e) => {
        const a = this._hass.states[e].attributes;
        return a?.client_id || a?.mqtt_client_id || a?.camera_name;
      })
      .sort();
  }

  _timezoneDisplay() {
    const tz = this._hass?.config?.time_zone || "UTC";
    try {
      const parts = new Intl.DateTimeFormat(undefined, {
        timeZone: tz,
        timeZoneName: "longGeneric",
      }).formatToParts(new Date());
      const tzName = parts.find((p) => p.type === "timeZoneName")?.value || tz;
      return `${tzName} (${tz})`;
    } catch (_) {
      return tz.replace(/_/g, " ");
    }
  }

  _defaultHostVh() {
    const headerH =
      parseFloat(
        getComputedStyle(document.documentElement).getPropertyValue(
          "--header-height",
        ),
      ) || 56;
    return Math.round(
      ((window.innerHeight - headerH) / window.innerHeight) * 100,
    );
  }

  _cameraLabel(camera) {
    const name = String(camera?.name || "").trim();
    if (name) return name;
    const entity = String(camera?.entity || "").trim();
    if (!entity) return "Select camera";
    return entity.replace(/^camera\./, "").replace(/_/g, " ");
  }

  _reorderCameras(from, to) {
    if (from === to || from < 0 || to < 0) return;
    const cur = [...this._getCams()];
    if (from >= cur.length || to >= cur.length) return;
    const [moved] = cur.splice(from, 1);
    cur.splice(to, 0, moved);
    this._config = { ...this._config, cameras: cur };
    this._render();
    this._dispatch();
  }

  _openCameraModal(index = null) {
    const cams = this._getCams();
    const cam = index == null ? { entity: "", name: "" } : cams[index] || {};
    this._editingCamIndex = index;
    const title = this.querySelector("#camera-modal-title");
    const save = this.querySelector("#camera-modal-save");
    const modal = this.querySelector("#camera-modal");
    const name = this.querySelector("#camera-modal-name");
    const entity = this.querySelector("#camera-modal-entity");
    const helper = this.querySelector("#camera-modal-helper");
    if (title) title.textContent = index == null ? "Add" : "Edit";
    if (save) save.textContent = index == null ? "Add" : "Save";
    if (name) name.value = cam?.name || "";
    if (entity) {
      entity.value = cam?.entity || "";
      entity.dataset.value = cam?.entity || "";
    }
    if (helper) helper.textContent = "";
    if (modal) modal.classList.remove("hidden");
  }

  _closeCameraModal() {
    const modal = this.querySelector("#camera-modal");
    if (modal) modal.classList.add("hidden");
    this._editingCamIndex = null;
  }

  _cameraModalEntityValue() {
    const entity = this.querySelector("#camera-modal-entity");
    return (entity?.dataset?.value || entity?.value || entity?.__value || "")
      .toString()
      .trim();
  }

  _saveCameraModal() {
    const entity = this._cameraModalEntityValue();
    const name = (
      this.querySelector("#camera-modal-name")?.value || ""
    ).toString();
    const helper = this.querySelector("#camera-modal-helper");
    if (!entity) {
      if (helper) helper.textContent = "Camera is required.";
      return;
    }
    const cur = [...this._getCams()];
    if (this._editingCamIndex == null) {
      if (cur.length >= 4) {
        if (helper) helper.textContent = "Maximum 4 cameras.";
        return;
      }
      cur.push({ entity, name });
    } else if (cur[this._editingCamIndex]) {
      cur[this._editingCamIndex] = { entity, name };
    }
    this._config = { ...this._config, cameras: cur.slice(0, 4) };
    this._closeCameraModal();
    this._render();
    this._dispatch();
  }

  _removeCamera(index) {
    const cur = [...this._getCams()];
    cur.splice(index, 1);
    this._config = { ...this._config, cameras: cur };
    this._render();
    this._dispatch();
  }

  _wireCameraDragAndDrop() {
    this.querySelectorAll(".cam-row").forEach((row) => {
      row.addEventListener("dragstart", (ev) => {
        const idx = row.dataset.row;
        ev.dataTransfer?.setData("text/plain", idx);
        ev.dataTransfer.effectAllowed = "move";
        row.classList.add("dragging");
      });
      row.addEventListener("dragend", () => {
        row.classList.remove("dragging");
        this.querySelectorAll(".cam-row").forEach((r) =>
          r.classList.remove("drop-target"),
        );
      });
      row.addEventListener("dragover", (ev) => {
        ev.preventDefault();
        row.classList.add("drop-target");
      });
      row.addEventListener("dragleave", () => {
        row.classList.remove("drop-target");
      });
      row.addEventListener("drop", (ev) => {
        ev.preventDefault();
        row.classList.remove("drop-target");
        const from = Number(ev.dataTransfer?.getData("text/plain") || "-1");
        const to = Number(row.dataset.row || "-1");
        this._reorderCameras(from, to);
      });
    });
  }

  _render() {
    const frigEntities = this._frigateEntities();
    const cams = this._getCams();
    const canAddCamera = cams.length < 4;
    const timezoneDisplay = this._timezoneDisplay();
    const hiddenTabs = new Set(this._config?.hidden_tabs || []);
    const tabCheck = (id, label) => `<ha-formfield label="${label}">
            <ha-checkbox name="hide-${id}" data-hide-tab="${id}" ${hiddenTabs.has(id) ? "checked" : ""}></ha-checkbox>
    </ha-formfield>`;
    const cameraRows = cams
      .map(
        (cam, i) => `
      <div class="cam-row" draggable="true" data-row="${i}">
        <button class="cam-drag" type="button" title="Drag to reorder" aria-label="Drag to reorder"><ha-icon icon="mdi:drag-horizontal-variant"></ha-icon></button>
        <div class="cam-name">${this._cameraLabel(cam)}</div>
                <button class="cam-action" type="button" title="Edit" aria-label="Edit" data-edit-cam="${i}"><svg viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg"><path fill="currentColor" d="M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87M3,17.25V21H6.75L17.81,9.94L14.06,6.19L3,17.25Z" /></svg></button>
                <button class="cam-action" type="button" title="Delete" aria-label="Delete" data-remove-cam="${i}"><svg viewBox="0 0 24 24" style="width:24px; height:24px" fill="currentColor"><path d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z" /></svg></button>
      </div>`,
      )
      .join("");

    this.innerHTML = `<style>
            .ed-wrap{
                --editor-primary-bg: var(--primary-background-color, #f6f7fb);
                --editor-secondary-bg: var(--secondary-background-color, #eef0f6);
                --editor-card-bg: var(--card-background-color, #ffffff);
                --editor-text: var(--primary-text-color, #1f2937);
                --editor-muted: var(--secondary-text-color, #6b7280);
                --editor-primary: var(--primary-color, #03a9f4);
                --editor-border: var(--ha-card-border-color, var(--divider-color, #d1d5db));
                --editor-border-width: var(--ha-card-border-width, 1px);
                --editor-shadow: var(--ha-card-box-shadow, 0 2px 10px rgba(0,0,0,.14));
                --editor-icon: var(--icon-color, var(--secondary-text-color, #6b7280));
                display:flex;
                flex-direction:column;
                gap:16px;
                padding:8px 0;
                background:transparent;
                color:var(--editor-text);
                font-family: var(--ha-font-family, inherit);
                font-size: var(--ha-font-size, 14px);
            }
            .field-label{font-size:12px;font-weight:600;margin-bottom:8px;display:block;color:var(--editor-text);}
            .section{border-top:1px solid var(--divider-color, #d1d5db);padding-top:16px;}
            .chk-row{display:flex;flex-wrap:wrap;gap:8px 16px;}

            .cam-wrap{display:flex;flex-direction:column;gap:8px;}
            .cam-row{display:grid;grid-template-columns:auto 1fr auto auto;gap:8px;align-items:center;border:var(--editor-border-width) solid var(--editor-border);border-radius:12px;padding:8px 12px;background:var(--editor-card-bg);box-shadow:var(--editor-shadow);}
            .cam-row.dragging{opacity:.65;}
            .cam-row.drop-target{border-color:var(--editor-primary);}
            .cam-drag{border:none;background:transparent;color:var(--editor-icon);cursor:grab;line-height:1;display:grid;place-items:center;width:28px;height:28px;border-radius:8px;}
            .cam-drag:hover{background:var(--editor-secondary-bg);}
            .cam-drag ha-icon{--mdc-icon-size:18px;}
            .cam-name{font-size:15px;color:var(--editor-text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
            .cam-action{width:32px;height:32px;border:none;background:transparent;color:var(--editor-icon);display:grid;place-items:center;cursor:pointer;border-radius:8px;}
            .cam-action:hover{background:var(--editor-secondary-bg);color:var(--editor-text);}
            .cam-action svg{width:18px;height:18px;display:block;fill:currentColor;}
            .cam-toolbar{display:flex;align-items:center;gap:8px;}
            .cam-add{border:var(--editor-border-width) solid var(--editor-border);border-radius:999px;padding:8px 16px;background:var(--editor-card-bg);color:var(--editor-primary);font-weight:600;cursor:pointer;}
            .cam-add:hover{border-color:var(--editor-primary);}
            .cam-add[disabled]{opacity:.5;cursor:not-allowed;}
            .cam-helper{font-size:11px;color:var(--editor-muted);}

            .theme-row{display:flex;align-items:center;}
            .theme-seg{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;width:100%;}
            .theme-opt{border:var(--editor-border-width) solid var(--editor-border);background:var(--editor-card-bg);color:var(--editor-text);border-radius:10px;padding:8px 10px;cursor:pointer;font-weight:600;}
            .theme-opt.active{background:var(--editor-primary);border-color:var(--editor-primary);color:var(--text-primary-color, #ffffff);}
            .theme-opt.future{opacity:.65;cursor:not-allowed;}
            .layout-row{display:flex;align-items:center;justify-content:space-between;gap:8px;}
            .readonly-value{font-size:12px;color:var(--editor-text);background:var(--editor-secondary-bg);border:var(--editor-border-width) solid var(--editor-border);border-radius:8px;padding:6px 10px;}

            .cam-modal.hidden{display:none;}
            .cam-modal{position:fixed;inset:0;background:rgba(0,0,0,.30);display:flex;align-items:center;justify-content:center;z-index:10;}
            .cam-modal-card{width:min(640px,calc(100vw - 24px));background:var(--editor-card-bg);border:var(--editor-border-width) solid var(--editor-border);border-radius:16px;padding:16px;box-shadow:var(--editor-shadow);}
            .cam-modal-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;}
            .cam-modal-title{font-size:30px;line-height:1;color:var(--editor-text);cursor:pointer;border:none;background:transparent;}
            .cam-modal-label{font-size:12px;font-weight:600;color:var(--editor-text);margin-bottom:6px;display:block;}
            .cam-modal-field{margin-bottom:8px;}
            .cam-modal-foot{display:flex;justify-content:flex-end;gap:8px;margin-top:8px;}
            .cam-btn{border:none;background:transparent;color:var(--editor-primary);font-weight:600;cursor:pointer;padding:8px 12px;}
            .cam-btn.primary{background:var(--editor-primary);color:var(--text-primary-color, #ffffff);border-radius:999px;padding:8px 18px;}
            .cam-modal-helper{font-size:11px;color:var(--error-color, #b91c1c);min-height:16px;}
        </style>
    <div class="ed-wrap">
      <div>
        <span class="field-label">Cameras ${frigEntities.length ? '<small style="font-weight:400;color:var(--secondary-text-color)">(Frigate cameras detected)</small>' : ""}</span>
        <div class="cam-wrap" id="cam-list">${cameraRows}</div>
                ${canAddCamera ? '<div class="cam-toolbar"><button id="camera-add" class="cam-add" type="button">Add</button></div>' : ""}
                <span class="cam-helper">Maximum 4 cameras.</span>
      </div>

      <ha-input label="Title" name="title" id="title" type="text" value="${this._config?.title || ""}" placeholder="My Camera"></ha-input>
      <ha-input label="Subtitle" name="subtitle" id="subtitle" type="text" value="${this._config?.subtitle || ""}" placeholder="Frigate"></ha-input>

      <div class="section">
            <span class="field-label">Event history days</span>
            <ha-input name="window_days" id="window_days" type="number" min="1" step="1" inputmode="numeric" value="${this._config?.window_days ?? 3}" placeholder="3"></ha-input>
      </div>

            <div class="section">
                <div class="layout-row">
                    <span class="field-label" style="margin:0">Timezone</span>
                    <span class="readonly-value">${timezoneDisplay}</span>
                </div>
            </div>

      <div class="section">
                <span class="field-label">Hidden tabs</span>
                <div class="chk-row">
                    ${tabCheck("alerts", "Alerts")}
                    ${tabCheck("clips", "Clips")}
                    ${tabCheck("snapshot", "Snapshots")}
                    ${tabCheck("recordings", "Recordings")}
                    ${tabCheck("kept", "Kept")}
                </div>
            </div>

            <div class="section">
                <span class="field-label">Theme</span>
                <div class="theme-row">
                    <div class="theme-seg" id="theme-seg" role="radiogroup" aria-label="Theme">
                        <button type="button" class="theme-opt ${(this._config?.theme || "default") === "default" ? "active" : ""}" data-theme-option="default" role="radio" aria-checked="${(this._config?.theme || "default") === "default" ? "true" : "false"}">HA default</button>
                        <button type="button" class="theme-opt ${(this._config?.theme || "default") === "light" ? "active" : ""}" data-theme-option="light" role="radio" aria-checked="${(this._config?.theme || "default") === "light" ? "true" : "false"}">Light</button>
                        <button type="button" class="theme-opt future" disabled aria-disabled="true">Future</button>
                    </div>
                </div>
            </div>

            <div class="section">
                <span class="field-label">Card Height Limit</span>
                <div style="display:flex;gap:8px;align-items:center">
                    <ha-input name="stream_height" id="stream_height" type="number" value="${this._config?.stream_height || ""}" min="1" placeholder="${this._defaultHostVh()}" style="flex:1"></ha-input>
                    <ha-selector id="stream_height_unit" style="width:120px"></ha-selector>
                </div>
            </div>

      <div class="section">
                <div class="layout-row">
                    <span class="field-label" style="margin:0">Tight Margins</span>
                    <ha-switch id="tight_margins" ${this._config?.tight_margins ? "checked" : ""}></ha-switch>
                </div>
      </div>

      <div class="section">
                <div class="layout-row">
                    <span class="field-label" style="margin:0">Wide View</span>
                    <ha-switch id="wide_view" ${this._config?.wide_view ? "checked" : ""}></ha-switch>
                </div>
        <div id="col-width-row" style="display:flex;align-items:center;gap:6px;margin-top:6px;${this._config?.wide_view ? "" : "display:none"}">
                    <label style="font-size:11px;color:var(--primary-text-color);white-space:nowrap">Left Width %</label>
          <ha-input type="text" id="col_left_width_pct" value="${this._config?.col_left_width_pct ?? 50}" style="width:70px"></ha-input>
          <span style="font-size:11px;color:var(--secondary-text-color)">%</span>
        </div>
      </div>

      <div id="camera-modal" class="cam-modal hidden">
        <div class="cam-modal-card" role="dialog" aria-modal="true" aria-label="Camera modal">
          <div class="cam-modal-head">
            <button type="button" id="camera-modal-close" class="cam-modal-title" aria-label="Close">x</button>
            <div style="font-size:30px;font-weight:600;color:var(--primary-text-color)" id="camera-modal-title">Add</div>
            <div></div>
          </div>
          <div class="cam-modal-field">
            <span class="cam-modal-label">Camera</span>
            <ha-selector id="camera-modal-entity"></ha-selector>
          </div>
          <div class="cam-modal-field">
            <ha-input id="camera-modal-name" label="Name" placeholder="Display name (optional)"></ha-input>
          </div>
          <div class="cam-modal-helper" id="camera-modal-helper"></div>
          <div class="cam-modal-foot">
            <button type="button" id="camera-modal-cancel" class="cam-btn">Cancel</button>
            <button type="button" id="camera-modal-save" class="cam-btn primary">Add</button>
          </div>
        </div>
      </div>
    </div>`;

    const update = () => this._u();

    this.querySelectorAll("[data-theme-option]").forEach((btn) => {
      btn.addEventListener("click", (ev) => {
        const selected = ev.currentTarget?.dataset?.themeOption || "default";
        this.querySelectorAll("[data-theme-option]").forEach((b) => {
          const active = b.dataset.themeOption === selected;
          b.classList.toggle("active", active);
          b.setAttribute("aria-checked", active ? "true" : "false");
        });
        update();
      });
    });

    const streamUnit = this.querySelector("#stream_height_unit");
    if (streamUnit) {
      streamUnit.hass = this._hass;
      streamUnit.selector = {
        select: {
          mode: "dropdown",
          options: [
            { value: "vh", label: "dvh" },
            { value: "em", label: "em" },
            { value: "px", label: "px" },
          ],
        },
      };
      streamUnit.value = this._config?.stream_height_unit || "vh";
      streamUnit.dataset.value = streamUnit.value;
      const syncStreamUnit = (ev) => {
        const value = ev?.detail?.value ?? streamUnit.value ?? "vh";
        streamUnit.value = value;
        streamUnit.dataset.value = value;
        update();
      };
      streamUnit.addEventListener("value-changed", syncStreamUnit);
      streamUnit.addEventListener("selected-changed", syncStreamUnit);
      streamUnit.addEventListener("change", syncStreamUnit);
    }

    const modalEntity = this.querySelector("#camera-modal-entity");
    if (modalEntity) {
      modalEntity.hass = this._hass;
      modalEntity.selector = { entity: { domain: "camera" } };
      modalEntity.label = "Camera";
      const syncModalEntity = (ev) => {
        const value = ev?.detail?.value ?? modalEntity.value ?? "";
        modalEntity.dataset.value = value || "";
      };
      modalEntity.addEventListener("value-changed", syncModalEntity);
      modalEntity.addEventListener("selected-changed", syncModalEntity);
    }

    this.querySelector("#camera-add")?.addEventListener("click", () => {
      this._openCameraModal(null);
    });
    this.querySelectorAll("[data-edit-cam]").forEach((btn) =>
      btn.addEventListener("click", (ev) => {
        this._openCameraModal(Number(ev.currentTarget.dataset.editCam));
      }),
    );
    this.querySelectorAll("[data-remove-cam]").forEach((btn) =>
      btn.addEventListener("click", (ev) => {
        this._removeCamera(Number(ev.currentTarget.dataset.removeCam));
      }),
    );
    this.querySelector("#camera-modal-close")?.addEventListener("click", () =>
      this._closeCameraModal(),
    );
    this.querySelector("#camera-modal-cancel")?.addEventListener("click", () =>
      this._closeCameraModal(),
    );
    this.querySelector("#camera-modal-save")?.addEventListener("click", () =>
      this._saveCameraModal(),
    );
    this.querySelector("#camera-modal")?.addEventListener("click", (ev) => {
      if (ev.target?.id === "camera-modal") this._closeCameraModal();
    });
    this.querySelector("#camera-modal-name")?.addEventListener(
      "keydown",
      (ev) => {
        if (ev.key === "Enter") {
          ev.preventDefault();
          this._saveCameraModal();
        }
      },
    );
    this._wireCameraDragAndDrop();

    [
      "title",
      "subtitle",
      "window_days",
      "stream_height",
      "col_left_width_pct",
    ].forEach((id) => {
      const el = this.querySelector(`#${id}`);
      if (!el) return;
      el.addEventListener("change", update);
    });
    ["tight_margins", "wide_view"].forEach((id) => {
      const el = this.querySelector(`#${id}`);
      if (!el) return;
      el.addEventListener("change", update);
      el.addEventListener("value-changed", update);
    });
    this.querySelectorAll("[data-hide-tab]").forEach((el) => {
      el.addEventListener("change", update);
      el.addEventListener("value-changed", update);
    });

    const wideCb = this.querySelector("#wide_view");
    const colWidthRow = this.querySelector("#col-width-row");
    if (wideCb && colWidthRow) {
      const syncWideRow = () => {
        colWidthRow.style.display = wideCb.checked ? "flex" : "none";
      };
      wideCb.addEventListener("change", syncWideRow);
      wideCb.addEventListener("value-changed", syncWideRow);
      syncWideRow();
    }

    if (this.querySelector("#col_left_width_pct")) {
      const pctInput = this.querySelector("#col_left_width_pct");
      const sanitize = () => {
        const clean = String(pctInput.value || "").replace(/[^0-9]/g, "");
        if (pctInput.value !== clean) pctInput.value = clean;
      };
      pctInput.addEventListener("input", sanitize);
      pctInput.addEventListener("change", sanitize);
      pctInput.addEventListener("value-changed", sanitize);
    }

    if (this.querySelector("#window_days")) {
      const daysInput = this.querySelector("#window_days");
      const sanitize = () => {
        const clean = String(daysInput.value || "").replace(/[^0-9]/g, "");
        if (daysInput.value !== clean) daysInput.value = clean;
      };
      daysInput.addEventListener("input", sanitize);
      daysInput.addEventListener("change", sanitize);
      daysInput.addEventListener("value-changed", sanitize);
    }
  }

  _getCams() {
    return Array.isArray(this._config?.cameras)
      ? this._config.cameras
          .map((c) => ({
            entity: c?.entity || "",
            name: c?.name || "",
          }))
          .filter((c) => c.entity)
          .slice(0, 4)
      : [];
  }

  _u() {
    const g = (id) => this.querySelector("#" + id)?.value?.trim() || "";
    const c = { ...this._config };
    c.cameras = this._getCams();
    delete c.camera_entity;

    const t = g("title");
    const s = g("subtitle");
    if (t) c.title = t;
    else delete c.title;
    if (s) c.subtitle = s;
    else delete c.subtitle;

    c.window_days = normalizePositiveInteger(g("window_days"), 3);
    c.window_hours = c.window_days * 24;

    delete c.primary_color;
    delete c.accent_color;
    delete c.bg_color;
    delete c.use_primary_color;
    delete c.use_accent_color;
    delete c.use_bg_color;

    c.theme =
      this.querySelector("[data-theme-option].active")?.dataset?.themeOption ||
      this._config?.theme ||
      "default";

    const hidden = [...this.querySelectorAll("[data-hide-tab]")]
      .filter((el) => el.checked)
      .map((el) => el.dataset.hideTab);
    c.hidden_tabs = hidden.length ? hidden : [];

    const sh = this.querySelector("#stream_height")?.value;
    const shu =
      this.querySelector("#stream_height_unit")?.dataset.value ||
      this.querySelector("#stream_height_unit")?.value ||
      "vh";
    c.stream_height = sh ? Number(sh) : null;
    c.stream_height_unit = shu;

    c.tight_margins = this.querySelector("#tight_margins")?.checked === true;
    c.wide_view = this.querySelector("#wide_view")?.checked === true;

    const pctInput = this.querySelector("#col_left_width_pct")
      ?.value?.replace(/%/g, "")
      .trim();
    c.col_left_width_pct = pctInput
      ? Math.min(Math.max(parseInt(pctInput, 10) || 50, 10), 90)
      : 50;

    this._config = c;
    this._dispatch();
  }

  _dispatch() {
    this.dispatchEvent(
      new CustomEvent("config-changed", {
        detail: { config: this._config },
      }),
    );
  }
}

// index.js — registers custom elements and announces card to HA
if (!customElements.get(CARD_TAG))
  customElements.define(CARD_TAG, FrigateViewCard);
if (!customElements.get(CARD_TAG + "-editor"))
  customElements.define(CARD_TAG + "-editor", FrigateViewCardEditor);
window.customCards = window.customCards || [];

if (!window.customCards.find((c) => c.type === CARD_TAG))
  window.customCards.push({
    type: CARD_TAG,
    name: "FrigateView Card",
    description: `Simple Frigate Camera and Events Card — v${VERSION}`,
    preview: true,
  });

console.info(
  `%c FRIGATE-VIEW-CARD %c v${VERSION} `,
  "color:#fff;background:#1d4ed8;padding:2px 4px;border-radius:3px 0 0 3px;font-weight:bold",
  "color:#1d4ed8;background:#dbeafe;padding:2px 4px;border-radius:0 3px 3px 0",
);
