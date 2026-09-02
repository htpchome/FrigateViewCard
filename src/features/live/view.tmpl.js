export function buildLiveEngineWrapMarkup({ icons }) {
  return `<div id="eng-wrap" data-fvc-region="live">
                <div class="camera-group-live-layout" id="camera-group-live-layout">
                  <div class="camera-group-live-pane camera-group-live-pane--primary is-audio-active" data-camera-group-member="A">
                    <frigate-live-stream id="engine">
                      <div class="ph">${icons.live}<span>Connecting…</span></div>
                    </frigate-live-stream>
                    <div id="stream-fallback" hidden>
                      <img id="stream-fallback-img" alt="Camera snapshot">
                    </div>
                    <div class="stream-fallback-status" id="stream-fallback-status" hidden>Snapshot unavailable</div>
                    <div class="camera-group-pane-controls">
                      <button class="camera-group-pane-button camera-group-audio-select" type="button" data-media-overlay-ignore data-camera-group-audio="A" title="Use main camera audio" aria-label="Use main camera audio" aria-pressed="true">${icons.volOn}<span>A</span></button>
                      <button class="camera-group-pane-button camera-group-focus-toggle" type="button" data-media-overlay-ignore data-camera-group-focus="A" title="Focus main camera" aria-label="Focus main camera" aria-pressed="false">${icons.singleView}</button>
                      <button class="camera-group-pane-button camera-group-mobile-toggle" type="button" data-media-overlay-ignore data-camera-group-mobile-toggle title="Show camera B" aria-label="Show camera B">${icons.singleView}<span>B</span></button>
                    </div>
                  </div>
                  <div class="camera-group-live-pane camera-group-live-pane--secondary" data-camera-group-member="B" hidden>
                    <div id="camera-group-secondary-engine"></div>
                    <div class="camera-group-member-loading"><span class="dot"></span><span>Loading…</span></div>
                    <div class="camera-group-pane-controls">
                      <button class="camera-group-pane-button camera-group-audio-select" type="button" data-media-overlay-ignore data-camera-group-audio="B" title="Use second camera audio" aria-label="Use second camera audio" aria-pressed="false">${icons.volOff}<span>B</span></button>
                      <button class="camera-group-pane-button camera-group-focus-toggle" type="button" data-media-overlay-ignore data-camera-group-focus="B" title="Focus second camera" aria-label="Focus second camera" aria-pressed="false">${icons.singleView}</button>
                    </div>
                  </div>
                </div>
                  <div id="grid-engine" aria-hidden="true" hidden></div>
                  <div class="slideshow-next-chip" id="slideshow-next-chip" hidden>Next Slide: 0s</div>
                  <div class="stream-loading" id="stream-loading" hidden>
                    <span class="dot"></span><span class="label">Loading…</span>
                  </div>
                  <button class="live-resize-grip" id="live-resize-grip" type="button" role="slider" aria-orientation="vertical" aria-label="Resize live view height" title="Drag to resize live view; double-click or double-tap to reset" hidden>
                    ${icons.chevron}
                  </button>
              </div>`;
}

const resolveLiveControlButtonClass = (buttonClass) =>
  String(buttonClass || "square-btn").trim() || "square-btn";

export function buildLiveFullscreenControlMarkup({
  icons,
  buttonClass = "square-btn",
}) {
  const visualButtonClass = resolveLiveControlButtonClass(buttonClass);
  return `<button class="${visualButtonClass} live-fs-btn" id="live-fs-btn" data-fvc-region="live-fullscreen" title="Fullscreen live" aria-label="Fullscreen live">${icons.expand}</button>`;
}

export function buildLivePictureInPictureControlMarkup({
  icons,
  buttonClass = "square-btn",
}) {
  const visualButtonClass = resolveLiveControlButtonClass(buttonClass);
  return `<button class="${visualButtonClass} live-pip-btn" id="live-pip-btn" data-fvc-region="live-picture-in-picture" type="button" title="Picture-in-Picture live" aria-label="Picture-in-Picture live" aria-pressed="false" hidden>${icons.pipPopOut}</button>`;
}

export function buildLiveTakeSnapshotControlMarkup({
  icons,
  buttonClass = "square-btn",
}) {
  const visualButtonClass = resolveLiveControlButtonClass(buttonClass);
  return `<button class="${visualButtonClass} live-take-snapshot-btn" id="live-take-snapshot-btn" data-fvc-region="live-take-snapshot" type="button" title="Take Snapshot" aria-label="Take Snapshot">${icons.takeSnapshot}</button>`;
}

export function buildLiveMuteControlMarkup({
  icons,
  streamMuted,
  buttonClass = "square-btn",
  buttonId = "mute-btn",
  region = "live-mute",
  extraClass = "",
  pressed = null,
  hidden = false,
}) {
  const label = streamMuted ? "Unmute live view" : "Mute live view";
  const icon = streamMuted ? icons.volOff : icons.volOn;
  const visualButtonClass = resolveLiveControlButtonClass(buttonClass);
  const className = [
    visualButtonClass,
    "mute-btn",
    extraClass,
    pressed === true ? "active" : "",
  ]
    .filter(Boolean)
    .join(" ");
  const regionAttribute = region ? ` data-fvc-region="${region}"` : "";
  const pressedAttribute =
    typeof pressed === "boolean" ? ` aria-pressed="${pressed}"` : "";
  const hiddenAttribute = hidden ? " hidden" : "";
  return `<button class="${className}" id="${buttonId}"${regionAttribute}${pressedAttribute}${hiddenAttribute} title="${label}" aria-label="${label}">${icon}</button>`;
}

export function buildLivePlaybackControlsMarkup(regions = {}) {
  return `<div class="live-playback-controls overlay-controls" id="live-playback-controls">
              ${regions.livePictureInPicture || ""}
              ${regions.liveTakeSnapshot || ""}
              ${regions.liveFullscreen || ""}
              ${regions.liveMute || ""}
            </div>`;
}
