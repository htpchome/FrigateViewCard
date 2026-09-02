function mergeClassNames(...tokens) {
  return [
    ...new Set(tokens.filter(Boolean).join(" ").split(/\s+/).filter(Boolean)),
  ].join(" ");
}

export function buildBrowseHeaderRegionMarkup({ icons }) {
  return `<div class="browse-head" id="browse-head" data-fvc-region="browse-header" style="display:none">
              <div class="browse-head-left">
                <button class="round-btn recordings-day-nav" id="rec-day-prev" data-rec-day-nav="-1" type="button" title="Previous day" aria-label="Previous day" style="display:none">${icons.back || icons.left || ""}</button>
              </div>
              <div class="browse-head-middle" id="browse-head-label"></div>
              <div class="browse-head-right">
                <button class="round-btn recordings-day-nav" id="rec-day-next" data-rec-day-nav="1" type="button" title="Next day" aria-label="Next day" style="display:none">${icons.forward || icons.right || ""}</button>
              </div>
            </div>`;
}

export function buildBrowseRegionMarkup({ layoutProfile = {} } = {}) {
  const browseClassName = mergeClassNames("browse", layoutProfile.browseClass);
  return `<div class="${browseClassName}" id="browse" data-fvc-region="browse" style="display:none">
              <div class="list-head">
                <span class="newtoast" id="newtoast" style="display:none">new ✦</span>
              </div>
              <div class="browse-return-top-slot">
                <button class="browse-return-top-chip" id="browse-return-top" type="button" title="Return to top" aria-label="Return to top" hidden>
                  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12l1.41 1.41L11 7.83V20h2V7.83l5.59 5.58L20 12l-8-8-8 8z"/></svg>
                  <span>Top</span>
                </button>
              </div>
              <div class="list" id="list">
                <div class="empty">Loading…</div>
              </div>
            </div>`;
}
