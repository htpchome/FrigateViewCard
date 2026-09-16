import { expect, test } from "@playwright/test";
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";

const bundlePaths = new Map([
  ["/frigate-view-card.js", "dist/frigate-view-card.js"],
  ["/frigate-view-card-editor.js", "dist/frigate-view-card-editor.js"],
  ["/frigate-view-card-hls-1.5.17.js", "dist/frigate-view-card-hls-1.5.17.js"],
]);

let server;
let baseUrl;

test.beforeAll(async () => {
  server = createServer(async (request, response) => {
    try {
      const pathname = new URL(request.url ?? "/", "http://localhost").pathname;
      if (pathname === "/") {
        response.writeHead(200, { "content-type": "text/html; charset=utf-8" });
        response.end("<!doctype html><html><body></body></html>");
        return;
      }

      const bundlePath = bundlePaths.get(pathname);
      if (!bundlePath) {
        response.writeHead(404);
        response.end("Not found");
        return;
      }

      const source = await readFile(bundlePath);
      response.writeHead(200, {
        "cache-control": "no-store",
        "content-type": "text/javascript; charset=utf-8",
      });
      response.end(source);
    } catch (error) {
      response.writeHead(500);
      response.end(error instanceof Error ? error.message : String(error));
    }
  });

  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });

  const address = server.address();
  if (!address || typeof address === "string") {
    throw new Error("Could not determine the browser-test server address.");
  }
  baseUrl = `http://127.0.0.1:${address.port}`;
});

test.afterAll(async () => {
  if (!server) return;
  await new Promise((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });
});

test("bottom HA navbar styling does not trap Bubble popup behind its backdrop", async ({ page }) => {
  await page.goto(baseUrl);
  const navbarSource = await readFile("src/integrations/home-assistant/navbar.ctrl.js", "utf8");
  const navbarStyles = /const BOTTOM_NAVBAR_STYLE_TEXT = `([\s\S]*?)`;/.exec(navbarSource)?.[1];
  expect(navbarStyles).toBeTruthy();
  const state = await page.evaluate((styleText) => {
    const style = document.createElement("style");
    style.textContent = `
      #view { position:relative; width:390px; height:600px; }
      .bubble-popup { position:absolute; top:100px; left:40px; width:280px; height:200px; z-index:5; }
      .bubble-backdrop { position:fixed; inset:0; z-index:4; }
      .header { position:fixed; bottom:0; height:56px; }
      ${styleText}
    `;
    const view = document.createElement("div");
    view.id = "view";
    const popup = document.createElement("div");
    popup.className = "bubble-popup";
    view.append(popup);
    const backdrop = document.createElement("div");
    backdrop.className = "bubble-backdrop";
    const header = document.createElement("div");
    header.className = "header";
    document.body.append(style, view, backdrop, header);
    const popupOnTop = document.elementFromPoint(100, 150) === popup;
    const viewZIndex = getComputedStyle(view).zIndex;
    view.style.zIndex = "1";
    const backdropWinsWhenViewIsTrapped =
      document.elementFromPoint(100, 150) === backdrop;
    return { popupOnTop, viewZIndex, backdropWinsWhenViewIsTrapped };
  }, navbarStyles);

  expect(state).toEqual({
    popupOnTop: true,
    viewZIndex: "auto",
    backdropWinsWhenViewIsTrapped: true,
  });
});

test("loads the runtime and editor modules", async ({ page }) => {
  const consoleMessages = [];
  const pageErrors = [];
  page.on("console", (message) => {
    consoleMessages.push({ type: message.type(), text: message.text() });
  });
  page.on("pageerror", (error) => pageErrors.push(error.message));

  await page.goto(baseUrl);
  const registrations = await page.evaluate(async () => {
    await import("/frigate-view-card.js");
    await import("/frigate-view-card-editor.js");
    return {
      card: Boolean(customElements.get("frigate-view-card")),
      editor: Boolean(customElements.get("frigate-view-card-editor")),
      cardDisplayName: window.customCards.find(
        ({ type }) => type === "frigate-view-card",
      )?.name,
    };
  });

  expect(registrations.card).toBe(true);
  expect(registrations.editor).toBe(true);
  expect(registrations.cardDisplayName).toBeTruthy();
  expect(pageErrors).toEqual([]);
  expect(
    consoleMessages.filter(({ type }) => ["warning", "error"].includes(type)),
  ).toEqual([]);
  expect(
    consoleMessages.filter(({ text }) =>
      text.includes(registrations.cardDisplayName.toUpperCase()),
    ),
  ).toHaveLength(1);
});

test("loads the generated HLS browser bundle", async ({ page }) => {
  const pageErrors = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));

  await page.goto(baseUrl);
  await page.addScriptTag({ url: `${baseUrl}/frigate-view-card-hls-1.5.17.js` });

  expect(await page.evaluate(() => typeof window.Hls)).toBe("function");
  expect(pageErrors).toEqual([]);
});

test("runtime cards report page-specific Masonry sizes despite the compact picker stub", async ({
  page,
}) => {
  await page.goto(baseUrl);

  const result = await page.evaluate(async () => {
    await import("/frigate-view-card.js");
    const Card = customElements.get("frigate-view-card");
    const stub = Card.getStubConfig();

    const runtimeCard = document.createElement("frigate-view-card");
    runtimeCard.setConfig(stub);

    const picker = document.createElement("hui-card-picker");
    const pickerCard = document.createElement("frigate-view-card");
    pickerCard.setConfig(stub);
    picker.append(pickerCard);

    const editorPreview = document.createElement("hui-card-preview");
    const editorCard = document.createElement("frigate-view-card");
    editorCard.setConfig(stub);
    editorPreview.append(editorCard);

    const cardView = (viewMode) => {
      const card = document.createElement("frigate-view-card");
      card.setConfig({
        ...stub,
        card_view_page_enabled: true,
        landing_page: "card-view",
        card_view_view_mode: viewMode,
      });
      return card.getCardSize();
    };

    return {
      compactPreview: stub.compact_preview,
      runtime: runtimeCard.getCardSize(),
      picker: pickerCard.getCardSize(),
      editor: editorCard.getCardSize(),
      cardViewVideoOnly: cardView("video-only"),
      cardViewPanelOpen: cardView("bottom-panel-open"),
      cardViewPanelClosed: cardView("bottom-panel-closed"),
    };
  });

  expect(result).toEqual({
    compactPreview: true,
    runtime: 12,
    picker: 2,
    editor: 3,
    cardViewVideoOnly: 6,
    cardViewPanelOpen: 8,
    cardViewPanelClosed: 7,
  });
});

test("Panel view centers page-specific aspect width caps", async ({ page }) => {
  await page.setViewportSize({ width: 1_900, height: 1_000 });
  await page.goto(baseUrl);

  const result = await page.evaluate(async () => {
    await import("/frigate-view-card.js");
    document.body.style.margin = "0";

    const panel = document.createElement("hui-panel-view");
    panel.style.display = "block";
    panel.style.width = "100vw";
    const wrapper = document.createElement("div");
    wrapper.style.width = "100%";
    panel.append(wrapper);
    document.body.append(panel);

    const card = document.createElement("frigate-view-card");
    wrapper.append(card);
    card.setConfig({
      cameras: [{ entity: "camera.front", name: "Front" }],
      stream_height: 100,
      stream_height_unit: "%",
      preview_page_enabled: true,
      wide_view_page_enabled: true,
      card_view_page_enabled: true,
    });
    card._pageId = "single-view";
    card._renderShell();

    const sample = (pageId, cardViewMode = "bottom-panel-open") => {
      card._pageId = pageId;
      card._config.card_view_view_mode = cardViewMode;
      card._applyCardStyle();
      const rect = card.getBoundingClientRect();
      return {
        constrained: card.classList.contains(
          "panel-view-aspect-constrained",
        ),
        maxWidth: card.style.getPropertyValue(
          "--fvc-panel-view-max-width",
        ),
        width: Math.round(rect.width),
        left: Math.round(rect.left),
        right: Math.round(window.innerWidth - rect.right),
      };
    };

    return {
      single: sample("single-view"),
      mobile: sample("mobile-view"),
      card: sample("card-view"),
      cardVideoOnly: sample("card-view", "video-only"),
      wide: sample("wide-view"),
      preview: sample("preview"),
    };
  });

  for (const key of ["single", "mobile", "card", "cardVideoOnly"]) {
    expect(result[key].constrained).toBe(true);
    expect(result[key].left).toBe(result[key].right);
    expect(result[key].maxWidth).toBe(`${result[key].width}px`);
  }
  expect(result.single.width).toBe(1_133);
  expect(result.mobile.width).toBe(1_133);
  expect(result.card.width).toBe(1_400);
  expect(result.cardVideoOnly.width).toBe(1_750);

  for (const key of ["wide", "preview"]) {
    expect(result[key]).toEqual({
      constrained: false,
      maxWidth: "",
      width: 1_900,
      left: 0,
      right: 0,
    });
  }
});

test("Panel Single and Mobile Views keep their footer inside the viewport", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1_900, height: 1_000 });
  await page.goto(baseUrl);

  const result = await page.evaluate(async () => {
    await import("/frigate-view-card.js");
    document.body.style.margin = "0";

    const panel = document.createElement("hui-panel-view");
    panel.style.display = "block";
    panel.style.width = "100vw";
    const wrapper = document.createElement("div");
    wrapper.style.width = "100%";
    panel.append(wrapper);
    document.body.append(panel);

    const card = document.createElement("frigate-view-card");
    wrapper.append(card);
    card.setConfig({
      cameras: [{ entity: "camera.front", name: "Front" }],
      stream_height: 100,
      stream_height_unit: "%",
      mobile_view_page_enabled: true,
    });

    const sample = async (pageId) => {
      card._pageId = pageId;
      card._renderShell();
      card._applyCardStyle();
      await new Promise((resolve) => requestAnimationFrame(resolve));
      card._applyCardStyle();

      const hostRect = card.getBoundingClientRect();
      const footerRect = card.shadowRoot
        .querySelector('[data-fvc-region="footer"]')
        .getBoundingClientRect();
      const browse = card.shadowRoot.querySelector('[data-fvc-region="browse"]');
      return {
        configuredHeight: card.style.getPropertyValue("--card-host-height"),
        hostBottom: Math.round(hostRect.bottom),
        footerBottom: Math.round(footerRect.bottom),
        footerVisible: footerRect.height > 0,
        browseHeight: Math.round(browse.getBoundingClientRect().height),
        browseOverflowY: getComputedStyle(browse).overflowY,
        wrapperHeight: wrapper.style.height,
      };
    };

    return {
      single: await sample("single-view"),
      mobile: await sample("mobile-view"),
    };
  });

  for (const view of [result.single, result.mobile]) {
    expect(view.configuredHeight).toBe("944px");
    expect(view.hostBottom).toBeLessThanOrEqual(944);
    expect(view.footerBottom).toBeLessThanOrEqual(view.hostBottom);
    expect(view.footerVisible).toBe(true);
    expect(view.browseHeight).toBeGreaterThan(0);
    expect(view.browseOverflowY).toBe("auto");
    expect(view.wrapperHeight).toBe("100%");
  }
});

test("Mobile overlay header and popup height remain scoped to embedded views", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(baseUrl);

  const state = await page.evaluate(async () => {
    await import("/frigate-view-card.js");
    document.body.style.margin = "0";
    const popup = document.createElement("div");
    popup.setAttribute("role", "dialog");
    Object.assign(popup.style, {
      position: "fixed",
      top: "20px",
      left: "10px",
      width: "370px",
      height: "700px",
      padding: "60px 10px 20px",
      boxSizing: "border-box",
      overflow: "hidden",
    });
    const wrapper = document.createElement("div");
    wrapper.style.height = "100%";
    popup.append(wrapper);
    document.body.append(popup);

    const card = document.createElement("frigate-view-card");
    wrapper.append(card);
    card.setConfig({
      cameras: [{ entity: "camera.front", name: "Front" }],
      stream_height: 100,
      stream_height_unit: "%",
      mobile_view_page_enabled: true,
      mobile_view_header_overlay: true,
    });
    card._pageId = "mobile-view";
    card._renderShell();
    card._mobileViewPageController.renderCamSwitcher();
    card._applyCardStyle();

    const root = card.shadowRoot;
    const cardRoot = root.querySelector("#card");
    const header = root.querySelector("#cam-switcher");
    const stage = root.querySelector("#live-stage");
    const back = root.querySelector(".mobile-cam-picker__back-slot");
    const picker = root.querySelector(".mobile-cam-picker");
    const source = root.querySelector(".mobile-cam-picker__stream");
    const liveTile = root.querySelector(".mobile-cam-picker__live-tile");
    cardRoot.classList.remove("card-view-overlays-visible");
    await new Promise((resolve) => {
      const deadline = performance.now() + 3_000;
      const waitForHiddenControls = () => {
        const hidden = [back, picker, source].every(
          (element) => getComputedStyle(element).visibility === "hidden",
        );
        if (hidden || performance.now() >= deadline) {
          resolve();
        } else {
          requestAnimationFrame(waitForHiddenControls);
        }
      };
      waitForHiddenControls();
    });
    const before = {
      popupHeight: card.style.getPropertyValue("--card-host-height"),
      footerFits:
        root.querySelector('[data-fvc-region="footer"]').getBoundingClientRect().bottom <=
        popup.getBoundingClientRect().bottom - 20,
      headerSharesLiveInteraction:
        card._liveOverlayControlsController?._surface === root.querySelector("#mobile-top"),
      rowPosition: getComputedStyle(header).position,
      videoAtCardTop:
        Math.abs(stage.getBoundingClientRect().top - card.getBoundingClientRect().top) < 2,
      back: getComputedStyle(back).visibility,
      picker: getComputedStyle(picker).visibility,
      source: getComputedStyle(source).visibility,
      liveTileVisible: getComputedStyle(liveTile).display !== "none" &&
        getComputedStyle(liveTile).visibility === "visible",
    };
    cardRoot.classList.add("card-view-overlays-visible");
    const after = {
      back: getComputedStyle(back).visibility,
      picker: getComputedStyle(picker).visibility,
      source: getComputedStyle(source).visibility,
      liveTileVisible: getComputedStyle(liveTile).display !== "none" &&
        getComputedStyle(liveTile).visibility === "visible",
    };

    card._pageId = "single-view";
    card._renderShell();
    card._applyCardStyle();
    return {
      before,
      after,
      singleHeight: card.style.getPropertyValue("--card-host-height"),
      singleFooterFits:
        card.shadowRoot.querySelector('[data-fvc-region="footer"]').getBoundingClientRect().bottom <=
        popup.getBoundingClientRect().bottom - 20,
    };
  });

  expect(state).toEqual({
    before: {
      popupHeight: "620px",
      footerFits: true,
      headerSharesLiveInteraction: true,
      rowPosition: "absolute",
      videoAtCardTop: true,
      back: "hidden",
      picker: "hidden",
      source: "hidden",
      liveTileVisible: true,
    },
    after: {
      back: "visible",
      picker: "visible",
      source: "visible",
      liveTileVisible: true,
    },
    singleHeight: "620px",
    singleFooterFits: true,
  });
});

