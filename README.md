# FrigateViewCard

A simple Camera and Events Card to use with Home Assistant and Frigate.

## Acknowledgments

This project originally started as a fork of [frigate-modern-hass-card](https://github.com/QuadNL/frigate-modern-hass-card) developed by [QuadNL](https://github.com/QuadNL). Although the codebase has since been rewritten and evolved independently, we want to thank the original author for the foundational ideas that inspired this work.


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
