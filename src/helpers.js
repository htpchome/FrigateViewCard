import {
  VERSION,
  CARD_TAG,
  DAY,
  RECORDINGS_WINDOW,
  EVENT_FETCH_BATCH,
  INITIAL_EVENT_FETCH_LIMIT,
  INACTIVE_WARM_EVENT_LIMIT,
  REVIEW_FETCH_BATCH,
  WINDOW_FETCH_PAGE_LIMIT,
  INITIAL_EVENTS_PAGE_LIMIT,
  WINDOW_BACKGROUND_PAGE_LIMIT,
  REALTIME_HEAD_POLL_MS,
  REALTIME_RELOAD_DEBOUNCE_MS,
  REALTIME_POLL_OPTIONS_SECONDS,
  MOBILE_BATTERY_SAVER_POLL_SECONDS,
  SLIDESHOW_ROTATION_OPTIONS_SECONDS,
  GRID_ROTATION_OPTIONS_SECONDS,
  SLIDESHOW_ALERT_HOLD_MS,
  SLIDESHOW_REVIEW_FRESHNESS_GRACE_SEC,
  SLIDESHOW_REVIEW_WATCH_MIN_MS,
  SLIDESHOW_REVIEW_WATCH_MAX_MS,
  LANDING_ALERT_HOLD_MS,
  LANDING_ALERT_END_GRACE_MS,
  MSE_SWITCH_GRACE_MS,
  MSE_SWITCH_GRACE_MAX,
  MAX_CAMERAS,
  DEFAULT_CAMERA_CONNECTION_TYPE,
  ALLOWED_HIDDEN_TABS,
  THEME_DEFAULTS,
  THEME_CUSTOM_ROWS,
  THEME_CUSTOM_KEYS,
} from "./constants.js";

export function detectDeviceProfile() {
  const nav = typeof navigator !== "undefined" ? navigator : {};
  const win = typeof window !== "undefined" ? window : {};
  const userAgent = String(nav.userAgent || "").toLowerCase();
  const platform = String(
    nav.userAgentData?.platform || nav.platform || "",
  ).toLowerCase();
  const maxTouchPoints = Number(nav.maxTouchPoints || 0);
  const primaryPointerCoarse = !!win.matchMedia?.("(pointer: coarse)")?.matches;
  const anyPointerCoarse = !!win.matchMedia?.("(any-pointer: coarse)")?.matches;
  const hoverNone = !!win.matchMedia?.("(hover: none)")?.matches;
  const hasTouch =
    maxTouchPoints > 0 || primaryPointerCoarse || anyPointerCoarse || hoverNone;
  const isAndroid =
    platform.includes("android") || userAgent.includes("android");
  const isIPhone = /iphone/.test(userAgent);
  const isMobileHint =
    nav.userAgentData?.mobile === true || /mobile|mobi/.test(userAgent);
  const isIPad =
    /ipad/.test(userAgent) ||
    (platform.includes("mac") && maxTouchPoints > 1 && hasTouch);
  const isIPod = /ipod/.test(userAgent);
  const isIOS = isIPhone || isIPad || isIPod;
  const isTablet = isIPad || (isAndroid && hasTouch && !isMobileHint);
  const isPhone = (isIOS || isAndroid) && !isTablet;
  const isMobile = isPhone || isTablet;

  return {
    hasTouch,
    hasPrimaryTouch: primaryPointerCoarse,
    hasAnyTouch: anyPointerCoarse || hoverNone,
    isAndroid,
    isIOS,
    isPhone,
    isTablet,
    isMobile,
    isDesktop: !isMobile,
    os: isAndroid ? "Android" : isIOS ? "iOS" : "Desktop/Other",
  };
}

export const DEVICE_PROFILE = detectDeviceProfile();
export const isIOS = DEVICE_PROFILE.isIOS;
export const isAndroid = DEVICE_PROFILE.isAndroid;
// ── helpers ──────────────────────────────────────────────────
export function cap(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
}
export function parseWs(r) {
  if (typeof r === "string") {
    try {
      return JSON.parse(r);
    } catch (_) {
      return [];
    }
  }
  return r;
}

