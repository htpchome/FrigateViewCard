export const TWO_WAY_TALK_SOUNDWAVE_STYLES = `
  .two-way-talk-control-row.has-inline-mute.has-soundwave {
    grid-template-columns: 112px;
    grid-template-rows: 44px;
    gap: 0;
  }
  .two-way-talk-soundwave {
    --fvc-talk-wave-hot: #ff3cac;
    --fvc-talk-wave-violet: #9b5cff;
    --fvc-talk-wave-cyan: #22d3ee;
    --fvc-talk-wave-incoming: #5eead4;
    --fvc-talk-wave-baseline: #dbeafe;
    grid-column: 1;
    grid-row: 1;
    width: 112px;
    height: 44px;
    min-width: 112px;
    overflow: hidden;
    pointer-events: none;
    isolation: isolate;
    background:
      radial-gradient(circle at 48% 50%, rgba(155, 92, 255, .22), transparent 60%),
      linear-gradient(135deg, rgba(34, 211, 238, .07), rgba(255, 60, 172, .08)),
      var(--c-bg-list);
    border: 1px solid rgba(155, 92, 255, .42);
    border-radius: var(--fvc-border-radius, 0px);
    box-sizing: border-box;
    box-shadow:
      var(--fvc-shadow-s),
      inset 0 0 10px rgba(34, 211, 238, .06),
      inset 0 0 14px rgba(255, 60, 172, .07);
    z-index: 0;
  }
  .two-way-talk-soundwave[hidden] {
    display: none !important;
  }
  .two-way-talk-soundwave canvas {
    display: block;
    width: 100%;
    height: 100%;
  }
  .two-way-talk-control-row .info-row-mic-btn,
  .two-way-talk-control-row .two-way-talk-microphone-mute-btn,
  .two-way-talk-control-row .two-way-talk-inline-mute-btn {
    position: relative;
    z-index: 1;
  }
  .two-way-talk-control-row.has-inline-mute.has-soundwave .info-row-mic-btn {
    grid-column: 1;
    grid-row: 1;
    align-self: center;
    justify-self: center;
    z-index: 2;
  }
  .two-way-talk-control-row.has-inline-mute.has-soundwave .two-way-talk-microphone-mute-btn {
    grid-column: 1;
    grid-row: 1;
    align-self: end;
    justify-self: start;
    width: 28px;
    height: 28px;
    min-width: 28px;
    min-height: 28px;
    margin: 0 0 2px 4px;
    padding: 2px;
    color: var(--c-text2);
    z-index: 3;
  }
  .two-way-talk-control-row.has-inline-mute.has-soundwave .two-way-talk-inline-mute-btn {
    grid-column: 1;
    grid-row: 1;
    align-self: end;
    justify-self: end;
    width: 28px;
    height: 28px;
    min-width: 28px;
    min-height: 28px;
    margin: 0 4px 2px 0;
    padding: 2px;
    color: var(--c-text2);
    z-index: 3;
  }
  .two-way-talk-control-row.has-inline-mute.has-soundwave :is(.two-way-talk-microphone-mute-btn,.two-way-talk-inline-mute-btn) svg {
    color: var(--c-text2);
  }
  .two-way-talk-control-row.has-inline-mute.has-soundwave :is(.two-way-talk-microphone-mute-btn,.two-way-talk-inline-mute-btn).talk-audio-active,
  .two-way-talk-control-row.has-inline-mute.has-soundwave :is(.two-way-talk-microphone-mute-btn,.two-way-talk-inline-mute-btn).talk-audio-active svg {
    color: var(--c-text);
  }
  .two-way-talk-control-row.has-inline-mute.has-soundwave :is(.two-way-talk-microphone-mute-btn,.two-way-talk-inline-mute-btn) svg {
    width: 20px;
    height: 20px;
  }
  @media (prefers-reduced-motion: reduce) {
    .two-way-talk-soundwave canvas {
      opacity: 0.55;
    }
  }
`;
