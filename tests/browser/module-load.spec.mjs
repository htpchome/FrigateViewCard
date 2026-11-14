import { expect, test } from "@playwright/test";
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import {
  LANGUAGE_ASSET_NAMES,
  LANGUAGE_ASSET_PREFIX,
} from "../../src/features/localization/catalogs.mjs";

const bundlePaths = new Map([
  ["/frigate-view-card.js", "dist/frigate-view-card.js"],
  ["/frigate-view-card-editor.js", "dist/frigate-view-card-editor.js"],
  [
    "/frigate-view-card-circle-pad.js",
    "dist/frigate-view-card-circle-pad.js",
  ],
  [
    "/frigate-view-card-dashboard-swipe-navigation.js",
    "dist/frigate-view-card-dashboard-swipe-navigation.js",
  ],
  ["/frigate-view-card-navbar.js", "dist/frigate-view-card-navbar.js"],
  [
    "/frigate-view-card-card-view.js",
    "dist/frigate-view-card-card-view.js",
  ],
  ["/frigate-view-card-grid.js", "dist/frigate-view-card-grid.js"],
  [
    "/frigate-view-card-slideshow.js",
    "dist/frigate-view-card-slideshow.js",
  ],
  [
    "/frigate-view-card-preview.js",
    "dist/frigate-view-card-preview.js",
  ],
  [
    "/frigate-view-card-recordings.js",
    "dist/frigate-view-card-recordings.js",
  ],
  ["/frigate-view-card-ptz.js", "dist/frigate-view-card-ptz.js"],
  [
    "/frigate-view-card-picture-in-picture.js",
    "dist/frigate-view-card-picture-in-picture.js",
  ],
  [
    "/frigate-view-card-card-picker-demo.js",
    "dist/frigate-view-card-card-picker-demo.js",
  ],
  [
    "/frigate-view-card-editor-preview-draft.js",
    "dist/frigate-view-card-editor-preview-draft.js",
  ],
  [
    "/frigate-view-card-recording-scrub.js",
    "dist/frigate-view-card-recording-scrub.js",
  ],
  [
    "/frigate-view-card-frame-capture.js",
    "dist/frigate-view-card-frame-capture.js",
  ],
  [
    "/frigate-view-card-linked-light.js",
    "dist/frigate-view-card-linked-light.js",
  ],
  [
    "/frigate-view-card-wide-view.js",
    "dist/frigate-view-card-wide-view.js",
  ],
  [
    "/frigate-view-card-wide-timeline.js",
    "dist/frigate-view-card-wide-timeline.js",
  ],
  [
    "/frigate-view-card-wide-companion.js",
    "dist/frigate-view-card-wide-companion.js",
  ],
  ["/frigate-view-card-hls-1.5.17.js", "dist/frigate-view-card-hls-1.5.17.js"],
  ...LANGUAGE_ASSET_NAMES.map((language) => [
    `/${LANGUAGE_ASSET_PREFIX}-${language}.json`,
    `dist/${LANGUAGE_ASSET_PREFIX}-${language}.json`,
  ]),
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
        "content-type": pathname.endsWith(".json")
          ? "application/json; charset=utf-8"
          : "text/javascript; charset=utf-8",
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

for (const startUnmuted of [false, true]) {
  test(`HA Direct mute control restores received WebRTC audio (start_unmuted=${startUnmuted})`, async ({ page }) => {
    await page.goto(baseUrl);
    await page.evaluate(async (startUnmuted) => {
      await import("/frigate-view-card.js");
      customElements.define("ha-audio-test-card", class extends customElements.get("frigate-view-card") {
        connectedCallback() {}
        disconnectedCallback() {}
      });
      const card = document.createElement("ha-audio-test-card");
      card.setConfig({ cameras: [{ entity: "camera.front", connection_type: "ha_direct", start_unmuted: startUnmuted }] });
      document.body.append(card);
      card._renderShell();

      const context = new AudioContext();
      const oscillator = context.createOscillator();
      const destination = context.createMediaStreamDestination();
      oscillator.connect(destination);
      oscillator.start();
      const audioTrack = destination.stream.getAudioTracks()[0];
      // Model HA's peer receivers with real browser MediaStreamTracks. This
      // checks stream repair, not network negotiation or physical audio output.
      const receiver = { getReceivers: () => [{ track: audioTrack }], connectionState: "connected" };
      const canvas = document.createElement("canvas");
      canvas.width = canvas.height = 64;
      canvas.style.cssText = "position:fixed;top:0;right:0";
      document.body.append(canvas);
      const paint = canvas.getContext("2d");
      const frames = setInterval(() => {
        paint.fillStyle = `rgb(${Date.now() % 255}, 80, 80)`;
        paint.fillRect(0, 0, 64, 64);
      }, 40);
      const cameraStream = canvas.captureStream(25);
      const provider = document.createElement("ha-camera-stream");
      provider.style.cssText = "display:block;position:fixed;top:0;left:0;width:64px;height:64px";
      provider.haDirectProvider = true;
      provider.muted = true;
      provider.attachShadow({ mode: "open" });
      const hidden = document.createElement("ha-hls-player");
      hidden.hidden = true;
      hidden.attachShadow({ mode: "open" }).append(document.createElement("video"));
      const player = document.createElement("ha-web-rtc-player");
      player.muted = true;
      player._peerConnection = receiver;
      player._remoteStream = cameraStream;
      const video = document.createElement("video");
      video.muted = true;
      video.defaultMuted = true;
      video.width = video.height = 64;
      video.autoplay = true;
      video.playsInline = true;
      video.srcObject = player._remoteStream;
      player.attachShadow({ mode: "open" }).append(video);
      provider.shadowRoot.append(hidden, player);
      document.body.append(provider);
      void video.play().catch(() => {});
      // Reproduce HA's _addTrack behavior, including its muted-audio omission.
      const addTrack = (track) => {
        if (track.kind === "audio" && player.muted) return;
        player._remoteStream.addTrack(track);
      };
      addTrack(audioTrack);
      card._engine = provider;
      card._setLiveMuted(true);
      card._liveAudioController.prepareCameraStart(card._config.cameras[0]);
      const button = document.createElement("button");
      button.id = "test-mute-control";
      button.style.cssText = "position:fixed;top:70px;left:0";
      button.textContent = "Toggle existing live mute action";
      button.onclick = () => {
        void context.resume();
        card._applyLiveMuteChange(!card._streamMuted, { source: "button" });
      };
      document.body.append(button);
      window.haAudioTest = { card, provider, player, video, receiver, frames,
        context, oscillator, audioTrack, stream: player._remoteStream };
    }, startUnmuted);

    await expect.poll(() => page.evaluate(() => window.haAudioTest.video.currentTime)).toBeGreaterThan(0);
    expect(await page.evaluate(() => window.haAudioTest.stream.getAudioTracks().length)).toBe(0);
    await page.locator("#test-mute-control").click();
    await expect.poll(() => page.evaluate(() => {
      const { video, stream, player, provider } = window.haAudioTest;
      return { tracks: stream.getAudioTracks().length, videoMuted: video.muted,
        playerMuted: player.muted, providerMuted: provider.muted, paused: video.paused,
        progressing: video.currentTime > 0 };
    })).toEqual({ tracks: 1, videoMuted: false, playerMuted: false, providerMuted: false,
      paused: false, progressing: true });
    const unmutedTime = await page.evaluate(() => window.haAudioTest.video.currentTime);
    await expect.poll(() => page.evaluate(() => window.haAudioTest.video.currentTime)).toBeGreaterThan(unmutedTime);
    await page.locator("#test-mute-control").click();
    expect(await page.evaluate(() => {
      const { video, player, provider } = window.haAudioTest;
      return {
        videoMuted: video.muted,
        playerMuted: player.muted,
        providerMuted: provider.muted,
      };
    })).toEqual({ videoMuted: true, playerMuted: true, providerMuted: false });
    await page.locator("#test-mute-control").click();
    expect(await page.evaluate(() => {
      const { video, stream, receiver, player, audioTrack } = window.haAudioTest;
      return !video.muted && video.srcObject === stream && player._peerConnection === receiver &&
        stream.getAudioTracks().length === 1 && stream.getAudioTracks()[0] === audioTrack;
    })).toBe(true);
    await page.evaluate(async () => {
      const state = window.haAudioTest;
      state.card._liveAudioController.dispose();
      clearInterval(state.frames);
      state.stream.getTracks().forEach((track) => track.stop());
      state.oscillator.stop();
      await state.context.close();
    });
  });
}

for (const connectionType of ["frigate_go2rtc", "ha_direct"]) {
  test(`${connectionType} interrupted startup audio remains selected without readiness retries`, async ({ page }) => {
    await page.goto(baseUrl);
    const state = await page.evaluate(async (connectionType) => {
      await import("/frigate-view-card.js");
      customElements.define("audio-readiness-card", class extends customElements.get("frigate-view-card") {
        connectedCallback() {}
        disconnectedCallback() {}
      });
      const card = document.createElement("audio-readiness-card");
      card.setConfig({ cameras: [{ entity: "camera.front", connection_type: connectionType, start_unmuted: true }] });
      document.body.append(card);
      card._renderShell();
      card._setLiveMuted(true);
      const video = document.createElement("video");
      video.muted = true;
      const playStates = [];
      // Deterministic interrupted playback, not a simulation of iPhone policy.
      Object.defineProperty(video, "readyState", { value: 2 });
      video.play = () => {
        playStates.push(video.muted);
        return playStates.length === 1
          ? Promise.reject(new DOMException("Interrupted", "AbortError"))
          : Promise.resolve();
      };
      let engine = { type: connectionType, video };
      if (connectionType === "ha_direct") {
        const player = document.createElement("ha-web-rtc-player");
        player.attachShadow({ mode: "open" }).append(video);
        engine = document.createElement("div");
        engine.haDirectProvider = true;
        engine.attachShadow({ mode: "open" }).append(player);
      }
      card._liveAudioController.prepareCameraStart(card._config.cameras[0]);
      card._assignLiveEngine(engine);
      card._setActiveStreamType("webrtc");
      for (let index = 0; index < 4; index += 1) await Promise.resolve();
      const afterInterruption = { muted: video.muted, plays: playStates.length };
      video.dispatchEvent(new Event("canplay"));
      await Promise.resolve();
      video.dispatchEvent(new Event("canplay"));
      const retained = card._engine === engine;
      card._liveAudioController.applyMuteChange(true);
      video.dispatchEvent(new Event("loadeddata"));
      const manualMutePreserved = video.muted;
      card._liveAudioController.dispose();
      card.remove();
      return { afterInterruption, playStates, retained, manualMutePreserved };
    }, connectionType);
    expect(state).toEqual({
      afterInterruption: { muted: false, plays: 1 },
      playStates: [false], retained: true, manualMutePreserved: true,
    });
  });

  for (const blocked of [false, true]) {
    test(`${connectionType} startup audio follows takeover in the bundle (blocked=${blocked})`, async ({ page }) => {
      await page.goto(baseUrl);
      const state = await page.evaluate(async ({ connectionType, blocked }) => {
        await import("/frigate-view-card.js");
        customElements.define("audio-takeover-card", class extends customElements.get("frigate-view-card") {
          connectedCallback() {}
          disconnectedCallback() {}
        });
        const card = document.createElement("audio-takeover-card");
        card.setConfig({ cameras: [{ entity: "camera.front", connection_type: connectionType, start_unmuted: true }] });
        document.body.append(card);
        card._renderShell();
        card._isLikelyMobileClient = () => true;
        card._setLiveMuted(true);
        card._liveAudioController.prepareCameraStart(card._config.cameras[0]);
        let allowAudio = !blocked;
        const createResult = (type) => {
          const slot = document.createElement("div");
          const video = document.createElement("video");
          video.muted = true;
          Object.defineProperty(video, "readyState", { value: 0, configurable: true });
          // Model autoplay permission only; this test does not simulate iOS audio output.
          video.play = () => video.muted || allowAudio
            ? Promise.resolve()
            : Promise.reject(new DOMException("Blocked", "NotAllowedError"));
          slot.append(video);
          return { ok: true, type, slot, engine: { type: connectionType, video } };
        };
        const first = createResult(connectionType === "ha_direct" ? "hls" : "mse");
        const second = createResult("webrtc");
        const target = card.shadowRoot.querySelector("#engine");
        card._adoptLiveAttemptResult(target, first);
        for (let index = 0; index < 4; index += 1) await Promise.resolve();
        const beforeLoadedMuted = first.engine.video.muted;
        Object.defineProperty(first.engine.video, "readyState", { value: 2 });
        first.engine.video.dispatchEvent(new Event("loadeddata"));
        for (let index = 0; index < 4; index += 1) await Promise.resolve();
        const firstMuted = first.engine.video.muted;
        const oldVideo = first.engine.video;
        if (connectionType === "ha_direct") {
          // HA keeps its provider while replacing the selected child video.
          first.engine.video = second.engine.video;
          target.replaceChildren(second.slot);
          card._liveAudioController.applyCameraStartPreference();
          card._setActiveStreamType("webrtc");
        } else {
          card._adoptLiveAttemptResult(target, second);
        }
        for (let index = 0; index < 4; index += 1) await Promise.resolve();
        const takeoverBeforeLoadedMuted = second.engine.video.muted;
        Object.defineProperty(second.engine.video, "readyState", { value: 2 });
        second.engine.video.dispatchEvent(new Event("loadeddata"));
        for (let index = 0; index < 4; index += 1) await Promise.resolve();
        const takeoverMuted = second.engine.video.muted;
        allowAudio = true;
        oldVideo.dispatchEvent(new Event("touchend"));
        const afterOldTouch = second.engine.video.muted;
        second.engine.video.dispatchEvent(new Event("touchend"));
        const afterNewTouch = second.engine.video.muted;
        card._liveAudioController.dispose();
        card._liveMediaPresentationController?.clearVideoZoom();
        card.remove();
        return { beforeLoadedMuted, firstMuted, takeoverBeforeLoadedMuted, takeoverMuted, afterOldTouch, afterNewTouch };
      }, { connectionType, blocked });
      expect(state).toEqual({
        // ACC applies unmute/play as soon as the selected provider exists and
        // repeats it when media loads. A denied request falls back to muted
        // playback without adding a touch handler.
        beforeLoadedMuted: blocked,
        firstMuted: blocked,
        takeoverBeforeLoadedMuted: blocked,
        takeoverMuted: blocked,
        afterOldTouch: blocked,
        afterNewTouch: blocked,
      });
    });
  }
}

test("suspended Frigate cameras expose a transport-independent power control", async ({
  page,
}) => {
  await page.goto(baseUrl);
  const state = await page.evaluate(async () => {
    await import("/frigate-view-card.js");
    const serviceCalls = [];
    const card = document.createElement("frigate-view-card");
    document.body.append(card);
    card.setConfig({ cameras: [{ entity: "camera.front", name: "Front" }] });
    card._hass = {
      user: { is_admin: true },
      states: {
        "camera.front": {
          state: "idle",
          attributes: {
            client_id: "frigate-main",
            camera_name: "front",
            supported_features: 0,
          },
        },
      },
      callService: async (...args) => serviceCalls.push(args),
    };
    card._renderShell();
    card._frigateCameraRuntimeController.sync();

    const button = card.shadowRoot.querySelector("#live-camera-power-btn");
    const placeholder = card.shadowRoot.querySelector(
      "#camera-suspended-placeholder",
    );
    const suspendedState = {
      buttonHidden: button.hidden,
      pressed: button.getAttribute("aria-pressed"),
      label: button.getAttribute("aria-label"),
      placeholderHidden: placeholder.hidden,
      stageSuspended: card.shadowRoot
        .querySelector("#live-stage")
        .classList.contains("camera-runtime-suspended"),
    };

    const primaryPane = card.shadowRoot.querySelector(
      ".camera-group-live-pane--primary",
    );
    const placeholderRect = placeholder.getBoundingClientRect();
    const paneRect = primaryPane.getBoundingClientRect();
    suspendedState.placeholderWidthDelta = Math.abs(
      placeholderRect.width - paneRect.width,
    );
    suspendedState.placeholderHeightDelta = Math.abs(
      placeholderRect.height - paneRect.height,
    );

    button.click();
    const modal = card.shadowRoot.querySelector(
      "#camera-runtime-confirmation-modal",
    );
    const title = modal.querySelector("#camera-runtime-confirmation-title");
    const detail = modal.querySelector("#camera-runtime-confirmation-detail");
    const warning = modal.querySelector(
      "#camera-runtime-confirmation-warning",
    );
    const submit = modal.querySelector("#camera-runtime-confirmation-submit");
    const cardSurface = card.shadowRoot.querySelector("#card");
    const resumeModalRect = modal.getBoundingClientRect();
    const cardRect = cardSurface.getBoundingClientRect();
    const resumeDialog = {
      hidden: modal.hidden,
      action: modal.dataset.cameraRuntimeAction,
      title: title.textContent,
      detail: detail.textContent,
      warningHidden: warning.hidden,
      submit: submit.textContent,
      parentId: modal.parentElement?.id,
      widthDelta: Math.abs(resumeModalRect.width - cardRect.width),
      heightDelta: Math.abs(resumeModalRect.height - cardRect.height),
      backdrop: getComputedStyle(
        modal.querySelector(".camera-runtime-confirmation-backdrop"),
      ).backgroundColor,
      serviceCallsBeforeConfirmation: serviceCalls.length,
    };
    submit.click();
    await new Promise((resolve) => setTimeout(resolve, 0));
    card._hass.states["camera.front"] = {
      state: "recording",
      attributes: {
        client_id: "frigate-main",
        camera_name: "front",
        supported_features: 1,
      },
    };
    card._frigateCameraRuntimeController.reconcileHass();
    const toast = card.shadowRoot.querySelector("#toast");
    const liveStage = card.shadowRoot.querySelector("#live-stage");
    const toastRect = toast.getBoundingClientRect();
    const liveRect = liveStage.getBoundingClientRect();
    const resumedState = {
      pressed: button.getAttribute("aria-pressed"),
      label: button.getAttribute("aria-label"),
      placeholderHidden: placeholder.hidden,
      toast: {
        text: toast.textContent,
        placement: toast.dataset.placement,
        liveClass: toast.classList.contains("toast--live"),
        centerOffset: Math.abs(
          toastRect.left + toastRect.width / 2 -
            (liveRect.left + liveRect.width / 2),
        ),
        topOffset: toastRect.top - liveRect.top,
      },
    };

    card._hass.states["camera.front"] = {
      state: "idle",
      attributes: {
        client_id: "frigate-main",
        camera_name: "front",
        supported_features: 0,
      },
    };
    card._frigateCameraRuntimeController.reconcileHass();
    card._syncStatus();
    const resumedIdleState = {
      available:
        card._frigateCameraRuntimeController.isAvailable("camera.front"),
      buttonLabel: button.getAttribute("aria-label"),
      placeholderHidden: placeholder.hidden,
      status: card.shadowRoot.querySelector("#on-lbl")?.textContent || "",
    };

    button.click();
    const suspendDialog = {
      hidden: modal.hidden,
      action: modal.dataset.cameraRuntimeAction,
      title: title.textContent,
      detail: detail.textContent,
      warning: warning.textContent,
      warningHidden: warning.hidden,
      submit: submit.textContent,
      serviceCallsBeforeConfirmation: serviceCalls.length,
    };
    const outsideCard = document.createElement("button");
    document.body.appendChild(outsideCard);
    outsideCard.click();
    outsideCard.remove();
    const cancelled = {
      hidden: modal.hidden,
      serviceCalls: serviceCalls.length,
    };
    button.click();
    submit.click();
    await new Promise((resolve) => setTimeout(resolve, 0));
    card._hass.states["camera.front"] = {
      state: "idle",
      attributes: {
        client_id: "frigate-main",
        camera_name: "front",
        supported_features: 0,
      },
    };
    card._frigateCameraRuntimeController.reconcileHass();
    const suspendedToast = {
      text: toast.textContent,
      placement: toast.dataset.placement,
      liveClass: toast.classList.contains("toast--live"),
    };
    card._hass.user = { is_admin: false };
    card._frigateCameraRuntimeController.sync();
    const adminOnlyAccess = {
      hidden: button.hidden,
      allowed: card._frigateCameraRuntimeController.canManageCameraSuspension(),
    };
    card._config.camera_suspend_access = "everyone";
    card._frigateCameraRuntimeController.sync();
    const everyoneAccess = {
      hidden: button.hidden,
      allowed: card._frigateCameraRuntimeController.canManageCameraSuspension(),
    };
    card._hass.user = { is_admin: true };
    card._config.camera_suspend_access = "disabled";
    card._frigateCameraRuntimeController.sync();
    const disabledAccess = {
      hidden: button.hidden,
      allowed: card._frigateCameraRuntimeController.canManageCameraSuspension(),
    };
    card._frigateCameraRuntimeController.dispose();
    card.remove();
    return {
      suspendedState,
      resumeDialog,
      resumedState,
      resumedIdleState,
      suspendDialog,
      cancelled,
      suspendedToast,
      adminOnlyAccess,
      everyoneAccess,
      disabledAccess,
      serviceCalls,
    };
  });

  expect(state.suspendedState).toMatchObject({
    buttonHidden: false,
    pressed: "true",
    label: "Resume camera",
    placeholderHidden: false,
    stageSuspended: true,
  });
  expect(state.suspendedState.placeholderWidthDelta).toBeLessThan(2);
  expect(state.suspendedState.placeholderHeightDelta).toBeLessThan(2);
  expect(state).toMatchObject({
    resumeDialog: {
      hidden: false,
      action: "resume",
      title: "Resume camera?",
      detail:
        "Resuming this camera in Frigate restores live video, recordings, and detections. Frigate may need a short time before live video and new events become available.",
      warningHidden: true,
      submit: "Resume camera",
      parentId: "card",
      backdrop: "rgba(0, 0, 0, 0.68)",
      serviceCallsBeforeConfirmation: 0,
    },
    resumedState: {
      pressed: "false",
      label: "Suspend camera",
      placeholderHidden: true,
      toast: {
        text: "Camera resumed",
        placement: "live",
        liveClass: true,
      },
    },
    resumedIdleState: {
      available: true,
      buttonLabel: "Suspend camera",
      placeholderHidden: true,
      status: "Online",
    },
    suspendDialog: {
      hidden: false,
      action: "suspend",
      title: "Suspend camera?",
      detail:
        "Suspending this camera in Frigate stops live video, recordings, and detections. Existing alerts, clips, snapshots, and recordings remain available in the card. If Frigate restarts, Frigate will lift this suspension automatically.",
      warning:
        "Warning: Suspending this camera disables live view and recording in Frigate, Home Assistant, and FrigateView Card. It does not stop recording to the camera’s SD card or prevent direct live connections through go2rtc.",
      warningHidden: false,
      submit: "Suspend camera",
      serviceCallsBeforeConfirmation: 1,
    },
    cancelled: {
      hidden: true,
      serviceCalls: 1,
    },
    suspendedToast: {
      text: "Camera suspended",
      placement: "live",
      liveClass: true,
    },
    adminOnlyAccess: {
      hidden: true,
      allowed: false,
    },
    everyoneAccess: {
      hidden: false,
      allowed: true,
    },
    disabledAccess: {
      hidden: true,
      allowed: false,
    },
    serviceCalls: [
      ["camera", "turn_on", {}, { entity_id: "camera.front" }],
      ["camera", "turn_off", {}, { entity_id: "camera.front" }],
    ],
  });
  expect(state.resumedState.toast.centerOffset).toBeLessThan(2);
  expect(state.resumedState.toast.topOffset).toBeGreaterThanOrEqual(10);
  expect(state.resumedState.toast.topOffset).toBeLessThanOrEqual(14);
  expect(state.resumeDialog.widthDelta).toBeLessThanOrEqual(2);
  expect(state.resumeDialog.heightDelta).toBeLessThanOrEqual(2);
});

test("camera suspension access is one global editor setting", async ({ page }) => {
  await page.goto(baseUrl);
  const state = await page.evaluate(async () => {
    await import("/frigate-view-card-editor.js");
    const editor = document.createElement("frigate-view-card-editor");
    document.body.append(editor);
    editor.setConfig({
      cameras: [
        { entity: "camera.front", name: "Front" },
        { entity: "camera.back", name: "Back" },
      ],
    });
    const adminOnly = editor.querySelector(
      '[name="camera_suspend_access"][value="admin_only"]',
    );
    const everyone = editor.querySelector(
      '[name="camera_suspend_access"][value="everyone"]',
    );
    const disabled = editor.querySelector(
      '[name="camera_suspend_access"][value="disabled"]',
    );
    const previewDrafts = [];
    window.addEventListener(
      "frigate-view-card-preview-draft",
      (event) => previewDrafts.push(event.detail?.config),
    );

    everyone.checked = true;
    everyone.dispatchEvent(new Event("change", { bubbles: true }));
    await new Promise((resolve) =>
      requestAnimationFrame(() => requestAnimationFrame(resolve)),
    );
    const everyonePersisted =
      editor._config.camera_suspend_access === "everyone" &&
      previewDrafts.some(
        (draft) => draft?.camera_suspend_access === "everyone",
      );
    const renderedDisabled = editor.querySelector(
      '[name="camera_suspend_access"][value="disabled"]',
    );
    renderedDisabled.checked = true;
    renderedDisabled.dispatchEvent(new Event("change", { bubbles: true }));
    await new Promise((resolve) =>
      requestAnimationFrame(() => requestAnimationFrame(resolve)),
    );

    return {
      label: editor.querySelector(
        '[data-fvc-i18n="editor.cameraPanel.suspendAccess"]',
      ).textContent,
      adminDefault: adminOnly.defaultChecked || adminOnly.hasAttribute("checked"),
      disabledLabel: disabled.getAttribute("aria-label"),
      everyonePersisted,
      selected: editor._config.camera_suspend_access,
      saved: editor._homeAssistantConfig({ readDom: false })
        .camera_suspend_access,
      preview: previewDrafts.at(-1)?.camera_suspend_access,
      dirty: editor._hasConfigDraft,
      cameraValuesAbsent: editor._config.cameras.every(
        (camera) => !Object.hasOwn(camera, "camera_suspend_access"),
      ),
      renderedSelection: editor.querySelector(
        '[name="camera_suspend_access"][value="disabled"]',
      )?.checked,
    };
  });

  expect(state).toEqual({
    label: "Who can Suspend a Camera",
    adminDefault: true,
    disabledLabel: "Disabled",
    everyonePersisted: true,
    selected: "disabled",
    saved: "disabled",
    preview: "disabled",
    dirty: true,
    cameraValuesAbsent: true,
    renderedSelection: true,
  });
});

test("camera connection settings explain transport capabilities", async ({ page }) => {
  await page.setViewportSize({ width: 480, height: 900 });
  await page.goto(baseUrl);
  const state = await page.evaluate(async () => {
    await import("/frigate-view-card-editor.js");
    const editor = document.createElement("frigate-view-card-editor");
    document.body.append(editor);
    editor.setConfig({
      cameras: [{ entity: "camera.front", name: "Front" }],
    });
    editor.hass = { locale: { language: "en" }, states: {}, themes: {} };
    editor._openCameraModal(0);
    editor._setCameraModalAccordionActive("connection");
    const guide = editor.querySelector("#camera-modal-connection-help");
    guide.open = true;
    const wrapper = guide.querySelector(".camera-connection-table-wrap");
    const content = editor.querySelector("#camera-modal-connection-content");
    const wrapperRect = wrapper.getBoundingClientRect();
    const contentRect = content.getBoundingClientRect();

    return {
      title: guide.querySelector("summary").textContent,
      intro: guide.querySelector(".camera-connection-help-copy p").textContent,
      rows: [...guide.querySelectorAll("tbody tr")].map((row) => ({
        feature: row.querySelector("th").textContent,
        values: [...row.querySelectorAll("td")].map((cell) =>
          cell.textContent.trim(),
        ),
      })),
      statuses: {
        yes: guide.querySelectorAll(".camera-connection-capability--yes").length,
        limited: guide.querySelectorAll(
          ".camera-connection-capability--limited",
        ).length,
        no: guide.querySelectorAll(".camera-connection-capability--no").length,
      },
      contained:
        wrapperRect.left >= contentRect.left &&
        wrapperRect.right <= contentRect.right,
      horizontallyScrollable: wrapper.scrollWidth >= wrapper.clientWidth,
    };
  });

  expect(state.title).toBe("Which connection should I use?");
  expect(state.intro).toContain("starts each camera on demand when you select it");
  expect(state.intro).toContain("starts all cameras configured for that mode one at a time when the card loads");
  expect(state.intro).toContain("beginning with the selected camera, and retains their live connections");
  expect(state.intro).not.toMatch(/fastest|recommended for most browsers/i);
  expect(state.rows).toEqual([
    { feature: "WebRTC", values: ["✓Supported", "✓Supported"] },
    { feature: "MSE", values: ["×Not used", "✓Supported"] },
    { feature: "HLS", values: ["✓Supported", "×Not available"] },
    {
      feature: "Two-Way Talk",
      values: ["!Supported; slower", "✓Supported"],
    },
    { feature: "PTZ", values: ["✓Supported", "✓Supported"] },
    {
      feature: "Camera startup",
      values: [
        "All HA Direct cameras, one at a time on card load",
        "When selected (on demand)",
      ],
    },
  ]);
  expect(state.statuses).toEqual({ yes: 7, limited: 1, no: 2 });
  expect(state.contained).toBe(true);
  expect(state.horizontallyScrollable).toBe(true);
});

test("phone startup defers non-visible browse warming until delayed idle", async ({
  browser,
}) => {
  const context = await browser.newContext({
    hasTouch: true,
    userAgent:
      "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148",
    viewport: { width: 390, height: 844 },
  });
  const page = await context.newPage();
  await page.goto(baseUrl);

  const state = await page.evaluate(async () => {
    await import("/frigate-view-card.js");
    const card = document.createElement("frigate-view-card");
    document.body.append(card);
    card.setConfig({ cameras: [{ entity: "camera.front" }] });

    const calls = [];
    let resolveInitialLoad;
    let runDelay = null;
    let runIdle = null;
    const initialLoad = new Promise((resolve) => {
      resolveInitialLoad = resolve;
    });

    card._discoverAll = async () => {};
    card._browseWindowLoaderController.loadWindow = () => initialLoad;
    card._browseWindowLoaderController.scheduleWarmOtherCamerasEvents =
      (delayMs) => calls.push(["warm", delayMs]);
    card._prefetchCalendarActivityForActiveCamera = async () =>
      calls.push(["calendar"]);
    card._browseBackgroundWorkController._setTimer = (callback, delayMs) => {
      calls.push(["delay", delayMs]);
      runDelay = callback;
      return 1;
    };
    card._browseBackgroundWorkController._clearTimer = () => {};
    card._browseBackgroundWorkController._requestIdle = (callback, options) => {
      calls.push(["idle", options.timeout]);
      runIdle = callback;
      return 2;
    };
    card._browseBackgroundWorkController._cancelIdle = () => {};
    card._mountEngine = () => {};
    card._renderAll = () => {};
    card._subscribe = () => {};
    card._startEditModeWatchdog = () => {};
    card._startEditorDialogCloseObserver = () => {};
    card._restartRealtimeHeadPollTimer = () => {};
    card._setupResizeObserver = () => {};

    const startup = card._start();
    await Promise.resolve();
    await Promise.resolve();
    const beforeInitialLoad = [...calls];

    resolveInitialLoad();
    await startup;
    await Promise.resolve();
    const afterInitialLoad = [...calls];

    runDelay?.();
    const afterDelay = [...calls];
    runIdle?.();
    const afterIdle = [...calls];

    clearInterval(card._refresh);
    card._refresh = null;
    card.remove();
    return {
      beforeInitialLoad,
      afterInitialLoad,
      afterDelay,
      afterIdle,
    };
  });

  expect(state).toEqual({
    beforeInitialLoad: [],
    afterInitialLoad: [["delay", 2500]],
    afterDelay: [
      ["delay", 2500],
      ["idle", 5000],
    ],
    afterIdle: [
      ["delay", 2500],
      ["idle", 5000],
      ["warm", 0],
      ["calendar"],
    ],
  });
  await context.close();
});

test("Grid runtime stays dormant until desktop Grid is requested", async ({
  page,
}) => {
  let gridRequests = 0;
  page.on("request", (request) => {
    if (new URL(request.url()).pathname === "/frigate-view-card-grid.js") {
      gridRequests += 1;
    }
  });
  await page.goto(baseUrl);

  const state = await page.evaluate(async () => {
    await import("/frigate-view-card.js");
    const card = document.createElement("frigate-view-card");
    document.body.append(card);
    card.setConfig({
      cameras: [
        { entity: "camera.front" },
        { entity: "camera.back" },
      ],
      grid_mode_enabled: true,
      landing_page: "single-view",
      single_view_start_mode: "live",
    });
    const before = card._gridFeatureController.isLoaded();
    await card._gridFeatureController.prepare();
    return {
      before,
      after: card._gridFeatureController.isLoaded(),
      available: card._isGridModeAvailable(),
    };
  });

  expect(gridRequests).toBe(1);
  expect(state).toEqual({ before: false, after: true, available: true });
});

test("phone clients never request the Grid runtime", async ({ browser }) => {
  const context = await browser.newContext({
    hasTouch: true,
    userAgent:
      "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148",
    viewport: { width: 390, height: 844 },
  });
  const page = await context.newPage();
  let gridRequests = 0;
  page.on("request", (request) => {
    if (new URL(request.url()).pathname === "/frigate-view-card-grid.js") {
      gridRequests += 1;
    }
  });
  await page.goto(baseUrl);

  const state = await page.evaluate(async () => {
    await import("/frigate-view-card.js");
    const card = document.createElement("frigate-view-card");
    document.body.append(card);
    card.setConfig({
      cameras: [
        { entity: "camera.front" },
        { entity: "camera.back" },
      ],
      grid_mode_enabled: true,
      landing_page: "single-view",
      single_view_start_mode: "grid",
    });
    const prepared = await card._gridFeatureController.prepare();
    return {
      available: card._isGridModeAvailable(),
      loaded: card._gridFeatureController.isLoaded(),
      prepared: Boolean(prepared),
    };
  });

  await context.close();
  expect(gridRequests).toBe(0);
  expect(state).toEqual({
    available: false,
    loaded: false,
    prepared: false,
  });
});

test("Slideshow runtime stays dormant until enabled Slideshow is requested", async ({
  page,
}) => {
  let slideshowRequests = 0;
  page.on("request", (request) => {
    if (
      new URL(request.url()).pathname ===
      "/frigate-view-card-slideshow.js"
    ) {
      slideshowRequests += 1;
    }
  });
  await page.goto(baseUrl);

  const state = await page.evaluate(async () => {
    await import("/frigate-view-card.js");
    const disabled = document.createElement("frigate-view-card");
    document.body.append(disabled);
    disabled.setConfig({
      cameras: [
        { entity: "camera.front" },
        { entity: "camera.back" },
      ],
      slideshow_rotation_enabled: false,
    });
    const disabledPreparation =
      await disabled._slideshowFeatureController.prepare();

    const enabled = document.createElement("frigate-view-card");
    document.body.append(enabled);
    enabled.setConfig({
      cameras: [
        { entity: "camera.front" },
        { entity: "camera.back" },
      ],
      slideshow_rotation_enabled: true,
      single_view_start_mode: "live",
    });
    const beforeActivation = enabled._slideshowFeatureController.isLoaded();
    enabled._slideshowPageController.toggle();
    await enabled._slideshowFeatureController.prepare();
    await new Promise((resolve) => setTimeout(resolve, 0));

    return {
      disabledAvailable: disabled._slideshowPageController.available(),
      disabledLoaded: disabled._slideshowFeatureController.isLoaded(),
      disabledPrepared: Boolean(disabledPreparation),
      beforeActivation,
      afterActivation: enabled._slideshowFeatureController.isLoaded(),
      active: enabled._slideshowActive,
    };
  });

  expect(slideshowRequests).toBe(1);
  expect(state).toEqual({
    disabledAvailable: false,
    disabledLoaded: false,
    disabledPrepared: false,
    beforeActivation: false,
    afterActivation: true,
    active: true,
  });
});

test("Slideshow runtime is ready before a configured landing page starts it", async ({
  page,
}) => {
  let slideshowRequests = 0;
  page.on("request", (request) => {
    if (
      new URL(request.url()).pathname ===
      "/frigate-view-card-slideshow.js"
    ) {
      slideshowRequests += 1;
    }
  });
  await page.goto(baseUrl);

  const state = await page.evaluate(async () => {
    await import("/frigate-view-card.js");
    const card = document.createElement("frigate-view-card");
    document.body.append(card);
    card.setConfig({
      cameras: [
        { entity: "camera.front" },
        { entity: "camera.back" },
      ],
      landing_page: "single-view",
      single_view_start_mode: "slideshow",
      slideshow_rotation_enabled: true,
    });
    card._discoverAll = async () => {};
    card._browseWindowLoaderController.loadWindow = async () => {};
    card._browseWindowLoaderController.scheduleWarmOtherCamerasEvents =
      () => {};
    card._mountEngine = () => {};
    card._renderAll = () => {};
    card._prefetchCalendarActivityForActiveCamera = async () => {};
    card._subscribe = () => {};
    card._startEditModeWatchdog = () => {};
    card._startEditorDialogCloseObserver = () => {};
    card._restartRealtimeHeadPollTimer = () => {};
    card._setupResizeObserver = () => {};

    await card._start();
    clearInterval(card._refresh);
    card._refresh = null;

    return {
      pageId: card._pageId,
      loaded: card._slideshowFeatureController.isLoaded(),
      active: card._slideshowActive,
    };
  });

  expect(slideshowRequests).toBe(1);
  expect(state).toEqual({
    pageId: "single-view",
    loaded: true,
    active: true,
  });
});

test("Preview Page stays dormant until its enabled route is requested", async ({
  page,
}) => {
  let previewRequests = 0;
  page.on("request", (request) => {
    if (
      new URL(request.url()).pathname ===
      "/frigate-view-card-preview.js"
    ) {
      previewRequests += 1;
    }
  });
  await page.goto(baseUrl);

  const state = await page.evaluate(async () => {
    await import("/frigate-view-card.js");
    const card = document.createElement("frigate-view-card");
    document.body.append(card);
    card.setConfig({
      cameras: [{ entity: "camera.front", name: "Front" }],
      landing_page: "single-view",
      preview_page_enabled: true,
    });
    const before = {
      delegate: Boolean(card._previewPageController._runtime._pageDelegate),
      pageId: card._pageId,
    };

    card._pageNavigationController.navigateToPageRoute("preview", {
      source: "lazy-preview-test",
    });
    await card._previewPageController.prepare();

    const style = card.shadowRoot.querySelector(
      "style[data-fvc-preview-page-styles]",
    );
    return {
      before,
      after: {
        delegate: Boolean(card._previewPageController._runtime._pageDelegate),
        pageId: card._pageId,
        previewLayout: card.shadowRoot
          .querySelector("#layout")
          ?.classList.contains("layout--preview-view"),
        previewShell: Boolean(card.shadowRoot.querySelector("#preview-shell")),
        stylesInstalled: Boolean(style?.textContent?.trim()),
      },
    };
  });

  expect(state).toEqual({
    before: { delegate: false, pageId: "single-view" },
    after: {
      delegate: true,
      pageId: "preview",
      previewLayout: true,
      previewShell: true,
      stylesInstalled: true,
    },
  });
  expect(previewRequests).toBe(1);
});

test("mobile startup preloads enabled Preview and hydrates immediate navigation on a slow download", async ({ page }) => {
  let previewRequests = 0;
  let releaseDownload;
  const downloadGate = new Promise((resolve) => { releaseDownload = resolve; });
  await page.route("**/frigate-view-card-preview.js?*", async (route) => {
    previewRequests += 1;
    await downloadGate;
    await route.continue();
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(baseUrl);
  await page.evaluate(async () => {
    await import("/frigate-view-card.js");
    const card = document.createElement("frigate-view-card");
    document.body.append(card);
    card.setConfig({
      cameras: [{ entity: "camera.front", name: "Front" }],
      landing_page: "mobile-view", preview_page_enabled: true,
    });
    card._isLikelyMobileClient = () => true;
    card._discoverAll = async () => {};
    card._browseWindowLoaderController.loadWindow = async () => {};
    card._browseBackgroundWorkController.scheduleStartup = () => {};
    card._previewAlertController.start = () => {};
    card._mountEngine = () => {};
    card._renderAll = () => {};
    card._subscribe = () => {};
    card._startEditModeWatchdog = () => {};
    card._startEditorDialogCloseObserver = () => {};
    card._restartRealtimeHeadPollTimer = () => {};
    card._setupResizeObserver = () => {};
    await card._start();
    clearInterval(card._refresh);
    card._refresh = null;
    window.previewStartupCard = card;
  });
  await expect.poll(() => previewRequests).toBe(1);
  expect(await page.evaluate(() => ({
    page: window.previewStartupCard._pageId,
    delegate: Boolean(window.previewStartupCard._previewPageController._runtime._pageDelegate),
    previewTimer: Boolean(window.previewStartupCard._previewTimer),
  }))).toEqual({ page: "mobile-view", delegate: false, previewTimer: false });
  // Navigate before the cellular download finishes; it must hydrate without
  // another visit or a second asset request, and retain its independent CSS.
  await page.evaluate(() => window.previewStartupCard._pageNavigationController.navigateToPageRoute("preview"));
  releaseDownload();
  await expect.poll(() => page.evaluate(() => {
    const root = window.previewStartupCard.shadowRoot;
    return Boolean(root.querySelector("#preview-shell") &&
      root.querySelector("style[data-fvc-preview-page-styles]")?.textContent.trim());
  })).toBe(true);
  expect(await page.evaluate(() => window.previewStartupCard._pageId)).toBe("preview");
  expect(previewRequests).toBe(1);
});

test("Recordings navigation stays dormant until the Recordings tab is requested", async ({
  page,
}) => {
  let recordingsRequests = 0;
  page.on("request", (request) => {
    if (
      new URL(request.url()).pathname ===
      "/frigate-view-card-recordings.js"
    ) {
      recordingsRequests += 1;
    }
  });
  await page.goto(baseUrl);

  const state = await page.evaluate(async () => {
    await import("/frigate-view-card.js");
    const card = document.createElement("frigate-view-card");
    document.body.append(card);
    card.setConfig({
      cameras: [{ entity: "camera.front", name: "Front" }],
      landing_page: "single-view",
    });
    const before = Boolean(
      card._recordingsBrowseNavController._delegate,
    );

    card._tab = "recordings";
    card._recordingsBrowseNavController.prepareBrowseNav();
    await card._recordingsBrowseNavController.prepare();

    return {
      before,
      after: Boolean(card._recordingsBrowseNavController._delegate),
    };
  });

  expect(state).toEqual({ before: false, after: true });
  expect(recordingsRequests).toBe(1);
});

test("Preview Page is ready before a configured landing route activates", async ({
  page,
}) => {
  let previewRequests = 0;
  page.on("request", (request) => {
    if (
      new URL(request.url()).pathname ===
      "/frigate-view-card-preview.js"
    ) {
      previewRequests += 1;
    }
  });
  await page.goto(baseUrl);

  const state = await page.evaluate(async () => {
    await import("/frigate-view-card.js");
    const card = document.createElement("frigate-view-card");
    document.body.append(card);
    card.setConfig({
      cameras: [{ entity: "camera.front", name: "Front" }],
      landing_page: "preview",
      preview_page_enabled: true,
    });
    card._discoverAll = async () => {};
    card._browseWindowLoaderController.loadWindow = async () => {};
    card._browseWindowLoaderController.scheduleWarmOtherCamerasEvents =
      () => {};
    card._browseWindowLoaderController.warmVisibleCameraReviews =
      async () => {};
    card._previewAlertController.start = () => {};
    card._renderAll = () => {};
    card._prefetchCalendarActivityForActiveCamera = async () => {};
    card._subscribe = () => {};
    card._startEditModeWatchdog = () => {};
    card._startEditorDialogCloseObserver = () => {};
    card._restartRealtimeHeadPollTimer = () => {};
    card._setupResizeObserver = () => {};

    await card._start();
    clearInterval(card._refresh);
    card._refresh = null;

    return {
      pageId: card._pageId,
      delegate: Boolean(card._previewPageController._runtime._pageDelegate),
      previewLayout: card.shadowRoot
        .querySelector("#layout")
        ?.classList.contains("layout--preview-view"),
      previewShell: Boolean(card.shadowRoot.querySelector("#preview-shell")),
    };
  });

  expect(previewRequests).toBe(1);
  expect(state).toEqual({
    pageId: "preview",
    delegate: true,
    previewLayout: true,
    previewShell: true,
  });
});

test("Wide View core stays dormant until an enabled desktop route enters it", async ({
  page,
}) => {
  let wideViewRequests = 0;
  page.on("request", (request) => {
    if (
      new URL(request.url()).pathname ===
      "/frigate-view-card-wide-view.js"
    ) {
      wideViewRequests += 1;
    }
  });
  await page.goto(baseUrl);

  const state = await page.evaluate(async () => {
    await import("/frigate-view-card.js");
    const card = document.createElement("frigate-view-card");
    document.body.append(card);
    card.setConfig({
      cameras: [{ entity: "camera.front", name: "Front" }],
      landing_page: "single-view",
      wide_view_page_enabled: true,
    });
    const before = {
      delegate: Boolean(card._wideViewPageController._delegate),
      pageId: card._pageId,
    };

    card._pageNavigationController.navigateToPageRoute("wide-view", {
      source: "lazy-wide-view-test",
    });
    await card._wideViewPageController.prepare();

    const style = card.shadowRoot.querySelector(
      "style[data-fvc-wide-view-page-styles]",
    );
    return {
      before,
      after: {
        delegate: Boolean(card._wideViewPageController._delegate),
        pageId: card._pageId,
        wideLayout: card.shadowRoot
          .querySelector("#layout")
          ?.classList.contains("layout--wide-view"),
        stylesInstalled: Boolean(style?.textContent?.trim()),
      },
    };
  });

  expect(state).toEqual({
    before: { delegate: false, pageId: "single-view" },
    after: {
      delegate: true,
      pageId: "wide-view",
      wideLayout: true,
      stylesInstalled: true,
    },
  });
  expect(wideViewRequests).toBe(1);
});

test("phone routing never requests the Wide View core asset", async ({
  browser,
}) => {
  const context = await browser.newContext({
    hasTouch: true,
    userAgent:
      "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148",
    viewport: { width: 390, height: 844 },
  });
  const page = await context.newPage();
  let wideViewRequests = 0;
  page.on("request", (request) => {
    if (
      new URL(request.url()).pathname ===
      "/frigate-view-card-wide-view.js"
    ) {
      wideViewRequests += 1;
    }
  });
  await page.goto(baseUrl);

  const state = await page.evaluate(async () => {
    await import("/frigate-view-card.js");
    const card = document.createElement("frigate-view-card");
    document.body.append(card);
    card.setConfig({
      cameras: [{ entity: "camera.front", name: "Front" }],
      landing_page: "wide-view",
      mobile_page: "single-view",
      wide_view_page_enabled: true,
    });
    const resolved = card._pageNavigationController.navigateToPageRoute(
      "wide-view",
      { source: "phone-wide-view-test" },
    );
    const prepared = await card._wideViewPageController.prepare();
    return {
      available: card._pageNavigationController.pageRouteOptions(),
      delegate: Boolean(card._wideViewPageController._delegate),
      pageId: card._pageId,
      prepared: prepared !== null,
      resolved,
    };
  });

  await context.close();
  expect(state.available).not.toContain("wide-view");
  expect(state).toMatchObject({
    delegate: false,
    pageId: "single-view",
    prepared: false,
    resolved: "single-view",
  });
  expect(wideViewRequests).toBe(0);
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

test("ordinary card overlays stay below a bottom navbar while rotated fullscreen stays above it", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 700 });
  await page.goto(baseUrl);
  const state = await page.evaluate(async () => {
    await import("/frigate-view-card.js");
    document.body.style.margin = "0";
    const style = document.createElement("style");
    style.textContent = `
      .ha-header { position:fixed;z-index:2;inset:auto 0 0;height:70px;background:#fff; }
    `;
    const card = document.createElement("frigate-view-card");
    card.style.width = "390px";
    card.style.setProperty("--card-host-height", "700px");
    card.setConfig({
      cameras: [{ entity: "camera.front", name: "Front" }],
      mobile_view_rotate_to_fullscreen: true,
    });
    document.body.append(style, card);
    const probe = document.createElement("div");
    probe.dataset.testCardOverlay = "";
    probe.style.cssText =
      "position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,.01)";
    card.shadowRoot.append(probe);
    const header = document.createElement("div");
    header.className = "ha-header";
    document.body.append(header);

    const normalHit = document.elementFromPoint(195, 680);
    const isolation = getComputedStyle(card).isolation;
    card.style.setProperty("--rotate-vw", "390px");
    card.style.setProperty("--rotate-vh", "700px");
    card.style.setProperty("--rotate-ox", "0px");
    card.style.setProperty("--rotate-oy", "0px");
    card.classList.add("mobile-view-rotate-cover");
    const rotatedHit = card.shadowRoot.elementFromPoint(195, 680);

    return {
      isolation,
      normalNavbarWins:
        normalHit === header || Boolean(normalHit?.closest?.(".ha-header")),
      rotatedCardWins:
        rotatedHit === probe ||
        Boolean(rotatedHit?.closest?.("[data-test-card-overlay]")),
      rotatedZIndex: getComputedStyle(card).zIndex,
    };
  });

  expect(state).toEqual({
    isolation: "isolate",
    normalNavbarWins: true,
    rotatedCardWins: true,
    rotatedZIndex: "3000",
  });
});

test("Single View preserves source and alerts below the online-status breakpoint", async ({
  page,
}) => {
  await page.goto(baseUrl);
  const state = await page.evaluate(async () => {
    await import("/frigate-view-card.js");
    document.body.style.margin = "0";
    const card = document.createElement("frigate-view-card");
    card.style.setProperty("--card-host-height", "600px");
    document.body.append(card);
    card.setConfig({
      cameras: [
        {
          entity: "camera.front",
          name: "Doorbell",
          two_way_talk: true,
          linked_entities: [{ entity: "light.porch" }],
        },
      ],
      title: "FrigateView",
      subtitle: "Doorbell",
    });
    card._pageId = "single-view";
    card._hass = {
      states: { "light.porch": { state: "off", attributes: {} } },
    };
    card._renderShell();
    await card._linkedLightController._ensureDelegate();
    card._linkedLightController.sync();
    const root = card.shadowRoot;

    const read = async (width) => {
      card.style.width = `${width}px`;
      await new Promise((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(resolve)),
      );
      const infoRowRect = root.querySelector(".info-row").getBoundingClientRect();
      const microphoneRect = root
        .querySelector("#two-way-talk-btn")
        .getBoundingClientRect();
      return {
        alertDisplay: getComputedStyle(
          root.querySelector(".info-alert-stat"),
        ).display,
        sourceDisplay: getComputedStyle(
          root.querySelector(".info-stream-stat"),
        ).display,
        statsDisplay: getComputedStyle(root.querySelector(".stats")).display,
        onlineDisplay: getComputedStyle(
          root.querySelector(".info-online-stat"),
        ).display,
        microphoneCentered:
          Math.abs(
            microphoneRect.left +
              microphoneRect.width / 2 -
              (infoRowRect.left + infoRowRect.width / 2),
          ) <= 0.5,
        linkedLightVisible:
          getComputedStyle(root.querySelector("[data-linked-light]")).display !==
          "none",
      };
    };

    return {
      at410: await read(410),
      at380: await read(380),
    };
  });

  expect(state.at410).toEqual({
    alertDisplay: "flex",
    sourceDisplay: "flex",
    statsDisplay: "flex",
    onlineDisplay: "none",
    microphoneCentered: true,
    linkedLightVisible: true,
  });
  expect(state.at380).toMatchObject({
    alertDisplay: "none",
    statsDisplay: "none",
    onlineDisplay: "none",
    microphoneCentered: true,
    linkedLightVisible: true,
  });
});

test("bottom HA navbar keeps its layout anchor while painting at the viewport bottom", async ({
  browserName,
  page,
}) => {
  await page.setViewportSize({ width: 412, height: 823 });
  await page.goto(baseUrl);

  const state = await page.evaluate(async () => {
    const { HomeAssistantNavbarController } = await import(
      "/frigate-view-card-navbar.js"
    );
    document.body.style.margin = "0";
    const huiRoot = document.createElement("div");
    const root = huiRoot.attachShadow({ mode: "open" });
    root.innerHTML = `
      <style>
        :host { display: block; width: 100%; height: 823px; }
        .header { position: fixed; inset: 0 0 auto; background: red; }
        .toolbar { height: 56px; }
        .toolbar-child {
          display: flex;
          justify-content: center;
          width: 308px;
          height: 56px;
          margin: auto;
        }
        ha-tab-group-tab { display: inline-flex; font-size: 16px; }
        ha-tab-group-tab ha-icon {
          display: inline-block;
          width: 24px;
          margin-inline-end: 12px;
        }
        #view { box-sizing: border-box; height: 823px; padding-top: 56px; }
        hui-view { display: block; height: 767px; background: blue; }
      </style>
      <div class="header">
        <div class="toolbar">
          <div class="toolbar-child">
            <ha-tab-group-tab class="icon-and-title" active>
              <ha-icon></ha-icon>Home
            </ha-tab-group-tab>
            <ha-tab-group-tab class="icon-and-title">
              <ha-icon></ha-icon>Cameras
            </ha-tab-group-tab>
            <ha-tab-group-tab class="icon-and-title">
              <ha-icon></ha-icon>Settings
            </ha-tab-group-tab>
          </div>
        </div>
      </div>
      <div id="view"><hui-view></hui-view></div>
    `;
    document.body.append(huiRoot);
    const header = root.querySelector(".header");
    const view = root.querySelector("hui-view");
    // Lighthouse applies the customization after HA's initial shell paint.
    await new Promise((resolve) => setTimeout(resolve, 600));
    const oldHeaderTop = header.getBoundingClientRect().top;
    const oldViewTop = view.getBoundingClientRect().top;
    const shifts = [];
    const canObserveLayoutShift =
      PerformanceObserver.supportedEntryTypes?.includes("layout-shift") ===
      true;
    const observer = canObserveLayoutShift
      ? new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (!entry.hadRecentInput) shifts.push(entry.value);
          }
        })
      : null;
    observer?.observe({ type: "layout-shift", buffered: false });
    const host = {
      isConnected: true,
      _config: {
        mobile_view_ha_navbar_bottom: true,
        mobile_view_ha_navbar_dashboard: true,
        mobile_view_ha_navbar_stack_tabs: true,
      },
      _isLikelyMobileClient: () => true,
      _isLikelyPhoneClient: () => true,
      _isRotateOverlayViewportCoverActive: () => false,
      _isDashboardEditMode: () => false,
    };
    const controller = new HomeAssistantNavbarController(host, {
      documentRef: document,
      windowRef: window,
      findCurrentHuiRoot: () => huiRoot,
      findPanel: () => null,
    });
    controller.sync();
    const tab = root.querySelector("ha-tab-group-tab");
    const initialTabFontSize = getComputedStyle(tab).fontSize;
    await new Promise((resolve) =>
      requestAnimationFrame(() => requestAnimationFrame(resolve)),
    );
    await new Promise((resolve) => setTimeout(resolve, 100));
    observer?.takeRecords().forEach((entry) => {
      if (!entry.hadRecentInput) shifts.push(entry.value);
    });
    observer?.disconnect();
    const headerRect = header.getBoundingClientRect();
    const result = {
      cls: canObserveLayoutShift
        ? shifts.reduce((total, value) => total + value, 0)
        : null,
      oldHeaderTop,
      oldViewTop,
      headerTop: headerRect.top,
      headerBottom: headerRect.bottom,
      viewTop: view.getBoundingClientRect().top,
      inlineTop: header.style.getPropertyValue("top"),
      inlineBottom: header.style.getPropertyValue("bottom"),
      transform: getComputedStyle(header).transform,
      transitionDuration: getComputedStyle(header).transitionDuration,
      transitionProperty: getComputedStyle(header).transitionProperty,
      initialTabFontSize,
      settledTabFontSize: getComputedStyle(tab).fontSize,
    };
    controller.disconnect({ force: true });
    return result;
  });

  expect(state).toMatchObject({
    oldHeaderTop: 0,
    oldViewTop: 56,
    viewTop: 0,
    inlineTop: "0px",
    inlineBottom: "auto",
    transitionDuration: "0.001s",
    transitionProperty: "transform",
    initialTabFontSize: "16px",
    settledTabFontSize: "10px",
  });
  expect(state.headerBottom).toBeCloseTo(823, 0);
  expect(state.headerTop).toBeGreaterThan(750);
  expect(state.transform).not.toBe("none");
  if (browserName === "chromium") {
    expect(state.cls).toBeGreaterThan(0.05);
    expect(state.cls).toBeLessThan(0.1);
  }
});

