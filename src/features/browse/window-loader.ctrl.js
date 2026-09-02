import {
  DAY,
  EVENT_FETCH_BATCH,
  INITIAL_BROWSE_PAINT_LIMIT,
  INACTIVE_WARM_EVENT_LIMIT,
  REVIEW_FETCH_BATCH,
  WARM_EVENT_PAGE_LIMIT,
  WINDOW_FETCH_PAGE_LIMIT,
} from "../../constants.js";
import { fetchWindowedItems } from "../../data/window-fetch.js";
import { buildRecordingsDayCacheKey } from "../recordings/utils/availability.js";
import { resolveRecordingsDayBounds } from "../recordings/utils/day.js";
import {
  cameraGroupMemberConfig,
  cameraMemberEntities,
  flattenCameraMembers,
  isCameraGroup,
} from "../camera-groups/model.js";
import { reviewMatchesAlertsOnlyMode } from "./filter-state.js";

const sharedBrowseRequestsByConnection = new WeakMap();

export class BrowseWindowLoaderController {
  constructor(host, deps = {}) {
    this._host = host;
    this._deps = {
      fetchWindowedItems,
      ...deps,
    };
    this._localBrowseRequests = new Map();
    this._activeGroupWindowPublish = null;
  }

  _activeGroupWindowPublishState() {
    const state = this._activeGroupWindowPublish;
    if (
      !state ||
      this._host._windowLoadToken !== state.loadToken ||
      !isCameraGroup(this._host._activeCam)
    ) {
      return null;
    }
    const activeMembers = this._activeGroupMembers().map(
      (member) => member.entity,
    );
    if (
      activeMembers.length !== state.memberEntities.length ||
      activeMembers.some(
        (entity, index) => entity !== state.memberEntities[index],
      )
    ) {
      return null;
    }
    return state;
  }

  _beginActiveGroupWindowPublish(loadToken) {
    const memberEntities = this._activeGroupMembers().map(
      (member) => member.entity,
    );
    this._activeGroupWindowPublish =
      memberEntities.length > 1
        ? {
            loadToken,
            memberEntities,
            publishing: new Set(),
            reviews: {
              firstPaint:
                !Array.isArray(this._host._reviews) ||
                this._host._reviews.length === 0,
              firstReady: new Set(),
              completeReady: new Set(),
              firstPublished: false,
              finalPublished: false,
            },
          }
        : null;
  }

  _isActiveGroupWindowPublishDeferred(key) {
    const state = this._activeGroupWindowPublishState();
    return (
      !!state &&
      (key === "events" || key === "reviews") &&
      !state.publishing.has(key)
    );
  }

  _publishCoordinatedActiveGroupCombined(key, options = {}) {
    const state = this._activeGroupWindowPublishState();
    if (!state) return false;
    state.publishing.add(key);
    try {
      return this.publishActiveGroupCombined(key, options);
    } finally {
      state.publishing.delete(key);
    }
  }

  _publishActiveGroupMemberUpdate(
    key,
    entity,
    { complete = false } = {},
  ) {
    const state = this._activeGroupWindowPublishState();
    if (
      !state ||
      (key !== "events" && key !== "reviews") ||
      !state.memberEntities.includes(entity)
    ) {
      return false;
    }
    if (key !== "reviews") return true;

    const reviews = state.reviews;
    reviews.firstReady.add(entity);
    if (complete) reviews.completeReady.add(entity);
    const allComplete = state.memberEntities.every((memberEntity) =>
      reviews.completeReady.has(memberEntity),
    );
    if (allComplete && !reviews.finalPublished) {
      reviews.finalPublished = true;
      this._publishCoordinatedActiveGroupCombined("reviews", {
        render: true,
      });
      return true;
    }

    const allFirstReady = state.memberEntities.every((memberEntity) =>
      reviews.firstReady.has(memberEntity),
    );
    if (
      reviews.firstPaint &&
      allFirstReady &&
      !reviews.firstPublished &&
      (this._mergeActiveGroupCache("reviews")?.length || 0) > 0
    ) {
      reviews.firstPublished = true;
      this._publishCoordinatedActiveGroupCombined("reviews", {
        render: true,
        limit: INITIAL_BROWSE_PAINT_LIMIT,
      });
    }
    return true;
  }

  _publishActiveGroupMemberCombined(key, entity, options = {}) {
    if (this._publishActiveGroupMemberUpdate(key, entity, options)) {
      return true;
    }
    return this.publishActiveGroupCombined(key, options);
  }

  _finishActiveGroupWindowPublish(loadToken) {
    const state = this._activeGroupWindowPublish;
    if (!state || state.loadToken !== loadToken) return false;
    for (const key of ["events", "reviews"]) {
      if (key === "reviews" && state.reviews.finalPublished) continue;
      this._publishCoordinatedActiveGroupCombined(key, { render: false });
    }
    this._activeGroupWindowPublish = null;
    return true;
  }

  _activeGroupMembers() {
    const camera = this._host._activeCam;
    if (!isCameraGroup(camera)) return [];
    return [
      cameraGroupMemberConfig(camera, 0),
      cameraGroupMemberConfig(camera, 1),
    ].filter((member) => member?.entity);
  }

  _activeGroupContextMatches(primaryEntity, before, loadToken = null) {
    if (loadToken !== null && this._host._windowLoadToken !== loadToken) {
      return false;
    }
    if (this._host._activeCam?.entity !== primaryEntity) return false;
    if (!isCameraGroup(this._host._activeCam)) return false;
    return (
      !Number.isFinite(before) ||
      !Number.isFinite(this._host._winEnd) ||
      Math.floor(this._host._winEnd) === Math.floor(before)
    );
  }

  _tagGroupItems(items, entity, memberLabel) {
    return (Array.isArray(items) ? items : []).map((item) => ({
      ...item,
      _fvc_camera_entity: entity,
      _fvc_group_member: memberLabel,
    }));
  }

  _mergeActiveGroupCache(key) {
    const members = this._activeGroupMembers();
    if (!members.length) return null;
    const seen = new Set();
    const merged = [];
    members.forEach((member, index) => {
      const entity = member.entity;
      const memberLabel = index === 0 ? "A" : "B";
      const items = this._host._camCache?.[entity]?.[key] || [];
      for (const item of this._tagGroupItems(items, entity, memberLabel)) {
        const identity = String(
          item?.id ||
            `${item?.start_time || 0}|${item?.end_time || 0}|${item?.camera || ""}`,
        );
        const dedupeKey = `${entity}|${identity}`;
        if (seen.has(dedupeKey)) continue;
        seen.add(dedupeKey);
        merged.push(item);
      }
    });
    merged.sort(
      (left, right) =>
        Number(right?.start_time || 0) - Number(left?.start_time || 0),
    );
    // Each member cache is already bounded to its requested active-day
    // window. Filtering again after the merge can erase an entire member when
    // A and B have activity on different recent days.
    return merged;
  }

  publishActiveGroupCombined(key, { render = true, limit = 0 } = {}) {
    if (
      (key === "events" || key === "reviews") &&
      this._isActiveGroupWindowPublishDeferred(key)
    ) {
      return false;
    }
    const combined = this._mergeActiveGroupCache(key);
    if (!combined) return false;
    const merged =
      Number.isFinite(limit) && limit > 0
        ? combined.slice(0, Math.floor(limit))
        : combined;
    const hostKey =
      key === "events"
        ? "_events"
        : key === "reviews"
          ? "_reviews"
          : key === "recordings"
            ? "_recordings"
            : "";
    if (!hostKey) return false;
    const changed = !this._sameWindowItems(this._host[hostKey], merged);
    this._host[hostKey] = merged;
    if (render && (changed || key !== "reviews")) this._host._renderList?.();
    if (changed && key !== "recordings") this._host._renderStats?.();
    if (key === "reviews") {
      for (const member of this._activeGroupMembers()) {
        this._notifyCameraAlertsChanged(member.entity);
      }
    }
    return true;
  }

  _browseRequestMap() {
    const connection = this._host?._hass?.connection;
    if (!connection || typeof connection !== "object") {
      return this._localBrowseRequests;
    }
    let requests = sharedBrowseRequestsByConnection.get(connection);
    if (!requests) {
      requests = new Map();
      sharedBrowseRequestsByConnection.set(connection, requests);
    }
    return requests;
  }

