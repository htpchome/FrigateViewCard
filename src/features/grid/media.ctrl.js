import {
  buildHaCameraStreamState,
  createHaCameraStreamElement,
} from "../../integrations/home-assistant/playback.js";
import { appendCacheBustParam } from "../live/fallbacks/fallback-url.js";
import {
  applyGridCellSeverityClass,
  buildGridSignaturePart,
  createGridCellElement,
  createGridLabelElement,
  createGridRootElement,
  renderGridEmptyPlaceholder,
} from "./page.tmpl.js";

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
    const total = this._host._config?.cameras?.length || 0;
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

  _mountGridSnapshotCell(cell, { entity, stateObj }) {
    if (!cell || !entity) return false;
    const img = document.createElement("img");
    const entityPicture = stateObj?.attributes?.entity_picture || "";
    img.alt = `${entity} snapshot`;
    img.loading = "lazy";
    img.decoding = "async";
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
    return true;
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
      ".preview-media-host[data-preview-use-live='0'], .live-grid-cell[data-grid-use-live='0']",
    );
    if (!hosts?.length) return;

    await Promise.all(
      Array.from(hosts).map(async (host) => {
        const img = host.querySelector?.("img");
        if (!img || !img.isConnected) return;
        const entity =
          host.dataset.previewMediaEntity || host.dataset.gridEntity || "";
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

  _mountGridDirectMseCell(cell, entity, gridState, options = {}) {
    const host = document.createElement("div");
    host.style.cssText = "width:100%;height:100%;display:block";
    cell.appendChild(host);
    void (async () => {
      const result = await this._host._go2rtcMounter.tryMountMse(
        host,
        {
          waitMs: 4000,
          minCurrentTime: 0.05,
          minDecodedFrames: 1,
          requireReadyState: 2,
          strict: true,
        },
        {
          commit: false,
          entity,
          muted: true,
        },
      );
      if (!result?.ok) {
        if (host.isConnected) {
          host.remove();
          if (!gridState.destroyed && options.fallbackOnFailure) {
            this._mountGridSnapshotCell(cell, {
              entity,
              stateObj: options.stateObj || null,
            });
          }
        }
        return;
      }
      if (gridState.destroyed || !host.isConnected) {
        try {
          result.engine?.destroy?.();
        } catch (_) {}
        return;
      }
      gridState.cleanup.push(() => {
        try {
          result.engine?.destroy?.();
        } catch (_) {}
        try {
          host.innerHTML = "";
        } catch (_) {}
      });
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
    },
  ) {
    if (!cell || !entity) return false;
    if (stateObj && useLive) {
      if (
        liveStreamHint === "mse" &&
        this._host._shouldUseGo2RtcForEntity(entity)
      ) {
        this._mountGridDirectMseCell(cell, entity, gridState, {
          fallbackOnFailure: fallbackOnLiveError,
          stateObj,
        });
      } else {
        const stream = createHaCameraStreamElement({
          hass: this._host._hass,
          stateObj,
          controls: false,
          muted: true,
          defaultMuted: true,
          styleText:
            "width:100%;height:100%;display:block;background:var(--c-bg-deep)",
        });
        if (!stream) return false;
        cell.appendChild(stream);
        this._host._attachVideoFit(stream);
      }
      return true;
    }
    return this._mountGridSnapshotCell(cell, { entity, stateObj });
  }

  mountCameraCellMedia(cell, options = {}) {
    return this._mountGridCameraCellMedia(cell, options);
  }

  mountGridEngine(slot) {
    const indices = this.pageCameraIndices();
    const liveStreamHint = this._host._currentLiveStreamHint();
    const gridState = { destroyed: false, cleanup: [] };
    const signatureParts = [];

    for (const idx of indices) {
      const cam = idx >= 0 ? this._host._config?.cameras?.[idx] : null;
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
    }

    const nextSignature = signatureParts.join("|");
    const hasExistingGrid =
      slot.firstElementChild?.classList?.contains("live-grid");
    if (
      hasExistingGrid &&
      this._host._gridLastRenderSignature === nextSignature
    ) {
      this._host._setActiveStreamType("grid");
      this._host._setStreamLoading(false);
      this._host._setStreamFallbackVisible(false);
      this._host._syncSnapshotRefreshTimer?.();
      return;
    }

    this._host._gridLastRenderSignature = nextSignature;
    slot.innerHTML = "";
    const grid = createGridRootElement();
    for (const idx of indices) {
      const cell = createGridCellElement();
      if (idx >= 0) {
        const cam = this._host._config?.cameras?.[idx];
        const entity = cam?.entity || "";
        const stateObj = entity
          ? buildHaCameraStreamState(
              this._host._hass,
              entity,
              liveStreamHint,
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
          });
        } else {
          cell.classList.add("empty");
        }
        cell.dataset.gridCamidx = String(idx);
        cell.dataset.gridEntity = entity;
        const label = createGridLabelElement(this._buildLabelText(cam));
        cell.appendChild(label);
      } else {
        cell.classList.add("empty");
      }
      if (cell.classList.contains("empty")) {
        renderGridEmptyPlaceholder(cell, this._liveIconSvg);
      }
      grid.appendChild(cell);
    }
    slot.appendChild(grid);
    this._host._engine = {
      destroy: () => {
        gridState.destroyed = true;
        slot.querySelectorAll("img[data-fvc-blob-url]").forEach((img) => {
          const blobUrl = img.dataset.fvcBlobUrl || "";
          if (!blobUrl) return;
          try {
            URL.revokeObjectURL(blobUrl);
          } catch (_) {}
        });
        for (const cleanup of gridState.cleanup) {
          try {
            cleanup();
          } catch (_) {}
        }
        try {
          slot.innerHTML = "";
        } catch (_) {}
      },
    };
    this._host._setActiveStreamType("grid");
    this._host._setStreamLoading(false);
    this._host._setStreamFallbackVisible(false);
    this._host._syncSnapshotRefreshTimer?.();
  }
}
