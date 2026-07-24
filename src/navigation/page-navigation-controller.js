export class PageNavigationController {
  constructor(host, constants) {
    this._host = host;
    this._constants = constants;
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

  pageRouteLabel(pageId) {
    const { PAGE_IDS } = this._constants;
    if (pageId === PAGE_IDS.preview) return "Preview";
    if (pageId === PAGE_IDS.wideView) return "Wide View";
    return "Single View";
  }

  pageNavMarkup() {
    return this._constants.buildPageNavMarkup({
      routes: this.pageRouteOptions(),
      activePageId: this._constants.normalizePageRoute(this._host._pageId),
      getRouteLabel: (pageId) => this.pageRouteLabel(pageId),
    });
  }

  syncPageNavShell() {
    this._host.shadowRoot.querySelectorAll(".page-nav").forEach((nav) => {
      nav.innerHTML = this.pageNavMarkup();
    });
    this.syncPageNavigationButtons();
  }

  syncPageNavigationButtons() {
    this._host.shadowRoot
      .querySelectorAll("[data-page-route]")
      .forEach((button) => {
        const isActive =
          button.dataset.pageRoute ===
          this._constants.normalizePageRoute(this._host._pageId);
        button.classList.toggle("active", isActive);
        button.setAttribute("aria-pressed", isActive ? "true" : "false");
      });
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
        [PAGE_IDS.preview]: {
          activate: (context) => this._host._activatePreviewPageRoute(context),
        },
        [PAGE_IDS.wideView]: {
          activate: (context) => this._host._activateWideViewPageRoute(context),
        },
      },
      getDeviceBucket: () => this._host._deviceRouteBucket(),
      getConfig: () => this._host._config || {},
      onBeforeNavigate: (nextPageId, context) => {
        context.previousPageId = this._host._pageId || PAGE_IDS.singleView;
        this._host._pageId = nextPageId;
        this._host._previewPageActive = nextPageId === PAGE_IDS.preview;
      },
      onAfterNavigate: (nextPageId) => {
        if (nextPageId !== PAGE_IDS.preview) {
          this._host._lastNonPreviewPageId = nextPageId;
        }
        this._host._syncPageNavigationButtons();
      },
    });

    return this._host._navigationFactory;
  }
}
