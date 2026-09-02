import {
  findCurrentHomeAssistantLovelaceRoot,
  findHomeAssistantLovelaceRoot,
  resolveHomeAssistantDashboardKey,
} from "./navbar.ctrl.js";
import {
  DASHBOARD_SWIPE_NAVIGATION_MODES,
  normalizeDashboardSwipeNavigationMode,
} from "../../features/navigation/router.js";

const AXIS_LOCK_PX = 12;
const HORIZONTAL_AXIS_RATIO = 1.25;
const SWIPE_THRESHOLD_RATIO = 0.15;
const SWIPE_THRESHOLD_MIN_PX = 64;
const SWIPE_THRESHOLD_MAX_PX = 140;
const NATIVE_EDGE_CLOSE_GUARD_PX = 18;
const NATIVE_DRAWER_IDLE_GUARD_PX = 56;
const NAVIGATION_COOLDOWN_MS = 320;
const SWIPE_CLICK_SUPPRESSION_MS = 700;
const ROOT_RETRY_FRAMES = 45;
const PAGE_EXIT_MAX_MS = 170;
const PAGE_EXIT_MIN_MS = 90;
const PAGE_ENTER_MS = 230;
const PAGE_SPRING_MS = 210;
const PAGE_ROUTE_SETTLE_FRAMES = 8;
const PAGE_SLIDE_EASING = "cubic-bezier(0.28, 0.02, 0.18, 1)";
const PAGE_SPRING_EASING = "cubic-bezier(0.2, 0.78, 0.2, 1.08)";
const PAGE_EDGE_PULL_RATIO = 0.45;
const PAGE_EDGE_PULL_MAX_PX = 52;
const PAGE_EDGE_OVERSHOOT_RATIO = 0.12;
const PAGE_EDGE_OVERSHOOT_MIN_PX = 3;
const PAGE_EDGE_OVERSHOOT_MAX_PX = 7;
const PAGE_EDGE_OVERSHOOT_MS = 145;
const PAGE_EDGE_SETTLE_MS = 85;
const PREMOUNT_NAVIGATION_RETRY_FRAMES = 120;

const PAGE_MOTION_PROPERTIES = Object.freeze([
  "transform",
  "transition",
  "will-change",
  "backface-visibility",
]);
const PAGE_CLIP_PROPERTIES = Object.freeze([
  "overflow-x",
  "overscroll-behavior-x",
]);

const SWIPE_BLOCK_SELECTOR = [
  "a",
  "button",
  "input",
  "select",
  "textarea",
  "label",
  "summary",
  "video",
  "audio",
  "canvas",
  "[contenteditable]",
  "[draggable='true']",
  "[role='button']",
  "[role='slider']",
  "[role='spinbutton']",
  "[data-no-swipe]",
  "ha-tabs",
  "ha-tab-group",
  "ha-tab-group-tab",
  "paper-tabs",
  "paper-tab",
  "ha-slider",
  "ha-control-slider",
  "paper-slider",
  "mwc-slider",
  "ha-map",
  "hui-map-card",
  "google-map",
  "swipe-card",
  "swiper-container",
  ".swiper",
  ".swiper-container",
  ".swiper-wrapper",
  ".swiper-slide",
  "#live-stage",
  "#viewer",
  "#recording-scrub",
  ".recording-scrub-track",
  ".recording-segment-handle",
  ".live-resize-grip",
  ".popup-view-resize-grip",
  ".popup-carousel",
  ".circle-pad",
  ".wide-timeline-shell",
  ".wide-timeline-resize-handle",
  ".card-view-scroller",
  ".linked-light-brightness-popover",
  "#filter-panel",
  "#cal-panel",
].join(",");

const DIRECT_GESTURE_TAG_PATTERN = /(?:^|-)(?:dial|knob|range|slider)(?:-|$)/;
const DASHBOARD_WIDE_SWIPE_MODES = new Set([
  DASHBOARD_SWIPE_NAVIGATION_MODES.dashboardWide,
  DASHBOARD_SWIPE_NAVIGATION_MODES.landingDashboard,
]);
const PREMOUNT_NAVIGATION_KEY = Symbol.for(
  "frigate-view-card.dashboard-swipe-navigation",
);

const coordinatorByRoot = new WeakMap();

const composedParent = (element) => {
  if (!element) return null;
  if (element.parentNode) return element.parentNode;
  const root = element.getRootNode?.();
  return root && root !== element ? root.host || null : element.host || null;
};

const normalizePath = (value) => {
  const normalized = String(value || "")
    .trim()
    .replace(/^\/+|\/+$/g, "");
  return normalized;
};

const normalizePrefix = (value) => {
  const normalized = String(value || "")
    .trim()
    .replace(/\/+$/g, "");
  if (!normalized) return "";
  return normalized.startsWith("/") ? normalized : `/${normalized}`;
};

const dashboardKeysMatch = (left, right) => {
  const normalize = (value) =>
    String(value || "").replace(/^(?:route|path):/, "");
  return Boolean(left) && normalize(left) === normalize(right);
};

const isElementLike = (value) =>
  Boolean(value) &&
  typeof value === "object" &&
  (typeof value.matches === "function" || Boolean(value.tagName));

const matchesSwipeBlockSelector = (element) => {
  if (typeof element?.matches !== "function") return false;
  try {
    return element.matches(SWIPE_BLOCK_SELECTOR);
  } catch (_) {
    return false;
  }
};

const hasDirectGestureSemantics = (element) => {
  const tagName = String(element?.tagName || "").trim().toLowerCase();
  return (
    DIRECT_GESTURE_TAG_PATTERN.test(tagName) ||
    element?.getAttribute?.("aria-valuenow") != null
  );
};

const isHorizontallyScrollable = (element, getComputedStyleFn) => {
  const scrollWidth = Number(element?.scrollWidth) || 0;
  const clientWidth = Number(element?.clientWidth) || 0;
  if (scrollWidth <= clientWidth + 1 || clientWidth <= 0) return false;
  let overflowX = "";
  try {
    overflowX = String(getComputedStyleFn?.(element)?.overflowX || "");
  } catch (_) {
    return false;
  }
  return overflowX === "auto" || overflowX === "scroll";
};

const reservesDirectTouchGestures = (element, getComputedStyleFn) => {
  try {
    const touchAction = String(
      getComputedStyleFn?.(element)?.touchAction || "",
    )
      .trim()
      .toLowerCase();
    return touchAction === "none";
  } catch (_) {
    return false;
  }
};

export const shouldIgnoreDashboardSwipePath = (
  path,
  { getComputedStyleFn = globalThis.getComputedStyle } = {},
) => {
  for (const element of Array.isArray(path) ? path : []) {
    if (!isElementLike(element)) continue;
    if (
      matchesSwipeBlockSelector(element) ||
      hasDirectGestureSemantics(element) ||
      isHorizontallyScrollable(element, getComputedStyleFn) ||
      reservesDirectTouchGestures(element, getComputedStyleFn)
    ) {
      return true;
    }
    if (String(element.tagName || "").toUpperCase() === "HUI-ROOT") break;
  }
  return false;
};

const resolveViewportWidth = (windowRef) =>
  Math.max(
    0,
    Number(windowRef?.innerWidth) ||
      Number(windowRef?.document?.documentElement?.clientWidth) ||
      Number(windowRef?.screen?.width) ||
      0,
  );

const canManageInlineMotion = (element) =>
  typeof element?.style?.getPropertyValue === "function" &&
  typeof element.style.setProperty === "function" &&
  typeof element.style.removeProperty === "function";

export const resolveHomeAssistantDashboardSwipeSurface = (huiRoot) => {
  const surface = huiRoot?.shadowRoot?.querySelector?.("#view") || null;
  return canManageInlineMotion(surface) ? surface : null;
};

const resolveDashboardSwipeEventTarget = (huiRoot) => {
  const surface = huiRoot?.shadowRoot?.querySelector?.("#view") || null;
  return typeof surface?.addEventListener === "function" ? surface : null;
};

