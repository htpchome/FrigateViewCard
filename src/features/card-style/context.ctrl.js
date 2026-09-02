import { THEME_CUSTOM_ROWS } from "../../constants.js";
import {
  normalizeHexColor,
  normalizeThemeCustomDefaultsConfig,
} from "../../helpers.js";
import { resolveThemeCustomOverrides } from "./config.js";

const HA_DEFAULT_THEME_ALIASES = new Set([
  "",
  "default",
  "backend-selected",
]);
const DARK_PRIMARY_THEME_KEYS = Object.freeze([
  "dark-primary-color",
  "--dark-primary-color",
]);
const MOBILE_SECTIONS_FULL_BLEED_CLASS =
  "mobile-view-sections-full-bleed";

const normalizeThemeName = (value) =>
  String(value || "").trim().toLowerCase();

const resolveThemeDefinition = (themes, themeName) => {
  const definitions = themes?.themes;
  if (!definitions || typeof definitions !== "object") return null;
  const normalizedName = normalizeThemeName(themeName);
  const matchingName = Object.keys(definitions).find(
    (name) => normalizeThemeName(name) === normalizedName,
  );
  if (!matchingName) return null;
  const definition = definitions[matchingName];
  return definition && typeof definition === "object" ? definition : null;
};

const hasDeclaredThemeValue = (definition, keys) =>
  keys.some(
    (key) =>
      Object.prototype.hasOwnProperty.call(definition || {}, key) &&
      String(definition[key] ?? "").trim() !== "",
  );

const themeDeclaresDarkPrimary = (definition, mode) =>
  hasDeclaredThemeValue(definition, DARK_PRIMARY_THEME_KEYS) ||
  hasDeclaredThemeValue(
    definition?.modes?.[mode],
    DARK_PRIMARY_THEME_KEYS,
  );

export const resolveHomeAssistantThemeContext = (
  hass,
  { mode: requestedMode } = {},
) => {
  const themes = hass?.themes || {};
  const { darkMode = false } = themes;
  const mode =
    requestedMode === "dark" || requestedMode === "light"
      ? requestedMode
      : darkMode === true
        ? "dark"
        : "light";
  const selectedTheme = String(
    themes.theme || hass?.selectedTheme || "default",
  ).trim();
  const configuredDefault = String(
    mode === "dark"
      ? themes.default_dark_theme || themes.default_theme || "default"
      : themes.default_theme || "default",
  ).trim();
  const resolvedTheme = HA_DEFAULT_THEME_ALIASES.has(
    normalizeThemeName(selectedTheme),
  )
    ? configuredDefault
    : selectedTheme;
  const source = HA_DEFAULT_THEME_ALIASES.has(
    normalizeThemeName(resolvedTheme),
  )
    ? "default"
    : "custom";
  const themeDefinition =
    source === "custom"
      ? resolveThemeDefinition(themes, resolvedTheme)
      : null;
  return {
    mode,
    source,
    deriveDarkPrimary:
      source === "custom" &&
      themeDefinition !== null &&
      !themeDeclaresDarkPrimary(themeDefinition, mode),
  };
};

export class CardStyleContextController {
  constructor(host) {
    this._host = host;
    this._lastValidOuterShadow = "";
    this._outerShadowRepaintHandle = 0;
  }

  visualStyleToggleRules() {
    return [
      { configKey: "shadows", className: "shadows-off" },
      { configKey: "borders", className: "borders-off" },
      { configKey: "rounded_corners", className: "corners-off" },
    ];
  }

  cardStateClassNames() {
    const classes = this.visualStyleToggleRules()
      .filter(({ configKey }) => this._host._config?.[configKey] === false)
      .map(({ className }) => className);
    if (this._host._isPreviewPageActive()) classes.push("preview-active");
    if (this._host._isLikelyMobileClient?.()) classes.push("mobile-client");
    if (this._host._isLikelyPhoneClient?.()) classes.push("phone-client");
    if (this.shouldHideMobileViewOuterBorder()) {
      classes.push("mobile-view-outer-border-off");
    }
    return classes.join(" ");
  }

