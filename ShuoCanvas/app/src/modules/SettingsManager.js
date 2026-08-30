import { applyGridDotsPref, applyGridDotsPrefFromStorage, initAppearanceSettings, readGridDotsPref, setGridDotsPref } from "./settings/appearanceSettings.js";
import { initCanvasAlignmentSettings } from "./settings/canvasAlignmentSettings.js";
import { initCanvasControlSettings } from "./settings/canvasControlSettings.js";
import { applyImageVideoNodeResizePref, initNodeBehaviorSettings } from "./settings/nodeBehaviorSettings.js";
import { initSettingsPanelEvents } from "./settings/panelSettings.js";
import { initApiSettings } from "./settings/apiSettings.js";
import { initFileSaveSettings } from "./settings/fileSaveSettings.js";
import { initLocalAssetCleanupSettings } from "./settings/localAssetCleanupSettings.js";
import { initDiagnosticsSettings } from "./settings/diagnosticsSettings.js";
import { initImageInputUploadQualitySettings } from "./settings/imageInputUploadQualitySettings.js";
import { initCompletionSoundSettings } from "./settings/completionSoundSettings.js";
import { initObjectStorageSettings } from "./settings/objectStorageSettings.js";
import { initNodeManagerSettings } from "./settings/nodeManagerSettings.js";
const SettingsManager = {
  init(_0x56ddf7 = {}) {
    initSettingsPanelEvents();
    initAppearanceSettings({
      uiStore: _0x56ddf7.uiStore,
      getCanvasPresentationContext: _0x56ddf7.getCanvasPresentationContext
    });
    initNodeManagerSettings({
      uiStore: _0x56ddf7.uiStore
    });
    initCanvasAlignmentSettings();
    initCanvasControlSettings();
    initNodeBehaviorSettings();
    initImageInputUploadQualitySettings();
    initCompletionSoundSettings();
    initObjectStorageSettings();
    initApiSettings();
    initFileSaveSettings();
    initLocalAssetCleanupSettings();
    initDiagnosticsSettings({
      graphStore: _0x56ddf7.graphStore
    });
  },
  applyGridDotsPref: applyGridDotsPref,
  applyGridDotsPrefFromStorage: applyGridDotsPrefFromStorage,
  readGridDotsPref: readGridDotsPref,
  setGridDotsPref: setGridDotsPref,
  applyImageVideoNodeResizePref: applyImageVideoNodeResizePref
};
export default SettingsManager;
export { SettingsManager };