export function normalizePositiveInteger(value, fallback) {
  const parsed = parseInt(String(value ?? "").trim(), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export function normalizeCameraConnectionType(value) {
  const type = String(value ?? "")
    .trim()
    .toLowerCase();
  if (type === "ha_direct" || type === "ha" || type === "home_assistant") {
    return "ha_direct";
  }
  return DEFAULT_CAMERA_CONNECTION_TYPE;
}

export function normalizeAlertsAreaContent(value) {
  const mode = String(value ?? "")
    .trim()
    .toLowerCase();
  return mode === "all_reviews" ? "all_reviews" : "alerts_only";
}

export function normalizeDisableHlsDesktop(value) {
  return value === true;
}

export function normalizeHexColor(value) {
  const s = String(value || "")
    .trim()
    .toLowerCase();
  if (/^#[0-9a-f]{6}$/.test(s)) return s;
  if (/^#[0-9a-f]{3}$/.test(s)) {
    return `#${s[1]}${s[1]}${s[2]}${s[2]}${s[3]}${s[3]}`;
  }
  return "";
}

export const DIALOG_ACTION_SELECTOR =
  '[slot="primaryAction"], [slot="secondaryAction"], mwc-button, ha-button, button';

export const resolveActiveTab = (currentTab, hiddenTabIds, tabOrder) => {
  if (!hiddenTabIds.has(currentTab) && tabOrder.includes(currentTab)) {
    return currentTab;
  }
  return (
    tabOrder.find((id) => !hiddenTabIds.has(id)) || tabOrder[0] || "alerts"
  );
};

export const setSettingsPanelActiveState = (panels, activePanel) => {
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

export const dialogActionKindFromElement = (button) => {
  if (!(button instanceof Element)) return null;

  const explicitSlot = button.getAttribute?.("slot") || "";
  if (explicitSlot === "primaryAction") return "primary";
  if (explicitSlot === "secondaryAction") return "secondary";

  const actionAttr = (
    button.getAttribute?.("dialogAction") ||
    button.getAttribute?.("dialog-action") ||
    ""
  )
    .toString()
    .trim()
    .toLowerCase();
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

export const dialogActionKindFromEvent = (event) => {
  const path = Array.isArray(event.composedPath?.())
    ? event.composedPath()
    : [];
  if (path.some((node) => node?.id === "camera-modal")) return null;
  const button = path.find(
    (node) => node instanceof Element && node.matches?.(DIALOG_ACTION_SELECTOR),
  );
  if (!(button instanceof Element)) return null;
  return dialogActionKindFromElement(button);
};

export const wireCameraRowDragAndDrop = ({
  rows,
  clearDropTargets,
  onReorder,
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
        event.dataTransfer?.getData("text/plain") || "-1",
      );
      const toIndex = Number(row.dataset.row || "-1");
      onReorder(fromIndex, toIndex);
    });
  });
};

export const setFieldErrorState = (root, selector, message) => {
  const field = root.querySelector(selector);
  if (!field) return;
  field.toggleAttribute("data-invalid", !!message);
  const helper = root.querySelector(`${selector}-helper`);
  if (helper) {
    helper.textContent = message || "";
    helper.classList.toggle("error", !!message);
  }
};

export const bindNumericInputField = ({ root, selector, onSanitize }) => {
  const field = root.querySelector(selector);
  if (!field) return;

  const sanitize = () => {
    const clean = String(field.value || "").replace(/[^0-9]/g, "");
    if (field.value !== clean) field.value = clean;
    onSanitize?.();
  };

  const restrictKey = (event) => {
    if (
      event.ctrlKey ||
      event.metaKey ||
      event.altKey ||
      [
        "Backspace",
        "Delete",
        "Tab",
        "Enter",
        "ArrowLeft",
        "ArrowRight",
        "ArrowUp",
        "ArrowDown",
        "Home",
        "End",
      ].includes(event.key)
    ) {
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

export const bindSelectorSyncEvents = (element, syncValue) => {
  if (!element || typeof syncValue !== "function") return;
  element.addEventListener("value-changed", syncValue);
  element.addEventListener("selected-changed", syncValue);
  element.addEventListener("change", syncValue);
};

export const setupSelectSelector = ({
  element,
  hass,
  options,
  initialValue,
  fallbackValue,
  normalize = (value) => value,
  onChange,
}) => {
  if (!element) return;
  element.hass = hass;
  element.selector = {
    select: {
      mode: "dropdown",
      options,
    },
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

export const setupEntitySelector = ({
  element,
  hass,
  domain,
  label,
  onChange,
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

export const bindThemeControlEvents = ({
  root,
  update,
  themeDraftCache,
  resolveDefaultHex,
}) => {
  root.querySelectorAll("[data-theme-option]").forEach((button) => {
    button.addEventListener("pointerdown", (event) => {
      // Prevent panel header handlers from receiving pointer events.
      event.stopPropagation();
    });
    button.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      const selectedTheme =
        event.currentTarget?.dataset?.themeOption || "default";
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

export const bindClickHandler = ({ root, selector, handler }) => {
  root.querySelector(selector)?.addEventListener("click", handler);
};

export const bindClickHandlers = (root, bindings) => {
  bindings.forEach((binding) => bindClickHandler({ root, ...binding }));
};

export const bindEachClickHandler = ({ root, selector, handler }) => {
  root.querySelectorAll(selector).forEach((element) => {
    element.addEventListener("click", (event) => handler(event, element));
  });
};

export const bindEventsForIds = ({ root, ids, events, handler }) => {
  ids.forEach((id) => {
    const element = root.querySelector(`#${id}`);
    if (!element) return;
    events.forEach((eventName) => {
      element.addEventListener(eventName, (event) =>
        handler(event, element, id),
      );
    });
  });
};

export const bindEventsForSelectorAll = ({
  root,
  selector,
  events,
  handler,
}) => {
  root.querySelectorAll(selector).forEach((element) => {
    events.forEach((eventName) => {
      element.addEventListener(eventName, (event) =>
        handler(event, element, selector),
      );
    });
  });
};

export const buildEditorConfigFromDom = ({
  root,
  baseConfig,
  cameras,
  themeDraftCache,
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

  nextConfig.window_days = normalizePositiveInteger(
    root.querySelector("#window_days")?.dataset.value ||
      root.querySelector("#window_days")?.value ||
      "3",
    3,
  );
  nextConfig.alerts_reviews_days = normalizePositiveInteger(
    root.querySelector("#alerts_reviews_days")?.dataset.value ||
      root.querySelector("#alerts_reviews_days")?.value ||
      String(nextConfig.window_days || 3),
    nextConfig.window_days || 3,
  );
  nextConfig.window_hours = nextConfig.window_days * 24;
  const realtimePollSeconds = Number(
    root.querySelector("#realtime_poll_seconds")?.dataset.value ||
      root.querySelector("#realtime_poll_seconds")?.value ||
      "5",
  );
  nextConfig.realtime_poll_seconds = REALTIME_POLL_OPTIONS_SECONDS.includes(
    realtimePollSeconds,
  )
    ? realtimePollSeconds
    : 5;
  nextConfig.mobile_poll_battery_saver =
    root.querySelector("#mobile_poll_battery_saver")?.checked === true;
  nextConfig.slideshow_rotation_enabled =
    root.querySelector("#slideshow_rotation_enabled")?.checked === true;
  nextConfig.slideshow_rotation_seconds =
    SLIDESHOW_ROTATION_OPTIONS_SECONDS.includes(
      Number(
        root.querySelector("#slideshow_rotation_seconds")?.dataset.value ||
          root.querySelector("#slideshow_rotation_seconds")?.value ||
          "30",
      ),
    )
      ? Number(
          root.querySelector("#slideshow_rotation_seconds")?.dataset.value ||
            root.querySelector("#slideshow_rotation_seconds")?.value ||
            "30",
        )
      : 30;
  nextConfig.grid_mode_enabled =
    root.querySelector("#grid_mode_enabled")?.checked === true;
  nextConfig.grid_start_in_grid_enabled =
    root.querySelector("#grid_start_in_grid_enabled")?.checked === true;
  nextConfig.grid_live_view_enabled =
    root.querySelector("#grid_live_view_enabled")?.checked !== false;
  nextConfig.landing_page_enabled =
    root.querySelector("#landing_page_enabled")?.checked === true;
  nextConfig.landing_page_live_cameras =
    root.querySelector("#landing_page_live_cameras")?.checked === true;
  nextConfig.landing_page_show_title_bars =
    root.querySelector("#landing_page_show_title_bars")?.checked !== false;
  nextConfig.grid_rotation_seconds = GRID_ROTATION_OPTIONS_SECONDS.includes(
    Number(
      root.querySelector("#grid_rotation_seconds")?.dataset.value ||
        root.querySelector("#grid_rotation_seconds")?.value ||
        "30",
    ),
  )
    ? Number(
        root.querySelector("#grid_rotation_seconds")?.dataset.value ||
          root.querySelector("#grid_rotation_seconds")?.value ||
          "30",
      )
    : 30;

  delete nextConfig.primary_color;
  delete nextConfig.accent_color;
  delete nextConfig.bg_color;
  delete nextConfig.use_primary_color;
  delete nextConfig.use_accent_color;
  delete nextConfig.use_bg_color;

  nextConfig.theme =
    root.querySelector("[data-theme-option].active")?.dataset?.themeOption ===
    "custom"
      ? "custom"
      : "default";

  const themeCustomDefaults = {};
  const themeCustom = {};
  root.querySelectorAll("[data-theme-color]").forEach((input) => {
    const key = input.dataset.themeColor;
    if (!THEME_CUSTOM_KEYS.has(key)) return;
    const useDefault =
      root.querySelector(`[data-theme-default="${key}"]`)?.checked === true;
    const inputValue = normalizeHexColor(input.value);
    if (useDefault) themeCustomDefaults[key] = true;
    if (!useDefault && inputValue) themeDraftCache[key] = inputValue;
    const cached = normalizeHexColor(themeDraftCache?.[key]);
    if (cached) themeCustom[key] = cached;
  });
  nextConfig.theme_custom = themeCustom;
  nextConfig.theme_custom_defaults = themeCustomDefaults;

  const hiddenTabs = [...root.querySelectorAll("[data-active-tab]")]
    .filter((element) => element.checked !== true)
    .map((element) => element.dataset.activeTab)
    .filter((tabId) => ALLOWED_HIDDEN_TABS.includes(tabId));
  nextConfig.hidden_tabs = hiddenTabs.length ? hiddenTabs : [];

  const streamHeight = root.querySelector("#stream_height")?.value;
  const streamHeightUnit =
    root.querySelector("#stream_height_unit")?.dataset.value ||
    root.querySelector("#stream_height_unit")?.value ||
    "vh";
  nextConfig.stream_height = streamHeight ? Number(streamHeight) : null;
  nextConfig.stream_height_unit = streamHeightUnit;

  nextConfig.tight_margins =
    root.querySelector("#tight_margins")?.checked === true;
  nextConfig.shadows = root.querySelector("#shadows")?.checked !== false;
  nextConfig.wide_view = root.querySelector("#wide_view")?.checked === true;

  const leftWidthRaw = root
    .querySelector("#col_left_width_pct")
    ?.value?.replace(/%/g, "")
    .trim();
  nextConfig.col_left_width_pct = leftWidthRaw
    ? Math.min(Math.max(parseInt(leftWidthRaw, 10) || 50, 10), 90)
    : 50;

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

export const compactEditorConfigForYaml = (
  config,
  { themeDefaultColors = {} } = {},
) => {
  const source = config && typeof config === "object" ? config : {};
  const compact = {};
  const cameras = Array.isArray(source.cameras)
    ? source.cameras.map(compactCameraConfigForYaml).filter(Boolean)
    : [];
  if (cameras.length) compact.cameras = cameras;

  addStringIfPresent(compact, "title", source.title);
  addStringIfPresent(compact, "subtitle", source.subtitle);

  const windowDays = normalizePositiveInteger(source.window_days, 3);
  addIfNotDefault(compact, "window_days", windowDays, 3);
  const alertsReviewsDays = normalizePositiveInteger(
    source.alerts_reviews_days,
    windowDays,
  );
  addIfNotDefault(
    compact,
    "alerts_reviews_days",
    alertsReviewsDays,
    windowDays,
  );

  const realtimePollSeconds = REALTIME_POLL_OPTIONS_SECONDS.includes(
    Number(source.realtime_poll_seconds),
  )
    ? Number(source.realtime_poll_seconds)
    : 5;
  addIfNotDefault(compact, "realtime_poll_seconds", realtimePollSeconds, 5);
  addIfNotDefault(
    compact,
    "mobile_poll_battery_saver",
    source.mobile_poll_battery_saver === true,
    false,
  );
  addIfNotDefault(
    compact,
    "slideshow_rotation_enabled",
    source.slideshow_rotation_enabled === true,
    false,
  );

  const slideshowRotationSeconds = SLIDESHOW_ROTATION_OPTIONS_SECONDS.includes(
    Number(source.slideshow_rotation_seconds),
  )
    ? Number(source.slideshow_rotation_seconds)
    : 30;
  addIfNotDefault(
    compact,
    "slideshow_rotation_seconds",
    slideshowRotationSeconds,
    30,
  );
  addIfNotDefault(
    compact,
    "grid_mode_enabled",
    source.grid_mode_enabled === true,
    false,
  );
  addIfNotDefault(
    compact,
    "grid_start_in_grid_enabled",
    source.grid_start_in_grid_enabled === true,
    false,
  );
  addIfNotDefault(
    compact,
    "grid_live_view_enabled",
    source.grid_live_view_enabled !== false,
    true,
  );
  addIfNotDefault(
    compact,
    "landing_page_enabled",
    source.landing_page_enabled === true,
    false,
  );
  addIfNotDefault(
    compact,
    "landing_page_live_cameras",
    source.landing_page_live_cameras === true,
    false,
  );
  addIfNotDefault(
    compact,
    "landing_page_show_title_bars",
    source.landing_page_show_title_bars !== false,
    true,
  );

  const gridRotationSeconds = GRID_ROTATION_OPTIONS_SECONDS.includes(
    Number(source.grid_rotation_seconds),
  )
    ? Number(source.grid_rotation_seconds)
    : 30;
  addIfNotDefault(compact, "grid_rotation_seconds", gridRotationSeconds, 30);

  const hiddenTabs = Array.isArray(source.hidden_tabs)
    ? source.hidden_tabs
        .map((id) => (id === "reviews" ? "alerts" : id))
        .filter((id) => ALLOWED_HIDDEN_TABS.includes(id))
    : [];
  if (hiddenTabs.length) compact.hidden_tabs = hiddenTabs;

  if (source.theme === "custom") {
    compact.theme = "custom";
    const themeCustom =
      source.theme_custom && typeof source.theme_custom === "object"
        ? source.theme_custom
        : {};
    const themeCustomDefaults =
      source.theme_custom_defaults &&
      typeof source.theme_custom_defaults === "object"
        ? source.theme_custom_defaults
        : {};
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

  const streamHeight = source.stream_height
    ? Number(source.stream_height)
    : null;
  if (streamHeight) compact.stream_height = streamHeight;
  const streamHeightUnit = source.stream_height_unit || "vh";
  if (streamHeight && streamHeightUnit !== "vh") {
    compact.stream_height_unit = streamHeightUnit;
  }
  addIfNotDefault(
    compact,
    "tight_margins",
    source.tight_margins === true,
    false,
  );
  addIfNotDefault(compact, "shadows", source.shadows !== false, true);
  addIfNotDefault(compact, "wide_view", source.wide_view === true, false);
  const leftWidth = Number(source.col_left_width_pct) || 50;
  addIfNotDefault(compact, "col_left_width_pct", leftWidth, 50);

  return compact;
};

export const withCardTypeForYaml = (
  config,
  { sourceConfig = null } = {},
) => {
  const payload = {
    type: `custom:${CARD_TAG}`,
    ...(config && typeof config === "object" ? config : {}),
  };

  const source =
    sourceConfig && typeof sourceConfig === "object" ? sourceConfig : null;
  if (source && source.grid_options && typeof source.grid_options === "object") {
    payload.grid_options = { ...source.grid_options };
  }
  if (source && source.visibility != null) {
    payload.visibility = Array.isArray(source.visibility)
      ? source.visibility.map((item) =>
          item && typeof item === "object" ? { ...item } : item,
        )
      : source.visibility;
  }

  return payload;
};

export const createEditorPreviewDraft = (config) => ({
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
  landing_page_enabled: config.landing_page_enabled,
  landing_page_live_cameras: config.landing_page_live_cameras,
  landing_page_show_title_bars: config.landing_page_show_title_bars,
  grid_rotation_seconds: config.grid_rotation_seconds,
  hidden_tabs: config.hidden_tabs,
  theme: config.theme,
  theme_custom: config.theme_custom,
  theme_custom_defaults: config.theme_custom_defaults,
  stream_height: config.stream_height,
  stream_height_unit: config.stream_height_unit,
  tight_margins: config.tight_margins,
  shadows: config.shadows,
  wide_view: config.wide_view,
  col_left_width_pct: config.col_left_width_pct,
});

export const LABEL_COLORS = {
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
export const PALETTE = [
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
export function labelColor(l) {
  if (!l) return "#f59e0b";
  if (LABEL_COLORS[l]) return LABEL_COLORS[l];
  let h = 0;
  for (const c of l) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return PALETTE[h % PALETTE.length];
}
// per-camera recording bar colours (distinct from event marker colours)
export const CAM_COLORS = [
  "rgba(30,80,200,.5)",
  "rgba(210,80,30,.5)",
  "rgba(30,170,80,.5)",
  "rgba(170,30,180,.5)",
];
export function mkCamState() {
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
export function camDisplayName(c) {
  return c.name || (c.entity || "").replace(/^camera\./, "").replace(/_/g, " ");
}

export function normalizeCameraConfig(camera, { fallbackName = null } = {}) {
  if (typeof camera === "string") {
    return {
      entity: camera,
      name: fallbackName,
      connection_type: DEFAULT_CAMERA_CONNECTION_TYPE,
      alerts_content: "alerts_only",
      disable_hls_desktop: false,
    };
  }
  if (camera && typeof camera === "object") {
    return {
      entity: camera.entity || camera.camera_entity || null,
      name: camera.name || fallbackName,
      connection_type: normalizeCameraConnectionType(camera.connection_type),
      alerts_content: normalizeAlertsAreaContent(camera.alerts_content),
      disable_hls_desktop: normalizeDisableHlsDesktop(
        camera.disable_hls_desktop,
      ),
    };
  }
  return {
    entity: null,
    name: fallbackName,
    connection_type: DEFAULT_CAMERA_CONNECTION_TYPE,
    alerts_content: "alerts_only",
    disable_hls_desktop: false,
  };
}

export const configuredCameraEntities = (config) =>
  (config?.cameras || []).map(({ entity }) => entity).filter(Boolean);

export const hassThemeSignature = (hass) => {
  const { darkMode = false, theme = "" } = hass?.themes || {};
  return `${darkMode === true ? "dark" : "light"}:${theme || hass?.selectedTheme || ""}`;
};

export const hassEntityStateSignature = (hass, entities) =>
  entities
    .map((entity) => `${entity}:${hass?.states?.[entity]?.state ?? "missing"}`)
    .join("|");

// ── styles ───────────────────────────────────────────────────
