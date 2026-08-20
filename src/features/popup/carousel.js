import { CleanupController } from "../../shared/cleanup.js";

const sortByStartTimeDesc = (items = []) =>
  [...items].sort((a, b) => (b?.start_time || 0) - (a?.start_time || 0));

export const buildPopupCarouselItemMarkup = ({
  event = null,
  activeId = "",
  thumbnailHtml = "",
  title = "",
  label = "",
  time = "",
}) => {
  if (!event?.id) return "";
  const active = event.id === activeId ? " active" : "";
  return `<button class="popup-carousel-item${active}" data-ev="${event.id}" title="${title}"><div class="et">${thumbnailHtml}</div><div class="popup-carousel-meta"><span>${label}</span><span>${time}</span></div></button>`;
};

export const shouldShowPopupCarousel = (mediaType = "") =>
  ["alert", "clip", "snapshot", "kept"].includes(
    String(mediaType || "").toLowerCase(),
  );

export const buildPopupCarouselEvents = ({
  mediaType = "",
  kept = [],
  reviews = [],
  displayEvents = [],
  findEventById = () => null,
}) => {
  const type = String(mediaType || "").toLowerCase();

  if (type === "kept") {
    return sortByStartTimeDesc(kept);
  }

  if (type === "alert") {
    const out = [];
    const seen = new Set();
    for (const review of sortByStartTimeDesc(reviews)) {
      const firstDetection = review?.data?.detections?.[0] || "";
      if (!firstDetection || seen.has(firstDetection)) continue;
      const event = findEventById(firstDetection);
      if (!event) continue;
      seen.add(firstDetection);
      out.push(event);
    }
    return out;
  }

  const all = sortByStartTimeDesc(displayEvents);
  if (type === "snapshot") return all.filter((event) => event.has_snapshot);
  return all.filter((event) => event.has_clip);
};

export const resolvePopupCarouselRenderPlan = ({
  mediaType = "",
  eventCount = 0,
  isTouchUi = false,
  isMobileDevice = false,
}) => {
  if (!shouldShowPopupCarousel(mediaType)) {
    return {
      shouldRender: false,
      shouldClear: true,
      hidden: true,
      touch: false,
      mobile: false,
    };
  }

  if (!(Number(eventCount || 0) > 0)) {
    return {
      shouldRender: false,
      shouldClear: true,
      hidden: true,
      touch: false,
      mobile: false,
    };
  }

  return {
    shouldRender: true,
    shouldClear: false,
    hidden: false,
    touch: Boolean(isTouchUi),
    mobile: Boolean(isMobileDevice),
  };
};

export const buildPopupCarouselContentPlan = ({
  mediaType = "",
  events = [],
  activeId = "",
  isTouchUi = false,
  isMobileDevice = false,
  limit = 200,
  renderEvent = () => "",
}) => {
  const limitedEvents = [...(events || [])].slice(0, Number(limit || 0) || 0);
  const renderPlan = resolvePopupCarouselRenderPlan({
    mediaType,
    eventCount: limitedEvents.length,
    isTouchUi,
    isMobileDevice,
  });

  return {
    ...renderPlan,
    html: renderPlan.shouldRender
      ? limitedEvents.map((event) => renderEvent(event, activeId)).join("")
      : "",
  };
};

export const buildPopupCarouselScrollPlan = ({
  itemWidth = 0,
  viewportWidth = 0,
  dir = 1,
  gap = 8,
  fallbackWidth = 132,
}) => {
  const width = Number(itemWidth || 0) || Number(fallbackWidth || 0);
  const step = width + Number(gap || 0);
  const availableWidth = Math.max(0, Number(viewportWidth || 0));
  const visibleItems = Math.max(
    1,
    Math.floor((availableWidth + Number(gap || 0)) / step),
  );
  return {
    left: step * visibleItems * (Number(dir || 0) < 0 ? -1 : 1),
    behavior: "smooth",
  };
};

export const resolvePopupCarouselActiveScrollLeft = ({
  activeOffsetLeft = 0,
  padding = 8,
}) => Math.max(0, Number(activeOffsetLeft || 0) - Number(padding || 0));

export const resolvePopupCarouselNavigationState = ({
  scrollLeft = 0,
  scrollWidth = 0,
  viewportWidth = 0,
  tolerance = 1,
} = {}) => {
  const viewport = Math.max(0, Number(viewportWidth || 0));
  const maxScrollLeft = Math.max(0, Number(scrollWidth || 0) - viewport);
  const currentScrollLeft = Math.min(
    maxScrollLeft,
    Math.max(0, Number(scrollLeft || 0)),
  );
  const edgeTolerance = Math.max(0, Number(tolerance || 0));
  const hasOverflow = maxScrollLeft > edgeTolerance;

  return {
    canScrollLeft: hasOverflow && currentScrollLeft > edgeTolerance,
    canScrollRight:
      hasOverflow && currentScrollLeft < maxScrollLeft - edgeTolerance,
  };
};

