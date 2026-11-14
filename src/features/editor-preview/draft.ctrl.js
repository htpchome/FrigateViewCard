import { PAGE_IDS } from "../navigation/router.js";

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

export class EditorPreviewDraftController {
  constructor(host, { resolveLandingPage = (pageId) => pageId } = {}) {
    this._host = host;
    this._resolveLandingPage = resolveLandingPage;
  }

  applyConfigDraft({ previousConfig = {}, nextConfig = {} } = {}) {
    this._host._haNavbarController?.sync?.();
    this._host._haDashboardSwipeNavigationController?.sync?.();
    this._host._syncVisualStyleToggles?.();
    this._host._syncFvcBrandLogo?.();
    this._host._syncFooterVersion?.();
    if (
      previewKeysChanged(
        previousConfig,
        nextConfig,
        "camera_suspend_access",
      )
    ) {
      this._host._frigateCameraRuntimeController?.sync?.();
    }
    if (
      previewKeysChanged(
        previousConfig,
        nextConfig,
        "mobile_view_header_overlay",
      )
    ) {
      this._host._initLiveOverlayControls?.();
    }
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

    const landingPageChanged = previewKeysChanged(
      previousConfig,
      nextConfig,
      "landing_page",
    );
    if (landingPageChanged) {
      const targetPageId = this._resolveLandingPage(
        pageNavigation?.resolveConfiguredLandingPage?.({
          hasPendingDeepLinkTarget: false,
        }),
      );
      if (targetPageId && targetPageId !== this._host._pageId) {
        void pageNavigation.navigateToPageRoute?.(targetPageId, {
          source: "editor-preview-landing-change",
        });
        return "navigated";
      }
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

    const singleTakeoverChanged = previewKeysChanged(
      previousConfig,
      nextConfig,
      "single_view_alert_takeover",
    );
    const singleStartModeChanged = previewKeysChanged(
      previousConfig,
      nextConfig,
      "single_view_start_mode",
    );
    if (singleTakeoverChanged || singleStartModeChanged) {
      this._host._singleViewPageController?.applyPageConfigUpdate?.({
        takeoverDefaultChanged: singleTakeoverChanged,
        startModeChanged: singleStartModeChanged,
      });
    }

    const wideStartModeChanged = previewKeysChanged(
      previousConfig,
      nextConfig,
      "wide_view_start_mode",
    );
    if (wideStartModeChanged) {
      this._host._wideViewPageController?.applyPageConfigUpdate?.({
        startModeChanged: true,
      });
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

    const wideWidthChanged = previewKeysChanged(
      previousConfig,
      nextConfig,
      "wide_view_width",
      "col_left_width_pct",
    );
    if (wideWidthChanged) {
      this._host._wideViewPageController?.applyLayoutAndWideSyncForCard?.();
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
    const cardViewModeChanged = previewKeysChanged(
      previousConfig,
      nextConfig,
      "card_view_view_mode",
    );
    const cardStandaloneChanged = previewKeysChanged(
      previousConfig,
      nextConfig,
      "card_view_standalone",
    );
    const cardMediaDrawerEnabledChanged = previewKeysChanged(
      previousConfig,
      nextConfig,
      "card_view_media_drawer_enabled",
    );
    const cardStartModeChanged = previewKeysChanged(
      previousConfig,
      nextConfig,
      "card_view_start_mode",
    );
    const cardHideCameraNameChanged = previewKeysChanged(
      previousConfig,
      nextConfig,
      "card_view_hide_camera_name",
    );
    const cardDisplayCameraDropdownChanged = previewKeysChanged(
      previousConfig,
      nextConfig,
      "card_view_display_camera_dropdown",
    );
    if (
      cardTakeoverChanged ||
      cardViewModeChanged ||
      cardStandaloneChanged ||
      cardMediaDrawerEnabledChanged ||
      cardStartModeChanged ||
      cardHideCameraNameChanged ||
      cardDisplayCameraDropdownChanged
    ) {
      this._host._cardViewPageController?.applyConfigUpdate?.({
        takeoverDefaultChanged: cardTakeoverChanged,
        viewModeChanged: cardViewModeChanged,
        standaloneChanged: cardStandaloneChanged,
        mediaDrawerEnabledChanged: cardMediaDrawerEnabledChanged,
        startModeChanged: cardStartModeChanged,
        hideCameraNameChanged: cardHideCameraNameChanged,
        displayCameraDropdownChanged:
          cardDisplayCameraDropdownChanged,
      });
    }

    const eventMediaDurationChanged = previewKeysChanged(
      previousConfig,
      nextConfig,
      "event_pre_post_roll_enabled",
    );
    this._host._singleViewPageController?.applyEditorPreviewDraftRefresh?.({
      renderList: eventMediaDurationChanged,
    });
    if (camerasChanged) {
      this._host._syncTwoWayTalkRuntimeState?.();
      this._host._syncTwoWayTalkButton?.();
      this._host._linkedLightController?.sync?.();
    }
    this._host._syncToolbarButtons?.();

    const favoritesScopeChanged = previewKeysChanged(
      previousConfig,
      nextConfig,
      "favorites_mixed_cameras",
    );
    if (
      favoritesScopeChanged &&
      this._host._tab === "kept" &&
      this._host._isPreviewPageActive?.() !== true
    ) {
      void this._host._loadTabData?.("kept");
    }

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
}
