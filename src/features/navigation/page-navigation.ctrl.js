export const shouldShowPageToolsDivider = ({
  holderDisplay = "",
  pageNavigationRect = null,
  toolsRect = null,
} = {}) => {
  if (holderDisplay !== "flex" || !pageNavigationRect || !toolsRect) {
    return false;
  }
  const navigationHeight = Number(pageNavigationRect.height) || 0;
  const toolsHeight = Number(toolsRect.height) || 0;
  if (navigationHeight <= 0 || toolsHeight <= 0) return false;

  const verticalOverlap =
    Math.min(pageNavigationRect.bottom, toolsRect.bottom) -
    Math.max(pageNavigationRect.top, toolsRect.top);
  const sameRow =
    verticalOverlap >= Math.min(navigationHeight, toolsHeight) / 2;
  const navigationPrecedesTools =
    pageNavigationRect.right <= toolsRect.left + 1;
  return sameRow && navigationPrecedesTools;
};

export class PageNavigationController {
  constructor(host, constants) {
    this._host = host;
    this._constants = constants;
    this._toolbarDividerResizeObserver = null;
  }

  pageRouteOptions() {
    return this._constants.getEnabledPageRoutes(
      this._host._config || {},
      this._host._deviceRouteBucket(),
    );
  }

  isPageRouteAvailable(pageId) {
    return this.pageRouteOptions().includes(
      this._constants.normalizePageRoute(pageId),
    );
  }

  pageSwipeRouteOptions(swipeMode = null) {
    const config = swipeMode
      ? {
          ...(this._host._config || {}),
          ha_dashboard_swipe_navigation: swipeMode,
        }
      : this._host._config || {};
    return this._constants.resolvePageSwipeOrder(
      config,
      this._host._deviceRouteBucket(),
    );
  }

  resolveSwipePageTarget(direction, swipeMode = null) {
    const config = swipeMode
      ? {
          ...(this._host._config || {}),
          ha_dashboard_swipe_navigation: swipeMode,
        }
      : this._host._config || {};
    return this._constants.resolveAdjacentPageSwipeRoute({
      config,
      deviceBucket: this._host._deviceRouteBucket(),
      currentPageId: this._host._pageId,
      direction,
    });
  }

  resolveDashboardSwipeBoundaryPage({
    direction,
    transition,
    swipeMode = null,
  } = {}) {
    const pages = this.pageSwipeRouteOptions(swipeMode);
    if (
      !pages.length ||
      !["next", "previous"].includes(direction) ||
      !["enter", "exit"].includes(transition)
    ) {
      return null;
    }
    const useFirstPage =
      transition === "enter"
        ? direction === "next"
        : direction === "previous";
    const boundaryPage = useFirstPage ? pages[0] : pages.at(-1);
    return boundaryPage === this._host._pageId ? null : boundaryPage || null;
  }

  allowsDashboardPageSwipe() {
    return this._constants.allowsDashboardPageSwipeNavigation(
      this._host._config || {},
    );
  }

  isSwipeNavigationEnabled() {
    return this._constants.isDashboardSwipeNavigationEnabled(
      this._host._config || {},
    );
  }

  pageRouteLabel(pageId) {
    const { PAGE_IDS } = this._constants;
    if (pageId === PAGE_IDS.mobileView) return "Mobile";
    if (pageId === PAGE_IDS.preview) return "Preview";
    if (pageId === PAGE_IDS.wideView) return "Wide View";
    if (pageId === PAGE_IDS.cardView) return "Card View";
    return "Single View";
  }

  pageRouteIcon(pageId) {
    const { PAGE_IDS, ICONS = {} } = this._constants;
    if (pageId === PAGE_IDS.mobileView) return ICONS.mobileView || "";
    if (pageId === PAGE_IDS.preview) return ICONS.preView || "";
    if (pageId === PAGE_IDS.wideView) return ICONS.wideView || "";
    if (pageId === PAGE_IDS.cardView) return ICONS.cardView || "";
    return ICONS.singleView || "";
  }

