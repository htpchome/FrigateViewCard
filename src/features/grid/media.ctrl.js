import {
  buildHaCameraStreamState,
  createHaCameraStreamElement,
} from "../../integrations/home-assistant/playback.js";
import { watchMediaFirstFrame } from "../../shared/media/first-frame.js";
import { appendCacheBustParam } from "../live/fallbacks/fallback-url.js";
import { adoptMountedAttemptSlot } from "../live/mount-result.js";
import { createStrategyForType } from "../live/stream.strategies.js";
import { StreamOrchestrator } from "../live/stream.orchestrator.js";
import {
  applyGridCellSeverityClass,
  buildGridSignaturePart,
  createGridCellElement,
  createGridLabelElement,
  createGridRootElement,
  renderGridEmptyPlaceholder,
} from "./page.tmpl.js";
import { resolveGridCameras } from "./config.js";

const GRID_LIVE_ATTEMPT_TYPES = Object.freeze(["webrtc", "mse", "hls"]);
const GRID_WEBRTC_PREFERRED_WAIT_MS = 500;

const gridLiveAttemptStartup = (type) => {
  if (type === "webrtc") return { waitMs: 7000 };
  if (type === "hls") return { waitMs: 5000 };
  return {
    waitMs: 4000,
    minCurrentTime: 0.05,
    minDecodedFrames: 1,
    requireReadyState: 2,
    strict: true,
  };
};

export class GridMediaController {
  constructor(host, options = {}) {
    this._host = host;
    this._buildLabelText =
      typeof options.buildLabelText === "function"
        ? options.buildLabelText
        : () => "";
    this._liveIconSvg = String(options.liveIconSvg || "");
  }

  pageCameraIndices() {
    const total = resolveGridCameras(
      this._host._config?.cameras,
      this._host._config?.grid_order,
    ).length;
    if (!total) return [];
    const maxStart = Math.max(0, (Math.ceil(total / 4) - 1) * 4);
    const rawStart = Math.max(0, Number(this._host._gridRotationStart) || 0);
    const start = Math.min(maxStart, Math.floor(rawStart / 4) * 4);
    this._host._gridRotationStart = start;
    return [0, 1, 2, 3].map((offset) => {
      const idx = start + offset;
      return idx < total ? idx : -1;
    });
  }

  _mountGridSnapshotCell(
    cell,
    {
      entity,
      stateObj,
      className = "",
      prioritizeSnapshot = false,
    },
  ) {
    if (!cell || !entity) return false;
    const img = document.createElement("img");
    const entityPicture = stateObj?.attributes?.entity_picture || "";
    img.alt = `${entity} snapshot`;
    img.loading = prioritizeSnapshot ? "eager" : "lazy";
    if (prioritizeSnapshot) img.fetchPriority = "high";
    img.decoding = "async";
    if (className) img.className = className;
    void (async () => {
      const primaryUrl = await this._host._streamFallbackUrl(entity);
      if (!img.isConnected) return;
      if (primaryUrl) {
        img.src = primaryUrl;
        return;
      }
      if (entityPicture) {
        img.src = /^https?:\/\//i.test(entityPicture)
          ? entityPicture
          : `${window.location.origin}${entityPicture}`;
      }
    })();
    cell.appendChild(img);
    return img;
  }

  _createLiveSnapshotStage(cell, { entity, stateObj, gridState }) {
    const placeholder = this._mountGridSnapshotCell(cell, {
      entity,
      stateObj,
      className: "preview-live-placeholder",
      prioritizeSnapshot: true,
    });
    const liveLayer = document.createElement("div");
    liveLayer.className = "preview-live-layer";
    cell.appendChild(liveLayer);

    let disposed = false;
    let removePlaceholderT = null;
    const reveal = () => {
      if (disposed || gridState?.destroyed || !liveLayer.isConnected) return;
      liveLayer.classList.add("is-ready");
      if (removePlaceholderT) clearTimeout(removePlaceholderT);
      removePlaceholderT = setTimeout(() => {
        removePlaceholderT = null;
        try {
          placeholder?.remove?.();
        } catch (_) {}
      }, 180);
    };
    const retainPlaceholder = () => {
      if (disposed) return;
      disposed = true;
      if (removePlaceholderT) clearTimeout(removePlaceholderT);
      removePlaceholderT = null;
      try {
        liveLayer.remove();
      } catch (_) {}
    };
    const cleanup = () => {
      disposed = true;
      if (removePlaceholderT) clearTimeout(removePlaceholderT);
      removePlaceholderT = null;
      try {
        liveLayer.remove();
      } catch (_) {}
      try {
        placeholder?.remove?.();
      } catch (_) {}
    };
    gridState?.cleanup?.push?.(cleanup);
    return { liveLayer, reveal, retainPlaceholder };
  }

