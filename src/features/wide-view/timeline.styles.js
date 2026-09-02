export const WIDE_VIEW_TIMELINE_STYLES = `
  .card .col-right--wide-view.wide-timeline-enabled {
    --wide-timeline-panel-width: 408px;
    box-sizing: border-box;
    transition: padding-left 180ms ease;
  }
  .card .col-right--wide-view.wide-timeline-open.wide-timeline-push {
    padding-left: var(--wide-timeline-panel-width);
  }
  .card .wide-timeline-panel {
    position: absolute;
    z-index: 12;
    inset: 0 auto 0 0;
    display: flex;
    flex-direction: column;
    width: var(--wide-timeline-panel-width);
    min-width: 0;
    min-height: 0;
    box-sizing: border-box;
    overflow: hidden;
    color: var(--c-text);
    background: var(--c-bg-main);
    border-right: 1px solid var(--c-border2);
    box-shadow: var(--fvc-shadow-m);
    transform: translateX(calc(-100% - 2px));
    visibility: hidden;
    pointer-events: none;
    transition: transform 180ms ease, visibility 0s linear 180ms;
  }
  .card .wide-timeline-open .wide-timeline-panel {
    transform: translateX(0);
    visibility: visible;
    pointer-events: auto;
    transition: transform 180ms ease, visibility 0s linear 0s;
  }
  .card .wide-timeline-push .wide-timeline-panel {box-shadow:none;}
  .card .wide-timeline-width-resizing,
  .card .wide-timeline-width-resizing * {cursor:col-resize!important;user-select:none;}
  .card .wide-timeline-width-resizing.wide-timeline-enabled,
  .card .wide-timeline-width-resizing .wide-timeline-panel,
  .card .wide-timeline-width-resizing .wide-timeline-toggle {transition:none;}
  .card .wide-timeline-toggle {
    position: absolute;
    z-index: 20;
    top: 50%;
    left: 0;
    width: 30px;
    height: 112px;
    min-width: 30px;
    min-height: 88px;
    padding: 0;
    border: 1px solid color-mix(in srgb,var(--c-border2) 88%,transparent);
    border-radius: 0 14px 14px 0;
    color: var(--c-text);
    background: color-mix(in srgb,var(--c-bg-panel) 92%,transparent);
    box-shadow: 0 3px 12px color-mix(in srgb,var(--c-bg-deep) 24%,transparent);
    backdrop-filter: blur(7px) saturate(130%);
    -webkit-backdrop-filter: blur(7px) saturate(130%);
    transform: translateY(-50%);
    cursor: pointer;
    opacity: .88;
    touch-action:none;
    user-select:none;
    transition: left 180ms ease,opacity 120ms ease,color 120ms ease,background 120ms ease;
  }
  .card .wide-timeline-toggle::before,
  .card .wide-timeline-toggle::after {
    content:"";
    position:absolute;
    top:50%;
    width:2px;
    height:32px;
    border-radius:2px;
    background:currentColor;
    transform:translateY(-50%);
    opacity:.2;
    pointer-events:none;
  }
  .card .wide-timeline-toggle::before {left:5px;}
  .card .wide-timeline-toggle::after {right:5px;}
  .card .wide-timeline-open .wide-timeline-toggle {
    left: calc(var(--wide-timeline-panel-width) - 15px);
    border-radius:14px;
    cursor:col-resize;
  }
  .card .wide-timeline-toggle:hover,
  .card .wide-timeline-toggle:focus-visible {
    color: var(--c-primary-d);
    background: color-mix(in srgb,var(--c-bg-panel) 88%,transparent);
    opacity: 1;
  }
  .card .wide-timeline-toggle:focus-visible {outline:2px solid var(--c-primary-d);outline-offset:-2px;}
  .card .wide-timeline-toggle svg {position:relative;z-index:1;width:16px;height:26px;pointer-events:none;}
  .card .wide-timeline-header {
    display: grid;
    grid-template-columns: minmax(0,1fr) auto;
    align-items: center;
    gap: 8px;
    flex: 0 0 auto;
    min-height: 48px;
    margin: 3px 8px;
    padding: 4px 8px;
    box-sizing: border-box;
    border-radius: 8px;
    background: var(--c-bg-panel);
    box-shadow: var(--fvc-shadow-s);
  }
  .card .wide-timeline-heading {display:flex;flex-direction:column;min-width:0;font-weight:700;line-height:1.1;}
  .card .wide-timeline-day {min-height:1em;overflow:hidden;color:var(--c-text2);font-size:.68rem;font-weight:600;text-overflow:ellipsis;white-space:nowrap;}
  .card .wide-timeline-scale {
    display:grid;
    grid-template-columns:28px 38px 28px;
    align-items:center;
    min-height:30px;
    overflow:hidden;
    border:1px solid var(--c-border2);
    border-radius:15px;
    background:var(--c-bg-main);
  }
  .card .wide-timeline-scale button {
    display:flex;
    align-items:center;
    justify-content:center;
    width:28px;
    height:28px;
    padding:0;
    border:0;
    color:var(--c-text);
    background:transparent;
    font:700 1rem/1 inherit;
    cursor:pointer;
  }
  .card .wide-timeline-scale button:hover,
  .card .wide-timeline-scale button:focus-visible {color:var(--c-primary-d);background:var(--c-bg-primary);}
  .card .wide-timeline-scale button:disabled {color:var(--c-text4);cursor:default;background:transparent;}
  .card .wide-timeline-scale output {color:var(--c-text2);font-size:.7rem;font-weight:700;text-align:center;}
  .card .wide-timeline-viewport {
    position:relative;
    flex:1 1 0;
    min-width:0;
    min-height:0;
    overflow-x:hidden;
    overflow-y:auto;
    overscroll-behavior:contain;
    scrollbar-width:auto;
    scrollbar-color:color-mix(in srgb,var(--c-text2) 62%,transparent) transparent;
    cursor:grab;
    touch-action:pan-y;
    background:var(--c-bg-main);
  }
  .card .wide-timeline-viewport::-webkit-scrollbar {width:10px;}
  .card .wide-timeline-viewport::-webkit-scrollbar-track {background:transparent;}
  .card .wide-timeline-viewport::-webkit-scrollbar-thumb {
    border:2px solid transparent;
    border-radius:999px;
    background:color-mix(in srgb,var(--c-text2) 58%,transparent);
    background-clip:padding-box;
  }
  .card .wide-timeline-viewport::-webkit-scrollbar-thumb:hover {
    background:color-mix(in srgb,var(--c-text2) 78%,transparent);
    background-clip:padding-box;
  }
  .card .wide-timeline-viewport.is-dragging {cursor:grabbing;user-select:none;scroll-behavior:auto;}
  .card .wide-timeline-content {position:relative;min-height:100%;isolation:isolate;}
  .card .wide-timeline-content::before {
    content:"";
    position:absolute;
    z-index:0;
    inset:0;
    pointer-events:none;
    background:var(--c-bg-panel);
    opacity:.5;
    -webkit-mask-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='72' height='72' viewBox='0%200%2072%2072'%3E%3Cg fill='none' stroke='white' stroke-width='1.25' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M8%2010l7%207-7%207'/%3E%3Cpath d='M47%206l8%208-8%208' transform='rotate(35%2051%2014)'/%3E%3Cpath d='M20%2043l9%209-9%209' transform='rotate(180%2024.5%2052)'/%3E%3Cpath d='M56%2048l7%207-7%207' transform='rotate(-35%2059.5%2055)'/%3E%3C/g%3E%3C/svg%3E");
    mask-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='72' height='72' viewBox='0%200%2072%2072'%3E%3Cg fill='none' stroke='white' stroke-width='1.25' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M8%2010l7%207-7%207'/%3E%3Cpath d='M47%206l8%208-8%208' transform='rotate(35%2051%2014)'/%3E%3Cpath d='M20%2043l9%209-9%209' transform='rotate(180%2024.5%2052)'/%3E%3Cpath d='M56%2048l7%207-7%207' transform='rotate(-35%2059.5%2055)'/%3E%3C/g%3E%3C/svg%3E");
    -webkit-mask-repeat:repeat;
    mask-repeat:repeat;
    -webkit-mask-size:72px 72px;
    mask-size:72px 72px;
  }
  .card .wide-timeline-canvas {position:relative;z-index:1;width:100%;min-height:100%;overflow:hidden;}
  .card .wide-timeline-axis {
    position:absolute;
    z-index:1;
    top:0;
    bottom:0;
    left:18%;
    width:2px;
    transform:translateX(-50%);
    background:color-mix(in srgb,var(--c-primary) 70%,var(--c-border2));
  }
  .card .wide-timeline-tick {position:absolute;z-index:2;top:calc(var(--timeline-y) + var(--timeline-clock-offset,0px));left:0;width:100%;height:1px;pointer-events:none;}
  .card .wide-timeline-tick-time {position:absolute;right:84%;top:0;width:15%;transform:translateY(-50%);color:var(--c-text2);font-size:.61rem;line-height:1;text-align:right;white-space:nowrap;}
  .card .wide-timeline-tick-mark {position:absolute;left:18%;top:0;width:14px;height:2px;transform:translate(-50%,-50%);background:var(--c-text3);}
  .card .wide-timeline-tick.is-minor .wide-timeline-tick-mark {width:9px;background:var(--c-text4);opacity:.9;}
  .card .wide-timeline-day-divider {position:absolute;left:22%;right:4px;top:0;transform:translateY(-50%);overflow:hidden;color:var(--c-text3);font-size:.58rem;font-weight:700;text-overflow:ellipsis;white-space:nowrap;}
  .card .wide-timeline-links {position:absolute;z-index:2;top:0;left:0;width:100%;height:var(--timeline-base-height,100%);overflow:visible;pointer-events:none;transform:translateY(var(--timeline-clock-offset,0px));transform-origin:top left;}
  .card .wide-timeline-link {fill:none;stroke:var(--c-border2);stroke-width:1;opacity:.8;}
  .card .wide-timeline-link.is-alert {stroke:var(--error-color,var(--c-bg-alert));opacity:.9;}
  .card .wide-timeline-marker {
    position:absolute;
    z-index:4;
    top:calc(var(--timeline-marker-y) + var(--timeline-clock-offset,0px));
    left:18%;
    width:11px;
    height:11px;
    box-sizing:border-box;
    border:2px solid var(--c-bg-main);
    border-radius:50%;
    transform:translate(-50%,-50%);
    background:var(--c-primary);
    box-shadow:0 0 0 1px var(--c-border2);
  }
  .card .wide-timeline-marker.is-alert {background:var(--error-color,var(--c-bg-alert));}
  .card .wide-timeline-stack {
    position:absolute;
    z-index:6;
    top:calc(var(--timeline-card-y) + var(--timeline-clock-offset,0px));
    left:38%;
    width:var(--timeline-card-width,160px);
    height:var(--timeline-card-height,90px);
    min-width:0;
    aspect-ratio:16 / 9;
  }
  .card .wide-timeline-card-underlay {
    position:absolute;
    inset:0;
    transition:transform 140ms ease,opacity 140ms ease;
  }
  .card .wide-timeline-card-underlay.depth-1 {transform:translate(9px,9px) rotate(.8deg);opacity:1;}
  .card .wide-timeline-card-underlay.depth-2 {transform:translate(18px,18px) rotate(1.5deg);opacity:1;}
  .card .wide-timeline-stack.has-stack:hover .wide-timeline-card-underlay.depth-1 {transform:translate(11px,11px) rotate(1deg);}
  .card .wide-timeline-stack.has-stack:hover .wide-timeline-card-underlay.depth-2 {transform:translate(21px,21px) rotate(1.8deg);}
  .card .wide-timeline-card-underlay img {display:block;width:100%;height:100%;object-fit:cover;object-position:center;}
  .card .wide-timeline-underlay-placeholder {width:100%;height:100%;}
  .card .wide-timeline-card-main {
    position:absolute;
    inset:0;
    z-index:3;
    display:block;
    width:100%;
    height:100%;
    min-height:0;
    box-sizing:border-box;
    padding:0;
    border:0;
    color:var(--c-text-rev);
    cursor:pointer;
    transform-origin:center;
  }
  .card .wide-timeline-card-main:focus-visible {outline:2px solid var(--c-primary-d);outline-offset:-3px;}
  .card .wide-timeline-card-main img {display:block;width:100%;height:100%;object-fit:cover;object-position:center;}
  .card .wide-timeline-card-placeholder {width:100%;height:100%;}
  .card .wide-timeline-card-label,
  .card .wide-timeline-card-time {position:absolute;z-index:2;padding:1.2px 3.6px;border-radius:3px;background:rgba(0,0,0,.65);font-size:.675rem;font-weight:700;line-height:1;pointer-events:none;}
  .card .wide-timeline-card-label {top:2px;left:3px;right:34px;overflow:hidden;text-overflow:ellipsis;text-transform:capitalize;white-space:nowrap;}
  .card .wide-timeline-card-time {bottom:2px;left:3px;}
  .card .wide-timeline-card-duration {z-index:2;pointer-events:none;}
  .card .wide-timeline-stack-cycle {
    position:absolute;
    z-index:5;
    top:4px;
    right:4px;
    display:flex;
    align-items:center;
    gap:1px;
    min-width:28px;
    height:22px;
    padding:1px 3px 1px 5px;
    border:1px solid var(--c-border2);
    border-radius:11px;
    color:var(--c-text-rev);
    background:color-mix(in srgb,var(--c-bg-deep) 78%,transparent);
    font-size:.58rem;
    font-weight:700;
    cursor:pointer;
  }
  .card .wide-timeline-stack-cycle:hover,
  .card .wide-timeline-stack-cycle:focus-visible {color:var(--c-primary-l);border-color:var(--c-primary-l);}
  .card .wide-timeline-stack-cycle svg {width:12px;height:12px;}
  .card .wide-timeline-stack.is-sliding-next .wide-timeline-card-main {animation:wide-timeline-card-slide-next 180ms ease-out;}
  .card .wide-timeline-stack.is-sliding-previous .wide-timeline-card-main {animation:wide-timeline-card-slide-previous 180ms ease-out;}
  .card .wide-timeline-empty {position:relative;z-index:1;display:flex;align-items:center;justify-content:center;min-height:100%;padding:20px;box-sizing:border-box;color:var(--c-text2);font-size:.76rem;text-align:center;}
  .card .col-right--wide-view .filter-panel,
  .card .col-right--wide-view .cal-panel {z-index:30;}
  @keyframes wide-timeline-card-slide-next {
    from {transform:translateY(18px);opacity:.55;}
    to {transform:translateY(0);opacity:1;}
  }
  @keyframes wide-timeline-card-slide-previous {
    from {transform:translateY(-18px);opacity:.55;}
    to {transform:translateY(0);opacity:1;}
  }
  @media (prefers-reduced-motion:reduce) {
    .card .col-right--wide-view.wide-timeline-enabled,
    .card .wide-timeline-panel,
    .card .wide-timeline-toggle {transition:none;}
    .card .wide-timeline-stack.is-sliding-next .wide-timeline-card-main,
    .card .wide-timeline-stack.is-sliding-previous .wide-timeline-card-main {animation:none;}
  }
`;
