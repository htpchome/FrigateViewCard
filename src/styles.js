import { MOBILE_VIEW_PAGE_STYLES } from "./features/mobile-view/page.styles.js";

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
    border-radius: var(--ha-card-border-radius, 14px);
  }
  :host {
    --popup-z-index: 1000;
    --popup-bg: white;
    --handle-color: #e0e0e0;
    --rotate-vw: 100vw;
    --rotate-vh: 100dvh;
    --rotate-ox: 0px;
    --rotate-oy: 0px;
  }

  /* ── theme variables (dark = default) ── */
    .card {
        --c-bg-main:   var(--card-background-color);
        --c-bg-primary:var(--primary-background-color); 
        --c-bg-panel:  var(--secondary-background-color);
        --c-bg-deep:   #111111;
        --c-text:      var(--primary-text-color);
        --c-text2:     var(--secondary-text-color);
        --c-text3:     var(--state-inactive-color);
        --c-text4:     var(--disabled-text-color);
        --c-text-rev:  var(--text-primary-color);
        --c-border:    var(--secondary-background-color);
        --c-border2:   var(--state-inactive-color);
        --c-primary:   var(--primary-color);
        --c-primary-l: var(--light-primary-color);
        --c-primary-d: var(--dark-primary-color);
        --c-accent:    var(--accent-color);
        --c-on:        #4ade80;
        --c-off:       #FCA5A5;
        --c-bg-scrub:  #c2f2c1;
        --c-bg-alert:  #dc3146;
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

  .card .layout{display:flex;flex-direction:column;height:100%;max-height:100%;min-height:0;width:100%;overflow:hidden !important;}
  .card .layout.wide-view{flex-direction:row;}
  .card .col-left{flex:0 1 auto; min-height:0; align-self: start;flex-direction:column;width:100%; display:flex;overflow:none;}
  .card .col-right{flex:1 1 auto; min-height:0; flex-direction:column;position:relative;width:100%; display:flex;overflow:hidden;}
  .resize-handle{display:block;width:100%;height:6px;cursor:row-resize;background:var(--c-border2,#333);position:relative;flex-shrink:0;z-index:10;transition:background .15s;}
  .layout:not(.wide-view) .resize-handle{display:none;}
  .resize-handle:hover,.resize-handle.active{background:var(--c-accent,#3b82f6);}
  .resize-handle::after{content:'';position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:32px;height:2px;background:rgba(255,255,255,.4);border-radius:1px;}
  .layout.wide-view .resize-handle{width:6px;height:auto;cursor:col-resize;}
  .layout.wide-view .resize-handle::after{width:2px;height:32px;}
  .card .live-stage{position:relative;width:100%;min-height:0;flex-shrink:0;}
  .card #eng-wrap{min-height:0;}
  .card .browse{
    display:flex;
    flex:1 1 0;
    flex-direction: column; 
    padding:0 10px;
    margin:0;
    min-height:0;
    height:auto;
    overflow-y:auto;
    position:relative}

  .card .browse-head{display:flex;align-items:center;justify-content:center;min-height:1.5rem;max-height:1.65em;flex-direction:row;width:auto;color:var(--c-text2);letter-spacing:.02em;line-height:1.40;padding:1px 8px;}
  .card.recordings-browse-head-tall:not(.recordings-browse-head-compact) .browse-head{min-height:3.5rem;max-height:none;}
  .browse-head-left {display:flex;flex:1;justify-content:center;align-items:center;flex: 0 0 auto; }
  .browse-head-right {display:flex;justify-content center;align-items: center;flex: 0 0 auto;}
  .browse-head-middle {flex:1;text-align:center;font-weight:700;font-size:1rem;letter-spacing:.02em;line-height:1.40;}

  .footer {display: grid;grid-template-columns: minmax(100px, 1fr) minmax(auto, 3fr) minmax(100px, 1fr);line-height:2;min-height:1.5rem;font-size:1.2rem;padding:4px;align-items: center;border-top: 1px solid var(--c-border);}
  .footer.footer--older-hint-only{display:flex;justify-content:center;}
  .wide-footer{display:flex;justify-content:flex-start;align-items:center;line-height:2;min-height:2.5rem;font-size:2rem;padding:4px;text-align:left;}
  
  .prev-next{display:inline-flex;align-items:center;gap:4px;font-size: 0.85rem;padding-inline: 0.3em;padding-block: 0.3em;line-height: 1;  border-radius: 999em;
    background:var(--c-bg-main);min-width:80px;
    color:var(--c-text2);
    transition:all .15s;
    font-weight:600;
    cursor:pointer;
    white-space:nowrap;
    box-shadow: var(--fvc-shadow-s);
    }
  
  .prev-next:hover{color:var(--c-primary-d);}
  .prev-next.active{background:var(--c-primary-d);color:var(--c-text-rev);}
  .prev-next:disabled{opacity:.45;cursor:not-allowed;color:var(--c-text4);}
  .prev-next svg{width:14.4px;height:14.4px;flex-shrink:0;}

  .card.recordings-browse-head-tall .browse{touch-action:pan-y;}
  .browse.recordings-swipe{touch-action:pan-y;}
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

  /* ── event list ── */
  .list{display:block;min-height:0;} 
  .list-head{justify-content:space-between;align-items:center;margin-bottom:8px;}
  .list-day-sec{position:relative;}
  .list-day-label{position:relative;z-index:1;padding:2px 0 4px;font-size:1rem;font-weight:700;color:var(--c-text2);letter-spacing:.02em;line-height:1.30;pointer-events:none;background:var(--c-bg-main);border:none;text-align: center;}
  .list-day-label-first{display:none;}


  .list-item{position: relative;display:flex;flex-wrap:wrap;gap:9px;align-items:center;
    background:var(--c-bg-primary);margin-bottom:5px; border: var(--fvc-border-s);
    cursor:pointer;border-radius: var(--fvc-border-radius);padding:2px 10px 2px 2px;}
  .list-item:hover{background: var(--c-bg-panel);}
  .list-item.compact{padding:2px 10px 2px 2px;flex-wrap:wrap;}
  .list-item.compact .et{width:112px;height:63px;border-radius:5px;}
  .list-item.compact .eact .ico{width:30px;height:30px;}
  .list-item.compact .eact .ico svg{width:24px;height:24px;}
  .et{border-radius:var(--fvc-border-radius);overflow:hidden;flex-shrink:0;
    background:var(--c-bg-deep);position:relative;object-fit:cover;}
  .et img{width:160px;height:90px;object-fit:cover;display:block;}
  .alert{outline: 2px solid var(--c-bg-alert);} 
  .detection{outline: 2px solid var(--c-accent);}
  .eact{display:flex;flex-direction:row;align-items:center;gap:4px;flex-shrink:0;padding:right:10px}
  .tph{width:160px;height:90px;display:flex;align-items:center;justify-content:center;border-radius:var(--fvc-border-radius);background:linear-gradient(135deg,#1a2840,#0d1520);
    color:var(--c-primary-d);} 
  .tph svg{width:20px;height:20px;}

 /* ── recordings ── */
  .ric{width:63px;height:63px;border-radius:5px;background:rgba(30,80,200,.25);
    color:var(--c-primary-d);display:flex;align-items:center;justify-content:center;} 
  .ric svg{width:16.8px;height:16.8px;}
  .rinf{flex:1;} 
  .rt{font-size:0.9rem;font-weight:600;color:var(--c-text);} 
  .rsub{font-size:0.75rem;color:var(--c-text2);margin-top:1px;} 
  .rp{width:31.2px;height:31.2px;display:flex;align-items:center;justify-content:center;background:var(--c-bg-panel);border:var(--fvc-border-s);border-radius:5px;color:var(--c-text2);cursor:pointer;flex-shrink:0;padding:0;}
  .rp svg{width:15.6px;height:15.6px;}
  .rp:hover{color:var(--c-primary-d);border-color:var(--c-primary-d);}

  /* ── reviews ── */
  .rev-nogap {display:flex;gap:0;}
  .rev-inf{flex:1;} 
  .rev-t{font-size:0.9rem;font-weight:600;color:var(--c-text);} 
  .rev-m{display:flex;align-items:center;gap:6px;flex-wrap:wrap;font-size:0.75rem;color:var(--c-text2);margin-top:1px;} 
  .rev-m .time-meta,.rev-m .review-meta{display:inline-flex;align-items:center;gap:4px;} 
  .rev-m svg{width:10.8px;height:10.8px;}

  .xform{box-shadow: var(--fvc-shadow-s);transition: transform 0.1s, box-shadow 0.1s;}
  .xform:hover{transform: scale(1.004);box-shadow: var(--fvc-shadow-s);}
  .shadow-small {box-shadow: var(--fvc-shadow-s);}  
  .shadow-medium {box-shadow: var(--fvc-shadow-m);}
  .small-padding {padding:5px;}
  .tabs-holder{margin:3px 8px;border-radius:8px;background-color:var(--c-bg-panel);container-type:inline-size;}
  .button-holder{display:grid;grid-template-columns:minmax(0,1fr) auto minmax(0,1fr);grid-template-areas:"tabs nav tools";align-items:center;gap:10px;padding:4px 8px;}
  .button-holder-row{display:flex;align-items:center;min-width:0;}
  .tabs-row{grid-area:tabs;justify-content:flex-start;}
  .page-nav-row{grid-area:nav;justify-content:center;}
  .tools-row{grid-area:tools;justify-content:flex-end;}
  .tabs{display:flex;flex-wrap:wrap;gap:5px;padding:0;overflow:visible;scrollbar-width:none;position:relative;z-index:auto;background-color:transparent !important;border-radius:8px;transition:background-color 0.3s ease;margin:0;}
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
  .icon-btn:hover svg{color:var(--c-text);}
  .icon-btn.active svg{color:var(--c-text);}
  .icon-btn:disabled{opacity:.45;cursor:not-allowed;}
  .icon-btn:disabled:hover svg{color:var(--c-text2);}
  .newtoast{font-size:0.75rem;font-weight:700;color:var(--c-on);}
  .empty{text-align:center;padding:16px;color:var(--c-text3);font-size:0.9rem;line-height:1.5;}
  .more,.end{position:relative;display:flex;min-height:0;align-items:center;justify-content:center;font-size:0.85rem;color:var(--c-text2);padding:6px;}
  .more.to-top{position:relative;cursor:pointer;color:var(--c-text2);}

  /* ── feed area ── */
    .feed-area{position:relative;width:100%;}
    #eng-wrap{background:var(--c-bg-deep);position:relative;width:100%;aspect-ratio:16/9;overflow:hidden;max-height:var(--view-height,none);z-index:0;isolation:isolate;}
    #engine,#stream-fallback{transition:opacity .22s ease;}
    #eng-wrap::before{content:"";position:absolute;border-radius:inherit;pointer-events:none;z-index:5;}
    #eng-wrap.slideshow-switching #engine,
    #eng-wrap.slideshow-switching #stream-fallback{opacity:.12;}
    #eng-wrap.slideshow-alert::before{border-width:3px;border-color:var(--error-color, var(--c-bg-alert));}
    #eng-wrap.slideshow-detection::before{border-width:3px;border-color:var(--warning-color, var(--c-accent));}
    #eng-wrap.popup-covered::after{content:"";position:absolute;inset:0;background:var(--c-bg-deep);z-index:4;pointer-events:none;}
    .card.mobile-rotate-live,
    .card.mobile-rotate-live-exit{overflow:hidden;height:var(--rotate-vh);max-height:var(--rotate-vh);}
    .card.mobile-rotate-live #live-stage,
    .card.mobile-rotate-live-exit #live-stage{position:fixed;top:var(--rotate-oy);left:var(--rotate-ox);z-index:1400;width:var(--rotate-vw);height:var(--rotate-vh);max-width:none;max-height:none;border-radius:0;background:#000;box-shadow:none;transform:none;}
    .card.mobile-rotate-live #eng-wrap,
    .card.mobile-rotate-live-exit #eng-wrap{width:100%;height:100%;max-height:none;aspect-ratio:auto;border-radius:0;}
    .card.mobile-rotate-live #engine,
    .card.mobile-rotate-live-exit #engine{position:absolute;inset:0;}
    .card.mobile-rotate-live #engine > *,
    .card.mobile-rotate-live-exit #engine > *{position:absolute;inset:0;width:100% !important;height:100% !important;max-width:none !important;max-height:none !important;}
    .card.mobile-rotate-live #engine video,
    .card.mobile-rotate-live-exit #engine video,
    .card.mobile-rotate-live #stream-fallback img,
    .card.mobile-rotate-live-exit #stream-fallback img{object-fit:cover;object-position:center center;}
    .card.mobile-rotate-live #live-stage{animation:liveOverlayIn .28s ease both;}
    .card.mobile-rotate-live-exit #live-stage{animation:liveOverlayOut .24s ease both;}
    .card.mobile-rotate-live .stream-loading,
    .card.mobile-rotate-live-exit .stream-loading{display:none !important;}
    .card.mobile-rotate-live .live-playback-controls,
    .card.mobile-rotate-live-exit .live-playback-controls{z-index:2147483600;}
    .card.mobile-rotate-popup,
    .card.mobile-rotate-popup-exit{overflow:hidden;height:var(--rotate-vh);max-height:var(--rotate-vh);}
    .card.mobile-rotate-popup #myPopup,
    .card.mobile-rotate-popup-exit #myPopup{position:fixed;top:var(--rotate-oy);left:var(--rotate-ox);right:auto;bottom:auto;width:var(--rotate-vw);height:var(--rotate-vh);max-height:var(--rotate-vh);min-height:var(--rotate-vh);z-index:1400;transform:translateY(0) !important;border-radius:0;background:var(--c-bg-deep);}
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
    .card.mobile-rotate-popup #popup-carousel-wrap,
    .card.mobile-rotate-popup #popup-shell-ver,
    .card.mobile-rotate-popup-exit #popup-info,
    .card.mobile-rotate-popup-exit #recording-scrub,
    .card.mobile-rotate-popup-exit #popup-carousel-wrap,
    .card.mobile-rotate-popup-exit #popup-shell-ver{display:none !important;}
  #stream-fallback{position:absolute;inset:0;z-index:2;background:var(--c-bg-deep);
    pointer-events:none;line-height:0;}
  #stream-fallback[hidden]{display:none;}
  #stream-fallback img{width:100%;height:100%;max-width:none;max-height:none;object-fit:contain;object-position:center center;display:block;background:var(--c-bg-deep);}
  #stream-fallback::after{content:none;}
  #engine{position:absolute;inset:0;z-index:1;min-height:0;flex-shrink:0;}
  #engine video{width:100%;height:100%;display:block;object-fit:contain;var(--c-bg-deep);}
  #engine ha-camera-stream,#engine ha-hls-player,#engine webrtc-camera{width:100%;height:100%;display:block;}
  .stream-fallback-status{position:absolute;left:8px;bottom:8px;z-index:3;display:flex;align-items:center;gap:6px;padding:4.8px 9.6px;border-radius:999px;background:rgba(0,0,0,.62);border:1px solid rgba(255,255,255,.2);color:var(--c-text-rev);font-size:0.825rem;font-weight:600;line-height:1;backdrop-filter:blur(2px);}
  .stream-fallback-status[hidden]{display:none;}
  .stream-loading{position:absolute;top:8px;right:8px;display:flex;align-items:center;gap:6px;padding:4.8px 9.6px;border-radius:999px;background:rgba(0,0,0,.55);border:1px solid rgba(255,255,255,.2);color:var(--c-text-rev);font-size:0.825rem;font-weight:600;line-height:1;z-index:3;backdrop-filter:blur(2px);}
  .stream-loading[hidden]{display:none;}
  .stream-loading .dot{width:10px;height:10px;border:2px solid rgba(255,255,255,.3);border-top-color:var(--c-text-rev);border-radius:50%;animation:spin .9s linear infinite;}

  .close-btn {width: 40px;height: 40px;border-radius: 50%;display: flex;align-items: center;  justify-content: center;font-size: 24px;line-height: 1;cursor: pointer;border: 1px solid #ccc;
    background-color: #f5f5f5;color: #333;transition: all 0.2s ease;}
  .close-btn:hover {background-color: #e0e0e0;color: #000;}



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
  .glass-btn svg{width:30px;height:30px;opacity: 0.8; }
  .glass-btn:hover svg{width:30px;height:30px;opacity: 0.95; }

  .square-btn{
    display: inline-grid;
    place-items: center;
    width: 36px;
    height: 36px;
    padding: 0;
    color: #fff;
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
  .btn-secondary{border:none;background:transparent;color:var(--editor-primary);font-weight:600;cursor:pointer;padding:8px 12px;}
  .btn-primary{background:var(--editor-primary);color:var(--text-primary-color, #ffffff);border-radius:999px;padding:8px 18px;}
  .cam-tab{font-size: 1rem;padding:0.4em;line-height: 1;font-weight:600;padding:6px;white-space:nowrap;}  
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

  #live-stage:fullscreen .live-pip-btn,
  #live-stage:-webkit-full-screen .live-pip-btn,
  #live-stage:fullscreen .live-fs-btn,
  #live-stage:-webkit-full-screen .live-fs-btn,
  #viewer:fullscreen .popup-fs-btn,
  #viewer:-webkit-full-screen .popup-fs-btn{display:none !important;}
  #live-stage:fullscreen,
  #live-stage:-webkit-full-screen{display:flex;align-items:center;justify-content:center;width:100%;height:100%;background:#000;}
  #live-stage:fullscreen #eng-wrap,
  #live-stage:-webkit-full-screen #eng-wrap{width:100%;height:100%;max-height:none;aspect-ratio:auto;}
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
  .viewer.popup-media-ratio-ready video{object-fit:fill;}
  .viewer img.snap{cursor:zoom-in;touch-action:manipulation;user-select:none;-webkit-user-drag:none;}
  .viewer .ld{color:var(--c-text2);font-size:0.975rem;}
  .ph{width:100%;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1px;color:var(--c-text2);background:linear-gradient(145deg,#1a2540,#0d1520);}
  .ph svg{width:40px;height:40px;opacity:.35;}
  .live-grid{width:100%;height:100%;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));grid-template-rows:repeat(2,minmax(0,1fr));gap:6px;padding:6px;box-sizing:border-box;}
  .live-grid-cell{position:relative;overflow:hidden;border-radius:calc(var(--fvc-border-radius) / 2);background:var(--c-bg-deep);border:1px solid var(--c-border2);}
  .live-grid-cell.grid-alert{border-color:var(--error-color, var(--c-bg-alert));box-shadow:inset 0 0 0 2px var(--error-color, var(--c-bg-alert));}
  .live-grid-cell.grid-detection{border-color:var(--warning-color, var(--c-accent));box-shadow:inset 0 0 0 2px var(--warning-color, var(--c-accent));}
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

  .card.preview-active .preview-shell-header{display:flex;flex:0 0 auto;align-items:center;justify-content:space-between;gap:10px;padding:10px 12px;position:sticky;top:0;z-index:4;}


  .preview-shell-title{min-width:0;display:flex;flex-direction:column;gap:2px;}
  .preview-shell-title-main{font-size:1.05rem;font-weight:700;color:var(--c-text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
  .preview-shell-title-sub{font-size:.78rem;color:var(--c-text2);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
  .card.preview-active .preview-shell{display:block;flex:1 1 auto;width:100%;min-width:0;min-height:0;padding:10px;box-sizing:border-box;overflow-y:auto;overscroll-behavior:contain;-webkit-overflow-scrolling:touch;touch-action:pan-y;}
  .card.preview-active .preview-shell-footer{display:flex;flex:0 0 auto;align-items:center;min-height:30px;padding:4px 8px;position:sticky;bottom:0;z-index:4;}
  .preview-shell-footer .frigate-view{position:static;max-height:24px;}
  .preview-shell-footer .frigate-view svg{height:24px;}
  .preview-grid {display: grid;gap: 10px;width: 100%;max-width: 100%;
    grid-template-columns: repeat(auto-fit,minmax(max(min(100%, 420px), calc(33.333% - 10px)),1fr));
  }
  .preview-grid > div {min-width: 0;}

  .preview-cell{display:flex;flex-direction:column;cursor:pointer;-webkit-backface-visibility: hidden;backface-visibility: hidden;border-radius:var(--fvc-border-radius);}
  .preview-media-host{position:relative;aspect-ratio:16/9;overflow:hidden;border-radius:var(--fvc-border-radius);background:var(--c-bg-deep);-webkit-backface-visibility: hidden;backface-visibility: hidden;
    transform: translateZ(0);}
  .preview-media-host::after{content:"";position:absolute;inset:0;pointer-events:none;border:0 solid transparent;border-radius:inherit;box-sizing:border-box;z-index:3;}
  .preview-media-host.grid-alert{border-color:var(--error-color, var(--c-bg-alert));box-shadow:inset 0 0 0 2px var(--error-color, var(--c-bg-alert));}
  .preview-media-host.grid-alert::after{border-width:2px;border-color:var(--error-color, var(--c-bg-alert));}
  .preview-media-host.grid-detection{border-color:var(--warning-color, var(--c-accent));box-shadow:inset 0 0 0 2px var(--warning-color, var(--c-accent));}
  .preview-media-host.grid-detection::after{border-width:2px;border-color:var(--warning-color, var(--c-accent));}
  .preview-media-host video,.preview-media-host img,.preview-media-host ha-camera-stream{width:100%;height:100%;display:block;object-fit:contain;object-position:center center;background:var(--c-bg-deep);}
  .preview-meta{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:2px 8px;align-items:center;padding:6px 8px;background:var(--c-bg-main);
    border-radius:var(--fvc-border-radius);}
  .preview-meta-name{font-size:.82rem;font-weight:700;color:var(--c-text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
  .preview-meta-source{font-size:.7rem;color:var(--c-text2);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
  .preview-meta-alerts{font-size:.72rem;color:var(--c-text2);}
  .preview-meta-status{font-size:.72rem;color:var(--c-text2);display:inline-flex;align-items:center;gap:5px;justify-self:end;}
  .preview-meta-status .dot{font-size:.82rem;line-height:1;}
  .preview-cam-buttons{display:flex;flex-wrap:wrap;gap:6px;margin-top:10px;}
  .preview-cam-btn{font-size:.9rem;line-height:1;padding:6px 9px;}
  .card .layout--wide-view{flex:1 1 0;height:auto;min-height:0;}
  .card .col-left--wide-view{height:100%;max-height:100%;overflow:hidden;}
  .wide-companion-panel{display:flex;flex:1 1 0;flex-direction:column;gap:8px;min-width:0;min-height:0;padding:10px;box-sizing:border-box;overflow:hidden;}
  .wide-companion-title{font-size:.9rem;font-weight:700;color:var(--c-text);letter-spacing:.02em;}
  .wide-companion-grid{flex:1 1 0;min-height:0;height:100%;overflow:hidden;align-content:start;justify-content:start;grid-template-columns:repeat(var(--wide-companion-columns,1),minmax(0,var(--wide-companion-cell-width,320px)));grid-auto-rows:auto;}
  .wide-companion-cell{height:auto;min-height:0;overflow:hidden;}
  .wide-companion-media-host{flex:0 0 auto;min-height:0;aspect-ratio:16/9;}
  .wide-companion-meta{flex:0 0 auto;}
  @media (max-width: 720px){
    .preview-meta{grid-template-columns:minmax(0,1fr);gap:2px;}
    .preview-meta-status{justify-self:start;}
  }
  @supports (-moz-appearance:none) {
    .live-grid{transform:translateZ(0);backface-visibility:hidden;}
    .live-grid-cell{contain:layout paint;transform:translateZ(0);backface-visibility:hidden;}
    .live-grid-cell video,.live-grid-cell img,.live-grid-cell ha-camera-stream{transform:translateZ(0);backface-visibility:hidden;}
  }
  .ph-spin{width:24px;height:24px;border:3px solid rgba(255,255,255,.1);border-top-color:var(--c-accent);border-radius:50%;animation:spin .8s linear infinite;}
  @keyframes spin{to{transform:rotate(360deg);}}
    @keyframes liveOverlayIn{from{opacity:.9;}to{opacity:1;}}
    @keyframes liveOverlayOut{from{opacity:1;}to{opacity:.92;}}
    @keyframes popupOverlayIn{from{opacity:.9;}to{opacity:1;}}
    @keyframes popupOverlayOut{from{opacity:1;}to{opacity:.92;}}


  /* ── info row ── */
  .info-row{display:grid;grid-template-columns: repeat(3, 1fr);padding:0px 10px;align-items: center;}
  .info-left{text-align:left}
  .info-row-action-slot{text-align: center;}
  .info-row-page-nav{display:flex;justify-content:center;align-items:center;flex:1 1 240px;padding:0 12px;min-width:0;}
  .info-row-page-nav .page-nav{padding:0;justify-content:center;width:100%;}
  .page-nav{display:flex;align-items:center;justify-content:center;gap:4px;padding:0;}
  .page-nav-btn{border-radius:6px;}
  .page-nav-btn.active svg{color:var(--c-text-rev);opacity:1;}
  .info-row-mic-btn{display:inline-flex;align-items:center;justify-content:center;width:40px;height:40px;border-radius:999px;border:1px solid transparent;background:transparent;color:var(--c-text2);cursor:pointer;transition:background .16s ease,border-color .16s ease,color .16s ease,box-shadow .16s ease;border:1px solid var(--c-text3);}
  .info-row-mic-btn[hidden] {display: none !important;}
  .info-row-mic-btn svg{width:24px;height:24px;opacity:.92;color:currentColor;}
  .info-row-mic-btn:hover{border-color:var(--c-primary-d);color:var(--c-primary-d);}
  .info-row-mic-btn.active{background:rgba(74,222,128,.16);border-color:rgba(74,222,128,.45);color:#4ade80;box-shadow:0 0 0 1px rgba(74,222,128,.15) inset;}
  .info-row-mic-btn.active svg{opacity:1;}
  .info-title{font-size:1.05rem;font-weight:700;color:var(--c-text);}
  .stats{display:flex;gap:10px;text-align:right;justify-content: end;align-items: center;} 
  .stat{display:flex;flex-direction:column;align-items:flex-end;}
  .sv{font-size:1.05rem;font-weight:700;color:var(--c-primary-d);} .sl{font-size:0.75rem;color:var(--c-text2);text-transform:uppercase;letter-spacing:.06em;}
  
  /* ── camera switcher ── */

  .cam-switcher {
    display: flex;
    align-items: center;
    gap: 4px;
    flex-wrap: wrap; /* Wraps items on larger displays */
    padding: 6px 12px;
  }


  @media (max-width: 767px) {
    .cam-switcher {
      flex-wrap: nowrap; /* Forces items onto one line */
      overflow-x: auto;
      white-space: nowrap;
      -webkit-overflow-scrolling: touch; /* Smooth iOS scroll */
      
      /* Hide scrollbars */
      scrollbar-width: none;
      -ms-overflow-style: none;
    }

    .cam-switcher::-webkit-scrollbar {
      display: none;
    }

    /* Crucial: Prevents child items from squishing on mobile */
    .cam-switcher > * {
      flex-shrink: 0; 
    }
  }

  /* ── timeline ── */
  .tl-tools{position:relative;display:flex;gap:4px;}
  .tl-tools-slot{display:flex;align-items:center;justify-content:flex-end;min-width:0;}
  .tool{display:inline-flex;gap:4px;align-items:center;justify-content:center;background:var(--c-bg);border:1px solid var(--c-border2);color:var(--c-text2);border-radius:6px;cursor:pointer;padding:2px;transition: all 0.2s ease;min-height:36px;min-width:36px;}
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
  @container (max-width: 640px){
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
  .divider svg {height:24px;width:8px;opacity:0.85;color:var(--c-text2);}
  .ico{width:30px;height:30px;display:flex;align-items:center;background:var(--c-bg-panel);border:1px solid var(--c-border2);border-radius:5px;color:var(--c-text2);cursor:pointer;}
  .ico svg{width:24px;height:24px;} .ico:hover{color:var(--c-primary-d);border-color:var(--c-primary-d);}
  .ico.fav.on{color:var(--c-accent);border-color:rgba(251,191,36,.4);background:rgba(251,191,36,.12);}

  /* ── filter + cal ── */
  .filter-panel,.cal-panel{display: none;position: absolute;top:100%;right:0;background-color: #f1f1f1;min-width: 300px;overflow: auto;border-top: 3px solid var(--c-primary);box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.2);z-index: 3;padding:20px;}
  .frow{display:flex;align-items:center;gap:5px;flex-wrap:wrap;margin-bottom:4px;} .frow:last-child{margin-bottom:0;} .frow-l{font-size:0.75rem;color:var(--c-text3);width:38px;text-transform:uppercase;flex-shrink:0;}
  .chip{background:var(--c-bg-panel);border:1px solid var(--c-border2);color:var(--c-text2);border-radius:10px;padding:3.6px 10.8px;font-size:0.825rem;cursor:pointer;}
  .chip.on{background:var(--c-primary-l);border-color:var(--c-primary-d);color:var(--c-primary-d);}
  .cal-top{display:flex;justify-content:center;margin-bottom:6px;}
  .cal-today-btn{background:var(--c-bg-panel);border:1px solid var(--c-border2);color:var(--c-text2);border-radius:8px;cursor:pointer;padding:3.6px 10.8px;font-size:0.78rem;font-weight:600;transition:all .2s ease;}
  .cal-today-btn:hover{color:var(--c-primary-d);border-color:var(--c-primary-d);background:var(--c-primary-l);}
  .cal-head{display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;} .cal-head b{font-size:0.9rem;} .cal-head button{background:none;border:none;color:var(--c-primary-d);font-size:1.275rem;cursor:pointer;padding:0 6px;}
  .cal-dow,.cal-grid{display:grid;grid-template-columns:repeat(7,1fr);gap:1px;text-align:center;}
  .cal-dow span{font-size:0.675rem;color:var(--c-text2);padding:2px 0;}
  .cday{position:relative;background:none;border:none;color:var(--c-text);font-size:0.825rem;padding:6px 0;border-radius:4px;cursor:pointer;} .cday:hover,.cday.active{background:var(--c-primary-l);} .cdot{position:absolute;bottom:2px;left:50%;transform:translateX(-50%);width:3px;height:3px;border-radius:50%;background:#ef4444;}

  .controls-section{padding:6px 2px 0;}
  .controls-pad-wrap{max-width:280px;margin:10px auto 12px;}
  .controls-pad-wrap.is-disabled{opacity:.45;pointer-events:none;filter:saturate(.5);}
  .controls-actions{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:10px;margin:0 0 12px;}
  .controls-action-group{background:var(--c-bg-panel);border:1px solid var(--c-border2);border-radius:10px;padding:10px;}
  .controls-action-group.is-disabled{opacity:.55;filter:saturate(.55);}
  .controls-action-group-label{font-size:0.72rem;font-weight:700;text-transform:uppercase;letter-spacing:.03em;color:var(--c-text2);margin-bottom:8px;}
  .controls-action-row{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;}
  .controls-action-btn{appearance:none;background:var(--c-bg-main);border:1px solid var(--c-border2);color:var(--c-text);border-radius:10px;padding:10px 8px;font-size:0.82rem;font-weight:700;cursor:pointer;transition:transform .12s ease,background .2s ease,border-color .2s ease,color .2s ease;}
  .controls-action-btn:hover:not(:disabled),.controls-action-btn:focus-visible:not(:disabled){border-color:var(--c-primary-d);background:var(--c-primary-l);color:var(--c-primary-d);outline:none;}
  .controls-action-btn:active:not(:disabled){transform:translateY(1px) scale(.99);}
  .controls-action-btn:disabled{cursor:not-allowed;color:var(--c-text4);background:var(--c-bg-panel);}
  .controls-readout{background:var(--c-bg-panel);border:1px solid var(--c-border2);border-radius:10px;overflow:hidden;}
  .controls-readout-head{display:flex;align-items:center;justify-content:space-between;padding:7px 10px;border-bottom:1px solid var(--c-border2);}
  .controls-readout-label{font-size:0.75rem;font-weight:700;text-transform:uppercase;letter-spacing:.03em;color:var(--c-text2);}
  .controls-readout-clear{background:none;border:1px solid var(--c-border2);color:var(--c-text2);border-radius:8px;font-size:0.72rem;font-weight:600;padding:3px 8px;cursor:pointer;transition:all .2s ease;}
  .controls-readout-clear:hover{color:var(--c-primary-d);border-color:var(--c-primary-d);background:var(--c-primary-l);}
  .controls-readout-lines{max-height:154px;overflow-y:auto;padding:8px 10px;font-family:ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;font-size:0.82rem;line-height:1.45;color:var(--c-text);}
  .controls-readout-line{padding:1px 0;}
  .controls-readout-empty{color:var(--c-text3);font-style:italic;font-family:var(--ha-font-family, Roboto, 'Helvetica Neue', sans-serif);}

  .frigate-view{max-height:24px;pointer-events: none;}
  .frigate-view svg{height:24px;pointer-events: none;}
  .frigateView-accent svg{color:#ff5733;fill:#ff5733;}
  .frigateView-accent {color:#ff5733;fill:#ff5733;}
  
  .recording-scrub {display:flex;flex-direction:column;align-items:stretch;gap:6px;}
  .recording-scrub[hidden] {display:none;}
  .recording-scrub-track {position:relative;width:100%;height:28px;border-radius:999px;background:var(--c-bg-scrub);cursor:pointer;touch-action:none;overflow:visible;}
  .recording-scrub-ticks {position:absolute;inset:0;pointer-events:none;z-index:3;}
  .recording-scrub-markers {position:absolute;inset:0;pointer-events:none;z-index:2;}
  .recording-scrub-alert {position:absolute;top:2px;bottom:2px;background:var(--c-bg-alert);border-radius:999px;min-width:8px;opacity:.95;box-shadow:0 0 0 1px rgba(0,0,0,.25) inset;pointer-events:auto;}
  .recording-scrub-detection {position:absolute;top:4px;bottom:4px;background:#f59e0b;border-radius:999px;min-width:4px;opacity:.95;pointer-events:auto;}
  .recording-scrub-tick {position:absolute;top:1px;bottom:1px;width:1px;background:var(--c-bg-panel);}
  .recording-scrub-cursor {position:absolute;top:-6px;bottom:-6px;width:3px;background:rgba(255,255,255,.97);border-radius:999px;left:0;transform:translateX(-1px);pointer-events:none;box-shadow:0 0 0 1px rgba(0,0,0,.25);z-index:4;}
  .recording-scrub-preview {position:absolute;bottom:calc(100% + 8px);left:50%;width:min(200px,calc(100% - 12px));padding:4px;background:var(--c-bg-main);border:1px solid var(--c-border2);border-radius:8px;box-shadow:0 8px 24px rgba(0,0,0,.42);transform:translateX(-50%);pointer-events:none;z-index:8;box-sizing:border-box;}
  .recording-scrub-preview[hidden] {display:none;}
  .recording-scrub-preview img {display:block;width:100%;aspect-ratio:16/9;object-fit:cover;border-radius:5px;background:var(--c-bg-deep);}
  .recording-scrub-preview span {display:block;padding:4px 2px 1px;font-size:.7rem;font-weight:700;color:var(--c-text2);text-transform:none;line-height:1.2;}
  .recording-scrub-labels {display:flex;align-items:center;justify-content:space-between;gap:8px;font-size:.78rem;color:var(--c-text2);font-weight:600;line-height:1;}
  .recording-scrub-now {font-variant-numeric:tabular-nums;}

  .ed{position:absolute;bottom:2px;right:3px;font-size:0.675rem;font-weight:700;color:var(--c-text-rev);background:rgba(0,0,0,.65);border-radius:3px;padding:1.2px 3.6px;}
  .ei{flex:1;min-width:0;}
  .etop{display:flex;align-items:center;gap:5px;margin-bottom:3px;flex-wrap:wrap;}
  .tb{font-size:0.75rem;font-weight:700;padding:2.4px 7.2px;border-radius:6px;}
  .cam-badge{font-size:0.675rem;color:var(--c-text2);background:var(--c-bg-panel);padding:1.2px 7.2px;border-radius:6px;}
  .subl{font-size:0.75rem;font-weight:600;color:var(--c-primary-l);background:rgba(99,102,241,.16);padding:2.4px 7.2px;border-radius:6px;}
  .bc,.bs{font-size:0.675rem;font-weight:700;padding:1.2px 6px;border-radius:5px;text-transform:uppercase;} .bc{background:rgba(74,222,128,.14);color:var(--c-on);} .bs{background:rgba(148,163,184,.16);color:var(--c-text2);}
  .esc{font-size:0.825rem;font-weight:700;color:var(--c-on);background:rgba(74,222,128,.12);border-radius:5px;padding:1.2px 6px;}
  .em{display:flex;gap:8px;flex-wrap:wrap;font-size:0.75rem;color:var(--c-text2);} .em span{display:flex;align-items:center;gap:4px;} 
  .em svg{width:10.8px;height:10.8px;}
  .desc{margin-top:4px;font-size:0.825rem;color:var(--c-text2);line-height:1.45;background:var(--c-bg-panel);border-radius:5px;padding:6px 8.4px;}


  /* ── toast ── */
  .toast{position:fixed;left:50%;bottom:24px;transform:translateX(-50%);z-index:1600;background:rgba(15,21,40,.96);border:1px solid rgba(239,68,68,.4);color:var(--c-off);padding:8px 14px;border-radius:6px;font-size:0.9rem;box-shadow:0 8px 24px rgba(0,0,0,.5);max-width:90%;}

/* ========================================================= */
  .popup-content {position: absolute;bottom: 0;left: 0;width: 100%;height: 95%;max-height: 95%;  min-height: 95%;box-sizing: border-box;z-index: var(--popup-z-index);background: var(--popup-bg);
    border-top-left-radius: var(--ha-card-border-radius, 14px);border-top-right-radius: var(--ha-card-border-radius, 14px);overflow: hidden;box-shadow: 0 -8px 40px rgba(0, 0, 0, 0.15);  display: flex;flex-direction: column;overscroll-behavior: contain;transform: translateY(100%);will-change: transform;visibility: hidden;transition: transform 0.3s cubic-bezier(0.25, 1, 0.5, 1), visibility 0.3s ease;}
  .popup-content.is-open {transform: translateY(0);visibility: visible;}
  .popup-header {display: flex;justify-content: center;align-items: center;height: 32px;width: 100%;
  flex-shrink: 0;cursor: grab;touch-action: none;}
  .popup-close-row {position: absolute;top: 3px;right: 10px;z-index: 5;pointer-events: none;}
  .popup-close-row .close-btn {pointer-events: auto;}
  .popup-header::before {content: '';width: 40px;height: 4px;background-color: var(--handle-color);  border-radius: 3px;}
  .popup-body {padding: 0 10px 10px 10px;overflow-y: auto;overflow-x:hidden;flex-grow: 1;display: flex;  flex-direction: column;gap: 8px;-webkit-overflow-scrolling: touch;overscroll-behavior-y: contain;}
  .popup-shell-ver {margin: 0;font-size: 18px;font-weight: 800;line-height: 1.2;color: var(--c-text2);}
  .popup-info-head {margin:0;padding:7px 10px;background:var(--c-bg-main);border-bottom:1px solid var(--c-border2);color:var(--c-text);font-size:.95rem;font-weight:750;line-height:1.25;letter-spacing:.01em;}
  .popup-media-controls {display:grid;grid-template-columns:2px 36px minmax(0,1fr) 36px 36px 36px 2px;grid-template-areas:"sp1 play progress mute fs airplay sp2" ". . time . . . .";align-items:center;column-gap:5px;row-gap:0;padding:1px 4px 2px;border-radius:8px;background:var(--c-bg-panel);border:1px solid var(--c-border2);box-sizing:border-box;width:100%;}
  .popup-media-controls.mobile-tablet-layout {grid-template-columns:2px 36px minmax(0,1fr) 36px 36px 2px;grid-template-areas:"sp1 play progress mute airplay sp2" ". . time . . .";column-gap:8px;}
  .popup-media-controls[hidden] {display:none !important;}
  .popup-media-controls-spacer {width:2px;}
  .popup-media-controls-spacer:first-child {grid-area:sp1;}
  .popup-media-controls-spacer:last-child {grid-area:sp2;}
  .popup-media-btn {width:36px;height:36px;display:flex;align-items:center;justify-content:center;background:var(--c-bg-main);border:1px solid var(--c-border2);border-radius:7px;color:var(--c-text2);cursor:pointer;flex-shrink:0;}
  .popup-media-btn:hover {color:var(--c-primary-d);border-color:var(--c-primary-d);}
  .popup-media-btn svg {width:20px;height:20px;}
  .popup-media-progress {grid-area:progress;min-width:0;width:100%;-webkit-appearance:none;appearance:none;height:6px;border-radius:999px;background:var(--c-bg-main);outline:none;transform:translateY(-20%);}
  .popup-media-progress::-webkit-slider-runnable-track {height:6px;border-radius:999px;background:var(--c-bg-main);}
  .popup-media-progress::-webkit-slider-thumb {-webkit-appearance:none;appearance:none;width:14px;height:14px;border-radius:50%;background:var(--c-primary);border:1px solid var(--c-primary-d);margin-top:-4px;}
  .popup-media-progress::-moz-range-track {height:6px;border-radius:999px;background:var(--c-bg-main);}
  .popup-media-progress::-moz-range-thumb {width:14px;height:14px;border-radius:50%;background:var(--c-primary);border:1px solid var(--c-primary-d);}
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
  }


${MOBILE_VIEW_PAGE_STYLES}


`;
