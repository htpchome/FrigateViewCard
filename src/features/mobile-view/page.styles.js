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

  .card.mobile-view-active .mobile-bottom {
    display: flex;
    flex: 1 1 auto;
    flex-direction: column;
    width: 100%;
    min-height: 0;
    overflow: hidden;
  }

  .card.mobile-view-active .mobile-bottom .col-right {
    display: flex;
    flex: 1 1 auto;
    flex-direction: column;
    width: 100%;
    min-height: 0;
    overflow: hidden;
  }

  .card.mobile-view-active .mobile-bottom .col-right .frigate-view {
    display: none;
  }

  .card.mobile-view-active .mobile-bottom .tabs-holder {
    flex: 0 0 auto;
  }

  .card.mobile-view-active .mobile-bottom .browse-head {
    flex: 0 0 auto;
  }

  .card.mobile-view-active .mobile-bottom .browse {
    flex: 1 1 auto;
    min-height: 0;
  }

  .card.mobile-view-active .mobile-top .page-nav,
  .card.mobile-view-active .mobile-top .cam-switcher {
    padding-inline: 8px;
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
    width: 16px;
    height: 16px;
  }

  .card.mobile-view-active .mobile-cam-picker {
    position: relative;
    flex: 1 1 auto;
    min-width: 0;
  }

  .card.mobile-view-active .mobile-cam-picker__status {
    display: inline-flex;
    align-items: center;
    justify-self: end;
    gap: 6px;
    min-width: 0;
  }

  .card.mobile-view-active .mobile-cam-picker__stream {
    display: inline-flex;
    flex-direction: column;
    align-items: flex-end;
    line-height: 1.05;
  }

  .card.mobile-view-active .mobile-cam-picker__dot {
    font-size: 1rem;
    line-height: 1;
  }

  .card.mobile-view-active .mobile-cam-picker__trigger {
    width: 100%;
    display: inline-flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    padding: 8px 10px;
    border-radius: 10px;
  }

  .card.mobile-view-active .mobile-cam-picker__label {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-weight: 700;
  }

  .card.mobile-view-active .mobile-cam-picker__chev {
    width: 14px;
    height: 14px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .card.mobile-view-active .mobile-cam-picker__chev svg {
    width: 14px;
    height: 14px;
  }

  .card.mobile-view-active .mobile-cam-picker__panel {
    position: absolute;
    top: calc(100% + 6px);
    left: 0;
    right: 0;
    z-index: 8;
    display: flex;
    flex-direction: column;
    gap: 4px;
    max-height: 220px;
    overflow-y: auto;
    padding: 6px;
    border: 1px solid var(--c-border2);
    border-radius: 10px;
    background: var(--c-bg-panel);
    box-shadow: 0 10px 24px rgba(0, 0, 0, 0.24);
  }

  .card.mobile-view-active .mobile-cam-picker__panel[hidden] {
    display: none;
  }

  .card.mobile-view-active .mobile-cam-picker__option {
    appearance: none;
    width: 100%;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    border: 1px solid var(--c-border2);
    border-radius: 8px;
    background: var(--c-bg-main);
    color: var(--c-text);
    cursor: pointer;
    padding: 8px 10px;
    font-weight: 600;
    text-align: left;
  }

  .card.mobile-view-active .mobile-cam-picker__option.is-active {
    border-color: var(--c-primary-d);
    background: var(--c-primary-l);
    color: var(--c-primary-d);
  }

  .card.mobile-view-active .mobile-cam-picker__option-label {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  /* Mobile list styling hooks (scoped to mobile view only). */
  .card.mobile-view-active {
    --mv-list-item-gap: 9px;
    --mv-list-item-margin-bottom: 5px;
    --mv-list-item-padding: 2px 10px 2px 2px;
    --mv-list-item-radius: var(--fvc-border-radius);
    --mv-list-thumb-width: 256px;
    --mv-list-thumb-height: 144px;
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