  _isSignedCameraProxyUrl(url) {
    const source = String(url || "");
    return (
      /\/api\/camera_proxy\//i.test(source) && /[?&]authSig=/i.test(source)
    );
  }

  async _refreshSnapshotImageElement(img, resolvedUrl, cacheBustValue) {
    if (!img || !img.isConnected || !resolvedUrl) return;

    if (this._isSignedCameraProxyUrl(resolvedUrl)) {
      try {
        const response = await fetch(resolvedUrl, {
          cache: "no-store",
          credentials: "same-origin",
        });
        if (!response.ok) return;
        const blob = await response.blob();
        if (!img.isConnected) return;
        const nextBlobUrl = URL.createObjectURL(blob);
        const previousBlobUrl = img.dataset.fvcBlobUrl || "";
        img.src = nextBlobUrl;
        img.dataset.fvcBlobUrl = nextBlobUrl;
        if (previousBlobUrl && previousBlobUrl !== nextBlobUrl) {
          try {
            URL.revokeObjectURL(previousBlobUrl);
          } catch (_) {}
        }
      } catch (_) {}
      return;
    }

    img.src = appendCacheBustParam(resolvedUrl, cacheBustValue);
  }

  async _resolveSnapshotImageUrl(entity, stateObj = null) {
    const primaryUrl = await this._host._streamFallbackUrl(entity);
    if (primaryUrl) return primaryUrl;
    const entityPicture =
      stateObj?.attributes?.entity_picture ||
      this._host._hass?.states?.[entity]?.attributes?.entity_picture ||
      "";
    if (!entityPicture) return "";
    return /^https?:\/\//i.test(entityPicture)
      ? entityPicture
      : `${window.location.origin}${entityPicture}`;
  }

  async refreshSnapshotMedia({ cacheBustValue = Date.now() } = {}) {
    const hosts = this._host.shadowRoot?.querySelectorAll(
      ".preview-media-host[data-preview-use-live='0'], .live-grid-cell[data-grid-use-live='0'], .wide-companion-media-host[data-wide-companion-use-live='0']",
    );
    if (!hosts?.length) return;

    await Promise.all(
      Array.from(hosts).map(async (host) => {
        const img = host.querySelector?.("img");
        if (!img || !img.isConnected) return;
        const entity =
          host.dataset.previewMediaEntity ||
          host.dataset.gridEntity ||
          host.dataset.wideCompanionMediaEntity ||
          "";
        if (!entity) return;
        const stateObj = this._host._hass?.states?.[entity] || null;
        const resolvedUrl = await this._resolveSnapshotImageUrl(
          entity,
          stateObj,
        );
        if (!resolvedUrl || !img.isConnected) return;
        await this._refreshSnapshotImageElement(
          img,
          resolvedUrl,
          cacheBustValue,
        );
      }),
    );
  }

