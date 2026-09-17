import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  createLocalizationController,
  normalizeLanguageCode,
  resolveHassLanguage,
} from "../src/features/localization/localization.ctrl.js";
import {
  applyLocalizedText,
  setLocalizedText,
} from "../src/features/localization/localized-dom.js";

const dictionaries = {
  en: {
    example: {
      title: "Camera",
      fallback: "English fallback",
      count: "{count} alerts for {camera}",
    },
  },
  fr: {
    example: {
      title: "Caméra",
      count: "Pour {camera} : {count} alertes",
    },
  },
  "fr-CA": {
    example: { title: "Caméra canadienne" },
  },
};

test("uses Home Assistant's user locale and normalizes regional codes", () => {
  assert.equal(resolveHassLanguage({ locale: { language: "fr_CA" } }), "fr-CA");
  assert.equal(resolveHassLanguage({ language: "fr" }), "fr");
  assert.equal(resolveHassLanguage({ locale: { language: "" }, language: "fr" }), "fr");
  assert.equal(resolveHassLanguage({}), "en");
  assert.equal(normalizeLanguageCode("invalid locale!"), "en");
});

test("falls back from exact locale to base language, then English per key", () => {
  const localization = createLocalizationController({ dictionaries });
  assert.equal(localization.t("example.title"), "Camera");
  assert.equal(localization.updateHass({ locale: { language: "fr_CA" } }), true);
  assert.equal(localization.language, "fr-CA");
  assert.equal(localization.t("example.title"), "Caméra canadienne");
  assert.equal(localization.t("example.fallback"), "English fallback");
  assert.equal(localization.updateHass({ locale: { language: "fr_BE" } }), true);
  assert.equal(localization.resolvedLanguage, "fr");
  assert.equal(localization.t("example.title"), "Caméra");
  assert.equal(localization.updateHass({ locale: { language: "fr_BE" } }), false);
  assert.equal(localization.updateHass({ language: "de-DE" }), true);
  assert.equal(localization.resolvedLanguage, "en");
  assert.equal(localization.t("example.title"), "Camera");
  assert.equal(localization.t("example.missing"), "example.missing");
});

test("interpolates only supplied named values", () => {
  const localization = createLocalizationController({ dictionaries });
  assert.equal(
    localization.t("example.count", { count: 3, camera: "Porch" }),
    "3 alerts for Porch",
  );
  assert.equal(localization.t("example.count", { count: 3 }), "3 alerts for {camera}");
});

test("updates only marked text and attributes without replacing elements", () => {
  const attributes = new Map([
    ["data-fvc-i18n", "example.title"],
    ["data-fvc-i18n-title", "example.fallback"],
  ]);
  const element = {
    textContent: "Original",
    getAttribute: (name) => attributes.get(name) ?? null,
    setAttribute: (name, value) => attributes.set(name, value),
    removeAttribute: (name) => attributes.delete(name),
  };
  const root = { querySelectorAll: () => [element] };
  const localization = createLocalizationController({ dictionaries });
  localization.setLanguage("fr");
  applyLocalizedText(root, localization.t);
  assert.equal(element.textContent, "Caméra");
  assert.equal(attributes.get("title"), "English fallback");
  assert.equal(root.querySelectorAll()[0], element);
  applyLocalizedText(root, localization.t);
  assert.equal(element.textContent, "Caméra");
});

test("dynamic messages retain named values across language changes and clear cleanly", () => {
  const attributes = new Map();
  const element = {
    textContent: "",
    getAttribute: (name) => attributes.get(name) ?? null,
    setAttribute: (name, value) => attributes.set(name, value),
    removeAttribute: (name) => attributes.delete(name),
  };
  const localization = createLocalizationController({ dictionaries });
  setLocalizedText(element, "example.count", localization.t, {
    count: 2,
    camera: "Porch",
  });
  assert.equal(element.textContent, "2 alerts for Porch");
  localization.setLanguage("fr");
  applyLocalizedText({ querySelectorAll: () => [element] }, localization.t);
  assert.equal(element.textContent, "Pour Porch : 2 alertes");
  setLocalizedText(element, null, localization.t);
  assert.equal(element.textContent, "");
  assert.equal(attributes.has("data-fvc-i18n"), false);
});

test("all extracted editor keys and settings headings exist in English", () => {
  const source = readFileSync(
    new URL("../src/editor/FrigateViewCardEditor.js", import.meta.url),
    "utf8",
  );
  const localization = createLocalizationController();
  const keys = new Set(
    [...source.matchAll(/editor\.[A-Za-z0-9.]+/g)]
      .map(([key]) => key)
      .filter((key) => !key.endsWith(".")),
  );
  for (const [, panelId] of source.matchAll(/_renderSettingsPanel\(\{ id: "([^"]+)"/g)) {
    keys.add(`editor.panels.${panelId}`);
  }
  for (const key of keys) {
    assert.notEqual(localization.t(key), key, `Missing English localization: ${key}`);
  }
});
