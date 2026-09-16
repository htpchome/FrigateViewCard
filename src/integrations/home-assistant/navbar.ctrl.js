// Keep Home Assistant shell mutations isolated and fully reversible.
const NAVBAR_STYLE_ATTRIBUTE = "data-frigate-view-ha-navbar-style";
const BOTTOM_NAVBAR_EXTRA_HEIGHT_PX = 10;
const HA_SAFE_AREA_TOP =
  "var(--safe-area-inset-top, env(safe-area-inset-top, 0px))";
const HA_SAFE_AREA_BOTTOM =
  "var(--safe-area-inset-bottom, env(safe-area-inset-bottom, 0px))";

const BOTTOM_NAVBAR_STYLE_TEXT = `
.header {
  z-index: 2 !important;
}
ha-tab-group-tab[active],
ha-tab-group-tab[aria-selected="true"] {
  border-block-end: none !important;
  border-block-start: 2px solid var(--primary-color) !important;
}`;

const STACKED_TAB_STYLE_TEXT = `
ha-tab-group-tab.icon-and-title {
  font-size: var(--ha-font-size-xs, 10px) !important;
  line-height: 1 !important;
}
ha-tab-group-tab.icon-and-title::part(base) {
  align-items: center !important;
  flex-direction: column !important;
  gap: 2px !important;
  justify-content: center !important;
  padding-top: 3px !important;
  padding-bottom: 3px !important;
}
ha-tab-group-tab.icon-and-title ha-icon {
  margin-inline-end: 0 !important;
}`;

const LANDSCAPE_VIEW_PROMOTION_STYLE_TEXT = `
@media (orientation: landscape) {
  #view {
    position: relative !important;
    z-index: 2 !important;
  }
  .header {
    z-index: 1 !important;
  }
}`;

export const resolveHomeAssistantNavbarStyleText = ({
  moveBottom = false,
  stackTabs = false,
  promoteViewInLandscape = false,
} = {}) =>
  [
    moveBottom ? BOTTOM_NAVBAR_STYLE_TEXT : "",
    stackTabs ? STACKED_TAB_STYLE_TEXT : "",
    promoteViewInLandscape ? LANDSCAPE_VIEW_PROMOTION_STYLE_TEXT : "",
  ]
    .filter(Boolean)
    .join("\n");

const resolveViewBottomStyles = (isIOS, reserveDashboardEditActions) => {
  const dashboardEditClearance = reserveDashboardEditActions
    ? " + var(--header-height, 56px)"
    : "";
  return {
    "padding-top": HA_SAFE_AREA_TOP,
    "padding-bottom": isIOS
      ? `calc(var(--header-height, 56px)${dashboardEditClearance} + ${BOTTOM_NAVBAR_EXTRA_HEIGHT_PX}px + (${HA_SAFE_AREA_BOTTOM} * 0.25))`
      : `calc(var(--header-height, 56px)${dashboardEditClearance} + ${BOTTOM_NAVBAR_EXTRA_HEIGHT_PX}px)`,
  };
};

const TOOLBAR_BOTTOM_STYLES = Object.freeze({
  "border-bottom": "none",
  "border-top": "1px solid var(--divider-color)",
  "box-sizing": "border-box",
  height: `calc(var(--header-height, 56px) + ${BOTTOM_NAVBAR_EXTRA_HEIGHT_PX}px)`,
  "padding-top": `${BOTTOM_NAVBAR_EXTRA_HEIGHT_PX / 2}px`,
  "padding-bottom": `${BOTTOM_NAVBAR_EXTRA_HEIGHT_PX / 2}px`,
});

const coordinatorByRoot = new WeakMap();
const DASHBOARD_NAVBAR_BOOTSTRAP_KEY = Symbol.for(
  "frigate-view-card.dashboard-navbar-customization",
);

const resolveHeaderBottomStyles = (isIOS) => ({
  top: "auto",
  bottom: "0px",
  position: "fixed",
  // HA's top safe area must not travel with a header moved to the bottom.
  "padding-top": "0px",
  "padding-bottom": isIOS
    ? `calc(${HA_SAFE_AREA_BOTTOM} * 0.25)`
    : "0px",
});

