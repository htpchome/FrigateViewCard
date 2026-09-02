import { findHomeAssistantLovelaceRoot } from "./navbar.ctrl.js";

const managedBackgroundByTarget = new WeakMap();
const MANAGED_BACKGROUND_PROPERTIES = Object.freeze([
  "--lovelace-background",
  "background-color",
  "background-image",
]);

const canManageInlineStyle = (element) =>
  typeof element?.style?.getPropertyValue === "function" &&
  typeof element.style.setProperty === "function" &&
  typeof element.style.removeProperty === "function";

const captureInlineBackground = (target) =>
  MANAGED_BACKGROUND_PROPERTIES.reduce((snapshot, property) => {
    snapshot[property] = {
      value: target.style.getPropertyValue(property),
      priority: target.style.getPropertyPriority?.(property) || "",
    };
    return snapshot;
  }, {});

const applyBackground = (target, color) => {
  target.style.setProperty("--lovelace-background", color, "important");
  target.style.setProperty("background-color", color, "important");
  target.style.setProperty("background-image", "none", "important");
};

const restoreBackground = (state) => {
  if (!canManageInlineStyle(state.target)) return;
  for (const property of MANAGED_BACKGROUND_PROPERTIES) {
    const appliedValue =
      property === "background-image" ? "none" : state.appliedColor;
    const currentValue = state.target.style.getPropertyValue(property);
    const currentPriority =
      state.target.style.getPropertyPriority?.(property) || "";
    if (currentValue !== appliedValue || currentPriority !== "important") {
      continue;
    }
    const original = state.snapshot[property];
    if (original.value) {
      state.target.style.setProperty(
        property,
        original.value,
        original.priority,
      );
    } else {
      state.target.style.removeProperty(property);
    }
  }
};

const latestOwnerColor = (owners) => {
  const colors = [...owners.values()];
  return colors[colors.length - 1] || "";
};

const acquireManagedBackground = (owner, target, color) => {
  let state = managedBackgroundByTarget.get(target);
  if (!state) {
    state = {
      target,
      owners: new Map(),
      snapshot: captureInlineBackground(target),
      appliedColor: "",
    };
    managedBackgroundByTarget.set(target, state);
  }
  state.owners.delete(owner);
  state.owners.set(owner, color);
  state.appliedColor = latestOwnerColor(state.owners);
  applyBackground(target, state.appliedColor);
};

const releaseManagedBackground = (owner, target) => {
  const state = managedBackgroundByTarget.get(target);
  if (!state) return;
  state.owners.delete(owner);
  if (state.owners.size) {
    state.appliedColor = latestOwnerColor(state.owners);
    applyBackground(target, state.appliedColor);
    return;
  }
  restoreBackground(state);
  managedBackgroundByTarget.delete(target);
};

const isVisibleColor = (value) => {
  const color = String(value || "").trim();
  return (
    color !== "" &&
    color !== "transparent" &&
    color !== "rgba(0, 0, 0, 0)" &&
    color !== "rgba(0,0,0,0)"
  );
};

export const resolveHomeAssistantPageBackgroundTarget = (huiRoot) => {
  const target = huiRoot?.shadowRoot?.querySelector?.("#view") || null;
  return canManageInlineStyle(target) ? target : null;
};

export const resolveHomeAssistantPageBackgroundTargets = (huiRoot) => {
  const targets = [];
  const pageTarget = resolveHomeAssistantPageBackgroundTarget(huiRoot);
  if (pageTarget) targets.push(pageTarget);
  const viewContainer =
    huiRoot?.shadowRoot?.querySelector?.("hui-view-container") ||
    pageTarget?.querySelector?.("hui-view-container") ||
    null;
  const backgroundTarget =
    huiRoot?.shadowRoot?.querySelector?.("hui-view-background") ||
    pageTarget?.querySelector?.("hui-view-background") ||
    viewContainer?.shadowRoot?.querySelector?.("hui-view-background") ||
    null;
  if (
    backgroundTarget !== pageTarget &&
    canManageInlineStyle(backgroundTarget)
  ) {
    targets.push(backgroundTarget);
  }
  return targets;
};

export class HomeAssistantPageBackgroundController {
  constructor(
    host,
    {
      getComputedStyleFn = (element) =>
        globalThis.getComputedStyle?.(element),
      findHuiRoot = () => findHomeAssistantLovelaceRoot(host),
    } = {},
  ) {
    this._host = host;
    this._getComputedStyle = getComputedStyleFn;
    this._findHuiRoot = findHuiRoot;
    this._targets = new Set();
  }

  shouldApply() {
    return (
      this._host?.isConnected !== false &&
      this._host?._isLikelyMobileClient?.() === true &&
      this._host?._isMobileViewPageActive?.() === true
    );
  }

  _resolveMobileViewBackground() {
    const surface =
      this._host?.shadowRoot?.querySelector?.(
        ".card.mobile-view-active .mobile-container",
      ) || null;
    if (!surface || typeof this._getComputedStyle !== "function") return "";
    const style = this._getComputedStyle(surface);
    const color =
      style?.backgroundColor ||
      style?.getPropertyValue?.("background-color") ||
      "";
    return isVisibleColor(color) ? String(color).trim() : "";
  }

  _releaseTargets(targets = this._targets) {
    for (const target of targets) {
      releaseManagedBackground(this, target);
      this._targets.delete(target);
    }
  }

  sync() {
    if (!this.shouldApply()) {
      this._releaseTargets();
      return false;
    }
    const color = this._resolveMobileViewBackground();
    const huiRoot = this._findHuiRoot?.() || null;
    const targets = resolveHomeAssistantPageBackgroundTargets(huiRoot);
    if (!color || !targets.length) {
      this._releaseTargets();
      return false;
    }
    const nextTargets = new Set(targets);
    const staleTargets = [...this._targets].filter(
      (target) => !nextTargets.has(target),
    );
    this._releaseTargets(staleTargets);
    for (const target of targets) {
      acquireManagedBackground(this, target, color);
      this._targets.add(target);
    }
    return true;
  }

  disconnect() {
    this._releaseTargets();
  }
}
