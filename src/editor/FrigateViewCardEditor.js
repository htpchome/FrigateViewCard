import {
  VERSION,
  CARD_TAG,
  DAY,
  RECORDINGS_WINDOW,
  EVENT_FETCH_BATCH,
  INITIAL_EVENT_FETCH_LIMIT,
  INACTIVE_WARM_EVENT_LIMIT,
  REVIEW_FETCH_BATCH,
  WINDOW_FETCH_PAGE_LIMIT,
  INITIAL_EVENTS_PAGE_LIMIT,
  WINDOW_BACKGROUND_PAGE_LIMIT,
  REALTIME_HEAD_POLL_MS,
  REALTIME_RELOAD_DEBOUNCE_MS,
  REALTIME_POLL_OPTIONS_SECONDS,
  MOBILE_BATTERY_SAVER_POLL_SECONDS,
  SNAPSHOT_UPDATE_SECONDS,
  SLIDESHOW_ROTATION_OPTIONS_SECONDS,
  GRID_ROTATION_OPTIONS_SECONDS,
  SLIDESHOW_ALERT_HOLD_MS,
  SLIDESHOW_REVIEW_FRESHNESS_GRACE_SEC,
  SLIDESHOW_REVIEW_WATCH_MIN_MS,
  SLIDESHOW_REVIEW_WATCH_MAX_MS,
  GRID_ALERT_HOLD_MS,
  PREVIEW_ALERT_HOLD_MS,
  PREVIEW_ALERT_END_GRACE_MS,
  MSE_SWITCH_GRACE_MS,
  MSE_SWITCH_GRACE_MAX,
  MAX_CAMERAS,
  DEFAULT_CAMERA_CONNECTION_TYPE,
  ALLOWED_HIDDEN_TABS,
  THEME_DEFAULTS,
  THEME_CUSTOM_ROWS,
  THEME_CUSTOM_KEYS,
} from "../constants.js";
import { ICONS } from "../icons.js";
import {
  detectDeviceProfile,
  DEVICE_PROFILE,
  isIOS,
  isAndroid,
  cap,
  parseWs,
  normalizePositiveInteger,
  normalizeCameraConnectionType,
  normalizeAlertsAreaContent,
  normalizeDisableHlsDesktop,
  normalizeHexColor,
  DIALOG_ACTION_SELECTOR,
  resolveActiveTab,
  setSettingsPanelActiveState,
  dialogActionKindFromElement,
  dialogActionKindFromEvent,
  wireCameraRowDragAndDrop,
  setFieldErrorState,
  bindNumericInputField,
  bindSelectorSyncEvents,
  setupSelectSelector,
  setupEntitySelector,
  bindThemeControlEvents,
  bindClickHandler,
  bindClickHandlers,
  bindEachClickHandler,
  bindEventsForIds,
  bindEventsForSelectorAll,
  buildEditorConfigFromDom,
  resolveSwitchChecked,
  LABEL_COLORS,
  PALETTE,
  labelColor,
  CAM_COLORS,
  mkCamState,
  camDisplayName,
  normalizeCameraConfig,
  configuredCameraEntities,
  hassThemeSignature,
  hassEntityStateSignature,
} from "../helpers.js";
import {
  hasCameraPtz,
  hasPtzPanTiltCapability,
  normalizeCameraPtzConfig,
} from "../features/ptz/index.js";
import { hasTwoWayTalkCapability } from "../features/two-way-talk/index.js";
import {
  DEVICE_ROUTE_BUCKETS,
  getEnabledPageRoutes,
  normalizePageRoute,
  PAGE_IDS,
} from "../features/navigation/router.js";
import { normalizeCardConfig } from "../config/card-config.js";
import { createEditorPreviewDraft } from "../config/preview-mapper.js";
import {
  compactEditorConfigForYaml,
  withCardTypeForYaml,
} from "../config/yaml-mapper.js";
export class FrigateViewCardEditor extends HTMLElement {
  _cameraStateAttributes(entity) {
    const targetEntity = String(entity || "").trim();
    if (!targetEntity) return {};
    return this._hass?.states?.[targetEntity]?.attributes || {};
  }

  _cameraCapabilityTokens(attrs = {}) {
    const tokens = [];
    const pushTokens = (value) => {
      if (Array.isArray(value)) {
        value.forEach((entry) => pushTokens(entry));
        return;
      }
      if (typeof value === "string") {
        tokens.push(value);
      }
    };

    pushTokens(attrs?.features);
    pushTokens(attrs?.capabilities);
    pushTokens(attrs?.actions);
    pushTokens(attrs?.supported_features_list);

    return tokens.map((value) =>
      String(value || "")
        .trim()
        .toLowerCase(),
    );
  }

  _hasBooleanCapability(attrs = {}, keys = []) {
    return keys.some((key) => attrs?.[key] === true);
  }

  _hasTokenCapability(attrs = {}, allowedTokens = []) {
    const allowed = new Set(allowedTokens);
    return this._cameraCapabilityTokens(attrs).some((token) =>
      allowed.has(token),
    );
  }

  _hasHaDirectPtzCapability(attrs = {}) {
    if (
      this._hasBooleanCapability(attrs, [
        "ptz",
        "ptz_supported",
        "supports_ptz",
        "can_ptz",
        "can_pan_tilt",
      ])
    ) {
      return true;
    }

    return this._hasTokenCapability(attrs, [
      "ptz",
      "pt",
      "pt-r",
      "pan",
      "tilt",
      "zoom",
    ]);
  }

  _hasHaDirectTwoWayTalkCapability(attrs = {}) {
    if (
      this._hasBooleanCapability(attrs, [
        "two_way_talk",
        "twoWayTalk",
        "supports_two_way_talk",
        "two_way_audio",
        "supports_two_way_audio",
        "audio_output",
        "audio_out",
        "talk",
        "microphone",
      ])
    ) {
      return true;
    }

    return this._hasTokenCapability(attrs, [
      "talk",
      "two_way_talk",
      "two-way-talk",
      "two_way_audio",
      "audio_output",
      "audio-out",
      "audio_out",
      "mic",
      "microphone",
      "speaker",
      "backchannel",
    ]);
  }

  _ensurePtzCapabilityCache() {
    if (!(this._ptzCapabilityCache instanceof Map)) {
      this._ptzCapabilityCache = new Map();
    }
  }

  _ensureGo2RtcMetadataCache() {
    if (!(this._go2rtcMetadataCache instanceof Map)) {
      this._go2rtcMetadataCache = new Map();
    }
  }

  _cameraEntityCapabilityLookupContext(entity) {
    const state = this._hass?.states?.[entity];
    if (!state) return null;
    const attrs = state.attributes || {};
    const instanceId = attrs.client_id || attrs.mqtt_client_id || "";
    const cameraName = attrs.camera_name || entity.replace(/^camera\./, "");
    if (!instanceId || !cameraName) return null;
    return { instanceId, cameraName };
  }

  async _fetchPtzCapabilityForEntity(entity) {
    const targetEntity = String(entity || "").trim();
    if (!targetEntity || !this._hass?.callWS) return null;
    this._ensurePtzCapabilityCache();
    const cached = this._ptzCapabilityCache.get(targetEntity);
    if (cached?.resolved) return cached.info;
    if (cached?.promise) return cached.promise;

    const context = this._cameraEntityCapabilityLookupContext(targetEntity);
    if (!context) {
      const empty = { resolved: true, info: null, promise: null };
      this._ptzCapabilityCache.set(targetEntity, empty);
      return null;
    }

    const entry = { resolved: false, info: null, promise: null };
    entry.promise = (async () => {
      try {
        const result = parseWs(
          await this._hass.callWS({
            type: "frigate/ptz/info",
            instance_id: context.instanceId,
            camera: context.cameraName,
          }),
        );
        entry.info = Array.isArray(result) ? result[0] || null : result || null;
      } catch (error) {
        console.warn("[Frigate] Editor PTZ info fetch failed", error);
        entry.info = null;
      } finally {
        entry.resolved = true;
        entry.promise = null;
      }
      return entry.info;
    })();

    this._ptzCapabilityCache.set(targetEntity, entry);
    return entry.promise;
  }

  async _fetchGo2RtcStreamMetadataForEntity(entity) {
    const targetEntity = String(entity || "").trim();
    if (!targetEntity || !this._hass?.callWS) return null;
    this._ensureGo2RtcMetadataCache();
    const cached = this._go2rtcMetadataCache.get(targetEntity);
    if (cached?.resolved) return cached.info;
    if (cached?.promise) return cached.promise;

    const context = this._cameraEntityCapabilityLookupContext(targetEntity);
    if (!context) {
      const empty = { resolved: true, info: null, promise: null };
      this._go2rtcMetadataCache.set(targetEntity, empty);
      return null;
    }

    const entry = { resolved: false, info: null, promise: null };
    entry.promise = (async () => {
      try {
        const path = `/api/frigate/${encodeURIComponent(context.instanceId)}/go2rtc/api/streams?src=${encodeURIComponent(context.cameraName)}&video=all&audio=all&microphone`;
        const signed = await this._hass.callWS({
          type: "auth/sign_path",
          path,
          expires: 3600,
        });
        const signedPath = signed?.path || path;
        const response = await fetch(`${window.location.origin}${signedPath}`, {
          method: "GET",
          cache: "no-store",
          credentials: "same-origin",
        });
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        entry.info = await response.json();
      } catch (error) {
        console.warn("[Frigate] Editor go2rtc metadata fetch failed", error);
        entry.info = null;
      } finally {
        entry.resolved = true;
        entry.promise = null;
      }
      return entry.info;
    })();

    this._go2rtcMetadataCache.set(targetEntity, entry);
    return entry.promise;
  }

  _setCameraModalPtzSpeedOutput(value) {
    const output = this.querySelector("#camera-modal-ptz-speed-output");
    if (!output) return;
    const numeric = Number(value);
    output.textContent = Number.isFinite(numeric)
      ? `Current speed: ${numeric.toFixed(1)}`
      : "Current speed: 0.5";
  }

  _setRangeValueOutput(selector, value, suffix = "") {
    const output = this.querySelector(`${selector}-output`);
    if (!output) return;
    const numeric = Number(value);
    output.textContent = Number.isFinite(numeric)
      ? `${numeric}${suffix}`
      : output.textContent;
  }

  _syncCameraModalPtzVisibility({
    supported = false,
    loading = false,
    sourceType = DEFAULT_CAMERA_CONNECTION_TYPE,
    preserveSelection = false,
  } = {}) {
    const toggleRow = this.querySelector("#camera-modal-ptz-toggle-row");
    const configRow = this.querySelector("#camera-modal-ptz-config");
    const stateMessage = this.querySelector("#camera-modal-ptz-state");
    const ptzEnabled = this.querySelector("#camera-modal-ptz-enabled");
    const speedRow = this.querySelector("#camera-modal-ptz-speed-row");

    if (toggleRow) {
      toggleRow.style.display = supported || loading ? "block" : "none";
    }
    if (ptzEnabled) {
      ptzEnabled.disabled = !supported || loading;
      ptzEnabled.dataset.supported = supported ? "true" : "false";
      if (!supported && !loading && !preserveSelection)
        ptzEnabled.checked = false;
    }
    const sourceLabel =
      normalizeCameraConnectionType(sourceType) === "ha_direct"
        ? "Home Assistant"
        : "Frigate";

    if (stateMessage) {
      if (loading) {
        stateMessage.style.display = "block";
        stateMessage.textContent = `Checking ${sourceLabel} PTZ support for this camera.`;
      } else if (!supported) {
        stateMessage.style.display = "block";
        stateMessage.textContent = `${sourceLabel} did not report PTZ pan/tilt support for this camera.`;
      } else {
        stateMessage.style.display = "none";
        stateMessage.textContent = "";
      }
    }

    const showConfig = (supported || loading) && ptzEnabled?.checked === true;
    if (configRow) configRow.style.display = showConfig ? "block" : "none";
    if (speedRow) speedRow.style.display = showConfig ? "block" : "none";
  }

