import {
  requiresNestedSignedHlsRequests,
  toAbsoluteSignedUrl,
  toWebSocketUrl,
} from "../../shared/media/url-utils.js";

export async function signHomeAssistantPath({ hass, path, expires = 3600 }) {
  try {
    const result = await hass.callWS({
      type: "auth/sign_path",
      path,
      expires,
    });
    return result?.path || path;
  } catch (_) {
    return path;
  }
}

export function resolveAbsoluteSignedPath({ signedPath, origin }) {
  return toAbsoluteSignedUrl({ signedPath, origin });
}

export async function signSameOriginAbsoluteUrl({
  hass,
  url,
  origin,
  expires = 3600,
}) {
  const abs = String(url || "").trim();
  if (!abs) return abs;

  let parsed;
  try {
    parsed = new URL(abs, origin);
  } catch (_) {
    return abs;
  }

  if (parsed.origin !== origin) return parsed.toString();

  const signedPath = await signHomeAssistantPath({
    hass,
    path: `${parsed.pathname}${parsed.search}`,
    expires,
  });
  return resolveAbsoluteSignedPath({ signedPath, origin });
}

export async function buildSignedGo2RtcWebSocketUrl({
  hass,
  path,
  origin,
  expires = 3600,
}) {
  const signedPath = await signHomeAssistantPath({ hass, path, expires });
  const abs = resolveAbsoluteSignedPath({ signedPath, origin });
  return toWebSocketUrl(abs);
}

export async function buildGo2RtcHlsProbeResult({
  rawPath,
  signedPath,
  manifestUrl,
  requiresNestedSignedHlsRequestsImpl = requiresNestedSignedHlsRequests,
}) {
  if (!requiresNestedSignedHlsRequestsImpl({ rawPath, signedPath })) {
    return { url: manifestUrl, cacheable: true, destroy: null };
  }
  // Native HLS reloads changing playlists and segments itself. Home Assistant
  // signs each HTTP path independently, so a frontend-only manifest cannot
  // keep those future requests authenticated.
  return null;
}
