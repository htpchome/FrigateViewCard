/** FrigateView Card - generated file. Edit src/ instead. MIT license: frigate-view-card.LICENSE.txt. */
const Ki="1.1.5-dev.218",Yi="2026.9.0",ae="FrigateView",ke=`${ae} Card`,qe="frigate-view-card",pt=ae,Ot="{Camera}",le=5,de=5,So=24*3600,Re=Object.freeze([2,5,10,15,30,60]),Ee=60,Ne=Object.freeze([10,20,30,60,120,300]),Xi=5,Ie=Object.freeze([10,20,30,60]),Be=Object.freeze([10,20,30,60]),Ae=1e4,je=Object.freeze([10,20,30,60,120]),Me=1e4,We=Object.freeze([10,20,30,60]),Co=Object.freeze({mouse:Object.freeze({leaveHideDelayMs:500})}),ko=Object.freeze({mouse:Object.freeze({controlsHideMs:1e4,activeSlideshowAndTakeoverFadeStartMs:1e4,activeSlideshowAndTakeoverHideMs:1e4}),touch:Object.freeze({controlsHideMs:3e3,activeSlideshowAndTakeoverFadeStartMs:3e3,activeSlideshowAndTakeoverHideMs:5e3})}),Ji=1e4,Fe=Object.freeze([5,10,20,30,60,120]),ce=12,N="frigate_go2rtc",Le=["alerts","clips","snapshot","recordings","kept"],Ge=Object.freeze(["snapshot"]),he=Object.freeze(["light","dark"]),ua=Object.freeze({"--c-bg-main":"var(--card-background-color)","--c-bg-primary":"var(--primary-background-color)","--c-bg-panel":"var(--secondary-background-color)","--c-bg-tabs-holder":"var(--fvc-tabs-holder)","--c-bg-deep":"#111111","--c-bg-mobile":"var(--wa-color-neutral-fill-normal, var(--secondary-background-color))","--c-bg-mobile-list":"#f0f0f0","--c-bg-list":"#f0f0f0","--c-bg-cam-btn":"#f0f0f0","--c-text":"var(--primary-text-color)","--c-text2":"var(--secondary-text-color)","--c-text3":"var(--state-inactive-color)","--c-text4":"var(--disabled-text-color)","--c-text-rev":"var(--text-primary-color)","--c-border":"var(--secondary-background-color)","--c-border2":"var(--disabled-text-color)","--c-primary":"var(--primary-color)","--c-primary-l":"var(--light-primary-color)","--c-primary-d":"var(--dark-primary-color)","--c-accent":"var(--accent-color)","--c-on":"#4ade80","--c-off":"#FCA5A5","--c-bg-scrub":"#c2f2c1","--c-bg-detect":"var(--warning-color)","--c-bg-alert":"var(--error-color)"}),$t=Object.freeze([{key:"--c-bg-main",label:"Background Color"},{key:"--c-bg-primary",label:"Primary Background Color"},{key:"--c-bg-panel",label:"Secondary Background Color"},{key:"--c-bg-tabs-holder",label:"Navigation Tabs Background"},{key:"--c-bg-deep",label:"Video Background Color"},{key:"--c-bg-mobile",label:"Mobile Background Color"},{key:"--c-bg-mobile-list",label:"Mobile List Background Color"},{key:"--c-bg-list",label:"List Background Color"},{key:"--c-bg-cam-btn",label:"Camera Button Background Color"},{key:"--c-text",label:"Primary Text Color"},{key:"--c-text2",label:"Secondary Text Color"},{key:"--c-text3",label:"Third Text Color"},{key:"--c-text4",label:"Fourth Text Color"},{key:"--c-text-rev",label:"Reverse Text Color"},{key:"--c-border",label:"Border Color One"},{key:"--c-border2",label:"Border Color Two"},{key:"--c-primary",label:"Primary Color"},{key:"--c-primary-l",label:"Primary Light Color"},{key:"--c-primary-d",label:"Primary Dark Color"},{key:"--c-accent",label:"Accent Color"},{key:"--c-bg-scrub",label:"Scrub Bar Background"},{key:"--c-bg-detect",label:"Detection/Motion"},{key:"--c-bg-alert",label:"Alert/Review"}]),Ue=new Set($t.map(e=>e.key)),F={packageCheck:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2 3 7v10l9 5 5.2-2.9-1.5-1.5-2.7 1.5v-6.2l6-3.3v4.9h2V7L12 2m0 2.3L18.6 8 12 11.7 5.4 8 12 4.3M5 9.7l6 3.3v6.1l-6-3.3V9.7m15.6 6.1 1.4 1.4-4.7 4.7-2.8-2.8 1.4-1.4 1.4 1.4 3.3-3.3Z"/></svg>',homeAssistant:'<svg fill="currentColor" viewBox="0 0 24 24"><path d="M21.8,13H20V21H13V17.67L15.79,14.88L16.5,15C17.66,15 18.6,14.06 18.6,12.9C18.6,11.74 17.66,10.8 16.5,10.8A2.1,2.1 0 0,0 14.4,12.9L14.5,13.61L13,15.13V9.65C13.66,9.29 14.1,8.6 14.1,7.8A2.1,2.1 0 0,0 12,5.7A2.1,2.1 0 0,0 9.9,7.8C9.9,8.6 10.34,9.29 11,9.65V15.13L9.5,13.61L9.6,12.9A2.1,2.1 0 0,0 7.5,10.8A2.1,2.1 0 0,0 5.4,12.9A2.1,2.1 0 0,0 7.5,15L8.21,14.88L11,17.67V21H4V13H2.25C1.83,13 1.42,13 1.42,12.79C1.43,12.57 1.85,12.15 2.28,11.72L11,3C11.33,2.67 11.67,2.33 12,2.33C12.33,2.33 12.67,2.67 13,3L17,7V6H19V9L21.78,11.78C22.18,12.18 22.59,12.59 22.6,12.8C22.6,13 22.2,13 21.8,13M7.5,12A0.9,0.9 0 0,1 8.4,12.9A0.9,0.9 0 0,1 7.5,13.8A0.9,0.9 0 0,1 6.6,12.9A0.9,0.9 0 0,1 7.5,12M16.5,12C17,12 17.4,12.4 17.4,12.9C17.4,13.4 17,13.8 16.5,13.8A0.9,0.9 0 0,1 15.6,12.9A0.9,0.9 0 0,1 16.5,12M12,6.9C12.5,6.9 12.9,7.3 12.9,7.8C12.9,8.3 12.5,8.7 12,8.7C11.5,8.7 11.1,8.3 11.1,7.8C11.1,7.3 11.5,6.9 12,6.9Z"/></svg>',frigate:'<svg viewBox="0 0 512 512" fill="currentColor"><path d="M130 446.5C131.6 459.3 145 468 137 470C129 472 94 406.5 86 378.5C78 350.5 73.5 319 75.5 301C77.4999 283 181 255 181 247.5C181 240 147.5 247 146 241C144.5 235 171.3 238.6 178.5 229C189.75 214 204 216.5 213 208.5C222 200.5 233 170 235 157C237 144 215 129 209 119C203 109 222 102 268 83C314 64 460 22 462 27C464 32 414 53 379 66C344 79 287 104 287 111C287 118 290 123.5 288 139.5C286 155.5 285.76 162.971 282 173.5C279.5 180.5 277 197 282 212C286 224 299 233 305 235C310 235.333 323.8 235.8 339 235C358 234 385 236 385 241C385 246 344 243 344 250C344 257 386 249 385 256C384 263 350 260 332 260C317.6 260 296.333 259.333 287 256L285 263C281.667 263 274.7 265 267.5 265C258.5 265 258 268 241.5 268C225 268 230 267 215 266C200 265 144 308 134 322C124 336 130 370 130 385.5C130 399.428 128 430.5 130 446.5Z"/></svg>',airplayVideo:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 22h12l-6-6-6 6M21 3H3c-1.11 0-2 .89-2 2v12c0 1.1.9 2 2 2h4v-2H3V5h18v12h-4v2h4c1.1 0 2-.9 2-2V5c0-1.11-.9-2-2-2Z"/></svg>',webrtc:'<svg fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C14.44 2 16.5 3.75 16.91 6.07L17.75 6C20.5 6 22.75 8.24 22.75 11C22.75 12.89 21.7 14.53 20.16 15.38C20.54 16.09 20.75 16.89 20.75 17.75C20.75 20.5 18.5 22.75 15.75 22.75C14.26 22.75 12.92 22.1 12 21.06C11.08 22.1 9.74 22.75 8.25 22.75C5.5 22.75 3.25 20.5 3.25 17.75C3.25 16.89 3.47 16.09 3.84 15.38C2.3 14.53 1.25 12.89 1.25 11C1.25 8.24 3.5 6 6.25 6L7.09 6.07C7.5 3.75 9.56 2 12 2M6.75 20.25L13.66 17H17C17.55 17 18 16.55 18 16V9C18 8.45 17.55 8 17 8H7C6.45 8 6 8.45 6 9V16C6 16.55 6.45 17 7 17H7.77L6.75 20.25Z" /></svg>',live:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M17 10.5V7a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-3.5l4 4v-11l-4 4z"/></svg>',recordings:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M18 4l2 4h-3l-2-4h-2l2 4h-3l-2-4H8l2 4H7L5 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4h-4z"/></svg>',clips:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-8 12.5v-9l6 4.5-6 4.5z"/></svg>',snapshot:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 15.2A3.2 3.2 0 0 1 8.8 12 3.2 3.2 0 0 1 12 8.8 3.2 3.2 0 0 1 15.2 12 3.2 3.2 0 0 1 12 15.2M20 4h-3.17L15 2H9L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2z"/></svg>',takeSnapshot:'<svg  fill="currentColor" viewBox="0 0 24 24"><path d="M3 4V1H5V4H8V6H5V9H3V6H0V4M6 10V7H9V4H16L17.8 6H21C22.1 6 23 6.9 23 8V20C23 21.1 22.1 22 21 22H5C3.9 22 3 21.1 3 20V10M13 19C17.45 19 19.69 13.62 16.54 10.46C13.39 7.31 8 9.55 8 14C8 16.76 10.24 19 13 19M9.8 14C9.8 16.85 13.25 18.28 15.26 16.26C17.28 14.25 15.85 10.8 13 10.8C11.24 10.8 9.8 12.24 9.8 14Z" /></svg>',filmstrip:'<svg fill="currentColor" viewBox="0 0 24 24"><path d="M18,9H16V7H18M18,13H16V11H18M18,17H16V15H18M8,9H6V7H8M8,13H6V11H8M8,17H6V15H8M18,3V5H16V3H8V5H6V3H4V21H6V19H8V21H16V19H18V21H20V3H18Z" /></svg>',movieOpen:'<svg fill="currentColor" viewBox="0 0 24 24"><path d="M20.84 2.18L16.91 2.96L19.65 6.5L21.62 6.1L20.84 2.18M13.97 3.54L12 3.93L14.75 7.46L16.71 7.07L13.97 3.54M9.07 4.5L7.1 4.91L9.85 8.44L11.81 8.05L9.07 4.5M4.16 5.5L3.18 5.69A2 2 0 0 0 1.61 8.04L2 10L6.9 9.03L4.16 5.5M2 10V20C2 21.11 2.9 22 4 22H20C21.11 22 22 21.11 22 20V10H2Z" /></svg>',alerts:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L4 5v6c0 5 3.4 9.7 8 11 4.6-1.3 8-6 8-11V5l-8-3zm-1 14l-4-4 1.4-1.4L11 13.2l5.6-5.6L18 9l-7 7z"/></svg>',clock:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z"/></svg>',pin:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>',close:'<svg fill="currentColor" viewBox="0 0 24 24"><path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" /></svg>',cameraAdd:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 4V1h2v3h3v2H5v3H3V6H0V4h3m5 6V7h3V4h5l1.8 2H21c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H5c-1.1 0-2-.9-2-2V10h5m5 9a5 5 0 1 0 0-10 5 5 0 0 0 0 10m0-2a3 3 0 1 1 0-6 3 3 0 0 1 0 6Z"/></svg>',lightAdd:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a7 7 0 0 0-4.15 12.63c.74.55 1.15 1.2 1.15 1.87V18h6v-1.5c0-.67.41-1.32 1.15-1.87A7 7 0 0 0 12 2m-2 18h4v2h-4v-2M21 7h-2V5h-2V3h2v2h2v2Z"/></svg>',gridExclude:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 13H5v-2h14v2Z"/></svg>',gridInclude:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2Z"/></svg>',back:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>',forward:'<svg fill="currentColor" viewBox="0 0 24 24"><path d="M4,11V13H16L10.5,18.5L11.92,19.92L19.84,12L11.92,4.08L10.5,5.5L16,11H4Z" /></svg>',left:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M15.41 7.41 14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg>',right:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="m8.59 16.59 1.41 1.41L16 12 10 6 8.59 7.41 13.17 12z"/></svg>',pipPopOut:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="m4.264 5.633-.594.804 8.555 6.321.594-.803z"/><path fill-rule="evenodd" d="m14.145 13.557-3.921.211 2.972-4.021z"/><path d="M3.68 2.867A3.185 3.185 0 0 0 .5 6.047v10.641a3.185 3.185 0 0 0 3.18 3.18h11.332A1.5 1.5 0 0 1 15 19.674v-.855H3.68a2.126 2.126 0 0 1-2.133-2.131V6.047A2.127 2.127 0 0 1 3.68 3.914h14.141a2.127 2.127 0 0 1 2.131 2.133V14H21V6.047a3.185 3.185 0 0 0-3.18-3.18z"/><path d="M16.75 14.75h5.325a1 1 0 0 1 1 1v4.174a1 1 0 0 1-1 1H16.75a1 1 0 0 1-1-1V15.75a1 1 0 0 1 1-1z"/></svg>',pipPopIn:'<svg fill="currentColor" viewBox="0 0 24 24" ><path d="m22.066 20.929 0.60193-0.79808-8.492-6.4054-0.60192 0.79708z"/><path d="m12.264 12.908 3.9229-0.17217-3.0117 3.9914z" fill-rule="evenodd"/><path d="M3.68 2.867A3.185 3.185 0 0 0 .5 6.047v10.641a3.185 3.185 0 0 0 3.18 3.18h11.332A1.5 1.5 0 0 1 15 19.674v-.855H3.68a2.126 2.126 0 0 1-2.133-2.131V6.047A2.127 2.127 0 0 1 3.68 3.914h14.141a2.127 2.127 0 0 1 2.131 2.133V14H21V6.047a3.185 3.185 0 0 0-3.18-3.18z"/><path d="m4.6157 6.3473h5.325a1 1 0 0 1 1 1v4.174a1 1 0 0 1-1 1h-5.325a1 1 0 0 1-1-1v-4.174a1 1 0 0 1 1-1z"/></svg>',play:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>',pause:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6zm8-14v14h4V5z"/></svg>',download:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg>',star:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>',starO:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>',bullseye:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2A10 10 0 0 0 2 12A10 10 0 0 0 12 22A10 10 0 0 0 22 12A10 10 0 0 0 12 2M12 4A8 8 0 0 1 20 12A8 8 0 0 1 12 20A8 8 0 0 1 4 12A8 8 0 0 1 12 4M12 6A6 6 0 0 0 6 12A6 6 0 0 0 12 18A6 6 0 0 0 18 12A6 6 0 0 0 12 6M12 8A4 4 0 0 1 16 12A4 4 0 0 1 12 16A4 4 0 0 1 8 12A4 4 0 0 1 12 8Z" /></svg>',ptz:'<svg  fill="currentColor" viewBox="0 0 24 24"><path d="M9,12C9,11.19 9.3,10.5 9.89,9.89C10.5,9.3 11.19,9 12,9C12.81,9 13.5,9.3 14.11,9.89C14.7,10.5 15,11.19 15,12C15,12.81 14.7,13.5 14.11,14.11C13.5,14.7 12.81,15 12,15C11.19,15 10.5,14.7 9.89,14.11C9.3,13.5 9,12.81 9,12M5.53,8.44L7.31,10.22L5.53,12L7.31,13.78L5.53,15.56L2,12L5.53,8.44M8.44,18.47L10.22,16.69L12,18.47L13.78,16.69L15.56,18.47L12,22L8.44,18.47M18.47,15.56L16.69,13.78L18.47,12L16.69,10.22L18.47,8.44L22,12L18.47,15.56M15.56,5.53L13.78,7.31L12,5.53L10.22,7.31L8.44,5.53L12,2L15.56,5.53Z" /></svg>',calendar:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 18H5V8h14v13z"/></svg>',filter:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M10 18h4v-2h-4v2zM3 6v2h18V6H3zm3 7h12v-2H6v2z"/></svg>',expand:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/></svg>',chevron:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6z"/></svg>',resize:'<svg fill="currentColor" viewBox="0 0 24 24" ><path d="m9.3946 2-7.3946 9.9502 7.3946 9.9497zm5.2109 0.1001v19.9l7.3946-9.9502z" style="stroke-width:0"/></svg>',rotate:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 6v3l4-4-4-4v3c-4.42 0-8 3.58-8 8 0 1.57.46 3.03 1.24 4.26L6.7 14.8A5.87 5.87 0 0 1 6 12c0-3.31 2.69-6 6-6zm6.76 1.74L17.3 9.2A5.87 5.87 0 0 1 18 12c0 3.31-2.69 6-6 6v-3l-4 4 4 4v-3c4.42 0 8-3.58 8-8 0-1.57-.46-3.03-1.24-4.26z"/></svg>',presentationPlay:'<svg viewBox="0 0 24 24" style="width:24px;height:24px"><path fill="currentColor" d="M2,3H22C23.1,3 24,3.9 24,5V17C24,18.1 23.1,19 22,19H16V21H8V19H2C0.9,19 0,18.1 0,17V5C0,3.9 0.9,3 2,3M2,5V17H22V5H2M10,8V14L16,11L10,8Z" /></svg>',presentationPlayActive:'<svg viewBox="0 0 24 24" style="width:24px;height:24px"><path fill="currentColor" d="M2,3H22C23.1,3 24,3.9 24,5V17C24,18.1 23.1,19 22,19H16V21H8V19H2C0.9,19 0,18.1 0,17V5C0,3.9 0.9,3 2,3M2,5V17H22V5H2M10,8V14L16,11L10,8Z" /></svg>',volOff:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M16.5 12A4.5 4.5 0 0 0 14 7.97v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/></svg>',volOn:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3A4.5 4.5 0 0 0 14 7.97v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>',grid:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 3v8h8V3H3zm6 6H5V5h4v4zm-6 4v8h8v-8H3zm6 6H5v-4h4v4zm4-16v8h8V3h-8zm6 6h-4V5h4v4zm-6 4v8h8v-8h-8zm6 6h-4v-4h4v4z"/></svg>',person:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>',divider:'<svg fill="currentColor" version="1.1" viewBox="0 0 8 24"><path d="m3.7826 3h0.43584c0.411 0 0.74108 0.33008 0.74108 0.74208v16.516c0 0.412-0.33008 0.74208-0.74108 0.74208h-0.43584c-0.411 0-0.74208-0.33008-0.74208-0.74208v-16.516c0-0.412 0.33108-0.74208 0.74208-0.74208z"/></svg>',singleView:'<svg fill="currentColor" viewBox="0 0 24 24"><path d="M6,2H18A2,2 0 0,1 20,4V20A2,2 0 0,1 18,22H6A2,2 0 0,1 4,20V4A2,2 0 0,1 6,2M6,4V8H18V4H6Z" /></svg>',cameraGroupSplit:'<svg fill="currentColor" viewBox="0 0 24 24"><path d="M3,4A2,2 0 0,1 5,2H19A2,2 0 0,1 21,4V20A2,2 0 0,1 19,22H5A2,2 0 0,1 3,20V4M5,4V20H11V4H5M13,4V20H19V4H13Z" /></svg>',list:'<svg fill="currentColor" viewBox="0 0 24 24"><path d="M9,5V9H21V5M9,19H21V15H9M9,14H21V10H9M4,9H8V5H4M4,19H8V15H4M4,14H8V10H4V14Z" /></svg>',preView:'<svg fill="currentColor" viewBox="0 0 24 24"><path d="m4 18c-0.554 0-1 0.446-1 1v1c0 0.554 0.446 1 1 1h16c0.554 0 1-0.446 1-1v-1c0-0.554-0.446-1-1-1zm0-5c-0.554 0-1 0.446-1 1v1c0 0.554 0.446 1 1 1h16c0.554 0 1-0.446 1-1v-1c0-0.554-0.446-1-1-1zm0-5c-0.554 0-1 0.446-1 1v1c0 0.554 0.446 1 1 1h16c0.554 0 1-0.446 1-1v-1c0-0.554-0.446-1-1-1zm0-5c-0.554 0-1 0.446-1 1v1c0 0.554 0.446 1 1 1h16c0.554 0 1-0.446 1-1v-1c0-0.554-0.446-1-1-1z" stroke-width:0"/></svg>',wideView:'<svg fill="currentColor" viewBox="0 0 24 24"><path d="M3,3H11V5H3V3M13,3H21V5H13V3M3,7H11V9H3V7M13,7H21V9H13V7M3,11H11V13H3V11M13,11H21V13H13V11M3,15H11V17H3V15M13,15H21V17H13V15M3,19H11V21H3V19M13,19H21V21H13V19Z" /></svg>',mobileView:'<svg fill="currentColor" viewBox="0 0 24 24"><path d="M17,19H7V5H17M17,1H7C5.89,1 5,1.89 5,3V21A2,2 0 0,0 7,23H17A2,2 0 0,0 19,21V3C19,1.89 18.1,1 17,1Z" /></svg>',cardView:'<svg fill="currentColor" viewBox="0 0 24 24"><path d="m3 3h18c1.1046 0 2 0.89543 2 2v14c0 1.1046-0.89543 2-2 2h-18c-1.1046 0-2-0.89543-2-2v-14c0-1.1046 0.89543-2 2-2m0 2v8h18v-8h-18m0 10v4h8v-4h-8m8 0v4h10v-4z"/></svg>',micOn:'<svg fill="currentColor" viewBox="0 0 24 24"><path d="M12,2A3,3 0 0,1 15,5V11A3,3 0 0,1 12,14A3,3 0 0,1 9,11V5A3,3 0 0,1 12,2M19,11C19,14.53 16.39,17.44 13,17.93V21H11V17.93C7.61,17.44 5,14.53 5,11H7A5,5 0 0,0 12,16A5,5 0 0,0 17,11H19Z" /></svg>',micOff:'<svg fill="currentColor" viewBox="0 0 24 24"><path d="M19,11C19,12.19 18.66,13.3 18.1,14.28L16.87,13.05C17.14,12.43 17.3,11.74 17.3,11H19M15,11.16L9,5.18V5A3,3 0 0,1 12,2A3,3 0 0,1 15,5V11L15,11.16M4.27,3L21,19.73L19.73,21L15.54,16.81C14.77,17.27 13.91,17.58 13,17.72V21H11V17.72C7.72,17.23 5,14.41 5,11H6.7C6.7,14 9.24,16.1 12,16.1C12.81,16.1 13.6,15.91 14.31,15.58L12.65,13.92L12,14A3,3 0 0,1 9,11V10.28L3,4.27L4.27,3Z" /></svg>',frigateView:'<svg version="1.1" viewBox="0 0 800 140"><path class="frigate-view-accent" d="m495.84 4.002 34.867 97.625h7.3887l-34.865-97.625zm-343.18 2e-3v12.553h19.525v-12.553zm484.87 19.52c-24.687 0-39.328 13.808-39.328 39.748 0 24.824 13.807 39.748 39.328 39.748 21.896 0 35.984-10.879 38.912-31.52h-6.9727c-2.3726 16.877-12.972 24.547-31.939 24.547-22.314 0-32.354-10.88-32.354-32.775h71.684c0-25.94-14.645-39.748-39.33-39.748zm34.859 1.3945 22.592 76.707h6.9727l-22.592-76.707zm59.828 0 23.291 76.707h6.9727l-23.291-76.707zm-147.12 2e-3v76.707h6.9727v-76.707zm52.438 5.5781c19.665 0 30.124 8.228 32.076 26.498l-64.15-2e-3c1.9523-18.268 12.41-26.496 32.074-26.496z"/><path d="m372.71 4v20.922h-10.041v16.734h10.041v32.775c8e-4 21.755 12.691 27.191 25.102 27.191h23.988v-18.129h-19.664c-5.2991 0-9.9024-2.0927-9.9024-9.6231v-32.217h29.566v-16.736h-29.566v-20.918zm-362.71 0.0038736v97.623h20.918v-40.445h57.182v-18.131h-57.182v-20.92h57.18v-18.127zm562.96 0-34.867 97.623h7.3906l34.867-97.623zm12.123 0v6.2734h6.9726v-6.2734zm-365.77 19.52c-26.916 0-40.164 13.808-40.164 39.75 0 24.822 12.274 39.744 40.164 39.744 13.668 0 21.617-3.624 26.219-10.459v7.6699c0 11.297-7.3897 19.387-23.291 19.387-7.3909 0-14.084-2.9298-18.547-11.297h-21.061c4.1835 21.198 21.06 30.123 39.607 30.123 24.547 0 42.816-14.922 42.816-33.051v-80.473h-19.525v8.9277c-4.4624-6.6936-12.411-10.322-26.219-10.322zm92.596 0c-26.918 0-40.166 13.808-40.166 39.748 0 24.824 12.274 39.748 40.166 39.748 13.668 0 21.615-3.6259 26.219-10.459v9.0644h19.523v-76.707h-19.525v8.9277c-4.4624-6.6936-12.409-10.322-26.217-10.322zm155.07 0c-26.918 0-42.955 13.808-42.955 39.748 0 24.824 15.063 39.748 42.955 39.748 22.732 0 37.795-10.043 41.978-28.869h-21.061c-3.4863 6.6917-10.736 10.043-20.918 10.043-14.085 0-22.175-6.6967-23.291-17.994h66.246v-2.9277c0-24.824-15.063-39.748-42.955-39.748zm-374.15 1.3945 2e-3 76.707h19.523v-36.541c0-11.993 10.737-23.43 28.73-23.43h8.6465v-16.734h-8.6465c-13.389 0-23.011 3.7654-28.73 13.248v-13.25zm59.828 0.0019v76.707h19.523v-76.707zm572.58 0-23.291 76.705h6.9726l23.295-76.705zm59.832 0-22.596 76.705h6.9726l22.596-76.705zm-562.97 17.432c15.202 0 23.43 7.8096 23.43 20.922 0 13.666-8.6459 20.918-23.43 20.918-15.2 0-23.43-7.8096-23.43-20.92 0-13.666 8.6479-20.92 23.43-20.92zm92.596 0c15.202 0 23.43 7.8096 23.43 20.922 0 13.666-8.6459 20.918-23.43 20.918-15.202 0-23.43-7.8096-23.43-20.92 0-13.666 8.6479-20.92 23.43-20.92zm152.28 0c10.182 0 17.154 3.4872 20.779 9.625h-41.561c3.6257-6.2772 10.88-9.625 20.781-9.625z" style="fill:currentColor"/></svg>'},_=Object.freeze({singleView:"single-view",mobileView:"mobile-view",preview:"preview",wideView:"wide-view",cardView:"card-view"}),b=Object.freeze({mobile:_.mobileView,card:_.cardView,previewMobile:"preview-mobile-view",previewCard:"preview-card-view",previewSingle:"preview-single-view",single:_.singleView}),C=Object.freeze({dashboardWide:"dashboard-wide",insideCard:"inside-card",landingDashboard:"landing-dashboard",none:"none"}),D=Object.freeze({mobile:"mobile",tablet:"tablet",desktop:"desktop"}),va=Object.freeze([_.singleView,_.mobileView,_.preview,_.wideView,_.cardView]),Ht=Object.freeze([_.preview,_.singleView,_.mobileView,_.wideView,_.cardView]),qt=Object.freeze([_.preview,_.singleView,_.mobileView,_.cardView]),Qi=new Set(va),er=new Set(Object.values(b)),tr=new Set(Object.values(C)),ie=e=>{const t=String(e||"").trim().toLowerCase();return t==="normal"||t==="single"?_.singleView:t==="mobile"||t==="mobile_view"?_.mobileView:t==="wide"||t==="wide_view"?_.wideView:t==="card"||t==="card_view"?_.cardView:t==="preview"?_.preview:Qi.has(t)?t:_.singleView},Ze=e=>{const t=String(e||"").trim().toLowerCase().replace(/[_+\s]+/g,"-");return t==="preview"?b.previewSingle:t==="preview-mobile"?b.previewMobile:t==="preview-card"||t===b.previewCard?b.card:t==="preview-single"?b.previewSingle:t==="mobile"||t==="mobile-view"?b.mobile:t==="card"||t==="card-view"?b.card:t==="single"||t==="single-view"?b.single:er.has(t)?t:b.single},Ke=e=>{const t=String(e||"").trim().toLowerCase().replace(/[_+\s]+/g,"-");return t==="preview-dashboard"?C.landingDashboard:tr.has(t)?t:C.dashboardWide},Te=(e,t)=>t===_.singleView?!0:t===_.mobileView?e?.mobile_view_page_enabled!==!1:t===_.preview?e?.preview_page_enabled===!0:t===_.wideView?e?.wide_view_page_enabled===!0:t===_.cardView?e?.card_view_page_enabled===!0:!1,ar=(e,t)=>e===_.wideView?t!==D.mobile:!0,re=(e,t)=>e?.card_view_page_enabled===!0&&e?.card_view_standalone===!0?[_.cardView]:va.filter(a=>Te(e,a)&&ar(a,t)),ir=()=>[b.mobile,b.card,b.previewMobile,b.previewSingle,b.single],Rt=e=>ir().filter(t=>t===b.mobile?Te(e,_.mobileView):t===b.card?Te(e,_.cardView):t===b.previewMobile?Te(e,_.preview)&&Te(e,_.mobileView):t===b.previewSingle?Te(e,_.preview):t===b.single),ga=(e,t)=>{const a=Ze(t);return Rt(e).includes(a)?a:b.single},rr=e=>{const t=Ze(e);return t===b.previewMobile||t===b.previewSingle?_.preview:t},Pe=e=>{if(e?.card_view_page_enabled===!0&&e?.card_view_standalone===!0)return _.cardView;const t=ga(e,e?.mobile_page);return t===b.mobile||t===b.previewMobile?_.mobileView:t===b.card?_.cardView:_.singleView},or=(e,t)=>e?.card_view_page_enabled===!0&&e?.card_view_standalone===!0?_.cardView:t===D.mobile?rr(e?.mobile_page):ie(e?.landing_page),ba=(e,t,a)=>{const i=or(e,t);return a.includes(i)?i:a[0]||_.singleView},fa=(e,t=D.desktop)=>{const a=re(e,t),i=ba(e,t,a),r=new Set([i]);return a.includes(_.preview)&&r.add(_.preview),Ht.filter(o=>r.has(o))},mt=(e,t=D.desktop)=>{const a=re(e,t),i=ba(e,t,a),r=Array.isArray(e?.ha_dashboard_swipe_pages)?e.ha_dashboard_swipe_pages:fa(e,t),o=new Set(r.map(n=>String(n||"").trim().toLowerCase()).filter(n=>a.includes(n)));return o.add(i),Ht.filter(n=>o.has(n))},wa=e=>{const t=re(e,D.mobile),a=Pe(e),i=new Set([a]);return t.includes(_.preview)&&i.add(_.preview),qt.filter(r=>t.includes(r)&&i.has(r))},_t=e=>{const t=re(e,D.mobile),a=Pe(e),i=Array.isArray(e?.ha_dashboard_swipe_mobile_pages)?e.ha_dashboard_swipe_mobile_pages:wa(e),r=new Set(i.map(o=>String(o||"").trim().toLowerCase()).filter(o=>t.includes(o)));return t.includes(a)&&r.add(a),qt.filter(o=>r.has(o))},ut=50,vt=100,Nt=100,ya="%",Ye=e=>{if(e==null||String(e).trim()==="")return Nt;const t=Number(e);return Number.isFinite(t)?Math.min(vt,Math.max(ut,Math.round(t))):Nt},Xe=e=>{const t=String(e||"").trim().toLowerCase();return t==="vh"||t==="dvh"?"dvh":ya},sr=Object.freeze(["light","dark","both"]),xa=e=>String(e||"").trim().toLowerCase()==="dark"?"dark":"light",It=(e,t="light")=>{const a=String(e||"").trim().toLowerCase();return sr.includes(a)?a:xa(t)},nr=(e,t="light")=>{const a=It(e,t);return a==="both"?[...he]:[a]},lr=e=>{const t=Array.isArray(e)?e:[e],a=new Set;return t.forEach(i=>{const r=String(i||"").trim().toLowerCase();r==="both"?he.forEach(o=>a.add(o)):he.includes(r)&&a.add(r)}),he.filter(i=>a.has(i))},Sa=e=>Object.fromEntries(Object.entries(e&&typeof e=="object"?e:{}).filter(([a])=>Ue.has(a)).map(([a,i])=>{const r=String(i||"").trim().toLowerCase();return/^#[0-9a-f]{6}$/.test(r)?[a,r]:/^#[0-9a-f]{3}$/.test(r)?[a,`#${r[1]}${r[1]}${r[2]}${r[2]}${r[3]}${r[3]}`]:[a,""]}).filter(([,a])=>!!a)),gt=e=>{if(!Array.isArray(e))return[];const[t]=e.map(a=>{if(!a||typeof a!="object")return null;const i=lr(a.modes);return i.length?{modes:i,overrides:Sa(a.overrides)}:null}).filter(Boolean);return t?[t]:[]},dr=({scope:e,overrides:t,fallbackMode:a="light"}={})=>[{modes:nr(e,a),overrides:Sa(t)}],Bt=(e,t="light")=>{const a=xa(t),i=gt(e);if(!i.length)return{scope:a,overrides:{}};const[{modes:r,overrides:o}]=i;return{scope:r.length===2?"both":r[0],overrides:{...o}}},bt=25,ft=75,jt=60,Ca=Object.freeze([1,6,12,24]),ka=12,wt=e=>{if(e==null||String(e).trim()==="")return jt;const t=Number(e);return Number.isFinite(t)?Math.min(ft,Math.max(bt,Math.round(t))):jt},yt=e=>{const t=Number(e);return Ca.includes(t)?t:ka},fe=Object.freeze({sideBySide:"side_by_side",stacked:"stacked"}),Je=e=>e===fe.stacked?fe.stacked:fe.sideBySide,Qe=(e,{primaryEntity:t=""}={})=>{if(!e||typeof e!="object"||Array.isArray(e))return null;const a=String(e.secondary_entity||e.secondaryEntity||"").trim(),i=String(t||"").trim();return!a||a===i?null:{secondary_entity:a,layout:Je(e.layout)}},Ea=e=>Qe(e?.group,{primaryEntity:e?.entity})?.secondary_entity||"",Wt=e=>!!Ea(e),Aa=e=>{let t=Math.max(0,Math.floor(Number(e)||0)),a="";do a=String.fromCharCode(65+t%26)+a,t=Math.floor(t/26)-1;while(t>=0);return a},cr=(e=0)=>{const a=Math.max(0,Math.floor(Number(e)||0))*2;return`Group ${Aa(a)}/${Aa(a+1)}`},hr=(e,{excludeIndex:t=-1}={})=>{const a=new Set((Array.isArray(e)?e:[]).map((i,r)=>r===t||!Wt(i)?"":String(i?.name||"").trim().toLowerCase()).filter(Boolean));for(let i=0;;i+=1){const r=cr(i);if(!a.has(r.toLowerCase()))return r}},et=e=>{const t=String(e?.entity||"").trim(),a=Ea(e);return[t,a].filter(Boolean)},pr=e=>et(e).length,Ft=e=>(Array.isArray(e)?e:[]).reduce((t,a)=>t+pr(a),0),Gt=(e,t)=>{const a=Math.max(0,Number(t)||0),i=[];let r=0;for(const o of Array.isArray(e)?e:[]){const n=String(o?.entity||"").trim();if(!n||r>=a)continue;const s=Qe(o?.group,{primaryEntity:n});if(s&&r+2<=a){i.push({...o,group:s}),r+=2;continue}const{group:d,...c}=o;i.push(c),r+=1}return i},mr=(e,t=0)=>{const a=t===1?1:0,i=et(e),r=i[a]||i[0]||"",o=i.length>1,n={...e,entity:r,group:void 0,group_parent_entity:o?i[0]:"",group_member:o?a===0?"A":"B":"",group_member_index:o?a:0,group_layout:o?Je(e?.group?.layout):""};return a===1&&(n.ptz=null,delete n.two_way_talk),n},Ma=e=>(Array.isArray(e)?e:[]).flatMap((t,a)=>et(t).map((i,r)=>({...mr(t,r),logical_camera_index:a}))),B=Object.freeze({default:"default",custom:"custom"}),La=(e,t)=>{const a=new Set;return(Array.isArray(e)?e:[]).map(i=>String(i||"").trim()).filter(i=>!i||!t.has(i)||a.has(i)?!1:(a.add(i),!0))},pe=(e,t=[])=>{const i=Ma(t).map(p=>String(p?.entity||"").trim()).filter(Boolean),r=new Set(i),o=e&&typeof e=="object"&&!Array.isArray(e)?e:{},n=o.mode===B.custom?B.custom:B.default,s=La(o.included,r),d=new Set(s),c=La(o.excluded,r).filter(p=>!d.has(p)),h=new Set([...s,...c]);for(const p of i)h.has(p)||(s.push(p),h.add(p));return{mode:n,included:s,excluded:c}},tt=Object.freeze({live:"live",grid:"grid",slideshow:"slideshow"}),_r=new Set(Object.values(tt)),oe=e=>{const t=String(e||"").trim().toLowerCase();return _r.has(t)?t:tt.live},ur=({gridEnabled:e=!1,slideshowEnabled:t=!1}={})=>[{value:tt.live,label:"Live",disabled:!1,disabledReason:""},{value:tt.grid,label:"Grid",disabled:e!==!0,disabledReason:"Enable Grid Mode in Grid Mode Settings to use this option."},{value:tt.slideshow,label:"Slideshow",disabled:t!==!0,disabledReason:"Enable Slideshow Mode in Slideshow Settings to use this option."}],A=Object.freeze({alerts:"alerts",clips:"clips",snapshots:"snapshots",recordings:"recordings",favorites:"kept"}),Eo=Object.freeze([A.alerts,A.clips,A.snapshots,A.recordings,A.favorites]),Ao=Object.freeze({[A.alerts]:"alerts",[A.clips]:"clips",[A.snapshots]:"snapshot",[A.recordings]:"recordings",[A.favorites]:"kept"}),Y=Object.freeze({videoOnly:"video-only",bottomPanelOpen:"bottom-panel-open",bottomPanelClosed:"bottom-panel-closed"}),Mo=Object.freeze({[Y.videoOnly]:6,[Y.bottomPanelOpen]:8,[Y.bottomPanelClosed]:7}),Ut=oe,vr=new Set(Object.values(Y)),at=(e,{legacyDrawerDefaultOpen:t,legacyVideoPanelOnly:a}={})=>{const i=String(e||"").trim().toLowerCase().replace(/[_\s]+/g,"-");return vr.has(i)?i:a===!0?Y.videoOnly:t===!1?Y.bottomPanelClosed:Y.bottomPanelOpen},Lo=Object.freeze({alert:A.alerts,alerts:A.alerts,clip:A.clips,clips:A.clips,snapshot:A.snapshots,snapshots:A.snapshots,recording:A.recordings,recordings:A.recordings,favorite:A.favorites,favorites:A.favorites,kept:A.favorites}),Ta=e=>({title:e.title,subtitle:e.subtitle,display_title:e.display_title,display_subtitle:e.display_subtitle,display_logo:e.display_logo,display_version:e.display_version,cameras:Array.isArray(e.cameras)?e.cameras.map(t=>({...t,...t?.group?{group:{...t.group}}:{},...Array.isArray(t?.linked_entities)?{linked_entities:t.linked_entities.map(a=>({...a}))}:{}})):[],event_days:e.event_days,alerts_reviews_days:e.alerts_reviews_days,realtime_poll_seconds:e.realtime_poll_seconds,snapshot_update_seconds:e.snapshot_update_seconds,mobile_poll_battery_saver:e.mobile_poll_battery_saver,event_pre_post_roll_enabled:e.event_pre_post_roll_enabled,favorites_mixed_cameras:e.favorites_mixed_cameras,slideshow_rotation_enabled:e.slideshow_rotation_enabled,slideshow_rotation_seconds:e.slideshow_rotation_seconds,slideshow_alert_hold_seconds:e.slideshow_alert_hold_seconds,grid_mode_enabled:e.grid_mode_enabled,grid_order:pe(e.grid_order,e.cameras),grid_live_view_enabled:e.grid_live_view_enabled,grid_alert_hold_seconds:e.grid_alert_hold_seconds,mobile_view_page_enabled:e.mobile_view_page_enabled!==!1,mobile_view_rotate_to_fullscreen:e.mobile_view_rotate_to_fullscreen,mobile_view_dashboard_background:e.mobile_view_dashboard_background!==!1,mobile_view_outer_border:e.mobile_view_outer_border,mobile_view_ha_navbar_bottom:e.mobile_view_ha_navbar_bottom,mobile_view_ha_navbar_stack_tabs:e.mobile_view_ha_navbar_stack_tabs,mobile_view_ha_navbar_dashboard:e.mobile_view_ha_navbar_dashboard,ha_dashboard_swipe_navigation_owner:e.ha_dashboard_swipe_navigation_owner,ha_dashboard_swipe_navigation:Ke(e.ha_dashboard_swipe_navigation),ha_dashboard_swipe_include_other_cards:e.ha_dashboard_swipe_include_other_cards,ha_dashboard_swipe_include_subviews:e.ha_dashboard_swipe_include_subviews,ha_dashboard_swipe_mouse_enabled:e.ha_dashboard_swipe_mouse_enabled,ha_dashboard_swipe_pages:Array.isArray(e.ha_dashboard_swipe_pages)?[...e.ha_dashboard_swipe_pages]:void 0,ha_dashboard_swipe_mobile_pages:Array.isArray(e.ha_dashboard_swipe_mobile_pages)?[...e.ha_dashboard_swipe_mobile_pages]:void 0,preview_page_enabled:e.preview_page_enabled,preview_page_live_cameras:e.preview_page_live_cameras,preview_page_live_cameras_mobile:e.preview_page_live_cameras_mobile,preview_page_alert_live_duration_seconds:e.preview_page_alert_live_duration_seconds,preview_page_show_title_bars:e.preview_page_show_title_bars,single_view_alert_takeover:e.single_view_alert_takeover,single_view_start_mode:oe(e.single_view_start_mode),wide_view_page_enabled:e.wide_view_page_enabled,wide_view_live_cameras:e.wide_view_live_cameras,wide_view_alert_takeover:e.wide_view_alert_takeover,wide_view_start_mode:oe(e.wide_view_start_mode),wide_view_timeline_enabled:e.wide_view_timeline_enabled,wide_view_timeline_default_open:e.wide_view_timeline_default_open,wide_view_timeline_default_scale:e.wide_view_timeline_default_scale,card_view_page_enabled:e.card_view_page_enabled,card_view_alert_takeover:e.card_view_alert_takeover,card_view_standalone:e.card_view_standalone,card_view_media_drawer_enabled:e.card_view_media_drawer_enabled,card_view_start_mode:e.card_view_start_mode,card_view_view_mode:at(e.card_view_view_mode,{legacyDrawerDefaultOpen:e.card_view_drawer_default_open,legacyVideoPanelOnly:e.card_view_video_panel_only}),card_view_hide_camera_name:e.card_view_hide_camera_name,landing_page:e.landing_page,mobile_page:e.mobile_page,grid_rotation_seconds:e.grid_rotation_seconds,hidden_tabs:e.hidden_tabs,theme:e.theme,theme_custom:gt(e.theme_custom),theme_custom_defaults:At(e.theme_custom_defaults),stream_height:e.stream_height,stream_height_unit:e.stream_height_unit,tight_margins:e.tight_margins,shadows:e.shadows,borders:e.borders,rounded_corners:e.rounded_corners,outer_shadows:e.outer_shadows,col_left_width_pct:e.col_left_width_pct,video_defaults:e.video_defaults,video_live_defaults:e.video_live_defaults,video_popup_defaults:e.video_popup_defaults,video_recording_defaults:e.video_recording_defaults}),Pa=.2,To=Object.freeze(new Set(["up","right","down","left"])),Po=Object.freeze(["up","right","down","left"]),Da=Object.freeze([0,90,180,270]),Do=Object.freeze({frigateContinuous:"frigate_continuous"}),Vo=Object.freeze({"focus-in":Object.freeze({action:"focus",argument:"in"}),"focus-out":Object.freeze({action:"focus",argument:"out"})}),zo=Object.freeze({"zoom-in":Pa,"zoom-out":-Pa}),Zt=e=>{const t=Number(e);return Da.includes(t)?t:0},it=e=>{if(e!==!0&&(!e||typeof e!="object"))return null;const t=e===!0?{enabled:!0}:e;if(t.enabled===!1)return null;const a=Zt(t.rotation);return{enabled:!0,...a?{rotation:a}:{}}},xt=e=>it(e?.ptz)?.enabled===!0,gr=e=>Array.isArray(e?.features)&&(e.features.includes("pt")||e.features.includes("pt-r")),br="{camera}",fr=e=>String(e||"").trim().toLowerCase()===br,wr=2,yr="light",se=Object.freeze({left:"left",right:"right"}),xr=e=>String(e||"").trim(),Sr=e=>String(e||"").trim(),Kt=e=>String(e||"").trim().toLowerCase()===se.left?se.left:se.right,Cr=e=>{if(!e||typeof e!="object"||Array.isArray(e))return null;const t=xr(e.entity||e.entity_id);if(!t.startsWith(`${yr}.`))return null;const a=Sr(e.icon),i=Kt(e.position);return{entity:t,...a?{icon:a}:{},...i===se.left?{position:i}:{}}},St=e=>{const t=Array.isArray(e)?e:e?[e]:[],a=new Set;return t.map(Cr).filter(Boolean).filter(({entity:i})=>a.has(i)?!1:(a.add(i),!0)).slice(0,wr)},Va=e=>St(e?.linked_entities),za=(e,t)=>{const a=parseInt(String(e??"").trim(),10);return Number.isFinite(a)&&a>0?a:t},Oa=e=>{const t=String(e||"").trim().toLowerCase();return/^#[0-9a-f]{6}$/.test(t)?t:/^#[0-9a-f]{3}$/.test(t)?`#${t[1]}${t[1]}${t[2]}${t[2]}${t[3]}${t[3]}`:""},kr=e=>{const t=String(e??"").trim().toLowerCase();return t==="ha_direct"||t==="ha"||t==="home_assistant"?"ha_direct":N},Er=e=>String(e??"").trim().toLowerCase()==="all_reviews"?"all_reviews":"alerts_only",Ar=(e,{fallbackName:t=null}={})=>{if(typeof e=="string")return{entity:e,name:t,connection_type:N,alerts_content:"alerts_only",ptz:null};if(e&&typeof e=="object"){const a=e.entity||e.camera_entity||null,i=Qe(e.group,{primaryEntity:a}),r=St(e.linked_entities);return{entity:a,name:e.name||t,connection_type:kr(e.connection_type),alerts_content:Er(e.alerts_content),ptz:it(e.ptz),...e.two_way_talk===!0?{two_way_talk:!0}:{},...i?{group:i}:{},...r.length?{linked_entities:r}:{}}}return{entity:null,name:t,connection_type:N,alerts_content:"alerts_only",ptz:null}},Mr=(e,t,a)=>{const i=String(a||"").trim();i&&(e[t]=i)},u=(e,t,a,i)=>{a!==i&&(e[t]=a)},Ct=e=>{if(!e||typeof e!="object"||Array.isArray(e)||!Object.keys(e).length)return null;try{return JSON.parse(JSON.stringify(e))}catch{return{...e}}},Lr=e=>{const t=it(e);return t?{...t}:null},Tr=e=>{const t=Ar(e,{fallbackName:""});if(!t.entity)return null;const a={entity:t.entity};Mr(a,"name",t.name),t.connection_type!==N&&(a.connection_type=t.connection_type),t.alerts_content!=="alerts_only"&&(a.alerts_content=t.alerts_content);const i=Lr(t.ptz);return i&&(a.ptz=i),t.two_way_talk===!0&&(a.two_way_talk=!0),t.group&&(a.group={...t.group}),t.linked_entities?.length&&(a.linked_entities=t.linked_entities.map(r=>({...r}))),a},Pr=(e,{themeDefaultColors:t={}}={})=>{const a=e&&typeof e=="object"?e:{},i={},r=Array.isArray(a.cameras)?a.cameras.map(Tr).filter(Boolean):[];r.length&&(i.cameras=r);const o=String(a.title||"").trim();o&&o!==pt&&(i.title=o);const n=String(a.subtitle||"").trim();n&&!fr(n)&&(i.subtitle=n),u(i,"display_title",a.display_title!==!1,!0),u(i,"display_subtitle",a.display_subtitle!==!1,!0),u(i,"display_logo",a.display_logo!==!1,!0),u(i,"display_version",a.display_version!==!1,!0);const s=za(a.event_days,le);u(i,"event_days",s,le);const d=za(a.alerts_reviews_days,de);u(i,"alerts_reviews_days",d,de);const c=Re.includes(Number(a.realtime_poll_seconds))?Number(a.realtime_poll_seconds):5;u(i,"realtime_poll_seconds",c,5);const h=V(a.snapshot_update_seconds,Ne,Ee);u(i,"snapshot_update_seconds",h,Ee),u(i,"mobile_poll_battery_saver",a.mobile_poll_battery_saver===!0,!1),u(i,"event_pre_post_roll_enabled",a.event_pre_post_roll_enabled===!0,!1),u(i,"favorites_mixed_cameras",a.favorites_mixed_cameras!==!1,!0),u(i,"slideshow_rotation_enabled",a.slideshow_rotation_enabled===!0,!1);const p=Ie.includes(Number(a.slideshow_rotation_seconds))?Number(a.slideshow_rotation_seconds):30;u(i,"slideshow_rotation_seconds",p,30);const g=V(a.slideshow_alert_hold_seconds,je,Math.round(Ae/1e3));u(i,"slideshow_alert_hold_seconds",g,Math.round(Ae/1e3)),u(i,"grid_mode_enabled",a.grid_mode_enabled===!0,!1),u(i,"grid_start_in_grid_enabled",a.grid_start_in_grid_enabled===!0,!1),u(i,"grid_live_view_enabled",a.grid_live_view_enabled!==!1,!0);const k=pe(a.grid_order,a.cameras);k.mode===B.custom&&(i.grid_order={mode:B.custom,included:[...k.included],excluded:[...k.excluded]}),u(i,"mobile_view_page_enabled",a.mobile_view_page_enabled!==!1,!0),u(i,"mobile_view_rotate_to_fullscreen",a.mobile_view_rotate_to_fullscreen===!0,!1),u(i,"mobile_view_dashboard_background",a.mobile_view_dashboard_background!==!1,!0),u(i,"mobile_view_outer_border",a.mobile_view_outer_border===!0,!1),u(i,"mobile_view_ha_navbar_bottom",a.mobile_view_ha_navbar_bottom===!0,!1),u(i,"mobile_view_ha_navbar_stack_tabs",a.mobile_view_ha_navbar_stack_tabs===!0,!1),u(i,"mobile_view_ha_navbar_dashboard",a.mobile_view_ha_navbar_dashboard===!0,!1);const f=a.ha_dashboard_swipe_navigation_owner===!0;if(u(i,"ha_dashboard_swipe_navigation_owner",f,!1),f){const M=Ke(a.ha_dashboard_swipe_navigation);if(u(i,"ha_dashboard_swipe_navigation",M,C.dashboardWide),M===C.insideCard&&u(i,"ha_dashboard_swipe_include_other_cards",a.ha_dashboard_swipe_include_other_cards===!0,!1),M===C.dashboardWide||M===C.insideCard){const G=mt(a,D.desktop),J=fa(a,D.desktop);(G.length!==J.length||G.some((Z,j)=>Z!==J[j]))&&(i.ha_dashboard_swipe_pages=[...G]);const U=_t(a),P=wa(a);(U.length!==P.length||U.some((Z,j)=>Z!==P[j]))&&(i.ha_dashboard_swipe_mobile_pages=[...U])}(M===C.dashboardWide||M===C.landingDashboard)&&u(i,"ha_dashboard_swipe_include_subviews",a.ha_dashboard_swipe_include_subviews===!0,!1),u(i,"ha_dashboard_swipe_mouse_enabled",a.ha_dashboard_swipe_mouse_enabled===!0,!1)}u(i,"preview_page_enabled",a.preview_page_enabled===!0,!1),u(i,"preview_page_live_cameras",a.preview_page_live_cameras===!0,!1),u(i,"preview_page_live_cameras_mobile",a.preview_page_live_cameras_mobile===!0,!1),u(i,"preview_page_show_title_bars",a.preview_page_show_title_bars!==!1,!0),u(i,"single_view_alert_takeover",a.single_view_alert_takeover===!0,!1),u(i,"single_view_start_mode",oe(a.single_view_start_mode),"live"),u(i,"wide_view_page_enabled",a.wide_view_page_enabled===!0,!1),u(i,"wide_view_live_cameras",a.wide_view_live_cameras===!0,!1),u(i,"wide_view_alert_takeover",a.wide_view_alert_takeover===!0,!1),u(i,"wide_view_start_mode",oe(a.wide_view_start_mode),"live"),u(i,"wide_view_timeline_enabled",a.wide_view_timeline_enabled===!0,!1),u(i,"wide_view_timeline_default_open",a.wide_view_timeline_default_open===!0,!1),u(i,"wide_view_timeline_default_scale",yt(a.wide_view_timeline_default_scale),ka),u(i,"card_view_page_enabled",a.card_view_page_enabled===!0,!1),u(i,"card_view_alert_takeover",a.card_view_alert_takeover===!0,!1),u(i,"card_view_standalone",a.card_view_page_enabled===!0&&a.card_view_standalone===!0,!1),u(i,"card_view_media_drawer_enabled",a.card_view_media_drawer_enabled!==!1,!0),u(i,"card_view_start_mode",Ut(a.card_view_start_mode),"live"),u(i,"card_view_view_mode",at(a.card_view_view_mode,{legacyDrawerDefaultOpen:a.card_view_drawer_default_open,legacyVideoPanelOnly:a.card_view_video_panel_only}),"bottom-panel-open"),u(i,"card_view_hide_camera_name",a.card_view_hide_camera_name!==!1,!0),u(i,"landing_page",ie(a.landing_page),_.singleView),u(i,"mobile_page",Ze(a.mobile_page),b.single);const S=Be.includes(Number(a.grid_rotation_seconds))?Number(a.grid_rotation_seconds):30;u(i,"grid_rotation_seconds",S,30);const I=V(a.grid_alert_hold_seconds,We,Math.round(Me/1e3));u(i,"grid_alert_hold_seconds",I,Math.round(Me/1e3));const H=V(a.preview_page_alert_live_duration_seconds,Fe,10);u(i,"preview_page_alert_live_duration_seconds",H,10);const x=Array.isArray(a.hidden_tabs)?a.hidden_tabs.map(M=>M==="reviews"?"alerts":M).filter(M=>Le.includes(M)):[...Ge];if(x.length===Ge.length&&Ge.every(M=>x.includes(M))||(i.hidden_tabs=x),a.theme==="custom"){i.theme="custom";const M=gt(a.theme_custom),G=a.theme_custom_defaults&&typeof a.theme_custom_defaults=="object"?a.theme_custom_defaults:{},J=M.map(({modes:U,overrides:P})=>{const Z={};return Object.entries(P).forEach(([j,Oe])=>{if(!Ue.has(j)||U.every(O=>(G[O]&&typeof G[O]=="object"?G[O]:G)[j]===!0))return;const z=Oa(Oe);!z||U.every(O=>{const xe=Oa(t?.[O]?.[j]);return!!xe&&xe===z})||(Z[j]=z)}),{modes:[...U],overrides:Z}});J.length&&(i.theme_custom=J)}const E=a.stream_height!=null&&String(a.stream_height).trim()!=="",R=Ye(a.stream_height);E&&R!==Nt&&(i.stream_height=R);const Ve=Xe(a.stream_height_unit);E&&Ve!==ya&&(i.stream_height_unit=Ve),u(i,"tight_margins",a.tight_margins===!0,!1),u(i,"shadows",a.shadows!==!1,!0),u(i,"borders",a.borders===!0,!1),u(i,"rounded_corners",a.rounded_corners!==!1,!0),u(i,"outer_shadows",a.outer_shadows!==!1,!0);const ne=wt(a.col_left_width_pct);u(i,"col_left_width_pct",ne,jt);const ze=Ct(a.video_defaults);ze&&(i.video_defaults=ze);const ue=Ct(a.video_live_defaults);ue&&(i.video_live_defaults=ue);const ve=Ct(a.video_popup_defaults);ve&&(i.video_popup_defaults=ve);const be=Ct(a.video_recording_defaults);return be&&(i.video_recording_defaults=be),i},Dr=(e,{sourceConfig:t=null}={})=>{const a={type:`custom:${qe}`,...e&&typeof e=="object"?e:{}},i=t&&typeof t=="object"?t:null;return i&&i.grid_options&&typeof i.grid_options=="object"&&(a.grid_options={...i.grid_options}),i&&i.visibility!=null&&(a.visibility=Array.isArray(i.visibility)?i.visibility.map(r=>r&&typeof r=="object"?{...r}:r):i.visibility),a};function Vr(){const e=typeof navigator<"u"?navigator:{},t=typeof window<"u"?window:{},a=String(e.userAgent||"").toLowerCase(),i=String(e.userAgentData?.platform||e.platform||"").toLowerCase(),r=Number(e.maxTouchPoints||0),o=!!t.matchMedia?.("(pointer: coarse)")?.matches,n=!!t.matchMedia?.("(any-pointer: coarse)")?.matches,s=!!t.matchMedia?.("(hover: none)")?.matches,d=r>0||o||n||s,c=i.includes("android")||a.includes("android"),h=/iphone/.test(a),p=e.userAgentData?.mobile===!0||/mobile|mobi/.test(a),g=/ipad/.test(a)||i.includes("mac")&&r>1&&d,k=/ipod/.test(a),f=h||g||k,S=g||c&&d&&!p,I=(f||c)&&!S,H=I||S;return{hasTouch:d,hasPrimaryTouch:o,hasAnyTouch:n||s,isAndroid:c,isIOS:f,isPhone:I,isTablet:S,isMobile:H,isDesktop:!H,os:c?"Android":f?"iOS":"Desktop/Other"}}const $a=Vr(),Oo=$a.isIOS,$o=$a.isAndroid;function Ha(e){if(typeof e=="string")try{return JSON.parse(e)}catch{return[]}return e}function kt(e,t){const a=parseInt(String(e??"").trim(),10);return Number.isFinite(a)&&a>0?a:t}function V(e,t,a){const i=Number(e);return Array.isArray(t)&&t.includes(i)?i:a}function X(e){const t=String(e??"").trim().toLowerCase();return t==="ha_direct"||t==="ha"||t==="home_assistant"?"ha_direct":N}function Yt(e){return String(e??"").trim().toLowerCase()==="all_reviews"?"all_reviews":"alerts_only"}function me(e){const t=String(e||"").trim().toLowerCase();return/^#[0-9a-f]{6}$/.test(t)?t:/^#[0-9a-f]{3}$/.test(t)?`#${t[1]}${t[1]}${t[2]}${t[2]}${t[3]}${t[3]}`:""}const Et=e=>String(e||"").trim().toLowerCase()==="dark"?"dark":"light",At=e=>{const t=e&&typeof e=="object"?e:{};return Object.fromEntries(he.map(a=>{const i=t[a]&&typeof t[a]=="object"?t[a]:{},r=Object.fromEntries(Object.entries(i).filter(([o,n])=>Ue.has(o)&&n===!0).map(([o])=>[o,!0]));return[a,r]}))},qa='[slot="primaryAction"], [slot="secondaryAction"], mwc-button, ha-button, button',zr=(e,t)=>(e.forEach(a=>{const i=a===t;a.classList.toggle("active",i);const r=a.querySelector("[data-panel-toggle]");r&&r.setAttribute("aria-expanded",i?"true":"false")}),t?.dataset?.panel??null),Xt=e=>{if(!(e instanceof Element))return null;const t=e.getAttribute?.("slot")||"";if(t==="primaryAction")return"primary";if(t==="secondaryAction")return"secondary";const a=(e.getAttribute?.("dialogAction")||e.getAttribute?.("dialog-action")||"").toString().trim().toLowerCase();if(["save","ok","done","confirm","apply"].includes(a))return"primary";if(["cancel","close","dismiss"].includes(a))return"secondary";const i=(e.textContent||"").trim().toLowerCase();return["save","done","update","apply","ok"].includes(i)?"primary":["cancel","close","dismiss"].includes(i)?"secondary":null},Ra=e=>{const t=Array.isArray(e.composedPath?.())?e.composedPath():[];if(t.some(a=>a?.id==="camera-modal"))return null;for(const a of t){if(!(a instanceof Element)||!a.matches?.(qa))continue;const i=Xt(a);if(i)return i}return null},Or=["drop-target","drop-target-before","drop-target-after"],Na=(e,t)=>{const a=t?.getBoundingClientRect?.(),i=Number(a?.top),r=Number(a?.height),o=Number(e?.clientY);if(!Number.isFinite(i)||!Number.isFinite(r)||!(r>0)||!Number.isFinite(o))return"replace";const n=(o-i)/r;return n<=.28?"before":n>=.72?"after":"replace"},Ia=(e,t,a,i="replace")=>{const r=Array.isArray(e)?[...e]:[];if(!Number.isInteger(t)||!Number.isInteger(a)||t<0||a<0||t>=r.length||a>=r.length||t===a)return r;const[o]=r.splice(t,1);let n=a;return(i==="before"||i==="after")&&(n=a-(t<a?1:0),i==="after"&&(n+=1)),r.splice(Math.max(0,Math.min(r.length,n)),0,o),r},Ba=({rows:e,clearDropTargets:t,onReorder:a})=>{const i=o=>{o.classList.remove(...Or),delete o.dataset.dropPlacement},r=()=>{e.forEach(i),t?.()};e.forEach(o=>{o.addEventListener("dragstart",n=>{const s=o.dataset.row;n.dataTransfer&&(n.dataTransfer.setData("text/plain",s),n.dataTransfer.effectAllowed="move"),o.classList.add("dragging")}),o.addEventListener("dragend",()=>{o.classList.remove("dragging"),r()}),o.addEventListener("dragover",n=>{n.preventDefault(),r();const s=Na(n,o);o.dataset.dropPlacement=s,o.classList.add(s==="before"?"drop-target-before":s==="after"?"drop-target-after":"drop-target"),n.dataTransfer&&(n.dataTransfer.dropEffect="move")}),o.addEventListener("dragleave",n=>{o.contains?.(n.relatedTarget)||i(o)}),o.addEventListener("drop",n=>{n.preventDefault();const s=o.dataset.dropPlacement||Na(n,o);r();const d=Number(n.dataTransfer?.getData("text/plain")||"-1"),c=Number(o.dataset.row||"-1");a(d,c,s)})})},$r=(e,t,a)=>{const i=e.querySelector(t);if(!i)return;i.toggleAttribute("data-invalid",!!a);const r=e.querySelector(`${t}-helper`);r&&(r.textContent=a||"",r.classList.toggle("error",!!a))},Hr=(e,t)=>{!e||typeof t!="function"||(e.addEventListener("value-changed",t),e.addEventListener("selected-changed",t),e.addEventListener("change",t))},v=e=>{if(!e)return!1;if(typeof e.checked=="boolean")return e.checked;if(e.getAttribute?.("aria-checked")==="true")return!0;if(e.getAttribute?.("aria-checked")==="false")return!1;const t=e.shadowRoot?.querySelector?.("input");return typeof t?.checked=="boolean"?t.checked:!1},De=({element:e,hass:t,options:a,initialValue:i,fallbackValue:r,normalize:o=s=>s,onChange:n})=>{if(!e)return;e.hass=t,e.selector={select:{mode:"dropdown",options:a}};const s=o(i??r);e.value=s,e.dataset.value=s,Hr(e,c=>{const h=c?.detail?.value??e.value??r,p=o(h);e.value=p,e.dataset.value=p,n?.(p,c)})},Mt=({element:e,hass:t,domain:a,label:i,required:r,onChange:o})=>{if(!e)return;e.hass=t,e.selector={entity:{domain:a}},typeof r=="boolean"&&(e.required=r),i&&(e.label=i);const n=s=>{const d=s?.detail?.value??e.value??"",c=String(d||"");e.value=c,e.dataset.value=c,o?.(c,s)};e.addEventListener("value-changed",n),e.addEventListener("selected-changed",n)},ja=({element:e,hass:t,entity:a="",label:i,onChange:r})=>{if(!e)return;e.hass=t,e.selector={icon:{}},e.context=a?{icon_entity:a}:{},e.required=!1,i&&(e.label=i);const o=n=>{const s=n?.detail?.value??e.value??"",d=String(s||"");e.value=d,e.dataset.value=d,r?.(d,n)};e.addEventListener("value-changed",o),e.addEventListener("selected-changed",o)},qr=({root:e,update:t,themeDraftCache:a,resolveDefaultHex:i,themeMode:r})=>{const o=Et(r);a[o]||(a[o]={});const n=a[o];e.querySelectorAll("[data-theme-option]").forEach(s=>{s.addEventListener("pointerdown",d=>{d.stopPropagation()}),s.addEventListener("click",d=>{d.preventDefault(),d.stopPropagation();const c=d.currentTarget?.dataset?.themeOption||"default";e.querySelectorAll("[data-theme-option]").forEach(p=>{const g=p.dataset.themeOption===c;p.classList.toggle("active",g),p.setAttribute("aria-checked",g?"true":"false")});const h=e.querySelector("#theme-custom-panel");h&&(h.hidden=c!=="custom",c==="custom"&&h.setAttribute("open","")),t()})}),e.querySelectorAll("[data-theme-scope]").forEach(s=>{s.addEventListener("click",d=>{d.preventDefault(),d.stopPropagation();const c=It(d.currentTarget?.dataset?.themeScope,o);e.querySelectorAll("[data-theme-scope]").forEach(h=>{const p=h.dataset.themeScope===c;h.classList.toggle("active",p),h.setAttribute("aria-checked",p?"true":"false")}),d.currentTarget?.blur?.(),t()})}),e.querySelectorAll("[data-theme-color]").forEach(s=>{const d=c=>{const h=c.currentTarget?.dataset?.themeColor,p=me(c.currentTarget?.value);h&&p&&(n[h]=p),t()};s.addEventListener("input",d),s.addEventListener("change",d)}),e.querySelectorAll("[data-theme-reset]").forEach(s=>{s.addEventListener("click",d=>{d.preventDefault(),d.stopPropagation();const c=d.currentTarget?.dataset?.themeReset,h=e.querySelector(`[data-theme-color="${c}"]`);if(!c||!h||h.disabled)return;const p=i(c);h.value=p,n[c]=p,t()})}),e.querySelectorAll("[data-theme-default]").forEach(s=>{const d=s.dataset.themeDefault,c=e.querySelector(`[data-theme-color="${d}"]`),h=e.querySelector(`[data-theme-reset="${d}"]`);s.addEventListener("change",p=>{const g=p.currentTarget?.checked===!0;if(!c){t();return}if(g)c.value=i(d),c.disabled=!0,h&&(h.hidden=!0);else{const k=me(n[d]);c.value=k||i(d),n[d]=c.value,c.disabled=!1,h&&(h.hidden=!1)}t()}),s.addEventListener("value-changed",p=>{s.checked=p?.detail?.value===!0})})},Rr=({root:e,selector:t,handler:a})=>{e.querySelector(t)?.addEventListener("click",a)},Nr=(e,t)=>{t.forEach(a=>Rr({root:e,...a}))},Wa=({root:e,selector:t,handler:a})=>{e.querySelectorAll(t).forEach(i=>{i.addEventListener("click",r=>a(r,i))})},Fa=({root:e,ids:t,events:a,handler:i})=>{t.forEach(r=>{const o=e.querySelector(`#${r}`);o&&a.forEach(n=>{o.addEventListener(n,s=>i(s,o,r))})})},Ir=({root:e,selector:t,events:a,handler:i})=>{e.querySelectorAll(t).forEach(r=>{a.forEach(o=>{r.addEventListener(o,n=>i(n,r,t))})})},Ga=({root:e,baseConfig:t,cameras:a,themeDraftCache:i,themeMode:r,hiddenTabsOverride:o})=>{const n=w=>e.querySelector(`#${w}`)?.value?.trim()||"",s={...t,cameras:a};delete s.camera_entity;const d=n("title"),c=n("subtitle");d?s.title=d:delete s.title,c?s.subtitle=c:delete s.subtitle;const h=e.querySelector("#display_title"),p=e.querySelector("#display_subtitle"),g=e.querySelector("#display_logo"),k=e.querySelector("#display_version");s.display_title=h?v(h):t?.display_title!==!1,s.display_subtitle=p?v(p):t?.display_subtitle!==!1,s.display_logo=g?v(g):t?.display_logo!==!1,s.display_version=k?v(k):t?.display_version!==!1,s.event_days=kt(e.querySelector("#event_days")?.dataset.value||e.querySelector("#event_days")?.value||String(le),le),s.alerts_reviews_days=kt(e.querySelector("#alerts_reviews_days")?.dataset.value||e.querySelector("#alerts_reviews_days")?.value||String(de),de);const f=Number(e.querySelector('[name="realtime_poll_seconds"]:checked')?.value||e.querySelector("#realtime_poll_seconds")?.dataset.value||e.querySelector("#realtime_poll_seconds")?.value||"5");s.realtime_poll_seconds=Re.includes(f)?f:5,s.snapshot_update_seconds=V(e.querySelector('[name="snapshot_update_seconds"]:checked')?.value||e.querySelector("#snapshot_update_seconds")?.dataset.value||e.querySelector("#snapshot_update_seconds")?.value||String(Ee),Ne,Ee),s.mobile_poll_battery_saver=v(e.querySelector("#mobile_poll_battery_saver")),s.event_pre_post_roll_enabled=v(e.querySelector("#event_pre_post_roll_enabled"));const S=e.querySelector("#favorites_mixed_cameras");s.favorites_mixed_cameras=S?v(S):t?.favorites_mixed_cameras!==!1,s.slideshow_rotation_enabled=v(e.querySelector("#slideshow_rotation_enabled")),s.slideshow_rotation_seconds=Ie.includes(Number(e.querySelector('[name="slideshow_rotation_seconds"]:checked')?.value||e.querySelector("#slideshow_rotation_seconds")?.dataset.value||e.querySelector("#slideshow_rotation_seconds")?.value||"30"))?Number(e.querySelector('[name="slideshow_rotation_seconds"]:checked')?.value||e.querySelector("#slideshow_rotation_seconds")?.dataset.value||e.querySelector("#slideshow_rotation_seconds")?.value||"30"):30,s.slideshow_alert_hold_seconds=V(e.querySelector('[name="slideshow_alert_hold_seconds"]:checked')?.value||e.querySelector("#slideshow_alert_hold_seconds")?.dataset.value||e.querySelector("#slideshow_alert_hold_seconds")?.value||String(Math.round(Ae/1e3)),je,Math.round(Ae/1e3)),s.grid_mode_enabled=v(e.querySelector("#grid_mode_enabled")),s.grid_live_view_enabled=v(e.querySelector("#grid_live_view_enabled"))!==!1,s.grid_alert_hold_seconds=V(e.querySelector('[name="grid_alert_hold_seconds"]:checked')?.value||e.querySelector("#grid_alert_hold_seconds")?.dataset.value||e.querySelector("#grid_alert_hold_seconds")?.value||String(Math.round(Me/1e3)),We,Math.round(Me/1e3));const I=e.querySelector("#mobile_view_page_enabled");s.mobile_view_page_enabled=I?v(I):t?.mobile_view_page_enabled!==!1;const H=e.querySelector("#mobile_view_rotate_to_fullscreen");s.mobile_view_rotate_to_fullscreen=H?v(H):t?.mobile_view_rotate_to_fullscreen===!0;const x=e.querySelector("#mobile_view_dashboard_background");s.mobile_view_dashboard_background=x?v(x):t?.mobile_view_dashboard_background!==!1,s.mobile_view_outer_border=v(e.querySelector("#mobile_view_outer_border")),s.mobile_view_ha_navbar_bottom=v(e.querySelector("#mobile_view_ha_navbar_bottom")),s.mobile_view_ha_navbar_stack_tabs=v(e.querySelector("#mobile_view_ha_navbar_stack_tabs")),s.mobile_view_ha_navbar_dashboard=v(e.querySelector("#mobile_view_ha_navbar_dashboard")),s.ha_dashboard_swipe_navigation_owner=v(e.querySelector("#ha_dashboard_swipe_navigation_owner")),s.ha_dashboard_swipe_navigation=Ke(e.querySelector('[name="ha_dashboard_swipe_navigation"]:checked')?.value||t?.ha_dashboard_swipe_navigation),s.ha_dashboard_swipe_include_other_cards=v(e.querySelector("#ha_dashboard_swipe_include_other_cards"));const q=s.ha_dashboard_swipe_navigation,E=q===C.dashboardWide||q===C.landingDashboard?e.querySelector(`[data-ha-dashboard-swipe-include-subviews="${q}"]`):null;s.ha_dashboard_swipe_include_subviews=v(E),s.ha_dashboard_swipe_mouse_enabled=v(e.querySelector("#ha_dashboard_swipe_mouse_enabled")),s.preview_page_enabled=v(e.querySelector("#preview_page_enabled")),s.preview_page_live_cameras=v(e.querySelector("#preview_page_live_cameras")),s.preview_page_live_cameras_mobile=v(e.querySelector("#preview_page_live_cameras_mobile")),s.preview_page_alert_live_duration_seconds=V(e.querySelector('[name="preview_page_alert_live_duration_seconds"]:checked')?.value||e.querySelector("#preview_page_alert_live_duration_seconds")?.dataset.value||e.querySelector("#preview_page_alert_live_duration_seconds")?.value||"10",Fe,10),s.preview_page_show_title_bars=v(e.querySelector("#preview_page_show_title_bars"))!==!1,s.single_view_alert_takeover=v(e.querySelector("#single_view_alert_takeover")),s.single_view_start_mode=oe(e.querySelector('[name="single_view_start_mode"]:checked')?.value||t?.single_view_start_mode),s.wide_view_page_enabled=v(e.querySelector("#wide_view_page_enabled")),s.wide_view_live_cameras=v(e.querySelector("#wide_view_live_cameras")),s.wide_view_alert_takeover=v(e.querySelector("#wide_view_alert_takeover")),s.wide_view_start_mode=oe(e.querySelector('[name="wide_view_start_mode"]:checked')?.value||t?.wide_view_start_mode),s.wide_view_timeline_enabled=v(e.querySelector("#wide_view_timeline_enabled")),s.wide_view_timeline_default_open=v(e.querySelector("#wide_view_timeline_default_open")),s.wide_view_timeline_default_scale=yt(e.querySelector('[name="wide_view_timeline_default_scale"]:checked')?.value||e.querySelector("#wide_view_timeline_default_scale")?.dataset.value||e.querySelector("#wide_view_timeline_default_scale")?.value||t?.wide_view_timeline_default_scale),s.card_view_page_enabled=v(e.querySelector("#card_view_page_enabled")),s.card_view_alert_takeover=v(e.querySelector("#card_view_alert_takeover")),s.card_view_standalone=v(e.querySelector("#card_view_standalone")),s.card_view_media_drawer_enabled=v(e.querySelector("#card_view_media_drawer_enabled")),s.card_view_start_mode=Ut(e.querySelector('[name="card_view_start_mode"]:checked')?.value||t?.card_view_start_mode),s.card_view_view_mode=at(e.querySelector('[name="card_view_view_mode"]:checked')?.value||t?.card_view_view_mode,{legacyDrawerDefaultOpen:t?.card_view_drawer_default_open,legacyVideoPanelOnly:t?.card_view_video_panel_only}),delete s.card_view_drawer_default_open,delete s.card_view_media_drawer_type,delete s.card_view_video_panel_only,s.card_view_hide_camera_name=v(e.querySelector("#card_view_hide_camera_name")),s.grid_rotation_seconds=Be.includes(Number(e.querySelector('[name="grid_rotation_seconds"]:checked')?.value||e.querySelector("#grid_rotation_seconds")?.dataset.value||e.querySelector("#grid_rotation_seconds")?.value||"30"))?Number(e.querySelector('[name="grid_rotation_seconds"]:checked')?.value||e.querySelector("#grid_rotation_seconds")?.dataset.value||e.querySelector("#grid_rotation_seconds")?.value||"30"):30,delete s.primary_color,delete s.accent_color,delete s.bg_color,delete s.use_primary_color,delete s.use_accent_color,delete s.use_bg_color,s.theme=e.querySelector("[data-theme-option].active")?.dataset?.themeOption==="custom"?"custom":"default";const R=Et(r),ne={...Bt(s.theme_custom,R).overrides},ue={...At(s.theme_custom_defaults)[R]},ve=i?.[R];ve&&typeof ve=="object"&&Object.entries(ve).forEach(([w,z])=>{if(!Ue.has(w))return;const Q=me(z);Q&&(ne[w]=Q)}),e.querySelectorAll("[data-theme-color]").forEach(w=>{const z=w.dataset.themeColor;if(!Ue.has(z))return;const Q=v(e.querySelector(`[data-theme-default="${z}"]`)),O=me(w.value);if(Q){ue[z]=!0,delete ne[z];return}delete ue[z],O&&Object.prototype.hasOwnProperty.call(ne,z)&&(i[R]||(i[R]={}),i[R][z]=O,ne[z]=O)});const be=It(e.querySelector("[data-theme-scope].active")?.dataset?.themeScope,R);s.theme_custom=dr({scope:be,overrides:ne,fallbackMode:R}),s.theme_custom_defaults=Object.fromEntries(he.map(w=>[w,{...ue}]));const M=Array.isArray(o)?o.map(w=>w==="reviews"?"alerts":w).filter(w=>Le.includes(w)):[...e.querySelectorAll("[data-active-tab]")].filter(w=>!v(w)).map(w=>w.dataset.activeTab).filter(w=>Le.includes(w));s.hidden_tabs=M.length?M:[];const G=e.querySelector("#stream_height")?.value,J=e.querySelector('[name="stream_height_unit"]:checked')?.value||e.querySelector("#stream_height_unit")?.dataset.value||e.querySelector("#stream_height_unit")?.value||"%";s.stream_height=Ye(G),s.stream_height_unit=Xe(J),s.tight_margins=v(e.querySelector("#tight_margins")),s.shadows=v(e.querySelector("#shadows"))!==!1,s.borders=v(e.querySelector("#borders")),s.rounded_corners=v(e.querySelector("#rounded_corners"))!==!1,s.outer_shadows=v(e.querySelector("#outer_shadows"))!==!1,s.landing_page=ie(e.querySelector("#landing_page")?.dataset.value||e.querySelector("#landing_page")?.value||_.singleView);const U=ie(t?.landing_page),P=[...e.querySelectorAll('[name="ha_dashboard_swipe_pages"]:checked')].map(w=>String(w?.value||"")).filter(w=>w&&(s.landing_page===U||w!==U));s.ha_dashboard_swipe_pages=mt({...s,ha_dashboard_swipe_pages:P},D.desktop),s.mobile_page=Ze(e.querySelector("#mobile_page")?.dataset.value||e.querySelector("#mobile_page")?.value||s.mobile_page||b.single);const Z=Pe(t),j=Pe(s),Oe=[...e.querySelectorAll('[name="ha_dashboard_swipe_mobile_pages"]:checked')].map(w=>String(w?.value||"")).filter(w=>w&&(j===Z||w!==Z));return s.ha_dashboard_swipe_mobile_pages=_t({...s,ha_dashboard_swipe_mobile_pages:Oe}),s.col_left_width_pct=wt(e.querySelector("#col_left_width_pct")?.value),s};function Ua(e,{fallbackName:t=null}={}){if(typeof e=="string")return{entity:e,name:t,connection_type:N,alerts_content:"alerts_only",ptz:null};if(e&&typeof e=="object"){const a=e.entity||e.camera_entity||null,i=Qe(e.group,{primaryEntity:a}),r=St(e.linked_entities);return{entity:a,name:e.name||t,connection_type:X(e.connection_type),alerts_content:Yt(e.alerts_content),ptz:it(e.ptz),...e.two_way_talk===!0?{two_way_talk:!0}:{},...i?{group:i}:{},...r.length?{linked_entities:r}:{}}}return{entity:null,name:t,connection_type:N,alerts_content:"alerts_only",ptz:null}}const Br=e=>{if(!e||typeof e!="object")return!1;if((Array.isArray(e.producers)?e.producers:[]).some(d=>Array.isArray(d?.medias)?d.medias.some(c=>{const h=String(c||"").trim().toLowerCase();return h.includes("audio")&&(h.includes("sendonly")||h.includes("sendrecv"))}):!1))return!0;const i=new Set(["two_way_talk","twoWayTalk","two-way-talk","talk","talkback","microphone","mic","audio_output","audio_out","two_way_audio","supports_two_way_talk","supports_two_way_audio","backchannel"]),r=new Set(["talk","talkback","two_way_talk","two-way-talk","supports_two_way_talk","two_way_audio","two-way-audio","supports_two_way_audio","mic","microphone","audio_output","audio-out","audio_out","speaker","backchannel"]),o=[e],n=new Set,s=[];for(;o.length;){const d=o.pop();if(!(!d||typeof d!="object")&&!n.has(d)){if(n.add(d),Array.isArray(d)){d.forEach(c=>{typeof c=="string"?s.push(c):c&&typeof c=="object"&&o.push(c)});continue}Object.entries(d).forEach(([c,h])=>{const p=String(c||"").trim().toLowerCase();h===!0&&i.has(c)&&s.push(c),h===!0&&i.has(p)&&s.push(p),typeof h=="string"?s.push(h):(Array.isArray(h)||h&&typeof h=="object")&&o.push(h)})}}return s.map(d=>String(d||"").trim().toLowerCase()).some(d=>r.has(d))},jr=e=>String(e||"").trim().toLowerCase().replaceAll("-","_"),Wr=e=>{const t=e?.frontend_stream_types;return Array.isArray(t)?t.some(a=>{const i=jr(a);return i==="web_rtc"||i==="webrtc"}):!1},Fr=e=>String(e||"").toLowerCase().replace(/[^a-z0-9]+/g,""),Gr=e=>{const t=String(e||"").trim();return t?t.toLowerCase().startsWith("v")?t:`v${t}`:""},Ur=(e={})=>Object.entries(e||{}).find(([a,i])=>{if(!String(a).startsWith("update."))return!1;const r=i?.attributes||{};return Fr([a,r.title,r.friendly_name,r.repository,r.release_url].join(" ")).includes("frigateviewcard")})||null,Za=({states:e={}}={})=>{const t=Ur(e);if(!t)return{entityId:"",status:"unavailable",label:"Update status unavailable"};const[a,i]=t,r=i?.attributes||{},o=Gr(r.latest_version);if(r.in_progress===!0)return{entityId:a,status:"updating",label:o?`Updating to ${o}`:"Update in progress"};const n=String(i?.state||"").toLowerCase();return n==="on"?{entityId:a,status:"available",label:o?`Update available: ${o}`:"Update available"}:n==="off"?{entityId:a,status:"current",label:"Up to date"}:{entityId:a,status:"unavailable",label:"Update status unavailable"}},Jt=10,Ho=Object.freeze({"border-bottom":"none","border-top":"1px solid var(--divider-color)","box-sizing":"border-box",height:`calc(var(--header-height, 56px) + ${Jt}px)`,"padding-top":`${Jt/2}px`,"padding-bottom":`${Jt/2}px`}),qo=Symbol.for("frigate-view-card.dashboard-navbar-customization"),Ka=e=>String(e||"").trim().toLowerCase().replace(/^custom:/,""),Zr=(e,t)=>String(e?.path||"").trim().replace(/^\/+|\/+$/g,"")||String(t),Kr=(e,t="frigate-view-card")=>{const a=Ka(t),i=[];if(!a||!Array.isArray(e?.views))return{cards:i,claimants:[],owner:null,conflicts:[]};let r=0;e.views.forEach((n,s)=>{const d=new Set,c=(h,p=0)=>{if(!(!h||typeof h!="object"||p>30)&&!d.has(h)){if(d.add(h),!Array.isArray(h)&&Ka(h.type)===a){i.push({config:h,cardOrder:r,view:n,viewIndex:s,viewName:Zr(n,s),viewTitle:String(n?.title||"").trim()||`Page ${s+1}`}),r+=1;return}Object.values(h).forEach(g=>c(g,p+1))}};c(n)});const o=i.filter(({config:n})=>n?.mobile_view_ha_navbar_bottom===!0&&n?.mobile_view_ha_navbar_dashboard===!0);return{cards:i,claimants:o,owner:o[0]||null,conflicts:o.slice(1)}},Yr=({dashboardConfig:e,sourceConfig:t=null,requested:a=!1,cardTag:i="frigate-view-card",currentViewName:r=""}={})=>{const o=Kr(e,i),n=o.cards.find(({config:h})=>h===t),s=o.claimants.filter(({viewName:h})=>h===r),d=!!o.owner&&(o.owner===n||!n&&a&&o.owner.viewName===r&&s.length===1),c=a&&(!o.owner||d);return{...o,requested:a,isOwner:c,locked:!!o.owner&&!d,conflict:a&&!!o.owner&&!c}},Ro=Object.freeze(["transform","transition","will-change","backface-visibility"]),No=Object.freeze(["overflow-x","overscroll-behavior-x"]),Io=["a","button","input","select","textarea","label","summary","video","audio","canvas","[contenteditable]","[draggable='true']","[role='button']","[role='slider']","[role='spinbutton']","[data-no-swipe]","ha-tabs","ha-tab-group","ha-tab-group-tab","paper-tabs","paper-tab","ha-slider","ha-control-slider","paper-slider","mwc-slider","ha-map","hui-map-card","google-map","swipe-card","swiper-container",".swiper",".swiper-container",".swiper-wrapper",".swiper-slide","#live-stage","#viewer","#recording-scrub",".recording-scrub-track",".recording-segment-handle",".live-resize-grip",".popup-view-resize-grip",".popup-carousel",".circle-pad",".wide-timeline-shell",".wide-timeline-resize-handle",".card-view-scroller",".linked-light-brightness-popover","#filter-panel","#cal-panel"].join(","),Bo=new Set([C.dashboardWide,C.landingDashboard]),jo=Symbol.for("frigate-view-card.dashboard-swipe-navigation"),Xr=e=>{if(!e)return null;if(e.parentNode)return e.parentNode;const t=e.getRootNode?.();return t&&t!==e?t.host||null:e.host||null},Lt=e=>String(e||"").trim().replace(/^\/+|\/+$/g,""),Jr=e=>{const t=String(e||"").trim().replace(/\/+$/g,"");return t?t.startsWith("/")?t:`/${t}`:""},Qr=(e,t)=>Lt(e?.path)||String(t),Ya=e=>String(e||"").trim().toLowerCase().replace(/^custom:/,""),eo=(e,t)=>Ya(e?.type)===t,to=(e,t="frigate-view-card")=>{const a=Ya(t),i=e?.views;if(!a||!Array.isArray(i))return[];const r=[];let o=0;return i.forEach((n,s)=>{const d=new Set,c=(h,p=0)=>{if(!(!h||typeof h!="object"||p>30)&&!d.has(h)){if(d.add(h),!Array.isArray(h)&&eo(h,a)){r.push({config:h,cardOrder:o,view:n,viewIndex:s,viewName:Qr(n,s),viewTitle:String(n?.title||"").trim()||`Page ${s+1}`}),o+=1;return}Object.values(h).forEach(g=>c(g,p+1))}};c(n)}),r},ao=(e,t="frigate-view-card")=>{const a=to(e,t),i=a.filter(({config:r})=>r?.ha_dashboard_swipe_navigation_owner===!0);return{cards:a,claimants:i,owner:i[0]||null,conflicts:i.slice(1)}},Xa=(e,t=globalThis.document)=>{let a=e;for(let n=0;a&&n<12;n+=1){if(String(a.tagName||"").toUpperCase()==="HA-PANEL-LOVELACE")return a;a=Xr(a)}const r=t?.querySelector?.("home-assistant")?.shadowRoot?.querySelector?.("home-assistant-main")?.shadowRoot,o=r?.querySelector?.("partial-panel-resolver");return o?.querySelector?.("ha-panel-lovelace")||o?.shadowRoot?.querySelector?.("ha-panel-lovelace")||r?.querySelector?.("ha-panel-lovelace")||null},io=({panel:e,huiRoot:t,windowRef:a})=>{const i=Jr(e?.route?.prefix||t?.route?.prefix||t?._route?.prefix),r=String(a?.location?.pathname||"");if(i&&r.startsWith(`${i}/`))return Lt(r.slice(i.length));const o=Lt(e?.route?.path);return o||Lt(r).split("/").at(-1)||""},Ja=(e={})=>io(e),Wo=Object.freeze(["camera.doorbell","camera.front_door","camera.driveway","camera.garage","camera.backyard"]),ro=e=>{let t=[];return Array.isArray(e?.cameras)?t=e.cameras:e?.camera_entity&&(t=[{entity:e.camera_entity,name:e.title||"",connection_type:N}]),Gt(t.map(a=>Ua(a,{fallbackName:""})).filter(a=>a.entity),ce)},oo=e=>{const t=e&&typeof e=="object"?{...e}:{},a=ro(t);t.hidden_tabs=Array.isArray(t.hidden_tabs)?t.hidden_tabs.map(o=>o==="reviews"?"alerts":o).filter(o=>Le.includes(o)):[...Ge],delete t.camera_entity,t.title=String(t.title||"").trim()||pt,t.subtitle=String(t.subtitle||"").trim()||Ot,t.display_title=t.display_title!==!1,t.display_subtitle=t.display_subtitle!==!1,t.display_logo=t.display_logo!==!1,t.display_version=t.display_version!==!1,t.theme=t.theme==="custom"?"custom":"default",t.theme_custom=gt(t.theme_custom),t.theme_custom_defaults=At(t.theme_custom_defaults),t.shadows=t.shadows!==!1,t.borders=t.borders===!0,t.rounded_corners=t.rounded_corners!==!1,t.outer_shadows=t.outer_shadows!==!1,t.stream_height=Ye(t.stream_height),t.stream_height_unit=Xe(t.stream_height_unit),t.col_left_width_pct=wt(t.col_left_width_pct),t.realtime_poll_seconds=Re.includes(Number(t.realtime_poll_seconds))?Number(t.realtime_poll_seconds):5,t.snapshot_update_seconds=V(t.snapshot_update_seconds,Ne,Ee),t.mobile_poll_battery_saver=t.mobile_poll_battery_saver===!0,t.event_pre_post_roll_enabled=t.event_pre_post_roll_enabled===!0,t.favorites_mixed_cameras=t.favorites_mixed_cameras!==!1,t.slideshow_rotation_enabled=t.slideshow_rotation_enabled===!0,t.slideshow_rotation_seconds=Ie.includes(Number(t.slideshow_rotation_seconds))?Number(t.slideshow_rotation_seconds):30,t.slideshow_alert_hold_seconds=V(t.slideshow_alert_hold_seconds,je,Math.round(Ae/1e3)),t.grid_mode_enabled=t.grid_mode_enabled===!0,t.grid_order=pe(t.grid_order,a),t.grid_live_view_enabled=t.grid_live_view_enabled!==!1,t.grid_alert_hold_seconds=V(t.grid_alert_hold_seconds,We,Math.round(Me/1e3)),t.mobile_view_page_enabled=t.mobile_view_page_enabled!==!1,t.mobile_view_rotate_to_fullscreen=t.mobile_view_rotate_to_fullscreen===!0,t.mobile_view_dashboard_background=t.mobile_view_dashboard_background!==!1,t.mobile_view_outer_border=t.mobile_view_outer_border===!0,t.mobile_view_ha_navbar_bottom=t.mobile_view_ha_navbar_bottom===!0,t.mobile_view_ha_navbar_stack_tabs=t.mobile_view_ha_navbar_stack_tabs===!0,t.mobile_view_ha_navbar_dashboard=t.mobile_view_ha_navbar_dashboard===!0,t.ha_dashboard_swipe_navigation_owner=t.ha_dashboard_swipe_navigation_owner===!0,t.ha_dashboard_swipe_navigation=Ke(t.ha_dashboard_swipe_navigation),t.ha_dashboard_swipe_include_other_cards=t.ha_dashboard_swipe_include_other_cards===!0,t.ha_dashboard_swipe_include_subviews=t.ha_dashboard_swipe_include_subviews===!0,t.ha_dashboard_swipe_mouse_enabled=t.ha_dashboard_swipe_mouse_enabled===!0,t.preview_page_enabled=t.preview_page_enabled===!0,t.preview_page_live_cameras=t.preview_page_live_cameras===!0,t.preview_page_live_cameras_mobile=t.preview_page_live_cameras_mobile===!0,t.preview_page_show_title_bars=t.preview_page_show_title_bars!==!1,t.preview_page_alert_live_duration_seconds=V(t.preview_page_alert_live_duration_seconds,Fe,10),t.single_view_start_mode=oe(t.single_view_start_mode),t.wide_view_start_mode=oe(t.wide_view_start_mode),t.card_view_start_mode=Ut(t.card_view_start_mode),t.single_view_alert_takeover=t.single_view_alert_takeover===!0,t.wide_view_page_enabled=t.wide_view_page_enabled===!0||t.wide_view===!0,t.wide_view_live_cameras=t.wide_view_live_cameras===!0,t.wide_view_alert_takeover=t.wide_view_alert_takeover===!0,t.wide_view_timeline_enabled=t.wide_view_timeline_enabled===!0,t.wide_view_timeline_default_open=t.wide_view_timeline_default_open===!0,t.wide_view_timeline_default_scale=yt(t.wide_view_timeline_default_scale),t.card_view_page_enabled=t.card_view_page_enabled===!0,t.card_view_alert_takeover=t.card_view_alert_takeover===!0,t.card_view_standalone=t.card_view_page_enabled&&t.card_view_standalone===!0,t.card_view_media_drawer_enabled=t.card_view_media_drawer_enabled!==!1,t.card_view_view_mode=at(t.card_view_view_mode,{legacyDrawerDefaultOpen:t.card_view_drawer_default_open,legacyVideoPanelOnly:t.card_view_video_panel_only}),delete t.card_view_drawer_default_open,delete t.card_view_media_drawer_type,delete t.card_view_video_panel_only,t.card_view_hide_camera_name=t.card_view_hide_camera_name!==!1,t.landing_page=ie(t.landing_page),t.card_view_standalone&&(t.landing_page=_.cardView),t.mobile_page=ga(t,t.mobile_page);const i=re(t,D.desktop);i.includes(t.landing_page)||(t.landing_page=i[0]||_.singleView),t.ha_dashboard_swipe_pages=mt(t,D.desktop),t.ha_dashboard_swipe_mobile_pages=_t(t),t.grid_rotation_seconds=Be.includes(Number(t.grid_rotation_seconds))?Number(t.grid_rotation_seconds):30;const r=parseInt(t.window_hours,10);return t.event_days=kt(t.event_days??t.window_days,Number.isFinite(r)&&r>0?Math.max(1,Math.ceil(r/24)):le),t.alerts_reviews_days=kt(t.alerts_reviews_days,de),delete t.window_days,delete t.window_hours,delete t.wide_view,{...t,cameras:a}},Qa=new Set(["","default","backend-selected"]),ei=Object.freeze(["dark-primary-color","--dark-primary-color"]),Tt=e=>String(e||"").trim().toLowerCase(),so=(e,t)=>{const a=e?.themes;if(!a||typeof a!="object")return null;const i=Tt(t),r=Object.keys(a).find(n=>Tt(n)===i);if(!r)return null;const o=a[r];return o&&typeof o=="object"?o:null},ti=(e,t)=>t.some(a=>Object.prototype.hasOwnProperty.call(e||{},a)&&String(e[a]??"").trim()!==""),no=(e,t)=>ti(e,ei)||ti(e?.modes?.[t],ei),lo=(e,{mode:t}={})=>{const a=e?.themes||{},{darkMode:i=!1}=a,r=t==="dark"||t==="light"?t:i===!0?"dark":"light",o=String(a.theme||e?.selectedTheme||"default").trim(),n=String(r==="dark"?a.default_dark_theme||a.default_theme||"default":a.default_theme||"default").trim(),s=Qa.has(Tt(o))?n:o,d=Qa.has(Tt(s))?"default":"custom",c=d==="custom"?so(a,s):null;return{mode:r,source:d,deriveDarkPrimary:d==="custom"&&c!==null&&!no(c,r)}},rt=Object.freeze({enterStandalone:"enter-card-view-standalone",revertStandaloneDraft:"revert-card-view-standalone-draft",navigate:"navigate",commit:"commit",reset:"reset"}),co=(e,t)=>{const a=String(t?.attributes?.friendly_name||"").trim();if(a)return a;const i=String(e||"").replace(/^light\./,"").trim();return i?i.split(/[_\s-]+/).filter(Boolean).map(r=>`${r.charAt(0).toUpperCase()}${r.slice(1)}`).join(" "):"Light"},ho=Object.freeze({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}),L=e=>String(e??"").replace(/[&<>"']/g,t=>ho[t]),T=L,ai=e=>{const t=String(e||"").trim().replace(/^v/i,"");if(!t)return null;const a=t.match(/^\d+(?:\.\d+)*/)?.[0]||"";return a?a.split(".").map(i=>Number(i)):null},po=(e,t)=>{const a=ai(e),i=ai(t);if(!a||!i)return null;const r=Math.max(a.length,i.length);for(let o=0;o<r;o+=1){const n=a[o]||0,s=i[o]||0;if(n<s)return-1;if(n>s)return 1}return 0},mo=({currentVersion:e="",recommendedVersion:t=""}={})=>po(e,t)!==-1?"":`Home Assistant ${e} is below the recommended ${t}.`,_o=({currentVersion:e="",recommendedVersion:t=""}={})=>{const a=String(e||"").trim();if(!a)return{visible:!1,status:"unavailable",label:""};const i=mo({currentVersion:a,recommendedVersion:t});return i?{visible:!0,status:"warning",label:i}:{visible:!0,status:"current",label:`Home Assistant ${a}`}},uo=({installed:e=null}={})=>e===!0?{visible:!0,status:"current",label:"Frigate integration is installed."}:e===!1?{visible:!0,status:"error",label:"Frigate integration is not installed in Home Assistant."}:{visible:!1,status:"unavailable",label:""},vo=e=>{const t=e?.config?.components;return Array.isArray(t)?t.includes("frigate"):t instanceof Set?t.has("frigate"):null},go=Object.freeze(new Set(["camera-modal-entity","camera-modal-secondary-entity","camera-modal-light-entity","camera-modal-light-icon","camera-modal-light-entity-2","camera-modal-light-icon-2","camera-modal-connection-type"])),bo="dirtyState",ii="frigate-view-card-editor",fo=200,ri=3e4,we=L,wo=e=>{const t=Number(e);return Number.isFinite(t)&&t>=60&&t%60===0?`${t/60} min`:`${t} sec`},ye=e=>e.map(t=>({value:t,label:wo(t)})),ot=({name:e,options:t,selectedValue:a,compact:i=!1})=>{const r=String(a??""),o=we(e),n=t.some(({description:s})=>!!String(s||"").trim());return`<div class="editor-choice-chips${i?" editor-choice-chips--compact":""}${n?" editor-choice-chips--detailed":""}">
    ${t.map(({value:s,label:d,description:c="",disabled:h=!1})=>{const p=we(s),g=we(d),k=we(c);return`<label class="editor-choice-chip">
          <input class="editor-choice-chip-input" type="radio" name="${o}" value="${p}" ${String(s)===r?"checked":""} ${h?"disabled":""}>
          <span class="editor-choice-chip-body">
            <span class="editor-choice-chip-indicator" aria-hidden="true"></span>
            ${n?`<span class="editor-choice-chip-copy"><span class="editor-choice-chip-text">${g}</span><span class="editor-choice-chip-description">${k}</span></span>`:`<span class="editor-choice-chip-text">${g}</span>`}
          </span>
        </label>`}).join("")}
  </div>`},_e=({name:e,options:t,selectedValue:a})=>{const i=String(a??""),r=we(e);return`<div class="theme-scope-seg card-view-start-seg editor-bubble-selector" style="--editor-bubble-option-count:${Math.max(1,t.length)}">
    ${t.map(({value:o,label:n,disabled:s=!1,disabledReason:d=""})=>{const c=we(o),h=we(n),p=T(d),g=s===!0;return`<label class="theme-scope-opt card-view-start-opt" data-disabled-guidance="${p}"${g&&p?` title="${p}"`:""}>
          <input class="card-view-start-input" type="radio" name="${r}" value="${c}" ${String(o)===i?"checked":""} ${g?"disabled":""} aria-label="${h}${g&&p?`. ${p}`:""}">
          <span>${h}</span>
        </label>`}).join("")}
  </div>`},yo=({name:e,selectedValue:t,gridEnabled:a,slideshowEnabled:i})=>_e({name:e,selectedValue:oe(t),options:ur({gridEnabled:a,slideshowEnabled:i})}),xo=class extends HTMLElement{connectedCallback(){this._requestHomeAssistantDirtyStateContext(),this._scheduleEditorPreviewLayoutSync()}_requestHomeAssistantDirtyStateContext(){if(this._haDirtyStateContext||this._haDirtyStateRequestPending)return;this._haDirtyStateRequestPending=!0;const e=new Event("context-request",{bubbles:!0,composed:!0});e.context=bo,e.subscribe=!0,e.callback=(t,a)=>{this._haDirtyStateRequestPending=!1,!(!t||typeof t.setState!="function")&&(this._haDirtyStateContext=t,typeof a=="function"&&!this._haDirtyStateUnsubscribe&&(this._haDirtyStateUnsubscribe=a),this._seedHomeAssistantDirtyState())},this.dispatchEvent(e),this._haDirtyStateRequestPending=!1}_seedHomeAssistantDirtyState(){const e=this._haDirtyStateContext;if(!e||this._haDirtyBaselineConfig===void 0||(this._haDirtyStateSeeded||(this._haDirtyStateSeeded=!0,e.setState(this._haDirtyBaselineConfig,ii)),this._pendingHaDirtyConfig===void 0))return;const t=this._pendingHaDirtyConfig;this._pendingHaDirtyConfig=void 0,e.setState(t,ii)}_findHomeAssistantEditCardDialog(){let e=this,t=0;for(;e&&t<16;){if(String(e.tagName||"").toUpperCase()==="HUI-DIALOG-EDIT-CARD")return e;e=e.getRootNode?.()?.host||e.parentNode||e.host,t+=1}return document.querySelector?.("hui-dialog-edit-card")||null}_queryOpenShadowRoots(e,t){if(!e||!t)return null;const a=[e],i=new Set;for(;a.length;){const r=a.shift();if(!r||i.has(r))continue;i.add(r);const o=r.querySelector?.(t);if(o)return o;r.querySelectorAll?.("*").forEach(n=>{n.shadowRoot&&!i.has(n.shadowRoot)&&a.push(n.shadowRoot)})}return null}_queryAllOpenShadowRoots(e,t,{stopAtTagNames:a=[]}={}){if(!e||!t)return[];const i=new Set(a.map(s=>String(s||"").toUpperCase())),r=[],o=[e],n=new Set;for(;o.length;){const s=o.shift();!s||n.has(s)||(n.add(s),s.querySelectorAll?.(t).forEach(d=>{r.push(d)}),s.querySelectorAll?.("*").forEach(d=>{i.has(String(d.tagName||"").toUpperCase())||d.shadowRoot&&!n.has(d.shadowRoot)&&o.push(d.shadowRoot)}))}return[...new Set(r)]}_findHomeAssistantCardPreview(){const e=new Set;let t=this,a=0;for(;t&&a<16;){const r=t.getRootNode?.();if(r&&!e.has(r)){e.add(r);const o=this._queryOpenShadowRoots(r,".element-preview");if(o)return o}t=r?.host&&r.host!==t?r.host:t.parentNode||t.host,a+=1}const i=document.querySelector?.("hui-dialog-edit-card");return this._queryOpenShadowRoots(i?.shadowRoot||i,".element-preview")}_editorPreviewLayoutTargets(e){const t=this._queryAllOpenShadowRoots(e,["hui-section[preview]","hui-grid-section","ha-sortable",".container",".card.full-width","hui-card","frigate-view-card"].join(","),{stopAtTagNames:["frigate-view-card"]});return[...new Set([e,...t])]}_ensureEditorPreviewLayoutObserver(){const e=document.querySelector?.("hui-dialog-edit-card"),t=e?.shadowRoot||e;!t||!("MutationObserver"in window)||this._editorPreviewLayoutObserverTarget!==t&&(this._editorPreviewLayoutObserver?.disconnect(),this._editorPreviewLayoutObserver=new MutationObserver(()=>{this._scheduleEditorPreviewLayoutSync()}),this._editorPreviewLayoutObserver.observe(t,{childList:!0,subtree:!0,attributes:!0,attributeFilter:["class","open","opened","fullscreen"]}),this._editorPreviewLayoutObserverTarget=t)}_restoreEditorPreviewLayout(){(this._editorPreviewOriginalStyles||[]).forEach(e=>{e?.element?.style&&Object.entries(e.properties||{}).forEach(([t,{value:a,priority:i}])=>{a?e.element.style.setProperty(t,a,i):e.element.style.removeProperty(t)})}),this._editorPreviewOriginalStyles=[]}_syncEditorPreviewLayout(){const e=this._findHomeAssistantCardPreview();if(!e?.style)return;this._ensureEditorPreviewLayoutObserver();const t=this._editorPreviewLayoutTargets(e),a=this._editorPreviewOriginalStyles||[];(a.length!==t.length||t.some((r,o)=>a[o]?.element!==r))&&(this._restoreEditorPreviewLayout(),this._editorPreviewOriginalStyles=t.map(r=>{const o={};return["width","max-width","min-width","flex","align-self","box-sizing"].forEach(n=>{o[n]={value:r.style.getPropertyValue(n),priority:r.style.getPropertyPriority(n)}}),{element:r,properties:o}})),t.forEach(r=>{r.style.setProperty("width","100%","important"),r.style.setProperty("max-width","none","important"),r.style.setProperty("min-width","0","important"),r.style.setProperty("align-self","stretch","important"),r.style.setProperty("box-sizing","border-box","important"),r===e&&r.style.setProperty("flex","1 1 0","important")})}_scheduleEditorPreviewLayoutSync(){this._editorPreviewLayoutSyncQueued||(this._editorPreviewLayoutSyncQueued=!0,queueMicrotask(()=>{this._editorPreviewLayoutSyncQueued=!1,this.isConnected&&this._syncEditorPreviewLayout()}))}_ensurePtzCapabilityCache(){this._ptzCapabilityCache instanceof Map||(this._ptzCapabilityCache=new Map)}_ensureGo2RtcMetadataCache(){this._go2rtcMetadataCache instanceof Map||(this._go2rtcMetadataCache=new Map)}_ensureHaCameraCapabilityCache(){this._haCameraCapabilityCache instanceof Map||(this._haCameraCapabilityCache=new Map)}_editorCapabilityCacheNow(){return Date.now()}_frigateCapabilityCacheKey(e){const t=String(e||"").trim(),a=this._cameraEntityCapabilityLookupContext(t);return JSON.stringify([t,a?.instanceId||"",a?.cameraName||""])}_haCameraCapabilityCacheKey(e){const t=String(e||"").trim(),a=this._hass?.states?.[t],i=a?.attributes||{};return JSON.stringify([t,!!a,i.supported_features??null,i.frontend_stream_type??null,i.frontend_stream_types??null])}_pruneChangedCapabilityCacheEntries(e,t){e instanceof Map&&e.forEach((a,i)=>{(!a?.entity||i!==t(a.entity))&&e.delete(i)})}_pruneChangedCapabilityCaches(){this._pruneChangedCapabilityCacheEntries(this._ptzCapabilityCache,e=>this._frigateCapabilityCacheKey(e)),this._pruneChangedCapabilityCacheEntries(this._go2rtcMetadataCache,e=>this._frigateCapabilityCacheKey(e)),this._pruneChangedCapabilityCacheEntries(this._haCameraCapabilityCache,e=>this._haCameraCapabilityCacheKey(e))}_cameraEntityCapabilityLookupContext(e){const t=this._hass?.states?.[e];if(!t)return null;const a=t.attributes||{},i=a.client_id||a.mqtt_client_id||"",r=a.camera_name||e.replace(/^camera\./,"");return!i||!r?null:{instanceId:i,cameraName:r}}async _fetchPtzCapabilityForEntity(e){const t=String(e||"").trim();if(!t||!this._hass?.callWS)return null;this._ensurePtzCapabilityCache();const a=this._frigateCapabilityCacheKey(t),i=this._ptzCapabilityCache.get(a);if(i?.resolved)return i.info;if(i?.promise)return i.promise;const r=this._cameraEntityCapabilityLookupContext(t);if(!r){const n={entity:t,resolved:!0,info:null,promise:null};return this._ptzCapabilityCache.set(a,n),null}const o={entity:t,resolved:!1,info:null,promise:null};return o.promise=(async()=>{try{const n=Ha(await this._hass.callWS({type:"frigate/ptz/info",instance_id:r.instanceId,camera:r.cameraName}));o.info=Array.isArray(n)?n[0]||null:n||null}catch(n){console.warn("[Frigate] Editor PTZ info fetch failed",n),o.info=null}finally{o.resolved=!0,o.promise=null}return o.info})(),this._ptzCapabilityCache.set(a,o),o.promise}async _fetchGo2RtcStreamMetadataForEntity(e){const t=String(e||"").trim();if(!t||!this._hass?.callWS)return null;this._ensureGo2RtcMetadataCache();const a=this._frigateCapabilityCacheKey(t),i=this._go2rtcMetadataCache.get(a),r=this._editorCapabilityCacheNow();if(i?.resolved&&i.expiresAt>r)return i.info;if(i?.promise)return i.promise;i&&this._go2rtcMetadataCache.delete(a);const o=this._cameraEntityCapabilityLookupContext(t);if(!o){const s={entity:t,resolved:!0,info:null,promise:null,expiresAt:r+ri};return this._go2rtcMetadataCache.set(a,s),null}const n={entity:t,resolved:!1,info:null,promise:null,expiresAt:0};return n.promise=(async()=>{try{const s=`/api/frigate/${encodeURIComponent(o.instanceId)}/go2rtc/api/streams?src=${encodeURIComponent(o.cameraName)}&video=all&audio=all&microphone`,c=(await this._hass.callWS({type:"auth/sign_path",path:s,expires:3600}))?.path||s,h=await fetch(`${window.location.origin}${c}`,{method:"GET",cache:"no-store",credentials:"same-origin"});if(!h.ok)throw new Error(`HTTP ${h.status}`);n.info=await h.json()}catch(s){console.warn("[Frigate] Editor go2rtc metadata fetch failed",s),n.info=null}finally{n.resolved=!0,n.promise=null,n.expiresAt=this._editorCapabilityCacheNow()+ri}return n.info})(),this._go2rtcMetadataCache.set(a,n),n.promise}async _fetchHaCameraCapabilitiesForEntity(e){const t=String(e||"").trim();if(!t||!this._hass?.callWS)return null;this._ensureHaCameraCapabilityCache();const a=this._haCameraCapabilityCacheKey(t),i=this._haCameraCapabilityCache.get(a);if(i?.resolved)return i.info;if(i?.promise)return i.promise;const r={entity:t,resolved:!1,info:null,promise:null};return r.promise=(async()=>{try{r.info=Ha(await this._hass.callWS({type:"camera/capabilities",entity_id:t}))}catch(o){console.warn("[Frigate] Home Assistant camera capability fetch failed",o),r.info=null}finally{r.resolved=!0,r.promise=null}return r.info})(),this._haCameraCapabilityCache.set(a,r),r.promise}_setRangeValueOutput(e,t,a=""){const i=this.querySelector(`${e}-output`);if(!i)return;const r=Number(t);i.textContent=Number.isFinite(r)?`${r}${a}`:i.textContent}_syncStreamHeightOutput(){const e=this.querySelector("#stream_height-output");if(!e)return;const t=Ye(this.querySelector("#stream_height")?.value),a=Xe(this.querySelector('[name="stream_height_unit"]:checked')?.value||this.querySelector("#stream_height_unit")?.dataset.value||this.querySelector("#stream_height_unit")?.value);e.textContent=`${t}${a}`}_syncCameraModalPtzVisibility({supported:e=!1,loading:t=!1,sourceType:a=N,preserveSelection:i=!1}={}){const r=this.querySelector("#camera-modal-ptz-toggle-row"),o=this.querySelector("#camera-modal-ptz-state"),n=this.querySelector("#camera-modal-ptz-enabled"),s=this.querySelector("#camera-modal-ptz-rotation-row");r&&(r.style.display=e||t?"block":"none"),n&&(n.disabled=!e||t,n.dataset.supported=e?"true":"false",!e&&!t&&!i&&(n.checked=!1)),s&&(s.hidden=!e||t||v(n)!==!0);const d=X(a)==="ha_direct";o&&(t?(o.style.display="block",o.textContent=d?"Checking Frigate PTZ support. Home Assistant remains the live connection.":"Checking Frigate PTZ support for this camera."):e?(o.style.display="none",o.textContent=""):(o.style.display="block",o.textContent="Frigate did not report PTZ pan/tilt support for this camera."))}_syncCameraModalTwoWayTalkVisibility({supported:e=!1,loading:t=!1,sourceType:a=N,preserveSelection:i=!1}={}){const r=this.querySelector("#camera-modal-two-way-talk-toggle-row"),o=this.querySelector("#camera-modal-two-way-talk-enabled"),n=this.querySelector("#camera-modal-two-way-talk-state"),s=X(a)==="ha_direct"?"Home Assistant":"Frigate",d=X(a)==="ha_direct",c=e||t||i,h=e||i;r&&(r.style.display=c?"block":"none"),n&&(t?(n.style.display="block",n.textContent=d?"Checking Home Assistant WebRTC playback support for this camera.":`Checking ${s} two-way talk support for this camera.`):e?d?(n.style.display="block",n.textContent="Experimental: Home Assistant reports WebRTC playback, but does not report talkback capability. Enable only if this camera's Home Assistant WebRTC path accepts outgoing audio."):(n.style.display="none",n.textContent=""):(n.style.display="block",n.textContent=d?"Home Assistant did not report WebRTC playback for this camera, which is required for HA-direct two-way talk.":`${s} did not report two-way talk support for this camera.`)),o&&(o.dataset.supported=e?"true":"false",o.disabled=!h||t,!e&&!t&&!i&&(o.checked=!1))}async _refreshCameraModalPtzSupport(){const e=this._cameraModalEntityValue(),t=this._cameraModalConnectionTypeValue(),a=X(t);if(!e){this._syncCameraModalPtzVisibility({supported:!1,loading:!1,sourceType:a});return}this._syncCameraModalPtzVisibility({supported:!1,loading:!0,sourceType:a,preserveSelection:!0});const i=(this._cameraModalPtzToken||0)+1;this._cameraModalPtzToken=i;const r=await this._fetchPtzCapabilityForEntity(e);if(this._cameraModalPtzToken!==i)return;const o=gr(r);this._syncCameraModalPtzVisibility({supported:o,loading:!1,sourceType:a,preserveSelection:o})}async _refreshCameraModalTwoWayTalkSupport(){const e=this._cameraModalEntityValue(),t=this._cameraModalConnectionTypeValue(),a=X(t),i=a==="ha_direct";if(!e){this._syncCameraModalTwoWayTalkVisibility({supported:!1,loading:!1,sourceType:a});return}if(i){this._syncCameraModalTwoWayTalkVisibility({supported:!1,loading:!0,sourceType:a,preserveSelection:!0});const s=(this._cameraModalTwoWayTalkToken||0)+1;this._cameraModalTwoWayTalkToken=s;const d=await this._fetchHaCameraCapabilitiesForEntity(e);if(this._cameraModalTwoWayTalkToken!==s)return;const c=Wr(d);this._syncCameraModalTwoWayTalkVisibility({supported:c,loading:!1,sourceType:a,preserveSelection:c});return}this._syncCameraModalTwoWayTalkVisibility({supported:!1,loading:!0,sourceType:a,preserveSelection:!0});const r=(this._cameraModalTwoWayTalkToken||0)+1;this._cameraModalTwoWayTalkToken=r;const o=await this._fetchGo2RtcStreamMetadataForEntity(e);if(this._cameraModalTwoWayTalkToken!==r)return;const n=Br(o);this._syncCameraModalTwoWayTalkVisibility({supported:n,loading:!1,sourceType:a,preserveSelection:n})}_normalizeHiddenTabs(e){return Array.isArray(e)?e.map(t=>t==="reviews"?"alerts":t).filter(t=>Le.includes(t)):[...Ge]}_syncHiddenTabsDraftFromConfig(e=this._config){this._hiddenTabsDraft=this._normalizeHiddenTabs(e?.hidden_tabs)}_isTabVisibleFromEvent(e){const t=e?.detail?.value;if(typeof t=="boolean")return t;const a=e?.currentTarget||e?.target;return v(a)}_setHiddenTabFromToggle(e,t){if(!Le.includes(e))return;const a=new Set(this._normalizeHiddenTabs(this._hiddenTabsDraft));t?a.delete(e):a.add(e),this._hiddenTabsDraft=[...a]}disconnectedCallback(){this._textPreviewUpdateT&&(clearTimeout(this._textPreviewUpdateT),this._textPreviewUpdateT=null),this._livePreviewRaf&&(cancelAnimationFrame(this._livePreviewRaf),this._livePreviewRaf=0),this._pendingEditorPreviewUpdate=!1,this._previewUpdateRaf&&(cancelAnimationFrame(this._previewUpdateRaf),this._previewUpdateRaf=0),this._pendingEditorPreviewRouteIntent=null,this._editorPreviewLayoutObserver?.disconnect(),this._editorPreviewLayoutObserver=null,this._editorPreviewLayoutObserverTarget=null,this._restoreEditorPreviewLayout(),this._settingsPanelScrollCleanup?.(),this._settingsPanelScrollCleanup=null,this._settingsPanelResizeObserver?.disconnect?.(),this._settingsPanelResizeObserver=null,Array.isArray(this._boundDialogActionButtons)&&this._boundDialogActionButtons.forEach(({element:e,handler:t})=>{e?.removeEventListener?.("click",t,!0)}),this._boundDialogActionButtons=[],this._onDialogPrimaryActionClick&&document.removeEventListener("click",this._onDialogPrimaryActionClick,!0),this._onDialogSecondaryActionClick&&document.removeEventListener("click",this._onDialogSecondaryActionClick,!0),this._onCameraModalDocumentClick&&document.removeEventListener("click",this._onCameraModalDocumentClick,!0),this._haDirtyStateUnsubscribe?.(),this._haDirtyStateUnsubscribe=null,this._haDirtyStateContext=null,this._haDirtyStateRequestPending=!1,this._haDirtyStateSeeded=!1,this._dialogActionHooksBound=!1,this._standaloneDraftPreviousLandingPage=null,this._emitPreviewDraft(null)}_configSignature(e){try{return JSON.stringify(e||{})}catch{return""}}_syncConfigSaveReminder(){const e=this.querySelector?.("#config-save-reminder");if(!e)return;const t=this._hasConfigDraft===!0;e.hidden=!1,e.dataset&&(e.dataset.configSaveState=t?"dirty":"clean"),e.setAttribute?.("data-config-save-state",t?"dirty":"clean");const a=e.querySelector?.("[data-config-save-reminder-text]");a&&(a.textContent=t?"Unsaved changes \u2014 use Home Assistant's Save button to apply them.":"No pending changes.")}_syncCardVersionStatus(){const e=this.querySelector?.("#card-version-status"),t=this.querySelector?.("#card-version-update-status"),a=this.querySelector?.("#card-version-update-link");if(!e||!t||!a)return;const i=this._hass?.states;this._cardUpdateEntityId&&i&&!i[this._cardUpdateEntityId]&&(this._cardUpdateEntityId="",this._cardUpdateEntityLookupComplete=!1);let r;this._cardUpdateEntityId&&i?.[this._cardUpdateEntityId]?r=Za({states:{[this._cardUpdateEntityId]:i[this._cardUpdateEntityId]}}):this._cardUpdateEntityLookupComplete?r={entityId:"",status:"unavailable",label:"Update status unavailable"}:(r=Za({states:i}),i&&(this._cardUpdateEntityLookupComplete=!0,this._cardUpdateEntityId=r.entityId)),e.dataset.updateStatus!==r.status&&(e.dataset.updateStatus=r.status),t.textContent!==r.label&&(t.textContent=r.label);const o=r.status==="available"&&!!r.entityId;a.hidden=!o,a.dataset.entityId!==r.entityId&&(a.dataset.entityId=r.entityId)}_syncEnvironmentSupportNotice(e,t){const a=this.querySelector?.(e);if(!a)return;const i=a.querySelector?.("[data-environment-support-text]");i&&i.textContent!==t.label&&(i.textContent=t.label),a.dataset.supportStatus!==t.status&&(a.dataset.supportStatus=t.status),a.hidden=!t.visible}_syncEnvironmentSupportNotices(){const e=_o({currentVersion:this._hass?.config?.version,recommendedVersion:Yi}),t=uo({installed:vo(this._hass)});this._syncEnvironmentSupportNotice("[data-home-assistant-version-notice]",e),this._syncEnvironmentSupportNotice("[data-frigate-integration-status]",t)}_openCardUpdateDialog(e){const t=String(e||"").trim();t&&this.dispatchEvent(new CustomEvent("hass-more-info",{bubbles:!0,composed:!0,detail:{entityId:t}}))}setConfig(e){this._sourceConfig=e;const t=this._normalizeConfig(e);this._standaloneDraftPreviousLandingPage===void 0&&(this._standaloneDraftPreviousLandingPage=null),this._syncHiddenTabsDraftFromConfig(t),this._activeSettingsPanelId===void 0&&(this._activeSettingsPanelId=null);const a=this._configSignature(t),i=this._configSignature(this._config);if(this._rendered&&a===i){this._config=t,this._scheduleEditorPreviewLayoutSync();return}this._config=t,this._rendered=!0,this._render(),this._haDirtyBaselineConfig===void 0&&(this._haDirtyBaselineConfig=this._homeAssistantConfig({readDom:!1}),this._haDirtyBaselineSig=this._configSignature(this._haDirtyBaselineConfig),this._hasConfigDraft=!1,this._seedHomeAssistantDirtyState()),this._scheduleEditorPreviewLayoutSync()}set hass(e){this._hass=e,this._pruneChangedCapabilityCaches();const t=this._hass?.themes?.darkMode?"dark":"light",a=`${this._frigateEntities().join(",")}|${t}`;a!==this._lastEntityKey&&(this._lastEntityKey=a,this._rendered&&this._render()),this._syncCardVersionStatus(),this._syncEnvironmentSupportNotices(),this._scheduleEditorPreviewLayoutSync()}_normalizeConfig(e){return oo(e)}_dashboardSwipeOwnershipState(){const e=this._config?.ha_dashboard_swipe_navigation_owner===!0,t=Xa(null,globalThis.document),a=t?.lovelace?.config||null;if(!a)return{requested:e,isOwner:e,locked:!1,conflict:!1,owner:null,ownerPage:"",dashboardName:""};const i=ao(a,qe),r=Ja({panel:t,windowRef:globalThis.window}),o=i.cards.find(({config:S})=>S===this._sourceConfig),n=i.cards.filter(({viewName:S})=>S===r),s=i.owner?.viewName===r&&n.length===1,d=!!i.owner&&(i.owner===o||s),c=e&&(!i.owner||d),h=e&&!!i.owner&&!c,p=!!i.owner&&!d,k=(String(a?.title||"").trim()||String(t?.route?.prefix||"this dashboard").replace(/^\/+/,"").replace(/[-_]+/g," ")).replace(/^dashboard\s+/i,""),f=i.owner?.viewTitle||i.owner?.viewName||r||"another page";return{requested:e,isOwner:c,locked:p,conflict:h,owner:i.owner,ownerPage:f,dashboardName:k}}_dashboardNavbarOwnershipState(){const e=this._config?.mobile_view_ha_navbar_dashboard===!0,t=Xa(null,globalThis.document),a=t?.lovelace?.config||null;if(!a)return{requested:e,isOwner:e,locked:!1,conflict:!1,owner:null,ownerPage:"",dashboardName:""};const i=Ja({panel:t,windowRef:globalThis.window}),r=Yr({dashboardConfig:a,sourceConfig:this._sourceConfig,requested:e,cardTag:qe,currentViewName:i}),n=(String(a?.title||"").trim()||String(t?.route?.prefix||"this dashboard").replace(/^\/+/,"").replace(/[-_]+/g," ")).replace(/^dashboard\s+/i,""),s=r.owner?.viewTitle||r.owner?.viewName||i||"another page";return{...r,ownerPage:s,dashboardName:n}}_landingPageOptionSignature(e){const t=this._normalizeConfig(e),a=re(t,D.desktop).join("|"),i=Rt(t).join("|");return`${a}::${i}::${t.landing_page}::${t.mobile_page}::${Pe(t)}`}_frigateEntities(){const e=this._hass?.states||{},t=Object.keys(e).filter(i=>{if(!i.startsWith("camera."))return!1;const r=e[i]?.attributes;return!!(r?.client_id||r?.mqtt_client_id||r?.camera_name)}),a=this._frigateEntitySet;return a instanceof Set&&a.size===t.length&&t.every(i=>a.has(i))?this._frigateEntityList:(t.sort(),this._frigateEntitySet=new Set(t),this._frigateEntityList=t,t)}_timezoneDisplay(){const e=this._hass?.config?.time_zone||"UTC";try{return`${new Intl.DateTimeFormat(void 0,{timeZone:e,timeZoneName:"longGeneric"}).formatToParts(new Date).find(i=>i.type==="timeZoneName")?.value||e} (${e})`}catch{return e.replace(/_/g," ")}}_rgbToHex(e){const t=String(e||"").trim().match(/^rgba?\((\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i);if(!t)return"";const a=i=>Math.max(0,Math.min(255,Number(i)||0)).toString(16).padStart(2,"0");return`#${a(t[1])}${a(t[2])}${a(t[3])}`}_resolveColorToHex(e,t="#000000"){if(!e)return t;const a=me(e);if(a)return a;const i=document.createElement("span");if(i.style.color=String(e),!i.style.color)return t;this.appendChild(i);const r=getComputedStyle(i).color;return i.remove(),this._rgbToHex(r)||t}_activeThemeModeKey(){return Et(this._hass?.themes?.darkMode===!0?"dark":"light")}_deriveDarkPrimaryHex(){const e=me(this._resolveColorToHex("var(--primary-color)",""));if(!e)return this._resolveColorToHex(ua["--c-primary-d"],"#000000");const t=a=>Math.round(Number.parseInt(e.slice(a,a+2),16)*.75).toString(16).padStart(2,"0");return`#${t(1)}${t(3)}${t(5)}`}_themeDefaultHex(e,t=this._activeThemeModeKey()){const a=Et(t),i=lo(this._hass,{mode:a});if(e==="--c-primary-d"&&i.deriveDarkPrimary)return this._deriveDarkPrimaryHex();if(e==="--c-bg-tabs-holder"){const r=i.source==="custom"||a==="dark";return this._resolveColorToHex(r?"var(--primary-background-color)":"var(--secondary-background-color)",a==="dark"?"#181818":"#f0f0f0")}return e==="--c-bg-mobile-list"||e==="--c-bg-list"||e==="--c-bg-cam-btn"?i.source==="custom"?this._resolveColorToHex("var(--secondary-background-color)",a==="dark"?"#181818":"#f0f0f0"):a==="dark"?"#181818":"#f0f0f0":this._resolveColorToHex(ua[e],"#000000")}_themeDefaultHexMap(){return Object.fromEntries(he.map(e=>[e,Object.fromEntries($t.map(t=>[t.key,this._themeDefaultHex(t.key,e)]))]))}_ensureThemeDraftCache(){const e=Object.fromEntries(he.map(a=>{const i=this._themeDraftCache?.[a],r=Object.fromEntries(Object.entries(i&&typeof i=="object"?i:{}).map(([o,n])=>[o,me(n)]).filter(([,o])=>!!o));return[a,r]})),{overrides:t}=Bt(this._config?.theme_custom,this._activeThemeModeKey());for(const a of he)Object.assign(e[a],t);this._themeDraftCache=e}_cameraLabel(e){const t=String(e?.name||"").trim();if(t)return t;const a=String(e?.entity||"").trim();return a?a.replace(/^camera\./,"").replace(/_/g," "):"Select camera"}_cameraConnectionLabel(e){return X(e)==="ha_direct"?"HA direct":"Frigate go2rtc"}_cameraAlertsContentLabel(e){return Yt(e)==="all_reviews"?"All reviews":"Alerts only"}_cameraPtzLabel(e){return xt({ptz:e})?"PTZ on":""}_cameraTwoWayTalkLabel(e){return e===!0?"Two-Way Talk on":""}_cameraLinkedLightLabel(e){const t=Va(e).map(({entity:a})=>co(a,this._hass?.states?.[a]));return t.length?`${t.length>1?"Lights":"Light"}: ${t.join(", ")}`:""}_cameraMetaLabel(e){return[...Wt(e)?["2-camera group",Je(e.group?.layout)===fe.stacked?"Stacked":"Side by Side"]:[],this._cameraConnectionLabel(e?.connection_type),this._cameraAlertsContentLabel(e?.alerts_content),this._cameraPtzLabel(e?.ptz),this._cameraTwoWayTalkLabel(e?.two_way_talk),this._cameraLinkedLightLabel(e)].filter(Boolean).join(" \xB7 ")}_reorderCameras(e,t,a="replace"){if(e===t||e<0||t<0)return;const i=[...this._getCams()];if(e>=i.length||t>=i.length)return;const r=Ia(i,e,t,a);this._config={...this._config,cameras:r},this._render(),this._publishPreviewDraft(),this._markHomeAssistantDirty(this._homeAssistantConfig({readDom:!1}))}_openCameraModal(e=null){const t=this._getCams(),a=e==null?{entity:"",name:"",connection_type:N,alerts_content:"alerts_only",ptz:null}:t[e]||{};this._editingCamIndex=e,this._cameraModalNameBeforeGroup=String(a?.name||""),this._cameraModalAssignedGroupName="";const i=this.querySelector("#camera-modal-title"),r=this.querySelector("#camera-modal-save"),o=this.querySelector("#camera-modal"),n=this.querySelector("#camera-modal-name"),s=this.querySelector("#camera-modal-entity"),d=this.querySelector("#camera-modal-secondary-entity"),c=this.querySelector("#camera-modal-connection-type"),h=this.querySelector("#camera-modal-all-reviews"),p=this.querySelector("#camera-modal-ptz-enabled"),g=this.querySelector("#camera-modal-two-way-talk-enabled"),k=Va(a),f=this.querySelector("#camera-modal-helper"),S=X(a?.connection_type);if(i&&(i.textContent=e==null?"Add Camera":"Edit Camera"),r&&(r.textContent=e==null?"Add":"Update"),n&&(n.value=a?.name||""),s&&(s.value=a?.entity||"",s.dataset.value=a?.entity||""),d){const x=a?.group?.secondary_entity||"";d.value=x,d.dataset.value=x}this._cameraModalGroupEnabled=Wt(a);const I=Je(a?.group?.layout);if(this.querySelectorAll('[name="camera-modal-group-layout"]').forEach(x=>{x.checked=x.value===I}),this._syncCameraModalGroupFields(),c){const x=X(a?.connection_type);c.value=x,c.dataset.value=x}h&&(h.checked=Yt(a?.alerts_content)==="all_reviews"),p&&(p.checked=xt(a));const H=Zt(a?.ptz?.rotation);this.querySelectorAll('[name="camera-modal-ptz-rotation"]').forEach(x=>{x.checked=Number(x.value)===H}),g&&(g.checked=a?.two_way_talk===!0),[0,1].forEach(x=>{const q=k[x]||null;this._setCameraModalLightFieldValues(x,q),this._setCameraModalLightEnabledState(x,!!q),this._syncCameraModalLightIconContext(q?.entity||"",x)}),this._syncCameraModalLightFields(),f&&(f.textContent=""),this._cameraModalSelectorDismissPending=!1,this._cameraModalSuppressedClickEvent=null,o&&o.classList.remove("hidden"),this._syncCameraModalPtzVisibility({supported:xt(a),loading:!!a?.entity,sourceType:S,preserveSelection:xt(a)}),this._syncCameraModalTwoWayTalkVisibility({supported:!1,loading:!!a?.entity,sourceType:S,preserveSelection:a?.two_way_talk===!0}),this._refreshCameraModalPtzSupport(),this._refreshCameraModalTwoWayTalkSupport()}_closeCameraModal(){const e=this.querySelector("#camera-modal");e&&e.classList.add("hidden"),this._editingCamIndex=null,this._cameraModalGroupEnabled=!1,this._cameraModalLightEnabled=!1,this._cameraModalSecondLightEnabled=!1,this._cameraModalNameBeforeGroup="",this._cameraModalAssignedGroupName="",this._cameraModalSelectorDismissPending=!1,this._cameraModalSuppressedClickEvent=null}_gridOrderCameraLabel(e){const t=String(e?.entity||"").trim(),i=String(this._hass?.states?.[t]?.attributes?.friendly_name||"").trim()||t.replace(/^camera\./,"").replace(/_/g," ")||"Camera",r=String(e?.group_member||"").trim();return r==="A"||r==="B"?`Camera ${r} [${i}]`:this._cameraLabel(e)}_handleCameraModalDocumentClick(e){const t=this.querySelector("#camera-modal");if(!t||t.classList.contains("hidden"))return;const a=t.querySelector?.(".cam-modal-card");if(!a)return;this._cameraModalSuppressedClickEvent=null;const i=e?.composedPath?.(),r=Array.isArray(i)?i:[],o=e?.target||null,n=c=>!!(c&&typeof c=="object"&&typeof c.nodeType=="number"&&a.contains(c)),s=r.includes(a)||r.some(c=>n(c))||n(o),d=r.some(c=>go.has(String(c?.id||"")));if(s){this._cameraModalSelectorDismissPending=d;return}if(d||this._cameraModalSelectorDismissPending){this._cameraModalSelectorDismissPending=!1,this._cameraModalSuppressedClickEvent=e;return}this._closeCameraModal()}_openCameraDeleteConfirmation(e){const t=this._getCams();if(!Number.isInteger(e)||e<0||e>=t.length)return;this._pendingCameraRemovalIndex=e;const a=this.querySelector("#camera-delete-message");a&&(a.textContent=`Are you sure you want to delete \u201C${this._cameraLabel(t[e])}\u201D? This action cannot be undone.`),this.querySelector("#camera-delete-modal")?.classList.remove("hidden"),this.querySelector("#camera-delete-confirm")?.focus?.()}_closeCameraDeleteConfirmation(){this.querySelector("#camera-delete-modal")?.classList.add("hidden"),this._pendingCameraRemovalIndex=null}_confirmCameraRemoval(){const e=this._pendingCameraRemovalIndex;this._closeCameraDeleteConfirmation(),Number.isInteger(e)&&this._removeCamera(e)}_standaloneLandingPageRoutes(){return re({...this._config,card_view_standalone:!1},D.desktop)}_openStandaloneLandingPageModal(){if(this._standaloneLandingModalOpen)return;const t=this._standaloneLandingPageRoutes()[0]||_.singleView,a=this.querySelector("#standalone-landing-page");a&&(a.value=t,a.dataset.value=t);const i=this.querySelector("#standalone-landing-helper");i&&(i.textContent=""),this._standaloneLandingModalOpen=!0;const r=this.querySelector("#standalone-landing-modal");try{typeof r?.showModal=="function"?r.open||r.showModal():(r?.setAttribute?.("open",""),r?.classList?.remove?.("hidden"))}catch{r?.setAttribute?.("open",""),r?.classList?.remove?.("hidden")}a?.focus?.()}_closeStandaloneLandingPageModal({restoreToggle:e=!0}={}){const t=this.querySelector("#standalone-landing-modal");if(typeof t?.close=="function"&&t.open?t.close():(t?.removeAttribute?.("open"),t?.classList?.add?.("hidden")),this._standaloneLandingModalOpen=!1,e){const a=this.querySelector("#card_view_standalone");a&&(a.checked=!0,a.dataset.fvcStandaloneValue="true")}}_confirmStandaloneLandingPage(){const e=this.querySelector("#standalone-landing-page"),t=ie(e?.dataset?.value||e?.value);if(!this._standaloneLandingPageRoutes().includes(t)){const i=this.querySelector("#standalone-landing-helper");i&&(i.textContent="Select an available landing page.");return}const a=this.querySelector("#landing_page");a&&(a.value=t,a.dataset.value=t),this._closeStandaloneLandingPageModal({restoreToggle:!1}),this._u({dispatch:!1,preview:!0,previewRouteIntent:{type:rt.navigate,pageId:t}})}_wireStandaloneLandingPageTransition(e){const t=this.querySelector("#card_view_standalone");if(!t)return;t.dataset.fvcStandaloneValue=this._config?.card_view_standalone===!0?"true":"false";const a=i=>{const r=i?.detail?.value,o=typeof r=="boolean"?r:v(t),n=o?"true":"false";if(t.dataset.fvcStandaloneValue!==n){if(t.dataset.fvcStandaloneValue=n,o){if(this._config?.card_view_standalone!==!0){const s=this.querySelector("#landing_page");this._standaloneDraftPreviousLandingPage=ie(s?.dataset?.value||s?.value||this._config?.landing_page),e?.({type:rt.enterStandalone});return}e?.();return}if(this._standaloneDraftPreviousLandingPage){const s=this.querySelector("#landing_page");s&&(s.value=this._standaloneDraftPreviousLandingPage,s.dataset.value=this._standaloneDraftPreviousLandingPage),e?.({type:rt.revertStandaloneDraft});return}this._openStandaloneLandingPageModal()}};["input","change","value-changed"].forEach(i=>{t.addEventListener(i,a)})}_cameraModalEntityValue(){const e=this.querySelector("#camera-modal-entity");return(e?.dataset?.value??e?.value??e?.__value??"").toString().trim()}_cameraModalSecondaryEntityValue(){const e=this.querySelector("#camera-modal-secondary-entity");return(e?.dataset?.value??e?.value??e?.__value??"").toString().trim()}_cameraModalGroupLayoutValue(){return Je(this.querySelector('[name="camera-modal-group-layout"]:checked')?.value)}_syncCameraModalGroupFields(){const e=this._cameraModalGroupEnabled===!0,t=this.querySelector("#camera-modal-name"),a=this.querySelector("#camera-modal-name-label"),i=this.querySelector("#camera-modal-add-secondary"),r=this.querySelector("#camera-modal-secondary-help"),o=this.querySelector("#camera-modal-remove-secondary"),n=this.querySelector("#camera-modal-group-fields"),s=e?"Group Name":"Camera Name";a&&(a.textContent=s),t&&t.setAttribute?.("aria-label",s),i&&(i.hidden=e),r&&(r.hidden=e),n&&(n.hidden=!e),o&&(o.textContent=this._cameraModalSecondaryEntityValue()?"Remove camera":"Cancel")}_setCameraModalGroupEnabled(e){const t=this._cameraModalGroupEnabled===!0;this._cameraModalGroupEnabled=e===!0;const a=this.querySelector("#camera-modal-name");if(this._cameraModalGroupEnabled&&!t){if(!String(a?.value||"").trim()){const o=hr(this._getCams(),{excludeIndex:this._editingCamIndex});a&&(a.value=o),this._cameraModalAssignedGroupName=o}}else if(!this._cameraModalGroupEnabled&&t){const r=String(a?.value||"").trim();this._cameraModalAssignedGroupName&&r===this._cameraModalAssignedGroupName&&a&&(a.value=this._cameraModalNameBeforeGroup||""),this._cameraModalAssignedGroupName=""}if(!this._cameraModalGroupEnabled){const r=this.querySelector("#camera-modal-secondary-entity");r&&(r.value="",r.dataset.value="")}const i=this.querySelector("#camera-modal-helper");i&&(i.textContent=""),this._syncCameraModalGroupFields()}_cameraModalConnectionTypeValue(){const e=this.querySelector("#camera-modal-connection-type");return X(e?.dataset?.value||e?.value||N)}_cameraModalPtzRotationValue(){return Zt(this.querySelector('[name="camera-modal-ptz-rotation"]:checked')?.value)}_cameraModalLightSuffix(e=0){return e===1?"-2":""}_cameraModalLightEntityValue(e=0){const t=this.querySelector(`#camera-modal-light-entity${this._cameraModalLightSuffix(e)}`);return String(t?.dataset?.value??t?.value??t?.__value??"").trim()}_cameraModalLightIconValue(e=0){const t=this.querySelector(`#camera-modal-light-icon${this._cameraModalLightSuffix(e)}`);return String(t?.dataset?.value??t?.value??t?.__value??"").trim()}_cameraModalLightPositionValue(e=0){return Kt(this.querySelector(`[name="camera-modal-light-position${this._cameraModalLightSuffix(e)}"]:checked`)?.value)}_syncCameraModalLightIconContext(e=this._cameraModalLightEntityValue(),t=0){const a=this.querySelector(`#camera-modal-light-icon${this._cameraModalLightSuffix(t)}`);a&&(a.context=e?{icon_entity:e}:{})}_cameraModalLightEnabledAt(e=0){return e===1?this._cameraModalSecondLightEnabled===!0:this._cameraModalLightEnabled===!0}_setCameraModalLightEnabledState(e,t){if(e===1){this._cameraModalSecondLightEnabled=t===!0;return}this._cameraModalLightEnabled=t===!0}_setCameraModalLightFieldValues(e,t=null){const a=this._cameraModalLightSuffix(e),i=this.querySelector(`#camera-modal-light-entity${a}`),r=this.querySelector(`#camera-modal-light-icon${a}`),o=String(t?.entity||""),n=String(t?.icon||"");i&&(i.value=o,i.dataset.value=o),r&&(r.value=n,r.dataset.value=n);const s=Kt(t?.position);this.querySelectorAll(`[name="camera-modal-light-position${a}"]`).forEach(d=>{d.checked=d.value===s})}_syncCameraModalLightFields(){const e=this._cameraModalLightEnabledAt(0),t=this._cameraModalLightEnabledAt(1),a=this.querySelector("#camera-modal-add-light"),i=this.querySelector("#camera-modal-add-light-2");a&&(a.hidden=e),i&&(i.hidden=!e||t),[0,1].forEach(r=>{const o=this._cameraModalLightSuffix(r),n=this._cameraModalLightEnabledAt(r),s=this.querySelector(`#camera-modal-light-fields${o}`),d=this.querySelector(`#camera-modal-remove-light${o}`);s&&(s.hidden=!n),d&&(d.textContent=this._cameraModalLightEntityValue(r)?`Remove light${r===1?" 2":""}`:"Cancel")})}_setCameraModalLightEnabled(e,t=0){if(!e&&t===0&&this._cameraModalLightEnabledAt(1)){const i={entity:this._cameraModalLightEntityValue(1),icon:this._cameraModalLightIconValue(1),position:this._cameraModalLightPositionValue(1)};this._setCameraModalLightFieldValues(0,i),this._setCameraModalLightEnabledState(0,!0),this._setCameraModalLightFieldValues(1,null),this._setCameraModalLightEnabledState(1,!1),this._syncCameraModalLightIconContext(i.entity,0),this._syncCameraModalLightIconContext("",1)}else this._setCameraModalLightEnabledState(t,e),e||(this._setCameraModalLightFieldValues(t,null),this._syncCameraModalLightIconContext("",t));const a=this.querySelector("#camera-modal-helper");a&&(a.textContent=""),this._syncCameraModalLightFields()}_saveCameraModal(){const e=this._cameraModalEntityValue(),t=this._cameraModalSecondaryEntityValue(),a=(this.querySelector("#camera-modal-name")?.value||"").toString(),i=X(this.querySelector("#camera-modal-connection-type")?.dataset?.value||this.querySelector("#camera-modal-connection-type")?.value||N),r=this.querySelector("#camera-modal-all-reviews"),o=this.querySelector("#camera-modal-ptz-enabled"),n=this.querySelector("#camera-modal-two-way-talk-enabled"),s=v(r)===!0?"all_reviews":"alerts_only",c=o?.dataset?.supported==="true"&&v(o),h=v(n),p=[0,1].filter(E=>this._cameraModalLightEnabledAt(E)).map(E=>({entity:this._cameraModalLightEntityValue(E),icon:this._cameraModalLightIconValue(E),position:this._cameraModalLightPositionValue(E)})),g=St(p),k=c?it({enabled:!0,rotation:this._cameraModalPtzRotationValue()}):null,f=this.querySelector("#camera-modal-helper");if(!e){f&&(f.textContent="Camera is required.");return}if(this._cameraModalGroupEnabled&&!t){f&&(f.textContent="Second camera is required.");return}if(this._cameraModalGroupEnabled&&t===e){f&&(f.textContent="Choose two different cameras.");return}if(p.some(({entity:E})=>!E.startsWith("light."))){f&&(f.textContent="Select a light entity.");return}if(new Set(p.map(({entity:E})=>E)).size!==p.length){f&&(f.textContent="Choose two different lights.");return}const S=[...this._getCams()],I=S.flatMap((E,R)=>R===this._editingCamIndex?[]:et(E)),H=[e];if(this._cameraModalGroupEnabled&&H.push(t),H.some(E=>I.includes(E))){f&&(f.textContent="That camera is already configured.");return}const x=this._cameraModalGroupEnabled?Qe({secondary_entity:t,layout:this._cameraModalGroupLayoutValue()},{primaryEntity:e}):null,q={entity:e,name:a,connection_type:i,alerts_content:s,ptz:k,...h?{two_way_talk:!0}:{},...x?{group:x}:{},...g.length?{linked_entities:g}:{}};if(this._editingCamIndex==null){if(Ft(S)+et(q).length>ce){f&&(f.textContent=`Maximum ${ce} cameras.`);return}S.push(q)}else if(S[this._editingCamIndex]){const E=[...S];if(E[this._editingCamIndex]=q,Ft(E)>ce){f&&(f.textContent=`Maximum ${ce} cameras.`);return}S[this._editingCamIndex]=q}this._config={...this._config,cameras:Gt(S,ce)},this._closeCameraModal(),this._render(),this._publishPreviewDraft(),this._markHomeAssistantDirty(this._homeAssistantConfig({readDom:!1}))}_removeCamera(e){const t=[...this._getCams()];!Number.isInteger(e)||e<0||e>=t.length||(t.splice(e,1),this._config={...this._config,cameras:t},this._render(),this._publishPreviewDraft(),this._markHomeAssistantDirty(this._homeAssistantConfig({readDom:!1})))}_wireCameraDragAndDrop(){const e=Array.from(this.querySelectorAll(".cam-row"));Ba({rows:e,clearDropTargets:()=>{this.querySelectorAll(".cam-row").forEach(t=>{t.classList.remove("drop-target","drop-target-before","drop-target-after")})},onReorder:(t,a,i)=>{this._reorderCameras(t,a,i)}})}_renderSettingsPanel({id:e,title:t,icon:a,content:i,active:r=!1}){const o=String(a||"").trim(),n=o.startsWith("<svg")?`<span class="setting-title-icon" aria-hidden="true">${o}</span>`:`<ha-icon icon="${T(o)}"></ha-icon>`;return`<section class="settings-panel ${r?"active":""}" data-panel="${T(e)}">
      <button type="button" class="setting-title" data-panel-toggle="${T(e)}" aria-expanded="${r?"true":"false"}">
        ${n}
        <h3>${L(t)}</h3>
      </button>
      <div class="setting-content">
        ${i}
        <div class="settings-more-slot">
          <button type="button" class="settings-more-chip" data-panel-more title="Show more options" aria-label="Show more options" hidden>
            <span>More</span>
            ${F.chevron}
          </button>
        </div>
      </div>
    </section>`}_settingsPanelScrollContainer(e=null){const t=Array.isArray(e)&&e.length?[...e]:[];if(!t.length){let a=this;const i=new Set;for(;a&&!i.has(a);){i.add(a),t.push(a);const r=a.getRootNode?.();a=a.assignedSlot||a.parentElement||r?.host||null}}for(const a of t){const i=this.ownerDocument;if(!a||a===i?.scrollingElement||a===i?.documentElement||a===i?.body||typeof a.getBoundingClientRect!="function")continue;let r="";try{r=String(globalThis.getComputedStyle?.(a)?.overflowY||"")}catch{continue}if(/(auto|scroll|overlay)/.test(r)&&a.clientHeight>0)return a}return null}_syncSettingsPanelMoreState(e,t=null){const a=e?.querySelector?.(".setting-content"),i=a?.querySelector?.("[data-panel-more]"),r=a?.querySelector?.(".settings-more-slot");if(!i||!r)return;if(!e.classList?.contains("active")){i.hidden=!0;return}const o=t,n=a.getBoundingClientRect?.(),s=o?.getBoundingClientRect?.();if(!n||!s){i.hidden=!0;return}const d=Number(s.bottom),c=Number(n.bottom)>d+3;if(i.hidden=!c,!c)return;const h=Math.max(8,Math.min(Number(n.height)-44,d-Number(n.top)-38));r.style.top=`${h}px`}_scrollSettingsPanelToRemainingContent(e,t,a){if(!e||!a)return!1;const i=t.indexOf(e),r=t[i+1]?.querySelector?.("[data-panel-toggle]"),o=e.querySelector?.(".setting-content"),n=r?.getBoundingClientRect?.()||o?.getBoundingClientRect?.(),s=a.getBoundingClientRect?.();if(!n||!s)return!1;const d=Math.max(0,Math.ceil(Number(n.bottom)-Number(s.bottom)+8));return d<=0?!1:(typeof a.scrollBy=="function"?a.scrollBy({top:d,behavior:"smooth"}):a.scrollTop+=d,!0)}_wireSettingsPanels(){this._settingsPanelScrollCleanup?.(),this._settingsPanelScrollCleanup=null,this._settingsPanelResizeObserver?.disconnect?.(),this._settingsPanelResizeObserver=null;const e=Array.from(this.querySelectorAll(".settings-panel"));if(!e.length)return;let t=this._settingsPanelViewport?.isConnected!==!1&&this._settingsPanelViewport||null;t||(t=this._settingsPanelScrollContainer()),t&&(this._settingsPanelViewport=t);let a=0,i=null;const r=()=>{const c=e.find(h=>h.classList.contains("active"))||null;i&&i!==c&&this._syncSettingsPanelMoreState(i,t),i=c,c&&this._syncSettingsPanelMoreState(c,t)},o=()=>{a||(typeof globalThis.requestAnimationFrame=="function"?a=globalThis.requestAnimationFrame(()=>{a=0,r()}):setTimeout(r,0))},n=c=>{!c||c===t||(t?.removeEventListener?.("scroll",o),t=c,this._settingsPanelViewport=c,t.addEventListener?.("scroll",o,{passive:!0}),o())};t?.addEventListener?.("scroll",o,{passive:!0}),globalThis.addEventListener?.("resize",o,{passive:!0}),this._settingsPanelScrollCleanup=()=>{t?.removeEventListener?.("scroll",o),globalThis.removeEventListener?.("resize",o),a&&(globalThis.cancelAnimationFrame?.(a),a=0)},typeof globalThis.ResizeObserver=="function"&&(this._settingsPanelResizeObserver=new globalThis.ResizeObserver(o),e.forEach(c=>{const h=c.querySelector?.(".setting-content");h&&this._settingsPanelResizeObserver.observe(h)}));const s=c=>{this._activeSettingsPanelId=zr(e,c),o()};e.forEach(c=>{const h=c.querySelector?.(".setting-content");c.querySelector("[data-panel-toggle]")?.addEventListener("click",p=>{n(this._settingsPanelScrollContainer(p.composedPath?.())),c.classList.contains("active")?s(null):s(c)}),h?.querySelector?.("[data-panel-more]")?.addEventListener?.("click",p=>{p.preventDefault(),p.stopPropagation(),n(this._settingsPanelScrollContainer(p.composedPath?.())),this._scrollSettingsPanelToRemainingContent(c,e,t)})});const d=e.find(c=>c.dataset.panel===this._activeSettingsPanelId);s(d||null)}_wireEditorDialogActions(){if(this._dialogActionHooksBound)return;const e=()=>{this._standaloneDraftPreviousLandingPage=null,this._hasConfigDraft&&this._commitDraftToHomeAssistantDialog(),this._hasConfigDraft=!1,this._hasVisualDraft=!1,this._syncConfigSaveReminder(),this._emitPreviewDraft(null,{type:rt.commit})},t=i=>{i?.classList?.contains?.("gui-mode-button")||(this._hasConfigDraft=!1,this._hasVisualDraft=!1,this._syncConfigSaveReminder(),this._emitPreviewDraft(null))},a=()=>{this._boundDialogActionButtons=[];const i=new Set;let r=this,o=0;for(;r&&o<8;){const n=r.getRootNode?.();n instanceof ShadowRoot&&!i.has(n)&&(i.add(n),n.querySelectorAll(qa).forEach(s=>{if(this.contains?.(s))return;const d=Xt(s);if(!d)return;const c=()=>{if(d==="primary"){e();return}t(s)};s.addEventListener("click",c,!0),this._boundDialogActionButtons.push({element:s,handler:c})})),r=r.parentNode||r.host,o+=1}};this._onDialogPrimaryActionClick=i=>{Ra(i)==="primary"&&e()},this._onDialogSecondaryActionClick=i=>{if(Ra(i)!=="secondary")return;const r=i.composedPath?.()?.find?.(o=>o instanceof Element&&Xt(o)==="secondary");t(r)},this._onCameraModalDocumentClick=i=>{this._handleCameraModalDocumentClick(i)},document.addEventListener("click",this._onDialogPrimaryActionClick,!0),document.addEventListener("click",this._onDialogSecondaryActionClick,!0),document.addEventListener("click",this._onCameraModalDocumentClick,!0),a(),this._dialogActionHooksBound=!0}_wireLivePreviewUpdates(){if(this._livePreviewHooksBound)return;const e=["#title","#subtitle","#display_title","#display_subtitle","#display_logo","#display_version","#event_days","#alerts_reviews_days","#realtime_poll_seconds","#snapshot_update_seconds","#slideshow_rotation_enabled","#slideshow_rotation_seconds","#slideshow_alert_hold_seconds","#grid_mode_enabled","#grid_live_view_enabled","#grid_rotation_seconds","#grid_alert_hold_seconds","#mobile_view_page_enabled","#mobile_view_rotate_to_fullscreen","#mobile_view_dashboard_background","#mobile_view_outer_border","#mobile_view_ha_navbar_bottom","#mobile_view_ha_navbar_stack_tabs","#mobile_view_ha_navbar_dashboard","#ha_dashboard_swipe_navigation_owner","#ha_dashboard_swipe_navigation",'[name="ha_dashboard_swipe_pages"]','[name="ha_dashboard_swipe_mobile_pages"]',"#ha_dashboard_swipe_include_other_cards","[data-ha-dashboard-swipe-include-subviews]","#ha_dashboard_swipe_mouse_enabled","#preview_page_enabled","#preview_page_live_cameras","#preview_page_live_cameras_mobile","#preview_page_alert_live_duration_seconds","#preview_page_show_title_bars","#single_view_alert_takeover",'[name="single_view_start_mode"]',"#wide_view_page_enabled","#wide_view_live_cameras","#wide_view_alert_takeover",'[name="wide_view_start_mode"]',"#wide_view_timeline_enabled","#wide_view_timeline_default_open","#wide_view_timeline_default_scale","#card_view_page_enabled","#card_view_alert_takeover",'[name="card_view_view_mode"]','[name="card_view_start_mode"]',"#card_view_media_drawer_enabled","#card_view_hide_camera_name","#landing_page","#mobile_page","#stream_height","#stream_height_unit","#col_left_width_pct","#tight_margins","#shadows","#borders","#rounded_corners","#outer_shadows","#mobile_poll_battery_saver","#event_pre_post_roll_enabled","#favorites_mixed_cameras","[data-active-tab]","[data-theme-option]","[data-theme-scope]","[data-theme-color]","[data-theme-reset]","[data-theme-default]"],t=["#title","#subtitle"],a=(o,n)=>(Array.isArray(o.composedPath?.())?o.composedPath():[]).some(d=>d instanceof Element&&n.some(c=>d.matches?.(c))),i=()=>{this._livePreviewRaf||(this._livePreviewRaf=requestAnimationFrame(()=>{this._livePreviewRaf=0;const o=this._pendingEditorPreviewUpdate===!0;this._pendingEditorPreviewUpdate=!1,this._u({dispatch:!1,preview:o})}))},r=o=>{if(!a(o,e))return;const n=a(o,t);if(n&&o.type!=="change"){clearTimeout(this._textPreviewUpdateT),this._textPreviewUpdateT=setTimeout(()=>{this._textPreviewUpdateT=null,this._pendingEditorPreviewUpdate=!0,i()},fo);return}n&&this._textPreviewUpdateT&&(clearTimeout(this._textPreviewUpdateT),this._textPreviewUpdateT=null),this._pendingEditorPreviewUpdate=!0,i()};["input","change","value-changed","selected-changed","click"].forEach(o=>{this.addEventListener(o,r,!0)}),this._livePreviewHooksBound=!0}_setEditorFieldError(e,t){$r(this,e,t)}_validateEditorFields(){let e=!0;const t=this.querySelector("#event_days")?.dataset.value||this.querySelector("#event_days")?.value||String(le),a=Number(t),i=Number.isInteger(a)&&a>=1&&a<=15?"":"Select a value from 1 to 15.";this._setEditorFieldError("#event_days",i),i&&(e=!1);const r=this.querySelector("#alerts_reviews_days")?.dataset.value||this.querySelector("#alerts_reviews_days")?.value||String(de),o=Number(r),n=Number.isInteger(o)&&o>=1&&o<=15?"":"Select a value from 1 to 15.";this._setEditorFieldError("#alerts_reviews_days",n),n&&(e=!1);const s=String(this.querySelector("#stream_height")?.value||"").trim(),d=Number(s),c=Number.isInteger(d)&&d>=ut&&d<=vt?"":`Select a whole number from ${ut} to ${vt}.`;this._setEditorFieldError("#stream_height",c),c&&(e=!1);const h=this.querySelector("#wide_view_page_enabled")?.checked===!0,p=String(this.querySelector("#col_left_width_pct")?.value||"").trim(),g=Number(p),k=!h||Number.isInteger(g)&&g>=bt&&g<=ft?"":`Select a whole number from ${bt} to ${ft}.`;return this._setEditorFieldError("#col_left_width_pct",k),k&&(e=!1),e}_render(){const e=this._frigateEntities(),t=this._getCams(),a=this._dashboardNavbarOwnershipState(),i=a.locked,r=String(a.ownerPage||""),o=`<strong>Page: ${L(r)}</strong>`,n=`<strong>${L(`Dashboard: ${a.dashboardName||"this dashboard"}`)}</strong>`,s=`${o} ${n}`,d=a.locked?a.conflict?`This card also claims Whole Dashboard in raw YAML, but the ${ke} at ${s} controls it. Turn off Whole Dashboard here or remove the duplicate YAML setting.`:`The ${ke} at ${s} controls Move HA Navbar to Bottom. Turn off Whole Dashboard there to change this setting.`:"",c=a.isOwner&&a.owner?`This card controls Move HA Navbar to Bottom for the whole dashboard. ${s}`:"",h=this._dashboardSwipeOwnershipState(),p=Ke(this._config?.ha_dashboard_swipe_navigation),g=h.isOwner&&h.requested,k=h.locked&&!h.requested,f=`<strong>Page: ${L(h.ownerPage||"")}</strong>`,S=`<strong>${L(`Dashboard: ${h.dashboardName||"this dashboard"}`)}</strong>`,I=`${f} ${S}`,H=h.locked?h.conflict?`This card also claims swipe control in raw YAML, but the ${ke} at ${I} controls it. Turn off this switch here or remove the duplicate YAML setting.`:`The ${ke} at ${I} controls Swipe Navigation. Turn it off there before enabling it here.`:"",q=[{value:C.dashboardWide,label:"Dashboard Wide",description:`Swipe between dashboard pages and selected ${ae} pages.`},{value:C.insideCard,label:"Inside Card Only",description:`Swipe between selected ${ae} pages. Other cards can be included.`},{value:C.landingDashboard,label:"Landing Page + Dashboard Pages",description:`Swipe between dashboard pages with the landing page as the only ${ae} stop.`},{value:C.none,label:"None",description:`Keep ownership but disable ${ae} swipe navigation.`}].map(({value:l,label:m,description:y})=>{const $=l===p,K=l===C.insideCard,Se=l===C.dashboardWide||l===C.landingDashboard;return`<div class="editor-swipe-choice${$?" selected":""}">
          <label class="editor-choice-chip">
            <input class="editor-choice-chip-input" type="radio" name="ha_dashboard_swipe_navigation" value="${T(l)}" ${$?"checked":""} ${g?"":"disabled"}>
            <span class="editor-choice-chip-body">
              <span class="editor-choice-chip-indicator" aria-hidden="true"></span>
              <span class="editor-choice-chip-copy"><span class="editor-choice-chip-text">${L(m)}</span><span class="editor-choice-chip-description">${L(y)}</span></span>
            </span>
          </label>
          ${K?`<label class="editor-swipe-choice-footer"><span>Include ${ae} Cards on Other Dashboard Pages</span><ha-switch id="ha_dashboard_swipe_include_other_cards" ${this._config?.ha_dashboard_swipe_include_other_cards?"checked":""} ${g&&$?"":"disabled"}></ha-switch></label>`:""}
          ${Se?`<label class="editor-swipe-choice-footer"><span>Swipe to Subviews</span><ha-switch data-ha-dashboard-swipe-include-subviews="${T(l)}" ${this._config?.ha_dashboard_swipe_include_subviews?"checked":""} ${g&&$?"":"disabled"}></ha-switch></label>`:""}
        </div>`}).join(""),E=[C.dashboardWide,C.insideCard].includes(p),R=new Set(re(this._config,D.desktop)),Ve=ie(this._config?.landing_page),ne=new Set(mt(this._config,D.desktop)),ze=new Set(re(this._config,D.mobile)),ue=Pe(this._config),ve=new Set(_t(this._config)),be={[_.preview]:"Preview",[_.singleView]:"Single View",[_.mobileView]:"Mobile View",[_.wideView]:"Wide View",[_.cardView]:"Card View"},M=Ht.map(l=>{const m=l===Ve,y=!g||!R.has(l)||m;return`<label class="editor-choice-chip">
          <input class="editor-choice-chip-input" type="checkbox" name="ha_dashboard_swipe_pages" value="${T(l)}" ${ne.has(l)?"checked":""} ${m?'data-dashboard-swipe-landing="true"':""} ${y?"disabled":""}>
          <span class="editor-choice-chip-body">
            <span class="editor-choice-chip-indicator" aria-hidden="true"></span>
            <span class="editor-choice-chip-text">${L(be[l])}</span>
          </span>
        </label>`}).join(""),G=qt.map(l=>{const m=l===ue,y=!g||!ze.has(l)||m;return`<label class="editor-choice-chip">
          <input class="editor-choice-chip-input" type="checkbox" name="ha_dashboard_swipe_mobile_pages" value="${T(l)}" ${ve.has(l)?"checked":""} ${m?'data-dashboard-swipe-landing="true"':""} ${y?"disabled":""}>
          <span class="editor-choice-chip-body">
            <span class="editor-choice-chip-indicator" aria-hidden="true"></span>
            <span class="editor-choice-chip-text">${L(be[l])}</span>
          </span>
        </label>`}).join(""),J=Ft(t),U=Ma(t),P=pe(this._config?.grid_order,t),Z=new Map(U.map(l=>[l.entity,l])),j=P.mode===B.custom?P.included.length:J,Oe=J<ce,w=this._timezoneDisplay(),z=new Set(this._normalizeHiddenTabs(this._hiddenTabsDraft??this._config?.hidden_tabs));this._ensureThemeDraftCache();const Q=this._config?.theme==="custom"?"custom":"default",O=this._activeThemeModeKey(),xe=Bt(this._config?.theme_custom,O),si=At(this._config?.theme_custom_defaults),ni=xe.scope,li=xe.overrides,di=si[O]||{},ci=this._themeDraftCache[O]||{},Qt=Ye(this._config?.stream_height),ea=Xe(this._config?.stream_height_unit),ta=wt(this._config?.col_left_width_pct),hi=yt(this._config?.wide_view_timeline_default_scale),pi=Re.includes(Number(this._config?.realtime_poll_seconds))?Number(this._config.realtime_poll_seconds):5,mi=V(this._config?.snapshot_update_seconds,Ne,Ee),_i=V(this._config?.preview_page_alert_live_duration_seconds,Fe,Math.round(Ji/1e3)),ui=V(this._config?.slideshow_alert_hold_seconds,je,Math.round(Ae/1e3)),vi=V(this._config?.slideshow_rotation_seconds,Ie,30),gi=Be.includes(Number(this._config?.grid_rotation_seconds))?Number(this._config.grid_rotation_seconds):30,Pt=(l,m)=>yo({name:l,selectedValue:m,gridEnabled:this._config?.grid_mode_enabled===!0,slideshowEnabled:this._config?.slideshow_rotation_enabled===!0}),bi=Pt("single_view_start_mode",this._config?.single_view_start_mode),fi=Pt("wide_view_start_mode",this._config?.wide_view_start_mode),wi=Pt("card_view_start_mode",this._config?.card_view_start_mode),aa=at(this._config?.card_view_view_mode),yi=[{value:Y.videoOnly,label:"Video Only"},{value:Y.bottomPanelOpen,label:"Bottom Panel Open"},{value:Y.bottomPanelClosed,label:"Bottom Panel Closed"}].map(({value:l,label:m})=>`<label class="theme-scope-opt card-view-start-opt">
          <input class="card-view-start-input" type="radio" name="card_view_view_mode" value="${l}" ${aa===l?"checked":""}>
          <span>${m}</span>
        </label>`).join(""),ia=l=>l===_.mobileView?"Mobile":l===_.preview?"Preview":l===_.wideView?"Wide View":l===_.cardView?"Card View":"Single View",xi=re(this._config,D.desktop).map(l=>({value:l,label:ia(l)})),Si=this._standaloneLandingPageRoutes().map(l=>({value:l,label:ia(l)})),Ci={[b.mobile]:"Mobile",[b.card]:"Card View",[b.previewMobile]:"Preview + Mobile",[b.previewSingle]:"Preview + Single View",[b.single]:"Single View"},ki=Rt(this._config).map(l=>({value:l,label:Ci[l]})),$e=(l,m)=>`<ha-formfield label="${m}">
          <ha-switch data-active-tab="${l}" ${z.has(l)?"":"checked"}></ha-switch>
        </ha-formfield>`,Ei=$t.map(l=>{const m=l.key,y=this._themeDefaultHex(m,O),$=me(li[m]),K=me(ci[m]),Se=$||K||y,te=di[m]===!0,He=te?y:Se,ct=!te&&He!==y;return`
        <div class="theme-custom-row" data-theme-row="${m}">
          <div class="theme-custom-label">
            <div>${l.label}</div>
            ${ct?'<div class="theme-custom-warn">Draft changes require card config save.</div>':""}
          </div>
          <div class="theme-color-wrap">
            <input class="theme-color-input" type="color" data-theme-color="${m}" value="${He}" ${te?"disabled":""}>
            <button
              type="button"
              class="theme-color-reset"
              data-theme-reset="${m}"
              title="Reset to default color"
              aria-label="Reset to default color"
              ${te?"hidden":""}
            >
              <ha-icon icon="mdi:autorenew"></ha-icon>
            </button>
          </div>
          <ha-formfield label="Use Default">
            <ha-switch data-theme-default="${m}" ${te?"checked":""}></ha-switch>
          </ha-formfield>
        </div>`}).join(""),Ai=[{value:"light",label:"Light",icon:"mdi:white-balance-sunny"},{value:"dark",label:"Dark",icon:"mdi:weather-night"},{value:"both",label:"Both",icon:"mdi:theme-light-dark"}].map(({value:l,label:m,icon:y})=>{const $=ni===l;return`<button
          type="button"
          class="theme-scope-opt ${$?"active":""}"
          data-theme-scope="${l}"
          role="radio"
          aria-checked="${$?"true":"false"}"
          aria-label="Apply custom theme in ${m.toLowerCase()} mode${l==="both"?"s":""}"
        ><ha-icon icon="${y}"></ha-icon><span>${m}</span></button>`}).join(""),Mi=t.map((l,m)=>`
      <div class="cam-row" draggable="true" data-row="${m}">
        <button class="cam-drag" type="button" title="Drag to reorder" aria-label="Drag to reorder"><ha-icon icon="mdi:drag-horizontal-variant"></ha-icon></button>
        <div><div class="cam-name">${L(this._cameraLabel(l))}</div><div class="cam-meta">${L(this._cameraMetaLabel(l))}</div></div>
                <button class="cam-action" type="button" title="Edit" aria-label="Edit" data-edit-cam="${m}"><svg viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg"><path fill="currentColor" d="M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87M3,17.25V21H6.75L17.81,9.94L14.06,6.19L3,17.25Z" /></svg></button>
                <button class="cam-action" type="button" title="Delete" aria-label="Delete" data-remove-cam="${m}"><svg viewBox="0 0 24 24" style="width:24px; height:24px" fill="currentColor"><path d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z" /></svg></button>
      </div>`).join(""),Li=P.included.map((l,m)=>{const y=Z.get(l);return y?`${m%4===0?`<div class="grid-order-heading">Grid ${Math.floor(m/4)+1}</div>`:""}
          <div class="grid-order-row" draggable="true" data-row="${m}" data-grid-order-entity="${T(l)}">
            <button class="cam-drag" type="button" title="Drag to reorder" aria-label="Drag to reorder"><ha-icon icon="mdi:drag-horizontal-variant"></ha-icon></button>
            <div class="grid-order-camera-copy">
              <div class="cam-name">${L(this._gridOrderCameraLabel(y))}</div>
              <div class="cam-meta">${L(l)}</div>
            </div>
            <button class="icon-btn grid-order-action grid-order-action--exclude" type="button" title="Exclude from Grid" aria-label="Exclude ${T(this._gridOrderCameraLabel(y))} from Grid" data-grid-order-exclude="${T(l)}">
              ${F.gridExclude}
              <span>Exclude</span>
            </button>
          </div>`:""}).join(""),Ti=P.excluded.map(l=>{const m=Z.get(l);return m?`<div class="grid-order-excluded-row" data-grid-order-entity="${T(l)}">
          <div class="grid-order-camera-copy">
            <div class="cam-name">${L(this._gridOrderCameraLabel(m))}</div>
            <div class="cam-meta">${L(l)}</div>
          </div>
          <button class="icon-btn grid-order-action grid-order-action--include" type="button" title="Include in Grid" aria-label="Include ${T(this._gridOrderCameraLabel(m))} in Grid" data-grid-order-include="${T(l)}">
            ${F.gridInclude}
            <span>Include</span>
          </button>
        </div>`:""}).join(""),Pi=`
      <div class="grid-order-custom camera-group-fields" ${P.mode===B.custom?"":"hidden"}>
        <div class="grid-order-sections">
          ${Li||'<div class="cam-helper">No cameras are currently included in Grid mode.</div>'}
        </div>
        <div class="grid-order-excluded" ${P.excluded.length?"":"hidden"}>
          <div class="grid-order-heading">Excluded Cameras</div>
          ${Ti}
        </div>
      </div>`,Di=`
      <div class="section">
        <span class="field-label">Cameras ${e.length?'<small style="font-weight:400;color:var(--c-text2)">(Frigate cameras detected)</small>':""}</span>
        <div class="cam-wrap" id="cam-list">${Mi}</div>
        ${Oe?'<div class="cam-toolbar"><button id="camera-add" class="cam-add" type="button">Add</button></div>':""}
        <span class="cam-helper">${J} of ${ce} cameras configured</span>
      </div>`,Vi=`
      <div class="environment-version-summary">
        <div class="card-version-status" id="card-version-status" data-update-status="unavailable">
          <span class="environment-item-icon card-version-icon" aria-hidden="true">${F.packageCheck}</span>
          <div class="card-version-copy">
            <strong>${ke}</strong>
            <span>Version v${L(Ki)} <span aria-hidden="true">\u2022</span> <span id="card-version-update-status" role="status" aria-live="polite">Update status unavailable</span></span>
            <div class="environment-support-items">
              <div class="environment-support-item" data-home-assistant-version-notice data-support-status="unavailable" role="status" aria-live="polite" hidden>
                <span class="environment-item-icon" aria-hidden="true">${F.homeAssistant}</span>
                <span data-environment-support-text></span>
              </div>
              <div class="environment-support-item" data-frigate-integration-status data-support-status="unavailable" role="status" aria-live="polite" hidden>
                <span class="environment-item-icon" aria-hidden="true">${F.frigate}</span>
                <span data-environment-support-text></span>
              </div>
            </div>
          </div>
          <button class="card-version-update-link" id="card-version-update-link" type="button" hidden>Open update</button>
        </div>
      </div>
      <div class="text-display-row">
        <ha-input label="Title" name="title" id="title" type="text" value="${T(this._config?.title||pt)}" placeholder="${T(pt)}"></ha-input>
        <label class="text-display-checkbox"><input id="display_title" type="checkbox" ${this._config?.display_title!==!1?"checked":""}> <span>Display</span></label>
      </div>
      <div class="text-display-row">
        <ha-input label="Subtitle" name="subtitle" id="subtitle" type="text" value="${T(this._config?.subtitle||Ot)}" placeholder="${T(Ot)}"></ha-input>
        <label class="text-display-checkbox"><input id="display_subtitle" type="checkbox" ${this._config?.display_subtitle!==!1?"checked":""}> <span>Display</span></label>
      </div>
      <div class="field-helper text-display-token-helper">Use <code>{camera}</code> to show the active camera name. Grid mode shows <strong>Grid</strong>.</div>
      <div class="section">
        <div class="layout-row" style="align-items:flex-start;gap:12px;flex-wrap:wrap;justify-content:flex-start">
          <div style="min-width:160px;display:flex;flex-direction:column;gap:6px">
            <span class="field-label" style="margin:0">Event History Days</span>
            <ha-selector id="event_days" style="width:160px"></ha-selector>
            <div class="field-helper" id="event_days-helper"></div>
          </div>
          <div style="min-width:160px;display:flex;flex-direction:column;gap:6px">
            <span class="field-label" style="margin:0">Alert/Review History Days</span>
            <ha-selector id="alerts_reviews_days" style="width:160px"></ha-selector>
            <div class="field-helper" id="alerts_reviews_days-helper"></div>
          </div>
        </div>
        <div class="layout-row" style="align-items:flex-start;gap:12px;flex-wrap:wrap;justify-content:flex-start;margin-top:12px">
          <div style="display:flex;flex-direction:column;gap:6px;max-width:460px">
            <div class="layout-row" style="justify-content:flex-start;gap:8px">
              <span class="field-label" style="margin:0">Enable Pre-Roll/Post-Roll</span>
              <ha-switch id="event_pre_post_roll_enabled" ${this._config?.event_pre_post_roll_enabled?"checked":""}></ha-switch>
            </div>
            <div class="field-helper">Adds ${Xi} seconds before and after alert and clip playback or downloads. Requires Frigate recordings.</div>
          </div>
        </div>
        <div class="layout-row" style="align-items:flex-start;gap:12px;flex-wrap:wrap;justify-content:flex-start;margin-top:12px">
          <div style="display:flex;flex-direction:column;gap:6px;max-width:460px">
            <div class="layout-row" style="justify-content:flex-start;gap:8px">
              <span class="field-label" style="margin:0">Favorites from All Cameras</span>
              <ha-switch id="favorites_mixed_cameras" ${this._config?.favorites_mixed_cameras!==!1?"checked":""}></ha-switch>
            </div>
            <div class="field-helper">Shows favorites from all configured cameras. Turn off to show only the active camera.</div>
          </div>
        </div>
      </div>
      <div class="section">
        <div class="layout-row" style="align-items:flex-start;gap:12px;flex-wrap:wrap;justify-content:flex-start">
          <div class="editor-choice-field editor-choice-field--fit" id="realtime_poll_seconds" role="radiogroup" aria-label="Fallback Update Check">
            <div class="field-label">Fallback Update Check</div>
            ${_e({name:"realtime_poll_seconds",options:ye(Re),selectedValue:pi})}
            <div class="field-helper">Fallback interval for checking new alerts and reviews. Shorter intervals use more battery and data.</div>
          </div>
        </div>
        <div class="layout-row" style="align-items:flex-start;gap:12px;flex-wrap:wrap;justify-content:flex-start;margin-top:12px">
          <div id="snapshot_update_row" style="min-width:210px;display:flex;flex-direction:column;gap:6px;width:100%">
            <div class="editor-choice-field" id="snapshot_update_seconds" role="radiogroup" aria-label="Snapshot Refresh">
              <div class="field-label">Snapshot Refresh</div>
              ${_e({name:"snapshot_update_seconds",options:ye(Ne),selectedValue:mi})}
            </div>
            <div class="field-helper">How often snapshots refresh when Live View is off.</div>
          </div>
        </div>
        <div class="layout-row" style="align-items:flex-start;gap:12px;flex-wrap:wrap;justify-content:flex-start;margin-top:12px">
          <div id="preview_alert_live_duration_row" style="min-width:210px;display:flex;flex-direction:column;gap:6px;width:100%">
            <div class="editor-choice-field" id="preview_page_alert_live_duration_seconds" role="radiogroup" aria-label="Alert Live Duration">
              <div class="field-label">Alert Live Duration</div>
              ${_e({name:"preview_page_alert_live_duration_seconds",options:ye(Fe),selectedValue:_i})}
            </div>
            <div class="field-helper">How long an alerted Preview or Wide View snapshot switches to live.</div>
          </div>
        </div>
      </div>
      <div class="section">
        <div class="layout-row timezone-row">
          <span class="field-label" style="margin:0">Timezone</span>
          <span class="timezone-readout" aria-label="Configured Home Assistant timezone">
            <ha-icon icon="mdi:map-clock-outline"></ha-icon>
            <span>${L(w)}</span>
          </span>
        </div>
        <div class="field-helper timezone-helper">Uses the timezone in your <a href="/profile/general" target="_blank" rel="noopener noreferrer">Home Assistant profile</a>.</div>
      </div>`,zi=`
      <div class="section">
        <span class="field-label">Theme</span>
        <div class="theme-row">
          <div class="theme-seg" id="theme-seg" role="radiogroup" aria-label="Theme">
            <button type="button" class="theme-opt ${Q==="default"?"active":""}" data-theme-option="default" role="radio" aria-checked="${Q==="default"?"true":"false"}">Home Assistant Theme</button>
            <button type="button" class="theme-opt ${Q==="custom"?"active":""}" data-theme-option="custom" role="radio" aria-checked="${Q==="custom"?"true":"false"}">Custom</button>
          </div>
        </div>
        <div id="theme-custom-panel" class="theme-custom-panel" ${Q==="custom"?"":"hidden"}>
          <div class="theme-custom-body">
            <div class="theme-custom-scope">
              <span class="theme-custom-scope-label">Apply this custom theme in</span>
              <div class="theme-scope-seg" role="radiogroup" aria-label="Custom theme modes">${Ai}</div>
            </div>
            ${Ei}
          </div>
        </div>
      </div>`,Oi=`
      <div class="section">
        <span class="field-label">Active Tabs</span>
        <div class="chk-row">
          ${$e("alerts","Alerts")}
          ${$e("clips","Clips")}
          ${$e("snapshot","Snapshots")}
          ${$e("recordings","Recordings")}
          ${$e("kept","Favorites")}
        </div>
      </div>
      <div class="section">
        <span class="field-label">Card Height Limit</span>
        <div class="card-height-control">
          <div class="card-height-slider-control">
            <input name="stream_height" id="stream_height" type="range" min="${ut}" max="${vt}" step="1" value="${Qt}">
            <div class="field-helper card-height-value" id="stream_height-output">${Qt}${ea}</div>
          </div>
          <div class="editor-choice-field editor-choice-field--compact" id="stream_height_unit" role="radiogroup" aria-label="Card height unit">
            ${ot({name:"stream_height_unit",options:[{value:"%",label:"%"},{value:"dvh",label:"dvh"}],selectedValue:ea,compact:!0})}
          </div>
        </div>
        <div class="field-helper">Card needs to be set to Auto Height for this to work properly.</div>
        <div class="field-helper" id="stream_height-helper"></div>
      </div>
      <div class="section">
        <div class="layout-row">
          <span class="field-label" style="margin:0">Tight Margins</span>
          <ha-switch id="tight_margins" ${this._config?.tight_margins?"checked":""}></ha-switch>
        </div>
        <div class="field-helper">Removes Home Assistant's default padding around the card in Sections views.</div>
      </div>
      <div class="section">
        <div class="layout-row">
          <span class="field-label" style="margin:0">Inside Shadows</span>
          <ha-switch id="shadows" ${this._config?.shadows!==!1?"checked":""}></ha-switch>
        </div>
        <div class="field-helper">Adds shadows to elements inside the card, including event items.</div>
      </div>
      <div class="section">
        <div class="layout-row">
          <span class="field-label" style="margin:0">Card Shadow</span>
          <ha-switch id="outer_shadows" ${this._config?.outer_shadows!==!1?"checked":""}></ha-switch>
        </div>
        <div class="field-helper">Adds a shadow around the card. Hidden automatically on phones in Preview, Wide View, and Mobile View.</div>
      </div>
      <div class="section">
        <div class="layout-row">
          <span class="field-label" style="margin:0">Event Item Borders</span>
          <ha-switch id="borders" ${this._config?.borders===!0?"checked":""}></ha-switch>
        </div>
        <div class="field-helper">Adds borders to event items. Useful when inside shadows are off.</div>
      </div>
      <div class="section">
        <div class="layout-row">
          <span class="field-label" style="margin:0">Rounded Corners</span>
          <ha-switch id="rounded_corners" ${this._config?.rounded_corners!==!1?"checked":""}></ha-switch>
        </div>
        <div class="field-helper">Rounds the card and media corners.</div>
      </div>
      <div class="section">
        <div class="layout-row">
          <span class="field-label" style="margin:0">Show ${ae} Logo</span>
          <ha-switch id="display_logo" ${this._config?.display_logo!==!1?"checked":""}></ha-switch>
        </div>
        <div class="field-helper">Shows ${ae} branding in page footers and the mobile Preview header when the HA navbar is at the bottom.</div>
      </div>
      <div class="section">
        <div class="layout-row">
          <span class="field-label" style="margin:0">Show Version Number</span>
          <ha-switch id="display_version" ${this._config?.display_version!==!1?"checked":""}></ha-switch>
        </div>
        <div class="field-helper">Shows the installed version in page footers. General Settings always shows it.</div>
      </div>`,$i=`
      <div class="section">
        <div class="layout-row" style="align-items:flex-start;gap:12px;flex-wrap:wrap;justify-content:flex-start">
          <div style="display:flex;flex-direction:column;gap:6px;max-width:420px">
            <div class="layout-row" style="justify-content:flex-start;gap:8px">
              <span class="field-label" style="margin:0">Enable Slideshow Mode</span>
              <ha-switch id="slideshow_rotation_enabled" ${this._config?.slideshow_rotation_enabled?"checked":""}></ha-switch>
            </div>
            <div class="field-helper">Makes Slideshow available. Start or stop it with the Slideshow button.</div>
          </div>
          <div id="slideshow_rotation_row" style="display:${this._config?.slideshow_rotation_enabled?"flex":"none"};flex:1 1 100%;width:100%;flex-direction:column;gap:6px">
            <div class="editor-choice-field editor-choice-field--single-row" id="slideshow_rotation_seconds" role="radiogroup" aria-label="Camera Rotation Interval">
              <div class="field-label">Camera Rotation Interval</div>
              ${_e({name:"slideshow_rotation_seconds",options:ye(Ie),selectedValue:vi})}
            </div>
            <div class="field-helper">Time between cameras during Slideshow.</div>
          </div>
        </div>
        <div class="layout-row" style="align-items:flex-start;gap:12px;flex-wrap:wrap;justify-content:flex-start;margin-top:12px">
          <div id="slideshow_alert_hold_row" style="min-width:210px;display:flex;flex-direction:column;gap:6px;width:100%">
            <div class="editor-choice-field" id="slideshow_alert_hold_seconds" role="radiogroup" aria-label="Alert Hold Duration">
              <div class="field-label">Alert Hold Duration</div>
              ${_e({name:"slideshow_alert_hold_seconds",options:ye(je),selectedValue:ui})}
            </div>
            <div class="field-helper">How long an alert-selected camera remains before rotation resumes.</div>
          </div>
        </div>
      </div>`,Hi=`
      <div class="section">
        <div class="layout-row">
          <span class="field-label" style="margin:0">Enable Preview Page</span>
          <ha-switch id="preview_page_enabled" ${this._config?.preview_page_enabled?"checked":""}></ha-switch>
        </div>
        <div class="field-helper">Adds Preview to navigation and landing-page options.</div>
      </div>
      <div class="section">
        <div class="layout-row">
          <span class="field-label" style="margin:0">Live Cameras on Desktop</span>
          <ha-switch id="preview_page_live_cameras" ${this._config?.preview_page_live_cameras?"checked":""}></ha-switch>
        </div>
        <div class="field-helper">Keeps all Preview cameras live on desktops. Otherwise, qualifying alerts and reviews switch snapshots to live.</div>
      </div>
      <div class="section">
        <div class="layout-row">
          <span class="field-label" style="margin:0">Live Cameras on Mobile</span>
          <ha-switch id="preview_page_live_cameras_mobile" ${this._config?.preview_page_live_cameras_mobile?"checked":""}></ha-switch>
        </div>
        <div class="field-helper">Keeps all Preview cameras live on phones and tablets. Otherwise, qualifying alerts and reviews switch snapshots to live.</div>
      </div>
      <div class="section">
        <div class="layout-row">
          <span class="field-label" style="margin:0">Show Title Bars</span>
          <ha-switch id="preview_page_show_title_bars" ${this._config?.preview_page_show_title_bars!==!1?"checked":""}></ha-switch>
        </div>
        <div class="field-helper">Shows each camera's name, source, alert count, and status.</div>
      </div>`,qi=V(this._config?.grid_alert_hold_seconds,We,Math.round(Me/1e3)),Ri=`
      <div class="section">
        <div class="layout-row">
          <span class="field-label" style="margin:0">Start with Alert Takeover</span>
          <ha-switch id="single_view_alert_takeover" ${this._config?.single_view_alert_takeover?"checked":""}></ha-switch>
        </div>
        <div class="field-helper">Sets whether alert takeover is on when Single View opens.</div>
      </div>
      <div class="section">
        <div class="editor-choice-field" role="radiogroup" aria-label="Single View Start Mode">
          <div class="field-label">Start Mode</div>
          ${bi}
        </div>
        <div class="field-helper">Sets the opening mode. Enable Grid or Slideshow before selecting it.</div>
      </div>`,Ni=`
      <div class="section">
        <div class="layout-row">
          <span class="field-label" style="margin:0">Enable Wide View Page</span>
          <ha-switch id="wide_view_page_enabled" ${this._config?.wide_view_page_enabled?"checked":""}></ha-switch>
        </div>
        <div class="field-helper">Adds Wide View to navigation and desktop/tablet landing-page options.</div>
      </div>
      <div id="wide-view-page-options" style="display:${this._config?.wide_view_page_enabled?"contents":"none"}">
        <div class="section">
          <div class="editor-choice-field" role="radiogroup" aria-label="Wide View Start Mode">
            <div class="field-label">Start Mode</div>
            ${fi}
          </div>
          <div class="field-helper">Sets the opening mode. Enable Grid or Slideshow before selecting it.</div>
        </div>
        <div class="section">
          <div class="layout-row">
            <span class="field-label" style="margin:0">Live Companion Cameras</span>
            <ha-switch id="wide_view_live_cameras" ${this._config?.wide_view_live_cameras?"checked":""}></ha-switch>
          </div>
          <div class="field-helper">Keeps all companion cameras live. Otherwise, qualifying alerts switch snapshots to live.</div>
        </div>
        <div class="section">
          <div class="layout-row">
            <span class="field-label" style="margin:0">Start with Alert Takeover</span>
            <ha-switch id="wide_view_alert_takeover" ${this._config?.wide_view_alert_takeover?"checked":""}></ha-switch>
          </div>
          <div class="field-helper">Sets whether alert takeover is on when Wide View opens.</div>
        </div>
      </div>
      <div class="section" id="wide-timeline-enabled-row" style="${this._config?.wide_view_page_enabled?"":"display:none"}">
        <div class="layout-row">
          <span class="field-label" style="margin:0">Enable Timeline Panel</span>
          <ha-switch id="wide_view_timeline_enabled" ${this._config?.wide_view_timeline_enabled?"checked":""}></ha-switch>
        </div>
        <div class="field-helper">Adds a collapsible timeline beside the event list. It follows the active camera, or all cameras in Grid mode.</div>
      </div>
      <div class="section timeline-dependent-section" id="wide-timeline-default-open-row" style="${this._config?.wide_view_page_enabled&&this._config?.wide_view_timeline_enabled?"":"display:none"}">
        <div class="layout-row">
          <span class="field-label" style="margin:0">Open Timeline by Default</span>
          <ha-switch id="wide_view_timeline_default_open" ${this._config?.wide_view_timeline_default_open?"checked":""}></ha-switch>
        </div>
        <div class="field-helper">Opens the Timeline with Wide View. Its drawer handle remains available when closed.</div>
      </div>
      <div class="section timeline-dependent-section" id="wide-timeline-default-scale-row" style="${this._config?.wide_view_page_enabled&&this._config?.wide_view_timeline_enabled?"":"display:none"}">
        <div class="editor-choice-field" id="wide_view_timeline_default_scale" role="radiogroup" aria-label="Initial Timeline Range">
          <div class="field-label">Initial Timeline Range</div>
          ${_e({name:"wide_view_timeline_default_scale",options:Ca.map(l=>({value:l,label:`${l} hour${l===1?"":"s"}`})),selectedValue:hi})}
        </div>
        <div class="field-helper">Sets the initial time range. Change it later from the Timeline header.</div>
      </div>
      <div class="section" id="col-width-row" style="${this._config?.wide_view_page_enabled?"":"display:none"}">
        <span class="field-label">Left Column Width</span>
        <input id="col_left_width_pct" type="range" min="${bt}" max="${ft}" step="1" value="${ta}" style="width:100%">
        <div class="field-helper">Sets the width of Wide View's left column.</div>
        <div class="field-helper" id="col_left_width_pct-output">${ta}%</div>
        <div class="field-helper" id="col_left_width_pct-helper"></div>
      </div>
      `,Ii=`
      <div class="section">
        <div class="layout-row">
          <span class="field-label" style="margin:0">Enable Mobile View Page</span>
          <ha-switch id="mobile_view_page_enabled" ${this._config?.mobile_view_page_enabled!==!1?"checked":""}></ha-switch>
        </div>
        <div class="field-helper">Adds Mobile View to navigation and landing-page options on all devices.</div>
      </div>
      <div class="section">
        <div class="layout-row">
          <span class="field-label" style="margin:0">Rotate to Fullscreen</span>
          <ha-switch id="mobile_view_rotate_to_fullscreen" ${this._config?.mobile_view_rotate_to_fullscreen===!0?"checked":""}></ha-switch>
        </div>
        <div class="field-helper">On phones, landscape rotation expands live and popup media to fullscreen. Disabled while editing or previewing the card.</div>
      </div>
      <div class="section">
        <div class="layout-row">
          <span class="field-label" style="margin:0">Mobile Battery Saver</span>
          <ha-switch id="mobile_poll_battery_saver" ${this._config?.mobile_poll_battery_saver?"checked":""}></ha-switch>
        </div>
        <div class="field-helper">Checks for new alerts and reviews every 60 seconds on mobile to reduce battery and data use.</div>
      </div>
      <div class="section">
        <div class="layout-row">
          <span class="field-label" style="margin:0">Move HA Navbar to Bottom</span>
          <ha-switch id="mobile_view_ha_navbar_bottom" ${this._config?.mobile_view_ha_navbar_bottom?"checked":""} ${i?"disabled":""}></ha-switch>
        </div>
        <div class="field-helper">Moves the Home Assistant dashboard navbar to the bottom on phones.</div>
        ${d?`<div class="field-helper navbar-owner-warning">${d}</div>`:""}
        ${c?`<div class="field-helper navbar-owner-info">${c}</div>`:""}
      </div>
      <div class="section ha-navbar-dependent-section" id="mobile-view-ha-navbar-stack-row" style="${this._config?.mobile_view_ha_navbar_bottom?"":"display:none"}">
        <div class="layout-row">
          <span class="field-label" style="margin:0">Stack Home Assistant Icon and Label</span>
          <ha-switch id="mobile_view_ha_navbar_stack_tabs" ${this._config?.mobile_view_ha_navbar_stack_tabs?"checked":""}></ha-switch>
        </div>
        <div class="field-helper">For tabs showing an icon and title, centers a smaller title below the icon. Other tab styles are unchanged.</div>
      </div>
      <div class="section ha-navbar-dependent-section" id="mobile-view-ha-navbar-dashboard-row" style="${this._config?.mobile_view_ha_navbar_bottom?"":"display:none"}">
        <div class="layout-row">
          <span class="field-label" style="margin:0">Whole Dashboard</span>
          <ha-switch id="mobile_view_ha_navbar_dashboard" ${a.requested?"checked":""}></ha-switch>
        </div>
        <div class="field-helper">Off: applies only on this card's Home Assistant page. On: applies across the dashboard and makes this card the owner.</div>
      </div>
      <div class="section" id="mobile-view-dashboard-background-row" style="${this._config?.mobile_view_page_enabled!==!1?"":"display:none"}">
        <div class="layout-row">
          <span class="field-label" style="margin:0">Apply background to entire dashboard page</span>
          <ha-switch id="mobile_view_dashboard_background" ${this._config?.mobile_view_dashboard_background!==!1?"checked":""}></ha-switch>
        </div>
        <div class="field-helper">Uses the Mobile View background color for the surrounding Home Assistant page on mobile devices.</div>
      </div>
      <div class="section" id="mobile-view-outer-border-row" style="${this._config?.mobile_view_page_enabled!==!1?"":"display:none"}">
        <div class="layout-row">
          <span class="field-label" style="margin:0">Mobile View Outer Border</span>
          <ha-switch id="mobile_view_outer_border" ${this._config?.mobile_view_outer_border?"checked":""}></ha-switch>
        </div>
        <div class="field-helper">Adds the theme-colored border around Mobile View on all devices.</div>
      </div>
      `,Bi=`
      <div class="section">
        <div class="layout-row">
          <span class="field-label" style="margin:0">Control Swipe Navigation</span>
          <ha-switch id="ha_dashboard_swipe_navigation_owner" ${h.requested?"checked":""} ${k?"disabled":""}></ha-switch>
        </div>
        <div class="field-helper">Only one ${ke} can control swipe navigation per dashboard.</div>
        ${H?`<div class="field-helper swipe-owner-warning">${H}</div>`:""}
      </div>
      <div class="section swipe-navigation-dependent-section" id="ha-dashboard-swipe-settings" style="${g?"":"display:none"}">
        <div class="editor-choice-field" id="ha_dashboard_swipe_navigation" role="radiogroup" aria-label="Swipe Navigation">
          <div class="field-label">Swipe Navigation</div>
          <div class="editor-choice-chips editor-choice-chips--detailed editor-swipe-choice-grid">${q}</div>
        </div>
        <div id="ha-dashboard-swipe-page-selection" class="dashboard-swipe-page-selection" style="${E?"":"display:none"}">
          <div class="editor-choice-field dashboard-swipe-device-group" role="group" aria-label="PC/Tablet Swipe Pages">
            <div class="field-label">PC/Tablet Swipe Pages</div>
            <div class="editor-choice-chips editor-choice-chips--checkbox dashboard-swipe-pages-grid">${M}</div>
          </div>
          <div class="field-helper dashboard-swipe-landing-note">Only enabled pages are shown. The PC/tablet landing page is always included.</div>
          <div class="editor-choice-field dashboard-swipe-device-group" role="group" aria-label="Phone Swipe Pages">
            <div class="field-label">Phone Swipe Pages</div>
            <div class="editor-choice-chips editor-choice-chips--checkbox dashboard-swipe-pages-grid">${G}</div>
          </div>
          <div class="field-helper dashboard-swipe-landing-note">Wide View is unavailable on phones. The phone landing page is always included.</div>
        </div>
        <div class="field-helper">On touch devices, edge swipes remain available for Home Assistant navigation.</div>
        <div class="layout-row swipe-mouse-navigation-row">
          <span class="field-label" style="margin:0">Mouse Swipe Navigation</span>
          <ha-switch id="ha_dashboard_swipe_mouse_enabled" ${this._config?.ha_dashboard_swipe_mouse_enabled?"checked":""}></ha-switch>
        </div>
        <div class="field-helper">Enables the same navigation with a primary-button mouse drag.</div>
      </div>
      `,ji=`
      <div class="section">
        <div class="layout-row">
          <span class="field-label" style="margin:0">Enable Card View Page</span>
          <ha-switch id="card_view_page_enabled" ${this._config?.card_view_page_enabled?"checked":""}></ha-switch>
        </div>
        <div class="field-helper">Adds a naturally sized live-camera page on any device. Card Height Limit does not apply.</div>
      </div>
      <div class="card-view-page-options" id="card-view-page-options" style="${this._config?.card_view_page_enabled?"":"display:none"}">
        <div class="section">
          <div class="editor-choice-field" role="radiogroup" aria-label="Card View Start Mode">
            <div class="field-label">Start Mode</div>
            ${wi}
          </div>
          <div class="field-helper">Sets the Video Only live mode. Enable Grid or Slideshow before selecting it.</div>
        </div>
        <div class="section">
          <div class="layout-row">
            <span class="field-label" style="margin:0">Standalone Card View</span>
            <ha-switch id="card_view_standalone" ${this._config?.card_view_standalone?"checked":""}></ha-switch>
          </div>
          <div class="field-helper">Makes Card View the only ${ae} page on all devices. Removes page links and the back button.</div>
        </div>
        <div class="section">
          <div class="layout-row">
            <span class="field-label" style="margin:0">Start with Alert Takeover</span>
            <ha-switch id="card_view_alert_takeover" ${this._config?.card_view_alert_takeover?"checked":""}></ha-switch>
          </div>
          <div class="field-helper">Sets whether alert takeover is on when Card View opens.</div>
        </div>
        <div class="section">
          <div class="editor-choice-field" role="radiogroup" aria-label="View Mode">
            <div class="field-label">View Mode</div>
            <div class="theme-scope-seg card-view-start-seg card-view-mode-seg">${yi}</div>
          </div>
          <div class="field-helper">Starts with video only, or with the activity panel open or closed.</div>
        </div>
        <div class="card-view-video-only-options" id="card-view-video-only-options" style="${aa===Y.videoOnly?"":"display:none"}">
          <div class="section">
            <div class="layout-row">
              <span class="field-label" style="margin:0">Enable Media Drawer</span>
              <ha-switch id="card_view_media_drawer_enabled" ${this._config?.card_view_media_drawer_enabled!==!1?"checked":""}></ha-switch>
            </div>
            <div class="field-helper">Shows a media drawer on the left in Video Only mode.</div>
          </div>
          <div class="section">
            <div class="layout-row">
              <span class="field-label" style="margin:0">Hide Camera Name</span>
              <ha-switch id="card_view_hide_camera_name" ${this._config?.card_view_hide_camera_name!==!1?"checked":""}></ha-switch>
            </div>
            <div class="field-helper">Hides the camera picker until the video is hovered or touched. Also applies in Grid mode.</div>
          </div>
        </div>
      </div>`,Wi=`
      <div class="section">
        <span class="field-label">Landing Page</span>
        <ha-selector id="landing_page" style="width:220px"></ha-selector>
        <div class="field-helper">Selects the starting page for desktops and tablets.</div>
        ${this._config?.card_view_standalone?'<div class="field-helper standalone-landing-note">Unavailable while Card View is standalone because all devices start in Card View.</div>':""}
      </div>
      <div class="section">
        <span class="field-label">Phone Landing Page</span>
        <ha-selector id="mobile_page" style="width:220px" ${this._config?.card_view_standalone?"disabled":""}></ha-selector>
        <div class="field-helper">Sets the phone landing flow. Preview combinations open Preview first, then the selected camera in the paired view. Required pages must be enabled.</div>
        ${this._config?.card_view_standalone?'<div class="field-helper standalone-landing-note">Unavailable while Card View is standalone because all devices start in Card View.</div>':""}
      </div>`,Fi=`
      <div class="section">
        <div class="layout-row" style="align-items:flex-start;gap:12px;flex-wrap:wrap;justify-content:flex-start">
          <div style="display:flex;flex-direction:column;gap:6px;max-width:420px">
            <div class="layout-row" style="justify-content:flex-start;gap:8px">
              <span class="field-label" style="margin:0">Enable Grid Mode</span>
              <ha-switch id="grid_mode_enabled" ${this._config?.grid_mode_enabled?"checked":""}></ha-switch>
            </div>
            <div class="field-helper">Adds a 2\xD72 grid for at least two cameras. Unavailable on mobile devices.</div>
          </div>
          <div id="grid_order_row" class="grid-order-config" style="display:${this._config?.grid_mode_enabled?"flex":"none"}">
            <span class="field-label" style="margin:0">Grid Order</span>
            <div class="theme-seg" role="radiogroup" aria-label="Grid order">
              <button type="button" class="theme-opt ${P.mode===B.default?"active":""}" data-grid-order-mode="default" role="radio" aria-checked="${P.mode===B.default?"true":"false"}">Default</button>
              <button type="button" class="theme-opt ${P.mode===B.custom?"active":""}" data-grid-order-mode="custom" role="radio" aria-checked="${P.mode===B.custom?"true":"false"}">Custom</button>
            </div>
            <div class="field-helper">Default follows Camera Settings. Custom reorders or excludes cameras only in Grid mode.</div>
            ${Pi}
          </div>
          <div id="grid_live_row" style="min-width:210px;display:${this._config?.grid_mode_enabled?"flex":"none"};flex-direction:column;gap:6px">
            <div class="layout-row" style="justify-content:flex-start;gap:8px">
              <span class="field-label" style="margin:0">Live View in Grid</span>
              <ha-switch id="grid_live_view_enabled" ${this._config?.grid_live_view_enabled!==!1?"checked":""}></ha-switch>
            </div>
            <div class="field-helper">Keeps all visible cameras live. Otherwise, alerts temporarily switch snapshots to live.</div>
          </div>
          <div id="grid_rotation_row" style="display:${this._config?.grid_mode_enabled&&j>4?"flex":"none"};flex:1 1 100%;width:100%;flex-direction:column;gap:6px">
            <div class="editor-choice-field editor-choice-field--single-row" id="grid_rotation_seconds" role="radiogroup" aria-label="Grid Rotation Interval">
              <div class="field-label">Grid Rotation Interval</div>
              ${_e({name:"grid_rotation_seconds",options:ye(Be),selectedValue:gi})}
            </div>
            <div class="field-helper">Time between camera sets when more than four cameras are included.</div>
          </div>
        </div>
        <div class="layout-row" style="align-items:flex-start;gap:12px;flex-wrap:wrap;justify-content:flex-start;margin-top:12px">
          <div id="grid_alert_hold_row" style="min-width:210px;display:flex;flex-direction:column;gap:6px;width:100%">
            <div class="editor-choice-field editor-choice-field--single-row" id="grid_alert_hold_seconds" role="radiogroup" aria-label="Grid Alert Hold Duration">
              <div class="field-label">Grid Alert Hold Duration</div>
              ${_e({name:"grid_alert_hold_seconds",options:ye(We),selectedValue:qi})}
            </div>
            <div class="field-helper">How long an alerted tile stays highlighted and, when needed, live.</div>
          </div>
        </div>
      </div>`,W=this._activeSettingsPanelId??null,Gi=`
      <div class="settings-container">
        ${this._renderSettingsPanel({id:"camera",title:"Camera Settings",icon:"mdi:camera",content:Di,active:W==="camera"})}
        ${this._renderSettingsPanel({id:"general",title:"General Settings",icon:"mdi:cog",content:Vi,active:W==="general"})}
        ${this._renderSettingsPanel({id:"theme",title:"Theme Settings",icon:"mdi:palette",content:zi,active:W==="theme"})}
        ${this._renderSettingsPanel({id:"layout",title:"Layout Settings",icon:"mdi:angle-right",content:Oi,active:W==="layout"})}
        ${this._renderSettingsPanel({id:"slideshow",title:"Slideshow Settings",icon:"mdi:presentation-play",content:$i,active:W==="slideshow"})}
        ${this._renderSettingsPanel({id:"gridview",title:"Grid Mode Settings",icon:"mdi:view-grid-outline",content:Fi,active:W==="gridview"})}
        ${this._renderSettingsPanel({id:"preview",title:"Preview Page",icon:"mdi:view-grid",content:Hi,active:W==="preview"})}
        ${this._renderSettingsPanel({id:"singleview",title:"Single View Page",icon:F.singleView,content:Ri,active:W==="singleview"})}
        ${this._renderSettingsPanel({id:"wideview",title:"Wide View Page",icon:"mdi:view-split-vertical",content:Ni,active:W==="wideview"})}
        ${this._renderSettingsPanel({id:"cardview",title:"Card View Page",icon:F.cardView,content:ji,active:W==="cardview"})}
        ${this._renderSettingsPanel({id:"mobileview",title:"Mobile View Page",icon:"mdi:cellphone",content:Ii,active:W==="mobileview"})}
        ${this._renderSettingsPanel({id:"swipenavigation",title:"Swipe Navigation",icon:"mdi:gesture-swipe-horizontal",content:Bi,active:W==="swipenavigation"})}
        ${this._renderSettingsPanel({id:"landing",title:"Landing Page",icon:"mdi:home-import-outline",content:Wi,active:W==="landing"})}
      </div>`,Ui=`<div id="config-save-reminder" class="config-save-reminder" role="status" aria-live="polite" aria-atomic="true" data-config-save-state="${this._hasConfigDraft===!0?"dirty":"clean"}">
      <span class="config-save-reminder-icon" aria-hidden="true">${F.packageCheck}</span>
      <span data-config-save-reminder-text>${this._hasConfigDraft===!0?"Unsaved changes \u2014 use Home Assistant's Save button to apply them.":"No pending changes."}</span>
    </div>`;this.innerHTML=`<style>
          :host{
                --editor-primary-bg: var(--card-background-color);
                --editor-secondary-bg: var(--secondary-background-color);
                --editor-card-bg: var(--card-background-color);
                --editor-text: var(--primary-text-color);
                --editor-muted: var(--secondary-text-color);
                --editor-primary: var(--primary-color);
                --editor-primary-d: var(--dark-primary-color);
                --editor-primary-l: var(--light-primary-color);
                --editor-border: var(--divider-color);
                --editor-border-width: var(--ha-card-border-width);
                --editor-shadow: var(--ha-card-box-shadow);
                --editor-icon: var(--icon-color, var(--secondary-text-color));
              --c-bg-main: var(--editor-primary-bg);
              --c-bg-mobile:var(--ha-color-fill-neutral-normal-resting,var(--wa-color-neutral-fill-normal,var(--secondary-background-color)));
              --c-text: var(--editor-text);
              --c-text2: var(--editor-muted);
              --c-text-rev: var(--text-primary-color);
              --c-border: var(--editor-border);
              --c-border2: var(--state-inactive-color);
              --c-primary: var(--editor-primary);
              --c-accent: var(--accent-color, var(--editor-primary));
              --c-alert: var(--error-color);
            }
            input[type="range"],input[type="checkbox"]{accent-color:var(--c-primary, var(--editor-primary));}
            ha-switch{
              --primary-color:var(--c-primary, var(--editor-primary));
              --accent-color:var(--c-primary, var(--editor-primary));
              --state-active-color:var(--c-primary, var(--editor-primary));
              --state-on-color:var(--c-primary, var(--editor-primary));
              --switch-checked-color:var(--c-primary, var(--editor-primary));
              --switch-checked-button-color:var(--c-primary, var(--editor-primary));
              --switch-checked-track-color:var(--c-primary-l, var(--editor-primary-l));
              --mdc-theme-secondary:var(--c-primary, var(--editor-primary));
              --ha-color-fill-primary-loud-resting:var(--c-primary, var(--editor-primary));
              --ha-color-fill-primary-loud-hover:var(--c-primary, var(--editor-primary));
              --ha-color-fill-primary-normal-resting:var(--c-primary-l, var(--editor-primary-l));
              --ha-color-fill-primary-normal-hover:var(--c-primary-l, var(--editor-primary-l));
              --wa-color-brand-fill-loud:var(--c-primary, var(--editor-primary));
              --wa-color-brand-fill-normal:var(--c-primary-l, var(--editor-primary-l));
            }
            .ed-wrap{
                display:flex;
                flex-direction:column;
                gap:16px;
                padding:8px 0;
                background:transparent;
                color:var(--editor-text);
                font-family: var(--ha-font-family, inherit);
                font-size: var(--ha-font-size, 14px);
            }
            .settings-container{display:flex;flex-direction:column;gap:6px;}
            .config-save-reminder{position:sticky;top:8px;z-index:20;box-sizing:border-box;width:100%;min-height:30px;display:flex;align-items:center;justify-content:center;gap:6px;padding:5px 10px;border:1px solid color-mix(in srgb,var(--success-color,#2e7d32) 55%,transparent);border-radius:10px;background:color-mix(in srgb,var(--success-color,#2e7d32) 14%,transparent);-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px);color:var(--success-color,#2e7d32);font-size:12px;font-weight:600;line-height:1.2;text-align:center;pointer-events:none;}
            .config-save-reminder[data-config-save-state="dirty"]{border-color:color-mix(in srgb,var(--warning-color, var(--c-accent, var(--editor-primary))) 55%,transparent);background:color-mix(in srgb,var(--warning-color, var(--c-accent, var(--editor-primary))) 16%,transparent);color:var(--warning-color, var(--c-accent, var(--editor-primary)));}
            .standalone-landing-note{box-sizing:border-box;width:100%;margin-top:8px;padding:7px 10px;border:1px solid color-mix(in srgb,var(--c-primary, var(--editor-primary)) 42%,transparent);border-radius:10px;background:color-mix(in srgb,var(--c-primary-l, var(--editor-primary-l)) 42%,var(--editor-card-bg));color:var(--c-primary-d, var(--editor-text));font-weight:650;line-height:1.3;}
            .config-save-reminder-icon{display:inline-flex;width:17px;height:17px;flex:0 0 17px;}
            .config-save-reminder-icon svg{display:block;width:100%;height:100%;}
            .environment-version-summary{margin:12px 0;}
            .card-version-status{box-sizing:border-box;width:100%;display:flex;align-items:center;gap:9px;margin:0;padding:9px 11px;border-radius:10px;background:var(--c-primary-l, var(--editor-primary-l));color:var(--c-primary-d, var(--editor-text));font-size:12px;line-height:1.3;cursor:default;}
            .environment-item-icon{display:inline-flex;width:14px;height:14px;flex:0 0 14px;align-items:center;justify-content:center;}
            .environment-item-icon svg{display:block;width:100%;height:100%;}
            .card-version-icon{width:20px;height:20px;flex-basis:20px;align-self:flex-start;}
            .card-version-copy{display:flex;min-width:0;flex:1 1 auto;flex-direction:column;gap:1px;}
            .card-version-update-link{appearance:none;flex:0 0 auto;padding:2px 0;border:0;background:transparent;color:inherit;font:inherit;font-weight:700;text-decoration:underline;text-underline-offset:2px;cursor:pointer;}
            .card-version-update-link[hidden]{display:none;}
            .card-version-update-link:focus-visible{outline:2px solid currentColor;outline-offset:3px;border-radius:2px;}
            .environment-support-items{display:flex;flex-wrap:wrap;gap:4px 10px;margin-top:4px;}
            .environment-support-item{display:inline-flex;min-width:0;align-items:center;gap:4px;color:color-mix(in srgb,currentColor 76%,transparent);font-size:10px;font-weight:600;line-height:1.25;}
            .environment-support-item[data-support-status="warning"],.environment-support-item[data-support-status="error"]{padding:2px 6px;border:1px solid;border-radius:999px;}
            .environment-support-item[data-support-status="warning"]{border-color:color-mix(in srgb,var(--warning-color, #f59e0b) 58%,transparent);background:color-mix(in srgb,var(--warning-color, #f59e0b) 17%,transparent);color:color-mix(in srgb,var(--warning-color, #b86b00) 75%,var(--primary-text-color, #111));}
            .environment-support-item[data-support-status="error"]{border-color:color-mix(in srgb,var(--error-color, var(--c-alert, #d32f2f)) 65%,transparent);background:color-mix(in srgb,var(--error-color, var(--c-alert, #d32f2f)) 15%,transparent);color:var(--error-color, var(--c-alert, #b71c1c));}
            .environment-support-item[hidden]{display:none;}
            .settings-panel{
                border:1px solid var(--c-border2, var(--editor-border));
                border-radius:16px;
                background:var(--editor-card-bg, var(--editor-card-bg));
                color:var(--c-text, var(--editor-text));
                overflow:hidden;
              }
              .setting-title{
                width:100%;
                box-sizing:border-box;
                border:0;
                border-bottom:1px solid transparent;
                background:transparent;
                color:inherit;
                display:flex;
                align-items:center;
                gap:10px;
                padding:12px 14px;
                text-align:left;
                font-family:inherit;
                font-size:14px;
                font-weight:700;
                line-height:1.2;
                cursor:pointer;
                transition:background-color .16s ease,color .16s ease;
              }
              .setting-title h3{margin:0;font:inherit;line-height:inherit;color:inherit;}
              .setting-title ha-icon,.setting-title-icon{color:var(--c-text2, var(--editor-muted));}
              .setting-title-icon{display:inline-flex;width:24px;height:24px;align-items:center;justify-content:center;}
              .setting-title-icon svg{width:24px;height:24px;}
              .setting-title:hover,.settings-panel.active .setting-title{background:var(--c-bg-mobile);border-bottom-color:var(--c-border2, var(--editor-border));}
              .settings-panel.active .setting-title{color:var(--c-accent, var(--editor-primary));}
              .settings-panel.active .setting-title :is(ha-icon,.setting-title-icon){color:var(--c-accent, var(--editor-primary));}
              .setting-content{
                position:relative;
                max-height:0;
                opacity:0;
                overflow:hidden;
                padding:0 14px;
                transition:max-height .28s ease, opacity .2s ease, padding .2s ease;
              }
              .settings-panel.active .setting-content{
                max-height:none;
                opacity:1;
                padding:0 14px 14px;
              }
              .settings-more-slot{position:absolute;top:8px;right:14px;left:14px;z-index:3;display:flex;justify-content:center;height:0;pointer-events:none;}
              .settings-more-chip{appearance:none;-webkit-appearance:none;display:inline-flex;align-items:center;justify-content:center;gap:4px;min-width:72px;min-height:36px;padding:6px 12px;border:1px solid color-mix(in srgb,var(--c-border2, var(--editor-border)) 82%,transparent);border-radius:999px;background:color-mix(in srgb,var(--c-bg-main, var(--editor-card-bg)) 82%,transparent);box-shadow:0 4px 14px rgba(0,0,0,.22);-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px);color:var(--c-text, var(--editor-text));font:inherit;font-size:11px;font-weight:750;line-height:1;cursor:pointer;pointer-events:auto;transition:background-color .16s ease,border-color .16s ease,color .16s ease,box-shadow .16s ease,transform .1s ease;}
              .settings-more-chip[hidden]{display:none;}
              .settings-more-chip svg{width:17px;height:17px;fill:currentColor;}
              .settings-more-chip:focus-visible{border-color:var(--c-primary, var(--editor-primary));background:var(--c-primary-l, var(--editor-primary-l));color:var(--c-primary-d, var(--editor-primary-d));outline:none;box-shadow:0 5px 17px rgba(0,0,0,.28);}
              .settings-more-chip:active{transform:scale(.96);}
              @media (hover:hover) and (pointer:fine){.settings-more-chip:hover{border-color:var(--c-primary, var(--editor-primary));background:var(--c-primary-l, var(--editor-primary-l));color:var(--c-primary-d, var(--editor-primary-d));box-shadow:0 5px 17px rgba(0,0,0,.28);}}
              .field-label{font-size:12px;font-weight:600;margin-bottom:8px;display:block;color:var(--c-text, var(--editor-text));}
            .field-helper{min-height:1.2em;margin:4px 0px;font-size:11px;color:var(--c-text2, var(--editor-muted));}
            .field-helper.error{color:var(--c-alert);}
            .section{border-top:1px solid var(--c-border2, var(--editor-border));padding-top:16px;}
            .setting-content > .section:first-child{border-top:none;}
            .timeline-dependent-section,
            .ha-navbar-dependent-section{margin-inline-start:14px;padding-inline-start:12px;border-inline-start:2px solid var(--c-primary, var(--editor-primary));}
            .editor-choice-field{display:block;min-width:0;margin:0;padding:0;border:0;}
            .editor-choice-field--fit{flex:1 1 420px;max-width:560px;}
            .editor-choice-field .field-label{margin:0 0 8px;}
            .editor-choice-chips{display:grid;grid-template-columns:repeat(auto-fit,minmax(88px,1fr));gap:8px;width:100%;min-width:0;}
            .editor-choice-field--single-row .editor-choice-chips{grid-template-columns:repeat(4,minmax(0,1fr));}
            .editor-choice-chips--compact{display:flex;width:auto;gap:6px;}
            .editor-choice-chips--detailed{grid-template-columns:repeat(auto-fit,minmax(160px,1fr));}
            .dashboard-swipe-page-selection{margin-top:16px;padding-top:14px;border-top:1px solid var(--c-border2, var(--editor-border));}
            .dashboard-swipe-device-group + .dashboard-swipe-device-group{margin-top:12px;}
            .dashboard-swipe-pages-grid{grid-template-columns:repeat(auto-fit,minmax(88px,1fr));align-items:stretch;gap:6px;}
            .dashboard-swipe-pages-grid > .editor-choice-chip{display:flex;}
            .dashboard-swipe-pages-grid .editor-choice-chip-body{flex:1 1 auto;min-height:40px;padding:6px;gap:5px;font-size:11px;line-height:1.15;}
            .dashboard-swipe-pages-grid .editor-choice-chip-indicator{width:15px;height:15px;}
            .dashboard-swipe-landing-note{font-weight:600;color:var(--c-primary-d, var(--editor-primary-d));}
            .editor-swipe-choice-grid{align-items:stretch;}
            .editor-swipe-choice{position:relative;min-width:0;}
            .editor-swipe-choice > .editor-choice-chip{height:100%;}
            .editor-swipe-choice > .editor-choice-chip .editor-choice-chip-body{height:100%;}
            .editor-swipe-choice:has(.editor-swipe-choice-footer) .editor-choice-chip-body{padding-bottom:42px;}
            .editor-swipe-choice-footer{position:absolute;z-index:1;right:9px;bottom:7px;left:36px;display:flex;align-items:center;justify-content:flex-end;gap:7px;color:var(--c-text2, var(--editor-muted));font-size:10px;font-weight:600;line-height:1.15;text-align:right;cursor:pointer;}
            .editor-swipe-choice-footer ha-switch{flex:0 0 auto;}
            .editor-swipe-choice-footer:has(ha-switch[disabled]){opacity:.55;cursor:not-allowed;}
            .swipe-navigation-dependent-section{margin-inline-start:14px;padding-inline-start:12px;border-inline-start:2px solid var(--c-primary, var(--editor-primary));}
            .swipe-owner-warning,.navbar-owner-warning{padding:8px 10px;border:1px solid color-mix(in srgb,var(--warning-color, #f59e0b) 70%,transparent);border-radius:8px;background:color-mix(in srgb,var(--warning-color, #f59e0b) 12%,transparent);color:color-mix(in srgb,var(--warning-color, #b86b00) 75%,var(--primary-text-color, #111));line-height:1.35;}
            .swipe-owner-warning strong,.navbar-owner-warning strong{display:inline-block;padding:1px 5px;border-radius:5px;background:color-mix(in srgb,var(--warning-color, #f59e0b) 20%,transparent);color:inherit;font-weight:800;}
            .navbar-owner-info{padding:8px 10px;border:1px solid var(--success-color, #2e7d32);border-radius:8px;background:color-mix(in srgb,var(--success-color, #2e7d32) 9%,transparent);color:var(--success-color, #2e7d32);line-height:1.35;}
            .navbar-owner-info strong{display:inline-block;padding:1px 5px;border-radius:5px;background:color-mix(in srgb,var(--success-color, #2e7d32) 16%,transparent);color:inherit;font-weight:800;}
            .editor-choice-chip{position:relative;display:block;min-width:0;cursor:pointer;}
            .editor-choice-chip-input{position:absolute;inline-size:1px;block-size:1px;margin:0;opacity:0;pointer-events:none;}
            .editor-choice-chip-body{display:flex;align-items:center;gap:8px;min-height:40px;box-sizing:border-box;padding:8px 11px;border:1px solid var(--c-border2, var(--editor-border));border-radius:10px;background:var(--c-bg-main, var(--editor-card-bg));color:var(--c-text, var(--editor-text));font-size:12px;font-weight:600;line-height:1.25;transition:background-color .16s ease,border-color .16s ease,color .16s ease,box-shadow .16s ease,transform .1s ease;}
            .editor-choice-chips--detailed .editor-choice-chip-body{align-items:flex-start;min-height:104px;}
            .editor-choice-chip-copy{display:flex;min-width:0;flex-direction:column;gap:5px;}
            .editor-choice-chip-description{color:var(--c-text2, var(--editor-muted));font-size:11px;font-weight:400;line-height:1.35;}
            .editor-choice-chip-input:checked + .editor-choice-chip-body .editor-choice-chip-description{color:inherit;opacity:.8;}
            .editor-choice-chip-indicator{position:relative;flex:0 0 auto;width:17px;height:17px;box-sizing:border-box;border:2px solid var(--c-text2, var(--editor-muted));border-radius:50%;background:var(--c-bg-main, var(--editor-card-bg));transition:border-color .16s ease,background-color .16s ease;}
            .editor-choice-chip-indicator::after{content:"";position:absolute;inset:3px;border-radius:50%;background:var(--c-text-rev, #fff);transform:scale(0);transition:transform .14s ease;}
            .editor-choice-chip-input:not(:disabled) + .editor-choice-chip-body:hover{border-color:var(--c-primary, var(--editor-primary));background:var(--c-primary-l, var(--editor-primary-l));box-shadow:0 2px 7px rgba(0,0,0,.12);}
            .editor-choice-chip-input:not(:disabled) + .editor-choice-chip-body:active{transform:scale(.985);}
            .editor-choice-chip-input:focus-visible + .editor-choice-chip-body{outline:2px solid var(--c-primary, var(--editor-primary));outline-offset:2px;}
            .editor-choice-chip-input:checked + .editor-choice-chip-body{border-color:var(--c-primary, var(--editor-primary));background:var(--c-primary-l, var(--editor-primary-l));color:var(--c-primary-d, var(--editor-primary-d));box-shadow:inset 0 0 0 1px var(--c-primary, var(--editor-primary));}
            .editor-choice-chip-input:checked:not(:disabled) + .editor-choice-chip-body:hover{box-shadow:inset 0 0 0 1px var(--c-primary, var(--editor-primary)),0 2px 7px rgba(0,0,0,.16);}
            .editor-choice-chip-input:checked + .editor-choice-chip-body .editor-choice-chip-indicator{border-color:var(--c-primary, var(--editor-primary));background:var(--c-primary, var(--editor-primary));}
            .editor-choice-chip-input:checked + .editor-choice-chip-body .editor-choice-chip-indicator::after{transform:scale(1);}
            .editor-choice-chips--checkbox .editor-choice-chip-indicator{border-radius:4px;}
            .editor-choice-chips--checkbox .editor-choice-chip-indicator::after{inset:2px 5px 4px;border:solid var(--c-text-rev, #fff);border-width:0 2px 2px 0;border-radius:0;background:transparent;transform:rotate(45deg) scale(0);}
            .editor-choice-chips--checkbox .editor-choice-chip-input:checked + .editor-choice-chip-body .editor-choice-chip-indicator::after{transform:rotate(45deg) scale(1);}
            .editor-choice-chip-input:disabled + .editor-choice-chip-body{opacity:.5;cursor:not-allowed;background:var(--c-bg-mobile, var(--editor-secondary-bg));}
            .editor-choice-chip-input[data-dashboard-swipe-landing="true"]:checked:disabled + .editor-choice-chip-body{opacity:1;border-color:var(--c-primary, var(--editor-primary));background:var(--c-primary-l, var(--editor-primary-l));color:var(--c-primary-d, var(--editor-primary-d));box-shadow:inset 0 0 0 1px var(--c-primary, var(--editor-primary));}
            .editor-choice-field--compact{flex:0 0 auto;}
            .editor-choice-field--compact .editor-choice-chip-body{min-height:36px;padding:6px 9px;}
            .editor-choice-field--compact .editor-choice-chip-indicator{width:15px;height:15px;}
            .card-height-control{display:flex;gap:8px;align-items:flex-start;min-width:0;}
            .card-height-slider-control{display:flex;flex:1 1 auto;min-width:120px;flex-direction:column;}
            .card-height-slider-control > #stream_height{width:100%;margin-top:7px;}
            .card-height-value{align-self:flex-start;margin-top:0;}
            .chk-row{display:flex;flex-wrap:wrap;gap:8px 16px;}
            .text-display-row{display:flex;align-items:center;gap:12px;min-width:0;}
            .text-display-row + .text-display-row{margin-top:8px;}
            .text-display-token-helper{margin:5px 0 12px;}
            .text-display-row ha-input{flex:1 1 auto;min-width:0;}
            .text-display-checkbox{display:inline-flex;align-items:center;gap:5px;flex:0 0 auto;cursor:pointer;color:var(--c-text, var(--editor-text));font-size:12px;font-weight:600;}
            .text-display-checkbox input{margin:0;}

            .cam-wrap{display:flex;flex-direction:column;gap:8px;}
            .cam-row{
              position:relative;
              display:grid;
              grid-template-columns:auto minmax(0,1fr) auto auto;
              gap:8px;
              align-items:center;
              border:1px solid var(--c-border2, var(--editor-border));
              border-inline-start:4px solid var(--c-primary, var(--editor-primary));
              border-radius:10px;
              padding:8px 10px;
              background:var(--c-bg-mobile, var(--editor-secondary-bg));
              box-shadow:var(--editor-shadow);
              transition:background-color .16s ease,border-color .16s ease,box-shadow .16s ease,opacity .16s ease,transform .16s ease;
            }
            .grid-order-row,.grid-order-excluded-row{
              position:relative;
              display:grid;
              grid-template-columns:auto minmax(0,1fr) auto auto;
              gap:6px;
              align-items:center;
              border:1px solid var(--c-border2, var(--editor-border));
              border-inline-start:4px solid var(--c-primary, var(--editor-primary));
              border-radius:10px;
              padding:4px 7px;
              background:var(--c-bg-mobile, var(--editor-secondary-bg));
              box-shadow:var(--editor-shadow);
              transition:background-color .16s ease,border-color .16s ease,box-shadow .16s ease,opacity .16s ease,transform .16s ease;
            }
            .cam-row:hover,.cam-row:focus-within,.grid-order-row:hover,.grid-order-row:focus-within,.grid-order-excluded-row:hover,.grid-order-excluded-row:focus-within{background:var(--c-bg-main, var(--editor-card-bg));border-color:var(--c-primary, var(--editor-primary));}
            .cam-row.dragging,.grid-order-row.dragging{opacity:.5;transform:scale(.985);box-shadow:none;}
            .cam-row.drop-target{background:var(--c-bg-main, var(--editor-card-bg));border-color:var(--c-primary, var(--editor-primary));box-shadow:0 0 0 2px var(--c-primary, var(--editor-primary));}
            .grid-order-row.drop-target{background:var(--c-bg-main, var(--editor-card-bg));border-color:var(--c-primary, var(--editor-primary));box-shadow:0 0 0 2px var(--c-primary, var(--editor-primary));}
            :is(.cam-row,.grid-order-row).drop-target-before::before,
            :is(.cam-row,.grid-order-row).drop-target-after::after{content:"";position:absolute;z-index:3;left:4px;right:4px;height:4px;border-radius:999px;background:var(--c-primary, var(--editor-primary));box-shadow:0 0 0 2px var(--c-bg-main, var(--editor-card-bg));pointer-events:none;}
            :is(.cam-row,.grid-order-row).drop-target-before::before{top:-6px;}
            :is(.cam-row,.grid-order-row).drop-target-after::after{bottom:-6px;}
            .cam-drag{border:1px solid var(--c-border2, var(--editor-border));background:var(--c-bg-main, var(--editor-card-bg));color:var(--editor-icon);cursor:grab;line-height:1;display:grid;place-items:center;width:28px;height:28px;border-radius:8px;}
            .cam-drag:hover,.cam-drag:active{background:var(--c-primary, var(--editor-primary));border-color:var(--c-primary, var(--editor-primary));color:var(--c-text-rev, var(--editor-card-bg));}
            .cam-drag ha-icon{--mdc-icon-size:18px;}
            .cam-name{font-size:15px;color:var(--editor-text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
            .cam-meta{font-size:11px;color:var(--editor-muted);margin-top:2px;}
            .cam-action{width:32px;height:32px;border:none;background:transparent;color:var(--editor-icon);display:grid;place-items:center;cursor:pointer;border-radius:8px;}
            .cam-action:hover{background:var(--editor-secondary-bg);color:var(--editor-text);}
            .cam-action svg{width:18px;height:18px;display:block;fill:currentColor;}
            .cam-toolbar{display:flex;align-items:center;gap:8px;}
            .cam-add{border:var(--editor-border-width) solid var(--editor-border);border-radius:999px;padding:8px 16px;background:var(--editor-card-bg);color:var(--editor-primary);font-weight:600;cursor:pointer;}
            .cam-add:hover{border-color:var(--editor-primary);}
            .cam-add[disabled]{opacity:.5;cursor:not-allowed;}
            .cam-helper{font-size:11px;color:var(--c-text2, var(--editor-muted));}
            .grid-order-config{flex:1 1 100%;width:100%;min-width:0;box-sizing:border-box;display:flex;flex-direction:column;gap:7px;}
            .grid-order-custom{margin-top:2px;margin-bottom:0;}
            .grid-order-sections,.grid-order-excluded{display:flex;flex-direction:column;gap:8px;}
            .grid-order-excluded{margin-top:12px;padding-top:10px;border-top:1px solid var(--c-border2, var(--editor-border));}
            .grid-order-excluded[hidden]{display:none;}
            .grid-order-heading{font-size:12px;font-weight:700;color:var(--c-text2, var(--editor-muted));letter-spacing:.02em;padding:2px 2px 0;}
            .grid-order-row{grid-template-columns:auto minmax(0,1fr) auto;}
            .grid-order-row .cam-drag{width:26px;height:26px;border-radius:7px;}
            .grid-order-row .cam-drag ha-icon{--mdc-icon-size:16px;}
            .grid-order-excluded-row{grid-template-columns:minmax(0,1fr) auto;}
            .grid-order-excluded-row .grid-order-camera-copy{opacity:.58;}
            .grid-order-excluded-row:hover .grid-order-camera-copy,.grid-order-excluded-row:focus-within .grid-order-camera-copy{opacity:.76;}
            .grid-order-camera-copy{min-width:0;}
            .grid-order-action{width:38px;min-width:38px;height:34px;padding:2px;border:0;border-radius:8px;background:transparent;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:0;font:inherit;font-size:9px;font-weight:700;line-height:1;cursor:pointer;box-shadow:none;}
            .grid-order-action svg{width:17px;height:17px;display:block;flex:0 0 auto;}
            .grid-order-action--exclude{color:var(--c-accent);}
            .grid-order-action--include{color:var(--c-on);}
            .grid-order-action:hover,.grid-order-action:focus-visible{background:var(--c-bg-main, var(--editor-card-bg));outline:none;box-shadow:0 0 0 1px currentColor inset;}

            .theme-row{display:flex;align-items:center;}
            .theme-seg{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;width:100%;}
            .theme-opt{
              appearance:none;
              border:var(--editor-border-width) solid var(--c-border2);
              background:var(--editor-card-bg);
              color:var(--c-text);
              border-radius:10px;
              padding:8px 10px;
              cursor:pointer;
              font-weight:600;
              line-height:1.4;
              transition:background .16s ease,border-color .16s ease,color .16s ease,box-shadow .16s ease;
            }
            .theme-opt:hover{background:var(--c-bg-main);border-color:var(--c-primary);}
            .theme-opt:active{transform:translateY(1px);}
            .theme-opt:focus-visible{outline:none;box-shadow:0 0 0 2px var(--c-primary-l, var(--c-primary));}
            .theme-opt.active{background:var(--c-primary);border-color:var(--c-primary);color:var(--c-text-rev);}
            .theme-custom-panel{margin-top:10px;border:var(--editor-border-width) solid var(--editor-border);border-radius:10px;background:var(--editor-card-bg);}
            .theme-custom-panel[hidden]{display:none;}
            .theme-custom-body{padding:10px 12px;}
            .theme-custom-scope{display:flex;flex-direction:column;gap:7px;padding:2px 0 12px;}
            .theme-custom-scope-label{font-size:12px;font-weight:600;color:var(--c-text2, var(--editor-muted));text-align:center;}
            .theme-scope-seg{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:3px;width:min(100%,390px);margin:0 auto;padding:5px;box-sizing:border-box;border-radius:999px;background:var(--c-bg-main, var(--editor-secondary-bg));box-shadow:inset 0 0 0 1px var(--c-border2, var(--editor-border)),0 5px 13px rgba(0,0,0,.12);}
            .theme-scope-opt{appearance:none;min-width:0;min-height:62px;padding:7px 8px;border:0;border-radius:999px;background:transparent;color:var(--c-text2, var(--editor-muted));display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;font:inherit;font-size:11px;font-weight:650;line-height:1;cursor:pointer;touch-action:manipulation;-webkit-tap-highlight-color:transparent;transition:background .16s ease,color .16s ease,box-shadow .16s ease,transform .1s ease;}
            .theme-scope-opt ha-icon{--mdc-icon-size:25px;pointer-events:none;}
            .theme-scope-opt span{pointer-events:none;}
            .theme-scope-opt.active{background:var(--c-bg-primary, var(--editor-card-bg));color:var(--c-primary, var(--editor-primary));box-shadow:0 2px 8px rgba(0,0,0,.16),inset 0 0 0 1px color-mix(in srgb,var(--c-primary, var(--editor-primary)) 26%,transparent);}
            .theme-scope-opt:active{transform:scale(.98);}
            .theme-scope-opt:focus-visible{outline:2px solid var(--c-primary, var(--editor-primary));outline-offset:1px;}
            @media (hover:hover){.theme-scope-opt:not(.active):hover{background:color-mix(in srgb,var(--c-bg-primary, var(--editor-card-bg)) 66%,transparent);color:var(--c-text, var(--editor-text));}}
            .card-view-start-seg{width:min(100%,280px);margin:0;padding:3px;gap:2px;}
            .card-view-mode-seg{width:min(100%,430px);}
            .editor-bubble-selector{width:min(100%,560px);grid-template-columns:repeat(var(--editor-bubble-option-count,3),minmax(0,1fr));}
            .editor-bubble-selector .card-view-start-opt{padding-inline:4px;white-space:nowrap;}
            .card-view-start-opt{position:relative;min-height:32px;padding:5px 9px;flex-direction:row;font-size:11px;}
            .card-view-start-input{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap;}
            .card-view-start-opt:has(.card-view-start-input:checked){background:var(--c-bg-primary, var(--editor-card-bg));color:var(--c-primary, var(--editor-primary));box-shadow:0 2px 8px rgba(0,0,0,.16),inset 0 0 0 1px color-mix(in srgb,var(--c-primary, var(--editor-primary)) 26%,transparent);}
            .card-view-start-opt:has(.card-view-start-input:disabled){opacity:.48;cursor:not-allowed;}
            .card-view-start-opt:has(.card-view-start-input:focus-visible){outline:2px solid var(--c-primary, var(--editor-primary));outline-offset:1px;}
            @media (hover:hover){.card-view-start-opt:not(:has(.card-view-start-input:checked)):not(:has(.card-view-start-input:disabled)):hover{background:color-mix(in srgb,var(--c-bg-primary, var(--editor-card-bg)) 66%,transparent);color:var(--c-text, var(--editor-text));}}
            .theme-custom-row{display:grid;grid-template-columns:1fr auto auto;gap:10px;align-items:center;padding:10px 0;border-top:1px solid var(--c-border2, var(--editor-border));}
            .theme-custom-scope + .theme-custom-row{border-top:none;}
            .theme-custom-label{display:flex;flex-direction:column;gap:2px;min-width:0;}
            .theme-custom-warn{font-size:11px;color:var(--c-text2, var(--editor-muted));}
            .theme-color-wrap{position:relative;width:60px;height:60px;display:flex;align-items:center;justify-content:center;}
            .theme-color-input{width:60px;height:60px;padding:0;border:1px solid var(--editor-border);border-radius:4px;background:transparent;cursor:pointer;}
            .theme-color-input:disabled{opacity:1;cursor:not-allowed;}
            .theme-color-reset{
              position:absolute;
              left:calc(-1.4em - 2px);
              bottom:0;
              width:1.4em;
              height:1.4em;
              padding:0;
              border:none;
              background:transparent;
              color:var(--c-alert);
              display:grid;
              place-items:center;
              cursor:pointer;
            }
            .theme-color-reset[hidden]{display:none;}
            .theme-color-reset ha-icon{--mdc-icon-size:1.4em;}
            .layout-row{display:flex;align-items:center;justify-content:space-between;gap:8px;}
            .timezone-row{align-items:flex-start;flex-wrap:wrap;}
            .timezone-readout{display:inline-flex;align-items:center;gap:7px;max-width:100%;box-sizing:border-box;padding:6px 10px;border-left:3px solid var(--c-primary, var(--editor-primary));border-radius:4px;background:var(--c-bg-main, var(--editor-secondary-bg));color:var(--c-text, var(--editor-text));font-size:12px;line-height:1.35;cursor:default;}
            .timezone-readout ha-icon{--mdc-icon-size:17px;color:var(--c-text2, var(--editor-muted));flex:0 0 auto;}
            .timezone-helper{max-width:560px;}
            .timezone-helper a{color:var(--c-primary, var(--editor-primary));text-decoration:underline;text-underline-offset:2px;}

            .cam-modal.hidden{display:none;}
            .cam-modal{position:fixed;inset:0;box-sizing:border-box;padding:12px;background:rgba(0,0,0,.30);display:flex;align-items:flex-start;justify-content:center;overflow:auto;overscroll-behavior:contain;z-index:10000;}
            .cam-modal-card{flex:0 0 auto;width:min(640px,100%);margin:auto;overflow:visible;box-sizing:border-box;background:var(--editor-card-bg);color:var(--editor-text);border:var(--editor-border-width) solid var(--editor-border);border-radius:16px;padding:16px;box-shadow:var(--editor-shadow);}
            .cam-modal-card ha-input,
            .cam-modal-card ha-selector,
            .cam-modal-card ha-switch{--ha-card-background:var(--editor-card-bg);}
            .cam-modal-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;}
            .camera-modal-card{padding:0;}
            .camera-modal-card .cam-modal-head{display:grid;grid-template-columns:auto minmax(0,1fr) auto;gap:12px;margin:0;padding:12px 16px;border-bottom:1px solid var(--c-border2, var(--editor-border));border-radius:15px 15px 0 0;background:var(--editor-secondary-bg);}
            .cam-modal-title{min-width:0;color:var(--primary-text-color);font-size:24px;font-weight:600;text-align:center;}
            .cam-modal-head-spacer{width:calc(24px + 1rem);height:calc(24px + 1rem);}
            .camera-modal-body{padding:12px 16px 0;}
            .cam-modal-section-heading{margin:14px 0 8px;padding:9px 11px;border:1px solid var(--c-border2, var(--editor-border));border-radius:10px;background:var(--editor-secondary-bg);}
            .camera-modal-body > .cam-modal-section-heading:first-child{margin-top:0;}
            .cam-modal-section-title{display:block;color:var(--editor-text);font-size:14px;font-weight:700;line-height:1.3;}
            .cam-modal-section-description{display:block;margin-top:2px;color:var(--editor-muted);font-size:11px;line-height:1.4;}
            .camera-modal-body > .cam-modal-field{box-sizing:border-box;margin-bottom:8px;padding:10px 12px;border:1px solid var(--c-border2, var(--editor-border));border-radius:10px;background:var(--editor-card-bg);}
            .camera-modal-body > .camera-group-help,
            .camera-modal-body > .camera-group-fields{margin-inline-start:0;}
            .cam-modal-toggle-row{align-items:center;justify-content:space-between;gap:14px;}
            .cam-modal-toggle-copy{min-width:0;}
            .cam-modal-toggle-copy .cam-modal-label{margin:0;}
            .cam-modal-toggle-copy .field-helper{margin-top:3px;line-height:1.4;}
            .cam-modal-toggle-row ha-switch{flex:0 0 auto;}
            .round-btn{display:inline-flex;align-items:center;justify-content:center;min-width:calc(24px + 1rem);min-height:calc(24px + 1rem);aspect-ratio:1/1;padding:0;background-color:var(--c-bg-main);color:var(--c-text2);background-image:radial-gradient(circle at center,var(--wa-color-neutral-fill-normal,var(--editor-card-bg)) 0 50%,transparent 51%);background-position:center;background-repeat:no-repeat;background-size:0 0;border:none;box-shadow:0 0 6px 1px var(--c-border2);border-radius:50%;font:inherit;font-weight:600;font-size:1rem;line-height:1;cursor:pointer;appearance:none;transition:background-size .35s ease,box-shadow .2s ease,transform .12s ease;}
            .round-btn svg{width:24px;height:24px;opacity:.85;color:var(--c-text2);}
            .round-btn:hover{background-size:210% 210%;}
            .round-btn:hover svg{color:var(--c-text);}
            .round-btn:focus-visible{outline:2px solid var(--editor-primary-l);outline-offset:3px;}
            .cam-modal-label{font-size:12px;font-weight:600;color:var(--editor-text);margin-bottom:6px;display:block;}
            .cam-modal-field{margin-bottom:8px;}
            .camera-group-add-row{display:flex;justify-content:flex-start;padding-inline-start:12px;}
            .camera-group-help{margin:0 0 10px 12px;border-inline-start:3px solid var(--c-primary, var(--editor-primary));border-radius:0 8px 8px 0;background:var(--editor-secondary-bg);color:var(--editor-text);font-size:12px;line-height:1.35;}
            .camera-group-help[hidden]{display:none;}
            .camera-group-help summary{padding:7px 10px;color:var(--c-primary, var(--editor-primary));font-weight:700;cursor:pointer;}
            .camera-group-help-copy{padding:0 10px 9px;color:var(--c-text2, var(--editor-muted));}
            .camera-group-fields{margin:0 0 10px 12px;padding:10px;border-inline-start:3px solid var(--editor-primary);background:var(--editor-secondary-bg);border-radius:0 10px 10px 0;}
            .camera-group-fields[hidden]{display:none!important;}
            .camera-group-fields-head{display:flex;align-items:center;gap:10px;margin-bottom:6px;}
            .camera-group-fields-title{font-size:12px;font-weight:700;color:var(--editor-text);}
            .camera-group-secondary-row{display:block;min-width:0;}
            .camera-group-selector{flex:1 1 auto;min-width:0;}
            .camera-group-action{flex:0 0 auto;}
            .camera-group-fields-footer{display:flex;justify-content:flex-end;align-items:center;margin-top:5px;}
            .cam-inline-add{display:inline-flex;align-items:center;gap:6px;min-height:30px;padding:4px 10px;border:1px solid var(--c-border2);border-radius:999px;background:var(--editor-secondary-bg);color:var(--editor-text);font:inherit;font-size:12px;font-weight:700;line-height:1;cursor:pointer;}
            .cam-inline-add[hidden]{display:none!important;}
            .cam-inline-add svg{width:18px;height:18px;flex:0 0 18px;color:var(--editor-primary);}
            .cam-inline-add:hover{background:var(--editor-primary-l);border-color:var(--editor-primary);color:var(--editor-primary-d);}
            .cam-inline-add:hover svg{color:var(--editor-primary-d);}
            .cam-inline-remove{min-height:28px;padding:3px 7px;border:0;border-radius:6px;background:transparent;color:var(--c-primary,var(--editor-primary));font:inherit;font-size:12px;font-weight:700;line-height:1;cursor:pointer;}
            .cam-inline-remove:hover{background:var(--c-primary-l,var(--editor-primary-l));color:var(--c-primary-d,var(--editor-primary-d));}
            .linked-entity-row{display:block;min-width:0;}
            .linked-entity-selectors{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);align-items:start;gap:10px;min-width:0;}
            .linked-entity-field{display:grid;grid-template-rows:auto minmax(56px,auto);align-content:start;min-width:0;}
            .linked-entity-field > .cam-modal-label{margin:0 0 6px;}
            .linked-entity-selectors ha-selector,.camera-group-selector ha-selector{display:block;width:100%;min-width:0;background:var(--editor-card-bg);border-radius:4px 4px 0 0;--mdc-menu-max-height:min(320px,48dvh);--ha-card-background:var(--editor-card-bg);--mdc-text-field-fill-color:var(--editor-card-bg);--mdc-filled-text-field-container-color:var(--editor-card-bg);--ha-color-fill-neutral-normal-resting:var(--editor-card-bg);--wa-color-neutral-fill-normal:var(--editor-card-bg);--ha-color-fill-neutral-normal-hover:var(--editor-primary-l);--wa-color-neutral-fill-normal-hover:var(--editor-primary-l);}
            .linked-entity-selectors ha-selector:hover,.linked-entity-selectors ha-selector:focus-within,.camera-group-selector ha-selector:hover,.camera-group-selector ha-selector:focus-within{background:var(--editor-primary-l);--ha-card-background:var(--editor-primary-l);--mdc-text-field-fill-color:var(--editor-primary-l);--mdc-filled-text-field-container-color:var(--editor-primary-l);}
            .camera-group-layout-field{display:block;margin:10px 0 8px;}
            .camera-group-layout-field .cam-modal-label{margin:0 0 7px;}
            .camera-group-layout-field .editor-choice-chips{grid-template-columns:repeat(2,minmax(0,1fr));}
            #camera-modal-ptz-rotation-row{margin-top:10px;padding-left:12px;border-left:3px solid var(--c-primary, var(--editor-primary));}
            #camera-modal-ptz-rotation-row .editor-choice-chips{grid-template-columns:repeat(4,minmax(0,1fr));}
            .cam-modal-foot{display:flex;justify-content:flex-end;gap:8px;margin-top:8px;}
            .camera-modal-card .cam-modal-helper{margin:0 16px;}
            .camera-modal-card .cam-modal-foot{margin-top:8px;padding:0 16px 14px;}
            .cam-btn{min-height:38px;border:1px solid transparent;border-radius:999px;background:transparent;color:var(--editor-primary);font-weight:600;cursor:pointer;padding:8px 14px;transition:background .16s ease,color .16s ease,border-color .16s ease;}
            .cam-btn:hover,.cam-btn:focus-visible{background:var(--editor-primary-l);border-color:transparent;color:var(--editor-primary-d);outline:none;}
            .cam-btn.primary{background:var(--editor-primary);color:var(--text-primary-color);border-color:var(--editor-primary);padding:8px 18px;}
            .cam-btn.primary:hover,.cam-btn.primary:focus-visible{background:var(--editor-primary-d);border-color:var(--editor-primary-d);color:var(--text-primary-color);}
            .cam-btn.danger{background:var(--c-alert);color:var(--c-text-rev);border-color:var(--c-alert);padding:8px 18px;}
            .cam-btn.danger:hover{background:var(--c-alert);border-color:var(--c-alert);filter:brightness(.9);}
            .cam-modal-helper{font-size:11px;color:var(--error-color);min-height:16px;}
            .camera-capability-status{box-sizing:border-box;width:fit-content;max-width:100%;margin:5px 0 7px;padding:5px 9px;border:1px solid var(--c-border2);border-radius:10px;background:var(--editor-secondary-bg);color:var(--editor-muted);line-height:1.3;}
            .cam-confirm-card{width:min(420px,100%);}
            .cam-confirm-title{margin:0 0 8px;font-size:20px;color:var(--c-text);}
            .cam-confirm-message{margin:0;color:var(--c-text2);line-height:1.5;}
            @media (max-width:560px){
              .linked-entity-selectors{grid-template-columns:minmax(0,1fr);}
              .camera-modal-card .cam-modal-head{padding:10px 12px;}
              .cam-modal-title{font-size:22px;}
              .camera-modal-body{padding:10px 12px 0;}
            }
            .standalone-landing-dialog{position:fixed;inset:0;margin:auto;box-sizing:border-box;width:min(420px,calc(100vw - 24px));max-width:none;max-height:calc(100dvh - 24px);overflow:auto;}
            .standalone-landing-dialog::backdrop{background:rgba(0,0,0,.30);}
            .standalone-landing-dialog:not([open]){display:none;}

        </style>
    <div class="ed-wrap">
      ${Ui}
      ${Gi}

      <div id="camera-modal" class="cam-modal hidden">
        <div class="cam-modal-card camera-modal-card" role="dialog" aria-modal="true" aria-labelledby="camera-modal-title">
          <div class="cam-modal-head">
            <button type="button" id="camera-modal-close" class="round-btn" title="Close" aria-label="Close">${F.close}</button>
            <div class="cam-modal-title" id="camera-modal-title">Add Camera</div>
            <div class="cam-modal-head-spacer" aria-hidden="true"></div>
          </div>
          <div class="camera-modal-body">
            <div class="cam-modal-section-heading">
              <span class="cam-modal-section-title">Camera Source</span>
              <span class="cam-modal-section-description">Choose the primary camera or pair it with a second camera.</span>
            </div>
          <div class="cam-modal-field">
            <ha-selector id="camera-modal-entity"></ha-selector>
          </div>
          <div class="cam-modal-field camera-group-add-row">
            <button type="button" id="camera-modal-add-secondary" class="cam-inline-add camera-group-action">${F.cameraAdd}<span>Add second camera</span></button>
          </div>
          <details id="camera-modal-secondary-help" class="camera-group-help">
            <summary>What is a second camera?</summary>
            <div class="camera-group-help-copy">Combines two camera entities into one view, such as main and package cameras. Only the main camera provides PTZ or two-way talk.</div>
          </details>
          <div id="camera-modal-group-fields" class="camera-group-fields" hidden>
            <div class="camera-group-fields-head">
              <span class="camera-group-fields-title">Second Camera</span>
            </div>
            <div class="camera-group-secondary-row">
              <div class="camera-group-selector">
                <ha-selector id="camera-modal-secondary-entity"></ha-selector>
              </div>
            </div>
            <div class="editor-choice-field camera-group-layout-field" role="radiogroup" aria-label="Live View Layout">
              <div class="cam-modal-label">Live View Layout</div>
              ${ot({name:"camera-modal-group-layout",options:[{value:fe.sideBySide,label:"Side by Side"},{value:fe.stacked,label:"Stacked"}],selectedValue:fe.sideBySide})}
            </div>
            <div class="field-helper">Only the main camera provides PTZ and two-way talk. Put the controllable camera first.</div>
            <div class="camera-group-fields-footer">
              <button type="button" id="camera-modal-remove-secondary" class="cam-inline-remove camera-group-action">Cancel</button>
            </div>
          </div>
          <div class="cam-modal-section-heading">
            <span class="cam-modal-section-title">Camera Settings</span>
            <span class="cam-modal-section-description">Set the display name, connection, and alert content.</span>
          </div>
          <div class="cam-modal-field">
            <span class="cam-modal-label" id="camera-modal-name-label">Camera Name</span>
            <ha-input id="camera-modal-name" aria-labelledby="camera-modal-name-label" aria-label="Camera Name" placeholder="Display name (optional)"></ha-input>
          </div>
          <div class="cam-modal-field">
            <span class="cam-modal-label">Connection Type</span>
            <ha-selector id="camera-modal-connection-type"></ha-selector>
            <div class="field-helper">Requires the Home Assistant Frigate integration.</div>
          </div>
          <div class="cam-modal-field">
            <div class="layout-row cam-modal-toggle-row">
              <div class="cam-modal-toggle-copy">
                <span class="cam-modal-label">Show All Reviews in Alerts</span>
                <div class="field-helper">Frigate groups activity into reviews that may contain alerts, detections, or both. Enable this to show every review in the Alerts tab; disable it to show alerts only.</div>
              </div>
              <ha-switch id="camera-modal-all-reviews"></ha-switch>
            </div>
          </div>
          <div class="cam-modal-section-heading">
            <span class="cam-modal-section-title">Linked Lights</span>
            <span class="cam-modal-section-description">Add optional Home Assistant light controls to this camera.</span>
          </div>
          <div class="cam-modal-field camera-group-add-row">
            <button type="button" id="camera-modal-add-light" class="cam-inline-add camera-group-action">${F.lightAdd}<span>Add light</span></button>
          </div>
          <div id="camera-modal-light-fields" class="camera-group-fields" hidden>
            <div class="camera-group-fields-head">
              <span class="camera-group-fields-title">Linked Light</span>
            </div>
            <div class="linked-entity-row">
              <div class="linked-entity-selectors">
                <div class="linked-entity-field">
                  <span class="cam-modal-label">Light</span>
                  <ha-selector id="camera-modal-light-entity"></ha-selector>
                </div>
                <div class="linked-entity-field">
                  <span class="cam-modal-label">Icon</span>
                  <ha-selector id="camera-modal-light-icon"></ha-selector>
                </div>
              </div>
            </div>
            <div class="editor-choice-field camera-group-layout-field" role="radiogroup" aria-label="Button Position">
              <div class="cam-modal-label">Button Position</div>
              ${ot({name:"camera-modal-light-position",options:[{value:se.left,label:"Left"},{value:se.right,label:"Right"}],selectedValue:se.right})}
            </div>
            <div class="field-helper">Adds a Home Assistant light button beside the microphone. A light can be linked to multiple cameras.</div>
            <div class="camera-group-fields-footer">
              <button type="button" id="camera-modal-remove-light" class="cam-inline-remove camera-group-action">Cancel</button>
            </div>
          </div>
          <div class="cam-modal-field camera-group-add-row">
            <button type="button" id="camera-modal-add-light-2" class="cam-inline-add camera-group-action" hidden>${F.lightAdd}<span>Add second light</span></button>
          </div>
          <div id="camera-modal-light-fields-2" class="camera-group-fields" hidden>
            <div class="camera-group-fields-head">
              <span class="camera-group-fields-title">Second Linked Light</span>
            </div>
            <div class="linked-entity-row">
              <div class="linked-entity-selectors">
                <div class="linked-entity-field">
                  <span class="cam-modal-label">Light</span>
                  <ha-selector id="camera-modal-light-entity-2"></ha-selector>
                </div>
                <div class="linked-entity-field">
                  <span class="cam-modal-label">Icon</span>
                  <ha-selector id="camera-modal-light-icon-2"></ha-selector>
                </div>
              </div>
            </div>
            <div class="editor-choice-field camera-group-layout-field" role="radiogroup" aria-label="Button Position">
              <div class="cam-modal-label">Button Position</div>
              ${ot({name:"camera-modal-light-position-2",options:[{value:se.left,label:"Left"},{value:se.right,label:"Right"}],selectedValue:se.right})}
            </div>
            <div class="field-helper">Places the second light independently on either side of the microphone.</div>
            <div class="camera-group-fields-footer">
              <button type="button" id="camera-modal-remove-light-2" class="cam-inline-remove camera-group-action">Cancel</button>
            </div>
          </div>
          <div class="cam-modal-section-heading">
            <span class="cam-modal-section-title">Camera Controls</span>
            <span class="cam-modal-section-description">Enable controls supported by this camera and connection type.</span>
          </div>
          <div class="cam-modal-field">
            <div id="camera-modal-ptz-toggle-row">
              <div class="layout-row cam-modal-toggle-row">
                <div class="cam-modal-toggle-copy">
                  <span class="cam-modal-label">Enable PTZ Controls</span>
                  <div class="field-helper">Adds pan and tilt controls when supported.</div>
                </div>
                <ha-switch id="camera-modal-ptz-enabled"></ha-switch>
              </div>
            <div id="camera-modal-ptz-rotation-row" hidden>
              <div class="editor-choice-field camera-group-layout-field" role="radiogroup" aria-label="PTZ Control Rotation">
                <div class="cam-modal-label">PTZ Control Rotation</div>
                ${ot({name:"camera-modal-ptz-rotation",options:Da.map(l=>({value:l,label:`${l}\xB0`})),selectedValue:0,compact:!0})}
              </div>
              <div class="field-helper">Rotates directional commands to match the camera image. At 90\xB0, Up sends Left.</div>
            </div>
            </div>
            <div class="field-helper camera-capability-status" id="camera-modal-ptz-state" style="display:none"></div>
          </div>
          <div class="cam-modal-field" id="camera-modal-two-way-talk-toggle-row" style="display:none">
            <div class="layout-row" style="justify-content:flex-start;gap:8px">
              <span class="cam-modal-label" style="margin:0">Enable Two-Way Talk</span>
              <ha-switch id="camera-modal-two-way-talk-enabled"></ha-switch>
            </div>
            <div class="field-helper">Frigate requires a WebRTC backchannel. Home Assistant is experimental and requires HA WebRTC playback.</div>
          </div>
          <div class="field-helper camera-capability-status" id="camera-modal-two-way-talk-state" style="display:none"></div>
          </div>
          <div class="cam-modal-helper" id="camera-modal-helper"></div>
          <div class="cam-modal-foot">
            <button type="button" id="camera-modal-cancel" class="cam-btn">Cancel</button>
            <button type="button" id="camera-modal-save" class="cam-btn primary">Add</button>
          </div>
        </div>
      </div>

      <div id="camera-delete-modal" class="cam-modal hidden">
        <div class="cam-modal-card cam-confirm-card" role="alertdialog" aria-modal="true" aria-labelledby="camera-delete-title" aria-describedby="camera-delete-message">
          <h3 class="cam-confirm-title" id="camera-delete-title">Delete camera?</h3>
          <p class="cam-confirm-message" id="camera-delete-message"></p>
          <div class="cam-modal-foot">
            <button type="button" id="camera-delete-cancel" class="cam-btn">Cancel</button>
            <button type="button" id="camera-delete-confirm" class="cam-btn danger">Delete</button>
          </div>
        </div>
      </div>

      <dialog id="standalone-landing-modal" class="cam-modal-card cam-confirm-card standalone-landing-dialog" aria-labelledby="standalone-landing-title" aria-describedby="standalone-landing-message">
          <h3 class="cam-confirm-title" id="standalone-landing-title">Choose a landing page</h3>
          <p class="cam-confirm-message" id="standalone-landing-message">Card View will no longer be the standalone desktop and tablet view. Select the desktop and tablet landing page to use after standalone mode is disabled.</p>
          <div class="cam-modal-field" style="margin-top:12px">
            <span class="cam-modal-label">Landing Page</span>
            <ha-selector id="standalone-landing-page" style="width:100%"></ha-selector>
          </div>
          <div class="cam-modal-helper" id="standalone-landing-helper"></div>
          <div class="cam-modal-foot">
            <button type="button" id="standalone-landing-cancel" class="cam-btn">Cancel</button>
            <button type="button" id="standalone-landing-confirm" class="cam-btn primary">Apply</button>
          </div>
      </dialog>
    </div>`;const ee=(l=null)=>this._u({dispatch:!1,preview:!0,previewRouteIntent:l}),Zi=()=>ee(),Dt=(l=null)=>{l&&(this._pendingEditorPreviewRouteIntent=l),!this._previewUpdateRaf&&(this._previewUpdateRaf=requestAnimationFrame(()=>{this._previewUpdateRaf=0;const m=this._pendingEditorPreviewRouteIntent;this._pendingEditorPreviewRouteIntent=null,ee(m)}))};qr({root:this,update:Zi,themeDraftCache:this._themeDraftCache,resolveDefaultHex:l=>this._themeDefaultHex(l,O),themeMode:O}),De({element:this.querySelector("#event_days"),hass:this._hass,options:Array.from({length:15},(l,m)=>{const y=String(m+1);return{value:y,label:y}}),initialValue:String(this._config?.event_days??le),fallbackValue:String(le),normalize:l=>String(l??le),onChange:()=>ee()}),De({element:this.querySelector("#alerts_reviews_days"),hass:this._hass,options:Array.from({length:15},(l,m)=>{const y=String(m+1);return{value:y,label:y}}),initialValue:String(this._config?.alerts_reviews_days??de),fallbackValue:String(de),normalize:l=>String(l??de),onChange:()=>ee()}),De({element:this.querySelector("#landing_page"),hass:this._hass,options:xi,initialValue:this._config?.landing_page||_.singleView,fallbackValue:_.singleView,normalize:l=>ie(l),onChange:()=>ee()}),De({element:this.querySelector("#standalone-landing-page"),hass:this._hass,options:Si,initialValue:_.singleView,fallbackValue:_.singleView,normalize:l=>ie(l)}),De({element:this.querySelector("#mobile_page"),hass:this._hass,options:ki,initialValue:this._config?.mobile_page||b.single,fallbackValue:b.single,normalize:l=>Ze(l),onChange:()=>ee()});const ra=this.querySelector("#mobile_page");ra&&(ra.disabled=this._config?.card_view_standalone===!0),Mt({element:this.querySelector("#camera-modal-entity"),hass:this._hass,domain:"camera",label:"Camera"}),Mt({element:this.querySelector("#camera-modal-secondary-entity"),hass:this._hass,domain:"camera",required:!1,onChange:()=>this._syncCameraModalGroupFields()}),Mt({element:this.querySelector("#camera-modal-light-entity"),hass:this._hass,domain:"light",required:!1,onChange:l=>{this._syncCameraModalLightIconContext(l),this._syncCameraModalLightFields()}}),ja({element:this.querySelector("#camera-modal-light-icon"),hass:this._hass,entity:""}),Mt({element:this.querySelector("#camera-modal-light-entity-2"),hass:this._hass,domain:"light",required:!1,onChange:l=>{this._syncCameraModalLightIconContext(l,1),this._syncCameraModalLightFields()}}),ja({element:this.querySelector("#camera-modal-light-icon-2"),hass:this._hass,entity:""}),De({element:this.querySelector("#camera-modal-connection-type"),hass:this._hass,options:[{value:"frigate_go2rtc",label:"Frigate go2rtc (default)"},{value:"ha_direct",label:"Home Assistant"}],initialValue:N,fallbackValue:N,normalize:l=>X(l)}),Nr(this,[{selector:"#camera-add",handler:()=>this._openCameraModal(null)},{selector:"#camera-modal-close",handler:()=>this._closeCameraModal()},{selector:"#camera-modal-cancel",handler:()=>this._closeCameraModal()},{selector:"#camera-modal-save",handler:()=>this._saveCameraModal()},{selector:"#camera-modal-add-secondary",handler:()=>this._setCameraModalGroupEnabled(!0)},{selector:"#camera-modal-remove-secondary",handler:()=>this._setCameraModalGroupEnabled(!1)},{selector:"#camera-modal-add-light",handler:()=>this._setCameraModalLightEnabled(!0,0)},{selector:"#camera-modal-remove-light",handler:()=>this._setCameraModalLightEnabled(!1,0)},{selector:"#camera-modal-add-light-2",handler:()=>this._setCameraModalLightEnabled(!0,1)},{selector:"#camera-modal-remove-light-2",handler:()=>this._setCameraModalLightEnabled(!1,1)},{selector:"#camera-delete-cancel",handler:()=>this._closeCameraDeleteConfirmation()},{selector:"#camera-delete-confirm",handler:()=>this._confirmCameraRemoval()},{selector:"#standalone-landing-cancel",handler:()=>this._closeStandaloneLandingPageModal()},{selector:"#standalone-landing-confirm",handler:()=>this._confirmStandaloneLandingPage()}]),Wa({root:this,selector:"[data-edit-cam]",handler:l=>{this._openCameraModal(Number(l.currentTarget.dataset.editCam))}}),Wa({root:this,selector:"[data-remove-cam]",handler:l=>{this._openCameraDeleteConfirmation(Number(l.currentTarget.dataset.removeCam))}}),this.querySelector("#camera-modal")?.addEventListener("click",l=>{l.target?.id==="camera-modal"&&l!==this._cameraModalSuppressedClickEvent&&this._closeCameraModal(),l===this._cameraModalSuppressedClickEvent&&(this._cameraModalSuppressedClickEvent=null)}),this.querySelector("#camera-delete-modal")?.addEventListener("click",l=>{l.target?.id==="camera-delete-modal"&&this._closeCameraDeleteConfirmation()});const st=this.querySelector("#standalone-landing-modal");st?.addEventListener("cancel",l=>{l.preventDefault(),this._closeStandaloneLandingPageModal()}),st?.addEventListener("click",l=>{if(l.target!==st)return;const m=st.getBoundingClientRect?.();if(!m)return;(l.clientX<m.left||l.clientX>m.right||l.clientY<m.top||l.clientY>m.bottom)&&this._closeStandaloneLandingPageModal()}),this.querySelector("#camera-modal-name")?.addEventListener("keydown",l=>{l.key==="Enter"&&(l.preventDefault(),this._saveCameraModal())}),this.querySelector("#camera-modal-entity")?.addEventListener("value-changed",()=>{this._refreshCameraModalPtzSupport(),this._refreshCameraModalTwoWayTalkSupport()}),this.querySelector("#camera-modal-entity")?.addEventListener("change",()=>{this._refreshCameraModalPtzSupport(),this._refreshCameraModalTwoWayTalkSupport()}),this.querySelector("#camera-modal-connection-type")?.addEventListener("value-changed",()=>{this._refreshCameraModalPtzSupport(),this._refreshCameraModalTwoWayTalkSupport()}),this.querySelector("#camera-modal-connection-type")?.addEventListener("change",()=>{this._refreshCameraModalPtzSupport(),this._refreshCameraModalTwoWayTalkSupport()}),this.querySelector("#camera-modal-ptz-enabled")?.addEventListener("value-changed",()=>this._syncCameraModalPtzVisibility({supported:this.querySelector("#camera-modal-ptz-enabled")?.dataset?.supported==="true",sourceType:this._cameraModalConnectionTypeValue(),loading:!1})),this.querySelector("#camera-modal-ptz-enabled")?.addEventListener("change",()=>this._syncCameraModalPtzVisibility({supported:this.querySelector("#camera-modal-ptz-enabled")?.dataset?.supported==="true",sourceType:this._cameraModalConnectionTypeValue(),loading:!1})),this.querySelector("#stream_height")?.addEventListener("input",()=>{this._syncStreamHeightOutput()}),this.querySelector("#stream_height_unit")?.addEventListener("change",()=>this._syncStreamHeightOutput()),this.querySelector("#col_left_width_pct")?.addEventListener("input",l=>{this._setRangeValueOutput("#col_left_width_pct",l.currentTarget?.value,"%")}),this._wireCameraDragAndDrop(),this._wireGridOrderControls(),this._wireSettingsPanels(),this._wireEditorDialogActions(),this._wireLivePreviewUpdates(),this._wireStandaloneLandingPageTransition(Dt),this.querySelector("#card-version-update-link")?.addEventListener("click",l=>this._openCardUpdateDialog(l.currentTarget?.dataset?.entityId)),this._syncCardVersionStatus(),this._syncEnvironmentSupportNotices(),this.querySelector("#mobile_view_ha_navbar_dashboard")?.addEventListener("change",()=>{ee(),this._render()}),this.querySelector("#ha_dashboard_swipe_navigation_owner")?.addEventListener("change",()=>{ee(),this._render()}),this.querySelector("#ha_dashboard_swipe_navigation")?.addEventListener("change",l=>{if(l.target?.name!=="ha_dashboard_swipe_navigation")return;const m=String(l.target?.value||"");this.querySelectorAll(".editor-swipe-choice").forEach(K=>{K.classList.toggle("selected",K.querySelector("input:checked")!=null)});const y=this.querySelector("#ha_dashboard_swipe_include_other_cards");y&&(y.disabled=m!==C.insideCard),this.querySelectorAll("[data-ha-dashboard-swipe-include-subviews]").forEach(K=>{K.disabled=K.dataset.haDashboardSwipeIncludeSubviews!==m});const $=this.querySelector("#ha-dashboard-swipe-page-selection");$&&($.style.display=[C.dashboardWide,C.insideCard].includes(m)?"":"none")}),this.querySelectorAll("[data-ha-dashboard-swipe-include-subviews]").forEach(l=>{l.addEventListener("change",()=>{this.querySelectorAll("[data-ha-dashboard-swipe-include-subviews]").forEach(m=>{m.checked=l.checked===!0}),ee()})}),Fa({root:this,ids:["stream_height","col_left_width_pct"],events:["change"],handler:()=>ee()}),Fa({root:this,ids:["tight_margins","display_title","display_subtitle","display_logo","display_version","single_view_alert_takeover","wide_view_page_enabled","wide_view_live_cameras","wide_view_alert_takeover","wide_view_timeline_enabled","wide_view_timeline_default_open","card_view_page_enabled","card_view_alert_takeover","card_view_media_drawer_enabled","card_view_hide_camera_name","mobile_view_page_enabled","mobile_view_rotate_to_fullscreen","mobile_view_dashboard_background","mobile_view_outer_border","mobile_view_ha_navbar_bottom","mobile_view_ha_navbar_stack_tabs","ha_dashboard_swipe_navigation","ha_dashboard_swipe_include_other_cards","ha_dashboard_swipe_mouse_enabled","shadows","borders","rounded_corners","outer_shadows","mobile_poll_battery_saver","event_pre_post_roll_enabled","favorites_mixed_cameras","realtime_poll_seconds","snapshot_update_seconds","slideshow_rotation_enabled","slideshow_rotation_seconds","grid_mode_enabled","grid_live_view_enabled","grid_rotation_seconds","slideshow_alert_hold_seconds","grid_alert_hold_seconds","preview_page_enabled","preview_page_live_cameras","preview_page_live_cameras_mobile","preview_page_alert_live_duration_seconds","preview_page_show_title_bars","wide_view_timeline_default_scale","stream_height_unit"],events:["input","change","value-changed"],handler:l=>{const m=this.querySelector("#slideshow_rotation_row"),y=this.querySelector("#slideshow_rotation_enabled")?.checked===!0,$=this.querySelector("#grid_rotation_row"),K=this.querySelector("#grid_live_row"),Se=this.querySelector("#grid_order_row"),te=this.querySelector("#grid_mode_enabled")?.checked===!0,He=this.querySelector("#card-view-page-options");He&&(He.style.display=v(this.querySelector("#card_view_page_enabled"))?"":"none");const ct=(Vt,_a)=>{this.querySelectorAll(`[name$="_view_start_mode"][value="${Vt}"]`).forEach(Ce=>{Ce.disabled=!_a;const ht=Ce.closest("label");if(!ht)return;const zt=String(ht.dataset.disabledGuidance||"").trim();if(!_a&&zt){ht.title=zt,Ce.setAttribute("aria-label",`${Ce.nextElementSibling?.textContent||Vt}. ${zt}`);return}ht.removeAttribute("title"),Ce.setAttribute("aria-label",Ce.nextElementSibling?.textContent||Vt)})};ct("slideshow",y),ct("grid",te),m&&(m.style.display=y?"flex":"none"),K&&(K.style.display=te?"flex":"none"),Se&&(Se.style.display=te?"flex":"none"),$&&($.style.display=te&&j>4?"flex":"none"),Dt()}}),Ir({root:this,selector:"[data-active-tab]",events:["change","value-changed"],handler:l=>{const m=l.currentTarget?.dataset?.activeTab;if(!m)return;const y=this._isTabVisibleFromEvent(l);this._setHiddenTabFromToggle(m,y),Dt()}});const oa=this.querySelector("#card-view-video-only-options"),sa=Array.from(this.querySelectorAll('[name="card_view_view_mode"]'));if(oa&&sa.length){const l=()=>{const m=this.querySelector('[name="card_view_view_mode"]:checked')?.value;oa.style.display=m===Y.videoOnly?"":"none"};sa.forEach(m=>{m.addEventListener("change",l)}),l()}const ge=this.querySelector("#wide_view_page_enabled"),na=this.querySelector("#wide-view-page-options"),la=this.querySelector("#col-width-row"),nt=this.querySelector("#wide_view_timeline_enabled"),da=this.querySelector("#wide-timeline-enabled-row"),ca=this.querySelector("#wide-timeline-default-open-row"),ha=this.querySelector("#wide-timeline-default-scale-row");if(ge&&la){const l=()=>{na&&(na.style.display=ge.checked?"contents":"none"),la.style.display=ge.checked?"":"none",da&&(da.style.display=ge.checked?"":"none"),ca&&(ca.style.display=ge.checked&&nt?.checked?"":"none"),ha&&(ha.style.display=ge.checked&&nt?.checked?"":"none"),this._validateEditorFields()};ge.addEventListener("change",l),ge.addEventListener("value-changed",l),nt?.addEventListener("change",l),nt?.addEventListener("value-changed",l),l()}const lt=this.querySelector("#mobile_view_page_enabled"),pa=this.querySelector("#mobile-view-outer-border-row");if(lt&&pa){const l=()=>{pa.style.display=lt.checked?"":"none"};lt.addEventListener("change",l),lt.addEventListener("value-changed",l),l()}const dt=this.querySelector("#mobile_view_ha_navbar_bottom"),ma=[this.querySelector("#mobile-view-ha-navbar-stack-row"),this.querySelector("#mobile-view-ha-navbar-dashboard-row")].filter(Boolean);if(dt&&ma.length){const l=()=>{const m=dt.checked===!0;ma.forEach(y=>{y.style.display=m?"":"none"})};dt.addEventListener("change",l),dt.addEventListener("value-changed",l),l()}this._validateEditorFields()}_getCams(){return Array.isArray(this._config?.cameras)?Gt(this._config.cameras.map(e=>Ua(e,{fallbackName:""})).filter(e=>e.entity),ce):[]}_commitGridOrder(e){this._config={...this._config,grid_order:pe(e,this._getCams())},this._render(),this._publishPreviewDraft(),this._markHomeAssistantDirty(this._homeAssistantConfig({readDom:!1}))}_wireGridOrderControls(){this.querySelectorAll("[data-grid-order-mode]").forEach(t=>{t.addEventListener("click",()=>{const a=pe(this._config?.grid_order,this._getCams()),i=t.dataset.gridOrderMode===B.custom?B.custom:B.default;i!==a.mode&&this._commitGridOrder({...a,mode:i})})});const e=Array.from(this.querySelectorAll(".grid-order-row"));Ba({rows:e,clearDropTargets:()=>{this.querySelectorAll(".grid-order-row").forEach(t=>{t.classList.remove("drop-target","drop-target-before","drop-target-after")})},onReorder:(t,a,i)=>{const r=pe(this._config?.grid_order,this._getCams());if(t===a||t<0||a<0||t>=r.included.length||a>=r.included.length)return;const o=Ia(r.included,t,a,i);this._commitGridOrder({...r,included:o})}}),this.querySelectorAll("[data-grid-order-exclude]").forEach(t=>{t.addEventListener("click",()=>{const a=String(t.dataset.gridOrderExclude||"").trim(),i=pe(this._config?.grid_order,this._getCams());!a||!i.included.includes(a)||this._commitGridOrder({...i,included:i.included.filter(r=>r!==a),excluded:[...i.excluded,a]})})}),this.querySelectorAll("[data-grid-order-include]").forEach(t=>{t.addEventListener("click",()=>{const a=String(t.dataset.gridOrderInclude||"").trim(),i=pe(this._config?.grid_order,this._getCams());!a||!i.excluded.includes(a)||this._commitGridOrder({...i,included:[...i.included,a],excluded:i.excluded.filter(r=>r!==a)})})})}_emitPreviewDraft(e,t=null){window.dispatchEvent(new CustomEvent("frigate-view-card-preview-draft",{detail:{cardTag:qe,config:e,routeIntent:t}}))}_publishPreviewDraft(e=null){this._hasVisualDraft=!0,this._emitPreviewDraft(Ta(this._config),e)}_homeAssistantConfig({readDom:e=!0}={}){if(e){const t=this._getCams();this._config=this._normalizeConfig(Ga({root:this,baseConfig:this._config,cameras:t,themeDraftCache:this._themeDraftCache,themeMode:this._activeThemeModeKey(),hiddenTabsOverride:this._hiddenTabsDraft})),this._syncHiddenTabsDraftFromConfig(this._config)}return Dr(Pr(this._config,{themeDefaultColors:this._themeDefaultHexMap()}),{sourceConfig:this._config})}_markHomeAssistantDirty(e=null){const t=e||this._homeAssistantConfig();if(this._haDirtyBaselineConfig===void 0)return;const a=this._configSignature(t);if(this._hasConfigDraft=a!==this._haDirtyBaselineSig,this._syncConfigSaveReminder(),this._pendingHaDirtyConfig=t,this._seedHomeAssistantDirtyState(),!this._haDirtyStateContext){const i=this._findHomeAssistantEditCardDialog();typeof i?._updateDirtyState=="function"?i._updateDirtyState(t):this._dispatch(t),this._requestHomeAssistantDirtyStateContext()}}_u({dispatch:e=!1,preview:t=!1,previewRouteIntent:a=null}={}){if(!this._validateEditorFields())return;const i=this._configSignature(this._config),r=this._getCams(),o=this._landingPageOptionSignature(this._config),n=Ga({root:this,baseConfig:this._config,cameras:r,themeDraftCache:this._themeDraftCache,themeMode:this._activeThemeModeKey(),hiddenTabsOverride:this._hiddenTabsDraft}),s=this._normalizeConfig(n),d=this._configSignature(s)!==i,c=this._landingPageOptionSignature(s);this._config=s,this._syncHiddenTabsDraftFromConfig(s),t&&(d||a)&&(this._hasVisualDraft=!0,this._emitPreviewDraft(Ta(s),a)),a?.type===rt.revertStandaloneDraft&&(this._standaloneDraftPreviousLandingPage=null),o!==c&&this._render(),d&&this._markHomeAssistantDirty(this._homeAssistantConfig({readDom:!1})),e&&d&&this._dispatch()}_commitDraftToHomeAssistantDialog(){const e=this._homeAssistantConfig(),t=this._findHomeAssistantEditCardDialog();if(!t||!("_cardConfig"in t)){this._dispatch(e);return}this._lastDispatchedConfig=e,this._lastDispatchedConfigSig=this._configSignature(e),t._cardConfig=e,t._updateDirtyState?.(e)}_dispatch(e=this._homeAssistantConfig()){this._lastDispatchedConfig=e,this._lastDispatchedConfigSig=this._configSignature(e),this.dispatchEvent(new CustomEvent("config-changed",{detail:{config:e},bubbles:!0,composed:!0}))}},oi=`${qe}-editor`;customElements.get(oi)||customElements.define(oi,xo);
