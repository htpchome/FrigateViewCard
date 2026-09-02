import { buildFrigateNotificationMediaPath } from "./url.js";

export const buildFrigateRecordingReviewMarkers = ({
  clientId = "",
  start = 0,
  end = 0,
  reviews = [],
} = {}) =>
  (Array.isArray(reviews) ? reviews : [])
    .map((review) => {
      const severity = String(
        review?.severity || review?.data?.severity || "detection",
      ).toLowerCase();
      if (!["alert", "detection"].includes(severity)) return null;

      const markerStart = Math.max(start, Number(review?.start_time || start));
      const markerEnd = Math.min(
        end,
        Number(review?.end_time || markerStart + 1),
      );
      const detections = Array.isArray(review?.data?.detections)
        ? review.data.detections
        : Array.isArray(review?.detections)
          ? review.detections
          : [];
      const eventId = String(detections[0] || "").trim();

      return {
        id: review?.id || `${markerStart}-${markerEnd}`,
        start: markerStart,
        end: markerEnd > markerStart ? markerEnd : markerStart + 1,
        severity,
        eventId,
        snapshotUrl: eventId
          ? buildFrigateNotificationMediaPath({
              clientId,
              eventId,
              file: "snapshot.jpg",
            })
          : "",
      };
    })
    .filter(Boolean)
    .sort((left, right) => left.start - right.start);
