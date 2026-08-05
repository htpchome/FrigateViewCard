export class EditorPreviewContextController {
  constructor(host) {
    this._host = host;
    this._watchdogTimer = null;
    this._dialogObserver = null;
    this._dialogOpenLast = false;
    this._dashboardEditLast = false;
    this._lastEditorPreviewContext = null;
  }

  dispose() {
    if (this._watchdogTimer) clearInterval(this._watchdogTimer);
    this._watchdogTimer = null;
    if (this._dialogObserver) this._dialogObserver.disconnect();
    this._dialogObserver = null;
  }

  syncHassPreviewContext() {
    const inEditorPreview = this.isEditorPreviewContext();
    if (this._lastEditorPreviewContext === true && !inEditorPreview) {
      this._host._scheduleResumeLive("hass-edit-exit");
    }
    this._lastEditorPreviewContext = inEditorPreview;
    return inEditorPreview;
  }

  startEditModeWatchdog() {
    if (this._watchdogTimer) clearInterval(this._watchdogTimer);
    this._lastEditorPreviewContext = this.isEditorPreviewContext();
    this._dialogOpenLast = this.isCardEditorDialogOpen();
    this._dashboardEditLast = this.isDashboardEditMode();
    this._watchdogTimer = setInterval(() => {
      if (!this._host.isConnected) return;
      const inEditorPreview = this.isEditorPreviewContext();
      const dialogOpen = this.isCardEditorDialogOpen();
      const dashboardEdit = this.isDashboardEditMode();
      if (this._dialogOpenLast && !dialogOpen) {
        this._host._scheduleResumeLive("watchdog-dialog-close");
      }
      if (this._lastEditorPreviewContext === true && !inEditorPreview) {
        this._host._scheduleResumeLive("watchdog-edit-exit");
      }
      if (this._dashboardEditLast !== dashboardEdit) {
        this._host._scheduleResumeLive(
          dashboardEdit
            ? "watchdog-dashboard-edit-on"
            : "watchdog-dashboard-edit-off",
        );
      }
      if (dashboardEdit) {
        this._host._kickLiveIfStale(true);
      }
      this._dialogOpenLast = dialogOpen;
      this._dashboardEditLast = dashboardEdit;
      this._lastEditorPreviewContext = inEditorPreview;
    }, 600);
  }

  isDashboardEditMode() {
    try {
      const href = String(window.location?.href || "");
      if (!href) return false;
      const url = new URL(href, window.location.origin);
      const edit =
        url.searchParams.get("edit") ||
        url.searchParams.get("dashboard_edit") ||
        "";
      return /^(1|true|yes|on)$/i.test(String(edit));
    } catch (_) {
      return false;
    }
  }

  isCardEditorDialogOpen() {
    const dialogHost = document.querySelector("hui-dialog-edit-card");
    if (!dialogHost) return false;
    const root = dialogHost.shadowRoot;
    const haDialog =
      root?.querySelector?.("ha-dialog") ||
      dialogHost.querySelector?.("ha-dialog") ||
      null;
    if (haDialog) {
      if (haDialog.opened === true) return true;
      if (haDialog.hasAttribute?.("open")) return true;
      if (haDialog.hasAttribute?.("opened")) return true;
      if (haDialog.getAttribute?.("aria-hidden") === "false") return true;
      if (haDialog.getAttribute?.("aria-hidden") === "true") return false;
      if (haDialog.hidden === true) return false;
      const dialogStyle = window.getComputedStyle?.(haDialog);
      if (
        dialogStyle?.display === "none" ||
        dialogStyle?.visibility === "hidden"
      ) {
        return false;
      }
      return true;
    }
    const hostStyle = window.getComputedStyle?.(dialogHost);
    if (hostStyle?.display === "none" || hostStyle?.visibility === "hidden") {
      return false;
    }
    if (dialogHost.hidden === true) return false;
    if (dialogHost.getAttribute?.("aria-hidden") === "true") return false;
    return true;
  }

  startEditorDialogCloseObserver() {
    if (this._dialogObserver) this._dialogObserver.disconnect();
    this._dialogObserver = null;
    this._dialogOpenLast = this.isCardEditorDialogOpen();
    if (!("MutationObserver" in window) || !document.body) return;
    this._dialogObserver = new MutationObserver(() => {
      const openNow = this.isCardEditorDialogOpen();
      if (this._dialogOpenLast && !openNow) {
        this._host._scheduleResumeLive("card-editor-close");
      }
      this._dialogOpenLast = openNow;
    });
    this._dialogObserver.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["open", "opened", "hidden", "class", "style"],
    });
  }

  isEditorPreviewContext() {
    let el = this._host;
    let depth = 0;
    while (el && depth < 48) {
      const tag = String(el.tagName || "").toUpperCase();
      if (tag === "HUI-CARD-PREVIEW" || tag === "HUI-DIALOG-EDIT-CARD") {
        return true;
      }
      const root = el.getRootNode?.();
      if (root?.host && root.host !== el) {
        el = root.host;
        depth += 1;
        continue;
      }
      el = el.parentNode || el.host;
      depth += 1;
    }
    return false;
  }

  isCardPickerPreviewContext() {
    let el = this._host;
    let depth = 0;
    while (el && depth < 64) {
      const tag = String(el.tagName || "").toUpperCase();
      if (
        tag === "HUI-CARD-PICKER" ||
        tag === "HUI-DIALOG-CREATE-CARD" ||
        tag === "HUI-CARD-OPTIONS"
      ) {
        return true;
      }
      const root = el.getRootNode?.();
      if (root?.host && root.host !== el) {
        el = root.host;
        depth += 1;
        continue;
      }
      el = el.parentNode || el.host;
      depth += 1;
    }
    return false;
  }

  isPreviewContext() {
    return this.isEditorPreviewContext() || this.isCardPickerPreviewContext();
  }
}
