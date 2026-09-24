import { setLocalizedText } from "../localization/localized-dom.js";
import { normalizePageRoute, PAGE_IDS } from "../navigation/router.js";
import { shouldRenderTwoWayTalkButton } from "./index.js";
import {
  startGo2RtcTwoWayTalkSession,
  startHaDirectTwoWayTalkSession,
} from "./session.js";

export class TwoWayTalkSessionController {
  constructor(host) {
    this._host = host;
  }

  shouldRenderButtonForActiveCamera() {
    const host = this._host;
    if (host._viewMode === "grid") return false;
    if (
      host._activeGroupMemberOverride &&
      host._activeGroupMemberOverride !== host._activeCam?.entity
    ) {
      return false;
    }
    return shouldRenderTwoWayTalkButton({
      camera: host._activeCam,
      pageId: normalizePageRoute(host._pageId),
      PAGE_IDS,
      activeStreamType: host._activeStreamType,
    });
  }

  activeCameraEnabled() {
    const host = this._host;
    return (
      (!host._activeGroupMemberOverride ||
        host._activeGroupMemberOverride === host._activeCam?.entity) &&
      host._activeCam?.two_way_talk === true
    );
  }

  activeForCurrentCamera() {
    const host = this._host;
    return (
      !!host._twoWayTalkSession &&
      host._twoWayTalkEntity === String(host._activeCam?.entity || "").trim()
    );
  }

  microphoneMutedForCurrentCamera() {
    const host = this._host;
    return (
      host._twoWayTalkActiveForCurrentCamera() &&
      host._twoWayTalkSession?.microphoneMuted === true
    );
  }

  syncRuntimeState() {
    const host = this._host;
    if (!host._twoWayTalkSession && host._twoWayTalkStarting !== true) return;
    if (
      !host._shouldRenderTwoWayTalkButtonForActiveCamera() ||
      !host._activeCameraTwoWayTalkEnabled()
    ) {
      void host._stopTwoWayTalkSession();
    }
  }

  async toggleSession() {
    const host = this._host;
    if (host._twoWayTalkStarting) {
      host._cancelTwoWayTalkStart();
      return;
    }
    if (host._twoWayTalkActiveForCurrentCamera()) {
      await host._stopTwoWayTalkSession();
      return;
    }
    await host._startTwoWayTalkSession();
  }

  toggleMicrophoneMute() {
    const host = this._host;
    if (!host._twoWayTalkActiveForCurrentCamera()) return;
    const nextMuted = !host._twoWayTalkMicrophoneMutedForCurrentCamera();
    host._twoWayTalkSession?.setMicrophoneMuted?.(nextMuted);
    host._syncTwoWayTalkButton();
  }

  setLiveAudioActive(active) {
    this._host._applyLiveMuteChange(!active, { source: "two-way-talk" });
  }

  clearResultBubble() {
    const host = this._host;
    if (host._twoWayTalkResultTimer) {
      clearTimeout(host._twoWayTalkResultTimer);
      host._twoWayTalkResultTimer = null;
    }
    host._twoWayTalkResultBubble?.remove?.();
    host._twoWayTalkResultBubble = null;
  }

  showResultBubble(success) {
    const host = this._host;
    const surface = host._$("#live-stage");
    if (!surface) return;
    host._clearTwoWayTalkResultBubble();
    const bubble = document.createElement("div");
    bubble.className = `two-way-talk-result-bubble ${
      success ? "success" : "failure"
    }`;
    const key = success
      ? "runtime.twoWayTalk.connected"
      : "runtime.twoWayTalk.failed";
    const fallback = success
      ? "Two-way talk connected"
      : "Two-way talk failed to connect";
    setLocalizedText(bubble, key, host._localization?.t || (() => fallback));
    surface.appendChild(bubble);
    host._twoWayTalkResultBubble = bubble;
    host._twoWayTalkResultTimer = setTimeout(() => {
      if (host._twoWayTalkResultBubble === bubble) {
        bubble.remove?.();
        host._twoWayTalkResultBubble = null;
      }
      host._twoWayTalkResultTimer = null;
    }, success ? 2200 : 3600);
  }

  cancelStart({ syncButton = true } = {}) {
    const host = this._host;
    const abortController = host._twoWayTalkStartAbortController;
    if (host._twoWayTalkStarting !== true && !abortController) return false;

    host._twoWayTalkStartSeq =
      (Number(host._twoWayTalkStartSeq) || 0) + 1;
    host._twoWayTalkStartAbortController = null;
    host._twoWayTalkStarting = false;
    try {
      abortController?.abort?.();
    } catch (_) {}
    if (syncButton) host._syncTwoWayTalkButton();
    return true;
  }

