import { CleanupController } from "../../shared/cleanup.js";
import {
  createRecordingsSwipeGestureState,
  RECORDINGS_SWIPE_EMPTY_HTML,
  RECORDINGS_SWIPE_LOADING_HTML,
  resolveFailedRecordingsSwipeState,
  resolvePreparedRecordingsSwipeState,
  resolveRecordingsSwipeStageMetrics,
  resolveRecordingsSwipeStageTransforms,
} from "./utils/swipe.js";

export class RecordingsSwipeController {
  constructor({
    browse,
    getTab,
    isMobileTabletViewport,
    isDayNavAnimating,
    getGesture,
    setGesture,
    setTapBlocked,
    getList,
    clearListState,
    getLastRenderedListHtml,
    setLastRenderedListHtml,
    renderList,
    prepareDayTransition,
    renderRecordings,
    completeGesture,
    bounceArea,
  }) {
    this._browse = browse;
    this._getTab = getTab;
    this._isMobileTabletViewport = isMobileTabletViewport;
    this._isDayNavAnimating = isDayNavAnimating;
    this._getGesture = getGesture;
    this._setGesture = setGesture;
    this._setTapBlocked = setTapBlocked;
    this._getList = getList;
    this._clearListState = clearListState;
    this._getLastRenderedListHtml = getLastRenderedListHtml;
    this._setLastRenderedListHtml = setLastRenderedListHtml;
    this._renderList = renderList;
    this._prepareDayTransition = prepareDayTransition;
    this._renderRecordings = renderRecordings;
    this._completeGesture = completeGesture;
    this._bounceArea = bounceArea;
    this._cleanup = new CleanupController();
    this._tracking = false;
    this._horizontal = false;
    this._direction = 0;
    this._pointerId = null;
    this._startX = 0;
    this._startY = 0;
    this._deltaX = 0;
    this._deltaY = 0;
    this._disposed = false;
    this._tapBlockTimer = null;
    this._axisLockThreshold = this._isMobileTabletViewport() ? 6 : 8;
    this._dragFollowFactor = this._isMobileTabletViewport() ? 1 : 0.85;
  }

  bind() {
    if (!this._browse) return;
    this._cleanup.addEventListener(
      this._browse,
      "pointerdown",
      this._onPointerDown,
    );
    this._cleanup.addEventListener(
      this._browse,
      "pointermove",
      this._onPointerMove,
    );
    this._cleanup.addEventListener(
      this._browse,
      "pointerup",
      this._onPointerUp,
    );
    this._cleanup.addEventListener(
      this._browse,
      "pointercancel",
      this._onPointerCancel,
    );
  }

  dispose() {
    if (this._disposed) return;
    this._disposed = true;
    this._clearTapBlockTimer();
    this._resetGesture();
    this._cleanup.dispose();
  }

  _canSwipe = () =>
    this._getTab?.() === "recordings" &&
    this._isMobileTabletViewport?.() &&
    !this._isDayNavAnimating?.();

  _clearTapBlockTimer() {
    if (!this._tapBlockTimer) return;
    clearTimeout(this._tapBlockTimer);
    this._tapBlockTimer = null;
  }

  _scheduleTapBlockClear() {
    this._clearTapBlockTimer();
    this._tapBlockTimer = setTimeout(() => {
      this._tapBlockTimer = null;
      if (this._disposed) return;
      this._setTapBlocked?.(false);
    }, 320);
    this._cleanup.addCleanup(() => this._clearTapBlockTimer());
  }

  _resetGesture = ({ clearTapBlock = true } = {}) => {
    if (this._getGesture?.()?.stage) {
      this.destroyGestureStage();
    }
    this._setGesture?.(null);
    if (clearTapBlock) this._setTapBlocked?.(false);
    this._tracking = false;
    this._horizontal = false;
    this._direction = 0;
    this._deltaX = 0;
    this._deltaY = 0;
    if (
      this._pointerId != null &&
      this._browse?.hasPointerCapture?.(this._pointerId)
    ) {
      try {
        this._browse.releasePointerCapture(this._pointerId);
      } catch (_) {}
    }
    this._pointerId = null;
    if (this._browse) {
      this._browse.classList.remove("recordings-swipe");
      this._browse.style.transform = "";
    }
  };

  _ensureGestureStage(direction) {
    if (this._getGesture?.()?.direction === direction) return;
    this._setGesture?.(this.startGestureStage(direction) || null);
  }

  createStage(direction, incomingHtml) {
    const list = this._getList?.();
    if (!list) return null;
    const metrics = resolveRecordingsSwipeStageMetrics({
      list,
      lastRenderedListHtml: this._getLastRenderedListHtml?.() || "",
    });
    const stage = document.createElement("div");
    stage.className = "rec-swipe-stage";
    stage.style.minHeight = `${metrics.minHeight}px`;

    const current = document.createElement("div");
    current.className = "rec-swipe-pane current";
    current.innerHTML = metrics.currentHtml;

    const incoming = document.createElement("div");
    incoming.className = "rec-swipe-pane incoming";
    incoming.innerHTML = incomingHtml;

    stage.appendChild(current);
    stage.appendChild(incoming);
    list.classList.add("recordings-swipe-active");
    list.innerHTML = "";
    list.appendChild(stage);

    const state = {
      list,
      stage,
      current,
      incoming,
      direction,
      width: metrics.width,
      offset: 0,
    };
    this.setStageOffset(state, 0);
    return state;
  }

  setStageOffset(state, offset, transition = "") {
    if (!state) return;
    state.offset = offset;
    state.current.style.transition = transition;
    state.incoming.style.transition = transition;
    const transforms = resolveRecordingsSwipeStageTransforms({
      offset,
      direction: state.direction,
      width: state.width,
    });
    state.current.style.transform = transforms.currentTransform;
    state.incoming.style.transform = transforms.incomingTransform;
  }

