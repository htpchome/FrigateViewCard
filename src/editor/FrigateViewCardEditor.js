import {
  VERSION,
  CARD_TAG,
  DEFAULT_TITLE,
  DEFAULT_SUBTITLE,
  DEFAULT_HIDDEN_TABS,
  DAY,
  RECORDINGS_WINDOW,
  REALTIME_HEAD_POLL_MS,
  REALTIME_RELOAD_DEBOUNCE_MS,
  REALTIME_POLL_OPTIONS_SECONDS,
  MOBILE_BATTERY_SAVER_POLL_SECONDS,
  SNAPSHOT_UPDATE_SECONDS,
  SNAPSHOT_UPDATE_OPTIONS_SECONDS,
  EVENT_PRE_POST_ROLL_SECONDS,
  SLIDESHOW_ROTATION_OPTIONS_SECONDS,
  GRID_ROTATION_OPTIONS_SECONDS,
  SLIDESHOW_ALERT_HOLD_MS,
  SLIDESHOW_ALERT_HOLD_OPTIONS_SECONDS,
  SLIDESHOW_REVIEW_FRESHNESS_GRACE_SEC,
  SLIDESHOW_REVIEW_WATCH_MIN_MS,
  SLIDESHOW_REVIEW_WATCH_MAX_MS,
  GRID_ALERT_HOLD_MS,
  GRID_ALERT_HOLD_OPTIONS_SECONDS,
  PREVIEW_ALERT_HOLD_MS,
  PREVIEW_ALERT_LIVE_DURATION_OPTIONS_SECONDS,
  PREVIEW_ALERT_END_GRACE_MS,
  MSE_SWITCH_GRACE_MS,
  MSE_SWITCH_GRACE_MAX,
  MAX_CAMERAS,
  DEFAULT_CAMERA_CONNECTION_TYPE,
  ALLOWED_HIDDEN_TABS,
  THEME_DEFAULTS,
  THEME_CUSTOM_ROWS,
  THEME_MODES,
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
  normalizeNumberChoice,
  normalizeCameraConnectionType,
  normalizeAlertsAreaContent,
  normalizeHexColor,
  normalizeThemeMode,
  normalizeThemeCustomDefaultsConfig,
  DIALOG_ACTION_SELECTOR,
  resolveActiveTab,
  setSettingsPanelActiveState,
  dialogActionKindFromElement,
  dialogActionKindFromEvent,
  reorderItemsForDrop,
  wireCameraRowDragAndDrop,
  setFieldErrorState,
  bindSelectorSyncEvents,
  setupSelectSelector,
  setupEntitySelector,
  setupIconSelector,
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
  normalizePtzControlRotation,
  PTZ_CONTROL_ROTATIONS,
} from "../features/ptz/index.js";
import { hasTwoWayTalkCapability } from "../features/two-way-talk/index.js";
import { hasHaCameraWebRtcPlaybackCapability } from "../integrations/home-assistant/camera-capabilities.js";
import {
  findHomeAssistantLovelacePanel,
  resolveCurrentHomeAssistantViewName,
  resolveDashboardSwipeNavigationOwnership,
} from "../integrations/home-assistant/dashboard-swipe-navigation.ctrl.js";
import {
  DASHBOARD_SWIPE_PAGE_OPTIONS,
  DASHBOARD_SWIPE_NAVIGATION_MODES,
  DEVICE_ROUTE_BUCKETS,
  getEnabledPageRoutes,
  getEnabledMobilePageModes,
  MOBILE_PAGE_MODES,
  normalizeDashboardSwipeNavigationMode,
  normalizeMobilePageMode,
  normalizePageRoute,
  PAGE_IDS,
  resolveDashboardSwipePageSelection,
} from "../features/navigation/router.js";
import { normalizeCardConfig } from "../config/card-config.js";
import {
  CARD_HEIGHT_MAX,
  CARD_HEIGHT_MIN,
  normalizeCardHeight,
  normalizeCardHeightUnit,
  resolveThemeCustomEditorConfig,
} from "../features/card-style/config.js";
import { resolveHomeAssistantThemeContext } from "../features/card-style/context.ctrl.js";
import {
  WIDE_LEFT_WIDTH_MAX,
  WIDE_LEFT_WIDTH_MIN,
  normalizeWideLeftWidth,
  normalizeWideTimelineScale,
  WIDE_TIMELINE_SCALE_OPTIONS_HOURS,
} from "../features/wide-view/config.js";
import { createEditorPreviewDraft } from "../config/preview-mapper.js";
import { EDITOR_PREVIEW_ROUTE_INTENTS } from "../features/editor-preview/context.ctrl.js";
import {
  CAMERA_GROUP_LAYOUTS,
  cameraMemberEntities,
  countPhysicalCameras,
  flattenCameraMembers,
  isCameraGroup,
  limitCameraConfigsByPhysicalCount,
  nextCameraGroupDefaultName,
  normalizeCameraGroupConfig,
  normalizeCameraGroupLayout,
} from "../features/camera-groups/model.js";
import {
  GRID_ORDER_MODES,
  normalizeGridOrderConfig,
} from "../features/grid/config.js";
import {
  LINKED_LIGHT_POSITIONS,
  linkedLightsForCamera,
  normalizeLinkedEntitiesConfig,
  normalizeLinkedLightPosition,
} from "../features/linked-entities/config.js";
import { linkedLightFriendlyName } from "../features/linked-entities/light.model.js";
import {
  compactEditorConfigForYaml,
  withCardTypeForYaml,
} from "../config/yaml-mapper.js";
import { escapeHtml, escapeHtmlAttribute } from "../shared/html.js";

const CAMERA_MODAL_SELECTOR_IDS = Object.freeze(
  new Set([
    "camera-modal-entity",
    "camera-modal-secondary-entity",
    "camera-modal-light-entity",
    "camera-modal-light-icon",
    "camera-modal-light-entity-2",
    "camera-modal-light-icon-2",
    "camera-modal-connection-type",
  ]),
);

const HOME_ASSISTANT_DIRTY_STATE_CONTEXT = "dirtyState";
const EDITOR_DIRTY_STATE_KEY = "frigate-view-card-editor";

const escapeEditorChoiceMarkup = escapeHtml;

const formatDurationChoice = (value) => {
  const seconds = Number(value);
  if (Number.isFinite(seconds) && seconds >= 60 && seconds % 60 === 0) {
    const minutes = seconds / 60;
    return `${minutes} min`;
  }
  return `${seconds} sec`;
};

const durationEditorChoices = (values) =>
  values.map((value) => ({ value, label: formatDurationChoice(value) }));

export const buildEditorChoiceChipsMarkup = ({
  name,
  options,
  selectedValue,
  compact = false,
}) => {
  const selected = String(selectedValue ?? "");
  const safeName = escapeEditorChoiceMarkup(name);
  const hasDescriptions = options.some(({ description }) =>
    Boolean(String(description || "").trim()),
  );
  return `<div class="editor-choice-chips${compact ? " editor-choice-chips--compact" : ""}${hasDescriptions ? " editor-choice-chips--detailed" : ""}">
    ${options
      .map(({ value, label, description = "", disabled = false }) => {
        const safeValue = escapeEditorChoiceMarkup(value);
        const safeLabel = escapeEditorChoiceMarkup(label);
        const safeDescription = escapeEditorChoiceMarkup(description);
        return `<label class="editor-choice-chip">
          <input class="editor-choice-chip-input" type="radio" name="${safeName}" value="${safeValue}" ${String(value) === selected ? "checked" : ""} ${disabled ? "disabled" : ""}>
          <span class="editor-choice-chip-body">
            <span class="editor-choice-chip-indicator" aria-hidden="true"></span>
            ${hasDescriptions ? `<span class="editor-choice-chip-copy"><span class="editor-choice-chip-text">${safeLabel}</span><span class="editor-choice-chip-description">${safeDescription}</span></span>` : `<span class="editor-choice-chip-text">${safeLabel}</span>`}
          </span>
        </label>`;
      })
      .join("")}
  </div>`;
};

export class FrigateViewCardEditor extends HTMLElement {
  connectedCallback() {
    this._requestHomeAssistantDirtyStateContext();
    this._scheduleEditorPreviewLayoutSync();
  }

  _requestHomeAssistantDirtyStateContext() {
    if (this._haDirtyStateContext || this._haDirtyStateRequestPending) return;
    this._haDirtyStateRequestPending = true;
    const request = new Event("context-request", {
      bubbles: true,
      composed: true,
    });
    request.context = HOME_ASSISTANT_DIRTY_STATE_CONTEXT;
    request.subscribe = true;
    request.callback = (context, unsubscribe) => {
      this._haDirtyStateRequestPending = false;
      if (!context || typeof context.setState !== "function") return;
      this._haDirtyStateContext = context;
      if (
        typeof unsubscribe === "function" &&
        !this._haDirtyStateUnsubscribe
      ) {
        this._haDirtyStateUnsubscribe = unsubscribe;
      }
      this._seedHomeAssistantDirtyState();
    };
    this.dispatchEvent(request);
    this._haDirtyStateRequestPending = false;
  }

  _seedHomeAssistantDirtyState() {
    const context = this._haDirtyStateContext;
    if (!context || this._haDirtyBaselineConfig === undefined) return;
    if (!this._haDirtyStateSeeded) {
      this._haDirtyStateSeeded = true;
      context.setState(
        this._haDirtyBaselineConfig,
        EDITOR_DIRTY_STATE_KEY,
      );
    }
    if (this._pendingHaDirtyConfig === undefined) return;
    const pendingConfig = this._pendingHaDirtyConfig;
    this._pendingHaDirtyConfig = undefined;
    context.setState(pendingConfig, EDITOR_DIRTY_STATE_KEY);
  }

  _findHomeAssistantEditCardDialog() {
    let node = this;
    let depth = 0;
    while (node && depth < 16) {
      if (String(node.tagName || "").toUpperCase() === "HUI-DIALOG-EDIT-CARD") {
        return node;
      }
      const root = node.getRootNode?.();
      node = root?.host || node.parentNode || node.host;
      depth += 1;
    }
    return document.querySelector?.("hui-dialog-edit-card") || null;
  }

  _queryOpenShadowRoots(root, selector) {
    if (!root || !selector) return null;
    const pending = [root];
    const seen = new Set();
    while (pending.length) {
      const current = pending.shift();
      if (!current || seen.has(current)) continue;
      seen.add(current);
      const match = current.querySelector?.(selector);
      if (match) return match;
      current.querySelectorAll?.("*").forEach((element) => {
        if (element.shadowRoot && !seen.has(element.shadowRoot)) {
          pending.push(element.shadowRoot);
        }
      });
    }
    return null;
  }

  _queryAllOpenShadowRoots(
    root,
    selector,
    { stopAtTagNames = [] } = {},
  ) {
    if (!root || !selector) return [];
    const stoppedTags = new Set(
      stopAtTagNames.map((tagName) => String(tagName || "").toUpperCase()),
    );
    const matches = [];
    const pending = [root];
    const seen = new Set();
    while (pending.length) {
      const current = pending.shift();
      if (!current || seen.has(current)) continue;
      seen.add(current);
      current.querySelectorAll?.(selector).forEach((element) => {
        matches.push(element);
      });
      current.querySelectorAll?.("*").forEach((element) => {
        if (stoppedTags.has(String(element.tagName || "").toUpperCase())) {
          return;
        }
        if (element.shadowRoot && !seen.has(element.shadowRoot)) {
          pending.push(element.shadowRoot);
        }
      });
    }
    return [...new Set(matches)];
  }

  _findHomeAssistantCardPreview() {
    const seenRoots = new Set();
    let node = this;
    let depth = 0;
    while (node && depth < 16) {
      const root = node.getRootNode?.();
      if (root && !seenRoots.has(root)) {
        seenRoots.add(root);
        const preview = this._queryOpenShadowRoots(root, ".element-preview");
        if (preview) return preview;
      }
      node =
        root?.host && root.host !== node
          ? root.host
          : node.parentNode || node.host;
      depth += 1;
    }
    const dialogHost = document.querySelector?.("hui-dialog-edit-card");
    return this._queryOpenShadowRoots(
      dialogHost?.shadowRoot || dialogHost,
      ".element-preview",
    );
  }

  _editorPreviewLayoutTargets(preview) {
    const previewContents = this._queryAllOpenShadowRoots(
      preview,
      [
        "hui-section[preview]",
        "hui-grid-section",
        "ha-sortable",
        ".container",
        ".card.full-width",
        "hui-card",
        "frigate-view-card",
      ].join(","),
      { stopAtTagNames: ["frigate-view-card"] },
    );
    return [...new Set([preview, ...previewContents])];
  }

