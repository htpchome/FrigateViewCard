import { EVENT_PRE_POST_ROLL_SECONDS } from "../../constants.js";

export const resolveFrigateEventPrePostRollRange = ({
  event = null,
  enabled = false,
  rollSeconds = EVENT_PRE_POST_ROLL_SECONDS,
} = {}) => {
  if (!enabled || !event) return null;

  const eventStart = Number(event.start_time);
  const eventEnd = Number(event.end_time);
  const padding = Math.max(0, Number(rollSeconds) || 0);
  if (
    !Number.isFinite(eventStart) ||
    !Number.isFinite(eventEnd) ||
    eventEnd <= eventStart ||
    padding <= 0
  ) {
    return null;
  }

  const start = Math.max(0, Math.floor(eventStart - padding));
  const end = Math.ceil(eventEnd + padding);
  if (end <= start) return null;

  return {
    start,
    end,
    durationSec: end - start,
  };
};