test("Bubble notification hash opens its route before the card media popup", async ({ page }) => {
  await page.goto(baseUrl);
  const state = await page.evaluate(async () => {
    const calls = [];
    const host = {
      _started: true,
      isConnected: true,
      _config: {
        deep_link_enabled: true,
        cameras: [
          { entity: "camera.front_door" },
          { entity: "camera.driveway", name: "Driveway" },
        ],
      },
      _camCache: {
        "camera.front_door": { cam: "front_door" },
        "camera.driveway": { cam: "driveway" },
      },
      _deepLinkEventId: "",
      _deepLinkReviewId: "",
      _deepLinkMediaHint: "",
      _deepLinkCameraHint: "",
      _deepLinkApplied: false,
      _deepLinkEventLookupTried: false,
      _deepLinkReviewLookupTried: false,
      _activeCamIdx: 0,
      _activeGroupMemberOverride: "",
      _reviews: [],
      _findEventById: (id) =>
        id === "event-2"
          ? {
              id,
              camera: "driveway",
              has_clip: false,
            }
          : null,
      _switchCamera: async (index) => {
        calls.push("switchCamera");
        host._activeCamIdx = index;
      },
      _showSnapshot: () => calls.push("showSnapshot"),
      _loadReviews: async () => {},
      _browseWindowLoaderController: {
        invalidateActiveWindowCaches: () => {},
        loadWindow: async () => {},
      },
    };
    let controller = null;
    let bubbleOpen = false;
    let bubbleOpenCount = 0;
    let trustedHashChange = false;
    const syncBubbleRoute = (event) => {
      if (location.hash !== "#test2" || bubbleOpen) return;
      trustedHashChange = event.isTrusted;
      bubbleOpen = true;
      bubbleOpenCount += 1;
      calls.push("bubbleOpen");
      const card = document.createElement("frigate-view-card");
      controller = card._deepLinkController;
      controller._host = host;
      controller.connect();
    };
    window.addEventListener("hashchange", syncBubbleRoute);
    history.replaceState(
      history.state,
      "",
      "/dashboard-testarea/home#test2?camera=driveway&event=event-2&review=review-2",
    );
    await import("/frigate-view-card.js");
    const deadline = performance.now() + 2000;
    while (!calls.includes("showSnapshot") && performance.now() < deadline) {
      await new Promise((resolve) => setTimeout(resolve, 10));
    }
    controller?.disconnect();
    window.removeEventListener("hashchange", syncBubbleRoute);
    return {
      bubbleOpen,
      bubbleOpenCount,
      calls,
      hash: location.hash,
      trustedHashChange,
    };
  });

  expect(state).toEqual({
    bubbleOpen: true,
    bubbleOpenCount: 1,
    calls: ["bubbleOpen", "switchCamera", "showSnapshot"],
    hash: "#test2",
    trustedHashChange: true,
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
    card._isCompanionApp = () => true;
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
    const restoreDeadline = performance.now() + 2_000;
    while (
      (card.classList.contains("mobile-view-rotate-cover") ||
        card.matches(":popover-open") ||
        card.hasAttribute("popover")) &&
      performance.now() < restoreDeadline
    ) {
      await new Promise((resolve) => setTimeout(resolve, 20));
    }
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

test("keeps PTZ runtime and circle pad out of startup until Controls opens", async ({ page }) => {
  let ptzRuntimeRequests = 0;
  let circlePadRequests = 0;
  page.on("request", (request) => {
    const pathname = new URL(request.url()).pathname;
    if (pathname === "/frigate-view-card-ptz.js") {
      ptzRuntimeRequests += 1;
    } else if (pathname === "/frigate-view-card-circle-pad.js") {
      circlePadRequests += 1;
    }
  });
  await page.goto(baseUrl);
  const state = await page.evaluate(async () => {
    await import("/frigate-view-card.js");
    const registeredAtStartup = Boolean(
      customElements.get("circle-pad-control-2"),
    );
    const card = document.createElement("frigate-view-card");
    document.body.append(card);
    const list =
      card._pageShellRegionElement("browse", "#list") ||
      document.createElement("div");
    if (!list.isConnected) document.body.append(list);
    card._config = {
      cameras: [{ entity: "camera.front", ptz: true }],
    };
    card._activeCamIdx = 0;
    card._tab = "controls";
    card._localization = { t: (key) => key };
    card._ptzCapabilityController = {
      ensureActiveInfo() {},
      activeInfo: () => ({ features: ["pt"], presets: [] }),
    };
    card._renderListLabel = () => {};
    card._setListHtmlIfChanged = (target, markup) => {
      target.innerHTML = markup;
    };
    card._$ = (selector) => list.querySelector(selector);
    const zoomDeltas = [];
    card._attachMainLiveVideoZoom = () => {};
    card._liveVideoZoomController = {
      zoomBy: (delta) => zoomDeltas.push(delta),
    };
    const runtimeLoadedAtStartup = card._ptzFeatureController.isLoaded();
    const runtimeSupported = card._ptzFeatureController.isSupported();
    card._renderControlsSection(list);
    card._renderControlsSection(list);
    await card._ptzFeatureController.prepare();
    // Render once more after the lazy runtime promise resolves. A fixed timer
    // races the dynamic chunk under the full parallel browser suite.
    card._renderControlsSection(list);
    await customElements.whenDefined("circle-pad-control-2");
    const pad = list.querySelector("circle-pad-control-2");
    await card._handleCirclePadPtzEvent(
      {
        target: pad,
        detail: { action: "zoom-in" },
      },
      "press",
    );
    return {
      registeredAtStartup,
      runtimeLoadedAtStartup,
      runtimeSupported,
      runtimeLoadedAfterRender: card._ptzFeatureController.isLoaded(),
      registeredAfterRender: Boolean(
        customElements.get("circle-pad-control-2"),
      ),
      mounted: Boolean(pad?.shadowRoot?.querySelector(".circle-pad")),
      zoomDeltas,
    };
  });

  expect(state).toEqual({
    registeredAtStartup: false,
    runtimeLoadedAtStartup: false,
    runtimeSupported: true,
    runtimeLoadedAfterRender: true,
    registeredAfterRender: true,
    mounted: true,
    zoomDeltas: [0.2],
  });
  expect(ptzRuntimeRequests).toBe(1);
  expect(circlePadRequests).toBe(1);
});

test("keeps PiP dormant on mobile and loads it on first desktop use", async ({
  page,
}) => {
  const assetRequests = [];
  page.on("request", (request) => {
    if (request.url().includes("frigate-view-card-picture-in-picture.js")) {
      assetRequests.push(request.url());
    }
  });
  await page.goto(baseUrl);

  const state = await page.evaluate(async () => {
    await import("/frigate-view-card.js");
    const card = document.createElement("frigate-view-card");
    card._isMobileTabletViewport = () => true;
    card._pictureInPictureController.sync();
    await new Promise((resolve) => setTimeout(resolve, 25));
    const mobileLoaded = Boolean(
      card._pictureInPictureController._delegate,
    );

    card._isMobileTabletViewport = () => false;
    await card._togglePictureInPicture(null);
    return {
      mobileLoaded,
      desktopLoaded: Boolean(card._pictureInPictureController._delegate),
    };
  });

  expect(assetRequests).toHaveLength(1);
  expect(state).toEqual({ mobileLoaded: false, desktopLoaded: true });
});

for (const startUnmuted of [false, true]) {
  for (const healthy of [false, true]) {
  test(`Catalyst HLS window return restores configured audio (auto=${startUnmuted}, healthy=${healthy})`, async ({ page }) => {
    await page.goto(baseUrl);
    const state = await page.evaluate(async ({ autoUnmute, healthy }) => {
      await import("/frigate-view-card.js");
      const card = document.createElement("frigate-view-card");
      const slot = document.createElement("div");
      document.body.append(slot);
      const button = document.createElement("button");
      Object.defineProperty(card, "_activeCam", {
        value: { entity: "camera.front", start_unmuted: autoUnmute },
      });
      let requests = 0;
      card._hass = {
        states: { "camera.front": { entity_id: "camera.front" } },
        callWS: async () => {
          const url = `/hls/session-${++requests}.m3u8`;
          await new Promise((resolve) => setTimeout(resolve, 0));
          return { url };
        },
      };
      card._$ = (selector) => selector === "#mute-btn" ? button : null;
      card._assignLiveEngine = (engine) => { card._engine = engine; };
      card._attachMainLiveVideoZoom = () => {};
      card._startStreamFallbackLoadingRefresh = () => () => {};
      card._stopStreamFallbackLoadingRefresh = () => {};
      card._applyResolvedStreamUiState = () => {};
      card._setStreamLoading = () => {};
      card._setStreamFallbackVisible = () => {};
      const result = await card._catalystHlsMounter.tryMount(slot, null, {
        entity: "camera.front", commit: false, muted: true,
      });
      const video = result.engine;
      // Simulate the native HLS decoder; desktop test engines are not Catalyst.
      // Exercise the production bundle's lifecycle, ownership and audio wiring.
      let readyState = 4;
      let source = "";
      Object.defineProperty(video, "src", { get: () => source, set: (value) => { source = value; } });
      const removeAttribute = video.removeAttribute.bind(video);
      video.removeAttribute = (name) => {
        if (name === "src") source = "";
        removeAttribute(name);
      };
      Object.defineProperty(video, "readyState", { get: () => readyState });
      Object.defineProperty(video, "currentTime", { writable: true, value: 10 });
      Object.defineProperty(video, "paused", { get: () => false });
      video.play = async () => {
        readyState = 4;
        video.dispatchEvent(new Event("playing"));
      };
      await video.hlsUrlReady;
      card._catalystHlsMounter.adoptRetainedEngine(slot, video);
      await Promise.resolve();
      card._liveAudioController.setMuted(false);
      const beforeClose = video.muted;
      window.dispatchEvent(new Event("pagehide"));
      const closed = { muted: video.muted, hostMuted: card._streamMuted,
        sourceRetained: video.src === "/hls/session-1.m3u8", suspended: video.hlsBackgroundSuspended };
      window.dispatchEvent(new Event("pageshow"));
      window.dispatchEvent(new Event("pageshow"));
      if (healthy) {
        video.currentTime += 1;
        video.dispatchEvent(new Event("timeupdate"));
      }
      await new Promise((resolve) => setTimeout(resolve, healthy ? 30 : 1650));
      const resumed = { muted: video.muted, hostMuted: card._streamMuted,
        recovering: video.hlsRecovering, requests,
        source: video.src, sameEngine: card._engine === video };
      card._catalystHlsMounter.release(video);
      card._liveAudioController.dispose();
      slot.remove();
      return { beforeClose, closed, resumed };
    }, { autoUnmute: startUnmuted, healthy });
    expect(state.beforeClose).toBe(false);
    expect(state.closed).toEqual({ muted: true, hostMuted: true, sourceRetained: true, suspended: true });
    const requests = healthy ? 1 : 2;
    expect(state.resumed).toEqual({ muted: !startUnmuted, hostMuted: !startUnmuted,
      recovering: false, requests, source: `/hls/session-${requests}.m3u8`, sameEngine: true });
  });
  }
}

for (const catalyst of [true, false]) {
  test(`PiP restores inline mute and controls only on Catalyst (${catalyst})`, async ({ page }) => {
    await page.goto(baseUrl);
    const state = await page.evaluate(async (isCatalyst) => {
      await import("/frigate-view-card.js");
      const card = document.createElement("frigate-view-card");
      const live = document.createElement("video");
      const popup = document.createElement("video");
      const button = document.createElement("button");
      card._isCatalyst = () => isCatalyst;
      card._livePictureInPictureVideo = () => card._engine;
      card._popupMediaControlsController.video = () => popup;
      card._$ = (selector) => selector === "#mute-btn" ? button : null;
      card._engine = live;
      card._streamMuted = true;
      card._renderMuteButton();
      const originalLabel = button.getAttribute("aria-label");
      for (const video of [live, popup]) {
        video.muted = true;
        video.defaultMuted = true;
        // Simulate Catalyst's native presentation events on real video nodes;
        // desktop test engines cannot open the WKWebView PiP window itself.
        Object.defineProperties(video, {
          requestPictureInPicture: { configurable: true, value: undefined },
          webkitPresentationMode: { configurable: true, writable: true, value: "inline" },
          webkitSupportsPresentationMode: { configurable: true, value: () => true },
          webkitSetPresentationMode: { configurable: true, value(mode) {
            this.webkitPresentationMode = mode;
            if (mode === "picture-in-picture") this.muted = false;
            this.dispatchEvent(new Event("webkitpresentationmodechanged"));
          } },
        });
      }
      await card._togglePictureInPicture(live);
      const pipMuted = live.muted;
      live.webkitSetPresentationMode("inline");
      const liveMuted = live.muted;
      const controlsMatch = button.getAttribute("aria-label") === originalLabel && card._streamMuted;
      // One normal button click must now unmute, and the next must mute.
      card._toggleMute();
      const unmuted = !live.muted && button.getAttribute("aria-label") !== originalLabel;
      card._toggleMute();
      const remuted = live.muted && button.getAttribute("aria-label") === originalLabel;
      await card._togglePictureInPicture(live);
      live.webkitPresentationMode = "inline";
      live.dispatchEvent(new Event("leavepictureinpicture"));
      live.dispatchEvent(new Event("webkitpresentationmodechanged"));
      const liveClosedMuted = live.muted;
      await card._togglePictureInPicture(popup, { popup: true });
      popup.webkitSetPresentationMode("inline");
      const popupMuted = popup.muted;
      // Closing an old camera's PiP must not change the newly selected camera.
      live.muted = false;
      await card._togglePictureInPicture(live);
      card._engine = document.createElement("video");
      card._engine.muted = true;
      live.webkitSetPresentationMode("inline");
      const oldCameraMuted = live.muted;
      const selectedMuted = card._engine.muted;
      card._pictureInPictureController.dispose();
      return { pipMuted, liveMuted, liveClosedMuted, controlsMatch, unmuted, remuted, popupMuted, oldCameraMuted, selectedMuted };
    }, catalyst);
    expect(state).toEqual({ pipMuted: false, liveMuted: catalyst, liveClosedMuted: catalyst, controlsMatch: true,
      unmuted: true, remuted: true, popupMuted: catalyst, oldCameraMuted: catalyst, selectedMuted: true });
  });
}

test("loads the synthetic card-picker demo only inside HA's picker", async ({
  page,
}) => {
  const assetRequests = [];
  page.on("request", (request) => {
    if (request.url().includes("frigate-view-card-card-picker-demo.js")) {
      assetRequests.push(request.url());
    }
  });
  await page.goto(baseUrl);
  await page.evaluate(() => import("/frigate-view-card.js"));
  await page.waitForTimeout(25);
  expect(assetRequests).toEqual([]);

  const state = await page.evaluate(async () => {
    const Card = customElements.get("frigate-view-card");
    const picker = document.createElement("hui-card-picker");
    const card = document.createElement("frigate-view-card");
    picker.append(card);
    document.body.append(picker);
    card.setConfig(Card.getStubConfig());

    const deadline = performance.now() + 2000;
    while (
      !card.shadowRoot?.querySelector?.(".card-picker-demo-fvc-brand-logo") &&
      performance.now() < deadline
    ) {
      await new Promise((resolve) => setTimeout(resolve, 10));
    }
    return {
      hostActive: card.classList.contains("card-picker-demo-host"),
      cardActive: card.shadowRoot
        ?.querySelector("#card")
        ?.classList.contains("card-picker-demo"),
      hasBranding: Boolean(
        card.shadowRoot?.querySelector(".card-picker-demo-fvc-brand-logo"),
      ),
      hasScopedStyles: Boolean(
        card.shadowRoot?.querySelector(
          "style[data-fvc-card-picker-demo-styles]",
        ),
      ),
    };
  });

  expect(assetRequests).toHaveLength(1);
  expect(state).toEqual({
    hostActive: true,
    cardActive: true,
    hasBranding: true,
    hasScopedStyles: true,
  });
});

test("loads editor-preview draft synchronization only on the first draft", async ({
  page,
}) => {
  const assetRequests = [];
  page.on("request", (request) => {
    if (
      request.url().includes("frigate-view-card-editor-preview-draft.js")
    ) {
      assetRequests.push(request.url());
    }
  });
  await page.goto(baseUrl);
  await page.evaluate(() => import("/frigate-view-card.js"));
  await page.waitForTimeout(25);
  expect(assetRequests).toEqual([]);

  const state = await page.evaluate(async () => {
    const card = document.createElement("frigate-view-card");
    const calls = [];
    card._pageId = "single-view";
    card._pageNavigationController = {
      isPageRouteAvailable: () => true,
    };
    card._singleViewPageController = {
      applyEditorPreviewDraftRefresh: () => calls.push("refresh"),
    };
    card._syncToolbarButtons = () => calls.push("toolbar");

    const first = await card._editorPreviewController.applyConfigDraft({
      previousConfig: { title: "Before" },
      nextConfig: { title: "After" },
    });
    const second = card._editorPreviewController.applyConfigDraft({
      previousConfig: { title: "After" },
      nextConfig: { title: "Again" },
    });
    return {
      first,
      second,
      calls,
      loaded: Boolean(card._editorPreviewController._draftController._delegate),
    };
  });

  expect(assetRequests).toHaveLength(1);
  expect(state).toEqual({
    first: "synced",
    second: "synced",
    calls: ["refresh", "toolbar", "refresh", "toolbar"],
    loaded: true,
  });
});

test("loads dashboard swipe navigation only for an enabled owner card", async ({ page }) => {
  const assetRequests = [];
  page.on("request", (request) => {
    if (
      request.url().includes(
        "frigate-view-card-dashboard-swipe-navigation.js",
      )
    ) {
      assetRequests.push(request.url());
    }
  });
  await page.goto(baseUrl);
  await page.evaluate(() => import("/frigate-view-card.js"));
  await page.waitForTimeout(50);
  expect(assetRequests).toEqual([]);

  const state = await page.evaluate(async () => {
    const card = document.createElement("frigate-view-card");
    card._config = {
      ha_dashboard_swipe_navigation_owner: true,
      ha_dashboard_swipe_navigation: "inside-card",
      ha_dashboard_swipe_mouse_enabled: true,
    };
    const controller = card._haDashboardSwipeNavigationController;
    controller.sync();
    const deadline = performance.now() + 2000;
    while (!controller._delegate && performance.now() < deadline) {
      await new Promise((resolve) => setTimeout(resolve, 10));
    }
    return {
      loaded: Boolean(controller._delegate),
      scopeActive: controller.isCurrentDashboardScope(),
    };
  });

  expect(assetRequests).toHaveLength(1);
  expect(state).toEqual({ loaded: true, scopeActive: false });
});

test("loads navbar customization only when a mobile card needs it", async ({
  page,
}) => {
  const assetRequests = [];
  page.on("request", (request) => {
    if (request.url().includes("frigate-view-card-navbar.js")) {
      assetRequests.push(request.url());
    }
  });
  await page.goto(baseUrl);
  await page.evaluate(() => import("/frigate-view-card.js"));
  await page.waitForTimeout(50);
  expect(assetRequests).toEqual([]);

  const state = await page.evaluate(async () => {
    const card = document.createElement("frigate-view-card");
    card._config = { mobile_view_ha_navbar_bottom: true };
    card._isLikelyMobileClient = () => true;
    const controller = card._haNavbarController;
    controller.sync();
    const deadline = performance.now() + 2000;
    while (!controller._delegate && performance.now() < deadline) {
      await new Promise((resolve) => setTimeout(resolve, 10));
    }
    return { loaded: Boolean(controller._delegate) };
  });

  expect(assetRequests).toHaveLength(1);
  expect(state).toEqual({ loaded: true });
});

test("loads the popup recording scrubber only when recording playback needs it", async ({
  page,
}) => {
  const assetRequests = [];
  page.on("request", (request) => {
    if (request.url().includes("frigate-view-card-recording-scrub.js")) {
      assetRequests.push(request.url());
    }
  });
  await page.goto(baseUrl);
  await page.evaluate(() => import("/frigate-view-card.js"));
  await page.waitForTimeout(50);
  expect(assetRequests).toEqual([]);

  const state = await page.evaluate(async () => {
    const card = document.createElement("frigate-view-card");
    const controller = card._popupRecordingScrubController;
    const before = {
      delegate: Boolean(controller._delegate),
      range: controller.range(),
    };
    const result = await controller.initialize({});
    return {
      before,
      loaded: Boolean(controller._delegate),
      result,
    };
  });

  expect(assetRequests).toHaveLength(1);
  expect(state).toEqual({
    before: { delegate: false, range: null },
    loaded: true,
    result: null,
  });
});

test("loads frame capture only when a displayed snapshot needs it", async ({
  page,
}) => {
  const assetRequests = [];
  page.on("request", (request) => {
    if (request.url().includes("frigate-view-card-frame-capture.js")) {
      assetRequests.push(request.url());
    }
  });
  await page.goto(baseUrl);
  await page.evaluate(() => import("/frigate-view-card.js"));
  await page.waitForTimeout(50);
  expect(assetRequests).toEqual([]);

  const state = await page.evaluate(async () => {
    const card = document.createElement("frigate-view-card");
    const before = Boolean(card._displayedFrameCaptureController);
    const controller = await card._ensureDisplayedFrameCaptureController();
    return {
      before,
      loaded: Boolean(controller),
      retained: card._displayedFrameCaptureController === controller,
    };
  });

  expect(assetRequests).toHaveLength(1);
  expect(state).toEqual({ before: false, loaded: true, retained: true });
});

test("loads linked-light controls only for a configured camera", async ({
  page,
}) => {
  const assetRequests = [];
  page.on("request", (request) => {
    if (request.url().includes("frigate-view-card-linked-light.js")) {
      assetRequests.push(request.url());
    }
  });
  await page.goto(baseUrl);
  await page.evaluate(() => import("/frigate-view-card.js"));
  await page.waitForTimeout(50);
  expect(assetRequests).toEqual([]);

  const state = await page.evaluate(async () => {
    const card = document.createElement("frigate-view-card");
    const plainCamera = { entity: "camera.plain" };
    card._config = { cameras: [plainCamera] };
    card._linkedLightController.sync();
    await new Promise((resolve) => setTimeout(resolve, 25));
    const before = Boolean(card._linkedLightController._delegate);

    const linkedCamera = {
      entity: "camera.front",
      linked_entities: [{ entity: "light.porch" }],
    };
    card._config = { cameras: [linkedCamera] };
    card._hass = {
      states: {
        "light.porch": { state: "off", attributes: {} },
      },
    };
    card._linkedLightController.sync();
    await card._linkedLightController._ensureDelegate();
    const styleSelector = "style[data-fvc-linked-light-styles]";
    const initialStyle = card.shadowRoot.querySelector(styleSelector);
    initialStyle?.remove();
    card._linkedLightController.sync();
    return {
      before,
      loaded: Boolean(card._linkedLightController._delegate),
      markup: card._linkedLightController.buildMarkup(),
      styleInstalled: Boolean(initialStyle),
      styleRestored: Boolean(card.shadowRoot.querySelector(styleSelector)),
    };
  });

  expect(assetRequests).toHaveLength(1);
  expect(state.before).toBe(false);
  expect(state.loaded).toBe(true);
  expect(state.markup).toContain("data-linked-light=\"light.porch\"");
  expect(state.styleInstalled).toBe(true);
  expect(state.styleRestored).toBe(true);
});

test("loads the Wide View timeline only when its enabled page needs it", async ({
  page,
}) => {
  const assetRequests = [];
  page.on("request", (request) => {
    if (request.url().includes("frigate-view-card-wide-timeline.js")) {
      assetRequests.push(request.url());
    }
  });
  await page.goto(baseUrl);
  await page.evaluate(() => import("/frigate-view-card.js"));
  await page.waitForTimeout(50);
  expect(assetRequests).toEqual([]);

  const state = await page.evaluate(async () => {
    const card = document.createElement("frigate-view-card");
    card._config = { wide_view_timeline_enabled: true };
    card._pageId = "wide-view";
    card._renderShellPreserveLive = () => {};
    const controller = card._wideViewTimelineController;
    const before = {
      delegate: Boolean(controller._delegate),
      markup: controller.buildRegionMarkup(),
    };
    await controller._ensureDelegate();
    const styleSelector = "style[data-fvc-wide-timeline-styles]";
    const initialStyle = card.shadowRoot.querySelector(styleSelector);
    initialStyle?.remove();
    controller._delegate.bind();
    return {
      before,
      loaded: Boolean(controller._delegate),
      markup: controller.buildRegionMarkup(),
      styleInstalled: Boolean(initialStyle),
      styleRestored: Boolean(card.shadowRoot.querySelector(styleSelector)),
    };
  });

  expect(assetRequests).toHaveLength(1);
  expect(state.before).toEqual({ delegate: false, markup: "" });
  expect(state.loaded).toBe(true);
  expect(state.markup).toContain("wide-timeline-panel");
  expect(state.styleInstalled).toBe(true);
  expect(state.styleRestored).toBe(true);
});

test("loads Wide View companion cameras only after entering Wide View", async ({
  page,
}) => {
  const assetRequests = [];
  page.on("request", (request) => {
    if (request.url().includes("frigate-view-card-wide-companion.js")) {
      assetRequests.push(request.url());
    }
  });
  await page.goto(baseUrl);
  await page.evaluate(() => import("/frigate-view-card.js"));
  await page.waitForTimeout(50);
  expect(assetRequests).toEqual([]);

  const state = await page.evaluate(async () => {
    const card = document.createElement("frigate-view-card");
    card._config = { cameras: [] };
    card._pageId = "wide-view";
    card._renderShellPreserveLive = () => {};
    const controller = card._wideViewCompanionController;
    const before = {
      delegate: Boolean(controller._delegate),
      markup: controller.buildRegionMarkup(),
    };
    await controller._ensureDelegate();
    const styleSelector = "style[data-fvc-wide-companion-styles]";
    const initialStyle = card.shadowRoot.querySelector(styleSelector);
    initialStyle?.remove();
    controller._delegate.render();
    return {
      before,
      loaded: Boolean(controller._delegate),
      markup: controller.buildRegionMarkup(),
      styleInstalled: Boolean(initialStyle),
      styleRestored: Boolean(card.shadowRoot.querySelector(styleSelector)),
    };
  });

  expect(assetRequests).toHaveLength(1);
  expect(state.before.delegate).toBe(false);
  expect(state.before.markup).toContain("wide-companion-panel");
  expect(state.loaded).toBe(true);
  expect(state.markup).toContain("wide-companion-panel");
  expect(state.styleInstalled).toBe(true);
  expect(state.styleRestored).toBe(true);
});

test("Card View core stays dormant until an enabled route enters it", async ({
  page,
}) => {
  const assetRequests = [];
  page.on("request", (request) => {
    if (request.url().includes("frigate-view-card-card-view.js")) {
      assetRequests.push(request.url());
    }
  });
  await page.goto(baseUrl);
  await page.evaluate(() => import("/frigate-view-card.js"));
  await page.waitForTimeout(50);
  expect(assetRequests).toEqual([]);

  const state = await page.evaluate(async () => {
    const card = document.createElement("frigate-view-card");
    document.body.append(card);
    card.setConfig({
      cameras: [{ entity: "camera.front_door" }],
      card_view_page_enabled: true,
      landing_page: "single-view",
    });
    const before = {
      delegate: Boolean(card._cardViewPageController._delegate),
      pageId: card._pageId,
    };

    card._pageNavigationController.navigateToPageRoute("card-view", {
      source: "lazy-card-view-test",
    });
    await card._cardViewPageController.prepare();
    const style = card.shadowRoot.querySelector(
      "style[data-fvc-card-view-page-styles]",
    );
    return {
      before,
      after: {
        delegate: Boolean(card._cardViewPageController._delegate),
        pageId: card._pageId,
        installed: Boolean(style),
        hasCardViewLayout: style?.textContent.includes(
          ".card.card-view-active .card-view-layout",
        ),
        visibleWhenLoaded: style?.textContent.includes(
          "visibility:visible",
        ),
      },
    };
  });

  expect(assetRequests).toHaveLength(1);
  expect(state).toEqual({
    before: { delegate: false, pageId: "single-view" },
    after: {
      delegate: true,
      pageId: "card-view",
      installed: true,
      hasCardViewLayout: true,
      visibleWhenLoaded: true,
    },
  });
});

test("phone routing loads Card View when its enabled route is entered", async ({
  browser,
}) => {
  const context = await browser.newContext({
    hasTouch: true,
    userAgent:
      "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148",
    viewport: { width: 390, height: 844 },
  });
  const page = await context.newPage();
  let cardViewRequests = 0;
  page.on("request", (request) => {
    if (
      new URL(request.url()).pathname ===
      "/frigate-view-card-card-view.js"
    ) {
      cardViewRequests += 1;
    }
  });
  await page.goto(baseUrl);

  const state = await page.evaluate(async () => {
    await import("/frigate-view-card.js");
    const card = document.createElement("frigate-view-card");
    document.body.append(card);
    card.setConfig({
      cameras: [{ entity: "camera.front", name: "Front" }],
      landing_page: "single-view",
      mobile_page: "card-view",
      card_view_page_enabled: true,
    });
    const resolved = card._pageNavigationController.navigateToPageRoute(
      "card-view",
      { source: "phone-card-view-test" },
    );
    await card._cardViewPageController.prepare();
    return {
      available: card._pageNavigationController.pageRouteOptions(),
      delegate: Boolean(card._cardViewPageController._delegate),
      pageId: card._pageId,
      resolved,
      layout: card.shadowRoot
        .querySelector("#layout")
        ?.classList.contains("layout--card-view"),
    };
  });

  await context.close();
  expect(state.available).toContain("card-view");
  expect(state).toMatchObject({
    delegate: true,
    pageId: "card-view",
    resolved: "card-view",
    layout: true,
  });
  expect(cardViewRequests).toBe(1);
});

test("live mute schedules delayed synchronization with the browser timer receiver", async ({
  page,
}) => {
  await page.goto(baseUrl);

  const state = await page.evaluate(async () => {
    await import("/frigate-view-card.js");
    const card = document.createElement("frigate-view-card");
    const video = document.createElement("video");
    card._engine = video;
    card._streamMuted = false;

    card._setLiveMuted(true);

    return {
      cardMuted: card._streamMuted,
      videoMuted: video.muted,
      videoDefaultMuted: video.defaultMuted,
    };
  });

  expect(state).toEqual({
    cardMuted: true,
    videoMuted: true,
    videoDefaultMuted: true,
  });
});

test("bundled British English uses regional wording and inherits unchanged English text", async ({ page }) => {
  await page.goto(baseUrl);
  const labels = await page.evaluate(async () => {
    await import("/frigate-view-card.js");
    await import("/frigate-view-card-editor.js");
    const card = document.createElement("frigate-view-card");
    const editor = document.createElement("frigate-view-card-editor");
    card._localization.updateHass({ locale: { language: "en-GB" } });
    editor._t("editor.actions.cancel");
    editor._localization.updateHass({ locale: { language: "en-GB" } });
    await Promise.all([
      card._localization.whenReady(),
      editor._localization.whenReady(),
    ]);
    return {
      runtime: card._localization.t("runtime.toolbar.favorites"),
      editor: editor._t("editor.theme.colors.bg_main"),
      inherited: editor._t("editor.actions.cancel"),
      resolved: card._localization.resolvedLanguage,
    };
  });
  expect(labels).toEqual({
    runtime: "Favourites",
    editor: "Background Colour",
    inherited: "Cancel",
    resolved: "en-GB",
  });
});

test("bundled Spanish catalogs resolve base and Latin American variants", async ({ page }) => {
  await page.goto(baseUrl);
  const labels = await page.evaluate(async () => {
    await import("/frigate-view-card.js");
    await import("/frigate-view-card-editor.js");
    const card = document.createElement("frigate-view-card");
    const editor = document.createElement("frigate-view-card-editor");
    card._localization.updateHass({ locale: { language: "es-ES" } });
    editor._t("editor.actions.add");
    editor._localization.updateHass({ locale: { language: "es-ES" } });
    await Promise.all([
      card._localization.whenReady(),
      editor._localization.whenReady(),
    ]);
    const spanish = {
      runtime: card._localization.t("runtime.toolbar.alerts"),
      editor: editor._t("editor.actions.add"),
    };
    card._localization.updateHass({ locale: { language: "es-419" } });
    editor._localization.updateHass({ locale: { language: "es-419" } });
    await Promise.all([
      card._localization.whenReady(),
      editor._localization.whenReady(),
    ]);
    return {
      spanish,
      latinAmerican: {
        runtime: card._localization.t("runtime.cardPickerDemo.vehicleArea"),
        editor: editor._t("editor.actions.add"),
        inherited: editor._t("editor.actions.cancel"),
      },
    };
  });
  expect(labels).toEqual({
    spanish: { runtime: "Alertas", editor: "Añadir" },
    latinAmerican: {
      runtime: "entrada de autos",
      editor: "Agregar",
      inherited: "Cancelar",
    },
  });
});

test("bundled French catalog resolves regional Home Assistant locales in card and editor", async ({ page }) => {
  await page.goto(baseUrl);
  const labels = await page.evaluate(async () => {
    await import("/frigate-view-card.js");
    await import("/frigate-view-card-editor.js");
    const card = document.createElement("frigate-view-card");
    const editor = document.createElement("frigate-view-card-editor");
    card._localization.updateHass({ locale: { language: "fr-CA" } });
    editor._t("editor.actions.add");
    editor._localization.updateHass({ locale: { language: "fr-CA" } });
    await Promise.all([
      card._localization.whenReady(),
      editor._localization.whenReady(),
    ]);
    return {
      runtime: card._localization.t("runtime.toolbar.alerts"),
      editor: editor._t("editor.actions.add"),
      resolved: card._localization.resolvedLanguage,
    };
  });
  expect(labels).toEqual({ runtime: "Alertes", editor: "Ajouter", resolved: "fr" });
});

test("bundled Portuguese catalogs resolve European and Brazilian variants", async ({ page }) => {
  await page.goto(baseUrl);
  const labels = await page.evaluate(async () => {
    await import("/frigate-view-card.js");
    await import("/frigate-view-card-editor.js");
    const card = document.createElement("frigate-view-card");
    const editor = document.createElement("frigate-view-card-editor");
    editor._t("editor.actions.delete");
    card._localization.updateHass({ locale: { language: "pt-PT" } });
    editor._localization.updateHass({ locale: { language: "pt-PT" } });
    await Promise.all([
      card._localization.whenReady(),
      editor._localization.whenReady(),
    ]);
    const portuguese = {
      resolved: card._localization.resolvedLanguage,
      live: card._localization.t("runtime.live.liveTile"),
      camera: card._localization.t("runtime.live.camera"),
      delete: editor._t("editor.actions.delete"),
    };
    card._localization.updateHass({ locale: { language: "pt-BR" } });
    editor._localization.updateHass({ locale: { language: "pt-BR" } });
    await Promise.all([
      card._localization.whenReady(),
      editor._localization.whenReady(),
    ]);
    return {
      portuguese,
      brazilian: {
        resolved: card._localization.resolvedLanguage,
        live: card._localization.t("runtime.live.liveTile"),
        camera: card._localization.t("runtime.live.camera"),
        delete: editor._t("editor.actions.delete"),
        inherited: card._localization.t("runtime.toolbar.alerts"),
      },
    };
  });
  expect(labels).toEqual({
    portuguese: { resolved: "pt-PT", live: "DIRETO", camera: "Câmara", delete: "Eliminar" },
    brazilian: {
      resolved: "pt-BR",
      live: "AO VIVO",
      camera: "Câmera",
      delete: "Excluir",
      inherited: "Alertas",
    },
  });
});

test("bundled Italian catalog resolves regional Home Assistant locales in card and editor", async ({ page }) => {
  await page.goto(baseUrl);
  const labels = await page.evaluate(async () => {
    await import("/frigate-view-card.js");
    await import("/frigate-view-card-editor.js");
    const card = document.createElement("frigate-view-card");
    const editor = document.createElement("frigate-view-card-editor");
    card._localization.updateHass({ locale: { language: "it-IT" } });
    editor._t("editor.actions.add");
    editor._localization.updateHass({ locale: { language: "it-IT" } });
    await Promise.all([
      card._localization.whenReady(),
      editor._localization.whenReady(),
    ]);
    return {
      runtime: card._localization.t("runtime.toolbar.alerts"),
      live: card._localization.t("runtime.live.liveTile"),
      editor: editor._t("editor.actions.add"),
      resolved: card._localization.resolvedLanguage,
    };
  });
  expect(labels).toEqual({ runtime: "Avvisi", live: "DIRETTA", editor: "Aggiungi", resolved: "it" });
});

test("bundled Polish catalog resolves regional Home Assistant locales in card and editor", async ({ page }) => {
  await page.goto(baseUrl);
  const labels = await page.evaluate(async () => {
    await import("/frigate-view-card.js");
    await import("/frigate-view-card-editor.js");
    const card = document.createElement("frigate-view-card");
    const editor = document.createElement("frigate-view-card-editor");
    card._localization.updateHass({ locale: { language: "pl-PL" } });
    editor._t("editor.actions.add");
    editor._localization.updateHass({ locale: { language: "pl-PL" } });
    await Promise.all([
      card._localization.whenReady(),
      editor._localization.whenReady(),
    ]);
    return {
      runtime: card._localization.t("runtime.toolbar.alerts"),
      live: card._localization.t("runtime.live.liveTile"),
      editor: editor._t("editor.actions.add"),
      resolved: card._localization.resolvedLanguage,
    };
  });
  expect(labels).toEqual({ runtime: "Alerty", live: "NA ŻYWO", editor: "Dodaj", resolved: "pl" });
});

test("bundled Catalan catalog resolves regional Home Assistant locales in card and editor", async ({ page }) => {
  await page.goto(baseUrl);
  const labels = await page.evaluate(async () => {
    await import("/frigate-view-card.js");
    await import("/frigate-view-card-editor.js");
    const card = document.createElement("frigate-view-card");
    const editor = document.createElement("frigate-view-card-editor");
    card._localization.updateHass({ locale: { language: "ca-ES" } });
    editor._t("editor.actions.add");
    editor._localization.updateHass({ locale: { language: "ca-ES" } });
    await Promise.all([
      card._localization.whenReady(),
      editor._localization.whenReady(),
    ]);
    return {
      runtime: card._localization.t("runtime.toolbar.alerts"),
      live: card._localization.t("runtime.live.liveTile"),
      editor: editor._t("editor.actions.add"),
      resolved: card._localization.resolvedLanguage,
    };
  });
  expect(labels).toEqual({ runtime: "Alertes", live: "EN DIRECTE", editor: "Afegeix", resolved: "ca" });
});

test("bundled Greek catalog resolves regional Home Assistant locales in card and editor", async ({ page }) => {
  await page.goto(baseUrl);
  const labels = await page.evaluate(async () => {
    await import("/frigate-view-card.js");
    await import("/frigate-view-card-editor.js");
    const card = document.createElement("frigate-view-card");
    const editor = document.createElement("frigate-view-card-editor");
    card._localization.updateHass({ locale: { language: "el-GR" } });
    editor._t("editor.actions.add");
    editor._localization.updateHass({ locale: { language: "el-GR" } });
    await Promise.all([
      card._localization.whenReady(),
      editor._localization.whenReady(),
    ]);
    return {
      runtime: card._localization.t("runtime.toolbar.alerts"),
      live: card._localization.t("runtime.live.liveTile"),
      editor: editor._t("editor.actions.add"),
      resolved: card._localization.resolvedLanguage,
    };
  });
  expect(labels).toEqual({ runtime: "Ειδοποιήσεις", live: "ΖΩΝΤΑΝΑ", editor: "Προσθήκη", resolved: "el" });
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

test("Preview metadata relocalizes without replacing camera media", async ({ page }) => {
  await page.goto(baseUrl);
  const state = await page.evaluate(async () => {
    await import("/frigate-view-card.js");
    const card = document.createElement("frigate-view-card");
    card.setConfig({
      cameras: [{ entity: "camera.front", name: "Front" }],
      preview_page_enabled: true,
    });
    card._pageId = "preview";
    await card._previewPageController.prepare();
    card._renderShell();
    const cell = document.createElement("div");
    cell.dataset.previewCamidx = "0";
    cell.innerHTML = `
      <div class="preview-media-host" data-preview-media-entity="camera.front"><video></video></div>
      <div class="preview-meta-status">Online</div>
      <div class="preview-meta-source">Stream Source: Snapshot</div>
      <div class="preview-meta-alerts">Alerts: 2</div>
    `;
    card.shadowRoot.querySelector("#card").append(cell);
    const video = cell.querySelector("video");
    card._browseWindowLoaderController.cameraAlertsCount = () => 2;
    card._previewAlertController.isCameraAlertLive = () => false;
    const english = card._localization;
    const phrases = {
      "runtime.preview.online": "En ligne",
      "runtime.preview.snapshot": "Instantané",
      "runtime.preview.streamSource": "Source du flux : {source}",
      "runtime.preview.alertsCount": "Alertes : {count}",
    };
    card._localization = {
      updateHass: () => true,
      t: (key, values = {}) => {
        const phrase = phrases[key] || english.t(key, values);
        return phrase.replace(/\{([A-Za-z]+)\}/g, (_, name) => values[name]);
      },
    };
    card._editorPreviewController.renderCardPickerDemo = () => true;
    card._applyCardStyle = () => {};
    card.hass = {
      locale: { language: "fr" },
      states: { "camera.front": { state: "idle" } },
    };
    return {
      status: cell.querySelector(".preview-meta-status").textContent,
      source: cell.querySelector(".preview-meta-source").textContent,
      alerts: cell.querySelector(".preview-meta-alerts").textContent,
      sameVideo: cell.querySelector("video") === video,
    };
  });

  expect(state).toEqual({
    status: "●En ligne",
    source: "Source du flux : Instantané",
    alerts: "Alertes : 2",
    sameVideo: true,
  });
});

test("snapshot result feedback relocalizes in place", async ({ page }) => {
  await page.goto(baseUrl);
  const state = await page.evaluate(async () => {
    await import("/frigate-view-card.js");
    const card = document.createElement("frigate-view-card");
    card.setConfig({ cameras: [{ entity: "camera.front" }] });
    card._renderShell();
    card._localization = {
      updateHass: () => true,
      t: (key) => ({
        "runtime.live.snapshotTaken": "Capture enregistrée",
        "runtime.live.snapshotFailed": "Capture impossible",
      })[key],
    };
    const frameCapture = await card._ensureDisplayedFrameCaptureController();
    frameCapture.showResult("live", true);
    const bubble = card.shadowRoot.querySelector(".snapshot-result-bubble");
    const initialText = bubble?.textContent;
    card._localization.t = (key) => ({
      "runtime.live.snapshotTaken": "Snapshot saved",
      "runtime.live.snapshotFailed": "Snapshot failed",
    })[key];
    card._editorPreviewController.renderCardPickerDemo = () => true;
    card._applyCardStyle = () => {};
    card.hass = { locale: { language: "en" }, states: {} };
    return {
      initialText,
      currentText: bubble?.textContent,
      sameBubble: card.shadowRoot.querySelector(".snapshot-result-bubble") === bubble,
    };
  });
  expect(state).toEqual({
    initialText: "Capture enregistrée",
    currentText: "Snapshot saved",
    sameBubble: true,
  });
});

test("date labels follow HA language and time format without replacing media", async ({ page }) => {
  await page.goto(baseUrl);
  const state = await page.evaluate(async () => {
    await import("/frigate-view-card.js");
    const timestamp = Date.UTC(2026, 8, 17, 19, 18) / 1000;
    const card = document.createElement("frigate-view-card");
    card.setConfig({ cameras: [{ entity: "camera.front" }] });
    card._renderShell();
    card._hass = { config: { time_zone: "UTC" }, locale: { language: "en" } };
    const english = {
      time: card._time(timestamp),
      date: card._monthDay(timestamp, { ordinal: true }),
      weekday: card._weekday(timestamp),
      rowDate: card._weekdayDate(timestamp),
      timelineDate: card._weekdayDate(timestamp, "weekdayDateDot"),
    };
    const surface = card.shadowRoot.querySelector("#card");
    const media = document.createElement("video");
    const time = document.createElement("span");
    time.setAttribute("data-fvc-date-format", "time");
    time.setAttribute("data-fvc-date-ts", String(timestamp));
    time.textContent = english.time;
    surface.append(media, time);
    const originalTranslation = card._localization.t;
    let language = "en";
    card._localization = {
      get resolvedLanguage() { return language; },
      updateHass: (hass) => {
        const next = hass?.locale?.language || "en";
        const changed = next !== language;
        language = next;
        return changed;
      },
      t: (key, values = {}) => {
        const phrase = language === "fr" && key === "runtime.date.weekdayDate"
          ? "{date} {weekday}"
          : originalTranslation(key, values);
        return phrase.replace(/\{([A-Za-z]+)\}/g, (_, name) => values[name]);
      },
    };
    card._editorPreviewController.renderCardPickerDemo = () => true;
    card._applyCardStyle = () => {};
    card.hass = {
      config: { time_zone: "UTC" },
      locale: { language: "fr" },
      states: {},
    };
    const french = {
      time: time.textContent,
      date: card._monthDay(timestamp, { ordinal: true }),
      weekday: card._weekday(timestamp),
      sameMedia: surface.querySelector("video") === media,
      sameTimeNode: surface.querySelector("[data-fvc-date-format='time']") === time,
    };
    card.hass = {
      config: { time_zone: "UTC" },
      locale: { language: "en" },
      states: {},
    };
    card.hass = {
      config: { time_zone: "UTC" },
      locale: { language: "en", time_format: "24" },
      states: {},
    };
    return {
      english,
      french,
      explicit24: time.textContent,
      expectedFrenchDate: new Intl.DateTimeFormat("fr", {
        month: "short",
        day: "numeric",
        timeZone: "UTC",
      }).format(new Date(timestamp * 1000)),
      expectedFrenchWeekday: new Intl.DateTimeFormat("fr", {
        weekday: "short",
        timeZone: "UTC",
      }).format(new Date(timestamp * 1000)),
    };
  });

  expect(state.english).toEqual({
    time: "7:18 pm",
    date: "Sep 17th",
    weekday: "Thu",
    rowDate: "Thu Sep 17",
    timelineDate: "Thu · Sep 17th",
  });
  expect(state.french).toMatchObject({
    time: "19:18",
    date: state.expectedFrenchDate,
    weekday: state.expectedFrenchWeekday,
    sameMedia: true,
    sameTimeNode: true,
  });
  expect(state.explicit24).toBe("19:18");
});

test("HA talk bundle overlaps setup without replacing live or weakening readiness", async ({ page }) => {
  await page.goto(baseUrl);
  await page.evaluate(async () => {
    await import("/frigate-view-card.js");
    const audit = { configurationRequests: 0, microphoneRequests: 0, offers: 0, closes: 0, unsubscribes: 0 };
    class Track extends EventTarget {
      constructor(kind, muted = false) { super(); this.kind = kind; this.muted = muted; this.readyState = "live"; this.stops = 0; }
      stop() { this.stops += 1; this.readyState = "ended"; }
    }
    class Stream {
      constructor() { this.tracks = []; }
      addTrack(track) { this.tracks.push(track); }
      getTracks() { return this.tracks; }
      getAudioTracks() { return this.tracks.filter((track) => track.kind === "audio"); }
    }
    const peers = [];
    class Peer extends EventTarget {
      constructor() { super(); this.transceivers = []; peers.push(this); }
      addTransceiver() { const t = { currentDirection: "sendonly", stop() {} }; this.transceivers.push(t); return t; }
      async createOffer() { return { type: "offer", sdp: "synthetic-talk-offer" }; }
      async setLocalDescription() {}
      async setRemoteDescription() {}
      close() { audit.closes += 1; }
    }
    // Synthetic signaling and tracks exercise the built card without HA or microphone access.
    window.RTCPeerConnection = Peer;
    window.MediaStream = Stream;
    const createElement = document.createElement.bind(document);
    document.createElement = (tag, options) => {
      const node = createElement(tag, options);
      if (tag === "audio") {
        Object.defineProperty(node, "srcObject", { writable: true, value: null });
        node.play = async () => {};
        node.pause = () => {};
      }
      return node;
    };
    const probe = { audit, peers, Track, Stream };
    Object.defineProperty(navigator.mediaDevices, "getUserMedia", { configurable: true, value: () => {
      audit.microphoneRequests += 1;
      return new Promise((resolve) => { probe.resolveMicrophone = resolve; });
    } });
    const card = document.createElement("frigate-view-card");
    card.setConfig({ cameras: [{ entity: "camera.front", connection_type: "ha_direct", two_way_talk: true }] });
    card._pageId = "single-view";
    card._activeCam = card._config.cameras[0];
    card._renderShell();
    const live = card.shadowRoot.querySelector("#live-stage");
    const video = document.createElement("video");
    video.play = async () => {};
    live.append(video);
    const engine = { video };
    card._engine = engine;
    card._mountEngine = () => { throw new Error("Talk must not remount live"); };
    card._twoWayTalkSoundwaveController.startAfterPaint = () => {};
    card._hass = {
      callWS: async ({ type }) => {
        if (type === "camera/webrtc/get_client_config") {
          audit.configurationRequests += 1;
          return await new Promise((resolve) => { probe.resolveConfiguration = resolve; });
        }
        return null;
      },
      connection: { subscribeMessage: (handler) => {
        audit.offers += 1;
        probe.signal = handler;
        return Promise.resolve(() => { audit.unsubscribes += 1; });
      } },
    };
    Object.assign(probe, { card, engine, video, live });
    window.talkProbe = probe;
    probe.starting = card._startTwoWayTalkSession();
  });
  await expect.poll(() => page.evaluate(() => [talkProbe.audit.microphoneRequests, talkProbe.audit.configurationRequests])).toEqual([1, 1]);
  expect(await page.evaluate(() => talkProbe.peers.length)).toBe(0);
  await page.evaluate(() => talkProbe.resolveConfiguration({ configuration: {} }));
  expect(await page.evaluate(() => talkProbe.peers.length)).toBe(0);
  await page.evaluate(() => {
    const p = talkProbe;
    p.microphone = new p.Track("audio");
    const stream = new p.Stream();
    stream.addTrack(p.microphone);
    p.resolveMicrophone(stream);
  });
  await expect.poll(() => page.evaluate(() => talkProbe.audit.offers)).toBe(1);
  await page.evaluate(async () => {
    const p = talkProbe;
    await p.signal({ type: "session", session_id: "synthetic-talk-session" });
    await p.signal({ type: "answer", answer: "synthetic-talk-answer" });
    const peer = p.peers[0];
    peer.connectionState = "connected";
    peer.dispatchEvent(new Event("connectionstatechange"));
    p.remoteVideo = new p.Track("video", true);
    for (const track of [new p.Track("audio"), p.remoteVideo]) {
      peer.dispatchEvent(Object.assign(new Event("track"), { track }));
    }
  });
  expect(await page.evaluate(() => talkProbe.card._twoWayTalkStarting)).toBe(true);
  await page.evaluate(async () => {
    const p = talkProbe;
    p.remoteVideo.muted = false;
    p.remoteVideo.dispatchEvent(new Event("unmute"));
    await p.starting;
    if (p.card._engine !== p.engine || p.live.querySelector("video") !== p.video) throw new Error("Live changed");
    if (!p.card._twoWayTalkSession) throw new Error("Talk not connected");
    await p.card._stopTwoWayTalkSession();
    if (p.card._engine !== p.engine || p.live.querySelector("video") !== p.video) throw new Error("Stopping talk changed live");
    p.card._clearTwoWayTalkResultBubble();
  });
  expect(await page.evaluate(() => ({
    requests: talkProbe.audit.configurationRequests, peers: talkProbe.peers.length,
    closes: talkProbe.audit.closes, unsubscribes: talkProbe.audit.unsubscribes,
    microphoneStops: talkProbe.microphone.stops,
  }))).toEqual({ requests: 1, peers: 1, closes: 1, unsubscribes: 1, microphoneStops: 1 });
  await page.evaluate(() => { talkProbe.starting = talkProbe.card._startTwoWayTalkSession(); });
  await expect.poll(() => page.evaluate(() => talkProbe.audit.configurationRequests)).toBe(2);
  await page.evaluate(async () => {
    const p = talkProbe;
    p.card._cancelTwoWayTalkStart();
    await p.starting;
    p.lateMicrophone = new p.Track("audio");
    const stream = new p.Stream();
    stream.addTrack(p.lateMicrophone);
    p.resolveMicrophone(stream);
    p.resolveConfiguration({ configuration: {} });
  });
  await expect.poll(() => page.evaluate(() => talkProbe.lateMicrophone.stops)).toBe(1);
  expect(await page.evaluate(() => [talkProbe.peers.length, talkProbe.audit.offers])).toEqual([1, 1]);
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
    mobile._slideshowPageController.clearCountdownOverlay();

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

test("browse filter and calendar panels close on outside pointer interaction", async ({
  page,
}) => {
  await page.goto(baseUrl);
  const state = await page.evaluate(async () => {
    await import("/frigate-view-card.js");
    const card = document.createElement("frigate-view-card");
    document.body.append(card);
    card.setConfig({ cameras: [{ entity: "camera.front", name: "Front" }] });
    card._renderShell();

    const root = card.shadowRoot;
    const filterButton = root.querySelector("#filter-btn");
    const calendarButton = root.querySelector("#cal-btn");
    const filterPanel = root.querySelector("#filter-panel");
    const calendarPanel = root.querySelector("#cal-panel");
    const pointerDown = (target, pointerType = "mouse") => {
      target.dispatchEvent(
        new PointerEvent("pointerdown", {
          bubbles: true,
          composed: true,
          isPrimary: true,
          pointerType,
        }),
      );
    };

    filterButton.click();
    const filterOption = filterPanel.querySelector("[data-flabel]");
    pointerDown(filterOption);
    const filterAfterInside = filterPanel.style.display;
    pointerDown(filterButton);
    const filterAfterTrigger = filterPanel.style.display;
    pointerDown(document.body, "touch");
    const filterAfterOutside = {
      display: filterPanel.style.display,
      pressed: filterButton.getAttribute("aria-pressed"),
    };

    calendarButton.click();
    const calendarControl = calendarPanel.querySelector("[data-cal-nav]");
    pointerDown(calendarControl, "touch");
    const calendarAfterInside = calendarPanel.style.display;
    pointerDown(calendarButton, "touch");
    const calendarAfterTrigger = calendarPanel.style.display;
    pointerDown(document.body);
    const calendarAfterOutside = {
      display: calendarPanel.style.display,
      pressed: calendarButton.getAttribute("aria-pressed"),
    };

    return {
      filterAfterInside,
      filterAfterTrigger,
      filterAfterOutside,
      calendarAfterInside,
      calendarAfterTrigger,
      calendarAfterOutside,
    };
  });

  expect(state).toEqual({
    filterAfterInside: "block",
    filterAfterTrigger: "block",
    filterAfterOutside: { display: "none", pressed: "false" },
    calendarAfterInside: "block",
    calendarAfterTrigger: "block",
    calendarAfterOutside: { display: "none", pressed: "false" },
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

test("initial alert refresh preserves a visible thumbnail placeholder", async ({ page }) => {
  await page.goto(baseUrl);
  const state = await page.evaluate(async () => {
    await import("/frigate-view-card.js");
    const card = document.createElement("frigate-view-card");
    document.body.append(card);
    card.setConfig({ cameras: [{ entity: "camera.front", name: "Front" }] });
    card._renderShell();
    card._tab = "alerts";
    card._media = () => "/missing-event-thumbnail.jpg";
    card._reviewThumbnailForCamera = () => "/missing-review-thumbnail.webp";
    const event = {
      id: "event-1",
      camera: "front",
      label: "person",
      start_time: 1723000000,
      end_time: 1723000040,
      has_clip: true,
      has_snapshot: true,
    };
    card._browseFilterController.reviewSourceEvent = () => event;
    const review = {
      id: "review-1",
      camera: "front",
      severity: "alert",
      start_time: 1723000000,
      data: { detections: ["event-1"], objects: ["person"] },
    };
    const list = card.shadowRoot.querySelector("#list");
    card._setListHtmlIfChanged(list, card._reviewListItemHTML(review));
    const image = list.querySelector("img[data-thumb-id]");
    image.style.display = "none";
    image.nextElementSibling.style.display = "flex";

    card._setListHtmlIfChanged(
      list,
      card._reviewListItemHTML({
        ...review,
        data: { ...review.data, zones: ["porch"] },
      }),
    );

    const nextImage = list.querySelector("img[data-thumb-id]");
    const placeholder = nextImage.nextElementSibling;
    return {
      imagePreserved: nextImage === image,
      imageDisplay: nextImage.style.display,
      placeholderDisplay: placeholder.style.display,
      thumbnailWidth: Math.round(placeholder.getBoundingClientRect().width),
    };
  });

  expect(state).toEqual({
    imagePreserved: true,
    imageDisplay: "none",
    placeholderDisplay: "flex",
    thumbnailWidth: 160,
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
    await card._cardViewPageController.prepareStyles();
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
    await overlay._cardViewPageController.prepareStyles();
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
    const lazyController = card._linkedLightController;
    await lazyController._ensureDelegate();
    const controller = lazyController._delegate;
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
    await card._wideViewPageController.prepare();
    card._pageId = "wide-view";
    card._renderShell();
    await card._wideViewCompanionController._ensureDelegate();
    await card._wideViewTimelineController._ensureDelegate();
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
    const companion = card._wideViewCompanionController._delegate;
    companion._panelExpansionPanel = root.querySelector("#wide-companion-panel");
    companion._panelExpansionHandle = root.querySelector("[data-wide-companion-resize-handle]");
    companion._panelExpansionButton = expand;
    companion._panelExpansionMaxPx = 100;
    companion._setPanelExpansion(40, { scheduleLayout: false });
    const collapsedLabel = expand.getAttribute("aria-label");
    const timeline = card._wideViewTimelineController._delegate;
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
    card._slideshowPageController.available = () => true;
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
      wide_view_width: 75,
      card_view_page_enabled: true,
      card_view_view_mode: "bottom-panel-open",
    });
    editor.hass = { locale: { language: "en" }, states: {}, themes: {} };
    const takeover = editor.querySelector("#single_view_alert_takeover");
    const wideScale = editor.querySelector('[name="wide_view_timeline_default_scale"][value="6"]');
    const wideWidth = editor.querySelector('[name="wide_view_width"][value="75"]');
    const cardMode = editor.querySelector('[name="card_view_view_mode"][value="bottom-panel-open"]');
    const disabledGrid = editor.querySelector('[name="single_view_start_mode"][value="grid"]');
    const disabledGridLabel = disabledGrid.closest("label");
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
      "editor.wideView.inBetweenWidth": "Intermédiaire",
      "editor.wideView.widthDisclaimer": "La largeur dépend de l'espace disponible.",
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
      wideWidthPreserved: editor.querySelector('[name="wide_view_width"][value="75"]') === wideWidth,
      wideWidthChecked: wideWidth.checked,
      wideWidthLabel: wideWidth.getAttribute("aria-label"),
      wideWidthDisclaimer: editor.querySelector('[data-fvc-i18n="editor.wideView.widthDisclaimer"]').textContent,
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
    wideWidthPreserved: true,
    wideWidthChecked: true,
    wideWidthLabel: "Intermédiaire",
    wideWidthDisclaimer: "La largeur dépend de l'espace disponible.",
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

test("nested visual editor saves update only the owning stack child", async ({
  page,
}) => {
  await page.goto(baseUrl);
  const state = await page.evaluate(async () => {
    await import("/frigate-view-card-editor.js");
    const first = {
      type: "custom:frigate-view-card",
      cameras: [{ entity: "camera.front" }],
      title: "First",
    };
    const second = {
      type: "custom:frigate-view-card",
      cameras: [{ entity: "camera.back" }],
      title: "Second",
    };
    const dialog = document.createElement("hui-dialog-edit-card");
    dialog._cardConfig = {
      type: "horizontal-stack",
      cards: [first, second],
    };
    const root = dialog.attachShadow({ mode: "open" });
    const editor = document.createElement("frigate-view-card-editor");
    root.append(editor);
    document.body.append(dialog);
    editor.setConfig(first);
    editor.querySelector("#title").value = "Changed";
    editor.querySelector("#display_title").checked = false;

    let handoff = null;
    dialog.addEventListener("frigate-view-card-config-commit", (event) => {
      handoff = event.detail;
    });
    dialog.addEventListener("config-changed", (event) => {
      dialog._cardConfig = {
        ...dialog._cardConfig,
        cards: [event.detail.config, dialog._cardConfig.cards[1]],
      };
    });

    editor._commitDraftToHomeAssistantDialog();
    return {
      type: dialog._cardConfig.type,
      cardCount: dialog._cardConfig.cards.length,
      first: dialog._cardConfig.cards[0],
      second: dialog._cardConfig.cards[1],
      previousWasChild: handoff?.previousConfig === first,
      committedTitle: handoff?.config?.title,
    };
  });

  expect(state).toMatchObject({
    type: "horizontal-stack",
    cardCount: 2,
    first: {
      type: "custom:frigate-view-card",
      cameras: [{ entity: "camera.front" }],
      title: "Changed",
      display_title: false,
    },
    second: {
      type: "custom:frigate-view-card",
      cameras: [{ entity: "camera.back" }],
      title: "Second",
    },
    previousWasChild: true,
    committedTitle: "Changed",
  });
});

test("Wide View Custom width persists its slider value and presets clear it", async ({
  page,
}) => {
  await page.goto(baseUrl);
  const state = await page.evaluate(async () => {
    await import("/frigate-view-card-editor.js");
    const editor = document.createElement("frigate-view-card-editor");
    document.body.append(editor);
    editor.setConfig({
      cameras: [{ entity: "camera.front", name: "Front" }],
      wide_view_page_enabled: true,
      wide_view_width: 75,
      col_left_width_pct: 63,
    });
    editor.hass = { locale: { language: "en" }, states: {}, themes: {} };

    const previewDrafts = [];
    window.addEventListener(
      "frigate-view-card-preview-draft",
      (event) => previewDrafts.push(event.detail?.config),
    );
    const slider = editor.querySelector("#col_left_width_pct");
    const custom = editor.querySelector(
      '[name="wide_view_width"][value="custom"]',
    );
    const preset = editor.querySelector(
      '[name="wide_view_width"][value="50"]',
    );
    const row = editor.querySelector("#col-left-custom-row");
    const initial = {
      optionValues: Array.from(
        editor.querySelectorAll('[name="wide_view_width"]'),
        (input) => input.value,
      ),
      customChecked: custom.checked,
      rowDisplay: row.style.display,
      min: slider.min,
      max: slider.max,
      value: slider.value,
      output: editor.querySelector("#col_left_width_pct-output").textContent,
      yaml: editor._homeAssistantConfig(),
    };

    preset.click();
    const presetState = {
      rowDisplay: row.style.display,
      yaml: editor._homeAssistantConfig(),
    };

    custom.click();
    slider.value = "67";
    slider.dispatchEvent(new Event("input", { bubbles: true }));
    slider.dispatchEvent(new Event("change", { bubbles: true }));
    await new Promise((resolve) =>
      requestAnimationFrame(() => requestAnimationFrame(resolve)),
    );
    const restoredCustom = {
      rowDisplay: row.style.display,
      output: editor.querySelector("#col_left_width_pct-output").textContent,
      yaml: editor._homeAssistantConfig(),
      preview: previewDrafts.at(-1),
      dirty: editor._hasConfigDraft,
    };

    return { initial, presetState, restoredCustom };
  });

  expect(state.initial).toMatchObject({
    optionValues: ["50", "75", "100", "custom"],
    customChecked: true,
    rowDisplay: "",
    min: "25",
    max: "75",
    value: "63",
    output: "63%",
  });
  expect(state.initial.yaml.col_left_width_pct).toBe(63);
  expect(state.initial.yaml.wide_view_width).toBeUndefined();
  expect(state.presetState.rowDisplay).toBe("none");
  expect(state.presetState.yaml.wide_view_width).toBe(50);
  expect(state.presetState.yaml.col_left_width_pct).toBeUndefined();
  expect(state.restoredCustom.rowDisplay).toBe("");
  expect(state.restoredCustom.output).toBe("67%");
  expect(state.restoredCustom.yaml.col_left_width_pct).toBe(67);
  expect(state.restoredCustom.yaml.wide_view_width).toBeUndefined();
  expect(state.restoredCustom.preview.col_left_width_pct).toBe(67);
  expect(state.restoredCustom.dirty).toBe(true);
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

test("settings panel titles use accent only for pending unsaved changes", async ({
  page,
}) => {
  await page.goto(baseUrl);
  const state = await page.evaluate(async () => {
    await import("/frigate-view-card-editor.js");
    const editor = document.createElement("frigate-view-card-editor");
    editor.style.cssText = [
      "--primary-text-color:#111111",
      "--secondary-text-color:#555555",
      "--primary-color:#006699",
      "--accent-color:#ff6600",
      "--c-text:#111111",
      "--c-text2:#555555",
      "--c-accent:#ff6600",
      "--card-background-color:#ffffff",
      "--secondary-background-color:#eeeeee",
      "--state-inactive-color:#cccccc",
      "--divider-color:#dddddd",
    ].join(";");
    document.body.append(editor);
    editor.setConfig({
      cameras: [{ entity: "camera.front", name: "Front" }],
      snapshot_update_seconds: 5,
    });
    editor.hass = { locale: { language: "en" }, states: {}, themes: {} };

    const panel = editor.querySelector('[data-panel="general"]');
    const toggle = panel.querySelector(".setting-title");
    const icon = toggle.querySelector("ha-icon");
    toggle.style.transition = "none";
    const readState = () => ({
      active: panel.classList.contains("active"),
      dirty: panel.dataset.configDirty,
      titleColor: getComputedStyle(toggle).color,
      iconColor: getComputedStyle(icon).color,
    });
    const settle = () =>
      new Promise((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(resolve)),
      );

    const closed = readState();
    toggle.click();
    await settle();
    const opened = readState();

    editor
      .querySelector('[name="snapshot_update_seconds"][value="2"]')
      .click();
    await settle();
    const changed = readState();

    toggle.click();
    await settle();
    const closedDirty = readState();

    toggle.click();
    editor
      .querySelector('[name="snapshot_update_seconds"][value="5"]')
      .click();
    await settle();
    const reverted = readState();

    return { closed, opened, changed, closedDirty, reverted };
  });

  expect(state.closed).toEqual({
    active: false,
    dirty: "false",
    titleColor: "rgb(17, 17, 17)",
    iconColor: "rgb(85, 85, 85)",
  });
  expect(state.opened).toEqual({ ...state.closed, active: true });
  expect(state.changed).toEqual({
    active: true,
    dirty: "true",
    titleColor: "rgb(255, 102, 0)",
    iconColor: "rgb(255, 102, 0)",
  });
  expect(state.closedDirty).toEqual({ ...state.changed, active: false });
  expect(state.reverted).toEqual({ ...state.opened, active: true });
});

test("Snapshot Refresh offers 2 and 5 seconds while keeping every bubble on one row", async ({
  page,
}) => {
  await page.setViewportSize({ width: 430, height: 900 });
  await page.goto(baseUrl);
  const state = await page.evaluate(async () => {
    await import("/frigate-view-card-editor.js");
    const editor = document.createElement("frigate-view-card-editor");
    editor.style.cssText = "display:block;width:380px";
    document.body.append(editor);
    editor.setConfig({
      cameras: [{ entity: "camera.front", name: "Front" }],
      snapshot_update_seconds: 5,
    });
    editor.hass = { locale: { language: "en" }, states: {}, themes: {} };
    editor.querySelector('[data-panel-toggle="general"]').click();
    await new Promise((resolve) => requestAnimationFrame(resolve));

    const previewDrafts = [];
    window.addEventListener(
      "frigate-view-card-preview-draft",
      (event) => previewDrafts.push(event.detail?.config),
    );
    const choices = Array.from(
      editor.querySelectorAll('[name="snapshot_update_seconds"]'),
    );
    const initial = {
      values: choices.map((input) => input.value),
      selected: choices.find((input) => input.checked)?.value,
      rowTops: choices.map((input) =>
        Math.round(input.closest("label").getBoundingClientRect().top),
      ),
    };

    editor
      .querySelector('[name="snapshot_update_seconds"][value="2"]')
      .click();
    await new Promise((resolve) =>
      requestAnimationFrame(() => requestAnimationFrame(resolve)),
    );

    return {
      initial,
      saved: editor._homeAssistantConfig({ readDom: false })
        .snapshot_update_seconds,
      preview: previewDrafts.at(-1)?.snapshot_update_seconds,
      dirty: editor._hasConfigDraft,
    };
  });

  expect(state.initial.values).toEqual([
    "2",
    "5",
    "10",
    "20",
    "30",
    "60",
    "120",
    "300",
  ]);
  expect(state.initial.selected).toBe("5");
  expect(new Set(state.initial.rowTops).size).toBe(1);
  expect(state.saved).toBe(2);
  expect(state.preview).toBe(2);
  expect(state.dirty).toBe(true);
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
    });
    const hass = { locale: { language: "en" }, states: {}, themes: {} };
    editor.hass = hass;
    const panel = editor.querySelector('[data-panel="layout"]');
    const slider = editor.querySelector("#stream_height");
    const heightUnit = editor.querySelector('[name="stream_height_unit"][value="dvh"]');
    const tightMargins = editor.querySelector("#tight_margins");
    editor._setEditorFieldError(
      "#stream_height",
      editor._t("editor.layout.cardHeightRangeValidation", { min: 50, max: 100 }),
    );
    let configChanged = 0;
    editor.addEventListener("config-changed", () => { configChanged += 1; });

    const english = editor._localization;
    const translated = {
      "editor.panels.layout": "Paramètres de disposition",
      "editor.layout.cardHeightLimit": "Limite de hauteur",
      "editor.layout.cardHeightUnit": "Unité de hauteur",
      "editor.layout.autoHeightHelp": "Utilisez la hauteur automatique.",
      "editor.layout.cardHeightLimitDisclaimer": "Le placement de la carte et la hauteur de la fenêtre peuvent limiter son effet.",
      "editor.layout.cardHeightRangeValidation": "Nombre entier entre {min} et {max}.",
      "editor.layout.tightMargins": "Marges serrées",
      "editor.layout.tightMarginsHelp": "Réduit l'espacement autour de la carte.",
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
      heightLabel: editor.querySelector('[data-fvc-i18n="editor.layout.cardHeightLimit"]').textContent,
      heightHelp: editor.querySelector('[data-fvc-i18n="editor.layout.autoHeightHelp"]').textContent,
      heightDisclaimer: editor.querySelector('[data-fvc-i18n="editor.layout.cardHeightLimitDisclaimer"]').textContent,
      heightError: editor.querySelector("#stream_height-helper").textContent,
      heightInvalid: slider.hasAttribute("data-invalid"),
      tightLabel: editor.querySelector('[data-fvc-i18n="editor.layout.tightMargins"]').textContent,
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
    heightLabel: "Limite de hauteur",
    heightHelp: "Utilisez la hauteur automatique.",
    heightDisclaimer: "Le placement de la carte et la hauteur de la fenêtre peuvent limiter son effet.",
    heightError: "Nombre entier entre 50 et 100.",
    heightInvalid: true,
    tightLabel: "Marges serrées",
    configChanged: 0,
  });
});

test("Display Options localize in place and preserve disabled controls", async ({ page }) => {
  await page.goto(baseUrl);
  const state = await page.evaluate(async () => {
    await import("/frigate-view-card-editor.js");
    const editor = document.createElement("frigate-view-card-editor");
    editor.style.width = "480px";
    editor._activeSettingsPanelId = "displayOptions";
    document.body.append(editor);
    editor.setConfig({
      cameras: [{ entity: "camera.front", name: "Front" }],
      mobile_view_page_enabled: true,
      hidden_tabs: ["snapshot", "kept"],
      display_filter_control: false,
      display_calendar_control: false,
      display_source_indicator: false,
      display_online_indicator: false,
      display_back_button: false,
      display_logo: false,
      display_version: false,
      display_footer: false,
      display_alert_count: false,
      display_alert_detection_chip: false,
      display_alert_detection_outline: false,
      display_object_chips: false,
      display_location_area_zone: false,
    });
    const hass = { locale: { language: "en" }, states: {}, themes: {} };
    editor.hass = hass;
    const panel = editor.querySelector('[data-panel="displayOptions"]');
    const filter = editor.querySelector("#display_filter_control");
    const back = editor.querySelector("#display_back_button");
    const warning = editor.querySelector("#display-back-button-warning");
    const panels = [...editor.querySelectorAll("[data-panel]")];
    let configChanged = 0;
    editor.addEventListener("config-changed", () => { configChanged += 1; });

    editor.hass = { ...hass, locale: { language: "fr" } };
    await editor._localization.whenReady();

    const displaySwitchIds = [
      "display_filter_control",
      "display_calendar_control",
      "display_source_indicator",
      "display_online_indicator",
      "display_back_button",
      "display_logo",
      "display_version",
      "display_footer",
      "display_alert_count",
      "display_alert_detection_chip",
      "display_alert_detection_outline",
      "display_object_chips",
      "display_location_area_zone",
    ];
    return {
      directlyAfterLayout:
        panels[panels.indexOf(panel) - 1]?.dataset.panel === "layout",
      themeDirectlyAfterDisplay:
        panels[panels.indexOf(panel) + 1]?.dataset.panel === "theme",
      panelPreserved: editor.querySelector('[data-panel="displayOptions"]') === panel,
      panelOpen: panel.classList.contains("active"),
      filterPreserved: editor.querySelector("#display_filter_control") === filter,
      backPreserved: editor.querySelector("#display_back_button") === back,
      allDisabled: displaySwitchIds.every((id) => {
        const control = editor.querySelector(`#${id}`);
        return control.checked !== true && !control.hasAttribute("checked");
      }),
      favoritesEnabled:
        editor.querySelector('[data-active-tab="kept"]').checked === true,
      activeTabsAreCheckboxes: [...editor.querySelectorAll("[data-active-tab]")]
        .every((input) => input.tagName === "INPUT" && input.type === "checkbox"),
      activeTabsOneRow:
        new Set([...editor.querySelectorAll("[data-active-tab]")]
          .map((input) => Math.round(input.closest(".editor-choice-chip").getBoundingClientRect().top)))
          .size === 1,
      warningPreserved: editor.querySelector("#display-back-button-warning") === warning,
      warningVisible: warning.hidden === false,
      panelTitle: panel.querySelector("h3").textContent,
      buttonsHeading: editor.querySelector('[data-fvc-i18n="editor.displayOptions.buttons"]').textContent,
      filterLabel: editor.querySelector('[data-fvc-i18n="editor.displayOptions.filterButton"]').textContent,
      warningText: warning.querySelector("span").textContent,
      configChanged,
    };
  });

  expect(state).toEqual({
    directlyAfterLayout: true,
    themeDirectlyAfterDisplay: true,
    panelPreserved: true,
    panelOpen: true,
    filterPreserved: true,
    backPreserved: true,
    allDisabled: true,
    favoritesEnabled: false,
    activeTabsAreCheckboxes: true,
    activeTabsOneRow: true,
    warningPreserved: true,
    warningVisible: true,
    panelTitle: "Options d'affichage",
    buttonsHeading: "Boutons",
    filterLabel: "Afficher le bouton de filtre",
    warningText: "Lorsque la Vue mobile est activée, masquer le bouton Retour peut empêcher l'utilisateur de quitter la page Vue mobile.",
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

test("disabling Grid or Slideshow resets only pages using that start mode", async ({ page }) => {
  await page.goto(baseUrl);
  const state = await page.evaluate(async () => {
    await import("/frigate-view-card-editor.js");
    const editor = document.createElement("frigate-view-card-editor");
    document.body.append(editor);
    editor.setConfig({
      cameras: [
        { entity: "camera.front", name: "Front" },
        { entity: "camera.back", name: "Back" },
      ],
      grid_mode_enabled: true,
      slideshow_rotation_enabled: true,
      single_view_start_mode: "grid",
      wide_view_start_mode: "slideshow",
      card_view_start_mode: "slideshow",
    });

    const settle = () =>
      new Promise((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(resolve)),
      );
    const grid = editor.querySelector("#grid_mode_enabled");
    const slideshow = editor.querySelector("#slideshow_rotation_enabled");
    editor.querySelector("#mobile_view_page_enabled").checked = true;
    grid.checked = true;
    slideshow.checked = true;
    slideshow.checked = false;
    slideshow.dispatchEvent(new Event("change", { bubbles: true }));
    await settle();

    const afterSlideshow = {
      gridControlChecked: grid.checked,
      gridEnabled: editor._config.grid_mode_enabled,
      slideshowControlChecked: slideshow.checked,
      slideshowEnabled: editor._config.slideshow_rotation_enabled,
      single: editor._config.single_view_start_mode,
      wide: editor._config.wide_view_start_mode,
      card: editor._config.card_view_start_mode,
      singleGridChecked: editor.querySelector(
        '[name="single_view_start_mode"][value="grid"]',
      ).checked,
      wideLiveChecked: editor.querySelector(
        '[name="wide_view_start_mode"][value="live"]',
      ).checked,
      cardLiveChecked: editor.querySelector(
        '[name="card_view_start_mode"][value="live"]',
      ).checked,
    };

    grid.checked = false;
    grid.dispatchEvent(new Event("change", { bubbles: true }));
    await settle();

    return {
      afterSlideshow,
      afterGrid: {
        single: editor._config.single_view_start_mode,
        wide: editor._config.wide_view_start_mode,
        card: editor._config.card_view_start_mode,
        singleLiveChecked: editor.querySelector(
          '[name="single_view_start_mode"][value="live"]',
        ).checked,
        gridChoicesDisabled: [
          ...editor.querySelectorAll(
            '[name$="_view_start_mode"][value="grid"]',
          ),
        ].every((input) => input.disabled),
        slideshowChoicesDisabled: [
          ...editor.querySelectorAll(
            '[name$="_view_start_mode"][value="slideshow"]',
          ),
        ].every((input) => input.disabled),
      },
    };
  });

  expect(state).toEqual({
    afterSlideshow: {
      gridControlChecked: true,
      gridEnabled: true,
      slideshowControlChecked: false,
      slideshowEnabled: false,
      single: "grid",
      wide: "live",
      card: "live",
      singleGridChecked: true,
      wideLiveChecked: true,
      cardLiveChecked: true,
    },
    afterGrid: {
      single: "live",
      wide: "live",
      card: "live",
      singleLiveChecked: true,
      gridChoicesDisabled: true,
      slideshowChoicesDisabled: true,
    },
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

test("Panel view centers page-specific responsive width caps", async ({ page }) => {
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
    await card._cardViewPageController.prepareStyles();
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
  for (const key of ["single", "mobile"]) {
    expect(result[key].width).toBeGreaterThanOrEqual(320);
    expect(result[key].width).toBeLessThan(1_133);
  }
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

test("phone cards reserve their wrapper-constrained height before the Mobile View startup route", async ({
  browser,
}) => {
  const context = await browser.newContext({
    hasTouch: true,
    userAgent:
      "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) " +
      "AppleWebKit/605.1.15 Mobile/15E148",
    viewport: { width: 412, height: 844 },
  });
  const page = await context.newPage();
  await page.goto(baseUrl);

  const state = await page.evaluate(async () => {
    await import("/frigate-view-card.js");
    document.body.style.margin = "0";

    const spacer = document.createElement("div");
    spacer.style.height = "100px";
    const wrapper = document.createElement("div");
    const card = document.createElement("frigate-view-card");
    document.body.append(spacer, wrapper);

    card.setConfig({
      cameras: [{ entity: "camera.front", name: "Front" }],
      mobile_view_page_enabled: true,
      mobile_page: "mobile-view",
      stream_height: 100,
      stream_height_unit: "%",
    });
    const detachedHeight = card.style.getPropertyValue("--card-host-height");

    wrapper.append(card);
    const attached = {
      height: card.style.getPropertyValue("--card-host-height"),
      rectHeight: Math.round(card.getBoundingClientRect().height),
      pageId: card._pageId,
    };

    card._pageNavigationController.prepareConfiguredLandingPageShell({
      hasPendingDeepLinkTarget: false,
    });
    const routed = {
      height: card.style.getPropertyValue("--card-host-height"),
      rectHeight: Math.round(card.getBoundingClientRect().height),
      pageId: card._pageId,
    };

    return { detachedHeight, attached, routed };
  });

  await context.close();

  expect(state).toEqual({
    detachedHeight: "788px",
    attached: {
      height: "744px",
      rectHeight: 744,
      pageId: "single-view",
    },
    routed: {
      height: "744px",
      rectHeight: 744,
      pageId: "mobile-view",
    },
  });
});

test("Single and Mobile View footers become compact when the logo is disabled", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1_200, height: 900 });
  await page.goto(baseUrl);

  const result = await page.evaluate(async () => {
    await import("/frigate-view-card.js");

    const sample = (pageId, displayLogo) => {
      const card = document.createElement("frigate-view-card");
      card.style.cssText = "display:block;width:500px;height:700px";
      document.body.append(card);
      card.setConfig({
        cameras: [{ entity: "camera.front", name: "Front" }],
        mobile_view_page_enabled: true,
        display_logo: displayLogo,
        display_version: true,
      });
      card._pageId = pageId;
      card._renderShell();

      const footer = card.shadowRoot.querySelector(
        '[data-fvc-region="footer"]',
      );
      const state = {
        height: footer.getBoundingClientRect().height,
        compact: footer.classList.contains("footer--logo-hidden"),
        hasLogo: Boolean(footer.querySelector(".fvc-brand-logo svg")),
        versionVisible: !footer.querySelector(".footer-version").hidden,
      };
      card.remove();
      return state;
    };

    const sampleReenabledLogo = async (pageId) => {
      const card = document.createElement("frigate-view-card");
      card.style.cssText = "display:block;width:500px;height:700px";
      document.body.append(card);
      const config = {
        cameras: [{ entity: "camera.front", name: "Front" }],
        mobile_view_page_enabled: true,
        display_logo: false,
        display_version: true,
      };
      card.setConfig(config);
      card._pageId = pageId;
      card._renderShell();
      const footer = card.shadowRoot.querySelector(
        '[data-fvc-region="footer"]',
      );
      const previousConfig = card._config;
      const nextConfig = { ...previousConfig, display_logo: true };
      card._config = nextConfig;
      await card._editorPreviewController.applyConfigDraft({
        previousConfig,
        nextConfig,
      });
      const updatedFooter = card.shadowRoot.querySelector(
        '[data-fvc-region="footer"]',
      );
      const state = {
        footerPreserved: updatedFooter === footer,
        compact: updatedFooter.classList.contains("footer--logo-hidden"),
        hasLogo: Boolean(updatedFooter.querySelector(".fvc-brand-logo svg")),
      };
      card.remove();
      return state;
    };

    return {
      singleWithLogo: sample("single-view", true),
      singleWithoutLogo: sample("single-view", false),
      mobileWithLogo: sample("mobile-view", true),
      mobileWithoutLogo: sample("mobile-view", false),
      singleReenabled: await sampleReenabledLogo("single-view"),
      mobileReenabled: await sampleReenabledLogo("mobile-view"),
    };
  });

  for (const [withLogo, withoutLogo] of [
    [result.singleWithLogo, result.singleWithoutLogo],
    [result.mobileWithLogo, result.mobileWithoutLogo],
  ]) {
    expect(withLogo.compact).toBe(false);
    expect(withLogo.hasLogo).toBe(true);
    expect(withoutLogo.compact).toBe(true);
    expect(withoutLogo.hasLogo).toBe(false);
    expect(withoutLogo.versionVisible).toBe(true);
    expect(withoutLogo.height).toBeLessThan(withLogo.height);
  }
  for (const reenabled of [result.singleReenabled, result.mobileReenabled]) {
    expect(reenabled).toEqual({
      footerPreserved: true,
      compact: false,
      hasLogo: true,
    });
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
      cameras: [
        { entity: "camera.front", name: "Front" },
        { entity: "camera.back", name: "Back" },
      ],
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

test("disabled Display Options hide controls and browse metadata without removing live media", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(baseUrl);

  const state = await page.evaluate(async () => {
    await import("/frigate-view-card.js");
    const card = document.createElement("frigate-view-card");
    card._isLikelyMobileClient = () => true;
    card._isLikelyPhoneClient = () => true;
    card.setConfig({
      cameras: [
        { entity: "camera.front", name: "Front" },
        { entity: "camera.back", name: "Back" },
      ],
      mobile_view_page_enabled: true,
      hidden_tabs: ["snapshot", "kept"],
      display_filter_control: false,
      display_calendar_control: false,
      display_source_indicator: false,
      display_online_indicator: false,
      display_back_button: false,
      display_alert_detection_chip: false,
      display_alert_detection_outline: false,
      display_object_chips: false,
      display_location_area_zone: false,
      display_alert_count: false,
      display_footer: false,
    });
    document.body.append(card);
    card._pageId = "mobile-view";
    card._buildTabsMarkup();
    card._renderShell();
    card._renderCamSwitcher();
    card._applyCardStyle();

    const root = card.shadowRoot;
    const cardRoot = root.querySelector("#card");
    const probe = document.createElement("div");
    probe.className = "list-item";
    probe.innerHTML = `
      <div class="et alert"></div>
      <span class="review-severity-chip">Alert</span>
      <span class="review-object-tag">Person</span>
      <span class="cam-badge">Front</span>
      <span class="zone-meta">Porch</span>
      <button data-fav>Favorite</button>`;
    cardRoot.append(probe);

    const display = (selector) => {
      const element = root.querySelector(selector);
      return element ? getComputedStyle(element).display : `missing:${selector}`;
    };
    const mobile = {
      livePresent: Boolean(root.querySelector("#eng-wrap")),
      filter: display("#filter-btn"),
      calendar: display("#cal-btn"),
      source: display(".mobile-cam-picker__stream"),
      online: display(".mobile-cam-picker__live-tile"),
      pickerOnline: display(".mobile-cam-picker__trigger-dot"),
      cameraOnline: display(".cam-dot"),
      backPresent: Boolean(root.querySelector("[data-page-back]")),
      footer: display('[data-fvc-region="footer"]'),
      severityChip: display(".review-severity-chip"),
      objectChip: display(".review-object-tag"),
      camera: display(".cam-badge"),
      zone: display(".zone-meta"),
      favorite: display("[data-fav]"),
      alertOutline: getComputedStyle(root.querySelector(".et.alert")).outlineStyle,
    };

    card._pageId = "single-view";
    card._renderShell();
    card._applyCardStyle();
    const single = {
      livePresent: Boolean(root.querySelector("#eng-wrap")),
      source: display(".info-stream-stat"),
      online: display(".info-online-stat"),
      liveBadge: display("[data-single-view-live-badge]"),
      alertCount: display(".info-alert-stat"),
      footer: display('[data-fvc-region="footer"]'),
    };
    return {
      classes: [
        "display-filter-control-off",
        "display-calendar-control-off",
        "display-source-indicator-off",
        "display-online-indicator-off",
        "display-back-button-off",
        "display-alert-detection-chip-off",
        "display-alert-detection-outline-off",
        "display-object-chips-off",
        "display-location-area-zone-off",
        "display-alert-count-off",
        "display-footer-off",
        "favorites-tab-hidden",
      ].every((name) => cardRoot.classList.contains(name)),
      mobile,
      single,
    };
  });

  expect(state).toEqual({
    classes: true,
    mobile: {
      livePresent: true,
      filter: "none",
      calendar: "none",
      source: "none",
      online: "none",
      pickerOnline: "none",
      cameraOnline: "none",
      backPresent: false,
      footer: "none",
      severityChip: "none",
      objectChip: "none",
      camera: "none",
      zone: "none",
      favorite: "none",
      alertOutline: "none",
    },
    single: {
      livePresent: true,
      source: "none",
      online: "none",
      liveBadge: "none",
      alertCount: "none",
      footer: "none",
    },
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
    popup.style.setProperty("overscroll-behavior-x", "contain", "important");
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
        overflowX: style.overflowX,
        overscrollX: style.overscrollBehaviorX,
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
    single: { padding: ["14px", "0px", "0px", "0px"], extraBottom: "0px", overflowX: "hidden", overscrollX: "none", overscrollY: "contain" },
    mobile: { padding: ["14px", "4px", "0px", "4px"], extraBottom: "0px", overflowX: "hidden", overscrollX: "none", overscrollY: "none" },
    mobileFitsPopup: true,
    singleAgain: { padding: ["14px", "0px", "0px", "0px"], extraBottom: "0px", overflowX: "hidden", overscrollX: "none", overscrollY: "contain" },
    mobileNonPhone: { padding: ["14px", "0px", "0px", "0px"], extraBottom: "0px", overflowX: "hidden", overscrollX: "none", overscrollY: "contain" },
    disabled: { padding: ["14px", "18px", "22px", "26px"], extraBottom: "66px", overflowX: "auto", overscrollX: "contain", overscrollY: "contain" },
    disconnected: { padding: ["14px", "18px", "22px", "26px"], extraBottom: "66px", overflowX: "auto", overscrollX: "contain", overscrollY: "contain" },
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

for (const phone of [true, false]) {
  test(`Bubble popup preserves two browse rows with preceding cards on ${phone ? "a phone" : "a short desktop"}`, async ({ page }) => {
    await page.setViewportSize(phone ? { width: 390, height: 844 } : { width: 900, height: 500 });
    await page.goto(baseUrl);
    const results = await page.evaluate(async (phone) => {
      await import("/frigate-view-card.js");
      document.body.style.margin = "0";
      const results = [];
      for (const pageId of ["mobile-view", "single-view"]) {
        for (const tightMargins of [true, false]) {
          for (const unit of ["%", "dvh"]) {
            const sections = document.createElement("hui-sections-view");
            const popup = document.createElement("div");
            popup.className = "bubble-pop-up-container";
            popup.style.cssText = `position:fixed;top:40px;left:0;width:${phone ? 390 : 450}px;height:${phone ? 680 : 400}px;overflow-y:auto;box-sizing:border-box;padding:14px 8px`;
            const content = popup.attachShadow({ mode: "open" });
            const preceding = document.createElement("div");
            preceding.style.height = "300px";
            const wrapper = document.createElement("div");
            content.append(preceding, wrapper);
            sections.append(popup);
            document.body.append(sections);
            const card = document.createElement("frigate-view-card");
            card._isLikelyMobileClient = () => phone;
            card._isLikelyPhoneClient = () => phone;
            card.setConfig({
              cameras: [{ entity: "camera.front" }],
              tight_margins: tightMargins,
              stream_height: 100,
              stream_height_unit: unit,
              display_footer: false,
            });
            wrapper.append(card);
            card._pageId = pageId;
            card._renderShell();
            await new Promise((resolve) => requestAnimationFrame(resolve));
            card._applyCardStyle();
            const browse = card.shadowRoot.querySelector('[data-fvc-region="browse"]');
            const initialHeight = card.getBoundingClientRect().height;
            const browseHeight = browse.getBoundingClientRect().height;
            const overflowY = getComputedStyle(popup).overflowY;
            popup.scrollTop = popup.scrollHeight;
            const scrollTop = popup.scrollTop;
            card._applyCardStyle();
            const scrolledHeight = card.getBoundingClientRect().height;
            const browseReachable = browse.getBoundingClientRect().bottom <= popup.getBoundingClientRect().bottom + 1;
            const following = document.createElement("div");
            following.style.height = "40px";
            content.append(following);
            card._applyCardStyle();
            const withFollowingHeight = browse.getBoundingClientRect().height;
            // The browse list remains independently scrollable inside the taller card.
            const events = document.createElement("div");
            events.style.cssText = "height:1200px;flex:none";
            browse.append(events);
            browse.scrollTop = 100;
            results.push({ pageId, tightMargins, unit, initialHeight, scrolledHeight,
              browseHeight, withFollowingHeight, overflowY, scrollTop, browseReachable,
              browseScrollTop: browse.scrollTop });
            sections.remove();
          }
        }
      }
      return results;
    }, phone);
    for (const result of results) {
      const context = JSON.stringify(result);
      expect(result.browseHeight, context).toBeGreaterThanOrEqual(244);
      expect(result.withFollowingHeight, context).toBeGreaterThanOrEqual(244);
      expect(result.overflowY, context).toBe("auto");
      expect(result.scrollTop, context).toBeGreaterThan(0);
      expect(result.scrolledHeight, context).toBeCloseTo(result.initialHeight, 0);
      expect(result.browseReachable, context).toBe(true);
      expect(result.browseScrollTop, context).toBeGreaterThan(0);
    }
  });
}

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
    await card._cardViewPageController.prepareStyles();
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
    await card._cardViewPageController.prepareStyles();
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
        await card._cardViewPageController.prepareStyles();
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
    await card._cardViewPageController.prepareStyles();
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

test("Sidebar Single and Mobile Views reserve two browse rows within a short viewport", async ({
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
    const maxWidth = Number.parseInt(view.maxWidth, 10);
    expect(maxWidth).toBeGreaterThanOrEqual(320);
    expect(maxWidth).toBeLessThan(984);
    expect(Math.abs(view.hostWidth - maxWidth)).toBeLessThanOrEqual(1);
    expect(view.hostBottom).toBeLessThanOrEqual(820);
    expect(view.footerBottom).toBeLessThanOrEqual(view.hostBottom);
    expect(view.footerVisible).toBe(true);
    expect(view.browseHeight).toBeGreaterThanOrEqual(244);
    expect(view.browseOverflowY).toBe("auto");
    expect(view.wrapperHeight).toBe("auto");
  }
});

test("Panel Single and Mobile Views reserve two browse rows without page scrolling", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1_500, height: 876 });
  await page.goto(baseUrl);

  const result = await page.evaluate(async () => {
    await import("/frigate-view-card.js");
    document.body.style.margin = "0";

    const measure = async (pageId) => {
      const view = document.createElement("hui-panel-view");
      view.style.cssText = "display:block;width:100vw;height:820px";
      const wrapper = document.createElement("div");
      wrapper.style.cssText = "width:100%;height:100%";
      view.append(wrapper);
      document.body.append(view);

      const card = document.createElement("frigate-view-card");
      wrapper.append(card);
      card.setConfig({
        cameras: [{ entity: "camera.front", name: "Front" }],
        stream_height: 100,
        stream_height_unit: "%",
        mobile_view_page_enabled: true,
      });
      card._pageId = pageId;
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
        maxWidth: card.style.getPropertyValue("--fvc-panel-view-max-width"),
        hostHeight: Math.round(hostRect.height),
        hostWidth: Math.round(hostRect.width),
        browseHeight: Math.round(browseRect.height),
        footerInsideHost: footerRect.bottom <= hostRect.bottom,
        pageScrollable:
          document.documentElement.scrollHeight > window.innerHeight,
      };
      view.remove();
      return measurement;
    };

    const measurements = [];
    for (const pageId of ["single-view", "mobile-view"]) {
      measurements.push(await measure(pageId));
    }
    return measurements;
  });

  for (const view of result) {
    const maxWidth = Number.parseInt(view.maxWidth, 10);
    expect(maxWidth).toBeGreaterThanOrEqual(320);
    expect(maxWidth).toBeLessThan(984);
    expect(Math.abs(view.hostWidth - maxWidth)).toBeLessThanOrEqual(1);
    expect(view.hostHeight).toBe(820);
    expect(view.browseHeight).toBeGreaterThanOrEqual(244);
    expect(view.footerInsideHost).toBe(true);
    expect(view.pageScrollable).toBe(false);
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

test("Sections and Masonry preserve two browse rows when the footer is hidden", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1200, height: 700 });
  await page.goto(baseUrl);

  const result = await page.evaluate(async () => {
    await import("/frigate-view-card.js");
    document.body.style.margin = "0";

    const measure = async (viewTagName, pageId) => {
      const view = document.createElement(viewTagName);
      view.style.cssText = "display:block;width:1000px";
      document.body.append(view);
      const card = document.createElement("frigate-view-card");
      view.append(card);
      card.setConfig({
        cameras: [{ entity: "camera.front", name: "Front" }],
        stream_height: 100,
        stream_height_unit: "dvh",
        mobile_view_page_enabled: true,
        display_footer: false,
      });
      card._pageId = pageId;
      card._renderShell();
      card._applyCardStyle();
      await new Promise((resolve) => requestAnimationFrame(resolve));
      card._applyCardStyle();
      await new Promise((resolve) => requestAnimationFrame(resolve));

      const root = card.shadowRoot;
      const browse = root.querySelector('[data-fvc-region="browse"]');
      const footer = root.querySelector('[data-fvc-region="footer"]');
      const measurement = {
        browseHeight: Math.round(browse.getBoundingClientRect().height),
        browseOverflowY: getComputedStyle(browse).overflowY,
        footerDisplay: getComputedStyle(footer).display,
        hostHeight: Math.round(card.getBoundingClientRect().height),
        pageScrollable:
          document.documentElement.scrollHeight > window.innerHeight,
      };
      view.remove();
      return measurement;
    };

    const measurements = [];
    for (const viewTagName of ["hui-sections-view", "hui-masonry-view"]) {
      for (const pageId of ["single-view", "mobile-view"]) {
        measurements.push(await measure(viewTagName, pageId));
      }
    }
    return measurements;
  });

  for (const view of result) {
    expect(view.footerDisplay).toBe("none");
    expect(view.browseHeight, JSON.stringify(view)).toBeGreaterThanOrEqual(244);
    expect(view.browseOverflowY).toBe("auto");
    expect(view.hostHeight).toBeGreaterThan(700);
    expect(view.pageScrollable).toBe(true);
  }
});

for (const displayFooter of [true, false]) {
  test(`Sections restore Single View sizing after Preview with footer ${displayFooter ? "shown" : "hidden"}`, async ({ page }) => {
    await page.setViewportSize({ width: 1200, height: 700 });
    await page.goto(baseUrl);

    const results = await page.evaluate(async (displayFooter) => {
      await import("/frigate-view-card.js");
      document.body.style.margin = "0";
      const measurements = [];
      for (const heightUnit of ["%", "dvh"]) {
        const view = document.createElement("hui-sections-view");
        view.style.cssText = "display:block;width:1000px";
        const wrapper = document.createElement("div");
        view.append(wrapper);
        document.body.append(view);
        const card = document.createElement("frigate-view-card");
        wrapper.append(card);
        card.setConfig({
          cameras: [{ entity: "camera.front", name: "Front" }],
          grid_options: { rows: "auto" },
          stream_height: 100,
          stream_height_unit: heightUnit,
          preview_page_enabled: true,
          display_footer: displayFooter,
        });
        await card._previewPageController.prepare();
        card._pageId = "single-view";
        card._renderShell();
        card._renderAll();
        await new Promise((resolve) => requestAnimationFrame(resolve));
        card._applyCardStyle();
        const root = card.shadowRoot;
        const live = root.querySelector("#eng-wrap");
        const engine = root.querySelector("#engine");
        const popup = root.querySelector("#myPopup");
        const measure = () => ({
          panel: card._cardStyleController.isPanelView(),
          browseRegionHeight: Math.round(
            root.querySelector('[data-fvc-region="browse"]').getBoundingClientRect().height +
            root.querySelector('[data-fvc-region="browse-header"]').getBoundingClientRect().height,
          ),
          hostHeight: Math.round(card.getBoundingClientRect().height),
          liveHeight: Math.round(live.getBoundingClientRect().height),
          pageScrollable: document.documentElement.scrollHeight > window.innerHeight,
          previewActive: root.querySelector("#card").classList.contains("preview-active"),
          livePreserved: root.querySelector("#eng-wrap") === live && root.querySelector("#engine") === engine,
          popupPreserved: root.querySelector("#myPopup") === popup,
        });
        const before = measure();
        const returns = [];
        // Exercise both navigation buttons and selecting the active Preview tile,
        // including repeated round trips without a resize or style repair call.
        for (const exitViaTile of [false, true, false]) {
          card._pageNavigationController.navigateToPageRoute("preview");
          await new Promise((resolve) => requestAnimationFrame(resolve));
          const previewActive = root.querySelector("#card").classList.contains("preview-active");
          if (exitViaTile) card._previewPageController.exitPreviewPageToCamera(0);
          else card._pageNavigationController.navigateToPageRoute("single-view");
          await new Promise((resolve) => requestAnimationFrame(resolve));
          returns.push({ ...measure(), enteredPreview: previewActive });
        }
        measurements.push({ heightUnit, before, returns });
        view.remove();
      }
      return measurements;
    }, displayFooter);

    for (const { heightUnit, before, returns } of results) {
      expect(before.panel).toBe(false);
      expect(before.browseRegionHeight, JSON.stringify(results)).toBeGreaterThanOrEqual(244);
      expect(before.pageScrollable, JSON.stringify(results)).toBe(true);
      for (const after of returns) {
        expect(after.enteredPreview).toBe(true);
        expect(after.previewActive).toBe(false);
        expect(after.browseRegionHeight, `${heightUnit}: ${JSON.stringify(after)}`).toBeGreaterThanOrEqual(244);
        expect(after.hostHeight).toBe(before.hostHeight);
        expect(after.liveHeight).toBe(before.liveHeight);
        expect(after.pageScrollable).toBe(true);
        expect(after.livePreserved).toBe(true);
        expect(after.popupPreserved).toBe(true);
      }
    }
  });
}

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
      await card._previewPageController.prepare();
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

test("Preview metadata centers linked lights without increasing tile metadata height", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1_200, height: 900 });
  await page.goto(baseUrl);

  const result = await page.evaluate(async () => {
    await import("/frigate-view-card.js");
    document.body.style.margin = "0";

    const wrapper = document.createElement("div");
    wrapper.style.width = "1000px";
    const card = document.createElement("frigate-view-card");
    wrapper.append(card);
    document.body.append(wrapper);
    card.setConfig({
      cameras: [
        {
          entity: "camera.front",
          name: "Doorbell",
          linked_entities: [{ entity: "light.porch", position: "left" }],
        },
        { entity: "camera.garage", name: "Garage" },
      ],
      preview_page_enabled: true,
      preview_page_show_title_bars: true,
    });
    card._pageId = "preview";
    card._hass = {
      states: {
        "camera.front": { state: "idle", attributes: {} },
        "camera.garage": { state: "idle", attributes: {} },
        "light.porch": {
          state: "on",
          attributes: { brightness: 180 },
        },
      },
    };
    card._frigateCameraRuntimeController.isAvailable = () => true;
    card._gridMediaController.mountCameraCellMedia = (host) => {
      host.textContent = "Camera";
    };

    await card._previewPageController.prepare();
    await card._linkedLightController._ensureDelegate();
    card._renderShell();
    card._previewPageController.renderPreviewPage();
    await new Promise((resolve) =>
      requestAnimationFrame(() => requestAnimationFrame(resolve)),
    );

    const cells = card.shadowRoot.querySelectorAll("[data-preview-camidx]");
    const linkedMeta = cells[0].querySelector(".preview-meta");
    const plainMeta = cells[1].querySelector(".preview-meta");
    const button = linkedMeta.querySelector("[data-linked-light-toggle]");
    const linkedRect = linkedMeta.getBoundingClientRect();
    const plainRect = plainMeta.getBoundingClientRect();
    const buttonRect = button.getBoundingClientRect();
    return {
      heightDelta: Math.abs(linkedRect.height - plainRect.height),
      centerDelta: Math.abs(
        buttonRect.left + buttonRect.width / 2 -
          (linkedRect.left + linkedRect.width / 2),
      ),
    };
  });

  expect(result.heightDelta).toBeLessThanOrEqual(1);
  expect(result.centerDelta).toBeLessThanOrEqual(1);
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
      mobile_view_page_enabled: true,
      preview_page_enabled: true,
      wide_view_page_enabled: true,
      card_view_page_enabled: true,
    });
    await card._cardViewPageController.prepareStyles();
    await card._wideViewPageController.prepare();
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
    const nativeReplaceWith = Element.prototype.replaceWith;
    let liveConnectedDuringTransfer = null;
    Element.prototype.replaceWith = function (...nodes) {
      nativeReplaceWith.apply(this, nodes);
      if (nodes.includes(outer.live)) {
        liveConnectedDuringTransfer = outer.live.isConnected;
      }
    };

    try {
      for (const [pageId, layoutClass] of [
        ["mobile-view", "layout--mobile-view"],
        ["preview", "layout--preview-view"],
        ["single-view", "layout--single-view"],
        ["wide-view", "layout--wide-view"],
        ["card-view", "layout--card-view"],
      ]) {
        liveConnectedDuringTransfer = null;
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
          liveConnectedDuringTransfer,
          enginePreserved: root.querySelector("#engine") === outer.engine,
          layoutCount: root.querySelectorAll("#layout").length,
          footerCount: nextLayout.querySelectorAll(
            '[data-fvc-region="footer"]',
          ).length,
        });
        previousLayout = nextLayout;
      }
    } finally {
      Element.prototype.replaceWith = nativeReplaceWith;
    }

    return routeResults;
  });

  expect(result).toEqual([
    {
      pageId: "mobile-view",
      layoutChanged: true,
      hasExpectedLayout: true,
      stylePreserved: true,
      cardPreserved: true,
      toastPreserved: true,
      popupPreserved: true,
      popupBindingPreserved: true,
      livePreserved: true,
      liveConnectedDuringTransfer: true,
      enginePreserved: true,
      layoutCount: 1,
      footerCount: 1,
    },
    {
      pageId: "preview",
      layoutChanged: true,
      hasExpectedLayout: true,
      stylePreserved: true,
      cardPreserved: true,
      toastPreserved: true,
      popupPreserved: true,
      popupBindingPreserved: true,
      livePreserved: true,
      liveConnectedDuringTransfer: true,
      enginePreserved: true,
      layoutCount: 1,
      footerCount: 1,
    },
    {
      pageId: "single-view",
      layoutChanged: true,
      hasExpectedLayout: true,
      stylePreserved: true,
      cardPreserved: true,
      toastPreserved: true,
      popupPreserved: true,
      popupBindingPreserved: true,
      livePreserved: true,
      liveConnectedDuringTransfer: true,
      enginePreserved: true,
      layoutCount: 1,
      footerCount: 1,
    },
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
      liveConnectedDuringTransfer: true,
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
      liveConnectedDuringTransfer: true,
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

test("Card View back renders Preview when enabled and Single View otherwise", async ({
  page,
}) => {
  await page.goto(baseUrl);
  const results = await page.evaluate(async () => {
    await import("/frigate-view-card.js");
    const states = [];

    for (const previewPageEnabled of [true, false]) {
      const card = document.createElement("frigate-view-card");
      document.body.append(card);
      card.setConfig({
        cameras: [{ entity: "camera.front", name: "Front" }],
        mobile_view_page_enabled: false,
        preview_page_enabled: previewPageEnabled,
        card_view_page_enabled: true,
        card_view_view_mode: "video-only",
      });
      card._pageId = "card-view";
      await card._cardViewPageController.prepare();
      card._renderShell();
      card._syncCardViewPageMarkup();

      card.shadowRoot.querySelector("[data-card-view-video-back]").click();
      if (previewPageEnabled) {
        await card._previewPageController.prepare();
      }
      await new Promise((resolve) => requestAnimationFrame(resolve));

      const layout = card.shadowRoot.querySelector("#layout");
      states.push({
        previewPageEnabled,
        pageId: card._pageId,
        layoutClass: [...(layout?.classList || [])].find((className) =>
          className.startsWith("layout--"),
        ),
        hasLayoutContent: Boolean(layout?.childElementCount),
        cardViewActive: card.shadowRoot
          .querySelector("#card")
          ?.classList.contains("card-view-active"),
      });
      card.remove();
    }

    return states;
  });

  expect(results).toEqual([
    {
      previewPageEnabled: true,
      pageId: "preview",
      layoutClass: "layout--preview-view",
      hasLayoutContent: true,
      cardViewActive: false,
    },
    {
      previewPageEnabled: false,
      pageId: "single-view",
      layoutClass: "layout--single-view",
      hasLayoutContent: true,
      cardViewActive: false,
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

    await card._wideViewPageController.prepare();
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

test("Wide View honors hidden and compact footer display settings", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1200, height: 900 });
  await page.goto(baseUrl);

  const result = await page.evaluate(async () => {
    await import("/frigate-view-card.js");
    document.body.style.margin = "0";

    const sample = async ({ displayFooter = true, displayLogo = true }) => {
      const card = document.createElement("frigate-view-card");
      card.style.cssText = "display:block;width:1000px;height:800px";
      document.body.append(card);
      card.setConfig({
        cameras: [{ entity: "camera.front", name: "Front" }],
        wide_view_page_enabled: true,
        display_footer: displayFooter,
        display_logo: displayLogo,
        display_version: true,
      });
      await card._wideViewPageController.prepare();
      card._pageId = "wide-view";
      card._renderShell();
      card._applyCardStyle();
      await new Promise((resolve) => requestAnimationFrame(resolve));

      const footer = card.shadowRoot.querySelector(
        '[data-fvc-region="footer"]',
      );
      const state = {
        compact: footer.classList.contains("footer--logo-hidden"),
        display: getComputedStyle(footer).display,
        hasLogo: Boolean(footer.querySelector(".fvc-brand-logo svg")),
        height: footer.getBoundingClientRect().height,
        versionVisible: !footer.querySelector(".footer-version").hidden,
      };
      card.remove();
      return state;
    };

    return {
      visible: await sample({}),
      compact: await sample({ displayLogo: false }),
      hidden: await sample({ displayFooter: false }),
    };
  });

  expect(result.visible.display).toBe("grid");
  expect(result.visible.hasLogo).toBe(true);
  expect(result.visible.compact).toBe(false);
  expect(result.compact.display).toBe("grid");
  expect(result.compact.hasLogo).toBe(false);
  expect(result.compact.compact).toBe(true);
  expect(result.compact.versionVisible).toBe(true);
  expect(result.compact.height).toBeLessThan(result.visible.height);
  expect(result.hidden.display).toBe("none");
  expect(result.hidden.height).toBe(0);
});

test("Panel Wide View height lock converts a 4:3 resize drag into zoom", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1400, height: 800 });
  await page.goto(baseUrl);

  const before = await page.evaluate(async () => {
    await import("/frigate-view-card.js");
    document.body.style.margin = "0";
    const panel = document.createElement("hui-panel-view");
    panel.style.cssText = "display:block;width:1300px";
    document.body.append(panel);
    const card = document.createElement("frigate-view-card");
    panel.append(card);
    card.setConfig({
      cameras: [{ entity: "camera.front", name: "Front" }],
      wide_view_page_enabled: true,
      stream_height: 100,
      stream_height_unit: "dvh",
    });
    await card._wideViewPageController.prepare();
    card._pageId = "wide-view";
    card._renderShell();
    card._viewMode = "single";
    card._activeStreamType = "mse";
    card.shadowRoot.querySelector("#stream-fallback").hidden = true;
    card._resizeZoomScales = [];
    card._liveVideoZoomController = {
      zoomToCenter: (scale) => card._resizeZoomScales.push(scale),
    };
    card._liveViewResizeController._getAvailableGrowth = () => 0;
    const media = new EventTarget();
    media.videoWidth = 640;
    media.videoHeight = 480;
    card._liveViewResizeController.attachMedia(media);
    await new Promise((resolve) => requestAnimationFrame(resolve));

    const wrap = card.shadowRoot.querySelector("#eng-wrap");
    const grip = card.shadowRoot.querySelector("#live-resize-grip");
    return {
      aspectRatio: wrap.style.getPropertyValue("--live-view-aspect-ratio"),
      gripVisible: !grip.hidden,
      height: wrap.getBoundingClientRect().height,
    };
  });

  expect(before.gripVisible).toBe(true);
  const grip = page.locator("frigate-view-card #live-resize-grip");
  const bounds = await grip.boundingBox();
  expect(bounds).toBeTruthy();
  const x = bounds.x + bounds.width / 2;
  const y = bounds.y + bounds.height / 2;
  await page.mouse.move(x, y);
  await page.mouse.down();
  await page.mouse.move(x, y + 400, { steps: 8 });
  await page.mouse.up();

  const after = await page.evaluate(() => {
    const card = document.querySelector("frigate-view-card");
    const wrap = card.shadowRoot.querySelector("#eng-wrap");
    const grip = card.shadowRoot.querySelector("#live-resize-grip");
    return {
      aspectRatio: wrap.style.getPropertyValue("--live-view-aspect-ratio"),
      currentValue: grip.getAttribute("aria-valuenow"),
      height: wrap.getBoundingClientRect().height,
      zoomScale: card._resizeZoomScales.at(-1),
    };
  });

  expect(after.height).toBeCloseTo(before.height, 1);
  expect(after.aspectRatio).toBe(before.aspectRatio);
  expect(after.currentValue).toBe("56");
  expect(after.zoomScale).toBeCloseTo(4 / 3, 3);
});

test("Panel Wide View recomputes its columns when the viewport becomes shorter", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1900, height: 1080 });
  await page.goto(baseUrl);

  const before = await page.evaluate(async () => {
    await import("/frigate-view-card.js");
    document.body.style.margin = "0";
    const panel = document.createElement("hui-panel-view");
    panel.style.cssText = "display:block;width:1800px;margin-top:34px";
    document.body.append(panel);
    const card = document.createElement("frigate-view-card");
    card.style.width = "1800px";
    panel.append(card);
    card.setConfig({
      cameras: Array.from({ length: 12 }, (_, index) => ({
        entity: `camera.camera_${index + 1}`,
        name: `Camera ${index + 1}`,
      })),
      wide_view_page_enabled: true,
      wide_view_width: 75,
      stream_height: 100,
      stream_height_unit: "dvh",
      tight_margins: true,
    });
    await card._wideViewPageController.prepare();
    card._pageId = "wide-view";
    card._renderShell();
    card._wideViewPageController.startWideViewMode();
    await card._wideViewCompanionController._ensureDelegate();
    card._applyCardStyle();
    await new Promise((resolve) => requestAnimationFrame(resolve));
    await new Promise((resolve) => requestAnimationFrame(resolve));
    card._wideViewPageController.applyLayoutModeForCard();
    card._wideViewPageController.syncColHeight();
    await new Promise((resolve) => requestAnimationFrame(resolve));

    const root = card.shadowRoot;
    return {
      cardWidth: card.getBoundingClientRect().width,
      configuredWideWidth: card._config.wide_view_width,
      leftWidth: root
        .querySelector(".col-left--wide-view")
        .getBoundingClientRect().width,
      cardHeight: card.getBoundingClientRect().height,
      liveWidth: root.querySelector("#eng-wrap").getBoundingClientRect().width,
      liveHeight: root.querySelector("#eng-wrap").getBoundingClientRect().height,
    };
  });

  await page.setViewportSize({ width: 1900, height: 860 });
  await page.waitForTimeout(50);

  const after = await page.evaluate(() => {
    const card = document.querySelector("frigate-view-card");
    const root = card.shadowRoot;
    const cardRect = card.getBoundingClientRect();
    const columnsRect = root
      .querySelector(".wide-view-columns")
      .getBoundingClientRect();
    const liveStageRect = root
      .querySelector("#live-stage")
      .getBoundingClientRect();
    const liveRect = root.querySelector("#eng-wrap").getBoundingClientRect();
    const companionHeaderRect = root
      .querySelector(".wide-companion-header")
      .getBoundingClientRect();
    const footerRect = root
      .querySelector('[data-fvc-region="footer"]')
      .getBoundingClientRect();
    return {
      cardBottom: cardRect.bottom,
      cardHeight: cardRect.height,
      columnsBottom: columnsRect.bottom,
      companionHeaderBottom: companionHeaderRect.bottom,
      footerBottom: footerRect.bottom,
      footerTop: footerRect.top,
      leftWidth: root
        .querySelector(".col-left--wide-view")
        .getBoundingClientRect().width,
      liveWidth: liveRect.width,
      liveHeight: liveRect.height,
      liveStageHeight: liveStageRect.height,
      viewportHeight: window.innerHeight,
    };
  });

  expect(after.cardHeight).toBeLessThan(before.cardHeight - 150);
  expect(
    after.leftWidth,
    JSON.stringify({ before, after }),
  ).toBeLessThan(before.leftWidth - 100);
  expect(after.liveWidth).toBeLessThan(before.liveWidth - 100);
  expect(after.liveWidth / after.liveHeight).toBeCloseTo(16 / 9, 2);
  expect(after.companionHeaderBottom).toBeLessThanOrEqual(
    after.columnsBottom + 1,
  );
  expect(after.columnsBottom).toBeCloseTo(after.footerTop, 0);
  expect(Math.abs(after.footerBottom - after.cardBottom)).toBeLessThanOrEqual(
    1.1,
  );
  expect(after.cardBottom).toBeLessThanOrEqual(after.viewportHeight + 1);
});

test("Wide View Sections resolves In-Between halfway from Half to Max", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1200, height: 900 });
  await page.goto(baseUrl);

  const widths = await page.evaluate(async () => {
    await import("/frigate-view-card.js");
    document.body.style.margin = "0";
    const sections = document.createElement("hui-sections-view");
    sections.style.width = "1000px";
    document.body.append(sections);
    const card = document.createElement("frigate-view-card");
    card.style.width = "1000px";
    sections.append(card);
    card.setConfig({
      cameras: Array.from({ length: 4 }, (_, index) => ({
        entity: `camera.camera_${index + 1}`,
        name: `Camera ${index + 1}`,
      })),
      wide_view_page_enabled: true,
      wide_view_width: 50,
      stream_height: 420,
      stream_height_unit: "px",
    });
    await card._wideViewPageController.prepare();
    card._pageId = "wide-view";
    card._renderShell();
    card._wideViewPageController.startWideViewMode();
    await card._wideViewCompanionController._ensureDelegate();
    card._applyCardStyle();
    card.style.setProperty("--card-host-height", "650px");

    const measure = async (preset) => {
      card._config.wide_view_width = preset;
      card._wideViewPageController.applyLayoutModeForCard();
      await new Promise((resolve) => requestAnimationFrame(resolve));
      const root = card.shadowRoot;
      return {
        left: root
          .querySelector(".col-left--wide-view")
          .getBoundingClientRect().width,
        right: root
          .querySelector(".col-right--wide-view")
          .getBoundingClientRect().width,
      };
    };

    const initial = {
      half: await measure(50),
      inBetween: await measure(75),
      max: await measure(100),
    };
    card._config.wide_view_width = 75;
    sections.style.width = "800px";
    card.style.width = "800px";
    card._wideViewPageController.reflowColumnsForResize();
    await new Promise((resolve) => requestAnimationFrame(resolve));
    const resizedInBetween = {
      left: card.shadowRoot
        .querySelector(".col-left--wide-view")
        .getBoundingClientRect().width,
      right: card.shadowRoot
        .querySelector(".col-right--wide-view")
        .getBoundingClientRect().width,
    };
    const resizedHalf = await measure(50);
    const resizedMax = await measure(100);
    return { initial, resizedInBetween, resizedHalf, resizedMax };
  });

  expect(
    Math.abs(widths.initial.half.left - widths.initial.half.right),
  ).toBeLessThanOrEqual(1);
  expect(
    Math.abs(
      widths.initial.inBetween.left -
        (widths.initial.half.left + widths.initial.max.left) / 2,
    ),
  ).toBeLessThanOrEqual(1);
  expect(widths.initial.inBetween.right).toBeGreaterThan(
    widths.initial.max.right + 100,
  );
  expect(widths.initial.max.right).toBeGreaterThanOrEqual(249);
  expect(widths.initial.max.right).toBeLessThanOrEqual(251);
  expect(
    Math.abs(
      widths.resizedInBetween.left -
        (widths.resizedHalf.left + widths.resizedMax.left) / 2,
    ),
  ).toBeLessThanOrEqual(1);
});

test("Wide View Custom width remains an exact percentage after reflow", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1400, height: 900 });
  await page.goto(baseUrl);

  const widths = await page.evaluate(async () => {
    await import("/frigate-view-card.js");
    document.body.style.margin = "0";
    const sections = document.createElement("hui-sections-view");
    sections.style.width = "1100px";
    document.body.append(sections);
    const card = document.createElement("frigate-view-card");
    card.style.width = "1100px";
    sections.append(card);
    card.setConfig({
      cameras: Array.from({ length: 4 }, (_, index) => ({
        entity: `camera.camera_${index + 1}`,
        name: `Camera ${index + 1}`,
      })),
      wide_view_page_enabled: true,
      wide_view_width: 100,
      col_left_width_pct: 63,
      stream_height: 600,
      stream_height_unit: "px",
    });
    await card._wideViewPageController.prepare();
    card._pageId = "wide-view";
    card._renderShell();
    card._wideViewPageController.startWideViewMode();
    await card._wideViewCompanionController._ensureDelegate();
    card._applyCardStyle();

    const measure = async () => {
      card._wideViewPageController.applyLayoutModeForCard();
      await new Promise((resolve) => requestAnimationFrame(resolve));
      const left = card.shadowRoot.querySelector(".col-left--wide-view");
      const right = card.shadowRoot.querySelector(".col-right--wide-view");
      const leftRect = left.getBoundingClientRect();
      const rightRect = right.getBoundingClientRect();
      return {
        leftStyle: left.style.width,
        rightStyle: right.style.width,
        measuredPct: (leftRect.width / (leftRect.width + rightRect.width)) * 100,
      };
    };

    const initial = await measure();
    sections.style.width = "900px";
    card.style.width = "900px";
    card._wideViewPageController.reflowColumnsForResize();
    const resized = await measure();
    return { initial, resized };
  });

  for (const state of [widths.initial, widths.resized]) {
    expect(state.leftStyle).toBe("63%");
    expect(state.rightStyle).toBe("37%");
    expect(state.measuredPct).toBeCloseTo(63, 0);
  }
});

test("Panel and Sidebar In-Between preserve one complete responsive companion row", async ({
  page,
}) => {
  await page.setViewportSize({ width: 2000, height: 1100 });
  await page.goto(baseUrl);

  const results = await page.evaluate(async () => {
    await import("/frigate-view-card.js");
    document.body.style.margin = "0";

    const measure = async ({ tagName, width, height }) => {
      const view = document.createElement(tagName);
      view.style.cssText = `display:block;width:${width}px;height:${height}px`;
      document.body.append(view);
      const card = document.createElement("frigate-view-card");
      view.append(card);
      card.setConfig({
        cameras: Array.from({ length: 7 }, (_, index) => ({
          entity: `camera.camera_${index + 1}`,
          name: `Camera ${index + 1}`,
        })),
        wide_view_page_enabled: true,
        wide_view_width: 75,
        stream_height: height,
        stream_height_unit: "px",
        tight_margins: true,
      });
      await card._wideViewPageController.prepare();
      card._pageId = "wide-view";
      card._renderShell();
      card._wideViewPageController.startWideViewMode();
      await card._wideViewCompanionController._ensureDelegate();
      card._wideViewPageController.renderCompanionCameras();
      card._applyCardStyle();
      card.style.setProperty("--card-host-height", `${height}px`);
      card.shadowRoot
        .querySelector(".card")
        .style.setProperty("--view-height", `${height}px`);
      await new Promise((resolve) => requestAnimationFrame(resolve));
      card._wideViewPageController.applyLayoutModeForCard();
      await new Promise((resolve) => requestAnimationFrame(resolve));
      card._wideViewCompanionController.updateLayout();
      await new Promise((resolve) => requestAnimationFrame(resolve));

      const root = card.shadowRoot;
      const columns = root.querySelector(".wide-view-columns");
      const left = root.querySelector(".col-left--wide-view");
      const right = root.querySelector(".col-right--wide-view");
      const panel = root.querySelector("#wide-companion-panel");
      const cells = Array.from(
        root.querySelectorAll(".wide-companion-cell"),
      );
      const firstCell = cells[0];
      const firstTop = firstCell.getBoundingClientRect().top;
      const firstRow = cells.filter(
        (cell) =>
          Math.abs(cell.getBoundingClientRect().top - firstTop) <= 1,
      );
      const firstMeta = firstCell.querySelector(".wide-companion-meta");
      const measurement = {
        leftPct:
          (left.getBoundingClientRect().width /
            (columns.getBoundingClientRect().width -
              root
                .querySelector("#resize-handle")
                .getBoundingClientRect().width)) *
          100,
        rightWidth: right.getBoundingClientRect().width,
        firstRowCount: firstRow.length,
        firstCellWidth: firstCell.getBoundingClientRect().width,
        firstMetaBottom: firstMeta.getBoundingClientRect().bottom,
        panelBottom: panel.getBoundingClientRect().bottom,
      };
      view.remove();
      return measurement;
    };

    return {
      panelNarrow: await measure({
        tagName: "hui-panel-view",
        width: 1000,
        height: 760,
      }),
      panelWide: await measure({
        tagName: "hui-panel-view",
        width: 1800,
        height: 960,
      }),
      sidebarNarrow: await measure({
        tagName: "hui-sidebar-view",
        width: 1000,
        height: 760,
      }),
      sidebarWide: await measure({
        tagName: "hui-sidebar-view",
        width: 1800,
        height: 960,
      }),
    };
  });

  for (const result of Object.values(results)) {
    expect(result.rightWidth, JSON.stringify(results)).toBeGreaterThanOrEqual(
      249,
    );
    expect(
      result.firstMetaBottom,
      JSON.stringify(results),
    ).toBeLessThanOrEqual(result.panelBottom + 1);
  }
  expect(results.panelNarrow.firstRowCount, JSON.stringify(results)).toBe(3);
  expect(results.sidebarNarrow.firstRowCount, JSON.stringify(results)).toBe(3);
  expect(results.panelWide.firstRowCount, JSON.stringify(results)).toBe(4);
  expect(results.sidebarWide.firstRowCount, JSON.stringify(results)).toBe(4);
  expect(
    Math.abs(results.panelNarrow.leftPct - results.sidebarNarrow.leftPct),
  ).toBeLessThanOrEqual(0.2);
  expect(
    Math.abs(results.panelWide.leftPct - results.sidebarWide.leftPct),
  ).toBeLessThanOrEqual(0.2);
});

test("Sidebar Wide View reapplies Max with the same responsive rules as Panel", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1900, height: 1000 });
  await page.goto(baseUrl);

  const results = await page.evaluate(async () => {
    await import("/frigate-view-card.js");
    document.body.style.margin = "0";

    const measure = async (tagName) => {
      const view = document.createElement(tagName);
      view.style.cssText = "display:block;width:1200px";
      document.body.append(view);
      const card = document.createElement("frigate-view-card");
      view.append(card);
      card.setConfig({
        cameras: Array.from({ length: 7 }, (_, index) => ({
          entity: `camera.camera_${index + 1}`,
          name: `Camera ${index + 1}`,
        })),
        wide_view_page_enabled: true,
        wide_view_width: 100,
        stream_height: 80,
        stream_height_unit: "dvh",
        tight_margins: true,
      });
      await card._wideViewPageController.prepare();
      card._pageId = "wide-view";
      card._renderShell();
      card._wideViewPageController.startWideViewMode();
      await card._wideViewCompanionController._ensureDelegate();
      card._wideViewPageController.renderCompanionCameras();
      card._setupResizeObserver();

      const sample = () => {
        const root = card.shadowRoot;
        const columns = root
          .querySelector(".wide-view-columns")
          .getBoundingClientRect();
        const handleWidth = root
          .querySelector("#resize-handle")
          .getBoundingClientRect().width;
        const leftWidth = root
          .querySelector(".col-left--wide-view")
          .getBoundingClientRect().width;
        const rightWidth = root
          .querySelector(".col-right--wide-view")
          .getBoundingClientRect().width;
        return {
          leftPct: (leftWidth / (columns.width - handleWidth)) * 100,
          rightWidth,
        };
      };

      await new Promise((resolve) => setTimeout(resolve, 150));
      const initial = sample();
      view.style.width = "1600px";
      await new Promise((resolve) => setTimeout(resolve, 150));
      const resized = sample();
      card._ro?.disconnect();
      view.remove();
      return { initial, resized };
    };

    return {
      panel: await measure("hui-panel-view"),
      sidebar: await measure("hui-sidebar-view"),
    };
  });

  for (const size of ["initial", "resized"]) {
    expect(
      Math.abs(
        results.panel[size].leftPct - results.sidebar[size].leftPct,
      ),
      JSON.stringify(results),
    ).toBeLessThanOrEqual(0.2);
    expect(
      Math.abs(
        results.panel[size].rightWidth - results.sidebar[size].rightWidth,
      ),
      JSON.stringify(results),
    ).toBeLessThanOrEqual(1);
    expect(results.sidebar[size].rightWidth).toBeGreaterThanOrEqual(249);
  }
  expect(results.sidebar.initial.leftPct).toBeGreaterThan(60);
  expect(results.sidebar.resized.leftPct).toBeGreaterThan(60);
});

test("Sidebar Wide View reapplies configured widths after cold-start layout settles", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1600, height: 900 });
  await page.goto(baseUrl);

  const widths = await page.evaluate(async () => {
    await import("/frigate-view-card.js");
    document.body.style.margin = "0";

    const measure = async (wideViewWidth) => {
      const sidebar = document.createElement("hui-sidebar-view");
      sidebar.style.cssText = "display:block;width:500px;height:800px";
      document.body.append(sidebar);
      const card = document.createElement("frigate-view-card");
      sidebar.append(card);
      card.setConfig({
        cameras: Array.from({ length: 2 }, (_, index) => ({
          entity: `camera.camera_${index + 1}`,
          name: `Camera ${index + 1}`,
        })),
        landing_page: "wide-view",
        wide_view_page_enabled: true,
        wide_view_width: wideViewWidth,
        stream_height: 800,
        stream_height_unit: "px",
        tight_margins: true,
      });
      card._discoverAll = async () => {};
      card._browseWindowLoaderController.loadWindow = async () => {};
      card._browseWindowLoaderController.scheduleWarmOtherCamerasEvents =
        () => {};
      card._browseWindowLoaderController.warmVisibleCameraReviews =
        async () => {};
      card._mountEngine = () => {
        sidebar.style.width = "1200px";
      };
      card._renderAll = () => {};
      card._subscribe = () => {};
      card._startEditModeWatchdog = () => {};
      card._startEditorDialogCloseObserver = () => {};
      card._restartRealtimeHeadPollTimer = () => {};
      card._setupResizeObserver = () => {};

      await card._start();
      await card._wideViewCompanionController._ensureDelegate();
      await new Promise((resolve) => requestAnimationFrame(resolve));
      await new Promise((resolve) => requestAnimationFrame(resolve));
      await new Promise((resolve) => requestAnimationFrame(resolve));

      const root = card.shadowRoot;
      const columnsWidth = root
        .querySelector(".wide-view-columns")
        .getBoundingClientRect().width;
      const handleWidth = root
        .querySelector("#resize-handle")
        .getBoundingClientRect().width;
      const leftWidth = root
        .querySelector(".col-left--wide-view")
        .getBoundingClientRect().width;
      const rightWidth = root
        .querySelector(".col-right--wide-view")
        .getBoundingClientRect().width;
      clearInterval(card._refresh);
      card._refresh = null;
      card.remove();
      sidebar.remove();
      return {
        leftPct: (leftWidth / (columnsWidth - handleWidth)) * 100,
        rightWidth,
      };
    };

    return {
      inBetween: await measure(75),
      max: await measure(100),
    };
  });

  expect(widths.inBetween.leftPct, JSON.stringify(widths)).toBeGreaterThan(55);
  expect(widths.max.leftPct, JSON.stringify(widths)).toBeGreaterThan(70);
  expect(widths.max.rightWidth, JSON.stringify(widths)).toBeGreaterThanOrEqual(
    249,
  );
});

test("Wide View companion tiles stay large when two columns nearly fit", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1300, height: 1200 });
  await page.goto(baseUrl);

  const result = await page.evaluate(async () => {
    await import("/frigate-view-card.js");
    document.body.style.margin = "0";
    const card = document.createElement("frigate-view-card");
    card.style.width = "1000px";
    document.body.append(card);
    card.setConfig({
      cameras: Array.from({ length: 7 }, (_, index) => ({
        entity: `camera.camera_${index + 1}`,
        name: `Camera ${index + 1}`,
      })),
      wide_view_page_enabled: true,
      wide_view_width: 75,
      stream_height: 100,
      stream_height_unit: "dvh",
    });
    await card._wideViewPageController.prepare();
    card._pageId = "wide-view";
    card._renderShell();
    card._wideViewPageController.startWideViewMode();
    await card._wideViewCompanionController._ensureDelegate();
    card._applyCardStyle();
    await new Promise((resolve) => requestAnimationFrame(resolve));
    await new Promise((resolve) => requestAnimationFrame(resolve));

    const root = card.shadowRoot;
    const grid = root.querySelector("#wide-companion-grid");
    const cells = Array.from(
      root.querySelectorAll(".wide-companion-cell"),
    );
    const firstCell = cells[0];
    const firstTop = firstCell.getBoundingClientRect().top;
    const statusRect = firstCell
      .querySelector(".wide-companion-meta-status")
      .getBoundingClientRect();
    const nameRect = firstCell
      .querySelector(".wide-companion-meta-name")
      .getBoundingClientRect();
    return {
      gridWidth: grid.getBoundingClientRect().width,
      gridHeight: grid.getBoundingClientRect().height,
      firstRowCellCount: cells.filter(
        (cell) =>
          Math.abs(cell.getBoundingClientRect().top - firstTop) <= 1,
      ).length,
      cellWidth: firstCell.getBoundingClientRect().width,
      statusBeforeName: statusRect.right <= nameRect.left,
    };
  });

  expect(result.gridWidth, JSON.stringify(result)).toBeGreaterThan(470);
  expect(result.gridHeight, JSON.stringify(result)).toBeGreaterThan(630);
  expect(result.firstRowCellCount, JSON.stringify(result)).toBe(2);
  expect(result.cellWidth, JSON.stringify(result)).toBeGreaterThan(225);
  expect(result.statusBeforeName, JSON.stringify(result)).toBe(true);
});

