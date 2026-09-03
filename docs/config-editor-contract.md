# Configuration Editor Contract

This document records the known-good visual configuration behavior released in
FrigateView Card `1.1.3`. The corresponding DEV rollback tag is
`checkpoint-stable-config-1.1.3-20260903-063617`.

The devcontainer reference environment for this contract is Home Assistant Core
`2026.9.0`. Compatibility fallbacks should remain in place for older Home
Assistant editor implementations unless a future change deliberately removes
them.

## User-facing contract

The editor has two independent responsibilities:

1. Tell Home Assistant that the configuration differs from the saved baseline,
   so its Save button accurately enables or disables.
2. Show appropriate draft changes in the existing card preview without asking
   Home Assistant to recreate that card.

A control is not correctly implemented unless both responsibilities work. Save
state must never depend on whether a visual preview update was necessary, and a
preview update must never be used as the mechanism that enables Save.

## Configuration state

- The first normalized configuration received through `setConfig()` establishes
  the saved Home Assistant baseline.
- The baseline is the compact, serialized Home Assistant card configuration,
  including `type`, rather than a raw collection of DOM values.
- Subsequent controls update the editor's normalized draft.
- Returning every value to the baseline must clear the dirty state.
- Repeated `setConfig()` calls with the same normalized signature must not
  rebuild the editor. They may perform a lightweight layout synchronization.
- Camera modal **Add** and **Update** actions update the editor draft. They do not
  persist anything until the user presses Home Assistant's Save button.
- Canceling the Home Assistant dialog must discard the draft. Saving must commit
  the final draft exactly once and it must survive closing and reopening the
  editor.

Do not introduce a second pending-changes state. Home Assistant's Save state and
the baseline/draft signature are the source of truth. If a pending-changes
indicator is ever added again, it must only display that same state; it must not
control, duplicate, or delay persistence.

## Home Assistant Save-state lane

The preferred path is Home Assistant's `dirtyState` context:

- Request the context with a bubbling, composed `context-request` event.
- Seed it once with the saved baseline under the stable
  `frigate-view-card-editor` key.
- Send the complete normalized/compacted draft to `context.setState()` whenever
  a real configuration change occurs.
- Keep dirty-state subscription cleanup in `disconnectedCallback()`.

Compatibility paths are intentionally retained:

1. If dirty-state context is unavailable but `hui-dialog-edit-card` exposes
   `_updateDirtyState()`, update the dialog through that method.
2. Only when neither path exists should the editor emit the documented,
   bubbling and composed `config-changed` event to make older Home Assistant
   editors recognize the draft.

On the Home Assistant Save action, commit the final draft to the surrounding
dialog and update its dirty state. Do not emit `config-changed` continuously on
modern Home Assistant merely to enable Save: Home Assistant rebuilds preview
cards when that event is dispatched, which restarts media and makes the editor
laggy.

Every editable control must enable Save when its serialized value changes. This
includes:

- text fields;
- native checkboxes;
- Home Assistant switches and selectors;
- select/dropdown controls;
- radio and checkbox choice chips;
- sliders;
- theme color pickers, default toggles, and reset controls;
- camera add, update, delete, and reorder operations;
- page, navigation, Grid, Slideshow, and mobile options.

## Internal visual-preview lane

Preview updates use the internal `frigate-view-card-preview-draft` window event,
scoped with the FrigateView card tag. The preview card applies the draft through
the editor-preview controller. This event is separate from Home Assistant's
`config-changed` persistence event.

Ordinary draft updates must be soft updates:

- keep the existing live engine and mounted media elements;
- do not restart WebRTC, MSE, HLS, or snapshot playback unnecessarily;
- keep the active camera unless the camera configuration makes it invalid;
- preserve browse data, list nodes, filters, scroll position, and popup state;
- update only the affected text, style, toolbar, navigation, or page region;
- coalesce related DOM work into one animation frame where practical;
- never call the public full-card `setConfig()` path just to paint an editor
  draft.

