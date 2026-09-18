import {
  buildCardViewPopupOverlayMarkup,
  buildPopupInfoMarkup,
  buildPopupInfoModel,
} from "./info.js";
import { applyLocalizedText } from "../localization/localized-dom.js";
import { isCardViewDrawerPopupPresentation } from "./media.js";
import { cap } from "../../helpers.js";

export class PopupInfoController {
  constructor({
    query,
    getActiveCamera,
    formatTime,
    formatWeekday,
    formatMonthDay,
    formatFullDate = () => "-",
    formatEventDuration,
    onResetRecordingScrub,
    onMediaCameraChange,
    onNavigateEventMedia,
    onToggleFavorite,
    onDownloadEvent,
    onDownloadRecording,
    t,
  } = {}) {
    this._query = query;
    this._getActiveCamera = getActiveCamera;
    this._formatTime = formatTime;
    this._formatWeekday = formatWeekday;
    this._formatMonthDay = formatMonthDay;
    this._formatFullDate = formatFullDate;
    this._formatEventDuration = formatEventDuration;
    this._onResetRecordingScrub = onResetRecordingScrub;
    this._onMediaCameraChange = onMediaCameraChange;
    this._onNavigateEventMedia = onNavigateEventMedia;
    this._onToggleFavorite = onToggleFavorite;
    this._onDownloadEvent = onDownloadEvent;
    this._onDownloadRecording = onDownloadRecording;
    this._t = t;
    this._navigationPresentation = "";
  }

  render(event = null, options = {}) {
    const info = this._query?.("#popup-info");
    if (!info) return null;

    const model = buildPopupInfoModel({
      event,
      options,
      activeCamera: this._getActiveCamera?.() || "",
      formatTime: this._formatTime,
      formatWeekday: this._formatWeekday,
      formatMonthDay: this._formatMonthDay,
      formatEventDuration: this._formatEventDuration,
      t: this._t,
    });
    if (!model) {
      this.hide();
      return null;
    }

    this._onMediaCameraChange?.(model.camera);
    if (model.mediaType !== "recording") {
      this._onResetRecordingScrub?.();
    }

    if (isCardViewDrawerPopupPresentation(options.presentation)) {
      this._navigationPresentation = options.presentation;
      info.innerHTML = "";
      info.hidden = true;
      const overlay = buildCardViewPopupOverlayMarkup({
        model,
        event,
        fullDate: this._formatFullDate?.(
          options.startTime ?? event?.start_time,
        ),
        t: this._t,
      });
      const label = this._query?.("#popup-card-view-label");
      if (label) {
        label.textContent = overlay.labelText;
        label.hidden = false;
        const startTime = options.startTime ?? event?.start_time;
        if (startTime) {
          label.setAttribute?.("data-fvc-date-ts", String(startTime));
          label.setAttribute?.("data-fvc-date-format", "popupOverlay");
          label.setAttribute?.(
            "data-fvc-date-camera",
            cap(String(model.camera || "-").toLowerCase()),
          );
        } else {
          label.removeAttribute?.("data-fvc-date-ts");
          label.removeAttribute?.("data-fvc-date-format");
          label.removeAttribute?.("data-fvc-date-camera");
        }
      }
      const actions = this._query?.("#popup-card-view-actions");
      if (actions) {
        actions.innerHTML = overlay.actionsHtml;
        actions.hidden = !overlay.actionsHtml;
        applyLocalizedText(actions, this._t);
      }
      return model;
    }

    this._navigationPresentation = "";
    this._clearCardViewOverlay();

    const markup = buildPopupInfoMarkup({ event, model });
    info.innerHTML = markup.infoHtml;
    info.hidden = false;
    applyLocalizedText(info, this._t);
    return model;
  }

  hide() {
    const info = this._query?.("#popup-info");
    this._onResetRecordingScrub?.();
    this._onMediaCameraChange?.("");
    if (info) {
      info.innerHTML = "";
      info.hidden = true;
    }
    this._navigationPresentation = "";
    this._clearCardViewOverlay();
  }

  _clearCardViewOverlay() {
    const label = this._query?.("#popup-card-view-label");
    if (label) {
      label.textContent = "";
      label.hidden = true;
    }
    const actions = this._query?.("#popup-card-view-actions");
    if (actions) {
      actions.innerHTML = "";
      actions.hidden = true;
    }
  }

  handleClick(event, target = event?.target) {
    const favoriteAction = target?.closest?.(
      ".popup-action[data-popup-favorite]",
    );
    if (favoriteAction) {
      event?.preventDefault?.();
      event?.stopPropagation?.();
      this._toggleFavorite(favoriteAction);
      return true;
    }

    const mediaNavigationAction = target?.closest?.(
      ".popup-action[data-popup-media-target]",
    );
    if (mediaNavigationAction) {
      event?.stopPropagation?.();
      this._onNavigateEventMedia?.(
        mediaNavigationAction.dataset.popupEventId,
        mediaNavigationAction.dataset.popupMediaTarget,
        this._navigationPresentation
          ? { presentation: this._navigationPresentation }
          : {},
      );
      return true;
    }

    const recordingAction = target?.closest?.(
      ".popup-action[data-rec-dl-start]",
    );
    if (recordingAction) {
      event?.stopPropagation?.();
      const start = Number(recordingAction.dataset.recDlStart);
      const end = Number(recordingAction.dataset.recDlEnd);
      if (Number.isFinite(start) && Number.isFinite(end) && end > start) {
        this._onDownloadRecording?.(start, end);
      }
      return true;
    }

    const eventAction = target?.closest?.(".popup-action[data-dl]");
    if (!eventAction) return false;
    event?.stopPropagation?.();
    this._onDownloadEvent?.(
      eventAction.dataset.dl,
      eventAction.dataset.dlFile,
    );
    return true;
  }

  _toggleFavorite(action) {
    if (action?.disabled) return;
    const id = String(action?.dataset?.popupFavorite || "");
    if (!id) return;
    const previous = action.getAttribute?.("aria-pressed") === "true";
    const requested = !previous;
    this._syncFavoriteAction(action, requested);
    action.disabled = true;
    action.setAttribute?.("aria-busy", "true");
    Promise.resolve(this._onToggleFavorite?.(id))
      .then((retained) => {
        this._syncFavoriteAction(
          action,
          typeof retained === "boolean" ? retained : requested,
        );
      })
      .catch(() => this._syncFavoriteAction(action, previous))
      .finally(() => {
        if (action.isConnected === false) return;
        action.disabled = false;
        action.removeAttribute?.("aria-busy");
      });
  }

  _syncFavoriteAction(action, retained) {
    if (!action || action.isConnected === false) return;
    const active = retained === true;
    const label = active ? "Remove from Favorites" : "Add to Favorites";
    const key = active
      ? "runtime.popup.info.removeFavorite"
      : "runtime.popup.info.addFavorite";
    const localizedLabel = typeof this._t === "function" ? this._t(key) : label;
    action.classList?.toggle?.("active", active);
    action.setAttribute?.("aria-pressed", String(active));
    action.setAttribute?.("data-fvc-i18n-aria-label", key);
    action.setAttribute?.("data-fvc-i18n-title", key);
    action.setAttribute?.("aria-label", localizedLabel);
    action.setAttribute?.("title", localizedLabel);
  }
}