for (const scenario of [
  { columns: 2, cameras: 5, width: 1000, height: 1000 },
  { columns: 3, cameras: 7, width: 1500, height: 1100 },
]) {
  test(`Wide View scrolls overflowing companion cameras in ${scenario.columns} columns`, async ({ page }) => {
    await page.setViewportSize({ width: scenario.width + 100, height: scenario.height });
    await page.goto(baseUrl);
    await page.evaluate(async ({ cameras, width }) => {
      await import("/frigate-view-card.js");
      document.body.style.margin = "0";
      const card = document.createElement("frigate-view-card");
      card.style.width = `${width}px`;
      document.body.append(card);
      card.setConfig({
        cameras: Array.from({ length: cameras }, (_, index) => ({
          entity: `camera.camera_${index + 1}`,
          name: `Camera ${index + 1}`,
        })),
        wide_view_page_enabled: true,
        wide_view_width: 75,
        stream_height: 100,
        stream_height_unit: "dvh",
      });
      await card._wideViewPageController.prepare();
      card._pageId = "wide-view";
      card._renderShell();
      card._wideViewPageController.startWideViewMode();
      await card._wideViewCompanionController._ensureDelegate();
      card._applyCardStyle();
      await new Promise((resolve) => requestAnimationFrame(resolve));
      await new Promise((resolve) => requestAnimationFrame(resolve));
      const root = card.shadowRoot;
      window.companionScrollProbe = {
        root,
        media: [...root.querySelectorAll(".wide-companion-media-host")],
        live: root.querySelector("#live-stage"),
      };
    }, scenario);

    const grid = page.locator("#wide-companion-grid");
    const measure = () => page.evaluate(() => {
      const { root, media, live } = window.companionScrollProbe;
      const grid = root.querySelector("#wide-companion-grid");
      const rect = grid.getBoundingClientRect();
      const lastMeta = grid.querySelector(".wide-companion-cell:last-child .wide-companion-meta");
      return {
        columns: getComputedStyle(grid).gridTemplateColumns.split(" ").length,
        overflow: getComputedStyle(grid).overflowY,
        scrollTop: grid.scrollTop,
        remaining: grid.scrollHeight - grid.clientHeight - grid.scrollTop,
        height: grid.clientHeight,
        headerTop: root.querySelector(".wide-companion-header").getBoundingClientRect().top,
        liveHeight: live.getBoundingClientRect().height,
        lastVisible: lastMeta.getBoundingClientRect().bottom <= rect.bottom + 1,
        mediaPreserved: media.every((node, index) => node === root.querySelectorAll(".wide-companion-media-host")[index]),
        livePreserved: live === root.querySelector("#live-stage"),
        pageScroll: window.scrollY,
      };
    });
    const before = await measure();
    expect(before.columns).toBe(scenario.columns);
    expect(before.remaining).toBeGreaterThan(20);
    expect(before.overflow).toBe("auto");
    const bounds = await grid.boundingBox();
    await page.mouse.move(bounds.x + bounds.width / 2, bounds.y + Math.min(50, bounds.height / 2));
    await page.mouse.wheel(0, 300);
    await expect.poll(async () => (await measure()).scrollTop).toBeGreaterThan(0);
    await grid.evaluate((element) => { element.scrollTop = element.scrollHeight; });
    await expect.poll(async () => (await measure()).lastVisible).toBe(true);
    const after = await measure();
    expect(after.headerTop).toBeCloseTo(before.headerTop, 0);
    expect(after.liveHeight).toBeCloseTo(before.liveHeight, 0);
    expect(after.pageScroll).toBe(before.pageScroll);
    expect(after.mediaPreserved).toBe(true);
    expect(after.livePreserved).toBe(true);

    await page.locator("[data-wide-companion-expand-button]").click();
    await expect.poll(async () => (await measure()).height).toBeGreaterThan(before.height);
    await page.locator("[data-wide-companion-expand-button]").click();
    await expect.poll(async () => (await measure()).height).toBe(before.height);
    const collapsed = await measure();
    expect(collapsed.mediaPreserved).toBe(true);
    expect(collapsed.livePreserved).toBe(true);
  });
}

