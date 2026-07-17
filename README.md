# FrigateViewCard

A simple Camera and Events Card to use with Home Assistant and Frigate.

## Notification Deep Links

FrigateViewCard supports opening specific media from URL query parameters. This is useful for Home Assistant notification tap actions.

Supported parameters:

- `event`, `event_id`, `frigate_event`, `frigate_event_id`
- `review`, `review_id`, `frigate_review`, `frigate_review_id`
- optional camera hint: `camera`, `cam`, `camera_entity`

Behavior:

- `event` links open the matching event clip/snapshot popup directly.
- `review` links resolve to the first detection event in that review and then open the event popup.
- If a camera hint is provided, the card switches to that camera first.

Tap Action URL examples (Frigate Notifications blueprint variables):

- Event-based: `https://YOUR_HA_URL/YOUR_DASHBOARD/YOUR_VIEW?camera={{camera}}&event={{id}}`
- Review-based: `https://YOUR_HA_URL/YOUR_DASHBOARD/YOUR_VIEW?camera={{camera}}&review={{review_id}}`

Notes:

- Dashboard/view path is not hardcoded; use whatever path contains this card.
- Query parameters are read from both `location.search` and hash-based routes containing `?` parameters.
