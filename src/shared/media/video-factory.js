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

const VIDEO_VIEW_DEFAULT_OPTIONS = Object.freeze({
  live: Object.freeze({ viewType: "live" }),
  popup: Object.freeze({ viewType: "popup" }),
  recording: Object.freeze({ viewType: "recording" }),
});

const EMPTY_OPTIONS = Object.freeze({});
const globalRuntimeVideoViewDefaultOptions = {
  live: {},
  popup: {},
  recording: {},
};
const scopedRuntimeVideoViewDefaultsWeak = new WeakMap();
const scopedRuntimeVideoViewDefaultsMap = new Map();

function createRuntimeDefaultsStore() {
  return {
    live: {},
    popup: {},
    recording: {},
  };
}

export function resolveVideoProfileNameForView(viewType) {
  const key = String(viewType || "")
    .trim()
    .toLowerCase();
  return VIDEO_VIEW_PROFILE_MAP[key] || VIDEO_VIEW_PROFILE_MAP.live;
}

function resolveViewKey(viewType) {
  const key = String(viewType || "")
    .trim()
    .toLowerCase();
  return VIDEO_VIEW_DEFAULT_OPTIONS[key] ? key : "live";
}

function normalizeOptionsObject(value) {
  return value && typeof value === "object" ? value : EMPTY_OPTIONS;
}

function isObjectScopeKey(scopeKey) {
  return (
    scopeKey !== null &&
    (typeof scopeKey === "object" || typeof scopeKey === "function")
  );
}

function resolveScopedRuntimeStore(scopeKey, { create = false } = {}) {
  if (scopeKey === null || scopeKey === undefined) return null;

  if (isObjectScopeKey(scopeKey)) {
    const existing = scopedRuntimeVideoViewDefaultsWeak.get(scopeKey);
    if (existing || !create) return existing || null;
    const next = createRuntimeDefaultsStore();
    scopedRuntimeVideoViewDefaultsWeak.set(scopeKey, next);
    return next;
  }

  const existing = scopedRuntimeVideoViewDefaultsMap.get(scopeKey);
  if (existing || !create) return existing || null;
  const next = createRuntimeDefaultsStore();
  scopedRuntimeVideoViewDefaultsMap.set(scopeKey, next);
  return next;
}

function resolveRuntimeDefaultsForView(viewKey, context = {}) {
  const globalDefaults =
    globalRuntimeVideoViewDefaultOptions[viewKey] || EMPTY_OPTIONS;
  const scopedStore = resolveScopedRuntimeStore(context.scopeKey);
  const scopedDefaults = scopedStore?.[viewKey] || EMPTY_OPTIONS;
  return mergeOptionLayers(
    EMPTY_OPTIONS,
    normalizeOptionsObject(globalDefaults),
    normalizeOptionsObject(scopedDefaults),
  );
}

function mergeOptionLayers(base, runtimeDefaults, overrides) {
  const merged = {
    ...base,
    ...runtimeDefaults,
    ...overrides,
  };

  const mergeObjectKey = (key) => {
    if (base[key] || runtimeDefaults[key] || overrides[key]) {
      merged[key] = {
        ...normalizeOptionsObject(base[key]),
        ...normalizeOptionsObject(runtimeDefaults[key]),
        ...normalizeOptionsObject(overrides[key]),
      };
    }
  };

  mergeObjectKey("style");
  mergeObjectKey("dataset");
  mergeObjectKey("attributes");

  if (base.classNames || runtimeDefaults.classNames || overrides.classNames) {
    const tokens = [
      ...(Array.isArray(base.classNames) ? base.classNames : []),
      ...(Array.isArray(runtimeDefaults.classNames)
        ? runtimeDefaults.classNames
        : []),
      ...(Array.isArray(overrides.classNames) ? overrides.classNames : []),
    ]
      .map((token) => String(token || "").trim())
      .filter(Boolean);
    merged.classNames = [...new Set(tokens)];
  }

  return merged;
}

