import assert from "node:assert/strict";
import test from "node:test";

import {
  CAMERA_GROUP_LAYOUTS,
  cameraGroupDefaultName,
  cameraGroupMemberConfig,
  cameraMemberEntities,
  countPhysicalCameras,
  findLogicalCameraIndexByEntity,
  flattenCameraMembers,
  limitCameraConfigsByPhysicalCount,
  nextCameraGroupDefaultName,
  normalizeCameraGroupConfig,
} from "../src/features/camera-groups/model.js";

const groupedCamera = {
  entity: "camera.doorbell_main",
  name: "Doorbell",
  connection_type: "frigate_go2rtc",
  alerts_content: "all_reviews",
  ptz: { enabled: true },
  two_way_talk: true,
  group: {
    secondary_entity: "camera.doorbell_package",
    layout: CAMERA_GROUP_LAYOUTS.stacked,
  },
};

test("camera groups normalize exactly one secondary member", () => {
  assert.deepEqual(
    normalizeCameraGroupConfig(groupedCamera.group, {
      primaryEntity: groupedCamera.entity,
    }),
    groupedCamera.group,
  );
  assert.deepEqual(cameraMemberEntities(groupedCamera), [
    "camera.doorbell_main",
    "camera.doorbell_package",
  ]);
  assert.equal(countPhysicalCameras([groupedCamera]), 2);
});

test("secondary member inherits shared policy but never PTZ or talk", () => {
  const secondary = cameraGroupMemberConfig(groupedCamera, 1);
  assert.equal(secondary.entity, "camera.doorbell_package");
  assert.equal(secondary.connection_type, "frigate_go2rtc");
  assert.equal(secondary.alerts_content, "all_reviews");
  assert.equal(secondary.ptz, null);
  assert.equal(secondary.two_way_talk, undefined);
  assert.equal(secondary.group_parent_entity, "camera.doorbell_main");
  assert.equal(secondary.group_member, "B");
  assert.equal(secondary.name, "Doorbell");
});

test("camera group names advance through unused alphabetic pairs", () => {
  assert.equal(cameraGroupDefaultName(0), "Group A/B");
  assert.equal(cameraGroupDefaultName(1), "Group C/D");
  assert.equal(nextCameraGroupDefaultName([]), "Group A/B");
  assert.equal(
    nextCameraGroupDefaultName([
      {
        entity: "camera.front",
        name: "Group A/B",
        group: {
          secondary_entity: "camera.package",
          layout: CAMERA_GROUP_LAYOUTS.stacked,
        },
      },
    ]),
    "Group C/D",
  );
});

test("flattened members remain addressable through one logical camera", () => {
  const single = { entity: "camera.driveway" };
  assert.deepEqual(
    flattenCameraMembers([groupedCamera, single]).map(({ entity }) => entity),
    [
      "camera.doorbell_main",
      "camera.doorbell_package",
      "camera.driveway",
    ],
  );
  assert.equal(
    findLogicalCameraIndexByEntity(
      [groupedCamera, single],
      "camera.doorbell_package",
    ),
    0,
  );
});

test("physical camera cap preserves a primary when its secondary cannot fit", () => {
  const cameras = [
    ...Array.from({ length: 11 }, (_, index) => ({
      entity: `camera.single_${index}`,
    })),
    groupedCamera,
  ];
  const limited = limitCameraConfigsByPhysicalCount(cameras, 12);
  assert.equal(countPhysicalCameras(limited), 12);
  assert.equal(limited.at(-1).entity, "camera.doorbell_main");
  assert.equal(limited.at(-1).group, undefined);
});
