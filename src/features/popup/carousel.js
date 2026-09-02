import { CleanupController } from "../../shared/cleanup.js";
import { escapeHtml, escapeHtmlAttribute } from "../../shared/html.js";

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
  return `<button class="popup-carousel-item${active}" data-ev="${escapeHtmlAttribute(event.id)}" title="${escapeHtmlAttribute(title)}"><div class="et">${thumbnailHtml}</div><div class="popup-carousel-meta"><span>${escapeHtml(label)}</span><span>${escapeHtml(time)}</span></div></button>`;
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
  if (isMobileDevice) {
    return {
      shouldRender: false,
      shouldClear: true,
      hidden: true,
      touch: false,
      mobile: true,
    };
  }

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
    axisThreshold = 10,
    commitThreshold = 32,
    settleDurationMs = 220,
    requestFrame = globalThis.requestAnimationFrame?.bind(globalThis) ||
      ((callback) => globalThis.setTimeout(() => callback(Date.now()), 16)),
    cancelFrame = globalThis.cancelAnimationFrame?.bind(globalThis) ||
      globalThis.clearTimeout?.bind(globalThis),
    now = globalThis.performance?.now?.bind(globalThis.performance) || Date.now,
  } = {}) {
    this._row = row;
    this._getScrollPlan = getScrollPlan;
    this._axisThreshold = Math.max(0, Number(axisThreshold || 0));
    this._commitThreshold = Math.max(0, Number(commitThreshold || 0));
    this._settleDurationMs = Math.max(0, Number(settleDurationMs || 0));
    this._requestFrame = requestFrame;
    this._cancelFrame = cancelFrame;
    this._now = now;
    this._cleanup = new CleanupController();
    this._gesture = null;
    this._animationFrame = 0;
  }

  bind() {
    if (!this._row) return this;
    this._cleanup.addEventListener(this._row, "touchstart", this._onTouchStart, {
      passive: true,
    });
    this._cleanup.addEventListener(this._row, "touchmove", this._onTouchMove, {
      passive: false,
    });
    this._cleanup.addEventListener(this._row, "touchend", this._onTouchEnd);
    this._cleanup.addEventListener(
      this._row,
      "touchcancel",
      this._onTouchCancel,
    );
    return this;
  }

  dispose() {
    this._cancelSettle();
    this._gesture = null;
    this._row?.classList?.remove?.("is-swiping", "is-settling");
    this._cleanup.dispose();
  }

  _cancelSettle() {
    if (this._animationFrame) this._cancelFrame?.(this._animationFrame);
    this._animationFrame = 0;
    this._row?.classList?.remove?.("is-settling");
  }

  _touchFromList(touchList, identifier) {
    return [...(touchList || [])].find(
      (touch) => touch.identifier === identifier,
    );
  }

  _onTouchStart = (event) => {
    if (this._gesture || event.touches?.length !== 1) return;
    const touch = event.touches[0];
    this._cancelSettle();
    this._gesture = {
      identifier: touch.identifier,
      startX: Number(touch.clientX) || 0,
      startY: Number(touch.clientY) || 0,
      currentX: Number(touch.clientX) || 0,
      currentY: Number(touch.clientY) || 0,
      startScrollLeft: Number(this._row?.scrollLeft) || 0,
      axis: "",
    };
  };

  _gestureDelta() {
    return {
      x: this._gesture.currentX - this._gesture.startX,
      y: this._gesture.currentY - this._gesture.startY,
    };
  }

  _resolveAxis(delta, final = false) {
    if (this._gesture.axis) return this._gesture.axis;
    const absX = Math.abs(delta.x);
    const absY = Math.abs(delta.y);
    if (Math.max(absX, absY) < this._axisThreshold) {
      return "";
    }
    if (absX > absY * 1.1) this._gesture.axis = "horizontal";
    else if (absY > absX * 1.1) this._gesture.axis = "vertical";
    else if (final || Math.max(absX, absY) >= this._axisThreshold * 2) {
      this._gesture.axis = absX > absY ? "horizontal" : "vertical";
    }
    return this._gesture.axis;
  }

  _updateGestureTouch(touch) {
    if (!touch || !this._gesture) return false;
    this._gesture.currentX = Number(touch.clientX) || 0;
    this._gesture.currentY = Number(touch.clientY) || 0;
    return true;
  }

  _onTouchMove = (event) => {
    if (!this._gesture) return;
    const touch = this._touchFromList(
      event.touches,
      this._gesture.identifier,
    );
    if (!this._updateGestureTouch(touch)) return;
    const delta = this._gestureDelta();
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

  _animateTo(targetScrollLeft) {
    this._cancelSettle();
    const maxScrollLeft = Math.max(
      0,
      Number(this._row?.scrollWidth || 0) - Number(this._row?.clientWidth || 0),
    );
    const target = Math.min(
      maxScrollLeft,
      Math.max(0, Number(targetScrollLeft || 0)),
    );
    const start = Number(this._row?.scrollLeft) || 0;
    const distance = target - start;
    if (!distance || !this._settleDurationMs || !this._requestFrame) {
      if (this._row) this._row.scrollLeft = target;
      return;
    }
    const startedAt = this._now();
    this._row?.classList?.add?.("is-settling");
    const step = (frameNow) => {
      const elapsed = Math.max(0, Number(frameNow) - startedAt);
      const progress = Math.min(1, elapsed / this._settleDurationMs);
      const eased = 1 - Math.pow(1 - progress, 3);
      this._row.scrollLeft = start + distance * eased;
      if (progress < 1) {
        this._animationFrame = this._requestFrame(step);
        return;
      }
      this._row.scrollLeft = target;
      this._animationFrame = 0;
      this._row?.classList?.remove?.("is-settling");
    };
    this._animationFrame = this._requestFrame(step);
  }

  _finish(event, cancelled = false) {
    if (!this._gesture) return;
    const touch = this._touchFromList(
      event.changedTouches,
      this._gesture.identifier,
    );
    this._updateGestureTouch(touch);
    const gesture = this._gesture;
    const delta = this._gestureDelta();
    const axis = this._resolveAxis(delta, true);
    this._gesture = null;
    this._row?.classList?.remove?.("is-swiping");
    if (axis !== "horizontal" || cancelled) {
      if (axis === "horizontal") this._animateTo(gesture.startScrollLeft);
      return;
    }
    const direction = delta.x < 0 ? 1 : -1;
    const shouldAdvance = Math.abs(delta.x) >= this._commitThreshold;
    const scrollPlan = shouldAdvance
      ? this._getScrollPlan(direction)
      : { left: 0, behavior: "smooth" };
    this._animateTo(
      gesture.startScrollLeft + Number(scrollPlan?.left || 0),
    );
  }

  _onTouchEnd = (event) => this._finish(event, false);

  _onTouchCancel = (event) => this._finish(event, true);
}
