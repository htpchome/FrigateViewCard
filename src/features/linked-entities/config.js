export const LINKED_ENTITY_LIMIT = 2;
export const LINKED_LIGHT_DOMAIN = "light";
export const LINKED_LIGHT_POSITIONS = Object.freeze({
  left: "left",
  right: "right",
});

const normalizeEntityId = (value) => String(value || "").trim();
const normalizeIcon = (value) => String(value || "").trim();

export const normalizeLinkedLightPosition = (value) =>
  String(value || "").trim().toLowerCase() === LINKED_LIGHT_POSITIONS.left
    ? LINKED_LIGHT_POSITIONS.left
    : LINKED_LIGHT_POSITIONS.right;

export const normalizeLinkedEntityConfig = (value) => {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const entity = normalizeEntityId(value.entity || value.entity_id);
  if (!entity.startsWith(`${LINKED_LIGHT_DOMAIN}.`)) return null;
  const icon = normalizeIcon(value.icon);
  const position = normalizeLinkedLightPosition(value.position);
  return {
    entity,
    ...(icon ? { icon } : {}),
    ...(position === LINKED_LIGHT_POSITIONS.left ? { position } : {}),
  };
};

export const normalizeLinkedEntitiesConfig = (value) => {
  const candidates = Array.isArray(value) ? value : value ? [value] : [];
  const seen = new Set();
  return candidates
    .map(normalizeLinkedEntityConfig)
    .filter(Boolean)
    .filter(({ entity }) => {
      if (seen.has(entity)) return false;
      seen.add(entity);
      return true;
    })
    .slice(0, LINKED_ENTITY_LIMIT);
};

export const linkedLightForCamera = (camera) =>
  normalizeLinkedEntitiesConfig(camera?.linked_entities)[0] || null;

export const linkedLightsForCamera = (camera) =>
  normalizeLinkedEntitiesConfig(camera?.linked_entities);

export const linkedLightEntityIds = (cameras) => [
  ...new Set(
    (Array.isArray(cameras) ? cameras : [])
      .flatMap((camera) =>
        linkedLightsForCamera(camera).map(({ entity }) => entity),
      )
      .filter(Boolean),
  ),
];
