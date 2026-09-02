import {
  VERSION,
  CARD_TAG,
  DAY,
  RECORDINGS_WINDOW,
  REALTIME_HEAD_POLL_MS,
  REALTIME_RELOAD_DEBOUNCE_MS,
  REALTIME_POLL_OPTIONS_SECONDS,
  MOBILE_BATTERY_SAVER_POLL_SECONDS,
  SNAPSHOT_UPDATE_SECONDS,
  SNAPSHOT_UPDATE_OPTIONS_SECONDS,
  SLIDESHOW_ROTATION_OPTIONS_SECONDS,
  GRID_ROTATION_OPTIONS_SECONDS,
  GRID_ALERT_HOLD_MS,
  GRID_ALERT_HOLD_OPTIONS_SECONDS,
  SLIDESHOW_ALERT_HOLD_MS,
  SLIDESHOW_ALERT_HOLD_OPTIONS_SECONDS,
  SLIDESHOW_REVIEW_FRESHNESS_GRACE_SEC,
  SLIDESHOW_REVIEW_WATCH_MIN_MS,
  SLIDESHOW_REVIEW_WATCH_MAX_MS,
  PREVIEW_ALERT_HOLD_MS,
  PREVIEW_ALERT_LIVE_DURATION_OPTIONS_SECONDS,
  PREVIEW_ALERT_END_GRACE_MS,
  MSE_SWITCH_GRACE_MS,
  MSE_SWITCH_GRACE_MAX,
  MAX_CAMERAS,
  DEFAULT_CAMERA_CONNECTION_TYPE,
  ALLOWED_HIDDEN_TABS,
  THEME_DEFAULTS,
  THEME_CUSTOM_ROWS,
  THEME_CUSTOM_KEYS,
  THEME_MODES,
} from "./constants.js";
import {
  DASHBOARD_SWIPE_NAVIGATION_MODES,
  DEVICE_ROUTE_BUCKETS,
  normalizeDashboardSwipeNavigationMode,
  MOBILE_PAGE_MODES,
  normalizeMobilePageMode,
  normalizePageRoute,
  PAGE_IDS,
  resolveDashboardSwipePageSelection,
} from "./features/navigation/router.js";
import { createEditorPreviewDraft as mapEditorPreviewDraft } from "./config/preview-mapper.js";
import {
  compactEditorConfigForYaml as mapCompactEditorConfigForYaml,
  withCardTypeForYaml as mapWithCardTypeForYaml,
} from "./config/yaml-mapper.js";
import { normalizeCameraPtzConfig } from "./features/ptz/index.js";
import {
  createThemeCustomConfig,
  normalizeCardHeight,
  normalizeCardHeightUnit,
  normalizeThemeCustomConfig,
  normalizeThemeCustomScope,
  resolveThemeCustomEditorConfig,
} from "./features/card-style/config.js";
import {
  normalizeWideLeftWidth,
  normalizeWideTimelineScale,
} from "./features/wide-view/config.js";
import {
  cameraMemberEntities,
  normalizeCameraGroupConfig,
} from "./features/camera-groups/model.js";
import { normalizeLinkedEntitiesConfig } from "./features/linked-entities/config.js";

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

export function normalizeNumberChoice(value, options, fallback) {
  const numeric = Number(value);
  return Array.isArray(options) && options.includes(numeric)
    ? numeric
    : fallback;
}

