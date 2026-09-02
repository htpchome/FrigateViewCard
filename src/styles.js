import { MOBILE_VIEW_PAGE_STYLES } from "./features/mobile-view/page.styles.js";
import { CARD_VIEW_PAGE_STYLES } from "./features/card-view/page.styles.js";
import { CAMERA_PICKER_STYLES } from "./features/navigation/camera-picker.styles.js";
import { WIDE_VIEW_TIMELINE_STYLES } from "./features/wide-view/timeline.styles.js";
import { CAMERA_GROUP_LIVE_STYLES } from "./features/camera-groups/live.styles.js";
import { TWO_WAY_TALK_SOUNDWAVE_STYLES } from "./features/two-way-talk/soundwave.styles.js";
import { LINKED_LIGHT_STYLES } from "./features/linked-entities/light.styles.js";

export const STYLES = `
  :host {
    height: var(--card-host-height, 100%) !important;
    max-height: var(--card-host-height, 100%) !important;
    min-height: 0;
    overflow: hidden;
    position: relative;
    box-sizing: border-box !important;
    display: block !important;
    border: 0 !important;
    border-radius: var(--fvc-border-radius);
  }
  :host(.card-picker-demo-host) {
    --card-host-height: 360px !important;
    height: 360px !important;
    max-height: 360px !important;
  }
  :host(.mobile-view-sections-full-bleed) {
    width: calc(
      100% + var(--ha-view-sections-column-gap, 8px) +
        var(--ha-view-sections-column-gap, 8px)
    ) !important;
    max-width: none !important;
    margin-inline: calc(
      0px - var(--ha-view-sections-column-gap, 8px)
    ) !important;
  }
  :host {
    --popup-z-index: 1000;
    --popup-bg: var(--card-background-color);
    --handle-color: #e0e0e0;
    --rotate-vw: 100vw;
    --rotate-vh: 100dvh;
    --rotate-ox: 0px;
    --rotate-oy: 0px;
  }
  .card {
    --fvc-mobile-bg: var(--wa-color-neutral-fill-normal, var(--secondary-background-color));
    --fvc-mobile-list: #f0f0f0;
    --fvc-list: #f0f0f0;
    --fvc-tabs-holder: var(--secondary-background-color);
  }
  .card[data-theme-mode="light"] {
    --fvc-mobile-list: #f0f0f0;
    --fvc-list: #f0f0f0;
    --fvc-tabs-holder: var(--secondary-background-color);
  }
  .card[data-theme-mode="dark"] {
    --fvc-mobile-list: #181818;
    --fvc-list: #181818;
    --fvc-tabs-holder: var(--primary-background-color);
  }
  .card[data-ha-theme="custom"] {
    --fvc-mobile-bg: var(--wa-color-neutral-fill-normal, var(--secondary-background-color));
    --fvc-mobile-list: var(--primary-background-color);
    --fvc-list: var(--secondary-background-color);
    --fvc-tabs-holder: var(--primary-background-color);
  }
  .card[data-ha-theme="custom"][data-ha-dark-primary="derived"] {
    --dark-primary-color: color-mix(in srgb, var(--primary-color) 75%, black);
  }
  .card {
        --c-bg-main:   var(--card-background-color);
        --c-bg-primary:var(--primary-background-color); 
        --c-bg-panel:  var(--secondary-background-color);
        --c-bg-mobile: var(--fvc-mobile-bg);
        --c-bg-mobile-list: var(--fvc-mobile-list);
        --c-bg-list:   var(--fvc-list);
        --c-bg-cam-btn:var(--fvc-list);
        --c-bg-tabs-holder:   var(--fvc-tabs-holder);
        --c-bg-deep:   #111111;
        --c-text:      var(--primary-text-color);
        --c-text2:     var(--secondary-text-color);
        --c-text3:     var(--state-inactive-color);
        --c-text4:     var(--disabled-text-color);
        --c-text-rev:  var(--text-primary-color);
        --c-border:    var(--secondary-background-color);
        --c-border2:   var(--disabled-text-color);
        --c-primary:   var(--primary-color);
        --c-primary-l: var(--light-primary-color);
        --c-primary-d: var(--dark-primary-color);
        --c-accent:    var(--accent-color);
        --c-on:        #4ade80;
        --c-off:       #FCA5A5;
        --c-bg-scrub:  #c2f2c1;
        --c-bg-alert:  var(--error-color);
        --c-bg-detect: var(--warning-color);
    }
  /* ── responsive layout    ── */
  ha-card {
    --ha-card-background: var(--c-bg-main) !important;
    min-height: 0 !important;
    height: 100%;
    overflow:hidden !important;
    padding: 0 !important;
    margin: 0 !important;
    min-height: 0 !important;
    overflow:hidden !important;
    }
  .card{
    --fvc-shadow-s: var(--ha-box-shadow-s);
    --fvc-shadow-m: var(--ha-box-shadow-m);
    --fvc-outer-shadow-m: var(--ha-box-shadow-m);
    --fvc-border-s: 1px solid var(--c-border2);
    --fvc-border-m: 2px solid var(--c-border2);
    --fvc-border-active:  1px solid var(--c-primary);
    --fvc-border-radius: 15px;
    --fvc-outer-border-radius: 15px;
    --ha-card-border-radius: var(--fvc-outer-border-radius);
    --fvc-footer-height: calc(2.4rem + 8px);
    color:var(--c-text);
    overflow:hidden;
    box-sizing: border-box;
    -webkit-backface-visibility: hidden;
    backface-visibility: hidden;
    font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
    display:flex;
    flex-direction:column;
    height:100%;
    position:relative;
    top:0;
    left:0;
    overflow:hidden !important;
    border:1px solid var(--secondary-background-color,#7a7a7a);
    border-radius: var(--fvc-border-radius);
    }
  .card.shadows-off{--fvc-shadow-s:none;--fvc-shadow-m:none;}
  .card.borders-off{--fvc-border-s: none;--fvc-border-m:  none;--fvc-border-active: none}
  .card.corners-off{--fvc-border-radius:0px;--fvc-outer-border-radius:0px;}

  .card.card-picker-demo .live-playback-controls,
  .card.card-picker-demo .page-nav-row,
  .card.card-picker-demo .tools-row{display:none !important;}
  .card.card-picker-demo #eng-wrap{height:auto;aspect-ratio:16/9;}
  .card.card-picker-demo #engine{visibility:hidden;}
  .card.card-picker-demo #stream-fallback{display:block !important;z-index:6;}
  .card.card-picker-demo .stream-loading,
  .card.card-picker-demo .stream-fallback-status{display:none !important;}
  .card.card-picker-demo .card-picker-demo-live{position:absolute;inset:0;overflow:hidden;background:#000;}
  .card.card-picker-demo .card-picker-demo-brand{display:block;width:100%;height:100%;}
  .card.card-picker-demo .card-picker-demo-scene{display:block;width:100%;height:100%;}
  .card.card-picker-demo .card-picker-demo-live > .card-picker-demo-scene{filter:brightness(.68) saturate(.85) contrast(1.1);}
  .card.card-picker-demo .card-picker-demo-scene-sky{fill:var(--c-primary-l);}
  .card.card-picker-demo .card-picker-demo-scene-ground{fill:var(--c-bg-panel);}
  .card.card-picker-demo .card-picker-demo-scene-path{fill:var(--c-border2);opacity:.72;}
  .card.card-picker-demo .card-picker-demo-scene-building{fill:var(--c-bg-primary);}
  .card.card-picker-demo .card-picker-demo-scene-roof{fill:var(--c-text2);}
  .card.card-picker-demo .card-picker-demo-scene-door{fill:var(--c-bg-deep);}
  .card.card-picker-demo .card-picker-demo-scene-window{fill:var(--c-primary);opacity:.72;}
  .card.card-picker-demo .card-picker-demo-scene-landscape{fill:var(--c-on);opacity:.65;}
  .card.card-picker-demo .card-picker-demo-scene-subject{fill:var(--c-text);stroke:var(--c-bg-main);stroke-width:2;}
  .card.card-picker-demo .card-picker-demo-scene-frame{fill:none;stroke:var(--c-text-rev);stroke-width:2;opacity:.28;}
  .card.card-picker-demo .card-picker-demo-live-label{position:absolute;left:6px;bottom:5px;padding:2px 5px;border-radius:999px;background:var(--c-bg-deep);color:var(--c-text-rev);font-size:.62rem;line-height:1.2;opacity:.82;}
  .card.card-picker-demo .info-row{display:flex;align-items:center;justify-content:space-between;gap:4px;flex-wrap:nowrap;padding:2px 7px;}
  .card.card-picker-demo .info-left{flex:0 1 auto;min-width:0;}
  .card.card-picker-demo .info-title{font-size:.88rem;}
  .card.card-picker-demo .section-label{font-size:.72rem;}
  .card.card-picker-demo .stats{flex:0 0 auto;gap:3px;align-self:center;}
  .card.card-picker-demo .stat{font-size:.65rem;}
  .card.card-picker-demo .sv{font-size:.72rem;}
  .card.card-picker-demo .sl{font-size:.55rem;}
  .card.card-picker-demo .button-holder{display:flex;justify-content:center;padding:2px 5px;}
  .card.card-picker-demo .tabs-row{justify-content:center;}
  .card.card-picker-demo .circle-btn{min-width:31px;min-height:31px;}
  .card.card-picker-demo .circle-btn svg{width:20px;height:20px;}
  .card.card-picker-demo .tabs-holder{margin:1px 6px;}
  .card.card-picker-demo .browse-head{min-height:1.2rem;max-height:1.2rem;font-size:.72rem;padding:0 6px;}
  .card.card-picker-demo .browse{padding:0 6px;overflow:hidden;}
  .card.card-picker-demo .list-item.card-picker-demo-alert{flex-wrap:nowrap;gap:6px;min-height:48px;margin-bottom:4px;padding:2px 6px 2px 2px;cursor:default;}
  .card.card-picker-demo .card-picker-demo-alert .et{width:76px;height:43px;}
  .card.card-picker-demo .card-picker-demo-alert .card-picker-demo-scene{width:76px;height:43px;}
  .card.card-picker-demo .card-picker-demo-alert .rev-t{font-size:.74rem;white-space:nowrap;}
  .card.card-picker-demo .card-picker-demo-alert .rev-m{font-size:.62rem;gap:5px;}
  .card.card-picker-demo .card-picker-demo-alert-badge{position:absolute;left:3px;bottom:2px;padding:1px 3px;border-radius:3px;background:var(--c-bg-deep);color:var(--c-text-rev);font-size:.5rem;line-height:1.1;opacity:.82;}
  .card.card-picker-demo .card-picker-demo-alert:hover{background:var(--c-bg-primary);}
  .card.card-picker-demo .footer{display:grid;flex:0 0 27px;height:27px;grid-template-columns:minmax(0,1fr) auto;min-height:27px;line-height:1;padding:1px 6px;}
  .card.card-picker-demo .footer .frigate-view{display:flex;align-items:center;max-height:22px;}
  .card.card-picker-demo .footer .frigate-view svg{height:20px;}
  .card.card-picker-demo .footer-version{font-size:.56rem;padding:0 1px 2px 4px;}

  .card .layout{display:flex;flex-direction:column;height:100%;max-height:100%;min-height:0;width:100%;overflow:hidden !important;}
  .card .layout.wide-view{flex-direction:row;}
  .card .view-frame{display:flex;flex:1 1 0;flex-direction:column;width:100%;height:100%;min-width:0;min-height:0;overflow:hidden;}
  .card .view-top{display:flex;flex:0 0 auto;flex-direction:column;position:relative;z-index:2;width:100%;min-width:0;min-height:0;align-self:stretch;overflow:visible;}
  .card .view-body{display:flex;flex:1 1 auto;flex-direction:column;position:relative;width:100%;min-width:0;min-height:0;overflow:hidden;}
  .card .col-left{flex:0 1 auto;min-height:0;align-self:start;flex-direction:column;width:100%;display:flex;overflow:visible;}
  .card .col-left > *{flex:0 0 auto;}
  .card .col-left > .wide-companion-panel{flex:1 1 0;}
  .card .col-right{flex:1 1 auto; min-height:0; flex-direction:column;position:relative;width:100%; display:flex;overflow:hidden;}
  .card .layout--single-view > .single-view-frame{flex:1 1 0;}
  .card .single-view-frame > .col-left--single-view{flex:0 0 auto;align-self:stretch;overflow:visible;}
  .card .single-view-frame > .col-right--single-view{flex:1 1 0;}
  .resize-handle{display:block;width:100%;height:6px;cursor:row-resize;background:var(--c-bg-panel);position:relative;flex-shrink:0;z-index:10;transition:background .18s ease,color .18s ease;}
  .layout:not(.wide-view) .resize-handle{display:none;}
  .resize-handle:hover,.resize-handle.active{background:var(--c-bg-primary);}
  .resize-handle::after{content:'';position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:32px;height:2px;background:var(--c-text4);border-radius:1px;}
  .layout.wide-view .resize-handle{flex:0 0 10px;width:10px;height:auto;overflow:visible;cursor:col-resize;color:var(--c-text3);border-inline:1px solid var(--c-border2);box-sizing:border-box;}
  .layout.wide-view .resize-handle::before{content:'↔';position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);font-size:.5rem;line-height:0.6;opacity:.82;transition:opacity .14s ease;}
  .layout.wide-view .resize-handle::after{content:'Resize ↕ Video';top:50%;left:50%;width:auto;height:auto;transform:translate(-50%,-50%);writing-mode:vertical-rl;text-orientation:mixed;background:transparent;color:var(--c-text3);font-size:.5rem;line-height:0.6;letter-spacing:.05em;text-transform:uppercase;white-space:nowrap;opacity:0;transition:opacity .14s ease;}
  .layout.wide-view .resize-handle:hover,
  .layout.wide-view .resize-handle.active{color:var(--c-text);background:color-mix(in srgb,var(--c-bg-primary) 72%,var(--c-bg-panel));}
  .layout.wide-view .resize-handle:hover::before,
  .layout.wide-view .resize-handle.active::before{opacity:0;}
  .layout.wide-view .resize-handle:hover::after,
  .layout.wide-view .resize-handle.active::after{opacity:1;}
  .card .live-stage{position:relative;width:100%;min-height:0;flex-shrink:0;}
  .card #eng-wrap{min-height:0;}
  .card .browse{
    display:flex;
    flex:1 1 0;
    flex-direction:column;
    container-type:inline-size;
    container-name:browse-list;
    padding:0 10px;
    margin:0;
    min-height:0;
    height:auto;
    overflow-y:auto;
    overflow-x:hidden;
    box-sizing:border-box;
    position:relative}

  .card .browse-head{display:flex;align-items:center;justify-content:center;min-height:1.5rem;max-height:1.65em;flex-direction:row;width:auto;color:var(--c-text2);letter-spacing:.02em;line-height:1.40;padding:1px 8px;}
  .card.recordings-browse-head-tall .browse-head{min-height:3.5rem;max-height:none;}
  .browse-head-left {display:flex;flex:1;justify-content:center;align-items:center;flex: 0 0 auto; }
  .browse-head-right {display:flex;justify-content center;align-items: center;flex: 0 0 auto;}
  .browse-head-middle {flex:1;text-align:center;font-weight:700;font-size:1rem;letter-spacing:.02em;line-height:1.40;}

  .footer {display:grid;grid-template-columns:minmax(100px,1fr) minmax(100px,1fr);flex:0 0 var(--fvc-footer-height);height:var(--fvc-footer-height);min-height:var(--fvc-footer-height);line-height:1;font-size:1.2rem;padding:4px;align-items:center;border-top:1px solid var(--c-border);box-sizing:border-box;}
  .footer-version{justify-self:end;align-self:center;padding:0 .3rem;color:var(--c-text2);font-size:.68rem;font-weight:600;line-height:1;white-space:nowrap;}
  .wide-footer{display:grid;grid-template-columns:minmax(0,1fr) auto;align-items:center;flex:0 0 var(--fvc-footer-height);height:var(--fvc-footer-height);min-height:var(--fvc-footer-height);line-height:1;font-size:1.2rem;padding:4px;text-align:left;border-top:1px solid var(--c-border);box-sizing:border-box;}
  
  .list.recordings-swipe-active{position:relative;overflow:hidden;}
  .rec-swipe-stage{position:relative;width:100%;min-height:220px;}
  .rec-swipe-pane{position:absolute;inset:0;will-change:transform;backface-visibility:hidden;}
  .list.recordings-swipe-active .rec-swipe-pane{pointer-events:none;}
  .rec-swipe-pane.loading{display:flex;align-items:center;justify-content:center;}
  .rec-swipe-pane.loading .empty{margin-top:14px;}
  .browse.swipe-bounce-prev{animation:browseBouncePrev .24s ease-out;}
  .browse.swipe-bounce-next{animation:browseBounceNext .24s ease-out;}
  @keyframes browseBouncePrev {
    0% { transform: translateX(0); }
    38% { transform: translateX(18px); }
    100% { transform: translateX(0); }
  }
  @keyframes browseBounceNext {
    0% { transform: translateX(0); }
    38% { transform: translateX(-18px); }
    100% { transform: translateX(0); }
  }
  
  .card .browse::-webkit-scrollbar{width:8px;}
  .card .browse::-webkit-scrollbar-track{background:transparent;}
  .card .browse::-webkit-scrollbar-thumb{background:var(--c-text2);border-radius:4px;background-clip:content-box;}

  .browse-return-top-slot{position:sticky;top:calc(100% - 50px);z-index:8;display:flex;justify-content:center;align-items:flex-start;width:100%;height:0;min-height:0;pointer-events:none;}
  .browse-return-top-chip{appearance:none;-webkit-appearance:none;display:inline-flex;align-items:center;justify-content:center;gap:5px;min-width:72px;min-height:40px;padding:7px 14px;border:1px solid var(--c-border2);border-color:color-mix(in srgb,var(--c-border2) 82%,transparent);border-radius:999px;background:rgba(32,32,32,.72);background:color-mix(in srgb,var(--c-bg-main) 78%,transparent);box-shadow:0 4px 14px rgba(0,0,0,.24);-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px);color:var(--c-text);font:inherit;font-size:.78rem;font-weight:750;line-height:1;cursor:pointer;pointer-events:auto;transition:background-color .16s ease,border-color .16s ease,color .16s ease,box-shadow .16s ease,transform .1s ease;-webkit-tap-highlight-color:transparent;}
  .browse-return-top-chip[hidden]{display:none;}
  .browse-return-top-chip svg{width:18px;height:18px;fill:currentColor;}
  .browse-return-top-chip:hover,.browse-return-top-chip:focus-visible{border-color:var(--c-primary-d);background:color-mix(in srgb,var(--c-bg-main) 88%,var(--c-primary-l));color:var(--c-primary-d);outline:none;box-shadow:0 5px 17px rgba(0,0,0,.3);}
  .browse-return-top-chip:active{transform:scale(.96);}
  @media (hover:none), (pointer:coarse){
    .browse-return-top-chip:hover:not(:focus-visible){border-color:color-mix(in srgb,var(--c-border2) 82%,transparent);background:color-mix(in srgb,var(--c-bg-main) 78%,transparent);color:var(--c-text);box-shadow:0 4px 14px rgba(0,0,0,.24);}
  }

  /* ── event list ── */
  .list{display:block;width:100%;max-width:100%;min-width:0;min-height:0;box-sizing:border-box;}
  .list-head{justify-content:space-between;align-items:center;margin-bottom:8px;}
  .list-day-sec{position:relative;width:100%;max-width:100%;min-width:0;box-sizing:border-box;}
  .list-day-label{position:relative;z-index:1;inset-inline-start:calc(var(--fvc-day-label-scrollbar-width, 0px) / 2);padding:2px 0 4px;font-size:1rem;font-weight:700;color:var(--c-text2);letter-spacing:.02em;line-height:1.30;pointer-events:none;background:none;border:none;text-align: center;}
  .list-day-label-first{display:none;}


  .list-item{position: relative;display:flex;flex-wrap:wrap;gap:9px;align-items:center;container-type:inline-size;container-name:list-item;
    background:var(--c-bg-list);margin-bottom:5px; outline: var(--fvc-border-s);
    cursor:pointer;border-radius: var(--fvc-border-radius);padding:2px 10px 2px 2px;}
  .list-item:hover{background: var(--c-bg-panel);}
  .list-item.compact{padding:2px 10px 2px 2px;flex-wrap:wrap;}
  .list-item.compact .et{width:112px;height:63px;border-radius:5px;}
  .list-item.compact .eact .ico{width:30px !important;height:30px !important;}
  .list-item.compact .eact .ico svg{width:24px;height:24px;}
  .et{border-radius:calc(var(--fvc-border-radius) - 1px);overflow:hidden;flex-shrink:0;
    background:var(--c-bg-deep);position:relative;object-fit:cover;}
  .et img{width:160px;height:90px;object-fit:cover;display:block;}
  .alert{outline: 2px solid var(--error-color, var(--c-bg-alert));} 
  .detection{outline: 2px solid var(--c-accent);}
  .eact{display:flex;flex-direction:row;align-items:center;gap:4px;flex-shrink:0;margin-left:auto;padding-right:10px;}
  .tph{width:160px;height:90px;display:flex;align-items:center;justify-content:center;border-radius:var(--fvc-border-radius);background:linear-gradient(135deg,#1a2840,#0d1520);
    color:var(--c-primary-d);} 
  .tph svg{width:20px;height:20px;}

 /* ── recordings ── */
  .ric{position:relative;width:63px;height:63px;border-radius:5px;background:rgba(30,80,200,.25);
    color:var(--c-primary-d);display:flex;align-items:center;justify-content:center;} 
  .ric svg{width:16.8px;height:16.8px;}
  .recording-group-member{position:absolute;right:4px;bottom:4px;display:inline-flex;align-items:center;justify-content:center;min-width:16px;height:16px;padding:0 3px;border-radius:999px;background:var(--c-bg-panel);color:var(--c-text);font-size:.62rem;font-weight:800;line-height:1;box-sizing:border-box;}
  .rinf{flex:1;} 
  .rt{font-size:0.9rem;font-weight:600;color:var(--c-text);} 
  .rsub{font-size:0.75rem;color:var(--c-text2);margin-top:1px;} 
  .rp{display:inline-flex;gap:4px;align-items:center;justify-content:center;background:var(--c-bg-panel); border:1px solid var(--c-border2);color:var(--c-text2);
    border-radius: calc(var(--fvc-border-radius, 0px) / 2);
  cursor:pointer;
  padding:2px;
  transition: all 0.2s ease;
  min-height:30px;
  min-width:30px;}
  .rp svg{width:24px;height:24px;}
  .rp:hover{color:var(--c-primary-d);border-color:var(--c-primary-d);}

  /* ── reviews ── */
  .rev-nogap {display:flex;gap:0;}
  .rev-inf{flex:1 1 220px;min-width:0;}
  .rev-head{display:flex;align-items:center;gap:5px;flex-wrap:wrap;min-width:0;margin-bottom:3px;}
  .rev-t{font-size:0.9rem;font-weight:600;color:var(--c-text);min-width:0;overflow-wrap:anywhere;}
  .rev-m{display:flex;align-items:center;gap:6px;flex-wrap:wrap;font-size:0.75rem;color:var(--c-text2);margin-top:1px;} 
  .rev-m .time-meta,.rev-m .review-meta{display:inline-flex;align-items:center;gap:4px;}
  .rev-m svg{width:10.8px;height:10.8px;}

  .xform{}
  .xform:hover{}
  .shadow-small {box-shadow: var(--fvc-shadow-s);}  
  .shadow-medium {box-shadow: var(--fvc-shadow-m);}
  .small-padding {padding:5px;}
  .tabs-holder{margin:3px 8px;border-radius:8px;background-color:var(--c-bg-tabs-holder);container-type:inline-size;}
  .button-holder{display:grid;grid-template-columns:minmax(0,1fr) auto minmax(0,1fr);grid-template-areas:"tabs nav tools";align-items:center;gap:10px;padding:4px 8px;}
  .button-holder-row{display:flex;align-items:center;min-width:0;}
  .tabs-row{grid-area:tabs;justify-content:flex-start;}
  .page-nav-row{grid-area:nav;justify-content:center;}
  .tools-row{grid-area:tools;justify-content:flex-end;position:relative;}
  .tabs{display:flex;flex-wrap:nowrap;gap:5px;max-width:100%;padding:0;overflow-x:auto;overflow-y:hidden;scrollbar-width:none;overscroll-behavior-inline:contain;position:relative;z-index:auto;background-color:transparent !important;border-radius:8px;transition:background-color 0.3s ease;margin:0;}
  .tabs::-webkit-scrollbar{display:none;}

  /* ── circle button ── */
  .circle-btn{display:inline-flex;align-items:center;justify-content: center;gap:4px;font-size:1rem;font-weight:600;border-radius:50%;min-height:36px;min-width:36px;background-color:var(--c-bg-main);padding:1px;transition: all 0.2s ease;cursor:pointer;}
  .circle-btn svg{width:24px;height:24px;opacity:0.85;color:var(--c-text2)}
  .circle-btn:hover {background-color:var(--c-bg-main);color:var(--c-primary-d);}
  .circle-btn:hover svg{color:var(--c-primary-d);}
  .circle-btn.active {background:var(--c-primary-d);} 
  .circle-btn.active svg{color:var(--c-text-rev);}
  .icon-btn{appearance:none;-webkit-appearance:none;display:inline-flex;align-items:center;justify-content:center;gap:4px;min-height:36px;min-width:36px;margin:0;padding:1px;border:0;border-radius:0;background:transparent;box-shadow:none;color:var(--c-text2);font:inherit;font-size:1rem;font-weight:600;cursor:pointer;}
  .icon-btn svg{width:24px;height:24px;opacity:0.85;color:var(--c-text2)}
  .icon-btn:hover:not(:disabled),.icon-btn:active:not(:disabled),.icon-btn.active{color:var(--c-primary-d);}
  .icon-btn:hover:not(:disabled) svg,.icon-btn:active:not(:disabled) svg,.icon-btn.active svg{color:var(--c-primary-d);}
  .icon-btn:disabled{opacity:.45;cursor:not-allowed;}
  .icon-btn:disabled:hover{color:var(--c-text2);}
  .icon-btn:disabled:hover svg{color:var(--c-text2);}

  .round-btn, .close-btn {
  display: inline-flex;
  align-items: center;     
  justify-content: center; 
  min-width: calc(24px + 1rem);
  min-height: calc(24px + 1rem);
  aspect-ratio: 1 / 1; 
  background-color: var(--c-bg-main);  
  color: var(--c-text2);
  background-image:
    radial-gradient(
      circle at center,
      var(--wa-color-neutral-fill-normal) 0 50%,
      transparent 51%
    );  
  background-position: center;
  background-repeat: no-repeat;
  background-size: 0 0;
  border: none;
  box-shadow: 0 0 3px 1px var(--c-text3);
  border-radius: 50%;
  font-weight: 600;
  font-size: 1rem;
  line-height: 1;
  cursor: pointer;
  appearance: none;
  transition:
    background-size 0.35s ease,
    box-shadow 0.2s ease,
    transform 0.12s ease;
  }
  .round-btn svg{width:24px;height:24px;opacity:0.85;color:var(--c-text2)}
  @media (hover:hover) and (pointer:fine){
    .round-btn:hover{background-size:210% 210%;box-shadow:0 0 3px 1px var(--c-text2);}
    .round-btn:hover svg{color:var(--c-text);}
  }
  .round-btn:active:not(:disabled){transform:scale(.95);box-shadow:0 2px 4px var(--c-border2);}
  .round-btn.active {transform: scale(0.95);box-shadow: 0 2px 4px var(--c-border2);background:var(--c-bg-panel);}
  .round-btn.active svg{color:var(--c-text);}
  .round-btn:focus-visible {outline: 2px solid var(--c-primary-l);outline-offset: 3px;}
  .recordings-day-nav:disabled{opacity:.45;cursor:not-allowed;color:var(--c-text4);}
  .recordings-day-nav:disabled:hover{background-size:0 0;box-shadow:0 0 3px 1px var(--c-text4);}
  .recordings-day-nav:disabled:hover svg{color:var(--c-text4);}
  @media (hover:none){
    .recordings-day-nav:hover:not(:disabled){background-size:0 0;box-shadow:0 0 3px 1px var(--c-text4);}
    .recordings-day-nav:hover:not(:disabled) svg{color:var(--c-text2);}
    .recordings-day-nav:active:not(:disabled){transform:scale(.95);box-shadow:0 2px 4px var(--c-border2);background:var(--c-bg-panel);}
    .recordings-day-nav:active:not(:disabled) svg{color:var(--c-text);}
  }

  .newtoast{font-size:0.75rem;font-weight:700;color:var(--c-on);}
  .empty{text-align:center;padding:16px;color:var(--c-text3);font-size:0.9rem;line-height:1.5;}
  .end{position:relative;display:flex;min-height:0;align-items:center;justify-content:center;font-size:0.85rem;color:var(--c-text2);padding:6px;}

  /* ── feed area ── */
    .feed-area{position:relative;width:100%;}
    #eng-wrap{background:var(--c-bg-deep);position:relative;width:100%;aspect-ratio:16/9;overflow:hidden;max-height:var(--view-height,none);z-index:0;isolation:isolate;}
    #eng-wrap.live-resize-eligible{aspect-ratio:var(--live-view-aspect-ratio,16/9);}
    .live-resize-grip{position:absolute;left:50%;bottom:0;z-index:9;width:224px;height:44px;padding:0;border:0;border-radius:0;transform:translateX(-50%);display:flex;align-items:flex-end;justify-content:center;color:var(--c-text);background:transparent;box-shadow:none;opacity:.38;cursor:ns-resize;touch-action:none;-webkit-tap-highlight-color:transparent;transition:opacity .14s ease;}
    .live-resize-grip::before{content:"";position:absolute;left:50%;bottom:2px;width:128px;height:12px;transform:translateX(-50%);border:1px solid color-mix(in srgb,var(--c-text) 22%,transparent);border-radius:8px;background:color-mix(in srgb,var(--c-bg-panel) 58%,transparent);box-shadow:0 2px 6px color-mix(in srgb,var(--c-bg-deep) 28%,transparent);}
    .live-resize-grip svg{position:relative;z-index:1;width:14px;height:14px;margin-bottom:1px;fill:currentColor;pointer-events:none;}
    .live-resize-grip:hover,.live-resize-grip:focus-visible,#eng-wrap.live-resizing .live-resize-grip{opacity:.86;}
    .live-resize-grip:focus-visible{outline:2px solid var(--c-accent);outline-offset:-2px;}
    .live-resize-grip[hidden]{display:none !important;}
    #eng-wrap.live-resizing{user-select:none;}
    #engine,#stream-fallback{transition:opacity .22s ease;}
    #eng-wrap::before{content:"";position:absolute;border-radius:inherit;pointer-events:none;z-index:5;}
    #eng-wrap.slideshow-switching #engine,
    #eng-wrap.slideshow-switching #stream-fallback{opacity:.12;}
    #eng-wrap.slideshow-alert::before{border-width:3px;border-color:var(--error-color, var(--c-bg-alert));}
    #eng-wrap.slideshow-detection::before{border-width:3px;border-color:var(--c-bg-detect, var(--warning-color));}
    #eng-wrap.popup-covered::after{content:"";position:absolute;inset:0;background:var(--c-bg-deep);z-index:4;pointer-events:none;}
    .card.mobile-rotate-live,
    .card.mobile-rotate-live-exit{overflow:hidden;height:var(--rotate-vh);max-height:var(--rotate-vh);}
    .card.mobile-rotate-live #live-stage,
    .card.mobile-rotate-live-exit #live-stage{position:fixed;top:var(--rotate-oy);left:var(--rotate-ox);z-index:1400;width:var(--rotate-vw);height:var(--rotate-vh);max-width:none;max-height:none;border-radius:0;background:#000;box-shadow:none;transform:none;}
    .card.mobile-rotate-live #eng-wrap,
    .card.mobile-rotate-live-exit #eng-wrap{width:100%;height:100%;max-height:none;aspect-ratio:auto;border-radius:0;}
    .card.mobile-rotate-live .live-resize-grip,
    .card.mobile-rotate-live-exit .live-resize-grip{display:none !important;}
    .card.mobile-rotate-live #engine,
    .card.mobile-rotate-live-exit #engine{position:absolute;inset:0;}
    .card.mobile-rotate-live #engine > *,
    .card.mobile-rotate-live-exit #engine > *{position:absolute;inset:0;width:100% !important;height:100% !important;max-width:none !important;max-height:none !important;}
    .card.mobile-rotate-live #engine video,
    .card.mobile-rotate-live-exit #engine video,
    .card.mobile-rotate-live #stream-fallback img,
    .card.mobile-rotate-live-exit #stream-fallback img{object-fit:contain !important;object-position:center center !important;}
    .card.mobile-rotate-live #stream-fallback[hidden],
    .card.mobile-rotate-live-exit #stream-fallback[hidden]{display:none !important;}
    .card.mobile-rotate-live #live-stage{animation:liveOverlayIn .32s cubic-bezier(.22,.61,.36,1) both;}
    .card.mobile-rotate-live-exit #live-stage{animation:liveOverlayOut .3s cubic-bezier(.22,.61,.36,1) both;}
    .card.mobile-rotate-live .stream-loading,
    .card.mobile-rotate-live-exit .stream-loading{display:none !important;}
    .card.mobile-rotate-live .live-playback-controls,
    .card.mobile-rotate-live-exit .live-playback-controls{z-index:7;}
    .card.mobile-rotate-popup,
    .card.mobile-rotate-popup-exit{overflow:hidden;height:var(--rotate-vh);max-height:var(--rotate-vh);}
    .card.mobile-rotate-popup #myPopup,
    .card.mobile-rotate-popup-exit #myPopup{position:fixed;top:var(--rotate-oy);left:var(--rotate-ox);right:auto;bottom:auto;width:var(--rotate-vw);max-width:none;height:var(--rotate-vh);max-height:var(--rotate-vh);min-height:var(--rotate-vh);margin:0;z-index:1400;transform:translateY(0) !important;border-radius:0;background:var(--c-bg-deep);}
    .card.mobile-rotate-popup #myPopup{animation:popupOverlayIn .28s ease both;}
    .card.mobile-rotate-popup-exit #myPopup{animation:popupOverlayOut .24s ease both;}
    .card.mobile-rotate-popup .popup-header,
    .card.mobile-rotate-popup-exit .popup-header{display:none;}
    .card.mobile-rotate-popup .popup-body,
    .card.mobile-rotate-popup-exit .popup-body{padding:0;gap:0;overflow:hidden;}
    .card.mobile-rotate-popup #viewer,
    .card.mobile-rotate-popup-exit #viewer{width:100%;height:100%;max-width:none;max-height:none;min-height:100%;aspect-ratio:auto;border-radius:0;}
    .card.mobile-rotate-popup #viewer video,
    .card.mobile-rotate-popup-exit #viewer video,
    .card.mobile-rotate-popup #viewer img.snap,
    .card.mobile-rotate-popup-exit #viewer img.snap{object-fit:contain;object-position:center center;background:#000;}
    .card.mobile-rotate-popup .popup-close-row,
    .card.mobile-rotate-popup-exit .popup-close-row{display:none !important;}
    .card.mobile-rotate-popup #popup-info,
    .card.mobile-rotate-popup #recording-scrub,
    .card.mobile-rotate-popup #recording-segment-manager,
    .card.mobile-rotate-popup #popup-carousel-wrap,
    .card.mobile-rotate-popup #popup-shell-ver,
    .card.mobile-rotate-popup-exit #popup-info,
    .card.mobile-rotate-popup-exit #recording-scrub,
    .card.mobile-rotate-popup-exit #recording-segment-manager,
    .card.mobile-rotate-popup-exit #popup-carousel-wrap,
    .card.mobile-rotate-popup-exit #popup-shell-ver{display:none !important;}
  #stream-fallback{position:absolute;inset:0;z-index:2;background:var(--c-bg-deep);
    pointer-events:none;line-height:0;}
  #stream-fallback[hidden]{display:block;z-index:0;}
  #stream-fallback img{width:100%;height:100%;max-width:none;max-height:none;object-fit:contain;object-position:center center;display:block;background:var(--c-bg-deep);}
  #stream-fallback::after{content:none;}
  #engine{position:absolute;inset:0;z-index:1;min-height:0;flex-shrink:0;}
  #engine video{width:100%;height:100%;display:block;object-fit:contain;var(--c-bg-deep);}
  #engine ha-camera-stream,#engine ha-hls-player,#engine webrtc-camera{width:100%;height:100%;display:block;}
  #grid-engine{position:absolute;inset:0;z-index:6;min-height:0;background:var(--c-bg-deep);}
  #grid-engine[hidden]{display:none;}
  .stream-fallback-status{position:absolute;left:8px;bottom:8px;z-index:3;display:flex;align-items:center;gap:6px;padding:4.8px 9.6px;border-radius:999px;background:var(--c-text2);border:1px solid var(--c-bg-panel);color:var(--c-text-rev);font-size:0.825rem;font-weight:600;line-height:1;backdrop-filter:blur(2px);}
  .stream-fallback-status[hidden]{display:none;}
  .stream-loading{position:absolute;top:8px;right:8px;display:flex;align-items:center;gap:6px;padding:4.8px 9.6px;border-radius:999px;background:rgba(0,0,0,.55);border:1px solid rgba(255,255,255,.2);color:var(--c-text-rev);font-size:0.825rem;font-weight:600;line-height:1;z-index:3;backdrop-filter:blur(2px);}
  .stream-loading[hidden]{display:none;}
  .stream-loading .dot{width:10px;height:10px;border:2px solid rgba(255,255,255,.3);border-top-color:var(--c-text-rev);border-radius:50%;animation:spin .9s linear infinite;}

  .glass-btn{  display: inline-flex; 
    align-items: center; 
    justify-content: center; 
    padding: 3px; 
    border-radius: 999rem; 
    color: black; 
    font-size: 1.0rem; 
    cursor:pointer;
    transform: rotate(0.01deg);
    backface-visibility: hidden;
    overflow: hidden;
    background-clip: padding-box;  
    background: rgba(255, 255, 255, 0.15);
    backdrop-filter: blur(2px) saturate(180%);
    border: none; 
    box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.8); 
    box-shadow: 0 8px 32px rgba(31, 38, 135, 0.2), 
    inset 0 4px 20px rgba(255, 255, 255, 0.3); 
  }
  .glass-btn::after {  content: ""; /* Added missing quotes */
    position: absolute; 
    top: 0; 
    left: 0; 
    width: 100%; 
    height: 100%;
    opacity: 0.4; 
    z-index: -1;  
    border-radius: 999rem;
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(1px);
    box-shadow: inset -10px -8px 0px -11px rgba(255, 255, 255, 1),
                inset 0px -9px 0px -8px rgba(255, 255, 255, 1);
    filter: blur(1px) drop-shadow(10px 4px 6px black) brightness(115%);
    }
  .glass-btn:hover{background:rgba(255, 255, 255, 0.3);} 
  .glass-btn svg{width:30px;height:30px;opacity: 0.8;pointer-events: none;}
  .glass-btn:hover svg{width:30px;height:30px;opacity: 0.95; }

  .square-btn{
    display: inline-grid;
    place-items: center;
    width: 36px;
    height: 36px;
    padding: 0;
    color: var(--c-text-rev);
    background: rgb(20 20 20 / 80%);
    border: 1px solid rgb(255 255 255 / 15%);
    border-radius: 4px;
    cursor: pointer;
    appearance: none;
    transition:
      background-color 120ms ease,
      border-color 120ms ease,
      transform 80ms ease;
    }
  .square-btn:hover{background: rgb(45 45 45 / 95%);border-color: rgb(255 255 255 / 45%);}
  .square-btn svg{width: 24px;height: 24px;fill: currentColor;pointer-events: none;}
  .live-playback-controls,.popup-playback-controls{position:absolute;top:50%;right:clamp(.75rem,2vw,1.125rem);bottom:auto;z-index:7;display:flex;flex-direction:column;gap:.5rem;opacity:0;pointer-events:none;transform:translateY(-50%);transition:opacity .16s ease;}
  .live-playback-controls > button,.popup-playback-controls > button{position:relative;inset:auto;width:36px;height:36px;flex:0 0 36px;opacity:1;}

  .live-pip-btn[hidden],.live-fs-btn[hidden],.live-take-snapshot-btn[hidden],.mute-btn[hidden],.popup-playback-btn[hidden],.popup-media-btn[hidden]{display:none !important;}


  .sv.stream-type{text-transform:uppercase;font-size:0.95rem;}
  .btn-primary{background:var(--editor-primary);color:var(--text-primary-color);border-radius:999px;padding:8px 18px;}
  .btn-secondary{border:none;background:transparent;color:var(--editor-primary);font-weight:600;cursor:pointer;padding:8px 12px;}
  .cam-tab{font-size: 1rem;padding:0.25em 0.5em 0.25em 0.25em;line-height: 1.1rem;font-weight:600;white-space:nowrap;border-radius: calc(var(--fvc-border-radius, 0px) / 2);align-items: center;justify-content: center;background:var(--c-bg-cam-btn);border:1px solid var(--c-border);color:var(--c-text);cursor:pointer}
  .cam-tab:hover{color:var(--c-primary-d);}
  .cam-tab.active{background:var(--c-primary-d);color:var(--c-text-rev);}
  .cam-tab.active:hover{background:var(--c-primary-d);color:var(--c-text-rev);}
  .cam-tab svg{width:14.4px;height:14.4px;flex-shrink:0;}
  .cam-tab:hover svg{width:14.4px;height:14.4px;flex-shrink:0;} 
  .cam-dot{font-size:0.7rem;vertical-align:middle;}

  .overlay-controls::after {content: "";position: absolute;top: 0;left: 0;}
  .overlay-controls[hidden]{display:none !important;}
  .overlay-controls svg {width:30px;height:30px;opacity: 0.8; }
  .overlay-controls:hover svg {width:30px;height:30px;opacity: 0.95; }
  .popup-playback-controls .popup-playback-btn{position:relative;width:36px;height:36px;padding:3px;}
  .popup-playback-controls .square-btn svg{width:24px;height:24px;opacity:1;}
  #viewer.popup-controls-visible .popup-playback-controls{opacity:1;pointer-events:auto;}
  .slideshow-next-chip{position:absolute;top:8px;left:50%;transform:translateX(-50%);z-index:6;min-height:30px;box-sizing:border-box;display:inline-flex;align-items:center;justify-content:center;padding:4px 10px;border:1px solid var(--c-border2);border-radius:999px;background:color-mix(in srgb,var(--c-bg-panel) 88%,transparent);box-shadow:0 3px 10px rgba(0,0,0,.22);color:var(--c-text);font-size:.78rem;font-weight:700;line-height:1;cursor:default;pointer-events:none;white-space:nowrap;opacity:.95;}
  .slideshow-next-chip[hidden]{display:none !important;}
  #live-stage.live-controls-visible .live-playback-controls{opacity:1;pointer-events:auto;}
  @media (hover: hover) and (pointer: fine) {
    #viewer:hover .popup-playback-controls{opacity:1;pointer-events:auto;}
    #live-stage:hover .live-playback-controls{opacity:1;pointer-events:auto;}
  }

  .snapshot-result-bubble{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);z-index:12;min-height:30px;display:flex;align-items:center;justify-content:center;padding:6px 12px;border:1px solid currentColor;border-radius:999px;font-size:.82rem;font-weight:700;line-height:1;white-space:nowrap;pointer-events:none;box-shadow:0 6px 18px rgba(0,0,0,.3);backdrop-filter:blur(3px);}
  .snapshot-result-bubble.success{color:var(--c-on);background:rgba(74,222,128,.18);background:color-mix(in srgb,var(--c-on) 18%,rgba(15,21,40,.88));}
  .snapshot-result-bubble.failure{color:var(--c-off);background:rgba(220,49,70,.2);background:color-mix(in srgb,var(--error-color,var(--c-bg-alert)) 20%,rgba(15,21,40,.88));}
  .two-way-talk-result-bubble{position:absolute;left:50%;bottom:14px;transform:translateX(-50%);z-index:13;min-height:30px;display:flex;align-items:center;justify-content:center;padding:6px 12px;border:1px solid currentColor;border-radius:999px;font-size:.82rem;font-weight:700;line-height:1;white-space:nowrap;pointer-events:none;box-shadow:0 6px 18px rgba(0,0,0,.3);backdrop-filter:blur(3px);}
  .two-way-talk-result-bubble.success{color:var(--c-on);background:rgba(74,222,128,.18);background:color-mix(in srgb,var(--c-on) 18%,rgba(15,21,40,.88));}
  .two-way-talk-result-bubble.failure{color:var(--c-off);background:rgba(220,49,70,.2);background:color-mix(in srgb,var(--error-color,var(--c-bg-alert)) 20%,rgba(15,21,40,.88));}

  #live-stage:fullscreen .live-pip-btn,
  #live-stage:-webkit-full-screen .live-pip-btn,
  #live-stage:fullscreen .live-fs-btn,
  #live-stage:-webkit-full-screen .live-fs-btn,
  #viewer:fullscreen .popup-fs-btn,
  #viewer:-webkit-full-screen .popup-fs-btn,
  #viewer:fullscreen #popup-media-fs,
  #viewer:-webkit-full-screen #popup-media-fs,
  #viewer:fullscreen .popup-mobile-fs-btn,
  #viewer:-webkit-full-screen .popup-mobile-fs-btn{display:none !important;}
  #live-stage:fullscreen,
  #live-stage:-webkit-full-screen{display:flex;align-items:center;justify-content:center;width:100%;height:100%;background:#000;}
  #live-stage:fullscreen #eng-wrap,
  #live-stage:-webkit-full-screen #eng-wrap{width:100%;height:100%;max-height:none;aspect-ratio:auto;}
  #live-stage:fullscreen .live-resize-grip,
  #live-stage:-webkit-full-screen .live-resize-grip{display:none !important;}
  #viewer:fullscreen,
  #viewer:-webkit-full-screen{width:100%;height:100%;max-width:none;max-height:none;min-height:0;aspect-ratio:auto;border-radius:0;background:#000;}
  #viewer:fullscreen video,
  #viewer:-webkit-full-screen video{object-fit:contain;}
  #viewer:fullscreen img.snap,
  #viewer:-webkit-full-screen img.snap{cursor:default;}
  .viewer{width:min(100%,var(--popup-media-max-width,124.444dvh));aspect-ratio:var(--popup-media-aspect-ratio,16/9);min-height:0;max-height:70dvh;align-self:center;flex:0 0 auto;
    background:var(--c-bg-deep);display:flex;align-items:center;justify-content:center;z-index:2;position:relative;overflow:hidden;border-radius:7px;}
  .viewer video,.viewer img.snap{display:block;width:100%;height:100%;max-width:100%;max-height:100%;object-fit:contain;
    background:var(--c-bg-deep);}
  .viewer.popup-media-loading video{visibility:hidden;}
  .viewer.popup-media-loading::after{content:"Loading…";position:absolute;inset:0;display:flex;align-items:center;justify-content:center;color:var(--c-text2);font-size:.975rem;background:var(--c-bg-deep);}
  .viewer.popup-media-ratio-ready video,.viewer.popup-media-ratio-ready img.snap{object-fit:cover;}
  .viewer.popup-media-resized video,.viewer.popup-media-resized img.snap{object-fit:cover !important;}
  .viewer.popup-media-height-capped video,.viewer.popup-media-height-capped img.snap{object-fit:contain !important;}
  .popup-view-resize-grip{position:absolute;left:50%;bottom:2px;z-index:9;width:224px;height:44px;padding:0;border:0;border-radius:0;transform:translateX(-50%);display:flex;align-items:flex-end;justify-content:center;color:var(--c-text);background:transparent;box-shadow:none;opacity:.38;cursor:ns-resize;touch-action:none;-webkit-tap-highlight-color:transparent;transition:opacity .14s ease;}
  .popup-view-resize-grip::before{content:"";position:absolute;left:50%;bottom:2px;width:128px;height:12px;transform:translateX(-50%);border:1px solid color-mix(in srgb,var(--c-text) 22%,transparent);border-radius:8px;background:color-mix(in srgb,var(--c-bg-panel) 58%,transparent);box-shadow:0 2px 6px color-mix(in srgb,var(--c-bg-deep) 28%,transparent);}
  .popup-view-resize-grip::after{content:"↕";position:relative;z-index:1;margin-bottom:0;color:currentColor;font-size:12px;line-height:14px;pointer-events:none;}
  .popup-view-resize-grip:hover,.popup-view-resize-grip:focus-visible,.viewer.popup-view-resizing .popup-view-resize-grip{opacity:.86;}
  .popup-view-resize-grip:focus-visible{outline:2px solid var(--c-accent);outline-offset:-2px;}
  .popup-view-resize-grip[hidden]{display:none !important;}
  .popup-view-resize-grip.popup-view-resize-grip--metadata{position:absolute;left:min(50%,calc(100% - 68px));top:50%;bottom:auto;z-index:1;width:128px;height:28px;flex:none;margin:0;transform:translate(-50%,-50%);align-items:center;opacity:.52;}
  .popup-view-resize-grip.popup-view-resize-grip--metadata::before{bottom:50%;width:88px;height:9.2px;transform:translate(-50%,50%);}
  .popup-view-resize-grip.popup-view-resize-grip--metadata::after{margin-bottom:0;}
  .viewer.popup-view-resizing{user-select:none;}
  .viewer img.snap{cursor:zoom-in;touch-action:manipulation;user-select:none;-webkit-user-drag:none;}
  .viewer .ld{color:var(--c-text2);font-size:0.975rem;}
  .popup-media-fallback-notice{position:absolute;left:50%;top:12px;transform:translateX(-50%);z-index:6;width:max-content;max-width:calc(100% - 24px);display:flex;flex-direction:column;gap:2px;box-sizing:border-box;padding:7px 10px;border:1px solid var(--c-border2);border-radius:8px;background:var(--c-bg-panel);color:var(--c-text);box-shadow:var(--fvc-shadow-m);text-align:center;pointer-events:none;}
  .popup-media-fallback-notice strong{font-size:.82rem;line-height:1.2;}
  .popup-media-fallback-notice span{font-size:.7rem;line-height:1.25;color:var(--c-text2);}
  .popup-media-unavailable{width:100%;min-height:180px;align-self:stretch;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:7px;box-sizing:border-box;padding:24px;position:relative;text-align:center;color:var(--c-text);background:var(--c-bg-deep);}
  .popup-media-unavailable::before{content:"!";display:grid;place-items:center;width:34px;height:34px;border:1px solid var(--c-border2);border-radius:50%;background:var(--c-bg-panel);color:var(--c-text2);font-size:1.05rem;font-weight:800;}
  .popup-media-unavailable strong{font-size:1rem;line-height:1.25;}
  .popup-media-unavailable span{max-width:560px;color:var(--c-text2);font-size:.8rem;line-height:1.4;}
  .ph{width:100%;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1px;color:var(--c-text2);background:linear-gradient(145deg,#1a2540,#0d1520);}
  .ph svg{width:40px;height:40px;opacity:.35;}
  .live-grid{width:100%;height:100%;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));grid-template-rows:repeat(2,minmax(0,1fr));gap:6px;padding:6px;box-sizing:border-box;}
  .live-grid-cell{position:relative;border:1px solid var(--c-text3) !important;box-sizing:border-box;background:var(--c-bg-deep);border-radius:calc(var(--fvc-border-radius, 0px) / 2) !important;overflow:hidden;}
  .live-grid-cell.grid-alert{border-color:var(--c-bg-alert, var(--error-color));box-shadow:inset 0 0 0 1px varvar(--c-bg-alert, var(--error-color));cursor:pointer;}
  .live-grid-cell.grid-detection{border-color:var(--c-bg-detect,var(--warning-color));box-shadow:inset 0 0 0 1px var(--c-bg-detect,var(--warning-color));}
  .live-grid-cell.empty{display:flex;align-items:center;justify-content:center;cursor:default;}
  .live-grid-cell.empty .ph{border-radius:7px;}
  .live-grid-cell video,.live-grid-cell img,.live-grid-cell ha-camera-stream{width:100%;height:100%;display:block;object-fit:contain;object-position:center center;background:var(--c-bg-deep);}
  .live-grid-label{position:absolute;left:6px;top:6px;z-index:2;padding:2px 6px;border-radius:999px;background:rgba(0,0,0,.55);border:1px solid rgba(255,255,255,.2);color:var(--c-text-rev);font-size:.68rem;line-height:1.2;pointer-events:none;text-transform:none;}
  .preview-shell,.preview-shell-header,.preview-shell-footer{display:none;}
  .card.preview-active{width:100%;max-width:none;margin:0;}
  .card.preview-active .layout{display:flex;flex-direction:column;width:100%;min-width:0;height:var(--view-height,100dvh);max-height:var(--view-height,100dvh);overflow:hidden !important;}
  .card.preview-active .col-left,.card.preview-active .resize-handle,.card.preview-active .col-right{display:none;}
  .card.preview-active.mobile-client .col-left{display:block !important;position:absolute !important;left:-9999px !important;top:0 !important;width:1px !important;height:1px !important;min-width:1px !important;min-height:1px !important;overflow:hidden !important;opacity:0 !important;pointer-events:none !important;}
  .card.preview-active.mobile-client .resize-handle,.card.preview-active.mobile-client .col-right{display:none !important;}

  .card.preview-active .preview-shell-header{display:flex;flex:0 0 auto;align-items:center;justify-content:space-between;gap:10px;padding:10px 12px;}


  .preview-shell-brand{min-width:0;display:flex;align-items:center;}
  .preview-shell-header-logo{display:flex;align-items:center;max-width:min(46vw,170px);}
  .preview-shell-header-logo svg{width:100%;height:auto;max-height:24px;}
  .preview-shell-header-logo[hidden],.preview-shell-title[hidden],.preview-shell-footer[hidden]{display:none !important;}
  .preview-shell-title{min-width:0;display:flex;flex-direction:column;gap:2px;}
  .preview-shell-title-main{font-size:1.05rem;font-weight:700;color:var(--c-text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
  .preview-shell-title-sub{font-size:.78rem;color:var(--c-text2);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
  .card.preview-active .preview-shell{display:block;flex:1 1 auto;width:100%;min-width:0;min-height:0;padding:10px;box-sizing:border-box;overflow-y:auto;overscroll-behavior:contain;-webkit-overflow-scrolling:touch;touch-action:pan-y;}
  .card.preview-active .preview-shell-footer{display:grid;grid-template-columns:minmax(0,1fr) auto;flex:0 0 var(--fvc-footer-height);align-items:center;height:var(--fvc-footer-height);min-height:var(--fvc-footer-height);padding:4px 8px;border-top:1px solid var(--c-border);box-sizing:border-box;}
  .preview-shell-footer .frigate-view{position:static;max-height:24px;}
  .preview-shell-footer .frigate-view svg{height:24px;}
  .preview-grid {display: grid;gap: 10px;width: 100%;max-width: 100%;
    grid-template-columns: repeat(auto-fit,minmax(max(min(100%, 420px), calc(33.333% - 10px)),1fr));
  }
  .preview-grid > div {min-width: 0;}

  .preview-cell{display:flex;flex-direction:column;cursor:pointer;-webkit-backface-visibility: hidden;backface-visibility: hidden;border-radius:var(--fvc-border-radius);container-type:inline-size;container-name:preview-cell;}
  .preview-media-frame{position:relative;flex:0 0 auto;min-width:0;}
  .preview-media-host{position:relative;aspect-ratio:16/9;overflow:hidden;border-radius:var(--fvc-border-radius);background:var(--c-bg-deep);-webkit-backface-visibility: hidden;backface-visibility: hidden;
    transform: translateZ(0);}
  .preview-media-host::after{content:"";position:absolute;inset:0;pointer-events:none;border:0 solid transparent;border-radius:inherit;box-sizing:border-box;z-index:3;}
  .preview-media-host.grid-alert{border-color:var(--c-bg-alert, var(--error-color));box-shadow:inset 0 0 0 2px var(--c-bg-alert, var(--error-color));}
  .preview-media-host.grid-alert::after{border-width:2px;border-color:var(--c-bg-alert, var(--error-color));}
  .preview-media-host.grid-detection{border-color:var(--c-bg-detect, var(--warning-color));box-shadow:inset 0 0 0 2px var(--c-bg-detect, var(--warning-color));}
  .preview-media-host.grid-detection::after{border-width:2px;border-color:var(--c-bg-detect, var(--warning-color));}
  .preview-media-host video,.preview-media-host img,.preview-media-host ha-camera-stream{width:100%;height:100%;display:block;object-fit:contain;object-position:center center;background:var(--c-bg-deep);}
  .preview-media-host > .preview-live-placeholder,.preview-media-host > .preview-live-layer,
  .live-grid-cell > .preview-live-placeholder,.live-grid-cell > .preview-live-layer{position:absolute;inset:0;width:100%;height:100%;}
  .preview-media-host > .preview-live-placeholder,.live-grid-cell > .preview-live-placeholder{z-index:1;}
  .preview-media-host > .preview-live-layer,.live-grid-cell > .preview-live-layer{z-index:2;opacity:0;transition:opacity .16s ease;}
  .preview-media-host > .preview-live-layer.is-ready,.live-grid-cell > .preview-live-layer.is-ready{opacity:1;}
  .preview-meta{display:grid;grid-template-columns:minmax(0,1fr) auto;grid-template-areas:"name status" "source alerts";gap:2px 8px;align-items:center;padding:6px 8px;background:var(--c-bg-main);
    border-radius:var(--fvc-border-radius);}
  .preview-meta--with-light{grid-template-columns:minmax(0,1fr) minmax(40px,.5fr) auto;grid-template-areas:"name light status" "source light alerts";}
  .preview-meta-name{grid-area:name;font-size:.82rem;font-weight:700;color:var(--c-text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
  .preview-meta-source{grid-area:source;font-size:.7rem;color:var(--c-text2);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
  .preview-meta-alerts{grid-area:alerts;justify-self:end;font-size:.72rem;color:var(--c-text2);}
  .preview-meta-status{grid-area:status;justify-self:end;font-size:.72rem;color:var(--c-text2);display:inline-flex;align-items:center;gap:5px;}
  .preview-meta-status .dot{font-size:.82rem;line-height:1;}
  .preview-grid .preview-meta{padding:5px 8px;}
  .preview-grid :is(.preview-meta-name,.preview-meta-source,.preview-meta-alerts,.preview-meta-status){line-height:1.18;}
  .preview-meta-light{display:contents;}
  .preview-meta-light .linked-light-position-slot{grid-area:light;align-self:center;}
  .preview-meta-light .linked-light-position-slot[data-linked-light-position-slot="left"]{justify-self:start;}
  .preview-meta-light .linked-light-position-slot[data-linked-light-position-slot="right"]{justify-self:end;}
  .preview-meta-light .linked-light-button,.preview-light-overlay .linked-light-button{width:30px;height:30px;min-width:30px;min-height:30px;}
  .preview-light-overlay{position:absolute;z-index:5;top:7px;right:7px;left:7px;display:flex;align-items:flex-start;justify-content:space-between;pointer-events:none;}
  .preview-light-overlay .linked-light-position-slot{pointer-events:auto;}
  .preview-light-overlay .linked-light-dimmer{top:calc(100% + 8px);bottom:auto;}
  .preview-cam-buttons{display:flex;flex-wrap:wrap;gap:6px;padding: 10px 0px}
  .preview-cam-btn{}
  .card .layout--wide-view{flex:1 1 0;height:auto;min-height:0;}
  .card .col-left--wide-view{height:100%;max-height:100%;overflow:hidden;}
  .wide-companion-panel{display:flex;flex:1 1 0;flex-direction:column;gap:6px;min-width:0;min-height:0;padding:0px 10px;box-sizing:border-box;overflow:hidden;}
  .wide-companion-title{font-size:.9rem;font-weight:700;color:var(--c-text);letter-spacing:.02em;}
  .wide-companion-grid{flex:1 1 0;min-height:0;width:100%;height:100%;overflow:hidden;align-content:start;justify-content:stretch;gap:8px;grid-template-columns:repeat(var(--wide-companion-columns,1),minmax(0,1fr));grid-auto-rows:auto;}
  .wide-companion-cell{height:auto;min-height:0;overflow:hidden;border-radius:calc(var(--fvc-border-radius,0px) / 2);}
  .wide-companion-media-host{flex:0 0 auto;min-height:0;aspect-ratio:16/9;border-radius:calc(var(--fvc-border-radius,0px) / 2);}
  .wide-companion-meta{display:flex;flex:0 0 auto;align-items:center;justify-content:space-between;gap:6px;min-height:24px;padding:3px 6px;border-radius:calc(var(--fvc-border-radius,0px) / 2);box-sizing:border-box;}
  @container preview-cell (max-width: 240px){
    .preview-meta{grid-template-columns:minmax(0,1fr);grid-template-areas:"name" "status" "source" "alerts";gap:2px;}
    .preview-meta--with-light{grid-template-areas:"name" "light" "status" "source" "alerts";}
    .preview-meta-status,.preview-meta-alerts{justify-self:start;}
  }
  .ph-spin{width:24px;height:24px;border:3px solid rgba(255,255,255,.1);border-top-color:var(--c-accent);border-radius:50%;animation:spin .8s linear infinite;}
  @keyframes spin{to{transform:rotate(360deg);}}
    @keyframes liveOverlayIn{
      from{top:var(--rotate-live-from-y,var(--rotate-oy));left:var(--rotate-live-from-x,var(--rotate-ox));width:var(--rotate-live-from-w,var(--rotate-vw));height:var(--rotate-live-from-h,var(--rotate-vh));border-radius:var(--fvc-border-radius,0);}
      to{top:var(--rotate-oy);left:var(--rotate-ox);width:var(--rotate-vw);height:var(--rotate-vh);border-radius:0;}
    }
    @keyframes liveOverlayOut{
      from{top:var(--rotate-oy);left:var(--rotate-ox);width:var(--rotate-vw);height:var(--rotate-vh);border-radius:0;}
      to{top:var(--rotate-live-to-y,var(--rotate-oy));left:var(--rotate-live-to-x,var(--rotate-ox));width:var(--rotate-live-to-w,var(--rotate-vw));height:var(--rotate-live-to-h,var(--rotate-vh));border-radius:var(--fvc-border-radius,0);}
    }
    @keyframes popupOverlayIn{from{opacity:.9;}to{opacity:1;}}
    @keyframes popupOverlayOut{from{opacity:1;}to{opacity:.92;}}


  /* ── info row ── */
  .info-row{display:grid;grid-template-columns: repeat(3, 1fr);padding:3px 10px 0px;align-items: center;}
  .info-left{display:flex;align-items:center;justify-content:flex-start;gap:14px;min-width:0;text-align:left;}
  .info-copy{display:flex;flex-direction:column;min-width:0;}
  .info-copy :is(.info-title,.section-label){overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
  .info-alert-stat{flex:0 0 auto;align-items:center;}
  .info-row-action-slot{text-align: center;align-self: stretch; display: flex; align-items: center; justify-content: center;}
  .two-way-talk-control-row{display:grid;grid-template-columns:40px;align-items:center;justify-content:center;justify-items:center;gap:6px;}
  .two-way-talk-control-row.has-inline-mute{grid-template-columns:40px 40px 40px;}
  .two-way-talk-control-row .info-row-mic-btn{grid-column:1;}
  .two-way-talk-control-row.has-inline-mute .info-row-mic-btn{grid-column:2;}
  .two-way-talk-control-row .two-way-talk-microphone-mute-btn{grid-column:1;}
  .two-way-talk-control-row .two-way-talk-inline-mute-btn{grid-column:3;}
  .info-row-page-nav{display:flex;justify-content:center;align-items:center;flex:1 1 240px;padding:0 12px;min-width:0;}
  .info-row-page-nav .page-nav{padding:0;justify-content:center;width:100%;}
  .page-nav{display:flex;align-items:center;justify-content:center;gap:4px;padding:0;}
  .page-nav-btn{border-radius:6px;}
  .page-nav-btn.active svg{color:var(--c-text-rev);opacity:1;}

  .info-row-mic-btn{}
  .info-row-mic-btn[hidden] {display: none !important;}
  .info-row-mic-btn svg{width:24px;height:24px;}
  .info-row-mic-btn:hover{border-color:var(--c-primary-d);color:var(--c-primary-d);}
  .info-row-mic-btn.active{background:rgba(74,222,128,.16);border-color:rgba(74,222,128,.45);color:#4ade80;box-shadow: inset 0 0 0 1px rgba(74, 222, 128, 0.15), 0 0 6px 1px var(--c-border2);}
  .info-row-mic-btn.active svg{opacity:1;}
  .info-row-mic-btn.active.microphone-muted{background:var(--c-accent);border-color:var(--c-accent);color:var(--c-text-rev);box-shadow:0 0 6px 1px var(--c-border2);}
  .info-row-mic-btn.active.microphone-muted svg{color:var(--c-text-rev);opacity:1;}
  @media (hover:none), (pointer:coarse){
    .info-row-mic-btn:not(.active):hover{background-size:0 0;background-color:var(--c-bg-main);box-shadow:0 0 3px 1px var(--c-text4);color:var(--c-text2);}
    .info-row-mic-btn:not(.active):hover svg{color:var(--c-text2);}
    .two-way-talk-microphone-mute-btn:not(.active):hover,.two-way-talk-microphone-mute-btn:not(.active):active{background:transparent;box-shadow:none;color:var(--c-text2);}
    .two-way-talk-microphone-mute-btn:not(.active):hover svg,.two-way-talk-microphone-mute-btn:not(.active):active svg{color:var(--c-text2);}
  }
  .info-title{font-size:1.05rem;font-weight:700;color:var(--c-text);}
  .stats{display:flex;gap:10px;text-align:right;justify-content: end;align-items: center;} 
  .stat{display:flex;flex-direction:column;align-items:flex-end;}
  .sv{font-size:1.05rem;font-weight:700;color:var(--c-primary-d);} .sl{font-size:0.75rem;color:var(--c-text2);text-transform:uppercase;letter-spacing:.06em;}
  
  /* ── camera switcher ── */

  .cam-switcher {
    display: flex;
    align-items: center;
    gap: 4px;
    flex-wrap: wrap;
    width: 100%;
    min-width: 0;
    max-width: 100%;
    box-sizing: border-box;
    padding: 6px 12px;
  }

  .card.mobile-client:not(.mobile-view-active) .cam-switcher {
    flex-wrap: nowrap;
    overflow-x: auto;
    overflow-y: hidden;
    white-space: nowrap;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
    -ms-overflow-style: none;
  }
  .card.mobile-client:not(.mobile-view-active) .cam-switcher::-webkit-scrollbar {
    display: none;
  }
  .card.mobile-client:not(.mobile-view-active) .cam-switcher > * {
    flex: 0 0 auto;
  }

  /* ── timeline ── */
  .tl-tools{position:relative;display:flex;gap:4px;}
  .tl-tools-slot{display:flex;align-items:center;justify-content:flex-end;min-width:0;}
  .tool{display:inline-flex;gap:4px;align-items:center;justify-content:center;background:var(--c-bg);border:1px solid var(--c-border2);color:var(--c-text2);border-radius: calc(var(--fvc-border-radius, 0px) / 2);cursor:pointer;padding:2px;transition: all 0.2s ease;min-height:36px;min-width:36px;}
  .tool svg{width:24px;height:24px;opacity:0.85;color:var(--c-text2)}
  .tool ha-icon{width:24px;height:24px;--mdc-icon-size:24px;color:var(--c-text2);opacity:0.85;}
  .tool:hover{color:var(--c-primary-d);border-color:var(--c-primary-d);opacity:1;}
  .tool:hover svg{color:var(--c-primary-d);}
  .tool:hover ha-icon{color:var(--c-primary-d);opacity:1;}
  .tool.active{background:var(--c-primary-d);color:var(--c-text-rev);border-color:var(--c-primary-d);}
  .tool.active svg{color:var(--c-text-rev);opacity:1;}
  .tool.active ha-icon{color:var(--c-text-rev);opacity:1;}
  .tool:disabled{opacity:.45;cursor:not-allowed;color:var(--c-text4);border-color:var(--c-border2);}
  .tool:disabled:hover{color:var(--c-text4);border-color:var(--c-border2);}
  .ico{min-width:30px !important;min-height:30px !important;width:30px !important;height:30px !important;background:var(--c-bg-panel);}
  .ico svg{width:24px;height:24px;} .ico:hover{color:var(--c-primary-d);border-color:var(--c-primary-d);}
  .ico.fav.on{color:var(--c-accent);border-color:rgba(251,191,36,.4);background:rgba(251,191,36,.12);}
  @media (hover:none), (pointer:coarse) {
    .tool#controls-btn:not(.active):hover{background:var(--c-bg);color:var(--c-text2);border-color:var(--c-border2);opacity:1;}
    .tool#controls-btn:not(.active):hover svg{color:var(--c-text2);}
    .icon-btn#controls-btn:not(.active):hover{background:transparent;color:var(--c-text2);}
    .icon-btn#controls-btn:not(.active):hover svg{color:var(--c-text2);}
  }
  @container (max-width: 640px){
    .button-holder{grid-template-columns:minmax(0,1fr) auto;grid-template-areas:"nav nav" "tabs tools";gap:8px;padding:6px 8px;}
    .button-holder .page-nav-row{justify-content:center;}
    .button-holder .tabs-row{justify-content:flex-start;}
    .button-holder .tools-row{justify-content:flex-end;}
  }
  @container (max-width: 500px){
    .button-holder{grid-template-columns:minmax(0,1fr);grid-template-areas:"nav" "tools" "tabs";gap:6px;padding:6px 8px;}
    .button-holder .tabs-row,.button-holder .tools-row,.button-holder .page-nav-row{justify-content:center;}
    .button-holder .tabs{justify-content:center;}
    .button-holder .tl-tools-slot{justify-content:center;}
  }
  @container (max-width: 720px){
    .button-holder--responsive-toolbar{display:flex;flex-wrap:wrap;justify-content:center;column-gap:8px;row-gap:6px;padding:6px 8px;}
    .button-holder--responsive-toolbar .page-nav-row{order:1;flex:0 0 auto;justify-content:center;}
    .button-holder--responsive-toolbar .tools-row{order:2;flex:0 0 auto;justify-content:center;}
    .button-holder--responsive-toolbar .tabs-row{order:3;flex:1 0 100%;justify-content:center;}
    .button-holder--responsive-toolbar .tabs{justify-content:center;}
    .button-holder--responsive-toolbar .tl-tools-slot{justify-content:center;}
  }
  @media (max-width: 920px){
    .tabs-holder{container-type:inline-size;}
  }
  .divider {min-height:36px;width:8px;display:flex;align-items:center;justify-content:center;}
  .divider svg {height:24px;width:8px;opacity:0.85;color:var(--c-text4);}
  .tools-row .page-tools-divider{display:none;position:absolute;right:100%;top:50%;transform:translateY(-50%);}
  .button-holder--responsive-toolbar.page-tools-adjacent .tools-row .page-tools-divider{display:flex;}
  .tl-tools > button[hidden] + .divider{display:none;}

  /* ── filter + cal ── */
  .filter-panel,.cal-panel{display: none;position: absolute;top:100%;right:0;background-color: var(--c-bg-main);min-width: 300px;overflow: auto;border-top: 3px solid var(--c-primary);z-index: 3;padding:20px;}
  @media (max-width:600px){
    .card.mobile-client .layout--single-view .button-holder--responsive-toolbar{position:relative;}
    .card.mobile-client .layout--single-view .button-holder--responsive-toolbar .tools-row,
    .card.mobile-client .layout--single-view .button-holder--responsive-toolbar .tl-tools{position:static;}
    .card.mobile-client .layout--single-view .filter-panel,
    .card.mobile-client .layout--single-view .cal-panel{top:100%;right:8px;width:calc(100% - 16px);min-width:0;max-width:none;padding:12px;box-sizing:border-box;}
  }
  .frow{display:grid;grid-template-columns:38px minmax(0,1fr);align-items:start;column-gap:5px;margin-bottom:4px;} .frow:last-child{margin-bottom:0;} .frow-l{font-size:0.75rem;color:var(--c-text3);text-transform:uppercase;padding-top:4px;} .frow-chips{display:flex;align-items:center;gap:5px;flex-wrap:wrap;min-width:0;}
  .chip{background:var(--c-bg-panel);border:1px solid var(--c-border2);color:var(--c-text2);border-radius:10px;padding:3.6px 10.8px;font-size:0.825rem;cursor:pointer;}
  .chip.on{background:var(--c-primary-l);border-color:var(--c-primary-d);color:var(--c-primary-d);}
  .cal-top{display:flex;justify-content:center;margin-bottom:6px;}
  .cal-today-btn{background:var(--c-bg-panel);border:1px solid var(--c-border2);color:var(--c-text2);border-radius:8px;cursor:pointer;padding:3.6px 10.8px;font-size:0.78rem;font-weight:600;transition:all .2s ease;}
  .cal-today-btn:hover{color:var(--c-primary-d);border-color:var(--c-primary-d);background:var(--c-primary-l);}
  .cal-head{display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;} .cal-head b{font-size:0.9rem;} .cal-head button{background:none;border:none;color:var(--c-primary-d);font-size:1.275rem;cursor:pointer;padding:0 6px;}
  .cal-dow,.cal-grid{display:grid;grid-template-columns:repeat(7,1fr);gap:1px;text-align:center;}
  .cal-dow span{font-size:0.675rem;color:var(--c-text2);padding:2px 0;}
  .cday{position:relative;background:none;border:none;color:var(--c-text);font-size:0.825rem;padding:6px 0;border-radius:4px;cursor:pointer;} .cday.today{background:var(--c-bg-panel);} .cday:hover,.cday.active{background:var(--c-primary);} .cdot{position:absolute;bottom:2px;left:50%;transform:translateX(-50%);width:3px;height:3px;border-radius:50%;background:#ef4444;font-weight:600;}

  .controls-section{padding:6px 2px 0;}
  .controls-ptz-stage{display:flex;flex-direction:column;align-items:stretch;gap:4px;}
  .controls-pad-wrap{max-width:280px;margin:0px auto 4px;}
  .controls-pad-wrap.is-disabled{opacity:.45;pointer-events:none;filter:saturate(.5);}
  .controls-presets{width:min(100%,560px);margin:0 auto 4px;padding:0 2px;background:transparent;border:0;box-sizing:border-box;}
  .controls-preset-list{display:flex;justify-content:center;align-items:stretch;gap:8px;flex-wrap:wrap;}
  .controls-preset-chip{appearance:none;-webkit-appearance:none;display:inline-flex;align-items:center;justify-content:center;width:auto;max-width:100%;min-height:40px;box-sizing:border-box;padding:8px 12px;border:1px solid var(--c-border2);border-radius:10px;background:var(--c-bg-main);color:var(--c-text);font:inherit;font-size:.8rem;font-weight:600;line-height:1.25;overflow-wrap:anywhere;cursor:pointer;transition:background-color .16s ease,border-color .16s ease,color .16s ease,box-shadow .16s ease,transform .1s ease,opacity .16s ease;}
  .controls-preset-chip--camera{border-color:var(--c-border2);}
  .controls-preset-chip.is-home{border-color:var(--c-primary);box-shadow:inset 0 0 0 1px var(--c-primary);}
  .controls-preset-chip:focus-visible:not(:disabled){border-color:var(--c-primary);background:var(--c-primary-l);color:var(--c-primary-d);box-shadow:0 2px 7px rgba(0,0,0,.12);outline:2px solid var(--c-primary);outline-offset:2px;}
  @media (hover:hover) and (pointer:fine){.controls-preset-chip:hover:not(:disabled){border-color:var(--c-primary);background:var(--c-primary-l);color:var(--c-primary-d);box-shadow:0 2px 7px rgba(0,0,0,.12);outline:none;}}
  .controls-preset-chip:active:not(:disabled){transform:scale(.985);}
  .controls-preset-chip.is-activating{border-color:var(--c-primary);background:var(--c-primary-l);color:var(--c-primary-d);box-shadow:inset 0 0 0 1px var(--c-primary);}
  .controls-preset-chip:disabled{cursor:wait;opacity:.68;}
  .controls-presets-note{margin-top:6px;color:var(--c-text2);font-size:.72rem;line-height:1.25;text-align:center;}
  .controls-actions{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:10px;margin:0 0 12px;}
  .controls-action-group{background:var(--c-bg-panel);border:1px solid var(--c-border2);border-radius:10px;padding:10px;}
  .controls-action-group.is-disabled{opacity:.55;filter:saturate(.55);}
  .controls-action-group-label{font-size:0.72rem;font-weight:700;text-transform:uppercase;letter-spacing:.03em;color:var(--c-text2);margin-bottom:8px;}
  .controls-action-row{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;}
  .controls-action-btn{appearance:none;background:var(--c-bg-main);border:1px solid var(--c-border2);color:var(--c-text);border-radius:10px;padding:10px 8px;font-size:0.82rem;font-weight:700;cursor:pointer;transition:transform .12s ease,background .2s ease,border-color .2s ease,color .2s ease;}
  .controls-action-btn:hover:not(:disabled),.controls-action-btn:focus-visible:not(:disabled){border-color:var(--c-primary-d);background:var(--c-primary-l);color:var(--c-primary-d);outline:none;}
  .controls-action-btn:active:not(:disabled){transform:translateY(1px) scale(.99);}
  .controls-action-btn:disabled{cursor:not-allowed;color:var(--c-text4);background:var(--c-bg-panel);}

  .frigate-view{max-height:24px;pointer-events: none;}
  .frigate-view svg{height:24px;pointer-events: none;}
  .frigateView-accent svg{color:#ff5733;fill:#ff5733;}
  .frigateView-accent {color:#ff5733;fill:#ff5733;}
  
  .recording-scrub {display:flex;flex-direction:column;align-items:stretch;gap:6px;margin-top:10px;}
  .recording-scrub[hidden] {display:none;}
  .recording-scrub-main-row {display:grid;grid-template-columns:40px minmax(0,1fr);align-items:start;gap:7px;min-width:0;}
  .recording-scrub-play {appearance:none;-webkit-appearance:none;display:grid;place-items:center;align-self:center;width:40px;height:44px;margin:0;padding:6px;border:1px solid var(--c-border2);border-radius:10px;background:var(--c-bg-panel);color:var(--c-text2);cursor:pointer;transition:transform .12s ease,background .16s ease,border-color .16s ease,color .16s ease;}
  .recording-scrub-play svg {width:20px;height:20px;pointer-events:none;}
  .recording-scrub-play:focus-visible {border-color:var(--c-primary-d);background:var(--c-primary-l);color:var(--c-primary-d);outline:2px solid var(--c-primary-d);outline-offset:1px;}
  @media (hover:hover) and (pointer:fine){.recording-scrub-play:hover:not(:disabled){border-color:var(--c-primary-d);background:var(--c-primary-l);color:var(--c-primary-d);}}
  .recording-scrub-play:active:not(:disabled) {transform:scale(.96);}
  .recording-scrub-play:disabled {opacity:.45;cursor:not-allowed;}
  .recording-scrub-track {position:relative;width:100%;height:56px;margin-bottom:20px;border-radius:18px;background:var(--c-bg-scrub);cursor:pointer;touch-action:none;overflow:visible;}
  .recording-scrub-ticks {position:absolute;inset:0;pointer-events:none;z-index:3;}
  .recording-scrub-markers {position:absolute;inset:0;pointer-events:none;z-index:2;}
  .recording-scrub-alert {position:absolute;top:2px;bottom:2px;background:var(--c-bg-alert);border-radius:999px;min-width:8px;opacity:.95;box-shadow:0 0 0 1px var(--c-text) inset;pointer-events:auto;}
  .recording-scrub-detection {position:absolute;top:4px;bottom:4px;background:var(--c-bg-detect);border-radius:999px;min-width:4px;opacity:.95;pointer-events:auto;}
  .recording-scrub-tick {position:absolute;top:1px;bottom:1px;width:1px;background:var(--c-text3);}
  .recording-scrub-tick-label {position:absolute;top:calc(100% + 4px);left:50%;transform:translateX(-50%);padding:1px 3px;border-radius:3px;background:var(--c-bg-main);color:var(--c-text2);font-size:.62rem;font-weight:650;line-height:1;white-space:nowrap;font-variant-numeric:tabular-nums;}
  .recording-scrub-cursor {position:absolute;top:-6px;bottom:-6px;width:3px;background:rgba(255,255,255,.97);border-radius:999px;left:0;transform:translateX(-1px);pointer-events:none;box-shadow:0 0 0 1px rgba(0,0,0,.25);z-index:4;}
  .recording-scrub-preview {position:absolute;bottom:calc(100% + 8px);left:50%;width:min(200px,calc(100% - 12px));padding:4px;background:var(--c-bg-main);border:1px solid var(--c-border2);border-radius:8px;box-shadow:0 8px 24px rgba(0,0,0,.42);transform:translateX(-50%);pointer-events:none;z-index:8;box-sizing:border-box;}
  .recording-scrub-preview[hidden] {display:none;}
  .recording-scrub-preview img {display:block;width:100%;aspect-ratio:16/9;object-fit:cover;border-radius:5px;background:var(--c-bg-deep);}
  .recording-scrub-preview span {display:block;padding:4px 2px 1px;font-size:.7rem;font-weight:700;color:var(--c-text2);text-transform:none;line-height:1.2;}
  .recording-scrub-labels {display:flex;align-items:center;justify-content:space-between;gap:8px;margin-left:47px;font-size:.78rem;color:var(--c-text2);font-weight:600;line-height:1;}
  .recording-scrub-now {font-variant-numeric:tabular-nums;}
  .recording-segment-selection {position:absolute;inset:0;overflow:visible;border-radius:999px;pointer-events:none;}
  .recording-segment-selection[hidden] {display:none;}
  .recording-segment-shade,.recording-segment-keep {position:absolute;top:0;bottom:0;z-index:1;pointer-events:none;}
  .recording-segment-shade {background:rgba(239,68,68,.42);}
  .recording-segment-shade--start {border-radius:999px 0 0 999px;}
  .recording-segment-shade--end {border-radius:0 999px 999px 0;}
  .recording-segment-keep {background:rgba(34,197,94,.34);box-shadow:inset 0 0 0 1px rgba(34,197,94,.72);}
  .recording-segment-handle {appearance:none;-webkit-appearance:none;position:absolute;top:-8px;width:30px;height:72px;margin:0;padding:0;transform:translateX(-50%);border:0;border-radius:8px;background:linear-gradient(var(--c-primary-d),var(--c-primary-d)) center 7px / 2px calc(100% - 14px) no-repeat;color:var(--c-primary-d);cursor:ew-resize;touch-action:none;pointer-events:auto;z-index:7;filter:drop-shadow(0 1px 2px rgba(0,0,0,.42));}
  .recording-segment-handle::before,.recording-segment-handle::after {content:"";position:absolute;left:50%;width:8px;height:8px;box-sizing:border-box;border:2px solid currentColor;border-radius:50%;background:var(--c-bg-main);transform:translateX(-50%);}
  .recording-segment-handle::before {top:0;}
  .recording-segment-handle::after {bottom:0;}
  .recording-segment-handle.at-track-start {transform:none;background-position:4px 7px;}
  .recording-segment-handle.at-track-start::before,.recording-segment-handle.at-track-start::after {left:0;transform:none;}
  .recording-segment-handle.at-track-end {transform:translateX(-100%);background-position:calc(100% - 4px) 7px;}
  .recording-segment-handle.at-track-end::before,.recording-segment-handle.at-track-end::after {left:auto;right:0;transform:none;}
  .recording-segment-handle-time {position:absolute;left:50%;min-width:max-content;max-width:116px;box-sizing:border-box;padding:2px 5px;border:1px solid rgba(255,255,255,.32);border-radius:5px;background:rgba(17,17,17,.9);color:#fff;font-size:.66rem;font-weight:750;line-height:1.1;white-space:nowrap;transform:translateX(-50%);font-variant-numeric:tabular-nums;pointer-events:none;text-shadow:0 1px 1px #000;}
  .recording-segment-handle--start .recording-segment-handle-time {top:10px;}
  .recording-segment-handle--end .recording-segment-handle-time {bottom:10px;}
  .recording-segment-handle.at-track-start .recording-segment-handle-time {left:0;transform:none;}
  .recording-segment-handle.at-track-end .recording-segment-handle-time {left:auto;right:0;transform:none;}
  .recording-segment-handle:hover,.recording-segment-handle:focus-visible {color:var(--c-primary);outline:none;filter:drop-shadow(0 1px 3px rgba(0,0,0,.58));}
  .recording-segment-handle:focus-visible::before,.recording-segment-handle:focus-visible::after {box-shadow:0 0 0 2px var(--c-bg-main),0 0 0 4px var(--c-primary-d);}
  .recording-segment-manager {display:flex;flex-direction:column;gap:9px;padding:10px 12px;border:1px solid color-mix(in srgb,var(--c-primary-d) 42%,var(--c-border2));border-radius:9px;background:color-mix(in srgb,var(--c-primary-l) 28%,var(--c-bg-panel));color:var(--c-text);box-sizing:border-box;}
  .recording-segment-manager[hidden] {display:none;}
  .recording-segment-manager-copy {display:flex;flex-direction:column;gap:3px;min-width:0;}
  .recording-segment-manager-copy strong {font-size:.85rem;line-height:1.15;}
  .recording-segment-manager-copy span {font-size:.76rem;line-height:1.3;color:var(--c-text2);}
  .recording-segment-manager-footer {display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;}
  .recording-segment-summary {display:flex;flex-direction:column;gap:2px;min-width:0;font-size:.78rem;color:var(--c-text2);font-variant-numeric:tabular-nums;}
  .recording-segment-summary b {color:var(--c-text);font-size:.82rem;}
  .recording-segment-manager-controls {display:flex;align-items:stretch;justify-content:flex-end;gap:7px;flex-wrap:wrap;margin-left:auto;}
  .recording-segment-manager-tools,.recording-segment-manager-actions {display:flex;align-items:stretch;justify-content:flex-end;gap:7px;}
  .recording-segment-preview-button,.recording-segment-download {appearance:none;-webkit-appearance:none;display:inline-flex;align-items:center;justify-content:center;gap:6px;min-height:42px;padding:5px 10px;border:1px solid var(--c-border2);border-radius:7px;background:var(--c-bg-main);color:var(--c-text2);font-size:.76rem;font-weight:700;cursor:pointer;transition:background .16s ease,border-color .16s ease,color .16s ease,opacity .16s ease;}
  .recording-segment-tool {appearance:none;-webkit-appearance:none;display:inline-flex;flex-direction:column;align-items:center;justify-content:center;gap:1px;flex:0 0 42px;width:42px;min-width:42px;min-height:42px;padding:3px 2px;border:1px solid var(--c-border2);border-radius:7px;background:var(--c-bg-main);font-size:.62rem;font-weight:750;line-height:1;cursor:pointer;transition:transform .12s ease,background .16s ease,border-color .16s ease,color .16s ease,opacity .16s ease;}
  .recording-segment-tool svg {width:17px;height:17px;color:currentColor;opacity:1;pointer-events:none;}
  .recording-segment-reset {color:var(--warning-color,#f59e0b);border-color:color-mix(in srgb,var(--warning-color,#f59e0b) 52%,var(--c-border2));}
  .recording-segment-cancel {color:var(--error-color,#dc3146);border-color:color-mix(in srgb,var(--error-color,#dc3146) 52%,var(--c-border2));}
  .recording-segment-tool:focus-visible {border-color:currentColor;outline:2px solid currentColor;outline-offset:1px;}
  @media (hover:hover) and (pointer:fine){.recording-segment-tool:hover:not(:disabled){border-color:currentColor;background:var(--c-bg-panel);}.recording-segment-tool:hover:not(:disabled) svg{color:currentColor;}}
  .recording-segment-tool:active:not(:disabled) {transform:scale(.96);}
  .recording-segment-preview-button svg,.recording-segment-download svg {width:18px;height:18px;}
  .recording-segment-preview-button span,.recording-segment-download span {line-height:1.05;text-align:center;}
  .recording-segment-download {border-color:var(--c-primary-d);background:var(--c-primary-d);color:var(--c-text-rev);}
  .recording-segment-preview-button:focus-visible:not(:disabled) {border-color:var(--c-primary-d);color:var(--c-primary-d);outline:2px solid var(--c-primary-d);outline-offset:1px;}
  .recording-segment-download:focus-visible:not(:disabled) {background:var(--c-primary);outline:2px solid var(--c-primary);outline-offset:1px;}
  @media (hover:hover) and (pointer:fine){.recording-segment-preview-button:hover:not(:disabled){border-color:var(--c-primary-d);color:var(--c-primary-d);}.recording-segment-download:hover:not(:disabled){background:var(--c-primary);}}
  .recording-segment-tool:disabled,.recording-segment-preview-button:disabled,.recording-segment-download:disabled {opacity:.48;cursor:not-allowed;}
  .recording-segment-preview-modal {position:absolute;inset:0;z-index:40;display:grid;place-items:center;padding:12px;box-sizing:border-box;}
  .recording-segment-preview-modal[hidden] {display:none;}
  .recording-segment-preview-backdrop {appearance:none;-webkit-appearance:none;position:absolute;inset:0;width:100%;height:100%;margin:0;padding:0;border:0;background:rgba(0,0,0,.68);backdrop-filter:blur(3px);cursor:pointer;}
  .recording-segment-preview-dialog {position:relative;z-index:1;display:flex;flex-direction:column;gap:10px;width:min(760px,100%);max-height:calc(100% - 12px);padding:12px;box-sizing:border-box;overflow:auto;border:1px solid var(--c-border2);border-radius:12px;background:var(--c-bg-main);box-shadow:0 18px 54px rgba(0,0,0,.48);color:var(--c-text);}
  .recording-segment-preview-head {display:flex;align-items:center;justify-content:space-between;gap:12px;}
  .recording-segment-preview-head > div {display:flex;flex-direction:column;gap:2px;min-width:0;}
  .recording-segment-preview-head strong {font-size:1rem;line-height:1.2;}
  .recording-segment-preview-head span {font-size:.76rem;color:var(--c-text2);font-variant-numeric:tabular-nums;}
  .recording-segment-preview-close {appearance:none;-webkit-appearance:none;display:grid;place-items:center;flex:0 0 36px;width:36px;height:36px;padding:6px;border:1px solid var(--c-border2);border-radius:50%;background:var(--c-bg-panel);color:var(--c-text2);cursor:pointer;}
  .recording-segment-preview-close svg {width:22px;height:22px;pointer-events:none;}
  .recording-segment-preview-close:hover,.recording-segment-preview-close:focus-visible {border-color:var(--c-primary-d);color:var(--c-primary-d);outline:none;}
  .recording-segment-preview-video-host {display:grid;place-items:center;min-height:180px;border-radius:9px;overflow:hidden;background:#000;}
  .recording-segment-preview-video {display:block!important;width:100%!important;height:auto!important;max-width:100%!important;max-height:520px!important;aspect-ratio:16/9!important;object-fit:contain!important;object-position:center!important;background:#000!important;}
  .recording-segment-preview-status {padding:10px;border-radius:7px;background:var(--c-bg-panel);color:var(--c-text2);font-size:.8rem;text-align:center;}
  .recording-segment-preview-status[hidden] {display:none;}
  .recording-segment-preview-actions {display:flex;justify-content:flex-end;}

  .ed{position:absolute;bottom:2px;right:3px;font-size:0.675rem;font-weight:700;color:var(--c-text-rev);background:rgba(0,0,0,.65);border-radius:3px;padding:1.2px 3.6px;}
  .ei{flex:1 1 220px;min-width:0;}
  .etop{display:flex;align-items:center;gap:5px;margin-bottom:3px;flex-wrap:wrap;}
  .list-item-tags{display:flex;align-items:center;gap:4px;flex-wrap:wrap;min-width:0;}
  .tb{--list-tag-color:var(--c-primary-d);font-size:0.75rem;font-weight:700;padding:2.4px 7.2px;border:1px solid color-mix(in srgb,var(--list-tag-color) 36%,transparent);border-radius:6px;color:var(--list-tag-color);background:color-mix(in srgb,var(--list-tag-color) 18%,var(--c-bg-list));}
  .cam-badge{font-size:0.675rem;color:var(--c-text2);background:var(--c-bg-panel);padding:1.2px 7.2px;border-radius:6px;}
  .list-item .list-bubble{--list-bubble-accent:var(--c-primary-d);display:inline-flex;align-items:center;justify-content:center;box-sizing:border-box;height:1rem;padding:2px 6px;border:0;border-radius:999px;font-size:.68rem;font-weight:700;line-height:0.8;white-space:nowrap;color:color-mix(in srgb,var(--list-bubble-accent) 45%,var(--c-text));background:color-mix(in srgb,var(--list-bubble-accent) 18%,transparent);}
  .popup-info-title .list-bubble{--list-bubble-accent:var(--c-primary-d);display:inline-flex;align-items:center;justify-content:center;box-sizing:border-box;height:1rem;padding:2px 6px;border:0;border-radius:999px;font-size:.68rem;font-weight:700;line-height:0.8;white-space:nowrap;color:color-mix(in srgb,var(--list-bubble-accent) 45%,var(--c-text));background:color-mix(in srgb,var(--list-bubble-accent) 18%,transparent);}
  .list-item :is(.tb,.subl){--list-bubble-accent:var(--list-tag-color);}
  .popup-info-title .subl{--list-bubble-accent:var(--list-tag-color);}
  .list-item :is(.bc,.esc){--list-bubble-accent:var(--c-on);}
  .list-item :is(.bs,.cam-badge){--list-bubble-accent:var(--c-text2);}
  .bc,.bs{text-transform:none;}
  .em{display:flex;gap:8px;flex-wrap:wrap;font-size:0.75rem;color:var(--c-text2);} .em span{display:flex;align-items:center;gap:4px;}
  .em svg{width:10.8px;height:10.8px;}
  .list-item-meta{display:flex;align-items:center;gap:4px 10px;flex-wrap:wrap;min-width:0;font-size:.75rem;color:var(--c-text2);}
  .list-item-meta-unit{display:inline-flex;align-items:center;gap:4px;min-width:0;max-width:100%;white-space:nowrap;}
  .list-item-meta-unit svg{width:11px;height:11px;flex:0 0 11px;}
  .list-item-meta-unit.zone-meta > span{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
  .review-severity-chip{font-weight:800;text-transform:capitalize;}
  .list-item .review-severity-chip--alert{--list-bubble-accent:var(--c-bg-alert);}
  .list-item .review-severity-chip--detection{--list-bubble-accent:var(--c-bg-detect);}
  .review-thumbnail-severity{position:absolute;left:3px;bottom:3px;z-index:2;}
  @container list-item (max-width:520px){
    .ei,.rev-inf{flex-basis:180px;}
    .rev-head{align-items:flex-start;}
    .list-item-meta{gap:4px 8px;}
  }
  @container list-item (max-width:360px){
    .list-item-tags{gap:4px;}
    .list-item-meta{font-size:.7rem;}
    .list-item .list-bubble{min-height:15px;padding:1.75px 5px;font-size:.66rem;}
  }
  .list-item .review-thumbnail-severity{
    height:1.1rem;
    min-height:1.1rem;
    padding:2px 6px;
    color:var(--c-text-rev);
    background:color-mix(in srgb,var(--list-bubble-accent) 82%,var(--c-bg-deep));
    border:1px solid color-mix(in srgb,var(--c-text-rev) 55%,transparent);
    box-shadow:0 1px 3px color-mix(in srgb,var(--c-bg-deep) 78%,transparent);
    text-shadow:0 1px 1px var(--c-bg-deep);
  }
  .desc{margin-top:4px;font-size:0.825rem;color:var(--c-text2);line-height:1.45;background:var(--c-bg-panel);border-radius:5px;padding:6px 8.4px;}


  /* ── toast ── */
  .toast{position:fixed;left:50%;bottom:24px;transform:translateX(-50%);z-index:1600;background:rgba(15,21,40,.96);border:1px solid rgba(239,68,68,.4);color:var(--c-off);padding:8px 14px;border-radius:6px;font-size:0.9rem;box-shadow:0 8px 24px rgba(0,0,0,.5);max-width:90%;}

/* ========================================================= */
  .popup-content {position:absolute;bottom:0;left:var(--popup-shell-left,0px);right:auto;width:min(var(--popup-shell-width,100%),calc(100% - var(--popup-shell-left,0px)));max-width:none;height:95%;max-height:95%;min-height:95%;margin-inline:0;box-sizing:border-box;z-index:var(--popup-z-index);background:var(--popup-bg);
    border-top-left-radius:var(--fvc-border-radius,15px);border-top-right-radius:var(--fvc-border-radius,15px);overflow:hidden;box-shadow:0 -8px 40px rgba(0,0,0,.15);display:flex;flex-direction:column;overscroll-behavior:contain;transform:translateY(100%);will-change:transform;visibility:hidden;transition:transform .3s cubic-bezier(.25,1,.5,1),visibility .3s ease;}
  .popup-content.is-open {transform: translateY(0);visibility: visible;}
  .popup-content.popup-content--compact {left:50%;right:auto;bottom:10px;width:min(760px,calc(100% - 20px));height:auto;min-height:0;max-height:calc(100% - 20px);margin-inline:0;transform:translate(-50%,100%);border:1px solid var(--c-border2);border-radius:var(--fvc-border-radius,15px);box-shadow:var(--fvc-shadow-m);}
  .popup-content.popup-content--compact.is-open {transform:translate(-50%,0);}
  .popup-content.popup-content--compact .popup-header {height:24px;}
  .popup-content.popup-content--compact .popup-body {flex:0 1 auto;padding:0 7px 7px;gap:5px;}
  .popup-content.popup-content--compact .viewer {max-height:min(48dvh,420px);}
  .popup-content.popup-content--compact .popup-info-head {padding:5px 8px;font-size:.84rem;}
  .popup-content.popup-content--compact .popup-info-content {padding:5px 8px;gap:3px;}
  .popup-header {display: flex;justify-content: center;align-items: center;height: 32px;width: 100%;
  flex-shrink: 0;cursor: grab;touch-action: none;}
  .popup-close-row {position: absolute;top: 3px;right: 10px;z-index: 5;pointer-events: none;}
  .popup-close-row .close-btn {pointer-events: auto;}
  .popup-header::before {content: '';width: 40px;height: 4px;background-color: var(--handle-color);  border-radius: 3px;}
  .popup-body {padding: 0 10px 10px 10px;overflow-y:auto;overflow-x:hidden;min-height:0;flex:1 1 auto;display:flex;flex-direction:column;gap:8px;-webkit-overflow-scrolling:touch;overscroll-behavior-y:contain;}
  .popup-body > * {flex-shrink:0;}
  .popup-shell-ver {margin: 0;font-size: 18px;font-weight: 800;line-height: 1.2;color: var(--c-text2);}
  .popup-info-head {margin:0;padding:7px 10px;background:var(--c-bg-main);border-bottom:1px solid var(--c-border2);color:var(--c-text);font-size:.95rem;font-weight:750;line-height:1.25;letter-spacing:.01em;display:flex;align-items:center;position:relative;}
  .popup-info-head-text {min-width:0;flex:1 1 auto;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
  .popup-media-controls {display:grid;grid-template-columns:2px 36px minmax(0,1fr) 36px minmax(52px,72px) 36px 36px 2px;grid-template-areas:"sp1 play progress mute volume fs airplay sp2" ". . time . . . . .";align-items:center;column-gap:5px;row-gap:0;padding:1px 4px 2px;border-radius:8px;background:var(--c-bg-panel);border:1px solid var(--c-border2);box-sizing:border-box;width:100%;}
  .popup-media-controls.mobile-tablet-layout {grid-template-columns:2px 36px minmax(0,1fr) 36px 2px;grid-template-areas:"sp1 play progress mute sp2" ". . time . .";column-gap:8px;}
  .popup-media-controls.mobile-tablet-layout #popup-media-fs,
  .popup-media-controls.mobile-tablet-layout #popup-media-airplay,
  .popup-media-controls.mobile-tablet-layout #popup-media-volume{display:none !important;}
  .popup-media-controls.desktop-overlay-layout {position:relative;z-index:8;grid-template-columns:46px minmax(0,1fr) auto 34px minmax(68px,94px) 34px 34px;grid-template-areas:"play progress time mute volume fs airplay";align-self:center;width:min(100%,var(--popup-media-max-width,124.444dvh));height:42px;margin-top:-50px;padding:2px 6px;column-gap:5px;row-gap:0;color:var(--c-text-rev);background:color-mix(in srgb,var(--c-bg-deep) 74%,transparent);border:1px solid color-mix(in srgb,var(--c-border2) 55%,transparent);border-radius:5px;box-shadow:none;opacity:.94;transition:opacity .18s ease;}
  .popup-media-controls.desktop-overlay-layout:hover,
  .popup-media-controls.desktop-overlay-layout:focus-within {opacity:1;}
  .popup-media-controls.desktop-overlay-layout.is-hidden:not(:hover):not(:focus-within) {opacity:0;pointer-events:none;}
  .popup-media-controls.desktop-overlay-layout .popup-media-controls-spacer {display:none;}
  .popup-media-controls.desktop-overlay-layout .popup-media-btn {width:34px;height:34px;padding:3px;border:0;border-radius:0;color:var(--c-text-rev);background:transparent;box-shadow:none;}
  .popup-media-controls.desktop-overlay-layout .popup-media-btn#popup-media-play {width:46px;height:38px;margin-left:-5px;padding:5px;}
  .popup-media-controls.desktop-overlay-layout .popup-media-btn:hover,
  .popup-media-controls.desktop-overlay-layout .popup-media-btn:focus-visible {color:var(--c-text-rev);background:transparent;}
  .popup-media-controls.desktop-overlay-layout .popup-media-btn svg {width:23px;height:23px;opacity:.78;filter:drop-shadow(0 1px 1px color-mix(in srgb,var(--c-bg-deep) 70%,transparent));transition:opacity .12s ease,filter .12s ease;}
  .popup-media-controls.desktop-overlay-layout .popup-media-btn:hover svg,
  .popup-media-controls.desktop-overlay-layout .popup-media-btn:focus-visible svg {opacity:1;filter:drop-shadow(0 1px 1px color-mix(in srgb,var(--c-bg-deep) 70%,transparent)) brightness(1.25);}
  .popup-media-controls.desktop-overlay-layout .popup-media-progress {height:5px;transform:none;background:linear-gradient(to right,var(--c-primary) 0 var(--popup-media-progress-pct,0%),color-mix(in srgb,var(--c-text-rev) 42%,transparent) var(--popup-media-progress-pct,0%) 100%);}
  .popup-media-controls.desktop-overlay-layout .popup-media-progress::-webkit-slider-runnable-track {height:5px;background:linear-gradient(to right,var(--c-primary) 0 var(--popup-media-progress-pct,0%),color-mix(in srgb,var(--c-text-rev) 42%,transparent) var(--popup-media-progress-pct,0%) 100%);}
  .popup-media-controls.desktop-overlay-layout .popup-media-progress::-webkit-slider-thumb {width:13px;height:13px;margin-top:-4px;border:0;background:var(--c-primary);}
  .popup-media-controls.desktop-overlay-layout .popup-media-progress::-moz-range-track {height:5px;background:color-mix(in srgb,var(--c-text-rev) 42%,transparent);}
  .popup-media-controls.desktop-overlay-layout .popup-media-progress::-moz-range-progress {height:5px;border-radius:999px;background:var(--c-primary);}
  .popup-media-controls.desktop-overlay-layout .popup-media-progress::-moz-range-thumb {width:13px;height:13px;border:0;background:var(--c-primary);}
  .popup-media-controls.desktop-overlay-layout .popup-media-volume {height:5px;background:linear-gradient(to right,var(--c-primary) 0 var(--popup-media-volume-pct,100%),color-mix(in srgb,var(--c-text-rev) 42%,transparent) var(--popup-media-volume-pct,100%) 100%);}
  .popup-media-controls.desktop-overlay-layout .popup-media-volume::-webkit-slider-runnable-track {height:5px;background:linear-gradient(to right,var(--c-primary) 0 var(--popup-media-volume-pct,100%),color-mix(in srgb,var(--c-text-rev) 42%,transparent) var(--popup-media-volume-pct,100%) 100%);}
  .popup-media-controls.desktop-overlay-layout .popup-media-volume::-webkit-slider-thumb {width:12px;height:12px;margin-top:-3.5px;border:0;background:var(--c-primary);}
  .popup-media-controls.desktop-overlay-layout .popup-media-volume::-moz-range-track {height:5px;background:color-mix(in srgb,var(--c-text-rev) 42%,transparent);}
  .popup-media-controls.desktop-overlay-layout .popup-media-volume::-moz-range-progress {height:5px;border-radius:999px;background:var(--c-primary);}
  .popup-media-controls.desktop-overlay-layout .popup-media-volume::-moz-range-thumb {width:12px;height:12px;border:0;background:var(--c-primary);}
  .popup-media-controls.desktop-overlay-layout .popup-media-time {margin:0;color:var(--c-text-rev);font-size:.82rem;line-height:1;white-space:nowrap;text-shadow:0 1px 1px var(--c-bg-deep);}
  .popup-media-controls[hidden] {display:none !important;}
  .popup-media-controls-spacer {width:2px;}
  .popup-media-controls-spacer:first-child {grid-area:sp1;}
  .popup-media-controls-spacer:last-child {grid-area:sp2;}
  .popup-media-btn {width:36px;height:36px;display:flex;align-items:center;justify-content:center;background:var(--c-bg-main);border:1px solid var(--c-border2);border-radius:7px;color:var(--c-text2);cursor:pointer;flex-shrink:0;}
  .popup-media-btn:hover {color:var(--c-primary-d);border-color:var(--c-primary-d);}
  .popup-media-btn svg {width:20px;height:20px;pointer-events:none;}
  .popup-media-progress {grid-area:progress;min-width:0;width:100%;-webkit-appearance:none;appearance:none;height:6px;border-radius:999px;background:var(--c-bg-main);outline:none;transform:translateY(-20%);}
  .popup-media-progress::-webkit-slider-runnable-track {height:6px;border-radius:999px;background:var(--c-bg-main);}
  .popup-media-progress::-webkit-slider-thumb {-webkit-appearance:none;appearance:none;width:14px;height:14px;border-radius:50%;background:var(--c-primary);border:1px solid var(--c-primary-d);margin-top:-4px;}
  .popup-media-progress::-moz-range-track {height:6px;border-radius:999px;background:var(--c-bg-main);}
  .popup-media-progress::-moz-range-thumb {width:14px;height:14px;border-radius:50%;background:var(--c-primary);border:1px solid var(--c-primary-d);}
  .popup-media-volume {grid-area:volume;min-width:0;width:100%;-webkit-appearance:none;appearance:none;height:6px;border-radius:999px;background:var(--c-bg-main);outline:none;}
  .popup-media-volume::-webkit-slider-runnable-track {height:6px;border-radius:999px;background:var(--c-bg-main);}
  .popup-media-volume::-webkit-slider-thumb {-webkit-appearance:none;appearance:none;width:12px;height:12px;border-radius:50%;background:var(--c-primary);border:1px solid var(--c-primary-d);margin-top:-3px;}
  .popup-media-volume::-moz-range-track {height:6px;border-radius:999px;background:var(--c-bg-main);}
  .popup-media-volume::-moz-range-thumb {width:12px;height:12px;border-radius:50%;background:var(--c-primary);border:1px solid var(--c-primary-d);}
  .popup-media-time {grid-area:time;min-width:0;text-align:left;font-size:.76rem;color:var(--c-text2);font-variant-numeric:tabular-nums;line-height:.9;margin-top:-8px;}
  .popup-media-btn#popup-media-play {grid-area:play;}
  .popup-media-btn#popup-media-mute {grid-area:mute;}
  .popup-media-btn#popup-media-fs {grid-area:fs;}
  .popup-media-btn#popup-media-airplay {grid-area:airplay;}
  .card.mobile-rotate-popup .popup-media-controls,
  .card.mobile-rotate-popup-exit .popup-media-controls {position:fixed;left:10px;right:10px;bottom:1px;width:auto;z-index:1406;background:var(--c-bg-panel);opacity:.62;backdrop-filter:blur(3px);transition:opacity .22s ease;}
  .card.mobile-rotate-popup .popup-media-btn#popup-media-fs,
  .card.mobile-rotate-popup-exit .popup-media-btn#popup-media-fs {display:none !important;}
  .card.mobile-rotate-popup .popup-media-controls.is-hidden,
  .card.mobile-rotate-popup-exit .popup-media-controls.is-hidden {opacity:0;pointer-events:none;}

  .popup-carousel-wrap {--popup-carousel-item-height:100px;position:relative;min-width:0;isolation:isolate;}
  .popup-carousel-wrap[hidden] {display:none !important;}
  .popup-carousel {display:flex;gap:8px;overflow-x:auto;scroll-snap-type:x mandatory;scroll-behavior:smooth;padding:2px 0 4px;touch-action:pan-x;overscroll-behavior-x:contain;-webkit-overflow-scrolling:touch;scrollbar-width:thin;scrollbar-color:var(--c-text4) transparent;}
  .popup-carousel::-webkit-scrollbar {height:8px;}
  .popup-carousel::-webkit-scrollbar-track {background:transparent;}
  .popup-carousel::-webkit-scrollbar-thumb {background:var(--c-text4);border-radius:4px;}
  .popup-carousel-item {flex:0 0 auto;width:132px;display:flex;flex-direction:column;gap:4px;background:var(--c-bg-main);border:1px solid var(--c-border2);border-radius:7px;padding:4px;cursor:pointer;scroll-snap-align:start;color:var(--c-text);}
  .popup-carousel-item.active {border-color:var(--c-primary-d);box-shadow:0 0 0 1px var(--c-primary-d) inset;}
  .popup-carousel-item .et {width:124px;height:70px;border-radius:5px;}
  .popup-carousel-meta {display:flex;justify-content:space-between;align-items:center;gap:6px;font-size:.72rem;color:var(--c-text2);}
  .popup-carousel-nav {appearance:none;-webkit-appearance:none;position:absolute;top:calc(2px + 7px);bottom:auto;width:26px;height:calc(var(--popup-carousel-item-height) - 14px);box-sizing:border-box;display:flex;align-items:center;justify-content:center;margin:0;padding:0;overflow:visible;background:rgba(255,255,255,.18);background:color-mix(in srgb,var(--c-bg-panel) 34%,transparent);border:1px solid rgba(255,255,255,.38);border-color:color-mix(in srgb,var(--c-text-rev) 38%,transparent);box-shadow:0 7px 18px rgba(0,0,0,.18),inset 0 1px 0 rgba(255,255,255,.42),inset 0 -1px 0 rgba(255,255,255,.08);backdrop-filter:blur(10px) saturate(170%);-webkit-backdrop-filter:blur(10px) saturate(170%);color:#111;opacity:1;z-index:3;cursor:pointer;transition:background .18s ease,border-color .18s ease,box-shadow .18s ease,color .18s ease;}
  .popup-carousel-nav svg {display:block;flex:0 0 auto;width:22px;height:32px;transform:scale(1.15,1.25);filter:drop-shadow(0 1px 2px rgba(0,0,0,.38));pointer-events:none;}
  .popup-carousel-nav[hidden] {display:none !important;}
  .popup-carousel-nav:hover {background:rgba(255,255,255,.3);background:color-mix(in srgb,var(--c-bg-panel) 48%,transparent);color:var(--c-primary-d);border-color:var(--c-primary-d);box-shadow:0 9px 22px rgba(0,0,0,.24),inset 0 1px 0 rgba(255,255,255,.5);}
  .popup-carousel-nav:active {background:rgba(255,255,255,.38);box-shadow:0 3px 10px rgba(0,0,0,.22),inset 0 1px 4px rgba(0,0,0,.18);}
  .popup-carousel-nav:focus-visible {outline:2px solid var(--c-primary-d);outline-offset:2px;}
  .popup-carousel-nav.left {left:4px;border-radius:7px;}
  .popup-carousel-nav.right {right:4px;border-radius:7px;}
  .popup-carousel-wrap.mobile-device .popup-carousel-nav {display:none !important;}
  .popup-carousel-wrap.mobile-device .popup-carousel {touch-action:pan-y;}
  .popup-carousel.is-swiping,.popup-carousel.is-settling {scroll-snap-type:none;scroll-behavior:auto;-webkit-overflow-scrolling:auto;}
  .popup-info {background:var(--c-bg-panel);border:1px solid var(--c-border2);border-radius:9px;display:flex;flex-direction:column;overflow:hidden;}
  .popup-info[hidden] {display: none;}
  .popup-info-content {display:flex;flex-direction:column;gap:5px;padding:7px 10px 8px;min-width:0;}
  .popup-info-title {display:flex;align-items:center;gap:6px;flex-wrap:wrap;min-height:20px;}
  .popup-info-title .tb {font-size: 0.825rem;}
  .popup-info-grid {min-width:0;display:grid;grid-template-columns:repeat(3,minmax(0,1fr)) auto;gap:4px 12px;align-items:baseline;}
  .popup-info-row {display:flex;align-items:baseline;gap:5px;min-width:0;line-height:1.15;}
  .popup-info-k {font-size: 0.75rem;color: var(--c-primary-d);text-transform: uppercase;
    letter-spacing: .05em;flex-shrink: 0;}
  .popup-info-v {font-size: 0.9rem;color: var(--c-text);white-space: nowrap;overflow: hidden;
    text-overflow: ellipsis;}
  .popup-info-actions {grid-column:4;grid-row:1 / span 3;align-self:end;display:flex;gap:4px;}
  .popup-action {display:inline-flex;gap:4px;align-items:center;justify-content:center;
    background: var(--c-bg-main);border: 1px solid var(--c-border2);border-radius: 6px;
    color: var(--c-text2);cursor:pointer;padding:2px;transition: all 0.2s ease;min-height:36px;min-width:36px;}
  .popup-action svg {width: 24px;height: 24px;}
  .popup-action:hover {color: var(--c-primary-d);border-color: var(--c-primary-d);}
  .popup-action[data-rec-segment-toggle].active {color:var(--c-primary-d);border-color:var(--c-primary-d);background:var(--c-primary-l);}
  .popup-action:disabled {opacity:.45;cursor:not-allowed;}
  @media (max-width: 980px){
    .popup-info-grid{grid-template-columns:repeat(2,minmax(0,1fr)) auto;}
    .popup-info-actions{grid-column:3;grid-row:1 / span 4;}
  }
  @media (max-width: 720px){
    .popup-info-head{padding:6px 8px;font-size:.86rem;}
    .popup-info-content{gap:4px;padding:6px 8px 7px;}
    .popup-info-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:3px 9px;}
    .popup-info-row{gap:4px;}
    .popup-info-k{font-size:.66rem;letter-spacing:.035em;}
    .popup-info-v{font-size:.78rem;}
    .popup-info-actions{grid-column:2;grid-row:4;justify-self:end;align-self:end;}
    .recording-segment-manager{padding:9px 10px;}
    .recording-segment-manager-footer{display:grid;grid-template-columns:minmax(0,1fr);align-items:stretch;gap:7px;}
    .recording-segment-summary{justify-content:center;}
    .recording-segment-manager-controls{display:grid;grid-template-columns:auto minmax(0,1fr);align-items:stretch;width:100%;margin-left:0;}
    .recording-segment-manager-actions{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));}
    .recording-segment-preview-button,.recording-segment-download{min-width:0;padding-inline:7px;}
  }


${MOBILE_VIEW_PAGE_STYLES}
${CAMERA_PICKER_STYLES}
${CARD_VIEW_PAGE_STYLES}
${WIDE_VIEW_TIMELINE_STYLES}

  .card .list-item .list-item-middle--narrow,
  .card .list-item .eact.list-item-actions--narrow,
  .card .list-item .review-thumbnail-severity{display:none;}

  .card .list-item .list-item-middle--narrow{
    grid-template-columns:minmax(0,1fr) auto;
    grid-template-areas:"tags actions" "meta actions";
    align-items:center;
    column-gap:4px;
    row-gap:3px;
  }
  .card .list-item .list-item-middle--narrow > :is(.etop,.rev-head){grid-area:tags;width:100%;margin-bottom:0;}
  .card .list-item .list-item-narrow-lower{
    display:contents;
  }
  .card .list-item .list-item-middle--narrow .list-item-meta{
    grid-area:meta;
    flex-direction:column;
    align-items:flex-start;
    flex-wrap:nowrap;
    gap:3px;
    margin-top:0;
    line-height:1.2;
  }
  .card .list-item .list-item-middle--narrow .list-item-meta-unit{
    gap:3px;
    line-height:1.2;
  }
  .card .list-item .list-item-middle--narrow .list-item-actions--narrow{
    grid-area:actions;
    align-self:center;
    justify-self:end;
    margin-left:0;
    padding-right:0;
  }
  .card .list-item .list-item-middle--narrow > .desc{
    grid-column:1 / -1;
  }

  .card.phone-client .list-item .list-item-middle--standard,
  .card.phone-client .list-item .eact.list-item-actions--standard{display:none;}
  .card.phone-client .list-item .list-item-middle--narrow{display:grid;}
  .card.phone-client .list-item .eact.list-item-actions--narrow{display:flex;}
  .card.phone-client .list-item .review-thumbnail-severity{display:inline-flex;}

  .card .browse .list-item:is(.list-item--event,.list-item--review){
    display:grid;
    grid-template-columns:auto minmax(0,1fr) auto;
    grid-template-areas:"thumb middle actions";
    align-items:center;
    column-gap:9px;
    row-gap:4px;
  }
  .card .browse .list-item:is(.list-item--event,.list-item--review) > .rev-sev{grid-area:thumb;}
  .card .browse .list-item:is(.list-item--event,.list-item--review) > .et{grid-area:thumb;}
  .card .browse .list-item:is(.list-item--event,.list-item--review) > .list-item-middle{
    grid-area:middle;
    min-width:0;
    width:100%;
  }
  .card .browse .list-item:is(.list-item--event,.list-item--review) > .list-item-actions{
    grid-area:actions;
    align-self:center;
    justify-self:end;
    margin-left:0;
    padding-right:0;
  }
  .card .list-item .review-object-overflow{--list-bubble-accent:var(--c-text2);}

  .card.phone-client .browse .list-item:is(.list-item--event,.list-item--review){
    grid-template-columns:auto minmax(0,1fr);
    grid-template-areas:"thumb middle";
  }

  @container browse-list (max-width:720px){
    .card .list-item .list-item-middle--standard,
    .card .list-item .eact.list-item-actions--standard{display:none;}
    .card .list-item .list-item-middle--narrow{display:grid;}
    .card .list-item .eact.list-item-actions--narrow{display:flex;}
    .card .list-item .review-thumbnail-severity{display:inline-flex;}
    .card:not(.phone-client) .list-item:is(.list-item--event,.list-item--review){
      grid-template-columns:auto minmax(0,1fr);
      grid-template-areas:"thumb middle";
    }
  }

  @container browse-list (max-width:520px){
    .card .list-item .list-item-middle--narrow{
      grid-template-areas:"tags tags" "meta actions";
    }
  }

  ${CAMERA_GROUP_LIVE_STYLES}
  ${TWO_WAY_TALK_SOUNDWAVE_STYLES}
  ${LINKED_LIGHT_STYLES}

  .card button:focus:not(:focus-visible) {
    outline: none;
  }
  .card button:focus-visible {
    outline: 1px solid color-mix(in srgb, var(--c-primary-d) 58%, transparent) !important;
    outline-offset: 2px !important;
    box-shadow: 0 0 0 2px color-mix(in srgb, var(--c-primary-d) 14%, transparent) !important;
  }

`;
