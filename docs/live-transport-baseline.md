# Live Transport Known-Good Baseline

## Current Baseline

`v1.1.5-dev.63` established the original live connection baseline physically
tested on September 6, 2026. Later Mac Catalyst testing found that its HA Direct
HLS browser-player retention was not valid. `v1.1.7-dev.64` corrects that
lifecycle in code and automated coverage; physical Catalyst validation remains
required.

- `frigate_go2rtc` connections are good. Preserve its established WebRTC/MSE
  startup, connection retention, camera-switch behavior, fallbacks, and
  two-way-talk behavior exactly unless a request explicitly targets this mode.
- `ha_direct` HLS supplies the first picture nearly
  immediately, a capable WebRTC connection may take over when ready, retained
  WebRTC connections are reused, and browsers that cannot complete WebRTC
  remain on HLS.
- HA Direct WebRTC takeover and HA Direct two-way-talk negotiation work, but
  remain slower than desired. This is accepted for this baseline. Treat faster
  negotiation as deferred optimization, not an active defect requiring a
  speculative change.

Do not change unrelated popup, fullscreen, iOS, aspect-ratio, resize, zoom, or
layout behavior while optimizing either transport.

## HA Direct Startup Contract

Preserve all of these behaviors together:

1. Start HLS and WebRTC asynchronously for a WebRTC-capable HA Direct camera.
2. Commit ready HLS immediately; do not delay the first picture while waiting
   for WebRTC.
3. Keep the pending WebRTC attempt explicitly owned after HLS is committed.
4. Replace HLS only after WebRTC has rendered usable media.
5. Release HLS after a successful WebRTC takeover.
6. If WebRTC fails, keep the already-playing HLS connection.
7. When the camera changes, cancel the pending takeover before retaining or
   releasing the current HLS engine so no WebRTC session is orphaned.
8. Preserve card-owned HA Direct WebRTC retention and reuse across camera
   switches. Do not retain or reparent Home Assistant's `ha-hls-player` custom
   element; release it on departure and create a fresh player on return.
9. On browsers where WebRTC is unavailable or cannot complete, use HA HLS and
   do not force the stream down to snapshots while HLS is viable.

Home Assistant owns the HA Direct HLS player lifecycle. Removing or reparenting
`ha-hls-player` invokes its disconnect cleanup, which destroys browser-side HLS
playback. The card must therefore keep the snapshot visible while a fresh HLS
player starts and hide it only after rendered-media readiness. Home Assistant
may independently keep its backend camera stream warm; that backend reuse must
not be simulated by caching the browser custom element.

Do not add a short WebRTC selection cutoff. A prior three-second first-track
cutoff rejected connections that would have succeeded and caused the wrong
transport to win.

## HA Direct WebRTC Signaling

The `v1.1.5-dev.63` signaling path deliberately follows Home Assistant's
frontend behavior:

- receive transceivers are added in audio-then-video order;
- local ICE candidates already gathered by `setLocalDescription()` are
  included in the initial SDP offer;
- candidates gathered after the offer continue through
  `camera/webrtc/candidate` once the session ID exists;
- the signaling subscription remains non-resubscribing and is explicitly
  released by the owning engine.

HA Direct two-way talk keeps its separate peer connection and working media
shape. It also includes already-gathered local ICE candidates in the initial
offer. Do not change its transceiver/media layout merely to make it resemble
the receive-only live connection.

Future latency work should first measure the time spent in client-config
fetching, offer/session/answer signaling, ICE connection, and first rendered
media. Do not change selection timers or fallback policy without evidence that
one of those policies is the cause.

## Relevant Development History

- `v1.1.5-dev.58` introduced a card-owned HA Direct WebRTC lifecycle with HLS
  fallback based on rendered media.
- `v1.1.5-dev.59` addressed orphaned WebRTC sessions, but its three-second
  first-track cutoff was too aggressive. That cutoff must not return.
- `v1.1.5-dev.60` raced WebRTC and HLS and retained winners, but a quick HLS win
  ended the WebRTC attempt before it could take over.
- `v1.1.5-dev.61` allowed WebRTC to replace provisional HLS, but treating HLS
  as provisional made the otherwise-fast HLS path feel slower.
- `v1.1.5-dev.62` established the current handoff: commit HLS as soon as it is
  ready while WebRTC continues as an owned pending takeover.
- `v1.1.5-dev.63` restored Home Assistant's audio/video ordering and initial
  ICE-candidate offer handling, and applied the initial-candidate optimization
  to HA Direct two-way talk without changing its media shape.
- `v1.1.7-dev.64` stopped grace-caching HA Direct HLS players after physical
  Catalyst testing showed that custom-element reparenting restarted playback
  and could leave video black while audio continued. HA Direct WebRTC and
  Frigate go2rtc retention remain unchanged.

## Validation Expectations

Any future live-transport change must test the two connection modes separately
and must include physical checks for:

- first-picture time on WebRTC-capable and non-WebRTC clients;
- eventual WebRTC takeover on a capable client;
- stable HLS playback when WebRTC cannot complete;
- retained WebRTC/MSE connection counts during fast camera switching and fresh
  HA Direct HLS player creation on return;
- complete teardown without increasing connection or subscription counts;
- HA Direct two-way-talk incoming and outgoing audio;
- unchanged `frigate_go2rtc` startup, fallback, switching, and talk behavior.
