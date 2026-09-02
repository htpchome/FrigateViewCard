import {
  cameraMemberEntities,
  isCameraGroup,
} from "../camera-groups/model.js";

const sharedSummaryScopesByConnection = new WeakMap();

const createSummaryScope = () => ({
  activityByInstance: new Map(),
  requestsByInstance: new Map(),
});

const buildSummaryKey = (clientId, timezone) =>
  `${clientId || ""}|${timezone || "UTC"}`;

const compactSummaryActivity = (summary) => {
  const daysByCamera = new Map();
  for (const item of Array.isArray(summary) ? summary : []) {
    const camera = String(item?.camera || "").trim();
    const day = String(item?.day || "").trim();
    if (!camera || !day) continue;
    if (!daysByCamera.has(camera)) daysByCamera.set(camera, new Set());
    daysByCamera.get(camera).add(day);
  }
  return daysByCamera;
};

export class BrowseCalendarActivityController {
  constructor(host) {
    this._host = host;
    this._localSummaryScope = createSummaryScope();
  }

  async loadCalendar() {
    await this.prefetchCalendarActivityForActiveCamera();
  }

  calendarActivityCacheKey(clientId, cam, tz = this._host._tz()) {
    return `${clientId || ""}|${cam || ""}|${tz || "UTC"}`;
  }

  calendarSummaryCacheKey(clientId, tz = this._host._tz()) {
    return buildSummaryKey(clientId, tz);
  }

  _summaryScope() {
    const connection = this._host?._hass?.connection;
    if (!connection || typeof connection !== "object") {
      return this._localSummaryScope;
    }
    let scope = sharedSummaryScopesByConnection.get(connection);
    if (!scope) {
      scope = createSummaryScope();
      sharedSummaryScopesByConnection.set(connection, scope);
    }
    return scope;
  }

  _cacheSummaryForHost(clientId, tz, daysByCamera) {
    for (const [camera, days] of daysByCamera || []) {
      const key = this.calendarActivityCacheKey(clientId, camera, tz);
      this._host._calendarActivityByCam.set(key, new Set(days));
    }
  }

  _activeCalendarContexts() {
    return cameraMemberEntities(this._host._activeCam)
      .map((entity) => {
        const cache = this._host._camCache?.[entity];
        return cache?.clientId && cache?.cam
          ? {
              entity,
              clientId: cache.clientId,
              cam: cache.cam,
            }
          : null;
      })
      .filter(Boolean);
  }

  _applyCalendarContexts(contexts, tz) {
    const activeDays = new Set();
    for (const { clientId, cam } of contexts) {
      this._applySharedSummaryForCamera(clientId, cam, tz);
      const key = this.calendarActivityCacheKey(clientId, cam, tz);
      const days = this._host._calendarActivityByCam.get(key);
      for (const day of days || []) activeDays.add(day);
    }
    this._host._daysWithActivity = activeDays;
  }

  _applySharedSummaryForCamera(clientId, cam, tz) {
    const summaryKey = this.calendarSummaryCacheKey(clientId, tz);
    const daysByCamera =
      this._summaryScope().activityByInstance.get(summaryKey);
    if (!daysByCamera) return false;
    this._cacheSummaryForHost(clientId, tz, daysByCamera);
    const key = this.calendarActivityCacheKey(clientId, cam, tz);
    if (!this._host._calendarActivityByCam.has(key)) {
      this._host._calendarActivityByCam.set(key, new Set());
    }
    return true;
  }

  async _loadSharedSummaryActivity(clientId, tz) {
    const summaryKey = this.calendarSummaryCacheKey(clientId, tz);
    const scope = this._summaryScope();
    const cached = scope.activityByInstance.get(summaryKey);
    if (cached) return cached;

    const existing = scope.requestsByInstance.get(summaryKey);
    if (existing) return await existing;

    const request = (async () => {
      const summary = await this._host._ws({
        type: "frigate/events/summary",
        instance_id: clientId,
        timezone: tz,
      });
      const daysByCamera = compactSummaryActivity(summary);
      scope.activityByInstance.set(summaryKey, daysByCamera);
      return daysByCamera;
    })();
    scope.requestsByInstance.set(summaryKey, request);
    try {
      return await request;
    } finally {
      if (scope.requestsByInstance.get(summaryKey) === request) {
        scope.requestsByInstance.delete(summaryKey);
      }
    }
  }

