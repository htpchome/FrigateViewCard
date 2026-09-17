import { CARD_VIEW_OVERLAY_TIMING } from "../../constants.js";

const CARD_VIEW_TOUCH_MODE_FADE_MS =
  CARD_VIEW_OVERLAY_TIMING.touch.activeSlideshowAndTakeoverHideMs -
  CARD_VIEW_OVERLAY_TIMING.touch.activeSlideshowAndTakeoverFadeStartMs;
const CARD_VIEW_TOUCH_MODE_FADE_START_PERCENT =
  (CARD_VIEW_OVERLAY_TIMING.touch.activeSlideshowAndTakeoverFadeStartMs /
    CARD_VIEW_OVERLAY_TIMING.touch.activeSlideshowAndTakeoverHideMs) *
  100;

export const CARD_VIEW_PAGE_STYLES = `
  :host(.card-view-natural-height) {
    height:auto !important;
    max-height:none !important;
    overflow:visible;
    isolation:isolate;
  }
  :host(.card-view-natural-height) ha-card,
  :host(.card-view-natural-height) .card.card-view-active {
    height:auto !important;
    max-height:none !important;
    overflow:hidden !important;
  }
  :host(.card-view-natural-height.mobile-view-rotate-cover),
  :host(.card-view-natural-height.mobile-view-rotate-cover) ha-card,
  :host(.card-view-natural-height.mobile-view-rotate-cover) .card.card-view-active:is(
    .mobile-rotate-live,
    .mobile-rotate-live-exit,
    .mobile-rotate-popup,
    .mobile-rotate-popup-exit
  ) {
    height:var(--rotate-vh,100dvh) !important;
    min-height:var(--rotate-vh,100dvh) !important;
    max-height:var(--rotate-vh,100dvh) !important;
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
  .card.card-view-active :is(.card-view-video-only-back,.card-view-native-fullscreen-exit) {display:none;}
  .card.card-view-active.card-view-video-panel-only:not(.card-view-standalone) .card-view-video-only-back {
    position:absolute;z-index:25;top:8px;left:8px;display:inline-flex;align-items:center;justify-content:center;
    width:32px;height:32px;min-width:32px;min-height:32px;margin:0;padding:4px;border:1px solid var(--fvc-media-overlay-border);border-radius:50%;
    color:var(--fvc-media-overlay-text);background:var(--fvc-media-overlay-bg);background-image:none;box-shadow:var(--fvc-media-overlay-shadow);
    opacity:0;visibility:hidden;pointer-events:none;appearance:none;-webkit-appearance:none;
    backdrop-filter:blur(5px);-webkit-backdrop-filter:blur(5px);
    transition:opacity .16s ease,visibility 0s linear .16s;
  }
  .card.card-view-active.card-view-video-panel-only:not(.card-view-standalone).card-view-overlays-visible .card-view-video-only-back {
    opacity:1;visibility:visible;pointer-events:auto;transition-delay:0s;
  }
  .card.card-view-active.card-view-video-panel-only:not(.card-view-standalone) .card-view-video-only-back svg {width:20px;height:20px;color:currentColor;fill:currentColor;opacity:1;pointer-events:none;}
  .card.card-view-active.card-view-video-panel-only:not(.card-view-standalone) .card-view-back-slot {display:none;}
  .card.card-view-active.card-view-standalone:not(.card-view-overlay-presentation) .card-view-camera-row {grid-template-columns:minmax(0,1fr) minmax(162px,2.4fr) minmax(0,1fr);}
  .card.card-view-active.card-view-standalone:not(.card-view-overlay-presentation) .card-view-back-slot {visibility:hidden;pointer-events:none;}
  .card.card-view-active.card-view-video-panel-only:not(.card-view-standalone) #eng-wrap.camera-group-mobile-member .camera-group-live-pane--primary .camera-group-pane-controls {left:47px;top:8px;}
  .card.card-view-active.card-view-video-panel-only:not(.card-view-standalone) #eng-wrap.camera-group-mobile-member .camera-group-live-pane--primary .camera-group-mobile-toggle {
    box-sizing:border-box;width:32px;height:32px;min-width:32px;min-height:32px;max-width:32px;max-height:32px;padding:4px;gap:0;
  }
  .card.card-view-active.card-view-video-panel-only:not(.card-view-standalone) #eng-wrap.camera-group-mobile-member .camera-group-live-pane--primary .camera-group-mobile-toggle svg {width:20px;height:20px;}
  .card.card-view-active.card-view-video-panel-only:not(.card-view-standalone) #eng-wrap.camera-group-mobile-member .camera-group-live-pane--primary .camera-group-mobile-toggle span {
    position:absolute;right:1px;bottom:1px;display:grid;place-items:center;min-width:10px;height:10px;padding:0 1px;border-radius:999px;
    color:var(--fvc-media-overlay-text);background:var(--fvc-media-overlay-bg-strong);font-size:.5rem;font-weight:800;line-height:1;
  }
  .card.card-view-active.card-view-video-panel-only #eng-wrap.camera-group-live.camera-group-live--side-by-side .camera-group-pane-controls {
    top:auto;bottom:48px;transform:none;
  }
  @media (hover:hover) and (pointer:fine) {
    .card.card-view-active.card-view-video-panel-only:not(.card-view-standalone) .card-view-video-only-back:hover {
      background:var(--fvc-media-overlay-bg-hover);border-color:var(--fvc-media-overlay-border-hover);
    }
    .card.card-view-active.card-view-video-panel-only:is(:fullscreen,:-webkit-full-screen) .card-view-native-fullscreen-exit:hover {
      background:var(--fvc-media-overlay-bg-hover);border-color:var(--fvc-media-overlay-border-hover);
    }
  }
  .card.card-view-active .card-view-live-panel {position:relative;display:flex;flex:0 0 auto;flex-direction:column;width:100%;min-width:0;container-type:inline-size;container-name:card-view-live;}
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
  .card.card-view-active .card-view-toolbar-center {display:grid;grid-template-columns:minmax(36px,1fr) auto minmax(36px,1fr);align-items:center;justify-items:center;gap:12px;width:132px;min-width:132px;}
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
  .card.card-view-active .card-view-toolbar-center > .card-view-microphone-slot {grid-column:2;grid-row:1;}
  .card.card-view-active .card-view-toolbar-center > .card-view-linked-light {display:contents;}
  .card.card-view-active .card-view-linked-light-position[data-linked-light-position-slot="left"] {grid-column:1;grid-row:1;}
  .card.card-view-active .card-view-linked-light-position[data-linked-light-position-slot="right"] {grid-column:3;grid-row:1;}
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
  .card.card-view-active .card-view-footer .fvc-brand-logo {grid-column:1;display:flex;align-items:center;max-width:138px;}
  .card.card-view-active .card-view-footer .fvc-brand-logo svg {width:100%;height:auto;}
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
  .card.card-view-active .card-view-standalone-mode-controls,
  .card.card-view-active .card-view-live-status-overlay,
  .card.card-view-active .card-view-live-badge,
  .card.card-view-active .card-view-standalone-linked-overlay,
  .card.card-view-active .card-view-media-drawer {display:none;}
  .card.card-view-active.card-view-overlay-presentation .card-view-live-panel {
    min-height:var(--popup-card-view-media-height,0px);padding:0;box-sizing:border-box;
  }
  .card.card-view-active.card-view-overlay-presentation .card-view-live-stage,
  .card.card-view-active.card-view-overlay-presentation .card-view-live-stage #eng-wrap {border-radius:var(--fvc-border-radius,0px);}
  .card.card-view-active.card-view-overlay-presentation .card-view-live-stage {position:relative;overflow:hidden;background:var(--c-bg-deep);}
  .card.card-view-active.card-view-overlay-presentation.card-view-media-drawer-enabled .card-view-media-drawer:not([hidden]) {
    position:absolute;z-index:40;inset:0 auto 0 0;display:block;width:clamp(118px,30%,156px);max-width:calc(100% - 30px);
    pointer-events:none;
  }
  .card.card-view-active.card-view-overlay-presentation .card-view-media-drawer-panel {
    position:absolute;inset:0;display:grid;grid-template-rows:minmax(0,1fr);min-height:0;
    box-sizing:border-box;padding:7px 6px 6px;overflow:visible;transform:translateX(calc(-100% - 2px));
    color:var(--fvc-media-overlay-text);background:var(--fvc-media-overlay-bg-strong);
    border-right:1px solid var(--fvc-media-overlay-border-strong);box-shadow:var(--fvc-media-overlay-shadow-strong);
    backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);
    transition:transform 180ms cubic-bezier(.22,.61,.36,1);pointer-events:none;
  }
  .card.card-view-active.card-view-overlay-presentation .card-view-media-drawer.is-open .card-view-media-drawer-panel {transform:translateX(0);pointer-events:auto;}
  .card.card-view-active.card-view-overlay-presentation .card-view-media-drawer-tabs {
    position:absolute;z-index:3;top:6px;left:calc(100% - 1px);display:grid;grid-template-rows:repeat(var(--card-view-media-drawer-tab-count,4),minmax(0,24px));align-items:stretch;
    gap:2px;width:70px;height:min(102px,max(48px,calc(50% - 39px)));min-width:0;visibility:hidden;pointer-events:none;transition:visibility 0s linear 180ms;
  }
  .card.card-view-active.card-view-overlay-presentation .card-view-media-drawer[data-card-view-media-tab-count="5"] .card-view-media-drawer-tabs {
    gap:1px;height:min(124px,max(54px,calc(50% - 34px)));
  }
  .card.card-view-active.card-view-overlay-presentation .card-view-media-drawer-tabs[hidden] {display:none;}
  .card.card-view-active.card-view-overlay-presentation .card-view-media-drawer.is-open .card-view-media-drawer-tabs {
    visibility:visible;pointer-events:auto;transition-delay:0s;
  }
  .card.card-view-active.card-view-overlay-presentation :is(.card-view-media-drawer-tabs,.card-view-media-drawer-actions)::before {
    content:"";position:absolute;inset:-8px;pointer-events:auto;
  }
  .card.card-view-active.card-view-overlay-presentation .card-view-media-drawer-tab {
    position:relative;z-index:1;appearance:none;-webkit-appearance:none;width:100%;min-width:0;min-height:0;height:auto;margin:0;padding:2px 4px;overflow:hidden;
    border:1px solid var(--fvc-media-overlay-border);border-left:0;border-radius:0 7px 7px 0;color:var(--fvc-media-overlay-text-muted);
    background:var(--fvc-media-overlay-bg);box-shadow:var(--fvc-media-overlay-shadow);font:inherit;font-size:.52rem;font-weight:700;line-height:1;
    text-overflow:ellipsis;white-space:nowrap;cursor:pointer;touch-action:manipulation;
  }
  .card.card-view-active.card-view-overlay-presentation .card-view-media-drawer-tab.active {
    color:var(--fvc-media-overlay-text);border-color:var(--fvc-media-overlay-active-border);background:var(--fvc-media-overlay-active-bg);
  }
  .card.card-view-active.card-view-overlay-presentation .card-view-media-drawer-scroller {
    display:flex;flex-direction:column;gap:6px;min-height:0;padding:1px;overflow-x:hidden;overflow-y:auto;
    scroll-snap-type:y proximity;scroll-behavior:smooth;scrollbar-width:thin;scrollbar-color:var(--fvc-media-overlay-border-hover) transparent;
    overscroll-behavior:contain;touch-action:pan-y;-webkit-overflow-scrolling:touch;
  }
  .card.card-view-active.card-view-overlay-presentation .card-view-media-drawer-scroller::-webkit-scrollbar {width:5px;}
  .card.card-view-active.card-view-overlay-presentation .card-view-media-drawer-scroller::-webkit-scrollbar-track {background:transparent;}
  .card.card-view-active.card-view-overlay-presentation .card-view-media-drawer-scroller::-webkit-scrollbar-thumb {background:var(--fvc-media-overlay-border-hover);border-radius:999px;}
  .card.card-view-active.card-view-overlay-presentation .card-view-media-drawer-item {
    appearance:none;-webkit-appearance:none;display:flex;flex:0 0 auto;flex-direction:column;gap:4px;width:100%;min-width:0;
    box-sizing:border-box;margin:0;padding:4px;border:1px solid var(--fvc-media-overlay-border);border-radius:7px;
    color:var(--fvc-media-overlay-text);background:var(--fvc-media-overlay-option-bg);box-shadow:none;
    font:inherit;text-align:left;cursor:pointer;scroll-snap-align:start;touch-action:manipulation;
  }
  .card.card-view-active.card-view-overlay-presentation .card-view-media-drawer-thumbnail {
    position:relative;display:block;width:100%;aspect-ratio:16/9;overflow:hidden;border-radius:5px;background:var(--fvc-media-overlay-bg-soft);
  }
  .card.card-view-active.card-view-overlay-presentation .card-view-media-drawer-thumbnail img {
    position:absolute;z-index:1;inset:0;width:100%;height:100%;object-fit:cover;
  }
  .card.card-view-active.card-view-overlay-presentation .card-view-media-drawer-thumbnail--recording .card-view-media-drawer-placeholder {opacity:.9;}
  .card.card-view-active.card-view-overlay-presentation .card-view-media-drawer-thumbnail--recording .card-view-media-drawer-placeholder svg {width:34px;height:34px;}
  .card.card-view-active.card-view-overlay-presentation .card-view-media-drawer-placeholder {
    position:absolute;inset:0;display:grid;place-items:center;color:var(--fvc-media-overlay-text-muted);opacity:.72;
  }
  .card.card-view-active.card-view-overlay-presentation .card-view-media-drawer-placeholder svg {width:25px;height:25px;}
  .card.card-view-active.card-view-overlay-presentation .card-view-media-drawer-meta {
    display:flex;align-items:center;justify-content:space-between;gap:4px;min-width:0;color:var(--fvc-media-overlay-text-muted);
    font-size:.61rem;font-weight:650;line-height:1.2;
  }
  .card.card-view-active.card-view-overlay-presentation .card-view-media-drawer-meta > span {min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
  .card.card-view-active.card-view-overlay-presentation .card-view-media-drawer-meta > span:last-child {flex:0 0 auto;font-variant-numeric:tabular-nums;}
  .card.card-view-active.card-view-overlay-presentation .card-view-media-drawer-empty {
    display:flex;align-items:center;justify-content:center;min-height:72px;padding:8px;color:var(--fvc-media-overlay-text-muted);
    font-size:.68rem;line-height:1.3;text-align:center;
  }
  .card.card-view-active.card-view-overlay-presentation .card-view-media-drawer-handle,
  .card.card-view-active.card-view-overlay-presentation .card-view-media-drawer-nav,
  .card.card-view-active.card-view-overlay-presentation .card-view-media-drawer-action {
    appearance:none;-webkit-appearance:none;display:grid;place-items:center;box-sizing:border-box;margin:0;padding:3px;
    border:1px solid var(--fvc-media-overlay-border);color:var(--fvc-media-overlay-text);background:var(--fvc-media-overlay-bg);
    box-shadow:var(--fvc-media-overlay-shadow);cursor:pointer;touch-action:manipulation;
  }
  .card.card-view-active.card-view-overlay-presentation .card-view-media-drawer-handle {
    position:absolute;top:50%;left:0;width:28px;height:56px;border-left:0;border-radius:0 8px 8px 0;
    transform:translateY(-50%);opacity:0;visibility:hidden;pointer-events:none;
    transition:left 180ms cubic-bezier(.22,.61,.36,1),opacity .16s ease,visibility 0s linear .16s;
  }
  .card.card-view-active.card-view-overlay-presentation.card-view-overlays-visible .card-view-media-drawer:not(.is-open) .card-view-media-drawer-handle,
  .card.card-view-active.card-view-overlay-presentation .card-view-media-drawer.is-open .card-view-media-drawer-handle {
    opacity:1;visibility:visible;pointer-events:auto;transition-delay:0s;
  }
  .card.card-view-active.card-view-overlay-presentation .card-view-media-drawer.is-open .card-view-media-drawer-handle {left:calc(100% - 1px);}
  .card.card-view-active.card-view-overlay-presentation .card-view-media-drawer-handle svg {width:19px;height:19px;transform:rotate(-90deg);transition:transform 180ms ease;pointer-events:none;}
  .card.card-view-active.card-view-overlay-presentation .card-view-media-drawer.is-open .card-view-media-drawer-handle svg {transform:rotate(90deg);}
  .card.card-view-active.card-view-overlay-presentation .card-view-media-drawer-actions {
    position:absolute;z-index:3;top:calc(50% + 31px);left:calc(100% - 1px);display:flex;flex-direction:column;gap:2px;
    width:28px;visibility:hidden;pointer-events:none;transition:visibility 0s linear 180ms;
  }
  .card.card-view-active.card-view-overlay-presentation .card-view-media-drawer-actions[hidden] {display:none;}
  .card.card-view-active.card-view-overlay-presentation .card-view-media-drawer.is-open .card-view-media-drawer-actions {
    visibility:visible;pointer-events:auto;transition-delay:0s;
  }
  .card.card-view-active.card-view-overlay-presentation .card-view-media-drawer-action {
    position:relative;z-index:1;width:28px;height:28px;border-left:0;border-radius:0 7px 7px 0;
  }
  .card.card-view-active.card-view-overlay-presentation .card-view-media-drawer-action svg {width:17px;height:17px;pointer-events:none;}
  .card.card-view-active.card-view-overlay-presentation .card-view-media-drawer-action.active {
    color:var(--fvc-media-overlay-text);border-color:var(--fvc-media-overlay-active-border);background:var(--fvc-media-overlay-active-bg);
  }
  .card.card-view-active.card-view-overlay-presentation .card-view-media-drawer-action:disabled {opacity:.38;cursor:default;}
  .card.card-view-active.card-view-overlay-presentation .card-view-media-drawer-popover {
    position:absolute;z-index:4;top:6px;left:calc(100% + 32px);width:min(284px,calc(100cqw - 100% - 40px));min-width:0;
    max-height:calc(100% - 12px);box-sizing:border-box;margin:0;padding:10px;overflow:auto;border:1px solid var(--fvc-media-overlay-border-strong);
    border-radius:8px;color:var(--fvc-media-overlay-text);background:var(--fvc-media-overlay-bg-strong);box-shadow:var(--fvc-media-overlay-shadow-strong);
    backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);pointer-events:auto;
  }
  .card.card-view-active.card-view-overlay-presentation .card-view-media-drawer-popover:not([hidden]) {display:block;}
  .card.card-view-active.card-view-overlay-presentation .card-view-media-drawer-popover[hidden] {display:none;}
  .card.card-view-active.card-view-overlay-presentation .card-view-media-drawer-filter-panel .frow {grid-template-columns:34px minmax(0,1fr);}
  .card.card-view-active.card-view-overlay-presentation .card-view-media-drawer-popover .frow-l,
  .card.card-view-active.card-view-overlay-presentation .card-view-media-drawer-popover .cal-dow span {color:var(--fvc-media-overlay-text-muted);}
  .card.card-view-active.card-view-overlay-presentation .card-view-media-drawer-popover .chip,
  .card.card-view-active.card-view-overlay-presentation .card-view-media-drawer-popover .cal-today-btn {
    color:var(--fvc-media-overlay-text-muted);border-color:var(--fvc-media-overlay-border);background:var(--fvc-media-overlay-option-bg);
  }
  .card.card-view-active.card-view-overlay-presentation .card-view-media-drawer-popover .chip.on,
  .card.card-view-active.card-view-overlay-presentation .card-view-media-drawer-popover .cday.active {
    color:var(--fvc-media-overlay-text);border-color:var(--fvc-media-overlay-active-border);background:var(--fvc-media-overlay-active-bg);
  }
  .card.card-view-active.card-view-overlay-presentation .card-view-media-drawer-popover .cal-head button {color:var(--fvc-media-overlay-text);}
  .card.card-view-active.card-view-overlay-presentation .card-view-media-drawer-popover .cday {color:var(--fvc-media-overlay-text);}
  .card.card-view-active.card-view-overlay-presentation .card-view-media-drawer-popover .cday.today:not(.active) {
    color:var(--fvc-media-overlay-text);background:var(--fvc-media-overlay-bg-hover);box-shadow:inset 0 0 0 1px var(--fvc-media-overlay-border-hover);font-weight:700;
  }
  .card.card-view-active.card-view-overlay-presentation .card-view-media-drawer-nav {
    position:absolute;z-index:2;right:auto;left:50%;width:min(72px,58%);height:22px;border-radius:6px;transform:translateX(-50%);pointer-events:auto;
  }
  .card.card-view-active.card-view-overlay-presentation .card-view-media-drawer-nav[hidden] {display:none;}
  .card.card-view-active.card-view-overlay-presentation .card-view-media-drawer-nav--up {top:5px;}
  .card.card-view-active.card-view-overlay-presentation .card-view-media-drawer-nav--down {bottom:5px;}
  .card.card-view-active.card-view-overlay-presentation .card-view-media-drawer-nav svg {width:16px;height:16px;pointer-events:none;}
  .card.card-view-active.card-view-overlay-presentation .card-view-media-drawer-nav--up svg {transform:rotate(180deg);}
  @media (hover:hover) and (pointer:fine) {
    .card.card-view-active.card-view-overlay-presentation .card-view-media-drawer-item:hover,
    .card.card-view-active.card-view-overlay-presentation :is(.card-view-media-drawer-handle,.card-view-media-drawer-nav,.card-view-media-drawer-tab:not(.active),.card-view-media-drawer-action:not(.active)):hover:not(:disabled) {
      background:var(--fvc-media-overlay-bg-hover);border-color:var(--fvc-media-overlay-border-hover);
    }
  }
  .card.card-view-active.card-view-overlay-presentation .card-view-camera-row {
    position:absolute;z-index:24;top:8px;left:8px;right:8px;width:auto;min-width:0;padding:0;
    grid-template-columns:minmax(0,1fr) clamp(104px,34%,180px) minmax(0,1fr);align-items:start;gap:4px;
    background:transparent;pointer-events:none;
  }
  .card.card-view-active.card-view-overlay-presentation .card-view-back-slot {display:none;}
  .card.card-view-active.card-view-overlay-presentation .card-view-camera-picker {display:contents;}
  .card.card-view-active.card-view-overlay-presentation .mobile-cam-picker {
    position:relative;z-index:2;isolation:isolate;grid-column:2;grid-row:1;justify-self:stretch;width:100%;min-width:0;opacity:1;pointer-events:auto;touch-action:manipulation;
    transition:opacity .16s ease;
  }
  .card.card-view-active.card-view-overlay-presentation .mobile-cam-picker__trigger {
    min-height:32px;padding:5px 29px 5px 9px;border:1px solid var(--fvc-media-overlay-border);border-radius:7px;
    color:var(--fvc-media-overlay-text);background:var(--fvc-media-overlay-bg);box-shadow:var(--fvc-media-overlay-shadow);
    font-size:.78rem;pointer-events:auto;backdrop-filter:blur(5px);-webkit-backdrop-filter:blur(5px);
  }
  .card.card-view-active.card-view-overlay-presentation .mobile-cam-picker__trigger-content {gap:5px;}
  .card.card-view-active.card-view-overlay-presentation .mobile-cam-picker__chev {right:6px;width:18px;height:26px;}
  .card.card-view-active.card-view-overlay-presentation .mobile-cam-picker__chev svg {width:17px;height:17px;}
  .card.card-view-active.card-view-overlay-presentation .mobile-cam-picker__panel {
    top:calc(100% + 4px);gap:3px;padding:4px;overflow-x:hidden;overflow-y:auto;overscroll-behavior:contain;
    border:1px solid var(--fvc-media-overlay-border-strong);border-radius:7px;background:var(--fvc-media-overlay-bg-strong);
    box-shadow:var(--fvc-media-overlay-shadow-strong);backdrop-filter:blur(7px);-webkit-backdrop-filter:blur(7px);
    scrollbar-width:thin;touch-action:pan-y;
  }
  .card.card-view-active.card-view-overlay-presentation .mobile-cam-picker__option {
    min-height:32px;padding:5px 7px;border:1px solid var(--fvc-media-overlay-border);border-radius:5px;
    color:var(--fvc-media-overlay-text-muted);background:var(--fvc-media-overlay-option-bg);box-shadow:none;font-size:.76rem;backdrop-filter:none;
  }
  .card.card-view-active.card-view-overlay-presentation .mobile-cam-picker__option.is-active {
    border-color:var(--fvc-media-overlay-active-border);background:var(--fvc-media-overlay-active-bg);
    box-shadow:none;color:var(--fvc-media-overlay-text);
  }
  .card.card-view-active.card-view-overlay-presentation .card-view-standalone-mode-controls {
    position:relative;z-index:1;grid-column:1 / -1;grid-row:1;display:grid;width:100%;min-width:0;
    grid-template-columns:minmax(0,1fr) clamp(104px,34%,180px) minmax(0,1fr);align-items:start;gap:4px;pointer-events:none;
  }
  .card.card-view-active.card-view-overlay-presentation .card-view-standalone-mode-button {
    position:relative;grid-row:1;display:grid;place-items:center;min-width:32px;width:32px;height:32px;padding:4px;border:1px solid var(--fvc-media-overlay-border);
    border-radius:7px;color:var(--fvc-media-overlay-text);background:var(--fvc-media-overlay-bg);box-shadow:var(--fvc-media-overlay-shadow);
    opacity:0;pointer-events:none;cursor:pointer;appearance:none;
    transition:opacity .16s ease,background-color .15s ease,border-color .15s ease;
  }
  .card.card-view-active.card-view-overlay-presentation .card-view-standalone-slideshow-button {grid-column:1;justify-self:end;}
  .card.card-view-active.card-view-overlay-presentation .card-view-standalone-mode-end {
    grid-column:3;grid-row:1;display:flex;align-items:flex-start;justify-self:start;gap:4px;min-width:0;pointer-events:none;
  }
  .card.card-view-active.card-view-overlay-presentation .card-view-standalone-mode-button svg {width:21px;height:21px;pointer-events:none;}
  .card.card-view-active.card-view-overlay-presentation .card-view-standalone-mode-button.active {
    width:auto;min-width:32px;grid-auto-flow:column;gap:3px;padding-inline:5px;
    border-color:var(--fvc-media-overlay-active-border);background:var(--fvc-media-overlay-active-bg);
  }
  .card.card-view-active.card-view-overlay-presentation .card-view-standalone-takeover-button,
  .card.card-view-active.card-view-overlay-presentation .card-view-standalone-takeover-button.active {
    width:32px;min-width:32px;max-width:32px;padding:4px;
  }
  @keyframes card-view-active-mode-button-hide {
    from {opacity:.68;visibility:visible;pointer-events:auto;}
    to {opacity:0;visibility:hidden;pointer-events:none;}
  }
  .card.card-view-active.card-view-overlay-presentation :is(
    .card-view-standalone-slideshow-button.active,
    [data-card-view-standalone-grid].active,
    .card-view-standalone-takeover-button.active
  ) {
    opacity:.68;visibility:visible;pointer-events:auto;
    animation:card-view-active-mode-button-hide ${CARD_VIEW_OVERLAY_TIMING.mouse.controlsHideMs}ms step-end forwards;
  }
  .card.card-view-active.card-view-overlay-presentation .card-view-standalone-countdown {min-width:18px;font-size:.62rem;font-weight:750;line-height:1;font-variant-numeric:tabular-nums;}
  .card.card-view-active.card-view-overlay-presentation.card-view-hide-camera-name .mobile-cam-picker {opacity:0;pointer-events:none;}
  .card.card-view-active.card-view-overlay-presentation.card-view-hide-camera-name .mobile-cam-picker.is-open,
  .card.card-view-active.card-view-overlay-presentation.card-view-hide-camera-name.card-view-overlays-visible .mobile-cam-picker,
  .card.card-view-active.card-view-overlay-presentation .card-view-standalone-mode-controls.card-view-grid-indicator-visible [data-card-view-standalone-grid].active,
  .card.card-view-active.card-view-overlay-presentation.card-view-overlays-visible .card-view-standalone-mode-button {
    opacity:1;visibility:visible;pointer-events:auto;
  }
  .card.card-view-active.card-view-overlay-presentation.card-view-overlays-visible :is(
    .card-view-standalone-slideshow-button.active,
    [data-card-view-standalone-grid].active,
    .card-view-standalone-takeover-button.active
  ) {opacity:1;visibility:visible;pointer-events:auto;animation:none;}
  @keyframes card-view-touch-mode-button-lifecycle {
    0%,${CARD_VIEW_TOUCH_MODE_FADE_START_PERCENT}% {opacity:.68;visibility:visible;pointer-events:auto;}
    100% {opacity:0;visibility:hidden;pointer-events:none;}
  }
  @media (hover:none), (pointer:coarse) {
    .card.card-view-active.card-view-overlay-presentation [data-card-view-standalone-grid].active {
      animation:card-view-active-mode-button-hide ${CARD_VIEW_OVERLAY_TIMING.touch.controlsHideMs}ms step-end forwards;
    }
    .card.card-view-active.card-view-overlay-presentation :is(
      .card-view-standalone-slideshow-button.active,
      .card-view-standalone-takeover-button.active
    ) {
      animation:card-view-touch-mode-button-lifecycle ${CARD_VIEW_OVERLAY_TIMING.touch.activeSlideshowAndTakeoverHideMs}ms linear forwards;
    }
    .card.card-view-active.card-view-overlay-presentation.card-view-overlays-visible :is(
      .card-view-standalone-slideshow-button.active,
      [data-card-view-standalone-grid].active,
      .card-view-standalone-takeover-button.active
    ) {animation:none;}
  }
  @media (hover:hover) and (pointer:fine) {
    .card.card-view-active.card-view-overlay-presentation .card-view-standalone-mode-button:hover {background:var(--fvc-media-overlay-bg-hover);border-color:var(--fvc-media-overlay-border-hover);}
    .card.card-view-active.card-view-overlay-presentation .card-view-standalone-mode-button.active:hover {
      color:var(--fvc-media-overlay-text);background:var(--fvc-media-overlay-active-bg);border-color:var(--fvc-media-overlay-active-border);
    }
  }
  .card.card-view-active.card-view-overlay-presentation .card-view-live-status-overlay {
    position:absolute;z-index:22;top:9px;right:9px;display:flex;align-items:center;gap:4px;pointer-events:none;
  }
  .card.card-view-active.card-view-overlay-presentation .card-view-live-badge,
  .card.card-view-active.card-view-overlay-presentation .card-view-source-indicator {
    display:inline-flex;align-items:center;justify-content:center;gap:5px;min-height:24px;
    box-sizing:border-box;padding:3px 7px;border:1px solid var(--fvc-media-overlay-border);border-radius:999px;
    color:var(--fvc-media-overlay-text);background:var(--fvc-media-overlay-bg-soft);box-shadow:var(--fvc-media-overlay-shadow);
    font-size:.64rem;font-weight:750;line-height:1;text-transform:uppercase;pointer-events:none;
    backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px);
  }
  .card.card-view-active.card-view-overlay-presentation .card-view-source-indicator {
    min-width:24px;padding-inline:6px;opacity:0;visibility:hidden;
    transition:opacity .16s ease,visibility 0s linear .16s;
  }
  .card.card-view-active.card-view-overlay-presentation .card-view-source-indicator[hidden] {display:none !important;}
  .card.card-view-active.card-view-overlay-presentation .card-view-source-indicator-icon {display:inline-grid;place-items:center;width:14px;height:14px;}
  .card.card-view-active.card-view-overlay-presentation .card-view-source-indicator-icon[hidden],
  .card.card-view-active.card-view-overlay-presentation .card-view-source-indicator-text[hidden] {display:none !important;}
  .card.card-view-active.card-view-overlay-presentation .card-view-source-indicator-icon svg {width:14px;height:14px;color:currentColor;}
  .card.card-view-active.card-view-overlay-presentation.card-view-overlays-visible .card-view-source-indicator {
    opacity:1;visibility:visible;transition-delay:0s;
  }
  .card.card-view-active.card-view-overlay-presentation .card-view-live-badge-dot {width:7px;height:7px;border-radius:50%;background:var(--c-on);box-shadow:0 0 0 2px var(--fvc-media-overlay-live-halo);}
  .card.card-view-active.card-view-overlay-presentation .card-view-live-badge.is-offline .card-view-live-badge-dot {background:var(--c-off);box-shadow:0 0 0 2px var(--fvc-media-overlay-offline-halo);}
  .card.card-view-active.card-view-overlay-presentation .stream-loading {top:39px;right:9px;}
  .card.card-view-active.card-view-overlay-presentation .card-view-live-stage:has(#stream-loading:not([hidden])) .card-view-source-indicator {display:none;}
  .card.card-view-active.card-view-overlay-presentation.card-view-grid-mode .card-view-live-badge {display:none;}
  .card.card-view-active.card-view-overlay-presentation .card-view-standalone-linked-overlay {
    position:absolute;z-index:23;left:50%;bottom:27px;display:grid;
    grid-template-columns:minmax(36px,1fr) auto minmax(36px,1fr);align-items:center;gap:6px;
    width:min(240px,calc(100% - 24px));transform:translateX(-50%);opacity:0;pointer-events:none;
    transition:opacity .15s ease;
  }
  .card.card-view-active.card-view-overlay-presentation .card-view-standalone-light-controls {display:contents;}
  .card.card-view-active.card-view-overlay-presentation .card-view-standalone-light-controls .linked-light-position-slot {grid-row:1;pointer-events:none;}
  .card.card-view-active.card-view-overlay-presentation .card-view-standalone-light-controls [data-linked-light-position-slot="left"] {grid-column:1;justify-self:end;}
  .card.card-view-active.card-view-overlay-presentation .card-view-standalone-light-controls [data-linked-light-position-slot="right"] {grid-column:3;justify-self:start;}
  .card.card-view-active.card-view-overlay-presentation .card-view-standalone-light-controls .linked-light-button {width:30px;height:30px;min-width:30px;min-height:30px;}
  .card.card-view-active.card-view-overlay-presentation .linked-light-dimmer {width:80px;bottom:calc(100% + 6px);}
  .card.card-view-active.card-view-overlay-presentation .linked-light-dimmer-panel {width:80px;gap:4px;padding:6px 5px;}
  .card.card-view-active.card-view-overlay-presentation .linked-light-dimmer-title {font-size:.68rem;}
  .card.card-view-active.card-view-overlay-presentation .linked-light-dimmer output {font-size:1.12rem;}
  .card.card-view-active.card-view-overlay-presentation .linked-light-brightness-track {width:44px;height:92px;}
  .card.card-view-active.card-view-overlay-presentation .linked-light-brightness-track input[type="range"] {width:82px;height:38px;}
  .card.card-view-active.card-view-overlay-presentation .linked-light-brightness-track input[type="range"]::-webkit-slider-runnable-track {height:38px;}
  .card.card-view-active.card-view-overlay-presentation .linked-light-brightness-track input[type="range"]::-webkit-slider-thumb {height:26px;margin-top:6px;}
  .card.card-view-active.card-view-overlay-presentation .linked-light-brightness-track input[type="range"]::-moz-range-track {height:38px;}
  .card.card-view-active.card-view-overlay-presentation .linked-light-brightness-track input[type="range"]::-moz-range-thumb {height:26px;}
  .card.card-view-active.card-view-overlay-presentation .linked-light-dimmer-power {width:30px;height:30px;min-width:30px;min-height:30px;}
  .card.card-view-active.card-view-overlay-presentation .card-view-standalone-talk-overlay {
    grid-column:2;grid-row:1;display:flex;align-items:center;justify-content:center;min-width:0;
  }
  .card.card-view-active.card-view-overlay-presentation .card-view-standalone-talk-overlay:empty {display:none;}
  .card.card-view-active.card-view-overlay-presentation.card-view-overlays-visible .card-view-standalone-linked-overlay,
  .card.card-view-active.card-view-overlay-presentation.two-way-talk-active .card-view-standalone-linked-overlay,
  .card.card-view-active.card-view-overlay-presentation .card-view-standalone-linked-overlay:has(#two-way-talk-btn:is(.active,.connecting)),
  .card.card-view-active.card-view-overlay-presentation .card-view-standalone-linked-overlay:has([data-linked-light-dimmer]:not([hidden])) {opacity:1;pointer-events:auto;}
  .card.card-view-active.card-view-overlay-presentation.two-way-talk-active .card-view-standalone-light-controls,
  .card.card-view-active.card-view-overlay-presentation .card-view-standalone-linked-overlay:has(#two-way-talk-btn:is(.active,.connecting)) .card-view-standalone-light-controls {display:none;}
  .card.card-view-active.card-view-overlay-presentation.two-way-talk-active.card-view-overlays-visible .card-view-standalone-light-controls {display:contents;}
  .card.card-view-active.card-view-overlay-presentation.card-view-overlays-visible .card-view-standalone-linked-overlay:has(#two-way-talk-btn:is(.active,.connecting)) .card-view-standalone-light-controls {display:contents;}
  .card.card-view-active.card-view-overlay-presentation.two-way-talk-active .card-view-standalone-linked-overlay:has([data-linked-light-dimmer]:not([hidden])) .card-view-standalone-light-controls,
  .card.card-view-active.card-view-overlay-presentation .card-view-standalone-linked-overlay:has(#two-way-talk-btn:is(.active,.connecting)):has([data-linked-light-dimmer]:not([hidden])) .card-view-standalone-light-controls {display:contents;}
  .card.card-view-active.card-view-overlay-presentation.card-view-overlays-visible .card-view-standalone-light-controls .linked-light-position-slot,
  .card.card-view-active.card-view-overlay-presentation .card-view-standalone-linked-overlay:has(#two-way-talk-btn:is(.active,.connecting)) .linked-light-position-slot,
  .card.card-view-active.card-view-overlay-presentation .card-view-standalone-linked-overlay:has([data-linked-light-dimmer]:not([hidden])) .linked-light-position-slot {pointer-events:auto;}
  .card.card-view-active.card-view-overlay-presentation.card-view-overlays-idle .card-view-standalone-mode-controls :is(
    .card-view-standalone-slideshow-button.active,
    [data-card-view-standalone-grid].active,
    .card-view-standalone-takeover-button.active
  ) {opacity:0;visibility:hidden;pointer-events:none;animation:none;}
  .card.card-view-active.card-view-overlay-presentation.card-view-overlays-idle #live-stage .live-playback-controls,
  .card.card-view-active.card-view-overlay-presentation.card-view-overlays-idle #live-stage .card-view-media-drawer:not(.is-open) .card-view-media-drawer-handle {opacity:0;visibility:hidden;pointer-events:none;}
  @keyframes card-view-touch-active-mode-button-hide {
    from {opacity:.68;visibility:visible;pointer-events:none;}
    to {opacity:0;visibility:hidden;pointer-events:none;}
  }
  .card.card-view-active.card-view-overlay-presentation.card-view-overlays-touch-idle .card-view-standalone-mode-controls [data-card-view-standalone-grid].active {
    opacity:0;visibility:hidden;pointer-events:none;animation:none;
  }
  .card.card-view-active.card-view-overlay-presentation.card-view-overlays-touch-idle:not(.card-view-video-zoomed):not(:has(.fvc-video-zoomed)) .card-view-standalone-mode-controls :is(
    .card-view-standalone-slideshow-button.active,
    .card-view-standalone-takeover-button.active
  ) {
    opacity:.68;visibility:visible;pointer-events:none;
    animation:card-view-touch-active-mode-button-hide ${CARD_VIEW_TOUCH_MODE_FADE_MS}ms linear forwards;
  }
  .card.card-view-active.card-view-overlay-presentation.card-view-overlays-touch-idle #live-stage .live-playback-controls,
  .card.card-view-active.card-view-overlay-presentation.card-view-overlays-touch-idle #live-stage .card-view-media-drawer:not(.is-open) .card-view-media-drawer-handle {opacity:0;visibility:hidden;pointer-events:none;}
  .card.card-view-active.card-view-overlay-presentation.card-view-video-zoomed .card-view-camera-row,
  .card.card-view-active.card-view-overlay-presentation .card-view-live-panel:has(.fvc-video-zoomed) .card-view-camera-row {pointer-events:none;}
  .card.card-view-active.card-view-overlay-presentation.card-view-video-zoomed .mobile-cam-picker[data-mobile-cam-picker],
  .card.card-view-active.card-view-overlay-presentation .card-view-live-panel:has(.fvc-video-zoomed) .mobile-cam-picker[data-mobile-cam-picker] {opacity:0;pointer-events:none;}
  .card.card-view-active.card-view-overlay-presentation.card-view-video-zoomed .card-view-standalone-mode-button,
  .card.card-view-active.card-view-overlay-presentation .card-view-live-panel:has(.fvc-video-zoomed) .card-view-standalone-mode-button {opacity:0;visibility:hidden;pointer-events:none;animation:none;}
  .card.card-view-active.card-view-overlay-presentation.card-view-video-zoomed #live-stage .card-view-media-drawer:not(.is-open) .card-view-media-drawer-handle,
  .card.card-view-active.card-view-overlay-presentation #live-stage:has(.fvc-video-zoomed) .card-view-media-drawer:not(.is-open) .card-view-media-drawer-handle {opacity:0;visibility:hidden;pointer-events:none;}
  .card.card-view-active.card-view-overlay-presentation.card-view-video-zoomed .card-view-standalone-linked-overlay:not(:has(#two-way-talk-btn:is(.active,.connecting))),
  .card.card-view-active.card-view-overlay-presentation .card-view-live-panel:has(.fvc-video-zoomed) .card-view-standalone-linked-overlay:not(:has(#two-way-talk-btn:is(.active,.connecting))) {opacity:0;pointer-events:none;}
  .card.card-view-active.card-view-overlay-presentation.card-view-video-zoomed .card-view-standalone-light-controls .linked-light-position-slot,
  .card.card-view-active.card-view-overlay-presentation .card-view-live-panel:has(.fvc-video-zoomed) .card-view-standalone-light-controls .linked-light-position-slot {pointer-events:none;}
  .card.card-view-active.card-view-overlay-presentation:has(.card-view-media-drawer.is-open) .card-view-camera-row,
  .card.card-view-active.card-view-overlay-presentation:has(.card-view-media-drawer.is-open) .card-view-standalone-linked-overlay:not(:has(#two-way-talk-btn:is(.active,.connecting))) {
    opacity:0;visibility:hidden;pointer-events:none;
  }
  .card.card-view-active.card-view-overlay-presentation .card-view-standalone-talk-overlay .two-way-talk-control-row :is(.two-way-talk-microphone-mute-btn,.two-way-talk-inline-mute-btn),
  .card.card-view-active.card-view-overlay-presentation .card-view-standalone-talk-overlay .two-way-talk-control-row :is(.two-way-talk-microphone-mute-btn,.two-way-talk-inline-mute-btn):hover:not(:disabled) {
    color:var(--fvc-media-overlay-text);background:transparent;background-image:none;border-color:transparent;box-shadow:none;
  }
  .card.card-view-active.card-view-overlay-presentation .card-view-standalone-talk-overlay .two-way-talk-control-row :is(.two-way-talk-microphone-mute-btn,.two-way-talk-inline-mute-btn) svg {color:var(--fvc-media-overlay-text);fill:currentColor;opacity:1;}
  .card.card-view-active.card-view-overlay-presentation .two-way-talk-result-bubble {top:50%;bottom:auto;transform:translate(-50%,-50%);}
  .card.card-view-active.card-view-overlay-presentation.card-view-grid-mode .card-view-standalone-linked-overlay:not(:has(#two-way-talk-btn:is(.active,.connecting))),
  .card.card-view-active.card-view-overlay-presentation.card-view-grid-mode .live-playback-controls {display:none !important;}
  .card.card-view-active.card-view-overlay-presentation .slideshow-next-chip {display:none !important;}
  .card.card-view-active.card-view-video-panel-only:is(:fullscreen,:-webkit-full-screen) {
    width:100% !important;height:100% !important;max-width:none !important;max-height:none !important;
    border:0 !important;border-radius:0 !important;background:#000;overflow:hidden !important;
  }
  .card.card-view-active.card-view-video-panel-only:is(:fullscreen,:-webkit-full-screen) .card-view-layout,
  .card.card-view-active.card-view-video-panel-only:is(:fullscreen,:-webkit-full-screen) .card-view-live-panel,
  .card.card-view-active.card-view-video-panel-only:is(:fullscreen,:-webkit-full-screen) .card-view-live-stage,
  .card.card-view-active.card-view-video-panel-only:is(:fullscreen,:-webkit-full-screen) #eng-wrap {
    width:100%;height:100%;max-width:none;max-height:none;min-height:0;border-radius:0 !important;background:#000;
  }
  .card.card-view-active.card-view-video-panel-only:is(:fullscreen,:-webkit-full-screen) .card-view-layout,
  .card.card-view-active.card-view-video-panel-only:is(:fullscreen,:-webkit-full-screen) .card-view-live-panel {
    flex:1 1 auto;overflow:hidden !important;
  }
  .card.card-view-active.card-view-video-panel-only:is(:fullscreen,:-webkit-full-screen) .card-view-live-stage,
  .card.card-view-active.card-view-video-panel-only:is(:fullscreen,:-webkit-full-screen) #eng-wrap {
    flex:1 1 auto;aspect-ratio:auto;
  }
  .card.card-view-active.card-view-video-panel-only:is(:fullscreen,:-webkit-full-screen) .card-view-camera-row {
    top:max(8px,env(safe-area-inset-top,0px));left:max(20px,env(safe-area-inset-left,0px));right:auto;
    width:calc(100% - max(20px,env(safe-area-inset-left,0px)) - max(20px,env(safe-area-inset-right,0px)));
  }
  .card.card-view-active.card-view-video-panel-only:is(:fullscreen,:-webkit-full-screen) .card-view-live-status-overlay {
    right:max(20px,env(safe-area-inset-right,0px));
  }
  .card.card-view-active.card-view-video-panel-only:is(:fullscreen,:-webkit-full-screen) .live-playback-controls {
    right:max(20px,env(safe-area-inset-right,0px));
  }
  .card.card-view-active.card-view-video-panel-only:is(:fullscreen,:-webkit-full-screen) :is(.card-view-video-only-back,.live-fs-btn,.live-resize-grip) {
    display:none !important;
  }
  .card.card-view-active.card-view-video-panel-only:is(:fullscreen,:-webkit-full-screen) .card-view-native-fullscreen-exit {
    position:absolute;z-index:1100;top:max(8px,env(safe-area-inset-top,0px));left:max(8px,env(safe-area-inset-left,0px));
    display:inline-flex;align-items:center;justify-content:center;width:32px;height:32px;min-width:32px;min-height:32px;margin:0;padding:4px;
    border:1px solid var(--fvc-media-overlay-border);border-radius:50%;color:var(--fvc-media-overlay-text);background:var(--fvc-media-overlay-bg);
    background-image:none;box-shadow:var(--fvc-media-overlay-shadow);appearance:none;-webkit-appearance:none;cursor:pointer;
    backdrop-filter:blur(5px);-webkit-backdrop-filter:blur(5px);
  }
  .card.card-view-active.card-view-video-panel-only:is(:fullscreen,:-webkit-full-screen) .card-view-native-fullscreen-exit svg {
    width:20px;height:20px;color:currentColor;fill:currentColor;opacity:1;pointer-events:none;
  }
  .card.card-view-active.card-view-video-panel-only:is(:fullscreen,:-webkit-full-screen) .card-view-media-drawer:not(.is-open) .card-view-media-drawer-handle {
    top:auto;bottom:max(8px,env(safe-area-inset-bottom,0px));left:50%;width:56px;height:30px;
    border-left:1px solid var(--fvc-media-overlay-border);border-radius:8px;transform:translateX(-50%);
  }
  .card.card-view-active.card-view-video-panel-only:is(:fullscreen,:-webkit-full-screen) #myPopup.popup-content--card-view-drawer {
    position:absolute;inset:0;width:100%;height:100%;min-height:100%;max-height:none;margin:0;z-index:1000;
    border:0;border-radius:0;background:#000;box-shadow:none;
  }
  .card.card-view-active.card-view-video-panel-only:is(:fullscreen,:-webkit-full-screen) #myPopup.popup-content--card-view-drawer .popup-body {
    position:relative;flex:1 1 auto;width:100%;height:100%;min-height:0;max-height:none;padding:0;gap:0;overflow:hidden;
  }
  .card.card-view-active.card-view-video-panel-only:is(:fullscreen,:-webkit-full-screen) #myPopup.popup-content--card-view-drawer #viewer {
    position:absolute;inset:0;display:flex !important;align-items:center;justify-content:center;
    width:100%;height:100%;max-width:none;max-height:none;aspect-ratio:auto;border-radius:0;background:#000;
  }
  .card.card-view-active.card-view-video-panel-only:is(:fullscreen,:-webkit-full-screen) #myPopup.popup-content--card-view-drawer #viewer :is(video,img.snap) {
    width:auto !important;height:100% !important;max-width:100% !important;max-height:100% !important;
    object-fit:contain !important;object-position:center center !important;background:#000;
  }
  .card.card-view-active.card-view-video-panel-only:is(:fullscreen,:-webkit-full-screen) #myPopup.popup-content--card-view-drawer .popup-close-row {
    display:block !important;top:max(8px,env(safe-area-inset-top,0px));right:max(20px,env(safe-area-inset-right,0px));
  }
  .card.card-view-active.card-view-video-panel-only:is(:fullscreen,:-webkit-full-screen) #myPopup.popup-content--card-view-drawer .popup-card-view-actions {
    left:max(20px,env(safe-area-inset-left,0px));
  }
  .card.card-view-active.card-view-video-panel-only:is(:fullscreen,:-webkit-full-screen) #myPopup.popup-content--card-view-drawer .popup-card-view-resize-host {
    display:none !important;
  }
  .card.card-view-active.card-view-overlay-presentation:is(.mobile-rotate-live,.mobile-rotate-live-exit) .card-view-camera-row {
    position:fixed;z-index:1500;box-sizing:border-box;
    top:calc(var(--rotate-oy,0px) + max(8px,env(safe-area-inset-top,0px)));
    left:calc(var(--rotate-ox,0px) + max(20px,env(safe-area-inset-left,0px)));
    right:auto;
    width:calc(var(--rotate-vw,100vw) - max(20px,env(safe-area-inset-left,0px)) - max(20px,env(safe-area-inset-right,0px)));
  }
  .card.card-view-active.card-view-video-panel-only:is(.mobile-rotate-live,.mobile-rotate-live-exit) .card-view-live-status-overlay {
    right:max(20px,env(safe-area-inset-right,0px));
  }
  .card.card-view-active.card-view-video-panel-only:is(.mobile-rotate-live,.mobile-rotate-live-exit) .card-view-video-only-back {display:none !important;}
  .card.card-view-active.card-view-overlay-presentation:is(.mobile-rotate-live,.mobile-rotate-live-exit) .card-view-media-drawer:not(.is-open) .card-view-media-drawer-handle {
    top:auto;bottom:max(8px,env(safe-area-inset-bottom,0px));left:50%;width:56px;height:30px;
    border-left:1px solid var(--fvc-media-overlay-border);border-radius:8px;transform:translateX(-50%);
  }
  .card.card-view-active.card-view-video-panel-only:is(.mobile-rotate-popup,.mobile-rotate-popup-exit) #myPopup.popup-content--card-view-drawer .popup-body {
    position:relative;flex:1 1 auto;width:100%;height:100%;min-height:0;
  }
  .card.card-view-active.card-view-video-panel-only:is(.mobile-rotate-popup,.mobile-rotate-popup-exit) #viewer {
    position:absolute;inset:0;display:flex !important;align-items:center;justify-content:center;width:100%;height:100%;max-width:none;max-height:none;
    background:#000;
  }
  .card.card-view-active.card-view-video-panel-only:is(.mobile-rotate-popup,.mobile-rotate-popup-exit) #viewer video {
    width:auto !important;height:100% !important;max-width:100% !important;max-height:100% !important;
    object-fit:contain !important;object-position:center center !important;background:#000;
  }
  .card.card-view-active.card-view-video-panel-only .card-view-drawer,
  .card.card-view-active.card-view-video-panel-only .card-view-footer {display:none;}
  .card.card-view-active.card-view-video-panel-only .card-view-layout {background:transparent;}
  .card.card-view-active.card-view-video-panel-only .card-view-live-panel {border-radius:var(--fvc-border-radius,0px);}
  .card.firefox-client.card-view-active.card-view-overlay-presentation :is(
    .card-view-video-only-back,
    .mobile-cam-picker__trigger,
    .mobile-cam-picker__panel,
    .card-view-media-drawer-panel,
    .card-view-media-drawer-popover,
    .card-view-source-indicator,
    .card-view-live-badge,
    .linked-light-dimmer-panel,
    .snapshot-result-bubble,
    .two-way-talk-result-bubble
  ) {
    backdrop-filter:none;
    -webkit-backdrop-filter:none;
  }
  @container card-view-live (max-width:440px) {
    .card.card-view-active.card-view-overlay-presentation.card-view-media-drawer-enabled .card-view-media-drawer:not([hidden]) {width:clamp(110px,34%,132px);}
    .card.card-view-active.card-view-overlay-presentation .card-view-media-drawer-panel {padding:5px 4px 4px;}
    .card.card-view-active.card-view-overlay-presentation .card-view-media-drawer-tabs {top:5px;width:64px;}
    .card.card-view-active.card-view-overlay-presentation .card-view-media-drawer[data-card-view-media-tab-count="5"] .card-view-media-drawer-tabs {height:min(124px,max(54px,calc(54% - 34px)));}
    .card.card-view-active.card-view-overlay-presentation .card-view-media-drawer[data-card-view-media-tab-count="5"] .card-view-media-drawer-handle {top:54%;}
    .card.card-view-active.card-view-overlay-presentation .card-view-media-drawer-tab {padding-inline:3px;font-size:.45rem;}
    .card.card-view-active.card-view-overlay-presentation .card-view-media-drawer-actions {top:calc(50% + 30px);width:26px;}
    .card.card-view-active.card-view-overlay-presentation .card-view-media-drawer[data-card-view-media-tab-count="5"] .card-view-media-drawer-actions {top:calc(54% + 30px);gap:1px;}
    .card.card-view-active.card-view-overlay-presentation .card-view-media-drawer-action {width:26px;height:26px;}
    .card.card-view-active.card-view-overlay-presentation .card-view-media-drawer-action svg {width:16px;height:16px;}
    .card.card-view-active.card-view-overlay-presentation .card-view-media-drawer-popover {left:calc(100% + 30px);width:calc(100cqw - 100% - 36px);padding:7px;}
    .card.card-view-active.card-view-overlay-presentation .card-view-media-drawer-item {gap:3px;padding:3px;}
    .card.card-view-active.card-view-overlay-presentation .card-view-media-drawer-meta {font-size:.56rem;}
    .card.card-view-active.card-view-overlay-presentation .linked-light-dimmer {width:68px;bottom:calc(100% + 5px);}
    .card.card-view-active.card-view-overlay-presentation .linked-light-dimmer-panel {width:68px;gap:3px;padding:5px 4px 4px;}
    .card.card-view-active.card-view-overlay-presentation .linked-light-dimmer-title {font-size:.62rem;}
    .card.card-view-active.card-view-overlay-presentation .linked-light-dimmer output {font-size:1rem;}
    .card.card-view-active.card-view-overlay-presentation .linked-light-brightness-track {width:36px;height:64px;}
    .card.card-view-active.card-view-overlay-presentation .linked-light-brightness-track input[type="range"] {width:56px;height:32px;}
    .card.card-view-active.card-view-overlay-presentation .linked-light-brightness-track input[type="range"]::-webkit-slider-runnable-track {height:32px;}
    .card.card-view-active.card-view-overlay-presentation .linked-light-brightness-track input[type="range"]::-webkit-slider-thumb {height:22px;margin-top:5px;}
    .card.card-view-active.card-view-overlay-presentation .linked-light-brightness-track input[type="range"]::-moz-range-track {height:32px;}
    .card.card-view-active.card-view-overlay-presentation .linked-light-brightness-track input[type="range"]::-moz-range-thumb {height:22px;}
    .card.card-view-active.card-view-overlay-presentation .linked-light-dimmer-power {width:28px;height:28px;min-width:28px;min-height:28px;}
  }
  @media (prefers-reduced-motion:reduce) {
    .card.card-view-active .card-view-drawer {transition-duration:1ms;}
    .card.card-view-active .card-view-drawer.is-closed .card-view-drawer-inner {transition-delay:1ms;}
    .card.card-view-active .card-view-drawer-handle svg {transition-duration:1ms;}
    .card.card-view-active .card-view-media-drawer-panel,
    .card.card-view-active .card-view-media-drawer-handle,
    .card.card-view-active .card-view-media-drawer-handle svg {transition-duration:1ms;}
  }
  @container card-view-footer (max-width:480px) {
    .card.card-view-active .card-view-footer .fvc-brand-logo {max-width:100px;}
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