  shouldHidePageNavigation() {
    const { PAGE_IDS } = this._constants;
    const routes = this.pageRouteOptions();
    return (
      this._host._config?.card_view_standalone === true &&
      routes.length === 1 &&
      routes[0] === PAGE_IDS.cardView
    );
  }

  pageNavMarkup() {
    if (this.shouldHidePageNavigation()) return "";
    return this._constants.buildPageNavMarkup({
      routes: this.pageRouteOptions(),
      activePageId: this._constants.normalizePageRoute(this._host._pageId),
      getRouteLabel: (pageId) => this.pageRouteLabel(pageId),
      getRouteIcon: (pageId) => this.pageRouteIcon(pageId),
    });
  }

  pageNavButtonsMarkup() {
    if (this.shouldHidePageNavigation()) return "";
    return this._constants.buildPageNavButtonsMarkup({
      routes: this.pageRouteOptions(),
      activePageId: this._constants.normalizePageRoute(this._host._pageId),
      getRouteLabel: (pageId) => this.pageRouteLabel(pageId),
      getRouteIcon: (pageId) => this.pageRouteIcon(pageId),
    });
  }

  syncPageNavShell() {
    const nav = this._host._pageShellRegion("pageNavigation");
    if (nav) nav.innerHTML = this.pageNavButtonsMarkup();
    this.syncPageNavigationButtons();
    this.syncToolbarDivider();
  }

  syncPageNavigationButtons() {
    this._host
      ._pageShellRegionElements("pageNavigation", "[data-page-route]")
      .forEach((button) => {
        const isActive =
          button.dataset.pageRoute ===
          this._constants.normalizePageRoute(this._host._pageId);
        button.classList.toggle("active", isActive);
        button.setAttribute("aria-pressed", isActive ? "true" : "false");
      });
  }

  syncToolbarDivider() {
    const holder = this._host.shadowRoot?.querySelector?.(
      ".button-holder--responsive-toolbar",
    );
    if (!holder) return false;
    const pageNavigationRow = holder.querySelector?.(".page-nav-row");
    const toolsRow = holder.querySelector?.(".tools-row");
    if (!pageNavigationRow || !toolsRow) {
      holder.classList?.remove?.("page-tools-adjacent");
      return false;
    }

    const holderDisplay =
      typeof globalThis.getComputedStyle === "function"
        ? globalThis.getComputedStyle(holder).display
        : "";
    const visible = shouldShowPageToolsDivider({
      holderDisplay,
      pageNavigationRect: pageNavigationRow.getBoundingClientRect?.(),
      toolsRect: toolsRow.getBoundingClientRect?.(),
    });
    holder.classList?.toggle?.("page-tools-adjacent", visible);
    return visible;
  }

  connectToolbarDivider() {
    this.disconnectToolbarDivider();
    const holder = this._host.shadowRoot?.querySelector?.(
      ".button-holder--responsive-toolbar",
    );
    if (!holder) return;

    this.syncToolbarDivider();
    const ResizeObserverCtor = globalThis.ResizeObserver;
    if (typeof ResizeObserverCtor !== "function") return;
    this._toolbarDividerResizeObserver = new ResizeObserverCtor(() => {
      this.syncToolbarDivider();
    });
    for (const element of [
      holder,
      holder.querySelector?.(".page-nav-row"),
      holder.querySelector?.(".tools-row"),
    ]) {
      if (element) this._toolbarDividerResizeObserver.observe(element);
    }
  }

  disconnectToolbarDivider() {
    this._toolbarDividerResizeObserver?.disconnect?.();
    this._toolbarDividerResizeObserver = null;
  }

  navigateToPageRoute(pageId, context = {}) {
    return this.ensureNavigationFactory().navigateTo(pageId, context);
  }

  resolveConfiguredLandingPage(context = {}) {
    return this.ensureNavigationFactory().resolveStartupPage({
      hasPendingDeepLinkTarget: context.hasPendingDeepLinkTarget === true,
    });
  }