export const resolveDashboardSwipeDragOffset = ({
  deltaX = 0,
  viewportWidth = 0,
  hasTarget = true,
} = {}) => {
  const width = Math.max(1, Number(viewportWidth) || 1);
  const distance = Math.max(-width, Math.min(width, Number(deltaX) || 0));
  if (hasTarget || distance === 0) return distance;

  const limit = Math.min(PAGE_EDGE_PULL_MAX_PX, width * 0.14);
  const absolute = Math.abs(distance);
  const resisted =
    (limit * absolute) /
    (absolute + limit / PAGE_EDGE_PULL_RATIO);
  return Math.sign(distance) * resisted;
};

const resolvePageExitDuration = (offset, viewportWidth) => {
  const width = Math.max(1, Number(viewportWidth) || 1);
  const progress = Math.min(1, Math.abs(Number(offset) || 0) / width);
  return Math.round(
    Math.max(
      PAGE_EXIT_MIN_MS,
      PAGE_EXIT_MAX_MS * Math.max(0.2, 1 - progress),
    ),
  );
};

export const resolveDashboardSwipeThreshold = (viewportWidth) =>
  Math.min(
    SWIPE_THRESHOLD_MAX_PX,
    Math.max(
      SWIPE_THRESHOLD_MIN_PX,
      Math.max(0, Number(viewportWidth) || 0) * SWIPE_THRESHOLD_RATIO,
    ),
  );

export const resolveDashboardSwipeDirection = ({
  deltaX = 0,
  deltaY = 0,
  viewportWidth = 0,
} = {}) => {
  const horizontal = Math.abs(Number(deltaX) || 0);
  const vertical = Math.abs(Number(deltaY) || 0);
  if (
    horizontal < resolveDashboardSwipeThreshold(viewportWidth) ||
    horizontal <= vertical * HORIZONTAL_AXIS_RATIO
  ) {
    return null;
  }
  return deltaX < 0 ? "next" : "previous";
};

export const shouldUseLiveDashboardSwipeMotion = ({
  inputType = "touch",
  userAgent = "",
} = {}) =>
  !(
    inputType === "mouse" &&
    /firefox\//i.test(String(userAgent || ""))
  );

const isViewVisibleToUser = (view, userId) => {
  const visible = view?.visible;
  if (visible == null || visible === true) return true;
  if (visible === false || !Array.isArray(visible) || !userId) return false;
  return visible.some((entry) => entry?.user === userId);
};

const viewRouteName = (view, index) => {
  const configuredPath = normalizePath(view?.path);
  return configuredPath || String(index);
};

const normalizeCardTag = (cardTag) =>
  String(cardTag || "")
    .trim()
    .toLowerCase()
    .replace(/^custom:/, "");

const isConfiguredCardType = (config, normalizedCardTag) =>
  normalizeCardTag(config?.type) === normalizedCardTag;

export const collectDashboardFrigateViewCards = (
  dashboardConfig,
  cardTag = "frigate-view-card",
) => {
  const normalizedCardTag = normalizeCardTag(cardTag);
  const views = dashboardConfig?.views;
  if (!normalizedCardTag || !Array.isArray(views)) return [];

  const records = [];
  let cardOrder = 0;
  views.forEach((view, viewIndex) => {
    const visited = new Set();
    const visit = (value, depth = 0) => {
      if (!value || typeof value !== "object" || depth > 30) return;
      if (visited.has(value)) return;
      visited.add(value);
      if (
        !Array.isArray(value) &&
        isConfiguredCardType(value, normalizedCardTag)
      ) {
        records.push({
          config: value,
          cardOrder,
          view,
          viewIndex,
          viewName: viewRouteName(view, viewIndex),
          viewTitle:
            String(view?.title || "").trim() ||
            `Page ${viewIndex + 1}`,
        });
        cardOrder += 1;
        return;
      }
      Object.values(value).forEach((entry) => visit(entry, depth + 1));
    };
    visit(view);
  });
  return records;
};

export const resolveDashboardSwipeNavigationOwnership = (
  dashboardConfig,
  cardTag = "frigate-view-card",
) => {
  const cards = collectDashboardFrigateViewCards(dashboardConfig, cardTag);
  const claimants = cards.filter(
    ({ config }) => config?.ha_dashboard_swipe_navigation_owner === true,
  );
  return {
    cards,
    claimants,
    owner: claimants[0] || null,
    conflicts: claimants.slice(1),
  };
};

export const resolveDashboardSwipeNavigationPolicy = ({
  dashboardConfig,
  cardTag = "frigate-view-card",
  currentViewName = "",
} = {}) => {
  const ownership = resolveDashboardSwipeNavigationOwnership(
    dashboardConfig,
    cardTag,
  );
  const ownerConfig = ownership.owner?.config || null;
  const mode = ownerConfig
    ? normalizeDashboardSwipeNavigationMode(
        ownerConfig.ha_dashboard_swipe_navigation,
      )
    : DASHBOARD_SWIPE_NAVIGATION_MODES.none;
  const includeOtherFrigateViewPages =
    mode === DASHBOARD_SWIPE_NAVIGATION_MODES.insideCard &&
    ownerConfig?.ha_dashboard_swipe_include_other_cards === true;
  const includeSubviews =
    DASHBOARD_WIDE_SWIPE_MODES.has(mode) &&
    ownerConfig?.ha_dashboard_swipe_include_subviews === true;
  const mouseNavigationEnabled =
    ownerConfig?.ha_dashboard_swipe_mouse_enabled === true;
  const currentViewHasFrigateViewCard = ownership.cards.some(
    ({ viewName }) => viewName === currentViewName,
  );
  const controllerEnabled =
    Boolean(ownerConfig) && mode !== DASHBOARD_SWIPE_NAVIGATION_MODES.none;
  const gestureEnabled =
    controllerEnabled &&
    (mode !== DASHBOARD_SWIPE_NAVIGATION_MODES.insideCard ||
      currentViewHasFrigateViewCard);
  return {
    ...ownership,
    mode,
    controllerEnabled,
    gestureEnabled,
    allowDashboardNavigation:
      gestureEnabled &&
      (DASHBOARD_WIDE_SWIPE_MODES.has(mode) ||
        includeOtherFrigateViewPages),
    includeOtherFrigateViewPages,
    includeSubviews,
    mouseNavigationEnabled,
    restrictDashboardToFrigateViewPages: includeOtherFrigateViewPages,
    currentViewHasFrigateViewCard,
  };
};

export const findHomeAssistantLovelacePanel = (
  huiRoot,
  documentRef = globalThis.document,
) => {
  let current = huiRoot;
  for (let depth = 0; current && depth < 12; depth += 1) {
    if (String(current.tagName || "").toUpperCase() === "HA-PANEL-LOVELACE") {
      return current;
    }
    current = composedParent(current);
  }

  const homeAssistant = documentRef?.querySelector?.("home-assistant");
  const mainRoot = homeAssistant?.shadowRoot?.querySelector?.(
    "home-assistant-main",
  )?.shadowRoot;
  const resolver = mainRoot?.querySelector?.("partial-panel-resolver");
  return (
    resolver?.querySelector?.("ha-panel-lovelace") ||
    resolver?.shadowRoot?.querySelector?.("ha-panel-lovelace") ||
    mainRoot?.querySelector?.("ha-panel-lovelace") ||
    null
  );
};

const currentViewRouteName = ({ panel, huiRoot, windowRef }) => {
  const prefix = normalizePrefix(
    panel?.route?.prefix || huiRoot?.route?.prefix || huiRoot?._route?.prefix,
  );
  const pathname = String(windowRef?.location?.pathname || "");
  if (prefix && pathname.startsWith(`${prefix}/`)) {
    return normalizePath(pathname.slice(prefix.length));
  }
  const panelRoute = normalizePath(panel?.route?.path);
  if (panelRoute) return panelRoute;
  return normalizePath(pathname).split("/").at(-1) || "";
};

export const resolveCurrentHomeAssistantViewName = (options = {}) =>
  currentViewRouteName(options);

