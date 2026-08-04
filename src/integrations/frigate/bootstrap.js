import {
  isM3u8Url,
  requiresNestedSignedHlsRequests,
  rewriteM3u8Manifest,
  toAbsoluteSignedUrl,
  toWebSocketUrl,
} from "../../features/live/url-provider.js";

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

export async function rewriteSignedHlsManifestSource({
  manifestUrl,
  blobUrls,
  signAbsoluteUrl,
  fetchImpl = fetch,
  depth = 0,
}) {
  if (depth > 3) return null;

  let resp;
  try {
    resp = await fetchImpl(manifestUrl, {
      method: "GET",
      cache: "no-store",
      credentials: "same-origin",
    });
  } catch (_) {
    return null;
  }
  if (!resp.ok) return null;

  const manifestText = await resp.text();
  const rewritten = await rewriteM3u8Manifest({
    manifestText,
    rewriteUri: async (uri) => {
      const resolvedUrl = new URL(uri, manifestUrl).toString();
      if (isM3u8Url(resolvedUrl)) {
        const nestedManifestUrl = await signAbsoluteUrl(resolvedUrl);
        const nestedBlobUrl = await rewriteSignedHlsManifestSource({
          manifestUrl: nestedManifestUrl,
          blobUrls,
          signAbsoluteUrl,
          fetchImpl,
          depth: depth + 1,
        });
        return nestedBlobUrl || nestedManifestUrl;
      }
      return await signAbsoluteUrl(resolvedUrl);
    },
  });

  const blobUrl = URL.createObjectURL(
    new Blob([rewritten], { type: "application/vnd.apple.mpegurl" }),
  );
  blobUrls.push(blobUrl);
  return blobUrl;
}

export async function buildGo2RtcHlsProbeResult({
  rawPath,
  signedPath,
  manifestUrl,
  rewriteManifestSource,
  revokeObjectUrl = (url) => URL.revokeObjectURL(url),
  requiresNestedSignedHlsRequestsImpl = requiresNestedSignedHlsRequests,
}) {
  if (!requiresNestedSignedHlsRequestsImpl({ rawPath, signedPath })) {
    return { url: manifestUrl, cacheable: true, destroy: null };
  }

  const blobUrls = [];
  const rewrittenUrl = await rewriteManifestSource(manifestUrl, blobUrls);
  if (!rewrittenUrl) {
    blobUrls.forEach((blobUrl) => revokeObjectUrl(blobUrl));
    return null;
  }

  return {
    url: rewrittenUrl,
    cacheable: false,
    destroy: () => {
      blobUrls.forEach((blobUrl) => revokeObjectUrl(blobUrl));
    },
  };
}
