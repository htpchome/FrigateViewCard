import { cameraMemberEntities } from "../camera-groups/model.js";

const DEEP_LINK_KEYS = new Set([
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

const DEEP_LINK_TARGET_KEYS = [
  "event",
  "event_id",
  "frigate_event",
  "frigate_event_id",
  "review",
  "review_id",
  "frigate_review",
  "frigate_review_id",
];

const HASH_ROUTE_BRIDGE = Symbol.for(
  "frigate-view-card.deep-link-hash-route-bridge",
);
const PENDING_HASH_DEEP_LINK = Symbol.for(
  "frigate-view-card.pending-hash-deep-link",
);

const routeHref = (url) => `${url.origin}${url.pathname}${url.search}${url.hash}`;

const removeDeepLinkHashParams = (url) => {
  const rawHash = String(url.hash || "");
  const queryIndex = rawHash.indexOf("?");
  if (queryIndex < 0) return false;
  const hashPath = rawHash.slice(0, queryIndex);
  const hashQuery = new URLSearchParams(rawHash.slice(queryIndex + 1));
  let changed = false;
  for (const key of [...hashQuery.keys()]) {
    if (!DEEP_LINK_KEYS.has(key)) continue;
    hashQuery.delete(key);
    changed = true;
  }
  if (!changed) return false;
  const nextHashQuery = hashQuery.toString();
  url.hash = nextHashQuery ? `${hashPath}?${nextHashQuery}` : hashPath;
  return true;
};

const pendingHashDeepLinkParams = (windowRef) => {
  const pending = windowRef?.[PENDING_HASH_DEEP_LINK];
  if (!pending) return null;
  try {
    const currentUrl = new URL(windowRef.location.href);
    return routeHref(currentUrl) === pending.routeHref ? pending.params : null;
  } catch (_) {
    return null;
  }
};

export const normalizeDeepLinkHashRoute = (
  windowRef = globalThis.window,
) => {
  if (!windowRef?.location?.href) return false;
  try {
    const url = new URL(windowRef.location.href);
    const rawHash = String(url.hash || "");
    const queryIndex = rawHash.indexOf("?");
    if (queryIndex < 2) return false;
    const hashParams = new URLSearchParams(rawHash.slice(queryIndex + 1));
    const hasTarget = DEEP_LINK_TARGET_KEYS.some((key) =>
      String(hashParams.get(key) || "").trim(),
    );
    if (!hasTarget) return false;

    const pendingParams = new URLSearchParams();
    for (const [key, value] of hashParams.entries()) {
      if (DEEP_LINK_KEYS.has(key) && value !== "") {
        pendingParams.set(key, value);
      }
    }
    if (!removeDeepLinkHashParams(url)) return false;

    windowRef[PENDING_HASH_DEEP_LINK] = {
      params: pendingParams,
      routeHref: routeHref(url),
    };
    const nextUrl = `${url.pathname}${url.search}${url.hash}`;
    if (typeof windowRef.location.replace === "function") {
      windowRef.location.replace(nextUrl);
    } else {
      windowRef.history?.replaceState?.(
        windowRef.history.state,
        "",
        nextUrl,
      );
    }
    return true;
  } catch (_) {
    return false;
  }
};

export const installDeepLinkHashRouteBridge = (
  windowRef = globalThis.window,
) => {
  if (!windowRef?.addEventListener || windowRef[HASH_ROUTE_BRIDGE]) return;
  const syncHashRoute = () => normalizeDeepLinkHashRoute(windowRef);
  windowRef[HASH_ROUTE_BRIDGE] = syncHashRoute;
  for (const event of ["hashchange", "location-changed", "popstate"]) {
    windowRef.addEventListener(event, syncHashRoute);
  }
  syncHashRoute();
};

const mergePendingHashDeepLinkParams = (params, windowRef) => {
  const pendingParams = pendingHashDeepLinkParams(windowRef);
  if (!pendingParams) return params;
  for (const [key, value] of pendingParams.entries()) {
    if (value !== "") params.set(key, value);
  }
  return params;
};

const clearPendingHashDeepLinkParams = (windowRef) => {
  if (windowRef?.[PENDING_HASH_DEEP_LINK]) {
    delete windowRef[PENDING_HASH_DEEP_LINK];
  }
};

const normalizeCameraHintToken = (value) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/^camera\./, "")
    .replace(/[^a-z0-9]+/g, "");

export class DeepLinkController {
  constructor(host) {
    this._host = host;
    this._onNavigation = () => this.handleNavigation();
    this._navigationPath = null;
    this._pendingNavigationUrl = null;
  }

  connect() {
    if (
      typeof window === "undefined" ||
      !this._host._started ||
      !this._host.isConnected
    ) {
      return;
    }
    if (this._navigationPath === null) {
      this._navigationPath = window.location.pathname;
      for (const event of ["location-changed", "popstate", "hashchange"]) {
        window.addEventListener(event, this._onNavigation);
      }
    }
    this.handleNavigation();
  }

  disconnect() {
    if (typeof window !== "undefined") {
      for (const event of ["location-changed", "popstate", "hashchange"]) {
        window.removeEventListener(event, this._onNavigation);
      }
    }
    this._navigationPath = null;
    this._pendingNavigationUrl = null;
  }

  handleNavigation() {
    if (
      typeof window === "undefined" ||
      !this._host._started ||
      !this._host.isConnected ||
      !this.isDeepLinkHandlingEnabled() ||
      window.location.pathname !== this._navigationPath
    ) {
      return;
    }
    const params = this.mergedUrlSearchParams();
    const hasTarget = DEEP_LINK_TARGET_KEYS.some((key) =>
      String(params.get(key) || "").trim(),
    );
    if (!hasTarget || this._pendingNavigationUrl === window.location.href) {
      return;
    }

    this.initDeepLinkFromUrl();
    if (!this.isDeepLinkCandidateForCard()) return;
    if (this.activatePendingHashRoute()) return;
    const navigationUrl = window.location.href;
    this._pendingNavigationUrl = navigationUrl;
    void this._handlePendingNavigation(navigationUrl);
  }

  _isPendingNavigation(navigationUrl) {
    return (
      this._pendingNavigationUrl === navigationUrl &&
      this._host.isConnected &&
      window.location.href === navigationUrl
    );
  }

  _consumePendingNavigationTarget() {
    let cameraChanged = false;
    for (let attempt = 0; attempt < 2; attempt += 1) {
      const previousCameraIndex = this._host._activeCamIdx;
      const previousMemberOverride =
        this._host._activeGroupMemberOverride || "";
      this.consumeDeepLinkReviewOpen({ skipCameraBrowseLoad: true });
      this.consumeDeepLinkEventOpen({ skipCameraBrowseLoad: true });
      const changed =
        previousCameraIndex !== this._host._activeCamIdx ||
        previousMemberOverride !==
          (this._host._activeGroupMemberOverride || "");
      cameraChanged ||= changed;
      if (this._host._deepLinkApplied || !changed) break;
    }
    return cameraChanged;
  }

  async _handlePendingNavigation(navigationUrl) {
    const loader = this._host._browseWindowLoaderController;
    let cameraChanged = false;
    try {
      const cameraTarget = await this.resolveDeepLinkCameraTarget({
        lookupEvent: true,
      });
      if (
        cameraTarget &&
        (cameraTarget.index !== this._host._activeCamIdx ||
          cameraTarget.memberEntity !==
            (this._host._activeGroupMemberOverride || ""))
      ) {
        await this._host._switchCamera(cameraTarget.index, {
          skipBrowseLoad: true,
          ...(cameraTarget.memberEntity
            ? { groupMemberEntity: cameraTarget.memberEntity }
            : {}),
        });
        cameraChanged = true;
      }
      if (!this._isPendingNavigation(navigationUrl)) return;

      cameraChanged =
        this._consumePendingNavigationTarget() || cameraChanged;
      if (this._host._deepLinkApplied) {
        if (cameraChanged) {
          void loader?.loadWindow?.(true, {
            supersede: true,
            reuseRecentCache: true,
          });
        }
        return;
      }

      loader?.invalidateActiveWindowCaches?.();
      await loader?.loadWindow?.(true, { supersede: true });
      if (!this._isPendingNavigation(navigationUrl)) return;
      this._consumePendingNavigationTarget();
    } catch (_) {
      // Keep navigation failures isolated from the mounted card lifecycle.
    } finally {
      if (
        this._pendingNavigationUrl === navigationUrl &&
        !this._host._deepLinkApplied
      ) {
        this._pendingNavigationUrl = null;
      }
    }
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
    return mergePendingHashDeepLinkParams(params, window);
  }

  _removeDeepLinkHashParams(url) {
    return removeDeepLinkHashParams(url);
  }

  activatePendingHashRoute() {
    if (!this.hasPendingDeepLinkTarget()) return false;
    if (normalizeDeepLinkHashRoute(window)) {
      this._pendingNavigationUrl = null;
      return true;
    }
    return false;
  }

  clearDeepLinkParamsFromUrl() {
    if (!this.isDeepLinkHandlingEnabled()) return;
    try {
      const url = new URL(window.location.href);
      for (const key of [...url.searchParams.keys()]) {
        if (DEEP_LINK_KEYS.has(key)) url.searchParams.delete(key);
      }
      this._removeDeepLinkHashParams(url);
      const nextUrl = `${url.pathname}${url.search}${url.hash}`;
      window.history.replaceState(window.history.state, "", nextUrl);
      clearPendingHashDeepLinkParams(window);
      this._pendingNavigationUrl = null;
    } catch (_) {}
  }

  initDeepLinkFromUrl() {
    const params = this.mergedUrlSearchParams();
    const eventId = String(
      params.get("event") ||
        params.get("event_id") ||
        params.get("frigate_event") ||
        params.get("frigate_event_id") ||
        "",
    ).trim();
    const reviewId = String(
      params.get("review") ||
        params.get("review_id") ||
        params.get("frigate_review") ||
        params.get("frigate_review_id") ||
        "",
    ).trim();
    const cameraHint = String(
      params.get("camera") ||
        params.get("cam") ||
        params.get("camera_entity") ||
        "",
    )
      .trim()
      .toLowerCase();
    const mediaHint = String(
      params.get("media") || params.get("view") || params.get("open") || "",
    )
      .trim()
      .toLowerCase();
    this._host._deepLinkEventId = eventId;
    this._host._deepLinkReviewId = reviewId;
    this._host._deepLinkMediaHint = String(mediaHint || "")
      .trim()
      .toLowerCase();
    this._host._deepLinkCameraHint = eventId || reviewId ? cameraHint : "";
    this._host._deepLinkApplied = false;
    this._host._deepLinkEventLookupTried = false;
    this._host._deepLinkReviewLookupTried = false;
  }

  deepLinkCameraHintIndex() {
    return this.deepLinkCameraHintTarget()?.index ?? -1;
  }

  _cameraTargetForToken(value, { includeLogicalName = true } = {}) {
    const normalizedValue = normalizeCameraHintToken(value);
    if (!normalizedValue) return null;
    for (let index = 0; index < this._host._config.cameras.length; index += 1) {
      const camera = this._host._config.cameras[index];
      if (
        includeLogicalName &&
        normalizeCameraHintToken(camera.name) === normalizedValue
      ) {
        return { index, memberEntity: "" };
      }
      const memberEntities = cameraMemberEntities(camera);
      for (const entity of memberEntities) {
        const matchesMember = [
          entity,
          this._host._camCache[entity]?.cam,
        ].some(
          (token) => normalizeCameraHintToken(token) === normalizedValue,
        );
        if (matchesMember) {
          return {
            index,
            memberEntity: memberEntities.length > 1 ? entity : "",
          };
        }
      }
    }
    return null;
  }

  deepLinkCameraHintTarget() {
    if (!this._host._deepLinkCameraHint) return null;
    return this._cameraTargetForToken(this._host._deepLinkCameraHint);
  }

  _eventCameraIndex(event) {
    return this._eventCameraTarget(event)?.index ?? -1;
  }

  _eventCameraTarget(event) {
    return this._cameraTargetForToken(event?.camera, {
      includeLogicalName: false,
    });
  }

  async resolveDeepLinkCameraTarget({ lookupEvent = false } = {}) {
    const hintedCameraTarget = this.deepLinkCameraHintTarget();
    if (hintedCameraTarget) return hintedCameraTarget;
    if (!this._host._deepLinkEventId) return null;

    let event = this._host._findEventById?.(
      this._host._deepLinkEventId,
    );
    if (!event && lookupEvent) {
      event = await this._host._browseWindowLoaderController
        ?.findAndCacheDeepLinkEvent?.(this._host._deepLinkEventId);
    }
    return this._eventCameraTarget(event);
  }

  async resolveDeepLinkCameraIndex(options = {}) {
    return (await this.resolveDeepLinkCameraTarget(options))?.index ?? -1;
  }

  async prepareStartupCameraTarget() {
    if (!this.hasPendingDeepLinkTarget()) return -1;
    this.activatePendingHashRoute();
    const target = await this.resolveDeepLinkCameraTarget({
      lookupEvent: true,
    });
    if (!target) return -1;
    this._host._activeCamIdx = target.index;
    this._host._activeGroupMemberOverride = target.memberEntity;
    return target.index;
  }

  applyDeepLinkCameraHint() {
    if (!this._host._deepLinkCameraHint) return;
    const target = this.deepLinkCameraHintTarget();
    if (!target) return;
    this._host._activeCamIdx = target.index;
    this._host._activeGroupMemberOverride = target.memberEntity;
  }

  isDeepLinkCandidateForCard() {
    if (!this.isDeepLinkHandlingEnabled()) return false;
    if (!this._host._deepLinkCameraHint) return true;
    return this.deepLinkCameraHintIndex() >= 0;
  }

  _openResolvedEvent(event) {
    if (
      this._host._cardViewPageController?.openDeepLinkEvent?.(event, {
        mediaHint: this._host._deepLinkMediaHint,
      })
    ) {
      return true;
    }

    const loader = this._host._popupMediaLoaderController;
    const useSnapshot =
      this._host._deepLinkMediaHint === "snapshot" || !event.has_clip;
    if (useSnapshot) {
      if (typeof loader?.showSnapshot === "function") {
        loader.showSnapshot(event);
        return true;
      }
      if (typeof this._host._showSnapshot === "function") {
        this._host._showSnapshot(event);
        return true;
      }
      return false;
    }

    if (typeof loader?.showClip === "function") {
      loader.showClip(event, { mediaType: "clip" });
      return true;
    }
    if (typeof this._host._showClip === "function") {
      this._host._showClip(event, { mediaType: "clip" });
      return true;
    }
    return false;
  }

  consumeDeepLinkEventOpen({ skipCameraBrowseLoad = false } = {}) {
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

    if (event?.camera) {
      const target = this._eventCameraTarget(event);
      if (
        target &&
        (target.index !== this._host._activeCamIdx ||
          target.memberEntity !==
            (this._host._activeGroupMemberOverride || ""))
      ) {
        if (skipCameraBrowseLoad) {
          this._host._switchCamera(target.index, {
            skipBrowseLoad: true,
            ...(target.memberEntity
              ? { groupMemberEntity: target.memberEntity }
              : {}),
          });
        } else {
          this._host._switchCamera(target.index, {
            ...(target.memberEntity
              ? { groupMemberEntity: target.memberEntity }
              : {}),
          });
        }
        return;
      }
    }

    try {
      if (!this._openResolvedEvent(event)) return;
    } catch (_) {
      // Leave the target pending so startup or the window reload can retry it.
      return;
    }
    this._host._deepLinkApplied = true;
    this.clearDeepLinkParamsFromUrl();
  }

  consumeDeepLinkReviewOpen({ skipCameraBrowseLoad = false } = {}) {
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
      this.consumeDeepLinkEventOpen({ skipCameraBrowseLoad });
      return;
    }

    if (this._host._deepLinkReviewLookupTried) return;
    this._host._deepLinkReviewLookupTried = true;
    void this._host
      ._loadReviews()
      .catch(() => {})
      .finally(() => {
        this.consumeDeepLinkReviewOpen({ skipCameraBrowseLoad });
        this.consumeDeepLinkEventOpen({ skipCameraBrowseLoad });
      });
  }

  hasPendingDeepLinkTarget() {
    if (!this.isDeepLinkCandidateForCard()) return false;
    return this.hasParsedDeepLinkTarget();
  }

  hasParsedDeepLinkTarget() {
    if (!this.isDeepLinkHandlingEnabled()) return false;
    return !!(this._host._deepLinkEventId || this._host._deepLinkReviewId);
  }
}
