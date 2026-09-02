const DEFAULT_MAX_ENTRIES = 32;

export function createDateFormatterCache({
  createFormatter = (locales, options) =>
    new Intl.DateTimeFormat(locales, options),
  maxEntries = DEFAULT_MAX_ENTRIES,
} = {}) {
  const formatters = new Map();
  const limit = Math.max(1, Number(maxEntries) || DEFAULT_MAX_ENTRIES);

  const get = (key, locales, options) => {
    const cacheKey = String(key || "");
    if (!cacheKey) return createFormatter(locales, options);

    const cached = formatters.get(cacheKey);
    if (cached) {
      formatters.delete(cacheKey);
      formatters.set(cacheKey, cached);
      return cached;
    }

    const formatter = createFormatter(locales, options);
    formatters.set(cacheKey, formatter);
    while (formatters.size > limit) {
      formatters.delete(formatters.keys().next().value);
    }
    return formatter;
  };

  return Object.freeze({ get });
}
