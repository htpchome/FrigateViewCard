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

const createInlineStyle = (initial = []) => {
  const declarations = new Map(
    initial.map(([name, value, priority = ""]) => [name, { value, priority }]),
  );
  return {
    get length() { return declarations.size; },
    item: (index) => [...declarations.keys()][index] || "",
    getPropertyValue: (name) => declarations.get(name)?.value || "",
    getPropertyPriority: (name) => declarations.get(name)?.priority || "",
    setProperty: (name, value, priority = "") => {
      declarations.set(name, { value, priority });
    },
    removeProperty: (name) => declarations.delete(name),
  };
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

test("cardStateClassNames marks Firefox for compositor-safe styles", () => {
  const controller = new CardStyleContextController({
    _config: {},
    _isPreviewPageActive: () => false,
    _isLikelyMobileClient: () => false,
    _isLikelyPhoneClient: () => false,
    _isFirefox: () => true,
  });

  assert.equal(controller.cardStateClassNames(), "firefox-client");
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

test("Mobile View header overlay class is scoped to its page and toggle", () => {
  const host = {
    _config: { mobile_view_outer_border: true, mobile_view_header_overlay: true },
    _isPreviewPageActive: () => false,
    _isLikelyMobileClient: () => false,
    _isLikelyPhoneClient: () => false,
    _isMobileViewPageActive: () => true,
  };
  const controller = new CardStyleContextController(host);

  assert.equal(controller.cardStateClassNames(), "mobile-view-header-overlay");
  host._isMobileViewPageActive = () => false;
  assert.equal(controller.cardStateClassNames(), "");
  host._isMobileViewPageActive = () => true;
  host._config.mobile_view_header_overlay = false;
  assert.equal(controller.cardStateClassNames(), "");
});

test("embedded popup height bypasses dashboard deductions for Mobile and Single View only", () => {
  const assignedHeights = [];
  const popup = {
    tagName: "DIV",
    classList: { contains: (name) => name === "bubble-pop-up" },
    getBoundingClientRect: () => ({ bottom: 850 }),
  };
  const parentElement = {
    parentElement: popup,
    style: {},
    getBoundingClientRect: () => ({ top: 120, height: 600 }),
  };
  const card = {
    dataset: {},
    classList: { toggle: () => {} },
    querySelector: () => null,
    style: { setProperty: () => {}, removeProperty: () => {} },
  };
  const host = {
    _config: {
      stream_height: 100,
      stream_height_unit: "%",
      tight_margins: false,
      theme: "default",
    },
    _isPreviewContext: () => false,
    _isMobileViewPageActive: () => true,
    _isCardViewPageActive: () => false,
    _isLikelyMobileClient: () => true,
    _singleViewPageController: { isActive: () => false },
    parentElement,
    shadowRoot: { querySelector: () => card },
    style: {
      setProperty: (name, value) => {
        if (name === "--card-host-height") assignedHeights.push(value);
      },
      removeProperty: () => {},
    },
  };
  const controller = new CardStyleContextController(host);
  controller.syncHostOuterStyles = () => {};

  withGlobals(
    {
      document: global.document,
      window: { innerHeight: 900, visualViewport: null },
      getComputedStyle: (element) => ({
        boxSizing: "content-box",
        paddingBottom: element === popup ? "20px" : "0px",
        getPropertyValue: (name) => name === "--header-height" ? "56px" : "",
      }),
    },
    () => {
      assert.equal(controller.resolveEmbeddedPopupHeightPx(), 710);
      controller.applyCardStyle();
      assert.equal(assignedHeights.at(-1), "710px");

      host._isMobileViewPageActive = () => false;
      host._singleViewPageController.isActive = () => true;
      controller.applyCardStyle();
      assert.equal(assignedHeights.at(-1), "710px");

      host._singleViewPageController.isActive = () => false;
      controller.applyCardStyle();
      assert.equal(assignedHeights.at(-1), "780px");
    },
  );
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
  const hostToggles = [];
  const removedHostStyles = [];
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
    classList: {
      toggle: (className, value) => hostToggles.push([className, value]),
    },
    style: {
      removeProperty: (name) => removedHostStyles.push(name),
    },
  };
  const controller = new CardStyleContextController(host);

  controller.syncVisualStyleToggles();

  assert.deepEqual(toggles, [
    ["shadows-off", true],
    ["borders-off", false],
    ["corners-off", true],
    ["mobile-view-outer-border-off", false],
    ["mobile-view-header-overlay", false],
    ["firefox-client", false],
  ]);
  assert.deepEqual(hostToggles, [
    ["outer-shadows-off", false],
    ["outer-corners-off", true],
  ]);
  assert.deepEqual(removedHostStyles, ["box-shadow", "border-radius"]);
  assert.match(
    STYLES,
    /--ha-card-border-radius: var\(--fvc-outer-border-radius\);/,
  );
});

test("host CSS owns outer shadows across page shell replacements", () => {
  const hostToggles = [];
  const removedHostStyles = [];
  const host = {
    _config: { outer_shadows: true, rounded_corners: true },
    _isLikelyPhoneClient: () => false,
    classList: {
      toggle: (className, value) => hostToggles.push([className, value]),
    },
    style: {
      removeProperty: (name) => removedHostStyles.push(name),
    },
  };
  const controller = new CardStyleContextController(host);

  controller.syncHostOuterStyles();
  controller.syncHostOuterStyles();

  assert.deepEqual(hostToggles, [
    ["outer-shadows-off", false],
    ["outer-corners-off", false],
    ["outer-shadows-off", false],
    ["outer-corners-off", false],
  ]);
  assert.deepEqual(removedHostStyles, [
    "box-shadow",
    "border-radius",
    "box-shadow",
    "border-radius",
  ]);
  assert.match(
    STYLES,
    /:host\s*\{[\s\S]*?box-shadow: var\(--fvc-outer-shadow-m\);/,
  );
  assert.match(STYLES, /:host\(\.outer-shadows-off\)\s*\{ box-shadow: none; \}/);
  assert.match(STYLES, /\.card\{[\s\S]*?--ha-card-box-shadow: none;/);
});

test("full-page outer shadows are suppressed on phones but retained on tablets", () => {
  let layoutReads = 0;
  let isPhone = true;
  let page = "preview";
  const shadowStates = [];
  const host = {
    _config: { outer_shadows: true },
    _isLikelyPhoneClient: () => isPhone,
    _isPreviewPageActive: () => page === "preview",
    _isMobileViewPageActive: () => page === "mobile",
    _wideViewPageController: {
      isWideViewPageActive: () => page === "wide",
    },
    classList: {
      toggle: (className, value) => {
        if (className === "outer-shadows-off") shadowStates.push(value);
      },
    },
    style: { removeProperty: () => {} },
    get offsetWidth() {
      layoutReads += 1;
      return 640;
    },
  };
  const controller = new CardStyleContextController(host);

  controller.syncHostOuterStyles();
  page = "wide";
  controller.syncHostOuterStyles();
  page = "mobile";
  controller.syncHostOuterStyles();
  page = "single";
  controller.syncHostOuterStyles();
  page = "mobile";
  isPhone = false;
  controller.syncHostOuterStyles();

  assert.equal(layoutReads, 0);
  assert.deepEqual(shadowStates, [true, true, true, false, false]);
});

test("syncVisualStyleToggles leaves host radius ownership in CSS", () => {
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
    classList: { toggle: () => {} },
    style: {
      removeProperty: (name) => {
        host._removedProperties.push(name);
      },
    },
    _removedProperties: [],
  };
  const controller = new CardStyleContextController(host);

  controller.syncVisualStyleToggles();

  assert.equal(host.style.borderRadius, undefined);
  assert.deepEqual(host._removedProperties, ["box-shadow", "border-radius"]);
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
    _sourceConfig: { grid_options: { rows: 8 } },
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

test("Bubble popup padding follows mobile-device Mobile View owners and restores after the last card releases", () => {
  const popupStyle = createInlineStyle([
    ["padding-top", "18px"],
    ["padding-inline", "12px", "important"],
    ["--bubble-pop-up-extra-bottom-space", "66px"],
    ["overscroll-behavior-y", "contain", "important"],
    ["overflow-y", "auto"],
  ]);
  const popup = {
    classList: { contains: (name) => name === "bubble-pop-up-container" },
    style: popupStyle,
    clientHeight: 600,
    scrollHeight: 600,
  };
  const createController = (mobileDevice = false) => {
    const wrapper = { parentElement: popup, style: { margin: "8px", padding: "8px" } };
    const host = {
      _config: { tight_margins: true },
      _isPreviewContext: () => false,
      _isMobileViewPageActive: () => true,
      _isLikelyMobileClient: () => mobileDevice,
      parentElement: wrapper,
      shadowRoot: { querySelector: () => null },
    };
    return { controller: new CardStyleContextController(host), host, wrapper };
  };
  const first = createController();
  const second = createController(true);

  first.controller.applyTightMargins();
  assert.equal(popupStyle.getPropertyValue("padding-left"), "0");
  second.controller.applyTightMargins();
  assert.equal(popupStyle.getPropertyValue("padding-top"), "18px");
  for (const name of ["padding-right", "padding-left"]) {
    assert.equal(popupStyle.getPropertyValue(name), "4px");
    assert.equal(popupStyle.getPropertyPriority(name), "important");
  }
  assert.equal(popupStyle.getPropertyValue("overscroll-behavior-y"), "none");
  assert.equal(popupStyle.getPropertyPriority("overscroll-behavior-y"), "important");
  second.controller.syncBubblePopupVerticalScroll();
  assert.equal(popupStyle.getPropertyValue("overflow-y"), "hidden");
  popup.scrollHeight = 620;
  second.controller.syncBubblePopupVerticalScroll();
  assert.equal(popupStyle.getPropertyValue("overflow-y"), "auto");
  popup.scrollHeight = 600;
  second.controller.syncBubblePopupVerticalScroll();
  assert.equal(popupStyle.getPropertyValue("overflow-y"), "hidden");
  assert.equal(popupStyle.getPropertyValue("padding-bottom"), "0");
  assert.equal(popupStyle.getPropertyValue("--bubble-pop-up-extra-bottom-space"), "0px");
  assert.equal(first.wrapper.style.padding, "0");

  second.controller.releaseBubblePopupPadding();
  assert.equal(popupStyle.getPropertyValue("padding-bottom"), "0");
  assert.equal(popupStyle.getPropertyValue("padding-right"), "0");
  assert.equal(popupStyle.getPropertyValue("padding-left"), "0");
  assert.equal(popupStyle.getPropertyValue("overscroll-behavior-y"), "contain");
  assert.equal(popupStyle.getPropertyValue("overflow-y"), "auto");
  assert.equal(popupStyle.getPropertyValue("--bubble-pop-up-extra-bottom-space"), "0px");

  first.host._config.tight_margins = false;
  first.controller.applyTightMargins();
  assert.equal(popupStyle.getPropertyValue("padding-top"), "18px");
  assert.equal(popupStyle.getPropertyValue("padding-inline"), "12px");
  assert.equal(popupStyle.getPropertyPriority("padding-inline"), "important");
  assert.equal(popupStyle.getPropertyValue("padding-bottom"), "");
  assert.equal(popupStyle.getPropertyValue("--bubble-pop-up-extra-bottom-space"), "66px");
  assert.equal(popupStyle.getPropertyValue("overscroll-behavior-y"), "contain");
  assert.equal(popupStyle.getPropertyPriority("overscroll-behavior-y"), "important");
  assert.equal(popupStyle.getPropertyValue("overflow-y"), "auto");
});

test("Masonry View keeps the Home Assistant card wrapper naturally sized", () => {
  const masonryView = {
    tagName: "HUI-MASONRY-VIEW",
    parentNode: null,
  };
  const parentElement = {
    tagName: "DIV",
    parentNode: masonryView,
    style: { height: "100%", margin: "8px", padding: "6px" },
  };
  const host = {
    _sourceConfig: {},
    _config: { tight_margins: false },
    _parentOrigStyle: { margin: "8px", padding: "6px" },
    _isPreviewContext: () => false,
    _isCardViewPageActive: () => false,
    parentElement,
    parentNode: parentElement,
    classList: { toggle: () => {} },
    shadowRoot: {
      querySelector: () => ({ classList: { toggle: () => {} } }),
    },
  };
  const controller = new CardStyleContextController(host);

  assert.equal(controller.isInMasonryView(), true);
  controller.applyTightMargins();
  assert.equal(parentElement.style.height, "auto");

  parentElement.style.height = "100%";
  controller.syncViewportMinimumParentHeight(false);
  assert.equal(parentElement.style.height, "auto");
});

test("tight margins keep phone Mobile View full bleed out of embedded popups", () => {
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
  const popup = {
    classList: { contains: (name) => name === "bubble-pop-up-container" },
    parentElement: sectionsView,
  };
  host.parentElement.parentElement = popup;
  controller.applyTightMargins();
  host.parentElement.parentElement = null;
  controller.applyTightMargins();
  host._isMobileViewPageActive = () => false;
  controller.applyTightMargins();

  assert.deepEqual(hostToggles, [
    ["mobile-view-sections-full-bleed", true],
    ["mobile-view-sections-full-bleed", false],
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

test("Panel View applies page-specific width-to-height ratios", () => {
  let page = "single";
  let cardViewVideoOnly = false;
  const panelView = { tagName: "HUI-PANEL-VIEW", parentNode: null };
  const host = {
    parentNode: panelView,
    _isPreviewPageActive: () => page === "preview",
    _isMobileViewPageActive: () => page === "mobile",
    _isCardViewPageActive: () => page === "card",
    _singleViewPageController: { isActive: () => page === "single" },
    _wideViewPageController: {
      isWideViewPageActive: () => page === "wide",
    },
    _cardViewPageController: {
      usesOverlayPresentation: () => cardViewVideoOnly,
    },
  };
  const controller = new CardStyleContextController(host);

  assert.equal(controller.isPanelView(), true);
  assert.equal(controller.resolvePanelViewAspectRatio(), 1.2);
  page = "mobile";
  assert.equal(controller.resolvePanelViewAspectRatio(), 1.2);
  page = "card";
  assert.equal(controller.resolvePanelViewAspectRatio(), 1.4);
  cardViewVideoOnly = true;
  assert.equal(controller.resolvePanelViewAspectRatio(), 1.75);
  page = "wide";
  assert.equal(controller.resolvePanelViewAspectRatio(), null);
  page = "preview";
  assert.equal(controller.resolvePanelViewAspectRatio(), null);
});

test("Sidebar View applies the Panel page-specific width-to-height ratios", () => {
  let page = "single";
  let cardViewVideoOnly = false;
  const sidebarView = {
    tagName: "HUI-SIDEBAR-VIEW",
    parentNode: null,
  };
  const host = {
    parentNode: sidebarView,
    _isPreviewPageActive: () => page === "preview",
    _isMobileViewPageActive: () => page === "mobile",
    _isCardViewPageActive: () => page === "card",
    _singleViewPageController: { isActive: () => page === "single" },
    _wideViewPageController: {
      isWideViewPageActive: () => page === "wide",
    },
    _cardViewPageController: {
      usesOverlayPresentation: () => cardViewVideoOnly,
    },
  };
  const controller = new CardStyleContextController(host);

  assert.equal(controller.isPanelView(), false);
  assert.equal(controller.isSidebarView(), true);
  assert.equal(controller.resolvePanelViewAspectRatio(), 1.2);
  page = "mobile";
  assert.equal(controller.resolvePanelViewAspectRatio(), 1.2);
  page = "card";
  assert.equal(controller.resolvePanelViewAspectRatio(), 1.4);
  cardViewVideoOnly = true;
  assert.equal(controller.resolvePanelViewAspectRatio(), 1.75);
  page = "wide";
  assert.equal(controller.resolvePanelViewAspectRatio(), null);
  page = "preview";
  assert.equal(controller.resolvePanelViewAspectRatio(), null);
});

test("Panel View ratio caps and centers the card from its applied height", () => {
  const styleValues = new Map([["--card-host-height", "600px"]]);
  const styleCalls = [];
  const classCalls = [];
  const host = {
    classList: {
      toggle: (name, enabled) => classCalls.push([name, enabled]),
    },
    style: {
      getPropertyValue: (name) => styleValues.get(name) || "",
      setProperty: (name, value) => {
        styleValues.set(name, value);
        styleCalls.push(["set", name, value]);
      },
      removeProperty: (name) => {
        styleValues.delete(name);
        styleCalls.push(["remove", name]);
      },
    },
  };
  const controller = new CardStyleContextController(host);
  let ratio = 1.2;
  controller.resolvePanelViewAspectRatio = () => ratio;
  controller.resolveHeightWrapperViewportPx = () => 900;

  controller.syncPanelViewAspectConstraint(null);
  assert.equal(styleValues.get("--fvc-panel-view-max-width"), "720px");
  assert.equal(styleValues.get("--fvc-panel-view-card-height"), "600px");

  styleValues.delete("--card-host-height");
  ratio = 1.75;
  controller.syncPanelViewAspectConstraint(null);
  assert.equal(styleValues.get("--fvc-panel-view-max-width"), "1575px");
  assert.equal(styleValues.get("--fvc-panel-view-card-height"), "900px");

  styleValues.delete("--card-host-height");
  controller.resolveHeightWrapperViewportPx = () => null;
  controller.syncPanelViewAspectConstraint(null);
  assert.equal(styleValues.has("--fvc-panel-view-max-width"), false);
  assert.equal(styleValues.has("--fvc-panel-view-card-height"), false);

  controller.resolveHeightWrapperViewportPx = () => 900;
  controller.syncPanelViewAspectConstraint(null);
  ratio = null;
  controller.syncPanelViewAspectConstraint(null);
  assert.deepEqual(classCalls.filter(([name]) => name === "panel-view-aspect-constrained"), [
    ["panel-view-aspect-constrained", true],
    ["panel-view-aspect-constrained", true],
    ["panel-view-aspect-constrained", false],
    ["panel-view-aspect-constrained", true],
    ["panel-view-aspect-constrained", false],
  ]);
  assert.equal(
    classCalls
      .filter(([name]) => name === "card-view-panel-height-capped")
      .every(([, enabled]) => enabled === false),
    true,
  );
  assert.equal(
    styleCalls.some(
      ([action, name]) =>
        action === "remove" && name === "--fvc-panel-view-max-width",
    ),
    true,
  );
});

test("Panel View ratio uses requested height before minimum-height expansion", () => {
  const styleValues = new Map([
    ["--card-host-height", "1492px"],
  ]);
  const host = {
    classList: { toggle: () => {} },
    style: {
      getPropertyValue: (name) => styleValues.get(name) || "",
      setProperty: (name, value) => styleValues.set(name, value),
      removeProperty: (name) => styleValues.delete(name),
    },
  };
  const controller = new CardStyleContextController(host);
  controller.resolvePanelViewAspectRatio = () => 1.2;
  controller.resolveHeightWrapperViewportPx = () => 1_000;

  controller.syncPanelViewAspectConstraint(null, {
    requestedHeightPx: 944,
  });

  assert.equal(
    styleValues.get("--fvc-panel-view-max-width"),
    "1133px",
  );
  assert.equal(
    styleValues.get("--fvc-panel-view-card-height"),
    "944px",
  );
});

test("Panel View derives the card height from a narrower parent", () => {
  const styleValues = new Map();
  const host = {
    parentElement: {
      getBoundingClientRect: () => ({ width: 560 }),
    },
    classList: { toggle: () => {} },
    style: {
      getPropertyValue: (name) => styleValues.get(name) || "",
      setProperty: (name, value) => styleValues.set(name, value),
      removeProperty: (name) => styleValues.delete(name),
    },
  };
  const controller = new CardStyleContextController(host);
  controller.resolvePanelViewAspectRatio = () => 1.4;
  controller.resolveHeightWrapperViewportPx = () => 900;

  controller.syncPanelViewAspectConstraint(null);

  assert.equal(styleValues.get("--fvc-panel-view-max-width"), "1260px");
  assert.equal(styleValues.get("--fvc-panel-view-card-height"), "400px");
});

test("Panel Card View caps its natural height without capping Sidebar", () => {
  const styleValues = new Map();
  const classes = new Map();
  const host = {
    parentElement: {
      getBoundingClientRect: () => ({ width: 560 }),
    },
    _isCardViewPageActive: () => true,
    _cardViewPageController: {
      usesOverlayPresentation: () => false,
    },
    classList: { toggle: (name, enabled) => classes.set(name, enabled) },
    style: {
      getPropertyValue: (name) => styleValues.get(name) || "",
      setProperty: (name, value) => styleValues.set(name, value),
      removeProperty: (name) => styleValues.delete(name),
    },
  };
  const controller = new CardStyleContextController(host);
  controller.isPanelView = () => true;
  controller.resolvePanelViewAspectRatio = () => 1.4;
  controller.resolveHeightWrapperViewportPx = () => 900;
  controller.resolvePanelCardViewNaturalHeightPx = () => 620;

  controller.syncPanelViewAspectConstraint(null);

  assert.equal(styleValues.get("--fvc-panel-view-max-width"), "1260px");
  assert.equal(styleValues.get("--fvc-panel-view-card-height"), "620px");
  assert.equal(classes.get("card-view-panel-height-capped"), true);

  controller.isPanelView = () => false;
  controller.syncPanelViewAspectConstraint(null);

  assert.equal(styleValues.get("--fvc-panel-view-card-height"), "400px");
  assert.equal(classes.get("card-view-panel-height-capped"), false);
});

test("Panel Card View derives its natural height from video and chrome", () => {
  const elements = new Map([
    [".card-view-camera-row", { clientHeight: 44 }],
    [".card-view-activity", { clientHeight: 150 }],
    ['[data-fvc-region="footer"]', { clientHeight: 48 }],
    [
      "#eng-wrap",
      {
        style: {
          getPropertyValue: () => "4 / 3",
        },
      },
    ],
  ]);
  const controller = new CardStyleContextController({});
  const height = controller.resolvePanelCardViewNaturalHeightPx(
    { querySelector: (selector) => elements.get(selector) || null },
    560,
  );

  assert.equal(height, 670);
  assert.equal(controller.parseAspectRatio("16 / 9"), 16 / 9);
  assert.equal(controller.parseAspectRatio("auto"), null);
});

test("Panel View width constraint is centered and never exceeds its parent", () => {
  assert.match(
    STYLES,
    /:host\(\.panel-view-aspect-constrained\)\s*\{[\s\S]*?width:\s*min\(100%, var\(--fvc-panel-view-max-width\)\) !important;[\s\S]*?max-width:\s*var\(--fvc-panel-view-max-width\) !important;[\s\S]*?margin-inline:\s*auto !important;/,
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

test("fixed Home Assistant grid rows constrain the card to its assigned cell", () => {
  const hostStyleCalls = [];
  const cardStyleCalls = [];
  const sectionsView = {
    tagName: "HUI-SECTIONS-VIEW",
    parentNode: null,
  };
  const parentElement = {
    tagName: "HUI-CARD",
    parentNode: sectionsView,
    style: { height: "auto" },
  };
  const card = {
    style: {
      setProperty: (name, value) => cardStyleCalls.push(["set", name, value]),
      removeProperty: (name) => cardStyleCalls.push(["remove", name]),
    },
  };
  const host = {
    _sourceConfig: { grid_options: { rows: 8 } },
    _config: {
      stream_height: 100,
      stream_height_unit: "dvh",
      theme: "default",
    },
    _isPreviewContext: () => false,
    _isCardViewPageActive: () => true,
    parentElement,
    parentNode: parentElement,
    shadowRoot: { querySelector: () => card },
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
      window: { innerHeight: 900, visualViewport: null },
      getComputedStyle: () => ({ getPropertyValue: () => "" }),
    },
    () => controller.applyCardStyle(),
  );

  assert.deepEqual(hostStyleCalls, [
    ["set", "--card-host-height", "100%"],
  ]);
  assert.equal(
    cardStyleCalls.some(
      ([action, name, value]) =>
        action === "set" && name === "--view-height" && value === "100%",
    ),
    true,
  );
  assert.equal(parentElement.style.height, "100%");
});

test("Home Assistant Auto height remains the opt-out from grid constraints", () => {
  for (const tagName of ["HUI-SECTIONS-VIEW", "HUI-SIDEBAR-VIEW"]) {
    const view = { tagName, parentNode: null };
    const host = {
      _sourceConfig: { grid_options: { rows: 8 } },
      _isPreviewContext: () => false,
      parentNode: view,
    };
    const controller = new CardStyleContextController(host);

    assert.equal(
      controller.shouldConstrainToHomeAssistantGridHeight(),
      true,
    );
    host._sourceConfig.grid_options.rows = "auto";
    assert.equal(
      controller.shouldConstrainToHomeAssistantGridHeight(),
      false,
    );
    delete host._sourceConfig.grid_options.rows;
    assert.equal(controller.resolveHomeAssistantGridHeightMode(), "auto");
  }
});

test("omitted HA grid rows use intrinsic wrapper sizing instead of collapsing", () => {
  const hostStyleCalls = [];
  const cardStyleCalls = [];
  const sectionsView = {
    tagName: "HUI-SECTIONS-VIEW",
    parentNode: null,
  };
  const parentElement = {
    tagName: "HUI-CARD",
    parentNode: sectionsView,
    style: { height: "100%" },
    getBoundingClientRect: () => ({ top: 56 }),
  };
  const card = {
    querySelector: () => null,
    style: {
      setProperty: (name, value) => cardStyleCalls.push(["set", name, value]),
      removeProperty: (name) => cardStyleCalls.push(["remove", name]),
    },
  };
  const host = {
    _sourceConfig: { grid_options: {} },
    _config: {
      stream_height: 100,
      stream_height_unit: "%",
      tight_margins: true,
      theme: "default",
    },
    _isPreviewContext: () => false,
    _isCardViewPageActive: () => false,
    parentElement,
    parentNode: parentElement,
    shadowRoot: { querySelector: () => card },
    style: {
      setProperty: (name, value) => hostStyleCalls.push(["set", name, value]),
      removeProperty: (name) => hostStyleCalls.push(["remove", name]),
    },
  };
  const controller = new CardStyleContextController(host);
  controller.applyTightMargins = () => {
    parentElement.style.height = "auto";
  };
  controller.syncHostOuterStyles = () => {};

  withGlobals(
    {
      document: global.document,
      window: { innerHeight: 900, visualViewport: null },
      getComputedStyle: () => ({
        getPropertyValue: (name) => {
          if (name === "--ha-card-height") return "0px";
          if (name === "--header-height") return "56px";
          return "";
        },
      }),
    },
    () => controller.applyCardStyle(),
  );

  assert.deepEqual(hostStyleCalls, [
    ["set", "--card-host-height", "844px"],
  ]);
  assert.equal(
    cardStyleCalls.some(
      ([action, name]) => action === "remove" && name === "--view-height",
    ),
    true,
  );
  assert.equal(parentElement.style.height, "auto");
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
      getComputedStyle: () => {
        throw new Error("Card View must not force a computed-style read");
      },
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

test("top-navbar mobile height does not reserve the bottom safe area", () => {
  const parentElement = {
    getBoundingClientRect: () => ({ top: 103 }),
  };
  const host = {
    _config: { tight_margins: true },
    _isPreviewContext: () => false,
    _isLikelyMobileClient: () => true,
    _haNavbarController: {
      bottomNavbarExtraHeightPx: () => 0,
      homeAssistantViewContentHeightPx: () => 741,
    },
    parentElement,
  };
  const controller = new CardStyleContextController(host);

  withGlobals(
    {
      document: global.document,
      window: {
        innerHeight: 844,
        visualViewport: { height: 844, offsetTop: 0 },
      },
      getComputedStyle: global.getComputedStyle,
    },
    () => {
      assert.equal(
        controller.resolvePercentHostHeightPx({
          ratio: 1,
          haCardHeight: "",
          headerHeight: "56px",
        }),
        741,
      );
      assert.equal(controller.resolveViewportUnitHostHeightPx(1), 741);
    },
  );
});

test("bottom mobile navbar cap includes its intentional added height once", () => {
  const host = {
    _config: { tight_margins: true },
    _isPreviewContext: () => false,
    _isLikelyMobileClient: () => true,
    _haNavbarController: {
      bottomNavbarExtraHeightPx: () => 10,
      homeAssistantViewContentHeightPx: () => 722.5,
    },
  };
  const controller = new CardStyleContextController(host);

  withGlobals(
    {
      document: global.document,
      window: {
        innerHeight: 844,
        visualViewport: { height: 844, offsetTop: 0 },
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
        722.5,
      );
    },
  );
});

test("desktop card height ignores the mobile Lovelace content cap", () => {
  const host = {
    _config: { tight_margins: true },
    _isPreviewContext: () => false,
    _isLikelyMobileClient: () => false,
    _haNavbarController: {
      bottomNavbarExtraHeightPx: () => 10,
      homeAssistantViewContentHeightPx: () => 707,
    },
    parentElement: {
      getBoundingClientRect: () => ({ top: 56 }),
    },
  };
  const controller = new CardStyleContextController(host);

  withGlobals(
    {
      document: global.document,
      window: {
        innerHeight: 900,
        visualViewport: { height: 900, offsetTop: 0 },
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
        844,
      );
    },
  );
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

test("configured percent and viewport heights preserve Mobile View controls and browse space", () => {
  const hostStyleCalls = [];
  const cardStyleCalls = [];
  const measuredElement = (height) => ({
    getBoundingClientRect: () => ({ height }),
  });
  const mobileElements = new Map([
    ["#mobile-top", measuredElement(260)],
    [".mobile-video-controls-container", measuredElement(44)],
    [".mobile-tab-container", measuredElement(50)],
    ['[data-fvc-region="footer"]', measuredElement(46)],
  ]);
  const mobileLayout = {
    querySelector: (selector) => mobileElements.get(selector) || null,
  };
  const card = {
    querySelector: (selector) =>
      selector === ".layout--mobile-view" ? mobileLayout : null,
    style: {
      setProperty: (name, value) => cardStyleCalls.push(["set", name, value]),
      removeProperty: (name) => cardStyleCalls.push(["remove", name]),
    },
  };
  const parentElement = {
    style: { height: "100%" },
    getBoundingClientRect: () => ({ top: 56 }),
  };
  const host = {
    _config: {
      stream_height: 100,
      stream_height_unit: "dvh",
      tight_margins: true,
      theme: "default",
    },
    _isPreviewContext: () => false,
    _isCardViewPageActive: () => false,
    parentElement,
    shadowRoot: { querySelector: () => card },
    style: {
      setProperty: (name, value) => hostStyleCalls.push(["set", name, value]),
      removeProperty: (name) => hostStyleCalls.push(["remove", name]),
    },
  };
  const controller = new CardStyleContextController(host);
  controller.applyTightMargins = () => {
    parentElement.style.height = "100%";
  };
  controller.syncHostOuterStyles = () => {};

  withGlobals(
    {
      document: global.document,
      window: {
        innerHeight: 500,
        visualViewport: { height: 500, offsetTop: 0 },
      },
      getComputedStyle: () => ({ getPropertyValue: () => "" }),
    },
    () => controller.applyCardStyle(),
  );

  assert.deepEqual(hostStyleCalls, [
    ["set", "--card-host-height", "652px"],
  ]);
  assert.equal(
    cardStyleCalls.some(
      ([action, name, value]) =>
        action === "set" && name === "--view-height" && value === "652px",
    ),
    true,
  );
  assert.equal(parentElement.style.height, "auto");

  withGlobals(
    {
      document: global.document,
      window: {
        innerHeight: 900,
        visualViewport: { height: 900, offsetTop: 0 },
      },
      getComputedStyle: () => ({ getPropertyValue: () => "" }),
    },
    () => controller.applyCardStyle(),
  );

  assert.deepEqual(hostStyleCalls.at(-1), [
    "set",
    "--card-host-height",
    "844px",
  ]);
  assert.equal(parentElement.style.height, "100%");

  host._config.stream_height_unit = "%";
  withGlobals(
    {
      document: global.document,
      window: {
        innerHeight: 500,
        visualViewport: { height: 500, offsetTop: 0 },
      },
      getComputedStyle: () => ({ getPropertyValue: () => "" }),
    },
    () => controller.applyCardStyle(),
  );

  assert.deepEqual(hostStyleCalls.at(-1), [
    "set",
    "--card-host-height",
    "652px",
  ]);
  assert.equal(
    cardStyleCalls.some(
      ([action, name]) => action === "remove" && name === "--view-height",
    ),
    true,
  );
  assert.equal(parentElement.style.height, "auto");
});

test("minimum usable height overrides compact percent and dvh heights", () => {
  const hostStyleCalls = [];
  const measuredElement = (height) => ({
    getBoundingClientRect: () => ({ height }),
  });
  const mobileElements = new Map([
    ["#mobile-top", measuredElement(260)],
    [".mobile-video-controls-container", measuredElement(44)],
    [".mobile-tab-container", measuredElement(50)],
    ['[data-fvc-region="footer"]', measuredElement(46)],
  ]);
  const mobileLayout = {
    querySelector: (selector) => mobileElements.get(selector) || null,
  };
  const card = {
    querySelector: (selector) =>
      selector === ".layout--mobile-view" ? mobileLayout : null,
    style: { setProperty: () => {}, removeProperty: () => {} },
  };
  const parentElement = {
    style: { height: "100%" },
    getBoundingClientRect: () => ({ top: 56 }),
  };
  const host = {
    _config: {
      stream_height: 90,
      stream_height_unit: "dvh",
      tight_margins: true,
      theme: "default",
    },
    _isPreviewContext: () => false,
    _isCardViewPageActive: () => false,
    parentElement,
    shadowRoot: { querySelector: () => card },
    style: {
      setProperty: (name, value) => hostStyleCalls.push(["set", name, value]),
      removeProperty: () => {},
    },
  };
  const controller = new CardStyleContextController(host);
  controller.applyTightMargins = () => {
    parentElement.style.height = "100%";
  };
  controller.syncHostOuterStyles = () => {};

  withGlobals(
    {
      document: global.document,
      window: {
        innerHeight: 500,
        visualViewport: { height: 500, offsetTop: 0 },
      },
      getComputedStyle: () => ({ getPropertyValue: () => "" }),
    },
    () => controller.applyCardStyle(),
  );

  assert.deepEqual(hostStyleCalls, [
    ["set", "--card-host-height", "652px"],
  ]);
  assert.equal(parentElement.style.height, "auto");

  host._config.stream_height_unit = "%";
  withGlobals(
    {
      document: global.document,
      window: {
        innerHeight: 500,
        visualViewport: { height: 500, offsetTop: 0 },
      },
      getComputedStyle: () => ({ getPropertyValue: () => "" }),
    },
    () => controller.applyCardStyle(),
  );

  assert.deepEqual(hostStyleCalls.at(-1), [
    "set",
    "--card-host-height",
    "652px",
  ]);
  assert.equal(parentElement.style.height, "auto");
});

test("Panel Single and Mobile Views keep full height for an internal scroller", () => {
  let page = "single";
  const host = {
    _config: {
      stream_height: 100,
      stream_height_unit: "%",
    },
    _isMobileViewPageActive: () => page === "mobile",
    _singleViewPageController: {
      isActive: () => page === "single",
    },
    _isLikelyMobileClient: () => false,
  };
  const controller = new CardStyleContextController(host);
  controller.isPanelView = () => true;
  controller.resolveMinimumUsableHostHeightPx = () => 652;

  assert.deepEqual(
    controller.resolveUsableHostHeight({
      card: {},
      resolvedHeightPx: 444,
    }),
    { heightPx: 444, expanded: false },
  );

  page = "mobile";
  assert.deepEqual(
    controller.resolveUsableHostHeight({
      card: {},
      resolvedHeightPx: 444,
    }),
    { heightPx: 444, expanded: false },
  );

  page = "wide";
  assert.deepEqual(
    controller.resolveUsableHostHeight({
      card: {},
      resolvedHeightPx: 444,
    }),
    { heightPx: 652, expanded: true },
  );

  page = "single";
  host._config.stream_height = 50;
  assert.deepEqual(
    controller.resolveUsableHostHeight({
      card: {},
      resolvedHeightPx: 222,
    }),
    { heightPx: 652, expanded: true },
  );

  host._config.stream_height = 100;
  host._isLikelyMobileClient = () => true;
  assert.deepEqual(
    controller.resolveUsableHostHeight({
      card: {},
      resolvedHeightPx: 444,
    }),
    { heightPx: 652, expanded: true },
  );
});

test("Sidebar Single and Mobile Views keep full height for an internal scroller", () => {
  let page = "single";
  const host = {
    _config: {
      stream_height: 100,
      stream_height_unit: "%",
    },
    _isMobileViewPageActive: () => page === "mobile",
    _singleViewPageController: {
      isActive: () => page === "single",
    },
    _isLikelyMobileClient: () => false,
  };
  const controller = new CardStyleContextController(host);
  controller.isPanelView = () => false;
  controller.isSidebarView = () => true;
  controller.resolveMinimumUsableHostHeightPx = () => 652;

  assert.deepEqual(
    controller.resolveUsableHostHeight({
      card: {},
      resolvedHeightPx: 444,
    }),
    { heightPx: 444, expanded: false },
  );

  page = "mobile";
  assert.deepEqual(
    controller.resolveUsableHostHeight({
      card: {},
      resolvedHeightPx: 444,
    }),
    { heightPx: 444, expanded: false },
  );

  page = "wide";
  assert.deepEqual(
    controller.resolveUsableHostHeight({
      card: {},
      resolvedHeightPx: 444,
    }),
    { heightPx: 652, expanded: true },
  );

  page = "single";
  host._config.stream_height = 50;
  assert.deepEqual(
    controller.resolveUsableHostHeight({
      card: {},
      resolvedHeightPx: 222,
    }),
    { heightPx: 652, expanded: true },
  );

  host._config.stream_height = 100;
  host._isLikelyMobileClient = () => true;
  assert.deepEqual(
    controller.resolveUsableHostHeight({
      card: {},
      resolvedHeightPx: 444,
    }),
    { heightPx: 652, expanded: true },
  );
});

test("minimum usable height follows the rendered Single and Wide View chrome", () => {
  const measuredElement = (height) => ({
    getBoundingClientRect: () => ({ height }),
  });
  const makeLayout = (entries) => {
    const elements = new Map(entries);
    return { querySelector: (selector) => elements.get(selector) || null };
  };
  const controller = new CardStyleContextController({});

  const singleLayout = makeLayout([
    [".view-top", measuredElement(360)],
    [".tabs-holder", measuredElement(50)],
    ['[data-fvc-region="footer"]', measuredElement(46)],
  ]);
  const singleCard = {
    querySelector: (selector) =>
      selector === ".layout--single-view" ? singleLayout : null,
  };
  assert.equal(controller.resolveMinimumUsableHostHeightPx(singleCard), 708);

  const leftColumn = makeLayout([
    [".live-stage", measuredElement(330)],
    [".info-row", measuredElement(42)],
    [".cam-switcher", measuredElement(40)],
    [".tabs-holder", measuredElement(50)],
    [".wide-companion-header", measuredElement(32)],
  ]);
  const rightColumn = makeLayout([
    [".tabs-holder", measuredElement(50)],
  ]);
  const wideLayout = makeLayout([
    [".col-left--wide-view", leftColumn],
    [".col-right--wide-view", rightColumn],
    ['[data-fvc-region="footer"]', measuredElement(46)],
  ]);
  const wideCard = {
    querySelector: (selector) =>
      selector === ".layout--wide-view" ? wideLayout : null,
  };
  assert.equal(controller.resolveMinimumUsableHostHeightPx(wideCard), 548);
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