  shouldHideMobileViewOuterBorder() {
    return (
      this._host._isMobileViewPageActive?.() === true &&
      this._host._config?.mobile_view_outer_border !== true
    );
  }

  resolveThemeContext() {
    return resolveHomeAssistantThemeContext(this._host._hass);
  }

  syncThemeContext(card = null) {
    const target =
      card || this._host.shadowRoot?.querySelector?.("#card") || null;
    if (!target) return;
    const { mode, source, deriveDarkPrimary } = this.resolveThemeContext();

    if (target.dataset) {
      target.dataset.themeMode = mode;
      target.dataset.haTheme = source;
      if (deriveDarkPrimary) {
        target.dataset.haDarkPrimary = "derived";
      } else {
        delete target.dataset.haDarkPrimary;
      }
      delete target.dataset.themeName;
      return;
    }

    target.setAttribute?.("data-theme-mode", mode);
    target.setAttribute?.("data-ha-theme", source);
    if (deriveDarkPrimary) {
      target.setAttribute?.("data-ha-dark-primary", "derived");
    } else {
      target.removeAttribute?.("data-ha-dark-primary");
    }
    target.removeAttribute?.("data-theme-name");
  }

  syncVisualStyleToggles() {
    const card = this._host.shadowRoot?.querySelector("#card");
    if (!card) return;
    this.syncThemeContext(card);
    for (const { configKey, className } of this.visualStyleToggleRules()) {
      const isEnabled = this._host._config?.[configKey] !== false;
      card.classList.toggle(className, !isEnabled);
    }
    card.classList.toggle(
      "mobile-view-outer-border-off",
      this.shouldHideMobileViewOuterBorder(),
    );
    this.syncHostOuterStyles();
  }

  syncHostOuterStyles({ forceRepaint = false } = {}) {
    const card = this._host.shadowRoot?.querySelector("#card");
    if (!card) return;
    const outerShadow = this.resolveCardTokenForHost(
      card,
      "box-shadow",
      "var(--fvc-outer-shadow-m)",
    );
    const outerRadius =
      this._host._config?.rounded_corners === false
        ? "0px"
        : this.resolveCardTokenForHost(
            card,
            "border-radius",
            "var(--fvc-outer-border-radius)",
          );

    const outerShadowsEnabled =
      this._host._config?.outer_shadows !== false;
    if (!outerShadowsEnabled) {
      this.cancelOuterShadowRepaint();
      this._host.style.boxShadow = "none";
    } else {
      if (this.isValidOuterShadow(outerShadow)) {
        this._lastValidOuterShadow = outerShadow;
      }
      const currentOuterShadow = String(
        this._host.style.boxShadow || "",
      ).trim();
      const preservedOuterShadow =
        this._lastValidOuterShadow ||
        (this.isValidOuterShadow(currentOuterShadow)
          ? currentOuterShadow
          : "");
      if (preservedOuterShadow) {
        if (forceRepaint) {
          this._host.style.boxShadow = "none";
          void this._host.offsetWidth;
        }
        this._host.style.boxShadow = preservedOuterShadow;
      } else if (typeof this._host.style.removeProperty === "function") {
        this._host.style.removeProperty("box-shadow");
      } else {
        this._host.style.boxShadow = "";
      }
    }
    if (outerRadius) {
      this._host.style.borderRadius = outerRadius;
    } else {
      this._host.style.removeProperty("border-radius");
    }
  }

  isValidOuterShadow(value) {
    const shadow = String(value || "").trim().toLowerCase();
    return shadow !== "" && shadow !== "none";
  }

