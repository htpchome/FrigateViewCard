export class BrowseCalendarPanelController {
  constructor(host, deps = {}) {
    this._host = host;
    this._deps = {
      buildCalendarPanelMarkup: () => "",
      nowEpochSeconds: () => Math.floor(Date.now() / 1000),
      ...deps,
    };
  }

  handleSidebarCalendarClick(target) {
    const calendarDay = target.closest("[data-cal-day]");
    if (calendarDay) {
      this.pickDay(calendarDay.dataset.calDay);
      return true;
    }
    const calendarNav = target.closest("[data-cal-nav]");
    if (calendarNav) {
      this.calNav(Number(calendarNav.dataset.calNav));
      return true;
    }
    const calendarReset = target.closest("[data-cal-reset]");
    if (calendarReset) {
      this.resetCalendarSelection();
      return true;
    }
    return false;
  }

  toggleCalendar() {
    const panel = this._host._pageShellRegion("calendarPanel");
    if (!panel) return;
    const open = panel.style.display === "none";
    const filterPanel = this._host._pageShellRegion("filterPanel");
    if (filterPanel) filterPanel.style.display = "none";
    panel.style.display = open ? "block" : "none";
    this._host._syncToolbarButtons();
    if (!open) return;
    if (!this._host._calMonth) {
      const parts = this._host._tzParts(this._host._winEnd);
      this._host._calMonth = this.createCalendarMonthDate(
        parts.year,
        parts.month - 1,
      );
    }
    this._host._applyCalendarActivityCacheForActiveCamera();
    this.renderCal();
    void this._host._prefetchCalendarActivityForActiveCamera();
  }

  formatTzDateString(parts) {
    return `${parts.year}-${String(parts.month).padStart(2, "0")}-${String(parts.day).padStart(2, "0")}`;
  }

  calendarTodayDateString() {
    return this.formatTzDateString(
      this._host._tzParts(this._deps.nowEpochSeconds()),
    );
  }

  activeCalendarDayDateString() {
    return this._host._calSelectedDay || "";
  }

  resetCalendarSelection() {
    const now = this._deps.nowEpochSeconds();
    this._host._followNowWindow = true;
    this._host._calSelectedDay = null;
    this._host._calMonth = null;
    this._host._winEnd = now;
    this._host._winStart =
      now - (this._host._config?.window_days || 1) * 86400;
    this._host._exhausted = false;
    this._closeAndReloadWindow();
  }

  goTodayInCalendar() {
    this.resetCalendarSelection();
  }

  createCalendarMonthDate(year, monthIndex) {
    return new Date(Date.UTC(year, monthIndex, 15, 12, 0, 0));
  }

  resolveCalendarMonthDate() {
    if (this._host._calMonth instanceof Date) {
      return new Date(this._host._calMonth);
    }
    const parts = this._host._tzParts(this._host._winEnd);
    return this.createCalendarMonthDate(parts.year, parts.month - 1);
  }

  calNav(delta) {
    const monthDate = this.resolveCalendarMonthDate();
    monthDate.setUTCMonth(monthDate.getUTCMonth() + delta);
    this._host._calMonth = new Date(monthDate);
    this.renderCal();
  }

  pickDay(dateString) {
    this._host._followNowWindow = false;
    this._host._calSelectedDay = dateString;
    const [year, month, day] = dateString.split("-").map(Number);
    this._host._winStart = this._host._tzDateTimeToEpochSeconds(
      year,
      month,
      day,
      0,
      0,
      0,
    );
    this._host._winEnd = Math.min(
      this._host._tzDateTimeToEpochSeconds(year, month, day, 23, 59, 59),
      this._deps.nowEpochSeconds(),
    );
    this._host._exhausted = true;
    this._closeAndReloadWindow();
  }

  _closeAndReloadWindow() {
    const panel = this._host._pageShellRegion("calendarPanel");
    if (panel) panel.style.display = "none";
    this._host._syncToolbarButtons();
    this._host._browseWindowLoaderController?.pruneNonActiveCamWindowCaches?.() ??
      this._host._pruneNonActiveCamWindowCaches?.();

    this._host._events = [];
    this._host._reviews = [];
    this._host._recordings = [];
    const loadPromise =
      this._host._browseWindowLoaderController?.loadWindow?.(true, {
        supersede: true,
      }) ?? this._host._loadWindow?.(true, { supersede: true });
    this._host._renderList?.();
    void (async () => {
      await loadPromise;
      this._host._browseWindowLoaderController?.scheduleWarmOtherCamerasEvents?.() ??
        this._host._scheduleWarmOtherCamerasEvents?.();
    })();
  }

  renderCal() {
    const panel = this._host._pageShellRegion("calendarPanel");
    if (!panel) return;
    const monthDate = this.resolveCalendarMonthDate();
    const timeZone = this._host._tz();
    panel.innerHTML = this._deps.buildCalendarPanelMarkup({
      monthDate,
      activeDayDateString: this.activeCalendarDayDateString(),
      todayDateString: this.calendarTodayDateString(),
      daysWithActivity: this._host._daysWithActivity,
      timeZone,
      monthLabel: this._host._calendarMonthLabel?.(monthDate, timeZone) || "",
      showReset: !!this._host._calSelectedDay,
    });
  }
}
