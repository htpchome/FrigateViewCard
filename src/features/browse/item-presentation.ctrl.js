import { ICONS } from "../../icons.js";
import { cap, labelColor } from "../../helpers.js";
import {
  flattenCameraMembers,
  isCameraGroup,
} from "../camera-groups/model.js";
import {
  buildEventListItemHtml,
  buildEventListItemModel,
} from "../../data/event-list.model.js";
import {
  buildReviewListItemHtml,
  buildReviewListItemModel,
} from "../../data/review-list.model.js";
import { resolveFrigateEventMediaDuration } from "../../integrations/frigate/event-media.js";

const eventMediaDuration = (host, event) =>
  resolveFrigateEventMediaDuration(
    event,
    host._config?.event_pre_post_roll_enabled === true,
  );

export const renderBrowseEventListItem = (
  host,
  event,
  expanded,
  compact = false,
) => {
  const showDownloadButtons = !(
    host._isLikelyMobileClient() &&
    ["alerts", "clips", "snapshot"].includes(host._tab)
  );
  const fallbackReview =
    host._browseCollectionController?.findReviewForEvent?.(event) || null;
  const model = buildEventListItemModel(event, {
    cap,
    labelColor,
    icons: ICONS,
    media: (id, file) =>
      host._mediaForCamera(id, file, event?.camera),
    durationLabel: (value) => eventMediaDuration(host, value),
    formatTime: (timestamp) => host._time(timestamp),
    formatDay: (timestamp) => host._weekdayDate(timestamp),
    isKeptTab: host._tab === "kept",
    browseTab: host._tab,
    showDownloadButtons,
    showFavoriteButton:
      !host._config?.hidden_tabs?.includes?.("kept"),
    showDurationBadge: host._tab !== "snapshot",
    t: host._localization.t,
    fallbackThumbSrc: fallbackReview
      ? host._reviewThumbnailForCamera(fallbackReview, event?.camera)
      : "",
    showCameraLabel:
      (host._eventsMode === "all" ||
        host._isGridMixedListMode() ||
        isCameraGroup(host._activeCam)) &&
      flattenCameraMembers(host._config.cameras).length > 1,
  });
  return buildEventListItemHtml(model, {
    icons: ICONS,
    expanded,
    compact,
  });
};

export const renderBrowseReviewListItem = (
  host,
  review,
  {
    cameraAware = false,
    showDownloadButtons = !host._isLikelyMobileClient(),
    showFavoriteButton = true,
  } = {},
) => {
  const resolveCameraMedia =
    cameraAware || isCameraGroup(host._activeCam);
  const model = buildReviewListItemModel(review, {
    cap,
    icons: ICONS,
    resolveSourceEvent: (value) =>
      host._browseFilterController.reviewSourceEvent(value),
    findEventById: (id) => host._findEventById(id),
    media: (id, file) =>
      resolveCameraMedia
        ? host._mediaForCamera(id, file, review?.camera)
        : host._media(id, file),
    durationLabel: (value) => eventMediaDuration(host, value),
    formatTime: (timestamp) => host._time(timestamp),
    formatDay: (timestamp) => host._weekdayDate(timestamp),
    labelColor,
    fallbackThumbSrc: host._reviewThumbnailForCamera(
      review,
      review?.camera,
    ),
    showDownloadButtons,
    showFavoriteButton:
      showFavoriteButton &&
      !host._config?.hidden_tabs?.includes?.("kept"),
    t: host._localization.t,
  });
  return buildReviewListItemHtml(model, { cap, icons: ICONS });
};
