import { cap } from "../../helpers.js";
import { escapeHtml, escapeHtmlAttribute } from "../../shared/html.js";

export function buildCalendarPanelMarkup({
  monthDate,
  activeDayDateString,
  todayDateString = "",
  daysWithActivity,
  timeZone,
  locale = "en",
  monthLabel = "",
  showReset = false,
}) {
  const year = monthDate.getUTCFullYear();
  const monthIndex = monthDate.getUTCMonth();
  const first = new Date(Date.UTC(year, monthIndex, 1, 12, 0, 0));
  const startDow = (first.getUTCDay() + 6) % 7;
  const days = new Date(
    Date.UTC(year, monthIndex + 1, 0, 12, 0, 0),
  ).getUTCDate();
  const activityDays =
    daysWithActivity instanceof Set
      ? daysWithActivity
      : new Set(daysWithActivity);
  let cells = "";
  for (let i = 0; i < startDow; i++) cells += "<span></span>";
  for (let day = 1; day <= days; day++) {
    const ds = `${year}-${String(monthIndex + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const classes = ["cday"];
    if (ds === todayDateString) classes.push("today");
    if (ds === activeDayDateString) classes.push("active");
    cells += `<button class="${classes.join(" ")}" data-cal-day="${ds}">${day}${activityDays.has(ds) ? '<i class="cdot"></i>' : ""}</button>`;
  }
  const resolvedMonthLabel =
    String(monthLabel || "") ||
    new Intl.DateTimeFormat(locale, {
      month: "long",
      year: "numeric",
      timeZone,
    }).format(monthDate);
  const resetMarkup = showReset
    ? '<div class="cal-top"><button class="cal-today-btn" data-cal-reset data-fvc-i18n="runtime.browse.resetCalendar">Reset</button></div>'
    : "";
  return `${resetMarkup}<div class="cal-head"><button data-cal-nav="-1" aria-label="Previous month" data-fvc-i18n-aria-label="runtime.browse.previousMonth">‹</button><b data-fvc-calendar-month>${escapeHtml(resolvedMonthLabel)}</b><button data-cal-nav="1" aria-label="Next month" data-fvc-i18n-aria-label="runtime.browse.nextMonth">›</button></div>
      <div class="cal-dow"><span data-fvc-i18n="runtime.browse.weekdays.monday">M</span><span data-fvc-i18n="runtime.browse.weekdays.tuesday">T</span><span data-fvc-i18n="runtime.browse.weekdays.wednesday">W</span><span data-fvc-i18n="runtime.browse.weekdays.thursday">T</span><span data-fvc-i18n="runtime.browse.weekdays.friday">F</span><span data-fvc-i18n="runtime.browse.weekdays.saturday">S</span><span data-fvc-i18n="runtime.browse.weekdays.sunday">S</span></div>
      <div class="cal-grid">${cells}</div>`;
}

export function buildFilterPanelMarkup({
  labels,
  zones,
  filterLabel,
  filterZone,
  favOnly,
}) {
  const selectedValues = (selection) =>
    new Set(
      (Array.isArray(selection) ? selection : [selection])
        .map((value) => String(value || "").trim())
        .filter((value) => value && value !== "all"),
    );
  const labelSelections = selectedValues(filterLabel);
  const zoneSelections = selectedValues(filterZone);
  const chip = (val, selections, attr) => {
    const active = val === "all" ? !selections.size : selections.has(val);
    const localization = val === "all"
      ? ' data-fvc-i18n="runtime.browse.filter.all"'
      : "";
    return `<button class="chip ${active ? "on" : ""}" type="button" aria-pressed="${active}" data-${attr}="${escapeHtmlAttribute(val)}"${localization}>${val === "all" ? "All" : escapeHtml(cap(val))}</button>`;
  };
  const filterRow = (label, key, values, selections, attr) =>
    `<div class="frow"><span class="frow-l" data-fvc-i18n="${key}">${label}</span><div class="frow-chips">${values.map((value) => chip(value, selections, attr)).join("")}</div></div>`;
  return `${filterRow("Label", "runtime.browse.filter.label", labels, labelSelections, "flabel")}
      ${filterRow("Zone", "runtime.browse.filter.zone", zones, zoneSelections, "fzone")}
      <div class="frow"><span class="frow-l" data-fvc-i18n="runtime.browse.filter.show">Show</span><div class="frow-chips">
        <button class="chip ${!favOnly ? "on" : ""}" type="button" aria-pressed="${!favOnly}" data-favonly="0" data-fvc-i18n="runtime.browse.filter.all">All</button>
        <button class="chip ${favOnly ? "on" : ""}" type="button" aria-pressed="${favOnly}" data-favonly="1" data-fvc-i18n="runtime.browse.filter.favorites">★ Favorites</button></div></div>`;
}
