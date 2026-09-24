const executeHomeAssistantPtzRequest = async ({ hass, request }) => {
  if (request?.type !== "home_assistant_service") {
    throw new Error(
      `Unsupported PTZ request type: ${request?.type || "unknown"}`,
    );
  }
  if (typeof hass?.callService !== "function") {
    throw new Error("Home Assistant PTZ service is unavailable");
  }

  return hass.callService(
    request.domain,
    request.service,
    request.serviceData,
    request.target,
  );
};

export const executeHomeAssistantPtzPlan = async ({ hass, plan }) => {
  if (plan.executionMode === "parallel") {
    await Promise.all(
      plan.requests.map((request) =>
        executeHomeAssistantPtzRequest({ hass, request }),
      ),
    );
    return;
  }

  for (let index = 0; index < plan.requests.length; index += 1) {
    await executeHomeAssistantPtzRequest({
      hass,
      request: plan.requests[index],
    });
  }
};
