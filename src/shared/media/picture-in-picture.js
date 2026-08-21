import {
  disableNativePictureInPicture,
  enableNativePictureInPicture,
} from "./video-factory.js";

export const PICTURE_IN_PICTURE_METHOD_STANDARD = "standard";
export const PICTURE_IN_PICTURE_METHOD_WEBKIT = "webkit";

function resolveOwnerDocument(video, documentObj) {
  return documentObj || video?.ownerDocument || globalThis.document || null;
}

export function pictureInPictureElementForVideo(video, documentObj = null) {
  if (!video) return null;
  const root = video.getRootNode?.();
  return (
    root?.pictureInPictureElement ||
    resolveOwnerDocument(video, documentObj)?.pictureInPictureElement ||
    null
  );
}

export function isVideoPictureInPictureActive(video, documentObj = null) {
  if (!video) return false;
  if (video.webkitPresentationMode === "picture-in-picture") return true;
  return pictureInPictureElementForVideo(video, documentObj) === video;
}

export function resolveVideoPictureInPictureSupport({
  video = null,
  documentObj = null,
} = {}) {
  if (!video) return { supported: false, method: "" };
  const doc = resolveOwnerDocument(video, documentObj);
  if (
    typeof video.requestPictureInPicture === "function" &&
    doc?.pictureInPictureEnabled !== false
  ) {
    return {
      supported: true,
      method: PICTURE_IN_PICTURE_METHOD_STANDARD,
    };
  }

  if (typeof video.webkitSetPresentationMode === "function") {
    try {
      if (
        typeof video.webkitSupportsPresentationMode !== "function" ||
        video.webkitSupportsPresentationMode("picture-in-picture")
      ) {
        return {
          supported: true,
          method: PICTURE_IN_PICTURE_METHOD_WEBKIT,
        };
      }
    } catch (_) {}
  }

  return { supported: false, method: "" };
}

export async function toggleVideoPictureInPicture({
  video = null,
  documentObj = null,
  temporarilyAllowDisabled = false,
} = {}) {
  const support = resolveVideoPictureInPictureSupport({ video, documentObj });
  if (!support.supported) {
    throw new Error("Picture-in-Picture is not supported for this video.");
  }

  if (support.method === PICTURE_IN_PICTURE_METHOD_STANDARD) {
    const doc = resolveOwnerDocument(video, documentObj);
    if (isVideoPictureInPictureActive(video, doc)) {
      await doc.exitPictureInPicture();
      return { active: false, method: support.method };
    }
    if (!temporarilyAllowDisabled) {
      await video.requestPictureInPicture();
      return { active: true, method: support.method };
    }

    enableNativePictureInPicture(video);
    try {
      await video.requestPictureInPicture();
    } finally {
      disableNativePictureInPicture(video);
    }
    return { active: true, method: support.method };
  }

  const active = isVideoPictureInPictureActive(video, documentObj);
  video.webkitSetPresentationMode(active ? "inline" : "picture-in-picture");
  return { active: !active, method: support.method };
}

export class PictureInPictureButtonController {
  constructor({ button = null, video = null, documentObj = null } = {}) {
    this.button = button;
    this.video = video;
    this._documentObj = documentObj;
    this._bound = false;
  }

  bind() {
    if (this._bound || !this.button || !this.video) return this;
    this._bound = true;
    for (const eventName of [
      "enterpictureinpicture",
      "leavepictureinpicture",
      "webkitpresentationmodechanged",
      "loadedmetadata",
      "emptied",
    ]) {
      this.video.addEventListener?.(eventName, this._sync);
    }
    this.refresh();
    return this;
  }

  refresh() {
    if (!this.button || !this.video) return false;
    const support = resolveVideoPictureInPictureSupport({
      video: this.video,
      documentObj: this._documentObj,
    });
    const mediaReady =
      this.video.readyState === undefined || Number(this.video.readyState) > 0;
    const available = support.supported && mediaReady;
    const active =
      available &&
      isVideoPictureInPictureActive(this.video, this._documentObj);
    this.button.hidden = !available;
    this.button.disabled = !available;
    this.button.classList?.toggle?.("active", active);
    this.button.setAttribute?.(
      "aria-hidden",
      available ? "false" : "true",
    );
    this.button.setAttribute?.("aria-pressed", active ? "true" : "false");
    this.button.title = active
      ? "Exit Picture-in-Picture"
      : "Picture-in-Picture";
    this.button.setAttribute?.("aria-label", this.button.title);
    return available;
  }

  dispose() {
    if (this._bound && this.video) {
      for (const eventName of [
        "enterpictureinpicture",
        "leavepictureinpicture",
        "webkitpresentationmodechanged",
        "loadedmetadata",
        "emptied",
      ]) {
        this.video.removeEventListener?.(eventName, this._sync);
      }
    }
    if (this.button) {
      this.button.hidden = true;
      this.button.disabled = true;
    }
    this._bound = false;
  }

  _sync = () => this.refresh();
}