  _syncCameraModalTwoWayTalkVisibility({
    supported = false,
    loading = false,
    sourceType = DEFAULT_CAMERA_CONNECTION_TYPE,
    preserveSelection = false,
  } = {}) {
    const twoWayTalkToggleRow = this.querySelector(
      "#camera-modal-two-way-talk-toggle-row",
    );
    const twoWayTalkEnabled = this.querySelector(
      "#camera-modal-two-way-talk-enabled",
    );
    const twoWayTalkStateMessage = this.querySelector(
      "#camera-modal-two-way-talk-state",
    );
    const sourceLabel =
      normalizeCameraConnectionType(sourceType) === "ha_direct"
        ? "Home Assistant"
        : "Frigate";
    const showToggle = supported || loading || preserveSelection;
    const allowSelection = supported || preserveSelection;

    if (twoWayTalkToggleRow) {
      twoWayTalkToggleRow.style.display = showToggle ? "block" : "none";
    }
    if (twoWayTalkStateMessage) {
      if (loading) {
        twoWayTalkStateMessage.style.display = "block";
        twoWayTalkStateMessage.textContent = `Checking ${sourceLabel} two-way talk support for this camera.`;
      } else if (!supported) {
        twoWayTalkStateMessage.style.display = "block";
        twoWayTalkStateMessage.textContent = `${sourceLabel} did not report two-way talk support for this camera.`;
      } else {
        twoWayTalkStateMessage.style.display = "none";
        twoWayTalkStateMessage.textContent = "";
      }
    }
    if (twoWayTalkEnabled) {
      twoWayTalkEnabled.dataset.supported = supported ? "true" : "false";
      twoWayTalkEnabled.disabled = !allowSelection || loading;
      if (!supported && !loading && !preserveSelection) {
        twoWayTalkEnabled.checked = false;
      }
    }
  }

  async _refreshCameraModalPtzSupport() {
    const entity = this._cameraModalEntityValue();
    const sourceType = this._cameraModalConnectionTypeValue();
    const normalizedSourceType = normalizeCameraConnectionType(sourceType);
    const isHaDirect = normalizedSourceType === "ha_direct";
    if (!entity) {
      this._syncCameraModalPtzVisibility({
        supported: false,
        loading: false,
        sourceType: normalizedSourceType,
      });
      return;
    }

    if (isHaDirect) {
      const attrs = this._cameraStateAttributes(entity);
      const ptzSupported = this._hasHaDirectPtzCapability(attrs);
      this._syncCameraModalPtzVisibility({
        supported: ptzSupported,
        loading: false,
        sourceType: normalizedSourceType,
        preserveSelection: ptzSupported,
      });
      return;
    }

    this._syncCameraModalPtzVisibility({
      supported: false,
      loading: true,
      sourceType: normalizedSourceType,
      preserveSelection: true,
    });
    const token = (this._cameraModalPtzToken || 0) + 1;
    this._cameraModalPtzToken = token;
    const ptzInfo = await this._fetchPtzCapabilityForEntity(entity);
    if (this._cameraModalPtzToken !== token) return;
    const ptzSupported = hasPtzPanTiltCapability(ptzInfo);
    this._syncCameraModalPtzVisibility({
      supported: ptzSupported,
      loading: false,
      sourceType: normalizedSourceType,
      preserveSelection: ptzSupported,
    });
  }

  async _refreshCameraModalTwoWayTalkSupport() {
    const entity = this._cameraModalEntityValue();
    const sourceType = this._cameraModalConnectionTypeValue();
    const normalizedSourceType = normalizeCameraConnectionType(sourceType);
    const isHaDirect = normalizedSourceType === "ha_direct";
    if (!entity) {
      this._syncCameraModalTwoWayTalkVisibility({
        supported: false,
        loading: false,
        sourceType: normalizedSourceType,
      });
      return;
    }

    if (isHaDirect) {
      const attrs = this._cameraStateAttributes(entity);
      const twoWayTalkSupported = this._hasHaDirectTwoWayTalkCapability(attrs);
      this._syncCameraModalTwoWayTalkVisibility({
        supported: twoWayTalkSupported,
        loading: false,
        sourceType: normalizedSourceType,
        preserveSelection: twoWayTalkSupported,
      });
      return;
    }

    this._syncCameraModalTwoWayTalkVisibility({
      supported: false,
      loading: true,
      sourceType: normalizedSourceType,
      preserveSelection: true,
    });
    const token = (this._cameraModalTwoWayTalkToken || 0) + 1;
    this._cameraModalTwoWayTalkToken = token;
    const go2rtcStreamInfo =
      await this._fetchGo2RtcStreamMetadataForEntity(entity);
    if (this._cameraModalTwoWayTalkToken !== token) return;
    const twoWayTalkSupported = hasTwoWayTalkCapability(go2rtcStreamInfo);
    this._syncCameraModalTwoWayTalkVisibility({
      supported: twoWayTalkSupported,
      loading: false,
      sourceType: normalizedSourceType,
      preserveSelection: twoWayTalkSupported,
    });
  }

  _normalizeHiddenTabs(hiddenTabs) {
    if (!Array.isArray(hiddenTabs)) return [];
    return hiddenTabs
      .map((id) => (id === "reviews" ? "alerts" : id))
      .filter((id) => ALLOWED_HIDDEN_TABS.includes(id));
  }

  _syncHiddenTabsDraftFromConfig(config = this._config) {
    this._hiddenTabsDraft = this._normalizeHiddenTabs(config?.hidden_tabs);
  }

  _isTabVisibleFromEvent(event) {
    const detailValue = event?.detail?.value;
    if (typeof detailValue === "boolean") return detailValue;
    const target = event?.currentTarget || event?.target;
    return resolveSwitchChecked(target);
  }

  _setHiddenTabFromToggle(tabId, isVisible) {
    if (!ALLOWED_HIDDEN_TABS.includes(tabId)) return;
    const hidden = new Set(this._normalizeHiddenTabs(this._hiddenTabsDraft));
    if (isVisible) hidden.delete(tabId);
    else hidden.add(tabId);
    this._hiddenTabsDraft = [...hidden];
  }

  disconnectedCallback() {
    if (Array.isArray(this._boundDialogActionButtons)) {
      this._boundDialogActionButtons.forEach(({ element, handler }) => {
        element?.removeEventListener?.("click", handler, true);
      });
    }
    this._boundDialogActionButtons = [];
    if (this._onDialogPrimaryActionClick) {
      document.removeEventListener(
        "click",
        this._onDialogPrimaryActionClick,
        true,
      );
    }
    if (this._onDialogSecondaryActionClick) {
      document.removeEventListener(
        "click",
        this._onDialogSecondaryActionClick,
        true,
      );
    }
    this._dialogActionHooksBound = false;
    this._emitPreviewDraft(null);
  }

  _configSignature(config) {
    try {
      return JSON.stringify(config || {});
    } catch (_) {
      return "";
    }
  }

  setConfig(config) {
    const normalized = this._normalizeConfig(config);
    this._syncHiddenTabsDraftFromConfig(normalized);
    if (this._activeSettingsPanelId === undefined) {
      this._activeSettingsPanelId = "camera";
    }
    const incomingSig = this._configSignature(normalized);
    const currentSig = this._configSignature(this._config);
    if (this._rendered && incomingSig === currentSig) {
      this._config = normalized;
      return;
    }
    this._config = normalized;
    this._rendered = true;
    this._render();
  }

  set hass(hass) {
    this._hass = hass;
    if (this._ptzCapabilityCache instanceof Map) {
      this._ptzCapabilityCache.clear();
    }
    if (this._go2rtcMetadataCache instanceof Map) {
      this._go2rtcMetadataCache.clear();
    }
    const modeKey = this._hass?.themes?.darkMode ? "dark" : "light";
    const key = `${this._frigateEntities().join(",")}|${modeKey}`;
    if (key !== this._lastEntityKey) {
      this._lastEntityKey = key;
      if (this._rendered) this._render();
    }
  }

  _normalizeConfig(config) {
    return normalizeCardConfig(config);
  }

  _landingPageOptionSignature(config) {
    const normalized = this._normalizeConfig(config);
    const desktop = getEnabledPageRoutes(
      normalized,
      DEVICE_ROUTE_BUCKETS.desktop,
    ).join("|");
    const mobile = getEnabledPageRoutes(
      normalized,
      DEVICE_ROUTE_BUCKETS.mobile,
    ).join("|");
    return `${desktop}::${mobile}`;
  }

  _frigateEntities() {
    if (!this._hass) return [];
    return Object.keys(this._hass.states)
      .filter((e) => e.startsWith("camera."))
      .filter((e) => {
        const a = this._hass.states[e].attributes;
        return a?.client_id || a?.mqtt_client_id || a?.camera_name;
      })
      .sort();
  }

  _timezoneDisplay() {
    const tz = this._hass?.config?.time_zone || "UTC";
    try {
      const parts = new Intl.DateTimeFormat(undefined, {
        timeZone: tz,
        timeZoneName: "longGeneric",
      }).formatToParts(new Date());
      const tzName = parts.find((p) => p.type === "timeZoneName")?.value || tz;
      return `${tzName} (${tz})`;
    } catch (_) {
      return tz.replace(/_/g, " ");
    }
  }

  _defaultHostVh() {
    const headerH =
      parseFloat(
        getComputedStyle(document.documentElement).getPropertyValue(
          "--header-height",
        ),
      ) || 56;
    return Math.round(
      ((window.innerHeight - headerH) / window.innerHeight) * 100,
    );
  }

