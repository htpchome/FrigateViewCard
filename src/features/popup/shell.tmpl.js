export function buildPopupShellMarkup({ icons, version }) {
  return `<div id="myPopup" class="popup-content" data-no-swipe>
            <div class="popup-close-row">
              <button id="close-btn" class="close-btn round-btn" type="button" aria-label="Close">${icons.close}</button>
            </div>
            <div class="popup-header"></div>
            <div class="popup-body">
              <div class="viewer" id="viewer" style="display:none"></div>
              <div class="popup-media-controls" id="popup-media-controls" hidden>
                <span class="popup-media-controls-spacer" aria-hidden="true"></span>
                <button class="popup-media-btn" id="popup-media-play" type="button" title="Play/Pause" aria-label="Play/Pause">${icons.play}</button>
                <input class="popup-media-progress" id="popup-media-progress" type="range" min="0" max="1000" value="0" step="1" aria-label="Media progress">
                <span class="popup-media-time" id="popup-media-time">0:00/0:00</span>
                <button class="popup-media-btn" id="popup-media-mute" type="button" title="Mute" aria-label="Mute">${icons.volOn}</button>
                <input class="popup-media-volume" id="popup-media-volume" type="range" min="0" max="100" value="100" step="1" title="Volume" aria-label="Volume">
                <button class="popup-media-btn" id="popup-media-fs" type="button" title="Fullscreen" aria-label="Fullscreen">${icons.expand}</button>
                <button class="popup-media-btn" id="popup-media-airplay" type="button" title="AirPlay video" aria-label="AirPlay video" hidden>${icons.airplayVideo}</button>
                <span class="popup-media-controls-spacer" aria-hidden="true"></span>
              </div>
                <div class="recording-scrub" id="recording-scrub" hidden>
                  <div class="recording-scrub-main-row">
                    <button class="recording-scrub-play" id="recording-scrub-play" type="button" title="Play recording" aria-label="Play recording">${icons.play}</button>
                    <div class="recording-scrub-track" id="recording-scrub-track">
                      <div class="recording-segment-selection" id="recording-segment-selection" hidden>
                        <div class="recording-segment-shade recording-segment-shade--start" id="recording-segment-shade-start"></div>
                        <div class="recording-segment-keep" id="recording-segment-keep"></div>
                        <div class="recording-segment-shade recording-segment-shade--end" id="recording-segment-shade-end"></div>
                        <button class="recording-segment-handle recording-segment-handle--start" id="recording-segment-handle-start" data-recording-segment-handle="start" type="button" role="slider" aria-label="Segment start" aria-orientation="horizontal"><span class="recording-segment-handle-time" id="recording-segment-handle-start-time" aria-hidden="true">0:00</span></button>
                        <button class="recording-segment-handle recording-segment-handle--end" id="recording-segment-handle-end" data-recording-segment-handle="end" type="button" role="slider" aria-label="Segment end" aria-orientation="horizontal"><span class="recording-segment-handle-time" id="recording-segment-handle-end-time" aria-hidden="true">0:00</span></button>
                      </div>
                      <div class="recording-scrub-ticks" id="recording-scrub-ticks"></div>
                      <div class="recording-scrub-markers" id="recording-scrub-markers"></div>
                      <div class="recording-scrub-cursor" id="recording-scrub-cursor"></div>
                      <div class="recording-scrub-preview" id="recording-scrub-preview" hidden>
                        <img id="recording-scrub-preview-image" alt="">
                        <span id="recording-scrub-preview-label"></span>
                      </div>
                    </div>
                  </div>
                  <div class="recording-scrub-labels">
                    <span id="recording-scrub-start">0:00</span>
                    <span class="recording-scrub-now" id="recording-scrub-now">0:00 / 0:00</span>
                    <span id="recording-scrub-end">0:00</span>
                  </div>
                </div>
                <section class="recording-segment-manager" id="recording-segment-manager" aria-label="Recording segment download" hidden>
                  <div class="recording-segment-manager-copy">
                    <strong>Select a recording segment</strong>
                    <span>Drag the handles to choose what to keep. Green is downloaded; red is excluded.</span>
                  </div>
                  <div class="recording-segment-manager-footer">
                    <div class="recording-segment-summary" id="recording-segment-summary" aria-live="polite">
                      <span><b id="recording-segment-start-label">0:00</b> – <b id="recording-segment-end-label">0:00</b></span>
                      <span id="recording-segment-duration">Entire recording</span>
                    </div>
                    <div class="recording-segment-manager-controls">
                      <div class="recording-segment-manager-tools">
                        <button class="recording-segment-tool recording-segment-reset" id="recording-segment-reset" type="button" title="Reset segment" aria-label="Reset segment">${icons.rotate || ""}<span>Reset</span></button>
                        <button class="recording-segment-tool recording-segment-cancel" id="recording-segment-cancel" type="button" title="Cancel segment selection" aria-label="Cancel segment selection">${icons.close}<span>Cancel</span></button>
                      </div>
                      <div class="recording-segment-manager-actions">
                        <button class="recording-segment-preview-button" id="recording-segment-preview-button" type="button">${icons.play}<span>Preview Segment</span></button>
                        <button class="recording-segment-download" id="recording-segment-download" type="button">${icons.download}<span>Download Segment</span></button>
                      </div>
                    </div>
                  </div>
                </section>
                <div class="popup-info" id="popup-info" hidden></div>
                <div class="popup-carousel-wrap" id="popup-carousel-wrap" hidden>
                  <button class="popup-carousel-nav left" id="popup-carousel-left" data-carousel-dir="-1" type="button" title="Previous carousel page" aria-label="Previous carousel page" aria-controls="popup-carousel" hidden>${icons.left}
                  </button>
                  <div class="popup-carousel" id="popup-carousel"></div>
                  <button class="popup-carousel-nav right" id="popup-carousel-right" data-carousel-dir="1" type="button" title="Next carousel page" aria-label="Next carousel page" aria-controls="popup-carousel" hidden>${icons.right}
                  </button>
                </div>
            </div>
            <div class="recording-segment-preview-modal" id="recording-segment-preview-modal" hidden>
              <button class="recording-segment-preview-backdrop" type="button" data-recording-segment-preview-close aria-label="Close segment preview"></button>
              <section class="recording-segment-preview-dialog" role="dialog" aria-modal="true" aria-labelledby="recording-segment-preview-title">
                <header class="recording-segment-preview-head">
                  <div>
                    <strong id="recording-segment-preview-title">Segment Preview</strong>
                    <span id="recording-segment-preview-range">0:00 – 0:00</span>
                  </div>
                  <button class="recording-segment-preview-close" type="button" data-recording-segment-preview-close aria-label="Close segment preview">${icons.close}</button>
                </header>
                <div class="recording-segment-preview-video-host" id="recording-segment-preview-video-host"></div>
                <div class="recording-segment-preview-status" id="recording-segment-preview-status">Preparing segment preview…</div>
                <footer class="recording-segment-preview-actions">
                  <button class="recording-segment-download" id="recording-segment-preview-download" type="button">${icons.download}<span>Download Segment</span></button>
                </footer>
              </section>
            </div>
          </div>`;
}
