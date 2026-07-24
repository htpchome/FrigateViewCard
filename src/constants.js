export const VERSION = "1.0.814";

export const CARD_TAG = "frigate-view-card";
export const DAY = 86400;
export const RECORDINGS_WINDOW = 24 * 3600;
export const EVENT_FETCH_BATCH = 100;
export const INITIAL_EVENT_FETCH_LIMIT = 20;
export const INACTIVE_WARM_EVENT_LIMIT = 5;
export const REVIEW_FETCH_BATCH = 100;
export const WINDOW_FETCH_PAGE_LIMIT = 10;
export const INITIAL_EVENTS_PAGE_LIMIT = 1;
export const WINDOW_BACKGROUND_PAGE_LIMIT = 4;
export const REALTIME_HEAD_POLL_MS = 5000;
export const REALTIME_RELOAD_DEBOUNCE_MS = 450;
export const REALTIME_POLL_OPTIONS_SECONDS = Object.freeze([2, 5, 10, 15]);
export const MOBILE_BATTERY_SAVER_POLL_SECONDS = 10;
export const SLIDESHOW_ROTATION_OPTIONS_SECONDS = Object.freeze([
  10, 20, 30, 60,
]);
export const GRID_ROTATION_OPTIONS_SECONDS = Object.freeze([10, 20, 30, 60]);
export const SLIDESHOW_ALERT_HOLD_MS = 10000;
export const SLIDESHOW_REVIEW_FRESHNESS_GRACE_SEC = 10;
export const SLIDESHOW_REVIEW_WATCH_MIN_MS = 1500;
export const SLIDESHOW_REVIEW_WATCH_MAX_MS = 15000;
export const PREVIEW_ALERT_HOLD_MS = 6000;
export const PREVIEW_ALERT_END_GRACE_MS = 3500;
export const MSE_SWITCH_GRACE_MS = 20000;
export const MSE_SWITCH_GRACE_MAX = 3;
export const MAX_CAMERAS = 8;
export const DEFAULT_CAMERA_CONNECTION_TYPE = "frigate_go2rtc";
export const ALLOWED_HIDDEN_TABS = [
  "alerts",
  "clips",
  "snapshot",
  "recordings",
  "kept",
];
export const THEME_DEFAULTS = Object.freeze({
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
  "--c-bg-alert": "#dc3146",
});
export const THEME_CUSTOM_ROWS = Object.freeze([
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
  { key: "--c-bg-alert", label: "Scrub Bar Alerts" },
]);
export const THEME_CUSTOM_KEYS = new Set(
  THEME_CUSTOM_ROWS.map((row) => row.key),
);