test("Mobile overlay header follows route changes without replacing the card or live media", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(baseUrl);

  const state = await page.evaluate(async () => {
    await import("/frigate-view-card.js");
    const card = document.createElement("frigate-view-card");
    document.body.append(card);
    card.setConfig({
      cameras: [{ entity: "camera.front", name: "Front" }],
      mobile_view_page_enabled: true,
      mobile_view_header_overlay: true,
    });
    card._pageId = "single-view";
    card._renderShell();

    const root = card.shadowRoot;
    const cardRoot = root.querySelector("#card");
    const live = root.querySelector("#eng-wrap");
    const initialOverlay = cardRoot.classList.contains("mobile-view-header-overlay");

    card._pageId = "mobile-view";
    card._renderShellPreserveLive();
    const entered = {
      sameCard: root.querySelector("#card") === cardRoot,
      sameLive: root.querySelector("#eng-wrap") === live,
      overlay: cardRoot.classList.contains("mobile-view-header-overlay"),
      headerPosition: getComputedStyle(root.querySelector("#cam-switcher")).position,
    };

    card._pageId = "single-view";
    card._renderShellPreserveLive();
    return {
      initialOverlay,
      entered,
      leftOverlay: cardRoot.classList.contains("mobile-view-header-overlay"),
    };
  });

  expect(state).toEqual({
    initialOverlay: false,
    entered: {
      sameCard: true,
      sameLive: true,
      overlay: true,
      headerPosition: "absolute",
    },
    leftOverlay: false,
  });
});

test("Tight Margins keeps Bubble top padding and gives mobile-device Mobile View 4px sides", async ({
  page,
}) => {
  await page.goto(baseUrl);
  const state = await page.evaluate(async () => {
    await import("/frigate-view-card.js");
    const sections = document.createElement("hui-sections-view");
    sections.style.cssText = "display:block;width:390px";
    const popup = document.createElement("div");
    popup.className = "bubble-pop-up-container";
    popup.style.cssText = "width:390px;box-sizing:border-box;overflow-x:auto";
    popup.style.setProperty("padding", "14px 18px 22px 26px", "important");
    popup.style.setProperty("overscroll-behavior-y", "contain", "important");
    popup.style.setProperty(
      "--bubble-pop-up-extra-bottom-space",
      "max(0px, calc(84px - 18px))",
      "important",
    );
    const wrapper = document.createElement("div");
    const spacer = document.createElement("div");
    spacer.style.height = "var(--bubble-pop-up-extra-bottom-space)";
    popup.attachShadow({ mode: "open" }).append(wrapper, spacer);
    const card = document.createElement("frigate-view-card");
    card._isLikelyMobileClient = () => true;
    card._isLikelyPhoneClient = () => true;
    const config = { cameras: [{ entity: "camera.front" }], tight_margins: true };
    card.setConfig(config);
    wrapper.append(card);
    sections.append(popup);
    document.body.append(sections);
    card._applyTightMargins();

    const spacing = () => {
      const style = getComputedStyle(popup);
      return {
        padding: [style.paddingTop, style.paddingRight, style.paddingBottom, style.paddingLeft],
        extraBottom: getComputedStyle(spacer).height,
        overscrollY: style.overscrollBehaviorY,
      };
    };
    card._pageId = "single-view";
    card._renderShell();
    const single = spacing();
    card._pageId = "mobile-view";
    card._renderShell();
    const mobile = spacing();
    const cardRect = card.getBoundingClientRect();
    const popupRect = popup.getBoundingClientRect();
    const mobileFitsPopup =
      !card.classList.contains("mobile-view-sections-full-bleed") &&
      cardRect.left >= popupRect.left + 3 &&
      cardRect.right <= popupRect.right - 3 &&
      popup.scrollWidth <= popup.clientWidth;
    card._pageId = "single-view";
    card._renderShell();
    const singleAgain = spacing();
    card._pageId = "mobile-view";
    card._renderShell();
    card._isLikelyMobileClient = () => false;
    card._applyTightMargins();
    const mobileNonPhone = spacing();
    card.setConfig({ ...config, tight_margins: false });
    card._applyTightMargins();
    const disabled = spacing();
    card.setConfig(config);
    card._applyTightMargins();
    card.remove();
    return { single, mobile, mobileFitsPopup, singleAgain, mobileNonPhone, disabled, disconnected: spacing() };
  });

  expect(state).toEqual({
    single: { padding: ["14px", "0px", "0px", "0px"], extraBottom: "0px", overscrollY: "contain" },
    mobile: { padding: ["14px", "4px", "0px", "4px"], extraBottom: "0px", overscrollY: "none" },
    mobileFitsPopup: true,
    singleAgain: { padding: ["14px", "0px", "0px", "0px"], extraBottom: "0px", overscrollY: "contain" },
    mobileNonPhone: { padding: ["14px", "0px", "0px", "0px"], extraBottom: "0px", overscrollY: "contain" },
    disabled: { padding: ["14px", "18px", "22px", "26px"], extraBottom: "66px", overscrollY: "contain" },
    disconnected: { padding: ["14px", "18px", "22px", "26px"], extraBottom: "66px", overscrollY: "contain" },
  });
});

test("Bubble outer vertical scroll locks only when phone Mobile View fits", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(baseUrl);
  const state = await page.evaluate(async () => {
    await import("/frigate-view-card.js");
    const popup = document.createElement("div");
    popup.className = "bubble-pop-up-container";
    popup.style.cssText = "width:390px;height:700px;box-sizing:border-box;overflow-y:auto;padding:14px 12px 22px";
    const wrapper = document.createElement("div");
    const shadow = popup.attachShadow({ mode: "open" });
    shadow.append(wrapper);
    document.body.append(popup);
    const card = document.createElement("frigate-view-card");
    card._isLikelyMobileClient = () => true;
    card._isLikelyPhoneClient = () => true;
    card.setConfig({
      cameras: [{ entity: "camera.front" }],
      tight_margins: true,
      stream_height: 100,
      stream_height_unit: "%",
    });
    wrapper.append(card);
    card._pageId = "mobile-view";
    card._renderShell();
    card._applyCardStyle();
    const fitting = {
      overflowY: getComputedStyle(popup).overflowY,
      extraHeight: popup.scrollHeight - popup.clientHeight,
      browseOverflowY: getComputedStyle(card.shadowRoot.querySelector(".browse")).overflowY,
    };

    const extra = document.createElement("div");
    extra.style.height = "40px";
    shadow.append(extra);
    card._applyCardStyle();
    const withExtraContent = getComputedStyle(popup).overflowY;
    extra.remove();
    card._pageId = "single-view";
    card._renderShell();
    card._applyCardStyle();
    const singleView = getComputedStyle(popup).overflowY;
    card.remove();
    const disconnected = getComputedStyle(popup).overflowY;
    return { fitting, withExtraContent, singleView, disconnected };
  });

  expect(state.fitting.overflowY).toBe("hidden");
  expect(state.fitting.extraHeight).toBeLessThanOrEqual(1);
  expect(state.fitting.browseOverflowY).toBe("auto");
  expect(state.withExtraContent).toBe("auto");
  expect(state.singleView).toBe("auto");
  expect(state.disconnected).toBe("auto");
});

test("a dashboard card's return-to-top chip stays beneath an external popup", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(baseUrl);

  const layers = await page.evaluate(async () => {
    await import("/frigate-view-card.js");
    document.body.style.margin = "0";
    const card = document.createElement("frigate-view-card");
    card.setConfig({ cameras: [{ entity: "camera.front" }] });
    document.body.append(card);
    card._pageId = "mobile-view";
    card._renderShell();
    card.style.setProperty("--card-host-height", "700px");

    const slot = card.shadowRoot.querySelector(".browse-return-top-slot");
    const chip = card.shadowRoot.querySelector("#browse-return-top");
    slot.style.cssText = "position:fixed;top:300px;left:120px;width:120px";
    chip.hidden = false;
    const rect = chip.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    const clickableWithoutPopup =
      card.shadowRoot.elementFromPoint(x, y)?.closest("#browse-return-top") === chip;

    const backdrop = document.createElement("div");
    backdrop.style.cssText = "position:fixed;inset:0;z-index:4;background:rgba(0,0,0,.3)";
    document.body.append(backdrop);
    return {
      slotZIndex: getComputedStyle(slot).zIndex,
      clickableWithoutPopup,
      backdropAboveChip: document.elementFromPoint(x, y) === backdrop,
    };
  });

  expect(layers).toEqual({
    slotZIndex: "3",
    clickableWithoutPopup: true,
    backdropAboveChip: true,
  });
});

test("Panel Card View naturally sizes and caps an open bottom panel", async ({
  page,
}) => {
  await page.setViewportSize({ width: 640, height: 768 });
  await page.goto(baseUrl);

  await page.evaluate(async () => {
    await import("/frigate-view-card.js");
    document.body.style.margin = "0";

    const panel = document.createElement("hui-panel-view");
    panel.style.display = "block";
    panel.style.width = "100vw";
    const wrapper = document.createElement("div");
    wrapper.style.width = "100%";
    wrapper.style.position = "relative";
    wrapper.style.top = "28px";
    panel.append(wrapper);
    document.body.append(panel);

    const card = document.createElement("frigate-view-card");
    wrapper.append(card);
    card.setConfig({
      cameras: [{ entity: "camera.front", name: "Front" }],
      stream_height: 100,
      stream_height_unit: "%",
      card_view_page_enabled: true,
      card_view_view_mode: "bottom-panel-open",
    });
    card._pageId = "card-view";
    card._renderShell();
    card._cardViewPageController.syncDrawerState();
    card._applyCardStyle();
    await new Promise((resolve) => requestAnimationFrame(resolve));
    card._applyCardStyle();

  });

  const sample = () => page.evaluate(() => {
    const card = document.querySelector("frigate-view-card");
    card._applyCardStyle();
    const hostRect = card.getBoundingClientRect();
    const stageRect = card.shadowRoot
      .querySelector(".card-view-live-stage")
      .getBoundingClientRect();
    const drawerRect = card.shadowRoot
      .querySelector("[data-card-view-drawer]")
      .getBoundingClientRect();
    const footerRect = card.shadowRoot
      .querySelector('[data-fvc-region="footer"]')
      .getBoundingClientRect();
    return {
      constrainedHeight: card.style.getPropertyValue(
        "--fvc-panel-view-card-height",
      ),
      openClass: card.classList.contains("card-view-bottom-panel-open"),
      hostHeight: Math.round(hostRect.height),
      hostWidth: Math.round(hostRect.width),
      hostBottom: Math.round(hostRect.bottom),
      stageHeight: Math.round(stageRect.height),
      stageWidth: Math.round(stageRect.width),
      drawerHeight: Math.round(drawerRect.height),
      footerBottom: Math.round(footerRect.bottom),
    };
  });

  const roomy = await sample();
  expect(roomy.constrainedHeight).toBe(`${roomy.hostHeight}px`);
  expect(roomy.openClass).toBe(true);
  expect(roomy.hostHeight).toBeLessThan(740);
  expect(roomy.hostWidth).toBeLessThanOrEqual(640);
  expect(roomy.hostBottom).toBeLessThan(768);
  expect(roomy.stageWidth / roomy.stageHeight).toBeCloseTo(16 / 9, 1);
  expect(roomy.drawerHeight).toBeGreaterThan(0);
  expect(Math.abs(roomy.footerBottom - roomy.hostBottom)).toBeLessThanOrEqual(1);

  await page.setViewportSize({ width: 640, height: 500 });
  await page.evaluate(async () => {
    await new Promise((resolve) => requestAnimationFrame(resolve));
    document.querySelector("frigate-view-card")._applyCardStyle();
    await new Promise((resolve) => requestAnimationFrame(resolve));
  });

  const cramped = await sample();
  expect(cramped.constrainedHeight).toBe("472px");
  expect(cramped.hostHeight).toBe(472);
  expect(cramped.hostBottom).toBeLessThanOrEqual(500);
  expect(cramped.stageHeight).toBeLessThan(roomy.stageHeight);
  expect(cramped.stageHeight).toBeGreaterThan(0);
  expect(cramped.drawerHeight).toBeGreaterThan(0);
  expect(Math.abs(cramped.footerBottom - cramped.hostBottom)).toBeLessThanOrEqual(1);
});

