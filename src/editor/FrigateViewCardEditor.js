import {
  VERSION,
  RECOMMENDED_HOME_ASSISTANT_VERSION,
  CARD_NAME,
  CARD_DISPLAY_NAME,
  CARD_TAG,
  DEFAULT_TITLE,
  DEFAULT_SUBTITLE,
  DEFAULT_HIDDEN_TABS,
  DEFAULT_EVENT_DAYS,
  DEFAULT_ALERTS_REVIEWS_DAYS,
  REALTIME_POLL_OPTIONS_SECONDS,
  SNAPSHOT_UPDATE_SECONDS,
  SNAPSHOT_UPDATE_OPTIONS_SECONDS,
  EVENT_PRE_POST_ROLL_SECONDS,
  SLIDESHOW_ROTATION_OPTIONS_SECONDS,
  GRID_ROTATION_OPTIONS_SECONDS,
  SLIDESHOW_ALERT_HOLD_MS,
  SLIDESHOW_ALERT_HOLD_OPTIONS_SECONDS,
  GRID_ALERT_HOLD_MS,
  GRID_ALERT_HOLD_OPTIONS_SECONDS,
  PREVIEW_ALERT_HOLD_MS,
  PREVIEW_ALERT_LIVE_DURATION_OPTIONS_SECONDS,
  MAX_CAMERAS,
  DEFAULT_CAMERA_CONNECTION_TYPE,
  ALLOWED_HIDDEN_TABS,
  THEME_DEFAULTS,
  THEME_CUSTOM_ROWS,
  THEME_MODES,
} from "../constants.js";
import { ICONS } from "../icons.js";
import {
  parseWs,
  normalizeNumberChoice,
  normalizeCameraConnectionType,
  normalizeAlertsAreaContent,
  normalizeHexColor,
  normalizeThemeMode,
  normalizeThemeCustomDefaultsConfig,
  DIALOG_ACTION_SELECTOR,
  setSettingsPanelActiveState,
  dialogActionKindFromElement,
  dialogActionKindFromEvent,
  reorderItemsForDrop,
  wireCameraRowDragAndDrop,
  setFieldErrorState,
  setupSelectSelector,
  setupEntitySelector,
  setupIconSelector,
  bindThemeControlEvents,
  bindClickHandlers,
  bindEachClickHandler,
  bindEventsForIds,
  bindEventsForSelectorAll,
  buildEditorConfigFromDom,
  resolveSwitchChecked,
  normalizeCameraConfig,
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
import { resolveFrigateViewCardUpdateStatus } from "../integrations/home-assistant/card-update-status.js";
import {
  findHomeAssistantLovelacePanel,
  resolveCurrentHomeAssistantViewName,
  resolveDashboardSwipeNavigationOwnership,
} from "../integrations/home-assistant/dashboard-swipe-navigation.ctrl.js";
import {
  DASHBOARD_SWIPE_MOBILE_PAGE_OPTIONS,
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
  resolveDashboardSwipeMobilePageSelection,
  resolveDashboardSwipePageSelection,
  resolveMobileSwipeLandingPage,
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
import { resolveDashboardNavbarCardOwnership } from "../integrations/home-assistant/navbar.ctrl.js";
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
  CARD_VIEW_VIEW_MODES,
  normalizeCardViewViewMode,
} from "../features/card-view/config.js";
import {
  normalizePageStartMode,
  pageStartModeOptions,
} from "../features/navigation/start-mode.js";
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
import { createLocalizationController } from "../features/localization/localization.ctrl.js";
import { applyLocalizedText, setLocalizedText } from "../features/localization/localized-dom.js";
import {
  DISPLAY_TEXT_MAX_LENGTH,
  sanitizeDisplayText,
} from "../shared/page-text.js";
import {
  isFrigateIntegrationLoaded,
  resolveFrigateIntegrationStatus,
  resolveHomeAssistantVersionStatus,
} from "./environment-support.js";

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
const EDITOR_TEXT_PREVIEW_DELAY_MS = 200;
const EDITOR_GO2RTC_METADATA_CACHE_TTL_MS = 30_000;

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
      .map(({ value, label, description = "", disabled = false, translationKey = "" }) => {
        const safeValue = escapeEditorChoiceMarkup(value);
        const safeLabel = escapeEditorChoiceMarkup(label);
        const safeDescription = escapeEditorChoiceMarkup(description);
        const textKey = translationKey
          ? ` data-fvc-i18n="${escapeHtmlAttribute(translationKey)}"`
          : "";
        return `<label class="editor-choice-chip">
          <input class="editor-choice-chip-input" type="radio" name="${safeName}" value="${safeValue}" ${String(value) === selected ? "checked" : ""} ${disabled ? "disabled" : ""}>
          <span class="editor-choice-chip-body">
            <span class="editor-choice-chip-indicator" aria-hidden="true"></span>
            ${hasDescriptions ? `<span class="editor-choice-chip-copy"><span class="editor-choice-chip-text"${textKey}>${safeLabel}</span><span class="editor-choice-chip-description">${safeDescription}</span></span>` : `<span class="editor-choice-chip-text"${textKey}>${safeLabel}</span>`}
          </span>
        </label>`;
      })
      .join("")}
  </div>`;
};

const buildEditorBubbleSelectorMarkup = ({
  name,
  options,
  selectedValue,
}) => {
  const selected = String(selectedValue ?? "");
  const safeName = escapeEditorChoiceMarkup(name);
  return `<div class="theme-scope-seg card-view-start-seg editor-bubble-selector" style="--editor-bubble-option-count:${Math.max(1, options.length)}">
    ${options
      .map(({ value, label, disabled = false, disabledReason = "" }) => {
        const safeValue = escapeEditorChoiceMarkup(value);
        const safeLabel = escapeEditorChoiceMarkup(label);
        const safeDisabledReason = escapeHtmlAttribute(disabledReason);
        const optionDisabled = disabled === true;
        return `<label class="theme-scope-opt card-view-start-opt" data-disabled-guidance="${safeDisabledReason}"${optionDisabled && safeDisabledReason ? ` title="${safeDisabledReason}"` : ""}>
          <input class="card-view-start-input" type="radio" name="${safeName}" value="${safeValue}" ${String(value) === selected ? "checked" : ""} ${optionDisabled ? "disabled" : ""} aria-label="${safeLabel}${optionDisabled && safeDisabledReason ? `. ${safeDisabledReason}` : ""}">
          <span>${safeLabel}</span>
        </label>`;
      })
      .join("")}
  </div>`;
};

const buildPageStartModeControl = ({
  name,
  selectedValue,
  gridEnabled,
  slideshowEnabled,
}) =>
  buildEditorBubbleSelectorMarkup({
    name,
    selectedValue: normalizePageStartMode(selectedValue),
    options: pageStartModeOptions({ gridEnabled, slideshowEnabled }),
  });

export class FrigateViewCardEditor extends HTMLElement {
  _t(key, values = {}) {
    this._localization ??= createLocalizationController();
    return this._localization.t(key, values);
  }

  _setLocalizedMessage(element, key, values = {}) {
    this._localization ??= createLocalizationController();
    setLocalizedText(element, key, this._localization.t, values);
  }

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

  _editorCapabilityCacheNow() {
    return Date.now();
  }

  _frigateCapabilityCacheKey(entity) {
    const targetEntity = String(entity || "").trim();
    const context = this._cameraEntityCapabilityLookupContext(targetEntity);
    return JSON.stringify([
      targetEntity,
      context?.instanceId || "",
      context?.cameraName || "",
    ]);
  }

  _haCameraCapabilityCacheKey(entity) {
    const targetEntity = String(entity || "").trim();
    const state = this._hass?.states?.[targetEntity];
    const attrs = state?.attributes || {};
    return JSON.stringify([
      targetEntity,
      Boolean(state),
      attrs.supported_features ?? null,
      attrs.frontend_stream_type ?? null,
      attrs.frontend_stream_types ?? null,
    ]);
  }

  _pruneChangedCapabilityCacheEntries(cache, cacheKeyForEntity) {
    if (!(cache instanceof Map)) return;
    cache.forEach((entry, cacheKey) => {
      if (!entry?.entity || cacheKey !== cacheKeyForEntity(entry.entity)) {
        cache.delete(cacheKey);
      }
    });
  }

  _pruneChangedCapabilityCaches() {
    this._pruneChangedCapabilityCacheEntries(
      this._ptzCapabilityCache,
      (entity) => this._frigateCapabilityCacheKey(entity),
    );
    this._pruneChangedCapabilityCacheEntries(
      this._go2rtcMetadataCache,
      (entity) => this._frigateCapabilityCacheKey(entity),
    );
    this._pruneChangedCapabilityCacheEntries(
      this._haCameraCapabilityCache,
      (entity) => this._haCameraCapabilityCacheKey(entity),
    );
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
    const cacheKey = this._frigateCapabilityCacheKey(targetEntity);
    const cached = this._ptzCapabilityCache.get(cacheKey);
    if (cached?.resolved) return cached.info;
    if (cached?.promise) return cached.promise;

    const context = this._cameraEntityCapabilityLookupContext(targetEntity);
    if (!context) {
      const empty = {
        entity: targetEntity,
        resolved: true,
        info: null,
        promise: null,
      };
      this._ptzCapabilityCache.set(cacheKey, empty);
      return null;
    }

    const entry = {
      entity: targetEntity,
      resolved: false,
      info: null,
      promise: null,
    };
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

    this._ptzCapabilityCache.set(cacheKey, entry);
    return entry.promise;
  }

  async _fetchGo2RtcStreamMetadataForEntity(entity) {
    const targetEntity = String(entity || "").trim();
    if (!targetEntity || !this._hass?.callWS) return null;
    this._ensureGo2RtcMetadataCache();
    const cacheKey = this._frigateCapabilityCacheKey(targetEntity);
    const cached = this._go2rtcMetadataCache.get(cacheKey);
    const now = this._editorCapabilityCacheNow();
    if (cached?.resolved && cached.expiresAt > now) return cached.info;
    if (cached?.promise) return cached.promise;
    if (cached) this._go2rtcMetadataCache.delete(cacheKey);

    const context = this._cameraEntityCapabilityLookupContext(targetEntity);
    if (!context) {
      const empty = {
        entity: targetEntity,
        resolved: true,
        info: null,
        promise: null,
        expiresAt: now + EDITOR_GO2RTC_METADATA_CACHE_TTL_MS,
      };
      this._go2rtcMetadataCache.set(cacheKey, empty);
      return null;
    }

    const entry = {
      entity: targetEntity,
      resolved: false,
      info: null,
      promise: null,
      expiresAt: 0,
    };
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
        entry.expiresAt =
          this._editorCapabilityCacheNow() +
          EDITOR_GO2RTC_METADATA_CACHE_TTL_MS;
      }
      return entry.info;
    })();

    this._go2rtcMetadataCache.set(cacheKey, entry);
    return entry.promise;
  }

  async _fetchHaCameraCapabilitiesForEntity(entity) {
    const targetEntity = String(entity || "").trim();
    if (!targetEntity || !this._hass?.callWS) return null;
    this._ensureHaCameraCapabilityCache();
    const cacheKey = this._haCameraCapabilityCacheKey(targetEntity);
    const cached = this._haCameraCapabilityCache.get(cacheKey);
    if (cached?.resolved) return cached.info;
    if (cached?.promise) return cached.promise;

    const entry = {
      entity: targetEntity,
      resolved: false,
      info: null,
      promise: null,
    };
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

    this._haCameraCapabilityCache.set(cacheKey, entry);
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
    this._localization ??= createLocalizationController();
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
        setLocalizedText(
          stateMessage,
          isHaDirect
            ? "editor.cameraModal.checkingPtzHa"
            : "editor.cameraModal.checkingPtzFrigate",
          this._localization.t,
        );
      } else if (!supported) {
        stateMessage.style.display = "block";
        setLocalizedText(
          stateMessage,
          "editor.cameraModal.ptzUnsupported",
          this._localization.t,
        );
      } else {
        stateMessage.style.display = "none";
        setLocalizedText(stateMessage, null, this._localization.t);
      }
    }
    this._syncCameraModalAccordionSummaries();
  }

  _syncCameraModalTwoWayTalkVisibility({
    supported = false,
    loading = false,
    sourceType = DEFAULT_CAMERA_CONNECTION_TYPE,
    preserveSelection = false,
  } = {}) {
    this._localization ??= createLocalizationController();
    const twoWayTalkToggleRow = this.querySelector(
      "#camera-modal-two-way-talk-toggle-row",
    );
    const twoWayTalkEnabled = this.querySelector(
      "#camera-modal-two-way-talk-enabled",
    );
    const twoWayTalkStateMessage = this.querySelector(
      "#camera-modal-two-way-talk-state",
    );
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
        setLocalizedText(
          twoWayTalkStateMessage,
          isHaDirect
            ? "editor.cameraModal.checkingTalkHa"
            : "editor.cameraModal.checkingTalkFrigate",
          this._localization.t,
        );
      } else if (!supported) {
        twoWayTalkStateMessage.style.display = "block";
        setLocalizedText(
          twoWayTalkStateMessage,
          isHaDirect
            ? "editor.cameraModal.talkUnsupportedHa"
            : "editor.cameraModal.talkUnsupportedFrigate",
          this._localization.t,
        );
      } else if (isHaDirect) {
        twoWayTalkStateMessage.style.display = "block";
        setLocalizedText(
          twoWayTalkStateMessage,
          "editor.cameraModal.talkExperimentalHa",
          this._localization.t,
        );
      } else {
        twoWayTalkStateMessage.style.display = "none";
        setLocalizedText(twoWayTalkStateMessage, null, this._localization.t);
      }
    }
    if (twoWayTalkEnabled) {
      twoWayTalkEnabled.dataset.supported = supported ? "true" : "false";
      twoWayTalkEnabled.disabled = !allowSelection || loading;
      if (!supported && !loading && !preserveSelection) {
        twoWayTalkEnabled.checked = false;
      }
    }
    this._syncCameraModalAccordionSummaries();
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
    if (this._textPreviewUpdateT) {
      clearTimeout(this._textPreviewUpdateT);
      this._textPreviewUpdateT = null;
    }
    if (this._livePreviewRaf) {
      cancelAnimationFrame(this._livePreviewRaf);
      this._livePreviewRaf = 0;
    }
    this._pendingEditorPreviewUpdate = false;
    if (this._previewUpdateRaf) {
      cancelAnimationFrame(this._previewUpdateRaf);
      this._previewUpdateRaf = 0;
    }
    this._pendingEditorPreviewRouteIntent = null;
    this._editorPreviewLayoutObserver?.disconnect();
    this._editorPreviewLayoutObserver = null;
    this._editorPreviewLayoutObserverTarget = null;
    this._restoreEditorPreviewLayout();
    this._settingsPanelScrollCleanup?.();
    this._settingsPanelScrollCleanup = null;
    this._settingsPanelResizeObserver?.disconnect?.();
    this._settingsPanelResizeObserver = null;
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

  _syncConfigSaveReminder() {
    const reminder = this.querySelector?.("#config-save-reminder");
    if (!reminder) return;
    const dirty = this._hasConfigDraft === true;
    reminder.hidden = false;
    if (reminder.dataset) {
      reminder.dataset.configSaveState = dirty ? "dirty" : "clean";
    }
    reminder.setAttribute?.("data-config-save-state", dirty ? "dirty" : "clean");
    const text = reminder.querySelector?.("[data-config-save-reminder-text]");
    if (text) {
      const key = dirty
        ? "editor.status.unsavedChanges"
        : "editor.status.noPendingChanges";
      text.setAttribute?.("data-fvc-i18n", key);
      text.textContent = this._t(key);
    }
  }

  _syncCardVersionStatus() {
    const badge = this.querySelector?.("#card-version-status");
    const statusText = this.querySelector?.("#card-version-update-status");
    const updateLink = this.querySelector?.("#card-version-update-link");
    if (!badge || !statusText || !updateLink) return;

    const states = this._hass?.states;
    if (this._cardUpdateEntityId && states && !states[this._cardUpdateEntityId]) {
      this._cardUpdateEntityId = "";
      this._cardUpdateEntityLookupComplete = false;
    }
    let updateStatus;
    if (this._cardUpdateEntityId && states?.[this._cardUpdateEntityId]) {
      updateStatus = resolveFrigateViewCardUpdateStatus({
        states: {
          [this._cardUpdateEntityId]: states[this._cardUpdateEntityId],
        },
      });
    } else if (this._cardUpdateEntityLookupComplete) {
      updateStatus = {
        entityId: "",
        status: "unavailable",
        label: "Update status unavailable",
      };
    } else {
      updateStatus = resolveFrigateViewCardUpdateStatus({ states });
      if (states) {
        this._cardUpdateEntityLookupComplete = true;
        this._cardUpdateEntityId = updateStatus.entityId;
      }
    }

    if (badge.dataset.updateStatus !== updateStatus.status) {
      badge.dataset.updateStatus = updateStatus.status;
    }
    if (statusText.textContent !== updateStatus.label) {
      statusText.textContent = updateStatus.label;
    }
    const showUpdateLink =
      updateStatus.status === "available" && Boolean(updateStatus.entityId);
    updateLink.hidden = !showUpdateLink;
    if (updateLink.dataset.entityId !== updateStatus.entityId) {
      updateLink.dataset.entityId = updateStatus.entityId;
    }
  }

  _syncEnvironmentSupportNotice(selector, state) {
    const notice = this.querySelector?.(selector);
    if (!notice) return;
    const text = notice.querySelector?.("[data-environment-support-text]");
    if (text && text.textContent !== state.label) {
      text.textContent = state.label;
    }
    if (notice.dataset.supportStatus !== state.status) {
      notice.dataset.supportStatus = state.status;
    }
    notice.hidden = !state.visible;
  }

  _syncEnvironmentSupportNotices() {
    const homeAssistantStatus = resolveHomeAssistantVersionStatus({
      currentVersion: this._hass?.config?.version,
      recommendedVersion: RECOMMENDED_HOME_ASSISTANT_VERSION,
    });
    const frigateIntegrationStatus = resolveFrigateIntegrationStatus({
      installed: isFrigateIntegrationLoaded(this._hass),
    });
    this._syncEnvironmentSupportNotice(
      "[data-home-assistant-version-notice]",
      homeAssistantStatus,
    );
    this._syncEnvironmentSupportNotice(
      "[data-frigate-integration-status]",
      frigateIntegrationStatus,
    );
  }

  _openCardUpdateDialog(entityId) {
    const normalizedEntityId = String(entityId || "").trim();
    if (!normalizedEntityId) return;
    this.dispatchEvent(
      new CustomEvent("hass-more-info", {
        bubbles: true,
        composed: true,
        detail: { entityId: normalizedEntityId },
      }),
    );
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
    this._localization ??= createLocalizationController();
    const languageChanged = this._localization.updateHass(hass);
    if (languageChanged) {
      applyLocalizedText(this, this._localization.t);
      if (this._rendered) {
        this._syncCameraConnectionTypeOptions();
        this._syncCameraModalGroupFields();
        this._syncConfigSaveReminder();
        this._syncCameraDeleteConfirmationMessage();
      }
    }
    this._pruneChangedCapabilityCaches();
    const modeKey = this._hass?.themes?.darkMode ? "dark" : "light";
    const key = `${this._frigateEntities().join(",")}|${modeKey}`;
    if (key !== this._lastEntityKey) {
      this._lastEntityKey = key;
      if (this._rendered) this._render();
    }
    this._syncCardVersionStatus();
    this._syncEnvironmentSupportNotices();
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
    const configuredDashboardName =
      String(dashboardConfig?.title || "").trim() ||
      String(panel?.route?.prefix || "this dashboard")
        .replace(/^\/+/, "")
        .replace(/[-_]+/g, " ");
    const dashboardName = configuredDashboardName.replace(
      /^dashboard\s+/i,
      "",
    );
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

  _dashboardNavbarOwnershipState() {
    const requested =
      this._config?.mobile_view_ha_navbar_dashboard === true;
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

    const currentViewName = resolveCurrentHomeAssistantViewName({
      panel,
      windowRef: globalThis.window,
    });
    const ownership = resolveDashboardNavbarCardOwnership({
      dashboardConfig,
      sourceConfig: this._sourceConfig,
      requested,
      cardTag: CARD_TAG,
      currentViewName,
    });
    const configuredDashboardName =
      String(dashboardConfig?.title || "").trim() ||
      String(panel?.route?.prefix || "this dashboard")
        .replace(/^\/+/, "")
        .replace(/[-_]+/g, " ");
    const dashboardName = configuredDashboardName.replace(
      /^dashboard\s+/i,
      "",
    );
    const ownerPage =
      ownership.owner?.viewTitle ||
      ownership.owner?.viewName ||
      currentViewName ||
      "another page";
    return {
      ...ownership,
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
    return `${desktop}::${mobile}::${normalized.landing_page}::${normalized.mobile_page}::${resolveMobileSwipeLandingPage(normalized)}`;
  }

  _frigateEntities() {
    const states = this._hass?.states || {};
    const entities = Object.keys(states).filter((entity) => {
      if (!entity.startsWith("camera.")) return false;
      const attrs = states[entity]?.attributes;
      return Boolean(
        attrs?.client_id || attrs?.mqtt_client_id || attrs?.camera_name,
      );
    });
    const cachedSet = this._frigateEntitySet;
    if (
      cachedSet instanceof Set &&
      cachedSet.size === entities.length &&
      entities.every((entity) => cachedSet.has(entity))
    ) {
      return this._frigateEntityList;
    }
    entities.sort();
    this._frigateEntitySet = new Set(entities);
    this._frigateEntityList = entities;
    return entities;
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
    this._publishPreviewDraft();
    this._markHomeAssistantDirty(
      this._homeAssistantConfig({ readDom: false }),
    );
  }

  _setCameraModalAccordionActive(sectionId = null) {
    const requestedId = String(sectionId || "");
    this.querySelectorAll(
      ".camera-modal-accordion[data-camera-modal-section]",
    ).forEach((section) => {
      const active = section.dataset.cameraModalSection === requestedId;
      section.classList.toggle("active", active);
      section
        .querySelector("[data-camera-modal-accordion-toggle]")
        ?.setAttribute("aria-expanded", active ? "true" : "false");
      const content = section.querySelector(
        ".camera-modal-accordion-content",
      );
      if (content) content.hidden = !active;
    });
  }

  _toggleCameraModalAccordion(sectionId) {
    const section = this.querySelector(
      `.camera-modal-accordion[data-camera-modal-section="${String(sectionId || "")}"]`,
    );
    this._setCameraModalAccordionActive(
      section?.classList.contains("active") ? null : sectionId,
    );
  }

  _setCameraModalAccordionSummary(id, value) {
    const summary = this.querySelector(`#camera-modal-${id}-summary`);
    if (!summary) return;
    const text = String(value || "").trim();
    summary.textContent = text;
    summary.title = text;
    summary.hidden = !text;
  }

  _cameraModalEntityLabel(entity) {
    const entityId = String(entity || "").trim();
    return String(
      this._hass?.states?.[entityId]?.attributes?.friendly_name ||
        entityId.replace(/^[^.]+\./, "").replace(/_/g, " "),
    ).trim();
  }

  _syncCameraConnectionTypeOptions() {
    const selector = this.querySelector("#camera-modal-connection-type");
    if (!selector?.selector?.select) return;
    const options = [
      {
        value: "frigate_go2rtc",
        label: this._t("editor.cameraModal.frigateGo2rtcDefault"),
      },
      {
        value: "ha_direct",
        label: this._t("editor.cameraModal.homeAssistant"),
      },
    ];
    const currentOptions = selector.selector.select.options || [];
    if (
      currentOptions.length === options.length &&
      currentOptions.every(
        (option, index) =>
          option.value === options[index].value &&
          option.label === options[index].label,
      )
    ) {
      return;
    }
    selector.selector = {
      ...selector.selector,
      select: {
        ...selector.selector.select,
        options,
      },
    };
  }

  _syncCameraModalAccordionSummaries() {
    this._setCameraModalAccordionSummary(
      "connection",
      this._cameraModalConnectionTypeValue() === "ha_direct"
        ? this._t("editor.cameraModal.homeAssistant")
        : this._t("editor.cameraModal.frigateGo2rtc"),
    );

    const secondaryEntity = this._cameraModalGroupEnabled
      ? this._cameraModalSecondaryEntityValue()
      : "";
    this._setCameraModalAccordionSummary(
      "additional",
      this._cameraModalEntityLabel(secondaryEntity) ||
        this._t("editor.cameraModal.noneConfigured"),
    );

    const lights = [0, 1]
      .filter((index) => this._cameraModalLightEnabledAt(index))
      .map((index) => this._cameraModalLightEntityValue(index))
      .filter(Boolean)
      .map((entity) =>
        linkedLightFriendlyName(entity, this._hass?.states?.[entity]),
      );
    this._setCameraModalAccordionSummary(
      "lights",
      lights.join(", ") || this._t("editor.cameraModal.noneConfigured"),
    );

    const options = [];
    if (resolveSwitchChecked(this.querySelector("#camera-modal-ptz-enabled"))) {
      options.push("PTZ");
    }
    if (
      resolveSwitchChecked(
        this.querySelector("#camera-modal-two-way-talk-enabled"),
      )
    ) {
      options.push(this._t("editor.cameraModal.twoWayTalk"));
    }
    this._setCameraModalAccordionSummary("options", options.join(" · "));
  }

  _syncLimitedTextField(selector, counterSelector, value) {
    const field = this.querySelector(selector);
    if (!field) return "";
    const sanitized = sanitizeDisplayText(value ?? field.value);
    if (field.value !== sanitized) field.value = sanitized;
    const counter = this.querySelector(counterSelector);
    if (counter) {
      counter.textContent = `${sanitized.length}/${DISPLAY_TEXT_MAX_LENGTH}`;
    }
    return sanitized;
  }

  _wireLimitedTextField(selector, counterSelector) {
    const field = this.querySelector(selector);
    if (!field) return;
    field.maxLength = DISPLAY_TEXT_MAX_LENGTH;
    field.setAttribute?.("maxlength", String(DISPLAY_TEXT_MAX_LENGTH));
    const sync = (event) =>
      this._syncLimitedTextField(
        selector,
        counterSelector,
        event?.detail?.value ?? field.value,
      );
    ["input", "value-changed", "change"].forEach((eventName) =>
      field.addEventListener(eventName, sync),
    );
    sync();
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
    const titleKey = index == null
      ? "editor.cameraModal.addCamera"
      : "editor.cameraModal.editCamera";
    const saveKey = index == null ? "editor.actions.add" : "editor.actions.update";
    if (title) {
      title.setAttribute?.("data-fvc-i18n", titleKey);
      title.textContent = this._t(titleKey);
    }
    if (save) {
      save.setAttribute?.("data-fvc-i18n", saveKey);
      save.textContent = this._t(saveKey);
    }
    if (name) name.value = sanitizeDisplayText(cam?.name);
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
    this._setCameraModalAccordionActive();
    this._setLocalizedMessage(helper, null);
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
    this._syncLimitedTextField(
      "#camera-modal-name",
      "#camera-modal-name-counter",
    );
    this._syncCameraModalAccordionSummaries();
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
    this._syncCameraDeleteConfirmationMessage();
    this.querySelector("#camera-delete-modal")?.classList.remove("hidden");
    this.querySelector("#camera-delete-confirm")?.focus?.();
  }

  _syncCameraDeleteConfirmationMessage() {
    const index = this._pendingCameraRemovalIndex;
    const cameras = this._getCams();
    if (!Number.isInteger(index) || !cameras[index]) return;
    const message = this.querySelector("#camera-delete-message");
    if (message) {
      this._setLocalizedMessage(message, "editor.cameraModal.deleteConfirm", {
        camera: this._cameraLabel(cameras[index]),
      });
    }
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
    this._setLocalizedMessage(helper, null);
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
      this._setLocalizedMessage(
        helper,
        "editor.cameraModal.selectLandingPage",
      );
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
    const nameInput = this.querySelector("#camera-modal-name");
    const addButton = this.querySelector("#camera-modal-add-secondary");
    const help = this.querySelector("#camera-modal-secondary-help");
    const removeButton = this.querySelector("#camera-modal-remove-secondary");
    const fields = this.querySelector("#camera-modal-group-fields");
    const labelKey = enabled
      ? "editor.cameraModal.groupName"
      : "editor.cameraModal.cameraName";
    const label = this._t(labelKey);
    if (nameInput) {
      nameInput.label = label;
      nameInput.setAttribute?.("label", label);
      nameInput.setAttribute?.("aria-label", label);
      nameInput.setAttribute?.("data-fvc-i18n-label", labelKey);
      nameInput.setAttribute?.("data-fvc-i18n-aria-label", labelKey);
    }
    if (addButton) addButton.hidden = enabled;
    if (help) help.hidden = enabled;
    if (fields) fields.hidden = !enabled;
    if (removeButton) {
      const removeKey = this._cameraModalSecondaryEntityValue()
        ? "editor.cameraModal.removeCamera"
        : "editor.actions.cancel";
      removeButton.setAttribute?.("data-fvc-i18n", removeKey);
      removeButton.textContent = this._t(removeKey);
    }
    this._syncCameraModalAccordionSummaries();
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
    this._setLocalizedMessage(helper, null);
    this._syncCameraModalGroupFields();
    this._syncLimitedTextField(
      "#camera-modal-name",
      "#camera-modal-name-counter",
    );
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
        const removeKey = this._cameraModalLightEntityValue(index)
          ? index === 1
            ? "editor.cameraModal.removeSecondLight"
            : "editor.cameraModal.removeLight"
          : "editor.actions.cancel";
        removeButton.setAttribute?.("data-fvc-i18n", removeKey);
        removeButton.textContent = this._t(removeKey);
      }
    });
    this._syncCameraModalAccordionSummaries();
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
    this._setLocalizedMessage(helper, null);
    this._syncCameraModalLightFields();
  }

  _saveCameraModal() {
    const entity = this._cameraModalEntityValue();
    const secondaryEntity = this._cameraModalSecondaryEntityValue();
    const name = sanitizeDisplayText(
      this.querySelector("#camera-modal-name")?.value,
    ).trim();
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
      this._setLocalizedMessage(helper, "editor.cameraModal.cameraRequired");
      return;
    }
    if (this._cameraModalGroupEnabled && !secondaryEntity) {
      this._setLocalizedMessage(helper, "editor.cameraModal.secondCameraRequired");
      return;
    }
    if (this._cameraModalGroupEnabled && secondaryEntity === entity) {
      this._setLocalizedMessage(helper, "editor.cameraModal.differentCamerasRequired");
      return;
    }
    if (
      requestedLinkedLights.some(
        ({ entity: lightEntity }) => !lightEntity.startsWith("light."),
      )
    ) {
      this._setLocalizedMessage(helper, "editor.cameraModal.lightEntityRequired");
      return;
    }
    if (
      new Set(requestedLinkedLights.map(({ entity: lightEntity }) => lightEntity))
        .size !== requestedLinkedLights.length
    ) {
      this._setLocalizedMessage(helper, "editor.cameraModal.differentLightsRequired");
      return;
    }
    const cur = [...this._getCams()];
    const usedEntities = cur.flatMap((camera, index) =>
      index === this._editingCamIndex ? [] : cameraMemberEntities(camera),
    );
    const requestedEntities = [entity];
    if (this._cameraModalGroupEnabled) requestedEntities.push(secondaryEntity);
    if (requestedEntities.some((value) => usedEntities.includes(value))) {
      this._setLocalizedMessage(helper, "editor.cameraModal.cameraAlreadyConfigured");
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
        this._setLocalizedMessage(helper, "editor.cameraModal.maximumCameras", {
          max: MAX_CAMERAS,
        });
        return;
      }
      cur.push(nextCamera);
    } else if (cur[this._editingCamIndex]) {
      const next = [...cur];
      next[this._editingCamIndex] = nextCamera;
      if (countPhysicalCameras(next) > MAX_CAMERAS) {
        this._setLocalizedMessage(helper, "editor.cameraModal.maximumCameras", {
          max: MAX_CAMERAS,
        });
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
    this._publishPreviewDraft();
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
    this._publishPreviewDraft();
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
        <h3 data-fvc-i18n="editor.panels.${escapeHtmlAttribute(id)}">${escapeHtml(title)}</h3>
      </button>
      <div class="setting-content">
        ${content}
        <div class="settings-more-slot">
          <button type="button" class="settings-more-chip" data-panel-more title="Show more options" aria-label="Show more options" data-fvc-i18n-title="editor.actions.showMoreOptions" data-fvc-i18n-aria-label="editor.actions.showMoreOptions" hidden>
            <span data-fvc-i18n="editor.actions.more">More</span>
            ${ICONS.chevron}
          </button>
        </div>
      </div>
    </section>`;
  }

  _settingsPanelScrollContainer(path = null) {
    const candidates = Array.isArray(path) && path.length ? [...path] : [];
    if (!candidates.length) {
      let node = this;
      const visited = new Set();
      while (node && !visited.has(node)) {
        visited.add(node);
        candidates.push(node);
        const root = node.getRootNode?.();
        node = node.assignedSlot || node.parentElement || root?.host || null;
      }
    }

    for (const node of candidates) {
      const documentRoot = this.ownerDocument;
      if (
        !node ||
        node === documentRoot?.scrollingElement ||
        node === documentRoot?.documentElement ||
        node === documentRoot?.body ||
        typeof node.getBoundingClientRect !== "function"
      ) {
        continue;
      }
      let overflowY = "";
      try {
        overflowY = String(
          globalThis.getComputedStyle?.(node)?.overflowY || "",
        );
      } catch {
        continue;
      }
      if (/(auto|scroll|overlay)/.test(overflowY) && node.clientHeight > 0) {
        return node;
      }
    }
    return null;
  }

  _syncSettingsPanelMoreState(panel, viewport = null) {
    const content = panel?.querySelector?.(".setting-content");
    const more = content?.querySelector?.("[data-panel-more]");
    const slot = content?.querySelector?.(".settings-more-slot");
    if (!more || !slot) return;
    if (!panel.classList?.contains("active")) {
      more.hidden = true;
      return;
    }

    const scrollViewport = viewport;
    const contentRect = content.getBoundingClientRect?.();
    const viewportRect = scrollViewport?.getBoundingClientRect?.();
    if (!contentRect || !viewportRect) {
      more.hidden = true;
      return;
    }
    const viewportBottom = Number(viewportRect.bottom);
    const hasHiddenOptions = Number(contentRect.bottom) > viewportBottom + 3;
    more.hidden = !hasHiddenOptions;
    if (!hasHiddenOptions) return;
    const cueTop = Math.max(
      8,
      Math.min(
        Number(contentRect.height) - 44,
        viewportBottom - Number(contentRect.top) - 38,
      ),
    );
    slot.style.top = `${cueTop}px`;
  }

  _scrollSettingsPanelToRemainingContent(panel, panels, viewport) {
    if (!panel || !viewport) return false;
    const panelIndex = panels.indexOf(panel);
    const nextToggle = panels[panelIndex + 1]?.querySelector?.(
      "[data-panel-toggle]",
    );
    const content = panel.querySelector?.(".setting-content");
    const targetRect =
      nextToggle?.getBoundingClientRect?.() ||
      content?.getBoundingClientRect?.();
    const viewportRect = viewport.getBoundingClientRect?.();
    if (!targetRect || !viewportRect) return false;

    const distance = Math.max(
      0,
      Math.ceil(Number(targetRect.bottom) - Number(viewportRect.bottom) + 8),
    );
    if (distance <= 0) return false;
    if (typeof viewport.scrollBy === "function") {
      viewport.scrollBy({ top: distance, behavior: "smooth" });
    } else {
      viewport.scrollTop += distance;
    }
    return true;
  }

  _wireSettingsPanels() {
    this._settingsPanelScrollCleanup?.();
    this._settingsPanelScrollCleanup = null;
    this._settingsPanelResizeObserver?.disconnect?.();
    this._settingsPanelResizeObserver = null;
    const panels = Array.from(this.querySelectorAll(".settings-panel"));
    if (!panels.length) return;

    let viewport =
      this._settingsPanelViewport?.isConnected !== false
        ? this._settingsPanelViewport || null
        : null;
    viewport ||= this._settingsPanelScrollContainer();
    if (viewport) this._settingsPanelViewport = viewport;
    let syncFrame = 0;
    let lastActivePanel = null;
    const syncMore = () => {
      const nextActivePanel =
        panels.find((panel) => panel.classList.contains("active")) || null;
      if (lastActivePanel && lastActivePanel !== nextActivePanel) {
        this._syncSettingsPanelMoreState(lastActivePanel, viewport);
      }
      lastActivePanel = nextActivePanel;
      if (nextActivePanel) {
        this._syncSettingsPanelMoreState(nextActivePanel, viewport);
      }
    };
    const scheduleMoreSync = () => {
      if (syncFrame) return;
      if (typeof globalThis.requestAnimationFrame === "function") {
        syncFrame = globalThis.requestAnimationFrame(() => {
          syncFrame = 0;
          syncMore();
        });
      } else {
        setTimeout(syncMore, 0);
      }
    };
    const bindViewport = (nextViewport) => {
      if (!nextViewport || nextViewport === viewport) return;
      viewport?.removeEventListener?.("scroll", scheduleMoreSync);
      viewport = nextViewport;
      this._settingsPanelViewport = nextViewport;
      viewport.addEventListener?.("scroll", scheduleMoreSync, {
        passive: true,
      });
      scheduleMoreSync();
    };

    viewport?.addEventListener?.("scroll", scheduleMoreSync, {
      passive: true,
    });
    globalThis.addEventListener?.("resize", scheduleMoreSync, {
      passive: true,
    });
    this._settingsPanelScrollCleanup = () => {
      viewport?.removeEventListener?.("scroll", scheduleMoreSync);
      globalThis.removeEventListener?.("resize", scheduleMoreSync);
      if (syncFrame) {
        globalThis.cancelAnimationFrame?.(syncFrame);
        syncFrame = 0;
      }
    };
    if (typeof globalThis.ResizeObserver === "function") {
      this._settingsPanelResizeObserver = new globalThis.ResizeObserver(
        scheduleMoreSync,
      );
      panels.forEach((panel) => {
        const content = panel.querySelector?.(".setting-content");
        if (content) this._settingsPanelResizeObserver.observe(content);
      });
    }

    const setActive = (nextActivePanel) => {
      this._activeSettingsPanelId = setSettingsPanelActiveState(
        panels,
        nextActivePanel,
      );
      scheduleMoreSync();
    };

    panels.forEach((panel) => {
      const content = panel.querySelector?.(".setting-content");
      panel
        .querySelector("[data-panel-toggle]")
        ?.addEventListener("click", (event) => {
          bindViewport(
            this._settingsPanelScrollContainer(event.composedPath?.()),
          );
          if (panel.classList.contains("active")) {
            setActive(null);
          } else {
            setActive(panel);
          }
        });
      content
        ?.querySelector?.("[data-panel-more]")
        ?.addEventListener?.("click", (event) => {
          event.preventDefault();
          event.stopPropagation();
          bindViewport(
            this._settingsPanelScrollContainer(event.composedPath?.()),
          );
          this._scrollSettingsPanelToRemainingContent(
            panel,
            panels,
            viewport,
          );
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
      this._syncConfigSaveReminder();
      this._emitPreviewDraft(null, {
        type: EDITOR_PREVIEW_ROUTE_INTENTS.commit,
      });
    };

    const finishSecondaryAction = (button) => {
      if (button?.classList?.contains?.("gui-mode-button")) return;
      this._hasConfigDraft = false;
      this._hasVisualDraft = false;
      this._syncConfigSaveReminder();
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
      "#display_version",
      "#event_days",
      "#alerts_reviews_days",
      "#realtime_poll_seconds",
      "#snapshot_update_seconds",
      "#slideshow_rotation_enabled",
      "#slideshow_rotation_seconds",
      "#slideshow_alert_hold_seconds",
      "#grid_mode_enabled",
      "#grid_live_view_enabled",
      "#grid_rotation_seconds",
      "#grid_alert_hold_seconds",
      "#mobile_view_page_enabled",
      "#mobile_view_rotate_to_fullscreen",
      "#mobile_view_dashboard_background",
      "#mobile_view_header_overlay",
      "#mobile_view_outer_border",
      "#mobile_view_ha_navbar_bottom",
      "#mobile_view_ha_navbar_stack_tabs",
      "#mobile_view_ha_navbar_dashboard",
      "#ha_dashboard_swipe_navigation_owner",
      "#ha_dashboard_swipe_navigation",
      '[name="ha_dashboard_swipe_pages"]',
      '[name="ha_dashboard_swipe_mobile_pages"]',
      "#ha_dashboard_swipe_include_other_cards",
      "[data-ha-dashboard-swipe-include-subviews]",
      "#ha_dashboard_swipe_mouse_enabled",
      "#preview_page_enabled",
      "#preview_page_live_cameras",
      "#preview_page_live_cameras_mobile",
      "#preview_page_alert_live_duration_seconds",
      "#preview_page_show_title_bars",
      "#single_view_alert_takeover",
      '[name="single_view_start_mode"]',
      "#wide_view_page_enabled",
      "#wide_view_live_cameras",
      "#wide_view_alert_takeover",
      '[name="wide_view_start_mode"]',
      "#wide_view_timeline_enabled",
      "#wide_view_timeline_default_open",
      "#wide_view_timeline_default_scale",
      "#card_view_page_enabled",
      "#card_view_alert_takeover",
      '[name="card_view_view_mode"]',
      '[name="card_view_start_mode"]',
      "#card_view_media_drawer_enabled",
      "#card_view_hide_camera_name",
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

    const textPreviewSelectors = ["#title", "#subtitle"];

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

    const schedulePreviewUpdate = () => {
      if (this._livePreviewRaf) return;
      this._livePreviewRaf = requestAnimationFrame(() => {
        this._livePreviewRaf = 0;
        const preview = this._pendingEditorPreviewUpdate === true;
        this._pendingEditorPreviewUpdate = false;
        this._u({ dispatch: false, preview });
      });
    };

    const handlePreviewUpdate = (event) => {
      if (!eventMatchesSelectors(event, configUpdateSelectors)) return;
      const isTextPreview = eventMatchesSelectors(
        event,
        textPreviewSelectors,
      );
      if (isTextPreview && event.type !== "change") {
        clearTimeout(this._textPreviewUpdateT);
        this._textPreviewUpdateT = setTimeout(() => {
          this._textPreviewUpdateT = null;
          this._pendingEditorPreviewUpdate = true;
          schedulePreviewUpdate();
        }, EDITOR_TEXT_PREVIEW_DELAY_MS);
        return;
      }
      if (isTextPreview && this._textPreviewUpdateT) {
        clearTimeout(this._textPreviewUpdateT);
        this._textPreviewUpdateT = null;
      }
      this._pendingEditorPreviewUpdate = true;
      schedulePreviewUpdate();
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

    const eventDaysValue =
      this.querySelector("#event_days")?.dataset.value ||
      this.querySelector("#event_days")?.value ||
      String(DEFAULT_EVENT_DAYS);
    const eventDays = Number(eventDaysValue);
    const eventDaysMessage =
      Number.isInteger(eventDays) && eventDays >= 1 && eventDays <= 15
        ? ""
        : "Select a value from 1 to 15.";
    this._setEditorFieldError("#event_days", eventDaysMessage);
    if (eventDaysMessage) valid = false;

    const alertsReviewsDaysValue =
      this.querySelector("#alerts_reviews_days")?.dataset.value ||
      this.querySelector("#alerts_reviews_days")?.value ||
      String(DEFAULT_ALERTS_REVIEWS_DAYS);
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
    const dashboardNavbarOwnership = this._dashboardNavbarOwnershipState();
    const dashboardNavbarMoveSwitchDisabled =
      dashboardNavbarOwnership.locked;
    const navbarOwnerPageName = String(
      dashboardNavbarOwnership.ownerPage || "",
    );
    const navbarOwnerPageMarkup = `<strong>Page: ${escapeHtml(navbarOwnerPageName)}</strong>`;
    const navbarDashboardNameMarkup = `<strong>${escapeHtml(
      `Dashboard: ${dashboardNavbarOwnership.dashboardName || "this dashboard"}`,
    )}</strong>`;
    const dashboardNavbarOwnerLocationMarkup =
      `${navbarOwnerPageMarkup} ${navbarDashboardNameMarkup}`;
    const dashboardNavbarOwnershipMessage = dashboardNavbarOwnership.locked
      ? dashboardNavbarOwnership.conflict
        ? `This card also claims Whole Dashboard in raw YAML, but the ${CARD_DISPLAY_NAME} at ${dashboardNavbarOwnerLocationMarkup} controls it. Turn off Whole Dashboard here or remove the duplicate YAML setting.`
        : `The ${CARD_DISPLAY_NAME} at ${dashboardNavbarOwnerLocationMarkup} controls Move HA Navbar to Bottom. Turn off Whole Dashboard there to change this setting.`
      : "";
    const dashboardNavbarOwnerMessage =
      dashboardNavbarOwnership.isOwner && dashboardNavbarOwnership.owner
      ? `This card controls Move HA Navbar to Bottom for the whole dashboard. ${dashboardNavbarOwnerLocationMarkup}`
      : "";
    const dashboardSwipeOwnership = this._dashboardSwipeOwnershipState();
    const dashboardSwipeMode = normalizeDashboardSwipeNavigationMode(
      this._config?.ha_dashboard_swipe_navigation,
    );
    const dashboardSwipeSettingsEnabled =
      dashboardSwipeOwnership.isOwner && dashboardSwipeOwnership.requested;
    const dashboardSwipeOwnerSwitchDisabled =
      dashboardSwipeOwnership.locked && !dashboardSwipeOwnership.requested;
    const ownerPageMarkup = `<strong>Page: ${escapeHtml(
      dashboardSwipeOwnership.ownerPage || "",
    )}</strong>`;
    const dashboardNameMarkup = `<strong>${escapeHtml(
      `Dashboard: ${dashboardSwipeOwnership.dashboardName || "this dashboard"}`,
    )}</strong>`;
    const dashboardSwipeOwnerLocationMarkup =
      `${ownerPageMarkup} ${dashboardNameMarkup}`;
    const dashboardSwipeOwnershipMessage = dashboardSwipeOwnership.locked
      ? dashboardSwipeOwnership.conflict
        ? `This card also claims swipe control in raw YAML, but the ${CARD_DISPLAY_NAME} at ${dashboardSwipeOwnerLocationMarkup} controls it. Turn off this switch here or remove the duplicate YAML setting.`
        : `The ${CARD_DISPLAY_NAME} at ${dashboardSwipeOwnerLocationMarkup} controls Swipe Navigation. Turn it off there before enabling it here.`
      : "";
    const dashboardSwipeOptions = [
      {
        value: DASHBOARD_SWIPE_NAVIGATION_MODES.dashboardWide,
        label: "Dashboard Wide",
        description:
          `Swipe between dashboard pages and selected ${CARD_NAME} pages.`,
      },
      {
        value: DASHBOARD_SWIPE_NAVIGATION_MODES.insideCard,
        label: "Inside Card Only",
        description:
          `Swipe between selected ${CARD_NAME} pages. Other cards can be included.`,
      },
      {
        value: DASHBOARD_SWIPE_NAVIGATION_MODES.landingDashboard,
        label: "Landing Page + Dashboard Pages",
        description:
          `Swipe between dashboard pages with the landing page as the only ${CARD_NAME} stop.`,
      },
      {
        value: DASHBOARD_SWIPE_NAVIGATION_MODES.none,
        label: "None",
        description:
          `Keep ownership but disable ${CARD_NAME} swipe navigation.`,
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
          ${isInsideCard ? `<label class="editor-swipe-choice-footer"><span>Include ${CARD_NAME} Cards on Other Dashboard Pages</span><ha-switch id="ha_dashboard_swipe_include_other_cards" ${this._config?.ha_dashboard_swipe_include_other_cards ? "checked" : ""} ${dashboardSwipeSettingsEnabled && selected ? "" : "disabled"}></ha-switch></label>` : ""}
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
    const enabledMobileSwipePages = new Set(
      getEnabledPageRoutes(this._config, DEVICE_ROUTE_BUCKETS.mobile),
    );
    const mobileSwipeLandingPage = resolveMobileSwipeLandingPage(this._config);
    const selectedDashboardSwipeMobilePages = new Set(
      resolveDashboardSwipeMobilePageSelection(this._config),
    );
    const dashboardSwipePageLabels = {
      [PAGE_IDS.preview]: "Preview",
      [PAGE_IDS.singleView]: "Single View",
      [PAGE_IDS.mobileView]: "Mobile View",
      [PAGE_IDS.wideView]: "Wide View",
      [PAGE_IDS.cardView]: "Card View",
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
    const dashboardSwipeMobilePageChoices =
      DASHBOARD_SWIPE_MOBILE_PAGE_OPTIONS.map((pageId) => {
        const isLandingPage = pageId === mobileSwipeLandingPage;
        const disabled =
          !dashboardSwipeSettingsEnabled ||
          !enabledMobileSwipePages.has(pageId) ||
          isLandingPage;
        return `<label class="editor-choice-chip">
          <input class="editor-choice-chip-input" type="checkbox" name="ha_dashboard_swipe_mobile_pages" value="${escapeHtmlAttribute(pageId)}" ${selectedDashboardSwipeMobilePages.has(pageId) ? "checked" : ""} ${isLandingPage ? 'data-dashboard-swipe-landing="true"' : ""} ${disabled ? "disabled" : ""}>
          <span class="editor-choice-chip-body">
            <span class="editor-choice-chip-indicator" aria-hidden="true"></span>
            <span class="editor-choice-chip-text">${escapeHtml(dashboardSwipePageLabels[pageId])}</span>
          </span>
        </label>`;
      }).join("");
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
    const pageStartModeControl = (name, selectedValue) =>
      buildPageStartModeControl({
        name,
        selectedValue,
        gridEnabled: this._config?.grid_mode_enabled === true,
        slideshowEnabled:
          this._config?.slideshow_rotation_enabled === true,
      });
    const singleViewStartModeControl = pageStartModeControl(
      "single_view_start_mode",
      this._config?.single_view_start_mode,
    );
    const wideViewStartModeControl = pageStartModeControl(
      "wide_view_start_mode",
      this._config?.wide_view_start_mode,
    );
    const cardViewStartModeControl = pageStartModeControl(
      "card_view_start_mode",
      this._config?.card_view_start_mode,
    );
    const cardViewViewMode = normalizeCardViewViewMode(
      this._config?.card_view_view_mode,
    );
    const cardViewViewModeControl = [
      { value: CARD_VIEW_VIEW_MODES.videoOnly, label: "Video Only" },
      {
        value: CARD_VIEW_VIEW_MODES.bottomPanelOpen,
        label: "Bottom Panel Open",
      },
      {
        value: CARD_VIEW_VIEW_MODES.bottomPanelClosed,
        label: "Bottom Panel Closed",
      },
    ]
      .map(
        ({ value, label }) => `<label class="theme-scope-opt card-view-start-opt">
          <input class="card-view-start-input" type="radio" name="card_view_view_mode" value="${value}" ${cardViewViewMode === value ? "checked" : ""}>
          <span>${label}</span>
        </label>`,
      )
      .join("");
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
      [MOBILE_PAGE_MODES.card]: "Card View",
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
                <button class="cam-action" type="button" title="Edit" aria-label="Edit" data-fvc-i18n-title="editor.actions.edit" data-fvc-i18n-aria-label="editor.actions.edit" data-edit-cam="${i}"><svg viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg"><path fill="currentColor" d="M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87M3,17.25V21H6.75L17.81,9.94L14.06,6.19L3,17.25Z" /></svg></button>
                <button class="cam-action" type="button" title="Delete" aria-label="Delete" data-fvc-i18n-title="editor.actions.delete" data-fvc-i18n-aria-label="editor.actions.delete" data-remove-cam="${i}"><svg viewBox="0 0 24 24" style="width:24px; height:24px" fill="currentColor"><path d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z" /></svg></button>
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
        <span class="field-label"><span data-fvc-i18n="editor.cameraPanel.cameras">Cameras</span> ${frigEntities.length ? '<small style="font-weight:400;color:var(--c-text2)" data-fvc-i18n="editor.cameraPanel.frigateCamerasDetected">(Frigate cameras detected)</small>' : ""}</span>
        <div class="cam-wrap" id="cam-list">${cameraRows}</div>
        ${canAddCamera ? '<div class="cam-toolbar"><button id="camera-add" class="cam-add" type="button" data-fvc-i18n="editor.actions.add">Add</button></div>' : ""}
        <span class="cam-helper" data-fvc-i18n="editor.cameraPanel.configuredCount" data-fvc-i18n-values="${escapeHtmlAttribute(JSON.stringify({ count: physicalCameraCount, max: MAX_CAMERAS }))}">${physicalCameraCount} of ${MAX_CAMERAS} cameras configured</span>
      </div>`;

    const titleValue = sanitizeDisplayText(
      this._config?.title || DEFAULT_TITLE,
    );
    const subtitleValue = sanitizeDisplayText(
      this._config?.subtitle || DEFAULT_SUBTITLE,
    );
    const generalPanelContent = `
      <div class="environment-version-summary">
        <div class="card-version-status" id="card-version-status" data-update-status="unavailable">
          <span class="environment-item-icon card-version-icon" aria-hidden="true">${ICONS.packageCheck}</span>
          <div class="card-version-copy">
            <strong>${CARD_DISPLAY_NAME}</strong>
            <span>Version v${escapeHtml(VERSION)} <span aria-hidden="true">•</span> <span id="card-version-update-status" role="status" aria-live="polite">Update status unavailable</span></span>
            <div class="environment-support-items">
              <div class="environment-support-item" data-home-assistant-version-notice data-support-status="unavailable" role="status" aria-live="polite" hidden>
                <span class="environment-item-icon" aria-hidden="true">${ICONS.homeAssistant}</span>
                <span data-environment-support-text></span>
              </div>
              <div class="environment-support-item" data-frigate-integration-status data-support-status="unavailable" role="status" aria-live="polite" hidden>
                <span class="environment-item-icon" aria-hidden="true">${ICONS.frigate}</span>
                <span data-environment-support-text></span>
              </div>
            </div>
          </div>
          <button class="card-version-update-link" id="card-version-update-link" type="button" hidden>Open update</button>
        </div>
      </div>
      <div class="text-display-field">
        <div class="text-display-row">
          <div class="limited-text-input">
            <ha-input label="Title" data-fvc-i18n-label="editor.title" name="title" id="title" type="text" maxlength="${DISPLAY_TEXT_MAX_LENGTH}" value="${escapeHtmlAttribute(titleValue)}" placeholder="${escapeHtmlAttribute(DEFAULT_TITLE)}"></ha-input>
            <span class="limited-text-counter" id="title-counter" aria-hidden="true">${titleValue.length}/${DISPLAY_TEXT_MAX_LENGTH}</span>
          </div>
          <label class="text-display-checkbox"><input id="display_title" type="checkbox" ${this._config?.display_title !== false ? "checked" : ""}> <span data-fvc-i18n="editor.display">Display</span></label>
        </div>
        <div class="field-helper text-display-token-helper">Use <code>{camera}</code> to show the active camera name. Grid mode shows <strong>Grid</strong>.</div>
      </div>
      <div class="text-display-field">
        <div class="text-display-row">
          <div class="limited-text-input">
            <ha-input label="Subtitle" data-fvc-i18n-label="editor.subtitle" name="subtitle" id="subtitle" type="text" maxlength="${DISPLAY_TEXT_MAX_LENGTH}" value="${escapeHtmlAttribute(subtitleValue)}" placeholder="${escapeHtmlAttribute(DEFAULT_SUBTITLE)}"></ha-input>
            <span class="limited-text-counter" id="subtitle-counter" aria-hidden="true">${subtitleValue.length}/${DISPLAY_TEXT_MAX_LENGTH}</span>
          </div>
          <label class="text-display-checkbox"><input id="display_subtitle" type="checkbox" ${this._config?.display_subtitle !== false ? "checked" : ""}> <span data-fvc-i18n="editor.display">Display</span></label>
        </div>
        <div class="field-helper text-display-token-helper">Use <code>{camera}</code> to show the active camera name. Grid mode shows <strong>Grid</strong>.</div>
      </div>
      <div class="section">
        <div class="layout-row" style="align-items:flex-start;gap:12px;flex-wrap:wrap;justify-content:flex-start">
          <div style="min-width:160px;display:flex;flex-direction:column;gap:6px">
            <span class="field-label" style="margin:0" data-fvc-i18n="editor.eventHistoryDays">Event History Days</span>
            <ha-selector id="event_days" style="width:160px"></ha-selector>
            <div class="field-helper" id="event_days-helper"></div>
          </div>
          <div style="min-width:160px;display:flex;flex-direction:column;gap:6px">
            <span class="field-label" style="margin:0" data-fvc-i18n="editor.alertReviewHistoryDays">Alert/Review History Days</span>
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
            <div class="field-helper">Adds ${EVENT_PRE_POST_ROLL_SECONDS} seconds before and after alert and clip playback or downloads. Requires Frigate recordings.</div>
          </div>
        </div>
        <div class="layout-row" style="align-items:flex-start;gap:12px;flex-wrap:wrap;justify-content:flex-start;margin-top:12px">
          <div style="display:flex;flex-direction:column;gap:6px;max-width:460px">
            <div class="layout-row" style="justify-content:flex-start;gap:8px">
              <span class="field-label" style="margin:0">Favorites from All Cameras</span>
              <ha-switch id="favorites_mixed_cameras" ${this._config?.favorites_mixed_cameras !== false ? "checked" : ""}></ha-switch>
            </div>
            <div class="field-helper">Shows favorites from all configured cameras. Turn off to show only the active camera.</div>
          </div>
        </div>
      </div>
      <div class="section">
        <div class="layout-row" style="align-items:flex-start;gap:12px;flex-wrap:wrap;justify-content:flex-start">
          <div class="editor-choice-field editor-choice-field--fit" id="realtime_poll_seconds" role="radiogroup" aria-label="Fallback Update Check">
            <div class="field-label">Fallback Update Check</div>
            ${buildEditorBubbleSelectorMarkup({
              name: "realtime_poll_seconds",
              options: durationEditorChoices(REALTIME_POLL_OPTIONS_SECONDS),
              selectedValue: realtimePollSeconds,
            })}
            <div class="field-helper">Fallback interval for checking new alerts and reviews. Shorter intervals use more battery and data.</div>
          </div>
        </div>
        <div class="layout-row" style="align-items:flex-start;gap:12px;flex-wrap:wrap;justify-content:flex-start;margin-top:12px">
          <div id="snapshot_update_row" style="min-width:210px;display:flex;flex-direction:column;gap:6px;width:100%">
            <div class="editor-choice-field" id="snapshot_update_seconds" role="radiogroup" aria-label="Snapshot Refresh">
              <div class="field-label">Snapshot Refresh</div>
              ${buildEditorBubbleSelectorMarkup({
                name: "snapshot_update_seconds",
                options: durationEditorChoices(
                  SNAPSHOT_UPDATE_OPTIONS_SECONDS,
                ),
                selectedValue: snapshotUpdateSeconds,
              })}
            </div>
            <div class="field-helper">How often snapshots refresh when Live View is off.</div>
          </div>
        </div>
        <div class="layout-row" style="align-items:flex-start;gap:12px;flex-wrap:wrap;justify-content:flex-start;margin-top:12px">
          <div id="preview_alert_live_duration_row" style="min-width:210px;display:flex;flex-direction:column;gap:6px;width:100%">
            <div class="editor-choice-field" id="preview_page_alert_live_duration_seconds" role="radiogroup" aria-label="Alert Live Duration">
              <div class="field-label">Alert Live Duration</div>
              ${buildEditorBubbleSelectorMarkup({
                name: "preview_page_alert_live_duration_seconds",
                options: durationEditorChoices(
                  PREVIEW_ALERT_LIVE_DURATION_OPTIONS_SECONDS,
                ),
                selectedValue: previewAlertLiveDurationSeconds,
              })}
            </div>
            <div class="field-helper">How long an alerted Preview or Wide View snapshot switches to live.</div>
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
        <div class="field-helper timezone-helper">Uses the timezone in your <a href="/profile/general" target="_blank" rel="noopener noreferrer">Home Assistant profile</a>.</div>
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
        <span class="field-label">Active Tabs</span>
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
          <div class="card-height-slider-control">
            <input name="stream_height" id="stream_height" type="range" min="${CARD_HEIGHT_MIN}" max="${CARD_HEIGHT_MAX}" step="1" value="${streamHeight}">
            <div class="field-helper card-height-value" id="stream_height-output">${streamHeight}${streamHeightUnit}</div>
          </div>
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
        <div class="field-helper">Card needs to be set to Auto Height for this to work properly.</div>
        <div class="field-helper" id="stream_height-helper"></div>
      </div>
      <div class="section">
        <div class="layout-row">
          <span class="field-label" style="margin:0">Tight Margins</span>
          <ha-switch id="tight_margins" ${this._config?.tight_margins ? "checked" : ""}></ha-switch>
        </div>
        <div class="field-helper">Removes padding in Sections views. In Bubble Card popups, keeps top padding and removes side and bottom spacing.</div>
      </div>
      <div class="section">
        <div class="layout-row">
          <span class="field-label" style="margin:0">Inside Shadows</span>
          <ha-switch id="shadows" ${this._config?.shadows !== false ? "checked" : ""}></ha-switch>
        </div>
        <div class="field-helper">Adds shadows to elements inside the card, including event items.</div>
      </div>
      <div class="section">
        <div class="layout-row">
          <span class="field-label" style="margin:0">Card Shadow</span>
          <ha-switch id="outer_shadows" ${this._config?.outer_shadows !== false ? "checked" : ""}></ha-switch>
        </div>
        <div class="field-helper">Adds a shadow around the card. Hidden automatically on phones in Preview, Wide View, and Mobile View.</div>
      </div>
      <div class="section">
        <div class="layout-row">
          <span class="field-label" style="margin:0">Event Item Borders</span>
          <ha-switch id="borders" ${this._config?.borders === true ? "checked" : ""}></ha-switch>
        </div>
        <div class="field-helper">Adds borders to event items. Useful when inside shadows are off.</div>
      </div>
      <div class="section">
        <div class="layout-row">
          <span class="field-label" style="margin:0">Rounded Corners</span>
          <ha-switch id="rounded_corners" ${this._config?.rounded_corners !== false ? "checked" : ""}></ha-switch>
        </div>
        <div class="field-helper">Rounds the card and media corners.</div>
      </div>
      <div class="section">
        <div class="layout-row">
          <span class="field-label" style="margin:0">Show ${CARD_NAME} Logo</span>
          <ha-switch id="display_logo" ${this._config?.display_logo !== false ? "checked" : ""}></ha-switch>
        </div>
        <div class="field-helper">Shows ${CARD_NAME} branding in page footers and the mobile Preview header when the HA navbar is at the bottom.</div>
      </div>
      <div class="section">
        <div class="layout-row">
          <span class="field-label" style="margin:0">Show Version Number</span>
          <ha-switch id="display_version" ${this._config?.display_version !== false ? "checked" : ""}></ha-switch>
        </div>
        <div class="field-helper">Shows the installed version in page footers. General Settings always shows it.</div>
      </div>`;
    const slideshowPanelContent = `
      <div class="section">
        <div class="layout-row" style="align-items:flex-start;gap:12px;flex-wrap:wrap;justify-content:flex-start">
          <div style="display:flex;flex-direction:column;gap:6px;max-width:420px">
            <div class="layout-row" style="justify-content:flex-start;gap:8px">
              <span class="field-label" style="margin:0">Enable Slideshow Mode</span>
              <ha-switch id="slideshow_rotation_enabled" ${this._config?.slideshow_rotation_enabled ? "checked" : ""}></ha-switch>
            </div>
            <div class="field-helper">Makes Slideshow available. Start or stop it with the Slideshow button.</div>
          </div>
          <div id="slideshow_rotation_row" style="display:${this._config?.slideshow_rotation_enabled ? "flex" : "none"};flex:1 1 100%;width:100%;flex-direction:column;gap:6px">
            <div class="editor-choice-field editor-choice-field--single-row" id="slideshow_rotation_seconds" role="radiogroup" aria-label="Camera Rotation Interval">
              <div class="field-label">Camera Rotation Interval</div>
              ${buildEditorBubbleSelectorMarkup({
                name: "slideshow_rotation_seconds",
                options: durationEditorChoices(
                  SLIDESHOW_ROTATION_OPTIONS_SECONDS,
                ),
                selectedValue: slideshowRotationSeconds,
              })}
            </div>
            <div class="field-helper">Time between cameras during Slideshow.</div>
          </div>
        </div>
        <div class="layout-row" style="align-items:flex-start;gap:12px;flex-wrap:wrap;justify-content:flex-start;margin-top:12px">
          <div id="slideshow_alert_hold_row" style="min-width:210px;display:flex;flex-direction:column;gap:6px;width:100%">
            <div class="editor-choice-field" id="slideshow_alert_hold_seconds" role="radiogroup" aria-label="Alert Hold Duration">
              <div class="field-label">Alert Hold Duration</div>
              ${buildEditorBubbleSelectorMarkup({
                name: "slideshow_alert_hold_seconds",
                options: durationEditorChoices(
                  SLIDESHOW_ALERT_HOLD_OPTIONS_SECONDS,
                ),
                selectedValue: slideshowAlertHoldSeconds,
              })}
            </div>
            <div class="field-helper">How long an alert-selected camera remains before rotation resumes.</div>
          </div>
        </div>
      </div>`;

    const previewPanelContent = `
      <div class="section">
        <div class="layout-row">
          <span class="field-label" style="margin:0">Enable Preview Page</span>
          <ha-switch id="preview_page_enabled" ${this._config?.preview_page_enabled ? "checked" : ""}></ha-switch>
        </div>
        <div class="field-helper">Adds Preview to navigation and landing-page options.</div>
      </div>
      <div class="section">
        <div class="layout-row">
          <span class="field-label" style="margin:0">Live Cameras on Desktop</span>
          <ha-switch id="preview_page_live_cameras" ${this._config?.preview_page_live_cameras ? "checked" : ""}></ha-switch>
        </div>
        <div class="field-helper">Keeps all Preview cameras live on desktops. Otherwise, qualifying alerts and reviews switch snapshots to live.</div>
      </div>
      <div class="section">
        <div class="layout-row">
          <span class="field-label" style="margin:0">Live Cameras on Mobile</span>
          <ha-switch id="preview_page_live_cameras_mobile" ${this._config?.preview_page_live_cameras_mobile ? "checked" : ""}></ha-switch>
        </div>
        <div class="field-helper">Keeps all Preview cameras live on phones and tablets. Otherwise, qualifying alerts and reviews switch snapshots to live.</div>
      </div>
      <div class="section">
        <div class="layout-row">
          <span class="field-label" style="margin:0">Show Title Bars</span>
          <ha-switch id="preview_page_show_title_bars" ${this._config?.preview_page_show_title_bars !== false ? "checked" : ""}></ha-switch>
        </div>
        <div class="field-helper">Shows each camera's name, source, alert count, and status.</div>
      </div>`;
    const gridAlertHoldSeconds = normalizeNumberChoice(
      this._config?.grid_alert_hold_seconds,
      GRID_ALERT_HOLD_OPTIONS_SECONDS,
      Math.round(GRID_ALERT_HOLD_MS / 1000),
    );
    const singleViewPanelContent = `
      <div class="section">
        <div class="layout-row">
          <span class="field-label" style="margin:0">Start with Alert Takeover</span>
          <ha-switch id="single_view_alert_takeover" ${this._config?.single_view_alert_takeover ? "checked" : ""}></ha-switch>
        </div>
        <div class="field-helper">Sets whether alert takeover is on when Single View opens.</div>
      </div>
      <div class="section">
        <div class="editor-choice-field" role="radiogroup" aria-label="Single View Start Mode">
          <div class="field-label">Start Mode</div>
          ${singleViewStartModeControl}
        </div>
        <div class="field-helper">Sets the opening mode. Enable Grid or Slideshow before selecting it.</div>
      </div>`;
    const wideViewPanelContent = `
      <div class="section">
        <div class="layout-row">
          <span class="field-label" style="margin:0">Enable Wide View Page</span>
          <ha-switch id="wide_view_page_enabled" ${this._config?.wide_view_page_enabled ? "checked" : ""}></ha-switch>
        </div>
        <div class="field-helper">Adds Wide View to navigation and desktop/tablet landing-page options.</div>
      </div>
      <div id="wide-view-page-options" style="display:${this._config?.wide_view_page_enabled ? "contents" : "none"}">
        <div class="section">
          <div class="editor-choice-field" role="radiogroup" aria-label="Wide View Start Mode">
            <div class="field-label">Start Mode</div>
            ${wideViewStartModeControl}
          </div>
          <div class="field-helper">Sets the opening mode. Enable Grid or Slideshow before selecting it.</div>
        </div>
        <div class="section">
          <div class="layout-row">
            <span class="field-label" style="margin:0">Live Companion Cameras</span>
            <ha-switch id="wide_view_live_cameras" ${this._config?.wide_view_live_cameras ? "checked" : ""}></ha-switch>
          </div>
          <div class="field-helper">Keeps all companion cameras live. Otherwise, qualifying alerts switch snapshots to live.</div>
        </div>
        <div class="section">
          <div class="layout-row">
            <span class="field-label" style="margin:0">Start with Alert Takeover</span>
            <ha-switch id="wide_view_alert_takeover" ${this._config?.wide_view_alert_takeover ? "checked" : ""}></ha-switch>
          </div>
          <div class="field-helper">Sets whether alert takeover is on when Wide View opens.</div>
        </div>
      </div>
      <div class="section" id="wide-timeline-enabled-row" style="${this._config?.wide_view_page_enabled ? "" : "display:none"}">
        <div class="layout-row">
          <span class="field-label" style="margin:0">Enable Timeline Panel</span>
          <ha-switch id="wide_view_timeline_enabled" ${this._config?.wide_view_timeline_enabled ? "checked" : ""}></ha-switch>
        </div>
        <div class="field-helper">Adds a collapsible timeline beside the event list. It follows the active camera, or all cameras in Grid mode.</div>
      </div>
      <div class="section timeline-dependent-section" id="wide-timeline-default-open-row" style="${this._config?.wide_view_page_enabled && this._config?.wide_view_timeline_enabled ? "" : "display:none"}">
        <div class="layout-row">
          <span class="field-label" style="margin:0">Open Timeline by Default</span>
          <ha-switch id="wide_view_timeline_default_open" ${this._config?.wide_view_timeline_default_open ? "checked" : ""}></ha-switch>
        </div>
        <div class="field-helper">Opens the Timeline with Wide View. Its drawer handle remains available when closed.</div>
      </div>
      <div class="section timeline-dependent-section" id="wide-timeline-default-scale-row" style="${this._config?.wide_view_page_enabled && this._config?.wide_view_timeline_enabled ? "" : "display:none"}">
        <div class="editor-choice-field" id="wide_view_timeline_default_scale" role="radiogroup" aria-label="Initial Timeline Range">
          <div class="field-label">Initial Timeline Range</div>
          ${buildEditorBubbleSelectorMarkup({
            name: "wide_view_timeline_default_scale",
            options: WIDE_TIMELINE_SCALE_OPTIONS_HOURS.map((value) => ({
              value,
              label: `${value} hour${value === 1 ? "" : "s"}`,
            })),
            selectedValue: timelineDefaultScale,
          })}
        </div>
        <div class="field-helper">Sets the initial time range. Change it later from the Timeline header.</div>
      </div>
      <div class="section" id="col-width-row" style="${this._config?.wide_view_page_enabled ? "" : "display:none"}">
        <span class="field-label">Left Column Width</span>
        <input id="col_left_width_pct" type="range" min="${WIDE_LEFT_WIDTH_MIN}" max="${WIDE_LEFT_WIDTH_MAX}" step="1" value="${wideLeftWidth}" style="width:100%">
        <div class="field-helper">Sets the width of Wide View's left column.</div>
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
        <div class="field-helper">Adds Mobile View to navigation and landing-page options on all devices.</div>
      </div>
      <div class="section">
        <div class="layout-row">
          <span class="field-label" style="margin:0">Rotate to Fullscreen</span>
          <ha-switch id="mobile_view_rotate_to_fullscreen" ${this._config?.mobile_view_rotate_to_fullscreen === true ? "checked" : ""}></ha-switch>
        </div>
        <div class="field-helper">On phones, landscape rotation expands live and popup media to fullscreen. Disabled while editing or previewing the card.</div>
      </div>
      <div class="section">
        <div class="layout-row">
          <span class="field-label" style="margin:0">Mobile Battery Saver</span>
          <ha-switch id="mobile_poll_battery_saver" ${this._config?.mobile_poll_battery_saver ? "checked" : ""}></ha-switch>
        </div>
        <div class="field-helper">Checks for new alerts and reviews every 60 seconds on mobile to reduce battery and data use.</div>
      </div>
      <div class="section">
        <div class="layout-row">
          <span class="field-label" style="margin:0">Move HA Navbar to Bottom</span>
          <ha-switch id="mobile_view_ha_navbar_bottom" ${this._config?.mobile_view_ha_navbar_bottom ? "checked" : ""} ${dashboardNavbarMoveSwitchDisabled ? "disabled" : ""}></ha-switch>
        </div>
        <div class="field-helper">Moves the Home Assistant dashboard navbar to the bottom on phones.</div>
        ${dashboardNavbarOwnershipMessage ? `<div class="field-helper navbar-owner-warning">${dashboardNavbarOwnershipMessage}</div>` : ""}
        ${dashboardNavbarOwnerMessage ? `<div class="field-helper navbar-owner-info">${dashboardNavbarOwnerMessage}</div>` : ""}
      </div>
      <div class="section ha-navbar-dependent-section" id="mobile-view-ha-navbar-stack-row" style="${this._config?.mobile_view_ha_navbar_bottom ? "" : "display:none"}">
        <div class="layout-row">
          <span class="field-label" style="margin:0">Stack Home Assistant Icon and Label</span>
          <ha-switch id="mobile_view_ha_navbar_stack_tabs" ${this._config?.mobile_view_ha_navbar_stack_tabs ? "checked" : ""}></ha-switch>
        </div>
        <div class="field-helper">For tabs showing an icon and title, centers a smaller title below the icon. Other tab styles are unchanged.</div>
      </div>
      <div class="section ha-navbar-dependent-section" id="mobile-view-ha-navbar-dashboard-row" style="${this._config?.mobile_view_ha_navbar_bottom ? "" : "display:none"}">
        <div class="layout-row">
          <span class="field-label" style="margin:0">Whole Dashboard</span>
          <ha-switch id="mobile_view_ha_navbar_dashboard" ${dashboardNavbarOwnership.requested ? "checked" : ""}></ha-switch>
        </div>
        <div class="field-helper">Off: applies while this card is mounted on its Home Assistant page. On: applies across the dashboard, including when a popup containing this card is closed.</div>
      </div>
      <div class="section" id="mobile-view-dashboard-background-row" style="${this._config?.mobile_view_page_enabled !== false ? "" : "display:none"}">
        <div class="layout-row">
          <span class="field-label" style="margin:0">Apply background to entire dashboard page</span>
          <ha-switch id="mobile_view_dashboard_background" ${this._config?.mobile_view_dashboard_background !== false ? "checked" : ""}></ha-switch>
        </div>
        <div class="field-helper">Uses the Mobile View background color for the surrounding Home Assistant page on mobile devices.</div>
      </div>
      <div class="section" id="mobile-view-header-overlay-row" style="${this._config?.mobile_view_page_enabled !== false ? "" : "display:none"}">
        <div class="layout-row">
          <span class="field-label" style="margin:0">Display Cam Picker/Header as an overlay</span>
          <ha-switch id="mobile_view_header_overlay" ${this._config?.mobile_view_header_overlay === true ? "checked" : ""}></ha-switch>
        </div>
        <div class="field-helper">Places the camera header over live video. Header controls fade with the video controls; LIVE remains visible.</div>
      </div>
      <div class="section" id="mobile-view-outer-border-row" style="${this._config?.mobile_view_page_enabled !== false ? "" : "display:none"}">
        <div class="layout-row">
          <span class="field-label" style="margin:0">Mobile View Outer Border</span>
          <ha-switch id="mobile_view_outer_border" ${this._config?.mobile_view_outer_border ? "checked" : ""}></ha-switch>
        </div>
        <div class="field-helper">Adds the theme-colored border around Mobile View on all devices.</div>
      </div>
      `;
    const swipeNavigationPanelContent = `
      <div class="section">
        <div class="layout-row">
          <span class="field-label" style="margin:0">Control Swipe Navigation</span>
          <ha-switch id="ha_dashboard_swipe_navigation_owner" ${dashboardSwipeOwnership.requested ? "checked" : ""} ${dashboardSwipeOwnerSwitchDisabled ? "disabled" : ""}></ha-switch>
        </div>
        <div class="field-helper">Only one ${CARD_DISPLAY_NAME} can control swipe navigation per dashboard.</div>
        ${dashboardSwipeOwnershipMessage ? `<div class="field-helper swipe-owner-warning">${dashboardSwipeOwnershipMessage}</div>` : ""}
      </div>
      <div class="section swipe-navigation-dependent-section" id="ha-dashboard-swipe-settings" style="${dashboardSwipeSettingsEnabled ? "" : "display:none"}">
        <div class="editor-choice-field" id="ha_dashboard_swipe_navigation" role="radiogroup" aria-label="Swipe Navigation">
          <div class="field-label">Swipe Navigation</div>
          <div class="editor-choice-chips editor-choice-chips--detailed editor-swipe-choice-grid">${dashboardSwipeChoices}</div>
        </div>
        <div id="ha-dashboard-swipe-page-selection" class="dashboard-swipe-page-selection" style="${dashboardSwipePageSelectionVisible ? "" : "display:none"}">
          <div class="editor-choice-field dashboard-swipe-device-group" role="group" aria-label="PC/Tablet Swipe Pages">
            <div class="field-label">PC/Tablet Swipe Pages</div>
            <div class="editor-choice-chips editor-choice-chips--checkbox dashboard-swipe-pages-grid">${dashboardSwipePageChoices}</div>
          </div>
          <div class="field-helper dashboard-swipe-landing-note">Only enabled pages are shown. The PC/tablet landing page is always included.</div>
          <div class="editor-choice-field dashboard-swipe-device-group" role="group" aria-label="Phone Swipe Pages">
            <div class="field-label">Phone Swipe Pages</div>
            <div class="editor-choice-chips editor-choice-chips--checkbox dashboard-swipe-pages-grid">${dashboardSwipeMobilePageChoices}</div>
          </div>
          <div class="field-helper dashboard-swipe-landing-note">Wide View is unavailable on phones. The phone landing page is always included.</div>
        </div>
        <div class="field-helper">On touch devices, edge swipes remain available for Home Assistant navigation.</div>
        <div class="layout-row swipe-mouse-navigation-row">
          <span class="field-label" style="margin:0">Mouse Swipe Navigation</span>
          <ha-switch id="ha_dashboard_swipe_mouse_enabled" ${this._config?.ha_dashboard_swipe_mouse_enabled ? "checked" : ""}></ha-switch>
        </div>
        <div class="field-helper">Enables the same navigation with a primary-button mouse drag.</div>
      </div>
      `;
    const cardViewPanelContent = `
      <div class="section">
        <div class="layout-row">
          <span class="field-label" style="margin:0">Enable Card View Page</span>
          <ha-switch id="card_view_page_enabled" ${this._config?.card_view_page_enabled ? "checked" : ""}></ha-switch>
        </div>
        <div class="field-helper">Adds a naturally sized live-camera page on any device. Card Height Limit does not apply.</div>
      </div>
      <div class="card-view-page-options" id="card-view-page-options" style="${this._config?.card_view_page_enabled ? "" : "display:none"}">
        <div class="section">
          <div class="editor-choice-field" role="radiogroup" aria-label="Card View Start Mode">
            <div class="field-label">Start Mode</div>
            ${cardViewStartModeControl}
          </div>
          <div class="field-helper">Sets the Video Only live mode. Enable Grid or Slideshow before selecting it.</div>
        </div>
        <div class="section">
          <div class="layout-row">
            <span class="field-label" style="margin:0">Standalone Card View</span>
            <ha-switch id="card_view_standalone" ${this._config?.card_view_standalone ? "checked" : ""}></ha-switch>
          </div>
          <div class="field-helper">Makes Card View the only ${CARD_NAME} page on all devices. Removes page links and the back button.</div>
        </div>
        <div class="section">
          <div class="layout-row">
            <span class="field-label" style="margin:0">Start with Alert Takeover</span>
            <ha-switch id="card_view_alert_takeover" ${this._config?.card_view_alert_takeover ? "checked" : ""}></ha-switch>
          </div>
          <div class="field-helper">Sets whether alert takeover is on when Card View opens.</div>
        </div>
        <div class="section">
          <div class="editor-choice-field" role="radiogroup" aria-label="View Mode">
            <div class="field-label">View Mode</div>
            <div class="theme-scope-seg card-view-start-seg card-view-mode-seg">${cardViewViewModeControl}</div>
          </div>
          <div class="field-helper">Starts with video only, or with the activity panel open or closed.</div>
        </div>
        <div class="card-view-video-only-options" id="card-view-video-only-options" style="${cardViewViewMode === CARD_VIEW_VIEW_MODES.videoOnly ? "" : "display:none"}">
          <div class="section">
            <div class="layout-row">
              <span class="field-label" style="margin:0">Enable Media Drawer</span>
              <ha-switch id="card_view_media_drawer_enabled" ${this._config?.card_view_media_drawer_enabled !== false ? "checked" : ""}></ha-switch>
            </div>
            <div class="field-helper">Shows a media drawer on the left in Video Only mode.</div>
          </div>
          <div class="section">
            <div class="layout-row">
              <span class="field-label" style="margin:0">Hide Camera Name</span>
              <ha-switch id="card_view_hide_camera_name" ${this._config?.card_view_hide_camera_name !== false ? "checked" : ""}></ha-switch>
            </div>
            <div class="field-helper">Hides the camera picker until the video is hovered or touched. Also applies in Grid mode.</div>
          </div>
        </div>
      </div>`;
    const landingPanelContent = `
      <div class="section">
        <span class="field-label">Landing Page</span>
        <ha-selector id="landing_page" style="width:220px"></ha-selector>
        <div class="field-helper">Selects the starting page for desktops and tablets.</div>
        ${this._config?.card_view_standalone ? '<div class="field-helper standalone-landing-note">Unavailable while Card View is standalone because all devices start in Card View.</div>' : ""}
      </div>
      <div class="section">
        <span class="field-label">Phone Landing Page</span>
        <ha-selector id="mobile_page" style="width:220px" ${this._config?.card_view_standalone ? "disabled" : ""}></ha-selector>
        <div class="field-helper">Sets the phone landing flow. Preview combinations open Preview first, then the selected camera in the paired view. Required pages must be enabled.</div>
        ${this._config?.card_view_standalone ? '<div class="field-helper standalone-landing-note">Unavailable while Card View is standalone because all devices start in Card View.</div>' : ""}
      </div>`;
    const gridviewPanelContent = `
      <div class="section">
        <div class="layout-row" style="align-items:flex-start;gap:12px;flex-wrap:wrap;justify-content:flex-start">
          <div style="display:flex;flex-direction:column;gap:6px;max-width:420px">
            <div class="layout-row" style="justify-content:flex-start;gap:8px">
              <span class="field-label" style="margin:0">Enable Grid Mode</span>
              <ha-switch id="grid_mode_enabled" ${this._config?.grid_mode_enabled ? "checked" : ""}></ha-switch>
            </div>
            <div class="field-helper">Adds a 2×2 grid for at least two cameras. Unavailable on mobile devices.</div>
          </div>
          <div id="grid_order_row" class="grid-order-config" style="display:${this._config?.grid_mode_enabled ? "flex" : "none"}">
            <span class="field-label" style="margin:0">Grid Order</span>
            <div class="theme-seg" role="radiogroup" aria-label="Grid order">
              <button type="button" class="theme-opt ${gridOrder.mode === GRID_ORDER_MODES.default ? "active" : ""}" data-grid-order-mode="default" role="radio" aria-checked="${gridOrder.mode === GRID_ORDER_MODES.default ? "true" : "false"}">Default</button>
              <button type="button" class="theme-opt ${gridOrder.mode === GRID_ORDER_MODES.custom ? "active" : ""}" data-grid-order-mode="custom" role="radio" aria-checked="${gridOrder.mode === GRID_ORDER_MODES.custom ? "true" : "false"}">Custom</button>
            </div>
            <div class="field-helper">Default follows Camera Settings. Custom reorders or excludes cameras only in Grid mode.</div>
            ${gridOrderCustomMarkup}
          </div>
          <div id="grid_live_row" style="min-width:210px;display:${this._config?.grid_mode_enabled ? "flex" : "none"};flex-direction:column;gap:6px">
            <div class="layout-row" style="justify-content:flex-start;gap:8px">
              <span class="field-label" style="margin:0">Live View in Grid</span>
              <ha-switch id="grid_live_view_enabled" ${this._config?.grid_live_view_enabled !== false ? "checked" : ""}></ha-switch>
            </div>
            <div class="field-helper">Keeps all visible cameras live. Otherwise, alerts temporarily switch snapshots to live.</div>
          </div>
          <div id="grid_rotation_row" style="display:${this._config?.grid_mode_enabled && gridVisibleCameraCount > 4 ? "flex" : "none"};flex:1 1 100%;width:100%;flex-direction:column;gap:6px">
            <div class="editor-choice-field editor-choice-field--single-row" id="grid_rotation_seconds" role="radiogroup" aria-label="Grid Rotation Interval">
              <div class="field-label">Grid Rotation Interval</div>
              ${buildEditorBubbleSelectorMarkup({
                name: "grid_rotation_seconds",
                options: durationEditorChoices(
                  GRID_ROTATION_OPTIONS_SECONDS,
                ),
                selectedValue: gridRotationSeconds,
              })}
            </div>
            <div class="field-helper">Time between camera sets when more than four cameras are included.</div>
          </div>
        </div>
        <div class="layout-row" style="align-items:flex-start;gap:12px;flex-wrap:wrap;justify-content:flex-start;margin-top:12px">
          <div id="grid_alert_hold_row" style="min-width:210px;display:flex;flex-direction:column;gap:6px;width:100%">
            <div class="editor-choice-field editor-choice-field--single-row" id="grid_alert_hold_seconds" role="radiogroup" aria-label="Grid Alert Hold Duration">
              <div class="field-label">Grid Alert Hold Duration</div>
              ${buildEditorBubbleSelectorMarkup({
                name: "grid_alert_hold_seconds",
                options: durationEditorChoices(
                  GRID_ALERT_HOLD_OPTIONS_SECONDS,
                ),
                selectedValue: gridAlertHoldSeconds,
              })}
            </div>
            <div class="field-helper">How long an alerted tile stays highlighted and, when needed, live.</div>
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
        ${this._renderSettingsPanel({ id: "gridview", title: "Grid Mode Settings", icon: "mdi:view-grid-outline", content: gridviewPanelContent, active: activeSettingsPanel === "gridview" })}
        ${this._renderSettingsPanel({ id: "preview", title: "Preview Page", icon: "mdi:view-grid", content: previewPanelContent, active: activeSettingsPanel === "preview" })}
        ${this._renderSettingsPanel({ id: "singleview", title: "Single View Page", icon: ICONS.singleView, content: singleViewPanelContent, active: activeSettingsPanel === "singleview" })}
        ${this._renderSettingsPanel({ id: "wideview", title: "Wide View Page", icon: "mdi:view-split-vertical", content: wideViewPanelContent, active: activeSettingsPanel === "wideview" })}
        ${this._renderSettingsPanel({ id: "cardview", title: "Card View Page", icon: ICONS.cardView, content: cardViewPanelContent, active: activeSettingsPanel === "cardview" })}
        ${this._renderSettingsPanel({ id: "mobileview", title: "Mobile View Page", icon: "mdi:cellphone", content: mobileViewPanelContent, active: activeSettingsPanel === "mobileview" })}
        ${this._renderSettingsPanel({ id: "swipenavigation", title: "Swipe Navigation", icon: "mdi:gesture-swipe-horizontal", content: swipeNavigationPanelContent, active: activeSettingsPanel === "swipenavigation" })}
        ${this._renderSettingsPanel({ id: "landing", title: "Landing Page", icon: "mdi:home-import-outline", content: landingPanelContent, active: activeSettingsPanel === "landing" })}
      </div>`;

    const configSaveReminderMarkup = `<div id="config-save-reminder" class="config-save-reminder" role="status" aria-live="polite" aria-atomic="true" data-config-save-state="${this._hasConfigDraft === true ? "dirty" : "clean"}">
      <span class="config-save-reminder-icon" aria-hidden="true">${ICONS.packageCheck}</span>
      <span data-config-save-reminder-text data-fvc-i18n="${this._hasConfigDraft === true ? "editor.status.unsavedChanges" : "editor.status.noPendingChanges"}">${this._hasConfigDraft === true ? "Unsaved changes — use Home Assistant's Save button to apply them." : "No pending changes."}</span>
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
            .config-save-reminder{position:sticky;top:8px;z-index:20;box-sizing:border-box;width:100%;min-height:30px;display:flex;align-items:center;justify-content:center;gap:6px;padding:5px 10px;border:1px solid color-mix(in srgb,var(--success-color,#2e7d32) 55%,transparent);border-radius:10px;background:color-mix(in srgb,var(--success-color,#2e7d32) 14%,transparent);-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px);color:var(--success-color,#2e7d32);font-size:12px;font-weight:600;line-height:1.2;text-align:center;pointer-events:none;}
            .config-save-reminder[data-config-save-state="dirty"]{border-color:color-mix(in srgb,var(--warning-color, var(--c-accent, var(--editor-primary))) 55%,transparent);background:color-mix(in srgb,var(--warning-color, var(--c-accent, var(--editor-primary))) 16%,transparent);color:var(--warning-color, var(--c-accent, var(--editor-primary)));}
            .standalone-landing-note{box-sizing:border-box;width:100%;margin-top:8px;padding:7px 10px;border:1px solid color-mix(in srgb,var(--c-primary, var(--editor-primary)) 42%,transparent);border-radius:10px;background:color-mix(in srgb,var(--c-primary-l, var(--editor-primary-l)) 42%,var(--editor-card-bg));color:var(--c-primary-d, var(--editor-text));font-weight:650;line-height:1.3;}
            .config-save-reminder-icon{display:inline-flex;width:17px;height:17px;flex:0 0 17px;}
            .config-save-reminder-icon svg{display:block;width:100%;height:100%;}
            .environment-version-summary{margin:12px 0;}
            .card-version-status{box-sizing:border-box;width:100%;display:flex;align-items:center;gap:9px;margin:0;padding:9px 11px;border-radius:10px;background:var(--c-primary-l, var(--editor-primary-l));color:var(--c-primary-d, var(--editor-text));font-size:12px;line-height:1.3;cursor:default;}
            .environment-item-icon{display:inline-flex;width:14px;height:14px;flex:0 0 14px;align-items:center;justify-content:center;}
            .environment-item-icon svg{display:block;width:100%;height:100%;}
            .card-version-icon{width:20px;height:20px;flex-basis:20px;align-self:flex-start;}
            .card-version-copy{display:flex;min-width:0;flex:1 1 auto;flex-direction:column;gap:1px;}
            .card-version-update-link{appearance:none;flex:0 0 auto;padding:2px 0;border:0;background:transparent;color:inherit;font:inherit;font-weight:700;text-decoration:underline;text-underline-offset:2px;cursor:pointer;}
            .card-version-update-link[hidden]{display:none;}
            .card-version-update-link:focus-visible{outline:2px solid currentColor;outline-offset:3px;border-radius:2px;}
            .environment-support-items{display:flex;flex-wrap:wrap;gap:4px 10px;margin-top:4px;}
            .environment-support-item{display:inline-flex;min-width:0;align-items:center;gap:4px;color:color-mix(in srgb,currentColor 76%,transparent);font-size:10px;font-weight:600;line-height:1.25;}
            .environment-support-item[data-support-status="warning"],.environment-support-item[data-support-status="error"]{padding:2px 6px;border:1px solid;border-radius:999px;}
            .environment-support-item[data-support-status="warning"]{border-color:color-mix(in srgb,var(--warning-color, #f59e0b) 58%,transparent);background:color-mix(in srgb,var(--warning-color, #f59e0b) 17%,transparent);color:color-mix(in srgb,var(--warning-color, #b86b00) 75%,var(--primary-text-color, #111));}
            .environment-support-item[data-support-status="error"]{border-color:color-mix(in srgb,var(--error-color, var(--c-alert, #d32f2f)) 65%,transparent);background:color-mix(in srgb,var(--error-color, var(--c-alert, #d32f2f)) 15%,transparent);color:var(--error-color, var(--c-alert, #b71c1c));}
            .environment-support-item[hidden]{display:none;}
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
                position:relative;
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
              .settings-more-slot{position:absolute;top:8px;right:14px;left:14px;z-index:3;display:flex;justify-content:center;height:0;pointer-events:none;}
              .settings-more-chip{appearance:none;-webkit-appearance:none;display:inline-flex;align-items:center;justify-content:center;gap:4px;min-width:72px;min-height:36px;padding:6px 12px;border:1px solid color-mix(in srgb,var(--c-border2, var(--editor-border)) 82%,transparent);border-radius:999px;background:color-mix(in srgb,var(--c-bg-main, var(--editor-card-bg)) 82%,transparent);box-shadow:0 4px 14px rgba(0,0,0,.22);-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px);color:var(--c-text, var(--editor-text));font:inherit;font-size:11px;font-weight:750;line-height:1;cursor:pointer;pointer-events:auto;transition:background-color .16s ease,border-color .16s ease,color .16s ease,box-shadow .16s ease,transform .1s ease;}
              .settings-more-chip[hidden]{display:none;}
              .settings-more-chip svg{width:17px;height:17px;fill:currentColor;}
              .settings-more-chip:focus-visible{border-color:var(--c-primary, var(--editor-primary));background:var(--c-primary-l, var(--editor-primary-l));color:var(--c-primary-d, var(--editor-primary-d));outline:none;box-shadow:0 5px 17px rgba(0,0,0,.28);}
              .settings-more-chip:active{transform:scale(.96);}
              @media (hover:hover) and (pointer:fine){.settings-more-chip:hover{border-color:var(--c-primary, var(--editor-primary));background:var(--c-primary-l, var(--editor-primary-l));color:var(--c-primary-d, var(--editor-primary-d));box-shadow:0 5px 17px rgba(0,0,0,.28);}}
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
            .editor-choice-field--single-row .editor-choice-chips{grid-template-columns:repeat(4,minmax(0,1fr));}
            .editor-choice-chips--compact{display:flex;width:auto;gap:6px;}
            .editor-choice-chips--detailed{grid-template-columns:repeat(auto-fit,minmax(160px,1fr));}
            .dashboard-swipe-page-selection{margin-top:16px;padding-top:14px;border-top:1px solid var(--c-border2, var(--editor-border));}
            .dashboard-swipe-device-group + .dashboard-swipe-device-group{margin-top:12px;}
            .dashboard-swipe-pages-grid{grid-template-columns:repeat(auto-fit,minmax(88px,1fr));align-items:stretch;gap:6px;}
            .dashboard-swipe-pages-grid > .editor-choice-chip{display:flex;}
            .dashboard-swipe-pages-grid .editor-choice-chip-body{flex:1 1 auto;min-height:40px;padding:6px;gap:5px;font-size:11px;line-height:1.15;}
            .dashboard-swipe-pages-grid .editor-choice-chip-indicator{width:15px;height:15px;}
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
            .swipe-owner-warning,.navbar-owner-warning{padding:8px 10px;border:1px solid color-mix(in srgb,var(--warning-color, #f59e0b) 70%,transparent);border-radius:8px;background:color-mix(in srgb,var(--warning-color, #f59e0b) 12%,transparent);color:color-mix(in srgb,var(--warning-color, #b86b00) 75%,var(--primary-text-color, #111));line-height:1.35;}
            .swipe-owner-warning strong,.navbar-owner-warning strong{display:inline-block;padding:1px 5px;border-radius:5px;background:color-mix(in srgb,var(--warning-color, #f59e0b) 20%,transparent);color:inherit;font-weight:800;}
            .navbar-owner-info{padding:8px 10px;border:1px solid var(--success-color, #2e7d32);border-radius:8px;background:color-mix(in srgb,var(--success-color, #2e7d32) 9%,transparent);color:var(--success-color, #2e7d32);line-height:1.35;}
            .navbar-owner-info strong{display:inline-block;padding:1px 5px;border-radius:5px;background:color-mix(in srgb,var(--success-color, #2e7d32) 16%,transparent);color:inherit;font-weight:800;}
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
            .card-height-control{display:flex;gap:8px;align-items:flex-start;min-width:0;}
            .card-height-slider-control{display:flex;flex:1 1 auto;min-width:120px;flex-direction:column;}
            .card-height-slider-control > #stream_height{width:100%;margin-top:7px;}
            .card-height-value{align-self:flex-start;margin-top:0;}
            .chk-row{display:flex;flex-wrap:wrap;gap:8px 16px;}
            .text-display-field + .text-display-field{margin-top:8px;}
            .text-display-row{display:flex;align-items:center;gap:12px;min-width:0;}
            .text-display-token-helper{margin:4px 0 0;}
            .text-display-field + .section{margin-top:12px;}
            .limited-text-input{position:relative;flex:1 1 auto;min-width:0;}
            .limited-text-input ha-input{display:block;width:100%;min-width:0;}
            .limited-text-counter{position:absolute;right:11px;top:50%;z-index:1;transform:translateY(-50%);padding-inline-start:6px;background:var(--c-bg-mobile, var(--editor-secondary-bg));color:var(--c-text2, var(--editor-muted));font-size:11px;font-variant-numeric:tabular-nums;line-height:1;pointer-events:none;}
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
            .card-view-start-seg{width:min(100%,280px);margin:0;padding:3px;gap:2px;}
            .card-view-mode-seg{width:min(100%,430px);}
            .editor-bubble-selector{width:min(100%,560px);grid-template-columns:repeat(var(--editor-bubble-option-count,3),minmax(0,1fr));}
            .editor-bubble-selector .card-view-start-opt{padding-inline:4px;white-space:nowrap;}
            .card-view-start-opt{position:relative;min-height:32px;padding:5px 9px;flex-direction:row;font-size:11px;}
            .card-view-start-input{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap;}
            .card-view-start-opt:has(.card-view-start-input:checked){background:var(--c-bg-primary, var(--editor-card-bg));color:var(--c-primary, var(--editor-primary));box-shadow:0 2px 8px rgba(0,0,0,.16),inset 0 0 0 1px color-mix(in srgb,var(--c-primary, var(--editor-primary)) 26%,transparent);}
            .card-view-start-opt:has(.card-view-start-input:disabled){opacity:.48;cursor:not-allowed;}
            .card-view-start-opt:has(.card-view-start-input:focus-visible){outline:2px solid var(--c-primary, var(--editor-primary));outline-offset:1px;}
            @media (hover:hover){.card-view-start-opt:not(:has(.card-view-start-input:checked)):not(:has(.card-view-start-input:disabled)):hover{background:color-mix(in srgb,var(--c-bg-primary, var(--editor-card-bg)) 66%,transparent);color:var(--c-text, var(--editor-text));}}
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
            .cam-modal{position:fixed;inset:0;box-sizing:border-box;padding:12px;background:rgba(0,0,0,.30);display:flex;align-items:flex-start;justify-content:center;overflow:auto;overscroll-behavior:contain;z-index:10000;}
            .cam-modal-card{flex:0 0 auto;width:min(640px,100%);margin:auto;overflow:visible;box-sizing:border-box;background:var(--editor-card-bg);color:var(--editor-text);border:var(--editor-border-width) solid var(--editor-border);border-radius:16px;padding:16px;box-shadow:var(--editor-shadow);}
            .cam-modal-card ha-input,
            .cam-modal-card ha-selector,
            .cam-modal-card ha-switch{--ha-card-background:var(--editor-card-bg);}
            .cam-modal-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;}
            .camera-modal-card .cam-modal-head{display:grid;grid-template-columns:auto minmax(0,1fr) auto;gap:12px;margin-bottom:10px;}
            .cam-modal-title{min-width:0;color:var(--primary-text-color);font-size:22px;font-weight:600;text-align:center;}
            .cam-modal-head-spacer{width:calc(24px + 1rem);height:calc(24px + 1rem);}
            .camera-modal-body{padding:0;border:1px solid var(--c-border2, var(--editor-border));border-radius:12px;overflow:hidden;}
            .camera-modal-accordion + .camera-modal-accordion{border-top:1px solid var(--c-border2, var(--editor-border));}
            .camera-modal-accordion-bar{box-sizing:border-box;width:100%;min-height:40px;display:flex;align-items:center;gap:10px;padding:9px 12px;border:0;background:var(--c-bg-mobile);color:var(--editor-text);font:inherit;font-size:13px;font-weight:700;line-height:1.2;text-align:left;}
            button.camera-modal-accordion-bar{cursor:pointer;appearance:none;}
            .camera-modal-accordion-title{flex:0 1 auto;min-width:0;}
            .camera-modal-accordion-summary{min-width:0;margin-inline-start:auto;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--c-text2, var(--editor-muted));font-size:12px;font-weight:500;}
            .camera-modal-accordion-summary[hidden]{display:none;}
            .camera-modal-accordion-icon{display:inline-flex;width:20px;height:20px;flex:0 0 20px;align-items:center;justify-content:center;color:var(--c-text2, var(--editor-muted));transition:transform .16s ease;}
            .camera-modal-accordion-icon svg{display:block;width:18px;height:18px;}
            .camera-modal-accordion.active .camera-modal-accordion-icon{transform:rotate(180deg);color:var(--c-primary, var(--editor-primary));}
            .camera-modal-accordion.active > .camera-modal-accordion-bar{color:var(--c-primary, var(--editor-primary));}
            .camera-modal-accordion-content{padding:10px 12px 12px;background:var(--editor-card-bg);}
            .camera-modal-accordion-content[hidden]{display:none;}
            .camera-modal-primary{padding-bottom:10px;border-bottom:1px solid var(--c-border2, var(--editor-border));}
            .camera-modal-selector-field{display:block;min-width:0;}
            .camera-modal-selector-field ha-selector{display:block;width:100%;min-width:0;}
            .camera-modal-selector-label{display:block;margin:0 0 4px 1px;color:var(--c-text2, var(--editor-muted));font-size:10px;font-weight:400;line-height:1.2;}
            .camera-modal-floating-field{position:relative;display:block;min-width:0;}
            .camera-modal-floating-field ha-selector{display:block;width:100%;min-width:0;}
            .camera-modal-floating-label{position:absolute;top:6px;left:12px;z-index:2;color:var(--c-text2, var(--editor-muted));font-size:10px;font-weight:400;line-height:1;pointer-events:none;}
            .camera-modal-accordion-content > .cam-modal-field:last-child{margin-bottom:0;}
            .camera-modal-accordion-content > .camera-group-add-row{padding-inline-start:0;}
            .camera-modal-accordion-content > .camera-group-help,
            .camera-modal-accordion-content > .camera-group-fields{margin-inline-start:0;}
            button.camera-modal-accordion-bar:focus-visible{outline:2px solid var(--c-primary, var(--editor-primary));outline-offset:-3px;}
            @media (hover:hover) and (pointer:fine){button.camera-modal-accordion-bar:hover{background:color-mix(in srgb,var(--c-bg-mobile) 78%,var(--c-primary, var(--editor-primary)));}}
            .cam-modal-toggle-row{align-items:center;justify-content:space-between;gap:14px;}
            .cam-modal-toggle-copy{min-width:0;}
            .cam-modal-toggle-copy .cam-modal-label{margin:0;}
            .cam-modal-toggle-copy .field-helper{margin-top:3px;line-height:1.4;}
            .cam-modal-toggle-row ha-switch{flex:0 0 auto;}
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
            .camera-modal-card .cam-modal-helper{margin-top:4px;}
            .cam-btn{min-height:38px;border:1px solid transparent;border-radius:999px;background:transparent;color:var(--editor-primary);font-weight:600;cursor:pointer;padding:8px 14px;transition:background .16s ease,color .16s ease,border-color .16s ease;}
            .cam-btn:hover,.cam-btn:focus-visible{background:var(--editor-primary-l);border-color:transparent;color:var(--editor-primary-d);outline:none;}
            .cam-btn.primary{background:var(--editor-primary);color:var(--text-primary-color);border-color:var(--editor-primary);padding:8px 18px;}
            .cam-btn.primary:hover,.cam-btn.primary:focus-visible{background:var(--editor-primary-d);border-color:var(--editor-primary-d);color:var(--text-primary-color);}
            .cam-btn.danger{background:var(--c-alert);color:var(--c-text-rev);border-color:var(--c-alert);padding:8px 18px;}
            .cam-btn.danger:hover{background:var(--c-alert);border-color:var(--c-alert);filter:brightness(.9);}
            .cam-modal-helper{font-size:11px;color:var(--error-color);min-height:16px;}
            .camera-capability-status{box-sizing:border-box;width:fit-content;max-width:100%;margin:5px 0 7px;padding:5px 9px;border:1px solid var(--c-border2);border-radius:10px;background:var(--editor-secondary-bg);color:var(--editor-muted);line-height:1.3;}
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
      ${configSaveReminderMarkup}
      ${settingsPanelsMarkup}

      <div id="camera-modal" class="cam-modal hidden">
        <div class="cam-modal-card camera-modal-card" role="dialog" aria-modal="true" aria-labelledby="camera-modal-title">
          <div class="cam-modal-head">
            <button type="button" id="camera-modal-close" class="round-btn" title="Close" aria-label="Close" data-fvc-i18n-title="editor.actions.close" data-fvc-i18n-aria-label="editor.actions.close">${ICONS.close}</button>
            <div class="cam-modal-title" id="camera-modal-title" data-fvc-i18n="editor.cameraModal.addCamera">Add Camera</div>
            <div class="cam-modal-head-spacer" aria-hidden="true"></div>
          </div>
          <div class="camera-modal-body">
          <section class="camera-modal-accordion camera-modal-accordion-fixed active">
            <div class="camera-modal-accordion-bar">
              <span class="camera-modal-accordion-title" data-fvc-i18n="editor.cameraModal.camera">Camera</span>
            </div>
            <div class="camera-modal-accordion-content">
              <div class="cam-modal-field camera-modal-primary">
                <div class="camera-modal-selector-field">
                  <span class="camera-modal-selector-label" aria-hidden="true" data-fvc-i18n="editor.cameraModal.camera">Camera</span>
                  <ha-selector id="camera-modal-entity" aria-label="Camera" data-fvc-i18n-aria-label="editor.cameraModal.camera"></ha-selector>
                </div>
              </div>
              <div class="cam-modal-field">
                <div class="limited-text-input">
                  <ha-input id="camera-modal-name" label="Camera Name" aria-label="Camera Name" data-fvc-i18n-label="editor.cameraModal.cameraName" data-fvc-i18n-aria-label="editor.cameraModal.cameraName" data-fvc-i18n-placeholder="editor.cameraModal.displayNamePlaceholder" maxlength="${DISPLAY_TEXT_MAX_LENGTH}" placeholder="Display name (optional)"></ha-input>
                  <span class="limited-text-counter" id="camera-modal-name-counter" aria-hidden="true">0/${DISPLAY_TEXT_MAX_LENGTH}</span>
                </div>
              </div>
            </div>
          </section>
          <section class="camera-modal-accordion" data-camera-modal-section="connection">
            <button type="button" class="camera-modal-accordion-bar" data-camera-modal-accordion-toggle="connection" aria-expanded="false" aria-controls="camera-modal-connection-content">
              <span class="camera-modal-accordion-title" data-fvc-i18n="editor.cameraModal.connectionSettings">Connection Settings</span>
              <span class="camera-modal-accordion-summary" id="camera-modal-connection-summary">Frigate go2rtc</span>
              <span class="camera-modal-accordion-icon" aria-hidden="true">${ICONS.chevron}</span>
            </button>
            <div class="camera-modal-accordion-content" id="camera-modal-connection-content" hidden>
              <div class="cam-modal-field">
                <div class="camera-modal-floating-field">
                  <span class="camera-modal-floating-label" aria-hidden="true" data-fvc-i18n="editor.cameraModal.connectionType">Connection Type</span>
                  <ha-selector id="camera-modal-connection-type" aria-label="Connection Type" data-fvc-i18n-aria-label="editor.cameraModal.connectionType"></ha-selector>
                </div>
                <div class="field-helper" data-fvc-i18n="editor.cameraModal.frigateIntegrationRequired">Requires the Home Assistant Frigate integration.</div>
              </div>
            </div>
          </section>
          <section class="camera-modal-accordion" data-camera-modal-section="additional">
            <button type="button" class="camera-modal-accordion-bar" data-camera-modal-accordion-toggle="additional" aria-expanded="false" aria-controls="camera-modal-additional-content">
              <span class="camera-modal-accordion-title" data-fvc-i18n="editor.cameraModal.additionalCamera">Additional Camera</span>
              <span class="camera-modal-accordion-summary" id="camera-modal-additional-summary">None configured</span>
              <span class="camera-modal-accordion-icon" aria-hidden="true">${ICONS.chevron}</span>
            </button>
            <div class="camera-modal-accordion-content" id="camera-modal-additional-content" hidden>
          <div class="cam-modal-field camera-group-add-row">
            <button type="button" id="camera-modal-add-secondary" class="cam-inline-add camera-group-action">${ICONS.cameraAdd}<span data-fvc-i18n="editor.cameraModal.addSecondCamera">Add second camera</span></button>
          </div>
          <details id="camera-modal-secondary-help" class="camera-group-help">
            <summary data-fvc-i18n="editor.cameraModal.secondCameraHelpTitle">What is a second camera?</summary>
            <div class="camera-group-help-copy" data-fvc-i18n="editor.cameraModal.secondCameraHelp">Combines two camera entities into one view, such as main and package cameras. Only the main camera provides PTZ or two-way talk.</div>
          </details>
          <div id="camera-modal-group-fields" class="camera-group-fields" hidden>
            <div class="camera-group-fields-head">
              <span class="camera-group-fields-title" data-fvc-i18n="editor.cameraModal.secondCamera">Second Camera</span>
            </div>
            <div class="camera-group-secondary-row">
              <div class="camera-group-selector">
                <ha-selector id="camera-modal-secondary-entity"></ha-selector>
              </div>
            </div>
            <div class="editor-choice-field camera-group-layout-field" role="radiogroup" aria-label="Live View Layout" data-fvc-i18n-aria-label="editor.cameraModal.liveViewLayout">
              <div class="cam-modal-label" data-fvc-i18n="editor.cameraModal.liveViewLayout">Live View Layout</div>
              ${buildEditorChoiceChipsMarkup({
                name: "camera-modal-group-layout",
                options: [
                  {
                    value: CAMERA_GROUP_LAYOUTS.sideBySide,
                    label: "Side by Side",
                    translationKey: "editor.cameraModal.sideBySide",
                  },
                  {
                    value: CAMERA_GROUP_LAYOUTS.stacked,
                    label: "Stacked",
                    translationKey: "editor.cameraModal.stacked",
                  },
                ],
                selectedValue: CAMERA_GROUP_LAYOUTS.sideBySide,
              })}
            </div>
            <div class="field-helper" data-fvc-i18n="editor.cameraModal.mainCameraControlsHelp">Only the main camera provides PTZ and two-way talk. Put the controllable camera first.</div>
            <div class="camera-group-fields-footer">
              <button type="button" id="camera-modal-remove-secondary" class="cam-inline-remove camera-group-action" data-fvc-i18n="editor.actions.cancel">Cancel</button>
            </div>
          </div>
            </div>
          </section>
          <section class="camera-modal-accordion" data-camera-modal-section="lights">
            <button type="button" class="camera-modal-accordion-bar" data-camera-modal-accordion-toggle="lights" aria-expanded="false" aria-controls="camera-modal-lights-content">
              <span class="camera-modal-accordion-title" data-fvc-i18n="editor.cameraModal.lights">Lights</span>
              <span class="camera-modal-accordion-summary" id="camera-modal-lights-summary">None configured</span>
              <span class="camera-modal-accordion-icon" aria-hidden="true">${ICONS.chevron}</span>
            </button>
            <div class="camera-modal-accordion-content" id="camera-modal-lights-content" hidden>
          <div class="cam-modal-field camera-group-add-row">
            <button type="button" id="camera-modal-add-light" class="cam-inline-add camera-group-action">${ICONS.lightAdd}<span data-fvc-i18n="editor.cameraModal.addLight">Add light</span></button>
          </div>
          <div id="camera-modal-light-fields" class="camera-group-fields" hidden>
            <div class="camera-group-fields-head">
              <span class="camera-group-fields-title" data-fvc-i18n="editor.cameraModal.linkedLight">Linked Light</span>
            </div>
            <div class="linked-entity-row">
              <div class="linked-entity-selectors">
                <div class="linked-entity-field">
                  <span class="cam-modal-label" data-fvc-i18n="editor.cameraModal.light">Light</span>
                  <ha-selector id="camera-modal-light-entity"></ha-selector>
                </div>
                <div class="linked-entity-field">
                  <span class="cam-modal-label" data-fvc-i18n="editor.cameraModal.icon">Icon</span>
                  <ha-selector id="camera-modal-light-icon"></ha-selector>
                </div>
              </div>
            </div>
            <div class="editor-choice-field camera-group-layout-field" role="radiogroup" aria-label="Button Position" data-fvc-i18n-aria-label="editor.cameraModal.buttonPosition">
              <div class="cam-modal-label" data-fvc-i18n="editor.cameraModal.buttonPosition">Button Position</div>
              ${buildEditorChoiceChipsMarkup({
                name: "camera-modal-light-position",
                options: [
                  { value: LINKED_LIGHT_POSITIONS.left, label: "Left", translationKey: "editor.cameraModal.left" },
                  { value: LINKED_LIGHT_POSITIONS.right, label: "Right", translationKey: "editor.cameraModal.right" },
                ],
                selectedValue: LINKED_LIGHT_POSITIONS.right,
              })}
            </div>
            <div class="field-helper" data-fvc-i18n="editor.cameraModal.lightHelp">Adds a Home Assistant light button beside the microphone. A light can be linked to multiple cameras.</div>
            <div class="camera-group-fields-footer">
              <button type="button" id="camera-modal-remove-light" class="cam-inline-remove camera-group-action" data-fvc-i18n="editor.actions.cancel">Cancel</button>
            </div>
          </div>
          <div class="cam-modal-field camera-group-add-row">
            <button type="button" id="camera-modal-add-light-2" class="cam-inline-add camera-group-action" hidden>${ICONS.lightAdd}<span data-fvc-i18n="editor.cameraModal.addSecondLight">Add second light</span></button>
          </div>
          <div id="camera-modal-light-fields-2" class="camera-group-fields" hidden>
            <div class="camera-group-fields-head">
              <span class="camera-group-fields-title" data-fvc-i18n="editor.cameraModal.secondLinkedLight">Second Linked Light</span>
            </div>
            <div class="linked-entity-row">
              <div class="linked-entity-selectors">
                <div class="linked-entity-field">
                  <span class="cam-modal-label" data-fvc-i18n="editor.cameraModal.light">Light</span>
                  <ha-selector id="camera-modal-light-entity-2"></ha-selector>
                </div>
                <div class="linked-entity-field">
                  <span class="cam-modal-label" data-fvc-i18n="editor.cameraModal.icon">Icon</span>
                  <ha-selector id="camera-modal-light-icon-2"></ha-selector>
                </div>
              </div>
            </div>
            <div class="editor-choice-field camera-group-layout-field" role="radiogroup" aria-label="Button Position" data-fvc-i18n-aria-label="editor.cameraModal.buttonPosition">
              <div class="cam-modal-label" data-fvc-i18n="editor.cameraModal.buttonPosition">Button Position</div>
              ${buildEditorChoiceChipsMarkup({
                name: "camera-modal-light-position-2",
                options: [
                  { value: LINKED_LIGHT_POSITIONS.left, label: "Left", translationKey: "editor.cameraModal.left" },
                  { value: LINKED_LIGHT_POSITIONS.right, label: "Right", translationKey: "editor.cameraModal.right" },
                ],
                selectedValue: LINKED_LIGHT_POSITIONS.right,
              })}
            </div>
            <div class="field-helper" data-fvc-i18n="editor.cameraModal.secondLightHelp">Places the second light independently on either side of the microphone.</div>
            <div class="camera-group-fields-footer">
              <button type="button" id="camera-modal-remove-light-2" class="cam-inline-remove camera-group-action" data-fvc-i18n="editor.actions.cancel">Cancel</button>
            </div>
          </div>
            </div>
          </section>
          <section class="camera-modal-accordion" data-camera-modal-section="options">
            <button type="button" class="camera-modal-accordion-bar" data-camera-modal-accordion-toggle="options" aria-expanded="false" aria-controls="camera-modal-options-content">
              <span class="camera-modal-accordion-title" data-fvc-i18n="editor.cameraModal.options">Options</span>
              <span class="camera-modal-accordion-summary" id="camera-modal-options-summary" hidden></span>
              <span class="camera-modal-accordion-icon" aria-hidden="true">${ICONS.chevron}</span>
            </button>
            <div class="camera-modal-accordion-content" id="camera-modal-options-content" hidden>
          <div class="cam-modal-field">
            <div class="layout-row cam-modal-toggle-row">
              <div class="cam-modal-toggle-copy">
                <span class="cam-modal-label" data-fvc-i18n="editor.cameraModal.showAllReviews">Show All Reviews in Alerts</span>
                <div class="field-helper" data-fvc-i18n="editor.cameraModal.showAllReviewsHelp">Frigate groups activity into reviews that may contain alerts, detections, or both. Enable this to show every review in the Alerts tab; disable it to show alerts only.</div>
              </div>
              <ha-switch id="camera-modal-all-reviews"></ha-switch>
            </div>
          </div>
          <div class="cam-modal-field">
            <div id="camera-modal-ptz-toggle-row">
              <div class="layout-row cam-modal-toggle-row">
                <div class="cam-modal-toggle-copy">
                  <span class="cam-modal-label" data-fvc-i18n="editor.cameraModal.enablePtz">Enable PTZ Controls</span>
                  <div class="field-helper" data-fvc-i18n="editor.cameraModal.ptzHelp">Adds pan and tilt controls when supported.</div>
                </div>
                <ha-switch id="camera-modal-ptz-enabled"></ha-switch>
              </div>
            <div id="camera-modal-ptz-rotation-row" hidden>
              <div class="editor-choice-field camera-group-layout-field" role="radiogroup" aria-label="PTZ Control Rotation" data-fvc-i18n-aria-label="editor.cameraModal.ptzRotation">
                <div class="cam-modal-label" data-fvc-i18n="editor.cameraModal.ptzRotation">PTZ Control Rotation</div>
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
              <div class="field-helper" data-fvc-i18n="editor.cameraModal.ptzRotationHelp">Rotates directional commands to match the camera image. At 90°, Up sends Left.</div>
            </div>
            </div>
            <div class="field-helper camera-capability-status" id="camera-modal-ptz-state" style="display:none"></div>
          </div>
          <div class="cam-modal-field" id="camera-modal-two-way-talk-toggle-row" style="display:none">
            <div class="layout-row" style="justify-content:flex-start;gap:8px">
              <span class="cam-modal-label" style="margin:0" data-fvc-i18n="editor.cameraModal.enableTwoWayTalk">Enable Two-Way Talk</span>
              <ha-switch id="camera-modal-two-way-talk-enabled"></ha-switch>
            </div>
            <div class="field-helper" data-fvc-i18n="editor.cameraModal.twoWayTalkHelp">Frigate requires a WebRTC backchannel. Home Assistant is experimental and requires HA WebRTC playback.</div>
          </div>
          <div class="field-helper camera-capability-status" id="camera-modal-two-way-talk-state" style="display:none"></div>
            </div>
          </section>
          </div>
          <div class="cam-modal-helper" id="camera-modal-helper"></div>
          <div class="cam-modal-foot">
            <button type="button" id="camera-modal-cancel" class="cam-btn" data-fvc-i18n="editor.actions.cancel">Cancel</button>
            <button type="button" id="camera-modal-save" class="cam-btn primary" data-fvc-i18n="editor.actions.add">Add</button>
          </div>
        </div>
      </div>

      <div id="camera-delete-modal" class="cam-modal hidden">
        <div class="cam-modal-card cam-confirm-card" role="alertdialog" aria-modal="true" aria-labelledby="camera-delete-title" aria-describedby="camera-delete-message">
          <h3 class="cam-confirm-title" id="camera-delete-title" data-fvc-i18n="editor.cameraModal.deleteCamera">Delete camera?</h3>
          <p class="cam-confirm-message" id="camera-delete-message"></p>
          <div class="cam-modal-foot">
            <button type="button" id="camera-delete-cancel" class="cam-btn" data-fvc-i18n="editor.actions.cancel">Cancel</button>
            <button type="button" id="camera-delete-confirm" class="cam-btn danger" data-fvc-i18n="editor.actions.delete">Delete</button>
          </div>
        </div>
      </div>

      <dialog id="standalone-landing-modal" class="cam-modal-card cam-confirm-card standalone-landing-dialog" aria-labelledby="standalone-landing-title" aria-describedby="standalone-landing-message">
          <h3 class="cam-confirm-title" id="standalone-landing-title" data-fvc-i18n="editor.cameraModal.chooseLandingPage">Choose a landing page</h3>
          <p class="cam-confirm-message" id="standalone-landing-message" data-fvc-i18n="editor.cameraModal.chooseLandingPageHelp">Card View will no longer be the standalone desktop and tablet view. Select the desktop and tablet landing page to use after standalone mode is disabled.</p>
          <div class="cam-modal-field" style="margin-top:12px">
            <span class="cam-modal-label" data-fvc-i18n="editor.cameraModal.landingPage">Landing Page</span>
            <ha-selector id="standalone-landing-page" style="width:100%"></ha-selector>
          </div>
          <div class="cam-modal-helper" id="standalone-landing-helper"></div>
          <div class="cam-modal-foot">
            <button type="button" id="standalone-landing-cancel" class="cam-btn" data-fvc-i18n="editor.actions.cancel">Cancel</button>
            <button type="button" id="standalone-landing-confirm" class="cam-btn primary" data-fvc-i18n="editor.actions.apply">Apply</button>
          </div>
      </dialog>
    </div>`;

    this._localization ??= createLocalizationController();
    applyLocalizedText(this, this._localization.t);

    const update = (previewRouteIntent = null) =>
      this._u({
        dispatch: false,
        preview: true,
        previewRouteIntent,
      });
    const updateVisual = () => update();
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
      element: this.querySelector("#event_days"),
      hass: this._hass,
      options: Array.from({ length: 15 }, (_, index) => {
        const value = String(index + 1);
        return { value, label: value };
      }),
      initialValue: String(this._config?.event_days ?? DEFAULT_EVENT_DAYS),
      fallbackValue: String(DEFAULT_EVENT_DAYS),
      normalize: (value) => String(value ?? DEFAULT_EVENT_DAYS),
      onChange: () => update(),
    });

    setupSelectSelector({
      element: this.querySelector("#alerts_reviews_days"),
      hass: this._hass,
      options: Array.from({ length: 15 }, (_, index) => {
        const value = String(index + 1);
        return { value, label: value };
      }),
      initialValue: String(
        this._config?.alerts_reviews_days ?? DEFAULT_ALERTS_REVIEWS_DAYS,
      ),
      fallbackValue: String(DEFAULT_ALERTS_REVIEWS_DAYS),
      normalize: (value) => String(value ?? DEFAULT_ALERTS_REVIEWS_DAYS),
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
    const mobilePageSelector = this.querySelector("#mobile_page");
    if (mobilePageSelector) {
      mobilePageSelector.disabled =
        this._config?.card_view_standalone === true;
    }

    setupEntitySelector({
      element: this.querySelector("#camera-modal-entity"),
      hass: this._hass,
      domain: "camera",
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
        { value: "frigate_go2rtc", label: this._t("editor.cameraModal.frigateGo2rtcDefault") },
        { value: "ha_direct", label: this._t("editor.cameraModal.homeAssistant") },
      ],
      initialValue: DEFAULT_CAMERA_CONNECTION_TYPE,
      fallbackValue: DEFAULT_CAMERA_CONNECTION_TYPE,
      normalize: (value) => normalizeCameraConnectionType(value),
      onChange: () => this._syncCameraModalAccordionSummaries(),
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
    bindEachClickHandler({
      root: this,
      selector: "[data-camera-modal-accordion-toggle]",
      handler: (event) => {
        this._toggleCameraModalAccordion(
          event.currentTarget.dataset.cameraModalAccordionToggle,
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
    ["value-changed", "change"].forEach((eventName) => {
      this.querySelector("#camera-modal-two-way-talk-enabled")?.addEventListener(
        eventName,
        () => this._syncCameraModalAccordionSummaries(),
      );
    });
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
    this._wireLimitedTextField("#title", "#title-counter");
    this._wireLimitedTextField("#subtitle", "#subtitle-counter");
    this._wireLimitedTextField(
      "#camera-modal-name",
      "#camera-modal-name-counter",
    );
    this._wireLivePreviewUpdates();
    this._wireStandaloneLandingPageTransition(scheduleUpdate);
    this.querySelector("#card-version-update-link")?.addEventListener(
      "click",
      (event) =>
        this._openCardUpdateDialog(event.currentTarget?.dataset?.entityId),
    );
    this._syncCardVersionStatus();
    this._syncEnvironmentSupportNotices();

    this.querySelector("#mobile_view_ha_navbar_dashboard")
      ?.addEventListener("change", () => {
        update();
        this._render();
      });
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
      ids: ["stream_height", "col_left_width_pct"],
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
        "display_version",
        "single_view_alert_takeover",
        "wide_view_page_enabled",
        "wide_view_live_cameras",
        "wide_view_alert_takeover",
        "wide_view_timeline_enabled",
        "wide_view_timeline_default_open",
        "card_view_page_enabled",
        "card_view_alert_takeover",
        "card_view_media_drawer_enabled",
        "card_view_hide_camera_name",
        "mobile_view_page_enabled",
        "mobile_view_rotate_to_fullscreen",
        "mobile_view_dashboard_background",
        "mobile_view_header_overlay",
        "mobile_view_outer_border",
        "mobile_view_ha_navbar_bottom",
        "mobile_view_ha_navbar_stack_tabs",
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
      handler: (event) => {
        const slideshowRow = this.querySelector("#slideshow_rotation_row");
        const enabled =
          this.querySelector("#slideshow_rotation_enabled")?.checked === true;
        const gridRow = this.querySelector("#grid_rotation_row");
        const gridLiveRow = this.querySelector("#grid_live_row");
        const gridOrderRow = this.querySelector("#grid_order_row");
        const gridEnabled =
          this.querySelector("#grid_mode_enabled")?.checked === true;
        const cardViewPageOptions = this.querySelector(
          "#card-view-page-options",
        );
        if (cardViewPageOptions) {
          cardViewPageOptions.style.display = resolveSwitchChecked(
            this.querySelector("#card_view_page_enabled"),
          )
            ? ""
            : "none";
        }
        const syncPageStartOption = (mode, available) => {
          this.querySelectorAll(
            `[name$="_view_start_mode"][value="${mode}"]`,
          ).forEach((input) => {
            input.disabled = !available;
            const label = input.closest("label");
            if (!label) return;
            const guidance = String(
              label.dataset.disabledGuidance || "",
            ).trim();
            if (!available && guidance) {
              label.title = guidance;
              input.setAttribute(
                "aria-label",
                `${input.nextElementSibling?.textContent || mode}. ${guidance}`,
              );
              return;
            }
            label.removeAttribute("title");
            input.setAttribute(
              "aria-label",
              input.nextElementSibling?.textContent || mode,
            );
          });
        };
        syncPageStartOption("slideshow", enabled);
        syncPageStartOption("grid", gridEnabled);
        if (slideshowRow)
          slideshowRow.style.display = enabled ? "flex" : "none";
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

    const cardViewVideoOnlyOptions = this.querySelector(
      "#card-view-video-only-options",
    );
    const cardViewViewModeInputs = Array.from(
      this.querySelectorAll('[name="card_view_view_mode"]'),
    );
    if (cardViewVideoOnlyOptions && cardViewViewModeInputs.length) {
      const syncCardViewVideoOnlyOptions = () => {
        const selectedMode = this.querySelector(
          '[name="card_view_view_mode"]:checked',
        )?.value;
        cardViewVideoOnlyOptions.style.display =
          selectedMode === CARD_VIEW_VIEW_MODES.videoOnly ? "" : "none";
      };
      cardViewViewModeInputs.forEach((input) => {
        input.addEventListener("change", syncCardViewVideoOnlyOptions);
      });
      syncCardViewVideoOnlyOptions();
    }

    const wideCb = this.querySelector("#wide_view_page_enabled");
    const widePageOptions = this.querySelector("#wide-view-page-options");
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
        if (widePageOptions) {
          widePageOptions.style.display = wideCb.checked ? "contents" : "none";
        }
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

    const mobileViewEnabled = this.querySelector(
      "#mobile_view_page_enabled",
    );
    const mobileViewPresentationRows = [
      "#mobile-view-dashboard-background-row",
      "#mobile-view-header-overlay-row",
      "#mobile-view-outer-border-row",
    ].map((selector) => this.querySelector(selector)).filter(Boolean);
    if (mobileViewEnabled && mobileViewPresentationRows.length) {
      const syncMobileViewPresentationRows = () => {
        for (const row of mobileViewPresentationRows) {
          row.style.display = mobileViewEnabled.checked ? "" : "none";
        }
      };
      mobileViewEnabled.addEventListener(
        "change",
        syncMobileViewPresentationRows,
      );
      mobileViewEnabled.addEventListener(
        "value-changed",
        syncMobileViewPresentationRows,
      );
      syncMobileViewPresentationRows();
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
    this._publishPreviewDraft();
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

  _publishPreviewDraft(routeIntent = null) {
    this._hasVisualDraft = true;
    this._emitPreviewDraft(
      createEditorPreviewDraft(this._config),
      routeIntent,
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
    this._syncConfigSaveReminder();
    this._pendingHaDirtyConfig = nextConfig;
    this._seedHomeAssistantDirtyState();

    if (!this._haDirtyStateContext) {
      const dialog = this._findHomeAssistantEditCardDialog();
      if (typeof dialog?._updateDirtyState === "function") {
        dialog._updateDirtyState(nextConfig);
      } else {
        // HA versions before the dirty-state provider still rely on the
        // documented config-changed event to enable Save.
        this._dispatch(nextConfig);
      }
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
    if (preview && (configChanged || previewRouteIntent)) {
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
