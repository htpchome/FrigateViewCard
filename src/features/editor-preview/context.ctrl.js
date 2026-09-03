import {
  buildCardPickerDemoAlertsMarkup,
  buildCardPickerDemoLiveMarkup,
} from "./card-picker-demo.tmpl.js";
import { normalizePageRoute, PAGE_IDS } from "../navigation/router.js";

export const EDITOR_PREVIEW_ROUTE_INTENTS = Object.freeze({
  enterStandalone: "enter-card-view-standalone",
  revertStandaloneDraft: "revert-card-view-standalone-draft",
  navigate: "navigate",
  commit: "commit",
  reset: "reset",
});

const previewValueSignature = (value) => {
  if (value && typeof value === "object") return JSON.stringify(value);
  return value;
};

const previewKeysChanged = (previousConfig, nextConfig, ...keys) =>
  keys.some(
    (key) =>
      previewValueSignature(previousConfig?.[key]) !==
      previewValueSignature(nextConfig?.[key]),
  );

export class EditorPreviewContextController {
  constructor(host) {
    this._host = host;
    this._watchdogTimer = null;
    this._dialogObserver = null;
    this._dialogOpenLast = false;
    this._dashboardEditLast = false;
    this._lastEditorPreviewContext = null;
    this._cardPickerDemoEngine = null;
    this._cardPickerDemoList = null;
    this._standaloneDraftReturnPageId = null;
  }

  dispose() {
    if (this._watchdogTimer) clearInterval(this._watchdogTimer);
    this._watchdogTimer = null;
    if (this._dialogObserver) this._dialogObserver.disconnect();
    this._dialogObserver = null;
    this._host.classList?.remove?.("card-picker-demo-host");
    this._host.shadowRoot
      ?.querySelector?.("#card")
      ?.classList?.remove?.("card-picker-demo");
    this._cardPickerDemoEngine = null;
    this._cardPickerDemoList = null;
    this._standaloneDraftReturnPageId = null;
  }

  applyRouteIntent(routeIntent = null) {
    const type = String(routeIntent?.type || "");
    let targetPageId = "";

    if (
      type === EDITOR_PREVIEW_ROUTE_INTENTS.enterStandalone ||
      type === EDITOR_PREVIEW_ROUTE_INTENTS.navigate
    ) {
      if (!this._standaloneDraftReturnPageId) {
        this._standaloneDraftReturnPageId = normalizePageRoute(
          this._host._pageId,
        );
      }
      targetPageId =
        type === EDITOR_PREVIEW_ROUTE_INTENTS.enterStandalone
          ? PAGE_IDS.cardView
          : normalizePageRoute(routeIntent?.pageId);
    } else if (
      type === EDITOR_PREVIEW_ROUTE_INTENTS.revertStandaloneDraft ||
      type === EDITOR_PREVIEW_ROUTE_INTENTS.reset
    ) {
      targetPageId = this._standaloneDraftReturnPageId || "";
      this._standaloneDraftReturnPageId = null;
    } else if (type === EDITOR_PREVIEW_ROUTE_INTENTS.commit) {
      this._standaloneDraftReturnPageId = null;
    }

    if (!targetPageId) return null;
    return (
      this._host._pageNavigationController?.navigateToPageRoute?.(
        targetPageId,
        { source: "editor-preview-route-intent" },
      ) ?? null
    );
  }