  async _requestBrowseItems(payload) {
    const requests = this._browseRequestMap();
    const key = JSON.stringify(payload);
    const existing = requests.get(key);
    if (existing) return await existing;

    const request = Promise.resolve(this._host._ws(payload));
    requests.set(key, request);
    try {
      return await request;
    } finally {
      if (requests.get(key) === request) requests.delete(key);
    }
  }

  async activeCameraEventHeadsChanged(before = Math.floor(Date.now() / 1000)) {
    const memberEntities = cameraMemberEntities(this._host._activeCam);
    const contexts = memberEntities
      .map((entity) => ({
        entity,
        cache: this._host._camCache?.[entity],
      }))
      .filter(({ cache }) => cache?.clientId && cache?.cam);
    if (!contexts.length) return false;

    const after = Math.max(
      0,
      Math.floor(
        before - (this._host._config?.window_days || 1) * DAY,
      ),
    );
    const results = await Promise.allSettled(
      contexts.map(({ cache }) =>
        this._requestBrowseItems({
          type: "frigate/events/get",
          instance_id: cache.clientId,
          cameras: [cache.cam],
          after,
          before,
          limit: 1,
        }),
      ),
    );
    const activeEntities = cameraMemberEntities(this._host._activeCam);
    const contextStillActive =
      activeEntities.length === memberEntities.length &&
      activeEntities.every(
        (entity, index) => entity === memberEntities[index],
      ) &&
      contexts.every(({ entity, cache }) => {
        const current = this._host._camCache?.[entity];
        return (
          current?.clientId === cache.clientId && current?.cam === cache.cam
        );
      });
    if (!contextStillActive) return false;

    return results.some((result, index) => {
      if (result.status !== "fulfilled" || !Array.isArray(result.value)) {
        return false;
      }
      const newestId = result.value[0]?.id;
      if (!newestId) return false;
      const currentId =
        this._host._camCache?.[contexts[index]?.entity]?.events?.[0]?.id;
      return newestId !== currentId;
    });
  }

  async fetchWindowedEvents(clientId, cam, after, before, opts = {}) {
    return this._deps.fetchWindowedItems({
      after,
      before,
      opts,
      defaultPageLimit: WINDOW_FETCH_PAGE_LIMIT,
      defaultBatchLimit: EVENT_FETCH_BATCH,
      useOptionLimit: true,
      fetchBatch: ({ after: afterTs, before: beforeTs, limit }) =>
        this._requestBrowseItems({
          type: "frigate/events/get",
          instance_id: clientId,
          cameras: [cam],
          after: afterTs,
          before: beforeTs,
          limit,
        }),
      getItemStartTime: (item, fallbackBefore) =>
        item?.start_time || fallbackBefore,
    });
  }

  async warmOtherCamerasEvents() {
    const token = ++this._host._warmCamsToken;
    const activeEntity = this._host._activeCam?.entity;
    const includeActiveCamera =
      this._host._isPreviewPageActive?.() === true ||
      this._host._isCardViewPageActive?.() === true;
    const after = this._host._winStart;
    const before = this._host._winEnd;

    const activeEntities = new Set(cameraMemberEntities(this._host._activeCam));
    for (const camera of flattenCameraMembers(
      this._host._config.cameras || [],
    )) {
      if (activeEntities.has(camera.entity) && !includeActiveCamera) continue;
      const entity = camera.entity;
      const cache = this._host._camCache[entity];
      if (!cache?.clientId || !cache?.cam) continue;
      if (
        Array.isArray(cache.events) &&
        cache.events.length >= INACTIVE_WARM_EVENT_LIMIT
      ) {
        continue;
      }
      try {
        const events = await this.fetchWindowedEvents(
          cache.clientId,
          cache.cam,
          after,
          before,
          {
            pageLimit: WARM_EVENT_PAGE_LIMIT,
            limit: INACTIVE_WARM_EVENT_LIMIT,
            debugLabel: "warm-cache",
            shouldContinue: () =>
              token === this._host._warmCamsToken &&
              after === this._host._winStart &&
              before === this._host._winEnd,
          },
        );
        if (token !== this._host._warmCamsToken) return;
        if (after !== this._host._winStart || before !== this._host._winEnd) {
          return;
        }
        cache.events = Array.isArray(events)
          ? events.slice(0, INACTIVE_WARM_EVENT_LIMIT)
          : [];
      } catch (_) {}
    }
  }

  async warmVisibleCameraReviews() {
    if (this._host._calSelectedDay) return;
    const previewActive = this._host._isPreviewPageActive?.() === true;
    const allCameraCountsVisible =
      previewActive ||
      this._host._wideViewCompanionController?.isActive?.() === true ||
      this._host._isCardViewPageActive?.() === true;
    if (!allCameraCountsVisible) return;

    const token = (Number(this._host._warmReviewsToken) || 0) + 1;
    this._host._warmReviewsToken = token;
    const before = this._host._winEnd;
    const dayCount = this._host._config?.alerts_reviews_days || 3;

    const activeEntities = new Set(cameraMemberEntities(this._host._activeCam));
    for (const camera of flattenCameraMembers(
      this._host._config?.cameras || [],
    )) {
      const entity = camera?.entity || "";
      if (
        activeEntities.has(entity) &&
        !previewActive &&
        this._host._isCardViewPageActive?.() !== true
      ) {
        continue;
      }
      const cache = entity ? this._host._camCache[entity] : null;
      if (!cache?.clientId || !cache?.cam) continue;
      const contentMode = this._reviewContentMode(camera?.alerts_content);
      const cacheKey = this.reviewWindowCacheKeyForContent(
        cache.clientId,
        cache.cam,
        before,
        contentMode,
      );
      if (cache.reviewsWindowKey === cacheKey) continue;

      try {
        const resolved = await this.fetchRecentActiveDayReviews(
          cache.clientId,
          cache.cam,
          before,
          dayCount,
          {
            debugLabel: "camera-alert-count",
            shouldContinue: () => token === this._host._warmReviewsToken,
            severity: contentMode === "all_reviews" ? "" : "alert",
            itemFilter:
              contentMode === "all_reviews"
                ? null
                : reviewMatchesAlertsOnlyMode,
          },
        );
        if (token !== this._host._warmReviewsToken) return;
        const reviews = Array.isArray(resolved?.items) ? resolved.items : [];
        this.cacheCameraWindowReviews(
          entity,
          cache.clientId,
          cache.cam,
          before,
          reviews,
          contentMode,
        );
        this._notifyCameraAlertsChanged(entity);
      } catch (_) {}
    }
  }

  scheduleWarmOtherCamerasEvents(delayMs = 1000) {
    if (this._host._warmOtherCamsDelayT) {
      clearTimeout(this._host._warmOtherCamsDelayT);
    }
    this._host._warmOtherCamsDelayT = setTimeout(
      () => {
        this._host._warmOtherCamsDelayT = null;
        if (!this._host.isConnected) return;
        void this.warmOtherCamerasEvents();
        void this.warmVisibleCameraReviews();
      },
      Math.max(0, Number(delayMs) || 0),
    );
  }

  pruneNonActiveCamWindowCaches() {
    this._host._warmCamsToken++;
    this._host._warmReviewsToken =
      (Number(this._host._warmReviewsToken) || 0) + 1;
    const activeEntities = new Set(cameraMemberEntities(this._host._activeCam));
    for (const camera of flattenCameraMembers(
      this._host._config.cameras || [],
    )) {
      const entity = camera.entity;
      if (activeEntities.has(entity)) continue;
      const cache = this._host._camCache[entity];
      if (!cache) continue;
      cache.events = [];
      cache.eventsWindowKey = "";
      cache.eventsWindowContextKey = "";
      cache.eventsWindowFetchedAt = 0;
      cache.recordings = [];
      cache.reviews = [];
      cache.reviewsWindowKey = "";
      cache.reviewsWindowContextKey = "";
      cache.reviewsWindowFetchedAt = 0;
    }
  }

