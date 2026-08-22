import { triggerBrowserDownload } from "../../shared/media/download.js";
import {
  buildFrigateEventDownloadPlan,
  buildFrigateRecordingDownloadPlan,
} from "./url.js";
import { resolveFrigateEventPrePostRollRange } from "./event-media.js";

export class FrigateMediaDownloadController {
  constructor({
    getContext,
    signPath = async (path) => path,
    formatTime = () => "",
    download = triggerBrowserDownload,
    findEventById = () => null,
    isEventPrePostRollEnabled = () => false,
  } = {}) {
    this._getContext = getContext;
    this._signPath = signPath;
    this._formatTime = formatTime;
    this._download = download;
    this._findEventById = findEventById;
    this._isEventPrePostRollEnabled = isEventPrePostRollEnabled;
  }

  async downloadEvent(eventId, file) {
    const { clientId = "", cam = "" } = this._getContext?.() || {};
    const event = this._findEventById?.(eventId) || null;
    const range = resolveFrigateEventPrePostRollRange({
      event,
      enabled:
        file === "clip.mp4" && this._isEventPrePostRollEnabled?.() === true,
    });
    if (range) {
      const camera = event?.camera || cam;
      const rangePlan = buildFrigateRecordingDownloadPlan({
        clientId,
        camera,
        start: range.start,
        end: range.end,
        timeLabel: this._formatTime(range.start),
      });
      const eventPlan = buildFrigateEventDownloadPlan({
        clientId,
        camera,
        eventId,
        file,
      });
      const url = await this._signPath(rangePlan.path);
      const signedPlan = { url, filename: eventPlan.filename };
      this._download(signedPlan);
      return { ...rangePlan, ...signedPlan };
    }

    const plan = buildFrigateEventDownloadPlan({
      clientId,
      camera: event?.camera || cam,
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
