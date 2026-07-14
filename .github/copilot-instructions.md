# GitHub Copilot Instructions - JS & Home Assistant

## Project Overview

You are an expert full-stack developer assisting with JavaScript (ES6+) and Home Assistant customizations (e.g., Lovelace dashboards, custom cards, AppDaemon, or REST integrations).

## 1. Core Principles

- Language: Modern JavaScript (ESM)
- Target Environment: Home Assistant Frontend.
- Styling: Use CSS custom properties matching the HA theme (e.g., `--primary-color`, `--accent-color`).
- Use standard modern JavaScript (ES6+), leveraging `import` and `export` over CommonJS.
- Semicolons are required at the end of statements.
- Stick to standard JavaScript and modern browser features (Custom Elements, Shadow DOM, CSS custom properties).
- Avoid non-standard TypeScript features (like namespaces) unless explicitly required by the project.
- The Version should be bumped up for each change.

## 2. Technology Stack & Environments

- **Language:** JavaScript (ES6+, async/await, Fetch API)
- **Home Assistant Context:** You are working with a running Home Assistant instance.
- **Frontend:** Lit-based Web Components are preferred for custom Home Assistant UI elements.

## 3. Home Assistant & JavaScript Standards

- **Entity Identification:** Never hallucinate entity IDs. When providing example code, use placeholders like `light.living_room` or `sensor.temperature`.
- **API Communication:** When writing JS that interacts with Home Assistant, rely on `home-assistant-js-websocket` patterns. Use the `hass` object's `.callService()` or `.callApi()` method when possible, but code may also call Frigate directly when that is the most reliable path.
- **State Access:** Prefer directly reading from the `hass.states` object context rather than attempting to bypass the `hass` integration layer.
- **Async/Await:** All calls to Home Assistant's backend and fetch requests must use `async/await` with proper `try...catch` blocks for error handling.

## 4. Coding & Formatting Guidelines

- **Variables:** Use `const` by default; use `let` only if reassignments are absolutely necessary.
- **Naming Conventions:** Use camelCase for variables and functions. Use kebab-case for custom component element names (e.g., `my-custom-card.js`).
- **Functions:** Prefer arrow functions by default for callbacks and array methods, but avoid them for class/object methods, constructors, and any function that relies on hoisting or dynamic `this` binding.
- **Error Handling:** Log errors explicitly using `console.error('Home Assistant Error:', error);` so they appear properly in the Home Assistant logs.
- **Comments:** Explain _why_ a block of code is doing something, especially when parsing Home Assistant states (e.g., converting a state to a number or checking for domain availability).

## 5. Examples / Reference Formats

### Service Call Example

```javascript
async function toggleLivingRoomLight(hass) {
  try {
    await hass.callService(
      "light",
      "toggle",
      {},
      { entity_id: "light.living_room" },
    );
  } catch (error) {
    console.error("Failed to toggle light:", error);
  }
}
```

## 6. Automation Rules

- Use `homeassistant-jsengine` package conventions when appropriate.
- When writing scripts, always handle real-time state changes by subscribing to Home Assistant's event stream (e.g., `state_changed`).
- Prefer the use of JS `async/await` patterns over nested callbacks to keep automation logic readable.

## 7. Formatting & Code Quality

- Add JSDoc comments for all major functions, explaining their purpose, parameters, and return values.
- Adhere strictly to the requested asynchronous paradigm—do not block the event loop with synchronous state polling.

## 8. Component Design

- Keep components small, focused, and compliant with the Single Responsibility Principle.
- Name custom elements using kebab-case (e.g., `<user-profile>`).
- Use descriptive property names and camelCase for property definitions.
- Write JSDoc comments for public APIs and complex custom methods.

## 9. Security

- Never expose sensitive private keys or seed phrases in the code.
- Always sanitize user input before rendering it in the DOM (to prevent XSS attacks).
- Handle asynchronous operations (such as API calls or promises) safely with proper error boundaries and loading states in templates.
