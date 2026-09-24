import { flattenCameraMembers } from "../camera-groups/model.js";

const updateEventRetention = ({ events = [], id, retained }) => {
  let changed = false;
  const nextEvents = events.map((event) => {
    if (event?.id !== id) return event;
    changed = true;
    return {
      ...event,
      retain_indefinitely: retained,
    };
  });
  return {
    events: changed ? nextEvents : events,
    changed,
  };
};

const updateKeptEvents = ({ kept = [], id, retained, event }) => {
  const nextEvent = {
    ...event,
    retain_indefinitely: retained,
  };

  if (!retained) {
    return kept.filter((item) => item.id !== id);
  }

  let found = false;
  const nextKept = kept.map((item) => {
    if (item.id !== id) return item;
    found = true;
    return {
      ...item,
      retain_indefinitely: true,
    };
  });

  return found ? nextKept : [nextEvent, ...nextKept];
};

const applyFavoriteMutationState = ({
  id,
  retained,
  event,
  events = [],
  camCache = {},
  kept = [],
  activeEntity = "",
}) => {
  const nextEventsResult = updateEventRetention({ events, id, retained });
  const nextKept = updateKeptEvents({ kept, id, retained, event });

  let nextCamCache = camCache;
  let cacheChanged = false;

  for (const [entity, state] of Object.entries(camCache || {})) {
    const eventResult = updateEventRetention({
      events: state?.events || [],
      id,
      retained,
    });
    const reviewEventResult = updateEventRetention({
      events: state?.reviewEvents || [],
      id,
      retained,
    });
    const shouldSyncKept = entity === activeEntity && state?.kept !== nextKept;

    if (!eventResult.changed && !reviewEventResult.changed && !shouldSyncKept) {
      continue;
    }

    if (!cacheChanged) {
      nextCamCache = { ...camCache };
      cacheChanged = true;
    }

    nextCamCache[entity] = {
      ...state,
      ...(eventResult.changed ? { events: eventResult.events } : null),
      ...(reviewEventResult.changed
        ? { reviewEvents: reviewEventResult.events }
        : null),
      ...(shouldSyncKept ? { kept: nextKept } : null),
    };
  }

  return {
    events: nextEventsResult.events,
    camCache: nextCamCache,
    kept: nextKept,
  };
};

export const buildFavoriteOptimisticMutation = ({
  id,
  event,
  events = [],
  camCache = {},
  kept = [],
  activeEntity = "",
}) => {
  const nextRetained = !Boolean(event?.retain_indefinitely);
  return {
    nextRetained,
    previousRetained: Boolean(event?.retain_indefinitely),
    ...applyFavoriteMutationState({
      id,
      retained: nextRetained,
      event,
      events,
      camCache,
      kept,
      activeEntity,
    }),
  };
};

export const buildFavoriteRollbackMutation = ({
  id,
  event,
  previousRetained = false,
  events = [],
  camCache = {},
  kept = [],
  activeEntity = "",
}) =>
  applyFavoriteMutationState({
    id,
    retained: previousRetained,
    event,
    events,
    camCache,
    kept,
    activeEntity,
  });

export class BrowseFavoriteMutationController {
  constructor(host, { warn = console.warn } = {}) {
    this._host = host;
    this._warn = warn;
  }

  _applyMutation(mutation, eventEntity, activeEntity) {
    const host = this._host;
    host._events = mutation.events;
    host._camCache = mutation.camCache;
    if (host._config?.favorites_mixed_cameras !== false) {
      host._kept = host._allGridKeptEvents().sort(
        (left, right) =>
          Number(right?.start_time || 0) - Number(left?.start_time || 0),
      );
    } else if (eventEntity === activeEntity) {
      host._kept = mutation.kept;
    }
    host._renderList();
  }

  toggle(id, options = {}) {
    const host = this._host;
    const event = host._findEventById(id);
    if (!event) return false;
    const toastPlacement = options.toastPlacement || "browse";
    const activeEntity = host._activeCam?.entity || "";
    const eventContext = host._frigateContextForCameraName(event?.camera);
    const eventEntity =
      flattenCameraMembers(host._config?.cameras).find(
        (camera) => host._camCache?.[camera.entity] === eventContext,
      )?.entity || activeEntity;
    const kept = host._camCache?.[eventEntity]?.kept || host._kept;
    const optimistic = buildFavoriteOptimisticMutation({
      id,
      event,
      events: host._events,
      camCache: host._camCache,
      kept,
      activeEntity: eventEntity,
    });

    this._applyMutation(optimistic, eventEntity, activeEntity);
    const { clientId } = eventContext || host._cc();
    return host._hass
      .callWS({
        type: "frigate/event/retain",
        instance_id: clientId,
        event_id: id,
        retain: optimistic.nextRetained,
      })
      .then(
        () => {
          host._toast(
            optimistic.nextRetained
              ? "Added to Favorites"
              : "Removed from Favorites",
            {
              tone: optimistic.nextRetained ? "success" : "warning",
              placement: toastPlacement,
              localizationKey: optimistic.nextRetained
                ? "runtime.notifications.favoritesAdded"
                : "runtime.notifications.favoritesRemoved",
            },
          );
          return optimistic.nextRetained;
        },
        (error) => {
          const rollback = buildFavoriteRollbackMutation({
            id,
            event,
            previousRetained: optimistic.previousRetained,
            events: host._events,
            camCache: host._camCache,
            kept,
            activeEntity: eventEntity,
          });
          this._applyMutation(rollback, eventEntity, activeEntity);
          this._warn("[Frigate] retain failed", error);
          host._toast(
            optimistic.nextRetained
              ? "Could not add to Favorites"
              : "Could not remove from Favorites",
            {
              tone: "error",
              placement: toastPlacement,
              localizationKey: optimistic.nextRetained
                ? "runtime.notifications.favoritesAddFailed"
                : "runtime.notifications.favoritesRemoveFailed",
            },
          );
          return optimistic.previousRetained;
        },
      );
  }
}
