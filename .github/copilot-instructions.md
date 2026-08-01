# GitHub Copilot Instructions - FrigateView Card

## Project Scope

This repository is a modern JavaScript custom card for Home Assistant.

For architectural rationale and refactor strategy, see `docs/refactor-guidelines.md`. Keep this file focused on hard repository rules.

- Language: JavaScript (ES modules), not TypeScript.
- UI stack: plain Custom Elements, Shadow DOM, and CSS custom properties, not Lit.
- Build output: `frigate-view-card.js` is a generated bundle and must stay aligned with source changes.
- Versioning: bump `src/constants.js` `VERSION` for every behavioral or structural code change.

## Core Coding Standards

- Use standard modern JavaScript with `import` and `export`.
- End statements with semicolons.
- Prefer `const`; use `let` only when reassignment is required.
- Use camelCase for variables, functions, and methods.
- Use kebab-case for custom element names and filename patterns that represent elements or page modules.
- Prefer `async` and `await` over promise chains for primary control flow.
- Use guard clauses instead of deep nesting.
- Keep comments short and focused on why a block exists, not what each line does.
- Add documentation comments only where public API or unusually complex logic benefits from them; do not add JSDoc mechanically.

## Architecture Boundaries

- Keep `src/card/FrigateViewCard.js` as the top-level runtime owner for shared shell orchestration, live engine lifecycle, playback, data loading, and other safety-critical behavior.
- Move deterministic rendering and pure derivation logic into focused helper modules or page controllers.
- Name new files by stable responsibility, not by temporary placement in the DOM or layout.
- Prefer small, composable helpers over large coupled methods.
- Keep public behavior unchanged unless the task explicitly requests a behavior change.

## Live View And Startup Safety

- Do not modify live view mount or playback internals unless the change is explicitly requested or directly fixes a proven defect.
- Preserve startup ordering: initial event window load should complete before live mount.
- Keep Firefox/WebRTC/MSE ordering and fallback race behavior intact unless the task is specifically about that flow.
- Preserve thin compatibility wrappers in `FrigateViewCard` when regressions or built-output checks depend on exact method names or literals.

## Rendering And Interaction Rules

- Keep DOM writes intentional and minimal.
- Avoid redundant `innerHTML` rewrites when the rendered result is effectively unchanged.
- Keep thumbnail and media host nodes stable across refreshes, tab switches, and camera switches.
- Camera switches should render cached list data immediately, then refresh in the background.
- Tab switches should update only the affected surface rather than forcing broad rerenders.
- Periodic refresh should not reset browse state when the active window and camera are unchanged.

## Media And Platform Rules

- On iOS, alerts and clips must use the `master.m3u8` playback path.
- On iOS, recordings must use m3u8 recording sources only.
- Do not introduce MP4 fallback for iOS recordings.

## Refactor Standards

- Separate data loading, normalization, view-state transitions, and DOM rendering.
- Move deterministic logic into pure utilities that do not read or write `this` when practical.
- Keep class methods primarily for orchestration, minimal state updates, and focused render triggers.
- Avoid hidden side effects and mutation-heavy flows unless they are necessary and well contained.
- Rendering helpers should accept explicit inputs and produce deterministic output for the same inputs.
- When fixing regressions, remove unnecessary complexity before adding new mechanisms.

## Repository Validation

Use the narrowest validation that matches the change.

- For touched source files, prefer `node --check <file>` first.
- After structural or behavioral source changes, run `npm run build`.
- For refactor safety, run `node --test tests/refactor-regression.test.mjs`.
- When a focused test file exists for the changed surface, run that test in addition to or before the broader regression suite.

## Change Planning Guidance

- Prefer incremental refactor slices over broad rewrites.
- Validate immediately after each meaningful structural edit.
- Do not move risky orchestration code into page modules just to satisfy file-splitting goals.
- If a new helper or file is introduced, keep its ownership boundary obvious from the name and exported API.
