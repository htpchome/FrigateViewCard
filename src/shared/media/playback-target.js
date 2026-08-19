export const PLAYBACK_TARGET_CAST = "cast";
export const PLAYBACK_TARGET_AIRPLAY = "airplay";

export function resolveVideoPlaybackTargetSupport(video) {
  return {
    cast: typeof video?.remote?.prompt === "function",
    airplay: typeof video?.webkitShowPlaybackTargetPicker === "function",
  };
}

export async function promptVideoPlaybackTarget(video, target) {
  if (!video) return false;

  if (target === PLAYBACK_TARGET_AIRPLAY) {
    const prompt = video.webkitShowPlaybackTargetPicker;
    if (typeof prompt !== "function") return false;
    video.setAttribute?.("x-webkit-airplay", "allow");
    prompt.call(video);
    return true;
  }

  if (target === PLAYBACK_TARGET_CAST) {
    const prompt = video.remote?.prompt;
    if (typeof prompt !== "function") return false;
    await prompt.call(video.remote);
    return true;
  }

  return false;
}