export class PopupCarouselSwipeController {
  constructor({
    row,
    getScrollPlan = () => ({ left: 0, behavior: "smooth" }),
    axisThreshold = 8,
    commitThreshold = 32,
  } = {}) {
    this._row = row;
    this._getScrollPlan = getScrollPlan;
    this._axisThreshold = Math.max(0, Number(axisThreshold || 0));
    this._commitThreshold = Math.max(0, Number(commitThreshold || 0));
    this._cleanup = new CleanupController();
    this._gesture = null;
  }

  bind() {
    if (!this._row) return this;
    this._cleanup.addEventListener(this._row, "pointerdown", this._onPointerDown);
    this._cleanup.addEventListener(this._row, "pointermove", this._onPointerMove);
    this._cleanup.addEventListener(this._row, "pointerup", this._onPointerUp);
    this._cleanup.addEventListener(
      this._row,
      "pointercancel",
      this._onPointerCancel,
    );
    return this;
  }

  dispose() {
    this._restoreStart();
    this._cleanup.dispose();
  }

  _scrollTo(left, behavior = "smooth") {
    if (typeof this._row?.scrollTo === "function") {
      this._row.scrollTo({ left, behavior });
      return;
    }
    if (this._row) this._row.scrollLeft = left;
  }

  _restoreStart() {
    const startScrollLeft = this._gesture?.startScrollLeft;
    this._gesture = null;
    this._row?.classList?.remove?.("is-swiping");
    if (Number.isFinite(startScrollLeft)) {
      this._scrollTo(startScrollLeft, "smooth");
    }
  }

  _onPointerDown = (event) => {
    if (String(event?.pointerType || "").toLowerCase() !== "touch") return;
    this._gesture = {
      pointerId: event.pointerId,
      startX: Number(event.clientX) || 0,
      startY: Number(event.clientY) || 0,
      startScrollLeft: Number(this._row?.scrollLeft) || 0,
      axis: "",
    };
    this._row?.setPointerCapture?.(event.pointerId);
  };

  _gestureDelta(event) {
    return {
      x: (Number(event?.clientX) || 0) - this._gesture.startX,
      y: (Number(event?.clientY) || 0) - this._gesture.startY,
    };
  }

  _resolveAxis(delta) {
    if (this._gesture.axis) return this._gesture.axis;
    if (Math.max(Math.abs(delta.x), Math.abs(delta.y)) < this._axisThreshold) {
      return "";
    }
    this._gesture.axis =
      Math.abs(delta.x) > Math.abs(delta.y) ? "horizontal" : "vertical";
    return this._gesture.axis;
  }

  _onPointerMove = (event) => {
    if (!this._gesture || event.pointerId !== this._gesture.pointerId) return;
    const delta = this._gestureDelta(event);
    const axis = this._resolveAxis(delta);
    if (!axis) return;
    if (axis === "vertical") {
      this._gesture = null;
      return;
    }
    if (event.cancelable) event.preventDefault?.();
    this._row?.classList?.add?.("is-swiping");
    this._row.scrollLeft = this._gesture.startScrollLeft - delta.x;
  };

  _finish(event, cancelled = false) {
    if (!this._gesture || event.pointerId !== this._gesture.pointerId) return;
    const gesture = this._gesture;
    const delta = this._gestureDelta(event);
    const axis = this._resolveAxis(delta);
    this._gesture = null;
    this._row?.releasePointerCapture?.(event.pointerId);
    this._row?.classList?.remove?.("is-swiping");
    if (axis !== "horizontal" || cancelled) {
      this._scrollTo(gesture.startScrollLeft, "smooth");
      return;
    }
    const direction = delta.x < 0 ? 1 : -1;
    const shouldAdvance = Math.abs(delta.x) >= this._commitThreshold;
    const scrollPlan = shouldAdvance
      ? this._getScrollPlan(direction)
      : { left: 0, behavior: "smooth" };
    this._scrollTo(
      gesture.startScrollLeft + Number(scrollPlan?.left || 0),
      scrollPlan?.behavior || "smooth",
    );
  }

  _onPointerUp = (event) => this._finish(event, false);

  _onPointerCancel = (event) => this._finish(event, true);
}