  _ensureEditorPreviewLayoutObserver() {
    const dialogHost = document.querySelector?.("hui-dialog-edit-card");
    const target = dialogHost?.shadowRoot || dialogHost;
    if (!target || !("MutationObserver" in window)) return;
    if (this._editorPreviewLayoutObserverTarget === target) return;
    this._editorPreviewLayoutObserver?.disconnect();
    this._editorPreviewLayoutObserver = new MutationObserver(() => {
      this._scheduleEditorPreviewLayoutSync();
    });
    this._editorPreviewLayoutObserver.observe(target, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["class", "open", "opened", "fullscreen"],
    });
    this._editorPreviewLayoutObserverTarget = target;
  }

  _restoreEditorPreviewLayout() {
    (this._editorPreviewOriginalStyles || []).forEach((saved) => {
      if (!saved?.element?.style) return;
      Object.entries(saved.properties || {}).forEach(
        ([property, { value, priority }]) => {
          if (value) {
            saved.element.style.setProperty(property, value, priority);
          } else {
            saved.element.style.removeProperty(property);
          }
        },
      );
    });
    this._editorPreviewOriginalStyles = [];
  }

  _syncEditorPreviewLayout() {
    const preview = this._findHomeAssistantCardPreview();
    if (!preview?.style) return;
    this._ensureEditorPreviewLayoutObserver();
    const targets = this._editorPreviewLayoutTargets(preview);
    const savedTargets = this._editorPreviewOriginalStyles || [];
    const targetsChanged =
      savedTargets.length !== targets.length ||
      targets.some((target, index) => savedTargets[index]?.element !== target);
    if (targetsChanged) {
      this._restoreEditorPreviewLayout();
      this._editorPreviewOriginalStyles = targets.map((element) => {
        const properties = {};
        [
          "width",
          "max-width",
          "min-width",
          "flex",
          "align-self",
          "box-sizing",
        ].forEach((property) => {
          properties[property] = {
            value: element.style.getPropertyValue(property),
            priority: element.style.getPropertyPriority(property),
          };
        });
        return { element, properties };
      });
    }
    targets.forEach((target) => {
      target.style.setProperty("width", "100%", "important");
      target.style.setProperty("max-width", "none", "important");
      target.style.setProperty("min-width", "0", "important");
      target.style.setProperty("align-self", "stretch", "important");
      target.style.setProperty("box-sizing", "border-box", "important");
      if (target === preview) {
        target.style.setProperty("flex", "1 1 0", "important");
      }
    });
  }

  _scheduleEditorPreviewLayoutSync() {
    if (this._editorPreviewLayoutSyncQueued) return;
    this._editorPreviewLayoutSyncQueued = true;
    queueMicrotask(() => {
      this._editorPreviewLayoutSyncQueued = false;
      if (this.isConnected) this._syncEditorPreviewLayout();
    });
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

  _ensureHaCameraCapabilityCache() {
    if (!(this._haCameraCapabilityCache instanceof Map)) {
      this._haCameraCapabilityCache = new Map();
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

  async _fetchHaCameraCapabilitiesForEntity(entity) {
    const targetEntity = String(entity || "").trim();
    if (!targetEntity || !this._hass?.callWS) return null;
    this._ensureHaCameraCapabilityCache();
    const cached = this._haCameraCapabilityCache.get(targetEntity);
    if (cached?.resolved) return cached.info;
    if (cached?.promise) return cached.promise;

    const entry = { resolved: false, info: null, promise: null };
    entry.promise = (async () => {
      try {
        entry.info = parseWs(
          await this._hass.callWS({
            type: "camera/capabilities",
            entity_id: targetEntity,
          }),
        );
      } catch (error) {
        console.warn(
          "[Frigate] Home Assistant camera capability fetch failed",
          error,
        );
        entry.info = null;
      } finally {
        entry.resolved = true;
        entry.promise = null;
      }
      return entry.info;
    })();

    this._haCameraCapabilityCache.set(targetEntity, entry);
    return entry.promise;
  }

  _setRangeValueOutput(selector, value, suffix = "") {
    const output = this.querySelector(`${selector}-output`);
    if (!output) return;
    const numeric = Number(value);
    output.textContent = Number.isFinite(numeric)
      ? `${numeric}${suffix}`
      : output.textContent;
  }

  _syncStreamHeightOutput() {
    const output = this.querySelector("#stream_height-output");
    if (!output) return;
    const height = normalizeCardHeight(
      this.querySelector("#stream_height")?.value,
    );
    const unit = normalizeCardHeightUnit(
      this.querySelector('[name="stream_height_unit"]:checked')?.value ||
        this.querySelector("#stream_height_unit")?.dataset.value ||
        this.querySelector("#stream_height_unit")?.value,
    );
    output.textContent = `${height}${unit}`;
  }

  _syncCameraModalPtzVisibility({
    supported = false,
    loading = false,
    sourceType = DEFAULT_CAMERA_CONNECTION_TYPE,
    preserveSelection = false,
  } = {}) {
    const toggleRow = this.querySelector("#camera-modal-ptz-toggle-row");
    const stateMessage = this.querySelector("#camera-modal-ptz-state");
    const ptzEnabled = this.querySelector("#camera-modal-ptz-enabled");
    const rotationRow = this.querySelector("#camera-modal-ptz-rotation-row");

    if (toggleRow) {
      toggleRow.style.display = supported || loading ? "block" : "none";
    }
    if (ptzEnabled) {
      ptzEnabled.disabled = !supported || loading;
      ptzEnabled.dataset.supported = supported ? "true" : "false";
      if (!supported && !loading && !preserveSelection)
        ptzEnabled.checked = false;
    }
    if (rotationRow) {
      rotationRow.hidden =
        !supported || loading || resolveSwitchChecked(ptzEnabled) !== true;
    }
    const isHaDirect =
      normalizeCameraConnectionType(sourceType) === "ha_direct";

    if (stateMessage) {
      if (loading) {
        stateMessage.style.display = "block";
        stateMessage.textContent = isHaDirect
          ? "Checking Frigate PTZ support. Home Assistant remains the live connection."
          : "Checking Frigate PTZ support for this camera.";
      } else if (!supported) {
        stateMessage.style.display = "block";
        stateMessage.textContent =
          "Frigate did not report PTZ pan/tilt support for this camera.";
      } else {
        stateMessage.style.display = "none";
        stateMessage.textContent = "";
      }
    }

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
    const isHaDirect =
      normalizeCameraConnectionType(sourceType) === "ha_direct";
    const showToggle = supported || loading || preserveSelection;
    const allowSelection = supported || preserveSelection;

    if (twoWayTalkToggleRow) {
      twoWayTalkToggleRow.style.display = showToggle ? "block" : "none";
    }
    if (twoWayTalkStateMessage) {
      if (loading) {
        twoWayTalkStateMessage.style.display = "block";
        twoWayTalkStateMessage.textContent = isHaDirect
          ? "Checking Home Assistant WebRTC playback support for this camera."
          : `Checking ${sourceLabel} two-way talk support for this camera.`;
      } else if (!supported) {
        twoWayTalkStateMessage.style.display = "block";
        twoWayTalkStateMessage.textContent = isHaDirect
          ? "Home Assistant did not report WebRTC playback for this camera, which is required for HA-direct two-way talk."
          : `${sourceLabel} did not report two-way talk support for this camera.`;
      } else if (isHaDirect) {
        twoWayTalkStateMessage.style.display = "block";
        twoWayTalkStateMessage.textContent =
          "Experimental: Home Assistant reports WebRTC playback, but does not report talkback capability. Enable only if this camera's Home Assistant WebRTC path accepts outgoing audio.";
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
    if (!entity) {
      this._syncCameraModalPtzVisibility({
        supported: false,
        loading: false,
        sourceType: normalizedSourceType,
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
      this._syncCameraModalTwoWayTalkVisibility({
        supported: false,
        loading: true,
        sourceType: normalizedSourceType,
        preserveSelection: true,
      });
      const token = (this._cameraModalTwoWayTalkToken || 0) + 1;
      this._cameraModalTwoWayTalkToken = token;
      const capabilities =
        await this._fetchHaCameraCapabilitiesForEntity(entity);
      if (this._cameraModalTwoWayTalkToken !== token) return;
      const twoWayTalkSupported =
        hasHaCameraWebRtcPlaybackCapability(capabilities);
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
    if (!Array.isArray(hiddenTabs)) return [...DEFAULT_HIDDEN_TABS];
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
    if (this._livePreviewRaf) {
      cancelAnimationFrame(this._livePreviewRaf);
      this._livePreviewRaf = 0;
    }
    this._pendingVisualPreviewUpdate = false;
    if (this._previewUpdateRaf) {
      cancelAnimationFrame(this._previewUpdateRaf);
      this._previewUpdateRaf = 0;
    }
    this._pendingEditorPreviewRouteIntent = null;
    this._editorPreviewLayoutObserver?.disconnect();
    this._editorPreviewLayoutObserver = null;
    this._editorPreviewLayoutObserverTarget = null;
    this._restoreEditorPreviewLayout();
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
    if (this._onCameraModalDocumentClick) {
      document.removeEventListener(
        "click",
        this._onCameraModalDocumentClick,
        true,
      );
    }
    this._haDirtyStateUnsubscribe?.();
    this._haDirtyStateUnsubscribe = null;
    this._haDirtyStateContext = null;
    this._haDirtyStateRequestPending = false;
    this._haDirtyStateSeeded = false;
    this._dialogActionHooksBound = false;
    this._standaloneDraftPreviousLandingPage = null;
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
    this._sourceConfig = config;
    const normalized = this._normalizeConfig(config);
    if (this._standaloneDraftPreviousLandingPage === undefined) {
      this._standaloneDraftPreviousLandingPage = null;
    }
    this._syncHiddenTabsDraftFromConfig(normalized);
    if (this._activeSettingsPanelId === undefined) {
      this._activeSettingsPanelId = null;
    }
    const incomingSig = this._configSignature(normalized);
    const currentSig = this._configSignature(this._config);
    if (this._rendered && incomingSig === currentSig) {
      this._config = normalized;
      this._scheduleEditorPreviewLayoutSync();
      return;
    }
    this._config = normalized;
    this._rendered = true;
    this._render();
    if (this._haDirtyBaselineConfig === undefined) {
      this._haDirtyBaselineConfig = this._homeAssistantConfig({
        readDom: false,
      });
      this._haDirtyBaselineSig = this._configSignature(
        this._haDirtyBaselineConfig,
      );
      this._hasConfigDraft = false;
      this._seedHomeAssistantDirtyState();
    }
    this._scheduleEditorPreviewLayoutSync();
  }

  set hass(hass) {
    this._hass = hass;
    if (this._ptzCapabilityCache instanceof Map) {
      this._ptzCapabilityCache.clear();
    }
    if (this._go2rtcMetadataCache instanceof Map) {
      this._go2rtcMetadataCache.clear();
    }
    if (this._haCameraCapabilityCache instanceof Map) {
      this._haCameraCapabilityCache.clear();
    }
    const modeKey = this._hass?.themes?.darkMode ? "dark" : "light";
    const key = `${this._frigateEntities().join(",")}|${modeKey}`;
    if (key !== this._lastEntityKey) {
      this._lastEntityKey = key;
      if (this._rendered) this._render();
    }
    this._scheduleEditorPreviewLayoutSync();
  }

  _normalizeConfig(config) {
    return normalizeCardConfig(config);
  }

  _dashboardSwipeOwnershipState() {
    const requested =
      this._config?.ha_dashboard_swipe_navigation_owner === true;
    const panel = findHomeAssistantLovelacePanel(null, globalThis.document);
    const dashboardConfig = panel?.lovelace?.config || null;
    if (!dashboardConfig) {
      return {
        requested,
        isOwner: requested,
        locked: false,
        conflict: false,
        owner: null,
        ownerPage: "",
        dashboardName: "",
      };
    }

    const ownership = resolveDashboardSwipeNavigationOwnership(
      dashboardConfig,
      CARD_TAG,
    );
    const currentViewName = resolveCurrentHomeAssistantViewName({
      panel,
      windowRef: globalThis.window,
    });
    const exactRecord = ownership.cards.find(
      ({ config }) => config === this._sourceConfig,
    );
    const currentViewCards = ownership.cards.filter(
      ({ viewName }) => viewName === currentViewName,
    );
    const isCurrentViewOwner =
      ownership.owner?.viewName === currentViewName &&
      currentViewCards.length === 1;
    const currentCardIsResolvedOwner =
      Boolean(ownership.owner) &&
      (ownership.owner === exactRecord || isCurrentViewOwner);
    const isOwner =
      requested &&
      (!ownership.owner || currentCardIsResolvedOwner);
    const conflict = requested && Boolean(ownership.owner) && !isOwner;
    const locked = Boolean(ownership.owner) && !currentCardIsResolvedOwner;
    const dashboardName =
      String(dashboardConfig?.title || "").trim() ||
      String(panel?.route?.prefix || "this dashboard")
        .replace(/^\/+/, "")
        .replace(/[-_]+/g, " ");
    const ownerPage = ownership.owner?.viewTitle ||
      ownership.owner?.viewName ||
      currentViewName ||
      "another page";
    return {
      requested,
      isOwner,
      locked,
      conflict,
      owner: ownership.owner,
      ownerPage,
      dashboardName,
    };
  }

  _landingPageOptionSignature(config) {
    const normalized = this._normalizeConfig(config);
    const desktop = getEnabledPageRoutes(
      normalized,
      DEVICE_ROUTE_BUCKETS.desktop,
    ).join("|");
    const mobile = getEnabledMobilePageModes(normalized).join("|");
    return `${desktop}::${mobile}::${normalized.landing_page}`;
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
    if (!probe.style.color) return fallback;
    this.appendChild(probe);
    const computed = getComputedStyle(probe).color;
    probe.remove();
    return this._rgbToHex(computed) || fallback;
  }

  _activeThemeModeKey() {
    return normalizeThemeMode(
      this._hass?.themes?.darkMode === true ? "dark" : "light",
    );
  }

  _deriveDarkPrimaryHex() {
    const primary = normalizeHexColor(
      this._resolveColorToHex("var(--primary-color)", ""),
    );
    if (!primary) {
      return this._resolveColorToHex(
        THEME_DEFAULTS["--c-primary-d"],
        "#000000",
      );
    }
    const darkenChannel = (offset) =>
      Math.round(Number.parseInt(primary.slice(offset, offset + 2), 16) * 0.75)
        .toString(16)
        .padStart(2, "0");
    return `#${darkenChannel(1)}${darkenChannel(3)}${darkenChannel(5)}`;
  }

  _themeDefaultHex(key, mode = this._activeThemeModeKey()) {
    const normalizedMode = normalizeThemeMode(mode);
    const themeContext = resolveHomeAssistantThemeContext(this._hass, {
      mode: normalizedMode,
    });
    if (key === "--c-primary-d" && themeContext.deriveDarkPrimary) {
      return this._deriveDarkPrimaryHex();
    }
    if (key === "--c-bg-tabs-holder") {
      const usesPrimaryBackground =
        themeContext.source === "custom" || normalizedMode === "dark";
      return this._resolveColorToHex(
        usesPrimaryBackground
          ? "var(--primary-background-color)"
          : "var(--secondary-background-color)",
        normalizedMode === "dark" ? "#181818" : "#f0f0f0",
      );
    }
    if (
      key === "--c-bg-mobile-list" ||
      key === "--c-bg-list" ||
      key === "--c-bg-cam-btn"
    ) {
      if (themeContext.source === "custom") {
        return this._resolveColorToHex(
          "var(--secondary-background-color)",
          normalizedMode === "dark" ? "#181818" : "#f0f0f0",
        );
      }
      return normalizedMode === "dark" ? "#181818" : "#f0f0f0";
    }
    return this._resolveColorToHex(THEME_DEFAULTS[key], "#000000");
  }

  _themeDefaultHexMap() {
    return Object.fromEntries(
      THEME_MODES.map((mode) => [
        mode,
        Object.fromEntries(
          THEME_CUSTOM_ROWS.map((row) => [
            row.key,
            this._themeDefaultHex(row.key, mode),
          ]),
        ),
      ]),
    );
  }

  _ensureThemeDraftCache() {
    const draft = Object.fromEntries(
      THEME_MODES.map((mode) => {
        const modeDraft = this._themeDraftCache?.[mode];
        const colors = Object.fromEntries(
          Object.entries(
            modeDraft && typeof modeDraft === "object" ? modeDraft : {},
          )
            .map(([key, color]) => [key, normalizeHexColor(color)])
            .filter(([, color]) => !!color),
        );
        return [mode, colors];
      }),
    );
    const { overrides } = resolveThemeCustomEditorConfig(
      this._config?.theme_custom,
      this._activeThemeModeKey(),
    );
    for (const mode of THEME_MODES) {
      Object.assign(draft[mode], overrides);
    }
    this._themeDraftCache = draft;
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

  _cameraPtzLabel(value) {
    return hasCameraPtz({ ptz: value }) ? "PTZ on" : "";
  }

  _cameraTwoWayTalkLabel(value) {
    return value === true ? "Two-Way Talk on" : "";
  }

  _cameraLinkedLightLabel(camera) {
    const names = linkedLightsForCamera(camera).map(({ entity }) =>
      linkedLightFriendlyName(entity, this._hass?.states?.[entity]),
    );
    if (!names.length) return "";
    return `${names.length > 1 ? "Lights" : "Light"}: ${names.join(", ")}`;
  }

  _cameraMetaLabel(camera) {
    return [
      ...(isCameraGroup(camera)
        ? [
            "2-camera group",
            normalizeCameraGroupLayout(camera.group?.layout) ===
            CAMERA_GROUP_LAYOUTS.stacked
              ? "Stacked"
              : "Side by Side",
          ]
        : []),
      this._cameraConnectionLabel(camera?.connection_type),
      this._cameraAlertsContentLabel(camera?.alerts_content),
      this._cameraPtzLabel(camera?.ptz),
      this._cameraTwoWayTalkLabel(camera?.two_way_talk),
      this._cameraLinkedLightLabel(camera),
    ]
      .filter(Boolean)
      .join(" · ");
  }

  _reorderCameras(from, to, placement = "replace") {
    if (from === to || from < 0 || to < 0) return;
    const cur = [...this._getCams()];
    if (from >= cur.length || to >= cur.length) return;
    const cameras = reorderItemsForDrop(cur, from, to, placement);
    this._config = { ...this._config, cameras };
    this._render();
    this._markHomeAssistantDirty(
      this._homeAssistantConfig({ readDom: false }),
    );
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
            ptz: null,
          }
        : cams[index] || {};
    this._editingCamIndex = index;
    this._cameraModalNameBeforeGroup = String(cam?.name || "");
    this._cameraModalAssignedGroupName = "";
    const title = this.querySelector("#camera-modal-title");
    const save = this.querySelector("#camera-modal-save");
    const modal = this.querySelector("#camera-modal");
    const name = this.querySelector("#camera-modal-name");
    const entity = this.querySelector("#camera-modal-entity");
    const secondaryEntity = this.querySelector(
      "#camera-modal-secondary-entity",
    );
    const connectionType = this.querySelector("#camera-modal-connection-type");
    const alertsContentAllReviews = this.querySelector(
      "#camera-modal-all-reviews",
    );
    const ptzEnabled = this.querySelector("#camera-modal-ptz-enabled");
    const twoWayTalkEnabled = this.querySelector(
      "#camera-modal-two-way-talk-enabled",
    );
    const linkedLights = linkedLightsForCamera(cam);
    const helper = this.querySelector("#camera-modal-helper");
    const selectedConnectionType = normalizeCameraConnectionType(
      cam?.connection_type,
    );
    if (title) title.textContent = index == null ? "Add" : "Edit";
    if (save) save.textContent = index == null ? "Add" : "Update";
    if (name) name.value = cam?.name || "";
    if (entity) {
      entity.value = cam?.entity || "";
      entity.dataset.value = cam?.entity || "";
    }
    if (secondaryEntity) {
      const value = cam?.group?.secondary_entity || "";
      secondaryEntity.value = value;
      secondaryEntity.dataset.value = value;
    }
    this._cameraModalGroupEnabled = isCameraGroup(cam);
    const groupLayout = normalizeCameraGroupLayout(cam?.group?.layout);
    this.querySelectorAll('[name="camera-modal-group-layout"]').forEach(
      (input) => {
        input.checked = input.value === groupLayout;
      },
    );
    this._syncCameraModalGroupFields();
    if (connectionType) {
      const nextType = normalizeCameraConnectionType(cam?.connection_type);
      connectionType.value = nextType;
      connectionType.dataset.value = nextType;
    }
    if (alertsContentAllReviews) {
      alertsContentAllReviews.checked =
        normalizeAlertsAreaContent(cam?.alerts_content) === "all_reviews";
    }
    if (ptzEnabled) {
      ptzEnabled.checked = hasCameraPtz(cam);
    }
    const ptzRotation = normalizePtzControlRotation(cam?.ptz?.rotation);
    this.querySelectorAll('[name="camera-modal-ptz-rotation"]').forEach(
      (input) => {
        input.checked = Number(input.value) === ptzRotation;
      },
    );
    if (twoWayTalkEnabled) {
      twoWayTalkEnabled.checked = cam?.two_way_talk === true;
    }
    [0, 1].forEach((lightIndex) => {
      const linkedLight = linkedLights[lightIndex] || null;
      this._setCameraModalLightFieldValues(lightIndex, linkedLight);
      this._setCameraModalLightEnabledState(
        lightIndex,
        Boolean(linkedLight),
      );
      this._syncCameraModalLightIconContext(
        linkedLight?.entity || "",
        lightIndex,
      );
    });
    this._syncCameraModalLightFields();
    if (helper) helper.textContent = "";
    this._cameraModalSelectorDismissPending = false;
    this._cameraModalSuppressedClickEvent = null;
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
    this._cameraModalGroupEnabled = false;
    this._cameraModalLightEnabled = false;
    this._cameraModalSecondLightEnabled = false;
    this._cameraModalNameBeforeGroup = "";
    this._cameraModalAssignedGroupName = "";
    this._cameraModalSelectorDismissPending = false;
    this._cameraModalSuppressedClickEvent = null;
  }

  _gridOrderCameraLabel(camera) {
    const entity = String(camera?.entity || "").trim();
    const entityLabel = String(
      this._hass?.states?.[entity]?.attributes?.friendly_name || "",
    ).trim();
    const configuredName =
      entityLabel ||
      entity.replace(/^camera\./, "").replace(/_/g, " ") ||
      "Camera";
    const member = String(camera?.group_member || "").trim();
    if (member === "A" || member === "B") {
      return `Camera ${member} [${configuredName}]`;
    }
    return this._cameraLabel(camera);
  }

  _handleCameraModalDocumentClick(event) {
    const modal = this.querySelector("#camera-modal");
    if (!modal || modal.classList.contains("hidden")) return;
    const modalCard = modal.querySelector?.(".cam-modal-card");
    if (!modalCard) return;
    this._cameraModalSuppressedClickEvent = null;
    const composedPath = event?.composedPath?.();
    const path = Array.isArray(composedPath) ? composedPath : [];
    const target = event?.target || null;
    const isContainedNode = (node) =>
      Boolean(
        node &&
          typeof node === "object" &&
          typeof node.nodeType === "number" &&
          modalCard.contains(node),
      );
    const insideModalCard =
      path.includes(modalCard) ||
      path.some((node) => isContainedNode(node)) ||
      isContainedNode(target);
    const selectorInteraction = path.some((node) =>
      CAMERA_MODAL_SELECTOR_IDS.has(String(node?.id || "")),
    );
    if (insideModalCard) {
      this._cameraModalSelectorDismissPending = selectorInteraction;
      return;
    }
    if (selectorInteraction || this._cameraModalSelectorDismissPending) {
      this._cameraModalSelectorDismissPending = false;
      this._cameraModalSuppressedClickEvent = event;
      return;
    }
    this._closeCameraModal();
  }

  _openCameraDeleteConfirmation(index) {
    const cameras = this._getCams();
    if (!Number.isInteger(index) || index < 0 || index >= cameras.length) {
      return;
    }
    this._pendingCameraRemovalIndex = index;
    const message = this.querySelector("#camera-delete-message");
    if (message) {
      message.textContent = `Are you sure you want to delete “${this._cameraLabel(cameras[index])}”? This action cannot be undone.`;
    }
    this.querySelector("#camera-delete-modal")?.classList.remove("hidden");
    this.querySelector("#camera-delete-confirm")?.focus?.();
  }

  _closeCameraDeleteConfirmation() {
    this.querySelector("#camera-delete-modal")?.classList.add("hidden");
    this._pendingCameraRemovalIndex = null;
  }

  _confirmCameraRemoval() {
    const index = this._pendingCameraRemovalIndex;
    this._closeCameraDeleteConfirmation();
    if (!Number.isInteger(index)) return;
    this._removeCamera(index);
  }

  _standaloneLandingPageRoutes() {
    return getEnabledPageRoutes(
      { ...this._config, card_view_standalone: false },
      DEVICE_ROUTE_BUCKETS.desktop,
    );
  }

  _openStandaloneLandingPageModal() {
    if (this._standaloneLandingModalOpen) return;
    const availableRoutes = this._standaloneLandingPageRoutes();
    const selectedRoute = availableRoutes[0] || PAGE_IDS.singleView;
    const selector = this.querySelector("#standalone-landing-page");
    if (selector) {
      selector.value = selectedRoute;
      selector.dataset.value = selectedRoute;
    }
    const helper = this.querySelector("#standalone-landing-helper");
    if (helper) helper.textContent = "";
    this._standaloneLandingModalOpen = true;
    const modal = this.querySelector("#standalone-landing-modal");
    try {
      if (typeof modal?.showModal === "function") {
        if (!modal.open) modal.showModal();
      } else {
        modal?.setAttribute?.("open", "");
        modal?.classList?.remove?.("hidden");
      }
    } catch (_) {
      modal?.setAttribute?.("open", "");
      modal?.classList?.remove?.("hidden");
    }
    selector?.focus?.();
  }

  _closeStandaloneLandingPageModal({ restoreToggle = true } = {}) {
    const modal = this.querySelector("#standalone-landing-modal");
    if (typeof modal?.close === "function" && modal.open) {
      modal.close();
    } else {
      modal?.removeAttribute?.("open");
      modal?.classList?.add?.("hidden");
    }
    this._standaloneLandingModalOpen = false;
    if (restoreToggle) {
      const toggle = this.querySelector("#card_view_standalone");
      if (toggle) {
        toggle.checked = true;
        toggle.dataset.fvcStandaloneValue = "true";
      }
    }
  }

  _confirmStandaloneLandingPage() {
    const selector = this.querySelector("#standalone-landing-page");
    const selectedRoute = normalizePageRoute(
      selector?.dataset?.value || selector?.value,
    );
    if (!this._standaloneLandingPageRoutes().includes(selectedRoute)) {
      const helper = this.querySelector("#standalone-landing-helper");
      if (helper) helper.textContent = "Select an available landing page.";
      return;
    }

    const landingPage = this.querySelector("#landing_page");
    if (landingPage) {
      landingPage.value = selectedRoute;
      landingPage.dataset.value = selectedRoute;
    }
    this._closeStandaloneLandingPageModal({ restoreToggle: false });
    this._u({
      dispatch: false,
      preview: true,
      previewRouteIntent: {
        type: EDITOR_PREVIEW_ROUTE_INTENTS.navigate,
        pageId: selectedRoute,
      },
    });
  }

  _wireStandaloneLandingPageTransition(scheduleUpdate) {
    const toggle = this.querySelector("#card_view_standalone");
    if (!toggle) return;
    toggle.dataset.fvcStandaloneValue =
      this._config?.card_view_standalone === true ? "true" : "false";
    const handleToggle = (event) => {
      const detailValue = event?.detail?.value;
      const enabled =
        typeof detailValue === "boolean"
          ? detailValue
          : resolveSwitchChecked(toggle);
      const requestedValue = enabled ? "true" : "false";
      if (toggle.dataset.fvcStandaloneValue === requestedValue) return;
      toggle.dataset.fvcStandaloneValue = requestedValue;

      if (enabled) {
        if (this._config?.card_view_standalone !== true) {
          const landingPage = this.querySelector("#landing_page");
          this._standaloneDraftPreviousLandingPage = normalizePageRoute(
            landingPage?.dataset?.value ||
              landingPage?.value ||
              this._config?.landing_page,
          );
          scheduleUpdate?.({
            type: EDITOR_PREVIEW_ROUTE_INTENTS.enterStandalone,
          });
          return;
        }
        scheduleUpdate?.();
        return;
      }

      if (this._standaloneDraftPreviousLandingPage) {
        const landingPage = this.querySelector("#landing_page");
        if (landingPage) {
          landingPage.value = this._standaloneDraftPreviousLandingPage;
          landingPage.dataset.value =
            this._standaloneDraftPreviousLandingPage;
        }
        scheduleUpdate?.({
          type: EDITOR_PREVIEW_ROUTE_INTENTS.revertStandaloneDraft,
        });
        return;
      }
      this._openStandaloneLandingPageModal();
    };
    ["input", "change", "value-changed"].forEach((eventName) => {
      toggle.addEventListener(eventName, handleToggle);
    });
  }

  _cameraModalEntityValue() {
    const entity = this.querySelector("#camera-modal-entity");
    return (entity?.dataset?.value ?? entity?.value ?? entity?.__value ?? "")
      .toString()
      .trim();
  }

  _cameraModalSecondaryEntityValue() {
    const entity = this.querySelector("#camera-modal-secondary-entity");
    return (entity?.dataset?.value ?? entity?.value ?? entity?.__value ?? "")
      .toString()
      .trim();
  }

  _cameraModalGroupLayoutValue() {
    return normalizeCameraGroupLayout(
      this.querySelector('[name="camera-modal-group-layout"]:checked')?.value,
    );
  }

  _syncCameraModalGroupFields() {
    const enabled = this._cameraModalGroupEnabled === true;
    const addButton = this.querySelector("#camera-modal-add-secondary");
    const help = this.querySelector("#camera-modal-secondary-help");
    const removeButton = this.querySelector("#camera-modal-remove-secondary");
    const fields = this.querySelector("#camera-modal-group-fields");
    if (addButton) addButton.hidden = enabled;
    if (help) help.hidden = enabled;
    if (fields) fields.hidden = !enabled;
    if (removeButton) {
      removeButton.textContent = this._cameraModalSecondaryEntityValue()
        ? "Remove camera"
        : "Cancel";
    }
  }

  _setCameraModalGroupEnabled(enabled) {
    const wasEnabled = this._cameraModalGroupEnabled === true;
    this._cameraModalGroupEnabled = enabled === true;
    const nameInput = this.querySelector("#camera-modal-name");
    if (this._cameraModalGroupEnabled && !wasEnabled) {
      const currentName = String(nameInput?.value || "").trim();
      if (!currentName) {
        const defaultName = nextCameraGroupDefaultName(this._getCams(), {
          excludeIndex: this._editingCamIndex,
        });
        if (nameInput) nameInput.value = defaultName;
        this._cameraModalAssignedGroupName = defaultName;
      }
    } else if (!this._cameraModalGroupEnabled && wasEnabled) {
      const currentName = String(nameInput?.value || "").trim();
      if (
        this._cameraModalAssignedGroupName &&
        currentName === this._cameraModalAssignedGroupName
      ) {
        if (nameInput) nameInput.value = this._cameraModalNameBeforeGroup || "";
      }
      this._cameraModalAssignedGroupName = "";
    }
    if (!this._cameraModalGroupEnabled) {
      const secondary = this.querySelector("#camera-modal-secondary-entity");
      if (secondary) {
        secondary.value = "";
        secondary.dataset.value = "";
      }
    }
    const helper = this.querySelector("#camera-modal-helper");
    if (helper) helper.textContent = "";
    this._syncCameraModalGroupFields();
  }

  _cameraModalConnectionTypeValue() {
    const connectionType = this.querySelector("#camera-modal-connection-type");
    return normalizeCameraConnectionType(
      connectionType?.dataset?.value ||
        connectionType?.value ||
        DEFAULT_CAMERA_CONNECTION_TYPE,
    );
  }

  _cameraModalPtzRotationValue() {
    return normalizePtzControlRotation(
      this.querySelector('[name="camera-modal-ptz-rotation"]:checked')?.value,
    );
  }

  _cameraModalLightSuffix(index = 0) {
    return index === 1 ? "-2" : "";
  }

  _cameraModalLightEntityValue(index = 0) {
    const element = this.querySelector(
      `#camera-modal-light-entity${this._cameraModalLightSuffix(index)}`,
    );
    return String(
      element?.dataset?.value ?? element?.value ?? element?.__value ?? "",
    ).trim();
  }

  _cameraModalLightIconValue(index = 0) {
    const element = this.querySelector(
      `#camera-modal-light-icon${this._cameraModalLightSuffix(index)}`,
    );
    return String(
      element?.dataset?.value ?? element?.value ?? element?.__value ?? "",
    ).trim();
  }

  _cameraModalLightPositionValue(index = 0) {
    return normalizeLinkedLightPosition(
      this.querySelector(
        `[name="camera-modal-light-position${this._cameraModalLightSuffix(index)}"]:checked`,
      )?.value,
    );
  }

  _syncCameraModalLightIconContext(
    entity = this._cameraModalLightEntityValue(),
    index = 0,
  ) {
    const selector = this.querySelector(
      `#camera-modal-light-icon${this._cameraModalLightSuffix(index)}`,
    );
    if (!selector) return;
    selector.context = entity ? { icon_entity: entity } : {};
  }

  _cameraModalLightEnabledAt(index = 0) {
    return index === 1
      ? this._cameraModalSecondLightEnabled === true
      : this._cameraModalLightEnabled === true;
  }

  _setCameraModalLightEnabledState(index, enabled) {
    if (index === 1) {
      this._cameraModalSecondLightEnabled = enabled === true;
      return;
    }
    this._cameraModalLightEnabled = enabled === true;
  }

  _setCameraModalLightFieldValues(index, config = null) {
    const suffix = this._cameraModalLightSuffix(index);
    const entity = this.querySelector(`#camera-modal-light-entity${suffix}`);
    const icon = this.querySelector(`#camera-modal-light-icon${suffix}`);
    const entityValue = String(config?.entity || "");
    const iconValue = String(config?.icon || "");
    if (entity) {
      entity.value = entityValue;
      entity.dataset.value = entityValue;
    }
    if (icon) {
      icon.value = iconValue;
      icon.dataset.value = iconValue;
    }
    const position = normalizeLinkedLightPosition(config?.position);
    this.querySelectorAll(
      `[name="camera-modal-light-position${suffix}"]`,
    ).forEach((input) => {
      input.checked = input.value === position;
    });
  }

  _syncCameraModalLightFields() {
    const firstEnabled = this._cameraModalLightEnabledAt(0);
    const secondEnabled = this._cameraModalLightEnabledAt(1);
    const firstAdd = this.querySelector("#camera-modal-add-light");
    const secondAdd = this.querySelector("#camera-modal-add-light-2");
    if (firstAdd) firstAdd.hidden = firstEnabled;
    if (secondAdd) secondAdd.hidden = !firstEnabled || secondEnabled;
    [0, 1].forEach((index) => {
      const suffix = this._cameraModalLightSuffix(index);
      const enabled = this._cameraModalLightEnabledAt(index);
      const fields = this.querySelector(`#camera-modal-light-fields${suffix}`);
      const removeButton = this.querySelector(
        `#camera-modal-remove-light${suffix}`,
      );
      if (fields) fields.hidden = !enabled;
      if (removeButton) {
        removeButton.textContent = this._cameraModalLightEntityValue(index)
          ? `Remove light${index === 1 ? " 2" : ""}`
          : "Cancel";
      }
    });
  }

  _setCameraModalLightEnabled(enabled, index = 0) {
    if (!enabled && index === 0 && this._cameraModalLightEnabledAt(1)) {
      const promoted = {
        entity: this._cameraModalLightEntityValue(1),
        icon: this._cameraModalLightIconValue(1),
        position: this._cameraModalLightPositionValue(1),
      };
      this._setCameraModalLightFieldValues(0, promoted);
      this._setCameraModalLightEnabledState(0, true);
      this._setCameraModalLightFieldValues(1, null);
      this._setCameraModalLightEnabledState(1, false);
      this._syncCameraModalLightIconContext(promoted.entity, 0);
      this._syncCameraModalLightIconContext("", 1);
    } else {
      this._setCameraModalLightEnabledState(index, enabled);
      if (!enabled) {
        this._setCameraModalLightFieldValues(index, null);
        this._syncCameraModalLightIconContext("", index);
      }
    }
    const helper = this.querySelector("#camera-modal-helper");
    if (helper) helper.textContent = "";
    this._syncCameraModalLightFields();
  }

  _saveCameraModal() {
    const entity = this._cameraModalEntityValue();
    const secondaryEntity = this._cameraModalSecondaryEntityValue();
    const name = (
      this.querySelector("#camera-modal-name")?.value || ""
    ).toString();
    const connectionType = normalizeCameraConnectionType(
      this.querySelector("#camera-modal-connection-type")?.dataset?.value ||
        this.querySelector("#camera-modal-connection-type")?.value ||
        DEFAULT_CAMERA_CONNECTION_TYPE,
    );
    const alertsContentToggle = this.querySelector("#camera-modal-all-reviews");
    const ptzEnabledToggle = this.querySelector("#camera-modal-ptz-enabled");
    const twoWayTalkToggle = this.querySelector(
      "#camera-modal-two-way-talk-enabled",
    );
    const alertsContent =
      resolveSwitchChecked(alertsContentToggle) === true
        ? "all_reviews"
        : "alerts_only";
    const ptzSupported = ptzEnabledToggle?.dataset?.supported === "true";
    const ptzEnabled = ptzSupported && resolveSwitchChecked(ptzEnabledToggle);
    const twoWayTalkEnabled = resolveSwitchChecked(twoWayTalkToggle);
    const requestedLinkedLights = [0, 1]
      .filter((index) => this._cameraModalLightEnabledAt(index))
      .map((index) => ({
        entity: this._cameraModalLightEntityValue(index),
        icon: this._cameraModalLightIconValue(index),
        position: this._cameraModalLightPositionValue(index),
      }));
    const linkedEntities = normalizeLinkedEntitiesConfig(requestedLinkedLights);
    const ptz = ptzEnabled
      ? normalizeCameraPtzConfig({
          enabled: true,
          rotation: this._cameraModalPtzRotationValue(),
        })
      : null;
    const helper = this.querySelector("#camera-modal-helper");
    if (!entity) {
      if (helper) helper.textContent = "Camera is required.";
      return;
    }
    if (this._cameraModalGroupEnabled && !secondaryEntity) {
      if (helper) helper.textContent = "Second camera is required.";
      return;
    }
    if (this._cameraModalGroupEnabled && secondaryEntity === entity) {
      if (helper) helper.textContent = "Choose two different cameras.";
      return;
    }
    if (
      requestedLinkedLights.some(
        ({ entity: lightEntity }) => !lightEntity.startsWith("light."),
      )
    ) {
      if (helper) helper.textContent = "Select a light entity.";
      return;
    }
    if (
      new Set(requestedLinkedLights.map(({ entity: lightEntity }) => lightEntity))
        .size !== requestedLinkedLights.length
    ) {
      if (helper) helper.textContent = "Choose two different lights.";
      return;
    }
    const cur = [...this._getCams()];
    const usedEntities = cur.flatMap((camera, index) =>
      index === this._editingCamIndex ? [] : cameraMemberEntities(camera),
    );
    const requestedEntities = [entity];
    if (this._cameraModalGroupEnabled) requestedEntities.push(secondaryEntity);
    if (requestedEntities.some((value) => usedEntities.includes(value))) {
      if (helper) helper.textContent = "That camera is already configured.";
      return;
    }
    const group = this._cameraModalGroupEnabled
      ? normalizeCameraGroupConfig(
          {
            secondary_entity: secondaryEntity,
            layout: this._cameraModalGroupLayoutValue(),
          },
          { primaryEntity: entity },
        )
      : null;
    const nextCamera = {
      entity,
      name,
      connection_type: connectionType,
      alerts_content: alertsContent,
      ptz,
      ...(twoWayTalkEnabled ? { two_way_talk: true } : {}),
      ...(group ? { group } : {}),
      ...(linkedEntities.length ? { linked_entities: linkedEntities } : {}),
    };
    if (this._editingCamIndex == null) {
      if (
        countPhysicalCameras(cur) + cameraMemberEntities(nextCamera).length >
        MAX_CAMERAS
      ) {
        if (helper) helper.textContent = `Maximum ${MAX_CAMERAS} cameras.`;
        return;
      }
      cur.push(nextCamera);
    } else if (cur[this._editingCamIndex]) {
      const next = [...cur];
      next[this._editingCamIndex] = nextCamera;
      if (countPhysicalCameras(next) > MAX_CAMERAS) {
        if (helper) helper.textContent = `Maximum ${MAX_CAMERAS} cameras.`;
        return;
      }
      cur[this._editingCamIndex] = nextCamera;
    }
    this._config = {
      ...this._config,
      cameras: limitCameraConfigsByPhysicalCount(cur, MAX_CAMERAS),
    };
    this._closeCameraModal();
    this._render();
    this._markHomeAssistantDirty(
      this._homeAssistantConfig({ readDom: false }),
    );
  }

  _removeCamera(index) {
    const cur = [...this._getCams()];
    if (!Number.isInteger(index) || index < 0 || index >= cur.length) return;
    cur.splice(index, 1);
    this._config = { ...this._config, cameras: cur };
    this._render();
    this._markHomeAssistantDirty(
      this._homeAssistantConfig({ readDom: false }),
    );
  }

  _wireCameraDragAndDrop() {
    const rows = Array.from(this.querySelectorAll(".cam-row"));
    wireCameraRowDragAndDrop({
      rows,
      clearDropTargets: () => {
        this.querySelectorAll(".cam-row").forEach((row) => {
          row.classList.remove(
            "drop-target",
            "drop-target-before",
            "drop-target-after",
          );
        });
      },
      onReorder: (fromIndex, toIndex, placement) => {
        this._reorderCameras(fromIndex, toIndex, placement);
      },
    });
  }
  _renderSettingsPanel({ id, title, icon, content, active = false }) {
    const iconValue = String(icon || "").trim();
    const iconMarkup = iconValue.startsWith("<svg")
      ? `<span class="setting-title-icon" aria-hidden="true">${iconValue}</span>`
      : `<ha-icon icon="${escapeHtmlAttribute(iconValue)}"></ha-icon>`;
    return `<section class="settings-panel ${active ? "active" : ""}" data-panel="${escapeHtmlAttribute(id)}">
      <button type="button" class="setting-title" data-panel-toggle="${escapeHtmlAttribute(id)}" aria-expanded="${active ? "true" : "false"}">
        ${iconMarkup}
        <h3>${escapeHtml(title)}</h3>
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

    const finishPrimaryAction = () => {
      this._standaloneDraftPreviousLandingPage = null;
      if (this._hasConfigDraft) {
        this._commitDraftToHomeAssistantDialog();
      }
      this._hasConfigDraft = false;
      this._hasVisualDraft = false;
      this._emitPreviewDraft(null, {
        type: EDITOR_PREVIEW_ROUTE_INTENTS.commit,
      });
    };

    const finishSecondaryAction = (button) => {
      if (button?.classList?.contains?.("gui-mode-button")) return;
      this._hasConfigDraft = false;
      this._hasVisualDraft = false;
      this._emitPreviewDraft(null);
    };

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
            if (this.contains?.(button)) return;
            const kind = dialogActionKindFromElement(button);
            if (!kind) return;
            const handler = () => {
              if (kind === "primary") {
                finishPrimaryAction();
                return;
              }
              finishSecondaryAction(button);
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
      finishPrimaryAction();
    };

    this._onDialogSecondaryActionClick = (ev) => {
      if (dialogActionKindFromEvent(ev) !== "secondary") return;
      const button = ev
        .composedPath?.()
        ?.find?.(
          (node) =>
            node instanceof Element &&
            dialogActionKindFromElement(node) === "secondary",
        );
      finishSecondaryAction(button);
    };

    this._onCameraModalDocumentClick = (event) => {
      this._handleCameraModalDocumentClick(event);
    };

    document.addEventListener("click", this._onDialogPrimaryActionClick, true);
    document.addEventListener(
      "click",
      this._onDialogSecondaryActionClick,
      true,
    );
    document.addEventListener(
      "click",
      this._onCameraModalDocumentClick,
      true,
    );
    bindDialogActionButtons();
    this._dialogActionHooksBound = true;
  }

  _wireLivePreviewUpdates() {
    if (this._livePreviewHooksBound) return;

    const configUpdateSelectors = [
      "#title",
      "#subtitle",
      "#display_title",
      "#display_subtitle",
      "#display_logo",
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
      "#mobile_view_rotate_to_fullscreen",
      "#mobile_view_outer_border",
      "#mobile_view_ha_navbar_bottom",
      "#mobile_view_ha_navbar_stack_tabs",
      "#mobile_view_ha_navbar_dashboard",
      "#ha_dashboard_swipe_navigation_owner",
      "#ha_dashboard_swipe_navigation",
      '[name="ha_dashboard_swipe_pages"]',
      "#ha_dashboard_swipe_include_other_cards",
      "[data-ha-dashboard-swipe-include-subviews]",
      "#ha_dashboard_swipe_mouse_enabled",
      "#preview_page_enabled",
      "#preview_page_live_cameras",
      "#preview_page_live_cameras_mobile",
      "#preview_page_alert_live_duration_seconds",
      "#preview_page_show_title_bars",
      "#wide_view_page_enabled",
      "#wide_view_live_cameras",
      "#wide_view_alert_takeover",
      "#wide_view_timeline_enabled",
      "#wide_view_timeline_default_open",
      "#wide_view_timeline_default_scale",
      "#card_view_page_enabled",
      "#card_view_alert_takeover",
      "#card_view_drawer_default_open",
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
      "#event_pre_post_roll_enabled",
      "#favorites_mixed_cameras",
      "[data-active-tab]",
      "[data-theme-option]",
      "[data-theme-scope]",
      "[data-theme-color]",
      "[data-theme-reset]",
      "[data-theme-default]",
    ];

    const visualPreviewSelectors = [
      "#stream_height",
      "#stream_height_unit",
      "#col_left_width_pct",
      "#tight_margins",
      "#shadows",
      "#borders",
      "#rounded_corners",
      "#outer_shadows",
    ];

    const eventMatchesSelectors = (event, selectors) => {
      const path = Array.isArray(event.composedPath?.())
        ? event.composedPath()
        : [];
      return path.some(
        (node) =>
          node instanceof Element &&
          selectors.some((selector) => node.matches?.(selector)),
      );
    };

    const handlePreviewUpdate = (event) => {
      if (!eventMatchesSelectors(event, configUpdateSelectors)) return;
      if (eventMatchesSelectors(event, visualPreviewSelectors)) {
        this._pendingVisualPreviewUpdate = true;
      }
      if (this._livePreviewRaf) return;
      this._livePreviewRaf = requestAnimationFrame(() => {
        this._livePreviewRaf = 0;
        const preview = this._pendingVisualPreviewUpdate === true;
        this._pendingVisualPreviewUpdate = false;
        this._u({ dispatch: false, preview });
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
      Number.isInteger(streamHeight) &&
      streamHeight >= CARD_HEIGHT_MIN &&
      streamHeight <= CARD_HEIGHT_MAX
        ? ""
        : `Select a whole number from ${CARD_HEIGHT_MIN} to ${CARD_HEIGHT_MAX}.`;
    this._setEditorFieldError("#stream_height", streamHeightMessage);
    if (streamHeightMessage) valid = false;

    const wideViewEnabled =
      this.querySelector("#wide_view_page_enabled")?.checked === true;
    const colWidthRaw = String(
      this.querySelector("#col_left_width_pct")?.value || "",
    ).trim();
    const colWidth = Number(colWidthRaw);
    const colWidthMessage =
      !wideViewEnabled ||
      (Number.isInteger(colWidth) &&
        colWidth >= WIDE_LEFT_WIDTH_MIN &&
        colWidth <= WIDE_LEFT_WIDTH_MAX)
        ? ""
        : `Select a whole number from ${WIDE_LEFT_WIDTH_MIN} to ${WIDE_LEFT_WIDTH_MAX}.`;
    this._setEditorFieldError("#col_left_width_pct", colWidthMessage);
    if (colWidthMessage) valid = false;

    return valid;
  }

  _render() {
    const frigEntities = this._frigateEntities();
    const cams = this._getCams();
    const dashboardSwipeOwnership = this._dashboardSwipeOwnershipState();
    const dashboardSwipeMode = normalizeDashboardSwipeNavigationMode(
      this._config?.ha_dashboard_swipe_navigation,
    );
    const dashboardSwipeSettingsEnabled =
      dashboardSwipeOwnership.isOwner && dashboardSwipeOwnership.requested;
    const dashboardSwipeOwnerSwitchDisabled =
      dashboardSwipeOwnership.locked && !dashboardSwipeOwnership.requested;
    const ownerPageName = String(dashboardSwipeOwnership.ownerPage || "");
    const ownerPageLabel = /^page\b/i.test(ownerPageName)
      ? ownerPageName
      : `Page ${ownerPageName}`;
    const ownerPageMarkup = `<strong>${escapeHtml(ownerPageLabel)}</strong>`;
    const dashboardNameMarkup = `<strong>${escapeHtml(
      dashboardSwipeOwnership.dashboardName || "this dashboard",
    )}</strong>`;
    const dashboardSwipeOwnershipMessage = dashboardSwipeOwnership.locked
      ? dashboardSwipeOwnership.conflict
        ? `This card also claims swipe control in raw YAML, but the FrigateView Card on ${ownerPageMarkup} is first in dashboard ${dashboardNameMarkup} and remains authoritative. Disable this switch here or remove the duplicate YAML setting.`
        : `The FrigateView Card on ${ownerPageMarkup} controls swipe navigation for dashboard ${dashboardNameMarkup}. Disable control there before enabling it from this card.`
      : "";
    const dashboardSwipeOptions = [
      {
        value: DASHBOARD_SWIPE_NAVIGATION_MODES.dashboardWide,
        label: "Dashboard Wide",
        description:
          "Swipe through dashboard pages and the selected FrigateView pages.",
      },
      {
        value: DASHBOARD_SWIPE_NAVIGATION_MODES.insideCard,
        label: "Inside Card Only",
        description:
          "Swipe only between the selected FrigateView pages. Other dashboard pages remain excluded.",
      },
      {
        value: DASHBOARD_SWIPE_NAVIGATION_MODES.landingDashboard,
        label: "Landing Page plus Dashboard Pages",
        description:
          "Use the configured landing page as the only FrigateView swipe stop between dashboard pages.",
      },
      {
        value: DASHBOARD_SWIPE_NAVIGATION_MODES.none,
        label: "None",
        description:
          "Disable FrigateView swipe navigation while retaining ownership of this dashboard setting.",
      },
    ];
    const dashboardSwipeChoices = dashboardSwipeOptions
      .map(({ value, label, description }) => {
        const selected = value === dashboardSwipeMode;
        const isInsideCard =
          value === DASHBOARD_SWIPE_NAVIGATION_MODES.insideCard;
        const supportsSubviews =
          value === DASHBOARD_SWIPE_NAVIGATION_MODES.dashboardWide ||
          value === DASHBOARD_SWIPE_NAVIGATION_MODES.landingDashboard;
        return `<div class="editor-swipe-choice${selected ? " selected" : ""}">
          <label class="editor-choice-chip">
            <input class="editor-choice-chip-input" type="radio" name="ha_dashboard_swipe_navigation" value="${escapeHtmlAttribute(value)}" ${selected ? "checked" : ""} ${dashboardSwipeSettingsEnabled ? "" : "disabled"}>
            <span class="editor-choice-chip-body">
              <span class="editor-choice-chip-indicator" aria-hidden="true"></span>
              <span class="editor-choice-chip-copy"><span class="editor-choice-chip-text">${escapeHtml(label)}</span><span class="editor-choice-chip-description">${escapeHtml(description)}</span></span>
            </span>
          </label>
          ${isInsideCard ? `<label class="editor-swipe-choice-footer"><span>Include Other FrigateView Pages</span><ha-switch id="ha_dashboard_swipe_include_other_cards" ${this._config?.ha_dashboard_swipe_include_other_cards ? "checked" : ""} ${dashboardSwipeSettingsEnabled && selected ? "" : "disabled"}></ha-switch></label>` : ""}
          ${supportsSubviews ? `<label class="editor-swipe-choice-footer"><span>Swipe to Subviews</span><ha-switch data-ha-dashboard-swipe-include-subviews="${escapeHtmlAttribute(value)}" ${this._config?.ha_dashboard_swipe_include_subviews ? "checked" : ""} ${dashboardSwipeSettingsEnabled && selected ? "" : "disabled"}></ha-switch></label>` : ""}
        </div>`;
      })
      .join("");
    const dashboardSwipePageSelectionVisible = [
      DASHBOARD_SWIPE_NAVIGATION_MODES.dashboardWide,
      DASHBOARD_SWIPE_NAVIGATION_MODES.insideCard,
    ].includes(dashboardSwipeMode);
    const enabledDesktopPages = new Set(
      getEnabledPageRoutes(this._config, DEVICE_ROUTE_BUCKETS.desktop),
    );
    const desktopLandingPage = normalizePageRoute(
      this._config?.landing_page,
    );
    const selectedDashboardSwipePages = new Set(
      resolveDashboardSwipePageSelection(
        this._config,
        DEVICE_ROUTE_BUCKETS.desktop,
      ),
    );
    const dashboardSwipePageLabels = {
      [PAGE_IDS.preview]: "Preview Page",
      [PAGE_IDS.singleView]: "SingleView Page",
      [PAGE_IDS.mobileView]: "Mobile View Page",
      [PAGE_IDS.wideView]: "Wide View Page",
      [PAGE_IDS.cardView]: "Card View Page",
    };
    const dashboardSwipePageChoices = DASHBOARD_SWIPE_PAGE_OPTIONS.map(
      (pageId) => {
        const isLandingPage = pageId === desktopLandingPage;
        const disabled =
          !dashboardSwipeSettingsEnabled ||
          !enabledDesktopPages.has(pageId) ||
          isLandingPage;
        return `<label class="editor-choice-chip">
          <input class="editor-choice-chip-input" type="checkbox" name="ha_dashboard_swipe_pages" value="${escapeHtmlAttribute(pageId)}" ${selectedDashboardSwipePages.has(pageId) ? "checked" : ""} ${isLandingPage ? 'data-dashboard-swipe-landing="true"' : ""} ${disabled ? "disabled" : ""}>
          <span class="editor-choice-chip-body">
            <span class="editor-choice-chip-indicator" aria-hidden="true"></span>
            <span class="editor-choice-chip-text">${escapeHtml(dashboardSwipePageLabels[pageId])}</span>
          </span>
        </label>`;
      },
    ).join("");
    const physicalCameraCount = countPhysicalCameras(cams);
    const physicalGridCameras = flattenCameraMembers(cams);
    const gridOrder = normalizeGridOrderConfig(
      this._config?.grid_order,
      cams,
    );
    const gridOrderCamerasByEntity = new Map(
      physicalGridCameras.map((camera) => [camera.entity, camera]),
    );
    const gridVisibleCameraCount =
      gridOrder.mode === GRID_ORDER_MODES.custom
        ? gridOrder.included.length
        : physicalCameraCount;
    const canAddCamera = physicalCameraCount < MAX_CAMERAS;
    const timezoneDisplay = this._timezoneDisplay();
    const hiddenTabs = new Set(
      this._normalizeHiddenTabs(
        this._hiddenTabsDraft ?? this._config?.hidden_tabs,
      ),
    );
    this._ensureThemeDraftCache();
    const activeTheme = this._config?.theme === "custom" ? "custom" : "default";
    const activeThemeMode = this._activeThemeModeKey();
    const themeCustom = resolveThemeCustomEditorConfig(
      this._config?.theme_custom,
      activeThemeMode,
    );
    const themeCustomDefaults = normalizeThemeCustomDefaultsConfig(
      this._config?.theme_custom_defaults,
    );
    const activeThemeScope = themeCustom.scope;
    const activeThemeCustom = themeCustom.overrides;
    const activeThemeDefaults = themeCustomDefaults[activeThemeMode] || {};
    const activeThemeDraft = this._themeDraftCache[activeThemeMode] || {};
    const streamHeight = normalizeCardHeight(this._config?.stream_height);
    const streamHeightUnit = normalizeCardHeightUnit(
      this._config?.stream_height_unit,
    );
    const wideLeftWidth = normalizeWideLeftWidth(
      this._config?.col_left_width_pct,
    );
    const timelineDefaultScale = normalizeWideTimelineScale(
      this._config?.wide_view_timeline_default_scale,
    );
    const realtimePollSeconds = REALTIME_POLL_OPTIONS_SECONDS.includes(
      Number(this._config?.realtime_poll_seconds),
    )
      ? Number(this._config.realtime_poll_seconds)
      : 5;
    const snapshotUpdateSeconds = normalizeNumberChoice(
      this._config?.snapshot_update_seconds,
      SNAPSHOT_UPDATE_OPTIONS_SECONDS,
      SNAPSHOT_UPDATE_SECONDS,
    );
    const previewAlertLiveDurationSeconds = normalizeNumberChoice(
      this._config?.preview_page_alert_live_duration_seconds,
      PREVIEW_ALERT_LIVE_DURATION_OPTIONS_SECONDS,
      Math.round(PREVIEW_ALERT_HOLD_MS / 1000),
    );
    const slideshowAlertHoldSeconds = normalizeNumberChoice(
      this._config?.slideshow_alert_hold_seconds,
      SLIDESHOW_ALERT_HOLD_OPTIONS_SECONDS,
      Math.round(SLIDESHOW_ALERT_HOLD_MS / 1000),
    );
    const slideshowRotationSeconds = normalizeNumberChoice(
      this._config?.slideshow_rotation_seconds,
      SLIDESHOW_ROTATION_OPTIONS_SECONDS,
      30,
    );
    const gridRotationSeconds = GRID_ROTATION_OPTIONS_SECONDS.includes(
      Number(this._config?.grid_rotation_seconds),
    )
      ? Number(this._config.grid_rotation_seconds)
      : 30;
    const pageRouteLabel = (pageId) => {
      if (pageId === PAGE_IDS.mobileView) return "Mobile";
      if (pageId === PAGE_IDS.preview) return "Preview";
      if (pageId === PAGE_IDS.wideView) return "Wide View";
      if (pageId === PAGE_IDS.cardView) return "Card View";
      return "Single View";
    };
    const landingPageOptions = getEnabledPageRoutes(
      this._config,
      DEVICE_ROUTE_BUCKETS.desktop,
    ).map((pageId) => ({ value: pageId, label: pageRouteLabel(pageId) }));
    const standaloneLandingPageOptions = this._standaloneLandingPageRoutes()
      .map((pageId) => ({ value: pageId, label: pageRouteLabel(pageId) }));
    const mobilePageLabels = {
      [MOBILE_PAGE_MODES.mobile]: "Mobile",
      [MOBILE_PAGE_MODES.previewMobile]: "Preview + Mobile",
      [MOBILE_PAGE_MODES.previewSingle]: "Preview + Single View",
      [MOBILE_PAGE_MODES.single]: "Single View",
    };
    const mobilePageOptions = getEnabledMobilePageModes(this._config).map(
      (mode) => ({ value: mode, label: mobilePageLabels[mode] }),
    );
    const tabToggle = (id, label) => `<ha-formfield label="${label}">
          <ha-switch data-active-tab="${id}" ${hiddenTabs.has(id) ? "" : "checked"}></ha-switch>
        </ha-formfield>`;
    const themeRows = THEME_CUSTOM_ROWS.map((row) => {
      const key = row.key;
      const defaultHex = this._themeDefaultHex(key, activeThemeMode);
      const saved = normalizeHexColor(activeThemeCustom[key]);
      const draft = normalizeHexColor(activeThemeDraft[key]);
      const value = saved || draft || defaultHex;
      const useDefault = activeThemeDefaults[key] === true;
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
    const themeScopeButtons = [
      { value: "light", label: "Light", icon: "mdi:white-balance-sunny" },
      { value: "dark", label: "Dark", icon: "mdi:weather-night" },
      { value: "both", label: "Both", icon: "mdi:theme-light-dark" },
    ]
      .map(({ value, label, icon }) => {
        const isActive = activeThemeScope === value;
        return `<button
          type="button"
          class="theme-scope-opt ${isActive ? "active" : ""}"
          data-theme-scope="${value}"
          role="radio"
          aria-checked="${isActive ? "true" : "false"}"
          aria-label="Apply custom theme in ${label.toLowerCase()} mode${value === "both" ? "s" : ""}"
        ><ha-icon icon="${icon}"></ha-icon><span>${label}</span></button>`;
      })
      .join("");
    const cameraRows = cams
      .map(
        (cam, i) => `
      <div class="cam-row" draggable="true" data-row="${i}">
        <button class="cam-drag" type="button" title="Drag to reorder" aria-label="Drag to reorder"><ha-icon icon="mdi:drag-horizontal-variant"></ha-icon></button>
        <div><div class="cam-name">${escapeHtml(this._cameraLabel(cam))}</div><div class="cam-meta">${escapeHtml(this._cameraMetaLabel(cam))}</div></div>
                <button class="cam-action" type="button" title="Edit" aria-label="Edit" data-edit-cam="${i}"><svg viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg"><path fill="currentColor" d="M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87M3,17.25V21H6.75L17.81,9.94L14.06,6.19L3,17.25Z" /></svg></button>
                <button class="cam-action" type="button" title="Delete" aria-label="Delete" data-remove-cam="${i}"><svg viewBox="0 0 24 24" style="width:24px; height:24px" fill="currentColor"><path d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z" /></svg></button>
      </div>`,
      )
      .join("");
    const gridOrderRows = gridOrder.included
      .map((entity, index) => {
        const camera = gridOrderCamerasByEntity.get(entity);
        if (!camera) return "";
        const gridHeading =
          index % 4 === 0
            ? `<div class="grid-order-heading">Grid ${Math.floor(index / 4) + 1}</div>`
            : "";
        return `${gridHeading}
          <div class="grid-order-row" draggable="true" data-row="${index}" data-grid-order-entity="${escapeHtmlAttribute(entity)}">
            <button class="cam-drag" type="button" title="Drag to reorder" aria-label="Drag to reorder"><ha-icon icon="mdi:drag-horizontal-variant"></ha-icon></button>
            <div class="grid-order-camera-copy">
              <div class="cam-name">${escapeHtml(this._gridOrderCameraLabel(camera))}</div>
              <div class="cam-meta">${escapeHtml(entity)}</div>
            </div>
            <button class="icon-btn grid-order-action grid-order-action--exclude" type="button" title="Exclude from Grid" aria-label="Exclude ${escapeHtmlAttribute(this._gridOrderCameraLabel(camera))} from Grid" data-grid-order-exclude="${escapeHtmlAttribute(entity)}">
              ${ICONS.gridExclude}
              <span>Exclude</span>
            </button>
          </div>`;
      })
      .join("");
    const gridOrderExcludedRows = gridOrder.excluded
      .map((entity) => {
        const camera = gridOrderCamerasByEntity.get(entity);
        if (!camera) return "";
        return `<div class="grid-order-excluded-row" data-grid-order-entity="${escapeHtmlAttribute(entity)}">
          <div class="grid-order-camera-copy">
            <div class="cam-name">${escapeHtml(this._gridOrderCameraLabel(camera))}</div>
            <div class="cam-meta">${escapeHtml(entity)}</div>
          </div>
          <button class="icon-btn grid-order-action grid-order-action--include" type="button" title="Include in Grid" aria-label="Include ${escapeHtmlAttribute(this._gridOrderCameraLabel(camera))} in Grid" data-grid-order-include="${escapeHtmlAttribute(entity)}">
            ${ICONS.gridInclude}
            <span>Include</span>
          </button>
        </div>`;
      })
      .join("");
    const gridOrderCustomMarkup = `
      <div class="grid-order-custom camera-group-fields" ${gridOrder.mode === GRID_ORDER_MODES.custom ? "" : "hidden"}>
        <div class="grid-order-sections">
          ${gridOrderRows || '<div class="cam-helper">No cameras are currently included in Grid mode.</div>'}
        </div>
        <div class="grid-order-excluded" ${gridOrder.excluded.length ? "" : "hidden"}>
          <div class="grid-order-heading">Excluded Cameras</div>
          ${gridOrderExcludedRows}
        </div>
      </div>`;

    const cameraPanelContent = `
      <div class="section">
        <span class="field-label">Cameras ${frigEntities.length ? '<small style="font-weight:400;color:var(--c-text2)">(Frigate cameras detected)</small>' : ""}</span>
        <div class="cam-wrap" id="cam-list">${cameraRows}</div>
        ${canAddCamera ? '<div class="cam-toolbar"><button id="camera-add" class="cam-add" type="button">Add</button></div>' : ""}
        <span class="cam-helper">Maximum ${physicalCameraCount}/${MAX_CAMERAS} Cameras</span>
      </div>`;

    const generalPanelContent = `
      <div class="text-display-row">
        <ha-input label="Title" name="title" id="title" type="text" value="${escapeHtmlAttribute(this._config?.title || DEFAULT_TITLE)}" placeholder="${escapeHtmlAttribute(DEFAULT_TITLE)}"></ha-input>
        <label class="text-display-checkbox"><input id="display_title" type="checkbox" ${this._config?.display_title !== false ? "checked" : ""}> <span>Display</span></label>
      </div>
      <div class="text-display-row">
        <ha-input label="Subtitle" name="subtitle" id="subtitle" type="text" value="${escapeHtmlAttribute(this._config?.subtitle || DEFAULT_SUBTITLE)}" placeholder="${escapeHtmlAttribute(DEFAULT_SUBTITLE)}"></ha-input>
        <label class="text-display-checkbox"><input id="display_subtitle" type="checkbox" ${this._config?.display_subtitle !== false ? "checked" : ""}> <span>Display</span></label>
      </div>
      <div class="field-helper text-display-token-helper">Use <code>{camera}</code> in either field to show the active camera name. In Grid mode it displays <strong>Grid</strong>.</div>
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
        <div class="layout-row" style="align-items:flex-start;gap:12px;flex-wrap:wrap;justify-content:flex-start;margin-top:12px">
          <div style="display:flex;flex-direction:column;gap:6px;max-width:460px">
            <div class="layout-row" style="justify-content:flex-start;gap:8px">
              <span class="field-label" style="margin:0">Enable Pre-Roll/Post-Roll</span>
              <ha-switch id="event_pre_post_roll_enabled" ${this._config?.event_pre_post_roll_enabled ? "checked" : ""}></ha-switch>
            </div>
            <div class="field-helper">Adds ${EVENT_PRE_POST_ROLL_SECONDS} seconds before and after Alerts and Clips for popup playback and downloads. Requires Frigate recording footage around the event.</div>
          </div>
        </div>
        <div class="layout-row" style="align-items:flex-start;gap:12px;flex-wrap:wrap;justify-content:flex-start;margin-top:12px">
          <div style="display:flex;flex-direction:column;gap:6px;max-width:460px">
            <div class="layout-row" style="justify-content:flex-start;gap:8px">
              <span class="field-label" style="margin:0">Show Favorites from All Cameras</span>
              <ha-switch id="favorites_mixed_cameras" ${this._config?.favorites_mixed_cameras !== false ? "checked" : ""}></ha-switch>
            </div>
            <div class="field-helper">Combine favorites from every configured camera in the Favorites tab. Disable this to show favorites only for the active camera.</div>
          </div>
        </div>
      </div>
      <div class="section">
        <div class="layout-row" style="align-items:flex-start;gap:12px;flex-wrap:wrap;justify-content:flex-start">
          <div class="editor-choice-field editor-choice-field--fit" id="realtime_poll_seconds" role="radiogroup" aria-label="Realtime Update Poll">
            <div class="field-label">Realtime Update Poll</div>
            ${buildEditorChoiceChipsMarkup({
              name: "realtime_poll_seconds",
              options: durationEditorChoices(REALTIME_POLL_OPTIONS_SECONDS),
              selectedValue: realtimePollSeconds,
            })}
            <div class="field-helper">How often the card checks for new Frigate alerts and reviews when realtime notifications are delayed or missed. Lower values update faster but use more battery and data.</div>
          </div>
        </div>
        <div class="layout-row" style="align-items:flex-start;gap:12px;flex-wrap:wrap;justify-content:flex-start;margin-top:12px">
          <div id="snapshot_update_row" style="min-width:210px;display:flex;flex-direction:column;gap:6px;width:100%">
            <div class="editor-choice-field" id="snapshot_update_seconds" role="radiogroup" aria-label="Snapshot Update Frequency">
              <div class="field-label">Snapshot Update Frequency</div>
              ${buildEditorChoiceChipsMarkup({
                name: "snapshot_update_seconds",
                options: durationEditorChoices(
                  SNAPSHOT_UPDATE_OPTIONS_SECONDS,
                ),
                selectedValue: snapshotUpdateSeconds,
              })}
            </div>
            <div class="field-helper">When Live View is disabled for a page, this determines how often a new snapshot is loaded.</div>
          </div>
        </div>
        <div class="layout-row" style="align-items:flex-start;gap:12px;flex-wrap:wrap;justify-content:flex-start;margin-top:12px">
          <div id="preview_alert_live_duration_row" style="min-width:210px;display:flex;flex-direction:column;gap:6px;width:100%">
            <div class="editor-choice-field" id="preview_page_alert_live_duration_seconds" role="radiogroup" aria-label="Alert Camera Live Duration">
              <div class="field-label">Alert Camera Live Duration</div>
              ${buildEditorChoiceChipsMarkup({
                name: "preview_page_alert_live_duration_seconds",
                options: durationEditorChoices(
                  PREVIEW_ALERT_LIVE_DURATION_OPTIONS_SECONDS,
                ),
                selectedValue: previewAlertLiveDurationSeconds,
              })}
            </div>
            <div class="field-helper">How long an alerted snapshot camera remains live on Preview and in Wide View Companion Cameras.</div>
          </div>
        </div>
      </div>
      <div class="section">
        <div class="layout-row timezone-row">
          <span class="field-label" style="margin:0">Timezone</span>
          <span class="timezone-readout" aria-label="Configured Home Assistant timezone">
            <ha-icon icon="mdi:map-clock-outline"></ha-icon>
            <span>${escapeHtml(timezoneDisplay)}</span>
          </span>
        </div>
        <div class="field-helper timezone-helper">Timezones are determined by the Home Assistant User Profile Timezone Setting. The setting can be adjusted in the user's <a href="/profile/general" target="_blank" rel="noopener noreferrer">Home Assistant Profile</a>.</div>
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
        <div id="theme-custom-panel" class="theme-custom-panel" ${activeTheme === "custom" ? "" : "hidden"}>
          <div class="theme-custom-body">
            <div class="theme-custom-scope">
              <span class="theme-custom-scope-label">Apply this custom theme in</span>
              <div class="theme-scope-seg" role="radiogroup" aria-label="Custom theme modes">${themeScopeButtons}</div>
            </div>
            ${themeRows}
          </div>
        </div>
      </div>`;

    const layoutPanelContent = `
      <div class="section">
        <span class="field-label">Active tabs</span>
        <div class="chk-row">
          ${tabToggle("alerts", "Alerts")}
          ${tabToggle("clips", "Clips")}
          ${tabToggle("snapshot", "Snapshots")}
          ${tabToggle("recordings", "Recordings")}
          ${tabToggle("kept", "Favorites")}
        </div>
      </div>
      <div class="section">
        <span class="field-label">Card Height Limit</span>
        <div class="card-height-control">
          <input name="stream_height" id="stream_height" type="range" min="${CARD_HEIGHT_MIN}" max="${CARD_HEIGHT_MAX}" step="1" value="${streamHeight}">
          <div class="editor-choice-field editor-choice-field--compact" id="stream_height_unit" role="radiogroup" aria-label="Card height unit">
            ${buildEditorChoiceChipsMarkup({
              name: "stream_height_unit",
              options: [
                { value: "%", label: "%" },
                { value: "dvh", label: "dvh" },
              ],
              selectedValue: streamHeightUnit,
              compact: true,
            })}
          </div>
        </div>
        <div class="field-helper">Constrain the card to 50–100% of its available height or the dynamic viewport.</div>
        <div class="field-helper" id="stream_height-output">${streamHeight}${streamHeightUnit}</div>
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
      <div class="section">
        <div class="layout-row" style="justify-content:flex-start;gap:8px">
          <span class="field-label" style="margin:0">Display FrigateView Logo</span>
          <ha-switch id="display_logo" ${this._config?.display_logo !== false ? "checked" : ""}></ha-switch>
        </div>
        <div class="field-helper">Shows FrigateView branding in page footers, or in the mobile Preview header when the HA navbar is at the bottom.</div>
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
          <div id="slideshow_rotation_row" style="display:${this._config?.slideshow_rotation_enabled ? "flex" : "none"};flex:1 1 100%;width:100%;flex-direction:column;gap:6px">
            <div class="editor-choice-field editor-choice-field--single-row" id="slideshow_rotation_seconds" role="radiogroup" aria-label="Slideshow Rotation Frequency">
              <div class="field-label">Slideshow Rotation Frequency</div>
              ${buildEditorChoiceChipsMarkup({
                name: "slideshow_rotation_seconds",
                options: durationEditorChoices(
                  SLIDESHOW_ROTATION_OPTIONS_SECONDS,
                ),
                selectedValue: slideshowRotationSeconds,
              })}
            </div>
            <div class="field-helper">How often Slideshow advances to the next configured camera.</div>
          </div>
        </div>
        <div class="layout-row" style="align-items:flex-start;gap:12px;flex-wrap:wrap;justify-content:flex-start;margin-top:12px">
          <div id="slideshow_alert_hold_row" style="min-width:210px;display:flex;flex-direction:column;gap:6px;width:100%">
            <div class="editor-choice-field" id="slideshow_alert_hold_seconds" role="radiogroup" aria-label="Slideshow Alert Hold Duration">
              <div class="field-label">Slideshow Alert Hold Duration</div>
              ${buildEditorChoiceChipsMarkup({
                name: "slideshow_alert_hold_seconds",
                options: durationEditorChoices(
                  SLIDESHOW_ALERT_HOLD_OPTIONS_SECONDS,
                ),
                selectedValue: slideshowAlertHoldSeconds,
              })}
            </div>
            <div class="field-helper">How long Slideshow stays on a camera selected by a qualifying alert before automatic rotation resumes.</div>
          </div>
        </div>
      </div>`;

    const previewPanelContent = `
      <div class="section">
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
        <div class="field-helper">Controls whether all Preview cameras load live on desktop devices. When off, snapshots are used and qualifying alert/review cameras are promoted to temporary live view.</div>
      </div>
      <div class="section">
        <div class="layout-row">
          <span class="field-label" style="margin:0">Live View on Mobile Devices</span>
          <ha-switch id="preview_page_live_cameras_mobile" ${this._config?.preview_page_live_cameras_mobile ? "checked" : ""}></ha-switch>
        </div>
        <div class="field-helper">Controls whether all Preview cameras load live on phones and tablets. When off, snapshots are used and qualifying alert/review cameras are promoted to temporary live view.</div>
      </div>
      <div class="section">
        <div class="layout-row">
          <span class="field-label" style="margin:0">Show Title Bars</span>
          <ha-switch id="preview_page_show_title_bars" ${this._config?.preview_page_show_title_bars !== false ? "checked" : ""}></ha-switch>
        </div>
        <div class="field-helper">Shows per-camera metadata under each preview tile (name, source, events, and online status).</div>
      </div>`;
    const gridAlertHoldSeconds = normalizeNumberChoice(
      this._config?.grid_alert_hold_seconds,
      GRID_ALERT_HOLD_OPTIONS_SECONDS,
      Math.round(GRID_ALERT_HOLD_MS / 1000),
    );
    const wideViewPanelContent = `
      <div class="section">
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
      <div class="section" id="wide-timeline-enabled-row" style="${this._config?.wide_view_page_enabled ? "" : "display:none"}">
        <div class="layout-row">
          <span class="field-label" style="margin:0">Enable Timeline Panel</span>
          <ha-switch id="wide_view_timeline_enabled" ${this._config?.wide_view_timeline_enabled ? "checked" : ""}></ha-switch>
        </div>
        <div class="field-helper">Shows a collapsible, time-scaled stream of alert and event thumbnails beside the Wide View event list. It follows the active camera normally and mixes all cameras while Grid mode is active.</div>
      </div>
      <div class="section timeline-dependent-section" id="wide-timeline-default-open-row" style="${this._config?.wide_view_page_enabled && this._config?.wide_view_timeline_enabled ? "" : "display:none"}">
        <div class="layout-row">
          <span class="field-label" style="margin:0">Open Timeline by Default</span>
          <ha-switch id="wide_view_timeline_default_open" ${this._config?.wide_view_timeline_default_open ? "checked" : ""}></ha-switch>
        </div>
        <div class="field-helper">Opens the Timeline when Wide View starts. When off, the translucent drawer handle remains available.</div>
      </div>
      <div class="section timeline-dependent-section" id="wide-timeline-default-scale-row" style="${this._config?.wide_view_page_enabled && this._config?.wide_view_timeline_enabled ? "" : "display:none"}">
        <div class="editor-choice-field" id="wide_view_timeline_default_scale" role="radiogroup" aria-label="Default Timeline Time Range">
          <div class="field-label">Default Timeline Time Range</div>
          ${buildEditorChoiceChipsMarkup({
            name: "wide_view_timeline_default_scale",
            options: WIDE_TIMELINE_SCALE_OPTIONS_HOURS.map((value) => ({
              value,
              label: `${value} hour${value === 1 ? "" : "s"}`,
            })),
            selectedValue: timelineDefaultScale,
          })}
        </div>
        <div class="field-helper">Sets the initial Timeline range. The Timeline still starts at the current time and can be changed from its header.</div>
      </div>
      <div class="section" id="col-width-row" style="${this._config?.wide_view_page_enabled ? "" : "display:none"}">
        <span class="field-label">Wide View Left Width</span>
        <input id="col_left_width_pct" type="range" min="${WIDE_LEFT_WIDTH_MIN}" max="${WIDE_LEFT_WIDTH_MAX}" step="1" value="${wideLeftWidth}" style="width:100%">
        <div class="field-helper">Controls the left column width when Wide View is active.</div>
        <div class="field-helper" id="col_left_width_pct-output">${wideLeftWidth}%</div>
        <div class="field-helper" id="col_left_width_pct-helper"></div>
      </div>
      `;
    const mobileViewPanelContent = `
      <div class="section">
        <div class="layout-row">
          <span class="field-label" style="margin:0">Enable Mobile View Page</span>
          <ha-switch id="mobile_view_page_enabled" ${this._config?.mobile_view_page_enabled !== false ? "checked" : ""}></ha-switch>
        </div>
        <div class="field-helper">When enabled, Mobile appears in navigation and as a landing page option for both desktop/tablet and phone devices.</div>
      </div>
      <div class="section">
        <div class="layout-row">
          <span class="field-label" style="margin:0">Rotate to Fullscreen</span>
          <ha-switch id="mobile_view_rotate_to_fullscreen" ${this._config?.mobile_view_rotate_to_fullscreen !== false ? "checked" : ""}></ha-switch>
        </div>
        <div class="field-helper">On supported touch devices, rotating to landscape expands live and popup media to fullscreen.</div>
      </div>
      <div class="section">
        <div class="layout-row">
          <span class="field-label" style="margin:0">Mobile Battery Saver</span>
          <ha-switch id="mobile_poll_battery_saver" ${this._config?.mobile_poll_battery_saver ? "checked" : ""}></ha-switch>
        </div>
        <div class="field-helper">On mobile devices, check for new alerts and reviews every 60 seconds to reduce battery and data use.</div>
      </div>
      <div class="section">
        <div class="layout-row">
          <span class="field-label" style="margin:0">Outer Border</span>
          <ha-switch id="mobile_view_outer_border" ${this._config?.mobile_view_outer_border ? "checked" : ""}></ha-switch>
        </div>
        <div class="field-helper">Shows the theme-colored outer border around Mobile View on any device. Turn off for clean full-width edges.</div>
      </div>
      <div class="section">
        <div class="layout-row">
          <span class="field-label" style="margin:0">Move HA Navbar to Bottom</span>
          <ha-switch id="mobile_view_ha_navbar_bottom" ${this._config?.mobile_view_ha_navbar_bottom ? "checked" : ""}></ha-switch>
        </div>
        <div class="field-helper">Moves the Home Assistant dashboard navbar to the bottom on Mobile Phones.</div>
      </div>
      <div class="section ha-navbar-dependent-section" id="mobile-view-ha-navbar-stack-row" style="${this._config?.mobile_view_ha_navbar_bottom ? "" : "display:none"}">
        <div class="layout-row">
          <span class="field-label" style="margin:0">Stack Home Assistant Icon and Label</span>
          <ha-switch id="mobile_view_ha_navbar_stack_tabs" ${this._config?.mobile_view_ha_navbar_stack_tabs ? "checked" : ""}></ha-switch>
        </div>
        <div class="field-helper">For Home Assistant views using Show Icon and Title, this option centers a smaller title below its icon. Icon-only and title-only tabs are unchanged.</div>
      </div>
      <div class="section ha-navbar-dependent-section" id="mobile-view-ha-navbar-dashboard-row" style="${this._config?.mobile_view_ha_navbar_bottom ? "" : "display:none"}">
        <div class="layout-row">
          <span class="field-label" style="margin:0">Whole Dashboard</span>
          <ha-switch id="mobile_view_ha_navbar_dashboard" ${this._config?.mobile_view_ha_navbar_dashboard ? "checked" : ""}></ha-switch>
        </div>
        <div class="field-helper">When off, the navbar applies only while this card's Mobile View page is active. When on, it remains active as you navigate every page in this dashboard after this card loads.</div>
      </div>
      `;
    const swipeNavigationPanelContent = `
      <div class="section">
        <div class="layout-row">
          <span class="field-label" style="margin:0">Control Swipe Navigation from This Card</span>
          <ha-switch id="ha_dashboard_swipe_navigation_owner" ${dashboardSwipeOwnership.requested ? "checked" : ""} ${dashboardSwipeOwnerSwitchDisabled ? "disabled" : ""}></ha-switch>
        </div>
        <div class="field-helper">Only one FrigateView Card can control swipe navigation for a dashboard.</div>
        ${dashboardSwipeOwnershipMessage ? `<div class="field-helper swipe-owner-warning">${dashboardSwipeOwnershipMessage}</div>` : ""}
      </div>
      <div class="section swipe-navigation-dependent-section" id="ha-dashboard-swipe-settings" style="${dashboardSwipeSettingsEnabled ? "" : "display:none"}">
        <div class="editor-choice-field" id="ha_dashboard_swipe_navigation" role="radiogroup" aria-label="Swipe Navigation">
          <div class="field-label">Swipe Navigation</div>
          <div class="editor-choice-chips editor-choice-chips--detailed editor-swipe-choice-grid">${dashboardSwipeChoices}</div>
        </div>
        <div id="ha-dashboard-swipe-page-selection" class="dashboard-swipe-page-selection" style="${dashboardSwipePageSelectionVisible ? "" : "display:none"}">
          <div class="editor-choice-field" role="group" aria-label="FrigateView Pages">
            <div class="field-label">FrigateView Pages</div>
            <div class="editor-choice-chips editor-choice-chips--checkbox dashboard-swipe-pages-grid">${dashboardSwipePageChoices}</div>
          </div>
          <div class="field-helper">Choose the FrigateView pages included in desktop and tablet swipe navigation. Disabled pages must first be enabled in their page settings.</div>
          <div class="field-helper dashboard-swipe-landing-note">The configured desktop landing page is always included and cannot be removed.</div>
        </div>
        <div class="field-helper">Applies on touch devices. A swipe from the far-left edge remains reserved for the Home Assistant menu in every mode.</div>
        <div class="layout-row swipe-mouse-navigation-row">
          <span class="field-label" style="margin:0">Mouse Swipe Navigation</span>
          <ha-switch id="ha_dashboard_swipe_mouse_enabled" ${this._config?.ha_dashboard_swipe_mouse_enabled ? "checked" : ""}></ha-switch>
        </div>
        <div class="field-helper">Allows a primary-button mouse drag to use the same swipe navigation. Off by default.</div>
      </div>
      `;
    const cardViewPanelContent = `
      <div class="section">
        <div class="layout-row">
          <span class="field-label" style="margin:0">Enable Card View</span>
          <ha-switch id="card_view_page_enabled" ${this._config?.card_view_page_enabled ? "checked" : ""}></ha-switch>
        </div>
        <div class="field-helper">Adds a naturally sized live-camera card view for desktop and tablet dashboards. Card Height Limit does not apply to this view.</div>
      </div>
      <div class="section">
        <div class="layout-row">
          <span class="field-label" style="margin:0">Alert Camera Takeover Default</span>
          <ha-switch id="card_view_alert_takeover" ${this._config?.card_view_alert_takeover ? "checked" : ""}></ha-switch>
        </div>
        <div class="field-helper">Sets the initial state of the Card View control that allows a qualifying alert to switch the main live camera.</div>
      </div>
      <div class="section">
        <div class="layout-row">
          <span class="field-label" style="margin:0">Start with Drawer Open</span>
          <ha-switch id="card_view_drawer_default_open" ${this._config?.card_view_drawer_default_open !== false ? "checked" : ""}></ha-switch>
        </div>
        <div class="field-helper">Starts Card View with its Alerts and Recordings drawer open. The footer handles can still open or close the drawer.</div>
      </div>
      <div class="section">
        <div class="layout-row">
          <span class="field-label" style="margin:0">Use Card View as a Standalone View</span>
          <ha-switch id="card_view_standalone" ${this._config?.card_view_standalone ? "checked" : ""} ${this._config?.card_view_page_enabled ? "" : "disabled"}></ha-switch>
        </div>
        <div class="field-helper">When enabled, Card View becomes the only available view on desktop and tablet: links to other views and the Card View back button are removed, and the desktop/tablet landing page is set to Card View. Phone landing behavior remains independently configurable because Card View is not available on phones.</div>
      </div>`;
    const landingPanelContent = `
      <div class="section">
        <span class="field-label">Landing Page</span>
        <ha-selector id="landing_page" style="width:220px"></ha-selector>
        <div class="field-helper">Choose the default starting page for desktop and tablet devices.</div>
      </div>
      <div class="section">
        <span class="field-label">Mobile Page</span>
        <ha-selector id="mobile_page" style="width:220px"></ha-selector>
        <div class="field-helper">Choose the phone starting flow. Preview combinations open Preview first, then send a selected camera to Mobile or Single View. Options involving Mobile or Preview require those pages to be enabled.</div>
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
          <div id="grid_order_row" class="grid-order-config" style="display:${this._config?.grid_mode_enabled ? "flex" : "none"}">
            <span class="field-label" style="margin:0">Grid Order</span>
            <div class="theme-seg" role="radiogroup" aria-label="Grid order">
              <button type="button" class="theme-opt ${gridOrder.mode === GRID_ORDER_MODES.default ? "active" : ""}" data-grid-order-mode="default" role="radio" aria-checked="${gridOrder.mode === GRID_ORDER_MODES.default ? "true" : "false"}">Default</button>
              <button type="button" class="theme-opt ${gridOrder.mode === GRID_ORDER_MODES.custom ? "active" : ""}" data-grid-order-mode="custom" role="radio" aria-checked="${gridOrder.mode === GRID_ORDER_MODES.custom ? "true" : "false"}">Custom</button>
            </div>
            <div class="field-helper">Default follows Camera Settings. Custom lets you reorder or exclude cameras from Grid mode without changing Camera Settings.</div>
            ${gridOrderCustomMarkup}
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
          <div id="grid_rotation_row" style="display:${this._config?.grid_mode_enabled && gridVisibleCameraCount > 4 ? "flex" : "none"};flex:1 1 100%;width:100%;flex-direction:column;gap:6px">
            <div class="editor-choice-field editor-choice-field--single-row" id="grid_rotation_seconds" role="radiogroup" aria-label="Grid Rotation Frequency">
              <div class="field-label">Grid Rotation Frequency</div>
              ${buildEditorChoiceChipsMarkup({
                name: "grid_rotation_seconds",
                options: durationEditorChoices(
                  GRID_ROTATION_OPTIONS_SECONDS,
                ),
                selectedValue: gridRotationSeconds,
              })}
            </div>
            <div class="field-helper">How often Grid mode advances to the next set of cameras when more than four cameras are included.</div>
          </div>
        </div>
        <div class="layout-row" style="align-items:flex-start;gap:12px;flex-wrap:wrap;justify-content:flex-start;margin-top:12px">
          <div id="grid_alert_hold_row" style="min-width:210px;display:flex;flex-direction:column;gap:6px;width:100%">
            <div class="editor-choice-field editor-choice-field--single-row" id="grid_alert_hold_seconds" role="radiogroup" aria-label="Grid Alert Hold Duration">
              <div class="field-label">Grid Alert Hold Duration</div>
              ${buildEditorChoiceChipsMarkup({
                name: "grid_alert_hold_seconds",
                options: durationEditorChoices(
                  GRID_ALERT_HOLD_OPTIONS_SECONDS,
                ),
                selectedValue: gridAlertHoldSeconds,
              })}
            </div>
            <div class="field-helper">How long an alerted Grid tile remains highlighted and, when Grid live view is off, temporarily live.</div>
          </div>
        </div>
      </div>`;

    const activeSettingsPanel = this._activeSettingsPanelId ?? null;

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
        ${this._renderSettingsPanel({ id: "swipenavigation", title: "Swipe Navigation", icon: "mdi:gesture-swipe-horizontal", content: swipeNavigationPanelContent, active: activeSettingsPanel === "swipenavigation" })}
        ${this._renderSettingsPanel({ id: "cardview", title: "Card View", icon: ICONS.cardView, content: cardViewPanelContent, active: activeSettingsPanel === "cardview" })}
        ${this._renderSettingsPanel({ id: "landing", title: "Landing Page", icon: "mdi:home-import-outline", content: landingPanelContent, active: activeSettingsPanel === "landing" })}
      </div>`;

    this.innerHTML = `<style>
          :host{
                --editor-primary-bg: var(--card-background-color);
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
              --c-bg-mobile:var(--ha-color-fill-neutral-normal-resting,var(--wa-color-neutral-fill-normal,var(--secondary-background-color)));
              --c-text: var(--editor-text);
              --c-text2: var(--editor-muted);
              --c-text-rev: var(--text-primary-color);
              --c-border: var(--editor-border);
              --c-border2: var(--state-inactive-color);
              --c-primary: var(--editor-primary);
              --c-accent: var(--accent-color, var(--editor-primary));
              --c-alert: var(--error-color);
            }
            input[type="range"],input[type="checkbox"]{accent-color:var(--c-primary, var(--editor-primary));}
            ha-switch{
              --primary-color:var(--c-primary, var(--editor-primary));
              --accent-color:var(--c-primary, var(--editor-primary));
              --state-active-color:var(--c-primary, var(--editor-primary));
              --state-on-color:var(--c-primary, var(--editor-primary));
              --switch-checked-color:var(--c-primary, var(--editor-primary));
              --switch-checked-button-color:var(--c-primary, var(--editor-primary));
              --switch-checked-track-color:var(--c-primary-l, var(--editor-primary-l));
              --mdc-theme-secondary:var(--c-primary, var(--editor-primary));
              --ha-color-fill-primary-loud-resting:var(--c-primary, var(--editor-primary));
              --ha-color-fill-primary-loud-hover:var(--c-primary, var(--editor-primary));
              --ha-color-fill-primary-normal-resting:var(--c-primary-l, var(--editor-primary-l));
              --ha-color-fill-primary-normal-hover:var(--c-primary-l, var(--editor-primary-l));
              --wa-color-brand-fill-loud:var(--c-primary, var(--editor-primary));
              --wa-color-brand-fill-normal:var(--c-primary-l, var(--editor-primary-l));
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
            .settings-container{display:flex;flex-direction:column;gap:6px;}
            .settings-panel{
                border:1px solid var(--c-border2, var(--editor-border));
                border-radius:16px;
                background:var(--editor-card-bg, var(--editor-card-bg));
                color:var(--c-text, var(--editor-text));
                overflow:hidden;
              }
              .setting-title{
                width:100%;
                box-sizing:border-box;
                border:0;
                border-bottom:1px solid transparent;
                background:transparent;
                color:inherit;
                display:flex;
                align-items:center;
                gap:10px;
                padding:12px 14px;
                text-align:left;
                font-family:inherit;
                font-size:14px;
                font-weight:700;
                line-height:1.2;
                cursor:pointer;
                transition:background-color .16s ease,color .16s ease;
              }
              .setting-title h3{margin:0;font:inherit;line-height:inherit;color:inherit;}
              .setting-title ha-icon,.setting-title-icon{color:var(--c-text2, var(--editor-muted));}
              .setting-title-icon{display:inline-flex;width:24px;height:24px;align-items:center;justify-content:center;}
              .setting-title-icon svg{width:24px;height:24px;}
              .setting-title:hover,.settings-panel.active .setting-title{background:var(--c-bg-mobile);border-bottom-color:var(--c-border2, var(--editor-border));}
              .settings-panel.active .setting-title{color:var(--c-accent, var(--editor-primary));}
              .settings-panel.active .setting-title :is(ha-icon,.setting-title-icon){color:var(--c-accent, var(--editor-primary));}
              .setting-content{
                max-height:0;
                opacity:0;
                overflow:hidden;
                padding:0 14px;
                transition:max-height .28s ease, opacity .2s ease, padding .2s ease;
              }
              .settings-panel.active .setting-content{
                max-height:none;
                opacity:1;
                padding:0 14px 14px;
              }
              .field-label{font-size:12px;font-weight:600;margin-bottom:8px;display:block;color:var(--c-text, var(--editor-text));}
            .field-helper{min-height:1.2em;margin:4px 0px;font-size:11px;color:var(--c-text2, var(--editor-muted));}
            .field-helper.error{color:var(--c-alert);}
            .section{border-top:1px solid var(--c-border2, var(--editor-border));padding-top:16px;}
            .setting-content > .section:first-child{border-top:none;}
            .timeline-dependent-section,
            .ha-navbar-dependent-section{margin-inline-start:14px;padding-inline-start:12px;border-inline-start:2px solid var(--c-primary, var(--editor-primary));}
            .editor-choice-field{display:block;min-width:0;margin:0;padding:0;border:0;}
            .editor-choice-field--fit{flex:1 1 420px;max-width:560px;}
            .editor-choice-field .field-label{margin:0 0 8px;}
            .editor-choice-chips{display:grid;grid-template-columns:repeat(auto-fit,minmax(88px,1fr));gap:8px;width:100%;min-width:0;}
            #realtime_poll_seconds .editor-choice-chips{grid-template-columns:repeat(3,minmax(0,1fr));}
            .editor-choice-field--single-row .editor-choice-chips{grid-template-columns:repeat(4,minmax(0,1fr));}
            .editor-choice-chips--compact{display:flex;width:auto;gap:6px;}
            .editor-choice-chips--detailed{grid-template-columns:repeat(auto-fit,minmax(160px,1fr));}
            .dashboard-swipe-page-selection{margin-top:16px;padding-top:14px;border-top:1px solid var(--c-border2, var(--editor-border));}
            .dashboard-swipe-pages-grid{grid-template-columns:repeat(auto-fit,minmax(132px,1fr));}
            .dashboard-swipe-landing-note{font-weight:600;color:var(--c-primary-d, var(--editor-primary-d));}
            .editor-swipe-choice-grid{align-items:stretch;}
            .editor-swipe-choice{position:relative;min-width:0;}
            .editor-swipe-choice > .editor-choice-chip{height:100%;}
            .editor-swipe-choice > .editor-choice-chip .editor-choice-chip-body{height:100%;}
            .editor-swipe-choice:has(.editor-swipe-choice-footer) .editor-choice-chip-body{padding-bottom:42px;}
            .editor-swipe-choice-footer{position:absolute;z-index:1;right:9px;bottom:7px;left:36px;display:flex;align-items:center;justify-content:flex-end;gap:7px;color:var(--c-text2, var(--editor-muted));font-size:10px;font-weight:600;line-height:1.15;text-align:right;cursor:pointer;}
            .editor-swipe-choice-footer ha-switch{flex:0 0 auto;}
            .editor-swipe-choice-footer:has(ha-switch[disabled]){opacity:.55;cursor:not-allowed;}
            .swipe-navigation-dependent-section{margin-inline-start:14px;padding-inline-start:12px;border-inline-start:2px solid var(--c-primary, var(--editor-primary));}
            .swipe-owner-warning{padding:8px 10px;border:1px solid var(--c-alert, #d32f2f);border-radius:8px;background:color-mix(in srgb,var(--c-alert, #d32f2f) 9%,transparent);color:var(--c-alert, #d32f2f);line-height:1.35;}
            .swipe-owner-warning strong{display:inline-block;padding:1px 5px;border-radius:5px;background:color-mix(in srgb,var(--c-alert, #d32f2f) 16%,transparent);color:inherit;font-weight:800;}
            .editor-choice-chip{position:relative;display:block;min-width:0;cursor:pointer;}
            .editor-choice-chip-input{position:absolute;inline-size:1px;block-size:1px;margin:0;opacity:0;pointer-events:none;}
            .editor-choice-chip-body{display:flex;align-items:center;gap:8px;min-height:40px;box-sizing:border-box;padding:8px 11px;border:1px solid var(--c-border2, var(--editor-border));border-radius:10px;background:var(--c-bg-main, var(--editor-card-bg));color:var(--c-text, var(--editor-text));font-size:12px;font-weight:600;line-height:1.25;transition:background-color .16s ease,border-color .16s ease,color .16s ease,box-shadow .16s ease,transform .1s ease;}
            .editor-choice-chips--detailed .editor-choice-chip-body{align-items:flex-start;min-height:104px;}
            .editor-choice-chip-copy{display:flex;min-width:0;flex-direction:column;gap:5px;}
            .editor-choice-chip-description{color:var(--c-text2, var(--editor-muted));font-size:11px;font-weight:400;line-height:1.35;}
            .editor-choice-chip-input:checked + .editor-choice-chip-body .editor-choice-chip-description{color:inherit;opacity:.8;}
            .editor-choice-chip-indicator{position:relative;flex:0 0 auto;width:17px;height:17px;box-sizing:border-box;border:2px solid var(--c-text2, var(--editor-muted));border-radius:50%;background:var(--c-bg-main, var(--editor-card-bg));transition:border-color .16s ease,background-color .16s ease;}
            .editor-choice-chip-indicator::after{content:"";position:absolute;inset:3px;border-radius:50%;background:var(--c-text-rev, #fff);transform:scale(0);transition:transform .14s ease;}
            .editor-choice-chip-input:not(:disabled) + .editor-choice-chip-body:hover{border-color:var(--c-primary, var(--editor-primary));background:var(--c-primary-l, var(--editor-primary-l));box-shadow:0 2px 7px rgba(0,0,0,.12);}
            .editor-choice-chip-input:not(:disabled) + .editor-choice-chip-body:active{transform:scale(.985);}
            .editor-choice-chip-input:focus-visible + .editor-choice-chip-body{outline:2px solid var(--c-primary, var(--editor-primary));outline-offset:2px;}
            .editor-choice-chip-input:checked + .editor-choice-chip-body{border-color:var(--c-primary, var(--editor-primary));background:var(--c-primary-l, var(--editor-primary-l));color:var(--c-primary-d, var(--editor-primary-d));box-shadow:inset 0 0 0 1px var(--c-primary, var(--editor-primary));}
            .editor-choice-chip-input:checked:not(:disabled) + .editor-choice-chip-body:hover{box-shadow:inset 0 0 0 1px var(--c-primary, var(--editor-primary)),0 2px 7px rgba(0,0,0,.16);}
            .editor-choice-chip-input:checked + .editor-choice-chip-body .editor-choice-chip-indicator{border-color:var(--c-primary, var(--editor-primary));background:var(--c-primary, var(--editor-primary));}
            .editor-choice-chip-input:checked + .editor-choice-chip-body .editor-choice-chip-indicator::after{transform:scale(1);}
            .editor-choice-chips--checkbox .editor-choice-chip-indicator{border-radius:4px;}
            .editor-choice-chips--checkbox .editor-choice-chip-indicator::after{inset:2px 5px 4px;border:solid var(--c-text-rev, #fff);border-width:0 2px 2px 0;border-radius:0;background:transparent;transform:rotate(45deg) scale(0);}
            .editor-choice-chips--checkbox .editor-choice-chip-input:checked + .editor-choice-chip-body .editor-choice-chip-indicator::after{transform:rotate(45deg) scale(1);}
            .editor-choice-chip-input:disabled + .editor-choice-chip-body{opacity:.5;cursor:not-allowed;background:var(--c-bg-mobile, var(--editor-secondary-bg));}
            .editor-choice-chip-input[data-dashboard-swipe-landing="true"]:checked:disabled + .editor-choice-chip-body{opacity:1;border-color:var(--c-primary, var(--editor-primary));background:var(--c-primary-l, var(--editor-primary-l));color:var(--c-primary-d, var(--editor-primary-d));box-shadow:inset 0 0 0 1px var(--c-primary, var(--editor-primary));}
            .editor-choice-field--compact{flex:0 0 auto;}
            .editor-choice-field--compact .editor-choice-chip-body{min-height:36px;padding:6px 9px;}
            .editor-choice-field--compact .editor-choice-chip-indicator{width:15px;height:15px;}
            .card-height-control{display:flex;gap:8px;align-items:center;min-width:0;}
            .card-height-control > #stream_height{flex:1 1 auto;min-width:120px;}
            .visually-hidden{position:absolute!important;width:1px!important;height:1px!important;padding:0!important;margin:-1px!important;overflow:hidden!important;clip:rect(0,0,0,0)!important;white-space:nowrap!important;border:0!important;}
            .chk-row{display:flex;flex-wrap:wrap;gap:8px 16px;}
            .text-display-row{display:flex;align-items:center;gap:12px;min-width:0;}
            .text-display-row + .text-display-row{margin-top:8px;}
            .text-display-token-helper{margin:5px 0 12px;}
            .text-display-row ha-input{flex:1 1 auto;min-width:0;}
            .text-display-checkbox{display:inline-flex;align-items:center;gap:5px;flex:0 0 auto;cursor:pointer;color:var(--c-text, var(--editor-text));font-size:12px;font-weight:600;}
            .text-display-checkbox input{margin:0;}

            .cam-wrap{display:flex;flex-direction:column;gap:8px;}
            .cam-row{
              position:relative;
              display:grid;
              grid-template-columns:auto minmax(0,1fr) auto auto;
              gap:8px;
              align-items:center;
              border:1px solid var(--c-border2, var(--editor-border));
              border-inline-start:4px solid var(--c-primary, var(--editor-primary));
              border-radius:10px;
              padding:8px 10px;
              background:var(--c-bg-mobile, var(--editor-secondary-bg));
              box-shadow:var(--editor-shadow);
              transition:background-color .16s ease,border-color .16s ease,box-shadow .16s ease,opacity .16s ease,transform .16s ease;
            }
            .grid-order-row,.grid-order-excluded-row{
              position:relative;
              display:grid;
              grid-template-columns:auto minmax(0,1fr) auto auto;
              gap:6px;
              align-items:center;
              border:1px solid var(--c-border2, var(--editor-border));
              border-inline-start:4px solid var(--c-primary, var(--editor-primary));
              border-radius:10px;
              padding:4px 7px;
              background:var(--c-bg-mobile, var(--editor-secondary-bg));
              box-shadow:var(--editor-shadow);
              transition:background-color .16s ease,border-color .16s ease,box-shadow .16s ease,opacity .16s ease,transform .16s ease;
            }
            .cam-row:hover,.cam-row:focus-within,.grid-order-row:hover,.grid-order-row:focus-within,.grid-order-excluded-row:hover,.grid-order-excluded-row:focus-within{background:var(--c-bg-main, var(--editor-card-bg));border-color:var(--c-primary, var(--editor-primary));}
            .cam-row.dragging,.grid-order-row.dragging{opacity:.5;transform:scale(.985);box-shadow:none;}
            .cam-row.drop-target{background:var(--c-bg-main, var(--editor-card-bg));border-color:var(--c-primary, var(--editor-primary));box-shadow:0 0 0 2px var(--c-primary, var(--editor-primary));}
            .grid-order-row.drop-target{background:var(--c-bg-main, var(--editor-card-bg));border-color:var(--c-primary, var(--editor-primary));box-shadow:0 0 0 2px var(--c-primary, var(--editor-primary));}
            :is(.cam-row,.grid-order-row).drop-target-before::before,
            :is(.cam-row,.grid-order-row).drop-target-after::after{content:"";position:absolute;z-index:3;left:4px;right:4px;height:4px;border-radius:999px;background:var(--c-primary, var(--editor-primary));box-shadow:0 0 0 2px var(--c-bg-main, var(--editor-card-bg));pointer-events:none;}
            :is(.cam-row,.grid-order-row).drop-target-before::before{top:-6px;}
            :is(.cam-row,.grid-order-row).drop-target-after::after{bottom:-6px;}
            .cam-drag{border:1px solid var(--c-border2, var(--editor-border));background:var(--c-bg-main, var(--editor-card-bg));color:var(--editor-icon);cursor:grab;line-height:1;display:grid;place-items:center;width:28px;height:28px;border-radius:8px;}
            .cam-drag:hover,.cam-drag:active{background:var(--c-primary, var(--editor-primary));border-color:var(--c-primary, var(--editor-primary));color:var(--c-text-rev, var(--editor-card-bg));}
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
            .grid-order-config{flex:1 1 100%;width:100%;min-width:0;box-sizing:border-box;display:flex;flex-direction:column;gap:7px;}
            .grid-order-custom{margin-top:2px;margin-bottom:0;}
            .grid-order-sections,.grid-order-excluded{display:flex;flex-direction:column;gap:8px;}
            .grid-order-excluded{margin-top:12px;padding-top:10px;border-top:1px solid var(--c-border2, var(--editor-border));}
            .grid-order-excluded[hidden]{display:none;}
            .grid-order-heading{font-size:12px;font-weight:700;color:var(--c-text2, var(--editor-muted));letter-spacing:.02em;padding:2px 2px 0;}
            .grid-order-row{grid-template-columns:auto minmax(0,1fr) auto;}
            .grid-order-row .cam-drag{width:26px;height:26px;border-radius:7px;}
            .grid-order-row .cam-drag ha-icon{--mdc-icon-size:16px;}
            .grid-order-excluded-row{grid-template-columns:minmax(0,1fr) auto;}
            .grid-order-excluded-row .grid-order-camera-copy{opacity:.58;}
            .grid-order-excluded-row:hover .grid-order-camera-copy,.grid-order-excluded-row:focus-within .grid-order-camera-copy{opacity:.76;}
            .grid-order-camera-copy{min-width:0;}
            .grid-order-action{width:38px;min-width:38px;height:34px;padding:2px;border:0;border-radius:8px;background:transparent;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:0;font:inherit;font-size:9px;font-weight:700;line-height:1;cursor:pointer;box-shadow:none;}
            .grid-order-action svg{width:17px;height:17px;display:block;flex:0 0 auto;}
            .grid-order-action--exclude{color:var(--c-accent);}
            .grid-order-action--include{color:var(--c-on);}
            .grid-order-action:hover,.grid-order-action:focus-visible{background:var(--c-bg-main, var(--editor-card-bg));outline:none;box-shadow:0 0 0 1px currentColor inset;}

            .theme-row{display:flex;align-items:center;}
            .theme-seg{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;width:100%;}
            .theme-opt{
              appearance:none;
              border:var(--editor-border-width) solid var(--c-border2);
              background:var(--editor-card-bg);
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
            .theme-custom-body{padding:10px 12px;}
            .theme-custom-scope{display:flex;flex-direction:column;gap:7px;padding:2px 0 12px;}
            .theme-custom-scope-label{font-size:12px;font-weight:600;color:var(--c-text2, var(--editor-muted));text-align:center;}
            .theme-scope-seg{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:3px;width:min(100%,390px);margin:0 auto;padding:5px;box-sizing:border-box;border-radius:999px;background:var(--c-bg-main, var(--editor-secondary-bg));box-shadow:inset 0 0 0 1px var(--c-border2, var(--editor-border)),0 5px 13px rgba(0,0,0,.12);}
            .theme-scope-opt{appearance:none;min-width:0;min-height:62px;padding:7px 8px;border:0;border-radius:999px;background:transparent;color:var(--c-text2, var(--editor-muted));display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;font:inherit;font-size:11px;font-weight:650;line-height:1;cursor:pointer;touch-action:manipulation;-webkit-tap-highlight-color:transparent;transition:background .16s ease,color .16s ease,box-shadow .16s ease,transform .1s ease;}
            .theme-scope-opt ha-icon{--mdc-icon-size:25px;pointer-events:none;}
            .theme-scope-opt span{pointer-events:none;}
            .theme-scope-opt.active{background:var(--c-bg-primary, var(--editor-card-bg));color:var(--c-primary, var(--editor-primary));box-shadow:0 2px 8px rgba(0,0,0,.16),inset 0 0 0 1px color-mix(in srgb,var(--c-primary, var(--editor-primary)) 26%,transparent);}
            .theme-scope-opt:active{transform:scale(.98);}
            .theme-scope-opt:focus-visible{outline:2px solid var(--c-primary, var(--editor-primary));outline-offset:1px;}
            @media (hover:hover){.theme-scope-opt:not(.active):hover{background:color-mix(in srgb,var(--c-bg-primary, var(--editor-card-bg)) 66%,transparent);color:var(--c-text, var(--editor-text));}}
            .theme-custom-row{display:grid;grid-template-columns:1fr auto auto;gap:10px;align-items:center;padding:10px 0;border-top:1px solid var(--c-border2, var(--editor-border));}
            .theme-custom-scope + .theme-custom-row{border-top:none;}
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
            .timezone-row{align-items:flex-start;flex-wrap:wrap;}
            .timezone-readout{display:inline-flex;align-items:center;gap:7px;max-width:100%;box-sizing:border-box;padding:6px 10px;border-left:3px solid var(--c-primary, var(--editor-primary));border-radius:4px;background:var(--c-bg-main, var(--editor-secondary-bg));color:var(--c-text, var(--editor-text));font-size:12px;line-height:1.35;cursor:default;}
            .timezone-readout ha-icon{--mdc-icon-size:17px;color:var(--c-text2, var(--editor-muted));flex:0 0 auto;}
            .timezone-helper{max-width:560px;}
            .timezone-helper a{color:var(--c-primary, var(--editor-primary));text-decoration:underline;text-underline-offset:2px;}

            .cam-modal.hidden{display:none;}
            .cam-modal{position:fixed;inset:0;box-sizing:border-box;padding:12px;background:rgba(0,0,0,.30);display:flex;align-items:flex-start;justify-content:center;overflow:auto;overscroll-behavior:contain;z-index:10;}
            .cam-modal-card{flex:0 0 auto;width:min(640px,100%);margin:auto;overflow:visible;box-sizing:border-box;background:var(--editor-card-bg);color:var(--editor-text);border:var(--editor-border-width) solid var(--editor-border);border-radius:16px;padding:16px;box-shadow:var(--editor-shadow);}
            .cam-modal-card ha-input,
            .cam-modal-card ha-selector,
            .cam-modal-card ha-switch{--ha-card-background:var(--editor-card-bg);}
            .cam-modal-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;}
            .round-btn{display:inline-flex;align-items:center;justify-content:center;min-width:calc(24px + 1rem);min-height:calc(24px + 1rem);aspect-ratio:1/1;padding:0;background-color:var(--c-bg-main);color:var(--c-text2);background-image:radial-gradient(circle at center,var(--wa-color-neutral-fill-normal,var(--editor-card-bg)) 0 50%,transparent 51%);background-position:center;background-repeat:no-repeat;background-size:0 0;border:none;box-shadow:0 0 6px 1px var(--c-border2);border-radius:50%;font:inherit;font-weight:600;font-size:1rem;line-height:1;cursor:pointer;appearance:none;transition:background-size .35s ease,box-shadow .2s ease,transform .12s ease;}
            .round-btn svg{width:24px;height:24px;opacity:.85;color:var(--c-text2);}
            .round-btn:hover{background-size:210% 210%;}
            .round-btn:hover svg{color:var(--c-text);}
            .round-btn:focus-visible{outline:2px solid var(--editor-primary-l);outline-offset:3px;}
            .cam-modal-label{font-size:12px;font-weight:600;color:var(--editor-text);margin-bottom:6px;display:block;}
            .cam-modal-field{margin-bottom:8px;}
            .camera-group-add-row{display:flex;justify-content:flex-start;padding-inline-start:12px;}
            .camera-group-help{margin:0 0 10px 12px;border-inline-start:3px solid var(--c-primary, var(--editor-primary));border-radius:0 8px 8px 0;background:var(--editor-secondary-bg);color:var(--editor-text);font-size:12px;line-height:1.35;}
            .camera-group-help[hidden]{display:none;}
            .camera-group-help summary{padding:7px 10px;color:var(--c-primary, var(--editor-primary));font-weight:700;cursor:pointer;}
            .camera-group-help-copy{padding:0 10px 9px;color:var(--c-text2, var(--editor-muted));}
            .camera-group-fields{margin:0 0 10px 12px;padding:10px;border-inline-start:3px solid var(--editor-primary);background:var(--editor-secondary-bg);border-radius:0 10px 10px 0;}
            .camera-group-fields[hidden]{display:none!important;}
            .camera-group-fields-head{display:flex;align-items:center;gap:10px;margin-bottom:6px;}
            .camera-group-fields-title{font-size:12px;font-weight:700;color:var(--editor-text);}
            .camera-group-secondary-row{display:block;min-width:0;}
            .camera-group-selector{flex:1 1 auto;min-width:0;}
            .camera-group-action{flex:0 0 auto;}
            .camera-group-fields-footer{display:flex;justify-content:flex-end;align-items:center;margin-top:5px;}
            .cam-inline-add{display:inline-flex;align-items:center;gap:6px;min-height:30px;padding:4px 10px;border:1px solid var(--c-border2);border-radius:999px;background:var(--editor-secondary-bg);color:var(--editor-text);font:inherit;font-size:12px;font-weight:700;line-height:1;cursor:pointer;}
            .cam-inline-add[hidden]{display:none!important;}
            .cam-inline-add svg{width:18px;height:18px;flex:0 0 18px;color:var(--editor-primary);}
            .cam-inline-add:hover{background:var(--editor-primary-l);border-color:var(--editor-primary);color:var(--editor-primary-d);}
            .cam-inline-add:hover svg{color:var(--editor-primary-d);}
            .cam-inline-remove{min-height:28px;padding:3px 7px;border:0;border-radius:6px;background:transparent;color:var(--c-primary,var(--editor-primary));font:inherit;font-size:12px;font-weight:700;line-height:1;cursor:pointer;}
            .cam-inline-remove:hover{background:var(--c-primary-l,var(--editor-primary-l));color:var(--c-primary-d,var(--editor-primary-d));}
            .linked-entity-row{display:block;min-width:0;}
            .linked-entity-selectors{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);align-items:start;gap:10px;min-width:0;}
            .linked-entity-field{display:grid;grid-template-rows:auto minmax(56px,auto);align-content:start;min-width:0;}
            .linked-entity-field > .cam-modal-label{margin:0 0 6px;}
            .linked-entity-selectors ha-selector,.camera-group-selector ha-selector{display:block;width:100%;min-width:0;background:var(--editor-card-bg);border-radius:4px 4px 0 0;--mdc-menu-max-height:min(320px,48dvh);--ha-card-background:var(--editor-card-bg);--mdc-text-field-fill-color:var(--editor-card-bg);--mdc-filled-text-field-container-color:var(--editor-card-bg);--ha-color-fill-neutral-normal-resting:var(--editor-card-bg);--wa-color-neutral-fill-normal:var(--editor-card-bg);--ha-color-fill-neutral-normal-hover:var(--editor-primary-l);--wa-color-neutral-fill-normal-hover:var(--editor-primary-l);}
            .linked-entity-selectors ha-selector:hover,.linked-entity-selectors ha-selector:focus-within,.camera-group-selector ha-selector:hover,.camera-group-selector ha-selector:focus-within{background:var(--editor-primary-l);--ha-card-background:var(--editor-primary-l);--mdc-text-field-fill-color:var(--editor-primary-l);--mdc-filled-text-field-container-color:var(--editor-primary-l);}
            .camera-group-layout-field{display:block;margin:10px 0 8px;}
            .camera-group-layout-field .cam-modal-label{margin:0 0 7px;}
            .camera-group-layout-field .editor-choice-chips{grid-template-columns:repeat(2,minmax(0,1fr));}
            #camera-modal-ptz-rotation-row{margin-top:10px;padding-left:12px;border-left:3px solid var(--c-primary, var(--editor-primary));}
            #camera-modal-ptz-rotation-row .editor-choice-chips{grid-template-columns:repeat(4,minmax(0,1fr));}
            .cam-modal-foot{display:flex;justify-content:flex-end;gap:8px;margin-top:8px;}
            .cam-btn{min-height:38px;border:1px solid transparent;border-radius:999px;background:transparent;color:var(--editor-primary);font-weight:600;cursor:pointer;padding:8px 14px;transition:background .16s ease,color .16s ease,border-color .16s ease;}
            .cam-btn:hover,.cam-btn:focus-visible{background:var(--editor-primary-l);border-color:transparent;color:var(--editor-primary-d);outline:none;}
            .cam-btn.primary{background:var(--editor-primary);color:var(--text-primary-color);border-color:var(--editor-primary);padding:8px 18px;}
            .cam-btn.primary:hover,.cam-btn.primary:focus-visible{background:var(--editor-primary-d);border-color:var(--editor-primary-d);color:var(--text-primary-color);}
            .cam-btn.danger{background:var(--c-alert);color:var(--c-text-rev);border-color:var(--c-alert);padding:8px 18px;}
            .cam-btn.danger:hover{background:var(--c-alert);border-color:var(--c-alert);filter:brightness(.9);}
            .cam-modal-helper{font-size:11px;color:var(--error-color);min-height:16px;}
            .cam-confirm-card{width:min(420px,100%);}
            .cam-confirm-title{margin:0 0 8px;font-size:20px;color:var(--c-text);}
            .cam-confirm-message{margin:0;color:var(--c-text2);line-height:1.5;}
            @media (max-width:560px){
              .linked-entity-selectors{grid-template-columns:minmax(0,1fr);}
            }
            .standalone-landing-dialog{position:fixed;inset:0;margin:auto;box-sizing:border-box;width:min(420px,calc(100vw - 24px));max-width:none;max-height:calc(100dvh - 24px);overflow:auto;}
            .standalone-landing-dialog::backdrop{background:rgba(0,0,0,.30);}
            .standalone-landing-dialog:not([open]){display:none;}

        </style>
    <div class="ed-wrap">
      ${settingsPanelsMarkup}

      <div id="camera-modal" class="cam-modal hidden">
        <div class="cam-modal-card" role="dialog" aria-modal="true" aria-label="Camera modal">
          <div class="cam-modal-head">
            <button type="button" id="camera-modal-close" class="round-btn" title="Close" aria-label="Close">${ICONS.close}</button>
            <div style="font-size:30px;font-weight:600;color:var(--primary-text-color)" id="camera-modal-title">Add</div>
            <div></div>
          </div>
          <div class="cam-modal-field">
            <span class="cam-modal-label">Camera</span>
            <ha-selector id="camera-modal-entity"></ha-selector>
          </div>
          <div class="cam-modal-field camera-group-add-row">
            <button type="button" id="camera-modal-add-secondary" class="cam-inline-add camera-group-action">${ICONS.cameraAdd}<span>Add second camera</span></button>
          </div>
          <details id="camera-modal-secondary-help" class="camera-group-help">
            <summary>What is a second camera?</summary>
            <div class="camera-group-help-copy">Use this for devices with two camera entities, such as a doorbell with main and package cameras, a dual-camera wide view, or a PTZ camera paired with a stationary camera. Only the main camera above can provide PTZ or two-way talk controls.</div>
          </details>
          <div id="camera-modal-group-fields" class="camera-group-fields" hidden>
            <div class="camera-group-fields-head">
              <span class="camera-group-fields-title">Second Camera</span>
            </div>
            <div class="camera-group-secondary-row">
              <div class="camera-group-selector">
                <ha-selector id="camera-modal-secondary-entity"></ha-selector>
              </div>
            </div>
            <div class="editor-choice-field camera-group-layout-field" role="radiogroup" aria-label="Live View Layout">
              <div class="cam-modal-label">Live View Layout</div>
              ${buildEditorChoiceChipsMarkup({
                name: "camera-modal-group-layout",
                options: [
                  {
                    value: CAMERA_GROUP_LAYOUTS.sideBySide,
                    label: "Side by Side",
                  },
                  {
                    value: CAMERA_GROUP_LAYOUTS.stacked,
                    label: "Stacked",
                  },
                ],
                selectedValue: CAMERA_GROUP_LAYOUTS.sideBySide,
              })}
            </div>
            <div class="field-helper">The first camera is the main camera. PTZ and two-way talk capability are detected only on the main camera, not the second camera. Put the controllable camera first.</div>
            <div class="camera-group-fields-footer">
              <button type="button" id="camera-modal-remove-secondary" class="cam-inline-remove camera-group-action">Cancel</button>
            </div>
          </div>
          <div class="cam-modal-field camera-group-add-row">
            <button type="button" id="camera-modal-add-light" class="cam-inline-add camera-group-action">${ICONS.lightAdd}<span>Add light</span></button>
          </div>
          <div id="camera-modal-light-fields" class="camera-group-fields" hidden>
            <div class="camera-group-fields-head">
              <span class="camera-group-fields-title">Linked Light</span>
            </div>
            <div class="linked-entity-row">
              <div class="linked-entity-selectors">
                <div class="linked-entity-field">
                  <span class="cam-modal-label">Light</span>
                  <ha-selector id="camera-modal-light-entity"></ha-selector>
                </div>
                <div class="linked-entity-field">
                  <span class="cam-modal-label">Icon</span>
                  <ha-selector id="camera-modal-light-icon"></ha-selector>
                </div>
              </div>
            </div>
            <div class="editor-choice-field camera-group-layout-field" role="radiogroup" aria-label="Button Position">
              <div class="cam-modal-label">Button Position</div>
              ${buildEditorChoiceChipsMarkup({
                name: "camera-modal-light-position",
                options: [
                  { value: LINKED_LIGHT_POSITIONS.left, label: "Left" },
                  { value: LINKED_LIGHT_POSITIONS.right, label: "Right" },
                ],
                selectedValue: LINKED_LIGHT_POSITIONS.right,
              })}
            </div>
            <div class="field-helper">Adds a Home Assistant light control to this camera. Button Position places it to the left or right of the microphone; Right is the default. The same light may be linked to more than one camera.</div>
            <div class="camera-group-fields-footer">
              <button type="button" id="camera-modal-remove-light" class="cam-inline-remove camera-group-action">Cancel</button>
            </div>
          </div>
          <div class="cam-modal-field camera-group-add-row">
            <button type="button" id="camera-modal-add-light-2" class="cam-inline-add camera-group-action" hidden>${ICONS.lightAdd}<span>Add second light</span></button>
          </div>
          <div id="camera-modal-light-fields-2" class="camera-group-fields" hidden>
            <div class="camera-group-fields-head">
              <span class="camera-group-fields-title">Second Linked Light</span>
            </div>
            <div class="linked-entity-row">
              <div class="linked-entity-selectors">
                <div class="linked-entity-field">
                  <span class="cam-modal-label">Light</span>
                  <ha-selector id="camera-modal-light-entity-2"></ha-selector>
                </div>
                <div class="linked-entity-field">
                  <span class="cam-modal-label">Icon</span>
                  <ha-selector id="camera-modal-light-icon-2"></ha-selector>
                </div>
              </div>
            </div>
            <div class="editor-choice-field camera-group-layout-field" role="radiogroup" aria-label="Button Position">
              <div class="cam-modal-label">Button Position</div>
              ${buildEditorChoiceChipsMarkup({
                name: "camera-modal-light-position-2",
                options: [
                  { value: LINKED_LIGHT_POSITIONS.left, label: "Left" },
                  { value: LINKED_LIGHT_POSITIONS.right, label: "Right" },
                ],
                selectedValue: LINKED_LIGHT_POSITIONS.right,
              })}
            </div>
            <div class="field-helper">The second light can be placed on either side of the microphone independently of the first light.</div>
            <div class="camera-group-fields-footer">
              <button type="button" id="camera-modal-remove-light-2" class="cam-inline-remove camera-group-action">Cancel</button>
            </div>
          </div>
          <div class="cam-modal-field">
            <span class="cam-modal-label">Connection Type</span>
            <ha-selector id="camera-modal-connection-type"></ha-selector>
            <div class="field-helper">The Home Assistant Frigate integration is required for the card to function properly.</div>
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
            <div id="camera-modal-ptz-toggle-row">
            <div class="layout-row" style="justify-content:flex-start;gap:8px">
              <span class="cam-modal-label" style="margin:0">Enable PTZ Controls</span>
              <ha-switch id="camera-modal-ptz-enabled"></ha-switch>
            </div>
            <div class="field-helper">Turn on PTZ controls. PTZ controls allow for Pan and Tilt.</div>
            <div id="camera-modal-ptz-rotation-row" hidden>
              <div class="editor-choice-field camera-group-layout-field" role="radiogroup" aria-label="Rotate PTZ Controls">
                <div class="cam-modal-label">Rotate PTZ Controls</div>
                ${buildEditorChoiceChipsMarkup({
                  name: "camera-modal-ptz-rotation",
                  options: PTZ_CONTROL_ROTATIONS.map((rotation) => ({
                    value: rotation,
                    label: `${rotation}°`,
                  })),
                  selectedValue: 0,
                  compact: true,
                })}
              </div>
              <div class="field-helper">Remaps the directional commands to match a rotated camera image. At 90°, Up sends Left.</div>
            </div>
            </div>
            <div class="field-helper" id="camera-modal-ptz-state" style="display:none"></div>
          </div>
          <div class="cam-modal-field" id="camera-modal-two-way-talk-toggle-row" style="display:none">
            <div class="layout-row" style="justify-content:flex-start;gap:8px">
              <span class="cam-modal-label" style="margin:0">Enable Two-way Talk</span>
              <ha-switch id="camera-modal-two-way-talk-enabled"></ha-switch>
            </div>
            <div class="field-helper">Frigate mode requires a detected backchannel (WEBRTC). Home Assistant mode is an experimental option when HA reports WebRTC playback.</div>
          </div>
          <div class="field-helper" id="camera-modal-two-way-talk-state" style="display:none"></div>
          <div class="cam-modal-helper" id="camera-modal-helper"></div>
          <div class="cam-modal-foot">
            <button type="button" id="camera-modal-cancel" class="cam-btn">Cancel</button>
            <button type="button" id="camera-modal-save" class="cam-btn primary">Add</button>
          </div>
        </div>
      </div>

      <div id="camera-delete-modal" class="cam-modal hidden">
        <div class="cam-modal-card cam-confirm-card" role="alertdialog" aria-modal="true" aria-labelledby="camera-delete-title" aria-describedby="camera-delete-message">
          <h3 class="cam-confirm-title" id="camera-delete-title">Delete camera?</h3>
          <p class="cam-confirm-message" id="camera-delete-message"></p>
          <div class="cam-modal-foot">
            <button type="button" id="camera-delete-cancel" class="cam-btn">Cancel</button>
            <button type="button" id="camera-delete-confirm" class="cam-btn danger">Delete</button>
          </div>
        </div>
      </div>

      <dialog id="standalone-landing-modal" class="cam-modal-card cam-confirm-card standalone-landing-dialog" aria-labelledby="standalone-landing-title" aria-describedby="standalone-landing-message">
          <h3 class="cam-confirm-title" id="standalone-landing-title">Choose a landing page</h3>
          <p class="cam-confirm-message" id="standalone-landing-message">Card View will no longer be the standalone desktop and tablet view. Select the desktop and tablet landing page to use after standalone mode is disabled.</p>
          <div class="cam-modal-field" style="margin-top:12px">
            <span class="cam-modal-label">Landing Page</span>
            <ha-selector id="standalone-landing-page" style="width:100%"></ha-selector>
          </div>
          <div class="cam-modal-helper" id="standalone-landing-helper"></div>
          <div class="cam-modal-foot">
            <button type="button" id="standalone-landing-cancel" class="cam-btn">Cancel</button>
            <button type="button" id="standalone-landing-confirm" class="cam-btn primary">Apply</button>
          </div>
      </dialog>
    </div>`;

    const update = (previewRouteIntent = null) =>
      this._u({
        dispatch: false,
        preview: Boolean(previewRouteIntent),
        previewRouteIntent,
      });
    const updateVisual = () =>
      this._u({ dispatch: false, preview: true });
    const scheduleUpdate = (previewRouteIntent = null) => {
      if (previewRouteIntent) {
        this._pendingEditorPreviewRouteIntent = previewRouteIntent;
      }
      if (this._previewUpdateRaf) return;
      this._previewUpdateRaf = requestAnimationFrame(() => {
        this._previewUpdateRaf = 0;
        const pendingRouteIntent = this._pendingEditorPreviewRouteIntent;
        this._pendingEditorPreviewRouteIntent = null;
        update(pendingRouteIntent);
      });
    };

    bindThemeControlEvents({
      root: this,
      update: updateVisual,
      themeDraftCache: this._themeDraftCache,
      resolveDefaultHex: (key) =>
        this._themeDefaultHex(key, activeThemeMode),
      themeMode: activeThemeMode,
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
      element: this.querySelector("#landing_page"),
      hass: this._hass,
      options: landingPageOptions,
      initialValue: this._config?.landing_page || PAGE_IDS.singleView,
      fallbackValue: PAGE_IDS.singleView,
      normalize: (value) => normalizePageRoute(value),
      onChange: () => update(),
    });

    setupSelectSelector({
      element: this.querySelector("#standalone-landing-page"),
      hass: this._hass,
      options: standaloneLandingPageOptions,
      initialValue: PAGE_IDS.singleView,
      fallbackValue: PAGE_IDS.singleView,
      normalize: (value) => normalizePageRoute(value),
    });

    setupSelectSelector({
      element: this.querySelector("#mobile_page"),
      hass: this._hass,
      options: mobilePageOptions,
      initialValue:
        this._config?.mobile_page || MOBILE_PAGE_MODES.single,
      fallbackValue: MOBILE_PAGE_MODES.single,
      normalize: (value) => normalizeMobilePageMode(value),
      onChange: () => update(),
    });

    setupEntitySelector({
      element: this.querySelector("#camera-modal-entity"),
      hass: this._hass,
      domain: "camera",
      label: "Camera",
    });

    setupEntitySelector({
      element: this.querySelector("#camera-modal-secondary-entity"),
      hass: this._hass,
      domain: "camera",
      required: false,
      onChange: () => this._syncCameraModalGroupFields(),
    });

    setupEntitySelector({
      element: this.querySelector("#camera-modal-light-entity"),
      hass: this._hass,
      domain: "light",
      required: false,
      onChange: (entity) => {
        this._syncCameraModalLightIconContext(entity);
        this._syncCameraModalLightFields();
      },
    });

    setupIconSelector({
      element: this.querySelector("#camera-modal-light-icon"),
      hass: this._hass,
      entity: "",
    });

    setupEntitySelector({
      element: this.querySelector("#camera-modal-light-entity-2"),
      hass: this._hass,
      domain: "light",
      required: false,
      onChange: (entity) => {
        this._syncCameraModalLightIconContext(entity, 1);
        this._syncCameraModalLightFields();
      },
    });

    setupIconSelector({
      element: this.querySelector("#camera-modal-light-icon-2"),
      hass: this._hass,
      entity: "",
    });

    setupSelectSelector({
      element: this.querySelector("#camera-modal-connection-type"),
      hass: this._hass,
      options: [
        { value: "frigate_go2rtc", label: "Frigate go2rtc (default)" },
        { value: "ha_direct", label: "Home Assistant" },
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
      {
        selector: "#camera-modal-add-secondary",
        handler: () => this._setCameraModalGroupEnabled(true),
      },
      {
        selector: "#camera-modal-remove-secondary",
        handler: () => this._setCameraModalGroupEnabled(false),
      },
      {
        selector: "#camera-modal-add-light",
        handler: () => this._setCameraModalLightEnabled(true, 0),
      },
      {
        selector: "#camera-modal-remove-light",
        handler: () => this._setCameraModalLightEnabled(false, 0),
      },
      {
        selector: "#camera-modal-add-light-2",
        handler: () => this._setCameraModalLightEnabled(true, 1),
      },
      {
        selector: "#camera-modal-remove-light-2",
        handler: () => this._setCameraModalLightEnabled(false, 1),
      },
      {
        selector: "#camera-delete-cancel",
        handler: () => this._closeCameraDeleteConfirmation(),
      },
      {
        selector: "#camera-delete-confirm",
        handler: () => this._confirmCameraRemoval(),
      },
      {
        selector: "#standalone-landing-cancel",
        handler: () => this._closeStandaloneLandingPageModal(),
      },
      {
        selector: "#standalone-landing-confirm",
        handler: () => this._confirmStandaloneLandingPage(),
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
        this._openCameraDeleteConfirmation(
          Number(event.currentTarget.dataset.removeCam),
        );
      },
    });
    this.querySelector("#camera-modal")?.addEventListener("click", (ev) => {
      if (
        ev.target?.id === "camera-modal" &&
        ev !== this._cameraModalSuppressedClickEvent
      ) {
        this._closeCameraModal();
      }
      if (ev === this._cameraModalSuppressedClickEvent) {
        this._cameraModalSuppressedClickEvent = null;
      }
    });
    this.querySelector("#camera-delete-modal")?.addEventListener(
      "click",
      (event) => {
        if (event.target?.id === "camera-delete-modal") {
          this._closeCameraDeleteConfirmation();
        }
      },
    );
    const standaloneLandingModal = this.querySelector(
      "#standalone-landing-modal",
    );
    standaloneLandingModal?.addEventListener("cancel", (event) => {
      event.preventDefault();
      this._closeStandaloneLandingPageModal();
    });
    standaloneLandingModal?.addEventListener("click", (event) => {
      if (event.target !== standaloneLandingModal) return;
      const rect = standaloneLandingModal.getBoundingClientRect?.();
      if (!rect) return;
      const outside =
        event.clientX < rect.left ||
        event.clientX > rect.right ||
        event.clientY < rect.top ||
        event.clientY > rect.bottom;
      if (outside) this._closeStandaloneLandingPageModal();
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
    this.querySelector("#stream_height")?.addEventListener("input", () => {
      this._syncStreamHeightOutput();
    });
    this.querySelector("#stream_height_unit")?.addEventListener(
      "change",
      () => this._syncStreamHeightOutput(),
    );
    this.querySelector("#col_left_width_pct")?.addEventListener(
      "input",
      (event) => {
        this._setRangeValueOutput(
          "#col_left_width_pct",
          event.currentTarget?.value,
          "%",
        );
      },
    );
    this._wireCameraDragAndDrop();
    this._wireGridOrderControls();
    this._wireSettingsPanels();
    this._wireEditorDialogActions();
    this._wireLivePreviewUpdates();
    this._wireStandaloneLandingPageTransition(scheduleUpdate);

    this.querySelector("#ha_dashboard_swipe_navigation_owner")
      ?.addEventListener("change", () => {
        update();
        this._render();
      });
    this.querySelector("#ha_dashboard_swipe_navigation")
      ?.addEventListener("change", (event) => {
        if (
          event.target?.name !== "ha_dashboard_swipe_navigation"
        ) {
          return;
        }
        const selectedMode = String(event.target?.value || "");
        this.querySelectorAll(".editor-swipe-choice").forEach((choice) => {
          choice.classList.toggle(
            "selected",
            choice.querySelector("input:checked") != null,
          );
        });
        const includeOtherSwitch = this.querySelector(
          "#ha_dashboard_swipe_include_other_cards",
        );
        if (includeOtherSwitch) {
          includeOtherSwitch.disabled =
            selectedMode !== DASHBOARD_SWIPE_NAVIGATION_MODES.insideCard;
        }
        this.querySelectorAll(
          "[data-ha-dashboard-swipe-include-subviews]",
        ).forEach((subviewSwitch) => {
          subviewSwitch.disabled =
            subviewSwitch.dataset.haDashboardSwipeIncludeSubviews !==
            selectedMode;
        });
        const pageSelection = this.querySelector(
          "#ha-dashboard-swipe-page-selection",
        );
        if (pageSelection) {
          pageSelection.style.display = [
            DASHBOARD_SWIPE_NAVIGATION_MODES.dashboardWide,
            DASHBOARD_SWIPE_NAVIGATION_MODES.insideCard,
          ].includes(selectedMode)
            ? ""
            : "none";
        }
      });
    this.querySelectorAll("[data-ha-dashboard-swipe-include-subviews]")
      .forEach((subviewSwitch) => {
        subviewSwitch.addEventListener("change", () => {
          this.querySelectorAll(
            "[data-ha-dashboard-swipe-include-subviews]",
          ).forEach((peerSwitch) => {
            peerSwitch.checked = subviewSwitch.checked === true;
          });
          update();
        });
      });

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
        "display_title",
        "display_subtitle",
        "display_logo",
        "wide_view_page_enabled",
        "wide_view_live_cameras",
        "wide_view_alert_takeover",
        "wide_view_timeline_enabled",
        "wide_view_timeline_default_open",
        "card_view_page_enabled",
        "card_view_alert_takeover",
        "card_view_drawer_default_open",
        "mobile_view_page_enabled",
        "mobile_view_rotate_to_fullscreen",
        "mobile_view_outer_border",
        "mobile_view_ha_navbar_bottom",
        "mobile_view_ha_navbar_stack_tabs",
        "mobile_view_ha_navbar_dashboard",
        "ha_dashboard_swipe_navigation",
        "ha_dashboard_swipe_include_other_cards",
        "ha_dashboard_swipe_mouse_enabled",
        "shadows",
        "borders",
        "rounded_corners",
        "outer_shadows",
        "mobile_poll_battery_saver",
        "event_pre_post_roll_enabled",
        "favorites_mixed_cameras",
        "realtime_poll_seconds",
        "snapshot_update_seconds",
        "slideshow_rotation_enabled",
        "slideshow_rotation_seconds",
        "grid_mode_enabled",
        "grid_start_in_grid_enabled",
        "grid_live_view_enabled",
        "grid_rotation_seconds",
        "slideshow_alert_hold_seconds",
        "grid_alert_hold_seconds",
        "preview_page_enabled",
        "preview_page_live_cameras",
        "preview_page_live_cameras_mobile",
        "preview_page_alert_live_duration_seconds",
        "preview_page_show_title_bars",
        "wide_view_timeline_default_scale",
        "stream_height_unit",
      ],
      events: ["input", "change", "value-changed"],
      handler: () => {
        const slideshowRow = this.querySelector("#slideshow_rotation_row");
        const enabled =
          this.querySelector("#slideshow_rotation_enabled")?.checked === true;
        const gridRow = this.querySelector("#grid_rotation_row");
        const gridStartRow = this.querySelector("#grid_start_row");
        const gridLiveRow = this.querySelector("#grid_live_row");
        const gridOrderRow = this.querySelector("#grid_order_row");
        const gridEnabled =
          this.querySelector("#grid_mode_enabled")?.checked === true;
        if (slideshowRow)
          slideshowRow.style.display = enabled ? "flex" : "none";
        if (gridStartRow)
          gridStartRow.style.display = gridEnabled ? "flex" : "none";
        if (gridLiveRow)
          gridLiveRow.style.display = gridEnabled ? "flex" : "none";
        if (gridOrderRow)
          gridOrderRow.style.display = gridEnabled ? "flex" : "none";
        if (gridRow)
          gridRow.style.display =
            gridEnabled && gridVisibleCameraCount > 4 ? "flex" : "none";
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
    const timelineEnabled = this.querySelector(
      "#wide_view_timeline_enabled",
    );
    const timelineEnabledRow = this.querySelector(
      "#wide-timeline-enabled-row",
    );
    const timelineDefaultOpenRow = this.querySelector(
      "#wide-timeline-default-open-row",
    );
    const timelineDefaultScaleRow = this.querySelector(
      "#wide-timeline-default-scale-row",
    );
    if (wideCb && colWidthRow) {
      const syncWideRow = () => {
        colWidthRow.style.display = wideCb.checked ? "" : "none";
        if (timelineEnabledRow) {
          timelineEnabledRow.style.display = wideCb.checked ? "" : "none";
        }
        if (timelineDefaultOpenRow) {
          timelineDefaultOpenRow.style.display =
            wideCb.checked && timelineEnabled?.checked ? "" : "none";
        }
        if (timelineDefaultScaleRow) {
          timelineDefaultScaleRow.style.display =
            wideCb.checked && timelineEnabled?.checked ? "" : "none";
        }
        this._validateEditorFields();
      };
      wideCb.addEventListener("change", syncWideRow);
      wideCb.addEventListener("value-changed", syncWideRow);
      timelineEnabled?.addEventListener("change", syncWideRow);
      timelineEnabled?.addEventListener("value-changed", syncWideRow);
      syncWideRow();
    }

    const haNavbarBottom = this.querySelector(
      "#mobile_view_ha_navbar_bottom",
    );
    const haNavbarDependentRows = [
      this.querySelector("#mobile-view-ha-navbar-stack-row"),
      this.querySelector("#mobile-view-ha-navbar-dashboard-row"),
    ].filter(Boolean);
    if (haNavbarBottom && haNavbarDependentRows.length) {
      const syncHaNavbarDependentRows = () => {
        const visible = haNavbarBottom.checked === true;
        haNavbarDependentRows.forEach((row) => {
          row.style.display = visible ? "" : "none";
        });
      };
      haNavbarBottom.addEventListener(
        "change",
        syncHaNavbarDependentRows,
      );
      haNavbarBottom.addEventListener(
        "value-changed",
        syncHaNavbarDependentRows,
      );
      syncHaNavbarDependentRows();
    }

    this._validateEditorFields();
  }

  _getCams() {
    if (!Array.isArray(this._config?.cameras)) return [];
    return limitCameraConfigsByPhysicalCount(
      this._config.cameras
        .map((camera) =>
          normalizeCameraConfig(camera, { fallbackName: "" }),
        )
        .filter((camera) => camera.entity),
      MAX_CAMERAS,
    );
  }

  _commitGridOrder(gridOrder) {
    this._config = {
      ...this._config,
      grid_order: normalizeGridOrderConfig(gridOrder, this._getCams()),
    };
    this._render();
    this._markHomeAssistantDirty(
      this._homeAssistantConfig({ readDom: false }),
    );
  }

  _wireGridOrderControls() {
    this.querySelectorAll("[data-grid-order-mode]").forEach((button) => {
      button.addEventListener("click", () => {
        const current = normalizeGridOrderConfig(
          this._config?.grid_order,
          this._getCams(),
        );
        const mode =
          button.dataset.gridOrderMode === GRID_ORDER_MODES.custom
            ? GRID_ORDER_MODES.custom
            : GRID_ORDER_MODES.default;
        if (mode === current.mode) return;
        this._commitGridOrder({ ...current, mode });
      });
    });

    const rows = Array.from(this.querySelectorAll(".grid-order-row"));
    wireCameraRowDragAndDrop({
      rows,
      clearDropTargets: () => {
        this.querySelectorAll(".grid-order-row").forEach((row) => {
          row.classList.remove(
            "drop-target",
            "drop-target-before",
            "drop-target-after",
          );
        });
      },
      onReorder: (fromIndex, toIndex, placement) => {
        const current = normalizeGridOrderConfig(
          this._config?.grid_order,
          this._getCams(),
        );
        if (
          fromIndex === toIndex ||
          fromIndex < 0 ||
          toIndex < 0 ||
          fromIndex >= current.included.length ||
          toIndex >= current.included.length
        ) {
          return;
        }
        const included = reorderItemsForDrop(
          current.included,
          fromIndex,
          toIndex,
          placement,
        );
        this._commitGridOrder({ ...current, included });
      },
    });
    this.querySelectorAll("[data-grid-order-exclude]").forEach((button) => {
      button.addEventListener("click", () => {
        const entity = String(button.dataset.gridOrderExclude || "").trim();
        const current = normalizeGridOrderConfig(
          this._config?.grid_order,
          this._getCams(),
        );
        if (!entity || !current.included.includes(entity)) return;
        this._commitGridOrder({
          ...current,
          included: current.included.filter((value) => value !== entity),
          excluded: [...current.excluded, entity],
        });
      });
    });

    this.querySelectorAll("[data-grid-order-include]").forEach((button) => {
      button.addEventListener("click", () => {
        const entity = String(button.dataset.gridOrderInclude || "").trim();
        const current = normalizeGridOrderConfig(
          this._config?.grid_order,
          this._getCams(),
        );
        if (!entity || !current.excluded.includes(entity)) return;
        this._commitGridOrder({
          ...current,
          included: [...current.included, entity],
          excluded: current.excluded.filter((value) => value !== entity),
        });
      });
    });
  }

  _emitPreviewDraft(config, routeIntent = null) {
    window.dispatchEvent(
      new CustomEvent("frigate-view-card-preview-draft", {
        detail: {
          cardTag: CARD_TAG,
          config,
          routeIntent,
        },
      }),
    );
  }

  _homeAssistantConfig({ readDom = true } = {}) {
    if (readDom) {
      const cameras = this._getCams();
      this._config = this._normalizeConfig(
        buildEditorConfigFromDom({
          root: this,
          baseConfig: this._config,
          cameras,
          themeDraftCache: this._themeDraftCache,
          themeMode: this._activeThemeModeKey(),
          hiddenTabsOverride: this._hiddenTabsDraft,
        }),
      );
      this._syncHiddenTabsDraftFromConfig(this._config);
    }
    return withCardTypeForYaml(
      compactEditorConfigForYaml(this._config, {
        themeDefaultColors: this._themeDefaultHexMap(),
      }),
      { sourceConfig: this._config },
    );
  }

  _markHomeAssistantDirty(config = null) {
    const nextConfig = config || this._homeAssistantConfig();
    if (this._haDirtyBaselineConfig === undefined) return;
    const nextSignature = this._configSignature(nextConfig);
    this._hasConfigDraft = nextSignature !== this._haDirtyBaselineSig;
    this._pendingHaDirtyConfig = nextConfig;
    this._seedHomeAssistantDirtyState();

    if (!this._haDirtyStateContext) {
      const dialog = this._findHomeAssistantEditCardDialog();
      dialog?._updateDirtyState?.(nextConfig);
      this._requestHomeAssistantDirtyStateContext();
    }
  }

  _u({
    dispatch = false,
    preview = false,
    previewRouteIntent = null,
  } = {}) {
    if (!this._validateEditorFields()) return;
    const previousConfigSig = this._configSignature(this._config);
    const cameras = this._getCams();
    const prevOptionSignature = this._landingPageOptionSignature(this._config);
    const nextConfig = buildEditorConfigFromDom({
      root: this,
      baseConfig: this._config,
      cameras,
      themeDraftCache: this._themeDraftCache,
      themeMode: this._activeThemeModeKey(),
      hiddenTabsOverride: this._hiddenTabsDraft,
    });
    const normalizedNextConfig = this._normalizeConfig(nextConfig);
    const configChanged =
      this._configSignature(normalizedNextConfig) !== previousConfigSig;
    const nextOptionSignature =
      this._landingPageOptionSignature(normalizedNextConfig);

    this._config = normalizedNextConfig;
    this._syncHiddenTabsDraftFromConfig(normalizedNextConfig);
    if (preview) {
      this._hasVisualDraft = true;
      this._emitPreviewDraft(
        createEditorPreviewDraft(normalizedNextConfig),
        previewRouteIntent,
      );
    }
    if (
      previewRouteIntent?.type ===
      EDITOR_PREVIEW_ROUTE_INTENTS.revertStandaloneDraft
    ) {
      this._standaloneDraftPreviousLandingPage = null;
    }
    if (prevOptionSignature !== nextOptionSignature) {
      this._render();
    }
    if (configChanged) {
      this._markHomeAssistantDirty(
        this._homeAssistantConfig({ readDom: false }),
      );
    }
    if (dispatch && configChanged) this._dispatch();
  }

  _commitDraftToHomeAssistantDialog() {
    const config = this._homeAssistantConfig();
    const dialog = this._findHomeAssistantEditCardDialog();
    if (!dialog || !("_cardConfig" in dialog)) {
      this._dispatch(config);
      return;
    }
    this._lastDispatchedConfig = config;
    this._lastDispatchedConfigSig = this._configSignature(config);
    // Commit only at Save; HA rebuilds every preview-mode card on config-changed.
    dialog._cardConfig = config;
    dialog._updateDirtyState?.(config);
  }

  _dispatch(config = this._homeAssistantConfig()) {
    this._lastDispatchedConfig = config;
    this._lastDispatchedConfigSig = this._configSignature(config);
    this.dispatchEvent(
      new CustomEvent("config-changed", {
        detail: { config },
        bubbles: true,
        composed: true,
      }),
    );
  }
}
