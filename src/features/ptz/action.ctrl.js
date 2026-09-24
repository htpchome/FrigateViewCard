import { executeHomeAssistantPtzPlan } from "../../integrations/home-assistant/ptz-service.js";
import { resolvePtzServicePlan } from "./index.js";

export const createPtzActionController = (host) => ({
  async execute({
    camera,
    ptzInfo,
    action,
    eventType,
    argument = null,
  }) {
    const plan = resolvePtzServicePlan({
      camera,
      ptzInfo,
      action,
      eventType,
      argument,
    });
    if (!plan) return;
    await executeHomeAssistantPtzPlan({ hass: host._hass, plan });
  },
});