test("Card View controls stay below an external dialog while its popup stays above them", async ({
  page,
}) => {
  await page.setViewportSize({ width: 900, height: 700 });
  await page.goto(baseUrl);

  const layers = await page.evaluate(async () => {
    await import("/frigate-view-card.js");
    document.body.style.margin = "0";

    const card = document.createElement("frigate-view-card");
    document.body.append(card);
    card.setConfig({
      cameras: [{ entity: "camera.front", name: "Front" }],
      card_view_page_enabled: true,
      card_view_view_mode: "bottom-panel-open",
    });
    card._pageId = "card-view";
    card._renderShell();
    card._cardViewPageController.syncDrawerState();
    card.style.width = "540px";
    card.style.height = "600px";

    const camera = card.shadowRoot.querySelector(".card-view-camera-row");
    const drawer = card.shadowRoot.querySelector(".card-view-activity");
    const pointAt = (element) => {
      const rect = element.getBoundingClientRect();
      return [rect.left + rect.width / 2, rect.top + rect.height / 2];
    };
    const cameraPoint = pointAt(camera);
    const drawerPoint = pointAt(drawer);

    const externalDialog = document.createElement("div");
    externalDialog.style.cssText =
      "position:fixed;inset:0;z-index:5;background:rgba(0,0,0,.3)";
    document.body.append(externalDialog);
    const aboveExternalDialog = [cameraPoint, drawerPoint].map(
      ([x, y]) => document.elementFromPoint(x, y) === externalDialog,
    );

    externalDialog.remove();
    const popup = card.shadowRoot.querySelector("#myPopup");
    popup.style.transition = "none";
    popup.style.top = "0";
    popup.classList.add("is-open");
    const aboveOwnControls = [cameraPoint, drawerPoint].map(([x, y]) =>
      card.shadowRoot.elementFromPoint(x, y)?.closest("#myPopup") === popup,
    );

    return { aboveExternalDialog, aboveOwnControls };
  });

  expect(layers.aboveExternalDialog).toEqual([true, true]);
  expect(layers.aboveOwnControls).toEqual([true, true]);
});

test("Sidebar Single and Mobile Views stay ratio-capped within a short viewport", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1_500, height: 876 });
  await page.goto(baseUrl);

  const result = await page.evaluate(async () => {
    await import("/frigate-view-card.js");
    document.body.style.margin = "0";

    const sidebar = document.createElement("hui-sidebar-view");
    sidebar.style.display = "block";
    sidebar.style.width = "100vw";
    const wrapper = document.createElement("div");
    wrapper.style.width = "100%";
    sidebar.append(wrapper);
    document.body.append(sidebar);

    const card = document.createElement("frigate-view-card");
    wrapper.append(card);
    card.setConfig({
      cameras: [{ entity: "camera.front", name: "Front" }],
      stream_height: 100,
      stream_height_unit: "%",
      mobile_view_page_enabled: true,
    });

    const sample = async (pageId) => {
      card._pageId = pageId;
      card._renderShell();
      card._applyCardStyle();
      await new Promise((resolve) => requestAnimationFrame(resolve));
      card._applyCardStyle();

      const hostRect = card.getBoundingClientRect();
      const footerRect = card.shadowRoot
        .querySelector('[data-fvc-region="footer"]')
        .getBoundingClientRect();
      const browse = card.shadowRoot.querySelector('[data-fvc-region="browse"]');
      return {
        configuredHeight: card.style.getPropertyValue("--card-host-height"),
        maxWidth: card.style.getPropertyValue("--fvc-panel-view-max-width"),
        hostWidth: Math.round(hostRect.width),
        hostBottom: Math.round(hostRect.bottom),
        footerBottom: Math.round(footerRect.bottom),
        footerVisible: footerRect.height > 0,
        browseHeight: Math.round(browse.getBoundingClientRect().height),
        browseOverflowY: getComputedStyle(browse).overflowY,
        wrapperHeight: wrapper.style.height,
      };
    };

    return {
      single: await sample("single-view"),
      mobile: await sample("mobile-view"),
    };
  });

  for (const view of [result.single, result.mobile]) {
    expect(view.configuredHeight).toBe("820px");
    expect(view.maxWidth).toBe("984px");
    expect(view.hostWidth).toBe(984);
    expect(view.hostBottom).toBeLessThanOrEqual(820);
    expect(view.footerBottom).toBeLessThanOrEqual(view.hostBottom);
    expect(view.footerVisible).toBe(true);
    expect(view.browseHeight).toBeGreaterThan(0);
    expect(view.browseOverflowY).toBe("auto");
    expect(view.wrapperHeight).toBe("auto");
  }
});

test("Panel and Sidebar 50% heights preserve the minimum browse region", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1_500, height: 876 });
  await page.goto(baseUrl);

  const result = await page.evaluate(async () => {
    await import("/frigate-view-card.js");
    document.body.style.margin = "0";

    const measure = async (viewTagName) => {
      const view = document.createElement(viewTagName);
      view.style.display = "block";
      view.style.width = "100vw";
      const wrapper = document.createElement("div");
      wrapper.style.width = "100%";
      view.append(wrapper);
      document.body.append(view);

      const card = document.createElement("frigate-view-card");
      wrapper.append(card);
      card.setConfig({
        cameras: [{ entity: "camera.front", name: "Front" }],
        stream_height: 50,
        stream_height_unit: "%",
      });
      card._pageId = "single-view";
      card._renderShell();
      card._applyCardStyle();
      await new Promise((resolve) => requestAnimationFrame(resolve));
      card._applyCardStyle();

      const hostRect = card.getBoundingClientRect();
      const browseRect = card.shadowRoot
        .querySelector('[data-fvc-region="browse"]')
        .getBoundingClientRect();
      const footerRect = card.shadowRoot
        .querySelector('[data-fvc-region="footer"]')
        .getBoundingClientRect();
      const measurement = {
        configuredHeight: card.style.getPropertyValue("--card-host-height"),
        maxWidth: card.style.getPropertyValue("--fvc-panel-view-max-width"),
        hostHeight: Math.round(hostRect.height),
        browseHeight: Math.round(browseRect.height),
        footerInsideHost: footerRect.bottom <= hostRect.bottom,
        wrapperHeight: wrapper.style.height,
      };
      view.remove();
      return measurement;
    };

    return {
      panel: await measure("hui-panel-view"),
      sidebar: await measure("hui-sidebar-view"),
    };
  });

  for (const view of [result.panel, result.sidebar]) {
    expect(view.configuredHeight).not.toBe("410px");
    expect(view.maxWidth).toBe("492px");
    expect(view.hostHeight).toBeGreaterThan(410);
    expect(view.browseHeight).toBeGreaterThanOrEqual(244);
    expect(view.footerInsideHost).toBe(true);
    expect(view.wrapperHeight).toBe("auto");
  }
});

test("single-camera Preview keeps the same tile width as a two-camera Preview", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1_200, height: 900 });
  await page.goto(baseUrl);

  const result = await page.evaluate(async () => {
    await import("/frigate-view-card.js");
    document.body.style.margin = "0";

    const measure = async (cameraCount) => {
      const wrapper = document.createElement("div");
      wrapper.style.width = "1000px";
      const card = document.createElement("frigate-view-card");
      wrapper.append(card);
      document.body.append(wrapper);
      card.setConfig({
        cameras: Array.from({ length: cameraCount }, (_, index) => ({
          entity: `camera.camera_${index + 1}`,
          name: `Camera ${index + 1}`,
        })),
        preview_page_enabled: true,
      });
      card._pageId = "preview";
      card._renderShell();
      card._previewPageController.renderPreviewPage();
      await new Promise((resolve) => requestAnimationFrame(resolve));

      const grid = card.shadowRoot.querySelector("#preview-grid");
      const camera = grid.querySelector("[data-preview-camidx]");
      const emptySlot = grid.querySelector(".preview-grid-empty-slot");
      const measurements = {
        gridWidth: Math.round(grid.getBoundingClientRect().width),
        cameraWidth: Math.round(camera.getBoundingClientRect().width),
        emptySlotWidth: emptySlot
          ? Math.round(emptySlot.getBoundingClientRect().width)
          : 0,
        hasEmptySlot: Boolean(emptySlot),
      };
      wrapper.remove();
      return measurements;
    };

    return {
      single: await measure(1),
      pair: await measure(2),
    };
  });

  expect(result.single.hasEmptySlot).toBe(true);
  expect(result.pair.hasEmptySlot).toBe(false);
  expect(result.single.cameraWidth).toBe(result.pair.cameraWidth);
  expect(result.single.emptySlotWidth).toBe(result.single.cameraWidth);
  expect(result.single.cameraWidth).toBeLessThan(result.single.gridWidth * 0.6);
});

test("cached browse rows expand in append-only batches across sticky days", async ({
  page,
}) => {
  await page.goto(baseUrl);
  const result = await page.evaluate(async () => {
    await import("/frigate-view-card.js");
    const card = document.createElement("frigate-view-card");
    document.body.append(card);
    card.setConfig({
      cameras: [{ entity: "camera.front", name: "Front" }],
    });
    card._pageId = "single-view";
    card._renderShell();
    card._tab = "clips";

    const today = Date.UTC(2026, 8, 9, 12) / 1000;
    const events = Array.from({ length: 31 }, (_, index) => ({
      id: `event-${index}`,
      start_time: index < 18 ? today - index : today - 86_400 - index,
    }));
    card._browseFilterController.filtered = () => events;
    card._eventCardHTML = (event) =>
      `<article class="list-item" data-ev="${event.id}">${event.id}</article>`;

    const controller =
      card._singleViewPageController._browseRenderController;
    controller.renderList();
    const list = card._pageShellRegionElement("browse", "#list");
    const initialRows = list.querySelectorAll(".list-item").length;
    for (let frame = 0; frame < 8; frame += 1) {
      await new Promise((resolve) => requestAnimationFrame(resolve));
    }

    return {
      initialRows,
      finalRows: list.querySelectorAll(".list-item").length,
      sections: [...list.querySelectorAll(".list-day-sec")].map(
        (section) => ({
          dayKey: section.dataset.dayKey,
          firstLabel: section
            .querySelector(".list-day-label")
            ?.classList.contains("list-day-label-first"),
        }),
      ),
    };
  });

  expect(result.initialRows).toBe(6);
  expect(result.finalRows).toBe(31);
  expect(result.sections).toHaveLength(2);
  expect(result.sections[0].firstLabel).toBe(true);
  expect(result.sections[1].firstLabel).toBe(false);
  expect(result.sections[0].dayKey).not.toBe(result.sections[1].dayKey);
});

test("page routes replace only their layout while preserving live and popup shells", async ({
  page,
}) => {
  const pageErrors = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));

  await page.goto(baseUrl);
  const result = await page.evaluate(async () => {
    await import("/frigate-view-card.js");
    const card = document.createElement("frigate-view-card");
    document.body.append(card);
    card.setConfig({
      cameras: [{ entity: "camera.front", name: "Front" }],
      wide_view_page_enabled: true,
      card_view_page_enabled: true,
    });
    card._pageId = "single-view";
    card._renderShell();

    const root = card.shadowRoot;
    const outer = {
      style: root.querySelector("style"),
      card: root.querySelector("#card"),
      toast: root.querySelector("#toast"),
      popup: root.querySelector("#myPopup"),
      live: root.querySelector("#eng-wrap"),
      engine: root.querySelector("#engine"),
      popupDrag: card._popupLifecycleController._dragController,
    };
    let previousLayout = root.querySelector("#layout");
    const routeResults = [];

    for (const [pageId, layoutClass] of [
      ["wide-view", "layout--wide-view"],
      ["card-view", "layout--card-view"],
    ]) {
      card._pageId = pageId;
      card._renderShellPreserveLive();
      const nextLayout = root.querySelector("#layout");
      routeResults.push({
        pageId,
        layoutChanged: nextLayout !== previousLayout,
        hasExpectedLayout: nextLayout.classList.contains(layoutClass),
        stylePreserved: root.querySelector("style") === outer.style,
        cardPreserved: root.querySelector("#card") === outer.card,
        toastPreserved: root.querySelector("#toast") === outer.toast,
        popupPreserved: root.querySelector("#myPopup") === outer.popup,
        popupBindingPreserved:
          card._popupLifecycleController._dragController === outer.popupDrag,
        livePreserved: root.querySelector("#eng-wrap") === outer.live,
        enginePreserved: root.querySelector("#engine") === outer.engine,
        layoutCount: root.querySelectorAll("#layout").length,
        footerCount: nextLayout.querySelectorAll(
          '[data-fvc-region="footer"]',
        ).length,
      });
      previousLayout = nextLayout;
    }

    return routeResults;
  });

  expect(result).toEqual([
    {
      pageId: "wide-view",
      layoutChanged: true,
      hasExpectedLayout: true,
      stylePreserved: true,
      cardPreserved: true,
      toastPreserved: true,
      popupPreserved: true,
      popupBindingPreserved: true,
      livePreserved: true,
      enginePreserved: true,
      layoutCount: 1,
      footerCount: 1,
    },
    {
      pageId: "card-view",
      layoutChanged: true,
      hasExpectedLayout: true,
      stylePreserved: true,
      cardPreserved: true,
      toastPreserved: true,
      popupPreserved: true,
      popupBindingPreserved: true,
      livePreserved: true,
      enginePreserved: true,
      layoutCount: 1,
      footerCount: 1,
    },
  ]);
  expect(pageErrors).toEqual([]);
});