  _mountGridGo2RtcCell(cell, entity, gridState, options = {}) {
    const host = document.createElement("div");
    host.style.cssText =
      "position:relative;width:100%;height:100%;display:block;overflow:hidden";
    cell.appendChild(host);
    const abortController =
      typeof AbortController === "function" ? new AbortController() : null;
    let mountedEngine = null;
    let mountedType = "";
    let activeOrchestrator = null;
    let cleaned = false;
    const handoff = {
      take: () => {
        if (cleaned || !mountedEngine || !mountedType) return null;
        const engine = mountedEngine;
        const type = mountedType;
        const orchestrator = activeOrchestrator;
        const winnerStrategy = orchestrator?.attempts?.find?.(
          (attempt) => attempt?.type === type,
        )?.strategy;
        cleaned = true;
        mountedEngine = null;
        mountedType = "";
        activeOrchestrator = null;
        if (winnerStrategy) {
          void orchestrator?.stop?.({ exclude: winnerStrategy });
        }
        return {
          ok: true,
          type,
          engine,
          slot: host,
        };
      },
    };
    const cleanup = () => {
      if (cleaned) return;
      cleaned = true;
      try {
        abortController?.abort?.();
      } catch (_) {}
      try {
        void activeOrchestrator?.stop?.();
      } catch (_) {}
      activeOrchestrator = null;
      try {
        mountedEngine?.destroy?.();
      } catch (_) {}
      mountedEngine = null;
      try {
        host.innerHTML = "";
        host.remove?.();
      } catch (_) {}
    };
    gridState.cleanup.push(cleanup);
    if (options.preferWebRtc === true) {
      this._mountGridGo2RtcRace({
        cell,
        entity,
        gridState,
        options,
        host,
        handoff,
        isCleaned: () => cleaned,
        setMountedResult: (engine, type) => {
          mountedEngine = engine;
          mountedType = String(type || "").trim().toLowerCase();
        },
        setActiveOrchestrator: (orchestrator) => {
          activeOrchestrator = orchestrator;
        },
      });
      return;
    }
    void (async () => {
      if (gridState.destroyed || cleaned) return;
      const liveStreamHint = String(options.liveStreamHint || "mse")
        .trim()
        .toLowerCase();
      const mountMethod =
        liveStreamHint === "webrtc"
          ? "tryMountWebRtc"
          : liveStreamHint === "hls"
            ? "tryMountHls"
            : "tryMountMse";
      const mount = this._host._go2rtcMounter?.[mountMethod];
      let result = false;
      try {
        result =
          typeof mount === "function"
            ? await mount.call(
                this._host._go2rtcMounter,
                host,
                gridLiveAttemptStartup(liveStreamHint),
                {
                  abortSignal: abortController?.signal,
                  commit: false,
                  entity,
                  muted: true,
                },
              )
            : false;
      } catch (_) {
        result = false;
      }
      if (gridState.destroyed || cleaned || !host.isConnected) {
        try {
          result?.engine?.destroy?.();
        } catch (_) {}
        return;
      }
      if (!result?.ok) {
        this._handleGridLiveFailure(cell, entity, options, host);
        return;
      }
      mountedEngine = result.engine;
      mountedType = liveStreamHint;
      options.onReady?.(mountedEngine, mountedType, handoff);
    })();
  }

  _createGridLiveAttemptSlot(host) {
    const slot = document.createElement("div");
    slot.style.cssText =
      "position:absolute;inset:0;opacity:0;pointer-events:none;overflow:hidden";
    host.appendChild(slot);
    return slot;
  }

  _handleGridLiveFailure(cell, entity, options, host) {
    try {
      host?.remove?.();
    } catch (_) {}
    if (options.onFailure) {
      options.onFailure();
      return;
    }
    if (options.fallbackOnFailure) {
      this._mountGridSnapshotCell(cell, {
        entity,
        stateObj: options.stateObj || null,
      });
    }
  }

  _mountGridGo2RtcRace({
    cell,
    entity,
    gridState,
    options,
    host,
    handoff,
    isCleaned,
    setMountedResult,
    setActiveOrchestrator,
  }) {
    void (async () => {
      if (gridState.destroyed || isCleaned()) return;
      const strategies = GRID_LIVE_ATTEMPT_TYPES.map((type) => {
        const slot = this._createGridLiveAttemptSlot(host);
        const mountMethod =
          type === "webrtc"
            ? "tryMountWebRtc"
            : type === "hls"
              ? "tryMountHls"
              : "tryMountMse";
        return createStrategyForType({
          type,
          connect: async ({ abortSignal }) => {
            const mount = this._host._go2rtcMounter?.[mountMethod];
            if (typeof mount !== "function") return false;
            return await mount.call(
              this._host._go2rtcMounter,
              slot,
              gridLiveAttemptStartup(type),
              {
                abortSignal,
                commit: false,
                entity,
                muted: true,
              },
            );
          },
        });
      });
      const orchestrator = new StreamOrchestrator({
        strategies,
        preferredType: "webrtc",
        preferredWaitMs: GRID_WEBRTC_PREFERRED_WAIT_MS,
        retainPreferredOnFallback: true,
      });
      setActiveOrchestrator(orchestrator);
      const winner = await orchestrator.start();
      if (gridState.destroyed || isCleaned() || !host.isConnected) {
        try {
          winner?.engine?.destroy?.();
        } catch (_) {}
        return;
      }
      if (!winner?.ok || !winner.slot || !winner.engine) {
        this._handleGridLiveFailure(cell, entity, options, host);
        return;
      }

      adoptMountedAttemptSlot({
        targetSlot: host,
        resultSlot: winner.slot,
        preservePendingSlots:
          orchestrator.deferredPreferredAttempt?.type === "webrtc",
      });
      setMountedResult(winner.engine, winner.type);
      options.onReady?.(winner.engine, winner.type, handoff);

      const deferredWebRtc = orchestrator.deferredPreferredAttempt;
      if (deferredWebRtc?.type !== "webrtc") return;
      const webRtcResult = await deferredWebRtc.promise.catch(() => null);
      if (
        !webRtcResult?.ok ||
        gridState.destroyed ||
        isCleaned() ||
        !host.isConnected
      ) {
        return;
      }
      adoptMountedAttemptSlot({
        targetSlot: host,
        resultSlot: webRtcResult.slot,
      });
      try {
        winner.engine.destroy?.();
      } catch (_) {}
      setMountedResult(webRtcResult.engine, webRtcResult.type);
      options.onReady?.(webRtcResult.engine, webRtcResult.type, handoff);
    })();
  }

