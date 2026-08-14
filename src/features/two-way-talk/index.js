export const hasTwoWayTalkCapability = (capabilityInfo) => {
  if (!capabilityInfo || typeof capabilityInfo !== "object") return false;

  const producers = Array.isArray(capabilityInfo.producers)
    ? capabilityInfo.producers
    : [];
  const hasGo2RtcBackchannel = producers.some((producer) => {
    if (!Array.isArray(producer?.medias)) return false;
    return producer.medias.some((media) => {
      const token = String(media || "")
        .trim()
        .toLowerCase();
      return (
        token.includes("audio") &&
        (token.includes("sendonly") || token.includes("sendrecv"))
      );
    });
  });
  if (hasGo2RtcBackchannel) return true;

  const truthyKeys = new Set([
    "two_way_talk",
    "twoWayTalk",
    "two-way-talk",
    "talk",
    "talkback",
    "microphone",
    "mic",
    "audio_output",
    "audio_out",
    "two_way_audio",
    "supports_two_way_talk",
    "supports_two_way_audio",
    "backchannel",
  ]);
  const tokenMatches = new Set([
    "talk",
    "talkback",
    "two_way_talk",
    "two-way-talk",
    "supports_two_way_talk",
    "two_way_audio",
    "two-way-audio",
    "supports_two_way_audio",
    "mic",
    "microphone",
    "audio_output",
    "audio-out",
    "audio_out",
    "speaker",
    "backchannel",
  ]);

  const stack = [capabilityInfo];
  const seen = new Set();
  const tokens = [];

  while (stack.length) {
    const node = stack.pop();
    if (!node || typeof node !== "object") continue;
    if (seen.has(node)) continue;
    seen.add(node);

    if (Array.isArray(node)) {
      node.forEach((item) => {
        if (typeof item === "string") tokens.push(item);
        else if (item && typeof item === "object") stack.push(item);
      });
      continue;
    }

    Object.entries(node).forEach(([key, value]) => {
      const normalizedKey = String(key || "")
        .trim()
        .toLowerCase();
      if (value === true && truthyKeys.has(key)) {
        tokens.push(key);
      }
      if (value === true && truthyKeys.has(normalizedKey)) {
        tokens.push(normalizedKey);
      }
      if (typeof value === "string") {
        tokens.push(value);
      } else if (Array.isArray(value) || (value && typeof value === "object")) {
        stack.push(value);
      }
    });
  }

  return tokens
    .map((item) =>
      String(item || "")
        .trim()
        .toLowerCase(),
    )
    .some((token) => tokenMatches.has(token));
};

export const shouldRenderTwoWayTalkButton = ({ camera, pageId, PAGE_IDS }) => {
  if (camera?.two_way_talk !== true) return false;
  const connectionType = String(camera?.connection_type || "")
    .trim()
    .toLowerCase();
  const isWebRtcConnectionType =
    connectionType === "" ||
    connectionType === "webrtc" ||
    connectionType === "frigate_go2rtc";
  if (!isWebRtcConnectionType) return false;
  return pageId === PAGE_IDS.singleView || pageId === PAGE_IDS.wideView;
};
