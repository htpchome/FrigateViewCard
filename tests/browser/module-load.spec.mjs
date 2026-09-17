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
  const headerAttribute = /const NAVBAR_HEADER_ATTRIBUTE = "([^"]+)";/.exec(navbarSource)?.[1];
  const navbarStyles = /const BOTTOM_NAVBAR_STYLE_TEXT = `([\s\S]*?)`;/.exec(navbarSource)?.[1]
    ?.replaceAll("${NAVBAR_HEADER_ATTRIBUTE}", headerAttribute);
  expect(headerAttribute).toBeTruthy();
  expect(navbarStyles).toBeTruthy();
  const state = await page.evaluate(({ styleText, headerAttributeName }) => {
    const style = document.createElement("style");
    style.textContent = `
      #view { position:relative; width:390px; height:600px; }
      .bubble-popup { position:absolute; top:100px; left:40px; width:280px; height:200px; z-index:5; }
      .bubble-backdrop { position:fixed; inset:0; z-index:4; }
      .ha-header { position:fixed; bottom:0; height:56px; }
      ${styleText}
    `;
    const view = document.createElement("div");
    view.id = "view";
    const popup = document.createElement("div");
    popup.className = "bubble-popup header";
    view.append(popup);
    const backdrop = document.createElement("div");
    backdrop.className = "bubble-backdrop";
    const header = document.createElement("div");
    header.className = "header ha-header";
    header.setAttribute(headerAttributeName, "");
    document.body.append(style, view, backdrop, header);
    const popupOnTop = document.elementFromPoint(100, 150) === popup;
    const viewZIndex = getComputedStyle(view).zIndex;
    view.style.zIndex = "1";
    const backdropWinsWhenViewIsTrapped =
      document.elementFromPoint(100, 150) === backdrop;
    return {
      popupOnTop,
      viewZIndex,
      backdropWinsWhenViewIsTrapped,
      popupZIndex: getComputedStyle(popup).zIndex,
      haHeaderZIndex: getComputedStyle(header).zIndex,
    };
  }, { styleText: navbarStyles, headerAttributeName: headerAttribute });

  expect(state).toEqual({
    popupOnTop: true,
    viewZIndex: "auto",
    backdropWinsWhenViewIsTrapped: true,
    popupZIndex: "5",
    haHeaderZIndex: "2",
  });
});

