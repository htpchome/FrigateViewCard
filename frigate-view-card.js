/** FrigateView Card - generated file. Edit src/ instead. */

// src/constants.js
const VERSION = "1.0.657";
const CARD_TAG = "frigate-view-card";
const DAY = 86400;
const RECORDINGS_WINDOW = 24 * 3600;
const EVENT_FETCH_BATCH = 100;
const INITIAL_EVENT_FETCH_LIMIT = 20;
const INACTIVE_WARM_EVENT_LIMIT = 5;
const REVIEW_FETCH_BATCH = 100;
const WINDOW_FETCH_PAGE_LIMIT = 10;
const INITIAL_EVENTS_PAGE_LIMIT = 1;
const WINDOW_BACKGROUND_PAGE_LIMIT = 4;
const REALTIME_HEAD_POLL_MS = 5e3;
const REALTIME_RELOAD_DEBOUNCE_MS = 450;
const REALTIME_POLL_OPTIONS_SECONDS = Object.freeze([2, 5, 10, 15]);
const MOBILE_BATTERY_SAVER_POLL_SECONDS = 10;
const SLIDESHOW_ROTATION_OPTIONS_SECONDS = Object.freeze([
  10,
  20,
  30,
  60
]);
const GRID_ROTATION_OPTIONS_SECONDS = Object.freeze([10, 20, 30, 60]);
const SLIDESHOW_ALERT_HOLD_MS = 1e4;
const SLIDESHOW_REVIEW_FRESHNESS_GRACE_SEC = 10;
const SLIDESHOW_REVIEW_WATCH_MIN_MS = 1500;
const SLIDESHOW_REVIEW_WATCH_MAX_MS = 15e3;
const PREVIEW_ALERT_HOLD_MS = 6e3;
const PREVIEW_ALERT_END_GRACE_MS = 3500;
const MSE_SWITCH_GRACE_MS = 2e4;
const MSE_SWITCH_GRACE_MAX = 3;
const MAX_CAMERAS = 8;
const DEFAULT_CAMERA_CONNECTION_TYPE = "frigate_go2rtc";
const ALLOWED_HIDDEN_TABS = [
  "alerts",
  "clips",
  "snapshot",
  "recordings",
  "kept"
];
const THEME_DEFAULTS = Object.freeze({
  "--c-bg-main": "var(--card-background-color)",
  "--c-bg-panel": "var(--secondary-background-color)",
  "--c-bg-deep": "#111111",
  "--c-text": "var(--primary-text-color)",
  "--c-text2": "var(--secondary-text-color)",
  "--c-text3": "var(--state-inactive-color)",
  "--c-text4": "var(--disabled-text-color)",
  "--c-text-rev": "var(--text-primary-color)",
  "--c-border": "var(--secondary-background-color)",
  "--c-border2": "var(--state-inactive-color)",
  "--c-primary": "var(--primary-color)",
  "--c-primary-l": "var(--light-primary-color)",
  "--c-primary-d": "var(--dark-primary-color)",
  "--c-accent": "var(--accent-color)",
  "--c-on": "#4ade80",
  "--c-off": "#FCA5A5",
  "--c-bg-scrub": "#c2f2c1",
  "--c-bg-alert": "#dc3146"
});
const THEME_CUSTOM_ROWS = Object.freeze([
  { key: "--c-bg-main", label: "Card Background Color" },
  { key: "--c-bg-panel", label: "Card Secondary Background Color" },
  { key: "--c-bg-deep", label: "Card Video Background Color" },
  { key: "--c-text", label: "Primary Text Color" },
  { key: "--c-text2", label: "Secondary Text Color" },
  { key: "--c-text3", label: "Third Text Color" },
  { key: "--c-text4", label: "Fourth Text Color" },
  { key: "--c-text-rev", label: "Reverse Text Color" },
  { key: "--c-border", label: "Border Color One" },
  { key: "--c-border2", label: "Border Color Two" },
  { key: "--c-primary", label: "Primary Color" },
  { key: "--c-primary-l", label: "Primary Light Color" },
  { key: "--c-primary-d", label: "Primary Dark Color" },
  { key: "--c-accent", label: "Accent Color" },
  { key: "--c-bg-scrub", label: "Scrub Bar Background" },
  { key: "--c-bg-alert", label: "Scrub Bar Alerts" }
]);
const THEME_CUSTOM_KEYS = new Set(
  THEME_CUSTOM_ROWS.map((row) => row.key)
);

// src/icons.js
const ICONS = {
  live: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M17 10.5V7a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-3.5l4 4v-11l-4 4z"/></svg>',
  recordings: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M18 4l2 4h-3l-2-4h-2l2 4h-3l-2-4H8l2 4H7L5 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4h-4z"/></svg>',
  clips: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-8 12.5v-9l6 4.5-6 4.5z"/></svg>',
  snapshot: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 15.2A3.2 3.2 0 0 1 8.8 12 3.2 3.2 0 0 1 12 8.8 3.2 3.2 0 0 1 15.2 12 3.2 3.2 0 0 1 12 15.2M20 4h-3.17L15 2H9L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2z"/></svg>',
  alerts: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L4 5v6c0 5 3.4 9.7 8 11 4.6-1.3 8-6 8-11V5l-8-3zm-1 14l-4-4 1.4-1.4L11 13.2l5.6-5.6L18 9l-7 7z"/></svg>',
  clock: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z"/></svg>',
  pin: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>',
  back: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>',
  left: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M15.41 7.41 14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg>',
  right: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="m8.59 16.59 1.41 1.41L16 12 10 6 8.59 7.41 13.17 12z"/></svg>',
  play: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>',
  pause: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6zm8-14v14h4V5z"/></svg>',
  download: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg>',
  star: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>',
  starO: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>',
  bullseye: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2A10 10 0 0 0 2 12A10 10 0 0 0 12 22A10 10 0 0 0 22 12A10 10 0 0 0 12 2M12 4A8 8 0 0 1 20 12A8 8 0 0 1 12 20A8 8 0 0 1 4 12A8 8 0 0 1 12 4M12 6A6 6 0 0 0 6 12A6 6 0 0 0 12 18A6 6 0 0 0 18 12A6 6 0 0 0 12 6M12 8A4 4 0 0 1 16 12A4 4 0 0 1 12 16A4 4 0 0 1 8 12A4 4 0 0 1 12 8Z" /></svg>',
  calendar: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 18H5V8h14v13z"/></svg>',
  filter: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M10 18h4v-2h-4v2zM3 6v2h18V6H3zm3 7h12v-2H6v2z"/></svg>',
  expand: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/></svg>',
  chevron: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6z"/></svg>',
  rotate: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 6v3l4-4-4-4v3c-4.42 0-8 3.58-8 8 0 1.57.46 3.03 1.24 4.26L6.7 14.8A5.87 5.87 0 0 1 6 12c0-3.31 2.69-6 6-6zm6.76 1.74L17.3 9.2A5.87 5.87 0 0 1 18 12c0 3.31-2.69 6-6 6v-3l-4 4 4 4v-3c4.42 0 8-3.58 8-8 0-1.57-.46-3.03-1.24-4.26z"/></svg>',
  presentationPlay: '<svg viewBox="0 0 24 24" style="width:24px;height:24px"><path fill="currentColor" d="M2,3H22C23.1,3 24,3.9 24,5V17C24,18.1 23.1,19 22,19H16V21H8V19H2C0.9,19 0,18.1 0,17V5C0,3.9 0.9,3 2,3M2,5V17H22V5H2M10,8V14L16,11L10,8Z" /></svg>',
  presentationPlayActive: '<svg viewBox="0 0 24 24" style="width:24px;height:24px"><path fill="currentColor" d="M2,3H22C23.1,3 24,3.9 24,5V17C24,18.1 23.1,19 22,19H16V21H8V19H2C0.9,19 0,18.1 0,17V5C0,3.9 0.9,3 2,3M2,5V17H22V5H2M10,8V14L16,11L10,8Z" /></svg>',
  volOff: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M16.5 12A4.5 4.5 0 0 0 14 7.97v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/></svg>',
  volOn: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3A4.5 4.5 0 0 0 14 7.97v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>',
  grid: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 3v8h8V3H3zm6 6H5V5h4v4zm-6 4v8h8v-8H3zm6 6H5v-4h4v4zm4-16v8h8V3h-8zm6 6h-4V5h4v4zm-6 4v8h8v-8h-8zm6 6h-4v-4h4v4z"/></svg>',
  person: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>',
  frigateview: '<svg viewBox="100 300 820 155" xmlns="http://www.w3.org/2000/svg"><desc>FrigateView</desc><path style="stroke:none;stroke-width:1;stroke-dasharray:none;stroke-linecap:butt;stroke-dashoffset:0;stroke-linejoin:miter;stroke-miterlimit:4;fill:#161618;fill-rule:nonzero;opacity:1" transform="translate(-30.73 177.492)scale(1.93682)" d="M118.652 71.916v9.36H89.13v10.801h29.523v9.361H89.13v20.882h-10.8V71.916z"/><path style="stroke:none;stroke-width:1;stroke-dasharray:none;stroke-linecap:butt;stroke-dashoffset:0;stroke-linejoin:miter;stroke-miterlimit:4;fill:#161618;fill-rule:nonzero;opacity:1" transform="translate(41.364 177.49)scale(1.93682)" d="M83.872 82.716h10.081v6.841c2.953-4.896 7.921-6.84 14.834-6.84h4.464v8.64h-4.464c-9.29 0-14.834 5.905-14.834 12.097v18.866h-10.08z"/><path style="stroke:none;stroke-width:1;stroke-dasharray:none;stroke-linecap:butt;stroke-dashoffset:0;stroke-linejoin:miter;stroke-miterlimit:4;fill:#161618;fill-rule:nonzero;opacity:1" transform="translate(82.504 177.492)scale(1.93682)" d="M103.601 82.716v39.604h-10.08V82.716z"/><rect style="stroke:none;stroke-width:1;stroke-dasharray:none;stroke-linecap:butt;stroke-dashoffset:0;stroke-linejoin:miter;stroke-miterlimit:4;fill:#71787e;fill-rule:nonzero;opacity:1" x="-5.04" y="-3.24" rx="0" ry="0" width="10.081" height="6.481" transform="translate(273.397 323.056)scale(1.93682)"/><path style="stroke:none;stroke-width:1;stroke-dasharray:none;stroke-linecap:butt;stroke-dashoffset:0;stroke-linejoin:miter;stroke-miterlimit:4;fill:#161618;fill-rule:nonzero;opacity:1" transform="translate(142.187 177.49)scale(1.93682)" d="M78.185 125.776h10.873c2.304 4.32 5.76 5.833 9.576 5.833 8.21 0 12.025-4.177 12.025-10.01v-3.96c-2.376 3.529-6.48 5.4-13.537 5.4-14.4 0-20.737-7.704-20.737-20.52 0-13.394 6.84-20.523 20.737-20.523 7.129 0 11.233 1.873 13.537 5.329v-4.609h10.081v41.548c0 9.36-9.432 17.065-22.106 17.065-9.576 0-18.29-4.608-20.45-15.553m20.377-12.457c7.633 0 12.097-3.744 12.097-10.8 0-6.77-4.248-10.802-12.097-10.802-7.632 0-12.097 3.745-12.097 10.801 0 6.769 4.249 10.801 12.097 10.801"/><path style="stroke:none;stroke-width:1;stroke-dasharray:none;stroke-linecap:butt;stroke-dashoffset:0;stroke-linejoin:miter;stroke-miterlimit:4;fill:#161618;fill-rule:nonzero;opacity:1" transform="translate(234.991 177.49)scale(1.93682)" d="M76.276 102.518c0-13.393 6.84-20.522 20.738-20.522 7.129 0 11.233 1.873 13.537 5.329v-4.609h10.081v39.604h-10.08v-4.68c-2.377 3.528-6.481 5.4-13.538 5.4-14.401 0-20.738-7.705-20.738-20.522m22.178 10.801c7.633 0 12.097-3.744 12.097-10.8 0-6.77-4.248-10.802-12.097-10.802-7.632 0-12.097 3.745-12.097 10.801 0 6.769 4.248 10.801 12.097 10.801"/><path style="stroke:none;stroke-width:1;stroke-dasharray:none;stroke-linecap:butt;stroke-dashoffset:0;stroke-linejoin:miter;stroke-miterlimit:4;fill:#161618;fill-rule:nonzero;opacity:1" transform="translate(312.315 177.492)scale(1.93682)" d="M88.481 108.279V91.357h-5.184v-8.64h5.184V71.914h10.081v10.801h15.265v8.641H98.562v16.634c0 3.888 2.376 4.968 5.112 4.968h10.153v9.36h-12.385c-6.408 0-12.961-2.807-12.961-14.04"/><path style="stroke:none;stroke-width:1;stroke-dasharray:none;stroke-linecap:butt;stroke-dashoffset:0;stroke-linejoin:miter;stroke-miterlimit:4;fill:#161618;fill-rule:nonzero;opacity:1" transform="translate(386.992 177.49)scale(1.93682)" d="M76.42 102.518c0-13.393 8.28-20.522 22.178-20.522 14.401 0 22.178 7.705 22.178 20.522v1.512H86.573c.576 5.833 4.753 9.29 12.025 9.29 5.257 0 9-1.73 10.8-5.185h10.874c-2.16 9.72-9.937 14.905-21.674 14.905-14.401 0-22.178-7.705-22.178-20.522m32.907-5.832c-1.872-3.169-5.472-4.969-10.729-4.969-5.112 0-8.857 1.728-10.729 4.969z"/><path style="stroke:none;stroke-width:1;stroke-dasharray:none;stroke-linecap:butt;stroke-dashoffset:0;stroke-linejoin:miter;stroke-miterlimit:4;fill:#71787e;fill-rule:nonzero;opacity:1" transform="translate(458.247 177.492)scale(1.93682)" d="m80.525 71.915 18.001 50.405h-3.815L76.709 71.915z"/><path style="stroke:none;stroke-width:1;stroke-dasharray:none;stroke-linecap:butt;stroke-dashoffset:0;stroke-linejoin:miter;stroke-miterlimit:4;fill:#161618;fill-rule:nonzero;opacity:1" transform="translate(670.207 365.593)scale(1.93682)" d="M7.093-25.202h3.816L-7.093 25.202h-3.816z"/><path style="stroke:none;stroke-width:1;stroke-dasharray:none;stroke-linecap:butt;stroke-dashoffset:0;stroke-linejoin:miter;stroke-miterlimit:4;fill:#71787e;fill-rule:nonzero;opacity:1" transform="translate(508.662 177.492)scale(1.93682)" d="M100.36 82.716v39.604h-3.6V82.716z"/><rect style="stroke:none;stroke-width:1;stroke-dasharray:none;stroke-linecap:butt;stroke-dashoffset:0;stroke-linejoin:miter;stroke-miterlimit:4;fill:#161618;fill-rule:nonzero;opacity:1" x="-1.8" y="-1.62" rx="0" ry="0" width="3.6" height="3.24" transform="translate(699.555 319.918)scale(1.93682)"/><path style="stroke:none;stroke-width:1;stroke-dasharray:none;stroke-linecap:butt;stroke-dashoffset:0;stroke-linejoin:miter;stroke-miterlimit:4;fill:#71787e;fill-rule:nonzero;opacity:1" transform="translate(557.54 177.49)scale(1.93682)" d="M78.292 102.518c0-13.393 7.56-20.522 20.306-20.522 12.745 0 20.306 7.129 20.306 20.522H81.893c0 11.305 5.184 16.922 16.705 16.922 9.793 0 15.265-3.96 16.49-12.674h3.6c-1.512 10.657-8.785 16.274-20.09 16.274-13.177 0-20.306-7.705-20.306-20.522m36.867-3.24c-1.008-9.433-6.408-13.681-16.561-13.681s-15.553 4.248-16.561 13.68z"/><path style="stroke:none;stroke-width:1;stroke-dasharray:none;stroke-linecap:butt;stroke-dashoffset:0;stroke-linejoin:miter;stroke-miterlimit:4;fill:#71787e;fill-rule:nonzero;opacity:1" transform="translate(649.512 177.49)scale(1.93682)" d="M103.6 82.716H100l12.025 39.604h3.6zm-34.49 0 11.664 39.604h3.6L72.71 82.716z"/><path style="stroke:none;stroke-width:1;stroke-dasharray:none;stroke-linecap:butt;stroke-dashoffset:0;stroke-linejoin:miter;stroke-miterlimit:4;fill:#161618;fill-rule:nonzero;opacity:1" transform="translate(888.24 376.05)scale(1.93682)" d="M7.633-19.802h-3.6L-7.634 19.802h3.6z"/><path style="stroke:none;stroke-width:1;stroke-dasharray:none;stroke-linecap:butt;stroke-dashoffset:0;stroke-linejoin:miter;stroke-miterlimit:4;fill:#161618;fill-rule:nonzero;opacity:1" transform="translate(828.061 376.05)scale(1.93682)" d="M4.212-19.802-7.813 19.802h3.6L7.814-19.802z"/></svg>'
};

// src/styles.js
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
    overflow: hidden;
    box-sizing: border-box !important;
    position: relative;
    border:1px solid var(--secondary-background-color,#7a7a7a);
  }
  :host {
    --popup-z-index: 1000;
    --popup-bg: white;
    --handle-color: #e0e0e0;
  }

  /* \u2500\u2500 theme variables (dark = default) \u2500\u2500 */
    .card {
        --c-bg-main:   var(--card-background-color);
        --c-bg-panel:  var(--secondary-background-color);
        --c-bg-deep:   #111111;
        --c-text:      var(--primary-text-color);
        --c-text2:     var(--secondary-text-color);
        --c-text3:     var(--state-inactive-color);
        --c-text4:     var(--disabled-text-color);
        --c-text-rev:  var(--text-primary-color);
        --c-border:    var(--secondary-background-color);
        --c-border2:   var(--state-inactive-color);
        --c-primary:   var(--primary-color);
        --c-primary-l: var(--light-primary-color);
        --c-primary-d: var(--dark-primary-color);
        --c-accent:    var(--accent-color);
        --c-on:        #4ade80;
        --c-off:       #FCA5A5;
        --c-bg-scrub:  #c2f2c1;
        --c-bg-alert:  #dc3146;
    }
  /* \u2500\u2500 responsive layout    \u2500\u2500 */
  ha-card {
    --ha-card-background: var(--c-bg-main) !important;
    min-height: 0 !important;
    height: 100%;
    overflow:hidden !important;
    padding: 0 !important;
    margin: 0 !important;
    min-height: 0 !important;
    height: 100%;
    overflow:hidden !important;

    }
  .card{
    --fvc-shadow-s: var(--ha-box-shadow-s);
    --fvc-shadow-m: var(--ha-box-shadow-m);
    --fvc-outer-shadow-m: var(--ha-box-shadow-m);
    --fvc-border-s: 1px solid var(--c-border2);
    --fvc-border-m: 2px solid var(--c-border2);
    --fvc-border-active:  1px solid var(--c-primary);
    --fvc-border-radius: 15px;
    --fvc-outer-border-radius: 15px;
    color:var(--c-text);
    overflow:hidden;
    box-sizing: border-box;
    -webkit-backface-visibility: hidden;
    backface-visibility: hidden;
    font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
    display:flex;
    flex-direction:column;
    height:100%;
    position:relative;
    top:0;
    left:0;
    overflow:hidden !important;
    border:1px solid var(--secondary-background-color,#7a7a7a);
    }
  .card.shadows-off{--fvc-shadow-s:none;--fvc-shadow-m:none;}
  .card.borders-off{--fvc-border-s: none;--fvc-border-m:  none;--fvc-border-active: none}
  .card.corners-off{--fvc-border-radius:0px;}

  .card .layout{display:flex;flex-direction:column;max-height:100dvh;height: 100%;width:100%;
    overflow: hidden !important;}
  .card .layout.wide-view{flex-direction:row;}
  .card .col-left{flex:0 1 auto; min-height:0; align-self: start;flex-direction:column;width:100%; display:flex;overflow:none;}
  .card .col-left > *{flex:0 0 auto;}
  .card .col-left > .feed-area{flex:1 1 auto;min-height:0;}
  .card .col-right{flex:1 1 auto; min-height:0; flex-direction:column;position:relative;width:100%; display:flex;}
  .resize-handle{display:block;width:100%;height:6px;cursor:row-resize;background:var(--c-border2,#333);position:relative;flex-shrink:0;z-index:10;transition:background .15s;}
  .layout:not(.wide-view) .resize-handle{display:none;}
  .resize-handle:hover,.resize-handle.active{background:var(--c-accent,#3b82f6);}
  .resize-handle::after{content:'';position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:32px;height:2px;background:rgba(255,255,255,.4);border-radius:1px;}
  .layout.wide-view .resize-handle{width:6px;height:auto;cursor:col-resize;}
  .layout.wide-view .resize-handle::after{width:2px;height:32px;}
  .card #eng-wrap{min-height:0;flex-shrink: 0;}
  .card .browse{
    flex:1 1 0;
    flex-direction: column; 
    padding:0 10px;
    margin:0;
    min-height:0;
    height:95%;
    overflow-y:auto;
    position:relative}

  .card .browse-head{display:flex;align-items:center;justify-content:center;min-height:1.5rem;max-height:1.65em;flex-direction:row;width:auto;color:var(--c-text2);letter-spacing:.02em;line-height:1.40;padding:1px 8px;}
  .card.recordings-browse-head-tall:not(.mobile) .browse-head{min-height:3.5rem;max-height:none;}
  .browse-head-left {display:flex;flex:1;justify-content:center;align-items:center;flex: 0 0 auto; }
  .browse-head-right {display:flex;justify-content center;align-items: center;flex: 0 0 auto;}
  .browse-head-middle {flex:1;text-align:center;font-weight:700;font-size:1rem;letter-spacing:.02em;line-height:1.40;}

  .prev-next{display:inline-flex;align-items:center;gap:4px;font-size: 0.85rem;padding-inline: 0.3em;padding-block: 0.3em;line-height: 1;  border-radius: 999em;
    background:var(--c-bg-main);min-width:80px;
    color:var(--c-text2);
    transition:all .15s;
    font-weight:600;
    cursor:pointer;
    white-space:nowrap;
    box-shadow: var(--fvc-shadow-s);
    }
  
  .prev-next:hover{color:var(--c-primary-d);}
  .prev-next.active{background:var(--c-primary-d);color:var(--c-text-rev);}
  .prev-next:disabled{opacity:.45;cursor:not-allowed;color:var(--c-text4);}
  .prev-next svg{width:14.4px;height:14.4px;flex-shrink:0;}

  .card.recordings-browse-head-tall .browse{touch-action:pan-y;}
  .browse.recordings-swipe{touch-action:pan-y;}
  .list.recordings-swipe-active{position:relative;overflow:hidden;}
  .rec-swipe-stage{position:relative;width:100%;min-height:220px;}
  .rec-swipe-pane{position:absolute;inset:0;will-change:transform;backface-visibility:hidden;}
  .list.recordings-swipe-active .rec-swipe-pane{pointer-events:none;}
  .rec-swipe-pane.loading{display:flex;align-items:center;justify-content:center;}
  .rec-swipe-pane.loading .empty{margin-top:14px;}
  .browse.swipe-bounce-prev{animation:browseBouncePrev .24s ease-out;}
  .browse.swipe-bounce-next{animation:browseBounceNext .24s ease-out;}
  @keyframes browseBouncePrev {
    0% { transform: translateX(0); }
    38% { transform: translateX(18px); }
    100% { transform: translateX(0); }
  }
  @keyframes browseBounceNext {
    0% { transform: translateX(0); }
    38% { transform: translateX(-18px); }
    100% { transform: translateX(0); }
  }
  
  .card .browse::-webkit-scrollbar{width:8px;}
  .card .browse::-webkit-scrollbar-track{background:transparent;}
  .card .browse::-webkit-scrollbar-thumb{background:var(--c-text2);border-radius:4px;background-clip:content-box;}

  /* \u2500\u2500 event list \u2500\u2500 */
  .list{flex:1;flex-direction: column;min-height:0;} 
  .list-head{justify-content:space-between;align-items:center;margin-bottom:8px;}
  .list-day-sec{position:relative;}
  .list-day-label{position:relative;z-index:1;padding:2px 0 4px;font-size:1rem;font-weight:700;color:var(--c-text2);letter-spacing:.02em;line-height:1.30;pointer-events:none;background:var(--c-bg-main);border:none;text-align: center;}
  .list-day-label-first{display:none;}


  .list-item{position: relative;display:flex;flex-wrap:wrap;gap:9px;align-items:center;
    background:var(--c-bg-panel-main);margin-bottom:5px; border: var(--fvc-border-s);
    cursor:pointer;border-radius: var(--fvc-border-radius);padding:2px 10px 2px 2px;}
  .list-item:hover{background: var(--c-bg-panel);}
  .list-item.compact{padding:2px 10px 2px 2px;flex-wrap:wrap;}
  .list-item.compact .et{width:112px;height:63px;border-radius:5px;}
  .list-item.compact .eact .ico{width:30px;height:30px;}
  .list-item.compact .eact .ico svg{width:24px;height:24px;}
  .et{border-radius:var(--fvc-border-radius);overflow:hidden;flex-shrink:0;
    background:var(--c-bg-deep);position:relative;object-fit:cover;}
  .et img{width:160px;height:90px;object-fit:cover;display:block;}
  .alert{outline: 2px solid var(--c-bg-alert);} 
  .detection{outline: 2px solid var(--c-accent);}
  .eact{display:flex;flex-direction:row;align-items:center;gap:4px;flex-shrink:0;padding:right:10px}
  .tph{width:160px;height:90px;display:flex;align-items:center;justify-content:center;border-radius:var(--fvc-border-radius);background:linear-gradient(135deg,#1a2840,#0d1520);
    color:var(--c-primary-d);} 
  .tph svg{width:20px;height:20px;}

 /* \u2500\u2500 recordings \u2500\u2500 */
  .ric{width:63px;height:63px;border-radius:5px;background:rgba(30,80,200,.25);
    color:var(--c-primary-d);display:flex;align-items:center;justify-content:center;} 
  .ric svg{width:16.8px;height:16.8px;}
  .rinf{flex:1;} 
  .rt{font-size:0.9rem;font-weight:600;color:var(--c-text);} 
  .rsub{font-size:0.75rem;color:var(--c-text2);margin-top:1px;} 
  .rp{width:31.2px;height:31.2px;display:flex;align-items:center;justify-content:center;background:var(--c-bg-panel);border:var(--fvc-border-s);border-radius:5px;color:var(--c-text2);cursor:pointer;flex-shrink:0;padding:0;}
  .rp svg{width:15.6px;height:15.6px;}
  .rp:hover{color:var(--c-primary-d);border-color:var(--c-primary-d);}

  /* \u2500\u2500 reviews \u2500\u2500 */
  .rev-nogap {display:flex;gap:0;}
  .rev-inf{flex:1;} 
  .rev-t{font-size:0.9rem;font-weight:600;color:var(--c-text);} 
  .rev-m{display:flex;align-items:center;gap:6px;flex-wrap:wrap;font-size:0.75rem;color:var(--c-text2);margin-top:1px;} 
  .rev-m .time-meta,.rev-m .review-meta{display:inline-flex;align-items:center;gap:4px;} 
  .rev-m svg{width:10.8px;height:10.8px;}

  .xform{box-shadow: var(--fvc-shadow-s);transition: transform 0.1s, box-shadow 0.1s;}
  .xform:hover{transform: scale(1.004);box-shadow: var(--fvc-shadow-s);}
  .shadow-small {box-shadow: var(--fvc-shadow-s);}  
  .shadow-medium {box-shadow: var(--fvc-shadow-m);}
  .tabs-container{display:block;position:realtive;}
  .tabs{display:flex;flex-wrap:wrap;gap:5px;padding:2px 8px;overflow-x:auto;scrollbar-width:none;position:relative;z-index:auto;background-color:var(--c-bg-panel) !important;border-radius: 8px;transition: background-color 0.3s ease;margin:3px 8px;}
  .tabs::-webkit-scrollbar{display:none;}

  /* \u2500\u2500 donut button \u2500\u2500 */
  .donut{display:inline-flex;align-items:center;justify-content: center;gap:4px;font-size:1rem;font-weight:600;border-radius:50%;min-height:36px;min-width:36px;background-color:var(--c-bg-main);padding:1px;transition: all 0.2s ease;cursor:pointer;}
  .donut svg{width:24px;height:24px;opacity:0.85;color:var(--c-text2)}
  .donut:hover {background-color:var(--c-bg-main);color:var(--c-primary-d);}
  .donut:hover svg{color:var(--c-primary-d);}
  .donut.active {background:var(--c-primary-d);} 
  .donut.active svg{color:var(--c-text-rev);}


  .newtoast{font-size:0.75rem;font-weight:700;color:var(--c-on);}
  .empty{text-align:center;padding:16px;color:var(--c-text3);font-size:0.9rem;line-height:1.5;}
  .more,.end{position:relative;display:flex;min-height:0;align-items:center;justify-content:center;font-size:0.85rem;color:var(--c-text2);padding:6px;border-top: 1px solid var(--c-border);}
  .more.to-top{position:relative;cursor:pointer;color:var(--c-text2);}

  /* \u2500\u2500 feed area \u2500\u2500 */
    .feed-area{position:relative;width:100%;}
    #eng-wrap{background:var(--c-bg-deep);position:relative;width:100%;aspect-ratio:16/9;overflow:hidden;max-height:var(--view-height,none);z-index:0;isolation:isolate;transition:opacity .22s ease,border-radius .25s ease,box-shadow .25s ease;}
    #engine,#stream-fallback{transition:opacity .22s ease;}
    #eng-wrap::before{content:"";position:absolute;inset:0;border-radius:inherit;pointer-events:none;z-index:5;box-sizing:border-box;border:0 solid transparent;transition:border-color .2s ease,border-width .2s ease;}
    #eng-wrap.slideshow-switching #engine,
    #eng-wrap.slideshow-switching #stream-fallback{opacity:.12;}
    #eng-wrap.slideshow-alert::before{border-width:3px;border-color:var(--error-color, var(--c-bg-alert));}
    #eng-wrap.slideshow-detection::before{border-width:3px;border-color:var(--warning-color, var(--c-accent));}
    #eng-wrap.popup-covered::after{content:"";position:absolute;inset:0;background:var(--c-bg-deep);z-index:4;pointer-events:none;}
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
    .card.mobile-rotate-popup,
    .card.mobile-rotate-popup-exit{overflow:hidden;height:var(--rotate-vh);max-height:var(--rotate-vh);}
    .card.mobile-rotate-popup #myPopup,
    .card.mobile-rotate-popup-exit #myPopup{position:fixed;top:var(--rotate-oy);left:var(--rotate-ox);right:auto;bottom:auto;width:var(--rotate-vw);height:var(--rotate-vh);max-height:var(--rotate-vh);min-height:var(--rotate-vh);z-index:1400;transform:translateY(0) !important;border-radius:0;background:var(--c-bg-deep);}
    .card.mobile-rotate-popup #myPopup{animation:popupOverlayIn .28s ease both;}
    .card.mobile-rotate-popup-exit #myPopup{animation:popupOverlayOut .24s ease both;}
    .card.mobile-rotate-popup .popup-header,
    .card.mobile-rotate-popup-exit .popup-header{display:none;}
    .card.mobile-rotate-popup .popup-body,
    .card.mobile-rotate-popup-exit .popup-body{padding:0;gap:0;overflow:hidden;}
    .card.mobile-rotate-popup #viewer,
    .card.mobile-rotate-popup-exit #viewer{width:100%;height:100%;max-height:none;min-height:100%;aspect-ratio:auto;border-radius:0;}
    .card.mobile-rotate-popup #viewer video,
    .card.mobile-rotate-popup-exit #viewer video,
    .card.mobile-rotate-popup #viewer img.snap,
    .card.mobile-rotate-popup-exit #viewer img.snap{object-fit:contain;object-position:center center;background:#000;}
    .card.mobile-rotate-popup .overlay-fs,
    .card.mobile-rotate-popup-exit .overlay-fs,
    .card.mobile-rotate-popup .popup-close-row,
    .card.mobile-rotate-popup-exit .popup-close-row{display:none !important;}
    .card.mobile-rotate-popup #popup-info-head,
    .card.mobile-rotate-popup #popup-info,
    .card.mobile-rotate-popup #recording-scrub,
    .card.mobile-rotate-popup #popup-carousel-wrap,
    .card.mobile-rotate-popup #popup-shell-ver,
    .card.mobile-rotate-popup-exit #popup-info-head,
    .card.mobile-rotate-popup-exit #popup-info,
    .card.mobile-rotate-popup-exit #recording-scrub,
    .card.mobile-rotate-popup-exit #popup-carousel-wrap,
    .card.mobile-rotate-popup-exit #popup-shell-ver{display:none !important;}
  #stream-fallback{position:absolute;inset:0;z-index:2;background:var(--c-bg-deep);
    pointer-events:none;line-height:0;}
  #stream-fallback[hidden]{display:none;}
  #stream-fallback img{width:100%;height:100%;max-width:none;max-height:none;object-fit:contain;object-position:center center;display:block;background:var(--c-bg-deep);}
  #stream-fallback::after{content:none;}
  #engine{position:absolute;inset:0;z-index:1;min-height:0;flex-shrink:0;}
  #engine video{width:100%;height:100%;display:block;object-fit:contain;var(--c-bg-deep);}
  #engine ha-camera-stream,#engine ha-hls-player,#engine webrtc-camera{width:100%;height:100%;display:block;}
  .stream-fallback-status{position:absolute;left:8px;bottom:8px;z-index:3;display:flex;align-items:center;gap:6px;padding:4.8px 9.6px;border-radius:999px;background:rgba(0,0,0,.62);border:1px solid rgba(255,255,255,.2);color:var(--c-text-rev);font-size:0.825rem;font-weight:600;line-height:1;backdrop-filter:blur(2px);}
  .stream-fallback-status[hidden]{display:none;}
  .stream-loading{position:absolute;top:8px;right:8px;display:flex;align-items:center;gap:6px;padding:4.8px 9.6px;border-radius:999px;background:rgba(0,0,0,.55);border:1px solid rgba(255,255,255,.2);color:var(--c-text-rev);font-size:0.825rem;font-weight:600;line-height:1;z-index:3;backdrop-filter:blur(2px);}
  .stream-loading[hidden]{display:none;}
  .stream-loading .dot{width:10px;height:10px;border:2px solid rgba(255,255,255,.3);border-top-color:var(--c-text-rev);border-radius:50%;animation:spin .9s linear infinite;}

  .close-btn {width: 40px;height: 40px;border-radius: 50%;display: flex;align-items: center;  justify-content: center;font-size: 24px;line-height: 1;cursor: pointer;border: 1px solid #ccc;
    background-color: #f5f5f5;color: #333;transition: all 0.2s ease;}
  .close-btn:hover {background-color: #e0e0e0;color: #000;}



  .glass-btn{  display: inline-flex; 
    align-items: center; 
    justify-content: center; 
    padding: 3px; 
    border-radius: 2rem; 
    color: black; 
    font-size: 1.0rem; 
    border: 1px solid rgba(255, 255, 255, 0.15); 
    background-color: rgba(255, 255, 255, 0.15); 
    backdrop-filter: blur(1px) saturate(150%); 
    box-shadow: 0 8px 16px 0 rgba(0, 0, 0, 0.15);
    cursor:pointer;   
  }
  .glass::after {  content: ""; /* Added missing quotes */
    position: absolute; 
    top: 0; 
    left: 0; 
    width: 100%; 
    height: 100%; 
    background: rgba(255, 255, 255, 0.04); 
    border-radius: 100px; 
    backdrop-filter: blur(1px); 
    box-shadow: inset -10px -8px 0px -11px rgba(255, 255, 255, 0.3), 
                inset 0px -9px 0px -8px rgba(255, 255, 255, 0.3); 
    opacity: 0.4; 
    z-index: -1; 
    filter: brightness(115%); }
  .glass-btn:hover{background:rgba(255, 255, 255, 0.3);} 
  .glass-btn svg{width:24px;height:24px;opacity: 0.8; }
  .glass-btn:hover svg{width:30px;height:30px;opacity: 0.95; }

  .mute-btn {position:absolute;right:8px;bottom:8px;z-index:3;width:36px;height:36px;opacity:0;pointer-events:none;transition:opacity .16s ease;}
  .sv.stream-type{text-transform:uppercase;font-size:0.95rem;}

  .cam-tab{font-size: 1rem;padding:0.4em;line-height: 1;font-weight:600;padding:6px;white-space:nowrap;}  
  .cam-tab:hover{color:var(--c-primary-d);}
  .cam-tab.active{background:var(--c-primary-d);color:var(--c-text-rev);}
  .cam-tab.active:hover{background:var(--c-primary-d);color:var(--c-text-rev);}
  .cam-tab svg{width:14.4px;height:14.4px;flex-shrink:0;}
  .cam-tab:hover svg{width:14.4px;height:14.4px;flex-shrink:0;} 
  .cam-dot{font-size:0.7rem;vertical-align:middle;}

  .overlay-fs{position:absolute;top:8px;left:8px;z-index:3;padding: 3px;opacity:0;pointer-events:none;transition:opacity .16s ease;}
  .overlay-fs::after {content: "";position: absolute;top: 0;left: 0;}         
  .overlay-fs[hidden]{display:none !important;}
  .overlay-fs svg {width:30px;height:30px;opacity: 0.8; }
  .overlay-fs:hover svg {width:30px;height:30px;opacity: 0.95; }
  .slideshow-next-chip{position:absolute;top:8px;left:50%;transform:translateX(-50%);z-index:6;min-height:30px;padding:4px 10px;border-radius:999px;font-size:.78rem;font-weight:700;line-height:1;cursor:default;pointer-events:none;white-space:nowrap;opacity:.95;}
  .slideshow-next-chip[hidden]{display:none !important;}
  #eng-wrap.live-controls-visible .live-fs-btn,
  #eng-wrap.live-controls-visible .mute-btn{opacity:1;pointer-events:auto;}
  @media (hover: hover) and (pointer: fine) {
    #eng-wrap:hover .live-fs-btn,
    #eng-wrap:hover .mute-btn{opacity:1;pointer-events:auto;}
  }

  #eng-wrap:fullscreen .overlay-fs,
  #eng-wrap:-webkit-full-screen .overlay-fs,
  #viewer:fullscreen .overlay-fs,
  #viewer:-webkit-full-screen .overlay-fs{display:none !important;}
  .viewer{width:100%;aspect-ratio:16/9;min-height:240px;max-height:70dvh;
    background:var(--c-bg-deep);display:flex;align-items:center;justify-content:center;z-index:2;position:relative;overflow:hidden;border-radius:7px;}
  .viewer video,.viewer img.snap{width:100%;height:100%;object-fit:contain;
    background:var(--c-bg-deep);}
  .viewer .ld{color:var(--c-text2);font-size:0.975rem;}
  .ph{width:100%;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;color:var(--c-text2);background:linear-gradient(145deg,#1a2540,#0d1520);}
  .ph svg{width:40px;height:40px;opacity:.35;}
  .live-grid{width:100%;height:100%;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));grid-template-rows:repeat(2,minmax(0,1fr));gap:6px;padding:6px;box-sizing:border-box;}
  .live-grid-cell{position:relative;overflow:hidden;border-radius:7px;background:var(--c-bg-deep);border:var(--c-border2);}
  .live-grid-cell.grid-alert{border-color:var(--error-color, var(--c-bg-alert));box-shadow:inset 0 0 0 2px var(--error-color, var(--c-bg-alert));}
  .live-grid-cell.grid-detection{border-color:var(--warning-color, var(--c-accent));box-shadow:inset 0 0 0 2px var(--warning-color, var(--c-accent));}
  .live-grid-cell.empty{display:flex;align-items:center;justify-content:center;cursor:default;}
  .live-grid-cell.empty .ph{border-radius:7px;}
  .live-grid-cell video,.live-grid-cell img,.live-grid-cell ha-camera-stream{width:100%;height:100%;display:block;object-fit:contain;object-position:center center;background:var(--c-bg-deep);}
  .live-grid-label{position:absolute;left:6px;top:6px;z-index:2;padding:2px 6px;border-radius:999px;background:rgba(0,0,0,.55);border:1px solid rgba(255,255,255,.2);color:var(--c-text-rev);font-size:.68rem;line-height:1.2;pointer-events:none;text-transform:none;}
  .preview-shell,.preview-shell-header,.preview-shell-footer{display:none;}
  .card.preview-active{width:100%;max-width:none;margin:0;}
  .card.preview-active .layout{display:flex;flex-direction:column;width:100%;min-width:0;height:var(--view-height,100dvh);max-height:var(--view-height,100dvh);overflow:hidden !important;}
  .card.preview-active .col-left,.card.preview-active .resize-handle,.card.preview-active .col-right{display:none;}

  .card.preview-active .preview-shell-header{display:flex;flex:0 0 auto;align-items:center;justify-content:space-between;gap:10px;padding:10px 12px;position:sticky;top:0;z-index:4;}


  .preview-shell-title{min-width:0;display:flex;flex-direction:column;gap:2px;}
  .preview-shell-title-main{font-size:1.05rem;font-weight:700;color:var(--c-text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
  .preview-shell-title-sub{font-size:.78rem;color:var(--c-text2);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
  .card.preview-active .preview-shell{display:block;flex:1 1 auto;width:100%;min-width:0;min-height:0;padding:10px;box-sizing:border-box;overflow-y:auto;overscroll-behavior:contain;-webkit-overflow-scrolling:touch;touch-action:pan-y;}
  .card.preview-active .preview-shell-footer{display:flex;flex:0 0 auto;align-items:center;min-height:30px;padding:4px 8px;position:sticky;bottom:0;z-index:4;}
  .preview-shell-footer .frigate-view{position:static;max-height:24px;}
  .preview-shell-footer .frigate-view svg{height:24px;}

  .preview-grid {display: grid;gap: 10px;width: 100%;max-width: 100%;
    grid-template-columns: repeat(auto-fit,minmax(max(min(100%, 420px), calc(33.333% - 10px)),1fr));
  }
  .preview-grid > div {min-width: 0;}

  .preview-cell{display:flex;flex-direction:column;cursor:pointer;border-radius: 0 0 15px 15px;    -webkit-backface-visibility: hidden;backface-visibility: hidden;}
  .preview-media-host{position:relative;aspect-ratio:16/9;overflow:hidden;border-radius:15px;background:var(--c-bg-deep);-webkit-backface-visibility: hidden;backface-visibility: hidden;
    transform: translateZ(0);}
  .preview-media-host.grid-alert{border-color:var(--error-color, var(--c-bg-alert));box-shadow:inset 0 0 0 2px var(--error-color, var(--c-bg-alert));}
  .preview-media-host.grid-detection{border-color:var(--warning-color, var(--c-accent));box-shadow:inset 0 0 0 2px var(--warning-color, var(--c-accent));}
  .preview-media-host video,.preview-media-host img,.preview-media-host ha-camera-stream{width:100%;height:100%;display:block;object-fit:contain;object-position:center center;background:var(--c-bg-deep);}
  .preview-meta{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:2px 8px;align-items:center;padding:6px 8px;background:var(--c-bg-main);}
  .preview-meta-name{font-size:.82rem;font-weight:700;color:var(--c-text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
  .preview-meta-source{font-size:.7rem;color:var(--c-text2);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
  .preview-meta-events{font-size:.72rem;color:var(--c-text2);}
  .preview-meta-status{font-size:.72rem;color:var(--c-text2);display:inline-flex;align-items:center;gap:5px;justify-self:end;}
  .preview-meta-status .dot{font-size:.82rem;line-height:1;}
  .preview-cam-buttons{display:flex;flex-wrap:wrap;gap:6px;margin-top:10px;}
  .preview-cam-btn{font-size:.9rem;line-height:1;padding:6px 9px;}
  @media (max-width: 720px){
    .preview-meta{grid-template-columns:minmax(0,1fr);gap:2px;}
    .preview-meta-status{justify-self:start;}
  }
  @supports (-moz-appearance:none) {
    .live-grid{transform:translateZ(0);backface-visibility:hidden;}
    .live-grid-cell{contain:layout paint;transform:translateZ(0);backface-visibility:hidden;}
    .live-grid-cell video,.live-grid-cell img,.live-grid-cell ha-camera-stream{transform:translateZ(0);backface-visibility:hidden;}
  }
  .ph-spin{width:24px;height:24px;border:3px solid rgba(255,255,255,.1);border-top-color:var(--c-accent);border-radius:50%;animation:spin .8s linear infinite;}
  @keyframes spin{to{transform:rotate(360deg);}}
    @keyframes liveOverlayIn{from{opacity:.9;}to{opacity:1;}}
    @keyframes liveOverlayOut{from{opacity:1;}to{opacity:.92;}}
    @keyframes popupOverlayIn{from{opacity:.9;}to{opacity:1;}}
    @keyframes popupOverlayOut{from{opacity:1;}to{opacity:.92;}}


  /* \u2500\u2500 info row \u2500\u2500 */
  .info-row{display:flex;flex-wrap: wrap;padding:10px 16px 8px;
    border-bottom:1px solid var(--c-border);}
  .page-nav{display:flex;flex-wrap:wrap;gap:6px;padding:8px 12px 0;}
  .page-nav-btn{border:1px solid var(--c-border2);background:var(--c-bg-panel);color:var(--c-text2);border-radius:999px;padding:6px 10px;font-size:.78rem;font-weight:700;line-height:1;cursor:pointer;transition:background .16s ease,border-color .16s ease,color .16s ease;}
  .page-nav-btn:hover{border-color:var(--c-primary);color:var(--c-primary-d);}
  .page-nav-btn.active{background:var(--c-primary-d);border-color:var(--c-primary-d);color:var(--c-text-rev);}
  .info-title{font-size:1.05rem;font-weight:700;color:var(--c-text);}
  .stats{display:flex;flex-wrap: wrap;gap:10px;justify-self:end;margin-left:auto;justify-self:end;} 
  .stat{display:flex;flex-direction:column;align-items:flex-end;}
  .sv{font-size:1.05rem;font-weight:700;color:var(--c-primary-d);} .sl{font-size:0.75rem;color:var(--c-text2);text-transform:uppercase;letter-spacing:.06em;}
  
  /* \u2500\u2500 camera switcher \u2500\u2500 */

  .cam-switcher {
    display: flex;
    align-items: center;
    gap: 4px;
    flex-wrap: wrap; /* Wraps items on larger displays */
    padding: 6px 12px;
  }


  @media (max-width: 767px) {
    .cam-switcher {
      flex-wrap: nowrap; /* Forces items onto one line */
      overflow-x: auto;
      white-space: nowrap;
      -webkit-overflow-scrolling: touch; /* Smooth iOS scroll */
      
      /* Hide scrollbars */
      scrollbar-width: none;
      -ms-overflow-style: none;
    }

    .cam-switcher::-webkit-scrollbar {
      display: none;
    }

    /* Crucial: Prevents child items from squishing on mobile */
    .cam-switcher > * {
      flex-shrink: 0; 
    }
  }

  /* \u2500\u2500 timeline \u2500\u2500 */
  .tl-tools{display:flex;gap:4px;}
  .tool{display:inline-flex;gap:4px;align-items:center;justify-content:center;background:var(--c-bg);border:1px solid var(--c-border2);color:var(--c-text2);border-radius:6px;cursor:pointer;padding:2px;transition: all 0.2s ease;min-height:36px;min-width:36px;}
  .tool svg{width:24px;height:24px;opacity:0.85;color:var(--c-text2)}
  .tool ha-icon{width:24px;height:24px;--mdc-icon-size:24px;color:var(--c-text2);opacity:0.85;}
  .tool:hover{color:var(--c-primary-d);border-color:var(--c-primary-d);opacity:1;}
  .tool:hover svg{color:var(--c-primary-d);}
  .tool:hover ha-icon{color:var(--c-primary-d);opacity:1;}
  .tool.active{background:var(--c-primary-d);color:var(--c-text-rev);border-color:var(--c-primary-d);}
  .tool.active svg{color:var(--c-text-rev);opacity:1;}
  .tool.active ha-icon{color:var(--c-text-rev);opacity:1;}
  .tool:disabled{opacity:.45;cursor:not-allowed;color:var(--c-text4);border-color:var(--c-border2);}
  .tool:disabled:hover{color:var(--c-text4);border-color:var(--c-border2);}
  .ico{width:30px;height:30px;display:flex;align-items:center;background:var(--c-bg-panel);border:1px solid var(--c-border2);border-radius:5px;color:var(--c-text2);cursor:pointer;}
  .ico svg{width:24px;height:24px;} .ico:hover{color:var(--c-primary-d);border-color:var(--c-primary-d);}
  .ico.fav.on{color:var(--c-accent);border-color:rgba(251,191,36,.4);background:rgba(251,191,36,.12);}

  /* \u2500\u2500 filter + cal \u2500\u2500 */
  .filter-panel,.cal-panel{display: none;position: absolute;right:0;background-color: #f1f1f1;min-width: 300px;overflow: auto;box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.2);z-index: 3;padding:20px;}
  .frow{display:flex;align-items:center;gap:5px;flex-wrap:wrap;margin-bottom:4px;} .frow:last-child{margin-bottom:0;} .frow-l{font-size:0.75rem;color:var(--c-text3);width:38px;text-transform:uppercase;flex-shrink:0;}
  .chip{background:var(--c-bg-panel);border:1px solid var(--c-border2);color:var(--c-text2);border-radius:10px;padding:3.6px 10.8px;font-size:0.825rem;cursor:pointer;}
  .chip.on{background:var(--c-primary-l);border-color:var(--c-primary-d);color:var(--c-primary-d);}
  .cal-head{display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;} .cal-head b{font-size:0.9rem;} .cal-head button{background:none;border:none;color:var(--c-primary-d);font-size:1.275rem;cursor:pointer;padding:0 6px;}
  .cal-dow,.cal-grid{display:grid;grid-template-columns:repeat(7,1fr);gap:1px;text-align:center;}
  .cal-dow span{font-size:0.675rem;color:var(--c-text2);padding:2px 0;}
  .cday{position:relative;background:none;border:none;color:var(--c-text);font-size:0.825rem;padding:6px 0;border-radius:4px;cursor:pointer;} .cday:hover{background:var(--c-primary-l);} .cdot{position:absolute;bottom:2px;left:50%;transform:translateX(-50%);width:3px;height:3px;border-radius:50%;background:#ef4444;}

  .frigate-view{position:absolute;bottom:2px;left:6px;max-height:24px;pointer-events: none;
      fill: #ff5733;stroke: #000000;stroke-width: 2px;}
  .frigate-view svg{height:24px;pointer-events: none;}
  
  .recording-scrub {display:flex;flex-direction:column;align-items:stretch;gap:6px;}
  .recording-scrub[hidden] {display:none;}
  .recording-scrub-track {position:relative;width:100%;height:28px;border-radius:999px;background:var(--c-bg-scrub);cursor:pointer;touch-action:none;overflow:visible;}
  .recording-scrub-ticks {position:absolute;inset:0;pointer-events:none;z-index:3;}
  .recording-scrub-markers {position:absolute;inset:0;pointer-events:none;z-index:2;}
  .recording-scrub-alert {position:absolute;top:2px;bottom:2px;background:var(--c-bg-alert);border-radius:999px;min-width:8px;opacity:.95;box-shadow:0 0 0 1px rgba(0,0,0,.25) inset;}
  .recording-scrub-detection {position:absolute;top:4px;bottom:4px;background:#f59e0b;border-radius:999px;min-width:4px;opacity:.95;}
  .recording-scrub-tick {position:absolute;top:3px;bottom:3px;width:3px;background:rgba(15,21,40,.55);border-radius:999px;transform:translateX(-1px);box-shadow:0 0 0 1px rgba(255,255,255,.28);}
  .recording-scrub-cursor {position:absolute;top:-6px;bottom:-6px;width:3px;background:rgba(255,255,255,.97);border-radius:999px;left:0;transform:translateX(-1px);pointer-events:none;box-shadow:0 0 0 1px rgba(0,0,0,.25);z-index:4;}
  .recording-scrub-labels {display:flex;align-items:center;justify-content:space-between;gap:8px;font-size:.78rem;color:var(--c-text2);font-weight:600;line-height:1;}
  .recording-scrub-now {font-variant-numeric:tabular-nums;}

  .ed{position:absolute;bottom:2px;right:3px;font-size:0.675rem;font-weight:700;color:var(--c-text-rev);background:rgba(0,0,0,.65);border-radius:3px;padding:1.2px 3.6px;}
  .ei{flex:1;min-width:0;}
  .etop{display:flex;align-items:center;gap:5px;margin-bottom:3px;flex-wrap:wrap;}
  .tb{font-size:0.75rem;font-weight:700;padding:2.4px 7.2px;border-radius:6px;}
  .cam-badge{font-size:0.675rem;color:var(--c-text2);background:var(--c-bg-panel);padding:1.2px 7.2px;border-radius:6px;}
  .subl{font-size:0.75rem;font-weight:600;color:var(--c-primary-l);background:rgba(99,102,241,.16);padding:2.4px 7.2px;border-radius:6px;}
  .bc,.bs{font-size:0.675rem;font-weight:700;padding:1.2px 6px;border-radius:5px;text-transform:uppercase;} .bc{background:rgba(74,222,128,.14);color:var(--c-on);} .bs{background:rgba(148,163,184,.16);color:var(--c-text2);}
  .esc{font-size:0.825rem;font-weight:700;color:var(--c-on);background:rgba(74,222,128,.12);border-radius:5px;padding:1.2px 6px;}
  .em{display:flex;gap:8px;flex-wrap:wrap;font-size:0.75rem;color:var(--c-text2);} .em span{display:flex;align-items:center;gap:4px;} 
  .em svg{width:10.8px;height:10.8px;}
  .desc{margin-top:4px;font-size:0.825rem;color:var(--c-text2);line-height:1.45;background:var(--c-bg-panel);border-radius:5px;padding:6px 8.4px;}


   /* \u2500\u2500 toast \u2500\u2500 */
  .toast{position:fixed;left:50%;bottom:24px;transform:translateX(-50%);z-index:99;background:rgba(15,21,40,.96);border:1px solid rgba(239,68,68,.4);color:var(--c-off);padding:8px 14px;border-radius:6px;font-size:0.9rem;box-shadow:0 8px 24px rgba(0,0,0,.5);max-width:90%;}

/* ========================================================= */
  .popup-content {position: absolute;bottom: 0;left: 0;width: 100%;height: 95%;max-height: 95%;  min-height: 95%;box-sizing: border-box;z-index: var(--popup-z-index);background: var(--popup-bg);
    border-top-left-radius: var(--ha-card-border-radius, 14px);border-top-right-radius: var(--ha-card-border-radius, 14px);overflow: hidden;box-shadow: 0 -8px 40px rgba(0, 0, 0, 0.15);  display: flex;flex-direction: column;overscroll-behavior: contain;transform: translateY(100%);will-change: transform;visibility: hidden;transition: transform 0.3s cubic-bezier(0.25, 1, 0.5, 1), visibility 0.3s ease;}
  .popup-content.is-open {transform: translateY(0);visibility: visible;}
  .popup-header {display: flex;justify-content: center;align-items: center;height: 32px;width: 100%;
  flex-shrink: 0;cursor: grab;touch-action: none;}
  .popup-close-row {position: absolute;top: 3px;right: 10px;z-index: 5;pointer-events: none;}
  .popup-close-row .close-btn {pointer-events: auto;}
  .popup-header::before {content: '';width: 40px;height: 4px;background-color: var(--handle-color);  border-radius: 3px;}
  .popup-body {padding: 0 24px 24px 24px;overflow-y: auto;overflow-x:hidden;flex-grow: 1;display: flex;  flex-direction: column;gap: 8px;-webkit-overflow-scrolling: touch;overscroll-behavior-y: contain;}
  .popup-shell-ver {margin: 0;font-size: 18px;font-weight: 800;line-height: 1.2;color: var(--c-text2);}
  .popup-info-head {margin: 0;font-size: 18px;font-weight: 800;color: var(--c-text2);
    line-height: 1.35;text-transform: uppercase;letter-spacing: .03em;}
  .popup-info-head[hidden] {display: none;}
  .popup-media-controls {display:grid;grid-template-columns:2px 36px minmax(0,1fr) 36px 36px 2px;grid-template-areas:"sp1 play progress mute fs sp2" ". . time . . .";align-items:center;column-gap:5px;row-gap:0;padding:1px 4px 2px;border-radius:8px;background:var(--c-bg-panel);border:1px solid var(--c-border2);box-sizing:border-box;width:100%;}
  .popup-media-controls[hidden] {display:none !important;}
  .popup-media-controls-spacer {width:2px;}
  .popup-media-controls-spacer:first-child {grid-area:sp1;}
  .popup-media-controls-spacer:last-child {grid-area:sp2;}
  .popup-media-btn {width:36px;height:36px;display:flex;align-items:center;justify-content:center;background:var(--c-bg-main);border:1px solid var(--c-border2);border-radius:7px;color:var(--c-text2);cursor:pointer;flex-shrink:0;}
  .popup-media-btn:hover {color:var(--c-primary-d);border-color:var(--c-primary-d);}
  .popup-media-btn svg {width:20px;height:20px;}
  .popup-media-progress {grid-area:progress;min-width:0;width:100%;-webkit-appearance:none;appearance:none;height:6px;border-radius:999px;background:var(--c-bg-main);outline:none;transform:translateY(-20%);}
  .popup-media-progress::-webkit-slider-runnable-track {height:6px;border-radius:999px;background:var(--c-bg-main);}
  .popup-media-progress::-webkit-slider-thumb {-webkit-appearance:none;appearance:none;width:14px;height:14px;border-radius:50%;background:var(--c-primary);border:1px solid var(--c-primary-d);margin-top:-4px;}
  .popup-media-progress::-moz-range-track {height:6px;border-radius:999px;background:var(--c-bg-main);}
  .popup-media-progress::-moz-range-thumb {width:14px;height:14px;border-radius:50%;background:var(--c-primary);border:1px solid var(--c-primary-d);}
  .popup-media-time {grid-area:time;min-width:0;text-align:left;font-size:.76rem;color:var(--c-text2);font-variant-numeric:tabular-nums;line-height:.9;margin-top:-8px;}
  .popup-media-btn#popup-media-play {grid-area:play;}
  .popup-media-btn#popup-media-mute {grid-area:mute;}
  .popup-media-btn#popup-media-fs {grid-area:fs;}
  .card.mobile-rotate-popup .popup-media-controls,
  .card.mobile-rotate-popup-exit .popup-media-controls {position:fixed;left:10px;right:10px;bottom:1px;width:auto;z-index:1406;background:var(--c-bg-panel);opacity:.62;backdrop-filter:blur(3px);transition:opacity .22s ease;}
  .card.mobile-rotate-popup .popup-media-btn#popup-media-fs,
  .card.mobile-rotate-popup-exit .popup-media-btn#popup-media-fs {display:none !important;}
  .card.mobile-rotate-popup .popup-media-controls.is-hidden,
  .card.mobile-rotate-popup-exit .popup-media-controls.is-hidden {opacity:0;pointer-events:none;}

  .popup-carousel-wrap {position:relative;}
  .popup-carousel-wrap[hidden] {display:none !important;}
  .popup-carousel {display:flex;gap:8px;overflow-x:auto;scroll-snap-type:x mandatory;scroll-behavior:smooth;padding:2px 0 4px;touch-action:pan-x;overscroll-behavior-x:contain;-webkit-overflow-scrolling:touch;}
  .popup-carousel::-webkit-scrollbar {height:8px;}
  .popup-carousel::-webkit-scrollbar-thumb {background:var(--c-text4);border-radius:4px;}
  .popup-carousel-item {flex:0 0 auto;width:132px;display:flex;flex-direction:column;gap:4px;background:var(--c-bg-main);border:1px solid var(--c-border2);border-radius:7px;padding:4px;cursor:pointer;scroll-snap-align:start;color:var(--c-text);}
  .popup-carousel-item.active {border-color:var(--c-primary-d);box-shadow:0 0 0 1px var(--c-primary-d) inset;}
  .popup-carousel-item .et {width:124px;height:70px;border-radius:5px;}
  .popup-carousel-meta {display:flex;justify-content:space-between;align-items:center;gap:6px;font-size:.72rem;color:var(--c-text2);}
  .popup-carousel-nav {position:absolute;top:6px;bottom:8px;width:26px;display:flex;align-items:center;justify-content:center;background:var(--c-bg-main);opacity:.86;border:1px solid var(--c-border2);color:var(--c-text2);z-index:2;cursor:pointer;}
  .popup-carousel-nav:hover {color:var(--c-primary-d);border-color:var(--c-primary-d);}
  .popup-carousel-nav.left {left:0;border-radius:6px 0 0 6px;}
  .popup-carousel-nav.right {right:0;border-radius:0 6px 6px 0;}
  .popup-carousel-wrap.touch .popup-carousel-nav {display:none;}
  .popup-info {background: var(--c-bg-panel);border: 1px solid var(--c-border2);border-radius: 9px;
    padding: 10px 12px;display: flex;flex-direction: column;gap: 8px;}
  .popup-info[hidden] {display: none;}
  .popup-info-title {display: flex;align-items: center;gap: 8px;flex-wrap: wrap;}
  .popup-info-title .tb {font-size: 0.825rem;}
  .popup-info-body {display:flex;align-items:flex-end;gap:10px;min-width:0;}
  .popup-info-grid {flex:1 1 auto;min-width:0;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:6px 12px;}
  .popup-info-row {display:flex;align-items:baseline;gap:6px;min-width:0;}
  .popup-info-k {font-size: 0.75rem;color: var(--c-primary-d);text-transform: uppercase;
    letter-spacing: .05em;flex-shrink: 0;}
  .popup-info-v {font-size: 0.9rem;color: var(--c-text);white-space: nowrap;overflow: hidden;
    text-overflow: ellipsis;}
  .popup-info-actions {display:flex;align-items:flex-end;justify-content:flex-end;flex:0 0 auto;min-width:52px;}
  .popup-action {width: 52px;height: 52px;display: flex;align-items: center;justify-content: center;
    background: var(--c-bg-panel);border: 1px solid var(--c-border2);border-radius: 6px;
    color: var(--c-text2);cursor: pointer;}
  .popup-action svg {width: 26px;height: 26px;}
  .popup-action:hover {color: var(--c-primary-d);border-color: var(--c-primary-d);}
  @media (max-width: 980px){
    .popup-info-grid{grid-template-columns:repeat(2,minmax(0,1fr));}
  }
  @media (max-width: 720px){
    .popup-info-grid{grid-template-columns:minmax(0,1fr);}
  }



`;

// src/router.js
const PAGE_IDS = Object.freeze({
  singleView: "single-view",
  preview: "preview",
  wideView: "wide-view"
});
const DEVICE_ROUTE_BUCKETS = Object.freeze({
  mobile: "mobile",
  tablet: "tablet",
  desktop: "desktop"
});
const PAGE_ROUTE_ORDER = Object.freeze([
  PAGE_IDS.singleView,
  PAGE_IDS.preview,
  PAGE_IDS.wideView
]);
const PAGE_ROUTE_SET = new Set(PAGE_ROUTE_ORDER);
const normalizePageRoute = (value) => {
  const route = String(value || "").trim().toLowerCase();
  if (route === "normal" || route === "single") return PAGE_IDS.singleView;
  if (route === "wide" || route === "wide_view") return PAGE_IDS.wideView;
  if (route === "preview") return PAGE_IDS.preview;
  return PAGE_ROUTE_SET.has(route) ? route : PAGE_IDS.singleView;
};
const resolveDeviceRouteBucket = (deviceProfile = {}) => {
  if (deviceProfile?.isPhone) return DEVICE_ROUTE_BUCKETS.mobile;
  if (deviceProfile?.isTablet) return DEVICE_ROUTE_BUCKETS.tablet;
  return DEVICE_ROUTE_BUCKETS.desktop;
};
const isPageEnabled = (config, pageId) => {
  if (pageId === PAGE_IDS.singleView) return true;
  if (pageId === PAGE_IDS.preview) return config?.preview_page_enabled === true;
  if (pageId === PAGE_IDS.wideView) {
    return config?.wide_view_page_enabled === true;
  }
  return false;
};
const isPageSupportedOnDevice = (pageId, deviceBucket) => {
  if (pageId === PAGE_IDS.wideView) {
    return deviceBucket !== DEVICE_ROUTE_BUCKETS.mobile;
  }
  return true;
};
const getEnabledPageRoutes = (config, deviceBucket) => PAGE_ROUTE_ORDER.filter(
  (pageId) => isPageEnabled(config, pageId) && isPageSupportedOnDevice(pageId, deviceBucket)
);
const resolveConfiguredLandingPage = (config, deviceBucket) => {
  const key = deviceBucket === DEVICE_ROUTE_BUCKETS.mobile ? "mobile_page" : "landing_page";
  return normalizePageRoute(config?.[key]);
};
const resolveStartupPageRoute = ({
  config,
  deviceBucket,
  hasPendingDeepLinkTarget = false
}) => {
  if (hasPendingDeepLinkTarget) return PAGE_IDS.singleView;
  const available = getEnabledPageRoutes(config, deviceBucket);
  const preferred = resolveConfiguredLandingPage(config, deviceBucket);
  if (available.includes(preferred)) return preferred;
  return available[0] || PAGE_IDS.singleView;
};
const createNavigationFactory = ({
  pages,
  getDeviceBucket,
  getConfig,
  onBeforeNavigate = null,
  onAfterNavigate = null
}) => {
  const resolveAvailablePages = () => getEnabledPageRoutes(getConfig(), getDeviceBucket());
  const navigateTo = (pageId, context = {}) => {
    const nextPageId = normalizePageRoute(pageId);
    const available = resolveAvailablePages();
    const resolvedPageId = available.includes(nextPageId) ? nextPageId : PAGE_IDS.singleView;
    const page = pages[resolvedPageId] || pages[PAGE_IDS.singleView];
    if (!page) return PAGE_IDS.singleView;
    if (typeof onBeforeNavigate === "function") {
      onBeforeNavigate(resolvedPageId, context);
    }
    page.activate(context);
    if (typeof onAfterNavigate === "function") {
      onAfterNavigate(resolvedPageId, context);
    }
    return resolvedPageId;
  };
  return {
    getAvailablePages: resolveAvailablePages,
    getDeviceBucket: () => getDeviceBucket(),
    resolveStartupPage: ({ hasPendingDeepLinkTarget = false } = {}) => resolveStartupPageRoute({
      config: getConfig(),
      deviceBucket: getDeviceBucket(),
      hasPendingDeepLinkTarget
    }),
    navigateTo
  };
};

// src/helpers.js
function detectDeviceProfile() {
  const nav = typeof navigator !== "undefined" ? navigator : {};
  const win = typeof window !== "undefined" ? window : {};
  const userAgent = String(nav.userAgent || "").toLowerCase();
  const platform = String(
    nav.userAgentData?.platform || nav.platform || ""
  ).toLowerCase();
  const maxTouchPoints = Number(nav.maxTouchPoints || 0);
  const primaryPointerCoarse = !!win.matchMedia?.("(pointer: coarse)")?.matches;
  const anyPointerCoarse = !!win.matchMedia?.("(any-pointer: coarse)")?.matches;
  const hoverNone = !!win.matchMedia?.("(hover: none)")?.matches;
  const hasTouch = maxTouchPoints > 0 || primaryPointerCoarse || anyPointerCoarse || hoverNone;
  const isAndroid2 = platform.includes("android") || userAgent.includes("android");
  const isIPhone = /iphone/.test(userAgent);
  const isMobileHint = nav.userAgentData?.mobile === true || /mobile|mobi/.test(userAgent);
  const isIPad = /ipad/.test(userAgent) || platform.includes("mac") && maxTouchPoints > 1 && hasTouch;
  const isIPod = /ipod/.test(userAgent);
  const isIOS2 = isIPhone || isIPad || isIPod;
  const isTablet = isIPad || isAndroid2 && hasTouch && !isMobileHint;
  const isPhone = (isIOS2 || isAndroid2) && !isTablet;
  const isMobile = isPhone || isTablet;
  return {
    hasTouch,
    hasPrimaryTouch: primaryPointerCoarse,
    hasAnyTouch: anyPointerCoarse || hoverNone,
    isAndroid: isAndroid2,
    isIOS: isIOS2,
    isPhone,
    isTablet,
    isMobile,
    isDesktop: !isMobile,
    os: isAndroid2 ? "Android" : isIOS2 ? "iOS" : "Desktop/Other"
  };
}
const DEVICE_PROFILE = detectDeviceProfile();
const isIOS = DEVICE_PROFILE.isIOS;
const isAndroid = DEVICE_PROFILE.isAndroid;
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
function normalizeCameraConnectionType(value) {
  const type = String(value ?? "").trim().toLowerCase();
  if (type === "ha_direct" || type === "ha" || type === "home_assistant") {
    return "ha_direct";
  }
  return DEFAULT_CAMERA_CONNECTION_TYPE;
}
function normalizeAlertsAreaContent(value) {
  const mode = String(value ?? "").trim().toLowerCase();
  return mode === "all_reviews" ? "all_reviews" : "alerts_only";
}
function normalizeDisableHlsDesktop(value) {
  return value === true;
}
function normalizeHexColor(value) {
  const s = String(value || "").trim().toLowerCase();
  if (/^#[0-9a-f]{6}$/.test(s)) return s;
  if (/^#[0-9a-f]{3}$/.test(s)) {
    return `#${s[1]}${s[1]}${s[2]}${s[2]}${s[3]}${s[3]}`;
  }
  return "";
}
const DIALOG_ACTION_SELECTOR = '[slot="primaryAction"], [slot="secondaryAction"], mwc-button, ha-button, button';
const resolveActiveTab = (currentTab, hiddenTabIds, tabOrder) => {
  if (!hiddenTabIds.has(currentTab) && tabOrder.includes(currentTab)) {
    return currentTab;
  }
  return tabOrder.find((id) => !hiddenTabIds.has(id)) || tabOrder[0] || "alerts";
};
const setSettingsPanelActiveState = (panels, activePanel) => {
  panels.forEach((panel) => {
    const isActive = panel === activePanel;
    panel.classList.toggle("active", isActive);
    const toggle = panel.querySelector("[data-panel-toggle]");
    if (toggle) {
      toggle.setAttribute("aria-expanded", isActive ? "true" : "false");
    }
  });
  return activePanel?.dataset?.panel ?? null;
};
const dialogActionKindFromElement = (button) => {
  if (!(button instanceof Element)) return null;
  const explicitSlot = button.getAttribute?.("slot") || "";
  if (explicitSlot === "primaryAction") return "primary";
  if (explicitSlot === "secondaryAction") return "secondary";
  const actionAttr = (button.getAttribute?.("dialogAction") || button.getAttribute?.("dialog-action") || "").toString().trim().toLowerCase();
  if (["save", "ok", "done", "confirm", "apply"].includes(actionAttr)) {
    return "primary";
  }
  if (["cancel", "close", "dismiss"].includes(actionAttr)) {
    return "secondary";
  }
  const label = (button.textContent || "").trim().toLowerCase();
  if (["save", "done", "update", "apply", "ok"].includes(label)) {
    return "primary";
  }
  if (["cancel", "close", "dismiss"].includes(label)) {
    return "secondary";
  }
  return null;
};
const dialogActionKindFromEvent = (event) => {
  const path = Array.isArray(event.composedPath?.()) ? event.composedPath() : [];
  if (path.some((node) => node?.id === "camera-modal")) return null;
  const button = path.find(
    (node) => node instanceof Element && node.matches?.(DIALOG_ACTION_SELECTOR)
  );
  if (!(button instanceof Element)) return null;
  return dialogActionKindFromElement(button);
};
const wireCameraRowDragAndDrop = ({
  rows,
  clearDropTargets,
  onReorder
}) => {
  rows.forEach((row) => {
    row.addEventListener("dragstart", (event) => {
      const rowIndex = row.dataset.row;
      event.dataTransfer?.setData("text/plain", rowIndex);
      event.dataTransfer.effectAllowed = "move";
      row.classList.add("dragging");
    });
    row.addEventListener("dragend", () => {
      row.classList.remove("dragging");
      clearDropTargets();
    });
    row.addEventListener("dragover", (event) => {
      event.preventDefault();
      row.classList.add("drop-target");
    });
    row.addEventListener("dragleave", () => {
      row.classList.remove("drop-target");
    });
    row.addEventListener("drop", (event) => {
      event.preventDefault();
      row.classList.remove("drop-target");
      const fromIndex = Number(
        event.dataTransfer?.getData("text/plain") || "-1"
      );
      const toIndex = Number(row.dataset.row || "-1");
      onReorder(fromIndex, toIndex);
    });
  });
};
const setFieldErrorState = (root, selector, message) => {
  const field = root.querySelector(selector);
  if (!field) return;
  field.toggleAttribute("data-invalid", !!message);
  const helper = root.querySelector(`${selector}-helper`);
  if (helper) {
    helper.textContent = message || "";
    helper.classList.toggle("error", !!message);
  }
};
const bindNumericInputField = ({ root, selector, onSanitize }) => {
  const field = root.querySelector(selector);
  if (!field) return;
  const sanitize = () => {
    const clean = String(field.value || "").replace(/[^0-9]/g, "");
    if (field.value !== clean) field.value = clean;
    onSanitize?.();
  };
  const restrictKey = (event) => {
    if (event.ctrlKey || event.metaKey || event.altKey || [
      "Backspace",
      "Delete",
      "Tab",
      "Enter",
      "ArrowLeft",
      "ArrowRight",
      "ArrowUp",
      "ArrowDown",
      "Home",
      "End"
    ].includes(event.key)) {
      return;
    }
    if (!/^[0-9]$/.test(event.key)) event.preventDefault();
  };
  const restrictBeforeInput = (event) => {
    if (event.data && /[^0-9]/.test(event.data)) event.preventDefault();
  };
  field.addEventListener("input", sanitize);
  field.addEventListener("change", sanitize);
  field.addEventListener("value-changed", sanitize);
  requestAnimationFrame(() => {
    const innerInput = field.shadowRoot?.querySelector("input");
    if (!innerInput || innerInput.dataset.frigateNumericBound === "true") {
      return;
    }
    innerInput.dataset.frigateNumericBound = "true";
    innerInput.inputMode = "numeric";
    innerInput.pattern = "[0-9]*";
    innerInput.addEventListener("keydown", restrictKey);
    innerInput.addEventListener("beforeinput", restrictBeforeInput);
    innerInput.addEventListener("input", sanitize);
  });
};
const bindSelectorSyncEvents = (element, syncValue) => {
  if (!element || typeof syncValue !== "function") return;
  element.addEventListener("value-changed", syncValue);
  element.addEventListener("selected-changed", syncValue);
  element.addEventListener("change", syncValue);
};
const setupSelectSelector = ({
  element,
  hass,
  options,
  initialValue,
  fallbackValue,
  normalize = (value) => value,
  onChange
}) => {
  if (!element) return;
  element.hass = hass;
  element.selector = {
    select: {
      mode: "dropdown",
      options
    }
  };
  const startValue = normalize(initialValue ?? fallbackValue);
  element.value = startValue;
  element.dataset.value = startValue;
  const syncValue = (event) => {
    const nextRaw = event?.detail?.value ?? element.value ?? fallbackValue;
    const nextValue = normalize(nextRaw);
    element.value = nextValue;
    element.dataset.value = nextValue;
    onChange?.(nextValue, event);
  };
  bindSelectorSyncEvents(element, syncValue);
};
const setupEntitySelector = ({
  element,
  hass,
  domain,
  label,
  onChange
}) => {
  if (!element) return;
  element.hass = hass;
  element.selector = { entity: { domain } };
  if (label) element.label = label;
  const syncValue = (event) => {
    const nextValue = event?.detail?.value ?? element.value ?? "";
    element.dataset.value = String(nextValue || "");
    onChange?.(String(nextValue || ""), event);
  };
  element.addEventListener("value-changed", syncValue);
  element.addEventListener("selected-changed", syncValue);
};
const bindThemeControlEvents = ({
  root,
  update,
  themeDraftCache,
  resolveDefaultHex
}) => {
  root.querySelectorAll("[data-theme-option]").forEach((button) => {
    button.addEventListener("pointerdown", (event) => {
      event.stopPropagation();
    });
    button.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      const selectedTheme = event.currentTarget?.dataset?.themeOption || "default";
      root.querySelectorAll("[data-theme-option]").forEach((themeButton) => {
        const isActive = themeButton.dataset.themeOption === selectedTheme;
        themeButton.classList.toggle("active", isActive);
        themeButton.setAttribute("aria-checked", isActive ? "true" : "false");
      });
      const customPanel = root.querySelector("#theme-custom-panel");
      if (customPanel) {
        customPanel.hidden = selectedTheme !== "custom";
        if (selectedTheme === "custom") customPanel.setAttribute("open", "");
      }
      update();
    });
  });
  root.querySelectorAll("[data-theme-color]").forEach((input) => {
    input.addEventListener("input", (event) => {
      const colorKey = event.currentTarget?.dataset?.themeColor;
      const colorValue = normalizeHexColor(event.currentTarget?.value);
      if (colorKey && colorValue) themeDraftCache[colorKey] = colorValue;
      update();
    });
    input.addEventListener("change", update);
  });
  root.querySelectorAll("[data-theme-reset]").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      const colorKey = event.currentTarget?.dataset?.themeReset;
      const input = root.querySelector(`[data-theme-color="${colorKey}"]`);
      if (!colorKey || !input || input.disabled) return;
      const defaultHex = resolveDefaultHex(colorKey);
      input.value = defaultHex;
      themeDraftCache[colorKey] = defaultHex;
      update();
    });
  });
  root.querySelectorAll("[data-theme-default]").forEach((toggle) => {
    const colorKey = toggle.dataset.themeDefault;
    const input = root.querySelector(`[data-theme-color="${colorKey}"]`);
    const reset = root.querySelector(`[data-theme-reset="${colorKey}"]`);
    toggle.addEventListener("change", (event) => {
      const isDefault = event.currentTarget?.checked === true;
      if (!input) {
        update();
        return;
      }
      if (isDefault) {
        input.value = resolveDefaultHex(colorKey);
        input.disabled = true;
        if (reset) reset.hidden = true;
      } else {
        const draftHex = normalizeHexColor(themeDraftCache?.[colorKey]);
        input.value = draftHex || resolveDefaultHex(colorKey);
        input.disabled = false;
        if (reset) reset.hidden = false;
      }
      update();
    });
    toggle.addEventListener("value-changed", (event) => {
      toggle.checked = event?.detail?.value === true;
    });
  });
};
const bindClickHandler = ({ root, selector, handler }) => {
  root.querySelector(selector)?.addEventListener("click", handler);
};
const bindClickHandlers = (root, bindings) => {
  bindings.forEach((binding) => bindClickHandler({ root, ...binding }));
};
const bindEachClickHandler = ({ root, selector, handler }) => {
  root.querySelectorAll(selector).forEach((element) => {
    element.addEventListener("click", (event) => handler(event, element));
  });
};
const bindEventsForIds = ({ root, ids, events, handler }) => {
  ids.forEach((id) => {
    const element = root.querySelector(`#${id}`);
    if (!element) return;
    events.forEach((eventName) => {
      element.addEventListener(
        eventName,
        (event) => handler(event, element, id)
      );
    });
  });
};
const bindEventsForSelectorAll = ({
  root,
  selector,
  events,
  handler
}) => {
  root.querySelectorAll(selector).forEach((element) => {
    events.forEach((eventName) => {
      element.addEventListener(
        eventName,
        (event) => handler(event, element, selector)
      );
    });
  });
};
const buildEditorConfigFromDom = ({
  root,
  baseConfig,
  cameras,
  themeDraftCache
}) => {
  const readTrimmed = (id) => root.querySelector(`#${id}`)?.value?.trim() || "";
  const isSwitchChecked = (element) => {
    if (!element) return false;
    if (element.checked === true) return true;
    return element.getAttribute?.("checked") != null;
  };
  const nextConfig = { ...baseConfig, cameras };
  delete nextConfig.camera_entity;
  const title = readTrimmed("title");
  const subtitle = readTrimmed("subtitle");
  if (title) nextConfig.title = title;
  else delete nextConfig.title;
  if (subtitle) nextConfig.subtitle = subtitle;
  else delete nextConfig.subtitle;
  nextConfig.window_days = normalizePositiveInteger(
    root.querySelector("#window_days")?.dataset.value || root.querySelector("#window_days")?.value || "3",
    3
  );
  nextConfig.alerts_reviews_days = normalizePositiveInteger(
    root.querySelector("#alerts_reviews_days")?.dataset.value || root.querySelector("#alerts_reviews_days")?.value || String(nextConfig.window_days || 3),
    nextConfig.window_days || 3
  );
  nextConfig.window_hours = nextConfig.window_days * 24;
  const realtimePollSeconds = Number(
    root.querySelector("#realtime_poll_seconds")?.dataset.value || root.querySelector("#realtime_poll_seconds")?.value || "5"
  );
  nextConfig.realtime_poll_seconds = REALTIME_POLL_OPTIONS_SECONDS.includes(
    realtimePollSeconds
  ) ? realtimePollSeconds : 5;
  nextConfig.mobile_poll_battery_saver = root.querySelector("#mobile_poll_battery_saver")?.checked === true;
  nextConfig.slideshow_rotation_enabled = root.querySelector("#slideshow_rotation_enabled")?.checked === true;
  nextConfig.slideshow_rotation_seconds = SLIDESHOW_ROTATION_OPTIONS_SECONDS.includes(
    Number(
      root.querySelector("#slideshow_rotation_seconds")?.dataset.value || root.querySelector("#slideshow_rotation_seconds")?.value || "30"
    )
  ) ? Number(
    root.querySelector("#slideshow_rotation_seconds")?.dataset.value || root.querySelector("#slideshow_rotation_seconds")?.value || "30"
  ) : 30;
  nextConfig.grid_mode_enabled = root.querySelector("#grid_mode_enabled")?.checked === true;
  nextConfig.grid_start_in_grid_enabled = root.querySelector("#grid_start_in_grid_enabled")?.checked === true;
  nextConfig.grid_live_view_enabled = root.querySelector("#grid_live_view_enabled")?.checked !== false;
  nextConfig.preview_page_enabled = root.querySelector("#preview_page_enabled")?.checked === true;
  nextConfig.preview_page_live_cameras = root.querySelector("#preview_page_live_cameras")?.checked === true;
  nextConfig.preview_page_show_title_bars = root.querySelector("#preview_page_show_title_bars")?.checked !== false;
  nextConfig.wide_view_page_enabled = root.querySelector("#wide_view_page_enabled")?.checked === true;
  nextConfig.grid_rotation_seconds = GRID_ROTATION_OPTIONS_SECONDS.includes(
    Number(
      root.querySelector("#grid_rotation_seconds")?.dataset.value || root.querySelector("#grid_rotation_seconds")?.value || "30"
    )
  ) ? Number(
    root.querySelector("#grid_rotation_seconds")?.dataset.value || root.querySelector("#grid_rotation_seconds")?.value || "30"
  ) : 30;
  delete nextConfig.primary_color;
  delete nextConfig.accent_color;
  delete nextConfig.bg_color;
  delete nextConfig.use_primary_color;
  delete nextConfig.use_accent_color;
  delete nextConfig.use_bg_color;
  nextConfig.theme = root.querySelector("[data-theme-option].active")?.dataset?.themeOption === "custom" ? "custom" : "default";
  const themeCustomDefaults = {};
  const themeCustom = {};
  root.querySelectorAll("[data-theme-color]").forEach((input) => {
    const key = input.dataset.themeColor;
    if (!THEME_CUSTOM_KEYS.has(key)) return;
    const useDefault = root.querySelector(`[data-theme-default="${key}"]`)?.checked === true;
    const inputValue = normalizeHexColor(input.value);
    if (useDefault) themeCustomDefaults[key] = true;
    if (!useDefault && inputValue) themeDraftCache[key] = inputValue;
    const cached = normalizeHexColor(themeDraftCache?.[key]);
    if (cached) themeCustom[key] = cached;
  });
  nextConfig.theme_custom = themeCustom;
  nextConfig.theme_custom_defaults = themeCustomDefaults;
  const hiddenTabs = [...root.querySelectorAll("[data-active-tab]")].filter((element) => !isSwitchChecked(element)).map((element) => element.dataset.activeTab).filter((tabId) => ALLOWED_HIDDEN_TABS.includes(tabId));
  nextConfig.hidden_tabs = hiddenTabs.length ? hiddenTabs : [];
  const streamHeight = root.querySelector("#stream_height")?.value;
  const streamHeightUnit = root.querySelector("#stream_height_unit")?.dataset.value || root.querySelector("#stream_height_unit")?.value || "vh";
  nextConfig.stream_height = streamHeight ? Number(streamHeight) : null;
  nextConfig.stream_height_unit = streamHeightUnit;
  nextConfig.tight_margins = root.querySelector("#tight_margins")?.checked === true;
  nextConfig.shadows = root.querySelector("#shadows")?.checked !== false;
  nextConfig.borders = root.querySelector("#borders")?.checked !== false;
  nextConfig.rounded_corners = root.querySelector("#rounded_corners")?.checked !== false;
  nextConfig.outer_shadows = root.querySelector("#outer_shadows")?.checked !== false;
  nextConfig.landing_page = normalizePageRoute(
    root.querySelector("#landing_page")?.dataset.value || root.querySelector("#landing_page")?.value || PAGE_IDS.singleView
  );
  nextConfig.mobile_page = normalizePageRoute(
    root.querySelector("#mobile_page")?.dataset.value || root.querySelector("#mobile_page")?.value || PAGE_IDS.singleView
  );
  const leftWidthRaw = root.querySelector("#col_left_width_pct")?.value?.replace(/%/g, "").trim();
  nextConfig.col_left_width_pct = leftWidthRaw ? Math.min(Math.max(parseInt(leftWidthRaw, 10) || 50, 10), 90) : 50;
  return nextConfig;
};
const addStringIfPresent = (target, key, value) => {
  const trimmed = String(value || "").trim();
  if (trimmed) target[key] = trimmed;
};
const addIfNotDefault = (target, key, value, defaultValue) => {
  if (value !== defaultValue) target[key] = value;
};
const compactCameraConfigForYaml = (camera) => {
  const normalized = normalizeCameraConfig(camera, { fallbackName: "" });
  if (!normalized.entity) return null;
  const compact = { entity: normalized.entity };
  addStringIfPresent(compact, "name", normalized.name);
  if (normalized.connection_type !== DEFAULT_CAMERA_CONNECTION_TYPE) {
    compact.connection_type = normalized.connection_type;
  }
  if (normalized.alerts_content !== "alerts_only") {
    compact.alerts_content = normalized.alerts_content;
  }
  if (normalized.disable_hls_desktop === true) {
    compact.disable_hls_desktop = true;
  }
  return compact;
};
const compactEditorConfigForYaml = (config, { themeDefaultColors = {} } = {}) => {
  const source = config && typeof config === "object" ? config : {};
  const compact = {};
  const cameras = Array.isArray(source.cameras) ? source.cameras.map(compactCameraConfigForYaml).filter(Boolean) : [];
  if (cameras.length) compact.cameras = cameras;
  addStringIfPresent(compact, "title", source.title);
  addStringIfPresent(compact, "subtitle", source.subtitle);
  const windowDays = normalizePositiveInteger(source.window_days, 3);
  addIfNotDefault(compact, "window_days", windowDays, 3);
  const alertsReviewsDays = normalizePositiveInteger(
    source.alerts_reviews_days,
    windowDays
  );
  addIfNotDefault(
    compact,
    "alerts_reviews_days",
    alertsReviewsDays,
    windowDays
  );
  const realtimePollSeconds = REALTIME_POLL_OPTIONS_SECONDS.includes(
    Number(source.realtime_poll_seconds)
  ) ? Number(source.realtime_poll_seconds) : 5;
  addIfNotDefault(compact, "realtime_poll_seconds", realtimePollSeconds, 5);
  addIfNotDefault(
    compact,
    "mobile_poll_battery_saver",
    source.mobile_poll_battery_saver === true,
    false
  );
  addIfNotDefault(
    compact,
    "slideshow_rotation_enabled",
    source.slideshow_rotation_enabled === true,
    false
  );
  const slideshowRotationSeconds = SLIDESHOW_ROTATION_OPTIONS_SECONDS.includes(
    Number(source.slideshow_rotation_seconds)
  ) ? Number(source.slideshow_rotation_seconds) : 30;
  addIfNotDefault(
    compact,
    "slideshow_rotation_seconds",
    slideshowRotationSeconds,
    30
  );
  addIfNotDefault(
    compact,
    "grid_mode_enabled",
    source.grid_mode_enabled === true,
    false
  );
  addIfNotDefault(
    compact,
    "grid_start_in_grid_enabled",
    source.grid_start_in_grid_enabled === true,
    false
  );
  addIfNotDefault(
    compact,
    "grid_live_view_enabled",
    source.grid_live_view_enabled !== false,
    true
  );
  addIfNotDefault(
    compact,
    "preview_page_enabled",
    source.preview_page_enabled === true,
    false
  );
  addIfNotDefault(
    compact,
    "preview_page_live_cameras",
    source.preview_page_live_cameras === true,
    false
  );
  addIfNotDefault(
    compact,
    "preview_page_show_title_bars",
    source.preview_page_show_title_bars !== false,
    true
  );
  addIfNotDefault(
    compact,
    "wide_view_page_enabled",
    source.wide_view_page_enabled === true,
    false
  );
  addIfNotDefault(
    compact,
    "landing_page",
    normalizePageRoute(source.landing_page),
    PAGE_IDS.singleView
  );
  addIfNotDefault(
    compact,
    "mobile_page",
    normalizePageRoute(source.mobile_page),
    PAGE_IDS.singleView
  );
  const gridRotationSeconds = GRID_ROTATION_OPTIONS_SECONDS.includes(
    Number(source.grid_rotation_seconds)
  ) ? Number(source.grid_rotation_seconds) : 30;
  addIfNotDefault(compact, "grid_rotation_seconds", gridRotationSeconds, 30);
  const hiddenTabs = Array.isArray(source.hidden_tabs) ? source.hidden_tabs.map((id) => id === "reviews" ? "alerts" : id).filter((id) => ALLOWED_HIDDEN_TABS.includes(id)) : [];
  if (hiddenTabs.length) compact.hidden_tabs = hiddenTabs;
  if (source.theme === "custom") {
    compact.theme = "custom";
    const themeCustom = source.theme_custom && typeof source.theme_custom === "object" ? source.theme_custom : {};
    const themeCustomDefaults = source.theme_custom_defaults && typeof source.theme_custom_defaults === "object" ? source.theme_custom_defaults : {};
    const compactThemeCustom = {};
    Object.entries(themeCustom).forEach(([key, value]) => {
      if (!THEME_CUSTOM_KEYS.has(key)) return;
      if (themeCustomDefaults[key] === true) return;
      const color = normalizeHexColor(value);
      if (!color) return;
      const defaultColor = normalizeHexColor(themeDefaultColors[key]);
      if (defaultColor && color === defaultColor) return;
      compactThemeCustom[key] = color;
    });
    if (Object.keys(compactThemeCustom).length) {
      compact.theme_custom = compactThemeCustom;
    }
  }
  const streamHeight = source.stream_height ? Number(source.stream_height) : null;
  if (streamHeight) compact.stream_height = streamHeight;
  const streamHeightUnit = source.stream_height_unit || "vh";
  if (streamHeight && streamHeightUnit !== "vh") {
    compact.stream_height_unit = streamHeightUnit;
  }
  addIfNotDefault(
    compact,
    "tight_margins",
    source.tight_margins === true,
    false
  );
  addIfNotDefault(compact, "shadows", source.shadows !== false, true);
  addIfNotDefault(compact, "borders", source.borders !== false, true);
  addIfNotDefault(
    compact,
    "rounded_corners",
    source.rounded_corners !== false,
    true
  );
  addIfNotDefault(
    compact,
    "outer_shadows",
    source.outer_shadows !== false,
    true
  );
  const leftWidth = Number(source.col_left_width_pct) || 50;
  addIfNotDefault(compact, "col_left_width_pct", leftWidth, 50);
  return compact;
};
const withCardTypeForYaml = (config, { sourceConfig = null } = {}) => {
  const payload = {
    type: `custom:${CARD_TAG}`,
    ...config && typeof config === "object" ? config : {}
  };
  const source = sourceConfig && typeof sourceConfig === "object" ? sourceConfig : null;
  if (source && source.grid_options && typeof source.grid_options === "object") {
    payload.grid_options = { ...source.grid_options };
  }
  if (source && source.visibility != null) {
    payload.visibility = Array.isArray(source.visibility) ? source.visibility.map(
      (item) => item && typeof item === "object" ? { ...item } : item
    ) : source.visibility;
  }
  return payload;
};
const createEditorPreviewDraft = (config) => ({
  title: config.title,
  subtitle: config.subtitle,
  window_days: config.window_days,
  alerts_reviews_days: config.alerts_reviews_days,
  realtime_poll_seconds: config.realtime_poll_seconds,
  mobile_poll_battery_saver: config.mobile_poll_battery_saver,
  slideshow_rotation_enabled: config.slideshow_rotation_enabled,
  slideshow_rotation_seconds: config.slideshow_rotation_seconds,
  grid_mode_enabled: config.grid_mode_enabled,
  grid_start_in_grid_enabled: config.grid_start_in_grid_enabled,
  grid_live_view_enabled: config.grid_live_view_enabled,
  preview_page_enabled: config.preview_page_enabled,
  preview_page_live_cameras: config.preview_page_live_cameras,
  preview_page_show_title_bars: config.preview_page_show_title_bars,
  wide_view_page_enabled: config.wide_view_page_enabled,
  landing_page: config.landing_page,
  mobile_page: config.mobile_page,
  grid_rotation_seconds: config.grid_rotation_seconds,
  hidden_tabs: config.hidden_tabs,
  theme: config.theme,
  theme_custom: config.theme_custom,
  theme_custom_defaults: config.theme_custom_defaults,
  stream_height: config.stream_height,
  stream_height_unit: config.stream_height_unit,
  tight_margins: config.tight_margins,
  shadows: config.shadows,
  borders: config.borders,
  rounded_corners: config.rounded_corners,
  outer_shadows: config.outer_shadows,
  col_left_width_pct: config.col_left_width_pct
});
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
  bus: "#34d399"
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
  "#ef4444"
];
function labelColor(l) {
  if (!l) return "#f59e0b";
  if (LABEL_COLORS[l]) return LABEL_COLORS[l];
  let h = 0;
  for (const c of l) h = h * 31 + c.charCodeAt(0) >>> 0;
  return PALETTE[h % PALETTE.length];
}
const CAM_COLORS = [
  "rgba(30,80,200,.5)",
  "rgba(210,80,30,.5)",
  "rgba(30,170,80,.5)",
  "rgba(170,30,180,.5)"
];
function mkCamState() {
  return {
    clientId: "frigate",
    cam: "",
    events: [],
    recordings: [],
    reviews: [],
    kept: [],
    discovered: false
  };
}
function camDisplayName(c) {
  return c.name || (c.entity || "").replace(/^camera\./, "").replace(/_/g, " ");
}
function normalizeCameraConfig(camera, { fallbackName = null } = {}) {
  if (typeof camera === "string") {
    return {
      entity: camera,
      name: fallbackName,
      connection_type: DEFAULT_CAMERA_CONNECTION_TYPE,
      alerts_content: "alerts_only",
      disable_hls_desktop: false
    };
  }
  if (camera && typeof camera === "object") {
    return {
      entity: camera.entity || camera.camera_entity || null,
      name: camera.name || fallbackName,
      connection_type: normalizeCameraConnectionType(camera.connection_type),
      alerts_content: normalizeAlertsAreaContent(camera.alerts_content),
      disable_hls_desktop: normalizeDisableHlsDesktop(
        camera.disable_hls_desktop
      )
    };
  }
  return {
    entity: null,
    name: fallbackName,
    connection_type: DEFAULT_CAMERA_CONNECTION_TYPE,
    alerts_content: "alerts_only",
    disable_hls_desktop: false
  };
}
const configuredCameraEntities = (config) => (config?.cameras || []).map(({ entity }) => entity).filter(Boolean);
const hassThemeSignature = (hass) => {
  const { darkMode = false, theme = "" } = hass?.themes || {};
  return `${darkMode === true ? "dark" : "light"}:${theme || hass?.selectedTheme || ""}`;
};
const hassEntityStateSignature = (hass, entities) => entities.map((entity) => `${entity}:${hass?.states?.[entity]?.state ?? "missing"}`).join("|");

// src/card/FrigateViewCard.js
const FrigateViewCard = class extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._onShadowClick = (e) => this._click(e);
    this.shadowRoot.addEventListener("click", this._onShadowClick);
    this._onShadowError = (e) => {
      const img = e.target;
      if (!(img instanceof HTMLImageElement)) return;
      const id = img.dataset.thumbId;
      if (!id) return;
      img.style.display = "none";
      const placeholder = img.nextElementSibling;
      if (placeholder) placeholder.style.display = "flex";
    };
    this.shadowRoot.addEventListener("error", this._onShadowError, true);
    this._hass = null;
    this._lastHassCameraStateSignature = "";
    this._lastHassThemeSignature = "";
    this._config = null;
    this._navigationFactory = null;
    this._pageId = PAGE_IDS.singleView;
    this._lastNonPreviewPageId = PAGE_IDS.singleView;
    this._started = false;
    this._activeCamIdx = 0;
    this._camCache = {};
    this._viewMode = "single";
    this._eventsMode = "camera";
    this._events = [];
    this._recordings = [];
    this._reviews = [];
    this._kept = [];
    this._tab = "alerts";
    this._playing = null;
    this._browseOpen = false;
    this._winEnd = 0;
    this._winStart = 0;
    this._followNowWindow = true;
    this._loading = false;
    this._exhausted = false;
    this._daysWithActivity = new Set();
    this._calendarActivityByCam = new Map();
    this._calendarActivityInFlight = new Map();
    this._filterLabel = "all";
    this._filterZone = "all";
    this._favOnly = false;
    this._calMonth = null;
    this._engine = null;
    this._unsub = null;
    this._rotateTimer = null;
    this._cardWidth = 0;
    this._playSeq = 0;
    this._streamMuted = true;
    this._activeStreamType = "--";
    this._lastLiveStreamHint = "";
    this._slideshowActive = false;
    this._slideshowPausedUntil = 0;
    this._slideshowPendingAlertCam = "";
    this._slideshowPendingAlertType = "";
    this._slideshowLastAlertAt = 0;
    this._slideshowLastAlertCam = "";
    this._slideshowAttentionType = "";
    this._slideshowHandledReviewIds = new Set();
    this._slideshowStartedAtSec = 0;
    this._slideshowReviewProbeT = null;
    this._slideshowReviewWatchT = null;
    this._slideshowReviewProbeInFlight = false;
    this._slideshowSwitchT = null;
    this._slideshowPauseT = null;
    this._slideshowFadeT = null;
    this._slideshowPopupPaused = false;
    this._slideshowNextSwitchAtMs = 0;
    this._slideshowCountdownT = null;
    this._gridRotationStart = 0;
    this._gridRotationT = null;
    this._gridAlertReturnT = null;
    this._gridAlertWatchT = null;
    this._gridAlertCleanupT = null;
    this._gridRefreshT = null;
    this._gridResumePending = false;
    this._gridPinnedRotationStart = 0;
    this._gridLastRenderSignature = "";
    this._gridStartedAtSec = 0;
    this._gridHandledReviewIds = new Set();
    this._gridLastAlertAt = 0;
    this._gridLastAlertCam = "";
    this._gridAlertExpiresByEntity = new Map();
    this._gridAlertSeverityByEntity = new Map();
    this._previewPageActive = false;
    this._previewSnapshotRefreshT = null;
    this._previewAlertWatchT = null;
    this._previewAlertCleanupT = null;
    this._previewHandledReviewIds = new Set();
    this._previewStartedAtSec = 0;
    this._previewLastRenderSignature = "";
    this._previewMediaState = null;
    this._previewAlertExpiresByEntity = new Map();
    this._previewAlertSeverityByEntity = new Map();
    this._domCache = {};
    this._go2rtcWsUrlCache = new Map();
    this._go2rtcHlsUrlCache = new Map();
    this._go2rtcHlsProbeInFlight = new Map();
    this._fallbackImgUrlCache = new Map();
    this._fallbackReqId = 0;
    this._eventsLoadToken = 0;
    this._reviewsLoadToken = 0;
    this._warmCamsToken = 0;
    this._warmOtherCamsDelayT = null;
    this._reloadPending = false;
    this._reloadAfterLoad = false;
    this._realtimeHeadPollT = null;
    this._switchLoadT = null;
    this._popupDrag = null;
    this._popupHandlers = null;
    this._popupMediaCleanup = null;
    this._popupMediaType = "";
    this._popupMediaStopTimer = null;
    this._popupMediaControlsCleanup = null;
    this._popupControlsHideTimer = null;
    this._liveControlsHideTimer = null;
    this._liveOverlayControlsCleanup = null;
    this._recordingScrubCleanup = null;
    this._recordingScrubState = null;
    this._recordingAlertCache = new Map();
    this._recordingsDayAvailabilityCache = new Map();
    this._recordingsDayDataCache = new Map();
    this._recordingsNavUpdateToken = 0;
    this._recordingsDayNavAnimating = false;
    this._recordingsSwipeGesture = null;
    this._recordingsSwipeBlockTap = false;
    this._recordingsSwipeCleanup = null;
    this._recordingHls = null;
    this._hlsJsCtorPromise = null;
    this._mountSeq = 0;
    this._lastRenderedListHtml = "";
    this._pendingMountDestroyers = [];
    this._pendingWebRTCTakeoverTimer = null;
    this._mseGracePool = new Map();
    this._wasVisible = false;
    this._resumeLiveT = null;
    this._disconnectTeardownT = null;
    this._editModeWatchdogT = null;
    this._editorDialogObserver = null;
    this._editorDialogOpenLast = false;
    this._dashboardEditLast = false;
    this._lastEditorPreviewContext = null;
    this._lastLiveKick = 0;
    this._rotateOverlayActive = false;
    this._rotateOverlayMode = "none";
    this._rotateOverlayRaf = 0;
    this._rotateOverlayExitT = null;
    this._rotateOverlaySyncVideo = null;
    this._onRotateOverlayVolumeChange = null;
    this._rotateStyledVideo = null;
    this._rotateStyledVideoCssText = "";
    this._engineMountedMuted = true;
    this._mountInProgress = false;
    this._mountStartedAt = 0;
    this._mountTargetEntity = "";
    this._mseConnectAt = 0;
    this._mseLastChunkAt = 0;
    this._mseChunkCount = 0;
    this._deepLinkEventId = "";
    this._deepLinkReviewId = "";
    this._deepLinkMediaHint = "";
    this._deepLinkCameraHint = "";
    this._deepLinkApplied = false;
    this._deepLinkEventLookupTried = false;
    this._deepLinkReviewLookupTried = false;
    this._committedConfig = null;
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
      this._onFullscreenChange
    );
    this._onViewportRotate = () => this._scheduleRotateOverlayUpdate();
    window.addEventListener("resize", this._onViewportRotate, {
      passive: true
    });
    window.addEventListener("orientationchange", this._onViewportRotate);
    window.visualViewport?.addEventListener("resize", this._onViewportRotate, {
      passive: true
    });
    window.visualViewport?.addEventListener("scroll", this._onViewportRotate, {
      passive: true
    });
    this._onEditorPreviewDraft = (ev) => {
      if (ev?.detail?.cardTag !== CARD_TAG) return;
      this._applyEditorPreviewDraft(ev.detail?.config || null);
    };
    window.addEventListener(
      "frigate-view-card-preview-draft",
      this._onEditorPreviewDraft
    );
  }
  _cloneCardConfig(config) {
    try {
      return JSON.parse(JSON.stringify(config || {}));
    } catch (_) {
      return { ...config || {} };
    }
  }
  _applyEditorPreviewDraft(previewConfig) {
    if (!this._isEditorPreviewContext()) return;
    if (!this._committedConfig) return;
    const base = this._cloneCardConfig(this._committedConfig);
    const prevHiddenTabs = JSON.stringify(base.hidden_tabs || []);
    const next = previewConfig ? {
      ...base,
      title: previewConfig.title || null,
      subtitle: previewConfig.subtitle || null,
      window_days: normalizePositiveInteger(previewConfig.window_days, 3),
      alerts_reviews_days: normalizePositiveInteger(
        previewConfig.alerts_reviews_days,
        normalizePositiveInteger(previewConfig.window_days, 3)
      ),
      realtime_poll_seconds: REALTIME_POLL_OPTIONS_SECONDS.includes(
        Number(previewConfig.realtime_poll_seconds)
      ) ? Number(previewConfig.realtime_poll_seconds) : 5,
      mobile_poll_battery_saver: previewConfig.mobile_poll_battery_saver === true,
      grid_mode_enabled: previewConfig.grid_mode_enabled === true,
      grid_start_in_grid_enabled: previewConfig.grid_start_in_grid_enabled === true,
      grid_live_view_enabled: previewConfig.grid_live_view_enabled !== false,
      grid_rotation_seconds: GRID_ROTATION_OPTIONS_SECONDS.includes(
        Number(previewConfig.grid_rotation_seconds)
      ) ? Number(previewConfig.grid_rotation_seconds) : 30,
      hidden_tabs: Array.isArray(previewConfig.hidden_tabs) ? previewConfig.hidden_tabs : [],
      theme: previewConfig.theme === "custom" ? "custom" : "default",
      theme_custom: previewConfig.theme_custom && typeof previewConfig.theme_custom === "object" ? previewConfig.theme_custom : {},
      theme_custom_defaults: previewConfig.theme_custom_defaults && typeof previewConfig.theme_custom_defaults === "object" ? previewConfig.theme_custom_defaults : {},
      stream_height: previewConfig.stream_height ? Number(previewConfig.stream_height) : null,
      stream_height_unit: previewConfig.stream_height_unit || "vh",
      tight_margins: previewConfig.tight_margins === true,
      shadows: previewConfig.shadows !== false,
      borders: previewConfig.borders !== false,
      rounded_corners: previewConfig.rounded_corners !== false,
      outer_shadows: previewConfig.outer_shadows !== false,
      wide_view_page_enabled: previewConfig.wide_view_page_enabled === true,
      landing_page: normalizePageRoute(previewConfig.landing_page),
      mobile_page: normalizePageRoute(previewConfig.mobile_page),
      col_left_width_pct: Number(previewConfig.col_left_width_pct) || 50
    } : base;
    this._config = next;
    this._syncVisualStyleToggles();
    this._browseOpen = this._config.browse_expanded;
    if (JSON.stringify(next.hidden_tabs || []) !== prevHiddenTabs) {
      this._syncTabsShell();
    }
    this._applyCardStyle();
    this._applyLayoutMode();
    if (this._isWideViewPageActive()) this._syncColHeight();
    this._syncStatus();
    this._renderSubtitle();
    this._renderStats();
    this._renderCamSwitcher();
    this._renderListLabel();
    this._renderList();
    this._syncPageNavigationButtons();
  }
  connectedCallback() {
    if (this._disconnectTeardownT) {
      clearTimeout(this._disconnectTeardownT);
      this._disconnectTeardownT = null;
      this._ffDebug("Reconnect during disconnect grace; preserving engine");
    }
    if (this.parentElement) {
      this._parentOrigStyle = {
        height: this.parentElement.style.height,
        margin: this.parentElement.style.margin,
        padding: this.parentElement.style.padding
      };
      this.parentElement.style.height = this._isPreviewContext() ? "auto" : "100%";
      this._applyTightMargins();
      this._applyLayoutMode();
      if (this._isWideViewPageActive()) {
        this._syncColHeight();
      }
    }
    this._syncVisualStyleToggles();
    this._scheduleRotateOverlayUpdate();
    if (this._started) {
      this._startEditModeWatchdog();
      if (this._shouldStartInGridMode()) {
        this._applyStartInGridMode("connected");
        this._scheduleGridRefresh(140);
      } else {
        this._scheduleResumeLive("connected");
      }
    }
    this._startEditorDialogCloseObserver();
  }
  _visualStyleToggleRules() {
    return [
      { configKey: "shadows", className: "shadows-off" },
      { configKey: "borders", className: "borders-off" },
      { configKey: "rounded_corners", className: "corners-off" }
    ];
  }
  _cardStateClassNames() {
    const classes = this._visualStyleToggleRules().filter(({ configKey }) => this._config?.[configKey] === false).map(({ className }) => className);
    if (this._isPreviewPageActive()) classes.push("preview-active");
    return classes.join(" ");
  }
  _syncVisualStyleToggles() {
    const card = this.shadowRoot?.querySelector("#card");
    if (!card) return;
    for (const { configKey, className } of this._visualStyleToggleRules()) {
      const isEnabled = this._config?.[configKey] !== false;
      card.classList.toggle(className, !isEnabled);
    }
    this._syncHostOuterStyles();
  }
  _syncHostOuterStyles() {
    const card = this.shadowRoot?.querySelector("#card");
    if (!card) return;
    const outerShadow = this._resolveCardTokenForHost(
      card,
      "box-shadow",
      "var(--fvc-outer-shadow-m)"
    );
    const outerRadius = this._resolveCardTokenForHost(
      card,
      "border-radius",
      "var(--fvc-outer-border-radius)"
    );
    this.style.boxShadow = this._config?.outer_shadows !== false && outerShadow ? outerShadow : "none";
    this.style.borderRadius = outerRadius || "0px";
  }
  _resolveCardTokenForHost(card, cssProperty, token) {
    const value = String(token || "").trim();
    if (!card || !value) return "";
    const probe = document.createElement("div");
    probe.style.cssText = "position:absolute;left:-9999px;top:-9999px;visibility:hidden;pointer-events:none;";
    probe.style.setProperty(cssProperty, value);
    card.appendChild(probe);
    const resolved = getComputedStyle(probe).getPropertyValue(cssProperty).trim();
    probe.remove();
    return resolved || value;
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
  _applyTightMargins() {
    const tightMarginsEnabled = this._config?.tight_margins === true;
    const inPreviewContext = this._isPreviewContext();
    if (this.parentElement) {
      this.parentElement.style.height = inPreviewContext ? "auto" : "100%";
      if (tightMarginsEnabled) {
        this.parentElement.style.margin = "0";
        this.parentElement.style.padding = "0";
      } else if (this._parentOrigStyle) {
        this.parentElement.style.margin = this._parentOrigStyle.margin;
        this.parentElement.style.padding = this._parentOrigStyle.padding;
      }
    }
    const card = this.shadowRoot?.querySelector("#card");
    if (card) card.classList.toggle("tight-margins", tightMarginsEnabled);
    this._setSectionsRowGap(tightMarginsEnabled);
  }
  _setSectionsRowGap(tightMarginsEnabled) {
    let element = this;
    while (element) {
      if (element.tagName === "HUI-SECTIONS-VIEW") {
        if (tightMarginsEnabled && !this._isPanelView()) {
          element.style.setProperty("--ha-view-sections-row-gap", "0px");
        } else {
          element.style.removeProperty("--ha-view-sections-row-gap");
        }
        break;
      }
      element = element.parentNode || element.host;
    }
  }
  _applyLayoutMode() {
    const layout = this.shadowRoot.querySelector("#layout");
    if (!layout) return;
    const isWide = this._isWideViewPageActive();
    layout.classList.toggle("wide-view", isWide);
    const colL = layout.querySelector(".col-left");
    const colR = layout.querySelector(".col-right");
    if (colL && colR) {
      if (isWide) {
        const pct = Math.min(
          Math.max(parseInt(this._config?.col_left_width_pct, 10) || 50, 10),
          90
        );
        colL.style.width = pct + "%";
        colR.style.width = 100 - pct + "%";
      } else {
        colL.style.width = "";
        colR.style.width = "";
      }
    }
  }
  _isPanelView() {
    let el = this;
    while (el) {
      if (el.tagName === "HUI-SECTIONS-VIEW" && el.shadowRoot) {
        return !this._hasAncestorInShadow(el.shadowRoot, this);
      }
      el = el.parentNode || el.host;
    }
    return false;
  }
  _hasAncestorInShadow(root, target) {
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
      cameras: [
        {
          entity: "camera.front_door",
          alerts_content: "alerts_only"
        }
      ],
      title: "Frigate Preview",
      subtitle: "Compact preview",
      compact_preview: true,
      stream_height: 42,
      stream_height_unit: "vh",
      window_days: 1,
      alerts_reviews_days: 1,
      hidden_tabs: ["clips", "snapshot", "recordings", "kept"],
      tight_margins: true
    };
  }
  setConfig(config) {
    const wasStarted = this._started === true;
    const prevConfig = this._config;
    let cameras;
    if (Array.isArray(config.cameras) && config.cameras.length) {
      cameras = config.cameras.map((camera) => normalizeCameraConfig(camera)).filter((c) => c.entity);
    } else if (typeof config.cameras === "string" && config.cameras) {
      cameras = [normalizeCameraConfig(config.cameras)].filter((c) => c.entity);
    } else if (config.cameras && typeof config.cameras === "object") {
      cameras = [normalizeCameraConfig(config.cameras)].filter((c) => c.entity);
    } else if (config.camera_entity) {
      cameras = [
        normalizeCameraConfig(
          { camera_entity: config.camera_entity },
          { fallbackName: config.title || null }
        )
      ];
    } else if (config.camera) {
      cameras = [normalizeCameraConfig(config.camera)].filter((c) => c.entity);
    } else if (config.entity && /^camera\./.test(String(config.entity))) {
      cameras = [
        normalizeCameraConfig(String(config.entity), {
          fallbackName: config.title || null
        })
      ];
    } else if (Array.isArray(config.entities) && config.entities.length) {
      cameras = config.entities.map((e) => typeof e === "string" ? e : e?.entity).filter((e) => typeof e === "string" && /^camera\./.test(e)).map((e) => normalizeCameraConfig(e));
    } else if (prevConfig?.cameras?.length) {
      cameras = prevConfig.cameras.map((camera) => normalizeCameraConfig(camera)).filter((c) => c.entity);
    } else {
      cameras = [];
    }
    if (!cameras.length) {
      cameras = [
        {
          entity: "camera.front_door",
          name: "Front Door",
          alerts_content: "alerts_only"
        }
      ];
    }
    if (cameras.length > MAX_CAMERAS) cameras = cameras.slice(0, MAX_CAMERAS);
    const legacyWindowHours = parseInt(config.window_hours, 10);
    const nextConfig = {
      cameras,
      title: config.title || null,
      subtitle: config.subtitle || null,
      window_days: normalizePositiveInteger(config.window_days, null) || (Number.isFinite(legacyWindowHours) && legacyWindowHours > 0 ? Math.max(1, Math.ceil(legacyWindowHours / 24)) : 3),
      alerts_reviews_days: normalizePositiveInteger(
        config.alerts_reviews_days,
        normalizePositiveInteger(config.window_days, 3)
      ),
      refresh_seconds: Math.max(15, config.refresh_seconds || 45),
      realtime_poll_seconds: REALTIME_POLL_OPTIONS_SECONDS.includes(
        Number(config.realtime_poll_seconds)
      ) ? Number(config.realtime_poll_seconds) : 5,
      mobile_poll_battery_saver: config.mobile_poll_battery_saver === true,
      slideshow_rotation_enabled: config.slideshow_rotation_enabled === true,
      slideshow_rotation_seconds: SLIDESHOW_ROTATION_OPTIONS_SECONDS.includes(
        Number(config.slideshow_rotation_seconds)
      ) ? Number(config.slideshow_rotation_seconds) : 30,
      grid_mode_enabled: config.grid_mode_enabled === true,
      grid_start_in_grid_enabled: config.grid_start_in_grid_enabled === true,
      grid_live_view_enabled: config.grid_live_view_enabled !== false,
      preview_page_enabled: config.preview_page_enabled === true,
      preview_page_live_cameras: config.preview_page_live_cameras === true,
      preview_page_show_title_bars: config.preview_page_show_title_bars !== false,
      wide_view_page_enabled: config.wide_view_page_enabled === true || config.wide_view === true,
      landing_page: normalizePageRoute(config.landing_page),
      mobile_page: normalizePageRoute(config.mobile_page),
      grid_rotation_seconds: GRID_ROTATION_OPTIONS_SECONDS.includes(
        Number(config.grid_rotation_seconds)
      ) ? Number(config.grid_rotation_seconds) : 30,
      browse_expanded: config.browse_expanded === true,
      hidden_tabs: Array.isArray(config.hidden_tabs) ? config.hidden_tabs.map((id) => id === "reviews" ? "alerts" : id).filter((id) => ALLOWED_HIDDEN_TABS.includes(id)) : [],
      theme: config.theme === "custom" ? "custom" : "default",
      theme_custom: config.theme_custom && typeof config.theme_custom === "object" ? Object.fromEntries(
        Object.entries(config.theme_custom).filter(([key]) => THEME_CUSTOM_KEYS.has(key)).map(([key, value]) => [key, normalizeHexColor(value)]).filter(([, value]) => !!value)
      ) : {},
      theme_custom_defaults: config.theme_custom_defaults && typeof config.theme_custom_defaults === "object" ? Object.fromEntries(
        Object.entries(config.theme_custom_defaults).filter(([key]) => THEME_CUSTOM_KEYS.has(key)).map(([key, value]) => [key, value === true]).filter(([, value]) => value === true)
      ) : {},
      stream_height: config.stream_height ? Number(config.stream_height) : null,
      stream_height_unit: config.stream_height_unit || "vh",
      compact_preview: config.compact_preview === true,
      tight_margins: config.tight_margins === true,
      shadows: config.shadows !== false,
      borders: config.borders !== false,
      rounded_corners: config.rounded_corners !== false,
      outer_shadows: config.outer_shadows !== false,
      col_left_width_pct: Number(config.col_left_width_pct) || 50
    };
    const previewEnabledChanged = !!prevConfig && prevConfig.preview_page_enabled !== nextConfig.preview_page_enabled;
    const wideViewPageEnabledChanged = !!prevConfig && prevConfig.wide_view_page_enabled !== nextConfig.wide_view_page_enabled;
    const previewVisualChanged = !!prevConfig && (prevConfig.preview_page_live_cameras !== nextConfig.preview_page_live_cameras || prevConfig.preview_page_show_title_bars !== nextConfig.preview_page_show_title_bars);
    const previewModeConfigChanged = previewEnabledChanged || previewVisualChanged;
    this._committedConfig = this._cloneCardConfig(nextConfig);
    this._config = nextConfig;
    this._navigationFactory = null;
    if (!this._isSlideshowRotationAvailable()) {
      this._stopSlideshowRotation("config-change");
    }
    if (!this._isGridModeAvailable()) {
      this._stopGridModeState();
      if (this._viewMode === "grid") this._viewMode = "single";
    }
    this._syncVisualStyleToggles();
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
    const camerasChanged = prevCams.length !== nextCams.length || prevCams.some((c, i) => c?.entity !== nextCams[i]?.entity);
    const hiddenTabsChanged = JSON.stringify(prevConfig.hidden_tabs || []) !== JSON.stringify(nextConfig.hidden_tabs || []);
    const needsShellRerender = hiddenTabsChanged || previewEnabledChanged || wideViewPageEnabledChanged;
    const needsEngineRemount = camerasChanged;
    const realtimePollChanged = prevConfig.realtime_poll_seconds !== nextConfig.realtime_poll_seconds || prevConfig.mobile_poll_battery_saver !== nextConfig.mobile_poll_battery_saver;
    const activePageInvalid = !this._isPageRouteAvailable(this._pageId);
    if (needsEngineRemount) {
      this._cleanupEngine();
      this._activeCamIdx = Math.min(
        this._activeCamIdx,
        Math.max(0, nextCams.length - 1)
      );
    }
    if (needsShellRerender) {
      this._cleanupEngine();
      this._renderShell();
      if (activePageInvalid) {
        this._navigateToConfiguredLandingPage({
          source: "config-page-fallback"
        });
      } else if (this._isPreviewPageActive()) {
        this._startPreviewMode();
      } else {
        this._mountEngine(null, { quiet: true });
        this._renderAll();
      }
      return;
    }
    if (this._isPreviewPageActive()) {
      this._applyCardStyle();
      this._applyLayoutMode();
      this._renderPreviewPage();
      if (previewModeConfigChanged || realtimePollChanged) {
        this._clearPreviewTimers();
        this._schedulePreviewAlertWatch(300);
      }
      return;
    }
    this._applyCardStyle();
    this._applyLayoutMode();
    if (this._isWideViewPageActive()) this._syncColHeight();
    this._syncStatus();
    this._renderSubtitle();
    this._renderStats();
    this._renderCamSwitcher();
    this._syncToolbarButtons();
    this._syncPageNavigationButtons();
    if (needsEngineRemount) {
      this._mountEngine(null, { quiet: true });
    }
    if (realtimePollChanged) {
      this._restartRealtimeHeadPollTimer();
    }
  }
  set hass(hass) {
    this._hass = hass;
    if (!this._config) return;
    const cameraStateSignature = hassEntityStateSignature(
      hass,
      configuredCameraEntities(this._config)
    );
    const themeSignature = hassThemeSignature(hass);
    const cameraStateChanged = cameraStateSignature !== this._lastHassCameraStateSignature;
    const themeChanged = themeSignature !== this._lastHassThemeSignature;
    this._lastHassCameraStateSignature = cameraStateSignature;
    this._lastHassThemeSignature = themeSignature;
    if (!this._started) {
      this._started = true;
      this._start();
      return;
    }
    const inEditorPreview = this._isEditorPreviewContext();
    if (this._lastEditorPreviewContext === true && !inEditorPreview) {
      this._scheduleResumeLive("hass-edit-exit");
    }
    this._lastEditorPreviewContext = inEditorPreview;
    if (!cameraStateChanged && !themeChanged) return;
    if (this._isPreviewPageActive()) {
      if (cameraStateChanged) this._renderPreviewPage();
      if (themeChanged) this._applyCardStyle();
      return;
    }
    if (cameraStateChanged) {
      this._syncStatus();
      this._kickLiveIfStale();
    }
    if (themeChanged) {
      this._applyCardStyle();
    }
  }
  get _activeCam() {
    return this._config?.cameras[this._activeCamIdx] || this._config?.cameras[0];
  }
  getCardSize() {
    if (this._isPreviewContext() || this._config?.compact_preview === true) {
      return 3;
    }
    return 6;
  }
  getGridOptions() {
    return {
      columns: 3,
      rows: 6,
      min_rows: 4,
      min_columns: 3
    };
  }
  disconnectedCallback() {
    if (this._disconnectTeardownT) clearTimeout(this._disconnectTeardownT);
    this._disconnectTeardownT = setTimeout(() => {
      this._disconnectTeardownT = null;
      if (this.isConnected) return;
      this._ffDebug("Running deferred disconnect teardown");
      this._teardownDisconnected();
    }, 2500);
  }
  _teardownDisconnected() {
    this._stopSlideshowRotation("disconnect", false);
    this._stopGridModeState();
    this._stopPreviewMode();
    if (this._rt) clearTimeout(this._rt);
    this._rt = null;
    if (this._refresh) clearInterval(this._refresh);
    if (this._unsub) {
      const unsubscribePromise = this._unsub;
      void (async () => {
        try {
          const unsubscribe = await unsubscribePromise;
          if (typeof unsubscribe === "function") unsubscribe();
        } catch (_) {
        }
      })();
      this._unsub = null;
    }
    if (this._ro) this._ro.disconnect();
    this._ro = null;
    if (this._io) this._io.disconnect();
    this._io = null;
    if (this._realtimeHeadPollT) clearInterval(this._realtimeHeadPollT);
    this._realtimeHeadPollT = null;
    if (this._warmOtherCamsDelayT) clearTimeout(this._warmOtherCamsDelayT);
    this._warmOtherCamsDelayT = null;
    if (this._resumeLiveT) clearTimeout(this._resumeLiveT);
    if (this._editModeWatchdogT) clearInterval(this._editModeWatchdogT);
    this._editModeWatchdogT = null;
    if (this._editorDialogObserver) this._editorDialogObserver.disconnect();
    this._editorDialogObserver = null;
    if (this._popupControlsHideTimer)
      clearTimeout(this._popupControlsHideTimer);
    if (this._liveControlsHideTimer) clearTimeout(this._liveControlsHideTimer);
    if (this._popupMediaStopTimer) clearTimeout(this._popupMediaStopTimer);
    if (this._liveOverlayControlsCleanup) {
      try {
        this._liveOverlayControlsCleanup();
      } catch (_) {
      }
      this._liveOverlayControlsCleanup = null;
    }
    if (this._recordingsSwipeCleanup) {
      this._recordingsSwipeCleanup();
      this._recordingsSwipeCleanup = null;
    }
    this._clearPopupMediaCleanup();
    if (this._onDocVisibility) {
      document.removeEventListener("visibilitychange", this._onDocVisibility);
    }
    if (this._onShadowError) {
      this.shadowRoot.removeEventListener("error", this._onShadowError, true);
    }
    if (this._popupHandlers) {
      const h = this._popupHandlers;
      h.popup.removeEventListener("mousedown", h.onMouseDown);
      h.popup.removeEventListener("touchstart", h.onTouchStart);
      document.removeEventListener("mousemove", h.onMouseMove);
      document.removeEventListener("touchmove", h.onTouchMove);
      document.removeEventListener("mouseup", h.onMouseUp);
      document.removeEventListener("touchend", h.onTouchEnd);
      this._popupHandlers = null;
    }
    if (this._onFullscreenChange) {
      document.removeEventListener(
        "fullscreenchange",
        this._onFullscreenChange
      );
      document.removeEventListener(
        "webkitfullscreenchange",
        this._onFullscreenChange
      );
    }
    if (this._onViewportRotate) {
      window.removeEventListener("resize", this._onViewportRotate);
      window.removeEventListener("orientationchange", this._onViewportRotate);
      window.visualViewport?.removeEventListener(
        "resize",
        this._onViewportRotate
      );
      window.visualViewport?.removeEventListener(
        "scroll",
        this._onViewportRotate
      );
    }
    if (this._onEditorPreviewDraft) {
      window.removeEventListener(
        "frigate-view-card-preview-draft",
        this._onEditorPreviewDraft
      );
    }
    if (this._rotateOverlayRaf) cancelAnimationFrame(this._rotateOverlayRaf);
    this._rotateOverlayRaf = 0;
    if (this._rotateOverlayExitT) clearTimeout(this._rotateOverlayExitT);
    this._rotateOverlayExitT = null;
    this._clearRotateOverlayAudioSync();
    this._clearRotateVideoFullscreenStyle();
    for (const entity of [...this._mseGracePool.keys()]) {
      this._evictGraceMseEntry(entity);
    }
    if (this._parentOrigStyle && this.parentElement) {
      this.parentElement.style.height = this._parentOrigStyle.height;
      this.parentElement.style.margin = this._parentOrigStyle.margin;
      this.parentElement.style.padding = this._parentOrigStyle.padding;
    }
    this._setSectionsRowGap(false);
    this._cleanupEngine();
  }
  // ── init ─────────────────────────────────────────────────
  async _start() {
    await this._discoverAll();
    this._initDeepLinkFromUrl();
    this._applyDeepLinkCameraHint();
    const now = Math.floor(Date.now() / 1e3);
    this._followNowWindow = true;
    this._winEnd = now;
    this._winStart = now - this._config.window_days * DAY;
    const initialLoad = this._loadWindow(true);
    this._scheduleWarmOtherCamerasEvents();
    const startInGrid = this._shouldStartInGridMode();
    const startupPageId = this._ensureNavigationFactory().resolveStartupPage({
      hasPendingDeepLinkTarget: this._hasPendingDeepLinkTarget()
    });
    this._navigateToPageRoute(startupPageId, {
      source: "startup",
      startup: true,
      startInGrid
    });
    await initialLoad;
    void this._prefetchCalendarActivityForActiveCamera();
    this._subscribe();
    this._startEditModeWatchdog();
    this._startEditorDialogCloseObserver();
    this._consumeDeepLinkReviewOpen();
    this._consumeDeepLinkEventOpen();
    this._refresh = setInterval(() => {
      if (this._isNowWindow()) this._loadWindow(true);
    }, this._config.refresh_seconds * 1e3);
    this._restartRealtimeHeadPollTimer();
    this._setupResizeObserver();
  }
  _mergedUrlSearchParams() {
    const params = new URLSearchParams(window.location?.search || "");
    const hash = String(window.location?.hash || "");
    const queryIndex = hash.indexOf("?");
    if (queryIndex >= 0) {
      const hashParams = new URLSearchParams(hash.slice(queryIndex + 1));
      for (const [key, value] of hashParams.entries()) {
        if (value != null && value !== "") params.set(key, value);
      }
    }
    return params;
  }
  _clearDeepLinkParamsFromUrl() {
    const deepLinkKeys = new Set([
      "event",
      "event_id",
      "frigate_event",
      "frigate_event_id",
      "review",
      "review_id",
      "frigate_review",
      "frigate_review_id",
      "media",
      "view",
      "open",
      "camera",
      "cam",
      "camera_entity"
    ]);
    try {
      const url = new URL(window.location.href);
      for (const key of [...url.searchParams.keys()]) {
        if (deepLinkKeys.has(key)) url.searchParams.delete(key);
      }
      const rawHash = String(url.hash || "");
      const queryIndex = rawHash.indexOf("?");
      if (queryIndex >= 0) {
        const hashPath = rawHash.slice(0, queryIndex);
        const hashQuery = new URLSearchParams(rawHash.slice(queryIndex + 1));
        for (const key of [...hashQuery.keys()]) {
          if (deepLinkKeys.has(key)) hashQuery.delete(key);
        }
        const nextHashQuery = hashQuery.toString();
        url.hash = nextHashQuery ? `${hashPath}?${nextHashQuery}` : hashPath;
      }
      const nextUrl = `${url.pathname}${url.search}${url.hash}`;
      window.history.replaceState(window.history.state, "", nextUrl);
    } catch (_) {
    }
  }
  _initDeepLinkFromUrl() {
    const params = this._mergedUrlSearchParams();
    const eventId = params.get("event") || params.get("event_id") || params.get("frigate_event") || params.get("frigate_event_id") || "";
    const reviewId = params.get("review") || params.get("review_id") || params.get("frigate_review") || params.get("frigate_review_id") || "";
    const cameraHint = params.get("camera") || params.get("cam") || params.get("camera_entity") || "";
    const mediaHint = params.get("media") || params.get("view") || params.get("open") || "";
    this._deepLinkEventId = String(eventId || "").trim();
    this._deepLinkReviewId = String(reviewId || "").trim();
    this._deepLinkMediaHint = String(mediaHint || "").trim().toLowerCase();
    this._deepLinkCameraHint = String(cameraHint || "").trim().toLowerCase();
    this._deepLinkApplied = false;
    this._deepLinkEventLookupTried = false;
    this._deepLinkReviewLookupTried = false;
  }
  _applyDeepLinkCameraHint() {
    if (!this._deepLinkCameraHint) return;
    const idx = this._config.cameras.findIndex((camera) => {
      const entity = String(camera.entity || "").toLowerCase();
      const name = String(camera.name || "").toLowerCase();
      const cacheCam = String(
        this._camCache[camera.entity]?.cam || ""
      ).toLowerCase();
      return entity === this._deepLinkCameraHint || name === this._deepLinkCameraHint || cacheCam === this._deepLinkCameraHint;
    });
    if (idx >= 0) this._activeCamIdx = idx;
  }
  _consumeDeepLinkEventOpen() {
    if (!this._deepLinkEventId || this._deepLinkApplied) return;
    const event = this._findEventById(this._deepLinkEventId);
    if (!event) {
      this._deepLinkEventLookupTried = true;
      this._consumeDeepLinkReviewOpen();
      return;
    }
    this._deepLinkEventLookupTried = true;
    const eventCam = String(event.camera || "").toLowerCase();
    if (eventCam) {
      const idx = this._config.cameras.findIndex((camera) => {
        const cacheCam = String(
          this._camCache[camera.entity]?.cam || ""
        ).toLowerCase();
        return cacheCam === eventCam;
      });
      if (idx >= 0 && idx !== this._activeCamIdx) {
        this._switchCamera(idx);
        return;
      }
    }
    this._deepLinkApplied = true;
    if (this._deepLinkMediaHint === "snapshot") {
      this._showSnapshot(event);
      this._clearDeepLinkParamsFromUrl();
      return;
    }
    if (this._deepLinkMediaHint === "clip" && event.has_clip) {
      this._showClip(event, { mediaType: "clip" });
      this._clearDeepLinkParamsFromUrl();
      return;
    }
    this._open(this._deepLinkEventId);
    this._clearDeepLinkParamsFromUrl();
  }
  _consumeDeepLinkReviewOpen() {
    if (this._deepLinkApplied) return;
    if (this._deepLinkEventId && !this._deepLinkEventLookupTried) return;
    if (!this._deepLinkReviewId) return;
    const review = (this._reviews || []).find(
      (item) => String(item?.id || "") === this._deepLinkReviewId
    );
    const reviewEventId = String(review?.data?.detections?.[0] || "");
    if (reviewEventId) {
      this._deepLinkEventId = reviewEventId;
      this._deepLinkEventLookupTried = false;
      this._consumeDeepLinkEventOpen();
      return;
    }
    if (this._deepLinkReviewLookupTried) return;
    this._deepLinkReviewLookupTried = true;
    void this._loadReviews().catch(() => {
    }).finally(() => {
      this._consumeDeepLinkReviewOpen();
      this._consumeDeepLinkEventOpen();
    });
  }
  _isLikelyMobileClient() {
    return DEVICE_PROFILE.isMobile;
  }
  _effectiveRealtimePollSeconds() {
    if (this._config?.mobile_poll_battery_saver === true && this._isLikelyMobileClient()) {
      return MOBILE_BATTERY_SAVER_POLL_SECONDS;
    }
    const configured = Number(this._config?.realtime_poll_seconds);
    return REALTIME_POLL_OPTIONS_SECONDS.includes(configured) ? configured : REALTIME_HEAD_POLL_MS / 1e3;
  }
  _restartRealtimeHeadPollTimer() {
    if (this._realtimeHeadPollT) clearInterval(this._realtimeHeadPollT);
    this._realtimeHeadPollT = setInterval(
      () => this._pollLatestEventHead(),
      this._effectiveRealtimePollSeconds() * 1e3
    );
  }
  _startEditModeWatchdog() {
    if (this._editModeWatchdogT) clearInterval(this._editModeWatchdogT);
    this._lastEditorPreviewContext = this._isEditorPreviewContext();
    this._editorDialogOpenLast = this._isCardEditorDialogOpen();
    this._dashboardEditLast = this._isDashboardEditMode();
    this._editModeWatchdogT = setInterval(() => {
      if (!this.isConnected) return;
      const inEditorPreview = this._isEditorPreviewContext();
      const dialogOpen = this._isCardEditorDialogOpen();
      const dashboardEdit = this._isDashboardEditMode();
      if (this._editorDialogOpenLast && !dialogOpen) {
        this._ffDebug("Watchdog detected card editor close", {
          prevOpen: this._editorDialogOpenLast,
          nowOpen: dialogOpen
        });
        this._scheduleResumeLive("watchdog-dialog-close");
      }
      if (this._lastEditorPreviewContext === true && !inEditorPreview) {
        this._ffDebug("Watchdog detected editor preview exit", {
          prevPreview: this._lastEditorPreviewContext,
          nowPreview: inEditorPreview
        });
        this._scheduleResumeLive("watchdog-edit-exit");
      }
      if (this._dashboardEditLast !== dashboardEdit) {
        this._ffDebug("Watchdog detected dashboard edit toggle", {
          prevDashboardEdit: this._dashboardEditLast,
          nowDashboardEdit: dashboardEdit
        });
        this._scheduleResumeLive(
          dashboardEdit ? "watchdog-dashboard-edit-on" : "watchdog-dashboard-edit-off"
        );
      }
      if (dashboardEdit) {
        this._kickLiveIfStale(true);
      }
      this._editorDialogOpenLast = dialogOpen;
      this._dashboardEditLast = dashboardEdit;
      this._lastEditorPreviewContext = inEditorPreview;
    }, 600);
  }
  _isDashboardEditMode() {
    try {
      const href = String(window.location?.href || "");
      if (!href) return false;
      const url = new URL(href, window.location.origin);
      const edit = url.searchParams.get("edit") || url.searchParams.get("dashboard_edit") || "";
      return /^(1|true|yes|on)$/i.test(String(edit));
    } catch (_) {
      return false;
    }
  }
  _isCardEditorDialogOpen() {
    const dialogHost = document.querySelector("hui-dialog-edit-card");
    if (!dialogHost) return false;
    const root = dialogHost.shadowRoot;
    const haDialog = root?.querySelector?.("ha-dialog") || dialogHost.querySelector?.("ha-dialog") || null;
    if (haDialog) {
      if (haDialog.opened === true) return true;
      if (haDialog.hasAttribute?.("open")) return true;
      if (haDialog.hasAttribute?.("opened")) return true;
      if (haDialog.getAttribute?.("aria-hidden") === "false") return true;
      if (haDialog.getAttribute?.("aria-hidden") === "true") return false;
      if (haDialog.hidden === true) return false;
      const dStyle = window.getComputedStyle?.(haDialog);
      if (dStyle?.display === "none" || dStyle?.visibility === "hidden")
        return false;
      return true;
    }
    const hostStyle = window.getComputedStyle?.(dialogHost);
    if (hostStyle?.display === "none" || hostStyle?.visibility === "hidden")
      return false;
    if (dialogHost.hidden === true) return false;
    if (dialogHost.getAttribute?.("aria-hidden") === "true") return false;
    return true;
  }
  _startEditorDialogCloseObserver() {
    if (this._editorDialogObserver) this._editorDialogObserver.disconnect();
    this._editorDialogObserver = null;
    this._editorDialogOpenLast = this._isCardEditorDialogOpen();
    if (!("MutationObserver" in window) || !document.body) return;
    this._editorDialogObserver = new MutationObserver(() => {
      const openNow = this._isCardEditorDialogOpen();
      if (this._editorDialogOpenLast && !openNow) {
        this._scheduleResumeLive("card-editor-close");
      }
      this._editorDialogOpenLast = openNow;
    });
    this._editorDialogObserver.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["open", "opened", "hidden", "class", "style"]
    });
  }
  // Discover all cameras in parallel for faster startup
  async _discoverAll() {
    await Promise.all(
      this._config.cameras.map((c) => this._discoverOne(c.entity))
    );
  }
  async _discoverOne(entity) {
    const cache = this._camCache[entity] || mkCamState();
    if (cache.discovered) return;
    const ent = this._hass?.states?.[entity];
    if (!ent) return;
    cache.clientId = ent.attributes?.client_id || ent.attributes?.mqtt_client_id || "frigate";
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
  _supportsNativeHlsPlayback() {
    const video = document.createElement("video");
    return !!(video.canPlayType?.("application/vnd.apple.mpegurl") || video.canPlayType?.("application/x-mpegURL"));
  }
  _useHaDirectStreamPath() {
    return this._cameraConnectionType(this._activeCam?.entity) === "ha_direct";
  }
  _cameraConnectionType(entity) {
    if (!entity) return DEFAULT_CAMERA_CONNECTION_TYPE;
    const cam = this._config?.cameras?.find((c) => c?.entity === entity);
    return normalizeCameraConnectionType(cam?.connection_type);
  }
  _cameraDisableHlsDesktop(entity) {
    if (!entity) return false;
    const cam = this._config?.cameras?.find((c) => c?.entity === entity);
    return normalizeDisableHlsDesktop(cam?.disable_hls_desktop);
  }
  _isEditorPreviewContext() {
    let el = this;
    let depth = 0;
    while (el && depth < 48) {
      const tag = String(el.tagName || "").toUpperCase();
      if (tag === "HUI-CARD-PREVIEW" || tag === "HUI-DIALOG-EDIT-CARD") {
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
  _isCardPickerPreviewContext() {
    let el = this;
    let depth = 0;
    while (el && depth < 64) {
      const tag = String(el.tagName || "").toUpperCase();
      if (tag === "HUI-CARD-PICKER" || tag === "HUI-DIALOG-CREATE-CARD" || tag === "HUI-CARD-OPTIONS") {
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
  _isPreviewContext() {
    return this._isEditorPreviewContext() || this._isCardPickerPreviewContext();
  }
  _ffDebug(_msg, _data = null) {
  }
  _preferredStreamType() {
    return "webrtc";
  }
  _currentLiveStreamHint() {
    const active = String(this._activeStreamType || "").trim().toLowerCase();
    if (active === "webrtc" || active === "mse" || active === "hls") {
      return active;
    }
    const lastHint = String(this._lastLiveStreamHint || "").trim().toLowerCase();
    if (lastHint === "webrtc" || lastHint === "mse" || lastHint === "hls") {
      return lastHint;
    }
    return this._preferredStreamType();
  }
  _hlsStateObj(entity, streamType = null) {
    const raw = this._hass?.states?.[entity];
    if (!raw) return null;
    const attrs = { ...raw.attributes };
    attrs.frontend_stream_type = streamType || this._preferredStreamType();
    return { ...raw, attributes: attrs };
  }
  async _tryMountHaDirect(slot, startup = null, options = {}) {
    const waitMs = Math.max(500, Number(startup?.waitMs ?? 8e3));
    const minCurrentTime = Number(startup?.minCurrentTime ?? 0.05);
    const minDecodedFrames = Number(startup?.minDecodedFrames ?? 1);
    const requireReadyState = Number(startup?.requireReadyState ?? 0);
    const strict = startup?.strict ?? false;
    const commit = options.commit !== false;
    const entity = this._activeCam?.entity;
    if (!entity) return false;
    const stateObj = this._hlsStateObj(
      entity,
      startup?.streamType || this._preferredStreamType()
    );
    if (!stateObj) return false;
    const s = document.createElement("ha-camera-stream");
    s.hass = this._hass;
    s.stateObj = stateObj;
    s.controls = false;
    s.muted = this._streamMuted;
    s.style.cssText = "width:100%;height:100%;display:block";
    slot.innerHTML = "";
    slot.appendChild(s);
    this._attachVideoFit(s);
    const destroy = () => {
      try {
        s.remove();
      } catch (_) {
      }
    };
    const started = await this._waitForStreamStart(s, waitMs, {
      minCurrentTime,
      minDecodedFrames,
      requireReadyState,
      strict
    });
    if (!started) {
      destroy();
      return false;
    }
    const engine = s;
    if (!commit) return { ok: true, type: "ha", engine, slot };
    this._engine = engine;
    this._setActiveStreamType("ha");
    this._setStreamLoading(false);
    this._setStreamFallbackVisible(false);
    return true;
  }
  _cleanupEngine() {
    return this._cleanupEngineWithOptions();
  }
  _evictGraceMseEntry(entity) {
    const key = String(entity || "").trim();
    if (!key) return;
    const entry = this._mseGracePool.get(key);
    if (!entry) return;
    entry.cancelled = true;
    if (entry.timer) clearTimeout(entry.timer);
    this._mseGracePool.delete(key);
    try {
      entry.engine?.destroy?.();
    } catch (_) {
    }
  }
  _trimGraceMsePool() {
    while (this._mseGracePool.size > MSE_SWITCH_GRACE_MAX) {
      const oldestKey = this._mseGracePool.keys().next().value;
      if (!oldestKey) break;
      this._evictGraceMseEntry(oldestKey);
    }
  }
  _stashMseEngineForGrace(entity, engine) {
    const key = String(entity || "").trim();
    if (!key || !engine?.video || !engine?.ws) return false;
    this._evictGraceMseEntry(key);
    this._ensureMseGraceHost().appendChild(engine.video);
    engine.video.muted = true;
    engine.video.controls = false;
    engine.video.style.cssText = "width:1px;height:1px;display:block;opacity:0;pointer-events:none;position:absolute;left:-9999px;top:-9999px;background:var(--c-bg-deep)";
    void engine.video.play?.().catch?.(() => {
    });
    const entry = {
      engine,
      cancelled: false,
      timer: setTimeout(() => {
        if (this._mseGracePool.get(key) !== entry) return;
        this._evictGraceMseEntry(key);
      }, MSE_SWITCH_GRACE_MS)
    };
    this._mseGracePool.set(key, entry);
    this._trimGraceMsePool();
    return true;
  }
  _stashPendingMsePromiseForGrace(entity, promise) {
    const key = String(entity || "").trim();
    if (!key || !promise) return false;
    this._evictGraceMseEntry(key);
    const entry = {
      engine: null,
      cancelled: false,
      timer: null,
      promise: null
    };
    entry.timer = setTimeout(() => {
      if (this._mseGracePool.get(key) !== entry) return;
      this._evictGraceMseEntry(key);
    }, MSE_SWITCH_GRACE_MS);
    entry.promise = (async () => {
      try {
        const result = await promise;
        if (entry.cancelled) {
          try {
            result?.engine?.destroy?.();
          } catch (_) {
          }
          return null;
        }
        if (!result?.ok || result.type !== "mse" || !result.engine) {
          this._evictGraceMseEntry(key);
          return null;
        }
        this._ensureMseGraceHost().appendChild(result.engine.video);
        result.engine.video.muted = true;
        result.engine.video.controls = false;
        result.engine.video.style.cssText = "width:1px;height:1px;display:block;opacity:0;pointer-events:none;position:absolute;left:-9999px;top:-9999px;background:var(--c-bg-deep)";
        void result.engine.video.play?.().catch?.(() => {
        });
        entry.engine = result.engine;
        entry.promise = null;
        return result.engine;
      } catch (_) {
        if (this._mseGracePool.get(key) === entry) {
          this._evictGraceMseEntry(key);
        }
        return null;
      }
    })();
    this._mseGracePool.set(key, entry);
    this._trimGraceMsePool();
    return true;
  }
  _takeGraceMseEntry(entity) {
    const key = String(entity || "").trim();
    if (!key) return null;
    const entry = this._mseGracePool.get(key);
    if (!entry) return null;
    if (entry.timer) clearTimeout(entry.timer);
    this._mseGracePool.delete(key);
    return entry;
  }
  _ensureMseGraceHost() {
    if (this._mseGraceHost?.isConnected) return this._mseGraceHost;
    const host = document.createElement("div");
    host.setAttribute("aria-hidden", "true");
    host.style.cssText = "position:absolute;width:1px;height:1px;overflow:hidden;opacity:0;pointer-events:none;left:-9999px;top:-9999px";
    this.shadowRoot.appendChild(host);
    this._mseGraceHost = host;
    return host;
  }
  _adoptGraceMseEngine(slot, engine) {
    if (!slot || !engine?.video || !engine?.ws) return false;
    if (engine.ws.readyState > WebSocket.OPEN) {
      try {
        engine.destroy?.();
      } catch (_) {
      }
      return false;
    }
    engine.video.muted = this._streamMuted;
    engine.video.controls = false;
    engine.video.style.cssText = "width:100%;height:100%;display:block;background:var(--c-bg-deep)";
    slot.innerHTML = "";
    slot.appendChild(engine.video);
    this._attachVideoFit(engine.video);
    this._engine = engine;
    this._engineMountedMuted = this._streamMuted;
    this._setActiveStreamType("mse");
    this._setStreamLoading(false);
    this._setStreamFallbackVisible(false);
    if (this._rotateOverlayActive) this._setLiveNativeControls(true);
    void engine.video.play?.().catch?.(() => {
    });
    return true;
  }
  _cleanupEngineWithOptions(options = {}) {
    if (this._pendingWebRTCTakeoverTimer) {
      clearTimeout(this._pendingWebRTCTakeoverTimer);
      this._pendingWebRTCTakeoverTimer = null;
    }
    this._clearRotateOverlayAudioSync();
    this._clearRotateVideoFullscreenStyle();
    const pending = this._pendingMountDestroyers || [];
    this._pendingMountDestroyers = [];
    const preserveMseEntity = String(options?.preserveMseEntity || "").trim();
    for (const pendingAttempt of pending) {
      if (preserveMseEntity && pendingAttempt?.type === "mse" && pendingAttempt?.entity === preserveMseEntity) {
        this._stashPendingMsePromiseForGrace(
          preserveMseEntity,
          pendingAttempt.promise
        );
        continue;
      }
      try {
        pendingAttempt?.destroy?.();
      } catch (_) {
      }
    }
    const eng = this._engine;
    if (!eng) return;
    if (preserveMseEntity && String(this._activeStreamType || "").trim().toLowerCase() === "mse" && this._stashMseEngineForGrace(preserveMseEntity, eng)) {
      this._engine = null;
      return;
    }
    try {
      if (typeof eng.destroy === "function") eng.destroy();
      if (eng.ws && typeof eng.ws.close === "function") eng.ws.close();
      if (eng.pc && typeof eng.pc.close === "function") eng.pc.close();
    } catch (_) {
    }
    this._engine = null;
  }
  _cancelPendingMount(reason = "", options = {}) {
    if (this._mountInProgress) {
      this._mountSeq += 1;
      this._mountInProgress = false;
      this._mountStartedAt = 0;
      this._mountTargetEntity = "";
    }
    this._cleanupEngineWithOptions(options);
  }
  _streamAttemptSlot(host = null) {
    const slot = document.createElement("div");
    slot.style.cssText = "position:absolute;inset:0;opacity:0;pointer-events:none;overflow:hidden;";
    if (host) host.appendChild(slot);
    return slot;
  }
  _adoptMountedAttempt(targetSlot, result) {
    if (!targetSlot || !result?.slot || !result?.engine) return;
    for (const child of [...targetSlot.children]) {
      if (child !== result.slot) {
        try {
          child.remove();
        } catch (_) {
        }
      }
    }
    result.slot.style.opacity = "1";
    result.slot.style.pointerEvents = "auto";
    result.slot.style.overflow = "hidden";
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
        void (async () => {
          try {
            const result = await attempt;
            settled += 1;
            if (result?.ok) {
              finish(result);
              return;
            }
            if (settled >= attempts.length) finish(null);
          } catch (_) {
            settled += 1;
            if (settled >= attempts.length) finish(null);
          }
        })();
      }
    });
  }
  _buildLiveStreamAttempts(connectionType, forcedType = null, hostSlot = null) {
    if (connectionType === "ha_direct") return [];
    const disableHlsOnDesktop = DEVICE_PROFILE.isDesktop && this._cameraDisableHlsDesktop(this._activeCam?.entity);
    const hiddenSlot = () => this._streamAttemptSlot(hostSlot);
    const build = {
      webrtc: () => this._tryMountGo2RTCWebRTC(
        hiddenSlot(),
        { waitMs: 7e3 },
        { commit: false }
      ),
      mse: () => this._tryMountGo2RTCMSE(
        hiddenSlot(),
        {
          waitMs: 4e3,
          minCurrentTime: 0.05,
          minDecodedFrames: 1,
          requireReadyState: 2,
          strict: true
        },
        { commit: false }
      ),
      hls: () => this._tryMountGo2RTCHLS(
        hiddenSlot(),
        { waitMs: 5e3 },
        { commit: false }
      )
    };
    const order = forcedType ? [forcedType] : ["webrtc", "mse", "hls"];
    this._ffDebug("Live attempt order", {
      forcedType: forcedType || "",
      order,
      connectionType
    });
    return order.filter((type) => !(type === "hls" && disableHlsOnDesktop)).filter((type) => typeof build[type] === "function").map((type) => ({ type, start: build[type] }));
  }
  async _mountLiveWithRace(slot, attempts, mountToken, targetEntity) {
    const activeAttempts = attempts.map((attempt) => {
      const promise = (async () => {
        try {
          return await attempt.start();
        } catch (_) {
          return false;
        }
      })();
      return { type: attempt.type, promise };
    });
    this._pendingMountDestroyers = activeAttempts.map((attempt) => ({
      type: attempt.type,
      entity: targetEntity,
      promise: attempt.promise,
      destroy: () => {
        void (async () => {
          const result = await attempt.promise;
          if (result?.engine?.destroy) {
            try {
              result.engine.destroy();
            } catch (_) {
            }
          }
        })();
      }
    }));
    const winner = await this._raceMountAttempts(
      activeAttempts.map((attempt) => attempt.promise)
    );
    if (mountToken !== this._mountSeq) {
      if (winner?.engine?.destroy) winner.engine.destroy();
      try {
        winner?.slot?.remove?.();
      } catch (_) {
      }
      return false;
    }
    const destroyLosers = async () => {
      for (const attempt of activeAttempts) {
        const result = await attempt.promise.catch(() => null);
        if (!result?.ok || result.type === winner?.type) continue;
        try {
          result.engine?.destroy?.();
        } catch (_) {
        }
        try {
          result.slot?.remove?.();
        } catch (_) {
        }
      }
      this._pendingMountDestroyers = [];
    };
    if (winner?.ok) {
      this._pendingMountDestroyers = this._pendingMountDestroyers.filter(
        (attempt) => attempt?.type !== winner.type
      );
      this._adoptMountedAttempt(slot, winner);
      await destroyLosers();
      return true;
    }
    await destroyLosers();
    return false;
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
      "opus"
    ];
    return codecs.filter((c) => isSupported(`video/mp4; codecs="${c}"`)).join(",");
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
    const abortSignal = opts.abortSignal || null;
    return new Promise((resolve) => {
      let settled = false;
      let frameCallbackBound = false;
      let eventBound = false;
      let onAbort = null;
      const done = (ok) => {
        if (settled) return;
        settled = true;
        clearInterval(tick);
        clearTimeout(to);
        if (abortSignal && onAbort) {
          try {
            abortSignal.removeEventListener("abort", onAbort);
          } catch (_) {
          }
        }
        resolve(ok);
      };
      if (abortSignal) {
        onAbort = () => done(false);
        if (abortSignal.aborted) {
          done(false);
          return;
        }
        abortSignal.addEventListener("abort", onAbort, { once: true });
      }
      const tick = setInterval(() => {
        const v = streamEl.querySelector("video") || streamEl.shadowRoot?.querySelector("video");
        if (!v) return;
        if (!frameCallbackBound && v.requestVideoFrameCallback) {
          frameCallbackBound = true;
          v.requestVideoFrameCallback(() => done(true));
        }
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
        const decoded = Number(v.webkitDecodedFrameCount) || Number(v.getVideoPlaybackQuality?.().totalVideoFrames) || 0;
        const ready = Number(v.readyState) || 0;
        const timeOk = v.currentTime >= minCurrentTime;
        const decodeOk = decoded >= minDecodedFrames;
        if (ready >= requireReadyState && (timeOk || decodeOk)) done(true);
      }, 180);
      const to = setTimeout(() => done(false), timeoutMs);
    });
  }
  _startFirefoxLiveCatchup(video) {
    if (!video || !this._isFirefox()) return () => {
    };
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
        if (sinceFirstFrame > 0 && sinceFirstFrame < 4e3) {
          if (lag > 3 && !hardSeekUsed) {
            video.currentTime = Math.max(0, end - 0.08);
            video.playbackRate = 1;
            hardSeekUsed = true;
          } else if (lag > 1.5) video.playbackRate = 1.08;
          else if (lag > 0.7) video.playbackRate = 1.04;
          else video.playbackRate = 1;
          return;
        }
        if (lag > 2.8 && !hardSeekUsed && sinceFirstFrame >= 4e3) {
          video.currentTime = Math.max(0, end - 0.2);
          video.playbackRate = 1;
          hardSeekUsed = true;
        } else if (lag > 2) {
          video.playbackRate = 1.05;
        } else if (lag > 1) {
          video.playbackRate = 1.02;
        } else {
          video.playbackRate = 1;
        }
      } catch (_) {
      }
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
    const v = streamEl.tagName?.toLowerCase() === "video" ? streamEl : streamEl.querySelector("video") || streamEl.shadowRoot?.querySelector("video");
    if (v) {
      this._applyVideoFit(v);
      return;
    }
    if (retries <= 0) return;
    setTimeout(() => this._attachVideoFit(streamEl, retries - 1), 160);
  }
  _setStreamLoading(loading, text = "Loading\u2026") {
    const el = this.shadowRoot?.querySelector("#stream-loading");
    if (!el) return;
    el.hidden = !loading;
    const label = el.querySelector(".label");
    if (label) label.textContent = text;
  }
  _setActiveStreamType(type) {
    this._activeStreamType = type || "--";
    const active = String(this._activeStreamType).trim().toLowerCase();
    if (active === "webrtc" || active === "mse" || active === "hls") {
      this._lastLiveStreamHint = active;
    }
    this._renderStats();
  }
  _setStreamFallbackVisible(visible, refreshImage = false) {
    const placeholder = this.shadowRoot?.querySelector("#stream-fallback");
    const status = this.shadowRoot?.querySelector("#stream-fallback-status");
    if (placeholder) {
      placeholder.hidden = !visible;
      if (!visible && status) status.hidden = true;
      if (visible && refreshImage) this._refreshStreamFallbackImage();
    }
  }
  async _streamFallbackUrl(entity) {
    if (!entity) return "";
    if (!this._hass?.callWS) return "";
    const cached = this._fallbackImgUrlCache.get(entity);
    if (cached && cached.url && cached.exp > Date.now()) return cached.url;
    const base = `/api/camera_proxy/${entity}`;
    const signed = await this._signed(base);
    const abs = /^https?:\/\//i.test(signed) || signed.startsWith("data:") ? signed : `${window.location.origin}${signed}`;
    this._fallbackImgUrlCache.set(entity, {
      url: abs,
      exp: Date.now() + 55 * 60 * 1e3
    });
    return abs;
  }
  _streamFallbackAltUrl(entity) {
    if (!entity) return "";
    const state = this._hass?.states?.[entity];
    const pic = state?.attributes?.entity_picture || "";
    if (!pic) return "";
    return /^https?:\/\//i.test(pic) || pic.startsWith("data:") ? pic : `${window.location.origin}${pic}`;
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
  _cameraContext(entity) {
    return this._camCache[entity] || mkCamState();
  }
  async _go2rtcWebSocketUrlForEntity(entity) {
    if (!entity) return null;
    await this._discoverOne(entity);
    const { clientId, cam } = this._cameraContext(entity);
    if (!clientId || !cam) return null;
    const cacheKey = `${clientId}:${cam}`;
    const cached = this._go2rtcWsUrlCache.get(cacheKey);
    if (cached && cached.url && cached.exp > Date.now()) {
      return cached.url;
    }
    let path = `/api/frigate/${encodeURIComponent(clientId)}/mse/api/ws?src=${encodeURIComponent(cam)}`;
    try {
      const r = await this._hass.callWS({
        type: "auth/sign_path",
        path,
        expires: 3600
      });
      if (r?.path) path = r.path;
      this._ffDebug("Signed go2rtc ws path", path);
    } catch (e) {
      this._ffDebug("Failed to sign go2rtc ws path", e?.message || String(e));
    }
    const abs = path.startsWith("http") ? path : `${window.location.origin}${path}`;
    const wsUrl = abs.replace(/^http/i, "ws");
    this._go2rtcWsUrlCache.set(cacheKey, {
      url: wsUrl,
      exp: Date.now() + 55 * 60 * 1e3
    });
    this._ffDebug("go2rtc websocket url", wsUrl);
    return wsUrl;
  }
  async _go2rtcWebSocketUrl() {
    return await this._go2rtcWebSocketUrlForEntity(this._activeCam?.entity);
  }
  async _go2rtcHlsUrl() {
    if (!this._supportsNativeHlsPlayback()) return null;
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
      `/api/frigate/${encodeURIComponent(clientId)}/vod/${encodeURIComponent(cam)}/index.m3u8`
    ];
    const probePromise = (async () => {
      for (const p of candidates) {
        const signed = await this._signed(p);
        const abs = signed.startsWith("http") ? signed : `${window.location.origin}${signed}`;
        try {
          const resp = await fetch(abs, {
            method: "GET",
            cache: "no-store",
            credentials: "same-origin"
          });
          if (!resp.ok) continue;
          const ct = String(
            resp.headers.get("content-type") || ""
          ).toLowerCase();
          if (ct.includes("application/vnd.apple.mpegurl") || ct.includes("application/x-mpegurl") || ct.includes("audio/mpegurl") || abs.toLowerCase().includes(".m3u8")) {
            this._go2rtcHlsUrlCache.set(cacheKey, {
              url: abs,
              exp: Date.now() + 30 * 60 * 1e3
            });
            return abs;
          }
        } catch (_) {
        }
      }
      this._go2rtcHlsUrlCache.set(cacheKey, {
        url: null,
        exp: Date.now() + 2 * 60 * 1e3
      });
      return null;
    })().finally(() => {
      this._go2rtcHlsProbeInFlight.delete(cacheKey);
    });
    this._go2rtcHlsProbeInFlight.set(cacheKey, probePromise);
    return probePromise;
  }
  async _tryMountGo2RTCMSE(slot, startup = null, options = {}) {
    const waitMs = Math.max(500, Number(startup?.waitMs ?? 8e3));
    const minCurrentTime = Number(startup?.minCurrentTime ?? 0.2);
    const minDecodedFrames = Number(startup?.minDecodedFrames ?? 2);
    const requireReadyState = Number(startup?.requireReadyState ?? 3);
    const strict = startup?.strict !== false;
    const commit = options.commit !== false;
    const entity = options?.entity || this._activeCam?.entity || "";
    const muted = options?.muted ?? this._streamMuted;
    if (!("WebSocket" in window) || !("MediaSource" in window)) {
      this._ffDebug("MSE unavailable in browser", {
        hasWebSocket: "WebSocket" in window,
        hasMediaSource: "MediaSource" in window
      });
      return false;
    }
    const wsUrl = await this._go2rtcWebSocketUrlForEntity(entity);
    if (!wsUrl) {
      this._ffDebug("Missing go2rtc websocket URL");
      return false;
    }
    this._ffDebug("Attempting direct go2rtc MSE stream mount");
    const video = document.createElement("video");
    video.autoplay = true;
    video.playsInline = true;
    video.muted = muted;
    video.controls = false;
    video.style.cssText = "width:100%;height:100%;display:block;background:var(--c-bg-deep)";
    const ms = new MediaSource();
    video.src = URL.createObjectURL(ms);
    slot.innerHTML = "";
    slot.appendChild(video);
    this._attachVideoFit(video);
    const ws = new WebSocket(wsUrl);
    ws.binaryType = "arraybuffer";
    const startupAbort = new AbortController();
    let streamStarted = false;
    this._mseConnectAt = Date.now();
    this._mseLastChunkAt = 0;
    this._mseChunkCount = 0;
    let sb = null;
    let mseRequested = false;
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
    const requestMSE = () => {
      if (mseRequested) return;
      if (ws.readyState !== WebSocket.OPEN) return;
      const codecs = this._go2rtcCodecs(MediaSource.isTypeSupported);
      mseRequested = true;
      this._ffDebug("Sending MSE codecs", codecs || "<empty>");
      ws.send(JSON.stringify({ type: "mse", value: codecs }));
    };
    const destroy = () => {
      try {
        if (!startupAbort.signal.aborted) startupAbort.abort();
      } catch (_) {
      }
      try {
        ws.close();
      } catch (_) {
      }
      try {
        stopCatchup();
      } catch (_) {
      }
      try {
        if (video.src) URL.revokeObjectURL(video.src);
      } catch (_) {
      }
    };
    const engine = { video, ws, destroy };
    if (commit) this._engine = engine;
    ms.addEventListener(
      "sourceopen",
      () => {
        this._ffDebug("MediaSource opened", {
          wsReadyState: ws.readyState
        });
        requestMSE();
      },
      { once: true }
    );
    ws.addEventListener("open", () => {
      this._ffDebug("go2rtc websocket opened");
      if (ms.readyState === "open") requestMSE();
    });
    ws.addEventListener("error", () => {
      this._ffDebug("go2rtc websocket error");
      if (!startupAbort.signal.aborted) startupAbort.abort();
    });
    ws.addEventListener("close", (ev) => {
      this._ffDebug("go2rtc websocket closed", {
        code: ev.code,
        reason: ev.reason,
        wasClean: ev.wasClean
      });
      if (!startupAbort.signal.aborted) startupAbort.abort();
      if (streamStarted && commit && this._engine === engine) {
        this._ffDebug("Active MSE stream closed; scheduling recovery", {
          code: ev.code,
          reason: ev.reason
        });
        this._scheduleResumeLive("mse-ws-closed");
      }
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
          if (sb) return;
          try {
            const codecs = this._normalizeGo2RTCCodecs(msg.value);
            if (!codecs) {
              this._ffDebug(
                "Could not parse codecs from go2rtc mse message",
                msg.value
              );
              return;
            }
            const mime = `video/mp4; codecs="${codecs}"`;
            this._ffDebug("Creating SourceBuffer", mime);
            if (!MediaSource.isTypeSupported(mime)) return;
            sb = ms.addSourceBuffer(mime);
            sb.mode = "segments";
            sb.addEventListener("updateend", appendNext);
            appendNext();
          } catch (e) {
            this._ffDebug(
              "SourceBuffer creation failed",
              e?.message || String(e)
            );
          }
        }
        return;
      }
      if (!(ev.data instanceof ArrayBuffer)) return;
      this._mseLastChunkAt = Date.now();
      this._mseChunkCount += 1;
      this._ffDebug("Received binary MSE chunk", ev.data.byteLength);
      queue.push(ev.data);
      appendNext();
    });
    const started = await this._waitForStreamStart(slot, waitMs, {
      minCurrentTime,
      minDecodedFrames,
      requireReadyState,
      strict,
      abortSignal: startupAbort.signal
    });
    if (!started) {
      this._ffDebug("Direct go2rtc MSE did not start within timeout");
      destroy();
      return false;
    }
    streamStarted = true;
    if (!commit) return { ok: true, type: "mse", engine, slot };
    this._setActiveStreamType("mse");
    this._ffDebug("Direct go2rtc MSE started successfully");
    this._setStreamLoading(false);
    this._setStreamFallbackVisible(false);
    return true;
  }
  _mountGridSnapshotCell(cell, { entity, stateObj }) {
    if (!cell || !entity) return false;
    const img = document.createElement("img");
    const entityPicture = stateObj?.attributes?.entity_picture || "";
    img.alt = `${entity} snapshot`;
    img.loading = "lazy";
    img.decoding = "async";
    void (async () => {
      const primaryUrl = await this._streamFallbackUrl(entity);
      if (!img.isConnected) return;
      if (primaryUrl) {
        img.src = primaryUrl;
        return;
      }
      if (entityPicture) {
        img.src = /^https?:\/\//i.test(entityPicture) ? entityPicture : `${window.location.origin}${entityPicture}`;
      }
    })();
    cell.appendChild(img);
    return true;
  }
  _mountGridDirectMSECell(cell, entity, gridState, options = {}) {
    const host = document.createElement("div");
    host.style.cssText = "width:100%;height:100%;display:block";
    cell.appendChild(host);
    void (async () => {
      const result = await this._tryMountGo2RTCMSE(
        host,
        {
          waitMs: 4e3,
          minCurrentTime: 0.05,
          minDecodedFrames: 1,
          requireReadyState: 2,
          strict: true
        },
        {
          commit: false,
          entity,
          muted: true
        }
      );
      if (!result?.ok) {
        if (host.isConnected) {
          host.remove();
          if (!gridState.destroyed && options.fallbackOnFailure) {
            this._mountGridSnapshotCell(cell, {
              entity,
              stateObj: options.stateObj || null
            });
          }
        }
        return;
      }
      if (gridState.destroyed || !host.isConnected) {
        try {
          result.engine?.destroy?.();
        } catch (_) {
        }
        return;
      }
      gridState.cleanup.push(() => {
        try {
          result.engine?.destroy?.();
        } catch (_) {
        }
        try {
          host.innerHTML = "";
        } catch (_) {
        }
      });
    })();
  }
  _mountGridCameraCellMedia(cell, {
    entity,
    stateObj,
    useLive,
    liveStreamHint,
    gridState,
    fallbackOnLiveError = false
  }) {
    if (!cell || !entity) return false;
    if (stateObj && useLive) {
      const connectionType = this._cameraConnectionType(entity);
      if (liveStreamHint === "mse" && connectionType !== "ha_direct") {
        this._mountGridDirectMSECell(cell, entity, gridState, {
          fallbackOnFailure: fallbackOnLiveError,
          stateObj
        });
      } else {
        const stream = document.createElement("ha-camera-stream");
        stream.hass = this._hass;
        stream.stateObj = stateObj;
        stream.controls = false;
        stream.muted = true;
        stream.defaultMuted = true;
        stream.style.cssText = "width:100%;height:100%;display:block;background:var(--c-bg-deep)";
        cell.appendChild(stream);
        this._attachVideoFit(stream);
      }
      return true;
    }
    return this._mountGridSnapshotCell(cell, { entity, stateObj });
  }
  async _tryMountGo2RTCWebRTC(slot, startup = null, options = {}) {
    const waitMs = Math.max(500, Number(startup?.waitMs ?? 7e3));
    const minCurrentTime = Number(
      startup?.minCurrentTime ?? (this._isFirefox() ? 0.15 : 0.05)
    );
    const minDecodedFrames = Number(
      startup?.minDecodedFrames ?? (this._isFirefox() ? 2 : 1)
    );
    const requireReadyState = Number(
      startup?.requireReadyState ?? (this._isFirefox() ? 3 : 0)
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
    video.style.cssText = "width:100%;height:100%;display:block;background:var(--c-bg-deep)";
    slot.innerHTML = "";
    slot.appendChild(video);
    this._attachVideoFit(video);
    const pc = new RTCPeerConnection({
      bundlePolicy: "max-bundle",
      sdpSemantics: "unified-plan",
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
    });
    const ws = new WebSocket(wsUrl);
    const destroy = () => {
      try {
        ws.close();
      } catch (_) {
      }
      try {
        pc.close();
      } catch (_) {
      }
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
      video.play().catch(() => {
      });
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
          sdp: msg.value
        }).catch(() => {
        });
      } else if (msg?.type === "webrtc/candidate") {
        pc.addIceCandidate({ candidate: msg.value, sdpMid: "0" }).catch(
          () => {
          }
        );
      }
    });
    ws.addEventListener("open", async () => {
      try {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        ws.send(JSON.stringify({ type: "webrtc/offer", value: offer.sdp }));
      } catch (_) {
      }
    });
    const started = await this._waitForStreamStart(slot, waitMs, {
      minCurrentTime,
      minDecodedFrames,
      requireReadyState,
      strict
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
    const waitMs = Math.max(500, Number(startup?.waitMs ?? 5e3));
    const commit = options.commit !== false;
    const hlsUrl = await this._go2rtcHlsUrl();
    if (!hlsUrl) return false;
    const video = document.createElement("video");
    video.autoplay = true;
    video.playsInline = true;
    video.muted = this._streamMuted;
    video.controls = false;
    video.style.cssText = "width:100%;height:100%;display:block;background:var(--c-bg-deep)";
    video.src = hlsUrl;
    slot.innerHTML = "";
    slot.appendChild(video);
    this._attachVideoFit(video);
    const destroy = () => {
      try {
        video.pause();
        video.removeAttribute("src");
        video.load();
      } catch (_) {
      }
    };
    const engine = { video, destroy };
    if (commit) this._engine = engine;
    const started = await this._waitForStreamStart(video, waitMs, {
      minCurrentTime: 0.05,
      minDecodedFrames: 1,
      requireReadyState: 2,
      strict: false
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
    if (this._isPreviewPageActive()) {
      this._setStreamLoading(false);
      this._setStreamFallbackVisible(false);
      return;
    }
    if (this._viewMode === "grid" && this._isGridModeAvailable()) {
      this._cancelPendingMount("grid-mode");
      this._mountGridEngine(slot);
      return;
    }
    const entity = this._activeCam?.entity;
    if (!entity) return;
    if (this._mountInProgress && this._mountTargetEntity === entity) return;
    const connectionType = this._cameraConnectionType(entity);
    if (connectionType !== "ha_direct" && (!forcedType || forcedType === "mse")) {
      const graceMseEntry = this._takeGraceMseEntry(entity);
      if (graceMseEntry?.engine) {
        if (this._adoptGraceMseEngine(slot, graceMseEntry.engine)) return;
      } else if (graceMseEntry?.promise) {
        this._engineMountedMuted = this._streamMuted;
        const mountToken2 = ++this._mountSeq;
        this._mountInProgress = true;
        this._mountStartedAt = Date.now();
        this._mountTargetEntity = entity;
        const mountWatchdogT2 = setTimeout(() => {
          if (!this._mountInProgress) return;
          if (this._mountSeq !== mountToken2) return;
          this._ffDebug("Mount watchdog timeout; forcing recovery", {
            mountToken: mountToken2,
            mountTarget: this._mountTargetEntity
          });
          this._mountSeq += 1;
          this._mountInProgress = false;
          this._mountStartedAt = 0;
          this._mountTargetEntity = "";
          this._cleanupEngine();
          this._setStreamLoading(false);
          this._setStreamFallbackVisible(true);
          this._setActiveStreamType("snapshot");
          this._scheduleResumeLive("mount-watchdog-timeout");
        }, 9e3);
        const clearMountState = () => {
          clearTimeout(mountWatchdogT2);
          if (this._mountSeq === mountToken2) {
            this._mountInProgress = false;
            this._mountStartedAt = 0;
            this._mountTargetEntity = "";
          }
        };
        const graceResultPromise = (async () => {
          const graceMseEngine = await graceMseEntry.promise;
          if (!graceMseEngine) return false;
          return {
            ok: true,
            type: "mse",
            engine: graceMseEngine
          };
        })();
        this._pendingMountDestroyers = [
          {
            type: "mse",
            entity,
            promise: graceResultPromise,
            destroy: () => {
              void (async () => {
                const result = await graceResultPromise;
                try {
                  result?.engine?.destroy?.();
                } catch (_) {
                }
              })();
            }
          }
        ];
        slot.innerHTML = "";
        if (!quiet) {
          this._setActiveStreamType("--");
          this._setStreamFallbackVisible(true, true);
          this._setStreamLoading(true);
        } else {
          this._setStreamFallbackVisible(false);
          this._setStreamLoading(false);
        }
        try {
          const graceResult = await graceResultPromise;
          if (!graceResult?.engine) return;
          if (this._mountSeq !== mountToken2) return;
          this._pendingMountDestroyers = [];
          if (this._adoptGraceMseEngine(slot, graceResult.engine)) {
            clearMountState();
            return;
          }
        } finally {
          clearMountState();
          if (this._pendingMountDestroyers?.[0]?.promise === graceResultPromise) {
            this._pendingMountDestroyers = [];
          }
        }
      }
    }
    this._engineMountedMuted = this._streamMuted;
    const mountToken = ++this._mountSeq;
    this._mountInProgress = true;
    this._mountStartedAt = Date.now();
    this._mountTargetEntity = entity;
    const mountWatchdogT = setTimeout(() => {
      if (!this._mountInProgress) return;
      if (this._mountSeq !== mountToken) return;
      this._ffDebug("Mount watchdog timeout; forcing recovery", {
        mountToken,
        mountTarget: this._mountTargetEntity
      });
      this._mountSeq += 1;
      this._mountInProgress = false;
      this._mountStartedAt = 0;
      this._mountTargetEntity = "";
      this._cleanupEngine();
      this._setStreamLoading(false);
      this._setStreamFallbackVisible(true);
      this._setActiveStreamType("snapshot");
      this._scheduleResumeLive("mount-watchdog-timeout");
    }, 9e3);
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
      if (connectionType === "ha_direct") {
        const streamType = forcedType || this._preferredStreamType();
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
        s.style.cssText = "width:100%;height:100%;display:block;background:var(--c-bg-deep)";
        slot.innerHTML = "";
        slot.appendChild(s);
        this._engine = s;
        this._engineMountedMuted = this._streamMuted;
        this._attachVideoFit(s);
        if (this._rotateOverlayActive) this._setLiveNativeControls(true);
        void (async () => {
          const ok = await this._waitForStreamStart(s, 8e3, {
            minCurrentTime: 0.05,
            minDecodedFrames: 1,
            requireReadyState: 0,
            strict: false
          });
          if (ok && this._engine === s) {
            this._setStreamLoading(false);
            this._setStreamFallbackVisible(false);
            if (this._rotateOverlayActive) this._setLiveNativeControls(true);
          }
        })();
        setTimeout(() => {
          if (this._engine === s) {
            this._setStreamLoading(false);
            this._setStreamFallbackVisible(false);
            if (this._rotateOverlayActive) this._setLiveNativeControls(true);
          }
        }, 1200);
        return;
      }
      const attempts = this._buildLiveStreamAttempts(
        connectionType,
        forcedType,
        slot
      );
      if (await this._mountLiveWithRace(slot, attempts, mountToken, entity))
        return;
      this._setActiveStreamType("snapshot");
      this._setStreamLoading(false);
      this._setStreamFallbackVisible(true);
    } finally {
      clearTimeout(mountWatchdogT);
      if (mountToken === this._mountSeq) {
        this._mountInProgress = false;
        this._mountStartedAt = 0;
        this._mountTargetEntity = "";
      }
    }
  }
  _isPreviewPageEnabled() {
    return this._config?.preview_page_enabled === true;
  }
  _isPreviewPageActive() {
    return this._isPreviewPageEnabled() && this._pageId === PAGE_IDS.preview;
  }
  _isWideViewPageActive() {
    return this._pageId === PAGE_IDS.wideView;
  }
  _deviceRouteBucket() {
    return resolveDeviceRouteBucket(DEVICE_PROFILE);
  }
  _ensureNavigationFactory() {
    if (this._navigationFactory) return this._navigationFactory;
    this._navigationFactory = createNavigationFactory({
      pages: {
        [PAGE_IDS.singleView]: {
          activate: (context) => this._activateStandardPageRoute(context)
        },
        [PAGE_IDS.preview]: {
          activate: (context) => this._activatePreviewPageRoute(context)
        },
        [PAGE_IDS.wideView]: {
          activate: (context) => this._activateStandardPageRoute(context)
        }
      },
      getDeviceBucket: () => this._deviceRouteBucket(),
      getConfig: () => this._config || {},
      onBeforeNavigate: (nextPageId, context) => {
        context.previousPageId = this._pageId || PAGE_IDS.singleView;
        this._pageId = nextPageId;
        this._previewPageActive = nextPageId === PAGE_IDS.preview;
      },
      onAfterNavigate: (nextPageId) => {
        if (nextPageId !== PAGE_IDS.preview) {
          this._lastNonPreviewPageId = nextPageId;
        }
        this._syncPageNavigationButtons();
      }
    });
    return this._navigationFactory;
  }
  _pageRouteOptions() {
    return getEnabledPageRoutes(this._config || {}, this._deviceRouteBucket());
  }
  _isPageRouteAvailable(pageId) {
    return this._pageRouteOptions().includes(normalizePageRoute(pageId));
  }
  _pageRouteLabel(pageId) {
    if (pageId === PAGE_IDS.preview) return "Preview";
    if (pageId === PAGE_IDS.wideView) return "Wide View";
    return "Single View";
  }
  _pageNavMarkup() {
    const activePageId = normalizePageRoute(this._pageId);
    const routes = this._pageRouteOptions();
    return `<div class="page-nav" aria-label="Page navigation">${routes.map(
      (pageId) => `<button class="page-nav-btn${pageId === activePageId ? " active" : ""}" type="button" data-page-route="${pageId}" aria-pressed="${pageId === activePageId ? "true" : "false"}">${this._pageRouteLabel(pageId)}</button>`
    ).join("")}</div>`;
  }
  _syncPageNavigationButtons() {
    this.shadowRoot.querySelectorAll("[data-page-route]").forEach((button) => {
      const isActive = button.dataset.pageRoute === normalizePageRoute(this._pageId);
      button.classList.toggle("active", isActive);
      button.setAttribute("aria-pressed", isActive ? "true" : "false");
    });
  }
  _navigateToPageRoute(pageId, context = {}) {
    return this._ensureNavigationFactory().navigateTo(pageId, context);
  }
  _navigateToConfiguredLandingPage(context = {}) {
    const nextPageId = this._ensureNavigationFactory().resolveStartupPage({
      hasPendingDeepLinkTarget: context.hasPendingDeepLinkTarget === true
    });
    return this._navigateToPageRoute(nextPageId, context);
  }
  _activateStandardPageRoute(context = {}) {
    const leavingPreview = context.previousPageId === PAGE_IDS.preview;
    if (leavingPreview) {
      this._stopPreviewMode();
      if (this._$("#myPopup")?.classList.contains("is-open"))
        this._closePopup();
      this._cancelPendingMount(`page-route-${this._pageId}`);
    }
    this._applyPreviewShellVisibility();
    this._applyCardStyle();
    this._applyLayoutMode();
    if (this._isWideViewPageActive()) this._syncColHeight();
    if (context.startup === true) {
      if (context.startInGrid === true) {
        this._setViewMode("grid");
      } else {
        this._mountEngine();
      }
      return;
    }
    if (context.deferCameraSwitch === true) return;
    if (leavingPreview) {
      this._mountEngine(null, { quiet: true });
    }
    this._syncTabsShell();
    this._renderAll();
  }
  _activatePreviewPageRoute(context = {}) {
    if (context.previousPageId !== PAGE_IDS.preview) {
      if (this._$("#myPopup")?.classList.contains("is-open"))
        this._closePopup();
      this._cancelPendingMount("page-route-preview");
    }
    this._applyPreviewShellVisibility();
    this._applyCardStyle();
    this._applyLayoutMode();
    this._startPreviewMode();
  }
  _hasPendingDeepLinkTarget() {
    return !!(this._deepLinkEventId || this._deepLinkReviewId || this._deepLinkCameraHint);
  }
  _previewLiveCamerasEnabled() {
    return this._config?.preview_page_live_cameras === true;
  }
  _previewShowTitleBarsEnabled() {
    return this._config?.preview_page_show_title_bars !== false;
  }
  _applyPreviewShellVisibility() {
    const card = this._$("#card");
    if (!card) return;
    card.classList.toggle("preview-active", this._isPreviewPageActive());
  }
  _clearPreviewTimers() {
    if (this._previewSnapshotRefreshT)
      clearTimeout(this._previewSnapshotRefreshT);
    if (this._previewAlertWatchT) clearTimeout(this._previewAlertWatchT);
    if (this._previewAlertCleanupT) clearTimeout(this._previewAlertCleanupT);
    this._previewSnapshotRefreshT = null;
    this._previewAlertWatchT = null;
    this._previewAlertCleanupT = null;
  }
  _clearPreviewAlertTracking() {
    this._previewAlertExpiresByEntity.clear();
    this._previewAlertSeverityByEntity.clear();
    this._previewHandledReviewIds.clear();
  }
  _isPreviewCameraAlertLive(entity) {
    const until = Number(this._previewAlertExpiresByEntity.get(entity) || 0);
    return until > Date.now();
  }
  _previewCellSeverity(entity) {
    if (!this._isPreviewCameraAlertLive(entity)) {
      this._previewAlertSeverityByEntity.delete(entity);
      return "";
    }
    const sev = String(this._previewAlertSeverityByEntity.get(entity) || "").trim().toLowerCase();
    return sev === "detection" ? "detection" : sev === "alert" ? "alert" : "";
  }
  _previewShouldUseLive(entity) {
    return this._previewLiveCamerasEnabled() || this._isPreviewCameraAlertLive(entity);
  }
  _previewEventsCount(entity) {
    const cache = this._camCache[entity];
    const eventsCount = Array.isArray(cache?.events) ? cache.events.length : 0;
    const reviewsCount = Array.isArray(cache?.reviews) ? cache.reviews.length : 0;
    return eventsCount + reviewsCount;
  }
  _previewStreamSourceLabel(entity, useLive) {
    if (!useLive) return "Snapshot";
    const connectionType = this._cameraConnectionType(entity);
    if (connectionType === "ha_direct") return "HA Live";
    const hint = String(this._previewLiveStreamHint() || "").toUpperCase();
    return hint ? `${hint} Live` : "Live";
  }
  _previewLiveStreamHint() {
    const active = String(this._activeStreamType || "").trim().toLowerCase();
    if (active === "webrtc" || active === "mse" || active === "hls") {
      return active;
    }
    const lastHint = String(this._lastLiveStreamHint || "").trim().toLowerCase();
    if (lastHint === "webrtc" || lastHint === "mse" || lastHint === "hls") {
      return lastHint;
    }
    if (DEVICE_PROFILE.isIOS) return "webrtc";
    return "mse";
  }
  _teardownPreviewMedia() {
    if (this._previewMediaState) {
      this._previewMediaState.destroyed = true;
      for (const cleanup of this._previewMediaState.cleanup || []) {
        try {
          cleanup();
        } catch (_) {
        }
      }
    }
    this._previewMediaState = null;
    this._previewLastRenderSignature = "";
    const hosts = this.shadowRoot.querySelectorAll(".preview-media-host");
    hosts.forEach((host) => {
      host.querySelectorAll("video").forEach((video) => {
        try {
          video.pause();
          video.removeAttribute("src");
          video.load();
        } catch (_) {
        }
      });
      host.innerHTML = "";
    });
  }
  _renderPreviewPage() {
    const shell = this._$("#preview-shell");
    if (!shell) return;
    const titleEl = this._$("#preview-shell-title");
    const subtitleEl = this._$("#preview-shell-subtitle");
    if (titleEl) {
      titleEl.textContent = this._config.title || (this._config.cameras.length === 1 ? cap(camDisplayName(this._config.cameras[0])) : "Cameras") || "Camera";
    }
    if (subtitleEl) subtitleEl.textContent = this._subtitleText();
    if (!this._isPreviewPageEnabled()) {
      shell.innerHTML = "";
      this._applyPreviewShellVisibility();
      return;
    }
    if (!this._isPreviewPageActive()) {
      this._applyPreviewShellVisibility();
      return;
    }
    const cameras = Array.isArray(this._config?.cameras) ? this._config.cameras.slice(0, 9) : [];
    const showTitleBars = this._previewShowTitleBarsEnabled();
    const liveStreamHint = this._previewLiveStreamHint();
    const hassReady = !!this._hass?.states;
    const nextSignature = cameras.map((camera, index) => {
      const entity = camera?.entity || "";
      const severity = this._previewCellSeverity(entity);
      const useLive = this._previewShouldUseLive(entity);
      return `${index}:${entity}:${severity || "none"}:${useLive ? `live:${liveStreamHint}` : "snap"}`;
    }).concat([
      `titles:${showTitleBars ? "1" : "0"}`,
      `hass:${hassReady ? "1" : "0"}`
    ]).join("|");
    if (shell.firstElementChild?.classList?.contains("preview-grid") && this._previewLastRenderSignature === nextSignature) {
      this._updatePreviewMeta();
      this._applyPreviewShellVisibility();
      return;
    }
    this._teardownPreviewMedia();
    this._previewLastRenderSignature = nextSignature;
    const cells = cameras.map((camera, index) => {
      const entity = camera?.entity || "";
      const entState = this._hass?.states?.[entity];
      const online = entState?.state !== "unavailable";
      const severity = this._previewCellSeverity(entity);
      const useLive = this._previewShouldUseLive(entity);
      const sourceLabel = this._previewStreamSourceLabel(entity, useLive);
      const eventsCount = this._previewEventsCount(entity);
      const name = cap(camDisplayName(camera));
      return `<div class="preview-cell shadow-medium" data-preview-camidx="${index}">
          <div class="preview-media-host ${severity === "alert" ? "grid-alert" : severity === "detection" ? "grid-detection" : ""}" data-preview-media-entity="${entity}" data-preview-use-live="${useLive ? "1" : "0"}"></div>
          ${showTitleBars ? `<div class="preview-meta">
              <div class="preview-meta-name">${name}</div>
              <div class="preview-meta-status"><span class="dot" style="color:${online ? "#4ade80" : "#ef4444"}">\u25CF</span>${online ? "Online" : "Offline"}</div>
              <div class="preview-meta-source">Stream Source: ${sourceLabel}</div>
              <div class="preview-meta-events">Events: ${eventsCount}</div>
            </div>` : ""}
        </div>`;
    }).join("");
    const buttons = cameras.map((camera, index) => {
      const name = cap(camDisplayName(camera));
      return `<button class="glass-btn preview-cam-btn" type="button" data-preview-select-camidx="${index}">${name}</button>`;
    }).join("");
    shell.innerHTML = `<div class="preview-grid" id="preview-grid">${cells}</div>
      <div class="preview-cam-buttons">${buttons}</div>`;
    this._mountPreviewMedia();
    this._applyPreviewShellVisibility();
  }
  _updatePreviewMeta() {
    if (!this._previewShowTitleBarsEnabled()) return;
    this.shadowRoot.querySelectorAll("[data-preview-camidx]").forEach((cell) => {
      const idx = Number(cell.dataset.previewCamidx);
      const camera = this._config?.cameras?.[idx];
      const entity = camera?.entity || "";
      if (!entity) return;
      const online = this._hass?.states?.[entity]?.state !== "unavailable";
      const useLive = this._previewShouldUseLive(entity);
      const status = cell.querySelector(".preview-meta-status");
      if (status) {
        status.innerHTML = `<span class="dot" style="color:${online ? "#4ade80" : "#ef4444"}">\u25CF</span>${online ? "Online" : "Offline"}`;
      }
      const source = cell.querySelector(".preview-meta-source");
      if (source) {
        source.textContent = `Stream Source: ${this._previewStreamSourceLabel(entity, useLive)}`;
      }
      const events = cell.querySelector(".preview-meta-events");
      if (events)
        events.textContent = `Events: ${this._previewEventsCount(entity)}`;
    });
  }
  _mountPreviewMedia() {
    if (!this._isPreviewPageActive()) return;
    const hosts = this.shadowRoot.querySelectorAll(".preview-media-host");
    if (!this._hass?.states) {
      hosts.forEach((host) => {
        host.innerHTML = `<div class="ph">${ICONS.live}<span>Loading\u2026</span></div>`;
      });
      return;
    }
    const liveStreamHint = this._previewLiveStreamHint();
    const previewState = { destroyed: false, cleanup: [] };
    this._previewMediaState = previewState;
    hosts.forEach((host) => {
      const entity = host.dataset.previewMediaEntity || "";
      const useLive = host.dataset.previewUseLive === "1";
      const stateObj = entity ? this._hlsStateObj(entity, liveStreamHint) || this._hass?.states?.[entity] || null : null;
      host.innerHTML = "";
      if (!entity) {
        host.innerHTML = `<div class="ph">${ICONS.live}<span>Unavailable</span></div>`;
        return;
      }
      this._mountGridCameraCellMedia(host, {
        entity,
        stateObj,
        useLive,
        liveStreamHint,
        gridState: previewState,
        fallbackOnLiveError: true
      });
    });
  }
  _refreshPreviewSnapshots() {
    if (!this._isPreviewPageActive() || this._previewLiveCamerasEnabled())
      return;
    const hosts = this.shadowRoot.querySelectorAll(
      ".preview-media-host[data-preview-use-live='0']"
    );
    hosts.forEach((host) => {
      const entity = host.dataset.previewMediaEntity || "";
      const img = host.querySelector("img");
      if (!entity || !img) return;
      void (async () => {
        const url = await this._streamFallbackUrl(entity);
        if (!img.isConnected || !url) return;
        img.src = url;
      })();
    });
  }
  _schedulePreviewSnapshotRefresh(delayMs = null) {
    if (this._previewSnapshotRefreshT)
      clearTimeout(this._previewSnapshotRefreshT);
    this._previewSnapshotRefreshT = null;
    void delayMs;
  }
  _schedulePreviewAlertCleanup() {
    if (this._previewAlertCleanupT) clearTimeout(this._previewAlertCleanupT);
    let nextExpiry = 0;
    for (const until of this._previewAlertExpiresByEntity.values()) {
      const ts = Number(until || 0);
      if (ts <= Date.now()) continue;
      if (!nextExpiry || ts < nextExpiry) nextExpiry = ts;
    }
    if (!nextExpiry) {
      this._previewAlertCleanupT = null;
      return;
    }
    const wait = Math.max(100, nextExpiry - Date.now() + 25);
    this._previewAlertCleanupT = setTimeout(() => {
      this._previewAlertCleanupT = null;
      let changed = false;
      const now = Date.now();
      for (const [
        entity,
        until
      ] of this._previewAlertExpiresByEntity.entries()) {
        if (Number(until || 0) <= now) {
          this._previewAlertExpiresByEntity.delete(entity);
          this._previewAlertSeverityByEntity.delete(entity);
          changed = true;
        }
      }
      if (changed && this._isPreviewPageActive()) this._renderPreviewPage();
      this._schedulePreviewAlertCleanup();
    }, wait);
  }
  _markPreviewAlertCamera(entity, severity = "alert", holdMs = PREVIEW_ALERT_HOLD_MS) {
    if (!entity) return;
    const normalizedSeverity = String(severity || "").trim().toLowerCase() === "detection" ? "detection" : "alert";
    this._previewAlertSeverityByEntity.set(entity, normalizedSeverity);
    this._previewAlertExpiresByEntity.set(
      entity,
      Date.now() + Math.max(1e3, Number(holdMs) || PREVIEW_ALERT_HOLD_MS)
    );
    this._schedulePreviewAlertCleanup();
    if (this._isPreviewPageActive()) this._renderPreviewPage();
  }
  _rememberHandledPreviewReview(reviewId) {
    const id = String(reviewId || "").trim();
    if (!id) return;
    this._previewHandledReviewIds.add(id);
    if (this._previewHandledReviewIds.size <= 200) return;
    const oldest = this._previewHandledReviewIds.values().next().value;
    if (oldest) this._previewHandledReviewIds.delete(oldest);
  }
  _isPreviewReviewFresh(review) {
    const startedAt = Number(this._previewStartedAtSec || 0);
    if (startedAt <= 0) return true;
    const reviewStart = this._reviewStartTimeSec(review);
    if (reviewStart <= 0) return false;
    return reviewStart >= startedAt - SLIDESHOW_REVIEW_FRESHNESS_GRACE_SEC;
  }
  async _probeLatestPreviewAlert() {
    if (!this._isPreviewPageActive()) return;
    const before = Math.floor(Date.now() / 1e3);
    const after = Math.max(
      0,
      Math.floor(before - (this._config?.alerts_reviews_days || 3) * DAY)
    );
    const candidates = [];
    for (const camera of this._config?.cameras || []) {
      const entity = camera?.entity || "";
      const cache = this._camCache[entity];
      if (!entity || !cache?.clientId || !cache?.cam) continue;
      let reviews = [];
      try {
        const batch = await this._ws({
          type: "frigate/reviews/get",
          instance_id: cache.clientId,
          cameras: [cache.cam],
          after,
          before,
          limit: 5
        });
        reviews = Array.isArray(batch) ? batch : [];
      } catch (_) {
        reviews = [];
      }
      cache.reviews = reviews;
      for (const review of reviews) {
        if (!this._isPreviewReviewFresh(review)) continue;
        const severity = this._normalizeReviewSeverity(review);
        if (!this._shouldHandleSlideshowReview(entity, severity)) continue;
        const reviewId = String(review?.id || "").trim();
        if (reviewId && this._previewHandledReviewIds.has(reviewId)) continue;
        candidates.push({
          entity,
          severity,
          reviewId,
          startTime: this._reviewStartTimeSec(review)
        });
        break;
      }
    }
    if (!candidates.length) return;
    candidates.sort((a, b) => b.startTime - a.startTime);
    const next = candidates[0];
    if (!next?.entity) return;
    if (next.reviewId) this._rememberHandledPreviewReview(next.reviewId);
    this._markPreviewAlertCamera(
      next.entity,
      next.severity,
      PREVIEW_ALERT_HOLD_MS
    );
  }
  _schedulePreviewAlertWatch(delayMs = null) {
    if (this._previewAlertWatchT) clearTimeout(this._previewAlertWatchT);
    if (!this._isPreviewPageActive()) return;
    const wait = delayMs == null ? Math.max(
      1200,
      Math.floor(this._effectiveRealtimePollSeconds() * 1e3)
    ) : Math.max(0, Number(delayMs) || 0);
    this._previewAlertWatchT = setTimeout(() => {
      this._previewAlertWatchT = null;
      void this._probeLatestPreviewAlert().finally(() => {
        this._schedulePreviewAlertWatch();
      });
    }, wait);
  }
  _handlePreviewRealtimeMessage(msg) {
    if (!this._isPreviewPageActive()) return;
    const incomingCam = this._extractRealtimeMessageCamera(msg);
    if (!incomingCam) return;
    const cam = this._cameraEntityForIncomingCamera(incomingCam);
    if (!cam) return;
    const type = String(msg?.type || "").trim().toLowerCase();
    const severity = this._extractRealtimeMessageSeverity(msg);
    if (type === "end") {
      if (this._isPreviewCameraAlertLive(cam)) {
        this._markPreviewAlertCamera(
          cam,
          this._previewCellSeverity(cam),
          PREVIEW_ALERT_END_GRACE_MS
        );
      }
      return;
    }
    if (!this._shouldHandleSlideshowReview(cam, severity)) return;
    this._markPreviewAlertCamera(
      cam,
      severity || "alert",
      PREVIEW_ALERT_HOLD_MS
    );
  }
  _startPreviewMode() {
    if (!this._isPreviewPageActive()) return;
    this._previewStartedAtSec = Math.floor(Date.now() / 1e3);
    this._clearPreviewTimers();
    this._clearPreviewAlertTracking();
    this._renderPreviewPage();
    this._schedulePreviewAlertWatch(350);
  }
  _stopPreviewMode() {
    this._clearPreviewTimers();
    this._teardownPreviewMedia();
  }
  _exitPreviewPageToCamera(idx) {
    if (!this._isPreviewPageActive()) return;
    if (!Number.isInteger(idx) || idx < 0 || idx >= (this._config?.cameras?.length || 0)) {
      return;
    }
    const targetPageId = this._isPageRouteAvailable(this._lastNonPreviewPageId) ? this._lastNonPreviewPageId : PAGE_IDS.singleView;
    this._navigateToPageRoute(targetPageId, {
      source: "preview-camera-select",
      deferCameraSwitch: true
    });
    if (this._activeCamIdx === idx) this._activeCamIdx = -1;
    void this._switchCamera(idx, { source: "manual" });
  }
  _returnToPreviewPage() {
    if (!this._isPreviewPageEnabled() || this._isPreviewPageActive()) return;
    this._navigateToPageRoute(PAGE_IDS.preview, {
      source: "preview-page-return"
    });
  }
  // ── view mode ─────────────────────────────────────────────
  _isGridModeAvailable() {
    return this._config?.grid_mode_enabled === true && !DEVICE_PROFILE.isPhone && !this._isMobilePhoneViewport() && Array.isArray(this._config?.cameras) && this._config.cameras.length > 1;
  }
  _gridRotationMs() {
    const seconds = Number(this._config?.grid_rotation_seconds);
    return GRID_ROTATION_OPTIONS_SECONDS.includes(seconds) ? seconds * 1e3 : 3e4;
  }
  _clearGridTimers() {
    if (this._gridRotationT) clearTimeout(this._gridRotationT);
    if (this._gridAlertReturnT) clearTimeout(this._gridAlertReturnT);
    if (this._gridAlertWatchT) clearTimeout(this._gridAlertWatchT);
    if (this._gridAlertCleanupT) clearTimeout(this._gridAlertCleanupT);
    if (this._gridRefreshT) clearTimeout(this._gridRefreshT);
    this._gridRotationT = null;
    this._gridAlertReturnT = null;
    this._gridAlertWatchT = null;
    this._gridAlertCleanupT = null;
    this._gridRefreshT = null;
  }
  _clearGridAlertTracking() {
    this._gridAlertExpiresByEntity.clear();
    this._gridAlertSeverityByEntity.clear();
    this._gridLastRenderSignature = "";
    if (this._gridAlertCleanupT) clearTimeout(this._gridAlertCleanupT);
    this._gridAlertCleanupT = null;
  }
  _scheduleGridRefresh(delayMs = 80) {
    if (this._gridRefreshT) clearTimeout(this._gridRefreshT);
    if (this._viewMode !== "grid") return;
    this._gridRefreshT = setTimeout(
      () => {
        this._gridRefreshT = null;
        if (this._viewMode !== "grid") return;
        this._mountEngine(null, { quiet: true });
      },
      Math.max(0, Number(delayMs) || 0)
    );
  }
  _shouldStartInGridMode() {
    return this._config?.grid_start_in_grid_enabled === true && this._isGridModeAvailable();
  }
  _applyStartInGridMode(_source = "") {
    if (this._isPreviewPageActive()) return;
    if (!this._shouldStartInGridMode()) return;
    if (this._viewMode === "grid") return;
    this._gridRotationStart = 0;
    this._setViewMode("grid");
  }
  _rememberHandledGridReview(reviewId) {
    const id = String(reviewId || "").trim();
    if (!id) return;
    this._gridHandledReviewIds.add(id);
    if (this._gridHandledReviewIds.size <= 200) return;
    const oldest = this._gridHandledReviewIds.values().next().value;
    if (oldest) this._gridHandledReviewIds.delete(oldest);
  }
  _isGridReviewFresh(review) {
    const startedAt = Number(this._gridStartedAtSec || 0);
    if (startedAt <= 0) return true;
    const reviewStart = this._reviewStartTimeSec(review);
    if (reviewStart <= 0) return false;
    return reviewStart >= startedAt - SLIDESHOW_REVIEW_FRESHNESS_GRACE_SEC;
  }
  _gridAlertWatchIntervalMs() {
    return Math.max(
      1e3,
      Math.floor(this._effectiveRealtimePollSeconds() * 1e3)
    );
  }
  _scheduleGridAlertWatch(delayMs = null) {
    if (!this._isGridModeAvailable()) return;
    if (this._viewMode !== "grid") return;
    if (this._gridAlertWatchT) clearTimeout(this._gridAlertWatchT);
    const wait = delayMs == null ? this._gridAlertWatchIntervalMs() : Math.max(0, Number(delayMs) || 0);
    this._gridAlertWatchT = setTimeout(() => {
      this._gridAlertWatchT = null;
      void this._probeLatestGridAlert().finally(() => {
        this._scheduleGridAlertWatch();
      });
    }, wait);
  }
  _gridLiveViewEnabled() {
    return this._config?.grid_live_view_enabled !== false;
  }
  _isGridCameraAlertLive(entity) {
    const until = Number(this._gridAlertExpiresByEntity.get(entity) || 0);
    return until > Date.now();
  }
  _gridCellSeverity(entity) {
    if (!this._isGridCameraAlertLive(entity)) {
      this._gridAlertSeverityByEntity.delete(entity);
      return "";
    }
    const sev = String(this._gridAlertSeverityByEntity.get(entity) || "").trim().toLowerCase();
    return sev === "detection" ? "detection" : sev === "alert" ? "alert" : "";
  }
  _scheduleGridAlertCleanup() {
    if (this._gridAlertCleanupT) clearTimeout(this._gridAlertCleanupT);
    let nextExpiry = 0;
    for (const until of this._gridAlertExpiresByEntity.values()) {
      const ts = Number(until || 0);
      if (ts <= Date.now()) continue;
      if (!nextExpiry || ts < nextExpiry) nextExpiry = ts;
    }
    if (!nextExpiry) {
      this._gridAlertCleanupT = null;
      return;
    }
    const wait = Math.max(80, nextExpiry - Date.now() + 20);
    this._gridAlertCleanupT = setTimeout(() => {
      this._gridAlertCleanupT = null;
      let changed = false;
      const now = Date.now();
      for (const [entity, until] of this._gridAlertExpiresByEntity.entries()) {
        if (Number(until || 0) <= now) {
          this._gridAlertExpiresByEntity.delete(entity);
          this._gridAlertSeverityByEntity.delete(entity);
          changed = true;
        }
      }
      if (changed && this._viewMode === "grid") {
        this._scheduleGridRefresh();
      }
      this._scheduleGridAlertCleanup();
    }, wait);
  }
  _markGridAlertCamera(entity, severity = "alert") {
    if (!entity) return false;
    const wasLive = this._isGridCameraAlertLive(entity);
    const prevSeverity = String(
      this._gridAlertSeverityByEntity.get(entity) || ""
    ).trim().toLowerCase();
    const normalizedSeverity = String(severity || "").trim().toLowerCase() === "detection" ? "detection" : "alert";
    this._gridAlertSeverityByEntity.set(entity, normalizedSeverity);
    this._gridAlertExpiresByEntity.set(
      entity,
      Date.now() + this._gridRotationMs()
    );
    this._scheduleGridAlertCleanup();
    return !wasLive || prevSeverity !== normalizedSeverity;
  }
  _scheduleGridRotation() {
    if (!this._isGridModeAvailable()) return;
    if (this._viewMode !== "grid") return;
    if ((this._config?.cameras?.length || 0) <= 4) {
      if (this._gridRotationT) clearTimeout(this._gridRotationT);
      this._gridRotationT = null;
      return;
    }
    if (this._gridRotationT) clearTimeout(this._gridRotationT);
    this._gridRotationT = setTimeout(() => {
      this._gridRotationT = null;
      this._advanceGridRotation();
    }, this._gridRotationMs());
  }
  _advanceGridRotation() {
    if (!this._isGridModeAvailable()) return;
    if (this._viewMode !== "grid") return;
    const total = this._config?.cameras?.length || 0;
    if (total <= 4) {
      this._gridRotationStart = 0;
      this._scheduleGridRotation();
      return;
    }
    const totalPages = Math.max(1, Math.ceil(total / 4));
    const currentPage = Math.min(
      totalPages - 1,
      Math.max(0, Math.floor((Number(this._gridRotationStart) || 0) / 4))
    );
    const nextPage = (currentPage + 1) % totalPages;
    this._gridRotationStart = nextPage * 4;
    this._mountEngine(null, { quiet: true });
    this._scheduleGridRotation();
  }
  _gridPageCameraIndices() {
    const total = this._config?.cameras?.length || 0;
    if (!total) return [];
    const maxStart = Math.max(0, (Math.ceil(total / 4) - 1) * 4);
    const rawStart = Math.max(0, Number(this._gridRotationStart) || 0);
    const start = Math.min(maxStart, Math.floor(rawStart / 4) * 4);
    this._gridRotationStart = start;
    return [0, 1, 2, 3].map((offset) => {
      const idx = start + offset;
      return idx < total ? idx : -1;
    });
  }
  _mountGridEngine(slot) {
    const indices = this._gridPageCameraIndices();
    const liveStreamHint = this._currentLiveStreamHint();
    const gridState = { destroyed: false, cleanup: [] };
    const signatureParts = [];
    for (const idx of indices) {
      if (idx < 0) {
        signatureParts.push("-1");
        continue;
      }
      const cam = this._config?.cameras?.[idx];
      const entity = cam?.entity || "";
      const severity = this._gridCellSeverity(entity);
      const useLive = this._gridLiveViewEnabled() || this._isGridCameraAlertLive(entity);
      signatureParts.push(
        `${idx}:${entity}:${severity || "none"}:${useLive ? `live:${liveStreamHint}` : "snap"}`
      );
    }
    const nextSignature = signatureParts.join("|");
    const hasExistingGrid = slot.firstElementChild?.classList?.contains("live-grid");
    if (hasExistingGrid && this._gridLastRenderSignature === nextSignature) {
      this._setActiveStreamType("grid");
      this._setStreamLoading(false);
      this._setStreamFallbackVisible(false);
      return;
    }
    this._gridLastRenderSignature = nextSignature;
    slot.innerHTML = "";
    const grid = document.createElement("div");
    grid.className = "live-grid";
    for (const idx of indices) {
      const cell = document.createElement("div");
      cell.className = "live-grid-cell";
      if (idx >= 0) {
        const cam = this._config?.cameras?.[idx];
        const entity = cam?.entity || "";
        const stateObj = entity ? this._hlsStateObj(entity, liveStreamHint) || this._hass?.states?.[entity] || null : null;
        const severity = this._gridCellSeverity(entity);
        if (severity === "alert") cell.classList.add("grid-alert");
        if (severity === "detection") cell.classList.add("grid-detection");
        const useLive = this._gridLiveViewEnabled() || this._isGridCameraAlertLive(entity);
        if (entity) {
          this._mountGridCameraCellMedia(cell, {
            entity,
            stateObj,
            useLive,
            liveStreamHint,
            gridState
          });
        } else {
          cell.classList.add("empty");
        }
        cell.dataset.gridCamidx = String(idx);
        cell.dataset.gridEntity = entity;
        const label = document.createElement("div");
        label.className = "live-grid-label";
        label.textContent = cap(camDisplayName(cam));
        cell.appendChild(label);
      } else {
        cell.classList.add("empty");
      }
      if (cell.classList.contains("empty")) {
        cell.innerHTML = `<div class="ph">${ICONS.live}<span>Empty</span></div>`;
      }
      grid.appendChild(cell);
    }
    slot.appendChild(grid);
    this._engine = {
      destroy: () => {
        gridState.destroyed = true;
        for (const cleanup of gridState.cleanup) {
          try {
            cleanup();
          } catch (_) {
          }
        }
        try {
          slot.innerHTML = "";
        } catch (_) {
        }
      }
    };
    this._setActiveStreamType("grid");
    this._setStreamLoading(false);
    this._setStreamFallbackVisible(false);
  }
  async _probeLatestGridAlert() {
    if (!this._isGridModeAvailable()) return;
    if (this._viewMode !== "grid") return;
    const before = Math.floor(Date.now() / 1e3);
    const after = Math.max(
      0,
      Math.floor(before - (this._config?.alerts_reviews_days || 3) * DAY)
    );
    const candidates = [];
    for (const camera of this._config?.cameras || []) {
      const entity = camera?.entity || "";
      const cache = this._camCache[entity];
      if (!entity || !cache?.clientId || !cache?.cam) continue;
      let reviews = [];
      try {
        const batch = await this._ws({
          type: "frigate/reviews/get",
          instance_id: cache.clientId,
          cameras: [cache.cam],
          after,
          before,
          limit: 5
        });
        reviews = Array.isArray(batch) ? batch : [];
      } catch (_) {
        reviews = [];
      }
      for (const review of reviews) {
        if (!this._isGridReviewFresh(review)) continue;
        const severity = this._normalizeReviewSeverity(review);
        if (!this._shouldHandleSlideshowReview(entity, severity)) continue;
        const reviewId = String(review?.id || "").trim();
        if (reviewId && this._gridHandledReviewIds.has(reviewId)) continue;
        candidates.push({
          entity,
          severity,
          reviewId,
          startTime: this._reviewStartTimeSec(review)
        });
        break;
      }
    }
    if (!candidates.length) return;
    candidates.sort((a, b) => b.startTime - a.startTime);
    const next = candidates[0];
    if (!next?.entity) return;
    if (next.reviewId) this._rememberHandledGridReview(next.reviewId);
    this._handleGridAlertCandidate(next.entity, next.severity);
  }
  _handleGridAlertCandidate(entity, severity = "alert") {
    if (!this._isGridModeAvailable()) return;
    if (this._viewMode !== "grid") return;
    const idx = this._cameraIndexByEntity(entity);
    if (idx < 0) return;
    const now = Date.now();
    if (this._gridLastAlertCam === entity && now - Number(this._gridLastAlertAt || 0) < 1200) {
      return;
    }
    this._gridLastAlertAt = now;
    this._gridLastAlertCam = entity;
    const changed = this._markGridAlertCamera(entity, severity || "alert");
    this._ffDebug("Grid alert candidate", {
      entity,
      severity,
      changed
    });
    if (changed) this._scheduleGridRefresh();
  }
  _handleGridRealtimeMessage(msg) {
    if (!this._isGridModeAvailable()) return;
    if (this._viewMode !== "grid") return;
    const incomingCam = this._extractRealtimeMessageCamera(msg);
    if (!incomingCam) return;
    const severity = this._extractRealtimeMessageSeverity(msg);
    const cam = this._cameraEntityForIncomingCamera(incomingCam);
    if (!cam) return;
    if (!this._shouldHandleSlideshowReview(cam, severity)) return;
    this._handleGridAlertCandidate(cam, severity || "alert");
  }
  _stopGridModeState() {
    this._clearGridTimers();
    this._gridResumePending = false;
    this._gridPinnedRotationStart = Math.max(
      0,
      Number(this._gridRotationStart) || 0
    );
    this._gridLastAlertAt = 0;
    this._gridLastAlertCam = "";
    this._gridStartedAtSec = 0;
    this._gridHandledReviewIds.clear();
    this._clearGridAlertTracking();
    this._setSlideshowAlertState("");
  }
  _toggleGridMode() {
    if (this._isPreviewPageActive()) return;
    if (this._viewMode === "grid" || this._gridResumePending) {
      this._gridResumePending = false;
      this._stopGridModeState();
      if (this._viewMode === "grid") {
        this._setViewMode("single");
      } else {
        this._syncToolbarButtons();
      }
      return;
    }
    this._gridRotationStart = 0;
    this._gridPinnedRotationStart = 0;
    this._clearGridAlertTracking();
    this._setViewMode("grid");
  }
  _setViewMode(mode) {
    if (this._isPreviewPageActive()) return;
    const nextMode = mode === "grid" && this._isGridModeAvailable() ? "grid" : "single";
    if (this._viewMode === "grid" && nextMode !== "grid") {
      this._stopGridModeState();
      this._gridLastRenderSignature = "";
    }
    let startGridTimers = false;
    if (nextMode === "grid") {
      this._stopSlideshowRotation("grid-mode", false);
      this._setLiveMuted(true);
      this._gridRotationStart = Math.max(
        0,
        Number(this._gridRotationStart) || 0
      );
      this._gridStartedAtSec = Math.floor(Date.now() / 1e3);
      this._gridHandledReviewIds.clear();
      this._clearGridAlertTracking();
      this._gridResumePending = false;
      startGridTimers = true;
    }
    this._viewMode = nextMode;
    const engWrap = this._$("#eng-wrap");
    if (engWrap) engWrap.style.display = "";
    this._eventsMode = "camera";
    this._mountEngine();
    this._syncTabsShell();
    this._renderAll();
    this._applyBrowse();
    this.shadowRoot.querySelectorAll("[data-viewmode]").forEach(
      (p) => p.classList.toggle("active", p.dataset.viewmode === nextMode)
    );
    if (startGridTimers) {
      this._scheduleGridRotation();
      this._scheduleGridAlertWatch(300);
    }
    this._syncToolbarButtons();
  }
  _isSlideshowRotationAvailable() {
    return this._config?.slideshow_rotation_enabled === true && !DEVICE_PROFILE.isPhone && !this._isMobilePhoneViewport() && Array.isArray(this._config?.cameras) && this._config.cameras.length > 1;
  }
  _isMobilePhoneViewport() {
    const width = Number(this._cardWidth || window.innerWidth || 0);
    return width > 0 && width < 420;
  }
  _slideshowRotationMs() {
    const seconds = Number(this._config?.slideshow_rotation_seconds);
    return SLIDESHOW_ROTATION_OPTIONS_SECONDS.includes(seconds) ? seconds * 1e3 : 3e4;
  }
  _slideshowButtonIcon() {
    return this._slideshowActive ? ICONS.presentationPlayActive : ICONS.presentationPlay;
  }
  _gridButtonIcon() {
    return ICONS.grid;
  }
  _clearSlideshowTimers() {
    if (this._slideshowSwitchT) clearTimeout(this._slideshowSwitchT);
    if (this._slideshowPauseT) clearTimeout(this._slideshowPauseT);
    if (this._slideshowFadeT) clearTimeout(this._slideshowFadeT);
    if (this._slideshowReviewProbeT) clearTimeout(this._slideshowReviewProbeT);
    if (this._slideshowReviewWatchT) clearTimeout(this._slideshowReviewWatchT);
    this._slideshowSwitchT = null;
    this._slideshowPauseT = null;
    this._slideshowFadeT = null;
    this._slideshowReviewProbeT = null;
    this._slideshowReviewWatchT = null;
  }
  _clearSlideshowCountdownOverlay() {
    this._slideshowNextSwitchAtMs = 0;
    if (this._slideshowCountdownT) clearInterval(this._slideshowCountdownT);
    this._slideshowCountdownT = null;
    const chip = this._$("#slideshow-next-chip");
    if (!chip) return;
    chip.hidden = true;
    chip.textContent = "Next Slide: 0s";
  }
  _syncSlideshowCountdownOverlay() {
    const chip = this._$("#slideshow-next-chip");
    if (!chip) return;
    const show = this._slideshowActive && this._viewMode === "single" && this._isSlideshowRotationAvailable() && !this._slideshowPopupPaused;
    if (!show) {
      chip.hidden = true;
      return;
    }
    const remainingMs = Math.max(
      0,
      Number(this._slideshowNextSwitchAtMs || 0) - Date.now()
    );
    const remainingSec = Math.max(0, Math.ceil(remainingMs / 1e3));
    chip.textContent = `Next Slide: ${remainingSec}s`;
    chip.hidden = false;
  }
  _setSlideshowCountdown(waitMs) {
    this._slideshowNextSwitchAtMs = Date.now() + Math.max(0, Number(waitMs) || 0);
    if (this._slideshowCountdownT) clearInterval(this._slideshowCountdownT);
    this._syncSlideshowCountdownOverlay();
    this._slideshowCountdownT = setInterval(() => {
      this._syncSlideshowCountdownOverlay();
    }, 250);
  }
  _syncToolbarButtons() {
    const gridBtn = this._$("#grid-btn");
    if (gridBtn) {
      const gridAvailable = this._isGridModeAvailable();
      const gridActive = this._viewMode === "grid";
      gridBtn.hidden = !gridAvailable;
      gridBtn.style.display = gridAvailable ? "" : "none";
      gridBtn.classList.toggle("active", gridAvailable && gridActive);
      gridBtn.setAttribute(
        "aria-pressed",
        gridAvailable && gridActive ? "true" : "false"
      );
      gridBtn.setAttribute(
        "title",
        gridActive ? "Stop grid mode" : "Start grid mode"
      );
      gridBtn.setAttribute(
        "aria-label",
        gridActive ? "Stop grid mode" : "Start grid mode"
      );
      gridBtn.innerHTML = this._gridButtonIcon();
      if (!gridAvailable && this._viewMode === "grid") {
        this._stopGridModeState();
        if (this._viewMode === "grid") {
          this._setViewMode("single");
        }
      }
    }
    const slideshowBtn = this._$("#slideshow-btn");
    if (!slideshowBtn) return;
    const available = this._isSlideshowRotationAvailable();
    slideshowBtn.hidden = !available;
    slideshowBtn.style.display = available ? "" : "none";
    slideshowBtn.classList.toggle("active", this._slideshowActive && available);
    slideshowBtn.setAttribute(
      "aria-pressed",
      this._slideshowActive && available ? "true" : "false"
    );
    slideshowBtn.setAttribute(
      "title",
      this._slideshowActive ? "Stop slideshow rotation" : "Start slideshow rotation"
    );
    slideshowBtn.setAttribute(
      "aria-label",
      this._slideshowActive ? "Stop slideshow rotation" : "Start slideshow rotation"
    );
    slideshowBtn.innerHTML = this._slideshowButtonIcon();
    if (!available) this._stopSlideshowRotation("unavailable", false);
  }
  _stopSlideshowRotation(reason = "manual-stop", sync = true) {
    this._clearSlideshowTimers();
    this._clearSlideshowCountdownOverlay();
    this._slideshowActive = false;
    this._slideshowPopupPaused = false;
    this._slideshowPausedUntil = 0;
    this._slideshowPendingAlertCam = "";
    this._slideshowPendingAlertType = "";
    this._slideshowLastAlertAt = 0;
    this._slideshowLastAlertCam = "";
    this._slideshowAttentionType = "";
    this._slideshowHandledReviewIds.clear();
    this._slideshowStartedAtSec = 0;
    this._slideshowReviewProbeInFlight = false;
    const engWrap = this._$("#eng-wrap");
    if (engWrap) {
      engWrap.classList.remove(
        "slideshow-switching",
        "slideshow-alert",
        "slideshow-detection"
      );
    }
    void reason;
    if (sync) this._syncToolbarButtons();
  }
  _startSlideshowRotation(source = "manual") {
    if (!this._isSlideshowRotationAvailable()) return false;
    this._slideshowActive = true;
    this._slideshowPopupPaused = this._$("#myPopup")?.classList.contains("is-open") === true;
    this._slideshowPausedUntil = 0;
    this._slideshowPendingAlertCam = "";
    this._slideshowPendingAlertType = "";
    this._slideshowAttentionType = "";
    this._slideshowHandledReviewIds.clear();
    this._slideshowStartedAtSec = Math.floor(Date.now() / 1e3);
    this._scheduleSlideshowReviewWatch(300);
    this._scheduleSlideshowRotation(source);
    this._syncToolbarButtons();
    return true;
  }
  _pauseSlideshowForPopup() {
    if (!this._slideshowActive) return;
    this._slideshowPopupPaused = true;
    this._syncSlideshowCountdownOverlay();
    if (this._slideshowSwitchT) clearTimeout(this._slideshowSwitchT);
    if (this._slideshowPauseT) clearTimeout(this._slideshowPauseT);
    this._slideshowSwitchT = null;
    this._slideshowPauseT = null;
  }
  _resumeSlideshowAfterPopup() {
    if (!this._slideshowActive) return;
    this._slideshowPopupPaused = false;
    this._slideshowPausedUntil = Date.now() + this._slideshowRotationMs();
    this._scheduleSlideshowRotation("popup-close");
  }
  _toggleSlideshowRotation() {
    if (this._slideshowActive) {
      this._stopSlideshowRotation("manual-stop");
      return;
    }
    let startedFromGrid = false;
    if (this._viewMode === "grid" || this._gridResumePending) {
      this._gridResumePending = false;
      this._stopGridModeState();
      this._setViewMode("single");
      startedFromGrid = true;
    }
    const started = this._startSlideshowRotation("manual-start");
    if (started && startedFromGrid) {
      if (this._slideshowSwitchT) {
        clearTimeout(this._slideshowSwitchT);
        this._slideshowSwitchT = null;
      }
      void this._advanceSlideshowRotation();
    }
  }
  _pauseSlideshowForInteraction() {
    if (!this._slideshowActive || !this._isSlideshowRotationAvailable()) return;
    this._slideshowPausedUntil = Date.now() + this._slideshowRotationMs();
    this._setSlideshowCountdown(this._slideshowRotationMs());
    if (this._slideshowPauseT) clearTimeout(this._slideshowPauseT);
    if (this._slideshowSwitchT) clearTimeout(this._slideshowSwitchT);
    this._slideshowPauseT = setTimeout(() => {
      this._slideshowPauseT = null;
      this._scheduleSlideshowRotation("pause-expired");
    }, this._slideshowRotationMs());
  }
  _scheduleSlideshowRotation(_reason = "") {
    if (!this._slideshowActive || !this._isSlideshowRotationAvailable()) {
      this._clearSlideshowCountdownOverlay();
      return;
    }
    if (this._slideshowPopupPaused) {
      this._syncSlideshowCountdownOverlay();
      return;
    }
    if (this._slideshowSwitchT) clearTimeout(this._slideshowSwitchT);
    const delay = Math.max(250, this._slideshowPausedUntil - Date.now());
    const wait = this._slideshowPausedUntil > Date.now() ? delay : this._slideshowRotationMs();
    this._setSlideshowCountdown(wait);
    this._slideshowSwitchT = setTimeout(() => {
      this._slideshowSwitchT = null;
      void this._advanceSlideshowRotation();
    }, wait);
  }
  _setSlideshowAlertState(type = "") {
    this._slideshowAttentionType = type === "alert" || type === "detection" ? type : "";
    const engWrap = this._$("#eng-wrap");
    if (!engWrap) return;
    engWrap.classList.toggle(
      "slideshow-alert",
      this._slideshowAttentionType === "alert"
    );
    engWrap.classList.toggle(
      "slideshow-detection",
      this._slideshowAttentionType === "detection"
    );
  }
  _slideshowReviewModeForCamera(entity) {
    const cam = this._config?.cameras?.find(
      (camera) => camera.entity === entity
    );
    return normalizeAlertsAreaContent(cam?.alerts_content);
  }
  _shouldHandleSlideshowReview(entity, severity) {
    if (severity === "alert") return true;
    return severity === "detection" && this._slideshowReviewModeForCamera(entity) === "all_reviews";
  }
  _cameraIndexForIncomingCamera(cameraId) {
    const normalized = String(cameraId || "").trim().toLowerCase();
    if (!normalized) return -1;
    return this._config?.cameras?.findIndex((camera) => {
      const entity = String(camera?.entity || "").toLowerCase();
      const name = String(camera?.name || "").toLowerCase();
      const discovered = String(
        this._camCache[camera?.entity]?.cam || ""
      ).toLowerCase();
      return entity === normalized || name === normalized || discovered === normalized;
    }) ?? -1;
  }
  _cameraEntityForIncomingCamera(cameraId) {
    const idx = this._cameraIndexForIncomingCamera(cameraId);
    return idx >= 0 ? this._config?.cameras?.[idx]?.entity || "" : "";
  }
  _normalizeReviewSeverity(review) {
    return String(review?.severity || review?.data?.severity || "").trim().toLowerCase();
  }
  _reviewStartTimeSec(review) {
    const start = Number(review?.start_time || review?.after?.start_time || 0);
    return Number.isFinite(start) ? start : 0;
  }
  _isSlideshowReviewFresh(review) {
    const startedAt = Number(this._slideshowStartedAtSec || 0);
    if (startedAt <= 0) return true;
    const reviewStart = this._reviewStartTimeSec(review);
    if (reviewStart <= 0) return false;
    return reviewStart >= startedAt - SLIDESHOW_REVIEW_FRESHNESS_GRACE_SEC;
  }
  _rememberHandledSlideshowReview(reviewId) {
    const id = String(reviewId || "").trim();
    if (!id) return;
    this._slideshowHandledReviewIds.add(id);
    if (this._slideshowHandledReviewIds.size <= 200) return;
    const oldest = this._slideshowHandledReviewIds.values().next().value;
    if (oldest) this._slideshowHandledReviewIds.delete(oldest);
  }
  _handleSlideshowReviewsUpdated(entity, reviews, source = "reviews-update") {
    if (!this._slideshowActive || !this._isSlideshowRotationAvailable()) return;
    if (!entity || !Array.isArray(reviews) || !reviews.length) return;
    let nextReview = null;
    for (const review of reviews) {
      if (!this._isSlideshowReviewFresh(review)) continue;
      const severity = this._normalizeReviewSeverity(review);
      if (!this._shouldHandleSlideshowReview(entity, severity)) continue;
      const reviewId = String(review?.id || "").trim();
      if (reviewId && this._slideshowHandledReviewIds.has(reviewId)) continue;
      nextReview = {
        entity,
        severity,
        reviewId
      };
      break;
    }
    if (!nextReview) return;
    if (nextReview.reviewId) {
      this._rememberHandledSlideshowReview(nextReview.reviewId);
    }
    if (this._slideshowPopupPaused) {
      this._slideshowPendingAlertCam = nextReview.entity;
      this._slideshowPendingAlertType = nextReview.severity;
      this._setSlideshowAlertState(nextReview.severity);
      return;
    }
    const now = Date.now();
    const activeEntity = this._activeCam?.entity || "";
    this._slideshowLastAlertAt = now;
    this._slideshowLastAlertCam = nextReview.entity;
    this._slideshowPausedUntil = now + this._slideshowRotationMs();
    this._setSlideshowAlertState(nextReview.severity);
    if (nextReview.entity === activeEntity) {
      this._scheduleSlideshowRotation(`${source}-active`);
      return;
    }
    const idx = this._cameraIndexByEntity(nextReview.entity);
    if (idx < 0) return;
    this._slideshowPendingAlertCam = "";
    this._slideshowPendingAlertType = "";
    void this._switchCamera(idx, { source: "alert" });
    this._scheduleSlideshowRotation(`${source}-switch`);
  }
  async _probeLatestSlideshowReview() {
    if (!this._slideshowActive || !this._isSlideshowRotationAvailable() || this._slideshowReviewProbeInFlight)
      return;
    this._slideshowReviewProbeInFlight = true;
    try {
      const before = Math.floor(Date.now() / 1e3);
      const after = Math.max(
        0,
        Math.floor(before - (this._config?.alerts_reviews_days || 3) * DAY)
      );
      const candidates = [];
      for (const camera of this._config?.cameras || []) {
        const entity = camera?.entity || "";
        const cache = this._camCache[entity];
        if (!entity || !cache?.clientId || !cache?.cam) continue;
        let reviews = [];
        try {
          const batch = await this._ws({
            type: "frigate/reviews/get",
            instance_id: cache.clientId,
            cameras: [cache.cam],
            after,
            before,
            limit: 5
          });
          reviews = Array.isArray(batch) ? batch : [];
        } catch (_) {
          reviews = [];
        }
        for (const review of reviews) {
          if (!this._isSlideshowReviewFresh(review)) continue;
          const severity = this._normalizeReviewSeverity(review);
          if (!this._shouldHandleSlideshowReview(entity, severity)) continue;
          const reviewId = String(review?.id || "").trim();
          if (reviewId && this._slideshowHandledReviewIds.has(reviewId))
            continue;
          candidates.push({
            entity,
            severity,
            reviewId,
            startTime: this._reviewStartTimeSec(review)
          });
          break;
        }
      }
      if (!candidates.length) return;
      candidates.sort((a, b) => b.startTime - a.startTime);
      const next = candidates[0];
      if (!next?.entity) return;
      if (next.reviewId) this._rememberHandledSlideshowReview(next.reviewId);
      if (this._slideshowPopupPaused) {
        this._slideshowPendingAlertCam = next.entity;
        this._slideshowPendingAlertType = next.severity;
        this._setSlideshowAlertState(next.severity);
        return;
      }
      const activeEntity = this._activeCam?.entity || "";
      this._slideshowLastAlertAt = Date.now();
      this._slideshowLastAlertCam = next.entity;
      this._slideshowPausedUntil = Date.now() + this._slideshowRotationMs();
      this._setSlideshowAlertState(next.severity);
      if (next.entity === activeEntity) {
        this._scheduleSlideshowRotation("probe-active-review");
        return;
      }
      const idx = this._cameraIndexByEntity(next.entity);
      if (idx < 0) return;
      this._slideshowPendingAlertCam = "";
      this._slideshowPendingAlertType = "";
      void this._switchCamera(idx, { source: "alert" });
      this._scheduleSlideshowRotation("probe-review-switch");
    } finally {
      this._slideshowReviewProbeInFlight = false;
    }
  }
  _scheduleSlideshowReviewProbe(delayMs = 180) {
    if (!this._slideshowActive || !this._isSlideshowRotationAvailable()) return;
    if (this._slideshowReviewProbeT) clearTimeout(this._slideshowReviewProbeT);
    this._slideshowReviewProbeT = setTimeout(
      () => {
        this._slideshowReviewProbeT = null;
        void this._probeLatestSlideshowReview();
      },
      Math.max(0, Number(delayMs) || 0)
    );
  }
  _slideshowReviewWatchIntervalMs() {
    const realtimePollMs = Math.floor(
      this._effectiveRealtimePollSeconds() * 1e3
    );
    return Math.max(
      SLIDESHOW_REVIEW_WATCH_MIN_MS,
      Math.min(SLIDESHOW_REVIEW_WATCH_MAX_MS, realtimePollMs)
    );
  }
  _scheduleSlideshowReviewWatch(delayMs = null) {
    if (!this._slideshowActive || !this._isSlideshowRotationAvailable()) return;
    if (this._slideshowReviewWatchT) clearTimeout(this._slideshowReviewWatchT);
    const wait = delayMs == null ? this._slideshowReviewWatchIntervalMs() : Math.max(0, Number(delayMs) || 0);
    this._slideshowReviewWatchT = setTimeout(() => {
      this._slideshowReviewWatchT = null;
      void this._probeLatestSlideshowReview().finally(() => {
        this._scheduleSlideshowReviewWatch();
      });
    }, wait);
  }
  _cameraIndexByEntity(entity) {
    if (!entity) return -1;
    return this._config?.cameras?.findIndex((camera) => camera.entity === entity) ?? -1;
  }
  async _advanceSlideshowRotation() {
    if (!this._slideshowActive || !this._isSlideshowRotationAvailable()) return;
    if (this._slideshowPopupPaused) return;
    const pendingAlertCam = this._slideshowPendingAlertCam;
    const pendingAlertType = this._slideshowPendingAlertType;
    this._slideshowPendingAlertCam = "";
    this._slideshowPendingAlertType = "";
    const activeEntity = this._activeCam?.entity || "";
    const currentIndex = this._cameraIndexByEntity(activeEntity);
    const nextIndex = pendingAlertCam && pendingAlertCam !== activeEntity ? this._cameraIndexByEntity(pendingAlertCam) : currentIndex >= 0 ? (currentIndex + 1) % this._config.cameras.length : 0;
    const targetIndex = nextIndex >= 0 ? nextIndex : 0;
    const targetEntity = this._config?.cameras?.[targetIndex]?.entity || "";
    if (!targetEntity) {
      this._scheduleSlideshowRotation("missing-target");
      return;
    }
    await this._switchCamera(targetIndex, {
      source: pendingAlertCam ? "alert" : "slideshow"
    });
    this._slideshowPausedUntil = Date.now() + this._slideshowRotationMs();
    this._setSlideshowAlertState(pendingAlertCam ? pendingAlertType : "");
    this._scheduleSlideshowRotation("advance");
  }
  _extractRealtimeMessageCamera(msg) {
    return String(
      msg?.camera || msg?.event?.camera || msg?.review?.camera || msg?.after?.camera || msg?.before?.camera || ""
    ).trim();
  }
  _extractRealtimeMessageSeverity(msg) {
    const type = String(msg?.type || "").trim().toLowerCase();
    return String(
      msg?.severity || msg?.event?.severity || msg?.event?.data?.severity || msg?.review?.severity || msg?.review?.data?.severity || msg?.after?.severity || msg?.after?.data?.severity || msg?.before?.severity || msg?.before?.data?.severity || (type.includes("detection") ? "detection" : "")
    ).trim().toLowerCase();
  }
  _handleSlideshowRealtimeMessage(msg) {
    if (!this._slideshowActive || !this._isSlideshowRotationAvailable()) return;
    this._scheduleSlideshowReviewProbe();
    const incomingCam = this._extractRealtimeMessageCamera(msg);
    if (!incomingCam) return;
    const cam = this._cameraEntityForIncomingCamera(incomingCam);
    if (!cam) return;
    const severity = this._extractRealtimeMessageSeverity(msg);
    if (!this._shouldHandleSlideshowReview(cam, severity)) return;
    if (this._slideshowPopupPaused) {
      this._slideshowPendingAlertCam = cam;
      this._slideshowPendingAlertType = severity;
      this._setSlideshowAlertState(severity);
      return;
    }
    const now = Date.now();
    const activeEntity = this._activeCam?.entity || "";
    this._slideshowLastAlertAt = now;
    this._slideshowLastAlertCam = cam;
    if (cam === activeEntity) {
      this._slideshowPendingAlertCam = "";
      this._slideshowPendingAlertType = "";
      this._slideshowPausedUntil = now + this._slideshowRotationMs();
      this._setSlideshowAlertState(severity);
      this._scheduleSlideshowRotation("active-alert");
      return;
    }
    const idx = this._cameraIndexByEntity(cam);
    if (idx < 0) return;
    this._slideshowPausedUntil = now + this._slideshowRotationMs();
    this._slideshowPendingAlertCam = "";
    this._slideshowPendingAlertType = "";
    this._setSlideshowAlertState(severity);
    void this._switchCamera(idx, { source: "alert" });
    this._scheduleSlideshowRotation("alert-switch");
  }
  // ── camera switching ──────────────────────────────────────
  async _switchCamera(idx, opts = {}) {
    const source = String(opts?.source || "manual");
    if (source === "manual") {
      if (this._slideshowActive) {
        this._stopSlideshowRotation("manual-camera-select");
      } else {
        this._pauseSlideshowForInteraction();
      }
    }
    if (this._viewMode === "grid") {
      if (this._gridRotationT) clearTimeout(this._gridRotationT);
      this._gridRotationT = null;
      if (this._gridAlertWatchT) clearTimeout(this._gridAlertWatchT);
      this._gridAlertWatchT = null;
      if (opts?.keepGridResume !== true) {
        this._gridResumePending = false;
        if (this._gridAlertReturnT) clearTimeout(this._gridAlertReturnT);
        this._gridAlertReturnT = null;
        this._setSlideshowAlertState("");
      }
    }
    const popupOpen = this._$("#myPopup")?.classList.contains("is-open");
    if (idx === this._activeCamIdx && this._viewMode === "single" && !popupOpen)
      return;
    const useTransition = source === "slideshow" || source === "alert";
    const engWrap = this._$("#eng-wrap");
    if (useTransition && engWrap) {
      engWrap.classList.add("slideshow-switching");
      clearTimeout(this._slideshowFadeT);
      this._slideshowFadeT = setTimeout(() => {
        engWrap.classList.remove("slideshow-switching");
        this._slideshowFadeT = null;
      }, 260);
    }
    const prevEnt = this._activeCam?.entity;
    if (prevEnt && this._camCache[prevEnt]) {
      this._camCache[prevEnt].events = this._events;
      this._camCache[prevEnt].recordings = this._recordings;
      this._camCache[prevEnt].reviews = this._reviews;
      this._camCache[prevEnt].kept = this._kept;
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
    this._viewMode = "single";
    if (popupOpen) this._closePopup();
    if (engWrap) engWrap.style.display = "";
    this.shadowRoot.querySelectorAll("[data-viewmode]").forEach(
      (p) => p.classList.toggle("active", p.dataset.viewmode === "single")
    );
    this._syncTabsShell();
    this._renderCamSwitcher();
    this._syncStatus();
    this._renderStats();
    this._normalizeFilterSelections();
    if (this._$("#filter-panel")?.style.display !== "none") {
      this._renderFilter();
    }
    this._renderList();
    this._streamMuted = true;
    this._renderMuteButton();
    this._cancelPendingMount("switch-camera", { preserveMseEntity: prevEnt });
    this._mountEngine();
    clearTimeout(this._switchLoadT);
    this._loadWindow(true);
    this._applyCalendarActivityCacheForActiveCamera();
    void this._prefetchCalendarActivityForActiveCamera();
    if (this._$("cal-panel")?.style.display !== "none") {
      this._renderCal();
    }
    this._syncToolbarButtons();
  }
  // ── data ─────────────────────────────────────────────────
  _cc() {
    return this._camCache[this._activeCam?.entity] || mkCamState();
  }
  async _ws(p) {
    return parseWs(await this._hass.callWS(p));
  }
  _isNowWindow() {
    return this._followNowWindow;
  }
  async _fetchWindowedEvents(clientId, cam, after, before, opts = {}) {
    const items = [];
    const seen = new Set();
    const afterTs = Math.floor(after);
    let cursorBefore = Math.floor(
      Number.isFinite(opts?.cursorBefore) ? opts.cursorBefore : before
    );
    const pageLimit = Math.max(
      1,
      Number.isFinite(opts?.pageLimit) ? Math.floor(opts.pageLimit) : WINDOW_FETCH_PAGE_LIMIT
    );
    const batchLimit = Math.max(
      1,
      Number.isFinite(opts?.limit) ? Math.floor(opts.limit) : EVENT_FETCH_BATCH
    );
    const onPage = typeof opts?.onPage === "function" ? opts.onPage : null;
    let pagesFetched = 0;
    for (let page = 0; page < pageLimit; page++) {
      const batch = await this._ws({
        type: "frigate/events/get",
        instance_id: clientId,
        cameras: [cam],
        after: afterTs,
        before: cursorBefore,
        limit: batchLimit
      });
      if (!Array.isArray(batch) || !batch.length) break;
      pagesFetched += 1;
      for (const item of batch) {
        if (!item?.id || seen.has(item.id)) continue;
        seen.add(item.id);
        items.push(item);
      }
      onPage?.(items, {
        page,
        done: false
      });
      const oldest = Math.min(
        ...batch.map((item) => Math.floor(item?.start_time || before))
      );
      if (batch.length < batchLimit || oldest <= afterTs) break;
      cursorBefore = oldest - 1;
    }
    onPage?.(items, { page: -1, done: true });
    return items;
  }
  async _warmOtherCamerasEvents() {
    const token = ++this._warmCamsToken;
    const activeEntity = this._activeCam?.entity;
    const after = this._winStart;
    const before = this._winEnd;
    for (const camera of this._config.cameras) {
      if (camera.entity === activeEntity) continue;
      const entity = camera.entity;
      const cache = this._camCache[entity];
      if (!cache?.clientId || !cache?.cam) continue;
      if (Array.isArray(cache.events) && cache.events.length >= INACTIVE_WARM_EVENT_LIMIT) {
        continue;
      }
      try {
        const events = await this._fetchWindowedEvents(
          cache.clientId,
          cache.cam,
          after,
          before,
          {
            pageLimit: INITIAL_EVENTS_PAGE_LIMIT,
            limit: INACTIVE_WARM_EVENT_LIMIT,
            debugLabel: "warm-cache"
          }
        );
        if (token !== this._warmCamsToken) return;
        if (after !== this._winStart || before !== this._winEnd) return;
        cache.events = Array.isArray(events) ? events.slice(0, INACTIVE_WARM_EVENT_LIMIT) : [];
      } catch (_) {
      }
    }
  }
  _scheduleWarmOtherCamerasEvents(delayMs = 1e3) {
    if (this._warmOtherCamsDelayT) clearTimeout(this._warmOtherCamsDelayT);
    this._warmOtherCamsDelayT = setTimeout(
      () => {
        this._warmOtherCamsDelayT = null;
        if (!this.isConnected) return;
        void this._warmOtherCamerasEvents();
      },
      Math.max(0, Number(delayMs) || 0)
    );
  }
  _pruneNonActiveCamWindowCaches() {
    this._warmCamsToken++;
    const activeEntity = this._activeCam?.entity;
    for (const camera of this._config.cameras) {
      const entity = camera.entity;
      if (entity === activeEntity) continue;
      const cache = this._camCache[entity];
      if (!cache) continue;
      cache.events = [];
      cache.recordings = [];
      cache.reviews = [];
    }
  }
  async _fetchWindowedReviews(clientId, cam, after, before, opts = {}) {
    const items = [];
    const seen = new Set();
    const afterTs = Math.floor(after);
    let cursorBefore = Math.floor(
      Number.isFinite(opts?.cursorBefore) ? opts.cursorBefore : before
    );
    const pageLimit = Math.max(
      1,
      Number.isFinite(opts?.pageLimit) ? Math.floor(opts.pageLimit) : WINDOW_FETCH_PAGE_LIMIT
    );
    const onPage = typeof opts?.onPage === "function" ? opts.onPage : null;
    let pagesFetched = 0;
    for (let page = 0; page < pageLimit; page++) {
      const batch = await this._ws({
        type: "frigate/reviews/get",
        instance_id: clientId,
        cameras: [cam],
        after: afterTs,
        before: cursorBefore,
        limit: REVIEW_FETCH_BATCH
      });
      if (!Array.isArray(batch) || !batch.length) break;
      pagesFetched += 1;
      for (const item of batch) {
        if (!item?.id || seen.has(item.id)) continue;
        seen.add(item.id);
        items.push(item);
      }
      onPage?.(items, {
        page,
        done: false
      });
      const oldest = Math.min(
        ...batch.map((item) => Math.floor(item?.start_time || before))
      );
      if (batch.length < REVIEW_FETCH_BATCH || oldest <= afterTs) break;
      cursorBefore = oldest - 1;
    }
    onPage?.(items, { page: -1, done: true });
    return items;
  }
  async _loadWindow(replace) {
    if (this._isPreviewPageActive()) return;
    if (this._loading) return;
    this._loading = true;
    this._reloadPending = false;
    this._reloadAfterLoad = false;
    if (replace) this._exhausted = false;
    if (this._followNowWindow) {
      const now = Math.floor(Date.now() / 1e3);
      this._winEnd = now;
      this._winStart = now - this._config.window_days * DAY;
    }
    const { clientId, cam } = this._cc();
    if (!clientId || !cam) {
      this._loading = false;
      return;
    }
    const after = this._winStart, before = this._winEnd;
    const eventsTask = this._loadWindowEvents(clientId, cam, after, before);
    await Promise.allSettled([
      eventsTask,
      this._tab === "recordings" ? this._loadWindowRecordings(clientId, cam, before) : Promise.resolve(),
      (async () => {
        await eventsTask;
        await this._loadWindowReviewsIfNeeded(clientId, cam, after, before);
      })()
    ]);
    const ent = this._activeCam?.entity;
    if (ent && this._camCache[ent]) {
      this._camCache[ent].events = this._events;
      this._camCache[ent].recordings = this._recordings;
    }
    this._loading = false;
    if (this._reloadAfterLoad) {
      this._reloadAfterLoad = false;
      this._scheduleReload();
    }
    this._consumeDeepLinkReviewOpen();
    this._consumeDeepLinkEventOpen();
    if (this._eventsMode === "all") this._loadAllCamsBackground();
    this._renderAll();
  }
  _cacheActiveCamSlice(key, value) {
    const entity = this._activeCam?.entity;
    if (entity && this._camCache[entity]) {
      this._camCache[entity][key] = value;
    }
  }
  async _loadWindowEvents(clientId, cam, after, before) {
    const loadToken = ++this._eventsLoadToken;
    try {
      const initialEvents = await this._fetchWindowedEvents(
        clientId,
        cam,
        after,
        before,
        {
          pageLimit: INITIAL_EVENTS_PAGE_LIMIT,
          limit: INITIAL_EVENT_FETCH_LIMIT,
          debugLabel: "initial"
        }
      );
      this._events = Array.isArray(initialEvents) ? initialEvents : [];
      this._cacheActiveCamSlice("events", this._events);
      this._renderList();
      this._renderStats();
      if (!this._events.length || WINDOW_FETCH_PAGE_LIMIT <= INITIAL_EVENTS_PAGE_LIMIT) {
        return;
      }
      const oldest = Math.min(
        ...this._events.map((item) => Math.floor(item?.start_time || before))
      );
      const cursorBefore = oldest - 1;
      const activeEntity = this._activeCam?.entity;
      const winStart = this._winStart;
      const winEnd = this._winEnd;
      void (async () => {
        try {
          const remainingEvents = await this._fetchWindowedEvents(
            clientId,
            cam,
            after,
            before,
            {
              pageLimit: Math.min(
                WINDOW_BACKGROUND_PAGE_LIMIT,
                Math.max(
                  1,
                  WINDOW_FETCH_PAGE_LIMIT - INITIAL_EVENTS_PAGE_LIMIT
                )
              ),
              cursorBefore,
              debugLabel: "background"
            }
          );
          if (loadToken !== this._eventsLoadToken) return;
          if (activeEntity !== this._activeCam?.entity) return;
          if (winStart !== this._winStart || winEnd !== this._winEnd) return;
          if (Array.isArray(remainingEvents) && remainingEvents.length) {
            this._events = this._events.concat(remainingEvents);
            this._cacheActiveCamSlice("events", this._events);
            this._renderList();
            this._renderStats();
          }
        } catch (_) {
        }
      })();
    } catch (error) {
      console.error("[Frigate] events", error);
      this._events = [];
    }
  }
  async _loadWindowRecordings(clientId, cam, before) {
    const bounds = this._recordingsDayBounds(before);
    const cacheKey = `${clientId}|${cam}|${bounds.start}|${bounds.end}`;
    try {
      const recordings = await this._ws({
        type: "frigate/recordings/get",
        instance_id: clientId,
        camera: cam,
        after: Math.max(0, bounds.start),
        before: bounds.end
      });
      this._recordings = Array.isArray(recordings) ? recordings : [];
      this._recordingsDayDataCache.set(cacheKey, this._recordings);
      this._recordingsDayAvailabilityCache.set(
        cacheKey,
        this._recordings.length > 0
      );
      this._cacheActiveCamSlice("recordings", this._recordings);
      this._renderList();
    } catch (_) {
      this._recordings = [];
    }
  }
  async _loadWindowReviewsIfNeeded(clientId, cam, after, before) {
    if (this._tab !== "alerts") return;
    const loadToken = ++this._reviewsLoadToken;
    const reviewsAfter = Math.max(
      0,
      Math.floor(before - (this._config?.alerts_reviews_days || 3) * DAY)
    );
    try {
      const initialReviews = await this._fetchWindowedReviews(
        clientId,
        cam,
        reviewsAfter,
        before,
        {
          pageLimit: INITIAL_EVENTS_PAGE_LIMIT,
          debugLabel: "alerts-window-initial"
        }
      );
      this._reviews = Array.isArray(initialReviews) ? initialReviews : [];
      this._cacheActiveCamSlice("reviews", this._reviews);
      this._renderList();
      this._handleSlideshowReviewsUpdated(
        this._activeCam?.entity || "",
        this._reviews,
        "alerts-window-initial"
      );
      if (!this._reviews.length || WINDOW_FETCH_PAGE_LIMIT <= INITIAL_EVENTS_PAGE_LIMIT) {
        return;
      }
      const oldest = Math.min(
        ...this._reviews.map((item) => Math.floor(item?.start_time || before))
      );
      const cursorBefore = oldest - 1;
      const activeEntity = this._activeCam?.entity;
      const winStart = this._winStart;
      const winEnd = this._winEnd;
      void (async () => {
        try {
          const remainingReviews = await this._fetchWindowedReviews(
            clientId,
            cam,
            reviewsAfter,
            before,
            {
              pageLimit: Math.min(
                WINDOW_BACKGROUND_PAGE_LIMIT,
                Math.max(
                  1,
                  WINDOW_FETCH_PAGE_LIMIT - INITIAL_EVENTS_PAGE_LIMIT
                )
              ),
              cursorBefore,
              debugLabel: "alerts-window-background"
            }
          );
          if (loadToken !== this._reviewsLoadToken) return;
          if (activeEntity !== this._activeCam?.entity) return;
          if (winStart !== this._winStart || winEnd !== this._winEnd) return;
          if (Array.isArray(remainingReviews) && remainingReviews.length) {
            this._reviews = this._reviews.concat(remainingReviews);
            this._cacheActiveCamSlice("reviews", this._reviews);
            this._renderList();
            this._handleSlideshowReviewsUpdated(
              this._activeCam?.entity || "",
              this._reviews,
              "alerts-window-background"
            );
          }
        } catch (_) {
        }
      })();
    } catch (_) {
      this._reviews = [];
    }
  }
  async _loadKept() {
    const { clientId, cam } = this._cc();
    try {
      const k = await this._ws({
        type: "frigate/events/get",
        instance_id: clientId,
        cameras: [cam],
        favorites: true,
        limit: 50
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
      const before = this._winEnd;
      const after = Math.max(
        0,
        Math.floor(before - (this._config?.alerts_reviews_days || 3) * DAY)
      );
      const r = await this._fetchWindowedReviews(clientId, cam, after, before, {
        debugLabel: "alerts-tab"
      });
      this._reviews = Array.isArray(r) ? r : [];
      this._cacheActiveCamSlice("reviews", this._reviews);
      this._handleSlideshowReviewsUpdated(
        this._activeCam?.entity || "",
        this._reviews,
        "alerts-tab"
      );
    } catch (_) {
      this._reviews = [];
    }
  }
  async _loadCalendar() {
    await this._prefetchCalendarActivityForActiveCamera();
  }
  _calendarActivityCacheKey(clientId, cam, tz = this._tz()) {
    return `${clientId || ""}|${cam || ""}|${tz || "UTC"}`;
  }
  _applyCalendarActivityCacheForActiveCamera() {
    const { clientId, cam } = this._cc();
    const key = this._calendarActivityCacheKey(clientId, cam);
    const cached = this._calendarActivityByCam.get(key);
    this._daysWithActivity = cached ? new Set(cached) : new Set();
  }
  async _prefetchCalendarActivityForActiveCamera() {
    const { clientId, cam } = this._cc();
    if (!clientId || !cam) {
      this._daysWithActivity = new Set();
      return;
    }
    const tz = this._tz();
    const key = this._calendarActivityCacheKey(clientId, cam, tz);
    const cached = this._calendarActivityByCam.get(key);
    if (cached) {
      this._daysWithActivity = new Set(cached);
      return;
    }
    const existing = this._calendarActivityInFlight.get(key);
    if (existing) {
      await existing;
      return;
    }
    const task = (async () => {
      try {
        const sum = await this._ws({
          type: "frigate/events/summary",
          instance_id: clientId,
          timezone: tz
        });
        const days = Array.isArray(sum) ? new Set(
          sum.filter((s) => s.camera === cam && s.day).map((s) => s.day)
        ) : new Set();
        this._calendarActivityByCam.set(key, days);
        const active = this._cc();
        const activeKey = this._calendarActivityCacheKey(
          active.clientId,
          active.cam,
          tz
        );
        if (activeKey === key) {
          this._daysWithActivity = new Set(days);
          if (this._$("cal-panel")?.style.display !== "none") {
            this._renderCal();
          }
        }
      } catch (_) {
      }
    })();
    this._calendarActivityInFlight.set(key, task);
    try {
      await task;
    } finally {
      this._calendarActivityInFlight.delete(key);
    }
  }
  _tz() {
    return this._hass?.config?.time_zone || Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
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
      hourCycle: "h23"
    });
    const parts = dtf.formatToParts(new Date(epochMs));
    const pick = (type) => Number(parts.find((p) => p.type === type)?.value || 0);
    const y = pick("year");
    const m = pick("month");
    const d = pick("day");
    const hh = pick("hour");
    const mm = pick("minute");
    const ss = pick("second");
    const asUtcMs = Date.UTC(y, m - 1, d, hh, mm, ss);
    return (asUtcMs - epochMs) / 6e4;
  }
  _tzDateTimeToEpochSeconds(y, mo, d, hh = 0, mm = 0, ss = 0) {
    let epochMs = Date.UTC(y, mo - 1, d, hh, mm, ss);
    for (let i = 0; i < 3; i++) {
      const offMin = this._tzOffsetMinutesAt(epochMs);
      epochMs = Date.UTC(y, mo - 1, d, hh, mm, ss) - offMin * 6e4;
    }
    return Math.floor(epochMs / 1e3);
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
      hourCycle: "h23"
    });
    const parts = dtf.formatToParts(new Date(tsSec * 1e3));
    const pick = (type) => Number(parts.find((p) => p.type === type)?.value || 0);
    return {
      year: pick("year"),
      month: pick("month"),
      day: pick("day"),
      hour: pick("hour"),
      minute: pick("minute"),
      second: pick("second")
    };
  }
  async _subscribe() {
    const { clientId } = this._cc();
    if (!this._hass?.connection || !clientId) return;
    try {
      this._unsub = this._hass.connection.subscribeMessage(
        (msg) => {
          this._handleGridRealtimeMessage(msg);
          this._handlePreviewRealtimeMessage(msg);
          this._handleSlideshowRealtimeMessage(msg);
          if (!this._isNowWindow()) return;
          if (!this._isRealtimeEventMessage(msg)) return;
          this._scheduleReload(REALTIME_RELOAD_DEBOUNCE_MS);
        },
        { type: "frigate/events/subscribe", instance_id: clientId }
      );
    } catch (_) {
    }
  }
  async _pollLatestEventHead() {
    if (!this._isNowWindow()) return;
    if (this._loading) return;
    const { clientId, cam } = this._cc();
    if (!clientId || !cam) return;
    const now = Math.floor(Date.now() / 1e3);
    const after = now - this._config.window_days * DAY;
    try {
      const latest = await this._ws({
        type: "frigate/events/get",
        instance_id: clientId,
        cameras: [cam],
        after,
        before: now,
        limit: 1
      });
      if (!Array.isArray(latest) || !latest.length) return;
      const newestId = latest[0]?.id;
      if (!newestId) return;
      const currentId = this._events?.[0]?.id;
      if (newestId !== currentId) {
        this._scheduleReload(REALTIME_RELOAD_DEBOUNCE_MS);
      }
    } catch (_) {
    }
  }
  _isRealtimeEventMessage(msg) {
    if (!msg || typeof msg !== "object") return false;
    const type = String(msg.type || "").toLowerCase();
    if (!type) return false;
    if (type === "end") return true;
    if (!type.includes("event") && !type.includes("review") && !type.includes("detection") && type !== "new" && type !== "update") {
      return false;
    }
    if (this._eventsMode === "all") return true;
    const activeCam = this._cc().cam;
    const messageCam = msg.camera || msg?.event?.camera || msg?.review?.camera || msg?.after?.camera || msg?.before?.camera;
    if (!messageCam) return true;
    return String(messageCam) === String(activeCam);
  }
  _scheduleReload(delayMs = 1500) {
    if (this._isPreviewPageActive()) return;
    this._reloadPending = true;
    clearTimeout(this._rt);
    this._rt = setTimeout(
      () => {
        if (!this._reloadPending) return;
        if (this._loading) {
          this._reloadAfterLoad = true;
          return;
        }
        this._reloadPending = false;
        this._loadWindow(true);
      },
      Math.max(0, Number(delayMs) || 0)
    );
  }
  _buildTabsMarkup() {
    const ht = new Set(this._config.hidden_tabs || []);
    const gridModeListOnly = this._viewMode === "grid";
    const tabOrder = gridModeListOnly ? ["alerts", "kept"] : ["alerts", "clips", "snapshot", "recordings", "kept"];
    const activeTab = resolveActiveTab(this._tab, ht, tabOrder);
    this._tab = activeTab;
    const tab = (id, icon, label) => ht.has(id) || gridModeListOnly && ["clips", "snapshot", "recordings"].includes(id) ? "" : id === activeTab ? `<div class="donut active" data-tab="${id}" title="${label}">${icon}</div>` : `<div class="donut" data-tab="${id}" title="${label}">${icon}</div>`;
    const filterDisabled = this._tab === "recordings";
    const gridHidden = !this._isGridModeAvailable();
    const gridActive = this._viewMode === "grid";
    const gridButton = gridHidden ? "" : `<button class="tool${gridActive ? " active" : ""}" id="grid-btn" aria-pressed="${gridActive ? "true" : "false"}" title="${gridActive ? "Stop grid mode" : "Start grid mode"}" aria-label="${gridActive ? "Stop grid mode" : "Start grid mode"}">${this._gridButtonIcon()}</button>`;
    const slideshowHidden = !this._isSlideshowRotationAvailable();
    const slideshowActive = this._slideshowActive;
    const slideshowButton = slideshowHidden ? "" : `<button class="tool slideshow-btn${slideshowActive ? " active" : ""}" id="slideshow-btn" aria-pressed="${slideshowActive ? "true" : "false"}" title="${slideshowActive ? "Stop slideshow rotation" : "Start slideshow rotation"}" aria-label="${slideshowActive ? "Stop slideshow rotation" : "Start slideshow rotation"}">${this._slideshowButtonIcon()}</button>`;
    return `${tab("alerts", ICONS.alerts, "Alerts")}
      ${tab("clips", ICONS.clips, "Clips")}
      ${tab("snapshot", ICONS.snapshot, "Snapshots")}
      ${tab("recordings", ICONS.recordings, "Recordings")}
      ${tab("kept", ICONS.star, "Kept events")}
      <div class="tl-tools" style=" margin-left: auto;">
        <button class="tool" id="now-btn" title="Today">${ICONS.bullseye}</button>
        ${gridButton}
        ${slideshowButton}
        <button class="tool" id="filter-btn" title="Filter" ${filterDisabled ? "disabled" : ""}>${ICONS.filter}</button>
        <button class="tool" id="cal-btn" title="Calendar">${ICONS.calendar}</button>
      </div>`;
  }
  _syncTabsShell() {
    const tabs = this._$(".tabs");
    if (!tabs) return;
    const prevTab = this._tab;
    tabs.innerHTML = this._buildTabsMarkup();
    [
      "#grid-btn",
      "#slideshow-btn",
      "#filter-btn",
      "#cal-btn",
      "#now-btn"
    ].forEach((sel) => {
      delete this._domCache[sel];
    });
    if (this._tab !== prevTab) {
      void this._loadTabData(this._tab);
    }
  }
  async _loadTabData(tab) {
    if (tab !== "alerts" && tab !== "kept" && tab !== "recordings") return;
    try {
      if (tab === "alerts") await this._loadReviews();
      if (tab === "kept") await this._loadKept();
      if (this._isGridMixedListMode() && (tab === "alerts" || tab === "kept")) {
        await this._loadGridMixedTabData(tab);
      }
      if (tab === "recordings") {
        const { clientId, cam } = this._cc();
        if (clientId && cam) {
          await this._loadWindowRecordings(clientId, cam, this._winEnd);
        }
      }
    } catch (error) {
      console.error("[Frigate] tab data load failed", error);
    } finally {
      this._renderList();
    }
  }
  _isGridMixedListMode() {
    return this._viewMode === "grid";
  }
  _allGridReviews() {
    const reviews = [];
    const seen = new Set();
    for (const camera of this._config.cameras || []) {
      const cache = this._camCache[camera.entity];
      for (const review of cache?.reviews || []) {
        const id = String(review?.id || "");
        if (!id || seen.has(id)) continue;
        seen.add(id);
        reviews.push(review);
      }
    }
    return reviews;
  }
  _allGridKeptEvents() {
    const events = [];
    const seen = new Set();
    for (const camera of this._config.cameras || []) {
      const cache = this._camCache[camera.entity];
      for (const event of cache?.kept || []) {
        const id = String(event?.id || "");
        if (!id || seen.has(id)) continue;
        seen.add(id);
        events.push(event);
      }
    }
    return events;
  }
  _findReviewById(id) {
    if (!id) return null;
    const target = String(id);
    if (this._isGridMixedListMode()) {
      return this._allGridReviews().find(
        (review) => String(review?.id || "") === target
      ) || null;
    }
    return (this._reviews || []).find(
      (review) => String(review?.id || "") === target
    ) || null;
  }
  async _loadGridMixedTabData(tab) {
    const before = this._winEnd;
    const reviewsAfter = Math.max(
      0,
      Math.floor(before - (this._config?.alerts_reviews_days || 3) * DAY)
    );
    for (const camera of this._config.cameras || []) {
      const entity = camera.entity;
      if (!entity) continue;
      try {
        if (!this._camCache[entity]?.discovered)
          await this._discoverOne(entity);
      } catch (_) {
        continue;
      }
      const cache = this._camCache[entity];
      const clientId = cache?.clientId;
      const cam = cache?.cam;
      if (!clientId || !cam) continue;
      try {
        if (tab === "alerts") {
          const reviews = await this._fetchWindowedReviews(
            clientId,
            cam,
            reviewsAfter,
            before,
            { debugLabel: "grid-alerts-tab" }
          );
          cache.reviews = Array.isArray(reviews) ? reviews : [];
        }
        if (tab === "kept") {
          const kept = await this._ws({
            type: "frigate/events/get",
            instance_id: clientId,
            cameras: [cam],
            favorites: true,
            limit: 50
          });
          cache.kept = Array.isArray(kept) ? kept : [];
        }
      } catch (_) {
      }
    }
  }
  // =======================Render Shell===================================
  _renderShell() {
    const title = this._config.title || (this._config.cameras.length === 1 ? cap(camDisplayName(this._config.cameras[0])) : "Cameras") || "Camera";
    const subtitle = this._subtitleText();
    const showCamSwitcher = this._config.cameras.length > 1 || this._isPreviewPageEnabled();
    const camSwitcher = showCamSwitcher ? `<div class="cam-switcher" id="cam-switcher">${this._camSwitcherMarkup({ includeStatus: false })}</div>` : "";
    const pageNav = this._pageNavMarkup();
    this.shadowRoot.innerHTML = `<style>${STYLES}</style>
    <ha-card class="card ${this._cardStateClassNames()}" id="card" style="border-radius: var(--fvc-border-radius);">

        <div class="layout" id="layout">

          <div class="preview-shell-header" id="preview-shell-header">
            <div class="preview-shell-title">
              <div class="preview-shell-title-main" id="preview-shell-title">${title}</div>
              <div class="preview-shell-title-sub" id="preview-shell-subtitle">${subtitle}</div>
            </div>
            ${pageNav}
          </div>
          <div class="preview-shell" id="preview-shell"></div>
          <div class="preview-shell-footer" id="preview-shell-footer">
            <div class="frigate-view">${ICONS.frigateview}</div>
          </div>

          <div class="col-left" id="col-left">
              <div id="eng-wrap">
                <div id="engine">
                  <div class="ph">${ICONS.live}<span>Connecting\u2026</span></div>
                </div>
                  <button class="glass-btn overlay-fs live-fs-btn" id="live-fs-btn" title="Fullscreen live" aria-label="Fullscreen live">${ICONS.expand}</button>
                  <button class="glass-btn mute-btn" id="mute-btn" title="${this._streamMuted ? "Unmute live view" : "Mute live view"}" aria-label="${this._streamMuted ? "Unmute live view" : "Mute live view"}">${this._streamMuted ? ICONS.volOff : ICONS.volOn}</button>
                  <div class="glass-btn slideshow-next-chip" id="slideshow-next-chip" hidden>Next Slide: 0s</div>
                  <div id="stream-fallback" hidden>
                    <img id="stream-fallback-img" alt="Camera snapshot">
                  </div>
                  <div class="stream-fallback-status" id="stream-fallback-status" hidden>Snapshot unavailable</div>
                  <div class="stream-loading" id="stream-loading" hidden>
                    <span class="dot"></span><span class="label">Loading\u2026</span>
                  </div>
              </div>

            <div class="info-row">
              <div>
                <div class="info-title" id="info-title">${title}</div>
                <span class="section-label" id="tl-range">${subtitle}</span>
              </div>
              <div class="stats">
                <div class="stat">
                  <div class="sv">v${VERSION}</div>
                  <div class="sl">Version</div>
                </div>
                <div class="stat">
                  <div class="sv stream-type" id="stream-type">--</div>
                  <div class="sl">Stream</div>
                </div>
                <div class="stat">
                  <div class="sv" id="ev-count">\u2014</div>
                  <div class="sl">Events</div>
                </div>
                <div class="stat">
                  <div class="sv" id="on-dot" style="color:var(--c-on)">\u25CF</div>
                  <div class="sl" id="on-lbl">Online</div>
                </div>
              </div>
            </div>
            ${pageNav}
            ${camSwitcher}
          </div>
          <div class="resize-handle" id="resize-handle"></div>
          <div class="col-right" id="col-right">
            <div class="frigate-view">${ICONS.frigateview}</div>
            <div class="tabs-holder"> 
              <div class="tabs shadow-small">            
                ${this._buildTabsMarkup()}              
              </div>
              <div class="filter-panel" id="filter-panel" style="display:none"></div>
              <div class="cal-panel" id="cal-panel" style="display:none"></div>
            </div>
            <div class="browse-head" id="browse-head" style="display:none">
              <div class="browse-head-left">
                <button class="prev-next" id="rec-day-prev" data-rec-day-nav="-1" title="Previous day" aria-label="Previous day" style="display:none">${ICONS.left}Previous</button>
              </div>
              <div class="browse-head-middle" id="browse-head-label"></div>
              <div class="browse-head-right">
                <button class="prev-next" id="rec-day-next" data-rec-day-nav="1" title="Next day" aria-label="Next day" style="display:none">Next${ICONS.right}</button>
              </div>
            </div>
        
            <div class="browse" id="browse" style="display:none">
              <div class="list-head">
                <span class="newtoast" id="newtoast" style="display:none">new \u2726</span>
              </div>
              <div class="list" id="list">
                <div class="empty">Loading\u2026</div>
              </div>
            </div>
            <div class="more" id="older-hint" hidden>scroll for older\u2026</div>
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
              <div class="popup-media-controls" id="popup-media-controls" hidden><span class="popup-media-controls-spacer" aria-hidden="true"></span><button class="popup-media-btn" id="popup-media-play" type="button" title="Play/Pause" aria-label="Play/Pause">${ICONS.play}</button><input class="popup-media-progress" id="popup-media-progress" type="range" min="0" max="1000" value="0" step="1" aria-label="Media progress"><span class="popup-media-time" id="popup-media-time">0:00/0:00</span><button class="popup-media-btn" id="popup-media-mute" type="button" title="Mute" aria-label="Mute">${ICONS.volOn}</button><button class="popup-media-btn" id="popup-media-fs" type="button" title="Fullscreen" aria-label="Fullscreen">${ICONS.expand}</button><span class="popup-media-controls-spacer" aria-hidden="true"></span>
              </div>
              <h2 class="popup-info-head" id="popup-info-head" hidden></h2>
                <div class="recording-scrub" id="recording-scrub" hidden>
                  <div class="recording-scrub-track" id="recording-scrub-track">
                    <div class="recording-scrub-ticks" id="recording-scrub-ticks"></div>
                    <div class="recording-scrub-markers" id="recording-scrub-markers"></div>
                    <div class="recording-scrub-cursor" id="recording-scrub-cursor"></div>
                  </div>
                  <div class="recording-scrub-labels">
                    <span id="recording-scrub-start">0:00</span>
                    <span class="recording-scrub-now" id="recording-scrub-now">0:00 / 0:00</span>
                    <span id="recording-scrub-end">0:00</span>
                  </div>
                </div>
                <div class="popup-info" id="popup-info" hidden></div>
                <div class="popup-carousel-wrap" id="popup-carousel-wrap" hidden>
                  <button class="popup-carousel-nav left" id="popup-carousel-left" data-carousel-dir="-1" aria-label="Previous items">${ICONS.left}
                  </button>
                  <div class="popup-carousel" id="popup-carousel"></div>
                  <button class="popup-carousel-nav right" id="popup-carousel-right" data-carousel-dir="1" aria-label="Next items">${ICONS.right}
                  </button>
                </div>
                <h1 class="popup-shell-ver" id="popup-shell-ver">v${VERSION}</h1>
            </div>
          </div>
      </ha-card>
      `;
    this._domCache = {};
    this._lastRenderedListHtml = "";
    this._initPopupInteractions();
    this._applyBrowse();
    this._applyCardStyle();
    this._applyLayoutMode();
    this._syncBrowseHeadModeClass();
    this._bindListScroll();
    this._bindRecordingsSwipe();
    this._initResizeHandle();
    this._initLiveOverlayControls();
    this._syncSlideshowCountdownOverlay();
    this._renderPreviewPage();
    this._applyPreviewShellVisibility();
  }
  _initLiveOverlayControls() {
    const wrap = this._$("#eng-wrap");
    if (!wrap) return;
    if (this._liveOverlayControlsCleanup) {
      try {
        this._liveOverlayControlsCleanup();
      } catch (_) {
      }
      this._liveOverlayControlsCleanup = null;
    }
    const show = () => {
      wrap.classList.add("live-controls-visible");
    };
    const hideNow = () => {
      wrap.classList.remove("live-controls-visible");
      if (this._liveControlsHideTimer) {
        clearTimeout(this._liveControlsHideTimer);
        this._liveControlsHideTimer = null;
      }
    };
    const hideSoon = (ms = 1400) => {
      if (this._liveControlsHideTimer)
        clearTimeout(this._liveControlsHideTimer);
      this._liveControlsHideTimer = setTimeout(() => {
        wrap.classList.remove("live-controls-visible");
        this._liveControlsHideTimer = null;
      }, ms);
    };
    const onPointerEnter = (event) => {
      if (event?.pointerType === "mouse") show();
    };
    const onPointerLeave = (event) => {
      if (event?.pointerType === "mouse") hideNow();
    };
    const onPointerDown = (event) => {
      const pointerType = String(event?.pointerType || "").toLowerCase();
      if (pointerType === "mouse") return;
      show();
      hideSoon(1300);
    };
    const onTouchStart = () => {
      show();
      hideSoon(1300);
    };
    wrap.addEventListener("pointerenter", onPointerEnter, { passive: true });
    wrap.addEventListener("pointerleave", onPointerLeave, { passive: true });
    wrap.addEventListener("pointerdown", onPointerDown, { passive: true });
    wrap.addEventListener("touchstart", onTouchStart, { passive: true });
    this._liveOverlayControlsCleanup = () => {
      wrap.removeEventListener("pointerenter", onPointerEnter);
      wrap.removeEventListener("pointerleave", onPointerLeave);
      wrap.removeEventListener("pointerdown", onPointerDown);
      wrap.removeEventListener("touchstart", onTouchStart);
      hideNow();
    };
  }
  _syncBrowseHeadModeClass() {
    const card = this._$("#card");
    if (!card) return;
    card.classList.toggle(
      "recordings-browse-head-tall",
      this._tab === "recordings"
    );
  }
  _initResizeHandle() {
    const handle = this._$("#resize-handle");
    if (!handle) return;
    let dragging = false;
    let startX = 0;
    let startLeftWidth = 0;
    let layoutWidth = 0;
    let colL = null;
    let colR = null;
    const onMouseDown = (e) => {
      e.preventDefault();
      dragging = true;
      startX = e.clientX;
      const layout = this._$("#layout");
      colL = this._$(".col-left");
      colR = this._$(".col-right");
      if (!layout || !colL || !colR) {
        dragging = false;
        return;
      }
      layoutWidth = layout.getBoundingClientRect().width;
      startLeftWidth = colL.getBoundingClientRect().width;
      handle.classList.add("active");
      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
    };
    const onMouseMove = (e) => {
      if (!dragging) return;
      if (!colL || !colR || !layoutWidth) return;
      const minPct = 10;
      const maxPct = 90;
      const dx = e.clientX - startX;
      let newLeftWidth = startLeftWidth + dx;
      let pct = newLeftWidth / layoutWidth * 100;
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
      this._syncBrowseHeadFromScroll();
      if ((this._tab === "clips" || this._tab === "snapshot") && !this._loading && !this._exhausted) {
        const listScrollable = list && list.scrollHeight > list.clientHeight + 2;
        const scroller = listScrollable ? list : browse;
        if (!scroller) return;
        const nearBottom = scroller.scrollTop + scroller.clientHeight >= scroller.scrollHeight - 80;
        if (nearBottom) this._loadOlder();
      }
    };
    if (list) list.addEventListener("scroll", onScroll, { passive: true });
    if (browse && browse !== list)
      browse.addEventListener("scroll", onScroll, { passive: true });
  }
  _bindRecordingsSwipe() {
    if (this._recordingsSwipeCleanup) {
      this._recordingsSwipeCleanup();
      this._recordingsSwipeCleanup = null;
    }
    const browse = this._$("#browse");
    if (!browse) return;
    let startX = 0;
    let startY = 0;
    let deltaX = 0;
    let deltaY = 0;
    let tracking = false;
    let horizontal = false;
    let direction = 0;
    let pointerId = null;
    const axisLockThreshold = this._isMobileTabletViewport() ? 6 : 8;
    const dragFollowFactor = this._isMobileTabletViewport() ? 1 : 0.85;
    const canSwipe = () => this._tab === "recordings" && this._isMobileTabletViewport() && !this._recordingsDayNavAnimating;
    const resetGesture = ({ clearTapBlock = true } = {}) => {
      if (this._recordingsSwipeGesture?.stage) {
        this._destroyRecordingsSwipeStage();
      }
      this._recordingsSwipeGesture = null;
      if (clearTapBlock) this._recordingsSwipeBlockTap = false;
      tracking = false;
      horizontal = false;
      direction = 0;
      deltaX = 0;
      deltaY = 0;
      if (pointerId != null && browse.hasPointerCapture?.(pointerId)) {
        try {
          browse.releasePointerCapture(pointerId);
        } catch (_) {
        }
      }
      pointerId = null;
      browse.classList.remove("recordings-swipe");
      browse.style.transform = "";
    };
    const ensureGestureStage = (dir) => {
      if (this._recordingsSwipeGesture?.direction === dir) return;
      this._recordingsSwipeGesture = this._startRecordingsSwipeGesture(dir);
    };
    const startGesture = (clientX, clientY) => {
      startX = clientX;
      startY = clientY;
      deltaX = 0;
      deltaY = 0;
      tracking = true;
      horizontal = false;
      direction = 0;
      this._recordingsSwipeBlockTap = false;
    };
    const moveGesture = (clientX, clientY, e) => {
      if (!tracking || !canSwipe()) return;
      deltaX = clientX - startX;
      deltaY = clientY - startY;
      const absX = Math.abs(deltaX);
      const absY = Math.abs(deltaY);
      if (!horizontal) {
        if (absX < axisLockThreshold && absY < axisLockThreshold) return;
        if (absY >= axisLockThreshold && absY > absX) {
          resetGesture();
          return;
        }
        if (absX < axisLockThreshold || absX <= absY * 1.15) return;
        horizontal = true;
        browse.classList.add("recordings-swipe");
        if (pointerId != null && !browse.hasPointerCapture?.(pointerId)) {
          try {
            browse.setPointerCapture(pointerId);
          } catch (_) {
          }
        }
      }
      e.preventDefault();
      direction = deltaX < 0 ? 1 : -1;
      if (absX >= 3) this._recordingsSwipeBlockTap = true;
      ensureGestureStage(direction);
      const stage = this._recordingsSwipeGesture?.stage;
      if (!stage) return;
      const max = stage.width;
      const x = Math.max(-max, Math.min(max, deltaX));
      const clampedAbsX = Math.abs(x);
      const followFactor = clampedAbsX < 60 ? 1 : dragFollowFactor;
      const follow = Math.sign(x) * Math.min(clampedAbsX * followFactor, max);
      this._setRecordingsSwipeStageOffset(stage, follow);
    };
    const onPointerDown = (e) => {
      if (!canSwipe()) return;
      if (e.pointerType === "mouse" && e.button !== 0) return;
      if (pointerId != null) return;
      pointerId = e.pointerId;
      startGesture(e.clientX, e.clientY);
    };
    const onPointerMove = (e) => {
      if (e.pointerId !== pointerId) return;
      moveGesture(e.clientX, e.clientY, e);
    };
    const finishSwipe = async () => {
      if (!tracking) return;
      const absX = Math.abs(deltaX);
      const absY = Math.abs(deltaY);
      const dir = direction;
      const gesture = this._recordingsSwipeGesture;
      const stage = gesture?.stage;
      tracking = false;
      pointerId = null;
      browse.classList.remove("recordings-swipe");
      browse.style.transform = "";
      if (!horizontal || !stage || !gesture || !dir || absX <= absY) {
        resetGesture();
        return;
      }
      const threshold = Math.max(34, stage.width * 0.12);
      const shouldAdvance = absX >= threshold;
      if (!shouldAdvance) {
        await this._animateRecordingsSwipeStageTo(
          stage,
          0,
          140,
          "cubic-bezier(0.16, 0.64, 0.2, 1)"
        );
        resetGesture({ clearTapBlock: false });
        return;
      }
      const moved = await this._completeRecordingsSwipeGesture(gesture);
      if (!moved) {
        await this._animateRecordingsSwipeStageTo(
          stage,
          0,
          150,
          "cubic-bezier(0.16, 0.64, 0.2, 1)"
        );
        this._bounceRecordingsArea(dir);
      }
      setTimeout(() => {
        this._recordingsSwipeBlockTap = false;
      }, 320);
      resetGesture({ clearTapBlock: false });
    };
    const onPointerUp = (e) => {
      if (e.pointerId !== pointerId) return;
      void finishSwipe();
    };
    browse.addEventListener("pointerdown", onPointerDown);
    browse.addEventListener("pointermove", onPointerMove);
    browse.addEventListener("pointerup", onPointerUp);
    browse.addEventListener("pointercancel", resetGesture);
    this._recordingsSwipeCleanup = () => {
      browse.removeEventListener("pointerdown", onPointerDown);
      browse.removeEventListener("pointermove", onPointerMove);
      browse.removeEventListener("pointerup", onPointerUp);
      browse.removeEventListener("pointercancel", resetGesture);
    };
  }
  _recordingsListMarkup(recs) {
    if (!Array.isArray(recs) || !recs.length) {
      return '<div class="empty">No recordings in this day</div>';
    }
    return recs.map((r) => {
      const rs = Math.floor(r.start_time);
      const re = Math.floor(r.end_time || Date.now() / 1e3);
      const d = Math.max(1, re - rs);
      const mm = Math.floor(d / 60);
      const ss = d % 60;
      const dur = `${mm ? `${mm}m ` : ""}${ss}s`;
      return `<div class="list-item shadow-xform shadow-small" data-rs="${rs}" data-re="${re}">
        <div class="ric">${ICONS.recordings}</div>
        <div class="rinf">
          <div class="rt">${this._time(r.start_time)} \u2013 ${this._time(r.end_time || Date.now() / 1e3)}</div>
          <div class="rsub">${dur}${r.events ? ` \xB7 ${r.events} ev` : ""}</div>
        </div>
        <button class="rp" data-rec-dl-start="${rs}" data-rec-dl-end="${re}" title="Download recording" aria-label="Download recording">${ICONS.download}</button>
      </div>`;
    }).join("");
  }
  _recordingsViewRows(recs) {
    return this._splitRecsHourly(recs).sort(
      (a, b) => b.start_time - a.start_time
    );
  }
  _createRecordingsSwipeStage(direction, incomingHtml) {
    const list = this._$("#list");
    if (!list) return null;
    const width = Math.max(1, Math.round(list.clientWidth || 1));
    const currentHtml = list.innerHTML || this._lastRenderedListHtml || "";
    const stage = document.createElement("div");
    stage.className = "rec-swipe-stage";
    stage.style.minHeight = `${Math.max(220, list.scrollHeight || list.clientHeight || 220)}px`;
    const current = document.createElement("div");
    current.className = "rec-swipe-pane current";
    current.innerHTML = currentHtml;
    const incoming = document.createElement("div");
    incoming.className = "rec-swipe-pane incoming";
    incoming.innerHTML = incomingHtml;
    stage.appendChild(current);
    stage.appendChild(incoming);
    list.classList.add("recordings-swipe-active");
    list.innerHTML = "";
    list.appendChild(stage);
    const state = {
      list,
      stage,
      current,
      incoming,
      direction,
      width,
      offset: 0
    };
    this._setRecordingsSwipeStageOffset(state, 0);
    return state;
  }
  _setRecordingsSwipeStageOffset(state, offset, transition = "") {
    if (!state) return;
    state.offset = offset;
    state.current.style.transition = transition;
    state.incoming.style.transition = transition;
    state.current.style.transform = `translateX(${offset}px)`;
    state.incoming.style.transform = `translateX(${offset + state.direction * state.width}px)`;
  }
  _animateRecordingsSwipeStageTo(state, offset, duration = 260, easing = "cubic-bezier(0.18, 0.5, 0.2, 1)") {
    if (!state) return Promise.resolve();
    return new Promise((resolve) => {
      void state.stage?.getBoundingClientRect?.();
      void state.current?.offsetWidth;
      const transition = `transform ${duration}ms ${easing}`;
      this._setRecordingsSwipeStageOffset(state, offset, transition);
      setTimeout(resolve, duration + 16);
    });
  }
  _destroyRecordingsSwipeStage() {
    const state = this._recordingsSwipeGesture?.stage;
    if (!state?.list) return;
    state.list.classList.remove("recordings-swipe-active");
    this._lastRenderedListHtml = "";
    this._renderList();
  }
  _startRecordingsSwipeGesture(direction) {
    const loadingHtml = '<div class="empty">Loading day\u2026</div>';
    const stage = this._createRecordingsSwipeStage(direction, loadingHtml);
    const gesture = {
      direction,
      stage,
      hasData: false,
      ready: false,
      bounds: null,
      recs: [],
      prepPromise: null
    };
    gesture.prepPromise = (async () => {
      try {
        const prep = await this._prepareRecordingsDayTransition(direction);
        gesture.ready = true;
        gesture.hasData = prep.hasData;
        gesture.bounds = prep.bounds;
        gesture.recs = prep.recs;
        if (gesture.stage?.incoming) {
          gesture.stage.incoming.classList.remove("loading");
          gesture.stage.incoming.innerHTML = prep.hasData ? this._recordingsListMarkup(this._recordingsViewRows(prep.recs)) : '<div class="empty">No recordings in this day</div>';
        }
      } catch (_) {
        gesture.ready = true;
        gesture.hasData = false;
        gesture.bounds = null;
        gesture.recs = [];
        if (gesture.stage?.incoming) {
          gesture.stage.incoming.classList.remove("loading");
          gesture.stage.incoming.innerHTML = '<div class="empty">No recordings in this day</div>';
        }
      }
    })();
    if (gesture.stage?.incoming) {
      gesture.stage.incoming.classList.add("loading");
    }
    return gesture;
  }
  async _prepareRecordingsDayTransition(direction) {
    const bounds = this._recordingsOffsetDayBounds(direction);
    const today = this._recordingsDayBounds(Math.floor(Date.now() / 1e3));
    if (direction > 0 && bounds.end > today.end) {
      return { hasData: false, bounds, recs: [] };
    }
    const { clientId, cam } = this._cc();
    if (!clientId || !cam) {
      return { hasData: false, bounds, recs: [] };
    }
    const key = `${clientId}|${cam}|${bounds.start}|${bounds.end}`;
    if (this._recordingsDayDataCache.has(key)) {
      const cached = this._recordingsDayDataCache.get(key) || [];
      return { hasData: cached.length > 0, bounds, recs: cached };
    }
    const hasData = await this._hasRecordingsInBounds(bounds, clientId, cam);
    if (!hasData) {
      return { hasData: false, bounds, recs: [] };
    }
    const recs = await this._ws({
      type: "frigate/recordings/get",
      instance_id: clientId,
      camera: cam,
      after: Math.max(0, bounds.start),
      before: bounds.end
    });
    const safe = Array.isArray(recs) ? recs : [];
    this._recordingsDayDataCache.set(key, safe);
    this._recordingsDayAvailabilityCache.set(key, safe.length > 0);
    return { hasData: safe.length > 0, bounds, recs: safe };
  }
  async _navigateRecordingsDayAnimated(direction) {
    if (this._tab !== "recordings") return false;
    const dir = Number(direction);
    if (dir !== -1 && dir !== 1) return false;
    if (this._recordingsDayNavAnimating) return false;
    this._recordingsDayNavAnimating = true;
    try {
      const prep = await this._prepareRecordingsDayTransition(dir);
      if (!prep.hasData) {
        this._bounceRecordingsArea(dir);
        void this._updateRecordingsBrowseNav();
        return false;
      }
      const incomingHtml = this._recordingsListMarkup(
        this._recordingsViewRows(prep.recs)
      );
      const stage = this._createRecordingsSwipeStage(dir, incomingHtml);
      if (!stage) {
        await this._commitRecordingsDayTransition(prep.bounds, prep.recs);
        return true;
      }
      await new Promise((resolve) => requestAnimationFrame(resolve));
      await new Promise((resolve) => requestAnimationFrame(resolve));
      await this._animateRecordingsSwipeStageTo(
        stage,
        -dir * stage.width,
        320,
        "cubic-bezier(0.28, 0.02, 0.18, 1)"
      );
      await this._commitRecordingsDayTransition(prep.bounds, prep.recs);
      return true;
    } finally {
      this._recordingsDayNavAnimating = false;
    }
  }
  async _completeRecordingsSwipeGesture(gesture) {
    if (!gesture) return false;
    await gesture.prepPromise;
    if (!gesture.ready || !gesture.hasData || !gesture.stage) return false;
    await new Promise((resolve) => requestAnimationFrame(resolve));
    await new Promise((resolve) => requestAnimationFrame(resolve));
    const target = -gesture.direction * gesture.stage.width;
    await this._animateRecordingsSwipeStageTo(
      gesture.stage,
      target,
      300,
      "cubic-bezier(0.28, 0.02, 0.18, 1)"
    );
    await this._commitRecordingsDayTransition(gesture.bounds, gesture.recs);
    return true;
  }
  async _commitRecordingsDayTransition(bounds, recs) {
    if (!bounds) return;
    const { clientId, cam } = this._cc();
    const key = clientId && cam ? `${clientId}|${cam}|${bounds.start}|${bounds.end}` : "";
    this._followNowWindow = false;
    this._winStart = bounds.start;
    this._winEnd = bounds.end;
    this._exhausted = false;
    this._pruneNonActiveCamWindowCaches();
    this._recordings = Array.isArray(recs) ? recs : [];
    if (key) {
      this._recordingsDayDataCache.set(key, this._recordings);
      this._recordingsDayAvailabilityCache.set(
        key,
        this._recordings.length > 0
      );
    }
    this._cacheActiveCamSlice("recordings", this._recordings);
    this._renderListLabel(this._winEnd);
    this._lastRenderedListHtml = "";
    this._renderList();
  }
  _bounceRecordingsArea(direction) {
    const browse = this._$("#browse");
    if (!browse) return;
    const cls = direction > 0 ? "swipe-bounce-next" : "swipe-bounce-prev";
    browse.classList.remove("swipe-bounce-prev", "swipe-bounce-next");
    void browse.offsetWidth;
    browse.classList.add(cls);
    setTimeout(() => {
      browse.classList.remove(cls);
    }, 280);
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
    this._applyTightMargins();
    const vh = this._config.stream_height;
    const isCompactPreview = this._config?.compact_preview === true || this._isPreviewContext();
    const previewHeightFallback = isCompactPreview && !vh ? "320px" : "";
    if (vh) {
      const unit = this._config.stream_height_unit || "vh";
      this.style.setProperty("--card-host-height", `${vh}${unit}`);
      card.style.setProperty("--view-height", `${vh}${unit}`);
    } else if (previewHeightFallback) {
      this.style.setProperty("--card-host-height", previewHeightFallback);
      card.style.setProperty("--view-height", previewHeightFallback);
    } else {
      this.style.removeProperty("--card-host-height");
      const haCardH = getComputedStyle(this).getPropertyValue("--ha-card-height").trim();
      if (haCardH) {
        card.style.setProperty("--view-height", haCardH);
      } else {
        card.style.removeProperty("--view-height");
      }
    }
    const customTheme = this._config?.theme === "custom" && this._config?.theme_custom && typeof this._config.theme_custom === "object" ? this._config.theme_custom : {};
    const customDefaults = this._config?.theme === "custom" && this._config?.theme_custom_defaults && typeof this._config.theme_custom_defaults === "object" ? this._config.theme_custom_defaults : {};
    for (const row of THEME_CUSTOM_ROWS) {
      const key = row.key;
      const override = normalizeHexColor(customTheme[key]);
      const useDefault = customDefaults[key] === true;
      if (!useDefault && override) {
        card.style.setProperty(key, override);
      } else {
        card.style.removeProperty(key);
      }
    }
    this._syncHostOuterStyles();
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
    if (this._isPreviewPageActive()) {
      this._renderPreviewPage();
      this._schedulePreviewSnapshotRefresh(120);
      return;
    }
    if (this._viewMode === "grid") {
      this._ffDebug("Grid resume mapped to grid refresh", { reason });
      this._scheduleGridRefresh(120);
      return;
    }
    if (this._resumeLiveT) clearTimeout(this._resumeLiveT);
    const delay = reason === "card-editor-close" || reason === "watchdog-dialog-close" || reason === "watchdog-dashboard-edit-on" || reason === "watchdog-dashboard-edit-off" ? 40 : 140;
    this._resumeLiveT = setTimeout(() => {
      this._resumeLiveIfNeeded(reason);
    }, delay);
    this._ffDebug("Scheduled resume live", { reason, delay });
    if (this._isFirefox() && this._viewMode !== "grid") {
      setTimeout(() => this._kickLiveIfStale(true), 900);
    }
  }
  _isMobileTabletViewport() {
    const coarse = window.matchMedia?.("(pointer: coarse)")?.matches || window.matchMedia?.("(any-pointer: coarse)")?.matches || false;
    const w = window.innerWidth || 0;
    const h = window.innerHeight || 0;
    const maxEdge = Math.max(w, h);
    const minEdge = Math.min(w, h);
    return coarse && maxEdge <= 1400 && minEdge <= 1100;
  }
  _isLandscapeViewport() {
    return window.matchMedia?.("(orientation: landscape)")?.matches || (window.innerWidth || 0) > (window.innerHeight || 0);
  }
  _clearRotateOverlayAudioSync() {
    if (this._rotateOverlaySyncVideo && this._onRotateOverlayVolumeChange) {
      try {
        this._rotateOverlaySyncVideo.removeEventListener(
          "volumechange",
          this._onRotateOverlayVolumeChange
        );
      } catch (_) {
      }
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
    } catch (_) {
    }
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
      const v = this._findVideoDeep(host) || this._findVideoDeep(this._engine) || this._engine?.video || null;
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
    const viewer = this._$("#viewer");
    const popupMediaVisible = !!popupOpen && !!viewer && viewer.style.display !== "none" && viewer.childElementCount > 0;
    const rotateEligible = this._isMobileTabletViewport() && this._isLandscapeViewport();
    const nextMode = rotateEligible ? popupMediaVisible ? "popup" : !popupOpen ? "live" : "none" : "none";
    if (this._rotateOverlayExitT) {
      clearTimeout(this._rotateOverlayExitT);
      this._rotateOverlayExitT = null;
    }
    if (nextMode === "live") {
      const fromPopup = this._rotateOverlayMode === "popup";
      card.classList.remove(
        "mobile-rotate-live-exit",
        "mobile-rotate-popup",
        "mobile-rotate-popup-exit"
      );
      card.classList.add("mobile-rotate-live");
      this._rotateOverlayMode = "live";
      this._rotateOverlayActive = true;
      if (fromPopup) this._setLiveNativeControls(false);
      this._setStreamLoading(false);
      this._setLiveNativeControls(true);
      this._syncFullscreenButtonsVisibility();
      this._showPopupControlsTemporarily();
      return;
    }
    if (nextMode === "popup") {
      const fromLive = this._rotateOverlayMode === "live";
      card.classList.remove(
        "mobile-rotate-popup-exit",
        "mobile-rotate-live",
        "mobile-rotate-live-exit"
      );
      card.classList.add("mobile-rotate-popup");
      this._rotateOverlayMode = "popup";
      this._rotateOverlayActive = true;
      if (fromLive) this._setLiveNativeControls(false);
      this._syncFullscreenButtonsVisibility();
      this._showPopupControlsTemporarily();
      return;
    }
    if (!this._rotateOverlayActive) {
      card.classList.remove(
        "mobile-rotate-live",
        "mobile-rotate-live-exit",
        "mobile-rotate-popup",
        "mobile-rotate-popup-exit"
      );
      this._rotateOverlayMode = "none";
      return;
    }
    const exitMode = this._rotateOverlayMode;
    this._rotateOverlayActive = false;
    this._rotateOverlayMode = "none";
    if (exitMode === "live") this._setLiveNativeControls(false);
    card.classList.remove("mobile-rotate-live", "mobile-rotate-popup");
    if (exitMode === "popup") card.classList.add("mobile-rotate-popup-exit");
    else card.classList.add("mobile-rotate-live-exit");
    this._rotateOverlayExitT = setTimeout(() => {
      const c = this._$("#card");
      if (c)
        c.classList.remove(
          "mobile-rotate-live-exit",
          "mobile-rotate-popup-exit"
        );
      this._rotateOverlayExitT = null;
      if (!force && this._resumeLiveT) return;
      this._syncFullscreenButtonsVisibility();
    }, 260);
    this._syncFullscreenButtonsVisibility();
    this._showPopupControlsTemporarily();
  }
  _kickLiveIfStale(force2 = false) {
    if (!this._started || !this._hass || !this._config) return;
    if (this._isPreviewPageActive()) return;
    if (this._viewMode === "grid") return;
    if (!this._isCardVisible()) return;
    if (this._$("#myPopup")?.classList.contains("is-open")) return;
    if (this._mountInProgress) return;
    if (!force2 && this._$("#stream-loading") && !this._$("#stream-loading").hidden)
      return;
    const now = Date.now();
    if (!force2 && now - this._lastLiveKick < 4e3) return;
    const recentMseTraffic = this._isFirefox() && (now - Number(this._mseConnectAt || 0) < 12e3 || now - Number(this._mseLastChunkAt || 0) < 3500);
    if (recentMseTraffic) return;
    const engineHost = this._$("#engine");
    const v = this._findVideoDeep(engineHost) || this._findVideoDeep(this._engine) || this._engine?.video || null;
    let stale = !v;
    if (v) {
      const ready = Number(v.readyState) || 0;
      const ended = !!v.ended;
      const paused = !!v.paused;
      const hasFrames = (Number(v.currentTime) || 0) > 0.05 || (Number(v.webkitDecodedFrameCount) || 0) > 0;
      stale = ended || ready < 2 || paused && hasFrames;
    }
    if (stale) {
      this._lastLiveKick = now;
      this._ffDebug("Stale stream detected; remounting", {
        force: force2,
        readyState: Number(v?.readyState) || 0,
        ended: !!v?.ended,
        paused: !!v?.paused,
        currentTime: Number(v?.currentTime) || 0,
        mseChunkCount: Number(this._mseChunkCount || 0)
      });
      this._mountEngine();
    }
  }
  _resumeLiveIfNeeded(_reason = "") {
    if (!this._started || !this._hass || !this._config) return;
    if (this._isPreviewPageActive()) return;
    const visible = this._isCardVisible();
    const popupOpen = this._$("#myPopup")?.classList.contains("is-open");
    const mountStuckMs = this._mountStartedAt ? Date.now() - this._mountStartedAt : 0;
    if (this._mountInProgress && mountStuckMs > 12e3) {
      this._ffDebug("Mount appears stuck; forcing recovery", {
        reason: _reason,
        mountTarget: this._mountTargetEntity,
        mountStuckMs
      });
      this._mountSeq += 1;
      this._mountInProgress = false;
      this._mountStartedAt = 0;
      this._mountTargetEntity = "";
      this._cleanupEngine();
    }
    if (!visible || popupOpen || this._mountInProgress) {
      if (this._resumeLiveT) clearTimeout(this._resumeLiveT);
      this._ffDebug("Resume deferred", {
        reason: _reason,
        visible,
        popupOpen,
        mountInProgress: this._mountInProgress,
        mountStuckMs
      });
      this._resumeLiveT = setTimeout(() => {
        this._resumeLiveIfNeeded("wait-ready");
      }, 450);
      return;
    }
    const engWrap = this._$("#eng-wrap");
    if (engWrap) engWrap.style.display = "";
    this._kickLiveIfStale(true);
    setTimeout(() => this._kickLiveIfStale(true), 900);
    this._ffDebug("Resume executed", { reason: _reason });
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
      const wide = w >= 560, mobile = w < 420;
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
        { threshold: 0.15 }
      );
      this._io.observe(this);
    }
  }
  // ── cam switcher ──────────────────────────────────────────
  _camSwitcherMarkup({ includeStatus = true } = {}) {
    const backButton = this._isPreviewPageEnabled() ? `<button class="glass-btn cam-tab preview-back-btn" type="button" data-preview-back title="Back to preview page" aria-label="Back to preview page">${ICONS.left} Back</button>` : "";
    const cameraButtons = this._config.cameras.map((c, i) => {
      const name = cap(camDisplayName(c));
      const active = this._viewMode === "single" && i === this._activeCamIdx;
      const ok = !includeStatus || this._hass?.states?.[c.entity]?.state !== "unavailable";
      return `<button class="glass-btn cam-tab ${active ? "active" : ""}" data-camidx="${i}"><span class="cam-dot" style="color:${ok ? "#4ade80" : "#ef4444"}">\u25CF</span> ${name}</button>`;
    }).join("");
    return `${backButton}${cameraButtons}`;
  }
  _renderCamSwitcher() {
    const el = this.shadowRoot.querySelector("#cam-switcher");
    if (!el) return;
    if (this._config.cameras.length < 2 && !this._isPreviewPageEnabled()) {
      el.style.display = "none";
      return;
    }
    el.style.display = "";
    el.innerHTML = `${this._camSwitcherMarkup({ includeStatus: true })}`;
  }
  // ── interactions ──────────────────────────────────────────
  _openPopup() {
    const popup = this._$("#myPopup");
    if (!popup) return;
    this._pauseSlideshowForPopup();
    popup.classList.add("is-open");
    popup.style.transform = "translateY(0)";
    const body = popup.querySelector(".popup-body");
    if (body) body.scrollTop = 0;
    this._setLivePopupCover(true);
    this._applyLiveMuteChange(true, { source: "popup-open" });
    this._syncFullscreenButtonsVisibility();
    this._scheduleRotateOverlayUpdate();
  }
  _stopPopupMedia() {
    this._clearPopupMediaCleanup();
    const viewer = this._$("#viewer");
    if (!viewer) return;
    if (this._popupMediaStopTimer) {
      clearTimeout(this._popupMediaStopTimer);
      this._popupMediaStopTimer = null;
    }
    const cleanupVideos = (dropSources) => {
      viewer.querySelectorAll("video").forEach((v) => {
        try {
          v.pause();
          if (dropSources) {
            if ("srcObject" in v) v.srcObject = null;
            v.removeAttribute("src");
            v.querySelectorAll("source").forEach((s) => s.remove());
          }
        } catch (_) {
        }
      });
      if (dropSources) viewer.innerHTML = "";
    };
    const deferSourceDrop = this._isFirefox() && this._popupMediaType && this._popupMediaType !== "recording";
    if (deferSourceDrop) {
      cleanupVideos(false);
      this._popupMediaStopTimer = setTimeout(() => {
        this._popupMediaStopTimer = null;
        cleanupVideos(true);
      }, 1200);
    } else {
      cleanupVideos(true);
    }
    viewer.style.display = "none";
    const controls = this._$("#popup-media-controls");
    if (controls) {
      controls.hidden = true;
      controls.classList.remove("is-hidden");
    }
    const carouselWrap = this._$("#popup-carousel-wrap");
    const carousel = this._$("#popup-carousel");
    if (carouselWrap) carouselWrap.hidden = true;
    if (carousel) carousel.innerHTML = "";
    this._hidePopupInfo();
    this._popupMediaType = "";
    this._playing = null;
  }
  _closePopup() {
    const popup = this._$("#myPopup");
    if (!popup) return;
    popup.classList.remove("is-open");
    popup.style.transform = "translateY(100%)";
    this._setLivePopupCover(false);
    this._applyLiveMuteChange(true, { source: "popup-close" });
    this._syncFullscreenButtonsVisibility();
    this._scheduleRotateOverlayUpdate();
    this._stopPopupMedia();
    this._resumeSlideshowAfterPopup();
  }
  _initPopupInteractions() {
    const popup = this._$("#myPopup");
    if (!popup) return;
    if (this._popupHandlers) {
      const h = this._popupHandlers;
      h.popup.removeEventListener("mousedown", h.onMouseDown);
      h.popup.removeEventListener("touchstart", h.onTouchStart);
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
      drag.isDragging = true;
      drag.startY = clientY;
      drag.currentY = 0;
      popup.style.transition = "none";
    };
    const shouldIgnoreDragStart = (target) => {
      if (!target || !(target instanceof Element)) return false;
      return !!target.closest(
        "#popup-media-controls, #popup-carousel-wrap, #recording-scrub, .popup-info, .viewer, input, button, a, [data-ev]"
      );
    };
    const move = (clientY, ev = null) => {
      const popup2 = this._$("#myPopup");
      if (!popup2) return;
      if (!drag.isDragging || !popup2.classList.contains("is-open")) return;
      if (ev?.cancelable) ev.preventDefault();
      drag.currentY = clientY - drag.startY;
      if (drag.currentY > 0) {
        popup2.style.transform = `translateY(${drag.currentY}px)`;
      }
    };
    const end = () => {
      const popup2 = this._$("#myPopup");
      if (!popup2) return;
      if (!drag.isDragging) return;
      drag.isDragging = false;
      popup2.style.transition = "";
      if (drag.currentY > dragThreshold) this._closePopup();
      else popup2.style.transform = "translateY(0)";
      drag.currentY = 0;
    };
    const onMouseDown = (e) => {
      if (shouldIgnoreDragStart(e.target)) return;
      start(e.clientY);
    };
    const onTouchStart = (e) => {
      if (shouldIgnoreDragStart(e.target)) return;
      start(e.touches[0].clientY);
    };
    const onMouseMove = (e) => move(e.clientY);
    const onTouchMove = (e) => move(e.touches[0].clientY, e);
    const onMouseUp = () => end();
    const onTouchEnd = () => end();
    popup.addEventListener("mousedown", onMouseDown);
    popup.addEventListener("touchstart", onTouchStart);
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("touchmove", onTouchMove, {
      passive: false
    });
    document.addEventListener("mouseup", onMouseUp);
    document.addEventListener("touchend", onTouchEnd);
    this._popupHandlers = {
      popup,
      onMouseDown,
      onTouchStart,
      onMouseMove,
      onTouchMove,
      onMouseUp,
      onTouchEnd
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
    if (target.closest("#grid-btn")) {
      this._toggleGridMode();
      return true;
    }
    if (target.closest("#slideshow-btn")) {
      this._toggleSlideshowRotation();
      return true;
    }
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
    if (target.closest("#popup-media-play")) {
      this._togglePopupMediaPlay();
      return true;
    }
    if (target.closest("#popup-media-mute")) {
      this._togglePopupMediaMute();
      return true;
    }
    if (target.closest("#popup-media-fs")) {
      this._fullscreen(this._$("#viewer"));
      this._showPopupControlsTemporarily();
      return true;
    }
    const carouselNav = target.closest("[data-carousel-dir]");
    if (carouselNav) {
      const dir = Number(carouselNav.dataset.carouselDir || 0);
      if (dir) this._scrollPopupCarousel(dir);
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
    const recDayNav = target.closest("[data-rec-day-nav]");
    if (recDayNav) {
      const dir = Number(recDayNav.dataset.recDayNav || 0);
      if (dir) {
        void this._navigateRecordingsDayAnimated(dir);
      }
      return true;
    }
    return false;
  }
  _handleSidebarClick(target) {
    const previewButton = target.closest("[data-preview-select-camidx]");
    if (previewButton && this._isPreviewPageActive()) {
      this._exitPreviewPageToCamera(
        Number(previewButton.dataset.previewSelectCamidx)
      );
      return true;
    }
    const previewCell = target.closest("[data-preview-camidx]");
    if (previewCell && this._isPreviewPageActive()) {
      this._exitPreviewPageToCamera(Number(previewCell.dataset.previewCamidx));
      return true;
    }
    const previewBack = target.closest("[data-preview-back]");
    if (previewBack) {
      this._returnToPreviewPage();
      return true;
    }
    const pageRoute = target.closest("[data-page-route]");
    if (pageRoute) {
      this._navigateToPageRoute(pageRoute.dataset.pageRoute, {
        source: "page-nav"
      });
      return true;
    }
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
      this._pauseSlideshowForInteraction();
      this._switchCamera(Number(camTab.dataset.camidx));
      return true;
    }
    const gridCell = target.closest("[data-grid-camidx]");
    if (gridCell && this._viewMode === "grid") {
      const idx = Number(gridCell.dataset.gridCamidx);
      if (Number.isInteger(idx) && idx >= 0) {
        this._pauseSlideshowForInteraction();
        this._switchCamera(idx);
        return true;
      }
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
    this._pauseSlideshowForInteraction();
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
      const review = rid ? this._findReviewById(rid) : null;
      this._showClipById(revOpen.dataset.reviewOpen, {
        mediaType: "alert",
        startTime: review?.start_time,
        camera: review?.camera
      });
      return true;
    }
    const donut = target.closest("[data-tab]");
    if (donut) {
      this._setTab(donut.dataset.tab);
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
      if (this._tab === "recordings" && this._recordingsSwipeBlockTap) {
        e.stopPropagation();
        e.preventDefault();
        return true;
      }
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
    const prevTab = this._tab;
    this._tab = tab;
    this.shadowRoot.querySelectorAll("[data-tab]").forEach((p) => p.classList.toggle("active", p.dataset.tab === tab));
    const filterBtn = this._$("#filter-btn");
    if (filterBtn) filterBtn.disabled = tab === "recordings";
    if (tab === "recordings") {
      const filterPanel = this._$("#filter-panel");
      if (filterPanel) filterPanel.style.display = "none";
    } else {
      this._normalizeFilterSelections();
      if (this._$("#filter-panel")?.style.display !== "none") {
        this._renderFilter();
      }
    }
    this._syncBrowseHeadModeClass();
    this._renderListLabel();
    void this._loadTabData(tab);
    this._renderList();
    if (!this._shouldPreserveScrollOnTabSwitch(prevTab, tab)) {
      this._resetBrowseScrollTop();
    }
  }
  _shouldPreserveScrollOnTabSwitch(prevTab, nextTab) {
    if (!prevTab || !nextTab || prevTab === nextTab) return true;
    return prevTab === "clips" && nextTab === "snapshot" || prevTab === "snapshot" && nextTab === "clips";
  }
  _resetBrowseScrollTop() {
    const list = this._$("#list");
    const browse = this._$("#browse");
    if (list) list.scrollTop = 0;
    if (browse) browse.scrollTop = 0;
  }
  // ── playback ──────────────────────────────────────────────
  _allDisplayEvents() {
    if (this._eventsMode === "all") {
      const seen = new Set();
      const all = [];
      for (const c of this._config.cameras) {
        const cc = this._camCache[c.entity];
        if (cc) {
          for (const ev of cc.events || [])
            if (!seen.has(ev.id)) {
              seen.add(ev.id);
              all.push(ev);
            }
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
      } catch (_) {
      }
    }
    this._recordingScrubCleanup = null;
    this._recordingScrubState = null;
  }
  _setRecordingScrubCursor(timeSec) {
    const state = this._recordingScrubState;
    if (!state?.cursor || !Number.isFinite(timeSec)) return;
    const span = Math.max(1, state.end - state.start);
    const pct = (timeSec - state.start) / span * 100;
    state.cursor.style.left = `${Math.max(0, Math.min(100, pct))}%`;
    if (state.labelNow) {
      const rel = Math.max(0, Math.min(span, timeSec - state.start));
      state.labelNow.textContent = `${this._fmtScrubTime(rel)} / ${this._fmtScrubTime(span)}`;
    }
  }
  _fmtScrubTime(sec) {
    const total = Math.max(0, Math.floor(Number(sec) || 0));
    const h = Math.floor(total / 3600);
    const m = Math.floor(total % 3600 / 60);
    const s = total % 60;
    if (h > 0) {
      return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
    }
    return `${m}:${String(s).padStart(2, "0")}`;
  }
  _closestRecordingAlertStart(targetSec, alerts, thresholdSec) {
    let nearest = null;
    let best = Infinity;
    for (const a of alerts) {
      const inAlert = targetSec >= a.start && targetSec <= a.end;
      const duration = Math.max(0, Number(a.end || 0) - Number(a.start || 0));
      if (inAlert) {
        if (duration > 20) return null;
        return a.start;
      }
      const d = Math.abs(targetSec - a.start);
      if (d < best) {
        best = d;
        nearest = a.start;
      }
    }
    return best <= thresholdSec ? nearest : null;
  }
  _resolveRecordingScrubTarget(ratio) {
    const state = this._recordingScrubState;
    if (!state?.video) return null;
    const span = Math.max(1, state.end - state.start);
    const rawTarget = state.start + Math.max(0, Math.min(1, ratio)) * span;
    const snapThreshold = Math.min(12, Math.max(3, span * 5e-3));
    const snapped = this._closestRecordingAlertStart(
      rawTarget,
      state.alerts,
      snapThreshold
    );
    const absTarget = Number.isFinite(snapped) ? snapped : rawTarget;
    const relTarget = Math.max(
      0,
      Math.min(state.end - state.start, absTarget - state.start)
    );
    return { absTarget, relTarget };
  }
  _seekRecordingScrubToRatio(ratio, { commit = false } = {}) {
    const state = this._recordingScrubState;
    if (!state?.video) return;
    const target = this._resolveRecordingScrubTarget(ratio);
    if (!target) return;
    state.pendingAbsTarget = target.absTarget;
    state.pendingRelTarget = target.relTarget;
    this._setRecordingScrubCursor(target.absTarget);
    if (!commit) return;
    const rel = Number(state.pendingRelTarget);
    if (!Number.isFinite(rel)) return;
    void this._commitRecordingSeek(state, rel, target.absTarget);
  }
  _isRecordingTimeSeekable(video, targetSec, toleranceSec = 0.35) {
    if (!video || !Number.isFinite(targetSec)) return false;
    const ranges = video.seekable;
    if (!ranges || !ranges.length) return false;
    for (let i = 0; i < ranges.length; i++) {
      const start = Number(ranges.start(i));
      const end = Number(ranges.end(i));
      if (Number.isFinite(start) && Number.isFinite(end) && targetSec >= start - toleranceSec && targetSec <= end + toleranceSec) {
        return true;
      }
    }
    return false;
  }
  async _attemptRecordingSeek(video, targetSec, timeoutMs = 2500) {
    if (!video || !Number.isFinite(targetSec)) return false;
    return await new Promise((resolve) => {
      let done = false;
      const finish = (ok) => {
        if (done) return;
        done = true;
        cleanup();
        resolve(ok);
      };
      const verify = () => {
        const cur = Number(video.currentTime || 0);
        const diff = Math.abs(cur - targetSec);
        finish(diff <= 1.5);
      };
      const onDone = () => verify();
      const onError = () => finish(false);
      const cleanup = () => {
        clearTimeout(timer);
        video.removeEventListener("seeked", onDone);
        video.removeEventListener("timeupdate", onDone);
        video.removeEventListener("error", onError);
      };
      const timer = setTimeout(() => verify(), timeoutMs);
      video.addEventListener("seeked", onDone, { once: true });
      video.addEventListener("timeupdate", onDone, { once: true });
      video.addEventListener("error", onError, { once: true });
      try {
        if (typeof video.fastSeek === "function" && !this._isEdge() && !isIOS) {
          video.fastSeek(targetSec);
        } else {
          video.currentTime = targetSec;
        }
      } catch (_) {
        finish(false);
      }
    });
  }
  async _commitRecordingSeek(state, relTarget, absTarget) {
    if (!state?.video || !Number.isFinite(relTarget) || !Number.isFinite(absTarget))
      return;
    state.seekNonce = Number(state.seekNonce || 0) + 1;
    const nonce = state.seekNonce;
    const video = state.video;
    const seekTimeout = this._isFirefox() || this._isEdge() ? 4200 : 2500;
    const seekOk = await this._attemptRecordingSeek(
      video,
      relTarget,
      seekTimeout
    );
    if (nonce !== state.seekNonce) return;
    if (this._isFirefox() || this._isEdge()) {
      if (state.resumeAfterScrub) {
        video.play?.().catch(() => {
        });
      }
      return;
    }
    const cur = Number(video.currentTime || 0);
    const diff = Math.abs(cur - relTarget);
    const shouldFallback = !seekOk || diff > 2;
    if (shouldFallback) {
      if (state.isFallbackLoading) return;
      state.isFallbackLoading = true;
      try {
        const span = Math.max(1, state.end - state.start);
        const fallbackStart = Math.floor(absTarget);
        const fallbackEnd = Math.floor(absTarget + span);
        await this._showRecording(fallbackStart, fallbackEnd);
      } finally {
        state.isFallbackLoading = false;
      }
      return;
    }
    if (state.resumeAfterScrub) {
      video.play?.().catch(() => {
      });
    }
  }
  async _fetchRecordingAlerts(clientId, cam, start, end) {
    const cacheKey = `${clientId}|${cam}|${Math.floor(start)}|${Math.floor(end)}`;
    if (this._recordingAlertCache.has(cacheKey)) {
      return this._recordingAlertCache.get(cacheKey);
    }
    const reviews = await this._fetchWindowedReviews(clientId, cam, start, end);
    const alerts = (Array.isArray(reviews) ? reviews : []).map((r) => {
      const severity = String(
        r?.severity || r?.data?.severity || "detection"
      ).toLowerCase();
      if (!["alert", "detection"].includes(severity)) return null;
      const rs = Math.max(start, Number(r?.start_time || start));
      const re = Math.min(end, Number(r?.end_time || rs + 1));
      return {
        id: r?.id || `${rs}-${re}`,
        start: rs,
        end: re > rs ? re : rs + 1,
        severity
      };
    }).filter(Boolean).sort((a, b) => a.start - b.start);
    this._recordingAlertCache.set(cacheKey, alerts);
    return alerts;
  }
  async _initRecordingScrub({
    clientId,
    cam,
    start,
    end,
    video,
    token,
    sourceUrl
  }) {
    const scrub = this._$("#recording-scrub");
    const track = this._$("#recording-scrub-track");
    const ticks = this._$("#recording-scrub-ticks");
    const markers = this._$("#recording-scrub-markers");
    const cursor = this._$("#recording-scrub-cursor");
    const labelStart = this._$("#recording-scrub-start");
    const labelNow = this._$("#recording-scrub-now");
    const labelEnd = this._$("#recording-scrub-end");
    if (!scrub || !track || !markers || !cursor || !video) return;
    this._teardownRecordingScrub();
    scrub.hidden = false;
    if (ticks) ticks.innerHTML = "";
    markers.innerHTML = "";
    const alerts = await this._fetchRecordingAlerts(
      clientId,
      cam,
      start,
      end
    ).catch(() => []);
    if (token !== this._playSeq) return;
    const span = Math.max(1, end - start);
    if (labelStart) labelStart.textContent = "0:00";
    if (labelEnd) labelEnd.textContent = this._fmtScrubTime(span);
    if (labelNow)
      labelNow.textContent = `${this._fmtScrubTime(0)} / ${this._fmtScrubTime(span)}`;
    const tickStep = 10 * 60;
    const tickLayer = ticks || markers;
    for (let t = tickStep; t < span; t += tickStep) {
      const left = t / span * 100;
      tickLayer.innerHTML += `<span class="recording-scrub-tick" style="left:${left}%"></span>`;
    }
    for (const a of alerts) {
      const left = (a.start - start) / span * 100;
      const width = Math.max(0.75, (a.end - a.start) / span * 100);
      const markerClass = String(a.severity || "").toLowerCase() === "alert" ? "recording-scrub-alert" : "recording-scrub-detection";
      markers.innerHTML += `<span class="${markerClass}" style="left:${Math.max(0, left)}%;width:${Math.min(100, width)}%"></span>`;
    }
    const clientXToRatio = (clientX) => {
      const rect = track.getBoundingClientRect();
      if (!rect.width) return 0;
      return Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    };
    let dragging = false;
    let lastRatio = 0;
    const consumeGesture = (ev) => {
      ev.preventDefault?.();
      ev.stopPropagation?.();
    };
    const onPointerDown = (ev) => {
      consumeGesture(ev);
      dragging = true;
      state.isScrubbing = true;
      state.resumeAfterScrub = !video.paused;
      video.pause?.();
      track.setPointerCapture?.(ev.pointerId);
      lastRatio = clientXToRatio(ev.clientX);
      this._seekRecordingScrubToRatio(lastRatio);
    };
    const onPointerMove = (ev) => {
      if (!dragging) return;
      consumeGesture(ev);
      lastRatio = clientXToRatio(ev.clientX);
      this._seekRecordingScrubToRatio(lastRatio);
    };
    const onPointerUp = (ev) => {
      if (!dragging) return;
      consumeGesture(ev);
      dragging = false;
      state.isScrubbing = false;
      track.releasePointerCapture?.(ev.pointerId);
      this._seekRecordingScrubToRatio(lastRatio, { commit: true });
    };
    const onTouchConsume = (ev) => {
      consumeGesture(ev);
    };
    const onTime = () => {
      if (this._recordingScrubState?.isScrubbing) return;
      this._setRecordingScrubCursor(start + Number(video.currentTime || 0));
    };
    const state = {
      start,
      end,
      alerts,
      video,
      cursor,
      labelNow,
      isScrubbing: false,
      resumeAfterScrub: false,
      pendingAbsTarget: null,
      pendingRelTarget: null,
      seekNonce: 0,
      isFallbackLoading: false,
      sourceUrl: sourceUrl || "",
      sourceUrlNoHash: String(sourceUrl || "").split("#")[0]
    };
    track.addEventListener("pointerdown", onPointerDown);
    track.addEventListener("pointermove", onPointerMove);
    track.addEventListener("pointerup", onPointerUp);
    track.addEventListener("pointercancel", onPointerUp);
    track.addEventListener("touchstart", onTouchConsume, { passive: false });
    track.addEventListener("touchmove", onTouchConsume, { passive: false });
    track.addEventListener("touchend", onTouchConsume, { passive: false });
    video.addEventListener("timeupdate", onTime);
    this._recordingScrubState = state;
    this._setRecordingScrubCursor(start);
    this._recordingScrubCleanup = () => {
      track.removeEventListener("pointerdown", onPointerDown);
      track.removeEventListener("pointermove", onPointerMove);
      track.removeEventListener("pointerup", onPointerUp);
      track.removeEventListener("pointercancel", onPointerUp);
      track.removeEventListener("touchstart", onTouchConsume);
      track.removeEventListener("touchmove", onTouchConsume);
      track.removeEventListener("touchend", onTouchConsume);
      video.removeEventListener("timeupdate", onTime);
      if (ticks) ticks.innerHTML = "";
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
    const score = opts.score != null ? opts.score : ev?.top_score != null ? `${Math.round(ev.top_score * 100)}%` : "-";
    const zone = opts.zone || (ev?.zones?.length ? ev.zones[0] : "-");
    const objects = opts.objects || (ev?.data?.objects?.length ? ev.data.objects.map(cap).join(", ") : ev?.label ? cap(ev.label) : "-");
    const startTs = opts.startTime ?? ev?.start_time;
    const time = startTs ? this._time(startTs) : "-";
    const dayDate = startTs ? `${this._weekday(startTs)} - ${this._monthDay(startTs, { ordinal: true })}` : "-";
    const duration = opts.durationSec != null ? `${Math.max(1, Math.round(opts.durationSec))}s` : ev ? `${this._dur(ev)}s` : "-";
    const camera = (opts.camera || ev?.camera || this._cc().cam || "").replace(/_/g, " ") || "-";
    const hasClip = ev?.has_clip ?? mediaType === "clip";
    const downloadFile = mediaType === "recording" ? "" : mediaType === "snapshot" ? "snapshot.jpg" : hasClip ? "clip.mp4" : "snapshot.jpg";
    const downloadLabel = mediaType === "recording" ? "Download recording" : downloadFile === "snapshot.jpg" ? "Download snapshot" : "Download clip";
    return {
      id,
      mediaType,
      titleLabel,
      score,
      zone,
      objects,
      dayDate,
      time,
      duration,
      camera,
      downloadFile,
      downloadLabel,
      recStart: opts.recStart,
      recEnd: opts.recEnd
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
    head.textContent = `${cap(model.mediaType || "media")} - ${model.camera} - ${model.dayDate} - ${model.time}`;
    head.hidden = false;
    const isRecordingDl = model.mediaType === "recording" && Number.isFinite(model.recStart) && Number.isFinite(model.recEnd);
    const downloadBtn = isRecordingDl ? `<button class="popup-action" data-rec-dl-start="${Math.floor(model.recStart)}" data-rec-dl-end="${Math.floor(model.recEnd)}" title="${model.downloadLabel}" aria-label="${model.downloadLabel}">${ICONS.download}</button>` : model.id ? `<button class="popup-action" data-dl="${model.id}" data-dl-file="${model.downloadFile}" title="${model.downloadLabel}" aria-label="${model.downloadLabel}">${ICONS.download}</button>` : "";
    info.innerHTML = `
          <div class="popup-info-title">
            <span class="tb" style="background:${labelColor(ev?.label || model.mediaType)}33;color:${labelColor(ev?.label || model.mediaType)}">${model.titleLabel}</span>
            ${ev?.sub_label ? `<span class="subl">${ev.sub_label}</span>` : ""}
          </div>

          <div class="popup-info-body">
            <div class="popup-info-grid">
              <div class="popup-info-row"><span class="popup-info-k">Camera</span><span class="popup-info-v">${model.camera}</span></div>
              <div class="popup-info-row"><span class="popup-info-k">Day/Date</span><span class="popup-info-v">${model.dayDate}</span></div>
              <div class="popup-info-row"><span class="popup-info-k">Time</span><span class="popup-info-v">${model.time}</span></div>
              <div class="popup-info-row"><span class="popup-info-k">Duration</span><span class="popup-info-v">${model.duration}</span></div>
              <div class="popup-info-row"><span class="popup-info-k">Objects</span><span class="popup-info-v">${model.objects}</span></div>
              <div class="popup-info-row"><span class="popup-info-k">Zone</span><span class="popup-info-v">${model.zone}</span></div>
              <div class="popup-info-row"><span class="popup-info-k">Score</span><span class="popup-info-v">${model.score}</span></div>
            </div>
            <div class="popup-info-actions">${downloadBtn}</div>
          </div>
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
        video.play?.().catch(() => {
        });
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
      eng.video.play?.().catch(() => {
      });
    }
    let v = eng.tagName?.toLowerCase() === "video" ? eng : eng.querySelector?.("video") || eng.shadowRoot?.querySelector?.("video");
    if (!v) v = this._findVideoDeep(eng);
    applyToVideo(v);
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
    const hideMute = this._viewMode === "grid";
    btn.hidden = hideMute;
    btn.style.display = hideMute ? "none" : "";
    if (hideMute) return;
    const label = this._streamMuted ? "Unmute live view" : "Mute live view";
    btn.title = label;
    btn.setAttribute("aria-label", label);
    btn.innerHTML = this._streamMuted ? ICONS.volOff : ICONS.volOn;
  }
  _timezoneDisplay() {
    const tz = this._hass?.config?.time_zone || "UTC";
    try {
      const parts = new Intl.DateTimeFormat(void 0, {
        timeZone: tz,
        timeZoneName: "longGeneric"
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
    const nativeOverlayUnmute = source === "native-controls" && this._rotateOverlayActive;
    const needsHaDirectRecovery = this._useHaDirectStreamPath() && !nextMuted && (!nativeOverlayUnmute || this._engineMountedMuted);
    if (needsHaDirectRecovery) {
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
    const popupControlsFsBtn = this._$("#popup-media-fs");
    const popupOpen = this._$("#myPopup")?.classList.contains("is-open");
    const isFullscreen = !!(document.fullscreenElement || document.webkitFullscreenElement);
    const inGridMode = this._viewMode === "grid";
    if (liveBtn)
      liveBtn.hidden = !!popupOpen || isFullscreen || this._rotateOverlayActive || inGridMode;
    const suppressPopupBtn = this._usePopupCustomControls(this._popupMediaType);
    if (popupBtn)
      popupBtn.hidden = isFullscreen || this._rotateOverlayMode === "popup" || suppressPopupBtn;
    if (popupControlsFsBtn)
      popupControlsFsBtn.hidden = this._rotateOverlayMode === "popup";
  }
  _open(id) {
    const ev = this._allDisplayEvents().find((e) => e.id === id);
    if (!ev) return;
    if (this._tab === "kept") {
      if (ev.has_clip) this._showClip(ev, { mediaType: "kept" });
      else this._showSnapshot(ev, { mediaType: "kept" });
      return;
    }
    if (this._tab === "snapshot" || !ev.has_clip && ev.has_snapshot)
      this._showSnapshot(ev);
    else if (ev.has_clip)
      this._showClip(ev, {
        mediaType: this._tab === "kept" ? "kept" : "clip"
      });
    else this._showSnapshot(ev);
  }
  _enter() {
    const v = this._$("#viewer");
    v.style.display = "flex";
    this._openPopup();
  }
  _setLivePopupCover(covered) {
    const engWrap = this._$("#eng-wrap");
    if (!engWrap) return;
    engWrap.classList.toggle("popup-covered", !!covered);
  }
  _isTouchPopupUi() {
    return DEVICE_PROFILE.hasTouch || this._isMobileTabletViewport();
  }
  _isPhonePopupUi() {
    if (DEVICE_PROFILE.isPhone) return true;
    const coarse = window.matchMedia?.("(pointer: coarse)")?.matches || window.matchMedia?.("(any-pointer: coarse)")?.matches || false;
    return coarse && Math.min(window.innerWidth || 0, window.innerHeight || 0) <= 560;
  }
  _isPopupVideoMediaType(mediaType) {
    return ["alert", "clip", "recording", "kept"].includes(
      String(mediaType || "").toLowerCase()
    );
  }
  _usePopupCustomControls(mediaType) {
    return this._isPhonePopupUi() && this._isPopupVideoMediaType(mediaType);
  }
  _ensurePopupFullscreenButton(kind = "media") {
    const viewer = this._$("#viewer");
    if (!viewer) return;
    if (this._usePopupCustomControls(kind)) {
      const existingBtn = viewer.querySelector("#popup-fs-btn");
      if (existingBtn) existingBtn.remove();
      return;
    }
    const label = kind === "alert" ? "Fullscreen alert" : kind === "recording" ? "Fullscreen recording" : "Fullscreen media";
    const existing = viewer.querySelector("#popup-fs-btn");
    if (existing) {
      existing.title = label;
      existing.setAttribute("aria-label", label);
      return;
    }
    const btn = document.createElement("button");
    btn.className = "glass-btn overlay-fs popup-fs-btn";
    btn.id = "popup-fs-btn";
    btn.title = label;
    btn.setAttribute("aria-label", label);
    btn.innerHTML = ICONS.expand;
    viewer.appendChild(btn);
  }
  _clearPopupMediaCleanup() {
    if (this._popupControlsHideTimer) {
      clearTimeout(this._popupControlsHideTimer);
      this._popupControlsHideTimer = null;
    }
    if (this._popupMediaControlsCleanup) {
      try {
        this._popupMediaControlsCleanup();
      } catch (_) {
      }
    }
    this._popupMediaControlsCleanup = null;
    if (!this._popupMediaCleanup) return;
    try {
      this._popupMediaCleanup();
    } catch (_) {
    }
    this._popupMediaCleanup = null;
    this._destroyRecordingHls();
  }
  _destroyRecordingHls() {
    if (!this._recordingHls) return;
    try {
      this._recordingHls.destroy();
    } catch (_) {
    }
    this._recordingHls = null;
  }
  async _getHlsJsCtor() {
    const existing = window.Hls;
    if (existing) return existing;
    if (!this._hlsJsCtorPromise) {
      this._hlsJsCtorPromise = new Promise((resolve) => {
        const script = document.createElement("script");
        script.src = "https://cdn.jsdelivr.net/npm/hls.js@1.5.17/dist/hls.min.js";
        script.async = true;
        script.onload = () => resolve(window.Hls || null);
        script.onerror = () => resolve(null);
        document.head.appendChild(script);
      });
    }
    return await this._hlsJsCtorPromise;
  }
  _recordingPreferHls() {
    return DEVICE_PROFILE.isIOS || this._isFirefox() || this._isEdge();
  }
  _bindPopupMediaListener(target, type, handler, options) {
    if (!target) return null;
    target.addEventListener(type, handler, options);
    return () => target.removeEventListener(type, handler, options);
  }
  _popupMediaVideo() {
    const viewer = this._$("#viewer");
    if (!viewer) return null;
    return viewer.querySelector("video");
  }
  _popupMediaCurrentId() {
    if (this._playing?.id) return this._playing.id;
    return "";
  }
  _showPopupControlsTemporarily() {
    const controls = this._$("#popup-media-controls");
    if (!controls || controls.hidden) return;
    controls.classList.remove("is-hidden");
    if (this._popupControlsHideTimer)
      clearTimeout(this._popupControlsHideTimer);
    if (this._rotateOverlayMode !== "popup") return;
    this._popupControlsHideTimer = setTimeout(() => {
      const el = this._$("#popup-media-controls");
      if (el && !el.hidden) el.classList.add("is-hidden");
    }, 2200);
  }
  _updatePopupMediaButtons(video) {
    const playBtn = this._$("#popup-media-play");
    const muteBtn = this._$("#popup-media-mute");
    const progress = this._$("#popup-media-progress");
    const time = this._$("#popup-media-time");
    if (!playBtn || !muteBtn || !progress || !time) return;
    const dur = Number(video?.duration || 0);
    const cur = Number(video?.currentTime || 0);
    const ratio = dur > 0 ? Math.max(0, Math.min(1, cur / dur)) : 0;
    progress.value = String(Math.round(ratio * 1e3));
    playBtn.innerHTML = video && !video.paused ? ICONS.pause : ICONS.play;
    muteBtn.innerHTML = video?.muted ? ICONS.volOff : ICONS.volOn;
    time.textContent = `${this._fmtScrubTime(cur)}/${this._fmtScrubTime(dur)}`;
  }
  _togglePopupMediaPlay() {
    const v = this._popupMediaVideo();
    if (!v) return;
    if (v.paused) v.play?.().catch(() => {
    });
    else v.pause?.();
    this._showPopupControlsTemporarily();
    this._updatePopupMediaButtons(v);
  }
  _togglePopupMediaMute() {
    const v = this._popupMediaVideo();
    if (!v) return;
    v.muted = !v.muted;
    this._showPopupControlsTemporarily();
    this._updatePopupMediaButtons(v);
  }
  _initPopupMediaControls(video, mediaType) {
    const controls = this._$("#popup-media-controls");
    if (!controls || !video) return;
    const shouldUse = this._usePopupCustomControls(mediaType);
    video.controls = !shouldUse;
    if (shouldUse) video.removeAttribute("controls");
    else video.setAttribute("controls", "");
    controls.hidden = !shouldUse;
    controls.classList.remove("is-hidden");
    if (!shouldUse) return;
    const progress = this._$("#popup-media-progress");
    let progressDragging = false;
    const removers = [];
    const bind = (t, e, h, o) => {
      const off = this._bindPopupMediaListener(t, e, h, o);
      if (off) removers.push(off);
    };
    const sync = () => {
      const playBtn = this._$("#popup-media-play");
      const muteBtn = this._$("#popup-media-mute");
      const time = this._$("#popup-media-time");
      if (playBtn) playBtn.innerHTML = !video.paused ? ICONS.pause : ICONS.play;
      if (muteBtn) muteBtn.innerHTML = video.muted ? ICONS.volOff : ICONS.volOn;
      if (time)
        time.textContent = `${this._fmtScrubTime(video.currentTime || 0)}/${this._fmtScrubTime(video.duration || 0)}`;
      if (!progressDragging) this._updatePopupMediaButtons(video);
    };
    if (progress) {
      bind(progress, "input", () => {
        progressDragging = true;
        const dur = Number(video.duration || 0);
        const next = Number(progress.value || 0) / 1e3 * dur;
        if (Number.isFinite(next) && dur > 0) {
          video.currentTime = Math.max(0, Math.min(dur, next));
        }
        this._showPopupControlsTemporarily();
        sync();
      });
      bind(progress, "change", () => {
        progressDragging = false;
        this._showPopupControlsTemporarily();
        sync();
      });
      bind(progress, "pointerdown", () => {
        progressDragging = true;
        if (this._popupControlsHideTimer)
          clearTimeout(this._popupControlsHideTimer);
      });
      bind(progress, "pointerup", () => {
        progressDragging = false;
        this._showPopupControlsTemporarily();
      });
      bind(
        progress,
        "touchstart",
        () => {
          progressDragging = true;
        },
        { passive: true }
      );
      bind(
        progress,
        "touchend",
        () => {
          progressDragging = false;
          this._showPopupControlsTemporarily();
        },
        { passive: true }
      );
    }
    bind(controls, "pointerdown", () => {
      if (this._popupControlsHideTimer)
        clearTimeout(this._popupControlsHideTimer);
      controls.classList.remove("is-hidden");
    });
    bind(controls, "pointerup", () => this._showPopupControlsTemporarily());
    bind(
      controls,
      "touchstart",
      () => {
        if (this._popupControlsHideTimer)
          clearTimeout(this._popupControlsHideTimer);
        controls.classList.remove("is-hidden");
      },
      { passive: true }
    );
    bind(controls, "touchend", () => this._showPopupControlsTemporarily(), {
      passive: true
    });
    [
      "play",
      "pause",
      "timeupdate",
      "durationchange",
      "loadedmetadata",
      "volumechange",
      "seeking",
      "seeked"
    ].forEach((evt) => bind(video, evt, sync));
    const showOnInteraction = () => this._showPopupControlsTemporarily();
    ["touchstart", "pointerdown", "mousemove", "click"].forEach(
      (evt) => bind(video, evt, showOnInteraction, { passive: true })
    );
    sync();
    this._popupMediaControlsCleanup = () => {
      removers.forEach((off) => {
        try {
          off();
        } catch (_) {
        }
      });
      controls.classList.remove("is-hidden");
    };
  }
  _carouselEventItem(ev, activeId = "") {
    if (!ev?.id) return "";
    const thumbFile = "thumbnail.jpg";
    const thumb = `<img src="${this._media(ev.id, thumbFile)}" loading="lazy" data-thumb-id="${ev.id}" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"><div class="tph" style="display:none">${ICONS.person}</div>`;
    const active = ev.id === activeId ? " active" : "";
    return `<button class="popup-carousel-item${active}" data-ev="${ev.id}" title="${this._dateTimeLabel(ev.start_time || 0)}"><div class="et">${thumb}</div><div class="popup-carousel-meta"><span>${cap(ev.label || "event")}</span><span>${this._time(ev.start_time || 0)}</span></div></button>`;
  }
  _popupCarouselEvents(mediaType) {
    const type = String(mediaType || "").toLowerCase();
    if (type === "kept") {
      return [...this._kept || []].sort(
        (a, b) => b.start_time - a.start_time
      );
    }
    if (type === "alert") {
      const out = [];
      const seen = new Set();
      const reviews = [...this._reviews || []].sort(
        (a, b) => b.start_time - a.start_time
      );
      for (const r of reviews) {
        const firstDet = r.data?.detections && r.data.detections[0] || "";
        if (!firstDet || seen.has(firstDet)) continue;
        const ev = this._findEventById(firstDet);
        if (!ev) continue;
        seen.add(firstDet);
        out.push(ev);
      }
      return out;
    }
    const all = this._allDisplayEvents().sort(
      (a, b) => b.start_time - a.start_time
    );
    if (type === "snapshot") return all.filter((e) => e.has_snapshot);
    return all.filter((e) => e.has_clip);
  }
  _renderPopupCarousel(mediaType, activeId = "") {
    const wrap = this._$("#popup-carousel-wrap");
    const row = this._$("#popup-carousel");
    if (!wrap || !row) return;
    const show = ["alert", "clip", "snapshot", "kept"].includes(
      String(mediaType || "").toLowerCase()
    );
    if (!show) {
      wrap.hidden = true;
      row.innerHTML = "";
      return;
    }
    const events = this._popupCarouselEvents(mediaType).slice(0, 200);
    if (!events.length) {
      wrap.hidden = true;
      row.innerHTML = "";
      return;
    }
    row.innerHTML = events.map((ev) => this._carouselEventItem(ev, activeId)).join("");
    row.scrollLeft = 0;
    wrap.hidden = false;
    wrap.classList.toggle("touch", this._isTouchPopupUi());
    requestAnimationFrame(() => {
      const active = row.querySelector(".popup-carousel-item.active");
      if (active) {
        const left = Math.max(0, active.offsetLeft - 8);
        row.scrollLeft = left;
      }
    });
  }
  _scrollPopupCarousel(dir = 1) {
    const row = this._$("#popup-carousel");
    if (!row) return;
    const item = row.querySelector(".popup-carousel-item");
    const step = (item?.getBoundingClientRect?.().width || 132) + 8;
    row.scrollBy({ left: step * (dir < 0 ? -1 : 1), behavior: "smooth" });
  }
  _renderPopupMedia({
    playingId,
    html,
    mediaElement,
    fullscreenKind,
    infoEvent,
    infoOpts
  }) {
    this._enter();
    if (this._popupMediaStopTimer) {
      clearTimeout(this._popupMediaStopTimer);
      this._popupMediaStopTimer = null;
    }
    this._playing = playingId ? { id: playingId } : null;
    this._popupMediaType = String(
      infoOpts?.mediaType || fullscreenKind || ""
    ).toLowerCase();
    const viewer = this._$("#viewer");
    viewer.innerHTML = "";
    if (mediaElement instanceof Element) {
      viewer.appendChild(mediaElement);
    } else {
      viewer.innerHTML = html || "";
    }
    const body = this._$("#myPopup")?.querySelector(".popup-body");
    if (body) body.scrollTop = 0;
    this._ensurePopupFullscreenButton(fullscreenKind);
    this._renderPopupInfo(infoEvent, infoOpts);
    const video = viewer.querySelector("video");
    if (video) {
      this._initPopupMediaControls(video, this._popupMediaType);
    } else {
      const controls = this._$("#popup-media-controls");
      if (controls) {
        controls.hidden = true;
        controls.classList.remove("is-hidden");
      }
    }
    this._renderPopupCarousel(
      this._popupMediaType,
      this._popupMediaCurrentId()
    );
    this._scheduleRotateOverlayUpdate();
    this._showPopupControlsTemporarily();
  }
  _media(id, file, dl) {
    return `/api/frigate/${this._cc().clientId}/notifications/${id}/${file}${dl ? "?download=true" : ""}`;
  }
  _buildPopupVideo(src, { autoplay = true, muted = true } = {}) {
    const video = document.createElement("video");
    video.controls = true;
    video.playsInline = true;
    video.setAttribute("playsinline", "");
    video.setAttribute("webkit-playsinline", "");
    video.preload = "metadata";
    video.muted = muted;
    if (autoplay) video.autoplay = true;
    video.src = src;
    return video;
  }
  _showClip(ev, opts = {}) {
    const src = this._media(ev.id, isIOS ? "master.m3u8" : "clip.mp4");
    const mediaType = opts.mediaType || "clip";
    this._renderPopupMedia({
      playingId: ev.id,
      mediaElement: this._buildPopupVideo(src),
      fullscreenKind: mediaType,
      infoEvent: ev,
      infoOpts: { mediaType }
    });
  }
  _showClipById(id, opts = {}) {
    if (!id) return;
    const src = this._media(id, isIOS ? "master.m3u8" : "clip.mp4");
    this._renderPopupMedia({
      playingId: id,
      mediaElement: this._buildPopupVideo(src),
      fullscreenKind: opts.mediaType || "clip",
      infoEvent: this._findEventById(id),
      infoOpts: {
        id,
        mediaType: opts.mediaType || "clip",
        startTime: opts.startTime,
        camera: opts.camera
      }
    });
  }
  _showSnapshot(ev, opts = {}) {
    const mediaType = opts.mediaType || "snapshot";
    this._renderPopupMedia({
      playingId: ev.id,
      html: `<img class="snap" src="${this._media(ev.id, "snapshot.jpg")}">`,
      fullscreenKind: mediaType,
      infoEvent: ev,
      infoOpts: { mediaType }
    });
  }
  async _tryRecordingSource(video, src, { autoplay = true, timeoutMs = 9e3 } = {}) {
    if (!video || !src) return false;
    const isHlsSource = /\.m3u8(?:$|\?)/i.test(src);
    this._destroyRecordingHls();
    return await new Promise((resolve) => {
      let done = false;
      const finish = (ok) => {
        if (done) return;
        done = true;
        cleanup();
        resolve(ok);
      };
      const onReady = async () => {
        if (!autoplay) {
          finish(true);
          return;
        }
        try {
          await video.play?.();
          finish(true);
        } catch (_) {
          finish(true);
        }
      };
      const onErr = () => finish(false);
      const cleanup = () => {
        clearTimeout(timer);
        video.removeEventListener("loadedmetadata", onReady);
        video.removeEventListener("canplay", onReady);
        video.removeEventListener("error", onErr);
      };
      const timer = setTimeout(() => finish(false), timeoutMs);
      video.addEventListener("loadedmetadata", onReady, { once: true });
      video.addEventListener("canplay", onReady, { once: true });
      video.addEventListener("error", onErr, { once: true });
      const boot = async () => {
        try {
          if (!isHlsSource) {
            video.src = src;
            video.load();
            return;
          }
          const canNativeHls = !!video.canPlayType(
            "application/vnd.apple.mpegurl"
          );
          if (canNativeHls) {
            video.src = src;
            video.load();
            return;
          }
          const HlsCtor = await this._getHlsJsCtor();
          if (!HlsCtor || !HlsCtor.isSupported?.()) {
            finish(false);
            return;
          }
          const hls = new HlsCtor({
            enableWorker: true,
            maxBufferLength: 60,
            backBufferLength: 90
          });
          this._recordingHls = hls;
          hls.on(HlsCtor.Events.ERROR, (_evt, data) => {
            if (data?.fatal) finish(false);
          });
          hls.attachMedia(video);
          hls.on(HlsCtor.Events.MEDIA_ATTACHED, () => {
            hls.loadSource(src);
          });
        } catch (_) {
          finish(false);
        }
      };
      void boot();
    });
  }
  //Play Recordings
  async _showRecording(s, e) {
    const start = s;
    const token = ++this._playSeq;
    this._enter();
    this._clearPopupMediaCleanup();
    this._popupMediaType = "recording";
    this._playing = { rec: s };
    const { clientId, cam } = this._cc();
    const maxChunk = 3600;
    const chunkEnd = Math.min(e, start + maxChunk);
    const clipDur = chunkEnd - start;
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
      recEnd: e
    });
    const viewer = this.shadowRoot.querySelector("#viewer");
    viewer.innerHTML = '<div class="ld">Loading\u2026</div>';
    if (this._playSeq !== token) return;
    viewer.innerHTML = `<video controls playsinline webkit-playsinline preload="metadata" muted></video>`;
    const video = viewer.querySelector("video");
    let playable = false;
    let activeSource = "";
    const mediaCleanup = [];
    if (video) {
      let resumeAfterNativeSeek = false;
      const onSeeking = () => {
        if (!video.seeking) return;
        if (!video.paused) {
          resumeAfterNativeSeek = true;
          video.pause?.();
        }
      };
      const onSeeked = () => {
        if (!resumeAfterNativeSeek) return;
        resumeAfterNativeSeek = false;
        video.play?.().catch(() => {
        });
      };
      video.addEventListener("seeking", onSeeking);
      video.addEventListener("seeked", onSeeked);
      mediaCleanup.push(() => video.removeEventListener("seeking", onSeeking));
      mediaCleanup.push(() => video.removeEventListener("seeked", onSeeked));
      const recPath = `/api/frigate/${encodeURIComponent(clientId)}/recording/${encodeURIComponent(cam)}/start/${start}/end/${chunkEnd}`;
      const vodBase = `/api/frigate/${encodeURIComponent(clientId)}/vod/${encodeURIComponent(cam)}/start/${start}/end/${chunkEnd}`;
      const sourceCandidates = this._recordingPreferHls() ? [`${vodBase}/index.m3u8`, `${vodBase}/master.m3u8`, recPath] : [recPath, `${vodBase}/index.m3u8`, `${vodBase}/master.m3u8`];
      for (const path of sourceCandidates) {
        if (this._playSeq !== token) return;
        const signed = await this._signed(path);
        if (this._playSeq !== token) return;
        playable = await this._tryRecordingSource(video, signed, {
          autoplay: true
        });
        if (playable) {
          activeSource = signed;
          break;
        }
      }
      if (!playable) {
        for (const fn of mediaCleanup) {
          try {
            fn();
          } catch (_) {
          }
        }
        viewer.innerHTML = '<div class="ld">Unable to load recording</div>';
        this._teardownRecordingScrub();
        const scrub = this._$("#recording-scrub");
        if (scrub) scrub.hidden = true;
        return;
      }
    }
    this._ensurePopupFullscreenButton("recording");
    this._scheduleRotateOverlayUpdate();
    if (video && playable) {
      this._initPopupMediaControls(video, "recording");
      this._initRecordingScrub({
        clientId,
        cam,
        start: s,
        end: chunkEnd,
        video,
        token,
        sourceUrl: activeSource || video.currentSrc || video.src
      });
    }
    this._renderPopupCarousel("recording", "");
    this._showPopupControlsTemporarily();
    this._popupMediaCleanup = () => {
      for (const fn of mediaCleanup) {
        try {
          fn();
        } catch (_) {
        }
      }
    };
  }
  async _signed(path) {
    try {
      const r = await this._hass.callWS({
        type: "auth/sign_path",
        path,
        expires: 3600
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
      "ha-camera-stream,ha-hls-player,webrtc-camera"
    );
    if (hosts && hosts.length) {
      for (const h of hosts) {
        const v = h.shadowRoot?.querySelector("video") || h.querySelector?.("video");
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
      video = this._findVideoDeep(this._$("#engine")) || this._findVideoDeep(this._engine);
    }
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1;
    if (iOS && video) {
      const enterVideoFs = video.webkitEnterFullscreen || video.webkitEnterFullScreen;
      if (typeof enterVideoFs === "function") {
        try {
          enterVideoFs.call(video);
          return;
        } catch (_) {
        }
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
      } catch (_) {
      }
    }
  }
  _goNow() {
    this._followNowWindow = true;
    const now = Math.floor(Date.now() / 1e3);
    this._winEnd = now;
    this._winStart = now - this._config.window_days * DAY;
    this._exhausted = false;
    this._calMonth = null;
    this._pruneNonActiveCamWindowCaches();
    void (async () => {
      await this._loadWindow(true);
      this._scheduleWarmOtherCamerasEvents();
    })();
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
    this._hass.callWS({
      type: "frigate/event/retain",
      instance_id: clientId,
      event_id: id,
      retain: next
    }).catch((err) => {
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
      this._toast("Could not save \u2014 check Frigate port config.");
    });
  }
  // ── browse / filter ───────────────────────────────────────
  _applyBrowse() {
    const b = this._$("#browse");
    if (b) b.style.display = "block";
  }
  _toggleBrowse() {
    this._browseOpen = !this._browseOpen;
    this._applyBrowse();
  }
  _toast(msg, ms = 3500) {
    const t = this._$("#toast");
    if (!t) return;
    t.textContent = msg;
    t.style.display = "block";
    clearTimeout(this._toastT);
    this._toastT = setTimeout(() => {
      t.style.display = "none";
    }, ms);
  }
  _toggleFilter() {
    if (this._tab === "recordings") return;
    const p = this._$("#filter-panel");
    if (!p) return;
    const open = p.style.display === "none";
    const cal = this._$("#cal-panel");
    if (cal) cal.style.display = "none";
    p.style.display = open ? "block" : "none";
    if (open) this._renderFilter();
  }
  _toggleCal() {
    const p = this._$("#cal-panel");
    if (!p) return;
    const open = p.style.display === "none";
    const filter = this._$("#filter-panel");
    if (filter) filter.style.display = "none";
    p.style.display = open ? "block" : "none";
    if (open) {
      if (!this._calMonth) {
        const z = this._tzParts(this._winEnd);
        this._calMonth = this._createCalendarMonthDate(z.year, z.month - 1);
      }
      this._applyCalendarActivityCacheForActiveCamera();
      this._renderCal();
      void this._prefetchCalendarActivityForActiveCamera();
    }
  }
  // ── calendar ──────────────────────────────────────────────
  _createCalendarMonthDate(year, monthIndex) {
    return new Date(Date.UTC(year, monthIndex, 15, 12, 0, 0));
  }
  _resolveCalendarMonthDate() {
    if (this._calMonth instanceof Date) {
      return new Date(this._calMonth);
    }
    const z = this._tzParts(this._winEnd);
    return this._createCalendarMonthDate(z.year, z.month - 1);
  }
  _calNav(d) {
    const m = this._resolveCalendarMonthDate();
    m.setUTCMonth(m.getUTCMonth() + d);
    this._calMonth = new Date(m);
    this._renderCal();
  }
  _pickDay(ds) {
    this._followNowWindow = false;
    const [y, mo, da] = ds.split("-").map(Number);
    this._winStart = this._tzDateTimeToEpochSeconds(y, mo, da, 0, 0, 0);
    this._winEnd = Math.min(
      this._tzDateTimeToEpochSeconds(y, mo, da, 23, 59, 59),
      Math.floor(Date.now() / 1e3)
    );
    this.shadowRoot.querySelector("#cal-panel").style.display = "none";
    this._pruneNonActiveCamWindowCaches();
    void (async () => {
      await this._loadWindow(true);
      this._scheduleWarmOtherCamerasEvents();
    })();
  }
  _renderCal() {
    const p = this.shadowRoot.querySelector("#cal-panel");
    if (!p) return;
    const m = this._resolveCalendarMonthDate();
    const y = m.getUTCFullYear(), mo = m.getUTCMonth();
    const first = new Date(Date.UTC(y, mo, 1, 12, 0, 0));
    const startDow = (first.getUTCDay() + 6) % 7;
    const days = new Date(Date.UTC(y, mo + 1, 0, 12, 0, 0)).getUTCDate();
    let cells = "";
    for (let i = 0; i < startDow; i++) cells += "<span></span>";
    for (let d = 1; d <= days; d++) {
      const ds = `${y}-${String(mo + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      cells += `<button class="cday" data-cal-day="${ds}">${d}${this._daysWithActivity.has(ds) ? '<i class="cdot"></i>' : ""}</button>`;
    }
    const monthLabel = new Intl.DateTimeFormat([], {
      month: "long",
      year: "numeric",
      timeZone: this._tz()
    }).format(m);
    p.innerHTML = `<div class="cal-head"><button data-cal-nav="-1">\u2039</button><b>${monthLabel}</b><button data-cal-nav="1">\u203A</button></div>
      <div class="cal-dow"><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span><span>S</span></div>
      <div class="cal-grid">${cells}</div>`;
  }
  _renderFilter() {
    const p = this.shadowRoot.querySelector("#filter-panel");
    if (!p) return;
    this._normalizeFilterSelections();
    const lbls = ["all", ...this._labels()];
    const zones = ["all", ...this._zones()];
    const chip = (val, cur, attr) => `<button class="chip ${val === cur ? "on" : ""}" data-${attr}="${val}">${val === "all" ? "All" : cap(val)}</button>`;
    p.innerHTML = `<div class="frow"><span class="frow-l">Label</span>${lbls.map((l) => chip(l, this._filterLabel, "flabel")).join("")}</div>
      <div class="frow"><span class="frow-l">Zone</span>${zones.map((z) => chip(z, this._filterZone, "fzone")).join("")}</div>
      <div class="frow"><span class="frow-l">Show</span>
        <button class="chip ${!this._favOnly ? "on" : ""}" data-favonly="0">All</button>
        <button class="chip ${this._favOnly ? "on" : ""}" data-favonly="1">\u2605 Favorites</button></div>`;
  }
  async _loadOlder() {
    const before = this._events.length ? Math.floor(Math.min(...this._events.map((e) => e.start_time))) : this._winStart;
    this._loading = true;
    const { clientId, cam } = this._cc();
    try {
      const older = await this._ws({
        type: "frigate/events/get",
        instance_id: clientId,
        cameras: [cam],
        before,
        limit: 50
      });
      const arr = Array.isArray(older) ? older.filter((o) => !this._events.some((e) => e.id === o.id)) : [];
      if (!arr.length) this._exhausted = true;
      else {
        this._events = this._events.concat(arr);
        this._winStart = Math.min(
          this._winStart,
          ...arr.map((e) => e.start_time)
        );
      }
    } catch (_) {
    }
    this._loading = false;
    this._renderList();
    this._renderSubtitle();
  }
  // ── render ────────────────────────────────────────────────
  _syncStatus() {
    const ent = this._hass?.states?.[this._activeCam?.entity];
    if (!ent) return;
    const dot = this._$("#on-dot"), lbl = this._$("#on-lbl"), title = this._$("#info-title");
    const ok = ent.state !== "unavailable";
    if (dot) dot.style.color = ok ? "#4ade80" : "#ef4444";
    if (lbl) lbl.textContent = ok ? "Online" : "Offline";
    if (title) {
      const c = this._activeCam;
      const n = this._config.title || (this._config.cameras.length > 1 ? cap(camDisplayName(c)) : "Camera");
      title.textContent = n;
    }
  }
  // Cached querySelector — avoids repeated DOM lookups on every render tick
  _$(sel) {
    return this._domCache[sel] || (this._domCache[sel] = this.shadowRoot.querySelector(sel));
  }
  _renderAll() {
    if (this._isPreviewPageActive()) {
      this._renderPreviewPage();
      return;
    }
    this._renderStats();
    this._renderMuteButton();
    this._syncFullscreenButtonsVisibility();
    this._syncToolbarButtons();
    this._renderLegend();
    this._renderSubtitle();
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
  _subtitleText() {
    return this._config?.subtitle || "Frigate";
  }
  _renderSubtitle() {
    const el = this._$("#tl-range");
    if (!el) return;
    el.textContent = this._subtitleText();
  }
  _renderLegend() {
    const el = this._$("#legend");
    if (!el) return;
    const labels = this._labels();
    let html = labels.map(
      (l) => `<span class="lg"><i style="background:${labelColor(l)}"></i>${cap(l)}</span>`
    ).join("");
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
    return new Date(ts * 1e3).toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
      timeZone: this._tz()
    }).toLowerCase();
  }
  _weekday(ts) {
    return new Date(ts * 1e3).toLocaleDateString("en-US", {
      weekday: "short",
      timeZone: this._tz()
    });
  }
  _monthDay(ts, { ordinal = false } = {}) {
    const parts = new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      timeZone: this._tz()
    }).formatToParts(new Date(ts * 1e3));
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
    const fallback = {
      recordings: "Recordings",
      clips: "Recent Clips",
      snapshot: "Recent Snaps",
      alerts: "Recent Alerts",
      kept: "Kept"
    }[this._tab] || cap(this._tab || "");
    if (!ts || !["alerts", "clips", "snapshot"].includes(this._tab)) {
      return fallback;
    }
    return `${this._weekday(ts)} - ${this._monthDay(ts, { ordinal: true })} - ${fallback}`;
  }
  _recordingsHeadingLabel(ts = null) {
    const target = Math.floor(ts || this._winEnd || Date.now() / 1e3);
    return `${this._weekday(target)} - ${this._monthDay(target, { ordinal: true })} - Recordings`;
  }
  _showStickyDayHeaders() {
    return ["alerts", "clips", "snapshot"].includes(this._tab);
  }
  _renderListLabel(ts = null) {
    const lbl = this._$("#browse-head-label");
    const browseHead = this._$("#browse-head");
    const prev = this._$("#rec-day-prev");
    const next = this._$("#rec-day-next");
    if (!lbl || !browseHead) return;
    browseHead.style.display = "flex";
    if (this._tab === "recordings") {
      lbl.textContent = this._recordingsHeadingLabel(ts || this._winEnd);
      const showButtons = !this._$("#card")?.classList.contains("mobile");
      if (prev) prev.style.display = showButtons ? "inline-flex" : "none";
      if (next) next.style.display = showButtons ? "inline-flex" : "none";
      void this._updateRecordingsBrowseNav();
      return;
    }
    if (prev) prev.style.display = "none";
    if (next) next.style.display = "none";
    lbl.textContent = this._listHeadingLabel(ts);
  }
  _dayKey(ts) {
    const parts = new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      timeZone: this._tz()
    }).formatToParts(new Date(ts * 1e3));
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
          ts: Math.floor(ts || 0),
          label: this._listHeadingLabel(ts || null),
          rows: []
        });
      }
      sections[sections.length - 1].rows.push(renderItem(item));
    }
    return sections.map((section, idx) => {
      const extraClass = idx === 0 ? " list-day-label-first" : "";
      const ts = Number.isFinite(section.ts) ? Math.floor(section.ts) : 0;
      return `<section class="list-day-sec"><div class="list-day-label${extraClass}" data-day-ts="${ts}" data-day-label="${section.label}">${section.label}</div>${section.rows.join("")}</section>`;
    }).join("");
  }
  _recordingsDayBounds(tsSec = null) {
    const target = Math.floor(tsSec || this._winEnd || Date.now() / 1e3);
    const z = this._tzParts(target);
    const start = this._tzDateTimeToEpochSeconds(
      z.year,
      z.month,
      z.day,
      0,
      0,
      0
    );
    const end = this._tzDateTimeToEpochSeconds(
      z.year,
      z.month,
      z.day,
      23,
      59,
      59
    );
    return { start, end };
  }
  _recordingsOffsetDayBounds(offsetDays = 0) {
    const base = this._tzParts(this._winEnd || Date.now() / 1e3);
    const shifted = new Date(
      Date.UTC(base.year, base.month - 1, base.day + offsetDays, 12, 0, 0)
    );
    const y = shifted.getUTCFullYear();
    const mo = shifted.getUTCMonth() + 1;
    const d = shifted.getUTCDate();
    const start = this._tzDateTimeToEpochSeconds(y, mo, d, 0, 0, 0);
    const end = this._tzDateTimeToEpochSeconds(y, mo, d, 23, 59, 59);
    return { start, end };
  }
  async _hasRecordingsInBounds(bounds, clientId, cam) {
    const key = `${clientId}|${cam}|${bounds.start}|${bounds.end}`;
    if (this._recordingsDayDataCache.has(key)) {
      const cached = this._recordingsDayDataCache.get(key) || [];
      const hasCached = cached.length > 0;
      this._recordingsDayAvailabilityCache.set(key, hasCached);
      return hasCached;
    }
    if (this._recordingsDayAvailabilityCache.has(key)) {
      return this._recordingsDayAvailabilityCache.get(key);
    }
    try {
      const recs = await this._ws({
        type: "frigate/recordings/get",
        instance_id: clientId,
        camera: cam,
        after: Math.max(0, bounds.start),
        before: bounds.end
      });
      const has = Array.isArray(recs) && recs.length > 0;
      this._recordingsDayDataCache.set(key, Array.isArray(recs) ? recs : []);
      this._recordingsDayAvailabilityCache.set(key, has);
      return has;
    } catch (_) {
      this._recordingsDayAvailabilityCache.set(key, false);
      return false;
    }
  }
  async _updateRecordingsBrowseNav() {
    if (this._tab !== "recordings") return;
    const prev = this._$("#rec-day-prev");
    const next = this._$("#rec-day-next");
    if (!prev || !next) return;
    const { clientId, cam } = this._cc();
    if (!clientId || !cam) {
      prev.disabled = true;
      next.disabled = true;
      return;
    }
    const token = ++this._recordingsNavUpdateToken;
    prev.disabled = true;
    next.disabled = true;
    const current = this._recordingsDayBounds();
    const today = this._recordingsDayBounds(Math.floor(Date.now() / 1e3));
    const isTodayOrFuture = current.end >= today.end;
    const prevBounds = this._recordingsOffsetDayBounds(-1);
    const hasPrev = await this._hasRecordingsInBounds(
      prevBounds,
      clientId,
      cam
    );
    if (token !== this._recordingsNavUpdateToken) return;
    let hasNext = false;
    if (!isTodayOrFuture) {
      const nextBounds = this._recordingsOffsetDayBounds(1);
      hasNext = await this._hasRecordingsInBounds(nextBounds, clientId, cam);
      if (token !== this._recordingsNavUpdateToken) return;
    }
    prev.disabled = !hasPrev;
    next.disabled = isTodayOrFuture || !hasNext;
  }
  async _stepRecordingsDay(dir) {
    return this._navigateRecordingsDayAnimated(dir);
  }
  _syncBrowseHeadFromScroll() {
    if (!this._showStickyDayHeaders()) return;
    const list = this._$("#list");
    const browse = this._$("#browse");
    const lbl = this._$("#browse-head-label");
    if (!list || !browse || !lbl) return;
    const labels = Array.from(list.querySelectorAll(".list-day-label"));
    if (!labels.length) return;
    const listScrollable = list.scrollHeight > list.clientHeight + 2;
    const scroller = listScrollable ? list : browse;
    const anchorTop = scroller.getBoundingClientRect().top + 2;
    let active = labels[0];
    for (const dayLabel of labels) {
      if (dayLabel.getBoundingClientRect().top <= anchorTop) {
        active = dayLabel;
      } else {
        break;
      }
    }
    const nextLabel = active.dataset.dayLabel || active.textContent || "";
    if (nextLabel) {
      lbl.textContent = nextLabel;
    }
  }
  _dur(ev) {
    return Math.max(
      1,
      Math.round((ev.end_time || Date.now() / 1e3) - ev.start_time)
    );
  }
  _reviewsForTabBase() {
    const showAllReviews = this._activeCam?.alerts_content === "all_reviews";
    const reviewSource = this._isGridMixedListMode() ? this._allGridReviews() : this._reviews;
    return showAllReviews ? [...reviewSource] : reviewSource.filter((review) => review?.severity === "alert");
  }
  _reviewSourceEvent(review) {
    const firstDet = review?.data?.detections && review.data.detections[0] || "";
    return firstDet ? this._findEventById(firstDet) : null;
  }
  _filterOptionSourceEvents() {
    if (this._tab === "alerts") {
      const seen = new Set();
      const out = [];
      this._reviewsForTabBase().forEach((review) => {
        const sourceEvent = this._reviewSourceEvent(review);
        if (!sourceEvent?.id || seen.has(sourceEvent.id)) return;
        seen.add(sourceEvent.id);
        out.push(sourceEvent);
      });
      return out;
    }
    if (this._tab === "kept") {
      return this._isGridMixedListMode() ? this._allGridKeptEvents() : [...this._kept || []];
    }
    return this._allDisplayEvents();
  }
  _matchesEventFilters(ev) {
    if (!ev) return false;
    if (this._filterLabel !== "all" && ev.label !== this._filterLabel) {
      return false;
    }
    if (this._filterZone !== "all" && !(ev.zones || []).includes(this._filterZone)) {
      return false;
    }
    if (this._favOnly && !ev.retain_indefinitely) {
      return false;
    }
    return true;
  }
  _filteredReviews() {
    return this._reviewsForTabBase().filter((review) => {
      const sourceEvent = this._reviewSourceEvent(review);
      if (this._favOnly) return !!sourceEvent?.retain_indefinitely;
      if (this._filterLabel !== "all") {
        const labels = this._reviewFilterLabels(review, sourceEvent);
        if (!labels.includes(this._filterLabel)) return false;
      }
      if (this._filterZone !== "all") {
        const zones = this._reviewFilterZones(review, sourceEvent);
        if (!zones.includes(this._filterZone)) return false;
      }
      return true;
    });
  }
  _filteredKept() {
    const source = this._isGridMixedListMode() ? this._allGridKeptEvents() : this._kept || [];
    return source.filter((ev) => this._matchesEventFilters(ev));
  }
  _normalizeFilterSelections() {
    const labels = this._labels();
    const zones = this._zones();
    if (this._filterLabel !== "all" && !labels.includes(this._filterLabel)) {
      this._filterLabel = "all";
    }
    if (this._filterZone !== "all" && !zones.includes(this._filterZone)) {
      this._filterZone = "all";
    }
  }
  _zones() {
    if (this._tab === "alerts") {
      const zones = new Set();
      this._reviewsForTabBase().forEach((review) => {
        const sourceEvent = this._reviewSourceEvent(review);
        this._reviewFilterZones(review, sourceEvent).forEach(
          (zone) => zones.add(zone)
        );
      });
      return [...zones];
    }
    const z = new Set();
    this._filterOptionSourceEvents().forEach(
      (e) => (e.zones || []).forEach((x) => z.add(x))
    );
    return [...z];
  }
  _labels() {
    if (this._tab === "alerts") {
      const labels = new Set();
      this._reviewsForTabBase().forEach((review) => {
        const sourceEvent = this._reviewSourceEvent(review);
        this._reviewFilterLabels(review, sourceEvent).forEach(
          (label) => labels.add(label)
        );
      });
      return [...labels];
    }
    const l = new Set();
    this._filterOptionSourceEvents().forEach((e) => e.label && l.add(e.label));
    return [...l];
  }
  _reviewFilterLabels(review, sourceEvent = null) {
    const labels = new Set();
    if (sourceEvent?.label) labels.add(sourceEvent.label);
    (review?.data?.objects || []).forEach((label) => {
      if (label) labels.add(label);
    });
    return [...labels];
  }
  _reviewFilterZones(review, sourceEvent = null) {
    const zones = new Set();
    (sourceEvent?.zones || []).forEach((zone) => {
      if (zone) zones.add(zone);
    });
    (review?.data?.zones || []).forEach((zone) => {
      if (zone) zones.add(zone);
    });
    return [...zones];
  }
  _filtered() {
    let list = this._allDisplayEvents();
    if (this._tab === "clips") list = list.filter((e) => e.has_clip);
    else if (this._tab === "snapshot")
      list = list.filter((e) => e.has_snapshot);
    list = list.filter((e) => this._matchesEventFilters(e));
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
      (a, b) => a.start_time - b.start_time
    );
    if (!merged.length) return [];
    const now = Math.floor(this._winEnd || Date.now() / 1e3);
    const currentHourStart = Math.floor(now / 3600) * 3600;
    const firstHourStart = currentHourStart - 23 * 3600;
    const out = [];
    for (let i = 0; i < 24; i++) {
      const bucketStart = firstHourStart + i * 3600;
      const bucketEnd = bucketStart + 3600;
      const rowEnd = Math.min(bucketEnd, now);
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
          events
        });
      }
    }
    return out;
  }
  _favIcon(ev) {
    return ev.retain_indefinitely ? `<button class="ico fav on" data-fav="${ev.id}">${ICONS.star}</button>` : `<button class="ico fav" data-fav="${ev.id}">${ICONS.starO}</button>`;
  }
  _eventCardHTML(ev, expanded, compact = false) {
    const col = labelColor(ev.label);
    const score = ev.top_score != null ? Math.round(ev.top_score * 100) + "%" : "";
    const reviewSev = ev.severity === "alert" ? "alert" : ev.severity === "detection" ? "detection" : "";
    const reviewBar = this._tab === "kept" && reviewSev ? `<div class="rev-sev ${reviewSev}"></div>` : "";
    const zone = ev.zones && ev.zones.length ? ev.zones[0] : "";
    const subl = ev.sub_label ? `<span class="subl">${ev.sub_label}</span>` : "";
    const desc = expanded && ev.data?.description ? `<div class="desc">${ev.data.description}</div>` : "";
    const thumbFile = "thumbnail.jpg";
    const thumbSrc = this._media(ev.id, thumbFile);
    const thumb = ev.has_snapshot || ev.has_clip ? `<img src="${thumbSrc}" loading="lazy" data-thumb-id="${ev.id}" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"><div class="tph" style="display:none">${ICONS.person}</div>` : `<div class="tph">${ICONS.person}</div>`;
    const badge = ev.has_clip ? '<span class="bc">clip</span>' : ev.has_snapshot ? '<span class="bs">snap</span>' : "";
    const dlClip = ev.has_clip ? `<button class="ico" data-dl="${ev.id}" data-dl-file="clip.mp4" title="Download clip">${ICONS.download}</button>` : "";
    const dlSnap = ev.has_snapshot ? `<button class="ico" data-dl="${ev.id}" data-dl-file="snapshot.jpg" title="Download snapshot">${ICONS.snapshot}</button>` : "";
    const camLabel = (this._eventsMode === "all" || this._isGridMixedListMode()) && this._config.cameras.length > 1 ? `<span class="cam-badge">${(ev.camera || "").replace(/_/g, " ")}</span>` : "";
    return `
    <div class="list-item${compact ? " compact" : ""} shadow-small xform" data-ev="${ev.id}">
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
  _setListHtmlIfChanged(list, html) {
    if (!list) return false;
    const nextHtml = String(html || "");
    if (this._lastRenderedListHtml === nextHtml) return false;
    list.innerHTML = nextHtml;
    this._lastRenderedListHtml = nextHtml;
    return true;
  }
  _renderList() {
    const list = this._$("#list");
    if (!list) return;
    if (this._tab === "recordings") {
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
      const kept = this._filteredKept();
      this._renderListLabel();
      if (!kept.length) {
        this._setListHtmlIfChanged(
          list,
          `<div class="empty">No kept events<br><span style="opacity:.6">star an event to keep it</span></div>`
        );
        this._syncOlderHint(false);
        return;
      }
      this._setListHtmlIfChanged(
        list,
        kept.map((ev) => this._eventCardHTML(ev, false)).join("")
      );
      this._syncOlderHint(false);
      return;
    }
    const events = this._filtered();
    this._renderListLabel(events[0]?.start_time || null);
    if (!events.length) {
      this._setListHtmlIfChanged(
        list,
        `<div class="empty">No events in this window</div>`
      );
      this._syncOlderHint(false);
      return;
    }
    this._setListHtmlIfChanged(
      list,
      (this._showStickyDayHeaders() ? this._renderStickyDaySections(
        events,
        (ev) => this._eventCardHTML(ev, false)
      ) : events.map((ev) => this._eventCardHTML(ev, false)).join("")) + (this._exhausted ? '<div class="end">\u2014 end \u2014</div>' : "")
    );
    this._syncBrowseHeadFromScroll();
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
      this._tab
    );
    const canShowHint = forceHide !== false && supportsHint;
    hint.hidden = !canShowHint;
    if (!canShowHint) {
      hint.classList.remove("to-top");
      hint.textContent = "scroll for older\u2026";
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
    hint.textContent = showTop ? "Click to return to top" : "scroll for older\u2026";
    if (showTop) {
      hint.setAttribute("role", "button");
      hint.setAttribute("tabindex", "0");
    } else {
      hint.removeAttribute("role");
      hint.removeAttribute("tabindex");
    }
  }
  _renderRecordings(list) {
    this._renderListLabel(this._winEnd);
    const recs = this._splitRecsHourly(this._recordings).sort(
      (a, b) => b.start_time - a.start_time
    );
    if (!recs.length) {
      this._setListHtmlIfChanged(
        list,
        '<div class="empty">No recordings in the last 24 hours</div>'
      );
      this._syncOlderHint(true);
      return;
    }
    this._setListHtmlIfChanged(
      list,
      recs.map((r) => {
        const rs = Math.floor(r.start_time), re = Math.floor(r.end_time || Date.now() / 1e3);
        const d = Math.max(1, re - rs);
        const mm = Math.floor(d / 60), ss = d % 60;
        const dur = `${mm ? mm + "m " : ""}${ss}s`;
        return `<div class="list-item shadow-xform shadow-small" data-rs="${rs}" data-re="${re}">
        <div class="ric">${ICONS.recordings}</div>
        <div class="rinf">
          <div class="rt">${this._time(r.start_time)} \u2013 ${this._time(r.end_time || Date.now() / 1e3)}</div>
          <div class="rsub">${dur}${r.events ? " \xB7 " + r.events + " ev" : ""}</div>
        </div>
        <button class="rp" data-rec-dl-start="${rs}" data-rec-dl-end="${re}" title="Download recording" aria-label="Download recording">${ICONS.download}</button>
      </div>`;
      }).join("")
    );
    this._syncOlderHint(false);
  }
  _renderReviews(list) {
    const showAllReviews = this._activeCam?.alerts_content === "all_reviews";
    const filteredReviews = this._filteredReviews();
    const emptyText = showAllReviews ? "No reviews in this window" : "No alerts in this window";
    this._renderListLabel(filteredReviews[0]?.start_time || null);
    if (!filteredReviews.length) {
      this._setListHtmlIfChanged(list, `<div class="empty">${emptyText}</div>`);
      this._syncOlderHint(true);
      return;
    }
    const allRevs = [...filteredReviews].sort(
      (a, b) => b.start_time - a.start_time
    );
    this._renderListLabel(allRevs[0]?.start_time || null);
    if (!allRevs.length) {
      this._setListHtmlIfChanged(
        list,
        '<div class="empty">No alerts in this window</div>'
      );
      this._syncOlderHint(true);
      return;
    }
    this._setListHtmlIfChanged(
      list,
      this._renderStickyDaySections(allRevs, (r) => {
        const sev = r.severity === "alert" ? "alert" : "detection";
        const objs = (r.data?.objects || []).map(cap).join(", ");
        const title = r.data?.metadata?.title || objs || cap(r.severity);
        const firstDet = r.data?.detections && r.data.detections[0] || "";
        const sourceEvent = this._reviewSourceEvent(r);
        const cameraLabel = String(r?.camera || sourceEvent?.camera || "").replace(/_/g, " ").trim();
        const reviewed = r.has_been_reviewed;
        const favEv = firstDet ? this._findEventById(firstDet) : null;
        const favBtn = firstDet ? favEv?.retain_indefinitely ? `<button class="ico fav on" data-fav="${firstDet}" title="Unfavorite">${ICONS.star}</button>` : `<button class="ico fav" data-fav="${firstDet}" title="Favorite">${ICONS.starO}</button>` : "";
        const hasReviewMedia = !!firstDet;
        const reviewThumbFile = "thumbnail.jpg";
        const thumb = firstDet ? hasReviewMedia ? `<div class="et ${sev}">
                <img src="${this._media(firstDet, reviewThumbFile)}" loading="lazy" data-thumb-id="${firstDet}" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
                  <div class="tph" style="display:none">${ICONS.person}</div>
                </div>` : `<div class="tph">${ICONS.person}</div>` : "";
        return `
      <div class="list-item shadow-small xform" data-review-id="${r.id}" ${firstDet ? `data-review-open="${firstDet}"` : ""}>

        ${thumb}

        <div class="rev-inf">
          <div class="rev-t">${title}${cameraLabel ? ` <span class="cam-badge">${cameraLabel}</span>` : ""}</div>
          <div class="rev-m">
            <span class="time-meta">${ICONS.clock}${this._dateTimeLabel(r.start_time)}</span>
            <span class="review-meta">
              ${cap(sev)}${reviewed ? " \xB7 \u2713" : firstDet ? " \xB7 tap" : ""}
            </span>
          </div>
        </div>
        ${favBtn}
      </div>`;
      })
    );
    this._syncBrowseHeadFromScroll();
    this._syncOlderHint(false);
  }
  // ── clip download range ───────────────────────────────────
  async _downloadRecRange(dlStart, dlEnd) {
    const { clientId, cam } = this._cc();
    const start = Math.floor(Number(dlStart) || 0);
    const endRaw = Math.floor(Number(dlEnd) || 0);
    const end = Math.max(start + 1, Math.min(endRaw, start + 7200));
    const base = `/api/frigate/${encodeURIComponent(clientId)}/recording/${encodeURIComponent(cam)}/start/${start}/end/${end}`;
    const signed = await this._signed(`${base}?download=true`);
    const url = signed;
    const a = document.createElement("a");
    a.href = url;
    a.download = `${cam}_${this._time(dlStart).replace(/:/g, "-")}.mp4`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }
};

// src/editor/FrigateViewCardEditor.js
const FrigateViewCardEditor = class extends HTMLElement {
  disconnectedCallback() {
    if (Array.isArray(this._boundDialogActionButtons)) {
      this._boundDialogActionButtons.forEach(({ element, handler }) => {
        element?.removeEventListener?.("click", handler, true);
      });
    }
    this._boundDialogActionButtons = [];
    if (this._onDialogPrimaryActionClick) {
      document.removeEventListener(
        "click",
        this._onDialogPrimaryActionClick,
        true
      );
    }
    if (this._onDialogSecondaryActionClick) {
      document.removeEventListener(
        "click",
        this._onDialogSecondaryActionClick,
        true
      );
    }
    this._dialogActionHooksBound = false;
    this._emitPreviewDraft(null);
  }
  _configSignature(config) {
    try {
      return JSON.stringify(config || {});
    } catch (_) {
      return "";
    }
  }
  setConfig(config) {
    const normalized = this._normalizeConfig(config);
    if (this._activeSettingsPanelId === void 0) {
      this._activeSettingsPanelId = "camera";
    }
    const incomingSig = this._configSignature(normalized);
    const currentSig = this._configSignature(this._config);
    if (this._rendered && incomingSig === currentSig) {
      this._config = normalized;
      return;
    }
    this._config = normalized;
    this._rendered = true;
    this._render();
  }
  set hass(hass) {
    this._hass = hass;
    const modeKey = this._hass?.themes?.darkMode ? "dark" : "light";
    const key = `${this._frigateEntities().join(",")}|${modeKey}`;
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
      cams = [
        {
          entity: config.camera_entity,
          name: config.title || "",
          connection_type: DEFAULT_CAMERA_CONNECTION_TYPE
        }
      ];
    }
    const normalized = cams.map((camera) => normalizeCameraConfig(camera, { fallbackName: "" })).filter((c) => c.entity).slice(0, MAX_CAMERAS);
    return normalized;
  }
  _normalizeConfig(config) {
    const src = config && typeof config === "object" ? { ...config } : {};
    const cameras = this._normalizeCameras(src);
    if (Array.isArray(src.hidden_tabs)) {
      src.hidden_tabs = src.hidden_tabs.map((id) => id === "reviews" ? "alerts" : id).filter((id) => ALLOWED_HIDDEN_TABS.includes(id));
    }
    delete src.camera_entity;
    src.theme = src.theme === "custom" ? "custom" : "default";
    if (src.theme_custom && typeof src.theme_custom === "object") {
      src.theme_custom = Object.fromEntries(
        Object.entries(src.theme_custom).filter(([key]) => THEME_CUSTOM_KEYS.has(key)).map(([key, value]) => [key, normalizeHexColor(value)]).filter(([, value]) => !!value)
      );
    } else {
      src.theme_custom = {};
    }
    if (src.theme_custom_defaults && typeof src.theme_custom_defaults === "object") {
      src.theme_custom_defaults = Object.fromEntries(
        Object.entries(src.theme_custom_defaults).filter(([key]) => THEME_CUSTOM_KEYS.has(key)).map(([key, value]) => [key, value === true]).filter(([, value]) => value === true)
      );
    } else {
      src.theme_custom_defaults = {};
    }
    src.shadows = src.shadows !== false;
    src.borders = src.borders !== false;
    src.rounded_corners = src.rounded_corners !== false;
    src.outer_shadows = src.outer_shadows !== false;
    src.realtime_poll_seconds = REALTIME_POLL_OPTIONS_SECONDS.includes(
      Number(src.realtime_poll_seconds)
    ) ? Number(src.realtime_poll_seconds) : 5;
    src.mobile_poll_battery_saver = src.mobile_poll_battery_saver === true;
    src.slideshow_rotation_enabled = src.slideshow_rotation_enabled === true;
    src.slideshow_rotation_seconds = SLIDESHOW_ROTATION_OPTIONS_SECONDS.includes(
      Number(src.slideshow_rotation_seconds)
    ) ? Number(src.slideshow_rotation_seconds) : 30;
    src.grid_mode_enabled = src.grid_mode_enabled === true;
    src.grid_start_in_grid_enabled = src.grid_start_in_grid_enabled === true;
    src.grid_live_view_enabled = src.grid_live_view_enabled !== false;
    src.preview_page_enabled = src.preview_page_enabled === true;
    src.preview_page_live_cameras = src.preview_page_live_cameras === true;
    src.preview_page_show_title_bars = src.preview_page_show_title_bars !== false;
    src.wide_view_page_enabled = src.wide_view_page_enabled === true || src.wide_view === true;
    src.landing_page = normalizePageRoute(src.landing_page);
    src.mobile_page = normalizePageRoute(src.mobile_page);
    const landingPageOptions = getEnabledPageRoutes(
      src,
      DEVICE_ROUTE_BUCKETS.desktop
    );
    const mobilePageOptions = getEnabledPageRoutes(
      src,
      DEVICE_ROUTE_BUCKETS.mobile
    );
    if (!landingPageOptions.includes(src.landing_page)) {
      src.landing_page = PAGE_IDS.singleView;
    }
    if (!mobilePageOptions.includes(src.mobile_page)) {
      src.mobile_page = PAGE_IDS.singleView;
    }
    src.grid_rotation_seconds = GRID_ROTATION_OPTIONS_SECONDS.includes(
      Number(src.grid_rotation_seconds)
    ) ? Number(src.grid_rotation_seconds) : 30;
    src.alerts_reviews_days = normalizePositiveInteger(
      src.alerts_reviews_days,
      normalizePositiveInteger(src.window_days, 3)
    );
    delete src.wide_view;
    return { ...src, cameras };
  }
  _frigateEntities() {
    if (!this._hass) return [];
    return Object.keys(this._hass.states).filter((e) => e.startsWith("camera.")).filter((e) => {
      const a = this._hass.states[e].attributes;
      return a?.client_id || a?.mqtt_client_id || a?.camera_name;
    }).sort();
  }
  _timezoneDisplay() {
    const tz = this._hass?.config?.time_zone || "UTC";
    try {
      const parts = new Intl.DateTimeFormat(void 0, {
        timeZone: tz,
        timeZoneName: "longGeneric"
      }).formatToParts(new Date());
      const tzName = parts.find((p) => p.type === "timeZoneName")?.value || tz;
      return `${tzName} (${tz})`;
    } catch (_) {
      return tz.replace(/_/g, " ");
    }
  }
  _defaultHostVh() {
    const headerH = parseFloat(
      getComputedStyle(document.documentElement).getPropertyValue(
        "--header-height"
      )
    ) || 56;
    return Math.round(
      (window.innerHeight - headerH) / window.innerHeight * 100
    );
  }
  _rgbToHex(value) {
    const m = String(value || "").trim().match(/^rgba?\((\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i);
    if (!m) return "";
    const toHex = (n) => Math.max(0, Math.min(255, Number(n) || 0)).toString(16).padStart(2, "0");
    return `#${toHex(m[1])}${toHex(m[2])}${toHex(m[3])}`;
  }
  _resolveColorToHex(cssValue, fallback = "#000000") {
    if (!cssValue) return fallback;
    const hex = normalizeHexColor(cssValue);
    if (hex) return hex;
    const probe = document.createElement("span");
    probe.style.color = String(cssValue);
    this.appendChild(probe);
    const computed = getComputedStyle(probe).color;
    probe.remove();
    return this._rgbToHex(computed) || fallback;
  }
  _themeDefaultHex(key) {
    return this._resolveColorToHex(THEME_DEFAULTS[key], "#000000");
  }
  _themeDefaultHexMap() {
    return Object.fromEntries(
      THEME_CUSTOM_ROWS.map((row) => [row.key, this._themeDefaultHex(row.key)])
    );
  }
  _ensureThemeDraftCache() {
    if (!this._themeDraftCache || typeof this._themeDraftCache !== "object") {
      this._themeDraftCache = {};
    }
    if (this._config?.theme !== "custom") {
      this._themeDraftCache = {};
      return;
    }
    const custom = this._config?.theme_custom || {};
    for (const row of THEME_CUSTOM_ROWS) {
      const key = row.key;
      const v = normalizeHexColor(custom[key]);
      if (v) this._themeDraftCache[key] = v;
    }
  }
  _cameraLabel(camera) {
    const name = String(camera?.name || "").trim();
    if (name) return name;
    const entity = String(camera?.entity || "").trim();
    if (!entity) return "Select camera";
    return entity.replace(/^camera\./, "").replace(/_/g, " ");
  }
  _cameraConnectionLabel(value) {
    return normalizeCameraConnectionType(value) === "ha_direct" ? "HA direct" : "Frigate go2rtc";
  }
  _cameraAlertsContentLabel(value) {
    return normalizeAlertsAreaContent(value) === "all_reviews" ? "All reviews" : "Alerts only";
  }
  _cameraDesktopHlsLabel(value) {
    return normalizeDisableHlsDesktop(value) ? "Desktop HLS off" : "Desktop HLS on";
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
    const cam = index == null ? {
      entity: "",
      name: "",
      connection_type: DEFAULT_CAMERA_CONNECTION_TYPE,
      alerts_content: "alerts_only",
      disable_hls_desktop: false
    } : cams[index] || {};
    this._editingCamIndex = index;
    const title = this.querySelector("#camera-modal-title");
    const save = this.querySelector("#camera-modal-save");
    const modal = this.querySelector("#camera-modal");
    const name = this.querySelector("#camera-modal-name");
    const entity = this.querySelector("#camera-modal-entity");
    const connectionType = this.querySelector("#camera-modal-connection-type");
    const alertsContentAllReviews = this.querySelector(
      "#camera-modal-all-reviews"
    );
    const disableHlsDesktop = this.querySelector(
      "#camera-modal-disable-hls-desktop"
    );
    const helper = this.querySelector("#camera-modal-helper");
    if (title) title.textContent = index == null ? "Add" : "Edit";
    if (save) save.textContent = index == null ? "Add" : "Save";
    if (name) name.value = cam?.name || "";
    if (entity) {
      entity.value = cam?.entity || "";
      entity.dataset.value = cam?.entity || "";
    }
    if (connectionType) {
      const nextType = normalizeCameraConnectionType(cam?.connection_type);
      connectionType.value = nextType;
      connectionType.dataset.value = nextType;
    }
    if (alertsContentAllReviews) {
      alertsContentAllReviews.checked = normalizeAlertsAreaContent(cam?.alerts_content) === "all_reviews";
    }
    if (disableHlsDesktop) {
      disableHlsDesktop.checked = normalizeDisableHlsDesktop(cam?.disable_hls_desktop) === true;
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
    return (entity?.dataset?.value || entity?.value || entity?.__value || "").toString().trim();
  }
  _saveCameraModal() {
    const entity = this._cameraModalEntityValue();
    const name = (this.querySelector("#camera-modal-name")?.value || "").toString();
    const connectionType = normalizeCameraConnectionType(
      this.querySelector("#camera-modal-connection-type")?.dataset?.value || this.querySelector("#camera-modal-connection-type")?.value || DEFAULT_CAMERA_CONNECTION_TYPE
    );
    const alertsContent = this.querySelector("#camera-modal-all-reviews")?.checked === true ? "all_reviews" : "alerts_only";
    const disableHlsDesktop = this.querySelector("#camera-modal-disable-hls-desktop")?.checked === true;
    const helper = this.querySelector("#camera-modal-helper");
    if (!entity) {
      if (helper) helper.textContent = "Camera is required.";
      return;
    }
    const cur = [...this._getCams()];
    if (this._editingCamIndex == null) {
      if (cur.length >= MAX_CAMERAS) {
        if (helper) helper.textContent = `Maximum ${MAX_CAMERAS} cameras.`;
        return;
      }
      cur.push({
        entity,
        name,
        connection_type: connectionType,
        alerts_content: alertsContent,
        disable_hls_desktop: disableHlsDesktop
      });
    } else if (cur[this._editingCamIndex]) {
      cur[this._editingCamIndex] = {
        entity,
        name,
        connection_type: connectionType,
        alerts_content: alertsContent,
        disable_hls_desktop: disableHlsDesktop
      };
    }
    this._config = { ...this._config, cameras: cur.slice(0, MAX_CAMERAS) };
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
    const rows = Array.from(this.querySelectorAll(".cam-row"));
    wireCameraRowDragAndDrop({
      rows,
      clearDropTargets: () => {
        this.querySelectorAll(".cam-row").forEach((row) => {
          row.classList.remove("drop-target");
        });
      },
      onReorder: (fromIndex, toIndex) => {
        this._reorderCameras(fromIndex, toIndex);
      }
    });
  }
  _renderSettingsPanel({ id, title, icon, content, active = false }) {
    return `<section class="settings-panel ${active ? "active" : ""}" data-panel="${id}">
      <button type="button" class="setting-title" data-panel-toggle="${id}" aria-expanded="${active ? "true" : "false"}">
        <ha-icon icon="${icon}"></ha-icon>
        <h3>${title}</h3>
      </button>
      <div class="setting-content">${content}</div>
    </section>`;
  }
  _wireSettingsPanels() {
    const panels = Array.from(this.querySelectorAll(".settings-panel"));
    if (!panels.length) return;
    const setActive = (activePanel) => {
      this._activeSettingsPanelId = setSettingsPanelActiveState(
        panels,
        activePanel
      );
    };
    panels.forEach((panel) => {
      panel.querySelector("[data-panel-toggle]")?.addEventListener("click", () => {
        if (panel.classList.contains("active")) {
          setActive(null);
        } else {
          setActive(panel);
        }
      });
    });
    const initial = panels.find(
      (panel) => panel.dataset.panel === this._activeSettingsPanelId
    );
    setActive(initial || null);
  }
  _wireEditorDialogActions() {
    if (this._dialogActionHooksBound) return;
    const bindDialogActionButtons = () => {
      this._boundDialogActionButtons = [];
      const seenRoots = new Set();
      let node = this;
      let depth = 0;
      while (node && depth < 8) {
        const root = node.getRootNode?.();
        if (root instanceof ShadowRoot && !seenRoots.has(root)) {
          seenRoots.add(root);
          root.querySelectorAll(DIALOG_ACTION_SELECTOR).forEach((button) => {
            const kind = dialogActionKindFromElement(button);
            if (!kind) return;
            const handler = () => {
              if (kind === "primary") {
                if (this._hasVisualDraft) {
                  this._dispatch();
                  this._hasVisualDraft = false;
                }
                this._emitPreviewDraft(null);
                return;
              }
              this._hasVisualDraft = false;
              this._emitPreviewDraft(null);
            };
            button.addEventListener("click", handler, true);
            this._boundDialogActionButtons.push({ element: button, handler });
          });
        }
        node = node.parentNode || node.host;
        depth += 1;
      }
    };
    this._onDialogPrimaryActionClick = (ev) => {
      if (dialogActionKindFromEvent(ev) !== "primary") return;
      if (this._hasVisualDraft) {
        this._dispatch();
        this._hasVisualDraft = false;
      }
      this._emitPreviewDraft(null);
    };
    this._onDialogSecondaryActionClick = (ev) => {
      if (dialogActionKindFromEvent(ev) !== "secondary") return;
      this._hasVisualDraft = false;
      this._emitPreviewDraft(null);
    };
    document.addEventListener("click", this._onDialogPrimaryActionClick, true);
    document.addEventListener(
      "click",
      this._onDialogSecondaryActionClick,
      true
    );
    bindDialogActionButtons();
    this._dialogActionHooksBound = true;
  }
  _setEditorFieldError(selector, message) {
    setFieldErrorState(this, selector, message);
  }
  _validateEditorFields() {
    let valid = true;
    const windowDaysValue = this.querySelector("#window_days")?.dataset.value || this.querySelector("#window_days")?.value || "3";
    const windowDays = Number(windowDaysValue);
    const windowDaysMessage = Number.isInteger(windowDays) && windowDays >= 1 && windowDays <= 15 ? "" : "Select a value from 1 to 15.";
    this._setEditorFieldError("#window_days", windowDaysMessage);
    if (windowDaysMessage) valid = false;
    const alertsReviewsDaysValue = this.querySelector("#alerts_reviews_days")?.dataset.value || this.querySelector("#alerts_reviews_days")?.value || "3";
    const alertsReviewsDays = Number(alertsReviewsDaysValue);
    const alertsReviewsDaysMessage = Number.isInteger(alertsReviewsDays) && alertsReviewsDays >= 1 && alertsReviewsDays <= 15 ? "" : "Select a value from 1 to 15.";
    this._setEditorFieldError("#alerts_reviews_days", alertsReviewsDaysMessage);
    if (alertsReviewsDaysMessage) valid = false;
    const streamHeightRaw = String(
      this.querySelector("#stream_height")?.value || ""
    ).trim();
    const streamHeight = Number(streamHeightRaw);
    const streamHeightMessage = !streamHeightRaw || Number.isInteger(streamHeight) && streamHeight >= 1 && streamHeight <= 4e3 ? "" : "Enter a whole number from 1 to 4000, or leave blank.";
    this._setEditorFieldError("#stream_height", streamHeightMessage);
    if (streamHeightMessage) valid = false;
    const wideViewEnabled = this.querySelector("#wide_view_page_enabled")?.checked === true;
    const colWidthRaw = String(
      this.querySelector("#col_left_width_pct")?.value || ""
    ).replace(/%/g, "").trim();
    const colWidth = Number(colWidthRaw);
    const colWidthMessage = !wideViewEnabled || Number.isInteger(colWidth) && colWidth >= 10 && colWidth <= 90 ? "" : "Enter a whole number from 10 to 90.";
    this._setEditorFieldError("#col_left_width_pct", colWidthMessage);
    if (colWidthMessage) valid = false;
    return valid;
  }
  _bindNumericInput(selector, { onSanitize } = {}) {
    bindNumericInputField({ root: this, selector, onSanitize });
  }
  _render() {
    const frigEntities = this._frigateEntities();
    const cams = this._getCams();
    const canAddCamera = cams.length < MAX_CAMERAS;
    const timezoneDisplay = this._timezoneDisplay();
    const hiddenTabs = new Set(this._config?.hidden_tabs || []);
    this._ensureThemeDraftCache();
    const activeTheme = this._config?.theme === "custom" ? "custom" : "default";
    const themeCustom = this._config?.theme_custom || {};
    const themeCustomDefaults = this._config?.theme_custom_defaults || {};
    const pageRouteLabel = (pageId) => {
      if (pageId === PAGE_IDS.preview) return "Preview";
      if (pageId === PAGE_IDS.wideView) return "Wide View";
      return "Single View";
    };
    const landingPageOptions = getEnabledPageRoutes(
      this._config,
      DEVICE_ROUTE_BUCKETS.desktop
    ).map((pageId) => ({ value: pageId, label: pageRouteLabel(pageId) }));
    const mobilePageOptions = getEnabledPageRoutes(
      this._config,
      DEVICE_ROUTE_BUCKETS.mobile
    ).map((pageId) => ({ value: pageId, label: pageRouteLabel(pageId) }));
    const tabToggle = (id, label) => `<ha-formfield label="${label}">
          <ha-switch data-active-tab="${id}" ${hiddenTabs.has(id) ? "" : "checked"}></ha-switch>
        </ha-formfield>`;
    const themeRows = THEME_CUSTOM_ROWS.map((row) => {
      const key = row.key;
      const defaultHex = this._themeDefaultHex(key);
      const saved = normalizeHexColor(themeCustom[key]);
      const draft = normalizeHexColor(this._themeDraftCache?.[key]);
      const value = activeTheme === "custom" ? saved || draft || defaultHex : defaultHex;
      const useDefault = themeCustomDefaults[key] === true;
      const visibleValue = useDefault ? defaultHex : value;
      const showWarn = !useDefault && visibleValue !== defaultHex;
      return `
        <div class="theme-custom-row" data-theme-row="${key}">
          <div class="theme-custom-label">
            <div>${row.label}</div>
            ${showWarn ? '<div class="theme-custom-warn">Draft changes require card config save.</div>' : ""}
          </div>
          <div class="theme-color-wrap">
            <input class="theme-color-input" type="color" data-theme-color="${key}" value="${visibleValue}" ${useDefault ? "disabled" : ""}>
            <button
              type="button"
              class="theme-color-reset"
              data-theme-reset="${key}"
              title="Reset to default color"
              aria-label="Reset to default color"
              ${useDefault ? "hidden" : ""}
            >
              <ha-icon icon="mdi:autorenew"></ha-icon>
            </button>
          </div>
          <ha-formfield label="Use Default">
            <ha-switch data-theme-default="${key}" ${useDefault ? "checked" : ""}></ha-switch>
          </ha-formfield>
        </div>`;
    }).join("");
    const cameraRows = cams.map(
      (cam, i) => `
      <div class="cam-row" draggable="true" data-row="${i}">
        <button class="cam-drag" type="button" title="Drag to reorder" aria-label="Drag to reorder"><ha-icon icon="mdi:drag-horizontal-variant"></ha-icon></button>
        <div><div class="cam-name">${this._cameraLabel(cam)}</div><div class="cam-meta">${this._cameraConnectionLabel(cam.connection_type)} \xB7 ${this._cameraAlertsContentLabel(cam.alerts_content)} \xB7 ${this._cameraDesktopHlsLabel(cam.disable_hls_desktop)}</div></div>
                <button class="cam-action" type="button" title="Edit" aria-label="Edit" data-edit-cam="${i}"><svg viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg"><path fill="currentColor" d="M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87M3,17.25V21H6.75L17.81,9.94L14.06,6.19L3,17.25Z" /></svg></button>
                <button class="cam-action" type="button" title="Delete" aria-label="Delete" data-remove-cam="${i}"><svg viewBox="0 0 24 24" style="width:24px; height:24px" fill="currentColor"><path d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z" /></svg></button>
      </div>`
    ).join("");
    const cameraPanelContent = `
      <div>
        <span class="field-label">Cameras ${frigEntities.length ? '<small style="font-weight:400;color:var(--c-text2)">(Frigate cameras detected)</small>' : ""}</span>
        <div class="cam-wrap" id="cam-list">${cameraRows}</div>
        ${canAddCamera ? '<div class="cam-toolbar"><button id="camera-add" class="cam-add" type="button">Add</button></div>' : ""}
        <span class="cam-helper">Maximum ${MAX_CAMERAS} cameras.</span>
      </div>`;
    const generalPanelContent = `
      <ha-input label="Title" name="title" id="title" type="text" value="${this._config?.title || ""}" placeholder="My Camera"></ha-input>
      <ha-input label="Subtitle" name="subtitle" id="subtitle" type="text" value="${this._config?.subtitle || ""}" placeholder="Frigate"></ha-input>
      <div class="section">
        <div class="layout-row" style="align-items:flex-start;gap:12px;flex-wrap:wrap;justify-content:flex-start">
          <div style="min-width:160px;display:flex;flex-direction:column;gap:6px">
            <span class="field-label" style="margin:0">Event history days</span>
            <ha-selector id="window_days" style="width:160px"></ha-selector>
            <div class="field-helper" id="window_days-helper"></div>
          </div>
          <div style="min-width:160px;display:flex;flex-direction:column;gap:6px">
            <span class="field-label" style="margin:0">Alerts/Reviews Days</span>
            <ha-selector id="alerts_reviews_days" style="width:160px"></ha-selector>
            <div class="field-helper" id="alerts_reviews_days-helper"></div>
          </div>
        </div>
      </div>
      <div class="section">
        <div class="layout-row" style="align-items:flex-start;gap:12px;flex-wrap:wrap;justify-content:flex-start">
          <div style="min-width:160px;display:flex;flex-direction:column;gap:6px">
            <span class="field-label" style="margin:0">Realtime Update Poll</span>
            <ha-selector id="realtime_poll_seconds" style="width:160px"></ha-selector>
            <div class="field-helper">Lower values update faster but use more battery/data.</div>
          </div>
          <div style="display:flex;flex-direction:column;gap:6px;max-width:320px">
            <div class="layout-row" style="justify-content:flex-start;gap:8px">
              <span class="field-label" style="margin:0">Mobile Battery Saver</span>
              <ha-switch id="mobile_poll_battery_saver" ${this._config?.mobile_poll_battery_saver ? "checked" : ""}></ha-switch>
            </div>
            <div class="field-helper">On mobile-sized screens, use 10s polling to reduce battery use.</div>
          </div>
        </div>
      </div>
      <div class="section">
        <div class="layout-row">
          <span class="field-label" style="margin:0">Timezone</span>
          <span class="readonly-value">${timezoneDisplay}</span>
        </div>
      </div>`;
    const themePanelContent = `
      <div class="section">
        <span class="field-label">Theme</span>
        <div class="theme-row">
          <div class="theme-seg" id="theme-seg" role="radiogroup" aria-label="Theme">
            <button type="button" class="theme-opt ${activeTheme === "default" ? "active" : ""}" data-theme-option="default" role="radio" aria-checked="${activeTheme === "default" ? "true" : "false"}">Home Assistant Theme</button>
            <button type="button" class="theme-opt ${activeTheme === "custom" ? "active" : ""}" data-theme-option="custom" role="radio" aria-checked="${activeTheme === "custom" ? "true" : "false"}">Custom</button>
          </div>
        </div>
        <details id="theme-custom-panel" class="theme-custom-panel" ${activeTheme === "custom" ? "open" : ""} ${activeTheme === "custom" ? "" : "hidden"}>
          <summary>Custom Color Overrides</summary>
          <div class="theme-custom-body">${themeRows}</div>
        </details>
      </div>`;
    const layoutPanelContent = `
      <div class="section">
        <span class="field-label">Active tabs</span>
        <div class="chk-row">
          ${tabToggle("alerts", "Alerts")}
          ${tabToggle("clips", "Clips")}
          ${tabToggle("snapshot", "Snapshots")}
          ${tabToggle("recordings", "Recordings")}
          ${tabToggle("kept", "Kept")}
        </div>
      </div>
      <div class="section">
        <span class="field-label">Card Height Limit</span>
        <div style="display:flex;gap:8px;align-items:center">
          <ha-input name="stream_height" id="stream_height" type="number" value="${this._config?.stream_height || ""}" min="1" placeholder="${this._defaultHostVh()}" style="flex:1"></ha-input>
          <ha-selector id="stream_height_unit" style="width:120px"></ha-selector>
        </div>
        <div class="field-helper" id="stream_height-helper"></div>
      </div>
      <div class="section">
        <div class="layout-row">
          <span class="field-label" style="margin:0">Tight Margins</span>
          <ha-switch id="tight_margins" ${this._config?.tight_margins ? "checked" : ""}></ha-switch>
        </div>
        <div class="field-helper">Enable or Disable Tight Margins.  This setting essentially removes the default Home Assistant Padding around an item in a Sections View.  Doing this allows the Card to span the full height of the available space.  This could be useful on phones or tablets.
        </div>
      </div>
      <div class="section">
        <div class="layout-row">
          <span class="field-label" style="margin:0">Shadows (Inside Card)</span>
          <ha-switch id="shadows" ${this._config?.shadows !== false ? "checked" : ""}></ha-switch>
        </div>
        <div class="field-helper">Enable or Disable Inner Shadows - these are the shadows around things like the events list items.  This could be useful on phones or tablets.
        </div>
      </div>
      <div class="section">
        <div class="layout-row">
          <span class="field-label" style="margin:0">Shadows (Outside Card)</span>
          <ha-switch id="outer_shadows" ${this._config?.outer_shadows !== false ? "checked" : ""}></ha-switch>
        </div>
        <div class="field-helper">Enable or Disable Outer Shadows - this is the shadow around the entire card.  This could be useful on phones or tablets.
        </div>
      </div>
      <div class="section">
        <div class="layout-row">
          <span class="field-label" style="margin:0">Borders on Event Items</span>
          <ha-switch id="borders" ${this._config?.borders !== false ? "checked" : ""}></ha-switch>
        </div>
        <div class="field-helper">Enable or Disable Borders on Event List Items.  This may be usefull if Shadows are disabled to visually seperate the event list items.
        </div>
      </div>
      <div class="section">
        <div class="layout-row">
          <span class="field-label" style="margin:0">Rounded Corners</span>
          <ha-switch id="rounded_corners" ${this._config?.rounded_corners !== false ? "checked" : ""}></ha-switch>
        </div>
        <div class="field-helper">Enable or Disable Rounded Corners.  This could be useful on phones or tablets.
        </div>
      </div>
      </div>`;
    const slideshowPanelContent = `
      <div class="section">
        <div class="layout-row" style="align-items:flex-start;gap:12px;flex-wrap:wrap;justify-content:flex-start">
          <div style="display:flex;flex-direction:column;gap:6px;max-width:420px">
            <div class="layout-row" style="justify-content:flex-start;gap:8px">
              <span class="field-label" style="margin:0">Slideshow Rotation</span>
              <ha-switch id="slideshow_rotation_enabled" ${this._config?.slideshow_rotation_enabled ? "checked" : ""}></ha-switch>
            </div>
            <div class="field-helper">Allow the live camera view to rotate at a fixed interval. This is not available on mobile phone devices.</div>
          </div>
          <div id="slideshow_rotation_row" style="min-width:210px;display:${this._config?.slideshow_rotation_enabled ? "flex" : "none"};flex-direction:column;gap:6px">
            <span class="field-label" style="margin:0">Slideshow Rotation Frequency</span>
            <ha-selector id="slideshow_rotation_seconds" style="width:210px"></ha-selector>
          </div>
        </div>
      </div>`;
    const previewPanelContent = `
      <div class="section" style="border-top:none;padding-top:0">
        <div class="layout-row">
          <span class="field-label" style="margin:0">Enable Preview Page</span>
          <ha-switch id="preview_page_enabled" ${this._config?.preview_page_enabled ? "checked" : ""}></ha-switch>
        </div>
        <div class="field-helper">When enabled, Preview becomes available in navigation and as a landing page option.</div>
      </div>
      <div class="section">
        <div class="layout-row">
          <span class="field-label" style="margin:0">Live Cameras</span>
          <ha-switch id="preview_page_live_cameras" ${this._config?.preview_page_live_cameras ? "checked" : ""}></ha-switch>
        </div>
        <div class="field-helper">On = all preview cameras load live. Off = snapshots, with alert/review cameras promoted to temporary live view.</div>
      </div>
      <div class="section">
        <div class="layout-row">
          <span class="field-label" style="margin:0">Show Title Bars</span>
          <ha-switch id="preview_page_show_title_bars" ${this._config?.preview_page_show_title_bars !== false ? "checked" : ""}></ha-switch>
        </div>
        <div class="field-helper">Shows per-camera metadata under each preview tile (name, source, events, and online status).</div>
      </div>`;
    const wideViewPanelContent = `
      <div class="section" style="border-top:none;padding-top:0">
        <div class="layout-row">
          <span class="field-label" style="margin:0">Enable Wide View Page</span>
          <ha-switch id="wide_view_page_enabled" ${this._config?.wide_view_page_enabled ? "checked" : ""}></ha-switch>
        </div>
        <div class="field-helper">When enabled, Wide View becomes available in navigation and as a desktop/tablet landing page option.</div>
      </div>
      <div id="col-width-row" style="display:flex;align-items:center;gap:6px;margin-top:6px;${this._config?.wide_view_page_enabled ? "" : "display:none"}">
        <label style="font-size:11px;color:var(--c-text);white-space:nowrap">Left Width %</label>
        <ha-input type="text" id="col_left_width_pct" value="${this._config?.col_left_width_pct ?? 50}" style="width:70px"></ha-input>
        <span style="font-size:11px;color:var(--c-text2)">%</span>
      </div>
      <div class="field-helper" id="col_left_width_pct-helper">Controls the left column width when the Wide View page is active.</div>`;
    const landingPanelContent = `
      <div class="section" style="border-top:none;padding-top:0">
        <span class="field-label">Landing Page</span>
        <ha-selector id="landing_page" style="width:220px"></ha-selector>
        <div class="field-helper">Choose the default starting page for desktop and tablet devices.</div>
      </div>
      <div class="section">
        <span class="field-label">Mobile Page</span>
        <ha-selector id="mobile_page" style="width:220px"></ha-selector>
        <div class="field-helper">Choose the default starting page for phones. Wide View is intentionally excluded here.</div>
      </div>`;
    const gridviewPanelContent = `
      <div class="section">
        <div class="layout-row" style="align-items:flex-start;gap:12px;flex-wrap:wrap;justify-content:flex-start">
          <div style="display:flex;flex-direction:column;gap:6px;max-width:420px">
            <div class="layout-row" style="justify-content:flex-start;gap:8px">
              <span class="field-label" style="margin:0">Grid Mode</span>
              <ha-switch id="grid_mode_enabled" ${this._config?.grid_mode_enabled ? "checked" : ""}></ha-switch>
            </div>
            <div class="field-helper">Enable a 2x2 camera grid. This is not available on mobile phone devices and requires at least 2 cameras.</div>
          </div>
          <div id="grid_start_row" style="min-width:210px;display:${this._config?.grid_mode_enabled ? "flex" : "none"};flex-direction:column;gap:6px">
            <div class="layout-row" style="justify-content:flex-start;gap:8px">
              <span class="field-label" style="margin:0">Start In Grid Mode</span>
              <ha-switch id="grid_start_in_grid_enabled" ${this._config?.grid_start_in_grid_enabled ? "checked" : ""}></ha-switch>
            </div>
            <div class="field-helper">Start this card in grid mode and return to grid mode when re-entering the dashboard.</div>
          </div>
          <div id="grid_live_row" style="min-width:210px;display:${this._config?.grid_mode_enabled ? "flex" : "none"};flex-direction:column;gap:6px">
            <div class="layout-row" style="justify-content:flex-start;gap:8px">
              <span class="field-label" style="margin:0">Live View In Grid</span>
              <ha-switch id="grid_live_view_enabled" ${this._config?.grid_live_view_enabled !== false ? "checked" : ""}></ha-switch>
            </div>
            <div class="field-helper">Off = snapshots by default. Alerted cameras switch to live temporarily and show border. On = all visible grid cameras stay live.</div>
          </div>
          <div id="grid_rotation_row" style="min-width:210px;display:${this._config?.grid_mode_enabled && cams.length > 4 ? "flex" : "none"};flex-direction:column;gap:6px">
            <span class="field-label" style="margin:0">Grid Rotation Frequency</span>
            <ha-selector id="grid_rotation_seconds" style="width:210px"></ha-selector>
          </div>
        </div>
      </div>`;
    const activeSettingsPanel = this._activeSettingsPanelId === void 0 ? "camera" : this._activeSettingsPanelId;
    const settingsPanelsMarkup = `
      <div class="settings-container">
        ${this._renderSettingsPanel({ id: "camera", title: "Camera Settings", icon: "mdi:camera", content: cameraPanelContent, active: activeSettingsPanel === "camera" })}
        ${this._renderSettingsPanel({ id: "general", title: "General Settings", icon: "mdi:cog", content: generalPanelContent, active: activeSettingsPanel === "general" })}
        ${this._renderSettingsPanel({ id: "theme", title: "Theme Settings", icon: "mdi:palette", content: themePanelContent, active: activeSettingsPanel === "theme" })}
        ${this._renderSettingsPanel({ id: "layout", title: "Layout Settings", icon: "mdi:angle-right", content: layoutPanelContent, active: activeSettingsPanel === "layout" })}
        ${this._renderSettingsPanel({ id: "slideshow", title: "Slideshow Settings", icon: "mdi:presentation-play", content: slideshowPanelContent, active: activeSettingsPanel === "slideshow" })}
        ${this._renderSettingsPanel({ id: "gridview", title: "Grid View", icon: "mdi:view-grid-outline", content: gridviewPanelContent, active: activeSettingsPanel === "gridview" })}
        ${this._renderSettingsPanel({ id: "preview", title: "Preview Page", icon: "mdi:view-grid", content: previewPanelContent, active: activeSettingsPanel === "preview" })}
        ${this._renderSettingsPanel({ id: "wideview", title: "Wide View Page", icon: "mdi:view-split-vertical", content: wideViewPanelContent, active: activeSettingsPanel === "wideview" })}
        ${this._renderSettingsPanel({ id: "landing", title: "Landing Page", icon: "mdi:home-import-outline", content: landingPanelContent, active: activeSettingsPanel === "landing" })}
      </div>`;
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
              --c-bg-main: var(--editor-primary-bg);
              --c-bg-panel: var(--editor-card-bg);
              --c-text: var(--editor-text);
              --c-text2: var(--editor-muted);
              --c-text-rev: var(--text-primary-color, #ffffff);
              --c-border: var(--editor-border);
              --c-border2: var(--divider-color, var(--editor-border));
              --c-primary: var(--editor-primary);
              --c-primary-l: var(--light-primary-color, var(--editor-primary));
              --c-accent: var(--accent-color, var(--editor-primary));
              --c-alert: var(--error-color, #b91c1c);
                display:flex;
                flex-direction:column;
                gap:16px;
                padding:8px 0;
                background:transparent;
                color:var(--editor-text);
                font-family: var(--ha-font-family, inherit);
                font-size: var(--ha-font-size, 14px);
            }
              .settings-container{display:flex;flex-direction:column;gap:10px;}
              .settings-panel{
                border:1px solid var(--c-border2, var(--editor-border));
                border-radius:16px;
                background:var(--c-bg-panel, var(--editor-card-bg));
                color:var(--c-text, var(--editor-text));
                overflow:hidden;
              }
              .setting-title{
                width:100%;
                border:none;
                background:transparent;
                color:inherit;
                display:flex;
                align-items:center;
                gap:10px;
                padding:12px 14px;
                text-align:left;
                cursor:pointer;
              }
              .setting-title h3{margin:0;font-size:14px;font-weight:700;}
              .setting-title ha-icon{color:var(--c-text2, var(--editor-muted));}
              .settings-panel.active .setting-title{color:var(--c-accent, var(--editor-primary));}
              .settings-panel.active .setting-title ha-icon{color:var(--c-accent, var(--editor-primary));}
              .setting-content{
                max-height:0;
                opacity:0;
                overflow:hidden;
                padding:0 14px;
                transition:max-height .28s ease, opacity .2s ease, padding .2s ease;
              }
              .settings-panel.active .setting-content{
                max-height:1400px;
                opacity:1;
                padding:0 14px 14px;
              }
              .field-label{font-size:12px;font-weight:600;margin-bottom:8px;display:block;color:var(--c-text, var(--editor-text));}
            .field-helper{min-height:1.2em;margin-top:4px;font-size:11px;color:var(--c-text2, var(--editor-muted));}
            .field-helper.error{color:var(--c-alert);}
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
            .cam-meta{font-size:11px;color:var(--editor-muted);margin-top:2px;}
            .cam-action{width:32px;height:32px;border:none;background:transparent;color:var(--editor-icon);display:grid;place-items:center;cursor:pointer;border-radius:8px;}
            .cam-action:hover{background:var(--editor-secondary-bg);color:var(--editor-text);}
            .cam-action svg{width:18px;height:18px;display:block;fill:currentColor;}
            .cam-toolbar{display:flex;align-items:center;gap:8px;}
            .cam-add{border:var(--editor-border-width) solid var(--editor-border);border-radius:999px;padding:8px 16px;background:var(--editor-card-bg);color:var(--editor-primary);font-weight:600;cursor:pointer;}
            .cam-add:hover{border-color:var(--editor-primary);}
            .cam-add[disabled]{opacity:.5;cursor:not-allowed;}
            .cam-helper{font-size:11px;color:var(--c-text2, var(--editor-muted));}

            .theme-row{display:flex;align-items:center;}
            .theme-seg{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;width:100%;}
            .theme-opt{
              appearance:none;
              border:var(--editor-border-width) solid var(--c-border2);
              background:var(--c-bg-panel);
              color:var(--c-text);
              border-radius:10px;
              padding:8px 10px;
              cursor:pointer;
              font-weight:600;
              line-height:1.4;
              transition:background .16s ease,border-color .16s ease,color .16s ease,box-shadow .16s ease;
            }
            .theme-opt:hover{background:var(--c-bg-main);border-color:var(--c-primary);}
            .theme-opt:active{transform:translateY(1px);}
            .theme-opt:focus-visible{outline:none;box-shadow:0 0 0 2px var(--c-primary-l, var(--c-primary));}
            .theme-opt.active{background:var(--c-primary);border-color:var(--c-primary);color:var(--c-text-rev);}
            .theme-custom-panel{margin-top:10px;border:var(--editor-border-width) solid var(--editor-border);border-radius:10px;background:var(--editor-card-bg);}
            .theme-custom-panel[hidden]{display:none;}
            .theme-custom-panel summary{cursor:pointer;list-style:none;padding:10px 12px;font-weight:600;color:var(--c-text, var(--editor-text));display:flex;align-items:center;justify-content:space-between;}
            .theme-custom-panel summary::-webkit-details-marker{display:none;}
            .theme-custom-body{padding:0 12px 10px;}
            .theme-custom-row{display:grid;grid-template-columns:1fr auto auto;gap:10px;align-items:center;padding:10px 0;border-top:1px solid var(--c-border2, var(--editor-border));}
            .theme-custom-row:first-child{border-top:none;}
            .theme-custom-label{display:flex;flex-direction:column;gap:2px;min-width:0;}
            .theme-custom-warn{font-size:11px;color:var(--c-text2, var(--editor-muted));}
            .theme-color-wrap{position:relative;width:60px;height:60px;display:flex;align-items:center;justify-content:center;}
            .theme-color-input{width:60px;height:60px;padding:0;border:1px solid var(--editor-border);border-radius:4px;background:transparent;cursor:pointer;}
            .theme-color-input:disabled{opacity:1;cursor:not-allowed;}
            .theme-color-reset{
              position:absolute;
              left:calc(-1.4em - 2px);
              bottom:0;
              width:1.4em;
              height:1.4em;
              padding:0;
              border:none;
              background:transparent;
              color:var(--c-alert);
              display:grid;
              place-items:center;
              cursor:pointer;
            }
            .theme-color-reset[hidden]{display:none;}
            .theme-color-reset ha-icon{--mdc-icon-size:1.4em;}
            .layout-row{display:flex;align-items:center;justify-content:space-between;gap:8px;}
            .readonly-value{font-size:12px;color:var(--c-text, var(--editor-text));background:var(--c-bg-main, var(--editor-secondary-bg));border:var(--editor-border-width) solid var(--c-border, var(--editor-border));border-radius:8px;padding:6px 10px;}

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
      ${settingsPanelsMarkup}

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
            <span class="cam-modal-label">Connection Type</span>
            <ha-selector id="camera-modal-connection-type"></ha-selector>
          </div>
          <div class="cam-modal-field">
            <ha-input id="camera-modal-name" label="Name" placeholder="Display name (optional)"></ha-input>
          </div>
          <div class="cam-modal-field">
            <div class="layout-row" style="justify-content:flex-start;gap:8px">
              <span class="cam-modal-label" style="margin:0">Alerts Area Content: All Reviews</span>
              <ha-switch id="camera-modal-all-reviews"></ha-switch>
            </div>
            <div class="field-helper">In Frigate, Reviews can include Alerts, Detections, or both. Off = Alerts Only (default). On = All Reviews.</div>
          </div>
          <div class="cam-modal-field">
            <div class="layout-row" style="justify-content:flex-start;gap:8px">
              <span class="cam-modal-label" style="margin:0">Disable HLS On Desktop</span>
              <ha-switch id="camera-modal-disable-hls-desktop"></ha-switch>
            </div>
            <div class="field-helper">Only affects non-mobile, non-tablet devices. WebRTC and MSE stay enabled; only the HLS fallback attempt is removed for this camera.</div>
          </div>
          <div class="cam-modal-helper" id="camera-modal-helper"></div>
          <div class="cam-modal-foot">
            <button type="button" id="camera-modal-cancel" class="cam-btn">Cancel</button>
            <button type="button" id="camera-modal-save" class="cam-btn primary">Add</button>
          </div>
        </div>
      </div>
    </div>`;
    const update = () => this._u({ dispatch: false, preview: true });
    bindThemeControlEvents({
      root: this,
      update,
      themeDraftCache: this._themeDraftCache,
      resolveDefaultHex: (key) => this._themeDefaultHex(key)
    });
    setupSelectSelector({
      element: this.querySelector("#window_days"),
      hass: this._hass,
      options: Array.from({ length: 15 }, (_, index) => {
        const value = String(index + 1);
        return { value, label: value };
      }),
      initialValue: String(this._config?.window_days ?? 3),
      fallbackValue: "3",
      normalize: (value) => String(value ?? "3"),
      onChange: () => update()
    });
    setupSelectSelector({
      element: this.querySelector("#alerts_reviews_days"),
      hass: this._hass,
      options: Array.from({ length: 15 }, (_, index) => {
        const value = String(index + 1);
        return { value, label: value };
      }),
      initialValue: String(this._config?.alerts_reviews_days ?? 3),
      fallbackValue: "3",
      normalize: (value) => String(value ?? "3"),
      onChange: () => update()
    });
    setupSelectSelector({
      element: this.querySelector("#realtime_poll_seconds"),
      hass: this._hass,
      options: REALTIME_POLL_OPTIONS_SECONDS.map((value) => ({
        value: String(value),
        label: `${value}s`
      })),
      initialValue: String(this._config?.realtime_poll_seconds ?? 5),
      fallbackValue: "5",
      normalize: (value) => String(value ?? "5"),
      onChange: () => update()
    });
    setupSelectSelector({
      element: this.querySelector("#slideshow_rotation_seconds"),
      hass: this._hass,
      options: [
        { value: "10", label: "10 seconds" },
        { value: "20", label: "20 seconds" },
        { value: "30", label: "30 seconds" },
        { value: "60", label: "1 minute" }
      ],
      initialValue: String(this._config?.slideshow_rotation_seconds ?? 30),
      fallbackValue: "30",
      normalize: (value) => String(value ?? "30"),
      onChange: () => update()
    });
    setupSelectSelector({
      element: this.querySelector("#grid_rotation_seconds"),
      hass: this._hass,
      options: [
        { value: "10", label: "10 seconds" },
        { value: "20", label: "20 seconds" },
        { value: "30", label: "30 seconds" },
        { value: "60", label: "1 minute" }
      ],
      initialValue: String(this._config?.grid_rotation_seconds ?? 30),
      fallbackValue: "30",
      normalize: (value) => String(value ?? "30"),
      onChange: () => update()
    });
    setupSelectSelector({
      element: this.querySelector("#stream_height_unit"),
      hass: this._hass,
      options: [
        { value: "vh", label: "dvh" },
        { value: "em", label: "em" },
        { value: "px", label: "px" },
        { value: "%", label: "%" }
      ],
      initialValue: this._config?.stream_height_unit || "vh",
      fallbackValue: "vh",
      normalize: (value) => String(value ?? "vh"),
      onChange: () => update()
    });
    setupSelectSelector({
      element: this.querySelector("#landing_page"),
      hass: this._hass,
      options: landingPageOptions,
      initialValue: this._config?.landing_page || PAGE_IDS.singleView,
      fallbackValue: PAGE_IDS.singleView,
      normalize: (value) => normalizePageRoute(value),
      onChange: () => update()
    });
    setupSelectSelector({
      element: this.querySelector("#mobile_page"),
      hass: this._hass,
      options: mobilePageOptions,
      initialValue: this._config?.mobile_page || PAGE_IDS.singleView,
      fallbackValue: PAGE_IDS.singleView,
      normalize: (value) => normalizePageRoute(value),
      onChange: () => update()
    });
    setupEntitySelector({
      element: this.querySelector("#camera-modal-entity"),
      hass: this._hass,
      domain: "camera",
      label: "Camera"
    });
    setupSelectSelector({
      element: this.querySelector("#camera-modal-connection-type"),
      hass: this._hass,
      options: [
        { value: "frigate_go2rtc", label: "Frigate go2rtc" },
        { value: "ha_direct", label: "HA direct" }
      ],
      initialValue: DEFAULT_CAMERA_CONNECTION_TYPE,
      fallbackValue: DEFAULT_CAMERA_CONNECTION_TYPE,
      normalize: (value) => normalizeCameraConnectionType(value)
    });
    bindClickHandlers(this, [
      {
        selector: "#camera-add",
        handler: () => this._openCameraModal(null)
      },
      {
        selector: "#camera-modal-close",
        handler: () => this._closeCameraModal()
      },
      {
        selector: "#camera-modal-cancel",
        handler: () => this._closeCameraModal()
      },
      {
        selector: "#camera-modal-save",
        handler: () => this._saveCameraModal()
      }
    ]);
    bindEachClickHandler({
      root: this,
      selector: "[data-edit-cam]",
      handler: (event) => {
        this._openCameraModal(Number(event.currentTarget.dataset.editCam));
      }
    });
    bindEachClickHandler({
      root: this,
      selector: "[data-remove-cam]",
      handler: (event) => {
        this._removeCamera(Number(event.currentTarget.dataset.removeCam));
      }
    });
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
      }
    );
    this._wireCameraDragAndDrop();
    this._wireSettingsPanels();
    this._wireEditorDialogActions();
    bindEventsForIds({
      root: this,
      ids: ["title", "subtitle", "stream_height", "col_left_width_pct"],
      events: ["change"],
      handler: () => update()
    });
    bindEventsForIds({
      root: this,
      ids: [
        "tight_margins",
        "wide_view_page_enabled",
        "shadows",
        "borders",
        "rounded_corners",
        "outer_shadows",
        "mobile_poll_battery_saver",
        "slideshow_rotation_enabled",
        "grid_mode_enabled",
        "grid_start_in_grid_enabled",
        "grid_live_view_enabled",
        "preview_page_enabled",
        "preview_page_live_cameras",
        "preview_page_show_title_bars"
      ],
      events: ["change", "value-changed"],
      handler: () => {
        const slideshowRow = this.querySelector("#slideshow_rotation_row");
        const enabled = this.querySelector("#slideshow_rotation_enabled")?.checked === true;
        const gridRow = this.querySelector("#grid_rotation_row");
        const gridStartRow = this.querySelector("#grid_start_row");
        const gridLiveRow = this.querySelector("#grid_live_row");
        const gridEnabled = this.querySelector("#grid_mode_enabled")?.checked === true;
        if (slideshowRow)
          slideshowRow.style.display = enabled ? "flex" : "none";
        if (gridStartRow)
          gridStartRow.style.display = gridEnabled ? "flex" : "none";
        if (gridLiveRow)
          gridLiveRow.style.display = gridEnabled ? "flex" : "none";
        if (gridRow)
          gridRow.style.display = gridEnabled && cams.length > 4 ? "flex" : "none";
        update();
      }
    });
    bindEventsForSelectorAll({
      root: this,
      selector: "[data-active-tab]",
      events: ["change", "value-changed"],
      handler: () => update()
    });
    const wideCb = this.querySelector("#wide_view_page_enabled");
    const colWidthRow = this.querySelector("#col-width-row");
    if (wideCb && colWidthRow) {
      const syncWideRow = () => {
        colWidthRow.style.display = wideCb.checked ? "flex" : "none";
        this._validateEditorFields();
      };
      wideCb.addEventListener("change", syncWideRow);
      wideCb.addEventListener("value-changed", syncWideRow);
      syncWideRow();
    }
    if (this.querySelector("#col_left_width_pct")) {
      this._bindNumericInput("#col_left_width_pct", {
        onSanitize: () => {
          this._validateEditorFields();
        }
      });
    }
    if (this.querySelector("#stream_height")) {
      this._bindNumericInput("#stream_height", {
        onSanitize: () => {
          this._validateEditorFields();
        }
      });
    }
    this._validateEditorFields();
  }
  _getCams() {
    return Array.isArray(this._config?.cameras) ? this._config.cameras.map((c) => ({
      entity: c?.entity || "",
      name: c?.name || "",
      connection_type: normalizeCameraConnectionType(c?.connection_type),
      alerts_content: normalizeAlertsAreaContent(c?.alerts_content),
      disable_hls_desktop: normalizeDisableHlsDesktop(
        c?.disable_hls_desktop
      )
    })).filter((c) => c.entity).slice(0, MAX_CAMERAS) : [];
  }
  _emitPreviewDraft(config) {
    window.dispatchEvent(
      new CustomEvent("frigate-view-card-preview-draft", {
        detail: {
          cardTag: CARD_TAG,
          config
        }
      })
    );
  }
  _u({ dispatch = true, preview = false } = {}) {
    if (!this._validateEditorFields()) return;
    const cameras = this._getCams();
    const nextConfig = buildEditorConfigFromDom({
      root: this,
      baseConfig: this._config,
      cameras,
      themeDraftCache: this._themeDraftCache
    });
    this._config = nextConfig;
    if (preview) {
      this._hasVisualDraft = true;
      this._emitPreviewDraft(createEditorPreviewDraft(nextConfig));
    }
    if (dispatch) this._dispatch();
  }
  _dispatch() {
    const cameras = this._getCams();
    this._config = buildEditorConfigFromDom({
      root: this,
      baseConfig: this._config,
      cameras,
      themeDraftCache: this._themeDraftCache
    });
    const config = withCardTypeForYaml(
      compactEditorConfigForYaml(this._config, {
        themeDefaultColors: this._themeDefaultHexMap()
      }),
      { sourceConfig: this._config }
    );
    this._lastDispatchedConfigSig = this._configSignature(config);
    this.dispatchEvent(
      new CustomEvent("config-changed", {
        detail: { config }
      })
    );
  }
};

// src/index.js
if (!customElements.get(CARD_TAG))
  customElements.define(CARD_TAG, FrigateViewCard);
if (!customElements.get(CARD_TAG + "-editor"))
  customElements.define(CARD_TAG + "-editor", FrigateViewCardEditor);
window.customCards = window.customCards || [];
if (!window.customCards.find((c) => c.type === CARD_TAG))
  window.customCards.push({
    type: CARD_TAG,
    name: "FrigateView Card",
    description: `Simple Frigate Camera and Events Card \u2014 v${VERSION}`,
    preview: true
  });
console.info(
  `%c FRIGATE-VIEW-CARD %c v${VERSION} `,
  "color: white; background: #03a9f4; font-weight: 700;",
  "color: #03a9f4; background: white; font-weight: 700;"
);
