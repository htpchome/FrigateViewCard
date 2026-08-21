export function buildLiveEngineWrapMarkup({ icons }) {
  return `<div id="eng-wrap" data-fvc-region="live">
                <frigate-live-stream id="engine">
                  <div class="ph">${icons.live}<span>Connecting…</span></div>
                </frigate-live-stream>
                  <div class="slideshow-next-chip" id="slideshow-next-chip" hidden>Next Slide: 0s</div>
                  <div id="stream-fallback" hidden>
                    <img id="stream-fallback-img" alt="Camera snapshot">
                  </div>
                  <div class="stream-fallback-status" id="stream-fallback-status" hidden>Snapshot unavailable</div>
                  <div class="stream-loading" id="stream-loading" hidden>
                    <span class="dot"></span><span class="label">Loading…</span>
                  </div>
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
}) {
  const label = streamMuted ? "Unmute live view" : "Mute live view";
  const icon = streamMuted ? icons.volOff : icons.volOn;
  const visualButtonClass = resolveLiveControlButtonClass(buttonClass);
  return `<button class="${visualButtonClass} mute-btn" id="mute-btn" data-fvc-region="live-mute" title="${label}" aria-label="${label}">${icon}</button>`;
}

export function buildLivePlaybackControlsMarkup(regions = {}) {
  return `<div class="live-playback-controls overlay-controls" id="live-playback-controls">
              ${regions.livePictureInPicture || ""}
              ${regions.liveTakeSnapshot || ""}
              ${regions.liveFullscreen || ""}
              ${regions.liveMute || ""}
            </div>`;
}
