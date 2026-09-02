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

const buildFrigateViewBrandMarkup = () => `
  <svg class="card-picker-demo-brand" viewBox="0 0 512 288" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
    <defs>
      <linearGradient id="card-picker-demo-brand-gold" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#ffd166"></stop>
        <stop offset=".55" stop-color="#f6a02d"></stop>
        <stop offset="1" stop-color="#c77b00"></stop>
      </linearGradient>
    </defs>
    <rect width="512" height="288" fill="#000000"></rect>
    <g fill="url(#card-picker-demo-brand-gold)" transform="translate(149 3) scale(.45)">
      <path d="M72 54c18 46 48 83 88 106 27 16 61 28 91 44 23 13 31 29 24 53-5 19-17 40-34 61-18 22-38 41-56 48-27 11-77-6-107-18 59-14 112-43 153-79-51-1-90-7-118-24-36-23-50-76-46-140 1-20 2-38 5-51Z"></path>
      <path d="M154 20c-15 24-18 45-15 65 4 31 23 54 54 73 20 13 45 23 69 34 31 15 54 34 71 58l-1-34c-22-28-46-46-81-65-46-25-75-49-91-76-8-13-8-35-6-55Z"></path>
      <path d="M231 343c39-12 74-29 98-52 21-21 28-45 31-90 2-31 16-50 48-56-9-11-19-15-31-15-10-14-22-22-35-23-25 0-43 18-51 50 16-16 37-30 54-25 6 2 11 5 15 9-19 10-28 27-28 49v26c-17-21-36-35-58-45 18 20 26 48 22 76-4 37-27 71-65 96Z"></path>
    </g>
    <text x="256" y="226" fill="#bdbdbd" font-family="Arial, Helvetica, sans-serif" font-size="45" font-weight="300" letter-spacing=".5" text-anchor="middle">FRIGATEVIEW</text>
    <text x="256" y="259" fill="#f7941d" font-family="Arial, Helvetica, sans-serif" font-size="18" font-weight="400" text-anchor="middle">For Home Assistant and Frigate</text>
  </svg>`;

export function buildCardPickerDemoLiveMarkup() {
  return `<div class="card-picker-demo-live" role="img" aria-label="FrigateView preview branding">
      ${buildFrigateViewBrandMarkup()}
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
