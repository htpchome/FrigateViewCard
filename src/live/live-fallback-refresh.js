import { resolveFallbackDisplaySource } from "./live-fallback-image.js";

export const nextFallbackRequestId = (currentRequestId) =>
  Number(currentRequestId || 0) + 1;

export const issueFallbackRefreshToken = ({ currentRequestId }) => {
  const requestId = nextFallbackRequestId(currentRequestId);
  return {
    requestId,
    nextRequestId: requestId,
  };
};

export const getFallbackRefreshElements = (shadowRoot) => ({
  imgEl: shadowRoot?.querySelector?.("#stream-fallback-img") || null,
  statusEl: shadowRoot?.querySelector?.("#stream-fallback-status") || null,
});

export const canRefreshFallbackImage = ({ imgEl }) => !!imgEl;

export const beginFallbackRefresh = ({ imgEl, currentRequestId }) => {
  if (!canRefreshFallbackImage({ imgEl })) {
    return {
      shouldAbort: true,
      token: null,
    };
  }
  return {
    shouldAbort: false,
    token: issueFallbackRefreshToken({ currentRequestId }),
  };
};

export const resolveFallbackRefreshEntity = (activeCam) =>
  String(activeCam?.entity || "").trim();

export const loadPrimaryFallbackSource = async ({ entity, loadPrimary }) => {
  if (!entity) return "";
  return await loadPrimary(entity);
};

export const resolveAltFallbackSource = ({ entity, loadAlt }) => {
  if (!entity) return "";
  return loadAlt(entity);
};

export const resolveFallbackRefreshSources = ({ primarySrc, altSrc }) => {
  const outcome = buildFallbackRefreshOutcome({
    primarySrc,
    altSrc,
  });
  return {
    primarySrc,
    altSrc,
    src: outcome.src,
    hasSource: outcome.hasSource,
  };
};

export const buildFallbackRefreshContext = ({
  entity,
  primarySrc,
  loadAlt,
}) => {
  const altSrc = resolveAltFallbackSource({
    entity,
    loadAlt,
  });
  const sources = resolveFallbackRefreshSources({
    primarySrc,
    altSrc,
  });
  return {
    entity,
    primarySrc,
    altSrc,
    sources,
  };
};

export const shouldApplyFallbackRefreshSources = ({ sources }) =>
  !!sources?.hasSource;

export const buildFallbackImageApplyPayload = ({
  imgEl,
  statusEl,
  entity,
  sources,
}) => ({
  img: imgEl,
  statusEl,
  altSrc: sources?.altSrc || "",
  entity,
  src: sources?.src || "",
});

export const buildFallbackImageWriteInput = ({ context, imgEl, statusEl }) => {
  const sources = context?.sources || null;
  return {
    applyPayload: buildFallbackImageApplyPayload({
      imgEl,
      statusEl,
      entity: context?.entity || "",
      sources,
    }),
    src: sources?.src || "",
  };
};

export const executeFallbackRefreshWrite = ({
  writeInput,
  applyHandlers,
  applySource,
}) => {
  if (!writeInput?.applyPayload) return;
  applyHandlers(writeInput.applyPayload);
  applySource({
    img: writeInput.applyPayload.img,
    src: writeInput.src,
  });
};

export const isFallbackRefreshStale = ({ requestId, activeRequestId }) =>
  requestId !== activeRequestId;

export const shouldAbortStaleFallbackRefresh = ({
  requestId,
  activeRequestId,
}) => isFallbackRefreshStale({ requestId, activeRequestId });

export const shouldAbortFallbackRefreshAfterPrimary = ({
  token,
  activeRequestId,
}) =>
  shouldAbortStaleFallbackRefresh({
    requestId: token?.requestId,
    activeRequestId,
  });

export const loadPrimaryWithStaleGate = async ({
  entity,
  token,
  activeRequestId,
  readActiveRequestId,
  loadPrimary,
}) => {
  const primarySrc = await loadPrimaryFallbackSource({
    entity,
    loadPrimary,
  });
  const resolvedActiveRequestId = readActiveRequestId?.() ?? activeRequestId;
  if (
    shouldAbortFallbackRefreshAfterPrimary({
      token,
      activeRequestId: resolvedActiveRequestId,
    })
  ) {
    return {
      shouldAbort: true,
      primarySrc: "",
    };
  }
  return {
    shouldAbort: false,
    primarySrc,
  };
};

export const runFallbackRefreshCycle = async ({
  shadowRoot,
  currentRequestId,
  activeCam,
  setActiveRequestId,
  readActiveRequestId,
  loadPrimary,
  loadAlt,
  applyHandlers,
  applySource,
}) => {
  const { imgEl, statusEl } = getFallbackRefreshElements(shadowRoot);
  const begin = beginFallbackRefresh({
    imgEl,
    currentRequestId,
  });
  if (begin.shouldAbort) {
    return {
      shouldAbort: true,
      didWrite: false,
    };
  }

  const token = begin.token;
  setActiveRequestId?.(token.nextRequestId);

  const entity = resolveFallbackRefreshEntity(activeCam);
  const primaryPhase = await loadPrimaryWithStaleGate({
    entity,
    token,
    activeRequestId: token.nextRequestId,
    readActiveRequestId,
    loadPrimary,
  });
  if (primaryPhase.shouldAbort) {
    return {
      shouldAbort: true,
      didWrite: false,
    };
  }

  const context = buildFallbackRefreshContext({
    entity,
    primarySrc: primaryPhase.primarySrc,
    loadAlt,
  });
  if (!shouldApplyFallbackRefreshSources({ sources: context.sources })) {
    return {
      shouldAbort: false,
      didWrite: false,
    };
  }

  const writeInput = buildFallbackImageWriteInput({
    context,
    imgEl,
    statusEl,
  });
  executeFallbackRefreshWrite({
    writeInput,
    applyHandlers,
    applySource,
  });

  return {
    shouldAbort: false,
    didWrite: true,
  };
};

export const buildFallbackRefreshOutcome = ({ primarySrc, altSrc }) => {
  const src = resolveFallbackDisplaySource({
    primarySrc,
    altSrc,
  });
  return {
    src,
    hasSource: !!src,
  };
};
