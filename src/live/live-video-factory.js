const VIDEO_PROFILES = Object.freeze({
  liveEngine: Object.freeze({
    styleText:
      "width:100%;height:100%;display:block;background:var(--c-bg-deep)",
    autoplay: true,
    playsInline: true,
    controls: false,
    preload: "",
  }),
  popupPlayback: Object.freeze({
    styleText: "",
    autoplay: true,
    playsInline: true,
    controls: true,
    preload: "metadata",
  }),
  recordingPlayback: Object.freeze({
    styleText: "",
    autoplay: false,
    playsInline: true,
    controls: true,
    preload: "metadata",
  }),
});

const VIDEO_VIEW_PROFILE_MAP = Object.freeze({
  live: "liveEngine",
  popup: "popupPlayback",
  recording: "recordingPlayback",
});

export function resolveVideoProfileNameForView(viewType) {
  const key = String(viewType || "")
    .trim()
    .toLowerCase();
  return VIDEO_VIEW_PROFILE_MAP[key] || VIDEO_VIEW_PROFILE_MAP.live;
}

function resolveVideoProfile({ profile, viewType } = {}) {
  const profileName = profile || resolveVideoProfileNameForView(viewType);
  return VIDEO_PROFILES[profileName] || VIDEO_PROFILES.liveEngine;
}

function applyVideoBooleanProperty(video, key, value) {
  if (typeof value === "boolean") {
    video[key] = value;
  }
}

function applyVideoStyleProperty(video, styleKey, value) {
  if (!video?.style || !styleKey) return;
  if (value === null) {
    video.style[styleKey] = "";
    return;
  }
  if (value === undefined) return;
  video.style[styleKey] = String(value);
}

function applyVideoStyleOptions(video, options = {}) {
  const styleOptions = {
    objectFit: options.objectFit,
    objectPosition: options.objectPosition,
    aspectRatio: options.aspectRatio,
    filter: options.filter,
    borderRadius: options.borderRadius,
    boxShadow: options.boxShadow,
    ...(options.style && typeof options.style === "object"
      ? options.style
      : {}),
  };

  for (const [styleKey, value] of Object.entries(styleOptions)) {
    applyVideoStyleProperty(video, styleKey, value);
  }
}

function applyVideoClassOptions(video, options = {}) {
  const { className, classNames } = options;
  if (className !== undefined) {
    video.className = className == null ? "" : String(className);
  }
  if (Array.isArray(classNames) && video.classList) {
    for (const classToken of classNames) {
      const token = String(classToken || "").trim();
      if (!token) continue;
      video.classList.add(token);
    }
  }
}

function applyVideoDatasetOptions(video, options = {}) {
  if (!video?.dataset || !options?.dataset || typeof options.dataset !== "object") {
    return;
  }

  for (const [key, value] of Object.entries(options.dataset)) {
    if (!key) continue;
    if (value === null || value === undefined || value === false) {
      delete video.dataset[key];
      continue;
    }
    video.dataset[key] = value === true ? "1" : String(value);
  }
}

/**
 * Applies a named video profile with optional per-view overrides.
 */
export function configureVideoElement(video, options = {}) {
  if (!video) return video;
  const profile = resolveVideoProfile({
    profile: options.profile,
    viewType: options.viewType,
  });
  const styleText = options.styleText || profile.styleText;

  applyVideoBooleanProperty(
    video,
    "autoplay",
    options.autoplay ?? profile.autoplay,
  );
  applyVideoBooleanProperty(
    video,
    "playsInline",
    options.playsInline ?? profile.playsInline,
  );
  applyVideoBooleanProperty(video, "muted", options.muted);
  applyVideoBooleanProperty(
    video,
    "controls",
    options.controls ?? profile.controls,
  );

  if (options.defaultMuted !== undefined) {
    applyVideoBooleanProperty(video, "defaultMuted", options.defaultMuted);
  }
  if (options.preload || profile.preload) {
    video.preload = options.preload || profile.preload;
  }
  if (styleText) {
    video.style.cssText = styleText;
  }
  applyVideoStyleOptions(video, options);
  applyVideoClassOptions(video, options);
  applyVideoDatasetOptions(video, options);

  // Keep iOS inline playback behavior stable for all profiles.
  video.setAttribute("playsinline", "");
  video.setAttribute("webkit-playsinline", "");

  if (options.attributes && typeof options.attributes === "object") {
    for (const [name, value] of Object.entries(options.attributes)) {
      if (value === null || value === undefined || value === false) {
        video.removeAttribute(name);
      } else if (value === true) {
        video.setAttribute(name, "");
      } else {
        video.setAttribute(name, String(value));
      }
    }
  }

  return video;
}

/**
 * Creates a configured <video> element for a given view profile.
 */
export function createVideoElement(options = {}) {
  const video = document.createElement("video");
  configureVideoElement(video, options);
  if (typeof options.src === "string") {
    video.src = options.src;
  }
  return video;
}

/**
 * Replaces slot content and mounts the provided node.
 */
export function mountNodeIntoSlot(slot, node) {
  if (!slot || !node) return;
  slot.innerHTML = "";
  slot.appendChild(node);
}