export const resolveAdjacentHomeAssistantView = ({
  huiRoot,
  panel = null,
  windowRef = globalThis.window,
  direction,
  includeView = null,
  includeSubviews = false,
} = {}) => {
  const resolvedPanel = panel || findHomeAssistantLovelacePanel(huiRoot);
  const views = resolvedPanel?.lovelace?.config?.views;
  if (!Array.isArray(views) || !views.length) return null;

  const currentName = currentViewRouteName({
    panel: resolvedPanel,
    huiRoot,
    windowRef,
  });
  const currentIndex = views.findIndex(
    (view, index) => viewRouteName(view, index) === currentName,
  );
  if (currentIndex < 0) return null;

  const step = direction === "previous" ? -1 : direction === "next" ? 1 : 0;
  if (!step) return null;
  const userId = resolvedPanel?.hass?.user?.id || "";
  let targetIndex = currentIndex + step;
  while (targetIndex >= 0 && targetIndex < views.length) {
    const candidate = views[targetIndex];
    if (
      (includeSubviews || candidate?.subview !== true) &&
      isViewVisibleToUser(candidate, userId) &&
      (typeof includeView !== "function" ||
        includeView(candidate, targetIndex) !== false)
    ) {
      const prefix = normalizePrefix(
        resolvedPanel?.route?.prefix ||
          huiRoot?.route?.prefix ||
          huiRoot?._route?.prefix,
      );
      if (!prefix) return null;
      const targetName = viewRouteName(candidate, targetIndex);
      return {
        index: targetIndex,
        name: targetName,
        url: `${prefix}/${targetName}${windowRef?.location?.search || ""}${
          windowRef?.location?.hash || ""
        }`,
      };
    }
    targetIndex += step;
  }
  return null;
};

export const navigateToHomeAssistantView = ({
  target,
  windowRef = globalThis.window,
  createLocationChangedEvent = null,
} = {}) => {
  const targetUrl = String(target?.url || "");
  if (!targetUrl || typeof windowRef?.history?.pushState !== "function") {
    return false;
  }
  const currentUrl = `${windowRef?.location?.pathname || ""}${
    windowRef?.location?.search || ""
  }${windowRef?.location?.hash || ""}`;
  if (currentUrl === targetUrl) return false;

  windowRef.history.pushState(null, "", targetUrl);
  let locationChangedEvent = null;
  if (typeof createLocationChangedEvent === "function") {
    locationChangedEvent = createLocationChangedEvent();
  } else {
    const CustomEventCtor = windowRef?.CustomEvent || globalThis.CustomEvent;
    if (typeof CustomEventCtor === "function") {
      locationChangedEvent = new CustomEventCtor("location-changed");
    }
  }
  if (locationChangedEvent) {
    windowRef?.dispatchEvent?.(locationChangedEvent);
  }
  return true;
};

const findTouch = (touches, identifier) =>
  Array.from(touches || []).find(
    (touch) => touch?.identifier === identifier,
  ) ||
  null;

const captureInlineMotion = (surface) =>
  PAGE_MOTION_PROPERTIES.reduce((snapshot, property) => {
    snapshot[property] = {
      value: surface.style.getPropertyValue(property),
      priority: surface.style.getPropertyPriority?.(property) || "",
    };
    return snapshot;
  }, {});

const applyMotionProperty = (motion, property, value) => {
  if (!motion || motion.released || !canManageInlineMotion(motion.surface)) {
    return;
  }
  const normalized = String(value || "");
  motion.surface.style.setProperty(property, normalized, "important");
  motion.applied[property] = {
    value: normalized,
    priority: "important",
  };
};

const applyClipProperty = (motion, property, value) => {
  if (
    !motion ||
    motion.released ||
    !canManageInlineMotion(motion.clipTarget)
  ) {
    return;
  }
  const normalized = String(value || "");
  motion.clipTarget.style.setProperty(property, normalized, "important");
  motion.clipApplied[property] = {
    value: normalized,
    priority: "important",
  };
};

const restoreInlineMotion = (motion) => {
  if (!motion || motion.released || !canManageInlineMotion(motion.surface)) {
    return;
  }
  motion.released = true;
  const owned = PAGE_MOTION_PROPERTIES.reduce((result, property) => {
    const applied = motion.applied[property];
    result[property] =
      Boolean(applied) &&
      motion.surface.style.getPropertyValue(property) === applied.value &&
      (motion.surface.style.getPropertyPriority?.(property) || "") ===
        applied.priority;
    return result;
  }, {});

  if (owned.transition) {
    motion.surface.style.setProperty("transition", "none", "important");
  }
  for (const property of [
    "transform",
    "backface-visibility",
    "will-change",
  ]) {
    if (!owned[property]) continue;
    const original = motion.snapshot[property];
    if (original?.value) {
      motion.surface.style.setProperty(
        property,
        original.value,
        original.priority,
      );
    } else {
      motion.surface.style.removeProperty(property);
    }
  }
  if (owned.transition) {
    const original = motion.snapshot.transition;
    if (original?.value) {
      motion.surface.style.setProperty(
        "transition",
        original.value,
        original.priority,
      );
    } else {
      motion.surface.style.removeProperty("transition");
    }
  }
  if (canManageInlineMotion(motion.clipTarget)) {
    for (const property of PAGE_CLIP_PROPERTIES) {
      const applied = motion.clipApplied[property];
      const stillOwned =
        Boolean(applied) &&
        motion.clipTarget.style.getPropertyValue(property) === applied.value &&
        (motion.clipTarget.style.getPropertyPriority?.(property) || "") ===
          applied.priority;
      if (!stillOwned) continue;
      const original = motion.clipSnapshot[property];
      if (original?.value) {
        motion.clipTarget.style.setProperty(
          property,
          original.value,
          original.priority,
        );
      } else {
        motion.clipTarget.style.removeProperty(property);
      }
    }
  }
};

const createMotion = (surface, clipTarget = null) => {
  if (!canManageInlineMotion(surface)) return null;
  const motion = {
    surface,
    snapshot: captureInlineMotion(surface),
    applied: {},
    offset: 0,
    released: false,
    clipTarget: canManageInlineMotion(clipTarget) ? clipTarget : null,
    clipSnapshot: {},
    clipApplied: {},
  };
  if (motion.clipTarget) {
    motion.clipSnapshot = PAGE_CLIP_PROPERTIES.reduce((snapshot, property) => {
      snapshot[property] = {
        value: motion.clipTarget.style.getPropertyValue(property),
        priority:
          motion.clipTarget.style.getPropertyPriority?.(property) || "",
      };
      return snapshot;
    }, {});
    applyClipProperty(motion, "overflow-x", "hidden");
    applyClipProperty(motion, "overscroll-behavior-x", "contain");
  }
  applyMotionProperty(motion, "will-change", "transform");
  applyMotionProperty(motion, "backface-visibility", "hidden");
  return motion;
};

const formatMotionOffset = (offset) => {
  const rounded = Math.round((Number(offset) || 0) * 100) / 100;
  return Object.is(rounded, -0) ? 0 : rounded;
};

const setMotionOffset = (motion, offset, transition = "none") => {
  if (!motion || motion.released) return;
  motion.offset = Number(offset) || 0;
  applyMotionProperty(motion, "transition", transition || "none");
  applyMotionProperty(
    motion,
    "transform",
    `translateX(${formatMotionOffset(motion.offset)}px)`,
  );
};

const waitForDuration = (options, duration) =>
  new Promise((resolve) => {
    const setTimeoutFn = options?.setTimeoutFn || globalThis.setTimeout;
    setTimeoutFn(resolve, Math.max(0, Number(duration) || 0));
  });

const waitForAnimationFrame = (options) =>
  new Promise((resolve) => {
    const requestAnimationFrameFn = options?.requestAnimationFrameFn;
    if (typeof requestAnimationFrameFn === "function") {
      requestAnimationFrameFn(() => resolve());
      return;
    }
    const setTimeoutFn = options?.setTimeoutFn || globalThis.setTimeout;
    setTimeoutFn(resolve, 16);
  });

const animateMotionTo = async (
  motion,
  offset,
  duration,
  easing,
  options,
) => {
  if (!motion || motion.released) return;
  void motion.surface?.offsetWidth;
  setMotionOffset(
    motion,
    offset,
    `transform ${Math.max(0, Number(duration) || 0)}ms ${easing}`,
  );
  await waitForDuration(options, (Number(duration) || 0) + 16);
};