  repaintHostOuterStylesAfterLayout() {
    if (
      this._outerShadowRepaintHandle ||
      typeof globalThis.requestAnimationFrame !== "function"
    ) {
      if (!this._outerShadowRepaintHandle) {
        this.syncHostOuterStyles({ forceRepaint: true });
      }
      return;
    }
    this._outerShadowRepaintHandle = globalThis.requestAnimationFrame(() => {
      this._outerShadowRepaintHandle = 0;
      if (this._host?.isConnected === false) return;
      this.syncHostOuterStyles({ forceRepaint: true });
    });
  }

  cancelOuterShadowRepaint() {
    if (!this._outerShadowRepaintHandle) return;
    globalThis.cancelAnimationFrame?.(this._outerShadowRepaintHandle);
    this._outerShadowRepaintHandle = 0;
  }

  resolveCardTokenForHost(card, cssProperty, token) {
    const value = String(token || "").trim();
    if (!card || !value) return "";
    const probe = document.createElement("div");
    probe.style.cssText =
      "position:absolute;left:-9999px;top:-9999px;visibility:hidden;pointer-events:none;";
    probe.style.setProperty(cssProperty, value);
    card.appendChild(probe);
    const resolved = getComputedStyle(probe)
      .getPropertyValue(cssProperty)
      .trim();
    probe.remove();
    return resolved || value;
  }

  applyTightMargins() {
    const tightMarginsEnabled = this._host._config?.tight_margins === true;
    const inPreviewContext = this._host._isPreviewContext();
    const naturalCardView = this._host._isCardViewPageActive?.() === true;
    if (this._host.parentElement) {
      this._host.parentElement.style.height = inPreviewContext || naturalCardView
        ? "auto"
        : "100%";
      if (tightMarginsEnabled) {
        this._host.parentElement.style.margin = "0";
        this._host.parentElement.style.padding = "0";
      } else if (this._host._parentOrigStyle) {
        this._host.parentElement.style.margin =
          this._host._parentOrigStyle.margin;
        this._host.parentElement.style.padding =
          this._host._parentOrigStyle.padding;
      }
    }
    const card = this._host.shadowRoot?.querySelector("#card");
    if (card) card.classList.toggle("tight-margins", tightMarginsEnabled);
    this.syncMobileSectionsFullBleed(tightMarginsEnabled);
    this.setSectionsRowGap(tightMarginsEnabled);
  }

  syncMobileSectionsFullBleed(tightMarginsEnabled) {
    const enabled =
      tightMarginsEnabled &&
      this._host._isLikelyPhoneClient?.() === true &&
      this._host._isMobileViewPageActive?.() === true &&
      this.isInSectionsView() &&
      !this.isPanelView();
    this._host.classList?.toggle(
      MOBILE_SECTIONS_FULL_BLEED_CLASS,
      enabled,
    );
  }

