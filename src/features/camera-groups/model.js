export const CAMERA_GROUP_LAYOUTS = Object.freeze({
  sideBySide: "side_by_side",
  stacked: "stacked",
});

export const CAMERA_GROUP_LAYOUT_OPTIONS = Object.freeze([
  CAMERA_GROUP_LAYOUTS.sideBySide,
  CAMERA_GROUP_LAYOUTS.stacked,
]);

export const normalizeCameraGroupLayout = (value) =>
  value === CAMERA_GROUP_LAYOUTS.stacked
    ? CAMERA_GROUP_LAYOUTS.stacked
    : CAMERA_GROUP_LAYOUTS.sideBySide;

export const normalizeCameraGroupConfig = (
  group,
  { primaryEntity = "" } = {},
) => {
  if (!group || typeof group !== "object" || Array.isArray(group)) return null;
  const secondaryEntity = String(
    group.secondary_entity || group.secondaryEntity || "",
  ).trim();
  const primary = String(primaryEntity || "").trim();
  if (!secondaryEntity || secondaryEntity === primary) return null;
  return {
    secondary_entity: secondaryEntity,
    layout: normalizeCameraGroupLayout(group.layout),
  };
};

export const cameraGroupSecondaryEntity = (camera) =>
  normalizeCameraGroupConfig(camera?.group, {
    primaryEntity: camera?.entity,
  })?.secondary_entity || "";

export const isCameraGroup = (camera) =>
  Boolean(cameraGroupSecondaryEntity(camera));

const alphabeticCameraGroupToken = (rawIndex) => {
  let index = Math.max(0, Math.floor(Number(rawIndex) || 0));
  let token = "";
  do {
    token = String.fromCharCode(65 + (index % 26)) + token;
    index = Math.floor(index / 26) - 1;
  } while (index >= 0);
  return token;
};

export const cameraGroupDefaultName = (rawPairIndex = 0) => {
  const pairIndex = Math.max(0, Math.floor(Number(rawPairIndex) || 0));
  const firstIndex = pairIndex * 2;
  return `Group ${alphabeticCameraGroupToken(firstIndex)}/${alphabeticCameraGroupToken(firstIndex + 1)}`;
};

export const nextCameraGroupDefaultName = (
  cameras,
  { excludeIndex = -1 } = {},
) => {
  const usedNames = new Set(
    (Array.isArray(cameras) ? cameras : [])
      .map((camera, index) => {
        if (index === excludeIndex || !isCameraGroup(camera)) return "";
        return String(camera?.name || "")
          .trim()
          .toLowerCase();
      })
      .filter(Boolean),
  );
  for (let pairIndex = 0; ; pairIndex += 1) {
    const name = cameraGroupDefaultName(pairIndex);
    if (!usedNames.has(name.toLowerCase())) return name;
  }
};

export const cameraMemberEntities = (camera) => {
  const primary = String(camera?.entity || "").trim();
  const secondary = cameraGroupSecondaryEntity(camera);
  return [primary, secondary].filter(Boolean);
};

export const cameraPhysicalCount = (camera) =>
  cameraMemberEntities(camera).length;

export const countPhysicalCameras = (cameras) =>
  (Array.isArray(cameras) ? cameras : []).reduce(
    (total, camera) => total + cameraPhysicalCount(camera),
    0,
  );

export const limitCameraConfigsByPhysicalCount = (cameras, maximum) => {
  const max = Math.max(0, Number(maximum) || 0);
  const limited = [];
  let used = 0;
  for (const camera of Array.isArray(cameras) ? cameras : []) {
    const primary = String(camera?.entity || "").trim();
    if (!primary || used >= max) continue;
    const group = normalizeCameraGroupConfig(camera?.group, {
      primaryEntity: primary,
    });
    if (group && used + 2 <= max) {
      limited.push({ ...camera, group });
      used += 2;
      continue;
    }
    const { group: _group, ...singleCamera } = camera;
    limited.push(singleCamera);
    used += 1;
  }
  return limited;
};

export const cameraGroupMemberConfig = (camera, memberIndex = 0) => {
  const index = memberIndex === 1 ? 1 : 0;
  const entities = cameraMemberEntities(camera);
  const entity = entities[index] || entities[0] || "";
  const grouped = entities.length > 1;
  const base = {
    ...camera,
    entity,
    group: undefined,
    group_parent_entity: grouped ? entities[0] : "",
    group_member: grouped ? (index === 0 ? "A" : "B") : "",
    group_member_index: grouped ? index : 0,
    group_layout: grouped
      ? normalizeCameraGroupLayout(camera?.group?.layout)
      : "",
  };
  if (index === 1) {
    base.ptz = null;
    delete base.two_way_talk;
  }
  return base;
};

export const flattenCameraMembers = (cameras) =>
  (Array.isArray(cameras) ? cameras : []).flatMap((camera, logicalIndex) =>
    cameraMemberEntities(camera).map((_, index) =>
      ({
        ...cameraGroupMemberConfig(camera, index),
        logical_camera_index: logicalIndex,
      }),
    ),
  );

export const findLogicalCameraIndexByEntity = (cameras, entity) => {
  const target = String(entity || "").trim();
  if (!target) return -1;
  return (Array.isArray(cameras) ? cameras : []).findIndex((camera) =>
    cameraMemberEntities(camera).includes(target),
  );
};