  _rgbToHex(value) {
    const m = String(value || "")
      .trim()
      .match(/^rgba?\((\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i);
    if (!m) return "";
    const toHex = (n) =>
      Math.max(0, Math.min(255, Number(n) || 0))
        .toString(16)
        .padStart(2, "0");
    return `#${toHex(m[1])}${toHex(m[2])}${toHex(m[3])}`;
  }

  _resolveColorToHex(cssValue, fallback = "#000000") {
    if (!cssValue) return fallback;
    const hex = normalizeHexColor(cssValue);
    if (hex) return hex;
    const probe = document.createElement("span");
    probe.style.color = String(cssValue);
    this.appendChild(probe);
    const computed = getComputedStyle(probe).color;
    probe.remove();
    return this._rgbToHex(computed) || fallback;
  }

  _themeDefaultHex(key) {
    return this._resolveColorToHex(THEME_DEFAULTS[key], "#000000");
  }

  _themeDefaultHexMap() {
    return Object.fromEntries(
      THEME_CUSTOM_ROWS.map((row) => [row.key, this._themeDefaultHex(row.key)]),
    );
  }

  _ensureThemeDraftCache() {
    if (!this._themeDraftCache || typeof this._themeDraftCache !== "object") {
      this._themeDraftCache = {};
    }
    if (this._config?.theme !== "custom") {
      this._themeDraftCache = {};
      return;
    }
    const custom = this._config?.theme_custom || {};
    for (const row of THEME_CUSTOM_ROWS) {
      const key = row.key;
      const v = normalizeHexColor(custom[key]);
      if (v) this._themeDraftCache[key] = v;
    }
  }

  _cameraLabel(camera) {
    const name = String(camera?.name || "").trim();
    if (name) return name;
    const entity = String(camera?.entity || "").trim();
    if (!entity) return "Select camera";
    return entity.replace(/^camera\./, "").replace(/_/g, " ");
  }

  _cameraConnectionLabel(value) {
    return normalizeCameraConnectionType(value) === "ha_direct"
      ? "HA direct"
      : "Frigate go2rtc";
  }

  _cameraAlertsContentLabel(value) {
    return normalizeAlertsAreaContent(value) === "all_reviews"
      ? "All reviews"
      : "Alerts only";
  }

  _cameraDesktopHlsLabel(value) {
    return normalizeDisableHlsDesktop(value)
      ? "Desktop HLS off"
      : "Desktop HLS on";
  }

  _cameraPtzLabel(value) {
    return hasCameraPtz({ ptz: value }) ? "PTZ on" : "PTZ off";
  }

  _cameraTwoWayTalkLabel(value) {
    return value === true ? "Two-way talk on" : "Two-way talk off";
  }

  _reorderCameras(from, to) {
    if (from === to || from < 0 || to < 0) return;
    const cur = [...this._getCams()];
    if (from >= cur.length || to >= cur.length) return;
    const [moved] = cur.splice(from, 1);
    cur.splice(to, 0, moved);
    this._config = { ...this._config, cameras: cur };
    this._render();
    this._dispatch();
  }

  _openCameraModal(index = null) {
    const cams = this._getCams();
    const cam =
      index == null
        ? {
            entity: "",
            name: "",
            connection_type: DEFAULT_CAMERA_CONNECTION_TYPE,
            alerts_content: "alerts_only",
            disable_hls_desktop: false,
            ptz: null,
          }
        : cams[index] || {};
    this._editingCamIndex = index;
    const title = this.querySelector("#camera-modal-title");
    const save = this.querySelector("#camera-modal-save");
    const modal = this.querySelector("#camera-modal");
    const name = this.querySelector("#camera-modal-name");
    const entity = this.querySelector("#camera-modal-entity");
    const connectionType = this.querySelector("#camera-modal-connection-type");
    const alertsContentAllReviews = this.querySelector(
      "#camera-modal-all-reviews",
    );
    const disableHlsDesktop = this.querySelector(
      "#camera-modal-disable-hls-desktop",
    );
    const ptzEnabled = this.querySelector("#camera-modal-ptz-enabled");
    const ptzSpeed = this.querySelector("#camera-modal-ptz-speed");
    const twoWayTalkEnabled = this.querySelector(
      "#camera-modal-two-way-talk-enabled",
    );
    const helper = this.querySelector("#camera-modal-helper");
    const normalizedPtz = normalizeCameraPtzConfig(cam?.ptz);
    const selectedConnectionType = normalizeCameraConnectionType(
      cam?.connection_type,
    );
    if (title) title.textContent = index == null ? "Add" : "Edit";
    if (save) save.textContent = index == null ? "Add" : "Save";
    if (name) name.value = cam?.name || "";
    if (entity) {
      entity.value = cam?.entity || "";
      entity.dataset.value = cam?.entity || "";
    }
    if (connectionType) {
      const nextType = normalizeCameraConnectionType(cam?.connection_type);
      connectionType.value = nextType;
      connectionType.dataset.value = nextType;
    }
    if (alertsContentAllReviews) {
      alertsContentAllReviews.checked =
        normalizeAlertsAreaContent(cam?.alerts_content) === "all_reviews";
    }
    if (disableHlsDesktop) {
      disableHlsDesktop.checked =
        normalizeDisableHlsDesktop(cam?.disable_hls_desktop) === true;
    }
    if (ptzEnabled) {
      ptzEnabled.checked = hasCameraPtz(cam);
    }
    if (ptzSpeed) {
      ptzSpeed.value = String(normalizedPtz?.speed ?? 0.5);
      this._setCameraModalPtzSpeedOutput(ptzSpeed.value);
    }
    if (twoWayTalkEnabled) {
      twoWayTalkEnabled.checked = cam?.two_way_talk === true;
    }
    if (helper) helper.textContent = "";
    if (modal) modal.classList.remove("hidden");
    this._syncCameraModalPtzVisibility({
      supported: hasCameraPtz(cam),
      loading: !!cam?.entity,
      sourceType: selectedConnectionType,
      preserveSelection: hasCameraPtz(cam),
    });
    this._syncCameraModalTwoWayTalkVisibility({
      supported: false,
      loading: !!cam?.entity,
      sourceType: selectedConnectionType,
      preserveSelection: cam?.two_way_talk === true,
    });
    void this._refreshCameraModalPtzSupport();
    void this._refreshCameraModalTwoWayTalkSupport();
  }

  _closeCameraModal() {
    const modal = this.querySelector("#camera-modal");
    if (modal) modal.classList.add("hidden");
    this._editingCamIndex = null;
  }

  _cameraModalEntityValue() {
    const entity = this.querySelector("#camera-modal-entity");
    return (entity?.dataset?.value || entity?.value || entity?.__value || "")
      .toString()
      .trim();
  }

  _cameraModalConnectionTypeValue() {
    const connectionType = this.querySelector("#camera-modal-connection-type");
    return normalizeCameraConnectionType(
      connectionType?.dataset?.value ||
        connectionType?.value ||
        DEFAULT_CAMERA_CONNECTION_TYPE,
    );
  }

  _saveCameraModal() {
    const entity = this._cameraModalEntityValue();
    const name = (
      this.querySelector("#camera-modal-name")?.value || ""
    ).toString();
    const connectionType = normalizeCameraConnectionType(
      this.querySelector("#camera-modal-connection-type")?.dataset?.value ||
        this.querySelector("#camera-modal-connection-type")?.value ||
        DEFAULT_CAMERA_CONNECTION_TYPE,
    );
    const alertsContentToggle = this.querySelector("#camera-modal-all-reviews");
    const disableHlsDesktopToggle = this.querySelector(
      "#camera-modal-disable-hls-desktop",
    );
    const ptzEnabledToggle = this.querySelector("#camera-modal-ptz-enabled");
    const twoWayTalkToggle = this.querySelector(
      "#camera-modal-two-way-talk-enabled",
    );
    const alertsContent =
      resolveSwitchChecked(alertsContentToggle) === true
        ? "all_reviews"
        : "alerts_only";
    const disableHlsDesktop = resolveSwitchChecked(disableHlsDesktopToggle);
    const ptzSupported = ptzEnabledToggle?.dataset?.supported === "true";
    const ptzEnabled = ptzSupported && resolveSwitchChecked(ptzEnabledToggle);
    const ptzSpeed =
      this.querySelector("#camera-modal-ptz-speed")?.value || "0.5";
    const twoWayTalkEnabled = resolveSwitchChecked(twoWayTalkToggle);
    const ptz = ptzEnabled
      ? normalizeCameraPtzConfig({
          enabled: true,
          speed: ptzSpeed,
        })
      : null;
    const helper = this.querySelector("#camera-modal-helper");
    if (!entity) {
      if (helper) helper.textContent = "Camera is required.";
      return;
    }
    const cur = [...this._getCams()];
    if (this._editingCamIndex == null) {
      if (cur.length >= MAX_CAMERAS) {
        if (helper) helper.textContent = `Maximum ${MAX_CAMERAS} cameras.`;
        return;
      }
      cur.push({
        entity,
        name,
        connection_type: connectionType,
        alerts_content: alertsContent,
        disable_hls_desktop: disableHlsDesktop,
        ptz,
        ...(twoWayTalkEnabled ? { two_way_talk: true } : {}),
      });
    } else if (cur[this._editingCamIndex]) {
      cur[this._editingCamIndex] = {
        entity,
        name,
        connection_type: connectionType,
        alerts_content: alertsContent,
        disable_hls_desktop: disableHlsDesktop,
        ptz,
        ...(twoWayTalkEnabled ? { two_way_talk: true } : {}),
      };
    }
    this._config = { ...this._config, cameras: cur.slice(0, MAX_CAMERAS) };
    this._closeCameraModal();
    this._render();
    this._dispatch();
  }

  _removeCamera(index) {
    const cur = [...this._getCams()];
    cur.splice(index, 1);
    this._config = { ...this._config, cameras: cur };
    this._render();
    this._dispatch();
  }

  _wireCameraDragAndDrop() {
    const rows = Array.from(this.querySelectorAll(".cam-row"));
    wireCameraRowDragAndDrop({
      rows,
      clearDropTargets: () => {
        this.querySelectorAll(".cam-row").forEach((row) => {
          row.classList.remove("drop-target");
        });
      },
      onReorder: (fromIndex, toIndex) => {
        this._reorderCameras(fromIndex, toIndex);
      },
    });
  }
  _renderSettingsPanel({ id, title, icon, content, active = false }) {
    return `<section class="settings-panel ${active ? "active" : ""}" data-panel="${id}">
      <button type="button" class="setting-title" data-panel-toggle="${id}" aria-expanded="${active ? "true" : "false"}">
        <ha-icon icon="${icon}"></ha-icon>
        <h3>${title}</h3>
      </button>
      <div class="setting-content">${content}</div>
    </section>`;
  }

  _wireSettingsPanels() {
    const panels = Array.from(this.querySelectorAll(".settings-panel"));
    if (!panels.length) return;

    const setActive = (activePanel) => {
      this._activeSettingsPanelId = setSettingsPanelActiveState(
        panels,
        activePanel,
      );
    };

    panels.forEach((panel) => {
      panel
        .querySelector("[data-panel-toggle]")
        ?.addEventListener("click", () => {
          if (panel.classList.contains("active")) {
            setActive(null);
          } else {
            setActive(panel);
          }
        });
    });

    const initial = panels.find(
      (panel) => panel.dataset.panel === this._activeSettingsPanelId,
    );
    setActive(initial || null);
  }

  _wireEditorDialogActions() {
    if (this._dialogActionHooksBound) return;

    const bindDialogActionButtons = () => {
      this._boundDialogActionButtons = [];
      const seenRoots = new Set();
      let node = this;
      let depth = 0;
      while (node && depth < 8) {
        const root = node.getRootNode?.();
        if (root instanceof ShadowRoot && !seenRoots.has(root)) {
          seenRoots.add(root);
          root.querySelectorAll(DIALOG_ACTION_SELECTOR).forEach((button) => {
            const kind = dialogActionKindFromElement(button);
            if (!kind) return;
            const handler = () => {
              if (kind === "primary") {
                if (this._hasVisualDraft) {
                  this._dispatch();
                  this._hasVisualDraft = false;
                }
                this._emitPreviewDraft(null);
                return;
              }
              this._hasVisualDraft = false;
              this._emitPreviewDraft(null);
            };
            button.addEventListener("click", handler, true);
            this._boundDialogActionButtons.push({ element: button, handler });
          });
        }
        node = node.parentNode || node.host;
        depth += 1;
      }
    };

    this._onDialogPrimaryActionClick = (ev) => {
      if (dialogActionKindFromEvent(ev) !== "primary") return;
      if (this._hasVisualDraft) {
        this._dispatch();
        this._hasVisualDraft = false;
      }
      this._emitPreviewDraft(null);
    };

    this._onDialogSecondaryActionClick = (ev) => {
      if (dialogActionKindFromEvent(ev) !== "secondary") return;
      this._hasVisualDraft = false;
      this._emitPreviewDraft(null);
    };

    document.addEventListener("click", this._onDialogPrimaryActionClick, true);
    document.addEventListener(
      "click",
      this._onDialogSecondaryActionClick,
      true,
    );
    bindDialogActionButtons();
    this._dialogActionHooksBound = true;
  }

  _wireLivePreviewUpdates() {
    if (this._livePreviewHooksBound) return;

    const previewUpdateSelectors = [
      "#title",
      "#subtitle",
      "#window_days",
      "#alerts_reviews_days",
      "#realtime_poll_seconds",
      "#snapshot_update_seconds",
      "#slideshow_rotation_enabled",
      "#slideshow_rotation_seconds",
      "#slideshow_alert_hold_seconds",
      "#grid_mode_enabled",
      "#grid_start_in_grid_enabled",
      "#grid_live_view_enabled",
      "#grid_rotation_seconds",
      "#grid_alert_hold_seconds",
      "#mobile_view_page_enabled",
      "#preview_page_enabled",
      "#preview_page_live_cameras",
      "#preview_page_alert_live_duration_seconds",
      "#preview_page_show_title_bars",
      "#wide_view_page_enabled",
      "#wide_view_live_cameras",
      "#wide_view_alert_takeover",
      "#landing_page",
      "#mobile_page",
      "#stream_height",
      "#stream_height_unit",
      "#col_left_width_pct",
      "#tight_margins",
      "#shadows",
      "#borders",
      "#rounded_corners",
      "#outer_shadows",
      "#mobile_poll_battery_saver",
      "[data-active-tab]",
      "[data-theme-option]",
      "[data-theme-color]",
      "[data-theme-reset]",
      "[data-theme-default]",
    ];

    const shouldPreviewUpdate = (event) => {
      const path = Array.isArray(event.composedPath?.())
        ? event.composedPath()
        : [];
      return path.some(
        (node) =>
          node instanceof Element &&
          previewUpdateSelectors.some((selector) => node.matches?.(selector)),
      );
    };

    const handlePreviewUpdate = (event) => {
      if (!shouldPreviewUpdate(event)) return;
      if (this._livePreviewRaf) return;
      this._livePreviewRaf = requestAnimationFrame(() => {
        this._livePreviewRaf = 0;
        this._u({ dispatch: false, preview: true });
      });
    };

    ["input", "change", "value-changed", "selected-changed", "click"].forEach(
      (eventName) => {
        this.addEventListener(eventName, handlePreviewUpdate, true);
      },
    );

    this._livePreviewHooksBound = true;
  }

  _setEditorFieldError(selector, message) {
    setFieldErrorState(this, selector, message);
  }

  _validateEditorFields() {
    let valid = true;

    const windowDaysValue =
      this.querySelector("#window_days")?.dataset.value ||
      this.querySelector("#window_days")?.value ||
      "3";
    const windowDays = Number(windowDaysValue);
    const windowDaysMessage =
      Number.isInteger(windowDays) && windowDays >= 1 && windowDays <= 15
        ? ""
        : "Select a value from 1 to 15.";
    this._setEditorFieldError("#window_days", windowDaysMessage);
    if (windowDaysMessage) valid = false;

    const alertsReviewsDaysValue =
      this.querySelector("#alerts_reviews_days")?.dataset.value ||
      this.querySelector("#alerts_reviews_days")?.value ||
      "3";
    const alertsReviewsDays = Number(alertsReviewsDaysValue);
    const alertsReviewsDaysMessage =
      Number.isInteger(alertsReviewsDays) &&
      alertsReviewsDays >= 1 &&
      alertsReviewsDays <= 15
        ? ""
        : "Select a value from 1 to 15.";
    this._setEditorFieldError("#alerts_reviews_days", alertsReviewsDaysMessage);
    if (alertsReviewsDaysMessage) valid = false;

    const streamHeightRaw = String(
      this.querySelector("#stream_height")?.value || "",
    ).trim();
    const streamHeight = Number(streamHeightRaw);
    const streamHeightMessage =
      !streamHeightRaw ||
      (Number.isInteger(streamHeight) &&
        streamHeight >= 1 &&
        streamHeight <= 4000)
        ? ""
        : "Enter a whole number from 1 to 4000, or leave blank.";
    this._setEditorFieldError("#stream_height", streamHeightMessage);
    if (streamHeightMessage) valid = false;

    const wideViewEnabled =
      this.querySelector("#wide_view_page_enabled")?.checked === true;
    const colWidthRaw = String(
      this.querySelector("#col_left_width_pct")?.value || "",
    )
      .replace(/%/g, "")
      .trim();
    const colWidth = Number(colWidthRaw);
    const colWidthMessage =
      !wideViewEnabled ||
      (Number.isInteger(colWidth) && colWidth >= 10 && colWidth <= 90)
        ? ""
        : "Enter a whole number from 10 to 90.";
    this._setEditorFieldError("#col_left_width_pct", colWidthMessage);
    if (colWidthMessage) valid = false;

    return valid;
  }

  _bindNumericInput(selector, { onSanitize } = {}) {
    bindNumericInputField({ root: this, selector, onSanitize });
  }

  _render() {
    const frigEntities = this._frigateEntities();
    const cams = this._getCams();
    const canAddCamera = cams.length < MAX_CAMERAS;
    const timezoneDisplay = this._timezoneDisplay();
    const hiddenTabs = new Set(
      this._normalizeHiddenTabs(
        this._hiddenTabsDraft ?? this._config?.hidden_tabs,
      ),
    );
    this._ensureThemeDraftCache();
    const activeTheme = this._config?.theme === "custom" ? "custom" : "default";
    const themeCustom = this._config?.theme_custom || {};
    const themeCustomDefaults = this._config?.theme_custom_defaults || {};
    const pageRouteLabel = (pageId) => {
      if (pageId === PAGE_IDS.mobileView) return "Mobile";
      if (pageId === PAGE_IDS.preview) return "Preview";
      if (pageId === PAGE_IDS.wideView) return "Wide View";
      return "Single View";
    };
    const landingPageOptions = getEnabledPageRoutes(
      this._config,
      DEVICE_ROUTE_BUCKETS.desktop,
    ).map((pageId) => ({ value: pageId, label: pageRouteLabel(pageId) }));
    const mobilePageOptions = getEnabledPageRoutes(
      this._config,
      DEVICE_ROUTE_BUCKETS.mobile,
    ).map((pageId) => ({ value: pageId, label: pageRouteLabel(pageId) }));
    const tabToggle = (id, label) => `<ha-formfield label="${label}">
          <ha-switch data-active-tab="${id}" ${hiddenTabs.has(id) ? "" : "checked"}></ha-switch>
        </ha-formfield>`;
    const themeRows = THEME_CUSTOM_ROWS.map((row) => {
      const key = row.key;
      const defaultHex = this._themeDefaultHex(key);
      const saved = normalizeHexColor(themeCustom[key]);
      const draft = normalizeHexColor(this._themeDraftCache?.[key]);
      const value =
        activeTheme === "custom" ? saved || draft || defaultHex : defaultHex;
      const useDefault = themeCustomDefaults[key] === true;
      const visibleValue = useDefault ? defaultHex : value;
      const showWarn = !useDefault && visibleValue !== defaultHex;
      return `
        <div class="theme-custom-row" data-theme-row="${key}">
          <div class="theme-custom-label">
            <div>${row.label}</div>
            ${showWarn ? '<div class="theme-custom-warn">Draft changes require card config save.</div>' : ""}
          </div>
          <div class="theme-color-wrap">
            <input class="theme-color-input" type="color" data-theme-color="${key}" value="${visibleValue}" ${useDefault ? "disabled" : ""}>
            <button
              type="button"
              class="theme-color-reset"
              data-theme-reset="${key}"
              title="Reset to default color"
              aria-label="Reset to default color"
              ${useDefault ? "hidden" : ""}
            >
              <ha-icon icon="mdi:autorenew"></ha-icon>
            </button>
          </div>
          <ha-formfield label="Use Default">
            <ha-switch data-theme-default="${key}" ${useDefault ? "checked" : ""}></ha-switch>
          </ha-formfield>
        </div>`;
    }).join("");
    const cameraRows = cams
      .map(
        (cam, i) => `
      <div class="cam-row" draggable="true" data-row="${i}">
        <button class="cam-drag" type="button" title="Drag to reorder" aria-label="Drag to reorder"><ha-icon icon="mdi:drag-horizontal-variant"></ha-icon></button>
        <div><div class="cam-name">${this._cameraLabel(cam)}</div><div class="cam-meta">${this._cameraConnectionLabel(cam.connection_type)} · ${this._cameraAlertsContentLabel(cam.alerts_content)} · ${this._cameraDesktopHlsLabel(cam.disable_hls_desktop)} · ${this._cameraPtzLabel(cam.ptz)} · ${this._cameraTwoWayTalkLabel(cam.two_way_talk)}</div></div>
                <button class="cam-action" type="button" title="Edit" aria-label="Edit" data-edit-cam="${i}"><svg viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg"><path fill="currentColor" d="M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87M3,17.25V21H6.75L17.81,9.94L14.06,6.19L3,17.25Z" /></svg></button>
                <button class="cam-action" type="button" title="Delete" aria-label="Delete" data-remove-cam="${i}"><svg viewBox="0 0 24 24" style="width:24px; height:24px" fill="currentColor"><path d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z" /></svg></button>
      </div>`,
      )
      .join("");

    const cameraPanelContent = `
      <div>
        <span class="field-label">Cameras ${frigEntities.length ? '<small style="font-weight:400;color:var(--c-text2)">(Frigate cameras detected)</small>' : ""}</span>
        <div class="cam-wrap" id="cam-list">${cameraRows}</div>
        ${canAddCamera ? '<div class="cam-toolbar"><button id="camera-add" class="cam-add" type="button">Add</button></div>' : ""}
        <span class="cam-helper">Maximum ${MAX_CAMERAS} cameras.</span>
      </div>`;

    const generalPanelContent = `
      <ha-input label="Title" name="title" id="title" type="text" value="${this._config?.title || ""}" placeholder="My Camera"></ha-input>
      <ha-input label="Subtitle" name="subtitle" id="subtitle" type="text" value="${this._config?.subtitle || ""}" placeholder="Frigate"></ha-input>
      <div class="section">
        <div class="layout-row" style="align-items:flex-start;gap:12px;flex-wrap:wrap;justify-content:flex-start">
          <div style="min-width:160px;display:flex;flex-direction:column;gap:6px">
            <span class="field-label" style="margin:0">Event history days</span>
            <ha-selector id="window_days" style="width:160px"></ha-selector>
            <div class="field-helper" id="window_days-helper"></div>
          </div>
          <div style="min-width:160px;display:flex;flex-direction:column;gap:6px">
            <span class="field-label" style="margin:0">Alerts/Reviews Days</span>
            <ha-selector id="alerts_reviews_days" style="width:160px"></ha-selector>
            <div class="field-helper" id="alerts_reviews_days-helper"></div>
          </div>
        </div>
      </div>
      <div class="section">
        <div class="layout-row" style="align-items:flex-start;gap:12px;flex-wrap:wrap;justify-content:flex-start">
          <div style="min-width:160px;display:flex;flex-direction:column;gap:6px">
            <span class="field-label" style="margin:0">Realtime Update Poll</span>
            <ha-selector id="realtime_poll_seconds" style="width:160px"></ha-selector>
            <div class="field-helper">Lower values update faster but use more battery/data.</div>
          </div>
          <div style="display:flex;flex-direction:column;gap:6px;max-width:320px">
            <div class="layout-row" style="justify-content:flex-start;gap:8px">
              <span class="field-label" style="margin:0">Mobile Battery Saver</span>
              <ha-switch id="mobile_poll_battery_saver" ${this._config?.mobile_poll_battery_saver ? "checked" : ""}></ha-switch>
            </div>
            <div class="field-helper">On mobile-sized screens, use 10s polling to reduce battery use.</div>
          </div>
        </div>
        <div class="layout-row" style="align-items:flex-start;gap:12px;flex-wrap:wrap;justify-content:flex-start;margin-top:12px">
          <div id="snapshot_update_row" style="min-width:210px;display:flex;flex-direction:column;gap:6px;width:100%">
            <span class="field-label" style="margin:0">Snapshot Update Frequency</span>
            <input id="snapshot_update_seconds" type="range" min="10" max="240" step="1" value="${this._config?.snapshot_update_seconds ?? SNAPSHOT_UPDATE_SECONDS}" style="width:100%">
            <div class="field-helper">When Live View is disabled for a page, this determines how often a new snapshot is loaded.</div>
            <div class="field-helper" id="snapshot_update_seconds-output">${this._config?.snapshot_update_seconds ?? SNAPSHOT_UPDATE_SECONDS} seconds</div>
          </div>
        </div>
        <div class="layout-row" style="align-items:flex-start;gap:12px;flex-wrap:wrap;justify-content:flex-start;margin-top:12px">
          <div id="preview_alert_live_duration_row" style="min-width:210px;display:flex;flex-direction:column;gap:6px;width:100%">
            <span class="field-label" style="margin:0">Alert Camera Live Duration</span>
            <input id="preview_page_alert_live_duration_seconds" type="range" min="5" max="60" step="1" value="${this._config?.preview_page_alert_live_duration_seconds ?? 10}" style="width:100%">
            <div class="field-helper">How long an alerted snapshot camera remains live on Preview and in Wide View Companion Cameras.</div>
            <div class="field-helper" id="preview_page_alert_live_duration_seconds-output">${this._config?.preview_page_alert_live_duration_seconds ?? 10} seconds</div>
          </div>
        </div>
      </div>
      <div class="section">
        <div class="layout-row">
          <span class="field-label" style="margin:0">Timezone</span>
          <span class="readonly-value">${timezoneDisplay}</span>
        </div>
      </div>`;

    const themePanelContent = `
      <div class="section">
        <span class="field-label">Theme</span>
        <div class="theme-row">
          <div class="theme-seg" id="theme-seg" role="radiogroup" aria-label="Theme">
            <button type="button" class="theme-opt ${activeTheme === "default" ? "active" : ""}" data-theme-option="default" role="radio" aria-checked="${activeTheme === "default" ? "true" : "false"}">Home Assistant Theme</button>
            <button type="button" class="theme-opt ${activeTheme === "custom" ? "active" : ""}" data-theme-option="custom" role="radio" aria-checked="${activeTheme === "custom" ? "true" : "false"}">Custom</button>
          </div>
        </div>
        <details id="theme-custom-panel" class="theme-custom-panel" ${activeTheme === "custom" ? "open" : ""} ${activeTheme === "custom" ? "" : "hidden"}>
          <summary>Custom Color Overrides</summary>
          <div class="theme-custom-body">${themeRows}</div>
        </details>
      </div>`;

    const layoutPanelContent = `
      <div class="section">
        <span class="field-label">Active tabs</span>
        <div class="chk-row">
          ${tabToggle("alerts", "Alerts")}
          ${tabToggle("clips", "Clips")}
          ${tabToggle("snapshot", "Snapshots")}
          ${tabToggle("recordings", "Recordings")}
          ${tabToggle("kept", "Kept")}
        </div>
      </div>
      <div class="section">
        <span class="field-label">Card Height Limit</span>
        <div style="display:flex;gap:8px;align-items:center">
          <ha-input name="stream_height" id="stream_height" type="number" value="${this._config?.stream_height || ""}" min="1" placeholder="${this._defaultHostVh()}" style="flex:1"></ha-input>
          <ha-selector id="stream_height_unit" style="width:120px"></ha-selector>
        </div>
        <div class="field-helper" id="stream_height-helper"></div>
      </div>
      <div class="section">
        <div class="layout-row">
          <span class="field-label" style="margin:0">Tight Margins</span>
          <ha-switch id="tight_margins" ${this._config?.tight_margins ? "checked" : ""}></ha-switch>
        </div>
        <div class="field-helper">Enable or Disable Tight Margins.  This setting essentially removes the default Home Assistant Padding around an item in a Sections View.  Doing this allows the Card to span the full height of the available space.  This could be useful on phones or tablets.
        </div>
      </div>
      <div class="section">
        <div class="layout-row">
          <span class="field-label" style="margin:0">Shadows (Inside Card)</span>
          <ha-switch id="shadows" ${this._config?.shadows !== false ? "checked" : ""}></ha-switch>
        </div>
        <div class="field-helper">Enable or Disable Inner Shadows - these are the shadows around things like the events list items.  This could be useful on phones or tablets.
        </div>
      </div>
      <div class="section">
        <div class="layout-row">
          <span class="field-label" style="margin:0">Shadows (Outside Card)</span>
          <ha-switch id="outer_shadows" ${this._config?.outer_shadows !== false ? "checked" : ""}></ha-switch>
        </div>
        <div class="field-helper">Enable or Disable Outer Shadows - this is the shadow around the entire card.  This could be useful on phones or tablets.
        </div>
      </div>
      <div class="section">
        <div class="layout-row">
          <span class="field-label" style="margin:0">Borders on Event Items</span>
          <ha-switch id="borders" ${this._config?.borders !== false ? "checked" : ""}></ha-switch>
        </div>
        <div class="field-helper">Enable or Disable Borders on Event List Items.  This may be usefull if Shadows are disabled to visually seperate the event list items.
        </div>
      </div>
      <div class="section">
        <div class="layout-row">
          <span class="field-label" style="margin:0">Rounded Corners</span>
          <ha-switch id="rounded_corners" ${this._config?.rounded_corners !== false ? "checked" : ""}></ha-switch>
        </div>
        <div class="field-helper">Enable or Disable Rounded Corners.  This could be useful on phones or tablets.
        </div>
      </div>
      </div>`;
    const slideshowPanelContent = `
      <div class="section">
        <div class="layout-row" style="align-items:flex-start;gap:12px;flex-wrap:wrap;justify-content:flex-start">
          <div style="display:flex;flex-direction:column;gap:6px;max-width:420px">
            <div class="layout-row" style="justify-content:flex-start;gap:8px">
              <span class="field-label" style="margin:0">Slideshow Rotation</span>
              <ha-switch id="slideshow_rotation_enabled" ${this._config?.slideshow_rotation_enabled ? "checked" : ""}></ha-switch>
            </div>
            <div class="field-helper">Allow the live camera view to rotate at a fixed interval. This is not available on mobile phone devices.</div>
          </div>
          <div id="slideshow_rotation_row" style="min-width:210px;display:${this._config?.slideshow_rotation_enabled ? "flex" : "none"};flex-direction:column;gap:6px">
            <span class="field-label" style="margin:0">Slideshow Rotation Frequency</span>
            <ha-selector id="slideshow_rotation_seconds" style="width:210px"></ha-selector>
          </div>
        </div>
        <div class="layout-row" style="align-items:flex-start;gap:12px;flex-wrap:wrap;justify-content:flex-start;margin-top:12px">
          <div id="slideshow_alert_hold_row" style="min-width:210px;display:flex;flex-direction:column;gap:6px;width:100%">
            <span class="field-label" style="margin:0">Slideshow Alert Hold Duration</span>
            <input id="slideshow_alert_hold_seconds" type="range" min="5" max="60" step="1" value="${this._config?.slideshow_alert_hold_seconds ?? Math.round(SLIDESHOW_ALERT_HOLD_MS / 1000)}" style="width:100%">
            <div class="field-helper" id="slideshow_alert_hold_seconds-output">${this._config?.slideshow_alert_hold_seconds ?? Math.round(SLIDESHOW_ALERT_HOLD_MS / 1000)} seconds</div>
          </div>
        </div>
      </div>`;

    const previewPanelContent = `
      <div class="section" style="border-top:none;padding-top:0">
        <div class="layout-row">
          <span class="field-label" style="margin:0">Enable Preview Page</span>
          <ha-switch id="preview_page_enabled" ${this._config?.preview_page_enabled ? "checked" : ""}></ha-switch>
        </div>
        <div class="field-helper">When enabled, Preview becomes available in navigation and as a landing page option.</div>
      </div>
      <div class="section">
        <div class="layout-row">
          <span class="field-label" style="margin:0">Live Cameras</span>
          <ha-switch id="preview_page_live_cameras" ${this._config?.preview_page_live_cameras ? "checked" : ""}></ha-switch>
        </div>
        <div class="field-helper">On = all preview cameras load live. Off = snapshots, with alert/review cameras promoted to temporary live view.</div>
      </div>
      <div class="section">
        <div class="layout-row">
          <span class="field-label" style="margin:0">Show Title Bars</span>
          <ha-switch id="preview_page_show_title_bars" ${this._config?.preview_page_show_title_bars !== false ? "checked" : ""}></ha-switch>
        </div>
        <div class="field-helper">Shows per-camera metadata under each preview tile (name, source, events, and online status).</div>
      </div>`;
    const gridAlertHoldSeconds =
      this._config?.grid_alert_hold_seconds ??
      Math.round(GRID_ALERT_HOLD_MS / 1000);
    const slideshowAlertHoldSeconds =
      this._config?.slideshow_alert_hold_seconds ??
      Math.round(SLIDESHOW_ALERT_HOLD_MS / 1000);
    const wideViewPanelContent = `
      <div class="section" style="border-top:none;padding-top:0">
        <div class="layout-row">
          <span class="field-label" style="margin:0">Enable Wide View Page</span>
          <ha-switch id="wide_view_page_enabled" ${this._config?.wide_view_page_enabled ? "checked" : ""}></ha-switch>
        </div>
        <div class="field-helper">When enabled, Wide View becomes available in navigation and as a desktop/tablet landing page option.</div>
      </div>
      <div class="section">
        <div class="layout-row">
          <span class="field-label" style="margin:0">Live Companion Cameras</span>
          <ha-switch id="wide_view_live_cameras" ${this._config?.wide_view_live_cameras ? "checked" : ""}></ha-switch>
        </div>
        <div class="field-helper">On = all Companion Cameras remain live. Off = refreshed snapshots, with alerted cameras temporarily promoted to live.</div>
      </div>
      <div class="section">
        <div class="layout-row">
          <span class="field-label" style="margin:0">Alert Camera Takeover Default</span>
          <ha-switch id="wide_view_alert_takeover" ${this._config?.wide_view_alert_takeover ? "checked" : ""}></ha-switch>
        </div>
        <div class="field-helper">Sets the initial state of the Wide View toolbar button that allows alerted cameras to take over the main live view.</div>
      </div>
      <div id="col-width-row" style="display:flex;align-items:center;gap:6px;margin-top:6px;${this._config?.wide_view_page_enabled ? "" : "display:none"}">
        <label style="font-size:11px;color:var(--c-text);white-space:nowrap">Left Width %</label>
        <ha-input type="text" id="col_left_width_pct" value="${this._config?.col_left_width_pct ?? 50}" style="width:70px"></ha-input>
        <span style="font-size:11px;color:var(--c-text2)">%</span>
      </div>
      <div class="field-helper" id="col_left_width_pct-helper">Controls the left column width when the Wide View page is active.</div>`;
    const mobileViewPanelContent = `
      <div class="section" style="border-top:none;padding-top:0">
        <div class="layout-row">
          <span class="field-label" style="margin:0">Enable Mobile View Page</span>
          <ha-switch id="mobile_view_page_enabled" ${this._config?.mobile_view_page_enabled ? "checked" : ""}></ha-switch>
        </div>
        <div class="field-helper">When enabled, Mobile appears in navigation and as a landing page option for both desktop/tablet and phone devices.</div>
      </div>`;
    const landingPanelContent = `
      <div class="section" style="border-top:none;padding-top:0">
        <span class="field-label">Landing Page</span>
        <ha-selector id="landing_page" style="width:220px"></ha-selector>
        <div class="field-helper">Choose the default starting page for desktop and tablet devices.</div>
      </div>
      <div class="section">
        <span class="field-label">Mobile Page</span>
        <ha-selector id="mobile_page" style="width:220px"></ha-selector>
        <div class="field-helper">Choose the default starting page for phones. Wide View is intentionally excluded here.</div>
      </div>`;
    const gridviewPanelContent = `
      <div class="section">
        <div class="layout-row" style="align-items:flex-start;gap:12px;flex-wrap:wrap;justify-content:flex-start">
          <div style="display:flex;flex-direction:column;gap:6px;max-width:420px">
            <div class="layout-row" style="justify-content:flex-start;gap:8px">
              <span class="field-label" style="margin:0">Grid Mode</span>
              <ha-switch id="grid_mode_enabled" ${this._config?.grid_mode_enabled ? "checked" : ""}></ha-switch>
            </div>
            <div class="field-helper">Enable a 2x2 camera grid. This is not available on mobile phone devices and requires at least 2 cameras.</div>
          </div>
          <div id="grid_start_row" style="min-width:210px;display:${this._config?.grid_mode_enabled ? "flex" : "none"};flex-direction:column;gap:6px">
            <div class="layout-row" style="justify-content:flex-start;gap:8px">
              <span class="field-label" style="margin:0">Start In Grid Mode</span>
              <ha-switch id="grid_start_in_grid_enabled" ${this._config?.grid_start_in_grid_enabled ? "checked" : ""}></ha-switch>
            </div>
            <div class="field-helper">Start this card in grid mode and return to grid mode when re-entering the dashboard.</div>
          </div>
          <div id="grid_live_row" style="min-width:210px;display:${this._config?.grid_mode_enabled ? "flex" : "none"};flex-direction:column;gap:6px">
            <div class="layout-row" style="justify-content:flex-start;gap:8px">
              <span class="field-label" style="margin:0">Live View In Grid</span>
              <ha-switch id="grid_live_view_enabled" ${this._config?.grid_live_view_enabled !== false ? "checked" : ""}></ha-switch>
            </div>
            <div class="field-helper">Off = snapshots by default. Alerted cameras switch to live temporarily and show border. On = all visible grid cameras stay live.</div>
          </div>
          <div id="grid_rotation_row" style="min-width:210px;display:${this._config?.grid_mode_enabled && cams.length > 4 ? "flex" : "none"};flex-direction:column;gap:6px">
            <span class="field-label" style="margin:0">Grid Rotation Frequency</span>
            <ha-selector id="grid_rotation_seconds" style="width:210px"></ha-selector>
          </div>
        </div>
        <div class="layout-row" style="align-items:flex-start;gap:12px;flex-wrap:wrap;justify-content:flex-start;margin-top:12px">
          <div id="grid_alert_hold_row" style="min-width:210px;display:flex;flex-direction:column;gap:6px;width:100%">
            <span class="field-label" style="margin:0">Grid Alert Hold Duration</span>
            <input id="grid_alert_hold_seconds" type="range" min="5" max="60" step="1" value="${gridAlertHoldSeconds}" style="width:100%">
            <div class="field-helper" id="grid_alert_hold_seconds-output">${gridAlertHoldSeconds} seconds</div>
          </div>
        </div>
      </div>`;

    const activeSettingsPanel =
      this._activeSettingsPanelId === undefined
        ? "camera"
        : this._activeSettingsPanelId;

    const settingsPanelsMarkup = `
      <div class="settings-container">
        ${this._renderSettingsPanel({ id: "camera", title: "Camera Settings", icon: "mdi:camera", content: cameraPanelContent, active: activeSettingsPanel === "camera" })}
        ${this._renderSettingsPanel({ id: "general", title: "General Settings", icon: "mdi:cog", content: generalPanelContent, active: activeSettingsPanel === "general" })}
        ${this._renderSettingsPanel({ id: "theme", title: "Theme Settings", icon: "mdi:palette", content: themePanelContent, active: activeSettingsPanel === "theme" })}
        ${this._renderSettingsPanel({ id: "layout", title: "Layout Settings", icon: "mdi:angle-right", content: layoutPanelContent, active: activeSettingsPanel === "layout" })}
        ${this._renderSettingsPanel({ id: "slideshow", title: "Slideshow Settings", icon: "mdi:presentation-play", content: slideshowPanelContent, active: activeSettingsPanel === "slideshow" })}
        ${this._renderSettingsPanel({ id: "gridview", title: "Grid View", icon: "mdi:view-grid-outline", content: gridviewPanelContent, active: activeSettingsPanel === "gridview" })}
        ${this._renderSettingsPanel({ id: "preview", title: "Preview Page", icon: "mdi:view-grid", content: previewPanelContent, active: activeSettingsPanel === "preview" })}
        ${this._renderSettingsPanel({ id: "wideview", title: "Wide View Page", icon: "mdi:view-split-vertical", content: wideViewPanelContent, active: activeSettingsPanel === "wideview" })}
        ${this._renderSettingsPanel({ id: "mobileview", title: "Mobile View", icon: "mdi:cellphone", content: mobileViewPanelContent, active: activeSettingsPanel === "mobileview" })}
        ${this._renderSettingsPanel({ id: "landing", title: "Landing Page", icon: "mdi:home-import-outline", content: landingPanelContent, active: activeSettingsPanel === "landing" })}
      </div>`;

    this.innerHTML = `<style>
          :host{
                --editor-primary-bg: var(--primary-background-color);
                --editor-secondary-bg: var(--secondary-background-color);
                --editor-card-bg: var(--card-background-color);
                --editor-text: var(--primary-text-color);
                --editor-muted: var(--secondary-text-color);
                --editor-primary: var(--primary-color);
                --editor-primary-d: var(--dark-primary-color);
                --editor-primary-l: var(--light-primary-color);
                --editor-border: var(--divider-color);
                --editor-border-width: var(--ha-card-border-width);
                --editor-shadow: var(--ha-card-box-shadow);
                --editor-icon: var(--icon-color, var(--secondary-text-color));
              --c-bg-main: var(--editor-primary-bg);
              --c-bg-panel: var(--editor-card-bg);
              --c-text: var(--editor-text);
              --c-text2: var(--editor-muted);
              --c-text-rev: var(--text-primary-color);
              --c-border: var(--editor-border);
              --c-border2: var(--divider-color, var(--editor-border));
              --c-primary: var(--editor-primary);
              --c-accent: var(--accent-color, var(--editor-primary));
              --c-alert: var(--error-color);
            }
            .ed-wrap{
                display:flex;
                flex-direction:column;
                gap:16px;
                padding:8px 0;
                background:transparent;
                color:var(--editor-text);
                font-family: var(--ha-font-family, inherit);
                font-size: var(--ha-font-size, 14px);
            }
              .settings-container{display:flex;flex-direction:column;gap:10px;}
              .settings-panel{
                border:1px solid var(--c-border2, var(--editor-border));
                border-radius:16px;
                background:var(--c-bg-panel, var(--editor-card-bg));
                color:var(--c-text, var(--editor-text));
                overflow:hidden;
              }
              .setting-title{
                width:100%;
                border:none;
                background:transparent;
                color:inherit;
                display:flex;
                align-items:center;
                gap:10px;
                padding:12px 14px;
                text-align:left;
                cursor:pointer;
              }
              .setting-title h3{margin:0;font-size:14px;font-weight:700;}
              .setting-title ha-icon{color:var(--c-text2, var(--editor-muted));}
              .settings-panel.active .setting-title{color:var(--c-accent, var(--editor-primary));}
              .settings-panel.active .setting-title ha-icon{color:var(--c-accent, var(--editor-primary));}
              .setting-content{
                max-height:0;
                opacity:0;
                overflow:hidden;
                padding:0 14px;
                transition:max-height .28s ease, opacity .2s ease, padding .2s ease;
              }
              .settings-panel.active .setting-content{
                max-height:1400px;
                opacity:1;
                padding:0 14px 14px;
              }
              .field-label{font-size:12px;font-weight:600;margin-bottom:8px;display:block;color:var(--c-text, var(--editor-text));}
            .field-helper{min-height:1.2em;margin-top:4px;font-size:11px;color:var(--c-text2, var(--editor-muted));}
            .field-helper.error{color:var(--c-alert);}
            .section{border-top:1px solid var(--divider-color, #d1d5db);padding-top:16px;}
            .chk-row{display:flex;flex-wrap:wrap;gap:8px 16px;}

            .cam-wrap{display:flex;flex-direction:column;gap:8px;}
            .cam-row{display:grid;grid-template-columns:auto 1fr auto auto;gap:8px;align-items:center;border:var(--editor-border-width) solid var(--editor-border);border-radius:12px;padding:8px 12px;background:var(--editor-card-bg);box-shadow:var(--editor-shadow);}
            .cam-row.dragging{opacity:.65;}
            .cam-row.drop-target{border-color:var(--editor-primary);}
            .cam-drag{border:none;background:transparent;color:var(--editor-icon);cursor:grab;line-height:1;display:grid;place-items:center;width:28px;height:28px;border-radius:8px;}
            .cam-drag:hover{background:var(--editor-secondary-bg);}
            .cam-drag ha-icon{--mdc-icon-size:18px;}
            .cam-name{font-size:15px;color:var(--editor-text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
            .cam-meta{font-size:11px;color:var(--editor-muted);margin-top:2px;}
            .cam-action{width:32px;height:32px;border:none;background:transparent;color:var(--editor-icon);display:grid;place-items:center;cursor:pointer;border-radius:8px;}
            .cam-action:hover{background:var(--editor-secondary-bg);color:var(--editor-text);}
            .cam-action svg{width:18px;height:18px;display:block;fill:currentColor;}
            .cam-toolbar{display:flex;align-items:center;gap:8px;}
            .cam-add{border:var(--editor-border-width) solid var(--editor-border);border-radius:999px;padding:8px 16px;background:var(--editor-card-bg);color:var(--editor-primary);font-weight:600;cursor:pointer;}
            .cam-add:hover{border-color:var(--editor-primary);}
            .cam-add[disabled]{opacity:.5;cursor:not-allowed;}
            .cam-helper{font-size:11px;color:var(--c-text2, var(--editor-muted));}

            .theme-row{display:flex;align-items:center;}
            .theme-seg{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;width:100%;}
            .theme-opt{
              appearance:none;
              border:var(--editor-border-width) solid var(--c-border2);
              background:var(--c-bg-panel);
              color:var(--c-text);
              border-radius:10px;
              padding:8px 10px;
              cursor:pointer;
              font-weight:600;
              line-height:1.4;
              transition:background .16s ease,border-color .16s ease,color .16s ease,box-shadow .16s ease;
            }
            .theme-opt:hover{background:var(--c-bg-main);border-color:var(--c-primary);}
            .theme-opt:active{transform:translateY(1px);}
            .theme-opt:focus-visible{outline:none;box-shadow:0 0 0 2px var(--c-primary-l, var(--c-primary));}
            .theme-opt.active{background:var(--c-primary);border-color:var(--c-primary);color:var(--c-text-rev);}
            .theme-custom-panel{margin-top:10px;border:var(--editor-border-width) solid var(--editor-border);border-radius:10px;background:var(--editor-card-bg);}
            .theme-custom-panel[hidden]{display:none;}
            .theme-custom-panel summary{cursor:pointer;list-style:none;padding:10px 12px;font-weight:600;color:var(--c-text, var(--editor-text));display:flex;align-items:center;justify-content:space-between;}
            .theme-custom-panel summary::-webkit-details-marker{display:none;}
            .theme-custom-body{padding:0 12px 10px;}
            .theme-custom-row{display:grid;grid-template-columns:1fr auto auto;gap:10px;align-items:center;padding:10px 0;border-top:1px solid var(--c-border2, var(--editor-border));}
            .theme-custom-row:first-child{border-top:none;}
            .theme-custom-label{display:flex;flex-direction:column;gap:2px;min-width:0;}
            .theme-custom-warn{font-size:11px;color:var(--c-text2, var(--editor-muted));}
            .theme-color-wrap{position:relative;width:60px;height:60px;display:flex;align-items:center;justify-content:center;}
            .theme-color-input{width:60px;height:60px;padding:0;border:1px solid var(--editor-border);border-radius:4px;background:transparent;cursor:pointer;}
            .theme-color-input:disabled{opacity:1;cursor:not-allowed;}
            .theme-color-reset{
              position:absolute;
              left:calc(-1.4em - 2px);
              bottom:0;
              width:1.4em;
              height:1.4em;
              padding:0;
              border:none;
              background:transparent;
              color:var(--c-alert);
              display:grid;
              place-items:center;
              cursor:pointer;
            }
            .theme-color-reset[hidden]{display:none;}
            .theme-color-reset ha-icon{--mdc-icon-size:1.4em;}
            .layout-row{display:flex;align-items:center;justify-content:space-between;gap:8px;}
            .readonly-value{font-size:12px;color:var(--c-text, var(--editor-text));background:var(--c-bg-main, var(--editor-secondary-bg));border:var(--editor-border-width) solid var(--c-border, var(--editor-border));border-radius:8px;padding:6px 10px;}

            .cam-modal.hidden{display:none;}
            .cam-modal{position:fixed;inset:0;background:rgba(0,0,0,.30);display:flex;align-items:center;justify-content:center;z-index:10;}
            .cam-modal-card{width:min(640px,calc(100vw - 24px));background:var(--editor-card-bg);color:var(--editor-text);border:var(--editor-border-width) solid var(--editor-border);border-radius:16px;padding:16px;box-shadow:var(--editor-shadow);}
            .cam-modal-card ha-input,
            .cam-modal-card ha-selector,
            .cam-modal-card ha-switch{--ha-card-background:var(--editor-card-bg);}
            .cam-modal-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;}
            .cam-modal-title{width:36px;height:36px;display:grid;place-items:center;font-size:24px;line-height:1;color:var(--editor-text);cursor:pointer;border:1px solid var(--c-border2);border-radius:999px;background:var(--editor-secondary-bg);}
            .cam-modal-title:hover{background:var(--editor-primary-l);}
            .cam-modal-label{font-size:12px;font-weight:600;color:var(--editor-text);margin-bottom:6px;display:block;}
            .cam-modal-field{margin-bottom:8px;}
            .cam-modal-foot{display:flex;justify-content:flex-end;gap:8px;margin-top:8px;}
            .cam-btn{border:1px solid var(--c-border2);border-radius:999px;background:var(--editor-secondary-bg);color:var(--editor-text);font-weight:600;cursor:pointer;padding:8px 14px;}
            .cam-btn:hover{background:var(--editor-primary-l);border-color:var(--editor-primary);}
            .cam-btn.primary{background:var(--editor-primary);color:var(--text-primary-color);border-color:var(--editor-primary);padding:8px 18px;}
            .cam-btn.primary:hover{background:var(--editor-primary-d);border-color:var(--editor-primary-d);}
            .cam-modal-helper{font-size:11px;color:var(--error-color);min-height:16px;}

        </style>
    <div class="ed-wrap">
      ${settingsPanelsMarkup}

      <div id="camera-modal" class="cam-modal hidden">
        <div class="cam-modal-card" role="dialog" aria-modal="true" aria-label="Camera modal">
          <div class="cam-modal-head">
            <button type="button" id="camera-modal-close" class="cam-modal-title" aria-label="Close">x</button>
            <div style="font-size:30px;font-weight:600;color:var(--primary-text-color)" id="camera-modal-title">Add</div>
            <div></div>
          </div>
          <div class="cam-modal-field">
            <span class="cam-modal-label">Camera</span>
            <ha-selector id="camera-modal-entity"></ha-selector>
          </div>
          <div class="cam-modal-field">
            <span class="cam-modal-label">Connection Type</span>
            <ha-selector id="camera-modal-connection-type"></ha-selector>
          </div>
          <div class="cam-modal-field">
            <ha-input id="camera-modal-name" label="Name" placeholder="Display name (optional)"></ha-input>
          </div>
          <div class="cam-modal-field">
            <div class="layout-row" style="justify-content:flex-start;gap:8px">
              <span class="cam-modal-label" style="margin:0">Alerts Area Content: All Reviews</span>
              <ha-switch id="camera-modal-all-reviews"></ha-switch>
            </div>
            <div class="field-helper">In Frigate, Reviews can include Alerts, Detections, or both. Off = Alerts Only (default). On = All Reviews.</div>
          </div>
          <div class="cam-modal-field">
            <div class="layout-row" style="justify-content:flex-start;gap:8px">
              <span class="cam-modal-label" style="margin:0">Disable HLS On Desktop</span>
              <ha-switch id="camera-modal-disable-hls-desktop"></ha-switch>
            </div>
            <div class="field-helper">Only affects non-mobile, non-tablet devices. WebRTC and MSE stay enabled; only the HLS fallback attempt is removed for this camera.</div>
          </div>
          <div class="cam-modal-field">
            <div id="camera-modal-ptz-toggle-row">
            <div class="layout-row" style="justify-content:flex-start;gap:8px">
              <span class="cam-modal-label" style="margin:0">Enable PTZ Controls</span>
              <ha-switch id="camera-modal-ptz-enabled"></ha-switch>
            </div>
            <div class="field-helper">Turns on circle-pad PTZ for this camera using the Frigate Home Assistant integration PTZ service.</div>
            </div>
            <div class="field-helper" id="camera-modal-ptz-state" style="display:none"></div>
          </div>
          <div class="cam-modal-field" id="camera-modal-ptz-config" style="display:none">
            <div class="cam-modal-field" id="camera-modal-ptz-speed-row" style="padding:0">
              <span class="cam-modal-label">Move Speed</span>
              <input id="camera-modal-ptz-speed" type="range" min="0.1" max="1" step="0.1" value="0.5" style="width:100%">
              <div class="field-helper" id="camera-modal-ptz-speed-output">Current speed: 0.5</div>
            </div>
          </div>
          <div class="cam-modal-field" id="camera-modal-two-way-talk-toggle-row" style="display:none">
            <div class="layout-row" style="justify-content:flex-start;gap:8px">
              <span class="cam-modal-label" style="margin:0">Enable Two-way Talk</span>
              <ha-switch id="camera-modal-two-way-talk-enabled"></ha-switch>
            </div>
            <div class="field-helper">Only shown when Frigate reports talk support for this camera.</div>
          </div>
          <div class="field-helper" id="camera-modal-two-way-talk-state" style="display:none"></div>
          <div class="cam-modal-helper" id="camera-modal-helper"></div>
          <div class="cam-modal-foot">
            <button type="button" id="camera-modal-cancel" class="cam-btn">Cancel</button>
            <button type="button" id="camera-modal-save" class="cam-btn primary">Add</button>
          </div>
        </div>
      </div>
    </div>`;

    const update = () => this._u({ dispatch: false, preview: true });
    const scheduleUpdate = () => {
      if (this._previewUpdateRaf) return;
      this._previewUpdateRaf = requestAnimationFrame(() => {
        this._previewUpdateRaf = 0;
        update();
      });
    };

    bindThemeControlEvents({
      root: this,
      update,
      themeDraftCache: this._themeDraftCache,
      resolveDefaultHex: (key) => this._themeDefaultHex(key),
    });

    setupSelectSelector({
      element: this.querySelector("#window_days"),
      hass: this._hass,
      options: Array.from({ length: 15 }, (_, index) => {
        const value = String(index + 1);
        return { value, label: value };
      }),
      initialValue: String(this._config?.window_days ?? 3),
      fallbackValue: "3",
      normalize: (value) => String(value ?? "3"),
      onChange: () => update(),
    });

    setupSelectSelector({
      element: this.querySelector("#alerts_reviews_days"),
      hass: this._hass,
      options: Array.from({ length: 15 }, (_, index) => {
        const value = String(index + 1);
        return { value, label: value };
      }),
      initialValue: String(this._config?.alerts_reviews_days ?? 3),
      fallbackValue: "3",
      normalize: (value) => String(value ?? "3"),
      onChange: () => update(),
    });

    setupSelectSelector({
      element: this.querySelector("#realtime_poll_seconds"),
      hass: this._hass,
      options: REALTIME_POLL_OPTIONS_SECONDS.map((value) => ({
        value: String(value),
        label: `${value}s`,
      })),
      initialValue: String(this._config?.realtime_poll_seconds ?? 5),
      fallbackValue: "5",
      normalize: (value) => String(value ?? "5"),
      onChange: () => update(),
    });

    setupSelectSelector({
      element: this.querySelector("#slideshow_rotation_seconds"),
      hass: this._hass,
      options: [
        { value: "10", label: "10 seconds" },
        { value: "20", label: "20 seconds" },
        { value: "30", label: "30 seconds" },
        { value: "60", label: "1 minute" },
      ],
      initialValue: String(this._config?.slideshow_rotation_seconds ?? 30),
      fallbackValue: "30",
      normalize: (value) => String(value ?? "30"),
      onChange: () => update(),
    });

    setupSelectSelector({
      element: this.querySelector("#grid_rotation_seconds"),
      hass: this._hass,
      options: [
        { value: "10", label: "10 seconds" },
        { value: "20", label: "20 seconds" },
        { value: "30", label: "30 seconds" },
        { value: "60", label: "1 minute" },
      ],
      initialValue: String(this._config?.grid_rotation_seconds ?? 30),
      fallbackValue: "30",
      normalize: (value) => String(value ?? "30"),
      onChange: () => update(),
    });

    setupSelectSelector({
      element: this.querySelector("#stream_height_unit"),
      hass: this._hass,
      options: [
        { value: "vh", label: "dvh" },
        { value: "em", label: "em" },
        { value: "px", label: "px" },
        { value: "%", label: "%" },
      ],
      initialValue: this._config?.stream_height_unit || "vh",
      fallbackValue: "vh",
      normalize: (value) => String(value ?? "vh"),
      onChange: () => update(),
    });

    setupSelectSelector({
      element: this.querySelector("#landing_page"),
      hass: this._hass,
      options: landingPageOptions,
      initialValue: this._config?.landing_page || PAGE_IDS.singleView,
      fallbackValue: PAGE_IDS.singleView,
      normalize: (value) => normalizePageRoute(value),
      onChange: () => update(),
    });

    setupSelectSelector({
      element: this.querySelector("#mobile_page"),
      hass: this._hass,
      options: mobilePageOptions,
      initialValue: this._config?.mobile_page || PAGE_IDS.singleView,
      fallbackValue: PAGE_IDS.singleView,
      normalize: (value) => normalizePageRoute(value),
      onChange: () => update(),
    });

    setupEntitySelector({
      element: this.querySelector("#camera-modal-entity"),
      hass: this._hass,
      domain: "camera",
      label: "Camera",
    });

    setupSelectSelector({
      element: this.querySelector("#camera-modal-connection-type"),
      hass: this._hass,
      options: [
        { value: "frigate_go2rtc", label: "Frigate go2rtc" },
        { value: "ha_direct", label: "HA direct" },
      ],
      initialValue: DEFAULT_CAMERA_CONNECTION_TYPE,
      fallbackValue: DEFAULT_CAMERA_CONNECTION_TYPE,
      normalize: (value) => normalizeCameraConnectionType(value),
    });

    bindClickHandlers(this, [
      {
        selector: "#camera-add",
        handler: () => this._openCameraModal(null),
      },
      {
        selector: "#camera-modal-close",
        handler: () => this._closeCameraModal(),
      },
      {
        selector: "#camera-modal-cancel",
        handler: () => this._closeCameraModal(),
      },
      {
        selector: "#camera-modal-save",
        handler: () => this._saveCameraModal(),
      },
    ]);
    bindEachClickHandler({
      root: this,
      selector: "[data-edit-cam]",
      handler: (event) => {
        this._openCameraModal(Number(event.currentTarget.dataset.editCam));
      },
    });
    bindEachClickHandler({
      root: this,
      selector: "[data-remove-cam]",
      handler: (event) => {
        this._removeCamera(Number(event.currentTarget.dataset.removeCam));
      },
    });
    this.querySelector("#camera-modal")?.addEventListener("click", (ev) => {
      if (ev.target?.id === "camera-modal") this._closeCameraModal();
    });
    this.querySelector("#camera-modal-name")?.addEventListener(
      "keydown",
      (ev) => {
        if (ev.key === "Enter") {
          ev.preventDefault();
          this._saveCameraModal();
        }
      },
    );
    this.querySelector("#camera-modal-entity")?.addEventListener(
      "value-changed",
      () => {
        void this._refreshCameraModalPtzSupport();
        void this._refreshCameraModalTwoWayTalkSupport();
      },
    );
    this.querySelector("#camera-modal-entity")?.addEventListener(
      "change",
      () => {
        void this._refreshCameraModalPtzSupport();
        void this._refreshCameraModalTwoWayTalkSupport();
      },
    );
    this.querySelector("#camera-modal-connection-type")?.addEventListener(
      "value-changed",
      () => {
        void this._refreshCameraModalPtzSupport();
        void this._refreshCameraModalTwoWayTalkSupport();
      },
    );
    this.querySelector("#camera-modal-connection-type")?.addEventListener(
      "change",
      () => {
        void this._refreshCameraModalPtzSupport();
        void this._refreshCameraModalTwoWayTalkSupport();
      },
    );
    this.querySelector("#camera-modal-ptz-enabled")?.addEventListener(
      "value-changed",
      () =>
        this._syncCameraModalPtzVisibility({
          supported:
            this.querySelector("#camera-modal-ptz-enabled")?.dataset
              ?.supported === "true",
          sourceType: this._cameraModalConnectionTypeValue(),
          loading: false,
        }),
    );
    this.querySelector("#camera-modal-ptz-enabled")?.addEventListener(
      "change",
      () =>
        this._syncCameraModalPtzVisibility({
          supported:
            this.querySelector("#camera-modal-ptz-enabled")?.dataset
              ?.supported === "true",
          sourceType: this._cameraModalConnectionTypeValue(),
          loading: false,
        }),
    );
    this.querySelector("#camera-modal-ptz-speed")?.addEventListener(
      "input",
      (event) => {
        this._setCameraModalPtzSpeedOutput(event.currentTarget?.value);
      },
    );
    [
      "#snapshot_update_seconds",
      "#slideshow_alert_hold_seconds",
      "#grid_alert_hold_seconds",
      "#preview_page_alert_live_duration_seconds",
    ].forEach((selector) => {
      this.querySelector(selector)?.addEventListener("input", (event) => {
        this._setRangeValueOutput(
          selector,
          event.currentTarget?.value,
          " seconds",
        );
      });
    });
    this._wireCameraDragAndDrop();
    this._wireSettingsPanels();
    this._wireEditorDialogActions();
    this._wireLivePreviewUpdates();

    bindEventsForIds({
      root: this,
      ids: ["title", "subtitle", "stream_height", "col_left_width_pct"],
      events: ["change"],
      handler: () => update(),
    });
    bindEventsForIds({
      root: this,
      ids: [
        "tight_margins",
        "wide_view_page_enabled",
        "wide_view_live_cameras",
        "wide_view_alert_takeover",
        "mobile_view_page_enabled",
        "shadows",
        "borders",
        "rounded_corners",
        "outer_shadows",
        "mobile_poll_battery_saver",
        "snapshot_update_seconds",
        "slideshow_rotation_enabled",
        "grid_mode_enabled",
        "grid_start_in_grid_enabled",
        "grid_live_view_enabled",
        "slideshow_alert_hold_seconds",
        "grid_alert_hold_seconds",
        "preview_page_enabled",
        "preview_page_live_cameras",
        "preview_page_alert_live_duration_seconds",
        "preview_page_show_title_bars",
      ],
      events: ["input", "change", "value-changed"],
      handler: () => {
        const slideshowRow = this.querySelector("#slideshow_rotation_row");
        const enabled =
          this.querySelector("#slideshow_rotation_enabled")?.checked === true;
        const gridRow = this.querySelector("#grid_rotation_row");
        const gridStartRow = this.querySelector("#grid_start_row");
        const gridLiveRow = this.querySelector("#grid_live_row");
        const gridEnabled =
          this.querySelector("#grid_mode_enabled")?.checked === true;
        if (slideshowRow)
          slideshowRow.style.display = enabled ? "flex" : "none";
        if (gridStartRow)
          gridStartRow.style.display = gridEnabled ? "flex" : "none";
        if (gridLiveRow)
          gridLiveRow.style.display = gridEnabled ? "flex" : "none";
        if (gridRow)
          gridRow.style.display =
            gridEnabled && cams.length > 4 ? "flex" : "none";
        scheduleUpdate();
      },
    });
    bindEventsForSelectorAll({
      root: this,
      selector: "[data-active-tab]",
      events: ["change", "value-changed"],
      handler: (event) => {
        const tabId = event.currentTarget?.dataset?.activeTab;
        if (!tabId) return;
        const isVisible = this._isTabVisibleFromEvent(event);
        this._setHiddenTabFromToggle(tabId, isVisible);
        scheduleUpdate();
      },
    });

    const wideCb = this.querySelector("#wide_view_page_enabled");
    const colWidthRow = this.querySelector("#col-width-row");
    if (wideCb && colWidthRow) {
      const syncWideRow = () => {
        colWidthRow.style.display = wideCb.checked ? "flex" : "none";
        this._validateEditorFields();
      };
      wideCb.addEventListener("change", syncWideRow);
      wideCb.addEventListener("value-changed", syncWideRow);
      syncWideRow();
    }

    if (this.querySelector("#col_left_width_pct")) {
      this._bindNumericInput("#col_left_width_pct", {
        onSanitize: () => {
          this._validateEditorFields();
        },
      });
    }

    if (this.querySelector("#stream_height")) {
      this._bindNumericInput("#stream_height", {
        onSanitize: () => {
          this._validateEditorFields();
        },
      });
    }

    this._validateEditorFields();
  }

  _getCams() {
    return Array.isArray(this._config?.cameras)
      ? this._config.cameras
          .map((c) => ({
            entity: c?.entity || "",
            name: c?.name || "",
            connection_type: normalizeCameraConnectionType(c?.connection_type),
            alerts_content: normalizeAlertsAreaContent(c?.alerts_content),
            disable_hls_desktop: normalizeDisableHlsDesktop(
              c?.disable_hls_desktop,
            ),
            ptz: normalizeCameraPtzConfig(c?.ptz),
            ...(c?.two_way_talk === true ? { two_way_talk: true } : {}),
          }))
          .filter((c) => c.entity)
          .slice(0, MAX_CAMERAS)
      : [];
  }

  _emitPreviewDraft(config) {
    window.dispatchEvent(
      new CustomEvent("frigate-view-card-preview-draft", {
        detail: {
          cardTag: CARD_TAG,
          config,
        },
      }),
    );
  }

  _u({ dispatch = true, preview = false } = {}) {
    if (!this._validateEditorFields()) return;
    const cameras = this._getCams();
    const prevOptionSignature = this._landingPageOptionSignature(this._config);
    const nextConfig = buildEditorConfigFromDom({
      root: this,
      baseConfig: this._config,
      cameras,
      themeDraftCache: this._themeDraftCache,
      hiddenTabsOverride: this._hiddenTabsDraft,
    });
    const normalizedNextConfig = this._normalizeConfig(nextConfig);
    const nextOptionSignature =
      this._landingPageOptionSignature(normalizedNextConfig);

    this._config = normalizedNextConfig;
    this._syncHiddenTabsDraftFromConfig(normalizedNextConfig);
    if (preview) {
      this._hasVisualDraft = true;
      this._emitPreviewDraft(createEditorPreviewDraft(normalizedNextConfig));
    }
    if (prevOptionSignature !== nextOptionSignature) {
      this._render();
      return;
    }
    if (dispatch) this._dispatch();
  }

  _dispatch() {
    const cameras = this._getCams();
    this._config = this._normalizeConfig(
      buildEditorConfigFromDom({
        root: this,
        baseConfig: this._config,
        cameras,
        themeDraftCache: this._themeDraftCache,
        hiddenTabsOverride: this._hiddenTabsDraft,
      }),
    );
    this._syncHiddenTabsDraftFromConfig(this._config);
    const config = withCardTypeForYaml(
      compactEditorConfigForYaml(this._config, {
        themeDefaultColors: this._themeDefaultHexMap(),
      }),
      { sourceConfig: this._config },
    );
    this._lastDispatchedConfigSig = this._configSignature(config);
    this.dispatchEvent(
      new CustomEvent("config-changed", {
        detail: { config },
      }),
    );
  }
}
