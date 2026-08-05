import { test } from "node:test";
import assert from "node:assert/strict";

import { EditorPreviewContextController } from "../src/features/editor-preview/context.ctrl.js";

const withGlobals = (overrides, fn) => {
  const originalWindow = global.window;
  const originalDocument = global.document;
  const originalMutationObserver = global.MutationObserver;
  global.window = overrides.window;
  global.document = overrides.document;
  global.MutationObserver = overrides.MutationObserver;
  try {
    fn();
  } finally {
    global.window = originalWindow;
    global.document = originalDocument;
    global.MutationObserver = originalMutationObserver;
  }
};

const makeNode = (tagName, options = {}) => ({
  tagName,
  parentNode: options.parentNode || null,
  host: options.host || null,
  getRootNode: options.getRootNode || (() => ({ host: null })),
});

test("isEditorPreviewContext walks through shadow hosts", () => {
  const preview = makeNode("HUI-CARD-PREVIEW");
  const wrapper = makeNode("DIV", { parentNode: preview });
  const host = makeNode("FRIGATE-VIEW-CARD", {
    getRootNode: () => ({ host: wrapper }),
  });
  const controller = new EditorPreviewContextController(host);

  assert.equal(controller.isEditorPreviewContext(), true);
  assert.equal(controller.isPreviewContext(), true);
});

test("isCardPickerPreviewContext detects card picker hosts", () => {
  const picker = makeNode("HUI-CARD-PICKER");
  const host = makeNode("FRIGATE-VIEW-CARD", { parentNode: picker });
  const controller = new EditorPreviewContextController(host);

  assert.equal(controller.isCardPickerPreviewContext(), true);
  assert.equal(controller.isPreviewContext(), true);
});

test("isDashboardEditMode reads lovelace edit query flags", () => {
  const controller = new EditorPreviewContextController({});

  withGlobals(
    {
      window: {
        location: {
          href: "https://example.test/lovelace/test?dashboard_edit=true",
          origin: "https://example.test",
        },
      },
      document: { querySelector: () => null, body: null },
      MutationObserver: class {},
    },
    () => {
      assert.equal(controller.isDashboardEditMode(), true);
    },
  );
});

test("syncHassPreviewContext resumes live on preview exit", () => {
  const calls = [];
  const controller = new EditorPreviewContextController({
    _scheduleResumeLive: (reason) => calls.push(reason),
  });
  const states = [true, false];
  controller.isEditorPreviewContext = () => states.shift();

  assert.equal(controller.syncHassPreviewContext(), true);
  assert.equal(controller.syncHassPreviewContext(), false);
  assert.deepEqual(calls, ["hass-edit-exit"]);
});

test("startEditModeWatchdog resumes and kicks when state changes", () => {
  const calls = [];
  const timers = [];
  const originalSetInterval = global.setInterval;
  const originalClearInterval = global.clearInterval;
  global.setInterval = (fn) => {
    timers.push(fn);
    return fn;
  };
  global.clearInterval = () => {};
  try {
    const controller = new EditorPreviewContextController({
      isConnected: true,
      _scheduleResumeLive: (reason) => calls.push(["resume", reason]),
      _kickLiveIfStale: (force) => calls.push(["kick", force]),
    });
    const previewStates = [true, false];
    const dialogStates = [true, false];
    const dashboardStates = [false, true];
    controller.isEditorPreviewContext = () => previewStates.shift();
    controller.isCardEditorDialogOpen = () => dialogStates.shift();
    controller.isDashboardEditMode = () => dashboardStates.shift();

    controller.startEditModeWatchdog();
    timers[0]();

    assert.deepEqual(calls, [
      ["resume", "watchdog-dialog-close"],
      ["resume", "watchdog-edit-exit"],
      ["resume", "watchdog-dashboard-edit-on"],
      ["kick", true],
    ]);
  } finally {
    global.setInterval = originalSetInterval;
    global.clearInterval = originalClearInterval;
  }
});

test("startEditorDialogCloseObserver resumes when the dialog closes", () => {
  const calls = [];
  let observerCallback = null;
  class FakeMutationObserver {
    constructor(callback) {
      observerCallback = callback;
    }

    observe() {}

    disconnect() {}
  }

  const controller = new EditorPreviewContextController({
    _scheduleResumeLive: (reason) => calls.push(reason),
  });
  const dialogStates = [true, false];
  controller.isCardEditorDialogOpen = () => dialogStates.shift();

  withGlobals(
    {
      window: {
        MutationObserver: FakeMutationObserver,
        getComputedStyle: () => ({ display: "block", visibility: "visible" }),
      },
      document: {
        body: {},
        querySelector: () => null,
      },
      MutationObserver: FakeMutationObserver,
    },
    () => {
      controller.startEditorDialogCloseObserver();
      observerCallback();
    },
  );

  assert.deepEqual(calls, ["card-editor-close"]);
});
