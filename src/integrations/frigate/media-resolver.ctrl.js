import { flattenCameraMembers } from "../../features/camera-groups/model.js";
import {
  buildFrigateNotificationMediaPath,
  buildFrigateReviewThumbnailPath,
} from "./url.js";

export class FrigateMediaResolverController {
  constructor(host) {
    this._host = host;
  }

  contextForCameraName(cameraName = "") {
    const target = String(cameraName || "").trim();
    if (!target) return null;
    for (const camera of flattenCameraMembers(this._host._config?.cameras)) {
      const context = this._host._camCache?.[camera.entity];
      if (
        String(context?.cam || "").trim() === target ||
        String(camera.entity || "").trim() === target
      ) {
        return context || null;
      }
    }
    return null;
  }

  notificationMediaPath(id, file, download = false) {
    return buildFrigateNotificationMediaPath({
      clientId: this._host._cc().clientId,
      eventId: id,
      file,
      download,
    });
  }

  notificationMediaPathForCamera(
    id,
    file,
    cameraName = "",
    download = false,
  ) {
    const context = this.contextForCameraName(cameraName) || this._host._cc();
    return buildFrigateNotificationMediaPath({
      clientId: context?.clientId || "",
      eventId: id,
      file,
      download,
    });
  }

  reviewThumbnailPath(review, cameraName = "") {
    const targetCamera = String(cameraName || review?.camera || "").trim();
    const context =
      this.contextForCameraName(targetCamera) || this._host._cc();
    return buildFrigateReviewThumbnailPath({
      clientId: context?.clientId || "",
      reviewId: review?.id || "",
      camera: targetCamera,
    });
  }
}
