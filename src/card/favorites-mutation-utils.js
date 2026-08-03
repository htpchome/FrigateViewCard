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
    const shouldSyncKept = entity === activeEntity && state?.kept !== nextKept;

    if (!eventResult.changed && !shouldSyncKept) {
      continue;
    }

    if (!cacheChanged) {
      nextCamCache = { ...camCache };
      cacheChanged = true;
    }

    nextCamCache[entity] = {
      ...state,
      ...(eventResult.changed ? { events: eventResult.events } : null),
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
