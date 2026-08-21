import { triggerBrowserDownload } from "../../shared/media/download.js";
import {
  buildFrigateEventDownloadPlan,
  buildFrigateRecordingDownloadPlan,
} from "./url.js";

export class FrigateMediaDownloadController {
  constructor({
    getContext,
    signPath = async (path) => path,
    formatTime = () => "",
    download = triggerBrowserDownload,
  } = {}) {
    this._getContext = getContext;
    this._signPath = signPath;
    this._formatTime = formatTime;
    this._download = download;
  }

  downloadEvent(eventId, file) {
    const { clientId = "", cam = "" } = this._getContext?.() || {};
    const plan = buildFrigateEventDownloadPlan({
      clientId,
      camera: cam,
      eventId,
      file,
    });
    this._download(plan);
    return plan;
  }

  async downloadRecording(start, end) {
    const { clientId = "", cam = "" } = this._getContext?.() || {};
    const plan = buildFrigateRecordingDownloadPlan({
      clientId,
      camera: cam,
      start,
      end,
      timeLabel: this._formatTime(start),
    });
    const url = await this._signPath(plan.path);
    const signedPlan = { url, filename: plan.filename };
    this._download(signedPlan);
    return { ...plan, url };
  }
}