const parsePxLength = (value) => {
  const match = /^(-?\d+(?:\.\d+)?)px$/i.exec(
    String(value || "").trim(),
  );
  if (!match) return null;
  const parsed = Number(match[1]);
  return Number.isFinite(parsed) ? parsed : null;
};

const canManageInlineStyle = (element) =>
  typeof element?.style?.getPropertyValue === "function" &&
  typeof element.style.setProperty === "function" &&
  typeof element.style.removeProperty === "function";

const captureInlineStyles = (element, styles) =>
  Object.keys(styles).reduce((snapshot, property) => {
    snapshot[property] = {
      value: element.style.getPropertyValue(property),
      priority: element.style.getPropertyPriority?.(property) || "",
    };
    return snapshot;
  }, {});

const applyInlineStyles = (element, styles) => {
  if (!canManageInlineStyle(element)) return;
  for (const [property, value] of Object.entries(styles)) {
    element.style.setProperty(property, value, "important");
  }
};

const restoreInlineStyles = (element, snapshot, appliedStyles) => {
  if (!canManageInlineStyle(element) || !snapshot || !appliedStyles) return;
  for (const [property, original] of Object.entries(snapshot)) {
    const currentValue = element.style.getPropertyValue(property);
    const currentPriority =
      element.style.getPropertyPriority?.(property) || "";
    if (
      currentValue !== appliedStyles[property] ||
      currentPriority !== "important"
    ) {
      continue;
    }
    if (original.value) {
      element.style.setProperty(property, original.value, original.priority);
    } else {
      element.style.removeProperty(property);
    }
  }
};

const composedParent = (element) => {
  if (!element) return null;
  if (element.parentNode) return element.parentNode;
  const root = element.getRootNode?.();
  return root && root !== element ? root.host || null : element.host || null;
};

export const findHomeAssistantLovelaceRoot = (host) => {
  let current = host;
  for (let depth = 0; current && depth < 40; depth += 1) {
    if (String(current.tagName || "").toUpperCase() === "HUI-ROOT") {
      return current;
    }
    current = composedParent(current);
  }
  return null;
};

export const findCurrentHomeAssistantLovelaceRoot = (
  documentRef = globalThis.document,
) => {
  const homeAssistant = documentRef?.querySelector?.("home-assistant");
  const mainRoot = homeAssistant?.shadowRoot?.querySelector?.(
    "home-assistant-main",
  )?.shadowRoot;
  const resolver = mainRoot?.querySelector?.("partial-panel-resolver");
  const lovelacePanel =
    resolver?.querySelector?.("ha-panel-lovelace") ||
    resolver?.shadowRoot?.querySelector?.("ha-panel-lovelace") ||
    mainRoot?.querySelector?.("ha-panel-lovelace");
  return lovelacePanel?.shadowRoot?.querySelector?.("hui-root") || null;
};

const findHomeAssistantMainRoot = (documentRef) => {
  const homeAssistant = documentRef?.querySelector?.("home-assistant");
  return (
    homeAssistant?.shadowRoot?.querySelector?.("home-assistant-main")
      ?.shadowRoot || null
  );
};

const normalizeDashboardPath = (value) => {
  const normalized = String(value || "")
    .trim()
    .replace(/\/+$/, "");
  return normalized || "";
};

export const resolveHomeAssistantDashboardKey = (
  huiRoot,
  windowRef = globalThis.window,
) => {
  const routePrefix = normalizeDashboardPath(
    huiRoot?.route?.prefix || huiRoot?._route?.prefix,
  );
  if (routePrefix) return `route:${routePrefix}`;

  const firstPathSegment = String(windowRef?.location?.pathname || "")
    .split("/")
    .filter(Boolean)[0];
  if (firstPathSegment) return `path:/${firstPathSegment}`;

  return huiRoot || null;
};

const normalizeCardTag = (cardTag) =>
  String(cardTag || "")
    .trim()
    .toLowerCase()
    .replace(/^custom:/, "");

