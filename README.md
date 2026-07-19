# FrigateViewCard

A simple Camera and Events Card to use with Home Assistant and Frigate.

## Acknowledgments

This project originally started as a fork of [frigate-modern-hass-card](https://github.com/QuadNL/frigate-modern-hass-card) developed by [QuadNL](https://github.com/QuadNL). Although the codebase has since been rewritten and evolved independently, we want to thank the original author for the foundational ideas that inspired this work.

## Installation
## HACS (Recommended)

    Go to the HACS page in your Home Assistant instance.
    Click the three-dot menu in the top right.
    Select "Custom repositories".
    In the "Repository" field, paste the URL of this repository (https://github.com/htpchome/FrigateViewCard).
    For "Category", select "Dashboard".
    Click "Add".
    The FrigateView Card will now appear in the HACS Frontend list. Click "Install".

## Manual Installation

    Download the frigate-view-card.js file from the latest release.
    Copy the file to the www directory in your Home Assistant config folder.
    In your Lovelace dashboard, go to "Manage Resources" and add a new resource:
        URL: /local/frigate-view-card.js
        Resource Type: JavaScript Module


## Core Functions

- Live camera viewing for up to 8 configured Frigate/Home Assistant camera entities.
- Per-camera connection options for Frigate go2rtc or direct Home Assistant camera playback.
- Alerts, Clips, Snapshots, Recordings, and Kept tabs with configurable active tabs.
- Frigate event and review browsing with thumbnails, event history windows, and real-time refresh polling.
- Media popups for event clips, snapshots, and recordings, including download actions where Frigate exposes downloadable media.
- Event retain/unretain support for saving important Frigate events into the Kept view.
- Optional slideshow rotation for the main live camera view on non-phone devices.
- Optional 2x2 grid mode for multi-camera dashboards, including live or snapshot grid behavior and rotation for larger camera sets.
- Mobile-aware behavior, including battery-saver polling and iOS-compatible HLS playback paths for Frigate media.
- Visual customization through Home Assistant theme variables, custom color overrides, shadows, tight margins, wide view, and height controls.
- Notification deep links that open a specific Frigate event or review directly from dashboard URL parameters.


## Notification Deep Links

FrigateViewCard supports opening specific media from URL query parameters. This is useful for Home Assistant notification tap actions.

Supported parameters:

- `event`, `event_id`, `frigate_event`, `frigate_event_id`
- `review`, `review_id`, `frigate_review`, `frigate_review_id`
- optional media hint: `media` (`snapshot` or `clip`)
- optional camera hint: `camera`, `cam`, `camera_entity`

Behavior:

- `event` links open the matching event clip/snapshot popup directly.
- `review` links resolve to the first detection event in that review and then open the event popup.
- `media=snapshot` forces snapshot popup when an event/review resolves.
- `media=clip` prefers clip popup when a clip exists.
- If a camera hint is provided, the card switches to that camera first.

Tap Action URL examples (Frigate Notifications blueprint variables):

- Event-based: `https://YOUR_HA_URL/YOUR_DASHBOARD/YOUR_VIEW?camera={{camera}}&event={{id}}`
- Review-based: `https://YOUR_HA_URL/YOUR_DASHBOARD/YOUR_VIEW?camera={{camera}}&review={{review_id}}`
- Combined fallback (single template): `https://YOUR_HA_URL/YOUR_DASHBOARD/YOUR_VIEW?camera={{camera}}&event={{id}}&review={{review_id}}`
- Combined snapshot fallback (single template): `https://YOUR_HA_URL/YOUR_DASHBOARD/YOUR_VIEW?camera={{camera}}&event={{id}}&review={{review_id}}&media=snapshot`
- Snapshot popup from event: `https://YOUR_HA_URL/YOUR_DASHBOARD/YOUR_VIEW?camera={{camera}}&event={{id}}&media=snapshot`
- Snapshot popup from review: `https://YOUR_HA_URL/YOUR_DASHBOARD/YOUR_VIEW?camera={{camera}}&review={{review_id}}&media=snapshot`

## Alerts Tab Review Filter (Per Camera)

Frigate camera review settings can classify Reviews as Alerts, Detections, or both.

Each camera in FrigateViewCard now has an `Alerts Area Content: All Reviews` toggle in Camera Settings:

- Off (default): Alerts tab shows Alerts only.
- On: Alerts tab shows all Reviews (Alerts + Detections).

This is a per-camera setting and only affects what is displayed in the Alerts tab list.

Notes:

- Dashboard/view path is not hardcoded; use whatever path contains this card.
- Query parameters are read from both `location.search` and hash-based routes containing `?` parameters.
