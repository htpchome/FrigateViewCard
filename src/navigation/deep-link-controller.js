export class DeepLinkController {
  constructor(host) {
    this._host = host;
  }

  isDeepLinkHandlingEnabled() {
    return this._host._config?.deep_link_enabled !== false;
  }

  mergedUrlSearchParams() {
    const params = new URLSearchParams(window.location?.search || "");
    const hash = String(window.location?.hash || "");
    const queryIndex = hash.indexOf("?");
    if (queryIndex >= 0) {
      const hashParams = new URLSearchParams(hash.slice(queryIndex + 1));
      for (const [key, value] of hashParams.entries()) {
        if (value != null && value !== "") params.set(key, value);
      }
    }
    return params;
  }

  clearDeepLinkParamsFromUrl() {
    if (!this.isDeepLinkHandlingEnabled()) return;
    const deepLinkKeys = new Set([
      "event",
      "event_id",
      "frigate_event",
      "frigate_event_id",
      "review",
      "review_id",
      "frigate_review",
      "frigate_review_id",
      "media",
      "view",
      "open",
      "camera",
      "cam",
      "camera_entity",
    ]);

    try {
      const url = new URL(window.location.href);
      for (const key of [...url.searchParams.keys()]) {
        if (deepLinkKeys.has(key)) url.searchParams.delete(key);
      }

      const rawHash = String(url.hash || "");
      const queryIndex = rawHash.indexOf("?");
      if (queryIndex >= 0) {
        const hashPath = rawHash.slice(0, queryIndex);
        const hashQuery = new URLSearchParams(rawHash.slice(queryIndex + 1));
        for (const key of [...hashQuery.keys()]) {
          if (deepLinkKeys.has(key)) hashQuery.delete(key);
        }
        const nextHashQuery = hashQuery.toString();
        url.hash = nextHashQuery ? `${hashPath}?${nextHashQuery}` : hashPath;
      }

      const nextUrl = `${url.pathname}${url.search}${url.hash}`;
      window.history.replaceState(window.history.state, "", nextUrl);
    } catch (_) {}
  }

  initDeepLinkFromUrl() {
    const params = this.mergedUrlSearchParams();
    const eventId =
      params.get("event") ||
      params.get("event_id") ||
      params.get("frigate_event") ||
      params.get("frigate_event_id") ||
      "";
    const reviewId =
      params.get("review") ||
      params.get("review_id") ||
      params.get("frigate_review") ||
      params.get("frigate_review_id") ||
      "";
    const cameraHint =
      params.get("camera") ||
      params.get("cam") ||
      params.get("camera_entity") ||
      "";
    const mediaHint =
      params.get("media") || params.get("view") || params.get("open") || "";
    this._host._deepLinkEventId = String(eventId || "").trim();
    this._host._deepLinkReviewId = String(reviewId || "").trim();
    this._host._deepLinkMediaHint = String(mediaHint || "")
      .trim()
      .toLowerCase();
    this._host._deepLinkCameraHint = String(cameraHint || "")
      .trim()
      .toLowerCase();
    this._host._deepLinkApplied = false;
    this._host._deepLinkEventLookupTried = false;
    this._host._deepLinkReviewLookupTried = false;
  }

  deepLinkCameraHintIndex() {
    if (!this._host._deepLinkCameraHint) return -1;
    return this._host._config.cameras.findIndex((camera) => {
      const entity = String(camera.entity || "").toLowerCase();
      const name = String(camera.name || "").toLowerCase();
      const cacheCam = String(
        this._host._camCache[camera.entity]?.cam || "",
      ).toLowerCase();
      return (
        entity === this._host._deepLinkCameraHint ||
        name === this._host._deepLinkCameraHint ||
        cacheCam === this._host._deepLinkCameraHint
      );
    });
  }

  applyDeepLinkCameraHint() {
    if (!this._host._deepLinkCameraHint) return;
    const idx = this.deepLinkCameraHintIndex();
    if (idx >= 0) this._host._activeCamIdx = idx;
  }

  isDeepLinkCandidateForCard() {
    if (!this.isDeepLinkHandlingEnabled()) return false;
    if (!this._host._deepLinkCameraHint) return true;
    return this.deepLinkCameraHintIndex() >= 0;
  }

  consumeDeepLinkEventOpen() {
    if (!this.isDeepLinkHandlingEnabled()) return;
    if (!this.isDeepLinkCandidateForCard()) return;
    if (!this._host._deepLinkEventId || this._host._deepLinkApplied) return;
    const event = this._host._findEventById(this._host._deepLinkEventId);
    if (!event) {
      this._host._deepLinkEventLookupTried = true;
      this.consumeDeepLinkReviewOpen();
      return;
    }
    this._host._deepLinkEventLookupTried = true;

    const eventCam = String(event.camera || "").toLowerCase();
    if (eventCam) {
      const idx = this._host._config.cameras.findIndex((camera) => {
        const cacheCam = String(
          this._host._camCache[camera.entity]?.cam || "",
        ).toLowerCase();
        return cacheCam === eventCam;
      });
      if (idx >= 0 && idx !== this._host._activeCamIdx) {
        this._host._switchCamera(idx);
        return;
      }
    }

    this._host._deepLinkApplied = true;
    if (this._host._deepLinkMediaHint === "snapshot") {
      this._host._showSnapshot(event);
      this.clearDeepLinkParamsFromUrl();
      return;
    }
    if (this._host._deepLinkMediaHint === "clip" && event.has_clip) {
      this._host._showClip(event, { mediaType: "clip" });
      this.clearDeepLinkParamsFromUrl();
      return;
    }
    this._host._open(this._host._deepLinkEventId);
    this.clearDeepLinkParamsFromUrl();
  }

  consumeDeepLinkReviewOpen() {
    if (!this.isDeepLinkHandlingEnabled()) return;
    if (!this.isDeepLinkCandidateForCard()) return;
    if (this._host._deepLinkApplied) return;
    if (this._host._deepLinkEventId && !this._host._deepLinkEventLookupTried)
      return;
    if (!this._host._deepLinkReviewId) return;

    const review = (this._host._reviews || []).find(
      (item) => String(item?.id || "") === this._host._deepLinkReviewId,
    );
    const reviewEventId = String(review?.data?.detections?.[0] || "");
    if (reviewEventId) {
      this._host._deepLinkEventId = reviewEventId;
      this._host._deepLinkEventLookupTried = false;
      this.consumeDeepLinkEventOpen();
      return;
    }

    if (this._host._deepLinkReviewLookupTried) return;
    this._host._deepLinkReviewLookupTried = true;
    void this._host
      ._loadReviews()
      .catch(() => {})
      .finally(() => {
        this.consumeDeepLinkReviewOpen();
        this.consumeDeepLinkEventOpen();
      });
  }

  hasPendingDeepLinkTarget() {
    if (!this.isDeepLinkCandidateForCard()) return false;
    return !!(
      this._host._deepLinkEventId ||
      this._host._deepLinkReviewId ||
      this._host._deepLinkCameraHint
    );
  }
}
