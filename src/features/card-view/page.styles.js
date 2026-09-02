export const CARD_VIEW_PAGE_STYLES = `
  :host(.card-view-natural-height) {
    height:auto !important;
    max-height:none !important;
    overflow:visible;
  }
  :host(.card-view-natural-height) ha-card,
  :host(.card-view-natural-height) .card.card-view-active {
    height:auto !important;
    max-height:none !important;
    overflow:hidden !important;
  }
  .card.card-view-active .card-view-layout {
    height:auto;
    max-height:none;
    overflow:visible !important;
    background:var(--c-bg-main);
  }
  .card.card-view-active .card-view-camera-row {
    z-index:20;
    background:var(--c-bg-mobile);
  }
  .card.card-view-active .card-view-live-stage {width:100%;flex:0 0 auto;}
  .card.card-view-active #eng-wrap {max-height:none;}
  .card.card-view-active .card-view-drawer {
    display:grid;grid-template-rows:minmax(0,1fr);min-height:0;overflow:visible;
    transition:grid-template-rows 240ms cubic-bezier(.22,.61,.36,1);
  }
  .card.card-view-active .card-view-drawer-inner {
    min-height:0;overflow:visible;visibility:visible;
    transition:visibility 0s linear 0s;
  }
  .card.card-view-active .card-view-drawer.is-closed {
    grid-template-rows:minmax(0,0fr);overflow:hidden;
  }
  .card.card-view-active .card-view-drawer.is-closed .card-view-drawer-inner {
    overflow:hidden;visibility:hidden;pointer-events:none;
    transition-delay:240ms;
  }
  .card.card-view-active .card-view-activity {position:relative;z-index:10;overflow:visible;padding:5px 8px 8px;background:var(--c-bg-main);container-type:inline-size;container-name:card-view-activity;}
  .card.card-view-active .card-view-activity-toolbar {
    position:relative;z-index:2;display:grid;grid-template-columns:minmax(0,1fr) auto minmax(0,1fr);
    align-items:center;gap:10px;min-height:42px;
  }
  .card.card-view-active .card-view-toolbar-start {display:flex;align-items:center;gap:10px;min-width:0;}
  .card.card-view-active .card-view-toolbar-center {display:flex;align-items:center;justify-content:center;gap:12px;min-width:36px;}
  .card.card-view-active .card-view-activity-heading {font-weight:700;color:var(--c-text);min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
  .card.card-view-active :is(.card-view-mode-switch,.card-view-alert-scope-switch) {
    width:auto;min-width:0;height:34px;min-height:34px;display:inline-flex;align-items:center;gap:5px;
    flex:0 0 auto;padding:4px 8px;
  }
  .card.card-view-active .card-view-mode-switch-icon {display:inline-flex;align-items:center;justify-content:center;width:20px;height:20px;}
  .card.card-view-active .card-view-mode-switch-icon svg {width:20px;height:20px;}
  .card.card-view-active .card-view-mode-switch-label {font-size:.67rem;font-weight:700;line-height:1;}
  .card.card-view-active .card-view-activity-actions {display:flex;align-items:center;justify-content:flex-end;justify-self:end;gap:4px;}
  .card.card-view-active .card-view-activity-actions .icon-btn {width:36px;height:36px;min-width:36px;min-height:36px;}
  .card.card-view-active .card-view-activity-actions .icon-btn svg {width:22px;height:22px;}
  .card.card-view-active .card-view-microphone-slot {display:flex;align-items:center;justify-content:center;}
  .card.card-view-active .card-view-toolbar-center > .card-view-microphone-slot {order:2;}
  .card.card-view-active .card-view-toolbar-center > .card-view-linked-light {display:contents;}
  .card.card-view-active .card-view-linked-light-position[data-linked-light-position-slot="left"] {order:1;}
  .card.card-view-active .card-view-linked-light-position[data-linked-light-position-slot="right"] {order:3;}
  .card.card-view-active .card-view-microphone-slot .info-row-mic-btn {width:36px;height:36px;min-width:36px;min-height:36px;}
  .card.card-view-active .card-view-activity-frame {position:relative;width:100%;min-width:0;box-sizing:border-box;}
  .card.card-view-active .card-view-activity-content {width:100%;min-width:0;overflow:hidden;box-sizing:border-box;}
  .card.card-view-active .card-view-scroller {display:flex;width:100%;min-width:0;overflow-x:auto;overflow-y:hidden;scroll-snap-type:x mandatory;scroll-behavior:smooth;scrollbar-width:thin;overscroll-behavior-x:contain;touch-action:pan-x pan-y;box-sizing:border-box;}
  .card.card-view-active .card-view-scroller--recordings {gap:0;}
  .card.card-view-active .card-view-recording-slot {display:flex;flex:0 0 100%;min-width:0;padding:1px 4px 8px;box-sizing:border-box;scroll-snap-align:start;scroll-snap-stop:normal;}
  .card.card-view-active .card-view-activity-content[data-card-view-columns="2"] .card-view-recording-slot {flex-basis:50%;}
  .card.card-view-active .card-view-activity-content[data-card-view-columns="3"] .card-view-recording-slot {flex-basis:33.333333%;}
  .card.card-view-active .card-view-recording-tile {width:100%;height:100%;min-height:92px;min-width:0;margin:0;flex:1 1 auto;flex-wrap:nowrap;box-sizing:border-box;overflow:hidden;}
  .card.card-view-active .card-view-recording-tile .ric {flex:0 0 63px;}
  .card.card-view-active .card-view-recording-tile .rinf {min-width:0;overflow:hidden;}
  .card.card-view-active .card-view-recording-tile :is(.rt,.rsub) {overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
  .card.card-view-active .card-view-recording-tile .rp {flex:0 0 auto;}
  .card.card-view-active .card-view-page {display:grid;grid-template-columns:repeat(var(--card-view-columns,1),minmax(0,1fr));gap:8px;flex:0 0 100%;min-width:100%;scroll-snap-align:start;scroll-snap-stop:always;padding:1px 0 8px;box-sizing:border-box;}
  .card.card-view-active .card-view-page .list-item {height:100%;min-height:92px;margin:0;box-sizing:border-box;}
  .card.card-view-active .card-view-page .et {flex:0 0 min(42%,180px);}
  .card.card-view-active .card-view-page .rev-inf {min-width:0;}
  .card.card-view-active .card-view-scroll-control {
    position:absolute;z-index:12;top:50%;transform:translateY(-50%);width:22px;height:64%;min-height:54px;max-height:88px;
    padding:0;border:1px solid color-mix(in srgb,var(--c-border2) 58%,transparent);color:var(--c-text);
    background:color-mix(in srgb,var(--c-bg-panel) 52%,transparent);box-shadow:0 3px 12px color-mix(in srgb,var(--c-bg-deep) 28%,transparent);
    backdrop-filter:blur(8px) saturate(145%);-webkit-backdrop-filter:blur(8px) saturate(145%);cursor:pointer;
  }
  .card.card-view-active .card-view-scroll-control--left {left:1px;border-radius:7px 0 0 7px;}
  .card.card-view-active .card-view-scroll-control--right {right:1px;border-radius:0 7px 7px 0;}
  .card.card-view-active .card-view-scroll-control::before {content:"";display:block;width:10px;height:10px;border-top:2px solid currentColor;border-right:2px solid currentColor;margin:auto;}
  .card.card-view-active .card-view-scroll-control--left::before {transform:rotate(-135deg);}
  .card.card-view-active .card-view-scroll-control--right::before {transform:rotate(45deg);}
  .card.card-view-active .card-view-scroll-control[hidden] {display:none;}
  .card.card-view-active .card-view-empty {display:flex;align-items:center;justify-content:center;min-height:92px;color:var(--c-text2);}
  .card.card-view-active .card-view-ptz-panel {display:grid;grid-template-columns:minmax(48px,.7fr) minmax(76px,1fr) minmax(48px,.7fr);gap:8px;align-items:stretch;min-height:112px;padding:4px max(8px,18%);}
  .card.card-view-active .card-view-ptz-vertical {display:grid;grid-template-rows:1fr 1fr;gap:6px;}
  .card.card-view-active .card-view-ptz-button {border:1px solid var(--c-border2);border-radius:8px;background:var(--c-bg-mobile);color:var(--c-text);cursor:pointer;touch-action:none;}
  .card.card-view-active .card-view-ptz-button:hover,
  .card.card-view-active .card-view-ptz-button:active {color:var(--c-primary);background:var(--c-bg-primary);}
  .card.card-view-active .card-view-ptz-button svg {width:28px;height:28px;pointer-events:none;}
  .card.card-view-active .card-view-ptz-button--up svg {transform:rotate(180deg);}
  .card.card-view-active .card-view-footer {display:grid;grid-template-columns:auto minmax(44px,1fr) auto minmax(44px,1fr) auto;align-items:center;gap:4px;flex:0 0 var(--fvc-footer-height);height:var(--fvc-footer-height);min-height:var(--fvc-footer-height);padding:3px 8px;border-top:1px solid var(--c-border);box-sizing:border-box;container-type:inline-size;container-name:card-view-footer;}
  .card.card-view-active .card-view-footer .frigate-view {grid-column:1;display:flex;align-items:center;max-width:138px;}
  .card.card-view-active .card-view-footer .frigate-view svg {width:100%;height:auto;}
  .card.card-view-active .card-view-footer-center {display:contents;}
  .card.card-view-active .card-view-drawer-handle--left {grid-column:2;justify-self:center;}
  .card.card-view-active .card-view-footer-nav {grid-column:3;align-self:center;justify-self:center;}
  .card.card-view-active .card-view-drawer-handle--right {grid-column:4;justify-self:center;}
  .card.card-view-active .card-view-footer .page-nav {display:flex;gap:4px;}
  .card.card-view-active .card-view-footer .page-nav-btn {width:34px;height:34px;min-width:34px;min-height:34px;}
  .card.card-view-active .card-view-drawer-handle {
    width:min(100%,80px);height:36px;min-width:44px;min-height:36px;padding:7px 10px;
    color:var(--c-text3);background:transparent;touch-action:none;user-select:none;
  }
  .card.card-view-active .card-view-drawer-handle svg {
    width:20px;height:20px;transition:transform 180ms ease;
  }
  .card.card-view-active .card-view-drawer.is-open + .card-view-footer .card-view-drawer-handle svg {transform:rotate(180deg);}
  .card.card-view-active .card-view-drawer.is-closed + .card-view-footer .card-view-drawer-handle svg {transform:rotate(0deg);}
  .card.card-view-active .card-view-footer-end {grid-column:5;position:relative;display:flex;align-items:center;justify-content:flex-end;gap:5px;justify-self:end;min-width:0;}
  .card.card-view-active .card-view-linked-light .linked-light-button{width:32px;height:32px;min-width:32px;min-height:32px;}
  .card.card-view-active .card-view-footer-calendar {width:32px;height:32px;min-width:32px;min-height:32px;}
  .card.card-view-active .card-view-footer-calendar[hidden] {display:none;}
  .card.card-view-active .card-view-calendar-panel {
    position:absolute;z-index:45;top:auto;right:0;bottom:calc(100% + 7px);width:min(310px,calc(100cqw - 16px));
    max-height:min(420px,calc(100dvh - 32px));overflow:auto;display:block;
    background:var(--c-bg-panel);color:var(--c-text);border:1px solid var(--c-border2);
    border-radius:calc(var(--fvc-border-radius,0px) / 2);padding:8px;box-shadow:var(--fvc-shadow-m);
  }
  .card.card-view-active .card-view-calendar-panel[hidden] {display:none;}
  @media (prefers-reduced-motion:reduce) {
    .card.card-view-active .card-view-drawer {transition-duration:1ms;}
    .card.card-view-active .card-view-drawer.is-closed .card-view-drawer-inner {transition-delay:1ms;}
    .card.card-view-active .card-view-drawer-handle svg {transition-duration:1ms;}
  }
  @container card-view-footer (max-width:480px) {
    .card.card-view-active .card-view-footer .frigate-view {max-width:100px;}
    .card.card-view-active .card-view-footer .page-nav {gap:2px;}
    .card.card-view-active .card-view-footer .page-nav-btn {width:30px;height:30px;min-width:30px;min-height:30px;}
    .card.card-view-active .card-view-drawer-handle {width:min(100%,64px);height:34px;min-width:40px;min-height:34px;padding:7px 8px;}
    .card.card-view-active .card-view-footer-calendar {width:30px;height:30px;min-width:30px;min-height:30px;}
    .card.card-view-active .card-view-footer .footer-version {font-size:.58rem;}
  }
  @media (max-width:680px) {
    .card.card-view-active .card-view-page .list-item {min-height:84px;}
    .card.card-view-active .card-view-recording-tile {min-height:84px;}
    .card.card-view-active .card-view-activity-toolbar {gap:6px;}
    .card.card-view-active .card-view-toolbar-start {gap:8px;}
    .card.card-view-active .card-view-activity-heading {font-size:.9rem;}
    .card.card-view-active :is(.card-view-mode-switch,.card-view-alert-scope-switch) {padding-inline:6px;}
    .card.card-view-active .card-view-mode-switch-label {font-size:.62rem;}
  }
  @container card-view-activity (max-width:560px) {
    .card.card-view-active :is(.card-view-mode-switch,.card-view-alert-scope-switch) {
      flex-direction:column;gap:1px;height:46px;min-height:46px;padding:3px 7px;
    }
    .card.card-view-active .card-view-mode-switch-label {line-height:1.05;white-space:nowrap;}
  }
  @container card-view-activity (max-width:440px) {
    .card.card-view-active .card-view-activity-toolbar {
      grid-template-columns:minmax(0,1fr) auto minmax(0,1fr);
      grid-template-areas:"start start start" ". center actions";
      row-gap:3px;
    }
    .card.card-view-active .card-view-toolbar-start {grid-area:start;width:100%;}
    .card.card-view-active .card-view-toolbar-center {grid-area:center;justify-self:center;}
    .card.card-view-active .card-view-activity-actions {grid-area:actions;justify-self:end;justify-content:flex-end;}
  }
  @container card-view-activity (max-width:400px) {
    .card.card-view-active .card-view-activity-toolbar {
      grid-template-areas:"start start start" ". center ." "actions actions actions";
    }
    .card.card-view-active :is(.card-view-mode-switch,.card-view-alert-scope-switch) {
      width:34px;min-width:34px;height:34px;min-height:34px;padding:4px;
    }
    .card.card-view-active .card-view-mode-switch-label {display:none;}
    .card.card-view-active .card-view-activity-actions {justify-self:center;justify-content:center;}
  }
`;