  applyCalendarActivityCacheForActiveCamera() {
    if (isCameraGroup(this._host._activeCam)) {
      this._applyCalendarContexts(
        this._activeCalendarContexts(),
        this._host._tz(),
      );
      return;
    }
    const { clientId, cam } = this._host._cc();
    const tz = this._host._tz();
    this._applySharedSummaryForCamera(clientId, cam, tz);
    const key = this.calendarActivityCacheKey(clientId, cam);
    const cached = this._host._calendarActivityByCam.get(key);
    this._host._daysWithActivity = cached ? new Set(cached) : new Set();
  }

  async prefetchCalendarActivityForActiveCamera() {
    if (isCameraGroup(this._host._activeCam)) {
      const primaryEntity = this._host._activeCam?.entity || "";
      await Promise.all(
        cameraMemberEntities(this._host._activeCam).map((entity) =>
          this._host._discoverOne?.(entity),
        ),
      );
      const contexts = this._activeCalendarContexts();
      const tz = this._host._tz();
      await Promise.all(
        contexts.map(async ({ clientId }) => {
          const daysByCamera = await this._loadSharedSummaryActivity(
            clientId,
            tz,
          );
          this._cacheSummaryForHost(clientId, tz, daysByCamera);
        }),
      ).catch(() => {});
      if (
        this._host._activeCam?.entity !== primaryEntity ||
        !isCameraGroup(this._host._activeCam)
      ) {
        return;
      }
      this._applyCalendarContexts(contexts, tz);
      if (this._host._$("#cal-panel")?.style.display !== "none") {
        this._host._renderCal();
      }
      return;
    }
    const { clientId, cam } = this._host._cc();
    if (!clientId || !cam) {
      this._host._daysWithActivity = new Set();
      return;
    }
    const tz = this._host._tz();
    const key = this.calendarActivityCacheKey(clientId, cam, tz);
    this._applySharedSummaryForCamera(clientId, cam, tz);
    const cached = this._host._calendarActivityByCam.get(key);
    if (cached) {
      this._host._daysWithActivity = new Set(cached);
      return;
    }
    const summaryKey = this.calendarSummaryCacheKey(clientId, tz);
    const existing = this._host._calendarActivityInFlight.get(summaryKey);
    if (existing) {
      await existing;
      this.applyCalendarActivityCacheForActiveCamera();
      return;
    }
    const task = (async () => {
      try {
        const daysByCamera = await this._loadSharedSummaryActivity(
          clientId,
          tz,
        );
        this._cacheSummaryForHost(clientId, tz, daysByCamera);
        if (!this._host._calendarActivityByCam.has(key)) {
          this._host._calendarActivityByCam.set(key, new Set());
        }
        const active = this._host._cc();
        const activeKey = this.calendarActivityCacheKey(
          active.clientId,
          active.cam,
          tz,
        );
        if (!this._host._calendarActivityByCam.has(activeKey)) {
          this._host._calendarActivityByCam.set(activeKey, new Set());
        }
        const activeDays = this._host._calendarActivityByCam.get(activeKey);
        this._host._daysWithActivity = new Set(activeDays);
        if (this._host._$("#cal-panel")?.style.display !== "none") {
          this._host._renderCal();
        }
      } catch (_) {}
    })();
    this._host._calendarActivityInFlight.set(summaryKey, task);
    try {
      await task;
    } finally {
      if (this._host._calendarActivityInFlight.get(summaryKey) === task) {
        this._host._calendarActivityInFlight.delete(summaryKey);
      }
    }
  }
}
