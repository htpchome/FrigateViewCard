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
const PANEL_ASPECT_CONSTRAINED_CLASS =
  "panel-view-aspect-constrained";
const PANEL_ASPECT_MAX_WIDTH_PROPERTY =
  "--fvc-panel-view-max-width";
const PANEL_ASPECT_HEIGHT_PROPERTY =
  "--fvc-panel-view-card-height";
const HA_HEIGHT_MANAGED_VIEW_TAGS = new Set([
  "HUI-SECTIONS-VIEW",
  "HUI-SIDEBAR-VIEW",
]);
const HA_PANEL_VIEW_TAGS = new Set(["HUI-PANEL-VIEW"]);
const HA_MASONRY_VIEW_TAGS = new Set(["HUI-MASONRY-VIEW"]);
// Includes the heading and approximately two standard event rows.
const MINIMUM_BROWSE_REGION_HEIGHT_PX = 244;
const MINIMUM_CARD_HEIGHT_BUFFER_PX = 8;
const bubblePopupPaddingStates = new WeakMap();
const BUBBLE_POPUP_EXTRA_BOTTOM_SPACE = "--bubble-pop-up-extra-bottom-space";
const BUBBLE_POPUP_TIGHT_PADDING = [
  "padding-right",
  "padding-bottom",
  "padding-left",
];

const inlineBubblePopupSpacingDeclarations = (style) =>
  Array.from({ length: style.length }, (_, index) => style.item(index))
    .filter(
      (name) =>
        name === "padding" ||
        name.startsWith("padding-") ||
        name === BUBBLE_POPUP_EXTRA_BOTTOM_SPACE,
    )
    .map((name) => ({
      name,
      value: style.getPropertyValue(name),
      priority: style.getPropertyPriority(name),
    }));