  _mountGridCameraCellMedia(
    cell,
    {
      entity,
      stateObj,
      useLive,
      liveStreamHint,
      gridState,
      fallbackOnLiveError = false,
      snapshotPlaceholderWhileLive = false,
      preferWebRtc = false,
      prioritizeSnapshot = false,
      onLiveReady = null,
    },
  ) {
    if (!cell || !entity) return false;
    if (useLive) {
      const liveStage = snapshotPlaceholderWhileLive
        ? this._createLiveSnapshotStage(cell, {
            entity,
            stateObj,
            gridState,
          })
        : null;
      const liveTarget = liveStage?.liveLayer || cell;
      if (this._host._shouldUseGo2RtcForEntity(entity)) {
        this._mountGridGo2RtcCell(liveTarget, entity, gridState, {
          fallbackOnFailure: fallbackOnLiveError && !liveStage,
          stateObj,
          liveStreamHint,
          preferWebRtc,
          onReady: (engine, type, handoff) => {
            liveStage?.reveal?.();
            onLiveReady?.(engine, { ...handoff, type });
          },
          onFailure: liveStage?.retainPlaceholder,
        });
      } else if (stateObj) {
        const stream = createHaCameraStreamElement({
          hass: this._host._hass,
          stateObj,
          controls: false,
          muted: true,
          defaultMuted: true,
          styleText:
            "width:100%;height:100%;display:block;background:var(--c-bg-deep)",
        });
        if (!stream) {
          liveStage?.retainPlaceholder?.();
          return Boolean(liveStage);
        }
        liveTarget.appendChild(stream);
        this._host._attachVideoFit(stream);
        let released = false;
        const handoffType = String(liveStreamHint || "").trim().toLowerCase();
        const handoff = {
          type: handoffType,
          take: () => {
            if (released || !stream) return null;
            released = true;
            return {
              ok: true,
              type: handoffType,
              engine: stream,
              slot: stream,
            };
          },
        };
        if (liveStage) {
          gridState.cleanup.push(
            watchMediaFirstFrame({
              mediaRoot: stream,
              findVideo: (root) => this._host._findVideoDeep?.(root) || null,
              isDestroyed: () => gridState.destroyed,
              onReady: () => {
                liveStage.reveal();
                onLiveReady?.(stream, handoff);
              },
            }),
          );
        } else {
          onLiveReady?.(stream, handoff);
        }
        gridState.cleanup.push(() => {
          if (released) return;
          try {
            const video = this._host._findVideoDeep?.(stream);
            if (video) {
              video.pause?.();
              video.removeAttribute?.("src");
              video.load?.();
            }
          } catch (_) {}
          try {
            stream.remove();
          } catch (_) {}
        });
      } else {
        liveStage?.retainPlaceholder?.();
        if (liveStage) return true;
        return this._mountGridSnapshotCell(cell, {
          entity,
          stateObj,
          prioritizeSnapshot,
        });
      }
      return true;
    }
    return this._mountGridSnapshotCell(cell, {
      entity,
      stateObj,
      prioritizeSnapshot,
    });
  }

  mountCameraCellMedia(cell, options = {}) {
    return this._mountGridCameraCellMedia(cell, options);
  }

