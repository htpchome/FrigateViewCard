import { createDateFormatterCache } from "../../shared/date-formatter-cache.js";
import { applyLocalizedDates } from "./date-dom.js";
import {
  formatLocalizedMonthDay,
  formatLocalizedTime,
} from "./date-format.js";

export class LocalizedDateController {
  constructor(host) {
    this._host = host;
    this._formatterCache = createDateFormatterCache();
    this._resolvedBrowserTimeZone = null;
  }

  timezone() {
    const configuredTimeZone = this._host._hass?.config?.time_zone;
    if (configuredTimeZone) return configuredTimeZone;
    if (!this._resolvedBrowserTimeZone) {
      this._resolvedBrowserTimeZone =
        Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
    }
    return this._resolvedBrowserTimeZone;
  }

  formatter(name, locales, options, timeZone = this.timezone()) {
    const resolvedTimeZone = String(timeZone || "UTC");
    return this._formatterCache.get(
      JSON.stringify([name, resolvedTimeZone, locales, options]),
      locales,
      { ...options, timeZone: resolvedTimeZone },
    );
  }

  timezoneOffsetMinutesAt(epochMs, timeZone = this.timezone()) {
    const formatter = this.formatter(
      "wall-clock",
      "en-US",
      {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hourCycle: "h23",
      },
      timeZone,
    );
    const parts = formatter.formatToParts(new Date(epochMs));
    const pick = (type) =>
      Number(parts.find((part) => part.type === type)?.value || 0);
    const asUtcMs = Date.UTC(
      pick("year"),
      pick("month") - 1,
      pick("day"),
      pick("hour"),
      pick("minute"),
      pick("second"),
    );
    return (asUtcMs - epochMs) / 60000;
  }

  timezoneDateTimeToEpochSeconds(
    year,
    month,
    day,
    hour = 0,
    minute = 0,
    second = 0,
  ) {
    const wallClockUtcMs = Date.UTC(
      year,
      month - 1,
      day,
      hour,
      minute,
      second,
    );
    let epochMs = wallClockUtcMs;
    for (let iteration = 0; iteration < 3; iteration++) {
      const offsetMinutes = this.timezoneOffsetMinutesAt(epochMs);
      epochMs = wallClockUtcMs - offsetMinutes * 60000;
    }
    return Math.floor(epochMs / 1000);
  }

  timezoneParts(timestamp) {
    const formatter = this.formatter("wall-clock", "en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hourCycle: "h23",
    });
    const parts = formatter.formatToParts(new Date(timestamp * 1000));
    const pick = (type) =>
      Number(parts.find((part) => part.type === type)?.value || 0);
    return {
      year: pick("year"),
      month: pick("month"),
      day: pick("day"),
      hour: pick("hour"),
      minute: pick("minute"),
      second: pick("second"),
    };
  }

  time(timestamp) {
    return formatLocalizedTime(timestamp, {
      locale: this._host._localization.resolvedLanguage,
      timeFormat: this._host._hass?.locale?.time_format,
      formatter: (name, locale, options) =>
        this.formatter(name, locale, options),
    });
  }

  weekday(timestamp) {
    const locale = this._host._localization.resolvedLanguage;
    return this.formatter("weekday", locale, {
      weekday: "short",
    }).format(new Date(timestamp * 1000));
  }

  monthDay(timestamp, { ordinal = false, numeric = false } = {}) {
    return formatLocalizedMonthDay(timestamp, {
      locale: this._host._localization.resolvedLanguage,
      numeric,
      ordinal,
      formatter: (name, locale, options) =>
        this.formatter(name, locale, options),
      ordinalize: (day) => this.ordinal(day),
    });
  }

  ordinal(value) {
    const mod100 = value % 100;
    if (mod100 >= 11 && mod100 <= 13) return `${value}th`;
    const mod10 = value % 10;
    if (mod10 === 1) return `${value}st`;
    if (mod10 === 2) return `${value}nd`;
    if (mod10 === 3) return `${value}rd`;
    return `${value}th`;
  }

  dateTimeLabel(timestamp) {
    return this._host._localization.t("runtime.date.dateTime", {
      weekday: this.weekday(timestamp),
      date: this.monthDay(timestamp),
      time: this.time(timestamp),
    });
  }

  weekdayDate(timestamp, key = "weekdayDate") {
    return this._host._localization.t(`runtime.date.${key}`, {
      weekday: this.weekday(timestamp),
      date: this.monthDay(timestamp, { ordinal: key !== "weekdayDate" }),
    });
  }

  fullDate(timestamp) {
    if (!timestamp) return "-";
    const locale = this._host._localization.resolvedLanguage;
    return this.formatter("popup-card-view-date", locale, {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(new Date(timestamp * 1000));
  }

  applyLocalizedDates() {
    applyLocalizedDates(this._host.shadowRoot, {
      time: (timestamp) => this.time(timestamp),
      compactTime: (timestamp) =>
        this.time(timestamp).replace(/\s+(am|pm)$/i, "$1"),
      weekdayDate: (timestamp) => this.weekdayDate(timestamp),
      weekdayDateDot: (timestamp) =>
        this.weekdayDate(timestamp, "weekdayDateDot"),
      weekdayDateHyphen: (timestamp) =>
        this.weekdayDate(timestamp, "weekdayDateHyphen"),
      shortDate: (timestamp) => this.monthDay(timestamp, { numeric: true }),
      fullDate: (timestamp) => this.fullDate(timestamp),
      dateTime: (timestamp) => this.dateTimeLabel(timestamp),
      popupOverlay: (timestamp, element) =>
        this._host._localization.t("runtime.date.popupOverlay", {
          camera: element.getAttribute("data-fvc-date-camera") || "-",
          time: this.time(timestamp).replace(/\s+(am|pm)$/i, "$1"),
          date: this.fullDate(timestamp),
        }),
    });
  }

  dayKey(timestamp) {
    const parts = this.formatter("day-key", "en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).formatToParts(new Date(timestamp * 1000));
    const pick = (type) =>
      parts.find((part) => part.type === type)?.value || "00";
    return `${pick("year")}-${pick("month")}-${pick("day")}`;
  }

  calendarMonthLabel(monthDate, timeZone = this.timezone()) {
    const locale = this._host._localization.resolvedLanguage;
    return this.formatter(
      `calendar-month-${locale}`,
      locale,
      { month: "long", year: "numeric" },
      timeZone,
    ).format(monthDate);
  }
}
