import {
  resolveRecordingsSwipeStageMetrics,
  resolveRecordingsSwipeStageTransforms,
} from "./utils/swipe.js";

export class RecordingsSwipeController {
  constructor({
    browse,
    getList,
    getLastRenderedListHtml,
  }) {
    this._browse = browse;
    this._getList = getList;
    this._getLastRenderedListHtml = getLastRenderedListHtml;
    this._disposed = false;
  }

  dispose() {
    if (this._disposed) return;
    this._disposed = true;
    this.clearListState();
    this._browse?.classList?.remove("swipe-bounce-prev", "swipe-bounce-next");
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

  clearListState(list = null) {
    const targetList = list || this._getList?.();
    targetList?.classList?.remove("recordings-swipe-active");
  }

  bounceArea(direction) {
    if (!this._browse) return;
    const cls = direction > 0 ? "swipe-bounce-next" : "swipe-bounce-prev";
    this._browse.classList.remove("swipe-bounce-prev", "swipe-bounce-next");
    void this._browse.offsetWidth;
    this._browse.classList.add(cls);
    setTimeout(() => {
      this._browse?.classList.remove(cls);
    }, 280);
  }
}
