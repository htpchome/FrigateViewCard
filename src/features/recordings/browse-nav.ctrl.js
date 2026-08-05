import {
  buildPreparedRecordingsDayResult,
  buildRecordingsDayCacheKey,
  resolvePreparedRecordingsDayTransition,
  resolveCachedRecordingsAvailability,
  resolveFailedRecordingsAvailabilityState,
  resolveFetchedRecordingsAvailabilityState,
} from "./utils/availability.js";
import {
  resolveRecordingsBrowseNavProbePlan,
  resolveRecordingsBrowseNavState,
} from "./utils/browse-nav.js";
import { resolvePreparedRecordingsDayNavigationState } from "./utils/swipe.js";

export class RecordingsBrowseNavController {
  constructor(host) {
    this._host = host;
  }

  async hasRecordingsInBounds(bounds, clientId, cam) {
    const key = buildRecordingsDayCacheKey(clientId, cam, bounds);
    const cached = resolveCachedRecordingsAvailability({
      key,
      dataCache: this._host._recordingsDayDataCache,
      availabilityCache: this._host._recordingsDayAvailabilityCache,
    });
    if (cached.found) {
      if (cached.shouldSyncAvailability) {
        this._host._recordingsDayAvailabilityCache.set(
          key,
          cached.hasRecordings,
        );
      }
      return cached.hasRecordings;
    }
    try {
      const recordings = await this._host._ws({
        type: "frigate/recordings/get",
        instance_id: clientId,
        camera: cam,
        after: Math.max(0, bounds.start),
        before: bounds.end,
      });
      const fetched = resolveFetchedRecordingsAvailabilityState(recordings);
      this._host._recordingsDayDataCache.set(key, fetched.recordings);
      this._host._recordingsDayAvailabilityCache.set(
        key,
        fetched.availabilityValue,
      );
      return fetched.hasRecordings;
    } catch (_) {
      const failed = resolveFailedRecordingsAvailabilityState();
      this._host._recordingsDayAvailabilityCache.set(
        key,
        failed.availabilityValue,
      );
      return failed.hasRecordings;
    }
  }

  async prepareDayTransition(direction) {
    const bounds = this._host._recordingsOffsetDayBounds(direction);
    const today = this._host._recordingsDayBounds(
      Math.floor(Date.now() / 1000),
    );
    const { clientId, cam } = this._host._cc();
    const prepared = resolvePreparedRecordingsDayTransition({
      direction,
      bounds,
      todayBounds: today,
      clientId,
      camera: cam,
      dataCache: this._host._recordingsDayDataCache,
    });
    if (prepared.done) {
      return prepared.result;
    }

    const key = prepared.key;
    const hasData = await this.hasRecordingsInBounds(bounds, clientId, cam);
    if (!hasData) {
      return { hasData: false, bounds, recs: [] };
    }
    const recordings = await this._host._ws({
      type: "frigate/recordings/get",
      instance_id: clientId,
      camera: cam,
      after: Math.max(0, bounds.start),
      before: bounds.end,
    });
    const result = buildPreparedRecordingsDayResult(bounds, recordings);
    this._host._recordingsDayDataCache.set(key, result.recs);
    this._host._recordingsDayAvailabilityCache.set(key, result.hasData);
    return result;
  }

  async navigateDayAnimated(direction) {
    if (this._host._tab !== "recordings") return false;
    const dir = Number(direction);
    if (dir !== -1 && dir !== 1) return false;
    if (this._host._recordingsDayNavAnimating) return false;

    this._host._recordingsDayNavAnimating = true;
    try {
      const prep = await this.prepareDayTransition(dir);
      const navigation = resolvePreparedRecordingsDayNavigationState({
        prep,
        renderRecordings: (recordings) =>
          this._host._recordingsListMarkup(
            this._host._recordingsViewRows(recordings),
          ),
      });
      if (navigation.shouldBounce) {
        this._host._bounceRecordingsArea(dir);
        void this.updateBrowseNav();
        return false;
      }

      const stage = this._host._createRecordingsSwipeStage(
        dir,
        navigation.incomingHtml,
      );
      if (!stage) {
        await this._host._commitRecordingsDayTransition(
          navigation.bounds,
          navigation.recs,
        );
        return true;
      }

      await new Promise((resolve) => requestAnimationFrame(resolve));
      await new Promise((resolve) => requestAnimationFrame(resolve));

      await this._host._animateRecordingsSwipeStageTo(
        stage,
        -dir * stage.width,
        320,
        "cubic-bezier(0.28, 0.02, 0.18, 1)",
      );
      await this._host._commitRecordingsDayTransition(
        navigation.bounds,
        navigation.recs,
      );
      return true;
    } finally {
      this._host._recordingsDayNavAnimating = false;
    }
  }

  async updateBrowseNav() {
    if (this._host._tab !== "recordings") return;
    const prev = this._host._$("#rec-day-prev");
    const next = this._host._$("#rec-day-next");
    if (!prev || !next) return;

    const { clientId, cam } = this._host._cc();
    const current = this._host._recordingsDayBounds();
    const today = this._host._recordingsDayBounds(
      Math.floor(Date.now() / 1000),
    );
    const probePlan = resolveRecordingsBrowseNavProbePlan({
      clientId,
      camera: cam,
      currentBounds: current,
      todayBounds: today,
      prevBounds: this._host._recordingsOffsetDayBounds(-1),
      nextBounds: this._host._recordingsOffsetDayBounds(1),
    });
    if (!probePlan.hasContext) {
      prev.disabled = probePlan.initialState.prevDisabled;
      next.disabled = probePlan.initialState.nextDisabled;
      return;
    }

    const token = ++this._host._recordingsNavUpdateToken;
    prev.disabled = true;
    next.disabled = true;
    const hasPrev = await this.hasRecordingsInBounds(
      probePlan.prevProbeBounds,
      clientId,
      cam,
    );
    if (token !== this._host._recordingsNavUpdateToken) return;

    let hasNext = false;
    if (probePlan.nextProbeBounds) {
      hasNext = await this.hasRecordingsInBounds(
        probePlan.nextProbeBounds,
        clientId,
        cam,
      );
      if (token !== this._host._recordingsNavUpdateToken) return;
    }

    const resolvedNavState = resolveRecordingsBrowseNavState({
      currentBounds: current,
      todayBounds: today,
      hasPrev,
      hasNext,
    });
    prev.disabled = resolvedNavState.prevDisabled;
    next.disabled = resolvedNavState.nextDisabled;
  }
}
