##### Under Construction ####

Use at your own risk while this card is being built.


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
    Example YAML:

```yaml
type: custom:frigate-view-card
cameras:
  - entity: camera.front_door
title: Frigate
```

## YAML Configuration

The visual editor keeps saved YAML compact. Default values are accepted by the card, but the editor omits them from YAML unless you change them.

Minimal configuration:

```yaml
type: custom:frigate-view-card
cameras:
  - entity: camera.front_door
```

### Top-Level Options

| Variable                       | Type    | Default                  | Description                                                                                                     |
| ------------------------------ | ------- | ------------------------ | --------------------------------------------------------------------------------------------------------------- |
| `cameras`                      | list    | required                 | Camera definitions. Up to 8 cameras are supported.                                                              |
| `title`                        | string  | camera name or `Cameras` | Main card title.                                                                                                |
| `subtitle`                     | string  | `Frigate`                | Secondary title text.                                                                                           |
| `window_days`                  | number  | `3`                      | Number of days to load for Clips, Snapshots, Recordings, and Kept views.                                        |
| `alerts_reviews_days`          | number  | same as `window_days`    | Number of days to load for the Alerts view.                                                                     |
| `realtime_poll_seconds`        | number  | `5`                      | Real-time Frigate polling interval. Valid values: `2`, `5`, `10`, `15`.                                         |
| `mobile_poll_battery_saver`    | boolean | `false`                  | Uses a slower mobile polling interval to reduce battery usage.                                                  |
| `slideshow_rotation_enabled`   | boolean | `false`                  | Enables automatic live-camera rotation on non-phone devices.                                                    |
| `slideshow_rotation_seconds`   | number  | `30`                     | Slideshow rotation interval. Valid values: `10`, `20`, `30`, `60`.                                              |
| `grid_mode_enabled`            | boolean | `false`                  | Enables the 2x2 grid mode controls.                                                                             |
| `grid_start_in_grid_enabled`   | boolean | `false`                  | Starts in grid mode and returns to grid mode when re-entering the dashboard.                                    |
| `grid_live_view_enabled`       | boolean | `true`                   | Uses live streams in grid mode. Set to `false` for snapshot-first grid tiles.                                   |
| `grid_rotation_seconds`        | number  | `30`                     | Grid camera rotation interval when more than four cameras are configured. Valid values: `10`, `20`, `30`, `60`. |
| `landing_page_enabled`         | boolean | `false`                  | Starts on a camera landing grid instead of the standard live/event layout.                                      |
| `landing_page_live_cameras`    | boolean | `false`                  | Uses live streams on landing-page camera tiles.                                                                 |
| `landing_page_show_title_bars` | boolean | `true`                   | Shows title bars on landing-page camera tiles.                                                                  |
| `hidden_tabs`                  | list    | `[]`                     | Tabs to hide. Valid values: `alerts`, `clips`, `snapshot`, `recordings`, `kept`.                                |
| `theme`                        | string  | `default`                | Use `default` for Home Assistant theme variables or `custom` for color overrides.                               |
| `theme_custom`                 | map     | `{}`                     | Custom theme color overrides. Only values different from the resolved defaults need to be saved.                |
| `stream_height`                | number  | unset                    | Maximum media/card height. When unset, the card uses its automatic height.                                      |
| `stream_height_unit`           | string  | `vh`                     | Unit for `stream_height`. Valid values: `vh`, `em`, `px`. Only useful when `stream_height` is set.              |
| `tight_margins`                | boolean | `false`                  | Reduces outer card margins.                                                                                     |
| `shadows`                      | boolean | `true`                   | Enables card shadows.                                                                                           |
| `wide_view`                    | boolean | `false`                  | Enables wide two-column layout.                                                                                 |
| `col_left_width_pct`           | number  | `50`                     | Left column width percentage for wide view. Valid range: `10` to `90`.                                          |

### Camera Options

Each item under `cameras` supports these fields:

| Variable              | Type    | Default             | Description                                                                     |
| --------------------- | ------- | ------------------- | ------------------------------------------------------------------------------- |
| `entity`              | string  | required            | Home Assistant camera entity, for example `camera.front_door`.                  |
| `name`                | string  | entity-derived name | Display name for the camera.                                                    |
| `connection_type`     | string  | `frigate_go2rtc`    | Playback source. Valid values: `frigate_go2rtc`, `ha_direct`.                   |
| `alerts_content`      | string  | `alerts_only`       | Alerts tab content for this camera. Valid values: `alerts_only`, `all_reviews`. |
| `disable_hls_desktop` | boolean | `false`             | Disables HLS fallback for this camera on desktop.                               |

Camera example with non-default values:

```yaml
type: custom:frigate-view-card
cameras:
  - entity: camera.front_door
    name: Front Door
    alerts_content: all_reviews
  - entity: camera.driveway
    connection_type: ha_direct
title: Frigate
```

### Custom Theme Colors

Set `theme: custom` and add only the color variables you want to override. The editor removes custom color values that match the current Home Assistant theme defaults.

```yaml
type: custom:frigate-view-card
cameras:
  - entity: camera.front_door
theme: custom
theme_custom:
  --c-bg-main: "#101418"
  --c-text: "#f5f7fa"
  --c-accent: "#3b82f6"
```

Supported `theme_custom` keys:

| Variable        | Controls                         |
| --------------- | -------------------------------- |
| `--c-bg-main`   | Card background color            |
| `--c-bg-panel`  | Secondary panel background color |
| `--c-bg-deep`   | Video background color           |
| `--c-text`      | Primary text color               |
| `--c-text2`     | Secondary text color             |
| `--c-text3`     | Tertiary text color              |
| `--c-text4`     | Disabled/fourth text color       |
| `--c-text-rev`  | Reverse text color               |
| `--c-border`    | Primary border color             |
| `--c-border2`   | Secondary border color           |
| `--c-primary`   | Primary action color             |
| `--c-primary-l` | Light primary color              |
| `--c-primary-d` | Dark primary color               |
| `--c-accent`    | Accent color                     |
| `--c-bg-scrub`  | Recording scrub bar background   |
| `--c-bg-alert`  | Alert marker color               |

### Legacy Options

| Variable                                        | Type        | Notes                                                                                                           |
| ----------------------------------------------- | ----------- | --------------------------------------------------------------------------------------------------------------- |
| `camera_entity`, `camera`, `entity`, `entities` | string/list | Older camera config formats are still normalized into `cameras`. New configs should use `cameras`.              |
| `window_hours`                                  | number      | Legacy event window. New configs should use `window_days`.                                                      |
| `refresh_seconds`                               | number      | Accepted for older configs, with a minimum of `15`. Real-time polling is controlled by `realtime_poll_seconds`. |

## Development

Source files live in `src/`. The root `frigate-view-card.js` file is the generated production artifact used by Home Assistant and HACS.

Build and validate locally:

```bash
npm install
npm run build
npm test
```

Edit files under `src/`, then run `npm run build` before testing or packaging a release.

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
