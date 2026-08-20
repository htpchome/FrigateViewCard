/** FrigateView Card - generated file. Edit src/ instead. */
const __defProp = Object.defineProperty;
const __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
const __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);

// src/constants.js
const VERSION = "1.0.1543";
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
const SNAPSHOT_UPDATE_SECONDS = 60;
const SLIDESHOW_ROTATION_OPTIONS_SECONDS = Object.freeze([
  10,
  20,
  30,
  60
]);
const GRID_ROTATION_OPTIONS_SECONDS = Object.freeze([10, 20, 30, 60]);
const SLIDESHOW_ALERT_HOLD_MS = 1e4;
const GRID_ALERT_HOLD_MS = 1e4;
const SLIDESHOW_REVIEW_FRESHNESS_GRACE_SEC = 10;
const SLIDESHOW_REVIEW_WATCH_MIN_MS = 1500;
const SLIDESHOW_REVIEW_WATCH_MAX_MS = 15e3;
const PREVIEW_ALERT_HOLD_MS = 1e4;
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
  airplayVideo: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 22h12l-6-6-6 6M21 3H3c-1.11 0-2 .89-2 2v12c0 1.1.9 2 2 2h4v-2H3V5h18v12h-4v2h4c1.1 0 2-.9 2-2V5c0-1.11-.9-2-2-2Z"/></svg>',
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
  phoneRotateLandscape: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M9,1H3A2,2 0 0,0 1,3V16A2,2 0 0,0 3,18H9A2,2 0 0,0 11,16V3A2,2 0 0,0 9,1M9,15H3V3H9V15M21,13H13V15H21V21H9V20H6V21A2,2 0 0,0 8,23H21A2,2 0 0,0 23,21V15A2,2 0 0,0 21,13M23,10L19,8L20.91,7.09C19.74,4.31 17,2.5 14,2.5V1A9,9 0 0,1 23,10Z" /></svg>',
  phoneRotatePortrait: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M9,1H3A2,2 0 0,0 1,3V16A2,2 0 0,0 3,18H4V15H3V3H9V11H11V3A2,2 0 0,0 9,1M23,21V15A2,2 0 0,0 21,13H8A2,2 0 0,0 6,15V21A2,2 0 0,0 8,23H21A2,2 0 0,0 23,21M9,21V15H21V21H9M23,10H21.5C21.5,7 19.69,4.27 16.92,3.09L16,5L14,1A9,9 0 0,1 23,10Z" /></svg>',
  popOut: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="m4.264 5.633-.594.804 8.555 6.321.594-.803z"/><path fill-rule="evenodd" d="m14.145 13.557-3.921.211 2.972-4.021z"/><path d="M3.68 2.867A3.185 3.185 0 0 0 .5 6.047v10.641a3.185 3.185 0 0 0 3.18 3.18h11.332A1.5 1.5 0 0 1 15 19.674v-.855H3.68a2.126 2.126 0 0 1-2.133-2.131V6.047A2.127 2.127 0 0 1 3.68 3.914h14.141a2.127 2.127 0 0 1 2.131 2.133V14H21V6.047a3.185 3.185 0 0 0-3.18-3.18z"/><path d="M16.75 14.75h5.325a1 1 0 0 1 1 1v4.174a1 1 0 0 1-1 1H16.75a1 1 0 0 1-1-1V15.75a1 1 0 0 1 1-1z"/></svg>',
  popIn: '<svg fill="currentColor" viewBox="0 0 24 24" ><path d="m22.066 20.929 0.60193-0.79808-8.492-6.4054-0.60192 0.79708z"/><path d="m12.264 12.908 3.9229-0.17217-3.0117 3.9914z" fill-rule="evenodd"/><path d="M3.68 2.867A3.185 3.185 0 0 0 .5 6.047v10.641a3.185 3.185 0 0 0 3.18 3.18h11.332A1.5 1.5 0 0 1 15 19.674v-.855H3.68a2.126 2.126 0 0 1-2.133-2.131V6.047A2.127 2.127 0 0 1 3.68 3.914h14.141a2.127 2.127 0 0 1 2.131 2.133V14H21V6.047a3.185 3.185 0 0 0-3.18-3.18z"/><path d="m4.6157 6.3473h5.325a1 1 0 0 1 1 1v4.174a1 1 0 0 1-1 1h-5.325a1 1 0 0 1-1-1v-4.174a1 1 0 0 1 1-1z"/></svg>',
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
  divider: '<svg fill="currentColor" version="1.1" viewBox="0 0 8 24"><path d="m3.7826 3h0.43584c0.411 0 0.74108 0.33008 0.74108 0.74208v16.516c0 0.412-0.33008 0.74208-0.74108 0.74208h-0.43584c-0.411 0-0.74208-0.33008-0.74208-0.74208v-16.516c0-0.412 0.33108-0.74208 0.74208-0.74208z"/></svg>',
  singleView: '<svg fill="currentColor" viewBox="0 0 24 24"><path d="M6,2H18A2,2 0 0,1 20,4V20A2,2 0 0,1 18,22H6A2,2 0 0,1 4,20V4A2,2 0 0,1 6,2M6,4V8H18V4H6Z" /></svg>',
  preView: '<svg fill="currentColor" viewBox="0 0 24 24"><path d="M9,5V9H21V5M9,19H21V15H9M9,14H21V10H9M4,9H8V5H4M4,19H8V15H4M4,14H8V10H4V14Z" /></svg>',
  wideView: '<svg fill="currentColor" viewBox="0 0 24 24"><path d="M3,3H11V5H3V3M13,3H21V5H13V3M3,7H11V9H3V7M13,7H21V9H13V7M3,11H11V13H3V11M13,11H21V13H13V11M3,15H11V17H3V15M13,15H21V17H13V15M3,19H11V21H3V19M13,19H21V21H13V19Z" /></svg>',
  mobileView: '<svg fill="currentColor" viewBox="0 0 24 24"><path d="M17,19V5H7V19H17M17,1A2,2 0 0,1 19,3V21A2,2 0 0,1 17,23H7C5.89,23 5,22.1 5,21V3C5,1.89 5.89,1 7,1H17M9,7H15V9H9V7M9,11H13V13H9V11Z" /></svg>',
  micOn: '<svg fill="currentColor" viewBox="0 0 24 24"><path d="M12,2A3,3 0 0,1 15,5V11A3,3 0 0,1 12,14A3,3 0 0,1 9,11V5A3,3 0 0,1 12,2M19,11C19,14.53 16.39,17.44 13,17.93V21H11V17.93C7.61,17.44 5,14.53 5,11H7A5,5 0 0,0 12,16A5,5 0 0,0 17,11H19Z" /></svg>',
  micOff: '<svg fill="currentColor" viewBox="0 0 24 24"><path d="M19,11C19,12.19 18.66,13.3 18.1,14.28L16.87,13.05C17.14,12.43 17.3,11.74 17.3,11H19M15,11.16L9,5.18V5A3,3 0 0,1 12,2A3,3 0 0,1 15,5V11L15,11.16M4.27,3L21,19.73L19.73,21L15.54,16.81C14.77,17.27 13.91,17.58 13,17.72V21H11V17.72C7.72,17.23 5,14.41 5,11H6.7C6.7,14 9.24,16.1 12,16.1C12.81,16.1 13.6,15.91 14.31,15.58L12.65,13.92L12,14A3,3 0 0,1 9,11V10.28L3,4.27L4.27,3Z" /></svg>',
  frigateView: '<svg version="1.1" viewBox="0 0 800 140"><path class="frigateView-accent" d="m495.84 4.002 34.867 97.625h7.3887l-34.865-97.625zm-343.18 2e-3v12.553h19.525v-12.553zm484.87 19.52c-24.687 0-39.328 13.808-39.328 39.748 0 24.824 13.807 39.748 39.328 39.748 21.896 0 35.984-10.879 38.912-31.52h-6.9727c-2.3726 16.877-12.972 24.547-31.939 24.547-22.314 0-32.354-10.88-32.354-32.775h71.684c0-25.94-14.645-39.748-39.33-39.748zm34.859 1.3945 22.592 76.707h6.9727l-22.592-76.707zm59.828 0 23.291 76.707h6.9727l-23.291-76.707zm-147.12 2e-3v76.707h6.9727v-76.707zm52.438 5.5781c19.665 0 30.124 8.228 32.076 26.498l-64.15-2e-3c1.9523-18.268 12.41-26.496 32.074-26.496z"/><path d="m372.71 4v20.922h-10.041v16.734h10.041v32.775c8e-4 21.755 12.691 27.191 25.102 27.191h23.988v-18.129h-19.664c-5.2991 0-9.9024-2.0927-9.9024-9.6231v-32.217h29.566v-16.736h-29.566v-20.918zm-362.71 0.0038736v97.623h20.918v-40.445h57.182v-18.131h-57.182v-20.92h57.18v-18.127zm562.96 0-34.867 97.623h7.3906l34.867-97.623zm12.123 0v6.2734h6.9726v-6.2734zm-365.77 19.52c-26.916 0-40.164 13.808-40.164 39.75 0 24.822 12.274 39.744 40.164 39.744 13.668 0 21.617-3.624 26.219-10.459v7.6699c0 11.297-7.3897 19.387-23.291 19.387-7.3909 0-14.084-2.9298-18.547-11.297h-21.061c4.1835 21.198 21.06 30.123 39.607 30.123 24.547 0 42.816-14.922 42.816-33.051v-80.473h-19.525v8.9277c-4.4624-6.6936-12.411-10.322-26.219-10.322zm92.596 0c-26.918 0-40.166 13.808-40.166 39.748 0 24.824 12.274 39.748 40.166 39.748 13.668 0 21.615-3.6259 26.219-10.459v9.0644h19.523v-76.707h-19.525v8.9277c-4.4624-6.6936-12.409-10.322-26.217-10.322zm155.07 0c-26.918 0-42.955 13.808-42.955 39.748 0 24.824 15.063 39.748 42.955 39.748 22.732 0 37.795-10.043 41.978-28.869h-21.061c-3.4863 6.6917-10.736 10.043-20.918 10.043-14.085 0-22.175-6.6967-23.291-17.994h66.246v-2.9277c0-24.824-15.063-39.748-42.955-39.748zm-374.15 1.3945 2e-3 76.707h19.523v-36.541c0-11.993 10.737-23.43 28.73-23.43h8.6465v-16.734h-8.6465c-13.389 0-23.011 3.7654-28.73 13.248v-13.25zm59.828 0.0019v76.707h19.523v-76.707zm572.58 0-23.291 76.705h6.9726l23.295-76.705zm59.832 0-22.596 76.705h6.9726l22.596-76.705zm-562.97 17.432c15.202 0 23.43 7.8096 23.43 20.922 0 13.666-8.6459 20.918-23.43 20.918-15.2 0-23.43-7.8096-23.43-20.92 0-13.666 8.6479-20.92 23.43-20.92zm92.596 0c15.202 0 23.43 7.8096 23.43 20.922 0 13.666-8.6459 20.918-23.43 20.918-15.202 0-23.43-7.8096-23.43-20.92 0-13.666 8.6479-20.92 23.43-20.92zm152.28 0c10.182 0 17.154 3.4872 20.779 9.625h-41.561c3.6257-6.2772 10.88-9.625 20.781-9.625z" style="fill:currentColor"/></svg>'
};

// src/features/mobile-view/page.styles.js
const MOBILE_VIEW_PAGE_STYLES = `
  :host(.mobile-view-rotate-cover) {
    position: fixed !important;
    top: var(--rotate-oy, 0px) !important;
    left: var(--rotate-ox, 0px) !important;
    right: auto !important;
    bottom: auto !important;
    width: var(--rotate-vw, 100vw) !important;
    height: var(--rotate-vh, 100dvh) !important;
    min-height: var(--rotate-vh, 100dvh) !important;
    max-height: var(--rotate-vh, 100dvh) !important;
    z-index: 2147483647 !important;
    overflow: visible !important;
    border-radius: 0 !important;
  }

  .card.mobile-view-active {
    border-top-left-radius: var(--fvc-border-radius);
    border-top-right-radius: var(--fvc-border-radius);
    overflow: hidden;
  }

  .card.mobile-view-active .layout.mobile-layout {
    border-top-left-radius: var(--fvc-border-radius);
    border-top-right-radius: var(--fvc-border-radius);
    overflow: hidden;
  }

  .card.mobile-view-active .mobile-container {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    min-height: 0;
    overflow: hidden;
    border-top-left-radius: var(--fvc-border-radius);
    border-top-right-radius: var(--fvc-border-radius);
    background: var(--c-bg-panel);
  }

  .card.mobile-view-active .mobile-top {
    display: flex;
    flex: 0 0 auto;
    flex-direction: column;
    position: relative;
    z-index: 2;
    width: 100%;
    min-height: 0;
    border-top-left-radius: var(--fvc-border-radius);
    border-top-right-radius: var(--fvc-border-radius);
    overflow: visible;
  }

  .card.mobile-view-active .mobile-bottom{
    display:flex;
    flex:1 1 auto; 
    flex-direction:column;
    width:100%;
    min-height:0; 
    overflow:hidden;
    position:relative;
  }
  .card.mobile-view-active .mobile-video-controls-container{
  display:grid;grid-template-columns:minmax(0,1fr) auto minmax(0,1fr);grid-template-areas:"video-controls-left microphone video-controls-right";align-items:center;gap:10px;padding:0px 8px;background: linear-gradient(to bottom, var(--c-bg-main) 50%, transparent 50%);
  }
  .card.mobile-view-active .mobile-video-controls-left-row{grid-area:video-controls-left;justify-content:flex-start;}
  .card.mobile-view-active .mobile-microphone-row{grid-area:microphone;justify-content:center;}
  .card.mobile-view-active .mobile-video-controls-right-row{grid-area:video-controls-right;justify-content:flex-end;}
  .card.mobile-view-active .mobile-video-controls-container .mute-btn,
  .card.mobile-view-active .mobile-video-controls-container .live-fs-btn{
    position:relative;
    inset:auto;
    z-index:1;
    opacity:1;
    pointer-events:auto;
  }

  .card.mobile-view-active .mobile-tab-container{
  display:grid;grid-template-columns:max-content auto minmax(0, 1fr);grid-template-areas:"tabs middle tools";align-items:center;gap:10px;padding:0px 8px;
  }  
  .card.mobile-view-active .mobile-left-row{grid-area:tabs;justify-content:flex-start;}
  .card.mobile-view-active .mobile-tabs-row{grid-area:middle;justify-content:flex-start;}
  .card.mobile-view-active .mobile-tools-row{grid-area:tools;justify-content:flex-end;}

  .card.mobile-view-active.mobile-rotate-live .mobile-top,
  .card.mobile-view-active.mobile-rotate-live-exit .mobile-top,
  .card.mobile-view-active.mobile-rotate-popup .mobile-top,
  .card.mobile-view-active.mobile-rotate-popup-exit .mobile-top {
    z-index: 2000;
  }

  .card.mobile-view-active.mobile-rotate-live #live-stage,
  .card.mobile-view-active.mobile-rotate-live-exit #live-stage {
    top: 0 !important;
    left: 0 !important;
    width: 100vw !important;
    height: 100dvh !important;
    z-index: 2147483000 !important;
  }

  .card.mobile-view-active.mobile-rotate-popup #myPopup,
  .card.mobile-view-active.mobile-rotate-popup-exit #myPopup {
    top: 0 !important;
    left: 0 !important;
    right: auto !important;
    bottom: auto !important;
    width: 100vw !important;
    height: 100dvh !important;
    max-height: 100dvh !important;
    min-height: 100dvh !important;
    z-index: 2147483000 !important;
  }

  .card.mobile-view-active .mobile-view-two-way-talk-slot {
    display: flex;
    align-items: center;
    justify-content: center;
    flex: 0 0 auto;
    padding: 2px 12px;
  }

  .card.mobile-view-active .mobile-view-two-way-talk-slot[hidden] {
    display: none !important;
  }

  .card.mobile-view-active .mobile-bottom .frigate-view {
    
  }
  .card.mobile-view-active .mobile-bottom .browse-head {
    flex: 0 0 auto;
  }

  .card.mobile-view-active .mobile-bottom .browse {
    flex: 1 1 auto;
    min-height: 0;
  }

  .card.mobile-view-active .mobile-top .cam-switcher {
    padding-inline: 8px;
  }

  .card.mobile-view-active .mobile-bottom .button-holder {
    padding-inline: 6px;
  }

  .card.mobile-view-active .mobile-top .cam-switcher {
    position: relative;
    display: grid;
    grid-template-columns: auto minmax(0, 1fr) auto;
    align-items: center;
    gap: 8px;
    overflow: visible;
  }

  .card.mobile-view-active .mobile-cam-picker__back {
    width: 34px;
    height: 34px;
    border-radius: 999px;
    padding: 0;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  .card.mobile-view-active .mobile-cam-picker__back svg {
    width: 20px;
    height: 20px;
  }

  .card.mobile-view-active .mobile-cam-picker {
    position: relative;
    justify-self: center;
    width: min(100%, clamp(162px, 51vw, 306px));
    min-width: 0;
  }

  .card.mobile-view-active .mobile-cam-picker__status {
    display: inline-flex;
    align-items: center;
    justify-self: end;
    gap: 6px;
    font-size: 1rem;
    min-width: 0;
  }

  .card.mobile-view-active .mobile-cam-picker__stream {
    display: inline-flex;
    flex-direction: column;
    align-items: flex-end;
    font-size: 0.85rem;
    line-height: 1;
  }

  .card.mobile-view-active .mobile-cam-picker__dot {
    font-size: 0.85rem;
    line-height: 1;
  }

  .card.mobile-view-active .mobile-cam-picker__trigger {
    width: 100%;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    padding: 9px 36px 9px 12px;
    border-radius: 10px;
    font-size: 1.15rem;
  }

  .card.mobile-view-active .mobile-cam-picker__trigger-content {
    display: inline-grid;
    grid-template-columns: auto minmax(0, auto);
    align-items: center;
    justify-content: center;
    gap: 8px;
    min-width: 0;
    max-width: 100%;
  }

  .card.mobile-view-active .mobile-cam-picker__trigger-dot {
    visibility: hidden;
    width: 0.95rem;
    font-size: 1rem;
    line-height: 1;
  }

  .card.mobile-view-active .mobile-cam-picker__label {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-weight: 700;
    text-align: left;
  }

  .card.mobile-view-active .mobile-cam-picker__chev {
    position: absolute;
    right: 12px;
    top: 50%;
    transform: translateY(-50%);
    width: 20px;
    height: 30px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .card.mobile-view-active .mobile-cam-picker__chev svg {
    width: 20px;
    height: 20px;
  }

  .card.mobile-view-active .mobile-cam-picker__panel {
    position: absolute;
    top: calc(100% + 6px);
    left: 0;
    right: 0;
    transform: none;
    z-index: 8;
    display: flex;
    flex-direction: column;
    align-items: stretch;
    gap: 4px;
    width: 100%;
    max-width: 100%;
    max-height: min(60dvh, calc(100dvh - 160px));
    overflow-y: auto;
    padding: 6px;
    box-sizing: border-box;
    border: 1px solid rgba(255, 255, 255, 0.28);
    border-radius: 10px;
    background: rgba(255, 255, 255, 0.2);
    backdrop-filter: blur(8px) saturate(180%);
    -webkit-backdrop-filter: blur(8px) saturate(180%);
    box-shadow:
      0 8px 32px rgba(31, 38, 135, 0.2),
      inset 0 0 0 1px rgba(255, 255, 255, 0.35);
  }

  .card.mobile-view-active .mobile-cam-picker__panel[hidden] {
    display: none;
  }

  .card.mobile-view-active .mobile-cam-picker__option {
    appearance: none;
    width: 100%;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    border: 1px solid rgba(255, 255, 255, 0.28);
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.18);
    backdrop-filter: blur(5px) saturate(170%);
    -webkit-backdrop-filter: blur(5px) saturate(170%);
    box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.2);
    color: var(--c-text);
    cursor: pointer;
    padding: 8px 10px;
    font-weight: 600;
    font-size: 1.15rem;
    text-align: left;
    transition:
      background 0.18s ease,
      border-color 0.18s ease,
      box-shadow 0.18s ease,
      color 0.18s ease;
  }

  .card.mobile-view-active .mobile-cam-picker__option:hover {
    background: rgba(255, 255, 255, 0.28);
    border-color: rgba(255, 255, 255, 0.5);
  }

  .card.mobile-view-active .mobile-cam-picker__option.is-active {
    border-color: rgba(255, 255, 255, 0.58);
    background: rgba(255, 255, 255, 0.34);
    box-shadow:
      inset 0 0 0 1px rgba(255, 255, 255, 0.55),
      0 0 0 1px color-mix(in srgb, var(--c-primary-d) 55%, transparent);
    color: var(--c-primary-d);
  }

  .card.mobile-view-active .mobile-cam-picker__option-content {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr);
    align-items: center;
    gap: 8px;
    width: 100%;
    min-width: 0;
  }

  .card.mobile-view-active .mobile-cam-picker__option-label {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    text-align: left;
  }

  /* Mobile list styling hooks (scoped to mobile view only). */
  .card.mobile-view-active {
    --mv-list-item-gap: 9px;
    --mv-list-item-margin-bottom: 5px;
    --mv-list-item-padding: 2px 10px 2px 2px;
    --mv-list-item-radius: var(--fvc-border-radius);
    --mv-list-thumb-width: 176px;
    --mv-list-thumb-height: 99px;
    --mv-list-thumb-radius: var(--fvc-border-radius);
    --mv-list-dot-bottom: 2px;
    --mv-list-dot-right: 3px;
    --mv-list-desc-padding: 6px 8.4px;
  }

  .card.mobile-view-active .browse--mobile-view .list {
    display: block;
    min-height: 0;
  }

  .card.mobile-view-active .browse--mobile-view .list-head {
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
  }

  .card.mobile-view-active .browse--mobile-view .list-day-label{position:relative;z-index:1;padding:2px 0 4px;font-size:1rem;font-weight:700;color:var(--c-text2);letter-spacing:.02em;line-height:1.30;pointer-events:none;background:var(--c-bg-panel);border:none;text-align: center;}  

  .card.mobile-view-active .browse--mobile-view .list-item {
    position: relative;
    display: flex;
    flex-wrap: wrap;
    gap: var(--mv-list-item-gap);
    align-items: center;
    margin-bottom: var(--mv-list-item-margin-bottom);
    border-radius: var(--mv-list-item-radius);
    padding: var(--mv-list-item-padding);
    background:var(--c-bg-primary);
  }

  .card.mobile-view-active .browse--mobile-view .list-item.compact {
    padding: var(--mv-list-item-padding);
    flex-wrap: wrap;
  }

  .card.mobile-view-active .browse--mobile-view .list-item.compact .et {
    width: 112px;
    height: 63px;
    border-radius: 5px;
  }

  .card.mobile-view-active .browse--mobile-view .et {
    border-radius: var(--mv-list-thumb-radius);
    overflow: hidden;
    flex-shrink: 0;
    position: relative;
    object-fit: cover;
  }

  .card.mobile-view-active .browse--mobile-view .et img {
    width: var(--mv-list-thumb-width);
    height: var(--mv-list-thumb-height);
    object-fit: cover;
    display: block;
  }

  .card.mobile-view-active .browse--mobile-view .ed {
    position: absolute;
    bottom: var(--mv-list-dot-bottom);
    right: var(--mv-list-dot-right);
  }

  .card.mobile-view-active .browse--mobile-view .ei {
    flex: 1;
    min-width: 0;
  }

  .card.mobile-view-active .browse--mobile-view .etop {
    display: flex;
    align-items: center;
    gap: 5px;
    margin-bottom: 3px;
    flex-wrap: wrap;
  }

  .card.mobile-view-active .browse--mobile-view .eact {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 4px;
    flex-shrink: 0;
  }

  .card.mobile-view-active .browse--mobile-view .desc {
    margin-top: 4px;
    padding: var(--mv-list-desc-padding);
  }
`;

// src/styles.js
const STYLES = `
  :host {
    height: var(--card-host-height, 100%) !important;
    max-height: var(--card-host-height, 100%) !important;
    min-height: 0;
    overflow: hidden;
    position: relative;
    box-sizing: border-box !important;
    display: block !important;
    border: 0 !important;
    border-radius: var(--ha-card-border-radius, 14px);
  }
  :host {
    --popup-z-index: 1000;
    --popup-bg: white;
    --handle-color: #e0e0e0;
    --rotate-vw: 100vw;
    --rotate-vh: 100dvh;
    --rotate-ox: 0px;
    --rotate-oy: 0px;
  }

  /* \u2500\u2500 theme variables (dark = default) \u2500\u2500 */
    .card {
        --c-bg-main:   var(--card-background-color);
        --c-bg-primary:var(--primary-background-color); 
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
    border-radius: var(--fvc-border-radius);
    }
  .card.shadows-off{--fvc-shadow-s:none;--fvc-shadow-m:none;}
  .card.borders-off{--fvc-border-s: none;--fvc-border-m:  none;--fvc-border-active: none}
  .card.corners-off{--fvc-border-radius:0px;--fvc-outer-border-radius:0px;}

  .card .layout{display:flex;flex-direction:column;height:100%;max-height:100%;min-height:0;width:100%;overflow:hidden !important;}
  .card .layout.wide-view{flex-direction:row;}
  .card .col-left{flex:0 1 auto; min-height:0; align-self: start;flex-direction:column;width:100%; display:flex;overflow:none;}
  .card .col-right{flex:1 1 auto; min-height:0; flex-direction:column;position:relative;width:100%; display:flex;overflow:hidden;}
  .resize-handle{display:block;width:100%;height:6px;cursor:row-resize;background:var(--c-border2,#333);position:relative;flex-shrink:0;z-index:10;transition:background .15s;}
  .layout:not(.wide-view) .resize-handle{display:none;}
  .resize-handle:hover,.resize-handle.active{background:var(--c-accent,#3b82f6);}
  .resize-handle::after{content:'';position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:32px;height:2px;background:rgba(255,255,255,.4);border-radius:1px;}
  .layout.wide-view .resize-handle{width:6px;height:auto;cursor:col-resize;}
  .layout.wide-view .resize-handle::after{width:2px;height:32px;}
  .card .live-stage{position:relative;width:100%;min-height:0;flex-shrink:0;}
  .card #eng-wrap{min-height:0;}
  .card .browse{
    display:flex;
    flex:1 1 0;
    flex-direction: column; 
    padding:0 10px;
    margin:0;
    min-height:0;
    height:auto;
    overflow-y:auto;
    position:relative}

  .card .browse-head{display:flex;align-items:center;justify-content:center;min-height:1.5rem;max-height:1.65em;flex-direction:row;width:auto;color:var(--c-text2);letter-spacing:.02em;line-height:1.40;padding:1px 8px;}
  .card.recordings-browse-head-tall:not(.recordings-browse-head-compact) .browse-head{min-height:3.5rem;max-height:none;}
  .browse-head-left {display:flex;flex:1;justify-content:center;align-items:center;flex: 0 0 auto; }
  .browse-head-right {display:flex;justify-content center;align-items: center;flex: 0 0 auto;}
  .browse-head-middle {flex:1;text-align:center;font-weight:700;font-size:1rem;letter-spacing:.02em;line-height:1.40;}

  .footer {display: grid;grid-template-columns: minmax(100px, 1fr) minmax(auto, 3fr) minmax(100px, 1fr);line-height:2;min-height:1.5rem;font-size:1.2rem;padding:4px;align-items: center;}
  
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
  .list{display:block;min-height:0;} 
  .list-head{justify-content:space-between;align-items:center;margin-bottom:8px;}
  .list-day-sec{position:relative;}
  .list-day-label{position:relative;z-index:1;padding:2px 0 4px;font-size:1rem;font-weight:700;color:var(--c-text2);letter-spacing:.02em;line-height:1.30;pointer-events:none;background:var(--c-bg-main);border:none;text-align: center;}
  .list-day-label-first{display:none;}


  .list-item{position: relative;display:flex;flex-wrap:wrap;gap:9px;align-items:center;
    background:var(--c-bg-primary);margin-bottom:5px; border: var(--fvc-border-s);
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
  .tabs-holder{margin:3px 8px;border-radius:8px;background-color:var(--c-bg-panel);container-type:inline-size;}
  .button-holder{display:grid;grid-template-columns:minmax(0,1fr) auto minmax(0,1fr);grid-template-areas:"tabs nav tools";align-items:center;gap:10px;padding:4px 8px;}
  .button-holder-row{display:flex;align-items:center;min-width:0;}
  .tabs-row{grid-area:tabs;justify-content:flex-start;}
  .page-nav-row{grid-area:nav;justify-content:center;}
  .tools-row{grid-area:tools;justify-content:flex-end;}
  .tabs{display:flex;flex-wrap:wrap;gap:5px;padding:0;overflow:visible;scrollbar-width:none;position:relative;z-index:auto;background-color:transparent !important;border-radius:8px;transition:background-color 0.3s ease;margin:0;}
  .tabs::-webkit-scrollbar{display:none;}

  /* \u2500\u2500 circle button \u2500\u2500 */
  .circle-btn{display:inline-flex;align-items:center;justify-content: center;gap:4px;font-size:1rem;font-weight:600;border-radius:50%;min-height:36px;min-width:36px;background-color:var(--c-bg-main);padding:1px;transition: all 0.2s ease;cursor:pointer;}
  .circle-btn svg{width:24px;height:24px;opacity:0.85;color:var(--c-text2)}
  .circle-btn:hover {background-color:var(--c-bg-main);color:var(--c-primary-d);}
  .circle-btn:hover svg{color:var(--c-primary-d);}
  .circle-btn.active {background:var(--c-primary-d);} 
  .circle-btn.active svg{color:var(--c-text-rev);}
  .icon-btn{appearance:none;-webkit-appearance:none;display:inline-flex;align-items:center;justify-content:center;gap:4px;min-height:36px;min-width:36px;margin:0;padding:1px;border:0;border-radius:0;background:transparent;box-shadow:none;color:var(--c-text2);font:inherit;font-size:1rem;font-weight:600;cursor:pointer;}
  .icon-btn svg{width:24px;height:24px;opacity:0.85;color:var(--c-text2)}
  .icon-btn:hover svg{color:var(--c-text);}
  .icon-btn.active svg{color:var(--c-text);}
  .icon-btn:disabled{opacity:.45;cursor:not-allowed;}
  .icon-btn:disabled:hover svg{color:var(--c-text2);}
  .newtoast{font-size:0.75rem;font-weight:700;color:var(--c-on);}
  .empty{text-align:center;padding:16px;color:var(--c-text3);font-size:0.9rem;line-height:1.5;}
  .more,.end{position:relative;display:flex;min-height:0;align-items:center;justify-content:center;font-size:0.85rem;color:var(--c-text2);padding:6px;border-top: 1px solid var(--c-border);}
  .more.to-top{position:relative;cursor:pointer;color:var(--c-text2);}

  /* \u2500\u2500 feed area \u2500\u2500 */
    .feed-area{position:relative;width:100%;}
    #eng-wrap{background:var(--c-bg-deep);position:relative;width:100%;aspect-ratio:16/9;overflow:hidden;max-height:var(--view-height,none);z-index:0;isolation:isolate;}
    #engine,#stream-fallback{transition:opacity .22s ease;}
    #eng-wrap::before{content:"";position:absolute;border-radius:inherit;pointer-events:none;z-index:5;}
    #eng-wrap.slideshow-switching #engine,
    #eng-wrap.slideshow-switching #stream-fallback{opacity:.12;}
    #eng-wrap.slideshow-alert::before{border-width:3px;border-color:var(--error-color, var(--c-bg-alert));}
    #eng-wrap.slideshow-detection::before{border-width:3px;border-color:var(--warning-color, var(--c-accent));}
    #eng-wrap.popup-covered::after{content:"";position:absolute;inset:0;background:var(--c-bg-deep);z-index:4;pointer-events:none;}
    .card.mobile-rotate-live,
    .card.mobile-rotate-live-exit{overflow:hidden;height:var(--rotate-vh);max-height:var(--rotate-vh);}
    .card.mobile-rotate-live #live-stage,
    .card.mobile-rotate-live-exit #live-stage{position:fixed;top:var(--rotate-oy);left:var(--rotate-ox);z-index:1400;width:var(--rotate-vw);height:var(--rotate-vh);max-width:none;max-height:none;border-radius:0;background:#000;box-shadow:none;transform:none;}
    .card.mobile-rotate-live #eng-wrap,
    .card.mobile-rotate-live-exit #eng-wrap{width:100%;height:100%;max-height:none;aspect-ratio:auto;border-radius:0;}
    .card.mobile-rotate-live #engine,
    .card.mobile-rotate-live-exit #engine{position:absolute;inset:0;}
    .card.mobile-rotate-live #engine > *,
    .card.mobile-rotate-live-exit #engine > *{position:absolute;inset:0;width:100% !important;height:100% !important;max-width:none !important;max-height:none !important;}
    .card.mobile-rotate-live #engine video,
    .card.mobile-rotate-live-exit #engine video,
    .card.mobile-rotate-live #stream-fallback img,
    .card.mobile-rotate-live-exit #stream-fallback img{object-fit:cover;object-position:center center;}
    .card.mobile-rotate-live #live-stage{animation:liveOverlayIn .28s ease both;}
    .card.mobile-rotate-live-exit #live-stage{animation:liveOverlayOut .24s ease both;}
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
    .card.mobile-rotate-popup .overlay-controls,
    .card.mobile-rotate-popup-exit .overlay-controls,
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
    border-radius: 999rem; 
    color: black; 
    font-size: 1.0rem; 
    cursor:pointer;
    transform: rotate(0.01deg);
    backface-visibility: hidden;
    overflow: hidden;
    background-clip: padding-box;  
    background: rgba(255, 255, 255, 0.15);
    backdrop-filter: blur(2px) saturate(180%);
    border: none; 
    box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.8); 
    box-shadow: 0 8px 32px rgba(31, 38, 135, 0.2), 
    inset 0 4px 20px rgba(255, 255, 255, 0.3); 
  }
  .glass-btn::after {  content: ""; /* Added missing quotes */
    position: absolute; 
    top: 0; 
    left: 0; 
    width: 100%; 
    height: 100%;
    opacity: 0.4; 
    z-index: -1;  
    border-radius: 999rem;
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(1px);
    box-shadow: inset -10px -8px 0px -11px rgba(255, 255, 255, 1),
                inset 0px -9px 0px -8px rgba(255, 255, 255, 1);
    filter: blur(1px) drop-shadow(10px 4px 6px black) brightness(115%);
    }
  .glass-btn:hover{background:rgba(255, 255, 255, 0.3);} 
  .glass-btn svg{width:30px;height:30px;opacity: 0.8; }
  .glass-btn:hover svg{width:30px;height:30px;opacity: 0.95; }

  .square-btn{
    display: inline-grid;
    place-items: center;
    width: 36px;
    height: 36px;
    padding: 0;
    color: #fff;
    background: rgb(20 20 20 / 80%);
    border: 1px solid rgb(255 255 255 / 15%);
    border-radius: 4px;
    cursor: pointer;
    appearance: none;
    transition:
      background-color 120ms ease,
      border-color 120ms ease,
      transform 80ms ease;
    }
  .square-btn:hover{background: rgb(45 45 45 / 95%);border-color: rgb(255 255 255 / 45%);}
  .square-btn svg{width: 24px;height: 24px;fill: currentColor;pointer-events: none;}
  .mute-btn {position:absolute;right:20px;bottom:48px;z-index:3;width:36px;height:36px;opacity:0;pointer-events:none;transition:opacity .16s ease;}
  .live-fs-btn{position:absolute;right:20px;bottom:92px;z-index:3;width:36px;height:36px;opacity:0;pointer-events:none;transition:opacity .16s ease;}

  .live-fs-btn[hidden],.popup-playback-btn[hidden],.popup-media-btn[hidden]{display:none !important;}


  .sv.stream-type{text-transform:uppercase;font-size:0.95rem;}
  .btn-secondary{border:none;background:transparent;color:var(--editor-primary);font-weight:600;cursor:pointer;padding:8px 12px;}
  .btn-primary{background:var(--editor-primary);color:var(--text-primary-color, #ffffff);border-radius:999px;padding:8px 18px;}
  .cam-tab{font-size: 1rem;padding:0.4em;line-height: 1;font-weight:600;padding:6px;white-space:nowrap;}  
  .cam-tab:hover{color:var(--c-primary-d);}
  .cam-tab.active{background:var(--c-primary-d);color:var(--c-text-rev);}
  .cam-tab.active:hover{background:var(--c-primary-d);color:var(--c-text-rev);}
  .cam-tab svg{width:14.4px;height:14.4px;flex-shrink:0;}
  .cam-tab:hover svg{width:14.4px;height:14.4px;flex-shrink:0;} 
  .cam-dot{font-size:0.7rem;vertical-align:middle;}

  .overlay-controls::after {content: "";position: absolute;top: 0;left: 0;}
  .overlay-controls[hidden]{display:none !important;}
  .overlay-controls svg {width:30px;height:30px;opacity: 0.8; }
  .overlay-controls:hover svg {width:30px;height:30px;opacity: 0.95; }
  .popup-playback-controls{display:flex;gap:4px;}
  .popup-playback-controls .popup-playback-btn{position:relative;width:36px;height:36px;padding:3px;}
  #viewer:hover .popup-playback-controls{opacity:1;pointer-events:auto;}
  @media (hover:none), (pointer:coarse){#viewer .popup-playback-controls{opacity:1;pointer-events:auto;}}
  .slideshow-next-chip{position:absolute;top:8px;left:50%;transform:translateX(-50%);z-index:6;min-height:30px;padding:4px 10px;border-radius:999px;font-size:.78rem;font-weight:700;line-height:1;cursor:default;pointer-events:none;white-space:nowrap;opacity:.95;}
  .slideshow-next-chip[hidden]{display:none !important;}
  #live-stage.live-controls-visible .live-fs-btn,
  #live-stage.live-controls-visible .mute-btn{opacity:1;pointer-events:auto;}
  @media (hover: hover) and (pointer: fine) {
    #live-stage:hover .live-fs-btn,
    #live-stage:hover .mute-btn{opacity:1;pointer-events:auto;}
  }

  #live-stage:fullscreen .live-fs-btn,
  #live-stage:-webkit-full-screen .live-fs-btn,
  #viewer:fullscreen .overlay-controls,
  #viewer:-webkit-full-screen .overlay-controls{display:none !important;}
  #live-stage:fullscreen,
  #live-stage:-webkit-full-screen{display:flex;align-items:center;justify-content:center;width:100%;height:100%;background:#000;}
  #live-stage:fullscreen #eng-wrap,
  #live-stage:-webkit-full-screen #eng-wrap{width:100%;height:100%;max-height:none;aspect-ratio:auto;}
  #viewer:fullscreen,
  #viewer:-webkit-full-screen{width:100%;height:100%;max-height:none;min-height:0;aspect-ratio:auto;border-radius:0;background:#000;}
  #viewer:fullscreen img.snap,
  #viewer:-webkit-full-screen img.snap{cursor:default;}
  .viewer{width:100%;aspect-ratio:16/9;min-height:240px;max-height:70dvh;
    background:var(--c-bg-deep);display:flex;align-items:center;justify-content:center;z-index:2;position:relative;overflow:hidden;border-radius:7px;}
  .viewer video,.viewer img.snap{width:100%;height:100%;object-fit:contain;
    background:var(--c-bg-deep);}
  .viewer img.snap{cursor:zoom-in;touch-action:manipulation;user-select:none;-webkit-user-drag:none;}
  .viewer .ld{color:var(--c-text2);font-size:0.975rem;}
  .ph{width:100%;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1px;color:var(--c-text2);background:linear-gradient(145deg,#1a2540,#0d1520);}
  .ph svg{width:40px;height:40px;opacity:.35;}
  .live-grid{width:100%;height:100%;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));grid-template-rows:repeat(2,minmax(0,1fr));gap:6px;padding:6px;box-sizing:border-box;}
  .live-grid-cell{position:relative;overflow:hidden;border-radius:calc(var(--fvc-border-radius) / 2);background:var(--c-bg-deep);border:1px solid var(--c-border2);}
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
  .card.preview-active.mobile-client .col-left{display:block !important;position:absolute !important;left:-9999px !important;top:0 !important;width:1px !important;height:1px !important;min-width:1px !important;min-height:1px !important;overflow:hidden !important;opacity:0 !important;pointer-events:none !important;}
  .card.preview-active.mobile-client .resize-handle,.card.preview-active.mobile-client .col-right{display:none !important;}

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

  .preview-cell{display:flex;flex-direction:column;cursor:pointer;-webkit-backface-visibility: hidden;backface-visibility: hidden;border-radius:var(--fvc-border-radius);}
  .preview-media-host{position:relative;aspect-ratio:16/9;overflow:hidden;border-radius:var(--fvc-border-radius);background:var(--c-bg-deep);-webkit-backface-visibility: hidden;backface-visibility: hidden;
    transform: translateZ(0);}
  .preview-media-host::after{content:"";position:absolute;inset:0;pointer-events:none;border:0 solid transparent;border-radius:inherit;box-sizing:border-box;z-index:3;}
  .preview-media-host.grid-alert{border-color:var(--error-color, var(--c-bg-alert));box-shadow:inset 0 0 0 2px var(--error-color, var(--c-bg-alert));}
  .preview-media-host.grid-alert::after{border-width:2px;border-color:var(--error-color, var(--c-bg-alert));}
  .preview-media-host.grid-detection{border-color:var(--warning-color, var(--c-accent));box-shadow:inset 0 0 0 2px var(--warning-color, var(--c-accent));}
  .preview-media-host.grid-detection::after{border-width:2px;border-color:var(--warning-color, var(--c-accent));}
  .preview-media-host video,.preview-media-host img,.preview-media-host ha-camera-stream{width:100%;height:100%;display:block;object-fit:contain;object-position:center center;background:var(--c-bg-deep);}
  .preview-meta{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:2px 8px;align-items:center;padding:6px 8px;background:var(--c-bg-main);
    border-radius:var(--fvc-border-radius);}
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
  .info-row{display:grid;grid-template-columns: repeat(3, 1fr);padding:0px 10px;align-items: center;}
  .info-left{text-align:left}
  .info-row-action-slot{text-align: center;}
  .info-row-page-nav{display:flex;justify-content:center;align-items:center;flex:1 1 240px;padding:0 12px;min-width:0;}
  .info-row-page-nav .page-nav{padding:0;justify-content:center;width:100%;}
  .page-nav{display:flex;align-items:center;justify-content:center;gap:4px;padding:0;}
  .page-nav-btn{border-radius:6px;}
  .page-nav-btn.active svg{color:var(--c-text-rev);opacity:1;}
  .info-row-mic-btn{display:inline-flex;align-items:center;justify-content:center;width:40px;height:40px;border-radius:999px;border:1px solid transparent;background:transparent;color:var(--c-text2);cursor:pointer;transition:background .16s ease,border-color .16s ease,color .16s ease,box-shadow .16s ease;border:1px solid var(--c-text3);}
  .info-row-mic-btn[hidden] {display: none !important;}
  .info-row-mic-btn svg{width:24px;height:24px;opacity:.92;color:currentColor;}
  .info-row-mic-btn:hover{border-color:var(--c-primary-d);color:var(--c-primary-d);}
  .info-row-mic-btn.active{background:rgba(74,222,128,.16);border-color:rgba(74,222,128,.45);color:#4ade80;box-shadow:0 0 0 1px rgba(74,222,128,.15) inset;}
  .info-row-mic-btn.active svg{opacity:1;}
  .info-title{font-size:1.05rem;font-weight:700;color:var(--c-text);}
  .stats{display:flex;gap:10px;text-align:right;justify-content: end;align-items: center;} 
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
  .tl-tools{position:relative;display:flex;gap:4px;}
  .tl-tools-slot{display:flex;align-items:center;justify-content:flex-end;min-width:0;}
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
  @container (max-width: 640px){
    .button-holder{grid-template-columns:minmax(0,1fr) auto;grid-template-areas:"nav nav" "tabs tools";gap:8px;padding:6px 8px;}
    .button-holder .page-nav-row{justify-content:center;}
    .button-holder .tabs-row{justify-content:flex-start;}
    .button-holder .tools-row{justify-content:flex-end;}
  }
  @container (max-width: 500px){
    .button-holder{grid-template-columns:minmax(0,1fr);grid-template-areas:"nav" "tools" "tabs";gap:6px;padding:6px 8px;}
    .button-holder .tabs-row,.button-holder .tools-row,.button-holder .page-nav-row{justify-content:center;}
    .button-holder .tabs{justify-content:center;}
    .button-holder .tl-tools-slot{justify-content:center;}
  }
  @media (max-width: 920px){
    .tabs-holder{container-type:inline-size;}
  }
  .divider {min-height:36px;width:8px;display:flex;align-items:center;justify-content:center;}
  .divider svg {height:24px;width:8px;opacity:0.85;color:var(--c-text2);}
  .ico{width:30px;height:30px;display:flex;align-items:center;background:var(--c-bg-panel);border:1px solid var(--c-border2);border-radius:5px;color:var(--c-text2);cursor:pointer;}
  .ico svg{width:24px;height:24px;} .ico:hover{color:var(--c-primary-d);border-color:var(--c-primary-d);}
  .ico.fav.on{color:var(--c-accent);border-color:rgba(251,191,36,.4);background:rgba(251,191,36,.12);}

  /* \u2500\u2500 filter + cal \u2500\u2500 */
  .filter-panel,.cal-panel{display: none;position: absolute;top:100%;right:0;background-color: #f1f1f1;min-width: 300px;overflow: auto;border-top: 3px solid var(--c-primary);box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.2);z-index: 3;padding:20px;}
  .frow{display:flex;align-items:center;gap:5px;flex-wrap:wrap;margin-bottom:4px;} .frow:last-child{margin-bottom:0;} .frow-l{font-size:0.75rem;color:var(--c-text3);width:38px;text-transform:uppercase;flex-shrink:0;}
  .chip{background:var(--c-bg-panel);border:1px solid var(--c-border2);color:var(--c-text2);border-radius:10px;padding:3.6px 10.8px;font-size:0.825rem;cursor:pointer;}
  .chip.on{background:var(--c-primary-l);border-color:var(--c-primary-d);color:var(--c-primary-d);}
  .cal-top{display:flex;justify-content:center;margin-bottom:6px;}
  .cal-today-btn{background:var(--c-bg-panel);border:1px solid var(--c-border2);color:var(--c-text2);border-radius:8px;cursor:pointer;padding:3.6px 10.8px;font-size:0.78rem;font-weight:600;transition:all .2s ease;}
  .cal-today-btn:hover{color:var(--c-primary-d);border-color:var(--c-primary-d);background:var(--c-primary-l);}
  .cal-head{display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;} .cal-head b{font-size:0.9rem;} .cal-head button{background:none;border:none;color:var(--c-primary-d);font-size:1.275rem;cursor:pointer;padding:0 6px;}
  .cal-dow,.cal-grid{display:grid;grid-template-columns:repeat(7,1fr);gap:1px;text-align:center;}
  .cal-dow span{font-size:0.675rem;color:var(--c-text2);padding:2px 0;}
  .cday{position:relative;background:none;border:none;color:var(--c-text);font-size:0.825rem;padding:6px 0;border-radius:4px;cursor:pointer;} .cday:hover,.cday.active{background:var(--c-primary-l);} .cdot{position:absolute;bottom:2px;left:50%;transform:translateX(-50%);width:3px;height:3px;border-radius:50%;background:#ef4444;}

  .controls-section{padding:6px 2px 0;}
  .controls-pad-wrap{max-width:280px;margin:10px auto 12px;}
  .controls-pad-wrap.is-disabled{opacity:.45;pointer-events:none;filter:saturate(.5);}
  .controls-actions{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:10px;margin:0 0 12px;}
  .controls-action-group{background:var(--c-bg-panel);border:1px solid var(--c-border2);border-radius:10px;padding:10px;}
  .controls-action-group.is-disabled{opacity:.55;filter:saturate(.55);}
  .controls-action-group-label{font-size:0.72rem;font-weight:700;text-transform:uppercase;letter-spacing:.03em;color:var(--c-text2);margin-bottom:8px;}
  .controls-action-row{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;}
  .controls-action-btn{appearance:none;background:var(--c-bg-main);border:1px solid var(--c-border2);color:var(--c-text);border-radius:10px;padding:10px 8px;font-size:0.82rem;font-weight:700;cursor:pointer;transition:transform .12s ease,background .2s ease,border-color .2s ease,color .2s ease;}
  .controls-action-btn:hover:not(:disabled),.controls-action-btn:focus-visible:not(:disabled){border-color:var(--c-primary-d);background:var(--c-primary-l);color:var(--c-primary-d);outline:none;}
  .controls-action-btn:active:not(:disabled){transform:translateY(1px) scale(.99);}
  .controls-action-btn:disabled{cursor:not-allowed;color:var(--c-text4);background:var(--c-bg-panel);}
  .controls-readout{background:var(--c-bg-panel);border:1px solid var(--c-border2);border-radius:10px;overflow:hidden;}
  .controls-readout-head{display:flex;align-items:center;justify-content:space-between;padding:7px 10px;border-bottom:1px solid var(--c-border2);}
  .controls-readout-label{font-size:0.75rem;font-weight:700;text-transform:uppercase;letter-spacing:.03em;color:var(--c-text2);}
  .controls-readout-clear{background:none;border:1px solid var(--c-border2);color:var(--c-text2);border-radius:8px;font-size:0.72rem;font-weight:600;padding:3px 8px;cursor:pointer;transition:all .2s ease;}
  .controls-readout-clear:hover{color:var(--c-primary-d);border-color:var(--c-primary-d);background:var(--c-primary-l);}
  .controls-readout-lines{max-height:154px;overflow-y:auto;padding:8px 10px;font-family:ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;font-size:0.82rem;line-height:1.45;color:var(--c-text);}
  .controls-readout-line{padding:1px 0;}
  .controls-readout-empty{color:var(--c-text3);font-style:italic;font-family:var(--ha-font-family, Roboto, 'Helvetica Neue', sans-serif);}

  .frigate-view{max-height:24px;pointer-events: none;}
  .frigate-view svg{height:24px;pointer-events: none;}
  .frigateView-accent svg{color:#ff5733;fill:#ff5733;}
  .frigateView-accent {color:#ff5733;fill:#ff5733;}
  
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
  .toast{position:fixed;left:50%;bottom:24px;transform:translateX(-50%);z-index:1600;background:rgba(15,21,40,.96);border:1px solid rgba(239,68,68,.4);color:var(--c-off);padding:8px 14px;border-radius:6px;font-size:0.9rem;box-shadow:0 8px 24px rgba(0,0,0,.5);max-width:90%;}

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
  .popup-media-controls {display:grid;grid-template-columns:2px 36px minmax(0,1fr) 36px 36px 36px 2px;grid-template-areas:"sp1 play progress mute fs airplay sp2" ". . time . . . .";align-items:center;column-gap:5px;row-gap:0;padding:1px 4px 2px;border-radius:8px;background:var(--c-bg-panel);border:1px solid var(--c-border2);box-sizing:border-box;width:100%;}
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
  .popup-media-btn#popup-media-airplay {grid-area:airplay;}
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


${MOBILE_VIEW_PAGE_STYLES}


`;

// src/components/circle-pad/circle-pad.js
const CIRCLE_PAD_CLASS = "circle-pad";
const CIRCLE_PAD_DATA_ACTION = "data-circle-pad-action";
const CIRCLE_PAD_ACTIONS = Object.freeze({
  UP: "up",
  UP_RIGHT: "up-right",
  RIGHT: "right",
  DOWN_RIGHT: "down-right",
  DOWN: "down",
  DOWN_LEFT: "down-left",
  LEFT: "left",
  UP_LEFT: "up-left",
  ZOOM_IN: "zoom-in",
  ZOOM_OUT: "zoom-out",
  MIC: "mic"
});
const DIRECTION_ACTIONS = Object.freeze(
  new Set([
    CIRCLE_PAD_ACTIONS.UP,
    CIRCLE_PAD_ACTIONS.UP_RIGHT,
    CIRCLE_PAD_ACTIONS.RIGHT,
    CIRCLE_PAD_ACTIONS.DOWN_RIGHT,
    CIRCLE_PAD_ACTIONS.DOWN,
    CIRCLE_PAD_ACTIONS.DOWN_LEFT,
    CIRCLE_PAD_ACTIONS.LEFT,
    CIRCLE_PAD_ACTIONS.UP_LEFT,
    CIRCLE_PAD_ACTIONS.ZOOM_IN,
    CIRCLE_PAD_ACTIONS.ZOOM_OUT
  ])
);
const EVT_PRESS = "circle-pad-press";
const EVT_RELEASE = "circle-pad-release";
const EVT_TOGGLE = "circle-pad-toggle";
const INPUT_MODE_TOUCH = "touch";
const INPUT_MODE_MOUSE = "mouse";
const ACTION_SELECTOR = "[" + CIRCLE_PAD_DATA_ACTION + "]";
const CENTER_BUTTON_SELECTOR = ".center-button";
const DISABLED_ACTIONS_ATTR = "disabled-actions";
const ROOT_EVENT_BINDINGS = Object.freeze([
  ["pointerdown", "_onPointerDown"],
  ["pointerup", "_onPointerUp"],
  ["pointercancel", "_onPointerCancel"],
  ["pointerleave", "_onPointerLeave"],
  ["click", "_onClick"]
]);
const CIRCLE_PAD_STYLES = `
  :host {
    display: block;
    --circle-pad-bg-1: var(--primary-background-color);
    --circle-pad-bg-2: var(--card-background-color);
    --circle-pad-bg-3: var(--secondary-background-color);
    --circle-pad-dark-primary: var(--dark-primary-color);
    --circle-pad-primary: var(--primary-color);
    --circle-pad-accent: var(--accent-color);
    --circle-pad-light-primary: var(--light-primary-color);
    --circle-pad-text-1: var(--primary-text-color);
    --circle-pad-text-2: var(--secondary-text-color);
    --circle-pad-text-3: var(--disabled-text-color);
    --circle-pad-text-4: var(--state-inactive-color);
    --circle-pad-text-5: var(--text-primary-color);
    --circle-pad-success: var(--success-color);
  }

  .${CIRCLE_PAD_CLASS}__wrapper {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    overflow: visible;
    aspect-ratio: 1 / 1;
    min-height: 220px;
  }

  .${CIRCLE_PAD_CLASS}__wrapper svg {
    width: 100%;
    height: 100%;
    max-width: 100%;
    max-height: 100%;
    position: relative;
    z-index: 1;
    overflow: visible;
  }
/*==================USED BELOW============================*/
.circle-pad-outline {fill:var(--circle-pad-text-3);filter:url(#circle-pad-outside-shadow);}
.circle-pad-middle-circle {fill:var(--circle-pad-text-3);shape-rendering: geometricPrecision;filter:url(#circle-pad-outside-shadow);}
circle.circle-pad-middle-circle {
  shape-rendering: geometricPrecision;
}

/*==================USED ABOVE============================*/
.slice-button .circle-pad-key,
.slice-button path.circle-pad-key {
  cursor: pointer;
  outline: none;
  transition: fill 0.2s ease, stroke 0.2s ease, filter 0.2s ease;
  fill: var(--primary-background-color);
}
.slice-button.is-disabled .circle-pad-key,
.slice-button.is-disabled path.circle-pad-key {
  cursor: not-allowed;
  fill: var(--circle-pad-bg-3);
}
.slice-button.is-disabled {
  cursor: not-allowed;
}
.slice-button .circle-pad-key.is-pressed,
.slice-button .circle-pad-key:active { fill: var(--circle-pad-dark-primary) }

@media (hover: hover) {
  .${CIRCLE_PAD_CLASS}:not([data-input-mode="touch"]) .slice-button:not(.is-disabled) path.circle-pad-key:hover {
    fill: var(--circle-pad-primary);  }
}

/* Standalone shadow layer applied exclusively over the center button structure in base state */
.center-button {
  box-shadow: 
    0px 4px 8px rgba(0, 0, 0, 0.12),          /* Your original outer drop shadow */
    inset 0px 2px 4px rgba(0, 0, 0, 0.15);    /* New subtle inset shadow */
}
/* The inner shadow overlay styling */
.inner-shadow-overlay {
  fill: none;
  stroke: var(--circle-pad-text-1);
  stroke-width: 2;          /* Thickness of the shadow */
  opacity: 0.15;            /* Softness/transparency of the shadow */
  filter: url(#simple-blur); /* Applies the blur effect */
}
/* Keyboard Accessibility Focus Rings - Set to none to prevent extra lines when active */
.${CIRCLE_PAD_CLASS} svg:focus, .${CIRCLE_PAD_CLASS} svg:active {
  outline: none;
} 

/*==================USED BELOW===================*/
/* --- Chevron State Handling --- */
.${CIRCLE_PAD_CLASS}:not([data-input-mode="touch"]) .slice-button .slice-chevron{
  stroke: var(--circle-pad-text-1) !important;
}
.${CIRCLE_PAD_CLASS}:not([data-input-mode="touch"]) .slice-button .slice-zoom{
  fill: var(--circle-pad-text-1) !important;
}
.${CIRCLE_PAD_CLASS}:not([data-input-mode="touch"]) .slice-button.is-disabled .slice-chevron {
  stroke: var(--circle-pad-text-4) !important;
}
.${CIRCLE_PAD_CLASS}:not([data-input-mode="touch"]) .slice-button.is-disabled .slice-zoom {
  fill: var(--circle-pad-text-4) !important;
}

/* Keep chevrons bright while a slice is actively pressed. */
.${CIRCLE_PAD_CLASS}:not([data-input-mode="touch"]) .slice-button.is-pressed .slice-chevron {
  stroke: var(--circle-pad-text-5) !important;
}
.${CIRCLE_PAD_CLASS}:not([data-input-mode="touch"]) .slice-button.is-pressed .slice-zoom {
  fill: var(--circle-pad-text-5) !important;
}

@media (hover: hover) {
  .${CIRCLE_PAD_CLASS}:not([data-input-mode="touch"]) .slice-button:not(.is-disabled):hover .slice-chevron {
    stroke: var(--circle-pad-text-5) !important;
  }
  .${CIRCLE_PAD_CLASS}:not([data-input-mode="touch"]) .slice-button:not(.is-disabled):hover .slice-zoom {
    fill: var(--circle-pad-text-5) !important;
  }

  .${CIRCLE_PAD_CLASS}:not([data-input-mode="touch"]) .slice-button:not(.is-disabled):not(:hover):not(.is-pressed) .slice-chevron {
    stroke: var(--circle-pad-text-1) !important;
  }
  .${CIRCLE_PAD_CLASS}:not([data-input-mode="touch"]) .slice-button:not(.is-disabled):not(:hover):not(.is-pressed) .slice-zoom {
    fill: var(--circle-pad-text-1) !important;
  }
}

.${CIRCLE_PAD_CLASS}[data-input-mode="touch"] .slice-button .slice-chevron {
  stroke: var(--circle-pad-text-1) !important;
}
.${CIRCLE_PAD_CLASS}[data-input-mode="touch"] .slice-button .slice-zoom {
  fill: var(--circle-pad-text-1) !important;
}
.${CIRCLE_PAD_CLASS}[data-input-mode="touch"] .slice-button.is-disabled .slice-chevron {
  stroke: var(--circle-pad-text-4) !important;
}
.${CIRCLE_PAD_CLASS}[data-input-mode="touch"] .slice-button.is-disabled .slice-zoom {
  fill: var(--circle-pad-text-4) !important;
}

/* Touch-mode override: ignore sticky pseudo-classes and drive visual state via .is-pressed only. */
.${CIRCLE_PAD_CLASS}[data-input-mode="touch"] .slice-button {
  fill: var(--primary-background-color) !important;
}

.${CIRCLE_PAD_CLASS}[data-input-mode="touch"] .slice-button.is-pressed {
  fill: var(--circle-pad-dark-primary) !important;
}

.${CIRCLE_PAD_CLASS}[data-input-mode="touch"] .slice-button.is-pressed .slice-chevron {
  stroke: var(--circle-pad-text-4) !important;
}
.${CIRCLE_PAD_CLASS}[data-input-mode="touch"] .slice-button.is-pressed .slice-zoom {
  fill: var(--circle-pad-text-4) !important;
}
/*==================USED ABOVE===================*/

`;
const CIRCLE_PAD_SVG = `
  <div class="${CIRCLE_PAD_CLASS}__wrapper">
<svg version="1.1" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
 <defs>
  <filter id="simple-blur">
    <feGaussianBlur stdDeviation="1.8"></feGaussianBlur>
  </filter>
      
  <filter id="circle-pad-outside-shadow" x="-30%" y="-30%" width="160%" height="160%">
    <feDropShadow dx="0.2" dy="0.2" stdDeviation="2" flood-color="#333333" flood-opacity="0.25"></feDropShadow>
  </filter>

  <filter id="circle-pad-clean-edges" x="-.013333" y="-.02717" width="1.0267" height="1.0543" style="color-interpolation-filters:sRGB">
   <feGaussianBlur result="blur" stdDeviation="0.15"/>
   <feComposite in="SourceGraphic" in2="blur" operator="in" result="composite1"/>
   <feComposite in="composite1" in2="composite1" k2="1" operator="in" result="composite2"/>
  </filter>

 </defs>
 
 <circle id="circle-pad-outline" class="circle-pad-outline" cx="50" cy="50" r="48" stroke-linecap="round" />
 
 <g id="button-right" class="slice-button" transform="translate(-46.941,-16.885)" aria-label="Right" role="button" ${CIRCLE_PAD_DATA_ACTION}="right">
  <path id="circle-pad-button-right" class="circle-pad-key" d="m130.7 33.651a47 47 0 0 1 0 66.468l-33.234-33.234z" fill="#fafafa" style="filter:url(#circle-pad-clean-edges)"/>
  <path id="circle-pad-chevron-right" class="slice-chevron" d="m127.96 64.64 2.0805 2.5402-2.0805 2.5402" fill="none" stroke-linejoin="round" stroke-width="1" style="pointer-events: none;" />
 </g>
 
 <g id="button-down" class="slice-button" transform="translate(-46.941,-16.885)" aria-label="Down"  role="button" ${CIRCLE_PAD_DATA_ACTION}="down">
  <path id="circle-pad-button-down" class="circle-pad-key" d="m130.17 100.65a47 47 0 0 1-33.234 13.766 47 47 0 0 1-33.234-13.766l33.234-33.234z" fill="#fafafa" style="filter:url(#circle-pad-clean-edges)" />
  <path id="circle-pad-chevron-down" class="slice-chevron" d="m99.48 97.96-2.5402 2.0805-2.5402-2.0805" fill="none" stroke-linejoin="round" stroke-width="1" style="pointer-events: none;" />
 </g>
 
 <g id="button-up" class="slice-button" transform="translate(-46.941,-16.885)" aria-label="Up"  role="button" ${CIRCLE_PAD_DATA_ACTION}="up">
  <path id="circle-pad-button-up" class="circle-pad-key" d="m63.707 33.122a47 47 0 0 1 66.468-2e-6l-33.234 33.234z" fill="#fafafa" style="filter:url(#circle-pad-clean-edges)" />
  <path id="circle-pad-chevron-up" class="slice-chevron" d="m94.4 35.8 2.5402-2.0805 2.5402 2.0805" fill="none" stroke-linejoin="round" stroke-width="1" style="pointer-events: none;" />
 </g>
 
 <g id="button-left" class="slice-button" transform="translate(-46.941 -16.855)" aria-label="Left"  role="button" ${CIRCLE_PAD_DATA_ACTION}="left">
  <path id="circle-pad-button-left" class="circle-pad-key" d="m63.177 100.12a47 47 0 0 1-13.766-33.234 47 47 0 0 1 13.766-33.234l33.234 33.234z" fill="#fafafa" style="filter:url(#circle-pad-clean-edges)" />
  <path id="circle-pad-chevron-left" class="slice-chevron" d="m65.92 69.42-2.0805-2.5402 2.0805-2.5402" fill="none" stroke-linejoin="round" stroke-width="1" style="pointer-events: none;" />
 </g>
 
 <circle id="circle-pad-middle-circle" class="circle-pad-middle-circle" cx="50" cy="50" r="14"/>
 
 <g id="button-zoom-out" class="slice-button" aria-label="Zoom Out" role="button" tabindex="0" ${CIRCLE_PAD_DATA_ACTION}="zoom-out">
  <path id="circle-pad-zoom-out" class="circle-pad-key" d="m63.5 50.25a13.5 13.25 0 0 1-6.75 11.475 13.5 13.25 0 0 1-13.5-1e-6 13.5 13.25 0 0 1-6.75-11.475h13.5z" style="filter:url(#circle-pad-clean-edges);"/>
  <path id="circle-pad-zoom-out-icon" class="slice-zoom" d="m53 57.304h-6v-0.85714h6z" style="pointer-events: none;" />
 </g>
 <g id="button-zoom-in" class="slice-button" aria-label="Zoom In" role="button" tabindex="0" ${CIRCLE_PAD_DATA_ACTION}="zoom-in">
  <path id="circle-pad-zoom-in" class="circle-pad-key" d="m36.5 49.75a13.5 13.25 0 0 1 13.5-13.25 13.5 13.25 0 0 1 13.5 13.25h-13.5z" style="filter:url(#circle-pad-clean-edges);"/>
  <path id="circle-pad-zoom-in-icon" class="slice-zoom" d="m53 43.554h-2.5714v2.5714h-0.85714v-2.5714h-2.5714v-0.85714h2.5714v-2.5714h0.85714v2.5714h2.5714z" style="pointer-events: none;" />
 </g>
</svg>

  </div>
`;
const CirclePadControl = class extends HTMLElement {
  static get observedAttributes() {
    return [DISABLED_ACTIONS_ATTR];
  }
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._pressed = new Set();
    this._pressedByPointer = new Map();
    this._activeMic = false;
    this._mounted = false;
    this._wired = false;
    this._resetRootHandlers();
  }
  connectedCallback() {
    this._mount();
    this._wireControlEvents();
  }
  disconnectedCallback() {
    this._pressed.clear();
    this._unbindRootEvents();
    this._wired = false;
    this._resetRootHandlers();
  }
  attributeChangedCallback(name, _oldValue, _newValue) {
    if (name !== DISABLED_ACTIONS_ATTR) return;
    this._applyDisabledActions();
  }
  setActive(action, active) {
    if (action !== CIRCLE_PAD_ACTIONS.MIC) return;
    this._activeMic = Boolean(active);
    this._applyMicState();
  }
  getState() {
    return { mic: this._activeMic };
  }
  _mount() {
    if (this._mounted) return;
    this._mounted = true;
    const style = document.createElement("style");
    style.textContent = CIRCLE_PAD_STYLES;
    const root = document.createElement("div");
    root.className = CIRCLE_PAD_CLASS;
    root.innerHTML = CIRCLE_PAD_SVG;
    this._rootEl = root;
    this.shadowRoot.appendChild(style);
    this.shadowRoot.appendChild(root);
    this._applyDisabledActions();
    this._applyMicState();
  }
  _getDisabledActions() {
    return new Set(
      String(this.getAttribute(DISABLED_ACTIONS_ATTR) || "").split(/[\s,]+/).map((action) => action.trim()).filter(Boolean)
    );
  }
  _isActionDisabled(action) {
    return this._getDisabledActions().has(action);
  }
  _applyDisabledActions() {
    if (!this.shadowRoot) return;
    const disabledActions = this._getDisabledActions();
    for (const button of this.shadowRoot.querySelectorAll(ACTION_SELECTOR)) {
      const action = this._getButtonAction(button);
      const disabled = !!action && disabledActions.has(action);
      button.classList.toggle("is-disabled", disabled);
      button.setAttribute("aria-disabled", String(disabled));
      if (disabled) {
        button.classList.remove("is-pressed");
      }
    }
  }
  _applyMicState() {
    if (!this.shadowRoot) return;
    const mic = this.shadowRoot.querySelector(CENTER_BUTTON_SELECTOR);
    if (!mic) return;
    mic.classList.toggle("is-active", this._activeMic);
    mic.setAttribute("aria-pressed", String(this._activeMic));
  }
  _setInputMode(mode) {
    if (!this._rootEl) return;
    this._rootEl.setAttribute("data-input-mode", mode);
  }
  _trySetPointerCapture(btn, pointerId) {
    if (!btn || typeof btn.setPointerCapture !== "function") return;
    if (!this._hasPointerId(pointerId)) return;
    try {
      btn.setPointerCapture(pointerId);
    } catch (_e) {
    }
  }
  _hasPointerId(pointerId) {
    return pointerId !== null && pointerId !== void 0;
  }
  _resetRootHandlers() {
    this._onPointerDown = null;
    this._onPointerUp = null;
    this._onPointerCancel = null;
    this._onPointerLeave = null;
    this._onClick = null;
  }
  _bindRootEvents() {
    if (!this.shadowRoot) return;
    for (const [eventName, handlerKey] of ROOT_EVENT_BINDINGS) {
      const handler = this[handlerKey];
      if (handler) {
        this.shadowRoot.addEventListener(eventName, handler);
      }
    }
  }
  _unbindRootEvents() {
    if (!this.shadowRoot) return;
    for (const [eventName, handlerKey] of ROOT_EVENT_BINDINGS) {
      const handler = this[handlerKey];
      if (handler) {
        this.shadowRoot.removeEventListener(eventName, handler);
      }
    }
  }
  _findActionButton(target) {
    if (!(target instanceof Element)) return null;
    return target.closest(ACTION_SELECTOR);
  }
  _getButtonAction(btn) {
    return btn ? btn.getAttribute(CIRCLE_PAD_DATA_ACTION) : null;
  }
  _isMicAction(action) {
    return action === CIRCLE_PAD_ACTIONS.MIC;
  }
  _setMicPressed(btn, pressed) {
    if (!btn) return;
    btn.classList.toggle("is-pressed", Boolean(pressed));
  }
  _clearDirectionPressed(btn) {
    if (!btn) return;
    const action = this._getButtonAction(btn);
    if (!action || !this._pressed.has(action)) return;
    this._pressed.delete(action);
    btn.classList.remove("is-pressed");
  }
  _releaseDirectionByPointer(ev) {
    if (!ev || ev.pointerId === null || ev.pointerId === void 0) {
      return false;
    }
    const state = this._pressedByPointer.get(ev.pointerId);
    if (!state) return false;
    this._pressedByPointer.delete(ev.pointerId);
    this._clearDirectionPressed(state.btn);
    this._dispatch(EVT_RELEASE, { action: state.action });
    return true;
  }
  _setInputModeFromPointer(ev) {
    this._setInputMode(
      ev.pointerType === INPUT_MODE_TOUCH ? INPUT_MODE_TOUCH : INPUT_MODE_MOUSE
    );
  }
  _handleDirectionPointerDown(btn, action, pointerId) {
    if (!DIRECTION_ACTIONS.has(action)) return;
    if (this._isActionDisabled(action)) return;
    if (this._pressed.has(action)) return;
    this._pressed.add(action);
    if (this._hasPointerId(pointerId)) {
      this._pressedByPointer.set(pointerId, { action, btn });
    }
    btn.classList.add("is-pressed");
    this._dispatch(EVT_PRESS, { action });
    this._trySetPointerCapture(btn, pointerId);
  }
  _handleMicToggleClick(btn) {
    this._activeMic = !this._activeMic;
    this._applyMicState();
    this._setMicPressed(btn, false);
    this._dispatch(EVT_TOGGLE, {
      action: CIRCLE_PAD_ACTIONS.MIC,
      active: this._activeMic
    });
    const activeEl = this.shadowRoot && this.shadowRoot.activeElement;
    if (this._rootEl && this._rootEl.getAttribute("data-input-mode") === INPUT_MODE_TOUCH && activeEl && typeof activeEl.blur === "function") {
      activeEl.blur();
    }
  }
  _handlePointerEnd(ev, ignoreRelatedTarget = false) {
    if (this._releaseDirectionByPointer(ev)) return;
    const btn = this._findActionButton(ev.target);
    if (!btn) return;
    if (ignoreRelatedTarget && ev.relatedTarget && btn.contains(ev.relatedTarget)) {
      return;
    }
    const action = this._getButtonAction(btn);
    if (this._isMicAction(action)) {
      this._setMicPressed(btn, false);
      return;
    }
    if (this._isActionDisabled(action)) return;
    if (!DIRECTION_ACTIONS.has(action) || !this._pressed.has(action)) return;
    this._clearDirectionPressed(btn);
    this._dispatch(EVT_RELEASE, { action });
  }
  _handlePointerRelease(ev) {
    this._handlePointerEnd(ev, false);
  }
  _handlePointerLeave(ev) {
    this._handlePointerEnd(ev, true);
  }
  _wireControlEvents() {
    if (this._wired || !this.shadowRoot) return;
    this._wired = true;
    this._onPointerDown = (ev) => {
      const btn = this._findActionButton(ev.target);
      if (!btn) return;
      this._setInputModeFromPointer(ev);
      const action = this._getButtonAction(btn);
      if (this._isActionDisabled(action)) return;
      if (this._isMicAction(action)) {
        this._setMicPressed(btn, true);
        this._trySetPointerCapture(btn, ev.pointerId);
        return;
      }
      this._handleDirectionPointerDown(btn, action, ev.pointerId);
    };
    this._onPointerUp = (ev) => this._handlePointerRelease(ev);
    this._onPointerCancel = (ev) => this._handlePointerRelease(ev);
    this._onPointerLeave = (ev) => this._handlePointerLeave(ev);
    this._onClick = (ev) => {
      const btn = this._findActionButton(ev.target);
      if (!btn) return;
      if (!this._isMicAction(this._getButtonAction(btn))) return;
      this._handleMicToggleClick(btn);
    };
    this._bindRootEvents();
  }
  _dispatch(type, detail) {
    this.dispatchEvent(
      new CustomEvent(type, {
        detail: { ...detail, originalEvent: void 0 },
        bubbles: true,
        composed: true
      })
    );
  }
};
if (typeof customElements !== "undefined" && !customElements.get("circle-pad-control-2")) {
  customElements.define("circle-pad-control-2", CirclePadControl);
}

// src/features/navigation/router.js
const PAGE_IDS = Object.freeze({
  singleView: "single-view",
  mobileView: "mobile-view",
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
  PAGE_IDS.mobileView,
  PAGE_IDS.preview,
  PAGE_IDS.wideView
]);
const PAGE_ROUTE_SET = new Set(PAGE_ROUTE_ORDER);
const normalizePageRoute = (value) => {
  const route = String(value || "").trim().toLowerCase();
  if (route === "normal" || route === "single") return PAGE_IDS.singleView;
  if (route === "mobile" || route === "mobile_view") {
    return PAGE_IDS.mobileView;
  }
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
  if (pageId === PAGE_IDS.mobileView) {
    return config?.mobile_view_page_enabled === true;
  }
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

// src/config/preview-mapper.js
const normalizePositiveInteger = (value, fallback) => {
  const parsed = parseInt(String(value ?? "").trim(), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};
const createEditorPreviewDraft = (config) => ({
  title: config.title,
  subtitle: config.subtitle,
  cameras: Array.isArray(config.cameras) ? config.cameras.map((camera) => ({ ...camera })) : [],
  window_days: config.window_days,
  alerts_reviews_days: config.alerts_reviews_days,
  window_hours: config.window_hours,
  realtime_poll_seconds: config.realtime_poll_seconds,
  snapshot_update_seconds: config.snapshot_update_seconds,
  mobile_poll_battery_saver: config.mobile_poll_battery_saver,
  slideshow_rotation_enabled: config.slideshow_rotation_enabled,
  slideshow_rotation_seconds: config.slideshow_rotation_seconds,
  slideshow_alert_hold_seconds: config.slideshow_alert_hold_seconds,
  grid_mode_enabled: config.grid_mode_enabled,
  grid_start_in_grid_enabled: config.grid_start_in_grid_enabled,
  grid_live_view_enabled: config.grid_live_view_enabled,
  grid_alert_hold_seconds: config.grid_alert_hold_seconds,
  mobile_view_page_enabled: config.mobile_view_page_enabled,
  preview_page_enabled: config.preview_page_enabled,
  preview_page_live_cameras: config.preview_page_live_cameras,
  preview_page_alert_live_duration_seconds: config.preview_page_alert_live_duration_seconds,
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
  col_left_width_pct: config.col_left_width_pct,
  video_defaults: config.video_defaults,
  video_live_defaults: config.video_live_defaults,
  video_popup_defaults: config.video_popup_defaults,
  video_recording_defaults: config.video_recording_defaults
});
const applyEditorPreviewDraftToCardConfig = ({
  baseConfig,
  previewConfig
}) => {
  if (!previewConfig) return baseConfig;
  const base = baseConfig && typeof baseConfig === "object" ? baseConfig : {};
  return {
    ...base,
    title: previewConfig.title || null,
    subtitle: previewConfig.subtitle || null,
    cameras: Array.isArray(previewConfig.cameras) ? previewConfig.cameras : base.cameras,
    window_days: normalizePositiveInteger(previewConfig.window_days, 3),
    alerts_reviews_days: normalizePositiveInteger(
      previewConfig.alerts_reviews_days,
      normalizePositiveInteger(previewConfig.window_days, 3)
    ),
    window_hours: Number(previewConfig.window_hours) || null,
    realtime_poll_seconds: REALTIME_POLL_OPTIONS_SECONDS.includes(
      Number(previewConfig.realtime_poll_seconds)
    ) ? Number(previewConfig.realtime_poll_seconds) : 5,
    snapshot_update_seconds: normalizeBoundedPositiveInteger(
      previewConfig.snapshot_update_seconds,
      SNAPSHOT_UPDATE_SECONDS,
      10,
      240
    ),
    mobile_poll_battery_saver: previewConfig.mobile_poll_battery_saver === true,
    slideshow_rotation_enabled: previewConfig.slideshow_rotation_enabled === true,
    slideshow_rotation_seconds: SLIDESHOW_ROTATION_OPTIONS_SECONDS.includes(
      Number(previewConfig.slideshow_rotation_seconds)
    ) ? Number(previewConfig.slideshow_rotation_seconds) : 30,
    slideshow_alert_hold_seconds: normalizeBoundedPositiveInteger(
      previewConfig.slideshow_alert_hold_seconds,
      Math.round(SLIDESHOW_ALERT_HOLD_MS / 1e3),
      5,
      60
    ),
    grid_mode_enabled: previewConfig.grid_mode_enabled === true,
    grid_start_in_grid_enabled: previewConfig.grid_start_in_grid_enabled === true,
    grid_live_view_enabled: previewConfig.grid_live_view_enabled !== false,
    grid_alert_hold_seconds: normalizeBoundedPositiveInteger(
      previewConfig.grid_alert_hold_seconds,
      Math.round(GRID_ALERT_HOLD_MS / 1e3),
      5,
      60
    ),
    grid_rotation_seconds: GRID_ROTATION_OPTIONS_SECONDS.includes(
      Number(previewConfig.grid_rotation_seconds)
    ) ? Number(previewConfig.grid_rotation_seconds) : 30,
    mobile_view_page_enabled: previewConfig.mobile_view_page_enabled === true,
    preview_page_enabled: previewConfig.preview_page_enabled === true,
    preview_page_live_cameras: previewConfig.preview_page_live_cameras === true,
    preview_page_alert_live_duration_seconds: normalizeBoundedPositiveInteger(
      previewConfig.preview_page_alert_live_duration_seconds,
      10,
      5,
      60
    ),
    preview_page_show_title_bars: previewConfig.preview_page_show_title_bars !== false,
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
    col_left_width_pct: Number(previewConfig.col_left_width_pct) || 50,
    video_defaults: previewConfig.video_defaults && typeof previewConfig.video_defaults === "object" && !Array.isArray(previewConfig.video_defaults) ? previewConfig.video_defaults : base.video_defaults,
    video_live_defaults: previewConfig.video_live_defaults && typeof previewConfig.video_live_defaults === "object" && !Array.isArray(previewConfig.video_live_defaults) ? previewConfig.video_live_defaults : base.video_live_defaults,
    video_popup_defaults: previewConfig.video_popup_defaults && typeof previewConfig.video_popup_defaults === "object" && !Array.isArray(previewConfig.video_popup_defaults) ? previewConfig.video_popup_defaults : base.video_popup_defaults,
    video_recording_defaults: previewConfig.video_recording_defaults && typeof previewConfig.video_recording_defaults === "object" && !Array.isArray(previewConfig.video_recording_defaults) ? previewConfig.video_recording_defaults : base.video_recording_defaults
  };
};

// src/features/ptz/index.js
const PTZ_MOVE_MODE_CONTINUOUS = "ContinuousMove";
const PTZ_MOVE_MODE_RELATIVE = "RelativeMove";
const PTZ_SERVICE_DOMAIN = "frigate";
const PTZ_SERVICE_NAME = "ptz";
const ONVIF_PTZ_SERVICE_DOMAIN = "onvif";
const ONVIF_PTZ_SERVICE_NAME = "ptz";
const PTZ_DEFAULT_SPEED = 0.5;
const PTZ_DIRECTIONS = Object.freeze({
  up: Object.freeze(["up"]),
  "up-right": Object.freeze(["up", "right"]),
  right: Object.freeze(["right"]),
  "down-right": Object.freeze(["down", "right"]),
  down: Object.freeze(["down"]),
  "down-left": Object.freeze(["down", "left"]),
  left: Object.freeze(["left"]),
  "up-left": Object.freeze(["up", "left"])
});
const PTZ_SINGLE_ACTIONS = Object.freeze({
  "zoom-in": Object.freeze({ action: "zoom", argument: "in" }),
  "zoom-out": Object.freeze({ action: "zoom", argument: "out" }),
  "focus-in": Object.freeze({ action: "focus", argument: "in" }),
  "focus-out": Object.freeze({ action: "focus", argument: "out" })
});
const normalizePtzNumber = (value) => {
  if (value == null || value === "") return null;
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return null;
  if (parsed < 0 || parsed > 1) return null;
  return parsed;
};
const buildHomeAssistantPtzRequest = ({ camera, action, argument = null }) => ({
  type: "home_assistant_service",
  domain: PTZ_SERVICE_DOMAIN,
  service: PTZ_SERVICE_NAME,
  serviceData: argument ? { action, argument } : { action },
  target: { entity_id: camera.entity }
});
const buildOnvifPtzRequest = ({
  camera,
  moveMode,
  pan,
  tilt,
  zoom,
  speed,
  distance,
  continuousDuration
}) => {
  const serviceData = { move_mode: moveMode };
  if (pan) serviceData.pan = pan;
  if (tilt) serviceData.tilt = tilt;
  if (zoom) serviceData.zoom = zoom;
  if (speed != null) serviceData.speed = speed;
  if (distance != null) serviceData.distance = distance;
  if (continuousDuration != null) {
    serviceData.continuous_duration = continuousDuration;
  }
  return {
    type: "home_assistant_service",
    domain: ONVIF_PTZ_SERVICE_DOMAIN,
    service: ONVIF_PTZ_SERVICE_NAME,
    serviceData,
    target: { entity_id: camera.entity }
  };
};
const isHaDirectCamera = (camera) => String(camera?.connection_type || "").trim().toLowerCase() === "ha_direct";
const normalizePtzMoveMode = (value) => {
  const normalized = String(value || "").trim().toLowerCase();
  return normalized === "relativemove" ? PTZ_MOVE_MODE_RELATIVE : PTZ_MOVE_MODE_CONTINUOUS;
};
const normalizeCameraPtzConfig = (value) => {
  if (value !== true && (!value || typeof value !== "object")) {
    return null;
  }
  const source = value === true ? { enabled: true } : value;
  if (source.enabled === false) return null;
  const speed = normalizePtzNumber(source.speed) ?? PTZ_DEFAULT_SPEED;
  const distance = normalizePtzNumber(source.distance);
  const continuousDuration = normalizePtzNumber(source.continuous_duration);
  return {
    enabled: true,
    // Per-camera config currently supports continuous movement only.
    move_mode: PTZ_MOVE_MODE_CONTINUOUS,
    speed,
    distance,
    continuous_duration: continuousDuration
  };
};
const hasCameraPtz = (camera) => normalizeCameraPtzConfig(camera?.ptz)?.enabled === true;
const hasPtzPanTiltCapability = (ptzInfo) => Array.isArray(ptzInfo?.features) && (ptzInfo.features.includes("pt") || ptzInfo.features.includes("pt-r"));
const hasPtzZoomCapability = (ptzInfo) => Array.isArray(ptzInfo?.features) && ptzInfo.features.includes("zoom");
const hasPtzFocusCapability = (ptzInfo) => Array.isArray(ptzInfo?.features) && ptzInfo.features.includes("focus");
const canCameraUsePtz = (camera, ptzInfo) => hasCameraPtz(camera) && (isHaDirectCamera(camera) || hasPtzPanTiltCapability(ptzInfo));
const resolvePtzEmptyStateMessage = (camera, ptzInfo, { loading = false } = {}) => {
  if (!hasCameraPtz(camera)) {
    return "PTZ is not configured for the active camera.";
  }
  if (loading) {
    return "Checking Frigate PTZ support for the active camera.";
  }
  const hasPanTilt = hasPtzPanTiltCapability(ptzInfo);
  const hasZoom = hasPtzZoomCapability(ptzInfo);
  const hasFocus = hasPtzFocusCapability(ptzInfo);
  if (!hasPanTilt && !hasZoom && !hasFocus) {
    return "Frigate did not report PTZ support for the active camera.";
  }
  if (hasPanTilt && (hasZoom || hasFocus)) {
    return "Use the circle pad or PTZ buttons to control the active camera.";
  }
  if (hasPanTilt) return "Use the circle pad to move the active camera.";
  if (hasZoom || hasFocus)
    return "Use the PTZ buttons to control the active camera.";
  return "Use the circle pad to move the active camera.";
};
const canUsePtzAction = (action, ptzInfo, camera = null) => {
  if (isHaDirectCamera(camera)) {
    if (PTZ_DIRECTIONS[action]) return true;
    if (action === "zoom-in" || action === "zoom-out") return true;
    return false;
  }
  if (PTZ_DIRECTIONS[action]) return hasPtzPanTiltCapability(ptzInfo);
  if (action === "zoom-in" || action === "zoom-out") {
    return hasPtzZoomCapability(ptzInfo);
  }
  if (action === "focus-in" || action === "focus-out") {
    return hasPtzFocusCapability(ptzInfo);
  }
  return false;
};
const resolvePtzServicePlan = ({
  camera,
  ptzInfo,
  action,
  eventType
}) => {
  const ptz = normalizeCameraPtzConfig(camera?.ptz);
  if (!ptz || !camera?.entity || !canUsePtzAction(action, ptzInfo, camera)) {
    return null;
  }
  const haDirect = isHaDirectCamera(camera);
  if (eventType === "release") {
    if (ptz.move_mode !== PTZ_MOVE_MODE_CONTINUOUS) return null;
    if (haDirect) {
      return {
        executionMode: "sequential",
        requests: [
          buildOnvifPtzRequest({
            camera,
            moveMode: "Stop"
          })
        ],
        readout: "[ptz:stop]"
      };
    }
    return {
      executionMode: "sequential",
      requests: [buildHomeAssistantPtzRequest({ camera, action: "stop" })],
      readout: "[ptz:stop]"
    };
  }
  const directions = PTZ_DIRECTIONS[action];
  if (directions?.length) {
    if (haDirect) {
      const pan = directions.includes("left") ? "LEFT" : directions.includes("right") ? "RIGHT" : null;
      const tilt = directions.includes("up") ? "UP" : directions.includes("down") ? "DOWN" : null;
      return {
        executionMode: "sequential",
        requests: [
          buildOnvifPtzRequest({
            camera,
            moveMode: "ContinuousMove",
            pan,
            tilt,
            speed: ptz.speed,
            continuousDuration: ptz.continuous_duration
          })
        ],
        readout: `[ptz:${action}]`
      };
    }
    return {
      executionMode: directions.length > 1 ? "parallel" : "sequential",
      requests: directions.map(
        (direction) => buildHomeAssistantPtzRequest({
          camera,
          action: "move",
          argument: direction
        })
      ),
      readout: `[ptz:${action}]`
    };
  }
  const singleAction = PTZ_SINGLE_ACTIONS[action];
  if (!singleAction) return null;
  if (haDirect) {
    const zoom = action === "zoom-in" ? "ZOOM_IN" : action === "zoom-out" ? "ZOOM_OUT" : null;
    if (!zoom) return null;
    return {
      executionMode: "sequential",
      requests: [
        buildOnvifPtzRequest({
          camera,
          moveMode: "ContinuousMove",
          zoom,
          speed: ptz.speed,
          continuousDuration: ptz.continuous_duration
        })
      ],
      readout: `[ptz:${action}]`
    };
  }
  return {
    executionMode: "sequential",
    requests: [
      buildHomeAssistantPtzRequest({
        camera,
        action: singleAction.action,
        argument: singleAction.argument
      })
    ],
    readout: `[ptz:${action}]`
  };
};

// src/config/yaml-mapper.js
const normalizePositiveInteger2 = (value, fallback) => {
  const parsed = parseInt(String(value ?? "").trim(), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};
const normalizeHexColor = (value) => {
  const s = String(value || "").trim().toLowerCase();
  if (/^#[0-9a-f]{6}$/.test(s)) return s;
  if (/^#[0-9a-f]{3}$/.test(s)) {
    return `#${s[1]}${s[1]}${s[2]}${s[2]}${s[3]}${s[3]}`;
  }
  return "";
};
const normalizeCameraConnectionType = (value) => {
  const type = String(value ?? "").trim().toLowerCase();
  if (type === "ha_direct" || type === "ha" || type === "home_assistant") {
    return "ha_direct";
  }
  return DEFAULT_CAMERA_CONNECTION_TYPE;
};
const normalizeAlertsAreaContent = (value) => {
  const mode = String(value ?? "").trim().toLowerCase();
  return mode === "all_reviews" ? "all_reviews" : "alerts_only";
};
const normalizeDisableHlsDesktop = (value) => value === true;
const normalizeCameraConfig = (camera, { fallbackName = null } = {}) => {
  if (typeof camera === "string") {
    return {
      entity: camera,
      name: fallbackName,
      connection_type: DEFAULT_CAMERA_CONNECTION_TYPE,
      alerts_content: "alerts_only",
      disable_hls_desktop: false,
      ptz: null
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
      ),
      ptz: normalizeCameraPtzConfig(camera.ptz),
      ...camera.two_way_talk === true ? { two_way_talk: true } : {}
    };
  }
  return {
    entity: null,
    name: fallbackName,
    connection_type: DEFAULT_CAMERA_CONNECTION_TYPE,
    alerts_content: "alerts_only",
    disable_hls_desktop: false,
    ptz: null
  };
};
const addStringIfPresent = (target, key, value) => {
  const trimmed = String(value || "").trim();
  if (trimmed) target[key] = trimmed;
};
const addIfNotDefault = (target, key, value, defaultValue) => {
  if (value !== defaultValue) target[key] = value;
};
const cloneObjectIfPresent = (value) => {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const keys = Object.keys(value);
  if (!keys.length) return null;
  try {
    return JSON.parse(JSON.stringify(value));
  } catch (_) {
    return { ...value };
  }
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
  if (normalized.ptz) {
    compact.ptz = { ...normalized.ptz };
  }
  if (normalized.two_way_talk === true) {
    compact.two_way_talk = true;
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
  const windowDays = normalizePositiveInteger2(source.window_days, 3);
  addIfNotDefault(compact, "window_days", windowDays, 3);
  const alertsReviewsDays = normalizePositiveInteger2(
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
  const snapshotUpdateSeconds = normalizeBoundedPositiveInteger(
    source.snapshot_update_seconds,
    SNAPSHOT_UPDATE_SECONDS,
    10,
    240
  );
  addIfNotDefault(
    compact,
    "snapshot_update_seconds",
    snapshotUpdateSeconds,
    SNAPSHOT_UPDATE_SECONDS
  );
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
  const slideshowAlertHoldSeconds = normalizeBoundedPositiveInteger(
    source.slideshow_alert_hold_seconds,
    Math.round(SLIDESHOW_ALERT_HOLD_MS / 1e3),
    5,
    60
  );
  addIfNotDefault(
    compact,
    "slideshow_alert_hold_seconds",
    slideshowAlertHoldSeconds,
    Math.round(SLIDESHOW_ALERT_HOLD_MS / 1e3)
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
    "mobile_view_page_enabled",
    source.mobile_view_page_enabled === true,
    false
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
  const gridAlertHoldSeconds = normalizeBoundedPositiveInteger(
    source.grid_alert_hold_seconds,
    Math.round(GRID_ALERT_HOLD_MS / 1e3),
    5,
    60
  );
  addIfNotDefault(
    compact,
    "grid_alert_hold_seconds",
    gridAlertHoldSeconds,
    Math.round(GRID_ALERT_HOLD_MS / 1e3)
  );
  const previewAlertLiveDurationSeconds = normalizeBoundedPositiveInteger(
    source.preview_page_alert_live_duration_seconds,
    10,
    5,
    60
  );
  addIfNotDefault(
    compact,
    "preview_page_alert_live_duration_seconds",
    previewAlertLiveDurationSeconds,
    10
  );
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
  const videoDefaults = cloneObjectIfPresent(source.video_defaults);
  if (videoDefaults) compact.video_defaults = videoDefaults;
  const videoLiveDefaults = cloneObjectIfPresent(source.video_live_defaults);
  if (videoLiveDefaults) compact.video_live_defaults = videoLiveDefaults;
  const videoPopupDefaults = cloneObjectIfPresent(source.video_popup_defaults);
  if (videoPopupDefaults) compact.video_popup_defaults = videoPopupDefaults;
  const videoRecordingDefaults = cloneObjectIfPresent(
    source.video_recording_defaults
  );
  if (videoRecordingDefaults) {
    compact.video_recording_defaults = videoRecordingDefaults;
  }
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
function normalizePositiveInteger3(value, fallback) {
  const parsed = parseInt(String(value ?? "").trim(), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}
function normalizeBoundedPositiveInteger(value, fallback, min, max) {
  const parsed = normalizePositiveInteger3(value, fallback);
  const lower = Math.max(1, Number(min) || 1);
  const upper = Math.max(lower, Number(max) || lower);
  return Math.min(upper, Math.max(lower, parsed));
}
function normalizeCameraConnectionType2(value) {
  const type = String(value ?? "").trim().toLowerCase();
  if (type === "ha_direct" || type === "ha" || type === "home_assistant") {
    return "ha_direct";
  }
  return DEFAULT_CAMERA_CONNECTION_TYPE;
}
function normalizeAlertsAreaContent2(value) {
  const mode = String(value ?? "").trim().toLowerCase();
  return mode === "all_reviews" ? "all_reviews" : "alerts_only";
}
function normalizeDisableHlsDesktop2(value) {
  return value === true;
}
function normalizeHexColor2(value) {
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
const resolveSwitchChecked = (element) => {
  if (!element) return false;
  if (typeof element.checked === "boolean") return element.checked;
  if (element.getAttribute?.("aria-checked") === "true") return true;
  if (element.getAttribute?.("aria-checked") === "false") return false;
  const shadowInput = element.shadowRoot?.querySelector?.("input");
  if (typeof shadowInput?.checked === "boolean") return shadowInput.checked;
  return false;
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
      const colorValue = normalizeHexColor2(event.currentTarget?.value);
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
        const draftHex = normalizeHexColor2(themeDraftCache?.[colorKey]);
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
  themeDraftCache,
  hiddenTabsOverride
}) => {
  const readTrimmed = (id) => root.querySelector(`#${id}`)?.value?.trim() || "";
  const nextConfig = { ...baseConfig, cameras };
  delete nextConfig.camera_entity;
  const title = readTrimmed("title");
  const subtitle = readTrimmed("subtitle");
  if (title) nextConfig.title = title;
  else delete nextConfig.title;
  if (subtitle) nextConfig.subtitle = subtitle;
  else delete nextConfig.subtitle;
  nextConfig.window_days = normalizePositiveInteger3(
    root.querySelector("#window_days")?.dataset.value || root.querySelector("#window_days")?.value || "3",
    3
  );
  nextConfig.alerts_reviews_days = normalizePositiveInteger3(
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
  nextConfig.snapshot_update_seconds = normalizeBoundedPositiveInteger(
    root.querySelector("#snapshot_update_seconds")?.dataset.value || root.querySelector("#snapshot_update_seconds")?.value || String(SNAPSHOT_UPDATE_SECONDS),
    SNAPSHOT_UPDATE_SECONDS,
    10,
    240
  );
  nextConfig.mobile_poll_battery_saver = resolveSwitchChecked(
    root.querySelector("#mobile_poll_battery_saver")
  );
  nextConfig.slideshow_rotation_enabled = resolveSwitchChecked(
    root.querySelector("#slideshow_rotation_enabled")
  );
  nextConfig.slideshow_rotation_seconds = SLIDESHOW_ROTATION_OPTIONS_SECONDS.includes(
    Number(
      root.querySelector("#slideshow_rotation_seconds")?.dataset.value || root.querySelector("#slideshow_rotation_seconds")?.value || "30"
    )
  ) ? Number(
    root.querySelector("#slideshow_rotation_seconds")?.dataset.value || root.querySelector("#slideshow_rotation_seconds")?.value || "30"
  ) : 30;
  nextConfig.slideshow_alert_hold_seconds = normalizeBoundedPositiveInteger(
    root.querySelector("#slideshow_alert_hold_seconds")?.dataset.value || root.querySelector("#slideshow_alert_hold_seconds")?.value || String(Math.round(SLIDESHOW_ALERT_HOLD_MS / 1e3)),
    Math.round(SLIDESHOW_ALERT_HOLD_MS / 1e3),
    5,
    60
  );
  nextConfig.grid_mode_enabled = resolveSwitchChecked(
    root.querySelector("#grid_mode_enabled")
  );
  nextConfig.grid_start_in_grid_enabled = resolveSwitchChecked(
    root.querySelector("#grid_start_in_grid_enabled")
  );
  nextConfig.grid_live_view_enabled = resolveSwitchChecked(root.querySelector("#grid_live_view_enabled")) !== false;
  nextConfig.grid_alert_hold_seconds = normalizeBoundedPositiveInteger(
    root.querySelector("#grid_alert_hold_seconds")?.dataset.value || root.querySelector("#grid_alert_hold_seconds")?.value || String(Math.round(GRID_ALERT_HOLD_MS / 1e3)),
    Math.round(GRID_ALERT_HOLD_MS / 1e3),
    5,
    60
  );
  nextConfig.mobile_view_page_enabled = resolveSwitchChecked(
    root.querySelector("#mobile_view_page_enabled")
  );
  nextConfig.preview_page_enabled = resolveSwitchChecked(
    root.querySelector("#preview_page_enabled")
  );
  nextConfig.preview_page_live_cameras = resolveSwitchChecked(
    root.querySelector("#preview_page_live_cameras")
  );
  nextConfig.preview_page_alert_live_duration_seconds = normalizeBoundedPositiveInteger(
    root.querySelector("#preview_page_alert_live_duration_seconds")?.dataset.value || root.querySelector("#preview_page_alert_live_duration_seconds")?.value || "10",
    10,
    5,
    60
  );
  nextConfig.preview_page_show_title_bars = resolveSwitchChecked(
    root.querySelector("#preview_page_show_title_bars")
  ) !== false;
  nextConfig.wide_view_page_enabled = resolveSwitchChecked(
    root.querySelector("#wide_view_page_enabled")
  );
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
    const useDefault = resolveSwitchChecked(
      root.querySelector(`[data-theme-default="${key}"]`)
    );
    const inputValue = normalizeHexColor2(input.value);
    if (useDefault) themeCustomDefaults[key] = true;
    if (!useDefault && inputValue) themeDraftCache[key] = inputValue;
    const cached = normalizeHexColor2(themeDraftCache?.[key]);
    if (cached) themeCustom[key] = cached;
  });
  nextConfig.theme_custom = themeCustom;
  nextConfig.theme_custom_defaults = themeCustomDefaults;
  const hiddenTabs = Array.isArray(hiddenTabsOverride) ? hiddenTabsOverride.map((id) => id === "reviews" ? "alerts" : id).filter((id) => ALLOWED_HIDDEN_TABS.includes(id)) : [...root.querySelectorAll("[data-active-tab]")].filter((element) => !resolveSwitchChecked(element)).map((element) => element.dataset.activeTab).filter((tabId) => ALLOWED_HIDDEN_TABS.includes(tabId));
  nextConfig.hidden_tabs = hiddenTabs.length ? hiddenTabs : [];
  const streamHeight = root.querySelector("#stream_height")?.value;
  const streamHeightUnit = root.querySelector("#stream_height_unit")?.dataset.value || root.querySelector("#stream_height_unit")?.value || "vh";
  nextConfig.stream_height = streamHeight ? Number(streamHeight) : null;
  nextConfig.stream_height_unit = streamHeightUnit;
  nextConfig.tight_margins = resolveSwitchChecked(
    root.querySelector("#tight_margins")
  );
  nextConfig.shadows = resolveSwitchChecked(root.querySelector("#shadows")) !== false;
  nextConfig.borders = resolveSwitchChecked(root.querySelector("#borders")) !== false;
  nextConfig.rounded_corners = resolveSwitchChecked(root.querySelector("#rounded_corners")) !== false;
  nextConfig.outer_shadows = resolveSwitchChecked(root.querySelector("#outer_shadows")) !== false;
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
const compactEditorConfigForYaml2 = (config, options = {}) => compactEditorConfigForYaml(config, options);
const withCardTypeForYaml2 = (config, options = {}) => withCardTypeForYaml(config, options);
const createEditorPreviewDraft2 = (config) => createEditorPreviewDraft(config);
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
    reviewsWindowKey: "",
    kept: [],
    ptzInfo: null,
    ptzInfoFetched: false,
    ptzInfoPromise: null,
    discovered: false
  };
}
function camDisplayName(c) {
  return c.name || (c.entity || "").replace(/^camera\./, "").replace(/_/g, " ");
}
function normalizeCameraConfig2(camera, { fallbackName = null } = {}) {
  if (typeof camera === "string") {
    return {
      entity: camera,
      name: fallbackName,
      connection_type: DEFAULT_CAMERA_CONNECTION_TYPE,
      alerts_content: "alerts_only",
      disable_hls_desktop: false,
      ptz: null
    };
  }
  if (camera && typeof camera === "object") {
    return {
      entity: camera.entity || camera.camera_entity || null,
      name: camera.name || fallbackName,
      connection_type: normalizeCameraConnectionType2(camera.connection_type),
      alerts_content: normalizeAlertsAreaContent2(camera.alerts_content),
      disable_hls_desktop: normalizeDisableHlsDesktop2(
        camera.disable_hls_desktop
      ),
      ptz: normalizeCameraPtzConfig(camera.ptz),
      ...camera.two_way_talk === true ? { two_way_talk: true } : {}
    };
  }
  return {
    entity: null,
    name: fallbackName,
    connection_type: DEFAULT_CAMERA_CONNECTION_TYPE,
    alerts_content: "alerts_only",
    disable_hls_desktop: false,
    ptz: null
  };
}
const configuredCameraEntities = (config) => (config?.cameras || []).map(({ entity }) => entity).filter(Boolean);
const hassThemeSignature = (hass) => {
  const { darkMode = false, theme = "" } = hass?.themes || {};
  return `${darkMode === true ? "dark" : "light"}:${theme || hass?.selectedTheme || ""}`;
};
const hassEntityStateSignature = (hass, entities) => entities.map((entity) => `${entity}:${hass?.states?.[entity]?.state ?? "missing"}`).join("|");

// src/features/mobile-view/utils.js
const MOBILE_VIEW_ACTIVE_CLASS = "mobile-view-active";
const MOBILE_VIEW_ROTATE_COVER_CLASS = "mobile-view-rotate-cover";
function isMobileViewRoute(pageId, pageIds) {
  return pageId === pageIds.mobileView;
}

// src/features/mobile-view/page.tmpl.js
function buildMobileCameraOptionMarkup({
  camera,
  index,
  activeCamIdx,
  includeStatus,
  getCameraName,
  isCameraAvailable
}) {
  const name = getCameraName(camera);
  const active = index === activeCamIdx;
  const ok = !includeStatus || isCameraAvailable(camera);
  return `<button
            class="mobile-cam-picker__option${active ? " is-active" : ""}"
            type="button"
            role="option"
            aria-selected="${active ? "true" : "false"}"
            data-mobile-camidx="${index}"
          >
            <span class="mobile-cam-picker__option-content">
              <span class="cam-dot" style="color:${ok ? "#4ade80" : "#ef4444"}">\u25CF</span>
              <span class="mobile-cam-picker__option-label">${name}</span>
            </span>
          </button>`;
}
function buildMobileCamSwitcherMarkup({
  previewPageEnabled,
  includeStatus,
  cameras,
  activeCamIdx,
  icons,
  getCameraName,
  isCameraAvailable,
  streamType = "--",
  online = true,
  pickerOpen = false
}) {
  const cameraList = Array.isArray(cameras) ? cameras : [];
  const safeActiveIdx = Number.isInteger(activeCamIdx) && activeCamIdx >= 0 && activeCamIdx < cameraList.length ? activeCamIdx : 0;
  const activeCamera = cameraList[safeActiveIdx] || cameraList[0] || null;
  const activeCameraName = activeCamera ? getCameraName(activeCamera) : "Camera";
  const backButton = previewPageEnabled ? `<button class="glass-btn cam-tab preview-back-btn mobile-cam-picker__back" type="button" data-preview-back title="Back to preview page" aria-label="Back to preview page">${icons.left}</button>` : "";
  const cameraOptions = cameraList.map(
    (camera, index) => buildMobileCameraOptionMarkup({
      camera,
      index,
      activeCamIdx: safeActiveIdx,
      includeStatus,
      getCameraName,
      isCameraAvailable
    })
  ).join("");
  return `${backButton}
    <div class="mobile-cam-picker${pickerOpen ? " is-open" : ""}" data-mobile-cam-picker>
      <button
        class="glass-btn mobile-cam-picker__trigger"
        type="button"
        aria-haspopup="listbox"
        aria-expanded="${pickerOpen ? "true" : "false"}"
        data-mobile-cam-trigger
      >
        <span class="mobile-cam-picker__trigger-content">
          <span class="mobile-cam-picker__trigger-dot" aria-hidden="true">\u25CF</span>
          <span class="mobile-cam-picker__label">${activeCameraName}</span>
        </span>
        <span class="mobile-cam-picker__chev" aria-hidden="true">${icons.chevron || "v"}</span>
      </button>
      <div class="mobile-cam-picker__panel" role="listbox" ${pickerOpen ? "" : "hidden"} data-mobile-cam-panel>
        ${cameraOptions}
      </div>
    </div>
    <div class="mobile-cam-picker__status" aria-label="Live status">
      <div class="mobile-cam-picker__stream">
        <div class="sv stream-type" id="stream-type">${resolveMobileViewStreamTypeText(streamType)}</div>
        <div class="sl">Stream</div>
      </div>
      <div class="sv mobile-cam-picker__dot" id="on-dot" style="color:${resolveMobileViewStatusColor(online)}">\u25CF</div>
    </div>`;
}
function buildMobileViewInfoRowMarkup({
  title,
  subtitle,
  version,
  eventsCount = "\u2014"
}) {
  return `<div class="info-row mobile-view-info-row" data-fvc-region="information">
              <div>
                <div class="info-title" id="info-title">${title}</div>
                <span class="section-label" id="tl-range">${subtitle}</span>
              </div>
              <div class="stats">
                <div class="stat">
                  <div class="sv">v${version}</div>
                  <div class="sl">Version</div>
                </div>
                <div class="stat">
                  <div class="sv" id="ev-count">${resolveMobileViewEventsCountText(eventsCount)}</div>
                  <div class="sl">Events</div>
                </div>
              </div>
            </div>`;
}
function buildMobileViewMainLayoutShellMarkup({
  regions: suppliedRegions = null,
  layoutProfile = {}
} = {}) {
  const normalizedRegions = suppliedRegions && typeof suppliedRegions === "object" && !Array.isArray(suppliedRegions) ? suppliedRegions : {};
  const regions = {
    live: "",
    liveFullscreen: "",
    liveMute: "",
    information: "",
    cameraSwitcher: "",
    pageNavigation: "",
    tabs: "",
    tools: "",
    twoWayTalk: "",
    browseHeader: "",
    browse: "",
    footer: "",
    ...normalizedRegions
  };
  const layoutClassName = ["layout", layoutProfile.layoutClass, "mobile-layout"].filter(Boolean).join(" ");
  const tabsHolderClassName = ["tabs-holder", layoutProfile.tabsHolderClass].filter(Boolean).join(" ");
  const liveControlsInline = layoutProfile.liveControlsPlacement === "inline";
  const liveStageClassName = [
    "live-stage",
    liveControlsInline ? "live-stage--inline" : "live-stage--overlay"
  ].join(" ");
  const overlayFullscreen = liveControlsInline ? "" : regions.liveFullscreen;
  const overlayMute = liveControlsInline ? "" : regions.liveMute;
  const inlineMute = liveControlsInline ? regions.liveMute : "";
  const inlineFullscreen = liveControlsInline ? regions.liveFullscreen : "";
  return `<div class="${layoutClassName}" id="layout">
            <div class="mobile-container" id="mobile-container">
              <div class="mobile-top" id="mobile-top">
                ${regions.cameraSwitcher}
                <div class="${liveStageClassName}" id="live-stage">
                  ${regions.live}
                  ${overlayFullscreen}
                  ${overlayMute}
                </div>
              </div>
              <div class="mobile-bottom" id="mobile-bottom">
                <div class="mobile-video-controls-container">
                    <div class="button-holder-row mobile-video-controls-left-row">
                      
                    </div>
                    <div class="button-holder-row mobile-microphone-row">
                      ${regions.twoWayTalk}
                    </div>
                    <div class="button-holder-row mobile-video-controls-right-row">
                      ${inlineMute}
                      ${inlineFullscreen}                      
                    </div>
                </div>              
                <div class="mobile-tab-container">
                    <div class="button-holder-row mobile-left-row">
                      ${regions.tabs}
                    </div>
                    <div class="button-holder-row mobile-tabs-row">
                      
                    </div>
                    <div class="button-holder-row mobile-tools-row">
                      ${regions.tools}
                    </div>
                </div>

                ${regions.browseHeader}
                ${regions.browse}
                ${regions.footer}
              </div>
            </div>
          </div>`;
}
function buildMobileViewCamSwitcherMarkup(args) {
  return buildMobileCamSwitcherMarkup(args);
}
function resolveMobileViewTitleText({
  title,
  cameras = [],
  activeCamera = null,
  getCameraName
}) {
  if (title) return title;
  if (Array.isArray(cameras) && cameras.length > 1 && activeCamera) {
    return getCameraName(activeCamera);
  }
  return "Camera";
}
function resolveMobileViewSubtitleText(config) {
  return config?.subtitle || "Frigate";
}
function resolveMobileViewStreamTypeText(streamType) {
  return streamType || "--";
}
function resolveMobileViewEventsCountText(eventsCount) {
  return String(eventsCount);
}
function resolveMobileViewStatusColor(online) {
  return online ? "#4ade80" : "#ef4444";
}
function resolveMobileViewOnlineLabel(online) {
  return online ? "Online" : "Offline";
}
function applyMobileViewPageMarkup({ host, pageIds }) {
  const card = host?._$("#card");
  if (!card) return;
  card.classList.toggle(
    MOBILE_VIEW_ACTIVE_CLASS,
    isMobileViewRoute(host._pageId, pageIds)
  );
}

// src/features/single-view/page.tmpl.js
function mergeClassNames(...tokens) {
  return [
    ...new Set(tokens.filter(Boolean).join(" ").split(/\s+/).filter(Boolean))
  ].join(" ");
}
function normalizeRegions(regions) {
  const suppliedRegions = regions && typeof regions === "object" && !Array.isArray(regions) ? regions : {};
  return {
    live: "",
    liveFullscreen: "",
    liveMute: "",
    information: "",
    cameraSwitcher: "",
    pageNavigation: "",
    tabs: "",
    tools: "",
    browseHeader: "",
    browse: "",
    footer: "",
    ...suppliedRegions
  };
}
function buildSingleViewCamSwitcherMarkup({
  includeStatus = true,
  cameras = [],
  activeCamIdx = 0,
  isSingleView = false,
  getCameraName,
  isCameraAvailable
} = {}) {
  return (Array.isArray(cameras) ? cameras : []).map((camera, index) => {
    const name = getCameraName(camera);
    const active = isSingleView && index === activeCamIdx;
    const available = !includeStatus || isCameraAvailable(camera);
    return `<button class="glass-btn cam-tab shadow-small ${active ? "active" : ""}" data-camidx="${index}"><span class="cam-dot" style="color:${available ? "#4ade80" : "#ef4444"}">\u25CF</span> ${name}</button>`;
  }).join("");
}
function resolveSingleViewTitleText({
  title,
  cameras = [],
  activeCamera = null,
  getCameraName
} = {}) {
  if (title) return title;
  if (Array.isArray(cameras) && cameras.length > 1) {
    return getCameraName(activeCamera);
  }
  return "Camera";
}
function resolveSingleViewSubtitleText(config) {
  return config?.subtitle || "Frigate";
}
function resolveSingleViewStreamTypeText(streamType) {
  return streamType || "--";
}
function resolveSingleViewEventsCountText(eventsCount) {
  return String(eventsCount);
}
function resolveSingleViewStatusColor(online) {
  return online ? "#4ade80" : "#ef4444";
}
function resolveSingleViewOnlineLabel(online) {
  return online ? "Online" : "Offline";
}
function buildSingleViewMainLayoutShellMarkup({
  regions: suppliedRegions = null,
  layoutProfile = {}
} = {}) {
  const regions = normalizeRegions(suppliedRegions);
  const layoutClassName = mergeClassNames("layout", layoutProfile.layoutClass);
  const leftColumnClassName = mergeClassNames(
    "col-left",
    layoutProfile.leftColumnClass
  );
  const rightColumnClassName = mergeClassNames(
    "col-right",
    layoutProfile.rightColumnClass
  );
  const tabsHolderClassName = mergeClassNames(
    "tabs-holder",
    layoutProfile.tabsHolderClass
  );
  const resizeHandleClassName = mergeClassNames(
    "resize-handle",
    layoutProfile.resizeHandleClass
  );
  return `<div class="${layoutClassName}" id="layout">
          <div class="${leftColumnClassName}" id="col-left">
            <div class="live-stage live-stage--overlay" id="live-stage">
              ${regions.live}
              ${regions.liveFullscreen}
              ${regions.liveMute}
            </div>

            ${regions.information}
            ${regions.cameraSwitcher}
          </div>
          <div class="${resizeHandleClassName}" id="resize-handle"></div>
          <div class="${rightColumnClassName}" id="col-right">
            <div class="${tabsHolderClassName} shadow-small">
              <div class="button-holder">
                <div class="button-holder-row tabs-row">
                  ${regions.tabs}
                </div>
                <div class="button-holder-row page-nav-row">
                  ${regions.pageNavigation}
                </div>
                <div class="button-holder-row tools-row">
                  ${regions.tools}
                </div>
              </div>
            </div>
            ${regions.browseHeader}
            ${regions.browse}
            ${regions.footer}
          </div>
        </div>`;
}

// src/features/wide-view/page.tmpl.js
function mergeClassNames2(...tokens) {
  return [
    ...new Set(tokens.filter(Boolean).join(" ").split(/\s+/).filter(Boolean))
  ].join(" ");
}
function normalizeRegions2(regions) {
  const suppliedRegions = regions && typeof regions === "object" && !Array.isArray(regions) ? regions : {};
  return {
    live: "",
    liveFullscreen: "",
    liveMute: "",
    information: "",
    cameraSwitcher: "",
    pageNavigation: "",
    tabs: "",
    tools: "",
    browseHeader: "",
    browse: "",
    footer: "",
    ...suppliedRegions
  };
}
function buildWideViewMainLayoutShellMarkup({
  regions: suppliedRegions = null,
  layoutProfile = {}
} = {}) {
  const regions = normalizeRegions2(suppliedRegions);
  const layoutClassName = mergeClassNames2("layout", layoutProfile.layoutClass);
  const leftColumnClassName = mergeClassNames2(
    "col-left",
    layoutProfile.leftColumnClass
  );
  const rightColumnClassName = mergeClassNames2(
    "col-right",
    layoutProfile.rightColumnClass
  );
  const tabsHolderClassName = mergeClassNames2(
    "tabs-holder",
    layoutProfile.tabsHolderClass
  );
  const resizeHandleClassName = mergeClassNames2(
    "resize-handle",
    layoutProfile.resizeHandleClass
  );
  return `<div class="${layoutClassName}" id="layout">
          <div class="${leftColumnClassName}" id="col-left">
            <div class="live-stage live-stage--overlay" id="live-stage">
              ${regions.live}
              ${regions.liveFullscreen}
              ${regions.liveMute}
            </div>

            ${regions.information}
            ${regions.cameraSwitcher}
          </div>
          <div class="${resizeHandleClassName}" id="resize-handle"></div>
          <div class="${rightColumnClassName}" id="col-right">
            <div class="${tabsHolderClassName} shadow-small">
              <div class="button-holder">
                <div class="button-holder-row tabs-row">
                  ${regions.tabs}
                </div>
                <div class="button-holder-row page-nav-row">
                  ${regions.pageNavigation}
                </div>
                <div class="button-holder-row tools-row">
                  ${regions.tools}
                </div>
              </div>
            </div>
            ${regions.browseHeader}
            ${regions.browse}
            ${regions.footer}
          </div>
        </div>`;
}

// src/features/preview/page.tmpl.js
function previewMediaSeverityClass(severity) {
  if (severity === "alert") return "grid-alert";
  if (severity === "detection") return "grid-detection";
  return "";
}
function buildPreviewStatusMarkup(online) {
  return `<span class="dot" style="color:${online ? "#4ade80" : "#ef4444"}">\u25CF</span>${online ? "Online" : "Offline"}`;
}
function buildPreviewMetaMarkup({
  showTitleBars,
  name,
  online,
  sourceLabel,
  eventsCount
}) {
  if (!showTitleBars) return "";
  return `<div class="preview-meta">
              <div class="preview-meta-name">${name}</div>
              <div class="preview-meta-status">${buildPreviewStatusMarkup(online)}</div>
              <div class="preview-meta-source">Stream Source: ${sourceLabel}</div>
              <div class="preview-meta-events">Events: ${eventsCount}</div>
            </div>`;
}
function buildPreviewCellMarkup({
  index,
  entity,
  severity,
  useLive,
  metaMarkup
}) {
  return `<div class="preview-cell shadow-medium" data-preview-camidx="${index}">
          <div class="preview-media-host ${previewMediaSeverityClass(severity)}" data-preview-media-entity="${entity}" data-preview-use-live="${useLive ? "1" : "0"}"></div>
          ${metaMarkup}
        </div>`;
}
function buildPreviewCameraButtonMarkup({ index, name }) {
  return `<button class="glass-btn preview-cam-btn" type="button" data-preview-select-camidx="${index}">${name}</button>`;
}
function buildPreviewShellMarkup({ cellsMarkup, buttonsMarkup }) {
  return `<div class="preview-grid" id="preview-grid">${cellsMarkup}</div>
      <div class="preview-cam-buttons">${buttonsMarkup}</div>`;
}
function buildPreviewShellHeaderMarkup({ title, subtitle, pageNav }) {
  return `<div class="preview-shell-header" id="preview-shell-header">
            <div class="preview-shell-title">
              <div class="preview-shell-title-main" id="preview-shell-title">${title}</div>
              <div class="preview-shell-title-sub" id="preview-shell-subtitle">${subtitle}</div>
            </div>
            ${pageNav}
          </div>`;
}
function buildPreviewLayoutShellMarkup({
  previewShellHeader,
  previewFooterIcon
}) {
  return `${previewShellHeader}
          <div class="preview-shell" id="preview-shell"></div>
          <div class="preview-shell-footer" id="preview-shell-footer">
            <div class="frigate-view">${previewFooterIcon}</div>
          </div>`;
}
function mergePreviewLayoutClassNames(...tokens) {
  return [
    ...new Set(tokens.filter(Boolean).join(" ").split(/\s+/).filter(Boolean))
  ].join(" ");
}
function normalizePreviewPageRegions(regions) {
  const suppliedRegions = regions && typeof regions === "object" && !Array.isArray(regions) ? regions : {};
  return {
    live: "",
    liveFullscreen: "",
    liveMute: "",
    information: "",
    cameraSwitcher: "",
    pageNavigation: "",
    tabs: "",
    tools: "",
    browseHeader: "",
    browse: "",
    footer: "",
    ...suppliedRegions
  };
}
function buildPreviewPageMainLayoutShellMarkup({
  regions: suppliedRegions = null,
  layoutProfile = {}
} = {}) {
  const regions = normalizePreviewPageRegions(suppliedRegions);
  const layoutClassName = mergePreviewLayoutClassNames(
    "layout",
    layoutProfile.layoutClass
  );
  const leftColumnClassName = mergePreviewLayoutClassNames(
    "col-left",
    layoutProfile.leftColumnClass
  );
  const rightColumnClassName = mergePreviewLayoutClassNames(
    "col-right",
    layoutProfile.rightColumnClass
  );
  const tabsHolderClassName = mergePreviewLayoutClassNames(
    "tabs-holder",
    layoutProfile.tabsHolderClass
  );
  const resizeHandleClassName = mergePreviewLayoutClassNames(
    "resize-handle",
    layoutProfile.resizeHandleClass
  );
  return `<div class="${layoutClassName}" id="layout">
          <div class="${leftColumnClassName}" id="col-left">
            <div class="live-stage live-stage--overlay" id="live-stage">
              ${regions.live}
              ${regions.liveFullscreen}
              ${regions.liveMute}
            </div>

            ${regions.information}
            ${regions.cameraSwitcher}
          </div>
          <div class="${resizeHandleClassName}" id="resize-handle"></div>
          <div class="${rightColumnClassName}" id="col-right">
            <div class="${tabsHolderClassName} shadow-small">
              <div class="button-holder">
                <div class="button-holder-row tabs-row">
                  ${regions.tabs}
                </div>
                <div class="button-holder-row page-nav-row">
                  ${regions.pageNavigation}
                </div>
                <div class="button-holder-row tools-row">
                  ${regions.tools}
                </div>
              </div>
            </div>
            ${regions.browseHeader}
            ${regions.browse}
            ${regions.footer}
          </div>
        </div>`;
}

// src/features/live/view.tmpl.js
function buildLiveEngineWrapMarkup({ icons }) {
  return `<div id="eng-wrap" data-fvc-region="live">
                <frigate-live-stream id="engine">
                  <div class="ph">${icons.live}<span>Connecting\u2026</span></div>
                </frigate-live-stream>
                  <div class="glass-btn slideshow-next-chip" id="slideshow-next-chip" hidden>Next Slide: 0s</div>
                  <div id="stream-fallback" hidden>
                    <img id="stream-fallback-img" alt="Camera snapshot">
                  </div>
                  <div class="stream-fallback-status" id="stream-fallback-status" hidden>Snapshot unavailable</div>
                  <div class="stream-loading" id="stream-loading" hidden>
                    <span class="dot"></span><span class="label">Loading\u2026</span>
                  </div>
              </div>`;
}
const resolveLiveControlButtonClass = (buttonClass) => String(buttonClass || "square-btn").trim() || "square-btn";
function buildLiveFullscreenControlMarkup({
  icons,
  buttonClass = "square-btn"
}) {
  const visualButtonClass = resolveLiveControlButtonClass(buttonClass);
  return `<button class="${visualButtonClass} live-fs-btn" id="live-fs-btn" data-fvc-region="live-fullscreen" title="Fullscreen live" aria-label="Fullscreen live">${icons.expand}</button>`;
}
function buildLiveMuteControlMarkup({
  icons,
  streamMuted,
  buttonClass = "square-btn"
}) {
  const label = streamMuted ? "Unmute live view" : "Mute live view";
  const icon = streamMuted ? icons.volOff : icons.volOn;
  const visualButtonClass = resolveLiveControlButtonClass(buttonClass);
  return `<button class="${visualButtonClass} mute-btn" id="mute-btn" data-fvc-region="live-mute" title="${label}" aria-label="${label}">${icon}</button>`;
}

// src/card/controls/shell-nav.tmpl.js
function buildPageNavButtonsMarkup({
  routes,
  activePageId,
  getRouteLabel,
  getRouteIcon
}) {
  return routes.map((pageId) => {
    const isActive = pageId === activePageId;
    const label = getRouteLabel(pageId);
    const icon = typeof getRouteIcon === "function" ? getRouteIcon(pageId) : "";
    return `<button class="page-nav-btn${isActive ? " active" : ""} tool icon-btn" type="button" data-page-route="${pageId}" aria-label="${label}" title="${label}" aria-pressed="${isActive ? "true" : "false"}">${icon || label}</button>`;
  }).join("");
}
function buildPageNavMarkup(options) {
  return `<div class="page-nav" data-fvc-region="page-navigation" aria-label="Page navigation">${buildPageNavButtonsMarkup(options)}</div>`;
}
function buildCamSwitcherRegionMarkup({ markup = "" } = {}) {
  const content = String(markup || "");
  if (!content) return "";
  return `<div class="cam-switcher" id="cam-switcher" data-fvc-region="camera-switcher">${content}</div>`;
}
function buildTabsRegionMarkup({ markup = "" } = {}) {
  return `<div class="tabs" data-fvc-region="tabs">${String(markup || "")}</div>`;
}
function buildToolsRegionMarkup({ markup = "" } = {}) {
  return `<div class="tl-tools-slot" data-fvc-region="tools">${String(markup || "")}</div>`;
}
function resolveSubtitleText(config) {
  return config?.subtitle || "Frigate";
}
function buildTabsMarkup({
  tab,
  hiddenTabs,
  viewMode,
  icons,
  buttonClass = "circle-btn"
}) {
  const ht = new Set(hiddenTabs || []);
  const gridModeListOnly = viewMode === "grid";
  const tabOrder = gridModeListOnly ? ["alerts", "kept", "controls"] : ["alerts", "clips", "snapshot", "recordings", "kept", "controls"];
  const activeTab = resolveActiveTab(tab, ht, tabOrder);
  const tabButtonClass = String(buttonClass || "circle-btn").trim() || "circle-btn";
  const tabMarkup = (id, icon, label) => ht.has(id) || gridModeListOnly && ["clips", "snapshot", "recordings"].includes(id) ? "" : id === activeTab ? `<div class="${tabButtonClass} active" data-tab="${id}" title="${label}">${icon}</div>` : `<div class="${tabButtonClass}" data-tab="${id}" title="${label}">${icon}</div>`;
  const markup = `${tabMarkup("alerts", icons.alerts, "Alerts")}
      ${tabMarkup("clips", icons.clips, "Clips")}
      ${tabMarkup("snapshot", icons.snapshot, "Snapshots")}
      ${tabMarkup("recordings", icons.recordings, "Recordings")}
      ${tabMarkup("kept", icons.star, "Kept events")}`;
  return { activeTab, markup };
}
function buildToolsMarkup({
  tab,
  viewMode,
  icons,
  buttonClass = "tool",
  isFilterPanelOpen,
  isCalendarPanelOpen,
  isGridModeAvailable,
  isSlideshowRotationAvailable,
  isSlideshowActive,
  isControlsVisible,
  controlsDisabled,
  gridDisabled,
  slideshowDisabled,
  filterDisabled,
  calendarDisabled,
  gridButtonIcon,
  slideshowButtonIcon
}) {
  const toolButtonClass = String(buttonClass || "tool").trim() || "tool";
  const resolvedFilterDisabled = filterDisabled || tab === "recordings";
  const controlsHidden = isControlsVisible === false;
  const gridHidden = !isGridModeAvailable;
  const gridActive = viewMode === "grid";
  const gridButton = gridHidden ? "" : `<button class="${toolButtonClass}${gridActive ? " active" : ""}" id="grid-btn" aria-pressed="${gridActive ? "true" : "false"}" title="${gridActive ? "Stop grid mode" : "Start grid mode"}" aria-label="${gridActive ? "Stop grid mode" : "Start grid mode"}" ${gridDisabled ? "disabled" : ""}>${gridButtonIcon}</button>`;
  const slideshowHidden = !isSlideshowRotationAvailable;
  const slideshowActive = isSlideshowActive;
  const slideshowButton = slideshowHidden ? "" : `<button class="${toolButtonClass} slideshow-btn${slideshowActive ? " active" : ""}" id="slideshow-btn" aria-pressed="${slideshowActive ? "true" : "false"}" title="${slideshowActive ? "Stop slideshow rotation" : "Start slideshow rotation"}" aria-label="${slideshowActive ? "Stop slideshow rotation" : "Start slideshow rotation"}" ${slideshowDisabled ? "disabled" : ""}>${slideshowButtonIcon}</button><div class="divider">${icons.divider}</div>`;
  const markup = `<div class="tl-tools">
        ${controlsHidden ? "" : `<button class="${toolButtonClass}${tab === "controls" ? " active" : ""}" id="controls-btn" title="Controls" aria-label="Controls" aria-pressed="${tab === "controls" ? "true" : "false"}" ${controlsDisabled ? "disabled" : ""}>${icons.bullseye}</button><div class="divider">${icons.divider}</div>`}
        ${gridButton}
        ${slideshowButton}
        <button class="${toolButtonClass}${isFilterPanelOpen ? " active" : ""}" id="filter-btn" title="Filter" aria-pressed="${isFilterPanelOpen ? "true" : "false"}" ${resolvedFilterDisabled ? "disabled" : ""}>${icons.filter}</button>
        <div class="filter-panel" id="filter-panel" data-fvc-region="filter-panel" style="display:none"></div>
        <button class="${toolButtonClass}${isCalendarPanelOpen ? " active" : ""}" id="cal-btn" title="Calendar" aria-pressed="${isCalendarPanelOpen ? "true" : "false"}" ${calendarDisabled ? "disabled" : ""}>${icons.calendar}</button>
        <div class="cal-panel" id="cal-panel" data-fvc-region="calendar-panel" style="display:none"></div>
      </div>`;
  return markup;
}
function buildCamSwitcherMarkup({
  previewPageEnabled,
  includeStatus,
  cameras,
  activeCamIdx,
  isSingleView,
  icons,
  getCameraName,
  isCameraAvailable
}) {
  const backButton = previewPageEnabled ? `<button class="glass-btn cam-tab preview-back-btn" type="button" data-preview-back title="Back to preview page" aria-label="Back to preview page">${icons.left} Back</button>` : "";
  const cameraButtons = (cameras || []).map((camera, index) => {
    const name = getCameraName(camera);
    const active = isSingleView && index === activeCamIdx;
    const ok = !includeStatus || isCameraAvailable(camera);
    return `<button class="glass-btn cam-tab shadow-small ${active ? "active" : ""}" data-camidx="${index}"><span class="cam-dot" style="color:${ok ? "#4ade80" : "#ef4444"}">\u25CF</span> ${name}</button>`;
  }).join("");
  return `${backButton}${cameraButtons}`;
}
function buildInfoRowMarkup({
  title,
  subtitle,
  version,
  pageNav = "",
  centerActionMarkup = ""
}) {
  return `<div class="info-row" data-fvc-region="information">
              <div class="info-left">
                <div class="info-title" id="info-title">${title}</div>
                <span class="section-label" id="tl-range">${subtitle}</span>
              </div>
              ${pageNav ? `<div class="info-row-page-nav">${pageNav}</div>` : ""}
              ${centerActionMarkup ? `<div class="info-row-action-slot" data-fvc-region="two-way-talk">${centerActionMarkup}</div>` : ""}
              <div class="stats">
                <div class="stat">
                  <div class="sv">v${version}</div>
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
            </div>`;
}
function mergeClassNames3(...tokens) {
  return [
    ...new Set(tokens.filter(Boolean).join(" ").split(/\s+/).filter(Boolean))
  ].join(" ");
}
function buildBrowseHeaderRegionMarkup({ icons }) {
  return `<div class="browse-head" id="browse-head" data-fvc-region="browse-header" style="display:none">
              <div class="browse-head-left">
                <button class="prev-next" id="rec-day-prev" data-rec-day-nav="-1" title="Previous day" aria-label="Previous day" style="display:none">${icons.left}Previous</button>
              </div>
              <div class="browse-head-middle" id="browse-head-label"></div>
              <div class="browse-head-right">
                <button class="prev-next" id="rec-day-next" data-rec-day-nav="1" title="Next day" aria-label="Next day" style="display:none">Next${icons.right}</button>
              </div>
            </div>`;
}
function buildBrowseRegionMarkup({ layoutProfile = {} } = {}) {
  const browseClassName = mergeClassNames3("browse", layoutProfile.browseClass);
  return `<div class="${browseClassName}" id="browse" data-fvc-region="browse" style="display:none">
              <div class="list-head">
                <span class="newtoast" id="newtoast" style="display:none">new \u2726</span>
              </div>
              <div class="list" id="list">
                <div class="empty">Loading\u2026</div>
              </div>
            </div>`;
}
function buildFooterMarkup({ icons }) {
  return `<div class="footer" data-fvc-region="footer">
              <div><div class="frigate-view">${icons.frigateView}</div></div>
              <div class="more" id="older-hint" hidden>scroll for older\u2026</div>
              <div></div>
            </div>`;
}
function buildControlsSectionMarkup({
  cameraName: cameraName4 = "Active Camera",
  ptzReady = false,
  panTiltEnabled = false,
  zoomEnabled = false,
  focusEnabled = false
} = {}) {
  const padDisabledActions = [
    ...panTiltEnabled ? [] : ["up", "right", "down", "left"],
    ...zoomEnabled ? [] : ["zoom-in", "zoom-out"]
  ].join(" ");
  const buildPtzButton = (action, label, enabled) => `<button
                class="controls-action-btn"
                type="button"
                data-ptz-control="${action}"
                aria-label="${label}"
                ${enabled ? "" : "disabled"}
              >${label}</button>`;
  return `<div class="controls-pad-wrap${panTiltEnabled || zoomEnabled ? "" : " is-disabled"}">
            <circle-pad-control-2 id="controls-pad"${padDisabledActions ? ` disabled-actions="${padDisabledActions}"` : ""}></circle-pad-control-2>
          </div>
          <div class="controls-readout">
            <div class="controls-readout-head">
              <span class="controls-readout-label">Readout</span>
              <button class="controls-readout-clear" id="controls-readout-clear" type="button">Clear</button>
            </div>
            <div class="controls-readout-lines" id="controls-readout-lines"></div>
          </div>
          `;
}
function buildControlsReadoutEmptyMarkup(message = "Use the circle pad to move the active camera.") {
  return `<div class="controls-readout-empty">${message}</div>`;
}
function buildControlsReadoutLinesMarkup(lines) {
  return (lines || []).map((line) => `<div class="controls-readout-line">${line}</div>`).join("");
}
function buildPopupShellMarkup({ icons, version }) {
  return `<div id="myPopup" class="popup-content">
            <div class="popup-close-row">
              <button class="close-btn" aria-label="Close">&times;</button> 
            </div>
            <div class="popup-header"></div>          
            <div class="popup-body">
              <div class="viewer" id="viewer" style="display:none"></div>
              <div class="popup-media-controls" id="popup-media-controls" hidden><span class="popup-media-controls-spacer" aria-hidden="true"></span><button class="popup-media-btn" id="popup-media-play" type="button" title="Play/Pause" aria-label="Play/Pause">${icons.play}</button><input class="popup-media-progress" id="popup-media-progress" type="range" min="0" max="1000" value="0" step="1" aria-label="Media progress"><span class="popup-media-time" id="popup-media-time">0:00/0:00</span><button class="popup-media-btn" id="popup-media-mute" type="button" title="Mute" aria-label="Mute">${icons.volOn}</button><button class="popup-media-btn" id="popup-media-fs" type="button" title="Fullscreen" aria-label="Fullscreen">${icons.expand}</button><button class="popup-media-btn" id="popup-media-airplay" type="button" title="AirPlay video" aria-label="AirPlay video" hidden>${icons.airplayVideo}</button><span class="popup-media-controls-spacer" aria-hidden="true"></span>
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
                  <button class="popup-carousel-nav left" id="popup-carousel-left" data-carousel-dir="-1" aria-label="Previous items">${icons.left}
                  </button>
                  <div class="popup-carousel" id="popup-carousel"></div>
                  <button class="popup-carousel-nav right" id="popup-carousel-right" data-carousel-dir="1" aria-label="Next items">${icons.right}
                  </button>
                </div>
                <h1 class="popup-shell-ver" id="popup-shell-ver">v${version}</h1>
            </div>
          </div>`;
}

// src/features/navigation/page-shell-registry.js
const PAGE_SHELL_REGIONS = Object.freeze({
  live: "live",
  liveFullscreen: "live-fullscreen",
  liveMute: "live-mute",
  information: "information",
  cameraSwitcher: "camera-switcher",
  tabs: "tabs",
  tools: "tools",
  pageNavigation: "page-navigation",
  browseHeader: "browse-header",
  browse: "browse",
  footer: "footer",
  twoWayTalk: "two-way-talk",
  filterPanel: "filter-panel",
  calendarPanel: "calendar-panel"
});
function normalizeProfile(profile = {}) {
  if (!profile || typeof profile !== "object") return {};
  const infoRowBuilder = typeof profile.buildInfoRowMarkup === "function" ? profile.buildInfoRowMarkup : null;
  const mainLayoutShellBuilder = typeof profile.buildMainLayoutShellMarkup === "function" ? profile.buildMainLayoutShellMarkup : null;
  const capabilities = profile.capabilities && typeof profile.capabilities === "object" ? profile.capabilities : {};
  return {
    layoutClass: String(profile.layoutClass || "").trim(),
    leftColumnClass: String(profile.leftColumnClass || "").trim(),
    rightColumnClass: String(profile.rightColumnClass || "").trim(),
    tabsHolderClass: String(profile.tabsHolderClass || "").trim(),
    tabsButtonClass: String(profile.tabsButtonClass || "").trim(),
    toolsButtonClass: String(profile.toolsButtonClass || "").trim(),
    liveFullscreenButtonClass: String(
      profile.liveFullscreenButtonClass || ""
    ).trim(),
    liveMuteButtonClass: String(profile.liveMuteButtonClass || "").trim(),
    liveControlsPlacement: profile.liveControlsPlacement === "inline" ? "inline" : "overlay",
    browseClass: String(profile.browseClass || "").trim(),
    resizeHandleClass: String(profile.resizeHandleClass || "").trim(),
    capabilities: {
      hasLive: capabilities.hasLive !== false,
      hasBrowse: capabilities.hasBrowse !== false,
      tabsVariant: capabilities.tabsVariant === "none" || capabilities.tabsVariant === "new-tabs" ? capabilities.tabsVariant : "standard"
    },
    buildInfoRowMarkup: infoRowBuilder,
    buildMainLayoutShellMarkup: mainLayoutShellBuilder
  };
}
function resolvePageCapabilities(profile = {}) {
  const caps = profile && profile.capabilities && typeof profile.capabilities === "object" ? profile.capabilities : {};
  return {
    hasLive: caps.hasLive !== false,
    hasBrowse: caps.hasBrowse !== false,
    tabsVariant: caps.tabsVariant === "none" || caps.tabsVariant === "new-tabs" ? caps.tabsVariant : "standard"
  };
}
function resolveRequiredPageShellRegions(profile = {}) {
  const capabilities = resolvePageCapabilities(profile);
  const requiredRegions = [];
  if (capabilities.hasLive) {
    requiredRegions.push(
      PAGE_SHELL_REGIONS.live,
      PAGE_SHELL_REGIONS.liveFullscreen,
      PAGE_SHELL_REGIONS.liveMute
    );
  }
  if (capabilities.hasBrowse) {
    requiredRegions.push(
      PAGE_SHELL_REGIONS.browseHeader,
      PAGE_SHELL_REGIONS.browse
    );
  }
  if (capabilities.tabsVariant !== "none") {
    requiredRegions.push(PAGE_SHELL_REGIONS.tabs, PAGE_SHELL_REGIONS.tools);
  }
  return requiredRegions;
}
function validatePageShellRegionMarkup(markup, { requiredRegions = [] } = {}) {
  const counts = {};
  const regionPattern = /\bdata-fvc-region\s*=\s*(?:"([^"]+)"|'([^']+)')/g;
  for (const match of String(markup || "").matchAll(regionPattern)) {
    const regionName = String(match[1] || match[2] || "").trim();
    if (!regionName) continue;
    counts[regionName] = (counts[regionName] || 0) + 1;
  }
  const required = [
    ...new Set(
      (Array.isArray(requiredRegions) ? requiredRegions : []).map((regionName) => String(regionName || "").trim()).filter(Boolean)
    )
  ];
  const missing = required.filter((regionName) => !counts[regionName]);
  const duplicates = Object.entries(counts).filter(([, count]) => count > 1).map(([regionName]) => regionName);
  return {
    valid: missing.length === 0 && duplicates.length === 0,
    counts,
    missing,
    duplicates
  };
}
function resolvePageInfoRowMarkup(profile, { title, subtitle, version, host, buildDefaultInfoRowMarkup } = {}) {
  const fallback = () => {
    if (typeof buildDefaultInfoRowMarkup !== "function") return "";
    return buildDefaultInfoRowMarkup({ title, subtitle, version });
  };
  const builder = profile && typeof profile.buildInfoRowMarkup === "function" ? profile.buildInfoRowMarkup : null;
  if (!builder) return fallback();
  return builder({
    title,
    subtitle,
    version,
    host
  }) || fallback();
}
function resolvePageMainLayoutShellMarkup(profile, {
  host,
  regions,
  layoutProfile,
  buildDefaultMainLayoutShellMarkup
} = {}) {
  const fallback = () => {
    if (typeof buildDefaultMainLayoutShellMarkup !== "function") return "";
    return buildDefaultMainLayoutShellMarkup({
      regions,
      layoutProfile
    });
  };
  const builder = profile && typeof profile.buildMainLayoutShellMarkup === "function" ? profile.buildMainLayoutShellMarkup : null;
  if (!builder) return fallback();
  return builder({
    host,
    regions,
    layoutProfile
  }) || fallback();
}
function createPageShellRegistry({ defaultPageId = "" } = {}) {
  const profiles = new Map();
  const register = (pageId, profile = {}) => {
    const key = String(pageId || "").trim();
    if (!key) return;
    profiles.set(key, normalizeProfile(profile));
  };
  const resolve = (pageId) => {
    const key = String(pageId || "").trim();
    if (key && profiles.has(key)) return profiles.get(key);
    if (defaultPageId && profiles.has(defaultPageId)) {
      return profiles.get(defaultPageId);
    }
    return {};
  };
  return {
    register,
    resolve
  };
}
function registerDefaultPageShellProfiles(registry, PAGE_IDS2) {
  if (!registry || !PAGE_IDS2) return;
  registry.register(PAGE_IDS2.singleView, {
    layoutClass: "layout--single-view",
    leftColumnClass: "col-left--single-view",
    rightColumnClass: "col-right--single-view",
    buildInfoRowMarkup: ({ title, subtitle, version, host }) => buildInfoRowMarkup({
      title,
      subtitle,
      version,
      centerActionMarkup: host?._buildTwoWayTalkInfoButtonMarkup?.() || ""
    }),
    buildMainLayoutShellMarkup: ({ regions, layoutProfile }) => buildSingleViewMainLayoutShellMarkup({
      regions,
      layoutProfile
    }),
    capabilities: {
      hasLive: true,
      hasBrowse: true,
      tabsVariant: "standard"
    }
  });
  registry.register(PAGE_IDS2.mobileView, {
    layoutClass: "layout--mobile-view",
    leftColumnClass: "col-left--mobile-view",
    rightColumnClass: "col-right--mobile-view",
    tabsHolderClass: "tabs-holder--mobile-view",
    tabsButtonClass: "icon-btn",
    toolsButtonClass: "icon-btn",
    liveFullscreenButtonClass: "icon-btn",
    liveMuteButtonClass: "icon-btn",
    liveControlsPlacement: "inline",
    browseClass: "browse--mobile-view",
    buildInfoRowMarkup: ({ title, subtitle, version, host }) => buildMobileViewInfoRowMarkup({
      title,
      subtitle,
      version,
      streamType: host?._activeStreamType,
      eventsCount: host?._allDisplayEvents?.().length || 0,
      online: host?._hass?.states?.[host?._activeCam?.entity]?.state !== "unavailable"
    }),
    buildMainLayoutShellMarkup: ({ host, regions, layoutProfile }) => buildMobileViewMainLayoutShellMarkup({
      regions: {
        ...regions || {},
        twoWayTalk: host?._buildTwoWayTalkMobileButtonMarkup?.() || ""
      },
      layoutProfile
    }),
    capabilities: {
      hasLive: true,
      hasBrowse: true,
      tabsVariant: "standard"
    }
  });
  registry.register(PAGE_IDS2.wideView, {
    layoutClass: "layout--wide-view",
    leftColumnClass: "col-left--wide-view",
    rightColumnClass: "col-right--wide-view",
    tabsHolderClass: "tabs-holder--wide-view",
    buildInfoRowMarkup: ({ title, subtitle, version, host }) => buildInfoRowMarkup({
      title,
      subtitle,
      version,
      centerActionMarkup: host?._buildTwoWayTalkInfoButtonMarkup?.() || ""
    }),
    buildMainLayoutShellMarkup: ({ regions, layoutProfile }) => buildWideViewMainLayoutShellMarkup({
      regions,
      layoutProfile
    }),
    capabilities: {
      hasLive: true,
      hasBrowse: true,
      tabsVariant: "standard"
    }
  });
  registry.register(PAGE_IDS2.preview, {
    layoutClass: "layout--preview-view",
    leftColumnClass: "col-left--preview-view",
    rightColumnClass: "col-right--preview-view",
    resizeHandleClass: "resize-handle--preview-view",
    buildMainLayoutShellMarkup: ({ regions, layoutProfile }) => buildPreviewPageMainLayoutShellMarkup({
      regions,
      layoutProfile
    }),
    capabilities: {
      hasLive: true,
      hasBrowse: true,
      tabsVariant: "standard"
    }
  });
}

// src/integrations/frigate/url.js
const makeGo2rtcCacheKey = ({ clientId, cam }) => `${clientId}:${cam}`;
const buildGo2rtcWsPath = ({ clientId, cam }) => `/api/frigate/${encodeURIComponent(clientId)}/mse/api/ws?src=${encodeURIComponent(cam)}`;
const buildGo2rtcHlsCandidates = ({ clientId, cam }) => {
  const encClient = encodeURIComponent(clientId);
  const encCam = encodeURIComponent(cam);
  return [`/api/frigate/${encClient}/go2rtc/api/stream.m3u8?src=${encCam}&mp4`];
};

// src/integrations/frigate/camera-context.js
function findCameraConfig(config, entity) {
  return config?.cameras?.find((camera) => camera?.entity === entity) || null;
}
function resolveCameraConnectionType({
  config,
  entity,
  defaultConnectionType,
  normalizeCameraConnectionType: normalizeCameraConnectionType3
}) {
  if (!entity) return defaultConnectionType;
  const camera = findCameraConfig(config, entity);
  return normalizeCameraConnectionType3(camera?.connection_type);
}
function shouldUseGo2RtcForEntity({
  config,
  entity,
  defaultConnectionType,
  normalizeCameraConnectionType: normalizeCameraConnectionType3
}) {
  const key = String(entity || "").trim();
  if (!key) return false;
  return resolveCameraConnectionType({
    config,
    entity: key,
    defaultConnectionType,
    normalizeCameraConnectionType: normalizeCameraConnectionType3
  }) !== "ha_direct";
}
function resolveGo2RtcEntity({
  entity = "",
  activeEntity = "",
  config,
  defaultConnectionType,
  normalizeCameraConnectionType: normalizeCameraConnectionType3
}) {
  const targetEntity = String(entity || activeEntity || "").trim();
  if (!targetEntity) return "";
  return shouldUseGo2RtcForEntity({
    config,
    entity: targetEntity,
    defaultConnectionType,
    normalizeCameraConnectionType: normalizeCameraConnectionType3
  }) ? targetEntity : "";
}
function resolveCameraDisableHlsDesktop({
  config,
  entity,
  normalizeDisableHlsDesktop: normalizeDisableHlsDesktop3
}) {
  if (!entity) return false;
  const camera = findCameraConfig(config, entity);
  return normalizeDisableHlsDesktop3(camera?.disable_hls_desktop);
}
function discoverFrigateCameraState({
  entity,
  hass,
  currentState,
  createCameraState
}) {
  const cache = currentState || createCameraState();
  if (cache.discovered) return cache;
  const ent = hass?.states?.[entity];
  if (!ent) return cache;
  return {
    ...cache,
    clientId: ent.attributes?.client_id || ent.attributes?.mqtt_client_id || "frigate",
    cam: ent.attributes?.camera_name || entity.replace(/^camera\./, ""),
    discovered: true
  };
}
function buildGo2RtcCameraContext({
  entity,
  camCache,
  createCameraState,
  makeGo2rtcCacheKey: makeGo2rtcCacheKey2
}) {
  if (!entity) return null;
  const cache = camCache?.[entity] || createCameraState();
  const { clientId, cam } = cache;
  if (!clientId || !cam) return null;
  return {
    clientId,
    cam,
    cacheKey: makeGo2rtcCacheKey2({ clientId, cam })
  };
}
function buildGo2RtcUrlContext({
  entity,
  activeEntity,
  config,
  defaultConnectionType,
  normalizeCameraConnectionType: normalizeCameraConnectionType3,
  camCache,
  createCameraState,
  makeGo2rtcCacheKey: makeGo2rtcCacheKey2
}) {
  const targetEntity = resolveGo2RtcEntity({
    entity,
    activeEntity,
    config,
    defaultConnectionType,
    normalizeCameraConnectionType: normalizeCameraConnectionType3
  });
  if (!targetEntity) return null;
  const ctx = buildGo2RtcCameraContext({
    entity: targetEntity,
    camCache,
    createCameraState,
    makeGo2rtcCacheKey: makeGo2rtcCacheKey2
  });
  if (!ctx) return null;
  return { targetEntity, ...ctx };
}
function buildGo2RtcTransportState({
  entity,
  activeEntity,
  config,
  defaultConnectionType,
  normalizeCameraConnectionType: normalizeCameraConnectionType3,
  camCache,
  createCameraState,
  makeGo2rtcCacheKey: makeGo2rtcCacheKey2,
  nowMs = Date.now()
}) {
  const ctx = buildGo2RtcUrlContext({
    entity,
    activeEntity,
    config,
    defaultConnectionType,
    normalizeCameraConnectionType: normalizeCameraConnectionType3,
    camCache,
    createCameraState,
    makeGo2rtcCacheKey: makeGo2rtcCacheKey2
  });
  if (!ctx) return null;
  return { ...ctx, nowMs };
}

// src/integrations/frigate/review-status.js
function normalizeCameraToken(value) {
  return String(value || "").trim().toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
}
function reviewStatusEntityCandidates(entity, discoveredCameraName = "") {
  const cameraEntity = String(entity || "").trim().toLowerCase();
  const bareFromEntity = cameraEntity.replace(/^camera\./, "");
  const cameraTokens = [bareFromEntity, discoveredCameraName].map((token) => normalizeCameraToken(token)).filter(Boolean);
  const out = [];
  for (const token of cameraTokens) {
    out.push(`sensor.${token}_review_status`);
  }
  return [...new Set(out)];
}
function haReviewStatusForCamera({
  entity,
  discoveredCameraName = "",
  hass
}) {
  const states = hass?.states || null;
  if (!states) return "";
  for (const candidate of reviewStatusEntityCandidates(
    entity,
    discoveredCameraName
  )) {
    const stateObj = states[candidate];
    if (!stateObj) continue;
    const rawState = String(stateObj.state || "").trim().toLowerCase();
    if (rawState === "alert" || rawState === "detection") {
      return rawState;
    }
    const attrReviewStatus = String(stateObj.attributes?.review_status || "").trim().toLowerCase();
    if (attrReviewStatus === "alert" || attrReviewStatus === "detection") {
      return attrReviewStatus;
    }
    const attrSeverity = String(stateObj.attributes?.severity || "").trim().toLowerCase();
    if (attrSeverity === "alert" || attrSeverity === "detection") {
      return attrSeverity;
    }
    return rawState;
  }
  return "";
}
function haReviewStatusSeverity(value) {
  const normalized = String(value || "").trim().toLowerCase();
  if (normalized === "alert") return "alert";
  if (normalized === "detection") return "detection";
  return "";
}
function haReviewStatusSignature({
  hass,
  cameras,
  resolveDiscoveredCameraName
}) {
  const parts = [];
  for (const camera of cameras || []) {
    const entity = String(camera?.entity || "").trim();
    if (!entity) continue;
    const discoveredCameraName = resolveDiscoveredCameraName ? resolveDiscoveredCameraName(entity) : "";
    const state = haReviewStatusForCamera({
      entity,
      discoveredCameraName,
      hass
    });
    parts.push(`${entity}:${state || "none"}`);
  }
  return parts.join("|");
}

// src/shared/media/url-utils.js
const toAbsoluteSignedUrl = ({ signedPath, origin }) => signedPath.startsWith("http") ? signedPath : `${origin}${signedPath}`;
const toWebSocketUrl = (httpUrl) => httpUrl.replace(/^http/i, "ws");
const requiresNestedSignedHlsRequests = ({ rawPath, signedPath }) => {
  const raw = String(rawPath || "").trim();
  const signed = String(signedPath || "").trim();
  if (!raw || !signed) return false;
  if (raw === signed) return false;
  return signed.includes("authSig=");
};
const isM3u8Url = (url = "") => String(url || "").toLowerCase().includes(".m3u8");
const rewriteM3u8Manifest = async ({ manifestText, rewriteUri }) => {
  const lines = String(manifestText || "").split(/\r?\n/);
  const rewritten = [];
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      rewritten.push(line);
      continue;
    }
    if (!trimmed.startsWith("#")) {
      rewritten.push(await rewriteUri(trimmed));
      continue;
    }
    let nextLine = line;
    const matches = [...line.matchAll(/URI="([^"]+)"/g)];
    for (const match of matches) {
      const originalUri = match[1];
      const replacementUri = await rewriteUri(originalUri);
      nextLine = nextLine.replace(
        `URI="${originalUri}"`,
        `URI="${replacementUri}"`
      );
    }
    rewritten.push(nextLine);
  }
  return rewritten.join("\n");
};
const getFreshCachedValue = ({ cacheMap, cacheKey, nowMs }) => {
  const entry = cacheMap.get(cacheKey);
  if (entry && entry.exp > nowMs) return entry.url ?? null;
  return void 0;
};
const setCachedValue = ({ cacheMap, cacheKey, url, ttlMs, nowMs }) => {
  cacheMap.set(cacheKey, {
    url,
    exp: nowMs + ttlMs
  });
};
const isM3u8Response = ({ contentType, url }) => {
  const ct = String(contentType || "").toLowerCase();
  return ct.includes("application/vnd.apple.mpegurl") || ct.includes("application/x-mpegurl") || ct.includes("audio/mpegurl") || String(url || "").toLowerCase().includes(".m3u8");
};
const buildPopupMediaUrl = ({ baseUrl = "", cacheKey }) => {
  const normalizedBaseUrl = String(baseUrl || "");
  if (!normalizedBaseUrl) return "";
  if (cacheKey === null || cacheKey === void 0 || cacheKey === "") {
    return normalizedBaseUrl;
  }
  const separator = normalizedBaseUrl.includes("?") ? "&" : "?";
  return `${normalizedBaseUrl}${separator}fvc=${encodeURIComponent(String(cacheKey))}`;
};

// src/integrations/frigate/bootstrap.js
async function signHomeAssistantPath({ hass, path, expires = 3600 }) {
  try {
    const result = await hass.callWS({
      type: "auth/sign_path",
      path,
      expires
    });
    return result?.path || path;
  } catch (_) {
    return path;
  }
}
function resolveAbsoluteSignedPath({ signedPath, origin }) {
  return toAbsoluteSignedUrl({ signedPath, origin });
}
async function signSameOriginAbsoluteUrl({
  hass,
  url,
  origin,
  expires = 3600
}) {
  const abs = String(url || "").trim();
  if (!abs) return abs;
  let parsed;
  try {
    parsed = new URL(abs, origin);
  } catch (_) {
    return abs;
  }
  if (parsed.origin !== origin) return parsed.toString();
  const signedPath = await signHomeAssistantPath({
    hass,
    path: `${parsed.pathname}${parsed.search}`,
    expires
  });
  return resolveAbsoluteSignedPath({ signedPath, origin });
}
async function buildSignedGo2RtcWebSocketUrl({
  hass,
  path,
  origin,
  expires = 3600
}) {
  const signedPath = await signHomeAssistantPath({ hass, path, expires });
  const abs = resolveAbsoluteSignedPath({ signedPath, origin });
  return toWebSocketUrl(abs);
}
async function rewriteSignedHlsManifestSource({
  manifestUrl,
  blobUrls,
  signAbsoluteUrl,
  fetchImpl = fetch,
  depth = 0
}) {
  if (depth > 3) return null;
  let resp;
  try {
    resp = await fetchImpl(manifestUrl, {
      method: "GET",
      cache: "no-store",
      credentials: "same-origin"
    });
  } catch (_) {
    return null;
  }
  if (!resp.ok) return null;
  const manifestText = await resp.text();
  const rewritten = await rewriteM3u8Manifest({
    manifestText,
    rewriteUri: async (uri) => {
      const resolvedUrl = new URL(uri, manifestUrl).toString();
      if (isM3u8Url(resolvedUrl)) {
        const nestedManifestUrl = await signAbsoluteUrl(resolvedUrl);
        const nestedBlobUrl = await rewriteSignedHlsManifestSource({
          manifestUrl: nestedManifestUrl,
          blobUrls,
          signAbsoluteUrl,
          fetchImpl,
          depth: depth + 1
        });
        return nestedBlobUrl || nestedManifestUrl;
      }
      return await signAbsoluteUrl(resolvedUrl);
    }
  });
  const blobUrl = URL.createObjectURL(
    new Blob([rewritten], { type: "application/vnd.apple.mpegurl" })
  );
  blobUrls.push(blobUrl);
  return blobUrl;
}
async function buildGo2RtcHlsProbeResult({
  rawPath,
  signedPath,
  manifestUrl,
  rewriteManifestSource,
  revokeObjectUrl = (url) => URL.revokeObjectURL(url),
  requiresNestedSignedHlsRequestsImpl = requiresNestedSignedHlsRequests
}) {
  if (!requiresNestedSignedHlsRequestsImpl({ rawPath, signedPath })) {
    return { url: manifestUrl, cacheable: true, destroy: null };
  }
  const blobUrls = [];
  const rewrittenUrl = await rewriteManifestSource(manifestUrl, blobUrls);
  if (!rewrittenUrl) {
    blobUrls.forEach((blobUrl) => revokeObjectUrl(blobUrl));
    return null;
  }
  return {
    url: rewrittenUrl,
    cacheable: false,
    destroy: () => {
      blobUrls.forEach((blobUrl) => revokeObjectUrl(blobUrl));
    }
  };
}

// src/integrations/frigate/go2rtc-resolver.js
const GO2RTC_CACHE_TTL_MS = Object.freeze({
  wsSignedPath: 55 * 60 * 1e3,
  hlsPlaylist: 30 * 60 * 1e3,
  hlsNegative: 30 * 60 * 1e3
});
function createGo2RtcResolver({
  getHass,
  getConfig,
  getActiveEntity,
  getCamCache,
  defaultConnectionType,
  normalizeCameraConnectionType: normalizeCameraConnectionType3,
  createCameraState,
  discoverEntity,
  supportsNativeHlsPlayback: supportsNativeHlsPlayback2,
  getOrigin = () => window.location.origin,
  getNowMs = () => Date.now(),
  fetchImpl = fetch
}) {
  const wsUrlCache = new Map();
  const wsUrlInFlight = new Map();
  const hlsUrlCache = new Map();
  const hlsProbeInFlight = new Map();
  const resolveEntity = (entity = "") => {
    return resolveGo2RtcEntity({
      entity,
      activeEntity: getActiveEntity(),
      config: getConfig(),
      defaultConnectionType,
      normalizeCameraConnectionType: normalizeCameraConnectionType3
    });
  };
  const resolveMountRequest = (options = {}) => {
    return {
      entity: resolveEntity(options?.entity),
      abortSignal: options?.abortSignal || null,
      commit: options.commit !== false
    };
  };
  const resolveTransportStateForEntity = async (entity) => {
    const targetEntity = resolveEntity(entity);
    if (!targetEntity) return null;
    await discoverEntity(targetEntity);
    return buildGo2RtcTransportState({
      entity,
      activeEntity: getActiveEntity(),
      config: getConfig(),
      defaultConnectionType,
      normalizeCameraConnectionType: normalizeCameraConnectionType3,
      camCache: getCamCache(),
      createCameraState,
      makeGo2rtcCacheKey,
      nowMs: getNowMs()
    });
  };
  const signedAbsoluteUrl = async (url) => {
    return await signSameOriginAbsoluteUrl({
      hass: getHass(),
      url,
      origin: getOrigin()
    });
  };
  const rewriteManifestSource = async (manifestUrl, blobUrls, depth = 0) => {
    return await rewriteSignedHlsManifestSource({
      manifestUrl,
      blobUrls,
      depth,
      fetchImpl,
      signAbsoluteUrl: async (url) => {
        return await signedAbsoluteUrl(url);
      }
    });
  };
  const probeHlsCandidates = async (candidates, cacheKey) => {
    for (const path of candidates) {
      const signedPath = await signHomeAssistantPath({
        hass: getHass(),
        path
      });
      const manifestUrl = `${getOrigin()}${signedPath}`;
      try {
        const resp = await fetchImpl(manifestUrl, {
          method: "GET",
          cache: "no-store",
          credentials: "same-origin"
        });
        if (!resp.ok) continue;
        if (isM3u8Response({
          contentType: resp.headers.get("content-type") || "",
          url: manifestUrl
        })) {
          const result = await buildGo2RtcHlsProbeResult({
            rawPath: path,
            signedPath,
            manifestUrl,
            rewriteManifestSource
          });
          if (result?.cacheable) {
            setCachedValue({
              cacheMap: hlsUrlCache,
              cacheKey,
              url: result.url,
              ttlMs: GO2RTC_CACHE_TTL_MS.hlsPlaylist,
              nowMs: getNowMs()
            });
          }
          return result;
        }
      } catch (_) {
      }
    }
    setCachedValue({
      cacheMap: hlsUrlCache,
      cacheKey,
      url: null,
      ttlMs: GO2RTC_CACHE_TTL_MS.hlsNegative,
      nowMs: getNowMs()
    });
    return null;
  };
  const websocketUrlForEntity = async (entity) => {
    const state = await resolveTransportStateForEntity(entity);
    if (!state) return null;
    const { clientId, cam, cacheKey, nowMs } = state;
    const cachedUrl = getFreshCachedValue({
      cacheMap: wsUrlCache,
      cacheKey,
      nowMs
    });
    if (cachedUrl) return cachedUrl;
    const inFlight = wsUrlInFlight.get(cacheKey);
    if (inFlight) return inFlight;
    const wsUrlPromise = (async () => {
      const path = buildGo2rtcWsPath({ clientId, cam });
      const wsUrl = await buildSignedGo2RtcWebSocketUrl({
        hass: getHass(),
        path,
        origin: getOrigin()
      });
      setCachedValue({
        cacheMap: wsUrlCache,
        cacheKey,
        url: wsUrl,
        ttlMs: GO2RTC_CACHE_TTL_MS.wsSignedPath,
        nowMs
      });
      return wsUrl;
    })().finally(() => {
      wsUrlInFlight.delete(cacheKey);
    });
    wsUrlInFlight.set(cacheKey, wsUrlPromise);
    return wsUrlPromise;
  };
  const hlsUrlForEntity = async (entity = "") => {
    const state = await resolveTransportStateForEntity(entity);
    if (!state) return null;
    if (!supportsNativeHlsPlayback2()) return null;
    const { clientId, cam, cacheKey, nowMs } = state;
    const cachedUrl = getFreshCachedValue({
      cacheMap: hlsUrlCache,
      cacheKey,
      nowMs
    });
    if (cachedUrl !== void 0) {
      return cachedUrl == null ? null : { url: cachedUrl, destroy: null };
    }
    const inFlight = hlsProbeInFlight.get(cacheKey);
    if (inFlight) return inFlight;
    const candidates = buildGo2rtcHlsCandidates({ clientId, cam });
    const probePromise = probeHlsCandidates(candidates, cacheKey).finally(
      () => {
        hlsProbeInFlight.delete(cacheKey);
      }
    );
    hlsProbeInFlight.set(cacheKey, probePromise);
    return probePromise;
  };
  return {
    resolveMountRequest,
    websocketUrlForEntity,
    hlsUrlForEntity
  };
}

// src/features/live/startup-policy.js
const MIN_WAIT_MS = 500;
const normalizeWaitMs = (value, fallback) => Math.max(MIN_WAIT_MS, Number(value ?? fallback));
const normalizeNumber = (value, fallback) => Number(value ?? fallback);
const resolveHaDirectStartup = (startup = {}) => ({
  waitMs: normalizeWaitMs(startup.waitMs, 8e3),
  minCurrentTime: normalizeNumber(startup.minCurrentTime, 0.05),
  minDecodedFrames: normalizeNumber(startup.minDecodedFrames, 1),
  requireReadyState: normalizeNumber(startup.requireReadyState, 0),
  strict: startup.strict ?? false,
  streamType: startup.streamType
});
const buildHaDirectMountPlan = ({
  startup = {},
  preferredStreamType
}) => {
  const policy = resolveHaDirectStartup(startup);
  return {
    streamType: policy.streamType || preferredStreamType,
    waitOptions: {
      minCurrentTime: policy.minCurrentTime,
      minDecodedFrames: policy.minDecodedFrames,
      requireReadyState: policy.requireReadyState,
      strict: policy.strict
    },
    waitMs: policy.waitMs
  };
};
const resolveMseStartup = (startup = {}) => ({
  waitMs: normalizeWaitMs(startup.waitMs, 8e3),
  minCurrentTime: normalizeNumber(startup.minCurrentTime, 0.2),
  minDecodedFrames: normalizeNumber(startup.minDecodedFrames, 2),
  requireReadyState: normalizeNumber(startup.requireReadyState, 3),
  strict: startup.strict !== false
});
const resolveWebRtcStartup = ({ startup = {} }) => ({
  waitMs: normalizeWaitMs(startup.waitMs, 7e3),
  minCurrentTime: normalizeNumber(startup.minCurrentTime, 0.05),
  minDecodedFrames: normalizeNumber(startup.minDecodedFrames, 1),
  requireReadyState: normalizeNumber(startup.requireReadyState, 0),
  strict: startup.strict !== false
});
const resolveHlsStartup = (startup = {}) => ({
  waitMs: normalizeWaitMs(startup.waitMs, 5e3)
});
const resolveHaDirectMountUnavailableState = () => ({
  loading: false,
  fallbackVisible: false,
  refreshFallbackImage: false
});
const resolveHaDirectReadyState = ({
  rotateOverlayActive = false,
  isCurrentEngine = false,
  waitSucceeded = false
}) => ({
  shouldApply: Boolean(isCurrentEngine && waitSucceeded),
  loading: false,
  fallbackVisible: false,
  refreshFallbackImage: false,
  enableNativeControls: Boolean(rotateOverlayActive && isCurrentEngine)
});
const resolveHaDirectStabilizedState = ({
  rotateOverlayActive = false,
  isCurrentEngine = false
}) => ({
  shouldApply: Boolean(isCurrentEngine),
  loading: false,
  fallbackVisible: false,
  refreshFallbackImage: false,
  enableNativeControls: Boolean(rotateOverlayActive && isCurrentEngine)
});

// src/shared/media/video-factory.js
const VIDEO_PROFILES = Object.freeze({
  liveEngine: Object.freeze({
    styleText: "width:100%;height:100%;display:block;background:var(--c-bg-deep)",
    autoplay: true,
    playsInline: true,
    controls: false,
    preload: ""
  }),
  popupPlayback: Object.freeze({
    styleText: "",
    autoplay: true,
    playsInline: true,
    controls: true,
    preload: "metadata"
  }),
  recordingPlayback: Object.freeze({
    styleText: "",
    autoplay: false,
    playsInline: true,
    controls: true,
    preload: "metadata"
  })
});
const VIDEO_VIEW_PROFILE_MAP = Object.freeze({
  live: "liveEngine",
  popup: "popupPlayback",
  recording: "recordingPlayback"
});
const VIDEO_VIEW_DEFAULT_OPTIONS = Object.freeze({
  live: Object.freeze({ viewType: "live" }),
  popup: Object.freeze({ viewType: "popup" }),
  recording: Object.freeze({ viewType: "recording" })
});
const EMPTY_OPTIONS = Object.freeze({});
const globalRuntimeVideoViewDefaultOptions = {
  live: {},
  popup: {},
  recording: {}
};
const scopedRuntimeVideoViewDefaultsWeak = new WeakMap();
const scopedRuntimeVideoViewDefaultsMap = new Map();
function createRuntimeDefaultsStore() {
  return {
    live: {},
    popup: {},
    recording: {}
  };
}
function resolveVideoProfileNameForView(viewType) {
  const key = String(viewType || "").trim().toLowerCase();
  return VIDEO_VIEW_PROFILE_MAP[key] || VIDEO_VIEW_PROFILE_MAP.live;
}
function resolveViewKey(viewType) {
  const key = String(viewType || "").trim().toLowerCase();
  return VIDEO_VIEW_DEFAULT_OPTIONS[key] ? key : "live";
}
function normalizeOptionsObject(value) {
  return value && typeof value === "object" ? value : EMPTY_OPTIONS;
}
function isObjectScopeKey(scopeKey) {
  return scopeKey !== null && (typeof scopeKey === "object" || typeof scopeKey === "function");
}
function resolveScopedRuntimeStore(scopeKey, { create = false } = {}) {
  if (scopeKey === null || scopeKey === void 0) return null;
  if (isObjectScopeKey(scopeKey)) {
    const existing2 = scopedRuntimeVideoViewDefaultsWeak.get(scopeKey);
    if (existing2 || !create) return existing2 || null;
    const next2 = createRuntimeDefaultsStore();
    scopedRuntimeVideoViewDefaultsWeak.set(scopeKey, next2);
    return next2;
  }
  const existing = scopedRuntimeVideoViewDefaultsMap.get(scopeKey);
  if (existing || !create) return existing || null;
  const next = createRuntimeDefaultsStore();
  scopedRuntimeVideoViewDefaultsMap.set(scopeKey, next);
  return next;
}
function resolveRuntimeDefaultsForView(viewKey, context = {}) {
  const globalDefaults = globalRuntimeVideoViewDefaultOptions[viewKey] || EMPTY_OPTIONS;
  const scopedStore = resolveScopedRuntimeStore(context.scopeKey);
  const scopedDefaults = scopedStore?.[viewKey] || EMPTY_OPTIONS;
  return mergeOptionLayers(
    EMPTY_OPTIONS,
    normalizeOptionsObject(globalDefaults),
    normalizeOptionsObject(scopedDefaults)
  );
}
function mergeOptionLayers(base, runtimeDefaults, overrides) {
  const merged = {
    ...base,
    ...runtimeDefaults,
    ...overrides
  };
  const mergeObjectKey = (key) => {
    if (base[key] || runtimeDefaults[key] || overrides[key]) {
      merged[key] = {
        ...normalizeOptionsObject(base[key]),
        ...normalizeOptionsObject(runtimeDefaults[key]),
        ...normalizeOptionsObject(overrides[key])
      };
    }
  };
  mergeObjectKey("style");
  mergeObjectKey("dataset");
  mergeObjectKey("attributes");
  if (base.classNames || runtimeDefaults.classNames || overrides.classNames) {
    const tokens = [
      ...Array.isArray(base.classNames) ? base.classNames : [],
      ...Array.isArray(runtimeDefaults.classNames) ? runtimeDefaults.classNames : [],
      ...Array.isArray(overrides.classNames) ? overrides.classNames : []
    ].map((token) => String(token || "").trim()).filter(Boolean);
    merged.classNames = [...new Set(tokens)];
  }
  return merged;
}
function setVideoViewDefaultOptions(viewType, defaults = {}) {
  const viewKey = resolveViewKey(viewType);
  globalRuntimeVideoViewDefaultOptions[viewKey] = {
    ...normalizeOptionsObject(defaults)
  };
}
function getVideoViewDefaultOptions(viewType) {
  const viewKey = resolveViewKey(viewType);
  return {
    ...normalizeOptionsObject(globalRuntimeVideoViewDefaultOptions[viewKey])
  };
}
function resetVideoViewDefaultOptions(viewType = null) {
  if (viewType == null) {
    for (const key of Object.keys(globalRuntimeVideoViewDefaultOptions)) {
      globalRuntimeVideoViewDefaultOptions[key] = {};
    }
    return;
  }
  const viewKey = resolveViewKey(viewType);
  globalRuntimeVideoViewDefaultOptions[viewKey] = {};
}
function setScopedVideoViewDefaultOptions(viewType, defaults = {}, context = {}) {
  const viewKey = resolveViewKey(viewType);
  const scopeKey = context?.scopeKey;
  const store = resolveScopedRuntimeStore(scopeKey, { create: true });
  if (!store) {
    setVideoViewDefaultOptions(viewType, defaults);
    return;
  }
  store[viewKey] = {
    ...normalizeOptionsObject(defaults)
  };
}
function getScopedVideoViewDefaultOptions(viewType, context = {}) {
  const viewKey = resolveViewKey(viewType);
  const scopeKey = context?.scopeKey;
  const store = resolveScopedRuntimeStore(scopeKey);
  if (!store) return {};
  return { ...normalizeOptionsObject(store[viewKey]) };
}
function resetScopedVideoViewDefaultOptions(viewType = null, context = {}) {
  const scopeKey = context?.scopeKey;
  const store = resolveScopedRuntimeStore(scopeKey);
  if (!store) return;
  if (viewType == null) {
    for (const key of Object.keys(store)) {
      store[key] = {};
    }
    return;
  }
  const viewKey = resolveViewKey(viewType);
  store[viewKey] = {};
}
function buildVideoOptionsForView(viewType, overrides = {}, context = {}) {
  const viewKey = resolveViewKey(viewType);
  const base = VIDEO_VIEW_DEFAULT_OPTIONS[viewKey] || VIDEO_VIEW_DEFAULT_OPTIONS.live;
  const runtimeDefaults = resolveRuntimeDefaultsForView(viewKey, context);
  const safeOverrides = normalizeOptionsObject(overrides);
  return mergeOptionLayers(base, runtimeDefaults, safeOverrides);
}
function resolveVideoProfile({ profile, viewType } = {}) {
  const profileName = profile || resolveVideoProfileNameForView(viewType);
  return VIDEO_PROFILES[profileName] || VIDEO_PROFILES.liveEngine;
}
function applyVideoBooleanProperty(video, key, value) {
  if (typeof value === "boolean") {
    video[key] = value;
  }
}
function applyVideoStyleProperty(video, styleKey, value) {
  if (!video?.style || !styleKey) return;
  if (value === null) {
    video.style[styleKey] = "";
    return;
  }
  if (value === void 0) return;
  video.style[styleKey] = String(value);
}
function applyVideoStyleOptions(video, options = {}) {
  const styleOptions = {
    objectFit: options.objectFit,
    objectPosition: options.objectPosition,
    aspectRatio: options.aspectRatio,
    filter: options.filter,
    borderRadius: options.borderRadius,
    boxShadow: options.boxShadow,
    ...options.style && typeof options.style === "object" ? options.style : {}
  };
  for (const [styleKey, value] of Object.entries(styleOptions)) {
    applyVideoStyleProperty(video, styleKey, value);
  }
}
function applyVideoClassOptions(video, options = {}) {
  const { className, classNames } = options;
  if (className !== void 0) {
    video.className = className == null ? "" : String(className);
  }
  if (Array.isArray(classNames) && video.classList) {
    for (const classToken of classNames) {
      const token = String(classToken || "").trim();
      if (!token) continue;
      video.classList.add(token);
    }
  }
}
function applyVideoDatasetOptions(video, options = {}) {
  if (!video?.dataset || !options?.dataset || typeof options.dataset !== "object") {
    return;
  }
  for (const [key, value] of Object.entries(options.dataset)) {
    if (!key) continue;
    if (value === null || value === void 0 || value === false) {
      delete video.dataset[key];
      continue;
    }
    video.dataset[key] = value === true ? "1" : String(value);
  }
}
function configureVideoElement(video, options = {}) {
  if (!video) return video;
  const profile = resolveVideoProfile({
    profile: options.profile,
    viewType: options.viewType
  });
  const styleText = options.styleText || profile.styleText;
  applyVideoBooleanProperty(
    video,
    "autoplay",
    options.autoplay ?? profile.autoplay
  );
  applyVideoBooleanProperty(
    video,
    "playsInline",
    options.playsInline ?? profile.playsInline
  );
  applyVideoBooleanProperty(video, "muted", options.muted);
  applyVideoBooleanProperty(
    video,
    "controls",
    options.controls ?? profile.controls
  );
  if (options.defaultMuted !== void 0) {
    applyVideoBooleanProperty(video, "defaultMuted", options.defaultMuted);
  }
  if (options.preload || profile.preload) {
    video.preload = options.preload || profile.preload;
  }
  if (styleText) {
    video.style.cssText = styleText;
  }
  applyVideoStyleOptions(video, options);
  applyVideoClassOptions(video, options);
  applyVideoDatasetOptions(video, options);
  video.setAttribute("playsinline", "");
  video.setAttribute("webkit-playsinline", "");
  video.disableRemotePlayback = true;
  video.setAttribute("x-webkit-airplay", "deny");
  if (options.attributes && typeof options.attributes === "object") {
    for (const [name, value] of Object.entries(options.attributes)) {
      if (value === null || value === void 0 || value === false) {
        video.removeAttribute(name);
      } else if (value === true) {
        video.setAttribute(name, "");
      } else {
        video.setAttribute(name, String(value));
      }
    }
  }
  return video;
}
function createVideoElement(options = {}) {
  const video = document.createElement("video");
  configureVideoElement(video, options);
  if (typeof options.src === "string") {
    video.src = options.src;
  }
  return video;
}
function supportsNativeHlsPlayback() {
  const video = document.createElement("video");
  return !!(video.canPlayType?.("application/vnd.apple.mpegurl") || video.canPlayType?.("application/x-mpegURL"));
}
function mountNodeIntoSlot(slot, node) {
  if (!slot || !node) return;
  slot.innerHTML = "";
  slot.appendChild(node);
}

// src/features/live/go2rtc-mounter.js
function resolveGo2RtcCodecs(isSupported) {
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
  return codecs.filter((codec) => isSupported(`video/mp4; codecs="${codec}"`)).join(",");
}
function normalizeGo2RtcCodecs(value) {
  if (!value) return "";
  const source = String(value).trim();
  const match = source.match(/codecs\s*=\s*"([^"]+)"/i);
  if (match && match[1]) return match[1].trim();
  if (/^video\//i.test(source)) return "";
  return source;
}
function startFirefoxLiveCatchup(video, isFirefox) {
  if (!video || !isFirefox()) return () => {
  };
  let firstFrameAt = 0;
  let hardSeekUsed = false;
  const timer = setInterval(() => {
    try {
      const buffered = video.buffered;
      if (!buffered || !buffered.length) return;
      const end = buffered.end(buffered.length - 1);
      const current = Number(video.currentTime) || 0;
      if (current > 0.05 && !firstFrameAt) firstFrameAt = Date.now();
      const lag = end - current;
      if (!Number.isFinite(lag) || lag <= 0) return;
      const sinceFirstFrame = firstFrameAt ? Date.now() - firstFrameAt : 0;
      if (sinceFirstFrame > 0 && sinceFirstFrame < 4e3) {
        if (lag > 3 && !hardSeekUsed) {
          video.currentTime = Math.max(0, end - 0.08);
          video.playbackRate = 1;
          hardSeekUsed = true;
        } else if (lag > 1.5) {
          video.playbackRate = 1.08;
        } else if (lag > 0.7) {
          video.playbackRate = 1.04;
        } else {
          video.playbackRate = 1;
        }
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
  return () => clearInterval(timer);
}
function resolveCommittedResult({
  commit,
  type,
  engine,
  slot,
  onCommittedStream
}) {
  if (!commit) return { ok: true, type, engine, slot };
  onCommittedStream(type);
  return true;
}
function createGo2RtcMounter({
  resolver,
  getStreamMuted,
  waitForStreamStart,
  attachVideoFit,
  assignCommittedEngine,
  onCommittedStream,
  scheduleResumeLive,
  isFirefox,
  scopeKey,
  resetMseDiagnostics,
  markMseChunk,
  nowMs = () => Date.now()
}) {
  const tryMountMse = async (slot, startup = null, options = {}) => {
    const {
      waitMs,
      minCurrentTime,
      minDecodedFrames,
      requireReadyState,
      strict
    } = resolveMseStartup(startup || {});
    const { entity, abortSignal, commit } = resolver.resolveMountRequest(options);
    const muted = options?.muted ?? getStreamMuted();
    if (!entity) return false;
    if (abortSignal?.aborted) return false;
    if (!("WebSocket" in window) || !("MediaSource" in window)) {
      return false;
    }
    const wsUrl = await resolver.websocketUrlForEntity(entity);
    if (!wsUrl) return false;
    const video = createVideoElement(
      buildVideoOptionsForView(
        "live",
        {
          muted,
          controls: false
        },
        { scopeKey }
      )
    );
    const mediaSource = new MediaSource();
    video.src = URL.createObjectURL(mediaSource);
    mountNodeIntoSlot(slot, video);
    attachVideoFit(video);
    const ws = new WebSocket(wsUrl);
    ws.binaryType = "arraybuffer";
    const startupAbort = new AbortController();
    let abortBound = false;
    let streamStarted = false;
    resetMseDiagnostics(nowMs());
    let sourceBuffer = null;
    let mseRequested = false;
    let queue = [];
    const appendNext = () => {
      if (!sourceBuffer || sourceBuffer.updating || !queue.length) return;
      try {
        sourceBuffer.appendBuffer(queue.shift());
      } catch (_) {
        queue = [];
      }
    };
    const stopCatchup = startFirefoxLiveCatchup(video, isFirefox);
    const requestMse = () => {
      if (mseRequested) return;
      if (ws.readyState !== WebSocket.OPEN) return;
      const codecs = resolveGo2RtcCodecs(MediaSource.isTypeSupported);
      mseRequested = true;
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
      if (abortSignal && abortBound) {
        abortSignal.removeEventListener("abort", onAbort);
        abortBound = false;
      }
    };
    const onAbort = () => {
      destroy();
    };
    if (abortSignal) {
      abortSignal.addEventListener("abort", onAbort, { once: true });
      abortBound = true;
    }
    const engine = { video, ws, destroy };
    if (commit) assignCommittedEngine(engine);
    mediaSource.addEventListener(
      "sourceopen",
      () => {
        requestMse();
      },
      { once: true }
    );
    ws.addEventListener("open", () => {
      if (mediaSource.readyState === "open") requestMse();
    });
    ws.addEventListener("error", () => {
      if (!startupAbort.signal.aborted) startupAbort.abort();
    });
    ws.addEventListener("close", () => {
      if (!startupAbort.signal.aborted) startupAbort.abort();
      if (streamStarted && commit) {
        scheduleResumeLive("mse-ws-closed");
      }
    });
    ws.addEventListener("message", (event) => {
      if (typeof event.data === "string") {
        let msg;
        try {
          msg = JSON.parse(event.data);
        } catch (_) {
          return;
        }
        if (msg?.type === "mse" && msg.value && mediaSource.readyState === "open") {
          if (sourceBuffer) return;
          try {
            const codecs = normalizeGo2RtcCodecs(msg.value);
            if (!codecs) return;
            const mime = `video/mp4; codecs="${codecs}"`;
            if (!MediaSource.isTypeSupported(mime)) return;
            sourceBuffer = mediaSource.addSourceBuffer(mime);
            sourceBuffer.mode = "segments";
            sourceBuffer.addEventListener("updateend", appendNext);
            appendNext();
          } catch (_) {
          }
        }
        return;
      }
      if (!(event.data instanceof ArrayBuffer)) return;
      markMseChunk(nowMs());
      queue.push(event.data);
      appendNext();
    });
    const started = await waitForStreamStart(slot, waitMs, {
      minCurrentTime,
      minDecodedFrames,
      requireReadyState,
      strict,
      abortSignal: startupAbort.signal
    });
    if (!started) {
      destroy();
      return false;
    }
    streamStarted = true;
    return resolveCommittedResult({
      commit,
      type: "mse",
      engine,
      slot,
      onCommittedStream
    });
  };
  const tryMountWebRtc = async (slot, startup = null, options = {}) => {
    const {
      waitMs,
      minCurrentTime,
      minDecodedFrames,
      requireReadyState,
      strict
    } = resolveWebRtcStartup({
      startup: startup || {}
    });
    const { entity, abortSignal, commit } = resolver.resolveMountRequest(options);
    if (abortSignal?.aborted) return false;
    if (!("RTCPeerConnection" in window) || !("WebSocket" in window)) {
      return false;
    }
    if (!entity) return false;
    const wsUrl = await resolver.websocketUrlForEntity(entity);
    if (!wsUrl) return false;
    const video = createVideoElement(
      buildVideoOptionsForView(
        "live",
        {
          muted: getStreamMuted(),
          controls: false
        },
        { scopeKey }
      )
    );
    mountNodeIntoSlot(slot, video);
    attachVideoFit(video);
    const pc = new RTCPeerConnection({
      bundlePolicy: "max-bundle",
      sdpSemantics: "unified-plan",
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
    });
    const ws = new WebSocket(wsUrl);
    let abortBound = false;
    const destroy = () => {
      try {
        ws.close();
      } catch (_) {
      }
      try {
        pc.close();
      } catch (_) {
      }
      if (abortSignal && abortBound) {
        abortSignal.removeEventListener("abort", onAbort);
        abortBound = false;
      }
    };
    const onAbort = () => {
      destroy();
    };
    if (abortSignal) {
      abortSignal.addEventListener("abort", onAbort, { once: true });
      abortBound = true;
    }
    const engine = { video, pc, ws, destroy };
    if (commit) assignCommittedEngine(engine);
    pc.addTransceiver("video", { direction: "recvonly" });
    pc.addTransceiver("audio", { direction: "recvonly" });
    let resolveFirstRenderedFrame = null;
    const firstRenderedFramePromise = new Promise((resolve) => {
      resolveFirstRenderedFrame = resolve;
    });
    pc.addEventListener("track", (event) => {
      if (event.streams && event.streams[0]) {
        video.srcObject = event.streams[0];
      } else {
        const mediaStream = video.srcObject || new MediaStream();
        mediaStream.addTrack(event.track);
        video.srcObject = mediaStream;
      }
      video.play().catch(() => {
      });
      if (video.requestVideoFrameCallback) {
        video.requestVideoFrameCallback(() => {
          if (!resolveFirstRenderedFrame) return;
          resolveFirstRenderedFrame(true);
          resolveFirstRenderedFrame = null;
        });
      }
    });
    pc.addEventListener("icecandidate", (event) => {
      if (ws.readyState !== WebSocket.OPEN) return;
      const candidate = event.candidate ? event.candidate.toJSON().candidate : "";
      ws.send(JSON.stringify({ type: "webrtc/candidate", value: candidate }));
    });
    ws.addEventListener("message", (event) => {
      let msg;
      try {
        msg = JSON.parse(event.data);
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
    const started = await Promise.race([
      waitForStreamStart(video, waitMs, {
        minCurrentTime,
        minDecodedFrames,
        requireReadyState,
        strict,
        abortSignal
      }),
      firstRenderedFramePromise
    ]);
    resolveFirstRenderedFrame = null;
    if (!started) {
      destroy();
      return false;
    }
    return resolveCommittedResult({
      commit,
      type: "webrtc",
      engine,
      slot,
      onCommittedStream
    });
  };
  const tryMountHls = async (slot, startup = null, options = {}) => {
    const { waitMs } = resolveHlsStartup(startup || {});
    const { entity, abortSignal, commit } = resolver.resolveMountRequest(options);
    if (abortSignal?.aborted) return false;
    if (!entity) return false;
    const hlsSource = await resolver.hlsUrlForEntity(entity);
    if (!hlsSource?.url) return false;
    const video = createVideoElement(
      buildVideoOptionsForView(
        "live",
        {
          muted: getStreamMuted(),
          controls: false,
          src: hlsSource.url
        },
        { scopeKey }
      )
    );
    mountNodeIntoSlot(slot, video);
    attachVideoFit(video);
    let abortBound = false;
    const destroy = () => {
      try {
        video.pause();
        video.removeAttribute("src");
        video.load();
      } catch (_) {
      }
      try {
        hlsSource.destroy?.();
      } catch (_) {
      }
      try {
        if (video.src?.startsWith("blob:")) URL.revokeObjectURL(video.src);
      } catch (_) {
      }
      if (abortSignal && abortBound) {
        abortSignal.removeEventListener("abort", onAbort);
        abortBound = false;
      }
    };
    const onAbort = () => {
      destroy();
    };
    if (abortSignal) {
      abortSignal.addEventListener("abort", onAbort, { once: true });
      abortBound = true;
    }
    const engine = { video, destroy };
    if (commit) assignCommittedEngine(engine);
    const started = await waitForStreamStart(video, waitMs, {
      minCurrentTime: 0.05,
      minDecodedFrames: 1,
      requireReadyState: 2,
      strict: false,
      abortSignal
    });
    if (!started) {
      destroy();
      return false;
    }
    return resolveCommittedResult({
      commit,
      type: "hls",
      engine,
      slot,
      onCommittedStream
    });
  };
  return {
    tryMountMse,
    tryMountWebRtc,
    tryMountHls
  };
}

// src/features/live/mount-lifecycle.js
const beginMountTracking = ({
  mountSeq,
  entity,
  nowMs = Date.now()
}) => {
  const mountToken = Number(mountSeq || 0) + 1;
  return {
    mountToken,
    nextState: {
      mountSeq: mountToken,
      mountInProgress: true,
      mountStartedAt: nowMs,
      mountTargetEntity: entity || ""
    }
  };
};
const clearMountTrackingIfCurrent = ({
  mountSeq,
  mountToken,
  mountInProgress,
  mountStartedAt,
  mountTargetEntity
}) => {
  if (mountSeq !== mountToken) {
    return {
      mountSeq,
      mountInProgress,
      mountStartedAt,
      mountTargetEntity
    };
  }
  return {
    mountSeq,
    mountInProgress: false,
    mountStartedAt: 0,
    mountTargetEntity: ""
  };
};
const invalidateMountTrackingIfActive = ({
  mountSeq,
  mountInProgress,
  mountStartedAt,
  mountTargetEntity
}) => {
  if (!mountInProgress) {
    return {
      mountSeq,
      mountInProgress,
      mountStartedAt,
      mountTargetEntity
    };
  }
  return {
    mountSeq: Number(mountSeq || 0) + 1,
    mountInProgress: false,
    mountStartedAt: 0,
    mountTargetEntity: ""
  };
};
const shouldRunMountWatchdog = ({
  mountInProgress,
  mountSeq,
  mountToken
}) => mountInProgress === true && mountSeq === mountToken;
const applyMountWatchdogTimeout = ({ mountSeq }) => ({
  mountSeq: Number(mountSeq || 0) + 1,
  mountInProgress: false,
  mountStartedAt: 0,
  mountTargetEntity: ""
});
const resolveLiveResumeAction = ({
  started,
  hass,
  config,
  previewPageActive,
  visible,
  popupOpen,
  mountSeq,
  mountInProgress,
  mountStartedAt,
  mountTargetEntity,
  nowMs = Date.now(),
  stuckThresholdMs = 12e3,
  retryDelayMs = 450,
  safetyKickDelayMs = 900
}) => {
  if (!started || !hass || !config || previewPageActive) {
    return {
      shouldRetry: false,
      shouldKickNow: false,
      shouldRevealEngineWrap: false,
      retryDelayMs: 0,
      safetyKickDelayMs: 0,
      nextMountState: null
    };
  }
  let nextMountState = null;
  let nextMountInProgress = mountInProgress;
  const mountStuckMs = mountStartedAt ? nowMs - mountStartedAt : 0;
  if (mountInProgress && mountStuckMs > stuckThresholdMs) {
    nextMountState = invalidateMountTrackingIfActive({
      mountSeq,
      mountInProgress,
      mountStartedAt,
      mountTargetEntity
    });
    nextMountInProgress = nextMountState.mountInProgress;
  }
  if (!visible || popupOpen || nextMountInProgress) {
    return {
      shouldRetry: true,
      shouldKickNow: false,
      shouldRevealEngineWrap: false,
      retryDelayMs,
      safetyKickDelayMs: 0,
      nextMountState
    };
  }
  return {
    shouldRetry: false,
    shouldKickNow: true,
    shouldRevealEngineWrap: true,
    retryDelayMs: 0,
    safetyKickDelayMs,
    nextMountState
  };
};
const isLiveVideoStale = ({
  readyState = 0,
  ended = false,
  paused = false,
  currentTime = 0,
  decodedFrames = 0
} = {}) => {
  const hasFrames = (Number(currentTime) || 0) > 0.05 || (Number(decodedFrames) || 0) > 0;
  return Boolean(ended) || Number(readyState) < 2 || Boolean(paused) && hasFrames;
};
const resolveLiveKickProbeState = ({ video = null } = {}) => ({
  hasVideo: Boolean(video),
  videoState: video ? {
    readyState: video.readyState,
    ended: video.ended,
    paused: video.paused,
    currentTime: video.currentTime,
    decodedFrames: video.webkitDecodedFrameCount
  } : null
});
const resolveLiveKickIfStaleAction = ({
  started,
  hass,
  config,
  previewPageActive,
  viewMode,
  visible,
  popupOpen,
  mountInProgress,
  force = false,
  streamLoadingVisible = false,
  lastLiveKick = 0,
  nowMs = Date.now(),
  isFirefox = false,
  mseConnectAt = 0,
  mseLastChunkAt = 0,
  hasVideo = false,
  videoState = null,
  kickCooldownMs = 4e3,
  mseConnectGraceMs = 12e3,
  mseChunkGraceMs = 3500
}) => {
  if (!started || !hass || !config || previewPageActive) {
    return { shouldKick: false, nextLastLiveKick: lastLiveKick };
  }
  if (viewMode === "grid" || !visible || popupOpen || mountInProgress) {
    return { shouldKick: false, nextLastLiveKick: lastLiveKick };
  }
  if (!force && streamLoadingVisible) {
    return { shouldKick: false, nextLastLiveKick: lastLiveKick };
  }
  if (!force && nowMs - lastLiveKick < kickCooldownMs) {
    return { shouldKick: false, nextLastLiveKick: lastLiveKick };
  }
  const recentMseTraffic = isFirefox && (nowMs - Number(mseConnectAt || 0) < mseConnectGraceMs || nowMs - Number(mseLastChunkAt || 0) < mseChunkGraceMs);
  if (recentMseTraffic) {
    return { shouldKick: false, nextLastLiveKick: lastLiveKick };
  }
  const stale = !hasVideo || isLiveVideoStale(videoState || {});
  return {
    shouldKick: stale,
    nextLastLiveKick: stale ? nowMs : lastLiveKick
  };
};
const resolveGraceMseReuseAction = ({
  useGo2Rtc,
  forcedType,
  graceMseEntry
}) => {
  if (!useGo2Rtc || forcedType && forcedType !== "mse") {
    return { type: "skip", graceMseEntry: null };
  }
  if (graceMseEntry?.engine) {
    return { type: "adopt-engine", graceMseEntry };
  }
  if (graceMseEntry?.promise) {
    return { type: "await-promise", graceMseEntry };
  }
  return { type: "skip", graceMseEntry: null };
};
const resolveGraceMsePendingMountOutcome = ({
  graceResult,
  mountSeq,
  mountToken
}) => {
  if (!graceResult?.engine) {
    return { type: "missing-engine" };
  }
  if (mountSeq !== mountToken) {
    return { type: "stale-token" };
  }
  return { type: "adopt-engine", engine: graceResult.engine };
};
const resolveLiveMountEntryAction = ({
  hasSlot,
  previewPageActive,
  viewMode,
  gridModeAvailable,
  entity,
  mountInProgress,
  mountTargetEntity
}) => {
  if (!hasSlot) {
    return { type: "missing-slot" };
  }
  if (previewPageActive) {
    return { type: "preview" };
  }
  if (viewMode === "grid" && gridModeAvailable) {
    return { type: "grid" };
  }
  if (!entity) {
    return { type: "missing-entity" };
  }
  if (mountInProgress && mountTargetEntity === entity) {
    return { type: "duplicate" };
  }
  return {
    type: "proceed",
    entity
  };
};
const resolveLiveMountUiState = ({ quiet = false } = {}) => {
  if (quiet) {
    return {
      activeStreamType: null,
      fallbackVisible: false,
      refreshFallbackImage: false,
      loading: false
    };
  }
  return {
    activeStreamType: "--",
    fallbackVisible: true,
    refreshFallbackImage: true,
    loading: true
  };
};
const resolveLiveMountTransportPlan = ({
  useGo2Rtc,
  forcedType,
  preferredStreamType
}) => {
  if (useGo2Rtc) {
    return {
      mode: "go2rtc",
      streamType: null
    };
  }
  return {
    mode: "ha-direct",
    streamType: forcedType || preferredStreamType
  };
};

// src/features/live/mount-result.js
const isMountTokenCurrent = ({ mountToken, mountSeq }) => mountToken === mountSeq;
const resolveGraceMseMountResult = ({ engine }) => {
  if (!engine) return false;
  return {
    ok: true,
    type: "mse",
    engine
  };
};
const cleanupStaleWinnerResult = (winner) => {
  if (!winner) return;
  if (winner?.engine?.destroy) winner.engine.destroy();
  try {
    winner?.slot?.remove?.();
  } catch (_) {
  }
};
const adoptMountedAttemptSlot = ({ targetSlot, resultSlot }) => {
  if (!targetSlot || !resultSlot) return;
  for (const child of [...targetSlot.children]) {
    if (child !== resultSlot) {
      try {
        child.remove();
      } catch (_) {
      }
    }
  }
  resultSlot.style.opacity = "1";
  resultSlot.style.pointerEvents = "auto";
  resultSlot.style.overflow = "hidden";
};
const adoptMountedAttemptResult = ({
  targetSlot,
  result,
  streamMuted,
  rotateOverlayActive,
  assignEngine,
  setEngineMountedMuted,
  setActiveStreamType,
  setStreamLoading,
  setStreamFallbackVisible,
  setLiveNativeControls
}) => {
  if (!targetSlot || !result?.slot || !result?.engine) return false;
  adoptMountedAttemptSlot({
    targetSlot,
    resultSlot: result.slot
  });
  assignEngine?.(result.engine);
  setEngineMountedMuted?.(streamMuted);
  setActiveStreamType?.(result.type);
  setStreamLoading?.(false);
  setStreamFallbackVisible?.(false);
  if (rotateOverlayActive) setLiveNativeControls?.(true);
  return true;
};
const destroyLoserAttemptResults = async ({
  activeAttempts,
  winnerType
}) => {
  for (const attempt of activeAttempts || []) {
    const result = await attempt.promise.catch(() => null);
    if (!result?.ok || result.type === winnerType) continue;
    try {
      result.engine?.destroy?.();
    } catch (_) {
    }
    try {
      result.slot?.remove?.();
    } catch (_) {
    }
  }
};

// src/features/live/fallbacks/fallback-status.js
const setFallbackStatusVisible = ({ statusEl, visible }) => {
  if (!statusEl) return;
  statusEl.hidden = !visible;
};
const hideFallbackStatus = (statusEl) => {
  setFallbackStatusVisible({
    statusEl,
    visible: false
  });
};
const showFallbackStatus = (statusEl) => {
  setFallbackStatusVisible({
    statusEl,
    visible: true
  });
};

// src/features/live/stream.state.js
const isLiveTransportType = (type) => {
  const active = String(type || "").trim().toLowerCase();
  return active === "webrtc" || active === "mse" || active === "hls";
};
const resolveActiveStreamTypeState = ({ type, lastLiveStreamHint }) => {
  const activeStreamType = type || "--";
  return {
    activeStreamType,
    lastLiveStreamHint: isLiveTransportType(activeStreamType) ? String(activeStreamType).trim().toLowerCase() : lastLiveStreamHint
  };
};
const applyStreamLoadingState = ({ shadowRoot, loading, text }) => {
  const el = shadowRoot?.querySelector?.("#stream-loading");
  if (!el) return;
  el.hidden = !loading;
  const label = el.querySelector?.(".label");
  if (label) label.textContent = text;
};
const applyStreamLoadingStateForCard = ({ card, loading, text }) => {
  if (!card) return;
  applyStreamLoadingState({
    shadowRoot: card.shadowRoot,
    loading,
    text
  });
};
const applyStreamFallbackState = ({
  shadowRoot,
  visible,
  refreshImage,
  onRefresh
}) => {
  const placeholder = shadowRoot?.querySelector?.("#stream-fallback");
  const status = shadowRoot?.querySelector?.("#stream-fallback-status");
  if (!placeholder) return;
  placeholder.hidden = !visible;
  if (!visible) hideFallbackStatus(status);
  if (visible && refreshImage) onRefresh?.();
};
const applyStreamFallbackVisibility = ({
  shadowRoot,
  visible,
  refreshImage,
  refreshFallbackImage
}) => {
  applyStreamFallbackState({
    shadowRoot,
    visible,
    refreshImage,
    onRefresh: () => refreshFallbackImage?.()
  });
};
const applyStreamFallbackVisibilityForCard = ({
  card,
  visible,
  refreshImage
}) => {
  if (!card) return;
  applyStreamFallbackVisibility({
    shadowRoot: card.shadowRoot,
    visible,
    refreshImage,
    refreshFallbackImage: () => card._refreshStreamFallbackImage?.()
  });
};
const applyActiveStreamTypeForCard = ({ card, type }) => {
  if (!card) return;
  const nextState = resolveActiveStreamTypeState({
    type,
    lastLiveStreamHint: card._lastLiveStreamHint
  });
  card._activeStreamType = nextState.activeStreamType;
  card._lastLiveStreamHint = nextState.lastLiveStreamHint;
  card._renderStats?.();
};
const resolveSnapshotFallbackState = ({
  refreshImage = false
} = {}) => ({
  activeStreamType: "snapshot",
  loading: false,
  fallbackVisible: true,
  refreshFallbackImage: refreshImage === true
});

// src/features/live/rotate-overlay-state.js
const resolveRotateOverlayTargetMode = ({
  isMobileTabletViewport = false,
  isLandscapeViewport = false,
  popupOpen = false,
  popupMediaVisible = false
}) => {
  const rotateEligible = Boolean(isMobileTabletViewport && isLandscapeViewport);
  if (!rotateEligible) return "none";
  if (popupMediaVisible) return "popup";
  if (!popupOpen) return "live";
  return "none";
};
const resolveRotateOverlayState = ({
  isMobileTabletViewport = false,
  isLandscapeViewport = false,
  popupOpen = false,
  popupMediaVisible = false,
  currentMode = "none",
  isActive = false
}) => {
  const nextMode = resolveRotateOverlayTargetMode({
    isMobileTabletViewport,
    isLandscapeViewport,
    popupOpen,
    popupMediaVisible
  });
  if (nextMode === "live") {
    return {
      action: "activate-live",
      active: true,
      fromPopup: currentMode === "popup",
      mode: "live",
      nextMode
    };
  }
  if (nextMode === "popup") {
    return {
      action: "activate-popup",
      active: true,
      fromLive: currentMode === "live",
      mode: "popup",
      nextMode
    };
  }
  if (!isActive) {
    return {
      action: "idle",
      active: false,
      mode: "none",
      nextMode
    };
  }
  return {
    action: "deactivate",
    active: false,
    exitMode: currentMode,
    mode: "none",
    nextMode
  };
};
const resolveFullscreenButtonVisibility = ({
  popupOpen = false,
  isFullscreen = false,
  inGridMode = false,
  rotateOverlayMode = "none"
}) => {
  const popupRotateActive = rotateOverlayMode === "popup";
  return {
    liveButtonHidden: Boolean(
      popupOpen || isFullscreen || inGridMode || popupRotateActive
    ),
    popupControlsFullscreenHidden: Boolean(popupRotateActive)
  };
};
const resolveRotateOverlayUiPlan = ({
  action = "idle",
  mode = "none",
  active = false,
  fromPopup = false,
  fromLive = false,
  exitMode = "none"
}) => {
  if (action === "activate-live") {
    return {
      active,
      mode,
      removeClasses: [
        "mobile-rotate-live-exit",
        "mobile-rotate-popup",
        "mobile-rotate-popup-exit"
      ],
      addClasses: ["mobile-rotate-live"],
      disableNativeControls: Boolean(fromPopup),
      enableNativeControls: true,
      clearLiveControlsVisible: false,
      clearLoading: true,
      syncFullscreenButtons: true,
      showLiveControls: true,
      showPopupControls: true,
      retainViewportCover: true
    };
  }
  if (action === "activate-popup") {
    return {
      active,
      mode,
      removeClasses: [
        "mobile-rotate-popup-exit",
        "mobile-rotate-live",
        "mobile-rotate-live-exit"
      ],
      addClasses: ["mobile-rotate-popup"],
      disableNativeControls: Boolean(fromLive),
      enableNativeControls: false,
      clearLiveControlsVisible: true,
      clearLoading: false,
      syncFullscreenButtons: true,
      showLiveControls: false,
      showPopupControls: true,
      retainViewportCover: true
    };
  }
  if (action === "idle") {
    return {
      active,
      mode,
      removeClasses: [
        "mobile-rotate-live",
        "mobile-rotate-live-exit",
        "mobile-rotate-popup",
        "mobile-rotate-popup-exit"
      ],
      addClasses: [],
      disableNativeControls: false,
      enableNativeControls: false,
      clearLiveControlsVisible: true,
      clearLoading: false,
      syncFullscreenButtons: false,
      showLiveControls: false,
      showPopupControls: false,
      retainViewportCover: false
    };
  }
  return {
    active,
    mode,
    removeClasses: ["mobile-rotate-live", "mobile-rotate-popup"],
    addClasses: [
      exitMode === "popup" ? "mobile-rotate-popup-exit" : "mobile-rotate-live-exit"
    ],
    disableNativeControls: exitMode === "live",
    enableNativeControls: false,
    clearLiveControlsVisible: false,
    clearLoading: false,
    syncFullscreenButtons: true,
    showLiveControls: false,
    showPopupControls: true,
    retainViewportCover: true
  };
};
const resolveRotateOverlayExitPlan = ({ action = "idle" } = {}) => {
  if (action !== "deactivate") {
    return {
      shouldSchedule: false,
      delayMs: 0,
      removeClasses: [],
      syncFullscreenButtons: false,
      releaseViewportCover: false
    };
  }
  return {
    shouldSchedule: true,
    delayMs: 260,
    removeClasses: ["mobile-rotate-live-exit", "mobile-rotate-popup-exit"],
    syncFullscreenButtons: true,
    releaseViewportCover: true
  };
};
const resolveRotateOverlayNativeControlsPlan = ({
  enabled = false
}) => ({
  expectedActive: Boolean(enabled),
  clearAudioSyncFirst: !enabled,
  clearFullscreenStyleFirst: !enabled,
  applyFullscreenStyle: Boolean(enabled),
  bindAudioSync: Boolean(enabled),
  retryDelaysMs: [120, 420, 900]
});
const resolveRotateOverlayViewportVariables = ({
  visualViewport = null,
  innerWidth = 0,
  innerHeight = 0
}) => {
  const width = Math.max(
    1,
    Math.round(visualViewport?.width || innerWidth || 0)
  );
  const height = Math.max(
    1,
    Math.round(visualViewport?.height || innerHeight || 0)
  );
  const offsetLeft = Math.round(visualViewport?.offsetLeft || 0);
  const offsetTop = Math.round(visualViewport?.offsetTop || 0);
  return {
    widthPx: `${width}px`,
    heightPx: `${height}px`,
    offsetLeftPx: `${offsetLeft}px`,
    offsetTopPx: `${offsetTop}px`
  };
};

// src/shared/cleanup.js
const CleanupController = class {
  constructor() {
    this._abortController = new AbortController();
    this._cleanups = [];
    this._disposed = false;
  }
  get signal() {
    return this._abortController.signal;
  }
  addEventListener(target, type, listener, options = {}) {
    if (this._disposed || !target?.addEventListener || !listener) return;
    const normalizedOptions = typeof options === "boolean" ? { capture: options } : { ...options };
    target.addEventListener(type, listener, {
      ...normalizedOptions,
      signal: this.signal
    });
  }
  addCleanup(cleanup) {
    if (typeof cleanup !== "function") return;
    if (this._disposed) {
      try {
        cleanup();
      } catch (_) {
      }
      return;
    }
    this._cleanups.push(cleanup);
  }
  dispose() {
    if (this._disposed) return;
    this._disposed = true;
    this._abortController.abort();
    for (const cleanup of this._cleanups.splice(0).reverse()) {
      try {
        cleanup();
      } catch (_) {
      }
    }
  }
};

// src/shared/media/video-zoom.ctrl.js
const VIDEO_ZOOM_MIN = 1;
const VIDEO_ZOOM_DOUBLE_TAP = 2;
const VIDEO_ZOOM_MAX = 3;
const VIDEO_ZOOM_WHEEL_STEP = 0.2;
const DOUBLE_TAP_DELAY_MS = 320;
const DOUBLE_TAP_DISTANCE_PX = 28;
const MOVE_TOLERANCE_PX = 8;
const EPSILON = 1e-3;
function clampVideoZoom(value, min = VIDEO_ZOOM_MIN, max = VIDEO_ZOOM_MAX) {
  return Math.min(max, Math.max(min, Number(value) || min));
}
function clampVideoPan({
  x,
  y,
  scale,
  width,
  height
}) {
  const safeScale = clampVideoZoom(scale);
  if (safeScale <= VIDEO_ZOOM_MIN + EPSILON) {
    return { x: 0, y: 0 };
  }
  const safeWidth = Math.max(0, Number(width) || 0);
  const safeHeight = Math.max(0, Number(height) || 0);
  return {
    x: Math.min(0, Math.max(safeWidth - safeWidth * safeScale, Number(x) || 0)),
    y: Math.min(
      0,
      Math.max(safeHeight - safeHeight * safeScale, Number(y) || 0)
    )
  };
}
function zoomVideoAroundPoint({
  currentScale,
  nextScale,
  x,
  y,
  focalX,
  focalY,
  width,
  height
}) {
  const fromScale = clampVideoZoom(currentScale);
  const toScale = clampVideoZoom(nextScale);
  if (toScale <= VIDEO_ZOOM_MIN + EPSILON) {
    return { scale: VIDEO_ZOOM_MIN, x: 0, y: 0 };
  }
  const ratio = toScale / fromScale;
  const nextPan = clampVideoPan({
    x: focalX - (focalX - x) * ratio,
    y: focalY - (focalY - y) * ratio,
    scale: toScale,
    width,
    height
  });
  return { scale: toScale, ...nextPan };
}
function distanceBetween(first, second) {
  return Math.hypot(
    Number(second?.clientX || 0) - Number(first?.clientX || 0),
    Number(second?.clientY || 0) - Number(first?.clientY || 0)
  );
}
function midpointBetween(first, second) {
  return {
    clientX: (Number(first?.clientX || 0) + Number(second?.clientX || 0)) / 2,
    clientY: (Number(first?.clientY || 0) + Number(second?.clientY || 0)) / 2
  };
}
function styleSnapshot(style, property) {
  return {
    value: style?.getPropertyValue?.(property) || "",
    priority: style?.getPropertyPriority?.(property) || ""
  };
}
function restoreStyle(style, property, snapshot) {
  if (!style?.setProperty) return;
  if (!snapshot?.value) {
    style.removeProperty?.(property);
    return;
  }
  style.setProperty(property, snapshot.value, snapshot.priority);
}
const VideoZoomController = class {
  constructor(video, options = {}) {
    __publicField(this, "_onWheel", (event) => {
      const direction = Math.sign(Number(event.deltaY) || 0);
      if (!direction) return;
      const nextScale = clampVideoZoom(
        this._scale - direction * VIDEO_ZOOM_WHEEL_STEP,
        VIDEO_ZOOM_MIN,
        this._maxScale
      );
      if (nextScale === this._scale && this._scale <= VIDEO_ZOOM_MIN + EPSILON && direction > 0) {
        return;
      }
      event.preventDefault?.();
      if (nextScale === this._scale) return;
      this.zoomTo(nextScale, event.clientX, event.clientY);
    });
    __publicField(this, "_onDoubleClick", (event) => {
      if (Date.now() - this._lastTouchZoomAt < 500) return;
      event.preventDefault?.();
      this.toggleDoubleZoom(event.clientX, event.clientY);
    });
    __publicField(this, "_onPointerDown", (event) => {
      const point = this._pointForEvent(event);
      if (point.pointerType === "mouse" && Number(event.button) !== 0) return;
      this._pointers.set(point.pointerId, point);
      const touchPoints = [...this._pointers.values()].filter(
        (candidate) => candidate.pointerType === "touch"
      );
      if (touchPoints.length >= 2) {
        event.preventDefault?.();
        this._startPinch();
        return;
      }
      if (this._scale > VIDEO_ZOOM_MIN + EPSILON) {
        event.preventDefault?.();
        this._startPan(point);
      }
    });
    __publicField(this, "_onPointerMove", (event) => {
      const point = this._pointers.get(event.pointerId);
      if (!point) return;
      point.clientX = Number(event.clientX) || 0;
      point.clientY = Number(event.clientY) || 0;
      if (Math.hypot(point.clientX - point.startX, point.clientY - point.startY) > MOVE_TOLERANCE_PX) {
        point.moved = true;
      }
      if (this._pinch) {
        const first = this._pointers.get(this._pinch.pointerIds[0]);
        const second = this._pointers.get(this._pinch.pointerIds[1]);
        if (!first || !second) return;
        event.preventDefault?.();
        const midpoint = midpointBetween(first, second);
        const bounds2 = this._bounds();
        const scale = clampVideoZoom(
          this._pinch.scale * (distanceBetween(first, second) / this._pinch.distance),
          VIDEO_ZOOM_MIN,
          this._maxScale
        );
        const pan2 = clampVideoPan({
          x: midpoint.clientX - bounds2.left - this._pinch.contentX * scale,
          y: midpoint.clientY - bounds2.top - this._pinch.contentY * scale,
          scale,
          width: bounds2.width,
          height: bounds2.height
        });
        this._scale = scale;
        this._x = pan2.x;
        this._y = pan2.y;
        this._apply();
        return;
      }
      if (!this._pan || this._pan.pointerId !== event.pointerId) return;
      event.preventDefault?.();
      const bounds = this._bounds();
      const pan = clampVideoPan({
        x: this._pan.startX + point.clientX - this._pan.startClientX,
        y: this._pan.startY + point.clientY - this._pan.startClientY,
        scale: this._scale,
        width: bounds.width,
        height: bounds.height
      });
      this._x = pan.x;
      this._y = pan.y;
      this._apply();
    });
    __publicField(this, "_onPointerUp", (event) => {
      this._finishPointer(event, false);
    });
    __publicField(this, "_onPointerCancel", (event) => {
      this._finishPointer(event, true);
    });
    __publicField(this, "_onLoadStart", () => {
      this.reset();
    });
    this._video = video;
    this._host = options.host || video?.parentElement || null;
    this._maxScale = Math.max(
      VIDEO_ZOOM_DOUBLE_TAP,
      Number(options.maxScale) || VIDEO_ZOOM_MAX
    );
    this._cleanup = new CleanupController();
    this._pointers = new Map();
    this._scale = VIDEO_ZOOM_MIN;
    this._x = 0;
    this._y = 0;
    this._pan = null;
    this._pinch = null;
    this._lastTap = null;
    this._lastTouchZoomAt = 0;
    this._bound = false;
    this._styleSnapshots = null;
    this._hostOverflowSnapshot = null;
    this._resizeObserver = null;
  }
  get video() {
    return this._video;
  }
  get state() {
    return {
      scale: this._scale,
      x: this._x,
      y: this._y
    };
  }
  bind() {
    if (this._bound || !this._video || !this._host) return this;
    this._bound = true;
    this._styleSnapshots = {
      transform: styleSnapshot(this._video.style, "transform"),
      transformOrigin: styleSnapshot(this._video.style, "transform-origin"),
      cursor: styleSnapshot(this._video.style, "cursor"),
      touchAction: styleSnapshot(this._video.style, "touch-action"),
      willChange: styleSnapshot(this._video.style, "will-change"),
      userSelect: styleSnapshot(this._video.style, "user-select")
    };
    this._hostOverflowSnapshot = styleSnapshot(this._host.style, "overflow");
    this._video.style?.setProperty?.("transform-origin", "0 0", "important");
    this._video.style?.setProperty?.("touch-action", "none");
    this._video.style?.setProperty?.("will-change", "transform");
    this._video.style?.setProperty?.("user-select", "none");
    this._host.style?.setProperty?.("overflow", "hidden");
    this._cleanup.addEventListener(this._video, "wheel", this._onWheel, {
      passive: false
    });
    this._cleanup.addEventListener(this._video, "dblclick", this._onDoubleClick);
    this._cleanup.addEventListener(
      this._video,
      "pointerdown",
      this._onPointerDown,
      { passive: false }
    );
    this._cleanup.addEventListener(
      this._video,
      "pointermove",
      this._onPointerMove,
      { passive: false }
    );
    this._cleanup.addEventListener(this._video, "pointerup", this._onPointerUp);
    this._cleanup.addEventListener(
      this._video,
      "pointercancel",
      this._onPointerCancel
    );
    this._cleanup.addEventListener(this._video, "loadstart", this._onLoadStart);
    const ResizeObserverCtor = typeof ResizeObserver !== "undefined" ? ResizeObserver : null;
    if (ResizeObserverCtor) {
      this._resizeObserver = new ResizeObserverCtor(() => this.refresh());
      this._resizeObserver.observe(this._host);
      this._cleanup.addCleanup(() => this._resizeObserver?.disconnect?.());
    }
    this.refresh();
    return this;
  }
  dispose() {
    if (!this._bound) return;
    this.reset();
    this._cleanup.dispose();
    this._bound = false;
    restoreStyle(
      this._video.style,
      "transform",
      this._styleSnapshots?.transform
    );
    restoreStyle(
      this._video.style,
      "transform-origin",
      this._styleSnapshots?.transformOrigin
    );
    restoreStyle(this._video.style, "cursor", this._styleSnapshots?.cursor);
    restoreStyle(
      this._video.style,
      "touch-action",
      this._styleSnapshots?.touchAction
    );
    restoreStyle(
      this._video.style,
      "will-change",
      this._styleSnapshots?.willChange
    );
    restoreStyle(
      this._video.style,
      "user-select",
      this._styleSnapshots?.userSelect
    );
    restoreStyle(this._host.style, "overflow", this._hostOverflowSnapshot);
    this._pointers.clear();
  }
  reset() {
    this._scale = VIDEO_ZOOM_MIN;
    this._x = 0;
    this._y = 0;
    this._pan = null;
    this._pinch = null;
    this._pointers.clear();
    this._apply();
  }
  refresh() {
    const bounds = this._bounds();
    const pan = clampVideoPan({
      x: this._x,
      y: this._y,
      scale: this._scale,
      width: bounds.width,
      height: bounds.height
    });
    this._x = pan.x;
    this._y = pan.y;
    this._apply();
  }
  zoomTo(nextScale, clientX, clientY) {
    const bounds = this._bounds();
    const focalX = Number(clientX) - bounds.left;
    const focalY = Number(clientY) - bounds.top;
    const next = zoomVideoAroundPoint({
      currentScale: this._scale,
      nextScale: clampVideoZoom(
        nextScale,
        VIDEO_ZOOM_MIN,
        this._maxScale
      ),
      x: this._x,
      y: this._y,
      focalX,
      focalY,
      width: bounds.width,
      height: bounds.height
    });
    this._scale = next.scale;
    this._x = next.x;
    this._y = next.y;
    this._apply();
  }
  toggleDoubleZoom(clientX, clientY) {
    if (this._scale > VIDEO_ZOOM_MIN + EPSILON) {
      this.reset();
      return;
    }
    this.zoomTo(VIDEO_ZOOM_DOUBLE_TAP, clientX, clientY);
  }
  _bounds() {
    const rect = this._host?.getBoundingClientRect?.() || {};
    return {
      left: Number(rect.left) || 0,
      top: Number(rect.top) || 0,
      width: Number(this._host?.clientWidth) || Number(rect.width) || Number(this._video?.offsetWidth) || 0,
      height: Number(this._host?.clientHeight) || Number(rect.height) || Number(this._video?.offsetHeight) || 0
    };
  }
  _apply() {
    const transform = this._scale <= VIDEO_ZOOM_MIN + EPSILON ? "translate3d(0px, 0px, 0) scale(1)" : `translate3d(${this._x}px, ${this._y}px, 0) scale(${this._scale})`;
    this._video?.style?.setProperty?.("transform", transform, "important");
    const cursor = this._pan ? "grabbing" : this._scale > VIDEO_ZOOM_MIN + EPSILON ? "grab" : "zoom-in";
    this._video?.style?.setProperty?.("cursor", cursor);
    this._video?.classList?.toggle?.(
      "fvc-video-zoomed",
      this._scale > VIDEO_ZOOM_MIN + EPSILON
    );
  }
  _pointForEvent(event) {
    return {
      pointerId: event.pointerId,
      pointerType: String(event.pointerType || "").toLowerCase(),
      clientX: Number(event.clientX) || 0,
      clientY: Number(event.clientY) || 0,
      startX: Number(event.clientX) || 0,
      startY: Number(event.clientY) || 0,
      startedAt: Date.now(),
      moved: false
    };
  }
  _startPan(point) {
    this._pan = {
      pointerId: point.pointerId,
      startClientX: point.clientX,
      startClientY: point.clientY,
      startX: this._x,
      startY: this._y
    };
    this._video?.setPointerCapture?.(point.pointerId);
    this._apply();
  }
  _startPinch() {
    const points = [...this._pointers.values()].filter(
      (point) => point.pointerType === "touch"
    );
    if (points.length < 2) return;
    const first = points[0];
    const second = points[1];
    const midpoint = midpointBetween(first, second);
    const bounds = this._bounds();
    this._pinch = {
      pointerIds: [first.pointerId, second.pointerId],
      distance: Math.max(1, distanceBetween(first, second)),
      scale: this._scale,
      contentX: (midpoint.clientX - bounds.left - this._x) / this._scale,
      contentY: (midpoint.clientY - bounds.top - this._y) / this._scale
    };
    this._pan = null;
  }
  _finishPointer(event, cancelled = false) {
    const point = this._pointers.get(event.pointerId);
    if (!point) return;
    const wasPinching = !!this._pinch;
    this._pointers.delete(event.pointerId);
    this._video?.releasePointerCapture?.(event.pointerId);
    if (this._pinch?.pointerIds.includes(event.pointerId)) {
      this._pinch = null;
      this._lastTouchZoomAt = Date.now();
    }
    if (this._pan?.pointerId === event.pointerId) {
      this._pan = null;
    }
    const remainingTouches = [...this._pointers.values()].filter(
      (candidate) => candidate.pointerType === "touch"
    );
    if (remainingTouches.length === 1 && this._scale > VIDEO_ZOOM_MIN + EPSILON) {
      remainingTouches[0].moved = true;
      this._startPan(remainingTouches[0]);
    }
    if (!cancelled && !wasPinching && point.pointerType === "touch" && !point.moved) {
      const now = Date.now();
      const currentTap = {
        clientX: Number(event.clientX) || point.clientX,
        clientY: Number(event.clientY) || point.clientY,
        at: now
      };
      if (this._lastTap && now - this._lastTap.at <= DOUBLE_TAP_DELAY_MS && distanceBetween(this._lastTap, currentTap) <= DOUBLE_TAP_DISTANCE_PX) {
        event.preventDefault?.();
        this._lastTap = null;
        this._lastTouchZoomAt = now;
        this.toggleDoubleZoom(currentTap.clientX, currentTap.clientY);
      } else {
        this._lastTap = currentTap;
      }
    }
    this._apply();
  }
};
function attachVideoZoom(video, options = {}) {
  if (!video) return null;
  return new VideoZoomController(video, options).bind();
}

// src/shared/media/playback-target.js
const PLAYBACK_TARGET_AIRPLAY = "airplay";
const DEFAULT_SOURCE_TTL_MS = 5 * 60 * 1e3;
const MAX_CACHED_SOURCES = 12;
function resolveBrowserPlaybackTargetSupport({
  video = null,
  windowObj = globalThis.window
} = {}) {
  return {
    airplay: typeof video?.webkitShowPlaybackTargetPicker === "function" || typeof windowObj?.HTMLVideoElement?.prototype?.webkitShowPlaybackTargetPicker === "function"
  };
}
function configureReceiverVideo(video, source) {
  if (!video || !source?.url) return false;
  video.preload = "none";
  video.playsInline = true;
  video.controls = false;
  video.disableRemotePlayback = false;
  video.setAttribute?.("playsinline", "");
  video.setAttribute?.("webkit-playsinline", "");
  video.setAttribute?.("x-webkit-airplay", "allow");
  if (video.src !== source.url) {
    video.src = source.url;
  }
  return true;
}
function promptAirPlayVideo(video) {
  const prompt = video?.webkitShowPlaybackTargetPicker;
  if (typeof prompt !== "function") return false;
  try {
    video.load?.();
    prompt.call(video);
    return true;
  } catch (_) {
    return false;
  }
}
function clearBrowserMediaSession(navigatorObj = globalThis.navigator) {
  const mediaSession = navigatorObj?.mediaSession;
  if (!mediaSession) return false;
  try {
    mediaSession.playbackState = "none";
    mediaSession.metadata = null;
    return true;
  } catch (_) {
    return false;
  }
}
const BrowserPlaybackTargetController = class {
  constructor({
    getContext,
    resolveSource,
    getMount,
    createVideo = () => globalThis.document?.createElement?.("video"),
    promptAirPlay = (video) => promptAirPlayVideo(video),
    getWindow = () => globalThis.window,
    getNavigator = () => globalThis.navigator,
    getNowMs = () => Date.now(),
    onStatus = () => {
    }
  } = {}) {
    this._getContext = getContext;
    this._resolveSource = resolveSource;
    this._getMount = getMount;
    this._createVideo = createVideo;
    this._promptAirPlay = promptAirPlay;
    this._getWindow = getWindow;
    this._getNavigator = getNavigator;
    this._getNowMs = getNowMs;
    this._onStatus = onStatus;
    this._sources = new Map();
    this._sourceInFlight = new Map();
    this._videos = new Map();
  }
  _contextForScope(scope) {
    const context = this._getContext?.(scope) || {};
    const sourceKey = String(context.sourceKey || "").trim();
    return sourceKey ? { ...context, scope, sourceKey } : null;
  }
  _videoForScope(scope) {
    const existing = this._videos.get(scope);
    if (existing) {
      if (existing.video.isConnected === false) {
        this._getMount?.()?.appendChild?.(existing.video);
      }
      return existing.video;
    }
    const video = this._createVideo?.();
    if (!video) return null;
    video.className = "fvc-receiver-video";
    if (video.style) {
      video.style.cssText = "position:fixed;left:-10000px;top:-10000px;width:1px;height:1px;opacity:0;pointer-events:none";
    }
    const playOnWirelessTarget = () => {
      if (video.webkitCurrentPlaybackTargetIsWireless !== true) return;
      video.play?.().catch?.(() => {
      });
    };
    const releaseOnTerminal = () => this._releaseVideo(scope);
    const onWirelessTargetChanged = () => {
      if (video.webkitCurrentPlaybackTargetIsWireless === true) {
        playOnWirelessTarget();
        return;
      }
      this._releaseVideo(scope);
    };
    video.addEventListener?.(
      "webkitcurrentplaybacktargetiswirelesschanged",
      onWirelessTargetChanged
    );
    video.addEventListener?.("loadedmetadata", playOnWirelessTarget);
    video.addEventListener?.("canplay", playOnWirelessTarget);
    video.addEventListener?.("ended", releaseOnTerminal);
    video.addEventListener?.("error", releaseOnTerminal);
    this._getMount?.()?.appendChild?.(video);
    this._videos.set(scope, {
      video,
      onWirelessTargetChanged,
      playOnWirelessTarget,
      releaseOnTerminal
    });
    return video;
  }
  _releaseVideo(scope) {
    const entry = this._videos.get(scope);
    if (!entry) return;
    const wasWireless = entry.video.webkitCurrentPlaybackTargetIsWireless === true;
    const {
      video,
      onWirelessTargetChanged,
      playOnWirelessTarget,
      releaseOnTerminal
    } = entry;
    video.removeEventListener?.(
      "webkitcurrentplaybacktargetiswirelesschanged",
      onWirelessTargetChanged
    );
    video.removeEventListener?.("loadedmetadata", playOnWirelessTarget);
    video.removeEventListener?.("canplay", playOnWirelessTarget);
    video.removeEventListener?.("ended", releaseOnTerminal);
    video.removeEventListener?.("error", releaseOnTerminal);
    try {
      video.pause?.();
      video.disableRemotePlayback = true;
      video.setAttribute?.("x-webkit-airplay", "deny");
      if ("srcObject" in video) video.srcObject = null;
      video.removeAttribute?.("src");
      video.load?.();
    } catch (_) {
    }
    video.remove?.();
    this._videos.delete(scope);
    if (wasWireless) {
      clearBrowserMediaSession(this._getNavigator?.());
    }
  }
  getSupport() {
    return resolveBrowserPlaybackTargetSupport({
      windowObj: this._getWindow?.()
    });
  }
  _freshSource(sourceKey) {
    const entry = this._sources.get(sourceKey);
    if (!entry || entry.expiresAt <= this._getNowMs()) {
      this._sources.delete(sourceKey);
      return null;
    }
    return entry.source;
  }
  prepare(scope = "popup", { notifyErrors = false } = {}) {
    const context = this._contextForScope(scope);
    if (!context) return Promise.resolve(null);
    const cached = this._freshSource(context.sourceKey);
    if (cached) return Promise.resolve(cached);
    const current = this._sourceInFlight.get(context.sourceKey);
    if (current) return current;
    const pending = Promise.resolve(this._resolveSource?.(context)).then((source) => {
      if (!source?.url) {
        throw new Error(
          source?.message || "A receiver-compatible video URL is unavailable."
        );
      }
      this._sources.set(context.sourceKey, {
        source,
        expiresAt: this._getNowMs() + (Number(source.ttlMs) || DEFAULT_SOURCE_TTL_MS)
      });
      while (this._sources.size > MAX_CACHED_SOURCES) {
        this._sources.delete(this._sources.keys().next().value);
      }
      return source;
    }).catch((error) => {
      if (notifyErrors) {
        this._onStatus?.(
          error?.message || "The video could not be prepared for playback."
        );
      }
      return null;
    }).finally(() => {
      this._sourceInFlight.delete(context.sourceKey);
    });
    this._sourceInFlight.set(context.sourceKey, pending);
    return pending;
  }
  prompt(target, { scope = "popup" } = {}) {
    if (target !== PLAYBACK_TARGET_AIRPLAY) return Promise.resolve(false);
    const context = this._contextForScope(scope);
    const source = context ? this._freshSource(context.sourceKey) : null;
    if (!source) {
      void this.prepare(scope, { notifyErrors: true });
      this._onStatus?.(
        "Preparing video for AirPlay. Tap again in a moment."
      );
      return Promise.resolve(false);
    }
    const video = this._videoForScope(scope);
    configureReceiverVideo(video, source);
    const prompted = this._promptAirPlay?.(video) === true;
    if (!prompted) {
      this._onStatus?.("AirPlay is not supported in this browser.");
    }
    return Promise.resolve(prompted);
  }
  release(scope = "") {
    if (scope) {
      this._releaseVideo(scope);
      return;
    }
    for (const activeScope of [...this._videos.keys()]) {
      this._releaseVideo(activeScope);
    }
  }
  dispose() {
    this.release();
    this._sources.clear();
    this._sourceInFlight.clear();
  }
};

// src/integrations/frigate/receiver-media.js
const encodePathPart = (value) => encodeURIComponent(String(value || ""));
function buildFrigateReceiverMediaPath({
  mediaType = "",
  clientId = "",
  camera = "",
  eventId = "",
  recordingStart = null,
  recordingEnd = null,
  eventRecordingStart = null,
  eventRecordingEnd = null
} = {}) {
  const normalizedType = String(mediaType || "").toLowerCase();
  const encodedClientId = encodePathPart(clientId);
  if (!encodedClientId) {
    return {
      ok: false,
      message: "The Frigate client is not available for this video."
    };
  }
  if (normalizedType === "recording") {
    const start = Number(recordingStart);
    const end = Number(recordingEnd);
    if (!camera || !Number.isFinite(start) || !Number.isFinite(end) || end <= start) {
      return {
        ok: false,
        message: "The recording range is not ready to send."
      };
    }
    return {
      ok: true,
      path: `/api/frigate/${encodedClientId}/recording/${encodePathPart(camera)}/start/${start}/end/${end}`,
      contentType: "video/mp4"
    };
  }
  if (!["alert", "clip", "kept"].includes(normalizedType) || !eventId) {
    return {
      ok: false,
      message: "Only clips, alerts, kept clips, and recordings can be sent."
    };
  }
  const eventStart = Number(eventRecordingStart);
  const eventEnd = Number(eventRecordingEnd);
  if (camera && Number.isFinite(eventStart) && Number.isFinite(eventEnd) && eventEnd > eventStart) {
    return {
      ok: true,
      path: `/api/frigate/${encodedClientId}/recording/${encodePathPart(camera)}/start/${eventStart}/end/${eventEnd}`,
      contentType: "video/mp4"
    };
  }
  return {
    ok: true,
    path: `/api/frigate/${encodedClientId}/notifications/${encodePathPart(eventId)}/clip.mp4`,
    contentType: "video/mp4"
  };
}

// src/integrations/home-assistant/receiver-source.js
function resolveAbsoluteReceiverSourceUrl(sourceUrl = "", baseUrl = "") {
  const normalized = String(sourceUrl || "").trim();
  if (!normalized || normalized.startsWith("blob:")) return "";
  try {
    return new URL(normalized, baseUrl).href;
  } catch (_) {
    return "";
  }
}

// src/features/live/fallbacks/fallback-url.js
const isAbsoluteOrDataUrl = (url) => /^https?:\/\//i.test(url) || String(url || "").startsWith("data:");
const FALLBACK_SIGNED_URL_TTL_MS = 55 * 60 * 1e3;
const toAbsoluteLocalUrl = ({ url, origin }) => {
  if (!url) return "";
  return isAbsoluteOrDataUrl(url) ? url : `${origin}${url}`;
};
const appendCacheBustParam = (url, cacheBustValue, key = "fvc_snapshot") => {
  const source = String(url || "");
  if (!source) return "";
  const token = String(cacheBustValue || Date.now());
  const hashIndex = source.indexOf("#");
  const base = hashIndex >= 0 ? source.slice(0, hashIndex) : source;
  const hash = hashIndex >= 0 ? source.slice(hashIndex) : "";
  const separator = base.includes("?") ? "&" : "?";
  return `${base}${separator}${encodeURIComponent(key)}=${encodeURIComponent(token)}${hash}`;
};
const getCachedEntityUrl = ({ cacheMap, entity, nowMs }) => {
  const cached = cacheMap?.get?.(entity);
  if (cached && cached.url && cached.exp > nowMs) return cached.url;
  return "";
};
const setCachedEntityUrl = ({ cacheMap, entity, url, ttlMs, nowMs }) => {
  if (!cacheMap || !entity || !url) return;
  cacheMap.set(entity, {
    url,
    exp: nowMs + ttlMs
  });
};
const resolveSignedFallbackUrl = async ({
  entity,
  canCallWs,
  signedPathResolver,
  cacheMap,
  nowMs,
  origin,
  ttlMs = FALLBACK_SIGNED_URL_TTL_MS
}) => {
  if (!entity) return "";
  if (!canCallWs) return "";
  const cached = getCachedEntityUrl({
    cacheMap,
    entity,
    nowMs
  });
  if (cached) return cached;
  const basePath = `/api/camera_proxy/${entity}`;
  const signedPath = await signedPathResolver(basePath);
  const abs = toAbsoluteLocalUrl({
    url: signedPath,
    origin
  });
  setCachedEntityUrl({
    cacheMap,
    entity,
    url: abs,
    ttlMs,
    nowMs
  });
  return abs;
};
const resolveEntityPictureFallbackUrl = ({
  entity,
  stateMap,
  origin
}) => {
  if (!entity) return "";
  const state = stateMap?.[entity];
  const pic = state?.attributes?.entity_picture || "";
  if (!pic) return "";
  return toAbsoluteLocalUrl({
    url: pic,
    origin
  });
};
const createFallbackSourceResolvers = ({
  canCallWs,
  signedPathResolver,
  cacheMap,
  stateMap,
  origin,
  ttlMs = FALLBACK_SIGNED_URL_TTL_MS,
  nowMsProvider = () => Date.now()
}) => ({
  loadPrimary: async (entity) => await resolveSignedFallbackUrl({
    entity,
    canCallWs,
    signedPathResolver,
    cacheMap,
    nowMs: nowMsProvider(),
    origin,
    ttlMs
  }),
  loadAlt: (entity) => resolveEntityPictureFallbackUrl({
    entity,
    stateMap,
    origin
  })
});
const resolveFallbackOrigin = ({ origin, defaultOrigin }) => origin || defaultOrigin || "";
const resolveFallbackOriginForCard = ({ card, origin }) => resolveFallbackOrigin({
  origin,
  defaultOrigin: card?._fallbackOrigin
});
const createFallbackSourceResolversForCard = ({ card, origin }) => {
  const resolvedOrigin = resolveFallbackOriginForCard({ card, origin });
  if (!card) {
    return {
      loadPrimary: async () => "",
      loadAlt: () => ""
    };
  }
  return createFallbackSourceResolvers({
    canCallWs: !!card._hass?.callWS,
    signedPathResolver: async (path) => await card._signed(path),
    cacheMap: card._fallbackImgUrlCache,
    stateMap: card._hass?.states,
    origin: resolvedOrigin
  });
};
const resolveFallbackSourceResolversForCard = createFallbackSourceResolversForCard;
const withFallbackSourceResolversForCard = ({ card, origin, run }) => run(
  resolveFallbackSourceResolversForCard({
    card,
    origin
  })
);
const loadFallbackPrimaryForCard = async ({ card, entity, origin }) => {
  return withFallbackSourceResolversForCard({
    card,
    origin,
    run: async (resolvers) => resolvers.loadPrimary(entity)
  });
};
const loadFallbackAltForCard = ({ card, entity, origin }) => {
  return withFallbackSourceResolversForCard({
    card,
    origin,
    run: (resolvers) => resolvers.loadAlt(entity)
  });
};

// src/features/live/fallbacks/fallback-image.js
const resolveFallbackDisplaySource = ({ primarySrc, altSrc }) => primarySrc || altSrc || "";
const resolveFallbackObjectFit = ({
  naturalWidth,
  naturalHeight,
  containerWidth,
  containerHeight
}) => {
  const w = Number(naturalWidth) || 0;
  const h = Number(naturalHeight) || 0;
  const ar = h > 0 ? w / h : 0;
  const cw = Number(containerWidth) || 0;
  const ch = Number(containerHeight) || 0;
  const car = ch > 0 ? cw / ch : 0;
  const near169 = ar > 0 && Math.abs(ar - 16 / 9) < 0.08;
  const nearPanel = ar > 0 && car > 0 && Math.abs(ar - car) < 0.06;
  return near169 && nearPanel ? "cover" : "contain";
};
const applyFallbackImageHandlers = ({
  img,
  statusEl,
  altSrc,
  entity
}) => {
  if (!img) return;
  hideFallbackStatus(statusEl);
  img.onerror = () => {
    if (altSrc && img.src !== altSrc) {
      img.src = altSrc;
      return;
    }
    showFallbackStatus(statusEl);
  };
  img.onload = () => {
    hideFallbackStatus(statusEl);
    const host = img.parentElement;
    img.style.objectFit = resolveFallbackObjectFit({
      naturalWidth: img.naturalWidth,
      naturalHeight: img.naturalHeight,
      containerWidth: host?.clientWidth,
      containerHeight: host?.clientHeight
    });
  };
  img.alt = entity ? `${entity} snapshot` : "Camera snapshot";
};
const setFallbackImageSourceIfChanged = ({ img, src }) => {
  if (!img || !src) return;
  if (img.src !== src) img.src = src;
};

// src/features/live/fallbacks/fallback-refresh.js
const nextFallbackRequestId = (currentRequestId) => Number(currentRequestId || 0) + 1;
const issueFallbackRefreshToken = ({ currentRequestId }) => {
  const requestId = nextFallbackRequestId(currentRequestId);
  return {
    requestId,
    nextRequestId: requestId
  };
};
const getFallbackRefreshElements = (shadowRoot) => ({
  imgEl: shadowRoot?.querySelector?.("#stream-fallback-img") || null,
  statusEl: shadowRoot?.querySelector?.("#stream-fallback-status") || null
});
const canRefreshFallbackImage = ({ imgEl }) => !!imgEl;
const beginFallbackRefresh = ({ imgEl, currentRequestId }) => {
  if (!canRefreshFallbackImage({ imgEl })) {
    return {
      shouldAbort: true,
      token: null
    };
  }
  return {
    shouldAbort: false,
    token: issueFallbackRefreshToken({ currentRequestId })
  };
};
const resolveFallbackRefreshEntity = (activeCam) => String(activeCam?.entity || "").trim();
const loadPrimaryFallbackSource = async ({ entity, loadPrimary }) => {
  if (!entity) return "";
  return await loadPrimary(entity);
};
const resolveAltFallbackSource = ({ entity, loadAlt }) => {
  if (!entity) return "";
  return loadAlt(entity);
};
const resolveFallbackRefreshSources = ({ primarySrc, altSrc }) => {
  const outcome = buildFallbackRefreshOutcome({
    primarySrc,
    altSrc
  });
  return {
    primarySrc,
    altSrc,
    src: outcome.src,
    hasSource: outcome.hasSource
  };
};
const buildFallbackRefreshContext = ({
  entity,
  primarySrc,
  loadAlt
}) => {
  const altSrc = resolveAltFallbackSource({
    entity,
    loadAlt
  });
  const sources = resolveFallbackRefreshSources({
    primarySrc,
    altSrc
  });
  return {
    entity,
    primarySrc,
    altSrc,
    sources
  };
};
const shouldApplyFallbackRefreshSources = ({ sources }) => !!sources?.hasSource;
const buildFallbackImageApplyPayload = ({
  imgEl,
  statusEl,
  entity,
  sources
}) => ({
  img: imgEl,
  statusEl,
  altSrc: sources?.altSrc || "",
  entity,
  src: sources?.src || ""
});
const buildFallbackImageWriteInput = ({ context, imgEl, statusEl }) => {
  const sources = context?.sources || null;
  return {
    applyPayload: buildFallbackImageApplyPayload({
      imgEl,
      statusEl,
      entity: context?.entity || "",
      sources
    }),
    src: sources?.src || ""
  };
};
const executeFallbackRefreshWrite = ({
  writeInput,
  applyHandlers,
  applySource
}) => {
  if (!writeInput?.applyPayload) return;
  applyHandlers(writeInput.applyPayload);
  applySource({
    img: writeInput.applyPayload.img,
    src: writeInput.src
  });
};
const isFallbackRefreshStale = ({ requestId, activeRequestId }) => requestId !== activeRequestId;
const shouldAbortStaleFallbackRefresh = ({
  requestId,
  activeRequestId
}) => isFallbackRefreshStale({ requestId, activeRequestId });
const shouldAbortFallbackRefreshAfterPrimary = ({
  token,
  activeRequestId
}) => shouldAbortStaleFallbackRefresh({
  requestId: token?.requestId,
  activeRequestId
});
const loadPrimaryWithStaleGate = async ({
  entity,
  token,
  activeRequestId,
  readActiveRequestId,
  loadPrimary
}) => {
  const primarySrc = await loadPrimaryFallbackSource({
    entity,
    loadPrimary
  });
  const resolvedActiveRequestId = readActiveRequestId?.() ?? activeRequestId;
  if (shouldAbortFallbackRefreshAfterPrimary({
    token,
    activeRequestId: resolvedActiveRequestId
  })) {
    return {
      shouldAbort: true,
      primarySrc: ""
    };
  }
  return {
    shouldAbort: false,
    primarySrc
  };
};
const buildFallbackRefreshWritePlan = ({
  entity,
  primarySrc,
  loadAlt,
  imgEl,
  statusEl
}) => {
  const context = buildFallbackRefreshContext({
    entity,
    primarySrc,
    loadAlt
  });
  if (!shouldApplyFallbackRefreshSources({ sources: context.sources })) {
    return {
      shouldWrite: false,
      writeInput: null,
      context
    };
  }
  return {
    shouldWrite: true,
    writeInput: buildFallbackImageWriteInput({
      context,
      imgEl,
      statusEl
    }),
    context
  };
};
const runFallbackRefreshCycle = async ({
  shadowRoot,
  currentRequestId,
  activeCam,
  setActiveRequestId,
  readActiveRequestId,
  loadPrimary,
  loadAlt,
  applyHandlers,
  applySource
}) => {
  const { imgEl, statusEl } = getFallbackRefreshElements(shadowRoot);
  const begin = beginFallbackRefresh({
    imgEl,
    currentRequestId
  });
  if (begin.shouldAbort) {
    return {
      shouldAbort: true,
      didWrite: false
    };
  }
  const token = begin.token;
  setActiveRequestId?.(token.nextRequestId);
  const entity = resolveFallbackRefreshEntity(activeCam);
  const primaryPhase = await loadPrimaryWithStaleGate({
    entity,
    token,
    activeRequestId: token.nextRequestId,
    readActiveRequestId,
    loadPrimary
  });
  if (primaryPhase.shouldAbort) {
    return {
      shouldAbort: true,
      didWrite: false
    };
  }
  const writePlan = buildFallbackRefreshWritePlan({
    entity,
    primarySrc: primaryPhase.primarySrc,
    loadAlt,
    imgEl,
    statusEl
  });
  if (!writePlan.shouldWrite) {
    return {
      shouldAbort: false,
      didWrite: false
    };
  }
  executeFallbackRefreshWrite({
    writeInput: writePlan.writeInput,
    applyHandlers,
    applySource
  });
  return {
    shouldAbort: false,
    didWrite: true
  };
};
const runFallbackRefreshCycleForCard = async ({
  card,
  applyHandlers,
  applySource
}) => {
  if (!card) {
    return {
      shouldAbort: true,
      didWrite: false
    };
  }
  return await runFallbackRefreshCycle({
    shadowRoot: card.shadowRoot,
    currentRequestId: card._fallbackReqId,
    activeCam: card._activeCam,
    setActiveRequestId: (nextRequestId) => {
      card._fallbackReqId = nextRequestId;
    },
    readActiveRequestId: () => card._fallbackReqId,
    loadPrimary: async (nextEntity) => await card._streamFallbackUrl(nextEntity),
    loadAlt: (nextEntity) => card._streamFallbackAltUrl(nextEntity),
    applyHandlers,
    applySource
  });
};
const buildFallbackRefreshOutcome = ({ primarySrc, altSrc }) => {
  const src = resolveFallbackDisplaySource({
    primarySrc,
    altSrc
  });
  return {
    src,
    hasSource: !!src
  };
};

// src/integrations/home-assistant/playback.js
function buildHaCameraStreamState(hass, entity, streamType = null, fallbackStreamType = "webrtc") {
  const raw = hass?.states?.[entity];
  if (!raw) return null;
  const attrs = { ...raw.attributes };
  attrs.frontend_stream_type = streamType || fallbackStreamType;
  return { ...raw, attributes: attrs };
}
function createHaCameraStreamElement({
  hass,
  stateObj,
  muted = false,
  controls = false,
  defaultMuted,
  styleText = ""
} = {}) {
  if (!hass || !stateObj) return null;
  const stream = document.createElement("ha-camera-stream");
  stream.hass = hass;
  stream.stateObj = stateObj;
  stream.controls = controls;
  stream.muted = muted;
  if (defaultMuted !== void 0) {
    stream.defaultMuted = defaultMuted;
  }
  if (styleText) {
    stream.style.cssText = styleText;
  }
  return stream;
}

// src/features/live/ha-direct-mounter.js
function createHaDirectMounter({
  getHass,
  getPreferredStreamType,
  getStreamMuted,
  getRotateOverlayActive,
  isCurrentEngine,
  waitForStreamStart,
  attachVideoFit,
  assignCommittedEngine,
  applyResolvedStreamUiState,
  setLiveNativeControls
}) {
  const scheduleFollowUp = (streamEl, haDirectPlan) => {
    void (async () => {
      const ok = await waitForStreamStart(
        streamEl,
        haDirectPlan.waitMs,
        haDirectPlan.waitOptions
      );
      const readyState = resolveHaDirectReadyState({
        rotateOverlayActive: getRotateOverlayActive(),
        isCurrentEngine: isCurrentEngine(streamEl),
        waitSucceeded: ok
      });
      if (readyState.shouldApply) {
        applyResolvedStreamUiState(readyState);
      }
    })();
    setTimeout(() => {
      const stabilizedState = resolveHaDirectStabilizedState({
        rotateOverlayActive: getRotateOverlayActive(),
        isCurrentEngine: isCurrentEngine(streamEl)
      });
      if (stabilizedState.shouldApply) {
        applyResolvedStreamUiState(stabilizedState);
      }
    }, 1200);
  };
  const tryMount = async (slot, startup = null, options = {}) => {
    const preferredStreamType = getPreferredStreamType();
    const haDirectPlan = buildHaDirectMountPlan({
      startup: startup || {},
      preferredStreamType
    });
    const commit = options.commit !== false;
    const entity = String(options.entity || "").trim();
    if (!entity) return false;
    const stateObj = buildHaCameraStreamState(
      getHass(),
      entity,
      haDirectPlan.streamType,
      preferredStreamType
    );
    if (!stateObj) {
      if (commit) {
        applyResolvedStreamUiState(resolveHaDirectMountUnavailableState());
      }
      return false;
    }
    const streamEl = createHaCameraStreamElement({
      hass: getHass(),
      stateObj,
      controls: false,
      muted: options?.muted ?? getStreamMuted(),
      defaultMuted: options.defaultMuted,
      styleText: options.styleText || "width:100%;height:100%;display:block;background:var(--c-bg-deep)"
    });
    if (!streamEl) return false;
    slot.innerHTML = "";
    slot.appendChild(streamEl);
    attachVideoFit(streamEl);
    const engine = streamEl;
    if (!commit) {
      return {
        ok: true,
        type: haDirectPlan.streamType,
        engine,
        slot
      };
    }
    assignCommittedEngine(engine);
    if (getRotateOverlayActive()) {
      setLiveNativeControls(true);
    }
    scheduleFollowUp(streamEl, haDirectPlan);
    return {
      ok: true,
      type: haDirectPlan.streamType,
      engine,
      slot
    };
  };
  return {
    tryMount
  };
}

// src/features/live/pending-destroyers.js
const createPendingMountDestroyers = ({
  activeAttempts,
  targetEntity
}) => activeAttempts.map((attempt) => ({
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
const createGracePendingMountDestroyer = ({ entity, promise }) => ({
  type: "mse",
  entity,
  promise,
  destroy: () => {
    void (async () => {
      const result = await promise;
      try {
        result?.engine?.destroy?.();
      } catch (_) {
      }
    })();
  }
});
const filterPendingDestroyersForWinner = ({
  pendingDestroyers,
  winnerType
}) => (pendingDestroyers || []).filter((attempt) => attempt?.type !== winnerType);
const splitPendingDestroyersByGraceMse = ({
  pendingDestroyers,
  preserveMseEntity
}) => {
  const preserveKey = String(preserveMseEntity || "").trim();
  if (!preserveKey) {
    return {
      toPreserve: [],
      toDestroy: [...pendingDestroyers || []]
    };
  }
  const toPreserve = [];
  const toDestroy = [];
  for (const pendingAttempt of pendingDestroyers || []) {
    if (pendingAttempt?.type === "mse" && pendingAttempt?.entity === preserveKey) {
      toPreserve.push(pendingAttempt);
      continue;
    }
    toDestroy.push(pendingAttempt);
  }
  return { toPreserve, toDestroy };
};
const shouldClearPendingDestroyersForPromise = ({
  pendingDestroyers,
  promise
}) => (pendingDestroyers || []).some((attempt) => attempt?.promise === promise);

// src/features/live/mount-controller.js
function createLiveMountController({
  getSlot,
  isPreviewPageActive,
  getViewMode,
  isGridModeAvailable,
  getMountInProgress,
  getMountTargetEntity,
  getMountState,
  applyMountTrackingState,
  cancelPendingMount,
  mountGridEngine,
  cleanupEngine,
  getStreamMuted,
  setEngineMountedMuted,
  mseGraceController,
  getPendingMountDestroyers,
  setPendingMountDestroyers,
  haDirectMounter,
  go2rtcRaceMounter,
  preferredStreamType,
  setActiveStreamType,
  setStreamLoading,
  setStreamFallbackVisible,
  scheduleResumeLive,
  resolveUseGo2Rtc
}) {
  const applyLiveMountUiState = (quiet = false) => {
    const mountUi = resolveLiveMountUiState({ quiet });
    if (mountUi.activeStreamType != null) {
      setActiveStreamType?.(mountUi.activeStreamType);
    }
    setStreamFallbackVisible?.(
      mountUi.fallbackVisible,
      mountUi.refreshFallbackImage
    );
    setStreamLoading?.(mountUi.loading);
  };
  const applySnapshotFallbackState = (refreshImage = false) => {
    const fallbackState = resolveSnapshotFallbackState({ refreshImage });
    setActiveStreamType?.(fallbackState.activeStreamType);
    setStreamLoading?.(fallbackState.loading);
    setStreamFallbackVisible?.(
      fallbackState.fallbackVisible,
      fallbackState.refreshFallbackImage
    );
  };
  const clearMountTracking = (mountToken) => {
    const mountState = getMountState?.();
    applyMountTrackingState?.(
      clearMountTrackingIfCurrent({
        mountSeq: mountState?.mountSeq,
        mountToken,
        mountInProgress: mountState?.mountInProgress,
        mountStartedAt: mountState?.mountStartedAt,
        mountTargetEntity: mountState?.mountTargetEntity
      })
    );
  };
  const onMountWatchdogTimeout = (mountToken) => {
    if (!shouldRunMountWatchdog({
      mountInProgress: getMountInProgress?.(),
      mountSeq: getMountState?.()?.mountSeq,
      mountToken
    })) {
      return;
    }
    applyMountTrackingState?.(
      applyMountWatchdogTimeout({ mountSeq: getMountState?.()?.mountSeq })
    );
    cleanupEngine?.();
    setStreamLoading?.(false);
    setStreamFallbackVisible?.(true);
    setActiveStreamType?.("snapshot");
    scheduleResumeLive?.("mount-watchdog-timeout");
  };
  const beginLiveMountSession = (entity) => {
    const mountState = getMountState?.();
    const { mountToken, nextState } = beginMountTracking({
      mountSeq: mountState?.mountSeq,
      entity,
      nowMs: Date.now()
    });
    applyMountTrackingState?.(nextState);
    const mountWatchdogT = setTimeout(
      () => onMountWatchdogTimeout(mountToken),
      9e3
    );
    return {
      mountToken,
      clearMountState: () => {
        clearTimeout(mountWatchdogT);
        clearMountTracking(mountToken);
      }
    };
  };
  const mount = async ({ forcedType = null, quiet = false, entity = "" }) => {
    const slot = getSlot?.();
    const mountEntry = resolveLiveMountEntryAction({
      hasSlot: !!slot,
      previewPageActive: isPreviewPageActive?.(),
      viewMode: getViewMode?.(),
      gridModeAvailable: isGridModeAvailable?.(),
      entity,
      mountInProgress: getMountInProgress?.(),
      mountTargetEntity: getMountTargetEntity?.()
    });
    if (mountEntry.type === "missing-slot") return;
    if (mountEntry.type === "preview") {
      applyLiveMountUiState?.(true);
      return;
    }
    if (mountEntry.type === "grid") {
      cancelPendingMount?.("grid-mode");
      mountGridEngine?.(slot);
      return;
    }
    if (mountEntry.type === "missing-entity" || mountEntry.type === "duplicate") {
      return;
    }
    const targetEntity = mountEntry.entity;
    const useGo2Rtc = resolveUseGo2Rtc?.(targetEntity) === true;
    if (useGo2Rtc && (!forcedType || forcedType === "webrtc")) {
      const graceWebRtcEntry = mseGraceController.takeGraceWebRtcEntry?.(targetEntity) || null;
      if (graceWebRtcEntry?.engine && mseGraceController.adoptGraceWebRtcEngine?.(
        slot,
        graceWebRtcEntry.engine
      )) {
        return;
      }
    }
    if (useGo2Rtc && (!forcedType || forcedType === "mse")) {
      const graceMseAction = resolveGraceMseReuseAction({
        useGo2Rtc,
        forcedType,
        graceMseEntry: mseGraceController.takeGraceMseEntry(targetEntity)
      });
      if (graceMseAction.type === "adopt-engine") {
        if (mseGraceController.adoptGraceMseEngine(
          slot,
          graceMseAction.graceMseEntry.engine
        )) {
          return;
        }
      } else if (graceMseAction.type === "await-promise") {
        const graceMseEntry = graceMseAction.graceMseEntry;
        if (graceMseEntry?.promise) {
          setEngineMountedMuted?.(getStreamMuted?.());
          const { mountToken: mountToken2, clearMountState: clearMountState2 } = beginLiveMountSession(targetEntity);
          const graceResultPromise = (async () => {
            return resolveGraceMseMountResult({
              engine: await graceMseEntry.promise
            });
          })();
          setPendingMountDestroyers?.([
            createGracePendingMountDestroyer({
              entity: targetEntity,
              promise: graceResultPromise
            })
          ]);
          slot.innerHTML = "";
          applyLiveMountUiState?.(quiet);
          try {
            const graceResult = await graceResultPromise;
            const pendingOutcome = resolveGraceMsePendingMountOutcome({
              graceResult,
              mountSeq: getMountState?.()?.mountSeq,
              mountToken: mountToken2
            });
            if (pendingOutcome.type === "missing-engine") return;
            if (pendingOutcome.type === "stale-token") return;
            setPendingMountDestroyers?.([]);
            if (mseGraceController.adoptGraceMseEngine(
              slot,
              pendingOutcome.engine
            )) {
              clearMountState2();
              return;
            }
          } finally {
            clearMountState2();
            if (shouldClearPendingDestroyersForPromise({
              pendingDestroyers: getPendingMountDestroyers?.(),
              promise: graceResultPromise
            })) {
              setPendingMountDestroyers?.([]);
            }
          }
        }
      }
    }
    setEngineMountedMuted?.(getStreamMuted?.());
    const { mountToken, clearMountState } = beginLiveMountSession(targetEntity);
    try {
      cleanupEngine?.();
      slot.innerHTML = "";
      applyLiveMountUiState?.(quiet);
      const transportPlan = resolveLiveMountTransportPlan({
        useGo2Rtc,
        forcedType,
        preferredStreamType: preferredStreamType?.()
      });
      if (transportPlan.mode === "ha-direct") {
        setActiveStreamType?.(transportPlan.streamType);
        const haDirectResult = await haDirectMounter.tryMount(
          slot,
          { streamType: transportPlan.streamType },
          { entity: targetEntity, commit: true }
        );
        if (!haDirectResult?.ok) {
          return;
        }
        setEngineMountedMuted?.(getStreamMuted?.());
        return;
      }
      if (await go2rtcRaceMounter.mountWithRace({
        slot,
        entity: targetEntity,
        forcedType,
        mountToken
      })) {
        return;
      }
      applySnapshotFallbackState?.();
    } finally {
      clearMountState();
    }
  };
  return {
    applySnapshotFallbackState,
    applyLiveMountUiState,
    beginLiveMountSession,
    mount
  };
}

// src/features/live/attempt-planner.js
const DEFAULT_LIVE_ORDER = Object.freeze(["webrtc", "mse", "hls"]);
const buildLiveAttemptPlan = ({
  connectionType,
  forcedType = null,
  disableHlsOnDesktop = false,
  builders = {}
}) => {
  if (connectionType === "ha_direct") return [];
  const order = forcedType ? [forcedType] : DEFAULT_LIVE_ORDER;
  return order.filter((type) => !(type === "hls" && disableHlsOnDesktop)).filter((type) => typeof builders[type] === "function").map((type) => ({ type, start: builders[type] }));
};
const raceMountAttempts = async (attempts) => {
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
};

// src/features/live/stream.strategies.js
const StreamStrategy = class {
  constructor({ type, connect }) {
    this.type = String(type || "").trim().toLowerCase();
    this._connectImpl = typeof connect === "function" ? connect : null;
    this._abortController = null;
    this._connectPromise = null;
    this._disconnectStarted = false;
  }
  get connectPromise() {
    return this._connectPromise;
  }
  async connect() {
    if (!this._connectImpl) {
      throw new Error(`Missing connect implementation for ${this.type}`);
    }
    if (this._connectPromise) return this._connectPromise;
    const abortController = new AbortController();
    this._abortController = abortController;
    this._connectPromise = (async () => {
      const result = await this._connectImpl({
        abortSignal: abortController.signal
      });
      if (!result?.ok) {
        throw new Error(`${this.type} strategy failed`);
      }
      return result;
    })();
    this._connectPromise.catch(() => null);
    return this._connectPromise;
  }
  async disconnect() {
    if (this._disconnectStarted) return;
    this._disconnectStarted = true;
    try {
      this._abortController?.abort();
    } catch (_) {
    }
    const result = await this._connectPromise?.catch(() => null);
    try {
      result?.engine?.destroy?.();
    } catch (_) {
    }
  }
};
const WebRtcStrategy = class extends StreamStrategy {
  constructor(connect) {
    super({ type: "webrtc", connect });
  }
};
const MseStrategy = class extends StreamStrategy {
  constructor(connect) {
    super({ type: "mse", connect });
  }
};
const HlsStrategy = class extends StreamStrategy {
  constructor(connect) {
    super({ type: "hls", connect });
  }
};
const createStrategyForType = ({ type, connect }) => {
  const key = String(type || "").trim().toLowerCase();
  if (key === "webrtc") return new WebRtcStrategy(connect);
  if (key === "mse") return new MseStrategy(connect);
  if (key === "hls") return new HlsStrategy(connect);
  return new StreamStrategy({ type: key || "unknown", connect });
};

// src/features/live/stream.orchestrator.js
const StreamOrchestrator = class {
  constructor(options = {}) {
    const strategies = Array.isArray(options) ? options : options?.strategies || [];
    this._strategies = Array.isArray(strategies) ? [...strategies] : [];
    this._preferredType = String(options?.preferredType || "").trim().toLowerCase();
    this._preferredWaitMs = Math.max(0, Number(options?.preferredWaitMs) || 0);
    this._retainPreferredOnFallback = options?.retainPreferredOnFallback === true;
    this._attempts = [];
    this._deferredPreferredAttempt = null;
  }
  get attempts() {
    return this._attempts;
  }
  get deferredPreferredAttempt() {
    return this._deferredPreferredAttempt;
  }
  async start() {
    if (!this._strategies.length) return null;
    this._deferredPreferredAttempt = null;
    this._attempts = this._strategies.map((strategy) => ({
      type: strategy.type,
      strategy,
      promise: strategy.connect().catch(() => null)
    }));
    const candidates = this._attempts.map(
      (attempt) => (async () => {
        const result = await attempt.promise;
        if (!result?.ok) {
          throw new Error(`${attempt.type} strategy failed`);
        }
        return {
          type: attempt.type,
          strategy: attempt.strategy,
          result
        };
      })()
    );
    const preferredCandidate = this._attempts.find(
      (attempt) => attempt.type === this._preferredType
    );
    try {
      let winner = null;
      if (!preferredCandidate) {
        winner = await Promise.any(candidates);
      } else {
        const fallbackWinner = await Promise.any(candidates);
        if (fallbackWinner.type === this._preferredType) {
          winner = fallbackWinner;
        } else if (this._preferredWaitMs <= 0) {
          winner = fallbackWinner;
        } else {
          const preferredWinnerPromise = (async () => {
            try {
              const result = await preferredCandidate.promise;
              if (!result?.ok) return null;
              return {
                type: preferredCandidate.type,
                strategy: preferredCandidate.strategy,
                result
              };
            } catch (_) {
              return null;
            }
          })();
          const timeoutPromise = new Promise((resolve) => {
            setTimeout(() => resolve(null), this._preferredWaitMs);
          });
          const preferredWithTimeout = await Promise.race([
            preferredWinnerPromise,
            timeoutPromise
          ]);
          winner = preferredWithTimeout || fallbackWinner;
        }
      }
      const shouldRetainPreferred = this._retainPreferredOnFallback && preferredCandidate && winner?.type !== preferredCandidate.type;
      if (shouldRetainPreferred) {
        this._deferredPreferredAttempt = preferredCandidate;
        await this.stop({
          exclude: [winner.strategy, preferredCandidate.strategy]
        });
      } else {
        await this.stop({ exclude: winner.strategy });
      }
      return winner.result;
    } catch (_) {
      await this.stop();
      return null;
    }
  }
  async stop({ exclude = null } = {}) {
    const excluded = Array.isArray(exclude) ? new Set(exclude) : exclude ? new Set([exclude]) : null;
    await Promise.all(
      (this._strategies || []).map(async (strategy) => {
        if (excluded?.has(strategy)) return;
        await strategy.disconnect();
      })
    );
  }
};

// src/features/live/go2rtc-race-mounter.js
const STRATEGY_HINT_COOLDOWN_MS = 12e4;
const STRATEGY_HINT_MAX_ENTRIES = 64;
const DEFERRED_WEBRTC_MAX_HOLD_MS = 4e3;
const PREFERRED_WEBRTC_WAIT_MS = 500;
function createGo2RtcRaceMounter({
  mounter,
  isDesktop,
  resolveConnectionType,
  disableHlsDesktopForEntity,
  getPendingMountDestroyers,
  setPendingMountDestroyers,
  isMountTokenCurrent: isMountTokenCurrent2,
  adoptMountedAttempt,
  waitForStreamStart,
  isCurrentWinnerEngine,
  getPendingWebRtcTakeoverTimer,
  setPendingWebRtcTakeoverTimer,
  deferredWebRtcMaxHoldMs = DEFERRED_WEBRTC_MAX_HOLD_MS,
  preferredWebRtcWaitMs = PREFERRED_WEBRTC_WAIT_MS,
  getNowMs = () => Date.now()
}) {
  const strategyHintsByEntity = new Map();
  const normalizeEntityKey = (entity = "") => String(entity || "").trim();
  const setHintState = (entity = "", nextState = null) => {
    const key = normalizeEntityKey(entity);
    if (!key || !nextState) return;
    if (strategyHintsByEntity.has(key)) {
      strategyHintsByEntity.delete(key);
    }
    strategyHintsByEntity.set(key, nextState);
    while (strategyHintsByEntity.size > STRATEGY_HINT_MAX_ENTRIES) {
      const oldestKey = strategyHintsByEntity.keys().next().value;
      if (!oldestKey) break;
      strategyHintsByEntity.delete(oldestKey);
    }
  };
  const getHintState = (entity = "") => {
    const key = normalizeEntityKey(entity);
    if (!key) return null;
    return strategyHintsByEntity.get(key) || null;
  };
  const markHintSuccess = (entity = "", type = "") => {
    const key = normalizeEntityKey(entity);
    const nextType = String(type || "").trim().toLowerCase();
    if (!key || !nextType) return;
    setHintState(key, {
      type: nextType,
      failureCount: 0,
      cooldownUntilMs: 0,
      updatedAtMs: getNowMs()
    });
  };
  const markHintFailure = (entity = "", type = "") => {
    const key = normalizeEntityKey(entity);
    const failedType = String(type || "").trim().toLowerCase();
    if (!key || !failedType) return;
    const current = getHintState(key);
    if (!current || current.type !== failedType) return;
    const failureCount = (Number(current.failureCount) || 0) + 1;
    setHintState(key, {
      type: current.type,
      failureCount,
      cooldownUntilMs: failureCount >= 2 ? getNowMs() + STRATEGY_HINT_COOLDOWN_MS : 0,
      updatedAtMs: getNowMs()
    });
  };
  const resolveHintedType = (entity = "", attempts = [], forcedType = null) => {
    if (forcedType) return null;
    const hint = getHintState(entity);
    if (!hint?.type) return null;
    const nowMs = getNowMs();
    if (Number(hint.cooldownUntilMs) > nowMs) return null;
    setHintState(entity, hint);
    return attempts.some((attempt) => attempt.type === hint.type) ? hint.type : null;
  };
  const mountWithOrchestrator = async ({
    slot,
    entity,
    mountToken,
    attempts,
    preferredType = "webrtc"
  }) => {
    const strategies = attempts.map(
      (attempt) => createStrategyForType({
        type: attempt.type,
        connect: async ({ abortSignal }) => {
          try {
            return await attempt.start({ abortSignal, entity });
          } catch (_) {
            return false;
          }
        }
      })
    );
    const orchestrator = new StreamOrchestrator({
      strategies,
      preferredType,
      preferredWaitMs: Math.max(0, Number(preferredWebRtcWaitMs) || 0),
      retainPreferredOnFallback: true
    });
    slot?.attachOrchestrator?.(orchestrator);
    const activeAttempts = strategies.map((strategy) => ({
      type: strategy.type,
      promise: strategy.connect().catch(() => null)
    }));
    setPendingMountDestroyers(
      createPendingMountDestroyers({
        activeAttempts: strategies.map((strategy) => ({
          type: strategy.type,
          promise: strategy.connectPromise?.catch(() => null)
        })),
        targetEntity: entity
      })
    );
    const winner = await orchestrator.start();
    const deferredPreferredAttempt = orchestrator.deferredPreferredAttempt;
    const deferredPreferredType = deferredPreferredAttempt?.type || "";
    if (!isMountTokenCurrent2(mountToken)) {
      cleanupStaleWinnerResult(winner);
      slot?.clearOrchestrator?.(orchestrator);
      return false;
    }
    const destroyLosers = async () => {
      await destroyLoserAttemptResults({
        activeAttempts: activeAttempts.filter(
          (attempt) => attempt?.type !== deferredPreferredType
        ),
        winnerType: winner?.type
      });
      setPendingMountDestroyers(
        (getPendingMountDestroyers() || []).filter(
          (attempt) => attempt?.type === deferredPreferredType
        )
      );
      slot?.clearOrchestrator?.(orchestrator);
    };
    if (winner?.ok) {
      setPendingMountDestroyers(
        filterPendingDestroyersForWinner({
          pendingDestroyers: getPendingMountDestroyers(),
          winnerType: winner.type
        })
      );
      adoptMountedAttempt(slot, winner);
      void destroyLosers();
      scheduleDeferredWebRtcTakeover({
        entity,
        slot,
        deferredAttempt: deferredPreferredAttempt,
        mountToken,
        winnerEngine: winner.engine,
        winnerType: winner.type
      });
      if (deferredPreferredType !== "webrtc") {
        markHintSuccess(entity, winner.type);
      }
      return true;
    }
    await destroyLosers();
    return false;
  };
  const buildAttempts = (entity = "", forcedType = null, hostSlot = null) => {
    const targetEntity = String(entity || "").trim();
    const connectionType = resolveConnectionType(targetEntity);
    const disableHlsOnDesktop = isDesktop && disableHlsDesktopForEntity(targetEntity);
    const hiddenSlot = () => createAttemptSlot(hostSlot);
    const builders = {
      webrtc: (attemptOptions = {}) => mounter.tryMountWebRtc(
        hiddenSlot(),
        { waitMs: 7e3 },
        {
          commit: false,
          ...attemptOptions
        }
      ),
      mse: (attemptOptions = {}) => mounter.tryMountMse(
        hiddenSlot(),
        {
          waitMs: 4e3,
          minCurrentTime: 0.05,
          minDecodedFrames: 1,
          requireReadyState: 2,
          strict: true
        },
        { commit: false, ...attemptOptions }
      ),
      hls: (attemptOptions = {}) => mounter.tryMountHls(
        hiddenSlot(),
        { waitMs: 5e3 },
        {
          commit: false,
          ...attemptOptions
        }
      )
    };
    return buildLiveAttemptPlan({
      connectionType,
      forcedType,
      disableHlsOnDesktop,
      builders
    });
  };
  const mountWithRace = async ({
    slot,
    entity,
    forcedType = null,
    mountToken
  }) => {
    const attempts = buildAttempts(entity, forcedType, slot);
    const hintedType = resolveHintedType(entity, attempts, forcedType);
    if (hintedType) {
      const preferredAttempt = attempts.find(
        (attempt) => attempt.type === hintedType
      );
      if (preferredAttempt) {
        let preferredResult = null;
        try {
          preferredResult = await preferredAttempt.start({ entity });
        } catch (_) {
          preferredResult = null;
        }
        if (!isMountTokenCurrent2(mountToken)) {
          cleanupStaleWinnerResult(preferredResult);
          return false;
        }
        if (preferredResult?.ok) {
          adoptMountedAttempt(slot, preferredResult);
          markHintSuccess(entity, preferredResult.type || hintedType);
          return true;
        }
        markHintFailure(entity, hintedType);
        const fallbackAttempts = attempts.filter(
          (attempt) => attempt.type !== hintedType
        );
        if (!fallbackAttempts.length) return false;
        return await mountWithOrchestrator({
          slot,
          entity,
          mountToken,
          attempts: fallbackAttempts,
          preferredType: "webrtc"
        });
      }
    }
    return await mountWithOrchestrator({
      slot,
      entity,
      mountToken,
      attempts,
      preferredType: "webrtc"
    });
  };
  return {
    buildAttempts,
    mountWithRace
  };
  function createAttemptSlot(host = null) {
    const slot = document.createElement("div");
    slot.style.cssText = "position:absolute;inset:0;opacity:0;pointer-events:none;overflow:hidden;";
    if (host) host.appendChild(slot);
    return slot;
  }
  function scheduleDeferredWebRtcTakeover({
    entity,
    slot,
    deferredAttempt,
    mountToken,
    winnerEngine,
    winnerType
  }) {
    if (!slot || !deferredAttempt || deferredAttempt.type !== "webrtc") return;
    if (winnerType !== "mse" && winnerType !== "hls") return;
    const pendingTimer = getPendingWebRtcTakeoverTimer?.();
    if (pendingTimer) {
      clearTimeout(pendingTimer);
      setPendingWebRtcTakeoverTimer(null);
    }
    let settled = false;
    let holdTimer = null;
    const settleDeferredState = () => {
      if (settled) return;
      settled = true;
      if (holdTimer) {
        clearTimeout(holdTimer);
        holdTimer = null;
      }
      setPendingMountDestroyers(
        (getPendingMountDestroyers() || []).filter(
          (attempt) => attempt?.type !== "webrtc"
        )
      );
      setPendingWebRtcTakeoverTimer(null);
    };
    holdTimer = setTimeout(
      () => {
        settleDeferredState();
        void (async () => {
          await deferredAttempt.strategy?.disconnect?.();
          const result = await deferredAttempt.promise.catch(() => null);
          cleanupStaleWinnerResult(result);
        })();
      },
      Math.max(1, Number(deferredWebRtcMaxHoldMs) || 0)
    );
    setPendingWebRtcTakeoverTimer(holdTimer);
    void (async () => {
      try {
        const result = await deferredAttempt.promise.catch(() => null);
        if (!result?.ok || result.type !== "webrtc") return;
        const takeoverStable = await waitForStreamStart(result.slot, 1500, {
          minCurrentTime: 0.1,
          minDecodedFrames: 2,
          requireReadyState: 2,
          strict: true
        });
        if (!takeoverStable) {
          cleanupStaleWinnerResult(result);
          return;
        }
        if (!isMountTokenCurrent2(mountToken)) {
          cleanupStaleWinnerResult(result);
          return;
        }
        if (!isCurrentWinnerEngine(winnerEngine)) {
          cleanupStaleWinnerResult(result);
          return;
        }
        adoptMountedAttempt(slot, result);
        try {
          winnerEngine?.destroy?.();
        } catch (_) {
        }
        markHintSuccess(entity, "webrtc");
      } finally {
        settleDeferredState();
      }
    })();
  }
}

// src/features/live/grace-pool.js
const OFFSCREEN_VIDEO_STYLE = "width:1px;height:1px;display:block;opacity:0;pointer-events:none;position:absolute;left:-9999px;top:-9999px;background:var(--c-bg-deep)";
const normalizeGraceEntityKey = (entity) => String(entity || "").trim();
const createGraceEngineEntry = ({ engine, onExpire, graceMs }) => {
  const entry = {
    engine,
    cancelled: false,
    timer: null
  };
  entry.timer = setTimeout(() => {
    onExpire?.(entry);
  }, graceMs);
  return entry;
};
const createGracePendingEntry = ({ onExpire, graceMs }) => {
  const entry = {
    engine: null,
    cancelled: false,
    timer: null,
    promise: null
  };
  entry.timer = setTimeout(() => {
    onExpire?.(entry);
  }, graceMs);
  return entry;
};
const prepareEngineVideoForGraceHost = (video) => {
  if (!video) return;
  video.muted = true;
  video.controls = false;
  video.style.cssText = OFFSCREEN_VIDEO_STYLE;
  void video.play?.().catch?.(() => {
  });
};

// src/features/live/mse-grace-controller.js
function createMseGraceController({
  graceMs,
  graceMax,
  getShadowRoot,
  getScopeKey,
  getPendingMountDestroyers,
  setPendingMountDestroyers,
  getPendingWebRtcTakeoverTimer,
  setPendingWebRtcTakeoverTimer,
  clearRotateOverlayAudioSync,
  clearRotateVideoFullscreenStyle,
  getEngine,
  setEngine,
  getActiveStreamType,
  getStreamMuted,
  setEngineMountedMuted,
  getRotateOverlayActive,
  attachVideoFit,
  setActiveStreamType,
  setStreamLoading,
  setStreamFallbackVisible,
  setLiveNativeControls
}) {
  const mseGracePool = new Map();
  const webRtcGracePool = new Map();
  const terminalWebRtcStates = new Set(["closed", "failed", "disconnected"]);
  let graceEntrySequence = 0;
  const isWebRtcEngineReusable = (engine) => {
    if (!engine?.video || !engine?.pc || !engine?.ws) return false;
    const connectionState = String(engine.pc.connectionState || "").trim().toLowerCase();
    const iceState = String(engine.pc.iceConnectionState || "").trim().toLowerCase();
    const wsState = Number(engine.ws.readyState);
    return !terminalWebRtcStates.has(connectionState) && !terminalWebRtcStates.has(iceState) && (!Number.isFinite(wsState) || wsState <= 1);
  };
  let mseGraceHost = null;
  const evictGraceMseEntry = (entity) => {
    const key = normalizeGraceEntityKey(entity);
    if (!key) return;
    const entry = mseGracePool.get(key);
    if (!entry) return;
    entry.cancelled = true;
    if (entry.timer) clearTimeout(entry.timer);
    mseGracePool.delete(key);
    try {
      entry.engine?.destroy?.();
    } catch (_) {
    }
  };
  const evictGraceWebRtcEntry = (entity) => {
    const key = normalizeGraceEntityKey(entity);
    if (!key) return;
    const entry = webRtcGracePool.get(key);
    if (!entry) return;
    entry.cancelled = true;
    if (entry.timer) clearTimeout(entry.timer);
    webRtcGracePool.delete(key);
    try {
      entry.engine?.destroy?.();
    } catch (_) {
    }
  };
  const trimGracePool = () => {
    const maxEntries = Math.max(0, Number(graceMax) || 0);
    while (mseGracePool.size + webRtcGracePool.size > maxEntries) {
      const mseKey = mseGracePool.keys().next().value || "";
      const webRtcKey = webRtcGracePool.keys().next().value || "";
      const mseOrder = Number(mseGracePool.get(mseKey)?.graceOrder) || Infinity;
      const webRtcOrder = Number(webRtcGracePool.get(webRtcKey)?.graceOrder) || Infinity;
      if (mseOrder <= webRtcOrder) {
        if (!mseKey) break;
        evictGraceMseEntry(mseKey);
      } else {
        if (!webRtcKey) break;
        evictGraceWebRtcEntry(webRtcKey);
      }
    }
  };
  const ensureMseGraceHost = () => {
    if (mseGraceHost?.isConnected) return mseGraceHost;
    const host = document.createElement("div");
    host.setAttribute("aria-hidden", "true");
    host.style.cssText = "position:absolute;width:1px;height:1px;overflow:hidden;opacity:0;pointer-events:none;left:-9999px;top:-9999px";
    getShadowRoot?.()?.appendChild?.(host);
    mseGraceHost = host;
    return host;
  };
  const stashMseEngineForGrace = (entity, engine) => {
    const key = normalizeGraceEntityKey(entity);
    if (!key || !engine?.video || !engine?.ws) return false;
    evictGraceMseEntry(key);
    ensureMseGraceHost().appendChild(engine.video);
    prepareEngineVideoForGraceHost(engine.video);
    const entry = createGraceEngineEntry({
      engine,
      graceMs,
      onExpire: () => {
        if (mseGracePool.get(key) !== entry) return;
        evictGraceMseEntry(key);
      }
    });
    entry.graceOrder = ++graceEntrySequence;
    mseGracePool.set(key, entry);
    trimGracePool();
    return true;
  };
  const stashWebRtcEngineForGrace = (entity, engine) => {
    const key = normalizeGraceEntityKey(entity);
    if (!key || !isWebRtcEngineReusable(engine)) return false;
    evictGraceWebRtcEntry(key);
    ensureMseGraceHost().appendChild(engine.video);
    prepareEngineVideoForGraceHost(engine.video);
    const entry = createGraceEngineEntry({
      engine,
      graceMs,
      onExpire: () => {
        if (webRtcGracePool.get(key) !== entry) return;
        evictGraceWebRtcEntry(key);
      }
    });
    entry.graceOrder = ++graceEntrySequence;
    webRtcGracePool.set(key, entry);
    trimGracePool();
    return true;
  };
  const stashPendingMsePromiseForGrace = (entity, promise) => {
    const key = normalizeGraceEntityKey(entity);
    if (!key || !promise) return false;
    evictGraceMseEntry(key);
    const entry = createGracePendingEntry({
      graceMs,
      onExpire: () => {
        if (mseGracePool.get(key) !== entry) return;
        evictGraceMseEntry(key);
      }
    });
    entry.graceOrder = ++graceEntrySequence;
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
          evictGraceMseEntry(key);
          return null;
        }
        ensureMseGraceHost().appendChild(result.engine.video);
        prepareEngineVideoForGraceHost(result.engine.video);
        entry.engine = result.engine;
        entry.promise = null;
        return result.engine;
      } catch (_) {
        if (mseGracePool.get(key) === entry) {
          evictGraceMseEntry(key);
        }
        return null;
      }
    })();
    entry.graceOrder = ++graceEntrySequence;
    mseGracePool.set(key, entry);
    trimGracePool();
    return true;
  };
  const takeGraceMseEntry = (entity) => {
    const key = normalizeGraceEntityKey(entity);
    if (!key) return null;
    const entry = mseGracePool.get(key);
    if (!entry) return null;
    if (entry.timer) clearTimeout(entry.timer);
    mseGracePool.delete(key);
    return entry;
  };
  const takeGraceWebRtcEntry = (entity) => {
    const key = normalizeGraceEntityKey(entity);
    if (!key) return null;
    const entry = webRtcGracePool.get(key);
    if (!entry) return null;
    if (entry.timer) clearTimeout(entry.timer);
    webRtcGracePool.delete(key);
    return entry;
  };
  const adoptGraceMseEngine = (slot, engine) => {
    if (!slot || !engine?.video || !engine?.ws) return false;
    if (engine.ws.readyState > WebSocket.OPEN) {
      try {
        engine.destroy?.();
      } catch (_) {
      }
      return false;
    }
    configureVideoElement(
      engine.video,
      buildVideoOptionsForView(
        "live",
        {
          muted: getStreamMuted?.(),
          controls: false
        },
        { scopeKey: getScopeKey?.() }
      )
    );
    mountNodeIntoSlot(slot, engine.video);
    attachVideoFit?.(engine.video);
    setEngine?.(engine);
    setEngineMountedMuted?.(getStreamMuted?.());
    setActiveStreamType?.("mse");
    setStreamLoading?.(false);
    setStreamFallbackVisible?.(false);
    if (getRotateOverlayActive?.()) setLiveNativeControls?.(true);
    void engine.video.play?.().catch?.(() => {
    });
    return true;
  };
  const adoptGraceWebRtcEngine = (slot, engine) => {
    if (!slot || !isWebRtcEngineReusable(engine)) {
      try {
        engine?.destroy?.();
      } catch (_) {
      }
      return false;
    }
    configureVideoElement(
      engine.video,
      buildVideoOptionsForView(
        "live",
        {
          muted: getStreamMuted?.(),
          controls: false
        },
        { scopeKey: getScopeKey?.() }
      )
    );
    mountNodeIntoSlot(slot, engine.video);
    attachVideoFit?.(engine.video);
    setEngine?.(engine);
    setEngineMountedMuted?.(getStreamMuted?.());
    setActiveStreamType?.("webrtc");
    setStreamLoading?.(false);
    setStreamFallbackVisible?.(false);
    if (getRotateOverlayActive?.()) setLiveNativeControls?.(true);
    void engine.video.play?.().catch?.(() => {
    });
    return true;
  };
  const cleanupEngine = (options = {}) => {
    const pendingTakeoverTimer = getPendingWebRtcTakeoverTimer?.();
    if (pendingTakeoverTimer) {
      clearTimeout(pendingTakeoverTimer);
      setPendingWebRtcTakeoverTimer?.(null);
    }
    clearRotateOverlayAudioSync?.();
    clearRotateVideoFullscreenStyle?.();
    const preserveLiveEntity = String(
      options?.preserveLiveEntity || options?.preserveMseEntity || ""
    ).trim();
    const pending = getPendingMountDestroyers?.() || [];
    setPendingMountDestroyers?.([]);
    const { toPreserve, toDestroy } = splitPendingDestroyersByGraceMse({
      pendingDestroyers: pending,
      preserveMseEntity: preserveLiveEntity
    });
    for (const pendingAttempt of toPreserve) {
      stashPendingMsePromiseForGrace(preserveLiveEntity, pendingAttempt.promise);
    }
    for (const pendingAttempt of toDestroy) {
      try {
        pendingAttempt?.destroy?.();
      } catch (_) {
      }
    }
    const engine = getEngine?.();
    if (!engine) return;
    const activeStreamType = String(getActiveStreamType?.() || "").trim().toLowerCase();
    if (preserveLiveEntity && activeStreamType === "webrtc" && stashWebRtcEngineForGrace(preserveLiveEntity, engine)) {
      setEngine?.(null);
      return;
    }
    if (preserveLiveEntity && activeStreamType === "mse" && stashMseEngineForGrace(preserveLiveEntity, engine)) {
      setEngine?.(null);
      return;
    }
    try {
      if (typeof engine.destroy === "function") engine.destroy();
      if (engine.ws && typeof engine.ws.close === "function") engine.ws.close();
      if (engine.pc && typeof engine.pc.close === "function") engine.pc.close();
    } catch (_) {
    }
    setEngine?.(null);
  };
  const clearGracePool = () => {
    for (const entity of [...mseGracePool.keys()]) {
      evictGraceMseEntry(entity);
    }
    for (const entity of [...webRtcGracePool.keys()]) {
      evictGraceWebRtcEntry(entity);
    }
    try {
      mseGraceHost?.remove?.();
    } catch (_) {
    }
    mseGraceHost = null;
  };
  return {
    cleanupEngine,
    clearGracePool,
    takeGraceMseEntry,
    adoptGraceMseEngine,
    takeGraceWebRtcEntry,
    adoptGraceWebRtcEngine
  };
}

// src/features/grid/page.tmpl.js
function buildGridSignaturePart({
  index,
  entity,
  severity,
  useLive,
  liveStreamHint
}) {
  if (index < 0) return "-1";
  return `${index}:${entity}:${severity || "none"}:${useLive ? `live:${liveStreamHint}` : "snap"}`;
}
function createGridRootElement() {
  const grid = document.createElement("div");
  grid.className = "live-grid";
  return grid;
}
function createGridCellElement() {
  const cell = document.createElement("div");
  cell.className = "live-grid-cell";
  return cell;
}
function applyGridCellSeverityClass(cell, severity) {
  if (severity === "alert") cell.classList.add("grid-alert");
  if (severity === "detection") cell.classList.add("grid-detection");
}
function createGridLabelElement(labelText) {
  const label = document.createElement("div");
  label.className = "live-grid-label";
  label.textContent = labelText;
  return label;
}
function renderGridEmptyPlaceholder(cell, liveIconSvg) {
  cell.classList.add("empty");
  cell.innerHTML = `<div class="ph">${liveIconSvg}<span>Empty</span></div>`;
}

// src/features/grid/media.ctrl.js
const GridMediaController = class {
  constructor(host, options = {}) {
    this._host = host;
    this._buildLabelText = typeof options.buildLabelText === "function" ? options.buildLabelText : () => "";
    this._liveIconSvg = String(options.liveIconSvg || "");
  }
  pageCameraIndices() {
    const total = this._host._config?.cameras?.length || 0;
    if (!total) return [];
    const maxStart = Math.max(0, (Math.ceil(total / 4) - 1) * 4);
    const rawStart = Math.max(0, Number(this._host._gridRotationStart) || 0);
    const start = Math.min(maxStart, Math.floor(rawStart / 4) * 4);
    this._host._gridRotationStart = start;
    return [0, 1, 2, 3].map((offset) => {
      const idx = start + offset;
      return idx < total ? idx : -1;
    });
  }
  _mountGridSnapshotCell(cell, { entity, stateObj }) {
    if (!cell || !entity) return false;
    const img = document.createElement("img");
    const entityPicture = stateObj?.attributes?.entity_picture || "";
    img.alt = `${entity} snapshot`;
    img.loading = "lazy";
    img.decoding = "async";
    void (async () => {
      const primaryUrl = await this._host._streamFallbackUrl(entity);
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
  _isSignedCameraProxyUrl(url) {
    const source = String(url || "");
    return /\/api\/camera_proxy\//i.test(source) && /[?&]authSig=/i.test(source);
  }
  async _refreshSnapshotImageElement(img, resolvedUrl, cacheBustValue) {
    if (!img || !img.isConnected || !resolvedUrl) return;
    if (this._isSignedCameraProxyUrl(resolvedUrl)) {
      try {
        const response = await fetch(resolvedUrl, {
          cache: "no-store",
          credentials: "same-origin"
        });
        if (!response.ok) return;
        const blob = await response.blob();
        if (!img.isConnected) return;
        const nextBlobUrl = URL.createObjectURL(blob);
        const previousBlobUrl = img.dataset.fvcBlobUrl || "";
        img.src = nextBlobUrl;
        img.dataset.fvcBlobUrl = nextBlobUrl;
        if (previousBlobUrl && previousBlobUrl !== nextBlobUrl) {
          try {
            URL.revokeObjectURL(previousBlobUrl);
          } catch (_) {
          }
        }
      } catch (_) {
      }
      return;
    }
    img.src = appendCacheBustParam(resolvedUrl, cacheBustValue);
  }
  async _resolveSnapshotImageUrl(entity, stateObj = null) {
    const primaryUrl = await this._host._streamFallbackUrl(entity);
    if (primaryUrl) return primaryUrl;
    const entityPicture = stateObj?.attributes?.entity_picture || this._host._hass?.states?.[entity]?.attributes?.entity_picture || "";
    if (!entityPicture) return "";
    return /^https?:\/\//i.test(entityPicture) ? entityPicture : `${window.location.origin}${entityPicture}`;
  }
  async refreshSnapshotMedia({ cacheBustValue = Date.now() } = {}) {
    const hosts = this._host.shadowRoot?.querySelectorAll(
      ".preview-media-host[data-preview-use-live='0'], .live-grid-cell[data-grid-use-live='0']"
    );
    if (!hosts?.length) return;
    await Promise.all(
      Array.from(hosts).map(async (host) => {
        const img = host.querySelector?.("img");
        if (!img || !img.isConnected) return;
        const entity = host.dataset.previewMediaEntity || host.dataset.gridEntity || "";
        if (!entity) return;
        const stateObj = this._host._hass?.states?.[entity] || null;
        const resolvedUrl = await this._resolveSnapshotImageUrl(
          entity,
          stateObj
        );
        if (!resolvedUrl || !img.isConnected) return;
        await this._refreshSnapshotImageElement(
          img,
          resolvedUrl,
          cacheBustValue
        );
      })
    );
  }
  _mountGridDirectMseCell(cell, entity, gridState, options = {}) {
    const host = document.createElement("div");
    host.style.cssText = "width:100%;height:100%;display:block";
    cell.appendChild(host);
    void (async () => {
      const result = await this._host._go2rtcMounter.tryMountMse(
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
      if (liveStreamHint === "mse" && this._host._shouldUseGo2RtcForEntity(entity)) {
        this._mountGridDirectMseCell(cell, entity, gridState, {
          fallbackOnFailure: fallbackOnLiveError,
          stateObj
        });
      } else {
        const stream = createHaCameraStreamElement({
          hass: this._host._hass,
          stateObj,
          controls: false,
          muted: true,
          defaultMuted: true,
          styleText: "width:100%;height:100%;display:block;background:var(--c-bg-deep)"
        });
        if (!stream) return false;
        cell.appendChild(stream);
        this._host._attachVideoFit(stream);
        gridState.cleanup.push(() => {
          try {
            const video = this._host._findVideoDeep?.(stream);
            if (video) {
              video.pause?.();
              video.removeAttribute?.("src");
              video.load?.();
            }
          } catch (_) {
          }
          try {
            stream.remove();
          } catch (_) {
          }
        });
      }
      return true;
    }
    return this._mountGridSnapshotCell(cell, { entity, stateObj });
  }
  mountCameraCellMedia(cell, options = {}) {
    return this._mountGridCameraCellMedia(cell, options);
  }
  mountGridEngine(slot) {
    const indices = this.pageCameraIndices();
    const liveStreamHint = this._host._currentLiveStreamHint();
    const gridState = { destroyed: false, cleanup: [] };
    const signatureParts = [];
    for (const idx of indices) {
      const cam = idx >= 0 ? this._host._config?.cameras?.[idx] : null;
      const entity = cam?.entity || "";
      const severity = idx >= 0 ? this._host._gridCellSeverity(entity) : "";
      const useLive = idx >= 0 && (this._host._gridLiveViewEnabled() || this._host._isGridCameraAlertLive(entity));
      signatureParts.push(
        buildGridSignaturePart({
          index: idx,
          entity,
          severity,
          useLive,
          liveStreamHint
        })
      );
    }
    const nextSignature = signatureParts.join("|");
    const hasExistingGrid = slot.firstElementChild?.classList?.contains("live-grid");
    if (hasExistingGrid && this._host._gridLastRenderSignature === nextSignature) {
      this._host._setActiveStreamType("grid");
      this._host._setStreamLoading(false);
      this._host._setStreamFallbackVisible(false);
      this._host._syncSnapshotRefreshTimer?.();
      return;
    }
    this._host._gridLastRenderSignature = nextSignature;
    slot.innerHTML = "";
    const grid = createGridRootElement();
    for (const idx of indices) {
      const cell = createGridCellElement();
      if (idx >= 0) {
        const cam = this._host._config?.cameras?.[idx];
        const entity = cam?.entity || "";
        const stateObj = entity ? buildHaCameraStreamState(
          this._host._hass,
          entity,
          liveStreamHint,
          this._host._preferredStreamType()
        ) || this._host._hass?.states?.[entity] || null : null;
        const severity = this._host._gridCellSeverity(entity);
        applyGridCellSeverityClass(cell, severity);
        const useLive = this._host._gridLiveViewEnabled() || this._host._isGridCameraAlertLive(entity);
        cell.dataset.gridUseLive = useLive ? "1" : "0";
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
        const label = createGridLabelElement(this._buildLabelText(cam));
        cell.appendChild(label);
      } else {
        cell.classList.add("empty");
      }
      if (cell.classList.contains("empty")) {
        renderGridEmptyPlaceholder(cell, this._liveIconSvg);
      }
      grid.appendChild(cell);
    }
    slot.appendChild(grid);
    this._host._engine = {
      destroy: () => {
        gridState.destroyed = true;
        slot.querySelectorAll("img[data-fvc-blob-url]").forEach((img) => {
          const blobUrl = img.dataset.fvcBlobUrl || "";
          if (!blobUrl) return;
          try {
            URL.revokeObjectURL(blobUrl);
          } catch (_) {
          }
        });
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
    this._host._setActiveStreamType("grid");
    this._host._setStreamLoading(false);
    this._host._setStreamFallbackVisible(false);
    this._host._syncSnapshotRefreshTimer?.();
  }
};

// src/card/controls/calendar-filter.tmpl.js
function buildCalendarPanelMarkup({
  monthDate,
  activeDayDateString,
  daysWithActivity,
  timeZone
}) {
  const year = monthDate.getUTCFullYear();
  const monthIndex = monthDate.getUTCMonth();
  const first = new Date(Date.UTC(year, monthIndex, 1, 12, 0, 0));
  const startDow = (first.getUTCDay() + 6) % 7;
  const days = new Date(
    Date.UTC(year, monthIndex + 1, 0, 12, 0, 0)
  ).getUTCDate();
  const activityDays = daysWithActivity instanceof Set ? daysWithActivity : new Set(daysWithActivity);
  let cells = "";
  for (let i = 0; i < startDow; i++) cells += "<span></span>";
  for (let day = 1; day <= days; day++) {
    const ds = `${year}-${String(monthIndex + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    cells += `<button class="cday ${ds === activeDayDateString ? "active" : ""}" data-cal-day="${ds}">${day}${activityDays.has(ds) ? '<i class="cdot"></i>' : ""}</button>`;
  }
  const monthLabel = new Intl.DateTimeFormat([], {
    month: "long",
    year: "numeric",
    timeZone
  }).format(monthDate);
  return `<div class="cal-top"><button class="cal-today-btn" data-cal-today>Today</button></div>
      <div class="cal-head"><button data-cal-nav="-1">\u2039</button><b>${monthLabel}</b><button data-cal-nav="1">\u203A</button></div>
      <div class="cal-dow"><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span><span>S</span></div>
      <div class="cal-grid">${cells}</div>`;
}
function buildFilterPanelMarkup({
  labels,
  zones,
  filterLabel,
  filterZone,
  favOnly
}) {
  const chip = (val, cur, attr) => `<button class="chip ${val === cur ? "on" : ""}" data-${attr}="${val}">${val === "all" ? "All" : cap(val)}</button>`;
  return `<div class="frow"><span class="frow-l">Label</span>${labels.map((label) => chip(label, filterLabel, "flabel")).join("")}</div>
      <div class="frow"><span class="frow-l">Zone</span>${zones.map((zone) => chip(zone, filterZone, "fzone")).join("")}</div>
      <div class="frow"><span class="frow-l">Show</span>
        <button class="chip ${!favOnly ? "on" : ""}" data-favonly="0">All</button>
        <button class="chip ${favOnly ? "on" : ""}" data-favonly="1">\u2605 Favorites</button></div>`;
}

// src/features/browse/calendar-panel.ctrl.js
const BrowseCalendarPanelController = class {
  constructor(host, deps = {}) {
    this._host = host;
    this._deps = {
      buildCalendarPanelMarkup: () => "",
      nowEpochSeconds: () => Math.floor(Date.now() / 1e3),
      ...deps
    };
  }
  handleSidebarCalendarClick(target) {
    const calendarDay = target.closest("[data-cal-day]");
    if (calendarDay) {
      this.pickDay(calendarDay.dataset.calDay);
      return true;
    }
    const calendarNav = target.closest("[data-cal-nav]");
    if (calendarNav) {
      this.calNav(Number(calendarNav.dataset.calNav));
      return true;
    }
    const calendarToday = target.closest("[data-cal-today]");
    if (calendarToday) {
      this.goTodayInCalendar();
      return true;
    }
    return false;
  }
  toggleCalendar() {
    const panel = this._host._pageShellRegion("calendarPanel");
    if (!panel) return;
    const open = panel.style.display === "none";
    const filterPanel = this._host._pageShellRegion("filterPanel");
    if (filterPanel) filterPanel.style.display = "none";
    panel.style.display = open ? "block" : "none";
    this._host._syncToolbarButtons();
    if (!open) return;
    if (!this._host._calMonth) {
      const parts = this._host._tzParts(this._host._winEnd);
      this._host._calMonth = this.createCalendarMonthDate(
        parts.year,
        parts.month - 1
      );
    }
    this._host._applyCalendarActivityCacheForActiveCamera();
    this.renderCal();
    void this._host._prefetchCalendarActivityForActiveCamera();
  }
  formatTzDateString(parts) {
    return `${parts.year}-${String(parts.month).padStart(2, "0")}-${String(parts.day).padStart(2, "0")}`;
  }
  calendarTodayDateString() {
    return this.formatTzDateString(
      this._host._tzParts(this._deps.nowEpochSeconds())
    );
  }
  activeCalendarDayDateString() {
    return this._host._calSelectedDay || this.calendarTodayDateString();
  }
  goTodayInCalendar() {
    const now = this._deps.nowEpochSeconds();
    const parts = this._host._tzParts(now);
    this._host._calSelectedDay = this.formatTzDateString(parts);
    this._host._calMonth = this.createCalendarMonthDate(
      parts.year,
      parts.month - 1
    );
    this.pickDay(this._host._calSelectedDay);
  }
  createCalendarMonthDate(year, monthIndex) {
    return new Date(Date.UTC(year, monthIndex, 15, 12, 0, 0));
  }
  resolveCalendarMonthDate() {
    if (this._host._calMonth instanceof Date) {
      return new Date(this._host._calMonth);
    }
    const parts = this._host._tzParts(this._host._winEnd);
    return this.createCalendarMonthDate(parts.year, parts.month - 1);
  }
  calNav(delta) {
    const monthDate = this.resolveCalendarMonthDate();
    monthDate.setUTCMonth(monthDate.getUTCMonth() + delta);
    this._host._calMonth = new Date(monthDate);
    this.renderCal();
  }
  pickDay(dateString) {
    this._host._followNowWindow = false;
    this._host._calSelectedDay = dateString;
    const [year, month, day] = dateString.split("-").map(Number);
    this._host._winStart = this._host._tzDateTimeToEpochSeconds(
      year,
      month,
      day,
      0,
      0,
      0
    );
    this._host._winEnd = Math.min(
      this._host._tzDateTimeToEpochSeconds(year, month, day, 23, 59, 59),
      this._deps.nowEpochSeconds()
    );
    const panel = this._host._pageShellRegion("calendarPanel");
    if (panel) panel.style.display = "none";
    this._host._syncToolbarButtons();
    this._host._browseWindowLoaderController?.pruneNonActiveCamWindowCaches?.() ?? this._host._pruneNonActiveCamWindowCaches?.();
    void (async () => {
      await (this._host._browseWindowLoaderController?.loadWindow?.(true) ?? this._host._loadWindow?.(true));
      this._host._browseWindowLoaderController?.scheduleWarmOtherCamerasEvents?.() ?? this._host._scheduleWarmOtherCamerasEvents?.();
    })();
  }
  renderCal() {
    const panel = this._host._pageShellRegion("calendarPanel");
    if (!panel) return;
    panel.innerHTML = this._deps.buildCalendarPanelMarkup({
      monthDate: this.resolveCalendarMonthDate(),
      activeDayDateString: this.activeCalendarDayDateString(),
      daysWithActivity: this._host._daysWithActivity,
      timeZone: this._host._tz()
    });
  }
};

// src/shared/favorite-mutation.js
const updateEventRetention = ({ events = [], id, retained }) => {
  let changed = false;
  const nextEvents = events.map((event) => {
    if (event?.id !== id) return event;
    changed = true;
    return {
      ...event,
      retain_indefinitely: retained
    };
  });
  return {
    events: changed ? nextEvents : events,
    changed
  };
};
const updateKeptEvents = ({ kept = [], id, retained, event }) => {
  const nextEvent = {
    ...event,
    retain_indefinitely: retained
  };
  if (!retained) {
    return kept.filter((item) => item.id !== id);
  }
  let found = false;
  const nextKept = kept.map((item) => {
    if (item.id !== id) return item;
    found = true;
    return {
      ...item,
      retain_indefinitely: true
    };
  });
  return found ? nextKept : [nextEvent, ...nextKept];
};
const applyFavoriteMutationState = ({
  id,
  retained,
  event,
  events = [],
  camCache = {},
  kept = [],
  activeEntity = ""
}) => {
  const nextEventsResult = updateEventRetention({ events, id, retained });
  const nextKept = updateKeptEvents({ kept, id, retained, event });
  let nextCamCache = camCache;
  let cacheChanged = false;
  for (const [entity, state] of Object.entries(camCache || {})) {
    const eventResult = updateEventRetention({
      events: state?.events || [],
      id,
      retained
    });
    const shouldSyncKept = entity === activeEntity && state?.kept !== nextKept;
    if (!eventResult.changed && !shouldSyncKept) {
      continue;
    }
    if (!cacheChanged) {
      nextCamCache = { ...camCache };
      cacheChanged = true;
    }
    nextCamCache[entity] = {
      ...state,
      ...eventResult.changed ? { events: eventResult.events } : null,
      ...shouldSyncKept ? { kept: nextKept } : null
    };
  }
  return {
    events: nextEventsResult.events,
    camCache: nextCamCache,
    kept: nextKept
  };
};
const buildFavoriteOptimisticMutation = ({
  id,
  event,
  events = [],
  camCache = {},
  kept = [],
  activeEntity = ""
}) => {
  const nextRetained = !Boolean(event?.retain_indefinitely);
  return {
    nextRetained,
    previousRetained: Boolean(event?.retain_indefinitely),
    ...applyFavoriteMutationState({
      id,
      retained: nextRetained,
      event,
      events,
      camCache,
      kept,
      activeEntity
    })
  };
};
const buildFavoriteRollbackMutation = ({
  id,
  event,
  previousRetained = false,
  events = [],
  camCache = {},
  kept = [],
  activeEntity = ""
}) => applyFavoriteMutationState({
  id,
  retained: previousRetained,
  event,
  events,
  camCache,
  kept,
  activeEntity
});

// src/features/browse/scroll.ctrl.js
const ListScrollController = class {
  constructor({
    list,
    browse,
    syncOlderHint,
    syncBrowseHeadFromScroll,
    getTab,
    isLoading,
    isExhausted,
    loadOlder
  }) {
    __publicField(this, "_onScroll", () => {
      this._syncOlderHint?.();
      this._syncBrowseHeadFromScroll?.();
      const tab = this._getTab?.();
      if (tab !== "clips" && tab !== "snapshot" || this._isLoading?.()) {
        return;
      }
      if (this._isExhausted?.()) return;
      const listScrollable = this._list && this._list.scrollHeight > this._list.clientHeight + 2;
      const scroller = listScrollable ? this._list : this._browse;
      if (!scroller) return;
      const nearBottom = scroller.scrollTop + scroller.clientHeight >= scroller.scrollHeight - 80;
      if (nearBottom) this._loadOlder?.();
    });
    this._list = list;
    this._browse = browse;
    this._syncOlderHint = syncOlderHint;
    this._syncBrowseHeadFromScroll = syncBrowseHeadFromScroll;
    this._getTab = getTab;
    this._isLoading = isLoading;
    this._isExhausted = isExhausted;
    this._loadOlder = loadOlder;
    this._cleanup = new CleanupController();
  }
  bind() {
    if (!this._list && !this._browse) return;
    if (this._list) {
      this._cleanup.addEventListener(this._list, "scroll", this._onScroll, {
        passive: true
      });
    }
    if (this._browse && this._browse !== this._list) {
      this._cleanup.addEventListener(this._browse, "scroll", this._onScroll, {
        passive: true
      });
    }
  }
  dispose() {
    this._cleanup.dispose();
  }
};

// src/card/controls/live-overlay.ctrl.js
const LiveOverlayControlsController = class {
  constructor({ wrap, show, hideNow, hideSoon }) {
    __publicField(this, "_onPointerEnter", (event) => {
      if (event?.pointerType === "mouse") this._show?.();
    });
    __publicField(this, "_onPointerLeave", (event) => {
      if (event?.pointerType === "mouse") this._hideNow?.();
    });
    __publicField(this, "_onPointerDown", (event) => {
      const pointerType = String(event?.pointerType || "").toLowerCase();
      if (pointerType === "mouse") return;
      this._show?.();
      this._hideSoon?.(1300);
    });
    __publicField(this, "_onTouchStart", () => {
      this._show?.();
      this._hideSoon?.(1300);
    });
    this._wrap = wrap;
    this._show = show;
    this._hideNow = hideNow;
    this._hideSoon = hideSoon;
    this._cleanup = new CleanupController();
  }
  bind() {
    if (!this._wrap) return;
    this._cleanup.addEventListener(
      this._wrap,
      "pointerenter",
      this._onPointerEnter,
      { passive: true }
    );
    this._cleanup.addEventListener(
      this._wrap,
      "pointerleave",
      this._onPointerLeave,
      { passive: true }
    );
    this._cleanup.addEventListener(
      this._wrap,
      "pointerdown",
      this._onPointerDown,
      { passive: true }
    );
    this._cleanup.addEventListener(
      this._wrap,
      "touchstart",
      this._onTouchStart,
      {
        passive: true
      }
    );
  }
  dispose() {
    this._cleanup.dispose();
    this._hideNow?.();
  }
};

// src/features/popup/drag.ctrl.js
const POPUP_DRAG_IGNORE_SELECTOR = "#popup-media-controls, #popup-carousel-wrap, #recording-scrub, .popup-info, .viewer, input, button, a, [data-ev]";
const PopupDragController = class {
  constructor({
    popup,
    eventTarget,
    closeThreshold = 100,
    closePopup,
    isPopupOpen
  }) {
    __publicField(this, "_onMouseDown", (event) => {
      if (this._shouldIgnoreDragStart(event.target)) return;
      this._start(event.clientY);
    });
    __publicField(this, "_onTouchStart", (event) => {
      if (this._shouldIgnoreDragStart(event.target)) return;
      this._start(event.touches[0].clientY);
    });
    __publicField(this, "_onMouseMove", (event) => {
      this._move(event.clientY);
    });
    __publicField(this, "_onTouchMove", (event) => {
      this._move(event.touches[0].clientY, event);
    });
    __publicField(this, "_onPointerEnd", () => {
      this._end();
    });
    this._popup = popup;
    this._eventTarget = eventTarget;
    this._closeThreshold = closeThreshold;
    this._closePopup = closePopup;
    this._isPopupOpen = isPopupOpen;
    this._cleanup = new CleanupController();
    this._drag = {
      isDragging: false,
      startY: 0,
      currentY: 0
    };
  }
  bind() {
    if (!this._popup || !this._eventTarget) return;
    this._cleanup.addEventListener(this._popup, "mousedown", this._onMouseDown);
    this._cleanup.addEventListener(
      this._popup,
      "touchstart",
      this._onTouchStart
    );
    this._cleanup.addEventListener(
      this._eventTarget,
      "mousemove",
      this._onMouseMove
    );
    this._cleanup.addEventListener(
      this._eventTarget,
      "touchmove",
      this._onTouchMove,
      { passive: false }
    );
    this._cleanup.addEventListener(
      this._eventTarget,
      "mouseup",
      this._onPointerEnd
    );
    this._cleanup.addEventListener(
      this._eventTarget,
      "touchend",
      this._onPointerEnd
    );
  }
  dispose() {
    this._resetDrag();
    this._cleanup.dispose();
  }
  _start(clientY) {
    this._drag.isDragging = true;
    this._drag.startY = clientY;
    this._drag.currentY = 0;
    this._popup.style.transition = "none";
  }
  _resetDrag() {
    this._drag.isDragging = false;
    this._drag.startY = 0;
    this._drag.currentY = 0;
    if (!this._popup) return;
    this._popup.style.transition = "";
    this._popup.style.transform = "";
  }
  _shouldIgnoreDragStart(target) {
    return !!target?.closest?.(POPUP_DRAG_IGNORE_SELECTOR);
  }
  _move(clientY, event = null) {
    if (!this._popup) return;
    if (!this._drag.isDragging || !this._isPopupOpen?.()) return;
    if (event?.cancelable) event.preventDefault();
    this._drag.currentY = clientY - this._drag.startY;
    if (this._drag.currentY > 0) {
      this._popup.style.transform = `translateY(${this._drag.currentY}px)`;
    }
  }
  _end() {
    if (!this._popup || !this._drag.isDragging) return;
    const currentY = this._drag.currentY;
    this._drag.isDragging = false;
    this._popup.style.transition = "";
    if (currentY > this._closeThreshold) {
      this._closePopup?.();
    } else {
      this._popup.style.transform = "translateY(0)";
    }
    this._drag.currentY = 0;
  }
};

// src/shared/media/controls.js
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const resolvePopupMediaControlsInitPlan = ({
  shouldUseCustomControls = false,
  hasVideo = true
}) => ({
  videoControlsEnabled: Boolean(hasVideo && !shouldUseCustomControls),
  removeVideoControlsAttribute: Boolean(hasVideo && shouldUseCustomControls),
  setVideoControlsAttribute: Boolean(hasVideo && !shouldUseCustomControls),
  controlsHidden: !shouldUseCustomControls,
  resetControlsHiddenClass: true,
  shouldBindCustomControls: Boolean(hasVideo && shouldUseCustomControls)
});
const resolvePopupMediaControlsListenerPlan = ({
  hasProgressControl = false
}) => ({
  progressEvents: hasProgressControl ? [
    { type: "input", action: "scrubPreview" },
    { type: "change", action: "scrubCommit" },
    { type: "pointerdown", action: "dragStart" },
    { type: "pointerup", action: "dragEnd" },
    {
      type: "touchstart",
      action: "touchDragStart",
      options: { passive: true }
    },
    {
      type: "touchend",
      action: "touchDragEnd",
      options: { passive: true }
    }
  ] : [],
  controlsEvents: [
    { type: "pointerdown", action: "showNow" },
    { type: "pointerup", action: "showTemporarily" },
    {
      type: "touchstart",
      action: "showNow",
      options: { passive: true }
    },
    {
      type: "touchend",
      action: "showTemporarily",
      options: { passive: true }
    }
  ],
  syncVideoEvents: [
    "play",
    "pause",
    "timeupdate",
    "durationchange",
    "loadedmetadata",
    "volumechange",
    "seeking",
    "seeked"
  ],
  interactionVideoEvents: [
    {
      type: "touchstart",
      action: "showTemporarily",
      options: { passive: true }
    },
    {
      type: "pointerdown",
      action: "showTemporarily",
      options: { passive: true }
    },
    {
      type: "mousemove",
      action: "showTemporarily",
      options: { passive: true }
    },
    {
      type: "click",
      action: "showTemporarily",
      options: { passive: true }
    }
  ]
});
const buildPopupMediaControlState = ({
  duration = 0,
  currentTime = 0,
  paused = true,
  muted = false,
  formatTime
}) => {
  const safeDuration = Number(duration || 0);
  const safeCurrentTime = Number(currentTime || 0);
  const ratio = safeDuration > 0 ? clamp(safeCurrentTime / safeDuration, 0, 1) : 0;
  return {
    progressValue: String(Math.round(ratio * 1e3)),
    showPauseIcon: !paused,
    showMutedIcon: Boolean(muted),
    timeText: `${formatTime(safeCurrentTime)}/${formatTime(safeDuration)}`
  };
};
const resolvePopupMediaSeekTarget = ({
  progressValue = 0,
  duration = 0
}) => {
  const safeDuration = Number(duration || 0);
  if (!(safeDuration > 0)) return null;
  const next = Number(progressValue || 0) / 1e3 * safeDuration;
  if (!Number.isFinite(next)) return null;
  return clamp(next, 0, safeDuration);
};

// src/features/popup/media.ctrl.js
const PopupMediaControlsController = class {
  constructor({
    controls,
    progress,
    video,
    listenerPlan,
    onShowNow,
    onShowTemporarily,
    onSync
  }) {
    __publicField(this, "_sync", () => {
      this._onSync?.({ progressDragging: this._progressDragging });
    });
    __publicField(this, "_progressHandlers", {
      scrubPreview: () => {
        this._progressDragging = true;
        const next = resolvePopupMediaSeekTarget({
          progressValue: this._progress?.value,
          duration: this._video?.duration
        });
        if (next !== null && this._video) {
          this._video.currentTime = next;
        }
        this._onShowTemporarily?.();
        this._sync();
      },
      scrubCommit: () => {
        this._progressDragging = false;
        this._onShowTemporarily?.();
        this._sync();
      },
      dragStart: () => {
        this._progressDragging = true;
        this._onShowNow?.();
      },
      dragEnd: () => {
        this._progressDragging = false;
        this._onShowTemporarily?.();
      },
      touchDragStart: () => {
        this._progressDragging = true;
      },
      touchDragEnd: () => {
        this._progressDragging = false;
        this._onShowTemporarily?.();
      }
    });
    __publicField(this, "_controlsHandlers", {
      showNow: () => {
        this._onShowNow?.();
      },
      showTemporarily: () => {
        this._onShowTemporarily?.();
      }
    });
    this._controls = controls;
    this._progress = progress;
    this._video = video;
    this._listenerPlan = listenerPlan;
    this._onShowNow = onShowNow;
    this._onShowTemporarily = onShowTemporarily;
    this._onSync = onSync;
    this._cleanup = new CleanupController();
    this._progressDragging = false;
  }
  bind() {
    if (!this._controls || !this._video || !this._listenerPlan) return;
    if (this._progress) {
      this._listenerPlan.progressEvents.forEach(({ type, action, options }) => {
        this._cleanup.addEventListener(
          this._progress,
          type,
          this._progressHandlers[action],
          options
        );
      });
    }
    this._listenerPlan.controlsEvents.forEach(({ type, action, options }) => {
      this._cleanup.addEventListener(
        this._controls,
        type,
        this._controlsHandlers[action],
        options
      );
    });
    this._listenerPlan.syncVideoEvents.forEach((type) => {
      this._cleanup.addEventListener(this._video, type, this._sync);
    });
    this._listenerPlan.interactionVideoEvents.forEach(
      ({ type, action, options }) => {
        this._cleanup.addEventListener(
          this._video,
          type,
          this._controlsHandlers[action],
          options
        );
      }
    );
    this._sync();
  }
  dispose() {
    this._cleanup.dispose();
    this._progressDragging = false;
    this._controls?.classList?.remove("is-hidden");
  }
};

// src/features/popup/media.js
const resolvePopupMediaRenderPlan = ({
  infoOpts = null,
  mediaType = "",
  hasMediaElement = false,
  html = "",
  hasVideo = false
}) => ({
  popupMediaType: String(
    infoOpts?.mediaType || mediaType || ""
  ).toLowerCase(),
  shouldAppendMediaElement: Boolean(hasMediaElement),
  viewerHtml: hasMediaElement ? "" : String(html || ""),
  controlsPlan: hasVideo ? null : resolvePopupMediaControlsInitPlan({
    hasVideo: false
  })
});
const resolvePopupMediaPostRenderPlan = ({
  popupMediaType = "",
  activeId = "",
  hasVideo = false
}) => ({
  shouldEnsureAirPlayButton: true,
  airPlayMediaType: popupMediaType,
  shouldRenderInfo: true,
  shouldInitPopupMediaControls: Boolean(hasVideo),
  shouldResetControlsWithoutVideo: !hasVideo,
  shouldRenderCarousel: true,
  carouselMediaType: popupMediaType,
  carouselActiveId: activeId,
  shouldScheduleRotateOverlay: true,
  shouldShowPopupControls: true
});
const buildPopupClipRenderPlan = ({
  id = "",
  opts = {},
  infoEvent = null,
  isIos = false,
  includeLookupInfo = false
}) => {
  const mediaType = opts.mediaType || "clip";
  return {
    playingId: id,
    mediaFile: isIos ? "master.m3u8" : "clip.mp4",
    mediaType,
    infoEvent,
    infoOpts: includeLookupInfo ? {
      id,
      mediaType,
      startTime: opts.startTime,
      camera: opts.camera
    } : { mediaType }
  };
};
const buildPopupSnapshotRenderPlan = ({ event = null, opts = {} }) => {
  const mediaType = opts.mediaType || "snapshot";
  return {
    playingId: event?.id || "",
    mediaType,
    infoEvent: event,
    infoOpts: { mediaType }
  };
};
const buildPopupInfoDownloadActions = ({
  id = "",
  mediaType = "",
  hasClip = false,
  hasSnapshot = false,
  recStart = null,
  recEnd = null
}) => {
  const normalizedMediaType = String(mediaType || "").toLowerCase();
  const actions = [];
  if (normalizedMediaType === "recording" && Number.isFinite(recStart) && Number.isFinite(recEnd)) {
    actions.push({
      kind: "recording",
      label: "Download recording",
      recStart: Math.floor(recStart),
      recEnd: Math.floor(recEnd),
      icon: "download"
    });
    return actions;
  }
  if (!id) return actions;
  const currentFile = normalizedMediaType === "snapshot" ? "snapshot.jpg" : hasClip ? "clip.mp4" : hasSnapshot ? "snapshot.jpg" : "";
  if (currentFile) {
    actions.push({
      kind: "event",
      id,
      file: currentFile,
      label: currentFile === "snapshot.jpg" ? "Download snapshot" : "Download clip",
      icon: currentFile === "snapshot.jpg" ? "snapshot" : "download"
    });
  }
  if (hasSnapshot && currentFile !== "snapshot.jpg") {
    actions.push({
      kind: "event",
      id,
      file: "snapshot.jpg",
      label: "Download snapshot",
      icon: "snapshot"
    });
  }
  return actions;
};
const buildPopupRecordingRenderPlan = ({
  start = 0,
  end = 0,
  playbackPlan = {}
}) => ({
  popupMediaType: "recording",
  playing: { rec: start },
  infoEvent: null,
  infoOpts: {
    mediaType: "recording",
    startTime: start,
    durationSec: playbackPlan.clipDurationSec,
    camera: playbackPlan.displayCamera,
    objects: "-",
    zone: "-",
    score: "-",
    recStart: start,
    recEnd: end
  },
  chunkEnd: playbackPlan.chunkEnd,
  sourceCandidates: playbackPlan.sourceCandidates || []
});
const buildPopupRecordingSourceAttemptPlan = ({
  sourceCandidates = [],
  autoplay = true
}) => ({
  attempts: sourceCandidates.map((path) => ({
    path,
    autoplay: Boolean(autoplay)
  }))
});
const resolvePopupRecordingSeekListenerPlan = () => ({
  listeners: [
    { type: "seeking", action: "pauseForSeek" },
    { type: "seeked", action: "resumeAfterSeek" }
  ]
});
const buildPopupRecordingScrubInitPlan = ({
  clientId = "",
  cam = "",
  start = 0,
  chunkEnd = 0,
  token = 0,
  sourceUrl = ""
}) => ({
  clientId,
  cam,
  start,
  end: chunkEnd,
  token,
  sourceUrl
});
const resolvePopupRecordingLoadOutcomePlan = ({
  playable = false,
  popupMediaType = "recording"
}) => {
  if (!playable) {
    return {
      shouldShowError: true,
      errorHtml: '<div class="ld">Unable to load recording</div>',
      shouldTeardownScrub: true,
      shouldHideScrub: true,
      shouldEnsureAirPlayButton: false,
      shouldScheduleRotateOverlay: false,
      shouldInitPopupMediaControls: false,
      shouldRenderCarousel: false,
      shouldShowPopupControls: false,
      popupMediaType,
      airPlayMediaType: popupMediaType,
      carouselMediaType: "recording",
      carouselActiveId: ""
    };
  }
  return {
    shouldShowError: false,
    errorHtml: "",
    shouldTeardownScrub: false,
    shouldHideScrub: false,
    shouldEnsureAirPlayButton: true,
    shouldScheduleRotateOverlay: true,
    shouldInitPopupMediaControls: true,
    shouldRenderCarousel: true,
    shouldShowPopupControls: true,
    popupMediaType,
    airPlayMediaType: popupMediaType,
    carouselMediaType: "recording",
    carouselActiveId: ""
  };
};

// src/features/popup/carousel.js
const sortByStartTimeDesc = (items = []) => [...items].sort((a, b) => (b?.start_time || 0) - (a?.start_time || 0));
const buildPopupCarouselItemMarkup = ({
  event = null,
  activeId = "",
  thumbnailHtml = "",
  title = "",
  label = "",
  time = ""
}) => {
  if (!event?.id) return "";
  const active = event.id === activeId ? " active" : "";
  return `<button class="popup-carousel-item${active}" data-ev="${event.id}" title="${title}"><div class="et">${thumbnailHtml}</div><div class="popup-carousel-meta"><span>${label}</span><span>${time}</span></div></button>`;
};
const shouldShowPopupCarousel = (mediaType = "") => ["alert", "clip", "snapshot", "kept"].includes(
  String(mediaType || "").toLowerCase()
);
const buildPopupCarouselEvents = ({
  mediaType = "",
  kept = [],
  reviews = [],
  displayEvents = [],
  findEventById = () => null
}) => {
  const type = String(mediaType || "").toLowerCase();
  if (type === "kept") {
    return sortByStartTimeDesc(kept);
  }
  if (type === "alert") {
    const out = [];
    const seen = new Set();
    for (const review of sortByStartTimeDesc(reviews)) {
      const firstDetection = review?.data?.detections?.[0] || "";
      if (!firstDetection || seen.has(firstDetection)) continue;
      const event = findEventById(firstDetection);
      if (!event) continue;
      seen.add(firstDetection);
      out.push(event);
    }
    return out;
  }
  const all = sortByStartTimeDesc(displayEvents);
  if (type === "snapshot") return all.filter((event) => event.has_snapshot);
  return all.filter((event) => event.has_clip);
};
const resolvePopupCarouselRenderPlan = ({
  mediaType = "",
  eventCount = 0,
  isTouchUi = false
}) => {
  if (!shouldShowPopupCarousel(mediaType)) {
    return {
      shouldRender: false,
      shouldClear: true,
      hidden: true,
      touch: false
    };
  }
  if (!(Number(eventCount || 0) > 0)) {
    return {
      shouldRender: false,
      shouldClear: true,
      hidden: true,
      touch: false
    };
  }
  return {
    shouldRender: true,
    shouldClear: false,
    hidden: false,
    touch: Boolean(isTouchUi)
  };
};
const buildPopupCarouselContentPlan = ({
  mediaType = "",
  events = [],
  activeId = "",
  isTouchUi = false,
  limit = 200,
  renderEvent = () => ""
}) => {
  const limitedEvents = [...events || []].slice(0, Number(limit || 0) || 0);
  const renderPlan = resolvePopupCarouselRenderPlan({
    mediaType,
    eventCount: limitedEvents.length,
    isTouchUi
  });
  return {
    ...renderPlan,
    html: renderPlan.shouldRender ? limitedEvents.map((event) => renderEvent(event, activeId)).join("") : ""
  };
};
const buildPopupCarouselScrollPlan = ({
  itemWidth = 0,
  dir = 1,
  gap = 8,
  fallbackWidth = 132
}) => {
  const width = Number(itemWidth || 0) || Number(fallbackWidth || 0);
  const step = width + Number(gap || 0);
  return {
    left: step * (Number(dir || 0) < 0 ? -1 : 1),
    behavior: "smooth"
  };
};
const resolvePopupCarouselActiveScrollLeft = ({
  activeOffsetLeft = 0,
  padding = 8
}) => Math.max(0, Number(activeOffsetLeft || 0) - Number(padding || 0));

// src/features/browse/filter-state.js
function buildReviewFilterLabels(review, sourceEvent = null) {
  const labels = new Set();
  if (sourceEvent?.label) labels.add(sourceEvent.label);
  (review?.data?.objects || []).forEach((label) => {
    if (label) labels.add(label);
  });
  return [...labels];
}
function buildReviewFilterZones(review, sourceEvent = null) {
  const zones = new Set();
  (sourceEvent?.zones || []).forEach((zone) => {
    if (zone) zones.add(zone);
  });
  (review?.data?.zones || []).forEach((zone) => {
    if (zone) zones.add(zone);
  });
  return [...zones];
}
function collectFilterLabelsFromEvents(events) {
  const labels = new Set();
  (events || []).forEach((event) => {
    if (event?.label) labels.add(event.label);
  });
  return [...labels];
}
function collectFilterZonesFromEvents(events) {
  const zones = new Set();
  (events || []).forEach((event) => {
    (event?.zones || []).forEach((zone) => {
      if (zone) zones.add(zone);
    });
  });
  return [...zones];
}
function collectFilterLabelsFromReviews(reviews, getLabels) {
  const labels = new Set();
  (reviews || []).forEach((review) => {
    (getLabels(review) || []).forEach((label) => {
      if (label) labels.add(label);
    });
  });
  return [...labels];
}
function collectFilterZonesFromReviews(reviews, getZones) {
  const zones = new Set();
  (reviews || []).forEach((review) => {
    (getZones(review) || []).forEach((zone) => {
      if (zone) zones.add(zone);
    });
  });
  return [...zones];
}
function collectUniqueSourceEventsFromReviews(reviews, getSourceEvent) {
  const seen = new Set();
  const out = [];
  (reviews || []).forEach((review) => {
    const sourceEvent = getSourceEvent(review);
    if (!sourceEvent?.id || seen.has(sourceEvent.id)) return;
    seen.add(sourceEvent.id);
    out.push(sourceEvent);
  });
  return out;
}
function selectFilterLabels({
  tab,
  reviews = [],
  events = [],
  getLabels = () => []
}) {
  if (tab === "alerts") {
    return collectFilterLabelsFromReviews(reviews, getLabels);
  }
  return collectFilterLabelsFromEvents(events);
}
function selectFilterZones({
  tab,
  reviews = [],
  events = [],
  getZones = () => []
}) {
  if (tab === "alerts") {
    return collectFilterZonesFromReviews(reviews, getZones);
  }
  return collectFilterZonesFromEvents(events);
}
function selectFilterOptionSourceEvents({
  tab,
  reviews = [],
  keptEvents = [],
  displayEvents = [],
  getSourceEvent = () => null
}) {
  if (tab === "alerts") {
    return collectUniqueSourceEventsFromReviews(reviews, getSourceEvent);
  }
  if (tab === "kept") {
    return [...keptEvents];
  }
  return [...displayEvents];
}
function normalizeFilterSelections({
  filterLabel,
  filterZone,
  labels,
  zones
}) {
  return {
    filterLabel: filterLabel !== "all" && !(labels || []).includes(filterLabel) ? "all" : filterLabel,
    filterZone: filterZone !== "all" && !(zones || []).includes(filterZone) ? "all" : filterZone
  };
}
function matchesEventFilters(event, { filterLabel = "all", filterZone = "all", favOnly = false } = {}) {
  if (!event) return false;
  if (filterLabel !== "all" && event.label !== filterLabel) {
    return false;
  }
  if (filterZone !== "all" && !(event.zones || []).includes(filterZone)) {
    return false;
  }
  if (favOnly && !event.retain_indefinitely) {
    return false;
  }
  return true;
}
function matchesReviewFilters(review, sourceEvent, {
  filterLabel = "all",
  filterZone = "all",
  favOnly = false,
  getLabels = () => [],
  getZones = () => []
} = {}) {
  if (favOnly) return !!sourceEvent?.retain_indefinitely;
  if (filterLabel !== "all") {
    const labels = getLabels(review, sourceEvent);
    if (!labels.includes(filterLabel)) return false;
  }
  if (filterZone !== "all") {
    const zones = getZones(review, sourceEvent);
    if (!zones.includes(filterZone)) return false;
  }
  return true;
}
function selectFilteredEvents({
  tab,
  events = [],
  matchesEvent = () => true
}) {
  let filteredEvents = [...events || []];
  if (tab === "clips") {
    filteredEvents = filteredEvents.filter((event) => event?.has_clip);
  } else if (tab === "snapshot") {
    filteredEvents = filteredEvents.filter((event) => event?.has_snapshot);
  }
  return filteredEvents.filter((event) => matchesEvent(event));
}
function selectFilteredKeptEvents({
  keptEvents = [],
  gridKeptEvents = [],
  isGridMixedListMode = false,
  matchesEvent = () => true
}) {
  const source = isGridMixedListMode ? gridKeptEvents : keptEvents;
  return [...source || []].filter((event) => matchesEvent(event));
}
function reviewSeverityTokens(review) {
  const values = [review?.severity, review?.data?.severity].flatMap((value) => Array.isArray(value) ? value : [value]).map(
    (value) => String(value || "").trim().toLowerCase()
  ).filter(Boolean);
  const tokens = new Set();
  for (const value of values) {
    tokens.add(value);
    for (const token of value.split(/[^a-z0-9]+/g)) {
      if (token) tokens.add(token);
    }
  }
  return tokens;
}
function reviewMatchesAlertsOnlyMode(review) {
  const tokens = reviewSeverityTokens(review);
  if (!tokens.size) return false;
  for (const token of tokens) {
    if (token === "alert" || token.startsWith("alert")) return true;
  }
  return false;
}
function selectReviewsForFilterTab({
  reviews = [],
  gridReviews = [],
  isGridMixedListMode = false,
  showAllReviews = false
}) {
  const reviewSource = isGridMixedListMode ? gridReviews : reviews;
  const safeReviews = [...reviewSource || []];
  if (isGridMixedListMode) {
    return safeReviews;
  }
  return showAllReviews ? safeReviews : safeReviews.filter((review) => reviewMatchesAlertsOnlyMode(review));
}
const BrowseFilterController = class {
  constructor(host, { buildFilterPanelMarkup: buildFilterPanelMarkup2 } = {}) {
    this._host = host;
    this._buildFilterPanelMarkup = buildFilterPanelMarkup2;
  }
  handleSidebarFilterClick(target) {
    const filterLabelOption = target.closest("[data-flabel]");
    if (filterLabelOption) {
      this._host._filterLabel = filterLabelOption.dataset.flabel;
      this.renderFilter();
      this._host._renderList();
      return true;
    }
    const filterZoneOption = target.closest("[data-fzone]");
    if (filterZoneOption) {
      this._host._filterZone = filterZoneOption.dataset.fzone;
      this.renderFilter();
      this._host._renderList();
      return true;
    }
    const favoriteOnlyOption = target.closest("[data-favonly]");
    if (favoriteOnlyOption) {
      this._host._favOnly = favoriteOnlyOption.dataset.favonly === "1";
      this.renderFilter();
      this._host._renderList();
      return true;
    }
    return false;
  }
  toggleFilter() {
    if (this._host._tab === "recordings") return;
    const filterPanel = this._host._pageShellRegion("filterPanel");
    if (!filterPanel) return;
    const open = filterPanel.style.display === "none";
    const calendarPanel = this._host._pageShellRegion("calendarPanel");
    if (calendarPanel) calendarPanel.style.display = "none";
    filterPanel.style.display = open ? "block" : "none";
    this._host._syncToolbarButtons();
    if (open) this.renderFilter();
  }
  renderFilter() {
    const filterPanel = this._host._pageShellRegion("filterPanel");
    if (!filterPanel || !this._buildFilterPanelMarkup) return;
    this.normalizeFilterSelections();
    filterPanel.innerHTML = this._buildFilterPanelMarkup({
      labels: ["all", ...this.labels()],
      zones: ["all", ...this.zones()],
      filterLabel: this._host._filterLabel,
      filterZone: this._host._filterZone,
      favOnly: this._host._favOnly
    });
  }
  reviewsForTabBase() {
    return selectReviewsForFilterTab({
      reviews: this._host._reviews,
      gridReviews: this._host._allGridReviews(),
      isGridMixedListMode: this._host._isGridMixedListMode(),
      showAllReviews: this._host._activeCam?.alerts_content === "all_reviews"
    });
  }
  reviewSourceEvent(review) {
    const firstDet = review?.data?.detections && review.data.detections[0] || "";
    return firstDet ? this._host._findEventById(firstDet) : null;
  }
  filterOptionSourceEvents() {
    return selectFilterOptionSourceEvents({
      tab: this._host._tab,
      reviews: this.reviewsForTabBase(),
      keptEvents: this._host._isGridMixedListMode() ? this._host._allGridKeptEvents() : this._host._kept || [],
      displayEvents: this._host._allDisplayEvents(),
      getSourceEvent: (review) => this.reviewSourceEvent(review)
    });
  }
  matchesEventFilters(event) {
    return matchesEventFilters(event, {
      filterLabel: this._host._filterLabel,
      filterZone: this._host._filterZone,
      favOnly: this._host._favOnly
    });
  }
  filteredReviews() {
    return this.reviewsForTabBase().filter((review) => {
      const sourceEvent = this.reviewSourceEvent(review);
      return matchesReviewFilters(review, sourceEvent, {
        filterLabel: this._host._filterLabel,
        filterZone: this._host._filterZone,
        favOnly: this._host._favOnly,
        getLabels: (candidateReview, candidateSourceEvent) => this.reviewFilterLabels(candidateReview, candidateSourceEvent),
        getZones: (candidateReview, candidateSourceEvent) => this.reviewFilterZones(candidateReview, candidateSourceEvent)
      });
    });
  }
  filteredKept() {
    return selectFilteredKeptEvents({
      keptEvents: this._host._kept || [],
      gridKeptEvents: this._host._allGridKeptEvents(),
      isGridMixedListMode: this._host._isGridMixedListMode(),
      matchesEvent: (event) => this.matchesEventFilters(event)
    });
  }
  normalizeFilterSelections() {
    const normalized = normalizeFilterSelections({
      filterLabel: this._host._filterLabel,
      filterZone: this._host._filterZone,
      labels: this.labels(),
      zones: this.zones()
    });
    this._host._filterLabel = normalized.filterLabel;
    this._host._filterZone = normalized.filterZone;
  }
  zones() {
    return selectFilterZones({
      tab: this._host._tab,
      reviews: this.reviewsForTabBase(),
      events: this.filterOptionSourceEvents(),
      getZones: (review) => {
        const sourceEvent = this.reviewSourceEvent(review);
        return this.reviewFilterZones(review, sourceEvent);
      }
    });
  }
  labels() {
    return selectFilterLabels({
      tab: this._host._tab,
      reviews: this.reviewsForTabBase(),
      events: this.filterOptionSourceEvents(),
      getLabels: (review) => {
        const sourceEvent = this.reviewSourceEvent(review);
        return this.reviewFilterLabels(review, sourceEvent);
      }
    });
  }
  reviewFilterLabels(review, sourceEvent = null) {
    return buildReviewFilterLabels(review, sourceEvent);
  }
  reviewFilterZones(review, sourceEvent = null) {
    return buildReviewFilterZones(review, sourceEvent);
  }
  filtered() {
    return selectFilteredEvents({
      tab: this._host._tab,
      events: this._host._allDisplayEvents(),
      matchesEvent: (event) => this.matchesEventFilters(event)
    });
  }
};

// src/features/browse/collection.ctrl.js
const BrowseCollectionController = class {
  constructor(host) {
    this._host = host;
  }
  allGridReviews() {
    const reviews = [];
    const seen = new Set();
    for (const camera of this._host._config.cameras || []) {
      const cameraKey = String(
        this._host._camCache[camera.entity]?.cam || camera.entity || ""
      );
      const cache = this._host._camCache[camera.entity];
      for (const review of cache?.reviews || []) {
        const id = String(review?.id || "");
        if (!id) continue;
        const dedupeKey = `${cameraKey}|${id}`;
        if (seen.has(dedupeKey)) continue;
        seen.add(dedupeKey);
        reviews.push(review);
      }
    }
    return reviews;
  }
  allGridKeptEvents() {
    const events = [];
    const seen = new Set();
    for (const camera of this._host._config.cameras || []) {
      const cache = this._host._camCache[camera.entity];
      for (const event of cache?.kept || []) {
        const id = String(event?.id || "");
        if (!id || seen.has(id)) continue;
        seen.add(id);
        events.push(event);
      }
    }
    return events;
  }
  findReviewById(id) {
    if (!id) return null;
    const target = String(id);
    if (this._host._isGridMixedListMode()) {
      return this.allGridReviews().find(
        (review) => String(review?.id || "") === target
      ) || null;
    }
    return (this._host._reviews || []).find(
      (review) => String(review?.id || "") === target
    ) || null;
  }
  async loadGridMixedTabData(tab) {
    const before = this._host._winEnd;
    const reviewDays = this._host._config?.alerts_reviews_days || 3;
    const reviewsAfter = Math.max(0, Math.floor(before - reviewDays * 86400));
    for (const camera of this._host._config.cameras || []) {
      const showAllReviews = camera?.alerts_content === "all_reviews";
      const entity = camera.entity;
      if (!entity) continue;
      try {
        if (!this._host._camCache[entity]?.discovered) {
          await this._host._discoverOne(entity);
        }
      } catch (_) {
        continue;
      }
      const cache = this._host._camCache[entity];
      const clientId = cache?.clientId;
      const cam = cache?.cam;
      if (!clientId || !cam) continue;
      try {
        if (tab === "alerts") {
          const resolved = await (this._host._browseWindowLoaderController?.fetchRecentActiveDayReviews?.(
            clientId,
            cam,
            before,
            reviewDays,
            {
              debugLabel: "grid-alerts-tab",
              itemFilter: showAllReviews ? null : reviewMatchesAlertsOnlyMode
            }
          ) ?? this._host._fetchWindowedReviews?.(
            clientId,
            cam,
            reviewsAfter,
            before,
            {
              debugLabel: "grid-alerts-tab"
            }
          ));
          const reviews = Array.isArray(resolved?.items) ? resolved.items : resolved;
          cache.reviews = Array.isArray(reviews) ? reviews : [];
        }
        if (tab === "kept") {
          const kept = await this._host._ws({
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
  allDisplayEvents() {
    if (this._host._eventsMode === "all") {
      const seen = new Set();
      const all = [];
      for (const camera of this._host._config.cameras) {
        const cache = this._host._camCache[camera.entity];
        if (!cache) continue;
        for (const event of cache.events || []) {
          if (seen.has(event.id)) continue;
          seen.add(event.id);
          all.push(event);
        }
      }
      return all.sort((a, b) => b.start_time - a.start_time);
    }
    return this._host._events;
  }
  findEventById(id) {
    if (!id) return null;
    const all = this.allDisplayEvents();
    let event = all.find((candidate) => candidate.id === id);
    if (event) return event;
    for (const camera of this._host._config.cameras) {
      const cache = this._host._camCache[camera.entity];
      event = (cache?.events || []).find((candidate) => candidate.id === id);
      if (event) return event;
    }
    event = (this._host._kept || []).find((candidate) => candidate.id === id);
    return event || null;
  }
};

// src/features/browse/calendar-activity.ctrl.js
const BrowseCalendarActivityController = class {
  constructor(host) {
    this._host = host;
  }
  async loadCalendar() {
    await this.prefetchCalendarActivityForActiveCamera();
  }
  calendarActivityCacheKey(clientId, cam, tz = this._host._tz()) {
    return `${clientId || ""}|${cam || ""}|${tz || "UTC"}`;
  }
  applyCalendarActivityCacheForActiveCamera() {
    const { clientId, cam } = this._host._cc();
    const key = this.calendarActivityCacheKey(clientId, cam);
    const cached = this._host._calendarActivityByCam.get(key);
    this._host._daysWithActivity = cached ? new Set(cached) : new Set();
  }
  async prefetchCalendarActivityForActiveCamera() {
    const { clientId, cam } = this._host._cc();
    if (!clientId || !cam) {
      this._host._daysWithActivity = new Set();
      return;
    }
    const tz = this._host._tz();
    const key = this.calendarActivityCacheKey(clientId, cam, tz);
    const cached = this._host._calendarActivityByCam.get(key);
    if (cached) {
      this._host._daysWithActivity = new Set(cached);
      return;
    }
    const existing = this._host._calendarActivityInFlight.get(key);
    if (existing) {
      await existing;
      return;
    }
    const task = (async () => {
      try {
        const summary = await this._host._ws({
          type: "frigate/events/summary",
          instance_id: clientId,
          timezone: tz
        });
        const days = Array.isArray(summary) ? new Set(
          summary.filter((item) => item.camera === cam && item.day).map((item) => item.day)
        ) : new Set();
        this._host._calendarActivityByCam.set(key, days);
        const active = this._host._cc();
        const activeKey = this.calendarActivityCacheKey(
          active.clientId,
          active.cam,
          tz
        );
        if (activeKey === key) {
          this._host._daysWithActivity = new Set(days);
          if (this._host._$("cal-panel")?.style.display !== "none") {
            this._host._renderCal();
          }
        }
      } catch (_) {
      }
    })();
    this._host._calendarActivityInFlight.set(key, task);
    try {
      await task;
    } finally {
      this._host._calendarActivityInFlight.delete(key);
    }
  }
};

// src/features/browse/tab-data.ctrl.js
const BrowseTabDataController = class {
  constructor(host) {
    this._host = host;
  }
  async loadKept() {
    const { clientId, cam } = this._host._cc();
    try {
      const kept = await this._host._ws({
        type: "frigate/events/get",
        instance_id: clientId,
        cameras: [cam],
        favorites: true,
        limit: 50
      });
      this._host._kept = Array.isArray(kept) ? kept : [];
      const entity = this._host._activeCam?.entity;
      if (entity && this._host._camCache[entity]) {
        this._host._camCache[entity].kept = this._host._kept;
      }
    } catch (_) {
      this._host._kept = [];
    }
  }
  async loadReviews() {
    const { clientId, cam } = this._host._cc();
    try {
      const before = this._host._winEnd;
      const days = this._host._config?.alerts_reviews_days || 3;
      const windowLoader = this._host._browseWindowLoaderController;
      if (windowLoader?.hasCachedWindowReviews?.(clientId, cam, before)) {
        const entity = this._host._activeCam?.entity;
        this._host._reviews = this._host._camCache[entity]?.reviews || [];
        return;
      }
      const showAllReviews = this._host._activeCam?.alerts_content === "all_reviews";
      const resolved = await (windowLoader?.fetchRecentActiveDayReviews?.(
        clientId,
        cam,
        before,
        days,
        {
          debugLabel: "alerts-tab",
          itemFilter: showAllReviews ? null : reviewMatchesAlertsOnlyMode
        }
      ) ?? this._host._fetchWindowedReviews?.(
        clientId,
        cam,
        Math.max(0, Math.floor(before - days * DAY)),
        before,
        {
          debugLabel: "alerts-tab"
        }
      ));
      const reviews = Array.isArray(resolved?.items) ? resolved.items : resolved;
      this._host._reviews = Array.isArray(reviews) ? reviews : [];
      windowLoader?.cacheWindowReviews?.(
        clientId,
        cam,
        before,
        this._host._reviews
      ) ?? this._host._cacheActiveCamSlice?.("reviews", this._host._reviews);
      this._host._slideshowAlertController.handleReviewsUpdated(
        this._host._activeCam?.entity || "",
        this._host._reviews,
        "alerts-tab"
      );
    } catch (_) {
      this._host._reviews = [];
    }
  }
  async loadTabData(tab) {
    if (tab !== "alerts" && tab !== "kept" && tab !== "recordings" && tab !== "controls") {
      return;
    }
    try {
      if (tab === "alerts") await this.loadReviews();
      if (tab === "kept") await this.loadKept();
      if (this._host._isGridMixedListMode() && (tab === "alerts" || tab === "kept")) {
        await this._host._loadGridMixedTabData(tab);
      }
      if (tab === "recordings") {
        const { clientId, cam } = this._host._cc();
        if (clientId && cam) {
          await (this._host._browseWindowLoaderController?.loadWindowRecordings?.(
            clientId,
            cam,
            this._host._winEnd
          ) ?? this._host._loadWindowRecordings?.(
            clientId,
            cam,
            this._host._winEnd
          ));
        }
      }
    } catch (error) {
      console.error("[Frigate] tab data load failed", error);
    } finally {
      this._host._renderList();
    }
  }
};

// src/data/window-fetch.js
async function fetchWindowedItems({
  after,
  before,
  opts = {},
  defaultPageLimit,
  defaultBatchLimit,
  useOptionLimit = true,
  fetchBatch,
  getItemStartTime
}) {
  const items = [];
  const seen = new Set();
  const afterTs = Math.floor(after);
  let cursorBefore = Math.floor(
    Number.isFinite(opts?.cursorBefore) ? opts.cursorBefore : before
  );
  const pageLimit = Math.max(
    1,
    Number.isFinite(opts?.pageLimit) ? Math.floor(opts.pageLimit) : defaultPageLimit
  );
  const batchLimit = useOptionLimit ? Math.max(
    1,
    Number.isFinite(opts?.limit) ? Math.floor(opts.limit) : defaultBatchLimit
  ) : defaultBatchLimit;
  const onPage = typeof opts?.onPage === "function" ? opts.onPage : null;
  for (let page = 0; page < pageLimit; page++) {
    const batch = await fetchBatch({
      after: afterTs,
      before: cursorBefore,
      limit: batchLimit,
      page
    });
    if (!Array.isArray(batch) || !batch.length) break;
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
      ...batch.map((item) => Math.floor(getItemStartTime(item, before)))
    );
    if (batch.length < batchLimit || oldest <= afterTs) break;
    cursorBefore = oldest - 1;
  }
  onPage?.(items, { page: -1, done: true });
  return items;
}

// src/features/recordings/utils/day.js
function resolveRecordingsDayBounds({
  tsSec = null,
  fallbackSec = null,
  getTzParts = () => ({}),
  toEpochSeconds = () => 0,
  nowSec = Date.now() / 1e3
}) {
  const target = Math.floor(tsSec || fallbackSec || nowSec);
  const parts = getTzParts(target);
  const start = toEpochSeconds(parts.year, parts.month, parts.day, 0, 0, 0);
  const end = toEpochSeconds(parts.year, parts.month, parts.day, 23, 59, 59);
  return { start, end };
}
function resolveOffsetRecordingsDayBounds({
  offsetDays = 0,
  fallbackSec = null,
  getTzParts = () => ({}),
  toEpochSeconds = () => 0,
  nowSec = Date.now() / 1e3
}) {
  const base = getTzParts(fallbackSec || nowSec);
  const shifted = new Date(
    Date.UTC(base.year, base.month - 1, base.day + offsetDays, 12, 0, 0)
  );
  const year = shifted.getUTCFullYear();
  const month = shifted.getUTCMonth() + 1;
  const day = shifted.getUTCDate();
  return {
    start: toEpochSeconds(year, month, day, 0, 0, 0),
    end: toEpochSeconds(year, month, day, 23, 59, 59)
  };
}

// src/features/browse/window-loader.ctrl.js
const BrowseWindowLoaderController = class {
  constructor(host, deps = {}) {
    this._host = host;
    this._deps = {
      fetchWindowedItems,
      ...deps
    };
  }
  async fetchWindowedEvents(clientId, cam, after, before, opts = {}) {
    return this._deps.fetchWindowedItems({
      after,
      before,
      opts,
      defaultPageLimit: WINDOW_FETCH_PAGE_LIMIT,
      defaultBatchLimit: EVENT_FETCH_BATCH,
      useOptionLimit: true,
      fetchBatch: ({ after: afterTs, before: beforeTs, limit }) => this._host._ws({
        type: "frigate/events/get",
        instance_id: clientId,
        cameras: [cam],
        after: afterTs,
        before: beforeTs,
        limit
      }),
      getItemStartTime: (item, fallbackBefore) => item?.start_time || fallbackBefore
    });
  }
  async warmOtherCamerasEvents() {
    const token = ++this._host._warmCamsToken;
    const activeEntity = this._host._activeCam?.entity;
    const after = this._host._winStart;
    const before = this._host._winEnd;
    for (const camera of this._host._config.cameras) {
      if (camera.entity === activeEntity) continue;
      const entity = camera.entity;
      const cache = this._host._camCache[entity];
      if (!cache?.clientId || !cache?.cam) continue;
      if (Array.isArray(cache.events) && cache.events.length >= INACTIVE_WARM_EVENT_LIMIT) {
        continue;
      }
      try {
        const events = await this.fetchWindowedEvents(
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
        if (token !== this._host._warmCamsToken) return;
        if (after !== this._host._winStart || before !== this._host._winEnd) {
          return;
        }
        cache.events = Array.isArray(events) ? events.slice(0, INACTIVE_WARM_EVENT_LIMIT) : [];
      } catch (_) {
      }
    }
  }
  scheduleWarmOtherCamerasEvents(delayMs = 1e3) {
    if (this._host._warmOtherCamsDelayT) {
      clearTimeout(this._host._warmOtherCamsDelayT);
    }
    this._host._warmOtherCamsDelayT = setTimeout(
      () => {
        this._host._warmOtherCamsDelayT = null;
        if (!this._host.isConnected) return;
        void this.warmOtherCamerasEvents();
      },
      Math.max(0, Number(delayMs) || 0)
    );
  }
  pruneNonActiveCamWindowCaches() {
    this._host._warmCamsToken++;
    const activeEntity = this._host._activeCam?.entity;
    for (const camera of this._host._config.cameras) {
      const entity = camera.entity;
      if (entity === activeEntity) continue;
      const cache = this._host._camCache[entity];
      if (!cache) continue;
      cache.events = [];
      cache.recordings = [];
      cache.reviews = [];
      cache.reviewsWindowKey = "";
    }
  }
  async fetchWindowedReviews(clientId, cam, after, before, opts = {}) {
    return this._deps.fetchWindowedItems({
      after,
      before,
      opts,
      defaultPageLimit: WINDOW_FETCH_PAGE_LIMIT,
      defaultBatchLimit: REVIEW_FETCH_BATCH,
      useOptionLimit: false,
      fetchBatch: ({ after: afterTs, before: beforeTs, limit }) => this._host._ws({
        type: "frigate/reviews/get",
        instance_id: clientId,
        cameras: [cam],
        after: afterTs,
        before: beforeTs,
        limit
      }),
      getItemStartTime: (item, fallbackBefore) => item?.start_time || fallbackBefore
    });
  }
  _dayKeyForItem(item) {
    const ts = Math.floor(Number(item?.start_time) || 0);
    if (typeof this._host._dayKey === "function") {
      return this._host._dayKey(ts);
    }
    const date = new Date(ts * 1e3);
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, "0");
    const day = String(date.getUTCDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }
  _filterToRecentDaysWithData(items, dayCount) {
    const targetDayCount = Math.max(1, Number(dayCount) || 1);
    const sorted = Array.isArray(items) ? items.slice().sort((a, b) => (b?.start_time || 0) - (a?.start_time || 0)) : [];
    const selectedDays = new Set();
    for (const item of sorted) {
      const key = this._dayKeyForItem(item);
      if (!key) continue;
      selectedDays.add(key);
      if (selectedDays.size >= targetDayCount) break;
    }
    if (!selectedDays.size) return [];
    return sorted.filter((item) => selectedDays.has(this._dayKeyForItem(item)));
  }
  async _fetchRecentActiveDaysItems({
    clientId,
    cam,
    before,
    dayCount,
    fetcher,
    debugLabel,
    itemFilter
  }) {
    const targetDayCount = Math.max(1, Number(dayCount) || 1);
    let spanDays = targetDayCount;
    const maxSpanDays = Math.max(targetDayCount * 16, targetDayCount + 30);
    let bestItems = [];
    let bestDayCount = 0;
    while (true) {
      const after = Math.max(0, Math.floor(before - spanDays * DAY));
      const items = await fetcher(after, before, {
        debugLabel
      });
      const latestItems = Array.isArray(items) ? typeof itemFilter === "function" ? items.filter((item) => itemFilter(item)) : items : [];
      const filtered = this._filterToRecentDaysWithData(
        latestItems,
        targetDayCount
      );
      const dayCountFound = new Set(
        filtered.map((item) => this._dayKeyForItem(item))
      ).size;
      if (dayCountFound > bestDayCount) {
        bestDayCount = dayCountFound;
        bestItems = filtered;
      }
      if (dayCountFound >= targetDayCount || spanDays >= maxSpanDays) {
        const bestResult = bestDayCount >= dayCountFound ? bestItems : filtered;
        return {
          items: bestResult,
          after
        };
      }
      spanDays = Math.min(maxSpanDays, spanDays * 2);
    }
  }
  async fetchRecentActiveDayEvents(clientId, cam, before, dayCount, opts = {}) {
    const result = await this._fetchRecentActiveDaysItems({
      clientId,
      cam,
      before,
      dayCount,
      debugLabel: opts.debugLabel || "events-active-days",
      fetcher: (after, beforeTs, fetchOpts) => this.fetchWindowedEvents(clientId, cam, after, beforeTs, fetchOpts)
    });
    return result;
  }
  async fetchRecentActiveDayReviews(clientId, cam, before, dayCount, opts = {}) {
    const result = await this._fetchRecentActiveDaysItems({
      clientId,
      cam,
      before,
      dayCount,
      debugLabel: opts.debugLabel || "reviews-active-days",
      itemFilter: typeof opts.itemFilter === "function" ? opts.itemFilter : null,
      fetcher: (after, beforeTs, fetchOpts) => this.fetchWindowedReviews(clientId, cam, after, beforeTs, fetchOpts)
    });
    return result;
  }
  async loadWindow(replace) {
    if (this._host._isPreviewPageActive()) return;
    if (this._host._loading) return;
    this._host._loading = true;
    this._host._reloadPending = false;
    this._host._reloadAfterLoad = false;
    if (replace) this._host._exhausted = false;
    if (this._host._followNowWindow) {
      const now = Math.floor(Date.now() / 1e3);
      this._host._winEnd = now;
      this._host._winStart = now - this._host._config.window_days * DAY;
    }
    const { clientId, cam } = this._host._cc();
    if (!clientId || !cam) {
      this._host._loading = false;
      return;
    }
    const after = this._host._winStart;
    const before = this._host._winEnd;
    const reviewsTask = this.loadWindowReviewsIfNeeded(
      clientId,
      cam,
      after,
      before
    );
    const eventsTask = this.loadWindowEvents(clientId, cam, after, before);
    await Promise.allSettled([
      reviewsTask,
      eventsTask,
      this._host._tab === "recordings" ? this.loadWindowRecordings(clientId, cam, before) : Promise.resolve()
    ]);
    const entity = this._host._activeCam?.entity;
    if (entity && this._host._camCache[entity]) {
      this._host._camCache[entity].events = this._host._events;
      this._host._camCache[entity].recordings = this._host._recordings;
    }
    this._host._loading = false;
    if (this._host._reloadAfterLoad) {
      this._host._reloadAfterLoad = false;
      this._host._scheduleReload();
    }
    this._host._deepLinkController?.consumeDeepLinkReviewOpen?.() ?? this._host._consumeDeepLinkReviewOpen?.();
    this._host._deepLinkController?.consumeDeepLinkEventOpen?.() ?? this._host._consumeDeepLinkEventOpen?.();
    if (this._host._eventsMode === "all") this._host._loadAllCamsBackground();
    this._host._renderAll();
  }
  async loadOlder() {
    const before = this._host._events.length ? Math.floor(
      Math.min(...this._host._events.map((event) => event.start_time))
    ) : this._host._winStart;
    this._host._loading = true;
    const { clientId, cam } = this._host._cc();
    try {
      const older = await this._host._ws({
        type: "frigate/events/get",
        instance_id: clientId,
        cameras: [cam],
        before,
        limit: 50
      });
      const nextEvents = Array.isArray(older) ? older.filter(
        (olderEvent) => !this._host._events.some(
          (currentEvent) => currentEvent.id === olderEvent.id
        )
      ) : [];
      if (!nextEvents.length) {
        this._host._exhausted = true;
      } else {
        this._host._events = this._host._events.concat(nextEvents);
        this._host._winStart = Math.min(
          this._host._winStart,
          ...nextEvents.map((event) => event.start_time)
        );
      }
    } catch (_) {
    }
    this._host._loading = false;
    this._host._renderList();
    this._host._renderSubtitle();
  }
  cacheActiveCamSlice(key, value) {
    const entity = this._host._activeCam?.entity;
    if (entity && this._host._camCache[entity]) {
      this._host._camCache[entity][key] = value;
    }
  }
  reviewWindowCacheKey(clientId, cam, before) {
    const days = this._host._config?.alerts_reviews_days || 3;
    const contentMode = this._host._activeCam?.alerts_content === "all_reviews" ? "all_reviews" : "alerts_only";
    return `${clientId}|${cam}|${Math.floor(before)}|${days}|${contentMode}`;
  }
  hasCachedWindowReviews(clientId, cam, before) {
    const entity = this._host._activeCam?.entity;
    const cache = entity ? this._host._camCache[entity] : null;
    return !!cache && cache.reviewsWindowKey === this.reviewWindowCacheKey(clientId, cam, before);
  }
  cacheWindowReviews(clientId, cam, before, reviews) {
    const entity = this._host._activeCam?.entity;
    const cache = entity ? this._host._camCache[entity] : null;
    if (!cache) return;
    cache.reviews = reviews;
    cache.reviewsWindowKey = this.reviewWindowCacheKey(clientId, cam, before);
  }
  async loadWindowEvents(clientId, cam, after, before) {
    try {
      const resolved = await this.fetchRecentActiveDayEvents(
        clientId,
        cam,
        before,
        this._host._config?.window_days || 1,
        { debugLabel: "events-window" }
      );
      this._host._events = Array.isArray(resolved?.items) ? resolved.items : [];
      if (this._host._events.length) {
        this._host._winStart = Math.min(
          ...this._host._events.map(
            (item) => Math.floor(item?.start_time || before)
          )
        );
      } else if (Number.isFinite(resolved?.after)) {
        this._host._winStart = resolved.after;
      } else {
        this._host._winStart = after;
      }
      this.cacheActiveCamSlice("events", this._host._events);
      this._host._renderList();
      this._host._renderStats();
    } catch (error) {
      console.error("[Frigate] events", error);
      this._host._events = [];
    }
  }
  async loadWindowRecordings(clientId, cam, before) {
    const bounds = this._host._recordingsDayBounds ? this._host._recordingsDayBounds(before) : resolveRecordingsDayBounds({
      tsSec: before,
      fallbackSec: this._host._winEnd,
      getTzParts: (target) => this._host._tzParts(target),
      toEpochSeconds: (year, month, day, hour, minute, second) => this._host._tzDateTimeToEpochSeconds(
        year,
        month,
        day,
        hour,
        minute,
        second
      )
    });
    const cacheKey = `${clientId}|${cam}|${bounds.start}|${bounds.end}`;
    try {
      const recordings = await this._host._ws({
        type: "frigate/recordings/get",
        instance_id: clientId,
        camera: cam,
        after: Math.max(0, bounds.start),
        before: bounds.end
      });
      this._host._recordings = Array.isArray(recordings) ? recordings : [];
      this._host._recordingsDayDataCache.set(cacheKey, this._host._recordings);
      this._host._recordingsDayAvailabilityCache.set(
        cacheKey,
        this._host._recordings.length > 0
      );
      this.cacheActiveCamSlice("recordings", this._host._recordings);
      this._host._renderList();
    } catch (_) {
      this._host._recordings = [];
    }
  }
  async loadWindowReviewsIfNeeded(clientId, cam, _after, before) {
    if (this._host._tab !== "alerts") return;
    try {
      const showAllReviews = this._host._activeCam?.alerts_content === "all_reviews";
      const resolved = await this.fetchRecentActiveDayReviews(
        clientId,
        cam,
        before,
        this._host._config?.alerts_reviews_days || 3,
        {
          debugLabel: "alerts-window",
          itemFilter: showAllReviews ? null : reviewMatchesAlertsOnlyMode
        }
      );
      this._host._reviews = Array.isArray(resolved?.items) ? resolved.items : [];
      this.cacheWindowReviews(clientId, cam, before, this._host._reviews);
      this._host._renderList();
      this._host._slideshowAlertController.handleReviewsUpdated(
        this._host._activeCam?.entity || "",
        this._host._reviews,
        "alerts-window"
      );
    } catch (_) {
      this._host._reviews = [];
    }
  }
  goNow() {
    this._host._followNowWindow = true;
    const now = Math.floor(Date.now() / 1e3);
    this._host._winEnd = now;
    this._host._winStart = now - this._host._config.window_days * DAY;
    this._host._calSelectedDay = this._host._formatTzDateString(
      this._host._tzParts(now)
    );
    this._host._exhausted = false;
    this._host._calMonth = null;
    this.pruneNonActiveCamWindowCaches();
    void (async () => {
      await this.loadWindow(true);
      this.scheduleWarmOtherCamerasEvents();
    })();
  }
};

// src/features/recordings/utils/availability.js
function buildRecordingsDayCacheKey(clientId, camera, bounds = {}) {
  return `${clientId}|${camera}|${bounds.start}|${bounds.end}`;
}
function resolvePreparedRecordingsDayTransition({
  direction = 0,
  bounds = null,
  todayBounds = null,
  clientId = "",
  camera = "",
  dataCache = null
}) {
  const emptyResult = {
    hasData: false,
    bounds,
    recs: []
  };
  if (direction > 0 && Number(bounds?.end || 0) > Number(todayBounds?.end || 0)) {
    return {
      done: true,
      key: "",
      result: emptyResult
    };
  }
  if (!clientId || !camera) {
    return {
      done: true,
      key: "",
      result: emptyResult
    };
  }
  const key = buildRecordingsDayCacheKey(clientId, camera, bounds);
  if (dataCache?.has(key)) {
    const recordings = dataCache.get(key) || [];
    return {
      done: true,
      key,
      result: {
        hasData: recordings.length > 0,
        bounds,
        recs: recordings
      }
    };
  }
  return {
    done: false,
    key,
    result: null
  };
}
function resolveCachedRecordingsAvailability({
  key = "",
  dataCache = null,
  availabilityCache = null
}) {
  if (dataCache?.has(key)) {
    const recordings = dataCache.get(key) || [];
    return {
      found: true,
      hasRecordings: recordings.length > 0,
      shouldSyncAvailability: true
    };
  }
  if (availabilityCache?.has(key)) {
    return {
      found: true,
      hasRecordings: !!availabilityCache.get(key),
      shouldSyncAvailability: false
    };
  }
  return {
    found: false,
    hasRecordings: false,
    shouldSyncAvailability: false
  };
}
function normalizeFetchedRecordingsAvailability(recordings) {
  const safeRecordings = Array.isArray(recordings) ? recordings : [];
  return {
    recordings: safeRecordings,
    hasRecordings: safeRecordings.length > 0
  };
}
function resolveFetchedRecordingsAvailabilityState(recordings) {
  const normalized = normalizeFetchedRecordingsAvailability(recordings);
  return {
    recordings: normalized.recordings,
    hasRecordings: normalized.hasRecordings,
    availabilityValue: normalized.hasRecordings
  };
}
function resolveFailedRecordingsAvailabilityState() {
  return {
    recordings: null,
    hasRecordings: false,
    availabilityValue: false
  };
}
function resolveCommittedRecordingsDayState({
  bounds = null,
  recordings = null,
  clientId = "",
  camera = ""
}) {
  const safeRecordings = Array.isArray(recordings) ? recordings : [];
  return {
    bounds,
    recordings: safeRecordings,
    hasRecordings: safeRecordings.length > 0,
    key: clientId && camera && bounds ? buildRecordingsDayCacheKey(clientId, camera, bounds) : ""
  };
}
function buildPreparedRecordingsDayResult(bounds, recordings) {
  const normalized = normalizeFetchedRecordingsAvailability(recordings);
  return {
    hasData: normalized.hasRecordings,
    bounds,
    recs: normalized.recordings
  };
}

// src/features/recordings/utils/browse-nav.js
function resolveRecordingsBrowseNavContextState({
  clientId = "",
  camera = "",
  currentBounds = null,
  todayBounds = null,
  hasPrev = false,
  hasNext = false
}) {
  const hasContext = !!clientId && !!camera;
  if (!hasContext) {
    return {
      hasContext: false,
      isTodayOrFuture: false,
      shouldProbeNext: false,
      prevDisabled: true,
      nextDisabled: true
    };
  }
  return {
    hasContext: true,
    ...resolveRecordingsBrowseNavState({
      currentBounds,
      todayBounds,
      hasPrev,
      hasNext
    })
  };
}
function resolveRecordingsBrowseNavProbePlan({
  clientId = "",
  camera = "",
  currentBounds = null,
  todayBounds = null,
  prevBounds = null,
  nextBounds = null
}) {
  const initialState = resolveRecordingsBrowseNavContextState({
    clientId,
    camera,
    currentBounds,
    todayBounds
  });
  return {
    hasContext: initialState.hasContext,
    initialState,
    prevProbeBounds: initialState.hasContext ? prevBounds : null,
    nextProbeBounds: initialState.shouldProbeNext ? nextBounds : null
  };
}
function resolveRecordingsBrowseNavState({
  currentBounds = null,
  todayBounds = null,
  hasPrev = false,
  hasNext = false
}) {
  const currentEnd = Number(currentBounds?.end || 0);
  const todayEnd = Number(todayBounds?.end || 0);
  const isTodayOrFuture = currentEnd >= todayEnd;
  return {
    isTodayOrFuture,
    shouldProbeNext: !isTodayOrFuture,
    prevDisabled: !hasPrev,
    nextDisabled: isTodayOrFuture || !hasNext
  };
}

// src/features/recordings/utils/playback.js
function buildRecordingPlaybackPlan({
  clientId = "",
  camera = "",
  start = 0,
  end = 0,
  preferHls = false,
  maxChunkSeconds = 3600
}) {
  const safeStart = Number(start) || 0;
  const safeEnd = Number(end) || 0;
  const chunkEnd = Math.min(safeEnd, safeStart + maxChunkSeconds);
  const recPath = `/api/frigate/${encodeURIComponent(clientId)}/recording/${encodeURIComponent(camera)}/start/${safeStart}/end/${chunkEnd}`;
  const vodBase = `/api/frigate/${encodeURIComponent(clientId)}/vod/${encodeURIComponent(camera)}/start/${safeStart}/end/${chunkEnd}`;
  const hlsCandidates = [`${vodBase}/index.m3u8`, `${vodBase}/master.m3u8`];
  return {
    chunkEnd,
    clipDurationSec: chunkEnd - safeStart,
    displayCamera: String(camera || "").replace(/_/g, " "),
    sourceCandidates: preferHls ? [...hlsCandidates, recPath] : [recPath, ...hlsCandidates]
  };
}

// src/features/recordings/utils/scrub.js
function resolveClosestRecordingAlertStart(targetSec, alerts = [], thresholdSec = 0) {
  let nearest = null;
  let best = Infinity;
  for (const alert of alerts) {
    const inAlert = targetSec >= alert.start && targetSec <= alert.end;
    const duration = Math.max(
      0,
      Number(alert.end || 0) - Number(alert.start || 0)
    );
    if (inAlert) {
      if (duration > 20) return null;
      return alert.start;
    }
    const distance = Math.abs(targetSec - alert.start);
    if (distance < best) {
      best = distance;
      nearest = alert.start;
    }
  }
  return best <= thresholdSec ? nearest : null;
}
function resolveRecordingScrubTarget({
  ratio = 0,
  start = 0,
  end = 0,
  alerts = []
}) {
  const safeStart = Number(start) || 0;
  const safeEnd = Number(end) || 0;
  const span = Math.max(1, safeEnd - safeStart);
  const clampedRatio = Math.max(0, Math.min(1, Number(ratio) || 0));
  const rawTarget = safeStart + clampedRatio * span;
  const snapThreshold = Math.min(12, Math.max(3, span * 5e-3));
  const snapped = resolveClosestRecordingAlertStart(
    rawTarget,
    alerts,
    snapThreshold
  );
  const absTarget = Number.isFinite(snapped) ? snapped : rawTarget;
  const relTarget = Math.max(
    0,
    Math.min(safeEnd - safeStart, absTarget - safeStart)
  );
  return { absTarget, relTarget };
}
function formatRecordingScrubTime(sec) {
  const total = Math.max(0, Math.floor(Number(sec) || 0));
  const h = Math.floor(total / 3600);
  const m = Math.floor(total % 3600 / 60);
  const s = total % 60;
  if (h > 0) {
    return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }
  return `${m}:${String(s).padStart(2, "0")}`;
}
function buildRecordingScrubDecorations({
  start = 0,
  end = 0,
  alerts = [],
  tickStepSec = 10 * 60
}) {
  const safeStart = Number(start) || 0;
  const safeEnd = Number(end) || 0;
  const span = Math.max(1, safeEnd - safeStart);
  let tickMarkup = "";
  for (let time = tickStepSec; time < span; time += tickStepSec) {
    const left = time / span * 100;
    tickMarkup += `<span class="recording-scrub-tick" style="left:${left}%"></span>`;
  }
  let markerMarkup = "";
  for (const alert of alerts) {
    const left = (alert.start - safeStart) / span * 100;
    const width = Math.max(0.75, (alert.end - alert.start) / span * 100);
    const markerClass = String(alert.severity || "").toLowerCase() === "alert" ? "recording-scrub-alert" : "recording-scrub-detection";
    markerMarkup += `<span class="${markerClass}" style="left:${Math.max(0, left)}%;width:${Math.min(100, width)}%"></span>`;
  }
  return {
    span,
    labelStart: "0:00",
    labelEnd: formatRecordingScrubTime(span),
    labelNow: `${formatRecordingScrubTime(0)} / ${formatRecordingScrubTime(span)}`,
    tickMarkup,
    markerMarkup
  };
}
function resolveRecordingSeekTimeout({
  isFirefox = false,
  isEdge = false
}) {
  return isFirefox || isEdge ? 4200 : 2500;
}
function isRecordingSeekTargetInRange({
  targetSec,
  seekable,
  toleranceSec = 0.35
}) {
  if (!Number.isFinite(targetSec) || !seekable || !seekable.length)
    return false;
  for (let index = 0; index < seekable.length; index++) {
    const start = Number(seekable.start(index));
    const end = Number(seekable.end(index));
    if (Number.isFinite(start) && Number.isFinite(end) && targetSec >= start - toleranceSec && targetSec <= end + toleranceSec) {
      return true;
    }
  }
  return false;
}
function resolveRecordingSeekExecutionPlan({
  hasFastSeek = false,
  isEdge = false,
  isIOS: isIOS2 = false
}) {
  return {
    shouldUseFastSeek: Boolean(hasFastSeek && !isEdge && !isIOS2)
  };
}
function isRecordingSeekVerified({
  currentTime = 0,
  targetSec,
  toleranceSec = 1.5
}) {
  if (!Number.isFinite(targetSec)) return false;
  const diff = Math.abs((Number(currentTime) || 0) - targetSec);
  return diff <= toleranceSec;
}
function resolveRecordingSeekOutcome({
  isFirefox = false,
  isEdge = false,
  seekOk = false,
  currentTime = 0,
  relTarget,
  absTarget,
  start = 0,
  end = 0,
  resumeAfterScrub = false,
  isFallbackLoading = false,
  toleranceSec = 2
}) {
  if (isFirefox || isEdge) {
    return {
      shouldResumePlayback: Boolean(resumeAfterScrub),
      shouldFallback: false,
      blockedByFallbackLoading: false,
      fallbackStart: null,
      fallbackEnd: null
    };
  }
  const diff = Math.abs((Number(currentTime) || 0) - (Number(relTarget) || 0));
  const shouldFallback = !seekOk || diff > toleranceSec;
  if (!shouldFallback) {
    return {
      shouldResumePlayback: Boolean(resumeAfterScrub),
      shouldFallback: false,
      blockedByFallbackLoading: false,
      fallbackStart: null,
      fallbackEnd: null
    };
  }
  if (isFallbackLoading) {
    return {
      shouldResumePlayback: false,
      shouldFallback: false,
      blockedByFallbackLoading: true,
      fallbackStart: null,
      fallbackEnd: null
    };
  }
  const safeStart = Number(start) || 0;
  const safeEnd = Number(end) || 0;
  const span = Math.max(1, safeEnd - safeStart);
  return {
    shouldResumePlayback: false,
    shouldFallback: true,
    blockedByFallbackLoading: false,
    fallbackStart: Math.floor(Number(absTarget) || 0),
    fallbackEnd: Math.floor((Number(absTarget) || 0) + span)
  };
}

// src/features/recordings/scrub.ctrl.js
const RecordingScrubController = class {
  constructor({ track, video, ticks, markers, state, setCursor, seekToRatio }) {
    __publicField(this, "_onPointerDown", (event) => {
      this._consumeGesture(event);
      this._dragging = true;
      this._state.isScrubbing = true;
      this._state.resumeAfterScrub = !this._video.paused;
      this._video.pause?.();
      this._track.setPointerCapture?.(event.pointerId);
      this._lastRatio = this._clientXToRatio(event.clientX);
      this._seekToRatio?.(this._lastRatio);
    });
    __publicField(this, "_onPointerMove", (event) => {
      if (!this._dragging) return;
      this._consumeGesture(event);
      this._lastRatio = this._clientXToRatio(event.clientX);
      this._seekToRatio?.(this._lastRatio);
    });
    __publicField(this, "_onPointerUp", (event) => {
      if (!this._dragging) return;
      this._consumeGesture(event);
      this._dragging = false;
      this._state.isScrubbing = false;
      this._track.releasePointerCapture?.(event.pointerId);
      this._seekToRatio?.(this._lastRatio, { commit: true });
    });
    __publicField(this, "_onTouchConsume", (event) => {
      this._consumeGesture(event);
    });
    __publicField(this, "_onTimeUpdate", () => {
      if (this._state?.isScrubbing) return;
      this._setCursor?.(
        Number(this._state.start || 0) + Number(this._video.currentTime || 0)
      );
    });
    this._track = track;
    this._video = video;
    this._ticks = ticks;
    this._markers = markers;
    this._state = state;
    this._setCursor = setCursor;
    this._seekToRatio = seekToRatio;
    this._cleanup = new CleanupController();
    this._dragging = false;
    this._lastRatio = 0;
  }
  bind() {
    if (!this._track || !this._video || !this._state) return;
    this._cleanup.addEventListener(
      this._track,
      "pointerdown",
      this._onPointerDown
    );
    this._cleanup.addEventListener(
      this._track,
      "pointermove",
      this._onPointerMove
    );
    this._cleanup.addEventListener(this._track, "pointerup", this._onPointerUp);
    this._cleanup.addEventListener(
      this._track,
      "pointercancel",
      this._onPointerUp
    );
    this._cleanup.addEventListener(
      this._track,
      "touchstart",
      this._onTouchConsume,
      {
        passive: false
      }
    );
    this._cleanup.addEventListener(
      this._track,
      "touchmove",
      this._onTouchConsume,
      {
        passive: false
      }
    );
    this._cleanup.addEventListener(
      this._track,
      "touchend",
      this._onTouchConsume,
      {
        passive: false
      }
    );
    this._cleanup.addEventListener(
      this._video,
      "timeupdate",
      this._onTimeUpdate
    );
  }
  dispose() {
    this._dragging = false;
    this._state.isScrubbing = false;
    this._cleanup.dispose();
    if (this._ticks) this._ticks.innerHTML = "";
    if (this._markers) this._markers.innerHTML = "";
  }
  _clientXToRatio(clientX) {
    const rect = this._track.getBoundingClientRect();
    if (!rect.width) return 0;
    return Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
  }
  _consumeGesture(event) {
    event.preventDefault?.();
    event.stopPropagation?.();
  }
};

// src/features/recordings/recordings.tmpl.js
function buildRecordingsListMarkup({
  recordings = [],
  emptyText = "No recordings in this day",
  recordingsIcon = "",
  downloadIcon = "",
  formatTime = () => "",
  nowSec = Date.now() / 1e3
}) {
  if (!Array.isArray(recordings) || !recordings.length) {
    return `<div class="empty">${emptyText}</div>`;
  }
  const safeNowSec = Math.floor(nowSec || Date.now() / 1e3);
  return recordings.map((recording) => {
    const recordingStart = Math.floor(recording.start_time);
    const recordingEnd = Math.floor(recording.end_time || safeNowSec);
    const durationSec = Math.max(1, recordingEnd - recordingStart);
    const minutes = Math.floor(durationSec / 60);
    const seconds = durationSec % 60;
    const durationLabel = `${minutes ? `${minutes}m ` : ""}${seconds}s`;
    return `<div class="list-item shadow-xform shadow-small" data-rs="${recordingStart}" data-re="${recordingEnd}">
        <div class="ric">${recordingsIcon}</div>
        <div class="rinf">
          <div class="rt">${formatTime(recording.start_time)} \u2013 ${formatTime(recording.end_time || safeNowSec)}</div>
          <div class="rsub">${durationLabel}${recording.events ? ` \xB7 ${recording.events} ev` : ""}</div>
        </div>
        <button class="rp" data-rec-dl-start="${recordingStart}" data-rec-dl-end="${recordingEnd}" title="Download recording" aria-label="Download recording">${downloadIcon}</button>
      </div>`;
  }).join("");
}

// src/features/recordings/utils/segment.js
function mergeRecordingSegments(recordings = []) {
  if (!recordings.length) return [];
  const segments = [...recordings].sort((a, b) => a.start_time - b.start_time);
  const merged = [];
  let current = { ...segments[0] };
  for (let i = 1; i < segments.length; i++) {
    const segment = segments[i];
    const currentEnd = current.end_time || current.start_time;
    if (segment.start_time - currentEnd <= 60) {
      current.end_time = Math.max(
        currentEnd,
        segment.end_time || segment.start_time
      );
      current.events = (current.events || 0) + (segment.events || 0);
      continue;
    }
    merged.push(current);
    current = { ...segment };
  }
  merged.push(current);
  return merged;
}
function splitRecordingsHourly(recordings = [], nowSec = Date.now() / 1e3) {
  const merged = mergeRecordingSegments(recordings).sort(
    (a, b) => a.start_time - b.start_time
  );
  if (!merged.length) return [];
  const now = Math.floor(nowSec || Date.now() / 1e3);
  const currentHourStart = Math.floor(now / 3600) * 3600;
  const firstHourStart = currentHourStart - 23 * 3600;
  const buckets = [];
  for (let i = 0; i < 24; i++) {
    const bucketStart = firstHourStart + i * 3600;
    const bucketEnd = bucketStart + 3600;
    const rowEnd = Math.min(bucketEnd, now);
    let overlapsRecording = false;
    let events = 0;
    for (const recording of merged) {
      const recordingStart = Math.floor(recording.start_time);
      const recordingEnd = Math.floor(recording.end_time || now);
      if (recordingStart < bucketEnd && recordingEnd > bucketStart) {
        overlapsRecording = true;
        events += recording.events || 0;
      }
    }
    if (overlapsRecording && rowEnd > bucketStart) {
      buckets.push({
        start_time: bucketStart,
        end_time: rowEnd,
        events
      });
    }
  }
  return buckets;
}

// src/features/recordings/utils/swipe.js
const RECORDINGS_SWIPE_LOADING_HTML = '<div class="empty">Loading day\u2026</div>';
const RECORDINGS_SWIPE_EMPTY_HTML = '<div class="empty">No recordings in this day</div>';
function resolveRecordingsSwipeStageMetrics({
  list = null,
  lastRenderedListHtml = ""
}) {
  return {
    width: Math.max(1, Math.round(Number(list?.clientWidth || 1))),
    currentHtml: String(list?.innerHTML || lastRenderedListHtml || ""),
    minHeight: Math.max(
      220,
      Number(list?.scrollHeight || list?.clientHeight || 220)
    )
  };
}
function resolveRecordingsSwipeStageTransforms({
  offset = 0,
  direction = 0,
  width = 0
}) {
  return {
    currentTransform: `translateX(${offset}px)`,
    incomingTransform: `translateX(${offset + direction * width}px)`
  };
}
function createRecordingsSwipeGestureState(direction, stage = null) {
  return {
    direction,
    stage,
    hasData: false,
    ready: false,
    bounds: null,
    recs: [],
    prepPromise: null
  };
}
function resolvePreparedRecordingsIncomingState({
  prep = null,
  renderRecordings = () => "",
  emptyHtml = RECORDINGS_SWIPE_EMPTY_HTML
}) {
  const safePrep = prep || {};
  const recordings = Array.isArray(safePrep.recs) ? safePrep.recs : [];
  const hasData = !!safePrep.hasData;
  return {
    hasData,
    bounds: safePrep.bounds || null,
    recs: recordings,
    incomingHtml: hasData ? renderRecordings(recordings) : emptyHtml
  };
}
function resolvePreparedRecordingsDayNavigationState({
  prep = null,
  renderRecordings = () => ""
}) {
  const incoming = resolvePreparedRecordingsIncomingState({
    prep,
    renderRecordings,
    emptyHtml: ""
  });
  return {
    ...incoming,
    shouldBounce: !incoming.hasData,
    shouldCommit: incoming.hasData
  };
}
function resolvePreparedRecordingsSwipeState({
  prep = null,
  renderRecordings = () => ""
}) {
  return {
    ready: true,
    ...resolvePreparedRecordingsIncomingState({
      prep,
      renderRecordings
    })
  };
}
function resolveFailedRecordingsSwipeState() {
  return {
    ready: true,
    hasData: false,
    bounds: null,
    recs: [],
    incomingHtml: RECORDINGS_SWIPE_EMPTY_HTML
  };
}

// src/features/recordings/swipe.ctrl.js
const RecordingsSwipeController = class {
  constructor({
    browse,
    getTab,
    isMobileTabletViewport,
    isDayNavAnimating,
    getGesture,
    setGesture,
    setTapBlocked,
    getList,
    getLastRenderedListHtml,
    setLastRenderedListHtml,
    renderList,
    prepareDayTransition,
    renderRecordings,
    completeGesture
  }) {
    __publicField(this, "_canSwipe", () => this._getTab?.() === "recordings" && this._isMobileTabletViewport?.() && !this._isDayNavAnimating?.());
    __publicField(this, "_resetGesture", ({ clearTapBlock = true } = {}) => {
      if (this._getGesture?.()?.stage) {
        this.destroyGestureStage();
      }
      this._setGesture?.(null);
      if (clearTapBlock) this._setTapBlocked?.(false);
      this._tracking = false;
      this._horizontal = false;
      this._direction = 0;
      this._deltaX = 0;
      this._deltaY = 0;
      if (this._pointerId != null && this._browse?.hasPointerCapture?.(this._pointerId)) {
        try {
          this._browse.releasePointerCapture(this._pointerId);
        } catch (_) {
        }
      }
      this._pointerId = null;
      if (this._browse) {
        this._browse.classList.remove("recordings-swipe");
        this._browse.style.transform = "";
      }
    });
    __publicField(this, "_finishSwipe", async () => {
      if (!this._tracking) return;
      const absX = Math.abs(this._deltaX);
      const absY = Math.abs(this._deltaY);
      const direction = this._direction;
      const gesture = this._getGesture?.();
      const stage = gesture?.stage;
      this._tracking = false;
      this._pointerId = null;
      this._browse.classList.remove("recordings-swipe");
      this._browse.style.transform = "";
      if (!this._horizontal || !stage || !gesture || !direction || absX <= absY) {
        this._resetGesture();
        return;
      }
      const threshold = Math.max(34, stage.width * 0.12);
      if (absX < threshold) {
        await this.animateStageTo(
          stage,
          0,
          140,
          "cubic-bezier(0.16, 0.64, 0.2, 1)"
        );
        if (this._disposed) return;
        this._resetGesture({ clearTapBlock: false });
        return;
      }
      const moved = await this._completeGesture?.(gesture);
      if (this._disposed) return;
      if (!moved) {
        await this.animateStageTo(
          stage,
          0,
          150,
          "cubic-bezier(0.16, 0.64, 0.2, 1)"
        );
        if (this._disposed) return;
        this.bounceArea(direction);
      }
      this._scheduleTapBlockClear();
      this._resetGesture({ clearTapBlock: false });
    });
    __publicField(this, "_onPointerDown", (event) => {
      if (!this._canSwipe()) return;
      if (event.pointerType === "mouse" && event.button !== 0) return;
      if (this._pointerId != null) return;
      this._pointerId = event.pointerId;
      this._startGesture(event.clientX, event.clientY);
    });
    __publicField(this, "_onPointerMove", (event) => {
      if (event.pointerId !== this._pointerId) return;
      this._moveGesture(event.clientX, event.clientY, event);
    });
    __publicField(this, "_onPointerUp", (event) => {
      if (event.pointerId !== this._pointerId) return;
      void this._finishSwipe();
    });
    __publicField(this, "_onPointerCancel", () => {
      this._resetGesture();
    });
    this._browse = browse;
    this._getTab = getTab;
    this._isMobileTabletViewport = isMobileTabletViewport;
    this._isDayNavAnimating = isDayNavAnimating;
    this._getGesture = getGesture;
    this._setGesture = setGesture;
    this._setTapBlocked = setTapBlocked;
    this._getList = getList;
    this._getLastRenderedListHtml = getLastRenderedListHtml;
    this._setLastRenderedListHtml = setLastRenderedListHtml;
    this._renderList = renderList;
    this._prepareDayTransition = prepareDayTransition;
    this._renderRecordings = renderRecordings;
    this._completeGesture = completeGesture;
    this._cleanup = new CleanupController();
    this._tracking = false;
    this._horizontal = false;
    this._direction = 0;
    this._pointerId = null;
    this._startX = 0;
    this._startY = 0;
    this._deltaX = 0;
    this._deltaY = 0;
    this._disposed = false;
    this._tapBlockTimer = null;
    this._axisLockThreshold = this._isMobileTabletViewport() ? 6 : 8;
    this._dragFollowFactor = this._isMobileTabletViewport() ? 1 : 0.85;
  }
  bind() {
    if (!this._browse) return;
    this._cleanup.addEventListener(
      this._browse,
      "pointerdown",
      this._onPointerDown
    );
    this._cleanup.addEventListener(
      this._browse,
      "pointermove",
      this._onPointerMove
    );
    this._cleanup.addEventListener(
      this._browse,
      "pointerup",
      this._onPointerUp
    );
    this._cleanup.addEventListener(
      this._browse,
      "pointercancel",
      this._onPointerCancel
    );
  }
  dispose() {
    if (this._disposed) return;
    this._disposed = true;
    this._clearTapBlockTimer();
    this._resetGesture();
    this._cleanup.dispose();
  }
  _clearTapBlockTimer() {
    if (!this._tapBlockTimer) return;
    clearTimeout(this._tapBlockTimer);
    this._tapBlockTimer = null;
  }
  _scheduleTapBlockClear() {
    this._clearTapBlockTimer();
    this._tapBlockTimer = setTimeout(() => {
      this._tapBlockTimer = null;
      if (this._disposed) return;
      this._setTapBlocked?.(false);
    }, 320);
    this._cleanup.addCleanup(() => this._clearTapBlockTimer());
  }
  _ensureGestureStage(direction) {
    if (this._getGesture?.()?.direction === direction) return;
    this._setGesture?.(this.startGestureStage(direction) || null);
  }
  createStage(direction, incomingHtml) {
    const list = this._getList?.();
    if (!list) return null;
    const metrics = resolveRecordingsSwipeStageMetrics({
      list,
      lastRenderedListHtml: this._getLastRenderedListHtml?.() || ""
    });
    const stage = document.createElement("div");
    stage.className = "rec-swipe-stage";
    stage.style.minHeight = `${metrics.minHeight}px`;
    const current = document.createElement("div");
    current.className = "rec-swipe-pane current";
    current.innerHTML = metrics.currentHtml;
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
      width: metrics.width,
      offset: 0
    };
    this.setStageOffset(state, 0);
    return state;
  }
  setStageOffset(state, offset, transition = "") {
    if (!state) return;
    state.offset = offset;
    state.current.style.transition = transition;
    state.incoming.style.transition = transition;
    const transforms = resolveRecordingsSwipeStageTransforms({
      offset,
      direction: state.direction,
      width: state.width
    });
    state.current.style.transform = transforms.currentTransform;
    state.incoming.style.transform = transforms.incomingTransform;
  }
  animateStageTo(state, offset, duration = 260, easing = "cubic-bezier(0.18, 0.5, 0.2, 1)") {
    if (!state) return Promise.resolve();
    return new Promise((resolve) => {
      void state.stage?.getBoundingClientRect?.();
      void state.current?.offsetWidth;
      const transition = `transform ${duration}ms ${easing}`;
      this.setStageOffset(state, offset, transition);
      setTimeout(resolve, duration + 16);
    });
  }
  destroyGestureStage() {
    const state = this._getGesture?.()?.stage;
    if (!state?.list) return;
    this.clearListState(state.list);
    this._setLastRenderedListHtml?.("");
    this._renderList?.();
  }
  clearListState(list = null) {
    const targetList = list || this._getList?.();
    targetList?.classList?.remove("recordings-swipe-active");
  }
  bounceArea(direction) {
    if (!this._browse) return;
    const cls = direction > 0 ? "swipe-bounce-next" : "swipe-bounce-prev";
    this._browse.classList.remove("swipe-bounce-prev", "swipe-bounce-next");
    void this._browse.offsetWidth;
    this._browse.classList.add(cls);
    setTimeout(() => {
      this._browse?.classList.remove(cls);
    }, 280);
  }
  startGestureStage(direction) {
    const stage = this.createStage(direction, RECORDINGS_SWIPE_LOADING_HTML);
    const gesture = createRecordingsSwipeGestureState(direction, stage);
    gesture.prepPromise = (async () => {
      try {
        const prep = await this._prepareDayTransition?.(direction);
        Object.assign(
          gesture,
          resolvePreparedRecordingsSwipeState({
            prep,
            renderRecordings: (recordings) => this._renderRecordings?.(recordings) || ""
          })
        );
        if (gesture.stage?.incoming) {
          gesture.stage.incoming.classList.remove("loading");
          gesture.stage.incoming.innerHTML = gesture.incomingHtml;
        }
      } catch (_) {
        Object.assign(gesture, resolveFailedRecordingsSwipeState());
        if (gesture.stage?.incoming) {
          gesture.stage.incoming.classList.remove("loading");
          gesture.stage.incoming.innerHTML = RECORDINGS_SWIPE_EMPTY_HTML;
        }
      }
    })();
    if (gesture.stage?.incoming) {
      gesture.stage.incoming.classList.add("loading");
    }
    return gesture;
  }
  _startGesture(clientX, clientY) {
    this._startX = clientX;
    this._startY = clientY;
    this._deltaX = 0;
    this._deltaY = 0;
    this._tracking = true;
    this._horizontal = false;
    this._direction = 0;
    this._setTapBlocked?.(false);
  }
  _moveGesture(clientX, clientY, event) {
    if (!this._tracking || !this._canSwipe()) return;
    this._deltaX = clientX - this._startX;
    this._deltaY = clientY - this._startY;
    const absX = Math.abs(this._deltaX);
    const absY = Math.abs(this._deltaY);
    if (!this._horizontal) {
      if (absX < this._axisLockThreshold && absY < this._axisLockThreshold) {
        return;
      }
      if (absY >= this._axisLockThreshold && absY > absX) {
        this._resetGesture();
        return;
      }
      if (absX < this._axisLockThreshold || absX <= absY * 1.15) return;
      this._horizontal = true;
      this._browse.classList.add("recordings-swipe");
      if (this._pointerId != null && !this._browse.hasPointerCapture?.(this._pointerId)) {
        try {
          this._browse.setPointerCapture(this._pointerId);
        } catch (_) {
        }
      }
    }
    event.preventDefault?.();
    this._direction = this._deltaX < 0 ? 1 : -1;
    if (absX >= 3) this._setTapBlocked?.(true);
    this._ensureGestureStage(this._direction);
    const stage = this._getGesture?.()?.stage;
    if (!stage) return;
    const max = stage.width;
    const x = Math.max(-max, Math.min(max, this._deltaX));
    const clampedAbsX = Math.abs(x);
    const followFactor = clampedAbsX < 60 ? 1 : this._dragFollowFactor;
    const follow = Math.sign(x) * Math.min(clampedAbsX * followFactor, max);
    this.setStageOffset(stage, follow);
  }
};

// src/features/recordings/browse-nav.ctrl.js
const RecordingsBrowseNavController = class {
  constructor(host) {
    this._host = host;
  }
  _swipeController() {
    return this._host._recordingsSwipeController || null;
  }
  _recordingsDayBounds(tsSec = null) {
    if (this._host._recordingsDayBounds) {
      return this._host._recordingsDayBounds(tsSec);
    }
    return resolveRecordingsDayBounds({
      tsSec,
      fallbackSec: this._host._winEnd,
      getTzParts: (target) => this._host._tzParts(target),
      toEpochSeconds: (year, month, day, hour, minute, second) => this._host._tzDateTimeToEpochSeconds(
        year,
        month,
        day,
        hour,
        minute,
        second
      )
    });
  }
  _recordingsOffsetDayBounds(offsetDays = 0) {
    if (this._host._recordingsOffsetDayBounds) {
      return this._host._recordingsOffsetDayBounds(offsetDays);
    }
    return resolveOffsetRecordingsDayBounds({
      offsetDays,
      fallbackSec: this._host._winEnd,
      getTzParts: (target) => this._host._tzParts(target),
      toEpochSeconds: (year, month, day, hour, minute, second) => this._host._tzDateTimeToEpochSeconds(
        year,
        month,
        day,
        hour,
        minute,
        second
      )
    });
  }
  async hasRecordingsInBounds(bounds, clientId, cam) {
    const key = buildRecordingsDayCacheKey(clientId, cam, bounds);
    const cached = resolveCachedRecordingsAvailability({
      key,
      dataCache: this._host._recordingsDayDataCache,
      availabilityCache: this._host._recordingsDayAvailabilityCache
    });
    if (cached.found) {
      if (cached.shouldSyncAvailability) {
        this._host._recordingsDayAvailabilityCache.set(
          key,
          cached.hasRecordings
        );
      }
      return cached.hasRecordings;
    }
    try {
      const recordings = await this._host._ws({
        type: "frigate/recordings/get",
        instance_id: clientId,
        camera: cam,
        after: Math.max(0, bounds.start),
        before: bounds.end
      });
      const fetched = resolveFetchedRecordingsAvailabilityState(recordings);
      this._host._recordingsDayDataCache.set(key, fetched.recordings);
      this._host._recordingsDayAvailabilityCache.set(
        key,
        fetched.availabilityValue
      );
      return fetched.hasRecordings;
    } catch (_) {
      const failed = resolveFailedRecordingsAvailabilityState();
      this._host._recordingsDayAvailabilityCache.set(
        key,
        failed.availabilityValue
      );
      return failed.hasRecordings;
    }
  }
  async prepareDayTransition(direction) {
    const bounds = this._recordingsOffsetDayBounds(direction);
    const today = this._recordingsDayBounds(Math.floor(Date.now() / 1e3));
    const { clientId, cam } = this._host._cc();
    const prepared = resolvePreparedRecordingsDayTransition({
      direction,
      bounds,
      todayBounds: today,
      clientId,
      camera: cam,
      dataCache: this._host._recordingsDayDataCache
    });
    if (prepared.done) {
      return prepared.result;
    }
    const key = prepared.key;
    const hasData = await this.hasRecordingsInBounds(bounds, clientId, cam);
    if (!hasData) {
      return { hasData: false, bounds, recs: [] };
    }
    const recordings = await this._host._ws({
      type: "frigate/recordings/get",
      instance_id: clientId,
      camera: cam,
      after: Math.max(0, bounds.start),
      before: bounds.end
    });
    const result = buildPreparedRecordingsDayResult(bounds, recordings);
    this._host._recordingsDayDataCache.set(key, result.recs);
    this._host._recordingsDayAvailabilityCache.set(key, result.hasData);
    return result;
  }
  async navigateDayAnimated(direction) {
    if (this._host._tab !== "recordings") return false;
    const dir = Number(direction);
    if (dir !== -1 && dir !== 1) return false;
    if (this._host._recordingsDayNavAnimating) return false;
    this._host._recordingsDayNavAnimating = true;
    try {
      const prep = await this.prepareDayTransition(dir);
      const navigation = resolvePreparedRecordingsDayNavigationState({
        prep,
        renderRecordings: (recordings) => this._host._recordingsListMarkup(
          this._host._recordingsViewRows(recordings)
        )
      });
      if (navigation.shouldBounce) {
        const swipeController2 = this._swipeController();
        if (swipeController2) swipeController2.bounceArea(dir);
        else this._host._bounceRecordingsArea(dir);
        void this.updateBrowseNav();
        return false;
      }
      const swipeController = this._swipeController();
      const stage = swipeController ? swipeController.createStage(dir, navigation.incomingHtml) : this._host._createRecordingsSwipeStage(dir, navigation.incomingHtml);
      if (!stage) {
        await (this._host._commitRecordingsDayTransition?.(
          navigation.bounds,
          navigation.recs
        ) ?? this.commitDayTransition(navigation.bounds, navigation.recs));
        return true;
      }
      await new Promise((resolve) => requestAnimationFrame(resolve));
      await new Promise((resolve) => requestAnimationFrame(resolve));
      if (swipeController) {
        await swipeController.animateStageTo(
          stage,
          -dir * stage.width,
          320,
          "cubic-bezier(0.28, 0.02, 0.18, 1)"
        );
      } else {
        await this._host._animateRecordingsSwipeStageTo(
          stage,
          -dir * stage.width,
          320,
          "cubic-bezier(0.28, 0.02, 0.18, 1)"
        );
      }
      await (this._host._commitRecordingsDayTransition?.(
        navigation.bounds,
        navigation.recs
      ) ?? this.commitDayTransition(navigation.bounds, navigation.recs));
      return true;
    } finally {
      this._host._recordingsDayNavAnimating = false;
    }
  }
  async completeSwipeGesture(gesture) {
    if (!gesture) return false;
    await gesture.prepPromise;
    if (!gesture.ready || !gesture.hasData || !gesture.stage) return false;
    await new Promise((resolve) => requestAnimationFrame(resolve));
    await new Promise((resolve) => requestAnimationFrame(resolve));
    const target = -gesture.direction * gesture.stage.width;
    const swipeController = this._swipeController();
    if (swipeController) {
      await swipeController.animateStageTo(
        gesture.stage,
        target,
        300,
        "cubic-bezier(0.28, 0.02, 0.18, 1)"
      );
    } else {
      await this._host._animateRecordingsSwipeStageTo(
        gesture.stage,
        target,
        300,
        "cubic-bezier(0.28, 0.02, 0.18, 1)"
      );
    }
    await (this._host._commitRecordingsDayTransition?.(
      gesture.bounds,
      gesture.recs
    ) ?? this.commitDayTransition(gesture.bounds, gesture.recs));
    return true;
  }
  async commitDayTransition(bounds, recordings) {
    if (!bounds) return;
    const { clientId, cam } = this._host._cc();
    const committed = resolveCommittedRecordingsDayState({
      bounds,
      recordings,
      clientId,
      camera: cam
    });
    this._host._followNowWindow = false;
    this._host._winStart = committed.bounds.start;
    this._host._winEnd = committed.bounds.end;
    this._host._exhausted = false;
    this._host._browseWindowLoaderController?.pruneNonActiveCamWindowCaches?.() ?? this._host._pruneNonActiveCamWindowCaches?.();
    this._host._recordings = committed.recordings;
    if (committed.key) {
      this._host._recordingsDayDataCache.set(
        committed.key,
        this._host._recordings
      );
      this._host._recordingsDayAvailabilityCache.set(
        committed.key,
        committed.hasRecordings
      );
    }
    this._host._browseWindowLoaderController?.cacheActiveCamSlice?.(
      "recordings",
      this._host._recordings
    ) ?? this._host._cacheActiveCamSlice?.("recordings", this._host._recordings);
    this._host._renderListLabel(this._host._winEnd);
    const swipeController = this._swipeController();
    if (swipeController) swipeController.clearListState();
    else this._host._clearRecordingsSwipeListState();
    this._host._lastRenderedListHtml = "";
    this._host._renderList();
  }
  async stepDay(direction) {
    return this.navigateDayAnimated(direction);
  }
  async updateBrowseNav() {
    if (this._host._tab !== "recordings") return;
    const prev = this._host._pageShellRegionElement(
      "browseHeader",
      "#rec-day-prev"
    );
    const next = this._host._pageShellRegionElement(
      "browseHeader",
      "#rec-day-next"
    );
    if (!prev || !next) return;
    const { clientId, cam } = this._host._cc();
    const current = this._recordingsDayBounds();
    const today = this._recordingsDayBounds(Math.floor(Date.now() / 1e3));
    const probePlan = resolveRecordingsBrowseNavProbePlan({
      clientId,
      camera: cam,
      currentBounds: current,
      todayBounds: today,
      prevBounds: this._recordingsOffsetDayBounds(-1),
      nextBounds: this._recordingsOffsetDayBounds(1)
    });
    if (!probePlan.hasContext) {
      prev.disabled = probePlan.initialState.prevDisabled;
      next.disabled = probePlan.initialState.nextDisabled;
      return;
    }
    const token = ++this._host._recordingsNavUpdateToken;
    prev.disabled = true;
    next.disabled = true;
    const hasPrev = await this.hasRecordingsInBounds(
      probePlan.prevProbeBounds,
      clientId,
      cam
    );
    if (token !== this._host._recordingsNavUpdateToken) return;
    let hasNext = false;
    if (probePlan.nextProbeBounds) {
      hasNext = await this.hasRecordingsInBounds(
        probePlan.nextProbeBounds,
        clientId,
        cam
      );
      if (token !== this._host._recordingsNavUpdateToken) return;
    }
    const resolvedNavState = resolveRecordingsBrowseNavState({
      currentBounds: current,
      todayBounds: today,
      hasPrev,
      hasNext
    });
    prev.disabled = resolvedNavState.prevDisabled;
    next.disabled = resolvedNavState.nextDisabled;
  }
};

// src/card/controls/readout.js
function normalizeControlsReadoutLine(text) {
  return String(text || "").trim();
}
function appendControlsReadoutLine(lines, text, maxLines = 200) {
  const line = normalizeControlsReadoutLine(text);
  if (!line) {
    return lines || [];
  }
  const nextLines = [...lines || [], line];
  return nextLines.slice(-Math.max(1, Number(maxLines) || 1));
}
function clearControlsReadoutLines() {
  return [];
}
const eventTargetMatchesControlsPad = (target) => target instanceof Element && target.id === "controls-pad";
function isControlsPadTarget(targetOrEvent) {
  if (eventTargetMatchesControlsPad(targetOrEvent)) return true;
  const path = targetOrEvent?.composedPath?.();
  return Array.isArray(path) && path.some(eventTargetMatchesControlsPad);
}
function isControlsReadoutClearTarget(target) {
  return target instanceof Element && !!target.closest("#controls-readout-clear");
}
function resolveControlsPadPressReadoutEntry(event) {
  if (!isControlsPadTarget(event)) return "";
  const action = event?.detail?.action;
  return action ? `[${action}]` : "";
}
function resolveControlsPadToggleReadoutEntry(event) {
  if (!isControlsPadTarget(event)) return "";
  if (event?.detail?.action !== "mic") return "";
  return event?.detail?.active ? "[mic:on]" : "[mic:off]";
}
function resolveControlsReadoutMarkup(lines, escapeText, emptyMessage) {
  if (!Array.isArray(lines) || lines.length === 0) {
    return buildControlsReadoutEmptyMarkup(
      typeof emptyMessage === "string" ? emptyMessage : void 0
    );
  }
  const escapedLines = lines.map(
    (line) => typeof escapeText === "function" ? escapeText(line) : String(line || "")
  );
  return buildControlsReadoutLinesMarkup(escapedLines);
}

// src/features/two-way-talk/index.js
const hasTwoWayTalkCapability = (capabilityInfo) => {
  if (!capabilityInfo || typeof capabilityInfo !== "object") return false;
  const producers = Array.isArray(capabilityInfo.producers) ? capabilityInfo.producers : [];
  const hasGo2RtcBackchannel = producers.some((producer) => {
    if (!Array.isArray(producer?.medias)) return false;
    return producer.medias.some((media) => {
      const token = String(media || "").trim().toLowerCase();
      return token.includes("audio") && (token.includes("sendonly") || token.includes("sendrecv"));
    });
  });
  if (hasGo2RtcBackchannel) return true;
  const truthyKeys = new Set([
    "two_way_talk",
    "twoWayTalk",
    "two-way-talk",
    "talk",
    "talkback",
    "microphone",
    "mic",
    "audio_output",
    "audio_out",
    "two_way_audio",
    "supports_two_way_talk",
    "supports_two_way_audio",
    "backchannel"
  ]);
  const tokenMatches = new Set([
    "talk",
    "talkback",
    "two_way_talk",
    "two-way-talk",
    "supports_two_way_talk",
    "two_way_audio",
    "two-way-audio",
    "supports_two_way_audio",
    "mic",
    "microphone",
    "audio_output",
    "audio-out",
    "audio_out",
    "speaker",
    "backchannel"
  ]);
  const stack = [capabilityInfo];
  const seen = new Set();
  const tokens = [];
  while (stack.length) {
    const node = stack.pop();
    if (!node || typeof node !== "object") continue;
    if (seen.has(node)) continue;
    seen.add(node);
    if (Array.isArray(node)) {
      node.forEach((item) => {
        if (typeof item === "string") tokens.push(item);
        else if (item && typeof item === "object") stack.push(item);
      });
      continue;
    }
    Object.entries(node).forEach(([key, value]) => {
      const normalizedKey = String(key || "").trim().toLowerCase();
      if (value === true && truthyKeys.has(key)) {
        tokens.push(key);
      }
      if (value === true && truthyKeys.has(normalizedKey)) {
        tokens.push(normalizedKey);
      }
      if (typeof value === "string") {
        tokens.push(value);
      } else if (Array.isArray(value) || value && typeof value === "object") {
        stack.push(value);
      }
    });
  }
  return tokens.map(
    (item) => String(item || "").trim().toLowerCase()
  ).some((token) => tokenMatches.has(token));
};
const shouldRenderTwoWayTalkButton = ({ camera }) => {
  return camera?.two_way_talk === true;
};

// src/features/two-way-talk/session.js
function resolveNavigatorMediaDevices() {
  return typeof navigator !== "undefined" ? navigator.mediaDevices : null;
}
async function requestMicrophoneStream() {
  const mediaDevices = resolveNavigatorMediaDevices();
  if (!mediaDevices?.getUserMedia) {
    throw new Error("Microphone capture is not supported in this browser");
  }
  return mediaDevices.getUserMedia({
    audio: {
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true
    },
    video: false
  });
}
function stopMediaStream(stream) {
  stream?.getTracks?.().forEach((track) => {
    try {
      track.stop();
    } catch (_) {
    }
  });
}
function createPeerConnection(configuration) {
  return new RTCPeerConnection(
    configuration || {
      bundlePolicy: "max-bundle",
      sdpSemantics: "unified-plan",
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
    }
  );
}
function bindLocalAudioTrack(pc, stream) {
  const [audioTrack] = stream.getAudioTracks();
  if (!audioTrack) {
    throw new Error("No microphone audio track available");
  }
  pc.addTrack(audioTrack, stream);
  pc.addTransceiver("video", { direction: "recvonly" });
}
async function startGo2RtcTwoWayTalkSession({ websocketUrl, onEnded }) {
  if (!websocketUrl) {
    throw new Error("Missing go2rtc WebSocket URL");
  }
  const localStream = await requestMicrophoneStream();
  const pc = createPeerConnection();
  const ws = new WebSocket(websocketUrl);
  let ended = false;
  const notifyEnded = () => {
    if (ended) return;
    ended = true;
    onEnded?.();
  };
  bindLocalAudioTrack(pc, localStream);
  const stop = () => {
    try {
      ws.close();
    } catch (_) {
    }
    try {
      pc.close();
    } catch (_) {
    }
    stopMediaStream(localStream);
    notifyEnded();
  };
  pc.addEventListener("icecandidate", (event) => {
    if (ws.readyState !== WebSocket.OPEN || !event.candidate) return;
    ws.send(
      JSON.stringify({
        type: "webrtc/candidate",
        value: event.candidate.toJSON().candidate
      })
    );
  });
  ws.addEventListener("message", (event) => {
    let msg;
    try {
      msg = JSON.parse(event.data);
    } catch (_) {
      return;
    }
    if (msg?.type === "webrtc/answer") {
      pc.setRemoteDescription({
        type: "answer",
        sdp: msg.value
      }).catch(() => {
      });
      return;
    }
    if (msg?.type === "webrtc/candidate") {
      pc.addIceCandidate({ candidate: msg.value, sdpMid: "0" }).catch(() => {
      });
    }
  });
  ws.addEventListener("close", () => notifyEnded(), { once: true });
  ws.addEventListener("error", () => notifyEnded(), { once: true });
  await new Promise((resolve, reject) => {
    const handleOpen = async () => {
      try {
        const offer = await pc.createOffer({
          offerToReceiveAudio: false,
          offerToReceiveVideo: true
        });
        await pc.setLocalDescription(offer);
        ws.send(JSON.stringify({ type: "webrtc/offer", value: offer.sdp }));
        resolve();
      } catch (error) {
        reject(error);
      }
    };
    const handleError = () => {
      reject(new Error("Unable to open go2rtc talkback socket"));
    };
    ws.addEventListener("open", handleOpen, { once: true });
    ws.addEventListener("error", handleError, { once: true });
  }).catch((error) => {
    stop();
    throw error;
  });
  return {
    type: "frigate_go2rtc",
    stop,
    pc,
    ws,
    localStream
  };
}
async function startHaDirectTwoWayTalkSession({
  hass,
  entityId,
  onEnded
}) {
  if (!hass?.callWS || !hass?.connection || !entityId) {
    throw new Error("Missing Home Assistant WebRTC session context");
  }
  const clientConfig = await hass.callWS({
    type: "camera/webrtc/get_client_config",
    entity_id: entityId
  });
  const localStream = await requestMicrophoneStream();
  const pc = createPeerConnection(clientConfig?.configuration);
  const pendingCandidates = [];
  let sessionId = "";
  let unsubscribe = null;
  let ended = false;
  const notifyEnded = () => {
    if (ended) return;
    ended = true;
    onEnded?.();
  };
  bindLocalAudioTrack(pc, localStream);
  if (clientConfig?.dataChannel) {
    pc.createDataChannel(clientConfig.dataChannel);
  }
  const stop = async () => {
    try {
      pc.close();
    } catch (_) {
    }
    stopMediaStream(localStream);
    try {
      const unsub = await unsubscribe;
      if (typeof unsub === "function") unsub();
    } catch (_) {
    }
    notifyEnded();
  };
  pc.addEventListener("icecandidate", (event) => {
    if (!event.candidate) return;
    if (!sessionId) {
      pendingCandidates.push(event.candidate.toJSON());
      return;
    }
    hass.callWS({
      type: "camera/webrtc/candidate",
      entity_id: entityId,
      session_id: sessionId,
      candidate: event.candidate.toJSON()
    }).catch(() => {
    });
  });
  const offer = await pc.createOffer({
    offerToReceiveAudio: false,
    offerToReceiveVideo: true
  });
  await pc.setLocalDescription(offer);
  unsubscribe = hass.connection.subscribeMessage(
    async (event) => {
      if (event?.type === "session") {
        sessionId = event.session_id || "";
        while (pendingCandidates.length) {
          const candidate = pendingCandidates.shift();
          await hass.callWS({
            type: "camera/webrtc/candidate",
            entity_id: entityId,
            session_id: sessionId,
            candidate
          }).catch(() => {
          });
        }
        return;
      }
      if (event?.type === "answer") {
        pc.setRemoteDescription({
          type: "answer",
          sdp: event.answer
        }).catch(() => {
        });
        return;
      }
      if (event?.type === "candidate") {
        const candidate = event.candidate?.sdpMid || event.candidate?.sdpMLineIndex != null ? new RTCIceCandidate(event.candidate) : new RTCIceCandidate({
          candidate: event.candidate?.candidate,
          sdpMid: "0"
        });
        pc.addIceCandidate(candidate).catch(() => {
        });
        return;
      }
      if (event?.type === "error") {
        await stop();
      }
    },
    {
      type: "camera/webrtc/offer",
      entity_id: entityId,
      offer: offer.sdp
    }
  );
  return {
    type: "ha_direct",
    stop,
    pc,
    localStream
  };
}

// src/data/review-list.model.js
function buildReviewListItemModel(review, deps) {
  const {
    cap: cap2,
    icons,
    resolveSourceEvent,
    findEventById,
    media,
    dateTimeLabel,
    showDownloadButtons = true
  } = deps || {};
  const sev = review?.severity === "alert" ? "alert" : "detection";
  const objs = (review?.data?.objects || []).map((label) => cap2(label)).join(", ");
  const title = review?.data?.metadata?.title || objs || cap2(review?.severity || "");
  const firstDet = review?.data?.detections && review.data.detections[0] || "";
  const sourceEvent = resolveSourceEvent(review);
  const cameraLabel = String(review?.camera || sourceEvent?.camera || "").replace(/_/g, " ").trim();
  const reviewed = !!review?.has_been_reviewed;
  const favEv = firstDet ? findEventById(firstDet) : null;
  const mediaEvent = sourceEvent || favEv;
  const mediaEventId = String(mediaEvent?.id || firstDet || "");
  const favBtn = firstDet ? favEv?.retain_indefinitely ? `<button class="ico fav on" data-fav="${firstDet}" title="Unfavorite">${icons.star}</button>` : `<button class="ico fav" data-fav="${firstDet}" title="Favorite">${icons.starO}</button>` : "";
  const dlClip = showDownloadButtons && mediaEvent?.has_clip ? `<button class="ico" data-dl="${mediaEventId}" data-dl-file="clip.mp4" title="Download clip">${icons.download}</button>` : "";
  const dlSnap = showDownloadButtons && mediaEvent?.has_snapshot ? `<button class="ico" data-dl="${mediaEventId}" data-dl-file="snapshot.jpg" title="Download snapshot">${icons.snapshot}</button>` : "";
  return {
    reviewId: review?.id || "",
    firstDet,
    sev,
    title,
    cameraLabel,
    reviewed,
    favBtn,
    dlClip,
    dlSnap,
    thumbSrc: firstDet ? media(firstDet, "thumbnail.jpg") : "",
    timeLabel: dateTimeLabel(review?.start_time)
  };
}
function buildReviewListItemHtml(model, deps) {
  const { cap: cap2, icons } = deps || {};
  const thumb = model?.firstDet ? `<div class="et ${model.sev}">
                <img src="${model.thumbSrc}" loading="lazy" data-thumb-id="${model.firstDet}" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
                  <div class="tph" style="display:none">${icons.person}</div>
                </div>` : "";
  return `
      <div class="list-item shadow-small xform" data-review-id="${model.reviewId}" ${model.firstDet ? `data-review-open="${model.firstDet}"` : ""}>

        ${thumb}

        <div class="rev-inf">
          <div class="rev-t">${model.title}${model.cameraLabel ? ` <span class="cam-badge">${model.cameraLabel}</span>` : ""}</div>
          <div class="rev-m">
            <span class="time-meta">${icons.clock}${model.timeLabel}</span>
            <span class="review-meta">
              ${cap2(model.sev)}${model.reviewed ? " \xB7 \u2713" : model.firstDet ? " \xB7 tap" : ""}
            </span>
          </div>
        </div>
        <div class="eact">${model.favBtn}${model.dlClip}${model.dlSnap}</div>
      </div>`;
}

// src/data/event-list.model.js
function buildEventListItemModel(eventItem, deps) {
  const {
    cap: cap2,
    labelColor: labelColor2,
    icons,
    media,
    durationLabel,
    dateTimeLabel,
    isKeptTab,
    showCameraLabel,
    showDownloadButtons = true
  } = deps || {};
  const score = eventItem?.top_score != null ? `${Math.round(eventItem.top_score * 100)}%` : "";
  const reviewSev = eventItem?.severity === "alert" ? "alert" : eventItem?.severity === "detection" ? "detection" : "";
  const reviewBar = isKeptTab && reviewSev ? `<div class="rev-sev ${reviewSev}"></div>` : "";
  const zone = eventItem?.zones && eventItem.zones.length ? eventItem.zones[0] : "";
  const subl = eventItem?.sub_label ? `<span class="subl">${eventItem.sub_label}</span>` : "";
  const thumbSrc = media(eventItem?.id, "thumbnail.jpg");
  const thumb = eventItem?.has_snapshot || eventItem?.has_clip ? `<img src="${thumbSrc}" loading="lazy" data-thumb-id="${eventItem.id}" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"><div class="tph" style="display:none">${icons.person}</div>` : `<div class="tph">${icons.person}</div>`;
  const badge = eventItem?.has_clip ? '<span class="bc">clip</span>' : eventItem?.has_snapshot ? '<span class="bs">snap</span>' : "";
  const dlClip = showDownloadButtons && eventItem?.has_clip ? `<button class="ico" data-dl="${eventItem.id}" data-dl-file="clip.mp4" title="Download clip">${icons.download}</button>` : "";
  const dlSnap = showDownloadButtons && eventItem?.has_snapshot ? `<button class="ico" data-dl="${eventItem.id}" data-dl-file="snapshot.jpg" title="Download snapshot">${icons.snapshot}</button>` : "";
  const camLabel = showCameraLabel ? `<span class="cam-badge">${String(eventItem?.camera || "").replace(/_/g, " ")}</span>` : "";
  const favBtn = eventItem?.retain_indefinitely ? `<button class="ico fav on" data-fav="${eventItem.id}">${icons.star}</button>` : `<button class="ico fav" data-fav="${eventItem.id}">${icons.starO}</button>`;
  return {
    id: eventItem?.id,
    labelColorValue: labelColor2(eventItem?.label),
    labelText: cap2(eventItem?.label),
    score,
    reviewBar,
    zone,
    subl,
    thumb,
    badge,
    dlClip,
    dlSnap,
    camLabel,
    favBtn,
    duration: durationLabel(eventItem),
    timeLabel: dateTimeLabel(eventItem?.start_time),
    description: eventItem?.data?.description || ""
  };
}
function buildEventListItemHtml(model, { icons, expanded, compact }) {
  const desc = expanded && model.description ? `<div class="desc">${model.description}</div>` : "";
  return `
    <div class="list-item${compact ? " compact" : ""} shadow-small xform" data-ev="${model.id}">
      ${model.reviewBar}
      <div class="et">${model.thumb}<div class="ed">${model.duration}s</div></div>
      <div class="ei">
        <div class="etop"><span class="tb" style="background:${model.labelColorValue}33;color:${model.labelColorValue}">${model.labelText}</span>${model.subl}${model.badge}${model.camLabel}${model.score ? `<span class="esc">${model.score}</span>` : ""}</div>
        <div class="em"><span>${icons.clock}${model.timeLabel}</span>${model.zone ? `<span>${icons.pin}${model.zone}</span>` : ""}</div>
        ${desc}
      </div>
      <div class="eact${compact ? " h" : ""}">${model.favBtn}${model.dlClip}${model.dlSnap}</div>
    </div>`;
}

// src/shared/list-render.js
function buildEmptyListMessageHtml(message, hint = "") {
  const base = String(message || "").trim();
  const extra = String(hint || "").trim();
  if (!extra) return `<div class="empty">${base}</div>`;
  return `<div class="empty">${base}<br><span style="opacity:.6">${extra}</span></div>`;
}
function appendEndMarker(html, isExhausted) {
  return `${String(html || "")}${isExhausted ? '<div class="end">\u2014 end \u2014</div>' : ""}`;
}
function buildStickyDaySectionsHtml(items, deps) {
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
function resolveOlderHintState({
  forceHide = null,
  tab = "",
  scrollTop = 0,
  itemHeight = 60
}) {
  if (forceHide === true) {
    return {
      hidden: true,
      isToTop: false,
      text: "scroll for older\u2026",
      isButton: false
    };
  }
  const supportsHint = ["clips", "snapshot", "alerts", "recordings"].includes(
    String(tab || "")
  );
  const canShowHint = forceHide !== false && supportsHint;
  if (!canShowHint) {
    return {
      hidden: true,
      isToTop: false,
      text: "scroll for older\u2026",
      isButton: false
    };
  }
  const showTop = Number(scrollTop || 0) >= Math.max(120, Number(itemHeight || 60) * 3.5);
  return {
    hidden: false,
    isToTop: showTop,
    text: showTop ? "Click to return to top" : "scroll for older\u2026",
    isButton: showTop
  };
}
function resolveOlderHintMetrics({ list, browse }) {
  const scroller = resolveActiveListScroller({ list, browse });
  const scrollTop = Number(scroller?.scrollTop || 0);
  const sample = list?.querySelector(".list-item, .rev, .rec");
  const itemHeight = Number(sample?.getBoundingClientRect?.().height || 60);
  return {
    scrollTop,
    itemHeight
  };
}
function applyOlderHintDomState(hintEl, state) {
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
function syncOlderHintFromScroll({
  hintEl,
  list,
  browse,
  tab,
  forceHide = null
}) {
  if (!hintEl) return;
  const metrics = resolveOlderHintMetrics({ list, browse });
  const nextState = resolveOlderHintState({
    forceHide,
    tab,
    scrollTop: metrics.scrollTop,
    itemHeight: metrics.itemHeight
  });
  applyOlderHintDomState(hintEl, nextState);
}
function resolveActiveDayLabelFromScroll({ list, browse }) {
  if (!list || !browse) return "";
  const labels = Array.from(list.querySelectorAll(".list-day-label"));
  if (!labels.length) return "";
  const scroller = resolveActiveListScroller({ list, browse });
  if (!scroller) return "";
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
function resolveActiveListScroller({ list, browse }) {
  if (!list) return browse || null;
  if (!browse) return list;
  const listHeight = Number(list.scrollHeight || 0);
  const listClient = Number(list.clientHeight || 0);
  const listCanOverflow = listHeight > listClient + 2;
  const listScrollTop = Number(list.scrollTop || 0);
  if (listScrollTop > 0) return list;
  const styleReader = typeof globalThis.getComputedStyle === "function" ? globalThis.getComputedStyle : null;
  const overflowY = String(styleReader?.(list)?.overflowY || "").toLowerCase();
  const listIsScrollContainer = overflowY === "auto" || overflowY === "scroll" || overflowY === "overlay";
  if (listCanOverflow && listIsScrollContainer) return list;
  return browse;
}
function runListPostRenderSync({
  syncBrowseHead,
  syncOlderHint,
  forceHide = null,
  scheduleDeferredOlderHint = false
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
function resolveListMarkup({
  items,
  emptyMessage,
  emptyHint = "",
  buildContentHtml
}) {
  const hasItems = Array.isArray(items) && items.length > 0;
  if (!hasItems) {
    return {
      isEmpty: true,
      html: buildEmptyListMessageHtml(emptyMessage, emptyHint)
    };
  }
  const html = typeof buildContentHtml === "function" ? buildContentHtml(items) : "";
  return {
    isEmpty: false,
    html: String(html || "")
  };
}
function resolveListLabelTimestamp(items, fallbackTs = null) {
  const ts = items?.[0]?.start_time;
  return ts || fallbackTs || null;
}
function applyListMarkupWithOlderHint({
  setHtml,
  html,
  isEmpty,
  syncOlderHint,
  emptyForceHide = null,
  contentForceHide = null,
  syncOnContent = true
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
function createOlderHintSyncer(syncOlderHint) {
  return (forceHide = null) => {
    if (typeof syncOlderHint === "function") {
      syncOlderHint(forceHide);
    }
  };
}

// src/features/preview/utils.js
const LIVE_STREAM_HINTS = new Set(["webrtc", "mse", "hls"]);
function normalizePreviewAlertSeverity(value) {
  return String(value || "").trim().toLowerCase() === "detection" ? "detection" : "alert";
}
function normalizePreviewCellSeverity(value) {
  const normalized = String(value || "").trim().toLowerCase();
  if (normalized === "detection") return "detection";
  if (normalized === "alert") return "alert";
  return "";
}
function resolvePreviewLiveStreamHint({
  activeStreamType,
  lastLiveStreamHint,
  isIOS: isIOS2
}) {
  const active = String(activeStreamType || "").trim().toLowerCase();
  if (LIVE_STREAM_HINTS.has(active)) return active;
  const lastHint = String(lastLiveStreamHint || "").trim().toLowerCase();
  if (LIVE_STREAM_HINTS.has(lastHint)) return lastHint;
  return isIOS2 ? "webrtc" : "mse";
}
function resolvePreviewStreamSourceLabel({
  useLive,
  connectionType,
  liveStreamHint
}) {
  if (!useLive) return "Snapshot";
  if (connectionType === "ha_direct") return "HA Live";
  const hint = String(liveStreamHint || "").trim().toUpperCase();
  return hint ? `${hint} Live` : "Live";
}
function isPreviewReviewFresh({
  previewStartedAtSec,
  reviewStartSec,
  graceSec
}) {
  const startedAt = Number(previewStartedAtSec || 0);
  if (startedAt <= 0) return true;
  const reviewStart = Number(reviewStartSec || 0);
  if (reviewStart <= 0) return false;
  return reviewStart >= startedAt - Number(graceSec || 0);
}

// src/data/review-candidate.js
function findFirstReviewCandidateForEntity({
  reviews,
  entity,
  isReviewFresh,
  normalizeSeverity,
  shouldHandleSeverity,
  isHandledReviewId,
  reviewStartTime
}) {
  const list = Array.isArray(reviews) ? reviews : [];
  for (const review of list) {
    if (!isReviewFresh(review)) continue;
    const severity = normalizeSeverity(review);
    if (!shouldHandleSeverity(entity, severity)) continue;
    const reviewId = String(review?.id || "").trim();
    if (reviewId && isHandledReviewId(reviewId)) continue;
    return {
      entity,
      severity,
      reviewId,
      startTime: Number(reviewStartTime(review)) || 0
    };
  }
  return null;
}
function selectNewestReviewCandidate(candidates) {
  if (!Array.isArray(candidates) || !candidates.length) return null;
  let newest = null;
  for (const candidate of candidates) {
    if (!candidate?.entity) continue;
    if (!newest || Number(candidate.startTime || 0) > Number(newest.startTime || 0)) {
      newest = candidate;
    }
  }
  return newest;
}
function rememberHandledReviewId(handledReviewIds, reviewId, maxSize = 200) {
  const id = String(reviewId || "").trim();
  if (!id || !(handledReviewIds instanceof Set)) return;
  handledReviewIds.add(id);
  if (handledReviewIds.size <= Math.max(1, Number(maxSize) || 200)) return;
  const oldest = handledReviewIds.values().next().value;
  if (oldest) handledReviewIds.delete(oldest);
}
async function findNewestReviewCandidateAcrossCameras({
  cameras,
  getEntity,
  getCache,
  fetchReviews,
  buildCandidate,
  onReviewsFetched
}) {
  const list = Array.isArray(cameras) ? cameras : [];
  const candidates = [];
  for (const camera of list) {
    const entity = String(getEntity?.(camera) || "").trim();
    if (!entity) continue;
    const cache = getCache?.(entity);
    if (!cache?.clientId || !cache?.cam) continue;
    let reviews = [];
    try {
      const batch = await fetchReviews?.({ entity, cache, camera });
      reviews = Array.isArray(batch) ? batch : [];
    } catch (_) {
      reviews = [];
    }
    if (typeof onReviewsFetched === "function") {
      onReviewsFetched({ entity, cache, camera, reviews });
    }
    const candidate = buildCandidate?.({ entity, cache, camera, reviews });
    if (candidate) candidates.push(candidate);
  }
  return selectNewestReviewCandidate(candidates);
}

// src/data/realtime-alert.js
function parseRealtimeAlertMessage({ host, msg, checkSeverity = true }) {
  const incomingCam = host?._extractRealtimeMessageCamera(msg);
  if (!incomingCam) return null;
  const cam = host?._cameraEntityForIncomingCamera(incomingCam);
  if (!cam) return null;
  const severity = host?._extractRealtimeMessageSeverity(msg);
  const type = String(msg?.type || "").trim().toLowerCase();
  if (checkSeverity && !host?._shouldHandleSlideshowReview(cam, severity)) {
    return null;
  }
  return { cam, severity, type };
}

// src/features/preview/alert.ctrl.js
const PreviewAlertController = class {
  constructor(host, constants) {
    this._host = host;
    this._constants = constants;
    this._alertWatchT = null;
    this._alertCleanupT = null;
    this._alertExpiresByEntity = new Map();
    this._alertSeverityByEntity = new Map();
    this._handledReviewIds = new Set();
    this._startedAtSec = 0;
  }
  clearTimers() {
    if (this._alertWatchT) clearTimeout(this._alertWatchT);
    if (this._alertCleanupT) clearTimeout(this._alertCleanupT);
    this._alertWatchT = null;
    this._alertCleanupT = null;
  }
  clearAlertTracking() {
    this._alertExpiresByEntity.clear();
    this._alertSeverityByEntity.clear();
    this._handledReviewIds.clear();
  }
  isCameraAlertLive(entity) {
    const until = Number(this._alertExpiresByEntity.get(entity) || 0);
    return until > Date.now();
  }
  previewCellSeverity(entity) {
    if (!this.isCameraAlertLive(entity)) {
      this._alertSeverityByEntity.delete(entity);
      return "";
    }
    return normalizePreviewCellSeverity(
      this._alertSeverityByEntity.get(entity)
    );
  }
  markAlertCamera(entity, severity = "alert", holdMs = null) {
    if (!entity) return;
    const normalizedSeverity = normalizePreviewAlertSeverity(severity);
    const defaultHoldMs = this._host._previewAlertHoldMs?.() || this._constants.PREVIEW_ALERT_HOLD_MS;
    this._alertSeverityByEntity.set(entity, normalizedSeverity);
    this._alertExpiresByEntity.set(
      entity,
      Date.now() + Math.max(1e3, Number(holdMs) || defaultHoldMs)
    );
    this._scheduleAlertCleanup();
    if (this._host._isPreviewPageActive()) this._host._renderPreviewPage();
  }
  rememberHandledReview(reviewId) {
    rememberHandledReviewId(this._handledReviewIds, reviewId);
  }
  isReviewFresh(review) {
    return isPreviewReviewFresh({
      previewStartedAtSec: this._startedAtSec,
      reviewStartSec: this._host._reviewStartTimeSec(review),
      graceSec: this._constants.SLIDESHOW_REVIEW_FRESHNESS_GRACE_SEC
    });
  }
  async probeLatestAlert() {
    if (!this._host._isPreviewPageActive()) return;
    const before = Math.floor(Date.now() / 1e3);
    const after = Math.max(
      0,
      Math.floor(
        before - (this._host._config?.alerts_reviews_days || 3) * this._constants.DAY
      )
    );
    const next = await findNewestReviewCandidateAcrossCameras({
      cameras: this._host._config?.cameras,
      getEntity: (camera) => camera?.entity,
      getCache: (entity) => this._host._camCache[entity],
      fetchReviews: async ({ cache }) => this._host._ws({
        type: "frigate/reviews/get",
        instance_id: cache.clientId,
        cameras: [cache.cam],
        after,
        before,
        limit: 5
      }),
      onReviewsFetched: ({ cache, reviews }) => {
        cache.reviews = reviews;
      },
      buildCandidate: ({ entity, reviews }) => findFirstReviewCandidateForEntity({
        reviews,
        entity,
        isReviewFresh: (review) => this.isReviewFresh(review),
        normalizeSeverity: (review) => this._host._normalizeReviewSeverity(review),
        shouldHandleSeverity: (targetEntity, severity) => this._host._shouldHandleSlideshowReview(targetEntity, severity),
        isHandledReviewId: (reviewId) => this._handledReviewIds.has(reviewId),
        reviewStartTime: (review) => this._host._reviewStartTimeSec(review)
      })
    });
    if (!next?.entity) return;
    if (next.reviewId) this.rememberHandledReview(next.reviewId);
    this.markAlertCamera(
      next.entity,
      next.severity,
      this._host._previewAlertHoldMs?.()
    );
  }
  scheduleAlertWatch(delayMs = null) {
    if (this._alertWatchT) clearTimeout(this._alertWatchT);
    if (!this._host._isPreviewPageActive()) return;
    const wait = delayMs == null ? Math.max(
      1200,
      Math.floor(this._host._effectiveRealtimePollSeconds() * 1e3)
    ) : Math.max(0, Number(delayMs) || 0);
    this._alertWatchT = setTimeout(() => {
      this._alertWatchT = null;
      void this.probeLatestAlert().finally(() => {
        this.scheduleAlertWatch();
      });
    }, wait);
  }
  handleRealtimeMessage(msg) {
    if (!this._host._isPreviewPageActive()) return;
    const parsed = parseRealtimeAlertMessage({
      host: this._host,
      msg,
      checkSeverity: false
    });
    if (!parsed) {
      if (this._host._isRealtimeEventMessage?.(msg)) {
        this.scheduleAlertWatch(180);
      }
      return;
    }
    const { cam, severity, type } = parsed;
    const normalizedSeverity = String(severity || "").trim().toLowerCase();
    if (type !== "end" && !normalizedSeverity) {
      this.markAlertCamera(cam, "alert", this._host._previewAlertHoldMs?.());
      this.scheduleAlertWatch(180);
      return;
    }
    if (type === "end") {
      if (this.isCameraAlertLive(cam)) {
        this.markAlertCamera(
          cam,
          this.previewCellSeverity(cam),
          this._constants.PREVIEW_ALERT_END_GRACE_MS
        );
      }
      return;
    }
    if (!this._host._shouldHandleSlideshowReview(cam, normalizedSeverity)) {
      return;
    }
    this.markAlertCamera(
      cam,
      normalizedSeverity,
      this._host._previewAlertHoldMs?.()
    );
  }
  start() {
    if (!this._host._isPreviewPageActive()) return;
    this._startedAtSec = Math.floor(Date.now() / 1e3);
    this.clearTimers();
    this.clearAlertTracking();
    this._host._renderPreviewPage();
    this.scheduleAlertWatch(350);
  }
  stop() {
    this.clearTimers();
  }
  _scheduleAlertCleanup() {
    if (this._alertCleanupT) clearTimeout(this._alertCleanupT);
    let nextExpiry = 0;
    for (const until of this._alertExpiresByEntity.values()) {
      const ts = Number(until || 0);
      if (ts <= Date.now()) continue;
      if (!nextExpiry || ts < nextExpiry) nextExpiry = ts;
    }
    if (!nextExpiry) {
      this._alertCleanupT = null;
      return;
    }
    const wait = Math.max(100, nextExpiry - Date.now() + 25);
    this._alertCleanupT = setTimeout(() => {
      this._alertCleanupT = null;
      let changed = false;
      const now = Date.now();
      for (const [entity, until] of this._alertExpiresByEntity.entries()) {
        if (Number(until || 0) <= now) {
          this._alertExpiresByEntity.delete(entity);
          this._alertSeverityByEntity.delete(entity);
          changed = true;
        }
      }
      if (changed && this._host._isPreviewPageActive()) {
        this._host._renderPreviewPage();
      }
      this._scheduleAlertCleanup();
    }, wait);
  }
};

// src/features/preview/page.ctrl.js
const PreviewPageController = class {
  constructor(host, constants) {
    this._host = host;
    this._constants = constants;
  }
  _pageNavigation() {
    return this._host._pageNavigationController || null;
  }
  previewLiveCamerasEnabled() {
    return this._host._config?.preview_page_live_cameras === true;
  }
  isPreviewPageEnabled() {
    return this._host._config?.preview_page_enabled === true;
  }
  isPreviewPageActive() {
    return this.isPreviewPageEnabled() && this._host._pageId === this._constants.PAGE_IDS.preview;
  }
  previewShowTitleBarsEnabled() {
    return this._host._config?.preview_page_show_title_bars !== false;
  }
  previewShouldUseLive(entity) {
    return this.previewLiveCamerasEnabled() || this._host._isPreviewCameraAlertLive(entity);
  }
  previewEventsCount(entity) {
    const cache = this._host._camCache[entity];
    const eventsCount = Array.isArray(cache?.events) ? cache.events.length : 0;
    const reviewsCount = Array.isArray(cache?.reviews) ? cache.reviews.length : 0;
    return eventsCount + reviewsCount;
  }
  previewCellSeverity(entity) {
    return this._host._previewAlertController.previewCellSeverity(entity);
  }
  _previewPageTitle() {
    return this._host._config.title || (this._host._config.cameras.length === 1 ? cap(camDisplayName(this._host._config.cameras[0])) : "Cameras") || "Camera";
  }
  buildPreviewLayoutShellMarkup() {
    const previewShellHeader = buildPreviewShellHeaderMarkup({
      title: this._previewPageTitle(),
      subtitle: this._host._subtitleText(),
      pageNav: this._pageNavigation()?.pageNavMarkup?.() || this._host._pageNavMarkup?.() || ""
    });
    return buildPreviewLayoutShellMarkup({
      previewShellHeader,
      previewFooterIcon: ICONS.frigateView
    });
  }
  ensurePreviewLayoutShell() {
    const existingShell = this._host._$("#preview-shell");
    if (existingShell) return existingShell;
    const layout = this._host._$("#layout");
    const leftColumn = this._host._$("#col-left");
    if (!layout || !leftColumn) return null;
    leftColumn.insertAdjacentHTML(
      "beforebegin",
      this.buildPreviewLayoutShellMarkup()
    );
    this._host._domCache = {};
    return this._host._$("#preview-shell");
  }
  removePreviewLayoutShell() {
    let removed = false;
    ["#preview-shell-header", "#preview-shell", "#preview-shell-footer"].map((selector) => this._host._$(selector)).forEach((el) => {
      if (!el) return;
      el.remove();
      removed = true;
    });
    if (removed) this._host._domCache = {};
  }
  applyPreviewShellVisibility() {
    const card = this._host._$("#card");
    if (!card) return;
    if (this.isPreviewPageEnabled() && this.isPreviewPageActive()) {
      this.ensurePreviewLayoutShell();
    } else {
      this.removePreviewLayoutShell();
    }
    card.classList.toggle("preview-active", this.isPreviewPageActive());
  }
  previewLiveStreamHint() {
    return resolvePreviewLiveStreamHint({
      activeStreamType: this._host._activeStreamType,
      lastLiveStreamHint: this._host._lastLiveStreamHint,
      isIOS: DEVICE_PROFILE.isIOS
    });
  }
  previewStreamSourceLabel(entity, useLive) {
    return resolvePreviewStreamSourceLabel({
      useLive,
      connectionType: this._host._cameraConnectionType(entity),
      liveStreamHint: this.previewLiveStreamHint()
    });
  }
  teardownPreviewMedia() {
    if (this._host._previewMediaState) {
      this._host._previewMediaState.destroyed = true;
      for (const cleanup of this._host._previewMediaState.cleanup || []) {
        try {
          cleanup();
        } catch (_) {
        }
      }
    }
    this._host._previewMediaState = null;
    this._host._previewLastRenderSignature = "";
    const hosts = this._host.shadowRoot.querySelectorAll(".preview-media-host");
    hosts.forEach((host) => {
      host.querySelectorAll("video").forEach((video) => {
        try {
          video.pause();
          video.removeAttribute("src");
          video.load();
        } catch (_) {
        }
      });
      host.querySelectorAll("img[data-fvc-blob-url]").forEach((img) => {
        const blobUrl = img.dataset.fvcBlobUrl || "";
        if (!blobUrl) return;
        try {
          URL.revokeObjectURL(blobUrl);
        } catch (_) {
        }
      });
      host.innerHTML = "";
    });
  }
  renderPreviewPage() {
    if (!this.isPreviewPageEnabled()) {
      this.teardownPreviewMedia();
      this.applyPreviewShellVisibility();
      this._host._syncSnapshotRefreshTimer?.();
      return;
    }
    if (!this.isPreviewPageActive()) {
      this.teardownPreviewMedia();
      this.applyPreviewShellVisibility();
      this._host._syncSnapshotRefreshTimer?.();
      return;
    }
    const shell = this.ensurePreviewLayoutShell();
    if (!shell) return;
    const titleEl = this._host._$("#preview-shell-title");
    const subtitleEl = this._host._$("#preview-shell-subtitle");
    if (titleEl) titleEl.textContent = this._previewPageTitle();
    if (subtitleEl) subtitleEl.textContent = this._host._subtitleText();
    const cameras = Array.isArray(this._host._config?.cameras) ? this._host._config.cameras.slice(0, 9) : [];
    const showTitleBars = this.previewShowTitleBarsEnabled();
    const liveStreamHint = this.previewLiveStreamHint();
    const hassReady = !!this._host._hass?.states;
    const nextSignature = cameras.map((camera, index) => {
      const entity = camera?.entity || "";
      const useLive = this.previewShouldUseLive(entity);
      return `${index}:${entity}:${useLive ? `live:${liveStreamHint}` : "snap"}`;
    }).concat([
      `titles:${showTitleBars ? "1" : "0"}`,
      `hass:${hassReady ? "1" : "0"}`
    ]).join("|");
    if (shell.firstElementChild?.classList?.contains("preview-grid") && this._host._previewLastRenderSignature === nextSignature) {
      this.updatePreviewMeta();
      this.applyPreviewShellVisibility();
      this._host._syncSnapshotRefreshTimer?.();
      return;
    }
    this.teardownPreviewMedia();
    this._host._previewLastRenderSignature = nextSignature;
    const cellsMarkup = cameras.map((camera, index) => {
      const entity = camera?.entity || "";
      const entState = this._host._hass?.states?.[entity];
      const online = entState?.state !== "unavailable";
      const severity = this.previewCellSeverity(entity);
      const useLive = this.previewShouldUseLive(entity);
      const sourceLabel = this.previewStreamSourceLabel(entity, useLive);
      const eventsCount = this.previewEventsCount(entity);
      const name = cap(camDisplayName(camera));
      return buildPreviewCellMarkup({
        index,
        entity,
        severity,
        useLive,
        metaMarkup: buildPreviewMetaMarkup({
          showTitleBars,
          name,
          online,
          sourceLabel,
          eventsCount
        })
      });
    }).join("");
    const buttonsMarkup = cameras.map(
      (camera, index) => buildPreviewCameraButtonMarkup({
        index,
        name: cap(camDisplayName(camera))
      })
    ).join("");
    shell.innerHTML = buildPreviewShellMarkup({
      cellsMarkup,
      buttonsMarkup
    });
    this.mountPreviewMedia();
    this.applyPreviewShellVisibility();
    this._host._syncSnapshotRefreshTimer?.();
  }
  updatePreviewMeta() {
    const showTitleBars = this.previewShowTitleBarsEnabled();
    this._host.shadowRoot.querySelectorAll("[data-preview-camidx]").forEach((cell) => {
      const idx = Number(cell.dataset.previewCamidx);
      const camera = this._host._config?.cameras?.[idx];
      const entity = camera?.entity || "";
      if (!entity) return;
      const severity = this.previewCellSeverity(entity);
      const mediaHost = cell.querySelector(".preview-media-host");
      if (mediaHost) {
        mediaHost.classList.remove("grid-alert", "grid-detection");
        if (severity === "alert") mediaHost.classList.add("grid-alert");
        else if (severity === "detection") {
          mediaHost.classList.add("grid-detection");
        }
      }
      if (!showTitleBars) return;
      const online = this._host._hass?.states?.[entity]?.state !== "unavailable";
      const useLive = this.previewShouldUseLive(entity);
      const status = cell.querySelector(".preview-meta-status");
      if (status) {
        status.innerHTML = buildPreviewStatusMarkup(online);
      }
      const source = cell.querySelector(".preview-meta-source");
      if (source) {
        source.textContent = `Stream Source: ${this.previewStreamSourceLabel(entity, useLive)}`;
      }
      const events = cell.querySelector(".preview-meta-events");
      if (events) {
        events.textContent = `Events: ${this.previewEventsCount(entity)}`;
      }
    });
  }
  mountPreviewMedia() {
    if (!this.isPreviewPageActive()) return;
    const hosts = this._host.shadowRoot.querySelectorAll(".preview-media-host");
    if (!this._host._hass?.states) {
      hosts.forEach((host) => {
        host.innerHTML = `<div class="ph">${ICONS.live}<span>Loading\u2026</span></div>`;
      });
      return;
    }
    const liveStreamHint = this.previewLiveStreamHint();
    const previewState = { destroyed: false, cleanup: [] };
    this._host._previewMediaState = previewState;
    hosts.forEach((host) => {
      const entity = host.dataset.previewMediaEntity || "";
      const useLive = host.dataset.previewUseLive === "1";
      const stateObj = entity ? buildHaCameraStreamState(
        this._host._hass,
        entity,
        liveStreamHint,
        this._host._preferredStreamType()
      ) || this._host._hass?.states?.[entity] || null : null;
      host.innerHTML = "";
      if (!entity) {
        host.innerHTML = `<div class="ph">${ICONS.live}<span>Unavailable</span></div>`;
        return;
      }
      this._host._gridMediaController.mountCameraCellMedia(host, {
        entity,
        stateObj,
        useLive,
        liveStreamHint,
        gridState: previewState,
        fallbackOnLiveError: true
      });
    });
    this._host._syncSnapshotRefreshTimer?.();
  }
  activatePreviewPageRoute(context = {}) {
    const PAGE_IDS2 = this._constants.PAGE_IDS;
    if (context.previousPageId !== PAGE_IDS2.preview) {
      if (this._host._$("#myPopup")?.classList.contains("is-open")) {
        this._host._closePopup();
      }
      if (this._host._mountInProgress === true) {
        this._host._cancelPendingMount("page-route-preview");
      }
      if (typeof this._host._renderShellPreserveLive === "function") {
        this._host._renderShellPreserveLive();
      } else if (typeof this._host._renderShell === "function") {
        this._host._renderShell();
      }
    }
    this._host._applyPreviewShellVisibility();
    this._host._wideViewPageController.applyStyleLayoutAndWideSyncForCard();
    this.startPreviewMode();
    this._host._syncSnapshotRefreshTimer?.();
  }
  startPreviewMode() {
    this._host._previewAlertController.start();
  }
  stopPreviewMode() {
    this._host._clearPreviewTimers();
    this.teardownPreviewMedia();
  }
  exitPreviewPageToCamera(idx) {
    if (!this.isPreviewPageActive()) return;
    if (!Number.isInteger(idx) || idx < 0 || idx >= (this._host._config?.cameras?.length || 0)) {
      return;
    }
    const PAGE_IDS2 = this._constants.PAGE_IDS;
    const pageNavigation = this._pageNavigation();
    const targetPageId = pageNavigation?.isPageRouteAvailable?.(
      this._host._lastNonPreviewPageId
    ) ?? this._host._isPageRouteAvailable?.(this._host._lastNonPreviewPageId) ? this._host._lastNonPreviewPageId : PAGE_IDS2.singleView;
    pageNavigation?.navigateToPageRoute?.(targetPageId, {
      source: "preview-camera-select",
      deferCameraSwitch: true
    }) ?? this._host._navigateToPageRoute?.(targetPageId, {
      source: "preview-camera-select",
      deferCameraSwitch: true
    });
    if (this._host._activeCamIdx === idx) {
      this._host._viewMode = "single";
      this._host._syncTabsShell?.();
      this._host._renderAll?.();
      const engineHost = this._host._$("#engine");
      const hasLiveVideo = !!(this._host._findVideoDeep?.(engineHost) || this._host._findVideoDeep?.(this._host._engine) || this._host._engine?.video);
      if (hasLiveVideo) {
        this._host._scheduleResumeLive?.("preview-camera-select-same-camera");
      } else {
        this._host._mountEngine?.(null, { quiet: true });
      }
      return;
    }
    void this._host._switchCamera(idx, { source: "preview-camera-select" });
  }
  returnToPreviewPage() {
    const PAGE_IDS2 = this._constants.PAGE_IDS;
    if (!this.isPreviewPageEnabled() || this.isPreviewPageActive()) {
      return;
    }
    this._pageNavigation()?.navigateToPageRoute?.(PAGE_IDS2.preview, {
      source: "preview-page-return"
    }) ?? this._host._navigateToPageRoute?.(PAGE_IDS2.preview, {
      source: "preview-page-return"
    });
  }
};

// src/features/navigation/page-navigation.ctrl.js
const PageNavigationController = class {
  constructor(host, constants) {
    this._host = host;
    this._constants = constants;
  }
  pageRouteOptions() {
    return this._constants.getEnabledPageRoutes(
      this._host._config || {},
      this._host._deviceRouteBucket()
    );
  }
  isPageRouteAvailable(pageId) {
    return this.pageRouteOptions().includes(
      this._constants.normalizePageRoute(pageId)
    );
  }
  pageRouteLabel(pageId) {
    const { PAGE_IDS: PAGE_IDS2 } = this._constants;
    if (pageId === PAGE_IDS2.mobileView) return "Mobile";
    if (pageId === PAGE_IDS2.preview) return "Preview";
    if (pageId === PAGE_IDS2.wideView) return "Wide View";
    return "Single View";
  }
  pageRouteIcon(pageId) {
    const { PAGE_IDS: PAGE_IDS2, ICONS: ICONS2 = {} } = this._constants;
    if (pageId === PAGE_IDS2.mobileView) return ICONS2.mobileView || "";
    if (pageId === PAGE_IDS2.preview) return ICONS2.preView || "";
    if (pageId === PAGE_IDS2.wideView) return ICONS2.wideView || "";
    return ICONS2.singleView || "";
  }
  pageNavMarkup() {
    return this._constants.buildPageNavMarkup({
      routes: this.pageRouteOptions(),
      activePageId: this._constants.normalizePageRoute(this._host._pageId),
      getRouteLabel: (pageId) => this.pageRouteLabel(pageId),
      getRouteIcon: (pageId) => this.pageRouteIcon(pageId)
    });
  }
  pageNavButtonsMarkup() {
    return this._constants.buildPageNavButtonsMarkup({
      routes: this.pageRouteOptions(),
      activePageId: this._constants.normalizePageRoute(this._host._pageId),
      getRouteLabel: (pageId) => this.pageRouteLabel(pageId),
      getRouteIcon: (pageId) => this.pageRouteIcon(pageId)
    });
  }
  syncPageNavShell() {
    const nav = this._host._pageShellRegion("pageNavigation");
    if (nav) nav.innerHTML = this.pageNavButtonsMarkup();
    this.syncPageNavigationButtons();
  }
  syncPageNavigationButtons() {
    this._host._pageShellRegionElements("pageNavigation", "[data-page-route]").forEach((button) => {
      const isActive = button.dataset.pageRoute === this._constants.normalizePageRoute(this._host._pageId);
      button.classList.toggle("active", isActive);
      button.setAttribute("aria-pressed", isActive ? "true" : "false");
    });
  }
  navigateToPageRoute(pageId, context = {}) {
    return this.ensureNavigationFactory().navigateTo(pageId, context);
  }
  resolveConfiguredLandingPage(context = {}) {
    return this.ensureNavigationFactory().resolveStartupPage({
      hasPendingDeepLinkTarget: context.hasPendingDeepLinkTarget === true
    });
  }
  prepareConfiguredLandingPageShell(context = {}) {
    const nextPageId = this.resolveConfiguredLandingPage(context);
    const previousPageId = this._host._pageId;
    this._host._pageId = nextPageId;
    this._host._previewPageActive = nextPageId === this._constants.PAGE_IDS.preview;
    if (!this._host._previewPageActive) {
      this._host._lastNonPreviewPageId = nextPageId;
    }
    if (nextPageId !== previousPageId) {
      this._host._renderShell?.();
    }
    return nextPageId;
  }
  navigateToConfiguredLandingPage(context = {}) {
    const nextPageId = this.resolveConfiguredLandingPage(context);
    return this.navigateToPageRoute(nextPageId, context);
  }
  ensureNavigationFactory() {
    if (this._host._navigationFactory) return this._host._navigationFactory;
    const { createNavigationFactory: createNavigationFactory2, PAGE_IDS: PAGE_IDS2 } = this._constants;
    this._host._navigationFactory = createNavigationFactory2({
      pages: {
        [PAGE_IDS2.singleView]: {
          activate: (context) => this._host._activateSingleViewPageRoute(context)
        },
        [PAGE_IDS2.mobileView]: {
          activate: (context) => this._host._activateMobileViewPageRoute(context)
        },
        [PAGE_IDS2.preview]: {
          activate: (context) => this._host._activatePreviewPageRoute(context)
        },
        [PAGE_IDS2.wideView]: {
          activate: (context) => this._host._activateWideViewPageRoute(context)
        }
      },
      getDeviceBucket: () => this._host._deviceRouteBucket(),
      getConfig: () => this._host._config || {},
      onBeforeNavigate: (nextPageId, context) => {
        context.previousPageId = this._host._pageId || PAGE_IDS2.singleView;
        this._host._pageId = nextPageId;
        this._host._previewPageActive = nextPageId === PAGE_IDS2.preview;
      },
      onAfterNavigate: (nextPageId) => {
        if (nextPageId !== PAGE_IDS2.preview) {
          this._host._lastNonPreviewPageId = nextPageId;
        }
        this._host._syncMobileViewPageMarkup();
        this.syncPageNavigationButtons();
      }
    });
    return this._host._navigationFactory;
  }
};

// src/features/navigation/deep-link.ctrl.js
const DeepLinkController = class {
  constructor(host) {
    this._host = host;
  }
  isDeepLinkHandlingEnabled() {
    return this._host._config?.deep_link_enabled !== false;
  }
  mergedUrlSearchParams() {
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
  clearDeepLinkParamsFromUrl() {
    if (!this.isDeepLinkHandlingEnabled()) return;
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
  initDeepLinkFromUrl() {
    const params = this.mergedUrlSearchParams();
    const eventId = params.get("event") || params.get("event_id") || params.get("frigate_event") || params.get("frigate_event_id") || "";
    const reviewId = params.get("review") || params.get("review_id") || params.get("frigate_review") || params.get("frigate_review_id") || "";
    const cameraHint = params.get("camera") || params.get("cam") || params.get("camera_entity") || "";
    const mediaHint = params.get("media") || params.get("view") || params.get("open") || "";
    this._host._deepLinkEventId = String(eventId || "").trim();
    this._host._deepLinkReviewId = String(reviewId || "").trim();
    this._host._deepLinkMediaHint = String(mediaHint || "").trim().toLowerCase();
    this._host._deepLinkCameraHint = String(cameraHint || "").trim().toLowerCase();
    this._host._deepLinkApplied = false;
    this._host._deepLinkEventLookupTried = false;
    this._host._deepLinkReviewLookupTried = false;
  }
  deepLinkCameraHintIndex() {
    if (!this._host._deepLinkCameraHint) return -1;
    return this._host._config.cameras.findIndex((camera) => {
      const entity = String(camera.entity || "").toLowerCase();
      const name = String(camera.name || "").toLowerCase();
      const cacheCam = String(
        this._host._camCache[camera.entity]?.cam || ""
      ).toLowerCase();
      return entity === this._host._deepLinkCameraHint || name === this._host._deepLinkCameraHint || cacheCam === this._host._deepLinkCameraHint;
    });
  }
  applyDeepLinkCameraHint() {
    if (!this._host._deepLinkCameraHint) return;
    const idx = this.deepLinkCameraHintIndex();
    if (idx >= 0) this._host._activeCamIdx = idx;
  }
  isDeepLinkCandidateForCard() {
    if (!this.isDeepLinkHandlingEnabled()) return false;
    if (!this._host._deepLinkCameraHint) return true;
    return this.deepLinkCameraHintIndex() >= 0;
  }
  consumeDeepLinkEventOpen() {
    if (!this.isDeepLinkHandlingEnabled()) return;
    if (!this.isDeepLinkCandidateForCard()) return;
    if (!this._host._deepLinkEventId || this._host._deepLinkApplied) return;
    const event = this._host._findEventById(this._host._deepLinkEventId);
    if (!event) {
      this._host._deepLinkEventLookupTried = true;
      this.consumeDeepLinkReviewOpen();
      return;
    }
    this._host._deepLinkEventLookupTried = true;
    const eventCam = String(event.camera || "").toLowerCase();
    if (eventCam) {
      const idx = this._host._config.cameras.findIndex((camera) => {
        const cacheCam = String(
          this._host._camCache[camera.entity]?.cam || ""
        ).toLowerCase();
        return cacheCam === eventCam;
      });
      if (idx >= 0 && idx !== this._host._activeCamIdx) {
        this._host._switchCamera(idx);
        return;
      }
    }
    this._host._deepLinkApplied = true;
    if (this._host._deepLinkMediaHint === "snapshot") {
      this._host._popupMediaLoaderController?.showSnapshot?.(event) ?? this._host._showSnapshot?.(event);
      this.clearDeepLinkParamsFromUrl();
      return;
    }
    if (this._host._deepLinkMediaHint === "clip" && event.has_clip) {
      this._host._popupMediaLoaderController?.showClip?.(event, {
        mediaType: "clip"
      }) ?? this._host._showClip?.(event, { mediaType: "clip" });
      this.clearDeepLinkParamsFromUrl();
      return;
    }
    this._host._open(this._host._deepLinkEventId);
    this.clearDeepLinkParamsFromUrl();
  }
  consumeDeepLinkReviewOpen() {
    if (!this.isDeepLinkHandlingEnabled()) return;
    if (!this.isDeepLinkCandidateForCard()) return;
    if (this._host._deepLinkApplied) return;
    if (this._host._deepLinkEventId && !this._host._deepLinkEventLookupTried)
      return;
    if (!this._host._deepLinkReviewId) return;
    const review = (this._host._reviews || []).find(
      (item) => String(item?.id || "") === this._host._deepLinkReviewId
    );
    const reviewEventId = String(review?.data?.detections?.[0] || "");
    if (reviewEventId) {
      this._host._deepLinkEventId = reviewEventId;
      this._host._deepLinkEventLookupTried = false;
      this.consumeDeepLinkEventOpen();
      return;
    }
    if (this._host._deepLinkReviewLookupTried) return;
    this._host._deepLinkReviewLookupTried = true;
    void this._host._loadReviews().catch(() => {
    }).finally(() => {
      this.consumeDeepLinkReviewOpen();
      this.consumeDeepLinkEventOpen();
    });
  }
  hasPendingDeepLinkTarget() {
    if (!this.isDeepLinkCandidateForCard()) return false;
    return !!(this._host._deepLinkEventId || this._host._deepLinkReviewId || this._host._deepLinkCameraHint);
  }
};

// src/features/grid/utils.js
function normalizeGridAlertSeverity(value) {
  return String(value || "").trim().toLowerCase() === "detection" ? "detection" : "alert";
}
function normalizeGridCellSeverity(value) {
  const normalized = String(value || "").trim().toLowerCase();
  if (normalized === "detection") return "detection";
  if (normalized === "alert") return "alert";
  return "";
}
function isGridReviewFresh({
  gridStartedAtSec,
  reviewStartSec,
  graceSec
}) {
  const startedAt = Number(gridStartedAtSec || 0);
  if (startedAt <= 0) return true;
  const reviewStart = Number(reviewStartSec || 0);
  if (reviewStart <= 0) return false;
  return reviewStart >= startedAt - Number(graceSec || 0);
}
function gridAlertWatchIntervalMs(realtimePollSeconds) {
  return Math.max(1e3, Math.floor(Number(realtimePollSeconds || 0) * 1e3));
}

// src/features/grid/alert.ctrl.js
const GridAlertController = class {
  constructor(host, constants) {
    this._host = host;
    this._constants = constants;
    this._alertWatchT = null;
    this._alertCleanupT = null;
    this._startedAtSec = 0;
    this._handledReviewIds = new Set();
    this._lastAlertAt = 0;
    this._lastAlertCam = "";
    this._alertExpiresByEntity = new Map();
    this._alertSeverityByEntity = new Map();
  }
  clearTimers() {
    this.clearWatchTimer();
    if (this._alertCleanupT) clearTimeout(this._alertCleanupT);
    this._alertCleanupT = null;
  }
  clearWatchTimer() {
    if (this._alertWatchT) clearTimeout(this._alertWatchT);
    this._alertWatchT = null;
  }
  clearAlertTracking() {
    this._alertExpiresByEntity.clear();
    this._alertSeverityByEntity.clear();
    if (this._alertCleanupT) clearTimeout(this._alertCleanupT);
    this._alertCleanupT = null;
  }
  startSession() {
    this._startedAtSec = Math.floor(Date.now() / 1e3);
    this._handledReviewIds.clear();
    this._lastAlertAt = 0;
    this._lastAlertCam = "";
    this.clearAlertTracking();
  }
  stopSession() {
    this._startedAtSec = 0;
    this._handledReviewIds.clear();
    this._lastAlertAt = 0;
    this._lastAlertCam = "";
    this.clearAlertTracking();
  }
  rememberHandledReview(reviewId) {
    rememberHandledReviewId(this._handledReviewIds, reviewId);
  }
  isReviewFresh(review) {
    return isGridReviewFresh({
      gridStartedAtSec: this._startedAtSec,
      reviewStartSec: this._host._reviewStartTimeSec(review),
      graceSec: this._constants.SLIDESHOW_REVIEW_FRESHNESS_GRACE_SEC
    });
  }
  alertWatchIntervalMs() {
    return gridAlertWatchIntervalMs(this._host._effectiveRealtimePollSeconds());
  }
  scheduleAlertWatch(delayMs = null) {
    if (!this._host._isGridModeAvailable()) return;
    if (this._host._viewMode !== "grid") return;
    this.clearWatchTimer();
    const wait = delayMs == null ? this.alertWatchIntervalMs() : Math.max(0, Number(delayMs) || 0);
    this._alertWatchT = setTimeout(() => {
      this._alertWatchT = null;
      void this.probeLatestAlert().finally(() => {
        this.scheduleAlertWatch();
      });
    }, wait);
  }
  isCameraAlertLive(entity) {
    const until = Number(this._alertExpiresByEntity.get(entity) || 0);
    return until > Date.now();
  }
  cellSeverity(entity) {
    if (!this.isCameraAlertLive(entity)) {
      this._alertSeverityByEntity.delete(entity);
      return "";
    }
    return normalizeGridCellSeverity(this._alertSeverityByEntity.get(entity));
  }
  scheduleAlertCleanup() {
    if (this._alertCleanupT) clearTimeout(this._alertCleanupT);
    let nextExpiry = 0;
    for (const until of this._alertExpiresByEntity.values()) {
      const ts = Number(until || 0);
      if (ts <= Date.now()) continue;
      if (!nextExpiry || ts < nextExpiry) nextExpiry = ts;
    }
    if (!nextExpiry) {
      this._alertCleanupT = null;
      return;
    }
    const wait = Math.max(80, nextExpiry - Date.now() + 20);
    this._alertCleanupT = setTimeout(() => {
      this._alertCleanupT = null;
      let changed = false;
      const now = Date.now();
      for (const [entity, until] of this._alertExpiresByEntity.entries()) {
        if (Number(until || 0) <= now) {
          this._alertExpiresByEntity.delete(entity);
          this._alertSeverityByEntity.delete(entity);
          changed = true;
        }
      }
      if (changed && this._host._viewMode === "grid") {
        this._host._scheduleGridRefresh();
      }
      this.scheduleAlertCleanup();
    }, wait);
  }
  markAlertCamera(entity, severity = "alert") {
    if (!entity) return false;
    const wasLive = this.isCameraAlertLive(entity);
    const prevSeverity = String(this._alertSeverityByEntity.get(entity) || "").trim().toLowerCase();
    const normalizedSeverity = normalizeGridAlertSeverity(severity);
    const holdMs = this._host._gridAlertHoldMs?.() || this._host._gridRotationMs();
    this._alertSeverityByEntity.set(entity, normalizedSeverity);
    this._alertExpiresByEntity.set(
      entity,
      Date.now() + Math.max(1e3, Number(holdMs) || 0)
    );
    this.scheduleAlertCleanup();
    return !wasLive || prevSeverity !== normalizedSeverity;
  }
  async probeLatestAlert() {
    if (!this._host._isGridModeAvailable()) return;
    if (this._host._viewMode !== "grid") return;
    const before = Math.floor(Date.now() / 1e3);
    const after = Math.max(
      0,
      Math.floor(
        before - (this._host._config?.alerts_reviews_days || 3) * this._constants.DAY
      )
    );
    const next = await findNewestReviewCandidateAcrossCameras({
      cameras: this._host._config?.cameras,
      getEntity: (camera) => camera?.entity,
      getCache: (entity) => this._host._camCache[entity],
      fetchReviews: async ({ cache }) => this._host._ws({
        type: "frigate/reviews/get",
        instance_id: cache.clientId,
        cameras: [cache.cam],
        after,
        before,
        limit: 5
      }),
      buildCandidate: ({ entity, reviews }) => findFirstReviewCandidateForEntity({
        reviews,
        entity,
        isReviewFresh: (review) => this.isReviewFresh(review),
        normalizeSeverity: (review) => this._host._normalizeReviewSeverity(review),
        shouldHandleSeverity: (targetEntity, severity) => this._host._shouldHandleSlideshowReview(targetEntity, severity),
        isHandledReviewId: (reviewId) => this._handledReviewIds.has(reviewId),
        reviewStartTime: (review) => this._host._reviewStartTimeSec(review)
      })
    });
    if (!next?.entity) return;
    if (next.reviewId) this.rememberHandledReview(next.reviewId);
    this.handleAlertCandidate(next.entity, next.severity);
  }
  handleAlertCandidate(entity, severity = "alert") {
    if (!this._host._isGridModeAvailable()) return;
    if (this._host._viewMode !== "grid") return;
    const idx = this._host._cameraIndexByEntity(entity);
    if (idx < 0) return;
    const now = Date.now();
    if (this._lastAlertCam === entity && now - Number(this._lastAlertAt || 0) < 1200) {
      return;
    }
    const pageFocused = this._host._focusGridPageForCamera?.(entity) === true;
    this._lastAlertAt = now;
    this._lastAlertCam = entity;
    const changed = this.markAlertCamera(entity, severity || "alert");
    if (changed || pageFocused) this._host._scheduleGridRefresh();
  }
  handleRealtimeMessage(msg) {
    if (!this._host._isGridModeAvailable()) return;
    if (this._host._viewMode !== "grid") return;
    const parsed = parseRealtimeAlertMessage({
      host: this._host,
      msg,
      checkSeverity: false
    });
    if (!parsed) {
      if (this._host._isRealtimeEventMessage?.(msg)) {
        this.scheduleAlertWatch(180);
      }
      return;
    }
    const { cam, severity, type } = parsed;
    const normalizedSeverity = String(severity || "").trim().toLowerCase();
    if (type === "end") return;
    if (!normalizedSeverity) {
      this.handleAlertCandidate(cam, "alert");
      this.scheduleAlertWatch(180);
      return;
    }
    this.handleAlertCandidate(cam, normalizedSeverity);
  }
};

// src/features/grid/page.ctrl.js
const GridPageController = class {
  constructor(host) {
    this._host = host;
  }
  isGridModeAvailable() {
    return this._host._config?.grid_mode_enabled === true && !DEVICE_PROFILE.isPhone && !this._host._isMobilePhoneViewport() && Array.isArray(this._host._config?.cameras) && this._host._config.cameras.length > 1;
  }
  gridRotationMs() {
    const seconds = Number(this._host._config?.grid_rotation_seconds);
    return GRID_ROTATION_OPTIONS_SECONDS.includes(seconds) ? seconds * 1e3 : 3e4;
  }
  clearGridTimers() {
    if (this._host._gridRotationT) clearTimeout(this._host._gridRotationT);
    if (this._host._gridAlertReturnT)
      clearTimeout(this._host._gridAlertReturnT);
    if (this._host._gridRefreshT) clearTimeout(this._host._gridRefreshT);
    this._host._gridRotationT = null;
    this._host._gridAlertReturnT = null;
    this._host._gridRefreshT = null;
    this._host._gridAlertController.clearTimers();
    this._host._clearSnapshotRefreshTimer?.();
  }
  clearGridAlertTracking() {
    this._host._gridAlertController.clearAlertTracking();
    this._host._gridLastRenderSignature = "";
  }
  scheduleGridRefresh(delayMs = 80) {
    if (this._host._gridRefreshT) clearTimeout(this._host._gridRefreshT);
    if (this._host._viewMode !== "grid") return;
    this._host._gridRefreshT = setTimeout(
      () => {
        this._host._gridRefreshT = null;
        if (this._host._viewMode !== "grid") return;
        this._host._mountEngine(null, { quiet: true });
      },
      Math.max(0, Number(delayMs) || 0)
    );
  }
  shouldStartInGridMode() {
    return this._host._config?.grid_start_in_grid_enabled === true && this.isGridModeAvailable();
  }
  applyStartInGridMode(_source = "") {
    if (this._host._isPreviewPageActive()) return;
    if (!this.shouldStartInGridMode()) return;
    if (this._host._viewMode === "grid") return;
    this._host._gridRotationStart = 0;
    this._host._setViewMode("grid");
  }
  scheduleGridRotation() {
    if (!this.isGridModeAvailable()) return;
    if (this._host._viewMode !== "grid") return;
    if ((this._host._config?.cameras?.length || 0) <= 4) {
      if (this._host._gridRotationT) clearTimeout(this._host._gridRotationT);
      this._host._gridRotationT = null;
      return;
    }
    if (this._host._gridRotationT) clearTimeout(this._host._gridRotationT);
    this._host._gridRotationT = setTimeout(() => {
      this._host._gridRotationT = null;
      this.advanceGridRotation();
    }, this.gridRotationMs());
  }
  advanceGridRotation() {
    if (!this.isGridModeAvailable()) return;
    if (this._host._viewMode !== "grid") return;
    const total = this._host._config?.cameras?.length || 0;
    if (total <= 4) {
      this._host._gridRotationStart = 0;
      this.scheduleGridRotation();
      return;
    }
    const totalPages = Math.max(1, Math.ceil(total / 4));
    const currentPage = Math.min(
      totalPages - 1,
      Math.max(0, Math.floor((Number(this._host._gridRotationStart) || 0) / 4))
    );
    const nextPage = (currentPage + 1) % totalPages;
    this._host._gridRotationStart = nextPage * 4;
    this._host._mountEngine(null, { quiet: true });
    this.scheduleGridRotation();
  }
  focusGridPageForCamera(entity) {
    if (!this.isGridModeAvailable()) return false;
    const idx = this._host._cameraIndexByEntity(entity);
    if (idx < 0) return false;
    const total = this._host._config?.cameras?.length || 0;
    if (total <= 0) return false;
    const maxStart = Math.max(0, (Math.ceil(total / 4) - 1) * 4);
    const nextStart = Math.min(maxStart, Math.floor(idx / 4) * 4);
    const currentStart = Math.min(
      maxStart,
      Math.max(
        0,
        Math.floor((Number(this._host._gridRotationStart) || 0) / 4) * 4
      )
    );
    if (nextStart === currentStart) return false;
    this._host._gridRotationStart = nextStart;
    this._host._gridPinnedRotationStart = nextStart;
    this.scheduleGridRotation();
    return true;
  }
  stopGridModeState() {
    this.clearGridTimers();
    this._host._gridResumePending = false;
    this._host._gridPinnedRotationStart = Math.max(
      0,
      Number(this._host._gridRotationStart) || 0
    );
    this._host._gridAlertController.stopSession();
    this._host._gridLastRenderSignature = "";
    this._host._setSlideshowAlertState("");
  }
  toggleGridMode() {
    if (this._host._isPreviewPageActive()) return;
    if (this._host._viewMode === "grid" || this._host._gridResumePending) {
      this._host._gridResumePending = false;
      this.stopGridModeState();
      if (this._host._viewMode === "grid") {
        this._host._setViewMode("single");
      } else {
        this._host._syncToolbarButtons();
      }
      return;
    }
    this._host._gridRotationStart = 0;
    this._host._gridPinnedRotationStart = 0;
    this.clearGridAlertTracking();
    this._host._setViewMode("grid");
  }
};

// src/features/card-style/context.ctrl.js
const CardStyleContextController = class {
  constructor(host) {
    this._host = host;
  }
  visualStyleToggleRules() {
    return [
      { configKey: "shadows", className: "shadows-off" },
      { configKey: "borders", className: "borders-off" },
      { configKey: "rounded_corners", className: "corners-off" }
    ];
  }
  cardStateClassNames() {
    const classes = this.visualStyleToggleRules().filter(({ configKey }) => this._host._config?.[configKey] === false).map(({ className }) => className);
    if (this._host._isPreviewPageActive()) classes.push("preview-active");
    if (this._host._isLikelyMobileClient?.()) classes.push("mobile-client");
    return classes.join(" ");
  }
  syncVisualStyleToggles() {
    const card = this._host.shadowRoot?.querySelector("#card");
    if (!card) return;
    for (const { configKey, className } of this.visualStyleToggleRules()) {
      const isEnabled = this._host._config?.[configKey] !== false;
      card.classList.toggle(className, !isEnabled);
    }
    this.syncHostOuterStyles();
  }
  syncHostOuterStyles() {
    const card = this._host.shadowRoot?.querySelector("#card");
    if (!card) return;
    const outerShadow = this.resolveCardTokenForHost(
      card,
      "box-shadow",
      "var(--fvc-outer-shadow-m)"
    );
    const outerRadius = this.resolveCardTokenForHost(
      card,
      "border-radius",
      "var(--fvc-outer-border-radius)"
    );
    this._host.style.boxShadow = this._host._config?.outer_shadows !== false && outerShadow ? outerShadow : "none";
    if (outerRadius) {
      this._host.style.borderRadius = outerRadius;
    } else {
      this._host.style.removeProperty("border-radius");
    }
  }
  resolveCardTokenForHost(card, cssProperty, token) {
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
  applyTightMargins() {
    const tightMarginsEnabled = this._host._config?.tight_margins === true;
    const inPreviewContext = this._host._isPreviewContext();
    if (this._host.parentElement) {
      this._host.parentElement.style.height = inPreviewContext ? "auto" : "100%";
      if (tightMarginsEnabled) {
        this._host.parentElement.style.margin = "0";
        this._host.parentElement.style.padding = "0";
      } else if (this._host._parentOrigStyle) {
        this._host.parentElement.style.margin = this._host._parentOrigStyle.margin;
        this._host.parentElement.style.padding = this._host._parentOrigStyle.padding;
      }
    }
    const card = this._host.shadowRoot?.querySelector("#card");
    if (card) card.classList.toggle("tight-margins", tightMarginsEnabled);
    this.setSectionsRowGap(tightMarginsEnabled);
  }
  setSectionsRowGap(tightMarginsEnabled) {
    let element = this._host;
    while (element) {
      if (element.tagName === "HUI-SECTIONS-VIEW") {
        if (tightMarginsEnabled && !this.isPanelView()) {
          element.style.setProperty("--ha-view-sections-row-gap", "0px");
        } else {
          element.style.removeProperty("--ha-view-sections-row-gap");
        }
        break;
      }
      element = element.parentNode || element.host;
    }
  }
  isPanelView() {
    let element = this._host;
    while (element) {
      if (element.tagName === "HUI-SECTIONS-VIEW" && element.shadowRoot) {
        return !this.hasAncestorInShadow(element.shadowRoot, this._host);
      }
      element = element.parentNode || element.host;
    }
    return false;
  }
  hasAncestorInShadow(root, target) {
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
  applyCardStyle() {
    const card = this._host.shadowRoot?.querySelector(".card");
    if (!card) return;
    this.applyTightMargins();
    const rawHeight = this._host._config.stream_height;
    const isCompactPreview = this._host._config?.compact_preview === true || this._host._isPreviewContext();
    const configuredHeightUnit = this._host._config.stream_height_unit || "vh";
    const isDefaultStubPreview = this._host._isPreviewContext() && this._host._config?.compact_preview === true && configuredHeightUnit === "%" && Number(rawHeight) === 100 && this._host._config?.title === "Frigate Preview" && this._host._config?.subtitle === "Compact preview";
    const configuredHeight = isDefaultStubPreview ? 50 : rawHeight;
    const previewHeightFallback = isCompactPreview && !configuredHeight ? "320px" : "";
    const configuredHeightValue = configuredHeight != null ? `${configuredHeight}${configuredHeightUnit}` : "";
    const numericHeight = Number(configuredHeight);
    const isPercentHeight = configuredHeightUnit === "%" && Number.isFinite(numericHeight) && numericHeight > 0;
    const hostComputedStyle = getComputedStyle(this._host);
    const haCardHeight = hostComputedStyle.getPropertyValue("--ha-card-height").trim();
    if (configuredHeight) {
      if (isPercentHeight) {
        const resolvedPercentHeightPx = this.resolvePercentHostHeightPx({
          ratio: Math.max(0.01, numericHeight / 100),
          haCardHeight,
          headerHeight: hostComputedStyle.getPropertyValue("--header-height")
        });
        if (resolvedPercentHeightPx != null) {
          this._host.style.setProperty(
            "--card-host-height",
            `${resolvedPercentHeightPx}px`
          );
        } else {
          this._host.style.removeProperty("--card-host-height");
        }
        card.style.removeProperty("--view-height");
      } else {
        this._host.style.setProperty(
          "--card-host-height",
          configuredHeightValue
        );
        card.style.setProperty("--view-height", configuredHeightValue);
      }
    } else if (previewHeightFallback) {
      this._host.style.setProperty("--card-host-height", previewHeightFallback);
      card.style.setProperty("--view-height", previewHeightFallback);
    } else {
      this._host.style.removeProperty("--card-host-height");
      if (haCardHeight) {
        card.style.setProperty("--view-height", haCardHeight);
      } else {
        card.style.removeProperty("--view-height");
      }
    }
    const customTheme = this._host._config?.theme === "custom" && this._host._config?.theme_custom && typeof this._host._config.theme_custom === "object" ? this._host._config.theme_custom : {};
    const customDefaults = this._host._config?.theme === "custom" && this._host._config?.theme_custom_defaults && typeof this._host._config.theme_custom_defaults === "object" ? this._host._config.theme_custom_defaults : {};
    for (const row of THEME_CUSTOM_ROWS) {
      const key = row.key;
      const override = normalizeHexColor2(customTheme[key]);
      const useDefault = customDefaults[key] === true;
      if (!useDefault && override) {
        card.style.setProperty(key, override);
      } else {
        card.style.removeProperty(key);
      }
    }
    this.syncHostOuterStyles();
  }
  resolvePercentHostHeightPx({ ratio, haCardHeight, headerHeight }) {
    const headerHeightPx = this.parsePxLength(headerHeight) ?? 56;
    const viewportHeightPx = Math.max(
      0,
      (window.visualViewport?.height || window.innerHeight || 0) - headerHeightPx
    );
    const referenceHeightPx = this.parsePxLength(haCardHeight) ?? (viewportHeightPx > 0 ? viewportHeightPx : null);
    if (referenceHeightPx == null) return null;
    return Math.max(1, referenceHeightPx * ratio);
  }
  parsePxLength(value) {
    const match = /^(-?\d+(?:\.\d+)?)px$/i.exec(String(value || "").trim());
    if (!match) return null;
    const parsed = Number(match[1]);
    return Number.isFinite(parsed) ? parsed : null;
  }
};

// src/features/editor-preview/context.ctrl.js
const EditorPreviewContextController = class {
  constructor(host) {
    this._host = host;
    this._watchdogTimer = null;
    this._dialogObserver = null;
    this._dialogOpenLast = false;
    this._dashboardEditLast = false;
    this._lastEditorPreviewContext = null;
  }
  dispose() {
    if (this._watchdogTimer) clearInterval(this._watchdogTimer);
    this._watchdogTimer = null;
    if (this._dialogObserver) this._dialogObserver.disconnect();
    this._dialogObserver = null;
  }
  syncHassPreviewContext() {
    const inEditorPreview = this.isEditorPreviewContext();
    if (this._lastEditorPreviewContext === true && !inEditorPreview) {
      this._host._scheduleResumeLive("hass-edit-exit");
    }
    this._lastEditorPreviewContext = inEditorPreview;
    return inEditorPreview;
  }
  startEditModeWatchdog() {
    if (this._watchdogTimer) clearInterval(this._watchdogTimer);
    this._lastEditorPreviewContext = this.isEditorPreviewContext();
    this._dialogOpenLast = this.isCardEditorDialogOpen();
    this._dashboardEditLast = this.isDashboardEditMode();
    this._watchdogTimer = setInterval(() => {
      if (!this._host.isConnected) return;
      const inEditorPreview = this.isEditorPreviewContext();
      const dialogOpen = this.isCardEditorDialogOpen();
      const dashboardEdit = this.isDashboardEditMode();
      if (this._dialogOpenLast && !dialogOpen) {
        this._host._scheduleResumeLive("watchdog-dialog-close");
      }
      if (this._lastEditorPreviewContext === true && !inEditorPreview) {
        this._host._scheduleResumeLive("watchdog-edit-exit");
      }
      if (this._dashboardEditLast !== dashboardEdit) {
        this._host._scheduleResumeLive(
          dashboardEdit ? "watchdog-dashboard-edit-on" : "watchdog-dashboard-edit-off"
        );
      }
      if (dashboardEdit) {
        this._host._kickLiveIfStale(true);
      }
      this._dialogOpenLast = dialogOpen;
      this._dashboardEditLast = dashboardEdit;
      this._lastEditorPreviewContext = inEditorPreview;
    }, 600);
  }
  isDashboardEditMode() {
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
  isCardEditorDialogOpen() {
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
      const dialogStyle = window.getComputedStyle?.(haDialog);
      if (dialogStyle?.display === "none" || dialogStyle?.visibility === "hidden") {
        return false;
      }
      return true;
    }
    const hostStyle = window.getComputedStyle?.(dialogHost);
    if (hostStyle?.display === "none" || hostStyle?.visibility === "hidden") {
      return false;
    }
    if (dialogHost.hidden === true) return false;
    if (dialogHost.getAttribute?.("aria-hidden") === "true") return false;
    return true;
  }
  startEditorDialogCloseObserver() {
    if (this._dialogObserver) this._dialogObserver.disconnect();
    this._dialogObserver = null;
    this._dialogOpenLast = this.isCardEditorDialogOpen();
    if (!("MutationObserver" in window) || !document.body) return;
    this._dialogObserver = new MutationObserver(() => {
      const openNow = this.isCardEditorDialogOpen();
      if (this._dialogOpenLast && !openNow) {
        this._host._scheduleResumeLive("card-editor-close");
      }
      this._dialogOpenLast = openNow;
    });
    this._dialogObserver.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["open", "opened", "hidden", "class", "style"]
    });
  }
  isEditorPreviewContext() {
    let el = this._host;
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
  isCardPickerPreviewContext() {
    let el = this._host;
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
  isPreviewContext() {
    return this.isEditorPreviewContext() || this.isCardPickerPreviewContext();
  }
};

// src/features/popup/media-loader.ctrl.js
const SNAPSHOT_DOUBLE_TAP_DELAY_MS = 320;
const SNAPSHOT_DOUBLE_TAP_DISTANCE_PX = 28;
const SNAPSHOT_MOVE_TOLERANCE_PX = 8;
const TOUCH_DOUBLE_CLICK_SUPPRESSION_MS = 500;
const snapshotPointerPoint = (event) => ({
  pointerId: event.pointerId,
  clientX: Number(event.clientX) || 0,
  clientY: Number(event.clientY) || 0,
  startX: Number(event.clientX) || 0,
  startY: Number(event.clientY) || 0,
  moved: false
});
const snapshotTapDistance = (first, second) => Math.hypot(
  Number(second?.clientX || 0) - Number(first?.clientX || 0),
  Number(second?.clientY || 0) - Number(first?.clientY || 0)
);
const PopupSnapshotFullscreenController = class {
  constructor({ target, onFullscreen, now = () => Date.now() } = {}) {
    __publicField(this, "_onDoubleClick", (event) => {
      if (this._now() - this._lastTouchFullscreenAt < TOUCH_DOUBLE_CLICK_SUPPRESSION_MS) {
        return;
      }
      this._requestFullscreen(event);
    });
    __publicField(this, "_onPointerDown", (event) => {
      if (String(event.pointerType || "").toLowerCase() !== "touch") return;
      this._pointers.set(event.pointerId, snapshotPointerPoint(event));
      if (this._pointers.size <= 1) return;
      this._lastTap = null;
      this._pointers.forEach((point) => {
        point.moved = true;
      });
    });
    __publicField(this, "_onPointerMove", (event) => {
      const point = this._pointers.get(event.pointerId);
      if (!point) return;
      point.clientX = Number(event.clientX) || 0;
      point.clientY = Number(event.clientY) || 0;
      if (Math.hypot(point.clientX - point.startX, point.clientY - point.startY) > SNAPSHOT_MOVE_TOLERANCE_PX) {
        point.moved = true;
      }
    });
    __publicField(this, "_onPointerUp", (event) => this._finishPointer(event));
    __publicField(this, "_onPointerCancel", (event) => this._finishPointer(event, true));
    this._target = target;
    this._onFullscreen = onFullscreen;
    this._now = now;
    this._cleanup = new CleanupController();
    this._pointers = new Map();
    this._lastTap = null;
    this._lastTouchFullscreenAt = 0;
    this._bound = false;
  }
  bind() {
    if (this._bound || !this._target) return this;
    this._bound = true;
    this._cleanup.addEventListener(
      this._target,
      "dblclick",
      this._onDoubleClick
    );
    this._cleanup.addEventListener(
      this._target,
      "pointerdown",
      this._onPointerDown
    );
    this._cleanup.addEventListener(
      this._target,
      "pointermove",
      this._onPointerMove
    );
    this._cleanup.addEventListener(
      this._target,
      "pointerup",
      this._onPointerUp,
      { passive: false }
    );
    this._cleanup.addEventListener(
      this._target,
      "pointercancel",
      this._onPointerCancel
    );
    return this;
  }
  dispose() {
    if (!this._bound) return;
    this._cleanup.dispose();
    this._pointers.clear();
    this._lastTap = null;
    this._bound = false;
  }
  _requestFullscreen(event) {
    event?.preventDefault?.();
    this._onFullscreen?.();
  }
  _finishPointer(event, cancelled = false) {
    const point = this._pointers.get(event.pointerId);
    if (!point) return;
    this._pointers.delete(event.pointerId);
    if (cancelled || point.moved) {
      this._lastTap = null;
      return;
    }
    const now = this._now();
    const currentTap = {
      clientX: Number(event.clientX) || point.clientX,
      clientY: Number(event.clientY) || point.clientY,
      at: now
    };
    if (this._lastTap && now - this._lastTap.at <= SNAPSHOT_DOUBLE_TAP_DELAY_MS && snapshotTapDistance(this._lastTap, currentTap) <= SNAPSHOT_DOUBLE_TAP_DISTANCE_PX) {
      this._lastTap = null;
      this._lastTouchFullscreenAt = now;
      this._requestFullscreen(event);
      return;
    }
    this._lastTap = currentTap;
  }
};
const PopupMediaLoaderController = class {
  constructor(host, deps = {}) {
    this._host = host;
    this._deps = {
      buildVideoOptionsForView,
      createVideoElement,
      mountNodeIntoSlot,
      isIOS,
      ...deps
    };
  }
  renderPopupMedia({
    playingId,
    html,
    mediaElement,
    mediaType,
    infoEvent,
    infoOpts
  }) {
    this._host._enter();
    this._host._clearPopupMediaCleanup();
    const isElement = typeof Element !== "undefined" && mediaElement instanceof Element;
    const renderPlan = resolvePopupMediaRenderPlan({
      infoOpts,
      mediaType,
      hasMediaElement: isElement,
      html
    });
    this._host._playing = playingId ? { id: playingId } : null;
    this._host._popupMediaType = renderPlan.popupMediaType;
    const viewer = this._host._$("#viewer");
    viewer.innerHTML = "";
    if (renderPlan.shouldAppendMediaElement) {
      viewer.appendChild(mediaElement);
    } else {
      viewer.innerHTML = renderPlan.viewerHtml;
    }
    const body = this._host._$("#myPopup")?.querySelector(".popup-body");
    if (body) body.scrollTop = 0;
    const video = viewer.querySelector("video");
    this._host._attachPopupVideoZoom?.(video);
    const snapshot = viewer.querySelector("img.snap");
    if (snapshot) {
      const snapshotFullscreenController = new PopupSnapshotFullscreenController({
        target: snapshot,
        onFullscreen: () => this._host._fullscreen(viewer)
      }).bind();
      this._host._popupMediaCleanup = () => {
        snapshotFullscreenController.dispose();
      };
    }
    const postRenderPlan = resolvePopupMediaPostRenderPlan({
      popupMediaType: this._host._popupMediaType,
      activeId: this._host._popupMediaCurrentId(),
      hasVideo: !!video
    });
    if (postRenderPlan.shouldEnsureAirPlayButton) {
      this._host._ensurePopupAirPlayButton(postRenderPlan.airPlayMediaType);
    }
    if (postRenderPlan.shouldRenderInfo) {
      this._host._renderPopupInfo(infoEvent, infoOpts);
    }
    if (postRenderPlan.shouldInitPopupMediaControls) {
      this._host._initPopupMediaControls(video, this._host._popupMediaType);
    } else if (postRenderPlan.shouldResetControlsWithoutVideo) {
      const controls = this._host._$("#popup-media-controls");
      const controlsPlan = renderPlan.controlsPlan;
      if (controls) {
        controls.hidden = controlsPlan.controlsHidden;
        if (controlsPlan.resetControlsHiddenClass) {
          controls.classList.remove("is-hidden");
        }
      }
    }
    if (postRenderPlan.shouldRenderCarousel) {
      this._host._renderPopupCarousel(
        postRenderPlan.carouselMediaType,
        postRenderPlan.carouselActiveId
      );
    }
    if (postRenderPlan.shouldScheduleRotateOverlay) {
      this._host._scheduleRotateOverlayUpdate();
    }
    if (postRenderPlan.shouldShowPopupControls) {
      this._host._showPopupControlsTemporarily();
    }
    this._host._preparePopupPlaybackTarget?.();
  }
  buildPopupVideo(src, { autoplay = true, muted = true } = {}) {
    return this._deps.createVideoElement(
      this._deps.buildVideoOptionsForView(
        "popup",
        {
          autoplay,
          muted,
          src
        },
        { scopeKey: this._host }
      )
    );
  }
  buildPopupClipSrc(id, file) {
    return buildPopupMediaUrl({
      baseUrl: this._host._media(id, file),
      cacheKey: `${id}:${Date.now()}`
    });
  }
  showClip(event, opts = {}) {
    const renderPlan = buildPopupClipRenderPlan({
      id: event.id,
      opts,
      infoEvent: event,
      isIos: this._deps.isIOS
    });
    const src = this.buildPopupClipSrc(event.id, renderPlan.mediaFile);
    this.renderPopupMedia({
      playingId: renderPlan.playingId,
      mediaElement: this.buildPopupVideo(src),
      mediaType: renderPlan.mediaType,
      infoEvent: renderPlan.infoEvent,
      infoOpts: renderPlan.infoOpts
    });
  }
  showClipById(id, opts = {}) {
    if (!id) return;
    const renderPlan = buildPopupClipRenderPlan({
      id,
      opts,
      infoEvent: this._host._findEventById(id),
      isIos: this._deps.isIOS,
      includeLookupInfo: true
    });
    const src = this.buildPopupClipSrc(id, renderPlan.mediaFile);
    this.renderPopupMedia({
      playingId: renderPlan.playingId,
      mediaElement: this.buildPopupVideo(src),
      mediaType: renderPlan.mediaType,
      infoEvent: renderPlan.infoEvent,
      infoOpts: renderPlan.infoOpts
    });
  }
  showSnapshot(event, opts = {}) {
    const renderPlan = buildPopupSnapshotRenderPlan({ event, opts });
    this.renderPopupMedia({
      playingId: renderPlan.playingId,
      html: `<img class="snap" src="${this._host._media(event.id, "snapshot.jpg")}">`,
      mediaType: renderPlan.mediaType,
      infoEvent: renderPlan.infoEvent,
      infoOpts: renderPlan.infoOpts
    });
  }
  async tryRecordingSource(video, src, { autoplay = true, timeoutMs = 9e3 } = {}) {
    if (!video || !src) return false;
    const isHlsSource = /\.m3u8(?:$|\?)/i.test(src);
    this._host._destroyRecordingHls();
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
          const HlsCtor = await this._host._getHlsJsCtor();
          if (!HlsCtor || !HlsCtor.isSupported?.()) {
            finish(false);
            return;
          }
          const hls = new HlsCtor({
            enableWorker: true,
            maxBufferLength: 60,
            backBufferLength: 90
          });
          this._host._recordingHls = hls;
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
  async showRecording(start, end) {
    const token = ++this._host._playSeq;
    this._host._enter();
    this._host._clearPopupMediaCleanup();
    const { clientId, cam } = this._host._cc();
    const playbackPlan = buildRecordingPlaybackPlan({
      clientId,
      camera: cam,
      start,
      end,
      preferHls: this._host._recordingPreferHls()
    });
    const renderPlan = buildPopupRecordingRenderPlan({
      start,
      end,
      playbackPlan
    });
    const sourceAttemptPlan = buildPopupRecordingSourceAttemptPlan({
      sourceCandidates: renderPlan.sourceCandidates
    });
    const seekListenerPlan = resolvePopupRecordingSeekListenerPlan();
    this._host._popupMediaType = renderPlan.popupMediaType;
    this._host._playing = renderPlan.playing;
    this._host._renderPopupInfo(renderPlan.infoEvent, renderPlan.infoOpts);
    const viewer = this._host.shadowRoot.querySelector("#viewer");
    viewer.innerHTML = '<div class="ld">Loading\u2026</div>';
    if (this._host._playSeq !== token) return;
    const video = this._deps.createVideoElement(
      this._deps.buildVideoOptionsForView(
        "recording",
        {
          muted: true
        },
        { scopeKey: this._host }
      )
    );
    this._deps.mountNodeIntoSlot(viewer, video);
    this._host._attachPopupVideoZoom?.(video);
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
      const seekHandlers = {
        pauseForSeek: onSeeking,
        resumeAfterSeek: onSeeked
      };
      seekListenerPlan.listeners.forEach(({ type, action }) => {
        video.addEventListener(type, seekHandlers[action]);
        mediaCleanup.push(
          () => video.removeEventListener(type, seekHandlers[action])
        );
      });
      for (const attempt of sourceAttemptPlan.attempts) {
        if (this._host._playSeq !== token) return;
        const signed = await this._host._signed(attempt.path);
        if (this._host._playSeq !== token) return;
        playable = await this.tryRecordingSource(video, signed, {
          autoplay: attempt.autoplay
        });
        if (playable) {
          activeSource = signed;
          break;
        }
      }
      if (!playable) {
        const outcomePlan2 = resolvePopupRecordingLoadOutcomePlan({
          playable,
          popupMediaType: renderPlan.popupMediaType
        });
        for (const fn of mediaCleanup) {
          try {
            fn();
          } catch (_) {
          }
        }
        if (outcomePlan2.shouldShowError) {
          viewer.innerHTML = outcomePlan2.errorHtml;
        }
        if (outcomePlan2.shouldTeardownScrub)
          this._host._teardownRecordingScrub();
        this._host._clearPopupVideoZoom?.();
        const scrub = this._host._$("#recording-scrub");
        if (scrub && outcomePlan2.shouldHideScrub) scrub.hidden = true;
        return;
      }
    }
    const outcomePlan = resolvePopupRecordingLoadOutcomePlan({
      playable,
      popupMediaType: renderPlan.popupMediaType
    });
    if (outcomePlan.shouldEnsureAirPlayButton) {
      this._host._ensurePopupAirPlayButton(outcomePlan.airPlayMediaType);
    }
    if (outcomePlan.shouldScheduleRotateOverlay) {
      this._host._scheduleRotateOverlayUpdate();
    }
    if (video && outcomePlan.shouldInitPopupMediaControls) {
      const scrubInitPlan = buildPopupRecordingScrubInitPlan({
        clientId,
        cam,
        start,
        chunkEnd: renderPlan.chunkEnd,
        token,
        sourceUrl: activeSource || video.currentSrc || video.src
      });
      this._host._initPopupMediaControls(video, renderPlan.popupMediaType);
      this._host._initRecordingScrub({
        clientId: scrubInitPlan.clientId,
        cam: scrubInitPlan.cam,
        start: scrubInitPlan.start,
        end: scrubInitPlan.end,
        video,
        token: scrubInitPlan.token,
        sourceUrl: scrubInitPlan.sourceUrl
      });
    }
    if (outcomePlan.shouldRenderCarousel) {
      this._host._renderPopupCarousel(
        outcomePlan.carouselMediaType,
        outcomePlan.carouselActiveId
      );
    }
    if (outcomePlan.shouldShowPopupControls) {
      this._host._showPopupControlsTemporarily();
    }
    this._host._preparePopupPlaybackTarget?.();
    this._host._popupMediaCleanup = () => {
      for (const fn of mediaCleanup) {
        try {
          fn();
        } catch (_) {
        }
      }
    };
  }
};

// src/features/viewport/context.ctrl.js
const ViewportContextController = class {
  constructor(host) {
    this._host = host;
  }
  isCardVisible() {
    if (!this._host.isConnected) return false;
    if (document.visibilityState === "hidden") return false;
    const style = getComputedStyle(this._host);
    if (style.display === "none" || style.visibility === "hidden") {
      return false;
    }
    const rect = this._host.getBoundingClientRect();
    return rect.width > 2 && rect.height > 2;
  }
  isMobilePhoneViewport() {
    const width = Number(this._host._cardWidth || window.innerWidth || 0);
    return width > 0 && width < 420;
  }
  isMobileTabletViewport() {
    const coarse = window.matchMedia?.("(pointer: coarse)")?.matches || window.matchMedia?.("(any-pointer: coarse)")?.matches || false;
    const width = window.innerWidth || 0;
    const height = window.innerHeight || 0;
    const maxEdge = Math.max(width, height);
    const minEdge = Math.min(width, height);
    return coarse && maxEdge <= 1400 && minEdge <= 1100;
  }
  isLandscapeViewport() {
    return window.matchMedia?.("(orientation: landscape)")?.matches || (window.innerWidth || 0) > (window.innerHeight || 0);
  }
};

// src/features/navigation/route-lifecycle.js
function isLeavingPreviewPage(context = {}, previewPageId) {
  return context.previousPageId === previewPageId;
}
function handlePreviewExit(host, leavingPreview) {
  if (!leavingPreview) return;
  host._stopPreviewMode();
  if (host._$("#myPopup")?.classList.contains("is-open")) {
    host._closePopup();
  }
  if (host._mountInProgress === true) {
    host._cancelPendingMount(`page-route-${host._pageId}`);
  }
}
function activateStartupRoute(host, context = {}) {
  if (context.startInGrid === true) {
    host._setViewMode("grid");
    return;
  }
  host._mountEngine();
}
function mountEngineQuietly(host) {
  host._mountEngine(null, { quiet: true });
}
function syncStandardRouteShell(host) {
  if (typeof host?._renderShellPreserveLive === "function") {
    host._renderShellPreserveLive();
  }
  host._syncTabsShell();
  host._renderAll();
}
function activateStandardPageRouteLifecycle({
  host,
  context = {},
  previewPageId,
  applyRouteFrame
} = {}) {
  const leavingPreview = isLeavingPreviewPage(context, previewPageId);
  handlePreviewExit(host, leavingPreview);
  applyRouteFrame?.();
  if (context.startup === true) {
    activateStartupRoute(host, context);
    return;
  }
  if (context.deferCameraSwitch === true) {
    syncStandardRouteShell(host);
    return;
  }
  syncStandardRouteShell(host);
}

// src/features/browse/list.tmpl.js
const STICKY_DAY_TABS = Object.freeze(["alerts", "clips", "snapshot"]);
function resolveBrowseListHeadingLabel({
  tab = "",
  timestamp = null,
  getWeekday,
  getMonthDay,
  capitalize
} = {}) {
  const fallback = {
    recordings: "Recordings",
    clips: "Recent Clips",
    snapshot: "Recent Snaps",
    alerts: "Recent Alerts",
    kept: "Kept"
  }[tab] || capitalize(tab || "");
  if (!timestamp || !STICKY_DAY_TABS.includes(tab)) return fallback;
  return `${getWeekday(timestamp)} - ${getMonthDay(timestamp, {
    ordinal: true
  })} - ${fallback}`;
}
function resolveBrowseRecordingsHeadingLabel({
  timestamp = null,
  windowEnd = null,
  nowSec,
  getWeekday,
  getMonthDay
} = {}) {
  const target = Math.floor(timestamp || windowEnd || nowSec);
  return `${getWeekday(target)} - ${getMonthDay(target, {
    ordinal: true
  })} - Recordings`;
}
function resolveBrowseControlsHeadingLabel({
  cameraName: cameraName4,
  ptzReady = false
} = {}) {
  return `${cameraName4} \xB7 ${ptzReady ? "Frigate PTZ ready" : "PTZ unavailable"}`;
}
function shouldShowBrowseStickyDayHeaders(tab) {
  return STICKY_DAY_TABS.includes(tab);
}
function buildBrowseStickyDaySectionsMarkup({
  items = [],
  getDayKey,
  getLabel,
  renderItem
} = {}) {
  return buildStickyDaySectionsHtml(items, {
    getStartTime: (item) => item?.start_time,
    getDayKey,
    getLabel,
    renderItem
  });
}
function buildBrowseEventsContentMarkup({
  items = [],
  showStickyDayHeaders = false,
  getDayKey,
  getLabel,
  renderItem,
  exhausted = false
} = {}) {
  const content = showStickyDayHeaders ? buildBrowseStickyDaySectionsMarkup({
    items,
    getDayKey,
    getLabel,
    renderItem
  }) : items.map((item) => renderItem(item)).join("");
  return appendEndMarker(content, exhausted);
}
function buildBrowseKeptContentMarkup({
  items = [],
  renderItem
} = {}) {
  return items.map((item) => renderItem(item)).join("");
}
function buildBrowseReviewsContentMarkup({
  items = [],
  getDayKey,
  getLabel,
  renderItem
} = {}) {
  return buildBrowseStickyDaySectionsMarkup({
    items,
    getDayKey,
    getLabel,
    renderItem
  });
}
const opaqueCameraColor = (color) => String(color || "").replace(".5", "1").replace("rgba", "rgb").replace(",1)", ")");
function buildBrowseLegendMarkup({
  labels = [],
  cameras = [],
  eventsMode = "",
  cameraColors = [],
  getLabelColor,
  capitalize,
  getCameraName
} = {}) {
  let html = labels.map(
    (label) => `<span class="lg"><i style="background:${getLabelColor(label)}"></i>${capitalize(label)}</span>`
  ).join("");
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

// src/features/browse/render.ctrl.js
const cameraName = (camera) => cap(camDisplayName(camera));
const BrowseRenderController = class {
  constructor(host) {
    this._host = host;
  }
  listHeadingLabel(timestamp = null) {
    return resolveBrowseListHeadingLabel({
      tab: this._host._tab,
      timestamp,
      getWeekday: (value) => this._host._weekday(value),
      getMonthDay: (value, options) => this._host._monthDay(value, options),
      capitalize: cap
    });
  }
  recordingsHeadingLabel(timestamp = null) {
    return resolveBrowseRecordingsHeadingLabel({
      timestamp,
      windowEnd: this._host._winEnd,
      nowSec: Date.now() / 1e3,
      getWeekday: (value) => this._host._weekday(value),
      getMonthDay: (value, options) => this._host._monthDay(value, options)
    });
  }
  controlsHeadingLabel() {
    const camera = this._host._activeCam || {};
    const ptzInfo = this._host._activeCameraPtzInfo?.() || null;
    const ptzConfigured = hasCameraPtz(camera);
    const ptzReady = ptzConfigured && (hasPtzPanTiltCapability(ptzInfo) || hasPtzZoomCapability(ptzInfo) || hasPtzFocusCapability(ptzInfo));
    return resolveBrowseControlsHeadingLabel({
      cameraName: cameraName(camera),
      ptzReady
    });
  }
  renderListLabel(timestamp = null) {
    const browseHeader = this._host._pageShellRegion("browseHeader");
    const label = this._host._pageShellRegionElement(
      "browseHeader",
      "#browse-head-label"
    );
    const previous = this._host._pageShellRegionElement(
      "browseHeader",
      "#rec-day-prev"
    );
    const next = this._host._pageShellRegionElement(
      "browseHeader",
      "#rec-day-next"
    );
    if (!label || !browseHeader) return;
    browseHeader.style.display = "flex";
    if (this._host._tab === "recordings") {
      label.textContent = this.recordingsHeadingLabel(
        timestamp || this._host._winEnd
      );
      const showButtons = this._host._isMobilePhoneViewport?.() !== true;
      if (previous) previous.style.display = showButtons ? "inline-flex" : "none";
      if (next) next.style.display = showButtons ? "inline-flex" : "none";
      void (this._host._recordingsBrowseNavController?.updateBrowseNav?.() ?? this._host._updateRecordingsBrowseNav?.());
      return;
    }
    if (previous) previous.style.display = "none";
    if (next) next.style.display = "none";
    label.textContent = this._host._tab === "controls" ? this.controlsHeadingLabel() : this.listHeadingLabel(timestamp);
  }
  showStickyDayHeaders() {
    return shouldShowBrowseStickyDayHeaders(this._host._tab);
  }
  renderStickyDaySections(items, renderItem) {
    return buildBrowseStickyDaySectionsMarkup({
      items,
      getDayKey: (timestamp) => this._host._dayKey(timestamp),
      getLabel: (timestamp) => this.listHeadingLabel(timestamp),
      renderItem
    });
  }
  renderEventsContent(items) {
    return buildBrowseEventsContentMarkup({
      items,
      showStickyDayHeaders: this.showStickyDayHeaders(),
      getDayKey: (timestamp) => this._host._dayKey(timestamp),
      getLabel: (timestamp) => this.listHeadingLabel(timestamp),
      renderItem: (item) => this._host._eventCardHTML(item, false),
      exhausted: this._host._exhausted
    });
  }
  renderKeptContent(items) {
    return buildBrowseKeptContentMarkup({
      items,
      renderItem: (item) => this._host._eventCardHTML(item, false)
    });
  }
  renderReviewsContent(items) {
    return buildBrowseReviewsContentMarkup({
      items,
      getDayKey: (timestamp) => this._host._dayKey(timestamp),
      getLabel: (timestamp) => this.listHeadingLabel(timestamp),
      renderItem: (item) => this._host._reviewListItemHTML(item)
    });
  }
  syncBrowseHeadFromScroll() {
    if (!this.showStickyDayHeaders()) return;
    const browse = this._host._pageShellRegion("browse");
    const list = this._host._pageShellRegionElement("browse", "#list");
    const label = this._host._pageShellRegionElement(
      "browseHeader",
      "#browse-head-label"
    );
    if (!list || !browse || !label) return;
    const nextLabel = resolveActiveDayLabelFromScroll({ list, browse });
    if (nextLabel) label.textContent = nextLabel;
  }
  renderLegend() {
    const legend = this._host._pageShellRegionElement(
      "filterPanel",
      "#legend"
    );
    if (!legend) return;
    const labels = this._host._browseFilterController?.labels?.() ?? this._host._labels?.() ?? [];
    legend.innerHTML = buildBrowseLegendMarkup({
      labels,
      cameras: this._host._config.cameras,
      eventsMode: this._host._eventsMode,
      cameraColors: CAM_COLORS,
      getLabelColor: labelColor,
      capitalize: cap,
      getCameraName: cameraName
    });
  }
  renderList() {
    const list = this._host._pageShellRegionElement("browse", "#list");
    if (!list) return;
    if (this._host._tab === "controls") {
      this.syncOlderHint(true);
      return this._host._renderControlsSection(list);
    }
    if (this._host._tab === "recordings") {
      return this._renderRecordingsTabList(list);
    }
    if (this._host._tab === "alerts") {
      this.syncOlderHint(false);
      return this._renderReviews(list);
    }
    if (this._host._tab === "kept") {
      return this._renderKeptList(list);
    }
    return this._renderEventsList(list);
  }
  syncOlderHint(forceHide = null) {
    syncOlderHintFromScroll({
      hintEl: this._host._pageShellRegionElement("footer", "#older-hint"),
      list: this._host._pageShellRegionElement("browse", "#list"),
      browse: this._host._pageShellRegion("browse"),
      tab: this._host._tab,
      forceHide
    });
  }
  setListHtmlIfChanged(list, html) {
    if (!list) return false;
    const nextHtml = String(html || "");
    if (this._host._lastRenderedListHtml === nextHtml) return false;
    list.innerHTML = nextHtml;
    this._host._lastRenderedListHtml = nextHtml;
    return true;
  }
  _renderRecordingsTabList(list) {
    if (this._host._$("#viewer")?.style.display !== "none" && this._host._playing?.rec != null) {
      return;
    }
    this.syncOlderHint(false);
    this._renderRecordings(list);
  }
  _renderKeptList(list) {
    const kept = this._host._browseFilterController.filteredKept();
    this.renderListLabel();
    this._renderStandardListMarkup(list, {
      items: kept,
      emptyMessage: "No kept events",
      emptyHint: "star an event to keep it",
      buildContentHtml: (items) => this.renderKeptContent(items),
      emptyForceHide: false,
      contentForceHide: false,
      syncOnContent: true
    });
  }
  _renderEventsList(list) {
    const events = this._host._browseFilterController.filtered();
    this.renderListLabel(resolveListLabelTimestamp(events));
    this._renderStandardListMarkup(list, {
      items: events,
      emptyMessage: "No events in this window",
      buildContentHtml: (items) => this.renderEventsContent(items),
      emptyForceHide: false,
      contentForceHide: null,
      syncOnContent: false,
      syncBrowseHead: true,
      scheduleDeferredOlderHint: true
    });
  }
  _renderStandardListMarkup(list, {
    items,
    emptyMessage,
    emptyHint = "",
    buildContentHtml,
    emptyForceHide = null,
    contentForceHide = null,
    syncOnContent = true,
    syncBrowseHead = false,
    scheduleDeferredOlderHint = false
  } = {}) {
    const syncOlderHint = createOlderHintSyncer(
      (forceHide) => this.syncOlderHint(forceHide)
    );
    const renderState = resolveListMarkup({
      items,
      emptyMessage,
      emptyHint,
      buildContentHtml
    });
    const hasContent = applyListMarkupWithOlderHint({
      setHtml: (html) => this.setListHtmlIfChanged(list, html),
      html: renderState.html,
      isEmpty: renderState.isEmpty,
      syncOlderHint,
      emptyForceHide,
      contentForceHide,
      syncOnContent
    });
    if (!hasContent || !syncBrowseHead) return;
    runListPostRenderSync({
      syncBrowseHead: () => this.syncBrowseHeadFromScroll(),
      syncOlderHint,
      forceHide: contentForceHide,
      scheduleDeferredOlderHint
    });
  }
  _renderRecordings(list) {
    this.renderListLabel(this._host._winEnd);
    const recordings = this._host._recordingsViewRows(this._host._recordings);
    const syncOlderHint = createOlderHintSyncer(
      (forceHide) => this.syncOlderHint(forceHide)
    );
    const html = this._host._recordingsListMarkup(
      recordings,
      "No recordings in the last 24 hours"
    );
    applyListMarkupWithOlderHint({
      setHtml: (nextHtml) => this.setListHtmlIfChanged(list, nextHtml),
      html,
      isEmpty: !recordings.length,
      syncOlderHint,
      emptyForceHide: true,
      contentForceHide: false,
      syncOnContent: true
    });
  }
  _renderReviews(list) {
    const showAllReviews = this._host._activeCam?.alerts_content === "all_reviews";
    const filteredReviews = this._host._browseFilterController.filteredReviews();
    const emptyText = showAllReviews ? "No reviews in this window" : "No alerts in this window";
    const allReviews = [...filteredReviews].sort(
      (a, b) => b.start_time - a.start_time
    );
    this.renderListLabel(resolveListLabelTimestamp(allReviews));
    this._renderStandardListMarkup(list, {
      items: allReviews,
      emptyMessage: emptyText,
      buildContentHtml: (items) => this.renderReviewsContent(items),
      emptyForceHide: true,
      contentForceHide: false,
      syncOnContent: false,
      scheduleDeferredOlderHint: false,
      syncBrowseHead: true
    });
  }
};

// src/features/mobile-view/page.ctrl.js
const cameraName2 = (camera) => cap(camDisplayName(camera));
const MobileViewPageController = class {
  constructor(host, constants) {
    this._host = host;
    this._constants = constants;
    this._browseRenderController = new BrowseRenderController(host);
  }
  activateMobileViewPageRoute(context = {}) {
    activateStandardPageRouteLifecycle({
      host: this._host,
      context,
      previewPageId: this._constants.PAGE_IDS.preview,
      applyRouteFrame: () => this._applyMobileViewRouteFrame()
    });
  }
  _applyMobileViewRouteFrame() {
    this._host._applyPreviewShellVisibility();
    this._host._wideViewPageController.applyStyleLayoutAndWideSyncForCard();
    this.syncMobileViewPageMarkup();
  }
  camSwitcherMarkup({ includeStatus = true } = {}) {
    const activeEntity = this._host._activeCam?.entity;
    const activeState = activeEntity ? this._host._hass?.states?.[activeEntity] : null;
    return buildMobileViewCamSwitcherMarkup({
      previewPageEnabled: this._host._isPreviewPageEnabled?.() === true,
      includeStatus,
      cameras: this._host._config.cameras,
      activeCamIdx: this._host._activeCamIdx,
      icons: ICONS,
      getCameraName: cameraName2,
      isCameraAvailable: (camera) => this._host._hass?.states?.[camera.entity]?.state !== "unavailable",
      streamType: this._host._activeStreamType || "--",
      online: activeState ? activeState.state !== "unavailable" : true,
      pickerOpen: this._host._mobileCamSwitcherOpen === true
    });
  }
  renderCamSwitcher() {
    const element = this._host._pageShellRegion("cameraSwitcher");
    if (!element) return;
    element.style.display = "";
    element.innerHTML = this.camSwitcherMarkup({ includeStatus: true });
  }
  syncStatus() {
    const state = this._host._hass?.states?.[this._host._activeCam?.entity] || null;
    if (!state) return;
    const statusDot = this._host._pageShellRegionElement(
      "cameraSwitcher",
      "#on-dot"
    );
    const statusLabel = this._host._pageShellRegionElement(
      "cameraSwitcher",
      "#on-lbl"
    );
    const title = this._host._pageShellRegionElement(
      "information",
      "#info-title"
    );
    const online = state.state !== "unavailable";
    if (statusDot) {
      statusDot.style.color = resolveMobileViewStatusColor(online);
    }
    if (statusLabel) {
      statusLabel.textContent = resolveMobileViewOnlineLabel(online);
    }
    if (title) {
      title.textContent = resolveMobileViewTitleText({
        title: this._host._config.title,
        cameras: this._host._config.cameras,
        activeCamera: this._host._activeCam,
        getCameraName: cameraName2
      });
    }
  }
  renderStats() {
    const eventCount = this._host._pageShellRegionElement(
      "information",
      "#ev-count"
    );
    if (eventCount) {
      eventCount.textContent = resolveMobileViewEventsCountText(
        this._host._allDisplayEvents().length
      );
    }
    const streamType = this._host._pageShellRegionElement(
      "cameraSwitcher",
      "#stream-type"
    );
    if (streamType) {
      streamType.textContent = resolveMobileViewStreamTypeText(
        this._host._activeStreamType
      );
    }
  }
  subtitleText() {
    return resolveMobileViewSubtitleText(this._host._config);
  }
  renderSubtitle() {
    const subtitle = this._host._pageShellRegionElement(
      "information",
      "#tl-range"
    );
    if (!subtitle) return;
    subtitle.textContent = this.subtitleText();
  }
  renderLegend() {
    this._browseRenderController.renderLegend();
  }
  listHeadingLabel(ts = null) {
    return this._browseRenderController.listHeadingLabel(ts);
  }
  recordingsHeadingLabel(ts = null) {
    return this._browseRenderController.recordingsHeadingLabel(ts);
  }
  renderListLabel(ts = null) {
    this._browseRenderController.renderListLabel(ts);
  }
  showStickyDayHeaders() {
    return this._browseRenderController.showStickyDayHeaders();
  }
  renderStickyDaySections(items, renderItem) {
    return this._browseRenderController.renderStickyDaySections(
      items,
      renderItem
    );
  }
  renderEventsContent(items) {
    return this._browseRenderController.renderEventsContent(items);
  }
  renderKeptContent(items) {
    return this._browseRenderController.renderKeptContent(items);
  }
  renderReviewsContent(items) {
    return this._browseRenderController.renderReviewsContent(items);
  }
  syncBrowseHeadFromScroll() {
    this._browseRenderController.syncBrowseHeadFromScroll();
  }
  renderList() {
    this._browseRenderController.renderList();
  }
  setListHtmlIfChanged(list, html) {
    return this._browseRenderController.setListHtmlIfChanged(list, html);
  }
  syncOlderHint(forceHide = null) {
    this._browseRenderController.syncOlderHint(forceHide);
  }
  syncMobileViewPageMarkup() {
    applyMobileViewPageMarkup({
      host: this._host,
      pageIds: this._constants.PAGE_IDS
    });
  }
};

// src/features/mobile-view/cam-switcher.ctrl.js
const MobileCamSwitcherController = class {
  constructor(options = {}) {
    this._isOpen = typeof options.isOpen === "function" ? options.isOpen : () => false;
    this._setOpen = typeof options.setOpen === "function" ? options.setOpen : () => {
    };
    this._renderCamSwitcher = typeof options.renderCamSwitcher === "function" ? options.renderCamSwitcher : () => {
    };
    this._pauseSlideshowForInteraction = typeof options.pauseSlideshowForInteraction === "function" ? options.pauseSlideshowForInteraction : () => {
    };
    this._switchCamera = typeof options.switchCamera === "function" ? options.switchCamera : () => Promise.resolve();
  }
  handleClickTarget(target) {
    const trigger = target?.closest?.("[data-mobile-cam-trigger]");
    if (trigger) {
      this._setOpen(!this._isOpen());
      this._renderCamSwitcher();
      return true;
    }
    const option = target?.closest?.("[data-mobile-camidx]");
    if (option) {
      const idx = Number(option.dataset.mobileCamidx);
      this._setOpen(false);
      if (Number.isInteger(idx) && idx >= 0) {
        this._pauseSlideshowForInteraction();
        void this._switchCamera(idx);
      } else {
        this._renderCamSwitcher();
      }
      return true;
    }
    return false;
  }
  closeIfOutside(target) {
    if (!this._isOpen()) return;
    const inPicker = target?.closest?.("[data-mobile-cam-picker]");
    if (inPicker) return;
    this.close();
  }
  close() {
    if (!this._isOpen()) return;
    this._setOpen(false);
    this._renderCamSwitcher();
  }
};

// src/features/single-view/page.ctrl.js
const cameraName3 = (camera) => cap(camDisplayName(camera));
const SingleViewPageController = class {
  constructor(host, constants) {
    this._host = host;
    this._constants = constants;
    this._browseRenderController = new BrowseRenderController(host);
  }
  _pageNavigation() {
    return this._host._pageNavigationController || null;
  }
  camSwitcherMarkup({ includeStatus = true } = {}) {
    return buildSingleViewCamSwitcherMarkup({
      includeStatus,
      cameras: this._host._config.cameras,
      activeCamIdx: this._host._activeCamIdx,
      isSingleView: this._host._viewMode === "single",
      getCameraName: cameraName3,
      isCameraAvailable: (camera) => this._host._hass?.states?.[camera.entity]?.state !== "unavailable"
    });
  }
  renderCamSwitcher() {
    const element = this._host._pageShellRegion("cameraSwitcher");
    if (!element) return;
    if (this._host._config.cameras.length < 2 && this._host._isPreviewPageEnabled?.() !== true) {
      element.style.display = "none";
      return;
    }
    element.style.display = "";
    element.innerHTML = this.camSwitcherMarkup({ includeStatus: true });
  }
  syncStatus() {
    const state = this._host._hass?.states?.[this._host._activeCam?.entity] || null;
    if (!state) return;
    const statusDot = this._host._pageShellRegionElement(
      "information",
      "#on-dot"
    );
    const statusLabel = this._host._pageShellRegionElement(
      "information",
      "#on-lbl"
    );
    const title = this._host._pageShellRegionElement(
      "information",
      "#info-title"
    );
    const online = state.state !== "unavailable";
    if (statusDot) {
      statusDot.style.color = resolveSingleViewStatusColor(online);
    }
    if (statusLabel) {
      statusLabel.textContent = resolveSingleViewOnlineLabel(online);
    }
    if (title) {
      title.textContent = resolveSingleViewTitleText({
        title: this._host._config.title,
        cameras: this._host._config.cameras,
        activeCamera: this._host._activeCam,
        getCameraName: cameraName3
      });
    }
  }
  renderStats() {
    const eventCount = this._host._pageShellRegionElement(
      "information",
      "#ev-count"
    );
    if (eventCount) {
      eventCount.textContent = resolveSingleViewEventsCountText(
        this._host._allDisplayEvents().length
      );
    }
    const streamType = this._host._pageShellRegionElement(
      "information",
      "#stream-type"
    );
    if (streamType) {
      streamType.textContent = resolveSingleViewStreamTypeText(
        this._host._activeStreamType
      );
    }
  }
  subtitleText() {
    return resolveSingleViewSubtitleText(this._host._config);
  }
  renderSubtitle() {
    const subtitle = this._host._pageShellRegionElement(
      "information",
      "#tl-range"
    );
    if (!subtitle) return;
    subtitle.textContent = this.subtitleText();
  }
  renderLegend() {
    this._browseRenderController.renderLegend();
  }
  listHeadingLabel(ts = null) {
    return this._browseRenderController.listHeadingLabel(ts);
  }
  recordingsHeadingLabel(ts = null) {
    return this._browseRenderController.recordingsHeadingLabel(ts);
  }
  renderListLabel(ts = null) {
    this._browseRenderController.renderListLabel(ts);
  }
  showStickyDayHeaders() {
    return this._browseRenderController.showStickyDayHeaders();
  }
  renderStickyDaySections(items, renderItem) {
    return this._browseRenderController.renderStickyDaySections(
      items,
      renderItem
    );
  }
  renderEventsContent(items) {
    return this._browseRenderController.renderEventsContent(items);
  }
  renderKeptContent(items) {
    return this._browseRenderController.renderKeptContent(items);
  }
  renderReviewsContent(items) {
    return this._browseRenderController.renderReviewsContent(items);
  }
  syncBrowseHeadFromScroll() {
    this._browseRenderController.syncBrowseHeadFromScroll();
  }
  renderList() {
    this._browseRenderController.renderList();
  }
  setListHtmlIfChanged(list, html) {
    return this._browseRenderController.setListHtmlIfChanged(list, html);
  }
  syncOlderHint(forceHide = null) {
    this._browseRenderController.syncOlderHint(forceHide);
  }
  activateSingleViewPageRoute(context = {}) {
    this.activateStandardPageRoute(context);
  }
  activateStandardPageRoute(context = {}) {
    activateStandardPageRouteLifecycle({
      host: this._host,
      context,
      previewPageId: this._constants.PAGE_IDS.preview,
      applyRouteFrame: () => this._applyStandardPageRouteFrame()
    });
  }
  _applyStandardPageRouteFrame() {
    this._host._applyPreviewShellVisibility();
    this.applyStyleLayoutForCurrentRoute();
  }
  applyStyleLayoutForCurrentRoute() {
    this._host._wideViewPageController.applyStyleLayoutAndWideSyncForCard();
  }
  _mountEngineQuietly() {
    this._host._mountEngine(null, { quiet: true });
  }
  mountEngineQuietly() {
    this._mountEngineQuietly();
  }
  mountEngineQuietlyAndRenderAll() {
    this._mountEngineQuietly();
    this._host._renderAll();
  }
  applyPostShellRerenderRouteBehavior({
    activePageInvalid = false,
    previewPageActive = false
  } = {}) {
    if (activePageInvalid) {
      this._pageNavigation()?.navigateToConfiguredLandingPage?.({
        source: "config-page-fallback"
      }) ?? this._host._navigateToConfiguredLandingPage?.({
        source: "config-page-fallback"
      });
      return;
    }
    if (previewPageActive) {
      this._host._startPreviewMode();
      return;
    }
    this.mountEngineQuietlyAndRenderAll();
  }
  applyConfigShellRerender({
    activePageInvalid = false,
    previewPageActive = false
  } = {}) {
    this._host._cleanupEngine();
    this._host._renderShell();
    this.applyPostShellRerenderRouteBehavior({
      activePageInvalid,
      previewPageActive
    });
  }
  applyNonPreviewSchemaSoftUpdate() {
    this.applyStyleLayoutForCurrentRoute();
    this._host._syncStatus();
    this._host._renderSubtitle();
    this._host._renderStats();
    this._host._renderCamSwitcher();
    this._host._syncToolbarButtons();
    this._pageNavigation()?.syncPageNavigationButtons?.() ?? this._host._syncPageNavigationButtons?.();
  }
  applyNonPreviewConfigUpdateTail({
    needsEngineRemount = false,
    snapshotUpdateChanged = false,
    realtimePollChanged = false
  } = {}) {
    this.applyNonPreviewSchemaSoftUpdate();
    if (needsEngineRemount) {
      this.mountEngineQuietly();
    }
    if (snapshotUpdateChanged) {
      this._host._syncSnapshotRefreshTimer?.();
    }
    if (realtimePollChanged) {
      this._host._restartRealtimeHeadPollTimer();
    }
  }
  applyNonPreviewHassUpdate({
    cameraStateChanged = false,
    themeChanged = false
  } = {}) {
    if (cameraStateChanged) {
      this._host._syncStatus();
      this._host._kickLiveIfStale();
      if (this._host._viewMode === "grid") {
        this._host._scheduleGridRefresh?.(120);
        this._host._gridAlertController?.scheduleAlertWatch?.(120);
        void this._host._probeLatestGridAlert?.();
      }
    }
    if (themeChanged) {
      this._host._applyCardStyle();
    }
  }
  applyHassUpdateRouteFlow({
    cameraStateChanged = false,
    themeChanged = false,
    previewPageActive = false
  } = {}) {
    if (previewPageActive) {
      if (cameraStateChanged) {
        this._host._renderPreviewPage();
        this._host._previewAlertController?.scheduleAlertWatch?.(120);
        void this._host._previewAlertController?.probeLatestAlert?.();
      }
      if (themeChanged) {
        this._host._applyCardStyle();
      }
      return "preview";
    }
    this.applyNonPreviewHassUpdate({
      cameraStateChanged,
      themeChanged
    });
    return "non-preview";
  }
  applyPreviewConfigUpdateTail({
    previewModeConfigChanged = false,
    realtimePollChanged = false
  } = {}) {
    this._host._wideViewPageController.applyStyleLayoutAndWideSyncForCard();
    this._host._renderPreviewPage();
    if (previewModeConfigChanged || realtimePollChanged) {
      this._host._clearPreviewTimers();
      this._host._previewAlertController.scheduleAlertWatch(300);
    }
  }
  applyEditorPreviewDraftRefresh() {
    this._host._syncTabsShell();
    this._pageNavigation()?.syncPageNavShell?.() ?? this._host._syncPageNavShell?.();
    this._host._renderCamSwitcher();
    this.applyStyleLayoutForCurrentRoute();
    this._host._syncStatus();
    this._host._renderSubtitle();
    this._host._renderStats();
    this._host._renderListLabel();
    this._host._renderList();
    this._pageNavigation()?.syncPageNavigationButtons?.() ?? this._host._syncPageNavigationButtons?.();
  }
  applyConfigUpdateRouteFlow({
    needsEngineRemount = false,
    nextCameraCount = 0,
    needsShellRerender = false,
    activePageInvalid = false,
    previewPageActive = false,
    snapshotUpdateChanged = false,
    realtimePollChanged = false
  } = {}) {
    this.applyCameraSetChange({
      needsEngineRemount,
      nextCameraCount
    });
    if (needsShellRerender) {
      this.applyConfigShellRerender({
        activePageInvalid,
        previewPageActive
      });
      return "handled";
    }
    if (previewPageActive) {
      return "preview";
    }
    this.applyNonPreviewConfigUpdateTail({
      needsEngineRemount,
      snapshotUpdateChanged,
      realtimePollChanged
    });
    return "handled";
  }
  applyCameraSetChange({
    needsEngineRemount = false,
    nextCameraCount = 0
  } = {}) {
    if (!needsEngineRemount) return;
    this._host._cleanupEngine();
    this._host._activeCamIdx = Math.min(
      this._host._activeCamIdx,
      Math.max(0, Number(nextCameraCount) - 1)
    );
  }
};

// src/features/wide-view/page.ctrl.js
const WideViewPageController = class {
  constructor(host, constants) {
    this._host = host;
    this._constants = constants;
  }
  activateWideViewPageRoute(context = {}) {
    activateStandardPageRouteLifecycle({
      host: this._host,
      context,
      previewPageId: this._constants.PAGE_IDS.preview,
      applyRouteFrame: () => this._applyWideViewRouteFrame()
    });
  }
  _applyWideViewRouteFrame() {
    this._host._applyPreviewShellVisibility();
    this.applyStyleLayoutAndWideSyncForCard();
  }
  applyStyleLayoutForCard() {
    this._host._applyCardStyle();
    this.applyLayoutModeForCard();
  }
  applyLayoutAndWideSyncForCard() {
    this.applyLayoutModeForCard();
    this.syncColHeightIfWideView();
  }
  applyStyleLayoutAndWideSyncForCard() {
    this.applyStyleLayoutForCard();
    this.syncColHeightIfWideView();
  }
  applyLayoutModeForCard() {
    const layout = this._host.shadowRoot?.querySelector("#layout");
    if (!layout) return;
    this.applyWideLayoutMode(layout, this._host._config?.col_left_width_pct);
  }
  syncColHeightIfWideView() {
    if (!this.isWideViewPageActive()) return;
    this.syncColHeight();
  }
  syncColHeight() {
    requestAnimationFrame(() => {
      const l = this._host.shadowRoot?.querySelector(".col-left");
      const r = this._host.shadowRoot?.querySelector(".col-right");
      if (!l || !r) return;
      const h = l.offsetHeight;
      if (h > 0) r.style.maxHeight = h + "px";
    });
  }
  isWideViewPageActive() {
    return this._host._pageId === this._constants.PAGE_IDS.wideView;
  }
  wideViewLayoutState(leftWidthPct) {
    if (!this.isWideViewPageActive()) {
      return { isWide: false, leftWidth: "", rightWidth: "" };
    }
    const pct = Math.min(Math.max(parseInt(leftWidthPct, 10) || 50, 10), 90);
    return {
      isWide: true,
      leftWidth: `${pct}%`,
      rightWidth: `${100 - pct}%`
    };
  }
  applyWideLayoutMode(layout, leftWidthPct) {
    if (!layout) return;
    const wideLayout = this.wideViewLayoutState(leftWidthPct);
    layout.classList.toggle("wide-view", wideLayout.isWide);
    const colL = layout.querySelector(".col-left");
    const colR = layout.querySelector(".col-right");
    if (colL && colR) {
      if (wideLayout.isWide) {
        colL.style.width = wideLayout.leftWidth;
        colR.style.width = wideLayout.rightWidth;
      } else {
        colL.style.width = "";
        colR.style.width = "";
      }
    }
  }
  initResizeHandle() {
    const handle = this._host._$("#resize-handle");
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
      const layout = this._host._$("#layout");
      colL = this._host._$(".col-left");
      colR = this._host._$(".col-right");
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
      this.syncColHeight();
    };
    const onMouseUp = () => {
      dragging = false;
      handle.classList.remove("active");
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };
    handle.addEventListener("mousedown", onMouseDown);
  }
};

// src/features/slideshow/utils.js
function isSlideshowReviewFresh({
  slideshowStartedAtSec,
  reviewStartSec,
  graceSec
}) {
  const startedAt = Number(slideshowStartedAtSec || 0);
  if (startedAt <= 0) return true;
  const reviewStart = Number(reviewStartSec || 0);
  if (reviewStart <= 0) return false;
  return reviewStart >= startedAt - Number(graceSec || 0);
}
function rememberHandledSlideshowReview(handledSet, reviewId, maxSize = 200) {
  const id = String(reviewId || "").trim();
  if (!id || !(handledSet instanceof Set)) return;
  handledSet.add(id);
  if (handledSet.size <= Math.max(1, Number(maxSize) || 200)) return;
  const oldest = handledSet.values().next().value;
  if (oldest) handledSet.delete(oldest);
}
function slideshowReviewWatchIntervalMs({
  realtimePollSeconds,
  minMs,
  maxMs
}) {
  const realtimePollMs = Math.floor(Number(realtimePollSeconds || 0) * 1e3);
  const min = Math.max(0, Number(minMs) || 0);
  const max = Math.max(min, Number(maxMs) || min);
  return Math.max(min, Math.min(max, realtimePollMs));
}

// src/features/slideshow/alert.ctrl.js
const SlideshowAlertController = class {
  constructor(host, constants) {
    this._host = host;
    this._constants = constants;
  }
  alertHoldMs() {
    const holdMs = this._host._slideshowAlertHoldMs?.();
    return Math.max(
      1e3,
      Number(holdMs) || Number(this._constants.SLIDESHOW_ALERT_HOLD_MS) || 0
    );
  }
  isReviewFresh(review) {
    return isSlideshowReviewFresh({
      slideshowStartedAtSec: this._host._slideshowStartedAtSec,
      reviewStartSec: this._host._reviewStartTimeSec(review),
      graceSec: this._constants.SLIDESHOW_REVIEW_FRESHNESS_GRACE_SEC
    });
  }
  rememberHandledReview(reviewId) {
    rememberHandledSlideshowReview(
      this._host._slideshowHandledReviewIds,
      reviewId
    );
  }
  handleReviewsUpdated(entity, reviews, source = "reviews-update") {
    if (!this._host._slideshowActive || !this._host._isSlideshowRotationAvailable()) {
      return;
    }
    if (!entity || !Array.isArray(reviews) || !reviews.length) return;
    const nextReview = findFirstReviewCandidateForEntity({
      reviews,
      entity,
      isReviewFresh: (review) => this.isReviewFresh(review),
      normalizeSeverity: (review) => this._host._normalizeReviewSeverity(review),
      shouldHandleSeverity: (targetEntity, severity) => this._host._shouldHandleSlideshowReview(targetEntity, severity),
      isHandledReviewId: (reviewId) => this._host._slideshowHandledReviewIds.has(reviewId),
      reviewStartTime: (review) => this._host._reviewStartTimeSec(review)
    });
    if (!nextReview) return;
    if (nextReview.reviewId) this.rememberHandledReview(nextReview.reviewId);
    if (this._host._slideshowPopupPaused) {
      this._host._slideshowPendingAlertCam = nextReview.entity;
      this._host._slideshowPendingAlertType = nextReview.severity;
      this._host._setSlideshowAlertState(nextReview.severity);
      return;
    }
    const now = Date.now();
    const activeEntity = this._host._activeCam?.entity || "";
    this._host._slideshowLastAlertAt = now;
    this._host._slideshowLastAlertCam = nextReview.entity;
    this._host._slideshowPausedUntil = now + this.alertHoldMs();
    this._host._setSlideshowAlertState(nextReview.severity);
    if (nextReview.entity === activeEntity) {
      this._host._scheduleSlideshowRotation(`${source}-active`);
      return;
    }
    const idx = this._host._cameraIndexByEntity(nextReview.entity);
    if (idx < 0) return;
    this._host._slideshowPendingAlertCam = "";
    this._host._slideshowPendingAlertType = "";
    void this._host._switchCamera(idx, { source: "alert" });
    this._host._scheduleSlideshowRotation(`${source}-switch`);
  }
  async probeLatestReview() {
    if (!this._host._slideshowActive || !this._host._isSlideshowRotationAvailable() || this._host._slideshowReviewProbeInFlight) {
      return;
    }
    this._host._slideshowReviewProbeInFlight = true;
    try {
      const before = Math.floor(Date.now() / 1e3);
      const after = Math.max(
        0,
        Math.floor(
          before - (this._host._config?.alerts_reviews_days || 3) * this._constants.DAY
        )
      );
      const next = await findNewestReviewCandidateAcrossCameras({
        cameras: this._host._config?.cameras,
        getEntity: (camera) => camera?.entity,
        getCache: (entity) => this._host._camCache[entity],
        fetchReviews: async ({ cache }) => this._host._ws({
          type: "frigate/reviews/get",
          instance_id: cache.clientId,
          cameras: [cache.cam],
          after,
          before,
          limit: 5
        }),
        buildCandidate: ({ entity, reviews }) => findFirstReviewCandidateForEntity({
          reviews,
          entity,
          isReviewFresh: (review) => this.isReviewFresh(review),
          normalizeSeverity: (review) => this._host._normalizeReviewSeverity(review),
          shouldHandleSeverity: (targetEntity, severity) => this._host._shouldHandleSlideshowReview(targetEntity, severity),
          isHandledReviewId: (reviewId) => this._host._slideshowHandledReviewIds.has(reviewId),
          reviewStartTime: (review) => this._host._reviewStartTimeSec(review)
        })
      });
      if (!next?.entity) return;
      if (next.reviewId) this.rememberHandledReview(next.reviewId);
      if (this._host._slideshowPopupPaused) {
        this._host._slideshowPendingAlertCam = next.entity;
        this._host._slideshowPendingAlertType = next.severity;
        this._host._setSlideshowAlertState(next.severity);
        return;
      }
      const activeEntity = this._host._activeCam?.entity || "";
      this._host._slideshowLastAlertAt = Date.now();
      this._host._slideshowLastAlertCam = next.entity;
      this._host._slideshowPausedUntil = Date.now() + this.alertHoldMs();
      this._host._setSlideshowAlertState(next.severity);
      if (next.entity === activeEntity) {
        this._host._scheduleSlideshowRotation("probe-active-review");
        return;
      }
      const idx = this._host._cameraIndexByEntity(next.entity);
      if (idx < 0) return;
      this._host._slideshowPendingAlertCam = "";
      this._host._slideshowPendingAlertType = "";
      void this._host._switchCamera(idx, { source: "alert" });
      this._host._scheduleSlideshowRotation("probe-review-switch");
    } finally {
      this._host._slideshowReviewProbeInFlight = false;
    }
  }
  scheduleReviewProbe(delayMs = 180) {
    if (!this._host._slideshowActive || !this._host._isSlideshowRotationAvailable()) {
      return;
    }
    if (this._host._slideshowReviewProbeT) {
      clearTimeout(this._host._slideshowReviewProbeT);
    }
    this._host._slideshowReviewProbeT = setTimeout(
      () => {
        this._host._slideshowReviewProbeT = null;
        void this.probeLatestReview();
      },
      Math.max(0, Number(delayMs) || 0)
    );
  }
  reviewWatchIntervalMs() {
    return slideshowReviewWatchIntervalMs({
      realtimePollSeconds: this._host._effectiveRealtimePollSeconds(),
      minMs: this._constants.SLIDESHOW_REVIEW_WATCH_MIN_MS,
      maxMs: this._constants.SLIDESHOW_REVIEW_WATCH_MAX_MS
    });
  }
  handleHaStatusCandidate(cam, severity = "alert") {
    if (!this._host._slideshowActive || !this._host._isSlideshowRotationAvailable()) {
      return;
    }
    if (!cam) return;
    const normalizedSeverity = String(severity || "").trim().toLowerCase();
    if (!this._host._shouldHandleSlideshowReview(cam, normalizedSeverity)) {
      return;
    }
    if (this._host._slideshowPopupPaused) {
      this._host._slideshowPendingAlertCam = cam;
      this._host._slideshowPendingAlertType = normalizedSeverity || "alert";
      this._host._setSlideshowAlertState(normalizedSeverity || "alert");
      return;
    }
    const now = Date.now();
    const activeEntity = this._host._activeCam?.entity || "";
    this._host._slideshowLastAlertAt = now;
    this._host._slideshowLastAlertCam = cam;
    if (cam === activeEntity) {
      this._host._slideshowPendingAlertCam = "";
      this._host._slideshowPendingAlertType = "";
      this._host._slideshowPausedUntil = now + this.alertHoldMs();
      this._host._setSlideshowAlertState(normalizedSeverity || "alert");
      this._host._scheduleSlideshowRotation("ha-active-alert");
      return;
    }
    const idx = this._host._cameraIndexByEntity(cam);
    if (idx < 0) return;
    this._host._slideshowPausedUntil = now + this.alertHoldMs();
    this._host._slideshowPendingAlertCam = "";
    this._host._slideshowPendingAlertType = "";
    this._host._setSlideshowAlertState(normalizedSeverity || "alert");
    void this._host._switchCamera(idx, { source: "alert" });
    this._host._scheduleSlideshowRotation("ha-alert-switch");
  }
  scheduleReviewWatch(delayMs = null) {
    if (!this._host._slideshowActive || !this._host._isSlideshowRotationAvailable()) {
      return;
    }
    if (this._host._slideshowReviewWatchT) {
      clearTimeout(this._host._slideshowReviewWatchT);
    }
    const wait = delayMs == null ? this.reviewWatchIntervalMs() : Math.max(0, Number(delayMs) || 0);
    this._host._slideshowReviewWatchT = setTimeout(() => {
      this._host._slideshowReviewWatchT = null;
      void this.probeLatestReview().finally(() => {
        this.scheduleReviewWatch();
      });
    }, wait);
  }
  handleRealtimeMessage(msg) {
    if (!this._host._slideshowActive || !this._host._isSlideshowRotationAvailable()) {
      return;
    }
    this.scheduleReviewProbe();
    const parsed = parseRealtimeAlertMessage({ host: this._host, msg });
    if (!parsed) return;
    const { cam, severity } = parsed;
    if (this._host._slideshowPopupPaused) {
      this._host._slideshowPendingAlertCam = cam;
      this._host._slideshowPendingAlertType = severity;
      this._host._setSlideshowAlertState(severity);
      return;
    }
    const now = Date.now();
    const activeEntity = this._host._activeCam?.entity || "";
    this._host._slideshowLastAlertAt = now;
    this._host._slideshowLastAlertCam = cam;
    if (cam === activeEntity) {
      this._host._slideshowPendingAlertCam = "";
      this._host._slideshowPendingAlertType = "";
      this._host._slideshowPausedUntil = now + this.alertHoldMs();
      this._host._setSlideshowAlertState(severity);
      this._host._scheduleSlideshowRotation("active-alert");
      return;
    }
    const idx = this._host._cameraIndexByEntity(cam);
    if (idx < 0) return;
    this._host._slideshowPausedUntil = now + this.alertHoldMs();
    this._host._slideshowPendingAlertCam = "";
    this._host._slideshowPendingAlertType = "";
    this._host._setSlideshowAlertState(severity);
    void this._host._switchCamera(idx, { source: "alert" });
    this._host._scheduleSlideshowRotation("alert-switch");
  }
};

// src/features/slideshow/page.ctrl.js
const SlideshowPageController = class {
  constructor(host) {
    this._host = host;
  }
  clearTimers() {
    if (this._host._slideshowSwitchT)
      clearTimeout(this._host._slideshowSwitchT);
    if (this._host._slideshowPauseT) clearTimeout(this._host._slideshowPauseT);
    if (this._host._slideshowFadeT) clearTimeout(this._host._slideshowFadeT);
    if (this._host._slideshowReviewProbeT) {
      clearTimeout(this._host._slideshowReviewProbeT);
    }
    if (this._host._slideshowReviewWatchT) {
      clearTimeout(this._host._slideshowReviewWatchT);
    }
    this._host._slideshowSwitchT = null;
    this._host._slideshowPauseT = null;
    this._host._slideshowFadeT = null;
    this._host._slideshowReviewProbeT = null;
    this._host._slideshowReviewWatchT = null;
  }
  stopRotation(reason = "manual-stop", sync = true) {
    this.clearTimers();
    this._host._clearSlideshowCountdownOverlay();
    this._host._slideshowActive = false;
    this._host._slideshowPopupPaused = false;
    this._host._slideshowPausedUntil = 0;
    this._host._slideshowPendingAlertCam = "";
    this._host._slideshowPendingAlertType = "";
    this._host._slideshowLastAlertAt = 0;
    this._host._slideshowLastAlertCam = "";
    this._host._slideshowAttentionType = "";
    this._host._slideshowHandledReviewIds.clear();
    this._host._slideshowStartedAtSec = 0;
    this._host._slideshowReviewProbeInFlight = false;
    const engWrap = this._host._$("#eng-wrap");
    if (engWrap) {
      engWrap.classList.remove(
        "slideshow-switching",
        "slideshow-alert",
        "slideshow-detection"
      );
    }
    void reason;
    if (sync) this._host._syncToolbarButtons();
  }
  startRotation(source = "manual") {
    if (!this._host._isSlideshowRotationAvailable()) return false;
    this._host._slideshowActive = true;
    this._host._slideshowPopupPaused = this._host._$("#myPopup")?.classList.contains("is-open") === true;
    this._host._slideshowPausedUntil = 0;
    this._host._slideshowPendingAlertCam = "";
    this._host._slideshowPendingAlertType = "";
    this._host._slideshowAttentionType = "";
    this._host._slideshowHandledReviewIds.clear();
    this._host._slideshowStartedAtSec = Math.floor(Date.now() / 1e3);
    this._host._slideshowAlertController.scheduleReviewWatch(300);
    this.scheduleRotation(source);
    this._host._syncToolbarButtons();
    return true;
  }
  pauseForPopup() {
    if (!this._host._slideshowActive) return;
    this._host._slideshowPopupPaused = true;
    this._host._syncSlideshowCountdownOverlay();
    if (this._host._slideshowSwitchT)
      clearTimeout(this._host._slideshowSwitchT);
    if (this._host._slideshowPauseT) clearTimeout(this._host._slideshowPauseT);
    this._host._slideshowSwitchT = null;
    this._host._slideshowPauseT = null;
  }
  resumeAfterPopup() {
    if (!this._host._slideshowActive) return;
    this._host._slideshowPopupPaused = false;
    this._host._slideshowPausedUntil = Date.now() + this._host._slideshowRotationMs();
    this.scheduleRotation("popup-close");
  }
  toggleRotation() {
    if (this._host._slideshowActive) {
      this.stopRotation("manual-stop");
      return;
    }
    let startedFromGrid = false;
    if (this._host._viewMode === "grid" || this._host._gridResumePending) {
      this._host._gridResumePending = false;
      this._host._stopGridModeState();
      this._host._setViewMode("single");
      startedFromGrid = true;
    }
    const started = this.startRotation("manual-start");
    if (started && startedFromGrid) {
      if (this._host._slideshowSwitchT) {
        clearTimeout(this._host._slideshowSwitchT);
        this._host._slideshowSwitchT = null;
      }
      void this.advanceRotation();
    }
  }
  pauseForInteraction() {
    if (!this._host._slideshowActive || !this._host._isSlideshowRotationAvailable()) {
      return;
    }
    this._host._slideshowPausedUntil = Date.now() + this._host._slideshowRotationMs();
    this._host._setSlideshowCountdown(this._host._slideshowRotationMs());
    if (this._host._slideshowPauseT) clearTimeout(this._host._slideshowPauseT);
    if (this._host._slideshowSwitchT)
      clearTimeout(this._host._slideshowSwitchT);
    this._host._slideshowPauseT = setTimeout(() => {
      this._host._slideshowPauseT = null;
      this.scheduleRotation("pause-expired");
    }, this._host._slideshowRotationMs());
  }
  scheduleRotation(_reason = "") {
    if (!this._host._slideshowActive || !this._host._isSlideshowRotationAvailable()) {
      this._host._clearSlideshowCountdownOverlay();
      return;
    }
    if (this._host._slideshowPopupPaused) {
      this._host._syncSlideshowCountdownOverlay();
      return;
    }
    if (this._host._slideshowSwitchT)
      clearTimeout(this._host._slideshowSwitchT);
    const delay = Math.max(250, this._host._slideshowPausedUntil - Date.now());
    const wait = this._host._slideshowPausedUntil > Date.now() ? delay : this._host._slideshowRotationMs();
    this._host._setSlideshowCountdown(wait);
    this._host._slideshowSwitchT = setTimeout(() => {
      this._host._slideshowSwitchT = null;
      void this.advanceRotation();
    }, wait);
  }
  async advanceRotation() {
    if (!this._host._slideshowActive || !this._host._isSlideshowRotationAvailable()) {
      return;
    }
    if (this._host._slideshowPopupPaused) return;
    const pendingAlertCam = this._host._slideshowPendingAlertCam;
    const pendingAlertType = this._host._slideshowPendingAlertType;
    this._host._slideshowPendingAlertCam = "";
    this._host._slideshowPendingAlertType = "";
    const activeEntity = this._host._activeCam?.entity || "";
    const currentIndex = this._host._cameraIndexByEntity(activeEntity);
    const nextIndex = pendingAlertCam && pendingAlertCam !== activeEntity ? this._host._cameraIndexByEntity(pendingAlertCam) : currentIndex >= 0 ? (currentIndex + 1) % this._host._config.cameras.length : 0;
    const targetIndex = nextIndex >= 0 ? nextIndex : 0;
    const targetEntity = this._host._config?.cameras?.[targetIndex]?.entity || "";
    if (!targetEntity) {
      this.scheduleRotation("missing-target");
      return;
    }
    await this._host._switchCamera(targetIndex, {
      source: pendingAlertCam ? "alert" : "slideshow"
    });
    this._host._slideshowPausedUntil = Date.now() + this._host._slideshowRotationMs();
    this._host._setSlideshowAlertState(pendingAlertCam ? pendingAlertType : "");
    this.scheduleRotation("advance");
  }
};

// src/features/slideshow/routing.js
function normalizeCameraToken2(value) {
  return String(value || "").trim().toLowerCase().replace(/^camera\./, "").replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
}
function valueAtPath(obj, path) {
  let current = obj;
  for (const key of path) {
    if (current == null) return "";
    current = current[key];
  }
  return current;
}
function firstNonEmptyString(values) {
  for (const value of values) {
    const text = String(value || "").trim();
    if (text) return text;
  }
  return "";
}
function slideshowReviewModeForCamera(config, entity) {
  const cam = config?.cameras?.find((camera) => camera.entity === entity);
  return normalizeAlertsAreaContent2(cam?.alerts_content);
}
function shouldHandleSlideshowReview(config, entity, severity) {
  if (severity === "alert") return true;
  return severity === "detection" && slideshowReviewModeForCamera(config, entity) === "all_reviews";
}
function cameraIndexForIncomingCamera(config, camCache, cameraId) {
  const normalized = normalizeCameraToken2(cameraId);
  if (!normalized) return -1;
  return config?.cameras?.findIndex((camera) => {
    const entity = String(camera?.entity || "").toLowerCase();
    const discovered = String(camCache[camera?.entity]?.cam || "");
    const tokens = [
      entity,
      entity.replace(/^camera\./, ""),
      camera?.name || "",
      discovered
    ].map((token) => normalizeCameraToken2(token));
    return tokens.includes(normalized);
  }) ?? -1;
}
function cameraEntityForIncomingCamera(config, camCache, cameraId) {
  const idx = cameraIndexForIncomingCamera(config, camCache, cameraId);
  return idx >= 0 ? config?.cameras?.[idx]?.entity || "" : "";
}
function normalizeReviewSeverity(review) {
  return String(review?.severity || review?.data?.severity || "").trim().toLowerCase();
}
function reviewStartTimeSec(review) {
  const start = Number(review?.start_time || review?.after?.start_time || 0);
  return Number.isFinite(start) ? start : 0;
}
function cameraIndexByEntity(config, entity) {
  if (!entity) return -1;
  return config?.cameras?.findIndex((camera) => camera.entity === entity) ?? -1;
}
function extractRealtimeMessageCamera(msg) {
  return firstNonEmptyString([
    msg?.camera,
    msg?.event?.camera,
    msg?.review?.camera,
    msg?.after?.camera,
    msg?.before?.camera,
    msg?.event?.after?.camera,
    msg?.event?.before?.camera,
    msg?.review?.after?.camera,
    msg?.review?.before?.camera,
    valueAtPath(msg, ["after", "data", "camera"]),
    valueAtPath(msg, ["before", "data", "camera"]),
    valueAtPath(msg, ["event", "data", "camera"]),
    valueAtPath(msg, ["review", "data", "camera"]),
    msg?.payload?.camera,
    msg?.payload?.after?.camera,
    msg?.payload?.before?.camera
  ]);
}
function extractRealtimeMessageSeverity(msg) {
  const type = String(msg?.type || "").trim().toLowerCase();
  return firstNonEmptyString([
    msg?.severity,
    msg?.event?.severity,
    msg?.event?.data?.severity,
    msg?.review?.severity,
    msg?.review?.data?.severity,
    msg?.after?.severity,
    msg?.after?.data?.severity,
    msg?.before?.severity,
    msg?.before?.data?.severity,
    msg?.event?.after?.severity,
    msg?.event?.before?.severity,
    msg?.review?.after?.severity,
    msg?.review?.before?.severity,
    msg?.payload?.severity,
    msg?.payload?.event?.severity,
    msg?.payload?.review?.severity,
    msg?.payload?.after?.severity,
    msg?.payload?.before?.severity,
    type.includes("detection") ? "detection" : ""
  ]).trim().toLowerCase();
}

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
    this._controlsReadoutLines = [];
    this._onCirclePadPress = (event) => {
      void this._handleCirclePadPtzEvent(event, "press");
    };
    this._onCirclePadRelease = (event) => {
      void this._handleCirclePadPtzEvent(event, "release");
    };
    this._onCirclePadToggle = (event) => {
      const entry = resolveControlsPadToggleReadoutEntry(event);
      if (!entry) return;
      this._appendControlsReadoutEntry(entry);
    };
    this._onPtzControlPointerDown = (event) => {
      void this._handlePtzControlPointerDown(event);
    };
    this._onPtzControlPointerStop = (event) => {
      void this._handlePtzControlPointerStop(event);
    };
    this.shadowRoot.addEventListener(
      "circle-pad-press",
      this._onCirclePadPress
    );
    this.shadowRoot.addEventListener(
      "circle-pad-release",
      this._onCirclePadRelease
    );
    this.shadowRoot.addEventListener(
      "circle-pad-toggle",
      this._onCirclePadToggle
    );
    this.shadowRoot.addEventListener(
      "pointerdown",
      this._onPtzControlPointerDown
    );
    this.shadowRoot.addEventListener(
      "pointerup",
      this._onPtzControlPointerStop
    );
    this.shadowRoot.addEventListener(
      "pointercancel",
      this._onPtzControlPointerStop
    );
    this._hass = null;
    this._lastHassCameraStateSignature = "";
    this._lastHassThemeSignature = "";
    this._lastHassReviewStatusSignature = "";
    this._lastHaReviewStatusApplyAt = 0;
    this._config = null;
    this._navigationFactory = null;
    this._pageId = PAGE_IDS.singleView;
    this._lastNonPreviewPageId = PAGE_IDS.singleView;
    this._started = false;
    this._activeCamIdx = 0;
    this._camCache = {};
    this._go2rtcResolver = createGo2RtcResolver({
      getHass: () => this._hass,
      getConfig: () => this._config,
      getActiveEntity: () => this._activeCam?.entity || "",
      getCamCache: () => this._camCache,
      defaultConnectionType: DEFAULT_CAMERA_CONNECTION_TYPE,
      normalizeCameraConnectionType: normalizeCameraConnectionType2,
      createCameraState: mkCamState,
      discoverEntity: async (entity) => {
        await this._discoverOne(entity);
      },
      supportsNativeHlsPlayback: () => this._supportsNativeHlsPlayback()
    });
    this._go2rtcMounter = createGo2RtcMounter({
      resolver: this._go2rtcResolver,
      getStreamMuted: () => this._streamMuted,
      waitForStreamStart: (streamEl, timeoutMs, opts) => this._waitForStreamStart(streamEl, timeoutMs, opts),
      attachVideoFit: (streamEl) => this._attachVideoFit(streamEl),
      assignCommittedEngine: (engine) => this._assignLiveEngine(engine),
      onCommittedStream: (type) => {
        this._setActiveStreamType(type);
        this._setStreamLoading(false);
        this._setStreamFallbackVisible(false);
      },
      scheduleResumeLive: (reason) => this._scheduleResumeLive(reason),
      isFirefox: () => this._isFirefox(),
      scopeKey: this,
      resetMseDiagnostics: (connectedAt) => {
        this._mseConnectAt = connectedAt;
        this._mseLastChunkAt = 0;
        this._mseChunkCount = 0;
      },
      markMseChunk: (chunkAt) => {
        this._mseLastChunkAt = chunkAt;
        this._mseChunkCount += 1;
      }
    });
    this._haDirectMounter = createHaDirectMounter({
      getHass: () => this._hass,
      getPreferredStreamType: () => this._preferredStreamType(),
      getStreamMuted: () => this._streamMuted,
      getRotateOverlayActive: () => this._rotateOverlayActive,
      isCurrentEngine: (streamEl) => this._engine === streamEl,
      waitForStreamStart: (streamEl, timeoutMs, opts) => this._waitForStreamStart(streamEl, timeoutMs, opts),
      attachVideoFit: (streamEl) => this._attachVideoFit(streamEl),
      assignCommittedEngine: (engine) => this._assignLiveEngine(engine),
      applyResolvedStreamUiState: (streamState) => this._applyResolvedStreamUiState(streamState),
      setLiveNativeControls: (enabled) => this._setLiveNativeControls(enabled)
    });
    this._go2rtcRaceMounter = createGo2RtcRaceMounter({
      mounter: this._go2rtcMounter,
      isDesktop: DEVICE_PROFILE.isDesktop,
      resolveConnectionType: (entity) => this._cameraConnectionType(entity),
      disableHlsDesktopForEntity: (entity) => this._cameraDisableHlsDesktop(entity),
      getPendingMountDestroyers: () => this._pendingMountDestroyers || [],
      setPendingMountDestroyers: (pendingDestroyers) => {
        this._pendingMountDestroyers = pendingDestroyers;
      },
      isMountTokenCurrent: (mountToken) => isMountTokenCurrent({ mountToken, mountSeq: this._mountSeq }),
      adoptMountedAttempt: (slot, winner) => adoptMountedAttemptResult({
        targetSlot: slot,
        result: winner,
        streamMuted: this._streamMuted,
        rotateOverlayActive: this._rotateOverlayActive,
        assignEngine: (engine) => this._assignLiveEngine(engine),
        setEngineMountedMuted: (muted) => {
          this._engineMountedMuted = muted;
        },
        setActiveStreamType: (type) => this._setActiveStreamType(type),
        setStreamLoading: (loading) => this._setStreamLoading(loading),
        setStreamFallbackVisible: (visible) => this._setStreamFallbackVisible(visible),
        setLiveNativeControls: (enabled) => this._setLiveNativeControls(enabled)
      }),
      waitForStreamStart: (streamEl, timeoutMs, opts) => this._waitForStreamStart(streamEl, timeoutMs, opts),
      isCurrentWinnerEngine: (engine) => this._engine === engine,
      getPendingWebRtcTakeoverTimer: () => this._pendingWebRTCTakeoverTimer,
      setPendingWebRtcTakeoverTimer: (timer) => {
        this._pendingWebRTCTakeoverTimer = timer;
      }
    });
    this._viewMode = "single";
    this._eventsMode = "camera";
    this._events = [];
    this._recordings = [];
    this._reviews = [];
    this._kept = [];
    this._tab = "alerts";
    this._lastNonControlsTab = "alerts";
    this._mobileCamSwitcherOpen = false;
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
    this._calSelectedDay = null;
    this._engine = null;
    this._unsub = null;
    this._rotateTimer = null;
    this._cardWidth = 0;
    this._playSeq = 0;
    this._streamMuted = true;
    this._activeStreamType = "--";
    this._lastLiveStreamHint = "";
    this._activePtzButtonAction = "";
    this._activePtzButtonPointerId = null;
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
    this._gridRefreshT = null;
    this._snapshotRefreshT = null;
    this._gridResumePending = false;
    this._gridPinnedRotationStart = 0;
    this._gridLastRenderSignature = "";
    this._gridAlertController = new GridAlertController(this, {
      DAY,
      SLIDESHOW_REVIEW_FRESHNESS_GRACE_SEC
    });
    this._gridPageController = new GridPageController(this);
    this._gridMediaController = new GridMediaController(this, {
      buildLabelText: (cam) => cap(camDisplayName(cam)),
      liveIconSvg: ICONS.live
    });
    this._mobileViewPageController = new MobileViewPageController(this, {
      PAGE_IDS
    });
    this._mobileCamSwitcherController = new MobileCamSwitcherController({
      isOpen: () => this._mobileCamSwitcherOpen === true,
      setOpen: (open) => {
        this._mobileCamSwitcherOpen = open === true;
      },
      renderCamSwitcher: () => this._renderCamSwitcher(),
      pauseSlideshowForInteraction: () => this._pauseSlideshowForInteraction(),
      switchCamera: (idx) => this._switchCamera(idx)
    });
    this._singleViewPageController = new SingleViewPageController(this, {
      PAGE_IDS
    });
    this._wideViewPageController = new WideViewPageController(this, {
      PAGE_IDS
    });
    this._pageNavigationController = new PageNavigationController(this, {
      buildPageNavButtonsMarkup,
      buildPageNavMarkup,
      createNavigationFactory,
      getEnabledPageRoutes,
      normalizePageRoute,
      PAGE_IDS,
      ICONS
    });
    this._pageShellRegistry = createPageShellRegistry({
      defaultPageId: PAGE_IDS.singleView
    });
    registerDefaultPageShellProfiles(this._pageShellRegistry, PAGE_IDS);
    this._deepLinkController = new DeepLinkController(this);
    this._slideshowAlertController = new SlideshowAlertController(this, {
      DAY,
      SLIDESHOW_ALERT_HOLD_MS,
      SLIDESHOW_REVIEW_FRESHNESS_GRACE_SEC,
      SLIDESHOW_REVIEW_WATCH_MIN_MS,
      SLIDESHOW_REVIEW_WATCH_MAX_MS
    });
    this._slideshowPageController = new SlideshowPageController(this);
    this._previewPageActive = false;
    this._previewLastRenderSignature = "";
    this._previewMediaState = null;
    this._previewAlertController = new PreviewAlertController(this, {
      DAY,
      PREVIEW_ALERT_HOLD_MS,
      PREVIEW_ALERT_END_GRACE_MS,
      SLIDESHOW_REVIEW_FRESHNESS_GRACE_SEC
    });
    this._previewPageController = new PreviewPageController(this, { PAGE_IDS });
    this._twoWayTalkSession = null;
    this._twoWayTalkStarting = false;
    this._twoWayTalkEntity = "";
    this._browseCalendarActivityController = new BrowseCalendarActivityController(this);
    this._browseCalendarPanelController = new BrowseCalendarPanelController(
      this,
      {
        buildCalendarPanelMarkup
      }
    );
    this._browseCollectionController = new BrowseCollectionController(this);
    this._browseFilterController = new BrowseFilterController(this, {
      buildFilterPanelMarkup
    });
    this._browseTabDataController = new BrowseTabDataController(this);
    this._browseWindowLoaderController = new BrowseWindowLoaderController(this);
    this._cardStyleController = new CardStyleContextController(this);
    this._editorPreviewController = new EditorPreviewContextController(this);
    this._popupMediaLoaderController = new PopupMediaLoaderController(this);
    this._playbackTargetController = new BrowserPlaybackTargetController({
      getContext: (scope) => this._playbackTargetContext(scope),
      resolveSource: (context) => this._resolvePlaybackTargetSource(context),
      getMount: () => this.shadowRoot,
      onStatus: (message) => this._toast(message)
    });
    this._viewportContextController = new ViewportContextController(this);
    this._domCache = {};
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
    this._listScrollController = null;
    this._popupDragController = null;
    this._popupMediaCleanup = null;
    this._popupMediaType = "";
    this._popupMediaStopTimer = null;
    this._popupMediaControlsController = null;
    this._popupControlsHideTimer = null;
    this._liveControlsHideTimer = null;
    this._liveOverlayControlsController = null;
    this._recordingScrubController = null;
    this._recordingScrubState = null;
    this._recordingAlertCache = new Map();
    this._recordingsDayAvailabilityCache = new Map();
    this._recordingsDayDataCache = new Map();
    this._recordingsNavUpdateToken = 0;
    this._recordingsDayNavAnimating = false;
    this._recordingsSwipeGesture = null;
    this._recordingsSwipeBlockTap = false;
    this._recordingsBrowseNavController = new RecordingsBrowseNavController(
      this
    );
    this._recordingsSwipeController = null;
    this._recordingHls = null;
    this._hlsJsCtorPromise = null;
    this._mountSeq = 0;
    this._lastRenderedListHtml = "";
    this._pendingMountDestroyers = [];
    this._pendingWebRTCTakeoverTimer = null;
    this._mseGraceController = createMseGraceController({
      graceMs: MSE_SWITCH_GRACE_MS,
      graceMax: MSE_SWITCH_GRACE_MAX,
      getShadowRoot: () => this.shadowRoot,
      getScopeKey: () => this,
      getPendingMountDestroyers: () => this._pendingMountDestroyers || [],
      setPendingMountDestroyers: (pendingDestroyers) => {
        this._pendingMountDestroyers = pendingDestroyers;
      },
      getPendingWebRtcTakeoverTimer: () => this._pendingWebRTCTakeoverTimer,
      setPendingWebRtcTakeoverTimer: (timer) => {
        this._pendingWebRTCTakeoverTimer = timer;
      },
      clearRotateOverlayAudioSync: () => this._clearRotateOverlayAudioSync(),
      clearRotateVideoFullscreenStyle: () => this._clearRotateVideoFullscreenStyle(),
      getEngine: () => this._engine,
      setEngine: (engine) => this._assignLiveEngine(engine),
      getActiveStreamType: () => this._activeStreamType,
      getStreamMuted: () => this._streamMuted,
      setEngineMountedMuted: (muted) => {
        this._engineMountedMuted = muted;
      },
      getRotateOverlayActive: () => this._rotateOverlayActive,
      attachVideoFit: (streamEl) => this._attachVideoFit(streamEl),
      setActiveStreamType: (type) => this._setActiveStreamType(type),
      setStreamLoading: (loading) => this._setStreamLoading(loading),
      setStreamFallbackVisible: (visible) => this._setStreamFallbackVisible(visible),
      setLiveNativeControls: (enabled) => this._setLiveNativeControls(enabled)
    });
    this._liveMountController = createLiveMountController({
      getSlot: () => this.shadowRoot.querySelector("#engine"),
      isPreviewPageActive: () => this._isPreviewPageActive(),
      getViewMode: () => this._viewMode,
      isGridModeAvailable: () => this._isGridModeAvailable(),
      getMountInProgress: () => this._mountInProgress,
      getMountTargetEntity: () => this._mountTargetEntity,
      getMountState: () => ({
        mountSeq: this._mountSeq,
        mountInProgress: this._mountInProgress,
        mountStartedAt: this._mountStartedAt,
        mountTargetEntity: this._mountTargetEntity
      }),
      applyMountTrackingState: (nextState) => this._applyMountTrackingState(nextState),
      cancelPendingMount: (reason, options) => this._cancelPendingMount(reason, options),
      mountGridEngine: (slot) => this._gridMediaController.mountGridEngine(slot),
      cleanupEngine: () => this._cleanupEngine(),
      getStreamMuted: () => this._streamMuted,
      setEngineMountedMuted: (muted) => {
        this._engineMountedMuted = muted;
      },
      mseGraceController: this._mseGraceController,
      getMountSeq: () => this._mountSeq,
      getPendingMountDestroyers: () => this._pendingMountDestroyers,
      setPendingMountDestroyers: (pendingDestroyers) => {
        this._pendingMountDestroyers = pendingDestroyers;
      },
      haDirectMounter: this._haDirectMounter,
      go2rtcRaceMounter: this._go2rtcRaceMounter,
      preferredStreamType: () => this._preferredStreamType(),
      setActiveStreamType: (type) => this._setActiveStreamType(type),
      setStreamLoading: (loading) => this._setStreamLoading(loading),
      setStreamFallbackVisible: (visible, refreshImage = false) => this._setStreamFallbackVisible(visible, refreshImage),
      scheduleResumeLive: (reason) => this._scheduleResumeLive(reason),
      resolveUseGo2Rtc: (entity) => this._shouldUseGo2RtcForEntity(entity)
    });
    this._wasVisible = false;
    this._resumeLiveT = null;
    this._disconnectTeardownT = null;
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
    this._onViewportChange = () => {
      const vv = window.visualViewport;
      const viewportWidth = Math.round(vv?.width || window.innerWidth || 0);
      const viewportHeight = Math.round(vv?.height || window.innerHeight || 0);
      const viewportSizeChanged = viewportWidth !== this._lastViewportWidth || viewportHeight !== this._lastViewportHeight;
      if (viewportSizeChanged) {
        this._lastViewportWidth = viewportWidth;
        this._lastViewportHeight = viewportHeight;
        this._syncBrowseHeadModeClass();
        this._applyCardStyle();
      }
      this._scheduleRotateOverlayUpdate();
    };
    window.addEventListener("resize", this._onViewportChange, {
      passive: true
    });
    window.addEventListener("orientationchange", this._onViewportChange);
    window.visualViewport?.addEventListener("resize", this._onViewportChange, {
      passive: true
    });
    window.visualViewport?.addEventListener("scroll", this._onViewportChange, {
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
    this._onDocumentPointerDown = (event) => {
      if (!this._mobileCamSwitcherOpen) return;
      const path = typeof event?.composedPath === "function" ? event.composedPath() : [];
      if (Array.isArray(path) && path.includes(this)) return;
      this._mobileCamSwitcherController?.close();
    };
    document.addEventListener("pointerdown", this._onDocumentPointerDown, {
      passive: true
    });
  }
  _cloneCardConfig(config) {
    try {
      return JSON.parse(JSON.stringify(config || {}));
    } catch (_) {
      return { ...config || {} };
    }
  }
  _normalizeVideoFactoryDefaults(value) {
    return value && typeof value === "object" ? value : {};
  }
  _mergeVideoFactoryDefaults(commonDefaults, viewDefaults) {
    const common = this._normalizeVideoFactoryDefaults(commonDefaults);
    const view = this._normalizeVideoFactoryDefaults(viewDefaults);
    const merged = {
      ...common,
      ...view
    };
    if (common.style || view.style) {
      merged.style = {
        ...this._normalizeVideoFactoryDefaults(common.style),
        ...this._normalizeVideoFactoryDefaults(view.style)
      };
    }
    if (common.dataset || view.dataset) {
      merged.dataset = {
        ...this._normalizeVideoFactoryDefaults(common.dataset),
        ...this._normalizeVideoFactoryDefaults(view.dataset)
      };
    }
    if (common.attributes || view.attributes) {
      merged.attributes = {
        ...this._normalizeVideoFactoryDefaults(common.attributes),
        ...this._normalizeVideoFactoryDefaults(view.attributes)
      };
    }
    if (common.classNames || view.classNames) {
      const tokens = [
        ...Array.isArray(common.classNames) ? common.classNames : [],
        ...Array.isArray(view.classNames) ? view.classNames : []
      ].map((token) => String(token || "").trim()).filter(Boolean);
      merged.classNames = [...new Set(tokens)];
    }
    return merged;
  }
  _applyScopedVideoFactoryDefaultsFromConfig(config = this._config) {
    const cfg = config || {};
    const commonDefaults = this._normalizeVideoFactoryDefaults(
      cfg.video_defaults
    );
    const scopeContext = { scopeKey: this };
    setScopedVideoViewDefaultOptions(
      "live",
      this._mergeVideoFactoryDefaults(commonDefaults, cfg.video_live_defaults),
      scopeContext
    );
    setScopedVideoViewDefaultOptions(
      "popup",
      this._mergeVideoFactoryDefaults(commonDefaults, cfg.video_popup_defaults),
      scopeContext
    );
    setScopedVideoViewDefaultOptions(
      "recording",
      this._mergeVideoFactoryDefaults(
        commonDefaults,
        cfg.video_recording_defaults
      ),
      scopeContext
    );
  }
  _applyEditorPreviewDraft(previewConfig) {
    if (!this._isEditorPreviewContext()) return;
    if (!this._committedConfig) return;
    const base = this._cloneCardConfig(this._committedConfig);
    const next = applyEditorPreviewDraftToCardConfig({
      baseConfig: base,
      previewConfig
    });
    this._config = next;
    this._syncVisualStyleToggles();
    this._browseOpen = this._config.browse_expanded;
    this._singleViewPageController.applyEditorPreviewDraftRefresh();
  }
  _ensureEditorPreviewController() {
    if (this._editorPreviewController) return;
    this._editorPreviewController = new EditorPreviewContextController(this);
  }
  connectedCallback() {
    this._ensureEditorPreviewController();
    if (this._disconnectTeardownT) {
      clearTimeout(this._disconnectTeardownT);
      this._disconnectTeardownT = null;
    }
    if (this.parentElement) {
      this._parentOrigStyle = {
        height: this.parentElement.style.height,
        margin: this.parentElement.style.margin,
        padding: this.parentElement.style.padding
      };
      this.parentElement.style.height = this._isPreviewContext() ? "auto" : "100%";
      this._applyTightMargins();
      this._wideViewPageController.applyLayoutAndWideSyncForCard();
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
    return this._cardStyleController.visualStyleToggleRules();
  }
  _cardStateClassNames() {
    return this._cardStyleController.cardStateClassNames();
  }
  _syncVisualStyleToggles() {
    this._cardStyleController.syncVisualStyleToggles();
  }
  _syncHostOuterStyles() {
    this._cardStyleController.syncHostOuterStyles();
  }
  _resolveCardTokenForHost(card, cssProperty, token) {
    return this._cardStyleController.resolveCardTokenForHost(
      card,
      cssProperty,
      token
    );
  }
  _applyTightMargins() {
    this._cardStyleController.applyTightMargins();
  }
  _setSectionsRowGap(tightMarginsEnabled) {
    this._cardStyleController.setSectionsRowGap(tightMarginsEnabled);
  }
  _isPanelView() {
    return this._cardStyleController.isPanelView();
  }
  _hasAncestorInShadow(root, target) {
    return this._cardStyleController.hasAncestorInShadow(root, target);
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
      stream_height: 100,
      stream_height_unit: "%",
      window_days: 1,
      alerts_reviews_days: 1
    };
  }
  setConfig(config) {
    const wasStarted = this._started === true;
    const prevConfig = this._config;
    let cameras;
    if (Array.isArray(config.cameras) && config.cameras.length) {
      cameras = config.cameras.map((camera) => normalizeCameraConfig2(camera)).filter((c) => c.entity);
    } else if (typeof config.cameras === "string" && config.cameras) {
      cameras = [normalizeCameraConfig2(config.cameras)].filter((c) => c.entity);
    } else if (config.cameras && typeof config.cameras === "object") {
      cameras = [normalizeCameraConfig2(config.cameras)].filter((c) => c.entity);
    } else if (config.camera_entity) {
      cameras = [
        normalizeCameraConfig2(
          { camera_entity: config.camera_entity },
          { fallbackName: config.title || null }
        )
      ];
    } else if (config.camera) {
      cameras = [normalizeCameraConfig2(config.camera)].filter((c) => c.entity);
    } else if (config.entity && /^camera\./.test(String(config.entity))) {
      cameras = [
        normalizeCameraConfig2(String(config.entity), {
          fallbackName: config.title || null
        })
      ];
    } else if (Array.isArray(config.entities) && config.entities.length) {
      cameras = config.entities.map((e) => typeof e === "string" ? e : e?.entity).filter((e) => typeof e === "string" && /^camera\./.test(e)).map((e) => normalizeCameraConfig2(e));
    } else if (prevConfig?.cameras?.length) {
      cameras = prevConfig.cameras.map((camera) => normalizeCameraConfig2(camera)).filter((c) => c.entity);
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
      window_days: normalizePositiveInteger3(config.window_days, null) || (Number.isFinite(legacyWindowHours) && legacyWindowHours > 0 ? Math.max(1, Math.ceil(legacyWindowHours / 24)) : 3),
      alerts_reviews_days: normalizePositiveInteger3(
        config.alerts_reviews_days,
        normalizePositiveInteger3(config.window_days, 3)
      ),
      refresh_seconds: Math.max(15, config.refresh_seconds || 45),
      realtime_poll_seconds: REALTIME_POLL_OPTIONS_SECONDS.includes(
        Number(config.realtime_poll_seconds)
      ) ? Number(config.realtime_poll_seconds) : 5,
      snapshot_update_seconds: normalizeBoundedPositiveInteger(
        config.snapshot_update_seconds,
        SNAPSHOT_UPDATE_SECONDS,
        10,
        240
      ),
      mobile_poll_battery_saver: config.mobile_poll_battery_saver === true,
      slideshow_rotation_enabled: config.slideshow_rotation_enabled === true,
      slideshow_rotation_seconds: SLIDESHOW_ROTATION_OPTIONS_SECONDS.includes(
        Number(config.slideshow_rotation_seconds)
      ) ? Number(config.slideshow_rotation_seconds) : 30,
      grid_mode_enabled: config.grid_mode_enabled === true,
      grid_start_in_grid_enabled: config.grid_start_in_grid_enabled === true,
      grid_live_view_enabled: config.grid_live_view_enabled !== false,
      mobile_view_page_enabled: config.mobile_view_page_enabled === true,
      preview_page_enabled: config.preview_page_enabled === true,
      preview_page_live_cameras: config.preview_page_live_cameras === true,
      preview_page_show_title_bars: config.preview_page_show_title_bars !== false,
      wide_view_page_enabled: config.wide_view_page_enabled === true || config.wide_view === true,
      landing_page: normalizePageRoute(config.landing_page),
      mobile_page: normalizePageRoute(config.mobile_page),
      deep_link_enabled: config.deep_link_enabled !== false,
      grid_rotation_seconds: GRID_ROTATION_OPTIONS_SECONDS.includes(
        Number(config.grid_rotation_seconds)
      ) ? Number(config.grid_rotation_seconds) : 30,
      browse_expanded: config.browse_expanded === true,
      hidden_tabs: Array.isArray(config.hidden_tabs) ? config.hidden_tabs.map((id) => id === "reviews" ? "alerts" : id).filter((id) => ALLOWED_HIDDEN_TABS.includes(id)) : [],
      theme: config.theme === "custom" ? "custom" : "default",
      theme_custom: config.theme_custom && typeof config.theme_custom === "object" ? Object.fromEntries(
        Object.entries(config.theme_custom).filter(([key]) => THEME_CUSTOM_KEYS.has(key)).map(([key, value]) => [key, normalizeHexColor2(value)]).filter(([, value]) => !!value)
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
      col_left_width_pct: Number(config.col_left_width_pct) || 50,
      video_defaults: this._normalizeVideoFactoryDefaults(
        config.video_defaults
      ),
      video_live_defaults: this._normalizeVideoFactoryDefaults(
        config.video_live_defaults
      ),
      video_popup_defaults: this._normalizeVideoFactoryDefaults(
        config.video_popup_defaults
      ),
      video_recording_defaults: this._normalizeVideoFactoryDefaults(
        config.video_recording_defaults
      )
    };
    const previewEnabledChanged = !!prevConfig && prevConfig.preview_page_enabled !== nextConfig.preview_page_enabled;
    const mobileViewPageEnabledChanged = !!prevConfig && prevConfig.mobile_view_page_enabled !== nextConfig.mobile_view_page_enabled;
    const wideViewPageEnabledChanged = !!prevConfig && prevConfig.wide_view_page_enabled !== nextConfig.wide_view_page_enabled;
    const previewVisualChanged = !!prevConfig && (prevConfig.preview_page_live_cameras !== nextConfig.preview_page_live_cameras || prevConfig.preview_page_show_title_bars !== nextConfig.preview_page_show_title_bars);
    const previewModeConfigChanged = previewEnabledChanged || previewVisualChanged;
    this._committedConfig = this._cloneCardConfig(nextConfig);
    this._config = nextConfig;
    this._applyScopedVideoFactoryDefaultsFromConfig(nextConfig);
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
    const needsShellRerender = hiddenTabsChanged || previewEnabledChanged || mobileViewPageEnabledChanged || wideViewPageEnabledChanged;
    const needsEngineRemount = camerasChanged;
    const snapshotUpdateChanged = prevConfig.snapshot_update_seconds !== nextConfig.snapshot_update_seconds;
    const realtimePollChanged = prevConfig.realtime_poll_seconds !== nextConfig.realtime_poll_seconds || prevConfig.mobile_poll_battery_saver !== nextConfig.mobile_poll_battery_saver;
    const activePageInvalid = !this._pageNavigationController.isPageRouteAvailable(this._pageId);
    const routeFlowOutcome = this._singleViewPageController.applyConfigUpdateRouteFlow({
      needsEngineRemount,
      nextCameraCount: nextCams.length,
      needsShellRerender,
      activePageInvalid,
      previewPageActive: this._isPreviewPageActive(),
      snapshotUpdateChanged,
      realtimePollChanged
    });
    if (routeFlowOutcome === "preview") {
      this._singleViewPageController.applyPreviewConfigUpdateTail({
        previewModeConfigChanged,
        realtimePollChanged
      });
      this._syncToolbarButtons();
      return;
    }
    if (routeFlowOutcome === "handled") {
      this._syncToolbarButtons();
      return;
    }
  }
  set hass(hass) {
    this._ensureEditorPreviewController();
    this._hass = hass;
    if (!this._config) return;
    const nowMs = Date.now();
    const cameraStateSignature = hassEntityStateSignature(
      hass,
      configuredCameraEntities(this._config)
    );
    const themeSignature = hassThemeSignature(hass);
    const reviewStatusSignature = haReviewStatusSignature({
      hass,
      cameras: this._config?.cameras,
      resolveDiscoveredCameraName: (entity) => this._camCache?.[entity]?.cam
    });
    const cameraStateChanged = cameraStateSignature !== this._lastHassCameraStateSignature;
    const themeChanged = themeSignature !== this._lastHassThemeSignature;
    const reviewStatusChanged = reviewStatusSignature !== this._lastHassReviewStatusSignature;
    const reviewStatusPollIntervalMs = Math.max(
      250,
      Math.floor(this._effectiveRealtimePollSeconds() * 1e3)
    );
    const reviewStatusPollDue = nowMs - Number(this._lastHaReviewStatusApplyAt || 0) >= reviewStatusPollIntervalMs;
    const shouldApplyHaReviewStatus = reviewStatusChanged || reviewStatusPollDue;
    this._lastHassCameraStateSignature = cameraStateSignature;
    this._lastHassThemeSignature = themeSignature;
    this._lastHassReviewStatusSignature = reviewStatusSignature;
    if (!this._started) {
      this._started = true;
      this._start();
      return;
    }
    this._editorPreviewController.syncHassPreviewContext();
    let haReviewAlertActive = false;
    if (shouldApplyHaReviewStatus) {
      this._lastHaReviewStatusApplyAt = nowMs;
      haReviewAlertActive = this._applyHaReviewStatusAlerts();
    }
    if (!cameraStateChanged && !themeChanged && !reviewStatusChanged && !haReviewAlertActive)
      return;
    this._singleViewPageController.applyHassUpdateRouteFlow({
      cameraStateChanged: cameraStateChanged || reviewStatusChanged || haReviewAlertActive,
      themeChanged,
      previewPageActive: this._isPreviewPageActive()
    });
  }
  get _activeCam() {
    return this._config?.cameras[this._activeCamIdx] || this._config?.cameras[0];
  }
  getCardSize() {
    if (this._isPreviewContext() || this._config?.compact_preview === true) {
      return 3;
    }
    return 12;
  }
  getGridOptions() {
    return {
      columns: 12,
      rows: 12,
      min_rows: 6,
      min_columns: 6
    };
  }
  disconnectedCallback() {
    if (this._disconnectTeardownT) clearTimeout(this._disconnectTeardownT);
    this._disconnectTeardownT = setTimeout(() => {
      this._disconnectTeardownT = null;
      if (this.isConnected) return;
      this._teardownDisconnected();
    }, 2500);
  }
  _teardownDisconnected() {
    void this._stopTwoWayTalkSession();
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
    if (this._editorPreviewController) {
      try {
        this._editorPreviewController.dispose();
      } catch (_) {
      }
    }
    if (this._liveControlsHideTimer) clearTimeout(this._liveControlsHideTimer);
    if (this._liveOverlayControlsController) {
      try {
        this._liveOverlayControlsController.dispose();
      } catch (_) {
      }
      this._liveOverlayControlsController = null;
    }
    if (this._playbackTargetController) {
      try {
        this._playbackTargetController.dispose();
      } catch (_) {
      }
    }
    if (this._listScrollController) {
      try {
        this._listScrollController.dispose();
      } catch (_) {
      }
      this._listScrollController = null;
    }
    if (this._recordingsSwipeController) {
      this._recordingsSwipeController.dispose();
      this._recordingsSwipeController = null;
    }
    this._clearPopupMediaCleanup();
    if (this._onDocVisibility) {
      document.removeEventListener("visibilitychange", this._onDocVisibility);
    }
    if (this._onShadowError) {
      this.shadowRoot.removeEventListener("error", this._onShadowError, true);
    }
    if (this._popupDragController) {
      this._popupDragController.dispose();
      this._popupDragController = null;
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
    if (this._onViewportChange) {
      window.removeEventListener("resize", this._onViewportChange);
      window.removeEventListener("orientationchange", this._onViewportChange);
      window.visualViewport?.removeEventListener(
        "resize",
        this._onViewportChange
      );
      window.visualViewport?.removeEventListener(
        "scroll",
        this._onViewportChange
      );
    }
    if (this._onEditorPreviewDraft) {
      window.removeEventListener(
        "frigate-view-card-preview-draft",
        this._onEditorPreviewDraft
      );
    }
    if (this._onDocumentPointerDown) {
      document.removeEventListener("pointerdown", this._onDocumentPointerDown);
    }
    if (this._rotateOverlayRaf) cancelAnimationFrame(this._rotateOverlayRaf);
    this._rotateOverlayRaf = 0;
    if (this._rotateOverlayExitT) clearTimeout(this._rotateOverlayExitT);
    this._rotateOverlayExitT = null;
    this.classList?.remove?.(MOBILE_VIEW_ROTATE_COVER_CLASS);
    this._clearRotateOverlayAudioSync();
    this._clearRotateVideoFullscreenStyle();
    this._mseGraceController.clearGracePool();
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
    const deepLinkHandlingEnabled = this._deepLinkController.isDeepLinkHandlingEnabled();
    if (deepLinkHandlingEnabled) {
      this._deepLinkController.initDeepLinkFromUrl();
    }
    this._pageNavigationController.prepareConfiguredLandingPageShell({
      hasPendingDeepLinkTarget: this._deepLinkController.hasPendingDeepLinkTarget()
    });
    await this._discoverAll();
    if (deepLinkHandlingEnabled) {
      this._deepLinkController.applyDeepLinkCameraHint();
    }
    const now = Math.floor(Date.now() / 1e3);
    this._followNowWindow = true;
    this._winEnd = now;
    this._winStart = now - this._config.window_days * DAY;
    const initialLoad = this._browseWindowLoaderController.loadWindow(true);
    this._browseWindowLoaderController.scheduleWarmOtherCamerasEvents();
    const startInGrid = this._shouldStartInGridMode();
    this._pageNavigationController.navigateToConfiguredLandingPage({
      source: "startup",
      startup: true,
      startInGrid,
      hasPendingDeepLinkTarget: this._deepLinkController.hasPendingDeepLinkTarget()
    });
    await initialLoad;
    void this._prefetchCalendarActivityForActiveCamera();
    this._subscribe();
    this._startEditModeWatchdog();
    this._startEditorDialogCloseObserver();
    this._deepLinkController.consumeDeepLinkReviewOpen();
    this._deepLinkController.consumeDeepLinkEventOpen();
    this._refresh = setInterval(() => {
      if (this._isNowWindow()) {
        this._browseWindowLoaderController.loadWindow(true);
      }
    }, this._config.refresh_seconds * 1e3);
    this._restartRealtimeHeadPollTimer();
    this._setupResizeObserver();
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
    this._editorPreviewController.startEditModeWatchdog();
  }
  _isDashboardEditMode() {
    return this._editorPreviewController.isDashboardEditMode();
  }
  _isCardEditorDialogOpen() {
    return this._editorPreviewController.isCardEditorDialogOpen();
  }
  _startEditorDialogCloseObserver() {
    this._editorPreviewController.startEditorDialogCloseObserver();
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
    return supportsNativeHlsPlayback();
  }
  _useHaDirectStreamPath() {
    const entity = this._activeCam?.entity;
    return !!entity && !this._shouldUseGo2RtcForEntity(entity);
  }
  _cameraConnectionType(entity) {
    return resolveCameraConnectionType({
      config: this._config,
      entity,
      defaultConnectionType: DEFAULT_CAMERA_CONNECTION_TYPE,
      normalizeCameraConnectionType: normalizeCameraConnectionType2
    });
  }
  _shouldUseGo2RtcForEntity(entity) {
    const key = entity || this._activeCam?.entity || "";
    if (!key) return true;
    return this._cameraConnectionType(key) !== "ha_direct";
  }
  _resolveGo2RtcEntity(entity = "") {
    const targetEntity = resolveGo2RtcEntity({
      entity,
      activeEntity: this._activeCam?.entity || "",
      config: this._config,
      defaultConnectionType: DEFAULT_CAMERA_CONNECTION_TYPE,
      normalizeCameraConnectionType: normalizeCameraConnectionType2
    });
    return this._shouldUseGo2RtcForEntity(targetEntity) ? targetEntity : "";
  }
  _cameraDisableHlsDesktop(entity) {
    return resolveCameraDisableHlsDesktop({
      config: this._config,
      entity,
      normalizeDisableHlsDesktop: normalizeDisableHlsDesktop2
    });
  }
  _isEditorPreviewContext() {
    return this._editorPreviewController.isEditorPreviewContext();
  }
  _isCardPickerPreviewContext() {
    return this._editorPreviewController.isCardPickerPreviewContext();
  }
  _isPreviewContext() {
    return this._editorPreviewController.isPreviewContext();
  }
  _preferredStreamType() {
    if (DEVICE_PROFILE.isIOS) return "webrtc";
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
  _assignLiveEngine(engine) {
    if (this._engine === engine) {
      if (engine) this._attachMainLiveVideoZoom(engine);
      return;
    }
    this._clearLiveVideoZoom();
    this._engine = engine;
    if (engine) this._attachMainLiveVideoZoom(engine);
  }
  _attachMainLiveVideoZoom(engine, retries = 12) {
    if (!engine || this._engine !== engine) return;
    const video = engine.video || this._findFullscreenVideo(engine) || this._findVideoDeep(engine);
    if (video) {
      if (this._liveVideoZoomController?.video === video) {
        this._liveVideoZoomController.refresh();
        return;
      }
      this._clearLiveVideoZoom();
      this._liveVideoZoomController = attachVideoZoom(video);
      return;
    }
    if (retries <= 0) return;
    setTimeout(() => {
      if (this._engine !== engine) return;
      this._attachMainLiveVideoZoom(engine, retries - 1);
    }, 160);
  }
  _clearLiveVideoZoom() {
    this._liveVideoZoomController?.dispose?.();
    this._liveVideoZoomController = null;
  }
  _attachPopupVideoZoom(video) {
    if (this._popupVideoZoomController?.video === video) {
      this._popupVideoZoomController.refresh();
      return;
    }
    this._clearPopupVideoZoom?.();
    this._popupVideoZoomController = attachVideoZoom(video);
  }
  _clearPopupVideoZoom() {
    this._popupVideoZoomController?.dispose?.();
    this._popupVideoZoomController = null;
  }
  _cleanupEngine() {
    return this._mseGraceController.cleanupEngine();
  }
  _cancelPendingMount(reason = "", options = {}) {
    this._applyMountTrackingState(
      invalidateMountTrackingIfActive({
        mountSeq: this._mountSeq,
        mountInProgress: this._mountInProgress,
        mountStartedAt: this._mountStartedAt,
        mountTargetEntity: this._mountTargetEntity
      })
    );
    this._mseGraceController.cleanupEngine(options);
  }
  _applyMountTrackingState(nextState) {
    this._mountSeq = nextState.mountSeq;
    this._mountInProgress = nextState.mountInProgress;
    this._mountStartedAt = nextState.mountStartedAt;
    this._mountTargetEntity = nextState.mountTargetEntity;
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
      const hostSizeStable = cw > 8 && ch > 8;
      videoEl.style.display = "block";
      videoEl.style.width = "100%";
      videoEl.style.height = "100%";
      videoEl.style.objectPosition = "center center";
      videoEl.style.objectFit = hostSizeStable && near169 && nearPanel ? "cover" : "contain";
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
    applyStreamLoadingStateForCard({
      card: this,
      loading,
      text
    });
  }
  _setActiveStreamType(type) {
    applyActiveStreamTypeForCard({
      card: this,
      type
    });
    this._syncTwoWayTalkRuntimeState();
    this._syncTwoWayTalkButton();
  }
  _setStreamFallbackVisible(visible, refreshImage = false) {
    applyStreamFallbackVisibilityForCard({
      card: this,
      visible,
      refreshImage
    });
  }
  _fallbackOriginForAdapters() {
    this._fallbackOrigin = window.location.origin;
    return this._fallbackOrigin;
  }
  async _streamFallbackUrl(entity) {
    return await loadFallbackPrimaryForCard({
      card: this,
      entity,
      origin: this._fallbackOriginForAdapters()
    });
  }
  _streamFallbackAltUrl(entity) {
    return loadFallbackAltForCard({
      card: this,
      entity,
      origin: this._fallbackOriginForAdapters()
    });
  }
  async _refreshStreamFallbackImage() {
    await runFallbackRefreshCycleForCard({
      card: this,
      applyHandlers: applyFallbackImageHandlers,
      applySource: setFallbackImageSourceIfChanged
    });
  }
  _cameraContext(entity) {
    return this._camCache[entity] || mkCamState();
  }
  _applyResolvedStreamUiState(streamState) {
    if (!streamState) return;
    this._setStreamLoading(streamState.loading);
    this._setStreamFallbackVisible(
      streamState.fallbackVisible,
      streamState.refreshFallbackImage
    );
    if (streamState.enableNativeControls) {
      this._setLiveNativeControls(true);
    }
  }
  _applyRotateOverlayUiPlan(card, uiPlan) {
    if (!card || !uiPlan) return;
    if (uiPlan.removeClasses.length) {
      card.classList.remove(...uiPlan.removeClasses);
    }
    if (uiPlan.addClasses.length) {
      card.classList.add(...uiPlan.addClasses);
    }
    this.classList.toggle(
      MOBILE_VIEW_ROTATE_COVER_CLASS,
      card.classList.contains(MOBILE_VIEW_ACTIVE_CLASS) && uiPlan.retainViewportCover
    );
    this._rotateOverlayActive = uiPlan.active;
    this._rotateOverlayMode = uiPlan.mode;
    if (uiPlan.disableNativeControls) this._setLiveNativeControls(false);
    if (uiPlan.clearLiveControlsVisible) {
      this._$("#live-stage")?.classList.remove("live-controls-visible");
    }
    if (uiPlan.clearLoading) this._setStreamLoading(false);
    if (uiPlan.enableNativeControls) this._setLiveNativeControls(true);
    if (uiPlan.syncFullscreenButtons) this._syncFullscreenButtonsVisibility();
    if (uiPlan.showLiveControls) this._showLiveControlsTemporarily();
    if (uiPlan.showPopupControls) this._showPopupControlsTemporarily();
  }
  async _mountEngine(forcedType = null, options = {}) {
    return this._liveMountController.mount({
      forcedType,
      quiet: options?.quiet === true,
      entity: this._activeCam?.entity || ""
    });
  }
  _isPreviewPageEnabled() {
    return this._previewPageController.isPreviewPageEnabled();
  }
  _isPreviewPageActive() {
    return this._previewPageController.isPreviewPageActive();
  }
  _deviceRouteBucket() {
    return resolveDeviceRouteBucket(DEVICE_PROFILE);
  }
  _activateSingleViewPageRoute(context = {}) {
    this._singleViewPageController.activateSingleViewPageRoute(context);
  }
  _activateMobileViewPageRoute(context = {}) {
    void this._stopTwoWayTalkSession();
    this._mobileViewPageController.activateMobileViewPageRoute(context);
  }
  _isMobileViewPageActive() {
    return normalizePageRoute(this._pageId) === PAGE_IDS.mobileView;
  }
  _activeStandardPageController() {
    return this._isMobileViewPageActive() ? this._mobileViewPageController : this._singleViewPageController;
  }
  _syncMobileViewPageMarkup() {
    this._mobileViewPageController.syncMobileViewPageMarkup();
  }
  registerPageShellLayout(pageId, layoutProfile = {}) {
    this._pageShellRegistry?.register(pageId, layoutProfile);
  }
  _activePageShellLayoutProfile() {
    return this._pageShellRegistry?.resolve(this._pageId) || {};
  }
  _activePageShellCapabilities() {
    return resolvePageCapabilities(this._activePageShellLayoutProfile());
  }
  _activateWideViewPageRoute(context = {}) {
    this._wideViewPageController.activateWideViewPageRoute(context);
  }
  _activatePreviewPageRoute(context = {}) {
    void this._stopTwoWayTalkSession();
    this._previewPageController.activatePreviewPageRoute(context);
  }
  _applyPreviewShellVisibility() {
    if (this._isPreviewPageEnabled() && this._isPreviewPageActive()) {
      this._ensurePreviewLayoutShell();
    } else {
      this._removePreviewLayoutShell();
    }
    this._previewPageController.applyPreviewShellVisibility();
  }
  _buildPreviewLayoutShellMarkup() {
    return this._previewPageController.buildPreviewLayoutShellMarkup();
  }
  _ensurePreviewLayoutShell() {
    return this._previewPageController.ensurePreviewLayoutShell();
  }
  _removePreviewLayoutShell() {
    this._previewPageController.removePreviewLayoutShell();
  }
  _clearPreviewTimers() {
    this._previewAlertController.clearTimers();
    this._clearSnapshotRefreshTimer();
  }
  _clearSnapshotRefreshTimer() {
    if (this._snapshotRefreshT) clearTimeout(this._snapshotRefreshT);
    this._snapshotRefreshT = null;
  }
  _snapshotUpdateMs() {
    const seconds = Number(this._config?.snapshot_update_seconds);
    const resolved = Number.isFinite(seconds) && seconds > 0 ? seconds : SNAPSHOT_UPDATE_SECONDS;
    return Math.max(1e4, Math.min(24e4, Math.round(resolved * 1e3)));
  }
  _syncSnapshotRefreshTimer() {
    this._clearSnapshotRefreshTimer();
    const shouldRefreshPreview = this._isPreviewPageActive() && this._config?.preview_page_live_cameras !== true;
    const shouldRefreshGrid = this._viewMode === "grid" && this._config?.grid_live_view_enabled === false;
    if (!shouldRefreshPreview && !shouldRefreshGrid) return;
    this._snapshotRefreshT = setTimeout(() => {
      this._snapshotRefreshT = null;
      if (this._isPreviewPageActive() && this._config?.preview_page_live_cameras !== true) {
        void this._refreshSnapshotMedia().finally(() => {
          this._syncSnapshotRefreshTimer();
        });
        return;
      }
      if (this._viewMode === "grid" && this._config?.grid_live_view_enabled === false) {
        void this._refreshSnapshotMedia().finally(() => {
          this._syncSnapshotRefreshTimer();
        });
      }
    }, this._snapshotUpdateMs());
  }
  _isPreviewCameraAlertLive(entity) {
    return this._previewAlertController.isCameraAlertLive(entity);
  }
  _teardownPreviewMedia() {
    this._previewPageController.teardownPreviewMedia();
  }
  _renderPreviewPage() {
    this._previewPageController.renderPreviewPage();
    this._syncSnapshotRefreshTimer();
  }
  _refreshSnapshotMedia() {
    return this._gridMediaController.refreshSnapshotMedia();
  }
  _updatePreviewMeta() {
    this._previewPageController.updatePreviewMeta();
  }
  _mountPreviewMedia() {
    this._previewPageController.mountPreviewMedia();
  }
  _startPreviewMode() {
    this._previewPageController.startPreviewMode();
  }
  _stopPreviewMode() {
    this._previewPageController.stopPreviewMode();
  }
  _exitPreviewPageToCamera(idx) {
    this._previewPageController.exitPreviewPageToCamera(idx);
  }
  _returnToPreviewPage() {
    this._previewPageController.returnToPreviewPage();
  }
  // ── view mode ─────────────────────────────────────────────
  _isGridModeAvailable() {
    return this._gridPageController.isGridModeAvailable();
  }
  _gridRotationMs() {
    return this._gridPageController.gridRotationMs();
  }
  _clearGridTimers() {
    this._gridPageController.clearGridTimers();
    this._clearSnapshotRefreshTimer();
  }
  _clearGridAlertTracking() {
    this._gridPageController.clearGridAlertTracking();
  }
  _scheduleGridRefresh(delayMs = 80) {
    this._gridPageController.scheduleGridRefresh(delayMs);
  }
  _shouldStartInGridMode() {
    return this._gridPageController.shouldStartInGridMode();
  }
  _applyStartInGridMode(_source = "") {
    this._gridPageController.applyStartInGridMode(_source);
  }
  _gridLiveViewEnabled() {
    return this._config?.grid_live_view_enabled !== false;
  }
  _previewAlertHoldMs() {
    const seconds = Number(
      this._config?.preview_page_alert_live_duration_seconds
    );
    return Number.isFinite(seconds) && seconds > 0 ? Math.max(1e3, Math.round(seconds * 1e3)) : PREVIEW_ALERT_HOLD_MS;
  }
  _slideshowAlertHoldMs() {
    const seconds = Number(this._config?.slideshow_alert_hold_seconds);
    return Number.isFinite(seconds) && seconds > 0 ? Math.max(1e3, Math.round(seconds * 1e3)) : SLIDESHOW_ALERT_HOLD_MS;
  }
  _gridAlertHoldMs() {
    const seconds = Number(this._config?.grid_alert_hold_seconds);
    return Number.isFinite(seconds) && seconds > 0 ? Math.max(1e3, Math.round(seconds * 1e3)) : GRID_ALERT_HOLD_MS;
  }
  _isGridCameraAlertLive(entity) {
    return this._gridAlertController.isCameraAlertLive(entity);
  }
  _gridCellSeverity(entity) {
    return this._gridAlertController.cellSeverity(entity);
  }
  _scheduleGridRotation() {
    this._gridPageController.scheduleGridRotation();
  }
  _advanceGridRotation() {
    this._gridPageController.advanceGridRotation();
  }
  _focusGridPageForCamera(entity) {
    return this._gridPageController.focusGridPageForCamera(entity);
  }
  _markGridAlertCamera(entity, severity = "alert") {
    return this._gridAlertController.markAlertCamera(entity, severity);
  }
  async _probeLatestGridAlert() {
    await this._gridAlertController.probeLatestAlert();
  }
  _handleGridRealtimeMessage(msg) {
    this._gridAlertController.handleRealtimeMessage(msg);
  }
  _stopGridModeState() {
    this._gridPageController.stopGridModeState();
  }
  _toggleGridMode() {
    this._gridPageController.toggleGridMode();
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
      this._gridAlertController.startSession();
      this._gridLastRenderSignature = "";
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
      this._gridAlertController.scheduleAlertWatch(300);
      if (this._tab === "alerts" || this._tab === "kept") {
        void (async () => {
          await this._loadGridMixedTabData(this._tab);
          if (this._viewMode !== "grid") return;
          if (this._tab !== "alerts" && this._tab !== "kept") return;
          this._renderList();
        })();
      }
    }
    this._syncSnapshotRefreshTimer();
    this._syncToolbarButtons();
  }
  _isSlideshowRotationAvailable() {
    return this._config?.slideshow_rotation_enabled === true && !DEVICE_PROFILE.isPhone && !this._isMobilePhoneViewport() && Array.isArray(this._config?.cameras) && this._config.cameras.length > 1;
  }
  _isMobilePhoneViewport() {
    return this._viewportContextController.isMobilePhoneViewport();
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
  _isControlsButtonVisible() {
    return hasCameraPtz(this._activeCam);
  }
  _toolbarButtonStates() {
    const inGrid = this._viewMode === "grid";
    const inControls = this._tab === "controls";
    const slideshowActive = this._slideshowActive === true;
    return {
      controlsVisible: this._isControlsButtonVisible(),
      controlsDisabled: inGrid || slideshowActive,
      gridDisabled: inControls || slideshowActive,
      slideshowDisabled: inControls || inGrid,
      filterDisabled: inControls,
      calendarDisabled: inControls
    };
  }
  _syncToolbarButtons() {
    const buttonStates = this._toolbarButtonStates();
    const toolsRegion = this._pageShellRegion("tools");
    if (toolsRegion && this._activePageShellCapabilities().tabsVariant !== "none") {
      const shouldShowGrid = this._isGridModeAvailable();
      const shouldShowSlideshow = this._isSlideshowRotationAvailable();
      const controlsBtnPresent = !!this._pageShellRegionElement("tools", "#controls-btn");
      const gridBtnPresent = !!this._pageShellRegionElement("tools", "#grid-btn");
      const slideshowBtnPresent = !!this._pageShellRegionElement("tools", "#slideshow-btn");
      const needsToolsRerender = buttonStates.controlsVisible && !controlsBtnPresent || shouldShowGrid && !gridBtnPresent || shouldShowSlideshow && !slideshowBtnPresent;
      if (needsToolsRerender) {
        this._syncTabsShell();
      }
    }
    const gridBtn = this._pageShellRegionElement("tools", "#grid-btn");
    if (gridBtn) {
      const gridAvailable = this._isGridModeAvailable();
      const gridActive = this._viewMode === "grid";
      gridBtn.hidden = !gridAvailable;
      gridBtn.style.display = gridAvailable ? "" : "none";
      gridBtn.disabled = buttonStates.gridDisabled;
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
    const slideshowBtn = this._pageShellRegionElement("tools", "#slideshow-btn");
    if (slideshowBtn) {
      const available = this._isSlideshowRotationAvailable();
      slideshowBtn.hidden = !available;
      slideshowBtn.style.display = available ? "" : "none";
      slideshowBtn.disabled = buttonStates.slideshowDisabled;
      slideshowBtn.classList.toggle(
        "active",
        this._slideshowActive && available
      );
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
    const controlsBtn = this._pageShellRegionElement("tools", "#controls-btn");
    if (controlsBtn) {
      controlsBtn.hidden = !buttonStates.controlsVisible;
      controlsBtn.style.display = buttonStates.controlsVisible ? "" : "none";
      controlsBtn.disabled = buttonStates.controlsDisabled;
      const controlsActive = this._tab === "controls";
      controlsBtn.classList.toggle("active", controlsActive);
      controlsBtn.setAttribute(
        "aria-pressed",
        controlsActive ? "true" : "false"
      );
    }
    const filterBtn = this._pageShellRegionElement("tools", "#filter-btn");
    if (filterBtn) {
      const filterPanel = this._pageShellRegion("filterPanel");
      const filterOpen = !!filterPanel && filterPanel.style.display !== "none";
      filterBtn.disabled = buttonStates.filterDisabled;
      filterBtn.classList.toggle("active", filterOpen);
      filterBtn.setAttribute("aria-pressed", filterOpen ? "true" : "false");
    }
    const calBtn = this._pageShellRegionElement("tools", "#cal-btn");
    if (calBtn) {
      const calPanel = this._pageShellRegion("calendarPanel");
      const calOpen = !!calPanel && calPanel.style.display !== "none";
      calBtn.disabled = buttonStates.calendarDisabled;
      calBtn.classList.toggle("active", calOpen);
      calBtn.setAttribute("aria-pressed", calOpen ? "true" : "false");
    }
    if (!buttonStates.controlsVisible && this._tab === "controls") {
      this._setTab(this._resolveControlsReturnTab());
    }
  }
  _syncPlaybackTargetButtons() {
    const support = this._playbackTargetController?.getSupport?.() || {
      airplay: false
    };
    const sync = (selector, supported, fallbackTitle) => {
      this.shadowRoot.querySelectorAll(selector).forEach((button) => {
        const baseTitle = button.dataset.playbackBaseTitle || button.title || fallbackTitle;
        button.dataset.playbackBaseTitle = baseTitle;
        button.hidden = !supported;
        button.disabled = !supported;
        button.setAttribute("aria-hidden", supported ? "false" : "true");
        button.title = baseTitle;
      });
    };
    sync(
      "#popup-airplay-btn, #popup-media-airplay",
      support.airplay,
      "AirPlay video"
    );
  }
  _stopSlideshowRotation(reason = "manual-stop", sync = true) {
    this._slideshowPageController.stopRotation(reason, sync);
  }
  _startSlideshowRotation(source = "manual") {
    return this._slideshowPageController.startRotation(source);
  }
  _pauseSlideshowForPopup() {
    this._slideshowPageController.pauseForPopup();
  }
  _resumeSlideshowAfterPopup() {
    this._slideshowPageController.resumeAfterPopup();
  }
  _toggleSlideshowRotation() {
    this._slideshowPageController.toggleRotation();
  }
  _pauseSlideshowForInteraction() {
    this._slideshowPageController.pauseForInteraction();
  }
  _scheduleSlideshowRotation(_reason = "") {
    this._slideshowPageController.scheduleRotation(_reason);
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
    return slideshowReviewModeForCamera(this._config, entity);
  }
  _shouldHandleSlideshowReview(entity, severity) {
    return shouldHandleSlideshowReview(this._config, entity, severity);
  }
  _cameraIndexForIncomingCamera(cameraId) {
    return cameraIndexForIncomingCamera(this._config, this._camCache, cameraId);
  }
  _cameraEntityForIncomingCamera(cameraId) {
    return cameraEntityForIncomingCamera(
      this._config,
      this._camCache,
      cameraId
    );
  }
  _normalizeReviewSeverity(review) {
    return normalizeReviewSeverity(review);
  }
  _reviewStartTimeSec(review) {
    return reviewStartTimeSec(review);
  }
  _handleSlideshowReviewsUpdated(entity, reviews, source = "reviews-update") {
    this._slideshowAlertController.handleReviewsUpdated(
      entity,
      reviews,
      source
    );
  }
  async _probeLatestSlideshowReview() {
    await this._slideshowAlertController.probeLatestReview();
  }
  _scheduleSlideshowReviewProbe(delayMs = 180) {
    this._slideshowAlertController.scheduleReviewProbe(delayMs);
  }
  _scheduleSlideshowReviewWatch(delayMs = null) {
    this._slideshowAlertController.scheduleReviewWatch(delayMs);
  }
  async _advanceSlideshowRotation() {
    await this._slideshowPageController.advanceRotation();
  }
  _cameraIndexByEntity(entity) {
    return cameraIndexByEntity(this._config, entity);
  }
  _extractRealtimeMessageCamera(msg) {
    return extractRealtimeMessageCamera(msg);
  }
  _extractRealtimeMessageSeverity(msg) {
    return extractRealtimeMessageSeverity(msg);
  }
  _applyHaReviewStatusAlerts() {
    let hasActiveAlert = false;
    const activeEntity = String(this._activeCam?.entity || "").trim();
    let activeCameraAlerted = false;
    let gridChanged = false;
    let firstAlertEntity = "";
    let firstAlertSeverity = "";
    let firstChangedAlertEntity = "";
    let activeAlertSeverity = "";
    for (const camera of this._config?.cameras || []) {
      const entity = String(camera?.entity || "").trim();
      if (!entity) continue;
      const status = haReviewStatusForCamera({
        entity,
        discoveredCameraName: this._camCache?.[entity]?.cam,
        hass: this._hass
      });
      const severity = haReviewStatusSeverity(status);
      if (!severity) continue;
      if (!this._shouldHandleSlideshowReview(entity, severity)) continue;
      if (!firstAlertEntity) {
        firstAlertEntity = entity;
        firstAlertSeverity = severity;
      }
      hasActiveAlert = true;
      if (entity === activeEntity) {
        activeCameraAlerted = true;
        activeAlertSeverity = severity;
      }
      const changed = this._gridAlertController.markAlertCamera(
        entity,
        severity
      );
      if (changed && !firstChangedAlertEntity) {
        firstChangedAlertEntity = entity;
      }
      gridChanged = changed || gridChanged;
      this._previewAlertController.markAlertCamera(
        entity,
        severity,
        this._previewAlertHoldMs()
      );
    }
    const slideshowAlertEntity = activeCameraAlerted ? activeEntity : firstAlertEntity;
    const slideshowAlertSeverity = activeCameraAlerted ? activeAlertSeverity : firstAlertSeverity;
    if (slideshowAlertEntity) {
      this._slideshowAlertController.handleHaStatusCandidate(
        slideshowAlertEntity,
        slideshowAlertSeverity || "alert"
      );
    }
    const gridAlertEntity = firstChangedAlertEntity || (activeCameraAlerted ? activeEntity : firstAlertEntity);
    let gridFocused = false;
    if (this._viewMode === "grid" && gridAlertEntity) {
      gridFocused = this._focusGridPageForCamera(gridAlertEntity) === true;
    }
    if ((gridChanged || gridFocused) && this._viewMode === "grid") {
      this._scheduleGridRefresh(90);
    }
    if (activeCameraAlerted && this._viewMode !== "grid" && !this._isPreviewPageActive()) {
      this._scheduleResumeLive("ha-review-status-alert");
    }
    return hasActiveAlert;
  }
  _handleSlideshowRealtimeMessage(msg) {
    this._slideshowAlertController.handleRealtimeMessage(msg);
  }
  // ── camera switching ──────────────────────────────────────
  async _switchCamera(idx, opts = {}) {
    if (idx !== this._activeCamIdx) {
      void this._stopTwoWayTalkSession();
    }
    this._mobileCamSwitcherOpen = false;
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
      this._gridAlertController.clearWatchTimer();
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
    this._browseFilterController.normalizeFilterSelections();
    if (this._pageShellRegion("filterPanel")?.style.display !== "none") {
      this._renderFilter();
    }
    this._renderList();
    this._streamMuted = true;
    this._renderMuteButton();
    this._cancelPendingMount("switch-camera", { preserveLiveEntity: prevEnt });
    this._mountEngine();
    clearTimeout(this._switchLoadT);
    this._browseWindowLoaderController.loadWindow(true);
    this._applyCalendarActivityCacheForActiveCamera();
    void this._prefetchCalendarActivityForActiveCamera();
    if (this._pageShellRegion("calendarPanel")?.style.display !== "none") {
      this._renderCal();
    }
    this._syncTwoWayTalkButton();
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
  async _loadKept() {
    await this._browseTabDataController.loadKept();
  }
  async _loadReviews() {
    await this._browseTabDataController.loadReviews();
  }
  async _loadCalendar() {
    await this._browseCalendarActivityController.loadCalendar();
  }
  _calendarActivityCacheKey(clientId, cam, tz = this._tz()) {
    return this._browseCalendarActivityController.calendarActivityCacheKey(
      clientId,
      cam,
      tz
    );
  }
  _applyCalendarActivityCacheForActiveCamera() {
    this._browseCalendarActivityController.applyCalendarActivityCacheForActiveCamera();
  }
  async _prefetchCalendarActivityForActiveCamera() {
    await this._browseCalendarActivityController.prefetchCalendarActivityForActiveCamera();
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
    if (!this._hass?.connection) return;
    const clientIds = new Set();
    for (const camera of this._config?.cameras || []) {
      const entity = camera?.entity;
      if (!entity) continue;
      const discoveredId = String(
        this._camCache[entity]?.clientId || ""
      ).trim();
      if (discoveredId) clientIds.add(discoveredId);
    }
    const activeClientId = String(this._cc()?.clientId || "").trim();
    if (activeClientId) clientIds.add(activeClientId);
    if (!clientIds.size) return;
    const onRealtimeMessage = (msg) => {
      this._handleGridRealtimeMessage(msg);
      this._previewAlertController.handleRealtimeMessage(msg);
      this._handleSlideshowRealtimeMessage(msg);
      if (!this._isNowWindow()) return;
      if (!this._isRealtimeEventMessage(msg)) return;
      this._scheduleReload(REALTIME_RELOAD_DEBOUNCE_MS);
    };
    try {
      const subscriptions = [...clientIds].map(
        (clientId) => this._hass.connection.subscribeMessage(onRealtimeMessage, {
          type: "frigate/events/subscribe",
          instance_id: clientId
        })
      );
      this._unsub = Promise.allSettled(subscriptions).then((results) => {
        const unsubscribers = results.filter((result) => result.status === "fulfilled").map((result) => result.value).filter((value) => typeof value === "function");
        return () => {
          for (const unsubscribe of unsubscribers) {
            try {
              unsubscribe();
            } catch (_) {
            }
          }
        };
      });
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
        this._browseWindowLoaderController.loadWindow(true);
      },
      Math.max(0, Number(delayMs) || 0)
    );
  }
  _buildTabsMarkup() {
    const filterPanel = this._pageShellRegion("filterPanel");
    const calendarPanel = this._pageShellRegion("calendarPanel");
    const filterPanelOpen = !!filterPanel && filterPanel.style.display !== "none";
    const calendarPanelOpen = !!calendarPanel && calendarPanel.style.display !== "none";
    const buttonStates = this._toolbarButtonStates();
    const shellProfile = this._activePageShellLayoutProfile();
    const tabsButtonClass = String(shellProfile?.tabsButtonClass || "").trim() || "circle-btn";
    const toolsButtonClass = String(shellProfile?.toolsButtonClass || "").trim() || "tool";
    const { activeTab, markup: tabsMarkup } = buildTabsMarkup({
      tab: this._tab,
      hiddenTabs: this._config.hidden_tabs,
      viewMode: this._viewMode,
      icons: ICONS,
      buttonClass: tabsButtonClass
    });
    const toolsMarkup = buildToolsMarkup({
      tab: activeTab,
      viewMode: this._viewMode,
      icons: ICONS,
      buttonClass: toolsButtonClass,
      isFilterPanelOpen: filterPanelOpen,
      isCalendarPanelOpen: calendarPanelOpen,
      isGridModeAvailable: this._isGridModeAvailable(),
      isSlideshowRotationAvailable: this._isSlideshowRotationAvailable(),
      isSlideshowActive: this._slideshowActive,
      isControlsVisible: buttonStates.controlsVisible,
      controlsDisabled: buttonStates.controlsDisabled,
      gridDisabled: buttonStates.gridDisabled,
      slideshowDisabled: buttonStates.slideshowDisabled,
      filterDisabled: buttonStates.filterDisabled,
      calendarDisabled: buttonStates.calendarDisabled,
      gridButtonIcon: this._gridButtonIcon(),
      slideshowButtonIcon: this._slideshowButtonIcon()
    });
    this._tab = activeTab;
    this._tabsMarkupCache = tabsMarkup;
    this._toolsMarkupCache = toolsMarkup;
    return tabsMarkup;
  }
  _getToolsMarkup() {
    return this._toolsMarkupCache || "";
  }
  _syncTabsShell() {
    const tabs = this._pageShellRegion("tabs");
    const toolsSlot = this._pageShellRegion("tools");
    if (!tabs && !toolsSlot) return;
    if (this._activePageShellCapabilities().tabsVariant === "none") {
      if (tabs) tabs.innerHTML = "";
      if (toolsSlot) toolsSlot.innerHTML = "";
      return;
    }
    const prevTab = this._tab;
    const tabsMarkup = this._buildTabsMarkup();
    if (tabs) tabs.innerHTML = tabsMarkup;
    if (toolsSlot) toolsSlot.innerHTML = this._getToolsMarkup();
    if (this._tab !== prevTab) {
      void this._loadTabData(this._tab);
    }
  }
  async _loadTabData(tab) {
    await this._browseTabDataController.loadTabData(tab);
  }
  _isGridMixedListMode() {
    return this._viewMode === "grid";
  }
  _allGridReviews() {
    return this._browseCollectionController.allGridReviews();
  }
  _allGridKeptEvents() {
    return this._browseCollectionController.allGridKeptEvents();
  }
  _findReviewById(id) {
    return this._browseCollectionController.findReviewById(id);
  }
  async _loadGridMixedTabData(tab) {
    await this._browseCollectionController.loadGridMixedTabData(tab);
  }
  // =======================Render Shell===================================
  _renderShell() {
    const title = this._config.title || (this._config.cameras.length === 1 ? cap(camDisplayName(this._config.cameras[0])) : "Cameras") || "Camera";
    const subtitle = this._subtitleText();
    const showCamSwitcher = this._config.cameras.length > 1 || this._isPreviewPageEnabled();
    const camSwitcherMarkup = showCamSwitcher ? this._camSwitcherMarkup({ includeStatus: false }) : "";
    const pageNav = this._pageNavigationController.pageNavMarkup();
    const shellProfile = this._activePageShellLayoutProfile();
    const infoRow = resolvePageInfoRowMarkup(shellProfile, {
      title,
      subtitle,
      version: VERSION,
      host: this,
      buildDefaultInfoRowMarkup: ({ title: title2, subtitle: subtitle2, version }) => buildInfoRowMarkup({
        title: title2,
        subtitle: subtitle2,
        version
      })
    });
    const layoutProfile = shellProfile || {};
    const tabsMarkup = this._buildTabsMarkup();
    const toolsMarkup = this._getToolsMarkup();
    const regions = {
      live: buildLiveEngineWrapMarkup({ icons: ICONS }),
      liveFullscreen: buildLiveFullscreenControlMarkup({
        icons: ICONS,
        buttonClass: shellProfile?.liveFullscreenButtonClass
      }),
      liveMute: buildLiveMuteControlMarkup({
        icons: ICONS,
        streamMuted: this._streamMuted,
        buttonClass: shellProfile?.liveMuteButtonClass
      }),
      information: infoRow,
      cameraSwitcher: buildCamSwitcherRegionMarkup({
        markup: camSwitcherMarkup
      }),
      pageNavigation: pageNav,
      tabs: buildTabsRegionMarkup({ markup: tabsMarkup }),
      tools: buildToolsRegionMarkup({ markup: toolsMarkup }),
      browseHeader: buildBrowseHeaderRegionMarkup({ icons: ICONS }),
      browse: buildBrowseRegionMarkup({ layoutProfile }),
      footer: buildFooterMarkup({ icons: ICONS })
    };
    const mainLayoutShell = resolvePageMainLayoutShellMarkup(shellProfile, {
      host: this,
      regions,
      layoutProfile,
      buildDefaultMainLayoutShellMarkup: ({ regions: regions2, layoutProfile: layoutProfile2 }) => buildSingleViewMainLayoutShellMarkup({
        regions: regions2,
        layoutProfile: layoutProfile2
      })
    });
    const regionValidation = validatePageShellRegionMarkup(mainLayoutShell, {
      requiredRegions: resolveRequiredPageShellRegions(shellProfile)
    });
    if (!regionValidation.valid) {
      console.warn("[Frigate] Page shell region contract violation", {
        pageId: this._pageId,
        missing: regionValidation.missing,
        duplicates: regionValidation.duplicates
      });
    }
    const popupShell = buildPopupShellMarkup({
      icons: ICONS,
      version: VERSION
    });
    this.shadowRoot.innerHTML = `<style>${STYLES}</style>
    <ha-card class="card ${this._cardStateClassNames()}" id="card" style="border-radius: var(--fvc-border-radius);">

        ${mainLayoutShell}
        <div class="toast" id="toast" style="display:none"></div>

          ${popupShell}
      </ha-card>
      `;
    this._domCache = {};
    this._lastRenderedListHtml = "";
    this._initPopupInteractions();
    this._applyBrowse();
    this._applyCardStyle();
    this._wideViewPageController.applyLayoutAndWideSyncForCard();
    this._syncBrowseHeadModeClass();
    this._bindListScroll();
    this._bindRecordingsSwipe();
    this._wideViewPageController.initResizeHandle();
    this._initLiveOverlayControls();
    this._syncSlideshowCountdownOverlay();
    this._renderPreviewPage();
    this._applyPreviewShellVisibility();
    this._syncMobileViewPageMarkup();
  }
  _renderShellPreserveLive() {
    const preservedEngWrap = this._$("#eng-wrap");
    if (!preservedEngWrap) {
      this._renderShell();
      return;
    }
    const parent = preservedEngWrap.parentNode;
    if (parent) {
      parent.removeChild(preservedEngWrap);
    }
    this._renderShell();
    const nextEngWrap = this._$("#eng-wrap");
    if (!nextEngWrap) return;
    nextEngWrap.replaceWith(preservedEngWrap);
    this._domCache["#eng-wrap"] = preservedEngWrap;
    const preservedEngine = preservedEngWrap.querySelector("#engine");
    if (preservedEngine) {
      this._domCache["#engine"] = preservedEngine;
    }
    this._initLiveOverlayControls();
    this._syncFullscreenButtonsVisibility();
  }
  _shouldRenderTwoWayTalkButtonForActiveCamera() {
    return shouldRenderTwoWayTalkButton({
      camera: this._activeCam,
      pageId: normalizePageRoute(this._pageId),
      PAGE_IDS,
      activeStreamType: this._activeStreamType
    });
  }
  _buildTwoWayTalkInfoButtonMarkup() {
    const pageId = normalizePageRoute(this._pageId);
    if (pageId !== PAGE_IDS.singleView && pageId !== PAGE_IDS.wideView) {
      return "";
    }
    return this._buildTwoWayTalkButtonMarkup();
  }
  _buildTwoWayTalkMobileButtonMarkup() {
    if (normalizePageRoute(this._pageId) !== PAGE_IDS.mobileView) {
      return "";
    }
    const visible = this._shouldRenderTwoWayTalkButtonForActiveCamera();
    return `<div class="mobile-view-two-way-talk-slot" id="mobile-view-two-way-talk-slot" data-fvc-region="two-way-talk" ${visible ? "" : "hidden"}>${this._buildTwoWayTalkButtonMarkup()}</div>`;
  }
  _buildTwoWayTalkButtonMarkup() {
    const active = this._twoWayTalkActiveForCurrentCamera();
    const label = active ? "Disable two-way talk" : "Enable two-way talk";
    const visible = this._shouldRenderTwoWayTalkButtonForActiveCamera();
    return `<button class="info-row-mic-btn${active ? " active" : ""}" id="two-way-talk-btn" type="button" ${visible ? "" : "hidden"} aria-pressed="${active ? "true" : "false"}" title="${label}" aria-label="${label}">${active ? ICONS.micOn : ICONS.micOff}</button>`;
  }
  _activeCameraTwoWayTalkEnabled() {
    return this._activeCam?.two_way_talk === true;
  }
  _twoWayTalkActiveForCurrentCamera() {
    return !!this._twoWayTalkSession && this._twoWayTalkEntity === String(this._activeCam?.entity || "").trim();
  }
  _syncTwoWayTalkRuntimeState() {
    if (!this._twoWayTalkSession) return;
    if (!this._shouldRenderTwoWayTalkButtonForActiveCamera() || !this._activeCameraTwoWayTalkEnabled()) {
      void this._stopTwoWayTalkSession();
    }
  }
  _syncTwoWayTalkActionSlot() {
    const infoRow = this._pageShellRegion("information");
    if (!infoRow) return;
    const existingSlot = this._pageShellRegionElement(
      "information",
      `[data-fvc-region="two-way-talk"]`
    );
    if (!existingSlot) return;
    const actionMarkup = this._buildTwoWayTalkInfoButtonMarkup();
    if (!actionMarkup) {
      existingSlot.innerHTML = "";
      existingSlot.hidden = true;
      return;
    }
    existingSlot.hidden = false;
    if (!existingSlot.querySelector("#two-way-talk-btn")) {
      existingSlot.innerHTML = actionMarkup;
    }
  }
  _syncMobileViewTwoWayTalkSlot() {
    if (!this._isMobileViewPageActive()) return;
    const slot = this._pageShellRegion("twoWayTalk");
    if (!slot) return;
    slot.hidden = !this._shouldRenderTwoWayTalkButtonForActiveCamera();
  }
  _syncTwoWayTalkButton() {
    this._syncTwoWayTalkActionSlot();
    this._syncMobileViewTwoWayTalkSlot();
    const button = this._pageShellRegionElement("twoWayTalk", "#two-way-talk-btn");
    if (!button) return;
    const visible = this._shouldRenderTwoWayTalkButtonForActiveCamera();
    button.hidden = !visible;
    button.disabled = this._twoWayTalkStarting === true || !visible;
    const active = this._twoWayTalkActiveForCurrentCamera();
    const label = active ? "Disable two-way talk" : "Enable two-way talk";
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", active ? "true" : "false");
    button.setAttribute("title", label);
    button.setAttribute("aria-label", label);
    button.innerHTML = active ? ICONS.micOn : ICONS.micOff;
  }
  async _toggleTwoWayTalkSession() {
    if (this._twoWayTalkStarting) return;
    if (this._twoWayTalkActiveForCurrentCamera()) {
      await this._stopTwoWayTalkSession();
      return;
    }
    await this._startTwoWayTalkSession();
  }
  _setTwoWayTalkLiveAudioActive(active) {
    this._applyLiveMuteChange(!active, { source: "two-way-talk" });
  }
  async _startTwoWayTalkSession() {
    if (!window.isSecureContext) return;
    const entity = String(this._activeCam?.entity || "").trim();
    if (!entity || !this._activeCameraTwoWayTalkEnabled()) return;
    this._twoWayTalkStarting = true;
    this._syncTwoWayTalkButton();
    try {
      await this._stopTwoWayTalkSession();
      const handleEnded = () => {
        if (this._twoWayTalkEntity !== entity) return;
        this._twoWayTalkSession = null;
        this._twoWayTalkEntity = "";
        this._setTwoWayTalkLiveAudioActive(false);
        this._syncTwoWayTalkButton();
      };
      const session = this._shouldUseGo2RtcForEntity(entity) ? await startGo2RtcTwoWayTalkSession({
        websocketUrl: await this._go2rtcResolver.websocketUrlForEntity(entity),
        onEnded: handleEnded
      }) : await startHaDirectTwoWayTalkSession({
        hass: this._hass,
        entityId: entity,
        onEnded: handleEnded
      });
      this._twoWayTalkSession = session;
      this._twoWayTalkEntity = entity;
      this._setTwoWayTalkLiveAudioActive(true);
    } catch (error) {
      console.warn("[Frigate] Two-way talk start failed", error);
      this._twoWayTalkSession = null;
      this._twoWayTalkEntity = "";
      this._setTwoWayTalkLiveAudioActive(false);
    } finally {
      this._twoWayTalkStarting = false;
      this._syncTwoWayTalkButton();
    }
  }
  async _stopTwoWayTalkSession() {
    const session = this._twoWayTalkSession;
    this._twoWayTalkSession = null;
    this._twoWayTalkEntity = "";
    this._setTwoWayTalkLiveAudioActive(false);
    if (!session) {
      this._syncTwoWayTalkButton();
      return;
    }
    try {
      await session.stop?.();
    } catch (error) {
      console.warn("[Frigate] Two-way talk stop failed", error);
    }
    this._syncTwoWayTalkButton();
  }
  _initLiveOverlayControls() {
    const wrap = this._$("#live-stage");
    if (!wrap) return;
    if (this._liveOverlayControlsController) {
      try {
        this._liveOverlayControlsController.dispose();
      } catch (_) {
      }
      this._liveOverlayControlsController = null;
    }
    if (!wrap.classList.contains("live-stage--overlay")) return;
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
    this._liveOverlayControlsController = new LiveOverlayControlsController({
      wrap,
      show,
      hideNow,
      hideSoon
    });
    this._liveOverlayControlsController.bind();
  }
  _syncBrowseHeadModeClass() {
    const card = this._$("#card");
    if (!card) return;
    card.classList.toggle(
      "recordings-browse-head-tall",
      this._tab === "recordings"
    );
    card.classList.toggle(
      "recordings-browse-head-compact",
      this._isMobilePhoneViewport()
    );
  }
  _bindListScroll() {
    const list = this._pageShellRegionElement("browse", "#list");
    const browse = this._pageShellRegion("browse");
    if (!list && !browse) return;
    if (this._listScrollController) {
      this._listScrollController.dispose();
      this._listScrollController = null;
    }
    this._listScrollController = new ListScrollController({
      list,
      browse,
      syncOlderHint: () => this._syncOlderHint(),
      syncBrowseHeadFromScroll: () => this._syncBrowseHeadFromScroll(),
      getTab: () => this._tab,
      isLoading: () => this._loading,
      isExhausted: () => this._exhausted,
      loadOlder: () => this._browseWindowLoaderController.loadOlder()
    });
    this._listScrollController.bind();
  }
  _bindRecordingsSwipe() {
    if (this._recordingsSwipeController) {
      this._recordingsSwipeController.dispose();
      this._recordingsSwipeController = null;
    }
    const browse = this._pageShellRegion("browse");
    if (!browse) return;
    this._recordingsSwipeController = new RecordingsSwipeController({
      browse,
      getTab: () => this._tab,
      isMobileTabletViewport: () => this._isMobileTabletViewport(),
      isDayNavAnimating: () => this._recordingsDayNavAnimating,
      getGesture: () => this._recordingsSwipeGesture,
      setGesture: (gesture) => {
        this._recordingsSwipeGesture = gesture;
      },
      setTapBlocked: (blocked) => {
        this._recordingsSwipeBlockTap = blocked;
      },
      getList: () => this._pageShellRegionElement("browse", "#list"),
      getLastRenderedListHtml: () => this._lastRenderedListHtml,
      setLastRenderedListHtml: (html) => {
        this._lastRenderedListHtml = html;
      },
      renderList: () => this._renderList(),
      prepareDayTransition: (direction) => this._recordingsBrowseNavController.prepareDayTransition(direction),
      renderRecordings: (recordings) => this._recordingsListMarkup(this._recordingsViewRows(recordings)),
      completeGesture: (gesture) => this._recordingsBrowseNavController.completeSwipeGesture(gesture)
    });
    this._recordingsSwipeController.bind();
  }
  _recordingsListMarkup(recs, emptyText = "No recordings in this day") {
    return buildRecordingsListMarkup({
      recordings: recs,
      emptyText,
      recordingsIcon: ICONS.recordings,
      downloadIcon: ICONS.download,
      formatTime: (ts) => this._time(ts),
      nowSec: this._winEnd || Date.now() / 1e3
    });
  }
  _recordingsViewRows(recs) {
    return splitRecordingsHourly(recs, this._winEnd || Date.now() / 1e3).sort(
      (a, b) => b.start_time - a.start_time
    );
  }
  _createRecordingsSwipeStage(direction, incomingHtml) {
    return this._recordingsSwipeController?.createStage(
      direction,
      incomingHtml
    );
  }
  _setRecordingsSwipeStageOffset(state, offset, transition = "") {
    this._recordingsSwipeController?.setStageOffset(state, offset, transition);
  }
  _animateRecordingsSwipeStageTo(state, offset, duration = 260, easing = "cubic-bezier(0.18, 0.5, 0.2, 1)") {
    return this._recordingsSwipeController?.animateStageTo(
      state,
      offset,
      duration,
      easing
    ) || Promise.resolve();
  }
  _destroyRecordingsSwipeStage() {
    this._recordingsSwipeController?.destroyGestureStage();
  }
  _clearRecordingsSwipeListState(list = null) {
    this._recordingsSwipeController?.clearListState(list);
  }
  _startRecordingsSwipeGesture(direction) {
    return this._recordingsSwipeController?.startGestureStage(direction) || null;
  }
  _bounceRecordingsArea(direction) {
    this._recordingsSwipeController?.bounceArea(direction);
  }
  _scrollEventsToTop() {
    const list = this._pageShellRegionElement("browse", "#list");
    const browse = this._pageShellRegion("browse");
    const scroller = resolveActiveListScroller({ list, browse });
    if (!scroller) return;
    if (typeof scroller.scrollTo === "function") {
      scroller.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      scroller.scrollTop = 0;
    }
  }
  _applyCardStyle() {
    this._cardStyleController.applyCardStyle();
  }
  _isCardVisible() {
    return this._viewportContextController.isCardVisible();
  }
  _scheduleResumeLive(reason = "") {
    if (this._isPreviewPageActive()) {
      this._renderPreviewPage();
      return;
    }
    if (this._viewMode === "grid") {
      this._scheduleGridRefresh(120);
      return;
    }
    if (this._resumeLiveT) clearTimeout(this._resumeLiveT);
    const isEditorExitReason = reason === "card-editor-close" || reason === "watchdog-dialog-close" || reason === "watchdog-edit-exit" || reason === "watchdog-dashboard-edit-on" || reason === "watchdog-dashboard-edit-off" || reason === "hass-edit-exit";
    const delay = reason === "card-editor-close" || reason === "watchdog-dialog-close" || reason === "watchdog-dashboard-edit-on" || reason === "watchdog-dashboard-edit-off" ? 40 : 140;
    this._resumeLiveT = setTimeout(() => {
      this._resumeLiveT = null;
      this._resumeLiveIfNeeded(reason);
    }, delay);
    if (isEditorExitReason && this._viewMode !== "grid") {
      setTimeout(() => this._kickLiveIfStale(true), 900);
    }
    if (this._isFirefox() && this._viewMode !== "grid") {
      setTimeout(() => this._kickLiveIfStale(true), 900);
    }
  }
  _isMobileTabletViewport() {
    return this._viewportContextController.isMobileTabletViewport();
  }
  _isLandscapeViewport() {
    return this._viewportContextController.isLandscapeViewport();
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
    const card = this._$("#card");
    const forceMobileViewViewportCover = card?.classList?.contains("mobile-view-active") && (card.classList.contains("mobile-rotate-live") || card.classList.contains("mobile-rotate-live-exit"));
    const vv = window.visualViewport;
    const vw = Math.max(1, Math.round(vv?.width || window.innerWidth || 0));
    const vh = Math.max(1, Math.round(vv?.height || window.innerHeight || 0));
    const ox = Math.round(vv?.offsetLeft || 0);
    const oy = Math.round(vv?.offsetTop || 0);
    video.style.setProperty("position", "fixed", "important");
    video.style.setProperty(
      "top",
      forceMobileViewViewportCover ? "0px" : `${oy}px`,
      "important"
    );
    video.style.setProperty(
      "left",
      forceMobileViewViewportCover ? "0px" : `${ox}px`,
      "important"
    );
    video.style.setProperty(
      "width",
      forceMobileViewViewportCover ? "100vw" : `${vw}px`,
      "important"
    );
    video.style.setProperty(
      "height",
      forceMobileViewViewportCover ? "100dvh" : `${vh}px`,
      "important"
    );
    video.style.setProperty("max-width", "none", "important");
    video.style.setProperty("max-height", "none", "important");
    video.style.setProperty(
      "z-index",
      forceMobileViewViewportCover ? "2147483000" : "1402",
      "important"
    );
    video.style.setProperty(
      "object-fit",
      forceMobileViewViewportCover ? "cover" : "contain",
      "important"
    );
    video.style.setProperty("background", "var(--c-bg-deep)", "important");
    video.style.setProperty("transform", "none", "important");
    if (this._liveVideoZoomController?.video === video) {
      this._liveVideoZoomController.refresh();
    }
    if (this._popupVideoZoomController?.video === video) {
      this._popupVideoZoomController.refresh();
    }
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
    const controlsPlan = resolveRotateOverlayNativeControlsPlan({ enabled });
    const expected = controlsPlan.expectedActive;
    const apply = () => {
      if (!!this._rotateOverlayActive !== expected) return;
      const host = this._$("#engine");
      const v = this._findVideoDeep(host) || this._findVideoDeep(this._engine) || this._engine?.video || null;
      if (!v) return;
      v.controls = expected;
      if (!expected) v.removeAttribute("controls");
      v.setAttribute("playsinline", "");
      v.setAttribute("webkit-playsinline", "true");
      if (controlsPlan.applyFullscreenStyle)
        this._applyRotateVideoFullscreenStyle(v);
      else this._clearRotateVideoFullscreenStyle();
      if (controlsPlan.bindAudioSync) this._bindRotateOverlayAudioSync(v);
    };
    if (controlsPlan.clearAudioSyncFirst) {
      this._clearRotateOverlayAudioSync();
    }
    if (controlsPlan.clearFullscreenStyleFirst) {
      this._clearRotateVideoFullscreenStyle();
    }
    apply();
    controlsPlan.retryDelaysMs.forEach((delay) => setTimeout(apply, delay));
  }
  _scheduleRotateOverlayUpdate() {
    if (this._rotateOverlayRaf) cancelAnimationFrame(this._rotateOverlayRaf);
    this._rotateOverlayRaf = requestAnimationFrame(() => {
      this._rotateOverlayRaf = 0;
      const viewportVars = resolveRotateOverlayViewportVariables({
        visualViewport: window.visualViewport,
        innerWidth: window.innerWidth,
        innerHeight: window.innerHeight
      });
      this.style.setProperty("--rotate-vw", viewportVars.widthPx);
      this.style.setProperty("--rotate-vh", viewportVars.heightPx);
      this.style.setProperty("--rotate-ox", viewportVars.offsetLeftPx);
      this.style.setProperty("--rotate-oy", viewportVars.offsetTopPx);
      this._updateRotateOverlayState();
    });
  }
  _updateRotateOverlayState() {
    const card = this._$("#card");
    if (!card) return;
    const popupOpen = this._$("#myPopup")?.classList.contains("is-open");
    const viewer = this._$("#viewer");
    const popupMediaVisible = !!popupOpen && !!viewer && viewer.style.display !== "none" && viewer.childElementCount > 0;
    const rotateState = resolveRotateOverlayState({
      isMobileTabletViewport: this._isMobileTabletViewport(),
      isLandscapeViewport: this._isLandscapeViewport(),
      popupOpen,
      popupMediaVisible,
      currentMode: this._rotateOverlayMode,
      isActive: this._rotateOverlayActive
    });
    const uiPlan = resolveRotateOverlayUiPlan(rotateState);
    if (this._rotateOverlayExitT) {
      clearTimeout(this._rotateOverlayExitT);
      this._rotateOverlayExitT = null;
    }
    this._applyRotateOverlayUiPlan(card, uiPlan);
    const exitPlan = resolveRotateOverlayExitPlan({
      action: rotateState.action
    });
    if (rotateState.action === "activate-live") {
      return;
    }
    if (rotateState.action === "activate-popup") {
      return;
    }
    if (rotateState.action === "idle") {
      return;
    }
    this._rotateOverlayExitT = setTimeout(() => {
      const c = this._$("#card");
      if (c && exitPlan.removeClasses.length) {
        c.classList.remove(...exitPlan.removeClasses);
      }
      if (exitPlan.releaseViewportCover) {
        this.classList.remove(MOBILE_VIEW_ROTATE_COVER_CLASS);
      }
      this._rotateOverlayExitT = null;
      if (this._resumeLiveT) return;
      if (exitPlan.syncFullscreenButtons) {
        this._syncFullscreenButtonsVisibility();
      }
    }, exitPlan.delayMs);
  }
  _kickLiveIfStale(force = false) {
    const now = Date.now();
    const engineHost = this._$("#engine");
    const v = this._findVideoDeep(engineHost) || this._findVideoDeep(this._engine) || this._engine?.video || null;
    const probeState = resolveLiveKickProbeState({ video: v });
    const action = resolveLiveKickIfStaleAction({
      started: this._started,
      hass: this._hass,
      config: this._config,
      previewPageActive: this._isPreviewPageActive(),
      viewMode: this._viewMode,
      visible: this._isCardVisible(),
      popupOpen: this._$("#myPopup")?.classList.contains("is-open"),
      mountInProgress: this._mountInProgress,
      force,
      streamLoadingVisible: !!(this._$("#stream-loading") && !this._$("#stream-loading").hidden),
      lastLiveKick: this._lastLiveKick,
      nowMs: now,
      isFirefox: this._isFirefox(),
      mseConnectAt: this._mseConnectAt,
      mseLastChunkAt: this._mseLastChunkAt,
      hasVideo: probeState.hasVideo,
      videoState: probeState.videoState
    });
    if (action.shouldKick) {
      this._lastLiveKick = action.nextLastLiveKick;
      this._mountEngine();
    }
  }
  _resumeLiveIfNeeded(_reason = "") {
    const action = resolveLiveResumeAction({
      started: this._started,
      hass: this._hass,
      config: this._config,
      previewPageActive: this._isPreviewPageActive(),
      visible: this._isCardVisible(),
      popupOpen: this._$("#myPopup")?.classList.contains("is-open"),
      mountSeq: this._mountSeq,
      mountInProgress: this._mountInProgress,
      mountStartedAt: this._mountStartedAt,
      mountTargetEntity: this._mountTargetEntity,
      nowMs: Date.now()
    });
    if (action.nextMountState) {
      this._applyMountTrackingState(action.nextMountState);
      this._cleanupEngine();
    }
    if (action.shouldRetry) {
      if (this._resumeLiveT) clearTimeout(this._resumeLiveT);
      this._resumeLiveT = setTimeout(() => {
        this._resumeLiveIfNeeded("wait-ready");
      }, action.retryDelayMs);
      return;
    }
    if (action.shouldRevealEngineWrap) {
      const engWrap = this._$("#eng-wrap");
      if (engWrap) engWrap.style.display = "";
    }
    if (action.shouldKickNow) {
      this._kickLiveIfStale(true);
    }
    if (action.safetyKickDelayMs > 0) {
      setTimeout(() => this._kickLiveIfStale(true), action.safetyKickDelayMs);
    }
  }
  _setupResizeObserver() {
    if (this._ro) this._ro.disconnect();
    this._ro = new ResizeObserver((entries) => {
      const w = entries[0].contentRect.width;
      const h = entries[0].contentRect.height;
      const prevW = this._cardWidth || 0;
      const prevH = this._cardHeight || 0;
      this._cardWidth = w;
      this._cardHeight = h;
      const visibleNow = w > 2 && h > 2;
      if (visibleNow && !this._wasVisible) {
        this._scheduleResumeLive("resize-visible");
      }
      this._wasVisible = visibleNow;
      if (prevW > 0 && prevH > 0 && Math.round(w) === Math.round(prevW) && Math.round(h) === Math.round(prevH)) {
        return;
      }
      const card = this.shadowRoot.querySelector(".card");
      if (!card) return;
      this._syncBrowseHeadModeClass();
      this._applyCardStyle();
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
    return this._activeStandardPageController().camSwitcherMarkup({
      includeStatus
    });
  }
  _renderCamSwitcher() {
    this._activeStandardPageController().renderCamSwitcher();
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
    this._resetPopupMediaSurfaceState(viewer);
  }
  _resetPopupMediaSurfaceState(viewer) {
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
    this._playbackTargetController.release("popup");
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
  _createFilterPanel() {
    return this._pageShellRegion("filterPanel");
  }
  _createCalendarPanel() {
    return this._pageShellRegion("calendarPanel");
  }
  _initPopupInteractions() {
    const popup = this._$("#myPopup");
    if (!popup) return;
    if (this._popupDragController) {
      this._popupDragController.dispose();
      this._popupDragController = null;
    }
    this._popupDragController = new PopupDragController({
      popup,
      eventTarget: document,
      closeThreshold: 100,
      closePopup: () => this._closePopup(),
      isPopupOpen: () => popup.classList.contains("is-open")
    });
    this._popupDragController.bind();
  }
  _click(e) {
    const target = e.target;
    if (this._mobileCamSwitcherController.handleClickTarget(target)) return;
    this._mobileCamSwitcherController.closeIfOutside(target);
    if (target.closest(".close-btn")) return this._closePopup();
    if (this._handleToolbarClick(target)) return;
    if (this._handleSidebarClick(target)) return;
    if (this._handleListClick(e, target)) return;
    if (this._handleEventClick(target)) return;
  }
  _handleToolbarClick(target) {
    if (this._handleTopToolbarClick(target)) return true;
    if (this._handlePopupMediaToolbarClick(target)) return true;
    if (this._handleBrowseToolbarClick(target)) return true;
    return false;
  }
  _handleTopToolbarClick(target) {
    const twoWayTalkBtn = target.closest("#two-way-talk-btn");
    if (twoWayTalkBtn) {
      if (twoWayTalkBtn.disabled) return true;
      void this._toggleTwoWayTalkSession();
      return true;
    }
    const gridBtn = target.closest("#grid-btn");
    if (gridBtn) {
      if (gridBtn.disabled) return true;
      this._toggleGridMode();
      return true;
    }
    const slideshowBtn = target.closest("#slideshow-btn");
    if (slideshowBtn) {
      if (slideshowBtn.disabled) return true;
      this._toggleSlideshowRotation();
      return true;
    }
    if (target.closest("#live-fs-btn")) {
      this._fullscreen(this._$("#live-stage"), { preferLive: true });
      return true;
    }
    return false;
  }
  _handleBrowseToolbarClick(target) {
    if (this._handleBrowsePanelToolbarClick(target)) return true;
    if (this._handleRecordingsBrowseToolbarClick(target)) return true;
    return false;
  }
  _handleBrowsePanelToolbarClick(target) {
    const filterBtn = target.closest("#filter-btn");
    if (filterBtn) {
      if (filterBtn.disabled) return true;
      this._toggleFilter();
      return true;
    }
    const calBtn = target.closest("#cal-btn");
    if (calBtn) {
      if (calBtn.disabled) return true;
      this._toggleCal();
      return true;
    }
    const controlsBtn = target.closest("#controls-btn");
    if (controlsBtn) {
      if (controlsBtn.disabled || controlsBtn.hidden) return true;
      if (this._tab === "controls") {
        this._setTab(this._resolveControlsReturnTab());
      } else {
        this._setTab("controls");
      }
      return true;
    }
    return false;
  }
  _handleRecordingsBrowseToolbarClick(target) {
    const recDayNav = target.closest("[data-rec-day-nav]");
    if (recDayNav) {
      const dir = Number(recDayNav.dataset.recDayNav || 0);
      if (dir) {
        void this._recordingsBrowseNavController.navigateDayAnimated(dir);
      }
      return true;
    }
    return false;
  }
  _handlePopupMediaToolbarClick(target) {
    if (target.closest("#popup-airplay-btn, #popup-media-airplay")) {
      void this._playbackTargetController.prompt(PLAYBACK_TARGET_AIRPLAY, {
        scope: "popup"
      });
      this._showPopupControlsTemporarily();
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
    return false;
  }
  _handleSidebarClick(target) {
    if (this._handlePreviewSidebarClick(target)) return true;
    if (this._handleSidebarNavigationClick(target)) return true;
    if (this._handleSidebarCameraClick(target)) return true;
    if (this._handleSidebarCalendarClick(target)) return true;
    if (this._handleSidebarFilterClick(target)) return true;
    return false;
  }
  _handleSidebarFilterClick(target) {
    return this._browseFilterController.handleSidebarFilterClick(target);
  }
  _handleSidebarCalendarClick(target) {
    return this._browseCalendarPanelController.handleSidebarCalendarClick(
      target
    );
  }
  _handleSidebarCameraClick(target) {
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
    return false;
  }
  _handleSidebarNavigationClick(target) {
    const pageRoute = target.closest("[data-page-route]");
    if (pageRoute) {
      this._pageNavigationController.navigateToPageRoute(
        pageRoute.dataset.pageRoute,
        {
          source: "page-nav"
        }
      );
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
    return false;
  }
  _handlePreviewSidebarClick(target) {
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
    return false;
  }
  _handleListClick(e, target) {
    this._pauseSlideshowForInteraction();
    if (this._handleControlsListClick(e, target)) return true;
    if (this._handlePrimaryListItemClick(e, target)) return true;
    if (this._handleListNavigationClick(e, target)) return true;
    return this._handleRecordingsListClick(e, target);
  }
  _handleRecordingsListClick(e, target) {
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
      this._popupMediaLoaderController.showRecording(
        +recRow.dataset.rs,
        +recRow.dataset.re
      );
      return true;
    }
    return false;
  }
  _handleListNavigationClick(e, target) {
    const circleBtn = target.closest("[data-tab]");
    if (circleBtn) {
      this._setTab(circleBtn.dataset.tab);
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
    return false;
  }
  _handlePrimaryListItemClick(e, target) {
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
      this._popupMediaLoaderController.showClipById(
        revOpen.dataset.reviewOpen,
        {
          mediaType: "alert",
          startTime: review?.start_time,
          camera: review?.camera
        }
      );
      return true;
    }
    return false;
  }
  _handleControlsListClick(e, target) {
    if (!isControlsReadoutClearTarget(target)) return false;
    e.stopPropagation();
    this._clearControlsReadout();
    return true;
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
    if (tab !== "controls") {
      this._lastNonControlsTab = tab;
    }
    this._pageShellRegionElements("tabs", "[data-tab]").forEach((p) => p.classList.toggle("active", p.dataset.tab === tab));
    const filterBtn = this._pageShellRegionElement("tools", "#filter-btn");
    if (filterBtn)
      filterBtn.disabled = tab === "recordings" || tab === "controls";
    if (tab === "recordings" || tab === "controls") {
      const filterPanel = this._pageShellRegion("filterPanel");
      if (filterPanel) filterPanel.style.display = "none";
    } else {
      this._browseFilterController.normalizeFilterSelections();
      if (this._pageShellRegion("filterPanel")?.style.display !== "none") {
        this._renderFilter();
      }
    }
    this._syncBrowseHeadModeClass();
    this._syncToolbarButtons();
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
  _availableNonControlsTabs() {
    const hidden = new Set(this._config?.hidden_tabs || []);
    const tabs = this._viewMode === "grid" ? ["alerts", "kept"] : ["alerts", "clips", "snapshot", "recordings", "kept"];
    return tabs.filter((tabId) => !hidden.has(tabId));
  }
  _resolveControlsReturnTab() {
    const available = this._availableNonControlsTabs();
    if (!available.length) return "alerts";
    if (available.includes(this._lastNonControlsTab)) {
      return this._lastNonControlsTab;
    }
    return available[0];
  }
  _resetBrowseScrollTop() {
    const list = this._pageShellRegionElement("browse", "#list");
    const browse = this._pageShellRegion("browse");
    if (list) list.scrollTop = 0;
    if (browse) browse.scrollTop = 0;
  }
  // ── playback ──────────────────────────────────────────────
  _allDisplayEvents() {
    return this._browseCollectionController.allDisplayEvents();
  }
  _findEventById(id) {
    return this._browseCollectionController.findEventById(id);
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
    if (this._recordingScrubController) {
      try {
        this._recordingScrubController.dispose();
      } catch (_) {
      }
    }
    this._recordingScrubController = null;
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
    return formatRecordingScrubTime(sec);
  }
  _closestRecordingAlertStart(targetSec, alerts, thresholdSec) {
    return resolveClosestRecordingAlertStart(targetSec, alerts, thresholdSec);
  }
  _resolveRecordingScrubTarget(ratio) {
    const state = this._recordingScrubState;
    if (!state?.video) return null;
    return resolveRecordingScrubTarget({
      ratio,
      start: state.start,
      end: state.end,
      alerts: state.alerts
    });
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
    if (!video) return false;
    return isRecordingSeekTargetInRange({
      targetSec,
      seekable: video.seekable,
      toleranceSec
    });
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
        finish(
          isRecordingSeekVerified({
            currentTime: video.currentTime,
            targetSec
          })
        );
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
        const plan = resolveRecordingSeekExecutionPlan({
          hasFastSeek: typeof video.fastSeek === "function",
          isEdge: this._isEdge(),
          isIOS
        });
        if (plan.shouldUseFastSeek) {
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
    const isFirefox = this._isFirefox();
    const isEdge = this._isEdge();
    const seekTimeout = resolveRecordingSeekTimeout({ isFirefox, isEdge });
    const seekOk = await this._attemptRecordingSeek(
      video,
      relTarget,
      seekTimeout
    );
    if (nonce !== state.seekNonce) return;
    const outcome = resolveRecordingSeekOutcome({
      isFirefox,
      isEdge,
      seekOk,
      currentTime: video.currentTime,
      relTarget,
      absTarget,
      start: state.start,
      end: state.end,
      resumeAfterScrub: state.resumeAfterScrub,
      isFallbackLoading: state.isFallbackLoading
    });
    if (outcome.shouldFallback) {
      state.isFallbackLoading = true;
      try {
        await this._popupMediaLoaderController.showRecording(
          outcome.fallbackStart,
          outcome.fallbackEnd
        );
      } finally {
        state.isFallbackLoading = false;
      }
      return;
    }
    if (outcome.shouldResumePlayback) {
      video.play?.().catch(() => {
      });
    }
  }
  async _fetchRecordingAlerts(clientId, cam, start, end) {
    const cacheKey = `${clientId}|${cam}|${Math.floor(start)}|${Math.floor(end)}`;
    if (this._recordingAlertCache.has(cacheKey)) {
      return this._recordingAlertCache.get(cacheKey);
    }
    const reviews = await this._browseWindowLoaderController.fetchWindowedReviews(
      clientId,
      cam,
      start,
      end
    );
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
    const decorations = buildRecordingScrubDecorations({
      start,
      end,
      alerts
    });
    const span = decorations.span;
    if (labelStart) labelStart.textContent = decorations.labelStart;
    if (labelEnd) labelEnd.textContent = decorations.labelEnd;
    if (labelNow) labelNow.textContent = decorations.labelNow;
    const tickLayer = ticks || markers;
    tickLayer.innerHTML = decorations.tickMarkup;
    markers.innerHTML = decorations.markerMarkup;
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
    this._recordingScrubState = state;
    this._setRecordingScrubCursor(start);
    this._recordingScrubController = new RecordingScrubController({
      track,
      video,
      ticks,
      markers,
      state,
      setCursor: (timeSec) => this._setRecordingScrubCursor(timeSec),
      seekToRatio: (ratio, options) => this._seekRecordingScrubToRatio(ratio, options)
    });
    this._recordingScrubController.bind();
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
    const hasSnapshot = ev?.has_snapshot ?? mediaType === "snapshot";
    const downloadActions = buildPopupInfoDownloadActions({
      id,
      mediaType,
      hasClip,
      hasSnapshot,
      recStart: opts.recStart,
      recEnd: opts.recEnd
    });
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
      downloadActions,
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
    const downloadButtons = (model.downloadActions || []).map((action) => {
      if (action.kind === "recording") {
        return `<button class="popup-action" data-rec-dl-start="${action.recStart}" data-rec-dl-end="${action.recEnd}" title="${action.label}" aria-label="${action.label}">${ICONS[action.icon] || ICONS.download}</button>`;
      }
      return `<button class="popup-action" data-dl="${action.id}" data-dl-file="${action.file}" title="${action.label}" aria-label="${action.label}">${ICONS[action.icon] || ICONS.download}</button>`;
    }).join("");
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
            <div class="popup-info-actions">${downloadButtons}</div>
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
    const popupControlsFsBtn = this._$("#popup-media-fs");
    const popupOpen = this._$("#myPopup")?.classList.contains("is-open");
    const isFullscreen = !!(document.fullscreenElement || document.webkitFullscreenElement);
    const inGridMode = this._viewMode === "grid";
    const visibility = resolveFullscreenButtonVisibility({
      popupOpen: !!popupOpen,
      isFullscreen,
      inGridMode,
      rotateOverlayMode: this._rotateOverlayMode
    });
    if (liveBtn) liveBtn.hidden = visibility.liveButtonHidden;
    if (popupControlsFsBtn)
      popupControlsFsBtn.hidden = visibility.popupControlsFullscreenHidden;
  }
  _open(id) {
    const ev = this._allDisplayEvents().find((e) => e.id === id) || (this._tab === "kept" ? (this._kept || []).find((e) => e.id === id) : null);
    if (!ev) return;
    if (this._tab === "kept") {
      if (ev.has_clip) {
        this._popupMediaLoaderController.showClip(ev, { mediaType: "kept" });
      } else {
        this._popupMediaLoaderController.showSnapshot(ev, {
          mediaType: "kept"
        });
      }
      return;
    }
    if (this._tab === "snapshot" || !ev.has_clip && ev.has_snapshot)
      this._popupMediaLoaderController.showSnapshot(ev);
    else if (ev.has_clip)
      this._popupMediaLoaderController.showClip(ev, {
        mediaType: this._tab === "kept" ? "kept" : "clip"
      });
    else this._popupMediaLoaderController.showSnapshot(ev);
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
  _ensurePopupAirPlayButton(mediaType = "") {
    const viewer = this._$("#viewer");
    if (!viewer) return;
    const existingControls = viewer.querySelector("#popup-playback-controls");
    if (this._usePopupCustomControls(mediaType) || !viewer.querySelector("video")) {
      existingControls?.remove();
      return;
    }
    let controls = existingControls;
    if (!controls) {
      controls = document.createElement("div");
      controls.className = "popup-playback-controls overlay-controls";
      controls.id = "popup-playback-controls";
      viewer.appendChild(controls);
    }
    controls.innerHTML = "";
    const button = document.createElement("button");
    button.className = "glass-btn popup-playback-btn";
    button.id = "popup-airplay-btn";
    button.type = "button";
    button.title = "AirPlay video";
    button.setAttribute("aria-label", "AirPlay video");
    button.hidden = true;
    button.innerHTML = ICONS.airplayVideo;
    controls.appendChild(button);
    this._syncPlaybackTargetButtons();
  }
  _clearPopupMediaCleanup() {
    this._clearPopupVideoZoom?.();
    if (this._popupControlsHideTimer) {
      clearTimeout(this._popupControlsHideTimer);
      this._popupControlsHideTimer = null;
    }
    if (this._popupMediaStopTimer) {
      clearTimeout(this._popupMediaStopTimer);
      this._popupMediaStopTimer = null;
    }
    if (this._popupMediaControlsController) {
      try {
        this._popupMediaControlsController.dispose();
      } catch (_) {
      }
    }
    this._popupMediaControlsController = null;
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
  _showLiveControlsTemporarily(ms = 2200) {
    const wrap = this._$("#live-stage.live-stage--overlay");
    if (!wrap) return;
    wrap.classList.add("live-controls-visible");
    if (this._liveControlsHideTimer) clearTimeout(this._liveControlsHideTimer);
    if (this._rotateOverlayMode !== "live") return;
    this._liveControlsHideTimer = setTimeout(
      () => {
        const nextWrap = this._$("#live-stage.live-stage--overlay");
        if (nextWrap && this._rotateOverlayMode === "live") {
          nextWrap.classList.remove("live-controls-visible");
        }
        this._liveControlsHideTimer = null;
      },
      Math.max(500, Number(ms) || 2200)
    );
  }
  _updatePopupMediaButtons(video) {
    const playBtn = this._$("#popup-media-play");
    const muteBtn = this._$("#popup-media-mute");
    const progress = this._$("#popup-media-progress");
    const time = this._$("#popup-media-time");
    if (!playBtn || !muteBtn || !progress || !time) return;
    const controlState = buildPopupMediaControlState({
      duration: video?.duration,
      currentTime: video?.currentTime,
      paused: video?.paused,
      muted: video?.muted,
      formatTime: (value) => this._fmtScrubTime(value)
    });
    progress.value = controlState.progressValue;
    playBtn.innerHTML = controlState.showPauseIcon ? ICONS.pause : ICONS.play;
    muteBtn.innerHTML = controlState.showMutedIcon ? ICONS.volOff : ICONS.volOn;
    time.textContent = controlState.timeText;
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
    const controlsPlan = resolvePopupMediaControlsInitPlan({
      shouldUseCustomControls: this._usePopupCustomControls(mediaType)
    });
    video.controls = controlsPlan.videoControlsEnabled;
    if (controlsPlan.removeVideoControlsAttribute) {
      video.removeAttribute("controls");
    }
    if (controlsPlan.setVideoControlsAttribute) {
      video.setAttribute("controls", "");
    }
    controls.hidden = controlsPlan.controlsHidden;
    if (controlsPlan.resetControlsHiddenClass) {
      controls.classList.remove("is-hidden");
    }
    if (!controlsPlan.shouldBindCustomControls) return;
    const progress = this._$("#popup-media-progress");
    const listenerPlan = resolvePopupMediaControlsListenerPlan({
      hasProgressControl: !!progress
    });
    const sync = () => {
      const playBtn = this._$("#popup-media-play");
      const muteBtn = this._$("#popup-media-mute");
      const time = this._$("#popup-media-time");
      const controlState = buildPopupMediaControlState({
        duration: video.duration,
        currentTime: video.currentTime,
        paused: video.paused,
        muted: video.muted,
        formatTime: (value) => this._fmtScrubTime(value)
      });
      if (playBtn)
        playBtn.innerHTML = controlState.showPauseIcon ? ICONS.pause : ICONS.play;
      if (muteBtn)
        muteBtn.innerHTML = controlState.showMutedIcon ? ICONS.volOff : ICONS.volOn;
      if (time) time.textContent = controlState.timeText;
    };
    const syncButtons = ({ progressDragging = false } = {}) => {
      sync();
      if (!progressDragging) this._updatePopupMediaButtons(video);
    };
    this._popupMediaControlsController = new PopupMediaControlsController({
      controls,
      progress,
      video,
      listenerPlan,
      onShowNow: () => {
        if (this._popupControlsHideTimer)
          clearTimeout(this._popupControlsHideTimer);
        controls.classList.remove("is-hidden");
      },
      onShowTemporarily: () => this._showPopupControlsTemporarily(),
      onSync: syncButtons
    });
    this._popupMediaControlsController.bind();
  }
  _carouselEventItem(ev, activeId = "") {
    if (!ev?.id) return "";
    const thumbFile = "thumbnail.jpg";
    const thumb = `<img src="${this._media(ev.id, thumbFile)}" loading="lazy" data-thumb-id="${ev.id}" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"><div class="tph" style="display:none">${ICONS.person}</div>`;
    return buildPopupCarouselItemMarkup({
      event: ev,
      activeId,
      thumbnailHtml: thumb,
      title: this._dateTimeLabel(ev.start_time || 0),
      label: cap(ev.label || "event"),
      time: this._time(ev.start_time || 0)
    });
  }
  _popupCarouselEvents(mediaType) {
    return buildPopupCarouselEvents({
      mediaType,
      kept: this._kept || [],
      reviews: this._reviews || [],
      displayEvents: this._allDisplayEvents(),
      findEventById: (id) => this._findEventById(id)
    });
  }
  _renderPopupCarousel(mediaType, activeId = "") {
    const wrap = this._$("#popup-carousel-wrap");
    const row = this._$("#popup-carousel");
    if (!wrap || !row) return;
    const contentPlan = buildPopupCarouselContentPlan({
      mediaType,
      events: this._popupCarouselEvents(mediaType),
      activeId,
      isTouchUi: this._isTouchPopupUi(),
      renderEvent: (ev, currentActiveId) => this._carouselEventItem(ev, currentActiveId)
    });
    if (contentPlan.shouldClear) {
      row.innerHTML = "";
    }
    wrap.hidden = contentPlan.hidden;
    if (!contentPlan.shouldRender) {
      return;
    }
    row.innerHTML = contentPlan.html;
    row.scrollLeft = 0;
    wrap.classList.toggle("touch", contentPlan.touch);
    requestAnimationFrame(() => {
      const active = row.querySelector(".popup-carousel-item.active");
      if (active) {
        const left = resolvePopupCarouselActiveScrollLeft({
          activeOffsetLeft: active.offsetLeft
        });
        row.scrollLeft = left;
      }
    });
  }
  _scrollPopupCarousel(dir = 1) {
    const row = this._$("#popup-carousel");
    if (!row) return;
    const item = row.querySelector(".popup-carousel-item");
    row.scrollBy(
      buildPopupCarouselScrollPlan({
        itemWidth: item?.getBoundingClientRect?.().width,
        dir
      })
    );
  }
  _media(id, file, dl) {
    return `/api/frigate/${this._cc().clientId}/notifications/${id}/${file}${dl ? "?download=true" : ""}`;
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
  _receiverPlaybackBaseUrl() {
    return this._hass?.config?.internal_url || this._hass?.config?.external_url || this._hass?.hassUrl?.("/") || (typeof window !== "undefined" ? window.location.href : "");
  }
  _playbackTargetContext(scope = "popup") {
    if (scope !== "popup") return null;
    const { clientId, cam } = this._cc();
    const mediaType = this._popupMediaType;
    const eventId = this._playing?.id || "";
    const event = eventId ? this._findEventById(eventId) : null;
    const recordingStart = this._recordingScrubState?.start ?? this._playing?.rec ?? null;
    const recordingEnd = this._recordingScrubState?.end ?? null;
    return {
      scope,
      sourceKey: mediaType === "recording" ? `recording:${clientId}:${cam}:${recordingStart}:${recordingEnd}` : `${mediaType}:${clientId}:${eventId}`,
      mediaType,
      clientId,
      camera: event?.camera || cam,
      eventId,
      recordingStart,
      recordingEnd,
      eventRecordingStart: Number.isFinite(Number(event?.start_time)) ? Math.floor(Number(event.start_time)) : null,
      eventRecordingEnd: Number.isFinite(Number(event?.end_time)) ? Math.ceil(Number(event.end_time)) : null,
      title: `${cap(mediaType || "video")} video`
    };
  }
  async _resolvePlaybackTargetSource(context = {}) {
    const media = buildFrigateReceiverMediaPath(context);
    if (!media.ok) return media;
    const signedPath = await this._signed(media.path);
    const url = resolveAbsoluteReceiverSourceUrl(
      signedPath || media.path,
      this._receiverPlaybackBaseUrl()
    );
    if (!url) {
      return {
        ok: false,
        message: "The receiver video URL could not be prepared."
      };
    }
    return {
      ok: true,
      url,
      contentType: media.contentType,
      title: context.title,
      ttlMs: 30 * 60 * 1e3
    };
  }
  _preparePopupPlaybackTarget() {
    if (!this._isPopupVideoMediaType(this._popupMediaType)) return;
    void this._playbackTargetController.prepare("popup");
    this._syncPlaybackTargetButtons();
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
    const ent = this._activeCam?.entity || "";
    const optimistic = buildFavoriteOptimisticMutation({
      id,
      event: ev,
      events: this._events,
      camCache: this._camCache,
      kept: this._kept,
      activeEntity: ent
    });
    this._events = optimistic.events;
    this._camCache = optimistic.camCache;
    this._kept = optimistic.kept;
    this._renderList();
    const { clientId } = this._cc();
    this._hass.callWS({
      type: "frigate/event/retain",
      instance_id: clientId,
      event_id: id,
      retain: optimistic.nextRetained
    }).catch((err) => {
      const rollback = buildFavoriteRollbackMutation({
        id,
        event: ev,
        previousRetained: optimistic.previousRetained,
        events: this._events,
        camCache: this._camCache,
        kept: this._kept,
        activeEntity: ent
      });
      this._events = rollback.events;
      this._camCache = rollback.camCache;
      this._kept = rollback.kept;
      this._renderList();
      console.warn("[Frigate] retain failed", err);
      this._toast("Could not save \u2014 check Frigate port config.");
    });
  }
  // ── browse / filter ───────────────────────────────────────
  _applyBrowse() {
    const b = this._pageShellRegion("browse");
    if (b) b.style.display = "flex";
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
    this._browseFilterController.toggleFilter();
  }
  _toggleCal() {
    this._browseCalendarPanelController.toggleCalendar();
  }
  // ── calendar ──────────────────────────────────────────────
  _formatTzDateString(parts) {
    return this._browseCalendarPanelController.formatTzDateString(parts);
  }
  _calendarTodayDateString() {
    return this._browseCalendarPanelController.calendarTodayDateString();
  }
  _activeCalendarDayDateString() {
    return this._browseCalendarPanelController.activeCalendarDayDateString();
  }
  _goTodayInCalendar() {
    this._browseCalendarPanelController.goTodayInCalendar();
  }
  _createCalendarMonthDate(year, monthIndex) {
    return this._browseCalendarPanelController.createCalendarMonthDate(
      year,
      monthIndex
    );
  }
  _resolveCalendarMonthDate() {
    return this._browseCalendarPanelController.resolveCalendarMonthDate();
  }
  _calNav(d) {
    this._browseCalendarPanelController.calNav(d);
  }
  _pickDay(ds) {
    this._browseCalendarPanelController.pickDay(ds);
  }
  _renderCal() {
    this._browseCalendarPanelController.renderCal();
  }
  _renderFilter() {
    this._browseFilterController.renderFilter();
  }
  // ── render ────────────────────────────────────────────────
  _syncStatus() {
    this._activeStandardPageController().syncStatus();
  }
  // Cached querySelector — avoids repeated DOM lookups on every render tick
  _$(sel) {
    const cached = this._domCache[sel];
    if (cached?.isConnected) return cached;
    const next = this.shadowRoot.querySelector(sel);
    this._domCache[sel] = next;
    return next;
  }
  _pageShellRegion(regionKey) {
    const regionName = PAGE_SHELL_REGIONS[regionKey];
    if (!regionName) return null;
    return this._$(`[data-fvc-region="${regionName}"]`);
  }
  _pageShellRegionElement(regionKey, selector) {
    return this._pageShellRegion(regionKey)?.querySelector?.(selector) || null;
  }
  _pageShellRegionElements(regionKey, selector) {
    return this._pageShellRegion(regionKey)?.querySelectorAll?.(selector) || [];
  }
  _renderAll() {
    if (this._isPreviewPageActive()) {
      this._renderPreviewPage();
      return;
    }
    this._syncTwoWayTalkRuntimeState();
    this._renderStats();
    this._renderMuteButton();
    this._syncTwoWayTalkButton();
    this._syncFullscreenButtonsVisibility();
    this._syncToolbarButtons();
    this._syncPlaybackTargetButtons();
    this._renderLegend();
    this._renderSubtitle();
    this._renderCamSwitcher();
    this._renderList();
    this._syncStatus();
  }
  _renderStats() {
    this._activeStandardPageController().renderStats();
  }
  _subtitleText() {
    return this._activeStandardPageController().subtitleText();
  }
  _renderSubtitle() {
    this._activeStandardPageController().renderSubtitle();
  }
  _renderLegend() {
    this._activeStandardPageController().renderLegend();
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
    return this._activeStandardPageController().listHeadingLabel(ts);
  }
  _showStickyDayHeaders() {
    return this._activeStandardPageController().showStickyDayHeaders();
  }
  _renderListLabel(ts = null) {
    this._activeStandardPageController().renderListLabel(ts);
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
    return this._activeStandardPageController().renderStickyDaySections(
      items,
      renderItem
    );
  }
  _renderEventsContent(items) {
    return this._activeStandardPageController().renderEventsContent(items);
  }
  _renderKeptContent(items) {
    return this._activeStandardPageController().renderKeptContent(items);
  }
  _renderReviewsContent(items) {
    return this._activeStandardPageController().renderReviewsContent(items);
  }
  _syncBrowseHeadFromScroll() {
    this._activeStandardPageController().syncBrowseHeadFromScroll();
  }
  _syncOlderHint(forceHide = null) {
    this._activeStandardPageController().syncOlderHint(forceHide);
  }
  _dur(ev) {
    return Math.max(
      1,
      Math.round((ev.end_time || Date.now() / 1e3) - ev.start_time)
    );
  }
  _eventCardHTML(ev, expanded, compact = false) {
    const showDownloadButtons = !(this._isLikelyMobileClient() && ["alerts", "clips", "snapshot"].includes(this._tab));
    const model = buildEventListItemModel(ev, {
      cap,
      labelColor,
      icons: ICONS,
      media: (id, file) => this._media(id, file),
      durationLabel: (value) => this._dur(value),
      dateTimeLabel: (ts) => this._dateTimeLabel(ts),
      isKeptTab: this._tab === "kept",
      showDownloadButtons,
      showCameraLabel: (this._eventsMode === "all" || this._isGridMixedListMode()) && this._config.cameras.length > 1
    });
    return buildEventListItemHtml(model, {
      icons: ICONS,
      expanded,
      compact
    });
  }
  _setListHtmlIfChanged(list, html) {
    return this._activeStandardPageController().setListHtmlIfChanged(
      list,
      html
    );
  }
  _renderList() {
    this._activeStandardPageController().renderList();
  }
  _renderControlsSection(list) {
    void this._ensureActiveCameraPtzInfo();
    this._renderListLabel();
    const ptzInfo = this._activeCameraPtzInfo();
    const ptzConfigured = hasCameraPtz(this._activeCam);
    const panTiltEnabled = ptzConfigured && hasPtzPanTiltCapability(ptzInfo);
    const zoomEnabled = ptzConfigured && hasPtzZoomCapability(ptzInfo);
    const focusEnabled = ptzConfigured && hasPtzFocusCapability(ptzInfo);
    this._setListHtmlIfChanged(
      list,
      buildControlsSectionMarkup({
        cameraName: cap(camDisplayName(this._activeCam || {})),
        ptzReady: panTiltEnabled || zoomEnabled || focusEnabled,
        panTiltEnabled,
        zoomEnabled,
        focusEnabled
      })
    );
    this._renderControlsReadout();
  }
  _activeCameraHasPtz() {
    return canCameraUsePtz(this._activeCam, this._activeCameraPtzInfo());
  }
  _activeCameraPtzInfo() {
    return this._cc().ptzInfo || null;
  }
  _activeCameraPtzInfoLoading() {
    return !!this._cc().ptzInfoPromise;
  }
  async _ensureActiveCameraPtzInfo() {
    const entity = this._activeCam?.entity;
    if (!entity || !hasCameraPtz(this._activeCam)) return null;
    return this._ensurePtzInfoForEntity(entity);
  }
  async _ensurePtzInfoForEntity(entity) {
    const targetEntity = String(entity || "").trim();
    if (!targetEntity) return null;
    if (!this._camCache[targetEntity]) {
      this._camCache[targetEntity] = mkCamState();
    }
    const cache = this._camCache[targetEntity];
    if (cache.ptzInfoFetched) return cache.ptzInfo;
    if (cache.ptzInfoPromise) return cache.ptzInfoPromise;
    await this._discoverOne(targetEntity);
    if (!cache.discovered || !cache.clientId || !cache.cam) {
      cache.ptzInfoFetched = true;
      return null;
    }
    cache.ptzInfoPromise = (async () => {
      try {
        const result = await this._ws({
          type: "frigate/ptz/info",
          instance_id: cache.clientId,
          camera: cache.cam
        });
        cache.ptzInfo = Array.isArray(result) ? result[0] || null : result || null;
      } catch (error) {
        console.warn("[Frigate] PTZ info fetch failed", error);
        cache.ptzInfo = null;
      } finally {
        cache.ptzInfoFetched = true;
        cache.ptzInfoPromise = null;
        this._camCache[targetEntity] = cache;
        if (this._tab === "controls" && this._activeCam?.entity === targetEntity) {
          this._renderList();
        }
      }
      return cache.ptzInfo;
    })();
    return cache.ptzInfoPromise;
  }
  async _handleCirclePadPtzEvent(event, eventType) {
    if (!isControlsPadTarget(event)) return;
    await this._handlePtzAction(event?.detail?.action, eventType);
  }
  async _handlePtzAction(action, eventType) {
    const ptzInfo = this._activeCameraPtzInfo() || await this._ensureActiveCameraPtzInfo();
    const plan = resolvePtzServicePlan({
      camera: this._activeCam,
      ptzInfo,
      ptzContext: {
        clientId: this._cc().clientId,
        cameraName: this._cc().cam
      },
      action,
      eventType
    });
    if (!plan) {
      if (eventType === "press") {
        this._appendControlsReadoutEntry(
          resolvePtzEmptyStateMessage(this._activeCam, ptzInfo, {
            loading: this._activeCameraPtzInfoLoading()
          })
        );
      }
      return;
    }
    this._appendControlsReadoutEntry(plan.readout);
    try {
      const executeRequest = async (request) => {
        if (request?.type !== "home_assistant_service") {
          throw new Error(
            `Unsupported PTZ request type: ${request?.type || "unknown"}`
          );
        }
        return this._hass?.callService(
          request.domain,
          request.service,
          request.serviceData,
          request.target
        );
      };
      if (plan.executionMode === "parallel") {
        await Promise.all(
          plan.requests.map((request) => executeRequest(request))
        );
      } else {
        for (let index = 0; index < plan.requests.length; index += 1) {
          await executeRequest(plan.requests[index]);
        }
      }
    } catch (error) {
      console.warn("[Frigate] PTZ call failed", error);
      this._appendControlsReadoutEntry("[ptz:error]");
    }
  }
  async _handlePtzControlPointerDown(event) {
    const button = event.target?.closest?.("[data-ptz-control]");
    if (!(button instanceof HTMLButtonElement) || button.disabled) return;
    const action = String(button.dataset.ptzControl || "").trim();
    if (!action) return;
    event.preventDefault();
    this._activePtzButtonAction = action;
    this._activePtzButtonPointerId = typeof event.pointerId === "number" ? event.pointerId : null;
    try {
      button.setPointerCapture?.(event.pointerId);
    } catch (_) {
    }
    await this._handlePtzAction(action, "press");
  }
  async _handlePtzControlPointerStop(event) {
    if (!this._activePtzButtonAction) return;
    if (typeof event.pointerId === "number" && this._activePtzButtonPointerId != null && event.pointerId !== this._activePtzButtonPointerId) {
      return;
    }
    const action = this._activePtzButtonAction;
    this._activePtzButtonAction = "";
    this._activePtzButtonPointerId = null;
    await this._handlePtzAction(action, "release");
  }
  _appendControlsReadoutEntry(text) {
    this._controlsReadoutLines = appendControlsReadoutLine(
      this._controlsReadoutLines,
      text,
      200
    );
    this._renderControlsReadout();
  }
  _clearControlsReadout() {
    this._controlsReadoutLines = clearControlsReadoutLines();
    this._renderControlsReadout();
  }
  _escapeControlsReadoutText(value) {
    return String(value || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }
  _renderControlsReadout() {
    const el = this._$("#controls-readout-lines");
    if (!el) return;
    el.innerHTML = resolveControlsReadoutMarkup(
      this._controlsReadoutLines,
      (line) => this._escapeControlsReadoutText(line),
      resolvePtzEmptyStateMessage(
        this._activeCam,
        this._activeCameraPtzInfo(),
        {
          loading: this._activeCameraPtzInfoLoading()
        }
      )
    );
    if (!this._controlsReadoutLines.length) return;
    el.scrollTop = el.scrollHeight;
  }
  _reviewListItemHTML(review) {
    const model = buildReviewListItemModel(review, {
      cap,
      icons: ICONS,
      resolveSourceEvent: (value) => this._browseFilterController.reviewSourceEvent(value),
      findEventById: (id) => this._findEventById(id),
      media: (id, file) => this._media(id, file),
      dateTimeLabel: (ts) => this._dateTimeLabel(ts),
      showDownloadButtons: !this._isLikelyMobileClient()
    });
    return buildReviewListItemHtml(model, { cap, icons: ICONS });
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

// src/config/card-config.js
const normalizeCameras = (config) => {
  let cameras = [];
  if (Array.isArray(config?.cameras)) {
    cameras = config.cameras;
  } else if (config?.camera_entity) {
    cameras = [
      {
        entity: config.camera_entity,
        name: config.title || "",
        connection_type: DEFAULT_CAMERA_CONNECTION_TYPE
      }
    ];
  }
  return cameras.map((camera) => normalizeCameraConfig2(camera, { fallbackName: "" })).filter((camera) => camera.entity).slice(0, MAX_CAMERAS);
};
const normalizeCardConfig = (config) => {
  const src = config && typeof config === "object" ? { ...config } : {};
  const cameras = normalizeCameras(src);
  if (Array.isArray(src.hidden_tabs)) {
    src.hidden_tabs = src.hidden_tabs.map((id) => id === "reviews" ? "alerts" : id).filter((id) => ALLOWED_HIDDEN_TABS.includes(id));
  }
  delete src.camera_entity;
  src.theme = src.theme === "custom" ? "custom" : "default";
  if (src.theme_custom && typeof src.theme_custom === "object") {
    src.theme_custom = Object.fromEntries(
      Object.entries(src.theme_custom).filter(([key]) => THEME_CUSTOM_KEYS.has(key)).map(([key, value]) => [key, normalizeHexColor2(value)]).filter(([, value]) => !!value)
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
  src.snapshot_update_seconds = normalizeBoundedPositiveInteger(
    src.snapshot_update_seconds,
    SNAPSHOT_UPDATE_SECONDS,
    10,
    240
  );
  src.mobile_poll_battery_saver = src.mobile_poll_battery_saver === true;
  src.slideshow_rotation_enabled = src.slideshow_rotation_enabled === true;
  src.slideshow_rotation_seconds = SLIDESHOW_ROTATION_OPTIONS_SECONDS.includes(
    Number(src.slideshow_rotation_seconds)
  ) ? Number(src.slideshow_rotation_seconds) : 30;
  src.slideshow_alert_hold_seconds = normalizeBoundedPositiveInteger(
    src.slideshow_alert_hold_seconds,
    Math.round(SLIDESHOW_ALERT_HOLD_MS / 1e3),
    5,
    60
  );
  src.grid_mode_enabled = src.grid_mode_enabled === true;
  src.grid_start_in_grid_enabled = src.grid_start_in_grid_enabled === true;
  src.grid_live_view_enabled = src.grid_live_view_enabled !== false;
  src.grid_alert_hold_seconds = normalizeBoundedPositiveInteger(
    src.grid_alert_hold_seconds,
    Math.round(GRID_ALERT_HOLD_MS / 1e3),
    5,
    60
  );
  src.mobile_view_page_enabled = src.mobile_view_page_enabled === true;
  src.preview_page_enabled = src.preview_page_enabled === true;
  src.preview_page_live_cameras = src.preview_page_live_cameras === true;
  src.preview_page_show_title_bars = src.preview_page_show_title_bars !== false;
  src.preview_page_alert_live_duration_seconds = normalizeBoundedPositiveInteger(
    src.preview_page_alert_live_duration_seconds,
    10,
    5,
    60
  );
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
  src.alerts_reviews_days = normalizePositiveInteger3(
    src.alerts_reviews_days,
    normalizePositiveInteger3(src.window_days, 3)
  );
  delete src.wide_view;
  return { ...src, cameras };
};

// src/editor/FrigateViewCardEditor.js
const FrigateViewCardEditor = class extends HTMLElement {
  _cameraStateAttributes(entity) {
    const targetEntity = String(entity || "").trim();
    if (!targetEntity) return {};
    return this._hass?.states?.[targetEntity]?.attributes || {};
  }
  _cameraCapabilityTokens(attrs = {}) {
    const tokens = [];
    const pushTokens = (value) => {
      if (Array.isArray(value)) {
        value.forEach((entry) => pushTokens(entry));
        return;
      }
      if (typeof value === "string") {
        tokens.push(value);
      }
    };
    pushTokens(attrs?.features);
    pushTokens(attrs?.capabilities);
    pushTokens(attrs?.actions);
    pushTokens(attrs?.supported_features_list);
    return tokens.map(
      (value) => String(value || "").trim().toLowerCase()
    );
  }
  _hasBooleanCapability(attrs = {}, keys = []) {
    return keys.some((key) => attrs?.[key] === true);
  }
  _hasTokenCapability(attrs = {}, allowedTokens = []) {
    const allowed = new Set(allowedTokens);
    return this._cameraCapabilityTokens(attrs).some(
      (token) => allowed.has(token)
    );
  }
  _hasHaDirectPtzCapability(attrs = {}) {
    if (this._hasBooleanCapability(attrs, [
      "ptz",
      "ptz_supported",
      "supports_ptz",
      "can_ptz",
      "can_pan_tilt"
    ])) {
      return true;
    }
    return this._hasTokenCapability(attrs, [
      "ptz",
      "pt",
      "pt-r",
      "pan",
      "tilt",
      "zoom"
    ]);
  }
  _hasHaDirectTwoWayTalkCapability(attrs = {}) {
    if (this._hasBooleanCapability(attrs, [
      "two_way_talk",
      "twoWayTalk",
      "supports_two_way_talk",
      "two_way_audio",
      "supports_two_way_audio",
      "audio_output",
      "audio_out",
      "talk",
      "microphone"
    ])) {
      return true;
    }
    return this._hasTokenCapability(attrs, [
      "talk",
      "two_way_talk",
      "two-way-talk",
      "two_way_audio",
      "audio_output",
      "audio-out",
      "audio_out",
      "mic",
      "microphone",
      "speaker",
      "backchannel"
    ]);
  }
  _ensurePtzCapabilityCache() {
    if (!(this._ptzCapabilityCache instanceof Map)) {
      this._ptzCapabilityCache = new Map();
    }
  }
  _ensureGo2RtcMetadataCache() {
    if (!(this._go2rtcMetadataCache instanceof Map)) {
      this._go2rtcMetadataCache = new Map();
    }
  }
  _cameraEntityCapabilityLookupContext(entity) {
    const state = this._hass?.states?.[entity];
    if (!state) return null;
    const attrs = state.attributes || {};
    const instanceId = attrs.client_id || attrs.mqtt_client_id || "";
    const cameraName4 = attrs.camera_name || entity.replace(/^camera\./, "");
    if (!instanceId || !cameraName4) return null;
    return { instanceId, cameraName: cameraName4 };
  }
  async _fetchPtzCapabilityForEntity(entity) {
    const targetEntity = String(entity || "").trim();
    if (!targetEntity || !this._hass?.callWS) return null;
    this._ensurePtzCapabilityCache();
    const cached = this._ptzCapabilityCache.get(targetEntity);
    if (cached?.resolved) return cached.info;
    if (cached?.promise) return cached.promise;
    const context = this._cameraEntityCapabilityLookupContext(targetEntity);
    if (!context) {
      const empty = { resolved: true, info: null, promise: null };
      this._ptzCapabilityCache.set(targetEntity, empty);
      return null;
    }
    const entry = { resolved: false, info: null, promise: null };
    entry.promise = (async () => {
      try {
        const result = parseWs(
          await this._hass.callWS({
            type: "frigate/ptz/info",
            instance_id: context.instanceId,
            camera: context.cameraName
          })
        );
        entry.info = Array.isArray(result) ? result[0] || null : result || null;
      } catch (error) {
        console.warn("[Frigate] Editor PTZ info fetch failed", error);
        entry.info = null;
      } finally {
        entry.resolved = true;
        entry.promise = null;
      }
      return entry.info;
    })();
    this._ptzCapabilityCache.set(targetEntity, entry);
    return entry.promise;
  }
  async _fetchGo2RtcStreamMetadataForEntity(entity) {
    const targetEntity = String(entity || "").trim();
    if (!targetEntity || !this._hass?.callWS) return null;
    this._ensureGo2RtcMetadataCache();
    const cached = this._go2rtcMetadataCache.get(targetEntity);
    if (cached?.resolved) return cached.info;
    if (cached?.promise) return cached.promise;
    const context = this._cameraEntityCapabilityLookupContext(targetEntity);
    if (!context) {
      const empty = { resolved: true, info: null, promise: null };
      this._go2rtcMetadataCache.set(targetEntity, empty);
      return null;
    }
    const entry = { resolved: false, info: null, promise: null };
    entry.promise = (async () => {
      try {
        const path = `/api/frigate/${encodeURIComponent(context.instanceId)}/go2rtc/api/streams?src=${encodeURIComponent(context.cameraName)}&video=all&audio=all&microphone`;
        const signed = await this._hass.callWS({
          type: "auth/sign_path",
          path,
          expires: 3600
        });
        const signedPath = signed?.path || path;
        const response = await fetch(`${window.location.origin}${signedPath}`, {
          method: "GET",
          cache: "no-store",
          credentials: "same-origin"
        });
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        entry.info = await response.json();
      } catch (error) {
        console.warn("[Frigate] Editor go2rtc metadata fetch failed", error);
        entry.info = null;
      } finally {
        entry.resolved = true;
        entry.promise = null;
      }
      return entry.info;
    })();
    this._go2rtcMetadataCache.set(targetEntity, entry);
    return entry.promise;
  }
  _setCameraModalPtzSpeedOutput(value) {
    const output = this.querySelector("#camera-modal-ptz-speed-output");
    if (!output) return;
    const numeric = Number(value);
    output.textContent = Number.isFinite(numeric) ? `Current speed: ${numeric.toFixed(1)}` : "Current speed: 0.5";
  }
  _setRangeValueOutput(selector, value, suffix = "") {
    const output = this.querySelector(`${selector}-output`);
    if (!output) return;
    const numeric = Number(value);
    output.textContent = Number.isFinite(numeric) ? `${numeric}${suffix}` : output.textContent;
  }
  _syncCameraModalPtzVisibility({
    supported = false,
    loading = false,
    sourceType = DEFAULT_CAMERA_CONNECTION_TYPE,
    preserveSelection = false
  } = {}) {
    const toggleRow = this.querySelector("#camera-modal-ptz-toggle-row");
    const configRow = this.querySelector("#camera-modal-ptz-config");
    const stateMessage = this.querySelector("#camera-modal-ptz-state");
    const ptzEnabled = this.querySelector("#camera-modal-ptz-enabled");
    const speedRow = this.querySelector("#camera-modal-ptz-speed-row");
    if (toggleRow) {
      toggleRow.style.display = supported || loading ? "block" : "none";
    }
    if (ptzEnabled) {
      ptzEnabled.disabled = !supported || loading;
      ptzEnabled.dataset.supported = supported ? "true" : "false";
      if (!supported && !loading && !preserveSelection)
        ptzEnabled.checked = false;
    }
    const sourceLabel = normalizeCameraConnectionType2(sourceType) === "ha_direct" ? "Home Assistant" : "Frigate";
    if (stateMessage) {
      if (loading) {
        stateMessage.style.display = "block";
        stateMessage.textContent = `Checking ${sourceLabel} PTZ support for this camera.`;
      } else if (!supported) {
        stateMessage.style.display = "block";
        stateMessage.textContent = `${sourceLabel} did not report PTZ pan/tilt support for this camera.`;
      } else {
        stateMessage.style.display = "none";
        stateMessage.textContent = "";
      }
    }
    const showConfig = (supported || loading) && ptzEnabled?.checked === true;
    if (configRow) configRow.style.display = showConfig ? "block" : "none";
    if (speedRow) speedRow.style.display = showConfig ? "block" : "none";
  }
  _syncCameraModalTwoWayTalkVisibility({
    supported = false,
    loading = false,
    sourceType = DEFAULT_CAMERA_CONNECTION_TYPE,
    preserveSelection = false
  } = {}) {
    const twoWayTalkToggleRow = this.querySelector(
      "#camera-modal-two-way-talk-toggle-row"
    );
    const twoWayTalkEnabled = this.querySelector(
      "#camera-modal-two-way-talk-enabled"
    );
    const twoWayTalkStateMessage = this.querySelector(
      "#camera-modal-two-way-talk-state"
    );
    const sourceLabel = normalizeCameraConnectionType2(sourceType) === "ha_direct" ? "Home Assistant" : "Frigate";
    const showToggle = supported || loading || preserveSelection;
    const allowSelection = supported || preserveSelection;
    if (twoWayTalkToggleRow) {
      twoWayTalkToggleRow.style.display = showToggle ? "block" : "none";
    }
    if (twoWayTalkStateMessage) {
      if (loading) {
        twoWayTalkStateMessage.style.display = "block";
        twoWayTalkStateMessage.textContent = `Checking ${sourceLabel} two-way talk support for this camera.`;
      } else if (!supported) {
        twoWayTalkStateMessage.style.display = "block";
        twoWayTalkStateMessage.textContent = `${sourceLabel} did not report two-way talk support for this camera.`;
      } else {
        twoWayTalkStateMessage.style.display = "none";
        twoWayTalkStateMessage.textContent = "";
      }
    }
    if (twoWayTalkEnabled) {
      twoWayTalkEnabled.dataset.supported = supported ? "true" : "false";
      twoWayTalkEnabled.disabled = !allowSelection || loading;
      if (!supported && !loading && !preserveSelection) {
        twoWayTalkEnabled.checked = false;
      }
    }
  }
  async _refreshCameraModalPtzSupport() {
    const entity = this._cameraModalEntityValue();
    const sourceType = this._cameraModalConnectionTypeValue();
    const normalizedSourceType = normalizeCameraConnectionType2(sourceType);
    const isHaDirect = normalizedSourceType === "ha_direct";
    if (!entity) {
      this._syncCameraModalPtzVisibility({
        supported: false,
        loading: false,
        sourceType: normalizedSourceType
      });
      return;
    }
    if (isHaDirect) {
      const attrs = this._cameraStateAttributes(entity);
      const ptzSupported2 = this._hasHaDirectPtzCapability(attrs);
      this._syncCameraModalPtzVisibility({
        supported: ptzSupported2,
        loading: false,
        sourceType: normalizedSourceType,
        preserveSelection: ptzSupported2
      });
      return;
    }
    this._syncCameraModalPtzVisibility({
      supported: false,
      loading: true,
      sourceType: normalizedSourceType,
      preserveSelection: true
    });
    const token = (this._cameraModalPtzToken || 0) + 1;
    this._cameraModalPtzToken = token;
    const ptzInfo = await this._fetchPtzCapabilityForEntity(entity);
    if (this._cameraModalPtzToken !== token) return;
    const ptzSupported = hasPtzPanTiltCapability(ptzInfo);
    this._syncCameraModalPtzVisibility({
      supported: ptzSupported,
      loading: false,
      sourceType: normalizedSourceType,
      preserveSelection: ptzSupported
    });
  }
  async _refreshCameraModalTwoWayTalkSupport() {
    const entity = this._cameraModalEntityValue();
    const sourceType = this._cameraModalConnectionTypeValue();
    const normalizedSourceType = normalizeCameraConnectionType2(sourceType);
    const isHaDirect = normalizedSourceType === "ha_direct";
    if (!entity) {
      this._syncCameraModalTwoWayTalkVisibility({
        supported: false,
        loading: false,
        sourceType: normalizedSourceType
      });
      return;
    }
    if (isHaDirect) {
      const attrs = this._cameraStateAttributes(entity);
      const twoWayTalkSupported2 = this._hasHaDirectTwoWayTalkCapability(attrs);
      this._syncCameraModalTwoWayTalkVisibility({
        supported: twoWayTalkSupported2,
        loading: false,
        sourceType: normalizedSourceType,
        preserveSelection: twoWayTalkSupported2
      });
      return;
    }
    this._syncCameraModalTwoWayTalkVisibility({
      supported: false,
      loading: true,
      sourceType: normalizedSourceType,
      preserveSelection: true
    });
    const token = (this._cameraModalTwoWayTalkToken || 0) + 1;
    this._cameraModalTwoWayTalkToken = token;
    const go2rtcStreamInfo = await this._fetchGo2RtcStreamMetadataForEntity(entity);
    if (this._cameraModalTwoWayTalkToken !== token) return;
    const twoWayTalkSupported = hasTwoWayTalkCapability(go2rtcStreamInfo);
    this._syncCameraModalTwoWayTalkVisibility({
      supported: twoWayTalkSupported,
      loading: false,
      sourceType: normalizedSourceType,
      preserveSelection: twoWayTalkSupported
    });
  }
  _normalizeHiddenTabs(hiddenTabs) {
    if (!Array.isArray(hiddenTabs)) return [];
    return hiddenTabs.map((id) => id === "reviews" ? "alerts" : id).filter((id) => ALLOWED_HIDDEN_TABS.includes(id));
  }
  _syncHiddenTabsDraftFromConfig(config = this._config) {
    this._hiddenTabsDraft = this._normalizeHiddenTabs(config?.hidden_tabs);
  }
  _isTabVisibleFromEvent(event) {
    const detailValue = event?.detail?.value;
    if (typeof detailValue === "boolean") return detailValue;
    const target = event?.currentTarget || event?.target;
    return resolveSwitchChecked(target);
  }
  _setHiddenTabFromToggle(tabId, isVisible) {
    if (!ALLOWED_HIDDEN_TABS.includes(tabId)) return;
    const hidden = new Set(this._normalizeHiddenTabs(this._hiddenTabsDraft));
    if (isVisible) hidden.delete(tabId);
    else hidden.add(tabId);
    this._hiddenTabsDraft = [...hidden];
  }
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
    this._syncHiddenTabsDraftFromConfig(normalized);
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
    if (this._ptzCapabilityCache instanceof Map) {
      this._ptzCapabilityCache.clear();
    }
    if (this._go2rtcMetadataCache instanceof Map) {
      this._go2rtcMetadataCache.clear();
    }
    const modeKey = this._hass?.themes?.darkMode ? "dark" : "light";
    const key = `${this._frigateEntities().join(",")}|${modeKey}`;
    if (key !== this._lastEntityKey) {
      this._lastEntityKey = key;
      if (this._rendered) this._render();
    }
  }
  _normalizeConfig(config) {
    return normalizeCardConfig(config);
  }
  _landingPageOptionSignature(config) {
    const normalized = this._normalizeConfig(config);
    const desktop = getEnabledPageRoutes(
      normalized,
      DEVICE_ROUTE_BUCKETS.desktop
    ).join("|");
    const mobile = getEnabledPageRoutes(
      normalized,
      DEVICE_ROUTE_BUCKETS.mobile
    ).join("|");
    return `${desktop}::${mobile}`;
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
    const hex = normalizeHexColor2(cssValue);
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
      const v = normalizeHexColor2(custom[key]);
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
    return normalizeCameraConnectionType2(value) === "ha_direct" ? "HA direct" : "Frigate go2rtc";
  }
  _cameraAlertsContentLabel(value) {
    return normalizeAlertsAreaContent2(value) === "all_reviews" ? "All reviews" : "Alerts only";
  }
  _cameraDesktopHlsLabel(value) {
    return normalizeDisableHlsDesktop2(value) ? "Desktop HLS off" : "Desktop HLS on";
  }
  _cameraPtzLabel(value) {
    return hasCameraPtz({ ptz: value }) ? "PTZ on" : "PTZ off";
  }
  _cameraTwoWayTalkLabel(value) {
    return value === true ? "Two-way talk on" : "Two-way talk off";
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
      disable_hls_desktop: false,
      ptz: null
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
    const ptzEnabled = this.querySelector("#camera-modal-ptz-enabled");
    const ptzSpeed = this.querySelector("#camera-modal-ptz-speed");
    const twoWayTalkEnabled = this.querySelector(
      "#camera-modal-two-way-talk-enabled"
    );
    const helper = this.querySelector("#camera-modal-helper");
    const normalizedPtz = normalizeCameraPtzConfig(cam?.ptz);
    const selectedConnectionType = normalizeCameraConnectionType2(
      cam?.connection_type
    );
    if (title) title.textContent = index == null ? "Add" : "Edit";
    if (save) save.textContent = index == null ? "Add" : "Save";
    if (name) name.value = cam?.name || "";
    if (entity) {
      entity.value = cam?.entity || "";
      entity.dataset.value = cam?.entity || "";
    }
    if (connectionType) {
      const nextType = normalizeCameraConnectionType2(cam?.connection_type);
      connectionType.value = nextType;
      connectionType.dataset.value = nextType;
    }
    if (alertsContentAllReviews) {
      alertsContentAllReviews.checked = normalizeAlertsAreaContent2(cam?.alerts_content) === "all_reviews";
    }
    if (disableHlsDesktop) {
      disableHlsDesktop.checked = normalizeDisableHlsDesktop2(cam?.disable_hls_desktop) === true;
    }
    if (ptzEnabled) {
      ptzEnabled.checked = hasCameraPtz(cam);
    }
    if (ptzSpeed) {
      ptzSpeed.value = String(normalizedPtz?.speed ?? 0.5);
      this._setCameraModalPtzSpeedOutput(ptzSpeed.value);
    }
    if (twoWayTalkEnabled) {
      twoWayTalkEnabled.checked = cam?.two_way_talk === true;
    }
    if (helper) helper.textContent = "";
    if (modal) modal.classList.remove("hidden");
    this._syncCameraModalPtzVisibility({
      supported: hasCameraPtz(cam),
      loading: !!cam?.entity,
      sourceType: selectedConnectionType,
      preserveSelection: hasCameraPtz(cam)
    });
    this._syncCameraModalTwoWayTalkVisibility({
      supported: false,
      loading: !!cam?.entity,
      sourceType: selectedConnectionType,
      preserveSelection: cam?.two_way_talk === true
    });
    void this._refreshCameraModalPtzSupport();
    void this._refreshCameraModalTwoWayTalkSupport();
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
  _cameraModalConnectionTypeValue() {
    const connectionType = this.querySelector("#camera-modal-connection-type");
    return normalizeCameraConnectionType2(
      connectionType?.dataset?.value || connectionType?.value || DEFAULT_CAMERA_CONNECTION_TYPE
    );
  }
  _saveCameraModal() {
    const entity = this._cameraModalEntityValue();
    const name = (this.querySelector("#camera-modal-name")?.value || "").toString();
    const connectionType = normalizeCameraConnectionType2(
      this.querySelector("#camera-modal-connection-type")?.dataset?.value || this.querySelector("#camera-modal-connection-type")?.value || DEFAULT_CAMERA_CONNECTION_TYPE
    );
    const alertsContentToggle = this.querySelector("#camera-modal-all-reviews");
    const disableHlsDesktopToggle = this.querySelector(
      "#camera-modal-disable-hls-desktop"
    );
    const ptzEnabledToggle = this.querySelector("#camera-modal-ptz-enabled");
    const twoWayTalkToggle = this.querySelector(
      "#camera-modal-two-way-talk-enabled"
    );
    const alertsContent = resolveSwitchChecked(alertsContentToggle) === true ? "all_reviews" : "alerts_only";
    const disableHlsDesktop = resolveSwitchChecked(disableHlsDesktopToggle);
    const ptzSupported = ptzEnabledToggle?.dataset?.supported === "true";
    const ptzEnabled = ptzSupported && resolveSwitchChecked(ptzEnabledToggle);
    const ptzSpeed = this.querySelector("#camera-modal-ptz-speed")?.value || "0.5";
    const twoWayTalkEnabled = resolveSwitchChecked(twoWayTalkToggle);
    const ptz = ptzEnabled ? normalizeCameraPtzConfig({
      enabled: true,
      speed: ptzSpeed
    }) : null;
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
        disable_hls_desktop: disableHlsDesktop,
        ptz,
        ...twoWayTalkEnabled ? { two_way_talk: true } : {}
      });
    } else if (cur[this._editingCamIndex]) {
      cur[this._editingCamIndex] = {
        entity,
        name,
        connection_type: connectionType,
        alerts_content: alertsContent,
        disable_hls_desktop: disableHlsDesktop,
        ptz,
        ...twoWayTalkEnabled ? { two_way_talk: true } : {}
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
  _wireLivePreviewUpdates() {
    if (this._livePreviewHooksBound) return;
    const previewUpdateSelectors = [
      "#title",
      "#subtitle",
      "#window_days",
      "#alerts_reviews_days",
      "#realtime_poll_seconds",
      "#snapshot_update_seconds",
      "#slideshow_rotation_enabled",
      "#slideshow_rotation_seconds",
      "#slideshow_alert_hold_seconds",
      "#grid_mode_enabled",
      "#grid_start_in_grid_enabled",
      "#grid_live_view_enabled",
      "#grid_rotation_seconds",
      "#grid_alert_hold_seconds",
      "#mobile_view_page_enabled",
      "#preview_page_enabled",
      "#preview_page_live_cameras",
      "#preview_page_alert_live_duration_seconds",
      "#preview_page_show_title_bars",
      "#wide_view_page_enabled",
      "#landing_page",
      "#mobile_page",
      "#stream_height",
      "#stream_height_unit",
      "#col_left_width_pct",
      "#tight_margins",
      "#shadows",
      "#borders",
      "#rounded_corners",
      "#outer_shadows",
      "#mobile_poll_battery_saver",
      "[data-active-tab]",
      "[data-theme-option]",
      "[data-theme-color]",
      "[data-theme-reset]",
      "[data-theme-default]"
    ];
    const shouldPreviewUpdate = (event) => {
      const path = Array.isArray(event.composedPath?.()) ? event.composedPath() : [];
      return path.some(
        (node) => node instanceof Element && previewUpdateSelectors.some((selector) => node.matches?.(selector))
      );
    };
    const handlePreviewUpdate = (event) => {
      if (!shouldPreviewUpdate(event)) return;
      if (this._livePreviewRaf) return;
      this._livePreviewRaf = requestAnimationFrame(() => {
        this._livePreviewRaf = 0;
        this._u({ dispatch: false, preview: true });
      });
    };
    ["input", "change", "value-changed", "selected-changed", "click"].forEach(
      (eventName) => {
        this.addEventListener(eventName, handlePreviewUpdate, true);
      }
    );
    this._livePreviewHooksBound = true;
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
    const hiddenTabs = new Set(
      this._normalizeHiddenTabs(
        this._hiddenTabsDraft ?? this._config?.hidden_tabs
      )
    );
    this._ensureThemeDraftCache();
    const activeTheme = this._config?.theme === "custom" ? "custom" : "default";
    const themeCustom = this._config?.theme_custom || {};
    const themeCustomDefaults = this._config?.theme_custom_defaults || {};
    const pageRouteLabel = (pageId) => {
      if (pageId === PAGE_IDS.mobileView) return "Mobile";
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
      const saved = normalizeHexColor2(themeCustom[key]);
      const draft = normalizeHexColor2(this._themeDraftCache?.[key]);
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
        <div><div class="cam-name">${this._cameraLabel(cam)}</div><div class="cam-meta">${this._cameraConnectionLabel(cam.connection_type)} \xB7 ${this._cameraAlertsContentLabel(cam.alerts_content)} \xB7 ${this._cameraDesktopHlsLabel(cam.disable_hls_desktop)} \xB7 ${this._cameraPtzLabel(cam.ptz)} \xB7 ${this._cameraTwoWayTalkLabel(cam.two_way_talk)}</div></div>
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
        <div class="layout-row" style="align-items:flex-start;gap:12px;flex-wrap:wrap;justify-content:flex-start;margin-top:12px">
          <div id="snapshot_update_row" style="min-width:210px;display:flex;flex-direction:column;gap:6px;width:100%">
            <span class="field-label" style="margin:0">Snapshot Update Frequency</span>
            <input id="snapshot_update_seconds" type="range" min="10" max="240" step="1" value="${this._config?.snapshot_update_seconds ?? SNAPSHOT_UPDATE_SECONDS}" style="width:100%">
            <div class="field-helper">When Live View is disabled for a page, this determines how often a new snapshot is loaded.</div>
            <div class="field-helper" id="snapshot_update_seconds-output">${this._config?.snapshot_update_seconds ?? SNAPSHOT_UPDATE_SECONDS} seconds</div>
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
        <div class="layout-row" style="align-items:flex-start;gap:12px;flex-wrap:wrap;justify-content:flex-start;margin-top:12px">
          <div id="slideshow_alert_hold_row" style="min-width:210px;display:flex;flex-direction:column;gap:6px;width:100%">
            <span class="field-label" style="margin:0">Slideshow Alert Hold Duration</span>
            <input id="slideshow_alert_hold_seconds" type="range" min="5" max="60" step="1" value="${this._config?.slideshow_alert_hold_seconds ?? Math.round(SLIDESHOW_ALERT_HOLD_MS / 1e3)}" style="width:100%">
            <div class="field-helper" id="slideshow_alert_hold_seconds-output">${this._config?.slideshow_alert_hold_seconds ?? Math.round(SLIDESHOW_ALERT_HOLD_MS / 1e3)} seconds</div>
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
      <div id="preview_alert_live_duration_row" class="section" style="display:${this._config?.preview_page_live_cameras ? "none" : "block"}">
        <div class="layout-row" style="align-items:flex-start;gap:12px;flex-wrap:wrap;justify-content:flex-start">
          <div style="min-width:210px;display:flex;flex-direction:column;gap:6px;width:100%">
            <span class="field-label" style="margin:0">Preview Alert Live Duration</span>
            <input id="preview_page_alert_live_duration_seconds" type="range" min="5" max="60" step="1" value="${this._config?.preview_page_alert_live_duration_seconds ?? 10}" style="width:100%">
            <div class="field-helper" id="preview_page_alert_live_duration_seconds-output">${this._config?.preview_page_alert_live_duration_seconds ?? 10} seconds</div>
          </div>
        </div>
      </div>
      <div class="section">
        <div class="layout-row">
          <span class="field-label" style="margin:0">Show Title Bars</span>
          <ha-switch id="preview_page_show_title_bars" ${this._config?.preview_page_show_title_bars !== false ? "checked" : ""}></ha-switch>
        </div>
        <div class="field-helper">Shows per-camera metadata under each preview tile (name, source, events, and online status).</div>
      </div>`;
    const gridAlertHoldSeconds = this._config?.grid_alert_hold_seconds ?? Math.round(GRID_ALERT_HOLD_MS / 1e3);
    const slideshowAlertHoldSeconds = this._config?.slideshow_alert_hold_seconds ?? Math.round(SLIDESHOW_ALERT_HOLD_MS / 1e3);
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
    const mobileViewPanelContent = `
      <div class="section" style="border-top:none;padding-top:0">
        <div class="layout-row">
          <span class="field-label" style="margin:0">Enable Mobile View Page</span>
          <ha-switch id="mobile_view_page_enabled" ${this._config?.mobile_view_page_enabled ? "checked" : ""}></ha-switch>
        </div>
        <div class="field-helper">When enabled, Mobile appears in navigation and as a landing page option for both desktop/tablet and phone devices.</div>
      </div>`;
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
        <div class="layout-row" style="align-items:flex-start;gap:12px;flex-wrap:wrap;justify-content:flex-start;margin-top:12px">
          <div id="grid_alert_hold_row" style="min-width:210px;display:flex;flex-direction:column;gap:6px;width:100%">
            <span class="field-label" style="margin:0">Grid Alert Hold Duration</span>
            <input id="grid_alert_hold_seconds" type="range" min="5" max="60" step="1" value="${gridAlertHoldSeconds}" style="width:100%">
            <div class="field-helper" id="grid_alert_hold_seconds-output">${gridAlertHoldSeconds} seconds</div>
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
        ${this._renderSettingsPanel({ id: "mobileview", title: "Mobile View", icon: "mdi:cellphone", content: mobileViewPanelContent, active: activeSettingsPanel === "mobileview" })}
        ${this._renderSettingsPanel({ id: "landing", title: "Landing Page", icon: "mdi:home-import-outline", content: landingPanelContent, active: activeSettingsPanel === "landing" })}
      </div>`;
    this.innerHTML = `<style>
          :host{
                --editor-primary-bg: var(--primary-background-color);
                --editor-secondary-bg: var(--secondary-background-color);
                --editor-card-bg: var(--card-background-color);
                --editor-text: var(--primary-text-color);
                --editor-muted: var(--secondary-text-color);
                --editor-primary: var(--primary-color);
                --editor-primary-d: var(--dark-primary-color);
                --editor-primary-l: var(--light-primary-color);
                --editor-border: var(--divider-color);
                --editor-border-width: var(--ha-card-border-width);
                --editor-shadow: var(--ha-card-box-shadow);
                --editor-icon: var(--icon-color, var(--secondary-text-color));
              --c-bg-main: var(--editor-primary-bg);
              --c-bg-panel: var(--editor-card-bg);
              --c-text: var(--editor-text);
              --c-text2: var(--editor-muted);
              --c-text-rev: var(--text-primary-color);
              --c-border: var(--editor-border);
              --c-border2: var(--divider-color, var(--editor-border));
              --c-primary: var(--editor-primary);
              --c-accent: var(--accent-color, var(--editor-primary));
              --c-alert: var(--error-color);
            }
            .ed-wrap{
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
            .cam-modal-card{width:min(640px,calc(100vw - 24px));background:var(--editor-card-bg);color:var(--editor-text);border:var(--editor-border-width) solid var(--editor-border);border-radius:16px;padding:16px;box-shadow:var(--editor-shadow);}
            .cam-modal-card ha-input,
            .cam-modal-card ha-selector,
            .cam-modal-card ha-switch{--ha-card-background:var(--editor-card-bg);}
            .cam-modal-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;}
            .cam-modal-title{width:36px;height:36px;display:grid;place-items:center;font-size:24px;line-height:1;color:var(--editor-text);cursor:pointer;border:1px solid var(--c-border2);border-radius:999px;background:var(--editor-secondary-bg);}
            .cam-modal-title:hover{background:var(--editor-primary-l);}
            .cam-modal-label{font-size:12px;font-weight:600;color:var(--editor-text);margin-bottom:6px;display:block;}
            .cam-modal-field{margin-bottom:8px;}
            .cam-modal-foot{display:flex;justify-content:flex-end;gap:8px;margin-top:8px;}
            .cam-btn{border:1px solid var(--c-border2);border-radius:999px;background:var(--editor-secondary-bg);color:var(--editor-text);font-weight:600;cursor:pointer;padding:8px 14px;}
            .cam-btn:hover{background:var(--editor-primary-l);border-color:var(--editor-primary);}
            .cam-btn.primary{background:var(--editor-primary);color:var(--text-primary-color);border-color:var(--editor-primary);padding:8px 18px;}
            .cam-btn.primary:hover{background:var(--editor-primary-d);border-color:var(--editor-primary-d);}
            .cam-modal-helper{font-size:11px;color:var(--error-color);min-height:16px;}

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
          <div class="cam-modal-field">
            <div id="camera-modal-ptz-toggle-row">
            <div class="layout-row" style="justify-content:flex-start;gap:8px">
              <span class="cam-modal-label" style="margin:0">Enable PTZ Controls</span>
              <ha-switch id="camera-modal-ptz-enabled"></ha-switch>
            </div>
            <div class="field-helper">Turns on circle-pad PTZ for this camera using the Frigate Home Assistant integration PTZ service.</div>
            </div>
            <div class="field-helper" id="camera-modal-ptz-state" style="display:none"></div>
          </div>
          <div class="cam-modal-field" id="camera-modal-ptz-config" style="display:none">
            <div class="cam-modal-field" id="camera-modal-ptz-speed-row" style="padding:0">
              <span class="cam-modal-label">Move Speed</span>
              <input id="camera-modal-ptz-speed" type="range" min="0.1" max="1" step="0.1" value="0.5" style="width:100%">
              <div class="field-helper" id="camera-modal-ptz-speed-output">Current speed: 0.5</div>
            </div>
          </div>
          <div class="cam-modal-field" id="camera-modal-two-way-talk-toggle-row" style="display:none">
            <div class="layout-row" style="justify-content:flex-start;gap:8px">
              <span class="cam-modal-label" style="margin:0">Enable Two-way Talk</span>
              <ha-switch id="camera-modal-two-way-talk-enabled"></ha-switch>
            </div>
            <div class="field-helper">Only shown when Frigate reports talk support for this camera.</div>
          </div>
          <div class="field-helper" id="camera-modal-two-way-talk-state" style="display:none"></div>
          <div class="cam-modal-helper" id="camera-modal-helper"></div>
          <div class="cam-modal-foot">
            <button type="button" id="camera-modal-cancel" class="cam-btn">Cancel</button>
            <button type="button" id="camera-modal-save" class="cam-btn primary">Add</button>
          </div>
        </div>
      </div>
    </div>`;
    const update = () => this._u({ dispatch: false, preview: true });
    const scheduleUpdate = () => {
      if (this._previewUpdateRaf) return;
      this._previewUpdateRaf = requestAnimationFrame(() => {
        this._previewUpdateRaf = 0;
        update();
      });
    };
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
      normalize: (value) => normalizeCameraConnectionType2(value)
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
    this.querySelector("#camera-modal-entity")?.addEventListener(
      "value-changed",
      () => {
        void this._refreshCameraModalPtzSupport();
        void this._refreshCameraModalTwoWayTalkSupport();
      }
    );
    this.querySelector("#camera-modal-entity")?.addEventListener(
      "change",
      () => {
        void this._refreshCameraModalPtzSupport();
        void this._refreshCameraModalTwoWayTalkSupport();
      }
    );
    this.querySelector("#camera-modal-connection-type")?.addEventListener(
      "value-changed",
      () => {
        void this._refreshCameraModalPtzSupport();
        void this._refreshCameraModalTwoWayTalkSupport();
      }
    );
    this.querySelector("#camera-modal-connection-type")?.addEventListener(
      "change",
      () => {
        void this._refreshCameraModalPtzSupport();
        void this._refreshCameraModalTwoWayTalkSupport();
      }
    );
    this.querySelector("#camera-modal-ptz-enabled")?.addEventListener(
      "value-changed",
      () => this._syncCameraModalPtzVisibility({
        supported: this.querySelector("#camera-modal-ptz-enabled")?.dataset?.supported === "true",
        sourceType: this._cameraModalConnectionTypeValue(),
        loading: false
      })
    );
    this.querySelector("#camera-modal-ptz-enabled")?.addEventListener(
      "change",
      () => this._syncCameraModalPtzVisibility({
        supported: this.querySelector("#camera-modal-ptz-enabled")?.dataset?.supported === "true",
        sourceType: this._cameraModalConnectionTypeValue(),
        loading: false
      })
    );
    this.querySelector("#camera-modal-ptz-speed")?.addEventListener(
      "input",
      (event) => {
        this._setCameraModalPtzSpeedOutput(event.currentTarget?.value);
      }
    );
    [
      "#snapshot_update_seconds",
      "#slideshow_alert_hold_seconds",
      "#grid_alert_hold_seconds",
      "#preview_page_alert_live_duration_seconds"
    ].forEach((selector) => {
      this.querySelector(selector)?.addEventListener("input", (event) => {
        this._setRangeValueOutput(
          selector,
          event.currentTarget?.value,
          " seconds"
        );
      });
    });
    this._wireCameraDragAndDrop();
    this._wireSettingsPanels();
    this._wireEditorDialogActions();
    this._wireLivePreviewUpdates();
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
        "mobile_view_page_enabled",
        "shadows",
        "borders",
        "rounded_corners",
        "outer_shadows",
        "mobile_poll_battery_saver",
        "snapshot_update_seconds",
        "slideshow_rotation_enabled",
        "grid_mode_enabled",
        "grid_start_in_grid_enabled",
        "grid_live_view_enabled",
        "slideshow_alert_hold_seconds",
        "grid_alert_hold_seconds",
        "preview_page_enabled",
        "preview_page_live_cameras",
        "preview_page_alert_live_duration_seconds",
        "preview_page_show_title_bars"
      ],
      events: ["input", "change", "value-changed"],
      handler: () => {
        const slideshowRow = this.querySelector("#slideshow_rotation_row");
        const previewDurationRow = this.querySelector(
          "#preview_alert_live_duration_row"
        );
        const enabled = this.querySelector("#slideshow_rotation_enabled")?.checked === true;
        const gridRow = this.querySelector("#grid_rotation_row");
        const gridStartRow = this.querySelector("#grid_start_row");
        const gridLiveRow = this.querySelector("#grid_live_row");
        const gridEnabled = this.querySelector("#grid_mode_enabled")?.checked === true;
        const liveCamerasEnabled = this.querySelector("#preview_page_live_cameras")?.checked === true;
        if (slideshowRow)
          slideshowRow.style.display = enabled ? "flex" : "none";
        if (previewDurationRow)
          previewDurationRow.style.display = liveCamerasEnabled ? "none" : "block";
        if (gridStartRow)
          gridStartRow.style.display = gridEnabled ? "flex" : "none";
        if (gridLiveRow)
          gridLiveRow.style.display = gridEnabled ? "flex" : "none";
        if (gridRow)
          gridRow.style.display = gridEnabled && cams.length > 4 ? "flex" : "none";
        scheduleUpdate();
      }
    });
    bindEventsForSelectorAll({
      root: this,
      selector: "[data-active-tab]",
      events: ["change", "value-changed"],
      handler: (event) => {
        const tabId = event.currentTarget?.dataset?.activeTab;
        if (!tabId) return;
        const isVisible = this._isTabVisibleFromEvent(event);
        this._setHiddenTabFromToggle(tabId, isVisible);
        scheduleUpdate();
      }
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
      connection_type: normalizeCameraConnectionType2(c?.connection_type),
      alerts_content: normalizeAlertsAreaContent2(c?.alerts_content),
      disable_hls_desktop: normalizeDisableHlsDesktop2(
        c?.disable_hls_desktop
      ),
      ptz: normalizeCameraPtzConfig(c?.ptz),
      ...c?.two_way_talk === true ? { two_way_talk: true } : {}
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
    const prevOptionSignature = this._landingPageOptionSignature(this._config);
    const nextConfig = buildEditorConfigFromDom({
      root: this,
      baseConfig: this._config,
      cameras,
      themeDraftCache: this._themeDraftCache,
      hiddenTabsOverride: this._hiddenTabsDraft
    });
    const normalizedNextConfig = this._normalizeConfig(nextConfig);
    const nextOptionSignature = this._landingPageOptionSignature(normalizedNextConfig);
    this._config = normalizedNextConfig;
    this._syncHiddenTabsDraftFromConfig(normalizedNextConfig);
    if (preview) {
      this._hasVisualDraft = true;
      this._emitPreviewDraft(createEditorPreviewDraft(normalizedNextConfig));
    }
    if (prevOptionSignature !== nextOptionSignature) {
      this._render();
      return;
    }
    if (dispatch) this._dispatch();
  }
  _dispatch() {
    const cameras = this._getCams();
    this._config = this._normalizeConfig(
      buildEditorConfigFromDom({
        root: this,
        baseConfig: this._config,
        cameras,
        themeDraftCache: this._themeDraftCache,
        hiddenTabsOverride: this._hiddenTabsDraft
      })
    );
    this._syncHiddenTabsDraftFromConfig(this._config);
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

// src/features/live/stream.element.js
const LIVE_STREAM_HOST_TAG = "frigate-live-stream";
const FrigateLiveStreamElement = class extends HTMLElement {
  constructor() {
    super();
    this._orchestrator = null;
  }
  attachOrchestrator(orchestrator) {
    if (this._orchestrator && this._orchestrator !== orchestrator) {
      void this._orchestrator.stop().catch(() => {
      });
    }
    this._orchestrator = orchestrator || null;
  }
  clearOrchestrator(orchestrator = null) {
    if (!orchestrator || this._orchestrator === orchestrator) {
      this._orchestrator = null;
    }
  }
  disconnectedCallback() {
    if (!this._orchestrator) return;
    void this._orchestrator.stop().catch(() => {
    });
    this._orchestrator = null;
  }
};
const registerLiveStreamHostElement = () => {
  if (!customElements.get(LIVE_STREAM_HOST_TAG)) {
    customElements.define(LIVE_STREAM_HOST_TAG, FrigateLiveStreamElement);
  }
};

// src/index.js
if (!customElements.get(CARD_TAG))
  customElements.define(CARD_TAG, FrigateViewCard);
if (!customElements.get(CARD_TAG + "-editor"))
  customElements.define(CARD_TAG + "-editor", FrigateViewCardEditor);
registerLiveStreamHostElement();
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