  async startSession() {
    const host = this._host;
    if (!window.isSecureContext) {
      host._showTwoWayTalkResultBubble(false);
      return;
    }
    const entity = String(host._activeCam?.entity || "").trim();
    if (!entity || !host._activeCameraTwoWayTalkEnabled()) return;
    const useGo2Rtc = host._shouldUseGo2RtcForEntity(entity);
    await host._stopTwoWayTalkSession({ restoreLive: false });
    if (
      String(host._activeCam?.entity || "").trim() !== entity ||
      !host._activeCameraTwoWayTalkEnabled() ||
      host._shouldUseGo2RtcForEntity(entity) !== useGo2Rtc
    ) {
      return;
    }

    const abortController = new AbortController();
    const startSeq = (Number(host._twoWayTalkStartSeq) || 0) + 1;
    const isCurrentStart = () => host._twoWayTalkStartSeq === startSeq;
    let endedDuringStart = false;
    host._twoWayTalkStartSeq = startSeq;
    host._twoWayTalkStartAbortController = abortController;
    host._twoWayTalkStarting = true;
    host._syncTwoWayTalkButton();
    try {
      const handleEnded = () => {
        endedDuringStart = true;
        if (host._twoWayTalkEntity !== entity) return;
        host._twoWayTalkSoundwaveController?.stop();
        host._twoWayTalkSession = null;
        host._twoWayTalkEntity = "";
        host._setTwoWayTalkLiveAudioActive(false);
        host._syncTwoWayTalkButton();
      };
      const mountMicrophoneStream = async ({
        localStream,
        onEnded,
        abortSignal,
      }) => {
        const activeEntity = String(host._activeCam?.entity || "").trim();
        if (
          abortSignal?.aborted ||
          activeEntity !== entity ||
          host._shouldUseGo2RtcForEntity(entity) !== useGo2Rtc
        ) {
          return null;
        }
        if (useGo2Rtc) {
          return await host._go2rtcTwoWayTalkBackchannel.connect({
            entity,
            microphoneStream: localStream,
            onEnded,
            abortSignal,
          });
        }
        return await host._haDirectTwoWayTalkBackchannel.connect({
          entity,
          microphoneStream: localStream,
          onEnded,
          abortSignal,
        });
      };
      const session = useGo2Rtc
        ? await startGo2RtcTwoWayTalkSession({
            mountMicrophoneStream,
            onEnded: handleEnded,
            abortSignal: abortController.signal,
          })
        : await startHaDirectTwoWayTalkSession({
            mountMicrophoneStream,
            onEnded: handleEnded,
            abortSignal: abortController.signal,
          });
      if (abortController.signal.aborted || !isCurrentStart()) {
        await session.stop?.();
        return;
      }
      if (
        endedDuringStart ||
        String(host._activeCam?.entity || "").trim() !== entity
      ) {
        await session.stop?.();
        throw new Error("Two-way talk context changed during startup");
      }
      host._twoWayTalkSession = session;
      host._twoWayTalkEntity = entity;
      host._setTwoWayTalkLiveAudioActive(true);
      host._twoWayTalkSoundwaveController?.startAfterPaint(session);
      host._showTwoWayTalkResultBubble(true);
    } catch (error) {
      if (
        abortController.signal.aborted ||
        !isCurrentStart() ||
        error?.name === "AbortError"
      ) {
        return;
      }
      console.warn("[Frigate] Two-way talk start failed", error);
      host._showTwoWayTalkResultBubble(false);
      if (!useGo2Rtc) {
        host._toast(
          "Home Assistant WebRTC could not establish two-way talk. Verify that the camera stream has a working audio backchannel.",
          { localizationKey: "runtime.twoWayTalk.haConnectionFailed" },
        );
      }
      host._twoWayTalkSoundwaveController?.stop();
      host._twoWayTalkSession = null;
      host._twoWayTalkEntity = "";
      host._setTwoWayTalkLiveAudioActive(false);
    } finally {
      if (isCurrentStart()) {
        host._twoWayTalkStartAbortController = null;
        host._twoWayTalkStarting = false;
        host._syncTwoWayTalkButton();
      }
    }
  }

  async stopSession({ restoreLive = true } = {}) {
    const host = this._host;
    host._cancelTwoWayTalkStart?.({ syncButton: false });
    const session = host._twoWayTalkSession;
    const sessionEntity = host._twoWayTalkEntity;
    const restoreReplacedLive = session?.restoreLiveOnStop !== false;
    host._twoWayTalkSoundwaveController?.stop();
    host._twoWayTalkSession = null;
    host._twoWayTalkEntity = "";
    host._setTwoWayTalkLiveAudioActive(false);
    host._syncTwoWayTalkSoundwaveSurface?.();
    if (!session) {
      host._syncTwoWayTalkButton();
      return;
    }
    try {
      await session.stop?.();
    } catch (error) {
      console.warn("[Frigate] Two-way talk stop failed", error);
    }
    if (
      restoreLive &&
      restoreReplacedLive &&
      sessionEntity &&
      String(host._activeCam?.entity || "").trim() === sessionEntity &&
      host._viewMode !== "grid" &&
      !host._isPreviewPageActive()
    ) {
      try {
        await host._mountEngine();
      } catch (error) {
        console.warn(
          "[Frigate] Unable to restore live view after two-way talk",
          error,
        );
      }
    }
    host._syncTwoWayTalkButton();
  }
}

export const getTwoWayTalkSessionController = (host) => {
  if (host._twoWayTalkSessionController) {
    return host._twoWayTalkSessionController;
  }
  const controller = new TwoWayTalkSessionController(host);
  host._twoWayTalkSessionController = controller;
  return controller;
};
