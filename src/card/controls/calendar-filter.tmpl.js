import { cap } from "../helpers.js";

export function buildCalendarPanelMarkup({
  monthDate,
  activeDayDateString,
  daysWithActivity,
  timeZone,
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
    cells += `<button class="cday ${ds === activeDayDateString ? "active" : ""}" data-cal-day="${ds}">${day}${activityDays.has(ds) ? '<i class="cdot"></i>' : ""}</button>`;
  }
  const monthLabel = new Intl.DateTimeFormat([], {
    month: "long",
    year: "numeric",
    timeZone,
  }).format(monthDate);
  return `<div class="cal-top"><button class="cal-today-btn" data-cal-today>Today</button></div>
      <div class="cal-head"><button data-cal-nav="-1">‹</button><b>${monthLabel}</b><button data-cal-nav="1">›</button></div>
      <div class="cal-dow"><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span><span>S</span></div>
      <div class="cal-grid">${cells}</div>`;
}

export function buildFilterPanelMarkup({
  labels,
  zones,
  filterLabel,
  filterZone,
  favOnly,
}) {
  const chip = (val, cur, attr) =>
    `<button class="chip ${val === cur ? "on" : ""}" data-${attr}="${val}">${val === "all" ? "All" : cap(val)}</button>`;
  return `<div class="frow"><span class="frow-l">Label</span>${labels.map((label) => chip(label, filterLabel, "flabel")).join("")}</div>
      <div class="frow"><span class="frow-l">Zone</span>${zones.map((zone) => chip(zone, filterZone, "fzone")).join("")}</div>
      <div class="frow"><span class="frow-l">Show</span>
        <button class="chip ${!favOnly ? "on" : ""}" data-favonly="0">All</button>
        <button class="chip ${favOnly ? "on" : ""}" data-favonly="1">★ Favorites</button></div>`;
}
