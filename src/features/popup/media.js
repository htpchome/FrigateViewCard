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
}) => ({
  shouldEnsureAirPlayButton: true,
  airPlayMediaType: popupMediaType,
  shouldRenderInfo: true,
  shouldInitPopupMediaControls: Boolean(hasVideo),
  shouldResetControlsWithoutVideo: !hasVideo,
  shouldRenderCarousel: true,
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
        }
      : { mediaType },
  };
};

export const buildPopupSnapshotRenderPlan = ({ event = null, opts = {} }) => {
  const mediaType = opts.mediaType || "snapshot";
  return {
    playingId: event?.id || "",
    mediaType,
    infoEvent: event,
    infoOpts: { mediaType },
  };
};

export const buildPopupRecordingRenderPlan = ({
  start = 0,
  end = 0,
  playbackPlan = {},
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
  },
  chunkEnd: playbackPlan.chunkEnd,
  sourceCandidates: playbackPlan.sourceCandidates || [],
});

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
      carouselMediaType: "recording",
      carouselActiveId: "",
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
    shouldRenderCarousel: true,
    shouldShowPopupControls: true,
    popupMediaType,
    airPlayMediaType: popupMediaType,
    carouselMediaType: "recording",
    carouselActiveId: "",
  };
};