test("Mobile View back routes to Preview when enabled and Single View otherwise", async ({
  page,
}) => {
  await page.goto(baseUrl);
  const results = await page.evaluate(async () => {
    await import("/frigate-view-card.js");
    const destinations = [];

    for (const previewPageEnabled of [true, false]) {
      const card = document.createElement("frigate-view-card");
      document.body.append(card);
      card.setConfig({
        cameras: [{ entity: "camera.front", name: "Front" }],
        mobile_view_page_enabled: true,
        preview_page_enabled: previewPageEnabled,
      });
      card._pageId = "mobile-view";
      card._renderShell();
      card._pageNavigationController.navigateToPageRoute = (
        pageId,
        context,
      ) => destinations.push({ previewPageEnabled, pageId, context });

      card.shadowRoot.querySelector("[data-page-back]").click();
      card.remove();
    }

    return destinations;
  });

  expect(results).toEqual([
    {
      previewPageEnabled: true,
      pageId: "preview",
      context: { source: "mobile-view-back" },
    },
    {
      previewPageEnabled: false,
      pageId: "single-view",
      context: { source: "mobile-view-back" },
    },
  ]);
});

test("Wide View footer remains singular across landing and route swaps", async ({
  page,
}) => {
  await page.goto(baseUrl);

  const result = await page.evaluate(async () => {
    await import("/frigate-view-card.js");
    const card = document.createElement("frigate-view-card");
    document.body.append(card);
    card.setConfig({
      cameras: [{ entity: "camera.front", name: "Front" }],
      wide_view_page_enabled: true,
      stream_height: 640,
      stream_height_unit: "px",
    });

    const measureWide = () => {
      const root = card.shadowRoot;
      const layout = root.querySelector("#layout");
      const columns = root.querySelector(".wide-view-columns");
      const footer = root.querySelector(".wide-footer");
      const layoutRect = layout?.getBoundingClientRect?.();
      const columnsRect = columns?.getBoundingClientRect?.();
      const footerRect = footer?.getBoundingClientRect?.();
      return {
        footerCount: root.querySelectorAll('[data-fvc-region="footer"]')
          .length,
        wideFooterCount: root.querySelectorAll(".wide-footer").length,
        footerInsideLayout: Boolean(footer && layout?.contains?.(footer)),
        columnsMeetFooter: Boolean(
          columnsRect &&
            footerRect &&
            Math.abs(columnsRect.bottom - footerRect.top) <= 1,
        ),
        footerMeetsLayoutBottom: Boolean(
          layoutRect &&
            footerRect &&
            Math.abs(footerRect.bottom - layoutRect.bottom) <= 1,
        ),
      };
    };

    card._pageId = "wide-view";
    card._renderShell();
    await new Promise((resolve) => requestAnimationFrame(resolve));
    const landing = measureWide();

    card._pageId = "single-view";
    card._renderShellPreserveLive();
    const afterLeaving = {
      footerCount: card.shadowRoot.querySelectorAll(
        '[data-fvc-region="footer"]',
      ).length,
      wideFooterCount:
        card.shadowRoot.querySelectorAll(".wide-footer").length,
    };

    card._pageId = "wide-view";
    card._renderShellPreserveLive();
    await new Promise((resolve) => requestAnimationFrame(resolve));
    const afterReturning = measureWide();

    return { landing, afterLeaving, afterReturning };
  });

  const expectedWide = {
    footerCount: 1,
    wideFooterCount: 1,
    footerInsideLayout: true,
    columnsMeetFooter: true,
    footerMeetsLayoutBottom: true,
  };
  expect(result).toEqual({
    landing: expectedWide,
    afterLeaving: { footerCount: 1, wideFooterCount: 0 },
    afterReturning: expectedWide,
  });
});

test("Wide View Companion Cameras drag upward over controls without resizing live", async ({
  page,
}) => {
  const pageErrors = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));

  await page.goto(baseUrl);
  const result = await page.evaluate(async () => {
    await import("/frigate-view-card.js");
    document.body.style.margin = "0";
    const card = document.createElement("frigate-view-card");
    card.style.width = "1000px";
    document.body.append(card);
    card.setConfig({
      cameras: Array.from({ length: 6 }, (_, index) => ({
        entity: `camera.camera_${index + 1}`,
        name: `Camera ${index + 1}`,
      })),
      wide_view_page_enabled: true,
      stream_height: 640,
      stream_height_unit: "px",
    });
    card._pageId = "wide-view";
    card._renderShell();
    card._wideViewPageController.startWideViewMode();
    await new Promise((resolve) => requestAnimationFrame(resolve));

    const root = card.shadowRoot;
    const panel = root.querySelector("#wide-companion-panel");
    const surface = root.querySelector(".wide-companion-surface");
    const handle = root.querySelector(
      "[data-wide-companion-resize-handle]",
    );
    const expandButton = root.querySelector(
      "[data-wide-companion-expand-button]",
    );
    const liveStage = root.querySelector("#live-stage");
    const cameraSwitcher = root.querySelector("#cam-switcher");
    const filterButton = root.querySelector("#filter-btn");
    const filterPanel = root.querySelector("#filter-panel");
    const calendarButton = root.querySelector("#cal-btn");
    const calendarPanel = root.querySelector("#cal-panel");
    const toolbarHolder = filterButton.closest(".tabs-holder");
    const before = {
      panelTop: panel.getBoundingClientRect().top,
      surfaceTop: surface.getBoundingClientRect().top,
      liveHeight: liveStage.getBoundingClientRect().height,
      surfacePaddingLeft: getComputedStyle(surface).paddingLeft,
      gridInsetLeft:
        root.querySelector("#wide-companion-grid").getBoundingClientRect().left -
        surface.getBoundingClientRect().left,
      buttonInsetRight:
        surface.getBoundingClientRect().right -
        expandButton.getBoundingClientRect().right,
    };
    filterButton.click();
    const filterRect = filterPanel.getBoundingClientRect();
    const surfaceRect = surface.getBoundingClientRect();
    const overlapX = Math.max(filterRect.left, surfaceRect.left) + 8;
    const overlapY = Math.max(filterRect.top, surfaceRect.top) + 8;
    const overlapTarget = root.elementFromPoint(overlapX, overlapY);
    const filterOpen = {
      display: filterPanel.style.display,
      raised: toolbarHolder.classList.contains("has-open-toolbar-panel"),
      zIndex: getComputedStyle(toolbarHolder).zIndex,
      aboveCompanion:
        overlapTarget === filterPanel ||
        overlapTarget?.closest?.("#filter-panel") === filterPanel,
    };
    const pointerId = 7;
    const startY = handle.getBoundingClientRect().top + 10;
    handle.dispatchEvent(
      new PointerEvent("pointerdown", {
        bubbles: true,
        button: 0,
        clientY: startY,
        isPrimary: true,
        pointerId,
      }),
    );
    handle.dispatchEvent(
      new PointerEvent("pointermove", {
        bubbles: true,
        clientY: startY - 1000,
        isPrimary: true,
        pointerId,
      }),
    );
    handle.dispatchEvent(
      new PointerEvent("pointerup", {
        bubbles: true,
        button: 0,
        clientY: startY - 1000,
        isPrimary: true,
        pointerId,
      }),
    );
    await new Promise((resolve) => requestAnimationFrame(resolve));

    const expandedPanelRect = panel.getBoundingClientRect();
    const expandedSurfaceRect = surface.getBoundingClientRect();
    const expandedLiveRect = liveStage.getBoundingClientRect();
    const expanded = {
      panelTop: expandedPanelRect.top,
      surfaceTop: expandedSurfaceRect.top,
      liveBottom: expandedLiveRect.bottom,
      liveHeight: expandedLiveRect.height,
      cameraSwitcherTop: cameraSwitcher.getBoundingClientRect().top,
      now: Number(handle.getAttribute("aria-valuenow")),
      max: Number(handle.getAttribute("aria-valuemax")),
      active: handle.classList.contains("active"),
      panelExpanded: panel.classList.contains("is-expanded"),
      buttonExpanded: expandButton.getAttribute("aria-expanded"),
      buttonLabel: expandButton.getAttribute("aria-label"),
      filterDisplay: filterPanel.style.display,
      toolbarRaised: toolbarHolder.classList.contains(
        "has-open-toolbar-panel",
      ),
    };

    const collapseStartY = handle.getBoundingClientRect().top + 10;
    handle.dispatchEvent(
      new PointerEvent("pointerdown", {
        bubbles: true,
        button: 0,
        clientY: collapseStartY,
        isPrimary: true,
        pointerId,
      }),
    );
    handle.dispatchEvent(
      new PointerEvent("pointermove", {
        bubbles: true,
        clientY: collapseStartY + 1000,
        isPrimary: true,
        pointerId,
      }),
    );
    handle.dispatchEvent(
      new PointerEvent("pointerup", {
        bubbles: true,
        button: 0,
        clientY: collapseStartY + 1000,
        isPrimary: true,
        pointerId,
      }),
    );
    await new Promise((resolve) => requestAnimationFrame(resolve));

    const collapsed = {
      surfaceTop: surface.getBoundingClientRect().top,
      liveHeight: liveStage.getBoundingClientRect().height,
      now: Number(handle.getAttribute("aria-valuenow")),
      panelExpanded: panel.classList.contains("is-expanded"),
    };
    calendarButton.click();
    const calendarOpen = {
      display: calendarPanel.style.display,
      raised: toolbarHolder.classList.contains("has-open-toolbar-panel"),
    };
    expandButton.click();
    await new Promise((resolve) => requestAnimationFrame(resolve));
    const buttonExpanded = {
      now: Number(handle.getAttribute("aria-valuenow")),
      max: Number(handle.getAttribute("aria-valuemax")),
      expanded: expandButton.getAttribute("aria-expanded"),
      label: expandButton.getAttribute("aria-label"),
      calendarDisplay: calendarPanel.style.display,
      toolbarRaised: toolbarHolder.classList.contains(
        "has-open-toolbar-panel",
      ),
    };
    expandButton.click();
    await new Promise((resolve) => requestAnimationFrame(resolve));
    const buttonCollapsed = {
      now: Number(handle.getAttribute("aria-valuenow")),
      expanded: expandButton.getAttribute("aria-expanded"),
      label: expandButton.getAttribute("aria-label"),
    };
    card._wideViewPageController.stopWideViewMode();
    handle.dispatchEvent(
      new KeyboardEvent("keydown", { bubbles: true, key: "End" }),
    );
    await new Promise((resolve) => requestAnimationFrame(resolve));

    return {
      before,
      filterOpen,
      expanded,
      collapsed,
      calendarOpen,
      buttonExpanded,
      buttonCollapsed,
      stopped: {
        now: Number(handle.getAttribute("aria-valuenow")),
        panelExpanded: panel.classList.contains("is-expanded"),
      },
    };
  });

  expect(result.expanded.max).toBeGreaterThan(0);
  expect(result.before.surfacePaddingLeft).toBe("8px");
  expect(result.before.gridInsetLeft).toBeCloseTo(8, 0);
  expect(result.before.buttonInsetRight).toBeCloseTo(8, 0);
  expect(result.filterOpen).toEqual({
    display: "block",
    raised: true,
    zIndex: "30",
    aboveCompanion: true,
  });
  expect(result.expanded.now).toBe(result.expanded.max);
  expect(result.expanded.surfaceTop).toBeLessThan(
    result.before.surfaceTop - 20,
  );
  expect(result.expanded.surfaceTop).toBeLessThan(
    result.expanded.cameraSwitcherTop,
  );
  expect(result.expanded.surfaceTop).toBeLessThanOrEqual(
    result.expanded.liveBottom,
  );
  expect(result.expanded.surfaceTop).toBeGreaterThanOrEqual(
    result.expanded.liveBottom - result.expanded.liveHeight / 2 - 1,
  );
  expect(result.expanded.surfaceTop).toBeLessThanOrEqual(
    result.expanded.liveBottom - result.expanded.liveHeight / 2 + 1,
  );
  expect(result.expanded.panelTop).toBeCloseTo(result.before.panelTop, 0);
  expect(result.expanded.liveHeight).toBeCloseTo(result.before.liveHeight, 0);
  expect(result.expanded.active).toBe(false);
  expect(result.expanded.panelExpanded).toBe(true);
  expect(result.expanded.buttonExpanded).toBe("true");
  expect(result.expanded.buttonLabel).toBe("Collapse Companion Cameras");
  expect(result.expanded.filterDisplay).toBe("none");
  expect(result.expanded.toolbarRaised).toBe(false);
  expect(result.collapsed.now).toBe(0);
  expect(result.collapsed.surfaceTop).toBeCloseTo(result.before.surfaceTop, 0);
  expect(result.collapsed.liveHeight).toBeCloseTo(result.before.liveHeight, 0);
  expect(result.collapsed.panelExpanded).toBe(false);
  expect(result.calendarOpen).toEqual({ display: "block", raised: true });
  expect(result.buttonExpanded.now).toBe(result.buttonExpanded.max);
  expect(result.buttonExpanded.expanded).toBe("true");
  expect(result.buttonExpanded.label).toBe("Collapse Companion Cameras");
  expect(result.buttonExpanded.calendarDisplay).toBe("none");
  expect(result.buttonExpanded.toolbarRaised).toBe(false);
  expect(result.buttonCollapsed).toEqual({
    now: 0,
    expanded: "false",
    label: "Expand Companion Cameras",
  });
  expect(result.stopped).toEqual({ now: 0, panelExpanded: false });
  expect(pageErrors).toEqual([]);
});

