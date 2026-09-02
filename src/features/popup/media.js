import { resolvePopupMediaControlsInitPlan } from "../../shared/media/controls.js";

export const resolvePopupMediaRenderPlan = ({
  infoOpts = null,
  mediaType = "",
  hasMediaElement = false,
  html = "",
  hasVideo = false,
}) => ({
  popupMediaType: String(
    infoOpts?.mediaType || mediaType || "",
  ).toLowerCase(),
  shouldAppendMediaElement: Boolean(hasMediaElement),
  viewerHtml: hasMediaElement ? "" : String(html || ""),
  controlsPlan: hasVideo
    ? null
    : resolvePopupMediaControlsInitPlan({
        hasVideo: false,
      }),
});

export const resolvePopupMediaPostRenderPlan = ({
  popupMediaType = "",
  activeId = "",
  hasVideo = false,
  compact = false,
}) => ({
  shouldEnsureAirPlayButton: true,
  airPlayMediaType: popupMediaType,
  shouldRenderInfo: true,
  shouldInitPopupMediaControls: Boolean(hasVideo),
  shouldResetControlsWithoutVideo: !hasVideo,
  shouldRenderCarousel: compact !== true,
  carouselMediaType: popupMediaType,
  carouselActiveId: activeId,
  shouldScheduleRotateOverlay: true,
  shouldShowPopupControls: true,
});

export const buildPopupClipRenderPlan = ({
  id = "",
  opts = {},
  infoEvent = null,
  isIos = false,
  includeLookupInfo = false,
}) => {
  const mediaType = opts.mediaType || "clip";
  return {
    playingId: id,
    mediaFile: isIos ? "master.m3u8" : "clip.mp4",
    mediaType,
    infoEvent,
    infoOpts: includeLookupInfo
      ? {
          id,
          mediaType,
          startTime: opts.startTime,
          camera: opts.camera,
          ...(opts.displayMediaType
            ? { displayMediaType: opts.displayMediaType }
            : {}),
          ...(opts.compact === true ? { compact: true } : {}),
        }
      : {
          mediaType,
          ...(opts.displayMediaType
            ? { displayMediaType: opts.displayMediaType }
            : {}),
          ...(opts.compact === true ? { compact: true } : {}),
        },
  };
};

export const buildPopupSnapshotRenderPlan = ({ event = null, opts = {} }) => {
  const mediaType = opts.mediaType || "snapshot";
  return {
    playingId: event?.id || "",
    mediaType,
    infoEvent: event,
    infoOpts: {
      mediaType,
      ...(opts.displayMediaType
        ? { displayMediaType: opts.displayMediaType }
        : {}),
      ...(opts.compact === true ? { compact: true } : {}),
    },
  };
};

export const buildPopupCarouselSelectionPlan = ({
  event = null,
  mediaType = "",
} = {}) => {
  if (!event?.id) return null;
  const type = String(mediaType || "").toLowerCase();
  const useSnapshot =
    type === "snapshot" || (!event.has_clip && event.has_snapshot);
  return {
    kind: useSnapshot ? "snapshot" : "clip",
    mediaType: type || (useSnapshot ? "snapshot" : "clip"),
  };
};

export const buildPopupRecordingRenderPlan = ({
  start = 0,
  end = 0,
  playbackPlan = {},
  opts = {},
}) => ({
  popupMediaType: "recording",
  playing: { rec: start },
  infoEvent: null,
  infoOpts: {
    mediaType: "recording",
    startTime: start,
    durationSec: playbackPlan.clipDurationSec,
    camera: playbackPlan.displayCamera,
    objects: "-",
    zone: "-",
    score: "-",
    recStart: start,
    recEnd: end,
    ...(opts.compact === true ? { compact: true } : {}),
  },
  chunkEnd: playbackPlan.chunkEnd,
  sourceCandidates: playbackPlan.sourceCandidates || [],
});

export const buildPopupEventRecordingRenderPlan = ({
  event = null,
  opts = {},
  range = {},
  playbackPlan = {},
} = {}) => {
  const mediaType = opts.mediaType || "clip";
  return {
    popupMediaType: mediaType,
    playing: {
      id: event?.id || "",
      eventRecordingStart: range.start,
      eventRecordingEnd: range.end,
    },
    infoEvent: event,
    infoOpts: {
      ...opts,
      mediaType,
      durationSec: range.durationSec,
    },
    chunkEnd: playbackPlan.chunkEnd,
    sourceCandidates: playbackPlan.sourceCandidates || [],
    carouselMediaType: mediaType,
    carouselActiveId: event?.id || "",
  };
};

export const buildPopupRecordingSourceAttemptPlan = ({
  sourceCandidates = [],
  autoplay = true,
}) => ({
  attempts: sourceCandidates.map((path) => ({
    path,
    autoplay: Boolean(autoplay),
  })),
});

export const resolvePopupRecordingSeekListenerPlan = () => ({
  listeners: [
    { type: "seeking", action: "pauseForSeek" },
    { type: "seeked", action: "resumeAfterSeek" },
  ],
});

export const buildPopupRecordingScrubInitPlan = ({
  clientId = "",
  cam = "",
  start = 0,
  chunkEnd = 0,
  token = 0,
  sourceUrl = "",
}) => ({
  clientId,
  cam,
  start,
  end: chunkEnd,
  token,
  sourceUrl,
});

export const resolvePopupRecordingLoadOutcomePlan = ({
  playable = false,
  popupMediaType = "recording",
  carouselMediaType = "recording",
  carouselActiveId = "",
  compact = false,
}) => {
  if (!playable) {
    return {
      shouldShowError: true,
      errorHtml: '<div class="ld">Unable to load recording</div>',
      shouldTeardownScrub: true,
      shouldHideScrub: true,
      shouldEnsureAirPlayButton: false,
      shouldScheduleRotateOverlay: false,
      shouldInitPopupMediaControls: false,
      shouldRenderCarousel: false,
      shouldShowPopupControls: false,
      popupMediaType,
      airPlayMediaType: popupMediaType,
      carouselMediaType,
      carouselActiveId,
    };
  }

  return {
    shouldShowError: false,
    errorHtml: "",
    shouldTeardownScrub: false,
    shouldHideScrub: false,
    shouldEnsureAirPlayButton: true,
    shouldScheduleRotateOverlay: true,
    shouldInitPopupMediaControls: true,
    shouldRenderCarousel: compact !== true,
    shouldShowPopupControls: true,
    popupMediaType,
    airPlayMediaType: popupMediaType,
    carouselMediaType,
    carouselActiveId,
  };
};