test("rotated Mobile View inside Bubble fills the viewport above its backdrop", async ({ page }) => {
  await page.setViewportSize({ width: 844, height: 390 });
  await page.goto(baseUrl);

  const state = await page.evaluate(async () => {
    await import("/frigate-view-card.js");
    document.body.style.margin = "0";
    const shell = document.createElement("hui-root");
    const root = shell.attachShadow({ mode: "open" });
    root.innerHTML = `
      <style>
        #view { position: relative; width: 844px; height: 390px; }
        .header { position: fixed; z-index: 1; height: 56px; }
        .bubble-pop-up-container {
          position: absolute; top: 40px; left: 30px; width: 600px; height: 300px;
          overflow: hidden; transform: translateY(0); z-index: 5;
        }
        .bubble-backdrop { position: fixed; inset: 0; z-index: 4; }
      </style>
      <div id="view"><div class="bubble-pop-up-container"></div></div>
      <div class="bubble-backdrop"></div>
      <div class="header"><div class="toolbar"></div></div>
    `;
    document.body.append(shell);
    const card = document.createElement("frigate-view-card");
    card._isLikelyMobileClient = () => true;
    card._isLikelyPhoneClient = () => true;
    card.setConfig({
      cameras: [{ entity: "camera.front", name: "Front" }],
      mobile_view_page_enabled: true,
      mobile_view_rotate_to_fullscreen: true,
      tight_margins: true,
    });
    const bubble = root.querySelector(".bubble-pop-up-container");
    const wrapper = document.createElement("div");
    bubble.attachShadow({ mode: "open" }).append(wrapper);
    wrapper.append(card);
    card._pageId = "mobile-view";
    card._renderShell();
    card._applyTightMargins();
    card._isMobileTabletViewport = () => true;
    card._isLandscapeViewport = () => true;
    card._updateRotateOverlayState();
    card._applyCardStyle();

    const liveTopLayer = card.matches(":popover-open");
    const liveBubbleTransform = getComputedStyle(bubble).transform;
    const liveBubbleOverflow = getComputedStyle(bubble).overflowY;
    const liveHit = root.elementFromPoint(422, 195);
    const liveEdgeHit = root.elementFromPoint(800, 195);
    const liveInnerHit = bubble.shadowRoot.elementFromPoint(422, 195);
    const liveMode = card._rotateOverlayMode;
    const popup = card.shadowRoot.querySelector("#myPopup");
    const viewer = card.shadowRoot.querySelector("#viewer");
    popup.classList.add("is-open");
    viewer.style.display = "flex";
    viewer.append(document.createElement("video"));
    card._updateRotateOverlayState();
    card._applyCardStyle();
    const popupHit = root.elementFromPoint(422, 195);
    const popupEdgeHit = root.elementFromPoint(800, 195);
    const popupTopLayer = card.matches(":popover-open");
    const hostRect = card.getBoundingClientRect();
    const active = {
      rotationActive: card._rotateOverlayActive,
      liveMode,
      popupMode: card._rotateOverlayMode,
      liveTopLayer,
      popupTopLayer,
      liveBubbleTransform,
      liveBubbleOverflow,
      viewZIndex: getComputedStyle(root.querySelector("#view")).zIndex,
      backdropCoversLive: liveHit === root.querySelector(".bubble-backdrop"),
      backdropCoversPopup: popupHit === root.querySelector(".bubble-backdrop"),
      liveCardOnTop:
        liveHit === bubble && liveInnerHit === card,
      popupCardOnTop:
        popupHit === bubble && bubble.shadowRoot.elementFromPoint(422, 195) === card,
      liveFillsViewport: liveEdgeHit === bubble,
      popupFillsViewport: popupEdgeHit === bubble,
      fullscreenRect: {
        left: Math.round(hostRect.left),
        top: Math.round(hostRect.top),
        width: Math.round(hostRect.width),
        height: Math.round(hostRect.height),
      },
    };
    card._isLandscapeViewport = () => false;
    card._updateRotateOverlayState();
    await new Promise((resolve) => setTimeout(resolve, 360));
    return {
      ...active,
      restored: {
        cover: card.classList.contains("mobile-view-rotate-cover"),
        popoverOpen: card.matches(":popover-open"),
        popoverAttribute: card.hasAttribute("popover"),
        transform: getComputedStyle(bubble).transform,
        overflowY: getComputedStyle(bubble).overflowY,
      },
    };
  });

  expect(state.rotationActive).toBe(true);
  expect(state.liveMode).toBe("live");
  expect(state.popupMode).toBe("popup");
  expect(state.liveTopLayer).toBe(true);
  expect(state.popupTopLayer).toBe(true);
  expect(state.liveBubbleTransform).toBe("matrix(1, 0, 0, 1, 0, 0)");
  expect(state.liveBubbleOverflow).toBe("hidden");
  expect(state.backdropCoversLive).toBe(false);
  expect(state.backdropCoversPopup).toBe(false);
  expect(state.liveCardOnTop).toBe(true);
  expect(state.popupCardOnTop).toBe(true);
  expect(state.liveFillsViewport).toBe(true);
  expect(state.popupFillsViewport).toBe(true);
  expect(state.viewZIndex).toBe("auto");
  expect(state.fullscreenRect).toEqual({
    left: 0,
    top: 0,
    width: 844,
    height: 390,
  });
  expect(state.restored).toEqual({
    cover: false,
    popoverOpen: false,
    popoverAttribute: false,
    transform: "matrix(1, 0, 0, 1, 0, 0)",
    overflowY: "hidden",
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

test("language changes update marked card and editor text without replacing media or inputs", async ({ page }) => {
  await page.goto(baseUrl);
  const state = await page.evaluate(async () => {
    await import("/frigate-view-card.js");
    await import("/frigate-view-card-editor.js");

    const card = document.createElement("frigate-view-card");
    card.setConfig({ cameras: [{ entity: "camera.front", name: "Front" }] });
    card._renderShell();
    const liveHost = card.shadowRoot.querySelector("#eng-wrap");
    const alertLabel = card.shadowRoot.querySelector(
      '[data-fvc-i18n="runtime.alerts"]',
    );
    const pageNavButton = card.shadowRoot.querySelector(
      '[data-fvc-i18n-title="runtime.pageNav.singleView"]',
    );
    const fullscreenButton = card.shadowRoot.querySelector("#live-fs-btn");
    card._localization = {
      updateHass: () => true,
      t: (key) => ({
        "runtime.alerts": "Alertes",
        "runtime.stream": "Flux",
        "runtime.pageNav.singleView": "Vue unique",
        "runtime.live.fullscreen": "Plein écran",
        "runtime.live.mute": "Couper le son",
        "runtime.live.unmute": "Rétablir le son",
      })[key] || key,
    };
    card._config = null;
    card.hass = { locale: { language: "fr" } };
    card._renderMuteButton();
    card._pageNavigationController.syncPageNavShell();

    const editor = document.createElement("frigate-view-card-editor");
    document.body.append(editor);
    editor.setConfig({ cameras: [{ entity: "camera.front", name: "Front" }] });
    editor.hass = { locale: { language: "en" }, states: {}, themes: {} };
    const titleInput = editor.querySelector("#title");
    editor._localization = {
      updateHass: () => true,
      t: (key) => ({
        "editor.title": "Titre",
        "editor.subtitle": "Sous-titre",
        "editor.display": "Afficher",
        "editor.eventHistoryDays": "Jours d'historique",
        "editor.alertReviewHistoryDays": "Jours d'alertes",
        "editor.grid.dragToReorder": "Réordonner",
      })[key] || key,
    };
    editor.hass = { locale: { language: "fr" }, states: {}, themes: {} };

    return {
      cardAlertText: alertLabel.textContent,
      cardLiveHostPreserved: card.shadowRoot.querySelector("#eng-wrap") === liveHost,
      pageNavRegenerated: card.shadowRoot.querySelector(
        '[data-fvc-i18n-title="runtime.pageNav.singleView"]',
      ) !== pageNavButton,
      pageNavTitle: card.shadowRoot.querySelector(
        '[data-fvc-i18n-title="runtime.pageNav.singleView"]',
      )?.title,
      fullscreenButtonPreserved: card.shadowRoot.querySelector("#live-fs-btn") === fullscreenButton,
      fullscreenButtonTitle: fullscreenButton?.title,
      muteButtonTitle: card.shadowRoot.querySelector("#mute-btn")?.title,
      editorTitle: editor.querySelector("#title").getAttribute("label"),
      editorDisplay: editor.querySelector('[data-fvc-i18n="editor.display"]').textContent,
      editorInputPreserved: editor.querySelector("#title") === titleInput,
      editorDragTitle: editor.querySelector(".cam-drag")?.title,
    };
  });

  expect(state).toEqual({
    cardAlertText: "Alertes",
    cardLiveHostPreserved: true,
    pageNavRegenerated: true,
    pageNavTitle: "Vue unique",
    fullscreenButtonPreserved: true,
    fullscreenButtonTitle: "Plein écran",
    muteButtonTitle: "Rétablir le son",
    editorTitle: "Titre",
    editorDisplay: "Afficher",
    editorInputPreserved: true,
    editorDragTitle: "Réordonner",
  });
});

test("two-way talk labels and feedback relocalize without replacing controls or live", async ({ page }) => {
  await page.goto(baseUrl);
  const state = await page.evaluate(async () => {
    await import("/frigate-view-card.js");
    const card = document.createElement("frigate-view-card");
    card.setConfig({ cameras: [{ entity: "camera.front", two_way_talk: true }] });
    card._pageId = "single-view";
    card._renderShell();
    const root = card.shadowRoot;
    const live = root.querySelector("#live-stage");
    const video = document.createElement("video");
    live.append(video);
    const talk = root.querySelector("#two-way-talk-btn");
    const microphone = root.querySelector("#two-way-talk-microphone-mute-btn");
    card._showTwoWayTalkResultBubble(true);
    const bubble = root.querySelector(".two-way-talk-result-bubble");
    const english = card._localization;
    const phrases = {
      "runtime.twoWayTalk.enable": "Activer la conversation",
      "runtime.twoWayTalk.cancelConnection": "Annuler la connexion",
      "runtime.twoWayTalk.disable": "Arrêter la conversation",
      "runtime.twoWayTalk.endMuted": "Terminer (micro coupé)",
      "runtime.twoWayTalk.muteMicrophone": "Couper le microphone",
      "runtime.twoWayTalk.unmuteMicrophone": "Activer le microphone",
      "runtime.twoWayTalk.connected": "Conversation connectée",
      "runtime.twoWayTalk.failed": "Échec de la connexion",
    };
    card._localization = {
      updateHass: () => true,
      t: (key, values = {}) => phrases[key] || english.t(key, values),
    };
    const config = card._config;
    card._config = null;
    card.hass = { locale: { language: "fr" } };
    card._config = config;
    const initial = talk?.getAttribute("aria-label");
    const success = bubble?.textContent;
    card._syncTwoWayTalkSoundwaveSurface = () => {};
    card._renderMuteButton = () => {};
    card._syncToolbarButtons = () => {};
    card._dismissLinkedLightDimmers = () => {};
    card._twoWayTalkStarting = true;
    card._syncTwoWayTalkButton();
    const connecting = talk.getAttribute("aria-label");
    card._twoWayTalkStarting = false;
    let muted = false;
    card._twoWayTalkActiveForCurrentCamera = () => true;
    card._twoWayTalkMicrophoneMutedForCurrentCamera = () => muted;
    card._syncTwoWayTalkButton();
    const active = talk.getAttribute("aria-label");
    const mute = microphone.getAttribute("aria-label");
    muted = true;
    card._syncTwoWayTalkButton();
    const activeMuted = talk.getAttribute("aria-label");
    const unmute = microphone.getAttribute("aria-label");
    const bubblePreserved = root.querySelector(".two-way-talk-result-bubble") === bubble;
    card._showTwoWayTalkResultBubble(false);
    const failure = root.querySelector(".two-way-talk-result-bubble")?.textContent;
    card._clearTwoWayTalkResultBubble();
    return {
      initial,
      connecting,
      active,
      mute,
      activeMuted,
      unmute,
      success,
      failure,
      bubblePreserved,
      talkPreserved: root.querySelector("#two-way-talk-btn") === talk,
      microphonePreserved: root.querySelector("#two-way-talk-microphone-mute-btn") === microphone,
      livePreserved: root.querySelector("#live-stage video") === video,
    };
  });

  expect(state).toEqual({
    initial: "Activer la conversation",
    connecting: "Annuler la connexion",
    active: "Arrêter la conversation",
    mute: "Couper le microphone",
    activeMuted: "Terminer (micro coupé)",
    unmute: "Activer le microphone",
    success: "Conversation connectée",
    failure: "Échec de la connexion",
    bubblePreserved: true,
    talkPreserved: true,
    microphonePreserved: true,
    livePreserved: true,
  });
});

test("toast feedback relocalizes in place and clears markers for plain status messages", async ({ page }) => {
  await page.goto(baseUrl);
  const state = await page.evaluate(async () => {
    await import("/frigate-view-card.js");
    const card = document.createElement("frigate-view-card");
    card.setConfig({ cameras: [{ entity: "camera.front" }] });
    card._renderShell();
    const root = card.shadowRoot;
    const toast = root.querySelector("#toast");
    card._toast("Added to Favorites", {
      duration: 10000,
      tone: "success",
      localizationKey: "runtime.notifications.favoritesAdded",
    });
    const english = toast.textContent;
    const original = card._localization;
    const phrases = {
      "runtime.notifications.favoritesAdded": "Ajouté aux favoris",
      "runtime.notifications.pipUnsupported": "Incrustation indisponible",
      "runtime.notifications.pipStartFailedWithReason": "Impossible de démarrer : {reason}",
    };
    card._localization = {
      updateHass: () => true,
      t: (key, values = {}) => (phrases[key] || original.t(key, values)).replace(
        /\{(\w+)\}/g,
        (token, name) => values[name] ?? token,
      ),
    };
    const config = card._config;
    card._config = null;
    card.hass = { locale: { language: "fr" } };
    card._config = config;
    const translated = toast.textContent;
    card._syncPictureInPictureButtons = () => {};
    card._isFirefox = () => false;
    await card._togglePictureInPicture({
      ownerDocument: { pictureInPictureEnabled: true },
      getRootNode: () => null,
      requestPictureInPicture: async () => { throw new Error("blocked"); },
    });
    const withReason = toast.textContent;
    const storedValues = toast.getAttribute("data-fvc-i18n-values");
    await card._togglePictureInPicture(null);
    const unsupported = toast.textContent;
    card._toast("Status supplied by an integration", { duration: 10000 });
    const plain = toast.textContent;
    const markerCleared = !toast.hasAttribute("data-fvc-i18n") &&
      !toast.hasAttribute("data-fvc-i18n-values");
    card._config = null;
    card.hass = { locale: { language: "fr-CA" } };
    card._config = config;
    const plainAfterLanguageChange = toast.textContent;
    const toastPreserved = root.querySelector("#toast") === toast;
    clearTimeout(card._toastT);
    return {
      english,
      translated,
      withReason,
      storedValues,
      unsupported,
      plain,
      markerCleared,
      plainAfterLanguageChange,
      toastPreserved,
    };
  });

  expect(state).toEqual({
    english: "Added to Favorites",
    translated: "Ajouté aux favoris",
    withReason: "Impossible de démarrer : blocked",
    storedValues: '{"reason":"blocked"}',
    unsupported: "Incrustation indisponible",
    plain: "Status supplied by an integration",
    markerCleared: true,
    plainAfterLanguageChange: "Status supplied by an integration",
    toastPreserved: true,
  });
});

test("runtime camera status and rebuilt picker remain localized without remounting live", async ({ page }) => {
  await page.goto(baseUrl);
  const state = await page.evaluate(async () => {
    await import("/frigate-view-card.js");
    const translations = {
      "runtime.live.live": "DIRECT",
      "runtime.live.liveTile": "DIRECT",
      "runtime.live.liveStatus": "Statut du direct",
      "runtime.live.loading": "Chargement…",
      "runtime.live.connecting": "Connexion…",
      "runtime.live.cameraSnapshot": "Instantané caméra",
      "runtime.live.offline": "Hors ligne",
      "runtime.live.cameraOffline": "Caméra hors ligne",
      "runtime.pageNav.backToPreview": "Retour",
      "runtime.pageNav.backToSingleView": "Retour",
      "runtime.stream": "Flux",
    };
    const translate = (key, values = {}) => key === "runtime.live.nextSlide"
      ? `Diapo suivante : ${values.seconds}s`
      : translations[key] || key;

    const mobile = document.createElement("frigate-view-card");
    document.body.append(mobile);
    mobile.setConfig({
      cameras: [{ entity: "camera.front", name: "Front" }],
      mobile_view_page_enabled: true,
    });
    mobile._pageId = "mobile-view";
    mobile._renderShell();
    const mobileLive = mobile.shadowRoot.querySelector("#eng-wrap");
    const mobileConfig = mobile._config;
    mobile._localization = { updateHass: () => true, t: translate };
    mobile._config = null;
    mobile.hass = { locale: { language: "fr" } };
    mobile._config = mobileConfig;
    mobile._mobileViewPageController.renderCamSwitcher();
    mobile._setStreamLoading(true);
    mobile._clearSlideshowCountdownOverlay();

    const single = document.createElement("frigate-view-card");
    document.body.append(single);
    single.setConfig({ cameras: [{ entity: "camera.front", name: "Front" }] });
    single._renderShell();
    const singleLive = single.shadowRoot.querySelector("#eng-wrap");
    single._hass = { states: { "camera.front": { state: "unavailable" } } };
    single._singleViewPageController.syncStatus();
    const singleConfig = single._config;
    single._localization = { updateHass: () => true, t: translate };
    single._config = null;
    single.hass = { locale: { language: "fr" } };
    single._config = singleConfig;
    single._singleViewPageController.syncStatus();

    return {
      mobileLivePreserved: mobile.shadowRoot.querySelector("#eng-wrap") === mobileLive,
      stream: mobile.shadowRoot.querySelector(".mobile-cam-picker__stream .sl")?.textContent,
      liveTile: mobile.shadowRoot.querySelector(".mobile-cam-picker__live-label")?.textContent,
      statusAria: mobile.shadowRoot.querySelector(".mobile-cam-picker__status")?.getAttribute("aria-label"),
      backTitle: mobile.shadowRoot.querySelector("[data-page-back]")?.title,
      loading: mobile.shadowRoot.querySelector("#stream-loading .label")?.textContent,
      connecting: mobile.shadowRoot.querySelector("#eng-wrap .ph span")?.textContent,
      snapshotAlt: mobile.shadowRoot.querySelector("#stream-fallback-img")?.alt,
      countdown: mobile.shadowRoot.querySelector("#slideshow-next-chip")?.textContent,
      singleLivePreserved: single.shadowRoot.querySelector("#eng-wrap") === singleLive,
      offline: single.shadowRoot.querySelector("#on-lbl")?.textContent,
      offlineAria: single.shadowRoot.querySelector("[data-single-view-live-badge]")?.getAttribute("aria-label"),
      singleBadge: single.shadowRoot.querySelector("[data-single-view-live-badge] span[data-fvc-i18n]")?.textContent,
    };
  });

  expect(state).toEqual({
    mobileLivePreserved: true,
    stream: "Flux",
    liveTile: "DIRECT",
    statusAria: "Statut du direct",
    backTitle: "Retour",
    loading: "Chargement…",
    connecting: "Connexion…",
    snapshotAlt: "Instantané caméra",
    countdown: "Diapo suivante : 0s",
    singleLivePreserved: true,
    offline: "Hors ligne",
    offlineAria: "Caméra hors ligne",
    singleBadge: "DIRECT",
  });
});

test("browse filters and calendar localize in place and after rebuilding", async ({ page }) => {
  await page.goto(baseUrl);
  const state = await page.evaluate(async () => {
    await import("/frigate-view-card.js");
    const card = document.createElement("frigate-view-card");
    document.body.append(card);
    card.setConfig({ cameras: [{ entity: "camera.front", name: "Front" }] });
    card._renderShell();
    card._calMonth = new Date(Date.UTC(2026, 7, 15, 12));
    card._calSelectedDay = "2026-08-05";
    card._browseFilterController.renderFilter();
    card._browseCalendarPanelController.renderCal();

    const root = card.shadowRoot;
    const live = root.querySelector("#eng-wrap");
    const filter = root.querySelector("#filter-panel");
    const calendar = root.querySelector("#cal-panel");
    const filterLabel = filter.querySelector('[data-fvc-i18n="runtime.browse.filter.label"]');
    const reset = calendar.querySelector("[data-cal-reset]");
    const month = calendar.querySelector("[data-fvc-calendar-month]");
    const translations = {
      "runtime.browse.filter.label": "Étiquette",
      "runtime.browse.filter.zone": "Zone",
      "runtime.browse.filter.show": "Afficher",
      "runtime.browse.filter.all": "Tous",
      "runtime.browse.filter.favorites": "★ Favoris",
      "runtime.browse.resetCalendar": "Réinitialiser",
      "runtime.browse.weekdays.monday": "L",
      "runtime.browse.previousMonth": "Mois précédent",
      "runtime.browse.previousDay": "Jour précédent",
      "runtime.browse.top": "Haut",
    };
    const config = card._config;
    card._localization = {
      resolvedLanguage: "fr",
      updateHass: () => true,
      t: (key) => translations[key] || key,
    };
    card._config = null;
    card.hass = { locale: { language: "fr" } };
    card._config = config;
    const translatedInPlace = {
      livePreserved: root.querySelector("#eng-wrap") === live,
      filterLabelPreserved: filter.querySelector('[data-fvc-i18n="runtime.browse.filter.label"]') === filterLabel,
      resetPreserved: calendar.querySelector("[data-cal-reset]") === reset,
      monthPreserved: calendar.querySelector("[data-fvc-calendar-month]") === month,
      label: filterLabel.textContent,
      reset: reset.textContent,
      month: month.textContent,
      previousDay: root.querySelector("#rec-day-prev")?.title,
      top: root.querySelector("#browse-return-top span")?.textContent,
    };
    card._browseFilterController.renderFilter();
    card._browseCalendarPanelController.renderCal();
    return {
      translatedInPlace,
      rebuiltLabel: filter.querySelector('[data-fvc-i18n="runtime.browse.filter.label"]')?.textContent,
      rebuiltAll: filter.querySelector('[data-flabel="all"]')?.textContent,
      rebuiltReset: calendar.querySelector("[data-cal-reset]")?.textContent,
      rebuiltMonth: calendar.querySelector("[data-fvc-calendar-month]")?.textContent,
      rebuiltMonday: calendar.querySelector('[data-fvc-i18n="runtime.browse.weekdays.monday"]')?.textContent,
      rebuiltMonthAria: calendar.querySelector('[data-cal-nav="-1"]')?.getAttribute("aria-label"),
    };
  });

  expect(state).toEqual({
    translatedInPlace: {
      livePreserved: true,
      filterLabelPreserved: true,
      resetPreserved: true,
      monthPreserved: true,
      label: "Étiquette",
      reset: "Réinitialiser",
      month: "août 2026",
      previousDay: "Jour précédent",
      top: "Haut",
    },
    rebuiltLabel: "Étiquette",
    rebuiltAll: "Tous",
    rebuiltReset: "Réinitialiser",
    rebuiltMonth: "août 2026",
    rebuiltMonday: "L",
    rebuiltMonthAria: "Mois précédent",
  });
});

test("browse empty states localize in place and after switching tabs", async ({ page }) => {
  await page.goto(baseUrl);
  const state = await page.evaluate(async () => {
    await import("/frigate-view-card.js");
    const card = document.createElement("frigate-view-card");
    document.body.append(card);
    card.setConfig({ cameras: [{ entity: "camera.front", name: "Front" }] });
    card._renderShell();
    card._tab = "kept";
    card._renderList();

    const list = card.shadowRoot.querySelector("#list");
    const empty = list.querySelector(".empty");
    const live = card.shadowRoot.querySelector("#eng-wrap");
    const translations = {
      "runtime.browse.noFavorites": "Aucun favori",
      "runtime.browse.favoriteHint": "Ajoutez un événement aux favoris",
      "runtime.browse.favorites": "Favoris",
      "runtime.browse.noAlerts": "Aucune alerte",
      "runtime.browse.recentAlerts": "Alertes récentes",
      "runtime.browse.noRecordings": "Aucun enregistrement",
      "runtime.browse.recordings": "Enregistrements",
      "runtime.browse.datedHeading": "{title} · {date}",
    };
    const config = card._config;
    card._localization = {
      updateHass: () => true,
      t: (key, values = {}) => (translations[key] || key).replace(
        /\{(\w+)\}/g,
        (_, name) => String(values[name] || ""),
      ),
    };
    card._config = null;
    card.hass = { locale: { language: "fr" } };
    card._config = config;

    const inPlace = {
      emptyPreserved: list.querySelector(".empty") === empty,
      livePreserved: card.shadowRoot.querySelector("#eng-wrap") === live,
      message: empty.querySelector("span")?.textContent,
      hint: empty.querySelectorAll("span")[1]?.textContent,
    };
    card._renderList();
    const afterRefresh = list.querySelector(".empty") === empty;
    card._tab = "alerts";
    card._activeCam.alerts_content = "alerts_only";
    card._renderList();
    const alerts = list.querySelector(".empty")?.textContent;
    const alertsHeading = card.shadowRoot.querySelector("#browse-head-label")?.textContent;
    card._tab = "recordings";
    card._renderList();

    return {
      inPlace,
      afterRefresh,
      alerts,
      alertsHeading,
      recordings: list.querySelector(".empty")?.textContent,
    };
  });

  expect(state).toEqual({
    inPlace: {
      emptyPreserved: true,
      livePreserved: true,
      message: "Aucun favori",
      hint: "Ajoutez un événement aux favoris",
    },
    afterRefresh: true,
    alerts: "Aucune alerte",
    alertsHeading: "Alertes récentes",
    recordings: "Aucun enregistrement",
  });
});

test("browse row language changes preserve event, review, and recording nodes", async ({ page }) => {
  await page.goto(baseUrl);
  const state = await page.evaluate(async () => {
    await import("/frigate-view-card.js");
    const card = document.createElement("frigate-view-card");
    document.body.append(card);
    card.setConfig({ cameras: [{ entity: "camera.front", name: "Front" }] });
    card._renderShell();
    card._tab = "clips";
    card._mediaForCamera = () => "data:image/gif;base64,R0lGODlhAQABAAAAACw=";
    card._media = () => "data:image/gif;base64,R0lGODlhAQABAAAAACw=";
    card._reviewThumbnailForCamera = () => "";
    const event = {
      id: "event-1",
      camera: "front_door",
      label: "person",
      start_time: 1723000000,
      end_time: 1723000010,
      has_clip: true,
      has_snapshot: true,
    };
    card._browseFilterController.reviewSourceEvent = () => event;
    const review = {
      id: "review-1",
      camera: "front_door",
      severity: "alert",
      start_time: 1723000000,
      data: { detections: ["event-1"], objects: ["person", "car", "dog"] },
    };
    const list = card.shadowRoot.querySelector("#list");
    list.innerHTML = card._eventCardHTML(event, false)
      + card._reviewListItemHTML(review)
      + card._recordingsListMarkup([{
        start_time: 1723000000,
        end_time: 1723000050,
        events: 2,
        _fvc_group_member: "Garage",
      }]);
    const eventRow = list.querySelector('[data-ev="event-1"]');
    const reviewRow = list.querySelector('[data-review-id="review-1"]');
    const recordingRow = list.querySelector("[data-rs]");
    const thumbnail = eventRow.querySelector("img");
    const translations = {
      "runtime.browse.row.clips": "Vidéos",
      "runtime.browse.row.favorite": "Favori",
      "runtime.browse.row.downloadClip": "Télécharger la vidéo",
      "runtime.browse.row.viewSnapshot": "Voir l’image",
      "runtime.browse.row.alert": "Alerte",
      "runtime.browse.row.oneMoreObject": "Encore {count} objet",
      "runtime.browse.row.eventAbbreviation": "év.",
      "runtime.browse.row.downloadRecordingFromCamera": "Télécharger depuis {camera}",
    };
    const config = card._config;
    card._localization = {
      updateHass: () => true,
      t: (key, values = {}) => (translations[key] || key).replace(
        /\{(\w+)\}/g,
        (_, name) => String(values[name] ?? ""),
      ),
    };
    card._config = null;
    card.hass = { locale: { language: "fr" } };
    card._config = config;

    return {
      eventPreserved: list.querySelector('[data-ev="event-1"]') === eventRow,
      reviewPreserved: list.querySelector('[data-review-id="review-1"]') === reviewRow,
      recordingPreserved: list.querySelector("[data-rs]") === recordingRow,
      thumbnailPreserved: eventRow.querySelector("img") === thumbnail,
      clip: eventRow.querySelector('[data-fvc-i18n="runtime.browse.row.clips"]')?.textContent,
      download: eventRow.querySelector('[data-dl-file="clip.mp4"]')?.title,
      severity: reviewRow.querySelector('[data-fvc-i18n="runtime.browse.row.alert"]')?.textContent,
      objects: [...reviewRow.querySelectorAll(".review-object-tag")].map((tag) => tag.textContent),
      overflow: reviewRow.querySelector(".review-object-overflow")?.title,
      recordingCount: recordingRow.querySelector('[data-fvc-i18n="runtime.browse.row.eventAbbreviation"]')?.textContent,
      recordingDownload: recordingRow.querySelector("[data-rec-dl-start]")?.title,
    };
  });

  expect(state).toEqual({
    eventPreserved: true,
    reviewPreserved: true,
    recordingPreserved: true,
    thumbnailPreserved: true,
    clip: "Vidéos",
    download: "Télécharger la vidéo",
    severity: "Alerte",
    objects: ["Person", "Car", "Dog", "Person", "Car"],
    overflow: "Encore 1 objet",
    recordingCount: "év.",
    recordingDownload: "Télécharger depuis Garage",
  });
});

test("popup controls and segment guidance localize without remounting media", async ({ page }) => {
  await page.goto(baseUrl);
  const state = await page.evaluate(async () => {
    await import("/frigate-view-card.js");
    const card = document.createElement("frigate-view-card");
    document.body.append(card);
    card.setConfig({ cameras: [{ entity: "camera.front", name: "Front" }] });
    card._renderShell();
    const root = card.shadowRoot;
    const viewer = root.querySelector("#viewer");
    const video = document.createElement("video");
    viewer.append(video);
    const popup = root.querySelector("#myPopup");
    const play = root.querySelector("#popup-media-play");
    const airplay = root.querySelector("#popup-media-airplay");
    const progress = root.querySelector("#popup-media-progress");
    const manager = root.querySelector("#recording-segment-manager");
    progress.value = "417";
    airplay.dataset.playbackBaseTitle = "AirPlay video";
    manager.hidden = false;
    const translations = {
      "runtime.popup.close": "Fermer",
      "runtime.popup.playPause": "Lecture/Pause",
      "runtime.popup.mediaProgress": "Progression",
      "runtime.popup.airplayVideo": "Diffuser la vidéo",
      "runtime.popup.segment.select": "Choisir un segment",
      "runtime.popup.segment.guidance": "Déplacez les poignées pour choisir la partie à conserver.",
      "runtime.popup.segment.reset": "Réinitialiser",
      "runtime.popup.segment.previewTitle": "Aperçu du segment",
      "runtime.popup.segment.preparingPreview": "Préparation de l’aperçu…",
    };
    const config = card._config;
    card._localization = {
      updateHass: () => true,
      t: (key) => translations[key] || key,
    };
    card._config = null;
    card.hass = { locale: { language: "fr" } };
    card._config = config;
    card._syncPlaybackTargetButtons();

    return {
      popupPreserved: root.querySelector("#myPopup") === popup,
      videoPreserved: root.querySelector("#viewer video") === video,
      playPreserved: root.querySelector("#popup-media-play") === play,
      managerStillOpen: !manager.hidden,
      progressValue: progress.value,
      closeLabel: root.querySelector("#close-btn")?.getAttribute("aria-label"),
      playTitle: play.title,
      airplayTitleAfterSync: airplay.title,
      progressLabel: progress.getAttribute("aria-label"),
      segmentHeading: manager.querySelector("strong")?.textContent,
      segmentGuidance: manager.querySelector(".recording-segment-manager-copy span")?.textContent,
      reset: root.querySelector("#recording-segment-reset span")?.textContent,
      previewTitle: root.querySelector("#recording-segment-preview-title")?.textContent,
      previewStatus: root.querySelector("#recording-segment-preview-status")?.textContent,
    };
  });

  expect(state).toEqual({
    popupPreserved: true,
    videoPreserved: true,
    playPreserved: true,
    managerStillOpen: true,
    progressValue: "417",
    closeLabel: "Fermer",
    playTitle: "Lecture/Pause",
    airplayTitleAfterSync: "Diffuser la vidéo",
    progressLabel: "Progression",
    segmentHeading: "Choisir un segment",
    segmentGuidance: "Déplacez les poignées pour choisir la partie à conserver.",
    reset: "Réinitialiser",
    previewTitle: "Aperçu du segment",
    previewStatus: "Préparation de l’aperçu…",
  });
});

test("popup metadata and unavailable-media copy localize in place", async ({ page }) => {
  await page.goto(baseUrl);
  const state = await page.evaluate(async () => {
    await import("/frigate-view-card.js");
    const card = document.createElement("frigate-view-card");
    document.body.append(card);
    card.setConfig({ cameras: [{ entity: "camera.front", name: "Front" }] });
    card._renderShell();
    const root = card.shadowRoot;
    const viewer = root.querySelector("#viewer");
    const video = document.createElement("video");
    viewer.append(video);
    const event = {
      id: "event-1",
      camera: "front",
      label: "person",
      start_time: 100,
      has_clip: true,
      has_snapshot: true,
    };
    card._popupInfoController.render(event, { mediaType: "clip" });
    const info = root.querySelector("#popup-info");
    const cameraLabel = info.querySelector('[data-fvc-i18n="runtime.popup.info.camera"]');
    const download = info.querySelector('[data-dl-file="clip.mp4"]');
    const translations = {
      "runtime.popup.info.clip": "Vidéo",
      "runtime.popup.info.camera": "Caméra",
      "runtime.popup.info.downloadClip": "Télécharger la vidéo",
      "runtime.popup.info.addFavorite": "Ajouter aux favoris",
      "runtime.popup.info.removeFavorite": "Retirer des favoris",
      "runtime.popup.mediaUnavailable": "Média indisponible",
      "runtime.popup.mediaUnavailableDetail": "La vidéo et l’image sont indisponibles.",
      "runtime.popup.retentionDetail": "Vérifiez la durée de conservation.",
    };
    const config = card._config;
    card._localization = {
      updateHass: () => true,
      t: (key) => translations[key] || key,
    };
    card._popupInfoController._t = card._localization.t;
    card._config = null;
    card.hass = { locale: { language: "fr" } };
    card._config = config;
    const infoState = {
      videoPreserved: viewer.querySelector("video") === video,
      cameraLabelPreserved: info.querySelector('[data-fvc-i18n="runtime.popup.info.camera"]') === cameraLabel,
      downloadPreserved: info.querySelector('[data-dl-file="clip.mp4"]') === download,
      cameraLabel: cameraLabel.textContent,
      headingStartsLocalized: info.querySelector(".popup-info-head-text")?.textContent.startsWith("Vidéo - Front - "),
      downloadTitle: download.title,
      objectLabel: info.querySelector(".popup-info-title .tb")?.textContent,
    };

    card._popupInfoController.render(event, {
      mediaType: "clip",
      presentation: "card-view-drawer",
    });
    const favorite = root.querySelector("#popup-card-view-actions [data-popup-favorite]");
    const favoriteBefore = favorite.title;
    card._popupInfoController._syncFavoriteAction(favorite, true);
    const favoriteAfter = favorite.title;

    card._popupMediaLoaderController.showUnavailableMedia(event, {
      mediaType: "clip",
    }, { unavailableType: "media", hasClip: false });
    const unavailable = viewer.querySelector(".popup-media-unavailable");
    const unavailableTitle = unavailable?.querySelector("strong");
    const fallbackBefore = unavailableTitle?.textContent;
    translations["runtime.popup.mediaUnavailable"] = "Support manquant";
    card._config = null;
    card.hass = { locale: { language: "fr-CA" } };
    card._config = config;
    return {
      infoState,
      favoriteBefore,
      favoriteAfter,
      favoriteKey: favorite.getAttribute("data-fvc-i18n-title"),
      unavailablePreserved: viewer.querySelector(".popup-media-unavailable") === unavailable,
      fallbackBefore,
      fallbackAfter: unavailableTitle?.textContent,
      fallbackDetail: unavailable?.querySelectorAll("span")[0]?.textContent,
      retentionDetail: unavailable?.querySelectorAll("span")[1]?.textContent,
    };
  });

  expect(state).toEqual({
    infoState: {
      videoPreserved: true,
      cameraLabelPreserved: true,
      downloadPreserved: true,
      cameraLabel: "Caméra",
      headingStartsLocalized: true,
      downloadTitle: "Télécharger la vidéo",
      objectLabel: "Person",
    },
    favoriteBefore: "Ajouter aux favoris",
    favoriteAfter: "Retirer des favoris",
    favoriteKey: "runtime.popup.info.removeFavorite",
    unavailablePreserved: true,
    fallbackBefore: "Média indisponible",
    fallbackAfter: "Support manquant",
    fallbackDetail: "La vidéo et l’image sont indisponibles.",
    retentionDetail: "Vérifiez la durée de conservation.",
  });
});

test("Card View drawers and mode labels localize without remounting live media", async ({ page }) => {
  await page.goto(baseUrl);
  const state = await page.evaluate(async () => {
    await import("/frigate-view-card.js");
    const translations = {
      "runtime.cardView.alerts": "Alertes",
      "runtime.cardView.clips": "Vidéos",
      "runtime.cardView.showRecordings": "Voir les enregistrements",
      "runtime.cardView.gotoRecordings": "Aller aux enregistrements",
      "runtime.cardView.showRecentAlerts": "Voir les alertes récentes",
      "runtime.cardView.gotoAlerts": "Aller aux alertes",
      "runtime.cardView.showCameraAlerts": "Voir les alertes de {camera}",
      "runtime.cardView.closeActivityDrawer": "Fermer le panneau",
      "runtime.cardView.openActivityDrawer": "Ouvrir le panneau",
      "runtime.cardView.openMediaDrawer": "Ouvrir les médias",
      "runtime.cardView.closeMediaDrawer": "Fermer les médias",
      "runtime.cardView.drawer.noAlerts": "Aucune alerte disponible",
      "runtime.cardView.drawer.noClips": "Aucune vidéo disponible",
    };
    const t = (key, values = {}) => (translations[key] || key).replace(
      /\{(\w+)\}/g,
      (token, name) => values[name] ?? token,
    );
    const switchLanguage = (card) => {
      const config = card._config;
      card._localization = { updateHass: () => true, t };
      card._cardViewPageController._mediaDrawerController._t = t;
      card._config = null;
      card.hass = { locale: { language: "fr" } };
      card._config = config;
    };

    const card = document.createElement("frigate-view-card");
    document.body.append(card);
    card.setConfig({
      cameras: [{ entity: "camera.front", name: "Front" }],
      card_view_page_enabled: true,
      card_view_view_mode: "bottom-panel-open",
    });
    card._pageId = "card-view";
    card._renderShell();
    card._cardViewPageController.renderToolbar();
    const root = card.shadowRoot;
    const live = root.querySelector("#live-stage");
    const video = document.createElement("video");
    live.append(video);
    const swap = root.querySelector("[data-card-view-swap]");
    const activityHandle = root.querySelector("[data-card-view-drawer-toggle]");
    switchLanguage(card);
    const activityBefore = {
      livePreserved: live.querySelector("video") === video,
      swapPreserved: root.querySelector("[data-card-view-swap]") === swap,
      handlePreserved: root.querySelector("[data-card-view-drawer-toggle]") === activityHandle,
      heading: root.querySelector(".card-view-activity-heading")?.textContent,
      swapTitle: swap.title,
      swapText: swap.querySelector(".card-view-mode-switch-label")?.textContent,
      handleTitle: activityHandle.title,
      scopeText: root.querySelector(".card-view-alert-scope-switch .card-view-mode-switch-label")?.textContent,
    };
    card._cardViewPageController.setDrawerOpen(false);
    const closedHandleTitle = activityHandle.title;
    card._cardViewPageController._mode = "recordings";
    card._cardViewPageController.renderToolbar();
    const recordingsModeTitle = root.querySelector("[data-card-view-swap]")?.title;

    const overlay = document.createElement("frigate-view-card");
    document.body.append(overlay);
    overlay.setConfig({
      cameras: [{ entity: "camera.front", name: "Front" }],
      card_view_page_enabled: true,
      card_view_view_mode: "video-only",
      card_view_media_drawer_enabled: true,
    });
    overlay._pageId = "card-view";
    overlay._renderShell();
    const overlayRoot = overlay.shadowRoot;
    const drawer = overlay._cardViewPageController._mediaDrawerController;
    drawer._onOpenChange = () => {};
    drawer._onSelectType = () => {};
    drawer._getEvents = () => [];
    drawer.setOpen(true);
    const mediaHandle = overlayRoot.querySelector("[data-card-view-media-drawer-toggle]");
    const alertsTab = overlayRoot.querySelector('[data-card-view-media-drawer-type="alerts"]');
    const empty = overlayRoot.querySelector(".card-view-media-drawer-empty");
    switchLanguage(overlay);
    const mediaBefore = {
      handlePreserved: overlayRoot.querySelector("[data-card-view-media-drawer-toggle]") === mediaHandle,
      tabPreserved: overlayRoot.querySelector('[data-card-view-media-drawer-type="alerts"]') === alertsTab,
      emptyPreserved: overlayRoot.querySelector(".card-view-media-drawer-empty") === empty,
      handleTitle: mediaHandle.title,
      alertsTab: alertsTab.textContent,
      empty: empty?.textContent,
    };
    drawer.selectType("clips");
    return {
      activityBefore,
      closedHandleTitle,
      recordingsModeTitle,
      mediaBefore,
      clipsTab: overlayRoot.querySelector('[data-card-view-media-drawer-type="clips"]')?.textContent,
      clipsEmpty: overlayRoot.querySelector(".card-view-media-drawer-empty")?.textContent,
    };
  });

  expect(state).toEqual({
    activityBefore: {
      livePreserved: true,
      swapPreserved: true,
      handlePreserved: true,
      heading: "Alertes",
      swapTitle: "Voir les enregistrements",
      swapText: "Aller aux enregistrements",
      handleTitle: "Fermer le panneau",
      scopeText: "Voir les alertes de Front",
    },
    closedHandleTitle: "Ouvrir le panneau",
    recordingsModeTitle: "Voir les alertes récentes",
    mediaBefore: {
      handlePreserved: true,
      tabPreserved: true,
      emptyPreserved: true,
      handleTitle: "Fermer les médias",
      alertsTab: "Alertes",
      empty: "Aucune alerte disponible",
    },
    clipsTab: "Vidéos",
    clipsEmpty: "Aucune vidéo disponible",
  });
});

test("linked-light language and state updates preserve the dimmer and its controls", async ({ page }) => {
  await page.goto(baseUrl);
  const state = await page.evaluate(async () => {
    await import("/frigate-view-card.js");
    const card = document.createElement("frigate-view-card");
    document.body.append(card);
    const controller = card._linkedLightController;
    const config = { entity: "light.porch" };
    const offState = {
      state: "off",
      attributes: {
        friendly_name: "Porch Light",
        supported_color_modes: ["brightness"],
      },
    };
    card._hass = { states: { "light.porch": offState } };
    const slot = document.createElement("div");
    slot.innerHTML = controller._buildMarkup(config, "icon-btn");
    card.shadowRoot.append(slot);
    const control = slot.querySelector("[data-linked-light]");
    const toggle = control.querySelector("[data-linked-light-toggle]");
    const panel = control.querySelector("[data-linked-light-dimmer-panel]");
    const slider = control.querySelector("[data-linked-light-brightness]");
    const power = control.querySelector("[data-linked-light-power]");
    const close = control.querySelector(".linked-light-dimmer-close");
    const englishLabel = toggle.title;
    const translations = {
      "runtime.linkedLight.toggle.offDimmable": "{name} : éteinte. Allumer. Maintenir pour régler la luminosité",
      "runtime.linkedLight.toggle.onDimmable": "{name} : {percent} %. Éteindre. Maintenir pour régler la luminosité",
      "runtime.linkedLight.powerOn": "Allumer {name} à sa luminosité précédente",
      "runtime.linkedLight.powerOff": "Éteindre {name}",
      "runtime.linkedLight.brightnessFor": "Luminosité de {name}",
      "runtime.linkedLight.closeBrightness": "Fermer le réglage de luminosité",
    };
    card._localization = {
      updateHass: () => true,
      t: (key, values = {}) => (translations[key] || key).replace(
        /\{(\w+)\}/g,
        (token, name) => values[name] ?? token,
      ),
    };
    card.hass = { locale: { language: "fr" } };
    const afterLanguage = {
      toggle: toggle.title,
      panel: panel.getAttribute("aria-label"),
      slider: slider.getAttribute("aria-label"),
      power: power.title,
      close: close.getAttribute("aria-label"),
    };
    controller._patchControl(control, config, {
      state: "on",
      attributes: {
        friendly_name: "Entrée",
        brightness: 128,
        supported_color_modes: ["brightness"],
      },
    });
    return {
      englishLabel,
      afterLanguage,
      afterState: {
        sameControl: slot.querySelector("[data-linked-light]") === control,
        sameToggle: control.querySelector("[data-linked-light-toggle]") === toggle,
        sameSlider: control.querySelector("[data-linked-light-brightness]") === slider,
        toggle: toggle.title,
        panel: panel.getAttribute("aria-label"),
        slider: slider.getAttribute("aria-label"),
        power: power.title,
        sliderValue: slider.value,
      },
    };
  });

  expect(state).toEqual({
    englishLabel: "Porch Light: Off. Turn on. Press and hold to adjust brightness",
    afterLanguage: {
      toggle: "Porch Light : éteinte. Allumer. Maintenir pour régler la luminosité",
      panel: "Luminosité de Porch Light",
      slider: "Luminosité de Porch Light",
      power: "Allumer Porch Light à sa luminosité précédente",
      close: "Fermer le réglage de luminosité",
    },
    afterState: {
      sameControl: true,
      sameToggle: true,
      sameSlider: true,
      toggle: "Entrée : 50 %. Éteindre. Maintenir pour régler la luminosité",
      panel: "Luminosité de Entrée",
      slider: "Luminosité de Entrée",
      power: "Éteindre Entrée",
      sliderValue: "50",
    },
  });
});

test("Wide View companion and timeline labels follow language and panel state in place", async ({ page }) => {
  await page.goto(baseUrl);
  const state = await page.evaluate(async () => {
    await import("/frigate-view-card.js");
    const card = document.createElement("frigate-view-card");
    document.body.append(card);
    card.setConfig({
      cameras: [{ entity: "camera.front", name: "Front" }],
      wide_view_page_enabled: true,
      wide_view_timeline_enabled: true,
      wide_view_timeline_default_open: true,
    });
    card._pageId = "wide-view";
    card._renderShell();
    const root = card.shadowRoot;
    const live = root.querySelector("#live-stage");
    const video = document.createElement("video");
    live.append(video);
    const expand = root.querySelector("[data-wide-companion-expand-button]");
    const timelineToggle = root.querySelector("[data-wide-timeline-toggle]");
    const status = root.querySelector(".wide-companion-meta-status .dot");
    const originalT = card._localization.t;
    const translations = {
      "runtime.wideView.companionCameras": "Caméras associées",
      "runtime.wideView.resizeCompanionArea": "Redimensionner les caméras associées",
      "runtime.wideView.expandCompanionCameras": "Développer les caméras associées",
      "runtime.wideView.collapseCompanionCameras": "Réduire les caméras associées",
      "runtime.wideView.timeline.title": "Chronologie",
      "runtime.wideView.timeline.open": "Ouvrir la chronologie",
      "runtime.wideView.timeline.collapse": "Fermer la chronologie",
      "runtime.wideView.timeline.collapseHint": "Glisser pour redimensionner ou cliquer pour fermer",
      "runtime.wideView.timeline.hours": "{count} heures",
      "runtime.wideView.timeline.empty": "Aucun événement dans cette période",
      "runtime.wideView.timeline.playClip": "Lire la vidéo : {label}, {time}",
      "runtime.live.online": "En ligne",
    };
    const t = (key, values = {}) => (translations[key] || originalT(key, values)).replace(
      /\{(\w+)\}/g,
      (token, name) => values[name] ?? token,
    );
    card._localization = { updateHass: () => true, t };
    const config = card._config;
    card._config = null;
    card.hass = { locale: { language: "fr" } };
    card._config = config;
    const translated = {
      livePreserved: live.querySelector("video") === video,
      expandPreserved: root.querySelector("[data-wide-companion-expand-button]") === expand,
      timelinePreserved: root.querySelector("[data-wide-timeline-toggle]") === timelineToggle,
      companionTitle: root.querySelector(".wide-companion-title")?.textContent,
      resizeLabel: root.querySelector("[data-wide-companion-resize-handle]")?.getAttribute("aria-label"),
      expandLabel: expand.getAttribute("aria-label"),
      timelineTitle: root.querySelector(".wide-timeline-heading span")?.textContent,
      statusTitle: status?.title,
    };
    const companion = card._wideViewCompanionController;
    companion._panelExpansionPanel = root.querySelector("#wide-companion-panel");
    companion._panelExpansionHandle = root.querySelector("[data-wide-companion-resize-handle]");
    companion._panelExpansionButton = expand;
    companion._panelExpansionMaxPx = 100;
    companion._setPanelExpansion(40, { scheduleLayout: false });
    const collapsedLabel = expand.getAttribute("aria-label");
    const timeline = card._wideViewTimelineController;
    timeline._open = true;
    timeline._syncPanelState();
    timeline._scaleHours = 6;
    timeline._syncScaleControls();
    timeline.render({ force: true });
    const empty = root.querySelector(".wide-timeline-empty")?.textContent;
    const now = Math.floor(Date.now() / 1000);
    const event = {
      id: "clip-1",
      camera: "front",
      label: "person",
      start_time: now - 50,
      end_time: now - 40,
      has_clip: true,
    };
    timeline._deps.getAllEvents = () => [event];
    timeline._deps.getVisibleEvents = () => [event];
    timeline.render({ force: true });
    return {
      translated,
      collapsedLabel,
      timelineToggleLabel: timelineToggle.getAttribute("aria-label"),
      timelineToggleTitle: timelineToggle.title,
      scale: root.querySelector("#wide-timeline-scale-output")?.textContent,
      empty,
      clipLabel: root.querySelector(".wide-timeline-card-main")?.getAttribute("aria-label"),
      livePreservedAfterState: live.querySelector("video") === video,
    };
  });

  const { clipLabel, ...rest } = state;
  expect(clipLabel).toMatch(/^Lire la vidéo : Person, /);
  expect(rest).toEqual({
    translated: {
      livePreserved: true,
      expandPreserved: true,
      timelinePreserved: true,
      companionTitle: "Caméras associées",
      resizeLabel: "Redimensionner les caméras associées",
      expandLabel: "Développer les caméras associées",
      timelineTitle: "Chronologie",
      statusTitle: "En ligne",
    },
    collapsedLabel: "Réduire les caméras associées",
    timelineToggleLabel: "Fermer la chronologie",
    timelineToggleTitle: "Glisser pour redimensionner ou cliquer pour fermer",
    scale: "6 heures",
    empty: "Aucun événement dans cette période",
    livePreservedAfterState: true,
  });
});

test("shared toolbar stays localized across mode changes and shell refreshes", async ({ page }) => {
  await page.goto(baseUrl);
  const state = await page.evaluate(async () => {
    await import("/frigate-view-card.js");
    const card = document.createElement("frigate-view-card");
    document.body.append(card);
    card.setConfig({
      cameras: [{ entity: "camera.front", name: "Front" }],
      single_view_page_enabled: true,
    });
    card._pageId = "single-view";
    card._renderShell();
    const root = card.shadowRoot;
    const live = root.querySelector("#live-stage");
    const video = document.createElement("video");
    live.append(video);
    let gridActive = false;
    let takeoverActive = false;
    card._isGridModeAvailable = () => true;
    card._isGridSessionActive = () => gridActive;
    card._isSlideshowRotationAvailable = () => true;
    card._isAlertCameraTakeoverAvailable = () => true;
    card._singleViewPageController.isActive = () => true;
    card._singleViewPageController.alertTakeoverEnabled = () => takeoverActive;
    card._mobileViewPageController.shouldShowAlertTakeoverButton = () => false;
    card._syncTabsShell();
    const grid = root.querySelector("#grid-btn");
    const slideshow = root.querySelector("#slideshow-btn");
    const takeover = root.querySelector("#single-alert-takeover-btn");
    const translations = {
      "runtime.toolbar.alerts": "Alertes",
      "runtime.toolbar.favorites": "Favoris",
      "runtime.toolbar.startGrid": "Démarrer la grille",
      "runtime.toolbar.stopGrid": "Arrêter la grille",
      "runtime.toolbar.startSlideshow": "Démarrer le diaporama",
      "runtime.toolbar.stopSlideshow": "Arrêter le diaporama",
      "runtime.toolbar.enableAlertTakeover": "Activer le suivi des alertes",
      "runtime.toolbar.disableAlertTakeover": "Désactiver le suivi des alertes",
      "runtime.toolbar.filter": "Filtrer",
      "runtime.toolbar.calendar": "Calendrier",
    };
    const originalT = card._localization.t;
    card._localization = {
      updateHass: () => true,
      t: (key, values) => translations[key] || originalT(key, values),
    };
    const config = card._config;
    card._config = null;
    card.hass = { locale: { language: "fr" } };
    card._config = config;
    const translated = {
      videoPreserved: live.querySelector("video") === video,
      alerts: root.querySelector('[data-tab="alerts"]')?.title,
      favorites: root.querySelector('[data-tab="kept"]')?.title,
      grid: grid.title,
      slideshow: slideshow.title,
      takeover: takeover.title,
      filter: root.querySelector("#filter-btn")?.getAttribute("aria-label"),
      calendar: root.querySelector("#cal-btn")?.getAttribute("aria-label"),
    };
    gridActive = true;
    takeoverActive = true;
    card._slideshowActive = true;
    card._syncToolbarButtons();
    const changed = {
      gridPreserved: root.querySelector("#grid-btn") === grid,
      slideshowPreserved: root.querySelector("#slideshow-btn") === slideshow,
      takeoverPreserved: root.querySelector("#single-alert-takeover-btn") === takeover,
      grid: grid.title,
      slideshow: slideshow.title,
      takeover: takeover.title,
    };
    card._syncTabsShell();
    return {
      translated,
      changed,
      rebuilt: {
        grid: root.querySelector("#grid-btn")?.title,
        slideshow: root.querySelector("#slideshow-btn")?.title,
        takeover: root.querySelector("#single-alert-takeover-btn")?.title,
        videoPreserved: live.querySelector("video") === video,
      },
    };
  });

  expect(state).toEqual({
    translated: {
      videoPreserved: true,
      alerts: "Alertes",
      favorites: "Favoris",
      grid: "Démarrer la grille",
      slideshow: "Démarrer le diaporama",
      takeover: "Activer le suivi des alertes",
      filter: "Filtrer",
      calendar: "Calendrier",
    },
    changed: {
      gridPreserved: true,
      slideshowPreserved: true,
      takeoverPreserved: true,
      grid: "Arrêter la grille",
      slideshow: "Arrêter le diaporama",
      takeover: "Désactiver le suivi des alertes",
    },
    rebuilt: {
      grid: "Arrêter la grille",
      slideshow: "Arrêter le diaporama",
      takeover: "Désactiver le suivi des alertes",
      videoPreserved: true,
    },
  });
});

test("Single, Wide, and Card View settings localize in place with their choices and guidance", async ({ page }) => {
  await page.goto(baseUrl);
  const state = await page.evaluate(async () => {
    await import("/frigate-view-card-editor.js");
    const editor = document.createElement("frigate-view-card-editor");
    document.body.append(editor);
    editor.setConfig({
      cameras: [{ entity: "camera.front", name: "Front" }],
      single_view_alert_takeover: true,
      wide_view_page_enabled: true,
      wide_view_timeline_enabled: true,
      wide_view_timeline_default_scale: 6,
      card_view_page_enabled: true,
      card_view_view_mode: "bottom-panel-open",
    });
    editor.hass = { locale: { language: "en" }, states: {}, themes: {} };
    const takeover = editor.querySelector("#single_view_alert_takeover");
    const wideScale = editor.querySelector('[name="wide_view_timeline_default_scale"][value="6"]');
    const cardMode = editor.querySelector('[name="card_view_view_mode"][value="bottom-panel-open"]');
    const disabledGrid = editor.querySelector('[name="single_view_start_mode"][value="grid"]');
    const disabledGridLabel = disabledGrid.closest("label");
    editor._setEditorFieldError("#col_left_width_pct", "Select a whole number from 25 to 75.");
    let configChanged = 0;
    editor.addEventListener("config-changed", () => { configChanged += 1; });

    const english = editor._localization;
    const translations = {
      "editor.singleView.startWithAlertTakeover": "Démarrer avec prise en charge",
      "editor.singleView.startModeAria": "Mode initial Vue unique",
      "editor.startMode.heading": "Mode initial",
      "editor.startMode.live": "Direct",
      "editor.startMode.grid": "Grille",
      "editor.startMode.gridDisabledReason": "Activez la grille d'abord.",
      "editor.startMode.gridDisabledAria": "Grille. Activez la grille d'abord.",
      "editor.wideView.enable": "Activer Vue large",
      "editor.wideView.initialTimelineRange": "Plage initiale",
      "editor.wideView.leftColumnWidth": "Largeur gauche",
      "editor.wideView.columnWidthRangeValidation": "Choisir entre {min} et {max}.",
      "editor.duration.hours": "{count} heures",
      "editor.cardView.enable": "Activer Vue carte",
      "editor.cardView.startModeAria": "Mode initial Vue carte",
      "editor.cardView.viewMode": "Mode d'affichage",
      "editor.cardView.bottomPanelOpen": "Panneau ouvert",
      "editor.cardView.standaloneHelp": "Vue carte est la seule page {cardName}.",
    };
    editor._localization = {
      updateHass: () => true,
      t: (key, values = {}) => {
        const phrase = translations[key];
        return phrase
          ? phrase.replace(/\{([A-Za-z][A-Za-z0-9_]*)\}/g, (token, name) =>
            Object.hasOwn(values, name) ? String(values[name]) : token)
          : english.t(key, values);
      },
    };
    editor.hass = { locale: { language: "fr" }, states: {}, themes: {} };

    return {
      takeoverPreserved: editor.querySelector("#single_view_alert_takeover") === takeover,
      takeoverChecked: takeover.hasAttribute("checked"),
      takeoverLabel: editor.querySelector('[data-fvc-i18n="editor.singleView.startWithAlertTakeover"]').textContent,
      singleStartAria: editor.querySelector('[data-fvc-i18n-aria-label="editor.singleView.startModeAria"]').getAttribute("aria-label"),
      startHeading: editor.querySelector('[data-fvc-i18n="editor.startMode.heading"]').textContent,
      liveChoice: editor.querySelector('[name="single_view_start_mode"][value="live"]').getAttribute("aria-label"),
      gridChoice: disabledGrid.getAttribute("aria-label"),
      gridDisabled: disabledGrid.disabled,
      gridTooltip: disabledGridLabel.title,
      gridGuidance: disabledGridLabel.dataset.disabledGuidance,
      wideEnable: editor.querySelector('[data-fvc-i18n="editor.wideView.enable"]').textContent,
      timelineRange: editor.querySelector('[data-fvc-i18n="editor.wideView.initialTimelineRange"]').textContent,
      wideScalePreserved: editor.querySelector('[name="wide_view_timeline_default_scale"][value="6"]') === wideScale,
      wideScaleChecked: wideScale.checked,
      wideScaleLabel: wideScale.getAttribute("aria-label"),
      wideWidthHeading: editor.querySelector('[data-fvc-i18n="editor.wideView.leftColumnWidth"]').textContent,
      wideWidthError: editor.querySelector("#col_left_width_pct-helper").textContent,
      cardEnable: editor.querySelector('[data-fvc-i18n="editor.cardView.enable"]').textContent,
      cardStartAria: editor.querySelector('[data-fvc-i18n-aria-label="editor.cardView.startModeAria"]').getAttribute("aria-label"),
      cardModeHeading: editor.querySelector('[data-fvc-i18n="editor.cardView.viewMode"]').textContent,
      cardModePreserved: editor.querySelector('[name="card_view_view_mode"][value="bottom-panel-open"]') === cardMode,
      cardModeChecked: cardMode.checked,
      cardModeLabel: cardMode.nextElementSibling.textContent,
      standaloneHelp: editor.querySelector('[data-fvc-i18n="editor.cardView.standaloneHelp"]').textContent,
      configChanged,
    };
  });

  expect(state).toMatchObject({
    takeoverPreserved: true,
    takeoverChecked: true,
    takeoverLabel: "Démarrer avec prise en charge",
    singleStartAria: "Mode initial Vue unique",
    startHeading: "Mode initial",
    liveChoice: "Direct",
    gridChoice: "Grille. Activez la grille d'abord.",
    gridDisabled: true,
    gridTooltip: "Activez la grille d'abord.",
    gridGuidance: "Activez la grille d'abord.",
    wideEnable: "Activer Vue large",
    timelineRange: "Plage initiale",
    wideScalePreserved: true,
    wideScaleChecked: true,
    wideScaleLabel: "6 heures",
    wideWidthHeading: "Largeur gauche",
    wideWidthError: "Choisir entre 25 et 75.",
    cardEnable: "Activer Vue carte",
    cardStartAria: "Mode initial Vue carte",
    cardModeHeading: "Mode d'affichage",
    cardModePreserved: true,
    cardModeChecked: true,
    cardModeLabel: "Panneau ouvert",
    standaloneHelp: "Vue carte est la seule page FrigateView.",
    configChanged: 0,
  });
});

test("Mobile, Swipe, and Landing settings localize in place without resetting selectors or ownership notices", async ({ page }) => {
  await page.goto(baseUrl);
  const state = await page.evaluate(async () => {
    await import("/frigate-view-card-editor.js");
    const editor = document.createElement("frigate-view-card-editor");
    document.body.append(editor);
    editor._dashboardNavbarOwnershipState = () => ({
      requested: true,
      isOwner: false,
      locked: true,
      conflict: true,
      owner: {},
      ownerPage: "<Porch>",
      dashboardName: "House",
    });
    editor._dashboardSwipeOwnershipState = () => ({
      requested: true,
      isOwner: false,
      locked: true,
      conflict: true,
      owner: {},
      ownerPage: "<Porch>",
      dashboardName: "House",
    });
    editor.setConfig({
      cameras: [{ entity: "camera.front", name: "Front" }],
      preview_page_enabled: true,
      mobile_view_page_enabled: true,
      wide_view_page_enabled: true,
      card_view_page_enabled: true,
      mobile_view_header_overlay: true,
      landing_page: "preview",
      mobile_page: "preview-mobile-view",
      ha_dashboard_swipe_navigation_owner: true,
      ha_dashboard_swipe_navigation: "dashboard-wide",
    });
    editor.hass = { locale: { language: "en" }, states: {}, themes: {} };
    const overlay = editor.querySelector("#mobile_view_header_overlay");
    const desktopSelector = editor.querySelector("#landing_page");
    const phoneSelector = editor.querySelector("#mobile_page");
    const standaloneSelector = editor.querySelector("#standalone-landing-page");
    const swipeChoice = editor.querySelector('[name="ha_dashboard_swipe_navigation"][value="dashboard-wide"]');
    const swipePage = editor.querySelector('[name="ha_dashboard_swipe_pages"][value="preview"]');
    let configChanged = 0;
    editor.addEventListener("config-changed", () => { configChanged += 1; });

    const english = editor._localization;
    const translations = {
      "editor.mobileView.enable": "Activer Vue mobile",
      "editor.mobileView.headerOverlay": "En-tête superposé",
      "editor.mobileView.navbarOwnerConflict": "Conflit de barre : {dashboard}, puis {page}, pour {cardName}.",
      "editor.swipe.control": "Contrôler le balayage",
      "editor.swipe.dashboardWide": "Tout le tableau",
      "editor.swipe.dashboardWideHelp": "Balayez les pages et {cardName}.",
      "editor.swipe.ownerConflict": "Conflit de balayage : {page} dans {dashboard} pour {cardName}.",
      "editor.swipe.desktopPages": "Pages ordinateur",
      "editor.swipe.phonePages": "Pages téléphone",
      "editor.pageNames.preview": "Aperçu",
      "editor.pageNames.mobile": "Mobile FR",
      "editor.pageNames.previewMobile": "Aperçu + Mobile FR",
      "editor.ownership.page": "Page : {page}",
      "editor.ownership.dashboard": "Tableau : {dashboard}",
      "editor.landing.desktopPage": "Page initiale",
      "editor.landing.phonePage": "Page initiale téléphone",
    };
    editor._localization = {
      updateHass: () => true,
      t: (key, values = {}) => {
        const phrase = translations[key];
        return phrase
          ? phrase.replace(/\{([A-Za-z][A-Za-z0-9_]*)\}/g, (token, name) =>
            Object.hasOwn(values, name) ? String(values[name]) : token)
          : english.t(key, values);
      },
    };
    editor.hass = { locale: { language: "fr" }, states: {}, themes: {} };
    const navbarNotice = editor.querySelector(".navbar-owner-warning");
    const swipeNotice = editor.querySelector(".swipe-owner-warning");
    const optionLabel = (selector, value) => selector.selector.select.options
      .find((option) => option.value === value)?.label;
    return {
      overlayPreserved: editor.querySelector("#mobile_view_header_overlay") === overlay,
      overlayChecked: overlay.hasAttribute("checked"),
      overlayLabel: editor.querySelector('[data-fvc-i18n="editor.mobileView.headerOverlay"]').textContent,
      mobileEnableLabel: editor.querySelector('[data-fvc-i18n="editor.mobileView.enable"]').textContent,
      navbarNotice: navbarNotice.textContent,
      navbarStrong: [...navbarNotice.querySelectorAll("strong")].map((item) => item.textContent),
      swipeNotice: swipeNotice.textContent,
      swipeStrong: [...swipeNotice.querySelectorAll("strong")].map((item) => item.textContent),
      swipeHeading: editor.querySelector('[data-fvc-i18n="editor.swipe.control"]').textContent,
      swipeChoicePreserved: editor.querySelector('[name="ha_dashboard_swipe_navigation"][value="dashboard-wide"]') === swipeChoice,
      swipeChoiceChecked: swipeChoice.checked,
      swipeChoiceLabel: editor.querySelector('[data-fvc-i18n="editor.swipe.dashboardWide"]').textContent,
      swipeChoiceHelp: editor.querySelector('[data-fvc-i18n="editor.swipe.dashboardWideHelp"]').textContent,
      swipePagePreserved: editor.querySelector('[name="ha_dashboard_swipe_pages"][value="preview"]') === swipePage,
      swipePageLabel: swipePage.closest("label").querySelector(".editor-choice-chip-text").textContent,
      desktopGroupAria: editor.querySelector('[data-fvc-i18n-aria-label="editor.swipe.desktopPages"]').getAttribute("aria-label"),
      desktopSelectorPreserved: editor.querySelector("#landing_page") === desktopSelector,
      desktopValue: desktopSelector.value,
      desktopOption: optionLabel(desktopSelector, "preview"),
      phoneSelectorPreserved: editor.querySelector("#mobile_page") === phoneSelector,
      phoneValue: phoneSelector.value,
      phoneOption: optionLabel(phoneSelector, "preview-mobile-view"),
      standaloneSelectorPreserved: editor.querySelector("#standalone-landing-page") === standaloneSelector,
      standaloneOption: optionLabel(standaloneSelector, "preview"),
      desktopLandingHeading: editor.querySelector('[data-fvc-i18n="editor.landing.desktopPage"]').textContent,
      phoneLandingHeading: editor.querySelector('[data-fvc-i18n="editor.landing.phonePage"]').textContent,
      configChanged,
    };
  });

  expect(state).toMatchObject({
    overlayPreserved: true,
    overlayChecked: true,
    overlayLabel: "En-tête superposé",
    mobileEnableLabel: "Activer Vue mobile",
    navbarNotice: "Conflit de barre : Tableau : House, puis Page : <Porch>, pour FrigateView Card.",
    navbarStrong: ["Tableau : House", "Page : <Porch>"],
    swipeNotice: "Conflit de balayage : Page : <Porch> dans Tableau : House pour FrigateView Card.",
    swipeStrong: ["Page : <Porch>", "Tableau : House"],
    swipeHeading: "Contrôler le balayage",
    swipeChoicePreserved: true,
    swipeChoiceChecked: true,
    swipeChoiceLabel: "Tout le tableau",
    swipeChoiceHelp: "Balayez les pages et FrigateView.",
    swipePagePreserved: true,
    swipePageLabel: "Aperçu",
    desktopGroupAria: "Pages ordinateur",
    desktopSelectorPreserved: true,
    desktopValue: "preview",
    desktopOption: "Aperçu",
    phoneSelectorPreserved: true,
    phoneValue: "preview-mobile-view",
    phoneOption: "Aperçu + Mobile FR",
    standaloneSelectorPreserved: true,
    standaloneOption: "Aperçu",
    desktopLandingHeading: "Page initiale",
    phoneLandingHeading: "Page initiale téléphone",
    configChanged: 0,
  });
});

test("General Settings language changes preserve form state and localize status, choices, and links", async ({ page }) => {
  await page.goto(baseUrl);
  const state = await page.evaluate(async () => {
    await import("/frigate-view-card-editor.js");
    const editor = document.createElement("frigate-view-card-editor");
    document.body.append(editor);
    editor.setConfig({ cameras: [{ entity: "camera.front", name: "Front" }] });
    const hass = {
      locale: { language: "en" },
      themes: {},
      config: { version: "2026.8.4", components: ["frigate"] },
      states: {
        "update.frigateview_card_update": {
          state: "on",
          attributes: { title: "FrigateView Card", latest_version: "1.2.0" },
        },
      },
    };
    editor.hass = hass;
    const titleInput = editor.querySelector("#title");
    titleInput.value = "Front Door";
    const preRoll = editor.querySelector("#event_pre_post_roll_enabled");
    preRoll.checked = true;
    const minuteChoice = editor.querySelector('[name="realtime_poll_seconds"][value="60"]');
    minuteChoice.checked = true;
    let configChanged = 0;
    editor.addEventListener("config-changed", () => { configChanged += 1; });

    const english = editor._localization;
    const translations = {
      "editor.general.cameraTokenHelp": "La grille affiche {grid}; utilisez {camera} pour la caméra active.",
      "editor.general.grid": "Grille",
      "editor.general.enablePrePostRoll": "Activer les marges vidéo",
      "editor.general.prePostRollHelp": "Ajoute {seconds} secondes autour de la vidéo.",
      "editor.duration.minutes": "{count} min FR",
      "editor.duration.seconds": "{count} s FR",
      "editor.general.fallbackUpdateCheck": "Vérification de secours",
      "editor.general.updateAvailableVersion": "Mise à jour : {version}",
      "editor.general.homeAssistantBelowRecommended": "HA {version} sous {recommended}.",
      "editor.general.frigateInstalled": "Frigate installé.",
      "editor.general.timezoneHelp": "Consultez {profile} pour le fuseau.",
      "editor.general.homeAssistantProfile": "Profil Home Assistant",
    };
    editor._localization = {
      updateHass: () => true,
      t: (key, values = {}) => {
        const phrase = translations[key];
        return phrase
          ? phrase.replace(/\{([A-Za-z][A-Za-z0-9_]*)\}/g, (token, name) =>
            Object.hasOwn(values, name) ? String(values[name]) : token)
          : english.t(key, values);
      },
    };
    editor.hass = { ...hass, locale: { language: "fr" } };

    const tokenHelper = editor.querySelector(".text-display-token-helper");
    const timezoneHelper = editor.querySelector("[data-general-timezone-helper]");
    return {
      inputPreserved: editor.querySelector("#title") === titleInput,
      titleValue: titleInput.value,
      preRollPreserved: editor.querySelector("#event_pre_post_roll_enabled") === preRoll,
      preRollChecked: preRoll.checked,
      minuteChoicePreserved: editor.querySelector('[name="realtime_poll_seconds"][value="60"]') === minuteChoice,
      minuteChoiceChecked: minuteChoice.checked,
      minuteLabel: minuteChoice.getAttribute("aria-label"),
      secondLabel: editor.querySelector('[name="realtime_poll_seconds"][value="2"]').getAttribute("aria-label"),
      choiceHeading: editor.querySelector("#realtime_poll_seconds .field-label").textContent,
      preRollLabel: editor.querySelector('[data-fvc-i18n="editor.general.enablePrePostRoll"]').textContent,
      preRollHelp: editor.querySelector('[data-fvc-i18n="editor.general.prePostRollHelp"]').textContent,
      tokenText: tokenHelper.textContent,
      tokenCode: tokenHelper.querySelector("code")?.textContent,
      tokenStrong: tokenHelper.querySelector("strong")?.textContent,
      updateStatus: editor.querySelector("#card-version-update-status").textContent,
      haStatus: editor.querySelector("[data-home-assistant-version-notice] [data-environment-support-text]").textContent,
      frigateStatus: editor.querySelector("[data-frigate-integration-status] [data-environment-support-text]").textContent,
      timezoneText: timezoneHelper.textContent,
      timezoneHref: timezoneHelper.querySelector("a")?.getAttribute("href"),
      configChanged,
    };
  });

  expect(state).toEqual({
    inputPreserved: true,
    titleValue: "Front Door",
    preRollPreserved: true,
    preRollChecked: true,
    minuteChoicePreserved: true,
    minuteChoiceChecked: true,
    minuteLabel: "1 min FR",
    secondLabel: "2 s FR",
    choiceHeading: "Vérification de secours",
    preRollLabel: "Activer les marges vidéo",
    preRollHelp: "Ajoute 5 secondes autour de la vidéo.",
    tokenText: "La grille affiche Grille; utilisez {camera} pour la caméra active.",
    tokenCode: "{camera}",
    tokenStrong: "Grille",
    updateStatus: "Mise à jour : v1.2.0",
    haStatus: "HA 2026.8.4 sous 2026.9.0.",
    frigateStatus: "Frigate installé.",
    timezoneText: "Consultez Profil Home Assistant pour le fuseau.",
    timezoneHref: "/profile/general",
    configChanged: 0,
  });
});

test("Theme Settings language changes preserve custom colors and selected modes", async ({ page }) => {
  await page.goto(baseUrl);
  const state = await page.evaluate(async () => {
    await import("/frigate-view-card-editor.js");
    const editor = document.createElement("frigate-view-card-editor");
    document.body.append(editor);
    editor.setConfig({
      cameras: [{ entity: "camera.front", name: "Front" }],
      theme: "custom",
      theme_custom: [{
        modes: ["light", "dark"],
        overrides: { "--c-bg-main": "#112233" },
      }],
    });
    const hass = { locale: { language: "en" }, states: {}, themes: { darkMode: false } };
    editor.hass = hass;
    const customButton = editor.querySelector('[data-theme-option="custom"]');
    const bothButton = editor.querySelector('[data-theme-scope="both"]');
    const colorInput = editor.querySelector('[data-theme-color="--c-bg-main"]');
    const defaultToggle = editor.querySelector('[data-theme-default="--c-bg-main"]');
    const resetButton = editor.querySelector('[data-theme-reset="--c-bg-main"]');
    let configChanged = 0;
    editor.addEventListener("config-changed", () => { configChanged += 1; });

    const english = editor._localization;
    const translated = {
      "editor.panels.theme": "Paramètres du thème",
      "editor.theme.theme": "Thème",
      "editor.theme.homeAssistantTheme": "Thème Home Assistant",
      "editor.theme.custom": "Personnalisé",
      "editor.theme.applyCustomThemeIn": "Appliquer le thème dans",
      "editor.theme.customThemeModes": "Modes du thème personnalisé",
      "editor.theme.both": "Les deux",
      "editor.theme.applyBothModes": "Appliquer dans les deux modes",
      "editor.theme.colors.bg_main": "Couleur de fond",
      "editor.theme.draftChangesRequireSave": "Enregistrer la configuration pour appliquer.",
      "editor.theme.resetDefaultColor": "Rétablir la couleur par défaut",
      "editor.theme.useDefault": "Valeur par défaut",
    };
    editor._localization = {
      updateHass: () => true,
      t: (key, values) => translated[key] || english.t(key, values),
    };
    editor.hass = { ...hass, locale: { language: "fr" } };

    const row = editor.querySelector('[data-theme-row="--c-bg-main"]');
    return {
      customButtonPreserved: editor.querySelector('[data-theme-option="custom"]') === customButton,
      customSelected: customButton.classList.contains("active"),
      customText: customButton.textContent,
      customPanelOpen: !editor.querySelector("#theme-custom-panel").hidden,
      bothButtonPreserved: editor.querySelector('[data-theme-scope="both"]') === bothButton,
      bothSelected: bothButton.getAttribute("aria-checked"),
      bothText: bothButton.textContent,
      bothAria: bothButton.getAttribute("aria-label"),
      colorInputPreserved: row.querySelector('[data-theme-color="--c-bg-main"]') === colorInput,
      colorValue: colorInput.value,
      defaultTogglePreserved: row.querySelector('[data-theme-default="--c-bg-main"]') === defaultToggle,
      defaultChecked: defaultToggle.checked === true || defaultToggle.hasAttribute("checked"),
      rowLabel: row.querySelector(".theme-custom-label > div").textContent,
      warning: row.querySelector(".theme-custom-warn")?.textContent,
      resetPreserved: row.querySelector('[data-theme-reset="--c-bg-main"]') === resetButton,
      resetTitle: resetButton.getAttribute("title"),
      resetAria: resetButton.getAttribute("aria-label"),
      defaultLabel: row.querySelector("ha-formfield").getAttribute("label"),
      configChanged,
    };
  });

  expect(state).toEqual({
    customButtonPreserved: true,
    customSelected: true,
    customText: "Personnalisé",
    customPanelOpen: true,
    bothButtonPreserved: true,
    bothSelected: "true",
    bothText: "Les deux",
    bothAria: "Appliquer dans les deux modes",
    colorInputPreserved: true,
    colorValue: "#112233",
    defaultTogglePreserved: true,
    defaultChecked: false,
    rowLabel: "Couleur de fond",
    warning: "Enregistrer la configuration pour appliquer.",
    resetPreserved: true,
    resetTitle: "Rétablir la couleur par défaut",
    resetAria: "Rétablir la couleur par défaut",
    defaultLabel: "Valeur par défaut",
    configChanged: 0,
  });
});

test("Layout Settings language changes preserve controls and validation state", async ({ page }) => {
  await page.goto(baseUrl);
  const state = await page.evaluate(async () => {
    await import("/frigate-view-card-editor.js");
    const editor = document.createElement("frigate-view-card-editor");
    editor._activeSettingsPanelId = "layout";
    document.body.append(editor);
    editor.setConfig({
      cameras: [{ entity: "camera.front", name: "Front" }],
      stream_height: 80,
      stream_height_unit: "dvh",
      tight_margins: true,
      display_logo: false,
    });
    const hass = { locale: { language: "en" }, states: {}, themes: {} };
    editor.hass = hass;
    const panel = editor.querySelector('[data-panel="layout"]');
    const slider = editor.querySelector("#stream_height");
    const heightUnit = editor.querySelector('[name="stream_height_unit"][value="dvh"]');
    const tightMargins = editor.querySelector("#tight_margins");
    const logo = editor.querySelector("#display_logo");
    editor._setEditorFieldError(
      "#stream_height",
      editor._t("editor.layout.cardHeightRangeValidation", { min: 50, max: 100 }),
    );
    let configChanged = 0;
    editor.addEventListener("config-changed", () => { configChanged += 1; });

    const english = editor._localization;
    const translated = {
      "editor.panels.layout": "Paramètres de disposition",
      "editor.layout.activeTabs": "Onglets actifs",
      "editor.layout.tabs.alerts": "Alertes",
      "editor.layout.cardHeightLimit": "Limite de hauteur",
      "editor.layout.cardHeightUnit": "Unité de hauteur",
      "editor.layout.autoHeightHelp": "Utilisez la hauteur automatique.",
      "editor.layout.cardHeightRangeValidation": "Nombre entier entre {min} et {max}.",
      "editor.layout.tightMargins": "Marges serrées",
      "editor.layout.tightMarginsHelp": "Réduit l'espacement autour de la carte.",
      "editor.layout.showLogo": "Afficher le logo {cardName}",
      "editor.layout.showLogoHelp": "Affiche {cardName} dans le pied de page.",
    };
    editor._localization = {
      updateHass: () => true,
      t: (key, values = {}) => {
        const phrase = translated[key];
        return phrase
          ? phrase.replace(/\{([A-Za-z][A-Za-z0-9_]*)\}/g, (token, name) =>
            Object.hasOwn(values, name) ? String(values[name]) : token)
          : english.t(key, values);
      },
    };
    editor.hass = { ...hass, locale: { language: "fr" } };

    return {
      panelPreserved: editor.querySelector('[data-panel="layout"]') === panel,
      panelOpen: panel.classList.contains("active"),
      sliderPreserved: editor.querySelector("#stream_height") === slider,
      sliderValue: slider.value,
      unitPreserved: editor.querySelector('[name="stream_height_unit"][value="dvh"]') === heightUnit,
      unitChecked: heightUnit.checked,
      unitAria: editor.querySelector("#stream_height_unit").getAttribute("aria-label"),
      tightPreserved: editor.querySelector("#tight_margins") === tightMargins,
      tightChecked: tightMargins.checked === true || tightMargins.hasAttribute("checked"),
      logoPreserved: editor.querySelector("#display_logo") === logo,
      logoChecked: logo.checked === true || logo.hasAttribute("checked"),
      activeTabs: editor.querySelector('[data-fvc-i18n="editor.layout.activeTabs"]').textContent,
      alertsTab: editor.querySelector('[data-active-tab="alerts"]').closest("ha-formfield").getAttribute("label"),
      heightLabel: editor.querySelector('[data-fvc-i18n="editor.layout.cardHeightLimit"]').textContent,
      heightHelp: editor.querySelector('[data-fvc-i18n="editor.layout.autoHeightHelp"]').textContent,
      heightError: editor.querySelector("#stream_height-helper").textContent,
      heightInvalid: slider.hasAttribute("data-invalid"),
      tightLabel: editor.querySelector('[data-fvc-i18n="editor.layout.tightMargins"]').textContent,
      logoLabel: editor.querySelector('[data-fvc-i18n="editor.layout.showLogo"]').textContent,
      logoHelp: editor.querySelector('[data-fvc-i18n="editor.layout.showLogoHelp"]').textContent,
      configChanged,
    };
  });

  expect(state).toEqual({
    panelPreserved: true,
    panelOpen: true,
    sliderPreserved: true,
    sliderValue: "80",
    unitPreserved: true,
    unitChecked: true,
    unitAria: "Unité de hauteur",
    tightPreserved: true,
    tightChecked: true,
    logoPreserved: true,
    logoChecked: false,
    activeTabs: "Onglets actifs",
    alertsTab: "Alertes",
    heightLabel: "Limite de hauteur",
    heightHelp: "Utilisez la hauteur automatique.",
    heightError: "Nombre entier entre 50 et 100.",
    heightInvalid: true,
    tightLabel: "Marges serrées",
    logoLabel: "Afficher le logo FrigateView",
    logoHelp: "Affiche FrigateView dans le pied de page.",
    configChanged: 0,
  });
});

test("Slideshow and Preview language changes preserve enabled switches and durations", async ({ page }) => {
  await page.goto(baseUrl);
  const state = await page.evaluate(async () => {
    await import("/frigate-view-card-editor.js");
    const editor = document.createElement("frigate-view-card-editor");
    editor._activeSettingsPanelId = "slideshow";
    document.body.append(editor);
    editor.setConfig({
      cameras: [{ entity: "camera.front", name: "Front" }],
      slideshow_rotation_enabled: true,
      slideshow_rotation_seconds: 20,
      slideshow_alert_hold_seconds: 60,
      preview_page_enabled: true,
      preview_page_live_cameras_mobile: true,
      preview_page_show_title_bars: false,
    });
    const hass = { locale: { language: "en" }, states: {}, themes: {} };
    editor.hass = hass;
    const slideshowPanel = editor.querySelector('[data-panel="slideshow"]');
    const slideshowSwitch = editor.querySelector("#slideshow_rotation_enabled");
    const rotationChoice = editor.querySelector('[name="slideshow_rotation_seconds"][value="20"]');
    const alertHoldChoice = editor.querySelector('[name="slideshow_alert_hold_seconds"][value="60"]');
    const previewSwitch = editor.querySelector("#preview_page_enabled");
    const previewMobileSwitch = editor.querySelector("#preview_page_live_cameras_mobile");
    const previewTitleSwitch = editor.querySelector("#preview_page_show_title_bars");
    let configChanged = 0;
    editor.addEventListener("config-changed", () => { configChanged += 1; });

    const english = editor._localization;
    const translated = {
      "editor.slideshow.enable": "Activer le diaporama",
      "editor.slideshow.cameraRotationInterval": "Intervalle de rotation",
      "editor.slideshow.alertHoldDuration": "Durée de l'alerte",
      "editor.duration.seconds": "{count} s FR",
      "editor.duration.minutes": "{count} min FR",
      "editor.preview.enable": "Activer l'aperçu",
      "editor.preview.liveMobile": "Caméras en direct sur mobile",
      "editor.preview.liveMobileHelp": "Garde les caméras de l'aperçu en direct sur mobile.",
      "editor.preview.showTitleBars": "Afficher les titres",
    };
    editor._localization = {
      updateHass: () => true,
      t: (key, values = {}) => {
        const phrase = translated[key];
        return phrase
          ? phrase.replace(/\{([A-Za-z][A-Za-z0-9_]*)\}/g, (token, name) =>
            Object.hasOwn(values, name) ? String(values[name]) : token)
          : english.t(key, values);
      },
    };
    editor.hass = { ...hass, locale: { language: "fr" } };

    return {
      slideshowPanelPreserved: editor.querySelector('[data-panel="slideshow"]') === slideshowPanel,
      slideshowPanelOpen: slideshowPanel.classList.contains("active"),
      slideshowSwitchPreserved: editor.querySelector("#slideshow_rotation_enabled") === slideshowSwitch,
      slideshowEnabled: slideshowSwitch.checked === true || slideshowSwitch.hasAttribute("checked"),
      rotationPreserved: editor.querySelector('[name="slideshow_rotation_seconds"][value="20"]') === rotationChoice,
      rotationChecked: rotationChoice.checked,
      rotationLabel: rotationChoice.getAttribute("aria-label"),
      alertHoldPreserved: editor.querySelector('[name="slideshow_alert_hold_seconds"][value="60"]') === alertHoldChoice,
      alertHoldChecked: alertHoldChoice.checked,
      alertHoldLabel: alertHoldChoice.getAttribute("aria-label"),
      slideshowLabel: editor.querySelector('[data-fvc-i18n="editor.slideshow.enable"]').textContent,
      rotationHeading: editor.querySelector('[data-fvc-i18n="editor.slideshow.cameraRotationInterval"]').textContent,
      previewSwitchPreserved: editor.querySelector("#preview_page_enabled") === previewSwitch,
      previewEnabled: previewSwitch.checked === true || previewSwitch.hasAttribute("checked"),
      previewMobilePreserved: editor.querySelector("#preview_page_live_cameras_mobile") === previewMobileSwitch,
      previewMobileEnabled: previewMobileSwitch.checked === true || previewMobileSwitch.hasAttribute("checked"),
      previewTitlePreserved: editor.querySelector("#preview_page_show_title_bars") === previewTitleSwitch,
      previewTitleEnabled: previewTitleSwitch.checked === true || previewTitleSwitch.hasAttribute("checked"),
      previewLabel: editor.querySelector('[data-fvc-i18n="editor.preview.enable"]').textContent,
      previewMobileLabel: editor.querySelector('[data-fvc-i18n="editor.preview.liveMobile"]').textContent,
      previewMobileHelp: editor.querySelector('[data-fvc-i18n="editor.preview.liveMobileHelp"]').textContent,
      configChanged,
    };
  });

  expect(state).toEqual({
    slideshowPanelPreserved: true,
    slideshowPanelOpen: true,
    slideshowSwitchPreserved: true,
    slideshowEnabled: true,
    rotationPreserved: true,
    rotationChecked: true,
    rotationLabel: "20 s FR",
    alertHoldPreserved: true,
    alertHoldChecked: true,
    alertHoldLabel: "1 min FR",
    slideshowLabel: "Activer le diaporama",
    rotationHeading: "Intervalle de rotation",
    previewSwitchPreserved: true,
    previewEnabled: true,
    previewMobilePreserved: true,
    previewMobileEnabled: true,
    previewTitlePreserved: true,
    previewTitleEnabled: false,
    previewLabel: "Activer l'aperçu",
    previewMobileLabel: "Caméras en direct sur mobile",
    previewMobileHelp: "Garde les caméras de l'aperçu en direct sur mobile.",
    configChanged: 0,
  });
});

test("Grid Mode language changes preserve custom camera order and accessible actions", async ({ page }) => {
  await page.goto(baseUrl);
  const state = await page.evaluate(async () => {
    await import("/frigate-view-card-editor.js");
    const cameras = Array.from({ length: 6 }, (_, index) => ({
      entity: `camera.cam_${index + 1}`,
      name: `Cam ${index + 1}`,
    }));
    const included = cameras.slice(0, 5).map(({ entity }) => entity);
    const excluded = [cameras[5].entity];
    const editor = document.createElement("frigate-view-card-editor");
    editor._activeSettingsPanelId = "gridview";
    document.body.append(editor);
    editor.setConfig({
      cameras,
      grid_mode_enabled: true,
      grid_live_view_enabled: false,
      grid_order: { mode: "custom", included, excluded },
      grid_rotation_seconds: 30,
      grid_alert_hold_seconds: 60,
    });
    const hass = { locale: { language: "en" }, states: {}, themes: {} };
    editor.hass = hass;
    const panel = editor.querySelector('[data-panel="gridview"]');
    const modeButton = editor.querySelector('[data-grid-order-mode="custom"]');
    const firstRow = editor.querySelector(".grid-order-row");
    const excludeButton = firstRow.querySelector("[data-grid-order-exclude]");
    const includeButton = editor.querySelector("[data-grid-order-include]");
    const rotationChoice = editor.querySelector('[name="grid_rotation_seconds"][value="30"]');
    const holdChoice = editor.querySelector('[name="grid_alert_hold_seconds"][value="60"]');
    const liveSwitch = editor.querySelector("#grid_live_view_enabled");
    let configChanged = 0;
    editor.addEventListener("config-changed", () => { configChanged += 1; });

    const english = editor._localization;
    const translated = {
      "editor.grid.enable": "Activer la grille",
      "editor.grid.order": "Ordre de la grille",
      "editor.grid.custom": "Personnalisé",
      "editor.grid.gridNumber": "Grille {number}",
      "editor.grid.excludedCameras": "Caméras exclues",
      "editor.grid.excludeFromGrid": "Exclure de la grille",
      "editor.grid.excludeCameraFromGrid": "Exclure {camera} de la grille",
      "editor.grid.exclude": "Exclure",
      "editor.grid.includeInGrid": "Inclure dans la grille",
      "editor.grid.includeCameraInGrid": "Inclure {camera} dans la grille",
      "editor.grid.include": "Inclure",
      "editor.grid.liveView": "Vidéo en direct dans la grille",
      "editor.grid.rotationInterval": "Intervalle de rotation de la grille",
      "editor.grid.alertHoldDuration": "Durée d'alerte de la grille",
      "editor.duration.seconds": "{count} s FR",
      "editor.duration.minutes": "{count} min FR",
    };
    editor._localization = {
      updateHass: () => true,
      t: (key, values = {}) => {
        const phrase = translated[key];
        return phrase
          ? phrase.replace(/\{([A-Za-z][A-Za-z0-9_]*)\}/g, (token, name) =>
            Object.hasOwn(values, name) ? String(values[name]) : token)
          : english.t(key, values);
      },
    };
    editor.hass = { ...hass, locale: { language: "fr" } };

    return {
      panelPreserved: editor.querySelector('[data-panel="gridview"]') === panel,
      panelOpen: panel.classList.contains("active"),
      modePreserved: editor.querySelector('[data-grid-order-mode="custom"]') === modeButton,
      modeSelected: modeButton.getAttribute("aria-checked"),
      modeText: modeButton.textContent,
      firstRowPreserved: editor.querySelector(".grid-order-row") === firstRow,
      cameraName: firstRow.querySelector(".cam-name").textContent,
      headings: [...editor.querySelectorAll(".grid-order-sections .grid-order-heading")].map((heading) => heading.textContent),
      excludedHeading: editor.querySelector(".grid-order-excluded .grid-order-heading").textContent,
      excludePreserved: firstRow.querySelector("[data-grid-order-exclude]") === excludeButton,
      excludeTitle: excludeButton.getAttribute("title"),
      excludeAria: excludeButton.getAttribute("aria-label"),
      excludeText: excludeButton.querySelector("span").textContent,
      includePreserved: editor.querySelector("[data-grid-order-include]") === includeButton,
      includeTitle: includeButton.getAttribute("title"),
      includeAria: includeButton.getAttribute("aria-label"),
      includeText: includeButton.querySelector("span").textContent,
      rotationPreserved: editor.querySelector('[name="grid_rotation_seconds"][value="30"]') === rotationChoice,
      rotationChecked: rotationChoice.checked,
      rotationLabel: rotationChoice.getAttribute("aria-label"),
      holdPreserved: editor.querySelector('[name="grid_alert_hold_seconds"][value="60"]') === holdChoice,
      holdChecked: holdChoice.checked,
      holdLabel: holdChoice.getAttribute("aria-label"),
      livePreserved: editor.querySelector("#grid_live_view_enabled") === liveSwitch,
      liveEnabled: liveSwitch.checked === true || liveSwitch.hasAttribute("checked"),
      gridLabel: editor.querySelector('[data-fvc-i18n="editor.grid.enable"]').textContent,
      configChanged,
    };
  });

  expect(state).toEqual({
    panelPreserved: true,
    panelOpen: true,
    modePreserved: true,
    modeSelected: "true",
    modeText: "Personnalisé",
    firstRowPreserved: true,
    cameraName: "Cam 1",
    headings: ["Grille 1", "Grille 2"],
    excludedHeading: "Caméras exclues",
    excludePreserved: true,
    excludeTitle: "Exclure de la grille",
    excludeAria: "Exclure Cam 1 de la grille",
    excludeText: "Exclure",
    includePreserved: true,
    includeTitle: "Inclure dans la grille",
    includeAria: "Inclure Cam 6 dans la grille",
    includeText: "Inclure",
    rotationPreserved: true,
    rotationChecked: true,
    rotationLabel: "30 s FR",
    holdPreserved: true,
    holdChecked: true,
    holdLabel: "1 min FR",
    livePreserved: true,
    liveEnabled: false,
    gridLabel: "Activer la grille",
    configChanged: 0,
  });
});

test("an open camera editor keeps its form and accordion state when language changes", async ({ page }) => {
  await page.goto(baseUrl);
  const state = await page.evaluate(async () => {
    await import("/frigate-view-card-editor.js");
    const editor = document.createElement("frigate-view-card-editor");
    document.body.append(editor);
    editor.setConfig({ cameras: [{ entity: "camera.front", name: "Front" }] });
    editor.hass = { locale: { language: "en" }, states: {}, themes: {} };
    let configChanged = 0;
    editor.addEventListener("config-changed", () => { configChanged += 1; });
    editor._openCameraModal(0);
    editor._setCameraModalAccordionActive("additional");
    const modal = editor.querySelector("#camera-modal");
    const name = editor.querySelector("#camera-modal-name");
    const connection = editor.querySelector("#camera-modal-connection-type");
    const connectionValue = connection.value;
    name.value = "My Front Door";
    editor._setLocalizedMessage(
      editor.querySelector("#camera-modal-helper"),
      "editor.cameraModal.cameraRequired",
    );

    const english = editor._localization;
    const translated = {
      "editor.panels.camera": "Paramètres des caméras",
      "editor.cameraModal.editCamera": "Modifier la caméra",
      "editor.cameraModal.addCamera": "Ajouter une caméra",
      "editor.cameraModal.additionalCamera": "Caméra supplémentaire",
      "editor.cameraModal.cameraName": "Nom de caméra",
      "editor.cameraModal.noneConfigured": "Aucune configurée",
      "editor.cameraModal.frigateGo2rtcDefault": "Frigate go2rtc (défaut)",
      "editor.cameraModal.cameraRequired": "La caméra est requise.",
      "editor.actions.update": "Mettre à jour",
    };
    editor._localization = {
      updateHass: () => true,
      t: (key, values) => translated[key] || english.t(key, values),
    };
    editor.hass = { locale: { language: "fr" }, states: {}, themes: {} };

    const preserved = {
      modal: editor.querySelector("#camera-modal") === modal,
      nameInput: editor.querySelector("#camera-modal-name") === name,
      nameValue: name.value,
      nameLabel: name.label,
      additionalOpen: editor.querySelector(
        '[data-camera-modal-section="additional"]',
      ).classList.contains("active"),
      title: editor.querySelector("#camera-modal-title").textContent,
      save: editor.querySelector("#camera-modal-save").textContent,
      summary: editor.querySelector("#camera-modal-additional-summary").textContent,
      panel: editor.querySelector('[data-panel="camera"] h3').textContent,
      helper: editor.querySelector("#camera-modal-helper").textContent,
      connectionValuePreserved: connection.value === connectionValue,
      connectionLabel: connection.selector.select.options[0].label,
      configChanged,
    };
    editor._openCameraModal(null);
    return {
      ...preserved,
      newCameraTitle: editor.querySelector("#camera-modal-title").textContent,
    };
  });

  expect(state).toEqual({
    modal: true,
    nameInput: true,
    nameValue: "My Front Door",
    nameLabel: "Nom de caméra",
    additionalOpen: true,
    title: "Modifier la caméra",
    save: "Mettre à jour",
    summary: "Aucune configurée",
    panel: "Paramètres des caméras",
    helper: "La caméra est requise.",
    connectionValuePreserved: true,
    connectionLabel: "Frigate go2rtc (défaut)",
    configChanged: 0,
    newCameraTitle: "Ajouter une caméra",
  });
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

test("Panel Card View keeps its live aspect when the open drawer exceeds the viewport", async ({
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
  expect(cramped.hostHeight).toBeGreaterThan(472);
  expect(cramped.stageWidth / cramped.stageHeight).toBeCloseTo(16 / 9, 1);
  expect(cramped.drawerHeight).toBeGreaterThan(0);
  expect(Math.abs(cramped.footerBottom - cramped.hostBottom)).toBeLessThanOrEqual(1);
});

test("Sidebar Card View keeps its live stage legible with the drawer open", async ({ page }) => {
  await page.setViewportSize({ width: 900, height: 700 });
  await page.goto(baseUrl);
  const state = await page.evaluate(async () => {
    await import("/frigate-view-card.js");
    document.body.style.margin = "0";
    const sidebar = document.createElement("hui-sidebar-view");
    sidebar.style.display = "block";
    sidebar.style.width = "550px";
    document.body.append(sidebar);
    const card = document.createElement("frigate-view-card");
    sidebar.append(card);
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
    const root = card.shadowRoot;
    const stage = root.querySelector(".card-view-live-stage");
    const drawer = root.querySelector("[data-card-view-drawer]");
    return {
      stageWidth: stage.getBoundingClientRect().width,
      stageHeight: stage.getBoundingClientRect().height,
      drawerHeight: drawer.getBoundingClientRect().height,
      hostHeight: card.getBoundingClientRect().height,
    };
  });
  expect(state.drawerHeight).toBeGreaterThan(0);
  expect(state.stageWidth / state.stageHeight).toBeCloseTo(16 / 9, 1);
  const resized = await page.evaluate(async () => {
    const sidebar = document.querySelector("hui-sidebar-view");
    const card = sidebar.querySelector("frigate-view-card");
    sidebar.style.width = "720px";
    await new Promise((resolve) => requestAnimationFrame(resolve));
    card._applyCardStyle();
    const stage = card.shadowRoot.querySelector(".card-view-live-stage");
    return {
      width: stage.getBoundingClientRect().width,
      height: stage.getBoundingClientRect().height,
    };
  });
  expect(resized.width).toBeGreaterThan(state.stageWidth);
  expect(resized.width / resized.height).toBeCloseTo(16 / 9, 1);
});

test("the existing live resize grip grows Card View video in Panel and Sidebar", async ({ page }) => {
  for (const viewTag of ["hui-panel-view", "hui-sidebar-view"]) {
    for (const viewMode of ["bottom-panel-open", "bottom-panel-closed"]) {
      await page.setViewportSize({ width: 900, height: 700 });
      await page.goto(baseUrl);
      const before = await page.evaluate(async ({ tagName, mode }) => {
        await import("/frigate-view-card.js");
        document.body.style.margin = "0";
        const view = document.createElement(tagName);
        view.style.display = "block";
        view.style.width = "550px";
        document.body.append(view);
        const card = document.createElement("frigate-view-card");
        view.append(card);
        card.setConfig({
          cameras: [{ entity: "camera.front", name: "Front" }],
          stream_height: 100,
          stream_height_unit: "%",
          card_view_page_enabled: true,
          card_view_view_mode: mode,
        });
        card._pageId = "card-view";
        card._renderShell();
        card._viewMode = "single";
        card._activeStreamType = "mse";
        card.shadowRoot.querySelector("#stream-fallback").hidden = true;
        card._cardViewPageController.syncDrawerState();
        card._applyCardStyle();
        const media = new EventTarget();
        media.videoWidth = 1920;
        media.videoHeight = 1080;
        card._liveViewResizeController.attachMedia(media);
        await new Promise((resolve) => requestAnimationFrame(resolve));
        await new Promise((resolve) => setTimeout(resolve, 280));
        card._applyCardStyle();
        const root = card.shadowRoot;
        const wrap = root.querySelector("#eng-wrap");
        const grip = root.querySelector("#live-resize-grip");
        return {
          gripVisible: !grip.hidden,
          gripMaximum: Number(grip.getAttribute("aria-valuemax")),
          wrapHeight: wrap.getBoundingClientRect().height,
          hostHeight: card.getBoundingClientRect().height,
          drawerState: root.querySelector("[data-card-view-drawer]").dataset.drawerState,
        };
      }, { tagName: viewTag, mode: viewMode });

      expect(before.gripVisible).toBe(true);
      expect(before.gripMaximum).toBeGreaterThan(56);
      const grip = page.locator("frigate-view-card #live-resize-grip");
      const bounds = await grip.boundingBox();
      expect(bounds).toBeTruthy();
      const x = bounds.x + bounds.width / 2;
      const y = bounds.y + bounds.height / 2;
      await page.mouse.move(x, y);
      await page.mouse.down();
      await page.mouse.move(x, y + 90, { steps: 6 });
      await page.mouse.up();

      const after = await page.evaluate(() => {
        const card = document.querySelector("frigate-view-card");
        const root = card.shadowRoot;
        const wrap = root.querySelector("#eng-wrap");
        const footer = root.querySelector('[data-fvc-region="footer"]');
        return {
          wrapHeight: wrap.getBoundingClientRect().height,
          hostHeight: card.getBoundingClientRect().height,
          footerGap: Math.abs(footer.getBoundingClientRect().bottom - card.getBoundingClientRect().bottom),
          drawerState: root.querySelector("[data-card-view-drawer]").dataset.drawerState,
        };
      });
      expect(after.wrapHeight - before.wrapHeight).toBeGreaterThan(50);
      expect(after.hostHeight - before.hostHeight, JSON.stringify({ viewTag, viewMode, before, after })).toBeGreaterThan(50);
      expect(after.footerGap).toBeLessThanOrEqual(2);
      expect(after.drawerState).toBe(before.drawerState);
    }
  }
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

test("grouped camera labels relocalize in place through focus and phone member changes", async ({ page }) => {
  await page.goto(baseUrl);

  const state = await page.evaluate(async () => {
    await import("/frigate-view-card.js");
    const card = document.createElement("frigate-view-card");
    document.body.append(card);
    card.setConfig({
      cameras: [{
        entity: "camera.front",
        group: { secondary_entity: "camera.back", layout: "side_by_side" },
      }],
    });
    card._pageId = "single-view";
    card._renderShell();

    const root = card.shadowRoot;
    const live = root.querySelector("#engine");
    const video = document.createElement("video");
    live.append(video);
    const audio = root.querySelector('[data-camera-group-audio="A"]');
    const focus = root.querySelector('[data-camera-group-focus="B"]');
    const mobile = root.querySelector("[data-camera-group-mobile-toggle]");
    const english = card._localization;
    const phrases = {
      "runtime.cameraGroup.useMainAudio": "Utiliser audio A",
      "runtime.cameraGroup.focusSecond": "Agrandir caméra B",
      "runtime.cameraGroup.showBoth": "Afficher les deux caméras",
      "runtime.cameraGroup.showCamera": "Afficher caméra {member}",
    };
    card._localization = {
      updateHass: () => true,
      t: (key, values = {}) => (phrases[key] || english.t(key, values)).replace(
        /\{(\w+)\}/g,
        (token, name) => values[name] ?? token,
      ),
    };
    const config = card._config;
    card._config = null;
    card.hass = { locale: { language: "fr" } };
    card._config = config;

    const translated = {
      audio: audio.getAttribute("aria-label"),
      focus: focus.getAttribute("aria-label"),
      mobile: mobile.getAttribute("aria-label"),
    };
    const group = card._cameraGroupLiveController;
    group._focusedMember = "B";
    group._syncFocusedMember();
    const focused = focus.getAttribute("aria-label");
    group._focusedMember = "";
    group._syncFocusedMember();
    card._activeGroupMemberOverride = group.secondaryEntity();
    group._syncMobileMemberButton();
    return {
      translated,
      focused,
      restored: focus.getAttribute("aria-label"),
      switched: mobile.getAttribute("aria-label"),
      mobileValues: mobile.getAttribute("data-fvc-i18n-values"),
      livePreserved: root.querySelector("#engine video") === video,
      controlsPreserved: root.querySelector('[data-camera-group-focus="B"]') === focus,
    };
  });

  expect(state).toEqual({
    translated: {
      audio: "Utiliser audio A",
      focus: "Agrandir caméra B",
      mobile: "Afficher caméra B",
    },
    focused: "Afficher les deux caméras",
    restored: "Agrandir caméra B",
    switched: "Afficher caméra A",
    mobileValues: '{"member":"A"}',
    livePreserved: true,
    controlsPreserved: true,
  });
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

  test("phone rotation raises an isolated Bubble card above its popup", async ({ page }) => {
    await page.goto(baseUrl);
    const portrait = await page.evaluate(async () => {
      await import("/frigate-view-card.js");
      document.body.style.margin = "0";
      const bubble = document.createElement("div");
      bubble.className = "bubble-pop-up-container";
      bubble.style.cssText =
        "position:absolute;top:120px;left:20px;width:350px;height:500px;" +
        "overflow:hidden;transform:translateY(0);z-index:5";
      const card = document.createElement("frigate-view-card");
      card.setConfig({
        cameras: [{ entity: "camera.front", name: "Front" }],
        mobile_view_page_enabled: true,
        mobile_view_rotate_to_fullscreen: true,
      });
      bubble.append(card);
      document.body.append(bubble);
      const backdrop = document.createElement("div");
      backdrop.className = "bubble-backdrop";
      backdrop.style.cssText = "position:fixed;inset:0;z-index:4";
      document.body.append(backdrop);
      card._pageId = "mobile-view";
      card._renderShell();
      card._syncRotateOverlayViewportState();
      return {
        enabled: card._isRotateToFullscreenEnabled(),
        active: card._rotateOverlayActive,
        topLayer: card.matches(":popover-open"),
      };
    });
    expect(portrait).toEqual({ enabled: true, active: false, topLayer: false });

    await page.setViewportSize({ width: 844, height: 390 });
    const landscape = await page.evaluate(() => {
      const card = document.querySelector(".bubble-pop-up-container frigate-view-card");
      card._syncRotateOverlayViewportState();
      const rect = card.getBoundingClientRect();
      return {
        active: card._rotateOverlayActive,
        topLayer: card.matches(":popover-open"),
        edgeOnCard: document.elementFromPoint(800, 195) === card,
        rect: [rect.left, rect.top, rect.width, rect.height].map(Math.round),
      };
    });
    expect(landscape).toEqual({
      active: true,
      topLayer: true,
      edgeOnCard: true,
      rect: [0, 0, 844, 390],
    });
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