const applyBubblePopupTightSpacing = (style) => {
  for (const name of BUBBLE_POPUP_TIGHT_PADDING) {
    style.setProperty(name, "0", "important");
  }
  style.setProperty(BUBBLE_POPUP_EXTRA_BOTTOM_SPACE, "0px", "important");
};

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
    if (this._host._isFirefox?.() === true) classes.push("firefox-client");
    if (this.shouldHideMobileViewOuterBorder()) {
      classes.push("mobile-view-outer-border-off");
    }
    if (this.shouldOverlayMobileViewHeader()) {
      classes.push("mobile-view-header-overlay");
    }
    return classes.join(" ");
  }

  shouldOverlayMobileViewHeader() {
    return (
      this._host._isMobileViewPageActive?.() === true &&
      this._host._config?.mobile_view_header_overlay === true
    );
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
    if (card) {
      this.syncThemeContext(card);
      for (const { configKey, className } of this.visualStyleToggleRules()) {
        const isEnabled = this._host._config?.[configKey] !== false;
        card.classList.toggle(className, !isEnabled);
      }
      card.classList.toggle(
        "mobile-view-outer-border-off",
        this.shouldHideMobileViewOuterBorder(),
      );
      card.classList.toggle(
        "mobile-view-header-overlay",
        this.shouldOverlayMobileViewHeader(),
      );
      card.classList.toggle(
        "firefox-client",
        this._host._isFirefox?.() === true,
      );
    }
    this.syncHostOuterStyles();
  }

  syncHostOuterStyles() {
    const outerShadowsOff =
      this._host._config?.outer_shadows === false ||
      this.shouldSuppressOuterShadowForPhonePage();
    this._host.classList?.toggle("outer-shadows-off", outerShadowsOff);
    this._host.classList?.toggle(
      "outer-corners-off",
      this._host._config?.rounded_corners === false,
    );

    // Clear values written by older card builds; CSS owns these now.
    this._host.style?.removeProperty?.("box-shadow");
    this._host.style?.removeProperty?.("border-radius");
  }

  shouldSuppressOuterShadowForPhonePage() {
    if (this._host._isLikelyPhoneClient?.() !== true) return false;
    return (
      this._host._isPreviewPageActive?.() === true ||
      this._host._wideViewPageController?.isWideViewPageActive?.() === true ||
      this._host._isMobileViewPageActive?.() === true
    );
  }

  applyTightMargins() {
    const tightMarginsEnabled = this._host._config?.tight_margins === true;
    const inPreviewContext = this._host._isPreviewContext();
    const naturalCardView = this._host._isCardViewPageActive?.() === true;
    const homeAssistantAutoHeight =
      !this.isInEmbeddedPopup() &&
      this.resolveHomeAssistantGridHeightMode() === "auto";
    const homeAssistantMasonry =
      !this.isInEmbeddedPopup() && this.isInMasonryView();
    if (this._host.parentElement) {
      this._host.parentElement.style.height =
        inPreviewContext ||
        naturalCardView ||
        homeAssistantAutoHeight ||
        homeAssistantMasonry ||
        this._viewportMinimumActive === true
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
    this.syncBubblePopupPadding(tightMarginsEnabled);
    const card = this._host.shadowRoot?.querySelector("#card");
    if (card) card.classList.toggle("tight-margins", tightMarginsEnabled);
    this.syncMobileSectionsFullBleed(tightMarginsEnabled);
    this.setSectionsRowGap(tightMarginsEnabled);
  }

  syncBubblePopupPadding(enabled) {
    let container = enabled ? this.composedParentElement(this._host) : null;
    for (let depth = 0; container && depth < 30; depth += 1) {
      if (container.classList?.contains?.("bubble-pop-up-container")) break;
      container = this.composedParentElement(container);
    }
    if (container === this._bubblePopupPaddingContainer) {
      if (container?.style) applyBubblePopupTightSpacing(container.style);
      return;
    }

    this.releaseBubblePopupPadding();
    if (!container?.classList?.contains?.("bubble-pop-up-container") || !container.style) return;

    let state = bubblePopupPaddingStates.get(container);
    if (!state) {
      state = {
        owners: 0,
        declarations: inlineBubblePopupSpacingDeclarations(container.style),
      };
      bubblePopupPaddingStates.set(container, state);
    }
    state.owners += 1;
    this._bubblePopupPaddingContainer = container;
    applyBubblePopupTightSpacing(container.style);
  }

  releaseBubblePopupPadding() {
    const container = this._bubblePopupPaddingContainer;
    if (!container) return;
    this._bubblePopupPaddingContainer = null;
    const state = bubblePopupPaddingStates.get(container);
    if (!state || --state.owners > 0) return;

    const { style } = container;
    for (const { name } of inlineBubblePopupSpacingDeclarations(style)) {
      style.removeProperty(name);
    }
    for (const { name, value, priority } of state.declarations) {
      style.setProperty(name, value, priority);
    }
    bubblePopupPaddingStates.delete(container);
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

  isInMasonryView() {
    let element = this._host;
    while (element) {
      if (HA_MASONRY_VIEW_TAGS.has(element.tagName)) return true;
      element = element.parentNode || element.host;
    }
    return false;
  }

  isSidebarView() {
    let element = this._host;
    while (element) {
      if (element.tagName === "HUI-SIDEBAR-VIEW") return true;
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
      if (HA_PANEL_VIEW_TAGS.has(element.tagName)) return true;
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

  resolvePanelViewAspectRatio() {
    if (this.isInEmbeddedPopup()) return null;
    if (!this.isPanelView() && !this.isSidebarView()) return null;
    if (this._host._isPreviewPageActive?.() === true) return null;
    if (
      this._host._wideViewPageController?.isWideViewPageActive?.() === true
    ) {
      return null;
    }
    if (this._host._isCardViewPageActive?.() === true) {
      return this._host._cardViewPageController?.usesOverlayPresentation?.() ===
        true
        ? 1.75
        : 1.4;
    }
    if (
      this._host._isMobileViewPageActive?.() === true ||
      this._host._singleViewPageController?.isActive?.() === true
    ) {
      return 1.2;
    }
    return null;
  }

  embeddedPopupAncestor() {
    if (this._host._isPreviewContext?.() === true) return null;
    if (
      this._host._isMobileViewPageActive?.() !== true &&
      this._host._singleViewPageController?.isActive?.() !== true
    ) {
      return null;
    }

    let element = this.composedParentElement(this._host);
    for (let depth = 0; element && depth < 30; depth += 1) {
      const tagName = String(element.tagName || "").toUpperCase();
      if (
        tagName === "DIALOG" ||
        tagName === "HA-DIALOG" ||
        element.getAttribute?.("role") === "dialog" ||
        element.classList?.contains?.("bubble-pop-up") ||
        element.classList?.contains?.("bubble-pop-up-container") ||
        element.classList?.contains?.("bubble-popup")
      ) {
        return element;
      }
      element = this.composedParentElement(element);
    }
    return null;
  }

  isInEmbeddedPopup() {
    return this.embeddedPopupAncestor() !== null;
  }

  resolveEmbeddedPopupHeightPx() {
    const popup = this.embeddedPopupAncestor();
    const parent = this._host.parentElement;
    if (!popup || !parent) return null;

    const popupBottom = Number(popup.getBoundingClientRect?.().bottom);
    const contentTop = Number(parent.getBoundingClientRect?.().top);
    const bottomPadding = this.parsePxLength(
      typeof getComputedStyle === "function"
        ? getComputedStyle(popup).paddingBottom
        : "",
    ) ?? 0;
    const availableHeight = popupBottom - contentTop - bottomPadding;
    if (Number.isFinite(availableHeight) && availableHeight > 0) {
      return availableHeight;
    }

    const parentHeight = this.measureRenderedHeight(parent);
    return parentHeight > 0 ? parentHeight : null;
  }

  clearPanelViewAspectConstraint() {
    this._host.classList?.toggle?.(
      PANEL_ASPECT_CONSTRAINED_CLASS,
      false,
    );
    if (this._panelAspectConstraintActive) {
      this._host.style?.removeProperty?.(
        PANEL_ASPECT_MAX_WIDTH_PROPERTY,
      );
      this._host.style?.removeProperty?.(
        PANEL_ASPECT_HEIGHT_PROPERTY,
      );
    }
    this._panelAspectConstraintActive = false;
  }

  syncPanelViewAspectConstraint(
    card,
    { requestedHeightPx = null } = {},
  ) {
    const ratio = this.resolvePanelViewAspectRatio();
    if (ratio == null) {
      this.clearPanelViewAspectConstraint();
      return;
    }

    const appliedHeightPx = this.parsePxLength(
      this._host.style?.getPropertyValue?.("--card-host-height"),
    );
    const availableHeightPx = this.resolveHeightWrapperViewportPx();
    const measuredHeightPx = Math.max(
      this.measureRenderedHeight(this._host),
      this.measureRenderedHeight(card),
    );
    const referenceHeightPx =
      (Number.isFinite(requestedHeightPx) && requestedHeightPx > 0
        ? requestedHeightPx
        : null) ??
      appliedHeightPx ??
      availableHeightPx ??
      measuredHeightPx;
    if (!Number.isFinite(referenceHeightPx) || referenceHeightPx <= 0) {
      this.clearPanelViewAspectConstraint();
      return;
    }

    const maxWidthPx = Math.max(1, referenceHeightPx * ratio);
    const availableWidthPx =
      this.measureRenderedWidth(this._host.parentElement) ||
      Math.max(
        this.measureRenderedWidth(this._host),
        this.measureRenderedWidth(card),
      );
    const constrainedWidthPx =
      availableWidthPx > 0
        ? Math.min(availableWidthPx, maxWidthPx)
        : maxWidthPx;
    const useNaturalPanelHeight =
      this.isPanelView() &&
      this._host._isCardViewPageActive?.() === true &&
      this._host._cardViewPageController?.usesOverlayPresentation?.() ===
        false;
    const naturalPanelHeightPx = useNaturalPanelHeight
      ? this.resolvePanelCardViewNaturalHeightPx(card, constrainedWidthPx)
      : null;
    const constrainedHeightPx = naturalPanelHeightPx != null
      ? Math.min(referenceHeightPx, naturalPanelHeightPx)
      : constrainedWidthPx / ratio;

    this._panelAspectConstraintActive = true;
    this._host.classList?.toggle?.(
      PANEL_ASPECT_CONSTRAINED_CLASS,
      true,
    );
    this._host.style?.setProperty?.(
      PANEL_ASPECT_MAX_WIDTH_PROPERTY,
      `${Math.round(maxWidthPx)}px`,
    );
    this._host.style?.setProperty?.(
      PANEL_ASPECT_HEIGHT_PROPERTY,
      `${Math.max(1, Math.round(constrainedHeightPx))}px`,
    );
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
      Number(rawHeight) === 100;
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
    const naturalCardView = this._host._isCardViewPageActive?.() === true;
    const embeddedPopupHeightPx = this.resolveEmbeddedPopupHeightPx();
    const homeAssistantGridHeightMode = embeddedPopupHeightPx != null
      ? null
      : this.resolveHomeAssistantGridHeightMode();
    const constrainToHaGrid = homeAssistantGridHeightMode === "fixed";
    let requestedHeightPx = null;
    const hostComputedStyle = naturalCardView && !constrainToHaGrid
      ? null
      : getComputedStyle(this._host);
    const haCardHeight =
      hostComputedStyle?.getPropertyValue("--ha-card-height").trim() || "";
    let expandedForMinimumBrowseHeight = false;

    if (embeddedPopupHeightPx != null && (isPercentHeight || isViewportHeight)) {
      requestedHeightPx = Math.max(
        1,
        embeddedPopupHeightPx * (numericHeight / 100),
      );
      const popupHeight = `${requestedHeightPx}px`;
      this._host.style.setProperty("--card-host-height", popupHeight);
      card.style.setProperty("--view-height", popupHeight);
    } else if (constrainToHaGrid) {
      this._host.style.setProperty("--card-host-height", "100%");
      card.style.setProperty("--view-height", "100%");
    } else if (naturalCardView) {
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
          const resolvedCardHeightPx = Math.max(
            1,
            constrainedHeightPx -
              wrapperPaddingPx -
              sectionsBottomPaddingPx,
          );
          requestedHeightPx = resolvedCardHeightPx;
          const usableHeight = this.resolveUsableHostHeight({
            card,
            resolvedHeightPx: resolvedCardHeightPx,
          });
          expandedForMinimumBrowseHeight = usableHeight.expanded;
          this._host.style.setProperty(
            "--card-host-height",
            `${usableHeight.heightPx}px`,
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
          requestedHeightPx = resolvedViewportHeightPx;
          const usableHeight = this.resolveUsableHostHeight({
            card,
            resolvedHeightPx: resolvedViewportHeightPx,
          });
          expandedForMinimumBrowseHeight = usableHeight.expanded;
          const resolvedHeightValue = `${usableHeight.heightPx}px`;
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
        requestedHeightPx = this.parsePxLength(configuredHeightValue);
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

    this.syncViewportMinimumParentHeight(expandedForMinimumBrowseHeight, {
      constrainToHaGrid,
      homeAssistantAutoHeight: homeAssistantGridHeightMode === "auto",
    });
    this.syncPanelViewAspectConstraint(card, { requestedHeightPx });

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

  shouldConstrainToHomeAssistantGridHeight() {
    return this.resolveHomeAssistantGridHeightMode() === "fixed";
  }

  resolveHomeAssistantGridHeightMode() {
    if (this._host._isPreviewContext?.() === true) return null;

    let heightManagedView = null;
    let element = this._host;
    for (let depth = 0; element && depth < 20; depth += 1) {
      if (HA_HEIGHT_MANAGED_VIEW_TAGS.has(element.tagName)) {
        heightManagedView = element;
        break;
      }
      element = element.parentNode || element.host;
    }
    if (!heightManagedView) return null;
    if (
      heightManagedView.tagName === "HUI-SECTIONS-VIEW" &&
      this.isPanelView()
    ) {
      return null;
    }

    const configuredRows = this._host._sourceConfig?.grid_options?.rows;
    const normalizedRows = String(configuredRows ?? "").trim().toLowerCase();
    if (!normalizedRows || normalizedRows === "auto") {
      return "auto";
    }
    const numericRows = Number(normalizedRows);
    return Number.isFinite(numericRows) && numericRows > 0 ? "fixed" : "auto";
  }

  resolvePercentHostHeightPx({ ratio, haCardHeight, headerHeight }) {
    const headerHeightPx = this.parsePxLength(headerHeight) ?? 56;
    const viewportHeightPx = Math.max(
      0,
      (window.visualViewport?.height || window.innerHeight || 0) -
        headerHeightPx,
    );
    const parsedHaCardHeightPx = this.parsePxLength(haCardHeight);
    const referenceHeightPx =
      parsedHaCardHeightPx != null && parsedHaCardHeightPx > 0
        ? parsedHaCardHeightPx
        : viewportHeightPx > 0
          ? viewportHeightPx
          : null;
    if (referenceHeightPx == null) return null;
    const legacyAvailableHeightPx = Math.max(
      1,
      referenceHeightPx - this.resolveBottomNavbarExtraHeightPx(),
    );
    const homeAssistantViewHeightPx =
      this.resolveHomeAssistantMobileViewHeightPx();
    const availableHeightPx =
      homeAssistantViewHeightPx != null
        ? Math.min(legacyAvailableHeightPx, homeAssistantViewHeightPx)
        : legacyAvailableHeightPx;
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
    const wrapperAvailableHeight = this.resolveHeightWrapperViewportPx();
    const homeAssistantViewHeight =
      this.resolveHomeAssistantMobileViewHeightPx();
    const availableHeight =
      wrapperAvailableHeight != null && homeAssistantViewHeight != null
        ? Math.min(wrapperAvailableHeight, homeAssistantViewHeight)
        : wrapperAvailableHeight ?? homeAssistantViewHeight;
    if (availableHeight == null) return Math.max(1, configuredHeight);

    const availableCardHeight = Math.max(
      1,
      availableHeight -
        this.resolveHeightWrapperPaddingPx() -
        this.resolveHeightSectionsBottomPaddingPx(),
    );
    return Math.max(1, Math.min(configuredHeight, availableCardHeight));
  }

  resolveMinimumUsableHostHeightPx(card) {
    if (!card?.querySelector) return null;

    const mobileLayout = card.querySelector(".layout--mobile-view");
    if (mobileLayout) {
      return this.sumRenderedHeights([
        mobileLayout.querySelector("#mobile-top"),
        mobileLayout.querySelector(".mobile-video-controls-container"),
        mobileLayout.querySelector(".mobile-tab-container"),
        mobileLayout.querySelector('[data-fvc-region="footer"]'),
      ]);
    }

    const singleLayout = card.querySelector(".layout--single-view");
    if (singleLayout) {
      return this.sumRenderedHeights([
        singleLayout.querySelector(".view-top"),
        singleLayout.querySelector(".tabs-holder"),
        singleLayout.querySelector('[data-fvc-region="footer"]'),
      ]);
    }

    const wideLayout = card.querySelector(".layout--wide-view");
    if (!wideLayout) return null;
    const leftColumn = wideLayout.querySelector(".col-left--wide-view");
    const rightColumn = wideLayout.querySelector(".col-right--wide-view");
    const leftHeight = this.sumRenderedHeights(
      [
        leftColumn?.querySelector(".live-stage"),
        leftColumn?.querySelector(".info-row"),
        leftColumn?.querySelector(".cam-switcher"),
        leftColumn?.querySelector(".tabs-holder"),
        leftColumn?.querySelector(".wide-companion-header"),
      ],
      { includeBrowseViewport: false },
    );
    const rightHeight = this.sumRenderedHeights([
      rightColumn?.querySelector(".tabs-holder"),
    ]);
    const footerHeight = this.measureRenderedHeight(
      wideLayout.querySelector('[data-fvc-region="footer"]'),
    );
    if (leftHeight == null || rightHeight == null || footerHeight <= 0) {
      return null;
    }
    return Math.ceil(
      Math.max(leftHeight, rightHeight) + footerHeight,
    );
  }

  resolveUsableHostHeight({ card, resolvedHeightPx }) {
    const configuredHeight = Number(this._host._config?.stream_height);
    const configuredHeightUnit = String(
      this._host._config?.stream_height_unit || "%",
    )
      .trim()
      .toLowerCase();
    const usesFullAvailableHeight =
      configuredHeight === 100 &&
      ["%", "vh", "dvh"].includes(configuredHeightUnit);
    const keepConstrainedViewHeight =
      usesFullAvailableHeight &&
      this._host._isLikelyMobileClient?.() !== true &&
      (this.isPanelView() || this.isSidebarView()) &&
      (this._host._isMobileViewPageActive?.() === true ||
        this._host._singleViewPageController?.isActive?.() === true);
    if (keepConstrainedViewHeight) {
      return {
        heightPx: resolvedHeightPx,
        expanded: false,
      };
    }

    const minimumUsableHeightPx =
      this.resolveMinimumUsableHostHeightPx(card);
    const heightPx =
      minimumUsableHeightPx != null
        ? Math.max(resolvedHeightPx, minimumUsableHeightPx)
        : resolvedHeightPx;
    return {
      heightPx,
      expanded: heightPx > resolvedHeightPx,
    };
  }

  sumRenderedHeights(elements, { includeBrowseViewport = true } = {}) {
    const heights = elements.map((element) =>
      this.measureRenderedHeight(element),
    );
    if (heights.some((height) => height <= 0)) return null;
    return Math.ceil(
      heights.reduce((total, height) => total + height, 0) +
        (includeBrowseViewport ? MINIMUM_BROWSE_REGION_HEIGHT_PX : 0) +
        MINIMUM_CARD_HEIGHT_BUFFER_PX,
    );
  }

  measureRenderedHeight(element) {
    const height = Number(
      element?.getBoundingClientRect?.().height || element?.clientHeight || 0,
    );
    return Number.isFinite(height) && height > 0 ? height : 0;
  }

  measureRenderedWidth(element) {
    const width = Number(
      element?.getBoundingClientRect?.().width || element?.clientWidth || 0,
    );
    return Number.isFinite(width) && width > 0 ? width : 0;
  }

  resolvePanelCardViewNaturalHeightPx(card, widthPx) {
    if (!card?.querySelector || !Number.isFinite(widthPx) || widthPx <= 0) {
      return null;
    }
    const cameraRow = card.querySelector(".card-view-camera-row");
    const drawer = card.querySelector("[data-card-view-drawer]");
    const footer = card.querySelector('[data-fvc-region="footer"]');
    const fixedHeights = [cameraRow, drawer, footer].map((element) =>
      this.measureRenderedHeight(element),
    );
    if (fixedHeights.some((height) => height <= 0)) return null;

    const liveWrap = card.querySelector("#eng-wrap");
    const configuredAspectRatio = liveWrap?.style?.getPropertyValue?.(
      "--live-view-aspect-ratio",
    );
    const aspectRatio =
      this.parseAspectRatio(configuredAspectRatio) ?? 16 / 9;
    const liveHeightPx = widthPx / aspectRatio;
    return Math.ceil(
      fixedHeights.reduce((total, height) => total + height, 0) +
        liveHeightPx +
        MINIMUM_CARD_HEIGHT_BUFFER_PX,
    );
  }

  parseAspectRatio(value) {
    const normalized = String(value || "").trim();
    if (!normalized) return null;
    const [width, height, ...rest] = normalized.split("/");
    if (rest.length) return null;
    const numerator = Number(width);
    const denominator = height == null ? 1 : Number(height);
    if (
      !Number.isFinite(numerator) ||
      !Number.isFinite(denominator) ||
      numerator <= 0 ||
      denominator <= 0
    ) {
      return null;
    }
    return numerator / denominator;
  }

  syncViewportMinimumParentHeight(
    active,
    {
      constrainToHaGrid = false,
      homeAssistantAutoHeight = false,
    } = {},
  ) {
    this._viewportMinimumActive = active === true;
    if (
      !this._host.parentElement?.style ||
      this._host._isPreviewContext?.() === true ||
      (this._host._isCardViewPageActive?.() === true && !constrainToHaGrid)
    ) {
      return;
    }
    this._host.parentElement.style.height =
      this._viewportMinimumActive ||
      homeAssistantAutoHeight ||
      (this.isInMasonryView() && !this.isInEmbeddedPopup())
        ? "auto"
        : "100%";
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

  resolveHomeAssistantMobileViewHeightPx() {
    if (
      this._host._isLikelyMobileClient?.() !== true ||
      this._host._isPreviewContext?.() === true
    ) {
      return null;
    }
    const availableHeight = Number(
      this._host._haNavbarController?.homeAssistantViewContentHeightPx?.(),
    );
    return Number.isFinite(availableHeight) && availableHeight > 0
      ? availableHeight
      : null;
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