const animateUnavailableEdgeReturn = async (motion, options) => {
  if (!motion || motion.released) return;
  const initialOffset = Number(motion.offset) || 0;
  if (!initialOffset) return;
  const overshootDistance = Math.min(
    PAGE_EDGE_OVERSHOOT_MAX_PX,
    Math.max(
      PAGE_EDGE_OVERSHOOT_MIN_PX,
      Math.abs(initialOffset) * PAGE_EDGE_OVERSHOOT_RATIO,
    ),
  );
  await animateMotionTo(
    motion,
    -Math.sign(initialOffset) * overshootDistance,
    PAGE_EDGE_OVERSHOOT_MS,
    PAGE_SPRING_EASING,
    options,
  );
  await animateMotionTo(
    motion,
    0,
    PAGE_EDGE_SETTLE_MS,
    PAGE_SLIDE_EASING,
    options,
  );
};

const latestOwnerOptions = (state) => [...state.owners.values()].at(-1) || null;

const ownerOptionsForPath = (state, path) => {
  const entries = [...state.owners.values()];
  const composedPath = Array.isArray(path) ? path : [];
  return (
    entries
      .slice()
      .reverse()
      .find((options) => options.host && composedPath.includes(options.host)) ||
    entries.at(-1) ||
    null
  );
};

const resetGesture = (state) => {
  state.gesture = null;
};

const clearClickSuppression = (state) => {
  state.clickSuppressionUntil = Number.NEGATIVE_INFINITY;
};

const armClickSuppression = (state, options) => {
  const now = Number(options?.nowFn?.()) || Date.now();
  state.clickSuppressionUntil = now + SWIPE_CLICK_SUPPRESSION_MS;
};

const shouldSuppressSwipeActivation = (state) => {
  const options = latestOwnerOptions(state);
  const now = Number(options?.nowFn?.()) || Date.now();
  if (now > state.clickSuppressionUntil) {
    clearClickSuppression(state);
    return false;
  }
  return true;
};

const restoreActiveMotion = (state, motion = state.activeMotion) => {
  if (!motion) return;
  restoreInlineMotion(motion);
  if (state.activeMotion === motion) state.activeMotion = null;
};

const cancelActiveTransition = (state) => {
  state.transitionToken += 1;
  state.transitioning = false;
  restoreActiveMotion(state);
};

const resolveGestureDirection = (gesture, deltaX) => {
  let direction = deltaX < 0 ? "next" : deltaX > 0 ? "previous" : null;
  if (gesture?.isRTL && direction) {
    direction = direction === "next" ? "previous" : "next";
  }
  return direction;
};

const resolveGestureTarget = (state, gesture, direction) => {
  if (!direction) return null;
  if (gesture.targets.has(direction)) return gesture.targets.get(direction);
  let internalPageId = null;
  if (gesture.allowInternalNavigation) {
    try {
      internalPageId =
        gesture.options.resolveInternalPageTarget?.(
          direction,
          gesture.swipePolicy,
        ) || null;
    } catch (_) {
      internalPageId = null;
    }
  }
  if (internalPageId) {
    const target = {
      kind: "internal",
      direction,
      name: String(internalPageId),
      pageId: String(internalPageId),
    };
    gesture.targets.set(direction, target);
    return target;
  }

  if (!gesture.allowDashboardNavigation) {
    gesture.targets.set(direction, null);
    return null;
  }

  const dashboardTarget = resolveAdjacentHomeAssistantView({
    huiRoot: state.huiRoot,
    panel: gesture.options.findPanel?.(state.huiRoot) || null,
    windowRef: gesture.options.windowRef,
    direction,
    includeSubviews: gesture.swipePolicy?.includeSubviews === true,
    includeView: gesture.swipePolicy?.restrictDashboardToFrigateViewPages
      ? (view) =>
          collectDashboardFrigateViewCards(
            { views: [view] },
            gesture.options.cardTag,
          ).length > 0
      : null,
  });
  let dashboardBoundaryPageId = null;
  if (dashboardTarget) {
    const panel = gesture.options.findPanel?.(state.huiRoot) || null;
    const currentViewName = currentViewRouteName({
      panel,
      huiRoot: state.huiRoot,
      windowRef: gesture.options.windowRef,
    });
    const ownerViewName = gesture.swipePolicy?.owner?.viewName || "";
    let transition = null;
    if (
      dashboardTarget.name === ownerViewName &&
      currentViewName !== ownerViewName
    ) {
      transition = "enter";
    } else if (
      currentViewName === ownerViewName &&
      dashboardTarget.name !== ownerViewName
    ) {
      transition = "exit";
    }
    if (transition) {
      try {
        dashboardBoundaryPageId =
          gesture.options.resolveDashboardBoundaryPage?.({
            direction,
            transition,
            swipePolicy: gesture.swipePolicy,
          }) || null;
      } catch (_) {
        dashboardBoundaryPageId = null;
      }
    }
  }
  const target = dashboardTarget
    ? {
        ...dashboardTarget,
        kind: "dashboard",
        direction,
        dashboardBoundaryPageId,
      }
    : null;
  gesture.targets.set(direction, target || null);
  return target || null;
};

const ensureGestureMotion = (state, gesture) => {
  if (gesture.motion && !gesture.motion.released) return gesture.motion;
  const surface =
    gesture.options.findSwipeSurface?.(state.huiRoot) ||
    resolveHomeAssistantDashboardSwipeSurface(state.huiRoot);
  if (!surface) return null;
  restoreActiveMotion(state);
  gesture.motion = createMotion(surface, state.huiRoot);
  state.activeMotion = gesture.motion;
  return gesture.motion;
};

const waitForTargetRoute = async (state, gesture, target, token) => {
  let matchingFrames = 0;
  for (let frame = 0; frame < PAGE_ROUTE_SETTLE_FRAMES; frame += 1) {
    await waitForAnimationFrame(gesture.options);
    if (state.transitionToken !== token) return false;
    if (target.kind === "internal") {
      matchingFrames += 1;
      if (matchingFrames >= 2) return true;
      continue;
    }
    const panel = gesture.options.findPanel?.(state.huiRoot) || null;
    const currentName = currentViewRouteName({
      panel,
      huiRoot: state.huiRoot,
      windowRef: gesture.options.windowRef,
    });
    if (currentName === target.name) {
      matchingFrames += 1;
      if (matchingFrames >= 2) return true;
    } else {
      matchingFrames = 0;
    }
  }
  return state.transitionToken === token;
};

const navigateToGestureTarget = (target, options) => {
  if (target?.kind === "internal") {
    try {
      return options.navigateInternalPage?.(target.pageId) === true;
    } catch (_) {
      return false;
    }
  }
  if (target?.dashboardBoundaryPageId) {
    try {
      options.navigateInternalPage?.(target.dashboardBoundaryPageId);
    } catch (_) {}
  }
  return navigateToHomeAssistantView({
    target,
    windowRef: options.windowRef,
    createLocationChangedEvent: options.createLocationChangedEvent,
  });
};

const notifyDashboardNavigationSettled = (state, target, direction) => {
  if (target?.kind !== "dashboard") return;
  const notified = new Set();
  for (const options of state.owners.values()) {
    const callback = options?.onDashboardNavigationSettled;
    if (
      typeof callback !== "function" ||
      options?.host?.isConnected === false ||
      notified.has(callback)
    ) {
      continue;
    }
    notified.add(callback);
    try {
      callback({ direction, target });
    } catch (_) {}
  }
};

