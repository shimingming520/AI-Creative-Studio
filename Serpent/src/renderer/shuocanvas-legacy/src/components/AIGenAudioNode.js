import a293_0x6e2506 from "../core/stores/appStore.js";
import { shouldPreserveGenerationTaskOnUnmount } from "../core/generationTaskRuntime.js";
import { onLocaleChange, t } from "../i18n/index.js";
import { buildGenerateAudioRequest, cancelRunningHubAudioTask, generateAudio, resumeRunningHubAudioTask } from "../../api/aiAudioApi.js";
import { ensureConfig, getProviderConfig } from "../../api/configApi.js";
import { saveRemoteAudioLocallyDetailed, uploadFile } from "../modules/project.js";
import { getNodeDefaultSize } from "../services/fileService.js";
import { openExternalLink } from "../services/externalLinkService.js";
import { subscribeAssetMentionRegistry } from "../modules/assetMentionRegistry.js";
import { removeCoveredAssetInputRefForConnection } from "../modules/promptAssetInputOverride.js";
import { cancelAudioSeparationTaskForNode, getRunningAudioSeparationTaskForNode, runAudioSeparationFromNode } from "../modules/AudioSeparationController.js";
import { bindRunningHubToolbarTaskButton } from "./nodeToolbar/runningHubToolbarTaskButton.js";
import { _handlePillHover, _handlePillOut, _checkAtTrigger, _handleMentionMenuKeyboard, _handlePillKeyboard, _rehydratePromptPills, _syncEdgesOrderFromPills, _syncPillLabels, getAssetInputRefsFromPromptAndNode, getPromptAssetInputRefsFromNode, removeAssetMentionPillFromPrompt, removePromptAssetInputRefFromNode, insertPresetPromptIntoEditor, previewPresetPromptInEditor, resolvePresetPromptTextWithTextRefs, shouldUsePromptPreviewForPreset, flushPromptHtmlCommit, handlePromptPaste, handlePromptSelectAll, schedulePromptHtmlCommit, shouldSubmitPromptByKeyboard } from "../modules/nodePromptShared.js";
import { isPreviewModeEnabled, isPreviewNodeLoading, startPreviewNodeLoading, stopPreviewNodeLoading, syncPreviewNodeLoading } from "../modules/previewMode.js";
import { createPreviewGenerateButtonCallbacks, resetGenerateButtonIdleUi, setGenerateButtonCancellableUi, setGenerateButtonLoadingUi } from "../modules/previewGenerateButtonUi.js";
import { AUDIO_TOOLBAR_HTML } from "./NodeToolbarConfig.js";
import { startLoading, stopLoading } from "../modules/loadingOverlay.js";
import a293_0x360103 from "../modules/AudioClipController.js";
import { findAvailablePosition, generateId } from "../core/math.js";
import { getNodeSpawnPrefs } from "../modules/nodeSpawn.js";
import { ensureThumbDecoded, revealRefThumbMedia } from "../modules/refThumbMediaReveal.js";
import { createReferenceInputThumbnailHtml, resolveReferenceVideoThumbnail } from "../modules/referenceInputThumbnail.js";
import { escapeInputSlotLabelHtml, formatInputSlotLabelHtml } from "./shared/inputSlotLabelFormatter.js";
import { checkSlashTrigger, handleSlashKeyboardNavigation } from "../modules/slashMenu.js";
import { shouldSkipPromptTriggerForBulkInput } from "../modules/promptTriggerComposition.js";
import { clearVirtualizedPromptCommit, isVirtualizedPromptEditorCurrent } from "../modules/promptPasteVirtualization.js";
import { activateMenuKeyboard } from "../modules/floatingMenuKeyboard.js";
import { bindRefThumbHoverPreview } from "../modules/refThumbHoverPreview.js";
import { bindRefThumbFixedSlotDrag } from "../modules/refThumbDragController.js";
import { deferWaveformPathUntilAudioReady, getWaveformBarsPathFromPersistedUrl, getWaveformBarsPathFromUrl } from "../utils/audioWaveform.js";
import { createAudioPlaybackProgressController } from "../utils/audioPlaybackProgress.js";
import { loadAudioDurationMetadataSec, normalizeAudioDurationSec, pickAudioDurationSec } from "../services/audioMetadataService.js";
import { beginAudioPlayback, registerAudioPlaybackClient } from "../modules/audioPlaybackCoordinator.js";
import { sanitizePromptHtml } from "../utils/dom.js";
import { GENERATION_HISTORY_EVENT } from "../modules/generationHistoryAssets.js";
import { showProviderApiKeyMissingToast, showProviderApiKeyMissingToastForError } from "../modules/providerApiKeyMissingToast.js";
import { applyModelCredentialButtonState, guardModelGenerationCredentials, resetModelCredentialButtonState } from "../modules/modelCredentialUi.js";
import { createModelProviderProfileControl } from "./shared/modelProviderProfileControl.js";
import { normalizeRunningHubModelApiProfileId } from "../modules/runningHubProviderProfiles.js";
import { applyPromptBoxHeight, getPromptBoxHeightBounds, normalizePromptBoxHeight } from "./promptBoxResize.js";
import { buildCanvasLocalVideoFields, resolveCanvasAudioUrl, resolveCanvasVideoUrl } from "../services/canvasMediaLocalService.js";
import { attachMediaElementPlaybackSource, clearDesktopMediaPlaybackSourceMetadata, getMediaElementCurrentSource, getMediaElementPlaybackSourceKey, isMediaElementPlaybackSource } from "../services/desktopMediaBlobSource.js";
import { localPathToUrl, normalizeLocalPath, pickResultLocalPath } from "../utils/localMediaPath.js";
import { DEBUG_WRENCH_ICON_HTML, formatFinalApiDebugRequest } from "../utils/debugRequestPreview.js";
import { createPromptAttachmentButtonHTML } from "./refAttachmentButton.js";
import { getModelManifest, RH_AUDIO_ADVANCED_VOICE_CLONE_MODEL_ID } from "../manifests/index.js";
import { isVipModel as a293_0x23ad6b, resolveVipGateModelId } from "../modules/subscriptionAccess.js";
import { buildAudioWorkflowItems } from "./audio-node/audioModelMenuHelpers.js";
import { buildAudioWorkflowFooterHtml, isRunningHubAudioWorkflowItem } from "./audio-node/audioFooterSchemaSlots.js";
import { isCustomAiAppManifest } from "./shared/rhAiAppNodeBehavior.js";
import { bindAudioWorkflowSchemaSlotControls, closeAudioWorkflowAdvancedPanel, collectAudioWorkflowSchemaSlotElements, syncAudioWorkflowSchemaSlots } from "./audio-node/audioWorkflowSchemaSlotSync.js";
import { buildAudioWorkflowDefaultSyncPatch, buildAudioWorkflowSelectionPatch, getAudioWorkflowUiSchemaField } from "./audio-node/audioWorkflowSelectionPatch.js";
import { buildAudioGenerationResultPatch } from "./audio-node/audioGenerationResultRenderer.js";
import { MULTI_RESULT_BACKPLATE_CLASS, MULTI_RESULT_STACK_WRAP_CLASS, buildMultiResultBackplateItems, buildMultiResultCollapsedFrame, buildMultiResultExpandedSlotMap, clearMultiResultStackClasses, createMultiResultBackplates, syncMultiResultStackClasses } from "./aigenImage/multiResultStackBackplates.js";
import { getAudioWorkflowInputLimit, getAudioWorkflowSlots } from "./audio-node/audioWorkflowRefSlots.js";
import { buildAudioWorkflowInputPlan } from "./audio-node/audioWorkflowInputPlan.js";
import { bindAudioDownloadAction } from "./nodeToolbar/audioActions/downloadAction.js";
import { bindAudioVoiceStudioAction } from "./nodeToolbar/audioActions/voiceStudioAction.js";
import { bindPreviewUploadToolbarAction } from "../modules/previewUploadEntry.js";
import { bindNodeFooterController, bindNodeModelMenuTrigger } from "./shared/nodeFooterControls.js";
import { createGenerationNodeHelpTipController, getGenerationNodeHelpTooltip } from "./generationNodeHelpTip.js";
import { createPromptPresetTriggerController } from "./promptPresetTrigger.js";
import { getTaskMessage, resolveGenerationButtonMode, shouldAllowCancel, shouldShowGenerationBusyUi } from "../core/generationTaskUiState.js";
import { createAudioNodeTaskOrchestration } from "./audio-node/taskOrchestrationModule.js";
import { shouldDeferRendererDetailsOnMount, shouldDeferRendererMediaOnMount } from "../core/rendererDeferredMedia.js";
const WAVE_PATH = "M10,40 L10,40 M20,20 L20,60 M30,25 L30,55 M40,30 L40,50 M50,22 L50,58 M60,28 L60,52 M70,24 L70,56 M80,20 L80,60 M90,26 L90,54 M100,22 L100,58 M110,30 L110,50 M120,15 L120,65 M130,35 L130,45 M140,30 L140,50 M150,40 L150,40 M160,30 L160,50 M170,22 L170,58 M180,28 L180,52 M190,24 L190,56";
function buildAudioPlaceholderSvg({
  width = 44,
  height = 44
} = {}) {
  return "<svg class=\"placeholder-icon-svg\" width=\"" + width + "\" height=\"" + height + "\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.2\">\n    <path d=\"M9 18V5l12-2v13\"/>\n    <circle cx=\"6\" cy=\"18\" r=\"3\"/>\n    <circle cx=\"18\" cy=\"16\" r=\"3\"/>\n  </svg>";
}
const ADVANCED_VOICE_CLONE_WORKFLOW_KEY = RH_AUDIO_ADVANCED_VOICE_CLONE_MODEL_ID;
const ADVANCED_VOICE_CLONE_MIN_SECONDS = 3;
const ADVANCED_VOICE_CLONE_MAX_SECONDS = 15.05;
function aigenAudioText(_0x5a7e76, _0xa58a48 = {}) {
  return t("aigenAudioNode." + _0x5a7e76, _0xa58a48);
}
const AUDIO_WORKFLOW_VALIDATORS = Object.freeze({
  indextts2_clone(_0x49f718) {
    const _0x1405be = Array.isArray(_0x49f718?.audioRefs) ? _0x49f718.audioRefs : [];
    const _0x414664 = _0x1405be.some(_0x502f09 => String(_0x502f09?.refSlot || "") === "audioRef");
    if (!_0x414664) {
      return aigenAudioText("validation.referenceVoiceRequired");
    }
    const _0x45ede1 = _0x1405be.some(_0x196d07 => String(_0x196d07?.refSlot || "") === "audio2");
    if (!_0x45ede1 && !String(_0x49f718?.prompt || "").trim()) {
      return aigenAudioText("validation.promptRequired");
    }
    return "";
  },
  voice_convert(_0x3e353d) {
    const _0x56d289 = Array.isArray(_0x3e353d?.audioRefs) ? _0x3e353d.audioRefs : [];
    const _0x28e4fc = _0x56d289.some(_0xddb244 => String(_0xddb244?.refSlot || "") === "audioRef");
    const _0x40f1d5 = _0x56d289.some(_0x3b3ea5 => String(_0x3b3ea5?.refSlot || "") === "audioTarget");
    if (!_0x28e4fc || !_0x40f1d5) {
      return aigenAudioText("validation.voiceConvertRefsRequired");
    }
    return "";
  },
  [ADVANCED_VOICE_CLONE_WORKFLOW_KEY](_0x49425a) {
    if (!String(_0x49425a?.prompt || "").trim()) {
      return aigenAudioText("validation.promptRequired");
    }
    return "";
  }
});
const AUDIO_WORKFLOW_ITEMS = buildAudioWorkflowItems(AUDIO_WORKFLOW_VALIDATORS);
const AUDIO_WORKFLOW_MAP = new Map(AUDIO_WORKFLOW_ITEMS.map(_0x276274 => [_0x276274.key, _0x276274]));
const AUDIO_WORKFLOW_LABEL_MAP = new Map(AUDIO_WORKFLOW_ITEMS.map(_0x35752c => [_0x35752c.label, _0x35752c.key]));
export function doesAudioWorkflowAcceptTextInput(_0x146bdf = "") {
  const _0x21342a = getModelManifest(String(_0x146bdf || "").trim());
  const _0x25d110 = _0x21342a?.inputSlots?.allowedKinds;
  if (!Array.isArray(_0x25d110)) {
    return true;
  }
  return _0x25d110.map(_0x134d2e => String(_0x134d2e || "").trim()).includes("text");
}
function resolveAudioWorkflowPromptPlaceholder(_0x8fe21a = "") {
  const _0x241e1b = getModelManifest(String(_0x8fe21a || "").trim());
  return String(_0x241e1b?.prompt?.placeholder || "").trim() || aigenAudioText("prompt.placeholder");
}
function syncAudioPromptPlaceholder(_0x3b986a, _0x5c68a9 = "") {
  if (!_0x3b986a) {
    return;
  }
  const _0x43edd7 = resolveAudioWorkflowPromptPlaceholder(_0x5c68a9);
  if (_0x3b986a.dataset) {
    _0x3b986a.dataset.placeholder = _0x43edd7;
    return;
  }
  _0x3b986a.setAttribute?.("data-placeholder", _0x43edd7);
}
const TEXT_INPUT_TYPES = new Set(["source-text", "text", "ai-text", "custom-ai-text"]);
const AUDIO_INPUT_TYPES = new Set(["source-audio", "audio", "ai-audio"]);
const AUDIO_PLAY_LOADING_DEADLINE_MS = 5000;
const VIDEO_INPUT_TYPES = new Set(["source-video", "video", "ai-video"]);
const AUDIO_RESULT_WIDTH = 420;
const AUDIO_RESULT_HEIGHT = 180;
const AUDIO_RESULT_RATIO = AUDIO_RESULT_WIDTH / AUDIO_RESULT_HEIGHT;
const getStoreSnapshot = () => typeof a293_0x6e2506.getStateRaw === "function" ? a293_0x6e2506.getStateRaw() : a293_0x6e2506.getState();
function getWorkflowGateModelId(_0x589a61) {
  if (!a293_0x23ad6b(_0x589a61, "runninghubwf")) {
    return "";
  }
  return resolveVipGateModelId(_0x589a61, "runninghubwf");
}
function escapeAudioWorkflowIconText(_0x2d8184) {
  return String(_0x2d8184 ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
function createDynamicWorkflowItemFromManifest(_0xa1a40c) {
  const _0x2fb3b9 = String(_0xa1a40c || "").trim();
  if (!_0x2fb3b9) {
    return null;
  }
  const _0x2dd27e = getModelManifest(_0x2fb3b9);
  const _0x50c684 = _0x2dd27e?.extensions?.customProvider;
  const _0x2c51d1 = _0x2dd27e?.extensions?.audioMenu || {};
  if (!_0x2dd27e || _0x2dd27e.kind !== "audio" || !["workflow", "modelApi"].includes(_0x2dd27e.adapterType) || _0x2dd27e.provider !== "runninghubwf" && !isCustomAiAppManifest(_0x2dd27e) && !_0x50c684) {
    return null;
  }
  return Object.freeze({
    key: _0x2dd27e.modelId,
    label: _0x2c51d1.label || _0x2dd27e.displayName || _0x2dd27e.modelId,
    subtitle: _0x2c51d1.subtitle || _0x2dd27e.description || "",
    icon: _0x2dd27e.icon || "images/RH.png",
    iconAlt: "runninghub",
    iconHtml: _0x2c51d1.iconKind === "customProviderBadge" ? "<div class=\"node-menu-icon node-menu-icon-badge\">" + escapeAudioWorkflowIconText(String(_0x50c684?.badge || "CP").slice(0, 2)) + "</div>" : "",
    provider: _0x2dd27e.provider,
    adapterType: _0x2dd27e.adapterType,
    executionId: _0x2dd27e.executionId || "",
    async: _0x2dd27e.async === true,
    cancellable: _0x2dd27e.cancellable === true,
    vip: _0x2dd27e.vip === true,
    group: isCustomAiAppManifest(_0x2dd27e) ? "rhAiApp" : _0x2c51d1.group || "runninghubWorkflow",
    validate: () => ""
  });
}
function getWorkflowByKey(_0x42f397) {
  const _0x2ce85b = String(_0x42f397 || "").trim();
  return AUDIO_WORKFLOW_MAP.get(_0x2ce85b) || createDynamicWorkflowItemFromManifest(_0x2ce85b);
}
function resolveWorkflowKeyFromNodeData(_0x5906e8 = {}) {
  const _0x5ab0b9 = [_0x5906e8.audioWorkflowKey, _0x5906e8.model, _0x5906e8.audioWorkflowLabel].map(_0x1dcb5b => String(_0x1dcb5b || "").trim());
  for (const _0x1414c6 of _0x5ab0b9) {
    if (!_0x1414c6) {
      continue;
    }
    const _0xd308b8 = (AUDIO_WORKFLOW_MAP.has(_0x1414c6) ? _0x1414c6 : "") || AUDIO_WORKFLOW_LABEL_MAP.get(_0x1414c6) || "";
    if (_0xd308b8) {
      return _0xd308b8;
    }
    const _0x42c7e6 = createDynamicWorkflowItemFromManifest(_0x1414c6);
    if (_0x42c7e6?.key) {
      return _0x42c7e6.key;
    }
  }
  return "";
}
function getDefaultWorkflow() {
  return AUDIO_WORKFLOW_ITEMS[0];
}
export { isRunningHubAudioWorkflowItem };
function getPlainGenerationParams(_0x397803) {
  if (_0x397803 && typeof _0x397803 === "object" && !Array.isArray(_0x397803)) {
    return {
      ..._0x397803
    };
  } else {
    return {};
  }
}
function resolveWorkflowSchemaParam(_0x455d6d, _0x487ee4, _0x9bab93) {
  const _0x456dba = getAudioWorkflowUiSchemaField(_0x487ee4, _0x9bab93);
  if (!_0x456dba) {
    throw new Error("RunningHub audio manifest " + _0x487ee4 + " missing " + _0x9bab93);
  }
  if (_0x456dba.defaultValue === undefined) {
    throw new Error("RunningHub audio manifest " + _0x487ee4 + " missing " + _0x9bab93 + " defaultValue");
  }
  const _0x50085a = getPlainGenerationParams(_0x455d6d?.generationParams);
  const _0x2954bc = Object.prototype.hasOwnProperty.call(_0x50085a, _0x9bab93) ? _0x50085a[_0x9bab93] : _0x456dba.defaultValue;
  if (_0x2954bc === undefined || _0x2954bc === null || String(_0x2954bc).trim() === "") {
    throw new Error("RunningHub audio manifest " + _0x487ee4 + " missing " + _0x9bab93);
  }
  return _0x2954bc;
}
function normalizePromptForBackend(_0x16594e, _0x2517b9) {
  if (!doesAudioWorkflowAcceptTextInput(_0x16594e)) {
    return "";
  }
  const _0x58f166 = String(_0x2517b9 || "").trim();
  if (_0x16594e !== ADVANCED_VOICE_CLONE_WORKFLOW_KEY) {
    return _0x58f166;
  }
  return _0x58f166.replace(/(^|\s+)@?音频1\s*[:：]?\s*/g, "$1[speaker_1]: ").replace(/(^|\s+)@?音频2\s*[:：]?\s*/g, "$1[speaker_2]: ").replace(/\s+(\[speaker_[12]\]:)/g, "\n$1").trim();
}
function toLocalAssetUrl(_0x513fa3) {
  return localPathToUrl(_0x513fa3);
}
function isLikelyImageUrl(_0x95285f) {
  const _0x35590e = String(_0x95285f || "").trim().toLowerCase();
  if (!_0x35590e) {
    return false;
  }
  if (_0x35590e.startsWith("data:image/")) {
    return true;
  }
  return /\.(png|jpe?g|webp|gif|bmp|svg|avif)(\?|#|$)/i.test(_0x35590e);
}
function localUrlFromPath(_0xe6e0d5) {
  return localPathToUrl(_0xe6e0d5);
}
function normalizeAudioRemoteUrl(_0x13e849) {
  const _0x4021b5 = String(_0x13e849 || "").trim();
  if (!_0x4021b5) {
    return "";
  }
  if (_0x4021b5.startsWith("/")) {
    return _0x4021b5;
  }
  if (/^data:/i.test(_0x4021b5)) {
    return _0x4021b5;
  }
  if (/^blob:/i.test(_0x4021b5)) {
    return _0x4021b5;
  }
  if (_0x4021b5.startsWith("//")) {
    return "https:" + _0x4021b5;
  }
  if (/^https?:\/\//i.test(_0x4021b5)) {
    return _0x4021b5;
  }
  return "https://" + _0x4021b5.replace(/^\/+/, "");
}
export class AIGenAudioNode {
  constructor(_0x1af557) {
    this._data = _0x1af557;
    this.nodeId = _0x1af557.id;
    this.previewEl = null;
    this.audioEl = null;
    this._placeholderEl = null;
    this.refBarEl = null;
    this.promptEl = null;
    this.btnEl = null;
    this.modelWrap = null;
    this._currentSrc = null;
    this._audioLoadToken = 0;
    this._audioLoadInFlightSource = "";
    this._audioLoadInFlightPreload = "";
    this._lastEdgeSig = null;
    this._isGenerating = false;
    this._modelMenu = null;
    this._runninghubSubmenu = null;
    this._modelLabelEl = null;
    this._workflowSchemaSlotElements = null;
    this._lastRenderedWorkflowKey = "";
    this._docClickHandler = null;
    this._submenuCloseTimer = null;
    this._unbindRefThumbHoverPreview = null;
    this._attachBtnIcon = null;
    this._audioRefUploadInput = null;
    this._audioRefUploadSlot = "";
    this._audioRefUploadAnchorNodeId = "";
    this._lastRefMediaSig = "";
    this._lastWorkflowKey = "";
    this._refBarWorkflowKey = "";
    this._speedIdx = 0;
    this._audioCard = null;
    this._audioMainSurface = null;
    this._audioMultiResultsContainer = null;
    this._audioMultiStackWrap = null;
    this._audioMultiBackdropWrap = null;
    this._audioMultiToggleBtn = null;
    this._audioMultiBackplateEls = [];
    this._lastAudioResultsKeyStr = "";
    this._lastMainAudioIndex = 0;
    this._lastIsAudiosExpanded = false;
    this._waveBgEl = null;
    this._wavePlayed = null;
    this._progressLine = null;
    this._bar = null;
    this._controlsEl = null;
    this._playBtn = null;
    this._timeEl = null;
    this._waveBgPath = null;
    this._waveFgPath = null;
    this._waveToken = 0;
    this._cancelDeferredWaveform = null;
    this._statusOverlayEl = null;
    this._isSeeking = false;
    this._progressController = null;
    this._audioDurationProbeToken = 0;
    this._rendererAudioWarmupPreload = "";
    this._promptPanel = null;
    this._promptInputWrap = null;
    this._isPromptBoxResizing = false;
    this._promptResizeHandle = false;
    this._promptResizeCleanup = null;
    this._rhCancelInFlight = false;
    this._assetMentionRegistryUnsubscribe = null;
    this._assetMentionRegistryRefreshPending = false;
    this._vipInstallId = "";
    this._vipSelectionRetryInProgress = false;
    this._generationNodeHelpTip = null;
    this._modelProviderProfileControl = null;
    this._uiSchemaCleanup = null;
    this._footerControllerCleanup = null;
    this._unsubscribeLocale = null;
    this.footerEl = null;
    this._rendererDetailsDeferred = shouldDeferRendererDetailsOnMount(_0x1af557);
    this._rendererMediaDeferred = shouldDeferRendererMediaOnMount(_0x1af557);
    this._audioTaskOrchestration = createAudioNodeTaskOrchestration({
      nodeId: this.nodeId,
      store: a293_0x6e2506,
      api: {
        generateAudio: generateAudio,
        resumeRunningHubAudioTask: resumeRunningHubAudioTask,
        cancelRunningHubAudioTask: cancelRunningHubAudioTask
      },
      ensureConfig: ensureConfig,
      getProviderConfig: getProviderConfig,
      buildResultPatch: (_0x312e19, _0x4ef116) => this._buildAudioResultPatch(_0x312e19, _0x4ef116),
      afterResultCommit: (_0x1676a9, _0x3e6474) => this._applyAudioResultProjection(_0x1676a9, _0x3e6474),
      persistTaskState: () => this._persistRunningHubResumeCache(),
      setBusyState: ({
        isGenerating: _0x2376d4,
        cancelInFlight: _0x144865
      }) => {
        this._isGenerating = _0x2376d4;
        this._rhCancelInFlight = _0x144865;
        this._setGeneratingUi();
      },
      setLoading: _0x2eb00c => {
        if (!this.previewEl) {
          return;
        }
        if (_0x2eb00c) {
          startLoading(this.previewEl);
        } else {
          stopLoading(this.previewEl);
        }
      },
      onSuccess: (_0x1fd675, {
        recovering = false
      } = {}) => {
        if (recovering) {
          return;
        }
        window.showToast?.(aigenAudioText("generation.completed"), "success");
      },
      onFailure: (_0x34fd2e, _0x484e96) => this._handleAudioTaskFailure(_0x34fd2e, _0x484e96),
      messages: {
        generationFailed: () => aigenAudioText("generation.failed"),
        interrupted: () => aigenAudioText("generation.interrupted"),
        interruptedMissingTaskId: () => aigenAudioText("cancel.interruptedMissingTaskId"),
        cancelSuccess: () => aigenAudioText("cancel.success"),
        cancelFailed: () => aigenAudioText("cancel.failed"),
        cancelTaskMissing: () => aigenAudioText("cancel.taskMissing"),
        missingApiKey: () => aigenAudioText("cancel.missingApiKey")
      }
    });
  }
  _getCurrentWorkflow() {
    const _0x4fdc5c = resolveWorkflowKeyFromNodeData(this._data);
    return getWorkflowByKey(_0x4fdc5c) || getDefaultWorkflow();
  }
  _syncWorkflowDefaults() {
    const _0x265c0f = this._getCurrentWorkflow();
    const _0x1bbf6b = getStoreSnapshot().nodes?.[this.nodeId] || this._data;
    const _0x1c0bac = buildAudioWorkflowDefaultSyncPatch({
      nodeData: _0x1bbf6b,
      workflow: _0x265c0f
    });
    if (!Object.keys(_0x1c0bac).length) {
      return;
    }
    a293_0x6e2506.updateNodeData(this.nodeId, _0x1c0bac);
    this._data = {
      ..._0x1bbf6b,
      ..._0x1c0bac
    };
  }
  _setSelectedWorkflow(_0x3b30e9) {
    const _0x371c84 = getWorkflowByKey(_0x3b30e9);
    if (!_0x371c84) {
      return;
    }
    if (!this._guardVipWorkflowSelection(_0x371c84.key, () => {
      this._vipSelectionRetryInProgress = true;
      try {
        this._setSelectedWorkflow(_0x371c84.key);
      } finally {
        this._vipSelectionRetryInProgress = false;
      }
    })) {
      return;
    }
    const _0x4de427 = a293_0x6e2506.getState?.()?.nodes?.[this.nodeId] || this._data;
    const _0x3a2f61 = buildAudioWorkflowSelectionPatch({
      nodeData: _0x4de427,
      workflow: _0x371c84
    });
    a293_0x6e2506.updateNodeData(this.nodeId, _0x3a2f61);
    this._data = {
      ...this._data,
      ..._0x3a2f61
    };
    this._enforceWorkflowAudioInputLimit();
    this._lastEdgeSig = null;
    this._lastRefMediaSig = "";
    this._lastWorkflowKey = "";
    this._lastRenderedWorkflowKey = "";
    this._refBarWorkflowKey = "";
    this._renderRefBar();
    this._refreshWorkflowUi();
    this._updateSubmitButtonState();
  }
  _closeModelMenu() {
    this._modelMenu?.classList.remove("show");
    if (this._runninghubSubmenu) {
      this._runninghubSubmenu.style.display = "none";
    }
    if (this._submenuCloseTimer) {
      clearTimeout(this._submenuCloseTimer);
      this._submenuCloseTimer = null;
    }
  }
  _openSubmenu() {
    if (!this._runninghubSubmenu) {
      return;
    }
    if (this._submenuCloseTimer) {
      clearTimeout(this._submenuCloseTimer);
      this._submenuCloseTimer = null;
    }
    this._runninghubSubmenu.style.display = "flex";
  }
  _scheduleCloseSubmenu() {
    if (this._submenuCloseTimer) {
      clearTimeout(this._submenuCloseTimer);
    }
    this._submenuCloseTimer = setTimeout(() => {
      if (this._runninghubSubmenu) {
        this._runninghubSubmenu.style.display = "none";
      }
      this._submenuCloseTimer = null;
    }, 150);
  }
  _refreshWorkflowUi() {
    const _0x4579f3 = this._getCurrentWorkflow();
    const _0x527779 = getStoreSnapshot().nodes?.[this.nodeId] || this._data;
    if (this._data !== _0x527779) {
      this._data = _0x527779;
    }
    if (this._modelLabelEl) {
      this._modelLabelEl.textContent = _0x4579f3.label;
    }
    this._syncPromptInputVisibility(_0x4579f3.key);
    this._syncAudioPromptHelpTip(_0x4579f3.key);
    const _0x4ef989 = syncAudioWorkflowSchemaSlots({
      root: this._root,
      workflow: _0x4579f3,
      nodeData: this._data,
      elements: this._workflowSchemaSlotElements,
      lastRenderedWorkflowKey: this._lastRenderedWorkflowKey
    });
    this._lastRenderedWorkflowKey = _0x4ef989.lastRenderedWorkflowKey;
    this._runninghubSubmenu?.querySelectorAll(".floating-menu-item").forEach(_0x51f50d => {
      _0x51f50d.classList.toggle("active", _0x51f50d.dataset.value === _0x4579f3.key);
    });
    this._modelMenu?.querySelectorAll(".node-menu-submenu .floating-menu-item").forEach(_0x5b3db8 => {
      _0x5b3db8.classList.toggle("active", _0x5b3db8.dataset.value === _0x4579f3.key);
    });
    this._syncModelProviderProfileControl();
  }
  refreshModelRegistryUi() {
    if (this._rendererDetailsDeferred === true || !this.footerEl) {
      return false;
    }
    this._renderFooter(this.footerEl);
    this._refreshWorkflowUi();
    return true;
  }
  _getGenerationNodeHelpText(_0x301647 = this._getCurrentWorkflow().key) {
    return getGenerationNodeHelpTooltip({
      kind: "audio",
      key: _0x301647
    });
  }
  _ensureGenerationNodeHelpTip() {
    if (this._generationNodeHelpTip || !this._promptPanel) {
      return this._generationNodeHelpTip;
    }
    this._generationNodeHelpTip = createGenerationNodeHelpTipController({
      panel: this._promptPanel,
      getHelpText: () => this._getGenerationNodeHelpText(),
      ariaLabel: aigenAudioText("help.ariaLabel")
    });
    return this._generationNodeHelpTip;
  }
  _syncAudioPromptHelpTip() {
    this._ensureGenerationNodeHelpTip()?.sync();
  }
  _ensureModelProviderProfileControl() {
    if (this._modelProviderProfileControl || !this._promptPanel) {
      return this._modelProviderProfileControl;
    }
    this._modelProviderProfileControl = createModelProviderProfileControl({
      panel: this._promptPanel,
      getNodeData: () => a293_0x6e2506.getState().nodes?.[this.nodeId] || this._data || {},
      onChange: _0x57120d => a293_0x6e2506.updateNodeData(this.nodeId, _0x57120d)
    });
    return this._modelProviderProfileControl;
  }
  _syncModelProviderProfileControl() {
    this._ensureModelProviderProfileControl()?.sync();
  }
  _syncPromptInputVisibility(_0x2e76eb = this._getCurrentWorkflow().key) {
    if (!this._promptInputWrap || !this.promptEl) {
      return;
    }
    const _0xc424ae = doesAudioWorkflowAcceptTextInput(_0x2e76eb);
    this._promptInputWrap.hidden = !_0xc424ae;
    this._promptInputWrap.classList.toggle("is-hidden", !_0xc424ae);
    this.promptEl.setAttribute("aria-hidden", _0xc424ae ? "false" : "true");
    this.promptEl.contentEditable = _0xc424ae ? "true" : "false";
    syncAudioPromptPlaceholder(this.promptEl, _0x2e76eb);
  }
  _resolveAudioRefUrl(_0x37a440) {
    return resolveCanvasAudioUrl(_0x37a440);
  }
  _getAudioResultItems(_0x559d5d = this._data) {
    const _0x2ee91a = Array.isArray(_0x559d5d?.audios) ? _0x559d5d.audios : [];
    if (_0x2ee91a.length > 0) {
      return _0x2ee91a.filter(_0x57fbf3 => _0x57fbf3 && typeof _0x57fbf3 === "object").map(_0x493deb => ({
        ..._0x493deb,
        audioUrl: resolveCanvasAudioUrl(_0x493deb) || String(_0x493deb.audioUrl || "").trim()
      })).filter(_0x7b452a => String(_0x7b452a.audioUrl || _0x7b452a.localPath || "").trim());
    }
    const _0x488562 = resolveCanvasAudioUrl(_0x559d5d);
    if (!_0x488562) {
      return [];
    }
    return [{
      audioUrl: _0x488562,
      src: _0x488562,
      localPath: normalizeLocalPath(_0x559d5d?.localPath || _0x488562),
      waveformLocalPath: _0x559d5d?.waveformLocalPath,
      audioDuration: _0x559d5d?.audioDuration,
      assetId: _0x559d5d?.assetId,
      derivativeStatus: _0x559d5d?.derivativeStatus,
      fileName: _0x559d5d?.fileName
    }];
  }
  _getMainAudioIndex(_0x6738d8 = this._data, _0x818e59 = 0) {
    const _0x89ba1c = Number(_0x6738d8?.mainAudioIndex);
    if (!Number.isFinite(_0x89ba1c) || _0x89ba1c < 0) {
      return 0;
    }
    return Math.min(Math.max(0, Math.trunc(_0x89ba1c)), Math.max(0, _0x818e59 - 1));
  }
  _resolveNodeAudioUrl(_0x40a8b7) {
    const _0x486ebf = this._getAudioResultItems(_0x40a8b7);
    if (_0x486ebf.length > 0) {
      const _0x4ca87d = this._getMainAudioIndex(_0x40a8b7, _0x486ebf.length);
      return resolveCanvasAudioUrl(_0x486ebf[_0x4ca87d] || _0x486ebf[0]) || "";
    }
    return "";
  }
  _applyAudioMultiToggleVisual(_0x2cd110, _0x2b7e38) {
    const _0x5beb49 = this._audioMultiToggleBtn;
    if (!_0x5beb49) {
      return;
    }
    _0x5beb49.classList.toggle("is-expanded", !!_0x2cd110);
    _0x5beb49.innerHTML = _0x2cd110 ? "<span>" + _0x2b7e38 + "</span><svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><polyline points=\"9 18 15 12 9 6\"></polyline></svg>" : "<span>" + _0x2b7e38 + "</span><svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><polyline points=\"6 9 12 15 18 9\"></polyline></svg>";
  }
  _clearAudioMultiResultStack() {
    if (this._audioMultiResultsContainer) {
      this._audioMultiResultsContainer.remove();
    }
    if (this._audioMultiToggleBtn) {
      this._audioMultiToggleBtn.remove();
    }
    clearMultiResultStackClasses({
      previewEl: this.previewEl,
      stackWrap: this._audioMultiStackWrap
    });
    this._audioMultiResultsContainer = null;
    this._audioMultiStackWrap = null;
    this._audioMultiBackdropWrap = null;
    this._audioMultiToggleBtn = null;
    this._audioMultiBackplateEls = [];
    this._lastAudioResultsKeyStr = "";
  }
  _applyAudioMultiStackLayout({
    count: _0x3d7896,
    mainIndex: _0x4b757b,
    expanded: _0x481f83
  }) {
    if (!this.previewEl || !this._audioMultiBackdropWrap) {
      return;
    }
    const _0x2f9e07 = this.previewEl.offsetWidth || this._data?.width || AUDIO_RESULT_WIDTH;
    const _0x44be89 = this.previewEl.offsetHeight || this._data?.height || AUDIO_RESULT_HEIGHT;
    const _0xa67ffa = 12;
    const _0x2ef797 = 38;
    const _0x3b4e0a = 18;
    const _0x593a43 = Math.max(1, _0x2f9e07 - _0x2ef797 - 4);
    const _0x3ebd7c = Math.max(1, _0x44be89 - _0x3b4e0a * 2);
    const _0x5c5014 = buildMultiResultExpandedSlotMap({
      imageCount: _0x3d7896,
      mainIndex: _0x4b757b,
      previewWidth: _0x2f9e07,
      previewHeight: _0x44be89,
      gap: _0xa67ffa
    });
    this._audioMultiBackdropWrap.querySelectorAll("." + MULTI_RESULT_BACKPLATE_CLASS).forEach(_0x2a1583 => {
      const _0x483186 = Number(_0x2a1583.dataset?.imageIndex);
      const _0x200418 = Math.max(1, Number(_0x2a1583.dataset?.stackIndex) || 1);
      const _0x1d9ae6 = buildMultiResultCollapsedFrame(_0x200418);
      const _0x680e1c = _0x5c5014.get(_0x483186);
      const _0x5af187 = !!_0x481f83 && !!_0x680e1c;
      const _0x1b3bf0 = _0x2a1583.querySelector(".multi-stack-backplate-media");
      const _0x84b3f8 = "translate(" + _0x1d9ae6.x + "px, " + _0x1d9ae6.y + "px) rotate(" + _0x1d9ae6.rotate + "deg) scale(" + _0x1d9ae6.scale + ")";
      Object.assign(_0x2a1583.style, {
        display: _0x5af187 ? "block" : "none",
        top: _0x5af187 ? _0x680e1c.top + "px" : _0x3b4e0a + "px",
        left: _0x5af187 ? _0x680e1c.left + "px" : _0x2ef797 + "px",
        width: _0x5af187 ? _0x2f9e07 + "px" : _0x593a43 + "px",
        height: _0x5af187 ? _0x44be89 + "px" : _0x3ebd7c + "px",
        opacity: _0x5af187 ? "1" : String(_0x1d9ae6.opacity),
        pointerEvents: _0x5af187 ? "auto" : "none",
        zIndex: _0x5af187 ? String(2 + _0x680e1c.order) : String(_0x200418),
        borderRadius: _0x5af187 ? "18px" : "0 var(--radius-16) var(--radius-16) 0",
        transform: _0x5af187 ? "translate(0px, 0px) rotate(0deg) scale(1)" : _0x84b3f8,
        filter: _0x5af187 ? "brightness(1) saturate(1)" : "brightness(0.86) saturate(0.92)",
        transformOrigin: _0x5af187 ? "bottom left" : "center right"
      });
      _0x2a1583.classList.toggle("is-expanded-card", _0x5af187);
      if (_0x1b3bf0) {
        _0x1b3bf0.style.opacity = _0x5af187 ? "1" : "0";
        _0x1b3bf0.style.transform = _0x5af187 ? "scale(1)" : "scale(1.02)";
      }
    });
  }
  _syncAudioMultiResultStack(_0x1a9b58 = this._data) {
    if (!this.previewEl) {
      return;
    }
    const _0x4f8d65 = this._getAudioResultItems(_0x1a9b58);
    const _0x5e45ec = _0x4f8d65.length;
    if (_0x5e45ec <= 1) {
      this._clearAudioMultiResultStack();
      return;
    }
    this._root?.style.setProperty("overflow", "visible");
    const _0x345ced = this._getMainAudioIndex(_0x1a9b58, _0x5e45ec);
    const _0x1bd594 = !!_0x1a9b58?.isAudiosExpanded;
    const _0x599e4b = _0x4f8d65.map(_0x7bbf98 => [String(_0x7bbf98.audioUrl || ""), String(_0x7bbf98.localPath || "")].join("|")).join("||");
    const _0x8ec889 = _0x599e4b !== this._lastAudioResultsKeyStr || _0x345ced !== this._lastMainAudioIndex || !this._audioMultiResultsContainer || !this._audioMultiStackWrap || !this._audioMultiBackdropWrap;
    if (_0x8ec889) {
      this._clearAudioMultiResultStack();
      const _0x336734 = document.createElement("div");
      _0x336734.className = "audio-multi-results-container";
      const _0xf25408 = document.createElement("div");
      _0xf25408.className = MULTI_RESULT_STACK_WRAP_CLASS;
      const _0x4bf7fb = buildMultiResultBackplateItems({
        imageCount: _0x5e45ec,
        mainIndex: _0x345ced
      });
      const _0x5cddc4 = createMultiResultBackplates(document, _0x5e45ec, {
        items: _0x4bf7fb
      });
      if (_0x5cddc4) {
        _0xf25408.appendChild(_0x5cddc4);
        _0x5cddc4.querySelectorAll("." + MULTI_RESULT_BACKPLATE_CLASS).forEach(_0x440f7b => {
          const _0x167815 = Number(_0x440f7b.dataset?.imageIndex);
          if (!Number.isFinite(_0x167815)) {
            return;
          }
          this._audioMultiBackplateEls[_0x167815] = _0x440f7b;
          const _0x3e74bc = document.createElement("div");
          _0x3e74bc.className = "multi-stack-backplate-media audio-multi-wave-preview";
          _0x3e74bc.innerHTML = "<svg width=\"100%\" height=\"80\" viewBox=\"0 0 200 80\" preserveAspectRatio=\"none\">\n              <path d=\"" + WAVE_PATH + "\" stroke=\"var(--blue)\" stroke-width=\"2\" stroke-linecap=\"round\"/>\n              <path d=\"M0,40 L200,40\" stroke=\"var(--blue)\" stroke-width=\"1\" stroke-dasharray=\"2 4\" opacity=\"0.4\"/>\n            </svg>";
          _0x440f7b.appendChild(_0x3e74bc);
          _0x440f7b.addEventListener("pointerdown", _0xeb39e7 => {
            const _0x3db769 = a293_0x6e2506.getState().nodes?.[this.nodeId] || {};
            if (_0x3db769?.isAudiosExpanded) {
              _0xeb39e7.stopPropagation();
            }
          });
          _0x440f7b.addEventListener("click", _0x20faf8 => {
            const _0xf5d8d6 = a293_0x6e2506.getState().nodes?.[this.nodeId] || {};
            if (!_0xf5d8d6?.isAudiosExpanded) {
              return;
            }
            _0x20faf8.preventDefault();
            _0x20faf8.stopPropagation();
            this._selectMainAudioResult(Number(_0x440f7b.dataset?.imageIndex));
          });
        });
      }
      const _0x269802 = document.createElement("button");
      _0x269802.type = "button";
      _0x269802.className = "multi-toggle-btn audio-multi-toggle-btn";
      _0x269802.addEventListener("pointerdown", _0x5992f9 => {
        if (_0x5992f9.button !== 0) {
          return;
        }
        _0x5992f9.preventDefault();
        _0x5992f9.stopPropagation();
        const _0x45d4c0 = a293_0x6e2506.getState().nodes?.[this.nodeId] || {};
        if (_0x45d4c0?.isAudiosExpanded) {
          this._selectMainAudioResult(_0x45d4c0.mainAudioIndex ?? this._lastMainAudioIndex ?? 0);
          return;
        }
        a293_0x6e2506.updateNodeData(this.nodeId, {
          isAudiosExpanded: true
        });
      });
      _0x269802.addEventListener("click", _0x1cac67 => {
        _0x1cac67.preventDefault();
        _0x1cac67.stopPropagation();
      });
      _0x336734.appendChild(_0xf25408);
      if (this._audioMainSurface && this._audioMainSurface.parentNode === this.previewEl) {
        this.previewEl.insertBefore(_0x336734, this._audioMainSurface);
      } else {
        this.previewEl.appendChild(_0x336734);
      }
      this.previewEl.appendChild(_0x269802);
      this._audioMultiResultsContainer = _0x336734;
      this._audioMultiStackWrap = _0xf25408;
      this._audioMultiBackdropWrap = _0x5cddc4;
      this._audioMultiToggleBtn = _0x269802;
      this._lastAudioResultsKeyStr = _0x599e4b;
    }
    syncMultiResultStackClasses({
      previewEl: this.previewEl,
      stackWrap: this._audioMultiStackWrap,
      isActive: _0x5e45ec > 1,
      isExpanded: _0x1bd594
    });
    this._applyAudioMultiToggleVisual(_0x1bd594, _0x5e45ec);
    this._applyAudioMultiStackLayout({
      count: _0x5e45ec,
      mainIndex: _0x345ced,
      expanded: _0x1bd594
    });
    this._lastMainAudioIndex = _0x345ced;
    this._lastIsAudiosExpanded = _0x1bd594;
  }
  _selectMainAudioResult(_0x1565b7 = 0) {
    const _0x34efb8 = a293_0x6e2506.getState().nodes?.[this.nodeId] || this._data || {};
    const _0xed12fb = this._getAudioResultItems(_0x34efb8);
    if (_0xed12fb.length === 0) {
      return;
    }
    const _0xa375c0 = Number.isFinite(Number(_0x1565b7)) ? Math.min(_0xed12fb.length - 1, Math.max(0, Math.trunc(Number(_0x1565b7)))) : 0;
    const _0x269ead = _0xed12fb[_0xa375c0] || _0xed12fb[0];
    const _0x1fe842 = resolveCanvasAudioUrl(_0x269ead);
    if (!_0x1fe842) {
      return;
    }
    const _0x534717 = {
      mainAudioIndex: _0xa375c0,
      isAudiosExpanded: false,
      audioUrl: _0x1fe842,
      src: _0x1fe842,
      localPath: normalizeLocalPath(_0x269ead.localPath || _0x1fe842)
    };
    for (const _0x234935 of ["waveformLocalPath", "assetId", "derivativeStatus", "fileName", "audioDuration"]) {
      if (_0x269ead[_0x234935] !== undefined) {
        _0x534717[_0x234935] = _0x269ead[_0x234935];
      }
    }
    a293_0x6e2506.updateNodeData(this.nodeId, _0x534717);
  }
  _resolveVideoRefUrl(_0x3dc424) {
    const _0x193bd7 = Number.isFinite(Number(_0x3dc424?.mainVideoIndex)) ? Math.max(0, Math.trunc(Number(_0x3dc424.mainVideoIndex))) : 0;
    const _0x21d169 = Array.isArray(_0x3dc424?.videos) ? _0x3dc424.videos[_0x193bd7] || _0x3dc424.videos[0] : null;
    return resolveCanvasVideoUrl(_0x21d169) || resolveCanvasVideoUrl(_0x3dc424);
  }
  async _persistAudioOutput(_0x5b440b) {
    const _0x5716d4 = normalizeAudioRemoteUrl(_0x5b440b);
    if (!_0x5716d4) {
      return {
        localPath: "",
        audioUrl: ""
      };
    }
    const _0x4e5148 = normalizeLocalPath(_0x5716d4);
    if (_0x4e5148) {
      const _0x23217e = _0x4e5148;
      return {
        localPath: _0x23217e,
        audioUrl: localUrlFromPath(_0x23217e)
      };
    }
    try {
      const _0xac42da = await saveRemoteAudioLocallyDetailed(_0x5716d4);
      const _0x12ede4 = pickResultLocalPath(_0xac42da);
      if (_0x12ede4) {
        const _0x190447 = pickAudioDurationSec(_0xac42da?.audioDuration, _0xac42da?.duration);
        return {
          ...(_0xac42da && typeof _0xac42da === "object" ? _0xac42da : {}),
          localPath: _0x12ede4,
          audioUrl: localUrlFromPath(_0x12ede4),
          ...(_0x190447 > 0 ? {
            audioDuration: _0x190447
          } : {})
        };
      }
    } catch (_0x50fc11) {
      console.error("[AIGenAudioNode] 音频落盘失败:", _0x50fc11);
      const _0x17a499 = _0x50fc11?.message ? ": " + _0x50fc11.message : "";
      throw new Error(aigenAudioText("errors.localSaveGeneratedFailed") + _0x17a499);
    }
    throw new Error(aigenAudioText("errors.localSaveGeneratedFailed"));
  }
  _persistRunningHubResumeCache() {
    try {
      window._triggerLocalCacheSave?.();
    } catch {}
  }
  _isRunningHubRecoverableRunningTask(_0x58eea8 = this._data) {
    const _0x2dc160 = String(_0x58eea8?.provider || "").trim().toLowerCase();
    if (_0x2dc160 !== "runninghubwf" && _0x2dc160 !== "runninghub") {
      return false;
    }
    const _0x17b0c3 = String(_0x58eea8?.rhTaskId || "").trim();
    if (!_0x17b0c3) {
      return false;
    }
    const _0x1969f6 = String(_0x58eea8?.rhTaskStatus || "").trim().toLowerCase();
    if (_0x1969f6 === "success" || _0x1969f6 === "failed" || _0x1969f6 === "idle" || _0x1969f6 === "cancelled") {
      return false;
    }
    return true;
  }
  _stopRunningHubRecovery(_0xa42102 = false) {
    this._audioTaskOrchestration?.resetRecovery({
      resetRecovering: _0xa42102
    });
  }
  _setGeneratingUi() {
    if (!this.btnEl) {
      return;
    }
    const _0xe465c8 = a293_0x6e2506.getState().nodes?.[this.nodeId] || this._data || {};
    const _0x3f58e7 = String(_0xe465c8?.provider || "runninghubwf").toLowerCase();
    const _0x2c9534 = _0x3f58e7 === "runninghubwf" || _0x3f58e7 === "runninghub";
    const _0x2f4a03 = resolveGenerationButtonMode(_0xe465c8, {
      cancellable: _0x2c9534,
      cancelInFlight: this._rhCancelInFlight === true
    });
    if (_0x2f4a03.busy) {
      if (_0x2c9534) {
        setGenerateButtonCancellableUi(this.btnEl, {
          title: aigenAudioText("buttons.generateCancellable"),
          tooltip: aigenAudioText("buttons.generateCancellable"),
          ariaLabel: aigenAudioText("buttons.cancelAudioGeneration"),
          color: "var(--red)",
          busy: true
        });
      } else {
        setGenerateButtonLoadingUi(this.btnEl, {
          title: aigenAudioText("buttons.generate"),
          disabled: true,
          ariaLabel: aigenAudioText("buttons.generate")
        });
      }
      this.btnEl.disabled = _0x2f4a03.disabled;
      this.btnEl.style.cursor = _0x2f4a03.cursor;
      return;
    }
    resetGenerateButtonIdleUi(this.btnEl, aigenAudioText("buttons.generate"));
    this._updateSubmitButtonState();
  }
  _guardVipWorkflowSelection(_0x167e3f, _0x44940b = null) {
    return true;
  }
  async runGeneration(_0x32164e = {}) {
    return this._onGenerate(null, _0x32164e);
  }
  async cancelGeneration() {
    return this._audioTaskOrchestration.cancelGeneration();
  }
  getGenerationStatus() {
    return this._audioTaskOrchestration.getGenerationStatus();
  }
  async _handleGenerateOrCancel(_0x4ca242 = null) {
    const _0x4db61b = a293_0x6e2506.getState().nodes?.[this.nodeId] || this._data || {};
    const _0x2ff848 = String(_0x4db61b?.provider || "runninghubwf").trim().toLowerCase();
    const _0x13c404 = _0x2ff848 === "runninghubwf" || _0x2ff848 === "runninghub";
    if (shouldAllowCancel(_0x4db61b, {
      cancellable: _0x13c404,
      cancelInFlight: this._rhCancelInFlight === true
    })) {
      await this._cancelRunningHubWorkflowTask();
      return;
    }
    await this._onGenerate(_0x4ca242);
  }
  async _cancelRunningHubWorkflowTask() {
    return this._audioTaskOrchestration.cancelGeneration();
  }
  async _buildAudioResultPatch(_0x49330e, _0xd3fea3) {
    const _0x56cd27 = await buildAudioGenerationResultPatch(_0x49330e, {
      startedAt: _0xd3fea3,
      persistAudioOutput: _0x45453c => this._persistAudioOutput(_0x45453c)
    });
    if (!_0x56cd27?.audioUrl || !_0x56cd27?.localPath) {
      throw new Error(aigenAudioText("errors.localSaveGeneratedFailed"));
    }
    return _0x56cd27;
  }
  _applyAudioResultProjection(_0x5dc9ff, _0x27b077) {
    const _0x41e387 = {
      audioUrl: _0x5dc9ff.audioUrl,
      src: _0x5dc9ff.src,
      localPath: _0x5dc9ff.localPath,
      audioDuration: _0x5dc9ff.audioDuration,
      waveformLocalPath: _0x5dc9ff.waveformLocalPath,
      assetId: _0x5dc9ff.assetId,
      derivativeStatus: _0x5dc9ff.derivativeStatus,
      fileName: _0x5dc9ff.fileName
    };
    this._dispatchGenerationHistoryAudio(_0x5dc9ff.audios || _0x41e387, _0x27b077);
    this._applyResultWideLayout({
      ...this._data,
      ..._0x5dc9ff,
      ..._0x41e387
    }, true);
    this._syncAudioMultiResultStack({
      ...this._data,
      ..._0x5dc9ff,
      ..._0x41e387
    });
    return {
      finalUrl: _0x41e387.audioUrl,
      finalLocalPath: _0x41e387.localPath,
      patch: _0x5dc9ff
    };
  }
  async _applyAudioResultAndStore(_0x124309, _0x2c0bf5, {
    writeStore = true
  } = {}) {
    const _0x2d4ded = await this._buildAudioResultPatch(_0x124309, _0x2c0bf5);
    if (writeStore) {
      a293_0x6e2506.updateNodeData(this.nodeId, _0x2d4ded);
    }
    return this._applyAudioResultProjection(_0x2d4ded, _0x2c0bf5);
  }
  _dispatchGenerationHistoryAudio(_0x35253a, _0x11df98) {
    if (typeof window === "undefined" || typeof window.dispatchEvent !== "function") {
      return;
    }
    const _0x581f13 = (Array.isArray(_0x35253a) ? _0x35253a : [_0x35253a]).filter(_0x2e4e3a => _0x2e4e3a && typeof _0x2e4e3a === "object" && String(_0x2e4e3a.audioUrl || _0x2e4e3a.localPath || "").trim());
    if (_0x581f13.length === 0) {
      return;
    }
    const _0x4aecaa = a293_0x6e2506.getState().nodes?.[this.nodeId] || this._data || {};
    try {
      window.dispatchEvent(new CustomEvent(GENERATION_HISTORY_EVENT, {
        detail: {
          kind: "audio",
          sourceNodeId: this.nodeId,
          nodeData: _0x4aecaa,
          audios: _0x581f13,
          startedAt: _0x11df98,
          createdAt: Date.now()
        }
      }));
    } catch {}
  }
  async _maybeResumeRunningHubTask() {
    const _0x4a6f66 = getStoreSnapshot().nodes?.[this.nodeId] || this._data || {};
    if (this._isGenerating && _0x4a6f66?.rhTaskRecovering !== true) {
      return null;
    }
    if (!this._isRunningHubRecoverableRunningTask(_0x4a6f66)) {
      this._stopRunningHubRecovery(false);
      return null;
    }
    const _0x13aa30 = await this._buildPayload();
    if (!_0x13aa30) {
      return null;
    }
    return this._audioTaskOrchestration.resumeIfNeeded({
      payload: _0x13aa30,
      startedAt: Number(_0x4a6f66?.rhTaskStartedAt || _0x4a6f66?.generationStartTime || Date.now())
    });
  }
  _applyResultWideLayout(_0x4619ca = null, _0x11e49c = false) {
    const _0x49ee5b = _0x4619ca || this._data || {};
    const _0x53b6aa = this._resolveNodeAudioUrl(_0x49ee5b);
    if (!_0x53b6aa) {
      return;
    }
    const _0xd9633f = Number(_0x49ee5b.width || 0);
    const _0x4241c0 = Number(_0x49ee5b.height || 0);
    if (!_0x11e49c && _0xd9633f > 0 && _0x4241c0 > 0) {
      const _0xc6d4e6 = _0xd9633f / _0x4241c0;
      const _0x680556 = _0xc6d4e6 >= 2 && _0xd9633f >= AUDIO_RESULT_WIDTH - 20 && _0x4241c0 <= AUDIO_RESULT_HEIGHT + 40;
      const _0xea0b1f = Math.abs(_0xc6d4e6 - AUDIO_RESULT_RATIO) <= 0.08;
      if (_0x680556 || _0xea0b1f) {
        return;
      }
    }
    const _0x1bbe1b = _0xd9633f > 0 ? _0xd9633f : AUDIO_RESULT_WIDTH;
    const _0x31f614 = _0x4241c0 > 0 ? _0x4241c0 : AUDIO_RESULT_HEIGHT;
    const _0x1dd93b = Number(_0x49ee5b.x || 0) + _0x1bbe1b / 2;
    const _0x22c832 = Number(_0x49ee5b.y || 0) + _0x31f614 / 2;
    const _0x59e025 = Math.round(_0x1dd93b - AUDIO_RESULT_WIDTH / 2);
    const _0xbc4416 = Math.round(_0x22c832 - AUDIO_RESULT_HEIGHT / 2);
    if (_0xd9633f === AUDIO_RESULT_WIDTH && _0x4241c0 === AUDIO_RESULT_HEIGHT && Number(_0x49ee5b.x || 0) === _0x59e025 && Number(_0x49ee5b.y || 0) === _0xbc4416) {
      return;
    }
    a293_0x6e2506.updateNodeData(this.nodeId, {
      width: AUDIO_RESULT_WIDTH,
      height: AUDIO_RESULT_HEIGHT,
      x: _0x59e025,
      y: _0xbc4416
    });
  }
  _collectInputs(_0x103e3b = null) {
    const _0x599493 = a293_0x6e2506.getIncomingEdges(this.nodeId);
    const _0x4b3e62 = getStoreSnapshot().nodes || {};
    const _0x3870d2 = [];
    const _0x4b794b = [];
    const _0x1a8a4b = [];
    const _0x3b3aa1 = this._getCurrentWorkflow().key;
    const _0x1b923f = doesAudioWorkflowAcceptTextInput(_0x3b3aa1);
    _0x599493.forEach(_0x3eb7ec => {
      const _0x233ee9 = _0x4b3e62[_0x3eb7ec.sourceId];
      if (!_0x233ee9) {
        return;
      }
      const _0x350d08 = String(_0x233ee9.type || "");
      if (_0x1b923f && TEXT_INPUT_TYPES.has(_0x350d08)) {
        const _0x3f7118 = String(_0x233ee9.outputText || _0x233ee9.text || _0x233ee9.content || _0x233ee9.prompt || "").trim();
        if (!_0x3f7118) {
          return;
        }
        _0x3870d2.push({
          edgeId: _0x3eb7ec.id,
          sourceId: _0x3eb7ec.sourceId,
          sourceType: _0x350d08,
          text: _0x3f7118
        });
        return;
      }
      if (AUDIO_INPUT_TYPES.has(_0x350d08)) {
        const _0x5abfea = this._resolveAudioRefUrl(_0x233ee9);
        if (!_0x5abfea) {
          return;
        }
        _0x4b794b.push({
          edgeId: _0x3eb7ec.id,
          sourceId: _0x3eb7ec.sourceId,
          sourceType: _0x350d08,
          refSlot: String(_0x3eb7ec?.refSlot || ""),
          url: _0x5abfea
        });
        return;
      }
      if (VIDEO_INPUT_TYPES.has(_0x350d08)) {
        const _0x4e349f = this._resolveVideoRefUrl(_0x233ee9);
        if (!_0x4e349f) {
          return;
        }
        _0x1a8a4b.push({
          edgeId: _0x3eb7ec.id,
          sourceId: _0x3eb7ec.sourceId,
          sourceType: _0x350d08,
          url: _0x4e349f
        });
      }
    });
    const _0x48e40f = [];
    const _0x3a7d6b = _0x1b923f ? resolvePresetPromptTextWithTextRefs({
      template: _0x103e3b,
      promptEl: this.promptEl,
      inEdges: _0x599493,
      nodes: _0x4b3e62,
      assetInputRefs: _0x48e40f,
      assetMediaCounts: {
        image: 0,
        video: 0,
        audio: 0
      },
      allowedAssetTypes: ["text", "audio"]
    }) : "";
    const _0x5f181c = _0x4b3e62?.[this.nodeId] || this._data || {};
    _0x48e40f.push(...getPromptAssetInputRefsFromNode(_0x5f181c, {
      allowedTypes: ["audio"]
    }));
    const _0x1c439e = buildAudioWorkflowInputPlan({
      workflowKey: _0x3b3aa1,
      audioRefs: _0x4b794b,
      assetInputRefs: _0x48e40f
    });
    return {
      prompt: String(_0x3a7d6b || "").trim(),
      textInputs: _0x3870d2,
      audioRefs: _0x1c439e.audioRefs,
      videoRefs: _0x1a8a4b
    };
  }
  _validatePayload(_0x18a839) {
    const _0x127a4e = getWorkflowByKey(_0x18a839?.audioWorkflowKey) || getDefaultWorkflow();
    const _0x5c8ec8 = _0x127a4e.validate(_0x18a839);
    return {
      ok: !_0x5c8ec8,
      message: _0x5c8ec8
    };
  }
  _buildPayloadSnapshot(_0x3d94f3 = null) {
    const _0x4306cd = this._getCurrentWorkflow();
    const _0x16b2b0 = this._collectInputs(_0x3d94f3);
    const _0x92e1f0 = String(_0x4306cd.provider || "runninghubwf").trim();
    const _0x4b3255 = String(_0x4306cd.adapterType || "workflow").trim();
    const _0x47c0e2 = String(this._data?.providerProfileId || this._data?.rhProviderProfileId || "").trim();
    const _0xdb8593 = _0x92e1f0 === "runninghubwf" && _0x47c0e2 ? normalizeRunningHubModelApiProfileId(_0x47c0e2) : "";
    const _0x3aec73 = getPlainGenerationParams(this._data?.generationParams);
    const _0x44d940 = {
      nodeId: this.nodeId,
      provider: _0x92e1f0,
      adapterType: _0x4b3255,
      audioWorkflowKey: _0x4306cd.key,
      audioWorkflowLabel: _0x4306cd.label,
      executionId: _0x4306cd.executionId || "",
      prompt: normalizePromptForBackend(_0x4306cd.key, _0x16b2b0.prompt),
      textInputs: _0x16b2b0.textInputs.map(_0x4e5d11 => _0x4e5d11.text),
      audioRefs: _0x16b2b0.audioRefs,
      videoRefs: _0x16b2b0.videoRefs,
      generationParams: _0x3aec73,
      installId: String(this._vipInstallId || window.__aicInstallId || "").trim(),
      ...(_0xdb8593 ? {
        providerProfileId: _0xdb8593,
        rhProviderProfileId: _0xdb8593
      } : {})
    };
    if (_0x92e1f0 === "runninghubwf") {
      _0x44d940.rhInstanceType = String(resolveWorkflowSchemaParam(this._data, _0x4306cd.key, "rhInstanceType")) === "plus" ? "plus" : "default";
    }
    const _0xc90898 = this._validatePayload(_0x44d940);
    return {
      payload: _0x44d940,
      validation: _0xc90898
    };
  }
  _enforceWorkflowAudioInputLimit() {
    const _0x296a55 = this._getCurrentWorkflow();
    const _0x1ba46e = getAudioWorkflowInputLimit(_0x296a55.key);
    const _0x10bb93 = a293_0x6e2506.getIncomingEdges(this.nodeId);
    const _0x1f70c4 = getStoreSnapshot().nodes || {};
    const _0x2cc7ff = _0x10bb93.filter(_0x3cc6af => {
      const _0x487596 = _0x1f70c4[_0x3cc6af.sourceId];
      return AUDIO_INPUT_TYPES.has(String(_0x487596?.type || ""));
    });
    if (_0x2cc7ff.length <= _0x1ba46e) {
      return;
    }
    const _0x2732b1 = [..._0x2cc7ff].sort((_0x5235c0, _0x1da68c) => {
      const _0x54c31c = Number(_0x5235c0?.createdAt || 0);
      const _0x1816db = Number(_0x1da68c?.createdAt || 0);
      return _0x54c31c - _0x1816db;
    });
    const _0x32d77d = _0x2732b1.slice(0, Math.max(0, _0x2732b1.length - _0x1ba46e));
    if (!_0x32d77d.length) {
      return;
    }
    a293_0x6e2506.batch(() => {
      _0x32d77d.forEach(_0x4bec74 => a293_0x6e2506.removeEdge(_0x4bec74.id));
    });
  }
  _syncPickConnectVisualState() {
    const _0x164bdd = getStoreSnapshot().pickConnectMode || {};
    const _0x132411 = !!_0x164bdd.active && _0x164bdd.sourceNodeId === this.nodeId;
    const _0x20e4fe = this.refBarEl?.querySelector(".prompt-attachment-btn .btn-icon") || this._attachBtnIcon;
    if (_0x20e4fe) {
      this._attachBtnIcon = _0x20e4fe;
      _0x20e4fe.style.transition = "opacity 0.2s ease, transform 0.2s ease";
      _0x20e4fe.style.opacity = _0x132411 ? "0" : "";
      _0x20e4fe.style.transform = _0x132411 ? "scale(0.4)" : "";
      _0x20e4fe.style.pointerEvents = _0x132411 ? "none" : "";
    }
    if (this._placeholderEl) {
      const _0x3eabcc = this._placeholderEl.querySelector(".placeholder-icon-svg");
      if (_0x3eabcc) {
        if (_0x132411) {
          _0x3eabcc.classList.add("is-pick-connecting");
        } else {
          _0x3eabcc.classList.remove("is-pick-connecting");
        }
      }
    }
  }
  _fmtTime(_0x17ca41) {
    if (!_0x17ca41 || isNaN(_0x17ca41)) {
      return "0:00";
    }
    return Math.floor(_0x17ca41 / 60) + ":" + String(Math.floor(_0x17ca41 % 60)).padStart(2, "0");
  }
  _setPlayIcon(_0x413bcd) {
    const _0x56584b = this._playBtn?.querySelector?.("svg");
    if (!_0x56584b) {
      return;
    }
    const _0x5cacc0 = "http://www.w3.org/2000/svg";
    while (_0x56584b.firstChild) {
      _0x56584b.removeChild(_0x56584b.firstChild);
    }
    if (_0x413bcd) {
      const _0x5b25fc = document.createElementNS(_0x5cacc0, "polygon");
      _0x5b25fc.setAttribute("points", "5 3 19 12 5 21 5 3");
      _0x56584b.appendChild(_0x5b25fc);
      return;
    }
    const _0x4c9494 = document.createElementNS(_0x5cacc0, "rect");
    _0x4c9494.setAttribute("x", "6");
    _0x4c9494.setAttribute("y", "4");
    _0x4c9494.setAttribute("width", "4");
    _0x4c9494.setAttribute("height", "16");
    const _0x4694cf = document.createElementNS(_0x5cacc0, "rect");
    _0x4694cf.setAttribute("x", "14");
    _0x4694cf.setAttribute("y", "4");
    _0x4694cf.setAttribute("width", "4");
    _0x4694cf.setAttribute("height", "16");
    _0x56584b.appendChild(_0x4c9494);
    _0x56584b.appendChild(_0x4694cf);
  }
  _seekTo(_0x1eb1ed) {
    const _0x1a8057 = this._readAudioDurationSec();
    if (!this.audioEl || _0x1a8057 <= 0 || !this._bar) {
      return;
    }
    const _0x1f59e7 = this._bar.getBoundingClientRect();
    if (!_0x1f59e7.width) {
      return;
    }
    let _0xd1de61 = (_0x1eb1ed - _0x1f59e7.left) / _0x1f59e7.width;
    _0xd1de61 = Math.max(0, Math.min(1, _0xd1de61));
    const _0x50a159 = _0xd1de61 * _0x1a8057;
    if (!isFinite(_0x50a159)) {
      return;
    }
    this._isSeeking = true;
    this.audioEl.currentTime = _0x50a159;
    this._progressController?.sync({
      currentTime: _0x50a159,
      duration: _0x1a8057,
      force: true,
      showLine: true
    });
    this.audioEl.addEventListener("seeked", () => {
      this._isSeeking = false;
      this._progressController?.sync({
        force: true,
        showLine: true
      });
    }, {
      once: true
    });
  }
  _setAudioPreviewResultState(_0x42c9ea) {
    const _0x5d3d86 = !!_0x42c9ea;
    if (this._waveBgEl) {
      this._waveBgEl.style.display = _0x5d3d86 ? "" : "none";
    }
    if (this._wavePlayed) {
      this._wavePlayed.style.display = _0x5d3d86 ? "" : "none";
    }
    if (this._progressLine) {
      this._progressLine.style.display = _0x5d3d86 ? "" : "none";
    }
    if (this._bar) {
      this._bar.style.display = _0x5d3d86 ? "" : "none";
    }
    if (this._controlsEl) {
      this._controlsEl.style.display = _0x5d3d86 ? "" : "none";
    }
    if (this._placeholderEl) {
      this._placeholderEl.style.display = _0x5d3d86 ? "none" : "";
    }
  }
  _getCurrentGateModelId() {
    return getWorkflowGateModelId(this._getCurrentWorkflow().key);
  }
  async _ensureVipAccessForCurrentWorkflow() {
    return true;
  }
  async _resolveAudioDurationSec(_0x43c8b5) {
    const _0x3b8794 = String(_0x43c8b5 || "").trim();
    if (!_0x3b8794) {
      return 0;
    }
    return await loadAudioDurationMetadataSec(_0x3b8794, {
      timeoutMs: 5000
    });
  }
  async _validateAdvancedVoiceCloneDurations(_0x5842a5 = []) {
    if (this._getCurrentWorkflow().key !== ADVANCED_VOICE_CLONE_WORKFLOW_KEY) {
      return true;
    }
    const _0x41f6ff = Array.isArray(_0x5842a5) ? _0x5842a5 : [];
    for (const _0x22330c of _0x41f6ff) {
      const _0x5e60e2 = await this._resolveAudioDurationSec(_0x22330c?.url);
      if (Number.isFinite(_0x5e60e2) && _0x5e60e2 > 0 && (_0x5e60e2 < ADVANCED_VOICE_CLONE_MIN_SECONDS || _0x5e60e2 > ADVANCED_VOICE_CLONE_MAX_SECONDS)) {
        const _0x4c2ef7 = String(_0x22330c?.refSlot || "") === "audio2" ? aigenAudioText("refs.audio2") : aigenAudioText("refs.audio1");
        window.showToast?.(aigenAudioText("validation.advancedVoiceDuration", {
          label: _0x4c2ef7,
          duration: _0x5e60e2.toFixed(1)
        }), "warn");
        return false;
      }
    }
    return true;
  }
  _createStatusCard(_0x1dfd3c, _0x359623) {
    const _0x39f2fd = document.createElement("div");
    _0x39f2fd.className = "gen-status-card";
    Object.assign(_0x39f2fd.style, {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      width: "100%",
      height: "100%",
      gap: "8px",
      padding: "16px",
      boxSizing: "border-box",
      background: "var(--bg-panel-card)",
      textAlign: "center"
    });
    const _0x59b95d = Number(_0x359623) === 0;
    const _0x7a256a = _0x59b95d ? "var(--green)" : "var(--white-80)";
    _0x39f2fd.innerHTML = "\n      <svg width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"" + _0x7a256a + "\" stroke-width=\"2\">\n        <circle cx=\"12\" cy=\"12\" r=\"10\"/><path d=\"" + (_0x59b95d ? "M8 12l2.5 2.5L16 9" : "M12 8v5") + "\" />" + (_0x59b95d ? "" : "<line x1=\"12\" y1=\"16\" x2=\"12.01\" y2=\"16\" />") + "\n      </svg>\n      <span style=\"color:" + _0x7a256a + ";font-size:12px;font-weight:600;line-height:1.4;\">" + _0x1dfd3c + "</span>\n    ";
    return _0x39f2fd;
  }
  _ensureStatusOverlayEl() {
    if (this._statusOverlayEl) {
      return this._statusOverlayEl;
    }
    this._statusOverlayEl = document.createElement("div");
    this._statusOverlayEl.className = "dreamina-status-overlay";
    Object.assign(this._statusOverlayEl.style, {
      position: "absolute",
      inset: "0",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      pointerEvents: "none",
      padding: "16px",
      boxSizing: "border-box",
      zIndex: "11"
    });
    this.previewEl?.appendChild(this._statusOverlayEl);
    return this._statusOverlayEl;
  }
  _clearStatusOverlay() {
    if (!this._statusOverlayEl) {
      return;
    }
    this._statusOverlayEl.remove();
    this._statusOverlayEl = null;
  }
  _syncStatusOverlay(_0x2d9dce = this._data, _0x48cc39 = false) {
    const _0x1fce02 = String(_0x2d9dce?.rhStatusMessage || "").trim() || (String(_0x2d9dce?.jobStatus || "").toLowerCase() === "error" ? getTaskMessage(_0x2d9dce) : "");
    const _0x10b347 = _0x2d9dce?.rhStatusCode;
    if (!_0x48cc39 && _0x1fce02) {
      const _0x3ca2af = this._ensureStatusOverlayEl();
      _0x3ca2af.innerHTML = "";
      _0x3ca2af.appendChild(this._createStatusCard(_0x1fce02, _0x10b347));
      if (this._placeholderEl) {
        this._placeholderEl.style.display = "none";
      }
      return;
    }
    this._clearStatusOverlay();
  }
  async _ensureWaveform(_0x5659a4, {
    persistedOnly = false
  } = {}) {
    const _0x5123bb = String(_0x5659a4 || "").trim();
    if (!_0x5123bb) {
      return;
    }
    const _0x563428 = ++this._waveToken;
    const _0x24856b = localPathToUrl(this._data?.waveformLocalPath);
    const _0x29d845 = {
      width: 200,
      height: 80,
      samples: 190
    };
    let _0x1e2ca2 = "";
    if (_0x24856b) {
      _0x1e2ca2 = await getWaveformBarsPathFromPersistedUrl(_0x24856b, _0x29d845);
    }
    if (!_0x1e2ca2 && !persistedOnly) {
      _0x1e2ca2 = await getWaveformBarsPathFromUrl(_0x5123bb, _0x29d845);
    }
    if (!this.audioEl || !this._root || !this._root.isConnected) {
      return;
    }
    if (_0x563428 !== this._waveToken) {
      return;
    }
    if (!_0x1e2ca2) {
      return;
    }
    if (this._waveBgPath) {
      this._waveBgPath.setAttribute("d", _0x1e2ca2);
    }
    if (this._waveFgPath) {
      this._waveFgPath.setAttribute("d", _0x1e2ca2);
    }
  }
  _renderInitialFooter(_0x16ba13) {
    this.footerEl = _0x16ba13;
    if (this._rendererDetailsDeferred) {
      this._renderDeferredFooterShell(_0x16ba13);
    } else {
      this._renderFooter(_0x16ba13);
    }
  }
  _renderDeferredFooterShell(_0x131d50) {
    if (!_0x131d50) {
      return;
    }
    if (_0x131d50.dataset) {
      _0x131d50.dataset.deferredDetailsShell = "1";
    }
    _0x131d50.innerHTML = "\n      <div class=\"prompt-actions\">\n        <button type=\"button\" class=\"prompt-submit img-gen-btn\" disabled title=\"" + aigenAudioText("buttons.generate") + "\">\n          <svg width=\"14\" height=\"14\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><line x1=\"12\" y1=\"19\" x2=\"12\" y2=\"5\"/><polyline points=\"5 12 12 5 19 12\"/></svg>\n        </button>\n      </div>";
    this.modelWrap = null;
    this._modelMenu = null;
    this._runninghubSubmenu = null;
    this._modelLabelEl = null;
    this._workflowSchemaSlotElements = null;
    this.btnEl = _0x131d50.querySelector(".img-gen-btn");
    this.btnEl?.addEventListener("click", () => {
      flushPromptHtmlCommit(this);
      this._handleGenerateOrCancel();
    });
  }
  _renderFooter(_0x20c4ff) {
    if (!_0x20c4ff) {
      return;
    }
    if (_0x20c4ff.dataset) {
      delete _0x20c4ff.dataset.deferredDetailsShell;
    }
    const _0x374e1b = this._getCurrentWorkflow();
    _0x20c4ff.innerHTML = buildAudioWorkflowFooterHtml({
      workflow: _0x374e1b,
      nodeData: this._data,
      workflowItems: buildAudioWorkflowItems(AUDIO_WORKFLOW_VALIDATORS),
      debugIconHtml: DEBUG_WRENCH_ICON_HTML,
      labels: {
        advanced: aigenAudioText("controls.advancedSettings"),
        debugTitle: aigenAudioText("debug.buttonTitle"),
        generateTitle: aigenAudioText("buttons.generate")
      }
    });
    this.modelWrap = _0x20c4ff.querySelector(".img-model-wrap");
    this.btnEl = _0x20c4ff.querySelector(".img-gen-btn");
    const _0x54c172 = _0x20c4ff.querySelector(".debug-wrench-btn");
    const _0x249d36 = collectAudioWorkflowSchemaSlotElements(_0x20c4ff);
    const _0x274756 = _0x249d36.modelTrigger;
    const _0x5654dc = _0x20c4ff.querySelector(".img-model-menu");
    const _0x40da9e = _0x20c4ff.querySelector("[data-runninghub-toggle]");
    const _0x342fe3 = _0x20c4ff.querySelector(".runninghub-submenu");
    const _0x4078dc = _0x20c4ff.querySelector(".img-model-label");
    const _0x10e051 = _0x249d36.advancedButton;
    const _0x26ca1d = _0x249d36.advancedPanel;
    this._modelMenu = _0x5654dc;
    this._runninghubSubmenu = _0x342fe3;
    this._modelLabelEl = _0x4078dc;
    this._workflowSchemaSlotElements = _0x249d36;
    if (_0x10e051 && _0x26ca1d) {
      _0x10e051.addEventListener("click", _0x35647f => {
        _0x35647f.stopPropagation();
        _0x26ca1d.classList.toggle("show");
        _0x10e051.classList.toggle("active");
      });
    }
    _0x20c4ff.addEventListener("click", _0x5a8067 => {
      const _0x49e354 = _0x5a8067.target.closest?.("[data-ui-schema-field-help-url]");
      if (!_0x49e354 || !_0x20c4ff.contains(_0x49e354)) {
        return;
      }
      _0x5a8067.preventDefault();
      _0x5a8067.stopPropagation();
      const _0x35c74c = String(_0x49e354.dataset.uiSchemaFieldHelpUrl || "").trim();
      if (_0x35c74c) {
        openExternalLink(_0x35c74c).catch(() => {});
      }
    });
    this._footerControllerCleanup?.();
    this._footerControllerCleanup = bindNodeFooterController(_0x20c4ff, {
      onOutsideClose: () => {
        this._closeModelMenu();
        closeAudioWorkflowAdvancedPanel(this._workflowSchemaSlotElements);
      }
    });
    this._uiSchemaCleanup?.();
    this._uiSchemaCleanup = bindAudioWorkflowSchemaSlotControls({
      footer: _0x20c4ff,
      nodeId: this.nodeId,
      nodeData: this._data,
      store: a293_0x6e2506
    });
    _0x54c172?.addEventListener("click", async _0x292e70 => {
      _0x292e70.stopPropagation();
      flushPromptHtmlCommit(this);
      const _0x16a0ad = await this._buildPayload();
      if (!_0x16a0ad) {
        return;
      }
      try {
        const _0x255b89 = await buildGenerateAudioRequest(_0x16a0ad);
        const _0x32d3c5 = formatFinalApiDebugRequest(_0x255b89);
        const _0xd7a034 = a293_0x6e2506.getState();
        const _0x432ab0 = this._data.x + (this._data.width || 300) + 50;
        const _0x5f1f2f = this._data.y;
        const _0x38ecd6 = getNodeDefaultSize("debug");
        let _0x1f5400 = Object.values(_0xd7a034.nodes).find(_0x1c2d54 => _0x1c2d54.type === "debug");
        if (!_0x1f5400) {
          const _0xfd4bb0 = "debug-" + Date.now();
          a293_0x6e2506.addNode({
            id: _0xfd4bb0,
            type: "debug",
            x: _0x432ab0,
            y: _0x5f1f2f,
            ..._0x38ecd6,
            name: aigenAudioText("debug.nodeName"),
            outputText: _0x32d3c5
          });
        } else {
          a293_0x6e2506.updateNodeData(_0x1f5400.id, {
            outputText: _0x32d3c5,
            x: _0x432ab0,
            y: _0x5f1f2f
          });
        }
        window.showToast?.(aigenAudioText("debug.paramsShown"), "warn");
      } catch (_0x23b54c) {
        window.showToast?.(aigenAudioText("debug.buildRequestFailed", {
          error: _0x23b54c.message
        }), "error");
      }
    });
    bindNodeModelMenuTrigger({
      root: _0x20c4ff,
      trigger: _0x274756,
      menu: _0x5654dc,
      activateMenuKeyboard: activateMenuKeyboard
    });
    const _0x1054e4 = _0x517025 => {
      if (_0x517025.classList.contains("node-menu-group-header")) {
        return;
      }
      if (_0x517025.dataset.boundClick === "true") {
        return;
      }
      _0x517025.dataset.boundClick = "true";
      _0x517025.addEventListener("click", _0x202e82 => {
        _0x202e82.stopPropagation();
        if (_0x517025.dataset.disabled === "true") {
          return;
        }
        const _0x236f47 = String(_0x517025.dataset.value || "").trim();
        if (!_0x236f47) {
          return;
        }
        const _0x287ed5 = this._getCurrentWorkflow().key;
        this._setSelectedWorkflow(_0x236f47);
        if (this._getCurrentWorkflow().key !== _0x287ed5) {
          this._closeModelMenu();
        }
      });
    };
    _0x342fe3?.querySelectorAll(".floating-menu-item").forEach(_0x1054e4);
    _0x5654dc?.querySelectorAll(".node-menu-submenu .floating-menu-item").forEach(_0x1054e4);
    _0x40da9e?.addEventListener("click", _0x139419 => {
      _0x139419.stopPropagation();
    });
    this.btnEl?.addEventListener("click", () => {
      flushPromptHtmlCommit(this);
      this._handleGenerateOrCancel();
    });
  }
  mount() {
    const _0x42e7b3 = document.createElement("div");
    Object.assign(_0x42e7b3.style, {
      display: "flex",
      flexDirection: "column",
      height: "100%",
      overflow: "visible",
      pointerEvents: "auto",
      cursor: "default"
    });
    this._root = _0x42e7b3;
    _0x42e7b3.innerHTML = AUDIO_TOOLBAR_HTML;
    this.previewEl = document.createElement("div");
    this.previewEl.className = "node-card media-card audio-card aigen-audio-preview";
    this.previewEl.style.setProperty("width", "100%", "important");
    this.previewEl.style.setProperty("height", "100%", "important");
    this.previewEl.style.setProperty("min-height", "160px", "important");
    this.previewEl.style.setProperty("flex-shrink", "0", "important");
    this.previewEl.style.setProperty("flex-grow", "0", "important");
    this._audioCard = this.previewEl;
    const _0x252ad4 = document.createElement("div");
    _0x252ad4.className = "audio-main-surface";
    this._audioMainSurface = _0x252ad4;
    this.previewEl.appendChild(_0x252ad4);
    const _0x212819 = document.createElement("div");
    _0x212819.className = "waveform waveform-bg";
    _0x212819.innerHTML = "<svg width=\"100%\" height=\"80\" viewBox=\"0 0 200 80\" preserveAspectRatio=\"none\">\n      <path d=\"" + WAVE_PATH + "\" stroke=\"var(--blue)\" stroke-width=\"2\" stroke-linecap=\"round\"/>\n      <path d=\"M0,40 L200,40\" stroke=\"var(--blue)\" stroke-width=\"1\" stroke-dasharray=\"2 4\" opacity=\"0.4\"/>\n    </svg>";
    _0x252ad4.appendChild(_0x212819);
    this._waveBgEl = _0x212819;
    const _0xb95098 = document.createElement("div");
    _0xb95098.className = "waveform waveform-unplayed";
    _0xb95098.innerHTML = "<svg width=\"100%\" height=\"80\" viewBox=\"0 0 200 80\" preserveAspectRatio=\"none\">\n      <path d=\"" + WAVE_PATH + "\" stroke=\"var(--blue)\" stroke-width=\"2\" stroke-linecap=\"round\"/>\n      <path d=\"M0,40 L200,40\" stroke=\"var(--blue)\" stroke-width=\"1\" stroke-dasharray=\"2 4\" opacity=\"0.4\"/>\n    </svg>";
    _0x252ad4.appendChild(_0xb95098);
    this._wavePlayed = _0xb95098;
    const _0x4bb56e = this.previewEl.querySelectorAll(".waveform-bg svg path");
    const _0x193194 = this.previewEl.querySelectorAll(".waveform-unplayed svg path");
    this._waveBgPath = _0x4bb56e && _0x4bb56e.length ? _0x4bb56e[0] : null;
    this._waveFgPath = _0x193194 && _0x193194.length ? _0x193194[0] : null;
    const _0x1443f8 = document.createElement("div");
    _0x1443f8.className = "media-progress-line";
    _0x252ad4.appendChild(_0x1443f8);
    this._progressLine = _0x1443f8;
    const _0x527706 = document.createElement("div");
    _0x527706.className = "media-progress-bar";
    _0x252ad4.appendChild(_0x527706);
    this._bar = _0x527706;
    const _0xb0b3cb = document.createElement("div");
    _0xb0b3cb.className = "audio-controls";
    _0xb0b3cb.innerHTML = "\n      <button type=\"button\" class=\"audio-play-btn\">\n        <svg width=\"12\" height=\"12\" viewBox=\"0 0 24 24\" fill=\"currentColor\"><polygon points=\"5 3 19 12 5 21 5 3\"/></svg>\n      </button>\n      <div class=\"audio-time-wrap\">\n        <span class=\"audio-time-display\">0:00 / 0:00</span>\n      </div>";
    _0x252ad4.appendChild(_0xb0b3cb);
    this._controlsEl = _0xb0b3cb;
    this._playBtn = _0xb0b3cb.querySelector(".audio-play-btn");
    this._timeEl = _0xb0b3cb.querySelector(".audio-time-display");
    this.audioEl = document.createElement("audio");
    this.audioEl.className = "audio-player";
    this.audioEl.controls = false;
    this.audioEl.draggable = false;
    this.audioEl.preload = "none";
    this._progressController = createAudioPlaybackProgressController({
      audioEl: this.audioEl,
      wavePlayedEl: this._wavePlayed,
      progressLineEl: this._progressLine,
      timeEl: this._timeEl,
      trackEl: this._bar,
      formatTime: _0x4b3a56 => this._fmtTime(_0x4b3a56),
      shouldSuppressSync: () => this._isSeeking
    }).attach();
    const _0x3b6a8d = document.createElement("div");
    _0x3b6a8d.className = "img-node-placeholder";
    Object.assign(_0x3b6a8d.style, {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: "8px",
      color: "var(--text-muted)",
      pointerEvents: "none",
      userSelect: "none"
    });
    _0x3b6a8d.innerHTML = "\n            " + buildAudioPlaceholderSvg();
    this._placeholderEl = _0x3b6a8d;
    _0x252ad4.appendChild(this.audioEl);
    _0x252ad4.appendChild(_0x3b6a8d);
    syncPreviewNodeLoading(this.nodeId, this.previewEl, this._getPreviewGenerateButtonLoadingOptions());
    let _0x50c809 = {
      x: 0,
      y: 0
    };
    this.previewEl.addEventListener("pointerdown", _0x2d502a => {
      if (_0x2d502a.target.closest(".media-progress-bar")) {
        return;
      }
      _0x50c809 = {
        x: _0x2d502a.clientX,
        y: _0x2d502a.clientY
      };
    });
    this.previewEl.addEventListener("pointerup", _0xf103a6 => {
      if (_0xf103a6.target.closest(".media-progress-bar") || _0xf103a6.target.closest(".audio-play-btn") || _0xf103a6.target.closest(".audio-controls") || _0xf103a6.target.closest(".audio-multi-toggle-btn") || _0xf103a6.target.closest(".multi-stack-backplate")) {
        return;
      }
      const _0x388bf1 = Math.hypot(_0xf103a6.clientX - _0x50c809.x, _0xf103a6.clientY - _0x50c809.y);
      if (_0x388bf1 >= 5) {
        return;
      }
      if (!this.audioEl || !this.audioEl.duration) {
        return;
      }
      const _0x1e6508 = this.previewEl.getBoundingClientRect();
      const _0x519b9e = Math.max(0, Math.min(1, (_0xf103a6.clientX - _0x1e6508.left) / _0x1e6508.width));
      const _0x134530 = _0x519b9e * this.audioEl.duration;
      this.audioEl.currentTime = _0x134530;
      this._progressController?.sync({
        currentTime: _0x134530,
        duration: this.audioEl.duration,
        force: true,
        showLine: true
      });
    });
    this._bar?.addEventListener("click", _0x53c848 => {
      this._seekTo(_0x53c848.clientX);
    });
    this._playBtn?.addEventListener("pointerdown", _0x529b50 => {
      _0x529b50.stopPropagation();
      if (!this._currentSrc) {
        return;
      }
      if (this.audioEl.paused) {
        this._playAudio();
      } else {
        this.audioEl.pause();
      }
    });
    const _0x17dade = () => {
      if (this.prepareRendererVisibleAudioPlayback({
        eager: true
      })) {
        this.hydrateDeferredMedia();
      }
    };
    this._playBtn?.addEventListener("pointerenter", _0x17dade);
    this._playBtn?.addEventListener("focus", _0x17dade);
    this.audioEl.addEventListener("play", () => this._setPlayIcon(false));
    this.audioEl.addEventListener("pause", () => this._setPlayIcon(true));
    this._unregisterAudioPlaybackClient?.();
    this._unregisterAudioPlaybackClient = registerAudioPlaybackClient(this.nodeId, {
      stopForExternalPlayback: () => this._stopAudioForExternalPlayback()
    });
    const _0xc4f22 = this._resolveNodeAudioUrl(this._data);
    if (_0xc4f22) {
      if (this._rendererMediaDeferred) {
        this._prepareDeferredAudio(_0xc4f22);
      } else {
        this._prepareAudio(_0xc4f22);
        this._applyResultWideLayout(this._data, false);
        this._setAudioPreviewResultState(true);
        this._syncAudioMultiResultStack(this._data);
      }
    } else {
      this._setAudioPreviewResultState(false);
      this._syncStatusOverlay(this._data, false);
      this._syncAudioMultiResultStack(this._data);
    }
    _0x42e7b3.appendChild(this.previewEl);
    const _0x329f79 = document.createElement("div");
    _0x329f79.className = "text-prompt-panel";
    this._promptPanel = _0x329f79;
    this._syncModelProviderProfileControl();
    _0x329f79.addEventListener("pointerdown", _0x5b96a7 => {
      _0x5b96a7.stopPropagation();
    });
    _0x329f79.addEventListener("dblclick", _0x5a6cdc => {
      if (!_0x5a6cdc.target.closest(".prompt-textarea")) {
        _0x5a6cdc.preventDefault();
        _0x5a6cdc.stopPropagation();
      }
    });
    this.refBarEl = document.createElement("div");
    this.refBarEl.className = "node-ref-bar";
    _0x329f79.appendChild(this.refBarEl);
    this.refBarEl.addEventListener("click", _0x399c18 => {
      const _0x2475c5 = _0x399c18.target.closest(".ref-thumb-delete");
      if (_0x2475c5) {
        _0x399c18.stopPropagation();
        _0x399c18.preventDefault();
        const _0x63db9 = _0x2475c5.closest(".ref-thumb-wrap");
        if (_0x63db9?.dataset?.refOrigin === "asset") {
          const _0xfc9644 = {
            assetId: _0x63db9.dataset.assetId,
            assetIndex: _0x63db9.dataset.assetIndex,
            type: _0x63db9.dataset.refType || _0x63db9.dataset.kind || "audio",
            occurrence: _0x63db9.dataset.assetOccurrence
          };
          const _0x34a04f = String(_0x63db9.dataset.assetRefSource || "").trim();
          const _0x1404ff = _0x34a04f === "hidden" ? removePromptAssetInputRefFromNode(this, _0xfc9644) : removeAssetMentionPillFromPrompt(this, _0xfc9644) || removePromptAssetInputRefFromNode(this, _0xfc9644);
          if (_0x1404ff) {
            return;
          }
        }
        const _0x43011e = _0x63db9?.dataset.edgeId;
        if (_0x43011e) {
          a293_0x6e2506.removeEdge(_0x43011e);
        }
        return;
      }
      const _0x521a19 = _0x399c18.target.closest(".rh-v5-ref-box[data-slot]");
      if (_0x521a19) {
        _0x399c18.stopPropagation();
        _0x399c18.preventDefault();
        const _0x587949 = String(_0x521a19.dataset.slot || "").trim();
        if (!_0x587949 || !this._audioRefUploadInput) {
          return;
        }
        this._audioRefUploadSlot = _0x587949;
        this._audioRefUploadAnchorNodeId = this.nodeId;
        this._audioRefUploadInput.accept = "audio/*";
        this._audioRefUploadInput.click();
        return;
      }
      const _0x3e2caa = _0x399c18.target.closest(".prompt-attachment-btn");
      if (!_0x3e2caa || _0x399c18._pickConnectHandled) {
        return;
      }
      _0x399c18.stopPropagation();
      _0x399c18.preventDefault();
      const _0x57dd93 = a293_0x6e2506.getState().pickConnectMode;
      if (_0x57dd93 && _0x57dd93.active && _0x57dd93.sourceNodeId === this.nodeId) {
        a293_0x6e2506.setPickConnectMode({
          active: false
        });
      } else {
        a293_0x6e2506.setPickConnectMode({
          active: true,
          sourceNodeId: this.nodeId,
          handleDirection: "left",
          preferredRefSlot: undefined
        });
      }
      this._syncPickConnectVisualState();
    });
    this.refBarEl.addEventListener("pointerdown", _0x2ceed2 => {
      if (_0x2ceed2.target.closest(".prompt-attachment-btn, .ref-thumb-delete, .ref-upload-slot, .rh-v5-ref-box")) {
        _0x2ceed2.stopPropagation();
      }
    });
    this._unbindRefThumbHoverPreview = bindRefThumbHoverPreview(this.refBarEl);
    this._audioRefUploadInput = document.createElement("input");
    this._audioRefUploadInput.type = "file";
    this._audioRefUploadInput.accept = "audio/*";
    this._audioRefUploadInput.style.display = "none";
    _0x329f79.appendChild(this._audioRefUploadInput);
    this._audioRefUploadInput.addEventListener("change", async _0x52ee22 => {
      const _0x1e76c8 = _0x52ee22.target.files?.[0];
      const _0x554aa3 = String(this._audioRefUploadSlot || "").trim();
      const _0x9a413c = String(this._audioRefUploadAnchorNodeId || "").trim();
      if (!_0x1e76c8 || !_0x554aa3 || !_0x9a413c) {
        this._audioRefUploadInput.value = "";
        return;
      }
      try {
        if (!String(_0x1e76c8.type || "").startsWith("audio/")) {
          throw new Error(aigenAudioText("upload.audioOnly"));
        }
        const _0x20dbbf = window.currentProjectId || "default_v2_project";
        const _0x57b938 = await uploadFile(_0x1e76c8, _0x20dbbf);
        const _0x42455b = String(_0x57b938?.url || "").trim();
        if (!_0x42455b) {
          throw new Error(aigenAudioText("upload.missingUrl"));
        }
        const _0x59152d = a293_0x6e2506.getState();
        const _0x2cf356 = _0x59152d.nodes?.[_0x9a413c];
        if (!_0x2cf356) {
          throw new Error(aigenAudioText("upload.anchorMissing"));
        }
        const _0x2e0172 = pickResultLocalPath(_0x57b938) || normalizeLocalPath(_0x42455b);
        const _0x1b2254 = 320;
        const _0x4bb18e = 140;
        const {
          spacing: _0x4ff050,
          direction: _0x39b056,
          avoidOverlap: _0x1e0e1f
        } = getNodeSpawnPrefs();
        const _0xf3ea0c = _0x39b056 === "down" ? "down" : "left";
        const _0xd7f01 = Number(_0x2cf356.x) || 0;
        const _0x2836f5 = Number(_0x2cf356.y) || 0;
        const _0x400479 = Number(_0x2cf356.width) || 360;
        const _0x44e3e9 = Number(_0x2cf356.height) || 360;
        const _0x5d202f = _0x2836f5 + Math.round((_0x44e3e9 - _0x4bb18e) / 2);
        let _0x2d746d = _0x5d202f;
        if (_0x554aa3 === "audioRef" && this._getCurrentWorkflow().key === "voice_convert") {
          _0x2d746d = _0x5d202f - Math.round(_0x4bb18e / 2) - 8;
        } else if (_0x554aa3 === "audioTarget" && this._getCurrentWorkflow().key === "voice_convert") {
          _0x2d746d = _0x5d202f + Math.round(_0x4bb18e / 2) + 8;
        }
        const _0x421b4c = _0xd7f01 - _0x4ff050 - _0x1b2254;
        const _0x25d0fc = _0x1e0e1f ? findAvailablePosition(_0x59152d.nodes || {}, _0x421b4c, _0xf3ea0c === "down" ? _0x2836f5 + _0x44e3e9 + _0x4ff050 : _0x2d746d, _0x1b2254, _0x4bb18e, _0x4ff050, _0xf3ea0c) : {
          x: _0x421b4c,
          y: _0xf3ea0c === "down" ? _0x2836f5 + _0x44e3e9 + _0x4ff050 : _0x2d746d
        };
        a293_0x6e2506.batch(() => {
          const _0x3c6847 = a293_0x6e2506.getIncomingEdges(this.nodeId);
          for (const _0x4ae6d7 of _0x3c6847) {
            if (String(_0x4ae6d7?.refSlot || "") === _0x554aa3) {
              a293_0x6e2506.removeEdge(_0x4ae6d7.id);
            }
          }
          removeCoveredAssetInputRefForConnection({
            targetId: this.nodeId,
            sourceKind: "audio",
            refSlot: _0x554aa3
          });
          const _0x32321b = generateId("node");
          a293_0x6e2506.addNode({
            id: _0x32321b,
            type: "source-audio",
            x: _0x25d0fc.x,
            y: _0x25d0fc.y,
            width: _0x1b2254,
            height: _0x4bb18e,
            src: _0x42455b,
            localPath: _0x2e0172,
            assetId: _0x57b938.assetId || "",
            originalLocalPath: _0x57b938.originalLocalPath || _0x57b938.localPath || "",
            waveformLocalPath: _0x57b938.waveformLocalPath || "",
            derivativeStatus: _0x57b938.derivativeStatus || _0x57b938.status || "",
            mediaTaskId: _0x57b938.mediaTaskId || "",
            mediaTaskKind: _0x57b938.mediaTaskKind || "",
            mediaTaskStatus: _0x57b938.mediaTaskStatus || "",
            mediaTaskProgress: Number(_0x57b938.mediaTaskProgress || 0) || 0,
            mediaTaskError: _0x57b938.mediaTaskError || "",
            fileName: _0x57b938.filename || _0x1e76c8.name || "",
            name: _0x1e76c8.name || aigenAudioText("upload.sourceAudioName")
          });
          a293_0x6e2506.addEdge({
            id: generateId("edge"),
            sourceId: _0x32321b,
            targetId: this.nodeId,
            refSlot: _0x554aa3,
            createdAt: Date.now()
          });
          a293_0x6e2506.setSelectedNodes([this.nodeId]);
        });
        this._updateSubmitButtonState();
      } catch (_0x38110b) {
        window.showToast?.(_0x38110b?.message || aigenAudioText("upload.failedRetry"), "error");
      } finally {
        this._audioRefUploadInput.value = "";
        this._audioRefUploadSlot = "";
        this._audioRefUploadAnchorNodeId = "";
      }
    });
    const _0x2f82a3 = document.createElement("div");
    _0x2f82a3.className = "prompt-input-wrapper";
    this._promptInputWrap = _0x2f82a3;
    this.promptEl = document.createElement("div");
    this.promptEl.className = "prompt-textarea custom-textarea";
    this.promptEl.contentEditable = "true";
    this.promptEl.spellcheck = false;
    syncAudioPromptPlaceholder(this.promptEl, this._getCurrentWorkflow().key);
    this._flushPromptHtmlCommit = () => flushPromptHtmlCommit(this);
    this.promptEl.addEventListener("input", _0x4a987e => {
      schedulePromptHtmlCommit(this);
      checkSlashTrigger(_0x4a987e, {
        promptEl: this.promptEl,
        nodeType: this._data.type,
        nodeId: this.nodeId,
        onGenerate: (_0x43333d, _0x4de3a6) => this._onGenerate(_0x43333d, _0x4de3a6)
      });
      _checkAtTrigger(this, _0x4a987e);
      if (shouldSkipPromptTriggerForBulkInput(_0x4a987e)) {
        return;
      }
      _syncEdgesOrderFromPills(this);
      this._updateSubmitButtonState();
    });
    this.promptEl.addEventListener("blur", () => {
      flushPromptHtmlCommit(this);
    });
    this.promptEl.addEventListener("mouseover", _0xe550f7 => _handlePillHover(_0xe550f7, this));
    this.promptEl.addEventListener("mouseout", _0x270c32 => _handlePillOut(_0x270c32, this));
    this.promptEl.addEventListener("keydown", _0x313469 => {
      if (handlePromptSelectAll(this, _0x313469)) {
        return;
      }
      if (_handleMentionMenuKeyboard(_0x313469)) {
        return;
      }
      if (handleSlashKeyboardNavigation(_0x313469)) {
        return;
      }
      if (shouldSubmitPromptByKeyboard(_0x313469)) {
        _0x313469.preventDefault();
        flushPromptHtmlCommit(this);
        this.btnEl?.click();
        return;
      }
      _handlePillKeyboard(this, _0x313469);
    });
    this.promptEl.addEventListener("paste", _0x5c4209 => {
      handlePromptPaste(this, _0x5c4209);
    });
    if (!this._rendererDetailsDeferred && this._data.prompt) {
      this.promptEl.innerHTML = sanitizePromptHtml(this._data.prompt);
      _rehydratePromptPills(this);
    }
    _0x2f82a3.appendChild(this.promptEl);
    _0x329f79.appendChild(_0x2f82a3);
    this._promptPresetTrigger = createPromptPresetTriggerController({
      panel: _0x329f79,
      getPromptEl: () => this.promptEl,
      getNodeType: () => this._data?.type,
      getNodeId: () => this.nodeId,
      onGenerate: (_0xbca000, _0x55242b) => this._onGenerate(_0xbca000, _0x55242b)
    });
    if (!this._rendererDetailsDeferred) {
      this._syncPromptBoxSizeFromData(this._data);
      this._setupPromptBoxResize();
      this._syncWorkflowDefaults();
      this._syncPromptInputVisibility();
      this._syncAudioPromptHelpTip();
    }
    const _0x4a67d3 = document.createElement("div");
    _0x4a67d3.className = "prompt-panel-footer";
    this._renderInitialFooter(_0x4a67d3);
    this._docClickHandler = null;
    _0x329f79.appendChild(_0x4a67d3);
    _0x42e7b3.appendChild(_0x329f79);
    const _0x54b542 = _0x42e7b3.querySelector(".node-floating-toolbar");
    if (_0x54b542) {
      _0x54b542.addEventListener("pointerdown", _0x500ddf => _0x500ddf.stopPropagation());
      const _0x5d7a5c = _0x54b542.querySelector(".act-clip, .clip-btn");
      const _0x5e5c46 = _0x54b542.querySelector(".act-separate, .separate-btn");
      const _0x41c80c = _0x54b542.querySelector(".act-voice-studio");
      const _0x56efd9 = _0x54b542.querySelector(".act-speed, .speed-btn");
      const _0x505137 = _0x54b542.querySelector(".act-upload");
      const _0x1da854 = _0x54b542.querySelector(".act-download, .download-btn");
      const _0x3882fe = [1, 1.25, 1.5, 2];
      _0x5d7a5c?.addEventListener("pointerdown", _0x243a96 => {
        _0x243a96.stopPropagation();
        a293_0x360103.init(this.nodeId);
      });
      bindRunningHubToolbarTaskButton({
        button: _0x5e5c46,
        getTask: () => getRunningAudioSeparationTaskForNode(this.nodeId),
        cancelTask: () => cancelAudioSeparationTaskForNode(this.nodeId, {
          notify: true
        }),
        cancelTooltip: aigenAudioText("toolbar.cancelAudioSeparation"),
        eventTypes: ["pointerdown", "click"]
      });
      _0x5e5c46?.addEventListener("pointerdown", _0x5333ce => {
        if (getRunningAudioSeparationTaskForNode(this.nodeId)) {
          _0x5333ce.preventDefault();
          _0x5333ce.stopPropagation();
          cancelAudioSeparationTaskForNode(this.nodeId, {
            notify: true
          });
          return;
        }
        _0x5333ce.stopPropagation();
        runAudioSeparationFromNode(this.nodeId);
      });
      _0x56efd9?.addEventListener("pointerdown", _0x3fd3e5 => {
        _0x3fd3e5.stopPropagation();
        this._speedIdx = (this._speedIdx + 1) % _0x3882fe.length;
        const _0x10431 = _0x3882fe[this._speedIdx];
        if (this.audioEl) {
          this.audioEl.playbackRate = _0x10431;
        }
        _0x56efd9.textContent = _0x10431.toFixed(1) + "x";
      });
      bindPreviewUploadToolbarAction({
        button: _0x505137
      });
      bindAudioDownloadAction({
        button: _0x1da854,
        getNodeData: () => a293_0x6e2506.getState().nodes?.[this.nodeId] || this._data || {},
        getAudioElement: () => this.audioEl,
        notifyMissing: () => window.showToast?.(aigenAudioText("download.missingAudio"), "warn")
      });
      bindAudioVoiceStudioAction({
        button: _0x41c80c,
        getNodeId: () => this.nodeId
      });
    }
    if (!this._rendererDetailsDeferred) {
      this._renderRefBar();
    }
    this._assetMentionRegistryUnsubscribe?.();
    this._assetMentionRegistryUnsubscribe = subscribeAssetMentionRegistry(() => {
      if (this._assetMentionRegistryRefreshPending) {
        return;
      }
      this._assetMentionRegistryRefreshPending = true;
      queueMicrotask(() => {
        this._assetMentionRegistryRefreshPending = false;
        if (!a293_0x6e2506.getState().nodes?.[this.nodeId]) {
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
    this._syncPickConnectVisualState();
    if (!this._rendererDetailsDeferred) {
      this._syncLocaleTexts();
    }
    this._unsubscribeLocale = onLocaleChange(() => {
      this._syncLocaleTexts({
        rerenderRefs: true
      });
    });
    queueMicrotask(() => {
      if (a293_0x6e2506.getState().nodes?.[this.nodeId]) {
        this._maybeResumeRunningHubTask();
      }
    });
    return _0x42e7b3;
  }
  hydrateDeferredDetails() {
    if (this._rendererDetailsDeferred !== true) {
      return false;
    }
    this._rendererDetailsDeferred = false;
    this._data = a293_0x6e2506.getState?.()?.nodes?.[this.nodeId] || this._data;
    this._syncWorkflowDefaults();
    this._data = a293_0x6e2506.getState?.()?.nodes?.[this.nodeId] || this._data;
    if (this.promptEl && document.activeElement !== this.promptEl && this._data?.prompt !== undefined) {
      if (!isVirtualizedPromptEditorCurrent(this, this._data.prompt)) {
        const _0x3ad5d0 = sanitizePromptHtml(this._data.prompt || "");
        if (this.promptEl.innerHTML !== _0x3ad5d0) {
          clearVirtualizedPromptCommit(this);
          this.promptEl.innerHTML = _0x3ad5d0;
          _rehydratePromptPills(this);
        }
      }
    }
    this._syncPromptBoxSizeFromData(this._data);
    this._setupPromptBoxResize();
    this._syncPromptInputVisibility();
    this._syncAudioPromptHelpTip();
    this._syncModelProviderProfileControl();
    this._renderFooter(this.footerEl);
    this._renderRefBar();
    this._syncPickConnectVisualState();
    this._syncLocaleTexts();
    return true;
  }
  _syncLocaleTexts(_0x33948e = {}) {
    if (this._rendererDetailsDeferred) {
      return;
    }
    if (this.promptEl) {
      syncAudioPromptPlaceholder(this.promptEl, this._getCurrentWorkflow().key);
    }
    this._root?.querySelector?.(".debug-wrench-btn")?.setAttribute?.("title", aigenAudioText("debug.buttonTitle"));
    if (_0x33948e.rerenderRefs === true && this.refBarEl) {
      this._refBarWorkflowKey = "";
      this._renderRefBar();
    }
    this._updateSubmitButtonState();
  }
  _updateSubmitButtonState() {
    if (!this.btnEl) {
      return;
    }
    const _0x55d0fb = getStoreSnapshot().nodes?.[this.nodeId] || this._data || {};
    const _0x1c9043 = resolveGenerationButtonMode(_0x55d0fb, {
      cancellable: String(_0x55d0fb?.provider || "runninghubwf").toLowerCase() === "runninghubwf",
      cancelInFlight: this._rhCancelInFlight === true
    });
    if (_0x1c9043.busy) {
      if (String(_0x55d0fb?.provider || "runninghubwf").toLowerCase() === "runninghubwf") {
        setGenerateButtonCancellableUi(this.btnEl, {
          title: aigenAudioText("buttons.generateCancellable"),
          tooltip: aigenAudioText("buttons.generateCancellable"),
          ariaLabel: aigenAudioText("buttons.cancelAudioGeneration"),
          color: "var(--red)",
          busy: true
        });
      } else {
        setGenerateButtonLoadingUi(this.btnEl, {
          title: aigenAudioText("buttons.generate"),
          disabled: true,
          ariaLabel: aigenAudioText("buttons.generate")
        });
      }
      this.btnEl.disabled = _0x1c9043.disabled;
      this.btnEl.style.cursor = _0x1c9043.cursor;
      return;
    }
    resetGenerateButtonIdleUi(this.btnEl, aigenAudioText("buttons.generate"));
    resetModelCredentialButtonState(this.btnEl);
    const {
      payload: _0x3d5f17,
      validation: _0xd5b57f
    } = this._buildPayloadSnapshot();
    const _0x194d89 = _0xd5b57f.ok && !!_0x3d5f17.audioWorkflowKey;
    if (!_0x194d89) {
      this.btnEl.disabled = true;
      this.btnEl.style.cursor = "var(--unavailable-cursor)";
    } else {
      this.btnEl.disabled = false;
      this.btnEl.style.cursor = "";
      applyModelCredentialButtonState(this.btnEl, {
        modelId: _0x3d5f17.audioWorkflowKey || _0x55d0fb?.model,
        provider: _0x3d5f17.provider || _0x55d0fb?.provider,
        providerProfileId: _0x3d5f17.providerProfileId || _0x55d0fb?.providerProfileId || _0x55d0fb?.rhProviderProfileId,
        adapterType: _0x3d5f17.adapterType
      });
    }
  }
  _getAudioElementSource() {
    return getMediaElementPlaybackSourceKey(this.audioEl);
  }
  _getAudioElementCurrentSource() {
    return getMediaElementCurrentSource(this.audioEl);
  }
  _isAudioElementReady() {
    if (!this.audioEl || !this._getAudioElementCurrentSource()) {
      return false;
    }
    const _0x48aaf4 = Number(this.audioEl.readyState || 0);
    return _0x48aaf4 >= 2;
  }
  _readAudioDurationSec() {
    const _0x40209f = normalizeAudioDurationSec(this.audioEl?.duration);
    const _0x1c4132 = getStoreSnapshot().nodes?.[this.nodeId];
    const _0x53ceaf = pickAudioDurationSec(_0x1c4132?.audioDuration, !_0x1c4132 ? this._data?.audioDuration : 0, !_0x1c4132 ? this._data?.duration : 0);
    if (_0x53ceaf > 0) {
      if (!(_0x40209f > 0)) {
        return _0x53ceaf;
      }
      const _0x352203 = Math.max(1, _0x53ceaf * 0.25);
      if (Math.abs(_0x53ceaf - _0x40209f) > _0x352203) {
        return _0x53ceaf;
      }
    }
    return _0x40209f;
  }
  _syncKnownAudioDurationUi({
    currentTime = 0,
    showLine = false
  } = {}) {
    const _0x14e0ee = this._readAudioDurationSec();
    if (!(_0x14e0ee > 0)) {
      return false;
    }
    const _0x33adae = Number(currentTime);
    const _0x454318 = Number.isFinite(_0x33adae) ? Math.max(0, Math.min(_0x33adae, _0x14e0ee)) : 0;
    const _0x4cf0eb = this._progressController?.sync({
      currentTime: _0x454318,
      duration: _0x14e0ee,
      force: true,
      showLine: showLine
    });
    if (!showLine) {
      this._progressController?.hideLine?.();
    }
    if (!_0x4cf0eb && this._timeEl) {
      this._timeEl.textContent = this._fmtTime(_0x454318) + " / " + this._fmtTime(_0x14e0ee);
    }
    return true;
  }
  _applyResolvedAudioDuration(_0x2f0d9a, _0x7f2ddd = this._currentSrc) {
    if (_0x7f2ddd && this._currentSrc !== _0x7f2ddd) {
      return false;
    }
    const _0x1ac39d = normalizeAudioDurationSec(_0x2f0d9a);
    if (!(_0x1ac39d > 0)) {
      return false;
    }
    const _0x5297e2 = getStoreSnapshot().nodes?.[this.nodeId];
    const _0x447b55 = pickAudioDurationSec(_0x5297e2?.audioDuration, this._data?.audioDuration, this._data?.duration);
    if (_0x447b55 > 0) {
      if (Math.abs(_0x447b55 - _0x1ac39d) <= 0.001) {
        return this._syncKnownAudioDurationUi({
          currentTime: this.audioEl?.currentTime || 0,
          showLine: Number(this.audioEl?.currentTime || 0) > 0
        });
      }
      const _0x478548 = Math.max(1, _0x447b55 * 0.25);
      if (Math.abs(_0x447b55 - _0x1ac39d) > _0x478548) {
        return false;
      }
    }
    if (_0x5297e2) {
      a293_0x6e2506.updateNodeData(this.nodeId, {
        audioDuration: _0x1ac39d
      });
      this._data = {
        ...(this._data || {}),
        audioDuration: _0x1ac39d
      };
      this._syncKnownAudioDurationUi({
        currentTime: this.audioEl?.currentTime || 0,
        showLine: Number(this.audioEl?.currentTime || 0) > 0
      });
    } else {
      this._data = {
        ...(this._data || {}),
        audioDuration: _0x1ac39d
      };
      this._syncKnownAudioDurationUi({
        currentTime: this.audioEl?.currentTime || 0,
        showLine: Number(this.audioEl?.currentTime || 0) > 0
      });
    }
    return true;
  }
  _rememberAudioDuration(_0x1a69a9 = this._currentSrc) {
    if (!this.audioEl || _0x1a69a9 && this._currentSrc !== _0x1a69a9) {
      return;
    }
    const _0x23735b = this._readAudioDurationSec();
    if (!(_0x23735b > 0)) {
      return;
    }
    this._applyResolvedAudioDuration(_0x23735b, _0x1a69a9);
  }
  _rewindEndedAudioIfNeeded() {
    if (!this.audioEl) {
      return;
    }
    const _0x33da2e = this._readAudioDurationSec();
    if (!(_0x33da2e > 0)) {
      return;
    }
    const _0xf3fc73 = Number(this.audioEl.currentTime || 0);
    const _0x3f6e51 = Number.isFinite(_0xf3fc73) && _0xf3fc73 >= _0x33da2e - 0.05;
    if (this.audioEl.ended !== true && !_0x3f6e51) {
      return;
    }
    try {
      this.audioEl.currentTime = 0;
    } catch {}
    this._progressController?.sync({
      currentTime: 0,
      duration: _0x33da2e,
      force: true,
      showLine: true
    });
  }
  _clearAudioElementSource() {
    if (!this.audioEl) {
      return;
    }
    this._audioPlayAttemptToken = Number(this._audioPlayAttemptToken || 0) + 1;
    if (this._audioPlayDeadlineTimer) {
      clearTimeout(this._audioPlayDeadlineTimer);
      this._audioPlayDeadlineTimer = null;
    }
    this._audioLoadToken = Number(this._audioLoadToken || 0) + 1;
    this._audioLoadInFlightSource = "";
    this._audioLoadInFlightPreload = "";
    try {
      this.audioEl.pause?.();
    } catch {}
    this.audioEl.removeAttribute?.("src");
    clearDesktopMediaPlaybackSourceMetadata(this.audioEl);
    this.audioEl.preload = "none";
    try {
      this.audioEl.load?.();
    } catch {}
  }
  _bindAudioLoadHandlers(_0x1c405d) {
    if (!this.audioEl) {
      return;
    }
    const _0x531dd3 = () => {
      if (this._currentSrc === _0x1c405d) {
        this._rememberAudioDuration(_0x1c405d);
      }
    };
    const _0x71fe32 = () => {
      if (this._currentSrc === _0x1c405d) {
        this._rememberAudioDuration(_0x1c405d);
        stopLoading(this.previewEl);
      }
    };
    this.audioEl.onloadedmetadata = _0x531dd3;
    this.audioEl.ondurationchange = _0x531dd3;
    this.audioEl.onloadeddata = _0x71fe32;
    this.audioEl.oncanplay = _0x71fe32;
    this.audioEl.onplaying = _0x71fe32;
    this.audioEl.onerror = () => {
      if (this._currentSrc === _0x1c405d) {
        stopLoading(this.previewEl);
      }
    };
  }
  _prepareAudio(_0x3ac188) {
    const _0x5b7054 = String(_0x3ac188 || "").trim();
    if (!_0x5b7054) {
      if (typeof this._cancelDeferredWaveform === "function") {
        this._cancelDeferredWaveform();
        this._cancelDeferredWaveform = null;
      }
      this._clearAudioElementSource();
      this._currentSrc = null;
      this._progressController?.reset();
      this._audioDurationProbeToken += 1;
      return false;
    }
    const _0x62e226 = this._currentSrc !== _0x5b7054;
    this._currentSrc = _0x5b7054;
    this._clearStatusOverlay();
    if (_0x62e226) {
      this._progressController?.reset();
    }
    const _0x511fcb = !!this._getAudioElementCurrentSource();
    const _0x550d75 = _0x511fcb && isMediaElementPlaybackSource(this.audioEl, _0x5b7054);
    if (this._getAudioElementSource() && !_0x550d75) {
      this._clearAudioElementSource();
    }
    if (!_0x550d75) {
      this.audioEl.preload = "none";
    }
    this._bindAudioLoadHandlers(_0x5b7054);
    this._syncKnownAudioDurationUi({
      currentTime: 0,
      showLine: false
    });
    stopLoading(this.previewEl);
    this._ensureWaveform(_0x5b7054, {
      persistedOnly: true
    });
    if (this._placeholderEl) {
      this._placeholderEl.style.display = "none";
    }
    this._setAudioPreviewResultState(true);
    this._syncStatusOverlay(this._data, true);
    return true;
  }
  _prepareDeferredAudio(_0x35aca1) {
    const _0x4532be = String(_0x35aca1 || "").trim();
    if (!_0x4532be) {
      return this._prepareAudio("");
    }
    this._currentSrc = _0x4532be;
    this._audioDurationProbeToken += 1;
    if (typeof this._cancelDeferredWaveform === "function") {
      this._cancelDeferredWaveform();
      this._cancelDeferredWaveform = null;
    }
    this._clearStatusOverlay();
    this._progressController?.reset?.();
    this._syncKnownAudioDurationUi({
      currentTime: 0,
      showLine: false
    });
    if (this._placeholderEl) {
      this._placeholderEl.style.display = "none";
    }
    this._setAudioPreviewResultState(true);
    this._syncStatusOverlay(this._data, true);
    return true;
  }
  prepareRendererVisibleAudioPlayback({
    eager = false
  } = {}) {
    if (!this.audioEl || !this._currentSrc) {
      return false;
    }
    const _0x3d20a4 = eager === true ? "auto" : "metadata";
    if (this._audioLoadInFlightSource === this._currentSrc) {
      if (_0x3d20a4 !== "auto" || this._audioLoadInFlightPreload === "auto") {
        return false;
      }
    }
    const _0x507a10 = !!this._getAudioElementCurrentSource();
    const _0x26c917 = Number(this.audioEl.readyState || 0);
    const _0x54a59b = Number(this.audioEl.networkState || 0);
    if (_0x507a10 && (this._isAudioElementReady() || _0x54a59b === 2 || _0x3d20a4 === "metadata" && this.audioEl.preload === "metadata" && _0x26c917 >= 1)) {
      return false;
    }
    if (_0x3d20a4 === "auto" || this._rendererAudioWarmupPreload !== "auto") {
      this._rendererAudioWarmupPreload = _0x3d20a4;
    }
    return true;
  }
  async hydrateDeferredMedia() {
    if (this._rendererMediaDeferred) {
      this._rendererMediaDeferred = false;
    }
    const _0x75a8c6 = this._resolveNodeAudioUrl(this._data);
    if (_0x75a8c6) {
      this._prepareAudio(_0x75a8c6);
      this._applyResultWideLayout(this._data, false);
      this._syncAudioMultiResultStack(this._data);
    } else {
      this._setAudioPreviewResultState(false);
      this._syncStatusOverlay(this._data, false);
      this._syncAudioMultiResultStack(this._data);
    }
    const _0x59994f = this._rendererAudioWarmupPreload || "metadata";
    this._rendererAudioWarmupPreload = "";
    if (!_0x75a8c6 || !this.audioEl) {
      return false;
    }
    try {
      return await this._loadAudio(_0x75a8c6, {
        showLoading: false,
        preload: _0x59994f
      });
    } catch {
      stopLoading(this.previewEl);
      return false;
    }
  }
  async _loadAudio(_0x1b2e96, {
    showLoading = true,
    preload = "auto"
  } = {}) {
    const _0x4049db = String(_0x1b2e96 || "").trim();
    if (!_0x4049db) {
      return this._prepareAudio("");
    }
    const _0x1ddb1b = preload === "metadata" ? "metadata" : "auto";
    const _0x1b28be = this._currentSrc !== _0x4049db;
    this._currentSrc = _0x4049db;
    this._clearStatusOverlay();
    if (_0x1b28be) {
      this._progressController?.reset();
    }
    this._bindAudioLoadHandlers(_0x4049db);
    const _0x369bc9 = Number(this._audioLoadToken || 0) + 1;
    this._audioLoadToken = _0x369bc9;
    this._audioLoadInFlightSource = _0x4049db;
    this._audioLoadInFlightPreload = _0x1ddb1b;
    try {
      const _0x18b6e2 = !!this._getAudioElementCurrentSource();
      const _0x46fac2 = !isMediaElementPlaybackSource(this.audioEl, _0x4049db) || !_0x18b6e2;
      const _0x4b8dca = _0x1ddb1b === "auto" && Number(this.audioEl?.networkState || 0) === 1;
      if (!_0x46fac2 && this._isAudioElementReady()) {
        if (_0x1ddb1b === "auto" && this.audioEl.preload !== "auto") {
          this.audioEl.preload = "auto";
        }
        stopLoading(this.previewEl);
        return true;
      }
      if (showLoading && (_0x46fac2 || _0x4b8dca)) {
        startLoading(this.previewEl);
      }
      if (!_0x46fac2) {
        const _0x1738bb = _0x1ddb1b === "auto" || this.audioEl.preload === "auto" ? "auto" : "metadata";
        if (this.audioEl.preload !== _0x1738bb || _0x4b8dca) {
          this.audioEl.preload = _0x1738bb;
          try {
            this.audioEl.load?.();
          } catch {}
        }
      } else {
        await attachMediaElementPlaybackSource(this.audioEl, _0x4049db, {
          preload: _0x1ddb1b,
          warmRanges: false,
          shouldAssign: () => this._audioLoadToken === _0x369bc9 && this._currentSrc === _0x4049db && this.audioEl?.isConnected !== false
        });
      }
      if (this._isAudioElementReady()) {
        stopLoading(this.previewEl);
      }
      if (typeof this._cancelDeferredWaveform === "function") {
        this._cancelDeferredWaveform();
        this._cancelDeferredWaveform = null;
      }
      this._cancelDeferredWaveform = deferWaveformPathUntilAudioReady(this.audioEl, () => {
        this._cancelDeferredWaveform = null;
        if (this._currentSrc !== _0x4049db) {
          return;
        }
        this._ensureWaveform(_0x4049db);
      });
      if (this._placeholderEl) {
        this._placeholderEl.style.display = "none";
      }
      this._setAudioPreviewResultState(true);
      this._syncStatusOverlay(this._data, true);
      return true;
    } finally {
      if (this._audioLoadToken === _0x369bc9) {
        this._audioLoadInFlightSource = "";
        this._audioLoadInFlightPreload = "";
      }
    }
  }
  async _playAudio() {
    if (!this.audioEl || !this._currentSrc) {
      return;
    }
    beginAudioPlayback(this.nodeId);
    const _0x46052c = this._currentSrc;
    const _0x588e89 = Number(this._audioPlayAttemptToken || 0) + 1;
    this._audioPlayAttemptToken = _0x588e89;
    if (this._audioPlayDeadlineTimer) {
      clearTimeout(this._audioPlayDeadlineTimer);
    }
    const _0x35afea = () => {
      if (this._audioPlayAttemptToken !== _0x588e89) {
        return;
      }
      if (this._audioPlayDeadlineTimer) {
        clearTimeout(this._audioPlayDeadlineTimer);
        this._audioPlayDeadlineTimer = null;
      }
    };
    this._audioPlayDeadlineTimer = setTimeout(() => {
      if (this._audioPlayAttemptToken !== _0x588e89 || this._currentSrc !== _0x46052c) {
        return;
      }
      this._audioPlayDeadlineTimer = null;
      this._audioLoadToken = Number(this._audioLoadToken || 0) + 1;
      this._audioLoadInFlightSource = "";
      this._audioLoadInFlightPreload = "";
      try {
        this.audioEl.pause?.();
      } catch {}
      stopLoading(this.previewEl);
      this._setIcon?.(true);
    }, AUDIO_PLAY_LOADING_DEADLINE_MS);
    let _0x4e82d7 = false;
    try {
      _0x4e82d7 = await this._loadAudio(this._currentSrc, {
        showLoading: true
      });
    } catch (_0x23f00c) {
      _0x35afea();
      stopLoading(this.previewEl);
      if (_0x23f00c?.name !== "AbortError") {
        console.warn("[AIGenAudioNode] load failed:", _0x23f00c);
      }
      return;
    }
    if (!_0x4e82d7 || !this._getAudioElementCurrentSource()) {
      _0x35afea();
      stopLoading(this.previewEl);
      return;
    }
    this._rewindEndedAudioIfNeeded();
    const _0x18903c = this.audioEl.play();
    if (_0x18903c && typeof _0x18903c.catch === "function") {
      _0x18903c.then(() => {
        _0x35afea();
        stopLoading(this.previewEl);
      }).catch(_0x2fee7a => {
        _0x35afea();
        stopLoading(this.previewEl);
        if (_0x2fee7a?.name === "AbortError") {
          return;
        }
        console.warn("[AIGenAudioNode] play failed:", _0x2fee7a);
      });
    } else {
      _0x35afea();
      stopLoading(this.previewEl);
    }
  }
  _stopAudioForExternalPlayback() {
    if (!this.audioEl) {
      return;
    }
    if (typeof this._cancelDeferredWaveform === "function") {
      this._cancelDeferredWaveform();
      this._cancelDeferredWaveform = null;
    }
    try {
      this.audioEl.pause?.();
    } catch {}
    if (!this._getAudioElementCurrentSource()) {
      this._progressController?.reset();
    }
    stopLoading(this.previewEl);
    this._setPlayIcon(true);
  }
  suspendRendererMedia() {
    this._rendererAudioWarmupPreload = "";
    if (!this.audioEl || this.audioEl.paused === false) {
      return false;
    }
    this._clearAudioElementSource();
    return true;
  }
  _syncPromptBoxSizeFromData(_0x4b5160 = this._data) {
    if (!this.promptEl || this._isPromptBoxResizing) {
      return;
    }
    const _0x345bc6 = getPromptBoxHeightBounds(this._promptPanel);
    const _0x23888e = normalizePromptBoxHeight(_0x4b5160?.promptBoxHeight, _0x345bc6);
    applyPromptBoxHeight(this.promptEl, _0x23888e);
  }
  _setupPromptBoxResize() {
    if (!this._promptPanel || this._promptResizeHandle) {
      return;
    }
    this._promptResizeHandle = true;
    const _0x3466e7 = 20;
    const _0x581e43 = 10;
    const _0x552326 = () => getStoreSnapshot().ui?.promptBoxResizeEnabled !== false;
    const _0x44c730 = _0x360cac => !!_0x360cac?.closest(".floating-menu, .img-model-menu");
    const _0x156b63 = _0x182ebd => {
      const _0x3eaf16 = this._promptPanel.getBoundingClientRect();
      return _0x182ebd >= _0x3eaf16.bottom - _0x3466e7 && _0x182ebd <= _0x3eaf16.bottom + _0x581e43;
    };
    const _0x5a6012 = _0x4fd9e1 => {
      if (!this._promptPanel) {
        return;
      }
      if (!_0x552326()) {
        this._promptPanel.classList.remove("is-resize-hover");
        return;
      }
      if (this._isPromptBoxResizing) {
        this._promptPanel.classList.add("is-resize-hover");
        return;
      }
      const _0x418567 = !_0x44c730(_0x4fd9e1?.target) && _0x156b63(_0x4fd9e1.clientY);
      this._promptPanel.classList.toggle("is-resize-hover", _0x418567);
    };
    this._promptPanel.addEventListener("pointermove", _0x5a6012);
    this._promptPanel.addEventListener("pointerleave", () => {
      if (!this._isPromptBoxResizing) {
        this._promptPanel?.classList.remove("is-resize-hover");
      }
    });
    const _0x32a237 = _0x2e9451 => {
      if (!this._promptInputWrap || !this.promptEl) {
        return;
      }
      if (!_0x552326()) {
        return;
      }
      if (_0x2e9451.button !== 0) {
        return;
      }
      if (!_0x156b63(_0x2e9451.clientY)) {
        return;
      }
      if (_0x2e9451.target?.closest(".prompt-submit") || _0x44c730(_0x2e9451.target)) {
        return;
      }
      _0x2e9451.stopPropagation();
      _0x2e9451.preventDefault();
      const _0x3d6876 = getPromptBoxHeightBounds(this._promptPanel);
      const _0x1ba639 = _0x2e9451.clientY;
      const _0x30303d = this.promptEl.getBoundingClientRect().height;
      this._isPromptBoxResizing = true;
      this._promptInputWrap.classList.add("is-resizing");
      this._promptPanel.classList.add("is-resize-hover");
      const _0x4b3617 = _0x32c9b9 => {
        _0x32c9b9.preventDefault();
        const _0x1c4c2a = normalizePromptBoxHeight(_0x30303d + (_0x32c9b9.clientY - _0x1ba639), _0x3d6876);
        applyPromptBoxHeight(this.promptEl, _0x1c4c2a);
      };
      const _0x498d32 = _0x1a438c => {
        _0x1a438c.preventDefault();
        window.removeEventListener("pointermove", _0x4b3617);
        window.removeEventListener("pointerup", _0x498d32);
        window.removeEventListener("pointercancel", _0x498d32);
        const _0x4f065f = normalizePromptBoxHeight(this.promptEl?.getBoundingClientRect().height, _0x3d6876);
        applyPromptBoxHeight(this.promptEl, _0x4f065f);
        this._promptInputWrap.classList.remove("is-resizing");
        this._isPromptBoxResizing = false;
        this._promptPanel.classList.remove("is-resize-hover");
        _0x5a6012(_0x1a438c);
        a293_0x6e2506.updateNodeData(this.nodeId, {
          promptBoxHeight: _0x4f065f
        });
      };
      window.addEventListener("pointermove", _0x4b3617);
      window.addEventListener("pointerup", _0x498d32);
      window.addEventListener("pointercancel", _0x498d32);
      this._promptResizeCleanup = () => {
        this._promptPanel?.removeEventListener("pointerdown", _0x32a237);
        this._promptPanel?.removeEventListener("pointermove", _0x5a6012);
        window.removeEventListener("pointermove", _0x4b3617);
        window.removeEventListener("pointerup", _0x498d32);
        window.removeEventListener("pointercancel", _0x498d32);
      };
    };
    this._promptPanel.addEventListener("pointerdown", _0x32a237);
    this._promptResizeCleanup = () => {
      this._promptPanel?.removeEventListener("pointerdown", _0x32a237);
      this._promptPanel?.removeEventListener("pointermove", _0x5a6012);
      this._promptPanel?.classList.remove("is-resize-hover");
    };
  }
  update(_0x2a3b8b) {
    this._data = _0x2a3b8b;
    this._syncPromptBoxSizeFromData(_0x2a3b8b);
    this._syncWorkflowDefaults();
    const _0x4e7cf9 = this._getCurrentWorkflow().key;
    this._enforceWorkflowAudioInputLimit();
    const _0x5186b0 = this._resolveNodeAudioUrl(_0x2a3b8b);
    if (this._rendererMediaDeferred && _0x5186b0) {
      if (_0x5186b0 !== this._currentSrc) {
        this._prepareDeferredAudio(_0x5186b0);
      } else {
        this._syncKnownAudioDurationUi({
          currentTime: this.audioEl?.currentTime || 0,
          showLine: Number(this.audioEl?.currentTime || 0) > 0
        });
        this._setAudioPreviewResultState(true);
        this._syncStatusOverlay(_0x2a3b8b, true);
      }
    } else if (_0x5186b0 && _0x5186b0 !== this._currentSrc && this.audioEl) {
      this._prepareAudio(_0x5186b0);
      this._applyResultWideLayout(_0x2a3b8b, false);
      this._syncStatusOverlay(_0x2a3b8b, true);
    } else if (!_0x5186b0 && this.audioEl) {
      if (typeof this._cancelDeferredWaveform === "function") {
        this._cancelDeferredWaveform();
        this._cancelDeferredWaveform = null;
      }
      this._clearAudioElementSource();
      this._currentSrc = null;
      this._progressController?.reset();
      this._audioDurationProbeToken += 1;
      this._setAudioPreviewResultState(false);
      this._syncStatusOverlay(_0x2a3b8b, false);
    } else if (_0x5186b0) {
      this._syncKnownAudioDurationUi({
        currentTime: this.audioEl?.currentTime || 0,
        showLine: Number(this.audioEl?.currentTime || 0) > 0
      });
      this._applyResultWideLayout(_0x2a3b8b, false);
      this._setAudioPreviewResultState(true);
      this._syncStatusOverlay(_0x2a3b8b, true);
    } else {
      this._syncStatusOverlay(_0x2a3b8b, false);
    }
    if (!this._rendererMediaDeferred) {
      this._syncAudioMultiResultStack(_0x2a3b8b);
    }
    if (shouldShowGenerationBusyUi(_0x2a3b8b)) {
      this._isGenerating = true;
      startLoading(this.previewEl);
    }
    if (this._rendererDetailsDeferred === true) {
      this._maybeResumeRunningHubTask();
      return;
    }
    if (doesAudioWorkflowAcceptTextInput(_0x4e7cf9) && document.activeElement !== this.promptEl && _0x2a3b8b.prompt !== undefined) {
      if (!isVirtualizedPromptEditorCurrent(this, _0x2a3b8b.prompt)) {
        const _0x510b2a = sanitizePromptHtml(_0x2a3b8b.prompt || "");
        if (this.promptEl?.innerHTML !== _0x510b2a) {
          clearVirtualizedPromptCommit(this);
          this.promptEl.innerHTML = _0x510b2a;
          _rehydratePromptPills(this);
        }
      }
    }
    this._refreshWorkflowUi();
    const _0x795ab3 = a293_0x6e2506.getIncomingEdges(this.nodeId);
    const _0x499190 = [..._0x795ab3];
    const _0x34da56 = _0x499190.map(_0x505783 => [String(_0x505783?.id || ""), String(_0x505783?.sourceId || ""), String(_0x505783?.refSlot || ""), String(_0x505783?.sourceMediaKey || "")].join(":")).join("|");
    const _0x34e43f = _0x499190.map(_0x75b87c => {
      const _0x567c98 = a293_0x6e2506.getState().nodes?.[_0x75b87c.sourceId] || {};
      const _0x5e1ad4 = Number(_0x567c98._bizRev || 0);
      const _0x2b1280 = Number.isFinite(Number(_0x567c98.mainVideoIndex)) ? Math.max(0, Math.trunc(Number(_0x567c98.mainVideoIndex))) : 0;
      const _0x4a3978 = Array.isArray(_0x567c98.videos) ? _0x567c98.videos[_0x2b1280] || _0x567c98.videos[0] : null;
      const _0x1bfec8 = [String(_0x567c98.thumbId || ""), String(_0x567c98.thumbUrl || ""), String(_0x4a3978?.thumbId || ""), String(_0x4a3978?.thumbUrl || ""), String(_0x4a3978?.localPath || ""), String(_0x4a3978?.videoUrl || ""), String(_0x567c98.localPath || ""), String(_0x567c98.src || ""), String(_0x567c98.imageUrl || ""), String(_0x567c98.videoUrl || ""), String(_0x567c98.audioUrl || "")].join("|");
      return _0x75b87c.id + ":" + _0x75b87c.sourceId + ":" + String(_0x75b87c?.refSlot || "") + ":" + String(_0x75b87c?.sourceMediaKey || "") + ":" + _0x5e1ad4 + ":" + _0x1bfec8;
    }).join("||");
    if (_0x34da56 !== this._lastEdgeSig || _0x34e43f !== this._lastRefMediaSig || _0x4e7cf9 !== this._lastWorkflowKey) {
      this._lastEdgeSig = _0x34da56;
      this._lastRefMediaSig = _0x34e43f;
      this._lastWorkflowKey = _0x4e7cf9;
      this._renderRefBar();
    }
    this._syncPickConnectVisualState();
    this._maybeResumeRunningHubTask();
    this._updateSubmitButtonState();
  }
  async _buildPayload(_0x43db36 = null) {
    this._uiSchemaCleanup?.flushPendingTextCommits?.();
    this._enforceWorkflowAudioInputLimit();
    const {
      payload: _0x1d37da,
      validation: _0x50cc1f
    } = this._buildPayloadSnapshot(_0x43db36);
    if (!_0x50cc1f.ok) {
      window.showToast?.(_0x50cc1f.message, "warn");
      return null;
    }
    if (!(await this._validateAdvancedVoiceCloneDurations(_0x1d37da.audioRefs))) {
      return null;
    }
    return _0x1d37da;
  }
  _getPreviewGenerateButtonLoadingOptions() {
    return createPreviewGenerateButtonCallbacks(this, aigenAudioText("buttons.generate"));
  }
  async _handleAudioTaskFailure(_0x107be0, {
    payload: _0x574ee0,
    recovering = false
  } = {}) {
    if (recovering) {
      return;
    }
    console.error("[AIGenAudioNode] 生成失败:", _0x107be0);
    const _0x2aceac = showProviderApiKeyMissingToastForError(_0x107be0, {
      providerId: _0x574ee0?.provider,
      model: _0x574ee0?.audioWorkflowKey,
      adapterType: _0x574ee0?.adapterType
    });
    if (!_0x2aceac) {
      window.showToast?.(aigenAudioText("generation.failedWithError", {
        error: _0x107be0?.message || _0x107be0
      }), "error");
    }
  }
  async _onGenerate(_0x153edd = null, _0x2bb5ef = {}) {
    if (this._isGenerating) {
      return;
    }
    if (_0x2bb5ef?.insertPrompt === true) {
      insertPresetPromptIntoEditor({
        storeApi: a293_0x6e2506,
        nodeId: this.nodeId,
        promptEl: this.promptEl,
        template: _0x153edd,
        inEdges: a293_0x6e2506.getIncomingEdges(this.nodeId),
        nodes: a293_0x6e2506.getState().nodes || {},
        allowedAssetTypes: ["text", "audio"]
      });
      this._updateSubmitButtonState();
      return;
    }
    if (shouldUsePromptPreviewForPreset(_0x153edd)) {
      const _0x230824 = await this._buildPayload(_0x153edd);
      if (!_0x230824) {
        this._updateSubmitButtonState();
        return;
      }
      previewPresetPromptInEditor({
        storeApi: a293_0x6e2506,
        nodeId: this.nodeId,
        promptEl: this.promptEl,
        promptText: _0x230824.prompt
      });
      this._updateSubmitButtonState();
      return;
    }
    if (isPreviewModeEnabled()) {
      if (!isPreviewNodeLoading(this.nodeId)) {
        startPreviewNodeLoading(this.nodeId, this.previewEl, this._getPreviewGenerateButtonLoadingOptions());
      }
      return;
    }
    if (!(await this._ensureVipAccessForCurrentWorkflow())) {
      this._updateSubmitButtonState();
      return;
    }
    const _0x4b1dc6 = this._getCurrentWorkflow();
    const _0x17e554 = guardModelGenerationCredentials({
      modelId: _0x4b1dc6.key,
      provider: _0x4b1dc6.provider,
      providerProfileId: this._data?.providerProfileId || this._data?.rhProviderProfileId,
      adapterType: _0x4b1dc6.adapterType
    });
    if (!_0x17e554.ready) {
      this._updateSubmitButtonState();
      return;
    }
    const _0x1d9acd = await this._buildPayload(_0x153edd);
    if (!_0x1d9acd) {
      this._updateSubmitButtonState();
      return;
    }
    const _0x1dc5e3 = String(_0x1d9acd?.provider || "").trim().toLowerCase() === "runninghub" && String(_0x1d9acd?.adapterType || "").trim() === "modelApi";
    if (_0x1dc5e3) {
      await ensureConfig();
      const _0x9418a0 = getProviderConfig("runninghub") || {};
      const _0x3e6bd0 = String(_0x9418a0?.modelApiKey || _0x1d9acd?.apiKey || "").trim();
      if (!_0x3e6bd0) {
        showProviderApiKeyMissingToast("请先填写 RunningHub 模型 API Key", {
          providerId: "runninghub",
          keyType: "modelApi",
          model: _0x1d9acd?.audioWorkflowKey,
          adapterType: _0x1d9acd?.adapterType
        });
        this._updateSubmitButtonState();
        return;
      }
      _0x1d9acd.apiKey = _0x3e6bd0;
    }
    return this._audioTaskOrchestration.runGeneration({
      payload: _0x1d9acd,
      startedAt: Date.now()
    });
  }
  _renderRefBar() {
    if (!this.refBarEl) {
      return;
    }
    const _0xf665b1 = this._getCurrentWorkflow().key;
    if (this._refBarWorkflowKey !== _0xf665b1) {
      this._refBarWorkflowKey = _0xf665b1;
      this.refBarEl.innerHTML = "";
      this.refBarEl.classList.remove("active", "rh-v5-refbar");
    }
    const _0x13de98 = getAudioWorkflowSlots(_0xf665b1);
    const _0x135f4 = _0x13de98.length > 0;
    const _0x146307 = createPromptAttachmentButtonHTML();
    const _0x31cfbb = a293_0x6e2506.getIncomingEdges(this.nodeId);
    const _0x408a7f = a293_0x6e2506.getState().nodes || {};
    const _0x69dd4d = {};
    const _0x3c9e26 = {
      text: 0,
      image: 0,
      video: 0,
      audio: 0
    };
    const _0xfd9470 = {
      text: aigenAudioText("assetTypes.text"),
      image: aigenAudioText("assetTypes.image"),
      video: aigenAudioText("assetTypes.video"),
      audio: aigenAudioText("assetTypes.audio")
    };
    if (!_0x135f4) {
      if (_0x31cfbb.length === 0) {
        const _0x33b8b7 = _0x146307;
        if (this._lastRefHTML !== _0x33b8b7) {
          this._lastRefHTML = _0x33b8b7;
          this.refBarEl.classList.remove("active", "rh-v5-refbar");
          this.refBarEl.innerHTML = _0x33b8b7;
        }
        this._attachBtnIcon = this.refBarEl?.querySelector(".prompt-attachment-btn .btn-icon") || null;
        this._syncPickConnectVisualState();
        _syncPillLabels(this, _0x69dd4d);
        return;
      }
      this.refBarEl.classList.add("active");
      this.refBarEl.classList.remove("rh-v5-refbar");
      const _0x5d4698 = [];
      for (const _0x2594b8 of _0x31cfbb) {
        const _0x5a3035 = _0x408a7f[_0x2594b8.sourceId];
        if (!_0x5a3035) {
          continue;
        }
        const _0x392059 = String(_0x5a3035.type || "");
        let _0x585da7 = "image";
        if (_0x392059.includes("text")) {
          _0x585da7 = "text";
        } else if (_0x392059.includes("video")) {
          _0x585da7 = "video";
        } else if (_0x392059.includes("audio")) {
          _0x585da7 = "audio";
        }
        _0x3c9e26[_0x585da7]++;
        _0x69dd4d[_0x2594b8.sourceId] = "@" + _0xfd9470[_0x585da7] + _0x3c9e26[_0x585da7];
        const _0x59e443 = [String(_0x5a3035?.thumbUrl || "").trim(), String(_0x5a3035?.imageUrl || "").trim(), String(_0x5a3035?.src || "").trim(), toLocalAssetUrl(_0x5a3035?.localPath), String(_0x5a3035?.audioUrl || "").trim()].filter(Boolean);
        const _0x33aca9 = (_0x585da7 === "video" ? resolveReferenceVideoThumbnail(_0x5a3035, _0x2594b8).thumbUrl : "") || _0x59e443.find(_0x20d476 => isLikelyImageUrl(_0x20d476)) || "";
        if (_0x33aca9) {
          ensureThumbDecoded(_0x33aca9);
        }
        const _0x210f3f = _0x2594b8.id + "|" + _0x2594b8.sourceId + "|" + (_0x33aca9 || _0x585da7 + "-fallback");
        _0x5d4698.push({
          edgeId: _0x2594b8.id,
          sourceId: _0x2594b8.sourceId,
          sig: _0x210f3f,
          html: createReferenceInputThumbnailHtml({
            kind: _0x585da7,
            thumbnailUrl: _0x33aca9
          })
        });
      }
      const _0x26fc3c = _0x146307 + "<div class=\"ref-thumb-container\">" + _0x5d4698.map(_0x558a04 => "<div class=\"ref-thumb-wrap\" data-edge-id=\"" + _0x558a04.edgeId + "\" data-source-id=\"" + _0x558a04.sourceId + "\" data-sig=\"" + _0x558a04.sig + "\" draggable=\"true\">" + _0x558a04.html + "<button type=\"button\" class=\"ref-thumb-delete\" title=\"" + aigenAudioText("refs.remove") + "\">&times;</button></div>").join("") + "</div>";
      if (this._lastRefHTML !== _0x26fc3c) {
        this._lastRefHTML = _0x26fc3c;
        this.refBarEl.innerHTML = _0x26fc3c;
      }
      this._attachBtnIcon = this.refBarEl?.querySelector(".prompt-attachment-btn .btn-icon") || null;
      this._syncPickConnectVisualState();
      _syncPillLabels(this, _0x69dd4d);
      return;
    }
    const _0x1a03e6 = [];
    for (const _0x587868 of _0x31cfbb) {
      const _0x53477f = _0x408a7f[_0x587868.sourceId];
      if (!_0x53477f) {
        continue;
      }
      const _0x4acab7 = String(_0x53477f.type || "");
      let _0x114cc8 = "image";
      if (_0x4acab7.includes("text")) {
        _0x114cc8 = "text";
      } else if (_0x4acab7.includes("video")) {
        _0x114cc8 = "video";
      } else if (_0x4acab7.includes("audio")) {
        _0x114cc8 = "audio";
      }
      _0x3c9e26[_0x114cc8]++;
      _0x69dd4d[_0x587868.sourceId] = "@" + _0xfd9470[_0x114cc8] + _0x3c9e26[_0x114cc8];
      if (_0x114cc8 === "audio") {
        _0x1a03e6.push({
          edgeId: _0x587868.id,
          sourceId: _0x587868.sourceId,
          sourceType: _0x4acab7,
          refSlot: String(_0x587868?.refSlot || ""),
          url: this._resolveAudioRefUrl(_0x53477f),
          edge: _0x587868,
          sourceNode: _0x53477f
        });
      }
    }
    const _0x3614f6 = _0x408a7f?.[this.nodeId] || this._data || {};
    const _0x2b9cd4 = buildAudioWorkflowInputPlan({
      workflowKey: _0xf665b1,
      audioRefs: _0x1a03e6,
      assetInputRefs: getAssetInputRefsFromPromptAndNode(this.promptEl, {
        nodeData: _0x3614f6,
        allowedTypes: ["audio"]
      })
    });
    const _0x3abb26 = {};
    _0x13de98.forEach(_0x472943 => _0x3abb26[_0x472943.slot] = null);
    const _0xcf7fcf = (_0x49a954, _0x3c0311) => {
      const _0x6467db = _0x3c0311?.edge || {
        id: _0x3c0311?.edgeId,
        sourceId: _0x3c0311?.sourceId
      };
      const _0x7bba58 = _0x3c0311?.sourceNode || _0x408a7f[_0x3c0311?.sourceId];
      if (!_0x7bba58) {
        return null;
      }
      const _0x3b4971 = [String(_0x7bba58?.thumbUrl || "").trim(), String(_0x7bba58?.imageUrl || "").trim(), String(_0x7bba58?.src || "").trim(), toLocalAssetUrl(_0x7bba58?.localPath), String(_0x7bba58?.audioUrl || "").trim()].filter(Boolean);
      const _0x56ae86 = _0x3b4971.find(_0x58f8ad => isLikelyImageUrl(_0x58f8ad)) || "";
      if (_0x56ae86) {
        ensureThumbDecoded(_0x56ae86);
      }
      const _0xb2cdac = _0x49a954 + "|" + _0x6467db.id + "|" + _0x6467db.sourceId + "|" + (_0x56ae86 || "audio-fallback");
      return {
        edgeId: _0x6467db.id,
        sourceId: _0x6467db.sourceId,
        sig: _0xb2cdac,
        html: createReferenceInputThumbnailHtml({
          kind: "audio",
          thumbnailUrl: _0x56ae86
        })
      };
    };
    const _0x3ac379 = (_0xc9bbd6, _0xa5a2a) => {
      const _0x5e1e47 = _0xa5a2a?.assetInputRef || _0xa5a2a || {};
      const _0x17509d = [String(_0x5e1e47?.thumbUrl || "").trim(), String(_0x5e1e47?.nodeData?.thumbUrl || "").trim(), String(_0x5e1e47?.nodeData?.imageUrl || "").trim(), String(_0x5e1e47?.nodeData?.src || "").trim(), toLocalAssetUrl(_0x5e1e47?.nodeData?.localPath)].filter(Boolean);
      const _0x1030ff = _0x17509d.find(_0x1a8e0f => isLikelyImageUrl(_0x1a8e0f)) || "";
      if (_0x1030ff) {
        ensureThumbDecoded(_0x1030ff);
      }
      const _0x2f8e81 = String(_0x5e1e47.assetId || "");
      const _0x526335 = String(_0x5e1e47.itemIndex ?? "");
      const _0x152db3 = String(_0x5e1e47.assetMentionOccurrence ?? "");
      const _0x39cc93 = String(_0x5e1e47.assetRefSource || "prompt");
      const _0x599c6f = _0xc9bbd6 + "|asset:" + _0x2f8e81 + ":" + _0x526335 + ":" + _0x152db3 + "|" + (_0x1030ff || "audio-fallback");
      return {
        edgeId: "",
        sourceId: "asset:" + _0x2f8e81 + ":" + _0x526335,
        sig: _0x599c6f,
        html: createReferenceInputThumbnailHtml({
          kind: "audio",
          thumbnailUrl: _0x1030ff
        }),
        virtual: true,
        assetId: _0x2f8e81,
        assetIndex: _0x526335,
        assetOccurrence: _0x152db3,
        assetRefSource: _0x39cc93,
        refType: "audio"
      };
    };
    Object.entries(_0x2b9cd4.slotItems).forEach(([_0x103dcb, _0x6cf78]) => {
      if (!_0x6cf78) {
        return;
      }
      _0x3abb26[_0x103dcb] = _0x6cf78.origin === "asset" ? _0x3ac379(_0x103dcb, _0x6cf78) : _0xcf7fcf(_0x103dcb, _0x6cf78);
    });
    this.refBarEl.classList.add("active", "rh-v5-refbar");
    let _0x555ed1 = this.refBarEl.querySelector(".rh-v5-ref-container");
    const _0x158ab3 = !_0x555ed1 || !this.refBarEl.querySelector(".prompt-attachment-btn") || _0x555ed1.querySelectorAll("[data-slot]").length !== _0x13de98.length;
    if (_0x158ab3) {
      this.refBarEl.innerHTML = _0x146307 + " <div class=\"ref-thumb-container rh-v5-ref-container\" aria-label=\"" + aigenAudioText("refs.inputAria") + "\">\n        " + _0x13de98.map(_0x52e788 => "<button type=\"button\" class=\"ref-thumb-wrap ref-upload-slot rh-v5-ref-box\" data-slot=\"" + _0x52e788.slot + "\" title=\"" + escapeInputSlotLabelHtml(_0x52e788.label) + "\"><span class=\"ref-upload-label\">" + formatInputSlotLabelHtml(_0x52e788.label) + "</span></button>").join("") + "\n      </div>";
      _0x555ed1 = this.refBarEl.querySelector(".rh-v5-ref-container");
    }
    const _0x16cbd7 = (_0x4158eb, _0x2fc005, _0x5611e0) => {
      if (!_0x555ed1) {
        return;
      }
      const _0x23ca70 = _0x555ed1.querySelector("[data-slot=\"" + _0x4158eb + "\"]");
      if (!_0x2fc005) {
        if (_0x23ca70 && _0x23ca70.tagName === "BUTTON" && _0x23ca70.classList.contains("ref-upload-slot")) {
          return;
        }
        const _0x127ab2 = document.createElement("button");
        _0x127ab2.type = "button";
        _0x127ab2.className = "ref-thumb-wrap ref-upload-slot rh-v5-ref-box";
        _0x127ab2.dataset.slot = _0x4158eb;
        _0x127ab2.title = _0x5611e0;
        const _0x5b342c = document.createElement("span");
        _0x5b342c.className = "ref-upload-label";
        _0x5b342c.innerHTML = formatInputSlotLabelHtml(_0x5611e0);
        _0x127ab2.appendChild(_0x5b342c);
        if (_0x23ca70) {
          _0x23ca70.replaceWith(_0x127ab2);
        } else {
          _0x555ed1.appendChild(_0x127ab2);
        }
        return;
      }
      const _0x4908be = document.createElement("div");
      _0x4908be.className = "ref-thumb-wrap rh-v5-ref-box" + (_0x2fc005.virtual ? " ref-thumb-wrap--asset" : "");
      _0x4908be.setAttribute("draggable", _0x2fc005.virtual ? "false" : "true");
      _0x4908be.dataset.slot = _0x4158eb;
      _0x4908be.dataset.edgeId = _0x2fc005.edgeId;
      _0x4908be.dataset.sourceId = _0x2fc005.sourceId;
      _0x4908be.dataset.sig = _0x2fc005.sig;
      _0x4908be.dataset.refOrigin = _0x2fc005.virtual ? "asset" : "node";
      if (_0x2fc005.virtual) {
        _0x4908be.dataset.assetId = _0x2fc005.assetId || "";
        _0x4908be.dataset.assetIndex = _0x2fc005.assetIndex || "";
        _0x4908be.dataset.assetOccurrence = _0x2fc005.assetOccurrence || "";
        _0x4908be.dataset.assetRefSource = _0x2fc005.assetRefSource || "prompt";
        _0x4908be.dataset.refType = _0x2fc005.refType || "audio";
      }
      _0x4908be.innerHTML = _0x2fc005.html + "<button type=\"button\" class=\"ref-thumb-delete\" title=\"" + aigenAudioText("refs.remove") + "\">&times;</button>";
      revealRefThumbMedia(_0x4908be, _0x2fc005.sig);
      if (_0x23ca70) {
        _0x23ca70.replaceWith(_0x4908be);
      } else {
        _0x555ed1.appendChild(_0x4908be);
      }
    };
    _0x13de98.forEach(_0x4d71c0 => _0x16cbd7(_0x4d71c0.slot, _0x3abb26[_0x4d71c0.slot], _0x4d71c0.label));
    bindRefThumbFixedSlotDrag({
      owner: this,
      container: _0x555ed1,
      store: a293_0x6e2506,
      nodeId: this.nodeId,
      acceptMap: Object.fromEntries(_0x13de98.map(_0xc48d7d => [_0xc48d7d.slot, "audio"]))
    });
    this._attachBtnIcon = this.refBarEl?.querySelector(".prompt-attachment-btn .btn-icon") || null;
    this._syncPickConnectVisualState();
    _syncPillLabels(this, _0x69dd4d);
  }
  unmount() {
    this._unsubscribeLocale?.();
    this._unsubscribeLocale = null;
    this._unregisterAudioPlaybackClient?.();
    this._unregisterAudioPlaybackClient = null;
    this._flushPromptHtmlCommit?.();
    this._assetMentionRegistryUnsubscribe?.();
    this._assetMentionRegistryUnsubscribe = null;
    this._assetMentionRegistryRefreshPending = false;
    this._audioTaskOrchestration.dispose({
      preserveTask: shouldPreserveGenerationTaskOnUnmount(this.nodeId)
    });
    this._clearStatusOverlay();
    this._clearAudioMultiResultStack();
    this._closeModelMenu();
    if (this._docClickHandler) {
      document.removeEventListener("click", this._docClickHandler);
      this._docClickHandler = null;
    }
    if (this._unbindRefThumbHoverPreview) {
      this._unbindRefThumbHoverPreview();
      this._unbindRefThumbHoverPreview = null;
    }
    this._progressController?.destroy();
    this._progressController = null;
    if (typeof this._cancelDeferredWaveform === "function") {
      this._cancelDeferredWaveform();
      this._cancelDeferredWaveform = null;
    }
    this._clearAudioElementSource();
    if (this._promptResizeCleanup) {
      this._promptResizeCleanup();
      this._promptResizeCleanup = null;
    }
    this._uiSchemaCleanup?.();
    this._uiSchemaCleanup = null;
    this._footerControllerCleanup?.();
    this._footerControllerCleanup = null;
    this._generationNodeHelpTip?.remove();
    this._generationNodeHelpTip = null;
    this._promptPresetTrigger?.remove();
    this._promptPresetTrigger = null;
    this._modelProviderProfileControl?.remove();
    this._modelProviderProfileControl = null;
    this._promptPanel?.classList.remove("is-resize-hover");
    this._promptInputWrap?.classList.remove("is-resizing");
    this._isPromptBoxResizing = false;
  }
}
