import {
  hasCameraPtz,
  hasPtzPanTiltCapability,
  isPtzHomePreset,
  normalizePtzPresetNames,
} from "./index.js";
import {
  buildControlsSectionMarkup,
  syncControlsPadLabels,
} from "./controls.tmpl.js";

export const syncPtzControlsLabels = (host) =>
  syncControlsPadLabels(host._$("#controls-pad"), host._localization.t);

export const renderPtzControls = (host, list) => {
  void host._ptzCapabilityController.ensureActiveInfo();
  host._renderListLabel();
  const ptzInfo = host._ptzCapabilityController.activeInfo();
  const ptzConfigured = hasCameraPtz(host._activeCam);
  const presetItems = ptzConfigured
    ? normalizePtzPresetNames(ptzInfo).map((name) => ({
        name,
        isHome: isPtzHomePreset(name),
      }))
    : [];
  host._setListHtmlIfChanged(
    list,
    buildControlsSectionMarkup({
      panTiltEnabled: ptzConfigured && hasPtzPanTiltCapability(ptzInfo),
      zoomEnabled: ptzConfigured,
      presetItems,
      t: host._localization.t,
    }),
  );
  syncPtzControlsLabels(host);
};