const settleDashboardSwipeGesture = async (
  state,
  gesture,
  { cancelled = false } = {},
) => {
  if (!gesture) return;
  const options = gesture.options;
  const viewportWidth = resolveViewportWidth(options.windowRef);
  const deltaX = gesture.currentX - gesture.startX;
  const deltaY = gesture.currentY - gesture.startY;
  let direction = cancelled
    ? null
    : resolveDashboardSwipeDirection({
        deltaX,
        deltaY,
        viewportWidth,
      });
  if (gesture.axis !== "horizontal") direction = null;
  if (direction && gesture.isRTL) {
    direction = direction === "next" ? "previous" : "next";
  }
  const target = direction
    ? resolveGestureTarget(state, gesture, direction)
    : null;
  const motion = gesture.motion;
  const token = state.transitionToken + 1;
  state.transitionToken = token;
  state.transitioning = true;
  let completedTarget = null;

  try {
    if (!direction) {
      if (motion) {
        await animateMotionTo(
          motion,
          0,
          PAGE_SPRING_MS,
          PAGE_SPRING_EASING,
          options,
        );
      }
      return;
    }

    if (!target) {
      await animateUnavailableEdgeReturn(motion, options);
      return;
    }

    if (!motion) {
      const navigated = navigateToGestureTarget(target, options);
      if (navigated) {
        state.lastNavigationAt = Number(options.nowFn?.()) || Date.now();
        await waitForTargetRoute(state, gesture, target, token);
        if (state.transitionToken === token) completedTarget = target;
      }
      return;
    }

    const physicalDirection = Math.sign(deltaX) ||
      (direction === "next" ? -1 : 1);
    await animateMotionTo(
      motion,
      physicalDirection * viewportWidth,
      resolvePageExitDuration(motion.offset, viewportWidth),
      PAGE_SLIDE_EASING,
      options,
    );
    if (state.transitionToken !== token) return;

    const navigated = navigateToGestureTarget(target, options);
    if (!navigated) {
      await animateMotionTo(
        motion,
        0,
        PAGE_SPRING_MS,
        PAGE_SPRING_EASING,
        options,
      );
      return;
    }
    state.lastNavigationAt = Number(options.nowFn?.()) || Date.now();

    setMotionOffset(motion, -physicalDirection * viewportWidth, "none");
    await waitForTargetRoute(state, gesture, target, token);
    if (state.transitionToken !== token) return;

    const incomingSurface =
      options.findSwipeSurface?.(state.huiRoot) ||
      resolveHomeAssistantDashboardSwipeSurface(state.huiRoot) ||
      motion.surface;
    let incomingMotion = motion;
    if (incomingSurface !== motion.surface) {
      restoreActiveMotion(state, motion);
      incomingMotion = createMotion(incomingSurface, state.huiRoot);
      state.activeMotion = incomingMotion;
      setMotionOffset(
        incomingMotion,
        -physicalDirection * viewportWidth,
        "none",
      );
    }
    await waitForAnimationFrame(options);
    if (state.transitionToken !== token) return;
    await animateMotionTo(
      incomingMotion,
      0,
      PAGE_ENTER_MS,
      PAGE_SLIDE_EASING,
      options,
    );
    if (state.transitionToken === token) completedTarget = target;
  } finally {
    if (state.transitionToken === token) {
      restoreActiveMotion(state);
      state.transitioning = false;
      notifyDashboardNavigationSettled(state, completedTarget, direction);
    }
  }
};

const bindCoordinator = (state) => {
  if (typeof state.eventTarget?.addEventListener !== "function") return;
  const onTouchStart = (event) => {
    clearClickSuppression(state);
    if (state.transitioning) return;
    resetGesture(state);
    restoreActiveMotion(state);
    if (event?.touches?.length !== 1) return;
    const path = event.composedPath?.() || [event.target].filter(Boolean);
    const options = ownerOptionsForPath(state, path);
    if (!options) return;
    const startsInsideOwner =
      options.host?.isConnected !== false && path.includes(options.host);
    if (
      shouldIgnoreDashboardSwipePath(path, {
        getComputedStyleFn: options.getComputedStyleFn,
      })
    ) {
      if (startsInsideOwner) event.stopPropagation?.();
      return;
    }
    let swipePolicy = null;
    try {
      swipePolicy = options.resolveSwipePolicy?.() || null;
    } catch (_) {
      swipePolicy = null;
    }
    const inputType =
      event?.fvcInputType === "mouse" ? "mouse" : "touch";
    if (
      inputType === "mouse" &&
      swipePolicy?.mouseNavigationEnabled !== true
    ) {
      return;
    }
    const touch = event.touches[0];
    const viewportWidth = resolveViewportWidth(options.windowRef);
    const startX = Number(touch?.clientX) || 0;
    let isRTL = false;
    try {
      isRTL =
        String(options.getComputedStyleFn?.(state.huiRoot)?.direction || "") ===
        "rtl";
    } catch (_) {
      isRTL = false;
    }
    let navigationEnabled = swipePolicy
      ? swipePolicy.gestureEnabled === true
      : true;
    if (!swipePolicy) {
      try {
        navigationEnabled = options.isNavigationEnabled?.() !== false;
      } catch (_) {
        navigationEnabled = true;
      }
    }
    if (swipePolicy && !navigationEnabled) return;
    const gesture = {
      identifier: touch.identifier,
      startX,
      startY: Number(touch?.clientY) || 0,
      currentX: startX,
      currentY: Number(touch?.clientY) || 0,
      axis: null,
      isRTL,
      allowInternalNavigation:
        navigationEnabled &&
        startsInsideOwner,
      allowDashboardNavigation: (() => {
        if (swipePolicy) {
          return swipePolicy.allowDashboardNavigation === true;
        }
        if (!navigationEnabled) return false;
        try {
          return options.allowDashboardNavigation?.() !== false;
        } catch (_) {
          return true;
        }
      })(),
      targets: new Map(),
      motion: null,
      options,
      swipePolicy,
      inputType,
      liveMotionEnabled: shouldUseLiveDashboardSwipeMotion({
        inputType,
        userAgent: options.windowRef?.navigator?.userAgent,
      }),
    };
    gesture.shieldOnly =
      !gesture.allowInternalNavigation && !gesture.allowDashboardNavigation;
    if (viewportWidth > 0) {
      const atCloseEdge =
        startX <= NATIVE_EDGE_CLOSE_GUARD_PX ||
        startX >= viewportWidth - NATIVE_EDGE_CLOSE_GUARD_PX;
      if (atCloseEdge) return;

      const atDrawerEdge = isRTL
        ? startX >= viewportWidth - NATIVE_DRAWER_IDLE_GUARD_PX
        : startX <= NATIVE_DRAWER_IDLE_GUARD_PX;
      const drawerDirection = isRTL ? "next" : "previous";
      if (
        atDrawerEdge &&
        !resolveGestureTarget(state, gesture, drawerDirection)
      ) {
        return;
      }
    }
    event.stopPropagation?.();
    const now = Number(options.nowFn?.()) || Date.now();
    if (now - state.lastNavigationAt < NAVIGATION_COOLDOWN_MS) return;
    state.gesture = gesture;
  };

  const updateGesture = (touch) => {
    if (!state.gesture || !touch) return false;
    state.gesture.currentX = Number(touch.clientX) || 0;
    state.gesture.currentY = Number(touch.clientY) || 0;
    return true;
  };

  const onTouchMove = (event) => {
    const gesture = state.gesture;
    if (!gesture) return;
    const touch = findTouch(event.touches, gesture.identifier);
    if (!updateGesture(touch)) {
      resetGesture(state);
      void settleDashboardSwipeGesture(state, gesture, { cancelled: true });
      return;
    }
    const deltaX = gesture.currentX - gesture.startX;
    const deltaY = gesture.currentY - gesture.startY;
    const horizontal = Math.abs(deltaX);
    const vertical = Math.abs(deltaY);
    if (!gesture.axis && Math.max(horizontal, vertical) >= AXIS_LOCK_PX) {
      if (horizontal > vertical * HORIZONTAL_AXIS_RATIO) {
        gesture.axis = "horizontal";
        armClickSuppression(state, gesture.options);
      } else if (vertical > horizontal) {
        resetGesture(state);
        return;
      }
    }
    if (gesture.axis !== "horizontal") return;
    if (gesture.shieldOnly) return;
    if (event.cancelable !== false) event.preventDefault?.();
    if (!gesture.liveMotionEnabled) return;

    const direction = resolveGestureDirection(gesture, deltaX);
    const target = resolveGestureTarget(state, gesture, direction);
    const motion = ensureGestureMotion(state, gesture);
    if (!motion) return;
    const offset = resolveDashboardSwipeDragOffset({
      deltaX,
      viewportWidth: resolveViewportWidth(gesture.options.windowRef),
      hasTarget: Boolean(target),
    });
    setMotionOffset(motion, offset, "none");
  };

  const onTouchEnd = (event) => {
    const gesture = state.gesture;
    if (!gesture) return;
    updateGesture(findTouch(event.changedTouches, gesture.identifier));
    resetGesture(state);
    if (gesture.shieldOnly) return;
    void settleDashboardSwipeGesture(state, gesture);
  };

  const onTouchCancel = (event) => {
    const gesture = state.gesture;
    if (!gesture) return;
    resetGesture(state);
    if (gesture.shieldOnly) return;
    void settleDashboardSwipeGesture(state, gesture, { cancelled: true });
  };
  const wrapPointerEvent = (event, listName) => ({
    fvcInputType: "mouse",
    [listName]: [
      {
        identifier: event.pointerId,
        clientX: event.clientX,
        clientY: event.clientY,
      },
    ],
    target: event.target,
    cancelable: event.cancelable,
    composedPath: () => event.composedPath?.() || [event.target].filter(Boolean),
    preventDefault: () => event.preventDefault?.(),
    stopPropagation: () => event.stopPropagation?.(),
  });
  const onPointerDown = (event) => {
    if (
      event?.pointerType !== "mouse" ||
      event?.button !== 0 ||
      event?.isPrimary === false
    ) {
      return;
    }
    onTouchStart(wrapPointerEvent(event, "touches"));
  };
  const onPointerMove = (event) => {
    if (
      event?.pointerType !== "mouse" ||
      state.gesture?.inputType !== "mouse" ||
      event.pointerId !== state.gesture.identifier
    ) {
      return;
    }
    onTouchMove(wrapPointerEvent(event, "touches"));
    if (
      state.gesture?.axis === "horizontal" &&
      state.gesture.pointerCaptured !== true
    ) {
      state.gesture.pointerCaptured = true;
      state.gesture.pointerCaptureTarget = event.target || null;
      event.target?.setPointerCapture?.(event.pointerId);
    }
  };
  const releaseMousePointer = (event, { cancelled = false } = {}) => {
    const gesture = state.gesture;
    if (
      event?.pointerType !== "mouse" ||
      gesture?.inputType !== "mouse" ||
      event.pointerId !== gesture.identifier
    ) {
      return;
    }
    try {
      gesture.pointerCaptureTarget?.releasePointerCapture?.(event.pointerId);
    } catch (_) {}
    if (cancelled) {
      onTouchCancel(wrapPointerEvent(event, "changedTouches"));
      return;
    }
    onTouchEnd(wrapPointerEvent(event, "changedTouches"));
  };
  const onPointerUp = (event) => releaseMousePointer(event);
  const onPointerCancel = (event) =>
    releaseMousePointer(event, { cancelled: true });
  const onActivation = (event) => {
    if (!shouldSuppressSwipeActivation(state)) return;
    event.preventDefault?.();
    event.stopPropagation?.();
  };
  state.handlers = {
    touchstart: onTouchStart,
    touchmove: onTouchMove,
    touchend: onTouchEnd,
    touchcancel: onTouchCancel,
    pointerdown: onPointerDown,
    pointermove: onPointerMove,
    pointerup: onPointerUp,
    pointercancel: onPointerCancel,
    click: onActivation,
    action: onActivation,
  };
  state.eventTarget.addEventListener("touchstart", onTouchStart, {
    passive: true,
  });
  state.eventTarget.addEventListener("touchmove", onTouchMove, {
    passive: false,
  });
  state.eventTarget.addEventListener("touchend", onTouchEnd, {
    passive: true,
  });
  state.eventTarget.addEventListener("touchcancel", onTouchCancel, {
    passive: true,
  });
  state.eventTarget.addEventListener("pointerdown", onPointerDown, {
    passive: true,
  });
  state.eventTarget.addEventListener("pointermove", onPointerMove, {
    passive: false,
  });
  state.eventTarget.addEventListener("pointerup", onPointerUp, {
    passive: true,
  });
  state.eventTarget.addEventListener("pointercancel", onPointerCancel, {
    passive: true,
  });
  state.eventTarget.addEventListener("click", onActivation, { capture: true });
  state.eventTarget.addEventListener("action", onActivation, {
    capture: true,
  });
};

