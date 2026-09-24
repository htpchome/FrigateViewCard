import { parseWs } from "../../helpers.js";

export const normalizeFrigatePtzInfoResponse = (response) => {
  const result = parseWs(response);
  return Array.isArray(result) ? result[0] || null : result || null;
};

export const fetchFrigatePtzInfo = async ({
  request,
  instanceId,
  camera,
}) => {
  const response = await request({
    type: "frigate/ptz/info",
    instance_id: instanceId,
    camera,
  });
  return normalizeFrigatePtzInfoResponse(response);
};