const dashboardViewName = (view, index) => {
  const configuredPath = String(view?.path || "")
    .trim()
    .replace(/^\/+|\/+$/g, "");
  return configuredPath || String(index);
};

const findHomeAssistantLovelacePanel = (huiRoot, documentRef) => {
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

const findNavbarBootstrapObserverTargets = (documentRef) => {
  const homeAssistant = documentRef?.querySelector?.("home-assistant");
  const homeAssistantRoot = homeAssistant?.shadowRoot || null;
  const mainRoot = homeAssistantRoot?.querySelector?.(
    "home-assistant-main",
  )?.shadowRoot;
  const resolver = mainRoot?.querySelector?.("partial-panel-resolver") || null;
  const panel =
    resolver?.querySelector?.("ha-panel-lovelace") ||
    resolver?.shadowRoot?.querySelector?.("ha-panel-lovelace") ||
    mainRoot?.querySelector?.("ha-panel-lovelace") ||
    null;
  return [
    documentRef?.documentElement,
    homeAssistantRoot,
    mainRoot,
    resolver,
    resolver?.shadowRoot,
    panel?.shadowRoot,
  ].filter(
    (target, index, targets) =>
      Boolean(target) && targets.indexOf(target) === index,
  );
};

export const resolveDashboardNavbarOwnership = (
  dashboardConfig,
  cardTag = "frigate-view-card",
) => {
  const normalizedCardTag = normalizeCardTag(cardTag);
  const cards = [];
  if (!normalizedCardTag || !Array.isArray(dashboardConfig?.views)) {
    return { cards, claimants: [], owner: null, conflicts: [] };
  }

  let cardOrder = 0;
  dashboardConfig.views.forEach((view, viewIndex) => {
    const visited = new Set();
    const visit = (value, depth = 0) => {
      if (!value || typeof value !== "object" || depth > 30) return;
      if (visited.has(value)) return;
      visited.add(value);
      if (
        !Array.isArray(value) &&
        normalizeCardTag(value.type) === normalizedCardTag
      ) {
        cards.push({
          config: value,
          cardOrder,
          view,
          viewIndex,
          viewName: dashboardViewName(view, viewIndex),
          viewTitle:
            String(view?.title || "").trim() || `Page ${viewIndex + 1}`,
        });
        cardOrder += 1;
        return;
      }
      Object.values(value).forEach((entry) => visit(entry, depth + 1));
    };
    visit(view);
  });

  const claimants = cards.filter(
    ({ config }) =>
      config?.mobile_view_ha_navbar_bottom === true &&
      config?.mobile_view_ha_navbar_dashboard === true,
  );
  return {
    cards,
    claimants,
    owner: claimants[0] || null,
    conflicts: claimants.slice(1),
  };
};

export const resolveDashboardNavbarCardOwnership = ({
  dashboardConfig,
  sourceConfig = null,
  requested = false,
  cardTag = "frigate-view-card",
  currentViewName = "",
} = {}) => {
  const ownership = resolveDashboardNavbarOwnership(dashboardConfig, cardTag);
  const exactRecord = ownership.cards.find(
    ({ config }) => config === sourceConfig,
  );
  const currentViewClaimants = ownership.claimants.filter(
    ({ viewName }) => viewName === currentViewName,
  );
  const currentCardIsResolvedOwner =
    Boolean(ownership.owner) &&
    (ownership.owner === exactRecord ||
      (!exactRecord &&
        requested &&
        ownership.owner.viewName === currentViewName &&
        currentViewClaimants.length === 1));
  const isOwner =
    requested && (!ownership.owner || currentCardIsResolvedOwner);
  return {
    ...ownership,
    requested,
    isOwner,
    locked: Boolean(ownership.owner) && !currentCardIsResolvedOwner,
    conflict: requested && Boolean(ownership.owner) && !isOwner,
  };
};

export const resolveHomeAssistantNavbarTargets = (huiRoot) => {
  const root = huiRoot?.shadowRoot;
  if (!root || typeof root.querySelector !== "function") return null;
  const header = root.querySelector(".header");
  const view = root.querySelector("#view");
  if (!canManageInlineStyle(header) || !canManageInlineStyle(view)) {
    return null;
  }
  const toolbar = header.querySelector?.(".toolbar") || null;
  return {
    root,
    header,
    toolbar: canManageInlineStyle(toolbar) ? toolbar : null,
    view,
  };
};

const removeNavbarStyle = (state) => {
  const style = state.navbarStyle;
  if (!style) return;
  if (style.parentNode?.removeChild) style.parentNode.removeChild(style);
  else style.remove?.();
  state.navbarStyle = null;
  state.navbarStyleText = "";
};

const restoreManagedGeometry = (state) => {
  restoreInlineStyles(
    state.header,
    state.headerSnapshot,
    state.headerAppliedStyles,
  );
  restoreInlineStyles(
    state.toolbar,
    state.toolbarSnapshot,
    TOOLBAR_BOTTOM_STYLES,
  );
  restoreInlineStyles(
    state.view,
    state.viewSnapshot,
    state.viewAppliedStyles,
  );
  state.headerSnapshot = null;
  state.headerAppliedStyles = null;
  state.toolbarSnapshot = null;
  state.viewSnapshot = null;
  state.viewAppliedStyles = null;
  state.geometryApplied = false;
};

const restoreManagedTargets = (state) => {
  restoreManagedGeometry(state);
  removeNavbarStyle(state);
  state.header = null;
  state.toolbar = null;
  state.view = null;
};

const ensureNavbarStyle = (state, styleText) => {
  if (!styleText) {
    removeNavbarStyle(state);
    return;
  }
  if (state.navbarStyle?.parentNode === state.header) {
    if (state.navbarStyleText !== styleText) {
      state.navbarStyle.textContent = styleText;
      state.navbarStyleText = styleText;
    }
    return;
  }
  removeNavbarStyle(state);
  const documentRef = state.header?.ownerDocument || globalThis.document;
  const style = documentRef?.createElement?.("style");
  if (!style || typeof state.header?.appendChild !== "function") return;
  style.setAttribute?.(NAVBAR_STYLE_ATTRIBUTE, "");
  style.textContent = styleText;
  state.header.appendChild(style);
  state.navbarStyle = style;
  state.navbarStyleText = styleText;
};

const applyManagedTargets = (state) => {
  const targets = resolveHomeAssistantNavbarTargets(state.huiRoot);
  if (!targets) {
    restoreManagedTargets(state);
    return false;
  }

  const ownerOptions = [...state.owners.values()];
  const isIOS = ownerOptions.some(
    (options) => options?.isIOS === true,
  );
  const moveBottom = ownerOptions.some(
    (options) => options?.moveBottom === true,
  );
  const stackTabs = ownerOptions.some(
    (options) => options?.stackTabs === true,
  );
  const promoteViewInLandscape = ownerOptions.some(
    (options) => options?.promoteViewInLandscape === true,
  );
  const reserveDashboardEditActions = ownerOptions.some(
    (options) => options?.reserveDashboardEditActions === true,
  );
  const headerStyles = resolveHeaderBottomStyles(isIOS);
  const viewStyles = resolveViewBottomStyles(
    isIOS,
    reserveDashboardEditActions,
  );
  const targetsChanged =
    state.header !== targets.header ||
    state.toolbar !== targets.toolbar ||
    state.view !== targets.view;
  const headerStylesChanged =
    state.headerAppliedStyles?.["padding-bottom"] !==
    headerStyles["padding-bottom"];

  if (targetsChanged) {
    restoreManagedTargets(state);
    state.header = targets.header;
    state.toolbar = targets.toolbar;
    state.view = targets.view;
  }

  if (moveBottom && (!state.geometryApplied || headerStylesChanged)) {
    restoreManagedGeometry(state);
    state.headerSnapshot = captureInlineStyles(targets.header, headerStyles);
    state.headerAppliedStyles = headerStyles;
    state.toolbarSnapshot = targets.toolbar
      ? captureInlineStyles(targets.toolbar, TOOLBAR_BOTTOM_STYLES)
      : null;
    state.viewSnapshot = captureInlineStyles(
      targets.view,
      viewStyles,
    );
    state.viewAppliedStyles = viewStyles;
    state.geometryApplied = true;
  }

  if (moveBottom) {
    state.headerAppliedStyles = headerStyles;
    state.viewAppliedStyles = viewStyles;
    applyInlineStyles(state.header, state.headerAppliedStyles);
    applyInlineStyles(state.toolbar, TOOLBAR_BOTTOM_STYLES);
    applyInlineStyles(state.view, state.viewAppliedStyles);
  } else {
    restoreManagedGeometry(state);
  }
  ensureNavbarStyle(
    state,
    resolveHomeAssistantNavbarStyleText({
      moveBottom,
      stackTabs,
      promoteViewInLandscape,
    }),
  );
  return true;
};

const acquireNavbarCustomization = (
  owner,
  huiRoot,
  {
    MutationObserverCtor,
    isIOS = false,
    moveBottom = false,
    stackTabs = false,
    promoteViewInLandscape = false,
    reserveDashboardEditActions = false,
  } = {},
) => {
  let state = coordinatorByRoot.get(huiRoot);
  if (!state) {
    state = {
      huiRoot,
      owners: new Map(),
      observer: null,
      header: null,
      headerSnapshot: null,
      headerAppliedStyles: null,
      toolbar: null,
      toolbarSnapshot: null,
      view: null,
      viewSnapshot: null,
      viewAppliedStyles: null,
      geometryApplied: false,
      navbarStyle: null,
      navbarStyleText: "",
    };
    if (typeof MutationObserverCtor === "function") {
      state.observer = new MutationObserverCtor(() => {
        if (state.owners.size) applyManagedTargets(state);
      });
      if (huiRoot.shadowRoot) {
        state.observer.observe(huiRoot.shadowRoot, {
          childList: true,
          subtree: true,
        });
      }
    }
    coordinatorByRoot.set(huiRoot, state);
  }
  state.owners.set(owner, {
    isIOS,
    moveBottom,
    stackTabs,
    promoteViewInLandscape,
    reserveDashboardEditActions,
  });
  return applyManagedTargets(state);
};

const releaseNavbarCustomization = (owner, huiRoot) => {
  const state = coordinatorByRoot.get(huiRoot);
  if (!state) return;
  state.owners.delete(owner);
  if (state.owners.size) {
    applyManagedTargets(state);
    return;
  }
  restoreManagedTargets(state);
  state.observer?.disconnect?.();
  coordinatorByRoot.delete(huiRoot);
};

export class HomeAssistantNavbarController {
  constructor(
    host,
    {
      MutationObserverCtor = globalThis.MutationObserver,
      documentRef = globalThis.document,
      getComputedStyleFn = globalThis.getComputedStyle,
      windowRef = globalThis.window,
      isIOS = false,
      queueMicrotaskFn = globalThis.queueMicrotask,
      findCurrentHuiRoot = () =>
        findCurrentHomeAssistantLovelaceRoot(documentRef),
      findPanel = (huiRoot) =>
        findHomeAssistantLovelacePanel(huiRoot, documentRef),
      cardTag = "frigate-view-card",
    } = {},
  ) {
    this._host = host;
    this._MutationObserverCtor = MutationObserverCtor;
    this._documentRef = documentRef;
    this._windowRef = windowRef;
    this._getComputedStyle =
      typeof getComputedStyleFn === "function"
        ? getComputedStyleFn.bind(windowRef || globalThis)
        : null;
    this._isIOS = isIOS === true;
    this._queueMicrotask =
      typeof queueMicrotaskFn === "function"
        ? queueMicrotaskFn.bind(windowRef || globalThis)
        : (callback) => Promise.resolve().then(callback);
    this._findCurrentHuiRoot = findCurrentHuiRoot;
    this._findPanel = findPanel;
    this._cardTag = normalizeCardTag(cardTag) || "frigate-view-card";
    this._huiRoot = null;
    this._dashboardKey = null;
    this._dashboardScopeActive = false;
    this._dashboardObserver = null;
    this._observedMainRoot = null;
    this._dashboardSyncQueued = false;
    this._onDashboardLocationChanged = () =>
      this._scheduleDashboardSync();
  }

  _isMobileDevice() {
    return this._host?._isLikelyMobileClient?.() === true;
  }

  _requestedCustomizations(config = this._host?._config) {
    const moveBottom = config?.mobile_view_ha_navbar_bottom === true;
    const dashboardEdit =
      this._host?._isDashboardEditMode?.() === true;
    const promoteViewInLandscape =
      this._host?.isConnected !== false &&
      this._host?._isLikelyPhoneClient?.() === true &&
      !dashboardEdit &&
      this._host?._isRotateOverlayViewportCoverActive?.() === true;
    return {
      moveBottom,
      stackTabs:
        moveBottom &&
        config?.mobile_view_ha_navbar_stack_tabs === true,
      promoteViewInLandscape,
      reserveDashboardEditActions:
        moveBottom && dashboardEdit,
    };
  }

  _dashboardNavbarPolicy(huiRoot = null) {
    const localConfig = this._host?._config || null;
    const currentRoot =
      huiRoot ||
      findHomeAssistantLovelaceRoot(this._host) ||
      this._findCurrentHuiRoot?.() ||
      null;
    const panel = this._findPanel?.(currentRoot) || null;
    const dashboardConfig = panel?.lovelace?.config || null;
    const ownership = resolveDashboardNavbarOwnership(
      dashboardConfig,
      this._cardTag,
    );
    const ownerConfig = ownership.owner?.config || null;
    const localDashboardScope =
      localConfig?.mobile_view_ha_navbar_bottom === true &&
      localConfig?.mobile_view_ha_navbar_dashboard === true;
    return {
      config: ownerConfig || localConfig,
      dashboardScope:
        Boolean(ownerConfig) || (!dashboardConfig && localDashboardScope),
    };
  }

  shouldCustomizeNavbar(policy = this._dashboardNavbarPolicy()) {
    const { moveBottom, promoteViewInLandscape } =
      this._requestedCustomizations(policy.config);
    if (!this._isMobileDevice()) {
      return false;
    }
    if (promoteViewInLandscape) return true;
    if (!moveBottom) return false;
    if (policy.dashboardScope) {
      return (
        this._host?.isConnected !== false ||
        this._dashboardScopeActive === true
      );
    }
    return this._host?.isConnected !== false;
  }

  shouldMoveNavbarToBottom() {
    const policy = this._dashboardNavbarPolicy();
    return (
      this.shouldCustomizeNavbar(policy) &&
      this._requestedCustomizations(policy.config).moveBottom
    );
  }

  isNavbarAtBottom() {
    if (!this.shouldMoveNavbarToBottom() || !this._huiRoot) return false;
    const state = coordinatorByRoot.get(this._huiRoot);
    return (
      state?.geometryApplied === true &&
      state?.owners?.get?.(this)?.moveBottom === true
    );
  }

  bottomNavbarExtraHeightPx() {
    return this.isNavbarAtBottom() ? BOTTOM_NAVBAR_EXTRA_HEIGHT_PX : 0;
  }

  homeAssistantViewContentHeightPx() {
    if (!this._isMobileDevice()) return null;
    const huiRoot = this._huiRoot || findHomeAssistantLovelaceRoot(this._host);
    const targets = resolveHomeAssistantNavbarTargets(huiRoot);
    const viewportHeight = Number(this._windowRef?.innerHeight) || 0;
    if (!targets?.view || viewportHeight <= 0) return null;

    const viewStyle = this._getComputedStyle?.(targets.view);
    if (!viewStyle) return null;
    const paddingTop =
      parsePxLength(
        viewStyle.paddingTop ||
          viewStyle.getPropertyValue?.("padding-top"),
      ) ?? 0;
    const paddingBottom = this.isNavbarAtBottom()
      ? (parsePxLength(
          viewStyle.paddingBottom ||
            viewStyle.getPropertyValue?.("padding-bottom"),
        ) ?? 0)
      : 0;
    // The bottom safe area is usable card space while HA's navbar is on top.
    const contentHeight = viewportHeight - paddingTop - paddingBottom;
    return contentHeight > 0 ? contentHeight : null;
  }

  shouldStackNavbarTabs() {
    const policy = this._dashboardNavbarPolicy();
    return (
      this.shouldCustomizeNavbar(policy) &&
      this._requestedCustomizations(policy.config).stackTabs
    );
  }

  _moveToRoot(huiRoot, config = null) {
    if (!huiRoot) {
      this._releaseCurrentRoot();
      return false;
    }
    if (this._huiRoot && this._huiRoot !== huiRoot) {
      releaseNavbarCustomization(this, this._huiRoot);
      this._huiRoot = null;
    }
    this._huiRoot = huiRoot;
    const {
      moveBottom,
      stackTabs,
      promoteViewInLandscape,
      reserveDashboardEditActions,
    } = this._requestedCustomizations(
      config || this._dashboardNavbarPolicy(huiRoot).config,
    );
    return acquireNavbarCustomization(this, huiRoot, {
      MutationObserverCtor: this._MutationObserverCtor,
      isIOS: this._isIOS,
      moveBottom,
      stackTabs,
      promoteViewInLandscape,
      reserveDashboardEditActions,
    });
  }

  _releaseCurrentRoot() {
    if (!this._huiRoot) return;
    releaseNavbarCustomization(this, this._huiRoot);
    this._huiRoot = null;
  }

  _observeHomeAssistantMain() {
    const mainRoot = findHomeAssistantMainRoot(this._documentRef);
    if (this._observedMainRoot === mainRoot) return;
    this._dashboardObserver?.disconnect?.();
    this._dashboardObserver = null;
    this._observedMainRoot = mainRoot;
    if (!mainRoot || typeof this._MutationObserverCtor !== "function") return;
    this._dashboardObserver = new this._MutationObserverCtor(() =>
      this._scheduleDashboardSync(),
    );
    this._dashboardObserver.observe(mainRoot, {
      childList: true,
      subtree: true,
    });
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
    this._observeHomeAssistantMain();
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
    this._observedMainRoot = null;
    this._dashboardScopeActive = false;
    this._dashboardKey = null;
    this._dashboardSyncQueued = false;
  }

  _scheduleDashboardSync() {
    if (!this._dashboardScopeActive || this._dashboardSyncQueued) return;
    this._dashboardSyncQueued = true;
    this._queueMicrotask(() => {
      this._dashboardSyncQueued = false;
      if (!this._dashboardScopeActive) return;
      this._observeHomeAssistantMain();
      const huiRoot = this._findCurrentHuiRoot?.() || null;
      const dashboardKey = resolveHomeAssistantDashboardKey(
        huiRoot,
        this._windowRef,
      );
      if (!huiRoot || dashboardKey !== this._dashboardKey) {
        this._releaseCurrentRoot();
        return;
      }
      this._moveToRoot(huiRoot);
    });
  }

  _deactivate() {
    this._stopDashboardMonitoring();
    this._releaseCurrentRoot();
  }

  sync() {
    const hostHuiRoot = findHomeAssistantLovelaceRoot(this._host);
    const currentHuiRoot =
      hostHuiRoot || this._findCurrentHuiRoot?.() || null;
    const policy = this._dashboardNavbarPolicy(currentHuiRoot);
    if (!this.shouldCustomizeNavbar(policy)) {
      this._deactivate();
      return false;
    }

    const dashboardScope = policy.dashboardScope;
    if (!dashboardScope) this._stopDashboardMonitoring();

    const huiRoot = hostHuiRoot || (dashboardScope ? currentHuiRoot : null);
    if (!huiRoot) {
      if (!dashboardScope) this._releaseCurrentRoot();
      return false;
    }

    if (dashboardScope) this._startDashboardMonitoring(huiRoot);
    return this._moveToRoot(huiRoot, policy.config);
  }

  disconnect({ force = false } = {}) {
    if (this._dashboardScopeActive && !force) {
      this._scheduleDashboardSync();
      return;
    }
    this._deactivate();
  }
}

export const installHomeAssistantDashboardNavbarCustomization = ({
  cardTag = "frigate-view-card",
  documentRef = globalThis.document,
  windowRef = globalThis.window,
  MutationObserverCtor = globalThis.MutationObserver,
  getComputedStyleFn = globalThis.getComputedStyle,
  queueMicrotaskFn = globalThis.queueMicrotask,
  isMobile = false,
  isPhone = false,
  isIOS = false,
  findCurrentHuiRoot = () =>
    findCurrentHomeAssistantLovelaceRoot(documentRef),
  findPanel = (huiRoot) =>
    findHomeAssistantLovelacePanel(huiRoot, documentRef),
} = {}) => {
  if (!windowRef || !documentRef || isMobile !== true) return null;
  if (windowRef[DASHBOARD_NAVBAR_BOOTSTRAP_KEY]) {
    return windowRef[DASHBOARD_NAVBAR_BOOTSTRAP_KEY];
  }

  const bootstrapHost = {
    isConnected: true,
    _config: null,
    _isLikelyMobileClient: () => true,
    _isLikelyPhoneClient: () => isPhone === true,
    _isRotateOverlayViewportCoverActive: () => false,
    _isDashboardEditMode: () => false,
  };
  const controller = new HomeAssistantNavbarController(bootstrapHost, {
    MutationObserverCtor,
    documentRef,
    getComputedStyleFn,
    windowRef,
    isIOS,
    queueMicrotaskFn,
    findCurrentHuiRoot,
    findPanel,
    cardTag,
  });
  const queueMicrotaskSafe =
    typeof queueMicrotaskFn === "function"
      ? queueMicrotaskFn.bind(windowRef)
      : (callback) => Promise.resolve().then(callback);
  let observer = null;
  let observedTargets = [];
  let syncQueued = false;
  let disconnected = false;

  const scheduleSync = () => {
    if (disconnected || syncQueued) return;
    syncQueued = true;
    queueMicrotaskSafe(() => {
      syncQueued = false;
      if (!disconnected) controller.sync();
    });
  };
  const observeShell = () => {
    const targets = findNavbarBootstrapObserverTargets(documentRef);
    if (
      targets.length === observedTargets.length &&
      targets.every((target, index) => target === observedTargets[index])
    ) {
      return;
    }
    observer?.disconnect?.();
    observer = null;
    observedTargets = targets;
    if (!targets.length || typeof MutationObserverCtor !== "function") return;
    observer = new MutationObserverCtor(() => {
      observeShell();
      scheduleSync();
    });
    for (const target of targets) {
      observer.observe(target, { childList: true, subtree: true });
    }
  };
  const onLocationChanged = () => {
    observeShell();
    scheduleSync();
  };
  const disconnect = () => {
    if (disconnected) return;
    disconnected = true;
    controller.disconnect({ force: true });
    observer?.disconnect?.();
    observer = null;
    observedTargets = [];
    windowRef.removeEventListener?.("location-changed", onLocationChanged);
    windowRef.removeEventListener?.("popstate", onLocationChanged);
    if (
      windowRef[DASHBOARD_NAVBAR_BOOTSTRAP_KEY]?.disconnect === disconnect
    ) {
      delete windowRef[DASHBOARD_NAVBAR_BOOTSTRAP_KEY];
    }
  };
  const bootstrap = { disconnect, sync: scheduleSync };
  windowRef[DASHBOARD_NAVBAR_BOOTSTRAP_KEY] = bootstrap;
  windowRef.addEventListener?.("location-changed", onLocationChanged);
  windowRef.addEventListener?.("popstate", onLocationChanged);
  observeShell();
  scheduleSync();
  void windowRef.customElements
    ?.whenDefined?.("hui-root")
    ?.then?.(onLocationChanged);
  return bootstrap;
};