export function normalizeBoundedPositiveInteger(value, fallback, min, max) {
  const parsed = normalizePositiveInteger(value, fallback);
  const lower = Math.max(1, Number(min) || 1);
  const upper = Math.max(lower, Number(max) || lower);
  return Math.min(upper, Math.max(lower, parsed));
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

export const normalizeThemeMode = (value) =>
  String(value || "").trim().toLowerCase() === "dark" ? "dark" : "light";

export { normalizeThemeCustomConfig };

export const normalizeThemeCustomDefaultsConfig = (value) => {
  const source = value && typeof value === "object" ? value : {};
  return Object.fromEntries(
    THEME_MODES.map((mode) => {
      const modeSource =
        source[mode] && typeof source[mode] === "object" ? source[mode] : {};
      const defaults = Object.fromEntries(
        Object.entries(modeSource)
          .filter(([key, enabled]) =>
            THEME_CUSTOM_KEYS.has(key) && enabled === true,
          )
          .map(([key]) => [key, true]),
      );
      return [mode, defaults];
    }),
  );
};

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

const CAMERA_ROW_DROP_CLASSES = [
  "drop-target",
  "drop-target-before",
  "drop-target-after",
];

export const resolveCameraRowDropPlacement = (event, row) => {
  const bounds = row?.getBoundingClientRect?.();
  const top = Number(bounds?.top);
  const height = Number(bounds?.height);
  const clientY = Number(event?.clientY);
  if (
    !Number.isFinite(top) ||
    !Number.isFinite(height) ||
    !(height > 0) ||
    !Number.isFinite(clientY)
  ) {
    return "replace";
  }
  const position = (clientY - top) / height;
  if (position <= 0.28) return "before";
  if (position >= 0.72) return "after";
  return "replace";
};

export const reorderItemsForDrop = (
  items,
  fromIndex,
  targetIndex,
  placement = "replace",
) => {
  const next = Array.isArray(items) ? [...items] : [];
  if (
    !Number.isInteger(fromIndex) ||
    !Number.isInteger(targetIndex) ||
    fromIndex < 0 ||
    targetIndex < 0 ||
    fromIndex >= next.length ||
    targetIndex >= next.length ||
    fromIndex === targetIndex
  ) {
    return next;
  }
  const [moved] = next.splice(fromIndex, 1);
  let insertionIndex = targetIndex;
  if (placement === "before" || placement === "after") {
    insertionIndex = targetIndex - (fromIndex < targetIndex ? 1 : 0);
    if (placement === "after") insertionIndex += 1;
  }
  next.splice(Math.max(0, Math.min(next.length, insertionIndex)), 0, moved);
  return next;
};

export const wireCameraRowDragAndDrop = ({
  rows,
  clearDropTargets,
  onReorder,
}) => {
  const clearRowDropState = (row) => {
    row.classList.remove(...CAMERA_ROW_DROP_CLASSES);
    delete row.dataset.dropPlacement;
  };
  const clearAllDropStates = () => {
    rows.forEach(clearRowDropState);
    clearDropTargets?.();
  };
  rows.forEach((row) => {
    row.addEventListener("dragstart", (event) => {
      const rowIndex = row.dataset.row;
      if (event.dataTransfer) {
        event.dataTransfer.setData("text/plain", rowIndex);
        event.dataTransfer.effectAllowed = "move";
      }
      row.classList.add("dragging");
    });
    row.addEventListener("dragend", () => {
      row.classList.remove("dragging");
      clearAllDropStates();
    });
    row.addEventListener("dragover", (event) => {
      event.preventDefault();
      clearAllDropStates();
      const placement = resolveCameraRowDropPlacement(event, row);
      row.dataset.dropPlacement = placement;
      row.classList.add(
        placement === "before"
          ? "drop-target-before"
          : placement === "after"
            ? "drop-target-after"
            : "drop-target",
      );
      if (event.dataTransfer) event.dataTransfer.dropEffect = "move";
    });
    row.addEventListener("dragleave", (event) => {
      if (row.contains?.(event.relatedTarget)) return;
      clearRowDropState(row);
    });
    row.addEventListener("drop", (event) => {
      event.preventDefault();
      const placement =
        row.dataset.dropPlacement ||
        resolveCameraRowDropPlacement(event, row);
      clearAllDropStates();
      const fromIndex = Number(
        event.dataTransfer?.getData("text/plain") || "-1",
      );
      const toIndex = Number(row.dataset.row || "-1");
      onReorder(fromIndex, toIndex, placement);
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

export const resolveSwitchChecked = (element) => {
  if (!element) return false;
  if (typeof element.checked === "boolean") return element.checked;
  if (element.getAttribute?.("aria-checked") === "true") return true;
  if (element.getAttribute?.("aria-checked") === "false") return false;
  const shadowInput = element.shadowRoot?.querySelector?.("input");
  if (typeof shadowInput?.checked === "boolean") return shadowInput.checked;
  return false;
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
  required,
  onChange,
}) => {
  if (!element) return;
  element.hass = hass;
  element.selector = { entity: { domain } };
  if (typeof required === "boolean") element.required = required;
  if (label) element.label = label;
  const syncValue = (event) => {
    const nextValue = event?.detail?.value ?? element.value ?? "";
    const normalizedValue = String(nextValue || "");
    element.value = normalizedValue;
    element.dataset.value = normalizedValue;
    onChange?.(normalizedValue, event);
  };
  element.addEventListener("value-changed", syncValue);
  element.addEventListener("selected-changed", syncValue);
};

export const setupIconSelector = ({
  element,
  hass,
  entity = "",
  label,
  onChange,
}) => {
  if (!element) return;
  element.hass = hass;
  element.selector = { icon: {} };
  element.context = entity ? { icon_entity: entity } : {};
  element.required = false;
  if (label) element.label = label;
  const syncValue = (event) => {
    const nextValue = event?.detail?.value ?? element.value ?? "";
    const normalizedValue = String(nextValue || "");
    element.value = normalizedValue;
    element.dataset.value = normalizedValue;
    onChange?.(normalizedValue, event);
  };
  element.addEventListener("value-changed", syncValue);
  element.addEventListener("selected-changed", syncValue);
};

export const bindThemeControlEvents = ({
  root,
  update,
  themeDraftCache,
  resolveDefaultHex,
  themeMode,
}) => {
  const activeMode = normalizeThemeMode(themeMode);
  if (!themeDraftCache[activeMode]) themeDraftCache[activeMode] = {};
  const activeDraft = themeDraftCache[activeMode];

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

  root.querySelectorAll("[data-theme-scope]").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      const selectedScope = normalizeThemeCustomScope(
        event.currentTarget?.dataset?.themeScope,
        activeMode,
      );
      root.querySelectorAll("[data-theme-scope]").forEach((scopeButton) => {
        const isActive = scopeButton.dataset.themeScope === selectedScope;
        scopeButton.classList.toggle("active", isActive);
        scopeButton.setAttribute("aria-checked", isActive ? "true" : "false");
      });
      event.currentTarget?.blur?.();
      update();
    });
  });

  root.querySelectorAll("[data-theme-color]").forEach((input) => {
    const syncColor = (event) => {
      const colorKey = event.currentTarget?.dataset?.themeColor;
      const colorValue = normalizeHexColor(event.currentTarget?.value);
      if (colorKey && colorValue) activeDraft[colorKey] = colorValue;
      update();
    };
    input.addEventListener("input", syncColor);
    input.addEventListener("change", syncColor);
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
      activeDraft[colorKey] = defaultHex;
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
        const draftHex = normalizeHexColor(activeDraft[colorKey]);
        input.value = draftHex || resolveDefaultHex(colorKey);
        activeDraft[colorKey] = input.value;
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
  themeMode,
  hiddenTabsOverride,
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
  const displayTitle = root.querySelector("#display_title");
  const displaySubtitle = root.querySelector("#display_subtitle");
  const displayLogo = root.querySelector("#display_logo");
  nextConfig.display_title = displayTitle
    ? resolveSwitchChecked(displayTitle)
    : baseConfig?.display_title !== false;
  nextConfig.display_subtitle = displaySubtitle
    ? resolveSwitchChecked(displaySubtitle)
    : baseConfig?.display_subtitle !== false;
  nextConfig.display_logo = displayLogo
    ? resolveSwitchChecked(displayLogo)
    : baseConfig?.display_logo !== false;

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
    root.querySelector('[name="realtime_poll_seconds"]:checked')?.value ||
      root.querySelector("#realtime_poll_seconds")?.dataset.value ||
      root.querySelector("#realtime_poll_seconds")?.value ||
      "5",
  );
  nextConfig.realtime_poll_seconds = REALTIME_POLL_OPTIONS_SECONDS.includes(
    realtimePollSeconds,
  )
    ? realtimePollSeconds
    : 5;
  nextConfig.snapshot_update_seconds = normalizeNumberChoice(
    root.querySelector('[name="snapshot_update_seconds"]:checked')?.value ||
      root.querySelector("#snapshot_update_seconds")?.dataset.value ||
      root.querySelector("#snapshot_update_seconds")?.value ||
      String(SNAPSHOT_UPDATE_SECONDS),
    SNAPSHOT_UPDATE_OPTIONS_SECONDS,
    SNAPSHOT_UPDATE_SECONDS,
  );
  nextConfig.mobile_poll_battery_saver = resolveSwitchChecked(
    root.querySelector("#mobile_poll_battery_saver"),
  );
  nextConfig.event_pre_post_roll_enabled = resolveSwitchChecked(
    root.querySelector("#event_pre_post_roll_enabled"),
  );
  const mixedFavoritesToggle = root.querySelector(
    "#favorites_mixed_cameras",
  );
  nextConfig.favorites_mixed_cameras = mixedFavoritesToggle
    ? resolveSwitchChecked(mixedFavoritesToggle)
    : baseConfig?.favorites_mixed_cameras !== false;
  nextConfig.slideshow_rotation_enabled = resolveSwitchChecked(
    root.querySelector("#slideshow_rotation_enabled"),
  );
  nextConfig.slideshow_rotation_seconds =
    SLIDESHOW_ROTATION_OPTIONS_SECONDS.includes(
      Number(
        root.querySelector('[name="slideshow_rotation_seconds"]:checked')
          ?.value ||
          root.querySelector("#slideshow_rotation_seconds")?.dataset.value ||
          root.querySelector("#slideshow_rotation_seconds")?.value ||
          "30",
      ),
    )
      ? Number(
          root.querySelector('[name="slideshow_rotation_seconds"]:checked')
            ?.value ||
            root.querySelector("#slideshow_rotation_seconds")?.dataset.value ||
            root.querySelector("#slideshow_rotation_seconds")?.value ||
            "30",
        )
      : 30;
  nextConfig.slideshow_alert_hold_seconds = normalizeNumberChoice(
    root.querySelector('[name="slideshow_alert_hold_seconds"]:checked')
      ?.value ||
      root.querySelector("#slideshow_alert_hold_seconds")?.dataset.value ||
      root.querySelector("#slideshow_alert_hold_seconds")?.value ||
      String(Math.round(SLIDESHOW_ALERT_HOLD_MS / 1000)),
    SLIDESHOW_ALERT_HOLD_OPTIONS_SECONDS,
    Math.round(SLIDESHOW_ALERT_HOLD_MS / 1000),
  );
  nextConfig.grid_mode_enabled = resolveSwitchChecked(
    root.querySelector("#grid_mode_enabled"),
  );
  nextConfig.grid_start_in_grid_enabled = resolveSwitchChecked(
    root.querySelector("#grid_start_in_grid_enabled"),
  );
  nextConfig.grid_live_view_enabled =
    resolveSwitchChecked(root.querySelector("#grid_live_view_enabled")) !==
    false;
  nextConfig.grid_alert_hold_seconds = normalizeNumberChoice(
    root.querySelector('[name="grid_alert_hold_seconds"]:checked')?.value ||
      root.querySelector("#grid_alert_hold_seconds")?.dataset.value ||
      root.querySelector("#grid_alert_hold_seconds")?.value ||
      String(Math.round(GRID_ALERT_HOLD_MS / 1000)),
    GRID_ALERT_HOLD_OPTIONS_SECONDS,
    Math.round(GRID_ALERT_HOLD_MS / 1000),
  );
  const mobileViewPageToggle = root.querySelector(
    "#mobile_view_page_enabled",
  );
  nextConfig.mobile_view_page_enabled = mobileViewPageToggle
    ? resolveSwitchChecked(mobileViewPageToggle)
    : baseConfig?.mobile_view_page_enabled !== false;
  const rotateToFullscreenToggle = root.querySelector(
    "#mobile_view_rotate_to_fullscreen",
  );
  nextConfig.mobile_view_rotate_to_fullscreen = rotateToFullscreenToggle
    ? resolveSwitchChecked(rotateToFullscreenToggle)
    : baseConfig?.mobile_view_rotate_to_fullscreen !== false;
  nextConfig.mobile_view_outer_border = resolveSwitchChecked(
    root.querySelector("#mobile_view_outer_border"),
  );
  nextConfig.mobile_view_ha_navbar_bottom = resolveSwitchChecked(
    root.querySelector("#mobile_view_ha_navbar_bottom"),
  );
  nextConfig.mobile_view_ha_navbar_stack_tabs = resolveSwitchChecked(
    root.querySelector("#mobile_view_ha_navbar_stack_tabs"),
  );
  nextConfig.mobile_view_ha_navbar_dashboard = resolveSwitchChecked(
    root.querySelector("#mobile_view_ha_navbar_dashboard"),
  );
  nextConfig.ha_dashboard_swipe_navigation_owner = resolveSwitchChecked(
    root.querySelector("#ha_dashboard_swipe_navigation_owner"),
  );
  nextConfig.ha_dashboard_swipe_navigation =
    normalizeDashboardSwipeNavigationMode(
      root.querySelector(
        '[name="ha_dashboard_swipe_navigation"]:checked',
      )?.value || baseConfig?.ha_dashboard_swipe_navigation,
    );
  nextConfig.ha_dashboard_swipe_include_other_cards = resolveSwitchChecked(
    root.querySelector("#ha_dashboard_swipe_include_other_cards"),
  );
  const subviewMode = nextConfig.ha_dashboard_swipe_navigation;
  const subviewSwitch =
    subviewMode === DASHBOARD_SWIPE_NAVIGATION_MODES.dashboardWide ||
    subviewMode === DASHBOARD_SWIPE_NAVIGATION_MODES.landingDashboard
      ? root.querySelector(
          `[data-ha-dashboard-swipe-include-subviews="${subviewMode}"]`,
        )
      : null;
  nextConfig.ha_dashboard_swipe_include_subviews =
    resolveSwitchChecked(subviewSwitch);
  nextConfig.ha_dashboard_swipe_mouse_enabled = resolveSwitchChecked(
    root.querySelector("#ha_dashboard_swipe_mouse_enabled"),
  );
  nextConfig.preview_page_enabled = resolveSwitchChecked(
    root.querySelector("#preview_page_enabled"),
  );
  nextConfig.preview_page_live_cameras = resolveSwitchChecked(
    root.querySelector("#preview_page_live_cameras"),
  );
  nextConfig.preview_page_live_cameras_mobile = resolveSwitchChecked(
    root.querySelector("#preview_page_live_cameras_mobile"),
  );
  nextConfig.preview_page_alert_live_duration_seconds =
    normalizeNumberChoice(
      root.querySelector(
        '[name="preview_page_alert_live_duration_seconds"]:checked',
      )?.value ||
        root.querySelector("#preview_page_alert_live_duration_seconds")
          ?.dataset.value ||
        root.querySelector("#preview_page_alert_live_duration_seconds")
          ?.value ||
        "10",
      PREVIEW_ALERT_LIVE_DURATION_OPTIONS_SECONDS,
      10,
    );
  nextConfig.preview_page_show_title_bars =
    resolveSwitchChecked(
      root.querySelector("#preview_page_show_title_bars"),
    ) !== false;
  nextConfig.wide_view_page_enabled = resolveSwitchChecked(
    root.querySelector("#wide_view_page_enabled"),
  );
  nextConfig.wide_view_live_cameras = resolveSwitchChecked(
    root.querySelector("#wide_view_live_cameras"),
  );
  nextConfig.wide_view_alert_takeover = resolveSwitchChecked(
    root.querySelector("#wide_view_alert_takeover"),
  );
  nextConfig.wide_view_timeline_enabled = resolveSwitchChecked(
    root.querySelector("#wide_view_timeline_enabled"),
  );
  nextConfig.wide_view_timeline_default_open = resolveSwitchChecked(
    root.querySelector("#wide_view_timeline_default_open"),
  );
  nextConfig.wide_view_timeline_default_scale = normalizeWideTimelineScale(
    root.querySelector(
      '[name="wide_view_timeline_default_scale"]:checked',
    )?.value ||
      root.querySelector("#wide_view_timeline_default_scale")?.dataset.value ||
      root.querySelector("#wide_view_timeline_default_scale")?.value ||
      baseConfig?.wide_view_timeline_default_scale,
  );
  nextConfig.card_view_page_enabled = resolveSwitchChecked(
    root.querySelector("#card_view_page_enabled"),
  );
  nextConfig.card_view_alert_takeover = resolveSwitchChecked(
    root.querySelector("#card_view_alert_takeover"),
  );
  const cardViewDrawerDefaultOpen = root.querySelector(
    "#card_view_drawer_default_open",
  );
  nextConfig.card_view_drawer_default_open = cardViewDrawerDefaultOpen
    ? resolveSwitchChecked(cardViewDrawerDefaultOpen)
    : baseConfig?.card_view_drawer_default_open !== false;
  nextConfig.card_view_standalone = resolveSwitchChecked(
    root.querySelector("#card_view_standalone"),
  );
  nextConfig.grid_rotation_seconds = GRID_ROTATION_OPTIONS_SECONDS.includes(
    Number(
      root.querySelector('[name="grid_rotation_seconds"]:checked')?.value ||
        root.querySelector("#grid_rotation_seconds")?.dataset.value ||
        root.querySelector("#grid_rotation_seconds")?.value ||
        "30",
    ),
  )
    ? Number(
        root.querySelector('[name="grid_rotation_seconds"]:checked')?.value ||
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

  const activeThemeMode = normalizeThemeMode(themeMode);
  const existingTheme = resolveThemeCustomEditorConfig(
    nextConfig.theme_custom,
    activeThemeMode,
  );
  const themeOverrides = { ...existingTheme.overrides };
  const currentThemeDefaults = normalizeThemeCustomDefaultsConfig(
    nextConfig.theme_custom_defaults,
  )[activeThemeMode];
  const themeDefaults = { ...currentThemeDefaults };
  const activeThemeDraft = themeDraftCache?.[activeThemeMode];
  if (activeThemeDraft && typeof activeThemeDraft === "object") {
    Object.entries(activeThemeDraft).forEach(([key, value]) => {
      if (!THEME_CUSTOM_KEYS.has(key)) return;
      const color = normalizeHexColor(value);
      if (color) themeOverrides[key] = color;
    });
  }
  root.querySelectorAll("[data-theme-color]").forEach((input) => {
    const key = input.dataset.themeColor;
    if (!THEME_CUSTOM_KEYS.has(key)) return;
    const useDefault = resolveSwitchChecked(
      root.querySelector(`[data-theme-default="${key}"]`),
    );
    const inputValue = normalizeHexColor(input.value);
    if (useDefault) {
      themeDefaults[key] = true;
      delete themeOverrides[key];
      return;
    }
    delete themeDefaults[key];
    if (!inputValue) return;
    if (!Object.prototype.hasOwnProperty.call(themeOverrides, key)) return;
    if (!themeDraftCache[activeThemeMode]) {
      themeDraftCache[activeThemeMode] = {};
    }
    themeDraftCache[activeThemeMode][key] = inputValue;
    themeOverrides[key] = inputValue;
  });
  const selectedThemeScope = normalizeThemeCustomScope(
    root.querySelector("[data-theme-scope].active")?.dataset?.themeScope,
    activeThemeMode,
  );
  nextConfig.theme_custom = createThemeCustomConfig({
    scope: selectedThemeScope,
    overrides: themeOverrides,
    fallbackMode: activeThemeMode,
  });
  nextConfig.theme_custom_defaults = Object.fromEntries(
    THEME_MODES.map((mode) => [mode, { ...themeDefaults }]),
  );

  const hiddenTabs = Array.isArray(hiddenTabsOverride)
    ? hiddenTabsOverride
        .map((id) => (id === "reviews" ? "alerts" : id))
        .filter((id) => ALLOWED_HIDDEN_TABS.includes(id))
    : [...root.querySelectorAll("[data-active-tab]")]
        .filter((element) => !resolveSwitchChecked(element))
        .map((element) => element.dataset.activeTab)
        .filter((tabId) => ALLOWED_HIDDEN_TABS.includes(tabId));
  nextConfig.hidden_tabs = hiddenTabs.length ? hiddenTabs : [];

  const streamHeight = root.querySelector("#stream_height")?.value;
  const streamHeightUnit =
    root.querySelector('[name="stream_height_unit"]:checked')?.value ||
    root.querySelector("#stream_height_unit")?.dataset.value ||
    root.querySelector("#stream_height_unit")?.value ||
    "%";
  nextConfig.stream_height = normalizeCardHeight(streamHeight);
  nextConfig.stream_height_unit = normalizeCardHeightUnit(streamHeightUnit);

  nextConfig.tight_margins = resolveSwitchChecked(
    root.querySelector("#tight_margins"),
  );
  nextConfig.shadows =
    resolveSwitchChecked(root.querySelector("#shadows")) !== false;
  nextConfig.borders =
    resolveSwitchChecked(root.querySelector("#borders")) !== false;
  nextConfig.rounded_corners =
    resolveSwitchChecked(root.querySelector("#rounded_corners")) !== false;
  nextConfig.outer_shadows =
    resolveSwitchChecked(root.querySelector("#outer_shadows")) !== false;
  nextConfig.landing_page = normalizePageRoute(
    root.querySelector("#landing_page")?.dataset.value ||
      root.querySelector("#landing_page")?.value ||
      PAGE_IDS.singleView,
  );
  const previousLandingPage = normalizePageRoute(baseConfig?.landing_page);
  const selectedSwipePages = [
    ...root.querySelectorAll(
      '[name="ha_dashboard_swipe_pages"]:checked',
    ),
  ]
    .map((input) => String(input?.value || ""))
    .filter(
      (pageId) =>
        pageId &&
        (nextConfig.landing_page === previousLandingPage ||
          pageId !== previousLandingPage),
    );
  nextConfig.ha_dashboard_swipe_pages =
    resolveDashboardSwipePageSelection(
      {
        ...nextConfig,
        ha_dashboard_swipe_pages: selectedSwipePages,
      },
      DEVICE_ROUTE_BUCKETS.desktop,
    );
  nextConfig.mobile_page = normalizeMobilePageMode(
    root.querySelector("#mobile_page")?.dataset.value ||
      root.querySelector("#mobile_page")?.value ||
      nextConfig.mobile_page ||
      MOBILE_PAGE_MODES.single,
  );

  nextConfig.col_left_width_pct = normalizeWideLeftWidth(
    root.querySelector("#col_left_width_pct")?.value,
  );

  return nextConfig;
};

export const compactEditorConfigForYaml = (config, options = {}) =>
  mapCompactEditorConfigForYaml(config, options);

export const withCardTypeForYaml = (config, options = {}) =>
  mapWithCardTypeForYaml(config, options);

export const createEditorPreviewDraft = (config) =>
  mapEditorPreviewDraft(config);

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
    eventsWindowKey: "",
    eventsWindowContextKey: "",
    eventsWindowFetchedAt: 0,
    recordings: [],
    reviews: [],
    reviewsWindowKey: "",
    reviewsWindowContextKey: "",
    reviewsWindowFetchedAt: 0,
    kept: [],
    ptzInfo: null,
    ptzInfoFetched: false,
    ptzInfoPromise: null,
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
      ptz: null,
    };
  }
  if (camera && typeof camera === "object") {
    const entity = camera.entity || camera.camera_entity || null;
    const group = normalizeCameraGroupConfig(camera.group, {
      primaryEntity: entity,
    });
    const linkedEntities = normalizeLinkedEntitiesConfig(
      camera.linked_entities,
    );
    return {
      entity,
      name: camera.name || fallbackName,
      connection_type: normalizeCameraConnectionType(camera.connection_type),
      alerts_content: normalizeAlertsAreaContent(camera.alerts_content),
      ptz: normalizeCameraPtzConfig(camera.ptz),
      ...(camera.two_way_talk === true ? { two_way_talk: true } : {}),
      ...(group ? { group } : {}),
      ...(linkedEntities.length ? { linked_entities: linkedEntities } : {}),
    };
  }
  return {
    entity: null,
    name: fallbackName,
    connection_type: DEFAULT_CAMERA_CONNECTION_TYPE,
    alerts_content: "alerts_only",
    ptz: null,
  };
}

export const configuredCameraEntities = (config) =>
  (config?.cameras || []).flatMap(cameraMemberEntities);

export const hassThemeSignature = (hass) => {
  const {
    darkMode = false,
    theme = "",
    default_theme: defaultTheme = "",
    default_dark_theme: defaultDarkTheme = "",
  } = hass?.themes || {};
  return [
    darkMode === true ? "dark" : "light",
    theme || hass?.selectedTheme || "",
    defaultTheme,
    defaultDarkTheme,
  ].join(":");
};

export const hassEntityStateSignature = (hass, entities) =>
  entities
    .map((entity) => `${entity}:${hass?.states?.[entity]?.state ?? "missing"}`)
    .join("|");
