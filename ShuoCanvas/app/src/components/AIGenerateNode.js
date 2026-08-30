import a295_0x554484 from "../core/stores/appStore.js";
import { getDisplayModelName } from "../modules/providers.js";
import { _handlePillHover, _handlePillOut, _syncEdgesOrderFromPills, _syncPillLabels, _checkAtTrigger, _populateMentionMenu, _insertMentionPill, _handlePillKeyboard, _rehydratePromptPills, _handleMentionMenuKeyboard } from "../modules/nodePromptShared.js";
import { TEXT_TOOLBAR_HTML, bindTextToolbarEvents, IMAGE_TOOLBAR_HTML, bindImageToolbarEvents, showDevToast } from "./NodeToolbarConfig.js";
import { getImage } from "../modules/storage.js";
import { openNodeImagePreview } from "../modules/imagePreview.js";
import { getPromptPresets, openCustomPresetsManager } from "../modules/promptPresets.js";
import { startLoading, stopLoading } from "../modules/loadingOverlay.js";
import { bindRefThumbHoverPreview } from "../modules/refThumbHoverPreview.js";
import { ensureThumbDecoded, revealRefThumbMedia } from "../modules/refThumbMediaReveal.js";
import { getRefKindByNodeType } from "../modules/nodeMeta.js";
import { uploadFile } from "../modules/project.js";
import { ensureConfig, getProviderConfig } from "../../api/configApi.js";
import { buildGenerateImageRequest, cancelRunningHubImageTask, generateImage, resumeAsyncImageTask, resumeDreaminaImageTask, resumeRunningHubImageTask } from "../../api/aiImageApi.js";
import { fetchDreaminaCliStatusFromServer, getCachedDreaminaCliStatus } from "../../api/dreaminaCliApi.js";
import { generateId } from "../core/math.js";
import { checkSlashTrigger, handleSlashKeyboardNavigation, closeSlashMenu } from "../modules/slashMenu.js";
import { activateMenuKeyboard } from "../modules/floatingMenuKeyboard.js";
import a295_0x192fbe from "../modules/ImageFreeAngleController.js";
import { createAIGenerateNodeUiModule } from "./aigenImage/uiModule.js";
import { hasAIGenMaskPreviewBaseImage } from "./aigenImage/maskPreviewPolicy.js";
import { createAIGenerateNodeStateSyncModule } from "./aigenImage/stateSyncModule.js";
import { createAIGenerateNodeSelectionStateModule } from "./aigenImage/selectionStateModule.js";
import { createAIGenerateNodeTaskOrchestrationModule } from "./aigenImage/taskOrchestrationModule.js";
import { shouldDeferRendererMediaOnMount } from "../core/rendererDeferredMedia.js";
const api = {
  buildGenerateImageRequest: buildGenerateImageRequest,
  cancelRunningHubWorkflowTask: cancelRunningHubImageTask,
  fetchDreaminaCliStatusFromServer: fetchDreaminaCliStatusFromServer,
  getCachedDreaminaCliStatus: getCachedDreaminaCliStatus,
  generateImage: generateImage,
  resumeAsyncImageTask: resumeAsyncImageTask,
  resumeDreaminaImageTask: resumeDreaminaImageTask,
  resumeRunningHubImageTask: resumeRunningHubImageTask
};
const AI_GENERATE_NODE_MODULE_DEPS = {
  store: a295_0x554484,
  api: api,
  getDisplayModelName: getDisplayModelName,
  _handlePillHover: _handlePillHover,
  _handlePillOut: _handlePillOut,
  _syncEdgesOrderFromPills: _syncEdgesOrderFromPills,
  _syncPillLabels: _syncPillLabels,
  _checkAtTrigger: _checkAtTrigger,
  _populateMentionMenu: _populateMentionMenu,
  _insertMentionPill: _insertMentionPill,
  _handlePillKeyboard: _handlePillKeyboard,
  _rehydratePromptPills: _rehydratePromptPills,
  _handleMentionMenuKeyboard: _handleMentionMenuKeyboard,
  TEXT_TOOLBAR_HTML: TEXT_TOOLBAR_HTML,
  bindTextToolbarEvents: bindTextToolbarEvents,
  IMAGE_TOOLBAR_HTML: IMAGE_TOOLBAR_HTML,
  bindImageToolbarEvents: bindImageToolbarEvents,
  showDevToast: showDevToast,
  getImage: getImage,
  openNodeImagePreview: openNodeImagePreview,
  getPromptPresets: getPromptPresets,
  openCustomPresetsManager: openCustomPresetsManager,
  startLoading: startLoading,
  stopLoading: stopLoading,
  bindRefThumbHoverPreview: bindRefThumbHoverPreview,
  ensureThumbDecoded: ensureThumbDecoded,
  revealRefThumbMedia: revealRefThumbMedia,
  getRefKindByNodeType: getRefKindByNodeType,
  uploadFile: uploadFile,
  ensureConfig: ensureConfig,
  getProviderConfig: getProviderConfig,
  generateId: generateId,
  checkSlashTrigger: checkSlashTrigger,
  handleSlashKeyboardNavigation: handleSlashKeyboardNavigation,
  closeSlashMenu: closeSlashMenu,
  activateMenuKeyboard: activateMenuKeyboard,
  ImageFreeAngleController: a295_0x192fbe
};
export class AIGenerateNode {
  constructor(_0x32efa4) {
    this._data = _0x32efa4;
    this.nodeId = _0x32efa4.id;
    this.previewEl = null;
    this.imgEl = null;
    this.refBarEl = null;
    this.promptEl = null;
    this.btnEl = null;
    this._dragSrcIdx = null;
    this._dragBounds = [];
    this._cachedThumbUrl = null;
    this._currentThumbId = null;
    this._cachedSourceUrl = null;
    this._currentSourceId = null;
    this._currentLocalPath = null;
    this._thumbObjectUrls = new Map();
    this._refThumbObjectUrls = new Map();
    this._activeRefThumbIds = new Set();
    this._imageObjectUrlLifecycleEpoch = 0;
    this._imageObjectUrlsDisposed = false;
    this._currentMaskPreview = null;
    this._suppressedEmptyMaskPreview = null;
    this._resolvedUrlsKey = null;
    this._resolvedMainUrls = null;
    this._resolvedAuxUrls = null;
    this._lastImagesKeyStr = null;
    this._imageDisplayLoadToken = 0;
    this._lastMainIdx = null;
    this._lastIsExpanded = null;
    this._multiStackWrap = null;
    this._multiLayerEls = [];
    this._multiErrorEls = [];
    this._multiToggleBtn = null;
    this._maskOverlay = null;
    this._qualityBtns = [];
    this._attachBtnIcon = null;
    this._lastEdgeSig = null;
    this._renderRefBarLock = null;
    this._ratioAnimTimer = null;
    this._ratioFlipAnim = null;
    this._rendererMediaDeferred = shouldDeferRendererMediaOnMount(_0x32efa4);
    this._rhAbortController = null;
    this._rhTaskId = null;
    this._rhApiKey = null;
    this._rhCancelRequested = false;
    this._rhResumeAbortController = null;
    this._rhResumeTaskId = "";
    this._rhResumePromise = null;
    this._dreaminaResumeAbortController = null;
    this._dreaminaResumeSubmitId = "";
    this._dreaminaResumePromise = null;
    this._dreaminaActiveSubmitId = "";
    this._dreaminaLoginPreflightInFlight = false;
    this._asyncResumeAbortController = null;
    this._asyncResumeTaskId = "";
    this._asyncResumePromise = null;
    this._statusOverlayEl = null;
    this._assetMentionRegistryUnsubscribe = null;
    this._assetMentionRegistryRefreshPending = false;
    this._generationNodeHelpTip = null;
    this._modelProviderProfileControl = null;
    this._footerControllerCleanup = null;
    this._uiSchemaCleanup = null;
    this._lowZoomHoverRefreshTimer = null;
  }
  _hideMaskPreview() {
    if (!this._maskOverlay) {
      return;
    }
    this._maskOverlay.src = "";
    this._maskOverlay.style.display = "none";
    this._currentMaskPreview = null;
  }
  _applyMaskPreview(_0x572333) {
    if (!this._maskOverlay) {
      return;
    }
    const _0x331e1a = String(_0x572333 || "").trim();
    if (!_0x331e1a) {
      this._suppressedEmptyMaskPreview = null;
      this._hideMaskPreview();
      return;
    }
    if (!hasAIGenMaskPreviewBaseImage(this._data)) {
      this._suppressedEmptyMaskPreview = _0x331e1a;
      this._hideMaskPreview();
      return;
    }
    if (this._suppressedEmptyMaskPreview === _0x331e1a) {
      this._hideMaskPreview();
      return;
    }
    this._suppressedEmptyMaskPreview = null;
    if (this._currentMaskPreview === _0x331e1a) {
      return;
    }
    const _0x14f36c = _0x331e1a.startsWith("blob:") || _0x331e1a.startsWith("data:") || _0x331e1a.startsWith("/") ? _0x331e1a : "/" + _0x331e1a.replace(/^\//, "");
    this._maskOverlay.src = encodeURI(_0x14f36c);
    this._maskOverlay.style.display = "block";
    this._currentMaskPreview = _0x331e1a;
  }
  _checkAtTrigger(_0x2ccfba) {
    return _checkAtTrigger(this, _0x2ccfba);
  }
  _populateMentionMenu(_0x20bb71, _0x22d5f7, _0x5e3e05, _0x259fe4 = null, _0x5bbcf4 = "", _0x1f1161 = -1) {
    return _populateMentionMenu(this, {
      x: _0x20bb71,
      y: _0x22d5f7,
      triggerRange: _0x5e3e05,
      pillToEdit: _0x259fe4,
      query: _0x5bbcf4,
      atIndex: _0x1f1161
    });
  }
  _insertMentionPill(_0x313c31, _0x489886, _0x596fb0, _0x3876c4 = -1) {
    return _insertMentionPill(this, {
      label: _0x313c31,
      nodeId: _0x489886,
      triggerRange: _0x596fb0,
      atIndex: _0x3876c4
    });
  }
  _handlePillKeyboard(_0x293485) {
    return _handlePillKeyboard(this, _0x293485);
  }
  _buildFloatingMenu(_0x4de2ba, _0x4f8898, _0x5c795d, _0x18cbaf, _0x2042c6) {
    const _0x1c6b9e = document.createElement("div");
    _0x1c6b9e.style.position = "relative";
    const _0x454551 = document.createElement("button");
    _0x454551.type = "button";
    _0x454551.className = "img-pill-btn";
    _0x454551.id = _0x4de2ba;
    const _0x585b54 = document.createElement("span");
    _0x585b54.className = _0x4f8898;
    _0x585b54.textContent = _0x5c795d;
    _0x454551.appendChild(_0x585b54);
    const _0x5703de = document.createElement("svg");
    _0x5703de.setAttribute("width", "10");
    _0x5703de.setAttribute("height", "10");
    _0x5703de.setAttribute("viewBox", "0 0 24 24");
    _0x5703de.setAttribute("fill", "none");
    _0x5703de.setAttribute("stroke", "currentColor");
    _0x5703de.setAttribute("stroke-width", "2");
    _0x5703de.style.opacity = "0.5";
    _0x5703de.innerHTML = "<polyline points=\"6 9 12 15 18 9\"/>";
    _0x454551.appendChild(_0x5703de);
    const _0x41828a = document.createElement("div");
    _0x41828a.className = "floating-menu";
    _0x18cbaf.forEach(_0xab839b => {
      const _0x5990de = document.createElement("div");
      _0x5990de.className = "floating-menu-item" + (_0xab839b.v === _0x5c795d || _0xab839b.l === _0x5c795d ? " active" : "");
      _0x5990de.dataset.value = _0xab839b.v;
      _0x5990de.textContent = _0xab839b.l;
      _0x5990de.addEventListener("mousedown", _0x3fa114 => {
        _0x3fa114.preventDefault();
        _0x585b54.textContent = _0xab839b.l;
        _0x41828a.querySelectorAll(".floating-menu-item").forEach(_0x4d0e32 => _0x4d0e32.classList.remove("active"));
        _0x5990de.classList.add("active");
        _0x41828a.classList.remove("open");
        _0x2042c6(_0xab839b.v);
      });
      _0x41828a.appendChild(_0x5990de);
    });
    _0x454551.addEventListener("mousedown", _0xa4de5a => {
      _0xa4de5a.preventDefault();
      _0xa4de5a.stopPropagation();
      const _0x48a02e = _0x41828a.classList.contains("open");
      document.querySelectorAll(".floating-menu.open").forEach(_0x4df7e8 => _0x4df7e8.classList.remove("open"));
      if (!_0x48a02e) {
        _0x41828a.classList.add("open");
      }
    });
    document.addEventListener("mousedown", _0xc6a186 => {
      if (!_0x1c6b9e.contains(_0xc6a186.target)) {
        _0x41828a.classList.remove("open");
      }
    }, true);
    _0x1c6b9e.appendChild(_0x454551);
    _0x1c6b9e.appendChild(_0x41828a);
    return {
      modelWrap: _0x1c6b9e,
      trig: _0x454551,
      menu: _0x41828a
    };
  }
}
const aiGenerateNodeUiModule = createAIGenerateNodeUiModule(AI_GENERATE_NODE_MODULE_DEPS);
const aiGenerateNodeStateSyncModule = createAIGenerateNodeStateSyncModule(AI_GENERATE_NODE_MODULE_DEPS);
const aiGenerateNodeSelectionStateModule = createAIGenerateNodeSelectionStateModule(AI_GENERATE_NODE_MODULE_DEPS);
const aiGenerateNodeTaskOrchestrationModule = createAIGenerateNodeTaskOrchestrationModule(AI_GENERATE_NODE_MODULE_DEPS);
function applyClassPrototypeMethods(_0x1cb04f, _0x45af0b) {
  if (!_0x45af0b) {
    return;
  }
  const _0x13a334 = Object.getOwnPropertyDescriptors(_0x45af0b);
  delete _0x13a334.constructor;
  Object.defineProperties(_0x1cb04f, _0x13a334);
}
applyClassPrototypeMethods(AIGenerateNode.prototype, aiGenerateNodeUiModule);
applyClassPrototypeMethods(AIGenerateNode.prototype, aiGenerateNodeStateSyncModule);
applyClassPrototypeMethods(AIGenerateNode.prototype, aiGenerateNodeSelectionStateModule);
applyClassPrototypeMethods(AIGenerateNode.prototype, aiGenerateNodeTaskOrchestrationModule);