Title and subtitle typing is debounced by 200 ms. The preview should update once
the user pauses, while the field's final `change` event applies immediately.
Typing must not recreate the card for every letter.

Non-text controls that change visible output should update promptly. Examples
include title/subtitle Display checkboxes, colors, page enable switches, Grid
availability, Slideshow availability, logo visibility, borders, corners,
shadows, and navigation choices. Theme colors should repaint through CSS/style
synchronization rather than a full media refresh.

The editor's own markup should only rerender when its available controls or
conditional sections genuinely change. A broad `_render()` on every input event
is a regression because it replaces controls while the user is interacting with
them.

## Preview media rules

- The main Single View camera may remain live while the editor is open.
- Grid shown inside the editor preview must use snapshots even when the saved
  dashboard setting allows live Grid cameras. The real dashboard card continues
  to honor the saved live-Grid setting.
- Configuration changes unrelated to media must not remount the live camera.
- A camera-list change may clamp an invalid active camera index, but should not
  reset a still-valid selection.

## Preview routing rules

- On initial editor launch, the preview follows the configured landing-page rule
  for the current device class.
- Changing the landing-page selector navigates the existing preview to the new
  landing page.
- Wide View is the one editor-only exception: when configured as the landing
  page, the editor starts on Single View to avoid loading the large Wide View
  behind the configuration dialog.
- This exception must not alter the saved `landing_page`; the actual dashboard
  card must still start in Wide View.
- Users may manually navigate to Wide View inside the editor after startup.
- If the currently displayed page is disabled, the editor preview falls back to
  Single View.
- Card View standalone transitions use explicit route intents so Apply, Save,
  Cancel, and revert behavior remain deterministic.

## Adding or changing a configuration option

Before considering an option complete, verify every applicable step:

1. Render the control from the normalized editor configuration.
2. Read its DOM value into `buildEditorConfigFromDom()`.
3. Normalize it in the card/editor configuration path.
4. Serialize and compact it for Home Assistant/YAML without losing the value.
5. Include it in `createEditorPreviewDraft()` when it affects visible output.
6. Apply it in `applyEditorPreviewDraftToCardConfig()`.
7. Add the control to editor event wiring so a real change marks Home Assistant
   dirty.
8. Choose a focused soft-preview update; use route navigation or media remounting
   only when the option truly requires it.
9. Add focused persistence and preview regression coverage.
10. Confirm the saved value survives closing and reopening the editor.

## Required regression checks

At minimum, configuration changes should be tested in both Chrome and Firefox
against the pinned Home Assistant devcontainer and, before release, the live
Home Assistant environment.

Use one control from each event family:

- type into Title, pause, and confirm the preview text updates without blinking;
- toggle Title Display and confirm the preview updates immediately;
- change a dropdown/selector and confirm Save enables;
- change a switch and a native checkbox and confirm Save enables;
- change a color and its Use Default switch and confirm Save enables while the
  preview repaints without restarting media;
- add or update a camera and confirm the outer Home Assistant Save is still
  required;
- change enabled pages and confirm navigation buttons update;
- change the landing page and confirm the routing rules above;
- enter Grid in the editor and confirm snapshots are used;
- return all edited values to their baseline and confirm Save disables;
- test Save persistence and Cancel discard behavior.

Automated checks should continue to cover at least
`tests/editor-camera-dialog.test.mjs`,
`tests/editor-preview-context-controller.test.mjs`,
`tests/config-serialization.test.mjs`, page-controller tests affected by the
option, and `tests/refactor-regression.test.mjs` for compatibility-sensitive
changes.

## Stop conditions

Do not ship a configuration change if any of these occur:

- a changed control does not enable Home Assistant Save;
- Save is enabled but the value is absent after reopening the editor;
- ordinary typing or toggling visibly recreates the preview card;
- live media reconnects for an unrelated visual change;
- Firefox and Chrome disagree about whether Save is available;
- changing one option resets unrelated draft values, navigation, media, or
  browse state;
- editor-only preview safety changes leak into the saved dashboard behavior.