test("Wide View timeline push width remains stable across wide breakpoints", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1_900, height: 1_000 });
  await page.goto(baseUrl);
  const result = await page.evaluate(async () => {
    await import("/frigate-view-card.js");
    document.body.style.margin = "0";
    const results = {};
    for (const cardWidth of [1_720, 1_790]) {
      const card = document.createElement("frigate-view-card");
      card.style.display = "block";
      card.style.width = `${cardWidth}px`;
      document.body.append(card);
      card.setConfig({
        cameras: [{ entity: "camera.front", name: "Front" }],
        wide_view_page_enabled: true,
        wide_view_timeline_enabled: true,
        wide_view_timeline_default_open: true,
        stream_height: 640,
        stream_height_unit: "px",
      });
      card._pageId = "wide-view";
      card._renderShell();
      card._wideViewPageController.startWideViewMode();

      const root = card.shadowRoot;
      const colRight = root.querySelector("#col-right");
      const panel = root.querySelector("#wide-timeline-panel");
      const samples = [];
      for (let frame = 0; frame < 20; frame += 1) {
        await new Promise((resolve) => requestAnimationFrame(resolve));
      }
      for (let frame = 0; frame < 30; frame += 1) {
        await new Promise((resolve) => requestAnimationFrame(resolve));
        samples.push({
          mode: colRight.classList.contains("wide-timeline-push")
            ? "push"
            : "overlay",
          panelWidth: Math.round(panel.getBoundingClientRect().width),
        });
      }
      results[cardWidth] = samples;
      card.remove();
    }
    return results;
  });

  for (const samples of Object.values(result)) {
    expect(new Set(samples.map(({ mode }) => mode))).toEqual(
      new Set(["push"]),
    );
    expect(new Set(samples.map(({ panelWidth }) => panelWidth)).size).toBe(1);
  }
});

test("dispatches event-tab clicks from the page-shell tabs region", async ({
  page,
}) => {
  await page.goto(baseUrl);

  const selectedTab = await page.evaluate(async () => {
    await import("/frigate-view-card.js");
    const card = document.createElement("frigate-view-card");
    const tabsRegion = document.createElement("div");
    tabsRegion.dataset.fvcRegion = "tabs";
    const clipsButton = document.createElement("button");
    clipsButton.dataset.tab = "clips";
    tabsRegion.append(clipsButton);
    card.shadowRoot.append(tabsRegion);
    card._setTab = (tab) => {
      card.dataset.selectedTab = tab;
    };

    clipsButton.click();
    return card.dataset.selectedTab || "";
  });

  expect(selectedTab).toBe("clips");
});

test("hides the detached page/tools divider in phone Single View", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(baseUrl);

  const dividerDisplay = await page.evaluate(async () => {
    await import("/frigate-view-card.js");
    const card = document.createElement("frigate-view-card");
    document.body.append(card);
    card.setConfig({
      cameras: [{ entity: "camera.front", name: "Front" }],
      mobile_view_page_enabled: true,
      card_view_page_enabled: true,
    });
    card._pageId = "single-view";
    card._renderShell();

    const shell = card.shadowRoot.querySelector("#card");
    const holder = card.shadowRoot.querySelector(
      ".button-holder--responsive-toolbar",
    );
    const divider = holder.querySelector(".page-tools-divider");
    holder.classList.add("page-tools-adjacent");
    const nonMobile = getComputedStyle(divider).display;
    shell.classList.add("mobile-client");

    return {
      mobile: getComputedStyle(divider).display,
      nonMobile,
    };
  });

  expect(dividerDisplay).toEqual({ mobile: "none", nonMobile: "flex" });
});

test("keeps desktop and phone swipe-page chips compact, equal, and responsive", async ({
  page,
}) => {
  await page.goto(baseUrl);
  const geometry = await page.evaluate(async () => {
    await import("/frigate-view-card-editor.js");
    const editor = document.createElement("frigate-view-card-editor");
    editor.style.display = "block";
    editor.style.width = "760px";
    document.body.style.margin = "0";
    document.body.append(editor);
    editor.setConfig({
      cameras: [{ entity: "camera.front", name: "Front" }],
      landing_page: "single-view",
      mobile_page: "preview-mobile-view",
      preview_page_enabled: true,
      mobile_view_page_enabled: true,
      wide_view_page_enabled: true,
      card_view_page_enabled: true,
      ha_dashboard_swipe_navigation_owner: true,
      ha_dashboard_swipe_navigation: "dashboard-wide",
      ha_dashboard_swipe_pages: [
        "preview",
        "single-view",
        "mobile-view",
        "wide-view",
        "card-view",
      ],
      ha_dashboard_swipe_mobile_pages: [
        "preview",
        "single-view",
        "mobile-view",
        "card-view",
      ],
    });

    const readGroup = (label) => {
      const group = editor.querySelector(`[aria-label="${label}"]`);
      const chips = [
        ...group.querySelectorAll(
          '.dashboard-swipe-pages-grid > .editor-choice-chip',
        ),
      ];
      const rects = chips.map((chip) =>
        chip.querySelector(".editor-choice-chip-body").getBoundingClientRect(),
      );
      return {
        count: rects.length,
        rowCount: new Set(rects.map(({ top }) => Math.round(top))).size,
        heights: rects.map(({ height }) => height),
        values: chips.map((chip) => chip.querySelector("input").value),
        locked: chips
          .filter((chip) => chip.querySelector("input").disabled)
          .map((chip) => chip.querySelector("input").value),
        checked: chips
          .filter((chip) => chip.querySelector("input").checked)
          .map((chip) => chip.querySelector("input").value),
      };
    };
    const readRows = () => ({
      desktop: readGroup("PC/Tablet Swipe Pages"),
      mobile: readGroup("Phone Swipe Pages"),
    });

    await new Promise((resolve) => requestAnimationFrame(resolve));
    const wide = readRows();
    editor.style.width = "330px";
    await new Promise((resolve) => requestAnimationFrame(resolve));
    const narrow = readRows();
    const readPageSelectionState = () => {
      const selection = editor.querySelector(
        "#ha-dashboard-swipe-page-selection",
      );
      return {
        display: getComputedStyle(selection).display,
        groups: selection.querySelectorAll(".dashboard-swipe-device-group")
          .length,
      };
    };
    const selectMode = async (mode) => {
      const input = editor.querySelector(
        `[name="ha_dashboard_swipe_navigation"][value="${mode}"]`,
      );
      input.checked = true;
      input.dispatchEvent(new Event("change", { bubbles: true }));
      await new Promise((resolve) => requestAnimationFrame(resolve));
      return readPageSelectionState();
    };
    const dashboardWide = readPageSelectionState();
    const landingDashboard = await selectMode("landing-dashboard");
    const insideCard = await selectMode("inside-card");
    const none = await selectMode("none");
    return {
      wide,
      narrow,
      modeVisibility: { dashboardWide, landingDashboard, insideCard, none },
    };
  });

  expect(geometry.wide.desktop.count).toBe(5);
  expect(geometry.wide.desktop.rowCount).toBe(1);
  expect(geometry.wide.mobile.count).toBe(4);
  expect(geometry.wide.mobile.rowCount).toBe(1);
  expect(geometry.wide.mobile.values).toEqual([
    "preview",
    "single-view",
    "mobile-view",
    "card-view",
  ]);
  expect(geometry.wide.mobile.values).not.toContain("wide-view");
  expect(geometry.wide.desktop.locked).toEqual(["single-view"]);
  expect(geometry.wide.mobile.locked).toEqual(["mobile-view"]);
  expect(geometry.wide.desktop.checked).toContain("single-view");
  expect(geometry.wide.mobile.checked).toContain("mobile-view");
  for (const group of [
    geometry.wide.desktop,
    geometry.wide.mobile,
    geometry.narrow.desktop,
    geometry.narrow.mobile,
  ]) {
    expect(new Set(group.heights.map(Math.round)).size).toBe(1);
    expect(Math.max(...group.heights)).toBeLessThanOrEqual(42);
  }
  expect(geometry.narrow.desktop.rowCount).toBeGreaterThan(1);
  expect(geometry.narrow.mobile.rowCount).toBeGreaterThan(1);
  expect(geometry.modeVisibility.dashboardWide).toEqual({
    display: "block",
    groups: 2,
  });
  expect(geometry.modeVisibility.landingDashboard.display).toBe("none");
  expect(geometry.modeVisibility.insideCard).toEqual({
    display: "block",
    groups: 2,
  });
  expect(geometry.modeVisibility.none.display).toBe("none");
});

test("shows default Card View media options only for Video Only mode", async ({
  page,
}) => {
  await page.goto(baseUrl);
  const state = await page.evaluate(async () => {
    await import("/frigate-view-card-editor.js");
    const editor = document.createElement("frigate-view-card-editor");
    document.body.append(editor);
    editor.setConfig({
      cameras: [{ entity: "camera.front", name: "Front" }],
      card_view_page_enabled: true,
      card_view_view_mode: "bottom-panel-open",
    });

    const options = editor.querySelector("#card-view-video-only-options");
    const drawer = editor.querySelector("#card_view_media_drawer_enabled");
    const cameraName = editor.querySelector("#card_view_hide_camera_name");
    const initialDisplay = options.style.display;

    editor.querySelector(
      '[name="card_view_view_mode"][value="video-only"]',
    ).click();
    const videoOnlyDisplay = options.style.display;

    editor.querySelector(
      '[name="card_view_view_mode"][value="bottom-panel-closed"]',
    ).click();

    const startModeSection = editor
      .querySelector('[aria-label="Card View Start Mode"]')
      .closest(".section");
    const standaloneSection = editor
      .querySelector("#card_view_standalone")
      .closest(".section");
    const viewModeSection = editor
      .querySelector('[aria-label="View Mode"]')
      .closest(".section");
    return {
      initialDisplay,
      videoOnlyDisplay,
      finalDisplay: options.style.display,
      drawerDefaultChecked: drawer.hasAttribute("checked"),
      cameraNameDefaultChecked: cameraName.hasAttribute("checked"),
      startBeforeStandalone: Boolean(
        startModeSection.compareDocumentPosition(standaloneSection) &
          Node.DOCUMENT_POSITION_FOLLOWING,
      ),
      mediaOptionsAfterViewMode: Boolean(
        viewModeSection.compareDocumentPosition(options) &
          Node.DOCUMENT_POSITION_FOLLOWING,
      ),
    };
  });

  expect(state).toEqual({
    initialDisplay: "none",
    videoOnlyDisplay: "",
    finalDisplay: "none",
    drawerDefaultChecked: true,
    cameraNameDefaultChecked: true,
    startBeforeStandalone: true,
    mediaOptionsAfterViewMode: true,
  });
});

test("positions camera B controls before its stream becomes ready", async ({
  page,
}) => {
  await page.goto(baseUrl);

  const state = await page.evaluate(async () => {
    await import("/frigate-view-card.js");
    const card = document.createElement("frigate-view-card");
    document.body.append(card);
    card.setConfig({
      cameras: [
        {
          entity: "camera.front",
          group: {
            secondary_entity: "camera.back",
            layout: "side_by_side",
          },
        },
      ],
    });
    card._pageId = "single-view";
    card._renderShell();

    const root = card.shadowRoot;
    const wrap = root.querySelector("#eng-wrap");
    const secondaryPane = root.querySelector(
      '.camera-group-live-pane[data-camera-group-member="B"]',
    );
    wrap.classList.add("camera-group-live", "camera-group-live--side-by-side");
    secondaryPane.hidden = false;
    const controls = secondaryPane.querySelector(".camera-group-pane-controls");
    const rect = controls.getBoundingClientRect();
    return {
      ready: secondaryPane.classList.contains("is-ready"),
      display: getComputedStyle(controls).display,
      positioned: rect.width > 0 && rect.height > 0,
    };
  });

  expect(state).toEqual({ ready: false, display: "flex", positioned: true });
});

