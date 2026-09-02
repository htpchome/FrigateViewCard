const buildGenericCameraSceneMarkup = (variant = "entry") => {
  const subjectMarkup =
    variant === "vehicle"
      ? `<g class="card-picker-demo-scene-subject">
          <rect x="192" y="113" width="72" height="27" rx="7"></rect>
          <path d="M205 113l12-18h27l14 18z"></path>
          <circle cx="211" cy="142" r="8"></circle>
          <circle cx="249" cy="142" r="8"></circle>
        </g>`
      : variant === "person"
        ? `<g class="card-picker-demo-scene-subject">
            <circle cx="221" cy="88" r="11"></circle>
            <path d="M207 105q14-10 28 0l8 35h-13l-3 30h-13l-3-30h-13z"></path>
          </g>`
        : `<g class="card-picker-demo-scene-subject">
            <rect x="207" y="111" width="45" height="18" rx="5"></rect>
            <circle cx="217" cy="132" r="6"></circle>
            <circle cx="243" cy="132" r="6"></circle>
          </g>`;

  return `<svg class="card-picker-demo-scene" viewBox="0 0 320 180" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <rect class="card-picker-demo-scene-sky" width="320" height="94"></rect>
      <rect class="card-picker-demo-scene-ground" y="94" width="320" height="86"></rect>
      <path class="card-picker-demo-scene-path" d="M111 180l52-86h63l38 86z"></path>
      <path class="card-picker-demo-scene-building" d="M0 57l69-38 72 38v123H0z"></path>
      <path class="card-picker-demo-scene-roof" d="M0 61l69-43 78 43-8 12-70-37L7 73z"></path>
      <rect class="card-picker-demo-scene-door" x="52" y="84" width="42" height="70" rx="2"></rect>
      <rect class="card-picker-demo-scene-window" x="9" y="85" width="31" height="28" rx="2"></rect>
      <g class="card-picker-demo-scene-landscape">
        <circle cx="279" cy="64" r="31"></circle>
        <rect x="274" y="65" width="10" height="56" rx="3"></rect>
        <circle cx="300" cy="91" r="23"></circle>
      </g>
      ${subjectMarkup}
      <path class="card-picker-demo-scene-frame" d="M3 3h314v174H3z"></path>
    </svg>`;
};

export function buildCardPickerDemoLiveMarkup() {
  return `<div class="card-picker-demo-live" role="img" aria-label="Generic camera preview illustration">
      ${buildGenericCameraSceneMarkup("entry")}
      <span class="card-picker-demo-live-label">Demo camera</span>
    </div>`;
}

const buildDemoAlertMarkup = ({ variant, title, area, age }) => `
  <div class="list-item compact shadow-small card-picker-demo-alert" aria-label="Demo alert: ${title}">
    <div class="et alert">
      ${buildGenericCameraSceneMarkup(variant)}
      <span class="card-picker-demo-alert-badge">Demo</span>
    </div>
    <div class="rev-inf">
      <div class="rev-t">${title} <span class="cam-badge list-bubble">${area}</span></div>
      <div class="rev-m">
        <span class="time-meta">${age}</span>
        <span class="review-meta">Alert</span>
      </div>
    </div>
  </div>`;

export function buildCardPickerDemoAlertsMarkup() {
  return [
    buildDemoAlertMarkup({
      variant: "person",
      title: "Person",
      area: "entry",
      age: "2 min ago",
    }),
    buildDemoAlertMarkup({
      variant: "vehicle",
      title: "Vehicle",
      area: "driveway",
      age: "8 min ago",
    }),
  ].join("");
}
