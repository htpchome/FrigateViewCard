export const SINGLE_VIEW_PAGE_STYLES = `
  .card .single-view-frame {
    container-type: inline-size;
    container-name: single-view;
  }

  .card .layout--single-view .single-view-live-status-overlay {
    position: absolute;
    z-index: 7;
    top: 8px;
    right: 8px;
    display: none;
    align-items: center;
    justify-content: center;
    gap: 4px;
    pointer-events: none;
  }

  .card .layout--single-view :is(.single-view-live-badge, .single-view-source-indicator) {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 5px;
    min-height: 24px;
    box-sizing: border-box;
    padding: 3px 7px;
    border: 1px solid var(--fvc-media-overlay-border);
    border-radius: 999px;
    color: var(--fvc-media-overlay-text);
    background: var(--fvc-media-overlay-bg-soft);
    box-shadow: var(--fvc-media-overlay-shadow);
    font-size: .64rem;
    font-weight: 750;
    line-height: 1;
    text-transform: uppercase;
    backdrop-filter: blur(4px);
    -webkit-backdrop-filter: blur(4px);
  }

  .card .layout--single-view :is(.single-view-live-badge, .single-view-source-indicator)[hidden],
  .card .layout--single-view .single-view-source-indicator :is([data-single-view-source-icon], [data-single-view-source-text])[hidden] {
    display: none !important;
  }

  .card .layout--single-view .single-view-source-indicator-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  .card .layout--single-view .single-view-source-indicator-icon svg {
    width: 14px;
    height: 14px;
    color: currentColor;
    fill: currentColor;
  }

  .card .layout--single-view .single-view-live-badge-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: var(--c-on);
    box-shadow: 0 0 0 2px var(--fvc-media-overlay-live-halo);
  }

  .card .layout--single-view .single-view-live-badge.is-offline .single-view-live-badge-dot {
    background: var(--c-off);
    box-shadow: 0 0 0 2px var(--fvc-media-overlay-offline-halo);
  }

  .card .layout--single-view #live-stage:has(#stream-loading:not([hidden])) .single-view-live-status-overlay {
    display: none;
  }

  @container single-view (max-width: 420px) {
    .card .layout--single-view .info-row {
      --single-view-center-controls-width: 224px;
      --single-view-talk-controls-width: 132px;
      grid-template-columns: minmax(0, 1fr) var(--single-view-center-controls-width) minmax(0, 1fr);
      column-gap: 0;
    }

    .card .layout--single-view .single-view-live-status-overlay {
      display: inline-flex;
    }

    .card .layout--single-view .single-view-source-indicator {
      opacity: 0;
      visibility: hidden;
      transition: opacity .16s ease, visibility 0s linear .16s;
    }

    .card .layout--single-view #live-stage.live-controls-visible .single-view-source-indicator {
      opacity: 1;
      visibility: visible;
      transition-delay: 0s;
    }

    .card .layout--single-view .info-left {
      min-width: 0;
      overflow: hidden;
      gap: 0;
    }

    .card .layout--single-view .info-alert-stat,
    .card .layout--single-view .stats {
      display: none;
    }

    .card .layout--single-view .info-row-center-controls {
      display: grid;
      grid-template-columns: repeat(5, 40px);
      column-gap: 6px;
      width: var(--single-view-center-controls-width);
      min-width: var(--single-view-center-controls-width);
      justify-self: center;
      overflow: visible;
    }

    .card .layout--single-view .info-row-center-controls > [data-fvc-region="two-way-talk"] {
      grid-column: 2 / 5;
      grid-row: 1;
      width: var(--single-view-talk-controls-width);
      min-width: var(--single-view-talk-controls-width);
      justify-self: center;
    }

    .card .layout--single-view .info-row-center-controls .two-way-talk-control-row:not(.has-soundwave) {
      grid-template-columns: repeat(3, 40px);
      column-gap: 6px;
      width: var(--single-view-talk-controls-width);
    }

    .card .layout--single-view .info-row-center-controls .two-way-talk-control-row:not(.has-soundwave) .info-row-mic-btn {
      grid-column: 2;
    }

    .card .layout--single-view .info-row-center-controls .two-way-talk-control-row.has-soundwave {
      width: 112px;
    }

    .card .layout--single-view .info-row-center-controls .linked-light-position-slot[data-linked-light-position-slot="left"] {
      grid-column: 2;
    }

    .card .layout--single-view .info-row-center-controls .linked-light-position-slot[data-linked-light-position-slot="right"] {
      grid-column: 4;
    }

    .card.two-way-talk-active .layout--single-view .info-row-center-controls .linked-light-position-slot[data-linked-light-position-slot="left"] {
      grid-column: 1;
    }

    .card.two-way-talk-active .layout--single-view .info-row-center-controls .linked-light-position-slot[data-linked-light-position-slot="right"] {
      grid-column: 5;
    }

    .card .layout--single-view .live-playback-controls {
      gap: 6px;
    }

    .card .layout--single-view .live-playback-controls > button {
      width: 29px;
      height: 29px;
      flex-basis: 29px;
    }

    .card .layout--single-view .live-playback-controls.overlay-controls svg,
    .card .layout--single-view .live-playback-controls.overlay-controls:hover svg {
      width: 24px;
      height: 24px;
    }
  }
`;
