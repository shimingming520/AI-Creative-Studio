import a365_0x168836 from "../core/stores/appStore.js";
import { shouldPreserveGenerationTaskOnUnmount } from "../core/generationTaskRuntime.js";
import { fetchVideoFirstFrameThumbFromServer } from "../../api/videoThumbApi.js";
import { fetchVideoMetaFromServer } from "../../api/videoMetaApi.js";
import { buildGenerateVideoRequest, cancelRunningHubVideoTask, generateVideo, probeDreaminaVideoTask, resumeAsyncVideoTask, resumeDreaminaVideoTask, resumeRunningHubVideoTask } from "../../api/aiVideoApi.js";
import { getDisplayModelName, PROVIDERS_META } from "../modules/providers.js";
import { _handlePillHover, _handlePillOut, _syncEdgesOrderFromPills, _syncPillLabels, _checkAtTrigger, _populateMentionMenu, _insertMentionPill, _rehydratePromptPills, _handlePillKeyboard, _handleMentionMenuKeyboard, _getMentionMenu, _closeMentionMenu, flushPromptHtmlCommit, handlePromptPaste, handlePromptSelectAll, handleRefThumbDeleteClick, schedulePromptHtmlCommit, shouldSubmitPromptByKeyboard } from "../modules/nodePromptShared.js";
import { VIDEO_TOOLBAR_HTML, bindVideoToolbarEvents, showDevToast } from "./NodeToolbarConfig.js";
import { getImage } from "../modules/storage.js";
import { startLoading, stopLoading } from "../modules/loadingOverlay.js";
import { bindRefThumbHoverPreview } from "../modules/refThumbHoverPreview.js";
import { ensureThumbDecoded, revealRefThumbMedia } from "../modules/refThumbMediaReveal.js";
import { getAIGenerationNodeSize, getAutoMediaSizeByShortSide, buildSourceMediaNodePayload } from "../services/fileService.js";
import { buildApiUrl } from "../../api/apiBase.js";
import { ensureConfig, getProviderConfig } from "../../api/configApi.js";
import { commit } from "../modules/history.js";
import { startNodeResizePreview } from "../modules/interaction/nodeResizePreview.js";
import { checkLocalMediaExists, saveOutputBlob, uploadFile } from "../modules/project.js";
import { getNodeSpawnPrefs, calcSafeSpawnPosNearNode } from "../modules/nodeSpawn.js";
import { VIDEO_VIP_MODEL_IDS, isVipModel as a365_0x20d5a3, getVipModelDisplayName, resolveVipGateModelId } from "../modules/subscriptionAccess.js";
import a365_0x518da4 from "../modules/VideoKeyingController.js";
import { generateId, findAvailablePosition } from "../core/math.js";
import { getDisplayedMediaSizeFromNode, sanitizePromptHtml } from "../utils/dom.js";
import { checkSlashTrigger, handleSlashKeyboardNavigation, closeSlashMenu } from "../modules/slashMenu.js";
import { shouldSkipPromptTriggerForBulkInput } from "../modules/promptTriggerComposition.js";
import { clearVirtualizedPromptCommit } from "../modules/promptPasteVirtualization.js";
import { activateMenuKeyboard } from "../modules/floatingMenuKeyboard.js";
import { stopPreviewNodeLoading, syncPreviewNodeLoading } from "../modules/previewMode.js";
import { isTaskTerminal, shouldShowGenerationBusyUi } from "../core/generationTaskUiState.js";
import { hasDisplayableVideoResult } from "../core/rendererNodeResultState.js";
import { videoUiRenderMixin } from "./aigenVideo/uiRenderMixin.js";
import { videoStateSyncMixin } from "./aigenVideo/stateSyncMixin.js";
import { videoTaskOrchestrationMixin } from "./aigenVideo/taskOrchestrationMixin.js";
import { createVideoNodeReferenceInputModule } from "./video-node/referenceInputModule.js";
import { subscribeAssetMentionRegistry } from "../modules/assetMentionRegistry.js";
import { removeCoveredAssetInputRefForConnection } from "../modules/promptAssetInputOverride.js";
import { localPathToUrl, pickResultLocalPath, urlToLocalPath } from "../utils/localMediaPath.js";
import { createGenerationNodeHelpTipController, getGenerationNodeHelpTooltip } from "./generationNodeHelpTip.js";
import { createPromptPresetTriggerController } from "./promptPresetTrigger.js";
import { createModelProviderProfileControl } from "./shared/modelProviderProfileControl.js";
import { syncModelUiSchemaControls } from "./aigenImage/uiSchemaRenderer.js";
import { buildUiSchemaVisibilitySignature } from "./aigenImage/uiSchemaVisibility.js";
import { GENERATION_MANUAL_DISPLAY_SIZE_FIELD } from "./shared/generationDisplayPolicy.js";
import { createVideoNodeParameterPanelModule } from "./video-node/parameterPanelModule.js";
import { shouldShowVideoPromptInput } from "./video-node/parameterPanelPresentationPolicy.js";
import { hasRunningHubVideoWorkflowUiField, hasRunningHubVideoWorkflowUiPlacement } from "./video-node/runningHubVideoUiSchema.js";
import { isCustomAiAppManifest, resolveCustomAiAppNodeManifest } from "./shared/rhAiAppNodeBehavior.js";
import { createVideoNodeTaskOrchestrationModule } from "./video-node/taskOrchestrationModule.js";
import { createVideoNodeResultRenderModule } from "./video-node/resultRenderModule.js";
import { createVideoNodePreviewControlsModule } from "./video-node/previewControlsModule.js";
import { hydrateDeferredVideoNodeToolbar, hydrateVideoNodeDeferredDetails, initializeVideoNodePromptDetailsOnMount, renderInitialVideoNodeFooter } from "./video-node/deferredDetailsHydration.js";
import { createVideoNodeUpdatePerf } from "./video-node/videoNodeUpdatePerf.js";
import { buildVideoNodeFooterControlSig, buildVideoNodePromptBoxSizeSig, buildVideoNodePromptUiSig, buildVideoNodeSubmitButtonSig, buildVideoNodeVideoViewSig } from "./video-node/videoNodeUpdateSignatures.js";
import { initializeVideoNodeMediaRuntimeState } from "./video-node/mediaRuntimeState.js";
import { setupPromptBoxResize, syncPromptBoxSizeFromData } from "./promptBoxResizeUi.js";
import { createVideoPromptEditorElements } from "./video-node/promptInputSurface.js";
import { onLocaleChange, t } from "../i18n/index.js";
import { createPromptAttachmentButtonHTML } from "./refAttachmentButton.js";
import { getFixedInputSlotConfigFromManifest } from "../modules/fixedInputAssetRefs.js";
import { getFixedInputAcceptForKind, getFixedInputSlotKind, getFixedInputSlotsToReplace } from "./video-node/fixedInputSlotHelpers.js";
import { syncVideoNodeFixedInputSummary } from "./video-node/fixedInputSummarySync.js";
import { getGenerationRatioMediaSize } from "../modules/generationRatioSource.js";
const VIDEO_VIP_MODEL_ID_SET = new Set(VIDEO_VIP_MODEL_IDS);
const VIDEO_VIP_MODEL_NAME_MAP = VIDEO_VIP_MODEL_IDS.reduce((_0x38ebec, _0x406f8c) => {
  _0x38ebec[_0x406f8c] = getVipModelDisplayName(_0x406f8c);
  return _0x38ebec;
}, {});
let _vipSessionRecheckDone = false;
const AI_VIDEO_MIN_SIZE = 150;
const api = {
  buildGenerateVideoRequest: buildGenerateVideoRequest,
  cancelRunningHubWorkflowTask: cancelRunningHubVideoTask,
  fetchVideoFirstFrameThumbFromServer: fetchVideoFirstFrameThumbFromServer,
  fetchVideoMetaFromServer: fetchVideoMetaFromServer,
  generateVideo: generateVideo,
  probeDreaminaVideoTask: probeDreaminaVideoTask,
  resumeAsyncVideoTask: resumeAsyncVideoTask,
  resumeDreaminaVideoTask: resumeDreaminaVideoTask,
  resumeRunningHubVideoTask: resumeRunningHubVideoTask
};
function aigenVideoNodeText(_0x2ecf2a, _0x4e23bc = {}) {
  return t("aigenVideoNode." + _0x2ecf2a, _0x4e23bc);
}
function getVideoAdaptiveRatioLabel() {
  return aigenVideoNodeText("ratio.adaptive");
}
function formatVideoNodeRatioResolutionLabel(_0x12b72b = {}) {
  const _0x2f9e89 = String(_0x12b72b?.aspectRatio || "").trim();
  const _0x2a0f6c = !_0x2f9e89 || _0x2f9e89 === "自适应" || _0x2f9e89 === "auto" || _0x2f9e89 === "adaptive" ? getVideoAdaptiveRatioLabel() : _0x2f9e89;
  return _0x2a0f6c + " · " + (_0x12b72b?.resolution || "1080p");
}
function readStoreState() {
  if (typeof a365_0x168836.getStateRaw === "function") {
    return a365_0x168836.getStateRaw();
  } else {
    return a365_0x168836.getState();
  }
}
function isTerminalGenerationUiState(_0x36e3a4) {
  return isTaskTerminal(_0x36e3a4);
}
function isVideoVipModel(_0x274992, _0xc5175e = "") {
  return a365_0x20d5a3(_0x274992, _0xc5175e);
}
function getVideoVipModelName(_0x301428, _0x9a0597 = "") {
  const _0x515e9a = resolveVipGateModelId(_0x301428, _0x9a0597);
  return VIDEO_VIP_MODEL_NAME_MAP[_0x515e9a] || _0x515e9a || aigenVideoNodeText("vip.modelFallback");
}
async function ensureVipSessionRecheck(_0x323f1a, _0x52f27c = "") {
  if (!isVideoVipModel(_0x323f1a, _0x52f27c)) {
    return;
  }
  if (_vipSessionRecheckDone) {
    return;
  }
  _vipSessionRecheckDone = true;
  if (typeof window.refreshSubscriptionState === "function") {
    try {
      await window.refreshSubscriptionState();
    } catch {}
  }
}
const VIDEO_NODE_MODULE_DEPS = {
  store: a365_0x168836,
  api: api,
  getDisplayModelName: getDisplayModelName,
  PROVIDERS_META: PROVIDERS_META,
  _handlePillHover: _handlePillHover,
  _handlePillOut: _handlePillOut,
  _syncEdgesOrderFromPills: _syncEdgesOrderFromPills,
  _syncPillLabels: _syncPillLabels,
  _getMentionMenu: _getMentionMenu,
  _closeMentionMenu: _closeMentionMenu,
  VIDEO_TOOLBAR_HTML: VIDEO_TOOLBAR_HTML,
  bindVideoToolbarEvents: bindVideoToolbarEvents,
  showDevToast: showDevToast,
  getImage: getImage,
  startLoading: startLoading,
  stopLoading: stopLoading,
  bindRefThumbHoverPreview: bindRefThumbHoverPreview,
  ensureThumbDecoded: ensureThumbDecoded,
  revealRefThumbMedia: revealRefThumbMedia,
  buildApiUrl: buildApiUrl,
  ensureConfig: ensureConfig,
  getProviderConfig: getProviderConfig,
  saveOutputBlob: saveOutputBlob,
  uploadFile: uploadFile,
  checkLocalMediaExists: checkLocalMediaExists,
  getNodeSpawnPrefs: getNodeSpawnPrefs,
  getAIGenerationNodeSize: getAIGenerationNodeSize,
  getAutoMediaSizeByShortSide: getAutoMediaSizeByShortSide,
  buildSourceMediaNodePayload: buildSourceMediaNodePayload,
  calcSafeSpawnPosNearNode: calcSafeSpawnPosNearNode,
  VideoKeyingController: a365_0x518da4,
  generateId: generateId,
  findAvailablePosition: findAvailablePosition,
  getDisplayedMediaSizeFromNode: getDisplayedMediaSizeFromNode,
  checkSlashTrigger: checkSlashTrigger,
  handleSlashKeyboardNavigation: handleSlashKeyboardNavigation,
  closeSlashMenu: closeSlashMenu,
  activateMenuKeyboard: activateMenuKeyboard,
  isVideoVipModel: isVideoVipModel,
  getVideoVipModelName: getVideoVipModelName,
  ensureVipSessionRecheck: ensureVipSessionRecheck,
  VIDEO_VIP_MODEL_IDS: VIDEO_VIP_MODEL_IDS,
  VIDEO_VIP_MODEL_ID_SET: VIDEO_VIP_MODEL_ID_SET,
  VIDEO_VIP_MODEL_NAME_MAP: VIDEO_VIP_MODEL_NAME_MAP,
  readStoreState: readStoreState
};
export class AIGenVideoNode {
  constructor(_0x4a3396) {
    this._data = _0x4a3396;
    this.nodeId = _0x4a3396.id;
    this.previewEl = null;
    this.videoEl = null;
    this.refBarEl = null;
    this.promptEl = null;
    this.btnEl = null;
    this.footerEl = null;
    this._promptPanel = null;
    this._promptInputWrap = null;
    this._promptResizeHandle = null;
    this._isPromptBoxResizing = false;
    this._promptResizeCleanup = null;
    this._qualityBtns = [];
    this._attachBtnIcon = null;
    this._lastImgKey = null;
    this._lastFooterSig = null;
    this._lastFooterControlSig = null;
    this._lastPromptContentSig = null;
    this._lastPromptUiSig = null;
    this._lastPromptBoxSizeSig = null;
    this._lastSubmitButtonSig = null;
    this._lastEdgeSig = null;
    this._lastRefModeSig = "";
    this._docClickBound = false;
    this._v5RefUploadInput = null;
    this._v5RefUploadSlot = "";
    this._v5RefUploadAnchorNodeId = "";
    this._fixedSlotRefThumbObjectUrls = new Map();
    this._ltxRefUploadInput = null;
    this._ltxRefUploadSlot = "";
    this._ltxRefUploadAnchorNodeId = "";
    this._adaptiveSrcRetryToken = 0;
    this._refThumbObjectUrls = new Map();
    this._lastSpecialModeSig = "";
    this._lastSubtractSubjectSig = "";
    this._renderRefBarLock = null;
    this._renderRefBarPending = false;
    this._ratioAnimTimer = null;
    this._ratioFlipAnim = null;
    this._rhAbortController = null;
    this._rhTaskId = null;
    this._rhApiKey = null;
    this._rhCancelRequested = false;
    this._rhResumeAbortController = null;
    this._rhResumeTaskId = "";
    this._rhResumePromise = null;
    this._asyncResumeAbortController = null;
    this._asyncResumeTaskId = "";
    this._asyncResumePromise = null;
    this._statusOverlayEl = null;
    this._lastAdaptiveEdgeSig = null;
    this._lastVideoViewSig = null;
    this._lastHasInputConnections = null;
    initializeVideoNodeMediaRuntimeState(this, _0x4a3396, a365_0x168836);
    this._vipSelectionRetryInProgress = false;
    this._assetMentionRegistryUnsubscribe = null;
    this._assetMentionRegistryRefreshPending = false;
    this._generationNodeHelpTip = null;
    this._modelProviderProfileControl = null;
    this._uiSchemaCleanup = null;
    this._footerControllerCleanup = null;
    this._videoSubmitInFlight = false;
    this._unsubscribeLocale = null;
  }
  get isNoResult() {
    return !hasDisplayableVideoResult(this._data);
  }
  _syncNoResultClass() {
    if (!this._root?.classList) {
      return;
    }
    if (this.isNoResult) {
      this._root.classList.add("no-result");
    } else {
      this._root.classList.remove("no-result");
    }
  }
  _syncLocaleTexts() {
    if (this.promptEl) {
      this.promptEl.dataset.placeholder = aigenVideoNodeText("prompt.placeholder");
    }
    this._promptPanel?.querySelector(".generation-node-help-tip")?.setAttribute("aria-label", aigenVideoNodeText("help.ariaLabel"));
  }
  _deferVideoMediaRefresh() {
    this._deferredVideoViewRefreshPending = true;
    const _0x4d559b = this._showDeferredVideoPosterPreview?.() === true;
    if (!_0x4d559b && this._placeholderEl) {
      this._placeholderEl.style.display = "flex";
    }
    this._setVideoOverlaysVisible?.(false);
  }
  _loadVideoWhenMediaReady() {
    const _0x5e25e7 = this._rendererMediaDeferred === true && !this._mustRenderTerminalVideoState?.(this._data);
    if (_0x5e25e7) {
      return this._deferVideoMediaRefresh();
    }
    this._loadAndDisplayVideo();
  }
  _schedulePreviewVideoOverlays() {
    const _0x509ca1 = () => {
      if (this._rendererMediaDeferred !== true && this.previewEl?.isConnected !== false) {
        this._ensurePreviewVideoOverlays();
      }
    };
    if (typeof globalThis.requestIdleCallback === "function") {
      globalThis.requestIdleCallback(_0x509ca1, {
        timeout: 1200
      });
    } else {
      (globalThis.requestAnimationFrame || globalThis.setTimeout)(_0x509ca1);
    }
  }
  _renderRefBarWhenMediaReady() {
    if (this._rendererMediaDeferred === true || this._rendererDetailsDeferred === true) {
      this._renderRefBarPendingWhenVisible = true;
    } else {
      this._renderRefBar();
    }
  }
  mount() {
    if (typeof this._normalizeDreaminaNodeData === "function") {
      this._data = this._normalizeDreaminaNodeData(this._data, {
        syncStore: true
      }) || this._data;
    }
    const _0x22fdc7 = document.createElement("div");
    if (this.isNoResult) {
      _0x22fdc7.classList.add("no-result");
    }
    this._root = _0x22fdc7;
    Object.assign(_0x22fdc7.style, {
      display: "flex",
      flexDirection: "column",
      height: "100%",
      pointerEvents: "auto",
      cursor: "default"
    });
    _0x22fdc7.style.setProperty("overflow", "visible", "important");
    if (this._rendererThinVideoHydration === true) {
      this._deferredToolbarMarkupPending = true;
    } else {
      _0x22fdc7.innerHTML = VIDEO_TOOLBAR_HTML;
    }
    this.previewEl = document.createElement("div");
    this.previewEl.className = "img-node-preview";
    Object.assign(this.previewEl.style, {
      background: "var(--white-05)",
      border: "1px solid var(--video-node-surface-border-color, var(--stroke-10))",
      borderRadius: "18px",
      position: "relative",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      overflow: "hidden",
      transition: "none"
    });
    this.previewEl.style.setProperty("width", "100%", "important");
    this.previewEl.style.setProperty("height", "100%", "important");
    this.previewEl.style.setProperty("min-height", "260px", "important");
    const _0x2e3ffb = document.createElement("div");
    _0x2e3ffb.className = "img-node-placeholder";
    Object.assign(_0x2e3ffb.style, {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: "8px",
      color: "var(--text-muted)",
      pointerEvents: "none",
      userSelect: "none"
    });
    _0x2e3ffb.innerHTML = "\n            <svg class=\"placeholder-icon-svg\" width=\"40\" height=\"40\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.2\" style=\"transition:all 0.2s;\">\n                <path d=\"M23 7l-7 5 7 5V7z\"/><rect x=\"1\" y=\"5\" width=\"15\" height=\"14\" rx=\"2\" ry=\"2\"/>\n            </svg>";
    this.previewEl.appendChild(_0x2e3ffb);
    this._placeholderEl = _0x2e3ffb;
    syncPreviewNodeLoading(this.nodeId, this.previewEl, this._getPreviewGenerateButtonLoadingOptions?.());
    if (this._rendererMediaDeferred !== true) {
      if (this._rendererThinVideoHydration !== true) {
        this._ensurePreviewVideoOverlays();
      }
    }
    _0x22fdc7.appendChild(this.previewEl);
    const _0x44eca1 = document.createElement("div");
    _0x44eca1.className = "node-resizer";
    _0x22fdc7.appendChild(_0x44eca1);
    this._loadVideoWhenMediaReady();
    if (typeof this._maybeResumeDreaminaTaskImpl === "function") {
      queueMicrotask(() => {
        if (readStoreState().nodes?.[this.nodeId]) {
          this._maybeResumeDreaminaTaskImpl();
        }
      });
    }
    if (typeof this._maybeResumeRunningHubTaskImpl === "function") {
      queueMicrotask(() => {
        if (readStoreState().nodes?.[this.nodeId]) {
          this._maybeResumeRunningHubTaskImpl();
        }
      });
    }
    if (typeof this._maybeResumeAsyncTaskImpl === "function") {
      queueMicrotask(() => {
        if (readStoreState().nodes?.[this.nodeId]) {
          this._maybeResumeAsyncTaskImpl();
        }
      });
    }
    this.previewEl.addEventListener("mouseenter", () => {
      this.activatePreviewHoverPlayback();
    });
    this.previewEl.addEventListener("mouseleave", () => {
      const _0x2778fc = readStoreState();
      const _0x5abcc3 = _0x2778fc.videoClip;
      if (_0x5abcc3 && _0x5abcc3.active && _0x5abcc3.nodeId === this.nodeId) {
        return;
      }
      const _0x3db480 = _0x2778fc.nodes[this.nodeId] || this._data || {};
      if (_0x3db480.isVideosExpanded) {
        return;
      }
      this._deactivatePreviewHoverPlayback();
    });
    const _0x399835 = document.createElement("div");
    _0x399835.className = "text-prompt-panel";
    this._promptPanel = _0x399835;
    _0x399835.addEventListener("pointerdown", _0x348310 => {
      _0x348310.stopPropagation();
    });
    this.refBarEl = document.createElement("div");
    this.refBarEl.className = "node-ref-bar";
    this.refBarEl.innerHTML = createPromptAttachmentButtonHTML({
      stroke: "var(--white-90)"
    });
    _0x399835.appendChild(this.refBarEl);
    this.refBarEl.addEventListener("pointerdown", _0x199b06 => {
      if (_0x199b06.target.closest(".prompt-attachment-btn, .ref-thumb-wrap, .ref-thumb-delete")) {
        _0x199b06.stopPropagation();
      }
    });
    this.refBarEl.addEventListener("click", _0x580ebc => {
      if (handleRefThumbDeleteClick(this, _0x580ebc)) {
        return;
      }
      const _0x45a78a = _0x580ebc.target.closest(".prompt-attachment-btn");
      if (!_0x45a78a) {
        return;
      }
      _0x580ebc.stopPropagation();
      _0x580ebc.preventDefault();
      const _0x113bf7 = a365_0x168836.getState().pickConnectMode;
      if (_0x113bf7?.active && _0x113bf7.sourceNodeId === this.nodeId) {
        a365_0x168836.setPickConnectMode({
          active: false
        });
      } else {
        a365_0x168836.setPickConnectMode({
          active: true,
          sourceNodeId: this.nodeId,
          handleDirection: "left"
        });
      }
    });
    this._unbindRefThumbHoverPreview = bindRefThumbHoverPreview(this.refBarEl);
    this._v5RefUploadInput = document.createElement("input");
    this._v5RefUploadInput.type = "file";
    this._v5RefUploadInput.accept = "*/*";
    this._v5RefUploadInput.style.display = "none";
    _0x399835.appendChild(this._v5RefUploadInput);
    this._v5RefUploadInput.addEventListener("change", async _0x5174c5 => {
      const _0x31d8de = _0x5174c5.target.files?.[0];
      const _0x4ac798 = this._v5RefUploadSlot;
      const _0x46d641 = this._v5RefUploadAnchorNodeId;
      if (!_0x31d8de || !_0x4ac798 || !_0x46d641) {
        this._v5RefUploadInput.value = "";
        return;
      }
      try {
        const _0x4086d7 = window.currentProjectId || "default_v2_project";
        const _0x34fa60 = await uploadFile(_0x31d8de, _0x4086d7);
        const _0x3cf56d = _0x34fa60?.url || "";
        if (!_0x3cf56d) {
          throw new Error(aigenVideoNodeText("upload.noFileUrl"));
        }
        const _0x3d21b5 = a365_0x168836.getState();
        const _0x51ff7d = _0x3d21b5.nodes?.[_0x46d641];
        if (!_0x51ff7d) {
          throw new Error(aigenVideoNodeText("upload.anchorMissing"));
        }
        const _0x4c161b = pickResultLocalPath(_0x34fa60) || urlToLocalPath(_0x3cf56d);
        const _0xd82758 = getFixedInputSlotKind(_0x51ff7d, _0x4ac798);
        const _0x1c7619 = _0xd82758 === "video";
        const _0x3faa7f = _0xd82758 === "image";
        if (_0x1c7619 && !_0x31d8de.type.startsWith("video/")) {
          throw new Error(aigenVideoNodeText("upload.videoOnly"));
        }
        if (_0x3faa7f && !_0x31d8de.type.startsWith("image/")) {
          throw new Error(aigenVideoNodeText("upload.imageOnly"));
        }
        if (!_0x1c7619 && !_0x3faa7f) {
          throw new Error(aigenVideoNodeText("upload.unsupportedAsset"));
        }
        const _0x52cdad = _0x1c7619 ? "source-video" : "source-image";
        let _0x337d38 = 300;
        let _0x57b557 = 300;
        if (_0x1c7619) {
          const _0x12584b = document.createElement("video");
          _0x12584b.src = URL.createObjectURL(_0x31d8de);
          await new Promise(_0x1afb30 => {
            _0x12584b.onloadedmetadata = () => {
              const _0x3faacd = _0x12584b.videoWidth || 420;
              const _0x3a4f56 = _0x12584b.videoHeight || 260;
              const _0x30aece = Math.min(_0x3faacd, _0x3a4f56);
              const _0x372761 = 300 / (_0x30aece || 1);
              _0x337d38 = Math.round(_0x3faacd * _0x372761);
              _0x57b557 = Math.round(_0x3a4f56 * _0x372761);
              URL.revokeObjectURL(_0x12584b.src);
              _0x1afb30();
            };
            _0x12584b.onerror = () => {
              URL.revokeObjectURL(_0x12584b.src);
              _0x1afb30();
            };
          });
        } else if (_0x3faa7f) {
          const _0x3f4cde = new Image();
          await new Promise(_0x19c488 => {
            _0x3f4cde.onload = () => {
              const _0xc73ec0 = _0x3f4cde.naturalWidth || 260;
              const _0x4d5cbc = _0x3f4cde.naturalHeight || 260;
              const _0x273782 = Math.min(_0xc73ec0, _0x4d5cbc);
              const _0x5631ae = 300 / (_0x273782 || 1);
              _0x337d38 = Math.round(_0xc73ec0 * _0x5631ae);
              _0x57b557 = Math.round(_0x4d5cbc * _0x5631ae);
              _0x19c488();
            };
            _0x3f4cde.onerror = () => {
              _0x19c488();
            };
            _0x3f4cde.src = _0x3cf56d;
          });
        }
        const {
          spacing: _0x37a22c,
          direction: _0x1dd72c,
          avoidOverlap: _0x53c623
        } = getNodeSpawnPrefs();
        const _0x27ef21 = _0x1dd72c === "down" ? "down" : "left";
        const _0xdfc0ed = Number(_0x51ff7d.x) || 0;
        const _0x2d1ec5 = Number(_0x51ff7d.y) || 0;
        const _0x5627cc = Number(_0x51ff7d.width) || 360;
        const _0x32e742 = Number(_0x51ff7d.height) || 360;
        const _0x1f16a4 = _0xdfc0ed - _0x37a22c - _0x337d38;
        const _0xd28192 = _0x27ef21 === "down" ? _0x2d1ec5 + _0x32e742 + _0x37a22c : _0x2d1ec5 + Math.round((_0x32e742 - _0x57b557) / 2);
        const _0x123d57 = _0x53c623 ? findAvailablePosition(_0x3d21b5.nodes || {}, _0x1f16a4, _0xd28192, _0x337d38, _0x57b557, _0x37a22c, _0x27ef21) : {
          x: _0x1f16a4,
          y: _0xd28192
        };
        const _0x11075c = getFixedInputSlotsToReplace(_0x51ff7d, _0x4ac798);
        a365_0x168836.batch(() => {
          const _0x2f54aa = a365_0x168836.getIncomingEdges(this.nodeId);
          for (const _0x52aa88 of _0x2f54aa) {
            if (_0x11075c.has(String(_0x52aa88?.refSlot || ""))) {
              a365_0x168836.removeEdge(_0x52aa88.id);
            }
          }
          const _0x263859 = generateId("node");
          const _0x15d989 = {
            id: _0x263859,
            type: _0x52cdad,
            x: _0x123d57.x,
            y: _0x123d57.y,
            width: _0x337d38,
            height: _0x57b557,
            src: _0x3cf56d,
            localPath: _0x4c161b,
            assetId: _0x34fa60.assetId || "",
            originalLocalPath: _0x34fa60.originalLocalPath || _0x34fa60.localPath || "",
            posterLocalPath: _0x34fa60.posterLocalPath || "",
            waveformLocalPath: _0x34fa60.waveformLocalPath || "",
            derivativeStatus: _0x34fa60.derivativeStatus || _0x34fa60.status || "",
            mediaTaskId: _0x34fa60.mediaTaskId || "",
            mediaTaskKind: _0x34fa60.mediaTaskKind || "",
            mediaTaskStatus: _0x34fa60.mediaTaskStatus || "",
            mediaTaskProgress: Number(_0x34fa60.mediaTaskProgress || 0) || 0,
            mediaTaskError: _0x34fa60.mediaTaskError || "",
            fileName: _0x34fa60.filename || _0x31d8de.name || "",
            thumbUrl: _0x34fa60.posterUrl || _0x34fa60.thumbUrl || null
          };
          if (_0x1c7619) {
            _0x15d989.name = _0x31d8de.name || (_0x4ac798 === "videoMask" ? aigenVideoNodeText("inputNames.maskVideo") : aigenVideoNodeText("inputNames.sourceVideo"));
          }
          removeCoveredAssetInputRefForConnection({
            targetId: this.nodeId,
            sourceKind: _0x1c7619 ? "video" : "image",
            refSlot: _0x4ac798
          });
          a365_0x168836.addNode(_0x15d989);
          a365_0x168836.addEdge({
            id: generateId("edge"),
            sourceId: _0x263859,
            targetId: this.nodeId,
            refSlot: _0x4ac798
          });
          a365_0x168836.setSelectedNodes([this.nodeId]);
        });
        this._updateSubmitButtonState();
        if (_0x1c7619) {
          try {
            const _0x180bb6 = localPathToUrl(_0x4c161b);
            const _0x20208a = await fetchVideoFirstFrameThumbFromServer(_0x180bb6);
            const _0x493a7f = String(_0x20208a?.url || "").trim();
            if (_0x493a7f) {
              const _0x3b2c2c = a365_0x168836.getState().nodes?.[newNodeId];
              if (_0x3b2c2c) {
                a365_0x168836.updateNodeData(newNodeId, {
                  thumbUrl: _0x493a7f,
                  videoThumbSrc: _0x180bb6
                });
              }
            }
          } catch {}
        }
        if (!_0x1c7619) {}
      } catch (_0x20ced4) {
        window.showToast?.(_0x20ced4?.message || aigenVideoNodeText("upload.failedRetry"), "error");
      } finally {
        this._v5RefUploadInput.value = "";
        this._v5RefUploadSlot = "";
        this._v5RefUploadAnchorNodeId = "";
      }
    });
    this._ltxRefUploadInput = document.createElement("input");
    this._ltxRefUploadInput.type = "file";
    this._ltxRefUploadInput.accept = "*/*";
    this._ltxRefUploadInput.style.display = "none";
    _0x399835.appendChild(this._ltxRefUploadInput);
    this._ltxRefUploadInput.addEventListener("change", async _0x2b5e84 => {
      const _0x7ec877 = _0x2b5e84.target.files?.[0];
      const _0x2d0d71 = this._ltxRefUploadSlot;
      const _0x3fe8b3 = this._ltxRefUploadAnchorNodeId;
      if (!_0x7ec877 || !_0x2d0d71 || !_0x3fe8b3) {
        this._ltxRefUploadInput.value = "";
        return;
      }
      try {
        const _0xf4570e = window.currentProjectId || "default_v2_project";
        const _0x2610b7 = await uploadFile(_0x7ec877, _0xf4570e);
        const _0x4008ba = _0x2610b7?.url || "";
        if (!_0x4008ba) {
          throw new Error(aigenVideoNodeText("upload.noFileUrl"));
        }
        const _0xd073d3 = a365_0x168836.getState();
        const _0x4204e0 = _0xd073d3.nodes?.[_0x3fe8b3];
        if (!_0x4204e0) {
          throw new Error(aigenVideoNodeText("upload.anchorMissing"));
        }
        const _0x7b65ae = pickResultLocalPath(_0x2610b7) || urlToLocalPath(_0x4008ba);
        const _0x4b3e8b = getFixedInputSlotKind(_0x4204e0, _0x2d0d71);
        const _0xe5b990 = _0x4b3e8b === "image";
        const _0x55e18a = _0x4b3e8b === "video";
        const _0x10d65f = _0x4b3e8b === "audio";
        if (_0xe5b990 && !_0x7ec877.type.startsWith("image/")) {
          throw new Error(aigenVideoNodeText("upload.imageOnly"));
        }
        if (_0x55e18a && !_0x7ec877.type.startsWith("video/")) {
          throw new Error(aigenVideoNodeText("upload.videoOnly"));
        }
        if (_0x10d65f && !_0x7ec877.type.startsWith("audio/")) {
          throw new Error(aigenVideoNodeText("upload.audioOnly"));
        }
        if (!_0xe5b990 && !_0x55e18a && !_0x10d65f) {
          throw new Error(aigenVideoNodeText("upload.unsupportedAsset"));
        }
        const _0x4a10d4 = _0x10d65f ? "source-audio" : _0x55e18a ? "source-video" : "source-image";
        let _0x160946 = _0x10d65f ? 320 : _0x55e18a ? 360 : 300;
        let _0x2398f5 = _0x10d65f ? 140 : _0x55e18a ? 220 : 300;
        if (_0xe5b990) {
          const _0x4cfaa6 = new Image();
          await new Promise(_0x58afc2 => {
            _0x4cfaa6.onload = () => {
              const _0x4cd69e = _0x4cfaa6.naturalWidth || 260;
              const _0xb68906 = _0x4cfaa6.naturalHeight || 260;
              const _0x441d36 = Math.min(_0x4cd69e, _0xb68906);
              const _0x5cefa9 = 300 / (_0x441d36 || 1);
              _0x160946 = Math.round(_0x4cd69e * _0x5cefa9);
              _0x2398f5 = Math.round(_0xb68906 * _0x5cefa9);
              _0x58afc2();
            };
            _0x4cfaa6.onerror = () => _0x58afc2();
            _0x4cfaa6.src = _0x4008ba;
          });
        }
        const {
          spacing: _0x2659a6,
          direction: _0x106dd0,
          avoidOverlap: _0x29566b
        } = getNodeSpawnPrefs();
        const _0x4981cf = _0x106dd0 === "down" ? "down" : "left";
        const _0x577a60 = Number(_0x4204e0.x) || 0;
        const _0x145557 = Number(_0x4204e0.y) || 0;
        const _0x572ff3 = Number(_0x4204e0.width) || 360;
        const _0x201660 = Number(_0x4204e0.height) || 360;
        const _0x879a36 = _0x577a60 - _0x2659a6 - _0x160946;
        const _0x436990 = _0x4981cf === "down" ? _0x145557 + _0x201660 + _0x2659a6 : _0x145557 + Math.round((_0x201660 - _0x2398f5) / 2);
        const _0x188879 = _0x29566b ? findAvailablePosition(_0xd073d3.nodes || {}, _0x879a36, _0x436990, _0x160946, _0x2398f5, _0x2659a6, _0x4981cf) : {
          x: _0x879a36,
          y: _0x436990
        };
        const _0x52bc6d = getFixedInputSlotsToReplace(_0x4204e0, _0x2d0d71);
        a365_0x168836.batch(() => {
          const _0x1edb51 = a365_0x168836.getIncomingEdges(this.nodeId);
          for (const _0x17d6e7 of _0x1edb51) {
            if (_0x52bc6d.has(String(_0x17d6e7?.refSlot || ""))) {
              a365_0x168836.removeEdge(_0x17d6e7.id);
            }
          }
          const _0x30746f = generateId("node");
          const _0x822b61 = {
            id: _0x30746f,
            type: _0x4a10d4,
            x: _0x188879.x,
            y: _0x188879.y,
            width: _0x160946,
            height: _0x2398f5,
            src: _0x4008ba,
            localPath: _0x7b65ae,
            assetId: _0x2610b7.assetId || "",
            originalLocalPath: _0x2610b7.originalLocalPath || _0x2610b7.localPath || "",
            posterLocalPath: _0x2610b7.posterLocalPath || "",
            waveformLocalPath: _0x2610b7.waveformLocalPath || "",
            derivativeStatus: _0x2610b7.derivativeStatus || _0x2610b7.status || "",
            mediaTaskId: _0x2610b7.mediaTaskId || "",
            mediaTaskKind: _0x2610b7.mediaTaskKind || "",
            mediaTaskStatus: _0x2610b7.mediaTaskStatus || "",
            mediaTaskProgress: Number(_0x2610b7.mediaTaskProgress || 0) || 0,
            mediaTaskError: _0x2610b7.mediaTaskError || "",
            fileName: _0x2610b7.filename || _0x7ec877.name || ""
          };
          if (_0x10d65f) {
            _0x822b61.name = _0x7ec877.name || aigenVideoNodeText("inputNames.sourceAudio");
          }
          if (_0x55e18a) {
            _0x822b61.name = _0x7ec877.name || aigenVideoNodeText("inputNames.sourceVideo");
          }
          removeCoveredAssetInputRefForConnection({
            targetId: this.nodeId,
            sourceKind: _0x10d65f ? "audio" : _0x55e18a ? "video" : "image",
            refSlot: _0x2d0d71
          });
          a365_0x168836.addNode(_0x822b61);
          a365_0x168836.addEdge({
            id: generateId("edge"),
            sourceId: _0x30746f,
            targetId: this.nodeId,
            refSlot: _0x2d0d71
          });
          a365_0x168836.setSelectedNodes([this.nodeId]);
        });
        this._updateSubmitButtonState();
      } catch (_0x25e0ae) {
        window.showToast?.(_0x25e0ae?.message || aigenVideoNodeText("upload.failedRetry"), "error");
      } finally {
        this._ltxRefUploadInput.value = "";
        this._ltxRefUploadSlot = "";
        this._ltxRefUploadAnchorNodeId = "";
      }
    });
    this.refBarEl.addEventListener("click", _0x1abd95 => {
      const _0x133539 = _0x1abd95.target.closest(".rh-v5-ref-box");
      if (!_0x133539) {
        return;
      }
      const _0x55ca66 = a365_0x168836.getState().nodes?.[this.nodeId];
      const _0x23bba4 = getFixedInputSlotConfigFromManifest(_0x55ca66 || {});
      if (!_0x23bba4) {
        return;
      }
      const _0x172278 = _0x1abd95.target.closest(".ref-thumb-delete");
      if (_0x172278) {
        _0x1abd95.stopPropagation();
        _0x1abd95.preventDefault();
        const _0x549072 = _0x133539.dataset.edgeId || "";
        if (_0x549072) {
          a365_0x168836.removeEdge(_0x549072);
          this._updateSubmitButtonState();
        }
        return;
      }
      _0x1abd95.stopPropagation();
      _0x1abd95.preventDefault();
      const _0x36828c = _0x133539.dataset.slot || "";
      if (!_0x36828c) {
        return;
      }
      const _0x3618d8 = _0x23bba4.slotKindById?.[_0x36828c] || "";
      if (!_0x3618d8 || !_0x23bba4.visibleSlots.includes(_0x36828c)) {
        return;
      }
      const _0x52d106 = getFixedInputAcceptForKind(_0x3618d8);
      if (_0x3618d8 === "audio") {
        this._ltxRefUploadSlot = _0x36828c;
        this._ltxRefUploadAnchorNodeId = this.nodeId;
        this._ltxRefUploadInput.accept = _0x52d106;
        this._ltxRefUploadInput.click();
        return;
      }
      this._v5RefUploadSlot = _0x36828c;
      this._v5RefUploadAnchorNodeId = this.nodeId;
      this._v5RefUploadInput.accept = _0x52d106;
      this._v5RefUploadInput.click();
    });
    const {
      inputWrap: _0x335e18,
      promptEl: _0x32396a
    } = createVideoPromptEditorElements({
      documentObject: document,
      placeholder: aigenVideoNodeText("prompt.placeholder")
    });
    this._promptInputWrap = _0x335e18;
    this.promptEl = _0x32396a;
    this._flushPromptHtmlCommit = () => flushPromptHtmlCommit(this);
    this.promptEl.addEventListener("input", _0x530649 => {
      schedulePromptHtmlCommit(this);
      this._checkAtTrigger(_0x530649);
      checkSlashTrigger(_0x530649, {
        promptEl: this.promptEl,
        nodeType: this._data.type,
        nodeId: this.nodeId,
        onGenerate: (_0x3e95da, _0x294166) => this._onGenerate(_0x3e95da, _0x294166)
      });
      if (shouldSkipPromptTriggerForBulkInput(_0x530649)) {
        return;
      }
      _syncEdgesOrderFromPills(this);
      this._updateSubmitButtonState();
    });
    this.promptEl.addEventListener("blur", () => {
      flushPromptHtmlCommit(this);
    });
    this.promptEl.addEventListener("mouseover", _0x12340f => {
      _handlePillHover(_0x12340f, this);
    });
    this.promptEl.addEventListener("mouseout", _0x3c4093 => {
      _handlePillOut(_0x3c4093, this);
    });
    this.promptEl.addEventListener("keydown", _0x3632ae => {
      if (handlePromptSelectAll(this, _0x3632ae)) {
        return;
      }
      if (_handleMentionMenuKeyboard(_0x3632ae)) {
        return;
      }
      if (handleSlashKeyboardNavigation(_0x3632ae)) {
        return;
      }
      if (shouldSubmitPromptByKeyboard(_0x3632ae)) {
        _0x3632ae.preventDefault();
        flushPromptHtmlCommit(this);
        this.btnEl?.click();
        return;
      }
      _handlePillKeyboard(this, _0x3632ae);
    });
    this.promptEl.addEventListener("paste", _0x593768 => {
      handlePromptPaste(this, _0x593768);
    });
    _0x399835.appendChild(_0x335e18);
    this._promptPresetTrigger = createPromptPresetTriggerController({
      panel: _0x399835,
      getPromptEl: () => this.promptEl,
      getNodeType: () => this._data?.type,
      getNodeId: () => this.nodeId,
      onGenerate: (_0x50f7a3, _0x43f96c) => this._onGenerate(_0x50f7a3, _0x43f96c)
    });
    this._unsubscribeLocale?.();
    this._unsubscribeLocale = onLocaleChange(() => this._syncLocaleTexts());
    initializeVideoNodePromptDetailsOnMount(this, {
      sanitizePromptHtml: sanitizePromptHtml
    });
    this._data = syncVideoNodeFixedInputSummary({
      nodeId: this.nodeId,
      nodeData: this._data,
      promptEl: this.promptEl,
      syncStore: false
    }).nodeData || this._data;
    const _0x5cff5f = document.createElement("div");
    _0x5cff5f.className = "prompt-panel-footer";
    this.footerEl = _0x5cff5f;
    renderInitialVideoNodeFooter(this, _0x5cff5f);
    _0x399835.appendChild(_0x5cff5f);
    _0x22fdc7.appendChild(_0x399835);
    this._renderRefBarWhenMediaReady();
    if (!this._rendererDetailsDeferred) {
      this._syncInitialUpdateSignatures(this._data);
    }
    this._assetMentionRegistryUnsubscribe?.();
    this._assetMentionRegistryUnsubscribe = subscribeAssetMentionRegistry(() => {
      if (this._assetMentionRegistryRefreshPending) {
        return;
      }
      this._assetMentionRegistryRefreshPending = true;
      queueMicrotask(() => {
        this._assetMentionRegistryRefreshPending = false;
        if (!a365_0x168836.getState().nodes?.[this.nodeId]) {
          return;
        }
        if (this._rendererDetailsDeferred) {
          return;
        }
        _rehydratePromptPills(this);
        this._renderRefBar();
        this._updateSubmitButtonState();
      });
    });
    const _0x17ae4a = _0x22fdc7.querySelector(".node-floating-toolbar");
    if (this._rendererDetailsDeferred) {
      this._deferredToolbarEl = _0x17ae4a;
    } else {
      bindVideoToolbarEvents(_0x17ae4a, this._data);
    }
    if (_0x44eca1) {
      _0x44eca1.addEventListener("pointerdown", _0x5a22d2 => {
        const _0x16a289 = a365_0x168836.getStateRaw().ui?.imageVideoNodeResizeEnabled === true;
        const _0x3027ae = document.getElementById("v2-wrap")?.classList.contains("v2-media-node-resize-enabled");
        if (!_0x16a289 || !_0x3027ae) {
          return;
        }
        if (_0x5a22d2.button !== 0) {
          return;
        }
        startNodeResizePreview({
          event: _0x5a22d2,
          nodeId: this.nodeId,
          getNode: () => a365_0x168836.getStateRaw().nodes?.[this.nodeId] || this._data,
          getViewport: () => a365_0x168836.getStateRaw().viewport,
          resolveSize: ({
            startWidth: _0x2965dc,
            startHeight: _0x345a35,
            dx: _0x732aa6,
            dy: _0x4987e0
          }) => {
            const _0x4d6a03 = _0x2965dc / _0x345a35;
            const _0x4fd93b = Math.max(_0x732aa6 / _0x2965dc, _0x4987e0 / _0x345a35);
            const _0x1c56f0 = Math.max(AI_VIDEO_MIN_SIZE / _0x2965dc, AI_VIDEO_MIN_SIZE / _0x345a35);
            const _0x1f9f64 = Math.max(_0x1c56f0, 1 + _0x4fd93b);
            const _0x2c74dc = Math.max(AI_VIDEO_MIN_SIZE, Math.round(_0x2965dc * _0x1f9f64));
            const _0x47f0b0 = Math.max(AI_VIDEO_MIN_SIZE, Math.round(_0x2c74dc / _0x4d6a03));
            return {
              width: _0x2c74dc,
              height: _0x47f0b0
            };
          },
          buildFinalPatch: ({
            startNode: _0x5f5b62,
            startSize: _0x968d6f,
            finalSize: _0x3d8226
          }) => {
            const _0x230555 = Math.round(Number(_0x968d6f?.width) || 0) !== Math.round(Number(_0x3d8226?.width) || 0) || Math.round(Number(_0x968d6f?.height) || 0) !== Math.round(Number(_0x3d8226?.height) || 0);
            return {
              ...(_0x5f5b62?.needsAutoResize ? {
                needsAutoResize: false
              } : {}),
              ...(_0x230555 ? {
                [GENERATION_MANUAL_DISPLAY_SIZE_FIELD]: true
              } : {})
            };
          },
          applyPatch: _0x248f9e => a365_0x168836.updateNodeData(this.nodeId, _0x248f9e),
          commit: commit
        });
      });
    }
    this._attachBtnIcon = this.refBarEl.querySelector(".btn-icon");
    if (!this._rendererDetailsDeferred) {
      this._updateSubmitButtonState();
    }
    return _0x22fdc7;
  }
  _initPromptPills() {
    _rehydratePromptPills(this);
  }
  _syncPromptBoxSizeFromData(_0x5b906b = this._data) {
    syncPromptBoxSizeFromData(this, _0x5b906b);
  }
  _setupPromptBoxResize() {
    setupPromptBoxResize(this, {
      store: a365_0x168836,
      getStateSnapshot: () => typeof a365_0x168836.getStateRaw === "function" ? a365_0x168836.getStateRaw() : a365_0x168836.getState()
    });
  }
  _syncPromptInputVisibility(_0x58ff82 = this._data) {
    if (!this._promptInputWrap) {
      return true;
    }
    const _0x5a5eba = typeof this._resolveModelExecution === "function" ? this._resolveModelExecution(_0x58ff82?.model, _0x58ff82?.provider) : null;
    const _0x4fa0fe = shouldShowVideoPromptInput(_0x5a5eba?.modelManifest);
    if (this._promptInputWrap.hidden !== !_0x4fa0fe) {
      this._promptInputWrap.hidden = !_0x4fa0fe;
    }
    if (this._promptInputWrap.classList?.contains?.("is-hidden-by-model") !== !_0x4fa0fe) {
      this._promptInputWrap.classList?.toggle("is-hidden-by-model", !_0x4fa0fe);
    }
    if (this.promptEl) {
      const _0x2e6dbb = _0x4fa0fe ? "true" : "false";
      const _0x322ed9 = _0x4fa0fe ? "false" : "true";
      if (this.promptEl.contentEditable !== _0x2e6dbb) {
        this.promptEl.contentEditable = _0x2e6dbb;
      }
      if (this.promptEl.getAttribute?.("aria-hidden") !== _0x322ed9) {
        this.promptEl.setAttribute?.("aria-hidden", _0x322ed9);
      }
      if (!_0x4fa0fe && document.activeElement === this.promptEl) {
        this.promptEl.blur?.();
      }
    }
    return _0x4fa0fe;
  }
  _buildFooterSig(_0x4f609f = this._data) {
    const _0x432c7d = typeof this._isDreaminaVideoNode === "function" && this._isDreaminaVideoNode(_0x4f609f) ? (_0x4f609f.dreaminaRouteMode || "") + "|" + (this._getDreaminaReferenceSummary?.(_0x4f609f)?.signature || "") : "";
    return (_0x4f609f.model || "") + "|" + (_0x4f609f.provider || "") + "|" + (_0x4f609f.rhSpecialMode || "") + "|" + (_0x4f609f.rhBerniniInputMode || "") + "|" + _0x432c7d + "|" + buildUiSchemaVisibilitySignature(_0x4f609f.model, _0x4f609f);
  }
  refreshModelRegistryUi() {
    if (this._rendererDetailsDeferred === true || !this.footerEl) {
      return false;
    }
    this._renderFooter(this.footerEl);
    this._lastFooterSig = this._buildFooterSig(this._data);
    return true;
  }
  _buildRefBarSignatures(_0x499960 = this._data, _0x439682 = null) {
    let _0x2c47e9 = a365_0x168836.getIncomingEdges(this.nodeId);
    if (_0x439682) {
      _0x2c47e9 = _0x2c47e9.filter(_0x306539 => _0x306539?.targetId === this.nodeId);
    }
    const _0x4af971 = readStoreState().nodes || {};
    const _0x43fe5c = _0x2c47e9.map(_0x3b979d => {
      const _0x574e9e = _0x4af971?.[_0x3b979d.sourceId] || null;
      const _0x52670d = typeof this._getRefSourceStateKey === "function" ? this._getRefSourceStateKey(_0x574e9e, _0x3b979d) : "";
      return _0x3b979d.id + ":" + _0x3b979d.sourceId + ":" + (_0x3b979d.refSlot || "") + ":" + (_0x3b979d.sourceMediaKey || "") + ":" + _0x52670d;
    }).join("|");
    const _0x277d46 = _0x439682 ? String(_0x439682.visibilityLayoutKey || _0x439682.visibleSlots?.join("|") || "") : "";
    return {
      inEdges: _0x2c47e9,
      sig: _0x43fe5c,
      refModeSig: (_0x499960?.model || "") + "|" + (_0x499960?.provider || "") + "|" + _0x277d46,
      specialModeSig: String(_0x499960?.rhSpecialMode || ""),
      subtractSubjectSig: String(_0x499960?.rhSubtractSubject || "")
    };
  }
  _syncInitialUpdateSignatures(_0x547720 = this._data) {
    const _0x3a2ac8 = syncVideoNodeFixedInputSummary({
      nodeId: this.nodeId,
      nodeData: _0x547720 || {},
      promptEl: this.promptEl,
      syncStore: false
    });
    const _0x3d1b4e = _0x3a2ac8.nodeData || _0x547720 || {};
    const _0x43f0cd = _0x3a2ac8.fixedInputConfig;
    const _0x102a14 = this._buildRefBarSignatures(_0x3d1b4e, _0x43f0cd);
    const _0x459578 = this._buildFooterSig(_0x3d1b4e);
    const _0x2fa794 = typeof this._getRhVideoAdvancedSchemaNodeData === "function" ? this._getRhVideoAdvancedSchemaNodeData(_0x3d1b4e) : _0x3d1b4e;
    this._data = _0x3d1b4e;
    this._lastVideoViewSig = buildVideoNodeVideoViewSig(_0x3d1b4e);
    this._lastHasInputConnections = _0x102a14.inEdges.length > 0;
    this._lastFooterSig = _0x459578;
    this._lastEdgeSig = _0x102a14.sig;
    this._lastRefModeSig = _0x102a14.refModeSig;
    this._lastSpecialModeSig = _0x102a14.specialModeSig;
    this._lastSubtractSubjectSig = _0x102a14.subtractSubjectSig;
    this._lastPromptUiSig = buildVideoNodePromptUiSig(_0x3d1b4e);
    this._lastPromptBoxSizeSig = buildVideoNodePromptBoxSizeSig(_0x3d1b4e);
    if (_0x3d1b4e.prompt !== undefined) {
      this._lastPromptContentSig = String(_0x3d1b4e.prompt || "");
    }
    this._lastSubmitButtonSig = buildVideoNodeSubmitButtonSig(_0x3d1b4e, _0x102a14.sig, {
      rhCancelInFlight: this._rhCancelInFlight
    });
    this._lastFooterControlSig = buildVideoNodeFooterControlSig(_0x2fa794, _0x459578);
  }
  update(_0x5b99b4) {
    const _0x65d0f7 = () => readStoreState()?.nodes?.[this.nodeId] || _0x5b99b4;
    _0x5b99b4 = _0x65d0f7() || _0x5b99b4;
    if (typeof this._normalizeDreaminaNodeData === "function") {
      this._data = this._normalizeDreaminaNodeData(_0x5b99b4, {
        syncStore: true
      }) || _0x5b99b4;
    } else {
      this._data = _0x5b99b4;
    }
    _0x5b99b4 = _0x65d0f7() || this._data;
    this._data = _0x5b99b4;
    _0x5b99b4 = this._data;
    const _0x1cae24 = createVideoNodeUpdatePerf();
    if (typeof this._syncMutedStateFromNodeData === "function") {
      this._syncMutedStateFromNodeData(_0x5b99b4);
    }
    this._syncNoResultClass();
    if (shouldShowGenerationBusyUi(_0x5b99b4)) {
      this._isGenerating = true;
      if (this.previewEl) {
        startLoading(this.previewEl);
      }
    } else if (isTerminalGenerationUiState(_0x5b99b4)) {
      this._isGenerating = false;
      stopPreviewNodeLoading(this.nodeId);
      if (this.previewEl) {
        stopLoading(this.previewEl);
      }
    }
    _0x1cae24?.mark("state");
    const _0x1b4219 = syncVideoNodeFixedInputSummary({
      nodeId: this.nodeId,
      nodeData: _0x5b99b4,
      promptEl: this.promptEl,
      syncStore: true
    });
    _0x5b99b4 = _0x1b4219.nodeData || _0x5b99b4;
    this._data = _0x5b99b4;
    const _0xa1e95 = _0x1b4219.fixedInputConfig;
    const _0x2c9643 = (_0xa1e95?.slotOrderByType?.video || []).includes("sourceVideo") && (_0xa1e95?.slotOrderByType?.image || []).includes("refImage");
    let _0x4db145 = _0x1b4219.inEdges || a365_0x168836.getIncomingEdges(this.nodeId);
    const _0x5dc0dd = _0x4db145.length > 0;
    const _0x4687f8 = buildVideoNodeVideoViewSig(_0x5b99b4);
    const _0x2dc8e2 = _0x4687f8 !== this._lastVideoViewSig;
    this._lastVideoViewSig = _0x4687f8;
    const _0x3743be = _0x5dc0dd !== this._lastHasInputConnections;
    this._lastHasInputConnections = _0x5dc0dd;
    if (_0x2dc8e2 || _0x3743be) {
      this._loadVideoWhenMediaReady();
    }
    if (typeof this._maybeResumeDreaminaTaskImpl === "function") {
      this._maybeResumeDreaminaTaskImpl();
    }
    if (typeof this._maybeResumeRunningHubTaskImpl === "function") {
      this._maybeResumeRunningHubTaskImpl();
    }
    if (typeof this._maybeResumeAsyncTaskImpl === "function") {
      this._maybeResumeAsyncTaskImpl();
    }
    _0x1cae24?.mark("media-task");
    const _0x21d11d = readStoreState().nodes || {};
    const _0x4863e7 = _0x4db145.map(_0x522ba6 => {
      const _0x50d599 = _0x21d11d?.[_0x522ba6?.sourceId] || null;
      const _0x1f586c = getGenerationRatioMediaSize(_0x50d599, _0x522ba6, {
        includeNodeFrame: true
      });
      return [_0x522ba6?.id, _0x522ba6?.sourceId, _0x522ba6?.refSlot, _0x522ba6?.sourceMediaKey, _0x50d599?._bizRev, _0x50d599?.thumbId, _0x50d599?.mainImageIndex, _0x50d599?.mainVideoIndex, _0x1f586c?.width, _0x1f586c?.height, _0x50d599?.localPath, _0x50d599?.imageUrl, _0x50d599?.videoUrl].map(_0x410631 => _0x410631 ?? "").join(":");
    }).join("|");
    const _0x2805f8 = _0xbdd196 => {
      const _0x12c384 = String(_0xbdd196 || "").trim().toLowerCase();
      return !_0x12c384 || _0x12c384 === "自适应" || _0x12c384 === "auto" || _0x12c384 === "adaptive";
    };
    const _0x3c408e = _0x3e4caf => {
      const _0x2209fc = typeof this._getDreaminaEffectiveNodeData === "function" ? this._getDreaminaEffectiveNodeData(_0x3e4caf || {}) : _0x3e4caf || {};
      const _0x28c0fa = _0x2209fc?.generationParams;
      if (_0x28c0fa && typeof _0x28c0fa === "object" && !Array.isArray(_0x28c0fa) && Object.prototype.hasOwnProperty.call(_0x28c0fa, "aspectRatio")) {
        return _0x28c0fa.aspectRatio;
      } else {
        return _0x2209fc?.aspectRatio;
      }
    };
    if (this._lastAdaptiveEdgeSig !== null && _0x4863e7 !== this._lastAdaptiveEdgeSig) {
      const _0x394778 = _0x3c408e(this._data);
      if (_0x2805f8(_0x394778) && typeof this._runAdaptiveRatio === "function") {
        setTimeout(() => {
          if (readStoreState().nodes[this.nodeId]) {
            this._runAdaptiveRatio();
          }
        }, 50);
      }
    }
    this._lastAdaptiveEdgeSig = _0x4863e7;
    _0x5b99b4 = _0x65d0f7() || this._data || _0x5b99b4;
    this._data = _0x5b99b4;
    const _0x53bb17 = this._buildFooterSig(_0x5b99b4);
    const _0x482fb7 = this._lastFooterSig;
    let _0x43e844 = false;
    if (this._rendererDetailsDeferred !== true && this.footerEl && _0x53bb17 !== _0x482fb7) {
      _0x1cae24?.detail("footerSigFrom", _0x482fb7);
      _0x1cae24?.detail("footerSigTo", _0x53bb17);
      this._lastFooterSig = _0x53bb17;
      this._renderFooter(this.footerEl);
      _0x5b99b4 = _0x65d0f7() || this._data || _0x5b99b4;
      this._data = _0x5b99b4;
      _0x43e844 = true;
    }
    if (_0x43e844) {
      const _0x5327dd = readStoreState().nodes?.[this.nodeId] || this._data || {};
      if (_0x2805f8(_0x3c408e(_0x5327dd)) && typeof this._runAdaptiveRatio === "function") {
        setTimeout(() => {
          if (readStoreState().nodes[this.nodeId]) {
            this._runAdaptiveRatio();
          }
        }, 50);
      }
    }
    _0x1cae24?.mark("footer-render");
    const _0x2357ba = readStoreState().pickConnectMode;
    if (this._placeholderEl) {
      const _0x36471d = this._placeholderEl.querySelector(".placeholder-icon-svg");
      if (_0x36471d) {
        if (_0x2357ba?.active && _0x2357ba.sourceNodeId === this.nodeId) {
          _0x36471d.classList.add("is-pick-connecting");
        } else {
          _0x36471d.classList.remove("is-pick-connecting");
        }
      }
    }
    if (this._rendererDetailsDeferred !== true && document.activeElement !== this.promptEl && _0x5b99b4.prompt !== undefined && String(_0x5b99b4.prompt || "") !== this._lastPromptContentSig) {
      const _0xbb2d26 = sanitizePromptHtml(_0x5b99b4.prompt || "");
      if (this.promptEl.innerHTML !== _0xbb2d26) {
        clearVirtualizedPromptCommit(this);
        this.promptEl.innerHTML = _0xbb2d26;
        this._initPromptPills();
      }
      this._lastPromptContentSig = String(_0x5b99b4.prompt || "");
    }
    const _0x562323 = buildVideoNodePromptUiSig(_0x5b99b4);
    if (_0x562323 !== this._lastPromptUiSig) {
      _0x1cae24?.detail("promptUiSigFrom", this._lastPromptUiSig);
      _0x1cae24?.detail("promptUiSigTo", _0x562323);
      this._lastPromptUiSig = _0x562323;
      if (this._rendererDetailsDeferred !== true) {
        if (typeof this._syncDreaminaPromptPlaceholder === "function") {
          this._syncDreaminaPromptPlaceholder(_0x5b99b4);
        }
        this._syncPromptInputVisibility(_0x5b99b4);
        this._syncGenerationNodeHelpTip();
      }
    }
    if (this._rendererDetailsDeferred !== true) {
      this._syncModelProviderProfileControl();
    }
    const _0x591ef2 = buildVideoNodePromptBoxSizeSig(_0x5b99b4);
    if (_0x591ef2 !== this._lastPromptBoxSizeSig) {
      _0x1cae24?.detail("promptBoxSizeSigFrom", this._lastPromptBoxSizeSig);
      _0x1cae24?.detail("promptBoxSizeSigTo", _0x591ef2);
      this._lastPromptBoxSizeSig = _0x591ef2;
      if (this._rendererDetailsDeferred !== true) {
        this._syncPromptBoxSizeFromData(_0x5b99b4);
      }
    }
    _0x1cae24?.mark("prompt-ui");
    const _0x58236f = this._buildRefBarSignatures(_0x5b99b4, _0xa1e95);
    _0x4db145 = _0x58236f.inEdges;
    const {
      sig: _0x3e94ea,
      refModeSig: _0x4c859e,
      specialModeSig: _0x40367f,
      subtractSubjectSig: _0x5826f9
    } = _0x58236f;
    if (_0x3e94ea !== this._lastEdgeSig || _0x4c859e !== this._lastRefModeSig || _0x40367f !== this._lastSpecialModeSig || _0x5826f9 !== this._lastSubtractSubjectSig) {
      this._lastEdgeSig = _0x3e94ea;
      this._lastRefModeSig = _0x4c859e;
      this._lastSpecialModeSig = _0x40367f;
      this._lastSubtractSubjectSig = _0x5826f9;
      this._renderRefBarWhenMediaReady();
      if (_0x5dc0dd && this._placeholderEl) {
        const _0x23cff9 = hasDisplayableVideoResult(_0x5b99b4);
        const _0x576bad = this._mustRenderTerminalVideoState(_0x5b99b4);
        const _0x57b107 = !_0x23cff9 && !_0x576bad;
        this._placeholderEl.style.display = _0x57b107 ? "flex" : "none";
        this._setVideoOverlaysVisible(_0x23cff9 && !_0x576bad);
      }
      if (_0x2c9643) {
        this._loadVideoWhenMediaReady();
      }
    } else {
      this._syncBtnIconState();
    }
    _0x1cae24?.mark("refbar");
    const _0x46e5ae = buildVideoNodeSubmitButtonSig(_0x5b99b4, _0x3e94ea, {
      rhCancelInFlight: this._rhCancelInFlight
    });
    if (_0x46e5ae !== this._lastSubmitButtonSig || _0x43e844) {
      this._lastSubmitButtonSig = _0x46e5ae;
      this._updateSubmitButtonState();
    }
    const _0x762ece = !!this.footerEl && this._rendererDetailsDeferred !== true;
    const _0x53e00a = _0x762ece && typeof this._getRhVideoAdvancedSchemaNodeData === "function" ? this._getRhVideoAdvancedSchemaNodeData(_0x5b99b4) : _0x5b99b4;
    const _0x35f709 = _0x762ece ? buildVideoNodeFooterControlSig(_0x53e00a, _0x53bb17) : this._lastFooterControlSig;
    if (_0x762ece && (_0x43e844 || _0x35f709 !== this._lastFooterControlSig)) {
      this._lastFooterControlSig = _0x35f709;
      _0x5b99b4 = _0x65d0f7() || this._data || _0x5b99b4;
      this._data = _0x5b99b4;
      const _0x19dd64 = String(_0x5b99b4?.model || "").trim();
      const _0x395f1b = this._isRunninghubWorkflowModel(_0x19dd64, _0x5b99b4?.provider);
      const _0x321ab6 = hasRunningHubVideoWorkflowUiPlacement(_0x19dd64, "videoParams");
      const _0x57a712 = hasRunningHubVideoWorkflowUiPlacement(_0x19dd64, "resolution");
      const _0xd0fefe = _0x395f1b;
      const _0x556867 = typeof this._hasVisibleVideoAdvancedControls === "function" ? this._hasVisibleVideoAdvancedControls(_0x5b99b4) : false;
      const _0x3c3ff0 = isCustomAiAppManifest(resolveCustomAiAppNodeManifest(_0x5b99b4));
      if (hasRunningHubVideoWorkflowUiField(_0x19dd64, "rhMaskExpand")) {
        const _0x4720f9 = _0x5b99b4?.rhMaskExpandTouched === true;
        const _0x241d1e = Number(_0x5b99b4?.rhMaskExpand);
        if (Number.isFinite(_0x241d1e) && _0x241d1e === 0 && !_0x4720f9) {
          a365_0x168836.updateNodeData(this.nodeId, {
            rhMaskExpand: 25
          });
        }
      }
      const _0x5b8733 = this.footerEl.querySelector(".rh-adv2-btn");
      if (_0x5b8733) {
        _0x5b8733.hidden = !_0x556867 || _0x3c3ff0;
        _0x5b8733.style.display = "";
      }
      const _0x2a846e = this.footerEl.querySelector(".ui-schema-instance-slot");
      if (_0x2a846e) {
        _0x2a846e.style.display = _0xd0fefe ? "" : "none";
      }
      syncModelUiSchemaControls(this.footerEl, _0x53e00a);
      const _0x1f8a3a = this.footerEl.querySelector(".img-ratio-label");
      if (_0x1f8a3a && !_0x321ab6 && !_0x57a712) {
        if (typeof this._isDreaminaVideoNode === "function" && this._isDreaminaVideoNode(_0x5b99b4) && typeof this._getDreaminaRatioDisplayState === "function") {
          const _0x5dddd4 = this._getDreaminaRatioDisplayState(_0x5b99b4);
          _0x1f8a3a.textContent = _0x5dddd4?.ratioLabelText || formatVideoNodeRatioResolutionLabel(_0x5b99b4);
          const _0x15891d = this.footerEl.querySelector(".img-ratio-icon-slot");
          if (_0x15891d && typeof this._getRatioIconHTML === "function") {
            _0x15891d.innerHTML = this._getRatioIconHTML(_0x5dddd4?.ratioIconLabel || _0x5b99b4?.aspectRatio || "自适应");
          }
        } else {
          _0x1f8a3a.textContent = formatVideoNodeRatioResolutionLabel(_0x5b99b4);
        }
      }
      const _0x505505 = this.footerEl.querySelector(".rh-vram-adv-panel");
      if (_0x505505 && !_0x556867) {
        _0x505505.classList.remove("show");
      }
    }
    _0x1cae24?.mark("controls");
    this._lastUpdatePerfBreakdown = _0x1cae24?.finish() || null;
  }
  _syncBtnIconStateImpl() {
    const _0x3da844 = readStoreState().pickConnectMode;
    const _0x32ad2c = this.refBarEl?.querySelector(".btn-icon");
    if (!_0x32ad2c) {
      return;
    }
    if (_0x3da844?.active && _0x3da844.sourceNodeId === this.nodeId) {
      _0x32ad2c.style.opacity = "0";
      _0x32ad2c.style.transform = "scale(0.4)";
    } else {
      _0x32ad2c.style.opacity = "1";
      _0x32ad2c.style.transform = "scale(1)";
    }
  }
  _checkAtTrigger(_0x504a18) {
    return _checkAtTrigger(this, _0x504a18);
  }
  _populateMentionMenu(_0x477231, _0x8b0c81, _0x4520e0, _0xbf8c1 = null, _0x3efa91 = "", _0x4dc533 = -1) {
    return _populateMentionMenu(this, {
      x: _0x477231,
      y: _0x8b0c81,
      triggerRange: _0x4520e0,
      pillToEdit: _0xbf8c1,
      query: _0x3efa91,
      atIndex: _0x4dc533
    });
  }
  _insertMentionPill(_0x30682c, _0x481c6f, _0x21cce3, _0x30bfb2 = -1) {
    return _insertMentionPill(this, {
      label: _0x30682c,
      nodeId: _0x481c6f,
      triggerRange: _0x21cce3,
      atIndex: _0x30bfb2
    });
  }
  _handlePillKeyboard(_0x30d265) {
    return _handlePillKeyboard(this, _0x30d265);
  }
  _getGenerationNodeHelpText() {
    const _0x42ca2a = String(this._data?.model || "").trim();
    return getGenerationNodeHelpTooltip({
      kind: "video",
      key: _0x42ca2a,
      model: _0x42ca2a,
      label: getDisplayModelName(_0x42ca2a),
      nodeData: this._data || {}
    });
  }
  _ensureGenerationNodeHelpTip() {
    if (this._generationNodeHelpTip || !this._promptPanel) {
      return this._generationNodeHelpTip;
    }
    this._generationNodeHelpTip = createGenerationNodeHelpTipController({
      panel: this._promptPanel,
      getHelpText: () => this._getGenerationNodeHelpText(),
      ariaLabel: aigenVideoNodeText("help.ariaLabel")
    });
    return this._generationNodeHelpTip;
  }
  _syncGenerationNodeHelpTip() {
    this._ensureGenerationNodeHelpTip()?.sync();
  }
  _ensureModelProviderProfileControl() {
    if (this._modelProviderProfileControl || !this._promptPanel) {
      return this._modelProviderProfileControl;
    }
    this._modelProviderProfileControl = createModelProviderProfileControl({
      panel: this._promptPanel,
      getNodeData: () => readStoreState().nodes?.[this.nodeId] || this._data || {},
      onChange: _0x3914d9 => a365_0x168836.updateNodeData(this.nodeId, _0x3914d9)
    });
    return this._modelProviderProfileControl;
  }
  _syncModelProviderProfileControl() {
    this._ensureModelProviderProfileControl()?.sync();
  }
  prepareRendererVisibleVideoPreview() {
    this._rendererEagerVideoPreview = false;
    return false;
  }
  adoptRendererVisibleVideoSurface(_0x280a85) {
    if (!_0x280a85?.videoEl || _0x280a85.videoEl.isConnected === false || this.previewEl?.isConnected === false) {
      return false;
    }
    this._rendererVisibleVideoSurface = _0x280a85;
    return true;
  }
  hydrateDeferredMedia() {
    if (this._rendererMediaDeferred !== true) {
      return;
    }
    this._rendererMediaDeferred = false;
    this._rendererEagerVideoPreview = false;
    this._data = readStoreState()?.nodes?.[this.nodeId] || this._data;
    this._deferredVideoViewRefreshPending = false;
    this._loadAndDisplayVideo();
    this._schedulePreviewVideoOverlays();
    if (this._renderRefBarPendingWhenVisible && this._rendererDetailsDeferred !== true) {
      this._renderRefBarPendingWhenVisible = false;
      this._renderRefBar();
    }
    this._updateSubmitButtonState();
  }
  _hydrateDeferredToolbarEvents() {
    if (!this._deferredToolbarEl && this._deferredToolbarMarkupPending === true && this._root?.insertAdjacentHTML) {
      this._root.insertAdjacentHTML("afterbegin", VIDEO_TOOLBAR_HTML);
      this._deferredToolbarEl = this._root.querySelector?.(".node-floating-toolbar");
      this._deferredToolbarMarkupPending = false;
    }
    return hydrateDeferredVideoNodeToolbar(this, bindVideoToolbarEvents);
  }
  hydrateDeferredDetails() {
    hydrateVideoNodeDeferredDetails(this, {
      readStoreState: readStoreState,
      sanitizePromptHtml: sanitizePromptHtml
    });
  }
  unmount() {
    this._videoRenderEpoch += 1;
    this._videoSourceAttachToken += 1;
    this._autoPlayToken += 1;
    this._isHovered = false;
    this._previewHoverActivationPending = false;
    this._hoverPlaybackLifecycle?.dispose?.();
    this._hoverPlaybackResumeState = null;
    this._deferredToolbarEl = null;
    this._deferredToolbarMarkupPending = false;
    this._releaseLocalVideoPlaybackObjectUrl?.();
    const _0x3b15f4 = shouldPreserveGenerationTaskOnUnmount(this.nodeId);
    this._flushPromptHtmlCommit?.();
    this._unsubscribeLocale?.();
    this._unsubscribeLocale = null;
    this._assetMentionRegistryUnsubscribe?.();
    this._assetMentionRegistryUnsubscribe = null;
    this._assetMentionRegistryRefreshPending = false;
    if (!_0x3b15f4 && typeof this._stopDreaminaRecovery === "function") {
      this._stopDreaminaRecovery(false);
    }
    if (!_0x3b15f4 && typeof this._stopRunningHubRecovery === "function") {
      this._stopRunningHubRecovery(false);
    }
    if (!_0x3b15f4 && typeof this._stopAsyncRecovery === "function") {
      this._stopAsyncRecovery(false);
    }
    if (typeof this._promptResizeCleanup === "function") {
      this._promptResizeCleanup();
      this._promptResizeCleanup = null;
    }
    this._generationNodeHelpTip?.remove();
    this._generationNodeHelpTip = null;
    this._promptPresetTrigger?.remove();
    this._promptPresetTrigger = null;
    this._modelProviderProfileControl?.remove();
    this._modelProviderProfileControl = null;
    this._uiSchemaCleanup?.();
    this._uiSchemaCleanup = null;
    this._footerControllerCleanup?.();
    this._footerControllerCleanup = null;
    this._isPromptBoxResizing = false;
    this._blobResolveToken++;
    if (this._videoClickTimer) {
      clearTimeout(this._videoClickTimer);
      this._videoClickTimer = null;
    }
    if (this._centerIndicatorTimer) {
      clearTimeout(this._centerIndicatorTimer);
      this._centerIndicatorTimer = null;
    }
    this._cancelVideoProgressLoop?.();
    this._isManualLoopPlayback = false;
    try {
      this.previewEl?.querySelectorAll("video").forEach(_0x68d9a0 => {
        try {
          _0x68d9a0.pause();
        } catch {}
        _0x68d9a0.removeAttribute("src");
        _0x68d9a0.load?.();
      });
    } catch {}
    for (const _0x536acc of this._cachedVideoUrls.values()) {
      if (_0x536acc && String(_0x536acc).startsWith("blob:")) {
        try {
          URL.revokeObjectURL(_0x536acc);
        } catch {}
      }
    }
    this._cachedVideoUrls.clear();
    const _0x9e9f9 = [this._fixedSlotRefThumbObjectUrls, this._refThumbObjectUrls];
    for (const _0x4d4f2f of _0x9e9f9) {
      if (!_0x4d4f2f || typeof _0x4d4f2f.entries !== "function") {
        continue;
      }
      for (const _0x1c0a27 of _0x4d4f2f.values()) {
        if (_0x1c0a27 && String(_0x1c0a27).startsWith("blob:")) {
          try {
            URL.revokeObjectURL(_0x1c0a27);
          } catch {}
        }
      }
      try {
        _0x4d4f2f.clear();
      } catch {}
    }
    this._videoThumbPending.clear();
  }
}
const videoNodeReferenceInputModule = createVideoNodeReferenceInputModule(VIDEO_NODE_MODULE_DEPS);
const videoNodeParameterPanelModule = createVideoNodeParameterPanelModule(VIDEO_NODE_MODULE_DEPS);
const videoNodeTaskOrchestrationModule = createVideoNodeTaskOrchestrationModule(VIDEO_NODE_MODULE_DEPS);
const videoNodeResultRenderModule = createVideoNodeResultRenderModule(VIDEO_NODE_MODULE_DEPS);
const videoNodePreviewControlsModule = createVideoNodePreviewControlsModule(VIDEO_NODE_MODULE_DEPS);
function applyClassPrototypeMethods(_0x4c36ee, _0x67660e) {
  if (!_0x67660e) {
    return;
  }
  const _0x1a178b = Object.getOwnPropertyDescriptors(_0x67660e);
  delete _0x1a178b.constructor;
  Object.defineProperties(_0x4c36ee, _0x1a178b);
}
applyClassPrototypeMethods(AIGenVideoNode.prototype, videoNodeReferenceInputModule);
applyClassPrototypeMethods(AIGenVideoNode.prototype, videoNodeParameterPanelModule);
applyClassPrototypeMethods(AIGenVideoNode.prototype, videoNodeTaskOrchestrationModule);
applyClassPrototypeMethods(AIGenVideoNode.prototype, videoNodeResultRenderModule);
applyClassPrototypeMethods(AIGenVideoNode.prototype, videoNodePreviewControlsModule);
Object.assign(AIGenVideoNode.prototype, videoUiRenderMixin, videoStateSyncMixin, videoTaskOrchestrationMixin);