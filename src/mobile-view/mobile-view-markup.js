export function buildMobileViewLayoutShellMarkup({
  liveEngineWrap,
  infoRow,
  pageNav,
  camSwitcher,
  rightColumnShell,
}) {
  return `<div class="layout mobile-view-layout" id="layout">
          <div class="col-left" id="col-left">
            ${liveEngineWrap}

            ${infoRow}
            ${pageNav}
            ${camSwitcher}
          </div>
          <div class="resize-handle" id="resize-handle"></div>
          ${rightColumnShell}

        </div>`;
}
