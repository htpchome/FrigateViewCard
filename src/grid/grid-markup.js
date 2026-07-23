/**
 * Builds one signature fragment for a grid slot.
 * @param {object} args
 * @param {number} args.index
 * @param {string} args.entity
 * @param {string} args.severity
 * @param {boolean} args.useLive
 * @param {string} args.liveStreamHint
 * @returns {string}
 */
export function buildGridSignaturePart({
  index,
  entity,
  severity,
  useLive,
  liveStreamHint,
}) {
  if (index < 0) return "-1";
  return `${index}:${entity}:${severity || "none"}:${useLive ? `live:${liveStreamHint}` : "snap"}`;
}

/**
 * Creates a grid root element.
 * @returns {HTMLDivElement}
 */
export function createGridRootElement() {
  const grid = document.createElement("div");
  grid.className = "live-grid";
  return grid;
}

/**
 * Creates a grid cell element.
 * @returns {HTMLDivElement}
 */
export function createGridCellElement() {
  const cell = document.createElement("div");
  cell.className = "live-grid-cell";
  return cell;
}

/**
 * Applies grid severity classes to the provided cell.
 * @param {HTMLDivElement} cell
 * @param {string} severity
 */
export function applyGridCellSeverityClass(cell, severity) {
  if (severity === "alert") cell.classList.add("grid-alert");
  if (severity === "detection") cell.classList.add("grid-detection");
}

/**
 * Creates a grid label element.
 * @param {string} labelText
 * @returns {HTMLDivElement}
 */
export function createGridLabelElement(labelText) {
  const label = document.createElement("div");
  label.className = "live-grid-label";
  label.textContent = labelText;
  return label;
}

/**
 * Renders an empty grid placeholder in a cell.
 * @param {HTMLDivElement} cell
 * @param {string} liveIconSvg
 */
export function renderGridEmptyPlaceholder(cell, liveIconSvg) {
  cell.classList.add("empty");
  cell.innerHTML = `<div class="ph">${liveIconSvg}<span>Empty</span></div>`;
}
