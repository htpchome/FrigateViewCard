# Frigate View Card Contract

## 1. Product Goal

This app exists to do four things well:

- show a live camera quickly and predictably
- let the user switch cameras and keep state coherent
- let the user browse alerts, reviews, clips, and recordings clearly
- let the user configure per-camera behavior without hidden transport surprises

## 2. Non-Negotiable Rules

- The top-level shell is orchestration only.
- Files are grouped by stable responsibility, not where they were last used.
- No catch-all folders for miscellaneous helpers.
- No mixed-responsibility modules.
- No feature work is allowed to create new architectural ambiguity.
- If a requirement is impossible in the chosen transport model, the code must say so plainly instead of simulating it with hacks.
- `frigate_go2rtc` and `ha_direct` are separate modes and must stay separate in both code paths and tests.

## 3. Transport Decision

Chosen model:

- `frigate_go2rtc` is the primary card-managed live transport mode.
- `ha_direct` is the explicit Home Assistant-managed live transport mode.

Meaning of `frigate_go2rtc`:

- the card owns transport selection, startup policy, race behavior, fallback behavior, and live-mode orchestration
- the card may use Home Assistant-exposed Frigate/go2rtc surfaces to implement that behavior
- the mode must not silently collapse into the Home Assistant camera-stream path

Meaning of `ha_direct`:

- Home Assistant owns stream playback behavior
- the card delegates live playback to Home Assistant stream components and Home Assistant-selected transport behavior
- the card must not run its own go2rtc race in this mode

Why:

- this preserves the two-mode product behavior already exposed in config
- it avoids pretending that `frigate_go2rtc` is a truly browser-direct Frigate path when it is not
- it keeps card-managed live behavior and Home Assistant-managed live behavior distinct instead of blending them

Browser is allowed to talk to:

- Home Assistant-exposed Frigate/go2rtc surfaces used by the card-managed `frigate_go2rtc` mode
- Home Assistant stream components and Home Assistant APIs used by `ha_direct`
- Lovelace and Home Assistant config persistence APIs

Browser must not assume:

- that the Home Assistant Frigate integration is a generic direct Frigate tunnel
- that HA proxy routes are equivalent to true browser-direct Frigate access
- that HA-exposed PTZ/live/media endpoints exactly match upstream Frigate capabilities
- that `frigate_go2rtc` and `ha_direct` may share one blended startup path

## 4. Top-Level Shell

`src/card/` owns:

- card lifecycle
- active camera selection
- active page and tab selection
- high-level feature composition
- top-level event wiring between features
- choosing whether a camera is in `frigate_go2rtc` or `ha_direct` mode

`src/card/` must not own:

- live transport bootstrap details
- Frigate mapping or Frigate/go2rtc URL construction
- stream adapter logic
- HLS manifest rewriting
- PTZ action planning
- browse filtering or windowing logic
- popup media loading logic
- transport-specific retry logic

## 5. Folder Ownership

`src/card/`

- thin runtime shell and composition root only

`src/features/live/`

- live-only startup policy, transport orchestration, stream adapters, mount lifecycle, fallback policy, and the card-managed `frigate_go2rtc` path

`src/features/browse/`

- alerts, reviews, clips/recordings list behavior, filters, browse state, windowing, paging, and browse rendering decisions

`src/features/popup/`

- popup media state, popup playback UX, popup controls, drag/swipe, and carousel behavior

`src/features/ptz/`

- PTZ capability model, PTZ config normalization, action planning, and PTZ UI/controller behavior

`src/features/navigation/`

- pages, routes, deep links, page availability, and page transition rules

`src/features/linked-entities/`

- per-camera links to Home Assistant entities, linked-control state and presentation, and interaction behavior such as light brightness adjustment

`src/integrations/frigate/`

- Frigate-specific mapping, Home Assistant-exposed Frigate/go2rtc surface resolution, transport capability resolution, and Frigate-specific API assumptions

`src/integrations/home-assistant/`

- explicit Home Assistant-owned playback adapters and helpers for `ha_direct`, plus Home Assistant entity-service adapters used by linked controls

`src/shared/media/`

- reusable video/audio/media element helpers, generic playback utilities, and media DOM primitives used by multiple features

`src/shared/`

- pure generic utilities only: data normalization, dates, strings, and small stateless helpers

## 6. Forbidden Ownership

Live transport code must not live in:

- `src/card/`
- `src/shared/`

Frigate-specific mapping must not live in:

- `src/features/live/`
- `src/card/`

Home Assistant direct-mode adapters must not live in:

- `src/features/live/`
- `src/integrations/frigate/`

Generic media primitives must not live in:

- `src/features/live/`
- `src/features/popup/`

Browse/filter/windowing logic must not live in:

- `src/card/`
- `src/shared/`

PTZ action planning must not live in:

- `src/card/`
- `src/shared/`

Popup media loading rules must not live in:

- `src/card/`

## 7. MVP

Version 1 is done when all of these are true:

- opening the card on one configured camera produces a stable live connection
- camera switching works without corrupting browse/live state
- alerts/reviews browsing works with coherent filtering and windowing
- config saves, reloads, and matches runtime behavior
- `frigate_go2rtc` and `ha_direct` are visibly distinct modes with distinct startup paths

## 8. Out Of Scope For MVP

- PTZ presets beyond the core supported actions
- advanced live heuristics beyond the chosen transport design
- broad UI polish work
- transport experiments not required for the core live path
- convenience refactors unrelated to the MVP

## 9. Validation Rules

Every change must satisfy all of these:

- one subsystem at a time
- one behavior at a time
- one clear owning folder
- one narrow validation before broader validation
- no while-I-am-here edits
- no workaround that hides an architectural contradiction
- tests must assert which mode is active when the behavior depends on `frigate_go2rtc` versus `ha_direct`
- every config option that changes visible card output must be normalized,
  persisted, included in the editor preview draft, applied immediately to the
  live editor preview, and protected by focused regression coverage

## 10. AI Working Rules

- No web research unless explicitly requested.
- If the requested behavior conflicts with this contract, say so immediately.
- Do not describe `frigate_go2rtc` as truly browser-direct Frigate unless the runtime actually becomes that.
- Do not blend `frigate_go2rtc` and `ha_direct` into one hidden control flow.
- Do not add new modules unless their folder ownership is already defined here without asking first.


## 11. Rejection Rule

A change must be rejected if it does any of the following:

- makes the shell fatter
- creates a mixed-responsibility file
- puts feature logic into `shared`
- puts generic media code into a feature folder
- mixes Frigate-specific assumptions into generic runtime code
- hides whether behavior is coming from `frigate_go2rtc` or `ha_direct`
- solves a symptom by hiding the transport or ownership problem instead of fixing it
