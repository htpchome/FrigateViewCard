export const applyLocalizedDates = (root, formatters = {}) => {
  if (typeof root?.querySelectorAll !== "function") return;
  for (const element of root.querySelectorAll(
    "[data-fvc-date-ts][data-fvc-date-format]",
  )) {
    const rawTimestamp = element.getAttribute("data-fvc-date-ts");
    if (!rawTimestamp) continue;
    const timestamp = Number(rawTimestamp);
    if (!Number.isFinite(timestamp)) continue;
    const format = element.getAttribute("data-fvc-date-format");
    if (!Object.hasOwn(formatters, format)) continue;
    const value = String(formatters[format](timestamp, element));
    const interpolationKey = element.getAttribute("data-fvc-date-i18n-value");
    if (interpolationKey) {
      const serialized = element.getAttribute("data-fvc-i18n-values");
      let values = {};
      try {
        values = JSON.parse(serialized || "{}") || {};
      } catch {
        values = {};
      }
      if (values[interpolationKey] === value) continue;
      element.setAttribute(
        "data-fvc-i18n-values",
        JSON.stringify({ ...values, [interpolationKey]: value }),
      );
      continue;
    }
    const targetAttribute = element.getAttribute("data-fvc-date-attribute");
    if (targetAttribute) {
      if (element.getAttribute(targetAttribute) !== value) {
        element.setAttribute(targetAttribute, value);
      }
      continue;
    }
    if (element.textContent !== value) element.textContent = value;
  }
};
