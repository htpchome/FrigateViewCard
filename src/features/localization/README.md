# Localization

The card reads the Home Assistant user's language from `hass.locale.language`,
falling back to `hass.language` and then English. It tries an exact locale,
successively shorter locale codes, and finally `en`. Missing keys also use
their English value.

Home Assistant does not automatically load a custom card's language files.
The bundled languages are English (`en`), German (`de`), Spanish (`es`),
Latin American Spanish (`es-419`), French (`fr`), European Portuguese (`pt`),
Brazilian Portuguese (`pt-BR`), Italian (`it`), Polish (`pl`), and Catalan (`ca`).
Regional locales inherit their base language before falling back to English; for example, `fr-CA`
inherits `fr`.
The `es-419` and `pt-BR` files contain only regional wording differences and
inherit all other entries from `es` and `pt`, respectively. `pt-PT` uses the
complete `pt` catalog while retaining its regional date/time formatting.

To add a translation, put a JSON file in `languages/` using its HA locale code
(for example, `pt-BR.json`), then add a static import and registry entry in
`localization.ctrl.js`. The build bundles registered dictionaries into both
the runtime and editor artifacts; no runtime fetch or HACS file-list change is
needed.

`en.json` is the source of truth for keys and named placeholders. Plain-text
nodes and attributes can use `data-fvc-i18n` and the attribute variants in
`localized-dom.js`; changing status and validation text can use
`setLocalizedText()` so its key and placeholder values survive a language
change. Attribute markers can share `data-fvc-i18n-values` for named values.
For formatted help text, keep placeholders in one translated sentence and
insert the formatted elements as DOM nodes, so translations can reorder them
without treating dictionary text as HTML.
Camera names, user-configured text, and Frigate-provided labels are data, not
UI translations.

Displayed dates use the resolved card language and Home Assistant's configured
time zone. The English fallback keeps the card's existing month/day, ordinal,
and 12-hour presentation. An explicit Home Assistant 12/24-hour preference
overrides the default time style. Internal day keys and time-zone arithmetic
remain locale-independent.
