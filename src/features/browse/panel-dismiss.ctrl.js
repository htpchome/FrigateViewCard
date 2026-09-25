const eventPath = (event) => {
  const path = event?.composedPath?.();
  return Array.isArray(path) && path.length ? path : [event?.target];
};

const pathContains = (path, element) => {
  if (!element) return false;
  return path.some((candidate) => {
    if (!candidate) return false;
    if (candidate === element) return true;
    try {
      return element.contains?.(candidate) === true;
    } catch (_) {
      return false;
    }
  });
};

const pathMatches = (path, selector) =>
  path.some(
    (candidate) =>
      candidate?.matches?.(selector) || candidate?.closest?.(selector),
  );

const isPanelOpen = (panel) =>
  !!panel && panel.hidden !== true && panel.style?.display !== "none";

export class BrowsePanelDismissController {
  constructor(host) {
    this._host = host;
  }

  handleDocumentPointerDown(event) {
    // Card View owns separate calendar and drawer popovers with their own
    // document-level dismissal lifecycle.
    if (this._host._cardViewPageController?.isActive?.()) return false;

    const path = eventPath(event);
    const filterPanel = this._host._pageShellRegion?.("filterPanel");
    const calendarPanel = this._host._pageShellRegion?.("calendarPanel");
    let changed = false;

    if (
      isPanelOpen(filterPanel) &&
      !pathContains(path, filterPanel) &&
      !pathMatches(path, "#filter-btn")
    ) {
      filterPanel.style.display = "none";
      changed = true;
    }

    if (
      isPanelOpen(calendarPanel) &&
      !pathContains(path, calendarPanel) &&
      !pathMatches(path, "#cal-btn")
    ) {
      calendarPanel.style.display = "none";
      changed = true;
    }

    if (changed) this._host._syncToolbarButtons?.();
    return changed;
  }
}
