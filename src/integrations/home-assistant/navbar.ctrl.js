// Keep Home Assistant shell mutations isolated and fully reversible.
const NAVBAR_STYLE_ATTRIBUTE = "data-frigate-view-ha-navbar-style";
const BOTTOM_NAVBAR_EXTRA_HEIGHT_PX = 10;

const BOTTOM_TAB_INDICATOR_STYLE_TEXT = `
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
    moveBottom ? BOTTOM_TAB_INDICATOR_STYLE_TEXT : "",
    stackTabs ? STACKED_TAB_STYLE_TEXT : "",
    promoteViewInLandscape ? LANDSCAPE_VIEW_PROMOTION_STYLE_TEXT : "",
  ]
    .filter(Boolean)
    .join("\n");

const VIEW_BOTTOM_STYLES = Object.freeze({
  "padding-top": "env(safe-area-inset-top)",
  "padding-bottom":
    `calc(var(--header-height, 56px) + ${BOTTOM_NAVBAR_EXTRA_HEIGHT_PX}px + env(safe-area-inset-bottom))`,
});

const TOOLBAR_BOTTOM_STYLES = Object.freeze({
  "border-bottom": "none",
  "border-top": "1px solid var(--divider-color)",
  "box-sizing": "border-box",
  height: `calc(var(--header-height, 56px) + ${BOTTOM_NAVBAR_EXTRA_HEIGHT_PX}px)`,
  "padding-top": `${BOTTOM_NAVBAR_EXTRA_HEIGHT_PX / 2}px`,
  "padding-bottom": `${BOTTOM_NAVBAR_EXTRA_HEIGHT_PX / 2}px`,
});

const coordinatorByRoot = new WeakMap();

const resolveHeaderBottomStyles = (isIOS) => ({
  top: "auto",
  bottom: "0px",
  position: "fixed",
  "padding-bottom": isIOS
    ? "calc(env(safe-area-inset-bottom) * 0.25)"
    : "0px",
});

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
  const main = homeAssistant?.shadowRoot?.querySelector?.(
    "home-assistant-main",
  );
  const lovelacePanel = main?.shadowRoot?.querySelector?.(
    "ha-panel-lovelace",
  );
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
    VIEW_BOTTOM_STYLES,
  );
  state.headerSnapshot = null;
  state.headerAppliedStyles = null;
  state.toolbarSnapshot = null;
  state.viewSnapshot = null;
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
  const headerStyles = resolveHeaderBottomStyles(isIOS);
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
      VIEW_BOTTOM_STYLES,
    );
    state.geometryApplied = true;
  }

  if (moveBottom) {
    state.headerAppliedStyles = headerStyles;
    applyInlineStyles(state.header, state.headerAppliedStyles);
    applyInlineStyles(state.toolbar, TOOLBAR_BOTTOM_STYLES);
    applyInlineStyles(state.view, VIEW_BOTTOM_STYLES);
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
      windowRef = globalThis.window,
      isIOS = false,
      queueMicrotaskFn = globalThis.queueMicrotask,
      findCurrentHuiRoot = () =>
        findCurrentHomeAssistantLovelaceRoot(documentRef),
    } = {},
  ) {
    this._host = host;
    this._MutationObserverCtor = MutationObserverCtor;
    this._documentRef = documentRef;
    this._windowRef = windowRef;
    this._isIOS = isIOS === true;
    this._queueMicrotask =
      typeof queueMicrotaskFn === "function"
        ? queueMicrotaskFn.bind(windowRef || globalThis)
        : (callback) => Promise.resolve().then(callback);
    this._findCurrentHuiRoot = findCurrentHuiRoot;
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

  _requestedCustomizations() {
    const moveBottom =
      this._host?._config?.mobile_view_ha_navbar_bottom === true;
    return {
      moveBottom,
      stackTabs:
        moveBottom &&
        this._host?._config?.mobile_view_ha_navbar_stack_tabs === true,
      promoteViewInLandscape:
        moveBottom &&
        this._host?.isConnected !== false &&
        this._host?._isMobileViewPageActive?.() === true &&
        this._host?._config?.mobile_view_rotate_to_fullscreen !== false,
    };
  }

  shouldCustomizeNavbar() {
    const { moveBottom } = this._requestedCustomizations();
    if (!moveBottom || !this._isMobileDevice()) {
      return false;
    }
    if (this._host?._config?.mobile_view_ha_navbar_dashboard === true) {
      return (
        this._host?.isConnected !== false ||
        this._dashboardScopeActive === true
      );
    }
    return (
      this._host?.isConnected !== false &&
      this._host?._isMobileViewPageActive?.() === true
    );
  }

  shouldMoveNavbarToBottom() {
    return (
      this.shouldCustomizeNavbar() &&
      this._requestedCustomizations().moveBottom
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

  shouldStackNavbarTabs() {
    return (
      this.shouldCustomizeNavbar() &&
      this._requestedCustomizations().stackTabs
    );
  }

  _moveToRoot(huiRoot) {
    if (!huiRoot) {
      this._releaseCurrentRoot();
      return false;
    }
    if (this._huiRoot && this._huiRoot !== huiRoot) {
      releaseNavbarCustomization(this, this._huiRoot);
      this._huiRoot = null;
    }
    this._huiRoot = huiRoot;
    const { moveBottom, stackTabs, promoteViewInLandscape } =
      this._requestedCustomizations();
    return acquireNavbarCustomization(this, huiRoot, {
      MutationObserverCtor: this._MutationObserverCtor,
      isIOS: this._isIOS,
      moveBottom,
      stackTabs,
      promoteViewInLandscape,
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
    if (!this.shouldCustomizeNavbar()) {
      this._deactivate();
      return false;
    }

    const dashboardScope =
      this._host?._config?.mobile_view_ha_navbar_dashboard === true;
    if (!dashboardScope) this._stopDashboardMonitoring();

    const huiRoot = findHomeAssistantLovelaceRoot(this._host);
    if (!huiRoot) {
      if (!dashboardScope) this._releaseCurrentRoot();
      return false;
    }

    if (dashboardScope) this._startDashboardMonitoring(huiRoot);
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
