import { getDefaultDreaminaImageModelId, getDreaminaImageModelVersion, isDreaminaImageModel, normalizeDreaminaImageAspectRatio, normalizeDreaminaImageModel, normalizeDreaminaImageSize } from "./dreaminaModelMenuHelper.js";
import { setNodeMediaLodHoverPromoted } from "../../modules/canvasImageLod.js";
import { NANO_BANANA_FAMILIES, resolveNanoBananaModelBySelection, resolveNanoBananaSelectionFromModel } from "../../modules/nanoBananaModeRules.js";
import { getRatioCapability, isAdaptiveRatioLabel, parseRatioLabel, pickClosestRatioForProviderModel, resolveAdaptiveSourceSize, resolveProviderRatioPayload } from "../../../api/imageRatioPolicy.js";
import { appendAssetMentionToPrompt, getPromptInputSubmitLabelFromPillNode, getPromptAssetInputRefsFromNode, insertPresetPromptIntoEditor, isRunningHubWorkflowNode, previewPresetPromptInEditor, shouldUsePromptPreviewForPreset } from "../../modules/nodePromptShared.js";
import { getFixedInputSlotConfigFromManifest } from "../../modules/fixedInputAssetRefs.js";
import { getPromptPresetTemplateEmptyInputMessage, requiresPromptPresetInput, resolvePromptPresetTemplate } from "../../modules/promptPresetTemplate.js";
import { normalizeImageSizeForProviderModel } from "../../modules/imageModelCapabilities.js";
import { getRunningHubTaskProviderProfileId, normalizeRunningHubModelApiProfileId } from "../../modules/runningHubProviderProfiles.js";
import { resolveModelGenerationProviderProfileId } from "../../modules/modelProviderProfileSelection.js";
import { getGenerationRatioSizeWithDom, pickGenerationRatioSourceEdge } from "../../modules/generationRatioSource.js";
import { getTargetInputPolicy, isRhPersonReplaceWorkflowModel, isRhQwenImageEditModel, isInputKindAllowed, resolveEffectiveInputKind } from "../../modules/modelInputPolicy.js";
import { getModelManifest, isModelApiModel, isWorkflowModel, resolveModelExecution, resolveModelProvider, sanitizeModelUiSchemaParams } from "../../manifests/index.js";
import { evaluateGenerationPromptBoundary } from "../../modules/generationPromptPolicy.js";
import { showProviderApiKeyMissingToast, showProviderApiKeyMissingToastForError } from "../../modules/providerApiKeyMissingToast.js";
import { guardModelGenerationCredentials } from "../../modules/modelCredentialUi.js";
import { showCliLoginMissingToast } from "../../modules/cliLoginMissingToast.js";
import { buildFixedSlotOccupancy, countManifestInputRecords, getMissingManifestInputRequirement } from "./manifestInputRequirements.js";
import { isPreviewModeEnabled, isPreviewNodeLoading, startPreviewNodeLoading } from "../../modules/previewMode.js";
import { createPreviewGenerateButtonCallbacks, resetGenerateButtonIdleUi, setGenerateButtonCancellableUi, setGenerateButtonLoadingUi } from "../../modules/previewGenerateButtonUi.js";
import { buildGenerationCancelledPatch, buildGenerationStartPatch } from "../../core/generationTaskLifecycle.js";
import { cancelTask, resumeTask, shouldPreserveGenerationTaskOnUnmount, submitTask } from "../../core/generationTaskRuntime.js";
import { createGenerationCancelPlanFromNode, createGenerationResumePlanFromNode, createGenerationSubmitPlan } from "../../core/generationExecutionPlan.js";
import { getGenerationErrorMessage, isGenerationAbortError } from "../../core/generationTaskErrorState.js";
import { buildAsyncTaskPatch, buildDreaminaTaskPatch, buildRunningHubTaskPatch } from "../../core/generationTaskProtocolState.js";
import { shouldAllowCancel, shouldShowGenerationBusyUi } from "../../core/generationTaskUiState.js";
import { resolveGenerationInputImageUrl } from "../../services/imageReferenceUrlService.js";
import { logDiagnosticEvent } from "../../services/diagnosticsService.js";
import { createPayloadObjectUrlLease, releasePayloadObjectUrlLease } from "../../services/payloadObjectUrlLease.js";
import { GENERATION_HISTORY_EVENT } from "../../modules/generationHistoryAssets.js";
import { buildImageGenerationFailurePatch, buildImageGenerationResultPatch, getImageGenerationResultError, getSuccessfulImageGenerationItems, normalizeImageGenerationResult } from "./imageGenerationResultRenderer.js";
import { getImageInputGateMissingMessage, getImageInputGateUploadedUrl, getImageNodeInputGate, shouldUseImageWorkflowBusyButton } from "./imageNodeManifestPolicies.js";
import { t } from "../../i18n/index.js";
import { isCustomAiAppManifest, shouldAllowEmptyCustomAiAppInputs } from "../shared/rhAiAppNodeBehavior.js";
const DREAMINA_STALE_ACTIVE_RESUME_MS = 15000;
const DREAMINA_NON_RECOVERABLE_STATUSES = new Set(["cancelled", "canceled", "complete", "completed", "done", "error", "fail", "failed", "finish", "finished", "idle", "success", "succeeded"]);
const DREAMINA_NON_RECOVERABLE_PHASES = new Set(["cancelled", "canceled", "complete", "completed", "done", "error", "fail", "failed", "finish", "finished", "success", "succeeded"]);
const ASYNC_IMAGE_MODEL_API_PROVIDERS = new Set(["apimart", "grsai", "ppio"]);
function normalizeTaskStatus(_0x27cc49) {
  return String(_0x27cc49 || "").trim().toLowerCase();
}
function isAsyncImageModelApiProvider(_0x2498cd) {
  return ASYNC_IMAGE_MODEL_API_PROVIDERS.has(String(_0x2498cd || "").trim().toLowerCase());
}
function getImageProviderApiKeyMissingMessage(_0x54d226 = {}) {
  if (String(_0x54d226?.apiKey || "").trim()) {
    return "";
  }
  const _0x1c6447 = String(_0x54d226?.provider || "").trim().toLowerCase();
  if (!_0x1c6447) {
    return "";
  }
  if (_0x1c6447 === "volcengine") {
    return t("aigenImage.task.apiKeyMissing.volcengine");
  }
  if (_0x1c6447 === "runninghub") {
    if (isModelApiModel(_0x54d226?.model, "runninghub")) {
      return t("aigenImage.task.apiKeyMissing.runninghubModel");
    } else {
      return t("aigenImage.task.apiKeyMissing.runninghub");
    }
  }
  if (_0x1c6447 === "runninghubwf") {
    return t("aigenImage.task.apiKeyMissing.runninghub");
  }
  if (_0x1c6447 === "apimart") {
    return t("aigenImage.task.apiKeyMissing.apimart");
  }
  if (_0x1c6447 === "ppio") {
    return t("aigenImage.task.apiKeyMissing.ppio");
  }
  if (_0x1c6447 === "grsai") {
    return t("aigenImage.task.apiKeyMissing.grsai");
  }
  return "";
}
const REFERENCE_LABEL_ALIASES = Object.freeze({
  text: Object.freeze(["文本", "Text"]),
  image: Object.freeze(["图片", "Image"]),
  video: Object.freeze(["视频", "Video"]),
  audio: Object.freeze(["音频", "Audio"])
});
function getReferenceTypeLabel(_0x83db76) {
  const _0x28ef8a = {
    text: t("aigenImage.refs.types.text"),
    image: t("aigenImage.refs.types.image"),
    video: t("aigenImage.refs.types.video"),
    audio: t("aigenImage.refs.types.audio")
  };
  return _0x28ef8a[_0x83db76] || String(_0x83db76 || "");
}
function buildReferenceLabelAliases(_0x20bbca, _0xca85eb) {
  const _0x4b55de = ["@" + getReferenceTypeLabel(_0x20bbca) + _0xca85eb, ...(REFERENCE_LABEL_ALIASES[_0x20bbca] || []).map(_0x3ed5bc => "@" + _0x3ed5bc + _0xca85eb)];
  return Array.from(new Set(_0x4b55de));
}
function createSchemaParamAccess({
  model: _0x606dd9,
  data: _0x2e9255,
  generationParams: _0x244a30,
  manifestFields: _0xd99317
}) {
  const _0x211b3a = _0x331df7 => _0xd99317.find(_0x54d5ab => String(_0x54d5ab?.id || "") === _0x331df7) || null;
  const _0x26b180 = _0x3ee0bf => {
    const _0x4036bc = _0x211b3a(_0x3ee0bf);
    if (!_0x4036bc) {
      return undefined;
    }
    if (_0x244a30[_0x3ee0bf] !== undefined) {
      return _0x244a30[_0x3ee0bf];
    }
    if (_0x2e9255 && typeof _0x2e9255 === "object" && !Array.isArray(_0x2e9255) && _0x2e9255[_0x3ee0bf] !== undefined) {
      return _0x2e9255[_0x3ee0bf];
    }
    return _0x4036bc.defaultValue;
  };
  const _0x10b6f5 = _0x47cac4 => {
    const _0x4382d1 = _0x26b180(_0x47cac4);
    if (_0x4382d1 === undefined || _0x4382d1 === null || String(_0x4382d1).trim() === "") {
      throw new Error("Manifest model " + _0x606dd9 + " missing " + _0x47cac4);
    }
    return _0x4382d1;
  };
  return {
    getManifestField: _0x211b3a,
    readSchemaParam: _0x26b180,
    requireSchemaParam: _0x10b6f5
  };
}
function isGrsaiGptImage2Model(_0xb56229, _0x4e9221) {
  const _0x58cb5a = resolveNanoBananaSelectionFromModel(_0x4e9221, "2K", _0xb56229 || "grsai");
  return _0x58cb5a?.provider === "grsai" && _0x58cb5a.family === NANO_BANANA_FAMILIES.GPT_IMAGE_2;
}
function resolveGrsaiGptImage2ModelForSize({
  provider: _0x1136ca,
  model: _0x468eeb,
  imageSize: _0xf0ff7a
} = {}) {
  if (!isGrsaiGptImage2Model(_0x1136ca, _0x468eeb)) {
    return _0x468eeb;
  }
  const _0x50b925 = String(_0xf0ff7a || "1K").trim().toUpperCase();
  const _0x21c718 = resolveModelExecution(_0x468eeb, {
    providerHint: "grsai"
  }) || resolveModelExecution(resolveNanoBananaSelectionFromModel(_0x468eeb, _0x50b925, "grsai")?.model, {
    providerHint: "grsai"
  });
  const _0x2c4f61 = _0x21c718?.executionManifest?.imageSizeModels;
  if (!_0x2c4f61 || typeof _0x2c4f61 !== "object") {
    return _0x468eeb;
  }
  return _0x2c4f61[_0x50b925] || _0x2c4f61.default || _0x21c718?.modelManifest?.modelId || _0x468eeb;
}
function resolveImageSizeForProviderModel({
  provider: _0x2b9050,
  model: _0x3853a7,
  imageSize: _0x216cb7
} = {}) {
  const _0x431bb5 = normalizeImageSizeForProviderModel({
    provider: _0x2b9050,
    model: _0x3853a7,
    imageSize: _0x216cb7
  });
  if (_0x431bb5) {
    return _0x431bb5;
  }
  if (!String(_0x216cb7 || "").trim() && String(_0x2b9050 || "").trim().toLowerCase() === "runninghub" && String(_0x3853a7 || "").trim() === "runninghub-model/rhart-image-g") {
    return "1K";
  }
  const _0x3983b6 = String(_0x216cb7 || (isGrsaiGptImage2Model(_0x2b9050, _0x3853a7) ? "1K" : "2K")).trim().toUpperCase();
  return _0x3983b6 || "2K";
}
function sanitizeTaskGenerationParams(_0x32c970, _0x3b9e0c = {}) {
  const _0x6615ef = _0x3b9e0c && typeof _0x3b9e0c === "object" && !Array.isArray(_0x3b9e0c) ? _0x3b9e0c : {};
  const _0x5bca1c = sanitizeModelUiSchemaParams(_0x32c970, _0x6615ef, {
    includeDefaults: false
  });
  if (Object.prototype.hasOwnProperty.call(_0x6615ef, "aspectRatio")) {
    _0x5bca1c.aspectRatio = _0x6615ef.aspectRatio;
  }
  return {
    ..._0x6615ef,
    ..._0x5bca1c
  };
}
function normalizeTaskBooleanParam(_0x595716) {
  if (_0x595716 === true || _0x595716 === false) {
    return _0x595716;
  }
  const _0x19f899 = String(_0x595716 ?? "").trim().toLowerCase();
  if (["true", "1", "yes", "on"].includes(_0x19f899)) {
    return true;
  }
  if (["false", "0", "no", "off", ""].includes(_0x19f899)) {
    return false;
  }
  return Boolean(_0x595716);
}
function hasOwnObjectField(_0x24843a, _0x2b3739) {
  return _0x24843a && typeof _0x24843a === "object" && !Array.isArray(_0x24843a) && Object.prototype.hasOwnProperty.call(_0x24843a, _0x2b3739);
}
function normalizeImageBatchSize(_0x2e2632, _0x247ea9 = 1) {
  const _0x656991 = Number.parseInt(_0x2e2632, 10);
  if (!Number.isFinite(_0x656991) || _0x656991 < 1) {
    return _0x247ea9;
  }
  return _0x656991;
}
function resolveImageNodeBatchSize({
  data = {},
  generationParams = {},
  rawGenerationParams = {}
} = {}) {
  const _0x463c2c = hasOwnObjectField(data, "batchSize");
  const _0x1b3fad = normalizeImageBatchSize(data?.batchSize, 1);
  if (hasOwnObjectField(generationParams, "batchSize")) {
    return normalizeImageBatchSize(generationParams.batchSize, _0x1b3fad);
  }
  if (hasOwnObjectField(rawGenerationParams, "batchSize")) {
    return normalizeImageBatchSize(rawGenerationParams.batchSize, _0x1b3fad);
  }
  if (_0x463c2c) {
    return _0x1b3fad;
  } else {
    return 1;
  }
}
const IMAGE_PAYLOAD_SCHEMA_PARAM_EXCLUDES = Object.freeze(new Set(["mode", "rhModelRoute", "imageSize", "aspectRatio", "batchSize", "google_search", "google_image_search"]));
function buildImageSchemaPayloadParams({
  enabled: _0x5a6a6e,
  manifestFields: _0x19b3c3,
  readSchemaParam: _0x182ef8
} = {}) {
  if (!_0x5a6a6e || !Array.isArray(_0x19b3c3)) {
    return {};
  }
  return _0x19b3c3.reduce((_0x27b826, _0x54408e) => {
    const _0x4b1c12 = String(_0x54408e?.id || "").trim();
    if (!_0x4b1c12 || IMAGE_PAYLOAD_SCHEMA_PARAM_EXCLUDES.has(_0x4b1c12)) {
      return _0x27b826;
    }
    _0x27b826[_0x4b1c12] = _0x182ef8(_0x4b1c12);
    return _0x27b826;
  }, {});
}
function reorderImageInputUrlsByRefOrder(_0x58312b = [], _0x119d7c = []) {
  const _0x139951 = (Array.isArray(_0x58312b) ? _0x58312b : []).map(_0x47e269 => String(_0x47e269 || "").trim()).filter(Boolean);
  if (_0x139951.length <= 1) {
    return _0x139951;
  }
  const _0xda296a = new Set(_0x139951);
  const _0x4574c7 = [];
  const _0x22f0a0 = _0x121df8 => {
    const _0x275991 = String(_0x121df8 || "").trim();
    if (!_0x275991 || !_0xda296a.has(_0x275991)) {
      return;
    }
    _0x4574c7.push(_0x275991);
    _0xda296a.delete(_0x275991);
  };
  (Array.isArray(_0x119d7c) ? _0x119d7c : []).forEach(_0x85750d => {
    _0x22f0a0(_0x85750d?.url);
  });
  _0x139951.forEach(_0x22f0a0);
  return _0x4574c7;
}
function buildInputUrlsByFixedImageSlot({
  fixedInputConfig = null,
  imageRefs = [],
  assetInputRefs = []
} = {}) {
  const _0x55cae1 = (fixedInputConfig?.visibleSlots || []).map(_0xf2441c => String(_0xf2441c || "").trim()).filter(_0x5b5e0f => _0x5b5e0f && String(fixedInputConfig?.slotKindById?.[_0x5b5e0f] || "") === "image");
  if (_0x55cae1.length === 0) {
    return {};
  }
  const _0x43abf5 = {};
  const _0x7bfc83 = new Set();
  const _0x30d808 = (_0x1826dc, _0x2e174c) => {
    const _0x1ad84c = String(_0x1826dc || "").trim();
    const _0x1afbda = String(_0x2e174c || "").trim();
    if (!_0x1ad84c || !_0x1afbda || _0x43abf5[_0x1ad84c]) {
      return false;
    }
    if (!_0x55cae1.includes(_0x1ad84c)) {
      return false;
    }
    _0x43abf5[_0x1ad84c] = _0x1afbda;
    _0x7bfc83.add(_0x1afbda);
    return true;
  };
  const _0x1f25f4 = _0x4e73de => {
    const _0x124184 = String(_0x4e73de || "").trim();
    if (!_0x124184 || _0x7bfc83.has(_0x124184)) {
      return false;
    }
    const _0x38f022 = _0x55cae1.find(_0xc1bd29 => !_0x43abf5[_0xc1bd29]);
    return _0x30d808(_0x38f022, _0x124184);
  };
  (Array.isArray(imageRefs) ? imageRefs : []).forEach(_0xb53788 => {
    _0x30d808(_0xb53788?.refSlot, _0xb53788?.url);
  });
  (Array.isArray(assetInputRefs) ? assetInputRefs : []).forEach(_0x308cc2 => {
    _0x30d808(_0x308cc2?.refSlot, _0x308cc2?.url);
  });
  (Array.isArray(imageRefs) ? imageRefs : []).forEach(_0x23a63c => {
    _0x1f25f4(_0x23a63c?.url);
  });
  (Array.isArray(assetInputRefs) ? assetInputRefs : []).forEach(_0x526f47 => {
    const _0x3dc269 = resolveEffectiveInputKind(_0x526f47) || _0x526f47?.type;
    if (_0x3dc269 === "image") {
      _0x1f25f4(_0x526f47?.url);
    }
  });
  return _0x43abf5;
}
export function createAIGenerateNodeTaskOrchestrationModule(_0x5943a3) {
  const {
    store: _0x5852a4,
    api: _0x57b846,
    getDisplayModelName: _0x32a08f,
    _handlePillHover: _0x1b7455,
    _handlePillOut: _0x5c1e5d,
    _syncEdgesOrderFromPills: _0x3e550d,
    _syncPillLabels: _0x4f26f1,
    _checkAtTrigger: _0x4f3d4b,
    _populateMentionMenu: _0x3a44e7,
    _insertMentionPill: _0xad78b9,
    _handlePillKeyboard: _0xa76234,
    _rehydratePromptPills: _0x508d41,
    _handleMentionMenuKeyboard: _0x847ed0,
    TEXT_TOOLBAR_HTML: _0x633840,
    bindTextToolbarEvents: _0x166e7d,
    IMAGE_TOOLBAR_HTML: _0x4542b6,
    bindImageToolbarEvents: _0x17c937,
    showDevToast: _0x2ee227,
    getImage: _0x55f139,
    openNodeImagePreview: _0x16557c,
    getPromptPresets: _0x14352c,
    openCustomPresetsManager: _0x221f7a,
    startLoading: _0x576eb5,
    stopLoading: _0x15de9c,
    bindRefThumbHoverPreview: _0x2e970b,
    ensureThumbDecoded: _0x59d151,
    revealRefThumbMedia: _0x4f9a1d,
    getRefKindByNodeType: _0x5932f1,
    uploadFile: _0x3e844a,
    ensureConfig: _0x1ea311,
    getProviderConfig: _0x4c4f74,
    generateId: _0x57a7a0,
    checkSlashTrigger: _0x3eab11,
    handleSlashKeyboardNavigation: _0x2f3557,
    closeSlashMenu: _0x177f9d,
    activateMenuKeyboard: _0x830edd,
    ImageFreeAngleController: _0x8f2daa
  } = _0x5943a3;
  const _0x410a85 = () => typeof _0x5852a4.getStateRaw === "function" ? _0x5852a4.getStateRaw() : _0x5852a4.getState();
  const _0x40ea98 = (_0x5d3c93, _0x58f123) => _0x5d3c93?.getTaskNode?.() || _0x5852a4.getState().nodes?.[_0x58f123] || {};
  const _0x40bba9 = (_0x50333c, _0x1e47aa, _0x983fcd) => {
    if (typeof _0x50333c?.updateTaskNode === "function") {
      return _0x50333c.updateTaskNode(_0x983fcd);
    }
    _0x5852a4.updateNodeData(_0x1e47aa, _0x983fcd);
    return true;
  };
  class _0x4c5f7a {
    _persistRunningHubResumeCache() {
      try {
        window._triggerLocalCacheSave?.();
      } catch {}
    }
    _persistDreaminaResumeCache() {
      this._persistRunningHubResumeCache();
    }
    _persistAsyncResumeCache() {
      this._persistRunningHubResumeCache();
    }
    _isDreaminaImageNode(_0x2297be = this._data) {
      return resolveModelProvider(_0x2297be?.model, _0x2297be?.provider) === "dreamina";
    }
    async _ensureDreaminaCliLoggedIn(_0x17fc48 = this._data) {
      if (!this._isDreaminaImageNode(_0x17fc48)) {
        return true;
      }
      const _0x52b87e = _0x57b846?.getCachedDreaminaCliStatus?.();
      if (_0x52b87e?.loggedIn === true) {
        return true;
      }
      if (_0x52b87e?.loggedIn === false) {
        showCliLoginMissingToast(t("aigenImage.task.dreaminaLoginRequired"), {
          providerId: "dreamina",
          actionLabel: t("aigenImage.task.openSettings")
        });
        return false;
      }
      const _0x3906da = _0x57b846?.fetchDreaminaCliStatusFromServer;
      if (typeof _0x3906da !== "function") {
        showCliLoginMissingToast(t("aigenImage.task.dreaminaLoginStatusUnavailable"), {
          providerId: "dreamina",
          actionLabel: t("aigenImage.task.openSettings")
        });
        return false;
      }
      try {
        const _0x485f92 = await _0x3906da({
          refresh: false
        });
        if (_0x485f92?.loggedIn === true) {
          return true;
        }
        showCliLoginMissingToast(t("aigenImage.task.dreaminaLoginRequired"), {
          providerId: "dreamina",
          actionLabel: t("aigenImage.task.openSettings")
        });
        return false;
      } catch (_0x59b847) {
        console.warn("[AIGenerateNode] 检查即梦 CLI 登录状态失败:", _0x59b847);
        showCliLoginMissingToast(t("aigenImage.task.dreaminaLoginStatusUnavailable"), {
          providerId: "dreamina",
          actionLabel: t("aigenImage.task.openSettings")
        });
        return false;
      }
    }
    _inferProviderFromModel(_0x41d36a, _0x248638 = "") {
      return resolveModelProvider(_0x41d36a, "", {
        allowProviderHint: false
      }) || resolveModelProvider(_0x41d36a, _0x248638) || resolveModelProvider(_0x41d36a, "grsai");
    }
    _isRunninghubTaskModel(_0xa36edd, _0x227e82) {
      const _0x6278fc = resolveModelProvider(_0xa36edd, _0x227e82, {
        allowProviderHint: false
      });
      const _0x46dfb2 = String(_0x227e82 || _0x6278fc || "").trim().toLowerCase();
      return (_0x46dfb2 === "runninghub" || _0x6278fc === "runninghub") && isModelApiModel(_0xa36edd, "runninghub") || this._isRunninghubWorkflowModel(_0xa36edd, _0x227e82);
    }
    _isRunningHubNanoBananaModel(_0x53e859 = this._data?.model) {
      const _0x23abea = resolveNanoBananaSelectionFromModel(_0x53e859, "2K", "runninghub");
      return _0x23abea?.provider === "runninghub" && _0x23abea.family === NANO_BANANA_FAMILIES.NANOBANANA;
    }
    _isRunningHubRecoverableRunningTask(_0x3225de = this._data) {
      if (!this._isRunninghubTaskModel(_0x3225de?.model, _0x3225de?.provider)) {
        return false;
      }
      const _0x5eddf7 = String(_0x3225de?.rhTaskId || "").trim();
      if (!_0x5eddf7) {
        return false;
      }
      const _0x4a5d85 = String(_0x3225de?.rhTaskStatus || "").trim().toLowerCase();
      if (_0x4a5d85 === "complete" || _0x4a5d85 === "completed" || _0x4a5d85 === "done" || _0x4a5d85 === "error" || _0x4a5d85 === "finish" || _0x4a5d85 === "finished" || _0x4a5d85 === "success" || _0x4a5d85 === "succeeded" || _0x4a5d85 === "failed" || _0x4a5d85 === "fail" || _0x4a5d85 === "idle" || _0x4a5d85 === "cancelled" || _0x4a5d85 === "canceled") {
        return false;
      }
      return true;
    }
    _isDreaminaRecoverableRunningTask(_0x58a473 = this._data) {
      if (!this._isDreaminaImageNode(_0x58a473)) {
        return false;
      }
      const _0x146b5b = String(_0x58a473?.dreaminaSubmitId || "").trim();
      if (!_0x146b5b) {
        return false;
      }
      const _0x5a3df7 = normalizeTaskStatus(_0x58a473?.jobStatus);
      const _0x3d0aab = normalizeTaskStatus(_0x58a473?.dreaminaTaskPhase);
      const _0x433782 = normalizeTaskStatus(_0x58a473?.dreaminaTaskStatus);
      if (DREAMINA_NON_RECOVERABLE_STATUSES.has(_0x5a3df7)) {
        return false;
      }
      if (DREAMINA_NON_RECOVERABLE_PHASES.has(_0x3d0aab)) {
        return false;
      }
      if (DREAMINA_NON_RECOVERABLE_STATUSES.has(_0x433782)) {
        return false;
      }
      return true;
    }
    _isStaleActiveDreaminaTask(_0x3cf4c6 = this._data) {
      if (!this._isGenerating) {
        return false;
      }
      if (_0x3cf4c6?.dreaminaTaskRecovering === true) {
        return false;
      }
      if (this._dreaminaResumePromise) {
        return false;
      }
      const _0x481e7d = Number(_0x3cf4c6?.dreaminaTaskLastCheckedAt || _0x3cf4c6?.dreaminaTaskStartedAt || _0x3cf4c6?.generationStartTime || 0);
      if (!Number.isFinite(_0x481e7d) || _0x481e7d <= 0) {
        return false;
      }
      return Date.now() - _0x481e7d >= DREAMINA_STALE_ACTIVE_RESUME_MS;
    }
    _isAsyncRecoverableRunningTask(_0x2893d0 = this._data) {
      const _0x49fd90 = String(_0x2893d0?.asyncTaskId || "").trim();
      if (!_0x49fd90) {
        return false;
      }
      const _0x43298d = this._inferProviderFromModel(_0x2893d0?.model, _0x2893d0?.asyncTaskProvider || _0x2893d0?.provider || "");
      if (!_0x43298d || _0x43298d === "runninghubwf" || _0x43298d === "runninghub" || _0x43298d === "dreamina") {
        return false;
      }
      const _0x5f08bb = String(_0x2893d0?.asyncTaskKind || "").trim().toLowerCase();
      if (_0x5f08bb && _0x5f08bb !== "image") {
        return false;
      }
      const _0x14c972 = String(_0x2893d0?.asyncTaskStatus || "").trim().toLowerCase();
      if (_0x14c972 === "success" || _0x14c972 === "failed" || _0x14c972 === "idle" || _0x14c972 === "cancelled") {
        return false;
      }
      return true;
    }
    _hasImageGenerationResult(_0x1cc610 = this._data) {
      const _0x24dc51 = Array.isArray(_0x1cc610?.images) ? _0x1cc610.images : [];
      const _0x4ae032 = _0x24dc51.some(_0x134780 => {
        if (!_0x134780 || typeof _0x134780 !== "object") {
          return false;
        }
        if (String(_0x134780?.error || "").trim()) {
          return false;
        }
        return !!String(_0x134780?.localPath || _0x134780?.imageUrl || _0x134780?.sourceUrl || _0x134780?.thumbUrl || _0x134780?.remoteFallbackUrl || "").trim();
      });
      if (_0x4ae032) {
        return true;
      }
      return !!String(_0x1cc610?.localPath || _0x1cc610?.imageUrl || _0x1cc610?.sourceUrl || _0x1cc610?.thumbUrl || _0x1cc610?.remoteFallbackUrl || "").trim();
    }
    _shouldFallbackRegenerateAsyncTask(_0x57e2cc = this._data) {
      const _0x1c6b3c = String(_0x57e2cc?.asyncTaskId || "").trim();
      if (_0x1c6b3c) {
        return false;
      }
      const _0x2b1796 = this._inferProviderFromModel(_0x57e2cc?.model, _0x57e2cc?.asyncTaskProvider || _0x57e2cc?.provider || "");
      if (!["ppio", "apimart"].includes(_0x2b1796)) {
        return false;
      }
      const _0x2960d9 = String(_0x57e2cc?.asyncTaskStatus || "").trim().toLowerCase();
      const _0x1d6f55 = ["submitted", "pending", "queued", "waiting", "running", "processing", "querying", "in_progress"].includes(_0x2960d9);
      if (!_0x1d6f55) {
        return false;
      }
      if (this._hasImageGenerationResult(_0x57e2cc)) {
        return false;
      }
      if (_0x57e2cc?.generationDuration != null) {
        return false;
      }
      return true;
    }
    async _maybeFallbackRegenerateAsyncTask(_0x2b9345 = this._data) {
      if (!this._shouldFallbackRegenerateAsyncTask(_0x2b9345)) {
        return false;
      }
      if (this._asyncFallbackRegeneratePromise) {
        return true;
      }
      if (this._isGenerating) {
        return true;
      }
      const _0x38d328 = (async () => {
        const _0x4f116b = _0x5852a4.getState().nodes?.[this.nodeId] || _0x2b9345 || {};
        const _0x57b9ac = Number(_0x4f116b?.generationStartTime || 0) > 0 ? Number(_0x4f116b.generationStartTime) : Date.now();
        _0x5852a4.updateNodeData(this.nodeId, this._buildAsyncTaskPatch({
          provider: this._inferProviderFromModel(_0x4f116b?.model, _0x4f116b?.asyncTaskProvider || _0x4f116b?.provider || ""),
          kind: "image",
          taskId: "",
          status: "pending",
          startedAt: _0x57b9ac,
          recovering: true
        }));
        this._persistAsyncResumeCache();
        await this._onGenerate();
      })();
      this._asyncFallbackRegeneratePromise = _0x38d328.finally(() => {
        this._asyncFallbackRegeneratePromise = null;
      });
      return true;
    }
    _buildRunningHubTaskPatch({
      taskId = "",
      status = "pending",
      startedAt = 0,
      recovering = false,
      useOpenapiQuery = false
    } = {}) {
      return buildRunningHubTaskPatch({
        taskId: taskId,
        status: status,
        startedAt: startedAt,
        recovering: recovering,
        useOpenapiQuery: useOpenapiQuery
      });
    }
    _buildDreaminaTaskPatch({
      submitId = "",
      status = "pending",
      phase = "generating",
      label = t("aigenImage.task.generating"),
      startedAt = 0,
      lastCheckedAt = Date.now(),
      recovering = false,
      raw = {}
    } = {}) {
      return buildDreaminaTaskPatch({
        submitId: submitId,
        status: status,
        phase: phase,
        label: label,
        startedAt: startedAt,
        lastCheckedAt: lastCheckedAt,
        recovering: recovering,
        raw: raw,
        defaultLabel: t("aigenImage.task.generating")
      });
    }
    _buildDreaminaFailurePatch({
      error = "",
      startedAt = 0,
      submitId = "",
      lastCheckedAt = Date.now(),
      raw = {}
    } = {}) {
      const _0x3e18eb = _0x5852a4.getState().nodes?.[this.nodeId] || this._data || {};
      const _0x5ca693 = String(error?.message || error || t("aigenImage.task.generationFailed")).trim() || t("aigenImage.task.generationFailed");
      const _0x39b2af = String(submitId || "").trim() || String(_0x3e18eb?.dreaminaSubmitId || "").trim();
      const _0x4b383d = Number(startedAt) > 0 ? Number(startedAt) : Number(_0x3e18eb?.dreaminaTaskStartedAt || _0x3e18eb?.generationStartTime || Date.now());
      return {
        ...buildImageGenerationFailurePatch({
          error: _0x5ca693,
          startedAt: _0x4b383d
        }),
        ...this._buildDreaminaTaskPatch({
          submitId: _0x39b2af,
          status: "failed",
          phase: "failed",
          label: _0x5ca693,
          startedAt: _0x4b383d,
          lastCheckedAt: Number(lastCheckedAt || Date.now()),
          recovering: false,
          raw: raw
        })
      };
    }
    _finalizeDreaminaImageFailure(_0x274e94 = {}) {
      const _0x57a9de = this._buildDreaminaFailurePatch(_0x274e94);
      _0x5852a4.updateNodeData(this.nodeId, _0x57a9de);
      this._persistDreaminaResumeCache();
      this._isGenerating = false;
      this._dreaminaActiveSubmitId = "";
      if (this.btnEl) {
        resetGenerateButtonIdleUi(this.btnEl);
      }
      _0x15de9c(this.previewEl);
      this._updateSubmitButtonState?.();
      return _0x57a9de;
    }
    _buildAsyncTaskPatch({
      provider = "",
      kind = "image",
      taskId = "",
      status = "pending",
      startedAt = 0,
      recovering = false
    } = {}) {
      const _0xd6e731 = String(status || "pending").trim() || "pending";
      const _0x31e2f7 = String(taskId || "").trim();
      let _0x49161b = String(provider || "").trim().toLowerCase();
      if (!_0x49161b && (_0x31e2f7 || _0xd6e731 !== "idle")) {
        _0x49161b = this._inferProviderFromModel(this._data?.model || "", "");
      }
      return buildAsyncTaskPatch({
        provider: _0x49161b,
        kind: kind,
        taskId: _0x31e2f7,
        status: _0xd6e731,
        startedAt: startedAt,
        recovering: recovering
      });
    }
    _syncLocalTaskNodeData() {
      const _0x1b2791 = _0x5852a4.getState().nodes?.[this.nodeId];
      if (_0x1b2791) {
        this._data = _0x1b2791;
      }
      return this._data || {};
    }
    _applyDreaminaTaskPatch(_0x27cc8b = {}, _0x1be85a = {}) {
      const _0x1d43ee = _0x5852a4.getState().nodes?.[this.nodeId] || this._data || {};
      const _0x440f65 = {
        generationStartTime: Number(_0x1d43ee?.generationStartTime) > 0 ? Number(_0x1d43ee.generationStartTime) : Number(_0x27cc8b?.startedAt || Date.now()),
        generationDuration: null,
        ...this._buildDreaminaTaskPatch(_0x27cc8b),
        ..._0x1be85a
      };
      _0x5852a4.updateNodeData(this.nodeId, _0x440f65);
      this._syncLocalTaskNodeData();
      this._persistDreaminaResumeCache();
      return _0x440f65;
    }
    _stopRunningHubRecovery(_0x39aab9 = false) {
      if (this._rhResumeAbortController && !this._rhResumeAbortController.signal.aborted) {
        this._rhResumeAbortController.abort();
      }
      this._rhResumeAbortController = null;
      this._rhResumeTaskId = "";
      this._rhResumePromise = null;
      if (_0x39aab9) {
        const _0x5e276d = _0x5852a4.getState().nodes?.[this.nodeId];
        if (_0x5e276d?.rhTaskRecovering) {
          _0x5852a4.updateNodeData(this.nodeId, {
            rhTaskRecovering: false
          });
          this._persistRunningHubResumeCache();
        }
      }
    }
    _stopDreaminaRecovery(_0x117af2 = false) {
      if (this._dreaminaResumeAbortController && !this._dreaminaResumeAbortController.signal.aborted) {
        this._dreaminaResumeAbortController.abort();
      }
      this._dreaminaResumeAbortController = null;
      this._dreaminaResumeSubmitId = "";
      this._dreaminaResumePromise = null;
      if (_0x117af2) {
        const _0x553eca = _0x5852a4.getState().nodes?.[this.nodeId];
        if (_0x553eca?.dreaminaTaskRecovering) {
          _0x5852a4.updateNodeData(this.nodeId, {
            dreaminaTaskRecovering: false
          });
          this._persistDreaminaResumeCache();
        }
      }
    }
    _stopAsyncRecovery(_0xeec5ed = false) {
      if (this._asyncResumeAbortController && !this._asyncResumeAbortController.signal.aborted) {
        this._asyncResumeAbortController.abort();
      }
      this._asyncResumeAbortController = null;
      this._asyncResumeTaskId = "";
      this._asyncResumePromise = null;
      if (_0xeec5ed) {
        const _0x404840 = _0x5852a4.getState().nodes?.[this.nodeId];
        if (_0x404840?.asyncTaskRecovering) {
          _0x5852a4.updateNodeData(this.nodeId, {
            asyncTaskRecovering: false
          });
          this._persistAsyncResumeCache();
        }
      }
    }
    _applyImageGenerationResult(_0x8e144f, _0x59fddc, {
      writeStore = true
    } = {}) {
      const _0x53df4c = normalizeImageGenerationResult(_0x8e144f);
      const _0x5d0ff0 = buildImageGenerationResultPatch(_0x53df4c, {
        startedAt: _0x59fddc
      });
      if (!_0x5d0ff0) {
        return null;
      }
      if (writeStore) {
        _0x5852a4.updateNodeData(this.nodeId, _0x5d0ff0);
      }
      this._dispatchGenerationHistoryAssets(getSuccessfulImageGenerationItems(_0x53df4c), _0x59fddc);
      return {
        patch: _0x5d0ff0,
        normalizedResult: _0x53df4c,
        items: getSuccessfulImageGenerationItems(_0x53df4c)
      };
    }
    _dispatchGenerationHistoryAssets(_0xc3615b, _0x263513) {
      if (typeof window === "undefined" || typeof window.dispatchEvent !== "function") {
        return;
      }
      const _0x1abc9d = Array.isArray(_0xc3615b) ? _0xc3615b.filter(_0x1511e5 => _0x1511e5 && typeof _0x1511e5 === "object" && !_0x1511e5.error) : [];
      if (_0x1abc9d.length === 0) {
        return;
      }
      const _0x406f22 = _0x5852a4.getState().nodes?.[this.nodeId] || this._data || {};
      try {
        window.dispatchEvent(new CustomEvent(GENERATION_HISTORY_EVENT, {
          detail: {
            kind: "image",
            sourceNodeId: this.nodeId,
            nodeData: _0x406f22,
            images: _0x1abc9d,
            startedAt: _0x263513,
            createdAt: Date.now()
          }
        }));
      } catch {}
    }
    _getImageGenerationResultError(_0x24c142) {
      return getImageGenerationResultError(_0x24c142);
    }
    async _buildResumePayload(_0x21be54 = this._data, _0x53a2cb = {}) {
      const _0x18468b = _0x21be54 || {};
      let _0xee36e6 = String(normalizeDreaminaImageModel(_0x18468b?.model, _0x18468b?.provider) || _0x18468b?.model || "").trim();
      const _0x2fca00 = _0x18468b.generationParams && typeof _0x18468b.generationParams === "object" && !Array.isArray(_0x18468b.generationParams) ? _0x18468b.generationParams : {};
      const _0x2187ef = getModelManifest(_0xee36e6);
      if (!_0x2187ef) {
        throw new Error("Missing model manifest: " + _0xee36e6);
      }
      const _0x3f3f04 = sanitizeTaskGenerationParams(_0xee36e6, _0x2fca00);
      const _0x20366a = _0x2187ef.adapterType === "modelApi";
      const _0x234efb = Array.isArray(_0x2187ef?.uiSchema?.fields) ? _0x2187ef.uiSchema.fields : [];
      const {
        getManifestField: _0x573b77,
        readSchemaParam: _0x3917ab,
        requireSchemaParam: _0x5e265f
      } = createSchemaParamAccess({
        model: _0xee36e6,
        data: this._data,
        generationParams: _0x3f3f04,
        manifestFields: _0x234efb
      });
      const _0x1a7b9d = _0x573b77("imageSize") ? _0x5e265f("imageSize") : undefined;
      const _0x1fa020 = _0x20366a ? _0x3917ab("mode") : undefined;
      const _0x236050 = resolveNanoBananaSelectionFromModel(_0xee36e6, _0x1a7b9d || "2K", _0x18468b?.provider);
      if (_0x236050) {
        if (!_0x20366a && _0x1fa020 !== undefined) {
          _0xee36e6 = resolveNanoBananaModelBySelection({
            family: _0x236050.family,
            mode: _0x1fa020,
            imageSize: _0x1a7b9d || "2K",
            provider: _0x236050.provider || _0x18468b?.provider
          });
        } else if (!_0x20366a) {
          _0xee36e6 = _0x236050.model;
        }
      }
      const _0x3abb36 = String(_0x53a2cb?.providerHint || _0x18468b?.provider || "").trim().toLowerCase();
      if (isDreaminaImageModel(_0xee36e6, _0x3abb36)) {
        _0xee36e6 = normalizeDreaminaImageModel(_0xee36e6, _0x3abb36) || _0xee36e6 || getDefaultDreaminaImageModelId();
      }
      const _0x1caa7a = this._inferProviderFromModel(_0xee36e6, _0x3abb36);
      const _0x3a1b6b = resolveImageSizeForProviderModel({
        provider: _0x1caa7a,
        model: _0xee36e6,
        imageSize: _0x1a7b9d
      });
      if (!getModelManifest(_0xee36e6)) {
        _0xee36e6 = resolveGrsaiGptImage2ModelForSize({
          provider: _0x1caa7a,
          model: _0xee36e6,
          imageSize: _0x3a1b6b
        });
      }
      const _0x9ae742 = getRunningHubTaskProviderProfileId(_0x18468b);
      const _0x44fee0 = resolveModelGenerationProviderProfileId(_0xee36e6, _0x1caa7a, _0x9ae742);
      await _0x1ea311();
      const _0x3b17c5 = _0x4c4f74(_0x44fee0 || _0x1caa7a) || {};
      let _0x20f8f9 = "";
      if (_0x1caa7a === "runninghub") {
        _0x20f8f9 = isModelApiModel(_0xee36e6, _0x1caa7a) ? _0x3b17c5.modelApiKey || "" : _0x3b17c5.apiKey || "";
      } else if (_0x1caa7a === "runninghubwf") {
        _0x20f8f9 = _0x3b17c5.apiKey || "";
      } else {
        _0x20f8f9 = _0x3b17c5.apiKey || window._appApiKey || "";
      }
      return {
        nodeId: this.nodeId,
        model: _0xee36e6,
        provider: _0x1caa7a,
        ...(_0x44fee0 ? {
          providerProfileId: _0x44fee0,
          rhProviderProfileId: _0x44fee0
        } : {}),
        apiKey: _0x20f8f9
      };
    }
    async _maybeResumeRunningHubTaskImpl() {
      const _0x30571a = _0x410a85().nodes?.[this.nodeId] || this._data || {};
      if (this._isGenerating && _0x30571a?.rhTaskRecovering !== true) {
        return;
      }
      if (!this._isRunninghubTaskModel(_0x30571a?.model, _0x30571a?.provider)) {
        this._stopRunningHubRecovery(false);
        return;
      }
      if (!this._isRunningHubRecoverableRunningTask(_0x30571a)) {
        this._stopRunningHubRecovery(false);
        return;
      }
      const _0x691d94 = String(_0x30571a?.rhTaskId || "").trim();
      if (!_0x691d94) {
        this._stopRunningHubRecovery(false);
        return;
      }
      if (this._rhResumeTaskId === _0x691d94 && this._rhResumePromise) {
        return;
      }
      this._stopRunningHubRecovery(false);
      const _0x58534e = Number(_0x30571a?.rhTaskStartedAt || _0x30571a?.generationStartTime || Date.now());
      const _0x849cbd = _0x30571a?.rhTaskUseOpenapiQuery === true || isModelApiModel(_0x30571a?.model, _0x30571a?.provider || "runninghub");
      this._rhResumeTaskId = _0x691d94;
      const _0x48ec8d = (async () => {
        let _0x1a2189 = null;
        const _0x1a62c3 = this._isRunninghubWorkflowModel(_0x30571a?.model, _0x30571a?.provider);
        const _0x4bca5e = shouldUseImageWorkflowBusyButton(_0x30571a?.model);
        try {
          const _0x60f7f6 = await this._buildResumePayload(_0x30571a);
          if (!_0x60f7f6) {
            return;
          }
          _0x1a2189 = new AbortController();
          this._rhResumeAbortController = _0x1a2189;
          this._rhTaskId = _0x691d94;
          this._rhApiKey = String(_0x60f7f6?.apiKey || "").trim() || this._rhApiKey || null;
          this._rhCancelRequested = false;
          this._isGenerating = true;
          if (this.btnEl) {
            if (_0x1a62c3) {
              setGenerateButtonCancellableUi(this.btnEl, {
                busy: _0x4bca5e
              });
            } else {
              setGenerateButtonLoadingUi(this.btnEl);
            }
          }
          _0x576eb5(this.previewEl);
          const _0x22feb8 = await resumeTask(createGenerationResumePlanFromNode({
            kind: "image",
            node: _0x30571a,
            taskProtocol: "workflow",
            sourceNodeId: this.nodeId,
            targetNodeId: this.nodeId,
            trigger: "node",
            taskType: "image-generation",
            payload: _0x60f7f6,
            cancellable: _0x1a62c3,
            resumable: true,
            pauseOnAbort: true,
            startBuilder: () => ({
              rhStatusMessage: null,
              rhStatusCode: null,
              rhTaskUseOpenapiQuery: _0x849cbd
            }),
            onTaskStart: () => {
              this._persistRunningHubResumeCache();
            },
            poll: async () => _0x57b846.resumeRunningHubImageTask(_0x691d94, _0x60f7f6, {
              signal: _0x1a2189.signal,
              useOpenapiQuery: _0x849cbd
            }),
            resultBuilder: async (_0x17de30, _0x4b0851) => {
              const _0x6dfc93 = this._getImageGenerationResultError(_0x17de30);
              if (_0x6dfc93) {
                throw new Error(_0x6dfc93);
              }
              const _0x66d6d6 = this._applyImageGenerationResult(_0x17de30, _0x4b0851.startedAt, {
                writeStore: false
              });
              return {
                ...(_0x66d6d6?.patch || {}),
                ...this._buildRunningHubTaskPatch({
                  taskId: _0x691d94,
                  status: "success",
                  startedAt: _0x4b0851.startedAt,
                  recovering: false,
                  useOpenapiQuery: _0x849cbd
                })
              };
            },
            failureBuilder: (_0x5e6968, _0x37d671) => ({
              ...buildImageGenerationFailurePatch({
                error: _0x5e6968?.message || t("aigenImage.task.generationFailed"),
                startedAt: _0x37d671.startedAt
              }),
              rhStatusMessage: _0x5e6968?.message || t("aigenImage.task.generationFailed"),
              rhStatusCode: Number.isFinite(Number(_0x5e6968?.code)) ? Number(_0x5e6968.code) : null,
              ...this._buildRunningHubTaskPatch({
                taskId: _0x691d94,
                status: "failed",
                startedAt: _0x37d671.startedAt,
                recovering: false,
                useOpenapiQuery: _0x849cbd
              })
            }),
            cancelledBuilder: _0x3eefca => {
              const _0x1bbbcf = _0x3eefca.getTaskNode?.() || {};
              const _0x30687e = _0x1bbbcf.generationDuration == null ? Date.now() - _0x3eefca.startedAt : _0x1bbbcf.generationDuration;
              return this._buildRunningHubCancelResultPatch({
                latest: _0x1bbbcf,
                message: _0x1bbbcf.rhStatusMessage || t("aigenImage.task.interrupted"),
                code: _0x1bbbcf.rhStatusCode,
                duration: _0x30687e,
                taskId: _0x691d94
              });
            },
            parseError: _0x4d406d => getGenerationErrorMessage(_0x4d406d, t("aigenImage.task.generationFailed"))
          }), {
            store: _0x5852a4,
            startedAt: _0x58534e,
            abortController: _0x1a2189
          });
          if (_0x22feb8.status === "pending") {
            this._persistRunningHubResumeCache();
            return;
          }
          this._persistRunningHubResumeCache();
        } catch (_0x22223b) {
          if (_0x1a2189?.signal?.aborted || isGenerationAbortError(_0x22223b)) {
            return;
          }
          _0x5852a4.updateNodeData(this.nodeId, {
            generationDuration: Math.max(0, Date.now() - _0x58534e),
            rhStatusMessage: _0x22223b?.message || t("aigenImage.task.generationFailed"),
            rhStatusCode: Number.isFinite(Number(_0x22223b?.code)) ? Number(_0x22223b.code) : null,
            ...this._buildRunningHubTaskPatch({
              taskId: _0x691d94,
              status: "failed",
              startedAt: _0x58534e,
              recovering: false,
              useOpenapiQuery: _0x849cbd
            })
          });
          this._persistRunningHubResumeCache();
        } finally {
          if (_0x1a2189 && this._rhResumeAbortController === _0x1a2189) {
            this._rhResumeAbortController = null;
          }
          if (this._rhResumeTaskId === _0x691d94) {
            this._rhResumeTaskId = "";
          }
          this._rhResumePromise = null;
          const _0x4d4074 = this._syncLocalTaskNodeData();
          const _0x414279 = shouldShowGenerationBusyUi(_0x4d4074);
          this._isGenerating = _0x414279;
          if (_0x414279) {
            this._rhTaskId = String(_0x4d4074?.rhTaskId || _0x691d94 || "").trim();
          } else {
            this._rhTaskId = null;
            if (!this._rhCancelRequested) {
              this._rhApiKey = null;
            }
            if (this.btnEl) {
              resetGenerateButtonIdleUi(this.btnEl);
            }
            _0x15de9c(this.previewEl);
          }
          this._updateSubmitButtonState();
        }
      })();
      this._rhResumePromise = _0x48ec8d;
    }
    async _maybeResumeDreaminaTaskImpl() {
      const _0xddfc11 = _0x410a85().nodes?.[this.nodeId] || this._data || {};
      const _0x550f33 = String(_0xddfc11?.dreaminaSubmitId || "").trim();
      const _0x207c6d = String(this._dreaminaActiveSubmitId || "").trim();
      if (this._isGenerating && _0xddfc11?.dreaminaTaskRecovering !== true && _0x207c6d && _0x207c6d === _0x550f33 && !this._isStaleActiveDreaminaTask(_0xddfc11)) {
        return;
      }
      if (!this._isDreaminaImageNode(_0xddfc11)) {
        this._stopDreaminaRecovery(false);
        return;
      }
      if (!this._isDreaminaRecoverableRunningTask(_0xddfc11)) {
        this._stopDreaminaRecovery(false);
        return;
      }
      if (!_0x550f33) {
        this._stopDreaminaRecovery(false);
        return;
      }
      if (this._dreaminaResumeSubmitId === _0x550f33) {
        return;
      }
      this._stopDreaminaRecovery(false);
      const _0xe9ba23 = Number(_0xddfc11?.dreaminaTaskStartedAt || _0xddfc11?.generationStartTime || Date.now());
      this._dreaminaResumeSubmitId = _0x550f33;
      const _0x40892b = (async () => {
        let _0x56e445 = null;
        try {
          const _0xfb94c = await this._buildResumePayload(_0xddfc11);
          if (!_0xfb94c) {
            return;
          }
          _0x56e445 = new AbortController();
          this._dreaminaResumeAbortController = _0x56e445;
          this._isGenerating = true;
          if (this.btnEl) {
            setGenerateButtonLoadingUi(this.btnEl);
          }
          _0x576eb5(this.previewEl);
          const _0x53fcbf = await resumeTask(createGenerationResumePlanFromNode({
            kind: "image",
            node: _0xddfc11,
            taskProtocol: "dreamina",
            sourceNodeId: this.nodeId,
            targetNodeId: this.nodeId,
            trigger: "node",
            taskType: "image-generation",
            payload: _0xfb94c,
            cancellable: false,
            resumable: true,
            pauseOnAbort: true,
            startBuilder: () => this._buildDreaminaTaskPatch({
              submitId: _0x550f33,
              status: "pending",
              phase: "generating",
              label: String(_0xddfc11?.dreaminaTaskLabel || "").trim() || t("aigenImage.task.generating"),
              startedAt: _0xe9ba23,
              lastCheckedAt: Date.now(),
              recovering: true,
              raw: _0xddfc11?.dreaminaTaskLastRaw || {}
            }),
            onTaskStart: () => {
              this._persistDreaminaResumeCache();
            },
            pauseBuilder: _0x15ab04 => this._buildDreaminaTaskPatch({
              submitId: _0x550f33,
              status: String(_0xddfc11?.dreaminaTaskStatus || "").trim() || "pending",
              phase: String(_0xddfc11?.dreaminaTaskPhase || "").trim() || "generating",
              label: String(_0xddfc11?.dreaminaTaskLabel || "").trim() || t("aigenImage.task.generating"),
              startedAt: _0x15ab04.startedAt,
              lastCheckedAt: Date.now(),
              recovering: false,
              raw: _0xddfc11?.dreaminaTaskLastRaw || {}
            }),
            poll: async () => _0x57b846.resumeDreaminaImageTask(_0x550f33, _0xfb94c, {
              signal: _0x56e445.signal
            }),
            resultBuilder: async (_0x522b9d, _0x2c21ee) => {
              const _0x4a81ae = this._getImageGenerationResultError(_0x522b9d);
              if (_0x4a81ae) {
                throw new Error(_0x4a81ae);
              }
              const _0x3c5414 = this._applyImageGenerationResult(_0x522b9d, _0x2c21ee.startedAt, {
                writeStore: false
              });
              return {
                ...(_0x3c5414?.patch || {}),
                ...this._buildDreaminaTaskPatch({
                  submitId: _0x550f33,
                  status: "success",
                  phase: "done",
                  label: t("aigenImage.task.completed"),
                  startedAt: _0x2c21ee.startedAt,
                  lastCheckedAt: Date.now(),
                  recovering: false,
                  raw: {}
                })
              };
            },
            failureBuilder: (_0x47052a, _0x49fdd1) => this._buildDreaminaFailurePatch({
              error: _0x47052a,
              startedAt: _0x49fdd1.startedAt,
              submitId: _0x550f33,
              lastCheckedAt: Date.now(),
              raw: {}
            }),
            cancelledBuilder: _0x12a83c => ({
              generationDuration: Date.now() - _0x12a83c.startedAt,
              ...this._buildDreaminaTaskPatch({
                submitId: _0x550f33,
                status: "pending",
                phase: "generating",
                label: String(_0xddfc11?.dreaminaTaskLabel || "").trim() || t("aigenImage.task.generating"),
                startedAt: _0x12a83c.startedAt,
                lastCheckedAt: Date.now(),
                recovering: false,
                raw: _0xddfc11?.dreaminaTaskLastRaw || {}
              })
            }),
            parseError: _0x25dc8c => getGenerationErrorMessage(_0x25dc8c, t("aigenImage.task.generationFailed"))
          }), {
            store: _0x5852a4,
            startedAt: _0xe9ba23,
            abortController: _0x56e445
          });
          if (_0x53fcbf.status === "pending") {
            this._persistDreaminaResumeCache();
            return;
          }
          if (_0x53fcbf.status === "failed") {
            this._dreaminaActiveSubmitId = "";
          }
          this._persistDreaminaResumeCache();
        } catch (_0x29d4c8) {
          if (_0x56e445?.signal?.aborted || isGenerationAbortError(_0x29d4c8)) {
            return;
          }
          this._finalizeDreaminaImageFailure({
            error: _0x29d4c8,
            startedAt: _0xe9ba23,
            submitId: _0x550f33,
            lastCheckedAt: Date.now(),
            raw: {}
          });
        } finally {
          if (_0x56e445 && this._dreaminaResumeAbortController === _0x56e445) {
            this._dreaminaResumeAbortController = null;
          }
          if (this._dreaminaResumeSubmitId === _0x550f33) {
            this._dreaminaResumeSubmitId = "";
          }
          this._dreaminaResumePromise = null;
          const _0x4c077e = this._syncLocalTaskNodeData();
          const _0x25d355 = shouldShowGenerationBusyUi(_0x4c077e);
          this._isGenerating = _0x25d355;
          if (!_0x25d355) {
            if (this.btnEl) {
              resetGenerateButtonIdleUi(this.btnEl);
            }
            _0x15de9c(this.previewEl);
          }
          this._updateSubmitButtonState();
        }
      })();
      this._dreaminaResumePromise = _0x40892b;
    }
    async _maybeResumeAsyncTaskImpl() {
      const _0x168fc4 = _0x410a85().nodes?.[this.nodeId] || this._data || {};
      if (this._isGenerating && _0x168fc4?.asyncTaskRecovering !== true) {
        return;
      }
      if (!this._isAsyncRecoverableRunningTask(_0x168fc4)) {
        const _0x5ef69a = await this._maybeFallbackRegenerateAsyncTask(_0x168fc4);
        if (_0x5ef69a) {
          return;
        }
        this._stopAsyncRecovery(false);
        return;
      }
      const _0x1a3756 = String(_0x168fc4?.asyncTaskId || "").trim();
      if (!_0x1a3756) {
        const _0x332c6c = await this._maybeFallbackRegenerateAsyncTask(_0x168fc4);
        if (_0x332c6c) {
          return;
        }
        this._stopAsyncRecovery(false);
        return;
      }
      if (this._asyncResumeTaskId === _0x1a3756 && this._asyncResumePromise) {
        return;
      }
      this._stopAsyncRecovery(false);
      const _0x377a5e = Number(_0x168fc4?.asyncTaskStartedAt || _0x168fc4?.generationStartTime || Date.now());
      const _0x434fce = this._inferProviderFromModel(_0x168fc4?.model, _0x168fc4?.asyncTaskProvider || _0x168fc4?.provider || "");
      this._asyncResumeTaskId = _0x1a3756;
      const _0x20e533 = (async () => {
        let _0x4eacc2 = null;
        try {
          const _0x2687fc = await this._buildResumePayload(_0x168fc4, {
            providerHint: _0x434fce
          });
          if (!_0x2687fc) {
            return;
          }
          _0x4eacc2 = new AbortController();
          this._asyncResumeAbortController = _0x4eacc2;
          this._isGenerating = true;
          if (this.btnEl) {
            setGenerateButtonLoadingUi(this.btnEl);
          }
          _0x576eb5(this.previewEl);
          const _0x3c99c6 = await resumeTask(createGenerationResumePlanFromNode({
            kind: "image",
            node: _0x168fc4,
            taskProtocol: "asyncModelApi",
            sourceNodeId: this.nodeId,
            targetNodeId: this.nodeId,
            trigger: "node",
            taskType: "image-generation",
            payload: _0x2687fc,
            pauseOnAbort: true,
            persistTaskState: () => this._persistAsyncResumeCache(),
            poll: async () => _0x57b846.resumeAsyncImageTask(_0x1a3756, _0x2687fc, {
              signal: _0x4eacc2.signal
            }),
            resultBuilder: async (_0x1b4e12, _0xb9f18d) => {
              const _0x1dd2ce = this._getImageGenerationResultError(_0x1b4e12);
              if (_0x1dd2ce) {
                throw new Error(_0x1dd2ce);
              }
              const _0x5e7320 = this._applyImageGenerationResult(_0x1b4e12, _0xb9f18d.startedAt, {
                writeStore: false
              });
              return _0x5e7320?.patch || {};
            },
            parseError: _0x26b649 => getGenerationErrorMessage(_0x26b649, t("aigenImage.task.generationFailed"))
          }), {
            store: _0x5852a4,
            startedAt: _0x377a5e,
            abortController: _0x4eacc2
          });
          if (_0x3c99c6.status === "pending") {
            return;
          }
        } catch (_0x2caef8) {
          if (_0x4eacc2?.signal?.aborted || isGenerationAbortError(_0x2caef8)) {
            return;
          }
          _0x5852a4.updateNodeData(this.nodeId, {
            generationDuration: Math.max(0, Date.now() - _0x377a5e),
            ...this._buildAsyncTaskPatch({
              provider: _0x434fce,
              kind: "image",
              taskId: _0x1a3756,
              status: "failed",
              startedAt: _0x377a5e,
              recovering: false
            })
          });
          this._persistAsyncResumeCache();
        } finally {
          if (_0x4eacc2 && this._asyncResumeAbortController === _0x4eacc2) {
            this._asyncResumeAbortController = null;
          }
          if (this._asyncResumeTaskId === _0x1a3756) {
            this._asyncResumeTaskId = "";
          }
          this._asyncResumePromise = null;
          const _0x53691a = this._syncLocalTaskNodeData();
          const _0x3f5a2a = shouldShowGenerationBusyUi(_0x53691a);
          this._isGenerating = _0x3f5a2a;
          if (!_0x3f5a2a) {
            if (this.btnEl) {
              resetGenerateButtonIdleUi(this.btnEl);
            }
            _0x15de9c(this.previewEl);
          }
          this._updateSubmitButtonState();
        }
      })();
      this._asyncResumePromise = _0x20e533;
    }
    async _buildPayload(_0x438444 = null) {
      const _0x528a15 = createPayloadObjectUrlLease({
        ownerId: "ai-image:" + this.nodeId + ":payload",
        kind: "image"
      });
      try {
        const _0x274240 = _0x5852a4.getState();
        const _0x156f59 = _0x274240.nodes?.[this.nodeId];
        if (_0x156f59) {
          this._data = _0x156f59;
        }
        const _0x3ebbe9 = _0x5852a4.getIncomingEdges(this.nodeId);
        const _0x4bd016 = _0x274240.nodes || {};
        const _0xbb874a = getTargetInputPolicy(_0x4bd016?.[this.nodeId] || this._data || {});
        const _0x45cca7 = getFixedInputSlotConfigFromManifest(_0x4bd016?.[this.nodeId] || this._data || {});
        const _0x109f66 = getImageNodeInputGate(this._data?.model);
        const _0x1defc2 = String(_0x109f66.kind || "").trim();
        const _0x42a0c6 = Number(_0x109f66.max);
        const _0x11d0f3 = isRhPersonReplaceWorkflowModel(this._data?.model);
        const _0x57cc14 = isRhQwenImageEditModel(this._data?.model);
        const _0x20b0f2 = getModelManifest(this._data?.model)?.inputSlots;
        const _0x3f0bd0 = Math.max(0, Number(_0x20b0f2?.maxByKind?.image) || 0);
        const _0x399dbb = _0x3f0bd0 || 3;
        const _0x1307d5 = getImageInputGateUploadedUrl(this._data, _0x109f66);
        const _0x5a92a4 = {
          text: [],
          image: [],
          video: [],
          audio: []
        };
        const _0x3e03ff = {
          text: 0,
          image: 0,
          video: 0,
          audio: 0
        };
        const _0x23d16b = new Map();
        for (const _0x3039f0 of _0x3ebbe9) {
          const _0x508c10 = _0x4bd016[_0x3039f0.sourceId];
          if (!_0x508c10) {
            continue;
          }
          const _0x2d11a8 = resolveEffectiveInputKind(_0x508c10, _0x3039f0);
          if (!_0x2d11a8) {
            continue;
          }
          if (!isInputKindAllowed(_0xbb874a, _0x2d11a8)) {
            continue;
          }
          if (_0x1defc2 && _0x2d11a8 !== _0x1defc2) {
            continue;
          }
          if (_0x1defc2 && Number.isFinite(_0x42a0c6) && _0x3e03ff[_0x1defc2] >= _0x42a0c6) {
            continue;
          }
          if (_0x11d0f3 && _0x2d11a8 !== "image") {
            continue;
          }
          if (_0x11d0f3 && _0x3e03ff.image >= 2) {
            continue;
          }
          if (_0x57cc14 && _0x2d11a8 !== "image") {
            continue;
          }
          if (_0x57cc14 && _0x3e03ff.image >= _0x399dbb) {
            continue;
          }
          let _0x298a51 = "";
          let _0x532284 = "";
          if (_0x2d11a8 === "text") {
            _0x298a51 = (_0x508c10.outputText || _0x508c10.text || _0x508c10.content || _0x508c10.prompt || _0x508c10.label || "").trim();
            if (!_0x298a51) {
              continue;
            }
          } else {
            if (_0x2d11a8 === "image") {
              _0x532284 = resolveGenerationInputImageUrl(_0x508c10);
            }
            if (!_0x532284 && _0x508c10.sourceId) {
              const _0x232ca9 = await _0x55f139(_0x508c10.sourceId);
              if (_0x232ca9) {
                _0x532284 = _0x528a15.create(_0x232ca9, {
                  sourceUrl: _0x508c10.sourceId
                });
              }
            }
            if (!_0x532284) {
              _0x532284 = _0x508c10.src || _0x508c10.imageUrl || _0x508c10.thumbUrl || "";
            }
            if (!_0x532284) {
              continue;
            }
          }
          _0x3e03ff[_0x2d11a8]++;
          const _0x4ba8a0 = buildReferenceLabelAliases(_0x2d11a8, _0x3e03ff[_0x2d11a8]);
          const _0x286fa6 = _0x4ba8a0[0];
          const _0x85b4a3 = _0x2d11a8 === "image" ? String(_0x508c10.mask || "") : "";
          const _0x3636f3 = _0x85b4a3.trim();
          const _0x2a40b0 = _0x2d11a8 === "image" && _0x3636f3 ? _0x3636f3.startsWith("/") ? _0x3636f3 : "/" + _0x3636f3.replace(/^\//, "") : "";
          if (_0x2d11a8 === "image" && _0x2a40b0) {
            _0x23d16b.set(_0x532284, _0x2a40b0);
          }
          _0x5a92a4[_0x2d11a8].push({
            label: _0x286fa6,
            labels: _0x4ba8a0,
            content: _0x298a51,
            url: _0x532284,
            maskUrl: _0x2a40b0,
            used: false,
            sourceId: _0x3039f0.sourceId,
            refSlot: _0x3039f0.refSlot || ""
          });
        }
        const _0x4f6f0d = [..._0x5a92a4.text, ..._0x5a92a4.image, ..._0x5a92a4.video, ..._0x5a92a4.audio];
        const _0x49a4b8 = {};
        _0x4f6f0d.forEach(_0x3a2539 => {
          (_0x3a2539.labels || [_0x3a2539.label]).forEach(_0x3417fa => {
            _0x49a4b8[_0x3417fa.replace(/\s+/g, "")] = _0x3a2539;
          });
        });
        const _0x4d04e4 = {};
        _0x4f6f0d.forEach(_0x15b71f => {
          if (_0x15b71f.sourceId) {
            _0x4d04e4[_0x15b71f.sourceId] = _0x15b71f;
          }
        });
        let _0x184f52 = [];
        const _0x209fa3 = [];
        const _0x57b254 = {
          image: 0,
          video: 0,
          audio: 0
        };
        const _0x79eb62 = _0x4bd016?.[this.nodeId] || this._data || {};
        const _0x49b77d = getPromptAssetInputRefsFromNode(_0x79eb62, {
          allowedTypes: ["image"]
        });
        const _0x11a79e = () => (_0x5a92a4.image || []).some(_0x4a9b8d => !!_0x4a9b8d.url) || _0x184f52.some(Boolean) || _0x209fa3.some(_0x57616d => _0x57616d.type === "image" && _0x57616d.url) || _0x49b77d.some(_0x28bb8b => {
          const _0x3a5dde = resolveEffectiveInputKind(_0x28bb8b) || _0x28bb8b.type;
          return _0x3a5dde === "image" && !!_0x28bb8b.url;
        });
        const _0x228d15 = _0x29256c => {
          let _0x9eaa13 = "";
          const _0x45b378 = _0x5d2ddd => {
            for (const _0xff9c72 of _0x5d2ddd.childNodes) {
              if (_0xff9c72.nodeType === Node.TEXT_NODE) {
                _0x9eaa13 += _0xff9c72.textContent;
              } else if (_0xff9c72.nodeType === Node.ELEMENT_NODE) {
                if (_0xff9c72.classList.contains("ref-pill")) {
                  const _0x466ca6 = _0xff9c72.dataset.nodeId || "";
                  const _0x5788ef = _0xff9c72.dataset.label || _0xff9c72.textContent.trim();
                  const _0x1a9913 = [];
                  if (appendAssetMentionToPrompt({
                    domNode: _0xff9c72,
                    rawLabel: _0x5788ef,
                    promptParts: _0x1a9913,
                    inputRefs: _0x209fa3,
                    mediaCounts: _0x57b254,
                    allowedTypes: ["text", "image"]
                  })) {
                    _0x9eaa13 += _0x1a9913.join("");
                    _0x209fa3.forEach(_0x2ac236 => {
                      if (_0x2ac236.type === "image" && _0x2ac236.url && !_0x184f52.includes(_0x2ac236.url)) {
                        _0x184f52.push(_0x2ac236.url);
                      }
                    });
                    continue;
                  }
                  const _0x598d56 = getPromptInputSubmitLabelFromPillNode(_0xff9c72, _0x5788ef) || _0x5788ef;
                  const _0x527115 = _0x598d56.replace(/\s+/g, "");
                  const _0x3164dd = _0x466ca6 && _0x4d04e4[_0x466ca6] || _0x49a4b8[_0x527115];
                  const _0x24fbbd = getPromptInputSubmitLabelFromPillNode(_0xff9c72, _0x3164dd?.label || _0x598d56) || _0x598d56;
                  if (_0x3164dd) {
                    _0x3164dd.used = true;
                    if (_0x3164dd.content) {
                      _0x9eaa13 += " " + _0x3164dd.content + " ";
                    } else if (_0x3164dd.url) {
                      _0x9eaa13 += " " + _0x24fbbd + " ";
                      if (!_0x11d0f3 && !_0x184f52.includes(_0x3164dd.url)) {
                        _0x184f52.push(_0x3164dd.url);
                      }
                    }
                  } else {
                    _0x9eaa13 += " " + _0x24fbbd + " ";
                  }
                } else if (_0xff9c72.tagName === "BR") {
                  _0x9eaa13 += "\n";
                } else {
                  _0x45b378(_0xff9c72);
                }
              }
            }
          };
          _0x45b378(_0x29256c);
          let _0x5167bb = _0x9eaa13.replace(/[\s\u00A0\u200B-\u200D\uFEFF]+/g, " ").trim();
          if (_0x438444) {
            let _0x40e56d = _0x5167bb;
            if (requiresPromptPresetInput(_0x438444)) {
              const _0x3a43bb = [];
              _0x5a92a4.text.forEach(_0x312c37 => {
                const _0x3ba229 = (_0x312c37.labels || [_0x312c37.label]).map(_0x5736ee => new RegExp(_0x5736ee.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/\s+/g, "[\\s\\u00A0]*"), "g"));
                if (!_0x312c37.used && _0x312c37.content && !_0x3ba229.some(_0x4ce0fb => _0x4ce0fb.test(_0x5167bb))) {
                  _0x3a43bb.push(_0x312c37.content);
                  _0x312c37.used = true;
                }
              });
              _0x40e56d = [..._0x3a43bb, _0x5167bb].filter(Boolean).join("\n").trim();
            }
            _0x5167bb = resolvePromptPresetTemplate(_0x438444, _0x40e56d, {
              hasImageInput: _0x11a79e
            });
          } else {
            _0x5167bb = _0x5167bb || "";
          }
          return _0x5167bb;
        };
        let _0x5e8770 = _0x228d15(this.promptEl);
        const _0x156e2b = _0x4f6f0d.flatMap(_0x18bb67 => (_0x18bb67.labels || [_0x18bb67.label]).map(_0x31f2a9 => ({
          ref: _0x18bb67,
          label: _0x31f2a9
        }))).sort((_0x57b2d2, _0x3150db) => _0x3150db.label.length - _0x57b2d2.label.length);
        _0x156e2b.forEach(({
          ref: _0x3c204,
          label: _0x121e67
        }) => {
          if (!_0x3c204.used) {
            const _0x272a67 = new RegExp(_0x121e67.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/\s+/g, "[\\s\\u00A0]*"), "g");
            if (_0x272a67.test(_0x5e8770)) {
              _0x3c204.used = true;
              if (_0x3c204.content) {
                _0x5e8770 = _0x5e8770.replace(_0x272a67, " " + _0x3c204.content + " ");
              } else if (_0x3c204.url) {
                _0x5e8770 = _0x5e8770.replace(_0x272a67, " " + _0x121e67.trim() + " ");
                if (!_0x11d0f3 && !_0x184f52.includes(_0x3c204.url)) {
                  _0x184f52.push(_0x3c204.url);
                }
              }
            }
          }
        });
        let _0x4bb492 = "";
        _0x5a92a4.text.forEach(_0x54565d => {
          if (!_0x54565d.used && _0x54565d.content) {
            _0x4bb492 += _0x54565d.content + "\n";
            _0x54565d.used = true;
          }
        });
        if (_0x4bb492) {
          _0x5e8770 = _0x4bb492 + _0x5e8770;
        }
        if (!_0x11d0f3) {
          _0x4f6f0d.forEach(_0xea5e5e => {
            if (!_0xea5e5e.used && _0xea5e5e.url && !_0x184f52.includes(_0xea5e5e.url)) {
              _0x184f52.push(_0xea5e5e.url);
            }
          });
        }
        if (requiresPromptPresetInput(_0x438444)) {
          _0x49b77d.forEach(_0x288494 => {
            const _0x2f3ecb = resolveEffectiveInputKind(_0x288494) || _0x288494.type;
            if (_0x2f3ecb === "image" && _0x288494.url && !_0x184f52.includes(_0x288494.url)) {
              _0x184f52.push(_0x288494.url);
            }
          });
        }
        _0x184f52 = reorderImageInputUrlsByRefOrder(_0x184f52, _0x5a92a4.image);
        if (_0x1defc2 === "image") {
          if (_0x1307d5) {
            _0x184f52 = [_0x1307d5];
          } else if (Number.isFinite(_0x42a0c6)) {
            _0x184f52 = _0x184f52.slice(0, _0x42a0c6);
          }
        }
        if (_0x11d0f3) {
          const _0x362c51 = ["replaceTarget", "replacedImage"];
          const _0x149e39 = _0x5a92a4.image || [];
          const _0xfa572a = _0x941a88 => String(_0x149e39.find(_0x600660 => String(_0x600660.refSlot || "") === _0x941a88)?.url || "");
          const _0x4f5f9e = String(_0x149e39[0]?.url || "");
          const _0x1ce33c = String(_0x149e39.find(_0x21d8ad => String(_0x21d8ad.url || "") !== _0x4f5f9e)?.url || "");
          const _0x3931e7 = _0xfa572a(_0x362c51[0]) || _0x4f5f9e;
          const _0x2d6bea = _0xfa572a(_0x362c51[1]) || _0x1ce33c;
          _0x184f52 = [_0x3931e7, _0x2d6bea].filter(Boolean);
        }
        if (_0x57cc14) {
          _0x184f52 = _0x184f52.filter(Boolean).slice(0, _0x399dbb);
        }
        const _0x229583 = _0x11d0f3 ? {} : buildInputUrlsByFixedImageSlot({
          fixedInputConfig: _0x45cca7,
          imageRefs: _0x5a92a4.image,
          assetInputRefs: _0x209fa3
        });
        const _0x52d351 = !!this._data?.rhAiAppManifestBundle && _0x229583 && typeof _0x229583 === "object" && !Array.isArray(_0x229583);
        const _0x240320 = this._data.generationParams && typeof this._data.generationParams === "object" && !Array.isArray(this._data.generationParams) ? this._data.generationParams : {};
        const _0x1bd66b = normalizeDreaminaImageModel(this._data.model, this._data.provider) || this._data.model;
        const _0x52d74e = getModelManifest(_0x1bd66b);
        if (!_0x52d74e) {
          throw new Error("Missing model manifest: " + this._data.model);
        }
        const _0x5cbd02 = sanitizeTaskGenerationParams(_0x1bd66b, _0x240320);
        const _0x5aaa88 = _0x52d74e.adapterType === "modelApi";
        const _0x216608 = Array.isArray(_0x52d74e?.uiSchema?.fields) ? _0x52d74e.uiSchema.fields : [];
        const {
          getManifestField: _0x16db2e,
          readSchemaParam: _0x590478,
          requireSchemaParam: _0x26038f
        } = createSchemaParamAccess({
          model: _0x1bd66b,
          data: this._data,
          generationParams: _0x5cbd02,
          manifestFields: _0x216608
        });
        const _0x5ec3cc = _0x16db2e("imageSize") ? _0x26038f("imageSize") : undefined;
        const _0x2ac995 = _0x16db2e("aspectRatio") ? _0x26038f("aspectRatio") : "自适应";
        const _0x1b282a = resolveImageNodeBatchSize({
          data: this._data,
          generationParams: _0x5cbd02,
          rawGenerationParams: _0x240320
        });
        const _0x478fd1 = _0x5aaa88 && _0x16db2e("google_image_search") ? normalizeTaskBooleanParam(_0x590478("google_image_search")) : undefined;
        const _0x2d8863 = _0x5aaa88 && _0x16db2e("google_search") ? normalizeTaskBooleanParam(_0x590478("google_search")) || _0x478fd1 === true : undefined;
        const _0x4fa89a = buildImageSchemaPayloadParams({
          enabled: _0x5aaa88 || _0x52d74e.adapterType === "workflow",
          manifestFields: _0x216608,
          readSchemaParam: _0x590478
        });
        let _0x2bb17e = _0x1bd66b || "nano-banana-2";
        const _0x36763f = _0x5aaa88 ? _0x590478("mode") : undefined;
        const _0x4be448 = _0x590478("rhModelRoute");
        const _0x313cb4 = resolveNanoBananaSelectionFromModel(_0x2bb17e, _0x5ec3cc || "2K", this._data.provider);
        if (_0x313cb4) {
          if (!_0x5aaa88 && _0x36763f !== undefined) {
            _0x2bb17e = resolveNanoBananaModelBySelection({
              family: _0x313cb4.family,
              mode: _0x36763f,
              imageSize: _0x5ec3cc || "2K",
              provider: _0x313cb4.provider || this._data.provider
            });
          } else if (!_0x5aaa88) {
            _0x2bb17e = _0x313cb4.model;
          }
        }
        if (isDreaminaImageModel(_0x2bb17e, this._data.provider)) {
          _0x2bb17e = normalizeDreaminaImageModel(_0x2bb17e, this._data.provider) || getDefaultDreaminaImageModelId();
        }
        const _0x34d4bc = this._inferProviderFromModel(_0x2bb17e, this._data.provider);
        const _0x129f06 = resolveImageSizeForProviderModel({
          provider: _0x34d4bc,
          model: _0x2bb17e,
          imageSize: _0x5ec3cc
        });
        if (!getModelManifest(_0x2bb17e)) {
          _0x2bb17e = resolveGrsaiGptImage2ModelForSize({
            provider: _0x34d4bc,
            model: _0x2bb17e,
            imageSize: _0x129f06
          });
        }
        const _0xa14183 = isRunningHubWorkflowNode({
          ...this._data,
          model: _0x2bb17e,
          provider: _0x34d4bc
        });
        if (_0xa14183) {
          const _0x1d94f2 = _0x4bd016?.[this.nodeId] || this._data || {};
          getPromptAssetInputRefsFromNode(_0x1d94f2, {
            allowedTypes: ["image"]
          }).forEach(_0x4739da => {
            if (resolveEffectiveInputKind(_0x4739da) !== "image") {
              return;
            }
            if (_0x4739da.url && !_0x184f52.includes(_0x4739da.url)) {
              _0x184f52.push(_0x4739da.url);
            }
          });
        }
        if (_0x34d4bc === "dreamina") {
          const _0x3757d9 = [];
          const _0x44b3bf = _0x7e18e1 => {
            const _0x5140f3 = String(_0x7e18e1 || "").trim();
            if (!_0x5140f3 || _0x5140f3.startsWith("blob:")) {
              return;
            }
            if (!_0x3757d9.includes(_0x5140f3)) {
              _0x3757d9.push(_0x5140f3);
            }
          };
          (_0x5a92a4.image || []).forEach(_0x39c239 => {
            const _0x3e91aa = _0x4bd016?.[_0x39c239?.sourceId] || null;
            const _0xdee3e2 = _0x3e91aa ? resolveGenerationInputImageUrl(_0x3e91aa) : "";
            _0x44b3bf(_0xdee3e2);
            _0x44b3bf(_0x39c239?.url);
          });
          _0x184f52 = _0x3757d9.slice(0, 1);
        }
        const _0x3b63cf = _0x184f52.map(_0x5dafc5 => String(_0x23d16b.get(_0x5dafc5) || ""));
        const _0x338a0e = [...(_0x5a92a4.text || []).map(_0x615b5e => ({
          kind: "text",
          refSlot: _0x615b5e?.refSlot || ""
        })), ...(_0x5a92a4.image || []).filter(_0x2ec35e => String(_0x2ec35e?.url || "").trim()).map(_0x4ab8ef => ({
          kind: "image",
          refSlot: _0x4ab8ef?.refSlot || ""
        })), ...(_0x5a92a4.video || []).filter(_0x53003d => String(_0x53003d?.url || "").trim()).map(_0x33a46e => ({
          kind: "video",
          refSlot: _0x33a46e?.refSlot || ""
        })), ...(_0x5a92a4.audio || []).filter(_0x598dcd => String(_0x598dcd?.url || "").trim()).map(_0xc59776 => ({
          kind: "audio",
          refSlot: _0xc59776?.refSlot || ""
        })), ..._0x209fa3.map(_0x32f5ce => ({
          kind: resolveEffectiveInputKind(_0x32f5ce) || _0x32f5ce?.type,
          refSlot: _0x32f5ce?.refSlot || ""
        })).filter(_0x19c46c => String(_0x19c46c.kind || "").trim())];
        const _0x3b3f1b = countManifestInputRecords(_0x338a0e);
        _0x3b3f1b.image = _0x184f52.filter(Boolean).length;
        const _0x1000e3 = {
          ...buildFixedSlotOccupancy({
            fixedInputConfig: _0x45cca7,
            inputRecords: _0x338a0e
          }),
          ...Object.fromEntries(Object.entries(_0x229583 || {}).filter(([, _0x3dde13]) => String(_0x3dde13 || "").trim()).map(([_0x30387e]) => [_0x30387e, true]))
        };
        const _0x3aa758 = shouldAllowEmptyCustomAiAppInputs(_0x52d74e);
        const _0x1a7ecb = _0x3aa758 ? null : getMissingManifestInputRequirement({
          inputSlots: _0x52d74e?.inputSlots,
          fixedInputConfig: _0x45cca7,
          inputCounts: _0x3b3f1b,
          occupiedFixedSlots: _0x1000e3
        });
        if (_0x1defc2 === "image" && _0x184f52.length === 0) {
          window.showToast?.(getImageInputGateMissingMessage(_0x109f66) || t("aigenImage.task.referenceImageRequired"), "warn");
          return null;
        }
        if (_0x11d0f3 && _0x184f52.length < 2) {
          window.showToast?.(t("aigenImage.task.replacePairRequired"), "warn");
          return null;
        }
        if (_0x57cc14 && _0x184f52.length < 1) {
          window.showToast?.(t("aigenImage.task.referenceImageRequired"), "warn");
          return null;
        }
        if (_0x1a7ecb) {
          window.showToast?.(_0x1a7ecb.kind === "image" ? t("aigenImage.task.referenceImageRequired") : t("aigenImage.task.promptOrReferenceRequired"), "warn");
          return null;
        }
        const _0x6e8dec = getPromptPresetTemplateEmptyInputMessage(_0x438444);
        if (_0x6e8dec && !_0x5e8770 && _0x184f52.length === 0) {
          window.showToast?.(_0x6e8dec, "warn");
          return null;
        }
        const _0x1e46e5 = evaluateGenerationPromptBoundary({
          model: _0x2bb17e,
          provider: _0x34d4bc,
          promptText: _0x5e8770,
          hasInput: Object.values(_0x3b3f1b).some(_0x2eaaae => Number(_0x2eaaae) > 0)
        });
        if (!_0x1e46e5.ok) {
          console.warn("[AIGenerateNode] prompt boundary blocked generation");
          window.showToast?.(t("aigenImage.task.promptOrReferenceRequired"), "warn");
          return null;
        }
        const _0x237908 = String(_0x4bd016?.[this.nodeId]?.providerProfileId || _0x4bd016?.[this.nodeId]?.rhProviderProfileId || this._data?.providerProfileId || this._data?.rhProviderProfileId || "").trim();
        const _0x3fa530 = resolveModelGenerationProviderProfileId(_0x2bb17e, _0x34d4bc, _0x237908);
        await _0x1ea311();
        const _0x1f193b = _0x4c4f74(_0x3fa530 || _0x34d4bc);
        let _0x147f0d = "";
        if (_0x34d4bc === "runninghub") {
          _0x147f0d = isModelApiModel(_0x2bb17e, _0x34d4bc) ? _0x1f193b.modelApiKey || "" : _0x1f193b.apiKey || "";
        } else if (_0x34d4bc === "runninghubwf") {
          _0x147f0d = _0x1f193b.apiKey || "";
        } else {
          _0x147f0d = _0x1f193b.apiKey || window._appApiKey || "";
        }
        let _0x51e0f8 = String(window.__aicInstallId || "").trim();
        if (typeof window.ensureSubscriptionInstallId === "function") {
          try {
            _0x51e0f8 = String(await window.ensureSubscriptionInstallId()).trim();
          } catch {}
        }
        const _0x5c8d4f = String(_0x2ac995 || "自适应").trim();
        const _0x2e470f = isAdaptiveRatioLabel(_0x5c8d4f);
        const _0x5c2698 = _0x3ebbe9.filter(_0x45c079 => {
          const _0x436a0b = String(_0x45c079?.refSlot || "").toLowerCase();
          if (_0x436a0b.includes("mask")) {
            return false;
          }
          const _0x5c9fbe = _0x4bd016?.[_0x45c079?.sourceId];
          return resolveEffectiveInputKind(_0x5c9fbe, _0x45c079) === "image";
        });
        const _0x4c9fb5 = pickGenerationRatioSourceEdge(_0x5c2698, _0x4bd016?.[this.nodeId] || this._data || {});
        let _0x2fb563 = 0;
        let _0x4804bb = 0;
        if (_0x4c9fb5?.sourceId) {
          const _0x5b3d36 = _0x4c9fb5.sourceId;
          const _0x4b0382 = getGenerationRatioSizeWithDom({
            nodeId: _0x5b3d36,
            nodeData: _0x4bd016[_0x5b3d36],
            edge: _0x4c9fb5,
            includeNodeFrame: true
          });
          if (_0x4b0382) {
            _0x2fb563 = _0x4b0382.width;
            _0x4804bb = _0x4b0382.height;
          }
        }
        const _0x11595f = _0x4bd016?.[this.nodeId] || {};
        const _0x211423 = resolveAdaptiveSourceSize({
          displayWidth: Number(_0x11595f?.width || this._data?.width || 0),
          displayHeight: Number(_0x11595f?.height || this._data?.height || 0),
          inputWidth: _0x2fb563,
          inputHeight: _0x4804bb
        });
        const _0x44da5e = _0x34d4bc === "dreamina" ? normalizeDreaminaImageAspectRatio(_0x5c8d4f) : _0x5c8d4f;
        const _0x16f9c0 = parseRatioLabel(_0x44da5e)?.label || "";
        const _0x39415a = _0x129f06;
        const _0x45be75 = _0x2e470f ? pickClosestRatioForProviderModel({
          provider: _0x34d4bc,
          model: _0x2bb17e,
          width: _0x211423.width,
          height: _0x211423.height,
          imageSize: _0x39415a
        }) : pickClosestRatioForProviderModel({
          provider: _0x34d4bc,
          model: _0x2bb17e,
          ratioLabel: _0x16f9c0 || _0x44da5e || "1:1",
          imageSize: _0x39415a
        });
        const _0x2cb951 = resolveProviderRatioPayload({
          provider: _0x34d4bc,
          model: _0x2bb17e,
          ratioLabel: _0x45be75,
          imageSize: _0x39415a
        });
        const _0x59dda9 = getRatioCapability(_0x34d4bc, _0x2bb17e);
        const _0x3d1346 = _0x59dda9 === "none";
        const _0x172788 = _0x34d4bc === "dreamina" ? normalizeDreaminaImageSize(_0x5ec3cc || "2K", _0x2bb17e) : _0x57cc14 && String(_0x129f06).toUpperCase() === "4K" ? "2K" : _0x129f06;
        const _0x277cb0 = _0x34d4bc === "dreamina" ? getDreaminaImageModelVersion(_0x2bb17e, _0x34d4bc) : "";
        const _0x225c4d = {
          prompt: _0x5e8770,
          model: _0x2bb17e,
          aspectRatio: _0x2cb951.resolvedRatioLabel,
          resolvedRatioLabel: _0x2cb951.resolvedRatioLabel,
          adaptiveSource: _0x211423.source,
          ratioCapability: _0x59dda9,
          imageSize: _0x172788,
          modelVersion: _0x277cb0,
          ..._0x4fa89a,
          ...(_0x36763f !== undefined ? {
            mode: _0x36763f
          } : {}),
          ...(_0x4be448 !== undefined ? {
            rhModelRoute: _0x4be448
          } : {}),
          ...(_0x2d8863 !== undefined ? {
            google_search: _0x2d8863
          } : {}),
          ...(_0x478fd1 !== undefined ? {
            google_image_search: _0x478fd1
          } : {}),
          batchSize: parseInt(_0x1b282a) || 1,
          inputUrls: _0x184f52,
          ...(Object.keys(_0x229583).length > 0 ? {
            inputUrlsBySlot: _0x229583
          } : {}),
          ...(_0x52d351 ? _0x229583 : {}),
          inputMaskUrls: _0x3b63cf,
          apiKey: _0x147f0d,
          installId: _0x51e0f8,
          rhResolution: _0x590478("rhResolution") ?? _0x590478("rhAnimeRealResolution"),
          rhAnimeRealResolution: _0x590478("rhAnimeRealResolution"),
          rhInstanceType: _0x590478("rhInstanceType"),
          rhQwenEditMode: _0x57cc14 ? String(_0x590478("rhQwenEditMode") || "").trim() : undefined,
          rhQwenFirstImageMode: _0x57cc14 ? String(_0x590478("rhQwenFirstImageMode") || "").trim() : undefined,
          provider: _0x34d4bc,
          ...(_0x3fa530 ? {
            providerProfileId: _0x3fa530
          } : {}),
          cameraAngle: this._data.cameraAngle || null,
          ratioNotice: _0x2cb951.notice || "",
          ...(_0x3d1346 ? {
            suppressAspectRatio: true
          } : {})
        };
        return _0x528a15.bind(_0x225c4d);
      } finally {
        _0x528a15.release();
      }
    }
    async _handleGenerateOrCancel(_0x1e89c6 = null) {
      const _0x12cfc0 = _0x5852a4.getState().nodes?.[this.nodeId] || this._data || {};
      const _0x52c521 = this._isRunninghubWorkflowModel(_0x12cfc0?.model, _0x12cfc0?.provider);
      if (shouldAllowCancel(_0x12cfc0, {
        cancellable: _0x52c521,
        cancelInFlight: this._rhCancelInFlight === true
      })) {
        await this._cancelRunningHubWorkflowTask();
        return;
      }
      await this._onGenerate(_0x1e89c6);
    }
    _buildRunningHubCancelResultPatch({
      latest = {},
      message = t("aigenImage.task.interrupted"),
      code = null,
      duration = null,
      taskId = ""
    } = {}) {
      const _0x36b30d = Number(latest?.rhTaskStartedAt || latest?.generationStartTime || 0);
      const _0x1c6171 = String(message || t("aigenImage.task.interrupted")).trim() || t("aigenImage.task.interrupted");
      const _0x2293fd = code === null || code === undefined || code === "" ? null : Number(code);
      return {
        rhStatusMessage: _0x1c6171,
        rhStatusCode: Number.isFinite(_0x2293fd) ? _0x2293fd : null,
        images: [],
        imageUrl: "",
        thumbUrl: "",
        localPath: "",
        ...buildGenerationCancelledPatch({
          startedAt: _0x36b30d,
          duration: duration
        }),
        ...this._buildRunningHubTaskPatch({
          taskId: taskId,
          status: "cancelled",
          startedAt: _0x36b30d,
          recovering: false,
          useOpenapiQuery: latest?.rhTaskUseOpenapiQuery === true
        })
      };
    }
    async _cancelRunningHubWorkflowTask() {
      const _0x20294a = _0x5852a4.getState().nodes?.[this.nodeId] || this._data || {};
      const _0x5f7b31 = this._rhApiKey || "";
      const _0x393918 = String(this._rhTaskId || "").trim() || String(_0x20294a?.rhTaskId || "").trim();
      const _0x2857a0 = Date.now();
      const _0xf1fc02 = Number(_0x20294a?.generationStartTime);
      const _0x462600 = _0x20294a?.generationDuration != null ? _0x20294a.generationDuration : Number.isFinite(_0xf1fc02) && _0xf1fc02 > 0 ? Math.max(0, _0x2857a0 - _0xf1fc02) : 0;
      this._rhCancelRequested = true;
      if (this._rhCancelInFlight) {
        return;
      }
      if (this._rhAbortController && !this._rhAbortController.signal.aborted) {
        this._rhAbortController.abort();
      }
      const _0x2cfc57 = !_0x5f7b31;
      const _0x97e272 = !_0x393918;
      try {
        this._rhCancelInFlight = true;
        const _0x347c6c = ({
          remoteResult: _0x53e892,
          remoteError: _0x23e3f8
        }) => {
          const _0x2ea0b9 = Number(_0x53e892?.code);
          const _0x229f41 = String(_0x53e892?.msg || _0x53e892?.message || "").trim();
          const _0x54626a = _0x2cfc57 ? t("aigenImage.task.cancelMissingApiKey") : _0x97e272 ? t("aigenImage.task.interruptedMissingTaskId") : "";
          const _0x157aa3 = _0x54626a || (_0x23e3f8 ? _0x23e3f8.message || t("aigenImage.task.cancelFailed") : _0x2ea0b9 === 0 ? _0x229f41 || t("aigenImage.task.cancelSuccess") : _0x2ea0b9 === 807 ? _0x229f41 || t("aigenImage.task.taskNotFound") : _0x229f41 || t("aigenImage.task.cancelFailed"));
          return this._buildRunningHubCancelResultPatch({
            latest: _0x20294a,
            message: _0x157aa3,
            code: _0x97e272 ? 813 : _0x2ea0b9,
            duration: _0x462600
          });
        };
        await cancelTask(this.nodeId, {
          store: _0x5852a4,
          taskId: _0x393918,
          cancellable: true,
          cancel: ({
            taskId: _0x5353dc
          }) => {
            if (!_0x5f7b31) {
              throw new Error(t("aigenImage.task.cancelMissingApiKey"));
            }
            return _0x57b846.cancelRunningHubWorkflowTask({
              apiKey: _0x5f7b31,
              taskId: _0x5353dc,
              providerProfileId: _0x20294a?.providerProfileId || _0x20294a?.rhProviderProfileId || ""
            });
          },
          cancelledBuilder: _0x347c6c,
          spec: createGenerationCancelPlanFromNode({
            kind: "image",
            node: _0x20294a,
            taskProtocol: "workflow",
            sourceNodeId: this.nodeId,
            targetNodeId: this.nodeId,
            trigger: "node",
            taskType: "image-generation",
            payload: _0x20294a,
            cancellable: true,
            resumable: true,
            cancelledBuilder: _0x347c6c
          })
        });
        this._persistRunningHubResumeCache();
        const _0x37dbdc = _0x5852a4.getState().nodes?.[this.nodeId] || {};
        const _0x1f0fb9 = Number(_0x37dbdc?.rhStatusCode);
        const _0x1e617e = String(_0x37dbdc?.rhStatusMessage || "").trim();
        if (!_0x2cfc57 && !_0x97e272) {
          if (_0x1f0fb9 === 0) {
            window.showToast?.(t("aigenImage.task.cancelledToast"), "success");
          } else if (_0x1e617e) {
            window.showToast?.(_0x1e617e, "error");
          }
        }
      } finally {
        this._rhCancelInFlight = false;
        this._isGenerating = false;
        this._rhAbortController = null;
        this._rhTaskId = null;
        this._rhApiKey = null;
        if (this.btnEl) {
          resetGenerateButtonIdleUi(this.btnEl);
          this._updateSubmitButtonState();
        }
        _0x15de9c(this.previewEl);
      }
    }
    _getPreviewGenerateButtonLoadingOptions() {
      return createPreviewGenerateButtonCallbacks(this, t("aigenImage.controls.generate"));
    }
    async runGeneration(_0xf03851 = {}) {
      return this._onGenerate(null, _0xf03851);
    }
    async cancelGeneration() {
      return this._cancelRunningHubWorkflowTask();
    }
    getGenerationStatus() {
      const _0x489758 = _0x5852a4.getState?.()?.nodes?.[this.nodeId] || this._data || {};
      const _0x5c1515 = String(_0x489758.jobStatus || _0x489758.asyncTaskStatus || _0x489758.rhTaskStatus || (this._isGenerating ? "running" : "idle"));
      return {
        nodeId: this.nodeId,
        jobStatus: _0x5c1515,
        isGenerating: this._isGenerating === true || _0x5c1515 === "running" || _0x5c1515 === "pending",
        taskId: String(this._rhTaskId || _0x489758.rhTaskId || _0x489758.asyncTaskId || _0x489758.taskId || ""),
        cancellable: true,
        resumable: Boolean(_0x489758.asyncTaskId || _0x489758.rhTaskId)
      };
    }
    async _onGenerate(_0x3a7a95 = null, _0x552a80 = {}) {
      if (this._isGenerating || this._generationSubmitInFlight === true) {
        return;
      }
      if (_0x552a80?.insertPrompt === true || shouldUsePromptPreviewForPreset(_0x3a7a95) || isPreviewModeEnabled()) {
        return this._executeGeneration(_0x3a7a95, _0x552a80);
      }
      this._generationSubmitInFlight = true;
      if (this.btnEl) {
        setGenerateButtonLoadingUi(this.btnEl, {
          title: t("aigenImage.task.submitting"),
          disabled: true,
          ariaLabel: t("aigenImage.task.submitting")
        });
      }
      try {
        return await this._executeGeneration(_0x3a7a95, _0x552a80);
      } finally {
        this._generationSubmitInFlight = false;
        if (!this._isGenerating && this.btnEl) {
          this._updateSubmitButtonState?.();
        }
      }
    }
    async _executeGeneration(_0x22d989 = null, _0x1d69d6 = {}) {
      if (_0x1d69d6?.insertPrompt === true) {
        insertPresetPromptIntoEditor({
          storeApi: _0x5852a4,
          nodeId: this.nodeId,
          promptEl: this.promptEl,
          template: _0x22d989,
          inEdges: _0x5852a4.getIncomingEdges(this.nodeId),
          nodes: _0x5852a4.getState().nodes || {},
          allowedAssetTypes: ["text", "image"]
        });
        this._updateSubmitButtonState?.();
        return;
      }
      if (shouldUsePromptPreviewForPreset(_0x22d989)) {
        const _0x39dcef = await this._buildPayload(_0x22d989);
        if (!_0x39dcef) {
          return;
        }
        try {
          previewPresetPromptInEditor({
            storeApi: _0x5852a4,
            nodeId: this.nodeId,
            promptEl: this.promptEl,
            promptText: _0x39dcef.prompt
          });
        } finally {
          releasePayloadObjectUrlLease(_0x39dcef);
        }
        return;
      }
      if (isPreviewModeEnabled()) {
        if (!isPreviewNodeLoading(this.nodeId)) {
          startPreviewNodeLoading(this.nodeId, this.previewEl, this._getPreviewGenerateButtonLoadingOptions());
        }
        return;
      }
      const _0x55b138 = _0x5852a4.getState?.()?.nodes?.[this.nodeId] || this._data || {};
      const _0x14e3a8 = guardModelGenerationCredentials({
        modelId: _0x55b138?.model,
        provider: _0x55b138?.provider,
        providerProfileId: _0x55b138?.providerProfileId || _0x55b138?.rhProviderProfileId
      });
      if (!_0x14e3a8.ready) {
        return;
      }
      const _0x587166 = await this._buildPayload(_0x22d989);
      if (!_0x587166) {
        return {
          ok: false,
          status: "failed",
          errorCode: "GENERATION_INPUT_INVALID",
          message: t("aigenImage.task.promptOrReferenceRequired"),
          targetNodeId: this.nodeId,
          taskId: ""
        };
      }
      try {
        const _0x4f8f99 = getImageProviderApiKeyMissingMessage(_0x587166);
        if (_0x4f8f99) {
          showProviderApiKeyMissingToast(_0x4f8f99, {
            providerId: _0x587166?.providerProfileId || _0x587166?.provider,
            model: _0x587166?.model,
            adapterType: isModelApiModel(_0x587166?.model, "runninghub") ? "modelApi" : _0x587166?.adapterType
          });
          return;
        }
        const _0x1b0b70 = this._isDreaminaImageNode(_0x587166);
        if (_0x1b0b70) {
          if (this._dreaminaLoginPreflightInFlight) {
            return;
          }
          this._dreaminaLoginPreflightInFlight = true;
          if (this.btnEl) {
            setGenerateButtonLoadingUi(this.btnEl, {
              title: t("aigenImage.task.checkingDreaminaLogin")
            });
          }
          let _0x4ef9da = false;
          try {
            _0x4ef9da = await this._ensureDreaminaCliLoggedIn(_0x587166);
          } finally {
            this._dreaminaLoginPreflightInFlight = false;
            if (!_0x4ef9da && this.btnEl) {
              resetGenerateButtonIdleUi(this.btnEl);
              this._updateSubmitButtonState?.();
            }
          }
          if (!_0x4ef9da) {
            return;
          }
        }
        const _0x1e45bb = this._isRunninghubTaskModel(_0x587166.model, _0x587166.provider);
        const _0x3738a2 = this._isRunninghubWorkflowModel(_0x587166.model, _0x587166.provider);
        const _0x406db5 = _0x1b0b70;
        const _0x5c21e5 = this._inferProviderFromModel(_0x587166?.model, _0x587166?.provider || this._data?.provider || "");
        const _0x1a00c4 = !_0x1e45bb && !_0x406db5 && isAsyncImageModelApiProvider(_0x5c21e5);
        const _0x30ea3c = resolveModelProvider(_0x587166?.model, _0x587166?.provider, {
          allowProviderHint: false
        }) === "runninghub" && isModelApiModel(_0x587166?.model, "runninghub");
        const _0x357cf2 = shouldUseImageWorkflowBusyButton(_0x587166.model);
        if (_0x1e45bb) {
          this._stopRunningHubRecovery(true);
        }
        if (_0x406db5) {
          this._stopDreaminaRecovery(true);
        }
        if (_0x1a00c4) {
          this._stopAsyncRecovery(true);
        }
        this._rhCancelRequested = false;
        const _0x3946bb = _0x1e45bb || _0x406db5 || _0x1a00c4;
        this._rhApiKey = _0x1e45bb ? _0x587166.apiKey : null;
        this._rhTaskId = null;
        this._rhAbortController = _0x3946bb ? new AbortController() : null;
        this._isGenerating = true;
        if (this.btnEl) {
          if (_0x3738a2) {
            setGenerateButtonCancellableUi(this.btnEl, {
              busy: _0x357cf2
            });
          } else {
            setGenerateButtonLoadingUi(this.btnEl);
          }
        }
        _0x576eb5(this.previewEl);
        const _0x37f105 = Number(_0x5852a4.getState().nodes?.[this.nodeId]?.generationStartTime || this._data?.generationStartTime || 0);
        const _0xfba456 = Math.max(Date.now(), Number.isFinite(_0x37f105) ? Math.trunc(_0x37f105) + 1 : 0);
        const _0x450406 = {
          ...buildGenerationStartPatch({
            startedAt: _0xfba456
          }),
          rhStatusMessage: null,
          rhStatusCode: null
        };
        if (_0x1e45bb) {
          if (_0x587166?.providerProfileId) {
            _0x450406.rhProviderProfileId = normalizeRunningHubModelApiProfileId(_0x587166?.providerProfileId);
          }
          Object.assign(_0x450406, this._buildRunningHubTaskPatch({
            taskId: "",
            status: "pending",
            startedAt: _0xfba456,
            recovering: false,
            useOpenapiQuery: _0x30ea3c
          }));
          Object.assign(_0x450406, {
            ...this._buildDreaminaTaskPatch({
              submitId: "",
              status: "idle",
              phase: "idle",
              label: "",
              startedAt: 0,
              lastCheckedAt: 0,
              recovering: false,
              raw: {}
            }),
            ...this._buildAsyncTaskPatch({
              provider: "",
              kind: "image",
              taskId: "",
              status: "idle",
              startedAt: 0,
              recovering: false
            })
          });
        }
        if (_0x406db5) {
          Object.assign(_0x450406, this._buildDreaminaTaskPatch({
            submitId: "",
            status: "pending",
            phase: "generating",
            label: t("aigenImage.task.submitting"),
            startedAt: _0xfba456,
            lastCheckedAt: 0,
            recovering: false,
            raw: {}
          }));
          Object.assign(_0x450406, {
            ...this._buildRunningHubTaskPatch({
              taskId: "",
              status: "idle",
              startedAt: 0,
              recovering: false,
              useOpenapiQuery: false
            }),
            ...this._buildAsyncTaskPatch({
              provider: "",
              kind: "image",
              taskId: "",
              status: "idle",
              startedAt: 0,
              recovering: false
            })
          });
        }
        if (_0x1a00c4) {
          Object.assign(_0x450406, this._buildAsyncTaskPatch({
            provider: _0x5c21e5,
            kind: "image",
            taskId: "",
            status: "pending",
            startedAt: _0xfba456,
            recovering: false
          }));
          Object.assign(_0x450406, {
            ...this._buildRunningHubTaskPatch({
              taskId: "",
              status: "idle",
              startedAt: 0,
              recovering: false,
              useOpenapiQuery: false
            }),
            ...this._buildDreaminaTaskPatch({
              submitId: "",
              status: "idle",
              phase: "idle",
              label: "",
              startedAt: 0,
              lastCheckedAt: 0,
              recovering: false,
              raw: {}
            })
          });
        }
        if (!_0x1e45bb && !_0x406db5 && !_0x1a00c4) {
          Object.assign(_0x450406, {
            ...this._buildRunningHubTaskPatch({
              taskId: "",
              status: "idle",
              startedAt: 0,
              recovering: false,
              useOpenapiQuery: false
            }),
            ...this._buildDreaminaTaskPatch({
              submitId: "",
              status: "idle",
              phase: "idle",
              label: "",
              startedAt: 0,
              lastCheckedAt: 0,
              recovering: false,
              raw: {}
            }),
            ...this._buildAsyncTaskPatch({
              provider: "",
              kind: "image",
              taskId: "",
              status: "idle",
              startedAt: 0,
              recovering: false
            })
          });
        }
        _0x450406.ratioNotice = String(_0x587166?.ratioNotice || "");
        let _0x23170a = null;
        try {
          _0x23170a = await submitTask(createGenerationSubmitPlan({
            kind: "image",
            sourceNodeId: this.nodeId,
            targetNodeId: this.nodeId,
            trigger: "node",
            taskType: "image-generation",
            provider: _0x587166.provider || _0x5c21e5 || this._data?.provider || "",
            adapterType: _0x3738a2 ? "workflow" : "modelApi",
            modelId: _0x587166.model || this._data?.model || "",
            payload: _0x587166,
            cancellable: _0x3738a2,
            resumable: _0x1e45bb || _0x406db5 || _0x1a00c4,
            async: _0x1a00c4,
            pauseOnAbort: _0x3946bb,
            startBuilder: () => _0x450406,
            pauseBuilder: _0x53d7c2 => {
              const _0x47cdb7 = _0x53d7c2.getTaskNode?.() || {};
              if (_0x406db5) {
                return this._buildDreaminaTaskPatch({
                  submitId: String(this._dreaminaActiveSubmitId || "").trim() || String(_0x47cdb7?.dreaminaSubmitId || "").trim(),
                  status: String(_0x47cdb7?.dreaminaTaskStatus || "").trim() || "pending",
                  phase: String(_0x47cdb7?.dreaminaTaskPhase || "").trim() || "generating",
                  label: String(_0x47cdb7?.dreaminaTaskLabel || "").trim() || t("aigenImage.task.generating"),
                  startedAt: _0x53d7c2.startedAt,
                  lastCheckedAt: Date.now(),
                  recovering: false,
                  raw: _0x47cdb7?.dreaminaTaskLastRaw || {}
                });
              }
              if (_0x1e45bb) {
                return this._buildRunningHubTaskPatch({
                  taskId: String(this._rhTaskId || "").trim() || String(_0x47cdb7?.rhTaskId || "").trim() || String(_0x53d7c2?.taskId || "").trim(),
                  status: String(_0x47cdb7?.rhTaskStatus || "").trim() || "running",
                  startedAt: _0x53d7c2.startedAt,
                  recovering: false,
                  useOpenapiQuery: _0x47cdb7?.rhTaskUseOpenapiQuery === true || _0x30ea3c
                });
              }
              return {};
            },
            onTaskStart: () => {
              this._syncLocalTaskNodeData();
              if (_0x1e45bb) {
                this._persistRunningHubResumeCache();
              }
              if (_0x406db5) {
                this._persistDreaminaResumeCache();
              }
              if (_0x1a00c4) {
                this._persistAsyncResumeCache();
              }
            },
            submit: async (_0xc56c67, _0x5eb9c9 = {}) => _0x57b846.generateImage(_0x587166, {
              taskKey: "node:" + this.nodeId + ":image:" + _0xfba456,
              ...(this._rhAbortController ? {
                signal: this._rhAbortController.signal
              } : {}),
              runningHubWorkflowQueueLease: _0x5eb9c9.runningHubWorkflowQueueLease,
              onProgress: _0x406db5 ? (_0x448191 = {}) => {
                const _0xbf4654 = String(_0x448191?.status || "pending").trim() || "pending";
                const _0x3b3d1d = String(_0x448191?.phase || "generating").trim() || "generating";
                const _0x57ff78 = String(_0x448191?.failReason || _0x448191?.failureReason || _0x448191?.error || _0x448191?.message || _0x448191?.label || "").trim();
                if (_0xbf4654.toLowerCase() === "failed" || _0xbf4654.toLowerCase() === "fail" || _0xbf4654.toLowerCase() === "error" || _0x3b3d1d.toLowerCase() === "failed" || _0x3b3d1d.toLowerCase() === "fail" || _0x3b3d1d.toLowerCase() === "error") {
                  const _0x1627cd = {
                    error: _0x57ff78 || t("aigenImage.task.generationFailed"),
                    startedAt: _0xfba456,
                    submitId: String(_0x448191?.submitId || "").trim() || String(_0x40ea98(_0x5eb9c9, this.nodeId)?.dreaminaSubmitId || "").trim(),
                    lastCheckedAt: Number(_0x448191?.lastCheckedAt || Date.now()),
                    raw: _0x448191?.raw || {}
                  };
                  if (_0x5eb9c9.isBackgroundTask?.()) {
                    _0x40bba9(_0x5eb9c9, this.nodeId, this._buildDreaminaFailurePatch(_0x1627cd));
                  } else {
                    this._finalizeDreaminaImageFailure(_0x1627cd);
                  }
                  return;
                }
                const _0x4d8772 = {
                  submitId: String(_0x448191?.submitId || "").trim() || String(_0x40ea98(_0x5eb9c9, this.nodeId)?.dreaminaSubmitId || "").trim(),
                  status: _0xbf4654,
                  phase: _0x3b3d1d,
                  label: String(_0x448191?.label || t("aigenImage.task.generating")).trim() || t("aigenImage.task.generating"),
                  startedAt: _0xfba456,
                  lastCheckedAt: Number(_0x448191?.lastCheckedAt || Date.now()),
                  recovering: false,
                  raw: _0x448191?.raw || {}
                };
                if (_0x5eb9c9.isBackgroundTask?.()) {
                  const _0x56abd4 = _0x40ea98(_0x5eb9c9, this.nodeId);
                  _0x40bba9(_0x5eb9c9, this.nodeId, {
                    generationStartTime: Number(_0x56abd4?.generationStartTime) > 0 ? Number(_0x56abd4.generationStartTime) : Number(_0x4d8772.startedAt || Date.now()),
                    generationDuration: null,
                    ...this._buildDreaminaTaskPatch(_0x4d8772)
                  });
                } else {
                  this._applyDreaminaTaskPatch(_0x4d8772);
                }
              } : undefined,
              onTaskMeta: ({
                taskId: _0x3264da,
                useOpenapiQuery: _0x3459cb,
                provider: _0x44fe63
              }) => {
                const _0x4451f1 = String(_0x3264da || "").trim();
                if (!_0x4451f1) {
                  return;
                }
                if (_0x1e45bb) {
                  this._rhTaskId = _0x4451f1;
                  _0x5eb9c9.onTaskId?.(_0x4451f1);
                  _0x40bba9(_0x5eb9c9, this.nodeId, {
                    rhStatusMessage: null,
                    rhStatusCode: null,
                    rhTaskUseOpenapiQuery: _0x3459cb === true
                  });
                  if (!_0x5eb9c9.isBackgroundTask?.()) {
                    this._syncLocalTaskNodeData();
                    this._persistRunningHubResumeCache();
                  }
                  if (_0x3738a2 && this._rhCancelRequested) {
                    this._cancelRunningHubWorkflowTask();
                  }
                  return;
                }
                if (_0x406db5) {
                  this._dreaminaActiveSubmitId = _0x4451f1;
                  const _0x16de21 = {
                    submitId: _0x4451f1,
                    status: "pending",
                    phase: "generating",
                    label: t("aigenImage.task.generating"),
                    startedAt: _0xfba456,
                    lastCheckedAt: Date.now(),
                    recovering: false,
                    raw: {}
                  };
                  if (_0x5eb9c9.isBackgroundTask?.()) {
                    const _0x4dcb06 = _0x40ea98(_0x5eb9c9, this.nodeId);
                    _0x40bba9(_0x5eb9c9, this.nodeId, {
                      generationStartTime: Number(_0x4dcb06?.generationStartTime) > 0 ? Number(_0x4dcb06.generationStartTime) : Number(_0x16de21.startedAt || Date.now()),
                      generationDuration: null,
                      ...this._buildDreaminaTaskPatch(_0x16de21)
                    });
                  } else {
                    this._applyDreaminaTaskPatch(_0x16de21);
                  }
                  _0x5eb9c9.onTaskId?.(_0x4451f1);
                  return;
                }
                if (_0x1a00c4) {
                  _0x5eb9c9.onTaskId?.(_0x4451f1);
                  _0x40bba9(_0x5eb9c9, this.nodeId, {
                    asyncTaskProvider: this._inferProviderFromModel(_0x587166?.model, _0x44fe63 || _0x5c21e5 || this._data?.provider || ""),
                    asyncTaskKind: "image"
                  });
                  if (!_0x5eb9c9.isBackgroundTask?.()) {
                    this._syncLocalTaskNodeData();
                    this._persistAsyncResumeCache();
                  }
                }
              },
              onTaskId: _0x25a504 => {
                const _0x3e93af = String(_0x25a504 || "").trim();
                if (!_0x3e93af) {
                  return;
                }
                if (_0x1e45bb) {
                  this._rhTaskId = _0x3e93af;
                  _0x5eb9c9.onTaskId?.(_0x3e93af);
                  const _0x439b83 = _0x40ea98(_0x5eb9c9, this.nodeId);
                  _0x40bba9(_0x5eb9c9, this.nodeId, {
                    rhStatusMessage: null,
                    rhStatusCode: null,
                    rhTaskUseOpenapiQuery: _0x439b83?.rhTaskUseOpenapiQuery === true || _0x30ea3c
                  });
                  if (!_0x5eb9c9.isBackgroundTask?.()) {
                    this._syncLocalTaskNodeData();
                    this._persistRunningHubResumeCache();
                  }
                  if (_0x3738a2 && this._rhCancelRequested) {
                    this._cancelRunningHubWorkflowTask();
                  }
                  return;
                }
                if (_0x406db5) {
                  this._dreaminaActiveSubmitId = _0x3e93af;
                  const _0x48b0e1 = {
                    submitId: _0x3e93af,
                    status: "pending",
                    phase: "generating",
                    label: t("aigenImage.task.generating"),
                    startedAt: _0xfba456,
                    lastCheckedAt: Date.now(),
                    recovering: false,
                    raw: {}
                  };
                  if (_0x5eb9c9.isBackgroundTask?.()) {
                    const _0x35ef8e = _0x40ea98(_0x5eb9c9, this.nodeId);
                    _0x40bba9(_0x5eb9c9, this.nodeId, {
                      generationStartTime: Number(_0x35ef8e?.generationStartTime) > 0 ? Number(_0x35ef8e.generationStartTime) : Number(_0x48b0e1.startedAt || Date.now()),
                      generationDuration: null,
                      ...this._buildDreaminaTaskPatch(_0x48b0e1)
                    });
                  } else {
                    this._applyDreaminaTaskPatch(_0x48b0e1);
                  }
                  _0x5eb9c9.onTaskId?.(_0x3e93af);
                  return;
                }
                if (_0x1a00c4) {
                  const _0x5ba32a = _0x40ea98(_0x5eb9c9, this.nodeId);
                  _0x5eb9c9.onTaskId?.(_0x3e93af);
                  _0x40bba9(_0x5eb9c9, this.nodeId, {
                    asyncTaskProvider: this._inferProviderFromModel(_0x5ba32a?.model || _0x587166?.model, _0x5ba32a?.asyncTaskProvider || _0x5c21e5 || this._data?.provider || ""),
                    asyncTaskKind: "image"
                  });
                  if (!_0x5eb9c9.isBackgroundTask?.()) {
                    this._syncLocalTaskNodeData();
                    this._persistAsyncResumeCache();
                  }
                }
              }
            }),
            cancel: _0x3738a2 ? async ({
              taskId: _0x283458
            }) => {
              const _0x1041e4 = this._rhApiKey || _0x587166.apiKey || "";
              const _0x57d76b = String(_0x283458 || "").trim();
              if (!_0x1041e4 || !_0x57d76b) {
                return null;
              }
              return _0x57b846.cancelRunningHubWorkflowTask({
                apiKey: _0x1041e4,
                taskId: _0x57d76b,
                providerProfileId: _0x587166?.providerProfileId || _0x587166?.rhProviderProfileId || ""
              });
            } : undefined,
            resultBuilder: async (_0x2cba00, _0x439f0f) => {
              const _0x2d1e01 = this._getImageGenerationResultError(_0x2cba00);
              if (_0x2d1e01) {
                throw new Error(_0x2d1e01);
              }
              const _0x4325a7 = this._applyImageGenerationResult(_0x2cba00, _0x439f0f.startedAt, {
                writeStore: false
              });
              const _0x207df3 = {
                ...(_0x4325a7?.patch || {})
              };
              if (_0x1e45bb) {
                const _0x2486a5 = _0x439f0f.getTaskNode?.() || {};
                Object.assign(_0x207df3, this._buildRunningHubTaskPatch({
                  taskId: String(this._rhTaskId || "").trim() || String(_0x2486a5?.rhTaskId || "").trim(),
                  status: "success",
                  startedAt: _0x439f0f.startedAt,
                  recovering: false,
                  useOpenapiQuery: _0x2486a5?.rhTaskUseOpenapiQuery === true || _0x30ea3c
                }));
                this._persistRunningHubResumeCache();
              } else if (_0x406db5) {
                const _0x392687 = _0x439f0f.getTaskNode?.() || {};
                Object.assign(_0x207df3, this._buildDreaminaTaskPatch({
                  submitId: String(_0x392687?.dreaminaSubmitId || "").trim(),
                  status: "success",
                  phase: "done",
                  label: t("aigenImage.task.completed"),
                  startedAt: _0x439f0f.startedAt,
                  lastCheckedAt: Date.now(),
                  recovering: false,
                  raw: {}
                }));
                this._persistDreaminaResumeCache();
              } else if (_0x1a00c4) {
                const _0x4766a9 = _0x439f0f.getTaskNode?.() || {};
                Object.assign(_0x207df3, this._buildAsyncTaskPatch({
                  provider: this._inferProviderFromModel(_0x4766a9?.model || _0x587166?.model, _0x4766a9?.asyncTaskProvider || _0x5c21e5 || ""),
                  kind: "image",
                  taskId: String(_0x4766a9?.asyncTaskId || "").trim() || String(_0x439f0f?.taskId || "").trim(),
                  status: "success",
                  startedAt: _0x439f0f.startedAt,
                  recovering: false
                }));
                this._persistAsyncResumeCache();
              }
              return _0x207df3;
            },
            failureBuilder: (_0x690cea, _0x3aec21) => {
              if (_0x406db5) {
                const _0x47c767 = _0x3aec21.getTaskNode?.() || {};
                return this._buildDreaminaFailurePatch({
                  error: _0x690cea,
                  startedAt: _0x3aec21.startedAt,
                  submitId: String(this._dreaminaActiveSubmitId || "").trim() || String(_0x47c767?.dreaminaSubmitId || "").trim(),
                  lastCheckedAt: Date.now(),
                  raw: _0x47c767?.dreaminaTaskLastRaw || {}
                });
              }
              const _0x3f1aab = {
                ...buildImageGenerationFailurePatch({
                  error: _0x690cea?.message || t("aigenImage.task.generationFailed"),
                  startedAt: _0x3aec21.startedAt
                })
              };
              if (_0x1e45bb) {
                const _0x57c8f0 = _0x3aec21.getTaskNode?.() || {};
                Object.assign(_0x3f1aab, {
                  rhStatusMessage: _0x690cea?.message || t("aigenImage.task.generationFailed"),
                  rhStatusCode: Number.isFinite(Number(_0x690cea?.code)) ? Number(_0x690cea.code) : null
                }, this._buildRunningHubTaskPatch({
                  taskId: String(this._rhTaskId || "").trim() || String(_0x57c8f0?.rhTaskId || "").trim(),
                  status: "failed",
                  startedAt: _0x3aec21.startedAt,
                  recovering: false,
                  useOpenapiQuery: _0x57c8f0?.rhTaskUseOpenapiQuery === true || _0x30ea3c
                }));
              } else if (_0x1a00c4) {
                const _0x7e192b = _0x3aec21.getTaskNode?.() || {};
                Object.assign(_0x3f1aab, this._buildAsyncTaskPatch({
                  provider: this._inferProviderFromModel(_0x7e192b?.model || _0x587166?.model, _0x7e192b?.asyncTaskProvider || _0x5c21e5 || ""),
                  kind: "image",
                  taskId: String(_0x7e192b?.asyncTaskId || "").trim() || String(_0x3aec21?.taskId || "").trim(),
                  status: "failed",
                  startedAt: _0x3aec21.startedAt,
                  recovering: false
                }));
              }
              return _0x3f1aab;
            },
            cancelledBuilder: _0x343366 => {
              const _0x265b7e = _0x343366.getTaskNode?.() || {};
              const _0x247c89 = _0x265b7e.generationDuration == null ? Date.now() - _0x343366.startedAt : _0x265b7e.generationDuration;
              if (_0x3738a2) {
                return this._buildRunningHubCancelResultPatch({
                  latest: _0x265b7e,
                  message: _0x265b7e.rhStatusMessage || t("aigenImage.task.interrupted"),
                  code: _0x265b7e.rhStatusCode,
                  duration: _0x247c89,
                  taskId: String(this._rhTaskId || "").trim() || String(_0x265b7e?.rhTaskId || "").trim()
                });
              }
              return {
                images: [],
                imageUrl: "",
                thumbUrl: "",
                localPath: ""
              };
            },
            parseError: _0x4fbc90 => getGenerationErrorMessage(_0x4fbc90, t("aigenImage.task.generationFailed"))
          }), {
            store: _0x5852a4,
            startedAt: _0xfba456,
            abortController: this._rhAbortController
          });
          if (_0x23170a.status === "failed") {
            const _0x3cd7b3 = _0x23170a.error;
            console.error("[AIGenerateNode] 生成失败:", _0x3cd7b3);
            showProviderApiKeyMissingToastForError(_0x3cd7b3, {
              providerId: _0x587166?.provider,
              model: _0x587166?.model,
              adapterType: "modelApi"
            });
            logDiagnosticEvent({
              type: "generation.image_failed",
              level: "error",
              source: "renderer",
              message: _0x3cd7b3?.message || t("aigenImage.task.imageGenerationFailed"),
              error: _0x3cd7b3,
              context: {
                nodeId: this.nodeId,
                provider: _0x587166?.provider || "",
                model: _0x587166?.model || "",
                isRhTaskModel: _0x1e45bb,
                isDreaminaTask: _0x406db5,
                isAsyncTaskModel: _0x1a00c4
              }
            });
          }
          if (_0x1e45bb) {
            this._persistRunningHubResumeCache();
          }
          if (_0x406db5) {
            this._persistDreaminaResumeCache();
          }
          if (_0x1a00c4) {
            this._persistAsyncResumeCache();
          }
          return _0x23170a;
        } finally {
          const _0x196ee5 = this._syncLocalTaskNodeData();
          const _0x120b3e = shouldShowGenerationBusyUi(_0x196ee5);
          this._isGenerating = _0x120b3e;
          this._dreaminaActiveSubmitId = "";
          this._rhAbortController = null;
          if (_0x1e45bb && _0x120b3e) {
            const _0xbbd22b = String(_0x196ee5?.rhTaskId || "").trim();
            if (_0xbbd22b) {
              this._rhTaskId = _0xbbd22b;
            }
          } else {
            this._rhTaskId = null;
            if (!this._rhCancelRequested) {
              this._rhApiKey = null;
            }
          }
          if (this.btnEl) {
            this._updateSubmitButtonState?.();
          }
          if (!_0x120b3e) {
            if (this.btnEl) {
              resetGenerateButtonIdleUi(this.btnEl);
            }
            _0x15de9c(this.previewEl);
          }
        }
      } finally {
        releasePayloadObjectUrlLease(_0x587166);
      }
    }
    unmount() {
      const _0x47da77 = shouldPreserveGenerationTaskOnUnmount(this.nodeId);
      this._flushPromptHtmlCommit?.();
      this._assetMentionRegistryUnsubscribe?.();
      this._assetMentionRegistryUnsubscribe = null;
      this._assetMentionRegistryRefreshPending = false;
      if (!_0x47da77) {
        this._stopRunningHubRecovery(false);
        this._stopDreaminaRecovery(false);
        this._stopAsyncRecovery(false);
        if (this._rhAbortController && !this._rhAbortController.signal.aborted) {
          this._rhAbortController.abort();
        }
      }
      this._rhAbortController = null;
      this._generationNodeHelpTip?.remove();
      this._generationNodeHelpTip = null;
      this._promptPresetTrigger?.remove();
      this._promptPresetTrigger = null;
      this._modelProviderProfileControl?.remove();
      this._modelProviderProfileControl = null;
      this._unbindImageLocaleChange?.();
      this._unbindImageLocaleChange = null;
      this._uiSchemaCleanup?.();
      this._uiSchemaCleanup = null;
      this._footerControllerCleanup?.();
      this._footerControllerCleanup = null;
      this._disposeImageObjectUrls?.();
      if (this._lowZoomHoverRefreshTimer) {
        clearTimeout(this._lowZoomHoverRefreshTimer);
        this._lowZoomHoverRefreshTimer = null;
      }
      setNodeMediaLodHoverPromoted(this._root, false);
    }
  }
  return _0x4c5f7a.prototype;
}