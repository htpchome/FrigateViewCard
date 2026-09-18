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
import { THEME_CUSTOM_ROWS } from "../src/constants.js";

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

test("bundled German resolves regional HA locales and falls back to English per key", () => {
  const localization = createLocalizationController();
  localization.updateHass({ locale: { language: "de_DE" } });
  assert.equal(localization.language, "de-DE");
  assert.equal(localization.resolvedLanguage, "de");
  assert.equal(localization.t("runtime.toolbar.alerts"), "Alarme");
  assert.equal(
    localization.t("editor.cameraModal.deleteConfirm", { camera: "Haustür" }),
    "Möchtest du „Haustür“ wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.",
  );

  const english = JSON.parse(readFileSync(
    new URL("../src/features/localization/languages/en.json", import.meta.url),
    "utf8",
  ));
  const sparse = createLocalizationController({
    dictionaries: { en: english, de: { runtime: { toolbar: { alerts: "Alarme" } } } },
  });
  sparse.setLanguage("de-DE");
  assert.equal(sparse.t("runtime.toolbar.alerts"), "Alarme");
  assert.equal(sparse.t("runtime.toolbar.clips"), "Clips");
  assert.equal(sparse.t("runtime.toolbar.recordings"), "Recordings");
});

test("Spanish and Latin American Spanish use regional wording with layered fallback", () => {
  const localization = createLocalizationController();
  localization.updateHass({ locale: { language: "es_ES" } });
  assert.equal(localization.language, "es-ES");
  assert.equal(localization.resolvedLanguage, "es");
  assert.equal(localization.t("editor.actions.add"), "Añadir");
  assert.equal(localization.t("editor.preview.liveDesktop"), "Cámaras en vivo en el ordenador");

  localization.updateHass({ locale: { language: "es_419" } });
  assert.equal(localization.language, "es-419");
  assert.equal(localization.resolvedLanguage, "es-419");
  assert.equal(localization.t("editor.actions.add"), "Agregar");
  assert.equal(localization.t("editor.preview.liveDesktop"), "Cámaras en vivo en computadoras");
  assert.equal(localization.t("runtime.cardPickerDemo.vehicleArea"), "entrada de autos");
  assert.equal(localization.t("runtime.toolbar.alerts"), "Alertas");

  const english = JSON.parse(readFileSync(
    new URL("../src/features/localization/languages/en.json", import.meta.url),
    "utf8",
  ));
  const sparse = createLocalizationController({
    dictionaries: {
      en: english,
      es: { runtime: { toolbar: { alerts: "Alertas" } } },
      "es-419": { runtime: { toolbar: { alerts: "Avisos" } } },
    },
  });
  sparse.setLanguage("es-419");
  assert.equal(sparse.t("runtime.toolbar.alerts"), "Avisos");
  assert.equal(sparse.t("runtime.toolbar.recordings"), "Recordings");
});

test("bundled French resolves regional HA locales", () => {
  const localization = createLocalizationController();
  localization.updateHass({ locale: { language: "fr_CA" } });
  assert.equal(localization.language, "fr-CA");
  assert.equal(localization.resolvedLanguage, "fr");
  assert.equal(localization.t("runtime.toolbar.alerts"), "Alertes");
  assert.equal(localization.t("editor.actions.add"), "Ajouter");
  assert.equal(
    localization.t("editor.cameraModal.deleteConfirm", { camera: "Entrée" }),
    "Voulez-vous vraiment supprimer « Entrée » ? Cette action est irréversible.",
  );
});

test("Portuguese and Brazilian Portuguese use regional wording with layered fallback", () => {
  const localization = createLocalizationController();
  localization.updateHass({ locale: { language: "pt_PT" } });
  assert.equal(localization.language, "pt-PT");
  assert.equal(localization.resolvedLanguage, "pt-PT");
  assert.equal(localization.t("runtime.live.liveTile"), "DIRETO");
  assert.equal(localization.t("runtime.live.camera"), "Câmara");
  assert.equal(localization.t("editor.actions.delete"), "Eliminar");

  localization.updateHass({ locale: { language: "pt_BR" } });
  assert.equal(localization.language, "pt-BR");
  assert.equal(localization.resolvedLanguage, "pt-BR");
  assert.equal(localization.t("runtime.live.liveTile"), "AO VIVO");
  assert.equal(localization.t("runtime.live.camera"), "Câmera");
  assert.equal(localization.t("editor.actions.delete"), "Excluir");
  assert.equal(localization.t("runtime.toolbar.alerts"), "Alertas");
  assert.equal(
    localization.t("editor.cameraModal.deleteConfirm", { camera: "Entrada" }),
    "Tem certeza de que deseja excluir “Entrada”? Esta ação não pode ser desfeita.",
  );

  localization.updateHass({ locale: { language: "pt_AO" } });
  assert.equal(localization.language, "pt-AO");
  assert.equal(localization.resolvedLanguage, "pt");
});

test("bundled Italian resolves regional HA locales", () => {
  const localization = createLocalizationController();
  localization.updateHass({ locale: { language: "it_CH" } });
  assert.equal(localization.language, "it-CH");
  assert.equal(localization.resolvedLanguage, "it");
  assert.equal(localization.t("runtime.toolbar.alerts"), "Avvisi");
  assert.equal(localization.t("runtime.live.liveTile"), "DIRETTA");
  assert.equal(localization.t("editor.actions.add"), "Aggiungi");
  assert.equal(
    localization.t("editor.cameraModal.deleteConfirm", { camera: "Ingresso" }),
    "Vuoi davvero eliminare «Ingresso»? Questa azione non può essere annullata.",
  );
});

