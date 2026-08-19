export function resolveAbsoluteReceiverSourceUrl(
  sourceUrl = "",
  baseUrl = "",
) {
  const normalized = String(sourceUrl || "").trim();
  if (!normalized || normalized.startsWith("blob:")) return "";
  try {
    return new URL(normalized, baseUrl).href;
  } catch (_) {
    return "";
  }
}
