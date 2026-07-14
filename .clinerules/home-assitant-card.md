# Home Assistant Custom Card Development Rules (Vanilla JS)

You are an expert developer specializing in the Home Assistant Frontend architecture, custom UI components, and modern Vanilla JavaScript Web Components.

## Core Directives

- **No External Frameworks:** Never use LitElement, React, Vue, or TypeScript. Write raw, lightweight Vanilla JS utilizing standard HTML Web Components.
- **Encapsulation:** Always utilize Shadow DOM to insulate card styles from the main Home Assistant theme.

## Component Architecture & Boilerplate

Every custom card element must strictly follow this exact lifecycle structure:

1. **Class Definition:** Extend `HTMLElement` directly.
2. **`setConfig(config)`:**
   - Must throw an error if required configuration properties (like `entity`) are missing.
   - Save the `config` object locally (`this._config = config`).
3. **`set hass(hass)`:**
   - Must accept the reactive `hass` object containing states.
   - Do not completely rebuild the DOM on every `hass` update. Update only modified nodes.
   - Cache the reference (`this._hass = hass`).
4. **Card Registration:** Register the card element at the bottom using `customElements.define('my-custom-card', MyCustomCardClass)`.
5. **Card Picker Integration:** Append properties to `window.customCards` so the card appears gracefully in the visual Lovelace dashboard card picker.

### Mandatory Standard Boilerplate Example

```javascript
class MyCustomCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  setConfig(config) {
    if (!config.entity) {
      throw new Error("Please define an entity");
    }
    this._config = config;
  }

  set hass(hass) {
    const entityId = this._config.entity;
    const stateObj = hass.states[entityId];

    if (!this.shadowRoot.getElementById("container")) {
      this._createCard();
    }

    this._updateCard(stateObj);
  }

  _createCard() {
    const card = document.createElement("ha-card");
    card.id = "container";

    const style = document.createElement("style");
    style.textContent = `
      ha-card { padding: 16px; }
      .state { font-weight: bold; color: var(--primary-text-color); }
    `;

    const content = document.createElement("div");
    content.className = "card-content";
    content.innerHTML = `<div>State: <span class="state">---</span></div>`;

    card.appendChild(style);
    card.appendChild(content);
    this.shadowRoot.appendChild(card);
  }

  _updateCard(stateObj) {
    const stateSpan = this.shadowRoot.querySelector(".state");
    if (stateSpan && stateObj) {
      stateSpan.textContent = stateObj.state;
    }
  }

  getCardSize() {
    return 1;
  }
}

customElements.define("my-custom-card", MyCustomCard);

window.customCards = window.customCards || [];
window.customCards.push({
  type: "my-custom-card",
  name: "My Custom Card",
  preview: false,
  description: "A beautiful vanilla JS custom card.",
});
```

## Styling & Theming

- Always wrap the layout inside an `<ha-card>` tag to automatically inherit core styling, background shadows, and border radii.
- **CSS Custom Variables:** Do not hardcode specific colors or hex codes. Always use standard Home Assistant CSS theme variables for cross-theme compatibility (light/dark mode):
  - Text Colors: `var(--primary-text-color)`, `var(--secondary-text-color)`
  - Backgrounds: `var(--card-background-color)`, `var(--paper-card-background-color)`
  - Accent Colors: `var(--primary-color)`, `var(--accent-color)`, `var(--error-color)`
  - State Colors: `var(--state-icon-color)`, `var(--state-light-active-color)`

## State Actions & Interactivity

- **Firing Service Calls:** To trigger actions (like toggling a light or opening a door), do not use raw API calls. Always dispatch standard Home Assistant DOM events:
  ```javascript
  this.dispatchEvent(
    new CustomEvent("hass-action", {
      detail: {
        config: this._config,
        action: "tap",
      },
      bubbles: true,
      composed: true,
    }),
  );
  ```
  _Alternatively, utilize the legacy method for explicit service calls:_
  ```javascript
  this._hass.callService("light", "toggle", { entity_id: this._config.entity });
  ```

## Quality and Diagnostics Rules

- Implement `getCardSize()` returning an integer representing the row height (1 unit ≈ 50px).
- Gracefully handle cases where the specified entity is missing or hasn't finished loading in `hass.states`.