  resolvePreviewCameraTargetPage(fallbackPageId) {
    const { DEVICE_ROUTE_BUCKETS, PAGE_IDS } = this._constants;
    const isPhone =
      this._host._deviceRouteBucket() === DEVICE_ROUTE_BUCKETS.mobile;
    const configuredTarget = isPhone
      ? this._constants.resolveMobilePreviewDestination(
          this._host._config?.mobile_page,
        )
      : "";
    const targetPageId = this._constants.normalizePageRoute(
      configuredTarget || fallbackPageId,
    );
    return this.isPageRouteAvailable(targetPageId)
      ? targetPageId
      : PAGE_IDS.singleView;
  }

  prepareConfiguredLandingPageShell(context = {}) {
    const nextPageId = this.resolveConfiguredLandingPage(context);
    const previousPageId = this._host._pageId;
    this._host._pageId = nextPageId;
    this._host._previewPageActive =
      nextPageId === this._constants.PAGE_IDS.preview;
    this._host._haNavbarController?.sync?.();
    this._host._haPageBackgroundController?.sync?.();
    if (!this._host._previewPageActive) {
      this._host._lastNonPreviewPageId = nextPageId;
    }
    if (nextPageId !== previousPageId) {
      this._host._renderShell?.();
    }
    return nextPageId;
  }

  navigateToConfiguredLandingPage(context = {}) {
    const nextPageId = this.resolveConfiguredLandingPage(context);
    return this.navigateToPageRoute(nextPageId, context);
  }

  ensureNavigationFactory() {
    if (this._host._navigationFactory) return this._host._navigationFactory;

    const { createNavigationFactory, PAGE_IDS } = this._constants;
    this._host._navigationFactory = createNavigationFactory({
      pages: {
        [PAGE_IDS.singleView]: {
          activate: (context) =>
            this._host._activateSingleViewPageRoute(context),
        },
        [PAGE_IDS.mobileView]: {
          activate: (context) =>
            this._host._activateMobileViewPageRoute(context),
        },
        [PAGE_IDS.preview]: {
          activate: (context) => this._host._activatePreviewPageRoute(context),
        },
        [PAGE_IDS.wideView]: {
          activate: (context) => this._host._activateWideViewPageRoute(context),
        },
        [PAGE_IDS.cardView]: {
          activate: (context) => this._host._activateCardViewPageRoute(context),
        },
      },
      getDeviceBucket: () => this._host._deviceRouteBucket(),
      getConfig: () => this._host._config || {},
      onBeforeNavigate: (nextPageId, context) => {
        void this._host._stopPtzMotion?.("page-navigation");
        const previousPageId = this._host._pageId || PAGE_IDS.singleView;
        context.previousPageId = previousPageId;
        if (
          previousPageId === PAGE_IDS.wideView &&
          nextPageId !== PAGE_IDS.wideView
        ) {
          const wideViewController = this._host._wideViewPageController;
          if (typeof wideViewController?.stopWideViewMode === "function") {
            wideViewController.stopWideViewMode();
          } else {
            wideViewController?.stopCompanionMode?.();
          }
        }
        if (
          previousPageId === PAGE_IDS.cardView &&
          nextPageId !== PAGE_IDS.cardView
        ) {
          this._host._cardViewPageController?.deactivate?.();
        }
        this._host._pageId = nextPageId;
        this._host._previewPageActive = nextPageId === PAGE_IDS.preview;
        this._host._haNavbarController?.sync?.();
        this._host._haPageBackgroundController?.sync?.();
      },
      onAfterNavigate: (nextPageId) => {
        if (nextPageId !== PAGE_IDS.preview) {
          this._host._lastNonPreviewPageId = nextPageId;
        }
        this._host._syncMobileViewPageMarkup();
        this._host._syncCardViewPageMarkup?.();
        this.syncPageNavigationButtons();
      },
    });

    return this._host._navigationFactory;
  }
}
