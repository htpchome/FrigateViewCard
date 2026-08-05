export class BrowseCalendarActivityController {
  constructor(host) {
    this._host = host;
  }

  async loadCalendar() {
    await this.prefetchCalendarActivityForActiveCamera();
  }

  calendarActivityCacheKey(clientId, cam, tz = this._host._tz()) {
    return `${clientId || ""}|${cam || ""}|${tz || "UTC"}`;
  }

  applyCalendarActivityCacheForActiveCamera() {
    const { clientId, cam } = this._host._cc();
    const key = this.calendarActivityCacheKey(clientId, cam);
    const cached = this._host._calendarActivityByCam.get(key);
    this._host._daysWithActivity = cached ? new Set(cached) : new Set();
  }

  async prefetchCalendarActivityForActiveCamera() {
    const { clientId, cam } = this._host._cc();
    if (!clientId || !cam) {
      this._host._daysWithActivity = new Set();
      return;
    }
    const tz = this._host._tz();
    const key = this.calendarActivityCacheKey(clientId, cam, tz);
    const cached = this._host._calendarActivityByCam.get(key);
    if (cached) {
      this._host._daysWithActivity = new Set(cached);
      return;
    }
    const existing = this._host._calendarActivityInFlight.get(key);
    if (existing) {
      await existing;
      return;
    }
    const task = (async () => {
      try {
        const summary = await this._host._ws({
          type: "frigate/events/summary",
          instance_id: clientId,
          timezone: tz,
        });
        const days = Array.isArray(summary)
          ? new Set(
              summary
                .filter((item) => item.camera === cam && item.day)
                .map((item) => item.day),
            )
          : new Set();
        this._host._calendarActivityByCam.set(key, days);
        const active = this._host._cc();
        const activeKey = this.calendarActivityCacheKey(
          active.clientId,
          active.cam,
          tz,
        );
        if (activeKey === key) {
          this._host._daysWithActivity = new Set(days);
          if (this._host._$("cal-panel")?.style.display !== "none") {
            this._host._renderCal();
          }
        }
      } catch (_) {}
    })();
    this._host._calendarActivityInFlight.set(key, task);
    try {
      await task;
    } finally {
      this._host._calendarActivityInFlight.delete(key);
    }
  }
}