const unbindCoordinator = (state) => {
  if (!state.handlers) return;
  for (const [type, handler] of Object.entries(state.handlers)) {
    const capture = ["click", "action"].includes(type);
    state.eventTarget?.removeEventListener?.(type, handler, { capture });
  }
  state.handlers = null;
};

const syncCoordinatorEventTarget = (state) => {
  const eventTarget = resolveDashboardSwipeEventTarget(state.huiRoot);
  if (!eventTarget || eventTarget === state.eventTarget) {
    return Boolean(eventTarget);
  }
  resetGesture(state);
  cancelActiveTransition(state);
  unbindCoordinator(state);
  state.eventTarget = eventTarget;
  bindCoordinator(state);
  return true;
};

const observeCoordinatorEventTarget = (state) => {
  if (state.viewObserver) return;
  const MutationObserverCtor = latestOwnerOptions(state)?.MutationObserverCtor;
  if (
    typeof MutationObserverCtor !== "function" ||
    !state.huiRoot?.shadowRoot
  ) {
    return;
  }
  state.viewObserver = new MutationObserverCtor(() => {
    syncCoordinatorEventTarget(state);
  });
  state.viewObserver.observe(state.huiRoot.shadowRoot, {
    childList: true,
    subtree: true,
  });
};

const acquireDashboardSwipe = (owner, huiRoot, options) => {
  if (!huiRoot?.shadowRoot) return false;
  let state = coordinatorByRoot.get(huiRoot);
  if (!state) {
    state = {
      huiRoot,
      eventTarget: null,
      owners: new Map(),
      handlers: null,
      viewObserver: null,
      gesture: null,
      activeMotion: null,
      transitioning: false,
      transitionToken: 0,
      lastNavigationAt: Number.NEGATIVE_INFINITY,
      clickSuppressionUntil: Number.NEGATIVE_INFINITY,
    };
    coordinatorByRoot.set(huiRoot, state);
  }
  state.owners.delete(owner);
  state.owners.set(owner, options);
  observeCoordinatorEventTarget(state);
  return syncCoordinatorEventTarget(state);
};

const releaseDashboardSwipe = (owner, huiRoot) => {
  const state = coordinatorByRoot.get(huiRoot);
  if (!state) return;
  state.owners.delete(owner);
  if (state.owners.size) return;
  resetGesture(state);
  clearClickSuppression(state);
  cancelActiveTransition(state);
  unbindCoordinator(state);
  state.viewObserver?.disconnect?.();
  state.viewObserver = null;
  coordinatorByRoot.delete(huiRoot);
};

const findHomeAssistantObserverTargets = (documentRef) => {
  const homeAssistant = documentRef?.querySelector?.("home-assistant");
  const mainRoot = homeAssistant?.shadowRoot?.querySelector?.(
    "home-assistant-main",
  )?.shadowRoot;
  if (!mainRoot) return [];
  const resolver = mainRoot.querySelector?.("partial-panel-resolver") || null;
  const panel =
    resolver?.querySelector?.("ha-panel-lovelace") ||
    resolver?.shadowRoot?.querySelector?.("ha-panel-lovelace") ||
    mainRoot.querySelector?.("ha-panel-lovelace") ||
    null;
  return [mainRoot, resolver, panel?.shadowRoot].filter(
    (target, index, targets) =>
      Boolean(target) && targets.indexOf(target) === index,
  );
};

const findCurrentDashboardHuiRoot = (documentRef) =>
  findCurrentHomeAssistantLovelaceRoot(documentRef) ||
  findHomeAssistantLovelacePanel(null, documentRef)?.shadowRoot?.querySelector?.(
    "hui-root",
  ) ||
  null;

export const dashboardConfigEnablesPreMountSwipeNavigation = (
  dashboardConfig,
  cardTag = "frigate-view-card",
) => {
  const { owner } = resolveDashboardSwipeNavigationOwnership(
    dashboardConfig,
    cardTag,
  );
  if (!owner) return false;
  const mode = normalizeDashboardSwipeNavigationMode(
    owner.config?.ha_dashboard_swipe_navigation,
  );
  return (
    DASHBOARD_WIDE_SWIPE_MODES.has(mode) ||
    (mode === DASHBOARD_SWIPE_NAVIGATION_MODES.insideCard &&
      owner.config?.ha_dashboard_swipe_include_other_cards === true)
  );
};

