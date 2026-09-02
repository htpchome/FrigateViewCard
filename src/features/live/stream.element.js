export const LIVE_STREAM_HOST_TAG = "frigate-live-stream";

export class FrigateLiveStreamElement extends HTMLElement {
  constructor() {
    super();
    this._orchestrator = null;
  }

  attachOrchestrator(orchestrator) {
    if (this._orchestrator && this._orchestrator !== orchestrator) {
      void this._orchestrator.stop().catch(() => {});
    }
    this._orchestrator = orchestrator || null;
  }

  clearOrchestrator(orchestrator = null) {
    if (!orchestrator || this._orchestrator === orchestrator) {
      this._orchestrator = null;
    }
  }

  disconnectedCallback() {
    if (!this._orchestrator) return;
    void this._orchestrator.stop().catch(() => {});
    this._orchestrator = null;
  }
}

export const registerLiveStreamHostElement = () => {
  if (!customElements.get(LIVE_STREAM_HOST_TAG)) {
    customElements.define(LIVE_STREAM_HOST_TAG, FrigateLiveStreamElement);
  }
};
