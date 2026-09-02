import { escapeHtml } from "../../shared/html.js";

function buildCameraOptionMarkup({
  camera,
  index,
  activeCamIdx,
  includeStatus,
  getCameraName,
  isCameraAvailable,
}) {
  const name = getCameraName(camera);
  const active = index === activeCamIdx;
  const available = !includeStatus || isCameraAvailable(camera);
  return `<button
            class="mobile-cam-picker__option${active ? " is-active" : ""}"
            type="button"
            role="option"
            aria-selected="${active ? "true" : "false"}"
            data-mobile-camidx="${index}"
          >
            <span class="mobile-cam-picker__option-content">
              <span class="cam-dot" style="color:${available ? "var(--c-on)" : "var(--c-off)"}">●</span>
              <span class="mobile-cam-picker__option-label">${escapeHtml(name)}</span>
            </span>
          </button>`;
}

export function buildCameraPickerMarkup({
  includeStatus,
  cameras,
  activeCamIdx,
  icons,
  getCameraName,
  isCameraAvailable,
  streamType = "--",
  online = true,
  pickerOpen = false,
}) {
  const cameraList = Array.isArray(cameras) ? cameras : [];
  const safeActiveIdx =
    Number.isInteger(activeCamIdx) &&
    activeCamIdx >= 0 &&
    activeCamIdx < cameraList.length
      ? activeCamIdx
      : 0;
  const activeCamera = cameraList[safeActiveIdx] || cameraList[0] || null;
  const activeCameraName = activeCamera
    ? getCameraName(activeCamera)
    : "Camera";
  const cameraOptions = cameraList
    .map((camera, index) =>
      buildCameraOptionMarkup({
        camera,
        index,
        activeCamIdx: safeActiveIdx,
        includeStatus,
        getCameraName,
        isCameraAvailable,
      }),
    )
    .join("");
  return `<div class="mobile-cam-picker${pickerOpen ? " is-open" : ""}" data-mobile-cam-picker>
      <button
        class="mobile-cam-picker__trigger"
        type="button"
        aria-haspopup="listbox"
        aria-expanded="${pickerOpen ? "true" : "false"}"
        data-mobile-cam-trigger
      >
        <span class="mobile-cam-picker__trigger-content">
          <span class="mobile-cam-picker__trigger-dot" aria-hidden="true">●</span>
          <span class="mobile-cam-picker__label">${escapeHtml(activeCameraName)}</span>
        </span>
        <span class="mobile-cam-picker__chev" aria-hidden="true">${icons.chevron || "v"}</span>
      </button>
      <div class="mobile-cam-picker__panel" role="listbox" ${pickerOpen ? "" : "hidden"} data-mobile-cam-panel>
        ${cameraOptions}
      </div>
    </div>
    <div class="mobile-cam-picker__status" aria-label="Live status">
      <div class="mobile-cam-picker__stream">
        <div class="sv stream-type" id="stream-type">${escapeHtml(streamType || "--")}</div>
        <div class="sl">Stream</div>
      </div>
      <div class="sv mobile-cam-picker__dot" id="on-dot" style="color:${online ? "var(--c-on)" : "var(--c-off)"}">●</div>
    </div>`;
}
