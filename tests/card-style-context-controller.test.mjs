import { test } from "node:test";
import assert from "node:assert/strict";

import { CardStyleContextController } from "../src/features/card-style/context.ctrl.js";
import { STYLES } from "../src/styles.js";

const withGlobals = (overrides, fn) => {
  const originalDocument = global.document;
  const originalGetComputedStyle = global.getComputedStyle;
  const originalWindow = global.window;
  global.document = overrides.document;
  global.getComputedStyle = overrides.getComputedStyle;
  global.window = overrides.window;
  try {
    fn();
  } finally {
    global.document = originalDocument;
    global.getComputedStyle = originalGetComputedStyle;
    global.window = originalWindow;
  }
};

test("cardStateClassNames reflects disabled toggles and preview state", () => {
  const controller = new CardStyleContextController({
    _config: { shadows: false, borders: true, rounded_corners: false },
    _isPreviewPageActive: () => true,
    _isLikelyMobileClient: () => true,
    _isLikelyPhoneClient: () => true,
  });

  assert.equal(
    controller.cardStateClassNames(),
    "shadows-off corners-off preview-active mobile-client phone-client",
  );
});

test("cardStateClassNames distinguishes phones from tablets", () => {
  const controller = new CardStyleContextController({
    _config: {},
    _isPreviewPageActive: () => false,
    _isLikelyMobileClient: () => true,
    _isLikelyPhoneClient: () => false,
  });

  assert.equal(controller.cardStateClassNames(), "mobile-client");
});

test("mobile Single View keeps filter and calendar panels inside the card", () => {
  assert.match(
    STYLES,
    /\.card\.mobile-client \.layout--single-view \.button-holder--responsive-toolbar\{position:relative;\}/,
  );
  assert.match(
    STYLES,
    /\.card\.mobile-client \.layout--single-view \.filter-panel,[\s\S]*?width:calc\(100% - 16px\);min-width:0;/,
  );
});

test("Mobile View outer border setting applies on every device", () => {
  const host = {
    _config: { mobile_view_outer_border: false },
    _isPreviewPageActive: () => false,
    _isLikelyMobileClient: () => false,
    _isLikelyPhoneClient: () => false,
    _isMobileViewPageActive: () => true,
  };
  const controller = new CardStyleContextController(host);

  assert.equal(
    controller.cardStateClassNames(),
    "mobile-view-outer-border-off",
  );

  host._config.mobile_view_outer_border = true;
  assert.equal(controller.cardStateClassNames(), "");

  host._config.mobile_view_outer_border = false;
  host._isMobileViewPageActive = () => false;
  assert.equal(controller.cardStateClassNames(), "");
});

test("syncThemeContext exposes Home Assistant mode and theme source", () => {
  const card = { dataset: {} };
  const host = {
    _hass: {
      themes: { darkMode: true, theme: "Midnight Slate" },
      selectedTheme: "Ignored Theme",
    },
    shadowRoot: { querySelector: () => card },
  };
  const controller = new CardStyleContextController(host);

  controller.syncThemeContext();

  assert.deepEqual(card.dataset, {
    themeMode: "dark",
    haTheme: "custom",
  });

  host._hass = { themes: { darkMode: false }, selectedTheme: "" };
  controller.syncThemeContext();

  assert.deepEqual(card.dataset, {
    themeMode: "light",
    haTheme: "default",
  });

  host._hass = {
    themes: {
      darkMode: true,
      theme: "default",
      default_theme: "default",
      default_dark_theme: "Midnight Slate",
    },
  };
  controller.syncThemeContext();

  assert.deepEqual(card.dataset, {
    themeMode: "dark",
    haTheme: "custom",
  });
});

