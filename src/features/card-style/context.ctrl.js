import { THEME_CUSTOM_ROWS } from "../../constants.js";
import { normalizeHexColor } from "../../helpers.js";

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
      "var(--fvc-outer-shadow-m)",
    );
    const outerRadius = this.resolveCardTokenForHost(
      card,
      "border-radius",
      "var(--fvc-outer-border-radius)",
    );

    this._host.style.boxShadow =
      this._host._config?.outer_shadows !== false && outerShadow
        ? outerShadow
        : "none";
    this._host.style.borderRadius = outerRadius || "0px";
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
    if (this._host.parentElement) {
      this._host.parentElement.style.height = inPreviewContext
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
    const isCompactPreview =
      this._host._config?.compact_preview === true ||
      this._host._isPreviewContext();
    const configuredHeightUnit = this._host._config.stream_height_unit || "vh";
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
    const hostComputedStyle = getComputedStyle(this._host);
    const haCardHeight = hostComputedStyle
      .getPropertyValue("--ha-card-height")
      .trim();

    if (configuredHeight) {
      if (isPercentHeight) {
        const resolvedPercentHeightPx = this.resolvePercentHostHeightPx({
          ratio: Math.max(0.01, numericHeight / 100),
          haCardHeight,
          headerHeight: hostComputedStyle.getPropertyValue("--header-height"),
        });
        if (resolvedPercentHeightPx != null) {
          this._host.style.setProperty(
            "--card-host-height",
            `${resolvedPercentHeightPx}px`,
          );
        } else {
          this._host.style.removeProperty("--card-host-height");
        }
        card.style.removeProperty("--view-height");
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

    const customTheme =
      this._host._config?.theme === "custom" &&
      this._host._config?.theme_custom &&
      typeof this._host._config.theme_custom === "object"
        ? this._host._config.theme_custom
        : {};
    const customDefaults =
      this._host._config?.theme === "custom" &&
      this._host._config?.theme_custom_defaults &&
      typeof this._host._config.theme_custom_defaults === "object"
        ? this._host._config.theme_custom_defaults
        : {};
    for (const row of THEME_CUSTOM_ROWS) {
      const key = row.key;
      const override = normalizeHexColor(customTheme[key]);
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
      (window.visualViewport?.height || window.innerHeight || 0) -
        headerHeightPx,
    );
    const referenceHeightPx =
      this.parsePxLength(haCardHeight) ??
      (viewportHeightPx > 0 ? viewportHeightPx : null);
    if (referenceHeightPx == null) return null;
    return Math.max(1, referenceHeightPx * ratio);
  }

  parsePxLength(value) {
    const match = /^(-?\d+(?:\.\d+)?)px$/i.exec(String(value || "").trim());
    if (!match) return null;
    const parsed = Number(match[1]);
    return Number.isFinite(parsed) ? parsed : null;
  }
}
