import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const source = fs.readFileSync(
  new URL("../frigate-view-card.js", import.meta.url),
  "utf8",
);

test("no legacy var declarations remain", () => {
  assert.equal(/\bvar\s+[A-Za-z_$]/.test(source), false);
});

test("no .then chains remain after async/await refactor", () => {
  assert.equal(/\.then\(/.test(source), false);
});

test("event list thumbnails use browser lazy loading", () => {
  assert.equal((source.match(/loading="lazy"/g) || []).length >= 3, true);
});

test("window loads use loading-state guard", () => {
  assert.equal(/if \(this\._loading\) return;/.test(source), true);
  assert.equal(/this\._loading = true;/.test(source), true);
});

test("startup resolves initial page through the navigation factory", () => {
  const initialLoadIndex = source.indexOf(
    "const initialLoad = this._loadWindow(true);",
  );
  const landingPageIndex = source.indexOf(
    'this._navigateToConfiguredLandingPage({\n      source: "startup",\n      startup: true,\n      startInGrid,\n      hasPendingDeepLinkTarget: this._hasPendingDeepLinkTarget()\n    });',
  );
  const awaitIndex = source.indexOf("await initialLoad;", landingPageIndex);

  assert.ok(initialLoadIndex >= 0);
  assert.ok(landingPageIndex > initialLoadIndex);
  assert.ok(awaitIndex > landingPageIndex);
});

test("deep-link helpers delegate through the controller wrappers", () => {
  assert.equal(
    source.includes(
      "_mergedUrlSearchParams() {\n    return this._deepLinkController.mergedUrlSearchParams();\n  }",
    ),
    true,
  );
  assert.equal(
    source.includes(
      "_clearDeepLinkParamsFromUrl() {\n    this._deepLinkController.clearDeepLinkParamsFromUrl();\n  }",
    ),
    true,
  );
  assert.equal(
    source.includes(
      "_initDeepLinkFromUrl() {\n    this._deepLinkController.initDeepLinkFromUrl();\n  }",
    ),
    true,
  );
  assert.equal(
    source.includes(
      "_deepLinkCameraHintIndex() {\n    return this._deepLinkController.deepLinkCameraHintIndex();\n  }",
    ),
    true,
  );
  assert.equal(
    source.includes(
      "_applyDeepLinkCameraHint() {\n    this._deepLinkController.applyDeepLinkCameraHint();\n  }",
    ),
    true,
  );
  assert.equal(
    source.includes(
      "_isDeepLinkCandidateForCard() {\n    return this._deepLinkController.isDeepLinkCandidateForCard();\n  }",
    ),
    true,
  );
  assert.equal(
    source.includes(
      "_consumeDeepLinkEventOpen() {\n    this._deepLinkController.consumeDeepLinkEventOpen();\n  }",
    ),
    true,
  );
  assert.equal(
    source.includes(
      "_consumeDeepLinkReviewOpen() {\n    this._deepLinkController.consumeDeepLinkReviewOpen();\n  }",
    ),
    true,
  );
  assert.equal(
    source.includes(
      "_hasPendingDeepLinkTarget() {\n    return this._deepLinkController.hasPendingDeepLinkTarget();\n  }",
    ),
    true,
  );
  assert.equal(
    source.includes(
      "_isDeepLinkHandlingEnabled() {\n    return this._deepLinkController.isDeepLinkHandlingEnabled();\n  }",
    ),
    true,
  );
});

test("single-view helpers delegate through the controller wrappers", () => {
  assert.equal(
    source.includes(
      "_activateSingleViewPageRoute(context = {}) {\n    this._singleViewPageController.activateSingleViewPageRoute(context);\n  }",
    ),
    true,
  );
  assert.equal(
    source.includes(
      "_activateWideViewPageRoute(context = {}) {\n    this._singleViewPageController.activateWideViewPageRoute(context);\n  }",
    ),
    true,
  );
  assert.equal(
    source.includes(
      "_syncColHeightIfWideView() {\n    this._singleViewPageController.syncColHeightIfWideView();\n  }",
    ),
    true,
  );
  assert.equal(
    source.includes(
      "_wideViewLayoutState() {\n    return this._singleViewPageController.wideViewLayoutState(\n      this._config?.col_left_width_pct\n    );\n  }",
    ),
    true,
  );
});

test("preview helpers delegate through the preview page controller", () => {
  assert.equal(
    source.includes(
      "_isPreviewPageEnabled() {\n    return this._previewPageController.isPreviewPageEnabled();\n  }",
    ),
    true,
  );
  assert.equal(
    source.includes(
      "_isPreviewPageActive() {\n    return this._previewPageController.isPreviewPageActive();\n  }",
    ),
    true,
  );
  assert.equal(
    source.includes(
      "_previewLiveCamerasEnabled() {\n    return this._previewPageController.previewLiveCamerasEnabled();\n  }",
    ),
    true,
  );
  assert.equal(
    source.includes(
      "_previewShowTitleBarsEnabled() {\n    return this._previewPageController.previewShowTitleBarsEnabled();\n  }",
    ),
    true,
  );
  assert.equal(
    source.includes(
      "_previewCellSeverity(entity) {\n    return this._previewPageController.previewCellSeverity(entity);\n  }",
    ),
    true,
  );
  assert.equal(
    source.includes(
      "_applyPreviewShellVisibility() {\n    this._previewPageController.applyPreviewShellVisibility();\n  }",
    ),
    true,
  );
  assert.equal(
    source.includes(
      "_previewShouldUseLive(entity) {\n    return this._previewPageController.previewShouldUseLive(entity);\n  }",
    ),
    true,
  );
  assert.equal(
    source.includes(
      "_previewEventsCount(entity) {\n    return this._previewPageController.previewEventsCount(entity);\n  }",
    ),
    true,
  );
  assert.equal(
    source.includes(
      "_previewLiveStreamHint() {\n    return this._previewPageController.previewLiveStreamHint();\n  }",
    ),
    true,
  );
  assert.equal(
    /_previewStreamSourceLabel\(entity, useLive\) \{\s*return this\._previewPageController\.previewStreamSourceLabel\(\s*entity,\s*useLive\s*\);\s*\}/s.test(
      source,
    ),
    true,
  );
});
