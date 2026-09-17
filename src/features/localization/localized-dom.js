const LOCALIZED_ATTRIBUTES = Object.freeze({
  "data-fvc-i18n-title": "title",
  "data-fvc-i18n-aria-label": "aria-label",
  "data-fvc-i18n-label": "label",
  "data-fvc-i18n-placeholder": "placeholder",
});

const LOCALIZED_SELECTOR = [
  "[data-fvc-i18n]",
  ...Object.keys(LOCALIZED_ATTRIBUTES).map((attribute) => `[${attribute}]`),
].join(",");

export const applyLocalizedText = (root, t) => {
  if (typeof root?.querySelectorAll !== "function" || typeof t !== "function") {
    return;
  }
  for (const element of root.querySelectorAll(LOCALIZED_SELECTOR)) {
    const textKey = element.getAttribute("data-fvc-i18n");
    if (textKey) {
      let values = {};
      const serializedValues = element.getAttribute("data-fvc-i18n-values");
      if (serializedValues) {
        try {
          const parsed = JSON.parse(serializedValues);
          if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
            values = parsed;
          }
        } catch {
          values = {};
        }
      }
      const value = t(textKey, values);
      if (element.textContent !== value) element.textContent = value;
    }
    for (const [keyAttribute, targetAttribute] of Object.entries(
      LOCALIZED_ATTRIBUTES,
    )) {
      const key = element.getAttribute(keyAttribute);
      if (!key) continue;
      const value = t(key);
      if (element.getAttribute(targetAttribute) !== value) {
        element.setAttribute(targetAttribute, value);
      }
    }
  }
};

export const setLocalizedText = (element, key, t, values = {}) => {
  if (!element) return;
  if (!key) {
    element.removeAttribute?.("data-fvc-i18n");
    element.removeAttribute?.("data-fvc-i18n-values");
    element.textContent = "";
    return;
  }
  element.setAttribute?.("data-fvc-i18n", key);
  if (Object.keys(values).length) {
    element.setAttribute?.("data-fvc-i18n-values", JSON.stringify(values));
  } else {
    element.removeAttribute?.("data-fvc-i18n-values");
  }
  element.textContent = t(key, values);
};