  _setGridPresentation(slot, active) {
    if (!slot) return;
    slot.hidden = !active;
    slot.setAttribute?.("aria-hidden", active ? "false" : "true");
    const liveSlot = this._host.shadowRoot?.querySelector?.("#engine");
    liveSlot?.setAttribute?.("aria-hidden", active ? "true" : "false");
  }

  _gridSessionSignature(cameras = []) {
    const cameraSignature = cameras
      .map((camera) => {
        const entity = String(camera?.entity || "");
        const source = entity
          ? this._host._shouldUseGo2RtcForEntity(entity)
            ? "frigate_go2rtc"
            : "ha_direct"
          : "";
        return [entity, source, this._buildLabelText(camera)].join(":");
      })
      .join("|");
    return `${this._host._gridLiveViewEnabled() ? "live" : "snapshot"}|${cameraSignature}`;
  }

  _setGridPageActive(entry, active) {
    const grid = entry?.grid;
    if (!grid) return;
    grid.style.position = "absolute";
    grid.style.inset = "0";
    grid.style.opacity = active ? "1" : "0";
    grid.style.pointerEvents = active ? "auto" : "none";
    grid.style.zIndex = active ? "1" : "0";
    grid.setAttribute?.("aria-hidden", active ? "false" : "true");
  }

  _destroyGridPage(entry) {
    if (!entry || entry.destroyed) return;
    entry.destroyed = true;
    entry.gridState.destroyed = true;
    entry.grid
      ?.querySelectorAll?.("img[data-fvc-blob-url]")
      ?.forEach?.((img) => {
        const blobUrl = img.dataset.fvcBlobUrl || "";
        if (!blobUrl) return;
        try {
          URL.revokeObjectURL(blobUrl);
        } catch (_) {}
      });
    for (const cleanup of entry.gridState.cleanup) {
      try {
        cleanup();
      } catch (_) {}
    }
    entry.liveHandoffs?.clear?.();
    try {
      entry.grid?.remove?.();
    } catch (_) {}
  }

  _ensureGridSession(slot, cameras) {
    const signature = this._gridSessionSignature(cameras);
    const current = this._host._gridEngine;
    if (
      current?.slot === slot &&
      current?.signature === signature &&
      current?.pages instanceof Map &&
      current.destroyed !== true
    ) {
      return current;
    }

    try {
      current?.destroy?.();
    } catch (_) {}
    slot.innerHTML = "";
    const session = {
      slot,
      signature,
      pages: new Map(),
      activePageKey: "",
      destroyed: false,
      destroy: () => {
        if (session.destroyed) return;
        session.destroyed = true;
        for (const entry of session.pages.values()) {
          this._destroyGridPage(entry);
        }
        session.pages.clear();
        session.activePageKey = "";
      },
    };
    this._host._gridEngine = session;
    return session;
  }

  _activateGridPage(session, pageKey) {
    if (!session || session.destroyed) return;
    for (const [key, entry] of session.pages) {
      this._setGridPageActive(entry, key === pageKey);
    }
    session.activePageKey = pageKey;
  }

  _refreshGridPageSeverity(entry) {
    entry?.grid
      ?.querySelectorAll?.(".live-grid-cell[data-grid-entity]")
      ?.forEach?.((cell) => {
        cell.classList?.remove?.("grid-alert", "grid-detection");
        applyGridCellSeverityClass(
          cell,
          this._host._gridCellSeverity(cell.dataset.gridEntity || ""),
        );
      });
  }

  takeGridLiveHandoff(entity) {
    const targetEntity = String(entity || "").trim();
    const session = this._host._gridEngine;
    if (!targetEntity || !session?.pages) return null;
    for (const entry of session.pages.values()) {
      const handoff = entry?.liveHandoffs?.get?.(targetEntity);
      if (!handoff?.take) continue;
      const result = handoff.take();
      if (!result?.engine || !result?.slot) continue;
      entry.liveHandoffs.delete(targetEntity);
      return result;
    }
    return null;
  }