test.describe("touch input", () => {
  test.use({
    hasTouch: true,
    userAgent:
      "Mozilla/5.0 (iPhone; CPU iPhone OS 17_6 like Mac OS X) " +
      "AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.6 " +
      "Mobile/15E148 Safari/604.1",
    viewport: { width: 390, height: 844 },
  });

  test("opens and selects from the Card View video-overlay camera picker", async ({
    page,
  }) => {
    const pageErrors = [];
    page.on("pageerror", (error) => pageErrors.push(error.message));

    await page.goto(baseUrl);
    await page.evaluate(async () => {
      await import("/frigate-view-card.js");
      const card = document.createElement("frigate-view-card");
      document.body.style.margin = "0";
      document.body.append(card);
      card.setConfig({
        cameras: [
          { entity: "camera.front", name: "Front" },
          { entity: "camera.back", name: "Back" },
        ],
        card_view_page_enabled: true,
        mobile_page: "card-view",
        card_view_view_mode: "video-only",
      });
      card._pageNavigationController.prepareConfiguredLandingPageShell();
      card._switchCamera = async (index) => {
        card.dataset.selectedCamera = String(index);
        card._activeCamIdx = index;
        card._mobileCamSwitcherOpen = false;
        card._renderCamSwitcher();
      };
    });

    const card = page.locator("frigate-view-card");
    await expect(card.locator("#card")).toHaveClass(/card-view-active/);
    await expect(card.locator(".card-view-camera-row")).toHaveCSS(
      "overflow-x",
      "visible",
    );
    const trigger = card.locator("[data-mobile-cam-trigger]");
    await expect(trigger).toBeVisible();
    await trigger.tap();
    await expect(trigger).toHaveAttribute("aria-expanded", "true");

    const secondCamera = card.locator('[data-mobile-camidx="1"]');
    await expect(secondCamera).toBeVisible();
    await secondCamera.tap();
    await expect(card).toHaveAttribute("data-selected-camera", "1");
    await expect(card.locator("[data-mobile-cam-trigger]")).toHaveAttribute(
      "aria-expanded",
      "false",
    );
    expect(pageErrors).toEqual([]);
  });

  test("opens and selects from the routed Card View header camera picker", async ({
    page,
  }) => {
    const pageErrors = [];
    page.on("pageerror", (error) => pageErrors.push(error.message));

    await page.goto(baseUrl);
    await page.evaluate(async () => {
      await import("/frigate-view-card.js");
      const card = document.createElement("frigate-view-card");
      document.body.style.margin = "0";
      document.body.append(card);
      card.setConfig({
        cameras: [
          { entity: "camera.front", name: "Front" },
          { entity: "camera.back", name: "Back" },
        ],
        card_view_page_enabled: true,
        mobile_page: "card-view",
        card_view_view_mode: "bottom-panel-open",
      });
      card._pageNavigationController.prepareConfiguredLandingPageShell();
      card._switchCamera = async (index) => {
        card.dataset.selectedCamera = String(index);
        card._activeCamIdx = index;
        card._mobileCamSwitcherOpen = false;
        card._renderCamSwitcher();
      };
    });

    const card = page.locator("frigate-view-card");
    await expect(card.locator("#card")).toHaveClass(/card-view-active/);
    await expect(card.locator(".card-view-camera-row")).toHaveCSS(
      "overflow-x",
      "visible",
    );
    const trigger = card.locator("[data-mobile-cam-trigger]");
    await expect(trigger).toBeVisible();
    await trigger.tap();
    await expect(trigger).toHaveAttribute("aria-expanded", "true");

    await card.locator('[data-mobile-camidx="1"]').tap();
    await expect(card).toHaveAttribute("data-selected-camera", "1");
    await expect(card.locator("[data-mobile-cam-trigger]")).toHaveAttribute(
      "aria-expanded",
      "false",
    );
    expect(pageErrors).toEqual([]);
  });

  test("does not let the Video Only camera row block grouped-camera controls", async ({
    page,
  }) => {
    await page.goto(baseUrl);
    const hitTarget = await page.evaluate(async () => {
      await import("/frigate-view-card.js");
      const card = document.createElement("frigate-view-card");
      document.body.style.margin = "0";
      document.body.append(card);
      card.setConfig({
        cameras: [
          {
            entity: "camera.front",
            name: "Front / Back",
            group: {
              secondary_entity: "camera.back",
              layout: "stacked",
            },
          },
        ],
        card_view_page_enabled: true,
        card_view_view_mode: "video-only",
      });
      card._pageId = "card-view";
      card._renderShell();

      const root = card.shadowRoot;
      const wrap = root.querySelector("#eng-wrap");
      const secondaryPane = root.querySelector(
        '.camera-group-live-pane[data-camera-group-member="B"]',
      );
      wrap.classList.remove("camera-group-mobile-member");
      wrap.classList.add("camera-group-live", "camera-group-live--stacked");
      secondaryPane.hidden = false;
      secondaryPane.classList.add("is-ready");
      card._cameraGroupLiveController.setActiveAudioMember = (member) => {
        card.dataset.selectedAudioMember = member;
      };
      card._cameraGroupLiveController.toggleFocusedMember = (member) => {
        card.dataset.focusedMember = member;
        return true;
      };

      return [
        '[data-camera-group-audio="A"]',
        '[data-camera-group-focus="A"]',
      ].map((selector) => {
        const button = root.querySelector(selector);
        const rect = button.getBoundingClientRect();
        const hit = root.elementFromPoint(
          rect.left + rect.width / 2,
          rect.top + rect.height / 2,
        );
        return hit?.closest?.(selector) === button;
      });
    });

    expect(hitTarget).toEqual([true, true]);
    const card = page.locator("frigate-view-card");
    await card.locator('[data-camera-group-audio="A"]').tap();
    await expect(card).toHaveAttribute("data-selected-audio-member", "A");
    await card.locator('[data-camera-group-focus="A"]').tap();
    await expect(card).toHaveAttribute("data-focused-member", "A");
  });

  const groupedMobileSurfaces = [
    {
      label: "Mobile View",
      pageId: "mobile-view",
      config: { mobile_view_page_enabled: true },
    },
    {
      label: "Single View",
      pageId: "single-view",
      config: {},
    },
    {
      label: "Card View Bottom Panel",
      pageId: "card-view",
      config: {
        card_view_page_enabled: true,
        card_view_view_mode: "bottom-panel-open",
      },
    },
    {
      label: "Card View Video Only",
      pageId: "card-view",
      config: {
        card_view_page_enabled: true,
        card_view_view_mode: "video-only",
      },
    },
  ];

  for (const surface of groupedMobileSurfaces) {
    test(`keeps the grouped-camera A/B button on the video in ${surface.label}`, async ({
      page,
    }) => {
      await page.goto(baseUrl);
      const hitTarget = await page.evaluate(async (testSurface) => {
        await import("/frigate-view-card.js");
        const card = document.createElement("frigate-view-card");
        document.body.style.margin = "0";
        document.body.append(card);
        card.setConfig({
          cameras: [
            {
              entity: "camera.front",
              name: "Front / Back",
              group: { secondary_entity: "camera.back" },
            },
          ],
          ...testSurface.config,
        });
        card._pageId = testSurface.pageId;
        card._renderShell();

        const root = card.shadowRoot;
        root
          .querySelector("#eng-wrap")
          ?.classList.add("camera-group-mobile-member");
        root
          .querySelector("#card")
          ?.classList.add("card-view-overlays-visible");
        card._cameraGroupLiveController.toggleMobileMember = () => {
          card.dataset.mobileGroupToggled = "true";
          return true;
        };
        const buttons = root.querySelectorAll(
          "[data-camera-group-mobile-toggle]",
        );
        const button = buttons[0];
        const rect = button?.getBoundingClientRect?.();
        const hit = rect
          ? root.elementFromPoint(
              rect.left + rect.width / 2,
              rect.top + rect.height / 2,
            )
          : null;
        return {
          count: buttons.length,
          visible: Boolean(rect && rect.width > 0 && rect.height > 0),
          hitToggle: Boolean(
            hit?.closest?.("[data-camera-group-mobile-toggle]"),
          ),
          inVideo: Boolean(
            button?.closest(".camera-group-live-pane--primary"),
          ),
          inTabsOrToolbar: Boolean(
            button?.closest(
              '[data-fvc-region="tools"],[data-card-view-toolbar],[data-card-view-standalone-mode-controls]',
            ),
          ),
          currentMember: button?.dataset.cameraGroupCurrentMember || "",
          targetMember: button?.dataset.cameraGroupTargetMember || "",
          label: button?.textContent?.trim() || "",
        };
      }, surface);

      expect(hitTarget).toEqual({
        count: 1,
        visible: true,
        hitToggle: true,
        inVideo: true,
        inTabsOrToolbar: false,
        currentMember: "A",
        targetMember: "B",
        label: "A",
      });
      const card = page.locator("frigate-view-card");
      await card.locator("[data-camera-group-mobile-toggle]").tap();
      await expect(card).toHaveAttribute("data-mobile-group-toggled", "true");
    });
  }

  test("keeps Single View live and popup rotation above Home Assistant chrome and alert badges", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 844, height: 390 });
    await page.goto(baseUrl);
    const state = await page.evaluate(async () => {
      await import("/frigate-view-card.js");
      const card = document.createElement("frigate-view-card");
      document.body.style.margin = "0";
      document.body.append(card);
      card.setConfig({
        cameras: [{ entity: "camera.front", name: "Front" }],
        mobile_view_rotate_to_fullscreen: true,
      });
      card._pageId = "single-view";
      card._renderShell();
      card.style.setProperty("--rotate-vw", "844px");
      card.style.setProperty("--rotate-vh", "390px");

      const root = card.shadowRoot;
      const cardRoot = root.querySelector("#card");
      const alertBadge = document.createElement("span");
      alertBadge.dataset.testAlertBadge = "";
      alertBadge.textContent = "Alert";
      alertBadge.style.cssText =
        "position:fixed;left:380px;top:180px;z-index:2;width:84px;height:30px;";
      root.querySelector("#col-right")?.append(alertBadge);

      const basePlan = {
        active: true,
        removeClasses: [],
        disableNativeControls: false,
        clearLiveControlsVisible: false,
        clearLoading: false,
        enableNativeControls: false,
        syncFullscreenButtons: false,
        showLiveControls: false,
        showPopupControls: false,
        retainViewportCover: true,
      };
      card._applyRotateOverlayUiPlan(cardRoot, {
        ...basePlan,
        mode: "live",
        addClasses: ["mobile-rotate-live"],
      });

      const hit = root.elementFromPoint(422, 195);
      const liveState = {
        hostCoversViewport: card.classList.contains(
          "mobile-view-rotate-cover",
        ),
        liveColumnZIndex: getComputedStyle(
          root.querySelector(".single-view-frame > .col-left--single-view"),
        ).zIndex,
        alertBadgeCovered: !hit?.closest?.("[data-test-alert-badge]"),
      };

      card._applyRotateOverlayUiPlan(cardRoot, {
        ...basePlan,
        mode: "popup",
        removeClasses: ["mobile-rotate-live"],
        addClasses: ["mobile-rotate-popup"],
      });

      return {
        ...liveState,
        popupUsesViewportCover: card.classList.contains(
          "mobile-view-rotate-cover",
        ),
      };
    });

    expect(state).toEqual({
      hostCoversViewport: true,
      liveColumnZIndex: "2000",
      alertBadgeCovered: true,
      popupUsesViewportCover: true,
    });
  });

  test("keeps every rotated live and popup presentation above Home Assistant chrome", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 844, height: 390 });
    await page.goto(baseUrl);
    const results = await page.evaluate(async () => {
      await import("/frigate-view-card.js");
      document.body.style.margin = "0";
      const presentations = [
        { pageId: "single-view", viewMode: "bottom-panel-open" },
        { pageId: "mobile-view", viewMode: "bottom-panel-open" },
        { pageId: "card-view", viewMode: "video-only" },
        { pageId: "card-view", viewMode: "bottom-panel-open" },
        { pageId: "card-view", viewMode: "bottom-panel-closed" },
      ];
      const overlayModes = ["live", "popup"];
      const navbarPlacements = ["top", "bottom"];
      const states = [];

      for (const presentation of presentations) {
        for (const overlayMode of overlayModes) {
          for (const navbarPlacement of navbarPlacements) {
            const navbarEdge =
              navbarPlacement === "bottom" ? "bottom" : "top";
            const shell = document.createElement("hui-root");
            const shellRoot = shell.attachShadow({ mode: "open" });
            shellRoot.innerHTML = `
              <style>
                #view { position:relative;z-index:1; }
                .header {
                  position:fixed;left:0;right:0;${navbarEdge}:0;height:70px;
                  z-index:2;background:#fff;
                }
              </style>
              <div id="view"></div>
              <div class="header"><div class="toolbar"></div></div>
            `;
            document.body.append(shell);

            const view = shellRoot.querySelector("#view");
            const header = shellRoot.querySelector(".header");
            const card = document.createElement("frigate-view-card");
            view.append(card);
            card.setConfig({
              cameras: [{ entity: "camera.front", name: "Front" }],
              card_view_page_enabled: true,
              card_view_view_mode: presentation.viewMode,
              mobile_view_ha_navbar_bottom:
                navbarPlacement === "bottom",
              mobile_view_rotate_to_fullscreen: true,
            });
            card._pageId = presentation.pageId;
            card._renderShell();
            card.style.setProperty("--rotate-vw", "844px");
            card.style.setProperty("--rotate-vh", "390px");
            card.style.setProperty("--rotate-ox", "0px");
            card.style.setProperty("--rotate-oy", "0px");

            const cardRoot = card.shadowRoot.querySelector("#card");
            card._applyRotateOverlayUiPlan(cardRoot, {
              active: true,
              mode: overlayMode,
              removeClasses: [],
              addClasses: [
                overlayMode === "popup"
                  ? "mobile-rotate-popup"
                  : "mobile-rotate-live",
              ],
              retainViewportCover: true,
            });

            const hit = shellRoot.elementFromPoint(
              422,
              navbarPlacement === "bottom" ? 370 : 20,
            );
            states.push({
              ...presentation,
              overlayMode,
              navbarPlacement,
              hostCoversViewport:
                card.classList.contains("mobile-view-rotate-cover"),
              viewZIndex: getComputedStyle(view).zIndex,
              headerZIndex: getComputedStyle(header).zIndex,
              headerWinsViewportEdge:
                hit === header || Boolean(hit?.closest?.(".header")),
            });

            card.remove();
            shell.remove();
          }
        }
      }
      return states;
    });

    expect(results).toHaveLength(20);
    for (const state of results) {
      expect(state.hostCoversViewport, JSON.stringify(state)).toBe(true);
      expect(state.viewZIndex, JSON.stringify(state)).toBe("2");
      expect(state.headerZIndex, JSON.stringify(state)).toBe("1");
      expect(state.headerWinsViewportEdge, JSON.stringify(state)).toBe(false);
    }
  });

  test("dismisses rotated fullscreen until the phone leaves landscape", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 844, height: 390 });
    await page.goto(baseUrl);
    const state = await page.evaluate(async () => {
      await import("/frigate-view-card.js");
      const card = document.createElement("frigate-view-card");
      document.body.style.margin = "0";
      document.body.append(card);
      card.setConfig({
        cameras: [{ entity: "camera.front", name: "Front" }],
        mobile_view_rotate_to_fullscreen: true,
      });
      card._pageId = "single-view";
      card._renderShell();
      card.style.setProperty("--rotate-vw", "844px");
      card.style.setProperty("--rotate-vh", "390px");
      card.style.setProperty("--rotate-ox", "0px");
      card.style.setProperty("--rotate-oy", "0px");

      let landscape = true;
      card._isRotateToFullscreenEnabled = () => true;
      card._isMobileTabletViewport = () => true;
      card._isLandscapeViewport = () => landscape;
      card._updateRotateOverlayState();

      const root = card.shadowRoot;
      const cardRoot = root.querySelector("#card");
      root.querySelector("#live-stage")?.classList.add("live-controls-visible");
      const dismiss = root.querySelector("[data-rotate-overlay-dismiss]");
      const initialDisplay = getComputedStyle(dismiss).display;
      const initialRect = dismiss.getBoundingClientRect();

      dismiss.click();
      const dismissedInLandscape = card._rotateLiveOverlayDismissed;
      const activeAfterDismiss = card._rotateOverlayActive;
      await new Promise((resolve) => setTimeout(resolve, 360));
      card._updateRotateOverlayState();
      const reopenedDuringSameLandscape = cardRoot.classList.contains(
        "mobile-rotate-live",
      );

      const popup = root.querySelector("#myPopup");
      const viewer = root.querySelector("#viewer");
      popup.classList.add("is-open");
      viewer.style.display = "flex";
      viewer.append(document.createElement("div"));
      card._updateRotateOverlayState();
      const popupStillRotates = cardRoot.classList.contains(
        "mobile-rotate-popup",
      );
      const popupOverlayDisplay = getComputedStyle(dismiss).display;
      popup.classList.remove("is-open");
      viewer.replaceChildren();
      viewer.style.display = "none";
      card._updateRotateOverlayState();

      landscape = false;
      card._updateRotateOverlayState();
      const dismissalAfterPortrait = card._rotateLiveOverlayDismissed;

      landscape = true;
      card._updateRotateOverlayState();
      const reopenedOnNextLandscape = cardRoot.classList.contains(
        "mobile-rotate-live",
      );

      return {
        initialDisplay,
        initialLeft: Math.round(initialRect.left),
        initialTop: Math.round(initialRect.top),
        dismissedInLandscape,
        activeAfterDismiss,
        reopenedDuringSameLandscape,
        popupStillRotates,
        popupOverlayDisplay,
        dismissalAfterPortrait,
        reopenedOnNextLandscape,
      };
    });

    expect(state).toEqual({
      initialDisplay: "grid",
      initialLeft: 20,
      initialTop: 8,
      dismissedInLandscape: true,
      activeAfterDismiss: false,
      reopenedDuringSameLandscape: false,
      popupStillRotates: true,
      popupOverlayDisplay: "none",
      dismissalAfterPortrait: false,
      reopenedOnNextLandscape: true,
    });
  });

  test("contains rotated Card View Video Only media and keeps controls inside the sides", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 844, height: 390 });
    await page.goto(baseUrl);
    const geometry = await page.evaluate(async () => {
      await import("/frigate-view-card.js");
      const card = document.createElement("frigate-view-card");
      document.body.style.margin = "0";
      document.body.append(card);
      card.setConfig({
        cameras: [{ entity: "camera.front", name: "Front" }],
        card_view_page_enabled: true,
        card_view_view_mode: "video-only",
        mobile_view_rotate_to_fullscreen: true,
      });
      card._pageId = "card-view";
      card._renderShell();
      card.style.setProperty("--rotate-vw", "844px");
      card.style.setProperty("--rotate-vh", "390px");
      card.style.setProperty("--rotate-ox", "0px");
      card.style.setProperty("--rotate-oy", "0px");
      card.classList.add("mobile-view-rotate-cover");

      const root = card.shadowRoot;
      const cardRoot = root.querySelector("#card");
      const popup = root.querySelector("#myPopup");
      const viewer = root.querySelector("#viewer");
      const actions = root.querySelector("#popup-card-view-actions");
      const mediaBar = root.querySelector("#popup-media-controls");
      const closeButton = root.querySelector("#close-btn");
      cardRoot.classList.add("mobile-rotate-popup");
      popup.classList.add("popup-content--card-view-drawer", "is-open");
      popup.style.animation = "none";
      popup.style.transition = "none";
      viewer.style.display = "flex";
      const closeDisplayWithoutControls = getComputedStyle(
        closeButton.closest(".popup-close-row"),
      ).display;

      const video = document.createElement("video");
      video.style.aspectRatio = "16 / 9";
      viewer.append(video);
      card._isMobileTabletViewport = () => true;
      card._popupMediaControlsController.ensurePlaybackButtons("clip");
      card._popupMediaControlsController.initialize(video, "clip");

      actions.hidden = false;
      actions.append(document.createElement("button"));
      const sideControls = root.querySelector("#popup-playback-controls");
      const closeDisplayWithMediaControls = getComputedStyle(
        closeButton.closest(".popup-close-row"),
      ).display;
      viewer.dispatchEvent(
        new PointerEvent("pointerdown", {
          bubbles: true,
          clientX: 422,
          clientY: 195,
          pointerId: 1,
          pointerType: "touch",
        }),
      );
      viewer.dispatchEvent(
        new PointerEvent("pointerup", {
          bubbles: true,
          clientX: 422,
          clientY: 195,
          pointerId: 1,
          pointerType: "touch",
        }),
      );
      const closeDisplayWithOverlayControls = getComputedStyle(
        closeButton.closest(".popup-close-row"),
      ).display;

      await new Promise((resolve) => requestAnimationFrame(resolve));
      const hostRect = card.getBoundingClientRect();
      const cardRect = cardRoot.getBoundingClientRect();
      const popupRect = popup.getBoundingClientRect();
      const viewerRect = viewer.getBoundingClientRect();
      const videoRect = video.getBoundingClientRect();
      const actionsRect = actions.getBoundingClientRect();
      const sideControlsRect = sideControls.getBoundingClientRect();
      const mediaBarRect = mediaBar.getBoundingClientRect();
      const closeRect = closeButton.getBoundingClientRect();
      const closeStyle = getComputedStyle(closeButton);
      const overlayDismissStyle = getComputedStyle(
        root.querySelector("[data-rotate-overlay-dismiss]"),
      );
      await new Promise((resolve) => setTimeout(resolve, 2100));

      return {
        hostHeight: hostRect.height,
        cardHeight: cardRect.height,
        popupHeight: popupRect.height,
        viewerHeight: viewerRect.height,
        videoWidth: videoRect.width,
        videoLeft: videoRect.left,
        videoRight: videoRect.right,
        objectFit: getComputedStyle(video).objectFit,
        leftControlInset: actionsRect.left,
        rightControlInset: 844 - sideControlsRect.right,
        bottomBarGap: 390 - mediaBarRect.bottom,
        closeDisplayWithoutControls,
        closeDisplayWithMediaControls,
        closeDisplayWithOverlayControls,
        closeDisplayAfterOverlayTimeout: getComputedStyle(
          closeButton.closest(".popup-close-row"),
        ).display,
        sideControlsOpacityAfterOverlayTimeout:
          getComputedStyle(sideControls).opacity,
        closeRightInset: 844 - closeRect.right,
        closeTop: closeRect.top,
        closeOverlayStyleDifferences: [
          "width",
          "height",
          "paddingTop",
          "color",
          "backgroundColor",
          "borderTopColor",
          "borderRadius",
          "boxShadow",
        ].filter(
          (property) => closeStyle[property] !== overlayDismissStyle[property],
        ),
      };
    });

    expect(geometry.hostHeight).toBeCloseTo(390, 0);
    expect(geometry.cardHeight).toBeCloseTo(390, 0);
    expect(geometry.popupHeight).toBeCloseTo(390, 0);
    expect(geometry.viewerHeight).toBeCloseTo(390, 0);
    expect(geometry.videoWidth).toBeCloseTo((390 * 16) / 9, 0);
    expect(geometry.videoLeft).toBeGreaterThan(70);
    expect(geometry.videoRight).toBeLessThan(774);
    expect(geometry.objectFit).toBe("contain");
    expect(geometry.leftControlInset).toBeCloseTo(20, 0);
    expect(geometry.rightControlInset).toBeCloseTo(20, 0);
    expect(geometry.bottomBarGap).toBeCloseTo(0, 0);
    expect(geometry.closeDisplayWithoutControls).toBe("none");
    expect(geometry.closeDisplayWithMediaControls).toBe("none");
    expect(geometry.closeDisplayWithOverlayControls).toBe("block");
    expect(geometry.closeDisplayAfterOverlayTimeout).toBe("none");
    expect(geometry.sideControlsOpacityAfterOverlayTimeout).toBe("0");
    expect(geometry.closeRightInset).toBeCloseTo(20, 0);
    expect(geometry.closeTop).toBeCloseTo(8, 0);
    expect(geometry.closeOverlayStyleDifferences).toEqual([]);
  });

  test("insets rotated Card View live overlays and closes its media carousel", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 844, height: 390 });
    await page.goto(baseUrl);
    const geometry = await page.evaluate(async () => {
      await import("/frigate-view-card.js");
      const card = document.createElement("frigate-view-card");
      document.body.style.margin = "0";
      document.body.append(card);
      card.setConfig({
        cameras: [{ entity: "camera.front", name: "Front" }],
        card_view_page_enabled: true,
        card_view_view_mode: "video-only",
        card_view_media_drawer_enabled: true,
        mobile_view_rotate_to_fullscreen: true,
      });
      card._pageId = "card-view";
      card._renderShell();
      card.style.setProperty("--rotate-vw", "844px");
      card.style.setProperty("--rotate-vh", "390px");
      card.style.setProperty("--rotate-ox", "0px");
      card.style.setProperty("--rotate-oy", "0px");

      const root = card.shadowRoot;
      const cardRoot = root.querySelector("#card");
      const drawer = root.querySelector("[data-card-view-media-drawer]");
      const cameraRow = root.querySelector(".card-view-camera-row");
      const playback = root.querySelector("#live-playback-controls");
      const status = root.querySelector(".card-view-live-status-overlay");
      const liveStage = root.querySelector("#live-stage");
      const dismiss = root.querySelector("[data-rotate-overlay-dismiss]");
      liveStage.classList.add("live-controls-visible");
      playback.append(document.createElement("button"));
      cardRoot.classList.add("card-view-overlays-visible");
      card._cardViewPageController._mediaDrawerController.setOpen(true);
      card._cardViewPageController._mediaDrawerCalendarOpen = true;

      card._applyRotateOverlayUiPlan(cardRoot, {
        active: true,
        mode: "live",
        removeClasses: [],
        addClasses: ["mobile-rotate-live"],
        retainViewportCover: true,
      });

      await new Promise((resolve) => requestAnimationFrame(resolve));
      const cameraRowRect = cameraRow.getBoundingClientRect();
      const playbackRect = playback.getBoundingClientRect();
      const statusRect = status.getBoundingClientRect();
      const dismissDisplayBeforeDrawer = getComputedStyle(dismiss).display;
      card._cardViewPageController._mediaDrawerController.setOpen(true);
      const dismissDisplayWithDrawer = getComputedStyle(dismiss).display;
      card._cardViewPageController._mediaDrawerController.setOpen(false);
      return {
        viewportCover: card.classList.contains("mobile-view-rotate-cover"),
        drawerOpen: drawer.classList.contains("is-open"),
        calendarOpen: card._cardViewPageController._mediaDrawerCalendarOpen,
        cameraRowLeft: cameraRowRect.left,
        cameraRowRightInset: 844 - cameraRowRect.right,
        playbackRightInset: 844 - playbackRect.right,
        statusRightInset: 844 - statusRect.right,
        liveControlsVisible: liveStage.classList.contains(
          "live-controls-visible",
        ),
        dismissDisplayBeforeDrawer,
        dismissDisplayWithDrawer,
      };
    });

    expect(geometry.viewportCover).toBe(true);
    expect(geometry.drawerOpen).toBe(false);
    expect(geometry.calendarOpen).toBe(false);
    expect(geometry.cameraRowLeft).toBeCloseTo(20, 0);
    expect(geometry.cameraRowRightInset).toBeCloseTo(20, 0);
    expect(geometry.playbackRightInset).toBeCloseTo(20, 0);
    expect(geometry.statusRightInset).toBeCloseTo(20, 0);
    expect(geometry.liveControlsVisible).toBe(true);
    expect(geometry.dismissDisplayBeforeDrawer).toBe("grid");
    expect(geometry.dismissDisplayWithDrawer).toBe("none");
  });

  test("keeps remounted live video on custom controls throughout rotation", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 844, height: 390 });
    await page.goto(baseUrl);
    const states = await page.evaluate(async () => {
      await import("/frigate-view-card.js");
      const surfaces = [
        { label: "Single View", pageId: "single-view", config: {} },
        {
          label: "Mobile View",
          pageId: "mobile-view",
          config: { mobile_view_page_enabled: true },
        },
        {
          label: "Wide View",
          pageId: "wide-view",
          config: { wide_view_page_enabled: true },
        },
        {
          label: "Card View Bottom Panel",
          pageId: "card-view",
          config: {
            card_view_page_enabled: true,
            card_view_view_mode: "bottom-panel-open",
          },
        },
        {
          label: "Card View Video Only",
          pageId: "card-view",
          config: {
            card_view_page_enabled: true,
            card_view_view_mode: "video-only",
          },
        },
      ];

      const results = [];
      for (const surface of surfaces) {
        const card = document.createElement("frigate-view-card");
        document.body.style.margin = "0";
        document.body.append(card);
        card.setConfig({
          cameras: [{ entity: "camera.front", name: "Front" }],
          mobile_view_rotate_to_fullscreen: true,
          ...surface.config,
        });
        card._pageId = surface.pageId;
        card._renderShell();
        card.style.setProperty("--rotate-vw", "844px");
        card.style.setProperty("--rotate-vh", "390px");
        card.style.setProperty("--rotate-ox", "0px");
        card.style.setProperty("--rotate-oy", "0px");

        const root = card.shadowRoot;
        const cardRoot = root.querySelector("#card");
        const liveStage = root.querySelector("#live-stage");
        const rotateDismiss = root.querySelector(
          "[data-rotate-overlay-dismiss]",
        );
        cardRoot.classList.add("mobile-rotate-live");
        card._rotateOverlayActive = true;
        card._rotateOverlayMode = "live";

        const video = document.createElement("video");
        video.controls = true;
        video.setAttribute("controls", "");
        root.querySelector("#engine")?.append(video);
        const liveSideControls = root.querySelector("#live-playback-controls");
        liveSideControls.append(document.createElement("button"));

        // Successful remount paths historically request native controls here.
        card._setLiveNativeControls(true);
        const liveDismissWithoutControls =
          getComputedStyle(rotateDismiss).display;
        liveStage.classList.add("live-controls-visible");
        await new Promise((resolve) => requestAnimationFrame(resolve));
        const liveDismissWithControls =
          getComputedStyle(rotateDismiss).display;
        const liveSideInset = Math.round(
          844 - liveSideControls.getBoundingClientRect().right,
        );
        const backDisplay =
          surface.label === "Card View Video Only"
            ? getComputedStyle(
                root.querySelector("[data-card-view-video-back]"),
              ).display
            : null;

        cardRoot.classList.remove("mobile-rotate-live");
        cardRoot.classList.add("mobile-rotate-popup");
        const popup = root.querySelector("#myPopup");
        const viewer = root.querySelector("#viewer");
        popup.classList.add("is-open");
        popup.style.animation = "none";
        popup.style.transition = "none";
        viewer.style.display = "flex";
        const popupCloseButton = root.querySelector("#close-btn");
        const popupCloseWithoutControls = getComputedStyle(
          popupCloseButton.closest(".popup-close-row"),
        ).display;
        const popupVideo = document.createElement("video");
        viewer.append(popupVideo);
        card._isMobileTabletViewport = () => true;
        card._popupMediaControlsController.ensurePlaybackButtons("clip");
        card._popupMediaControlsController.initialize(popupVideo, "clip");
        const popupSideControls = root.querySelector(
          "#popup-playback-controls",
        );
        viewer.dispatchEvent(
          new PointerEvent("pointerdown", {
            bubbles: true,
            clientX: 422,
            clientY: 195,
            pointerId: 1,
            pointerType: "touch",
          }),
        );
        viewer.dispatchEvent(
          new PointerEvent("pointerup", {
            bubbles: true,
            clientX: 422,
            clientY: 195,
            pointerId: 1,
            pointerType: "touch",
          }),
        );
        await new Promise((resolve) => requestAnimationFrame(resolve));
        const popupSideInset = Math.round(
          844 - popupSideControls.getBoundingClientRect().right,
        );
        const popupCloseRect = popupCloseButton.getBoundingClientRect();
        const popupCloseStyle = getComputedStyle(popupCloseButton);
        const popupCloseDisplay = getComputedStyle(
          popupCloseButton.closest(".popup-close-row"),
        ).display;
        const overlayDismissStyle = getComputedStyle(
          root.querySelector("[data-rotate-overlay-dismiss]"),
        );
        popupCloseButton.click();

        results.push({
          label: surface.label,
          controls: video.controls,
          controlsAttribute: video.hasAttribute("controls"),
          playsInline: video.hasAttribute("playsinline"),
          webkitPlaysInline: video.getAttribute("webkit-playsinline"),
          liveSideInset,
          liveDismissWithoutControls,
          liveDismissWithControls,
          popupSideInset,
          popupCloseWithoutControls,
          popupCloseDisplay,
          popupCloseRightInset: Math.round(844 - popupCloseRect.right),
          popupCloseTop: Math.round(popupCloseRect.top),
          popupCloseOverlayStyleDifferences: [
            "width",
            "height",
            "paddingTop",
            "color",
            "backgroundColor",
            "borderTopColor",
            "borderRadius",
            "boxShadow",
          ].filter(
            (property) =>
              popupCloseStyle[property] !== overlayDismissStyle[property],
          ),
          popupClosed: !popup.classList.contains("is-open"),
          backDisplay,
        });
        card.remove();
      }
      return results;
    });

    expect(states).toEqual([
      {
        label: "Single View",
        controls: false,
        controlsAttribute: false,
        playsInline: true,
        webkitPlaysInline: "true",
        liveSideInset: 20,
        liveDismissWithoutControls: "none",
        liveDismissWithControls: "grid",
        popupSideInset: 20,
        popupCloseWithoutControls: "none",
        popupCloseDisplay: "block",
        popupCloseRightInset: 20,
        popupCloseTop: 8,
        popupCloseOverlayStyleDifferences: [],
        popupClosed: true,
        backDisplay: null,
      },
      {
        label: "Mobile View",
        controls: false,
        controlsAttribute: false,
        playsInline: true,
        webkitPlaysInline: "true",
        liveSideInset: 20,
        liveDismissWithoutControls: "none",
        liveDismissWithControls: "grid",
        popupSideInset: 20,
        popupCloseWithoutControls: "none",
        popupCloseDisplay: "block",
        popupCloseRightInset: 20,
        popupCloseTop: 8,
        popupCloseOverlayStyleDifferences: [],
        popupClosed: true,
        backDisplay: null,
      },
      {
        label: "Wide View",
        controls: false,
        controlsAttribute: false,
        playsInline: true,
        webkitPlaysInline: "true",
        liveSideInset: 20,
        liveDismissWithoutControls: "none",
        liveDismissWithControls: "grid",
        popupSideInset: 20,
        popupCloseWithoutControls: "none",
        popupCloseDisplay: "block",
        popupCloseRightInset: 20,
        popupCloseTop: 8,
        popupCloseOverlayStyleDifferences: [],
        popupClosed: true,
        backDisplay: null,
      },
      {
        label: "Card View Bottom Panel",
        controls: false,
        controlsAttribute: false,
        playsInline: true,
        webkitPlaysInline: "true",
        liveSideInset: 20,
        liveDismissWithoutControls: "none",
        liveDismissWithControls: "grid",
        popupSideInset: 20,
        popupCloseWithoutControls: "none",
        popupCloseDisplay: "block",
        popupCloseRightInset: 20,
        popupCloseTop: 8,
        popupCloseOverlayStyleDifferences: [],
        popupClosed: true,
        backDisplay: null,
      },
      {
        label: "Card View Video Only",
        controls: false,
        controlsAttribute: false,
        playsInline: true,
        webkitPlaysInline: "true",
        liveSideInset: 20,
        liveDismissWithoutControls: "none",
        liveDismissWithControls: "grid",
        popupSideInset: 20,
        popupCloseWithoutControls: "none",
        popupCloseDisplay: "block",
        popupCloseRightInset: 20,
        popupCloseTop: 8,
        popupCloseOverlayStyleDifferences: [],
        popupClosed: true,
        backDisplay: "none",
      },
    ]);
  });

  test("spaces the Card View Video Only A/B control between Back and Slideshow", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(baseUrl);
    const geometry = await page.evaluate(async () => {
      await import("/frigate-view-card.js");
      const card = document.createElement("frigate-view-card");
      card.style.display = "block";
      card.style.width = "390px";
      document.body.style.margin = "0";
      document.body.append(card);
      card.setConfig({
        cameras: [
          {
            entity: "camera.front",
            name: "Front / Back",
            group: { secondary_entity: "camera.back" },
          },
        ],
        card_view_page_enabled: true,
        card_view_view_mode: "video-only",
        slideshow_rotation_enabled: true,
      });
      card._pageId = "card-view";
      card._renderShell();

      const root = card.shadowRoot;
      root
        .querySelector("#eng-wrap")
        ?.classList.add("camera-group-mobile-member");
      root
        .querySelector("#card")
        ?.classList.add("card-view-overlays-visible");
      const back = root.querySelector("[data-card-view-video-back]");
      const toggle = root.querySelector("[data-camera-group-mobile-toggle]");
      const slideshow = root.querySelector(
        "[data-card-view-standalone-slideshow]",
      );
      const backRect = back?.getBoundingClientRect?.();
      const toggleRect = toggle?.getBoundingClientRect?.();
      const slideshowRect = slideshow?.getBoundingClientRect?.();
      return {
        allPresent: Boolean(backRect && toggleRect && slideshowRect),
        toggleWidth: toggleRect?.width || 0,
        toggleHeight: toggleRect?.height || 0,
        alignedWithBack: Boolean(
          backRect && toggleRect && Math.abs(toggleRect.top - backRect.top) < 0.5,
        ),
        backGap:
          backRect && toggleRect ? toggleRect.left - backRect.right : -1,
        slideshowGap:
          toggleRect && slideshowRect
            ? slideshowRect.left - toggleRect.right
            : -1,
      };
    });

    expect(geometry.allPresent).toBe(true);
    expect(geometry.toggleWidth).toBe(32);
    expect(geometry.toggleHeight).toBe(32);
    expect(geometry.alignedWithBack).toBe(true);
    expect(geometry.backGap).toBe(7);
    expect(geometry.slideshowGap).toBeGreaterThanOrEqual(6);
  });

  test("fits five Card View media tabs above the handle on a narrow video", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(baseUrl);
    const geometry = await page.evaluate(async () => {
      await import("/frigate-view-card.js");
      const card = document.createElement("frigate-view-card");
      card.style.display = "block";
      card.style.width = "390px";
      document.body.style.margin = "0";
      document.body.append(card);
      card.setConfig({
        cameras: [{ entity: "camera.front", name: "Front" }],
        card_view_page_enabled: true,
        card_view_view_mode: "video-only",
        card_view_media_drawer_enabled: true,
      });
      card._pageId = "card-view";
      card._renderShell();

      const root = card.shadowRoot;
      const stage = root.querySelector("#live-stage");
      stage.style.height = "225px";
      const drawer = card._cardViewPageController._mediaDrawerController;
      drawer.bind();
      drawer.setOpen(true);

      const tabs = [...root.querySelectorAll("[data-card-view-media-drawer-type]")];
      const handle = root.querySelector("[data-card-view-media-drawer-toggle]");
      const actions = root.querySelector("[data-card-view-media-drawer-actions]");
      const pageController = card._cardViewPageController;
      pageController._mediaDrawerCalendarOpen = true;
      pageController.renderMediaDrawerCalendar();
      drawer.render();
      const calendarPanel = root.querySelector(
        "[data-card-view-media-drawer-calendar-panel]",
      );
      const lastTabRect = tabs.at(-1)?.getBoundingClientRect?.();
      const handleRect = handle?.getBoundingClientRect?.();
      const actionsRect = actions?.getBoundingClientRect?.();
      const stageRect = stage.getBoundingClientRect();
      const calendarRect = calendarPanel?.getBoundingClientRect?.();
      return {
        tabLabels: tabs.map((tab) => tab.textContent.trim()),
        tabsBeforeHandle: Boolean(
          lastTabRect && handleRect && lastTabRect.bottom <= handleRect.top,
        ),
        actionsAfterHandle: Boolean(
          actionsRect && handleRect && actionsRect.top >= handleRect.bottom,
        ),
        actionCount: actions?.querySelectorAll("button").length || 0,
        calendarVisible: Boolean(
          calendarRect && calendarRect.width > 0 && calendarRect.height > 0,
        ),
        calendarWithinStage: Boolean(
          calendarRect && calendarRect.right <= stageRect.right + 0.5,
        ),
      };
    });

    expect(geometry).toEqual({
      tabLabels: ["Alerts", "Clips", "Snapshots", "Recordings", "Favorites"],
      tabsBeforeHandle: true,
      actionsAfterHandle: true,
      actionCount: 2,
      calendarVisible: true,
      calendarWithinStage: true,
    });
  });

  test("keeps the normal Card View header in standalone Bottom Panel mode", async ({
    page,
  }) => {
    await page.goto(baseUrl);
    const state = await page.evaluate(async () => {
      await import("/frigate-view-card.js");
      const card = document.createElement("frigate-view-card");
      document.body.append(card);
      card.setConfig({
        cameras: [
          { entity: "camera.front", name: "Front" },
          { entity: "camera.back", name: "Back" },
        ],
        card_view_page_enabled: true,
        card_view_standalone: true,
        card_view_view_mode: "bottom-panel-open",
      });
      card._pageId = "card-view";
      card._renderShell();
      const cardRoot = card.shadowRoot.querySelector("#card");
      const cameraRow = card.shadowRoot.querySelector(
        ".card-view-camera-row",
      );
      const cameraPicker = cameraRow.querySelector(".mobile-cam-picker");
      const backSlot = cameraRow.querySelector(".card-view-back-slot");
      const cameraRowRect = cameraRow.getBoundingClientRect();
      const cameraPickerRect = cameraPicker.getBoundingClientRect();
      return {
        standalone: cardRoot.classList.contains("card-view-standalone"),
        overlay: cardRoot.classList.contains(
          "card-view-overlay-presentation",
        ),
        videoOnly: cardRoot.classList.contains("card-view-video-panel-only"),
        cameraRowPosition: getComputedStyle(cameraRow).position,
        cameraPickerWide: cameraPickerRect.width >= 162,
        cameraPickerCentered:
          Math.abs(
            cameraPickerRect.left + cameraPickerRect.width / 2 -
              (cameraRowRect.left + cameraRowRect.width / 2),
          ) <= 0.5,
        backSlotDisplay: getComputedStyle(backSlot).display,
        backSlotVisibility: getComputedStyle(backSlot).visibility,
        cameraStatusVisible: Boolean(
          cameraRow.querySelector(".mobile-cam-picker__status"),
        ),
      };
    });

    expect(state).toEqual({
      standalone: true,
      overlay: false,
      videoOnly: false,
      cameraRowPosition: "relative",
      cameraPickerWide: true,
      cameraPickerCentered: true,
      backSlotDisplay: "block",
      backSlotVisibility: "hidden",
      cameraStatusVisible: true,
    });
  });
});