export function setVideoViewDefaultOptions(viewType, defaults = {}) {
  const viewKey = resolveViewKey(viewType);
  globalRuntimeVideoViewDefaultOptions[viewKey] = {
    ...normalizeOptionsObject(defaults),
  };
}

export function getVideoViewDefaultOptions(viewType) {
  const viewKey = resolveViewKey(viewType);
  return {
    ...normalizeOptionsObject(globalRuntimeVideoViewDefaultOptions[viewKey]),
  };
}

export function resetVideoViewDefaultOptions(viewType = null) {
  if (viewType == null) {
    for (const key of Object.keys(globalRuntimeVideoViewDefaultOptions)) {
      globalRuntimeVideoViewDefaultOptions[key] = {};
    }
    return;
  }
  const viewKey = resolveViewKey(viewType);
  globalRuntimeVideoViewDefaultOptions[viewKey] = {};
}

export function setScopedVideoViewDefaultOptions(
  viewType,
  defaults = {},
  context = {},
) {
  const viewKey = resolveViewKey(viewType);
  const scopeKey = context?.scopeKey;
  const store = resolveScopedRuntimeStore(scopeKey, { create: true });
  if (!store) {
    setVideoViewDefaultOptions(viewType, defaults);
    return;
  }
  store[viewKey] = {
    ...normalizeOptionsObject(defaults),
  };
}

export function getScopedVideoViewDefaultOptions(viewType, context = {}) {
  const viewKey = resolveViewKey(viewType);
  const scopeKey = context?.scopeKey;
  const store = resolveScopedRuntimeStore(scopeKey);
  if (!store) return {};
  return { ...normalizeOptionsObject(store[viewKey]) };
}

export function resetScopedVideoViewDefaultOptions(
  viewType = null,
  context = {},
) {
  const scopeKey = context?.scopeKey;
  const store = resolveScopedRuntimeStore(scopeKey);
  if (!store) return;

  if (viewType == null) {
    for (const key of Object.keys(store)) {
      store[key] = {};
    }
    return;
  }

  const viewKey = resolveViewKey(viewType);
  store[viewKey] = {};
}

export function buildVideoOptionsForView(
  viewType,
  overrides = {},
  context = {},
) {
  const viewKey = resolveViewKey(viewType);
  const base =
    VIDEO_VIEW_DEFAULT_OPTIONS[viewKey] || VIDEO_VIEW_DEFAULT_OPTIONS.live;
  const runtimeDefaults = resolveRuntimeDefaultsForView(viewKey, context);
  const safeOverrides = normalizeOptionsObject(overrides);
  return mergeOptionLayers(base, runtimeDefaults, safeOverrides);
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
  if (
    !video?.dataset ||
    !options?.dataset ||
    typeof options.dataset !== "object"
  ) {
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

export function enableNativePictureInPicture(video) {
  if (!video) return false;
  video.disablePictureInPicture = false;
  video.removeAttribute?.("disablepictureinpicture");
  return true;
}

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

  video.setAttribute("playsinline", "");
  video.setAttribute("webkit-playsinline", "");
  enableNativePictureInPicture(video);
  video.disableRemotePlayback = true;
  video.setAttribute("x-webkit-airplay", "deny");

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

export function createVideoElement(options = {}) {
  const video = document.createElement("video");
  configureVideoElement(video, options);
  if (typeof options.src === "string") {
    video.src = options.src;
  }
  return video;
}

export function supportsNativeHlsPlayback() {
  const video = document.createElement("video");
  return !!(
    video.canPlayType?.("application/vnd.apple.mpegurl") ||
    video.canPlayType?.("application/x-mpegURL")
  );
}

export function mountNodeIntoSlot(slot, node) {
  if (!slot || !node) return;
  slot.innerHTML = "";
  slot.appendChild(node);
}