test("bundled Polish resolves regional HA locales", () => {
  const localization = createLocalizationController();
  localization.updateHass({ locale: { language: "pl_PL" } });
  assert.equal(localization.language, "pl-PL");
  assert.equal(localization.resolvedLanguage, "pl");
  assert.equal(localization.t("runtime.toolbar.alerts"), "Alerty");
  assert.equal(localization.t("runtime.live.liveTile"), "NA ŻYWO");
  assert.equal(localization.t("editor.actions.add"), "Dodaj");
  assert.equal(
    localization.t("editor.cameraModal.deleteConfirm", { camera: "Wejście" }),
    "Czy na pewno chcesz usunąć kamerę „Wejście”? Tej operacji nie można cofnąć.",
  );
});

test("bundled Catalan resolves regional HA locales", () => {
  const localization = createLocalizationController();
  localization.updateHass({ locale: { language: "ca_ES" } });
  assert.equal(localization.language, "ca-ES");
  assert.equal(localization.resolvedLanguage, "ca");
  assert.equal(localization.t("runtime.toolbar.alerts"), "Alertes");
  assert.equal(localization.t("runtime.live.liveTile"), "EN DIRECTE");
  assert.equal(localization.t("editor.actions.add"), "Afegeix");
  assert.equal(
    localization.t("editor.cameraModal.deleteConfirm", { camera: "Entrada" }),
    "Segur que vols eliminar «Entrada»? Aquesta acció no es pot desfer.",
  );
});

test("full catalogs cover English keys and regional overrides preserve placeholders", () => {
  const load = (file) => JSON.parse(readFileSync(
    new URL("../src/features/localization/languages/" + file + ".json", import.meta.url),
    "utf8",
  ));
  const flatten = (value, prefix = "") => Object.entries(value).flatMap(([key, entry]) =>
    typeof entry === "string"
      ? [[prefix + key, entry]]
      : flatten(entry, prefix + key + "."),
  );
  const english = new Map(flatten(load("en")));
  const placeholders = (value) => [...value.matchAll(/\{([A-Za-z][A-Za-z0-9_]*)\}/g)]
    .map((match) => match[1]).sort();
  for (const language of ["de", "es", "fr", "pt", "it", "pl", "ca"]) {
    const translated = new Map(flatten(load(language)));
    assert.deepEqual([...translated.keys()].sort(), [...english.keys()].sort());
    for (const [key, source] of english) {
      assert.ok(translated.get(key)?.trim(), "Empty " + language + " translation: " + key);
      assert.deepEqual(
        placeholders(translated.get(key)),
        placeholders(source),
        "Placeholder mismatch in " + language + ": " + key,
      );
    }
  }
  for (const [baseLanguage, regionalLanguage] of [["es", "es-419"], ["pt", "pt-BR"]]) {
    const base = new Map(flatten(load(baseLanguage)));
    const regional = new Map(flatten(load(regionalLanguage)));
    for (const [key, translation] of regional) {
      assert.ok(english.has(key), "Unknown " + regionalLanguage + " key: " + key);
      assert.ok(translation.trim(), "Empty " + regionalLanguage + " translation: " + key);
      assert.notEqual(translation, base.get(key), "Redundant regional override: " + key);
      assert.deepEqual(
        placeholders(translation),
        placeholders(english.get(key)),
        "Placeholder mismatch in " + regionalLanguage + ": " + key,
      );
    }
  }
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

test("localized attributes interpolate named values without replacing controls", () => {
  const attributes = new Map([
    ["data-fvc-i18n-aria-label", "example.count"],
    ["data-fvc-i18n-values", JSON.stringify({ count: 4, camera: "Porch" })],
  ]);
  const input = {
    checked: true,
    getAttribute: (name) => attributes.get(name) ?? null,
    setAttribute: (name, value) => attributes.set(name, value),
  };
  const localization = createLocalizationController({ dictionaries });
  localization.setLanguage("fr");
  applyLocalizedText({ querySelectorAll: () => [input] }, localization.t);
  assert.equal(attributes.get("aria-label"), "Pour Porch : 4 alertes");
  assert.equal(input.checked, true);
});

test("snapshot alt text retains its camera value across language changes", () => {
  const attributes = new Map([
    ["data-fvc-i18n-alt", "example.count"],
    ["data-fvc-i18n-values", JSON.stringify({ count: 1, camera: "Porch" })],
  ]);
  const image = {
    getAttribute: (name) => attributes.get(name) ?? null,
    setAttribute: (name, value) => attributes.set(name, value),
  };
  const localization = createLocalizationController({ dictionaries });
  localization.setLanguage("fr");
  applyLocalizedText({ querySelectorAll: () => [image] }, localization.t);
  assert.equal(attributes.get("alt"), "Pour Porch : 1 alertes");
});

test("repeated localized status sync leaves unchanged text alone", () => {
  const attributes = new Map();
  let textValue = "";
  let textWrites = 0;
  const status = {
    get textContent() { return textValue; },
    set textContent(value) { textValue = value; textWrites += 1; },
    getAttribute: (name) => attributes.get(name) ?? null,
    setAttribute: (name, value) => attributes.set(name, value),
    removeAttribute: (name) => attributes.delete(name),
  };
  const localization = createLocalizationController({ dictionaries });
  setLocalizedText(status, "example.count", localization.t, {
    count: 2,
    camera: "Porch",
  });
  setLocalizedText(status, "example.count", localization.t, {
    count: 2,
    camera: "Porch",
  });
  assert.equal(textValue, "2 alerts for Porch");
  assert.equal(textWrites, 1);
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

test("every editable theme color has an English localization key", () => {
  const localization = createLocalizationController();
  for (const { key, label } of THEME_CUSTOM_ROWS) {
    const suffix = key.replace(/^--c-/, "").replaceAll("-", "_");
    assert.equal(localization.t(`editor.theme.colors.${suffix}`), label);
  }
});
