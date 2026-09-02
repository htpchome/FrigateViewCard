const HTML_ESCAPE_REPLACEMENTS = Object.freeze({
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
});

export const escapeHtml = (value) =>
  String(value ?? "").replace(
    /[&<>"']/g,
    (character) => HTML_ESCAPE_REPLACEMENTS[character],
  );

export const escapeHtmlAttribute = escapeHtml;