  applyConfigDraft({ previousConfig = {}, nextConfig = {} } = {}) {
    this._host._haNavbarController?.sync?.();
    this._host._haDashboardSwipeNavigationController?.sync?.();
    this._host._syncVisualStyleToggles?.();
    this._host._haPageBackgroundController?.sync?.();
    this._host._previewPageController?.syncBottomNavbarPreviewChrome?.();
    this._host._browseOpen = nextConfig.browse_expanded;

    const pageNavigation = this._host._pageNavigationController;
    const activePageAvailable =
      pageNavigation?.isPageRouteAvailable?.(this._host._pageId) !== false;
    if (!activePageAvailable) {
      void pageNavigation?.navigateToPageRoute?.(PAGE_IDS.singleView, {
        source: "editor-preview-page-disabled",
      });
      return "navigated";
    }

    const camerasChanged = previewKeysChanged(
      previousConfig,
      nextConfig,
      "cameras",
    );
    if (camerasChanged) {
      this._host._activeCamIdx = Math.min(
        Number(this._host._activeCamIdx) || 0,
        Math.max(0, (nextConfig.cameras?.length || 1) - 1),
      );
    }

    const wideCompanionChanged = previewKeysChanged(
      previousConfig,
      nextConfig,
      "wide_view_live_cameras",
      "wide_view_alert_takeover",
    );
    if (wideCompanionChanged) {
      this._host._wideViewPageController?.applyCompanionConfigUpdate?.({
        takeoverDefaultChanged: previewKeysChanged(
          previousConfig,
          nextConfig,
          "wide_view_alert_takeover",
        ),
      });
    }

    const timelineEnabledChanged = previewKeysChanged(
      previousConfig,
      nextConfig,
      "wide_view_timeline_enabled",
    );
    const timelineDefaultOpenChanged = previewKeysChanged(
      previousConfig,
      nextConfig,
      "wide_view_timeline_default_open",
    );
    const timelineDefaultScaleChanged = previewKeysChanged(
      previousConfig,
      nextConfig,
      "wide_view_timeline_default_scale",
    );
    if (
      timelineEnabledChanged ||
      timelineDefaultOpenChanged ||
      timelineDefaultScaleChanged
    ) {
      this._host._wideViewPageController?.applyTimelineConfigUpdate?.({
        enabledChanged: timelineEnabledChanged,
        defaultOpenChanged: timelineDefaultOpenChanged,
        defaultScaleChanged: timelineDefaultScaleChanged,
      });
    }

    const cardTakeoverChanged = previewKeysChanged(
      previousConfig,
      nextConfig,
      "card_view_alert_takeover",
    );
    const cardDrawerChanged = previewKeysChanged(
      previousConfig,
      nextConfig,
      "card_view_drawer_default_open",
    );
    if (cardTakeoverChanged || cardDrawerChanged) {
      this._host._cardViewPageController?.applyConfigUpdate?.({
        takeoverDefaultChanged: cardTakeoverChanged,
        drawerDefaultChanged: cardDrawerChanged,
      });
    }

    this._host._singleViewPageController?.applyEditorPreviewDraftRefresh?.({
      renderList: false,
    });
    this._host._syncToolbarButtons?.();

    const gridPresentationChanged = previewKeysChanged(
      previousConfig,
      nextConfig,
      "cameras",
      "grid_order",
      "grid_live_view_enabled",
    );
    if (gridPresentationChanged && this._host._viewMode === "grid") {
      this._host._scheduleGridRefresh?.(0);
    }
    if (
      previewKeysChanged(
        previousConfig,
        nextConfig,
        "snapshot_update_seconds",
      )
    ) {
      this._host._syncSnapshotRefreshTimer?.();
    }
    return "synced";
  }

  syncHassPreviewContext() {
    const inEditorPreview = this.isEditorPreviewContext();
    if (this._lastEditorPreviewContext === true && !inEditorPreview) {
      this._host._scheduleResumeLive("hass-edit-exit");
    }
    this._lastEditorPreviewContext = inEditorPreview;
    return inEditorPreview;
  }

  startEditModeWatchdog() {
    if (this._watchdogTimer) clearInterval(this._watchdogTimer);
    this._lastEditorPreviewContext = this.isEditorPreviewContext();
    this._dialogOpenLast = this.isCardEditorDialogOpen();
    this._dashboardEditLast = this.isDashboardEditMode();
    this._watchdogTimer = setInterval(() => {
      if (!this._host.isConnected) return;
      const inEditorPreview = this.isEditorPreviewContext();
      const dialogOpen = this.isCardEditorDialogOpen();
      const dashboardEdit = this.isDashboardEditMode();
      if (this._dialogOpenLast && !dialogOpen) {
        this._host._scheduleResumeLive("watchdog-dialog-close");
      }
      if (this._lastEditorPreviewContext === true && !inEditorPreview) {
        this._host._scheduleResumeLive("watchdog-edit-exit");
      }
      if (this._dashboardEditLast !== dashboardEdit) {
        this._host._scheduleResumeLive(
          dashboardEdit
            ? "watchdog-dashboard-edit-on"
            : "watchdog-dashboard-edit-off",
        );
      }
      if (dashboardEdit) {
        this._host._kickLiveIfStale(true);
      }
      this._dialogOpenLast = dialogOpen;
      this._dashboardEditLast = dashboardEdit;
      this._lastEditorPreviewContext = inEditorPreview;
    }, 600);
  }

  isDashboardEditMode() {
    try {
      const href = String(window.location?.href || "");
      if (!href) return false;
      const url = new URL(href, window.location.origin);
      const edit =
        url.searchParams.get("edit") ||
        url.searchParams.get("dashboard_edit") ||
        "";
      return /^(1|true|yes|on)$/i.test(String(edit));
    } catch (_) {
      return false;
    }
  }

  isCardEditorDialogOpen() {
    const dialogHost = document.querySelector("hui-dialog-edit-card");
    if (!dialogHost) return false;
    const root = dialogHost.shadowRoot;
    const haDialog =
      root?.querySelector?.("ha-dialog") ||
      dialogHost.querySelector?.("ha-dialog") ||
      null;
    if (haDialog) {
      if (haDialog.opened === true) return true;
      if (haDialog.hasAttribute?.("open")) return true;
      if (haDialog.hasAttribute?.("opened")) return true;
      if (haDialog.getAttribute?.("aria-hidden") === "false") return true;
      if (haDialog.getAttribute?.("aria-hidden") === "true") return false;
      if (haDialog.hidden === true) return false;
      const dialogStyle = window.getComputedStyle?.(haDialog);
      if (
        dialogStyle?.display === "none" ||
        dialogStyle?.visibility === "hidden"
      ) {
        return false;
      }
      return true;
    }
    const hostStyle = window.getComputedStyle?.(dialogHost);
    if (hostStyle?.display === "none" || hostStyle?.visibility === "hidden") {
      return false;
    }
    if (dialogHost.hidden === true) return false;
    if (dialogHost.getAttribute?.("aria-hidden") === "true") return false;
    return true;
  }

