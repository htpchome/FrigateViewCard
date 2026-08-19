import {
  buildHomeAssistantCameraStreamRequest,
  buildHomeAssistantMediaRequest,
  resolveHomeAssistantMediaPlayers,
  resolveHomeAssistantReceiverUrl,
} from "../../integrations/home-assistant/receiver-playback.js";

export const PLAYBACK_TARGET_CAST = "cast";
export const PLAYBACK_TARGET_AIRPLAY = "airplay";

const escapeMarkup = (value) =>
  String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

export function buildPlaybackTargetListMarkup(players = []) {
  if (!players.length) {
    return '<p class="playback-target-empty">No available Home Assistant media players were found.</p>';
  }
  return players
    .map(
      (player) =>
        `<button class="playback-target-option" type="button" data-playback-target-entity="${escapeMarkup(player.entityId)}"><span class="playback-target-option-name">${escapeMarkup(player.name)}</span><span class="playback-target-option-state">${escapeMarkup(player.state)}</span></button>`,
    )
    .join("");
}

export class PlaybackTargetController {
  constructor({
    getDialog,
    getStates,
    getPlaybackContext,
    resolveMediaPath,
    signPath,
    getBaseUrl,
    callService,
  } = {}) {
    this._getDialog = getDialog;
    this._getStates = getStates;
    this._getPlaybackContext = getPlaybackContext;
    this._resolveMediaPath = resolveMediaPath;
    this._signPath = signPath;
    this._getBaseUrl = getBaseUrl;
    this._callService = callService;
    this._request = null;
    this._closeTimer = null;
  }

  open({ target = PLAYBACK_TARGET_CAST, scope = "live" } = {}) {
    const dialog = this._getDialog?.();
    if (!dialog) return false;
    this._request = { target, scope };
    if (this._closeTimer) clearTimeout(this._closeTimer);
    this._closeTimer = null;

    const isAirPlay = target === PLAYBACK_TARGET_AIRPLAY;
    const title = dialog.querySelector("[data-playback-target-title]");
    const description = dialog.querySelector(
      "[data-playback-target-description]",
    );
    const list = dialog.querySelector("[data-playback-target-list]");
    const status = dialog.querySelector("[data-playback-target-status]");
    if (title) {
      title.textContent = isAirPlay
        ? "AirPlay through Home Assistant"
        : "Cast through Home Assistant";
    }
    if (description) {
      description.textContent =
        scope === "live"
          ? "Choose a media player for a separate Home Assistant HLS stream."
          : "Choose a media player for the MP4 video.";
    }
    if (list) {
      list.innerHTML = buildPlaybackTargetListMarkup(
        resolveHomeAssistantMediaPlayers(this._getStates?.() || {}),
      );
    }
    if (status) {
      status.textContent = "";
      status.hidden = true;
    }
    dialog.hidden = false;
    dialog.querySelector("[data-playback-target-entity]")?.focus?.();
    return true;
  }

  close() {
    const dialog = this._getDialog?.();
    if (dialog) dialog.hidden = true;
    this._request = null;
    if (this._closeTimer) clearTimeout(this._closeTimer);
    this._closeTimer = null;
  }

  dispose() {
    this.close();
  }

  handleClickTarget(target) {
    const dialog = this._getDialog?.();
    if (!dialog || dialog.hidden || !target?.closest) return false;
    if (!target.closest("#playback-target-dialog")) return false;
    if (target.closest("[data-playback-target-close]")) {
      this.close();
      return true;
    }
    const option = target.closest("[data-playback-target-entity]");
    if (option) {
      void this._send(option.dataset.playbackTargetEntity);
      return true;
    }
    return true;
  }

  async _send(mediaPlayerEntity) {
    const dialog = this._getDialog?.();
    const requestState = this._request;
    if (!dialog || !requestState || !mediaPlayerEntity) return false;
    const status = dialog.querySelector("[data-playback-target-status]");
    const options = dialog.querySelectorAll("[data-playback-target-entity]");
    options.forEach((option) => {
      option.disabled = true;
    });
    if (status) {
      status.hidden = false;
      status.textContent = "Sending...";
    }

    try {
      const context = this._getPlaybackContext?.(requestState.scope) || {};
      let serviceRequest = null;
      if (requestState.scope === "live") {
        serviceRequest = buildHomeAssistantCameraStreamRequest({
          cameraEntity: context.cameraEntity,
          mediaPlayerEntity,
        });
        if (!serviceRequest) {
          throw new Error("The active Home Assistant camera is not available.");
        }
      } else {
        const media = this._resolveMediaPath?.(context);
        if (!media?.ok) {
          throw new Error(media?.message || "This video cannot be sent.");
        }
        const signedPath = await this._signPath?.(media.path);
        const mediaUrl = resolveHomeAssistantReceiverUrl(
          signedPath || media.path,
          this._getBaseUrl?.() || "",
        );
        serviceRequest = buildHomeAssistantMediaRequest({
          mediaPlayerEntity,
          mediaUrl,
          contentType: media.contentType,
        });
      }
      if (!serviceRequest || typeof this._callService !== "function") {
        throw new Error("Home Assistant playback is not available.");
      }
      await this._callService(
        serviceRequest.domain,
        serviceRequest.service,
        serviceRequest.serviceData,
        serviceRequest.target,
      );
      const player = resolveHomeAssistantMediaPlayers(
        this._getStates?.() || {},
      ).find((candidate) => candidate.entityId === mediaPlayerEntity);
      if (status) status.textContent = `Sent to ${player?.name || mediaPlayerEntity}.`;
      this._closeTimer = setTimeout(() => this.close(), 900);
      return true;
    } catch (error) {
      if (status) {
        status.textContent =
          error?.message || "Home Assistant could not start playback.";
      }
      options.forEach((option) => {
        option.disabled = false;
      });
      return false;
    }
  }
}
