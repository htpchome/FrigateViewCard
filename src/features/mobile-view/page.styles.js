export const MOBILE_VIEW_PAGE_STYLES = `
  :host(.mobile-view-rotate-cover) {
    position: fixed !important;
    top: var(--rotate-oy, 0px) !important;
    left: var(--rotate-ox, 0px) !important;
    right: auto !important;
    bottom: auto !important;
    width: var(--rotate-vw, 100vw) !important;
    height: var(--rotate-vh, 100dvh) !important;
    min-height: var(--rotate-vh, 100dvh) !important;
    max-height: var(--rotate-vh, 100dvh) !important;
    z-index: 3000 !important;
    overflow: visible !important;
    border-radius: 0 !important;
    background: var(--c-bg-deep, #000) !important;
  }

  .card.mobile-view-active {
    border-top-left-radius: var(--fvc-border-radius);
    border-top-right-radius: var(--fvc-border-radius);
    overflow: hidden;
  }

  .card.mobile-view-active.mobile-view-outer-border-off {
    border: 0;
  }

  .card.mobile-view-active .layout.mobile-layout {
    border-top-left-radius: var(--fvc-border-radius);
    border-top-right-radius: var(--fvc-border-radius);
    overflow: hidden;
  }

  .card.mobile-view-active .mobile-container {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    min-height: 0;
    overflow: hidden;
    border-top-left-radius: var(--fvc-border-radius);
    border-top-right-radius: var(--fvc-border-radius);
    background: var(--c-bg-mobile, var(--c-bg-panel));
  }

  .card.mobile-view-active .mobile-top {
    display: flex;
    flex: 0 0 auto;
    flex-direction: column;
    position: relative;
    z-index: 2;
    width: 100%;
    min-height: 0;
    border-top-left-radius: var(--fvc-border-radius);
    border-top-right-radius: var(--fvc-border-radius);
    overflow: visible;
  }

  .card.mobile-view-active.mobile-view-header-overlay .mobile-top .cam-switcher {
    position:absolute;
    z-index:2300;
    top:8px;
    left:8px;
    right:8px;
    width:auto;
    padding:0;
    grid-template-columns:minmax(0,1fr) clamp(104px,34%,180px) minmax(0,1fr);
    gap:4px;
    background:transparent;
    pointer-events:none;
  }

  .card.mobile-view-active.mobile-view-header-overlay .mobile-cam-picker {
    grid-column:2;
    width:100%;
    opacity:0;
    visibility:hidden;
    pointer-events:none;
    transition:opacity .16s ease,visibility 0s linear .16s;
  }

  .card.mobile-view-active.mobile-view-header-overlay .mobile-cam-picker__back-slot {
    grid-column:1;
    opacity:0;
    visibility:hidden;
    pointer-events:none;
    transition:opacity .16s ease,visibility 0s linear .16s;
  }

  .card.mobile-view-active.mobile-view-header-overlay .mobile-cam-picker__back {
    display:inline-flex;
    align-items:center;
    justify-content:center;
    width:32px;
    height:32px;
    min-width:32px;
    min-height:32px;
    padding:4px;
    border:1px solid var(--fvc-media-overlay-border);
    border-radius:50%;
    color:var(--fvc-media-overlay-text);
    background:var(--fvc-media-overlay-bg);
    background-image:none;
    box-shadow:var(--fvc-media-overlay-shadow);
    backdrop-filter:blur(5px);
    -webkit-backdrop-filter:blur(5px);
    pointer-events:auto;
  }

  .card.mobile-view-active.mobile-view-header-overlay .mobile-cam-picker__back svg {
    width:20px;
    height:20px;
    color:currentColor;
    fill:currentColor;
    opacity:1;
  }

  .card.mobile-view-active.mobile-view-header-overlay .mobile-cam-picker__trigger {
    min-height:32px;
    padding:5px 29px 5px 9px;
    border:1px solid var(--fvc-media-overlay-border);
    border-radius:7px;
    color:var(--fvc-media-overlay-text);
    background:var(--fvc-media-overlay-bg);
    box-shadow:var(--fvc-media-overlay-shadow);
    font-size:.78rem;
    backdrop-filter:blur(5px);
    -webkit-backdrop-filter:blur(5px);
  }

  .card.mobile-view-active.mobile-view-header-overlay .mobile-cam-picker__chev {right:6px;width:18px;height:26px;}
  .card.mobile-view-active.mobile-view-header-overlay .mobile-cam-picker__chev svg {width:17px;height:17px;}
  .card.mobile-view-active.mobile-view-header-overlay .mobile-cam-picker__panel {
    top:calc(100% + 4px);
    gap:3px;
    padding:4px;
    overflow-x:hidden;
    overscroll-behavior:contain;
    border:1px solid var(--fvc-media-overlay-border-strong);
    border-radius:7px;
    background:var(--fvc-media-overlay-bg-strong);
    box-shadow:var(--fvc-media-overlay-shadow-strong);
  }

  .card.mobile-view-active.mobile-view-header-overlay .mobile-cam-picker__option {
    min-height:32px;
    padding:5px 7px;
    border:1px solid var(--fvc-media-overlay-border);
    border-radius:5px;
    color:var(--fvc-media-overlay-text-muted);
    background:var(--fvc-media-overlay-option-bg);
    box-shadow:none;
    font-size:.76rem;
    backdrop-filter:none;
  }

  .card.mobile-view-active.mobile-view-header-overlay .mobile-cam-picker__option.is-active {
    border-color:var(--fvc-media-overlay-active-border);
    color:var(--fvc-media-overlay-text);
    background:var(--fvc-media-overlay-active-bg);
  }

  .card.mobile-view-active.mobile-view-header-overlay .mobile-cam-picker__status {
    grid-column:3;
    justify-self:end;
    gap:4px;
    pointer-events:none;
  }

  .card.mobile-view-active.mobile-view-header-overlay .mobile-cam-picker__stream {
    min-height:24px;
    min-width:24px;
    box-sizing:border-box;
    align-items:center;
    justify-content:center;
    padding:3px 6px;
    border:1px solid var(--fvc-media-overlay-border);
    border-radius:999px;
    color:var(--fvc-media-overlay-text);
    background:var(--fvc-media-overlay-bg-soft);
    box-shadow:var(--fvc-media-overlay-shadow);
    opacity:0;
    visibility:hidden;
    transition:opacity .16s ease,visibility 0s linear .16s;
  }

  .card.mobile-view-active.mobile-view-header-overlay .mobile-cam-picker__stream .sv {font-size:.64rem;font-weight:750;line-height:1;}
  .card.mobile-view-active.mobile-view-header-overlay .mobile-cam-picker__stream .sl {display:none;}
  .card.mobile-view-active.mobile-view-header-overlay .mobile-cam-picker__live-tile {
    display:inline-flex;
    align-items:center;
    justify-content:center;
    gap:5px;
    min-height:24px;
    box-sizing:border-box;
    padding:3px 7px;
    border:1px solid var(--fvc-media-overlay-border);
    border-radius:999px;
    color:var(--fvc-media-overlay-text);
    background:var(--fvc-media-overlay-bg-soft);
    box-shadow:var(--fvc-media-overlay-shadow);
    font-size:.64rem;
    font-weight:750;
    line-height:1;
  }

  .card.mobile-view-active.mobile-view-header-overlay .mobile-cam-picker__live-label {display:inline;}
  .card.mobile-view-active.mobile-view-header-overlay .mobile-cam-picker__dot {font-size:.7rem;}
  .card.mobile-view-active.mobile-view-header-overlay.card-view-overlays-visible :is(
    .mobile-cam-picker,
    .mobile-cam-picker__back-slot,
    .mobile-cam-picker__stream
  ),
  .card.mobile-view-active.mobile-view-header-overlay .mobile-cam-picker.is-open {
    opacity:1;
    visibility:visible;
    pointer-events:auto;
    transition-delay:0s;
  }

  .card.mobile-view-active.mobile-view-header-overlay:is(.mobile-rotate-live,.mobile-rotate-live-exit) .mobile-cam-picker__back-slot {display:none;}

  @media (hover:hover) and (pointer:fine) {
    .card.mobile-view-active.mobile-view-header-overlay .mobile-cam-picker__back:hover,
    .card.mobile-view-active.mobile-view-header-overlay .mobile-cam-picker__trigger:hover {
      background:var(--fvc-media-overlay-bg-hover);
      border-color:var(--fvc-media-overlay-border-hover);
    }
  }

  .card.mobile-view-active .mobile-bottom{
    display:flex;
    flex:1 1 auto;
    flex-direction:column;
    width:100%;
    min-height:0;
    overflow:hidden;
    position:relative;
  }
  .card.mobile-view-active .mobile-video-controls-container{
  display:grid;grid-template-columns:minmax(0,1fr) auto minmax(0,1fr);grid-template-areas:"video-controls-left microphone video-controls-right";align-items:center;gap:10px;padding:0px 8px;
  }
  .card.mobile-view-active .mobile-video-controls-container > [data-fvc-region="linked-entities"]{display:contents;}
  .card.mobile-view-active .mobile-video-controls-left-row{grid-area:video-controls-left;}
  .card.mobile-view-active .mobile-microphone-row{
    grid-area:microphone;
    display:grid;
    grid-template-columns:40px 40px 40px;
    align-items:center;
    justify-content:center;
    justify-items:center;
    gap:6px;
  }
  .card.mobile-view-active .mobile-microphone-row .mobile-view-microphone-mute-btn{grid-column:1;}
  .card.mobile-view-active .mobile-microphone-row .mobile-view-two-way-talk-slot{grid-column:2;}
  .card.mobile-view-active .mobile-microphone-row .mobile-view-inline-mute-btn{grid-column:3;}
  .card.mobile-view-active .mobile-microphone-row .mobile-view-two-way-talk-slot[hidden] + .mobile-view-inline-mute-btn,
  .card.mobile-view-active .mobile-microphone-row .mobile-view-inline-mute-btn:only-child{grid-column:2;}
  .card.mobile-view-active .mobile-video-controls-right-row{grid-area:video-controls-right;}
  .card.mobile-view-active :is(.mobile-video-controls-left-row,.mobile-video-controls-right-row):not([hidden]){justify-self:stretch;justify-content:center;min-width:40px;}
  .card.mobile-view-active.two-way-talk-active :is(.mobile-video-controls-left-row,.mobile-video-controls-right-row){display:none !important;}
  .card.mobile-view-active .mobile-tab-container{
  display:grid;grid-template-columns:max-content auto minmax(0, 1fr);grid-template-areas:"tabs middle tools";align-items:center;gap:10px;padding:0px 8px;margin:3px;border-radius:8px;background-color:var(--c-bg-panel);container-type:inline-size;
  }
  .card.mobile-view-active .mobile-left-row{grid-area:tabs;justify-content:flex-start;}
  .card.mobile-view-active .mobile-tabs-row{grid-area:middle;justify-content:flex-start;}
  .card.mobile-view-active .mobile-tools-row{grid-area:tools;justify-content:flex-end;}

  .card.mobile-view-active.mobile-rotate-live .mobile-top,
  .card.mobile-view-active.mobile-rotate-live-exit .mobile-top,
  .card.mobile-view-active.mobile-rotate-popup .mobile-top,
  .card.mobile-view-active.mobile-rotate-popup-exit .mobile-top {
    z-index: 2000;
  }

  .card.mobile-view-active.mobile-rotate-live #live-stage,
  .card.mobile-view-active.mobile-rotate-live-exit #live-stage {
    z-index: 2200 !important;
  }

  .card.mobile-view-active.mobile-rotate-popup #myPopup,
  .card.mobile-view-active.mobile-rotate-popup-exit #myPopup {
    top: 0 !important;
    left: 0 !important;
    right: auto !important;
    bottom: auto !important;
    width: 100vw !important;
    height: 100dvh !important;
    max-height: 100dvh !important;
    min-height: 100dvh !important;
    z-index: 2200 !important;
  }

  .card.mobile-view-active .mobile-view-two-way-talk-slot {
    display: flex;
    align-items: center;
    justify-content: center;
    flex: 0 0 auto;
    padding: 2px 0;
  }

  .card.mobile-view-active .mobile-view-two-way-talk-slot[hidden] {
    display: none !important;
  }

  .card.mobile-view-active:not(.mobile-rotate-live):not(.mobile-rotate-live-exit) .live-playback-controls > #mute-btn {
    display: none !important;
  }

  .card.mobile-view-active.mobile-rotate-live #mobile-view-mute-btn,
  .card.mobile-view-active.mobile-rotate-live-exit #mobile-view-mute-btn {
    display: none !important;
  }

  .card.mobile-view-active :is(.mobile-view-inline-mute-btn,.mobile-view-microphone-mute-btn):not(.active),
  .card.mobile-view-active :is(.mobile-view-inline-mute-btn,.mobile-view-microphone-mute-btn):not(.active):hover,
  .card.mobile-view-active :is(.mobile-view-inline-mute-btn,.mobile-view-microphone-mute-btn):not(.active):active {
    color: var(--c-text2);
  }

  .card.mobile-view-active :is(.mobile-view-inline-mute-btn,.mobile-view-microphone-mute-btn):not(.active) svg,
  .card.mobile-view-active :is(.mobile-view-inline-mute-btn,.mobile-view-microphone-mute-btn):not(.active):hover svg,
  .card.mobile-view-active :is(.mobile-view-inline-mute-btn,.mobile-view-microphone-mute-btn):not(.active):active svg {
    color: var(--c-text2);
  }

  .card.mobile-view-active :is(.mobile-view-inline-mute-btn,.mobile-view-microphone-mute-btn).active,
  .card.mobile-view-active :is(.mobile-view-inline-mute-btn,.mobile-view-microphone-mute-btn).active:hover,
  .card.mobile-view-active :is(.mobile-view-inline-mute-btn,.mobile-view-microphone-mute-btn).active:active,
  .card.mobile-view-active :is(.mobile-view-inline-mute-btn,.mobile-view-microphone-mute-btn).active svg,
  .card.mobile-view-active :is(.mobile-view-inline-mute-btn,.mobile-view-microphone-mute-btn).active:hover svg,
  .card.mobile-view-active :is(.mobile-view-inline-mute-btn,.mobile-view-microphone-mute-btn).active:active svg {
    color: var(--c-text2);
  }

  .card.mobile-view-active :is(.mobile-view-inline-mute-btn,.mobile-view-microphone-mute-btn).talk-audio-active,
  .card.mobile-view-active :is(.mobile-view-inline-mute-btn,.mobile-view-microphone-mute-btn).talk-audio-active svg {
    color: var(--c-text);
  }

  .card.mobile-view-active.mobile-client .mobile-bottom > .footer {
    grid-template-columns: minmax(0, 1fr);
    flex: 0 0 auto;
    height: auto;
    min-height: 0;
    padding: 0 4px;
  }

  .card.mobile-view-active.mobile-client .mobile-bottom > .footer > :first-child {
    display: none;
  }

  .card.mobile-view-active.mobile-client .mobile-bottom > .footer .footer-version {
    padding: 2px 0;
  }
  .card.mobile-view-active .mobile-bottom .browse-head {
    flex: 0 0 auto;
  }

  .card.mobile-view-active .mobile-bottom .browse {
    flex: 1 1 auto;
    min-height: 0;
  }

  .card.mobile-view-active .mobile-bottom .button-holder {
    padding-inline: 6px;
  }

  /* Mobile list styling hooks (scoped to mobile view only). */
  .card.mobile-view-active {
    --mv-list-item-gap: 9px;
    --mv-list-item-margin-bottom: 5px;
    --mv-list-item-padding: 2px 10px 2px 2px;
    --mv-list-item-radius: var(--fvc-border-radius);
    --mv-list-thumb-width: 176px;
    --mv-list-thumb-height: 99px;
    --mv-list-thumb-radius: var(--fvc-border-radius);
    --mv-list-dot-bottom: 2px;
    --mv-list-dot-right: 3px;
    --mv-list-desc-padding: 6px 8.4px;
  }
  .card.mobile-view-active .browse--mobile-view {
    display:flex;
    flex:1 1 0;
    flex-direction: column;
    padding:3px;
    margin:0;
    min-height:0;
    height:auto;
    overflow-y:auto;
    overflow-x:hidden;
    box-sizing:border-box;
    position:relative
  }
  .card.mobile-view-active .browse--mobile-view .list {
    display: block;
    width: 100%;
    max-width: 100%;
    min-width: 0;
    min-height: 0;
    box-sizing: border-box;
  }

  .card.mobile-view-active .browse--mobile-view .list-head {
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
  }

  .card.mobile-view-active .browse--mobile-view .list-day-label{position:relative;z-index:1;padding:2px 0 4px;font-size:1rem;font-weight:700;color:var(--c-text2);letter-spacing:.02em;line-height:1.30;pointer-events:none;background:none;border:none;text-align: center;}

  .card.mobile-view-active .browse--mobile-view .list-item {
    position: relative;
    display: flex;
    flex-wrap: wrap;
    gap: var(--mv-list-item-gap);
    align-items: center;
    margin-bottom: var(--mv-list-item-margin-bottom);
    border-radius: var(--mv-list-item-radius);
    padding: var(--mv-list-item-padding);
    width: 100%;
    max-width: 100%;
    min-width: 0;
    box-sizing: border-box;
    background:var(--c-bg-mobile-list);
  }

  .card.mobile-view-active .browse--mobile-view .list-item.compact {
    padding: var(--mv-list-item-padding);
    flex-wrap: wrap;
  }

  .card.mobile-view-active .browse--mobile-view .list-item.compact .et {
    width: 112px;
    height: 63px;
    border-radius: 5px;
  }

  .card.mobile-view-active .browse--mobile-view .et {
    width: var(--mv-list-thumb-width);
    height: var(--mv-list-thumb-height);
    border-radius: var(--mv-list-thumb-radius);
    overflow: hidden;
    flex-shrink: 0;
    position: relative;
    object-fit: cover;
  }

  .card.mobile-view-active .browse--mobile-view .et > :is(img, .tph) {
    width: 100%;
    height: 100%;
  }

  .card.mobile-view-active .browse--mobile-view .et > img {
    object-fit: cover;
    display: block;
  }

  .card.mobile-view-active .browse--mobile-view .ed {
    position: absolute;
    bottom: var(--mv-list-dot-bottom);
    right: var(--mv-list-dot-right);
  }

  .card.mobile-view-active .browse--mobile-view .ei {
    flex: 1;
    min-width: 0;
  }

  .card.mobile-view-active .browse--mobile-view .etop {
    display: flex;
    align-items: center;
    gap: 5px;
    margin-bottom: 3px;
    flex-wrap: wrap;
  }

  .card.mobile-view-active .browse--mobile-view .eact {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 4px;
    flex-shrink: 0;
  }

  .card.mobile-view-active .browse--mobile-view .desc {
    margin-top: 4px;
    padding: var(--mv-list-desc-padding);
  }
`;