test("Wide View divider expands past 75% until companions reach their header", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1200, height: 900 });
  await page.goto(baseUrl);

  const before = await page.evaluate(async () => {
    await import("/frigate-view-card.js");
    document.body.style.margin = "0";
    const card = document.createElement("frigate-view-card");
    card.style.width = "1000px";
    document.body.append(card);
    card.setConfig({
      cameras: Array.from({ length: 4 }, (_, index) => ({
        entity: `camera.camera_${index + 1}`,
        name: `Camera ${index + 1}`,
      })),
      wide_view_page_enabled: true,
      stream_height: 420,
      stream_height_unit: "px",
    });
    await card._wideViewPageController.prepare();
    card._pageId = "wide-view";
    card._renderShell();
    card._wideViewPageController.startWideViewMode();
    await card._wideViewCompanionController._ensureDelegate();
    card._applyCardStyle();
    card.style.setProperty("--card-host-height", "650px");
    await new Promise((resolve) => requestAnimationFrame(resolve));

    const root = card.shadowRoot;
    const columns = root.querySelector(".wide-view-columns");
    const left = root.querySelector(".col-left--wide-view");
    const right = root.querySelector(".col-right--wide-view");
    const panel = root.querySelector("#wide-companion-panel");
    const header = root.querySelector(".wide-companion-header");
    const grid = root.querySelector("#wide-companion-grid");
    const panelRect = panel.getBoundingClientRect();
    const gridRect = grid.getBoundingClientRect();
    return {
      leftPct:
        (left.getBoundingClientRect().width /
          columns.getBoundingClientRect().width) *
        100,
      rightWidth: right.getBoundingClientRect().width,
      companionSpace:
        panel.getBoundingClientRect().height -
        header.getBoundingClientRect().height,
      visibleCompanionHeight: Math.max(
        0,
        Math.min(panelRect.bottom, gridRect.bottom) -
          Math.max(panelRect.top, gridRect.top),
      ),
    };
  });

  expect(before.visibleCompanionHeight).toBeGreaterThan(10);
  expect(before.rightWidth).toBeGreaterThanOrEqual(249);

  const divider = page.locator("frigate-view-card #resize-handle");
  const bounds = await divider.boundingBox();
  expect(bounds).toBeTruthy();
  const x = bounds.x + bounds.width / 2;
  const y = bounds.y + bounds.height / 2;
  await page.mouse.move(x, y);
  await page.mouse.down();
  await page.mouse.move(1190, y, { steps: 10 });
  await page.mouse.up();

  const after = await page.evaluate(() => {
    const card = document.querySelector("frigate-view-card");
    const root = card.shadowRoot;
    const columns = root.querySelector(".wide-view-columns");
    const left = root.querySelector(".col-left--wide-view");
    const right = root.querySelector(".col-right--wide-view");
    const panel = root.querySelector("#wide-companion-panel");
    const header = root.querySelector(".wide-companion-header");
    const grid = root.querySelector("#wide-companion-grid");
    const panelRect = panel.getBoundingClientRect();
    const gridRect = grid.getBoundingClientRect();
    return {
      leftPct:
        (left.getBoundingClientRect().width /
          columns.getBoundingClientRect().width) *
        100,
      rightWidth: right.getBoundingClientRect().width,
      companionSpace:
        panel.getBoundingClientRect().height -
        header.getBoundingClientRect().height,
      visibleCompanionHeight: Math.max(
        0,
        Math.min(panelRect.bottom, gridRect.bottom) -
          Math.max(panelRect.top, gridRect.top),
      ),
    };
  });

  expect(after.leftPct, JSON.stringify({ before, after })).toBeGreaterThan(75);
  expect(
    after.visibleCompanionHeight,
    JSON.stringify({ before, after }),
  ).toBeLessThanOrEqual(1);
  expect(after.rightWidth).toBeLessThan(249);
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
      cameras: Array.from({ length: 12 }, (_, index) => ({
        entity: `camera.camera_${index + 1}`,
        name: `Camera ${index + 1}`,
      })),
      wide_view_page_enabled: true,
      stream_height: 640,
      stream_height_unit: "px",
    });
    await card._wideViewPageController.prepare();
    card._pageId = "wide-view";
    card._renderShell();
    card._wideViewPageController.startWideViewMode();
    await card._wideViewCompanionController._ensureDelegate();
    await new Promise((resolve) => requestAnimationFrame(resolve));
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
    const companionGrid = root.querySelector("#wide-companion-grid");
    const companionCells = Array.from(
      root.querySelectorAll(".wide-companion-cell"),
    );
    const firstCellTop =
      companionCells[0]?.getBoundingClientRect().top ?? -1;
    const firstCompanionCell = companionCells[0];
    const firstCompanionMedia = firstCompanionCell.querySelector(
      ".wide-companion-media-host",
    );
    const firstCompanionMeta = firstCompanionCell.querySelector(
      ".wide-companion-meta",
    );
    const firstCompanionName = firstCompanionCell.querySelector(
      ".wide-companion-meta-name",
    );
    const firstCompanionStatus = firstCompanionCell.querySelector(
      ".wide-companion-meta-status",
    );
    const firstCompanionMediaRect =
      firstCompanionMedia.getBoundingClientRect();
    const firstCompanionMetaRect = firstCompanionMeta.getBoundingClientRect();
    const before = {
      panelTop: panel.getBoundingClientRect().top,
      surfaceTop: surface.getBoundingClientRect().top,
      panelOverflow: getComputedStyle(panel).overflow,
      liveHeight: liveStage.getBoundingClientRect().height,
      gridWidth: companionGrid.getBoundingClientRect().width,
      surfacePaddingLeft: getComputedStyle(surface).paddingLeft,
      gridInsetLeft:
        companionGrid.getBoundingClientRect().left -
        surface.getBoundingClientRect().left,
      buttonInsetRight:
        surface.getBoundingClientRect().right -
        expandButton.getBoundingClientRect().right,
      cellCount: companionCells.length,
      cellEntities: companionCells.map(
        (cell) =>
          cell.querySelector(".wide-companion-media-host")?.dataset
            .wideCompanionMediaEntity,
      ),
      gridDisplay: getComputedStyle(companionGrid).display,
      previewStylesLoaded: Boolean(
        root
          .querySelector("[data-fvc-preview-page-styles]")
          ?.textContent?.trim(),
      ),
      firstRowCellCount: companionCells.filter(
        (cell) =>
          Math.abs(cell.getBoundingClientRect().top - firstCellTop) <= 1,
      ).length,
      cellWidth: firstCompanionCell.getBoundingClientRect().width,
      mediaHeight: firstCompanionMediaRect.height,
      cellDisplay: getComputedStyle(firstCompanionCell).display,
      cellDirection: getComputedStyle(firstCompanionCell).flexDirection,
      mediaPosition: getComputedStyle(firstCompanionMedia).position,
      mediaOverflow: getComputedStyle(firstCompanionMedia).overflow,
      metaDisplay: getComputedStyle(firstCompanionMeta).display,
      metaBelowMedia:
        firstCompanionMetaRect.top >= firstCompanionMediaRect.bottom - 1,
      metaHeight: firstCompanionMetaRect.height,
      statusBeforeName:
        firstCompanionStatus.getBoundingClientRect().right <=
        firstCompanionName.getBoundingClientRect().left,
      renderedColumns: getComputedStyle(companionGrid).gridTemplateColumns.split(
        " ",
      ).length,
    };
    filterPanel.style.height = "40px";
    filterButton.click();
    await new Promise((resolve) => requestAnimationFrame(resolve));
    const filterButtonRect = filterButton.getBoundingClientRect();
    const filterRect = filterPanel.getBoundingClientRect();
    const surfaceRect = surface.getBoundingClientRect();
    const cardRect = card.getBoundingClientRect();
    const filterOpen = {
      display: filterPanel.style.display,
      raised: toolbarHolder.classList.contains("has-open-toolbar-panel"),
      zIndex: getComputedStyle(toolbarHolder).zIndex,
      opensAbove: filterPanel.classList.contains(
        "wide-toolbar-panel--above",
      ),
      belowButton: filterRect.top >= filterButtonRect.bottom - 1,
      insideCardBottom: filterRect.bottom <= cardRect.bottom + 1,
    };
    filterPanel.style.height = "360px";
    card._wideViewPageController.scheduleToolbarPanelPlacement();
    await new Promise((resolve) => requestAnimationFrame(resolve));
    const tallFilterRect = filterPanel.getBoundingClientRect();
    const tallFilterOpen = {
      opensAbove: filterPanel.classList.contains(
        "wide-toolbar-panel--above",
      ),
      clearsCompanion: tallFilterRect.bottom <= surfaceRect.top,
      insideCardTop: tallFilterRect.top >= cardRect.top,
    };
    filterPanel.style.removeProperty("height");
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
      cellWidth: firstCompanionCell.getBoundingClientRect().width,
      mediaHeight: firstCompanionMedia.getBoundingClientRect().height,
      renderedColumns: getComputedStyle(
        companionGrid,
      ).gridTemplateColumns.split(" ").length,
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
      cellWidth: firstCompanionCell.getBoundingClientRect().width,
      mediaHeight: firstCompanionMedia.getBoundingClientRect().height,
      renderedColumns: getComputedStyle(
        companionGrid,
      ).gridTemplateColumns.split(" ").length,
    };
    calendarPanel.style.height = "40px";
    calendarButton.click();
    await new Promise((resolve) => requestAnimationFrame(resolve));
    const calendarButtonRect = calendarButton.getBoundingClientRect();
    const calendarRect = calendarPanel.getBoundingClientRect();
    const calendarOpen = {
      display: calendarPanel.style.display,
      raised: toolbarHolder.classList.contains("has-open-toolbar-panel"),
      opensAbove: calendarPanel.classList.contains(
        "wide-toolbar-panel--above",
      ),
      belowButton: calendarRect.top >= calendarButtonRect.bottom - 1,
    };
    calendarPanel.style.height = "360px";
    card._wideViewPageController.scheduleToolbarPanelPlacement();
    await new Promise((resolve) => requestAnimationFrame(resolve));
    const tallCalendarRect = calendarPanel.getBoundingClientRect();
    const tallCalendarOpen = {
      opensAbove: calendarPanel.classList.contains(
        "wide-toolbar-panel--above",
      ),
      clearsCompanion: tallCalendarRect.bottom <= surfaceRect.top,
      insideCardTop: tallCalendarRect.top >= cardRect.top,
    };
    calendarPanel.style.removeProperty("height");
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
      allCamerasVisible: companionCells.every((cell) => {
        const cellRect = cell.getBoundingClientRect();
        const gridRect = companionGrid.getBoundingClientRect();
        return (
          cellRect.top >= gridRect.top - 1 &&
          cellRect.bottom <= gridRect.bottom + 1
        );
      }),
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
      tallFilterOpen,
      expanded,
      collapsed,
      calendarOpen,
      tallCalendarOpen,
      buttonExpanded,
      buttonCollapsed,
      stopped: {
        now: Number(handle.getAttribute("aria-valuenow")),
        panelExpanded: panel.classList.contains("is-expanded"),
      },
    };
  });

  expect(result.expanded.max).toBeGreaterThan(0);
  expect(result.before.panelOverflow).toBe("visible");
  expect(result.before.surfacePaddingLeft).toBe("8px");
  expect(result.before.gridInsetLeft).toBeCloseTo(8, 0);
  expect(result.before.buttonInsetRight).toBeCloseTo(8, 0);
  expect(result.before.cellCount).toBe(12);
  expect(result.before.cellEntities).toEqual([
    "camera.camera_1",
    "camera.camera_2",
    "camera.camera_3",
    "camera.camera_4",
    "camera.camera_5",
    "camera.camera_6",
    "camera.camera_7",
    "camera.camera_8",
    "camera.camera_9",
    "camera.camera_10",
    "camera.camera_11",
    "camera.camera_12",
  ]);
  expect(result.before.gridDisplay).toBe("grid");
  expect(result.before.previewStylesLoaded).toBe(false);
  expect(result.before.firstRowCellCount).toBeGreaterThan(1);
  expect(result.before.cellWidth).toBeCloseTo(
    (result.before.gridWidth -
      8 * (result.before.renderedColumns - 1)) /
      result.before.renderedColumns,
    0,
  );
  expect(
    result.before.cellWidth / result.before.mediaHeight,
  ).toBeCloseTo(16 / 9, 2);
  expect(result.before.cellDisplay).toBe("flex");
  expect(result.before.cellDirection).toBe("column");
  expect(result.before.mediaPosition).toBe("relative");
  expect(result.before.mediaOverflow).toBe("hidden");
  expect(result.before.metaDisplay).toBe("grid");
  expect(result.before.metaBelowMedia).toBe(true);
  expect(result.before.metaHeight).toBeGreaterThanOrEqual(24);
  expect(result.before.statusBeforeName).toBe(true);
  expect(result.before.renderedColumns).toBeGreaterThan(1);
  expect(result.filterOpen).toEqual({
    display: "block",
    raised: true,
    zIndex: "30",
    opensAbove: false,
    belowButton: true,
    insideCardBottom: true,
  });
  expect(result.tallFilterOpen).toEqual({
    opensAbove: true,
    clearsCompanion: true,
    insideCardTop: true,
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
    result.expanded.liveBottom - result.expanded.liveHeight * 0.7 - 1,
  );
  expect(result.expanded.surfaceTop).toBeLessThanOrEqual(
    result.expanded.liveBottom - result.expanded.liveHeight * 0.7 + 1,
  );
  expect(result.expanded.panelTop).toBeCloseTo(result.before.panelTop, 0);
  expect(result.expanded.liveHeight).toBeCloseTo(result.before.liveHeight, 0);
  expect(result.expanded.cellWidth).toBeCloseTo(result.before.cellWidth, 0);
  expect(result.expanded.mediaHeight).toBeCloseTo(
    result.before.mediaHeight,
    0,
  );
  expect(result.expanded.renderedColumns).toBe(
    result.before.renderedColumns,
  );
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
  expect(result.collapsed.cellWidth).toBeCloseTo(result.before.cellWidth, 0);
  expect(result.collapsed.mediaHeight).toBeCloseTo(
    result.before.mediaHeight,
    0,
  );
  expect(result.collapsed.renderedColumns).toBe(
    result.before.renderedColumns,
  );
  expect(result.calendarOpen).toEqual({
    display: "block",
    raised: true,
    opensAbove: false,
    belowButton: true,
  });
  expect(result.tallCalendarOpen).toEqual({
    opensAbove: true,
    clearsCompanion: true,
    insideCardTop: true,
  });
  expect(result.buttonExpanded.now).toBeLessThan(
    result.buttonExpanded.max,
  );
  expect(result.buttonExpanded.allCamerasVisible).toBe(true);
  if (result.buttonExpanded.now === 0) {
    expect(result.buttonExpanded).toMatchObject({
      now: 0,
      expanded: "false",
      label: "Expand Companion Cameras",
      calendarDisplay: "block",
      toolbarRaised: true,
    });
  } else {
    expect(
      result.buttonExpanded.now,
      JSON.stringify(result.buttonExpanded),
    ).toBeGreaterThan(0);
    expect(result.buttonExpanded).toMatchObject({
      expanded: "true",
      label: "Collapse Companion Cameras",
      calendarDisplay: "none",
      toolbarRaised: false,
    });
  }
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
        wide_view_width: 50,
        wide_view_timeline_enabled: true,
        wide_view_timeline_default_open: true,
        stream_height: 640,
        stream_height_unit: "px",
      });
      await card._wideViewPageController.prepare();
      card._pageId = "wide-view";
      card._renderShell();
      await card._wideViewTimelineController._ensureDelegate();
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
    expect(new Set(samples.map(({ panelWidth }) => panelWidth))).toEqual(
      new Set([264]),
    );
  }
});