  mountGridEngine(slot) {
    if (!slot) return;
    this._setGridPresentation(slot, true);
    const indices = this.pageCameraIndices();
    const cameras = resolveGridCameras(
      this._host._config?.cameras,
      this._host._config?.grid_order,
    );
    const liveStreamHint = "webrtc";
    const signatureParts = [];
    const mediaSignatureParts = [];

    for (const idx of indices) {
      const cam = idx >= 0 ? cameras[idx] : null;
      const entity = cam?.entity || "";
      const severity = idx >= 0 ? this._host._gridCellSeverity(entity) : "";
      const useLive =
        idx >= 0 &&
        (this._host._gridLiveViewEnabled() ||
          this._host._isGridCameraAlertLive(entity));
      signatureParts.push(
        buildGridSignaturePart({
          index: idx,
          entity,
          severity,
          useLive,
          liveStreamHint,
        }),
      );
      mediaSignatureParts.push(
        buildGridSignaturePart({
          index: idx,
          entity,
          severity: "",
          useLive,
          liveStreamHint,
        }),
      );
    }

    const nextSignature = signatureParts.join("|");
    const nextMediaSignature = mediaSignatureParts.join("|");
    const pageKey = String(Math.max(0, Number(indices[0]) || 0));
    const session = this._ensureGridSession(slot, cameras);
    const cachedPage = session.pages.get(pageKey);
    if (cachedPage?.mediaSignature === nextMediaSignature) {
      this._refreshGridPageSeverity(cachedPage);
      cachedPage.signature = nextSignature;
      this._activateGridPage(session, pageKey);
      this._host._gridLastRenderSignature = nextSignature;
      this._host._setActiveStreamType("grid");
      this._host._syncSnapshotRefreshTimer?.();
      return;
    }

    if (cachedPage) {
      this._destroyGridPage(cachedPage);
      session.pages.delete(pageKey);
    }

    this._host._gridLastRenderSignature = nextSignature;
    const gridState = { destroyed: false, cleanup: [] };
    const grid = createGridRootElement();
    const pageEntry = {
      grid,
      gridState,
      liveHandoffs: new Map(),
      signature: nextSignature,
      mediaSignature: nextMediaSignature,
      destroyed: false,
    };
    this._setGridPageActive(pageEntry, false);
    session.pages.set(pageKey, pageEntry);
    slot.appendChild(grid);
    for (const idx of indices) {
      const cell = createGridCellElement();
      grid.appendChild(cell);
      if (idx >= 0) {
        const cam = cameras[idx];
        const entity = cam?.entity || "";
        const useGo2Rtc = entity
          ? this._host._shouldUseGo2RtcForEntity(entity)
          : false;
        const cameraStreamHint = useGo2Rtc
          ? liveStreamHint
          : this._host._preferredStreamType();
        const stateObj = entity
          ? buildHaCameraStreamState(
              this._host._hass,
              entity,
              cameraStreamHint,
              this._host._preferredStreamType(),
            ) ||
            this._host._hass?.states?.[entity] ||
            null
          : null;
        const severity = this._host._gridCellSeverity(entity);
        applyGridCellSeverityClass(cell, severity);
        const useLive =
          this._host._gridLiveViewEnabled() ||
          this._host._isGridCameraAlertLive(entity);
        cell.dataset.gridUseLive = useLive ? "1" : "0";
        if (entity) {
          this._mountGridCameraCellMedia(cell, {
            entity,
            stateObj,
            useLive,
            liveStreamHint,
            gridState,
            fallbackOnLiveError: true,
            snapshotPlaceholderWhileLive: true,
            preferWebRtc: true,
            prioritizeSnapshot: true,
            onLiveReady: (_engine, handoff) => {
              if (handoff?.take) {
                pageEntry.liveHandoffs.set(entity, handoff);
              }
            },
          });
        } else {
          cell.classList.add("empty");
        }
        cell.dataset.gridCamidx = String(
          cam?.logical_camera_index ?? idx,
        );
        cell.dataset.gridEntity = entity;
        const label = createGridLabelElement(this._buildLabelText(cam));
        cell.appendChild(label);
      } else {
        cell.classList.add("empty");
      }
      if (cell.classList.contains("empty")) {
        renderGridEmptyPlaceholder(cell, this._liveIconSvg);
      }
    }
    this._activateGridPage(session, pageKey);
    this._host._setActiveStreamType("grid");
    this._host._syncSnapshotRefreshTimer?.();
  }

  teardownGridEngine({ slot = null, keepSlotVisible = false } = {}) {
    const gridSlot =
      slot || this._host.shadowRoot?.querySelector?.("#grid-engine") || null;
    const gridEngine = this._host._gridEngine;
    this._host._gridEngine = null;
    try {
      gridEngine?.destroy?.();
    } catch (_) {}
    if (!gridSlot) return;
    if (!keepSlotVisible) this._setGridPresentation(gridSlot, false);
    gridSlot.innerHTML = "";
  }
}