  async fetchWindowedReviews(clientId, cam, after, before, opts = {}) {
    const severity = String(opts?.severity || "").trim();
    return this._deps.fetchWindowedItems({
      after,
      before,
      opts,
      defaultPageLimit: WINDOW_FETCH_PAGE_LIMIT,
      defaultBatchLimit: REVIEW_FETCH_BATCH,
      useOptionLimit: false,
      fetchBatch: ({ after: afterTs, before: beforeTs, limit }) =>
        this._requestBrowseItems({
          type: "frigate/reviews/get",
          instance_id: clientId,
          cameras: [cam],
          ...(severity ? { severity } : {}),
          after: afterTs,
          before: beforeTs,
          limit,
        }),
      getItemStartTime: (item, fallbackBefore) =>
        item?.start_time || fallbackBefore,
    });
  }

  _dayKeyForItem(item) {
    const ts = Math.floor(Number(item?.start_time) || 0);
    if (typeof this._host._dayKey === "function") {
      return this._host._dayKey(ts);
    }
    const date = new Date(ts * 1000);
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, "0");
    const day = String(date.getUTCDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  _filterToRecentDaysWithData(items, dayCount) {
    const targetDayCount = Math.max(1, Number(dayCount) || 1);
    const sorted = Array.isArray(items)
      ? items
          .slice()
          .sort((a, b) => (b?.start_time || 0) - (a?.start_time || 0))
      : [];
    const selectedDays = new Set();
    for (const item of sorted) {
      const key = this._dayKeyForItem(item);
      if (!key) continue;
      selectedDays.add(key);
      if (selectedDays.size >= targetDayCount) break;
    }
    if (!selectedDays.size) return [];
    return sorted.filter((item) => selectedDays.has(this._dayKeyForItem(item)));
  }

  async _fetchRecentActiveDaysItems({
    clientId,
    cam,
    before,
    dayCount,
    fetcher,
    debugLabel,
    itemFilter,
    onProgress,
    shouldContinue,
  }) {
    const targetDayCount = Math.max(1, Number(dayCount) || 1);
    let spanDays = targetDayCount;
    const maxSpanDays = Math.max(targetDayCount * 16, targetDayCount + 30);
    let bestItems = [];
    let bestDayCount = 0;
    const collectedItems = [];
    const collectedIds = new Set();
    let scannedAfter = Math.floor(before);
    let firstResponsePublished = false;
    let progressStarted = false;
    let lastProgressKey = "";

    const mergeCollectedItems = (nextItems) => {
      for (const item of Array.isArray(nextItems) ? nextItems : []) {
        const id = String(item?.id || "").trim();
        if (!id || collectedIds.has(id)) continue;
        collectedIds.add(id);
        collectedItems.push(item);
      }
      return collectedItems;
    };

    const combineUniqueItems = (nextItems) => {
      const combined = new Map(
        collectedItems.map((item) => [String(item?.id || ""), item]),
      );
      for (const item of Array.isArray(nextItems) ? nextItems : []) {
        const id = String(item?.id || "").trim();
        if (id && !combined.has(id)) combined.set(id, item);
      }
      return [...combined.values()];
    };

    while (true) {
      if (shouldContinue && !shouldContinue()) {
        return { items: bestItems, after: scannedAfter, cancelled: true };
      }
      const after = Math.max(0, Math.floor(before - spanDays * DAY));
      const rangeBefore =
        scannedAfter < Math.floor(before) ? scannedAfter + 1 : before;
      const fetchOpts = { debugLabel };
      if (typeof onProgress === "function") {
        fetchOpts.initialBatchLimit = INITIAL_BROWSE_PAINT_LIMIT;
        fetchOpts.onPage = (pageItems, pageState = {}) => {
          if (shouldContinue && !shouldContinue()) return;
          const publishFirstEmptyResponse = () => {
            if (firstResponsePublished) return;
            firstResponsePublished = true;
            onProgress([], {
              after,
              spanDays,
              page: pageState.page,
              complete: false,
            });
          };
          if (pageState.done) {
            publishFirstEmptyResponse();
            return;
          }
          const combinedItems = combineUniqueItems(pageItems);
          const eligibleItems =
            typeof itemFilter === "function"
              ? combinedItems.filter((item) => itemFilter(item))
              : combinedItems;
          const recentItems = this._filterToRecentDaysWithData(
            eligibleItems,
            targetDayCount,
          );
          if (!recentItems.length) {
            publishFirstEmptyResponse();
            return;
          }
          const progressiveItems = progressStarted
            ? recentItems
            : recentItems.slice(0, INITIAL_BROWSE_PAINT_LIMIT);
          const progressKey = progressiveItems
            .map((item) => item?.id || item?.start_time || "")
            .join("|");
          if (progressKey === lastProgressKey) return;
          firstResponsePublished = true;
          progressStarted = true;
          lastProgressKey = progressKey;
          onProgress(progressiveItems.slice(), {
            after,
            spanDays,
            page: pageState.page,
            complete: false,
          });
        };
      }
      if (shouldContinue) fetchOpts.shouldContinue = shouldContinue;
      const items = await fetcher(after, rangeBefore, fetchOpts);
      if (shouldContinue && !shouldContinue()) {
        return { items: bestItems, after: scannedAfter, cancelled: true };
      }
      mergeCollectedItems(items);
      scannedAfter = after;
      const latestItems =
        typeof itemFilter === "function"
          ? collectedItems.filter((item) => itemFilter(item))
          : collectedItems;
      const filtered = this._filterToRecentDaysWithData(
        latestItems,
        targetDayCount,
      );
      const dayCountFound = new Set(
        filtered.map((item) => this._dayKeyForItem(item)),
      ).size;
      if (dayCountFound > bestDayCount) {
        bestDayCount = dayCountFound;
        bestItems = filtered;
      }
      if (dayCountFound >= targetDayCount || spanDays >= maxSpanDays) {
        const bestResult = bestDayCount >= dayCountFound ? bestItems : filtered;
        return {
          items: bestResult,
          after,
        };
      }
      spanDays = Math.min(maxSpanDays, spanDays * 2);
    }
  }

  async fetchRecentActiveDayEvents(clientId, cam, before, dayCount, opts = {}) {
    const result = await this._fetchRecentActiveDaysItems({
      clientId,
      cam,
      before,
      dayCount,
      debugLabel: opts.debugLabel || "events-active-days",
      onProgress:
        typeof opts.onProgress === "function" ? opts.onProgress : null,
      shouldContinue:
        typeof opts.shouldContinue === "function" ? opts.shouldContinue : null,
      fetcher: (after, beforeTs, fetchOpts) =>
        this.fetchWindowedEvents(clientId, cam, after, beforeTs, fetchOpts),
    });
    return result;
  }

  async fetchRecentActiveDayReviews(
    clientId,
    cam,
    before,
    dayCount,
    opts = {},
  ) {
    const result = await this._fetchRecentActiveDaysItems({
      clientId,
      cam,
      before,
      dayCount,
      debugLabel: opts.debugLabel || "reviews-active-days",
      itemFilter:
        typeof opts.itemFilter === "function" ? opts.itemFilter : null,
      onProgress:
        typeof opts.onProgress === "function" ? opts.onProgress : null,
      shouldContinue:
        typeof opts.shouldContinue === "function" ? opts.shouldContinue : null,
      fetcher: (after, beforeTs, fetchOpts) =>
        this.fetchWindowedReviews(clientId, cam, after, beforeTs, {
          ...fetchOpts,
          severity: opts.severity,
        }),
    });
    return result;
  }

  async _activeGroupSecondaryContext() {
    const members = this._activeGroupMembers();
    const secondary = members[1];
    if (!secondary?.entity) return null;
    if (!this._host._camCache?.[secondary.entity]?.discovered) {
      await this._host._discoverOne?.(secondary.entity);
    }
    const cache = this._host._camCache?.[secondary.entity];
    if (!cache?.clientId || !cache?.cam) return null;
    return {
      camera: secondary,
      entity: secondary.entity,
      clientId: cache.clientId,
      cam: cache.cam,
      cache,
    };
  }

  async _loadActiveGroupSecondaryEvents({
    after,
    before,
    loadToken,
    primaryEntity,
    reuseRecentCache,
  }) {
    const secondaryEntity = this._activeGroupMembers()[1]?.entity || "";
    const context = await this._activeGroupSecondaryContext();
    if (!this._activeGroupContextMatches(primaryEntity, before, loadToken)) {
      return;
    }
    if (!context) {
      if (secondaryEntity) {
        this._publishActiveGroupMemberUpdate("events", secondaryEntity);
      }
      return;
    }
    const { entity, clientId, cam, cache } = context;
    if (
      this.hasCameraCachedWindowEvents(entity, clientId, cam, before, {
        allowRecent: reuseRecentCache,
      })
    ) {
      this._publishActiveGroupMemberCombined("events", entity);
      return;
    }
    const shouldContinue = () =>
      this._activeGroupContextMatches(primaryEntity, before, loadToken);
    let progressResponsePublished = false;
    let progressItemsPublished = false;
    const publishProgress = (items) => {
      const cameraEvents = Array.isArray(items) ? items : [];
      if (
        !shouldContinue() ||
        !!this._activeGroupWindowPublishState() ||
        progressItemsPublished ||
        (progressResponsePublished && !cameraEvents.length)
      ) {
        return;
      }
      progressResponsePublished = true;
      if (cameraEvents.length) progressItemsPublished = true;
      cache.events = cameraEvents;
      this._publishActiveGroupMemberCombined("events", entity);
    };
    try {
      const selectedDay = Boolean(this._host._calSelectedDay);
      const resolved = selectedDay
        ? {
            items: await this.fetchWindowedEvents(
              clientId,
              cam,
              after,
              before,
              {
                debugLabel: "group-events-selected-day",
                initialBatchLimit: INITIAL_BROWSE_PAINT_LIMIT,
                onPage: (items, pageState = {}) => {
                  if (!pageState.done) publishProgress(items);
                },
                shouldContinue,
              },
            ),
          }
        : await this.fetchRecentActiveDayEvents(
            clientId,
            cam,
            before,
            this._host._config?.window_days || 1,
            {
              debugLabel: "group-events-window",
              onProgress: this._activeGroupWindowPublishState()
                ? null
                : publishProgress,
              shouldContinue,
            },
          );
      if (!shouldContinue()) return;
      const events = Array.isArray(resolved?.items) ? resolved.items : [];
      this.cacheCameraWindowEvents(entity, clientId, cam, before, events);
      this._publishActiveGroupMemberCombined("events", entity);
    } catch (_) {
      if (shouldContinue()) {
        this._publishActiveGroupMemberCombined("events", entity);
      }
    }
  }

  async _loadActiveGroupSecondaryReviews({
    after,
    before,
    loadToken,
    primaryEntity,
    reuseRecentCache,
  }) {
    const secondaryEntity = this._activeGroupMembers()[1]?.entity || "";
    const context = await this._activeGroupSecondaryContext();
    if (!this._activeGroupContextMatches(primaryEntity, before, loadToken)) {
      return;
    }
    if (!context) {
      if (secondaryEntity) {
        this._publishActiveGroupMemberUpdate("reviews", secondaryEntity, {
          complete: true,
        });
      }
      return;
    }
    const { camera, entity, clientId, cam, cache } = context;
    const alertsContent = camera?.alerts_content;
    if (
      this.hasCameraCachedWindowReviews(
        entity,
        clientId,
        cam,
        before,
        alertsContent,
        { allowRecent: reuseRecentCache },
      )
    ) {
      this._publishActiveGroupMemberCombined("reviews", entity, {
        complete: true,
      });
      this._host._slideshowAlertController?.handleReviewsUpdated?.(
        entity,
        cache.reviews || [],
        "group-alerts-cache",
      );
      return;
    }
    const showAllReviews = alertsContent === "all_reviews";
    const reviewSeverity = showAllReviews ? "" : "alert";
    const filterReviews = (items) =>
      showAllReviews
        ? items
        : items.filter((review) => reviewMatchesAlertsOnlyMode(review));
    const shouldContinue = () =>
      this._activeGroupContextMatches(primaryEntity, before, loadToken);
    let progressResponsePublished = false;
    let progressItemsPublished = false;
    const publishProgress = (items) => {
      const cameraReviews = filterReviews(Array.isArray(items) ? items : []);
      const groupPublishState = this._activeGroupWindowPublishState();
      if (
        !shouldContinue() ||
        groupPublishState?.reviews?.firstPaint !== true ||
        progressItemsPublished ||
        (progressResponsePublished && !cameraReviews.length)
      ) {
        return;
      }
      progressResponsePublished = true;
      if (cameraReviews.length) progressItemsPublished = true;
      cache.reviews = cameraReviews;
      this._publishActiveGroupMemberCombined("reviews", entity, {
        complete: false,
      });
      this._host._slideshowAlertController?.handleReviewsUpdated?.(
        entity,
        cache.reviews,
        "group-alerts-progress",
      );
    };
    try {
      const selectedDay = Boolean(this._host._calSelectedDay);
      const resolved = selectedDay
        ? {
            items: await this.fetchWindowedReviews(
              clientId,
              cam,
              after,
              before,
              {
                debugLabel: "group-alerts-selected-day",
                severity: reviewSeverity,
                initialBatchLimit: INITIAL_BROWSE_PAINT_LIMIT,
                onPage: (items, pageState = {}) => {
                  if (!pageState.done) publishProgress(items);
                },
                shouldContinue,
              },
            ),
          }
        : await this.fetchRecentActiveDayReviews(
            clientId,
            cam,
            before,
            this._host._config?.alerts_reviews_days || 3,
            {
              debugLabel: "group-alerts-window",
              severity: reviewSeverity,
              itemFilter: showAllReviews ? null : reviewMatchesAlertsOnlyMode,
              onProgress: publishProgress,
              shouldContinue,
            },
          );
      if (!shouldContinue()) return;
      const reviews = filterReviews(
        Array.isArray(resolved?.items) ? resolved.items : [],
      );
      this.cacheCameraWindowReviews(
        entity,
        clientId,
        cam,
        before,
        reviews,
        alertsContent,
      );
      this._publishActiveGroupMemberCombined("reviews", entity, {
        complete: true,
      });
      this._host._slideshowAlertController?.handleReviewsUpdated?.(
        entity,
        reviews,
        "group-alerts-window",
      );
    } catch (_) {
      if (shouldContinue()) {
        this._publishActiveGroupMemberCombined("reviews", entity, {
          complete: true,
        });
      }
    }
  }

  async _loadActiveGroupSecondaryWindow(options) {
    if (!isCameraGroup(this._host._activeCam)) return;
    await Promise.allSettled([
      this._loadActiveGroupSecondaryEvents(options),
      this._loadActiveGroupSecondaryReviews(options),
    ]);
  }

  async loadWindow(
    replace,
    { supersede = false, reuseRecentCache = false } = {},
  ) {
    if (this._host._isPreviewPageActive()) return;
    if (this._host._loading && !supersede) return;
    const loadToken = (Number(this._host._windowLoadToken) || 0) + 1;
    this._host._windowLoadToken = loadToken;
    // Synchronize A/B publication so a member can never paint by itself.
    // Reviews may publish a combined first batch and final batch independently
    // of the slower event requests.
    this._beginActiveGroupWindowPublish(loadToken);
    this._host._loading = true;
    this._host._reloadPending = false;
    this._host._reloadAfterLoad = false;
    if (replace) this._host._exhausted = false;
    if (this._host._followNowWindow) {
      const now = Math.floor(Date.now() / 1000);
      this._host._winEnd = now;
      this._host._winStart = now - this._host._config.window_days * DAY;
    }
    const { clientId, cam } = this._host._cc();
    if (!clientId || !cam) {
      if (this._host._windowLoadToken === loadToken) {
        if (this._activeGroupWindowPublish?.loadToken === loadToken) {
          this._activeGroupWindowPublish = null;
        }
        this._host._loading = false;
        this._host._renderAll?.();
      }
      return;
    }
    const entity = this._host._activeCam?.entity || "";
    const after = this._host._winStart;
    const before = this._host._winEnd;
    const secondaryTask = this._loadActiveGroupSecondaryWindow({
      after,
      before,
      loadToken,
      primaryEntity: entity,
      reuseRecentCache,
    });
    // Reviews feed both the Alerts list and camera count. Start them before the
    // broader event collection used by Clips.
    const reviewsTask = this.loadWindowReviewsIfNeeded(
      clientId,
      cam,
      after,
      before,
      { reuseRecentCache },
    );
    const eventsTask = this.loadWindowEvents(clientId, cam, after, before, {
      reuseRecentCache,
    });

    await Promise.allSettled([
      reviewsTask,
      eventsTask,
      this._host._tab === "recordings"
        ? this.loadWindowRecordings(clientId, cam, before)
        : Promise.resolve(),
      secondaryTask,
    ]);
    if (
      this._host._windowLoadToken !== loadToken ||
      !this._windowContextMatches(clientId, cam, before)
    ) {
      return;
    }
    this._finishActiveGroupWindowPublish(loadToken);
    if (
      entity &&
      this._host._camCache[entity] &&
      !isCameraGroup(this._host._activeCam)
    ) {
      this._host._camCache[entity].events = this._host._events;
      this._host._camCache[entity].recordings = this._host._recordings;
    }
    this._host._loading = false;
    if (this._host._reloadAfterLoad) {
      this._host._reloadAfterLoad = false;
      this._host._scheduleReload();
    }
    this._host._deepLinkController?.consumeDeepLinkReviewOpen?.() ??
      this._host._consumeDeepLinkReviewOpen?.();
    this._host._deepLinkController?.consumeDeepLinkEventOpen?.() ??
      this._host._consumeDeepLinkEventOpen?.();
    if (this._host._eventsMode === "all") this._host._loadAllCamsBackground();
    this._host._renderAll();
  }

  async loadOlder() {
    if (this._host._calSelectedDay) {
      this._host._exhausted = true;
      this._host._renderList?.();
      this._host._renderSubtitle?.();
      return;
    }
    if (this._host._loading) return;
    const before = this._host._events.length
      ? Math.floor(
          Math.min(...this._host._events.map((event) => event.start_time)),
        )
      : this._host._winStart;
    const loadToken = (Number(this._host._windowLoadToken) || 0) + 1;
    this._host._windowLoadToken = loadToken;
    this._host._loading = true;
    const { clientId, cam } = this._host._cc();
    if (isCameraGroup(this._host._activeCam)) {
      await this._loadOlderActiveGroup(before, loadToken);
      return;
    }
    try {
      const older = await this._host._ws({
        type: "frigate/events/get",
        instance_id: clientId,
        cameras: [cam],
        before,
        limit: 50,
      });
      if (
        this._host._windowLoadToken !== loadToken ||
        this._host._cc()?.clientId !== clientId ||
        this._host._cc()?.cam !== cam
      ) {
        return;
      }
      const nextEvents = Array.isArray(older)
        ? older.filter(
            (olderEvent) =>
              !this._host._events.some(
                (currentEvent) => currentEvent.id === olderEvent.id,
              ),
          )
        : [];
      if (!nextEvents.length) {
        this._host._exhausted = true;
      } else {
        this._host._events = this._host._events.concat(nextEvents);
        this._host._winStart = Math.min(
          this._host._winStart,
          ...nextEvents.map((event) => event.start_time),
        );
      }
    } catch (_) {}
    if (this._host._windowLoadToken !== loadToken) return;
    this._host._loading = false;
    this._host._renderList();
    this._host._renderSubtitle();
  }

  async _loadOlderActiveGroup(before, loadToken) {
    const primaryEntity = this._host._activeCam?.entity || "";
    const members = this._activeGroupMembers();
    try {
      await Promise.all(
        members.map(async (member) => {
          if (!this._host._camCache?.[member.entity]?.discovered) {
            await this._host._discoverOne?.(member.entity);
          }
        }),
      );
      const contexts = members
        .map((member) => ({
          entity: member.entity,
          cache: this._host._camCache?.[member.entity],
        }))
        .filter(({ cache }) => cache?.clientId && cache?.cam);
      const results = await Promise.allSettled(
        contexts.map(({ cache }) =>
          this._host._ws({
            type: "frigate/events/get",
            instance_id: cache.clientId,
            cameras: [cache.cam],
            before,
            limit: 50,
          }),
        ),
      );
      if (
        !this._activeGroupContextMatches(
          primaryEntity,
          this._host._winEnd,
          loadToken,
        )
      ) {
        return;
      }
      let added = 0;
      contexts.forEach(({ cache }, index) => {
        const response = results[index];
        if (response?.status !== "fulfilled") return;
        const existing = Array.isArray(cache.events) ? cache.events : [];
        const existingIds = new Set(existing.map((event) => event?.id));
        const next = (Array.isArray(response.value) ? response.value : []).filter(
          (event) => event?.id && !existingIds.has(event.id),
        );
        if (!next.length) return;
        added += next.length;
        cache.events = existing.concat(next);
      });
      if (!added) {
        this._host._exhausted = true;
      } else {
        const combined = this._mergeActiveGroupCache("events") || [];
        this._host._events = combined;
        this._host._winStart = Math.min(
          this._host._winStart,
          ...combined.map((event) => Number(event?.start_time || before)),
        );
      }
    } catch (_) {}
    if (this._host._windowLoadToken !== loadToken) return;
    this._host._loading = false;
    this._host._renderList?.();
    this._host._renderSubtitle?.();
  }

  cacheActiveCamSlice(key, value) {
    const entity = this._host._activeCam?.entity;
    if (entity && this._host._camCache[entity]) {
      this._host._camCache[entity][key] = value;
    }
  }

  reviewWindowCacheKey(clientId, cam, before) {
    return this.reviewWindowCacheKeyForContent(
      clientId,
      cam,
      before,
      this._host._activeCam?.alerts_content,
    );
  }

  eventWindowCacheKey(clientId, cam, before) {
    const days = this._host._config?.window_days || 1;
    const windowScope = this._host._calSelectedDay
      ? `day:${this._host._calSelectedDay}`
      : days;
    return `${clientId}|${cam}|${Math.floor(before)}|${windowScope}`;
  }

  eventWindowContextKey(clientId, cam) {
    const days = this._host._config?.window_days || 1;
    const windowScope = this._host._calSelectedDay
      ? `day:${this._host._calSelectedDay}`
      : days;
    return `${clientId}|${cam}|${windowScope}`;
  }

  _recentWindowCacheIsFresh(fetchedAt) {
    const refreshSeconds = Math.max(
      15,
      Number(this._host._config?.refresh_seconds) || 45,
    );
    return Date.now() - Number(fetchedAt || 0) <= refreshSeconds * 1000;
  }

  hasCachedWindowEvents(
    clientId,
    cam,
    before,
    { allowRecent = false } = {},
  ) {
    const entity = this._host._activeCam?.entity;
    return this.hasCameraCachedWindowEvents(entity, clientId, cam, before, {
      allowRecent,
    });
  }

  hasCameraCachedWindowEvents(
    entity,
    clientId,
    cam,
    before,
    { allowRecent = false } = {},
  ) {
    const cache = entity ? this._host._camCache[entity] : null;
    if (!cache) return false;
    if (
      cache.eventsWindowKey === this.eventWindowCacheKey(clientId, cam, before)
    ) {
      return true;
    }
    return (
      allowRecent &&
      this._host._followNowWindow === true &&
      cache.eventsWindowContextKey ===
        this.eventWindowContextKey(clientId, cam) &&
      this._recentWindowCacheIsFresh(cache.eventsWindowFetchedAt)
    );
  }

  cacheWindowEvents(clientId, cam, before, events) {
    const entity = this._host._activeCam?.entity;
    this.cacheCameraWindowEvents(entity, clientId, cam, before, events);
  }

  cacheCameraWindowEvents(entity, clientId, cam, before, events) {
    const cache = entity ? this._host._camCache[entity] : null;
    if (!cache) return;
    cache.events = Array.isArray(events) ? events : [];
    cache.eventsWindowKey = this.eventWindowCacheKey(clientId, cam, before);
    cache.eventsWindowContextKey = this.eventWindowContextKey(clientId, cam);
    cache.eventsWindowFetchedAt = Date.now();
  }

  _reviewContentMode(value) {
    return value === "all_reviews" ? "all_reviews" : "alerts_only";
  }

  reviewWindowCacheKeyForContent(clientId, cam, before, alertsContent) {
    const days = this._host._config?.alerts_reviews_days || 3;
    const contentMode = this._reviewContentMode(alertsContent);
    const windowScope = this._host._calSelectedDay
      ? `day:${this._host._calSelectedDay}`
      : days;
    return `${clientId}|${cam}|${Math.floor(before)}|${windowScope}|${contentMode}`;
  }

  reviewWindowContextKeyForContent(clientId, cam, alertsContent) {
    const days = this._host._config?.alerts_reviews_days || 3;
    const contentMode = this._reviewContentMode(alertsContent);
    const windowScope = this._host._calSelectedDay
      ? `day:${this._host._calSelectedDay}`
      : days;
    return `${clientId}|${cam}|${windowScope}|${contentMode}`;
  }

  hasCachedWindowReviews(
    clientId,
    cam,
    before,
    { allowRecent = false } = {},
  ) {
    const entity = this._host._activeCam?.entity;
    return this.hasCameraCachedWindowReviews(
      entity,
      clientId,
      cam,
      before,
      this._host._activeCam?.alerts_content,
      { allowRecent },
    );
  }

  hasCameraCachedWindowReviews(
    entity,
    clientId,
    cam,
    before,
    alertsContent,
    { allowRecent = false } = {},
  ) {
    const cache = entity ? this._host._camCache[entity] : null;
    if (!cache) return false;
    if (
      cache.reviewsWindowKey ===
      this.reviewWindowCacheKeyForContent(
        clientId,
        cam,
        before,
        alertsContent,
      )
    ) {
      return true;
    }
    return (
      allowRecent &&
      this._host._followNowWindow === true &&
      cache.reviewsWindowContextKey ===
        this.reviewWindowContextKeyForContent(
          clientId,
          cam,
          alertsContent,
        ) &&
      this._recentWindowCacheIsFresh(cache.reviewsWindowFetchedAt)
    );
  }

  cacheWindowReviews(clientId, cam, before, reviews) {
    const entity = this._host._activeCam?.entity;
    this.cacheCameraWindowReviews(
      entity,
      clientId,
      cam,
      before,
      reviews,
      this._host._activeCam?.alerts_content,
    );
  }

  cacheCameraWindowReviews(
    entity,
    clientId,
    cam,
    before,
    reviews,
    alertsContent,
  ) {
    const cache = entity ? this._host._camCache[entity] : null;
    if (!cache) return;
    cache.reviews = Array.isArray(reviews) ? reviews : [];
    cache.reviewsWindowKey = this.reviewWindowCacheKeyForContent(
      clientId,
      cam,
      before,
      alertsContent,
    );
    cache.reviewsWindowContextKey = this.reviewWindowContextKeyForContent(
      clientId,
      cam,
      alertsContent,
    );
    cache.reviewsWindowFetchedAt = Date.now();
  }

  cameraAlertsCount(entity, { includeGroup = false } = {}) {
    const target = String(entity || "").trim();
    const camera = includeGroup
      ? (this._host._config?.cameras || []).find(
          (candidate) => candidate?.entity === target,
        )
      : null;
    const entities = camera ? cameraMemberEntities(camera) : [target];
    return entities.reduce((count, memberEntity) => {
      const reviews = this._host._camCache?.[memberEntity]?.reviews;
      return count + (Array.isArray(reviews) ? reviews.length : 0);
    }, 0);
  }

  mergeLatestCameraReviews(entity, reviews) {
    const cache = entity ? this._host._camCache?.[entity] : null;
    if (!cache?.reviewsWindowKey || !Array.isArray(reviews)) return false;
    if (this._host._followNowWindow === false) return false;
    const camera = (this._host._config?.cameras || []).find((candidate) =>
      cameraMemberEntities(candidate).includes(entity),
    );
    const contentMode = this._reviewContentMode(camera?.alerts_content);
    const eligible =
      contentMode === "all_reviews"
        ? reviews
        : reviews.filter((review) => reviewMatchesAlertsOnlyMode(review));
    const byId = new Map();
    for (const review of [...(cache.reviews || []), ...eligible]) {
      const id = String(review?.id || "").trim();
      if (id) byId.set(id, review);
    }
    const merged = this._filterToRecentDaysWithData(
      [...byId.values()],
      this._host._config?.alerts_reviews_days || 3,
    );
    if (this._sameWindowItems(cache.reviews, merged)) return false;
    cache.reviews = merged;
    if (cameraMemberEntities(this._host._activeCam).includes(entity)) {
      this.publishActiveGroupCombined("reviews", { render: false });
    }
    this._notifyCameraAlertsChanged(entity);
    return true;
  }

  _notifyCameraAlertsChanged(entity) {
    this._host._previewPageController?.updatePreviewMeta?.();
    this._host._wideViewCompanionController?.updateMeta?.();
    if (cameraMemberEntities(this._host._activeCam).includes(entity)) {
      this._host._renderStats?.();
    }
  }

  _windowContextMatches(clientId, cam, before) {
    if (typeof this._host._cc === "function") {
      const active = this._host._cc();
      if (active?.clientId !== clientId || active?.cam !== cam) return false;
    }
    if (Number.isFinite(this._host._winEnd) && Number.isFinite(before)) {
      return Math.floor(this._host._winEnd) === Math.floor(before);
    }
    return true;
  }

  _sameWindowItems(currentItems, nextItems) {
    if (!Array.isArray(currentItems) || !Array.isArray(nextItems)) return false;
    if (currentItems.length !== nextItems.length) return false;
    return currentItems.every((item, index) => {
      const nextItem = nextItems[index];
      if (item === nextItem) return true;
      return !!item?.id && item.id === nextItem?.id;
    });
  }

  _publishWindowEvents(clientId, cam, before, events) {
    if (!this._windowContextMatches(clientId, cam, before)) return false;
    const cameraEvents = Array.isArray(events) ? events : [];
    this.cacheActiveCamSlice("events", cameraEvents);
    if (
      isCameraGroup(this._host._activeCam) &&
      this._publishActiveGroupMemberCombined(
        "events",
        this._host._activeCam?.entity || "",
      )
    ) {
      return true;
    }
    const nextEvents = isCameraGroup(this._host._activeCam)
      ? this._mergeActiveGroupCache("events") || cameraEvents
      : cameraEvents;
    const changed = !this._sameWindowItems(this._host._events, nextEvents);
    this._host._events = nextEvents;
    // IDs alone do not capture media availability or favorite changes. Always
    // offer the refreshed data to the keyed renderer; unchanged markup is
    // discarded there without replacing the existing DOM.
    this._host._renderList();
    if (changed) this._host._renderStats();
    return true;
  }

  _publishWindowReviews(
    clientId,
    cam,
    before,
    reviews,
    { updateCache = true, complete = true } = {},
  ) {
    if (!this._windowContextMatches(clientId, cam, before)) return false;
    const cameraReviews = Array.isArray(reviews) ? reviews : [];
    if (updateCache) {
      this.cacheWindowReviews(clientId, cam, before, cameraReviews);
    } else {
      this.cacheActiveCamSlice("reviews", cameraReviews);
    }
    if (isCameraGroup(this._host._activeCam)) {
      const published = this._publishActiveGroupMemberCombined(
        "reviews",
        this._host._activeCam?.entity || "",
        { complete },
      );
      if (this._host._tab === "alerts") {
        this._host._slideshowAlertController.handleReviewsUpdated(
          this._host._activeCam?.entity || "",
          cameraReviews,
          "alerts-window",
        );
      }
      return published;
    }
    const nextReviews = isCameraGroup(this._host._activeCam)
      ? this._mergeActiveGroupCache("reviews") || cameraReviews
      : cameraReviews;
    const changed = !this._sameWindowItems(this._host._reviews, nextReviews);
    this._host._reviews = nextReviews;
    this._notifyCameraAlertsChanged(this._host._activeCam?.entity || "");
    if (changed) this._host._renderList();
    if (this._host._tab === "alerts") {
      this._host._slideshowAlertController.handleReviewsUpdated(
        this._host._activeCam?.entity || "",
        cameraReviews,
        "alerts-window",
      );
    }
    return true;
  }

  async loadWindowEvents(
    clientId,
    cam,
    after,
    before,
    { reuseRecentCache = false } = {},
  ) {
    const loadToken = (Number(this._host._eventsLoadToken) || 0) + 1;
    this._host._eventsLoadToken = loadToken;
    if (
      this.hasCachedWindowEvents(clientId, cam, before, {
        allowRecent: reuseRecentCache,
      })
    ) {
      const entity = this._host._activeCam?.entity;
      const cachedEvents = this._host._camCache[entity]?.events || [];
      this._publishWindowEvents(clientId, cam, before, cachedEvents);
      return;
    }
    const groupPublishState = this._activeGroupWindowPublishState();
    const hasRenderableCache = groupPublishState
      ? true
      : Array.isArray(this._host._events) && this._host._events.length > 0;
    let publishedProgressResponse = false;
    let publishedProgressItems = false;
    let publishedProgress = false;
    const selectedDay = !!this._host._calSelectedDay;
    const publishProgress = (partialEvents) => {
      if (this._host._eventsLoadToken !== loadToken) return;
      const cameraEvents = Array.isArray(partialEvents) ? partialEvents : [];
      if (
        hasRenderableCache ||
        publishedProgressItems ||
        (publishedProgressResponse && !cameraEvents.length)
      ) {
        return;
      }
      publishedProgressResponse = true;
      if (cameraEvents.length) publishedProgressItems = true;
      publishedProgress =
        this._publishWindowEvents(clientId, cam, before, cameraEvents) ||
        publishedProgress;
    };
    const shouldContinue = () =>
      this._host._eventsLoadToken === loadToken &&
      this._windowContextMatches(clientId, cam, before);
    try {
      const resolved = selectedDay
        ? {
            items: await this.fetchWindowedEvents(
              clientId,
              cam,
              after,
              before,
              {
                debugLabel: "events-selected-day",
                initialBatchLimit: INITIAL_BROWSE_PAINT_LIMIT,
                onPage: (partialEvents, pageState = {}) => {
                  if (!pageState.done) publishProgress(partialEvents);
                },
                shouldContinue,
              },
            ),
            after,
          }
        : await this.fetchRecentActiveDayEvents(
            clientId,
            cam,
            before,
            this._host._config?.window_days || 1,
            {
              debugLabel: "events-window",
              onProgress: groupPublishState ? null : publishProgress,
              shouldContinue,
            },
          );
      if (
        this._host._eventsLoadToken !== loadToken ||
        !this._windowContextMatches(clientId, cam, before)
      ) {
        return;
      }
      const events = Array.isArray(resolved?.items) ? resolved.items : [];
      if (selectedDay) {
        this._host._winStart = after;
        this._host._exhausted = true;
      } else if (events.length) {
        this._host._winStart = Math.min(
          ...events.map((item) =>
            Math.floor(item?.start_time || before),
          ),
        );
      } else if (Number.isFinite(resolved?.after)) {
        this._host._winStart = resolved.after;
      } else {
        this._host._winStart = after;
      }
      this.cacheWindowEvents(clientId, cam, before, events);
      this._publishWindowEvents(clientId, cam, before, events);
    } catch (error) {
      console.error("[Frigate] events", error);
      if (
        isCameraGroup(this._host._activeCam) &&
        this._host._eventsLoadToken === loadToken &&
        this._windowContextMatches(clientId, cam, before)
      ) {
        this._publishActiveGroupMemberCombined(
          "events",
          this._host._activeCam?.entity || "",
        );
        return;
      }
      if (
        !hasRenderableCache &&
        !publishedProgress &&
        !this._isActiveGroupWindowPublishDeferred("events") &&
        this._host._eventsLoadToken === loadToken &&
        this._windowContextMatches(clientId, cam, before)
      ) {
        this._host._events = [];
      }
    }
  }

  async loadWindowRecordings(clientId, cam, before) {
    const bounds = this._resolveRecordingsDayBounds(before);
    const cacheKey = buildRecordingsDayCacheKey(clientId, cam, bounds);
    if (!this._host._recordingsDayDataCache) {
      this._host._recordingsDayDataCache = new Map();
    }
    if (!this._host._recordingsDayAvailabilityCache) {
      this._host._recordingsDayAvailabilityCache = new Map();
    }
    if (!this._host._recordingsDayFetchedAtCache) {
      this._host._recordingsDayFetchedAtCache = new Map();
    }

    const dataCache = this._host._recordingsDayDataCache;
    const secondaryTask = isCameraGroup(this._host._activeCam)
      ? this._loadActiveGroupSecondaryRecordings(before, bounds)
      : Promise.resolve([]);
    const finishGroup = async (recordings) => {
      if (isCameraGroup(this._host._activeCam)) {
        await secondaryTask;
        this.publishActiveGroupCombined("recordings");
      }
      return recordings;
    };
    const hasCached = dataCache.has(cacheKey);
    const cachedRecordings = hasCached ? dataCache.get(cacheKey) || [] : [];
    if (hasCached) {
      this._publishRecordingsDay(
        clientId,
        cam,
        bounds,
        cachedRecordings,
      );
    }

    const todayBounds = this._resolveRecordingsDayBounds(
      Math.floor(Date.now() / 1000),
    );
    const isToday =
      bounds.start === todayBounds.start && bounds.end === todayBounds.end;
    const fetchedAt = Number(
      this._host._recordingsDayFetchedAtCache.get(cacheKey) || 0,
    );
    const cacheIsFresh =
      fetchedAt > 0 && Date.now() - fetchedAt < this._recordingsFreshnessMs();
    if (hasCached && (!isToday || cacheIsFresh)) {
      return await finishGroup(cachedRecordings);
    }

    let lastProgressRecordings = null;
    try {
      const recordings = await this._fetchRecordingsDay(
        clientId,
        cam,
        bounds,
        {
          forceRefresh: hasCached,
          progressive: !hasCached,
          before,
          onProgress: (partialRecordings) => {
            lastProgressRecordings = partialRecordings;
            this._publishRecordingsDay(
              clientId,
              cam,
              bounds,
              partialRecordings,
            );
          },
        },
      );
      if (recordings !== lastProgressRecordings) {
        this._publishRecordingsDay(clientId, cam, bounds, recordings);
      }
      return await finishGroup(recordings);
    } catch (_) {
      if (!hasCached && this._recordingsContextMatches(clientId, cam, bounds)) {
        this._host._recordings = [];
        this.cacheActiveCamSlice("recordings", this._host._recordings);
      }
      return await finishGroup(cachedRecordings);
    }
  }

  async _loadActiveGroupSecondaryRecordings(before, bounds) {
    const primaryEntity = this._host._activeCam?.entity || "";
    const context = await this._activeGroupSecondaryContext();
    if (
      !context ||
      !this._activeGroupContextMatches(primaryEntity, before)
    ) {
      return [];
    }
    const { entity, clientId, cam, cache } = context;
    const cacheKey = buildRecordingsDayCacheKey(clientId, cam, bounds);
    const dataCache = this._host._recordingsDayDataCache;
    const hasCached = dataCache.has(cacheKey);
    const cachedRecordings = hasCached ? dataCache.get(cacheKey) || [] : [];
    if (hasCached) {
      cache.recordings = cachedRecordings;
      this.publishActiveGroupCombined("recordings");
    }
    const todayBounds = this._resolveRecordingsDayBounds(
      Math.floor(Date.now() / 1000),
    );
    const isToday =
      bounds.start === todayBounds.start && bounds.end === todayBounds.end;
    const fetchedAt = Number(
      this._host._recordingsDayFetchedAtCache.get(cacheKey) || 0,
    );
    const cacheIsFresh =
      fetchedAt > 0 && Date.now() - fetchedAt < this._recordingsFreshnessMs();
    if (hasCached && (!isToday || cacheIsFresh)) return cachedRecordings;
    try {
      const recordings = await this._fetchRecordingsDay(
        clientId,
        cam,
        bounds,
        {
          forceRefresh: hasCached,
          progressive: !hasCached,
          before,
          onProgress: (partialRecordings) => {
            if (!this._activeGroupContextMatches(primaryEntity, before)) {
              return;
            }
            cache.recordings = Array.isArray(partialRecordings)
              ? partialRecordings
              : [];
            this.publishActiveGroupCombined("recordings");
          },
        },
      );
      if (!this._activeGroupContextMatches(primaryEntity, before)) return [];
      cache.recordings = Array.isArray(recordings) ? recordings : [];
      this.publishActiveGroupCombined("recordings");
      return cache.recordings;
    } catch (_) {
      if (!hasCached) cache.recordings = [];
      return cachedRecordings;
    }
  }

  _resolveRecordingsDayBounds(timestamp) {
    if (this._host._recordingsDayBounds) {
      return this._host._recordingsDayBounds(timestamp);
    }
    return resolveRecordingsDayBounds({
      tsSec: timestamp,
      fallbackSec: this._host._winEnd,
      getTzParts: (target) => this._host._tzParts(target),
      toEpochSeconds: (year, month, day, hour, minute, second) =>
        this._host._tzDateTimeToEpochSeconds(
          year,
          month,
          day,
          hour,
          minute,
          second,
        ),
    });
  }

  _recordingsFreshnessMs() {
    const refreshSeconds = Math.max(
      15,
      Number(this._host._config?.refresh_seconds) || 45,
    );
    return refreshSeconds * 1000;
  }

  _recordingsContextMatches(clientId, cam, bounds) {
    if (typeof this._host._cc !== "function") return true;
    const active = this._host._cc();
    if (active?.clientId !== clientId || active?.cam !== cam) return false;
    const activeBounds = this._resolveRecordingsDayBounds(this._host._winEnd);
    return (
      activeBounds.start === bounds.start && activeBounds.end === bounds.end
    );
  }

  _publishRecordingsDay(clientId, cam, bounds, recordings) {
    if (!this._recordingsContextMatches(clientId, cam, bounds)) return false;
    const cameraRecordings = Array.isArray(recordings) ? recordings : [];
    this.cacheActiveCamSlice("recordings", cameraRecordings);
    this._host._recordings = isCameraGroup(this._host._activeCam)
      ? this._mergeActiveGroupCache("recordings") || cameraRecordings
      : cameraRecordings;
    this._host._renderList();
    return true;
  }

  async _fetchRecordingsDay(
    clientId,
    cam,
    bounds,
    {
      forceRefresh = false,
      progressive = false,
      before = null,
      onProgress = null,
    } = {},
  ) {
    const recordingsController = this._host._recordingsBrowseNavController;
    const progressiveLoader =
      recordingsController?.fetchRecordingsInBoundsProgressively;
    if (progressive && typeof progressiveLoader === "function") {
      return await progressiveLoader.call(
        recordingsController,
        bounds,
        clientId,
        cam,
        { before, onProgress },
      );
    }

    const sharedLoader = recordingsController?.fetchRecordingsInBounds;
    if (typeof sharedLoader === "function") {
      return await sharedLoader.call(
        recordingsController,
        bounds,
        clientId,
        cam,
        { forceRefresh },
      );
    }

    const key = buildRecordingsDayCacheKey(clientId, cam, bounds);
    const dataCache = this._host._recordingsDayDataCache;
    if (!forceRefresh && dataCache.has(key)) return dataCache.get(key) || [];
    if (!this._host._recordingsDayRequestCache) {
      this._host._recordingsDayRequestCache = new Map();
    }
    const requestCache = this._host._recordingsDayRequestCache;
    if (requestCache.has(key)) return await requestCache.get(key);

    const request = (async () => {
      const response = await this._host._ws({
        type: "frigate/recordings/get",
        instance_id: clientId,
        camera: cam,
        after: Math.max(0, bounds.start),
        before: bounds.end,
      });
      const recordings = Array.isArray(response) ? response : [];
      dataCache.set(key, recordings);
      this._host._recordingsDayAvailabilityCache.set(
        key,
        recordings.length > 0,
      );
      this._host._recordingsDayFetchedAtCache.set(key, Date.now());
      return recordings;
    })();
    requestCache.set(key, request);
    try {
      return await request;
    } finally {
      if (requestCache.get(key) === request) requestCache.delete(key);
    }
  }

  async loadWindowReviewsIfNeeded(
    clientId,
    cam,
    after,
    before,
    { reuseRecentCache = false } = {},
  ) {
    const loadToken = (Number(this._host._reviewsLoadToken) || 0) + 1;
    this._host._reviewsLoadToken = loadToken;
    if (
      this.hasCachedWindowReviews(clientId, cam, before, {
        allowRecent: reuseRecentCache,
      })
    ) {
      const entity = this._host._activeCam?.entity;
      const cachedReviews = this._host._camCache[entity]?.reviews || [];
      this._publishWindowReviews(clientId, cam, before, cachedReviews, {
        updateCache: false,
      });
      return;
    }
    try {
      const showAllReviews =
        this._host._activeCam?.alerts_content === "all_reviews";
      const reviewSeverity = showAllReviews ? "" : "alert";
      const selectedDay = !!this._host._calSelectedDay;
      const filterReviews = (reviews) =>
        showAllReviews
          ? reviews
          : reviews.filter((review) => reviewMatchesAlertsOnlyMode(review));
      const groupPublishState = this._activeGroupWindowPublishState();
      const hasRenderableCache = groupPublishState
        ? groupPublishState.reviews?.firstPaint !== true
        : Array.isArray(this._host._reviews) && this._host._reviews.length > 0;
      let publishedProgressResponse = false;
      let publishedProgressItems = false;
      const shouldContinue = () =>
        this._host._reviewsLoadToken === loadToken &&
        this._windowContextMatches(clientId, cam, before);
      const publishProgress = (partialReviews) => {
        const cameraReviews = filterReviews(
          Array.isArray(partialReviews) ? partialReviews : [],
        );
        if (
          hasRenderableCache ||
          publishedProgressItems ||
          (publishedProgressResponse && !cameraReviews.length) ||
          !shouldContinue()
        ) {
          return;
        }
        publishedProgressResponse = true;
        if (cameraReviews.length) publishedProgressItems = true;
        this._publishWindowReviews(
          clientId,
          cam,
          before,
          cameraReviews,
          { updateCache: false, complete: false },
        );
      };
      const resolved = selectedDay
        ? {
            items: await this.fetchWindowedReviews(
              clientId,
              cam,
              after,
              before,
              {
                debugLabel: "alerts-selected-day",
                severity: reviewSeverity,
                initialBatchLimit: INITIAL_BROWSE_PAINT_LIMIT,
                onPage: (partialReviews, pageState = {}) => {
                  if (!pageState.done) publishProgress(partialReviews);
                },
                shouldContinue,
              },
            ),
          }
        : await this.fetchRecentActiveDayReviews(
            clientId,
            cam,
            before,
            this._host._config?.alerts_reviews_days || 3,
            {
              debugLabel: "alerts-window",
              severity: reviewSeverity,
              itemFilter: showAllReviews ? null : reviewMatchesAlertsOnlyMode,
              onProgress: groupPublishState
                ? publishProgress
                : hasRenderableCache
                  ? null
                  : publishProgress,
              shouldContinue,
            },
          );
      if (
        this._host._reviewsLoadToken !== loadToken ||
        !this._windowContextMatches(clientId, cam, before)
      ) {
        return;
      }
      const reviews = Array.isArray(resolved?.items)
        ? filterReviews(resolved.items)
        : [];
      this._publishWindowReviews(clientId, cam, before, reviews);
    } catch (_) {
      if (
        isCameraGroup(this._host._activeCam) &&
        this._host._reviewsLoadToken === loadToken &&
        this._windowContextMatches(clientId, cam, before)
      ) {
        this._publishActiveGroupMemberCombined(
          "reviews",
          this._host._activeCam?.entity || "",
          { complete: true },
        );
      }
    }
  }

  goNow() {
    this._host._followNowWindow = true;
    const now = Math.floor(Date.now() / 1000);
    this._host._winEnd = now;
    this._host._winStart = now - this._host._config.window_days * DAY;
    this._host._calSelectedDay = null;
    this._host._exhausted = false;
    this._host._calMonth = null;
    this.pruneNonActiveCamWindowCaches();
    void (async () => {
      await this.loadWindow(true, { supersede: true });
      this.scheduleWarmOtherCamerasEvents();
    })();
  }
}
