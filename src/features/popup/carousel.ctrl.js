import { cap } from "../../helpers.js";
import { ICONS } from "../../icons.js";
import {
  buildPopupCarouselContentPlan,
  buildPopupCarouselEvents,
  buildPopupCarouselItemMarkup,
  buildPopupCarouselScrollPlan,
  PopupCarouselSwipeController,
  resolvePopupCarouselActiveScrollLeft,
  resolvePopupCarouselNavigationState,
} from "./carousel.js";

export class PopupCarouselController {
  constructor({
    query,
    getKept = () => [],
    getReviews = () => [],
    getDisplayEvents = () => [],
    findEventById = () => null,
    mediaUrl = () => "",
    formatDateTime = () => "",
    formatTime = () => "",
    isTouchUi = () => false,
    isMobileDevice = () => false,
    resizeObserverCtor = globalThis.ResizeObserver,
    requestFrame = globalThis.requestAnimationFrame?.bind(globalThis) ||
      ((callback) => globalThis.setTimeout(callback, 0)),
    createSwipeController = (options) =>
      new PopupCarouselSwipeController(options),
  } = {}) {
    this._query = query;
    this._getKept = getKept;
    this._getReviews = getReviews;
    this._getDisplayEvents = getDisplayEvents;
    this._findEventById = findEventById;
    this._mediaUrl = mediaUrl;
    this._formatDateTime = formatDateTime;
    this._formatTime = formatTime;
    this._isTouchUi = isTouchUi;
    this._isMobileDevice = isMobileDevice;
    this._ResizeObserver = resizeObserverCtor;
    this._requestFrame = requestFrame;
    this._createSwipeController = createSwipeController;
    this._resizeObserver = null;
    this._swipeController = null;
    this._row = null;
    this._renderToken = 0;
  }

  render(mediaType, activeId = "") {
    const wrap = this._query?.("#popup-carousel-wrap");
    const row = this._query?.("#popup-carousel");
    if (!wrap || !row) return null;

    this.dispose();
    this._row = row;
    row.onscroll = null;
    const contentPlan = buildPopupCarouselContentPlan({
      mediaType,
      events: this._events(mediaType),
      activeId,
      isTouchUi: this._isTouchUi(),
      isMobileDevice: this._isMobileDevice(),
      renderEvent: (event, currentActiveId) =>
        this._eventMarkup(event, currentActiveId),
    });
    if (contentPlan.shouldClear) row.innerHTML = "";
    wrap.hidden = contentPlan.hidden;
    if (!contentPlan.shouldRender) return contentPlan;

    row.innerHTML = contentPlan.html;
    row.scrollLeft = 0;
    wrap.classList.toggle("touch", contentPlan.touch);
    wrap.classList.toggle("mobile-device", contentPlan.mobile);
    const syncNavigation = () => this.syncNavigation(row);
    row.onscroll = syncNavigation;
    if (typeof this._ResizeObserver === "function") {
      this._resizeObserver = new this._ResizeObserver(syncNavigation);
      this._resizeObserver.observe(row);
    }
    if (contentPlan.mobile) {
      this._swipeController = this._createSwipeController({
        row,
        getScrollPlan: (dir) => this._scrollPlan(row, dir),
      }).bind();
    }
    syncNavigation();
    const renderToken = this._renderToken;
    this._requestFrame(() => {
      if (renderToken !== this._renderToken || this._row !== row) return;
      const active = row.querySelector(".popup-carousel-item.active");
      if (active) {
        row.scrollLeft = resolvePopupCarouselActiveScrollLeft({
          activeOffsetLeft: active.offsetLeft,
        });
      }
      syncNavigation();
    });
    return contentPlan;
  }

  clear() {
    this.dispose();
    const wrap = this._query?.("#popup-carousel-wrap");
    const row = this._query?.("#popup-carousel");
    if (wrap) wrap.hidden = true;
    if (row) row.innerHTML = "";
  }

  dispose() {
    this._renderToken += 1;
    this._resizeObserver?.disconnect?.();
    this._resizeObserver = null;
    this._swipeController?.dispose?.();
    this._swipeController = null;
    if (this._row) this._row.onscroll = null;
    this._row = null;
  }

  syncNavigation(row = this._query?.("#popup-carousel")) {
    if (!row) return;
    const wrap = this._query?.("#popup-carousel-wrap");
    const leftButton = this._query?.("#popup-carousel-left");
    const rightButton = this._query?.("#popup-carousel-right");
    const item = row.querySelector(".popup-carousel-item");
    const itemHeight = Number(item?.getBoundingClientRect?.().height || 0);
    if (wrap && itemHeight > 0) {
      wrap.style.setProperty(
        "--popup-carousel-item-height",
        `${itemHeight}px`,
      );
    }
    const navigationState = resolvePopupCarouselNavigationState({
      scrollLeft: row.scrollLeft,
      scrollWidth: row.scrollWidth,
      viewportWidth: row.clientWidth,
    });
    if (leftButton) leftButton.hidden = !navigationState.canScrollLeft;
    if (rightButton) rightButton.hidden = !navigationState.canScrollRight;
  }

  scroll(dir = 1) {
    const row = this._query?.("#popup-carousel");
    if (!row) return;
    row.scrollBy(this._scrollPlan(row, dir));
  }

  _events(mediaType) {
    return buildPopupCarouselEvents({
      mediaType,
      kept: this._getKept() || [],
      reviews: this._getReviews() || [],
      displayEvents: this._getDisplayEvents() || [],
      findEventById: this._findEventById,
    });
  }

  _eventMarkup(event, activeId = "") {
    if (!event?.id) return "";
    const thumbnail = `<img src="${this._mediaUrl(event.id, "thumbnail.jpg")}" loading="lazy" data-thumb-id="${event.id}" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"><div class="tph" style="display:none">${ICONS.person}</div>`;
    return buildPopupCarouselItemMarkup({
      event,
      activeId,
      thumbnailHtml: thumbnail,
      title: this._formatDateTime(event.start_time || 0),
      label: cap(event.label || "event"),
      time: this._formatTime(event.start_time || 0),
    });
  }

  _scrollPlan(row, dir = 1) {
    const item = row.querySelector(".popup-carousel-item");
    return buildPopupCarouselScrollPlan({
      itemWidth: item?.getBoundingClientRect?.().width,
      viewportWidth: row.clientWidth,
      dir,
    });
  }
}
