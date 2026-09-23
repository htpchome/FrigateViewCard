# FrigateView Refactor Guidelines

This document captures the architectural rationale behind the current refactor direction. Keep `.github/copilot-instructions.md` short and directive; keep the longer explanation here.

## Primary Boundaries

- `ARCHITECTURE.md` is the authoritative module-ownership contract.
- `src/card/FrigateViewCard.js` owns card lifecycle, active camera/page/tab
  state, high-level composition, transport-mode selection, and event wiring.
- Feature modules own their workflows: live startup and playback belong in
  `src/features/live/`, browse loading and windowing in `src/features/browse/`,
  popup media in `src/features/popup/`, navigation in
  `src/features/navigation/`, and integration-specific behavior in
  `src/integrations/`.
- Page controllers should own page-specific deterministic rendering and route-local orchestration.
- Pure helpers should own deterministic markup builders, formatting, selection derivation, and other logic that can run without reading or mutating `this`.

## Controller vs Shared Rule

- If a file needs knowledge of both layout behavior and server-backed application state, treat it as a controller or model and keep it under `src/features/`.
- If a file is blind to app context and only manipulates data, events, or DOM mechanics, treat it as a shared utility and keep it under `src/shared/`.
- Do not leave context-blind utilities under `src/card/` just because the main card currently imports them.

## What Belongs Outside The Main Card

- Deterministic markup builders.
- Pure formatting and derivation helpers.
- Page-specific render helpers.
- Narrow click-handler helpers when they only dispatch a cohesive branch cluster.
- Small controller methods that coordinate a single page surface without touching risky global runtime behavior.

## What Should Usually Stay In The Main Card

- Custom-element lifecycle and Home Assistant property entry points.
- Active camera, page, tab, and high-level mode selection.
- High-level composition and event wiring between owning controllers.
- Transport-mode selection; transport execution remains with the owning live
  or integration module.
- Thin compatibility wrappers whose exact source shape is protected by
  regression tests. These wrappers should delegate immediately and must not
  become alternate behavior owners.

Live mount/playback internals, fallback races, browse window mutation, popup
media loading, and integration-specific mapping do not belong in the main card.
When existing compatibility-sensitive code still lives there, move it in small,
tested slices to the owner named by `ARCHITECTURE.md`.

## Naming Rules For New Files

- Name files by stable responsibility, not by current DOM placement.
- Prefer names like `calendar-filter-markup.js` over names tied to one surface such as `browse-panel-markup.js`.
- Avoid names that imply ownership by the wrong module.
- If a helper is shared by multiple routes or layouts, keep the name neutral and concern-based.

## Rendering Rules

- Keep DOM writes minimal and intentional.
- Avoid redundant `innerHTML` rewrites when the rendered result is equivalent.
- Keep thumbnail, media, and mount host nodes stable across tab switches, camera switches, and refreshes.
- Prefer one complete deterministic render pass over progressive churn for the same data.

## Safe Refactor Strategy

- Prefer small adjacent slices over broad rewrites.
- Extract the safest deterministic piece first.
- Validate immediately after each meaningful edit.
- If a first extraction succeeds, continue with the next cohesive branch or helper cluster.
- Preserve live, playback, and startup ordering while moving implementation to
  the owning controller behind an explicit interface. If one slice cannot
  preserve that ordering, stop and choose a narrower boundary.

## Validation Workflow

Use the narrowest check that can falsify the current change.

1. `node --check` on touched source files.
2. Focused tests for the changed slice when they exist.
3. `npm run build` after structural or behavioral source changes.
4. `node --test tests/refactor-regression.test.mjs` for compatibility-sensitive refactors.

## Repository-Specific Invariants

- Bump `src/constants.js` `VERSION` for every behavioral or structural code change.
- Preserve iOS media rules: alerts and clips use `master.m3u8`; recordings stay m3u8-only.
- Preserve Firefox/WebRTC/MSE startup ordering and fallback behavior unless the task is explicitly about that path.
- Preserve compatibility wrappers in `FrigateViewCard` when built-output regressions depend on them.