  animateStageTo(
    state,
    offset,
    duration = 260,
    easing = "cubic-bezier(0.18, 0.5, 0.2, 1)",
  ) {
    if (!state) return Promise.resolve();
    return new Promise((resolve) => {
      void state.stage?.getBoundingClientRect?.();
      void state.current?.offsetWidth;
      const transition = `transform ${duration}ms ${easing}`;
      this.setStageOffset(state, offset, transition);
      setTimeout(resolve, duration + 16);
    });
  }

  destroyGestureStage() {
    const state = this._getGesture?.()?.stage;
    if (!state?.list) return;
    this._clearListState?.(state.list);
    this._setLastRenderedListHtml?.("");
    this._renderList?.();
  }

  startGestureStage(direction) {
    const stage = this.createStage(direction, RECORDINGS_SWIPE_LOADING_HTML);
    const gesture = createRecordingsSwipeGestureState(direction, stage);
    gesture.prepPromise = (async () => {
      try {
        const prep = await this._prepareDayTransition?.(direction);
        Object.assign(
          gesture,
          resolvePreparedRecordingsSwipeState({
            prep,
            renderRecordings: (recordings) =>
              this._renderRecordings?.(recordings) || "",
          }),
        );
        if (gesture.stage?.incoming) {
          gesture.stage.incoming.classList.remove("loading");
          gesture.stage.incoming.innerHTML = gesture.incomingHtml;
        }
      } catch (_) {
        Object.assign(gesture, resolveFailedRecordingsSwipeState());
        if (gesture.stage?.incoming) {
          gesture.stage.incoming.classList.remove("loading");
          gesture.stage.incoming.innerHTML = RECORDINGS_SWIPE_EMPTY_HTML;
        }
      }
    })();
    if (gesture.stage?.incoming) {
      gesture.stage.incoming.classList.add("loading");
    }
    return gesture;
  }

  _startGesture(clientX, clientY) {
    this._startX = clientX;
    this._startY = clientY;
    this._deltaX = 0;
    this._deltaY = 0;
    this._tracking = true;
    this._horizontal = false;
    this._direction = 0;
    this._setTapBlocked?.(false);
  }

  _moveGesture(clientX, clientY, event) {
    if (!this._tracking || !this._canSwipe()) return;
    this._deltaX = clientX - this._startX;
    this._deltaY = clientY - this._startY;
    const absX = Math.abs(this._deltaX);
    const absY = Math.abs(this._deltaY);

    if (!this._horizontal) {
      if (absX < this._axisLockThreshold && absY < this._axisLockThreshold) {
        return;
      }
      if (absY >= this._axisLockThreshold && absY > absX) {
        this._resetGesture();
        return;
      }
      if (absX < this._axisLockThreshold || absX <= absY * 1.15) return;
      this._horizontal = true;
      this._browse.classList.add("recordings-swipe");
      if (
        this._pointerId != null &&
        !this._browse.hasPointerCapture?.(this._pointerId)
      ) {
        try {
          this._browse.setPointerCapture(this._pointerId);
        } catch (_) {}
      }
    }

    event.preventDefault?.();
    this._direction = this._deltaX < 0 ? 1 : -1;
    if (absX >= 3) this._setTapBlocked?.(true);
    this._ensureGestureStage(this._direction);

    const stage = this._getGesture?.()?.stage;
    if (!stage) return;
    const max = stage.width;
    const x = Math.max(-max, Math.min(max, this._deltaX));
    const clampedAbsX = Math.abs(x);
    const followFactor = clampedAbsX < 60 ? 1 : this._dragFollowFactor;
    const follow = Math.sign(x) * Math.min(clampedAbsX * followFactor, max);
    this.setStageOffset(stage, follow);
  }

  _finishSwipe = async () => {
    if (!this._tracking) return;
    const absX = Math.abs(this._deltaX);
    const absY = Math.abs(this._deltaY);
    const direction = this._direction;
    const gesture = this._getGesture?.();
    const stage = gesture?.stage;

    this._tracking = false;
    this._pointerId = null;
    this._browse.classList.remove("recordings-swipe");
    this._browse.style.transform = "";

    if (!this._horizontal || !stage || !gesture || !direction || absX <= absY) {
      this._resetGesture();
      return;
    }

    const threshold = Math.max(34, stage.width * 0.12);
    if (absX < threshold) {
      await this.animateStageTo(
        stage,
        0,
        140,
        "cubic-bezier(0.16, 0.64, 0.2, 1)",
      );
      if (this._disposed) return;
      this._resetGesture({ clearTapBlock: false });
      return;
    }

    const moved = await this._completeGesture?.(gesture);
    if (this._disposed) return;
    if (!moved) {
      await this.animateStageTo(
        stage,
        0,
        150,
        "cubic-bezier(0.16, 0.64, 0.2, 1)",
      );
      if (this._disposed) return;
      this._bounceArea?.(direction);
    }
    this._scheduleTapBlockClear();
    this._resetGesture({ clearTapBlock: false });
  };

  _onPointerDown = (event) => {
    if (!this._canSwipe()) return;
    if (event.pointerType === "mouse" && event.button !== 0) return;
    if (this._pointerId != null) return;
    this._pointerId = event.pointerId;
    this._startGesture(event.clientX, event.clientY);
  };

  _onPointerMove = (event) => {
    if (event.pointerId !== this._pointerId) return;
    this._moveGesture(event.clientX, event.clientY, event);
  };

  _onPointerUp = (event) => {
    if (event.pointerId !== this._pointerId) return;
    void this._finishSwipe();
  };

  _onPointerCancel = () => {
    this._resetGesture();
  };
}