test("Wide View timeline drag crosses the browse minimum into overlay mode", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1_200, height: 700 });
  await page.goto(baseUrl);
  const result = await page.evaluate(async () => {
    const { WideViewTimelineController } = await import(
      "/frigate-view-card-wide-timeline.js"
    );
    const host = document.createElement("div");
    host.attachShadow({ mode: "open" });
    host._config = {
      wide_view_timeline_enabled: true,
      wide_view_timeline_default_open: false,
    };
    host._$ = (selector) => host.shadowRoot.querySelector(selector);
    document.body.append(host);

    const controller = new WideViewTimelineController(host, {
      setTimer: () => null,
    });
    const wrapper = document.createElement("div");
    wrapper.className = "card";
    wrapper.style.cssText = "position:relative;width:1000px;height:500px";
    wrapper.innerHTML = `<div id="col-right" class="col-right--wide-view" style="position:relative;width:1000px;height:500px">${controller.buildRegionMarkup()}</div>`;
    host.shadowRoot.append(wrapper);
    const colRight = host._$("#col-right");
    const panel = host._$("#wide-timeline-panel");
    const surface = {
      addEventListener() {},
      removeEventListener() {},
      setPointerCapture() {},
      releasePointerCapture() {},
    };
    controller._boundWidthToggle = surface;
    controller._scheduleRender = () => {};
    controller.toggle();

    const opened = {
      mode: colRight.classList.contains("wide-timeline-push")
        ? "push"
        : "overlay",
      width: Math.round(panel.getBoundingClientRect().width),
    };

    controller._handleWidthPointerDown({
      currentTarget: surface,
      pointerId: 20,
      button: 0,
      clientX: 264,
      stopPropagation() {},
    });
    controller._handleWidthPointerMove({
      pointerId: 20,
      clientX: 740,
      preventDefault() {},
      stopPropagation() {},
    });
    const boundary = {
      mode: colRight.classList.contains("wide-timeline-push")
        ? "push"
        : "overlay",
      width: Math.round(panel.getBoundingClientRect().width),
    };
    controller._handleWidthPointerMove({
      pointerId: 20,
      clientX: 764,
      preventDefault() {},
      stopPropagation() {},
    });
    const overlaid = {
      mode: colRight.classList.contains("wide-timeline-overlay")
        ? "overlay"
        : "push",
      width: Math.round(panel.getBoundingClientRect().width),
    };
    controller._handleWidthPointerUp({
      pointerId: 20,
      preventDefault() {},
      stopPropagation() {},
    });

    controller._handleWidthPointerDown({
      currentTarget: surface,
      pointerId: 21,
      button: 0,
      clientX: 764,
      stopPropagation() {},
    });
    controller._handleWidthPointerMove({
      pointerId: 21,
      clientX: 100,
      preventDefault() {},
      stopPropagation() {},
    });
    const narrowed = Math.round(panel.getBoundingClientRect().width);

    controller.teardown();
    host.remove();
    return { opened, boundary, overlaid, narrowed };
  });

  expect(result).toEqual({
    opened: { mode: "push", width: 264 },
    boundary: { mode: "push", width: 740 },
    overlaid: { mode: "overlay", width: 764 },
    narrowed: 264,
  });
});

