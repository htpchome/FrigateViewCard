export function buildLiveEngineWrapMarkup({ icons }) {
  return `<div id="eng-wrap" data-fvc-region="live">
                <frigate-live-stream id="engine">
                  <div class="ph">${icons.live}<span>Connecting…</span></div>
                </frigate-live-stream>
                  <div class="glass-btn slideshow-next-chip" id="slideshow-next-chip" hidden>Next Slide: 0s</div>
                  <div id="stream-fallback" hidden>
                    <img id="stream-fallback-img" alt="Camera snapshot">
                  </div>
                  <div class="stream-fallback-status" id="stream-fallback-status" hidden>Snapshot unavailable</div>
                  <div class="stream-loading" id="stream-loading" hidden>
                    <span class="dot"></span><span class="label">Loading…</span>
                  </div>
              </div>`;
}

export function buildLiveFullscreenControlMarkup({ icons }) {
  return `<div class="live-playback-controls" data-fvc-region="live-fullscreen">
    <button class="glass-btn live-playback-btn live-fs-btn" id="live-fs-btn" title="Fullscreen live" aria-label="Fullscreen live">${icons.expand}</button>
    <button class="glass-btn live-playback-btn live-cast-btn" id="live-cast-btn" title="Cast live video" aria-label="Cast live video" hidden>${icons.cast}</button>
    <button class="glass-btn live-playback-btn live-airplay-btn" id="live-airplay-btn" title="AirPlay live video" aria-label="AirPlay live video" hidden>${icons.airplayVideo}</button>
  </div>`;
}

export function buildLiveMuteControlMarkup({ icons, streamMuted }) {
  const label = streamMuted ? "Unmute live view" : "Mute live view";
  const icon = streamMuted ? icons.volOff : icons.volOn;
  return `<button class="glass-btn mute-btn" id="mute-btn" data-fvc-region="live-mute" title="${label}" aria-label="${label}">${icon}</button>`;
}
