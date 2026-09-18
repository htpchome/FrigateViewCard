import english from "./languages/en.json" with { type: "json" };
import german from "./languages/de.json" with { type: "json" };
import spanish from "./languages/es.json" with { type: "json" };
import latinAmericanSpanish from "./languages/es-419.json" with { type: "json" };
import french from "./languages/fr.json" with { type: "json" };
import portuguese from "./languages/pt.json" with { type: "json" };
import brazilianPortuguese from "./languages/pt-BR.json" with { type: "json" };
import italian from "./languages/it.json" with { type: "json" };
import polish from "./languages/pl.json" with { type: "json" };

const DEFAULT_LANGUAGE = "en";
const bundledLanguages = Object.freeze({
  en: english,
  de: german,
  es: spanish,
  "es-419": latinAmericanSpanish,
  fr: french,
  pt: portuguese,
  "pt-PT": portuguese,
  "pt-BR": brazilianPortuguese,
  it: italian,
  pl: polish,
});

export const normalizeLanguageCode = (language) => {
  const candidate = String(language ?? "").trim().replaceAll("_", "-");
  if (!candidate) return DEFAULT_LANGUAGE;
  try {
    return Intl.getCanonicalLocales(candidate)[0] || DEFAULT_LANGUAGE;
  } catch {
    return DEFAULT_LANGUAGE;
  }
};

export const resolveHassLanguage = (hass) =>
  normalizeLanguageCode(hass?.locale?.language || hass?.language);

const readTranslation = (dictionary, key) => {
  let value = dictionary;
  for (const part of String(key).split(".")) {
    if (!value || !Object.hasOwn(value, part)) return null;
    value = value[part];
  }
  return typeof value === "string" ? value : null;
};

export const createLocalizationController = ({
  dictionaries = bundledLanguages,
} = {}) => {
  const available = new Map(
    Object.entries(dictionaries).map(([language, dictionary]) => [
      normalizeLanguageCode(language),
      dictionary,
    ]),
  );
  let language = DEFAULT_LANGUAGE;
  let lookupLanguages = [DEFAULT_LANGUAGE];

  const setLanguage = (requestedLanguage) => {
    const nextLanguage = normalizeLanguageCode(requestedLanguage);
    if (nextLanguage === language) return false;
    language = nextLanguage;
    lookupLanguages = [];
    let candidate = language;
    while (candidate) {
      if (available.has(candidate)) lookupLanguages.push(candidate);
      const lastSeparator = candidate.lastIndexOf("-");
      candidate = lastSeparator < 0 ? "" : candidate.slice(0, lastSeparator);
    }
    if (!lookupLanguages.includes(DEFAULT_LANGUAGE)) {
      lookupLanguages.push(DEFAULT_LANGUAGE);
    }
    return true;
  };

  const t = (key, values = {}) => {
    const text = lookupLanguages
      .map((locale) => readTranslation(available.get(locale), key))
      .find((value) => value !== null) ?? String(key);
    return text.replace(/\{([A-Za-z][A-Za-z0-9_]*)\}/g, (token, name) =>
      Object.hasOwn(values, name) ? String(values[name]) : token,
    );
  };

  return Object.freeze({
    get language() {
      return language;
    },
    get resolvedLanguage() {
      return lookupLanguages[0];
    },
    setLanguage,
    updateHass: (hass) => setLanguage(resolveHassLanguage(hass)),
    t,
  });
};