test("custom HA themes derive dark primary only when they omit it", () => {
  const card = { dataset: {} };
  const host = {
    _hass: {
      themes: {
        darkMode: false,
        theme: "Incomplete Theme",
        themes: {
          "Incomplete Theme": {
            "primary-color": "#6699cc",
          },
          "Complete Theme": {
            "primary-color": "#6699cc",
            "dark-primary-color": "#224466",
          },
          "Mode Theme": {
            "primary-color": "#6699cc",
            modes: {
              dark: { "dark-primary-color": "#112233" },
            },
          },
        },
      },
    },
    shadowRoot: { querySelector: () => card },
  };
  const controller = new CardStyleContextController(host);

  controller.syncThemeContext();
  assert.equal(card.dataset.haDarkPrimary, "derived");

  host._hass.themes.theme = "Complete Theme";
  controller.syncThemeContext();
  assert.equal(card.dataset.haDarkPrimary, undefined);

  host._hass.themes.theme = "Mode Theme";
  host._hass.themes.darkMode = true;
  controller.syncThemeContext();
  assert.equal(card.dataset.haDarkPrimary, undefined);

  host._hass.themes.darkMode = false;
  controller.syncThemeContext();
  assert.equal(card.dataset.haDarkPrimary, "derived");
});

test("unknown custom theme definitions preserve Home Assistant dark primary", () => {
  const card = { dataset: {} };
  const host = {
    _hass: {
      themes: {
        darkMode: false,
        theme: "Unavailable Definition",
      },
    },
    shadowRoot: { querySelector: () => card },
  };
  const controller = new CardStyleContextController(host);

  controller.syncThemeContext();

  assert.deepEqual(card.dataset, {
    themeMode: "light",
    haTheme: "custom",
  });
});

