const encodePathPart = (value) => encodeURIComponent(String(value || ""));

export const makeGo2rtcCacheKey = ({ clientId, cam }) => `${clientId}:${cam}`;

export const buildGo2rtcWsPath = ({ clientId, cam }) =>
  `/api/frigate/${encodeURIComponent(clientId)}/mse/api/ws?src=${encodeURIComponent(cam)}`;

export const buildGo2rtcHlsCandidates = ({ clientId, cam }) => {
  const encClient = encodeURIComponent(clientId);
  const encCam = encodeURIComponent(cam);
  return [`/api/frigate/${encClient}/go2rtc/api/stream.m3u8?src=${encCam}&mp4`];
};

export const buildFrigateNotificationMediaPath = ({
  clientId = "",
  eventId = "",
  file = "",
  download = false,
} = {}) =>
  `/api/frigate/${encodePathPart(clientId)}/notifications/${encodePathPart(eventId)}/${encodePathPart(file)}${download ? "?download=true" : ""}`;

export const buildFrigateReviewThumbnailPath = ({
  clientId = "",
  reviewId = "",
  camera = "",
} = {}) => {
  if (!clientId || !reviewId || !camera) return "";
  return `/api/frigate/${encodePathPart(clientId)}/notifications/${encodePathPart(reviewId)}/${encodePathPart(camera)}/review_thumbnail.webp`;
};

export const buildFrigateEventDownloadPlan = ({
  clientId = "",
  camera = "",
  eventId = "",
  file = "",
} = {}) => ({
  url: buildFrigateNotificationMediaPath({
    clientId,
    eventId,
    file,
    download: true,
  }),
  filename: `${camera}_${eventId}_${file}`,
});

export const buildFrigateRecordingDownloadPlan = ({
  clientId = "",
  camera = "",
  start: startValue = 0,
  end: endValue = 0,
  timeLabel = "",
  maxDurationSec = 7200,
} = {}) => {
  const start = Math.floor(Number(startValue) || 0);
  const endRaw = Math.floor(Number(endValue) || 0);
  const maxEnd = start + Math.max(1, Number(maxDurationSec) || 7200);
  const end = Math.max(start + 1, Math.min(endRaw, maxEnd));
  return {
    path: `/api/frigate/${encodePathPart(clientId)}/recording/${encodePathPart(camera)}/start/${start}/end/${end}?download=true`,
    filename: `${camera}_${String(timeLabel || "").replace(/:/g, "-")}.mp4`,
    start,
    end,
  };
};
