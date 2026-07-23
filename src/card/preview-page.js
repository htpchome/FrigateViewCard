import {
  DAY,
  PREVIEW_ALERT_END_GRACE_MS,
  PREVIEW_ALERT_HOLD_MS,
  SLIDESHOW_REVIEW_FRESHNESS_GRACE_SEC,
} from "../constants.js";
import { ICONS } from "../icons.js";
import { DEVICE_PROFILE, cap, camDisplayName } from "../helpers.js";
import { PAGE_IDS } from "../router.js";

export const previewPageMethods = {
  _isPreviewPageEnabled() {
    return this._config?.preview_page_enabled === true;
  },

  _isPreviewPageActive() {
    return this._isPreviewPageEnabled() && this._pageId === PAGE_IDS.preview;
  },

  _previewLiveCamerasEnabled() {
    return this._config?.preview_page_live_cameras === true;
  },

  _previewShowTitleBarsEnabled() {
    return this._config?.preview_page_show_title_bars !== false;
  },

  _applyPreviewShellVisibility() {
    const card = this._$("#card");
    if (!card) return;
    card.classList.toggle("preview-active", this._isPreviewPageActive());
  },

  _clearPreviewTimers() {
    if (this._previewSnapshotRefreshT)
      clearTimeout(this._previewSnapshotRefreshT);
    if (this._previewAlertWatchT) clearTimeout(this._previewAlertWatchT);
    if (this._previewAlertCleanupT) clearTimeout(this._previewAlertCleanupT);
    this._previewSnapshotRefreshT = null;
    this._previewAlertWatchT = null;
    this._previewAlertCleanupT = null;
  },

  _clearPreviewAlertTracking() {
    this._previewAlertExpiresByEntity.clear();
    this._previewAlertSeverityByEntity.clear();
    this._previewHandledReviewIds.clear();
  },

  _isPreviewCameraAlertLive(entity) {
    const until = Number(this._previewAlertExpiresByEntity.get(entity) || 0);
    return until > Date.now();
  },

  _previewCellSeverity(entity) {
    if (!this._isPreviewCameraAlertLive(entity)) {
      this._previewAlertSeverityByEntity.delete(entity);
      return "";
    }
    const sev = String(this._previewAlertSeverityByEntity.get(entity) || "")
      .trim()
      .toLowerCase();
    return sev === "detection" ? "detection" : sev === "alert" ? "alert" : "";
  },

  _previewShouldUseLive(entity) {
    return (
      this._previewLiveCamerasEnabled() ||
      this._isPreviewCameraAlertLive(entity)
    );
  },

  _previewEventsCount(entity) {
    const cache = this._camCache[entity];
    const eventsCount = Array.isArray(cache?.events) ? cache.events.length : 0;
    const reviewsCount = Array.isArray(cache?.reviews)
      ? cache.reviews.length
      : 0;
    return eventsCount + reviewsCount;
  },

  _previewStreamSourceLabel(entity, useLive) {
    if (!useLive) return "Snapshot";
    const connectionType = this._cameraConnectionType(entity);
    if (connectionType === "ha_direct") return "HA Live";
    const hint = String(this._previewLiveStreamHint() || "").toUpperCase();
    return hint ? `${hint} Live` : "Live";
  },

  _previewLiveStreamHint() {
    const active = String(this._activeStreamType || "")
      .trim()
      .toLowerCase();
    if (active === "webrtc" || active === "mse" || active === "hls") {
      return active;
    }
    const lastHint = String(this._lastLiveStreamHint || "")
      .trim()
      .toLowerCase();
    if (lastHint === "webrtc" || lastHint === "mse" || lastHint === "hls") {
      return lastHint;
    }
    if (DEVICE_PROFILE.isIOS) return "webrtc";
    return "mse";
  },

  _teardownPreviewMedia() {
    if (this._previewMediaState) {
      this._previewMediaState.destroyed = true;
      for (const cleanup of this._previewMediaState.cleanup || []) {
        try {
          cleanup();
        } catch (_) {}
      }
    }
    this._previewMediaState = null;
    this._previewLastRenderSignature = "";
    const hosts = this.shadowRoot.querySelectorAll(".preview-media-host");
    hosts.forEach((host) => {
      host.querySelectorAll("video").forEach((video) => {
        try {
          video.pause();
          video.removeAttribute("src");
          video.load();
        } catch (_) {}
      });
      host.innerHTML = "";
    });
  },

  _renderPreviewPage() {
    const shell = this._$("#preview-shell");
    if (!shell) return;
    const titleEl = this._$("#preview-shell-title");
    const subtitleEl = this._$("#preview-shell-subtitle");
    if (titleEl) {
      titleEl.textContent =
        this._config.title ||
        (this._config.cameras.length === 1
          ? cap(camDisplayName(this._config.cameras[0]))
          : "Cameras") ||
        "Camera";
    }
    if (subtitleEl) subtitleEl.textContent = this._subtitleText();
    if (!this._isPreviewPageEnabled()) {
      shell.innerHTML = "";
      this._applyPreviewShellVisibility();
      return;
    }
    if (!this._isPreviewPageActive()) {
      this._applyPreviewShellVisibility();
      return;
    }

    const cameras = Array.isArray(this._config?.cameras)
      ? this._config.cameras.slice(0, 9)
      : [];
    const showTitleBars = this._previewShowTitleBarsEnabled();
    const liveStreamHint = this._previewLiveStreamHint();
    const hassReady = !!this._hass?.states;
    const nextSignature = cameras
      .map((camera, index) => {
        const entity = camera?.entity || "";
        const severity = this._previewCellSeverity(entity);
        const useLive = this._previewShouldUseLive(entity);
        return `${index}:${entity}:${severity || "none"}:${useLive ? `live:${liveStreamHint}` : "snap"}`;
      })
      .concat([
        `titles:${showTitleBars ? "1" : "0"}`,
        `hass:${hassReady ? "1" : "0"}`,
      ])
      .join("|");
    if (
      shell.firstElementChild?.classList?.contains("preview-grid") &&
      this._previewLastRenderSignature === nextSignature
    ) {
      this._updatePreviewMeta();
      this._applyPreviewShellVisibility();
      return;
    }
    this._teardownPreviewMedia();
    this._previewLastRenderSignature = nextSignature;

    const cells = cameras
      .map((camera, index) => {
        const entity = camera?.entity || "";
        const entState = this._hass?.states?.[entity];
        const online = entState?.state !== "unavailable";
        const severity = this._previewCellSeverity(entity);
        const useLive = this._previewShouldUseLive(entity);
        const sourceLabel = this._previewStreamSourceLabel(entity, useLive);
        const eventsCount = this._previewEventsCount(entity);
        const name = cap(camDisplayName(camera));
        return `<div class="preview-cell shadow-medium" data-preview-camidx="${index}">
          <div class="preview-media-host ${severity === "alert" ? "grid-alert" : severity === "detection" ? "grid-detection" : ""}" data-preview-media-entity="${entity}" data-preview-use-live="${useLive ? "1" : "0"}"></div>
          ${
            showTitleBars
              ? `<div class="preview-meta">
              <div class="preview-meta-name">${name}</div>
              <div class="preview-meta-status"><span class="dot" style="color:${online ? "#4ade80" : "#ef4444"}">●</span>${online ? "Online" : "Offline"}</div>
              <div class="preview-meta-source">Stream Source: ${sourceLabel}</div>
              <div class="preview-meta-events">Events: ${eventsCount}</div>
            </div>`
              : ""
          }
        </div>`;
      })
      .join("");

    const buttons = cameras
      .map((camera, index) => {
        const name = cap(camDisplayName(camera));
        return `<button class="glass-btn preview-cam-btn" type="button" data-preview-select-camidx="${index}">${name}</button>`;
      })
      .join("");

    shell.innerHTML = `<div class="preview-grid" id="preview-grid">${cells}</div>
      <div class="preview-cam-buttons">${buttons}</div>`;
    this._mountPreviewMedia();
    this._applyPreviewShellVisibility();
  },

  _updatePreviewMeta() {
    if (!this._previewShowTitleBarsEnabled()) return;
    this.shadowRoot
      .querySelectorAll("[data-preview-camidx]")
      .forEach((cell) => {
        const idx = Number(cell.dataset.previewCamidx);
        const camera = this._config?.cameras?.[idx];
        const entity = camera?.entity || "";
        if (!entity) return;
        const online = this._hass?.states?.[entity]?.state !== "unavailable";
        const useLive = this._previewShouldUseLive(entity);
        const status = cell.querySelector(".preview-meta-status");
        if (status) {
          status.innerHTML = `<span class="dot" style="color:${online ? "#4ade80" : "#ef4444"}">●</span>${online ? "Online" : "Offline"}`;
        }
        const source = cell.querySelector(".preview-meta-source");
        if (source) {
          source.textContent = `Stream Source: ${this._previewStreamSourceLabel(entity, useLive)}`;
        }
        const events = cell.querySelector(".preview-meta-events");
        if (events)
          events.textContent = `Events: ${this._previewEventsCount(entity)}`;
      });
  },

  _mountPreviewMedia() {
    if (!this._isPreviewPageActive()) return;
    const hosts = this.shadowRoot.querySelectorAll(".preview-media-host");
    if (!this._hass?.states) {
      hosts.forEach((host) => {
        host.innerHTML = `<div class="ph">${ICONS.live}<span>Loading…</span></div>`;
      });
      return;
    }
    const liveStreamHint = this._previewLiveStreamHint();
    const previewState = { destroyed: false, cleanup: [] };
    this._previewMediaState = previewState;
    hosts.forEach((host) => {
      const entity = host.dataset.previewMediaEntity || "";
      const useLive = host.dataset.previewUseLive === "1";
      const stateObj = entity
        ? this._hlsStateObj(entity, liveStreamHint) ||
          this._hass?.states?.[entity] ||
          null
        : null;
      host.innerHTML = "";
      if (!entity) {
        host.innerHTML = `<div class="ph">${ICONS.live}<span>Unavailable</span></div>`;
        return;
      }
      this._mountGridCameraCellMedia(host, {
        entity,
        stateObj,
        useLive,
        liveStreamHint,
        gridState: previewState,
        fallbackOnLiveError: true,
      });
    });
  },

  _refreshPreviewSnapshots() {
    if (!this._isPreviewPageActive() || this._previewLiveCamerasEnabled())
      return;
    const hosts = this.shadowRoot.querySelectorAll(
      ".preview-media-host[data-preview-use-live='0']",
    );
    hosts.forEach((host) => {
      const entity = host.dataset.previewMediaEntity || "";
      const img = host.querySelector("img");
      if (!entity || !img) return;
      void (async () => {
        const url = await this._streamFallbackUrl(entity);
        if (!img.isConnected || !url) return;
        img.src = url;
      })();
    });
  },

  _schedulePreviewSnapshotRefresh(delayMs = null) {
    if (this._previewSnapshotRefreshT)
      clearTimeout(this._previewSnapshotRefreshT);
    this._previewSnapshotRefreshT = null;
    void delayMs;
  },

  _schedulePreviewAlertCleanup() {
    if (this._previewAlertCleanupT) clearTimeout(this._previewAlertCleanupT);
    let nextExpiry = 0;
    for (const until of this._previewAlertExpiresByEntity.values()) {
      const ts = Number(until || 0);
      if (ts <= Date.now()) continue;
      if (!nextExpiry || ts < nextExpiry) nextExpiry = ts;
    }
    if (!nextExpiry) {
      this._previewAlertCleanupT = null;
      return;
    }
    const wait = Math.max(100, nextExpiry - Date.now() + 25);
    this._previewAlertCleanupT = setTimeout(() => {
      this._previewAlertCleanupT = null;
      let changed = false;
      const now = Date.now();
      for (const [
        entity,
        until,
      ] of this._previewAlertExpiresByEntity.entries()) {
        if (Number(until || 0) <= now) {
          this._previewAlertExpiresByEntity.delete(entity);
          this._previewAlertSeverityByEntity.delete(entity);
          changed = true;
        }
      }
      if (changed && this._isPreviewPageActive()) this._renderPreviewPage();
      this._schedulePreviewAlertCleanup();
    }, wait);
  },

  _markPreviewAlertCamera(
    entity,
    severity = "alert",
    holdMs = PREVIEW_ALERT_HOLD_MS,
  ) {
    if (!entity) return;
    const normalizedSeverity =
      String(severity || "")
        .trim()
        .toLowerCase() === "detection"
        ? "detection"
        : "alert";
    this._previewAlertSeverityByEntity.set(entity, normalizedSeverity);
    this._previewAlertExpiresByEntity.set(
      entity,
      Date.now() + Math.max(1000, Number(holdMs) || PREVIEW_ALERT_HOLD_MS),
    );
    this._schedulePreviewAlertCleanup();
    if (this._isPreviewPageActive()) this._renderPreviewPage();
  },

  _rememberHandledPreviewReview(reviewId) {
    const id = String(reviewId || "").trim();
    if (!id) return;
    this._previewHandledReviewIds.add(id);
    if (this._previewHandledReviewIds.size <= 200) return;
    const oldest = this._previewHandledReviewIds.values().next().value;
    if (oldest) this._previewHandledReviewIds.delete(oldest);
  },

  _isPreviewReviewFresh(review) {
    const startedAt = Number(this._previewStartedAtSec || 0);
    if (startedAt <= 0) return true;
    const reviewStart = this._reviewStartTimeSec(review);
    if (reviewStart <= 0) return false;
    return reviewStart >= startedAt - SLIDESHOW_REVIEW_FRESHNESS_GRACE_SEC;
  },

  async _probeLatestPreviewAlert() {
    if (!this._isPreviewPageActive()) return;
    const before = Math.floor(Date.now() / 1000);
    const after = Math.max(
      0,
      Math.floor(before - (this._config?.alerts_reviews_days || 3) * DAY),
    );
    const candidates = [];
    for (const camera of this._config?.cameras || []) {
      const entity = camera?.entity || "";
      const cache = this._camCache[entity];
      if (!entity || !cache?.clientId || !cache?.cam) continue;
      let reviews = [];
      try {
        const batch = await this._ws({
          type: "frigate/reviews/get",
          instance_id: cache.clientId,
          cameras: [cache.cam],
          after,
          before,
          limit: 5,
        });
        reviews = Array.isArray(batch) ? batch : [];
      } catch (_) {
        reviews = [];
      }
      cache.reviews = reviews;
      for (const review of reviews) {
        if (!this._isPreviewReviewFresh(review)) continue;
        const severity = this._normalizeReviewSeverity(review);
        if (!this._shouldHandleSlideshowReview(entity, severity)) continue;
        const reviewId = String(review?.id || "").trim();
        if (reviewId && this._previewHandledReviewIds.has(reviewId)) continue;
        candidates.push({
          entity,
          severity,
          reviewId,
          startTime: this._reviewStartTimeSec(review),
        });
        break;
      }
    }
    if (!candidates.length) return;
    candidates.sort((a, b) => b.startTime - a.startTime);
    const next = candidates[0];
    if (!next?.entity) return;
    if (next.reviewId) this._rememberHandledPreviewReview(next.reviewId);
    this._markPreviewAlertCamera(
      next.entity,
      next.severity,
      PREVIEW_ALERT_HOLD_MS,
    );
  },

  _schedulePreviewAlertWatch(delayMs = null) {
    if (this._previewAlertWatchT) clearTimeout(this._previewAlertWatchT);
    if (!this._isPreviewPageActive()) return;
    const wait =
      delayMs == null
        ? Math.max(
            1200,
            Math.floor(this._effectiveRealtimePollSeconds() * 1000),
          )
        : Math.max(0, Number(delayMs) || 0);
    this._previewAlertWatchT = setTimeout(() => {
      this._previewAlertWatchT = null;
      void this._probeLatestPreviewAlert().finally(() => {
        this._schedulePreviewAlertWatch();
      });
    }, wait);
  },

  _handlePreviewRealtimeMessage(msg) {
    if (!this._isPreviewPageActive()) return;
    const incomingCam = this._extractRealtimeMessageCamera(msg);
    if (!incomingCam) return;
    const cam = this._cameraEntityForIncomingCamera(incomingCam);
    if (!cam) return;
    const type = String(msg?.type || "")
      .trim()
      .toLowerCase();
    const severity = this._extractRealtimeMessageSeverity(msg);
    if (type === "end") {
      if (this._isPreviewCameraAlertLive(cam)) {
        this._markPreviewAlertCamera(
          cam,
          this._previewCellSeverity(cam),
          PREVIEW_ALERT_END_GRACE_MS,
        );
      }
      return;
    }
    if (!this._shouldHandleSlideshowReview(cam, severity)) return;
    this._markPreviewAlertCamera(
      cam,
      severity || "alert",
      PREVIEW_ALERT_HOLD_MS,
    );
  },

  _startPreviewMode() {
    if (!this._isPreviewPageActive()) return;
    this._previewStartedAtSec = Math.floor(Date.now() / 1000);
    this._clearPreviewTimers();
    this._clearPreviewAlertTracking();
    this._renderPreviewPage();
    this._schedulePreviewAlertWatch(350);
  },

  _stopPreviewMode() {
    this._clearPreviewTimers();
    this._teardownPreviewMedia();
  },

  _exitPreviewPageToCamera(idx) {
    if (!this._isPreviewPageActive()) return;
    if (
      !Number.isInteger(idx) ||
      idx < 0 ||
      idx >= (this._config?.cameras?.length || 0)
    ) {
      return;
    }
    const targetPageId = this._isPageRouteAvailable(this._lastNonPreviewPageId)
      ? this._lastNonPreviewPageId
      : PAGE_IDS.singleView;
    this._navigateToPageRoute(targetPageId, {
      source: "preview-camera-select",
      deferCameraSwitch: true,
    });
    if (this._activeCamIdx === idx) this._activeCamIdx = -1;
    void this._switchCamera(idx, { source: "manual" });
  },

  _returnToPreviewPage() {
    if (!this._isPreviewPageEnabled() || this._isPreviewPageActive()) return;
    this._navigateToPageRoute(PAGE_IDS.preview, {
      source: "preview-page-return",
    });
  },
};
