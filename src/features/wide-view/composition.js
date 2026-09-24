import {
  DAY,
  DEFAULT_EVENT_DAYS,
  PREVIEW_ALERT_END_GRACE_MS,
  PREVIEW_ALERT_HOLD_MS,
  SLIDESHOW_REVIEW_FRESHNESS_GRACE_SEC,
} from "../../constants.js";
import { cap } from "../../helpers.js";
import { ICONS } from "../../icons.js";
import {
  cameraMemberEntities,
  isCameraGroup,
} from "../camera-groups/model.js";
import { PAGE_IDS } from "../navigation/router.js";
import { WideViewCompanionController } from "./companion.ctrl.js";
import { WideViewPageController } from "./page.ctrl.js";
import {
  resolveWideTimelineCameraContextKey,
  WideViewTimelineController,
} from "./timeline.ctrl.js";

const DEFAULT_FACTORIES = Object.freeze({
  createCompanionController: (card, constants) =>
    new WideViewCompanionController(card, constants),
  createPageController: (card, constants, options) =>
    new WideViewPageController(card, constants, options),
  createTimelineController: (card, options) =>
    new WideViewTimelineController(card, options),
});

export const createWideViewCompanionController = (
  card,
  { factories = DEFAULT_FACTORIES } = {},
) => {
  const resolvedFactories = { ...DEFAULT_FACTORIES, ...factories };
  return resolvedFactories.createCompanionController(card, {
    DAY,
    ICONS,
    PAGE_IDS,
    PREVIEW_ALERT_HOLD_MS,
    PREVIEW_ALERT_END_GRACE_MS,
    SLIDESHOW_REVIEW_FRESHNESS_GRACE_SEC,
  });
};

export const createWideViewTimelineControllers = (
  card,
  {
    companionController = card._wideViewCompanionController,
    factories = DEFAULT_FACTORIES,
  } = {},
) => {
  const resolvedFactories = { ...DEFAULT_FACTORIES, ...factories };
  const wideViewTimelineController =
    resolvedFactories.createTimelineController(card, {
      icons: ICONS,
      getAllEvents: () =>
        card._isGridMixedListMode()
          ? card._allGridEvents()
          : card._events || [],
      getVisibleEvents: () =>
        (card._isGridMixedListMode()
          ? card._allGridEvents()
          : card._events || []
        ).filter((event) =>
          card._browseFilterController?.matchesEventFilters?.(event),
        ),
      getVisibleReviews: () =>
        (card._isGridMixedListMode() || isCameraGroup(card._activeCam)
          ? card._browseFilterController?.filteredReviews?.()
          : card._browseFilterController?.filteredActiveCameraReviews?.()) ||
        [],
      getWindowStart: () =>
        card._winStart ||
        (card._winEnd || Date.now() / 1000) -
          (card._config?.event_days || DEFAULT_EVENT_DAYS) * DAY,
      getWindowEnd: () => card._winEnd || Date.now() / 1000,
      getCameraKey: () =>
        resolveWideTimelineCameraContextKey({
          gridMixed: card._isGridMixedListMode(),
          cameraEntity: card._activeCam?.entity || "",
          cameraMembers: cameraMemberEntities(card._activeCam),
        }),
      getSelectedDay: () => card._calSelectedDay || "",
      isLoading: () => card._loading === true,
      mediaUrl: (id, file, camera = "") =>
        card._mediaForCamera(id, file, camera),
      durationForEvent: (event) => card._eventMediaDuration(event),
      capitalize: (value) => cap(value),
      formatTime: (timestamp) => card._time(timestamp),
      formatDay: (timestamp) =>
        card._weekdayDate(timestamp, "weekdayDateDot"),
      dayKey: (timestamp) => card._dayKey(timestamp),
      timezoneParts: (timestamp) => card._tzParts(timestamp),
      timezoneDateTimeToEpoch: (...parts) =>
        card._tzDateTimeToEpochSeconds(...parts),
      onOpenEntry: (entry) => {
        card._pauseSlideshowForInteraction();
        if (entry?.kind === "alert") {
          card._popupMediaLoaderController?.showClipById(entry.eventId, {
            mediaType: "alert",
            startTime: entry.reviewStartTime,
            camera: entry.camera,
          });
          return;
        }
        card._popupMediaLoaderController?.showCarouselEventById(
          entry?.eventId,
          entry?.hasClip ? "clip" : "snapshot",
        );
      },
    });
  const wideViewPageController = resolvedFactories.createPageController(
    card,
    { PAGE_IDS },
    {
      companionController,
      timelineController: wideViewTimelineController,
    },
  );

  return {
    _wideViewTimelineController: wideViewTimelineController,
    _wideViewPageController: wideViewPageController,
  };
};
