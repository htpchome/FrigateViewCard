import assert from "node:assert/strict";
import test from "node:test";
import {
  createLocalizationController,
  normalizeLanguageCode,
  resolveHassLanguage,
} from "../src/features/localization/localization.ctrl.js";
import { applyLocalizedText } from "../src/features/localization/localized-dom.js";

const dictionaries = {
  en: {
    example: {
      title: "Camera",
      fallback: "English fallback",
      count: "{count} alerts for {camera}",
    },
  },
  fr: {
    example: { title: "Caméra" },
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
