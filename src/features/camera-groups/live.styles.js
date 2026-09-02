export const CAMERA_GROUP_LIVE_STYLES = `
  .camera-group-live-layout {position:absolute;inset:0;display:block;min-width:0;min-height:0;background:var(--c-bg-deep);}
  .camera-group-live-pane {position:relative;width:100%;height:100%;min-width:0;min-height:0;overflow:hidden;background:var(--c-bg-deep);}
  .camera-group-live-pane--secondary[hidden] {display:none!important;}
  .camera-group-live-pane #engine,
  .camera-group-live-pane #camera-group-secondary-engine {position:absolute;inset:0;width:100%;height:100%;min-width:0;min-height:0;overflow:hidden;}
  .camera-group-live-pane #camera-group-secondary-engine > *,
  .camera-group-live-pane #camera-group-secondary-engine video {width:100%!important;height:100%!important;max-width:none!important;max-height:none!important;object-fit:contain;}
  #eng-wrap.camera-group-live .camera-group-live-layout {display:grid;gap:1px;}
  #eng-wrap.camera-group-live.camera-group-live--side-by-side .camera-group-live-layout {grid-template-columns:minmax(0,1fr) minmax(0,1fr);grid-template-rows:minmax(0,1fr);}
  #eng-wrap.camera-group-live.camera-group-live--stacked .camera-group-live-layout {grid-template-columns:minmax(0,1fr);grid-template-rows:minmax(0,1fr) minmax(0,1fr);}
  #eng-wrap.camera-group-live .camera-group-live-pane--secondary {display:block;}
  #eng-wrap.camera-group-live.camera-group-live--focus-a .camera-group-live-layout,
  #eng-wrap.camera-group-live.camera-group-live--focus-b .camera-group-live-layout {display:block;}
  #eng-wrap.camera-group-live.camera-group-live--focus-a .camera-group-live-pane,
  #eng-wrap.camera-group-live.camera-group-live--focus-b .camera-group-live-pane {position:absolute;inset:0;width:100%;height:100%;}
  #eng-wrap.camera-group-live.camera-group-live--focus-a .camera-group-live-pane--primary,
  #eng-wrap.camera-group-live.camera-group-live--focus-b .camera-group-live-pane--secondary {z-index:2;opacity:1;pointer-events:auto;}
  #eng-wrap.camera-group-live.camera-group-live--focus-a .camera-group-live-pane--secondary,
  #eng-wrap.camera-group-live.camera-group-live--focus-b .camera-group-live-pane--primary {z-index:1;opacity:0;pointer-events:none;}
  #eng-wrap.camera-group-live .camera-group-live-pane.grid-alert::before,
  #eng-wrap.camera-group-live .camera-group-live-pane.grid-detection::before {content:"";position:absolute;inset:0;z-index:9;pointer-events:none;border:3px solid var(--c-bg-alert);}
  #eng-wrap.camera-group-live .camera-group-live-pane.grid-detection::before {border-color:var(--c-bg-detect);}
  .camera-group-member-loading {position:absolute;inset:0;display:flex;align-items:center;justify-content:center;gap:7px;color:var(--c-text-rev);font-size:.8rem;pointer-events:none;}
  .camera-group-member-loading .dot {width:8px;height:8px;border-radius:50%;background:var(--c-primary);animation:pulse 1s ease-in-out infinite;}
  .camera-group-live-pane.is-ready .camera-group-member-loading {display:none;}
  .camera-group-pane-controls {position:absolute;left:7px;top:7px;z-index:12;display:none;align-items:center;gap:4px;}
  #eng-wrap.camera-group-live .camera-group-live-pane--primary .camera-group-pane-controls,
  #eng-wrap.camera-group-live .camera-group-live-pane--secondary.is-ready .camera-group-pane-controls {display:flex;}
  #eng-wrap.camera-group-mobile-member .camera-group-live-pane--primary .camera-group-pane-controls {display:flex;}
  .camera-group-pane-button {display:inline-flex;align-items:center;justify-content:center;gap:3px;height:28px;min-width:28px;padding:3px 6px;border:1px solid transparent;border-radius:999px;background:color-mix(in srgb,var(--c-bg-deep) 78%,transparent);color:var(--c-text-rev);box-shadow:inset 0 0 0 1px color-mix(in srgb,var(--c-text-rev) 14%,transparent),0 1px 3px color-mix(in srgb,var(--c-bg-deep) 65%,transparent);cursor:pointer;opacity:.82;}
  .camera-group-mobile-toggle {display:none;}
  #eng-wrap.camera-group-mobile-member .camera-group-live-pane--primary .camera-group-audio-select,
  #eng-wrap.camera-group-mobile-member .camera-group-live-pane--primary .camera-group-focus-toggle {display:none;}
  #eng-wrap.camera-group-mobile-member .camera-group-live-pane--primary .camera-group-mobile-toggle {display:inline-flex;width:44px;height:44px;min-width:44px;padding:8px;touch-action:manipulation;-webkit-tap-highlight-color:transparent;opacity:.94;}
  #eng-wrap.camera-group-mobile-member .camera-group-live-pane--primary .camera-group-mobile-toggle svg {width:21px;height:21px;}
  #eng-wrap.camera-group-mobile-member .camera-group-live-pane--primary .camera-group-mobile-toggle span {font-size:.72rem;}
  .camera-group-pane-button:hover,.camera-group-pane-button[aria-pressed="true"] {opacity:1;background:color-mix(in srgb,var(--c-primary) 18%,var(--c-bg-deep));box-shadow:inset 0 0 0 1px color-mix(in srgb,var(--c-primary) 42%,transparent),0 1px 3px color-mix(in srgb,var(--c-bg-deep) 65%,transparent);}
  .camera-group-pane-button:focus-visible {opacity:1;outline:2px solid color-mix(in srgb,var(--c-primary) 72%,transparent);outline-offset:1px;background:color-mix(in srgb,var(--c-primary) 18%,var(--c-bg-deep));}
  .camera-group-pane-button svg {width:16px;height:16px;pointer-events:none;}
  .camera-group-pane-button span {font-size:.62rem;font-weight:800;pointer-events:none;}
  .card.mobile-rotate-live .camera-group-live-layout,
  .card.mobile-rotate-live-exit .camera-group-live-layout,
  #live-stage:fullscreen .camera-group-live-layout,
  #live-stage:-webkit-full-screen .camera-group-live-layout {width:100%;height:100%;}
`;