  isInSectionsView() {
    let element = this._host;
    while (element) {
      if (element.tagName === "HUI-SECTIONS-VIEW") return true;
      element = element.parentNode || element.host;
    }
    return false;
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

    this.syncThemeContext(card);

    this.applyTightMargins();

    const rawHeight = this._host._config.stream_height;
    const isCompactPreview =
      this._host._config?.compact_preview === true ||
      this._host._isPreviewContext();
    const configuredHeightUnit = this._host._config.stream_height_unit || "%";
    const isDefaultStubPreview =
      this._host._isPreviewContext() &&
      this._host._config?.compact_preview === true &&
      configuredHeightUnit === "%" &&
      Number(rawHeight) === 100 &&
      this._host._config?.title === "Frigate Preview" &&
      this._host._config?.subtitle === "Compact preview";
    const configuredHeight = isDefaultStubPreview ? 50 : rawHeight;
    const previewHeightFallback =
      isCompactPreview && !configuredHeight ? "320px" : "";
    const configuredHeightValue =
      configuredHeight != null
        ? `${configuredHeight}${configuredHeightUnit}`
        : "";
    const numericHeight = Number(configuredHeight);
    const isPercentHeight =
      configuredHeightUnit === "%" &&
      Number.isFinite(numericHeight) &&
      numericHeight > 0;
    const isViewportHeight =
      (configuredHeightUnit === "vh" || configuredHeightUnit === "dvh") &&
      Number.isFinite(numericHeight) &&
      numericHeight > 0 &&
      !this._host._isPreviewContext();
    const hostComputedStyle = getComputedStyle(this._host);
    const haCardHeight = hostComputedStyle
      .getPropertyValue("--ha-card-height")
      .trim();

    const naturalCardView = this._host._isCardViewPageActive?.() === true;
    if (naturalCardView) {
      this._host.style.removeProperty("--card-host-height");
      card.style.removeProperty("--view-height");
    } else if (configuredHeight) {
      if (isPercentHeight) {
        const resolvedPercentHeightPx = this.resolvePercentHostHeightPx({
          ratio: Math.max(0.01, numericHeight / 100),
          haCardHeight,
          headerHeight: hostComputedStyle.getPropertyValue("--header-height"),
        });
        if (resolvedPercentHeightPx != null) {
          const wrapperViewportHeightPx =
            this.resolvePercentHeightWrapperViewportPx(
              Math.max(0.01, numericHeight / 100),
            );
          const constrainedHeightPx =
            wrapperViewportHeightPx != null
              ? Math.min(resolvedPercentHeightPx, wrapperViewportHeightPx)
              : resolvedPercentHeightPx;
          const wrapperPaddingPx = this.resolveHeightWrapperPaddingPx();
          const sectionsBottomPaddingPx =
            this.resolveHeightSectionsBottomPaddingPx();
          this._host.style.setProperty(
            "--card-host-height",
            `${Math.max(
              1,
              constrainedHeightPx -
                wrapperPaddingPx -
                sectionsBottomPaddingPx,
            )}px`,
          );
        } else {
          this._host.style.removeProperty("--card-host-height");
        }
        card.style.removeProperty("--view-height");
      } else if (isViewportHeight) {
        const resolvedViewportHeightPx = this.resolveViewportUnitHostHeightPx(
          Math.max(0.01, numericHeight / 100),
        );
        if (resolvedViewportHeightPx != null) {
          const resolvedHeightValue = `${resolvedViewportHeightPx}px`;
          this._host.style.setProperty(
            "--card-host-height",
            resolvedHeightValue,
          );
          card.style.setProperty("--view-height", resolvedHeightValue);
        } else {
          this._host.style.setProperty(
            "--card-host-height",
            configuredHeightValue,
          );
          card.style.setProperty("--view-height", configuredHeightValue);
        }
      } else {
        this._host.style.setProperty(
          "--card-host-height",
          configuredHeightValue,
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

    const { mode } = this.resolveThemeContext();
    const customTheme =
      this._host._config?.theme === "custom"
        ? resolveThemeCustomOverrides(this._host._config?.theme_custom, mode)
        : {};
    const customThemeDefaults = normalizeThemeCustomDefaultsConfig(
      this._host._config?.theme_custom_defaults,
    )[mode];
    for (const row of THEME_CUSTOM_ROWS) {
      const key = row.key;
      const override = normalizeHexColor(customTheme[key]);
      if (customThemeDefaults[key] !== true && override) {
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
      (window.visualViewport?.height || window.innerHeight || 0) -
        headerHeightPx,
    );
    const referenceHeightPx =
      this.parsePxLength(haCardHeight) ??
      (viewportHeightPx > 0 ? viewportHeightPx : null);
    if (referenceHeightPx == null) return null;
    const availableHeightPx = Math.max(
      1,
      referenceHeightPx - this.resolveBottomNavbarExtraHeightPx(),
    );
    return Math.max(1, availableHeightPx * ratio);
  }

  resolvePercentHeightWrapperViewportPx(ratio) {
    if (this._host._config?.tight_margins === true) return null;
    const availableHeight = this.resolveHeightWrapperViewportPx();
    return availableHeight != null
      ? Math.max(1, availableHeight * ratio)
      : null;
  }

  resolveViewportUnitHostHeightPx(ratio) {
    const viewportHeight =
      Number(window.visualViewport?.height) || Number(window.innerHeight) || 0;
    if (viewportHeight <= 0) return null;

    const configuredHeight = viewportHeight * ratio;
    const availableHeight = this.resolveHeightWrapperViewportPx();
    if (availableHeight == null) return Math.max(1, configuredHeight);

    const availableCardHeight = Math.max(
      1,
      availableHeight -
        this.resolveHeightWrapperPaddingPx() -
        this.resolveHeightSectionsBottomPaddingPx(),
    );
    return Math.max(1, Math.min(configuredHeight, availableCardHeight));
  }

  resolveHeightWrapperViewportPx() {
    if (
      this._host._isPreviewContext() ||
      !this._host.parentElement?.getBoundingClientRect
    ) {
      return null;
    }

    const visualViewport = window.visualViewport;
    const viewportTop = Number(visualViewport?.offsetTop) || 0;
    const viewportHeight =
      Number(visualViewport?.height) || Number(window.innerHeight) || 0;
    const wrapperTop = Number(
      this._host.parentElement.getBoundingClientRect().top,
    );
    if (!Number.isFinite(wrapperTop) || viewportHeight <= 0) return null;

    const availableHeight =
      viewportTop +
      viewportHeight -
      Math.max(viewportTop, wrapperTop) -
      this.resolveBottomNavbarExtraHeightPx();
    if (availableHeight <= 0) return null;
    return Math.max(1, availableHeight);
  }

  resolveBottomNavbarExtraHeightPx() {
    if (this._host._isLikelyMobileClient?.() !== true) return 0;
    const extraHeight = Number(
      this._host._haNavbarController?.bottomNavbarExtraHeightPx?.(),
    );
    return Number.isFinite(extraHeight) && extraHeight > 0 ? extraHeight : 0;
  }

  resolveHeightWrapperPaddingPx() {
    if (
      this._host._config?.tight_margins === true ||
      this._host._isPreviewContext() ||
      !this._host.parentElement
    ) {
      return 0;
    }

    const wrapperStyle = getComputedStyle(this._host.parentElement);
    const boxSizing =
      wrapperStyle.boxSizing ||
      wrapperStyle.getPropertyValue("box-sizing").trim();
    if (boxSizing !== "border-box") return 0;

    const paddingTop = this.parsePxLength(wrapperStyle.paddingTop) ?? 0;
    const paddingBottom = this.parsePxLength(wrapperStyle.paddingBottom) ?? 0;
    return Math.max(0, paddingTop + paddingBottom);
  }

  resolveHeightSectionsBottomPaddingPx() {
    if (
      this._host._config?.tight_margins === true ||
      this._host._isPreviewContext() ||
      !this._host.parentElement
    ) {
      return 0;
    }

    let element = this.composedParentElement(this._host.parentElement);
    let bottomPaddingPx = 0;
    for (let depth = 0; element && depth < 20; depth += 1) {
      const elementStyle = getComputedStyle(element);
      bottomPaddingPx += this.parsePxLength(elementStyle.paddingBottom) ?? 0;
      if (element.tagName === "HUI-SECTIONS-VIEW") {
        return Math.max(0, bottomPaddingPx);
      }
      element = this.composedParentElement(element);
    }
    return 0;
  }

  composedParentElement(element) {
    return element?.parentElement || element?.getRootNode?.().host || null;
  }

  parsePxLength(value) {
    const match = /^(-?\d+(?:\.\d+)?)px$/i.exec(String(value || "").trim());
    if (!match) return null;
    const parsed = Number(match[1]);
    return Number.isFinite(parsed) ? parsed : null;
  }
}