export class HomeAssistantDashboardSwipeNavigationController {
  constructor(
    host,
    {
      MutationObserverCtor = globalThis.MutationObserver,
      documentRef = globalThis.document,
      windowRef = globalThis.window,
      hasTouch = true,
      getComputedStyleFn = globalThis.getComputedStyle,
      queueMicrotaskFn = globalThis.queueMicrotask,
      nowFn = () => globalThis.performance?.now?.() || Date.now(),
      requestAnimationFrameFn = null,
      setTimeoutFn = globalThis.setTimeout,
      createLocationChangedEvent = null,
      findCurrentHuiRoot = () =>
        findCurrentDashboardHuiRoot(documentRef),
      findPanel = (huiRoot) =>
        findHomeAssistantLovelacePanel(huiRoot, documentRef),
      findSwipeSurface = (huiRoot) =>
        resolveHomeAssistantDashboardSwipeSurface(huiRoot),
      resolveInternalPageTarget = null,
      resolveDashboardBoundaryPage = null,
      allowDashboardNavigation = null,
      isNavigationEnabled = null,
      navigateInternalPage = null,
      onDashboardNavigationSettled = null,
      onDashboardScopeExited = null,
      cardTag = "frigate-view-card",
      enforceDashboardOwner = false,
    } = {},
  ) {
    this._host = host;
    this._MutationObserverCtor = MutationObserverCtor;
    this._documentRef = documentRef;
    this._windowRef = windowRef;
    this._hasTouch = hasTouch === true;
    this._getComputedStyleFn = getComputedStyleFn;
    this._queueMicrotask =
      typeof queueMicrotaskFn === "function"
        ? queueMicrotaskFn.bind(windowRef || globalThis)
        : (callback) => Promise.resolve().then(callback);
    this._nowFn = nowFn;
    this._requestAnimationFrameFn =
      typeof requestAnimationFrameFn === "function"
        ? requestAnimationFrameFn
        : typeof windowRef?.requestAnimationFrame === "function"
          ? windowRef.requestAnimationFrame.bind(windowRef)
          : null;
    this._setTimeoutFn =
      typeof setTimeoutFn === "function" ? setTimeoutFn : globalThis.setTimeout;
    this._createLocationChangedEvent = createLocationChangedEvent;
    this._findCurrentHuiRoot = findCurrentHuiRoot;
    this._findPanel = findPanel;
    this._findSwipeSurface = findSwipeSurface;
    this._resolveInternalPageTarget = resolveInternalPageTarget;
    this._resolveDashboardBoundaryPage = resolveDashboardBoundaryPage;
    this._allowDashboardNavigation = allowDashboardNavigation;
    this._isNavigationEnabled = isNavigationEnabled;
    this._navigateInternalPage = navigateInternalPage;
    this._onDashboardNavigationSettled = onDashboardNavigationSettled;
    this._onDashboardScopeExited = onDashboardScopeExited;
    this._cardTag = normalizeCardTag(cardTag) || "frigate-view-card";
    this._enforceDashboardOwner = enforceDashboardOwner === true;
    this._huiRoot = null;
    this._dashboardKey = null;
    this._hostDashboardKey = null;
    this._dashboardScopeActive = false;
    this._dashboardObserver = null;
    this._observedShellTargets = [];
    this._dashboardSyncQueued = false;
    this._rootRetryActive = false;
    this._rootRetryToken = 0;
    this._onDashboardLocationChanged = () => this._scheduleDashboardSync();
  }

  shouldEnable() {
    const swipePolicy = this._enforceDashboardOwner
      ? this._resolveSwipePolicy()
      : null;
    const supportsConfiguredInput =
      this._hasTouch || swipePolicy?.mouseNavigationEnabled === true;
    if (
      !supportsConfiguredInput ||
      this._host?._isEditorPreviewContext?.() === true ||
      (this._host?.isConnected === false && !this._dashboardScopeActive)
    ) {
      return false;
    }
    return (
      !this._enforceDashboardOwner ||
      swipePolicy?.controllerEnabled === true
    );
  }

  _resolveSwipePolicy(huiRoot = this._huiRoot) {
    if (!this._enforceDashboardOwner) return null;
    const currentRoot =
      huiRoot ||
      findHomeAssistantLovelaceRoot(this._host) ||
      this._findCurrentHuiRoot?.() ||
      null;
    const panel = this._findPanel?.(currentRoot) || null;
    const dashboardConfig = panel?.lovelace?.config || null;
    const currentViewName = currentViewRouteName({
      panel,
      huiRoot: currentRoot,
      windowRef: this._windowRef,
    });
    return resolveDashboardSwipeNavigationPolicy({
      dashboardConfig,
      cardTag: this._cardTag,
      currentViewName,
    });
  }

  _ownerOptions() {
    return {
      host: this._host,
      MutationObserverCtor: this._MutationObserverCtor,
      documentRef: this._documentRef,
      windowRef: this._windowRef,
      getComputedStyleFn: this._getComputedStyleFn,
      nowFn: this._nowFn,
      requestAnimationFrameFn: this._requestAnimationFrameFn,
      setTimeoutFn: this._setTimeoutFn,
      createLocationChangedEvent: this._createLocationChangedEvent,
      findPanel: this._findPanel,
      findSwipeSurface: this._findSwipeSurface,
      resolveInternalPageTarget: this._resolveInternalPageTarget,
      resolveDashboardBoundaryPage: this._resolveDashboardBoundaryPage,
      allowDashboardNavigation: this._allowDashboardNavigation,
      isNavigationEnabled: this._isNavigationEnabled,
      navigateInternalPage: this._navigateInternalPage,
      onDashboardNavigationSettled: this._onDashboardNavigationSettled,
      cardTag: this._cardTag,
      resolveSwipePolicy: () => this._resolveSwipePolicy(),
    };
  }

  isCurrentDashboardScope() {
    const expectedKey = this._hostDashboardKey || this._dashboardKey;
    if (!expectedKey) return false;
    const currentPathKey = resolveHomeAssistantDashboardKey(
      null,
      this._windowRef,
    );
    return dashboardKeysMatch(currentPathKey, expectedKey);
  }

  _notifyDashboardScopeExited() {
    try {
      this._onDashboardScopeExited?.();
    } catch (_) {}
  }

  _moveToRoot(huiRoot) {
    if (!huiRoot) {
      this._releaseCurrentRoot();
      return false;
    }
    if (this._huiRoot && this._huiRoot !== huiRoot) {
      releaseDashboardSwipe(this, this._huiRoot);
      this._huiRoot = null;
    }
    this._huiRoot = huiRoot;
    return acquireDashboardSwipe(this, huiRoot, this._ownerOptions());
  }

  _releaseCurrentRoot() {
    if (!this._huiRoot) return;
    releaseDashboardSwipe(this, this._huiRoot);
    this._huiRoot = null;
  }

  _observeHomeAssistantShell() {
    const targets = findHomeAssistantObserverTargets(this._documentRef);
    if (
      targets.length === this._observedShellTargets.length &&
      targets.every((target, index) => target === this._observedShellTargets[index])
    ) {
      return;
    }
    this._dashboardObserver?.disconnect?.();
    this._dashboardObserver = null;
    this._observedShellTargets = targets;
    if (!targets.length || typeof this._MutationObserverCtor !== "function") {
      return;
    }
    this._dashboardObserver = new this._MutationObserverCtor(() =>
      this._scheduleDashboardSync(),
    );
    for (const target of targets) {
      this._dashboardObserver.observe(target, { childList: true });
    }
  }

  _startDashboardMonitoring(huiRoot) {
    if (!this._dashboardScopeActive) {
      this._windowRef?.addEventListener?.(
        "location-changed",
        this._onDashboardLocationChanged,
      );
      this._windowRef?.addEventListener?.(
        "popstate",
        this._onDashboardLocationChanged,
      );
    }
    this._dashboardScopeActive = true;
    this._dashboardKey = resolveHomeAssistantDashboardKey(
      huiRoot,
      this._windowRef,
    );
    this._hostDashboardKey = this._dashboardKey;
    this._observeHomeAssistantShell();
  }

  _cancelRootRetry() {
    this._rootRetryToken += 1;
    this._rootRetryActive = false;
  }

