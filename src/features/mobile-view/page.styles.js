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
    display: flex;
    align-items: center;
    gap: 8px;
    overflow: visible;
  }

  .card.mobile-view-active .mobile-cam-picker {
    position: relative;
    flex: 1 1 auto;
    min-width: 0;
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
`;
