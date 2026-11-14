# FrigateView Card v1.1.11 release notes

Changes since v1.1.10.

- **Reliable Chrome recording seeking:** Recording timeline clicks now advance
  to the selected time in Chrome instead of producing an incorrect seek.
- **Better mobile camera selection:** The active camera remains fully visible
  in a scrollable camera bar while a small part of the next camera remains in
  view as a scroll cue. Touch devices no longer receive misleading hover
  styling.
- **Camera-only notification links:** Notification deep links can now open the
  requested camera and view without requiring an event or review identifier.
- **Optional Card View camera dropdown:** A new Card View setting can hide the
  overlay camera dropdown. When only one camera is configured, FrigateView Card
  omits all camera-navigation controls and their unused layout space.
- **Safer visual-editor saves:** Editing one of multiple FrigateView Cards in a
  horizontal stack, vertical stack, Bubble Card, or another nested card now
  preserves the parent card and its sibling cards.

## Upgrade notes

Update through the existing **FrigateView Card** listing in HACS, then refresh
the browser. No custom-repository registration is required. For manual
installations, replace every file from `dist/` with files from this release; do
not mix companion or language files from different versions. The card type and
resource filename remain unchanged.