test("card mobile surfaces use the HA token and exact mode list colors", () => {
  assert.doesNotMatch(STYLES, /\.card\(\.dark\)/);
  assert.match(STYLES, /\.card\[data-theme-mode="light"\]/);
  assert.match(STYLES, /\.card\[data-theme-mode="dark"\]/);
  assert.match(
    STYLES,
    /--fvc-mobile-bg: var\(--wa-color-neutral-fill-normal, var\(--secondary-background-color\)\);/,
  );
  assert.match(STYLES, /--fvc-mobile-list: #f0f0f0;/);
  assert.match(STYLES, /--fvc-mobile-list: #181818;/);
  assert.match(
    STYLES,
    /\.card\[data-ha-theme="custom"\]\s*\{[\s\S]*?--fvc-mobile-list: var\(--primary-background-color\);[\s\S]*?--fvc-list: var\(--secondary-background-color\);/,
  );
  assert.match(
    STYLES,
    /\.card\[data-ha-theme="custom"\]\[data-ha-dark-primary="derived"\]\s*\{[\s\S]*?--dark-primary-color: color-mix\(in srgb, var\(--primary-color\) 75%, black\);/,
  );
  assert.doesNotMatch(STYLES, /--fvc-(?:mobile-bg|mobile-list|list): color-mix/);
});

test("navigation tabs background uses the adaptive theme token", () => {
  assert.match(
    STYLES,
    /\.card\s*\{[\s\S]*?--fvc-tabs-holder: var\(--secondary-background-color\);/,
  );
  assert.match(
    STYLES,
    /\.card\[data-theme-mode="dark"\]\s*\{[\s\S]*?--fvc-tabs-holder: var\(--primary-background-color\);/,
  );
  assert.match(
    STYLES,
    /--c-bg-tabs-holder:\s*var\(--fvc-tabs-holder\);/,
  );
  assert.match(
    STYLES,
    /\.tabs-holder\{[^}]*background-color:var\(--c-bg-tabs-holder\);/,
  );
});

test("syncVisualStyleToggles updates card classes and host outer styles", () => {
  const toggles = [];
  const card = {
    classList: {
      toggle: (className, value) => toggles.push([className, value]),
    },
  };
  const host = {
    _config: {
      shadows: false,
      borders: true,
      rounded_corners: false,
      outer_shadows: true,
    },
    shadowRoot: {
      querySelector: () => card,
    },
    style: {},
  };
  const controller = new CardStyleContextController(host);
  controller.resolveCardTokenForHost = (target, property) =>
    property === "box-shadow" ? "0 0 2px #000" : "12px";

  controller.syncVisualStyleToggles();

  assert.deepEqual(toggles, [
    ["shadows-off", true],
    ["borders-off", false],
    ["corners-off", true],
    ["mobile-view-outer-border-off", false],
  ]);
  assert.equal(host.style.boxShadow, "0 0 2px #000");
  assert.equal(host.style.borderRadius, "0px");
  assert.match(
    STYLES,
    /--ha-card-border-radius: var\(--fvc-outer-border-radius\);/,
  );
});

test("syncHostOuterStyles preserves its last valid shadow during shell replacement", () => {
  const card = {};
  const host = {
    _config: { outer_shadows: true },
    shadowRoot: {
      querySelector: () => card,
    },
    style: {},
  };
  const controller = new CardStyleContextController(host);
  let resolvedShadow = "0 3px 8px #0004";
  controller.resolveCardTokenForHost = (target, property) =>
    property === "box-shadow" ? resolvedShadow : "12px";

  controller.syncHostOuterStyles();
  resolvedShadow = "none";
  controller.syncHostOuterStyles();

  assert.equal(host.style.boxShadow, "0 3px 8px #0004");

  host._config.outer_shadows = false;
  controller.syncHostOuterStyles();

  assert.equal(host.style.boxShadow, "none");
});

test("syncHostOuterStyles repaints a preserved shadow after final shell layout", () => {
  const card = {};
  let layoutReads = 0;
  const host = {
    _config: { outer_shadows: true },
    shadowRoot: {
      querySelector: () => card,
    },
    style: {},
    get offsetWidth() {
      layoutReads += 1;
      return 640;
    },
  };
  const controller = new CardStyleContextController(host);
  controller.resolveCardTokenForHost = (target, property) =>
    property === "box-shadow" ? "0 3px 8px #0004" : "12px";

  controller.syncHostOuterStyles({ forceRepaint: true });

  assert.equal(layoutReads, 1);
  assert.equal(host.style.boxShadow, "0 3px 8px #0004");
});

test("syncVisualStyleToggles avoids hardcoded host radius fallback", () => {
  const card = {
    classList: {
      toggle: () => {},
    },
  };
  const host = {
    _config: {
      shadows: true,
      borders: true,
      rounded_corners: true,
      outer_shadows: true,
    },
    shadowRoot: {
      querySelector: () => card,
    },
    style: {
      removeProperty: (name) => {
        host._removedProperty = name;
      },
    },
  };
  const controller = new CardStyleContextController(host);
  controller.resolveCardTokenForHost = () => "";

  controller.syncVisualStyleToggles();

  assert.equal(host.style.borderRadius, undefined);
  assert.equal(host._removedProperty, "border-radius");
});

test("applyTightMargins updates parent spacing and sections row gap", () => {
  const cardToggles = [];
  const sectionsStyle = {
    setProperty: (name, value) => cardToggles.push(["set", name, value]),
    removeProperty: (name) => cardToggles.push(["remove", name]),
  };
  const sectionsView = {
    tagName: "HUI-SECTIONS-VIEW",
    style: sectionsStyle,
    shadowRoot: { children: [] },
    parentNode: null,
    host: null,
  };
  const parentElement = {
    style: { height: "", margin: "8px", padding: "6px" },
  };
  const host = {
    _config: { tight_margins: true },
    _parentOrigStyle: { margin: "10px", padding: "12px" },
    _isPreviewContext: () => false,
    shadowRoot: {
      querySelector: () => ({
        classList: {
          toggle: (className, value) =>
            cardToggles.push(["toggle", className, value]),
        },
      }),
    },
    parentElement,
    tagName: "FRIGATE-VIEW-CARD",
    parentNode: sectionsView,
    host: null,
  };
  const controller = new CardStyleContextController(host);
  controller.isPanelView = () => false;

  controller.applyTightMargins();

  assert.equal(parentElement.style.height, "100%");
  assert.equal(parentElement.style.margin, "0");
  assert.equal(parentElement.style.padding, "0");
  assert.deepEqual(cardToggles, [
    ["toggle", "tight-margins", true],
    ["set", "--ha-view-sections-row-gap", "0px"],
  ]);
});

test("tight margins make only phone Mobile View full bleed in Sections View", () => {
  const hostToggles = [];
  const sectionsView = {
    tagName: "HUI-SECTIONS-VIEW",
    style: {
      setProperty: () => {},
      removeProperty: () => {},
    },
    shadowRoot: { children: [] },
    parentNode: null,
    host: null,
  };
  const host = {
    _config: { tight_margins: true },
    _isLikelyPhoneClient: () => true,
    _isMobileViewPageActive: () => true,
    _isPreviewContext: () => false,
    _isCardViewPageActive: () => false,
    classList: {
      toggle: (className, enabled) =>
        hostToggles.push([className, enabled]),
    },
    parentElement: { style: {} },
    parentNode: sectionsView,
    shadowRoot: {
      querySelector: () => ({ classList: { toggle: () => {} } }),
    },
  };
  const controller = new CardStyleContextController(host);
  controller.isPanelView = () => false;

  controller.applyTightMargins();
  host._isMobileViewPageActive = () => false;
  controller.applyTightMargins();

  assert.deepEqual(hostToggles, [
    ["mobile-view-sections-full-bleed", true],
    ["mobile-view-sections-full-bleed", false],
  ]);
});

test("phone Mobile View full bleed uses the inherited Sections gutter", () => {
  assert.match(
    STYLES,
    /:host\(\.mobile-view-sections-full-bleed\)\s*\{[\s\S]*?width:\s*calc\([\s\S]*?--ha-view-sections-column-gap, 8px[\s\S]*?margin-inline:\s*calc\([\s\S]*?--ha-view-sections-column-gap, 8px/,
  );
});

test("resolveCardTokenForHost measures resolved token values", () => {
  const probe = {
    style: {
      cssText: "",
      setProperty: () => {},
    },
    remove: () => {},
  };
  const card = {
    appendChild: (node) => {
      assert.equal(node, probe);
    },
  };
  const controller = new CardStyleContextController({});

  withGlobals(
    {
      document: {
        createElement: () => probe,
      },
      getComputedStyle: () => ({
        getPropertyValue: () => " 24px ",
      }),
    },
    () => {
      assert.equal(
        controller.resolveCardTokenForHost(card, "border-radius", "var(--x)"),
        "24px",
      );
    },
  );
});

test("applyCardStyle resolves percent host height and clears view-height", () => {
  const hostStyleCalls = [];
  const cardStyleCalls = [];
  const card = {
    style: {
      setProperty: (name, value) => cardStyleCalls.push(["set", name, value]),
      removeProperty: (name) => cardStyleCalls.push(["remove", name]),
    },
  };
  const host = {
    _config: {
      stream_height: 50,
      stream_height_unit: "%",
      compact_preview: false,
      theme: "default",
    },
    _isPreviewContext: () => false,
    shadowRoot: {
      querySelector: () => card,
    },
    style: {
      setProperty: (name, value) => hostStyleCalls.push(["set", name, value]),
      removeProperty: (name) => hostStyleCalls.push(["remove", name]),
    },
  };
  const controller = new CardStyleContextController(host);
  controller.applyTightMargins = () => {};
  controller.syncHostOuterStyles = () => {};

  withGlobals(
    {
      document: global.document,
      window: {
        innerHeight: 900,
        visualViewport: null,
      },
      getComputedStyle: () => ({
        getPropertyValue: (name) => {
          if (name === "--ha-card-height") return "400px";
          if (name === "--header-height") return "56px";
          return "";
        },
      }),
    },
    () => {
      controller.applyCardStyle();
    },
  );

  assert.deepEqual(hostStyleCalls, [["set", "--card-host-height", "200px"]]);
  assert.equal(
    cardStyleCalls.some(
      ([action, name]) => action === "remove" && name === "--view-height",
    ),
    true,
  );
});

test("Card View ignores configured height and keeps its parent naturally sized", () => {
  const hostStyleCalls = [];
  const cardStyleCalls = [];
  const parentElement = { style: { height: "100%", margin: "", padding: "" } };
  const card = {
    style: {
      setProperty: (name, value) => cardStyleCalls.push(["set", name, value]),
      removeProperty: (name) => cardStyleCalls.push(["remove", name]),
    },
    classList: { toggle: () => {} },
  };
  const host = {
    _config: {
      stream_height: 100,
      stream_height_unit: "dvh",
      tight_margins: false,
      theme: "default",
    },
    _isPreviewContext: () => false,
    _isCardViewPageActive: () => true,
    _parentOrigStyle: { margin: "", padding: "" },
    parentElement,
    parentNode: null,
    host: null,
    shadowRoot: { querySelector: () => card },
    style: {
      setProperty: (name, value) => hostStyleCalls.push(["set", name, value]),
      removeProperty: (name) => hostStyleCalls.push(["remove", name]),
    },
  };
  const controller = new CardStyleContextController(host);
  controller.syncHostOuterStyles = () => {};

  withGlobals(
    {
      document: global.document,
      window: { innerHeight: 900, visualViewport: null },
      getComputedStyle: () => ({ getPropertyValue: () => "" }),
    },
    () => controller.applyCardStyle(),
  );

  assert.equal(parentElement.style.height, "auto");
  assert.deepEqual(hostStyleCalls, [["remove", "--card-host-height"]]);
  assert.equal(
    cardStyleCalls.some(
      ([action, name]) => action === "remove" && name === "--view-height",
    ),
    true,
  );
});

test("applyCardStyle fits non-tight percent height within wrapper viewport", () => {
  const hostStyleCalls = [];
  const card = {
    style: {
      setProperty: () => {},
      removeProperty: () => {},
    },
  };
  const parentElement = {
    style: {},
    getBoundingClientRect: () => ({ top: 56 }),
  };
  const host = {
    _config: {
      stream_height: 100,
      stream_height_unit: "%",
      compact_preview: false,
      tight_margins: false,
      theme: "default",
    },
    _isPreviewContext: () => false,
    parentElement,
    shadowRoot: {
      querySelector: () => card,
    },
    style: {
      setProperty: (name, value) => hostStyleCalls.push(["set", name, value]),
      removeProperty: (name) => hostStyleCalls.push(["remove", name]),
    },
  };
  const controller = new CardStyleContextController(host);
  controller.applyTightMargins = () => {};
  controller.syncHostOuterStyles = () => {};

  withGlobals(
    {
      document: global.document,
      window: {
        innerHeight: 900,
        visualViewport: null,
      },
      getComputedStyle: (element) => {
        if (element === parentElement) {
          return {
            boxSizing: "border-box",
            paddingTop: "12px",
            paddingBottom: "20px",
            getPropertyValue: () => "",
          };
        }
        return {
          getPropertyValue: (name) => {
            if (name === "--ha-card-height") return "";
            if (name === "--header-height") return "0px";
            return "";
          },
        };
      },
    },
    () => {
      controller.applyCardStyle();
    },
  );

  assert.deepEqual(hostStyleCalls, [["set", "--card-host-height", "812px"]]);
});

test("card height reserves only the bottom navbar's added height", () => {
  const parentElement = {
    getBoundingClientRect: () => ({ top: 56 }),
  };
  const host = {
    _config: { tight_margins: false },
    _isPreviewContext: () => false,
    _isLikelyMobileClient: () => true,
    _haNavbarController: {
      bottomNavbarExtraHeightPx: () => 10,
    },
    parentElement,
  };
  const controller = new CardStyleContextController(host);

  withGlobals(
    {
      document: global.document,
      window: {
        innerHeight: 900,
        visualViewport: null,
      },
      getComputedStyle: global.getComputedStyle,
    },
    () => {
      assert.equal(
        controller.resolvePercentHostHeightPx({
          ratio: 1,
          haCardHeight: "844px",
          headerHeight: "56px",
        }),
        834,
      );
      assert.equal(
        controller.resolvePercentHostHeightPx({
          ratio: 0.5,
          haCardHeight: "844px",
          headerHeight: "56px",
        }),
        417,
      );
      assert.equal(controller.resolveHeightWrapperViewportPx(), 834);
    },
  );

  host._haNavbarController.bottomNavbarExtraHeightPx = () => 0;
  assert.equal(controller.resolveBottomNavbarExtraHeightPx(), 0);
});

test("desktop card height never reserves the mobile bottom-navbar increase", () => {
  const host = {
    _isLikelyMobileClient: () => false,
    _haNavbarController: {
      bottomNavbarExtraHeightPx: () => 10,
    },
  };
  const controller = new CardStyleContextController(host);

  assert.equal(controller.resolveBottomNavbarExtraHeightPx(), 0);
});

test("percent height padding compensation preserves tight margins sizing", () => {
  const parentElement = {};
  const host = {
    _config: { tight_margins: true },
    _isPreviewContext: () => false,
    parentElement,
  };
  const controller = new CardStyleContextController(host);
  let measured = false;

  withGlobals(
    {
      document: global.document,
      window: global.window,
      getComputedStyle: () => {
        measured = true;
        return {};
      },
    },
    () => {
      assert.equal(controller.resolveHeightWrapperPaddingPx(), 0);
    },
  );

  assert.equal(measured, false);
});

test("percent height padding compensation skips content-box wrappers", () => {
  const parentElement = {};
  const host = {
    _config: { tight_margins: false },
    _isPreviewContext: () => false,
    parentElement,
  };
  const controller = new CardStyleContextController(host);

  withGlobals(
    {
      document: global.document,
      window: global.window,
      getComputedStyle: () => ({
        boxSizing: "content-box",
        paddingTop: "12px",
        paddingBottom: "20px",
        getPropertyValue: () => "content-box",
      }),
    },
    () => {
      assert.equal(controller.resolveHeightWrapperPaddingPx(), 0);
    },
  );
});

test("percent height reserves measured sections view bottom padding", () => {
  const sectionsView = {
    tagName: "HUI-SECTIONS-VIEW",
    parentElement: null,
  };
  const sectionsContainer = {
    tagName: "DIV",
    parentElement: null,
    getRootNode: () => ({ host: sectionsView }),
  };
  const innerContainer = {
    tagName: "DIV",
    parentElement: sectionsContainer,
  };
  const parentElement = {
    tagName: "HUI-CARD",
    parentElement: innerContainer,
  };
  const host = {
    _config: { tight_margins: false },
    _isPreviewContext: () => false,
    parentElement,
  };
  const controller = new CardStyleContextController(host);

  withGlobals(
    {
      document: global.document,
      window: global.window,
      getComputedStyle: (element) => ({
        paddingBottom: element === sectionsContainer ? "24px" : "0px",
      }),
    },
    () => {
      assert.equal(
        controller.resolveHeightSectionsBottomPaddingPx(),
        24,
      );
    },
  );
});

test("viewport height fits below the card top with tight margins", () => {
  const parentElement = {
    getBoundingClientRect: () => ({ top: 56 }),
  };
  const host = {
    _config: { tight_margins: true },
    _isPreviewContext: () => false,
    parentElement,
  };
  const controller = new CardStyleContextController(host);

  withGlobals(
    {
      document: global.document,
      window: {
        innerHeight: 1308,
        visualViewport: {
          height: 1308,
          offsetTop: 0,
        },
      },
      getComputedStyle: global.getComputedStyle,
    },
    () => {
      assert.equal(controller.resolveViewportUnitHostHeightPx(1), 1252);
    },
  );
});

test("viewport height reserves non-tight sections bottom padding", () => {
  const sectionsView = {
    tagName: "HUI-SECTIONS-VIEW",
    parentElement: null,
  };
  const sectionsContainer = {
    tagName: "DIV",
    parentElement: null,
    getRootNode: () => ({ host: sectionsView }),
  };
  const innerContainer = {
    tagName: "DIV",
    parentElement: sectionsContainer,
  };
  const parentElement = {
    tagName: "HUI-CARD",
    parentElement: innerContainer,
    getBoundingClientRect: () => ({ top: 80 }),
  };
  const host = {
    _config: { tight_margins: false },
    _isPreviewContext: () => false,
    parentElement,
  };
  const controller = new CardStyleContextController(host);

  withGlobals(
    {
      document: global.document,
      window: {
        innerHeight: 1308,
        visualViewport: {
          height: 1308,
          offsetTop: 0,
        },
      },
      getComputedStyle: (element) => ({
        boxSizing: element === parentElement ? "content-box" : "",
        paddingTop: "0px",
        paddingBottom: element === sectionsContainer ? "24px" : "0px",
        getPropertyValue: () => "",
      }),
    },
    () => {
      assert.equal(controller.resolveViewportUnitHostHeightPx(1), 1204);
      assert.equal(controller.resolveViewportUnitHostHeightPx(0.5), 654);
    },
  );
});

test("applyCardStyle resolves vh and dvh units to the available viewport", () => {
  for (const streamHeightUnit of ["vh", "dvh"]) {
    const hostStyleCalls = [];
    const cardStyleCalls = [];
    const card = {
      style: {
        setProperty: (name, value) => cardStyleCalls.push(["set", name, value]),
        removeProperty: (name) => cardStyleCalls.push(["remove", name]),
      },
    };
    const host = {
      _config: {
        stream_height: 100,
        stream_height_unit: streamHeightUnit,
        tight_margins: true,
        theme: "default",
      },
      _isPreviewContext: () => false,
      parentElement: {
        getBoundingClientRect: () => ({ top: 56 }),
      },
      shadowRoot: {
        querySelector: () => card,
      },
      style: {
        setProperty: (name, value) => hostStyleCalls.push(["set", name, value]),
        removeProperty: (name) => hostStyleCalls.push(["remove", name]),
      },
    };
    const controller = new CardStyleContextController(host);
    controller.applyTightMargins = () => {};
    controller.syncHostOuterStyles = () => {};

    withGlobals(
      {
        document: global.document,
        window: {
          innerHeight: 1308,
          visualViewport: {
            height: 1308,
            offsetTop: 0,
          },
        },
        getComputedStyle: () => ({
          getPropertyValue: () => "",
        }),
      },
      () => {
        controller.applyCardStyle();
      },
    );

    assert.deepEqual(hostStyleCalls, [
      ["set", "--card-host-height", "1252px"],
    ]);
    assert.equal(
      cardStyleCalls.some(
        ([action, name, value]) =>
          action === "set" &&
          name === "--view-height" &&
          value === "1252px",
      ),
      true,
    );
  }
});

test("applyCardStyle applies one custom theme in every selected mode", () => {
  const cardCalls = [];
  const card = {
    style: {
      setProperty: (name, value) => cardCalls.push(["set", name, value]),
      removeProperty: (name) => cardCalls.push(["remove", name]),
    },
  };
  const host = {
    _hass: { themes: { darkMode: false } },
    _config: {
      theme: "custom",
      theme_custom: [
        {
          modes: ["light", "dark"],
          overrides: {
            "--c-bg-main": "#abcdef",
            "--c-bg-primary": "#123456",
            "--c-bg-mobile": "#654321",
          },
        },
      ],
      theme_custom_defaults: {
        light: { "--c-bg-primary": true },
        dark: { "--c-bg-primary": true },
      },
    },
    _isPreviewContext: () => false,
    shadowRoot: {
      querySelector: () => card,
    },
    style: {
      setProperty: () => {},
      removeProperty: () => {},
    },
  };
  const controller = new CardStyleContextController(host);
  controller.applyTightMargins = () => {};
  controller.syncHostOuterStyles = () => {};

  withGlobals(
    {
      document: global.document,
      window: {
        innerHeight: 900,
        visualViewport: null,
      },
      getComputedStyle: () => ({
        getPropertyValue: () => "",
      }),
    },
    () => {
      controller.applyCardStyle();
      host._hass.themes.darkMode = true;
      controller.applyCardStyle();
    },
  );

  assert.equal(
    cardCalls.some(
      ([action, name, value]) =>
        action === "set" && name === "--c-bg-main" && value === "#abcdef",
    ),
    true,
  );
  assert.deepEqual(
    cardCalls
      .filter(
        ([action, name]) => action === "set" && name === "--c-bg-main",
      )
      .map(([, , value]) => value),
    ["#abcdef", "#abcdef"],
  );
  assert.equal(
    cardCalls.some(
      ([action, name, value]) =>
        action === "set" &&
        name === "--c-bg-primary" &&
        value === "#123456",
    ),
    false,
  );
  assert.equal(
    cardCalls.some(
      ([action, name]) => action === "set" && name === "--c-bg-primary",
    ),
    false,
  );
  assert.equal(
    cardCalls.some(
      ([action, name]) => action === "remove" && name === "--c-bg-panel",
    ),
    true,
  );
  assert.equal(
    cardCalls.some(
      ([action, name, value]) =>
        action === "set" &&
        name === "--c-bg-mobile" &&
        value === "#654321",
    ),
    true,
  );

  cardCalls.length = 0;
  host._config.theme_custom[0].modes = ["dark"];
  host._hass.themes.darkMode = false;
  withGlobals(
    {
      document: global.document,
      window: { innerHeight: 900, visualViewport: null },
      getComputedStyle: () => ({ getPropertyValue: () => "" }),
    },
    () => {
      controller.applyCardStyle();
      host._hass.themes.darkMode = true;
      controller.applyCardStyle();
    },
  );
  assert.deepEqual(
    cardCalls
      .filter(
        ([action, name]) => action === "set" && name === "--c-bg-main",
      )
      .map(([, , value]) => value),
    ["#abcdef"],
  );
});