test("Wide View timeline spaces its axis and thumbnails responsively", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1_200, height: 700 });
  await page.goto(baseUrl);
  const result = await page.evaluate(async () => {
    const { WideViewTimelineController } = await import(
      "/frigate-view-card-wide-timeline.js"
    );
    const host = document.createElement("div");
    host.attachShadow({ mode: "open" });
    host._config = {
      wide_view_timeline_enabled: true,
      wide_view_timeline_default_open: true,
    };
    host._$ = (selector) => host.shadowRoot.querySelector(selector);
    document.body.append(host);

    const event = {
      id: "timeline-spacing-event",
      camera: "front",
      label: "car",
      start_time: 9_900,
      end_time: 9_910,
      has_snapshot: true,
    };
    const controller = new WideViewTimelineController(host, {
      getAllEvents: () => [event],
      getVisibleEvents: () => [event],
      getWindowStart: () => 6_400,
      getWindowEnd: () => 10_000,
      now: () => 10_000,
      formatTime: () => "10:00 pm",
      setTimer: () => null,
    });
    const wrapper = document.createElement("div");
    wrapper.className = "card";
    wrapper.style.cssText = "position:relative;width:730px;height:500px";
    wrapper.innerHTML = `<div id="col-right" class="col-right--wide-view" style="position:relative;width:730px;height:500px">${controller.buildRegionMarkup()}</div>`;
    host.shadowRoot.append(wrapper);

    const sample = (width) => {
      controller._observedViewportWidth = width;
      controller._observedViewportHeight = 500;
      controller.render({ force: true });
      const canvas = host._$(".wide-timeline-canvas");
      canvas.style.width = `${width}px`;
      const canvasBounds = canvas.getBoundingClientRect();
      const axisBounds = host._$(".wide-timeline-axis").getBoundingClientRect();
      const cardBounds = host._$(".wide-timeline-stack").getBoundingClientRect();
      const timeBounds = host._$(".wide-timeline-tick-time")
        .getBoundingClientRect();
      const link = host._$(".wide-timeline-link");
      const axisLeft = axisBounds.left + axisBounds.width / 2 -
        canvasBounds.left;
      const cardLeft = cardBounds.left - canvasBounds.left;
      return {
        axisLeft,
        cardLeft,
        cardWidth: cardBounds.width,
        axisToCard: cardLeft - axisLeft,
        rightSpace: width - cardLeft - cardBounds.width,
        timeRight: timeBounds.right - canvasBounds.left,
        connectorStart: Number(link.getAttribute("x1")),
        connectorEnd: Number(link.getAttribute("x2")),
      };
    };

    const narrow = sample(264);
    const wide = sample(730);
    controller.teardown();
    host.remove();
    return { narrow, wide };
  });

  expect(result.narrow.axisLeft).toBeCloseTo(43.56, 1);
  expect(result.narrow.cardLeft).toBeCloseTo(84, 1);
  expect(result.narrow.cardWidth).toBeCloseTo(156, 1);
  expect(result.narrow.rightSpace).toBeCloseTo(24, 1);
  expect(result.narrow.timeRight).toBeLessThan(result.narrow.axisLeft);
  expect(result.narrow.connectorStart).toBeCloseTo(16.5, 1);
  expect(result.narrow.connectorEnd).toBeCloseTo(31.82, 1);

  expect(result.wide.axisLeft).toBeCloseTo(110, 1);
  expect(result.wide.cardLeft).toBeCloseTo(317, 1);
  expect(result.wide.cardWidth).toBeCloseTo(160, 1);
  expect(result.wide.axisToCard).toBeGreaterThan(
    result.narrow.axisToCard,
  );
  expect(result.wide.rightSpace).toBeCloseTo(253, 1);
  expect(result.wide.connectorStart).toBeCloseTo(15.07, 1);
  expect(result.wide.connectorEnd).toBeCloseTo(43.42, 1);
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

