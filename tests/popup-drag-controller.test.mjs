import { test } from "node:test";
import assert from "node:assert/strict";

import { PopupDragController } from "../src/features/popup/drag.ctrl.js";

function createEventTargetLike() {
  const listeners = new Map();

  return {
    addEventListener(type, listener, options = {}) {
      if (!listeners.has(type)) listeners.set(type, new Set());
      listeners.get(type).add(listener);
      options.signal?.addEventListener(
        "abort",
        () => {
          this.removeEventListener(type, listener);
        },
        { once: true },
      );
    },
    removeEventListener(type, listener) {
      listeners.get(type)?.delete(listener);
    },
    dispatch(type, event) {
      for (const listener of [...(listeners.get(type) || [])]) {
        listener(event);
      }
    },
  };
}

function createPopup() {
  const listeners = new Map();
  const classes = new Set(["is-open"]);

  return {
    style: { transition: "", transform: "" },
    classList: {
      contains: (token) => classes.has(token),
      add: (...tokens) => tokens.forEach((token) => classes.add(token)),
      remove: (...tokens) => tokens.forEach((token) => classes.delete(token)),
    },
    addEventListener(type, listener, options = {}) {
      if (!listeners.has(type)) listeners.set(type, new Set());
      listeners.get(type).add(listener);
      options.signal?.addEventListener(
        "abort",
        () => {
          this.removeEventListener(type, listener);
        },
        { once: true },
      );
    },
    removeEventListener(type, listener) {
      listeners.get(type)?.delete(listener);
    },
    dispatch(type, event) {
      for (const listener of [...(listeners.get(type) || [])]) {
        listener(event);
      }
    },
  };
}

test("PopupDragController closes popup when drag exceeds threshold", () => {
  const popup = createPopup();
  const documentTarget = createEventTargetLike();
  let closed = 0;

  const controller = new PopupDragController({
    popup,
    eventTarget: documentTarget,
    closePopup: () => {
      closed += 1;
    },
    isPopupOpen: () => true,
  });

  controller.bind();

  popup.dispatch("mousedown", {
    clientY: 10,
    target: { closest: () => null },
  });
  documentTarget.dispatch("mousemove", {
    clientY: 140,
  });
  documentTarget.dispatch("mouseup", {});

  assert.equal(closed, 1);
  assert.equal(popup.style.transition, "");
});

test("PopupDragController ignores drag starts from interactive popup controls", () => {
  const popup = createPopup();
  const documentTarget = createEventTargetLike();
  let closed = 0;

  const controller = new PopupDragController({
    popup,
    eventTarget: documentTarget,
    closePopup: () => {
      closed += 1;
    },
    isPopupOpen: () => true,
  });

  controller.bind();

  popup.dispatch("mousedown", {
    clientY: 10,
    target: { closest: () => ({}) },
  });
  documentTarget.dispatch("mousemove", {
    clientY: 180,
  });
  documentTarget.dispatch("mouseup", {});

  assert.equal(closed, 0);
  assert.equal(popup.style.transform, "");
});

test("PopupDragController removes listeners on dispose", () => {
  const popup = createPopup();
  const documentTarget = createEventTargetLike();
  let closed = 0;

  const controller = new PopupDragController({
    popup,
    eventTarget: documentTarget,
    closePopup: () => {
      closed += 1;
    },
    isPopupOpen: () => true,
  });

  controller.bind();
  controller.dispose();

  popup.dispatch("mousedown", {
    clientY: 10,
    target: { closest: () => null },
  });
  documentTarget.dispatch("mousemove", {
    clientY: 180,
  });
  documentTarget.dispatch("mouseup", {});

  assert.equal(closed, 0);
});
