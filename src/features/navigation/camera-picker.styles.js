export const CAMERA_PICKER_STYLES = `
  .card.mobile-view-active .mobile-top .cam-switcher,
  .card.card-view-active .card-view-camera-row {
    padding-inline:8px;
    position:relative;
    display:grid;
    align-items:center;
    gap:8px;
    overflow:visible;
  }

  .card.mobile-view-active .mobile-top .cam-switcher {
    grid-template-columns:minmax(0,1fr) minmax(162px,2.4fr) minmax(0,1fr);
  }

  .card.card-view-active .card-view-camera-row {
    grid-template-columns:auto minmax(0,1fr) auto;
  }

  :is(.card.mobile-view-active,.card.card-view-active) .mobile-cam-picker__back-slot {
    min-width:0;
  }

  :is(.card.mobile-view-active,.card.card-view-active) .mobile-cam-switcher__content {
    display:contents;
  }

  :is(.card.mobile-view-active,.card.card-view-active) .mobile-cam-picker {
    position:relative;
    justify-self:center;
    width:min(100%,clamp(162px,51vw,306px));
    min-width:0;
  }

  :is(.card.mobile-view-active,.card.card-view-active) .mobile-cam-picker__status {
    display:inline-flex;
    align-items:center;
    justify-self:end;
    gap:6px;
    font-size:1rem;
    min-width:0;
  }

  :is(.card.mobile-view-active,.card.card-view-active) .mobile-cam-picker__stream {
    display:inline-flex;
    flex-direction:column;
    align-items:flex-end;
    font-size:.85rem;
    line-height:1;
  }

  :is(.card.mobile-view-active,.card.card-view-active) .mobile-cam-picker__stream .sv {
    font-size:.85rem;
  }

  :is(.card.mobile-view-active,.card.card-view-active) .mobile-cam-picker__stream .sl {
    font-size:.65rem;
  }

  :is(.card.mobile-view-active,.card.card-view-active) .mobile-cam-picker__dot {
    font-size:.75rem;
    line-height:1;
  }

  :is(.card.mobile-view-active,.card.card-view-active) .mobile-cam-picker__trigger {
    width:100%;
    position:relative;
    display:flex;
    align-items:center;
    justify-content:center;
    gap:10px;
    padding:9px 36px 9px 12px;
    border-radius:10px;
    font-size:1.15rem;
    border:none;
    box-shadow:rgba(0,0,0,.25) 0 .0625em .0625em,rgba(0,0,0,.25) 0 .125em .5em,rgba(255,255,255,.1) 0 0 0 1px inset;
    background:var(--c-bg-primary);
    color:var(--c-text);
    cursor:pointer;
  }

  :is(.card.mobile-view-active,.card.card-view-active) .mobile-cam-picker__trigger-content {
    display:inline-grid;
    grid-template-columns:auto minmax(0,auto);
    align-items:center;
    justify-content:center;
    gap:8px;
    min-width:0;
    max-width:100%;
  }

  :is(.card.mobile-view-active,.card.card-view-active) .mobile-cam-picker__trigger-dot {
    visibility:hidden;
    width:.95rem;
    font-size:1rem;
    line-height:1;
  }

  :is(.card.mobile-view-active,.card.card-view-active) .mobile-cam-picker__label {
    min-width:0;
    overflow:hidden;
    text-overflow:ellipsis;
    white-space:nowrap;
    font-weight:700;
    text-align:left;
  }

  :is(.card.mobile-view-active,.card.card-view-active) .mobile-cam-picker__chev {
    position:absolute;
    right:12px;
    top:50%;
    transform:translateY(-50%);
    width:20px;
    height:30px;
    display:inline-flex;
    align-items:center;
    justify-content:center;
    flex-shrink:0;
  }

  :is(.card.mobile-view-active,.card.card-view-active) .mobile-cam-picker__chev svg {
    width:20px;
    height:20px;
  }

  :is(.card.mobile-view-active,.card.card-view-active) .mobile-cam-picker__panel {
    position:absolute;
    top:calc(100% + 6px);
    left:0;
    right:0;
    transform:none;
    z-index:8;
    display:flex;
    flex-direction:column;
    align-items:stretch;
    gap:4px;
    width:100%;
    max-width:100%;
    max-height:min(60dvh,calc(100dvh - 160px));
    overflow-y:auto;
    padding:6px;
    box-sizing:border-box;
    border:1px solid rgba(255,255,255,.28);
    border-radius:10px;
    background:rgba(255,255,255,.2);
    backdrop-filter:blur(8px) saturate(180%);
    -webkit-backdrop-filter:blur(8px) saturate(180%);
    box-shadow:0 8px 32px rgba(31,38,135,.2),inset 0 0 0 1px rgba(255,255,255,.35);
  }

  :is(.card.mobile-view-active,.card.card-view-active) .mobile-cam-picker__panel[hidden] {
    display:none;
  }

  :is(.card.mobile-view-active,.card.card-view-active) .mobile-cam-picker__option {
    appearance:none;
    width:100%;
    box-sizing:border-box;
    display:flex;
    align-items:center;
    justify-content:flex-start;
    border:1px solid rgba(255,255,255,.28);
    border-radius:8px;
    background:rgba(255,255,255,.18);
    backdrop-filter:blur(5px) saturate(170%);
    -webkit-backdrop-filter:blur(5px) saturate(170%);
    box-shadow:inset 0 0 0 1px rgba(255,255,255,.2);
    color:var(--c-text);
    cursor:pointer;
    padding:8px 10px;
    font-weight:600;
    font-size:1.15rem;
    text-align:left;
    transition:background .18s ease,border-color .18s ease,box-shadow .18s ease,color .18s ease;
  }

  :is(.card.mobile-view-active,.card.card-view-active) .mobile-cam-picker__option:hover {
    background:rgba(255,255,255,.28);
    border-color:rgba(255,255,255,.5);
  }

  :is(.card.mobile-view-active,.card.card-view-active) .mobile-cam-picker__option.is-active {
    border-color:rgba(255,255,255,.58);
    background:rgba(255,255,255,.34);
    box-shadow:inset 0 0 0 1px rgba(255,255,255,.55),0 0 0 1px color-mix(in srgb,var(--c-primary-d) 55%,transparent);
    color:var(--c-primary-d);
  }

  :is(.card.mobile-view-active,.card.card-view-active) .mobile-cam-picker__option-content {
    display:grid;
    grid-template-columns:auto minmax(0,1fr);
    align-items:center;
    gap:8px;
    width:100%;
    min-width:0;
  }

  :is(.card.mobile-view-active,.card.card-view-active) .mobile-cam-picker__option-label {
    min-width:0;
    overflow:hidden;
    text-overflow:ellipsis;
    white-space:nowrap;
    text-align:left;
  }
`;
