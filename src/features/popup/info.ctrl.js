import { buildPopupInfoMarkup, buildPopupInfoModel } from "./info.js";

export class PopupInfoController {
  constructor({
    query,
    getActiveCamera,
    formatTime,
    formatWeekday,
    formatMonthDay,
    formatEventDuration,
    onResetRecordingScrub,
    onMediaCameraChange,
    onDownloadEvent,
    onDownloadRecording,
  } = {}) {
    this._query = query;
    this._getActiveCamera = getActiveCamera;
    this._formatTime = formatTime;
    this._formatWeekday = formatWeekday;
    this._formatMonthDay = formatMonthDay;
    this._formatEventDuration = formatEventDuration;
    this._onResetRecordingScrub = onResetRecordingScrub;
    this._onMediaCameraChange = onMediaCameraChange;
    this._onDownloadEvent = onDownloadEvent;
    this._onDownloadRecording = onDownloadRecording;
  }

  render(event = null, options = {}) {
    const head = this._query?.("#popup-info-head");
    const info = this._query?.("#popup-info");
    if (!head || !info) return null;

    const model = buildPopupInfoModel({
      event,
      options,
      activeCamera: this._getActiveCamera?.() || "",
      formatTime: this._formatTime,
      formatWeekday: this._formatWeekday,
      formatMonthDay: this._formatMonthDay,
      formatEventDuration: this._formatEventDuration,
    });
    if (!model) {
      this.hide();
      return null;
    }

    this._onMediaCameraChange?.(model.camera);
    if (model.mediaType !== "recording") {
      this._onResetRecordingScrub?.();
    }

    const markup = buildPopupInfoMarkup({ event, model });
    head.textContent = markup.headText;
    head.hidden = false;
    info.innerHTML = markup.infoHtml;
    info.hidden = false;
    return model;
  }

  hide() {
    const head = this._query?.("#popup-info-head");
    const info = this._query?.("#popup-info");
    this._onResetRecordingScrub?.();
    this._onMediaCameraChange?.("");
    if (head) {
      head.textContent = "";
      head.hidden = true;
    }
    if (info) {
      info.innerHTML = "";
      info.hidden = true;
    }
  }

  handleClick(event, target = event?.target) {
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
}
