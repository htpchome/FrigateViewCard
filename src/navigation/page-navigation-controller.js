export class PageNavigationController {
  constructor(host, constants) {
    this._host = host;
    this._constants = constants;
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