test("phone Single View source badge follows live controls while LIVE remains visible", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(baseUrl);

  await page.evaluate(async () => {
    await import("/frigate-view-card.js");
    const card = document.createElement("frigate-view-card");
    card.dataset.sourceBadgeTest = "true";
    card.style.display = "block";
    card.style.width = "390px";
    document.body.style.margin = "0";
    document.body.append(card);
    card.setConfig({
      cameras: [{ entity: "camera.front", name: "Front" }],
    });
    card._pageId = "single-view";
    card._renderShell();

    const stage = card.shadowRoot.querySelector("#live-stage");
    const controls = card.shadowRoot.querySelector(".live-playback-controls");
    const source = card.shadowRoot.querySelector(
      "[data-single-view-source-indicator]",
    );
    const live = card.shadowRoot.querySelector(
      "[data-single-view-live-badge]",
    );
    source.hidden = false;
    stage.dataset.sourceBadgeTestStage = "true";
    controls.dataset.sourceBadgeTestControls = "true";
    source.dataset.sourceBadgeTestSource = "true";
    live.dataset.sourceBadgeTestLive = "true";
  });

  const sample = () =>
    page.evaluate(() => {
      const card = document.querySelector(
        'frigate-view-card[data-source-badge-test="true"]',
      );
      const controls = card.shadowRoot.querySelector(
        '[data-source-badge-test-controls="true"]',
      );
      const source = card.shadowRoot.querySelector(
        '[data-source-badge-test-source="true"]',
      );
      const live = card.shadowRoot.querySelector(
        '[data-source-badge-test-live="true"]',
      );
      return {
        controlsOpacity: getComputedStyle(controls).opacity,
        liveDisplay: getComputedStyle(live).display,
        sourceOpacity: getComputedStyle(source).opacity,
        sourceVisibility: getComputedStyle(source).visibility,
      };
    });
  const setControlsVisible = (visible) =>
    page.evaluate((nextVisible) => {
      const card = document.querySelector(
        'frigate-view-card[data-source-badge-test="true"]',
      );
      card.shadowRoot
        .querySelector('[data-source-badge-test-stage="true"]')
        .classList.toggle("live-controls-visible", nextVisible);
    }, visible);
  const hidden = {
    controlsOpacity: "0",
    liveDisplay: "flex",
    sourceOpacity: "0",
    sourceVisibility: "hidden",
  };
  const visible = {
    controlsOpacity: "1",
    liveDisplay: "flex",
    sourceOpacity: "1",
    sourceVisibility: "visible",
  };

  expect(await sample()).toEqual(hidden);
  await setControlsVisible(true);
  await expect.poll(sample).toEqual(visible);
  await setControlsVisible(false);
  await expect.poll(sample).toEqual(hidden);
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
        lockedTitles: chips
          .filter((chip) => chip.querySelector("input").disabled)
          .map((chip) => chip.title),
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
  expect(geometry.wide.desktop.lockedTitles).toEqual([
    "This page is always included because it is the landing page.",
  ]);
  expect(geometry.wide.mobile.lockedTitles).toEqual([
    "This page is always included because it is the landing page.",
  ]);
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

test("restores Card View Video Only mode controls after a shell replacement", async ({
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
      card_view_view_mode: "video-only",
      grid_mode_enabled: true,
      slideshow_rotation_enabled: true,
    });
    await card._cardViewPageController.prepareStyles();
    card._pageId = "card-view";
    card._renderShell();
    card._cardViewPageController.renderToolbar();

    const countControls = () => ({
      grid: card.shadowRoot.querySelectorAll(
        "[data-card-view-standalone-mode-controls] [data-card-view-standalone-grid]",
      ).length,
      slideshow: card.shadowRoot.querySelectorAll(
        "[data-card-view-standalone-mode-controls] [data-card-view-standalone-slideshow]",
      ).length,
      takeover: card.shadowRoot.querySelectorAll(
        "[data-card-view-standalone-mode-controls] [data-card-view-takeover]",
      ).length,
    });
    const before = countControls();

    card._renderShellPreserveLive();
    card._syncToolbarButtons();

    return { before, after: countControls() };
  });

  expect(state).toEqual({
    before: { grid: 1, slideshow: 1, takeover: 1 },
    after: { grid: 1, slideshow: 1, takeover: 1 },
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

test("camera picker dropdown surfaces follow the card background theme", async ({
  page,
}) => {
  await page.goto(baseUrl);

  const colors = await page.evaluate(async () => {
    await import("/frigate-view-card.js");
    const card = document.createElement("frigate-view-card");
    document.body.append(card);
    card.setConfig({
      cameras: [
        { entity: "camera.front", name: "Front" },
        { entity: "camera.back", name: "Back" },
      ],
      mobile_view_page_enabled: true,
    });
    card._pageId = "mobile-view";
    card._mobileCamSwitcherOpen = true;
    card._renderShell();
    card._renderCamSwitcher();

    const root = card.shadowRoot;
    const cardRoot = root.querySelector("#card");
    const panel = root.querySelector(".mobile-cam-picker__panel");
    const options = root.querySelectorAll(".mobile-cam-picker__option");
    const sample = async ({ panelColor, optionColor }) => {
      cardRoot.style.setProperty("--c-bg-panel", panelColor);
      cardRoot.style.setProperty("--c-bg-primary", optionColor);
      await new Promise((resolve) => requestAnimationFrame(resolve));
      return {
        panel: getComputedStyle(panel).backgroundColor,
        active: getComputedStyle(options[0]).backgroundColor,
        option: getComputedStyle(options[1]).backgroundColor,
      };
    };

    return {
      light: await sample({ panelColor: "#f2f2f2", optionColor: "#ffffff" }),
      dark: await sample({ panelColor: "#242424", optionColor: "#111111" }),
    };
  });

  expect(colors.light.panel).not.toBe(colors.dark.panel);
  expect(colors.light.active).not.toBe(colors.dark.active);
  expect(colors.light.option).not.toBe(colors.dark.option);
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
    await page.addScriptTag({ url: "/frigate-view-card.js", type: "module" });
    const portrait = await page.evaluate(() => {
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
      card._isCompanionApp = () => true;
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
      await card._cardViewPageController.prepareStyles();
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
      await card._cardViewPageController.prepareStyles();
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
      await card._cardViewPageController.prepareStyles();
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
        await card._cardViewPageController.prepareStyles();
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
            await card._cardViewPageController.prepareStyles();
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

            const navbarReadyDeadline = performance.now() + 2000;
            while (
              getComputedStyle(view).zIndex !== "2" &&
              performance.now() < navbarReadyDeadline
            ) {
              await new Promise((resolve) => setTimeout(resolve, 10));
            }

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
      await card._cardViewPageController.prepareStyles();
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
      const opacitySettleDeadline = performance.now() + 500;
      while (
        getComputedStyle(sideControls).opacity !== "0" &&
        performance.now() < opacitySettleDeadline
      ) {
        await new Promise((resolve) => requestAnimationFrame(resolve));
      }

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
      await card._cardViewPageController.prepareStyles();
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
      liveStage.style.animation = "none";
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
        await card._cardViewPageController.prepareStyles();
        if (surface.pageId === "wide-view") {
          await card._wideViewPageController.prepare();
        }
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

    for (const state of states) {
      expect(state.liveSideInset).toBeGreaterThanOrEqual(19);
      expect(state.liveSideInset).toBeLessThanOrEqual(21);
    }
    const normalizedStates = states.map((state) => ({
      ...state,
      // Firefox can round the same rotated edge to either adjacent device
      // pixel while the viewport settles.
      liveSideInset: 20,
    }));

    expect(normalizedStates).toEqual([
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
      await card._cardViewPageController.prepareStyles();
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
      await card._cardViewPageController.prepareStyles();
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
      await card._cardViewPageController.prepareStyles();
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
