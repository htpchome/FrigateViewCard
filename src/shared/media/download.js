export const triggerBrowserDownload = ({
  url = "",
  filename = "",
  documentObj = globalThis.document,
} = {}) => {
  const anchor = documentObj?.createElement?.("a");
  if (!anchor) {
    throw new Error("File downloads are not supported in this browser.");
  }
  anchor.href = url;
  anchor.download = filename;
  documentObj.body?.appendChild?.(anchor);
  try {
    anchor.click();
  } finally {
    anchor.remove?.();
  }
};