  startEditorDialogCloseObserver() {
    if (this._dialogObserver) this._dialogObserver.disconnect();
    this._dialogObserver = null;
    this._dialogOpenLast = this.isCardEditorDialogOpen();
    if (!("MutationObserver" in window) || !document.body) return;
    this._dialogObserver = new MutationObserver(() => {
      const openNow = this.isCardEditorDialogOpen();
      if (this._dialogOpenLast && !openNow) {
        this._host._scheduleResumeLive("card-editor-close");
      }
      this._dialogOpenLast = openNow;
    });
    this._dialogObserver.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["open", "opened", "hidden", "class", "style"],
    });
  }

  isEditorPreviewContext() {
    let el = this._host;
    let depth = 0;
    while (el && depth < 48) {
      const tag = String(el.tagName || "").toUpperCase();
      if (tag === "HUI-CARD-PREVIEW" || tag === "HUI-DIALOG-EDIT-CARD") {
        return true;
      }
      const root = el.getRootNode?.();
      if (root?.host && root.host !== el) {
        el = root.host;
        depth += 1;
        continue;
      }
      el = el.parentNode || el.host;
      depth += 1;
    }
    return false;
  }

  isCardPickerPreviewContext() {
    let el = this._host;
    let depth = 0;
    while (el && depth < 64) {
      const tag = String(el.tagName || "").toUpperCase();
      if (
        tag === "HUI-CARD-PICKER" ||
        tag === "HUI-DIALOG-CREATE-CARD" ||
        tag === "HUI-CARD-OPTIONS"
      ) {
        return true;
      }
      const root = el.getRootNode?.();
      if (root?.host && root.host !== el) {
        el = root.host;
        depth += 1;
        continue;
      }
      el = el.parentNode || el.host;
      depth += 1;
    }
    return false;
  }

  renderCardPickerDemo() {
    const active = this.isCardPickerPreviewContext();
    this._host.classList?.toggle?.("card-picker-demo-host", active);
    if (!active) {
      this._host.shadowRoot
        ?.querySelector?.("#card")
        ?.classList?.remove?.("card-picker-demo");
      this._cardPickerDemoEngine = null;
      this._cardPickerDemoList = null;
      return false;
    }

    const root = this._host.shadowRoot;
    const card = root?.querySelector?.("#card");
    const engine = root?.querySelector?.("#engine");
    const fallback = root?.querySelector?.("#stream-fallback");
    const browse = root?.querySelector?.("#browse");
    const browseHeader = root?.querySelector?.("#browse-head");
    const browseHeaderLabel = root?.querySelector?.("#browse-head-label");
    const list = root?.querySelector?.("#list");
    if (!card || !engine || !browse || !browseHeader || !list) return true;

    card.classList?.add?.("card-picker-demo");
    const demoSurface = fallback || engine;
    if (this._cardPickerDemoEngine !== demoSurface) {
      demoSurface.innerHTML = buildCardPickerDemoLiveMarkup();
      this._cardPickerDemoEngine = demoSurface;
    }
    if (fallback) {
      fallback.hidden = false;
      fallback.removeAttribute?.("hidden");
    }
    browse.style.display = "flex";
    browseHeader.style.display = "flex";
    if (browseHeaderLabel) browseHeaderLabel.textContent = "Recent Alerts";

    const alertsMarkup = buildCardPickerDemoAlertsMarkup();
    if (this._cardPickerDemoList !== list) {
      list.innerHTML = alertsMarkup;
      this._cardPickerDemoList = list;
    }
    this._host._lastRenderedListHtml = alertsMarkup;

    const title = root.querySelector?.("#info-title");
    const subtitle = root.querySelector?.("#tl-range");
    const streamType = root.querySelector?.("#stream-type");
    const alertCount = root.querySelector?.("#alert-count");
    const statusLabel = root.querySelector?.("#on-lbl");
    const statusDot = root.querySelector?.("#on-dot");
    if (title) title.textContent = "FrigateView";
    if (subtitle) subtitle.textContent = "Demo Camera";
    if (streamType) streamType.textContent = "Demo";
    if (alertCount) alertCount.textContent = "2";
    if (statusLabel) statusLabel.textContent = "Online";
    if (statusDot) statusDot.style.color = "var(--c-on)";

    return true;
  }

  isPreviewContext() {
    return this.isEditorPreviewContext() || this.isCardPickerPreviewContext();
  }
}
