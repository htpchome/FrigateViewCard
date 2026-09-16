# Localization

The card reads the Home Assistant user's language from `hass.locale.language`,
falling back to `hass.language` and then English. It tries an exact locale,
successively shorter locale codes, and finally `en`. Missing keys also use
their English value.

Home Assistant does not automatically load a custom card's language files.
To add a translation, put a JSON file in `languages/` using its HA locale code
(for example, `pt-BR.json`), then add a static import and registry entry in
`localization.ctrl.js`. The build bundles registered dictionaries into both
the runtime and editor artifacts; no runtime fetch or HACS file-list change is
needed.

`en.json` is the source of truth for keys and named placeholders. Plain-text
nodes and attributes can use `data-fvc-i18n` and the attribute variants in
`localized-dom.js`. For markup containing HTML, use `t(key, values)` while
building the markup and escape translated values for their HTML context.
Camera names, user-configured text, and Frigate-provided labels are data, not
UI translations.
