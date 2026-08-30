import { cancelRunningHubAudioTask, generateAudio } from "../../api/aiAudioApi.js";
import { AUDIO_VOICE_TRANSLATION_PROVIDER_ID, translateAudioVoiceSegments } from "../../api/audioVoiceTranslationApi.js";
import { ensureConfig, getProviderConfig } from "../../api/configApi.js";
import { testProviderConnection } from "../../api/providerConnectionTestApi.js";
import { cancelElectronMediaTask, enqueueElectronMediaTask, waitForElectronMediaTask } from "../../api/localMediaTaskApi.js";
import { buildAudioGenerationResultPatch } from "../components/audio-node/audioGenerationResultRenderer.js";
import { buildAudioWorkflowItems, buildAudioWorkflowMenuGroups } from "../components/audio-node/audioModelMenuHelpers.js";
import { doesAudioWorkflowSupportMultipleAudioInputs, getAudioWorkflowSlots, normalizeAudioWorkflowRefSlots } from "../components/audio-node/audioWorkflowRefSlots.js";
import { resolveAudioDownloadTarget, triggerAudioDownload } from "../components/nodeToolbar/audioActions/downloadAction.js";
import { createPromptAttachmentButtonHTML } from "../components/refAttachmentButton.js";
import { resolveGenerationButtonMode, shouldAllowCancel } from "../core/generationTaskUiState.js";
import { cancelTask, submitTask } from "../core/generationTaskRuntime.js";
import { createTaskBatchCancellationController } from "../core/taskBatchExecution.js";
import { t } from "../i18n/index.js";
import { translateManifestText } from "../i18n/manifestText.js";
import { normalizeAudioVoiceAnalyzeSegments as a903_0x269d29 } from "./audioVoiceAnalysisSegments.js";
import { createAudioVoiceAnalysisSession } from "./audioVoiceAnalysisSession.js";
import { createAudioVoiceConfirmDialog } from "./audioVoiceConfirmDialog.js";
import { createAudioVoiceTaskProgressTracker, prepareAudioVoiceLocalAsr } from "./audioVoiceLocalAsrRuntime.js";
import { AUDIO_VOICE_STUDIO_VIP_MODEL_ID } from "./subscriptionAccess.js";
import { resolveCanvasAudioLocalPath, resolveCanvasAudioUrl, resolveCanvasVideoLocalPath, resolveCanvasVideoPosterUrl } from "../services/canvasMediaLocalService.js";
import { pickAudioDurationSec } from "../services/audioMetadataService.js";
import { saveRemoteAudioLocallyDetailed } from "../services/projectService.js";
import { closeVolcengineSpeechApiKeyGuide, openVolcengineSpeechApiKeySettings, showVolcengineSpeechApiKeyGuide } from "./volcengineSpeechApiKeyGuide.js";
import { closeProviderApiKeyGuide, openProviderApiKeySettings, showProviderApiKeyGuide } from "./providerApiKeyGuide.js";
import { getModelManifest, RH_AUDIO_ADVANCED_VOICE_CLONE_MODEL_ID, RH_AUDIO_INDEXTTS2_CLONE_MODEL_ID, RH_AUDIO_VOICE_CONVERT_MODEL_ID } from "../manifests/index.js";
import { localPathToUrl, normalizeLocalPath, pickResultLocalPath } from "../utils/localMediaPath.js";
import a903_0x440a08 from "./AudioClipController.js";
import { resetGenerateButtonIdleUi, setGenerateButtonCancellableUi, setGenerateButtonLoadingUi } from "./previewGenerateButtonUi.js";
import { showGenerationCompleteNotification } from "../services/completionNotificationService.js";
import { playCompletionSound } from "../services/completionSoundService.js";
import { composeAudioVoiceTimelineNearNode } from "./VideoComposeController.js";
import { AUDIO_VOICE_PANEL_OPEN_EVENT } from "./audioVoicePanelEvents.js";
import { buildAudioVoiceGenerationCompletionMessage, notifyAudioVoiceGenerationComplete, summarizeAudioVoiceGenerationResults } from "./audioVoicePanelGenerationFeedback.js";
import { createAudioVoiceTaskRecoveryManager } from "./audioVoiceTaskRecovery.js";
import { AUDIO_VOICE_SOURCE_CLIP_MIN_MS, applyAudioVoiceTranslationResults, buildAudioVoiceApplySourceClipPatch, buildAudioVoiceSplitSourceSegmentDraft, buildAudioVoiceTextEditPatch, commitAudioVoiceSourceClipEdit, mergeAudioVoiceSourceSegments, resolveAudioVoiceSourceClipEditBase, shouldCloseAudioVoiceEmptyConvertedTextEdit } from "./audioVoicePanelSegmentEditing.js";
import { createAudioVoicePlaybackSession, isAudioVoicePreviewControlTarget, prepareAudioVoicePlaybackElement } from "./audioVoicePlaybackSession.js";
import { createAudioVoiceGenerationTaskOrchestration, createAudioVoiceGenerationTaskStoreAdapter, normalizeAudioVoiceBatchConcurrencyLimit, resolveAudioVoiceProviderBatchConcurrency, resolveAudioVoiceProviderBatchConcurrencyWithProbe, runAudioVoiceBatchGenerationQueue } from "./audioVoiceGenerationTaskOrchestration.js";
import { createAudioVoiceSegmentEditSession } from "./audioVoiceSegmentEditSession.js";
import { createAudioVoiceSegmentMergeController } from "./audioVoiceSegmentMergeController.js";
import { buildAudioVoiceHistoryEntry, cloneAudioVoiceSegment as a903_0x2f01f3, createAudioVoicePayloadError, createAudioVoiceSegmentAfter as a903_0x54681b, firstNonEmptyString, getVisibleAudioVoiceSegments as a903_0x36767f, normalizeAudioVoiceHistory, normalizeAudioVoiceSegmentModelSelection, prependAudioVoiceHistory, prependAudioVoiceHistoryEntries, resolveSegmentLocalAudioUrl } from "./audioVoicePanelSegmentState.js";
import { AUDIO_VOICE_BATCH_AUDIO_PICK_ID, createAudioVoicePanelPickSession, isAudioVoiceAudioNode, isAudioVoiceSourceNode, resolveAudioVoiceSelectionTargetIds } from "./audioVoicePanelPickSession.js";
import { bindAudioVoiceModelSubmenuPosition, createAudioVoiceModelIcon, createButton, createEl, iconSvg, positionAudioVoiceModelSubmenu } from "./audioVoicePanelPresentation.js";
import { buildAudioVoiceSegmentContextMenuItems, buildAudioVoiceSegmentMenuEntries, createAudioVoiceSegmentContextMenuController } from "./audioVoiceContextMenu.js";
import { AUDIO_VOICE_TRANSLATION_LANGUAGES, classifyAudioVoiceTranslationConfigFailure, getAudioVoiceTranslationLanguage, resolveAudioVoiceTranslationTargets } from "./audioVoiceTranslation.js";
export { AUDIO_VOICE_PANEL_OPEN_EVENT };
export { positionAudioVoiceModelSubmenu };
export { isAudioVoicePreviewControlTarget, prepareAudioVoicePlaybackElement };
export { normalizeAudioVoiceBatchConcurrencyLimit, resolveAudioVoiceProviderBatchConcurrency, resolveAudioVoiceProviderBatchConcurrencyWithProbe, runAudioVoiceBatchGenerationQueue };
export { applyAudioVoiceTranslationResults, buildAudioVoiceApplySourceClipPatch, buildAudioVoiceGenerationCompletionMessage, buildAudioVoiceHistoryEntry, buildAudioVoiceSplitSourceSegmentDraft, buildAudioVoiceTextEditPatch, commitAudioVoiceSourceClipEdit, mergeAudioVoiceSourceSegments, normalizeAudioVoiceHistory, notifyAudioVoiceGenerationComplete, prependAudioVoiceHistory, prependAudioVoiceHistoryEntries, resolveAudioVoiceSourceClipEditBase, shouldCloseAudioVoiceEmptyConvertedTextEdit, summarizeAudioVoiceGenerationResults };
export { isAudioVoiceAudioNode, isAudioVoiceSourceNode, isAudioVoiceVideoNode, resolveAudioVoiceSelectionTargetIds } from "./audioVoicePanelPickSession.js";
const AUDIO_VOICE_IMITATE_TONE_WORKFLOW_IDS = new Set([RH_AUDIO_INDEXTTS2_CLONE_MODEL_ID, RH_AUDIO_ADVANCED_VOICE_CLONE_MODEL_ID]);
const AUDIO_VOICE_PANEL_MODEL_MENU_GROUPS = new Set(["runninghubWorkflow"]);
const AUDIO_VOICE_PANEL_WIDTH_STORAGE_KEY = "aiCanvas.audioVoicePanelWidth.v1";
const AUDIO_VOICE_STUDIO_VIP_PROVIDER = "aicanvas";
const AUDIO_VOICE_ANALYSIS_STATE_FIELD = "audioVoiceAnalysis";
const AUDIO_VOICE_ANALYSIS_SCHEMA_VERSION = 1;
const AUDIO_VOICE_WARM_SEGMENT_LIMIT = 4;
const AUDIO_VOICE_PANEL_WIDTH_LIMITS = Object.freeze({
  min: 560,
  max: 860
});
const AUDIO_VOICE_INLINE_ERROR_CODES = new Set(["missingVoiceRefAudio", "missingSecondVoiceRefAudio", "missingSourceAudio", "missingPromptText", "unsupportedVoiceModel"]);
const AUDIO_VOICE_TRANSLATION_BLOCKED_ACTIONS = new Set(["load-selected", "start-analyze", "voice", "merge", "insert", "generate", "batch-generate", "compose-all", "use-history", "use-converted", "use-source", "edit-source", "audio-param", "clear-audio-param", "toggle-imitate-tone", "remove", "select-global-model", "select-segment-model"]);
const ANALYZE_TASK_TIMEOUT_MS = 2700000;
const AUDIO_VOICE_ASR_RUNTIME_PROGRESS_SHARE = 0.35;
const AUDIO_CUT_TASK_TIMEOUT_MS = 120000;
const AUDIO_VOICE_ANALYSIS_STAGES = new Set(["asr-runtime-check", "asr-runtime-manifest", "asr-runtime-download", "asr-runtime-extract", "asr-runtime-verify", "gpu-torch-check", "gpu-torch-install", "gpu-torch-verify", "model-download", "model-prepare", "transcribe", "diarization-model-download", "diarization-model-prepare", "diarize", "slice"]);
const AUDIO_VOICE_ASR_PROVIDER_IDS = Object.freeze({
  DOUBAO: "doubao",
  FUNASR: "funasr"
});
const AUDIO_VOICE_DOUBAO_ASR_PROVIDER_CONFIG_ID = "volcengine-speech";
const VOLCENGINE_SPEECH_ASR_AUTH_PATTERN = /invalid\s+x-api-key|x-api-key\s+invalid|api\s*key\s+invalid|api\s*key\s*未填写|api\s*key\s*无效|key\s*无效|key\s*没有|permission|denied|forbid|unauthor|not\s+authorized|no\s+access|无权限|未授权|鉴权|权限|密钥|令牌/i;
function panelText(_0x3be2ca, _0x3fda85 = {}) {
  return t("audioVoicePanel." + _0x3be2ca, _0x3fda85);
}
function getAudioVoiceSegmentMenuEntries(_0x129c11 = {}) {
  return buildAudioVoiceSegmentMenuEntries({
    hasConverted: hasSegmentConvertedAudio(_0x129c11),
    hasSource: hasSegmentSourceAudio(_0x129c11),
    usingConverted: isSegmentUsingConvertedAudio(_0x129c11),
    text: panelText
  });
}
function getAudioVoiceSegmentContextMenuItems(_0x1156d9, _0x90a8d7) {
  const _0x446409 = _0x1156d9.voiceModelSelectionMode === "global" ? "" : String(_0x1156d9.voiceModelId || "").trim();
  return buildAudioVoiceSegmentContextMenuItems({
    entries: getAudioVoiceSegmentMenuEntries(_0x1156d9),
    modelOptions: getAudioVoicePanelModelOptions(),
    selectedModelId: _0x446409,
    imitateToneAvailable: isSegmentImitateToneAvailable(_0x1156d9),
    imitateToneEnabled: _0x1156d9.imitateToneEnabled === true,
    text: panelText,
    onAction: _0x90a8d7
  });
}
export function normalizeAudioVoiceAsrProvider(_0x3bc30c) {
  if (String(_0x3bc30c || "").trim().toLowerCase() === AUDIO_VOICE_ASR_PROVIDER_IDS.FUNASR) {
    return AUDIO_VOICE_ASR_PROVIDER_IDS.FUNASR;
  } else {
    return AUDIO_VOICE_ASR_PROVIDER_IDS.DOUBAO;
  }
}
export function isVolcengineSpeechAsrAuthFailure(_0xc505b9 = "") {
  const _0x1ee76a = String(_0xc505b9?.message || _0xc505b9 || "").trim();
  return VOLCENGINE_SPEECH_ASR_AUTH_PATTERN.test(_0x1ee76a);
}
export function shouldShowVolcengineSpeechApiKeyHelp(_0x39a9bd = {}, _0x5007d5 = "") {
  const _0xaf0c14 = String(_0x39a9bd?.category || "").trim();
  if (_0xaf0c14 === "missing_key" || _0xaf0c14 === "auth_failed" || _0xaf0c14 === "bad_base_url") {
    return true;
  }
  return isVolcengineSpeechAsrAuthFailure([_0x5007d5, _0x39a9bd?.summary, _0x39a9bd?.suggestion, _0x39a9bd?.detail, _0x39a9bd?.error].filter(Boolean).join(" "));
}
function getAudioVoiceAsrProviderOptions() {
  return [{
    id: AUDIO_VOICE_ASR_PROVIDER_IDS.DOUBAO,
    label: panelText("asrProviders.doubao.label"),
    subtitle: panelText("asrProviders.doubao.subtitle"),
    icon: "images/volcengine.svg",
    iconAlt: "volcengine"
  }, {
    id: AUDIO_VOICE_ASR_PROVIDER_IDS.FUNASR,
    label: panelText("asrProviders.funasr.label"),
    subtitle: panelText("asrProviders.funasr.subtitle"),
    iconName: "device",
    icon: "",
    iconAlt: "local"
  }];
}
function clampProgress01(_0x53a047) {
  const _0x5ec103 = Number(_0x53a047);
  if (!Number.isFinite(_0x5ec103)) {
    return 0;
  }
  return Math.max(0, Math.min(1, _0x5ec103));
}
function normalizeAnalysisProgressStage(_0x303146) {
  const _0x3993b9 = String(_0x303146 || "").trim();
  if (AUDIO_VOICE_ANALYSIS_STAGES.has(_0x3993b9)) {
    return _0x3993b9;
  } else {
    return "model-prepare";
  }
}
function getStateSnapshot(_0x54a70c) {
  return _0x54a70c?.getStateRaw?.() || _0x54a70c?.getState?.() || {};
}
function clampAudioVoicePanelWidth(_0xf993c1, _0x3a075d = globalThis.window?.innerWidth) {
  const _0x50064a = Number(_0xf993c1);
  const _0x3d07c1 = Number.isFinite(Number(_0x3a075d)) ? Math.max(320, Number(_0x3a075d) - 24) : AUDIO_VOICE_PANEL_WIDTH_LIMITS.max;
  const _0x5496cb = Math.min(AUDIO_VOICE_PANEL_WIDTH_LIMITS.max, _0x3d07c1);
  const _0x2a0846 = Math.min(AUDIO_VOICE_PANEL_WIDTH_LIMITS.min, _0x5496cb);
  return Math.max(_0x2a0846, Math.min(_0x5496cb, _0x50064a));
}
function readStoredPanelWidth(_0x37b888 = globalThis.window) {
  const _0x49a426 = Number(_0x37b888?.localStorage?.getItem?.(AUDIO_VOICE_PANEL_WIDTH_STORAGE_KEY));
  if (Number.isFinite(_0x49a426) && _0x49a426 > 0) {
    return _0x49a426;
  } else {
    return null;
  }
}
function writeStoredPanelWidth(_0x57f38c, _0x42a665 = globalThis.window) {
  try {
    _0x42a665?.localStorage?.setItem?.(AUDIO_VOICE_PANEL_WIDTH_STORAGE_KEY, String(Math.round(_0x57f38c)));
  } catch {}
}
function dispatchWebPreviewPanelSync(_0x35c2a9) {
  const _0x4fbb89 = globalThis.window;
  if (!_0x4fbb89 || typeof _0x4fbb89.dispatchEvent !== "function") {
    return;
  }
  const _0x3c5576 = {
    reason: _0x35c2a9
  };
  const _0x10ea13 = typeof globalThis.CustomEvent === "function" ? new globalThis.CustomEvent("web-preview:force-sync", {
    detail: _0x3c5576
  }) : {
    type: "web-preview:force-sync",
    detail: _0x3c5576
  };
  _0x4fbb89.dispatchEvent(_0x10ea13);
}
function formatTimecode(_0x50ba1f) {
  const _0xd91791 = Math.max(0, Math.round(Number(_0x50ba1f) || 0));
  const _0x26273f = Math.floor(_0xd91791 / 60000);
  const _0x5781eb = Math.floor(_0xd91791 % 60000 / 1000);
  const _0x2fa8f1 = _0xd91791 % 1000;
  return String(_0x26273f).padStart(2, "0") + ":" + String(_0x5781eb).padStart(2, "0") + ":" + String(_0x2fa8f1).padStart(3, "0");
}
export function formatAudioVoiceTimeRange(_0x26d67d, _0x50a12d) {
  const _0x230ae4 = Math.max(0, Math.round(Number(_0x26d67d) || 0));
  const _0x4df160 = Math.max(_0x230ae4, Math.round(Number(_0x50a12d) || 0));
  const _0x4bbb08 = ((_0x4df160 - _0x230ae4) / 1000).toFixed(1);
  return formatTimecode(_0x230ae4) + " - " + formatTimecode(_0x4df160) + " （约 " + _0x4bbb08 + " 秒）";
}
export function resolveAudioVoicePanelCoverUrl(_0x9a87e0 = {}) {
  return resolveCanvasVideoPosterUrl(_0x9a87e0);
}
export function createDefaultAudioVoiceSegments() {
  return [{
    id: "mock-segment-1",
    startMs: 80,
    endMs: 4270,
    sourceText: "马某人这个县长买来的，嗯，买官就是为了挣钱。",
    targetText: "",
    sourceAudioReady: true,
    convertedAudioReady: false,
    activeAudio: "source",
    imitateToneEnabled: false,
    status: "detected"
  }, {
    id: "mock-segment-2",
    startMs: 5413,
    endMs: 10132,
    sourceText: "今天参加会议的人里面，就有一个人是怪物伪装的。",
    targetText: "",
    sourceAudioReady: true,
    convertedAudioReady: false,
    activeAudio: "source",
    imitateToneEnabled: false,
    status: "detected"
  }, {
    id: "mock-segment-3",
    startMs: 10080,
    endMs: 11849,
    sourceText: "谁有钱就挣谁的。",
    targetText: "",
    sourceAudioReady: true,
    convertedAudioReady: false,
    activeAudio: "source",
    imitateToneEnabled: false,
    status: "detected"
  }, {
    id: "mock-segment-4",
    startMs: 12060,
    endMs: 15380,
    sourceText: "那你想挣谁的钱呢？",
    targetText: "",
    sourceAudioReady: true,
    convertedAudioReady: false,
    activeAudio: "source",
    imitateToneEnabled: false,
    status: "detected"
  }].map(_0x2d0780 => ({
    ..._0x2d0780
  }));
}
function isAudioVoicePanelWorkflowItem(_0x510afd = {}) {
  const _0x4b7621 = String(_0x510afd?.group || "").trim();
  const _0xf9ccc5 = String(_0x510afd?.provider || "").trim();
  const _0x20fb7c = String(_0x510afd?.adapterType || "").trim();
  return AUDIO_VOICE_PANEL_MODEL_MENU_GROUPS.has(_0x4b7621) && _0xf9ccc5 === "runninghubwf" && _0x20fb7c === "workflow";
}
function getAudioVoicePanelWorkflowItems() {
  return buildAudioWorkflowItems().filter(isAudioVoicePanelWorkflowItem);
}
function toAudioVoicePanelModelOption(_0x56e768 = {}) {
  const _0x253b0f = String(_0x56e768.id || _0x56e768.key || _0x56e768.modelId || "").trim();
  return {
    id: _0x253b0f,
    label: translateManifestText(_0x56e768.label),
    subtitle: translateManifestText(_0x56e768.subtitle || ""),
    icon: _0x56e768.icon || "images/RH.png",
    iconAlt: _0x56e768.iconAlt || "runninghub",
    provider: _0x56e768.provider || "",
    adapterType: _0x56e768.adapterType || "",
    executionId: _0x56e768.executionId || "",
    async: _0x56e768.async === true,
    cancellable: _0x56e768.cancellable === true,
    vip: _0x56e768.vip === true
  };
}
export function getAudioVoicePanelModelOptions() {
  return getAudioVoicePanelWorkflowItems().map(toAudioVoicePanelModelOption);
}
export function getAudioVoicePanelModelGroups() {
  const _0x52e8bc = getAudioVoicePanelWorkflowItems();
  const _0x96636b = new Map(_0x52e8bc.map(toAudioVoicePanelModelOption).filter(_0x2e1bdf => _0x2e1bdf.id).map(_0x4604a1 => [_0x4604a1.id, _0x4604a1]));
  return buildAudioWorkflowMenuGroups(_0x52e8bc).map(_0x17b479 => ({
    id: String(_0x17b479.id || "").trim(),
    label: translateManifestText(_0x17b479.label || _0x17b479.id || ""),
    subtitle: translateManifestText(_0x17b479.subtitle || ""),
    icon: _0x17b479.icon || "images/RH.png",
    iconAlt: _0x17b479.iconAlt || _0x17b479.id || "runninghub",
    items: (Array.isArray(_0x17b479.items) ? _0x17b479.items : []).map(_0x178cee => _0x96636b.get(String(_0x178cee?.modelId || "").trim())).filter(Boolean)
  })).filter(_0x2ef763 => _0x2ef763.items.length > 0);
}
export function getAudioVoiceWorkflowAudioSlots(_0x3c876a = "") {
  return getAudioWorkflowSlots(_0x3c876a).map(_0x31a61a => ({
    ..._0x31a61a,
    label: translateManifestText(_0x31a61a.label || _0x31a61a.slot || "")
  }));
}
export function doesAudioVoiceWorkflowSupportToneClone(_0x406154 = "") {
  return doesAudioWorkflowSupportMultipleAudioInputs(_0x406154);
}
export function normalizeAudioVoicePanelWidth(_0x5df0b9, _0x5585f0) {
  return clampAudioVoicePanelWidth(_0x5df0b9, _0x5585f0);
}
export function resolveAudioVoiceSourceLocalPath(_0x1d857f = {}) {
  if (isAudioVoiceAudioNode(_0x1d857f)) {
    return resolveCanvasAudioLocalPath(_0x1d857f);
  } else {
    return resolveCanvasVideoLocalPath(_0x1d857f);
  }
}
export function resolveAudioVoiceSourceUrl(_0x326482 = {}) {
  if (isAudioVoiceAudioNode(_0x326482)) {
    return resolveCanvasAudioUrl(_0x326482);
  } else {
    return localPathToUrl(resolveCanvasVideoLocalPath(_0x326482));
  }
}
function normalizeAudioVoicePromptForBackend(_0x5eff93, _0x58e012) {
  const _0x2194df = String(_0x58e012 || "").trim();
  if (_0x5eff93 !== RH_AUDIO_ADVANCED_VOICE_CLONE_MODEL_ID) {
    return _0x2194df;
  }
  return _0x2194df.replace(/(^|\s+)@?音频1\s*[:：]?\s*/g, "$1[speaker_1]: ").replace(/(^|\s+)@?音频2\s*[:：]?\s*/g, "$1[speaker_2]: ").replace(/\s+(\[speaker_[12]\]:)/g, "\n$1").trim();
}
export function resolveAudioVoiceSegmentAudioInput(_0x426c76 = {}, _0x5300d5 = 1) {
  const _0x3dbbd1 = Number(_0x5300d5) === 2 ? 2 : 1;
  if (_0x3dbbd1 === 2) {
    return {
      nodeId: String(_0x426c76.voiceRefNodeId || ""),
      localPath: normalizeLocalPath(_0x426c76.voiceRefAudioLocalPath || ""),
      audioUrl: resolveSegmentLocalAudioUrl(_0x426c76.voiceRefAudioUrl, _0x426c76.voiceRefAudioLocalPath),
      name: String(_0x426c76.voiceRefName || ""),
      imageUrl: String(_0x426c76.voiceRefImageUrl || "")
    };
  }
  return {
    nodeId: String(_0x426c76.id || ""),
    localPath: normalizeLocalPath(_0x426c76.sourceAudioLocalPath || ""),
    audioUrl: resolveSegmentLocalAudioUrl(_0x426c76.sourceAudioUrl, _0x426c76.sourceAudioLocalPath),
    name: String(_0x426c76.sourceAudioName || "")
  };
}
function createAudioVoiceWorkflowAudioRef(_0x289ed8 = {}, _0x54bc54 = "") {
  const _0x246449 = _0x289ed8?.audioUrl;
  if (!_0x246449) {
    return null;
  }
  return {
    refSlot: _0x54bc54,
    url: _0x246449,
    sourceId: _0x289ed8.nodeId,
    sourceType: "source-audio"
  };
}
function isAudioVoiceImitateToneWorkflow(_0x21c9aa = "") {
  return AUDIO_VOICE_IMITATE_TONE_WORKFLOW_IDS.has(String(_0x21c9aa || "").trim());
}
function getAudioVoicePrimaryAudioSlot(_0x27c52c = "") {
  if (_0x27c52c === RH_AUDIO_ADVANCED_VOICE_CLONE_MODEL_ID) {
    return "audio1";
  } else {
    return "audioRef";
  }
}
function buildAudioVoiceWorkflowAudioRefs(_0x2f5033 = {}, _0x126234 = "", _0x1a5c95 = []) {
  const _0x30aa10 = resolveAudioVoiceSegmentAudioInput(_0x2f5033, 1);
  const _0x5c189e = resolveAudioVoiceSegmentAudioInput(_0x2f5033, 2);
  if (isAudioVoiceImitateToneWorkflow(_0x126234)) {
    const _0x18eccd = getAudioVoicePrimaryAudioSlot(_0x126234);
    const _0x101814 = [];
    if (_0x5c189e.audioUrl) {
      _0x101814.push(createAudioVoiceWorkflowAudioRef(_0x5c189e, _0x18eccd));
      if (_0x2f5033.imitateToneEnabled === true) {
        if (!_0x30aa10.audioUrl) {
          throw createAudioVoicePayloadError("missingSourceAudio");
        }
        _0x101814.push(createAudioVoiceWorkflowAudioRef(_0x30aa10, "audio2"));
      }
    } else {
      _0x101814.push(createAudioVoiceWorkflowAudioRef(_0x30aa10, _0x18eccd));
    }
    return normalizeAudioWorkflowRefSlots(_0x101814.filter(Boolean), _0x126234);
  }
  if (_0x126234 === RH_AUDIO_VOICE_CONVERT_MODEL_ID) {
    return normalizeAudioWorkflowRefSlots([createAudioVoiceWorkflowAudioRef(_0x5c189e, _0x1a5c95[0]?.slot || ""), createAudioVoiceWorkflowAudioRef(_0x30aa10, _0x1a5c95[1]?.slot || "")].filter(Boolean), _0x126234);
  }
  return normalizeAudioWorkflowRefSlots([_0x30aa10, _0x5c189e].map((_0x9349db, _0x1bd4a2) => createAudioVoiceWorkflowAudioRef(_0x9349db, _0x1a5c95[_0x1bd4a2]?.slot || "")).filter(Boolean), _0x126234);
}
export function buildAudioVoiceGeneratePayload(_0x127979 = {}, _0x4339d5 = "", {
  workflowLabel = "",
  nodeId = "",
  installId = ""
} = {}) {
  const _0x4994af = String(_0x4339d5 || "").trim();
  if (!_0x4994af || !getModelManifest(_0x4994af)) {
    throw createAudioVoicePayloadError("unsupportedVoiceModel");
  }
  const _0x4c4deb = normalizeAudioVoicePromptForBackend(_0x4994af, firstNonEmptyString(_0x127979.targetText, _0x127979.sourceText));
  const _0x5c9687 = getAudioVoiceWorkflowAudioSlots(_0x4994af);
  const _0x4e21d0 = buildAudioVoiceWorkflowAudioRefs(_0x127979, _0x4994af, _0x5c9687);
  const _0x506fd2 = new Map(_0x4e21d0.map(_0x147d7e => [String(_0x147d7e?.refSlot || ""), _0x147d7e]));
  _0x5c9687.forEach((_0x4e367a, _0x24bd14) => {
    const _0x4acd56 = _0x506fd2.get(_0x4e367a.slot);
    if (_0x4e367a.required && !_0x4acd56?.url) {
      if (_0x4994af === RH_AUDIO_VOICE_CONVERT_MODEL_ID) {
        throw createAudioVoicePayloadError(_0x4e367a.slot === "audioRef" ? "missingVoiceRefAudio" : "missingSourceAudio");
      }
      throw createAudioVoicePayloadError(_0x24bd14 === 0 ? "missingSourceAudio" : "missingSecondVoiceRefAudio");
    }
  });
  if (_0x4994af === RH_AUDIO_INDEXTTS2_CLONE_MODEL_ID) {
    if (!_0x4c4deb) {
      throw createAudioVoicePayloadError("missingPromptText");
    }
  }
  if (_0x4994af === RH_AUDIO_ADVANCED_VOICE_CLONE_MODEL_ID && !_0x4c4deb) {
    throw createAudioVoicePayloadError("missingPromptText");
  }
  const _0x855b06 = {
    provider: "runninghubwf",
    audioWorkflowKey: _0x4994af,
    audioWorkflowLabel: String(workflowLabel || "").trim(),
    nodeId: String(nodeId || "").trim(),
    prompt: _0x4c4deb,
    textInputs: _0x4c4deb ? [_0x4c4deb] : [],
    audioRefs: _0x4e21d0
  };
  const _0x2daa66 = String(installId || "").trim();
  if (_0x2daa66) {
    _0x855b06.installId = _0x2daa66;
  }
  return _0x855b06;
}
export async function resolveAudioVoiceGenerateInstallId(_0x95da66 = globalThis.window, _0x105df6 = "") {
  const _0x51d780 = String(_0x95da66?.__aicInstallId || globalThis.__aicInstallId || "").trim();
  const _0x45e0a9 = getModelManifest(String(_0x105df6 || "").trim());
  if (_0x45e0a9?.vip !== true) {
    return _0x51d780;
  }
  if (typeof _0x95da66?.ensureSubscriptionInstallId === "function") {
    try {
      const _0x217af4 = String(await _0x95da66.ensureSubscriptionInstallId()).trim();
      if (_0x217af4) {
        return _0x217af4;
      }
    } catch {}
  }
  return _0x51d780;
}
function normalizeAudioVoiceLastUsedAt(_0x248ab3) {
  const _0x7ba874 = Number(_0x248ab3);
  if (Number.isFinite(_0x7ba874) && _0x7ba874 > 0) {
    return Math.round(_0x7ba874);
  } else {
    return 0;
  }
}
function resolveLatestAudioVoicePersistedSourceNode(_0x5dff94 = {}) {
  let _0x315380 = null;
  let _0x500672 = 0;
  Object.values(_0x5dff94 || {}).forEach(_0x4f84ee => {
    if (!isAudioVoiceSourceNode(_0x4f84ee)) {
      return;
    }
    const _0x1cf9a5 = resolveAudioVoicePersistedAnalysisSnapshot(_0x4f84ee);
    const _0x5aa20a = normalizeAudioVoiceLastUsedAt(_0x1cf9a5?.lastUsedAt);
    if (!_0x1cf9a5 || _0x5aa20a <= _0x500672) {
      return;
    }
    _0x315380 = _0x4f84ee;
    _0x500672 = _0x5aa20a;
  });
  return _0x315380;
}
export function resolveAudioVoicePanelSourceNode(_0x56218f = {}, _0x58002c = "", _0x580bcc = "") {
  const _0x18877b = _0x56218f?.nodes || {};
  const _0x4fa53b = String(_0x58002c || "").trim();
  if (_0x4fa53b && isAudioVoiceSourceNode(_0x18877b[_0x4fa53b])) {
    return _0x18877b[_0x4fa53b];
  }
  const _0x2b0635 = Array.isArray(_0x56218f?.selectedNodeIds) ? _0x56218f.selectedNodeIds : [];
  for (const _0x454155 of _0x2b0635) {
    const _0x4dd098 = _0x18877b?.[_0x454155];
    if (isAudioVoiceSourceNode(_0x4dd098)) {
      return _0x4dd098;
    }
  }
  const _0x4e567f = String(_0x580bcc || "").trim();
  if (_0x4e567f && isAudioVoiceSourceNode(_0x18877b[_0x4e567f])) {
    return _0x18877b[_0x4e567f];
  }
  return resolveLatestAudioVoicePersistedSourceNode(_0x18877b);
}
export function resolveAudioVoicePanelOpenSourceNode(_0x56ba6a = {}, _0x2801b4 = {}, _0x5335de = "") {
  const _0x5831a6 = String(_0x2801b4?.sourceNodeId || "").trim();
  if (_0x5831a6) {
    return resolveAudioVoicePanelSourceNode(_0x56ba6a, _0x5831a6, "");
  }
  return resolveAudioVoicePanelSourceNode({
    ...(_0x56ba6a || {}),
    selectedNodeIds: []
  }, "", _0x5335de);
}
function normalizeAudioVoiceMemoryKeyPart(_0x4920f4) {
  return String(_0x4920f4 || "").trim().replace(/\\/g, "/");
}
export function resolveAudioVoiceAnalysisMemoryKey(_0x28e8d8 = {}) {
  const _0x4ba89b = _0x28e8d8 || {};
  const _0x3875f1 = firstNonEmptyString(_0x4ba89b.displayLocalPath, _0x4ba89b.localPath);
  const _0xc17055 = /^(?:https?:|blob:|data:|file:)/i.test(_0x3875f1) ? "" : normalizeLocalPath(_0x3875f1) || normalizeAudioVoiceMemoryKeyPart(_0x3875f1);
  if (_0xc17055) {
    return "path:" + normalizeAudioVoiceMemoryKeyPart(_0xc17055);
  }
  const _0x51f543 = firstNonEmptyString(_0x4ba89b.src, _0x4ba89b.videoUrl, _0x4ba89b.audioUrl, _0x4ba89b.url, _0x4ba89b.resultUrl);
  if (_0x51f543) {
    return "src:" + normalizeAudioVoiceMemoryKeyPart(_0x51f543);
  }
  const _0xeb1f88 = String(_0x4ba89b.id || "").trim();
  if (_0xeb1f88) {
    return "id:" + _0xeb1f88;
  } else {
    return "";
  }
}
function formatDuration(_0x4b5ce0) {
  const _0xe8cb30 = Number(_0x4b5ce0);
  if (!Number.isFinite(_0xe8cb30) || _0xe8cb30 <= 0) {
    return "";
  }
  const _0x181b56 = Math.round(_0xe8cb30);
  const _0x2145a7 = Math.floor(_0x181b56 / 60);
  const _0x5dafec = String(_0x181b56 % 60).padStart(2, "0");
  return _0x2145a7 + ":" + _0x5dafec;
}
function getSourceLabel(_0x25b07e = {}) {
  if (isAudioVoiceAudioNode(_0x25b07e)) {
    if (_0x25b07e.localPath) {
      return panelText("source.localAudio");
    } else {
      return panelText("source.canvasAudio");
    }
  }
  if (_0x25b07e.localPath) {
    return panelText("source.localVideo");
  } else {
    return panelText("source.canvasVideo");
  }
}
function getSourceName(_0x3b519d = {}) {
  return _0x3b519d.name || _0x3b519d.fileName || _0x3b519d.title || _0x3b519d.label || panelText("source.empty");
}
function getSourceMeta(_0x1f1a4b = {}) {
  const _0x55e22e = formatDuration(_0x1f1a4b.videoDuration || _0x1f1a4b.audioDuration || _0x1f1a4b.duration);
  const _0x1425e2 = [getSourceLabel(_0x1f1a4b), _0x55e22e].filter(Boolean);
  return _0x1425e2.join(" / ");
}
export function normalizeAudioVoiceAnalyzeSegments(_0x10bab0 = {}) {
  return a903_0x269d29(_0x10bab0, {
    normalizeSegment: a903_0x2f01f3
  });
}
export function buildAudioVoiceVideoAnalysisMemorySnapshot({
  sourceNode = {},
  sourceNodeId = "",
  segments = [],
  analysisSourceAudioLocalPath = "",
  analysisSourceAudioUrl = "",
  analysisStatus = "ready",
  lastUsedAt = 0,
  completedComposeKey = ""
} = {}) {
  const _0x4fbb50 = sourceNode || {};
  const _0x2ae77d = resolveAudioVoiceAnalysisMemoryKey(_0x4fbb50);
  if (!_0x2ae77d) {
    return null;
  }
  const _0x109c80 = normalizeLocalPath(analysisSourceAudioLocalPath || "");
  const _0x39ed2f = normalizeAudioVoiceLastUsedAt(lastUsedAt);
  const _0x497547 = {
    schemaVersion: AUDIO_VOICE_ANALYSIS_SCHEMA_VERSION,
    key: _0x2ae77d,
    sourceNodeId: String(sourceNodeId || _0x4fbb50.id || ""),
    analysisSourceAudioLocalPath: _0x109c80,
    analysisSourceAudioUrl: firstNonEmptyString(analysisSourceAudioUrl, localPathToUrl(_0x109c80)),
    analysisStatus: String(analysisStatus || "ready"),
    completedComposeKey: String(completedComposeKey || ""),
    segments: (Array.isArray(segments) ? segments : []).map(a903_0x2f01f3)
  };
  if (_0x39ed2f > 0) {
    _0x497547.lastUsedAt = _0x39ed2f;
  }
  return _0x497547;
}
export function resolveAudioVoicePersistedAnalysisSnapshot(_0x2abdda = {}) {
  const _0x40d507 = _0x2abdda?.[AUDIO_VOICE_ANALYSIS_STATE_FIELD];
  if (!_0x40d507 || typeof _0x40d507 !== "object" || Array.isArray(_0x40d507)) {
    return null;
  }
  const _0x501ef7 = buildAudioVoiceVideoAnalysisMemorySnapshot({
    sourceNode: _0x2abdda,
    sourceNodeId: _0x40d507.sourceNodeId || _0x2abdda?.id,
    segments: _0x40d507.segments,
    analysisSourceAudioLocalPath: _0x40d507.analysisSourceAudioLocalPath,
    analysisSourceAudioUrl: _0x40d507.analysisSourceAudioUrl,
    analysisStatus: _0x40d507.analysisStatus,
    lastUsedAt: _0x40d507.lastUsedAt,
    completedComposeKey: _0x40d507.completedComposeKey
  });
  if (!_0x501ef7) {
    return null;
  }
  const _0x65f77d = String(_0x40d507.key || "").trim();
  if (_0x65f77d && _0x65f77d !== _0x501ef7.key) {
    return null;
  }
  if (_0x501ef7.analysisStatus !== "ready" && _0x501ef7.segments.length <= 0) {
    return null;
  }
  return _0x501ef7;
}
function shouldShowConvertedRow(_0x5f0236 = {}) {
  return !!String(_0x5f0236.targetText || "").trim() || !!String(_0x5f0236.error || "").trim() || _0x5f0236.convertedAudioReady === true || _0x5f0236.status === "generating" || _0x5f0236.status === "ready";
}
function hasSegmentSourceAudio(_0x5a8294 = {}) {
  return !!resolveSegmentLocalAudioUrl(_0x5a8294.sourceAudioUrl, _0x5a8294.sourceAudioLocalPath);
}
function hasSegmentConvertedAudio(_0x1b30cb = {}) {
  return _0x1b30cb.convertedAudioReady === true && !!resolveSegmentLocalAudioUrl(_0x1b30cb.convertedAudioUrl, _0x1b30cb.convertedAudioLocalPath);
}
function isSegmentUsingConvertedAudio(_0x147f7d = {}) {
  return hasSegmentConvertedAudio(_0x147f7d) && _0x147f7d.activeAudio !== "source";
}
export function resolveAudioVoiceSegmentActiveAudioUrl(_0x4aa54e = {}) {
  if (isSegmentUsingConvertedAudio(_0x4aa54e)) {
    return resolveSegmentLocalAudioUrl(_0x4aa54e.convertedAudioUrl, _0x4aa54e.convertedAudioLocalPath);
  }
  return resolveSegmentLocalAudioUrl(_0x4aa54e.sourceAudioUrl, _0x4aa54e.sourceAudioLocalPath);
}
export function resolveAudioVoiceSegmentActiveAudioLocalPath(_0x429918 = {}) {
  if (isSegmentUsingConvertedAudio(_0x429918)) {
    return normalizeLocalPath(_0x429918.convertedAudioLocalPath || "");
  }
  return normalizeLocalPath(_0x429918.sourceAudioLocalPath || "");
}
function resolveAudioVoiceSegmentActiveAudioDurationMs(_0x34f6f8 = {}, _0x55a912 = 0, _0x265393 = 0) {
  const _0x5ddb7d = Math.max(0, Math.round(Number(_0x265393) || 0) - Math.round(Number(_0x55a912) || 0));
  if (isSegmentUsingConvertedAudio(_0x34f6f8)) {
    const _0x236305 = pickAudioDurationSec(_0x34f6f8.convertedAudioDuration, _0x34f6f8.audioDuration);
    if (_0x236305 > 0) {
      return Math.max(1, Math.round(_0x236305 * 1000));
    }
    return 0;
  }
  return _0x5ddb7d;
}
export function buildAudioVoiceComposeSources(_0x21375c = []) {
  return (Array.isArray(_0x21375c) ? _0x21375c : []).filter(_0x335511 => _0x335511?.status !== "removed").map(resolveAudioVoiceSegmentActiveAudioUrl).filter(Boolean);
}
export function applyAudioVoiceReferenceToSegments(_0x27596c = [], _0x5b5034 = [], _0x3234f0 = {}) {
  const _0x1b31de = Array.isArray(_0x27596c) ? _0x27596c : [];
  if (!isAudioVoiceAudioNode(_0x3234f0)) {
    return {
      segments: _0x1b31de,
      appliedIds: [],
      reason: "unsupported"
    };
  }
  const _0x19805c = resolveCanvasAudioLocalPath(_0x3234f0);
  const _0x4d5e95 = resolveCanvasAudioUrl(_0x3234f0);
  if (!_0x4d5e95) {
    return {
      segments: _0x1b31de,
      appliedIds: [],
      reason: "invalid"
    };
  }
  const _0x454737 = new Set(_0x1b31de.filter(_0x4e80f8 => _0x4e80f8?.status !== "removed").map(_0x2a3d91 => String(_0x2a3d91?.id || "").trim()).filter(Boolean));
  const _0x24fac3 = [...new Set((Array.isArray(_0x5b5034) ? _0x5b5034 : []).map(_0x3c9705 => String(_0x3c9705 || "").trim()).filter(_0x5f542d => _0x454737.has(_0x5f542d)))];
  if (!_0x24fac3.length) {
    return {
      segments: _0x1b31de,
      appliedIds: _0x24fac3,
      reason: "no-target"
    };
  }
  const _0x485430 = new Set(_0x24fac3);
  const _0x5d26d2 = getSourceName(_0x3234f0);
  const _0xb17744 = firstNonEmptyString(_0x3234f0.voiceRefImageUrl, _0x3234f0.imageUrl, _0x3234f0.thumbUrl, _0x3234f0.posterUrl);
  return {
    segments: _0x1b31de.map(_0x2bb506 => _0x485430.has(_0x2bb506.id) ? {
      ..._0x2bb506,
      voiceRefNodeId: _0x3234f0.id || "",
      voiceRefAudioLocalPath: _0x19805c,
      voiceRefAudioUrl: _0x4d5e95,
      voiceRefName: _0x5d26d2,
      voiceRefImageUrl: _0xb17744,
      error: ""
    } : _0x2bb506),
    appliedIds: _0x24fac3,
    reason: ""
  };
}
export function buildAudioVoiceComposeTimelineClips(_0x2dc21f = []) {
  return (Array.isArray(_0x2dc21f) ? _0x2dc21f : []).filter(_0x3c5cc4 => _0x3c5cc4?.status !== "removed").map(_0xd73d8c => {
    const _0x5dba48 = resolveAudioVoiceSegmentActiveAudioLocalPath(_0xd73d8c);
    const _0x5307d1 = Math.max(0, Math.round(Number(_0xd73d8c.startMs) || 0));
    const _0x36f296 = Math.max(_0x5307d1, Math.round(Number(_0xd73d8c.endMs) || _0x5307d1));
    if (!_0x5dba48 || !(_0x36f296 > _0x5307d1)) {
      return null;
    }
    const _0x78db07 = resolveAudioVoiceSegmentActiveAudioDurationMs(_0xd73d8c, _0x5307d1, _0x36f296);
    return {
      id: String(_0xd73d8c.id || ""),
      src: _0x5dba48,
      startMs: _0x5307d1,
      endMs: _0x36f296,
      ...(_0x78db07 > 0 ? {
        durationMs: _0x78db07
      } : {})
    };
  }).filter(Boolean);
}
export function resolveAudioVoiceComposeDurationSec(_0x4000ee = {}, _0xdf9600 = []) {
  const _0x34a518 = Number(_0x4000ee?.videoDuration || _0x4000ee?.audioDuration || _0x4000ee?.duration);
  if (Number.isFinite(_0x34a518) && _0x34a518 > 0) {
    return _0x34a518;
  }
  const _0xaaf99b = Math.max(0, ...(Array.isArray(_0xdf9600) ? _0xdf9600 : []).map(_0x23549e => Math.round(Number(_0x23549e?.endMs) || 0)).filter(_0x176a21 => Number.isFinite(_0x176a21) && _0x176a21 > 0));
  if (_0xaaf99b > 0) {
    return _0xaaf99b / 1000;
  } else {
    return 0;
  }
}
export function getDefaultAudioVoiceModelId() {
  const _0x236fd1 = getAudioVoicePanelModelOptions();
  return _0x236fd1.find(_0x1c1aac => _0x1c1aac.id === RH_AUDIO_INDEXTTS2_CLONE_MODEL_ID)?.id || _0x236fd1[0]?.id || "";
}
export function initAudioVoicePanel({
  store: _0xd25027,
  fabBtnEl: _0x54f10b,
  root = document.body,
  windowObject = window,
  embedded = false,
  composeTimeline = composeAudioVoiceTimelineNearNode,
  translateSegments = translateAudioVoiceSegments,
  playCompletion = playCompletionSound,
  showCompletionNotification = showGenerationCompleteNotification,
  onComposeResult = null,
  onAudioPickStateChange = null,
  resolveStartAnalyzeConfirmation = null
} = {}) {
  if (!root || !_0x54f10b) {
    return null;
  }
  const _0x37e483 = createAudioVoiceConfirmDialog({
    root: root,
    documentObject: root.ownerDocument || globalThis.document,
    windowObject: windowObject
  });
  let _0x5290c1 = "";
  let _0x436e7e = null;
  let _0x5bad8a = 0;
  let _0x30e3cd = "";
  let _0xf0d5b4 = "";
  let _0x3898eb = [];
  let _0x53b6fd = new Set();
  let _0x3dfa10 = getDefaultAudioVoiceModelId();
  let _0xe13fd9 = AUDIO_VOICE_ASR_PROVIDER_IDS.DOUBAO;
  let _0x5649b1 = null;
  let _0x3e8634 = null;
  let _0x5ae42e = "idle";
  let _0x499810 = null;
  const _0x8befa3 = createAudioVoiceTaskProgressTracker({
    onProgress: _0x8e54f1
  });
  const _0x8ae442 = createAudioVoiceAnalysisSession({
    cancelMediaTask: cancelElectronMediaTask
  });
  let _0x316888 = "";
  const _0xa73170 = new Set();
  const _0x1ef534 = new Map();
  let _0x6c5304 = null;
  let _0x104b18 = "";
  let _0x8337c6 = null;
  let _0xa095d4 = "";
  let _0x3f89df = null;
  let _0x59e8e9 = null;
  let _0x1b2223 = null;
  const _0x2268ea = new Set();
  let _0x302933 = null;
  let _0x389809 = null;
  let _0x27c035 = 0;
  let _0x33483a = "";
  let _0xd7f30 = new Set();
  const _0x16ffc9 = createAudioVoiceGenerationTaskOrchestration({
    createStore: ({
      sourceNodeId: _0x38bf7d,
      segmentId: _0x4e3fe5,
      targetNodeId: _0x4d9381
    }) => _0x3523e7(_0x4e3fe5, _0x4d9381, _0x38bf7d)
  });
  const _0x443d5d = createAudioVoiceTaskRecoveryManager();
  const _0x2123cb = createAudioVoiceSegmentEditSession();
  const _0x4e1dc6 = createAudioVoiceSegmentMergeController({
    session: _0x2123cb,
    getSourceNodeId: () => _0x5290c1,
    getSegments: () => _0x3898eb,
    composeAudio: ({
      sourceNodeId: _0x5962c2,
      srcs: _0x21854c,
      durationMs: _0x1c4ee2
    }) => enqueueElectronMediaTask({
      kind: "audioCompose",
      nodeId: _0x5962c2,
      srcs: _0x21854c,
      args: {
        srcs: _0x21854c,
        duration: Math.max(0, Number(_0x1c4ee2 || 0) / 1000)
      }
    }, {
      wait: true,
      timeout: AUDIO_CUT_TASK_TIMEOUT_MS
    }),
    commitSegments: _0x32ba70,
    render: _0x276cb6,
    markMutation: _0x5b0f5b => _0x5c74a3("merge", [_0x5b0f5b]),
    showPending: () => _0x37aea5(panelText("status.merging")),
    showError: _0x3b5814 => windowObject?.showToast?.(_0x2e42ea(_0x3b5814, panelText("toasts.sourceClipFailed")), "error"),
    showStale: () => windowObject?.showToast?.(panelText("toasts.mergeChanged"), "warn")
  });
  const _0x1db571 = createAudioVoicePlaybackSession({
    windowObject: windowObject,
    documentObject: root?.ownerDocument || globalThis.document
  });
  const _0x47ce8e = createEl("aside", "audio-voice-panel");
  _0x47ce8e.classList.toggle("is-embedded", embedded === true);
  _0x47ce8e.setAttribute("aria-hidden", "true");
  _0x47ce8e.setAttribute("aria-label", panelText("title") + " " + panelText("betaBadge"));
  const _0x5d9176 = createEl("div", "audio-voice-panel-resize-handle panel-resize-handle");
  _0x5d9176.setAttribute("role", "separator");
  _0x5d9176.setAttribute("aria-orientation", "vertical");
  _0x5d9176.setAttribute("aria-label", panelText("resizeLabel"));
  _0x5d9176.tabIndex = 0;
  const _0x53649f = createEl("div", "audio-voice-panel-header");
  const _0x509341 = createEl("div", "audio-voice-panel-title");
  _0x509341.append(createEl("span", "audio-voice-panel-title-main", panelText("title")), createEl("span", "audio-voice-panel-title-beta", panelText("betaBadge")));
  const _0x5bf50e = createButton("audio-voice-panel-close", panelText("close"), "close");
  _0x53649f.append(_0x509341, _0x5bf50e);
  const _0x4aaa91 = createEl("div", "audio-voice-panel-main");
  _0x47ce8e.append(_0x5d9176, _0x53649f, _0x4aaa91);
  root.appendChild(_0x47ce8e);
  const _0x18be50 = createEl("div", "audio-voice-pick-notice", panelText("source.pickNotice"));
  _0x18be50.hidden = true;
  _0x18be50.setAttribute("role", "status");
  _0x18be50.setAttribute("aria-live", "polite");
  root.appendChild(_0x18be50);
  const _0x5e5a26 = createAudioVoicePanelPickSession({
    panel: _0x47ce8e,
    noticeElement: _0x18be50,
    store: _0xd25027,
    documentObject: _0x47ce8e.ownerDocument || globalThis.document,
    windowObject: windowObject,
    getSegments: () => _0x3898eb,
    getSelectedSegmentIds: () => _0x53b6fd,
    doesSegmentSupportAudioReference: _0x2d8e9f => doesAudioVoiceWorkflowSupportToneClone(_0x1bc79e(_0x2d8e9f)?.id || _0x3dfa10),
    loadSourceNode: _0x27b073,
    applyAudioReference: (_0x310be0, _0x5b4b66) => {
      const _0x4dbbb9 = applyAudioVoiceReferenceToSegments(_0x3898eb, _0x5b4b66, _0x310be0);
      if (_0x4dbbb9.appliedIds.length) {
        _0x3898eb = _0x4dbbb9.segments;
        _0x5454de();
      }
      return _0x4dbbb9;
    },
    syncSourceUi: _0x7d74ae,
    syncAudioTargetUi: _0x26b9e7,
    onAudioPickStateChange: onAudioPickStateChange,
    text: panelText
  });
  const _0x350705 = readStoredPanelWidth(windowObject);
  if (_0x350705) {
    document?.body?.style?.setProperty?.("--audio-voice-panel-width", clampAudioVoicePanelWidth(_0x350705) + "px");
  }
  function _0x37aea5(_0x4d05ac = panelText("toasts.pipelinePending")) {
    windowObject?.showToast?.(_0x4d05ac, "info");
  }
  function _0x36fa8e() {
    return Boolean(_0x389809);
  }
  function _0x54223(_0x4aad19 = false) {
    _0x37e483.close(_0x4aad19);
  }
  function _0x32c80e() {
    _0x27c035 += 1;
    _0x389809 = null;
    _0x54223(false);
  }
  function _0x6b1b9e(_0x221f2b = {}) {
    return _0x37e483.confirm(_0x221f2b);
  }
  function _0x137d79({
    language: _0x3c7caf,
    count: _0x36e794,
    scope: _0x14d081,
    returnFocus: _0x224164
  } = {}) {
    return _0x6b1b9e({
      className: "audio-voice-translation-confirm",
      title: panelText("translation.confirmTitle"),
      message: panelText(_0x14d081 === "selected" ? "translation.confirmSelected" : "translation.confirmAll", {
        count: _0x36e794,
        language: _0x3c7caf?.label || ""
      }),
      cancelLabel: panelText("translation.cancel"),
      confirmLabel: panelText("translation.confirm"),
      returnFocus: _0x224164
    });
  }
  function _0x2e42ea(_0x55cd1a, _0x2cf852 = panelText("toasts.operationFailed")) {
    const _0x4611ca = String(_0x55cd1a?.code || _0x55cd1a?.message || "").trim();
    if (_0x4611ca && _0x4611ca === _0x55cd1a?.code) {
      const _0x5cb6ab = panelText("toasts." + _0x4611ca);
      if (_0x5cb6ab && _0x5cb6ab !== "audioVoicePanel.toasts." + _0x4611ca) {
        return _0x5cb6ab;
      }
    }
    return String(_0x55cd1a?.message || _0x55cd1a || _0x2cf852).trim() || _0x2cf852;
  }
  function _0x507477(_0x3a6dff) {
    const _0x1dbc94 = _0x2e42ea(_0x3a6dff, panelText("toasts.analysisFailed"));
    if (/invalid\s+x-api-key|x-api-key\s+invalid|api\s*key\s+invalid/i.test(_0x1dbc94)) {
      return panelText("toasts.asrApiKeyInvalid");
    }
    if (/(?:permission|denied|forbid|unauthor|not\s+authorized|no\s+access|无权限|未授权|鉴权)/i.test(_0x1dbc94)) {
      return panelText("toasts.asrPermissionDenied");
    }
    return _0x1dbc94;
  }
  function _0x2a1f94(_0x4f5b55 = "invalid", _0x473d32 = "") {
    const _0x3ea55a = String(_0x4f5b55 || "").trim() === "missing" ? "missing" : "invalid";
    const _0x96dfc7 = _0x3ea55a === "missing" ? panelText("asrApiKeyHelp.missingMessage") : panelText("asrApiKeyHelp.invalidMessage");
    return {
      reason: _0x3ea55a,
      title: _0x3ea55a === "missing" ? panelText("asrApiKeyHelp.missingTitle") : panelText("asrApiKeyHelp.invalidTitle"),
      message: String(_0x473d32 || _0x96dfc7).trim() || _0x96dfc7
    };
  }
  function _0x55f930(_0x2219f1 = "invalid", _0x5728af = "") {
    _0x5649b1 = _0x2a1f94(_0x2219f1, _0x5728af);
    _0x276cb6();
    _0x47ce8e.querySelector?.(".audio-voice-asr-config-alert")?.scrollIntoView?.({
      block: "nearest",
      behavior: "smooth"
    });
  }
  function _0x13f10c() {
    if (!_0x5649b1) {
      return;
    }
    _0x5649b1 = null;
    _0x276cb6();
  }
  async function _0x37296d() {
    try {
      await ensureConfig();
    } catch {
      _0x55f930("invalid", panelText("toasts.asrConfigReadFailed"));
      return false;
    }
    const _0x34a13e = getProviderConfig(AUDIO_VOICE_DOUBAO_ASR_PROVIDER_CONFIG_ID);
    if (!String(_0x34a13e?.apiKey || "").trim()) {
      _0x55f930("missing", panelText("asrApiKeyHelp.missingMessage"));
      return false;
    }
    const _0x1dccb9 = await testProviderConnection(AUDIO_VOICE_DOUBAO_ASR_PROVIDER_CONFIG_ID, _0x34a13e, {
      requiredCapabilities: ["asr"]
    }).catch(() => null);
    if (_0x1dccb9 && !_0x1dccb9.ok) {
      if (shouldShowVolcengineSpeechApiKeyHelp(_0x1dccb9, _0x1dccb9.summary || "")) {
        _0x55f930("invalid", _0x1dccb9.summary || panelText("asrApiKeyHelp.invalidMessage"));
      } else {
        windowObject?.showToast?.(_0x1dccb9.summary || _0x1dccb9.suggestion || panelText("toasts.analysisFailed"), "error");
      }
      return false;
    }
    _0x13f10c();
    return true;
  }
  function _0xc8dbef(_0x980fdf = "invalid", _0xb7cd6a = "") {
    const _0x519621 = String(_0x980fdf || "").trim() === "missing" ? "missing" : "invalid";
    const _0x3395d0 = _0x519621 === "missing" ? panelText("translationApiKeyHelp.missingMessage") : panelText("translationApiKeyHelp.invalidMessage");
    return {
      reason: _0x519621,
      title: _0x519621 === "missing" ? panelText("translationApiKeyHelp.missingTitle") : panelText("translationApiKeyHelp.invalidTitle"),
      message: String(_0xb7cd6a || _0x3395d0).trim() || _0x3395d0
    };
  }
  function _0x1456b7(_0x54617d = "invalid", _0x419bb0 = "") {
    _0x3e8634 = _0xc8dbef(_0x54617d, _0x419bb0);
    _0x276cb6();
    _0x47ce8e.querySelector?.(".audio-voice-translation-config-alert")?.scrollIntoView?.({
      block: "nearest",
      behavior: "smooth"
    });
  }
  function _0x4bcf30() {
    if (!_0x3e8634) {
      return;
    }
    _0x3e8634 = null;
    _0x276cb6();
  }
  async function _0x252d4b() {
    try {
      await ensureConfig();
    } catch {
      _0x1456b7("invalid", panelText("toasts.translationConfigReadFailed"));
      return false;
    }
    const _0x375e2e = getProviderConfig(AUDIO_VOICE_TRANSLATION_PROVIDER_ID);
    if (!String(_0x375e2e?.apiKey || "").trim()) {
      _0x1456b7("missing", panelText("translationApiKeyHelp.missingMessage"));
      return false;
    }
    _0x4bcf30();
    return true;
  }
  function _0xe0d83c(_0x4c17be) {
    return AUDIO_VOICE_INLINE_ERROR_CODES.has(String(_0x4c17be?.code || "").trim());
  }
  function _0xf873a5() {
    return getAudioVoicePanelModelOptions().find(_0x2c7aee => _0x2c7aee.id === _0x3dfa10) || null;
  }
  function _0x1bc79e(_0x3a587b = {}) {
    const _0x4e0ffe = getAudioVoicePanelModelOptions();
    const _0x36e124 = _0x3a587b.voiceModelSelectionMode === "global" ? "" : String(_0x3a587b.voiceModelId || "").trim();
    return _0x4e0ffe.find(_0x1826b5 => _0x1826b5.id === _0x36e124) || _0x4e0ffe.find(_0x1be11f => _0x1be11f.id === _0x3dfa10) || null;
  }
  function _0x17fe8f(_0x2c6cdd = {}) {
    const _0x338504 = String(_0x2c6cdd.taskModelId || "").trim();
    return getAudioVoicePanelModelOptions().find(_0x49ccab => _0x49ccab.id === _0x338504) || _0x1bc79e(_0x2c6cdd);
  }
  function _0x1c8156(_0x551600 = {}) {
    return _0x17fe8f(_0x551600)?.cancellable === true;
  }
  function _0x2d9e53(_0xd6b08e, _0x506336 = _0x5290c1) {
    return "audio-voice:" + (_0x506336 || "source") + ":" + _0xd6b08e;
  }
  function _0x2a8548(_0x123333 = {}) {
    const _0x381923 = _0x17fe8f(_0x123333);
    return {
      ..._0x123333,
      provider: _0x381923?.provider || "runninghubwf",
      adapterType: _0x381923?.adapterType || "workflow",
      isGenerating: _0x123333.isGenerating === true || _0x123333.status === "generating",
      jobStatus: _0x123333.jobStatus || (_0x123333.status === "generating" ? "running" : _0x123333.status === "ready" ? "success" : ""),
      rhTaskStatus: _0x123333.rhTaskStatus || (_0x123333.status === "generating" ? _0x123333.rhTaskId ? "running" : "pending" : "")
    };
  }
  function _0x3523e7(_0x52b422, _0x1fb979, _0x1ac6b4 = _0x5290c1) {
    const _0xf9966c = String(_0x1ac6b4 || "").trim();
    return createAudioVoiceGenerationTaskStoreAdapter({
      sourceNodeId: _0xf9966c,
      segmentId: _0x52b422,
      targetNodeId: _0x1fb979,
      readCurrentSourceNodeId: () => _0x5290c1,
      readCurrentSegment: _0x43e80f => _0x3898eb[_0x47b79d(_0x43e80f)] || {},
      updateCurrentSegment: _0x3584e8,
      readPersistedSnapshot: _0x4e7c13 => {
        const _0x1e2b97 = getStateSnapshot(_0xd25027).nodes?.[_0x4e7c13];
        return resolveAudioVoicePersistedAnalysisSnapshot(_0x1e2b97);
      },
      writePersistedSnapshot: (_0x2c9eaf, _0x1d7d7d) => {
        const _0x3fded7 = getStateSnapshot(_0xd25027).nodes?.[_0xf9966c];
        if (!_0x3fded7 || _0x2c9eaf !== _0xf9966c) {
          return;
        }
        _0xd25027.updateNodeData(_0x2c9eaf, {
          [AUDIO_VOICE_ANALYSIS_STATE_FIELD]: _0x1d7d7d
        });
        _0x1ef534.set(_0x1d7d7d.key, _0x1d7d7d);
      },
      buildTaskNode: _0x2a8548
    });
  }
  function _0x246d47(_0x271bf4, _0x2b20a4, _0x380300 = _0x5290c1) {
    return _0x16ffc9.getStore({
      sourceNodeId: _0x380300,
      segmentId: _0x271bf4,
      targetNodeId: _0x2b20a4
    });
  }
  function _0x763a5a(_0x1300e9, _0x3ccaeb = {}) {
    const _0x239cd = _0x1c8156(_0x3ccaeb);
    const _0x3e6190 = resolveGenerationButtonMode(_0x2a8548(_0x3ccaeb), {
      cancellable: _0x239cd,
      cancelInFlight: _0x16ffc9.isCancelInFlight(_0x5290c1, _0x3ccaeb.id)
    });
    if (_0x3e6190.busy && _0x3e6190.canCancel) {
      setGenerateButtonCancellableUi(_0x1300e9, {
        title: panelText("actions.cancelGeneration"),
        tooltip: panelText("actions.cancelGeneration"),
        ariaLabel: panelText("actions.cancelGeneration"),
        color: "var(--red)",
        busy: true
      });
      return;
    }
    if (_0x3e6190.busy) {
      setGenerateButtonLoadingUi(_0x1300e9, {
        title: panelText("status.generating"),
        tooltip: panelText("status.generating"),
        disabled: _0x3e6190.disabled,
        ariaLabel: panelText("status.generating")
      });
      return;
    }
    resetGenerateButtonIdleUi(_0x1300e9, panelText("actions.generate"));
  }
  function _0x32ba70(_0x55e9e8) {
    _0x3898eb = _0x55e9e8.map(a903_0x2f01f3);
    const _0x2052f8 = new Set(_0x3898eb.map(_0x1d7037 => _0x1d7037.id));
    for (const _0x315aeb of [..._0xa73170]) {
      if (!_0x2052f8.has(_0x315aeb)) {
        _0xa73170.delete(_0x315aeb);
      }
    }
    _0x53b6fd = new Set([..._0x53b6fd].filter(_0x14d3bc => _0x2052f8.has(_0x14d3bc)));
    _0x5454de();
    _0x276cb6();
    _0x525219();
  }
  function _0x1918c4(_0x4a33d7) {
    if (!_0x4a33d7 || !_0x5290c1 || typeof _0xd25027?.updateNodeData !== "function") {
      return;
    }
    const _0x33457c = getStateSnapshot(_0xd25027).nodes?.[_0x5290c1];
    if (!isAudioVoiceSourceNode(_0x33457c)) {
      return;
    }
    const _0x10b639 = resolveAudioVoicePersistedAnalysisSnapshot(_0x33457c);
    if (_0x10b639 && JSON.stringify(_0x10b639) === JSON.stringify(_0x4a33d7)) {
      _0x436e7e = _0x33457c;
      return;
    }
    const _0x142f0e = {
      [AUDIO_VOICE_ANALYSIS_STATE_FIELD]: _0x4a33d7
    };
    _0xd25027.updateNodeData(_0x5290c1, _0x142f0e);
    _0x436e7e = {
      ..._0x33457c,
      ..._0x142f0e
    };
  }
  function _0x5454de({
    markLastUsed = false
  } = {}) {
    if (markLastUsed && _0x5290c1) {
      _0x5bad8a = Math.max(_0x5bad8a, Date.now());
    }
    const _0x46a11f = buildAudioVoiceVideoAnalysisMemorySnapshot({
      sourceNode: _0x436e7e,
      sourceNodeId: _0x5290c1,
      segments: _0x3898eb,
      analysisSourceAudioLocalPath: _0x30e3cd,
      analysisSourceAudioUrl: _0xf0d5b4,
      analysisStatus: _0x5ae42e,
      lastUsedAt: _0x5bad8a,
      completedComposeKey: _0x33483a
    });
    if (!_0x46a11f) {
      return;
    }
    if (_0x46a11f.analysisStatus !== "ready" && _0x46a11f.segments.length <= 0) {
      return;
    }
    _0x1ef534.set(_0x46a11f.key, _0x46a11f);
    _0x1918c4(_0x46a11f);
  }
  function _0x31f1e9(_0x2bad44) {
    _0x53b6fd = new Set();
    _0x499810 = null;
    const _0x4be206 = resolveAudioVoiceAnalysisMemoryKey(_0x2bad44);
    const _0x1c45a9 = (_0x4be206 ? _0x1ef534.get(_0x4be206) : null) || resolveAudioVoicePersistedAnalysisSnapshot(_0x2bad44);
    if (!_0x1c45a9) {
      _0x3898eb = [];
      _0xa73170.clear();
      _0x30e3cd = "";
      _0xf0d5b4 = "";
      _0x5ae42e = "idle";
      _0x5bad8a = 0;
      _0x33483a = "";
      return false;
    }
    _0x3898eb = _0x1c45a9.segments.map(_0x3ab4cd => a903_0x2f01f3(normalizeAudioVoiceSegmentModelSelection(_0x3ab4cd, _0x3dfa10)));
    _0xa73170.clear();
    _0x30e3cd = normalizeLocalPath(_0x1c45a9.analysisSourceAudioLocalPath || "");
    _0xf0d5b4 = firstNonEmptyString(_0x1c45a9.analysisSourceAudioUrl, localPathToUrl(_0x30e3cd));
    _0x5ae42e = _0x1c45a9.analysisStatus === "ready" || _0x3898eb.length > 0 ? "ready" : "idle";
    _0x5bad8a = normalizeAudioVoiceLastUsedAt(_0x1c45a9.lastUsedAt);
    _0x33483a = String(_0x1c45a9.completedComposeKey || "");
    const _0x1172da = {
      ..._0x1c45a9,
      segments: _0x3898eb.map(a903_0x2f01f3)
    };
    _0x1ef534.set(_0x1c45a9.key, _0x1172da);
    _0x1918c4(_0x1172da);
    _0x443d5d.recover({
      sourceNodeId: _0x5290c1,
      segments: _0x3898eb,
      resolveModelOption: _0x17fe8f,
      createTaskStore: _0x246d47,
      buildResultPatch: _0x2d4a8a,
      getErrorMessage: _0x6a81a1 => _0x2e42ea(_0x6a81a1, panelText("toasts.generateFailed")),
      cancelledMessage: panelText("toasts.generationCancelled")
    });
    return true;
  }
  function _0x27b073(_0x16c11b, {
    markLastUsed = false
  } = {}) {
    _0x32c80e();
    _0x8ae442.invalidate();
    _0x2123cb.invalidateAll();
    _0x302933 = null;
    _0xd7f30 = new Set();
    _0x8befa3.clear();
    _0x5454de();
    _0x436e7e = _0x16c11b || null;
    _0x5290c1 = _0x436e7e?.id || "";
    _0x5bad8a = 0;
    _0x1db571.clear();
    _0x31f1e9(_0x436e7e);
    if (markLastUsed) {
      _0x5454de({
        markLastUsed: true
      });
    }
    _0x276cb6();
    _0x525219();
  }
  function _0x525219() {
    const _0x400c63 = a903_0x36767f(_0x3898eb).slice(0, AUDIO_VOICE_WARM_SEGMENT_LIMIT).flatMap(_0x537a45 => [resolveSegmentLocalAudioUrl(_0x537a45.sourceAudioUrl, _0x537a45.sourceAudioLocalPath), _0x537a45.convertedAudioReady ? resolveSegmentLocalAudioUrl(_0x537a45.convertedAudioUrl, _0x537a45.convertedAudioLocalPath) : ""]).filter(Boolean);
    _0x1db571.warmMany(_0x400c63, {
      limit: AUDIO_VOICE_WARM_SEGMENT_LIMIT * 2
    });
  }
  function _0x2552b1() {
    const _0x3d69bb = _0x47ce8e.querySelectorAll?.(".audio-voice-more-wrap.is-open, .audio-voice-history-wrap.is-open, .audio-voice-global-settings.is-open, .audio-voice-asr-settings.is-open, .audio-voice-translation-settings.is-open, .is-model-submenu-open");
    _0x3d69bb?.forEach(_0x131d20 => {
      _0x131d20.classList.remove("is-open", "is-model-submenu-open");
      _0x131d20.querySelector?.("[aria-expanded=\"true\"]")?.setAttribute?.("aria-expanded", "false");
    });
  }
  function _0x3f4a5c() {
    if (!_0x436e7e) {
      return panelText("status.noSource");
    }
    if (_0x5ae42e === "analyzing") {
      return panelText("status.analyzing");
    }
    if (_0x5ae42e === "error") {
      return panelText("status.analysisFailed");
    }
    const _0x37caa4 = _0x4e1dc6.getProjectedVisibleSegments().length;
    if (_0x37caa4 || _0x5ae42e === "ready") {
      return panelText("status.detectedCount", {
        count: _0x37caa4
      });
    }
    return panelText("status.notAnalyzed");
  }
  function _0x8e54f1(_0x2f0ce9 = {}) {
    _0x499810 = {
      stage: normalizeAnalysisProgressStage(_0x2f0ce9.stage || _0x499810?.stage),
      progress: clampProgress01(_0x2f0ce9.progress ?? _0x499810?.progress ?? 0)
    };
    _0xf664af();
  }
  function _0x48c05b() {
    return panelText("progress." + normalizeAnalysisProgressStage(_0x499810?.stage));
  }
  function _0x2ab3ed() {
    if (_0x5ae42e !== "analyzing" || !_0x499810) {
      return null;
    }
    const _0xfb1503 = createEl("section", "audio-voice-analysis-progress");
    const _0x2ddda4 = createEl("div", "audio-voice-analysis-progress-head");
    _0x2ddda4.append(createEl("div", "audio-voice-analysis-progress-title", _0x48c05b()), createEl("div", "audio-voice-analysis-progress-percent", Math.round(clampProgress01(_0x499810.progress) * 100) + "%"));
    const _0x89d07a = createEl("div", "update-banner-progress-track audio-voice-analysis-progress-track");
    const _0x3583b1 = createEl("div", "update-banner-progress-bar audio-voice-analysis-progress-bar");
    _0x3583b1.style.width = Math.round(clampProgress01(_0x499810.progress) * 100) + "%";
    _0x89d07a.appendChild(_0x3583b1);
    const _0x215fea = createEl("div", "update-banner-progress-text audio-voice-analysis-progress-text", panelText("progress." + normalizeAnalysisProgressStage(_0x499810.stage)));
    _0xfb1503.append(_0x2ddda4, _0x89d07a, _0x215fea);
    return _0xfb1503;
  }
  function _0x13af69({
    alert = null,
    className = "",
    helpLabel = "",
    settingsLabel = "",
    closeLabel = "",
    helpAction = "",
    settingsAction = "",
    closeAction = ""
  } = {}) {
    if (!alert) {
      return null;
    }
    const _0x5c150e = createEl("section", ["audio-voice-asr-config-alert", className].filter(Boolean).join(" "));
    _0x5c150e.setAttribute("role", "alert");
    const _0x35ea9d = createEl("span", "audio-voice-asr-config-alert-icon");
    _0x35ea9d.setAttribute("aria-hidden", "true");
    _0x35ea9d.innerHTML = iconSvg("settings");
    const _0x57be33 = createEl("div", "audio-voice-asr-config-alert-body");
    const _0x125cb1 = createEl("div", "audio-voice-asr-config-alert-title", alert.title);
    const _0x3e449c = createEl("div", "audio-voice-asr-config-alert-message");
    _0x3e449c.appendChild(document.createTextNode(alert.message));
    _0x3e449c.appendChild(document.createTextNode(" "));
    const _0x44dee5 = createEl("button", "audio-voice-asr-config-alert-link", helpLabel);
    _0x44dee5.type = "button";
    _0x44dee5.dataset.audioVoiceAction = helpAction;
    _0x3e449c.appendChild(_0x44dee5);
    _0x57be33.append(_0x125cb1, _0x3e449c);
    const _0x4fd4d9 = createEl("div", "audio-voice-asr-config-alert-actions");
    const _0x45b3c2 = createEl("button", "audio-voice-asr-config-alert-btn", settingsLabel);
    _0x45b3c2.type = "button";
    _0x45b3c2.dataset.audioVoiceAction = settingsAction;
    const _0x295a1f = createEl("button", "audio-voice-asr-config-alert-close", "×");
    _0x295a1f.type = "button";
    _0x295a1f.title = closeLabel;
    _0x295a1f.setAttribute("aria-label", closeLabel);
    _0x295a1f.dataset.audioVoiceAction = closeAction;
    _0x4fd4d9.append(_0x45b3c2, _0x295a1f);
    _0x5c150e.append(_0x35ea9d, _0x57be33, _0x4fd4d9);
    return _0x5c150e;
  }
  function _0x5378c2() {
    return _0x13af69({
      alert: _0x5649b1,
      helpLabel: panelText("asrApiKeyHelp.howToGet"),
      settingsLabel: panelText("asrApiKeyHelp.openSettings"),
      closeLabel: panelText("asrApiKeyHelp.close"),
      helpAction: "show-asr-api-key-guide",
      settingsAction: "open-asr-api-key-settings",
      closeAction: "close-asr-config-alert"
    });
  }
  function _0xd941c2() {
    return _0x13af69({
      alert: _0x3e8634,
      className: "audio-voice-translation-config-alert",
      helpLabel: panelText("translationApiKeyHelp.howToGet"),
      settingsLabel: panelText("translationApiKeyHelp.openSettings"),
      closeLabel: panelText("translationApiKeyHelp.close"),
      helpAction: "show-translation-api-key-guide",
      settingsAction: "open-translation-api-key-settings",
      closeAction: "close-translation-config-alert"
    });
  }
  function _0xcab048() {
    const _0x1022de = getAudioVoiceAsrProviderOptions();
    _0xe13fd9 = normalizeAudioVoiceAsrProvider(_0xe13fd9);
    const _0x5ef214 = _0x1022de.find(_0x1d7a89 => _0x1d7a89.id === _0xe13fd9) || _0x1022de[0];
    const _0x426598 = _0x5ef214?.label || "";
    const _0x324b8d = panelText("actions.subtitleRecognitionWithName", {
      provider: _0x426598
    });
    const _0x2d4d06 = createEl("div", "audio-voice-asr-settings");
    const _0x5f4a90 = createEl("button", "audio-voice-asr-settings-btn");
    _0x5f4a90.type = "button";
    _0x5f4a90.title = _0x324b8d;
    _0x5f4a90.setAttribute("aria-label", _0x324b8d);
    _0x5f4a90.append(createAudioVoiceModelIcon(_0x5ef214 || {}, "audio-voice-global-model-trigger-icon"), createEl("span", "audio-voice-btn-label audio-voice-global-model-trigger-label", _0x324b8d));
    _0x5f4a90.dataset.audioVoiceAction = "toggle-asr-settings";
    const _0x3d90b9 = createEl("div", "audio-voice-asr-settings-menu");
    _0x3d90b9.appendChild(createEl("div", "audio-voice-global-settings-title", panelText("settings.subtitleRecognition")));
    _0x1022de.forEach(_0x5d916b => {
      const _0x19e46f = createEl("button", "audio-voice-global-model-item");
      _0x19e46f.type = "button";
      _0x19e46f.dataset.audioVoiceAction = "select-asr-provider";
      _0x19e46f.dataset.providerId = _0x5d916b.id;
      if (_0x5d916b.id === _0xe13fd9) {
        _0x19e46f.classList.add("is-active");
      }
      const _0x3dd9d0 = createAudioVoiceModelIcon(_0x5d916b, "audio-voice-global-model-provider");
      const _0x51bf8c = createEl("span", "audio-voice-global-model-body");
      _0x51bf8c.append(createEl("span", "audio-voice-global-model-name", _0x5d916b.label || _0x5d916b.id), createEl("span", "audio-voice-global-model-subtitle", _0x5d916b.subtitle || _0x5d916b.id));
      _0x19e46f.append(_0x3dd9d0, _0x51bf8c);
      _0x3d90b9.appendChild(_0x19e46f);
    });
    _0x2d4d06.append(_0x5f4a90, _0x3d90b9);
    return _0x2d4d06;
  }
  function _0x5db18f() {
    const _0x5c89c1 = getAudioVoicePanelModelOptions();
    const _0x16f137 = getAudioVoicePanelModelGroups();
    if (!_0x3dfa10 || !_0x5c89c1.some(_0x107a11 => _0x107a11.id === _0x3dfa10)) {
      _0x3dfa10 = getDefaultAudioVoiceModelId();
    }
    const _0x5b15ad = _0x5c89c1.find(_0x2754d5 => _0x2754d5.id === _0x3dfa10) || _0x5c89c1[0] || null;
    const _0x5736a9 = _0x5b15ad?.label || panelText("settings.noModels");
    const _0x27ddd5 = panelText("actions.globalModelWithName", {
      model: _0x5736a9
    });
    const _0x197de1 = createEl("div", "audio-voice-global-settings");
    const _0x3c8caf = createEl("button", "audio-voice-global-settings-btn");
    _0x3c8caf.type = "button";
    _0x3c8caf.title = _0x27ddd5;
    _0x3c8caf.setAttribute("aria-label", _0x27ddd5);
    _0x3c8caf.append(createAudioVoiceModelIcon(_0x5b15ad || {}, "audio-voice-global-model-trigger-icon"), createEl("span", "audio-voice-btn-label audio-voice-global-model-trigger-label", _0x27ddd5));
    _0x3c8caf.dataset.audioVoiceAction = "toggle-global-settings";
    const _0x4c4b0d = createEl("div", "audio-voice-global-settings-menu");
    const _0xd496eb = _0xcc6db6 => {
      const _0x21a4fe = createEl("button", "audio-voice-global-model-item floating-menu-item");
      _0x21a4fe.type = "button";
      _0x21a4fe.dataset.audioVoiceAction = "select-global-model";
      _0x21a4fe.dataset.modelId = _0xcc6db6.id;
      if (_0xcc6db6.id === _0x3dfa10) {
        _0x21a4fe.classList.add("is-active");
      }
      const _0x2012ae = createAudioVoiceModelIcon(_0xcc6db6, "audio-voice-global-model-provider");
      const _0x5b855c = createEl("span", "audio-voice-global-model-body fmi-content");
      _0x5b855c.append(createEl("span", "audio-voice-global-model-name fmi-title", _0xcc6db6.label || _0xcc6db6.id), createEl("span", "audio-voice-global-model-subtitle fmi-sub", _0xcc6db6.subtitle || _0xcc6db6.id));
      _0x21a4fe.append(_0x2012ae, _0x5b855c);
      if (_0xcc6db6.vip) {
        _0x21a4fe.appendChild(createEl("span", "audio-voice-global-model-vip", "VIP"));
      }
      return _0x21a4fe;
    };
    if (_0x5c89c1.length) {
      _0x16f137.forEach(_0x5d85bb => {
        const _0x35ab93 = createEl("div", "audio-voice-global-model-group");
        const _0x48a8bb = createEl("button", "audio-voice-global-model-item audio-voice-global-model-group-trigger floating-menu-item");
        _0x48a8bb.type = "button";
        _0x48a8bb.setAttribute("aria-haspopup", "menu");
        if (_0x5d85bb.items.some(_0x5b1f3d => _0x5b1f3d.id === _0x3dfa10)) {
          _0x48a8bb.classList.add("is-active");
        }
        const _0x5ad309 = createAudioVoiceModelIcon(_0x5d85bb, "audio-voice-global-model-provider");
        const _0x141552 = createEl("span", "audio-voice-global-model-body fmi-content");
        _0x141552.append(createEl("span", "audio-voice-global-model-name fmi-title", _0x5d85bb.label || _0x5d85bb.id), createEl("span", "audio-voice-global-model-subtitle fmi-sub", _0x5d85bb.subtitle || _0x5d85bb.id));
        _0x48a8bb.append(_0x5ad309, _0x141552, createEl("span", "audio-voice-global-model-caret", ">"));
        const _0x95d27c = createEl("div", "audio-voice-global-model-submenu");
        _0x95d27c.dataset.audioVoiceGlobalModelPortal = "true";
        _0x5d85bb.items.forEach(_0x34f074 => _0x95d27c.appendChild(_0xd496eb(_0x34f074)));
        _0x35ab93.appendChild(_0x48a8bb);
        _0x47ce8e.appendChild(_0x95d27c);
        bindAudioVoiceModelSubmenuPosition(_0x35ab93, _0x95d27c, windowObject, {
          container: _0x47ce8e
        });
        _0x4c4b0d.appendChild(_0x35ab93);
      });
    } else {
      _0x4c4b0d.appendChild(createEl("div", "audio-voice-global-settings-empty", panelText("settings.noModels")));
    }
    _0x197de1.append(_0x3c8caf, _0x4c4b0d);
    return _0x197de1;
  }
  function _0x2a4540() {
    const _0x568297 = panelText("actions.loadSelected");
    const {
      sourceActive: _0x220d31
    } = _0x5e5a26.getSnapshot();
    const _0x5bfbc7 = document.createElement("template");
    _0x5bfbc7.innerHTML = createPromptAttachmentButtonHTML({
      tooltip: _0x568297,
      stroke: _0x220d31 ? "var(--blue)" : "var(--text-primary)",
      circleFill: _0x220d31 ? "var(--blue)" : "var(--text-primary)"
    }).trim();
    const _0x2b9ffb = _0x5bfbc7.content.firstElementChild;
    const _0x5ed01e = createEl("button", "audio-voice-video-pick-btn agent-connect-btn prompt-attachment-btn");
    _0x5ed01e.type = "button";
    _0x5ed01e.title = _0x568297;
    _0x5ed01e.setAttribute("aria-label", _0x568297);
    _0x5ed01e.dataset.audioVoiceAction = "load-selected";
    _0x5ed01e.classList.toggle("is-picking", _0x220d31);
    _0x5ed01e.classList.toggle("is-connecting-active", _0x220d31);
    _0x5ed01e.setAttribute("aria-pressed", _0x220d31 ? "true" : "false");
    _0x5ed01e.disabled = _0x36fa8e();
    if (_0x2b9ffb?.innerHTML) {
      _0x5ed01e.innerHTML = _0x2b9ffb.innerHTML;
    }
    return _0x5ed01e;
  }
  function _0x5e607a() {
    const _0x47a326 = createEl("section", "audio-voice-hero");
    const _0x33cd73 = createEl("div", "audio-voice-hero-cover");
    const _0x531b66 = _0x436e7e ? resolveAudioVoicePanelCoverUrl(_0x436e7e) : "";
    if (_0x531b66) {
      const _0x1489d9 = createEl("img", "audio-voice-hero-img");
      _0x1489d9.src = _0x531b66;
      _0x1489d9.alt = getSourceName(_0x436e7e);
      _0x1489d9.draggable = false;
      _0x33cd73.appendChild(_0x1489d9);
    } else {
      _0x33cd73.innerHTML = iconSvg(isAudioVoiceAudioNode(_0x436e7e) ? "audio" : "video");
    }
    const _0x560d93 = createEl("div", "audio-voice-hero-body");
    _0x560d93.append(createEl("div", "audio-voice-hero-name", getSourceName(_0x436e7e || {})), createEl("div", "audio-voice-hero-meta", _0x436e7e ? getSourceMeta(_0x436e7e) : panelText("source.emptyMeta")), createEl("div", "audio-voice-hero-status", _0x3f4a5c()));
    const _0x273241 = createEl("div", "audio-voice-hero-actions");
    const _0x166507 = createButton("audio-voice-analyze-btn", panelText("actions.startAnalyzeTooltip"), "generate", _0x5ae42e === "analyzing" ? panelText("status.analyzing") : panelText("actions.startAnalyze"));
    _0x166507.dataset.audioVoiceAction = "start-analyze";
    _0x166507.disabled = _0x5ae42e === "analyzing" || _0x36fa8e() || _0x4e1dc6.hasPending();
    _0x273241.append(_0xcab048(), _0x166507);
    if (!embedded) {
      _0x47a326.appendChild(_0x2a4540());
    }
    _0x47a326.append(_0x33cd73, _0x560d93, _0x273241);
    return _0x47a326;
  }
  function _0x653e63(_0x5772a1 = "") {
    const _0x1d070b = getAudioVoiceTranslationLanguage(_0x5772a1);
    if (!_0x1d070b) {
      return null;
    }
    return {
      ..._0x1d070b,
      label: panelText("translation.languages." + _0x1d070b.labelKey)
    };
  }
  function _0x4ee2b5() {
    return resolveAudioVoiceTranslationTargets(_0x3898eb, _0x53b6fd);
  }
  function _0x4a2b7e() {
    return _0x5ae42e === "ready" && _0x4ee2b5().targets.length > 0 && !_0x36fa8e() && !_0x59e8e9 && !_0x302933 && !_0x4e1dc6.hasPending() && !a903_0x36767f(_0x3898eb).some(_0x33374e => _0x33374e.status === "generating");
  }
  function _0x3cb297() {
    const _0x53369f = _0x36fa8e();
    const _0x56c469 = createEl("div", "audio-voice-translation-settings");
    const _0x1c5311 = createButton("audio-voice-toolbar-btn audio-voice-translation-btn", panelText("actions.translateTooltip"), _0x53369f ? "loading" : "translate", _0x53369f ? panelText("status.translating") : panelText("actions.translate"));
    _0x1c5311.dataset.audioVoiceAction = "toggle-translation";
    _0x1c5311.dataset.loading = String(_0x53369f);
    _0x1c5311.classList.toggle("is-translating", _0x53369f);
    _0x1c5311.setAttribute("aria-haspopup", "menu");
    _0x1c5311.setAttribute("aria-expanded", "false");
    _0x1c5311.setAttribute("aria-busy", String(_0x53369f));
    _0x1c5311.disabled = !_0x4a2b7e();
    const _0x34fb33 = createEl("div", "audio-voice-translation-menu");
    _0x34fb33.setAttribute("role", "menu");
    _0x34fb33.setAttribute("aria-label", panelText("translation.menuLabel"));
    AUDIO_VOICE_TRANSLATION_LANGUAGES.forEach(_0xf5c223 => {
      const _0x42d820 = _0x653e63(_0xf5c223.id);
      const _0x1bc895 = createEl("button", "audio-voice-menu-item audio-voice-translation-language", _0x42d820?.label || _0xf5c223.name);
      _0x1bc895.type = "button";
      _0x1bc895.setAttribute("role", "menuitem");
      _0x1bc895.dataset.audioVoiceAction = "translate-language";
      _0x1bc895.dataset.languageId = _0xf5c223.id;
      _0x34fb33.appendChild(_0x1bc895);
    });
    _0x56c469.append(_0x1c5311, _0x34fb33);
    return _0x56c469;
  }
  function _0x2bfb8d() {
    const _0x1daa82 = createEl("div", "audio-voice-toolbar");
    const _0x4b1086 = _0x3cf249();
    const _0x5c051a = createEl("div", "audio-voice-toolbar-primary");
    [["select-all", _0x4b1086 ? panelText("toolbar.cancelSelectAll") : panelText("toolbar.selectAll"), "grid"]].forEach(([_0x449ad8, _0x5f3c44, _0x222a8e]) => {
      const _0x447803 = createButton("audio-voice-toolbar-btn", _0x5f3c44, _0x222a8e, _0x5f3c44);
      _0x447803.dataset.audioVoiceAction = _0x449ad8;
      if (_0x449ad8 === "select-all") {
        _0x447803.classList.toggle("is-active", _0x4b1086);
        _0x447803.setAttribute("aria-pressed", _0x4b1086 ? "true" : "false");
        _0x447803.disabled = _0x4e1dc6.hasPending();
      }
      _0x5c051a.appendChild(_0x447803);
    });
    _0x5c051a.appendChild(_0x3cb297());
    _0x1daa82.appendChild(_0x5c051a);
    const _0x3070aa = _0x20d43e();
    if (_0x3070aa) {
      _0x1daa82.appendChild(_0x3070aa);
    }
    return _0x1daa82;
  }
  function _0x3cf249() {
    const _0x3aa92b = a903_0x36767f(_0x3898eb);
    return _0x3aa92b.length > 0 && _0x3aa92b.every(_0x14a3f8 => _0x53b6fd.has(_0x14a3f8.id));
  }
  function _0x534639() {
    return a903_0x36767f(_0x3898eb).filter(_0x4ea918 => _0x53b6fd.has(_0x4ea918.id));
  }
  function _0x2ba912() {
    const _0x31bb58 = _0x534639();
    const _0x3a362d = _0x31bb58.length > 0 ? _0x31bb58 : a903_0x36767f(_0x3898eb);
    return _0x3a362d.filter(_0x2f761b => _0x2f761b.status !== "generating");
  }
  function _0x21f8de(_0x54776a = []) {
    const _0x1653e8 = Array.isArray(_0x54776a) ? _0x54776a : [];
    const _0x5914ef = _0x1653e8.map(_0xc16a58 => {
      const _0x1b4b94 = _0x1bc79e(_0xc16a58) || {};
      const _0x6f60a1 = _0x1b4b94.provider || "runninghubwf";
      const _0x1ad446 = String(_0x6f60a1).trim().toLowerCase();
      const _0x46612c = String(_0x1b4b94.adapterType || "workflow").trim().toLowerCase();
      const _0x37c235 = _0x1ad446 === "runninghubwf" || _0x1ad446 === "runninghub" && _0x46612c === "workflow";
      const _0x7b726b = getProviderConfig(_0x6f60a1) || {};
      return resolveAudioVoiceProviderBatchConcurrency(_0x7b726b, {
        provider: _0x6f60a1,
        adapterType: _0x46612c
      }, _0x37c235 ? _0x1653e8.length : 1);
    });
    const _0x46f593 = _0x5914ef.filter(_0x168b2e => Number.isFinite(Number(_0x168b2e)) && Number(_0x168b2e) > 0);
    if (_0x46f593.length <= 0) {
      return 1;
    }
    return normalizeAudioVoiceBatchConcurrencyLimit(Math.min(..._0x46f593), 1);
  }
  function _0xa3ef32() {
    return _0x5ae42e === "ready" && a903_0x36767f(_0x3898eb).length > 0;
  }
  function _0x1845cb(_0x20f662 = buildAudioVoiceComposeTimelineClips(_0x3898eb)) {
    const _0x479811 = resolveAudioVoiceSourceLocalPath(_0x436e7e || {});
    if (!_0x479811 || _0x20f662.length < 1) {
      return "";
    }
    return JSON.stringify({
      sourceNodeId: _0x5290c1,
      sourceLocalPath: _0x479811,
      durationSec: resolveAudioVoiceComposeDurationSec(_0x436e7e, _0x3898eb),
      clips: _0x20f662
    });
  }
  function _0x20d43e() {
    _0x47ce8e.querySelectorAll?.("[data-audio-voice-global-model-portal=\"true\"]")?.forEach(_0x1ab866 => _0x1ab866.remove());
    if (!_0xa3ef32()) {
      return null;
    }
    const _0x569383 = createEl("div", "audio-voice-batch-actions");
    const _0x5108ae = _0x534639().length > 0;
    const _0x3e463f = _0x5108ae ? panelText("actions.selectedGenerate") : panelText("actions.batchGenerate");
    const _0x562262 = _0x5108ae ? panelText("actions.selectedGenerateTooltip") : panelText("actions.batchGenerateTooltip");
    const _0x2ec466 = Boolean(_0x59e8e9);
    const _0x5ce484 = Boolean(_0x1b2223?.isRequested?.());
    const _0x2b897a = createButton("audio-voice-batch-action-btn audio-voice-batch-generate-btn", _0x2ec466 ? panelText("actions.stopBatchGeneration") : _0x562262, _0x2ec466 ? "loading" : "generateAction", _0x2ec466 ? _0x5ce484 ? panelText("status.stopping") : panelText("actions.stopBatchGeneration") : _0x3e463f);
    _0x2b897a.dataset.audioVoiceAction = _0x2ec466 ? "cancel-batch-generation" : "batch-generate";
    _0x2b897a.dataset.loading = String(_0x2ec466);
    _0x2b897a.setAttribute("aria-busy", String(_0x2ec466));
    _0x2b897a.disabled = _0x5ce484 || !_0x2ec466 && Boolean(_0x302933) || _0x36fa8e() || _0x4e1dc6.hasPending() || !_0x2ec466 && _0x2ba912().length <= 0;
    const _0x372815 = buildAudioVoiceComposeTimelineClips(_0x3898eb);
    const _0x583f42 = Boolean(_0x302933);
    const _0x18ca7c = !_0x583f42 && _0x33483a !== "" && _0x33483a === _0x1845cb(_0x372815);
    const _0x4d95d3 = createButton("audio-voice-batch-action-btn audio-voice-compose-btn", _0x583f42 ? panelText("status.composing") : _0x18ca7c ? panelText("actions.recomposeTooltip") : panelText("actions.composeAllTooltip"), _0x583f42 ? "loading" : _0x18ca7c ? "check" : "merge", _0x583f42 ? panelText("status.composing") : _0x18ca7c ? panelText("status.composed") : panelText("actions.composeAll"));
    _0x4d95d3.dataset.audioVoiceAction = "compose-all";
    _0x4d95d3.dataset.loading = String(_0x583f42);
    _0x4d95d3.classList.toggle("is-composing", _0x583f42);
    _0x4d95d3.classList.toggle("is-composed", _0x18ca7c);
    _0x4d95d3.setAttribute("aria-busy", String(_0x583f42));
    _0x4d95d3.disabled = _0x583f42 || _0x36fa8e() || _0x4e1dc6.hasPending() || _0x372815.length < 1;
    _0x569383.append(_0x5db18f(), _0x2b897a, _0x4d95d3);
    return _0x569383;
  }
  function _0x581a0a() {
    const _0x7e8433 = getAudioVoicePanelModelOptions();
    const _0x49fd44 = _0x7e8433.find(_0x173a98 => _0x173a98.id === _0x3dfa10) || _0x7e8433[0] || null;
    return [_0xa3ef32() ? "show" : "hide", _0x5ae42e, panelText("actions.batchGenerate"), panelText("actions.selectedGenerate"), panelText("actions.composeAll"), _0x3dfa10, _0x49fd44?.label || "", _0x49fd44?.icon || "", _0x49fd44?.iconAlt || "", _0x59e8e9 ? "generating" : "idle", _0x302933 ? "composing" : "idle", _0x36fa8e() ? "translating" : "translation-idle", _0x4e1dc6.getOperations().map(_0x11a27b => _0x11a27b.segmentIds.join(",")).join("|"), _0x534639().map(_0x2db530 => _0x2db530.id).join(","), a903_0x36767f(_0x3898eb).map(_0x90a494 => _0x90a494.id + ":" + _0x90a494.status + ":" + _0x90a494.activeAudio + ":" + (_0x90a494.convertedAudioReady ? 1 : 0)).join(","), _0x5e5a26.getSnapshot().audioSegmentId].join("");
  }
  function _0x1d3c26() {
    const _0x208fe5 = getAudioVoiceAsrProviderOptions();
    const _0x352a6c = _0x208fe5.find(_0x394ce8 => _0x394ce8.id === _0xe13fd9) || _0x208fe5[0] || null;
    return [_0x5290c1, _0x436e7e ? getSourceName(_0x436e7e) : "", _0x436e7e ? getSourceMeta(_0x436e7e) : panelText("source.emptyMeta"), _0x436e7e ? resolveAudioVoicePanelCoverUrl(_0x436e7e) : "", _0x5ae42e, _0x3f4a5c(), _0xe13fd9, _0x352a6c?.label || "", _0x352a6c?.icon || "", _0x352a6c?.iconAlt || "", _0x5e5a26.getSnapshot().sourceActive ? "1" : "0", _0x36fa8e() ? "translating" : "translation-idle"].join("");
  }
  function _0x406927() {
    const _0x5c3db5 = _0x1d3c26();
    if (_0x6c5304 && _0x104b18 === _0x5c3db5) {
      return _0x6c5304;
    }
    _0x104b18 = _0x5c3db5;
    _0x6c5304 = _0x5e607a();
    return _0x6c5304;
  }
  function _0x797cf8() {
    return [panelText("toolbar.selectAll"), panelText("toolbar.cancelSelectAll"), panelText("actions.translate"), panelText("actions.translateTooltip"), panelText("status.translating"), AUDIO_VOICE_TRANSLATION_LANGUAGES.map(_0x5ebb6e => panelText("translation.languages." + _0x5ebb6e.labelKey)).join(","), _0x3cf249() ? "all" : "partial", _0x4e1dc6.getProjectedVisibleSegments().length, _0x36fa8e() ? "translating" : "translation-idle", _0x581a0a()].join("");
  }
  function _0x5763a4() {
    const _0x2a53af = _0x797cf8();
    if (_0x8337c6 && _0xa095d4 === _0x2a53af) {
      return _0x8337c6;
    }
    _0xa095d4 = _0x2a53af;
    _0x8337c6 = _0x2bfb8d();
    return _0x8337c6;
  }
  function _0x3add1d(_0x193b6f) {
    const _0x537fb1 = _0x193b6f.filter(Boolean);
    _0x537fb1.forEach((_0x9660e4, _0x397cfb) => {
      if (_0x4aaa91.children[_0x397cfb] === _0x9660e4) {
        return;
      }
      _0x4aaa91.insertBefore(_0x9660e4, _0x4aaa91.children[_0x397cfb] || null);
    });
    while (_0x4aaa91.children.length > _0x537fb1.length) {
      _0x4aaa91.removeChild(_0x4aaa91.lastElementChild);
    }
  }
  function _0xaf30e(_0x4dbd07 = {}, _0xef5dc4 = 1) {
    const _0x43b726 = resolveAudioVoiceSegmentAudioInput(_0x4dbd07, _0xef5dc4);
    const _0x2c372f = String(_0x43b726.name || _0x43b726.nodeId || "").trim();
    if (!_0x2c372f) {
      return "+";
    }
    const _0x1d8964 = _0x2c372f.replace(/\.[^.\\/:]+$/, "").trim();
    return Array.from(_0x1d8964 || _0x2c372f).slice(0, 2).join("").toUpperCase();
  }
  function _0x1a42d7(_0x420157, _0x1f5773) {
    const _0x415fac = _0x3898eb[_0x47b79d(_0x420157)];
    const _0xf7ddad = String(_0x1f5773 || "").trim();
    if (!_0x415fac || !_0xf7ddad) {
      return null;
    }
    return normalizeAudioVoiceHistory(_0x415fac.convertedAudioHistory).find(_0x2cb8e0 => _0x2cb8e0.id === _0xf7ddad) || null;
  }
  function _0x58288(_0x3d9caf) {
    const _0x15533a = new Date(Number(_0x3d9caf || 0) || Date.now());
    const _0x13ed41 = _0x3f0f86 => String(_0x3f0f86).padStart(2, "0");
    return _0x13ed41(_0x15533a.getMonth() + 1) + "/" + _0x13ed41(_0x15533a.getDate()) + " " + _0x13ed41(_0x15533a.getHours()) + ":" + _0x13ed41(_0x15533a.getMinutes());
  }
  function _0xe0aea6(_0x5e96f1 = {}) {
    if (typeof _0x5e96f1._audioVoiceConvertedRowVisible === "boolean") {
      return _0x5e96f1._audioVoiceConvertedRowVisible;
    }
    return shouldShowConvertedRow(_0x5e96f1) || _0xa73170.has(String(_0x5e96f1.id || ""));
  }
  function _0x3ad017(_0x329ff9, _0xecc864, _0x58b2ea, _0x290309 = "converted") {
    const _0x1d80b7 = createEl("textarea", "audio-voice-line-text audio-voice-line-input");
    _0x1d80b7.rows = 1;
    _0x1d80b7.value = String(_0xecc864 || "");
    _0x1d80b7.placeholder = String(_0x58b2ea || "");
    _0x1d80b7.autocomplete = "off";
    _0x1d80b7.spellcheck = true;
    _0x1d80b7.dataset.audioVoiceTextInput = "true";
    _0x1d80b7.dataset.audioVoiceTextKind = _0x290309 === "source" ? "source" : "converted";
    _0x1d80b7.dataset.segmentId = _0x329ff9.id;
    _0x1d80b7.setAttribute("aria-multiline", "true");
    _0x1d80b7.setAttribute("aria-label", _0x58b2ea || panelText("actions.editSource"));
    return _0x1d80b7;
  }
  function _0x513ef1(_0x39ff07) {
    const _0x585785 = normalizeAudioVoiceHistory(_0x39ff07.convertedAudioHistory);
    const _0x497753 = createEl("div", "audio-voice-history-wrap");
    const _0x42385a = createButton("audio-voice-icon-btn audio-voice-history-trigger", panelText("actions.history"), "history");
    _0x42385a.dataset.audioVoiceAction = "toggle-history";
    _0x42385a.dataset.segmentId = _0x39ff07.id;
    _0x42385a.disabled = _0x585785.length <= 0;
    if (_0x42385a.disabled) {
      _0x42385a.setAttribute("aria-disabled", "true");
    }
    const _0x56f435 = createEl("div", "audio-voice-history-menu");
    if (_0x585785.length <= 0) {
      _0x56f435.appendChild(createEl("div", "audio-voice-history-empty", panelText("history.empty")));
    } else {
      _0x585785.forEach((_0x3fb41f, _0x4a92b2) => {
        const _0x11b05b = createEl("div", "audio-voice-history-item");
        const _0x373309 = createButton("audio-voice-history-play", panelText("history.play"), "play");
        _0x373309.dataset.audioVoiceAction = "play-history";
        _0x373309.dataset.segmentId = _0x39ff07.id;
        _0x373309.dataset.historyId = _0x3fb41f.id;
        const _0x4d92db = createEl("button", "audio-voice-history-main");
        _0x4d92db.type = "button";
        _0x4d92db.dataset.audioVoiceAction = "use-history";
        _0x4d92db.dataset.segmentId = _0x39ff07.id;
        _0x4d92db.dataset.historyId = _0x3fb41f.id;
        _0x4d92db.append(createEl("span", "audio-voice-history-title", _0x3fb41f.modelLabel || panelText("history.itemTitle", {
          index: _0x4a92b2 + 1
        })), createEl("span", "audio-voice-history-meta", _0x58288(_0x3fb41f.createdAt)));
        _0x11b05b.append(_0x373309, _0x4d92db);
        _0x56f435.appendChild(_0x11b05b);
      });
    }
    _0x497753.append(_0x42385a, _0x56f435);
    return _0x497753;
  }
  function _0x3d3f4e(_0xc79b33, _0x15377d) {
    const _0x106fa3 = _0x15377d === "converted";
    const _0x49d8ec = createEl("div", "audio-voice-audio-line " + (_0x106fa3 ? "audio-voice-audio-line-converted" : "audio-voice-audio-line-source"));
    if (!_0x106fa3 && _0xe0aea6(_0xc79b33)) {
      _0x49d8ec.classList.add("audio-voice-audio-line-source-has-draft");
    }
    const _0x1f3f4a = _0x106fa3 && !_0xc79b33.convertedAudioReady ? panelText("actions.generateAudio") : panelText("actions.playAudio");
    const _0x3d5844 = createButton("audio-voice-line-play", _0x1f3f4a, "speaker");
    _0x3d5844.dataset.audioVoiceAction = _0x106fa3 ? "play-converted" : "play-source";
    _0x3d5844.dataset.segmentId = _0xc79b33.id;
    const _0x1fe1c8 = _0xe0aea6(_0xc79b33);
    let _0x5899b2 = null;
    if (_0x106fa3 && !_0xc79b33.error) {
      _0x5899b2 = _0x3ad017(_0xc79b33, _0xc79b33.targetText || _0xc79b33.sourceText, panelText("sentences.convertedPlaceholder"), "converted");
    } else if (!_0x106fa3 && !_0x1fe1c8) {
      _0x5899b2 = _0x3ad017(_0xc79b33, _0xc79b33.sourceText, panelText("sentences.sourcePlaceholder"), "source");
    } else {
      const _0x25bde9 = _0x106fa3 ? _0xc79b33.targetText || _0xc79b33.sourceText || panelText("sentences.convertedPlaceholder") : _0xc79b33.sourceText || panelText("sentences.sourcePlaceholder");
      _0x5899b2 = createEl("span", "audio-voice-line-text", _0x25bde9);
    }
    const _0x1ccaa = createEl("div", "audio-voice-line-actions");
    if (_0x106fa3) {
      const _0x286849 = createButton("audio-voice-icon-btn audio-voice-generate-btn", panelText("actions.generate"), "generate");
      _0x286849.dataset.audioVoiceAction = "generate";
      _0x286849.dataset.segmentId = _0xc79b33.id;
      _0x763a5a(_0x286849, _0xc79b33);
      _0x1ccaa.append(_0x513ef1(_0xc79b33), _0x286849);
    } else {
      _0x1ccaa.append(createButton("audio-voice-icon-btn", panelText("actions.editSourceTooltip"), "edit"), createButton("audio-voice-icon-btn", panelText("actions.alignSourceText"), "align"));
      _0x1ccaa.children[0].dataset.audioVoiceAction = "edit-source";
      _0x1ccaa.children[1].dataset.audioVoiceAction = "align-source";
    }
    [..._0x1ccaa.children].forEach(_0x5b55a7 => {
      if (_0x5b55a7.matches?.("button")) {
        _0x5b55a7.dataset.segmentId = _0xc79b33.id;
      }
    });
    _0x49d8ec.append(_0x3d5844, _0x5899b2, _0x1ccaa);
    return _0x49d8ec;
  }
  function _0x498918(_0x48afca = {}) {
    const _0xec83b5 = String(_0x48afca.error || "").trim();
    if (!_0xec83b5) {
      return null;
    }
    const _0x273d64 = createEl("div", "audio-voice-segment-error", _0xec83b5);
    _0x273d64.setAttribute("role", "status");
    _0x273d64.setAttribute("aria-live", "polite");
    return _0x273d64;
  }
  function _0x58d2b7(_0x4f4cca) {
    const _0x440e7f = createEl("div", "audio-voice-more-wrap");
    if (_0x199b00(_0x4f4cca)) {
      const _0x21a672 = createEl("button", "audio-voice-imitate-tone-btn " + (_0x4f4cca.imitateToneEnabled ? "is-active" : ""), panelText("actions.imitateTone"));
      _0x21a672.type = "button";
      _0x21a672.title = panelText("actions.imitateToneTooltip");
      _0x21a672.setAttribute("aria-label", _0x21a672.title);
      _0x21a672.dataset.audioVoiceAction = "toggle-imitate-tone";
      _0x21a672.dataset.segmentId = _0x4f4cca.id;
      _0x21a672.setAttribute("aria-pressed", _0x4f4cca.imitateToneEnabled ? "true" : "false");
      _0x440e7f.appendChild(_0x21a672);
    }
    const _0x323373 = _0x4f4cca.voiceModelSelectionMode === "global" ? "" : String(_0x4f4cca.voiceModelId || "").trim();
    const _0x1d5f95 = _0x323373 ? getAudioVoicePanelModelOptions().find(_0x1d53b7 => _0x1d53b7.id === _0x323373) : null;
    if (_0x1d5f95) {
      const _0x217380 = createEl("span", "audio-voice-segment-model-badge", _0x1d5f95.label || _0x1d5f95.id);
      _0x217380.title = panelText("actions.segmentModelWithName", {
        model: _0x1d5f95.label || _0x1d5f95.id
      });
      _0x440e7f.appendChild(_0x217380);
    }
    const _0x37e074 = createButton("audio-voice-more-trigger", panelText("actions.more"), "more");
    _0x37e074.dataset.audioVoiceAction = "toggle-menu";
    _0x37e074.dataset.segmentId = _0x4f4cca.id;
    const _0x539832 = createEl("div", "audio-voice-more-menu");
    const _0xcfc707 = createEl("div", "audio-voice-menu-submenu-wrap");
    const _0x1060ba = createEl("button", "audio-voice-menu-item audio-voice-submenu-trigger", panelText("actions.segmentModel"));
    _0x1060ba.type = "button";
    _0x1060ba.setAttribute("aria-haspopup", "menu");
    const _0x419137 = createEl("div", "audio-voice-model-submenu");
    const _0x135ffb = createEl("button", "audio-voice-menu-item audio-voice-model-menu-item " + (_0x323373 ? "" : "is-active"), panelText("actions.useGlobalModel"));
    _0x135ffb.type = "button";
    _0x135ffb.dataset.audioVoiceAction = "select-segment-model";
    _0x135ffb.dataset.segmentId = _0x4f4cca.id;
    _0x135ffb.dataset.modelId = "";
    _0x419137.appendChild(_0x135ffb);
    getAudioVoicePanelModelOptions().forEach(_0x18f2a9 => {
      const _0x5c19bc = createEl("button", "audio-voice-menu-item audio-voice-model-menu-item " + (_0x18f2a9.id === _0x323373 ? "is-active" : ""), _0x18f2a9.label || _0x18f2a9.id);
      _0x5c19bc.type = "button";
      _0x5c19bc.dataset.audioVoiceAction = "select-segment-model";
      _0x5c19bc.dataset.segmentId = _0x4f4cca.id;
      _0x5c19bc.dataset.modelId = _0x18f2a9.id;
      _0x419137.appendChild(_0x5c19bc);
    });
    _0xcfc707.append(_0x1060ba, _0x419137);
    bindAudioVoiceModelSubmenuPosition(_0xcfc707, _0x419137, windowObject);
    _0x539832.appendChild(_0xcfc707);
    getAudioVoiceSegmentMenuEntries(_0x4f4cca).forEach(({
      action: _0x41ac6e,
      label: _0x2ffc40,
      disabled: _0x2ef556,
      checked: _0x40028c
    }) => {
      const _0x1e93ec = createEl("button", "audio-voice-menu-item", _0x2ffc40);
      _0x1e93ec.type = "button";
      _0x1e93ec.dataset.audioVoiceAction = _0x41ac6e;
      _0x1e93ec.dataset.segmentId = _0x4f4cca.id;
      _0x1e93ec.disabled = _0x2ef556 === true;
      if (_0x2ef556) {
        _0x1e93ec.setAttribute("aria-disabled", "true");
      }
      if (_0x40028c) {
        _0x1e93ec.classList.add("is-active");
        _0x1e93ec.setAttribute("aria-pressed", "true");
      }
      _0x539832.appendChild(_0x1e93ec);
    });
    _0x440e7f.append(_0x37e074, _0x539832);
    return _0x440e7f;
  }
  function _0x3bc220(_0x1f7c49) {
    const _0x342be5 = resolveAudioVoiceSegmentAudioInput(_0x1f7c49, 2);
    const _0x5f06d7 = createEl("div", "audio-voice-audio-param-wrap");
    const _0x4a846b = createEl("button", "audio-voice-audio-param");
    _0x4a846b.type = "button";
    const _0x562acf = !!_0x342be5.audioUrl;
    _0x5f06d7.classList.toggle("has-audio-ref", _0x562acf);
    const _0x13b279 = _0x5e5a26.getSnapshot().audioTargetSegmentIds.includes(_0x1f7c49.id);
    _0x4a846b.classList.toggle("has-audio-ref", _0x562acf);
    _0x4a846b.classList.toggle("is-picking", _0x13b279);
    _0x4a846b.title = _0x562acf ? panelText("actions.changeVoiceCloneInputParam") : panelText("actions.voiceCloneInputParam");
    _0x4a846b.setAttribute("aria-label", _0x4a846b.title);
    _0x4a846b.dataset.audioVoiceAction = "audio-param";
    _0x4a846b.dataset.segmentId = _0x1f7c49.id;
    const _0x463462 = createEl("span", _0x562acf ? "audio-voice-audio-param-avatar" : "audio-voice-audio-param-plus", _0x342be5.imageUrl ? "" : _0xaf30e(_0x1f7c49, 2));
    if (_0x342be5.imageUrl) {
      const _0x2fec77 = createEl("img", "audio-voice-audio-param-image");
      _0x2fec77.src = _0x342be5.imageUrl;
      _0x2fec77.alt = _0x342be5.name || panelText("actions.voiceCloneInputParam");
      _0x2fec77.draggable = false;
      _0x463462.appendChild(_0x2fec77);
    }
    _0x4a846b.appendChild(_0x463462);
    _0x5f06d7.appendChild(_0x4a846b);
    if (_0x562acf) {
      const _0x269e3d = createButton("audio-voice-audio-param-clear", panelText("actions.clearVoiceCloneInputParam"), "close");
      _0x269e3d.dataset.audioVoiceAction = "clear-audio-param";
      _0x269e3d.dataset.segmentId = _0x1f7c49.id;
      _0x5f06d7.appendChild(_0x269e3d);
    }
    return _0x5f06d7;
  }
  function _0x54b4e3(_0xe741eb) {
    const _0x462946 = createEl("div", "audio-voice-audio-param-stack");
    _0x462946.appendChild(_0x3bc220(_0xe741eb));
    return _0x462946;
  }
  function _0x28e423(_0x4c2cb3 = {}) {
    return _0xd7f30.has(String(_0x4c2cb3?.id || _0x4c2cb3 || "").trim());
  }
  function _0x58f156(_0x4bdabb = {}) {
    const _0x41b9f2 = String(_0x4bdabb?.id || _0x4bdabb || "").trim();
    return Boolean(_0x41b9f2 && _0x389809?.segmentIds?.has?.(_0x41b9f2));
  }
  function _0x4434d8(_0x267285 = panelText("status.generating")) {
    const _0x4684bf = createEl("div", "audio-voice-segment-loading storyboard-script-loading-overlay");
    _0x4684bf.setAttribute("role", "status");
    _0x4684bf.setAttribute("aria-live", "polite");
    _0x4684bf.append(createEl("span", "storyboard-script-loading-spinner"), createEl("span", "storyboard-script-loading-label", _0x267285), (() => {
      const _0x137c2c = createEl("span", "storyboard-script-loading-bar");
      _0x137c2c.appendChild(createEl("span", "storyboard-script-loading-bar-fill"));
      return _0x137c2c;
    })());
    return _0x4684bf;
  }
  function _0x1ef0c0(_0x129ccc) {
    _0x129ccc?.querySelectorAll?.("button, input, textarea, select, [role=\"button\"]")?.forEach(_0x57582a => {
      if ("disabled" in _0x57582a) {
        _0x57582a.disabled = true;
      }
      _0x57582a.setAttribute?.("aria-disabled", "true");
      if (_0x57582a.hasAttribute?.("tabindex")) {
        _0x57582a.tabIndex = -1;
      }
    });
  }
  function _0x353cd3(_0x30358f, _0x112949, _0x538b5d) {
    const _0x23fa6a = createEl("article", "audio-voice-segment-card");
    _0x23fa6a.dataset.segmentId = _0x30358f.id;
    _0x23fa6a.classList.add("is-" + (_0x30358f.status || "detected"));
    const _0x335bcf = _0x28e423(_0x30358f);
    const _0x1101ed = _0x4e1dc6.isMerging(_0x30358f);
    const _0x5bfdee = _0x58f156(_0x30358f);
    _0x23fa6a.classList.toggle("is-composing", _0x335bcf || _0x1101ed);
    _0x23fa6a.classList.toggle("is-translating", _0x5bfdee);
    _0x23fa6a.setAttribute("aria-busy", String(_0x30358f.status === "generating" || _0x335bcf || _0x1101ed || _0x5bfdee));
    const _0x3e7ca2 = _0x53b6fd.has(_0x30358f.id);
    if (_0x3e7ca2) {
      _0x23fa6a.classList.add("is-selected");
    }
    _0x23fa6a.setAttribute("aria-selected", _0x3e7ca2 ? "true" : "false");
    if (_0x3f89df?.ids?.has?.(_0x30358f.id)) {
      _0x23fa6a.classList.add("is-" + _0x3f89df.type + "-animation");
    }
    const _0x3eb0da = createEl("div", "audio-voice-segment-time-row");
    _0x3eb0da.dataset.audioVoiceAction = "toggle-select";
    _0x3eb0da.dataset.segmentId = _0x30358f.id;
    _0x3eb0da.setAttribute("role", "button");
    _0x3eb0da.tabIndex = 0;
    _0x3eb0da.append(createEl("div", "audio-voice-segment-time", formatAudioVoiceTimeRange(_0x30358f.startMs, _0x30358f.endMs)), _0x58d2b7(_0x30358f));
    const _0x51bf11 = createEl("div", "audio-voice-segment-body");
    const _0x5b93f9 = createEl("div", "audio-voice-segment-lines");
    _0x5b93f9.appendChild(_0x3d3f4e(_0x30358f, "source"));
    if (shouldShowConvertedRow(_0x30358f)) {
      _0x5b93f9.appendChild(_0x3d3f4e(_0x30358f, "converted"));
    }
    _0x51bf11.append(_0x54b4e3(_0x30358f), _0x5b93f9);
    _0x23fa6a.append(_0x3eb0da, _0x51bf11);
    const _0x3d3f66 = _0x498918(_0x30358f);
    if (_0x3d3f66) {
      _0x23fa6a.appendChild(_0x3d3f66);
    }
    if (_0x30358f.status === "generating" || _0x335bcf || _0x1101ed || _0x5bfdee) {
      _0x23fa6a.appendChild(_0x4434d8(_0x1101ed ? panelText("status.merging") : _0x5bfdee ? panelText("status.translating") : _0x335bcf ? panelText("status.composing") : panelText("status.generating")));
    }
    if (_0x1101ed) {
      _0x1ef0c0(_0x23fa6a);
    }
    return _0x23fa6a;
  }
  function _0x312e71(_0x137e79, _0x47fb20, _0xa18802, _0x4831fc) {
    const _0x105261 = createButton("audio-voice-gap-pill", _0x47fb20, _0xa18802, _0x47fb20);
    _0x105261.dataset.audioVoiceAction = _0x137e79;
    _0x105261.dataset.segmentId = _0x4831fc;
    return _0x105261;
  }
  function _0xddec6e(_0x1a1da3, _0x1caff1, _0x579854) {
    const _0x50ef1e = createEl("div", "audio-voice-segment-gap-actions");
    _0x50ef1e.dataset.segmentId = _0x1a1da3.id;
    if (_0x1caff1 >= _0x579854.length - 1) {
      _0x50ef1e.classList.add("is-last");
    }
    if (_0x1caff1 < _0x579854.length - 1) {
      const _0x193468 = _0x312e71("merge", panelText("actions.merge"), "merge", _0x1a1da3.id);
      _0x193468.disabled = _0x4e1dc6.isReserved(_0x1a1da3) || _0x4e1dc6.isReserved(_0x579854[_0x1caff1 + 1]);
      _0x50ef1e.appendChild(_0x193468);
    }
    const _0x4e5899 = _0x312e71("insert", panelText("actions.insertSegment"), "insert", _0x1a1da3.id);
    _0x4e5899.disabled = _0x4e1dc6.isReserved(_0x1a1da3);
    _0x50ef1e.appendChild(_0x4e5899);
    return _0x50ef1e;
  }
  function _0x35919b() {
    const _0x2718c3 = createEl("section", "audio-voice-workspace");
    const _0x4e8246 = createEl("div", "audio-voice-workspace-title-row");
    _0x4e8246.append(createEl("div", "audio-voice-workspace-title", panelText("sections.sentences")), createEl("div", "audio-voice-workspace-count", _0x3f4a5c()));
    const _0x1112ed = createEl("div", "audio-voice-segment-list");
    const _0x53499a = _0x4e1dc6.getProjectedVisibleSegments();
    if (_0x53499a.length) {
      _0x53499a.forEach((_0x2acdb1, _0x568930) => {
        _0x1112ed.appendChild(_0x353cd3(_0x2acdb1, _0x568930, _0x53499a.length));
        _0x1112ed.appendChild(_0xddec6e(_0x2acdb1, _0x568930, _0x53499a));
      });
    } else {
      _0x1112ed.appendChild(createEl("div", "audio-voice-segment-empty", _0x436e7e ? panelText("sentences.analysisHint") : panelText("source.emptyMeta")));
    }
    _0x2718c3.append(_0x4e8246, _0x1112ed);
    return _0x2718c3;
  }
  function _0x276cb6() {
    const _0x4615ac = [_0x406927()];
    const _0x919a32 = _0x5378c2();
    if (_0x919a32) {
      _0x4615ac.push(_0x919a32);
    }
    const _0x43160e = _0xd941c2();
    if (_0x43160e) {
      _0x4615ac.push(_0x43160e);
    }
    const _0x3647be = _0x2ab3ed();
    if (_0x3647be) {
      _0x4615ac.push(_0x3647be);
    }
    _0x4615ac.push(_0x5763a4(), _0x35919b());
    _0x3add1d(_0x4615ac);
    _0x2a0c14();
    _0x3f89df = null;
  }
  function _0x401c5e() {
    let _0x3bea42 = 0;
    _0x47ce8e.querySelectorAll(".audio-voice-segment-card[data-segment-id]").forEach(_0x45c8fa => {
      const _0x9cfeef = String(_0x45c8fa.dataset.segmentId || "").trim();
      if (!_0x9cfeef) {
        return;
      }
      _0x3bea42 += 1;
      const _0x277588 = _0x53b6fd.has(_0x9cfeef);
      _0x45c8fa.classList.toggle("is-selected", _0x277588);
      _0x45c8fa.setAttribute("aria-selected", _0x277588 ? "true" : "false");
    });
    return _0x3bea42 > 0;
  }
  function _0x13143f(_0xbe93a8, _0xee1e8d) {
    if (!_0xbe93a8 || !_0xee1e8d || _0xbe93a8 === _0xee1e8d) {
      return true;
    }
    if (!_0xbe93a8.isConnected) {
      return false;
    }
    _0xbe93a8.replaceWith(_0xee1e8d);
    return true;
  }
  function _0x5ca535() {
    const _0x58282a = _0x8337c6;
    const _0x15194a = _0x5763a4();
    return _0x13143f(_0x58282a, _0x15194a);
  }
  function _0xf664af() {
    const _0x1ffb88 = _0x47ce8e.querySelector?.(".audio-voice-analysis-progress");
    const _0x210005 = _0x2ab3ed();
    if (_0x1ffb88 && _0x210005) {
      _0x1ffb88.replaceWith(_0x210005);
      return true;
    }
    if (!_0x1ffb88 && !_0x210005) {
      return true;
    }
    _0x276cb6();
    return false;
  }
  function _0x545178() {
    const _0x1ee16c = _0x401c5e();
    const _0x1b6c2e = _0x5ca535();
    if (!_0x1ee16c || !_0x1b6c2e) {
      _0x276cb6();
    }
  }
  function _0x7d74ae() {
    const _0x3392b6 = _0x6c5304;
    _0x104b18 = "";
    const _0x139ccf = _0x406927();
    if (!_0x13143f(_0x3392b6, _0x139ccf)) {
      _0x276cb6();
    }
  }
  function _0x20cef8() {
    let _0x55ced0 = true;
    a903_0x36767f(_0x3898eb).forEach(_0x4bb8a0 => {
      if (!_0x1db77f(_0x4bb8a0.id)) {
        _0x55ced0 = false;
      }
    });
    if (!_0x55ced0) {
      _0x276cb6();
    }
    return _0x55ced0;
  }
  function _0x4d4408(_0xfba340) {
    _0x47ce8e.classList.toggle("is-open", _0xfba340);
    _0x47ce8e.setAttribute("aria-hidden", _0xfba340 ? "false" : "true");
    if (!embedded) {
      document?.body?.classList?.toggle("audio-voice-panel-open", _0xfba340);
    }
    _0x54f10b.classList.toggle("is-audio-voice-open", _0xfba340);
    if (!embedded) {
      dispatchWebPreviewPanelSync(_0xfba340 ? "audio-voice-panel-open" : "audio-voice-panel-close");
    }
  }
  function _0x2e2b9f(_0x54104a = null) {
    return true;
  }
  function _0x19d9df(_0x3b04a8 = {}) {
    if (_0x3b04a8.skipSubscriptionGate !== true) {
      const _0x2efa26 = _0x2e2b9f(() => {
        _0x19d9df({
          ..._0x3b04a8,
          skipSubscriptionGate: true
        });
      });
      if (!_0x2efa26) {
        return false;
      }
    }
    const _0x3bc6e6 = getStateSnapshot(_0xd25027);
    _0x8befa3.clear();
    _0x5e5a26.stopAll();
    _0x27b073(resolveAudioVoicePanelOpenSourceNode(_0x3bc6e6, _0x3b04a8, _0x5290c1), {
      markLastUsed: true
    });
    _0x4d4408(true);
    return true;
  }
  function _0x544432() {
    _0x5454de({
      markLastUsed: true
    });
    _0x32c80e();
    _0x8ae442.invalidate();
    _0x2123cb.invalidateAll();
    _0x302933 = null;
    _0xd7f30 = new Set();
    _0x8befa3.clear();
    _0x5e5a26.stopAll();
    _0x1db571.clear();
    closeVolcengineSpeechApiKeyGuide();
    closeProviderApiKeyGuide();
    _0x128a2b.close();
    _0x4d4408(false);
    _0x2552b1();
  }
  function _0x1a5611() {
    if (_0x47ce8e.classList.contains("is-open")) {
      _0x544432();
      return;
    }
    _0x19d9df();
  }
  function _0x357772(_0x58ba39, {
    persist = false
  } = {}) {
    const _0x197ed8 = clampAudioVoicePanelWidth(_0x58ba39);
    document?.body?.style?.setProperty?.("--audio-voice-panel-width", _0x197ed8 + "px");
    if (persist) {
      writeStoredPanelWidth(_0x197ed8, windowObject);
    }
    return _0x197ed8;
  }
  function _0x59fb67(_0x30e4d8) {
    _0x30e4d8.preventDefault?.();
    _0x30e4d8.stopPropagation?.();
    const _0x35faa5 = Number(_0x30e4d8.clientX);
    const _0x20163e = _0x47ce8e.getBoundingClientRect?.().width || _0x47ce8e.offsetWidth || 0;
    if (!Number.isFinite(_0x35faa5) || !_0x20163e) {
      return;
    }
    document?.body?.classList?.add?.("audio-voice-panel-resizing");
    const _0xadc902 = _0x223483 => {
      const _0x321793 = Number(_0x223483.clientX);
      if (!Number.isFinite(_0x321793)) {
        return;
      }
      _0x357772(_0x20163e + (_0x35faa5 - _0x321793));
    };
    const _0x339db6 = _0x2280af => {
      document?.removeEventListener?.("pointermove", _0xadc902);
      document?.removeEventListener?.("pointerup", _0x339db6);
      document?.body?.classList?.remove?.("audio-voice-panel-resizing");
      const _0x1ef07e = Number(_0x2280af.clientX);
      if (Number.isFinite(_0x1ef07e)) {
        _0x357772(_0x20163e + (_0x35faa5 - _0x1ef07e), {
          persist: true
        });
      }
    };
    document?.addEventListener?.("pointermove", _0xadc902);
    document?.addEventListener?.("pointerup", _0x339db6);
  }
  function _0x47b79d(_0x56abe6) {
    return _0x3898eb.findIndex(_0x30ad26 => _0x30ad26.id === _0x56abe6);
  }
  function _0x1a202a(_0x23cba3, _0x294d0f) {
    _0x32ba70(_0x3898eb.map(_0x2adee9 => _0x2adee9.id === _0x23cba3 ? {
      ..._0x2adee9,
      ..._0x294d0f
    } : _0x2adee9));
  }
  function _0x2eed02(_0x2437ec, _0x3d3863) {
    const _0x31333f = _0x47b79d(_0x2437ec);
    if (_0x31333f < 0) {
      return null;
    }
    const _0xba7d4b = {
      ..._0x3898eb[_0x31333f],
      ..._0x3d3863
    };
    _0x3898eb = _0x3898eb.map((_0x5e204f, _0x203061) => _0x203061 === _0x31333f ? _0xba7d4b : _0x5e204f);
    _0x5454de();
    return _0xba7d4b;
  }
  function _0x4ff4ab(_0x410e86) {
    const _0x50bc98 = String(_0x410e86 || "").trim();
    if (!_0x50bc98) {
      return null;
    }
    return [..._0x47ce8e.querySelectorAll(".audio-voice-segment-card[data-segment-id]")].find(_0x41028a => _0x41028a.dataset.segmentId === _0x50bc98) || null;
  }
  function _0x1db77f(_0x11508b) {
    const _0x398a4e = _0x3898eb[_0x47b79d(_0x11508b)];
    const _0x57c047 = _0x4ff4ab(_0x11508b);
    const _0x1d6bd8 = _0x57c047?.querySelector?.(".audio-voice-more-wrap");
    if (!_0x398a4e || !_0x1d6bd8) {
      return false;
    }
    _0x1d6bd8.replaceWith(_0x58d2b7(_0x398a4e));
    return true;
  }
  function _0x357e26(_0x11908a) {
    const _0x57c4e4 = _0x3898eb[_0x47b79d(_0x11908a)];
    const _0x181ca2 = _0x4ff4ab(_0x11908a);
    const _0x5bf418 = _0x181ca2?.querySelector?.(".audio-voice-audio-param-wrap");
    if (!_0x57c4e4 || !_0x5bf418) {
      return false;
    }
    _0x5bf418.replaceWith(_0x3bc220(_0x57c4e4));
    return true;
  }
  function _0x26b9e7(_0x1c1c66 = []) {
    const _0x27f3a4 = [...new Set((Array.isArray(_0x1c1c66) ? _0x1c1c66 : [_0x1c1c66]).map(_0x510a26 => String(_0x510a26 || "").trim()).filter(Boolean))];
    let _0xebed86 = _0x5ca535();
    _0x27f3a4.forEach(_0x546ca1 => {
      if (!_0x357e26(_0x546ca1)) {
        _0xebed86 = false;
      }
      if (!_0x1db77f(_0x546ca1)) {
        _0xebed86 = false;
      }
    });
    if (!_0xebed86) {
      _0x276cb6();
    }
    return _0xebed86;
  }
  function _0x2670f0(_0x4b5dcd, _0x11fe1e = {}) {
    const _0x457635 = _0x4b5dcd?.querySelector?.("[data-audio-voice-text-input]");
    if (!_0x457635) {
      return false;
    }
    const _0x26c3c2 = String(_0x11fe1e.targetText || _0x11fe1e.sourceText || "");
    if (_0x457635 !== document?.activeElement && _0x457635.value !== _0x26c3c2) {
      _0x457635.value = _0x26c3c2;
    }
    _0x457635.dataset.segmentId = _0x11fe1e.id;
    return true;
  }
  function _0x12a5aa(_0x2f9e56, _0x38b588 = {}, _0x286a77 = {}) {
    const _0x1ae587 = _0x2f9e56?.querySelector?.(".audio-voice-segment-lines");
    if (!_0x1ae587) {
      return false;
    }
    let _0x13e1a1 = _0x1ae587.querySelector(".audio-voice-audio-line-source");
    const _0x3d8f19 = _0xe0aea6(_0x38b588);
    const _0x219561 = _0xe0aea6(_0x286a77);
    if (_0x13e1a1 && _0x3d8f19 !== _0x219561) {
      _0x13e1a1.replaceWith(_0x3d3f4e(_0x286a77, "source"));
      _0x13e1a1 = _0x1ae587.querySelector(".audio-voice-audio-line-source");
    } else if (_0x13e1a1) {
      _0x13e1a1.classList.toggle("audio-voice-audio-line-source-has-draft", _0x219561);
    }
    const _0xc8285d = _0x1ae587.querySelector(".audio-voice-audio-line-converted");
    if (!_0x219561) {
      _0xc8285d?.remove?.();
      return true;
    }
    if (!_0xc8285d) {
      const _0x42e296 = _0x3d3f4e(_0x286a77, "converted");
      _0x42e296.classList.add("is-entering");
      _0x1ae587.appendChild(_0x42e296);
      return true;
    }
    const _0x1fcb0f = !!String(_0x38b588.error || "").trim() !== !!String(_0x286a77.error || "").trim();
    if (!_0x3d8f19 || _0x1fcb0f) {
      _0xc8285d.replaceWith(_0x3d3f4e(_0x286a77, "converted"));
      return true;
    }
    if (!_0x2670f0(_0xc8285d, _0x286a77)) {
      _0xc8285d.replaceWith(_0x3d3f4e(_0x286a77, "converted"));
      return true;
    }
    const _0x3adcc6 = _0xc8285d.querySelector(".audio-voice-history-wrap");
    if (_0x3adcc6) {
      _0x3adcc6.replaceWith(_0x513ef1(_0x286a77));
    }
    const _0x5ce40f = _0xc8285d.querySelector(".audio-voice-generate-btn");
    if (_0x5ce40f) {
      _0x763a5a(_0x5ce40f, _0x286a77);
    }
    const _0x1ab127 = _0xc8285d.querySelector(".audio-voice-line-play");
    if (_0x1ab127) {
      const _0x37c220 = _0x286a77.convertedAudioReady ? panelText("actions.playAudio") : panelText("actions.generateAudio");
      _0x1ab127.title = _0x37c220;
      _0x1ab127.setAttribute("aria-label", _0x37c220);
    }
    return true;
  }
  function _0x5231ae(_0x3d5980, _0x57cdb0 = {}) {
    const _0x4386d7 = [..._0x3d5980.children].find(_0x16f9fb => _0x16f9fb.classList?.contains?.("audio-voice-segment-loading"));
    const _0x2f67b3 = _0x28e423(_0x57cdb0);
    const _0x1350d3 = _0x4e1dc6.isMerging(_0x57cdb0);
    const _0x1aa75e = _0x58f156(_0x57cdb0);
    _0x3d5980.classList?.toggle?.("is-composing", _0x2f67b3 || _0x1350d3);
    _0x3d5980.classList?.toggle?.("is-translating", _0x1aa75e);
    _0x3d5980.setAttribute?.("aria-busy", String(_0x57cdb0.status === "generating" || _0x2f67b3 || _0x1350d3 || _0x1aa75e));
    if (_0x57cdb0.status === "generating" || _0x2f67b3 || _0x1350d3 || _0x1aa75e) {
      const _0x4a5af1 = _0x1350d3 ? panelText("status.merging") : _0x1aa75e ? panelText("status.translating") : _0x2f67b3 ? panelText("status.composing") : panelText("status.generating");
      if (!_0x4386d7) {
        _0x3d5980.appendChild(_0x4434d8(_0x4a5af1));
      } else {
        const _0x28d992 = _0x4386d7.querySelector?.(".storyboard-script-loading-label");
        if (_0x28d992 && _0x28d992.textContent !== _0x4a5af1) {
          _0x28d992.textContent = _0x4a5af1;
        }
      }
      return;
    }
    _0x4386d7?.remove?.();
  }
  function _0x64ca06(_0xd29a44, _0xf0e607 = {}) {
    const _0x203c0e = [..._0xd29a44.children].find(_0x310ab0 => _0x310ab0.classList?.contains?.("audio-voice-segment-error"));
    const _0x48aa2b = String(_0xf0e607.error || "").trim();
    if (!_0x48aa2b) {
      _0x203c0e?.remove?.();
      return;
    }
    if (_0x203c0e) {
      if (_0x203c0e.textContent !== _0x48aa2b) {
        _0x203c0e.textContent = _0x48aa2b;
      }
      return;
    }
    const _0x56ac5e = _0x498918(_0xf0e607);
    if (!_0x56ac5e) {
      return;
    }
    const _0x157f2e = [..._0xd29a44.children].find(_0x1e94fa => _0x1e94fa.classList?.contains?.("audio-voice-segment-body"));
    if (_0x157f2e?.parentNode === _0xd29a44 && _0x157f2e.nextSibling) {
      _0xd29a44.insertBefore(_0x56ac5e, _0x157f2e.nextSibling);
      return;
    }
    _0xd29a44.appendChild(_0x56ac5e);
  }
  function _0x4bafb7(_0x33e545 = {}, _0x25fffa = {}) {
    return hasSegmentConvertedAudio(_0x33e545) !== hasSegmentConvertedAudio(_0x25fffa) || isSegmentUsingConvertedAudio(_0x33e545) !== isSegmentUsingConvertedAudio(_0x25fffa) || String(_0x33e545.voiceModelId || "") !== String(_0x25fffa.voiceModelId || "") || String(_0x33e545.voiceRefAudioUrl || "") !== String(_0x25fffa.voiceRefAudioUrl || "") || String(_0x33e545.voiceRefAudioLocalPath || "") !== String(_0x25fffa.voiceRefAudioLocalPath || "") || _0x33e545.imitateToneEnabled === true !== (_0x25fffa.imitateToneEnabled === true);
  }
  function _0x5ae537(_0x53cade, _0x1f4630 = {}, _0xcd931c = {}, {
    syncToolbar = true
  } = {}) {
    const _0x48c10b = _0x4ff4ab(_0x53cade);
    if (!_0x48c10b || !_0xcd931c) {
      return false;
    }
    const _0xafeed7 = "is-" + (_0x1f4630.status || "detected");
    const _0x2fcbba = "is-" + (_0xcd931c.status || "detected");
    if (_0xafeed7 !== _0x2fcbba) {
      _0x48c10b.classList.remove(_0xafeed7);
      _0x48c10b.classList.add(_0x2fcbba);
    }
    const _0x598f8e = _0x53b6fd.has(_0x53cade);
    _0x48c10b.classList.toggle("is-selected", _0x598f8e);
    _0x48c10b.setAttribute("aria-selected", _0x598f8e ? "true" : "false");
    if (!_0x12a5aa(_0x48c10b, _0x1f4630, _0xcd931c)) {
      return false;
    }
    _0x64ca06(_0x48c10b, _0xcd931c);
    _0x5231ae(_0x48c10b, _0xcd931c);
    if (_0x4bafb7(_0x1f4630, _0xcd931c)) {
      if (!_0x1db77f(_0x53cade)) {
        return false;
      }
    }
    if (syncToolbar) {
      return _0x5ca535();
    } else {
      return true;
    }
  }
  function _0x115620(_0x4172fc = []) {
    let _0x35897c = _0x5ca535();
    [...new Set(_0x4172fc.map(_0x3680ac => String(_0x3680ac || "").trim()).filter(Boolean))].forEach(_0x2287ce => {
      const _0x4c813b = _0x3898eb[_0x47b79d(_0x2287ce)];
      const _0x224e30 = _0x4ff4ab(_0x2287ce);
      if (!_0x4c813b || !_0x224e30) {
        _0x35897c = false;
        return;
      }
      _0x5231ae(_0x224e30, _0x4c813b);
    });
    if (!_0x35897c) {
      _0x276cb6();
    }
    return _0x35897c;
  }
  function _0x1e4cc4(_0x120eaf = []) {
    let _0x53cdb5 = _0x5ca535();
    [...new Set(_0x120eaf.map(_0x4b65dc => String(_0x4b65dc || "").trim()).filter(Boolean))].forEach(_0xc27ccc => {
      const _0x1e8048 = _0x3898eb[_0x47b79d(_0xc27ccc)];
      const _0x46d22b = _0x4ff4ab(_0xc27ccc);
      if (!_0x1e8048 || !_0x46d22b) {
        _0x53cdb5 = false;
        return;
      }
      _0x5231ae(_0x46d22b, _0x1e8048);
    });
    _0x7d74ae();
    if (!_0x53cdb5) {
      _0x276cb6();
    }
    return _0x53cdb5;
  }
  function _0x4305e4(_0x1735cc, _0x28087c = []) {
    let _0x5d8550 = true;
    [...new Set(_0x28087c.map(_0x12b6e9 => String(_0x12b6e9 || "").trim()).filter(Boolean))].forEach(_0x1381a6 => {
      const _0x2eeefa = _0x1735cc.get(_0x1381a6);
      const _0x3383c4 = _0x3898eb[_0x47b79d(_0x1381a6)];
      if (!_0x2eeefa || !_0x3383c4 || !_0x5ae537(_0x1381a6, _0x2eeefa, _0x3383c4, {
        syncToolbar: false
      })) {
        _0x5d8550 = false;
      }
    });
    if (!_0x5ca535()) {
      _0x5d8550 = false;
    }
    if (!_0x5d8550) {
      _0x276cb6();
    }
    return _0x5d8550;
  }
  function _0x25f9d6(_0xd14a86, _0x32633d) {
    const _0x448038 = _0x3898eb[_0x47b79d(_0xd14a86)];
    const _0x528313 = _0x2eed02(_0xd14a86, _0x32633d);
    if (!_0x528313) {
      return null;
    }
    if (!_0x5ae537(_0xd14a86, _0x448038, _0x528313)) {
      _0x276cb6();
    }
    return _0x528313;
  }
  function _0x199b00(_0x19af0d = {}) {
    return isAudioVoiceImitateToneWorkflow(_0x1bc79e(_0x19af0d)?.id) && !!resolveAudioVoiceSegmentAudioInput(_0x19af0d, 2).audioUrl;
  }
  function _0x8c0253(_0x28cbec) {
    const _0x2c5cd6 = String(_0x28cbec || "").trim();
    if (!_0x2c5cd6) {
      return [];
    }
    const _0x2571f8 = _0x53b6fd.has(_0x2c5cd6) && _0x53b6fd.size > 1 ? a903_0x36767f(_0x3898eb).filter(_0x2d798a => _0x53b6fd.has(_0x2d798a.id)).map(_0x62d202 => _0x62d202.id) : [_0x2c5cd6];
    return _0x2571f8.filter(_0x1ed31a => {
      const _0x3d3642 = _0x3898eb[_0x47b79d(_0x1ed31a)];
      return _0x199b00(_0x3d3642);
    });
  }
  function _0x44b283(_0x45a929, _0x5e3b03) {
    const _0x288bab = _0x8c0253(_0x45a929);
    if (_0x288bab.length <= 0) {
      return false;
    }
    const _0x5d07d5 = new Set(_0x288bab);
    _0x3898eb = _0x3898eb.map(_0x192c5 => _0x5d07d5.has(_0x192c5.id) ? {
      ..._0x192c5,
      imitateToneEnabled: _0x5e3b03 === true,
      error: ""
    } : _0x192c5);
    _0x5454de();
    let _0x473c1a = true;
    _0x288bab.forEach(_0x1b04ff => {
      if (!_0x1db77f(_0x1b04ff)) {
        _0x473c1a = false;
      }
    });
    if (!_0x473c1a) {
      _0x276cb6();
    }
    return true;
  }
  function _0x31631d(_0x321058) {
    if (!_0x321058) {
      return;
    }
    const _0x5172e9 = new Set(_0x53b6fd);
    if (_0x5172e9.has(_0x321058)) {
      _0x5172e9.delete(_0x321058);
    } else {
      _0x5172e9.add(_0x321058);
    }
    _0x53b6fd = _0x5172e9;
    _0x545178();
  }
  function _0x3584e8(_0x127416, _0x125867) {
    const _0xee47a8 = _0x47b79d(_0x127416);
    if (_0xee47a8 < 0) {
      return;
    }
    const _0x4cb005 = _0x3898eb[_0xee47a8];
    const _0x3d8eab = {
      ..._0x4cb005,
      ..._0x125867
    };
    _0x3898eb = _0x3898eb.map((_0x5636d0, _0x92b18e) => _0x92b18e === _0xee47a8 ? _0x3d8eab : _0x5636d0);
    _0x5454de();
    if (!_0x5ae537(_0x127416, _0x4cb005, _0x3d8eab)) {
      _0x276cb6();
    }
  }
  function _0x5c74a3(_0x46521e, _0x23889b = []) {
    const _0x448914 = (Array.isArray(_0x23889b) ? _0x23889b : [_0x23889b]).map(_0x2b1735 => String(_0x2b1735 || "").trim()).filter(Boolean);
    _0x3f89df = _0x448914.length ? {
      type: String(_0x46521e || "change"),
      ids: new Set(_0x448914)
    } : null;
  }
  function _0x2a0c14() {
    const _0x1b9384 = _0x316888;
    if (!_0x1b9384) {
      return;
    }
    _0x316888 = "";
    _0x366f61(_0x1b9384, "converted");
  }
  function _0x366f61(_0x1ed3ca, _0x10cb38 = "converted") {
    const _0x5cacaa = String(_0x1ed3ca || "").trim();
    if (!_0x5cacaa) {
      return false;
    }
    const _0x2f4022 = [..._0x47ce8e.querySelectorAll("[data-audio-voice-text-input]")].find(_0x500e8b => _0x500e8b.dataset.segmentId === _0x5cacaa && (!_0x10cb38 || _0x500e8b.dataset.audioVoiceTextKind === _0x10cb38)) || null;
    if (!_0x2f4022) {
      return false;
    }
    _0x2f4022.focus?.();
    const _0x59e8df = String(_0x2f4022.value || "").length;
    _0x2f4022.setSelectionRange?.(_0x59e8df, _0x59e8df);
    return true;
  }
  function _0x3dbad8(_0x495e11, _0x493082 = {}) {
    const _0x143526 = String(_0x495e11 || "").trim();
    const _0xee7f24 = _0x47b79d(_0x143526);
    if (_0xee7f24 < 0) {
      return false;
    }
    const _0x8d3c3c = _0x3898eb[_0xee7f24];
    const _0x448c7d = _0xe0aea6(_0x8d3c3c);
    _0xa73170.add(_0x143526);
    const _0xa60f02 = {
      ..._0x8d3c3c,
      _audioVoiceConvertedRowVisible: _0x448c7d
    };
    if (!_0x5ae537(_0x143526, _0xa60f02, _0x8d3c3c)) {
      _0x276cb6();
    }
    if (_0x493082.focus !== false) {
      _0x366f61(_0x143526, "converted");
    }
    return true;
  }
  function _0x3f3aaa(_0x534d38) {
    const _0x3582a8 = String(_0x534d38 || "").trim();
    const _0x4e9176 = _0x47b79d(_0x3582a8);
    if (_0x4e9176 < 0 || !_0xa73170.has(_0x3582a8)) {
      return false;
    }
    const _0xf49d5a = _0x3898eb[_0x4e9176];
    if (shouldShowConvertedRow(_0xf49d5a)) {
      return false;
    }
    _0xa73170.delete(_0x3582a8);
    const _0x532d4e = {
      ..._0xf49d5a,
      _audioVoiceConvertedRowVisible: true
    };
    if (!_0x5ae537(_0x3582a8, _0x532d4e, _0xf49d5a)) {
      _0x276cb6();
    }
    return true;
  }
  function _0x353d1a(_0x9b6334, _0x4f66c6 = 1) {
    const _0x282f65 = a903_0x36767f(_0x3898eb);
    const _0x41a0c0 = _0x282f65.findIndex(_0xb7f6f7 => _0xb7f6f7.id === _0x9b6334);
    if (_0x41a0c0 < 0) {
      return false;
    }
    const _0xa6fc09 = _0x282f65[_0x41a0c0 + _0x4f66c6];
    if (!_0xa6fc09) {
      return false;
    }
    return _0x3dbad8(_0xa6fc09.id, {
      focus: true
    });
  }
  function _0xa1c696(_0x445d0e, _0x311e65) {
    if (!_0x311e65) {
      return false;
    }
    const _0x1ee00c = String(_0x311e65.dataset.segmentId || "").trim();
    if (!_0x1ee00c) {
      return false;
    }
    if (shouldCloseAudioVoiceEmptyConvertedTextEdit(_0x445d0e, _0x311e65) && _0x3f3aaa(_0x1ee00c)) {
      _0x445d0e.preventDefault?.();
      _0x445d0e.stopPropagation?.();
      return true;
    }
    if (_0x445d0e.key === "Enter" && _0x311e65.dataset.audioVoiceTextKind === "source") {
      _0x445d0e.preventDefault?.();
      _0x445d0e.stopPropagation?.();
      _0x3dbad8(_0x1ee00c, {
        focus: true
      });
      return true;
    }
    if (_0x445d0e.key === "Tab") {
      const _0x2af141 = _0x445d0e.shiftKey ? -1 : 1;
      if (!_0x353d1a(_0x1ee00c, _0x2af141)) {
        return false;
      }
      _0x445d0e.preventDefault?.();
      _0x445d0e.stopPropagation?.();
      return true;
    }
    return false;
  }
  function _0x275625(_0x89e697, _0xf27933, _0x41b2a8 = "converted") {
    const _0x5daf8e = _0x47b79d(_0x89e697);
    if (_0x5daf8e < 0) {
      return;
    }
    const _0xd9687 = _0x3898eb[_0x5daf8e];
    const _0x24aab0 = _0xe0aea6(_0xd9687);
    const _0x176156 = {
      ..._0xd9687,
      ...buildAudioVoiceTextEditPatch(_0xd9687, _0xf27933)
    };
    if (_0x41b2a8 === "converted") {
      if (shouldShowConvertedRow(_0x176156)) {
        _0xa73170.delete(_0x89e697);
      } else {
        _0xa73170.add(_0x89e697);
      }
    }
    const _0x473444 = _0x24aab0 !== _0xe0aea6(_0x176156);
    _0x3898eb = _0x3898eb.map(_0xce355f => _0xce355f.id === _0x89e697 ? a903_0x2f01f3(_0x176156) : _0xce355f);
    _0x5454de();
    if (_0x473444) {
      _0x316888 = _0x89e697;
    }
    const _0x59ba2e = _0x5ae537(_0x89e697, {
      ..._0xd9687,
      _audioVoiceConvertedRowVisible: _0x24aab0
    }, _0x176156);
    if (!_0x59ba2e) {
      _0x276cb6();
      return;
    }
    if (_0x473444) {
      _0x2a0c14();
    }
  }
  async function _0x37ff86(_0x4e5230 = {}, _0x770cb0 = {}, _0xe62f87 = _0x5290c1) {
    const _0xe59c52 = Math.max(0, Math.round(Number(_0x770cb0.startMs) || 0));
    const _0x4c7788 = normalizeLocalPath(_0x770cb0.localPath || "") || String(_0x770cb0.audioUrl || "").trim() || _0x30e3cd;
    const _0x46137e = await enqueueElectronMediaTask({
      kind: "audioCut",
      src: _0x4c7788,
      nodeId: _0xe62f87,
      args: {
        start: Math.max(0, (Number(_0x4e5230.startMs || 0) - _0xe59c52) / 1000),
        end: Math.max(0, (Number(_0x4e5230.endMs || 0) - _0xe59c52) / 1000)
      }
    }, {
      wait: true,
      timeout: AUDIO_CUT_TASK_TIMEOUT_MS
    });
    const _0xa1d7e1 = normalizeLocalPath(_0x46137e?.localPath || _0x46137e?.path || "");
    const _0x574693 = firstNonEmptyString(_0x46137e?.url, localPathToUrl(_0xa1d7e1));
    if (!_0xa1d7e1 && !_0x574693) {
      throw new Error(panelText("toasts.sourceClipFailed"));
    }
    return {
      localPath: _0xa1d7e1,
      audioUrl: _0x574693
    };
  }
  function _0x4b6aea(_0x337f8c) {
    return [..._0x47ce8e.querySelectorAll(".audio-voice-segment-card")].find(_0x2710cf => _0x2710cf.dataset.segmentId === _0x337f8c) || null;
  }
  function _0x584e47(_0x5a2cd6) {
    const _0x566414 = _0x47b79d(_0x5a2cd6);
    const _0x3c6e26 = _0x3898eb[_0x566414];
    if (!_0x3c6e26) {
      return;
    }
    const _0x14e434 = String(_0x5290c1 || "").trim();
    if (!_0x30e3cd) {
      windowObject?.showToast?.(panelText("toasts.sourceClipNeedsAnalysis"), "warn");
      return;
    }
    const _0x2de511 = _0x4b6aea(_0x3c6e26.id);
    if (!_0x2de511) {
      return;
    }
    const _0xbb0e25 = resolveAudioVoiceSourceClipEditBase(_0x3c6e26, {
      analysisSourceAudioLocalPath: _0x30e3cd,
      analysisSourceAudioUrl: _0xf0d5b4
    });
    if (!_0xbb0e25.localPath && !_0xbb0e25.audioUrl) {
      windowObject?.showToast?.(panelText("toasts.sourceClipNeedsAnalysis"), "warn");
      return;
    }
    a903_0x440a08.initForSource({
      anchorId: _0x3c6e26.id,
      wrapperEl: _0x2de511,
      sourceLocalPath: _0xbb0e25.localPath,
      sourceUrl: _0xbb0e25.audioUrl,
      initialStartSec: 0,
      initialEndSec: Math.max(AUDIO_VOICE_SOURCE_CLIP_MIN_MS, Number(_0xbb0e25.durationMs || 0)) / 1000,
      allowSplit: true,
      dimMode: false,
      onConfirm: async ({
        startSec: _0x3cc63f,
        endSec: _0x19503b,
        splitSec: _0x4b90c9,
        ranges: _0x36925a
      }) => {
        const _0x6569fb = _0x2123cb.begin({
          kind: "source-clip",
          sourceNodeId: _0x14e434,
          segmentId: _0x3c6e26.id
        });
        if (!_0x6569fb) {
          _0x37aea5();
          return;
        }
        let _0x1e15f9 = null;
        try {
          const _0x34d1bd = Array.isArray(_0x36925a) ? _0x36925a.map(_0x332762 => ({
            id: String(_0x332762?.id || ""),
            startMs: _0xbb0e25.startMs + Math.round(Math.max(0, Number(_0x332762?.startSec) || 0) * 1000),
            endMs: _0xbb0e25.startMs + Math.round(Math.max(0, Number(_0x332762?.endSec) || 0) * 1000)
          })).sort((_0x5ea571, _0x3d2b28) => _0x5ea571.startMs - _0x3d2b28.startMs) : null;
          const _0x5542f1 = Array.isArray(_0x34d1bd) && _0x34d1bd.length >= 2;
          const _0x379be8 = _0x5542f1 ? _0x34d1bd[0].startMs : _0xbb0e25.startMs + Math.round(Math.max(0, Number(_0x3cc63f) || 0) * 1000);
          const _0x48f8b9 = _0x5542f1 ? _0x34d1bd[_0x34d1bd.length - 1].endMs : _0xbb0e25.startMs + Math.round(Math.max(0, Number(_0x19503b) || 0) * 1000);
          const _0x78a325 = await commitAudioVoiceSourceClipEdit(_0x3c6e26, {
            selectionStartMs: _0x379be8,
            selectionEndMs: _0x48f8b9,
            rangesMs: _0x5542f1 ? _0x34d1bd : null,
            splitAtMs: _0x5542f1 || _0x4b90c9 === undefined || _0x4b90c9 === null ? null : _0xbb0e25.startMs + Math.round(Math.max(0, Number(_0x4b90c9) || 0) * 1000),
            newSegmentId: _0x3c6e26.id + "-split-" + Date.now(),
            editBase: _0xbb0e25,
            cutRange: _0x25932c => _0x37ff86(_0x25932c, _0xbb0e25, _0x14e434)
          });
          if (!_0x2123cb.isCurrent(_0x6569fb, _0x5290c1)) {
            return;
          }
          _0x1e15f9 = [];
          _0x3898eb.forEach(_0x5bd23f => {
            if (_0x5bd23f.id !== _0x3c6e26.id) {
              _0x1e15f9.push(_0x5bd23f);
              return;
            }
            _0x1e15f9.push(..._0x78a325);
          });
        } finally {
          _0x2123cb.finish(_0x6569fb);
        }
        _0x32ba70(_0x1e15f9);
        windowObject?.showToast?.(panelText("toasts.sourceClipApplied"), "success");
      }
    });
  }
  async function _0x492d83(_0x1b6ce3) {
    const _0x4fde2a = String(_0x1b6ce3 || "").trim();
    if (!_0x4fde2a) {
      windowObject?.showToast?.(panelText("toasts.audioMissing"), "warn");
      return;
    }
    const _0x36aca0 = await _0x1db571.play(_0x4fde2a);
    if (_0x36aca0.status === "unavailable") {
      windowObject?.showToast?.(panelText("toasts.playUnavailable"), "warn");
      return;
    }
    if (_0x36aca0.status === "failed") {
      windowObject?.showToast?.(panelText("toasts.playFailed"), "warn");
    }
  }
  function _0x12a0b6(_0x4d84f2, _0x7b5563) {
    const _0x5c998d = _0x3898eb[_0x47b79d(_0x4d84f2)];
    if (!_0x5c998d) {
      return;
    }
    if (_0x7b5563 === "converted") {
      if (!_0x5c998d.convertedAudioReady) {
        _0xa91ca2(_0x4d84f2);
        return;
      }
      _0x492d83(resolveSegmentLocalAudioUrl(_0x5c998d.convertedAudioUrl, _0x5c998d.convertedAudioLocalPath));
      return;
    }
    _0x492d83(resolveSegmentLocalAudioUrl(_0x5c998d.sourceAudioUrl, _0x5c998d.sourceAudioLocalPath));
  }
  function _0x1760ea(_0x4b2a02, _0x31803f) {
    const _0x219f89 = _0x3898eb[_0x47b79d(_0x4b2a02)];
    if (!_0x219f89) {
      return;
    }
    const _0x443c19 = _0x31803f === "converted";
    const _0x17d37e = _0x443c19 ? {
      name: (getSourceName(_0x436e7e || {}) || "audio") + "-" + _0x219f89.id + "-converted",
      localPath: _0x219f89.convertedAudioLocalPath,
      audioUrl: _0x219f89.convertedAudioUrl
    } : {
      name: (getSourceName(_0x436e7e || {}) || "audio") + "-" + _0x219f89.id + "-source",
      localPath: _0x219f89.sourceAudioLocalPath,
      audioUrl: _0x219f89.sourceAudioUrl
    };
    const _0x54d1a8 = resolveAudioDownloadTarget({
      nodeData: _0x17d37e
    });
    if (!_0x54d1a8) {
      windowObject?.showToast?.(panelText("toasts.audioMissing"), "warn");
      return;
    }
    triggerAudioDownload(_0x54d1a8, document);
  }
  async function _0x10a750(_0x414ef3) {
    const _0xe2136a = String(_0x414ef3 || "").trim();
    if (!_0xe2136a) {
      return {
        localPath: "",
        audioUrl: ""
      };
    }
    const _0x107bd9 = normalizeLocalPath(_0xe2136a);
    if (_0x107bd9) {
      return {
        localPath: _0x107bd9,
        audioUrl: localPathToUrl(_0x107bd9)
      };
    }
    const _0x2de249 = await saveRemoteAudioLocallyDetailed(_0xe2136a);
    const _0x52395c = normalizeLocalPath(_0x2de249?.localPath || _0x2de249?.originalLocalPath || pickResultLocalPath(_0x2de249));
    if (!_0x52395c) {
      throw new Error(panelText("toasts.localSaveGeneratedFailed"));
    }
    const _0x4b8cee = pickAudioDurationSec(_0x2de249?.audioDuration, _0x2de249?.duration);
    return {
      ...(_0x2de249 && typeof _0x2de249 === "object" ? _0x2de249 : {}),
      localPath: _0x52395c,
      audioUrl: localPathToUrl(_0x52395c),
      ...(_0x4b8cee > 0 ? {
        audioDuration: _0x4b8cee
      } : {})
    };
  }
  async function _0xf353e7(_0x4d84eb, {
    ownerSourceNodeId = "",
    ownerAnalysisSourceAudioLocalPath = "",
    taskStore = null,
    targetNodeId = ""
  } = {}) {
    if (!_0x4d84eb?.id) {
      return null;
    }
    const _0x51587b = resolveSegmentLocalAudioUrl(_0x4d84eb.sourceAudioUrl, _0x4d84eb.sourceAudioLocalPath);
    if (_0x51587b && !_0x4d84eb.needsSourceAudioRecut) {
      return _0x4d84eb;
    }
    if (!ownerAnalysisSourceAudioLocalPath) {
      return _0x4d84eb;
    }
    const _0xc1b48e = await enqueueElectronMediaTask({
      kind: "audioCut",
      src: ownerAnalysisSourceAudioLocalPath,
      nodeId: ownerSourceNodeId,
      args: {
        start: Math.max(0, Number(_0x4d84eb.startMs || 0) / 1000),
        end: Math.max(0, Number(_0x4d84eb.endMs || 0) / 1000)
      }
    }, {
      wait: true,
      timeout: AUDIO_CUT_TASK_TIMEOUT_MS
    });
    const _0x500279 = {
      sourceAudioLocalPath: normalizeLocalPath(_0xc1b48e?.localPath || _0xc1b48e?.path || ""),
      sourceAudioUrl: firstNonEmptyString(_0xc1b48e?.url, localPathToUrl(_0xc1b48e?.localPath || _0xc1b48e?.path)),
      sourceAudioReady: true,
      needsSourceAudioRecut: false
    };
    taskStore?.updateNodeData?.(targetNodeId, _0x500279);
    return {
      ..._0x4d84eb,
      ..._0x500279
    };
  }
  function _0x316497(_0x13550f) {
    const _0x3d74a3 = _0x47b79d(_0x13550f);
    if (_0x3d74a3 < 0) {
      return;
    }
    const _0x398610 = _0x3898eb[_0x3d74a3];
    _0x3584e8(_0x13550f, {
      targetText: _0x398610.targetText || (_0x398610.sourceText || panelText("sentences.sourcePlaceholder")) + " " + panelText("sentences.convertedSuffix"),
      convertedAudioReady: false,
      convertedAudioDuration: 0,
      activeAudio: "source",
      status: "edited"
    });
  }
  async function _0x2d4a8a(_0xd1b48d, _0x3559cb, {
    segmentId = "",
    modelOption = {},
    modelId = "",
    startedAt = 0,
    fallbackSegment = null
  } = {}) {
    const _0x5775ed = await buildAudioGenerationResultPatch(_0xd1b48d, {
      startedAt: _0x3559cb?.startedAt || startedAt,
      persistAudioOutput: _0x10a750
    });
    if (!_0x5775ed?.localPath && !_0x5775ed?.audioUrl) {
      throw new Error(panelText("toasts.generateFailed"));
    }
    const _0x591479 = Array.isArray(_0x5775ed.audios) && _0x5775ed.audios.length ? _0x5775ed.audios : [_0x5775ed];
    const _0x5bec7e = Date.now();
    const _0x3a86af = _0x591479.map((_0x3794a2, _0x29ef6c) => buildAudioVoiceHistoryEntry(_0x3794a2, {
      id: "audio-voice-history-" + _0x5bec7e + "-" + _0x29ef6c,
      modelId: modelId,
      modelLabel: modelOption?.label || modelId,
      createdAt: _0x5bec7e - _0x29ef6c
    })).filter(Boolean);
    const _0x5f0f94 = _0x3559cb?.store?.getState?.()?.nodes?.[_0x3559cb?.targetNodeId] || fallbackSegment || {};
    return {
      ..._0x5775ed,
      taskModelId: modelId,
      targetText: _0x5f0f94.targetText || _0x5f0f94.sourceText,
      convertedAudioLocalPath: normalizeLocalPath(_0x5775ed.localPath || ""),
      convertedAudioUrl: firstNonEmptyString(_0x5775ed.audioUrl, _0x5775ed.src, localPathToUrl(_0x5775ed.localPath)),
      convertedAudioDuration: pickAudioDurationSec(_0x5775ed.audioDuration, _0x5775ed.duration),
      convertedAudioReady: true,
      activeAudio: "converted",
      status: "ready",
      error: "",
      convertedAudioHistory: prependAudioVoiceHistoryEntries(_0x5f0f94.convertedAudioHistory, _0x3a86af)
    };
  }
  async function _0xa91ca2(_0x59cf55, _0x137db4 = {}) {
    const _0x3a691f = String(_0x137db4.ownerSourceNodeId || _0x5290c1 || "").trim();
    const _0xe89a72 = _0x47b79d(_0x59cf55);
    if (_0xe89a72 < 0) {
      return {
        status: "skipped"
      };
    }
    const _0x5c46d9 = a903_0x2f01f3(_0x3898eb[_0xe89a72]);
    if (_0x5c46d9.status === "generating") {
      return {
        status: "skipped"
      };
    }
    if (_0x16ffc9.getRun(_0x3a691f, _0x59cf55)) {
      return {
        status: "skipped"
      };
    }
    const _0x43060a = _0x137db4.showResultToast !== false;
    const _0x38b89b = _0x137db4.notifyCompletion !== false;
    const _0x6844cd = _0x1bc79e(_0x5c46d9);
    const _0x26af85 = _0x6844cd?.id || _0x3dfa10;
    const _0xfdd141 = _0x30e3cd;
    const _0x48962e = _0x2d9e53(_0x59cf55, _0x3a691f);
    const _0xea0042 = new AbortController();
    const _0xd33cc1 = _0x16ffc9.begin({
      sourceNodeId: _0x3a691f,
      segmentId: _0x59cf55,
      targetNodeId: _0x48962e
    }, {
      abortController: _0xea0042
    });
    const _0x1aeab6 = _0xd33cc1.store;
    _0x1aeab6.updateNodeData(_0x48962e, {
      status: "generating",
      error: "",
      jobStatus: "running",
      rhTaskStatus: "pending",
      isGenerating: true
    });
    try {
      const _0x1bd32d = await _0xf353e7(_0x5c46d9, {
        ownerSourceNodeId: _0x3a691f,
        ownerAnalysisSourceAudioLocalPath: _0xfdd141,
        taskStore: _0x1aeab6,
        targetNodeId: _0x48962e
      });
      if (!_0x1bd32d) {
        _0x1aeab6.updateNodeData(_0x48962e, {
          status: "edited",
          isGenerating: false,
          jobStatus: "",
          rhTaskStatus: ""
        });
        return {
          status: "failed"
        };
      }
      if (_0xd33cc1.cancelRequested || !_0x16ffc9.isCurrent(_0xd33cc1)) {
        return {
          status: "cancelled"
        };
      }
      const _0x2d25a3 = await resolveAudioVoiceGenerateInstallId(windowObject, _0x26af85);
      if (_0xd33cc1.cancelRequested || !_0x16ffc9.isCurrent(_0xd33cc1)) {
        return {
          status: "cancelled"
        };
      }
      const _0x21dd00 = buildAudioVoiceGeneratePayload(_0x1bd32d, _0x26af85, {
        workflowLabel: _0x6844cd?.label || _0x26af85,
        nodeId: _0x3a691f,
        installId: _0x2d25a3
      });
      const _0x5c76fe = Date.now();
      const _0x1f4d87 = await submitTask({
        sourceNodeId: _0x3a691f,
        targetNodeId: _0x48962e,
        trigger: "audio-voice-panel",
        taskType: "audio-generation",
        provider: _0x6844cd?.provider || "runninghubwf",
        adapterType: _0x6844cd?.adapterType || "workflow",
        modelId: _0x26af85,
        executionId: _0x6844cd?.executionId || "runninghub.audio." + (_0x26af85 || "workflow"),
        payload: _0x21dd00,
        cancellable: _0x6844cd?.cancellable === true,
        resumable: true,
        completionFeedback: false,
        startBuilder: () => ({
          provider: _0x21dd00.provider,
          audioWorkflowKey: _0x21dd00.audioWorkflowKey,
          audioWorkflowLabel: _0x21dd00.audioWorkflowLabel,
          model: _0x21dd00.audioWorkflowKey,
          taskModelId: _0x26af85,
          rhInstanceType: _0x21dd00.rhInstanceType,
          rhTaskUseOpenapiQuery: true,
          status: "generating",
          error: ""
        }),
        submit: async (_0x4b67f0, _0x4f95d7) => {
          return generateAudio(_0x21dd00, {
            signal: _0x4f95d7.signal || _0xea0042.signal,
            runningHubWorkflowQueueLease: _0x4f95d7.runningHubWorkflowQueueLease,
            onTaskId: _0x27430d => {
              const _0x3d8dcd = String(_0x27430d || "").trim();
              if (!_0x3d8dcd) {
                return;
              }
              _0x4f95d7.onTaskId(_0x3d8dcd);
            },
            onTaskMeta: ({
              taskId: _0x19ddc3,
              useOpenapiQuery: _0x2c1793,
              apiKey: _0x5929bc
            }) => {
              const _0x285eb7 = String(_0x19ddc3 || "").trim();
              if (!_0x285eb7) {
                return;
              }
              if (_0x5929bc) {
                _0xd33cc1.apiKey = String(_0x5929bc || "").trim();
              }
              _0x4f95d7.onTaskId(_0x285eb7);
              _0x1aeab6.updateNodeData(_0x48962e, {
                rhTaskUseOpenapiQuery: _0x2c1793 === true
              });
            }
          });
        },
        cancel: async ({
          taskId: _0x37d7ab
        }) => {
          const _0x5a2ad3 = String(_0xd33cc1.apiKey || _0x21dd00?.apiKey || "").trim();
          if (!_0x5a2ad3 || !_0x37d7ab) {
            return;
          }
          await cancelRunningHubAudioTask({
            apiKey: _0x5a2ad3,
            taskId: _0x37d7ab
          });
        },
        resultBuilder: (_0x1d1187, _0xbacde0) => _0x2d4a8a(_0x1d1187, _0xbacde0, {
          segmentId: _0x59cf55,
          modelOption: _0x6844cd,
          modelId: _0x26af85,
          startedAt: _0x5c76fe,
          fallbackSegment: _0x1bd32d
        }),
        failureBuilder: _0x5a51cb => ({
          status: "edited",
          error: _0x2e42ea(_0x5a51cb, panelText("toasts.generateFailed")),
          rhStatusMessage: _0x2e42ea(_0x5a51cb, panelText("toasts.generateFailed"))
        }),
        cancelledBuilder: () => ({
          status: "edited",
          error: "",
          rhStatusMessage: panelText("toasts.generationCancelled")
        }),
        parseError: _0xe0d0b9 => _0x2e42ea(_0xe0d0b9, panelText("toasts.generateFailed"))
      }, {
        store: _0x1aeab6,
        startedAt: _0x5c76fe,
        abortController: _0xea0042,
        runningHubWorkflowConcurrency: _0x137db4.runningHubWorkflowConcurrency
      });
      if (_0x1f4d87.status === "success") {
        if (_0x43060a) {
          windowObject?.showToast?.(panelText("toasts.generateComplete"), "success");
        }
        if (_0x38b89b) {
          await notifyAudioVoiceGenerationComplete({
            total: 1,
            succeeded: 1,
            incomplete: 0
          }, {
            playSound: playCompletion,
            showNotification: showCompletionNotification
          });
        }
        return {
          status: "success"
        };
      }
      if (_0x1f4d87.status === "cancelled") {
        if (_0x43060a) {
          windowObject?.showToast?.(panelText("toasts.generationCancelled"), "info");
        }
        return {
          status: "cancelled"
        };
      }
      throw _0x1f4d87.error || new Error(panelText("toasts.generateFailed"));
    } catch (_0x5da435) {
      if (_0xd33cc1.cancelRequested) {
        return {
          status: "cancelled"
        };
      }
      const _0x109384 = _0x2e42ea(_0x5da435, panelText("toasts.generateFailed"));
      _0x1aeab6.updateNodeData(_0x48962e, {
        status: "edited",
        isGenerating: false,
        jobStatus: "error",
        rhTaskStatus: "failed",
        error: _0x109384
      });
      if (_0x43060a && !_0xe0d83c(_0x5da435)) {
        windowObject?.showToast?.(_0x109384, "error");
      }
      return {
        status: "failed",
        error: _0x5da435
      };
    } finally {
      _0x16ffc9.finish(_0xd33cc1);
    }
  }
  async function _0x1f7e0f(_0x1dafbb) {
    const _0xcd58fe = String(_0x5290c1 || "").trim();
    const _0x3df14a = _0x3898eb[_0x47b79d(_0x1dafbb)];
    if (!_0x3df14a) {
      return;
    }
    const _0x402dd7 = _0x2d9e53(_0x1dafbb, _0xcd58fe);
    const _0x23ef3b = _0x16ffc9.getRun(_0xcd58fe, _0x1dafbb);
    const _0x519e75 = _0x23ef3b || _0x16ffc9.begin({
      sourceNodeId: _0xcd58fe,
      segmentId: _0x1dafbb,
      targetNodeId: _0x402dd7
    });
    if (!shouldAllowCancel(_0x2a8548(_0x3df14a), {
      cancellable: _0x1c8156(_0x3df14a),
      cancelInFlight: _0x519e75.cancelInFlight
    })) {
      if (!_0x23ef3b) {
        _0x16ffc9.finish(_0x519e75);
      }
      return;
    }
    _0x16ffc9.setCancelInFlight(_0x519e75, true);
    if (!_0x5ae537(_0x1dafbb, _0x3df14a, _0x3df14a)) {
      _0x276cb6();
    }
    try {
      await cancelTask(_0x402dd7, {
        store: _0x519e75.store,
        cancellable: true,
        taskId: _0x3df14a.rhTaskId,
        abortLocal: true,
        cancel: async ({
          taskId: _0x225fe3
        }) => {
          const _0x534e97 = _0x17fe8f(_0x3df14a);
          const _0x3c55de = getProviderConfig(_0x534e97?.provider) || {};
          const _0x559123 = String(_0x519e75.apiKey || _0x3c55de.apiKey || "").trim();
          if (!_0x559123 || !_0x225fe3) {
            return;
          }
          await cancelRunningHubAudioTask({
            apiKey: _0x559123,
            taskId: _0x225fe3
          });
        },
        cancelledBuilder: () => ({
          status: "edited",
          error: "",
          rhStatusMessage: panelText("toasts.generationCancelled")
        })
      });
      _0x519e75.abortController?.abort?.();
      windowObject?.showToast?.(panelText("toasts.generationCancelled"), "info");
    } finally {
      _0x16ffc9.setCancelInFlight(_0x519e75, false);
      if (!_0x23ef3b) {
        _0x16ffc9.finish(_0x519e75);
      }
      if (String(_0x5290c1 || "").trim() === _0xcd58fe) {
        const _0x106665 = _0x3898eb[_0x47b79d(_0x1dafbb)] || _0x3df14a;
        if (!_0x5ae537(_0x1dafbb, _0x106665, _0x106665)) {
          _0x276cb6();
        }
      }
    }
  }
  async function _0x1e3d07() {
    if (_0x59e8e9) {
      _0x37aea5();
      return;
    }
    const _0x165d87 = _0x2ba912();
    if (_0x165d87.length <= 0) {
      windowObject?.showToast?.(panelText("toasts.noGenerateTargets"), "warn");
      return;
    }
    const _0x19af9a = String(_0x5290c1 || "").trim();
    const _0x5ae7c8 = _0x21f8de(_0x165d87);
    const _0x17626a = createTaskBatchCancellationController();
    _0x1b2223 = _0x17626a;
    _0x2268ea.clear();
    _0x59e8e9 = runAudioVoiceBatchGenerationQueue(_0x165d87, _0x1fbe1f => _0xa91ca2(_0x1fbe1f.id, {
      ownerSourceNodeId: _0x19af9a,
      runningHubWorkflowConcurrency: _0x5ae7c8,
      notifyCompletion: false,
      showResultToast: false
    }), {
      concurrency: _0x5ae7c8,
      shouldStop: _0x17626a.isRequested,
      onTargetStart: ({
        target: _0x328a1c
      }) => {
        _0x2268ea.add(String(_0x328a1c?.id || "").trim());
      },
      onTargetSettled: ({
        target: _0x4c77aa
      }) => {
        _0x2268ea.delete(String(_0x4c77aa?.id || "").trim());
      }
    });
    _0x5ca535();
    try {
      const _0x3693de = await _0x59e8e9;
      const _0x9fa902 = summarizeAudioVoiceGenerationResults(_0x3693de, _0x165d87.length);
      const _0x34cd72 = buildAudioVoiceGenerationCompletionMessage(_0x9fa902);
      windowObject?.showToast?.(_0x34cd72, _0x9fa902.incomplete > 0 ? "warn" : "success");
      await notifyAudioVoiceGenerationComplete(_0x9fa902, {
        playSound: playCompletion,
        showNotification: showCompletionNotification
      });
      return _0x3693de;
    } finally {
      _0x59e8e9 = null;
      _0x1b2223 = null;
      _0x2268ea.clear();
      _0x5ca535();
    }
  }
  async function _0x254765() {
    const _0x491b56 = _0x1b2223;
    if (!_0x59e8e9 || !_0x491b56?.request?.()) {
      return false;
    }
    _0x5ca535();
    const _0x47bd7a = [..._0x2268ea].filter(Boolean);
    await Promise.allSettled(_0x47bd7a.map(_0x458f88 => _0x1f7e0f(_0x458f88)));
    windowObject?.showToast?.(panelText("toasts.batchCancellationRequested"), "info");
    return true;
  }
  function _0x3db28d(_0x4dcc6f) {
    const _0x1f2b9e = a903_0x36767f(_0x3898eb);
    const _0x51d2fb = _0x1f2b9e.findIndex(_0x4a0142 => _0x4a0142.id === _0x4dcc6f);
    const _0x15972f = _0x1f2b9e[_0x51d2fb];
    const _0x483b10 = _0x1f2b9e[_0x51d2fb + 1] || null;
    if (!_0x15972f) {
      return;
    }
    const _0x549c7e = a903_0x54681b(_0x15972f, _0x483b10);
    _0x5c74a3("insert", [_0x549c7e.id]);
    const _0x13962f = [];
    _0x3898eb.forEach(_0x11073e => {
      _0x13962f.push(_0x11073e);
      if (_0x11073e.id === _0x15972f.id) {
        _0x13962f.push(_0x549c7e);
      }
    });
    _0x32ba70(_0x13962f);
  }
  async function _0x148e71(_0x1f17c1 = null) {
    if (_0x302933) {
      _0x37aea5(panelText("status.composing"));
      return _0x302933;
    }
    const _0x123653 = buildAudioVoiceComposeTimelineClips(_0x3898eb);
    if (_0x123653.length < 1) {
      windowObject?.showToast?.(panelText("toasts.composeNeedsMoreAudio"), "warn");
      return;
    }
    const _0x1f25d4 = resolveAudioVoiceSourceLocalPath(_0x436e7e || {});
    if (!_0x436e7e || !_0x1f25d4) {
      windowObject?.showToast?.(panelText("toasts.invalidSource"), "warn");
      return;
    }
    const _0x26e519 = String(_0x5290c1 || "").trim();
    const _0x3ed267 = _0x436e7e ? {
      ..._0x436e7e
    } : null;
    const _0x33b47a = a903_0x36767f(_0x3898eb).map(a903_0x2f01f3);
    const _0x34a7e5 = _0x2123cb.begin({
      kind: "compose-all",
      sourceNodeId: _0x26e519,
      segmentId: "all",
      segmentIds: ["all"]
    });
    if (!_0x34a7e5) {
      _0x37aea5(panelText("status.composing"));
      return;
    }
    const _0x3a8683 = {
      sourceKind: isAudioVoiceAudioNode(_0x3ed267) ? "audio" : "video",
      src: _0x1f25d4,
      clips: _0x123653,
      durationSec: resolveAudioVoiceComposeDurationSec(_0x3ed267, _0x33b47a),
      anchorNode: _0x3ed267,
      triggerEl: _0x1f17c1
    };
    const _0xe7f6e7 = _0x1845cb(_0x123653);
    _0xd7f30 = new Set(_0x123653.map(_0x4f6991 => _0x4f6991.id).filter(Boolean));
    const _0x14b699 = Promise.resolve().then(async () => {
      const _0x5dffb4 = composeTimeline === composeAudioVoiceTimelineNearNode ? await composeAudioVoiceTimelineNearNode({
        ..._0x3a8683
      }) : await composeTimeline(_0x3a8683);
      if (!_0x5dffb4) {
        return null;
      }
      if (!_0x2123cb.isCurrent(_0x34a7e5, _0x5290c1)) {
        return _0x5dffb4;
      }
      _0x33483a = _0xe7f6e7;
      _0x5454de();
      onComposeResult?.(_0x5dffb4, {
        sourceNodeId: _0x26e519,
        sourceNode: _0x3ed267,
        segments: _0x33b47a
      });
      Promise.resolve().then(() => playCompletion?.("audio-voice-compose")).catch(_0x3c9322 => {
        console.warn("[audioVoicePanel] completion sound failed", _0x3c9322);
      });
      return _0x5dffb4;
    });
    _0x302933 = _0x14b699;
    const _0x3f762c = [..._0xd7f30];
    _0x115620(_0x3f762c);
    try {
      return await _0x14b699;
    } catch (_0x5649f2) {
      if (!_0x2123cb.isCurrent(_0x34a7e5, _0x5290c1)) {
        return null;
      }
      windowObject?.showToast?.(_0x2e42ea(_0x5649f2, panelText("toasts.composeFailed")), "error");
      return null;
    } finally {
      _0x2123cb.finish(_0x34a7e5);
      if (_0x302933 === _0x14b699) {
        _0x302933 = null;
        _0xd7f30 = new Set();
        _0x115620(_0x3f762c);
      }
    }
  }
  async function _0x4f4902(_0x1ae2f0, _0x3777e5 = null) {
    if (_0x36fa8e()) {
      _0x37aea5(panelText("status.translating"));
      return null;
    }
    const _0xbb4dc = _0x653e63(_0x1ae2f0);
    const _0x1ce532 = _0x4ee2b5();
    if (!_0xbb4dc || _0x5ae42e !== "ready" || _0x1ce532.targets.length <= 0) {
      windowObject?.showToast?.(panelText("toasts.noTranslationText"), "warn");
      return null;
    }
    _0x2552b1();
    const _0x2382b5 = await _0x137d79({
      language: _0xbb4dc,
      count: _0x1ce532.targets.length,
      scope: _0x1ce532.scope,
      returnFocus: _0x3777e5
    });
    if (!_0x2382b5) {
      return null;
    }
    const _0x5b199d = _0x4ee2b5();
    if (_0x5b199d.targets.length <= 0) {
      windowObject?.showToast?.(panelText("toasts.noTranslationText"), "warn");
      return null;
    }
    const _0x283633 = ++_0x27c035;
    const _0x5a03e0 = _0x5290c1;
    const _0x248ed9 = _0x5b199d.targets.map(_0xd1f9a6 => ({
      ..._0xd1f9a6
    }));
    const _0x2ac82c = new Set(_0x248ed9.map(_0x3073c3 => _0x3073c3.id));
    _0x389809 = {
      id: _0x283633,
      languageId: _0xbb4dc.id,
      segmentIds: _0x2ac82c
    };
    _0x1e4cc4([..._0x2ac82c]);
    try {
      if (!(await _0x252d4b())) {
        return null;
      }
      const _0x5924b7 = await translateSegments({
        languageId: _0xbb4dc.id,
        segments: _0x248ed9
      });
      if (_0x389809?.id !== _0x283633) {
        return null;
      }
      const _0x3ce37a = new Map(_0x3898eb.map(_0x1c28e7 => [String(_0x1c28e7.id || "").trim(), _0x1c28e7]));
      const _0x422b55 = _0x5290c1 !== _0x5a03e0 || _0x248ed9.some(_0x14501f => {
        const _0x227a9f = _0x3ce37a.get(_0x14501f.id);
        return !_0x227a9f || _0x227a9f.status === "removed" || String(_0x227a9f.sourceText || "").trim() !== _0x14501f.sourceText;
      });
      if (_0x422b55) {
        windowObject?.showToast?.(panelText("toasts.translationStale"), "warn");
        return null;
      }
      const _0x234396 = new Map(_0x3898eb.filter(_0x1c4bf0 => _0x2ac82c.has(_0x1c4bf0.id)).map(_0x2771dc => [_0x2771dc.id, _0x2771dc]));
      _0x3898eb = applyAudioVoiceTranslationResults(_0x3898eb, _0x5924b7);
      _0x5454de();
      _0x4305e4(_0x234396, [..._0x2ac82c]);
      windowObject?.showToast?.(panelText("toasts.translationComplete", {
        count: _0x2ac82c.size,
        language: _0xbb4dc.label
      }), "success");
      return _0x5924b7;
    } catch (_0x5dd652) {
      if (_0x389809?.id !== _0x283633) {
        return null;
      }
      const _0x39d4b8 = _0x2e42ea(_0x5dd652, panelText("toasts.translationFailed"));
      const _0x4bd581 = classifyAudioVoiceTranslationConfigFailure(_0x5dd652);
      if (_0x4bd581) {
        _0x1456b7(_0x4bd581, _0x39d4b8);
      } else {
        windowObject?.showToast?.(panelText("toasts.translationFailedWithMessage", {
          message: _0x39d4b8
        }), "error");
      }
      return null;
    } finally {
      if (_0x389809?.id === _0x283633) {
        _0x389809 = null;
        _0x1e4cc4([..._0x2ac82c]);
      }
    }
  }
  async function _0x1bb4de() {
    if (!_0x436e7e) {
      windowObject?.showToast?.(panelText("toasts.selectSource"), "warn");
      return;
    }
    const _0x20d83b = _0x436e7e;
    const _0x147ec6 = String(_0x5290c1 || "").trim();
    if (_0x8ae442.isActiveFor(_0x147ec6)) {
      _0x37aea5(panelText("status.analyzing"));
      return;
    }
    const _0x34670e = resolveAudioVoiceSourceLocalPath(_0x20d83b);
    if (!_0x34670e) {
      windowObject?.showToast?.(panelText("toasts.invalidSource"), "warn");
      return;
    }
    _0x32c80e();
    const _0x569093 = resolveAudioVoiceAnalysisMemoryKey(_0x20d83b);
    const _0x400897 = _0x8ae442.begin({
      sourceNodeId: _0x147ec6,
      sourceKey: _0x569093
    });
    const _0x28366e = () => _0x8ae442.isCurrent(_0x400897) && String(_0x5290c1 || "").trim() === _0x147ec6;
    const _0x1b35aa = _0x569093 ? _0x1ef534.get(_0x569093) || resolveAudioVoicePersistedAnalysisSnapshot(_0x20d83b) : null;
    const _0x2e299e = normalizeAudioVoiceAsrProvider(_0xe13fd9);
    const _0x45a47c = _0x5ae42e;
    const _0x9fabb6 = _0x499810;
    _0x5ae42e = "analyzing";
    _0x499810 = {
      stage: _0x2e299e === AUDIO_VOICE_ASR_PROVIDER_IDS.FUNASR ? "model-download" : "model-prepare",
      progress: 0,
      message: panelText(_0x2e299e === AUDIO_VOICE_ASR_PROVIDER_IDS.FUNASR ? "progress.model-download" : "progress.model-prepare")
    };
    _0x276cb6();
    if (_0x2e299e === AUDIO_VOICE_ASR_PROVIDER_IDS.DOUBAO && !(await _0x37296d())) {
      if (!_0x28366e()) {
        return;
      }
      _0x5ae42e = _0x45a47c;
      _0x499810 = _0x9fabb6;
      _0x8ae442.complete(_0x400897);
      _0x276cb6();
      return;
    }
    if (!_0x28366e()) {
      return;
    }
    _0x8befa3.clear();
    _0x53b6fd = new Set();
    _0x3898eb = [];
    _0x30e3cd = "";
    _0xf0d5b4 = "";
    _0x276cb6();
    try {
      let _0x1e74a4 = {};
      if (_0x2e299e === AUDIO_VOICE_ASR_PROVIDER_IDS.FUNASR) {
        _0x1e74a4 = await prepareAudioVoiceLocalAsr({
          nodeId: _0x147ec6,
          onTaskStarted: _0x104a43 => {
            _0x8ae442.trackTask(_0x400897, _0x104a43);
            if (!_0x28366e()) {
              return;
            }
            _0x8befa3.install(_0x104a43, {
              progressScale: AUDIO_VOICE_ASR_RUNTIME_PROGRESS_SHARE
            });
          }
        });
        if (!_0x28366e()) {
          return;
        }
      }
      const _0x4186d4 = await enqueueElectronMediaTask({
        kind: "audioVoiceAnalyze",
        src: _0x34670e,
        nodeId: _0x147ec6,
        args: {
          asrProvider: _0x2e299e,
          ..._0x1e74a4,
          noiseDb: -35,
          minSilenceSec: 0.35,
          paddingMs: 80
        }
      });
      const _0xcc80e3 = String(_0x4186d4?.taskId || "").trim();
      if (!_0xcc80e3) {
        throw new Error(panelText("toasts.analysisFailed"));
      }
      if (!(await _0x8ae442.trackTask(_0x400897, _0xcc80e3)) || !_0x28366e()) {
        return;
      }
      _0x8befa3.install(_0xcc80e3, _0x2e299e === AUDIO_VOICE_ASR_PROVIDER_IDS.FUNASR ? {
        progressOffset: AUDIO_VOICE_ASR_RUNTIME_PROGRESS_SHARE,
        progressScale: 1 - AUDIO_VOICE_ASR_RUNTIME_PROGRESS_SHARE
      } : {});
      const _0x2066c5 = await waitForElectronMediaTask(_0xcc80e3, {
        timeout: ANALYZE_TASK_TIMEOUT_MS,
        diagnosticPayload: {
          kind: "audioVoiceAnalyze",
          src: _0x34670e,
          nodeId: _0x147ec6
        }
      });
      if (!_0x28366e()) {
        return;
      }
      _0x30e3cd = normalizeLocalPath(_0x2066c5?.sourceAudio?.localPath || "");
      _0xf0d5b4 = firstNonEmptyString(_0x2066c5?.sourceAudio?.url, localPathToUrl(_0x30e3cd));
      _0x5ae42e = "ready";
      _0x499810 = null;
      _0x8befa3.clear();
      _0x32ba70(normalizeAudioVoiceAnalyzeSegments(_0x2066c5));
      if (_0x2066c5?.asr?.fallbackReason === "empty") {
        windowObject?.showToast?.(panelText("toasts.noSubtitlesDetected"), "warn");
      }
      windowObject?.showToast?.(panelText("toasts.analysisComplete", {
        count: a903_0x36767f(_0x3898eb).length
      }), "success");
    } catch (_0x310f7e) {
      if (!_0x28366e()) {
        return;
      }
      _0x5ae42e = "error";
      _0x499810 = null;
      _0x8befa3.clear();
      if (_0x1b35aa) {
        _0x3898eb = _0x1b35aa.segments.map(a903_0x2f01f3);
        _0x30e3cd = normalizeLocalPath(_0x1b35aa.analysisSourceAudioLocalPath || "");
        _0xf0d5b4 = firstNonEmptyString(_0x1b35aa.analysisSourceAudioUrl, localPathToUrl(_0x30e3cd));
      } else {
        _0x3898eb = [];
      }
      _0x276cb6();
      const _0x5cf925 = _0x507477(_0x310f7e);
      if (_0x2e299e === AUDIO_VOICE_ASR_PROVIDER_IDS.DOUBAO && isVolcengineSpeechAsrAuthFailure(_0x5cf925)) {
        _0x55f930("invalid", _0x5cf925);
      } else {
        windowObject?.showToast?.(_0x5cf925, "error");
      }
    } finally {
      _0x8ae442.complete(_0x400897);
    }
  }
  async function _0x56cb55(_0x24a99d) {
    const _0x223bf6 = typeof resolveStartAnalyzeConfirmation === "function" ? await resolveStartAnalyzeConfirmation({
      sourceNodeId: _0x5290c1,
      sourceNode: _0x436e7e
    }) : null;
    if (_0x223bf6) {
      const _0x475a4c = await _0x6b1b9e({
        className: "audio-voice-start-analyze-confirm",
        ..._0x223bf6,
        returnFocus: _0x24a99d
      });
      if (!_0x475a4c) {
        return;
      }
    }
    await _0x1bb4de();
  }
  function _0x49f1b2(_0x44126b, _0x34dc38, _0x577748, _0x32d7f3 = {}) {
    if (_0x4e1dc6.hasPending() && (_0x4e1dc6.isReserved(_0x34dc38) || _0x4e1dc6.blocksGlobalAction(_0x44126b))) {
      _0x37aea5(panelText("status.merging"));
      _0x2552b1();
      return;
    }
    if (_0x36fa8e() && AUDIO_VOICE_TRANSLATION_BLOCKED_ACTIONS.has(_0x44126b)) {
      _0x37aea5(panelText("status.translating"));
      _0x2552b1();
      return;
    }
    if (_0x44126b === "show-asr-api-key-guide") {
      showVolcengineSpeechApiKeyGuide();
      return;
    }
    if (_0x44126b === "open-asr-api-key-settings") {
      openVolcengineSpeechApiKeySettings();
      return;
    }
    if (_0x44126b === "close-asr-config-alert") {
      _0x13f10c();
      return;
    }
    if (_0x44126b === "show-translation-api-key-guide") {
      showProviderApiKeyGuide(AUDIO_VOICE_TRANSLATION_PROVIDER_ID);
      return;
    }
    if (_0x44126b === "open-translation-api-key-settings") {
      openProviderApiKeySettings(AUDIO_VOICE_TRANSLATION_PROVIDER_ID);
      return;
    }
    if (_0x44126b === "close-translation-config-alert") {
      _0x4bcf30();
      return;
    }
    if (_0x44126b === "load-selected") {
      _0x5e5a26.startSourcePick();
      return;
    }
    if (_0x44126b === "start-analyze") {
      _0x56cb55(_0x577748);
      return;
    }
    if (_0x44126b === "toggle-menu") {
      const _0x56d66 = _0x577748.closest?.(".audio-voice-more-wrap");
      const _0x327bfe = _0x56d66?.classList?.contains?.("is-open");
      _0x2552b1();
      _0x56d66?.classList?.toggle?.("is-open", !_0x327bfe);
      return;
    }
    if (_0x44126b === "toggle-asr-settings") {
      const _0x4160cd = _0x577748.closest?.(".audio-voice-asr-settings");
      const _0x49d713 = _0x4160cd?.classList?.contains?.("is-open");
      _0x2552b1();
      _0x4160cd?.classList?.toggle?.("is-open", !_0x49d713);
      return;
    }
    if (_0x44126b === "toggle-translation") {
      const _0x5f3627 = _0x577748.closest?.(".audio-voice-translation-settings");
      const _0x39ac21 = _0x5f3627?.classList?.contains?.("is-open");
      _0x2552b1();
      _0x5f3627?.classList?.toggle?.("is-open", !_0x39ac21);
      _0x577748.setAttribute("aria-expanded", _0x39ac21 ? "false" : "true");
      return;
    }
    if (_0x44126b === "translate-language") {
      _0x4f4902(_0x577748.dataset.languageId, _0x577748);
      return;
    }
    if (_0x44126b === "select-asr-provider") {
      _0xe13fd9 = normalizeAudioVoiceAsrProvider(_0x577748.dataset.providerId);
      const _0x75b203 = !!_0x5649b1;
      if (_0xe13fd9 !== AUDIO_VOICE_ASR_PROVIDER_IDS.DOUBAO) {
        _0x5649b1 = null;
      }
      _0x2552b1();
      _0x7d74ae();
      if (_0x75b203) {
        _0x276cb6();
      }
      return;
    }
    if (_0x44126b === "toggle-global-settings") {
      const _0x229adf = _0x577748.closest?.(".audio-voice-global-settings");
      const _0x39b1a0 = _0x229adf?.classList?.contains?.("is-open");
      _0x2552b1();
      _0x229adf?.classList?.toggle?.("is-open", !_0x39b1a0);
      return;
    }
    if (_0x44126b === "select-global-model") {
      const _0x536f57 = String(_0x577748.dataset.modelId || "").trim();
      if (_0x536f57) {
        _0x3dfa10 = _0x536f57;
      }
      _0x2552b1();
      _0x5ca535();
      _0x20cef8();
      return;
    }
    if (_0x44126b === "select-segment-model") {
      const _0x38de20 = String(_0x577748.dataset.modelId || "").trim();
      _0x25f9d6(_0x34dc38, {
        voiceModelId: _0x38de20,
        voiceModelSelectionMode: _0x38de20 ? "segment" : "global"
      });
      _0x2552b1();
      return;
    }
    if (_0x44126b === "select-all") {
      _0x53b6fd = _0x3cf249() ? new Set() : new Set(a903_0x36767f(_0x3898eb).map(_0x2713ee => _0x2713ee.id));
      _0x545178();
      return;
    }
    if (_0x44126b === "voice") {
      _0x5e5a26.startAudioPick(AUDIO_VOICE_BATCH_AUDIO_PICK_ID);
      return;
    }
    if (_0x44126b === "toggle-select") {
      _0x31631d(_0x34dc38);
      return;
    }
    if (_0x44126b === "toggle-history") {
      const _0x15a389 = _0x577748.closest?.(".audio-voice-history-wrap");
      const _0x2ece51 = _0x15a389?.classList?.contains?.("is-open");
      _0x2552b1();
      _0x15a389?.classList?.toggle?.("is-open", !_0x2ece51);
      return;
    }
    if (_0x44126b === "use-history") {
      const _0x5084ac = _0x1a42d7(_0x34dc38, _0x577748.dataset.historyId);
      if (!_0x5084ac) {
        return;
      }
      _0x25f9d6(_0x34dc38, {
        convertedAudioLocalPath: _0x5084ac.localPath,
        convertedAudioUrl: _0x5084ac.audioUrl,
        convertedAudioDuration: pickAudioDurationSec(_0x5084ac.audioDuration, _0x5084ac.duration),
        convertedAudioReady: true,
        activeAudio: "converted",
        status: "ready",
        error: ""
      });
      _0x2552b1();
      return;
    }
    if (_0x44126b === "play-history") {
      const _0xf67909 = _0x1a42d7(_0x34dc38, _0x577748.dataset.historyId);
      if (_0xf67909) {
        _0x492d83(_0xf67909.audioUrl);
      }
      return;
    }
    if (_0x44126b === "merge") {
      _0x4e1dc6.merge(_0x34dc38);
      return;
    }
    if (_0x44126b === "insert") {
      _0x3db28d(_0x34dc38);
      return;
    }
    if (_0x44126b === "play-source") {
      _0x12a0b6(_0x34dc38, "source");
      return;
    }
    if (_0x44126b === "generate") {
      const _0x120b61 = _0x3898eb[_0x47b79d(_0x34dc38)];
      if (_0x120b61 && shouldAllowCancel(_0x2a8548(_0x120b61), {
        cancellable: _0x1c8156(_0x120b61),
        cancelInFlight: _0x16ffc9.isCancelInFlight(_0x5290c1, _0x34dc38)
      })) {
        _0x1f7e0f(_0x34dc38);
      } else {
        _0xa91ca2(_0x34dc38);
      }
      return;
    }
    if (_0x44126b === "play-converted") {
      _0x12a0b6(_0x34dc38, "converted");
      return;
    }
    if (_0x44126b === "batch-generate") {
      _0x1e3d07();
      return;
    }
    if (_0x44126b === "cancel-batch-generation") {
      _0x254765();
      return;
    }
    if (_0x44126b === "compose-all") {
      _0x148e71(_0x577748);
      return;
    }
    if (_0x44126b === "use-converted") {
      _0x25f9d6(_0x34dc38, {
        activeAudio: "converted"
      });
      _0x2552b1();
      return;
    }
    if (_0x44126b === "use-source") {
      _0x25f9d6(_0x34dc38, {
        activeAudio: "source"
      });
      _0x2552b1();
      return;
    }
    if (_0x44126b === "download-source") {
      _0x1760ea(_0x34dc38, "source");
      _0x2552b1();
      return;
    }
    if (_0x44126b === "download-converted") {
      _0x1760ea(_0x34dc38, "converted");
      _0x2552b1();
      return;
    }
    if (_0x44126b === "edit-source") {
      _0x584e47(_0x34dc38);
      return;
    }
    if (_0x44126b === "audio-param") {
      _0x5e5a26.startAudioPick(_0x34dc38);
      return;
    }
    if (_0x44126b === "clear-audio-param") {
      const _0x301ad2 = resolveAudioVoiceSelectionTargetIds(_0x34dc38, _0x53b6fd, a903_0x36767f(_0x3898eb));
      const _0x51fc20 = new Set(_0x301ad2);
      if (_0x51fc20.size <= 0) {
        return;
      }
      _0x3898eb = _0x3898eb.map(_0x1ee3d5 => _0x51fc20.has(_0x1ee3d5.id) ? {
        ..._0x1ee3d5,
        voiceRefNodeId: "",
        voiceRefAudioLocalPath: "",
        voiceRefAudioUrl: "",
        voiceRefName: "",
        voiceRefImageUrl: "",
        imitateToneEnabled: false,
        error: ""
      } : _0x1ee3d5);
      _0x5454de();
      _0x276cb6();
      return;
    }
    if (_0x44126b === "toggle-imitate-tone") {
      const _0x478307 = _0x3898eb[_0x47b79d(_0x34dc38)];
      if (!_0x478307) {
        return;
      }
      _0x44b283(_0x34dc38, _0x478307.imitateToneEnabled !== true);
      return;
    }
    if (_0x44126b === "remove") {
      const _0xab0430 = a903_0x36767f(_0x3898eb);
      const _0x3fea7b = _0xab0430.findIndex(_0xe37b80 => _0xe37b80.id === _0x34dc38);
      const _0x5abf76 = _0xab0430[_0x3fea7b + 1] || _0xab0430[_0x3fea7b - 1] || null;
      _0x5c74a3("remove-shift", _0x5abf76 ? [_0x5abf76.id] : []);
      _0x32ba70(_0x3898eb.filter(_0x135111 => _0x135111.id !== _0x34dc38));
      return;
    }
    _0x37aea5();
    _0x2552b1();
  }
  const _0x128a2b = createAudioVoiceSegmentContextMenuController({
    panel: _0x47ce8e,
    getSegment: _0x1a493b => _0x3898eb[_0x47b79d(_0x1a493b)],
    buildItems: getAudioVoiceSegmentContextMenuItems,
    onAction: _0x49f1b2,
    closeInlineMenus: _0x2552b1
  });
  const _0x3346a6 = _0x509dec => {
    _0x509dec.stopPropagation();
    _0x1a5611();
  };
  _0x54f10b.addEventListener("click", _0x3346a6);
  _0x5bf50e.addEventListener("click", _0x544432);
  _0x5d9176.addEventListener("pointerdown", _0x59fb67);
  _0x5d9176.addEventListener("keydown", _0x430312 => {
    if (_0x430312.key !== "ArrowLeft" && _0x430312.key !== "ArrowRight") {
      return;
    }
    _0x430312.preventDefault?.();
    const _0x27f5f2 = _0x47ce8e.getBoundingClientRect?.().width || _0x47ce8e.offsetWidth || 0;
    const _0x5b4190 = _0x430312.key === "ArrowLeft" ? 24 : -24;
    _0x357772(_0x27f5f2 + _0x5b4190, {
      persist: true
    });
  });
  _0x47ce8e.addEventListener("pointerdown", _0x34f438 => {
    _0x34f438.stopPropagation();
  });
  _0x47ce8e.addEventListener("input", _0x205e8c => {
    const _0x1b95fb = _0x205e8c.target?.closest?.("[data-audio-voice-text-input]");
    if (!_0x1b95fb) {
      return;
    }
    const _0x509987 = _0x1b95fb.dataset.segmentId || "";
    if (_0x58f156(_0x509987)) {
      const _0x5c2b4d = _0x3898eb[_0x47b79d(_0x509987)];
      _0x1b95fb.value = _0x1b95fb.dataset.audioVoiceTextKind === "converted" ? String(_0x5c2b4d?.targetText || _0x5c2b4d?.sourceText || "") : String(_0x5c2b4d?.sourceText || "");
      return;
    }
    _0x275625(_0x509987, _0x1b95fb.value, _0x1b95fb.dataset.audioVoiceTextKind);
  });
  _0x47ce8e.addEventListener("focusout", _0x564711 => {
    const _0x4d35a0 = _0x564711.target?.closest?.("[data-audio-voice-text-input]");
    if (!_0x4d35a0 || _0x4d35a0.dataset.audioVoiceTextKind !== "converted") {
      return;
    }
    const _0x26bd11 = String(_0x4d35a0.dataset.segmentId || "").trim();
    windowObject?.setTimeout?.(() => {
      const _0xf2a06d = document?.activeElement?.closest?.("[data-audio-voice-text-input]");
      if (_0xf2a06d?.dataset.segmentId === _0x26bd11) {
        return;
      }
      _0x3f3aaa(_0x26bd11);
    }, 0);
  });
  _0x47ce8e.addEventListener("click", _0x48558d => {
    const _0x274254 = _0x48558d.target?.closest?.("[data-audio-voice-action]");
    if (!_0x274254) {
      const _0x52d91f = _0x48558d.target?.closest?.(".audio-voice-segment-card");
      const _0x510ea7 = _0x48558d.target?.closest?.("button, input, textarea, select, .audio-voice-more-menu, .audio-voice-history-menu, .audio-voice-global-settings-menu, .audio-voice-asr-settings-menu, .audio-voice-translation-menu");
      if (_0x52d91f && !_0x510ea7) {
        _0x48558d.stopPropagation?.();
        if (_0x4e1dc6.isReserved(_0x52d91f.dataset.segmentId || "")) {
          _0x37aea5(panelText("status.merging"));
          return;
        }
        _0x31631d(_0x52d91f.dataset.segmentId || "");
        return;
      }
      if (!_0x48558d.target?.closest?.(".audio-voice-more-menu, .audio-voice-history-menu, .audio-voice-global-settings-menu, .audio-voice-asr-settings-menu, .audio-voice-translation-menu")) {
        _0x2552b1();
      }
      return;
    }
    if (_0x274254.disabled) {
      return;
    }
    _0x48558d.stopPropagation?.();
    _0x49f1b2(_0x274254.dataset.audioVoiceAction, _0x274254.dataset.segmentId || "", _0x274254, _0x48558d);
  });
  _0x47ce8e.addEventListener("keydown", _0x82dd6c => {
    const _0x285b38 = _0x82dd6c.target?.closest?.("[data-audio-voice-text-input]");
    if (_0x285b38 && _0xa1c696(_0x82dd6c, _0x285b38)) {
      return;
    }
    if (_0x82dd6c.key !== "Enter" && _0x82dd6c.key !== " ") {
      return;
    }
    const _0x1fea74 = _0x82dd6c.target?.closest?.("[data-audio-voice-action=\"toggle-select\"]");
    if (!_0x1fea74) {
      return;
    }
    _0x82dd6c.preventDefault?.();
    _0x49f1b2("toggle-select", _0x1fea74.dataset.segmentId || "", _0x1fea74);
  });
  const _0xc5909a = _0xcc561f => {
    _0x19d9df(_0xcc561f?.detail || {});
  };
  if (!embedded) {
    windowObject?.addEventListener?.(AUDIO_VOICE_PANEL_OPEN_EVENT, _0xc5909a);
  }
  _0x276cb6();
  return {
    panel: _0x47ce8e,
    open: _0x19d9df,
    close: _0x544432,
    toggle: _0x1a5611,
    setWidth: _0x541d5d => _0x357772(_0x541d5d, {
      persist: true
    }),
    getSourceNodeId: () => _0x5290c1,
    getSegments: () => a903_0x36767f(_0x3898eb).map(a903_0x2f01f3),
    canSelectAudioReference: _0x5e5a26.canSelectAudioReference,
    selectAudioReference: _0x5e5a26.selectAudioReference,
    destroy() {
      _0x128a2b.destroy();
      _0x544432();
      _0x1db571.destroy();
      _0x5e5a26.destroy();
      _0x54f10b.removeEventListener?.("click", _0x3346a6);
      windowObject?.removeEventListener?.(AUDIO_VOICE_PANEL_OPEN_EVENT, _0xc5909a);
      _0x47ce8e.remove?.();
      _0x18be50.remove?.();
    }
  };
}