  _scheduleRootRetry() {
    if (!this._dashboardScopeActive || this._rootRetryActive) return;
    this._rootRetryActive = true;
    const token = this._rootRetryToken + 1;
    this._rootRetryToken = token;
    let remaining = ROOT_RETRY_FRAMES;
    const run = () => {
      const callback = () => {
        if (
          token !== this._rootRetryToken ||
          !this._dashboardScopeActive
        ) {
          return;
        }
        const huiRoot = this._findCurrentHuiRoot?.() || null;
        if (huiRoot) {
          this._rootRetryActive = false;
          const dashboardKey = resolveHomeAssistantDashboardKey(
            huiRoot,
            this._windowRef,
          );
          if (dashboardKeysMatch(dashboardKey, this._dashboardKey)) {
            this._moveToRoot(huiRoot);
          } else {
            this._releaseCurrentRoot();
          }
          return;
        }
        remaining -= 1;
        if (remaining <= 0) {
          this._rootRetryActive = false;
          return;
        }
        run();
      };
      if (typeof this._requestAnimationFrameFn === "function") {
        this._requestAnimationFrameFn(callback);
      } else {
        this._setTimeoutFn(callback, 16);
      }
    };
    run();
  }

  _stopDashboardMonitoring() {
    if (this._dashboardScopeActive) {
      this._windowRef?.removeEventListener?.(
        "location-changed",
        this._onDashboardLocationChanged,
      );
      this._windowRef?.removeEventListener?.(
        "popstate",
        this._onDashboardLocationChanged,
      );
    }
    this._dashboardObserver?.disconnect?.();
    this._dashboardObserver = null;
    this._observedShellTargets = [];
    this._dashboardScopeActive = false;
    this._dashboardKey = null;
    this._dashboardSyncQueued = false;
    this._cancelRootRetry();
  }

  _scheduleDashboardSync() {
    if (!this._dashboardScopeActive || this._dashboardSyncQueued) return;
    this._dashboardSyncQueued = true;
    this._queueMicrotask(() => {
      this._dashboardSyncQueued = false;
      if (!this._dashboardScopeActive) return;
      this._observeHomeAssistantShell();
      const huiRoot = this._findCurrentHuiRoot?.() || null;
      const dashboardKey = resolveHomeAssistantDashboardKey(
        huiRoot,
        this._windowRef,
      );
      if (!huiRoot) {
        if (!dashboardKeysMatch(dashboardKey, this._dashboardKey)) {
          this._notifyDashboardScopeExited();
          this._deactivate();
          return;
        }
        this._scheduleRootRetry();
        return;
      }
      if (!dashboardKeysMatch(dashboardKey, this._dashboardKey)) {
        this._notifyDashboardScopeExited();
        this._deactivate();
        return;
      }
      this._cancelRootRetry();
      this._moveToRoot(huiRoot);
    });
  }

  _deactivate() {
    this._stopDashboardMonitoring();
    this._releaseCurrentRoot();
  }

  sync() {
    const hostHuiRoot = findHomeAssistantLovelaceRoot(this._host);
    if (hostHuiRoot) {
      this._hostDashboardKey = resolveHomeAssistantDashboardKey(
        hostHuiRoot,
        this._windowRef,
      );
    }
    if (!this.shouldEnable()) {
      this._deactivate();
      return false;
    }
    const huiRoot =
      hostHuiRoot ||
      this._findCurrentHuiRoot?.() ||
      null;
    this._startDashboardMonitoring(huiRoot);
    if (!huiRoot) {
      this._scheduleRootRetry();
      return false;
    }
    this._cancelRootRetry();
    return this._moveToRoot(huiRoot);
  }

  disconnect({ force = false } = {}) {
    if (this._dashboardScopeActive && !force) {
      this._scheduleDashboardSync();
      return;
    }
    this._deactivate();
  }
}

export const installHomeAssistantDashboardSwipeNavigation = ({
  cardTag = "frigate-view-card",
  documentRef = globalThis.document,
  windowRef = globalThis.window,
  MutationObserverCtor = globalThis.MutationObserver,
  hasTouch =
    Boolean(windowRef && "ontouchstart" in windowRef) ||
    Number(windowRef?.navigator?.maxTouchPoints || 0) > 0,
  getComputedStyleFn = globalThis.getComputedStyle,
  queueMicrotaskFn = globalThis.queueMicrotask,
  nowFn = () => globalThis.performance?.now?.() || Date.now(),
  requestAnimationFrameFn = windowRef?.requestAnimationFrame?.bind(windowRef),
  setTimeoutFn = windowRef?.setTimeout?.bind(windowRef) || globalThis.setTimeout,
  createLocationChangedEvent = null,
  findCurrentHuiRoot = () => findCurrentDashboardHuiRoot(documentRef),
  findPanel = (huiRoot) =>
    findHomeAssistantLovelacePanel(huiRoot, documentRef),
  findSwipeSurface = (huiRoot) =>
    resolveHomeAssistantDashboardSwipeSurface(huiRoot),
} = {}) => {
  if (!windowRef || !documentRef) return null;
  if (windowRef[PREMOUNT_NAVIGATION_KEY]) {
    return windowRef[PREMOUNT_NAVIGATION_KEY];
  }

  const bootstrapHost = {
    isConnected: true,
    _isEditorPreviewContext: () => false,
  };
  const queueMicrotaskSafe =
    typeof queueMicrotaskFn === "function"
      ? queueMicrotaskFn.bind(windowRef)
      : (callback) => Promise.resolve().then(callback);
  let navigationController = null;
  let retryToken = 0;
  let disconnected = false;

  const releaseController = () => {
    navigationController?.disconnect?.({ force: true });
    navigationController = null;
  };
  const scheduleSync = () => {
    const token = retryToken + 1;
    retryToken = token;
    let remaining = PREMOUNT_NAVIGATION_RETRY_FRAMES;
    const run = () => {
      if (disconnected || token !== retryToken) return;
      const huiRoot = findCurrentHuiRoot?.() || null;
      const panel = huiRoot ? findPanel?.(huiRoot) || null : null;
      const dashboardConfig = panel?.lovelace?.config || null;
      if (huiRoot && dashboardConfig) {
        const swipePolicy = resolveDashboardSwipeNavigationPolicy({
          dashboardConfig,
          cardTag,
          currentViewName: currentViewRouteName({
            panel,
            huiRoot,
            windowRef,
          }),
        });
        if (
          (!hasTouch && swipePolicy.mouseNavigationEnabled !== true) ||
          !dashboardConfigEnablesPreMountSwipeNavigation(
            dashboardConfig,
            cardTag,
          )
        ) {
          releaseController();
          return;
        }
        if (!navigationController) {
          navigationController =
            new HomeAssistantDashboardSwipeNavigationController(
              bootstrapHost,
              {
                MutationObserverCtor,
                documentRef,
                windowRef,
                hasTouch,
                getComputedStyleFn,
                queueMicrotaskFn,
                nowFn,
                requestAnimationFrameFn,
                setTimeoutFn,
                createLocationChangedEvent,
                findCurrentHuiRoot,
                findPanel,
                findSwipeSurface,
                resolveInternalPageTarget: () => null,
                allowDashboardNavigation: () => true,
                isNavigationEnabled: () => true,
                navigateInternalPage: () => false,
                onDashboardScopeExited: () => {
                  navigationController = null;
                  queueMicrotaskSafe(scheduleSync);
                },
                cardTag,
                enforceDashboardOwner: true,
              },
            );
        }
        navigationController.sync();
        return;
      }
      remaining -= 1;
      if (remaining <= 0) return;
      if (typeof requestAnimationFrameFn === "function") {
        requestAnimationFrameFn(run);
      } else {
        setTimeoutFn(run, 16);
      }
    };
    run();
  };
  const onLocationChanged = () => scheduleSync();
  const disconnect = () => {
    if (disconnected) return;
    disconnected = true;
    retryToken += 1;
    releaseController();
    windowRef.removeEventListener?.("location-changed", onLocationChanged);
    windowRef.removeEventListener?.("popstate", onLocationChanged);
    if (windowRef[PREMOUNT_NAVIGATION_KEY]?.disconnect === disconnect) {
      delete windowRef[PREMOUNT_NAVIGATION_KEY];
    }
  };
  const bootstrap = { disconnect, sync: scheduleSync };
  windowRef[PREMOUNT_NAVIGATION_KEY] = bootstrap;
  windowRef.addEventListener?.("location-changed", onLocationChanged);
  windowRef.addEventListener?.("popstate", onLocationChanged);
  scheduleSync();
  void windowRef.customElements
    ?.whenDefined?.("hui-root")
    ?.then?.(scheduleSync);
  return bootstrap;
};
