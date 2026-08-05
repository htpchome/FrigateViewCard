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
}
