export const MOBILE_VIEW_PAGE_STYLES = `
  .card.mobile-view-active {
    border-top-left-radius: var(--fvc-border-radius);
    border-top-right-radius: var(--fvc-border-radius);
    overflow: hidden;
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
    background: var(--c-bg-panel);
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

  .card.mobile-view-active .mobile-bottom{
    display:flex;
    flex:1 1 auto; 
    flex-direction:column;
    width:100%;
    min-height:0; 
    overflow:hidden;
    position:relative;
  }
  .card.mobile-view-active .mobile-tab-container{
  display:grid;grid-template-columns:minmax(0,1fr) auto minmax(0,1fr);grid-template-areas:"left tabs tools";align-items:center;gap:10px;padding:4px 8px;
  }
  
  .card.mobile-view-active .mobile-left-row{grid-area:left;justify-content:flex-start;}
  .card.mobile-view-active .mobile-tabs-row{grid-area:tabs;justify-content:center;}
  .card.mobile-view-active .mobile-tools-row{grid-area:tools;justify-content:flex-end;}

  .card.mobile-view-active.mobile-rotate-live .mobile-top,
  .card.mobile-view-active.mobile-rotate-live-exit .mobile-top,
  .card.mobile-view-active.mobile-rotate-popup .mobile-top,
  .card.mobile-view-active.mobile-rotate-popup-exit .mobile-top {
    z-index: 2000;
  }

  .card.mobile-view-active.mobile-rotate-live #eng-wrap,
  .card.mobile-view-active.mobile-rotate-live-exit #eng-wrap {
    top: 0 !important;
    left: 0 !important;
    width: 100vw !important;
    height: 100dvh !important;
    z-index: 2147483000 !important;
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
    z-index: 2147483000 !important;
  }

  .card.mobile-view-active .mobile-view-two-way-talk-slot {
    display: flex;
    align-items: center;
    justify-content: center;
    flex: 0 0 auto;
    padding: 8px 12px 6px;
  }

  .card.mobile-view-active .mobile-view-two-way-talk-slot[hidden] {
    display: none !important;
  }

  .card.mobile-view-active .mobile-bottom .frigate-view {
    
  }
  .card.mobile-view-active .mobile-bottom .browse-head {
    flex: 0 0 auto;
  }

  .card.mobile-view-active .mobile-bottom .browse {
    flex: 1 1 auto;
    min-height: 0;
  }

  .card.mobile-view-active .mobile-top .cam-switcher {
    padding-inline: 8px;
  }

  .card.mobile-view-active .mobile-bottom .button-holder {
    padding-inline: 6px;
  }

  .card.mobile-view-active .mobile-top .cam-switcher {
    position: relative;
    display: grid;
    grid-template-columns: auto minmax(0, 1fr) auto;
    align-items: center;
    gap: 8px;
    overflow: visible;
  }

  .card.mobile-view-active .mobile-cam-picker__back {
    width: 34px;
    height: 34px;
    border-radius: 999px;
    padding: 0;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  .card.mobile-view-active .mobile-cam-picker__back svg {
    width: 20px;
    height: 20px;
  }

  .card.mobile-view-active .mobile-cam-picker {
    position: relative;
    justify-self: center;
    width: min(100%, clamp(162px, 51vw, 306px));
    min-width: 0;
  }

  .card.mobile-view-active .mobile-cam-picker__status {
    display: inline-flex;
    align-items: center;
    justify-self: end;
    gap: 6px;
    font-size: 1rem;
    min-width: 0;
  }

  .card.mobile-view-active .mobile-cam-picker__stream {
    display: inline-flex;
    flex-direction: column;
    align-items: flex-end;
    font-size: 0.85rem;
    line-height: 1;
  }

  .card.mobile-view-active .mobile-cam-picker__dot {
    font-size: 0.85rem;
    line-height: 1;
  }

  .card.mobile-view-active .mobile-cam-picker__trigger {
    width: 100%;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    padding: 9px 36px 9px 12px;
    border-radius: 10px;
    font-size: 1.15rem;
  }

  .card.mobile-view-active .mobile-cam-picker__trigger-content {
    display: inline-grid;
    grid-template-columns: auto minmax(0, auto);
    align-items: center;
    justify-content: center;
    gap: 8px;
    min-width: 0;
    max-width: 100%;
  }

  .card.mobile-view-active .mobile-cam-picker__trigger-dot {
    visibility: hidden;
    width: 0.95rem;
    font-size: 1rem;
    line-height: 1;
  }

  .card.mobile-view-active .mobile-cam-picker__label {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-weight: 700;
    text-align: left;
  }

  .card.mobile-view-active .mobile-cam-picker__chev {
    position: absolute;
    right: 12px;
    top: 50%;
    transform: translateY(-50%);
    width: 20px;
    height: 30px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .card.mobile-view-active .mobile-cam-picker__chev svg {
    width: 20px;
    height: 20px;
  }

  .card.mobile-view-active .mobile-cam-picker__panel {
    position: absolute;
    top: calc(100% + 6px);
    left: 0;
    right: 0;
    transform: none;
    z-index: 8;
    display: flex;
    flex-direction: column;
    align-items: stretch;
    gap: 4px;
    width: 100%;
    max-width: 100%;
    max-height: min(60dvh, calc(100dvh - 160px));
    overflow-y: auto;
    padding: 6px;
    box-sizing: border-box;
    border: 1px solid rgba(255, 255, 255, 0.28);
    border-radius: 10px;
    background: rgba(255, 255, 255, 0.2);
    backdrop-filter: blur(8px) saturate(180%);
    -webkit-backdrop-filter: blur(8px) saturate(180%);
    box-shadow:
      0 8px 32px rgba(31, 38, 135, 0.2),
      inset 0 0 0 1px rgba(255, 255, 255, 0.35);
  }

  .card.mobile-view-active .mobile-cam-picker__panel[hidden] {
    display: none;
  }

  .card.mobile-view-active .mobile-cam-picker__option {
    appearance: none;
    width: 100%;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    border: 1px solid rgba(255, 255, 255, 0.28);
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.18);
    backdrop-filter: blur(5px) saturate(170%);
    -webkit-backdrop-filter: blur(5px) saturate(170%);
    box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.2);
    color: var(--c-text);
    cursor: pointer;
    padding: 8px 10px;
    font-weight: 600;
    font-size: 1.15rem;
    text-align: left;
    transition:
      background 0.18s ease,
      border-color 0.18s ease,
      box-shadow 0.18s ease,
      color 0.18s ease;
  }

  .card.mobile-view-active .mobile-cam-picker__option:hover {
    background: rgba(255, 255, 255, 0.28);
    border-color: rgba(255, 255, 255, 0.5);
  }

  .card.mobile-view-active .mobile-cam-picker__option.is-active {
    border-color: rgba(255, 255, 255, 0.58);
    background: rgba(255, 255, 255, 0.34);
    box-shadow:
      inset 0 0 0 1px rgba(255, 255, 255, 0.55),
      0 0 0 1px color-mix(in srgb, var(--c-primary-d) 55%, transparent);
    color: var(--c-primary-d);
  }

  .card.mobile-view-active .mobile-cam-picker__option-content {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr);
    align-items: center;
    gap: 8px;
    width: 100%;
    min-width: 0;
  }

  .card.mobile-view-active .mobile-cam-picker__option-label {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    text-align: left;
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

  .card.mobile-view-active .browse--mobile-view .list {
    display: block;
    min-height: 0;
  }

  .card.mobile-view-active .browse--mobile-view .list-head {
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
  }

  .card.mobile-view-active .browse--mobile-view .list-day-label{position:relative;z-index:1;padding:2px 0 4px;font-size:1rem;font-weight:700;color:var(--c-text2);letter-spacing:.02em;line-height:1.30;pointer-events:none;background:var(--c-bg-panel);border:none;text-align: center;}  

  .card.mobile-view-active .browse--mobile-view .list-item {
    position: relative;
    display: flex;
    flex-wrap: wrap;
    gap: var(--mv-list-item-gap);
    align-items: center;
    margin-bottom: var(--mv-list-item-margin-bottom);
    border-radius: var(--mv-list-item-radius);
    padding: var(--mv-list-item-padding);
    background:var(--c-bg-primary);
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
    border-radius: var(--mv-list-thumb-radius);
    overflow: hidden;
    flex-shrink: 0;
    position: relative;
    object-fit: cover;
  }

  .card.mobile-view-active .browse--mobile-view .et img {
    width: var(--mv-list-thumb-width);
    height: var(--mv-list-thumb-height);
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
