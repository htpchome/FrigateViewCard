export const MOBILE_VIEW_PAGE_STYLES = `
  .card.mobile-view-active .mobile-container {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    min-height: 0;
    overflow: hidden;
    background: var(--c-bg-panel);
  }

  .card.mobile-view-active .mobile-top {
    display: flex;
    flex: 0 0 auto;
    flex-direction: column;
    width: 100%;
    min-height: 0;
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
`;
