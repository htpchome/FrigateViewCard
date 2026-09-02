export const LINKED_LIGHT_STYLES = `
  .linked-light-region{display:flex;align-items:center;justify-content:center;min-width:0;}
  .linked-light-region:empty{display:none;}
  .linked-light-position-slot{display:flex;align-items:center;justify-content:center;gap:8px;min-width:0;}
  .linked-light-position-slot[hidden]{display:none!important;}
  .linked-light-control{position:relative;display:inline-flex;align-items:center;justify-content:center;flex:0 0 auto;--linked-light-level:0;}
  .linked-light-button{position:relative;isolation:isolate;overflow:hidden;touch-action:manipulation;}
  .linked-light-button ha-icon{position:relative;z-index:2;pointer-events:none;color:currentColor;}
  .linked-light-button::before{content:"";position:absolute;z-index:1;inset:0;pointer-events:none;opacity:0;transition:opacity .16s ease;}
  .linked-light-button.is-on{color:var(--c-primary-d);border-color:color-mix(in srgb,var(--c-primary-d) 55%,var(--c-border2));}
  .linked-light-button.round-btn.is-on::before{opacity:.2;background:var(--c-primary);clip-path:inset(calc((100 - var(--linked-light-level)) * 1%) 0 0 0 round var(--fvc-border-radius,0px));}
  .linked-light-button.icon-btn{border-radius:50%;}
  .linked-light-button.icon-btn.is-on{background:conic-gradient(var(--c-primary-d) calc(var(--linked-light-level) * 1%),color-mix(in srgb,var(--c-primary-d) 18%,transparent) 0);}
  .linked-light-button.icon-btn.is-on::before{inset:2px;display:block;opacity:1;border-radius:50%;background:var(--c-bg-panel);}
  .linked-light-button:disabled{opacity:.42;cursor:not-allowed;}
  .linked-light-button.is-pending{cursor:progress;}
  .linked-light-dimmer{position:absolute;z-index:80;left:50%;bottom:calc(100% + 8px);transform:translateX(-50%);width:93px;color:var(--c-text);}
  .linked-light-dimmer[hidden]{display:none!important;}
  .linked-light-dimmer-scrim{display:none;}
  .linked-light-dimmer-panel{position:relative;display:flex;flex-direction:column;align-items:center;gap:5px;width:93px;padding:9px 9px 8px;box-sizing:border-box;background:color-mix(in srgb,var(--c-bg-panel) 94%,transparent);border:1px solid var(--c-border2);border-radius:var(--fvc-border-radius,0px);color:var(--c-text);}
  .linked-light-dimmer-close{display:none;}
  .linked-light-dimmer-title{width:100%;overflow:hidden;color:var(--c-text);font-size:.72rem;font-weight:700;line-height:1.15;text-align:center;text-overflow:ellipsis;white-space:nowrap;}
  .linked-light-dimmer output{font-size:1.3rem;font-weight:500;line-height:1;color:var(--c-text);font-variant-numeric:tabular-nums;}
  .linked-light-brightness-track{position:relative;isolation:isolate;width:50px;height:108px;overflow:hidden;background:color-mix(in srgb,var(--c-accent) 30%,var(--c-bg-panel));border-radius:calc(var(--fvc-border-radius,0px) * 2);}
  .linked-light-brightness-track::before{content:"";position:absolute;z-index:0;inset:auto 0 0;height:calc(var(--linked-light-level) * 1%);background:var(--c-accent);pointer-events:none;}
  .linked-light-brightness-track input[type="range"]{position:absolute;z-index:1;left:50%;top:50%;width:98px;height:45px;margin:0;transform:translate(-50%,-50%) rotate(-90deg);appearance:none;-webkit-appearance:none;background:transparent;cursor:pointer;touch-action:none;}
  .linked-light-brightness-track input[type="range"]::-webkit-slider-runnable-track{height:45px;background:transparent;border:0;}
  .linked-light-brightness-track input[type="range"]::-webkit-slider-thumb{-webkit-appearance:none;width:3px;height:30px;margin-top:7.5px;border:0;border-radius:2px;background:var(--c-text-rev);box-shadow:0 0 0 1px color-mix(in srgb,var(--c-bg-deep) 18%,transparent);}
  .linked-light-brightness-track input[type="range"]::-moz-range-track{height:45px;background:transparent;border:0;}
  .linked-light-brightness-track input[type="range"]::-moz-range-thumb{width:3px;height:30px;border:0;border-radius:2px;background:var(--c-text-rev);box-shadow:0 0 0 1px color-mix(in srgb,var(--c-bg-deep) 18%,transparent);}
  .linked-light-dimmer-power{width:32px;height:32px;min-width:32px;min-height:32px;color:var(--c-text);background:var(--c-bg-main);}
  .linked-light-dimmer-power.is-on{color:var(--c-text-rev);background:var(--c-primary-d);}
  .linked-light-dimmer-power.is-pending{cursor:progress;}
  .card.mobile-view-active .linked-light-dimmer{position:fixed;z-index:2100;inset:0;transform:none;width:auto;display:grid;place-items:center;}
  .card.mobile-view-active .linked-light-dimmer-scrim{position:absolute;display:block;inset:0;width:100%;height:100%;padding:0;border:0;background:color-mix(in srgb,var(--c-bg-deep) 48%,transparent);}
  .card.mobile-view-active .linked-light-dimmer-panel{z-index:1;width:111px;padding:15px 12px 12px;}
  .card.mobile-view-active .linked-light-dimmer-close{position:absolute;display:grid;place-items:center;top:6px;right:6px;width:24px;height:24px;min-width:24px;min-height:24px;}
  .card.mobile-view-active .linked-light-brightness-track{width:56px;height:132px;}
  .card.mobile-view-active .linked-light-brightness-track input[type="range"]{width:120px;height:51px;}
  .card.mobile-view-active .linked-light-brightness-track input[type="range"]::-webkit-slider-runnable-track{height:51px;}
  .card.mobile-view-active .linked-light-brightness-track input[type="range"]::-webkit-slider-thumb{height:35px;margin-top:8px;}
  .card.mobile-view-active .linked-light-brightness-track input[type="range"]::-moz-range-track{height:51px;}
  .card.mobile-view-active .linked-light-brightness-track input[type="range"]::-moz-range-thumb{height:35px;}
  .info-row-center-controls{display:grid;grid-template-columns:minmax(40px,1fr) auto minmax(40px,1fr);align-items:center;align-self:stretch;min-width:0;overflow:visible;}
  .info-row-center-controls > [data-fvc-region="two-way-talk"]{grid-column:2;grid-row:1;display:flex;align-items:center;justify-content:center;min-width:0;}
  .info-row-center-controls > [data-fvc-region="linked-entities"]{display:contents;}
  .info-row-center-controls .linked-light-position-slot{grid-row:1;justify-self:center;}
  .info-row-center-controls .linked-light-position-slot[data-linked-light-position-slot="left"]{grid-column:1;}
  .info-row-center-controls .linked-light-position-slot[data-linked-light-position-slot="right"]{grid-column:3;}
`;
