/** FrigateView Card - generated file. Edit src/ instead. MIT license: frigate-view-card.LICENSE.txt. */
const er="1.1.5-dev.227",tr="2026.9.0",ie="FrigateView",Ae=`${ie} Card`,Ne="frigate-view-card",ut=ie,Ht="{Camera}",ce=5,he=5,Ao=24*3600,Ie=Object.freeze([2,5,10,15,30,60]),Me=60,Be=Object.freeze([10,20,30,60,120,300]),ar=5,je=Object.freeze([10,20,30,60]),We=Object.freeze([10,20,30,60]),Le=1e4,Fe=Object.freeze([10,20,30,60,120]),Te=1e4,Ge=Object.freeze([10,20,30,60]),Mo=Object.freeze({mouse:Object.freeze({leaveHideDelayMs:500})}),Lo=Object.freeze({mouse:Object.freeze({controlsHideMs:1e4,activeSlideshowAndTakeoverFadeStartMs:1e4,activeSlideshowAndTakeoverHideMs:1e4}),touch:Object.freeze({controlsHideMs:3e3,activeSlideshowAndTakeoverFadeStartMs:3e3,activeSlideshowAndTakeoverHideMs:5e3})}),ir=1e4,Ue=Object.freeze([5,10,20,30,60,120]),pe=12,B="frigate_go2rtc",Pe=["alerts","clips","snapshot","recordings","kept"],Ze=Object.freeze(["snapshot"]),me=Object.freeze(["light","dark"]),wa=Object.freeze({"--c-bg-main":"var(--card-background-color)","--c-bg-primary":"var(--primary-background-color)","--c-bg-panel":"var(--secondary-background-color)","--c-bg-tabs-holder":"var(--fvc-tabs-holder)","--c-bg-deep":"#111111","--c-bg-mobile":"var(--wa-color-neutral-fill-normal, var(--secondary-background-color))","--c-bg-mobile-list":"#f0f0f0","--c-bg-list":"#f0f0f0","--c-bg-cam-btn":"#f0f0f0","--c-text":"var(--primary-text-color)","--c-text2":"var(--secondary-text-color)","--c-text3":"var(--state-inactive-color)","--c-text4":"var(--disabled-text-color)","--c-text-rev":"var(--text-primary-color)","--c-border":"var(--secondary-background-color)","--c-border2":"var(--disabled-text-color)","--c-primary":"var(--primary-color)","--c-primary-l":"var(--light-primary-color)","--c-primary-d":"var(--dark-primary-color)","--c-accent":"var(--accent-color)","--c-on":"#4ade80","--c-off":"#FCA5A5","--c-bg-scrub":"#c2f2c1","--c-bg-detect":"var(--warning-color)","--c-bg-alert":"var(--error-color)"}),qt=Object.freeze([{key:"--c-bg-main",label:"Background Color"},{key:"--c-bg-primary",label:"Primary Background Color"},{key:"--c-bg-panel",label:"Secondary Background Color"},{key:"--c-bg-tabs-holder",label:"Navigation Tabs Background"},{key:"--c-bg-deep",label:"Video Background Color"},{key:"--c-bg-mobile",label:"Mobile Background Color"},{key:"--c-bg-mobile-list",label:"Mobile List Background Color"},{key:"--c-bg-list",label:"List Background Color"},{key:"--c-bg-cam-btn",label:"Camera Button Background Color"},{key:"--c-text",label:"Primary Text Color"},{key:"--c-text2",label:"Secondary Text Color"},{key:"--c-text3",label:"Third Text Color"},{key:"--c-text4",label:"Fourth Text Color"},{key:"--c-text-rev",label:"Reverse Text Color"},{key:"--c-border",label:"Border Color One"},{key:"--c-border2",label:"Border Color Two"},{key:"--c-primary",label:"Primary Color"},{key:"--c-primary-l",label:"Primary Light Color"},{key:"--c-primary-d",label:"Primary Dark Color"},{key:"--c-accent",label:"Accent Color"},{key:"--c-bg-scrub",label:"Scrub Bar Background"},{key:"--c-bg-detect",label:"Detection/Motion"},{key:"--c-bg-alert",label:"Alert/Review"}]),Ke=new Set(qt.map(e=>e.key)),D={packageCheck:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2 3 7v10l9 5 5.2-2.9-1.5-1.5-2.7 1.5v-6.2l6-3.3v4.9h2V7L12 2m0 2.3L18.6 8 12 11.7 5.4 8 12 4.3M5 9.7l6 3.3v6.1l-6-3.3V9.7m15.6 6.1 1.4 1.4-4.7 4.7-2.8-2.8 1.4-1.4 1.4 1.4 3.3-3.3Z"/></svg>',homeAssistant:'<svg fill="currentColor" viewBox="0 0 24 24"><path d="M21.8,13H20V21H13V17.67L15.79,14.88L16.5,15C17.66,15 18.6,14.06 18.6,12.9C18.6,11.74 17.66,10.8 16.5,10.8A2.1,2.1 0 0,0 14.4,12.9L14.5,13.61L13,15.13V9.65C13.66,9.29 14.1,8.6 14.1,7.8A2.1,2.1 0 0,0 12,5.7A2.1,2.1 0 0,0 9.9,7.8C9.9,8.6 10.34,9.29 11,9.65V15.13L9.5,13.61L9.6,12.9A2.1,2.1 0 0,0 7.5,10.8A2.1,2.1 0 0,0 5.4,12.9A2.1,2.1 0 0,0 7.5,15L8.21,14.88L11,17.67V21H4V13H2.25C1.83,13 1.42,13 1.42,12.79C1.43,12.57 1.85,12.15 2.28,11.72L11,3C11.33,2.67 11.67,2.33 12,2.33C12.33,2.33 12.67,2.67 13,3L17,7V6H19V9L21.78,11.78C22.18,12.18 22.59,12.59 22.6,12.8C22.6,13 22.2,13 21.8,13M7.5,12A0.9,0.9 0 0,1 8.4,12.9A0.9,0.9 0 0,1 7.5,13.8A0.9,0.9 0 0,1 6.6,12.9A0.9,0.9 0 0,1 7.5,12M16.5,12C17,12 17.4,12.4 17.4,12.9C17.4,13.4 17,13.8 16.5,13.8A0.9,0.9 0 0,1 15.6,12.9A0.9,0.9 0 0,1 16.5,12M12,6.9C12.5,6.9 12.9,7.3 12.9,7.8C12.9,8.3 12.5,8.7 12,8.7C11.5,8.7 11.1,8.3 11.1,7.8C11.1,7.3 11.5,6.9 12,6.9Z"/></svg>',frigate:'<svg viewBox="0 0 512 512" fill="currentColor"><path d="M130 446.5C131.6 459.3 145 468 137 470C129 472 94 406.5 86 378.5C78 350.5 73.5 319 75.5 301C77.4999 283 181 255 181 247.5C181 240 147.5 247 146 241C144.5 235 171.3 238.6 178.5 229C189.75 214 204 216.5 213 208.5C222 200.5 233 170 235 157C237 144 215 129 209 119C203 109 222 102 268 83C314 64 460 22 462 27C464 32 414 53 379 66C344 79 287 104 287 111C287 118 290 123.5 288 139.5C286 155.5 285.76 162.971 282 173.5C279.5 180.5 277 197 282 212C286 224 299 233 305 235C310 235.333 323.8 235.8 339 235C358 234 385 236 385 241C385 246 344 243 344 250C344 257 386 249 385 256C384 263 350 260 332 260C317.6 260 296.333 259.333 287 256L285 263C281.667 263 274.7 265 267.5 265C258.5 265 258 268 241.5 268C225 268 230 267 215 266C200 265 144 308 134 322C124 336 130 370 130 385.5C130 399.428 128 430.5 130 446.5Z"/></svg>',airplayVideo:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 22h12l-6-6-6 6M21 3H3c-1.11 0-2 .89-2 2v12c0 1.1.9 2 2 2h4v-2H3V5h18v12h-4v2h4c1.1 0 2-.9 2-2V5c0-1.11-.9-2-2-2Z"/></svg>',webrtc:'<svg fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C14.44 2 16.5 3.75 16.91 6.07L17.75 6C20.5 6 22.75 8.24 22.75 11C22.75 12.89 21.7 14.53 20.16 15.38C20.54 16.09 20.75 16.89 20.75 17.75C20.75 20.5 18.5 22.75 15.75 22.75C14.26 22.75 12.92 22.1 12 21.06C11.08 22.1 9.74 22.75 8.25 22.75C5.5 22.75 3.25 20.5 3.25 17.75C3.25 16.89 3.47 16.09 3.84 15.38C2.3 14.53 1.25 12.89 1.25 11C1.25 8.24 3.5 6 6.25 6L7.09 6.07C7.5 3.75 9.56 2 12 2M6.75 20.25L13.66 17H17C17.55 17 18 16.55 18 16V9C18 8.45 17.55 8 17 8H7C6.45 8 6 8.45 6 9V16C6 16.55 6.45 17 7 17H7.77L6.75 20.25Z" /></svg>',live:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M17 10.5V7a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-3.5l4 4v-11l-4 4z"/></svg>',recordings:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M18 4l2 4h-3l-2-4h-2l2 4h-3l-2-4H8l2 4H7L5 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4h-4z"/></svg>',clips:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-8 12.5v-9l6 4.5-6 4.5z"/></svg>',snapshot:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 15.2A3.2 3.2 0 0 1 8.8 12 3.2 3.2 0 0 1 12 8.8 3.2 3.2 0 0 1 15.2 12 3.2 3.2 0 0 1 12 15.2M20 4h-3.17L15 2H9L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2z"/></svg>',takeSnapshot:'<svg  fill="currentColor" viewBox="0 0 24 24"><path d="M3 4V1H5V4H8V6H5V9H3V6H0V4M6 10V7H9V4H16L17.8 6H21C22.1 6 23 6.9 23 8V20C23 21.1 22.1 22 21 22H5C3.9 22 3 21.1 3 20V10M13 19C17.45 19 19.69 13.62 16.54 10.46C13.39 7.31 8 9.55 8 14C8 16.76 10.24 19 13 19M9.8 14C9.8 16.85 13.25 18.28 15.26 16.26C17.28 14.25 15.85 10.8 13 10.8C11.24 10.8 9.8 12.24 9.8 14Z" /></svg>',filmstrip:'<svg fill="currentColor" viewBox="0 0 24 24"><path d="M18,9H16V7H18M18,13H16V11H18M18,17H16V15H18M8,9H6V7H8M8,13H6V11H8M8,17H6V15H8M18,3V5H16V3H8V5H6V3H4V21H6V19H8V21H16V19H18V21H20V3H18Z" /></svg>',movieOpen:'<svg fill="currentColor" viewBox="0 0 24 24"><path d="M20.84 2.18L16.91 2.96L19.65 6.5L21.62 6.1L20.84 2.18M13.97 3.54L12 3.93L14.75 7.46L16.71 7.07L13.97 3.54M9.07 4.5L7.1 4.91L9.85 8.44L11.81 8.05L9.07 4.5M4.16 5.5L3.18 5.69A2 2 0 0 0 1.61 8.04L2 10L6.9 9.03L4.16 5.5M2 10V20C2 21.11 2.9 22 4 22H20C21.11 22 22 21.11 22 20V10H2Z" /></svg>',alerts:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L4 5v6c0 5 3.4 9.7 8 11 4.6-1.3 8-6 8-11V5l-8-3zm-1 14l-4-4 1.4-1.4L11 13.2l5.6-5.6L18 9l-7 7z"/></svg>',clock:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z"/></svg>',pin:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>',close:'<svg fill="currentColor" viewBox="0 0 24 24"><path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" /></svg>',cameraAdd:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 4V1h2v3h3v2H5v3H3V6H0V4h3m5 6V7h3V4h5l1.8 2H21c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H5c-1.1 0-2-.9-2-2V10h5m5 9a5 5 0 1 0 0-10 5 5 0 0 0 0 10m0-2a3 3 0 1 1 0-6 3 3 0 0 1 0 6Z"/></svg>',lightAdd:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a7 7 0 0 0-4.15 12.63c.74.55 1.15 1.2 1.15 1.87V18h6v-1.5c0-.67.41-1.32 1.15-1.87A7 7 0 0 0 12 2m-2 18h4v2h-4v-2M21 7h-2V5h-2V3h2v2h2v2Z"/></svg>',gridExclude:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 13H5v-2h14v2Z"/></svg>',gridInclude:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2Z"/></svg>',back:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>',forward:'<svg fill="currentColor" viewBox="0 0 24 24"><path d="M4,11V13H16L10.5,18.5L11.92,19.92L19.84,12L11.92,4.08L10.5,5.5L16,11H4Z" /></svg>',left:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M15.41 7.41 14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg>',right:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="m8.59 16.59 1.41 1.41L16 12 10 6 8.59 7.41 13.17 12z"/></svg>',pipPopOut:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="m4.264 5.633-.594.804 8.555 6.321.594-.803z"/><path fill-rule="evenodd" d="m14.145 13.557-3.921.211 2.972-4.021z"/><path d="M3.68 2.867A3.185 3.185 0 0 0 .5 6.047v10.641a3.185 3.185 0 0 0 3.18 3.18h11.332A1.5 1.5 0 0 1 15 19.674v-.855H3.68a2.126 2.126 0 0 1-2.133-2.131V6.047A2.127 2.127 0 0 1 3.68 3.914h14.141a2.127 2.127 0 0 1 2.131 2.133V14H21V6.047a3.185 3.185 0 0 0-3.18-3.18z"/><path d="M16.75 14.75h5.325a1 1 0 0 1 1 1v4.174a1 1 0 0 1-1 1H16.75a1 1 0 0 1-1-1V15.75a1 1 0 0 1 1-1z"/></svg>',pipPopIn:'<svg fill="currentColor" viewBox="0 0 24 24" ><path d="m22.066 20.929 0.60193-0.79808-8.492-6.4054-0.60192 0.79708z"/><path d="m12.264 12.908 3.9229-0.17217-3.0117 3.9914z" fill-rule="evenodd"/><path d="M3.68 2.867A3.185 3.185 0 0 0 .5 6.047v10.641a3.185 3.185 0 0 0 3.18 3.18h11.332A1.5 1.5 0 0 1 15 19.674v-.855H3.68a2.126 2.126 0 0 1-2.133-2.131V6.047A2.127 2.127 0 0 1 3.68 3.914h14.141a2.127 2.127 0 0 1 2.131 2.133V14H21V6.047a3.185 3.185 0 0 0-3.18-3.18z"/><path d="m4.6157 6.3473h5.325a1 1 0 0 1 1 1v4.174a1 1 0 0 1-1 1h-5.325a1 1 0 0 1-1-1v-4.174a1 1 0 0 1 1-1z"/></svg>',play:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>',pause:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6zm8-14v14h4V5z"/></svg>',download:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg>',star:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>',starO:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>',bullseye:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2A10 10 0 0 0 2 12A10 10 0 0 0 12 22A10 10 0 0 0 22 12A10 10 0 0 0 12 2M12 4A8 8 0 0 1 20 12A8 8 0 0 1 12 20A8 8 0 0 1 4 12A8 8 0 0 1 12 4M12 6A6 6 0 0 0 6 12A6 6 0 0 0 12 18A6 6 0 0 0 18 12A6 6 0 0 0 12 6M12 8A4 4 0 0 1 16 12A4 4 0 0 1 12 16A4 4 0 0 1 8 12A4 4 0 0 1 12 8Z" /></svg>',ptz:'<svg  fill="currentColor" viewBox="0 0 24 24"><path d="M9,12C9,11.19 9.3,10.5 9.89,9.89C10.5,9.3 11.19,9 12,9C12.81,9 13.5,9.3 14.11,9.89C14.7,10.5 15,11.19 15,12C15,12.81 14.7,13.5 14.11,14.11C13.5,14.7 12.81,15 12,15C11.19,15 10.5,14.7 9.89,14.11C9.3,13.5 9,12.81 9,12M5.53,8.44L7.31,10.22L5.53,12L7.31,13.78L5.53,15.56L2,12L5.53,8.44M8.44,18.47L10.22,16.69L12,18.47L13.78,16.69L15.56,18.47L12,22L8.44,18.47M18.47,15.56L16.69,13.78L18.47,12L16.69,10.22L18.47,8.44L22,12L18.47,15.56M15.56,5.53L13.78,7.31L12,5.53L10.22,7.31L8.44,5.53L12,2L15.56,5.53Z" /></svg>',calendar:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 18H5V8h14v13z"/></svg>',filter:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M10 18h4v-2h-4v2zM3 6v2h18V6H3zm3 7h12v-2H6v2z"/></svg>',expand:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/></svg>',chevron:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6z"/></svg>',resize:'<svg fill="currentColor" viewBox="0 0 24 24" ><path d="m9.3946 2-7.3946 9.9502 7.3946 9.9497zm5.2109 0.1001v19.9l7.3946-9.9502z" style="stroke-width:0"/></svg>',rotate:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 6v3l4-4-4-4v3c-4.42 0-8 3.58-8 8 0 1.57.46 3.03 1.24 4.26L6.7 14.8A5.87 5.87 0 0 1 6 12c0-3.31 2.69-6 6-6zm6.76 1.74L17.3 9.2A5.87 5.87 0 0 1 18 12c0 3.31-2.69 6-6 6v-3l-4 4 4 4v-3c4.42 0 8-3.58 8-8 0-1.57-.46-3.03-1.24-4.26z"/></svg>',presentationPlay:'<svg viewBox="0 0 24 24" style="width:24px;height:24px"><path fill="currentColor" d="M2,3H22C23.1,3 24,3.9 24,5V17C24,18.1 23.1,19 22,19H16V21H8V19H2C0.9,19 0,18.1 0,17V5C0,3.9 0.9,3 2,3M2,5V17H22V5H2M10,8V14L16,11L10,8Z" /></svg>',presentationPlayActive:'<svg viewBox="0 0 24 24" style="width:24px;height:24px"><path fill="currentColor" d="M2,3H22C23.1,3 24,3.9 24,5V17C24,18.1 23.1,19 22,19H16V21H8V19H2C0.9,19 0,18.1 0,17V5C0,3.9 0.9,3 2,3M2,5V17H22V5H2M10,8V14L16,11L10,8Z" /></svg>',volOff:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M16.5 12A4.5 4.5 0 0 0 14 7.97v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/></svg>',volOn:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3A4.5 4.5 0 0 0 14 7.97v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>',grid:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 3v8h8V3H3zm6 6H5V5h4v4zm-6 4v8h8v-8H3zm6 6H5v-4h4v4zm4-16v8h8V3h-8zm6 6h-4V5h4v4zm-6 4v8h8v-8h-8zm6 6h-4v-4h4v4z"/></svg>',person:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>',divider:'<svg fill="currentColor" version="1.1" viewBox="0 0 8 24"><path d="m3.7826 3h0.43584c0.411 0 0.74108 0.33008 0.74108 0.74208v16.516c0 0.412-0.33008 0.74208-0.74108 0.74208h-0.43584c-0.411 0-0.74208-0.33008-0.74208-0.74208v-16.516c0-0.412 0.33108-0.74208 0.74208-0.74208z"/></svg>',singleView:'<svg fill="currentColor" viewBox="0 0 24 24"><path d="M6,2H18A2,2 0 0,1 20,4V20A2,2 0 0,1 18,22H6A2,2 0 0,1 4,20V4A2,2 0 0,1 6,2M6,4V8H18V4H6Z" /></svg>',cameraGroupSplit:'<svg fill="currentColor" viewBox="0 0 24 24"><path d="M3,4A2,2 0 0,1 5,2H19A2,2 0 0,1 21,4V20A2,2 0 0,1 19,22H5A2,2 0 0,1 3,20V4M5,4V20H11V4H5M13,4V20H19V4H13Z" /></svg>',list:'<svg fill="currentColor" viewBox="0 0 24 24"><path d="M9,5V9H21V5M9,19H21V15H9M9,14H21V10H9M4,9H8V5H4M4,19H8V15H4M4,14H8V10H4V14Z" /></svg>',preView:'<svg fill="currentColor" viewBox="0 0 24 24"><path d="m4 18c-0.554 0-1 0.446-1 1v1c0 0.554 0.446 1 1 1h16c0.554 0 1-0.446 1-1v-1c0-0.554-0.446-1-1-1zm0-5c-0.554 0-1 0.446-1 1v1c0 0.554 0.446 1 1 1h16c0.554 0 1-0.446 1-1v-1c0-0.554-0.446-1-1-1zm0-5c-0.554 0-1 0.446-1 1v1c0 0.554 0.446 1 1 1h16c0.554 0 1-0.446 1-1v-1c0-0.554-0.446-1-1-1zm0-5c-0.554 0-1 0.446-1 1v1c0 0.554 0.446 1 1 1h16c0.554 0 1-0.446 1-1v-1c0-0.554-0.446-1-1-1z" stroke-width:0"/></svg>',wideView:'<svg fill="currentColor" viewBox="0 0 24 24"><path d="M3,3H11V5H3V3M13,3H21V5H13V3M3,7H11V9H3V7M13,7H21V9H13V7M3,11H11V13H3V11M13,11H21V13H13V11M3,15H11V17H3V15M13,15H21V17H13V15M3,19H11V21H3V19M13,19H21V21H13V19Z" /></svg>',mobileView:'<svg fill="currentColor" viewBox="0 0 24 24"><path d="M17,19H7V5H17M17,1H7C5.89,1 5,1.89 5,3V21A2,2 0 0,0 7,23H17A2,2 0 0,0 19,21V3C19,1.89 18.1,1 17,1Z" /></svg>',cardView:'<svg fill="currentColor" viewBox="0 0 24 24"><path d="m3 3h18c1.1046 0 2 0.89543 2 2v14c0 1.1046-0.89543 2-2 2h-18c-1.1046 0-2-0.89543-2-2v-14c0-1.1046 0.89543-2 2-2m0 2v8h18v-8h-18m0 10v4h8v-4h-8m8 0v4h10v-4z"/></svg>',micOn:'<svg fill="currentColor" viewBox="0 0 24 24"><path d="M12,2A3,3 0 0,1 15,5V11A3,3 0 0,1 12,14A3,3 0 0,1 9,11V5A3,3 0 0,1 12,2M19,11C19,14.53 16.39,17.44 13,17.93V21H11V17.93C7.61,17.44 5,14.53 5,11H7A5,5 0 0,0 12,16A5,5 0 0,0 17,11H19Z" /></svg>',micOff:'<svg fill="currentColor" viewBox="0 0 24 24"><path d="M19,11C19,12.19 18.66,13.3 18.1,14.28L16.87,13.05C17.14,12.43 17.3,11.74 17.3,11H19M15,11.16L9,5.18V5A3,3 0 0,1 12,2A3,3 0 0,1 15,5V11L15,11.16M4.27,3L21,19.73L19.73,21L15.54,16.81C14.77,17.27 13.91,17.58 13,17.72V21H11V17.72C7.72,17.23 5,14.41 5,11H6.7C6.7,14 9.24,16.1 12,16.1C12.81,16.1 13.6,15.91 14.31,15.58L12.65,13.92L12,14A3,3 0 0,1 9,11V10.28L3,4.27L4.27,3Z" /></svg>',fvcBrandLogo:'<svg version="1.1" viewBox="0 0 800 140"><path class="fvc-brand-logo-accent" d="m495.84 4.002 34.867 97.625h7.3887l-34.865-97.625zm-343.18 2e-3v12.553h19.525v-12.553zm484.87 19.52c-24.687 0-39.328 13.808-39.328 39.748 0 24.824 13.807 39.748 39.328 39.748 21.896 0 35.984-10.879 38.912-31.52h-6.9727c-2.3726 16.877-12.972 24.547-31.939 24.547-22.314 0-32.354-10.88-32.354-32.775h71.684c0-25.94-14.645-39.748-39.33-39.748zm34.859 1.3945 22.592 76.707h6.9727l-22.592-76.707zm59.828 0 23.291 76.707h6.9727l-23.291-76.707zm-147.12 2e-3v76.707h6.9727v-76.707zm52.438 5.5781c19.665 0 30.124 8.228 32.076 26.498l-64.15-2e-3c1.9523-18.268 12.41-26.496 32.074-26.496z"/><path d="m372.71 4v20.922h-10.041v16.734h10.041v32.775c8e-4 21.755 12.691 27.191 25.102 27.191h23.988v-18.129h-19.664c-5.2991 0-9.9024-2.0927-9.9024-9.6231v-32.217h29.566v-16.736h-29.566v-20.918zm-362.71 0.0038736v97.623h20.918v-40.445h57.182v-18.131h-57.182v-20.92h57.18v-18.127zm562.96 0-34.867 97.623h7.3906l34.867-97.623zm12.123 0v6.2734h6.9726v-6.2734zm-365.77 19.52c-26.916 0-40.164 13.808-40.164 39.75 0 24.822 12.274 39.744 40.164 39.744 13.668 0 21.617-3.624 26.219-10.459v7.6699c0 11.297-7.3897 19.387-23.291 19.387-7.3909 0-14.084-2.9298-18.547-11.297h-21.061c4.1835 21.198 21.06 30.123 39.607 30.123 24.547 0 42.816-14.922 42.816-33.051v-80.473h-19.525v8.9277c-4.4624-6.6936-12.411-10.322-26.219-10.322zm92.596 0c-26.918 0-40.166 13.808-40.166 39.748 0 24.824 12.274 39.748 40.166 39.748 13.668 0 21.615-3.6259 26.219-10.459v9.0644h19.523v-76.707h-19.525v8.9277c-4.4624-6.6936-12.409-10.322-26.217-10.322zm155.07 0c-26.918 0-42.955 13.808-42.955 39.748 0 24.824 15.063 39.748 42.955 39.748 22.732 0 37.795-10.043 41.978-28.869h-21.061c-3.4863 6.6917-10.736 10.043-20.918 10.043-14.085 0-22.175-6.6967-23.291-17.994h66.246v-2.9277c0-24.824-15.063-39.748-42.955-39.748zm-374.15 1.3945 2e-3 76.707h19.523v-36.541c0-11.993 10.737-23.43 28.73-23.43h8.6465v-16.734h-8.6465c-13.389 0-23.011 3.7654-28.73 13.248v-13.25zm59.828 0.0019v76.707h19.523v-76.707zm572.58 0-23.291 76.705h6.9726l23.295-76.705zm59.832 0-22.596 76.705h6.9726l22.596-76.705zm-562.97 17.432c15.202 0 23.43 7.8096 23.43 20.922 0 13.666-8.6459 20.918-23.43 20.918-15.2 0-23.43-7.8096-23.43-20.92 0-13.666 8.6479-20.92 23.43-20.92zm92.596 0c15.202 0 23.43 7.8096 23.43 20.922 0 13.666-8.6459 20.918-23.43 20.918-15.202 0-23.43-7.8096-23.43-20.92 0-13.666 8.6479-20.92 23.43-20.92zm152.28 0c10.182 0 17.154 3.4872 20.779 9.625h-41.561c3.6257-6.2772 10.88-9.625 20.781-9.625z" style="fill:currentColor"/></svg>'},u=Object.freeze({singleView:"single-view",mobileView:"mobile-view",preview:"preview",wideView:"wide-view",cardView:"card-view"}),b=Object.freeze({mobile:u.mobileView,card:u.cardView,previewMobile:"preview-mobile-view",previewCard:"preview-card-view",previewSingle:"preview-single-view",single:u.singleView}),C=Object.freeze({dashboardWide:"dashboard-wide",insideCard:"inside-card",landingDashboard:"landing-dashboard",none:"none"}),V=Object.freeze({mobile:"mobile",tablet:"tablet",desktop:"desktop"}),ya=Object.freeze([u.singleView,u.mobileView,u.preview,u.wideView,u.cardView]),Rt=Object.freeze([u.preview,u.singleView,u.mobileView,u.wideView,u.cardView]),Nt=Object.freeze([u.preview,u.singleView,u.mobileView,u.cardView]),rr=new Set(ya),or=new Set(Object.values(b)),sr=new Set(Object.values(C)),re=e=>{const t=String(e||"").trim().toLowerCase();return t==="normal"||t==="single"?u.singleView:t==="mobile"||t==="mobile_view"?u.mobileView:t==="wide"||t==="wide_view"?u.wideView:t==="card"||t==="card_view"?u.cardView:t==="preview"?u.preview:rr.has(t)?t:u.singleView},Ye=e=>{const t=String(e||"").trim().toLowerCase().replace(/[_+\s]+/g,"-");return t==="preview"?b.previewSingle:t==="preview-mobile"?b.previewMobile:t==="preview-card"||t===b.previewCard?b.card:t==="preview-single"?b.previewSingle:t==="mobile"||t==="mobile-view"?b.mobile:t==="card"||t==="card-view"?b.card:t==="single"||t==="single-view"?b.single:or.has(t)?t:b.single},Xe=e=>{const t=String(e||"").trim().toLowerCase().replace(/[_+\s]+/g,"-");return t==="preview-dashboard"?C.landingDashboard:sr.has(t)?t:C.dashboardWide},De=(e,t)=>t===u.singleView?!0:t===u.mobileView?e?.mobile_view_page_enabled!==!1:t===u.preview?e?.preview_page_enabled===!0:t===u.wideView?e?.wide_view_page_enabled===!0:t===u.cardView?e?.card_view_page_enabled===!0:!1,nr=(e,t)=>e===u.wideView?t!==V.mobile:!0,oe=(e,t)=>e?.card_view_page_enabled===!0&&e?.card_view_standalone===!0?[u.cardView]:ya.filter(a=>De(e,a)&&nr(a,t)),lr=()=>[b.mobile,b.card,b.previewMobile,b.previewSingle,b.single],It=e=>lr().filter(t=>t===b.mobile?De(e,u.mobileView):t===b.card?De(e,u.cardView):t===b.previewMobile?De(e,u.preview)&&De(e,u.mobileView):t===b.previewSingle?De(e,u.preview):t===b.single),xa=(e,t)=>{const a=Ye(t);return It(e).includes(a)?a:b.single},dr=e=>{const t=Ye(e);return t===b.previewMobile||t===b.previewSingle?u.preview:t},Ve=e=>{if(e?.card_view_page_enabled===!0&&e?.card_view_standalone===!0)return u.cardView;const t=xa(e,e?.mobile_page);return t===b.mobile||t===b.previewMobile?u.mobileView:t===b.card?u.cardView:u.singleView},cr=(e,t)=>e?.card_view_page_enabled===!0&&e?.card_view_standalone===!0?u.cardView:t===V.mobile?dr(e?.mobile_page):re(e?.landing_page),Sa=(e,t,a)=>{const i=cr(e,t);return a.includes(i)?i:a[0]||u.singleView},Ca=(e,t=V.desktop)=>{const a=oe(e,t),i=Sa(e,t,a),r=new Set([i]);return a.includes(u.preview)&&r.add(u.preview),Rt.filter(o=>r.has(o))},_t=(e,t=V.desktop)=>{const a=oe(e,t),i=Sa(e,t,a),r=Array.isArray(e?.ha_dashboard_swipe_pages)?e.ha_dashboard_swipe_pages:Ca(e,t),o=new Set(r.map(n=>String(n||"").trim().toLowerCase()).filter(n=>a.includes(n)));return o.add(i),Rt.filter(n=>o.has(n))},ka=e=>{const t=oe(e,V.mobile),a=Ve(e),i=new Set([a]);return t.includes(u.preview)&&i.add(u.preview),Nt.filter(r=>t.includes(r)&&i.has(r))},vt=e=>{const t=oe(e,V.mobile),a=Ve(e),i=Array.isArray(e?.ha_dashboard_swipe_mobile_pages)?e.ha_dashboard_swipe_mobile_pages:ka(e),r=new Set(i.map(o=>String(o||"").trim().toLowerCase()).filter(o=>t.includes(o)));return t.includes(a)&&r.add(a),Nt.filter(o=>r.has(o))},gt=50,bt=100,Bt=100,Ea="%",Je=e=>{if(e==null||String(e).trim()==="")return Bt;const t=Number(e);return Number.isFinite(t)?Math.min(bt,Math.max(gt,Math.round(t))):Bt},Qe=e=>{const t=String(e||"").trim().toLowerCase();return t==="vh"||t==="dvh"?"dvh":Ea},hr=Object.freeze(["light","dark","both"]),Aa=e=>String(e||"").trim().toLowerCase()==="dark"?"dark":"light",jt=(e,t="light")=>{const a=String(e||"").trim().toLowerCase();return hr.includes(a)?a:Aa(t)},pr=(e,t="light")=>{const a=jt(e,t);return a==="both"?[...me]:[a]},mr=e=>{const t=Array.isArray(e)?e:[e],a=new Set;return t.forEach(i=>{const r=String(i||"").trim().toLowerCase();r==="both"?me.forEach(o=>a.add(o)):me.includes(r)&&a.add(r)}),me.filter(i=>a.has(i))},Ma=e=>Object.fromEntries(Object.entries(e&&typeof e=="object"?e:{}).filter(([a])=>Ke.has(a)).map(([a,i])=>{const r=String(i||"").trim().toLowerCase();return/^#[0-9a-f]{6}$/.test(r)?[a,r]:/^#[0-9a-f]{3}$/.test(r)?[a,`#${r[1]}${r[1]}${r[2]}${r[2]}${r[3]}${r[3]}`]:[a,""]}).filter(([,a])=>!!a)),ft=e=>{if(!Array.isArray(e))return[];const[t]=e.map(a=>{if(!a||typeof a!="object")return null;const i=mr(a.modes);return i.length?{modes:i,overrides:Ma(a.overrides)}:null}).filter(Boolean);return t?[t]:[]},ur=({scope:e,overrides:t,fallbackMode:a="light"}={})=>[{modes:pr(e,a),overrides:Ma(t)}],Wt=(e,t="light")=>{const a=Aa(t),i=ft(e);if(!i.length)return{scope:a,overrides:{}};const[{modes:r,overrides:o}]=i;return{scope:r.length===2?"both":r[0],overrides:{...o}}},wt=25,yt=75,Ft=60,La=Object.freeze([1,6,12,24]),Ta=12,xt=e=>{if(e==null||String(e).trim()==="")return Ft;const t=Number(e);return Number.isFinite(t)?Math.min(yt,Math.max(wt,Math.round(t))):Ft},St=e=>{const t=Number(e);return La.includes(t)?t:Ta},ye=Object.freeze({sideBySide:"side_by_side",stacked:"stacked"}),et=e=>e===ye.stacked?ye.stacked:ye.sideBySide,tt=(e,{primaryEntity:t=""}={})=>{if(!e||typeof e!="object"||Array.isArray(e))return null;const a=String(e.secondary_entity||e.secondaryEntity||"").trim(),i=String(t||"").trim();return!a||a===i?null:{secondary_entity:a,layout:et(e.layout)}},Pa=e=>tt(e?.group,{primaryEntity:e?.entity})?.secondary_entity||"",Gt=e=>!!Pa(e),Da=e=>{let t=Math.max(0,Math.floor(Number(e)||0)),a="";do a=String.fromCharCode(65+t%26)+a,t=Math.floor(t/26)-1;while(t>=0);return a},_r=(e=0)=>{const a=Math.max(0,Math.floor(Number(e)||0))*2;return`Group ${Da(a)}/${Da(a+1)}`},vr=(e,{excludeIndex:t=-1}={})=>{const a=new Set((Array.isArray(e)?e:[]).map((i,r)=>r===t||!Gt(i)?"":String(i?.name||"").trim().toLowerCase()).filter(Boolean));for(let i=0;;i+=1){const r=_r(i);if(!a.has(r.toLowerCase()))return r}},at=e=>{const t=String(e?.entity||"").trim(),a=Pa(e);return[t,a].filter(Boolean)},gr=e=>at(e).length,Ut=e=>(Array.isArray(e)?e:[]).reduce((t,a)=>t+gr(a),0),Zt=(e,t)=>{const a=Math.max(0,Number(t)||0),i=[];let r=0;for(const o of Array.isArray(e)?e:[]){const n=String(o?.entity||"").trim();if(!n||r>=a)continue;const s=tt(o?.group,{primaryEntity:n});if(s&&r+2<=a){i.push({...o,group:s}),r+=2;continue}const{group:d,...c}=o;i.push(c),r+=1}return i},br=(e,t=0)=>{const a=t===1?1:0,i=at(e),r=i[a]||i[0]||"",o=i.length>1,n={...e,entity:r,group:void 0,group_parent_entity:o?i[0]:"",group_member:o?a===0?"A":"B":"",group_member_index:o?a:0,group_layout:o?et(e?.group?.layout):""};return a===1&&(n.ptz=null,delete n.two_way_talk),n},Va=e=>(Array.isArray(e)?e:[]).flatMap((t,a)=>at(t).map((i,r)=>({...br(t,r),logical_camera_index:a}))),W=Object.freeze({default:"default",custom:"custom"}),za=(e,t)=>{const a=new Set;return(Array.isArray(e)?e:[]).map(i=>String(i||"").trim()).filter(i=>!i||!t.has(i)||a.has(i)?!1:(a.add(i),!0))},ue=(e,t=[])=>{const i=Va(t).map(p=>String(p?.entity||"").trim()).filter(Boolean),r=new Set(i),o=e&&typeof e=="object"&&!Array.isArray(e)?e:{},n=o.mode===W.custom?W.custom:W.default,s=za(o.included,r),d=new Set(s),c=za(o.excluded,r).filter(p=>!d.has(p)),h=new Set([...s,...c]);for(const p of i)h.has(p)||(s.push(p),h.add(p));return{mode:n,included:s,excluded:c}},it=Object.freeze({live:"live",grid:"grid",slideshow:"slideshow"}),fr=new Set(Object.values(it)),se=e=>{const t=String(e||"").trim().toLowerCase();return fr.has(t)?t:it.live},wr=({gridEnabled:e=!1,slideshowEnabled:t=!1}={})=>[{value:it.live,label:"Live",disabled:!1,disabledReason:""},{value:it.grid,label:"Grid",disabled:e!==!0,disabledReason:"Enable Grid Mode in Grid Mode Settings to use this option."},{value:it.slideshow,label:"Slideshow",disabled:t!==!0,disabledReason:"Enable Slideshow Mode in Slideshow Settings to use this option."}],A=Object.freeze({alerts:"alerts",clips:"clips",snapshots:"snapshots",recordings:"recordings",favorites:"kept"}),To=Object.freeze([A.alerts,A.clips,A.snapshots,A.recordings,A.favorites]),Po=Object.freeze({[A.alerts]:"alerts",[A.clips]:"clips",[A.snapshots]:"snapshot",[A.recordings]:"recordings",[A.favorites]:"kept"}),X=Object.freeze({videoOnly:"video-only",bottomPanelOpen:"bottom-panel-open",bottomPanelClosed:"bottom-panel-closed"}),Do=Object.freeze({[X.videoOnly]:6,[X.bottomPanelOpen]:8,[X.bottomPanelClosed]:7}),Kt=se,yr=new Set(Object.values(X)),rt=(e,{legacyDrawerDefaultOpen:t,legacyVideoPanelOnly:a}={})=>{const i=String(e||"").trim().toLowerCase().replace(/[_\s]+/g,"-");return yr.has(i)?i:a===!0?X.videoOnly:t===!1?X.bottomPanelClosed:X.bottomPanelOpen},Vo=Object.freeze({alert:A.alerts,alerts:A.alerts,clip:A.clips,clips:A.clips,snapshot:A.snapshots,snapshots:A.snapshots,recording:A.recordings,recordings:A.recordings,favorite:A.favorites,favorites:A.favorites,kept:A.favorites}),Oa=e=>({title:e.title,subtitle:e.subtitle,display_title:e.display_title,display_subtitle:e.display_subtitle,display_logo:e.display_logo,display_version:e.display_version,cameras:Array.isArray(e.cameras)?e.cameras.map(t=>({...t,...t?.group?{group:{...t.group}}:{},...Array.isArray(t?.linked_entities)?{linked_entities:t.linked_entities.map(a=>({...a}))}:{}})):[],event_days:e.event_days,alerts_reviews_days:e.alerts_reviews_days,realtime_poll_seconds:e.realtime_poll_seconds,snapshot_update_seconds:e.snapshot_update_seconds,mobile_poll_battery_saver:e.mobile_poll_battery_saver,event_pre_post_roll_enabled:e.event_pre_post_roll_enabled,favorites_mixed_cameras:e.favorites_mixed_cameras,slideshow_rotation_enabled:e.slideshow_rotation_enabled,slideshow_rotation_seconds:e.slideshow_rotation_seconds,slideshow_alert_hold_seconds:e.slideshow_alert_hold_seconds,grid_mode_enabled:e.grid_mode_enabled,grid_order:ue(e.grid_order,e.cameras),grid_live_view_enabled:e.grid_live_view_enabled,grid_alert_hold_seconds:e.grid_alert_hold_seconds,mobile_view_page_enabled:e.mobile_view_page_enabled!==!1,mobile_view_rotate_to_fullscreen:e.mobile_view_rotate_to_fullscreen,mobile_view_dashboard_background:e.mobile_view_dashboard_background!==!1,mobile_view_outer_border:e.mobile_view_outer_border,mobile_view_ha_navbar_bottom:e.mobile_view_ha_navbar_bottom,mobile_view_ha_navbar_stack_tabs:e.mobile_view_ha_navbar_stack_tabs,mobile_view_ha_navbar_dashboard:e.mobile_view_ha_navbar_dashboard,ha_dashboard_swipe_navigation_owner:e.ha_dashboard_swipe_navigation_owner,ha_dashboard_swipe_navigation:Xe(e.ha_dashboard_swipe_navigation),ha_dashboard_swipe_include_other_cards:e.ha_dashboard_swipe_include_other_cards,ha_dashboard_swipe_include_subviews:e.ha_dashboard_swipe_include_subviews,ha_dashboard_swipe_mouse_enabled:e.ha_dashboard_swipe_mouse_enabled,ha_dashboard_swipe_pages:Array.isArray(e.ha_dashboard_swipe_pages)?[...e.ha_dashboard_swipe_pages]:void 0,ha_dashboard_swipe_mobile_pages:Array.isArray(e.ha_dashboard_swipe_mobile_pages)?[...e.ha_dashboard_swipe_mobile_pages]:void 0,preview_page_enabled:e.preview_page_enabled,preview_page_live_cameras:e.preview_page_live_cameras,preview_page_live_cameras_mobile:e.preview_page_live_cameras_mobile,preview_page_alert_live_duration_seconds:e.preview_page_alert_live_duration_seconds,preview_page_show_title_bars:e.preview_page_show_title_bars,single_view_alert_takeover:e.single_view_alert_takeover,single_view_start_mode:se(e.single_view_start_mode),wide_view_page_enabled:e.wide_view_page_enabled,wide_view_live_cameras:e.wide_view_live_cameras,wide_view_alert_takeover:e.wide_view_alert_takeover,wide_view_start_mode:se(e.wide_view_start_mode),wide_view_timeline_enabled:e.wide_view_timeline_enabled,wide_view_timeline_default_open:e.wide_view_timeline_default_open,wide_view_timeline_default_scale:e.wide_view_timeline_default_scale,card_view_page_enabled:e.card_view_page_enabled,card_view_alert_takeover:e.card_view_alert_takeover,card_view_standalone:e.card_view_standalone,card_view_media_drawer_enabled:e.card_view_media_drawer_enabled,card_view_start_mode:e.card_view_start_mode,card_view_view_mode:rt(e.card_view_view_mode,{legacyDrawerDefaultOpen:e.card_view_drawer_default_open,legacyVideoPanelOnly:e.card_view_video_panel_only}),card_view_hide_camera_name:e.card_view_hide_camera_name,landing_page:e.landing_page,mobile_page:e.mobile_page,grid_rotation_seconds:e.grid_rotation_seconds,hidden_tabs:e.hidden_tabs,theme:e.theme,theme_custom:ft(e.theme_custom),theme_custom_defaults:Lt(e.theme_custom_defaults),stream_height:e.stream_height,stream_height_unit:e.stream_height_unit,tight_margins:e.tight_margins,shadows:e.shadows,borders:e.borders,rounded_corners:e.rounded_corners,outer_shadows:e.outer_shadows,col_left_width_pct:e.col_left_width_pct,video_defaults:e.video_defaults,video_live_defaults:e.video_live_defaults,video_popup_defaults:e.video_popup_defaults,video_recording_defaults:e.video_recording_defaults}),$a=.2,zo=Object.freeze(new Set(["up","right","down","left"])),Oo=Object.freeze(["up","right","down","left"]),Ha=Object.freeze([0,90,180,270]),$o=Object.freeze({frigateContinuous:"frigate_continuous"}),Ho=Object.freeze({"focus-in":Object.freeze({action:"focus",argument:"in"}),"focus-out":Object.freeze({action:"focus",argument:"out"})}),qo=Object.freeze({"zoom-in":$a,"zoom-out":-$a}),Yt=e=>{const t=Number(e);return Ha.includes(t)?t:0},ot=e=>{if(e!==!0&&(!e||typeof e!="object"))return null;const t=e===!0?{enabled:!0}:e;if(t.enabled===!1)return null;const a=Yt(t.rotation);return{enabled:!0,...a?{rotation:a}:{}}},Ct=e=>ot(e?.ptz)?.enabled===!0,xr=e=>Array.isArray(e?.features)&&(e.features.includes("pt")||e.features.includes("pt-r")),Sr="{camera}",ne=24,q=(e,t=ne)=>String(e??"").replace(/[\u0000-\u001F\u007F]/g,"").slice(0,Math.max(0,Number(t)||0)),Cr=e=>String(e||"").trim().toLowerCase()===Sr,kr=2,Er="light",le=Object.freeze({left:"left",right:"right"}),Ar=e=>String(e||"").trim(),Mr=e=>String(e||"").trim(),Xt=e=>String(e||"").trim().toLowerCase()===le.left?le.left:le.right,Lr=e=>{if(!e||typeof e!="object"||Array.isArray(e))return null;const t=Ar(e.entity||e.entity_id);if(!t.startsWith(`${Er}.`))return null;const a=Mr(e.icon),i=Xt(e.position);return{entity:t,...a?{icon:a}:{},...i===le.left?{position:i}:{}}},kt=e=>{const t=Array.isArray(e)?e:e?[e]:[],a=new Set;return t.map(Lr).filter(Boolean).filter(({entity:i})=>a.has(i)?!1:(a.add(i),!0)).slice(0,kr)},qa=e=>kt(e?.linked_entities),Ra=(e,t)=>{const a=parseInt(String(e??"").trim(),10);return Number.isFinite(a)&&a>0?a:t},Na=e=>{const t=String(e||"").trim().toLowerCase();return/^#[0-9a-f]{6}$/.test(t)?t:/^#[0-9a-f]{3}$/.test(t)?`#${t[1]}${t[1]}${t[2]}${t[2]}${t[3]}${t[3]}`:""},Tr=e=>{const t=String(e??"").trim().toLowerCase();return t==="ha_direct"||t==="ha"||t==="home_assistant"?"ha_direct":B},Pr=e=>String(e??"").trim().toLowerCase()==="all_reviews"?"all_reviews":"alerts_only",Dr=(e,{fallbackName:t=null}={})=>{if(typeof e=="string")return{entity:e,name:t==null?null:q(t).trim(),connection_type:B,alerts_content:"alerts_only",ptz:null};if(e&&typeof e=="object"){const a=e.entity||e.camera_entity||null,i=e.name||t,r=tt(e.group,{primaryEntity:a}),o=kt(e.linked_entities);return{entity:a,name:i==null?null:q(i).trim(),connection_type:Tr(e.connection_type),alerts_content:Pr(e.alerts_content),ptz:ot(e.ptz),...e.two_way_talk===!0?{two_way_talk:!0}:{},...r?{group:r}:{},...o.length?{linked_entities:o}:{}}}return{entity:null,name:t==null?null:q(t).trim(),connection_type:B,alerts_content:"alerts_only",ptz:null}},Vr=(e,t,a)=>{const i=String(a||"").trim();i&&(e[t]=i)},_=(e,t,a,i)=>{a!==i&&(e[t]=a)},Et=e=>{if(!e||typeof e!="object"||Array.isArray(e)||!Object.keys(e).length)return null;try{return JSON.parse(JSON.stringify(e))}catch{return{...e}}},zr=e=>{const t=ot(e);return t?{...t}:null},Or=e=>{const t=Dr(e,{fallbackName:""});if(!t.entity)return null;const a={entity:t.entity};Vr(a,"name",t.name),t.connection_type!==B&&(a.connection_type=t.connection_type),t.alerts_content!=="alerts_only"&&(a.alerts_content=t.alerts_content);const i=zr(t.ptz);return i&&(a.ptz=i),t.two_way_talk===!0&&(a.two_way_talk=!0),t.group&&(a.group={...t.group}),t.linked_entities?.length&&(a.linked_entities=t.linked_entities.map(r=>({...r}))),a},$r=(e,{themeDefaultColors:t={}}={})=>{const a=e&&typeof e=="object"?e:{},i={},r=Array.isArray(a.cameras)?a.cameras.map(Or).filter(Boolean):[];r.length&&(i.cameras=r);const o=q(a.title).trim();o&&o!==ut&&(i.title=o);const n=q(a.subtitle).trim();n&&!Cr(n)&&(i.subtitle=n),_(i,"display_title",a.display_title!==!1,!0),_(i,"display_subtitle",a.display_subtitle!==!1,!0),_(i,"display_logo",a.display_logo!==!1,!0),_(i,"display_version",a.display_version!==!1,!0);const s=Ra(a.event_days,ce);_(i,"event_days",s,ce);const d=Ra(a.alerts_reviews_days,he);_(i,"alerts_reviews_days",d,he);const c=Ie.includes(Number(a.realtime_poll_seconds))?Number(a.realtime_poll_seconds):5;_(i,"realtime_poll_seconds",c,5);const h=z(a.snapshot_update_seconds,Be,Me);_(i,"snapshot_update_seconds",h,Me),_(i,"mobile_poll_battery_saver",a.mobile_poll_battery_saver===!0,!1),_(i,"event_pre_post_roll_enabled",a.event_pre_post_roll_enabled===!0,!1),_(i,"favorites_mixed_cameras",a.favorites_mixed_cameras!==!1,!0),_(i,"slideshow_rotation_enabled",a.slideshow_rotation_enabled===!0,!1);const p=je.includes(Number(a.slideshow_rotation_seconds))?Number(a.slideshow_rotation_seconds):30;_(i,"slideshow_rotation_seconds",p,30);const g=z(a.slideshow_alert_hold_seconds,Fe,Math.round(Le/1e3));_(i,"slideshow_alert_hold_seconds",g,Math.round(Le/1e3)),_(i,"grid_mode_enabled",a.grid_mode_enabled===!0,!1),_(i,"grid_start_in_grid_enabled",a.grid_start_in_grid_enabled===!0,!1),_(i,"grid_live_view_enabled",a.grid_live_view_enabled!==!1,!0);const k=ue(a.grid_order,a.cameras);k.mode===W.custom&&(i.grid_order={mode:W.custom,included:[...k.included],excluded:[...k.excluded]}),_(i,"mobile_view_page_enabled",a.mobile_view_page_enabled!==!1,!0),_(i,"mobile_view_rotate_to_fullscreen",a.mobile_view_rotate_to_fullscreen===!0,!1),_(i,"mobile_view_dashboard_background",a.mobile_view_dashboard_background!==!1,!0),_(i,"mobile_view_outer_border",a.mobile_view_outer_border===!0,!1),_(i,"mobile_view_ha_navbar_bottom",a.mobile_view_ha_navbar_bottom===!0,!1),_(i,"mobile_view_ha_navbar_stack_tabs",a.mobile_view_ha_navbar_stack_tabs===!0,!1),_(i,"mobile_view_ha_navbar_dashboard",a.mobile_view_ha_navbar_dashboard===!0,!1);const f=a.ha_dashboard_swipe_navigation_owner===!0;if(_(i,"ha_dashboard_swipe_navigation_owner",f,!1),f){const M=Xe(a.ha_dashboard_swipe_navigation);if(_(i,"ha_dashboard_swipe_navigation",M,C.dashboardWide),M===C.insideCard&&_(i,"ha_dashboard_swipe_include_other_cards",a.ha_dashboard_swipe_include_other_cards===!0,!1),M===C.dashboardWide||M===C.insideCard){const U=_t(a,V.desktop),Q=Ca(a,V.desktop);(U.length!==Q.length||U.some((K,F)=>K!==Q[F]))&&(i.ha_dashboard_swipe_pages=[...U]);const Z=vt(a),P=ka(a);(Z.length!==P.length||Z.some((K,F)=>K!==P[F]))&&(i.ha_dashboard_swipe_mobile_pages=[...Z])}(M===C.dashboardWide||M===C.landingDashboard)&&_(i,"ha_dashboard_swipe_include_subviews",a.ha_dashboard_swipe_include_subviews===!0,!1),_(i,"ha_dashboard_swipe_mouse_enabled",a.ha_dashboard_swipe_mouse_enabled===!0,!1)}_(i,"preview_page_enabled",a.preview_page_enabled===!0,!1),_(i,"preview_page_live_cameras",a.preview_page_live_cameras===!0,!1),_(i,"preview_page_live_cameras_mobile",a.preview_page_live_cameras_mobile===!0,!1),_(i,"preview_page_show_title_bars",a.preview_page_show_title_bars!==!1,!0),_(i,"single_view_alert_takeover",a.single_view_alert_takeover===!0,!1),_(i,"single_view_start_mode",se(a.single_view_start_mode),"live"),_(i,"wide_view_page_enabled",a.wide_view_page_enabled===!0,!1),_(i,"wide_view_live_cameras",a.wide_view_live_cameras===!0,!1),_(i,"wide_view_alert_takeover",a.wide_view_alert_takeover===!0,!1),_(i,"wide_view_start_mode",se(a.wide_view_start_mode),"live"),_(i,"wide_view_timeline_enabled",a.wide_view_timeline_enabled===!0,!1),_(i,"wide_view_timeline_default_open",a.wide_view_timeline_default_open===!0,!1),_(i,"wide_view_timeline_default_scale",St(a.wide_view_timeline_default_scale),Ta),_(i,"card_view_page_enabled",a.card_view_page_enabled===!0,!1),_(i,"card_view_alert_takeover",a.card_view_alert_takeover===!0,!1),_(i,"card_view_standalone",a.card_view_page_enabled===!0&&a.card_view_standalone===!0,!1),_(i,"card_view_media_drawer_enabled",a.card_view_media_drawer_enabled!==!1,!0),_(i,"card_view_start_mode",Kt(a.card_view_start_mode),"live"),_(i,"card_view_view_mode",rt(a.card_view_view_mode,{legacyDrawerDefaultOpen:a.card_view_drawer_default_open,legacyVideoPanelOnly:a.card_view_video_panel_only}),"bottom-panel-open"),_(i,"card_view_hide_camera_name",a.card_view_hide_camera_name!==!1,!0),_(i,"landing_page",re(a.landing_page),u.singleView),_(i,"mobile_page",Ye(a.mobile_page),b.single);const S=We.includes(Number(a.grid_rotation_seconds))?Number(a.grid_rotation_seconds):30;_(i,"grid_rotation_seconds",S,30);const j=z(a.grid_alert_hold_seconds,Ge,Math.round(Te/1e3));_(i,"grid_alert_hold_seconds",j,Math.round(Te/1e3));const R=z(a.preview_page_alert_live_duration_seconds,Ue,10);_(i,"preview_page_alert_live_duration_seconds",R,10);const x=Array.isArray(a.hidden_tabs)?a.hidden_tabs.map(M=>M==="reviews"?"alerts":M).filter(M=>Pe.includes(M)):[...Ze];if(x.length===Ze.length&&Ze.every(M=>x.includes(M))||(i.hidden_tabs=x),a.theme==="custom"){i.theme="custom";const M=ft(a.theme_custom),U=a.theme_custom_defaults&&typeof a.theme_custom_defaults=="object"?a.theme_custom_defaults:{},Q=M.map(({modes:Z,overrides:P})=>{const K={};return Object.entries(P).forEach(([F,He])=>{if(!Ke.has(F)||Z.every($=>(U[$]&&typeof U[$]=="object"?U[$]:U)[F]===!0))return;const O=Na(He);!O||Z.every($=>{const Ce=Na(t?.[$]?.[F]);return!!Ce&&Ce===O})||(K[F]=O)}),{modes:[...Z],overrides:K}});Q.length&&(i.theme_custom=Q)}const E=a.stream_height!=null&&String(a.stream_height).trim()!=="",I=Je(a.stream_height);E&&I!==Bt&&(i.stream_height=I);const Oe=Qe(a.stream_height_unit);E&&Oe!==Ea&&(i.stream_height_unit=Oe),_(i,"tight_margins",a.tight_margins===!0,!1),_(i,"shadows",a.shadows!==!1,!0),_(i,"borders",a.borders===!0,!1),_(i,"rounded_corners",a.rounded_corners!==!1,!0),_(i,"outer_shadows",a.outer_shadows!==!1,!0);const de=xt(a.col_left_width_pct);_(i,"col_left_width_pct",de,Ft);const $e=Et(a.video_defaults);$e&&(i.video_defaults=$e);const ge=Et(a.video_live_defaults);ge&&(i.video_live_defaults=ge);const be=Et(a.video_popup_defaults);be&&(i.video_popup_defaults=be);const we=Et(a.video_recording_defaults);return we&&(i.video_recording_defaults=we),i},Hr=(e,{sourceConfig:t=null}={})=>{const a={type:`custom:${Ne}`,...e&&typeof e=="object"?e:{}},i=t&&typeof t=="object"?t:null;return i&&i.grid_options&&typeof i.grid_options=="object"&&(a.grid_options={...i.grid_options}),i&&i.visibility!=null&&(a.visibility=Array.isArray(i.visibility)?i.visibility.map(r=>r&&typeof r=="object"?{...r}:r):i.visibility),a};function qr(){const e=typeof navigator<"u"?navigator:{},t=typeof window<"u"?window:{},a=String(e.userAgent||"").toLowerCase(),i=String(e.userAgentData?.platform||e.platform||"").toLowerCase(),r=Number(e.maxTouchPoints||0),o=!!t.matchMedia?.("(pointer: coarse)")?.matches,n=!!t.matchMedia?.("(any-pointer: coarse)")?.matches,s=!!t.matchMedia?.("(hover: none)")?.matches,d=r>0||o||n||s,c=i.includes("android")||a.includes("android"),h=/iphone/.test(a),p=e.userAgentData?.mobile===!0||/mobile|mobi/.test(a),g=/ipad/.test(a)||i.includes("mac")&&r>1&&d,k=/ipod/.test(a),f=h||g||k,S=g||c&&d&&!p,j=(f||c)&&!S,R=j||S;return{hasTouch:d,hasPrimaryTouch:o,hasAnyTouch:n||s,isAndroid:c,isIOS:f,isPhone:j,isTablet:S,isMobile:R,isDesktop:!R,os:c?"Android":f?"iOS":"Desktop/Other"}}const Ia=qr(),Ro=Ia.isIOS,No=Ia.isAndroid;function Ba(e){if(typeof e=="string")try{return JSON.parse(e)}catch{return[]}return e}function At(e,t){const a=parseInt(String(e??"").trim(),10);return Number.isFinite(a)&&a>0?a:t}function z(e,t,a){const i=Number(e);return Array.isArray(t)&&t.includes(i)?i:a}function J(e){const t=String(e??"").trim().toLowerCase();return t==="ha_direct"||t==="ha"||t==="home_assistant"?"ha_direct":B}function Jt(e){return String(e??"").trim().toLowerCase()==="all_reviews"?"all_reviews":"alerts_only"}function _e(e){const t=String(e||"").trim().toLowerCase();return/^#[0-9a-f]{6}$/.test(t)?t:/^#[0-9a-f]{3}$/.test(t)?`#${t[1]}${t[1]}${t[2]}${t[2]}${t[3]}${t[3]}`:""}const Mt=e=>String(e||"").trim().toLowerCase()==="dark"?"dark":"light",Lt=e=>{const t=e&&typeof e=="object"?e:{};return Object.fromEntries(me.map(a=>{const i=t[a]&&typeof t[a]=="object"?t[a]:{},r=Object.fromEntries(Object.entries(i).filter(([o,n])=>Ke.has(o)&&n===!0).map(([o])=>[o,!0]));return[a,r]}))},ja='[slot="primaryAction"], [slot="secondaryAction"], mwc-button, ha-button, button',Rr=(e,t)=>(e.forEach(a=>{const i=a===t;a.classList.toggle("active",i);const r=a.querySelector("[data-panel-toggle]");r&&r.setAttribute("aria-expanded",i?"true":"false")}),t?.dataset?.panel??null),Qt=e=>{if(!(e instanceof Element))return null;const t=e.getAttribute?.("slot")||"";if(t==="primaryAction")return"primary";if(t==="secondaryAction")return"secondary";const a=(e.getAttribute?.("dialogAction")||e.getAttribute?.("dialog-action")||"").toString().trim().toLowerCase();if(["save","ok","done","confirm","apply"].includes(a))return"primary";if(["cancel","close","dismiss"].includes(a))return"secondary";const i=(e.textContent||"").trim().toLowerCase();return["save","done","update","apply","ok"].includes(i)?"primary":["cancel","close","dismiss"].includes(i)?"secondary":null},Wa=e=>{const t=Array.isArray(e.composedPath?.())?e.composedPath():[];if(t.some(a=>a?.id==="camera-modal"))return null;for(const a of t){if(!(a instanceof Element)||!a.matches?.(ja))continue;const i=Qt(a);if(i)return i}return null},Nr=["drop-target","drop-target-before","drop-target-after"],Fa=(e,t)=>{const a=t?.getBoundingClientRect?.(),i=Number(a?.top),r=Number(a?.height),o=Number(e?.clientY);if(!Number.isFinite(i)||!Number.isFinite(r)||!(r>0)||!Number.isFinite(o))return"replace";const n=(o-i)/r;return n<=.28?"before":n>=.72?"after":"replace"},Ga=(e,t,a,i="replace")=>{const r=Array.isArray(e)?[...e]:[];if(!Number.isInteger(t)||!Number.isInteger(a)||t<0||a<0||t>=r.length||a>=r.length||t===a)return r;const[o]=r.splice(t,1);let n=a;return(i==="before"||i==="after")&&(n=a-(t<a?1:0),i==="after"&&(n+=1)),r.splice(Math.max(0,Math.min(r.length,n)),0,o),r},Ua=({rows:e,clearDropTargets:t,onReorder:a})=>{const i=o=>{o.classList.remove(...Nr),delete o.dataset.dropPlacement},r=()=>{e.forEach(i),t?.()};e.forEach(o=>{o.addEventListener("dragstart",n=>{const s=o.dataset.row;n.dataTransfer&&(n.dataTransfer.setData("text/plain",s),n.dataTransfer.effectAllowed="move"),o.classList.add("dragging")}),o.addEventListener("dragend",()=>{o.classList.remove("dragging"),r()}),o.addEventListener("dragover",n=>{n.preventDefault(),r();const s=Fa(n,o);o.dataset.dropPlacement=s,o.classList.add(s==="before"?"drop-target-before":s==="after"?"drop-target-after":"drop-target"),n.dataTransfer&&(n.dataTransfer.dropEffect="move")}),o.addEventListener("dragleave",n=>{o.contains?.(n.relatedTarget)||i(o)}),o.addEventListener("drop",n=>{n.preventDefault();const s=o.dataset.dropPlacement||Fa(n,o);r();const d=Number(n.dataTransfer?.getData("text/plain")||"-1"),c=Number(o.dataset.row||"-1");a(d,c,s)})})},Ir=(e,t,a)=>{const i=e.querySelector(t);if(!i)return;i.toggleAttribute("data-invalid",!!a);const r=e.querySelector(`${t}-helper`);r&&(r.textContent=a||"",r.classList.toggle("error",!!a))},Br=(e,t)=>{!e||typeof t!="function"||(e.addEventListener("value-changed",t),e.addEventListener("selected-changed",t),e.addEventListener("change",t))},v=e=>{if(!e)return!1;if(typeof e.checked=="boolean")return e.checked;if(e.getAttribute?.("aria-checked")==="true")return!0;if(e.getAttribute?.("aria-checked")==="false")return!1;const t=e.shadowRoot?.querySelector?.("input");return typeof t?.checked=="boolean"?t.checked:!1},ze=({element:e,hass:t,options:a,initialValue:i,fallbackValue:r,normalize:o=s=>s,onChange:n})=>{if(!e)return;e.hass=t,e.selector={select:{mode:"dropdown",options:a}};const s=o(i??r);e.value=s,e.dataset.value=s,Br(e,c=>{const h=c?.detail?.value??e.value??r,p=o(h);e.value=p,e.dataset.value=p,n?.(p,c)})},Tt=({element:e,hass:t,domain:a,label:i,required:r,onChange:o})=>{if(!e)return;e.hass=t,e.selector={entity:{domain:a}},typeof r=="boolean"&&(e.required=r),i&&(e.label=i);const n=s=>{const d=s?.detail?.value??e.value??"",c=String(d||"");e.value=c,e.dataset.value=c,o?.(c,s)};e.addEventListener("value-changed",n),e.addEventListener("selected-changed",n)},Za=({element:e,hass:t,entity:a="",label:i,onChange:r})=>{if(!e)return;e.hass=t,e.selector={icon:{}},e.context=a?{icon_entity:a}:{},e.required=!1,i&&(e.label=i);const o=n=>{const s=n?.detail?.value??e.value??"",d=String(s||"");e.value=d,e.dataset.value=d,r?.(d,n)};e.addEventListener("value-changed",o),e.addEventListener("selected-changed",o)},jr=({root:e,update:t,themeDraftCache:a,resolveDefaultHex:i,themeMode:r})=>{const o=Mt(r);a[o]||(a[o]={});const n=a[o];e.querySelectorAll("[data-theme-option]").forEach(s=>{s.addEventListener("pointerdown",d=>{d.stopPropagation()}),s.addEventListener("click",d=>{d.preventDefault(),d.stopPropagation();const c=d.currentTarget?.dataset?.themeOption||"default";e.querySelectorAll("[data-theme-option]").forEach(p=>{const g=p.dataset.themeOption===c;p.classList.toggle("active",g),p.setAttribute("aria-checked",g?"true":"false")});const h=e.querySelector("#theme-custom-panel");h&&(h.hidden=c!=="custom",c==="custom"&&h.setAttribute("open","")),t()})}),e.querySelectorAll("[data-theme-scope]").forEach(s=>{s.addEventListener("click",d=>{d.preventDefault(),d.stopPropagation();const c=jt(d.currentTarget?.dataset?.themeScope,o);e.querySelectorAll("[data-theme-scope]").forEach(h=>{const p=h.dataset.themeScope===c;h.classList.toggle("active",p),h.setAttribute("aria-checked",p?"true":"false")}),d.currentTarget?.blur?.(),t()})}),e.querySelectorAll("[data-theme-color]").forEach(s=>{const d=c=>{const h=c.currentTarget?.dataset?.themeColor,p=_e(c.currentTarget?.value);h&&p&&(n[h]=p),t()};s.addEventListener("input",d),s.addEventListener("change",d)}),e.querySelectorAll("[data-theme-reset]").forEach(s=>{s.addEventListener("click",d=>{d.preventDefault(),d.stopPropagation();const c=d.currentTarget?.dataset?.themeReset,h=e.querySelector(`[data-theme-color="${c}"]`);if(!c||!h||h.disabled)return;const p=i(c);h.value=p,n[c]=p,t()})}),e.querySelectorAll("[data-theme-default]").forEach(s=>{const d=s.dataset.themeDefault,c=e.querySelector(`[data-theme-color="${d}"]`),h=e.querySelector(`[data-theme-reset="${d}"]`);s.addEventListener("change",p=>{const g=p.currentTarget?.checked===!0;if(!c){t();return}if(g)c.value=i(d),c.disabled=!0,h&&(h.hidden=!0);else{const k=_e(n[d]);c.value=k||i(d),n[d]=c.value,c.disabled=!1,h&&(h.hidden=!1)}t()}),s.addEventListener("value-changed",p=>{s.checked=p?.detail?.value===!0})})},Wr=({root:e,selector:t,handler:a})=>{e.querySelector(t)?.addEventListener("click",a)},Fr=(e,t)=>{t.forEach(a=>Wr({root:e,...a}))},ea=({root:e,selector:t,handler:a})=>{e.querySelectorAll(t).forEach(i=>{i.addEventListener("click",r=>a(r,i))})},Ka=({root:e,ids:t,events:a,handler:i})=>{t.forEach(r=>{const o=e.querySelector(`#${r}`);o&&a.forEach(n=>{o.addEventListener(n,s=>i(s,o,r))})})},Gr=({root:e,selector:t,events:a,handler:i})=>{e.querySelectorAll(t).forEach(r=>{a.forEach(o=>{r.addEventListener(o,n=>i(n,r,t))})})},Ya=({root:e,baseConfig:t,cameras:a,themeDraftCache:i,themeMode:r,hiddenTabsOverride:o})=>{const n=w=>q(e.querySelector(`#${w}`)?.value).trim(),s={...t,cameras:a};delete s.camera_entity;const d=n("title"),c=n("subtitle");d?s.title=d:delete s.title,c?s.subtitle=c:delete s.subtitle;const h=e.querySelector("#display_title"),p=e.querySelector("#display_subtitle"),g=e.querySelector("#display_logo"),k=e.querySelector("#display_version");s.display_title=h?v(h):t?.display_title!==!1,s.display_subtitle=p?v(p):t?.display_subtitle!==!1,s.display_logo=g?v(g):t?.display_logo!==!1,s.display_version=k?v(k):t?.display_version!==!1,s.event_days=At(e.querySelector("#event_days")?.dataset.value||e.querySelector("#event_days")?.value||String(ce),ce),s.alerts_reviews_days=At(e.querySelector("#alerts_reviews_days")?.dataset.value||e.querySelector("#alerts_reviews_days")?.value||String(he),he);const f=Number(e.querySelector('[name="realtime_poll_seconds"]:checked')?.value||e.querySelector("#realtime_poll_seconds")?.dataset.value||e.querySelector("#realtime_poll_seconds")?.value||"5");s.realtime_poll_seconds=Ie.includes(f)?f:5,s.snapshot_update_seconds=z(e.querySelector('[name="snapshot_update_seconds"]:checked')?.value||e.querySelector("#snapshot_update_seconds")?.dataset.value||e.querySelector("#snapshot_update_seconds")?.value||String(Me),Be,Me),s.mobile_poll_battery_saver=v(e.querySelector("#mobile_poll_battery_saver")),s.event_pre_post_roll_enabled=v(e.querySelector("#event_pre_post_roll_enabled"));const S=e.querySelector("#favorites_mixed_cameras");s.favorites_mixed_cameras=S?v(S):t?.favorites_mixed_cameras!==!1,s.slideshow_rotation_enabled=v(e.querySelector("#slideshow_rotation_enabled")),s.slideshow_rotation_seconds=je.includes(Number(e.querySelector('[name="slideshow_rotation_seconds"]:checked')?.value||e.querySelector("#slideshow_rotation_seconds")?.dataset.value||e.querySelector("#slideshow_rotation_seconds")?.value||"30"))?Number(e.querySelector('[name="slideshow_rotation_seconds"]:checked')?.value||e.querySelector("#slideshow_rotation_seconds")?.dataset.value||e.querySelector("#slideshow_rotation_seconds")?.value||"30"):30,s.slideshow_alert_hold_seconds=z(e.querySelector('[name="slideshow_alert_hold_seconds"]:checked')?.value||e.querySelector("#slideshow_alert_hold_seconds")?.dataset.value||e.querySelector("#slideshow_alert_hold_seconds")?.value||String(Math.round(Le/1e3)),Fe,Math.round(Le/1e3)),s.grid_mode_enabled=v(e.querySelector("#grid_mode_enabled")),s.grid_live_view_enabled=v(e.querySelector("#grid_live_view_enabled"))!==!1,s.grid_alert_hold_seconds=z(e.querySelector('[name="grid_alert_hold_seconds"]:checked')?.value||e.querySelector("#grid_alert_hold_seconds")?.dataset.value||e.querySelector("#grid_alert_hold_seconds")?.value||String(Math.round(Te/1e3)),Ge,Math.round(Te/1e3));const j=e.querySelector("#mobile_view_page_enabled");s.mobile_view_page_enabled=j?v(j):t?.mobile_view_page_enabled!==!1;const R=e.querySelector("#mobile_view_rotate_to_fullscreen");s.mobile_view_rotate_to_fullscreen=R?v(R):t?.mobile_view_rotate_to_fullscreen===!0;const x=e.querySelector("#mobile_view_dashboard_background");s.mobile_view_dashboard_background=x?v(x):t?.mobile_view_dashboard_background!==!1,s.mobile_view_outer_border=v(e.querySelector("#mobile_view_outer_border")),s.mobile_view_ha_navbar_bottom=v(e.querySelector("#mobile_view_ha_navbar_bottom")),s.mobile_view_ha_navbar_stack_tabs=v(e.querySelector("#mobile_view_ha_navbar_stack_tabs")),s.mobile_view_ha_navbar_dashboard=v(e.querySelector("#mobile_view_ha_navbar_dashboard")),s.ha_dashboard_swipe_navigation_owner=v(e.querySelector("#ha_dashboard_swipe_navigation_owner")),s.ha_dashboard_swipe_navigation=Xe(e.querySelector('[name="ha_dashboard_swipe_navigation"]:checked')?.value||t?.ha_dashboard_swipe_navigation),s.ha_dashboard_swipe_include_other_cards=v(e.querySelector("#ha_dashboard_swipe_include_other_cards"));const N=s.ha_dashboard_swipe_navigation,E=N===C.dashboardWide||N===C.landingDashboard?e.querySelector(`[data-ha-dashboard-swipe-include-subviews="${N}"]`):null;s.ha_dashboard_swipe_include_subviews=v(E),s.ha_dashboard_swipe_mouse_enabled=v(e.querySelector("#ha_dashboard_swipe_mouse_enabled")),s.preview_page_enabled=v(e.querySelector("#preview_page_enabled")),s.preview_page_live_cameras=v(e.querySelector("#preview_page_live_cameras")),s.preview_page_live_cameras_mobile=v(e.querySelector("#preview_page_live_cameras_mobile")),s.preview_page_alert_live_duration_seconds=z(e.querySelector('[name="preview_page_alert_live_duration_seconds"]:checked')?.value||e.querySelector("#preview_page_alert_live_duration_seconds")?.dataset.value||e.querySelector("#preview_page_alert_live_duration_seconds")?.value||"10",Ue,10),s.preview_page_show_title_bars=v(e.querySelector("#preview_page_show_title_bars"))!==!1,s.single_view_alert_takeover=v(e.querySelector("#single_view_alert_takeover")),s.single_view_start_mode=se(e.querySelector('[name="single_view_start_mode"]:checked')?.value||t?.single_view_start_mode),s.wide_view_page_enabled=v(e.querySelector("#wide_view_page_enabled")),s.wide_view_live_cameras=v(e.querySelector("#wide_view_live_cameras")),s.wide_view_alert_takeover=v(e.querySelector("#wide_view_alert_takeover")),s.wide_view_start_mode=se(e.querySelector('[name="wide_view_start_mode"]:checked')?.value||t?.wide_view_start_mode),s.wide_view_timeline_enabled=v(e.querySelector("#wide_view_timeline_enabled")),s.wide_view_timeline_default_open=v(e.querySelector("#wide_view_timeline_default_open")),s.wide_view_timeline_default_scale=St(e.querySelector('[name="wide_view_timeline_default_scale"]:checked')?.value||e.querySelector("#wide_view_timeline_default_scale")?.dataset.value||e.querySelector("#wide_view_timeline_default_scale")?.value||t?.wide_view_timeline_default_scale),s.card_view_page_enabled=v(e.querySelector("#card_view_page_enabled")),s.card_view_alert_takeover=v(e.querySelector("#card_view_alert_takeover")),s.card_view_standalone=v(e.querySelector("#card_view_standalone")),s.card_view_media_drawer_enabled=v(e.querySelector("#card_view_media_drawer_enabled")),s.card_view_start_mode=Kt(e.querySelector('[name="card_view_start_mode"]:checked')?.value||t?.card_view_start_mode),s.card_view_view_mode=rt(e.querySelector('[name="card_view_view_mode"]:checked')?.value||t?.card_view_view_mode,{legacyDrawerDefaultOpen:t?.card_view_drawer_default_open,legacyVideoPanelOnly:t?.card_view_video_panel_only}),delete s.card_view_drawer_default_open,delete s.card_view_media_drawer_type,delete s.card_view_video_panel_only,s.card_view_hide_camera_name=v(e.querySelector("#card_view_hide_camera_name")),s.grid_rotation_seconds=We.includes(Number(e.querySelector('[name="grid_rotation_seconds"]:checked')?.value||e.querySelector("#grid_rotation_seconds")?.dataset.value||e.querySelector("#grid_rotation_seconds")?.value||"30"))?Number(e.querySelector('[name="grid_rotation_seconds"]:checked')?.value||e.querySelector("#grid_rotation_seconds")?.dataset.value||e.querySelector("#grid_rotation_seconds")?.value||"30"):30,delete s.primary_color,delete s.accent_color,delete s.bg_color,delete s.use_primary_color,delete s.use_accent_color,delete s.use_bg_color,s.theme=e.querySelector("[data-theme-option].active")?.dataset?.themeOption==="custom"?"custom":"default";const I=Mt(r),de={...Wt(s.theme_custom,I).overrides},ge={...Lt(s.theme_custom_defaults)[I]},be=i?.[I];be&&typeof be=="object"&&Object.entries(be).forEach(([w,O])=>{if(!Ke.has(w))return;const ee=_e(O);ee&&(de[w]=ee)}),e.querySelectorAll("[data-theme-color]").forEach(w=>{const O=w.dataset.themeColor;if(!Ke.has(O))return;const ee=v(e.querySelector(`[data-theme-default="${O}"]`)),$=_e(w.value);if(ee){ge[O]=!0,delete de[O];return}delete ge[O],$&&Object.prototype.hasOwnProperty.call(de,O)&&(i[I]||(i[I]={}),i[I][O]=$,de[O]=$)});const we=jt(e.querySelector("[data-theme-scope].active")?.dataset?.themeScope,I);s.theme_custom=ur({scope:we,overrides:de,fallbackMode:I}),s.theme_custom_defaults=Object.fromEntries(me.map(w=>[w,{...ge}]));const M=Array.isArray(o)?o.map(w=>w==="reviews"?"alerts":w).filter(w=>Pe.includes(w)):[...e.querySelectorAll("[data-active-tab]")].filter(w=>!v(w)).map(w=>w.dataset.activeTab).filter(w=>Pe.includes(w));s.hidden_tabs=M.length?M:[];const U=e.querySelector("#stream_height")?.value,Q=e.querySelector('[name="stream_height_unit"]:checked')?.value||e.querySelector("#stream_height_unit")?.dataset.value||e.querySelector("#stream_height_unit")?.value||"%";s.stream_height=Je(U),s.stream_height_unit=Qe(Q),s.tight_margins=v(e.querySelector("#tight_margins")),s.shadows=v(e.querySelector("#shadows"))!==!1,s.borders=v(e.querySelector("#borders")),s.rounded_corners=v(e.querySelector("#rounded_corners"))!==!1,s.outer_shadows=v(e.querySelector("#outer_shadows"))!==!1,s.landing_page=re(e.querySelector("#landing_page")?.dataset.value||e.querySelector("#landing_page")?.value||u.singleView);const Z=re(t?.landing_page),P=[...e.querySelectorAll('[name="ha_dashboard_swipe_pages"]:checked')].map(w=>String(w?.value||"")).filter(w=>w&&(s.landing_page===Z||w!==Z));s.ha_dashboard_swipe_pages=_t({...s,ha_dashboard_swipe_pages:P},V.desktop),s.mobile_page=Ye(e.querySelector("#mobile_page")?.dataset.value||e.querySelector("#mobile_page")?.value||s.mobile_page||b.single);const K=Ve(t),F=Ve(s),He=[...e.querySelectorAll('[name="ha_dashboard_swipe_mobile_pages"]:checked')].map(w=>String(w?.value||"")).filter(w=>w&&(F===K||w!==K));return s.ha_dashboard_swipe_mobile_pages=vt({...s,ha_dashboard_swipe_mobile_pages:He}),s.col_left_width_pct=xt(e.querySelector("#col_left_width_pct")?.value),s};function Xa(e,{fallbackName:t=null}={}){if(typeof e=="string")return{entity:e,name:t==null?null:q(t).trim(),connection_type:B,alerts_content:"alerts_only",ptz:null};if(e&&typeof e=="object"){const a=e.entity||e.camera_entity||null,i=e.name||t,r=tt(e.group,{primaryEntity:a}),o=kt(e.linked_entities);return{entity:a,name:i==null?null:q(i).trim(),connection_type:J(e.connection_type),alerts_content:Jt(e.alerts_content),ptz:ot(e.ptz),...e.two_way_talk===!0?{two_way_talk:!0}:{},...r?{group:r}:{},...o.length?{linked_entities:o}:{}}}return{entity:null,name:t==null?null:q(t).trim(),connection_type:B,alerts_content:"alerts_only",ptz:null}}const Ur=e=>{if(!e||typeof e!="object")return!1;if((Array.isArray(e.producers)?e.producers:[]).some(d=>Array.isArray(d?.medias)?d.medias.some(c=>{const h=String(c||"").trim().toLowerCase();return h.includes("audio")&&(h.includes("sendonly")||h.includes("sendrecv"))}):!1))return!0;const i=new Set(["two_way_talk","twoWayTalk","two-way-talk","talk","talkback","microphone","mic","audio_output","audio_out","two_way_audio","supports_two_way_talk","supports_two_way_audio","backchannel"]),r=new Set(["talk","talkback","two_way_talk","two-way-talk","supports_two_way_talk","two_way_audio","two-way-audio","supports_two_way_audio","mic","microphone","audio_output","audio-out","audio_out","speaker","backchannel"]),o=[e],n=new Set,s=[];for(;o.length;){const d=o.pop();if(!(!d||typeof d!="object")&&!n.has(d)){if(n.add(d),Array.isArray(d)){d.forEach(c=>{typeof c=="string"?s.push(c):c&&typeof c=="object"&&o.push(c)});continue}Object.entries(d).forEach(([c,h])=>{const p=String(c||"").trim().toLowerCase();h===!0&&i.has(c)&&s.push(c),h===!0&&i.has(p)&&s.push(p),typeof h=="string"?s.push(h):(Array.isArray(h)||h&&typeof h=="object")&&o.push(h)})}}return s.map(d=>String(d||"").trim().toLowerCase()).some(d=>r.has(d))},Zr=e=>String(e||"").trim().toLowerCase().replaceAll("-","_"),Kr=e=>{const t=e?.frontend_stream_types;return Array.isArray(t)?t.some(a=>{const i=Zr(a);return i==="web_rtc"||i==="webrtc"}):!1},Yr=e=>String(e||"").toLowerCase().replace(/[^a-z0-9]+/g,""),Xr=e=>{const t=String(e||"").trim();return t?t.toLowerCase().startsWith("v")?t:`v${t}`:""},Jr=(e={})=>Object.entries(e||{}).find(([a,i])=>{if(!String(a).startsWith("update."))return!1;const r=i?.attributes||{};return Yr([a,r.title,r.friendly_name,r.repository,r.release_url].join(" ")).includes("frigateviewcard")})||null,Ja=({states:e={}}={})=>{const t=Jr(e);if(!t)return{entityId:"",status:"unavailable",label:"Update status unavailable"};const[a,i]=t,r=i?.attributes||{},o=Xr(r.latest_version);if(r.in_progress===!0)return{entityId:a,status:"updating",label:o?`Updating to ${o}`:"Update in progress"};const n=String(i?.state||"").toLowerCase();return n==="on"?{entityId:a,status:"available",label:o?`Update available: ${o}`:"Update available"}:n==="off"?{entityId:a,status:"current",label:"Up to date"}:{entityId:a,status:"unavailable",label:"Update status unavailable"}},ta=10,Io=Object.freeze({"border-bottom":"none","border-top":"1px solid var(--divider-color)","box-sizing":"border-box",height:`calc(var(--header-height, 56px) + ${ta}px)`,"padding-top":`${ta/2}px`,"padding-bottom":`${ta/2}px`}),Bo=Symbol.for("frigate-view-card.dashboard-navbar-customization"),Qa=e=>String(e||"").trim().toLowerCase().replace(/^custom:/,""),Qr=(e,t)=>String(e?.path||"").trim().replace(/^\/+|\/+$/g,"")||String(t),eo=(e,t="frigate-view-card")=>{const a=Qa(t),i=[];if(!a||!Array.isArray(e?.views))return{cards:i,claimants:[],owner:null,conflicts:[]};let r=0;e.views.forEach((n,s)=>{const d=new Set,c=(h,p=0)=>{if(!(!h||typeof h!="object"||p>30)&&!d.has(h)){if(d.add(h),!Array.isArray(h)&&Qa(h.type)===a){i.push({config:h,cardOrder:r,view:n,viewIndex:s,viewName:Qr(n,s),viewTitle:String(n?.title||"").trim()||`Page ${s+1}`}),r+=1;return}Object.values(h).forEach(g=>c(g,p+1))}};c(n)});const o=i.filter(({config:n})=>n?.mobile_view_ha_navbar_bottom===!0&&n?.mobile_view_ha_navbar_dashboard===!0);return{cards:i,claimants:o,owner:o[0]||null,conflicts:o.slice(1)}},to=({dashboardConfig:e,sourceConfig:t=null,requested:a=!1,cardTag:i="frigate-view-card",currentViewName:r=""}={})=>{const o=eo(e,i),n=o.cards.find(({config:h})=>h===t),s=o.claimants.filter(({viewName:h})=>h===r),d=!!o.owner&&(o.owner===n||!n&&a&&o.owner.viewName===r&&s.length===1),c=a&&(!o.owner||d);return{...o,requested:a,isOwner:c,locked:!!o.owner&&!d,conflict:a&&!!o.owner&&!c}},jo=Object.freeze(["transform","transition","will-change","backface-visibility"]),Wo=Object.freeze(["overflow-x","overscroll-behavior-x"]),Fo=["a","button","input","select","textarea","label","summary","video","audio","canvas","[contenteditable]","[draggable='true']","[role='button']","[role='slider']","[role='spinbutton']","[data-no-swipe]","ha-tabs","ha-tab-group","ha-tab-group-tab","paper-tabs","paper-tab","ha-slider","ha-control-slider","paper-slider","mwc-slider","ha-map","hui-map-card","google-map","swipe-card","swiper-container",".swiper",".swiper-container",".swiper-wrapper",".swiper-slide","#live-stage","#viewer","#recording-scrub",".recording-scrub-track",".recording-segment-handle",".live-resize-grip",".popup-view-resize-grip",".popup-carousel",".circle-pad",".wide-timeline-shell",".wide-timeline-resize-handle",".card-view-scroller",".linked-light-brightness-popover","#filter-panel","#cal-panel"].join(","),Go=new Set([C.dashboardWide,C.landingDashboard]),Uo=Symbol.for("frigate-view-card.dashboard-swipe-navigation"),ao=e=>{if(!e)return null;if(e.parentNode)return e.parentNode;const t=e.getRootNode?.();return t&&t!==e?t.host||null:e.host||null},Pt=e=>String(e||"").trim().replace(/^\/+|\/+$/g,""),io=e=>{const t=String(e||"").trim().replace(/\/+$/g,"");return t?t.startsWith("/")?t:`/${t}`:""},ro=(e,t)=>Pt(e?.path)||String(t),ei=e=>String(e||"").trim().toLowerCase().replace(/^custom:/,""),oo=(e,t)=>ei(e?.type)===t,so=(e,t="frigate-view-card")=>{const a=ei(t),i=e?.views;if(!a||!Array.isArray(i))return[];const r=[];let o=0;return i.forEach((n,s)=>{const d=new Set,c=(h,p=0)=>{if(!(!h||typeof h!="object"||p>30)&&!d.has(h)){if(d.add(h),!Array.isArray(h)&&oo(h,a)){r.push({config:h,cardOrder:o,view:n,viewIndex:s,viewName:ro(n,s),viewTitle:String(n?.title||"").trim()||`Page ${s+1}`}),o+=1;return}Object.values(h).forEach(g=>c(g,p+1))}};c(n)}),r},no=(e,t="frigate-view-card")=>{const a=so(e,t),i=a.filter(({config:r})=>r?.ha_dashboard_swipe_navigation_owner===!0);return{cards:a,claimants:i,owner:i[0]||null,conflicts:i.slice(1)}},ti=(e,t=globalThis.document)=>{let a=e;for(let n=0;a&&n<12;n+=1){if(String(a.tagName||"").toUpperCase()==="HA-PANEL-LOVELACE")return a;a=ao(a)}const r=t?.querySelector?.("home-assistant")?.shadowRoot?.querySelector?.("home-assistant-main")?.shadowRoot,o=r?.querySelector?.("partial-panel-resolver");return o?.querySelector?.("ha-panel-lovelace")||o?.shadowRoot?.querySelector?.("ha-panel-lovelace")||r?.querySelector?.("ha-panel-lovelace")||null},lo=({panel:e,huiRoot:t,windowRef:a})=>{const i=io(e?.route?.prefix||t?.route?.prefix||t?._route?.prefix),r=String(a?.location?.pathname||"");if(i&&r.startsWith(`${i}/`))return Pt(r.slice(i.length));const o=Pt(e?.route?.path);return o||Pt(r).split("/").at(-1)||""},ai=(e={})=>lo(e),Zo=Object.freeze(["camera.doorbell","camera.front_door","camera.driveway","camera.garage","camera.backyard"]),co=e=>{let t=[];return Array.isArray(e?.cameras)?t=e.cameras:e?.camera_entity&&(t=[{entity:e.camera_entity,name:e.title||"",connection_type:B}]),Zt(t.map(a=>Xa(a,{fallbackName:""})).filter(a=>a.entity),pe)},ho=e=>{const t=e&&typeof e=="object"?{...e}:{},a=co(t);t.hidden_tabs=Array.isArray(t.hidden_tabs)?t.hidden_tabs.map(o=>o==="reviews"?"alerts":o).filter(o=>Pe.includes(o)):[...Ze],delete t.camera_entity,t.title=q(t.title).trim()||ut,t.subtitle=q(t.subtitle).trim()||Ht,t.display_title=t.display_title!==!1,t.display_subtitle=t.display_subtitle!==!1,t.display_logo=t.display_logo!==!1,t.display_version=t.display_version!==!1,t.theme=t.theme==="custom"?"custom":"default",t.theme_custom=ft(t.theme_custom),t.theme_custom_defaults=Lt(t.theme_custom_defaults),t.shadows=t.shadows!==!1,t.borders=t.borders===!0,t.rounded_corners=t.rounded_corners!==!1,t.outer_shadows=t.outer_shadows!==!1,t.stream_height=Je(t.stream_height),t.stream_height_unit=Qe(t.stream_height_unit),t.col_left_width_pct=xt(t.col_left_width_pct),t.realtime_poll_seconds=Ie.includes(Number(t.realtime_poll_seconds))?Number(t.realtime_poll_seconds):5,t.snapshot_update_seconds=z(t.snapshot_update_seconds,Be,Me),t.mobile_poll_battery_saver=t.mobile_poll_battery_saver===!0,t.event_pre_post_roll_enabled=t.event_pre_post_roll_enabled===!0,t.favorites_mixed_cameras=t.favorites_mixed_cameras!==!1,t.slideshow_rotation_enabled=t.slideshow_rotation_enabled===!0,t.slideshow_rotation_seconds=je.includes(Number(t.slideshow_rotation_seconds))?Number(t.slideshow_rotation_seconds):30,t.slideshow_alert_hold_seconds=z(t.slideshow_alert_hold_seconds,Fe,Math.round(Le/1e3)),t.grid_mode_enabled=t.grid_mode_enabled===!0,t.grid_order=ue(t.grid_order,a),t.grid_live_view_enabled=t.grid_live_view_enabled!==!1,t.grid_alert_hold_seconds=z(t.grid_alert_hold_seconds,Ge,Math.round(Te/1e3)),t.mobile_view_page_enabled=t.mobile_view_page_enabled!==!1,t.mobile_view_rotate_to_fullscreen=t.mobile_view_rotate_to_fullscreen===!0,t.mobile_view_dashboard_background=t.mobile_view_dashboard_background!==!1,t.mobile_view_outer_border=t.mobile_view_outer_border===!0,t.mobile_view_ha_navbar_bottom=t.mobile_view_ha_navbar_bottom===!0,t.mobile_view_ha_navbar_stack_tabs=t.mobile_view_ha_navbar_stack_tabs===!0,t.mobile_view_ha_navbar_dashboard=t.mobile_view_ha_navbar_dashboard===!0,t.ha_dashboard_swipe_navigation_owner=t.ha_dashboard_swipe_navigation_owner===!0,t.ha_dashboard_swipe_navigation=Xe(t.ha_dashboard_swipe_navigation),t.ha_dashboard_swipe_include_other_cards=t.ha_dashboard_swipe_include_other_cards===!0,t.ha_dashboard_swipe_include_subviews=t.ha_dashboard_swipe_include_subviews===!0,t.ha_dashboard_swipe_mouse_enabled=t.ha_dashboard_swipe_mouse_enabled===!0,t.preview_page_enabled=t.preview_page_enabled===!0,t.preview_page_live_cameras=t.preview_page_live_cameras===!0,t.preview_page_live_cameras_mobile=t.preview_page_live_cameras_mobile===!0,t.preview_page_show_title_bars=t.preview_page_show_title_bars!==!1,t.preview_page_alert_live_duration_seconds=z(t.preview_page_alert_live_duration_seconds,Ue,10),t.single_view_start_mode=se(t.single_view_start_mode),t.wide_view_start_mode=se(t.wide_view_start_mode),t.card_view_start_mode=Kt(t.card_view_start_mode),t.single_view_alert_takeover=t.single_view_alert_takeover===!0,t.wide_view_page_enabled=t.wide_view_page_enabled===!0||t.wide_view===!0,t.wide_view_live_cameras=t.wide_view_live_cameras===!0,t.wide_view_alert_takeover=t.wide_view_alert_takeover===!0,t.wide_view_timeline_enabled=t.wide_view_timeline_enabled===!0,t.wide_view_timeline_default_open=t.wide_view_timeline_default_open===!0,t.wide_view_timeline_default_scale=St(t.wide_view_timeline_default_scale),t.card_view_page_enabled=t.card_view_page_enabled===!0,t.card_view_alert_takeover=t.card_view_alert_takeover===!0,t.card_view_standalone=t.card_view_page_enabled&&t.card_view_standalone===!0,t.card_view_media_drawer_enabled=t.card_view_media_drawer_enabled!==!1,t.card_view_view_mode=rt(t.card_view_view_mode,{legacyDrawerDefaultOpen:t.card_view_drawer_default_open,legacyVideoPanelOnly:t.card_view_video_panel_only}),delete t.card_view_drawer_default_open,delete t.card_view_media_drawer_type,delete t.card_view_video_panel_only,t.card_view_hide_camera_name=t.card_view_hide_camera_name!==!1,t.landing_page=re(t.landing_page),t.card_view_standalone&&(t.landing_page=u.cardView),t.mobile_page=xa(t,t.mobile_page);const i=oe(t,V.desktop);i.includes(t.landing_page)||(t.landing_page=i[0]||u.singleView),t.ha_dashboard_swipe_pages=_t(t,V.desktop),t.ha_dashboard_swipe_mobile_pages=vt(t),t.grid_rotation_seconds=We.includes(Number(t.grid_rotation_seconds))?Number(t.grid_rotation_seconds):30;const r=parseInt(t.window_hours,10);return t.event_days=At(t.event_days??t.window_days,Number.isFinite(r)&&r>0?Math.max(1,Math.ceil(r/24)):ce),t.alerts_reviews_days=At(t.alerts_reviews_days,he),delete t.window_days,delete t.window_hours,delete t.wide_view,{...t,cameras:a}},ii=new Set(["","default","backend-selected"]),ri=Object.freeze(["dark-primary-color","--dark-primary-color"]),Dt=e=>String(e||"").trim().toLowerCase(),po=(e,t)=>{const a=e?.themes;if(!a||typeof a!="object")return null;const i=Dt(t),r=Object.keys(a).find(n=>Dt(n)===i);if(!r)return null;const o=a[r];return o&&typeof o=="object"?o:null},oi=(e,t)=>t.some(a=>Object.prototype.hasOwnProperty.call(e||{},a)&&String(e[a]??"").trim()!==""),mo=(e,t)=>oi(e,ri)||oi(e?.modes?.[t],ri),uo=(e,{mode:t}={})=>{const a=e?.themes||{},{darkMode:i=!1}=a,r=t==="dark"||t==="light"?t:i===!0?"dark":"light",o=String(a.theme||e?.selectedTheme||"default").trim(),n=String(r==="dark"?a.default_dark_theme||a.default_theme||"default":a.default_theme||"default").trim(),s=ii.has(Dt(o))?n:o,d=ii.has(Dt(s))?"default":"custom",c=d==="custom"?po(a,s):null;return{mode:r,source:d,deriveDarkPrimary:d==="custom"&&c!==null&&!mo(c,r)}},st=Object.freeze({enterStandalone:"enter-card-view-standalone",revertStandaloneDraft:"revert-card-view-standalone-draft",navigate:"navigate",commit:"commit",reset:"reset"}),si=(e,t)=>{const a=String(t?.attributes?.friendly_name||"").trim();if(a)return a;const i=String(e||"").replace(/^light\./,"").trim();return i?i.split(/[_\s-]+/).filter(Boolean).map(r=>`${r.charAt(0).toUpperCase()}${r.slice(1)}`).join(" "):"Light"},_o=Object.freeze({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}),L=e=>String(e??"").replace(/[&<>"']/g,t=>_o[t]),T=L,ni=e=>{const t=String(e||"").trim().replace(/^v/i,"");if(!t)return null;const a=t.match(/^\d+(?:\.\d+)*/)?.[0]||"";return a?a.split(".").map(i=>Number(i)):null},vo=(e,t)=>{const a=ni(e),i=ni(t);if(!a||!i)return null;const r=Math.max(a.length,i.length);for(let o=0;o<r;o+=1){const n=a[o]||0,s=i[o]||0;if(n<s)return-1;if(n>s)return 1}return 0},go=({currentVersion:e="",recommendedVersion:t=""}={})=>vo(e,t)!==-1?"":`Home Assistant ${e} is below the recommended ${t}.`,bo=({currentVersion:e="",recommendedVersion:t=""}={})=>{const a=String(e||"").trim();if(!a)return{visible:!1,status:"unavailable",label:""};const i=go({currentVersion:a,recommendedVersion:t});return i?{visible:!0,status:"warning",label:i}:{visible:!0,status:"current",label:`Home Assistant ${a}`}},fo=({installed:e=null}={})=>e===!0?{visible:!0,status:"current",label:"Frigate integration is installed."}:e===!1?{visible:!0,status:"error",label:"Frigate integration is not installed in Home Assistant."}:{visible:!1,status:"unavailable",label:""},wo=e=>{const t=e?.config?.components;return Array.isArray(t)?t.includes("frigate"):t instanceof Set?t.has("frigate"):null},yo=Object.freeze(new Set(["camera-modal-entity","camera-modal-secondary-entity","camera-modal-light-entity","camera-modal-light-icon","camera-modal-light-entity-2","camera-modal-light-icon-2","camera-modal-connection-type"])),xo="dirtyState",li="frigate-view-card-editor",So=200,di=3e4,xe=L,Co=e=>{const t=Number(e);return Number.isFinite(t)&&t>=60&&t%60===0?`${t/60} min`:`${t} sec`},Se=e=>e.map(t=>({value:t,label:Co(t)})),nt=({name:e,options:t,selectedValue:a,compact:i=!1})=>{const r=String(a??""),o=xe(e),n=t.some(({description:s})=>!!String(s||"").trim());return`<div class="editor-choice-chips${i?" editor-choice-chips--compact":""}${n?" editor-choice-chips--detailed":""}">
    ${t.map(({value:s,label:d,description:c="",disabled:h=!1})=>{const p=xe(s),g=xe(d),k=xe(c);return`<label class="editor-choice-chip">
          <input class="editor-choice-chip-input" type="radio" name="${o}" value="${p}" ${String(s)===r?"checked":""} ${h?"disabled":""}>
          <span class="editor-choice-chip-body">
            <span class="editor-choice-chip-indicator" aria-hidden="true"></span>
            ${n?`<span class="editor-choice-chip-copy"><span class="editor-choice-chip-text">${g}</span><span class="editor-choice-chip-description">${k}</span></span>`:`<span class="editor-choice-chip-text">${g}</span>`}
          </span>
        </label>`}).join("")}
  </div>`},ve=({name:e,options:t,selectedValue:a})=>{const i=String(a??""),r=xe(e);return`<div class="theme-scope-seg card-view-start-seg editor-bubble-selector" style="--editor-bubble-option-count:${Math.max(1,t.length)}">
    ${t.map(({value:o,label:n,disabled:s=!1,disabledReason:d=""})=>{const c=xe(o),h=xe(n),p=T(d),g=s===!0;return`<label class="theme-scope-opt card-view-start-opt" data-disabled-guidance="${p}"${g&&p?` title="${p}"`:""}>
          <input class="card-view-start-input" type="radio" name="${r}" value="${c}" ${String(o)===i?"checked":""} ${g?"disabled":""} aria-label="${h}${g&&p?`. ${p}`:""}">
          <span>${h}</span>
        </label>`}).join("")}
  </div>`},ko=({name:e,selectedValue:t,gridEnabled:a,slideshowEnabled:i})=>ve({name:e,selectedValue:se(t),options:wr({gridEnabled:a,slideshowEnabled:i})}),Eo=class extends HTMLElement{connectedCallback(){this._requestHomeAssistantDirtyStateContext(),this._scheduleEditorPreviewLayoutSync()}_requestHomeAssistantDirtyStateContext(){if(this._haDirtyStateContext||this._haDirtyStateRequestPending)return;this._haDirtyStateRequestPending=!0;const e=new Event("context-request",{bubbles:!0,composed:!0});e.context=xo,e.subscribe=!0,e.callback=(t,a)=>{this._haDirtyStateRequestPending=!1,!(!t||typeof t.setState!="function")&&(this._haDirtyStateContext=t,typeof a=="function"&&!this._haDirtyStateUnsubscribe&&(this._haDirtyStateUnsubscribe=a),this._seedHomeAssistantDirtyState())},this.dispatchEvent(e),this._haDirtyStateRequestPending=!1}_seedHomeAssistantDirtyState(){const e=this._haDirtyStateContext;if(!e||this._haDirtyBaselineConfig===void 0||(this._haDirtyStateSeeded||(this._haDirtyStateSeeded=!0,e.setState(this._haDirtyBaselineConfig,li)),this._pendingHaDirtyConfig===void 0))return;const t=this._pendingHaDirtyConfig;this._pendingHaDirtyConfig=void 0,e.setState(t,li)}_findHomeAssistantEditCardDialog(){let e=this,t=0;for(;e&&t<16;){if(String(e.tagName||"").toUpperCase()==="HUI-DIALOG-EDIT-CARD")return e;e=e.getRootNode?.()?.host||e.parentNode||e.host,t+=1}return document.querySelector?.("hui-dialog-edit-card")||null}_queryOpenShadowRoots(e,t){if(!e||!t)return null;const a=[e],i=new Set;for(;a.length;){const r=a.shift();if(!r||i.has(r))continue;i.add(r);const o=r.querySelector?.(t);if(o)return o;r.querySelectorAll?.("*").forEach(n=>{n.shadowRoot&&!i.has(n.shadowRoot)&&a.push(n.shadowRoot)})}return null}_queryAllOpenShadowRoots(e,t,{stopAtTagNames:a=[]}={}){if(!e||!t)return[];const i=new Set(a.map(s=>String(s||"").toUpperCase())),r=[],o=[e],n=new Set;for(;o.length;){const s=o.shift();!s||n.has(s)||(n.add(s),s.querySelectorAll?.(t).forEach(d=>{r.push(d)}),s.querySelectorAll?.("*").forEach(d=>{i.has(String(d.tagName||"").toUpperCase())||d.shadowRoot&&!n.has(d.shadowRoot)&&o.push(d.shadowRoot)}))}return[...new Set(r)]}_findHomeAssistantCardPreview(){const e=new Set;let t=this,a=0;for(;t&&a<16;){const r=t.getRootNode?.();if(r&&!e.has(r)){e.add(r);const o=this._queryOpenShadowRoots(r,".element-preview");if(o)return o}t=r?.host&&r.host!==t?r.host:t.parentNode||t.host,a+=1}const i=document.querySelector?.("hui-dialog-edit-card");return this._queryOpenShadowRoots(i?.shadowRoot||i,".element-preview")}_editorPreviewLayoutTargets(e){const t=this._queryAllOpenShadowRoots(e,["hui-section[preview]","hui-grid-section","ha-sortable",".container",".card.full-width","hui-card","frigate-view-card"].join(","),{stopAtTagNames:["frigate-view-card"]});return[...new Set([e,...t])]}_ensureEditorPreviewLayoutObserver(){const e=document.querySelector?.("hui-dialog-edit-card"),t=e?.shadowRoot||e;!t||!("MutationObserver"in window)||this._editorPreviewLayoutObserverTarget!==t&&(this._editorPreviewLayoutObserver?.disconnect(),this._editorPreviewLayoutObserver=new MutationObserver(()=>{this._scheduleEditorPreviewLayoutSync()}),this._editorPreviewLayoutObserver.observe(t,{childList:!0,subtree:!0,attributes:!0,attributeFilter:["class","open","opened","fullscreen"]}),this._editorPreviewLayoutObserverTarget=t)}_restoreEditorPreviewLayout(){(this._editorPreviewOriginalStyles||[]).forEach(e=>{e?.element?.style&&Object.entries(e.properties||{}).forEach(([t,{value:a,priority:i}])=>{a?e.element.style.setProperty(t,a,i):e.element.style.removeProperty(t)})}),this._editorPreviewOriginalStyles=[]}_syncEditorPreviewLayout(){const e=this._findHomeAssistantCardPreview();if(!e?.style)return;this._ensureEditorPreviewLayoutObserver();const t=this._editorPreviewLayoutTargets(e),a=this._editorPreviewOriginalStyles||[];(a.length!==t.length||t.some((r,o)=>a[o]?.element!==r))&&(this._restoreEditorPreviewLayout(),this._editorPreviewOriginalStyles=t.map(r=>{const o={};return["width","max-width","min-width","flex","align-self","box-sizing"].forEach(n=>{o[n]={value:r.style.getPropertyValue(n),priority:r.style.getPropertyPriority(n)}}),{element:r,properties:o}})),t.forEach(r=>{r.style.setProperty("width","100%","important"),r.style.setProperty("max-width","none","important"),r.style.setProperty("min-width","0","important"),r.style.setProperty("align-self","stretch","important"),r.style.setProperty("box-sizing","border-box","important"),r===e&&r.style.setProperty("flex","1 1 0","important")})}_scheduleEditorPreviewLayoutSync(){this._editorPreviewLayoutSyncQueued||(this._editorPreviewLayoutSyncQueued=!0,queueMicrotask(()=>{this._editorPreviewLayoutSyncQueued=!1,this.isConnected&&this._syncEditorPreviewLayout()}))}_ensurePtzCapabilityCache(){this._ptzCapabilityCache instanceof Map||(this._ptzCapabilityCache=new Map)}_ensureGo2RtcMetadataCache(){this._go2rtcMetadataCache instanceof Map||(this._go2rtcMetadataCache=new Map)}_ensureHaCameraCapabilityCache(){this._haCameraCapabilityCache instanceof Map||(this._haCameraCapabilityCache=new Map)}_editorCapabilityCacheNow(){return Date.now()}_frigateCapabilityCacheKey(e){const t=String(e||"").trim(),a=this._cameraEntityCapabilityLookupContext(t);return JSON.stringify([t,a?.instanceId||"",a?.cameraName||""])}_haCameraCapabilityCacheKey(e){const t=String(e||"").trim(),a=this._hass?.states?.[t],i=a?.attributes||{};return JSON.stringify([t,!!a,i.supported_features??null,i.frontend_stream_type??null,i.frontend_stream_types??null])}_pruneChangedCapabilityCacheEntries(e,t){e instanceof Map&&e.forEach((a,i)=>{(!a?.entity||i!==t(a.entity))&&e.delete(i)})}_pruneChangedCapabilityCaches(){this._pruneChangedCapabilityCacheEntries(this._ptzCapabilityCache,e=>this._frigateCapabilityCacheKey(e)),this._pruneChangedCapabilityCacheEntries(this._go2rtcMetadataCache,e=>this._frigateCapabilityCacheKey(e)),this._pruneChangedCapabilityCacheEntries(this._haCameraCapabilityCache,e=>this._haCameraCapabilityCacheKey(e))}_cameraEntityCapabilityLookupContext(e){const t=this._hass?.states?.[e];if(!t)return null;const a=t.attributes||{},i=a.client_id||a.mqtt_client_id||"",r=a.camera_name||e.replace(/^camera\./,"");return!i||!r?null:{instanceId:i,cameraName:r}}async _fetchPtzCapabilityForEntity(e){const t=String(e||"").trim();if(!t||!this._hass?.callWS)return null;this._ensurePtzCapabilityCache();const a=this._frigateCapabilityCacheKey(t),i=this._ptzCapabilityCache.get(a);if(i?.resolved)return i.info;if(i?.promise)return i.promise;const r=this._cameraEntityCapabilityLookupContext(t);if(!r){const n={entity:t,resolved:!0,info:null,promise:null};return this._ptzCapabilityCache.set(a,n),null}const o={entity:t,resolved:!1,info:null,promise:null};return o.promise=(async()=>{try{const n=Ba(await this._hass.callWS({type:"frigate/ptz/info",instance_id:r.instanceId,camera:r.cameraName}));o.info=Array.isArray(n)?n[0]||null:n||null}catch(n){console.warn("[Frigate] Editor PTZ info fetch failed",n),o.info=null}finally{o.resolved=!0,o.promise=null}return o.info})(),this._ptzCapabilityCache.set(a,o),o.promise}async _fetchGo2RtcStreamMetadataForEntity(e){const t=String(e||"").trim();if(!t||!this._hass?.callWS)return null;this._ensureGo2RtcMetadataCache();const a=this._frigateCapabilityCacheKey(t),i=this._go2rtcMetadataCache.get(a),r=this._editorCapabilityCacheNow();if(i?.resolved&&i.expiresAt>r)return i.info;if(i?.promise)return i.promise;i&&this._go2rtcMetadataCache.delete(a);const o=this._cameraEntityCapabilityLookupContext(t);if(!o){const s={entity:t,resolved:!0,info:null,promise:null,expiresAt:r+di};return this._go2rtcMetadataCache.set(a,s),null}const n={entity:t,resolved:!1,info:null,promise:null,expiresAt:0};return n.promise=(async()=>{try{const s=`/api/frigate/${encodeURIComponent(o.instanceId)}/go2rtc/api/streams?src=${encodeURIComponent(o.cameraName)}&video=all&audio=all&microphone`,c=(await this._hass.callWS({type:"auth/sign_path",path:s,expires:3600}))?.path||s,h=await fetch(`${window.location.origin}${c}`,{method:"GET",cache:"no-store",credentials:"same-origin"});if(!h.ok)throw new Error(`HTTP ${h.status}`);n.info=await h.json()}catch(s){console.warn("[Frigate] Editor go2rtc metadata fetch failed",s),n.info=null}finally{n.resolved=!0,n.promise=null,n.expiresAt=this._editorCapabilityCacheNow()+di}return n.info})(),this._go2rtcMetadataCache.set(a,n),n.promise}async _fetchHaCameraCapabilitiesForEntity(e){const t=String(e||"").trim();if(!t||!this._hass?.callWS)return null;this._ensureHaCameraCapabilityCache();const a=this._haCameraCapabilityCacheKey(t),i=this._haCameraCapabilityCache.get(a);if(i?.resolved)return i.info;if(i?.promise)return i.promise;const r={entity:t,resolved:!1,info:null,promise:null};return r.promise=(async()=>{try{r.info=Ba(await this._hass.callWS({type:"camera/capabilities",entity_id:t}))}catch(o){console.warn("[Frigate] Home Assistant camera capability fetch failed",o),r.info=null}finally{r.resolved=!0,r.promise=null}return r.info})(),this._haCameraCapabilityCache.set(a,r),r.promise}_setRangeValueOutput(e,t,a=""){const i=this.querySelector(`${e}-output`);if(!i)return;const r=Number(t);i.textContent=Number.isFinite(r)?`${r}${a}`:i.textContent}_syncStreamHeightOutput(){const e=this.querySelector("#stream_height-output");if(!e)return;const t=Je(this.querySelector("#stream_height")?.value),a=Qe(this.querySelector('[name="stream_height_unit"]:checked')?.value||this.querySelector("#stream_height_unit")?.dataset.value||this.querySelector("#stream_height_unit")?.value);e.textContent=`${t}${a}`}_syncCameraModalPtzVisibility({supported:e=!1,loading:t=!1,sourceType:a=B,preserveSelection:i=!1}={}){const r=this.querySelector("#camera-modal-ptz-toggle-row"),o=this.querySelector("#camera-modal-ptz-state"),n=this.querySelector("#camera-modal-ptz-enabled"),s=this.querySelector("#camera-modal-ptz-rotation-row");r&&(r.style.display=e||t?"block":"none"),n&&(n.disabled=!e||t,n.dataset.supported=e?"true":"false",!e&&!t&&!i&&(n.checked=!1)),s&&(s.hidden=!e||t||v(n)!==!0);const d=J(a)==="ha_direct";o&&(t?(o.style.display="block",o.textContent=d?"Checking Frigate PTZ support. Home Assistant remains the live connection.":"Checking Frigate PTZ support for this camera."):e?(o.style.display="none",o.textContent=""):(o.style.display="block",o.textContent="Frigate did not report PTZ pan/tilt support for this camera.")),this._syncCameraModalAccordionSummaries()}_syncCameraModalTwoWayTalkVisibility({supported:e=!1,loading:t=!1,sourceType:a=B,preserveSelection:i=!1}={}){const r=this.querySelector("#camera-modal-two-way-talk-toggle-row"),o=this.querySelector("#camera-modal-two-way-talk-enabled"),n=this.querySelector("#camera-modal-two-way-talk-state"),s=J(a)==="ha_direct"?"Home Assistant":"Frigate",d=J(a)==="ha_direct",c=e||t||i,h=e||i;r&&(r.style.display=c?"block":"none"),n&&(t?(n.style.display="block",n.textContent=d?"Checking Home Assistant WebRTC playback support for this camera.":`Checking ${s} two-way talk support for this camera.`):e?d?(n.style.display="block",n.textContent="Experimental: Home Assistant reports WebRTC playback, but does not report talkback capability. Enable only if this camera's Home Assistant WebRTC path accepts outgoing audio."):(n.style.display="none",n.textContent=""):(n.style.display="block",n.textContent=d?"Home Assistant did not report WebRTC playback for this camera, which is required for HA-direct two-way talk.":`${s} did not report two-way talk support for this camera.`)),o&&(o.dataset.supported=e?"true":"false",o.disabled=!h||t,!e&&!t&&!i&&(o.checked=!1)),this._syncCameraModalAccordionSummaries()}async _refreshCameraModalPtzSupport(){const e=this._cameraModalEntityValue(),t=this._cameraModalConnectionTypeValue(),a=J(t);if(!e){this._syncCameraModalPtzVisibility({supported:!1,loading:!1,sourceType:a});return}this._syncCameraModalPtzVisibility({supported:!1,loading:!0,sourceType:a,preserveSelection:!0});const i=(this._cameraModalPtzToken||0)+1;this._cameraModalPtzToken=i;const r=await this._fetchPtzCapabilityForEntity(e);if(this._cameraModalPtzToken!==i)return;const o=xr(r);this._syncCameraModalPtzVisibility({supported:o,loading:!1,sourceType:a,preserveSelection:o})}async _refreshCameraModalTwoWayTalkSupport(){const e=this._cameraModalEntityValue(),t=this._cameraModalConnectionTypeValue(),a=J(t),i=a==="ha_direct";if(!e){this._syncCameraModalTwoWayTalkVisibility({supported:!1,loading:!1,sourceType:a});return}if(i){this._syncCameraModalTwoWayTalkVisibility({supported:!1,loading:!0,sourceType:a,preserveSelection:!0});const s=(this._cameraModalTwoWayTalkToken||0)+1;this._cameraModalTwoWayTalkToken=s;const d=await this._fetchHaCameraCapabilitiesForEntity(e);if(this._cameraModalTwoWayTalkToken!==s)return;const c=Kr(d);this._syncCameraModalTwoWayTalkVisibility({supported:c,loading:!1,sourceType:a,preserveSelection:c});return}this._syncCameraModalTwoWayTalkVisibility({supported:!1,loading:!0,sourceType:a,preserveSelection:!0});const r=(this._cameraModalTwoWayTalkToken||0)+1;this._cameraModalTwoWayTalkToken=r;const o=await this._fetchGo2RtcStreamMetadataForEntity(e);if(this._cameraModalTwoWayTalkToken!==r)return;const n=Ur(o);this._syncCameraModalTwoWayTalkVisibility({supported:n,loading:!1,sourceType:a,preserveSelection:n})}_normalizeHiddenTabs(e){return Array.isArray(e)?e.map(t=>t==="reviews"?"alerts":t).filter(t=>Pe.includes(t)):[...Ze]}_syncHiddenTabsDraftFromConfig(e=this._config){this._hiddenTabsDraft=this._normalizeHiddenTabs(e?.hidden_tabs)}_isTabVisibleFromEvent(e){const t=e?.detail?.value;if(typeof t=="boolean")return t;const a=e?.currentTarget||e?.target;return v(a)}_setHiddenTabFromToggle(e,t){if(!Pe.includes(e))return;const a=new Set(this._normalizeHiddenTabs(this._hiddenTabsDraft));t?a.delete(e):a.add(e),this._hiddenTabsDraft=[...a]}disconnectedCallback(){this._textPreviewUpdateT&&(clearTimeout(this._textPreviewUpdateT),this._textPreviewUpdateT=null),this._livePreviewRaf&&(cancelAnimationFrame(this._livePreviewRaf),this._livePreviewRaf=0),this._pendingEditorPreviewUpdate=!1,this._previewUpdateRaf&&(cancelAnimationFrame(this._previewUpdateRaf),this._previewUpdateRaf=0),this._pendingEditorPreviewRouteIntent=null,this._editorPreviewLayoutObserver?.disconnect(),this._editorPreviewLayoutObserver=null,this._editorPreviewLayoutObserverTarget=null,this._restoreEditorPreviewLayout(),this._settingsPanelScrollCleanup?.(),this._settingsPanelScrollCleanup=null,this._settingsPanelResizeObserver?.disconnect?.(),this._settingsPanelResizeObserver=null,Array.isArray(this._boundDialogActionButtons)&&this._boundDialogActionButtons.forEach(({element:e,handler:t})=>{e?.removeEventListener?.("click",t,!0)}),this._boundDialogActionButtons=[],this._onDialogPrimaryActionClick&&document.removeEventListener("click",this._onDialogPrimaryActionClick,!0),this._onDialogSecondaryActionClick&&document.removeEventListener("click",this._onDialogSecondaryActionClick,!0),this._onCameraModalDocumentClick&&document.removeEventListener("click",this._onCameraModalDocumentClick,!0),this._haDirtyStateUnsubscribe?.(),this._haDirtyStateUnsubscribe=null,this._haDirtyStateContext=null,this._haDirtyStateRequestPending=!1,this._haDirtyStateSeeded=!1,this._dialogActionHooksBound=!1,this._standaloneDraftPreviousLandingPage=null,this._emitPreviewDraft(null)}_configSignature(e){try{return JSON.stringify(e||{})}catch{return""}}_syncConfigSaveReminder(){const e=this.querySelector?.("#config-save-reminder");if(!e)return;const t=this._hasConfigDraft===!0;e.hidden=!1,e.dataset&&(e.dataset.configSaveState=t?"dirty":"clean"),e.setAttribute?.("data-config-save-state",t?"dirty":"clean");const a=e.querySelector?.("[data-config-save-reminder-text]");a&&(a.textContent=t?"Unsaved changes \u2014 use Home Assistant's Save button to apply them.":"No pending changes.")}_syncCardVersionStatus(){const e=this.querySelector?.("#card-version-status"),t=this.querySelector?.("#card-version-update-status"),a=this.querySelector?.("#card-version-update-link");if(!e||!t||!a)return;const i=this._hass?.states;this._cardUpdateEntityId&&i&&!i[this._cardUpdateEntityId]&&(this._cardUpdateEntityId="",this._cardUpdateEntityLookupComplete=!1);let r;this._cardUpdateEntityId&&i?.[this._cardUpdateEntityId]?r=Ja({states:{[this._cardUpdateEntityId]:i[this._cardUpdateEntityId]}}):this._cardUpdateEntityLookupComplete?r={entityId:"",status:"unavailable",label:"Update status unavailable"}:(r=Ja({states:i}),i&&(this._cardUpdateEntityLookupComplete=!0,this._cardUpdateEntityId=r.entityId)),e.dataset.updateStatus!==r.status&&(e.dataset.updateStatus=r.status),t.textContent!==r.label&&(t.textContent=r.label);const o=r.status==="available"&&!!r.entityId;a.hidden=!o,a.dataset.entityId!==r.entityId&&(a.dataset.entityId=r.entityId)}_syncEnvironmentSupportNotice(e,t){const a=this.querySelector?.(e);if(!a)return;const i=a.querySelector?.("[data-environment-support-text]");i&&i.textContent!==t.label&&(i.textContent=t.label),a.dataset.supportStatus!==t.status&&(a.dataset.supportStatus=t.status),a.hidden=!t.visible}_syncEnvironmentSupportNotices(){const e=bo({currentVersion:this._hass?.config?.version,recommendedVersion:tr}),t=fo({installed:wo(this._hass)});this._syncEnvironmentSupportNotice("[data-home-assistant-version-notice]",e),this._syncEnvironmentSupportNotice("[data-frigate-integration-status]",t)}_openCardUpdateDialog(e){const t=String(e||"").trim();t&&this.dispatchEvent(new CustomEvent("hass-more-info",{bubbles:!0,composed:!0,detail:{entityId:t}}))}setConfig(e){this._sourceConfig=e;const t=this._normalizeConfig(e);this._standaloneDraftPreviousLandingPage===void 0&&(this._standaloneDraftPreviousLandingPage=null),this._syncHiddenTabsDraftFromConfig(t),this._activeSettingsPanelId===void 0&&(this._activeSettingsPanelId=null);const a=this._configSignature(t),i=this._configSignature(this._config);if(this._rendered&&a===i){this._config=t,this._scheduleEditorPreviewLayoutSync();return}this._config=t,this._rendered=!0,this._render(),this._haDirtyBaselineConfig===void 0&&(this._haDirtyBaselineConfig=this._homeAssistantConfig({readDom:!1}),this._haDirtyBaselineSig=this._configSignature(this._haDirtyBaselineConfig),this._hasConfigDraft=!1,this._seedHomeAssistantDirtyState()),this._scheduleEditorPreviewLayoutSync()}set hass(e){this._hass=e,this._pruneChangedCapabilityCaches();const t=this._hass?.themes?.darkMode?"dark":"light",a=`${this._frigateEntities().join(",")}|${t}`;a!==this._lastEntityKey&&(this._lastEntityKey=a,this._rendered&&this._render()),this._syncCardVersionStatus(),this._syncEnvironmentSupportNotices(),this._scheduleEditorPreviewLayoutSync()}_normalizeConfig(e){return ho(e)}_dashboardSwipeOwnershipState(){const e=this._config?.ha_dashboard_swipe_navigation_owner===!0,t=ti(null,globalThis.document),a=t?.lovelace?.config||null;if(!a)return{requested:e,isOwner:e,locked:!1,conflict:!1,owner:null,ownerPage:"",dashboardName:""};const i=no(a,Ne),r=ai({panel:t,windowRef:globalThis.window}),o=i.cards.find(({config:S})=>S===this._sourceConfig),n=i.cards.filter(({viewName:S})=>S===r),s=i.owner?.viewName===r&&n.length===1,d=!!i.owner&&(i.owner===o||s),c=e&&(!i.owner||d),h=e&&!!i.owner&&!c,p=!!i.owner&&!d,k=(String(a?.title||"").trim()||String(t?.route?.prefix||"this dashboard").replace(/^\/+/,"").replace(/[-_]+/g," ")).replace(/^dashboard\s+/i,""),f=i.owner?.viewTitle||i.owner?.viewName||r||"another page";return{requested:e,isOwner:c,locked:p,conflict:h,owner:i.owner,ownerPage:f,dashboardName:k}}_dashboardNavbarOwnershipState(){const e=this._config?.mobile_view_ha_navbar_dashboard===!0,t=ti(null,globalThis.document),a=t?.lovelace?.config||null;if(!a)return{requested:e,isOwner:e,locked:!1,conflict:!1,owner:null,ownerPage:"",dashboardName:""};const i=ai({panel:t,windowRef:globalThis.window}),r=to({dashboardConfig:a,sourceConfig:this._sourceConfig,requested:e,cardTag:Ne,currentViewName:i}),n=(String(a?.title||"").trim()||String(t?.route?.prefix||"this dashboard").replace(/^\/+/,"").replace(/[-_]+/g," ")).replace(/^dashboard\s+/i,""),s=r.owner?.viewTitle||r.owner?.viewName||i||"another page";return{...r,ownerPage:s,dashboardName:n}}_landingPageOptionSignature(e){const t=this._normalizeConfig(e),a=oe(t,V.desktop).join("|"),i=It(t).join("|");return`${a}::${i}::${t.landing_page}::${t.mobile_page}::${Ve(t)}`}_frigateEntities(){const e=this._hass?.states||{},t=Object.keys(e).filter(i=>{if(!i.startsWith("camera."))return!1;const r=e[i]?.attributes;return!!(r?.client_id||r?.mqtt_client_id||r?.camera_name)}),a=this._frigateEntitySet;return a instanceof Set&&a.size===t.length&&t.every(i=>a.has(i))?this._frigateEntityList:(t.sort(),this._frigateEntitySet=new Set(t),this._frigateEntityList=t,t)}_timezoneDisplay(){const e=this._hass?.config?.time_zone||"UTC";try{return`${new Intl.DateTimeFormat(void 0,{timeZone:e,timeZoneName:"longGeneric"}).formatToParts(new Date).find(i=>i.type==="timeZoneName")?.value||e} (${e})`}catch{return e.replace(/_/g," ")}}_rgbToHex(e){const t=String(e||"").trim().match(/^rgba?\((\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i);if(!t)return"";const a=i=>Math.max(0,Math.min(255,Number(i)||0)).toString(16).padStart(2,"0");return`#${a(t[1])}${a(t[2])}${a(t[3])}`}_resolveColorToHex(e,t="#000000"){if(!e)return t;const a=_e(e);if(a)return a;const i=document.createElement("span");if(i.style.color=String(e),!i.style.color)return t;this.appendChild(i);const r=getComputedStyle(i).color;return i.remove(),this._rgbToHex(r)||t}_activeThemeModeKey(){return Mt(this._hass?.themes?.darkMode===!0?"dark":"light")}_deriveDarkPrimaryHex(){const e=_e(this._resolveColorToHex("var(--primary-color)",""));if(!e)return this._resolveColorToHex(wa["--c-primary-d"],"#000000");const t=a=>Math.round(Number.parseInt(e.slice(a,a+2),16)*.75).toString(16).padStart(2,"0");return`#${t(1)}${t(3)}${t(5)}`}_themeDefaultHex(e,t=this._activeThemeModeKey()){const a=Mt(t),i=uo(this._hass,{mode:a});if(e==="--c-primary-d"&&i.deriveDarkPrimary)return this._deriveDarkPrimaryHex();if(e==="--c-bg-tabs-holder"){const r=i.source==="custom"||a==="dark";return this._resolveColorToHex(r?"var(--primary-background-color)":"var(--secondary-background-color)",a==="dark"?"#181818":"#f0f0f0")}return e==="--c-bg-mobile-list"||e==="--c-bg-list"||e==="--c-bg-cam-btn"?i.source==="custom"?this._resolveColorToHex("var(--secondary-background-color)",a==="dark"?"#181818":"#f0f0f0"):a==="dark"?"#181818":"#f0f0f0":this._resolveColorToHex(wa[e],"#000000")}_themeDefaultHexMap(){return Object.fromEntries(me.map(e=>[e,Object.fromEntries(qt.map(t=>[t.key,this._themeDefaultHex(t.key,e)]))]))}_ensureThemeDraftCache(){const e=Object.fromEntries(me.map(a=>{const i=this._themeDraftCache?.[a],r=Object.fromEntries(Object.entries(i&&typeof i=="object"?i:{}).map(([o,n])=>[o,_e(n)]).filter(([,o])=>!!o));return[a,r]})),{overrides:t}=Wt(this._config?.theme_custom,this._activeThemeModeKey());for(const a of me)Object.assign(e[a],t);this._themeDraftCache=e}_cameraLabel(e){const t=String(e?.name||"").trim();if(t)return t;const a=String(e?.entity||"").trim();return a?a.replace(/^camera\./,"").replace(/_/g," "):"Select camera"}_cameraConnectionLabel(e){return J(e)==="ha_direct"?"HA direct":"Frigate go2rtc"}_cameraAlertsContentLabel(e){return Jt(e)==="all_reviews"?"All reviews":"Alerts only"}_cameraPtzLabel(e){return Ct({ptz:e})?"PTZ on":""}_cameraTwoWayTalkLabel(e){return e===!0?"Two-Way Talk on":""}_cameraLinkedLightLabel(e){const t=qa(e).map(({entity:a})=>si(a,this._hass?.states?.[a]));return t.length?`${t.length>1?"Lights":"Light"}: ${t.join(", ")}`:""}_cameraMetaLabel(e){return[...Gt(e)?["2-camera group",et(e.group?.layout)===ye.stacked?"Stacked":"Side by Side"]:[],this._cameraConnectionLabel(e?.connection_type),this._cameraAlertsContentLabel(e?.alerts_content),this._cameraPtzLabel(e?.ptz),this._cameraTwoWayTalkLabel(e?.two_way_talk),this._cameraLinkedLightLabel(e)].filter(Boolean).join(" \xB7 ")}_reorderCameras(e,t,a="replace"){if(e===t||e<0||t<0)return;const i=[...this._getCams()];if(e>=i.length||t>=i.length)return;const r=Ga(i,e,t,a);this._config={...this._config,cameras:r},this._render(),this._publishPreviewDraft(),this._markHomeAssistantDirty(this._homeAssistantConfig({readDom:!1}))}_setCameraModalAccordionActive(e=null){const t=String(e||"");this.querySelectorAll(".camera-modal-accordion[data-camera-modal-section]").forEach(a=>{const i=a.dataset.cameraModalSection===t;a.classList.toggle("active",i),a.querySelector("[data-camera-modal-accordion-toggle]")?.setAttribute("aria-expanded",i?"true":"false");const r=a.querySelector(".camera-modal-accordion-content");r&&(r.hidden=!i)})}_toggleCameraModalAccordion(e){const t=this.querySelector(`.camera-modal-accordion[data-camera-modal-section="${String(e||"")}"]`);this._setCameraModalAccordionActive(t?.classList.contains("active")?null:e)}_setCameraModalAccordionSummary(e,t){const a=this.querySelector(`#camera-modal-${e}-summary`);if(!a)return;const i=String(t||"").trim();a.textContent=i,a.title=i,a.hidden=!i}_cameraModalEntityLabel(e){const t=String(e||"").trim();return String(this._hass?.states?.[t]?.attributes?.friendly_name||t.replace(/^[^.]+\./,"").replace(/_/g," ")).trim()}_syncCameraModalAccordionSummaries(){this._setCameraModalAccordionSummary("connection",this._cameraModalConnectionTypeValue()==="ha_direct"?"Home Assistant":"Frigate go2rtc");const e=this._cameraModalGroupEnabled?this._cameraModalSecondaryEntityValue():"";this._setCameraModalAccordionSummary("additional",this._cameraModalEntityLabel(e)||"None configured");const t=[0,1].filter(i=>this._cameraModalLightEnabledAt(i)).map(i=>this._cameraModalLightEntityValue(i)).filter(Boolean).map(i=>si(i,this._hass?.states?.[i]));this._setCameraModalAccordionSummary("lights",t.join(", ")||"None configured");const a=[];v(this.querySelector("#camera-modal-ptz-enabled"))&&a.push("PTZ"),v(this.querySelector("#camera-modal-two-way-talk-enabled"))&&a.push("Two-Way Talk"),this._setCameraModalAccordionSummary("options",a.join(" \xB7 "))}_syncLimitedTextField(e,t,a){const i=this.querySelector(e);if(!i)return"";const r=q(a??i.value);i.value!==r&&(i.value=r);const o=this.querySelector(t);return o&&(o.textContent=`${r.length}/${ne}`),r}_wireLimitedTextField(e,t){const a=this.querySelector(e);if(!a)return;a.maxLength=ne,a.setAttribute?.("maxlength",String(ne));const i=r=>this._syncLimitedTextField(e,t,r?.detail?.value??a.value);["input","value-changed","change"].forEach(r=>a.addEventListener(r,i)),i()}_openCameraModal(e=null){const t=this._getCams(),a=e==null?{entity:"",name:"",connection_type:B,alerts_content:"alerts_only",ptz:null}:t[e]||{};this._editingCamIndex=e,this._cameraModalNameBeforeGroup=String(a?.name||""),this._cameraModalAssignedGroupName="";const i=this.querySelector("#camera-modal-title"),r=this.querySelector("#camera-modal-save"),o=this.querySelector("#camera-modal"),n=this.querySelector("#camera-modal-name"),s=this.querySelector("#camera-modal-entity"),d=this.querySelector("#camera-modal-secondary-entity"),c=this.querySelector("#camera-modal-connection-type"),h=this.querySelector("#camera-modal-all-reviews"),p=this.querySelector("#camera-modal-ptz-enabled"),g=this.querySelector("#camera-modal-two-way-talk-enabled"),k=qa(a),f=this.querySelector("#camera-modal-helper"),S=J(a?.connection_type);if(i&&(i.textContent=e==null?"Add Camera":"Edit Camera"),r&&(r.textContent=e==null?"Add":"Update"),n&&(n.value=q(a?.name)),s&&(s.value=a?.entity||"",s.dataset.value=a?.entity||""),d){const x=a?.group?.secondary_entity||"";d.value=x,d.dataset.value=x}this._cameraModalGroupEnabled=Gt(a);const j=et(a?.group?.layout);if(this.querySelectorAll('[name="camera-modal-group-layout"]').forEach(x=>{x.checked=x.value===j}),this._syncCameraModalGroupFields(),c){const x=J(a?.connection_type);c.value=x,c.dataset.value=x}h&&(h.checked=Jt(a?.alerts_content)==="all_reviews"),p&&(p.checked=Ct(a));const R=Yt(a?.ptz?.rotation);this.querySelectorAll('[name="camera-modal-ptz-rotation"]').forEach(x=>{x.checked=Number(x.value)===R}),g&&(g.checked=a?.two_way_talk===!0),[0,1].forEach(x=>{const N=k[x]||null;this._setCameraModalLightFieldValues(x,N),this._setCameraModalLightEnabledState(x,!!N),this._syncCameraModalLightIconContext(N?.entity||"",x)}),this._syncCameraModalLightFields(),this._setCameraModalAccordionActive(),f&&(f.textContent=""),this._cameraModalSelectorDismissPending=!1,this._cameraModalSuppressedClickEvent=null,o&&o.classList.remove("hidden"),this._syncCameraModalPtzVisibility({supported:Ct(a),loading:!!a?.entity,sourceType:S,preserveSelection:Ct(a)}),this._syncCameraModalTwoWayTalkVisibility({supported:!1,loading:!!a?.entity,sourceType:S,preserveSelection:a?.two_way_talk===!0}),this._syncLimitedTextField("#camera-modal-name","#camera-modal-name-counter"),this._syncCameraModalAccordionSummaries(),this._refreshCameraModalPtzSupport(),this._refreshCameraModalTwoWayTalkSupport()}_closeCameraModal(){const e=this.querySelector("#camera-modal");e&&e.classList.add("hidden"),this._editingCamIndex=null,this._cameraModalGroupEnabled=!1,this._cameraModalLightEnabled=!1,this._cameraModalSecondLightEnabled=!1,this._cameraModalNameBeforeGroup="",this._cameraModalAssignedGroupName="",this._cameraModalSelectorDismissPending=!1,this._cameraModalSuppressedClickEvent=null}_gridOrderCameraLabel(e){const t=String(e?.entity||"").trim(),i=String(this._hass?.states?.[t]?.attributes?.friendly_name||"").trim()||t.replace(/^camera\./,"").replace(/_/g," ")||"Camera",r=String(e?.group_member||"").trim();return r==="A"||r==="B"?`Camera ${r} [${i}]`:this._cameraLabel(e)}_handleCameraModalDocumentClick(e){const t=this.querySelector("#camera-modal");if(!t||t.classList.contains("hidden"))return;const a=t.querySelector?.(".cam-modal-card");if(!a)return;this._cameraModalSuppressedClickEvent=null;const i=e?.composedPath?.(),r=Array.isArray(i)?i:[],o=e?.target||null,n=c=>!!(c&&typeof c=="object"&&typeof c.nodeType=="number"&&a.contains(c)),s=r.includes(a)||r.some(c=>n(c))||n(o),d=r.some(c=>yo.has(String(c?.id||"")));if(s){this._cameraModalSelectorDismissPending=d;return}if(d||this._cameraModalSelectorDismissPending){this._cameraModalSelectorDismissPending=!1,this._cameraModalSuppressedClickEvent=e;return}this._closeCameraModal()}_openCameraDeleteConfirmation(e){const t=this._getCams();if(!Number.isInteger(e)||e<0||e>=t.length)return;this._pendingCameraRemovalIndex=e;const a=this.querySelector("#camera-delete-message");a&&(a.textContent=`Are you sure you want to delete \u201C${this._cameraLabel(t[e])}\u201D? This action cannot be undone.`),this.querySelector("#camera-delete-modal")?.classList.remove("hidden"),this.querySelector("#camera-delete-confirm")?.focus?.()}_closeCameraDeleteConfirmation(){this.querySelector("#camera-delete-modal")?.classList.add("hidden"),this._pendingCameraRemovalIndex=null}_confirmCameraRemoval(){const e=this._pendingCameraRemovalIndex;this._closeCameraDeleteConfirmation(),Number.isInteger(e)&&this._removeCamera(e)}_standaloneLandingPageRoutes(){return oe({...this._config,card_view_standalone:!1},V.desktop)}_openStandaloneLandingPageModal(){if(this._standaloneLandingModalOpen)return;const t=this._standaloneLandingPageRoutes()[0]||u.singleView,a=this.querySelector("#standalone-landing-page");a&&(a.value=t,a.dataset.value=t);const i=this.querySelector("#standalone-landing-helper");i&&(i.textContent=""),this._standaloneLandingModalOpen=!0;const r=this.querySelector("#standalone-landing-modal");try{typeof r?.showModal=="function"?r.open||r.showModal():(r?.setAttribute?.("open",""),r?.classList?.remove?.("hidden"))}catch{r?.setAttribute?.("open",""),r?.classList?.remove?.("hidden")}a?.focus?.()}_closeStandaloneLandingPageModal({restoreToggle:e=!0}={}){const t=this.querySelector("#standalone-landing-modal");if(typeof t?.close=="function"&&t.open?t.close():(t?.removeAttribute?.("open"),t?.classList?.add?.("hidden")),this._standaloneLandingModalOpen=!1,e){const a=this.querySelector("#card_view_standalone");a&&(a.checked=!0,a.dataset.fvcStandaloneValue="true")}}_confirmStandaloneLandingPage(){const e=this.querySelector("#standalone-landing-page"),t=re(e?.dataset?.value||e?.value);if(!this._standaloneLandingPageRoutes().includes(t)){const i=this.querySelector("#standalone-landing-helper");i&&(i.textContent="Select an available landing page.");return}const a=this.querySelector("#landing_page");a&&(a.value=t,a.dataset.value=t),this._closeStandaloneLandingPageModal({restoreToggle:!1}),this._u({dispatch:!1,preview:!0,previewRouteIntent:{type:st.navigate,pageId:t}})}_wireStandaloneLandingPageTransition(e){const t=this.querySelector("#card_view_standalone");if(!t)return;t.dataset.fvcStandaloneValue=this._config?.card_view_standalone===!0?"true":"false";const a=i=>{const r=i?.detail?.value,o=typeof r=="boolean"?r:v(t),n=o?"true":"false";if(t.dataset.fvcStandaloneValue!==n){if(t.dataset.fvcStandaloneValue=n,o){if(this._config?.card_view_standalone!==!0){const s=this.querySelector("#landing_page");this._standaloneDraftPreviousLandingPage=re(s?.dataset?.value||s?.value||this._config?.landing_page),e?.({type:st.enterStandalone});return}e?.();return}if(this._standaloneDraftPreviousLandingPage){const s=this.querySelector("#landing_page");s&&(s.value=this._standaloneDraftPreviousLandingPage,s.dataset.value=this._standaloneDraftPreviousLandingPage),e?.({type:st.revertStandaloneDraft});return}this._openStandaloneLandingPageModal()}};["input","change","value-changed"].forEach(i=>{t.addEventListener(i,a)})}_cameraModalEntityValue(){const e=this.querySelector("#camera-modal-entity");return(e?.dataset?.value??e?.value??e?.__value??"").toString().trim()}_cameraModalSecondaryEntityValue(){const e=this.querySelector("#camera-modal-secondary-entity");return(e?.dataset?.value??e?.value??e?.__value??"").toString().trim()}_cameraModalGroupLayoutValue(){return et(this.querySelector('[name="camera-modal-group-layout"]:checked')?.value)}_syncCameraModalGroupFields(){const e=this._cameraModalGroupEnabled===!0,t=this.querySelector("#camera-modal-name"),a=this.querySelector("#camera-modal-add-secondary"),i=this.querySelector("#camera-modal-secondary-help"),r=this.querySelector("#camera-modal-remove-secondary"),o=this.querySelector("#camera-modal-group-fields"),n=e?"Group Name":"Camera Name";t&&(t.label=n,t.setAttribute?.("label",n),t.setAttribute?.("aria-label",n)),a&&(a.hidden=e),i&&(i.hidden=e),o&&(o.hidden=!e),r&&(r.textContent=this._cameraModalSecondaryEntityValue()?"Remove camera":"Cancel"),this._syncCameraModalAccordionSummaries()}_setCameraModalGroupEnabled(e){const t=this._cameraModalGroupEnabled===!0;this._cameraModalGroupEnabled=e===!0;const a=this.querySelector("#camera-modal-name");if(this._cameraModalGroupEnabled&&!t){if(!String(a?.value||"").trim()){const o=vr(this._getCams(),{excludeIndex:this._editingCamIndex});a&&(a.value=o),this._cameraModalAssignedGroupName=o}}else if(!this._cameraModalGroupEnabled&&t){const r=String(a?.value||"").trim();this._cameraModalAssignedGroupName&&r===this._cameraModalAssignedGroupName&&a&&(a.value=this._cameraModalNameBeforeGroup||""),this._cameraModalAssignedGroupName=""}if(!this._cameraModalGroupEnabled){const r=this.querySelector("#camera-modal-secondary-entity");r&&(r.value="",r.dataset.value="")}const i=this.querySelector("#camera-modal-helper");i&&(i.textContent=""),this._syncCameraModalGroupFields(),this._syncLimitedTextField("#camera-modal-name","#camera-modal-name-counter")}_cameraModalConnectionTypeValue(){const e=this.querySelector("#camera-modal-connection-type");return J(e?.dataset?.value||e?.value||B)}_cameraModalPtzRotationValue(){return Yt(this.querySelector('[name="camera-modal-ptz-rotation"]:checked')?.value)}_cameraModalLightSuffix(e=0){return e===1?"-2":""}_cameraModalLightEntityValue(e=0){const t=this.querySelector(`#camera-modal-light-entity${this._cameraModalLightSuffix(e)}`);return String(t?.dataset?.value??t?.value??t?.__value??"").trim()}_cameraModalLightIconValue(e=0){const t=this.querySelector(`#camera-modal-light-icon${this._cameraModalLightSuffix(e)}`);return String(t?.dataset?.value??t?.value??t?.__value??"").trim()}_cameraModalLightPositionValue(e=0){return Xt(this.querySelector(`[name="camera-modal-light-position${this._cameraModalLightSuffix(e)}"]:checked`)?.value)}_syncCameraModalLightIconContext(e=this._cameraModalLightEntityValue(),t=0){const a=this.querySelector(`#camera-modal-light-icon${this._cameraModalLightSuffix(t)}`);a&&(a.context=e?{icon_entity:e}:{})}_cameraModalLightEnabledAt(e=0){return e===1?this._cameraModalSecondLightEnabled===!0:this._cameraModalLightEnabled===!0}_setCameraModalLightEnabledState(e,t){if(e===1){this._cameraModalSecondLightEnabled=t===!0;return}this._cameraModalLightEnabled=t===!0}_setCameraModalLightFieldValues(e,t=null){const a=this._cameraModalLightSuffix(e),i=this.querySelector(`#camera-modal-light-entity${a}`),r=this.querySelector(`#camera-modal-light-icon${a}`),o=String(t?.entity||""),n=String(t?.icon||"");i&&(i.value=o,i.dataset.value=o),r&&(r.value=n,r.dataset.value=n);const s=Xt(t?.position);this.querySelectorAll(`[name="camera-modal-light-position${a}"]`).forEach(d=>{d.checked=d.value===s})}_syncCameraModalLightFields(){const e=this._cameraModalLightEnabledAt(0),t=this._cameraModalLightEnabledAt(1),a=this.querySelector("#camera-modal-add-light"),i=this.querySelector("#camera-modal-add-light-2");a&&(a.hidden=e),i&&(i.hidden=!e||t),[0,1].forEach(r=>{const o=this._cameraModalLightSuffix(r),n=this._cameraModalLightEnabledAt(r),s=this.querySelector(`#camera-modal-light-fields${o}`),d=this.querySelector(`#camera-modal-remove-light${o}`);s&&(s.hidden=!n),d&&(d.textContent=this._cameraModalLightEntityValue(r)?`Remove light${r===1?" 2":""}`:"Cancel")}),this._syncCameraModalAccordionSummaries()}_setCameraModalLightEnabled(e,t=0){if(!e&&t===0&&this._cameraModalLightEnabledAt(1)){const i={entity:this._cameraModalLightEntityValue(1),icon:this._cameraModalLightIconValue(1),position:this._cameraModalLightPositionValue(1)};this._setCameraModalLightFieldValues(0,i),this._setCameraModalLightEnabledState(0,!0),this._setCameraModalLightFieldValues(1,null),this._setCameraModalLightEnabledState(1,!1),this._syncCameraModalLightIconContext(i.entity,0),this._syncCameraModalLightIconContext("",1)}else this._setCameraModalLightEnabledState(t,e),e||(this._setCameraModalLightFieldValues(t,null),this._syncCameraModalLightIconContext("",t));const a=this.querySelector("#camera-modal-helper");a&&(a.textContent=""),this._syncCameraModalLightFields()}_saveCameraModal(){const e=this._cameraModalEntityValue(),t=this._cameraModalSecondaryEntityValue(),a=q(this.querySelector("#camera-modal-name")?.value).trim(),i=J(this.querySelector("#camera-modal-connection-type")?.dataset?.value||this.querySelector("#camera-modal-connection-type")?.value||B),r=this.querySelector("#camera-modal-all-reviews"),o=this.querySelector("#camera-modal-ptz-enabled"),n=this.querySelector("#camera-modal-two-way-talk-enabled"),s=v(r)===!0?"all_reviews":"alerts_only",c=o?.dataset?.supported==="true"&&v(o),h=v(n),p=[0,1].filter(E=>this._cameraModalLightEnabledAt(E)).map(E=>({entity:this._cameraModalLightEntityValue(E),icon:this._cameraModalLightIconValue(E),position:this._cameraModalLightPositionValue(E)})),g=kt(p),k=c?ot({enabled:!0,rotation:this._cameraModalPtzRotationValue()}):null,f=this.querySelector("#camera-modal-helper");if(!e){f&&(f.textContent="Camera is required.");return}if(this._cameraModalGroupEnabled&&!t){f&&(f.textContent="Second camera is required.");return}if(this._cameraModalGroupEnabled&&t===e){f&&(f.textContent="Choose two different cameras.");return}if(p.some(({entity:E})=>!E.startsWith("light."))){f&&(f.textContent="Select a light entity.");return}if(new Set(p.map(({entity:E})=>E)).size!==p.length){f&&(f.textContent="Choose two different lights.");return}const S=[...this._getCams()],j=S.flatMap((E,I)=>I===this._editingCamIndex?[]:at(E)),R=[e];if(this._cameraModalGroupEnabled&&R.push(t),R.some(E=>j.includes(E))){f&&(f.textContent="That camera is already configured.");return}const x=this._cameraModalGroupEnabled?tt({secondary_entity:t,layout:this._cameraModalGroupLayoutValue()},{primaryEntity:e}):null,N={entity:e,name:a,connection_type:i,alerts_content:s,ptz:k,...h?{two_way_talk:!0}:{},...x?{group:x}:{},...g.length?{linked_entities:g}:{}};if(this._editingCamIndex==null){if(Ut(S)+at(N).length>pe){f&&(f.textContent=`Maximum ${pe} cameras.`);return}S.push(N)}else if(S[this._editingCamIndex]){const E=[...S];if(E[this._editingCamIndex]=N,Ut(E)>pe){f&&(f.textContent=`Maximum ${pe} cameras.`);return}S[this._editingCamIndex]=N}this._config={...this._config,cameras:Zt(S,pe)},this._closeCameraModal(),this._render(),this._publishPreviewDraft(),this._markHomeAssistantDirty(this._homeAssistantConfig({readDom:!1}))}_removeCamera(e){const t=[...this._getCams()];!Number.isInteger(e)||e<0||e>=t.length||(t.splice(e,1),this._config={...this._config,cameras:t},this._render(),this._publishPreviewDraft(),this._markHomeAssistantDirty(this._homeAssistantConfig({readDom:!1})))}_wireCameraDragAndDrop(){const e=Array.from(this.querySelectorAll(".cam-row"));Ua({rows:e,clearDropTargets:()=>{this.querySelectorAll(".cam-row").forEach(t=>{t.classList.remove("drop-target","drop-target-before","drop-target-after")})},onReorder:(t,a,i)=>{this._reorderCameras(t,a,i)}})}_renderSettingsPanel({id:e,title:t,icon:a,content:i,active:r=!1}){const o=String(a||"").trim(),n=o.startsWith("<svg")?`<span class="setting-title-icon" aria-hidden="true">${o}</span>`:`<ha-icon icon="${T(o)}"></ha-icon>`;return`<section class="settings-panel ${r?"active":""}" data-panel="${T(e)}">
      <button type="button" class="setting-title" data-panel-toggle="${T(e)}" aria-expanded="${r?"true":"false"}">
        ${n}
        <h3>${L(t)}</h3>
      </button>
      <div class="setting-content">
        ${i}
        <div class="settings-more-slot">
          <button type="button" class="settings-more-chip" data-panel-more title="Show more options" aria-label="Show more options" hidden>
            <span>More</span>
            ${D.chevron}
          </button>
        </div>
      </div>
    </section>`}_settingsPanelScrollContainer(e=null){const t=Array.isArray(e)&&e.length?[...e]:[];if(!t.length){let a=this;const i=new Set;for(;a&&!i.has(a);){i.add(a),t.push(a);const r=a.getRootNode?.();a=a.assignedSlot||a.parentElement||r?.host||null}}for(const a of t){const i=this.ownerDocument;if(!a||a===i?.scrollingElement||a===i?.documentElement||a===i?.body||typeof a.getBoundingClientRect!="function")continue;let r="";try{r=String(globalThis.getComputedStyle?.(a)?.overflowY||"")}catch{continue}if(/(auto|scroll|overlay)/.test(r)&&a.clientHeight>0)return a}return null}_syncSettingsPanelMoreState(e,t=null){const a=e?.querySelector?.(".setting-content"),i=a?.querySelector?.("[data-panel-more]"),r=a?.querySelector?.(".settings-more-slot");if(!i||!r)return;if(!e.classList?.contains("active")){i.hidden=!0;return}const o=t,n=a.getBoundingClientRect?.(),s=o?.getBoundingClientRect?.();if(!n||!s){i.hidden=!0;return}const d=Number(s.bottom),c=Number(n.bottom)>d+3;if(i.hidden=!c,!c)return;const h=Math.max(8,Math.min(Number(n.height)-44,d-Number(n.top)-38));r.style.top=`${h}px`}_scrollSettingsPanelToRemainingContent(e,t,a){if(!e||!a)return!1;const i=t.indexOf(e),r=t[i+1]?.querySelector?.("[data-panel-toggle]"),o=e.querySelector?.(".setting-content"),n=r?.getBoundingClientRect?.()||o?.getBoundingClientRect?.(),s=a.getBoundingClientRect?.();if(!n||!s)return!1;const d=Math.max(0,Math.ceil(Number(n.bottom)-Number(s.bottom)+8));return d<=0?!1:(typeof a.scrollBy=="function"?a.scrollBy({top:d,behavior:"smooth"}):a.scrollTop+=d,!0)}_wireSettingsPanels(){this._settingsPanelScrollCleanup?.(),this._settingsPanelScrollCleanup=null,this._settingsPanelResizeObserver?.disconnect?.(),this._settingsPanelResizeObserver=null;const e=Array.from(this.querySelectorAll(".settings-panel"));if(!e.length)return;let t=this._settingsPanelViewport?.isConnected!==!1&&this._settingsPanelViewport||null;t||(t=this._settingsPanelScrollContainer()),t&&(this._settingsPanelViewport=t);let a=0,i=null;const r=()=>{const c=e.find(h=>h.classList.contains("active"))||null;i&&i!==c&&this._syncSettingsPanelMoreState(i,t),i=c,c&&this._syncSettingsPanelMoreState(c,t)},o=()=>{a||(typeof globalThis.requestAnimationFrame=="function"?a=globalThis.requestAnimationFrame(()=>{a=0,r()}):setTimeout(r,0))},n=c=>{!c||c===t||(t?.removeEventListener?.("scroll",o),t=c,this._settingsPanelViewport=c,t.addEventListener?.("scroll",o,{passive:!0}),o())};t?.addEventListener?.("scroll",o,{passive:!0}),globalThis.addEventListener?.("resize",o,{passive:!0}),this._settingsPanelScrollCleanup=()=>{t?.removeEventListener?.("scroll",o),globalThis.removeEventListener?.("resize",o),a&&(globalThis.cancelAnimationFrame?.(a),a=0)},typeof globalThis.ResizeObserver=="function"&&(this._settingsPanelResizeObserver=new globalThis.ResizeObserver(o),e.forEach(c=>{const h=c.querySelector?.(".setting-content");h&&this._settingsPanelResizeObserver.observe(h)}));const s=c=>{this._activeSettingsPanelId=Rr(e,c),o()};e.forEach(c=>{const h=c.querySelector?.(".setting-content");c.querySelector("[data-panel-toggle]")?.addEventListener("click",p=>{n(this._settingsPanelScrollContainer(p.composedPath?.())),c.classList.contains("active")?s(null):s(c)}),h?.querySelector?.("[data-panel-more]")?.addEventListener?.("click",p=>{p.preventDefault(),p.stopPropagation(),n(this._settingsPanelScrollContainer(p.composedPath?.())),this._scrollSettingsPanelToRemainingContent(c,e,t)})});const d=e.find(c=>c.dataset.panel===this._activeSettingsPanelId);s(d||null)}_wireEditorDialogActions(){if(this._dialogActionHooksBound)return;const e=()=>{this._standaloneDraftPreviousLandingPage=null,this._hasConfigDraft&&this._commitDraftToHomeAssistantDialog(),this._hasConfigDraft=!1,this._hasVisualDraft=!1,this._syncConfigSaveReminder(),this._emitPreviewDraft(null,{type:st.commit})},t=i=>{i?.classList?.contains?.("gui-mode-button")||(this._hasConfigDraft=!1,this._hasVisualDraft=!1,this._syncConfigSaveReminder(),this._emitPreviewDraft(null))},a=()=>{this._boundDialogActionButtons=[];const i=new Set;let r=this,o=0;for(;r&&o<8;){const n=r.getRootNode?.();n instanceof ShadowRoot&&!i.has(n)&&(i.add(n),n.querySelectorAll(ja).forEach(s=>{if(this.contains?.(s))return;const d=Qt(s);if(!d)return;const c=()=>{if(d==="primary"){e();return}t(s)};s.addEventListener("click",c,!0),this._boundDialogActionButtons.push({element:s,handler:c})})),r=r.parentNode||r.host,o+=1}};this._onDialogPrimaryActionClick=i=>{Wa(i)==="primary"&&e()},this._onDialogSecondaryActionClick=i=>{if(Wa(i)!=="secondary")return;const r=i.composedPath?.()?.find?.(o=>o instanceof Element&&Qt(o)==="secondary");t(r)},this._onCameraModalDocumentClick=i=>{this._handleCameraModalDocumentClick(i)},document.addEventListener("click",this._onDialogPrimaryActionClick,!0),document.addEventListener("click",this._onDialogSecondaryActionClick,!0),document.addEventListener("click",this._onCameraModalDocumentClick,!0),a(),this._dialogActionHooksBound=!0}_wireLivePreviewUpdates(){if(this._livePreviewHooksBound)return;const e=["#title","#subtitle","#display_title","#display_subtitle","#display_logo","#display_version","#event_days","#alerts_reviews_days","#realtime_poll_seconds","#snapshot_update_seconds","#slideshow_rotation_enabled","#slideshow_rotation_seconds","#slideshow_alert_hold_seconds","#grid_mode_enabled","#grid_live_view_enabled","#grid_rotation_seconds","#grid_alert_hold_seconds","#mobile_view_page_enabled","#mobile_view_rotate_to_fullscreen","#mobile_view_dashboard_background","#mobile_view_outer_border","#mobile_view_ha_navbar_bottom","#mobile_view_ha_navbar_stack_tabs","#mobile_view_ha_navbar_dashboard","#ha_dashboard_swipe_navigation_owner","#ha_dashboard_swipe_navigation",'[name="ha_dashboard_swipe_pages"]','[name="ha_dashboard_swipe_mobile_pages"]',"#ha_dashboard_swipe_include_other_cards","[data-ha-dashboard-swipe-include-subviews]","#ha_dashboard_swipe_mouse_enabled","#preview_page_enabled","#preview_page_live_cameras","#preview_page_live_cameras_mobile","#preview_page_alert_live_duration_seconds","#preview_page_show_title_bars","#single_view_alert_takeover",'[name="single_view_start_mode"]',"#wide_view_page_enabled","#wide_view_live_cameras","#wide_view_alert_takeover",'[name="wide_view_start_mode"]',"#wide_view_timeline_enabled","#wide_view_timeline_default_open","#wide_view_timeline_default_scale","#card_view_page_enabled","#card_view_alert_takeover",'[name="card_view_view_mode"]','[name="card_view_start_mode"]',"#card_view_media_drawer_enabled","#card_view_hide_camera_name","#landing_page","#mobile_page","#stream_height","#stream_height_unit","#col_left_width_pct","#tight_margins","#shadows","#borders","#rounded_corners","#outer_shadows","#mobile_poll_battery_saver","#event_pre_post_roll_enabled","#favorites_mixed_cameras","[data-active-tab]","[data-theme-option]","[data-theme-scope]","[data-theme-color]","[data-theme-reset]","[data-theme-default]"],t=["#title","#subtitle"],a=(o,n)=>(Array.isArray(o.composedPath?.())?o.composedPath():[]).some(d=>d instanceof Element&&n.some(c=>d.matches?.(c))),i=()=>{this._livePreviewRaf||(this._livePreviewRaf=requestAnimationFrame(()=>{this._livePreviewRaf=0;const o=this._pendingEditorPreviewUpdate===!0;this._pendingEditorPreviewUpdate=!1,this._u({dispatch:!1,preview:o})}))},r=o=>{if(!a(o,e))return;const n=a(o,t);if(n&&o.type!=="change"){clearTimeout(this._textPreviewUpdateT),this._textPreviewUpdateT=setTimeout(()=>{this._textPreviewUpdateT=null,this._pendingEditorPreviewUpdate=!0,i()},So);return}n&&this._textPreviewUpdateT&&(clearTimeout(this._textPreviewUpdateT),this._textPreviewUpdateT=null),this._pendingEditorPreviewUpdate=!0,i()};["input","change","value-changed","selected-changed","click"].forEach(o=>{this.addEventListener(o,r,!0)}),this._livePreviewHooksBound=!0}_setEditorFieldError(e,t){Ir(this,e,t)}_validateEditorFields(){let e=!0;const t=this.querySelector("#event_days")?.dataset.value||this.querySelector("#event_days")?.value||String(ce),a=Number(t),i=Number.isInteger(a)&&a>=1&&a<=15?"":"Select a value from 1 to 15.";this._setEditorFieldError("#event_days",i),i&&(e=!1);const r=this.querySelector("#alerts_reviews_days")?.dataset.value||this.querySelector("#alerts_reviews_days")?.value||String(he),o=Number(r),n=Number.isInteger(o)&&o>=1&&o<=15?"":"Select a value from 1 to 15.";this._setEditorFieldError("#alerts_reviews_days",n),n&&(e=!1);const s=String(this.querySelector("#stream_height")?.value||"").trim(),d=Number(s),c=Number.isInteger(d)&&d>=gt&&d<=bt?"":`Select a whole number from ${gt} to ${bt}.`;this._setEditorFieldError("#stream_height",c),c&&(e=!1);const h=this.querySelector("#wide_view_page_enabled")?.checked===!0,p=String(this.querySelector("#col_left_width_pct")?.value||"").trim(),g=Number(p),k=!h||Number.isInteger(g)&&g>=wt&&g<=yt?"":`Select a whole number from ${wt} to ${yt}.`;return this._setEditorFieldError("#col_left_width_pct",k),k&&(e=!1),e}_render(){const e=this._frigateEntities(),t=this._getCams(),a=this._dashboardNavbarOwnershipState(),i=a.locked,r=String(a.ownerPage||""),o=`<strong>Page: ${L(r)}</strong>`,n=`<strong>${L(`Dashboard: ${a.dashboardName||"this dashboard"}`)}</strong>`,s=`${o} ${n}`,d=a.locked?a.conflict?`This card also claims Whole Dashboard in raw YAML, but the ${Ae} at ${s} controls it. Turn off Whole Dashboard here or remove the duplicate YAML setting.`:`The ${Ae} at ${s} controls Move HA Navbar to Bottom. Turn off Whole Dashboard there to change this setting.`:"",c=a.isOwner&&a.owner?`This card controls Move HA Navbar to Bottom for the whole dashboard. ${s}`:"",h=this._dashboardSwipeOwnershipState(),p=Xe(this._config?.ha_dashboard_swipe_navigation),g=h.isOwner&&h.requested,k=h.locked&&!h.requested,f=`<strong>Page: ${L(h.ownerPage||"")}</strong>`,S=`<strong>${L(`Dashboard: ${h.dashboardName||"this dashboard"}`)}</strong>`,j=`${f} ${S}`,R=h.locked?h.conflict?`This card also claims swipe control in raw YAML, but the ${Ae} at ${j} controls it. Turn off this switch here or remove the duplicate YAML setting.`:`The ${Ae} at ${j} controls Swipe Navigation. Turn it off there before enabling it here.`:"",N=[{value:C.dashboardWide,label:"Dashboard Wide",description:`Swipe between dashboard pages and selected ${ie} pages.`},{value:C.insideCard,label:"Inside Card Only",description:`Swipe between selected ${ie} pages. Other cards can be included.`},{value:C.landingDashboard,label:"Landing Page + Dashboard Pages",description:`Swipe between dashboard pages with the landing page as the only ${ie} stop.`},{value:C.none,label:"None",description:`Keep ownership but disable ${ie} swipe navigation.`}].map(({value:l,label:m,description:y})=>{const H=l===p,Y=l===C.insideCard,ke=l===C.dashboardWide||l===C.landingDashboard;return`<div class="editor-swipe-choice${H?" selected":""}">
          <label class="editor-choice-chip">
            <input class="editor-choice-chip-input" type="radio" name="ha_dashboard_swipe_navigation" value="${T(l)}" ${H?"checked":""} ${g?"":"disabled"}>
            <span class="editor-choice-chip-body">
              <span class="editor-choice-chip-indicator" aria-hidden="true"></span>
              <span class="editor-choice-chip-copy"><span class="editor-choice-chip-text">${L(m)}</span><span class="editor-choice-chip-description">${L(y)}</span></span>
            </span>
          </label>
          ${Y?`<label class="editor-swipe-choice-footer"><span>Include ${ie} Cards on Other Dashboard Pages</span><ha-switch id="ha_dashboard_swipe_include_other_cards" ${this._config?.ha_dashboard_swipe_include_other_cards?"checked":""} ${g&&H?"":"disabled"}></ha-switch></label>`:""}
          ${ke?`<label class="editor-swipe-choice-footer"><span>Swipe to Subviews</span><ha-switch data-ha-dashboard-swipe-include-subviews="${T(l)}" ${this._config?.ha_dashboard_swipe_include_subviews?"checked":""} ${g&&H?"":"disabled"}></ha-switch></label>`:""}
        </div>`}).join(""),E=[C.dashboardWide,C.insideCard].includes(p),I=new Set(oe(this._config,V.desktop)),Oe=re(this._config?.landing_page),de=new Set(_t(this._config,V.desktop)),$e=new Set(oe(this._config,V.mobile)),ge=Ve(this._config),be=new Set(vt(this._config)),we={[u.preview]:"Preview",[u.singleView]:"Single View",[u.mobileView]:"Mobile View",[u.wideView]:"Wide View",[u.cardView]:"Card View"},M=Rt.map(l=>{const m=l===Oe,y=!g||!I.has(l)||m;return`<label class="editor-choice-chip">
          <input class="editor-choice-chip-input" type="checkbox" name="ha_dashboard_swipe_pages" value="${T(l)}" ${de.has(l)?"checked":""} ${m?'data-dashboard-swipe-landing="true"':""} ${y?"disabled":""}>
          <span class="editor-choice-chip-body">
            <span class="editor-choice-chip-indicator" aria-hidden="true"></span>
            <span class="editor-choice-chip-text">${L(we[l])}</span>
          </span>
        </label>`}).join(""),U=Nt.map(l=>{const m=l===ge,y=!g||!$e.has(l)||m;return`<label class="editor-choice-chip">
          <input class="editor-choice-chip-input" type="checkbox" name="ha_dashboard_swipe_mobile_pages" value="${T(l)}" ${be.has(l)?"checked":""} ${m?'data-dashboard-swipe-landing="true"':""} ${y?"disabled":""}>
          <span class="editor-choice-chip-body">
            <span class="editor-choice-chip-indicator" aria-hidden="true"></span>
            <span class="editor-choice-chip-text">${L(we[l])}</span>
          </span>
        </label>`}).join(""),Q=Ut(t),Z=Va(t),P=ue(this._config?.grid_order,t),K=new Map(Z.map(l=>[l.entity,l])),F=P.mode===W.custom?P.included.length:Q,He=Q<pe,w=this._timezoneDisplay(),O=new Set(this._normalizeHiddenTabs(this._hiddenTabsDraft??this._config?.hidden_tabs));this._ensureThemeDraftCache();const ee=this._config?.theme==="custom"?"custom":"default",$=this._activeThemeModeKey(),Ce=Wt(this._config?.theme_custom,$),hi=Lt(this._config?.theme_custom_defaults),pi=Ce.scope,mi=Ce.overrides,ui=hi[$]||{},_i=this._themeDraftCache[$]||{},aa=Je(this._config?.stream_height),ia=Qe(this._config?.stream_height_unit),ra=xt(this._config?.col_left_width_pct),vi=St(this._config?.wide_view_timeline_default_scale),gi=Ie.includes(Number(this._config?.realtime_poll_seconds))?Number(this._config.realtime_poll_seconds):5,bi=z(this._config?.snapshot_update_seconds,Be,Me),fi=z(this._config?.preview_page_alert_live_duration_seconds,Ue,Math.round(ir/1e3)),wi=z(this._config?.slideshow_alert_hold_seconds,Fe,Math.round(Le/1e3)),yi=z(this._config?.slideshow_rotation_seconds,je,30),xi=We.includes(Number(this._config?.grid_rotation_seconds))?Number(this._config.grid_rotation_seconds):30,Vt=(l,m)=>ko({name:l,selectedValue:m,gridEnabled:this._config?.grid_mode_enabled===!0,slideshowEnabled:this._config?.slideshow_rotation_enabled===!0}),Si=Vt("single_view_start_mode",this._config?.single_view_start_mode),Ci=Vt("wide_view_start_mode",this._config?.wide_view_start_mode),ki=Vt("card_view_start_mode",this._config?.card_view_start_mode),oa=rt(this._config?.card_view_view_mode),Ei=[{value:X.videoOnly,label:"Video Only"},{value:X.bottomPanelOpen,label:"Bottom Panel Open"},{value:X.bottomPanelClosed,label:"Bottom Panel Closed"}].map(({value:l,label:m})=>`<label class="theme-scope-opt card-view-start-opt">
          <input class="card-view-start-input" type="radio" name="card_view_view_mode" value="${l}" ${oa===l?"checked":""}>
          <span>${m}</span>
        </label>`).join(""),sa=l=>l===u.mobileView?"Mobile":l===u.preview?"Preview":l===u.wideView?"Wide View":l===u.cardView?"Card View":"Single View",Ai=oe(this._config,V.desktop).map(l=>({value:l,label:sa(l)})),Mi=this._standaloneLandingPageRoutes().map(l=>({value:l,label:sa(l)})),Li={[b.mobile]:"Mobile",[b.card]:"Card View",[b.previewMobile]:"Preview + Mobile",[b.previewSingle]:"Preview + Single View",[b.single]:"Single View"},Ti=It(this._config).map(l=>({value:l,label:Li[l]})),qe=(l,m)=>`<ha-formfield label="${m}">
          <ha-switch data-active-tab="${l}" ${O.has(l)?"":"checked"}></ha-switch>
        </ha-formfield>`,Pi=qt.map(l=>{const m=l.key,y=this._themeDefaultHex(m,$),H=_e(mi[m]),Y=_e(_i[m]),ke=H||Y||y,ae=ui[m]===!0,Re=ae?y:ke,pt=!ae&&Re!==y;return`
        <div class="theme-custom-row" data-theme-row="${m}">
          <div class="theme-custom-label">
            <div>${l.label}</div>
            ${pt?'<div class="theme-custom-warn">Draft changes require card config save.</div>':""}
          </div>
          <div class="theme-color-wrap">
            <input class="theme-color-input" type="color" data-theme-color="${m}" value="${Re}" ${ae?"disabled":""}>
            <button
              type="button"
              class="theme-color-reset"
              data-theme-reset="${m}"
              title="Reset to default color"
              aria-label="Reset to default color"
              ${ae?"hidden":""}
            >
              <ha-icon icon="mdi:autorenew"></ha-icon>
            </button>
          </div>
          <ha-formfield label="Use Default">
            <ha-switch data-theme-default="${m}" ${ae?"checked":""}></ha-switch>
          </ha-formfield>
        </div>`}).join(""),Di=[{value:"light",label:"Light",icon:"mdi:white-balance-sunny"},{value:"dark",label:"Dark",icon:"mdi:weather-night"},{value:"both",label:"Both",icon:"mdi:theme-light-dark"}].map(({value:l,label:m,icon:y})=>{const H=pi===l;return`<button
          type="button"
          class="theme-scope-opt ${H?"active":""}"
          data-theme-scope="${l}"
          role="radio"
          aria-checked="${H?"true":"false"}"
          aria-label="Apply custom theme in ${m.toLowerCase()} mode${l==="both"?"s":""}"
        ><ha-icon icon="${y}"></ha-icon><span>${m}</span></button>`}).join(""),Vi=t.map((l,m)=>`
      <div class="cam-row" draggable="true" data-row="${m}">
        <button class="cam-drag" type="button" title="Drag to reorder" aria-label="Drag to reorder"><ha-icon icon="mdi:drag-horizontal-variant"></ha-icon></button>
        <div><div class="cam-name">${L(this._cameraLabel(l))}</div><div class="cam-meta">${L(this._cameraMetaLabel(l))}</div></div>
                <button class="cam-action" type="button" title="Edit" aria-label="Edit" data-edit-cam="${m}"><svg viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg"><path fill="currentColor" d="M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87M3,17.25V21H6.75L17.81,9.94L14.06,6.19L3,17.25Z" /></svg></button>
                <button class="cam-action" type="button" title="Delete" aria-label="Delete" data-remove-cam="${m}"><svg viewBox="0 0 24 24" style="width:24px; height:24px" fill="currentColor"><path d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z" /></svg></button>
      </div>`).join(""),zi=P.included.map((l,m)=>{const y=K.get(l);return y?`${m%4===0?`<div class="grid-order-heading">Grid ${Math.floor(m/4)+1}</div>`:""}
          <div class="grid-order-row" draggable="true" data-row="${m}" data-grid-order-entity="${T(l)}">
            <button class="cam-drag" type="button" title="Drag to reorder" aria-label="Drag to reorder"><ha-icon icon="mdi:drag-horizontal-variant"></ha-icon></button>
            <div class="grid-order-camera-copy">
              <div class="cam-name">${L(this._gridOrderCameraLabel(y))}</div>
              <div class="cam-meta">${L(l)}</div>
            </div>
            <button class="icon-btn grid-order-action grid-order-action--exclude" type="button" title="Exclude from Grid" aria-label="Exclude ${T(this._gridOrderCameraLabel(y))} from Grid" data-grid-order-exclude="${T(l)}">
              ${D.gridExclude}
              <span>Exclude</span>
            </button>
          </div>`:""}).join(""),Oi=P.excluded.map(l=>{const m=K.get(l);return m?`<div class="grid-order-excluded-row" data-grid-order-entity="${T(l)}">
          <div class="grid-order-camera-copy">
            <div class="cam-name">${L(this._gridOrderCameraLabel(m))}</div>
            <div class="cam-meta">${L(l)}</div>
          </div>
          <button class="icon-btn grid-order-action grid-order-action--include" type="button" title="Include in Grid" aria-label="Include ${T(this._gridOrderCameraLabel(m))} in Grid" data-grid-order-include="${T(l)}">
            ${D.gridInclude}
            <span>Include</span>
          </button>
        </div>`:""}).join(""),$i=`
      <div class="grid-order-custom camera-group-fields" ${P.mode===W.custom?"":"hidden"}>
        <div class="grid-order-sections">
          ${zi||'<div class="cam-helper">No cameras are currently included in Grid mode.</div>'}
        </div>
        <div class="grid-order-excluded" ${P.excluded.length?"":"hidden"}>
          <div class="grid-order-heading">Excluded Cameras</div>
          ${Oi}
        </div>
      </div>`,Hi=`
      <div class="section">
        <span class="field-label">Cameras ${e.length?'<small style="font-weight:400;color:var(--c-text2)">(Frigate cameras detected)</small>':""}</span>
        <div class="cam-wrap" id="cam-list">${Vi}</div>
        ${He?'<div class="cam-toolbar"><button id="camera-add" class="cam-add" type="button">Add</button></div>':""}
        <span class="cam-helper">${Q} of ${pe} cameras configured</span>
      </div>`,na=q(this._config?.title||ut),la=q(this._config?.subtitle||Ht),qi=`
      <div class="environment-version-summary">
        <div class="card-version-status" id="card-version-status" data-update-status="unavailable">
          <span class="environment-item-icon card-version-icon" aria-hidden="true">${D.packageCheck}</span>
          <div class="card-version-copy">
            <strong>${Ae}</strong>
            <span>Version v${L(er)} <span aria-hidden="true">\u2022</span> <span id="card-version-update-status" role="status" aria-live="polite">Update status unavailable</span></span>
            <div class="environment-support-items">
              <div class="environment-support-item" data-home-assistant-version-notice data-support-status="unavailable" role="status" aria-live="polite" hidden>
                <span class="environment-item-icon" aria-hidden="true">${D.homeAssistant}</span>
                <span data-environment-support-text></span>
              </div>
              <div class="environment-support-item" data-frigate-integration-status data-support-status="unavailable" role="status" aria-live="polite" hidden>
                <span class="environment-item-icon" aria-hidden="true">${D.frigate}</span>
                <span data-environment-support-text></span>
              </div>
            </div>
          </div>
          <button class="card-version-update-link" id="card-version-update-link" type="button" hidden>Open update</button>
        </div>
      </div>
      <div class="text-display-field">
        <div class="text-display-row">
          <div class="limited-text-input">
            <ha-input label="Title" name="title" id="title" type="text" maxlength="${ne}" value="${T(na)}" placeholder="${T(ut)}"></ha-input>
            <span class="limited-text-counter" id="title-counter" aria-hidden="true">${na.length}/${ne}</span>
          </div>
          <label class="text-display-checkbox"><input id="display_title" type="checkbox" ${this._config?.display_title!==!1?"checked":""}> <span>Display</span></label>
        </div>
        <div class="field-helper text-display-token-helper">Use <code>{camera}</code> to show the active camera name. Grid mode shows <strong>Grid</strong>.</div>
      </div>
      <div class="text-display-field">
        <div class="text-display-row">
          <div class="limited-text-input">
            <ha-input label="Subtitle" name="subtitle" id="subtitle" type="text" maxlength="${ne}" value="${T(la)}" placeholder="${T(Ht)}"></ha-input>
            <span class="limited-text-counter" id="subtitle-counter" aria-hidden="true">${la.length}/${ne}</span>
          </div>
          <label class="text-display-checkbox"><input id="display_subtitle" type="checkbox" ${this._config?.display_subtitle!==!1?"checked":""}> <span>Display</span></label>
        </div>
        <div class="field-helper text-display-token-helper">Use <code>{camera}</code> to show the active camera name. Grid mode shows <strong>Grid</strong>.</div>
      </div>
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
            <div class="field-helper">Adds ${ar} seconds before and after alert and clip playback or downloads. Requires Frigate recordings.</div>
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
            ${ve({name:"realtime_poll_seconds",options:Se(Ie),selectedValue:gi})}
            <div class="field-helper">Fallback interval for checking new alerts and reviews. Shorter intervals use more battery and data.</div>
          </div>
        </div>
        <div class="layout-row" style="align-items:flex-start;gap:12px;flex-wrap:wrap;justify-content:flex-start;margin-top:12px">
          <div id="snapshot_update_row" style="min-width:210px;display:flex;flex-direction:column;gap:6px;width:100%">
            <div class="editor-choice-field" id="snapshot_update_seconds" role="radiogroup" aria-label="Snapshot Refresh">
              <div class="field-label">Snapshot Refresh</div>
              ${ve({name:"snapshot_update_seconds",options:Se(Be),selectedValue:bi})}
            </div>
            <div class="field-helper">How often snapshots refresh when Live View is off.</div>
          </div>
        </div>
        <div class="layout-row" style="align-items:flex-start;gap:12px;flex-wrap:wrap;justify-content:flex-start;margin-top:12px">
          <div id="preview_alert_live_duration_row" style="min-width:210px;display:flex;flex-direction:column;gap:6px;width:100%">
            <div class="editor-choice-field" id="preview_page_alert_live_duration_seconds" role="radiogroup" aria-label="Alert Live Duration">
              <div class="field-label">Alert Live Duration</div>
              ${ve({name:"preview_page_alert_live_duration_seconds",options:Se(Ue),selectedValue:fi})}
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
      </div>`,Ri=`
      <div class="section">
        <span class="field-label">Theme</span>
        <div class="theme-row">
          <div class="theme-seg" id="theme-seg" role="radiogroup" aria-label="Theme">
            <button type="button" class="theme-opt ${ee==="default"?"active":""}" data-theme-option="default" role="radio" aria-checked="${ee==="default"?"true":"false"}">Home Assistant Theme</button>
            <button type="button" class="theme-opt ${ee==="custom"?"active":""}" data-theme-option="custom" role="radio" aria-checked="${ee==="custom"?"true":"false"}">Custom</button>
          </div>
        </div>
        <div id="theme-custom-panel" class="theme-custom-panel" ${ee==="custom"?"":"hidden"}>
          <div class="theme-custom-body">
            <div class="theme-custom-scope">
              <span class="theme-custom-scope-label">Apply this custom theme in</span>
              <div class="theme-scope-seg" role="radiogroup" aria-label="Custom theme modes">${Di}</div>
            </div>
            ${Pi}
          </div>
        </div>
      </div>`,Ni=`
      <div class="section">
        <span class="field-label">Active Tabs</span>
        <div class="chk-row">
          ${qe("alerts","Alerts")}
          ${qe("clips","Clips")}
          ${qe("snapshot","Snapshots")}
          ${qe("recordings","Recordings")}
          ${qe("kept","Favorites")}
        </div>
      </div>
      <div class="section">
        <span class="field-label">Card Height Limit</span>
        <div class="card-height-control">
          <div class="card-height-slider-control">
            <input name="stream_height" id="stream_height" type="range" min="${gt}" max="${bt}" step="1" value="${aa}">
            <div class="field-helper card-height-value" id="stream_height-output">${aa}${ia}</div>
          </div>
          <div class="editor-choice-field editor-choice-field--compact" id="stream_height_unit" role="radiogroup" aria-label="Card height unit">
            ${nt({name:"stream_height_unit",options:[{value:"%",label:"%"},{value:"dvh",label:"dvh"}],selectedValue:ia,compact:!0})}
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
          <span class="field-label" style="margin:0">Show ${ie} Logo</span>
          <ha-switch id="display_logo" ${this._config?.display_logo!==!1?"checked":""}></ha-switch>
        </div>
        <div class="field-helper">Shows ${ie} branding in page footers and the mobile Preview header when the HA navbar is at the bottom.</div>
      </div>
      <div class="section">
        <div class="layout-row">
          <span class="field-label" style="margin:0">Show Version Number</span>
          <ha-switch id="display_version" ${this._config?.display_version!==!1?"checked":""}></ha-switch>
        </div>
        <div class="field-helper">Shows the installed version in page footers. General Settings always shows it.</div>
      </div>`,Ii=`
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
              ${ve({name:"slideshow_rotation_seconds",options:Se(je),selectedValue:yi})}
            </div>
            <div class="field-helper">Time between cameras during Slideshow.</div>
          </div>
        </div>
        <div class="layout-row" style="align-items:flex-start;gap:12px;flex-wrap:wrap;justify-content:flex-start;margin-top:12px">
          <div id="slideshow_alert_hold_row" style="min-width:210px;display:flex;flex-direction:column;gap:6px;width:100%">
            <div class="editor-choice-field" id="slideshow_alert_hold_seconds" role="radiogroup" aria-label="Alert Hold Duration">
              <div class="field-label">Alert Hold Duration</div>
              ${ve({name:"slideshow_alert_hold_seconds",options:Se(Fe),selectedValue:wi})}
            </div>
            <div class="field-helper">How long an alert-selected camera remains before rotation resumes.</div>
          </div>
        </div>
      </div>`,Bi=`
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
      </div>`,ji=z(this._config?.grid_alert_hold_seconds,Ge,Math.round(Te/1e3)),Wi=`
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
          ${Si}
        </div>
        <div class="field-helper">Sets the opening mode. Enable Grid or Slideshow before selecting it.</div>
      </div>`,Fi=`
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
            ${Ci}
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
          ${ve({name:"wide_view_timeline_default_scale",options:La.map(l=>({value:l,label:`${l} hour${l===1?"":"s"}`})),selectedValue:vi})}
        </div>
        <div class="field-helper">Sets the initial time range. Change it later from the Timeline header.</div>
      </div>
      <div class="section" id="col-width-row" style="${this._config?.wide_view_page_enabled?"":"display:none"}">
        <span class="field-label">Left Column Width</span>
        <input id="col_left_width_pct" type="range" min="${wt}" max="${yt}" step="1" value="${ra}" style="width:100%">
        <div class="field-helper">Sets the width of Wide View's left column.</div>
        <div class="field-helper" id="col_left_width_pct-output">${ra}%</div>
        <div class="field-helper" id="col_left_width_pct-helper"></div>
      </div>
      `,Gi=`
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
      `,Ui=`
      <div class="section">
        <div class="layout-row">
          <span class="field-label" style="margin:0">Control Swipe Navigation</span>
          <ha-switch id="ha_dashboard_swipe_navigation_owner" ${h.requested?"checked":""} ${k?"disabled":""}></ha-switch>
        </div>
        <div class="field-helper">Only one ${Ae} can control swipe navigation per dashboard.</div>
        ${R?`<div class="field-helper swipe-owner-warning">${R}</div>`:""}
      </div>
      <div class="section swipe-navigation-dependent-section" id="ha-dashboard-swipe-settings" style="${g?"":"display:none"}">
        <div class="editor-choice-field" id="ha_dashboard_swipe_navigation" role="radiogroup" aria-label="Swipe Navigation">
          <div class="field-label">Swipe Navigation</div>
          <div class="editor-choice-chips editor-choice-chips--detailed editor-swipe-choice-grid">${N}</div>
        </div>
        <div id="ha-dashboard-swipe-page-selection" class="dashboard-swipe-page-selection" style="${E?"":"display:none"}">
          <div class="editor-choice-field dashboard-swipe-device-group" role="group" aria-label="PC/Tablet Swipe Pages">
            <div class="field-label">PC/Tablet Swipe Pages</div>
            <div class="editor-choice-chips editor-choice-chips--checkbox dashboard-swipe-pages-grid">${M}</div>
          </div>
          <div class="field-helper dashboard-swipe-landing-note">Only enabled pages are shown. The PC/tablet landing page is always included.</div>
          <div class="editor-choice-field dashboard-swipe-device-group" role="group" aria-label="Phone Swipe Pages">
            <div class="field-label">Phone Swipe Pages</div>
            <div class="editor-choice-chips editor-choice-chips--checkbox dashboard-swipe-pages-grid">${U}</div>
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
      `,Zi=`
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
            ${ki}
          </div>
          <div class="field-helper">Sets the Video Only live mode. Enable Grid or Slideshow before selecting it.</div>
        </div>
        <div class="section">
          <div class="layout-row">
            <span class="field-label" style="margin:0">Standalone Card View</span>
            <ha-switch id="card_view_standalone" ${this._config?.card_view_standalone?"checked":""}></ha-switch>
          </div>
          <div class="field-helper">Makes Card View the only ${ie} page on all devices. Removes page links and the back button.</div>
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
            <div class="theme-scope-seg card-view-start-seg card-view-mode-seg">${Ei}</div>
          </div>
          <div class="field-helper">Starts with video only, or with the activity panel open or closed.</div>
        </div>
        <div class="card-view-video-only-options" id="card-view-video-only-options" style="${oa===X.videoOnly?"":"display:none"}">
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
      </div>`,Ki=`
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
      </div>`,Yi=`
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
              <button type="button" class="theme-opt ${P.mode===W.default?"active":""}" data-grid-order-mode="default" role="radio" aria-checked="${P.mode===W.default?"true":"false"}">Default</button>
              <button type="button" class="theme-opt ${P.mode===W.custom?"active":""}" data-grid-order-mode="custom" role="radio" aria-checked="${P.mode===W.custom?"true":"false"}">Custom</button>
            </div>
            <div class="field-helper">Default follows Camera Settings. Custom reorders or excludes cameras only in Grid mode.</div>
            ${$i}
          </div>
          <div id="grid_live_row" style="min-width:210px;display:${this._config?.grid_mode_enabled?"flex":"none"};flex-direction:column;gap:6px">
            <div class="layout-row" style="justify-content:flex-start;gap:8px">
              <span class="field-label" style="margin:0">Live View in Grid</span>
              <ha-switch id="grid_live_view_enabled" ${this._config?.grid_live_view_enabled!==!1?"checked":""}></ha-switch>
            </div>
            <div class="field-helper">Keeps all visible cameras live. Otherwise, alerts temporarily switch snapshots to live.</div>
          </div>
          <div id="grid_rotation_row" style="display:${this._config?.grid_mode_enabled&&F>4?"flex":"none"};flex:1 1 100%;width:100%;flex-direction:column;gap:6px">
            <div class="editor-choice-field editor-choice-field--single-row" id="grid_rotation_seconds" role="radiogroup" aria-label="Grid Rotation Interval">
              <div class="field-label">Grid Rotation Interval</div>
              ${ve({name:"grid_rotation_seconds",options:Se(We),selectedValue:xi})}
            </div>
            <div class="field-helper">Time between camera sets when more than four cameras are included.</div>
          </div>
        </div>
        <div class="layout-row" style="align-items:flex-start;gap:12px;flex-wrap:wrap;justify-content:flex-start;margin-top:12px">
          <div id="grid_alert_hold_row" style="min-width:210px;display:flex;flex-direction:column;gap:6px;width:100%">
            <div class="editor-choice-field editor-choice-field--single-row" id="grid_alert_hold_seconds" role="radiogroup" aria-label="Grid Alert Hold Duration">
              <div class="field-label">Grid Alert Hold Duration</div>
              ${ve({name:"grid_alert_hold_seconds",options:Se(Ge),selectedValue:ji})}
            </div>
            <div class="field-helper">How long an alerted tile stays highlighted and, when needed, live.</div>
          </div>
        </div>
      </div>`,G=this._activeSettingsPanelId??null,Xi=`
      <div class="settings-container">
        ${this._renderSettingsPanel({id:"camera",title:"Camera Settings",icon:"mdi:camera",content:Hi,active:G==="camera"})}
        ${this._renderSettingsPanel({id:"general",title:"General Settings",icon:"mdi:cog",content:qi,active:G==="general"})}
        ${this._renderSettingsPanel({id:"theme",title:"Theme Settings",icon:"mdi:palette",content:Ri,active:G==="theme"})}
        ${this._renderSettingsPanel({id:"layout",title:"Layout Settings",icon:"mdi:angle-right",content:Ni,active:G==="layout"})}
        ${this._renderSettingsPanel({id:"slideshow",title:"Slideshow Settings",icon:"mdi:presentation-play",content:Ii,active:G==="slideshow"})}
        ${this._renderSettingsPanel({id:"gridview",title:"Grid Mode Settings",icon:"mdi:view-grid-outline",content:Yi,active:G==="gridview"})}
        ${this._renderSettingsPanel({id:"preview",title:"Preview Page",icon:"mdi:view-grid",content:Bi,active:G==="preview"})}
        ${this._renderSettingsPanel({id:"singleview",title:"Single View Page",icon:D.singleView,content:Wi,active:G==="singleview"})}
        ${this._renderSettingsPanel({id:"wideview",title:"Wide View Page",icon:"mdi:view-split-vertical",content:Fi,active:G==="wideview"})}
        ${this._renderSettingsPanel({id:"cardview",title:"Card View Page",icon:D.cardView,content:Zi,active:G==="cardview"})}
        ${this._renderSettingsPanel({id:"mobileview",title:"Mobile View Page",icon:"mdi:cellphone",content:Gi,active:G==="mobileview"})}
        ${this._renderSettingsPanel({id:"swipenavigation",title:"Swipe Navigation",icon:"mdi:gesture-swipe-horizontal",content:Ui,active:G==="swipenavigation"})}
        ${this._renderSettingsPanel({id:"landing",title:"Landing Page",icon:"mdi:home-import-outline",content:Ki,active:G==="landing"})}
      </div>`,Ji=`<div id="config-save-reminder" class="config-save-reminder" role="status" aria-live="polite" aria-atomic="true" data-config-save-state="${this._hasConfigDraft===!0?"dirty":"clean"}">
      <span class="config-save-reminder-icon" aria-hidden="true">${D.packageCheck}</span>
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
            .text-display-field + .text-display-field{margin-top:8px;}
            .text-display-row{display:flex;align-items:center;gap:12px;min-width:0;}
            .text-display-token-helper{margin:4px 0 0;}
            .text-display-field + .section{margin-top:12px;}
            .limited-text-input{position:relative;flex:1 1 auto;min-width:0;}
            .limited-text-input ha-input{display:block;width:100%;min-width:0;}
            .limited-text-counter{position:absolute;right:11px;top:50%;z-index:1;transform:translateY(-50%);padding-inline-start:6px;background:var(--c-bg-mobile, var(--editor-secondary-bg));color:var(--c-text2, var(--editor-muted));font-size:11px;font-variant-numeric:tabular-nums;line-height:1;pointer-events:none;}
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
            .camera-modal-card .cam-modal-head{display:grid;grid-template-columns:auto minmax(0,1fr) auto;gap:12px;margin-bottom:10px;}
            .cam-modal-title{min-width:0;color:var(--primary-text-color);font-size:22px;font-weight:600;text-align:center;}
            .cam-modal-head-spacer{width:calc(24px + 1rem);height:calc(24px + 1rem);}
            .camera-modal-body{padding:0;border:1px solid var(--c-border2, var(--editor-border));border-radius:12px;overflow:hidden;}
            .camera-modal-accordion + .camera-modal-accordion{border-top:1px solid var(--c-border2, var(--editor-border));}
            .camera-modal-accordion-bar{box-sizing:border-box;width:100%;min-height:40px;display:flex;align-items:center;gap:10px;padding:9px 12px;border:0;background:var(--c-bg-mobile);color:var(--editor-text);font:inherit;font-size:13px;font-weight:700;line-height:1.2;text-align:left;}
            button.camera-modal-accordion-bar{cursor:pointer;appearance:none;}
            .camera-modal-accordion-title{flex:0 1 auto;min-width:0;}
            .camera-modal-accordion-summary{min-width:0;margin-inline-start:auto;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--c-text2, var(--editor-muted));font-size:12px;font-weight:500;}
            .camera-modal-accordion-summary[hidden]{display:none;}
            .camera-modal-accordion-icon{display:inline-flex;width:20px;height:20px;flex:0 0 20px;align-items:center;justify-content:center;color:var(--c-text2, var(--editor-muted));transition:transform .16s ease;}
            .camera-modal-accordion-icon svg{display:block;width:18px;height:18px;}
            .camera-modal-accordion.active .camera-modal-accordion-icon{transform:rotate(180deg);color:var(--c-primary, var(--editor-primary));}
            .camera-modal-accordion.active > .camera-modal-accordion-bar{color:var(--c-primary, var(--editor-primary));}
            .camera-modal-accordion-content{padding:10px 12px 12px;background:var(--editor-card-bg);}
            .camera-modal-accordion-content[hidden]{display:none;}
            .camera-modal-primary{padding-bottom:10px;border-bottom:1px solid var(--c-border2, var(--editor-border));}
            .camera-modal-selector-field{display:block;min-width:0;}
            .camera-modal-selector-field ha-selector{display:block;width:100%;min-width:0;}
            .camera-modal-selector-label{display:block;margin:0 0 4px 1px;color:var(--c-text2, var(--editor-muted));font-size:10px;font-weight:400;line-height:1.2;}
            .camera-modal-floating-field{position:relative;display:block;min-width:0;}
            .camera-modal-floating-field ha-selector{display:block;width:100%;min-width:0;}
            .camera-modal-floating-label{position:absolute;top:6px;left:12px;z-index:2;color:var(--c-text2, var(--editor-muted));font-size:10px;font-weight:400;line-height:1;pointer-events:none;}
            .camera-modal-accordion-content > .cam-modal-field:last-child{margin-bottom:0;}
            .camera-modal-accordion-content > .camera-group-add-row{padding-inline-start:0;}
            .camera-modal-accordion-content > .camera-group-help,
            .camera-modal-accordion-content > .camera-group-fields{margin-inline-start:0;}
            button.camera-modal-accordion-bar:focus-visible{outline:2px solid var(--c-primary, var(--editor-primary));outline-offset:-3px;}
            @media (hover:hover) and (pointer:fine){button.camera-modal-accordion-bar:hover{background:color-mix(in srgb,var(--c-bg-mobile) 78%,var(--c-primary, var(--editor-primary)));}}
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
            .camera-modal-card .cam-modal-helper{margin-top:4px;}
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
            }
            .standalone-landing-dialog{position:fixed;inset:0;margin:auto;box-sizing:border-box;width:min(420px,calc(100vw - 24px));max-width:none;max-height:calc(100dvh - 24px);overflow:auto;}
            .standalone-landing-dialog::backdrop{background:rgba(0,0,0,.30);}
            .standalone-landing-dialog:not([open]){display:none;}

        </style>
    <div class="ed-wrap">
      ${Ji}
      ${Xi}

      <div id="camera-modal" class="cam-modal hidden">
        <div class="cam-modal-card camera-modal-card" role="dialog" aria-modal="true" aria-labelledby="camera-modal-title">
          <div class="cam-modal-head">
            <button type="button" id="camera-modal-close" class="round-btn" title="Close" aria-label="Close">${D.close}</button>
            <div class="cam-modal-title" id="camera-modal-title">Add Camera</div>
            <div class="cam-modal-head-spacer" aria-hidden="true"></div>
          </div>
          <div class="camera-modal-body">
          <section class="camera-modal-accordion camera-modal-accordion-fixed active">
            <div class="camera-modal-accordion-bar">
              <span class="camera-modal-accordion-title">Camera</span>
            </div>
            <div class="camera-modal-accordion-content">
              <div class="cam-modal-field camera-modal-primary">
                <div class="camera-modal-selector-field">
                  <span class="camera-modal-selector-label" aria-hidden="true">Camera</span>
                  <ha-selector id="camera-modal-entity" aria-label="Camera"></ha-selector>
                </div>
              </div>
              <div class="cam-modal-field">
                <div class="limited-text-input">
                  <ha-input id="camera-modal-name" label="Camera Name" aria-label="Camera Name" maxlength="${ne}" placeholder="Display name (optional)"></ha-input>
                  <span class="limited-text-counter" id="camera-modal-name-counter" aria-hidden="true">0/${ne}</span>
                </div>
              </div>
            </div>
          </section>
          <section class="camera-modal-accordion" data-camera-modal-section="connection">
            <button type="button" class="camera-modal-accordion-bar" data-camera-modal-accordion-toggle="connection" aria-expanded="false" aria-controls="camera-modal-connection-content">
              <span class="camera-modal-accordion-title">Connection Settings</span>
              <span class="camera-modal-accordion-summary" id="camera-modal-connection-summary">Frigate go2rtc</span>
              <span class="camera-modal-accordion-icon" aria-hidden="true">${D.chevron}</span>
            </button>
            <div class="camera-modal-accordion-content" id="camera-modal-connection-content" hidden>
              <div class="cam-modal-field">
                <div class="camera-modal-floating-field">
                  <span class="camera-modal-floating-label" aria-hidden="true">Connection Type</span>
                  <ha-selector id="camera-modal-connection-type" aria-label="Connection Type"></ha-selector>
                </div>
                <div class="field-helper">Requires the Home Assistant Frigate integration.</div>
              </div>
            </div>
          </section>
          <section class="camera-modal-accordion" data-camera-modal-section="additional">
            <button type="button" class="camera-modal-accordion-bar" data-camera-modal-accordion-toggle="additional" aria-expanded="false" aria-controls="camera-modal-additional-content">
              <span class="camera-modal-accordion-title">Additional Camera</span>
              <span class="camera-modal-accordion-summary" id="camera-modal-additional-summary">None configured</span>
              <span class="camera-modal-accordion-icon" aria-hidden="true">${D.chevron}</span>
            </button>
            <div class="camera-modal-accordion-content" id="camera-modal-additional-content" hidden>
          <div class="cam-modal-field camera-group-add-row">
            <button type="button" id="camera-modal-add-secondary" class="cam-inline-add camera-group-action">${D.cameraAdd}<span>Add second camera</span></button>
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
              ${nt({name:"camera-modal-group-layout",options:[{value:ye.sideBySide,label:"Side by Side"},{value:ye.stacked,label:"Stacked"}],selectedValue:ye.sideBySide})}
            </div>
            <div class="field-helper">Only the main camera provides PTZ and two-way talk. Put the controllable camera first.</div>
            <div class="camera-group-fields-footer">
              <button type="button" id="camera-modal-remove-secondary" class="cam-inline-remove camera-group-action">Cancel</button>
            </div>
          </div>
            </div>
          </section>
          <section class="camera-modal-accordion" data-camera-modal-section="lights">
            <button type="button" class="camera-modal-accordion-bar" data-camera-modal-accordion-toggle="lights" aria-expanded="false" aria-controls="camera-modal-lights-content">
              <span class="camera-modal-accordion-title">Lights</span>
              <span class="camera-modal-accordion-summary" id="camera-modal-lights-summary">None configured</span>
              <span class="camera-modal-accordion-icon" aria-hidden="true">${D.chevron}</span>
            </button>
            <div class="camera-modal-accordion-content" id="camera-modal-lights-content" hidden>
          <div class="cam-modal-field camera-group-add-row">
            <button type="button" id="camera-modal-add-light" class="cam-inline-add camera-group-action">${D.lightAdd}<span>Add light</span></button>
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
              ${nt({name:"camera-modal-light-position",options:[{value:le.left,label:"Left"},{value:le.right,label:"Right"}],selectedValue:le.right})}
            </div>
            <div class="field-helper">Adds a Home Assistant light button beside the microphone. A light can be linked to multiple cameras.</div>
            <div class="camera-group-fields-footer">
              <button type="button" id="camera-modal-remove-light" class="cam-inline-remove camera-group-action">Cancel</button>
            </div>
          </div>
          <div class="cam-modal-field camera-group-add-row">
            <button type="button" id="camera-modal-add-light-2" class="cam-inline-add camera-group-action" hidden>${D.lightAdd}<span>Add second light</span></button>
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
              ${nt({name:"camera-modal-light-position-2",options:[{value:le.left,label:"Left"},{value:le.right,label:"Right"}],selectedValue:le.right})}
            </div>
            <div class="field-helper">Places the second light independently on either side of the microphone.</div>
            <div class="camera-group-fields-footer">
              <button type="button" id="camera-modal-remove-light-2" class="cam-inline-remove camera-group-action">Cancel</button>
            </div>
          </div>
            </div>
          </section>
          <section class="camera-modal-accordion" data-camera-modal-section="options">
            <button type="button" class="camera-modal-accordion-bar" data-camera-modal-accordion-toggle="options" aria-expanded="false" aria-controls="camera-modal-options-content">
              <span class="camera-modal-accordion-title">Options</span>
              <span class="camera-modal-accordion-summary" id="camera-modal-options-summary" hidden></span>
              <span class="camera-modal-accordion-icon" aria-hidden="true">${D.chevron}</span>
            </button>
            <div class="camera-modal-accordion-content" id="camera-modal-options-content" hidden>
          <div class="cam-modal-field">
            <div class="layout-row cam-modal-toggle-row">
              <div class="cam-modal-toggle-copy">
                <span class="cam-modal-label">Show All Reviews in Alerts</span>
                <div class="field-helper">Frigate groups activity into reviews that may contain alerts, detections, or both. Enable this to show every review in the Alerts tab; disable it to show alerts only.</div>
              </div>
              <ha-switch id="camera-modal-all-reviews"></ha-switch>
            </div>
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
                ${nt({name:"camera-modal-ptz-rotation",options:Ha.map(l=>({value:l,label:`${l}\xB0`})),selectedValue:0,compact:!0})}
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
          </section>
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
    </div>`;const te=(l=null)=>this._u({dispatch:!1,preview:!0,previewRouteIntent:l}),Qi=()=>te(),zt=(l=null)=>{l&&(this._pendingEditorPreviewRouteIntent=l),!this._previewUpdateRaf&&(this._previewUpdateRaf=requestAnimationFrame(()=>{this._previewUpdateRaf=0;const m=this._pendingEditorPreviewRouteIntent;this._pendingEditorPreviewRouteIntent=null,te(m)}))};jr({root:this,update:Qi,themeDraftCache:this._themeDraftCache,resolveDefaultHex:l=>this._themeDefaultHex(l,$),themeMode:$}),ze({element:this.querySelector("#event_days"),hass:this._hass,options:Array.from({length:15},(l,m)=>{const y=String(m+1);return{value:y,label:y}}),initialValue:String(this._config?.event_days??ce),fallbackValue:String(ce),normalize:l=>String(l??ce),onChange:()=>te()}),ze({element:this.querySelector("#alerts_reviews_days"),hass:this._hass,options:Array.from({length:15},(l,m)=>{const y=String(m+1);return{value:y,label:y}}),initialValue:String(this._config?.alerts_reviews_days??he),fallbackValue:String(he),normalize:l=>String(l??he),onChange:()=>te()}),ze({element:this.querySelector("#landing_page"),hass:this._hass,options:Ai,initialValue:this._config?.landing_page||u.singleView,fallbackValue:u.singleView,normalize:l=>re(l),onChange:()=>te()}),ze({element:this.querySelector("#standalone-landing-page"),hass:this._hass,options:Mi,initialValue:u.singleView,fallbackValue:u.singleView,normalize:l=>re(l)}),ze({element:this.querySelector("#mobile_page"),hass:this._hass,options:Ti,initialValue:this._config?.mobile_page||b.single,fallbackValue:b.single,normalize:l=>Ye(l),onChange:()=>te()});const da=this.querySelector("#mobile_page");da&&(da.disabled=this._config?.card_view_standalone===!0),Tt({element:this.querySelector("#camera-modal-entity"),hass:this._hass,domain:"camera"}),Tt({element:this.querySelector("#camera-modal-secondary-entity"),hass:this._hass,domain:"camera",required:!1,onChange:()=>this._syncCameraModalGroupFields()}),Tt({element:this.querySelector("#camera-modal-light-entity"),hass:this._hass,domain:"light",required:!1,onChange:l=>{this._syncCameraModalLightIconContext(l),this._syncCameraModalLightFields()}}),Za({element:this.querySelector("#camera-modal-light-icon"),hass:this._hass,entity:""}),Tt({element:this.querySelector("#camera-modal-light-entity-2"),hass:this._hass,domain:"light",required:!1,onChange:l=>{this._syncCameraModalLightIconContext(l,1),this._syncCameraModalLightFields()}}),Za({element:this.querySelector("#camera-modal-light-icon-2"),hass:this._hass,entity:""}),ze({element:this.querySelector("#camera-modal-connection-type"),hass:this._hass,options:[{value:"frigate_go2rtc",label:"Frigate go2rtc (default)"},{value:"ha_direct",label:"Home Assistant"}],initialValue:B,fallbackValue:B,normalize:l=>J(l),onChange:()=>this._syncCameraModalAccordionSummaries()}),Fr(this,[{selector:"#camera-add",handler:()=>this._openCameraModal(null)},{selector:"#camera-modal-close",handler:()=>this._closeCameraModal()},{selector:"#camera-modal-cancel",handler:()=>this._closeCameraModal()},{selector:"#camera-modal-save",handler:()=>this._saveCameraModal()},{selector:"#camera-modal-add-secondary",handler:()=>this._setCameraModalGroupEnabled(!0)},{selector:"#camera-modal-remove-secondary",handler:()=>this._setCameraModalGroupEnabled(!1)},{selector:"#camera-modal-add-light",handler:()=>this._setCameraModalLightEnabled(!0,0)},{selector:"#camera-modal-remove-light",handler:()=>this._setCameraModalLightEnabled(!1,0)},{selector:"#camera-modal-add-light-2",handler:()=>this._setCameraModalLightEnabled(!0,1)},{selector:"#camera-modal-remove-light-2",handler:()=>this._setCameraModalLightEnabled(!1,1)},{selector:"#camera-delete-cancel",handler:()=>this._closeCameraDeleteConfirmation()},{selector:"#camera-delete-confirm",handler:()=>this._confirmCameraRemoval()},{selector:"#standalone-landing-cancel",handler:()=>this._closeStandaloneLandingPageModal()},{selector:"#standalone-landing-confirm",handler:()=>this._confirmStandaloneLandingPage()}]),ea({root:this,selector:"[data-edit-cam]",handler:l=>{this._openCameraModal(Number(l.currentTarget.dataset.editCam))}}),ea({root:this,selector:"[data-remove-cam]",handler:l=>{this._openCameraDeleteConfirmation(Number(l.currentTarget.dataset.removeCam))}}),ea({root:this,selector:"[data-camera-modal-accordion-toggle]",handler:l=>{this._toggleCameraModalAccordion(l.currentTarget.dataset.cameraModalAccordionToggle)}}),this.querySelector("#camera-modal")?.addEventListener("click",l=>{l.target?.id==="camera-modal"&&l!==this._cameraModalSuppressedClickEvent&&this._closeCameraModal(),l===this._cameraModalSuppressedClickEvent&&(this._cameraModalSuppressedClickEvent=null)}),this.querySelector("#camera-delete-modal")?.addEventListener("click",l=>{l.target?.id==="camera-delete-modal"&&this._closeCameraDeleteConfirmation()});const lt=this.querySelector("#standalone-landing-modal");lt?.addEventListener("cancel",l=>{l.preventDefault(),this._closeStandaloneLandingPageModal()}),lt?.addEventListener("click",l=>{if(l.target!==lt)return;const m=lt.getBoundingClientRect?.();if(!m)return;(l.clientX<m.left||l.clientX>m.right||l.clientY<m.top||l.clientY>m.bottom)&&this._closeStandaloneLandingPageModal()}),this.querySelector("#camera-modal-name")?.addEventListener("keydown",l=>{l.key==="Enter"&&(l.preventDefault(),this._saveCameraModal())}),this.querySelector("#camera-modal-entity")?.addEventListener("value-changed",()=>{this._refreshCameraModalPtzSupport(),this._refreshCameraModalTwoWayTalkSupport()}),this.querySelector("#camera-modal-entity")?.addEventListener("change",()=>{this._refreshCameraModalPtzSupport(),this._refreshCameraModalTwoWayTalkSupport()}),this.querySelector("#camera-modal-connection-type")?.addEventListener("value-changed",()=>{this._refreshCameraModalPtzSupport(),this._refreshCameraModalTwoWayTalkSupport()}),this.querySelector("#camera-modal-connection-type")?.addEventListener("change",()=>{this._refreshCameraModalPtzSupport(),this._refreshCameraModalTwoWayTalkSupport()}),this.querySelector("#camera-modal-ptz-enabled")?.addEventListener("value-changed",()=>this._syncCameraModalPtzVisibility({supported:this.querySelector("#camera-modal-ptz-enabled")?.dataset?.supported==="true",sourceType:this._cameraModalConnectionTypeValue(),loading:!1})),["value-changed","change"].forEach(l=>{this.querySelector("#camera-modal-two-way-talk-enabled")?.addEventListener(l,()=>this._syncCameraModalAccordionSummaries())}),this.querySelector("#camera-modal-ptz-enabled")?.addEventListener("change",()=>this._syncCameraModalPtzVisibility({supported:this.querySelector("#camera-modal-ptz-enabled")?.dataset?.supported==="true",sourceType:this._cameraModalConnectionTypeValue(),loading:!1})),this.querySelector("#stream_height")?.addEventListener("input",()=>{this._syncStreamHeightOutput()}),this.querySelector("#stream_height_unit")?.addEventListener("change",()=>this._syncStreamHeightOutput()),this.querySelector("#col_left_width_pct")?.addEventListener("input",l=>{this._setRangeValueOutput("#col_left_width_pct",l.currentTarget?.value,"%")}),this._wireCameraDragAndDrop(),this._wireGridOrderControls(),this._wireSettingsPanels(),this._wireEditorDialogActions(),this._wireLimitedTextField("#title","#title-counter"),this._wireLimitedTextField("#subtitle","#subtitle-counter"),this._wireLimitedTextField("#camera-modal-name","#camera-modal-name-counter"),this._wireLivePreviewUpdates(),this._wireStandaloneLandingPageTransition(zt),this.querySelector("#card-version-update-link")?.addEventListener("click",l=>this._openCardUpdateDialog(l.currentTarget?.dataset?.entityId)),this._syncCardVersionStatus(),this._syncEnvironmentSupportNotices(),this.querySelector("#mobile_view_ha_navbar_dashboard")?.addEventListener("change",()=>{te(),this._render()}),this.querySelector("#ha_dashboard_swipe_navigation_owner")?.addEventListener("change",()=>{te(),this._render()}),this.querySelector("#ha_dashboard_swipe_navigation")?.addEventListener("change",l=>{if(l.target?.name!=="ha_dashboard_swipe_navigation")return;const m=String(l.target?.value||"");this.querySelectorAll(".editor-swipe-choice").forEach(Y=>{Y.classList.toggle("selected",Y.querySelector("input:checked")!=null)});const y=this.querySelector("#ha_dashboard_swipe_include_other_cards");y&&(y.disabled=m!==C.insideCard),this.querySelectorAll("[data-ha-dashboard-swipe-include-subviews]").forEach(Y=>{Y.disabled=Y.dataset.haDashboardSwipeIncludeSubviews!==m});const H=this.querySelector("#ha-dashboard-swipe-page-selection");H&&(H.style.display=[C.dashboardWide,C.insideCard].includes(m)?"":"none")}),this.querySelectorAll("[data-ha-dashboard-swipe-include-subviews]").forEach(l=>{l.addEventListener("change",()=>{this.querySelectorAll("[data-ha-dashboard-swipe-include-subviews]").forEach(m=>{m.checked=l.checked===!0}),te()})}),Ka({root:this,ids:["stream_height","col_left_width_pct"],events:["change"],handler:()=>te()}),Ka({root:this,ids:["tight_margins","display_title","display_subtitle","display_logo","display_version","single_view_alert_takeover","wide_view_page_enabled","wide_view_live_cameras","wide_view_alert_takeover","wide_view_timeline_enabled","wide_view_timeline_default_open","card_view_page_enabled","card_view_alert_takeover","card_view_media_drawer_enabled","card_view_hide_camera_name","mobile_view_page_enabled","mobile_view_rotate_to_fullscreen","mobile_view_dashboard_background","mobile_view_outer_border","mobile_view_ha_navbar_bottom","mobile_view_ha_navbar_stack_tabs","ha_dashboard_swipe_navigation","ha_dashboard_swipe_include_other_cards","ha_dashboard_swipe_mouse_enabled","shadows","borders","rounded_corners","outer_shadows","mobile_poll_battery_saver","event_pre_post_roll_enabled","favorites_mixed_cameras","realtime_poll_seconds","snapshot_update_seconds","slideshow_rotation_enabled","slideshow_rotation_seconds","grid_mode_enabled","grid_live_view_enabled","grid_rotation_seconds","slideshow_alert_hold_seconds","grid_alert_hold_seconds","preview_page_enabled","preview_page_live_cameras","preview_page_live_cameras_mobile","preview_page_alert_live_duration_seconds","preview_page_show_title_bars","wide_view_timeline_default_scale","stream_height_unit"],events:["input","change","value-changed"],handler:l=>{const m=this.querySelector("#slideshow_rotation_row"),y=this.querySelector("#slideshow_rotation_enabled")?.checked===!0,H=this.querySelector("#grid_rotation_row"),Y=this.querySelector("#grid_live_row"),ke=this.querySelector("#grid_order_row"),ae=this.querySelector("#grid_mode_enabled")?.checked===!0,Re=this.querySelector("#card-view-page-options");Re&&(Re.style.display=v(this.querySelector("#card_view_page_enabled"))?"":"none");const pt=(Ot,fa)=>{this.querySelectorAll(`[name$="_view_start_mode"][value="${Ot}"]`).forEach(Ee=>{Ee.disabled=!fa;const mt=Ee.closest("label");if(!mt)return;const $t=String(mt.dataset.disabledGuidance||"").trim();if(!fa&&$t){mt.title=$t,Ee.setAttribute("aria-label",`${Ee.nextElementSibling?.textContent||Ot}. ${$t}`);return}mt.removeAttribute("title"),Ee.setAttribute("aria-label",Ee.nextElementSibling?.textContent||Ot)})};pt("slideshow",y),pt("grid",ae),m&&(m.style.display=y?"flex":"none"),Y&&(Y.style.display=ae?"flex":"none"),ke&&(ke.style.display=ae?"flex":"none"),H&&(H.style.display=ae&&F>4?"flex":"none"),zt()}}),Gr({root:this,selector:"[data-active-tab]",events:["change","value-changed"],handler:l=>{const m=l.currentTarget?.dataset?.activeTab;if(!m)return;const y=this._isTabVisibleFromEvent(l);this._setHiddenTabFromToggle(m,y),zt()}});const ca=this.querySelector("#card-view-video-only-options"),ha=Array.from(this.querySelectorAll('[name="card_view_view_mode"]'));if(ca&&ha.length){const l=()=>{const m=this.querySelector('[name="card_view_view_mode"]:checked')?.value;ca.style.display=m===X.videoOnly?"":"none"};ha.forEach(m=>{m.addEventListener("change",l)}),l()}const fe=this.querySelector("#wide_view_page_enabled"),pa=this.querySelector("#wide-view-page-options"),ma=this.querySelector("#col-width-row"),dt=this.querySelector("#wide_view_timeline_enabled"),ua=this.querySelector("#wide-timeline-enabled-row"),_a=this.querySelector("#wide-timeline-default-open-row"),va=this.querySelector("#wide-timeline-default-scale-row");if(fe&&ma){const l=()=>{pa&&(pa.style.display=fe.checked?"contents":"none"),ma.style.display=fe.checked?"":"none",ua&&(ua.style.display=fe.checked?"":"none"),_a&&(_a.style.display=fe.checked&&dt?.checked?"":"none"),va&&(va.style.display=fe.checked&&dt?.checked?"":"none"),this._validateEditorFields()};fe.addEventListener("change",l),fe.addEventListener("value-changed",l),dt?.addEventListener("change",l),dt?.addEventListener("value-changed",l),l()}const ct=this.querySelector("#mobile_view_page_enabled"),ga=this.querySelector("#mobile-view-outer-border-row");if(ct&&ga){const l=()=>{ga.style.display=ct.checked?"":"none"};ct.addEventListener("change",l),ct.addEventListener("value-changed",l),l()}const ht=this.querySelector("#mobile_view_ha_navbar_bottom"),ba=[this.querySelector("#mobile-view-ha-navbar-stack-row"),this.querySelector("#mobile-view-ha-navbar-dashboard-row")].filter(Boolean);if(ht&&ba.length){const l=()=>{const m=ht.checked===!0;ba.forEach(y=>{y.style.display=m?"":"none"})};ht.addEventListener("change",l),ht.addEventListener("value-changed",l),l()}this._validateEditorFields()}_getCams(){return Array.isArray(this._config?.cameras)?Zt(this._config.cameras.map(e=>Xa(e,{fallbackName:""})).filter(e=>e.entity),pe):[]}_commitGridOrder(e){this._config={...this._config,grid_order:ue(e,this._getCams())},this._render(),this._publishPreviewDraft(),this._markHomeAssistantDirty(this._homeAssistantConfig({readDom:!1}))}_wireGridOrderControls(){this.querySelectorAll("[data-grid-order-mode]").forEach(t=>{t.addEventListener("click",()=>{const a=ue(this._config?.grid_order,this._getCams()),i=t.dataset.gridOrderMode===W.custom?W.custom:W.default;i!==a.mode&&this._commitGridOrder({...a,mode:i})})});const e=Array.from(this.querySelectorAll(".grid-order-row"));Ua({rows:e,clearDropTargets:()=>{this.querySelectorAll(".grid-order-row").forEach(t=>{t.classList.remove("drop-target","drop-target-before","drop-target-after")})},onReorder:(t,a,i)=>{const r=ue(this._config?.grid_order,this._getCams());if(t===a||t<0||a<0||t>=r.included.length||a>=r.included.length)return;const o=Ga(r.included,t,a,i);this._commitGridOrder({...r,included:o})}}),this.querySelectorAll("[data-grid-order-exclude]").forEach(t=>{t.addEventListener("click",()=>{const a=String(t.dataset.gridOrderExclude||"").trim(),i=ue(this._config?.grid_order,this._getCams());!a||!i.included.includes(a)||this._commitGridOrder({...i,included:i.included.filter(r=>r!==a),excluded:[...i.excluded,a]})})}),this.querySelectorAll("[data-grid-order-include]").forEach(t=>{t.addEventListener("click",()=>{const a=String(t.dataset.gridOrderInclude||"").trim(),i=ue(this._config?.grid_order,this._getCams());!a||!i.excluded.includes(a)||this._commitGridOrder({...i,included:[...i.included,a],excluded:i.excluded.filter(r=>r!==a)})})})}_emitPreviewDraft(e,t=null){window.dispatchEvent(new CustomEvent("frigate-view-card-preview-draft",{detail:{cardTag:Ne,config:e,routeIntent:t}}))}_publishPreviewDraft(e=null){this._hasVisualDraft=!0,this._emitPreviewDraft(Oa(this._config),e)}_homeAssistantConfig({readDom:e=!0}={}){if(e){const t=this._getCams();this._config=this._normalizeConfig(Ya({root:this,baseConfig:this._config,cameras:t,themeDraftCache:this._themeDraftCache,themeMode:this._activeThemeModeKey(),hiddenTabsOverride:this._hiddenTabsDraft})),this._syncHiddenTabsDraftFromConfig(this._config)}return Hr($r(this._config,{themeDefaultColors:this._themeDefaultHexMap()}),{sourceConfig:this._config})}_markHomeAssistantDirty(e=null){const t=e||this._homeAssistantConfig();if(this._haDirtyBaselineConfig===void 0)return;const a=this._configSignature(t);if(this._hasConfigDraft=a!==this._haDirtyBaselineSig,this._syncConfigSaveReminder(),this._pendingHaDirtyConfig=t,this._seedHomeAssistantDirtyState(),!this._haDirtyStateContext){const i=this._findHomeAssistantEditCardDialog();typeof i?._updateDirtyState=="function"?i._updateDirtyState(t):this._dispatch(t),this._requestHomeAssistantDirtyStateContext()}}_u({dispatch:e=!1,preview:t=!1,previewRouteIntent:a=null}={}){if(!this._validateEditorFields())return;const i=this._configSignature(this._config),r=this._getCams(),o=this._landingPageOptionSignature(this._config),n=Ya({root:this,baseConfig:this._config,cameras:r,themeDraftCache:this._themeDraftCache,themeMode:this._activeThemeModeKey(),hiddenTabsOverride:this._hiddenTabsDraft}),s=this._normalizeConfig(n),d=this._configSignature(s)!==i,c=this._landingPageOptionSignature(s);this._config=s,this._syncHiddenTabsDraftFromConfig(s),t&&(d||a)&&(this._hasVisualDraft=!0,this._emitPreviewDraft(Oa(s),a)),a?.type===st.revertStandaloneDraft&&(this._standaloneDraftPreviousLandingPage=null),o!==c&&this._render(),d&&this._markHomeAssistantDirty(this._homeAssistantConfig({readDom:!1})),e&&d&&this._dispatch()}_commitDraftToHomeAssistantDialog(){const e=this._homeAssistantConfig(),t=this._findHomeAssistantEditCardDialog();if(!t||!("_cardConfig"in t)){this._dispatch(e);return}this._lastDispatchedConfig=e,this._lastDispatchedConfigSig=this._configSignature(e),t._cardConfig=e,t._updateDirtyState?.(e)}_dispatch(e=this._homeAssistantConfig()){this._lastDispatchedConfig=e,this._lastDispatchedConfigSig=this._configSignature(e),this.dispatchEvent(new CustomEvent("config-changed",{detail:{config:e},bubbles:!0,composed:!0}))}},ci=`${Ne}-editor`;customElements.get(ci)||customElements.define(ci,Eo);
