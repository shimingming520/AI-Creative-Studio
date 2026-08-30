import { APIMART_DREAMINA_VIDEO_DEFAULT_MODEL, ensureDreaminaStyleVideoModelForTask, getDreaminaStyleVideoDefaultModel, getDreaminaStyleVideoModelVersion, isDreaminaStyleVideoModel, isDreaminaVideoRouteModeEnabled, normalizeDreaminaStyleVideoDuration, normalizeDreaminaVideoAspectRatio, normalizeDreaminaStyleVideoModel, normalizeDreaminaStyleVideoResolution, normalizeDreaminaVideoRouteMode, resolveDreaminaStyleVideoProvider, resolveDreaminaVideoTaskType, validateDreaminaVideoRouteSelection } from "../../modules/dreaminaVideoModelHelper.js";
import { getPromptAssetInputRefsFromNode, insertPresetPromptIntoEditor, isRunningHubWorkflowNode, previewPresetPromptInEditor, resolvePresetPromptTextWithTextRefs, shouldUsePromptPreviewForPreset } from "../../modules/nodePromptShared.js";
import { isPreviewModeEnabled, isPreviewNodeLoading, startPreviewNodeLoading } from "../../modules/previewMode.js";
import { evaluateGenerationPromptBoundary } from "../../modules/generationPromptPolicy.js";
import { createPreviewGenerateButtonCallbacks, resetGenerateButtonIdleUi, setGenerateButtonCancellableUi, setGenerateButtonLoadingUi } from "../../modules/previewGenerateButtonUi.js";
import { resolveGenerationInputImageUrl } from "../../services/imageReferenceUrlService.js";
import { logDiagnosticEvent } from "../../services/diagnosticsService.js";
import { createPayloadObjectUrlLease, releasePayloadObjectUrlLease } from "../../services/payloadObjectUrlLease.js";
import { buildGenerationStartPatch } from "../../core/generationTaskLifecycle.js";
import { cancelTask, getActiveGenerationTask, resumeTask, submitTask } from "../../core/generationTaskRuntime.js";
import { createGenerationCancelPlanFromNode, createGenerationResumePlanFromNode, createGenerationSubmitPlan } from "../../core/generationExecutionPlan.js";
import { getGenerationErrorMessage, isGenerationAbortError } from "../../core/generationTaskErrorState.js";
import { showRunningHubMediaUploadGuideForError } from "../../modules/runningHubMediaUploadGuide.js";
import { showProviderApiKeyMissingToast, showProviderApiKeyMissingToastForError } from "../../modules/providerApiKeyMissingToast.js";
import { guardModelGenerationCredentials } from "../../modules/modelCredentialUi.js";
import { buildAsyncTaskPatch, buildDreaminaTaskPatch, buildRunningHubTaskPatch } from "../../core/generationTaskProtocolState.js";
import { shouldAllowCancel, shouldShowGenerationBusyUi } from "../../core/generationTaskUiState.js";
import { GENERATION_HISTORY_EVENT } from "../../modules/generationHistoryAssets.js";
import { GENERATION_TASK_CENTER_EVENT } from "../../modules/generationTaskCenterEvents.js";
import { localPathToUrl, normalizeLocalPath } from "../../utils/localMediaPath.js";
import { resolveVideoWorkflowSchemaParam } from "./runningHubVideoUiSchema.js";
import { buildVideoGenerationFailurePatch, buildVideoGenerationResultPatch, normalizeVideoGenerationResult } from "./videoGenerationResultRenderer.js";
import { buildRunningHubVideoWorkflowSubmitPatch, getDefaultRunningHubVideoWorkflowModelId, shouldScopeRunningHubVideoSubmitEdges } from "./runningHubVideoSubmitPayload.js";
import { isModelApiModel, resolveModelExecution, resolveModelProvider } from "../../manifests/index.js";
import { buildRhAiAppResultDisplayPatch } from "../shared/rhAiAppNodeBehavior.js";
import { getVideoSourceKey, resolveEffectiveInputKind } from "../../modules/modelInputPolicy.js";
import { validateModelMediaInputLimits } from "../../modules/modelMediaInputLimits.js";
import { t } from "../../i18n/index.js";
import { getRunningHubTaskProviderProfileId, normalizeRunningHubModelApiProfileId } from "../../modules/runningHubProviderProfiles.js";
import { resolveModelGenerationProviderProfileId } from "../../modules/modelProviderProfileSelection.js";
import { buildSubmitRandomizedSeedPatch, compileModelApiVideoSubmit, validateModelApiVideoPrompt } from "./modelApiVideoSubmitCompiler.js";
import { resolveVideoSubmitInputMaterials } from "./videoSubmitInputMaterials.js";
import { applyVideoNodeAdaptiveAspectRatio } from "./videoNodeAdaptiveAspectRatio.js";
import { getRhAiAppVideoResultMediaKey, hasObviouslyInvalidAsyncVideoResult, isRhAiAppVideoNodeData } from "./videoResultNodeData.js";
const DREAMINA_UPLOAD_DURATION_ERROR_TOAST_MS = 9000;
function videoTaskText(_0x1e6f80, _0x231e81 = {}) {
  return t("videoTask." + _0x1e6f80, _0x231e81);
}
function getModelMediaInputLimitMessage(_0x3cf02b = {}) {
  const _0x588a0d = String(_0x3cf02b?.code || "").trim();
  if (!_0x588a0d) {
    return "";
  }
  return videoTaskText("validation.mediaInputLimits." + _0x588a0d, {
    max: _0x3cf02b.max,
    actual: _0x3cf02b.actual
  });
}
function getVideoGenerateTitle() {
  return videoTaskText("controls.generateTitle");
}
function getVideoCancelTooltip() {
  return videoTaskText("controls.cancelTooltip");
}
const DREAMINA_STALE_ACTIVE_RESUME_MS = 15000;
const DREAMINA_COLD_RECOVERY_STALE_AFTER_MS = 86400000;
const CANCELLED_TASK_STATUSES = new Set(["cancelled", "canceled"]);
const DREAMINA_NON_RECOVERABLE_STATUSES = new Set(["cancelled", "canceled", "complete", "completed", "done", "error", "fail", "failed", "finish", "finished", "idle", "success", "succeeded"]);
const DREAMINA_NON_RECOVERABLE_PHASES = new Set(["cancelled", "canceled", "complete", "completed", "done", "error", "fail", "failed", "finish", "finished", "success", "succeeded"]);
const dreaminaBackgroundQueueToastKeys = new Set();
const LOCAL_ASYNC_TASK_TIMEOUT_MESSAGES = new Set(["任务处理超时，请稍后查询结果", "Task processing timed out. Please query the result later."]);
function normalizeTaskStatus(_0x45f8a6) {
  return String(_0x45f8a6 || "").trim().toLowerCase();
}
function isRecoverableInterruptedDreaminaStyleTask(_0x39af25 = {}) {
  const _0xcc187a = String(_0x39af25?.model || "").trim();
  const _0x26b241 = String(_0x39af25?.provider || "").trim();
  const _0x1e7245 = resolveModelExecution(_0xcc187a, {
    providerHint: _0x26b241
  }) || resolveModelExecution(_0xcc187a);
  if (_0x1e7245?.modelManifest?.extensions?.dreaminaStyleVideo == null || _0x1e7245?.modelManifest?.cancellable !== false) {
    return false;
  }
  return [_0x39af25?.jobStatus, _0x39af25?.dreaminaTaskPhase, _0x39af25?.dreaminaTaskStatus].map(normalizeTaskStatus).every(_0x365487 => CANCELLED_TASK_STATUSES.has(_0x365487));
}
function isRecoverableCustomProviderLocalTimeout(_0x313db2 = {}) {
  const _0x8c7d3f = String(_0x313db2?.asyncTaskProvider || _0x313db2?.provider || "").trim();
  if (!/^custom_[a-z0-9_-]+$/i.test(_0x8c7d3f)) {
    return false;
  }
  const _0x393c4e = Array.isArray(_0x313db2?.videos) ? _0x313db2.videos.map(_0x29a50f => String(_0x29a50f?.error || "").trim()) : [];
  return [String(_0x313db2?.jobError || "").trim(), ..._0x393c4e].some(_0x14fefc => LOCAL_ASYNC_TASK_TIMEOUT_MESSAGES.has(_0x14fefc));
}
function mapDreaminaSnapshotToTaskCenterStatus(_0xd44c93 = {}) {
  const _0x118740 = String(_0xd44c93?.phase || "").trim().toLowerCase();
  const _0x24cc44 = String(_0xd44c93?.status || "").trim().toLowerCase();
  if (_0x118740 === "done" || _0x24cc44 === "success") {
    return "complete";
  }
  if (_0x118740 === "cancelled" || _0x24cc44 === "cancelled" || _0x24cc44 === "canceled") {
    return "cancelled";
  }
  if (_0x118740 === "failed" || _0x24cc44 === "failed") {
    return "failed";
  }
  if (_0x118740 === "queued" || _0x118740 === "pending") {
    return "waiting";
  }
  return "processing";
}
function buildDreaminaTaskCenterMessage(_0x1408e1 = {}) {
  const _0x495a22 = String(_0x1408e1?.label || "").trim();
  const _0x4d8758 = Number(_0x1408e1?.queueIndex);
  const _0x1c5875 = Number(_0x1408e1?.queueLength);
  if (Number.isFinite(_0x4d8758) && _0x4d8758 >= 0 && Number.isFinite(_0x1c5875) && _0x1c5875 > 0) {
    return (_0x495a22 || videoTaskText("task.queueing")) + " " + (Math.trunc(_0x4d8758) + 1) + "/" + Math.trunc(_0x1c5875);
  }
  return _0x495a22 || "";
}
function isDreaminaUploadDurationErrorMessage(_0x17d06b) {
  const _0x417bab = String(_0x17d06b || "").trim();
  return _0x417bab.startsWith("上传源视频失败：") || _0x417bab.startsWith("上传源音频失败：");
}
function getPlainObject(_0x579bb5) {
  if (_0x579bb5 && typeof _0x579bb5 === "object" && !Array.isArray(_0x579bb5)) {
    return _0x579bb5;
  } else {
    return {};
  }
}
export function createVideoNodeTaskOrchestrationModule(_0xf3b954) {
  const {
    store: _0x2c53fb,
    api: _0x156e40,
    getImage: _0x54f197,
    startLoading: _0x3975dd,
    stopLoading: _0x41ac89,
    checkLocalMediaExists = async () => true,
    ensureConfig: _0xa6e637,
    getProviderConfig: _0x3fde02,
    isVideoVipModel: _0x4d361d,
    ensureVipSessionRecheck: _0x24ad03
  } = _0xf3b954;
  const _0x4e38bf = "DREAMINA_POLL_TIMEOUT";
  const _0x5e4984 = 1200000;
  const _0x14004f = 20000;
  const _0x4721b4 = 86400000;
  const _0x32fbe8 = () => typeof _0x2c53fb.getStateRaw === "function" ? _0x2c53fb.getStateRaw() : _0x2c53fb.getState();
  const _0x1487ac = (_0x496e82, _0x1540e2) => _0x496e82?.getTaskNode?.() || _0x2c53fb.getState().nodes?.[_0x1540e2] || {};
  const _0x2c48e0 = (_0x380566, _0x102a0c, _0x163640) => {
    if (typeof _0x380566?.updateTaskNode === "function") {
      return _0x380566.updateTaskNode(_0x163640);
    }
    _0x2c53fb.updateNodeData(_0x102a0c, _0x163640);
    return true;
  };
  class _0xf62074 {
    async _preflightConnectedLocalVideoInputs(_0x5525ba = null) {
      if (typeof checkLocalMediaExists !== "function") {
        return true;
      }
      const _0x4f71e7 = _0x32fbe8();
      const _0x4a769f = _0x4f71e7?.nodes || {};
      const _0x4927c0 = typeof _0x2c53fb.getIncomingEdges === "function" ? _0x2c53fb.getIncomingEdges(this.nodeId) : [];
      const _0x420263 = new Set();
      const _0x31eb9a = async _0x1b480c => {
        if (_0x420263.has(_0x1b480c)) {
          return true;
        }
        _0x420263.add(_0x1b480c);
        try {
          return (await checkLocalMediaExists(_0x1b480c)) === true;
        } catch {
          return false;
        }
      };
      const _0x231b31 = _0x31c2e7 => {
        window.showToast?.(videoTaskText("validation.localVideoMissing", {
          path: _0x31c2e7
        }), "error");
      };
      for (const _0x55cdb4 of _0x4927c0) {
        const _0xa7ed2a = String(_0x55cdb4?.sourceId || "").trim();
        const _0x11b0d4 = _0x4a769f[_0xa7ed2a];
        if (!_0x11b0d4 || resolveEffectiveInputKind(_0x11b0d4, _0x55cdb4) !== "video") {
          continue;
        }
        let _0x1f8abf = _0x11b0d4;
        let _0x5af16d = -1;
        const _0x4602b1 = Array.isArray(_0x11b0d4.videos) ? _0x11b0d4.videos : [];
        if (String(_0x11b0d4.type || "") === "ai-video" && _0x4602b1.length > 0) {
          const _0x362854 = String(_0x55cdb4?.sourceMediaKey || "").trim();
          if (_0x362854) {
            _0x5af16d = _0x4602b1.findIndex(_0x331f51 => getVideoSourceKey(_0x331f51) === _0x362854);
          }
          if (_0x5af16d < 0) {
            const _0x1c4636 = Number(_0x11b0d4.mainVideoIndex);
            _0x5af16d = Number.isFinite(_0x1c4636) ? Math.max(0, Math.min(_0x4602b1.length - 1, Math.trunc(_0x1c4636))) : 0;
          }
          _0x1f8abf = _0x4602b1[_0x5af16d] || _0x11b0d4;
        }
        const _0x151138 = getVideoSourceKey(_0x1f8abf) || getVideoSourceKey(_0x11b0d4);
        const _0x2df2b0 = normalizeLocalPath(_0x151138);
        if (!_0x2df2b0) {
          continue;
        }
        if (await _0x31eb9a(_0x2df2b0)) {
          continue;
        }
        const _0x46fc9e = _0x32fbe8()?.nodes?.[_0xa7ed2a] || _0x11b0d4;
        if (_0x5af16d >= 0 && Array.isArray(_0x46fc9e.videos)) {
          const _0x5164c9 = _0x46fc9e.videos.map((_0x510fc0, _0x12190e) => _0x12190e === _0x5af16d ? {
            ..._0x510fc0,
            mediaUnavailable: true,
            mediaUnavailableSource: _0x151138
          } : _0x510fc0);
          _0x2c53fb.updateNodeData(_0xa7ed2a, {
            videos: _0x5164c9
          });
        } else {
          _0x2c53fb.updateNodeData(_0xa7ed2a, {
            mediaUnavailable: true,
            mediaUnavailableSource: _0x151138
          });
        }
        _0x231b31(_0x2df2b0);
        return false;
      }
      const _0x4ca761 = [...(Array.isArray(_0x5525ba?.videos) ? _0x5525ba.videos : []), _0x5525ba?.video, _0x5525ba?.videoUrl, _0x5525ba?.sourceVideo];
      for (const _0x44f1c7 of _0x4ca761) {
        const _0x208650 = normalizeLocalPath(_0x44f1c7);
        if (!_0x208650 || (await _0x31eb9a(_0x208650))) {
          continue;
        }
        _0x231b31(_0x208650);
        return false;
      }
      return true;
    }
    _isDreaminaPollTimeoutError(_0x7d3e2e) {
      const _0x5c02ff = String(_0x7d3e2e?.code || "").trim().toUpperCase();
      if (_0x5c02ff === _0x4e38bf || _0x5c02ff === "TIMEOUT") {
        return true;
      }
      const _0x17c796 = String(_0x7d3e2e?.type || "").trim().toUpperCase();
      if (_0x17c796 === "TIMEOUT" || _0x17c796 === "TASK_TIMEOUT") {
        return true;
      }
      const _0xd9aeb9 = String(_0x7d3e2e?.message || "").trim().toLowerCase();
      return _0xd9aeb9.includes("timeout") || _0xd9aeb9.includes("超时");
    }
    _buildDreaminaBackgroundPendingSnapshot(_0x37db3c = "") {
      return this._buildDreaminaPendingSnapshot({
        submitId: _0x37db3c,
        phase: "generating",
        label: videoTaskText("task.backgroundQueueing")
      });
    }
    _showDreaminaBackgroundQueueingToast(_0x36ced7 = "") {
      const _0x2b29cc = String(_0x36ced7 || "").trim() || String(_0x2c53fb.getState().nodes?.[this.nodeId]?.dreaminaSubmitId || "").trim() || String(this.nodeId || "").trim();
      if (_0x2b29cc && dreaminaBackgroundQueueToastKeys.has(_0x2b29cc)) {
        return;
      }
      if (_0x2b29cc) {
        dreaminaBackgroundQueueToastKeys.add(_0x2b29cc);
      }
      window.showToast?.(videoTaskText("toasts.dreaminaBackgroundQueueing"), "warning");
    }
    _hasResolvedVideoResult(_0x152071 = this._data) {
      const _0x2e369b = Array.isArray(_0x152071?.videos) ? _0x152071.videos : [];
      if (_0x2e369b.length > 0) {
        return true;
      }
      return !!String(_0x152071?.videoUrl || "").trim() || !!String(_0x152071?.localPath || "").trim();
    }
    _persistDreaminaResumeCache() {
      try {
        window._triggerLocalCacheSave?.();
      } catch {}
    }
    _persistRunningHubResumeCache() {
      try {
        window._triggerLocalCacheSave?.();
      } catch {}
    }
    _persistAsyncResumeCache() {
      this._persistRunningHubResumeCache();
    }
    _resolveDreaminaResumeSubmitId(_0x1e76ff = {}) {
      const _0x24745e = _0x1e76ff?.dreaminaTaskLastRaw && typeof _0x1e76ff.dreaminaTaskLastRaw === "object" && !Array.isArray(_0x1e76ff.dreaminaTaskLastRaw) ? _0x1e76ff.dreaminaTaskLastRaw : {};
      const _0x45ddd4 = String(_0x24745e.remoteSubmitId || _0x24745e.remote_submit_id || "").trim();
      if (_0x45ddd4) {
        return _0x45ddd4;
      }
      return String(_0x1e76ff?.dreaminaSubmitId || "").trim();
    }
    _isDreaminaRecoverableRunningTask(_0x43c832 = this._data) {
      if (!this._isDreaminaVideoNode(_0x43c832)) {
        return false;
      }
      const _0x5768f4 = String(_0x43c832?.dreaminaSubmitId || "").trim();
      if (!_0x5768f4) {
        return false;
      }
      const _0x5d8905 = normalizeTaskStatus(_0x43c832?.jobStatus);
      const _0x47ba19 = normalizeTaskStatus(_0x43c832?.dreaminaTaskPhase);
      const _0x4ee73c = normalizeTaskStatus(_0x43c832?.dreaminaTaskStatus);
      if (!isRecoverableInterruptedDreaminaStyleTask(_0x43c832)) {
        if (DREAMINA_NON_RECOVERABLE_STATUSES.has(_0x5d8905)) {
          return false;
        }
        if (DREAMINA_NON_RECOVERABLE_PHASES.has(_0x47ba19)) {
          return false;
        }
        if (DREAMINA_NON_RECOVERABLE_STATUSES.has(_0x4ee73c)) {
          return false;
        }
      }
      return true;
    }
    _isStaleActiveDreaminaTask(_0x380e05 = this._data) {
      if (!this._isGenerating) {
        return false;
      }
      if (_0x380e05?.dreaminaTaskRecovering === true) {
        return false;
      }
      if (this._dreaminaResumePromise) {
        return false;
      }
      const _0xfff25a = Number(_0x380e05?.dreaminaTaskLastCheckedAt || _0x380e05?.dreaminaTaskStartedAt || _0x380e05?.generationStartTime || 0);
      if (!Number.isFinite(_0xfff25a) || _0xfff25a <= 0) {
        return false;
      }
      return Date.now() - _0xfff25a >= DREAMINA_STALE_ACTIVE_RESUME_MS;
    }
    _shouldProbeStaleDreaminaRecovery(_0x17c8af = this._data) {
      if (!this._isDreaminaRecoverableRunningTask(_0x17c8af)) {
        return false;
      }
      if (getActiveGenerationTask(this.nodeId)) {
        return false;
      }
      const _0x283d4d = Number(_0x17c8af?.dreaminaTaskLastCheckedAt || _0x17c8af?.dreaminaTaskStartedAt || _0x17c8af?.generationStartTime || 0);
      if (!Number.isFinite(_0x283d4d) || _0x283d4d <= 0) {
        return false;
      }
      return Date.now() - _0x283d4d >= DREAMINA_COLD_RECOVERY_STALE_AFTER_MS;
    }
    _isUncertainStaleDreaminaRecoveryError(_0x3ddaa6) {
      const _0x1657bc = _0x3ddaa6?.dreaminaSnapshot;
      const _0x20b855 = normalizeTaskStatus(_0x1657bc?.phase);
      const _0x15266d = normalizeTaskStatus(_0x1657bc?.status);
      return _0x20b855 !== "failed" && _0x15266d !== "failed";
    }
    _shouldKeepDreaminaLoading(_0x547338 = _0x2c53fb.getState().nodes?.[this.nodeId] || this._data || {}) {
      if (!this._isDreaminaVideoNode(_0x547338)) {
        return false;
      }
      const _0xa1210 = normalizeTaskStatus(_0x547338?.jobStatus);
      const _0x11f7ef = normalizeTaskStatus(_0x547338?.dreaminaTaskPhase);
      const _0x2b4404 = normalizeTaskStatus(_0x547338?.dreaminaTaskStatus);
      if (!isRecoverableInterruptedDreaminaStyleTask(_0x547338)) {
        if (DREAMINA_NON_RECOVERABLE_STATUSES.has(_0xa1210)) {
          return false;
        }
        if (DREAMINA_NON_RECOVERABLE_PHASES.has(_0x11f7ef)) {
          return false;
        }
        if (DREAMINA_NON_RECOVERABLE_STATUSES.has(_0x2b4404)) {
          return false;
        }
      }
      if (_0x547338?.isGenerating === true) {
        return true;
      }
      if (String(_0x547338?.jobStatus || "").trim().toLowerCase() === "running") {
        return true;
      }
      if (_0x547338?.dreaminaTaskRecovering === true) {
        return true;
      }
      if (this._dreaminaResumePromise) {
        return true;
      }
      return this._isDreaminaRecoverableRunningTask(_0x547338);
    }
    _inferAsyncProviderFromModel(_0x1fe192, _0x104080 = "") {
      const _0x568fd4 = resolveModelProvider(_0x1fe192, "", {
        allowProviderHint: false
      });
      if (_0x568fd4) {
        return _0x568fd4;
      }
      const _0xdcea8a = String(_0x104080 || "").trim().toLowerCase();
      if (_0xdcea8a) {
        return _0xdcea8a;
      }
      const _0x263425 = String(_0x1fe192 || "").trim();
      if (_0x263425 && !_0x263425.includes("/")) {
        return "grsai";
      }
      return "";
    }
    _isRunningHubRecoverableRunningTask(_0xa668d0 = this._data) {
      if (!this._isRunninghubWorkflowModel(_0xa668d0?.model, _0xa668d0?.provider)) {
        return false;
      }
      const _0x3dc03c = String(_0xa668d0?.rhTaskId || "").trim();
      if (!_0x3dc03c) {
        return false;
      }
      const _0x1741fc = String(_0xa668d0?.rhTaskStatus || "").trim().toLowerCase();
      if (_0x1741fc === "success" || _0x1741fc === "failed" || _0x1741fc === "idle" || _0x1741fc === "cancelled") {
        return false;
      }
      return true;
    }
    _isAsyncRecoverableRunningTask(_0x30dd41 = this._data) {
      const _0xc64587 = String(_0x30dd41?.asyncTaskId || "").trim();
      if (!_0xc64587) {
        return false;
      }
      const _0x1a6e63 = this._inferAsyncProviderFromModel(_0x30dd41?.model, _0x30dd41?.asyncTaskProvider || _0x30dd41?.provider || "");
      if (!_0x1a6e63 || _0x1a6e63 === "runninghubwf" || _0x1a6e63 === "runninghub" || _0x1a6e63 === "dreamina") {
        return false;
      }
      const _0x399060 = String(_0x30dd41?.asyncTaskKind || "").trim().toLowerCase();
      if (_0x399060 && _0x399060 !== "video") {
        return false;
      }
      const _0x82a842 = String(_0x30dd41?.asyncTaskStatus || "").trim().toLowerCase();
      const _0x257b4b = _0x82a842 === "failed" && isRecoverableCustomProviderLocalTimeout(_0x30dd41);
      if (_0x82a842 === "success" && !hasObviouslyInvalidAsyncVideoResult(_0x30dd41) || _0x82a842 === "failed" && !_0x257b4b || _0x82a842 === "idle" || _0x82a842 === "cancelled") {
        return false;
      }
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
    _buildAsyncTaskPatch({
      provider = "",
      kind = "video",
      taskId = "",
      status = "pending",
      startedAt = 0,
      recovering = false
    } = {}) {
      return buildAsyncTaskPatch({
        provider: provider,
        kind: kind,
        taskId: taskId,
        status: status,
        startedAt: startedAt,
        recovering: recovering
      });
    }
    async _buildResumePayload(_0x52bab9 = this._data, _0x11597c = {}) {
      const _0x1c4822 = _0x52bab9 || {};
      const _0x41b458 = String(_0x1c4822?.model || "").trim();
      const _0x343a3e = this._inferAsyncProviderFromModel(_0x41b458, _0x11597c?.providerHint || _0x1c4822?.asyncTaskProvider || _0x1c4822?.provider || "");
      if (!_0x41b458 || !_0x343a3e) {
        throw new Error(videoTaskText("errors.missingAsyncResumeModelOrProvider"));
      }
      const _0x2ad17b = getRunningHubTaskProviderProfileId(_0x1c4822);
      const _0x13e0ca = resolveModelGenerationProviderProfileId(_0x41b458, _0x343a3e, _0x2ad17b);
      await _0xa6e637();
      const _0xaa36cd = _0x3fde02(_0x13e0ca || _0x343a3e) || {};
      const _0x214256 = String(_0x343a3e === "runninghub" ? _0xaa36cd.modelApiKey || _0xaa36cd.apiKey || "" : _0xaa36cd.apiKey || window._appApiKey || "").trim();
      return {
        nodeId: this.nodeId,
        model: _0x41b458,
        provider: _0x343a3e,
        ...(_0x13e0ca ? {
          providerProfileId: _0x13e0ca,
          rhProviderProfileId: _0x13e0ca
        } : {}),
        apiKey: _0x214256
      };
    }
    _syncLocalTaskNodeData() {
      const _0x50e6fb = _0x2c53fb.getState().nodes?.[this.nodeId];
      if (_0x50e6fb) {
        this._data = _0x50e6fb;
      }
      return this._data || {};
    }
    _emitDreaminaTaskCenterUpdate(_0x2895eb = {}, _0x33c402 = {}) {
      const _0x381350 = String(_0x2895eb?.submitId || _0x33c402.taskId || _0x2c53fb.getState().nodes?.[this.nodeId]?.dreaminaSubmitId || "").trim();
      const _0x1ed1fc = globalThis.window;
      if (!_0x381350 || typeof _0x1ed1fc?.dispatchEvent !== "function") {
        return;
      }
      const _0x3b6ec4 = String(_0x33c402.status || mapDreaminaSnapshotToTaskCenterStatus(_0x2895eb)).trim();
      const _0x47eb2b = _0x3b6ec4 === "complete" || _0x3b6ec4 === "failed" || _0x3b6ec4 === "cancelled";
      _0x1ed1fc.dispatchEvent(new CustomEvent(GENERATION_TASK_CENTER_EVENT, {
        detail: {
          taskId: _0x381350,
          nodeId: this.nodeId,
          kind: "dreaminaVideo",
          status: _0x3b6ec4,
          progress: _0x3b6ec4 === "complete" ? 1 : _0x3b6ec4 === "waiting" ? 0 : 0.45,
          message: String(_0x33c402.message || buildDreaminaTaskCenterMessage(_0x2895eb)).trim(),
          error: _0x3b6ec4 === "failed" ? String(_0x33c402.error || _0x2895eb?.failReason || _0x2895eb?.label || "").trim() : "",
          result: _0x33c402.result && typeof _0x33c402.result === "object" ? _0x33c402.result : null,
          cancellable: true,
          createdAt: Number(_0x33c402.createdAt || _0x2c53fb.getState().nodes?.[this.nodeId]?.dreaminaTaskStartedAt || Date.now()),
          startedAt: Number(_0x33c402.startedAt || _0x2c53fb.getState().nodes?.[this.nodeId]?.dreaminaTaskStartedAt || 0),
          finishedAt: _0x47eb2b ? Date.now() : 0
        }
      }));
    }
    _buildDreaminaTaskPatch(_0x2f918a, _0x17f0cf = {}) {
      const _0x49ab48 = buildDreaminaTaskPatch({
        submitId: _0x2f918a?.submitId || "",
        status: _0x2f918a?.status || "pending",
        phase: _0x2f918a?.phase || "generating",
        label: _0x2f918a?.label || "",
        lastCheckedAt: _0x2f918a?.lastCheckedAt || Date.now(),
        recovering: _0x17f0cf.recovering === true,
        raw: _0x2f918a?.raw || {},
        defaultLabel: videoTaskText("task.generating")
      });
      if (_0x17f0cf.startedAt != null) {
        _0x49ab48.dreaminaTaskStartedAt = Number(_0x17f0cf.startedAt || 0);
      }
      return _0x49ab48;
    }
    _applyDreaminaTaskSnapshot(_0x10b550, _0x4ccc64 = {}) {
      const _0x27504f = _0x2c53fb.getState().nodes?.[this.nodeId] || this._data || {};
      const _0x3177be = this._buildDreaminaTaskPatch(_0x10b550, {
        recovering: _0x4ccc64.recovering === true,
        startedAt: _0x4ccc64.startedAt ?? _0x27504f?.dreaminaTaskStartedAt
      });
      _0x2c53fb.updateNodeData(this.nodeId, _0x3177be);
      this._syncLocalTaskNodeData();
      this._persistDreaminaResumeCache();
      this._emitDreaminaTaskCenterUpdate(_0x10b550, {
        startedAt: _0x3177be.dreaminaTaskStartedAt
      });
      return _0x3177be;
    }
    _stopDreaminaRecovery(_0xc1fb50 = false) {
      if (this._dreaminaResumeAbortController && !this._dreaminaResumeAbortController.signal.aborted) {
        this._dreaminaResumeAbortController.abort();
      }
      this._dreaminaResumeAbortController = null;
      this._dreaminaResumeSubmitId = "";
      this._dreaminaResumePromise = null;
      this._dreaminaActiveSubmitId = "";
      if (_0xc1fb50) {
        const _0x3d7afe = _0x2c53fb.getState().nodes?.[this.nodeId];
        if (_0x3d7afe?.dreaminaTaskRecovering) {
          _0x2c53fb.updateNodeData(this.nodeId, {
            dreaminaTaskRecovering: false
          });
        }
      }
    }
    _stopRunningHubRecovery(_0xa4969 = false) {
      if (this._rhResumeAbortController && !this._rhResumeAbortController.signal.aborted) {
        this._rhResumeAbortController.abort();
      }
      this._rhResumeAbortController = null;
      this._rhResumeTaskId = "";
      this._rhResumePromise = null;
      if (_0xa4969) {
        const _0x280757 = _0x2c53fb.getState().nodes?.[this.nodeId];
        if (_0x280757?.rhTaskRecovering) {
          _0x2c53fb.updateNodeData(this.nodeId, {
            rhTaskRecovering: false
          });
          this._persistRunningHubResumeCache();
        }
      }
    }
    _stopAsyncRecovery(_0x5b5dba = false) {
      if (this._asyncResumeAbortController && !this._asyncResumeAbortController.signal.aborted) {
        this._asyncResumeAbortController.abort();
      }
      this._asyncResumeAbortController = null;
      this._asyncResumeTaskId = "";
      this._asyncResumePromise = null;
      if (_0x5b5dba) {
        const _0x161ba8 = _0x2c53fb.getState().nodes?.[this.nodeId];
        if (_0x161ba8?.asyncTaskRecovering) {
          _0x2c53fb.updateNodeData(this.nodeId, {
            asyncTaskRecovering: false
          });
          this._persistAsyncResumeCache();
        }
      }
    }
    _buildDreaminaPendingSnapshot({
      submitId = "",
      phase = "generating",
      label = videoTaskText("task.generating"),
      raw = {}
    } = {}) {
      return {
        submitId: String(submitId || "").trim(),
        status: "pending",
        phase: phase,
        label: label,
        queueStatus: "",
        queueIndex: null,
        queueLength: null,
        outputs: [],
        failReason: "",
        raw: raw && typeof raw === "object" && !Array.isArray(raw) ? raw : {},
        isTerminal: false,
        hasOutputs: false,
        lastCheckedAt: Date.now()
      };
    }
    _buildDreaminaFailedSnapshot(_0x14a55b, _0x16a407, _0x41c8ae = {}) {
      return {
        submitId: String(_0x14a55b || "").trim(),
        status: "failed",
        phase: "failed",
        label: String(_0x16a407 || "").trim() || videoTaskText("task.queryFailed"),
        queueStatus: "",
        queueIndex: null,
        queueLength: null,
        outputs: [],
        failReason: String(_0x16a407 || "").trim(),
        raw: _0x41c8ae && typeof _0x41c8ae === "object" && !Array.isArray(_0x41c8ae) ? _0x41c8ae : {},
        isTerminal: true,
        hasOutputs: false,
        lastCheckedAt: Date.now()
      };
    }
    _applyDreaminaSuccessResult(_0x1d4672, _0x95ad16, _0x2840d3 = null, {
      writeStore = true,
      returnPatch = false
    } = {}) {
      const _0x2e830c = normalizeVideoGenerationResult(_0x1d4672);
      const _0x2ec272 = _0x2e830c.items;
      const _0x547965 = this._isDreaminaVideoNode(_0x2c53fb.getState().nodes?.[this.nodeId] || this._data || {});
      const _0x3e70f4 = String(_0x2840d3?.submitId || "").trim() || String(_0x2c53fb.getState().nodes?.[this.nodeId]?.dreaminaSubmitId || "").trim();
      const _0x518341 = _0x547965 ? _0x2840d3 ? this._buildDreaminaTaskPatch(_0x2840d3, {
        recovering: false,
        startedAt: _0x95ad16
      }) : {
        isGenerating: false,
        jobStatus: "success",
        dreaminaSubmitId: _0x3e70f4,
        dreaminaTaskStatus: "success",
        dreaminaTaskPhase: "done",
        dreaminaTaskLabel: videoTaskText("task.completed"),
        dreaminaTaskStartedAt: _0x95ad16,
        dreaminaTaskLastCheckedAt: Date.now(),
        dreaminaTaskLastRaw: {},
        dreaminaTaskRecovering: false
      } : {};
      const _0x1b402d = buildVideoGenerationResultPatch(_0x2e830c, {
        startedAt: _0x95ad16
      });
      const _0x43b8ad = _0x1b402d ? {
        ..._0x1b402d,
        ..._0x518341
      } : null;
      if (_0x1b402d) {
        if (writeStore) {
          _0x2c53fb.updateNodeData(this.nodeId, _0x43b8ad);
          this._persistDreaminaResumeCache();
        }
        if (_0x547965) {
          this._emitDreaminaTaskCenterUpdate(_0x2840d3 || {
            submitId: _0x3e70f4,
            status: "success",
            phase: "done",
            label: videoTaskText("task.completed")
          }, {
            status: "complete",
            startedAt: _0x95ad16,
            result: _0x2ec272[0] || _0x2e830c
          });
        }
      }
      if (returnPatch) {
        return {
          videos: _0x2ec272,
          patch: _0x43b8ad || {},
          normalizedResult: _0x2e830c
        };
      }
      return _0x2ec272;
    }
    _scheduleDreaminaResultEnrichment(_0x54a8d2) {
      if (!Array.isArray(_0x54a8d2) || !(_0x54a8d2.length > 0)) {
        return;
      }
      {
        const _0x3b112b = this.nodeId;
        const _0x3659e5 = ++this._resultThumbToken;
        (async () => {
          for (let _0x35c251 = 0; _0x35c251 < _0x54a8d2.length; _0x35c251++) {
            if (_0x3659e5 !== this._resultThumbToken) {
              return;
            }
            const _0x563841 = _0x2c53fb.getState().nodes?.[_0x3b112b];
            if (!_0x563841) {
              return;
            }
            const _0xe272a9 = Array.isArray(_0x563841.videos) ? _0x563841.videos : [];
            const _0xe752fe = _0xe272a9[_0x35c251];
            if (!_0xe752fe || typeof _0xe752fe !== "object") {
              continue;
            }
            const _0x2b8401 = !!String(_0xe752fe.thumbUrl || "").trim();
            if (_0x2b8401) {
              const _0x19162e = Number(_0x563841.mainVideoIndex);
              const _0x50dd4e = Number.isFinite(_0x19162e) ? Math.max(0, Math.trunc(_0x19162e)) : 0;
              if (_0x35c251 === _0x50dd4e && !String(_0x563841.thumbUrl || "").trim()) {
                _0x2c53fb.updateNodeData(_0x3b112b, {
                  thumbUrl: String(_0xe752fe.thumbUrl).trim()
                });
              }
              continue;
            }
            const _0x28f32a = this._resolveVideoMetaSrcFromVideoData(_0xe752fe);
            if (!_0x28f32a) {
              continue;
            }
            if (!_0x28f32a.startsWith("/output/") && !_0x28f32a.startsWith("/data/")) {
              continue;
            }
            const _0x1f8627 = "gen|" + _0x3b112b + "|" + _0x35c251 + "|" + _0x28f32a;
            if (this._videoThumbPending.has(_0x1f8627)) {
              continue;
            }
            this._videoThumbPending.add(_0x1f8627);
            let _0x4291cd = null;
            try {
              _0x4291cd = await _0x156e40.fetchVideoFirstFrameThumbFromServer(_0x28f32a, {
                nodeId: _0x3b112b,
                assetId: String(_0xe752fe.assetId || _0xe752fe.thumbId || "")
              });
            } catch {
              _0x4291cd = null;
            } finally {
              this._videoThumbPending.delete(_0x1f8627);
            }
            if (_0x3659e5 !== this._resultThumbToken) {
              return;
            }
            const _0x22b73c = String(_0x4291cd?.thumbUrl || _0x4291cd?.url || "").trim();
            if (!_0x22b73c) {
              continue;
            }
            const _0xb73992 = _0x2c53fb.getState().nodes?.[_0x3b112b];
            if (!_0xb73992) {
              return;
            }
            const _0x2a1bf3 = Array.isArray(_0xb73992.videos) ? _0xb73992.videos : [];
            const _0x567971 = _0x2a1bf3[_0x35c251];
            if (!_0x567971 || typeof _0x567971 !== "object") {
              continue;
            }
            const _0x139343 = {
              ..._0x567971
            };
            if (!String(_0x139343.thumbUrl || "").trim() && _0x22b73c) {
              _0x139343.thumbUrl = _0x22b73c;
            }
            const _0x3ce72a = _0x2a1bf3.slice();
            _0x3ce72a[_0x35c251] = _0x139343;
            const _0x4b491c = {
              videos: _0x3ce72a
            };
            const _0x13b9fd = Number(_0xb73992.mainVideoIndex);
            const _0x4c7ab7 = Number.isFinite(_0x13b9fd) ? Math.max(0, Math.trunc(_0x13b9fd)) : 0;
            if (_0x35c251 === _0x4c7ab7) {
              if (!String(_0xb73992.thumbUrl || "").trim() && _0x22b73c) {
                _0x4b491c.thumbUrl = _0x22b73c;
              }
            }
            _0x2c53fb.updateNodeData(_0x3b112b, _0x4b491c);
          }
        })();
      }
      {
        const _0x25f29e = this.nodeId;
        const _0x51ee1d = ++this._metaFetchToken;
        (async () => {
          for (let _0x4d7b4b = 0; _0x4d7b4b < _0x54a8d2.length; _0x4d7b4b++) {
            if (_0x51ee1d !== this._metaFetchToken) {
              return;
            }
            const _0x3d9dcb = _0x2c53fb.getState().nodes?.[_0x25f29e];
            if (!_0x3d9dcb) {
              return;
            }
            const _0x2e571f = Array.isArray(_0x3d9dcb.videos) ? _0x3d9dcb.videos : [];
            const _0xf7232b = _0x2e571f[_0x4d7b4b];
            if (!_0xf7232b || typeof _0xf7232b !== "object") {
              continue;
            }
            const _0x3217a0 = Number(_0xf7232b.videoWidth || 0);
            const _0x126174 = Number(_0xf7232b.videoHeight || 0);
            if (_0x3217a0 > 0 && _0x126174 > 0) {
              const _0x1e5b30 = Number(_0x3d9dcb.mainVideoIndex);
              const _0xa611d7 = Number.isFinite(_0x1e5b30) ? Math.max(0, Math.trunc(_0x1e5b30)) : 0;
              if (_0x4d7b4b === _0xa611d7 && isRhAiAppVideoNodeData(_0x3d9dcb)) {
                const _0x54f96e = buildRhAiAppResultDisplayPatch({
                  nodeData: _0x3d9dcb,
                  mediaWidth: _0x3217a0,
                  mediaHeight: _0x126174,
                  mediaKey: getRhAiAppVideoResultMediaKey(_0xf7232b, _0x3d9dcb)
                });
                if (Object.keys(_0x54f96e).length > 0) {
                  _0x2c53fb.updateNodeData(_0x25f29e, _0x54f96e);
                }
              }
              continue;
            }
            const _0x33f77a = this._resolveVideoMetaSrcFromVideoData(_0xf7232b);
            if (!_0x33f77a) {
              continue;
            }
            let _0x163a2c = null;
            try {
              _0x163a2c = await _0x156e40.fetchVideoMetaFromServer(_0x33f77a);
            } catch {
              _0x163a2c = null;
            }
            if (_0x51ee1d !== this._metaFetchToken) {
              return;
            }
            if (!_0x163a2c || _0x163a2c.success !== true) {
              continue;
            }
            const _0x41250b = Math.round(Number(_0x163a2c.width) || 0);
            const _0x1c32a6 = Math.round(Number(_0x163a2c.height) || 0);
            const _0x47593a = Number(_0x163a2c.duration);
            if (!(_0x41250b > 0) || !(_0x1c32a6 > 0)) {
              continue;
            }
            const _0x4d3467 = _0x2c53fb.getState().nodes?.[_0x25f29e];
            if (!_0x4d3467) {
              return;
            }
            const _0x46d555 = Array.isArray(_0x4d3467.videos) ? _0x4d3467.videos : [];
            const _0x11fe2e = _0x46d555[_0x4d7b4b];
            if (!_0x11fe2e || typeof _0x11fe2e !== "object") {
              continue;
            }
            const _0x4c8ab6 = Number(_0x11fe2e.videoWidth || 0);
            const _0xedd334 = Number(_0x11fe2e.videoHeight || 0);
            if (_0x4c8ab6 > 0 && _0xedd334 > 0) {
              continue;
            }
            const _0x5b305e = {
              ..._0x11fe2e,
              videoWidth: _0x41250b,
              videoHeight: _0x1c32a6
            };
            if (Number.isFinite(_0x47593a) && _0x47593a > 0 && !(Number(_0x5b305e.duration) > 0)) {
              _0x5b305e.duration = _0x47593a;
            }
            const _0x5b3c5f = _0x46d555.slice();
            _0x5b3c5f[_0x4d7b4b] = _0x5b305e;
            const _0x505e5a = {
              videos: _0x5b3c5f
            };
            const _0x21563a = Number(_0x4d3467.mainVideoIndex);
            const _0x2122e5 = Number.isFinite(_0x21563a) ? Math.max(0, Math.trunc(_0x21563a)) : 0;
            if (_0x4d7b4b === _0x2122e5) {
              _0x505e5a.videoWidth = _0x41250b;
              _0x505e5a.videoHeight = _0x1c32a6;
              _0x505e5a.selectedVideoWidth = _0x41250b;
              _0x505e5a.selectedVideoHeight = _0x1c32a6;
              if (Number.isFinite(_0x47593a) && _0x47593a > 0) {
                _0x505e5a.videoDuration = _0x47593a;
              }
              if (isRhAiAppVideoNodeData(_0x4d3467)) {
                Object.assign(_0x505e5a, buildRhAiAppResultDisplayPatch({
                  nodeData: _0x4d3467,
                  mediaWidth: _0x41250b,
                  mediaHeight: _0x1c32a6,
                  mediaKey: getRhAiAppVideoResultMediaKey(_0x11fe2e, _0x4d3467)
                }));
              }
            }
            _0x2c53fb.updateNodeData(_0x25f29e, _0x505e5a);
          }
        })();
      }
    }
    _finalizeVideoSuccessSideEffects(_0xa38ad7, _0x106dac) {
      this._scheduleDreaminaResultEnrichment(_0xa38ad7);
      this._dispatchGenerationHistoryVideos(_0xa38ad7, _0x106dac);
      const _0x187899 = _0xa38ad7.find(_0x448653 => _0x448653?.saveError)?.saveError;
      if (_0x187899) {
        window.showToast?.(videoTaskText("toasts.localSaveFailed", {
          error: _0x187899
        }), "warning");
      }
    }
    _finalizeDreaminaSuccessResult(_0x53bcad, _0x20f1cf, _0xfcdee1 = null, _0x13b13a = {}) {
      const _0x403290 = this._applyDreaminaSuccessResult(_0x53bcad, _0x20f1cf, _0xfcdee1, {
        writeStore: _0x13b13a.writeStore !== false,
        returnPatch: _0x13b13a.returnPatch === true
      });
      const _0xd5836f = Array.isArray(_0x403290) ? _0x403290 : _0x403290?.videos || [];
      this._finalizeVideoSuccessSideEffects(_0xd5836f, _0x20f1cf);
      if (_0x13b13a.returnPatch === true) {
        return {
          ...(_0x403290 && !Array.isArray(_0x403290) ? _0x403290 : {}),
          videos: _0xd5836f
        };
      } else {
        return _0xd5836f;
      }
    }
    _dispatchGenerationHistoryVideos(_0x4e1341, _0x463b00) {
      if (typeof window === "undefined" || typeof window.dispatchEvent !== "function") {
        return;
      }
      const _0x5866ea = Array.isArray(_0x4e1341) ? _0x4e1341.filter(_0x581526 => _0x581526 && typeof _0x581526 === "object" && !_0x581526.error) : [];
      if (_0x5866ea.length === 0) {
        return;
      }
      const _0x4a179d = _0x2c53fb.getState().nodes?.[this.nodeId] || this._data || {};
      try {
        window.dispatchEvent(new CustomEvent(GENERATION_HISTORY_EVENT, {
          detail: {
            kind: "video",
            sourceNodeId: this.nodeId,
            nodeData: _0x4a179d,
            videos: _0x5866ea,
            startedAt: _0x463b00,
            createdAt: Date.now()
          }
        }));
      } catch {}
    }
    async _maybeResumeDreaminaTaskImpl() {
      if (this._videoSubmitInFlight === true) {
        return;
      }
      const _0x5bf0b2 = _0x32fbe8().nodes?.[this.nodeId] || this._data || {};
      if (!this._isDreaminaVideoNode(_0x5bf0b2)) {
        this._stopDreaminaRecovery(false);
        return;
      }
      if (!this._isDreaminaRecoverableRunningTask(_0x5bf0b2)) {
        this._stopDreaminaRecovery(false);
        return;
      }
      const _0x318201 = this._resolveDreaminaResumeSubmitId(_0x5bf0b2);
      if (!_0x318201) {
        this._stopDreaminaRecovery(false);
        return;
      }
      const _0x36bf56 = String(this._dreaminaActiveSubmitId || "").trim();
      if (this._isGenerating && _0x5bf0b2?.dreaminaTaskRecovering !== true && _0x36bf56 && _0x36bf56 === _0x318201 && !this._isStaleActiveDreaminaTask(_0x5bf0b2)) {
        return;
      }
      if (this._dreaminaResumeSubmitId === _0x318201) {
        return;
      }
      this._stopDreaminaRecovery(false);
      const _0x179ce4 = Number(_0x5bf0b2?.dreaminaTaskStartedAt || _0x5bf0b2?.generationStartTime || Date.now());
      const _0x1db1b1 = resolveDreaminaStyleVideoProvider(_0x5bf0b2?.model, _0x5bf0b2?.provider);
      const _0x2bfbfb = _0x1db1b1 === "dreamina" && this._shouldProbeStaleDreaminaRecovery(_0x5bf0b2);
      this._dreaminaResumeSubmitId = _0x318201;
      this._dreaminaActiveSubmitId = _0x318201;
      const _0x5c90cc = (async () => {
        let _0x4060cd = null;
        try {
          _0x4060cd = new AbortController();
          this._dreaminaResumeAbortController = _0x4060cd;
          this._isGenerating = true;
          this._setGenerateButtonBusyUi({
            cancellable: false
          });
          _0x3975dd(this.previewEl);
          const _0x3d4c07 = await resumeTask(createGenerationResumePlanFromNode({
            kind: "video",
            node: _0x5bf0b2,
            taskProtocol: "dreamina",
            sourceNodeId: this.nodeId,
            targetNodeId: this.nodeId,
            trigger: "node",
            taskType: "video-generation",
            provider: _0x1db1b1 || "dreamina",
            adapterType: _0x1db1b1 === "dreamina" ? "localRuntime" : "modelApi",
            payload: {
              ..._0x5bf0b2,
              provider: _0x1db1b1 || _0x5bf0b2?.provider || "dreamina",
              model: _0x1db1b1 === "apimart" ? _0x5bf0b2?.model || APIMART_DREAMINA_VIDEO_DEFAULT_MODEL : _0x5bf0b2?.model || ""
            },
            cancellable: false,
            resumable: true,
            pauseOnAbort: true,
            startBuilder: () => ({
              ...this._buildDreaminaTaskPatch(this._buildDreaminaPendingSnapshot({
                submitId: _0x318201,
                phase: "generating",
                label: String(_0x5bf0b2?.dreaminaTaskLabel || "").trim() || videoTaskText("task.generating"),
                raw: _0x5bf0b2?.dreaminaTaskLastRaw || {}
              }), {
                recovering: true,
                startedAt: _0x179ce4
              })
            }),
            onTaskStart: () => {
              this._persistDreaminaResumeCache();
            },
            poll: async _0x1ac504 => {
              const _0x5840f4 = _0x1ac504?.payload || {};
              if (_0x1db1b1 && _0x1db1b1 !== "dreamina") {
                return _0x156e40.resumeAsyncVideoTask(_0x318201, _0x5840f4, {
                  signal: _0x4060cd.signal
                });
              }
              const _0x338d35 = async _0x5ec674 => {
                if (!_0x5ec674 || _0x4060cd.signal.aborted) {
                  return;
                }
                if (_0x1ac504?.isBackgroundTask?.()) {
                  _0x2c48e0(_0x1ac504, this.nodeId, this._buildDreaminaTaskPatch(_0x5ec674, {
                    recovering: true,
                    startedAt: _0x179ce4
                  }));
                } else {
                  this._applyDreaminaTaskSnapshot(_0x5ec674, {
                    recovering: true,
                    startedAt: _0x179ce4
                  });
                }
              };
              if (_0x2bfbfb) {
                if (typeof _0x156e40.probeDreaminaVideoTask !== "function") {
                  throw new Error("Dreamina 历史任务核验能力不可用");
                }
                const _0x23f1a9 = await _0x156e40.probeDreaminaVideoTask(_0x318201, {
                  signal: _0x4060cd.signal
                });
                await _0x338d35(_0x23f1a9?.dreaminaSnapshot);
                if (_0x23f1a9?.pending !== true) {
                  return _0x23f1a9;
                }
              }
              return _0x156e40.resumeDreaminaVideoTask(_0x318201, {
                signal: _0x4060cd.signal,
                intervalMs: _0x14004f,
                maxWaitMs: _0x2bfbfb ? _0x5e4984 : _0x4721b4,
                onProgress: _0x338d35
              });
            },
            resultBuilder: async (_0x59f34e, _0x22112b) => {
              const _0x13010a = _0x59f34e?.dreaminaSnapshot || null;
              const _0x2a0a9e = this._applyDreaminaSuccessResult(_0x59f34e, _0x22112b.startedAt, _0x13010a, {
                writeStore: false,
                returnPatch: true
              });
              return _0x2a0a9e?.patch || {};
            },
            failureBuilder: (_0x5b3c96, _0x53c0e5) => {
              if (_0x2bfbfb && this._isUncertainStaleDreaminaRecoveryError(_0x5b3c96)) {
                const _0x586e06 = videoTaskText("task.staleRecoveryStopped", {
                  message: _0x5b3c96?.message || videoTaskText("task.queryFailed")
                });
                const _0x1b2527 = this._buildDreaminaPendingSnapshot({
                  submitId: _0x318201,
                  phase: String(_0x5bf0b2?.dreaminaTaskPhase || "").trim() || "generating",
                  label: _0x586e06,
                  raw: _0x5bf0b2?.dreaminaTaskLastRaw || {}
                });
                return Object.assign(buildVideoGenerationFailurePatch({
                  error: _0x586e06,
                  startedAt: _0x53c0e5.startedAt
                }), this._buildDreaminaTaskPatch(_0x1b2527, {
                  recovering: false,
                  startedAt: _0x53c0e5.startedAt
                }));
              }
              if (!_0x2bfbfb && this._isDreaminaPollTimeoutError(_0x5b3c96)) {
                const _0x15b47f = this._buildDreaminaBackgroundPendingSnapshot(_0x318201);
                return Object.assign({
                  isGenerating: true,
                  jobStatus: "running",
                  jobError: null,
                  generationDuration: Date.now() - _0x53c0e5.startedAt
                }, this._buildDreaminaTaskPatch(_0x15b47f, {
                  recovering: false,
                  startedAt: _0x53c0e5.startedAt
                }));
              }
              const _0x44a0b6 = _0x5b3c96?.dreaminaSnapshot || null;
              const _0x26b628 = _0x5b3c96?.message || _0x44a0b6?.failReason || _0x44a0b6?.label || videoTaskText("task.queryFailed");
              return Object.assign(buildVideoGenerationFailurePatch({
                error: _0x26b628,
                startedAt: _0x53c0e5.startedAt
              }), _0x44a0b6 ? this._buildDreaminaTaskPatch(_0x44a0b6, {
                recovering: false,
                startedAt: _0x53c0e5.startedAt
              }) : this._buildDreaminaTaskPatch(this._buildDreaminaFailedSnapshot(_0x318201, _0x26b628), {
                recovering: false,
                startedAt: _0x53c0e5.startedAt
              }));
            },
            cancelledBuilder: _0x9271cd => Object.assign({
              generationDuration: Date.now() - _0x9271cd.startedAt
            }, this._buildDreaminaTaskPatch(this._buildDreaminaPendingSnapshot({
              submitId: _0x318201,
              phase: "generating",
              label: String(_0x5bf0b2?.dreaminaTaskLabel || "").trim() || videoTaskText("task.generating"),
              raw: _0x5bf0b2?.dreaminaTaskLastRaw || {}
            }), {
              recovering: false,
              startedAt: _0x9271cd.startedAt
            })),
            parseError: _0x18016e => getGenerationErrorMessage(_0x18016e, videoTaskText("task.queryFailed"))
          }), {
            store: _0x2c53fb,
            startedAt: _0x179ce4,
            abortController: _0x4060cd
          });
          if (_0x3d4c07.status === "pending") {
            this._persistDreaminaResumeCache();
            return;
          }
          if (_0x3d4c07.status === "success") {
            const _0x13f58f = normalizeVideoGenerationResult(_0x3d4c07.result).items;
            this._finalizeVideoSuccessSideEffects(_0x13f58f, _0x179ce4);
          }
          if (_0x3d4c07.status === "failed" && this._isDreaminaPollTimeoutError(_0x3d4c07.error)) {
            this._showDreaminaBackgroundQueueingToast(_0x318201);
          } else if (_0x3d4c07.status === "failed") {
            this._dreaminaActiveSubmitId = "";
          }
          this._persistDreaminaResumeCache();
        } catch (_0xe41a79) {
          if (_0x4060cd?.signal?.aborted || isGenerationAbortError(_0xe41a79)) {
            return;
          }
          const _0x3a073b = _0xe41a79?.message || videoTaskText("task.queryFailed");
          const _0x1acd1c = this._buildDreaminaFailedSnapshot(_0x318201, _0x3a073b);
          _0x2c53fb.updateNodeData(this.nodeId, Object.assign(buildVideoGenerationFailurePatch({
            error: _0x3a073b,
            startedAt: _0x179ce4
          }), this._buildDreaminaTaskPatch(_0x1acd1c, {
            recovering: false,
            startedAt: _0x179ce4
          })));
          this._persistDreaminaResumeCache();
        } finally {
          if (_0x4060cd && this._dreaminaResumeAbortController === _0x4060cd) {
            this._dreaminaResumeAbortController = null;
          }
          if (this._dreaminaResumeSubmitId === _0x318201) {
            this._dreaminaResumeSubmitId = "";
          }
          this._dreaminaResumePromise = null;
          const _0xfe8035 = this._syncLocalTaskNodeData();
          const _0x3ee01f = shouldShowGenerationBusyUi(_0xfe8035) || this._shouldKeepDreaminaLoading(_0xfe8035);
          this._isGenerating = _0x3ee01f;
          if (!_0x3ee01f) {
            this._dreaminaActiveSubmitId = "";
          }
          if (_0x3ee01f) {
            this._updateSubmitButtonState?.();
          } else {
            this._resetGenerateButtonIdleUi({
              cancellable: false
            });
            _0x41ac89(this.previewEl);
            this._updateSubmitButtonState?.();
          }
        }
      })();
      this._dreaminaResumePromise = _0x5c90cc;
    }
    async _maybeResumeRunningHubTaskImpl() {
      const _0x3d32a9 = _0x32fbe8().nodes?.[this.nodeId] || this._data || {};
      if (!this._isRunninghubWorkflowModel(_0x3d32a9?.model, _0x3d32a9?.provider)) {
        this._stopRunningHubRecovery(false);
        return;
      }
      if (!this._isRunningHubRecoverableRunningTask(_0x3d32a9)) {
        this._stopRunningHubRecovery(false);
        return;
      }
      const _0x371638 = String(_0x3d32a9?.rhTaskId || "").trim();
      if (!_0x371638) {
        this._stopRunningHubRecovery(false);
        return;
      }
      if (this._rhResumeTaskId === _0x371638 && this._rhResumePromise) {
        return;
      }
      this._stopRunningHubRecovery(false);
      const _0x2a6fd0 = Number(_0x3d32a9?.rhTaskStartedAt || _0x3d32a9?.generationStartTime || Date.now());
      const _0x48e9cd = _0x3d32a9?.rhTaskUseOpenapiQuery === true;
      this._rhResumeTaskId = _0x371638;
      const _0x160d1b = (async () => {
        let _0x4151c8 = null;
        let _0x43cb2f = null;
        try {
          const _0x5f2d40 = await this._buildPayload();
          _0x43cb2f = _0x5f2d40;
          if (!_0x5f2d40) {
            return;
          }
          _0x4151c8 = new AbortController();
          this._rhResumeAbortController = _0x4151c8;
          this._rhAbortController = _0x4151c8;
          this._rhTaskId = _0x371638;
          this._rhApiKey = String(_0x5f2d40?.apiKey || "").trim() || this._rhApiKey || null;
          this._rhCancelRequested = false;
          this._rhRemoteCancelSent = false;
          this._isGenerating = true;
          this._setGenerateButtonBusyUi({
            cancellable: true
          });
          _0x3975dd(this.previewEl);
          const _0x5a3f70 = await resumeTask(createGenerationResumePlanFromNode({
            kind: "video",
            node: _0x3d32a9,
            taskProtocol: "workflow",
            sourceNodeId: this.nodeId,
            targetNodeId: this.nodeId,
            trigger: "node",
            taskType: "video-generation",
            payload: _0x5f2d40,
            cancellable: true,
            resumable: true,
            pauseOnAbort: true,
            startBuilder: () => ({
              rhStatusMessage: null,
              rhStatusCode: null,
              rhTaskUseOpenapiQuery: _0x48e9cd
            }),
            onTaskStart: () => {
              this._persistRunningHubResumeCache();
            },
            poll: async () => _0x156e40.resumeRunningHubVideoTask(_0x371638, _0x5f2d40, {
              signal: _0x4151c8.signal,
              useOpenapiQuery: _0x48e9cd
            }),
            resultBuilder: async (_0x35f904, _0x5257c9) => {
              const _0x4c0dab = this._applyDreaminaSuccessResult(_0x35f904, _0x5257c9.startedAt, null, {
                writeStore: false,
                returnPatch: true
              });
              return {
                ...(_0x4c0dab?.patch || {}),
                rhStatusMessage: null,
                rhStatusCode: null,
                ...this._buildRunningHubTaskPatch({
                  taskId: _0x371638,
                  status: "success",
                  startedAt: _0x5257c9.startedAt,
                  recovering: false,
                  useOpenapiQuery: _0x48e9cd
                })
              };
            },
            failureBuilder: (_0x45bc72, _0x14adbf) => ({
              ...buildVideoGenerationFailurePatch({
                error: _0x45bc72?.message || videoTaskText("task.generationFailed"),
                startedAt: _0x14adbf.startedAt,
                duration: Date.now() - _0x14adbf.startedAt
              }),
              rhStatusMessage: _0x45bc72?.message || videoTaskText("task.generationFailed"),
              rhStatusCode: Number.isFinite(Number(_0x45bc72?.code)) ? Number(_0x45bc72.code) : null,
              ...this._buildRunningHubTaskPatch({
                taskId: _0x371638,
                status: "failed",
                startedAt: _0x14adbf.startedAt,
                recovering: false,
                useOpenapiQuery: _0x48e9cd
              })
            }),
            cancelledBuilder: _0x2070c5 => ({
              videos: [],
              videoUrl: "",
              localPath: "",
              generationDuration: Date.now() - _0x2070c5.startedAt,
              rhStatusMessage: videoTaskText("cancel.interrupted"),
              rhStatusCode: null,
              ...this._buildRunningHubTaskPatch({
                taskId: _0x371638,
                status: "cancelled",
                startedAt: _0x2070c5.startedAt,
                recovering: false,
                useOpenapiQuery: _0x48e9cd
              })
            }),
            parseError: _0x4e5237 => getGenerationErrorMessage(_0x4e5237, videoTaskText("task.generationFailed"))
          }), {
            store: _0x2c53fb,
            startedAt: _0x2a6fd0,
            abortController: _0x4151c8
          });
          if (_0x5a3f70.status === "pending") {
            this._persistRunningHubResumeCache();
            return;
          }
          if (_0x5a3f70.status === "success") {
            const _0x7022df = normalizeVideoGenerationResult(_0x5a3f70.result).items;
            this._finalizeVideoSuccessSideEffects(_0x7022df, _0x2a6fd0);
          }
          this._persistRunningHubResumeCache();
        } catch (_0x44f5b0) {
          if (_0x4151c8?.signal?.aborted || isGenerationAbortError(_0x44f5b0)) {
            return;
          }
          _0x2c53fb.updateNodeData(this.nodeId, {
            generationDuration: Math.max(0, Date.now() - _0x2a6fd0),
            rhStatusMessage: _0x44f5b0?.message || videoTaskText("task.generationFailed"),
            rhStatusCode: Number.isFinite(Number(_0x44f5b0?.code)) ? Number(_0x44f5b0.code) : null,
            ...this._buildRunningHubTaskPatch({
              taskId: _0x371638,
              status: "failed",
              startedAt: _0x2a6fd0,
              recovering: false,
              useOpenapiQuery: _0x48e9cd
            })
          });
          this._persistRunningHubResumeCache();
        } finally {
          if (_0x4151c8 && this._rhResumeAbortController === _0x4151c8) {
            this._rhResumeAbortController = null;
          }
          if (_0x4151c8 && this._rhAbortController === _0x4151c8) {
            this._rhAbortController = null;
          }
          if (this._rhResumeTaskId === _0x371638) {
            this._rhResumeTaskId = "";
          }
          releasePayloadObjectUrlLease(_0x43cb2f);
          this._rhResumePromise = null;
          const _0x292aad = this._syncLocalTaskNodeData();
          const _0x234cce = shouldShowGenerationBusyUi(_0x292aad);
          this._isGenerating = _0x234cce;
          if (_0x234cce) {
            this._rhTaskId = String(_0x292aad?.rhTaskId || _0x371638 || "").trim();
          } else {
            this._rhTaskId = null;
            if (!this._rhCancelRequested) {
              this._rhApiKey = null;
            }
            this._resetGenerateButtonIdleUi({
              cancellable: true
            });
            _0x41ac89(this.previewEl);
          }
          this._updateSubmitButtonState();
        }
      })();
      this._rhResumePromise = _0x160d1b;
    }
    async _maybeResumeAsyncTaskImpl() {
      const _0x2189d6 = _0x32fbe8().nodes?.[this.nodeId] || this._data || {};
      if (this._isGenerating && _0x2189d6?.asyncTaskRecovering !== true) {
        return;
      }
      if (!this._isAsyncRecoverableRunningTask(_0x2189d6)) {
        this._stopAsyncRecovery(false);
        return;
      }
      const _0x533f52 = String(_0x2189d6?.asyncTaskId || "").trim();
      if (!_0x533f52) {
        this._stopAsyncRecovery(false);
        return;
      }
      if (this._asyncResumeTaskId === _0x533f52 && this._asyncResumePromise) {
        return;
      }
      this._stopAsyncRecovery(false);
      const _0x74c21 = Number(_0x2189d6?.asyncTaskStartedAt || _0x2189d6?.generationStartTime || Date.now());
      const _0x358ef2 = this._inferAsyncProviderFromModel(_0x2189d6?.model, _0x2189d6?.asyncTaskProvider || _0x2189d6?.provider || "");
      this._asyncResumeTaskId = _0x533f52;
      const _0x592cce = (async () => {
        let _0x380985 = null;
        try {
          const _0x1215e7 = await this._buildResumePayload(_0x2189d6, {
            providerHint: _0x358ef2
          });
          if (!_0x1215e7) {
            return;
          }
          _0x380985 = new AbortController();
          this._asyncResumeAbortController = _0x380985;
          this._isGenerating = true;
          this._setGenerateButtonBusyUi({
            cancellable: false
          });
          _0x3975dd(this.previewEl);
          const _0x4ddd9f = await resumeTask(createGenerationResumePlanFromNode({
            kind: "video",
            node: _0x2189d6,
            taskProtocol: "asyncModelApi",
            sourceNodeId: this.nodeId,
            targetNodeId: this.nodeId,
            trigger: "node",
            taskType: "video-generation",
            payload: _0x1215e7,
            pauseOnAbort: true,
            persistTaskState: () => this._persistAsyncResumeCache(),
            poll: async () => _0x156e40.resumeAsyncVideoTask(_0x533f52, _0x1215e7, {
              signal: _0x380985.signal
            }),
            resultBuilder: async (_0x3c0c1a, _0xbf0e4c) => {
              const _0x257483 = this._applyDreaminaSuccessResult(_0x3c0c1a, _0xbf0e4c.startedAt, null, {
                writeStore: false,
                returnPatch: true
              });
              return _0x257483?.patch || {};
            },
            parseError: _0xf27a07 => getGenerationErrorMessage(_0xf27a07, videoTaskText("task.generationFailed"))
          }), {
            store: _0x2c53fb,
            startedAt: _0x74c21,
            abortController: _0x380985
          });
          if (_0x4ddd9f.status === "pending") {
            return;
          }
          if (_0x4ddd9f.status === "success") {
            const _0xe7d5bc = normalizeVideoGenerationResult(_0x4ddd9f.result).items;
            this._finalizeVideoSuccessSideEffects(_0xe7d5bc, _0x74c21);
          }
        } catch (_0x3c7237) {
          if (_0x380985?.signal?.aborted || isGenerationAbortError(_0x3c7237)) {
            return;
          }
          _0x2c53fb.updateNodeData(this.nodeId, {
            ...buildVideoGenerationFailurePatch({
              error: _0x3c7237?.message || videoTaskText("task.generationFailed"),
              startedAt: _0x74c21,
              duration: Math.max(0, Date.now() - _0x74c21)
            }),
            ...this._buildAsyncTaskPatch({
              provider: _0x358ef2,
              kind: "video",
              taskId: _0x533f52,
              status: "failed",
              startedAt: _0x74c21,
              recovering: false
            })
          });
          this._persistAsyncResumeCache();
        } finally {
          if (_0x380985 && this._asyncResumeAbortController === _0x380985) {
            this._asyncResumeAbortController = null;
          }
          if (this._asyncResumeTaskId === _0x533f52) {
            this._asyncResumeTaskId = "";
          }
          this._asyncResumePromise = null;
          const _0x264c0e = this._syncLocalTaskNodeData();
          const _0x50112f = shouldShowGenerationBusyUi(_0x264c0e);
          this._isGenerating = _0x50112f;
          if (!_0x50112f) {
            this._resetGenerateButtonIdleUi({
              cancellable: false
            });
            _0x41ac89(this.previewEl);
          }
          this._updateSubmitButtonState();
        }
      })();
      this._asyncResumePromise = _0x592cce;
    }
    async _handleGenerateOrCancelImpl(_0x4a00ea = null) {
      const _0x1f5024 = _0x2c53fb.getState().nodes?.[this.nodeId] || this._data || {};
      const _0x3b6c34 = this._isRunninghubWorkflowModel(_0x1f5024?.model, _0x1f5024?.provider);
      if (!_0x3b6c34 && this._dreaminaResumePromise) {
        this._stopDreaminaRecovery(true);
      }
      if (!_0x3b6c34 && this._asyncResumePromise) {
        this._stopAsyncRecovery(true);
      }
      if (shouldAllowCancel(_0x1f5024, {
        cancellable: _0x3b6c34,
        cancelInFlight: this._rhCancelInFlight === true
      })) {
        await this._cancelRunningHubWorkflowTask();
        return;
      }
      await this._onGenerate(_0x4a00ea);
    }
    async _cancelRunningHubWorkflowTaskImpl() {
      const _0x570ae7 = _0x2c53fb.getState().nodes?.[this.nodeId] || this._data || {};
      const _0x4e4898 = this._rhApiKey || "";
      const _0x33171d = String(this._rhTaskId || "").trim() || String(_0x570ae7?.rhTaskId || "").trim();
      const _0x3006ea = Date.now();
      const _0x39e22a = Number(_0x570ae7?.generationStartTime);
      const _0x142adc = _0x570ae7?.generationDuration != null ? _0x570ae7.generationDuration : Number.isFinite(_0x39e22a) && _0x39e22a > 0 ? Math.max(0, _0x3006ea - _0x39e22a) : 0;
      this._rhCancelRequested = true;
      if (this._rhAbortController && !this._rhAbortController.signal.aborted) {
        this._rhAbortController.abort();
      }
      const _0x24ad70 = !_0x4e4898;
      const _0x2692b9 = !_0x33171d;
      try {
        this._rhRemoteCancelSent = !_0x24ad70 && !_0x2692b9;
        const _0x546fa1 = ({
          remoteResult: _0x31fc8f,
          remoteError: _0x5588cf,
          startedAt: _0x3f6b3a
        }) => {
          const _0x34ce51 = Number(_0x31fc8f?.code);
          const _0x38f44d = _0x24ad70 ? videoTaskText("cancel.missingApiKey") : _0x2692b9 ? videoTaskText("cancel.interruptedNoTaskId") : "";
          const _0x3f90c7 = _0x38f44d || (_0x5588cf ? _0x5588cf.message || videoTaskText("cancel.failed") : _0x34ce51 === 0 ? videoTaskText("cancel.success") : _0x34ce51 === 807 ? videoTaskText("cancel.taskNotFound") : _0x31fc8f?.msg || videoTaskText("cancel.failed"));
          return {
            rhStatusMessage: _0x3f90c7,
            rhStatusCode: _0x2692b9 ? 813 : Number.isFinite(_0x34ce51) ? _0x34ce51 : null,
            videos: [],
            videoUrl: "",
            localPath: "",
            generationDuration: _0x142adc,
            ...this._buildRunningHubTaskPatch({
              taskId: _0x33171d,
              status: "cancelled",
              startedAt: Number(_0x3f6b3a || _0x570ae7?.rhTaskStartedAt || _0x570ae7?.generationStartTime || 0),
              recovering: false,
              useOpenapiQuery: _0x570ae7?.rhTaskUseOpenapiQuery === true
            })
          };
        };
        await cancelTask(this.nodeId, {
          store: _0x2c53fb,
          taskId: _0x33171d,
          cancellable: true,
          cancel: ({
            taskId: _0x2344c0
          }) => {
            if (!_0x4e4898) {
              throw new Error(videoTaskText("cancel.missingApiKey"));
            }
            return _0x156e40.cancelRunningHubWorkflowTask({
              apiKey: _0x4e4898,
              taskId: _0x2344c0,
              providerProfileId: _0x570ae7?.providerProfileId || _0x570ae7?.rhProviderProfileId || ""
            });
          },
          cancelledBuilder: _0x546fa1,
          spec: createGenerationCancelPlanFromNode({
            kind: "video",
            node: _0x570ae7,
            taskProtocol: "workflow",
            sourceNodeId: this.nodeId,
            targetNodeId: this.nodeId,
            trigger: "node",
            taskType: "video-generation",
            payload: _0x570ae7,
            cancellable: true,
            resumable: true,
            cancelledBuilder: _0x546fa1
          })
        });
        this._persistRunningHubResumeCache();
      } finally {
        this._isGenerating = false;
        this._rhAbortController = null;
        this._rhTaskId = null;
        this._rhApiKey = null;
        this._rhRemoteCancelSent = false;
        this._stopRunningHubRecovery(true);
        this._resetGenerateButtonIdleUi({
          cancellable: true
        });
        _0x41ac89(this.previewEl);
        this._updateSubmitButtonState();
      }
    }
    _setGenerateButtonBusyUi({
      cancellable = false
    } = {}) {
      if (!this.btnEl) {
        return;
      }
      if (cancellable) {
        const _0x573d28 = getVideoCancelTooltip();
        setGenerateButtonCancellableUi(this.btnEl, {
          title: _0x573d28,
          tooltip: _0x573d28,
          ariaLabel: videoTaskText("controls.cancelGenerateAria"),
          color: "var(--red)",
          busy: true
        });
        return;
      }
      const _0x577f2a = getVideoGenerateTitle();
      setGenerateButtonLoadingUi(this.btnEl, {
        title: _0x577f2a,
        disabled: true,
        ariaLabel: _0x577f2a
      });
    }
    _resetGenerateButtonIdleUi({
      cancellable = false
    } = {}) {
      if (!this.btnEl) {
        return;
      }
      const _0x1a4c41 = getVideoGenerateTitle();
      resetGenerateButtonIdleUi(this.btnEl, _0x1a4c41);
      if (cancellable) {
        this.btnEl.removeAttribute("title");
        this.btnEl.setAttribute("data-tooltip", getVideoCancelTooltip());
        return;
      }
      this.btnEl.removeAttribute("data-tooltip");
      this.btnEl.title = _0x1a4c41;
    }
    _getPreviewGenerateButtonLoadingOptions() {
      return createPreviewGenerateButtonCallbacks(this, getVideoGenerateTitle());
    }
    async _onGenerateImpl(_0x51ec51 = null, _0x442f45 = {}) {
      if (this._isGenerating) {
        return;
      }
      if (_0x442f45?.insertPrompt === true) {
        insertPresetPromptIntoEditor({
          storeApi: _0x2c53fb,
          nodeId: this.nodeId,
          promptEl: this.promptEl,
          template: _0x51ec51,
          inEdges: _0x2c53fb.getIncomingEdges(this.nodeId),
          nodes: _0x2c53fb.getState().nodes || {},
          allowedAssetTypes: ["text", "image", "video", "audio"]
        });
        this._updateSubmitButtonState?.();
        return;
      }
      if (shouldUsePromptPreviewForPreset(_0x51ec51)) {
        const _0x57cd69 = await this._buildPayload(_0x51ec51);
        if (!_0x57cd69) {
          return;
        }
        try {
          previewPresetPromptInEditor({
            storeApi: _0x2c53fb,
            nodeId: this.nodeId,
            promptEl: this.promptEl,
            promptText: _0x57cd69.prompt
          });
        } finally {
          releasePayloadObjectUrlLease(_0x57cd69);
        }
        return;
      }
      if (isPreviewModeEnabled()) {
        if (!isPreviewNodeLoading(this.nodeId)) {
          startPreviewNodeLoading(this.nodeId, this.previewEl, this._getPreviewGenerateButtonLoadingOptions());
        }
        return;
      }
      if (this._videoSubmitInFlight === true) {
        return;
      }
      const _0x42d02b = _0x2c53fb.getState().nodes?.[this.nodeId] || this._data || {};
      const _0x208caa = typeof this._shouldKeepDreaminaLoading === "function" && typeof this._isDreaminaVideoNode === "function" ? this._shouldKeepDreaminaLoading(_0x42d02b) : false;
      if (shouldShowGenerationBusyUi(_0x42d02b) || _0x208caa) {
        return;
      }
      this._videoSubmitInFlight = true;
      let _0x12b62a = null;
      try {
        const _0x3c5d75 = String(this._data?.model || "").trim();
        const _0x442f11 = String(this._data?.provider || "").trim();
        await _0x24ad03(_0x3c5d75, _0x442f11);
        if (!this._guardVipSelection(this._data?.model || "", _0x442f11)) {
          return;
        }
        const _0x204154 = guardModelGenerationCredentials({
          modelId: _0x3c5d75,
          provider: _0x442f11,
          providerProfileId: _0x42d02b?.providerProfileId || _0x42d02b?.rhProviderProfileId
        });
        if (!_0x204154.ready) {
          return;
        }
        if (typeof window.ensureSubscriptionInstallId === "function") {
          try {
            await window.ensureSubscriptionInstallId();
          } catch {}
        }
        const _0x24e405 = await this._buildPayload(_0x51ec51, {
          randomizeSubmitParams: true
        });
        _0x12b62a = _0x24e405;
        if (!_0x24e405) {
          return;
        }
        if (!(await this._preflightConnectedLocalVideoInputs(_0x24e405))) {
          return;
        }
        const _0x3bab7c = String(_0x24e405.model || "").trim();
        if (_0x4d361d(_0x3bab7c, _0x24e405.provider) && !String(_0x24e405.installId || "").trim()) {
          window.showToast?.(videoTaskText("toasts.missingInstallId"), "error");
          return;
        }
        const _0x5aba81 = this._isRunninghubWorkflowModel(_0x24e405.model, _0x24e405.provider);
        const _0x4e3605 = String(_0x24e405?.provider || "").trim().toLowerCase() === "runninghub" && isModelApiModel(_0x24e405?.model, "runninghub");
        if (_0x4e3605 && !String(_0x24e405?.apiKey || "").trim()) {
          showProviderApiKeyMissingToast("请先填写 RunningHub 模型 API Key", {
            providerId: _0x24e405?.providerProfileId || "runninghub",
            keyType: "modelApi",
            model: _0x24e405?.model
          });
          return;
        }
        const _0x1c8a5d = this._isDreaminaVideoNode(_0x24e405);
        const _0x1f5189 = String(_0x24e405?.provider || this._data?.provider || "").trim().toLowerCase();
        const _0xd924fd = !_0x5aba81 && !_0x1c8a5d;
        if (_0x1c8a5d) {
          this._stopDreaminaRecovery(true);
        }
        if (_0x5aba81) {
          this._stopRunningHubRecovery(true);
        }
        if (_0xd924fd) {
          this._stopAsyncRecovery(true);
        }
        this._rhGenToken = (this._rhGenToken || 0) + 1;
        const _0x332ec4 = this._rhGenToken;
        this._rhCancelRequested = false;
        this._rhRemoteCancelSent = false;
        this._rhApiKey = _0x5aba81 ? _0x24e405.apiKey : null;
        this._rhTaskId = null;
        this._rhAbortController = _0x1c8a5d || _0x5aba81 || _0xd924fd ? new AbortController() : null;
        this._isGenerating = true;
        this._setGenerateButtonBusyUi({
          cancellable: _0x5aba81
        });
        _0x3975dd(this.previewEl);
        const _0x4d820b = Date.now();
        const _0x5047bd = {
          ...buildGenerationStartPatch({
            startedAt: _0x4d820b
          }),
          generationStartTime: _0x4d820b,
          generationDuration: null,
          rhStatusMessage: null,
          rhStatusCode: null
        };
        if ((_0x5aba81 || _0x4e3605) && _0x24e405?.providerProfileId) {
          _0x5047bd.rhProviderProfileId = normalizeRunningHubModelApiProfileId(_0x24e405?.providerProfileId);
        }
        if (_0x1c8a5d) {
          Object.assign(_0x5047bd, {
            dreaminaSubmitId: "",
            dreaminaTaskStatus: "pending",
            dreaminaTaskPhase: "generating",
            dreaminaTaskLabel: videoTaskText("task.submitting"),
            dreaminaTaskStartedAt: _0x4d820b,
            dreaminaTaskLastCheckedAt: null,
            dreaminaTaskLastRaw: {},
            dreaminaTaskRecovering: false
          });
          Object.assign(_0x5047bd, {
            ...this._buildRunningHubTaskPatch({
              taskId: "",
              status: "idle",
              startedAt: 0,
              recovering: false,
              useOpenapiQuery: false
            }),
            ...this._buildAsyncTaskPatch({
              provider: "",
              kind: "video",
              taskId: "",
              status: "idle",
              startedAt: 0,
              recovering: false
            })
          });
        }
        if (_0x5aba81) {
          Object.assign(_0x5047bd, {
            rhTaskId: "",
            rhTaskStatus: "pending",
            rhTaskStartedAt: _0x4d820b,
            rhTaskRecovering: false,
            rhTaskUseOpenapiQuery: false
          });
          Object.assign(_0x5047bd, {
            dreaminaSubmitId: "",
            dreaminaTaskStatus: "idle",
            dreaminaTaskPhase: "done",
            dreaminaTaskLabel: "",
            dreaminaTaskStartedAt: 0,
            dreaminaTaskLastCheckedAt: null,
            dreaminaTaskLastRaw: {},
            dreaminaTaskRecovering: false,
            ...this._buildAsyncTaskPatch({
              provider: "",
              kind: "video",
              taskId: "",
              status: "idle",
              startedAt: 0,
              recovering: false
            })
          });
        }
        if (_0xd924fd) {
          Object.assign(_0x5047bd, this._buildAsyncTaskPatch({
            provider: _0x1f5189,
            kind: "video",
            taskId: "",
            status: "pending",
            startedAt: _0x4d820b,
            recovering: false
          }));
          Object.assign(_0x5047bd, {
            ...this._buildRunningHubTaskPatch({
              taskId: "",
              status: "idle",
              startedAt: 0,
              recovering: false,
              useOpenapiQuery: false
            }),
            dreaminaSubmitId: "",
            dreaminaTaskStatus: "idle",
            dreaminaTaskPhase: "done",
            dreaminaTaskLabel: "",
            dreaminaTaskStartedAt: 0,
            dreaminaTaskLastCheckedAt: null,
            dreaminaTaskLastRaw: {},
            dreaminaTaskRecovering: false
          });
        }
        try {
          const _0x5d339a = await submitTask(createGenerationSubmitPlan({
            kind: "video",
            sourceNodeId: this.nodeId,
            targetNodeId: this.nodeId,
            trigger: "node",
            taskType: "video-generation",
            provider: _0x24e405.provider || _0x1f5189 || this._data?.provider || "",
            adapterType: _0x5aba81 ? "workflow" : "modelApi",
            modelId: _0x24e405.model || this._data?.model || "",
            payload: _0x24e405,
            cancellable: _0x5aba81,
            resumable: _0x1c8a5d || _0x5aba81 || _0xd924fd,
            pauseOnAbort: _0x1c8a5d || _0x5aba81 || _0xd924fd ? "afterTaskId" : false,
            async: _0xd924fd,
            startBuilder: () => _0x5047bd,
            onTaskStart: () => {
              this._syncLocalTaskNodeData();
              if (_0x1c8a5d) {
                this._persistDreaminaResumeCache();
              }
              if (_0x5aba81) {
                this._persistRunningHubResumeCache();
              }
              if (_0xd924fd) {
                this._persistAsyncResumeCache();
              }
            },
            submit: async (_0x2ad3f6, _0x1a2eee = {}) => _0x156e40.generateVideo(_0x24e405, {
              ...(_0x1a2eee.signal ? {
                signal: _0x1a2eee.signal
              } : {}),
              runningHubWorkflowQueueLease: _0x1a2eee.runningHubWorkflowQueueLease,
              ...(_0x1c8a5d ? {
                maxWaitMs: _0x5e4984
              } : {}),
              onTaskMeta: ({
                taskId: _0x2aa766,
                useOpenapiQuery: _0x1fac39,
                provider: _0x4b97fb
              }) => {
                if (_0x332ec4 !== this._rhGenToken) {
                  return;
                }
                const _0x1ac8d9 = String(_0x2aa766 || "").trim();
                if (!_0x1ac8d9) {
                  return;
                }
                if (_0x5aba81) {
                  this._rhTaskId = _0x1ac8d9;
                  _0x1a2eee.onTaskId?.(_0x1ac8d9);
                  _0x2c48e0(_0x1a2eee, this.nodeId, {
                    rhStatusMessage: null,
                    rhStatusCode: null,
                    rhTaskUseOpenapiQuery: _0x1fac39 === true
                  });
                  if (!_0x1a2eee.isBackgroundTask?.()) {
                    this._syncLocalTaskNodeData();
                    this._persistRunningHubResumeCache();
                  }
                  return;
                }
                if (_0x1c8a5d) {
                  this._dreaminaActiveSubmitId = _0x1ac8d9;
                  const _0x5ee56c = this._buildDreaminaPendingSnapshot({
                    submitId: _0x1ac8d9,
                    phase: "generating",
                    label: videoTaskText("task.generating")
                  });
                  if (_0x1a2eee.isBackgroundTask?.()) {
                    _0x2c48e0(_0x1a2eee, this.nodeId, this._buildDreaminaTaskPatch(_0x5ee56c, {
                      recovering: false,
                      startedAt: _0x4d820b
                    }));
                  } else {
                    this._applyDreaminaTaskSnapshot(_0x5ee56c, {
                      recovering: false,
                      startedAt: _0x4d820b
                    });
                  }
                  _0x1a2eee.onTaskId?.(_0x1ac8d9);
                  return;
                }
                if (_0xd924fd) {
                  _0x1a2eee.onTaskId?.(_0x1ac8d9);
                  _0x2c48e0(_0x1a2eee, this.nodeId, {
                    asyncTaskProvider: String(_0x4b97fb || _0x1f5189 || this._data?.provider || "").trim().toLowerCase(),
                    asyncTaskKind: "video"
                  });
                  if (!_0x1a2eee.isBackgroundTask?.()) {
                    this._syncLocalTaskNodeData();
                    this._persistAsyncResumeCache();
                  }
                }
              },
              onTaskId: _0x319ce7 => {
                if (_0x332ec4 !== this._rhGenToken) {
                  return;
                }
                const _0x3e5546 = String(_0x319ce7 || "").trim();
                if (!_0x3e5546) {
                  return;
                }
                if (_0x1c8a5d) {
                  this._dreaminaActiveSubmitId = _0x3e5546;
                  const _0x189510 = this._buildDreaminaPendingSnapshot({
                    submitId: _0x3e5546,
                    phase: "generating",
                    label: videoTaskText("task.generating")
                  });
                  if (_0x1a2eee.isBackgroundTask?.()) {
                    _0x2c48e0(_0x1a2eee, this.nodeId, this._buildDreaminaTaskPatch(_0x189510, {
                      recovering: false,
                      startedAt: _0x4d820b
                    }));
                  } else {
                    this._applyDreaminaTaskSnapshot(_0x189510, {
                      recovering: false,
                      startedAt: _0x4d820b
                    });
                  }
                  _0x1a2eee.onTaskId?.(_0x3e5546);
                  return;
                }
                if (_0x5aba81) {
                  this._rhTaskId = _0x3e5546;
                  _0x1a2eee.onTaskId?.(_0x3e5546);
                  const _0x2a9892 = _0x1487ac(_0x1a2eee, this.nodeId);
                  _0x2c48e0(_0x1a2eee, this.nodeId, {
                    rhStatusMessage: null,
                    rhStatusCode: null,
                    rhTaskUseOpenapiQuery: _0x2a9892?.rhTaskUseOpenapiQuery === true
                  });
                  if (!_0x1a2eee.isBackgroundTask?.()) {
                    this._syncLocalTaskNodeData();
                    this._persistRunningHubResumeCache();
                  }
                  const _0x37be4d = this._rhApiKey || "";
                  if (this._rhCancelRequested && !this._rhRemoteCancelSent && _0x37be4d && _0x3e5546) {
                    this._rhRemoteCancelSent = true;
                    (async () => {
                      if (_0x332ec4 !== this._rhGenToken) {
                        return;
                      }
                      const _0x53d4f6 = ({
                        remoteResult: _0xba06f,
                        remoteError: _0x511db8
                      }) => {
                        const _0xc16249 = Number(_0xba06f?.code);
                        const _0x1db9fe = _0x511db8 ? _0x511db8.message || videoTaskText("cancel.failed") : _0xc16249 === 0 ? videoTaskText("cancel.success") : _0xc16249 === 807 ? videoTaskText("cancel.taskNotFound") : _0xba06f?.msg || videoTaskText("cancel.failed");
                        return {
                          rhStatusMessage: _0x1db9fe,
                          rhStatusCode: Number.isFinite(_0xc16249) ? _0xc16249 : null,
                          videos: [],
                          videoUrl: "",
                          localPath: "",
                          ...this._buildRunningHubTaskPatch({
                            taskId: _0x3e5546,
                            status: "cancelled",
                            startedAt: _0x4d820b,
                            recovering: false,
                            useOpenapiQuery: _0x2c53fb.getState().nodes?.[this.nodeId]?.rhTaskUseOpenapiQuery === true
                          })
                        };
                      };
                      await cancelTask(this.nodeId, {
                        store: _0x2c53fb,
                        taskId: _0x3e5546,
                        cancellable: true,
                        cancel: ({
                          taskId: _0x5195dc
                        }) => _0x156e40.cancelRunningHubWorkflowTask({
                          apiKey: _0x37be4d,
                          taskId: _0x5195dc,
                          providerProfileId: _0x24e405?.providerProfileId || _0x24e405?.rhProviderProfileId || ""
                        }),
                        cancelledBuilder: _0x53d4f6,
                        spec: createGenerationCancelPlanFromNode({
                          kind: "video",
                          node: _0x2c53fb.getState().nodes?.[this.nodeId] || {},
                          taskProtocol: "workflow",
                          sourceNodeId: this.nodeId,
                          targetNodeId: this.nodeId,
                          trigger: "node",
                          taskType: "video-generation",
                          payload: _0x24e405,
                          taskId: _0x3e5546,
                          cancellable: true,
                          resumable: true,
                          cancelledBuilder: _0x53d4f6
                        })
                      });
                      if (_0x332ec4 !== this._rhGenToken) {
                        return;
                      }
                      this._persistRunningHubResumeCache();
                    })();
                  }
                  return;
                }
                if (_0xd924fd) {
                  const _0x20b1ea = _0x1487ac(_0x1a2eee, this.nodeId);
                  _0x1a2eee.onTaskId?.(_0x3e5546);
                  _0x2c48e0(_0x1a2eee, this.nodeId, {
                    asyncTaskProvider: String(_0x20b1ea?.asyncTaskProvider || _0x1f5189 || this._data?.provider || "").trim().toLowerCase(),
                    asyncTaskKind: "video"
                  });
                  if (!_0x1a2eee.isBackgroundTask?.()) {
                    this._syncLocalTaskNodeData();
                    this._persistAsyncResumeCache();
                  }
                }
              },
              onProgress: _0x1c8a5d ? async _0x180b36 => {
                if (_0x332ec4 !== this._rhGenToken) {
                  return;
                }
                if (_0x1a2eee.isBackgroundTask?.()) {
                  _0x2c48e0(_0x1a2eee, this.nodeId, this._buildDreaminaTaskPatch(_0x180b36, {
                    recovering: false,
                    startedAt: _0x4d820b
                  }));
                } else {
                  this._applyDreaminaTaskSnapshot(_0x180b36, {
                    recovering: false,
                    startedAt: _0x4d820b
                  });
                }
              } : undefined
            }),
            cancel: _0x5aba81 ? async ({
              taskId: _0x4b6628
            }) => {
              const _0x2e1564 = this._rhApiKey || _0x24e405.apiKey || "";
              const _0xabc144 = String(_0x4b6628 || "").trim();
              if (!_0x2e1564 || !_0xabc144) {
                return null;
              }
              return _0x156e40.cancelRunningHubWorkflowTask({
                apiKey: _0x2e1564,
                taskId: _0xabc144,
                providerProfileId: _0x24e405?.providerProfileId || _0x24e405?.rhProviderProfileId || ""
              });
            } : undefined,
            resultBuilder: (_0x185b7a, _0x54048b) => {
              const _0x3e1dec = this._applyDreaminaSuccessResult(_0x185b7a, _0x54048b.startedAt, null, {
                writeStore: false,
                returnPatch: true
              });
              const _0x341477 = {
                ...(_0x3e1dec?.patch || {})
              };
              if (_0x5aba81) {
                const _0x10df08 = _0x54048b.getTaskNode?.() || {};
                Object.assign(_0x341477, {
                  rhStatusMessage: null,
                  rhStatusCode: null
                }, this._buildRunningHubTaskPatch({
                  taskId: String(this._rhTaskId || "").trim() || String(_0x10df08?.rhTaskId || "").trim(),
                  status: "success",
                  startedAt: _0x54048b.startedAt,
                  recovering: false,
                  useOpenapiQuery: _0x10df08?.rhTaskUseOpenapiQuery === true
                }));
              } else if (_0xd924fd) {
                const _0x57dcec = _0x54048b.getTaskNode?.() || {};
                Object.assign(_0x341477, this._buildAsyncTaskPatch({
                  provider: String(_0x57dcec?.asyncTaskProvider || _0x1f5189 || "").trim(),
                  kind: "video",
                  taskId: String(_0x57dcec?.asyncTaskId || "").trim(),
                  status: "success",
                  startedAt: _0x54048b.startedAt,
                  recovering: false
                }));
              }
              return _0x341477;
            },
            failureBuilder: (_0x4f4da8, _0x11219b) => {
              const _0x87f27d = _0x4f4da8?.message || videoTaskText("task.generationFailed");
              if (_0x1c8a5d && this._isDreaminaPollTimeoutError(_0x4f4da8)) {
                const _0x1556e5 = _0x11219b.getTaskNode?.() || {};
                const _0x45d49e = String(_0x1556e5?.dreaminaSubmitId || "").trim();
                const _0x4b442e = this._buildDreaminaBackgroundPendingSnapshot(_0x45d49e);
                return Object.assign({
                  isGenerating: true,
                  jobStatus: "running",
                  jobError: null,
                  generationDuration: Date.now() - _0x11219b.startedAt
                }, this._buildDreaminaTaskPatch(_0x4b442e, {
                  recovering: false,
                  startedAt: Number(_0x1556e5?.dreaminaTaskStartedAt || _0x1556e5?.generationStartTime || _0x11219b.startedAt)
                }));
              }
              const _0x5851f3 = buildVideoGenerationFailurePatch({
                error: _0x87f27d,
                startedAt: _0x11219b.startedAt,
                duration: Date.now() - _0x11219b.startedAt
              });
              if (_0x1c8a5d) {
                const _0x524dc8 = _0x11219b.getTaskNode?.() || {};
                const _0x49e947 = this._buildDreaminaFailedSnapshot(_0x524dc8?.dreaminaSubmitId || "", _0x87f27d);
                Object.assign(_0x5851f3, this._buildDreaminaTaskPatch(_0x49e947, {
                  recovering: false,
                  startedAt: _0x11219b.startedAt
                }));
                this._emitDreaminaTaskCenterUpdate(_0x49e947, {
                  status: "failed",
                  error: _0x87f27d,
                  startedAt: _0x11219b.startedAt
                });
              }
              if (_0x5aba81) {
                const _0x22f8e4 = _0x11219b.getTaskNode?.() || {};
                Object.assign(_0x5851f3, {
                  rhStatusMessage: _0x87f27d,
                  rhStatusCode: Number.isFinite(Number(_0x4f4da8?.code)) ? Number(_0x4f4da8.code) : null
                }, this._buildRunningHubTaskPatch({
                  taskId: String(this._rhTaskId || "").trim() || String(_0x22f8e4?.rhTaskId || "").trim(),
                  status: "failed",
                  startedAt: _0x11219b.startedAt,
                  recovering: false,
                  useOpenapiQuery: _0x22f8e4?.rhTaskUseOpenapiQuery === true
                }));
              }
              if (_0xd924fd) {
                const _0x49bd96 = _0x11219b.getTaskNode?.() || {};
                Object.assign(_0x5851f3, this._buildAsyncTaskPatch({
                  provider: String(_0x49bd96?.asyncTaskProvider || _0x1f5189 || "").trim(),
                  kind: "video",
                  taskId: String(_0x49bd96?.asyncTaskId || "").trim(),
                  status: "failed",
                  startedAt: _0x11219b.startedAt,
                  recovering: false
                }));
              }
              return _0x5851f3;
            },
            cancelledBuilder: _0x91e3ca => {
              const _0x2840ec = _0x91e3ca.getTaskNode?.() || {};
              return {
                videos: [],
                videoUrl: "",
                localPath: "",
                generationDuration: Date.now() - _0x91e3ca.startedAt,
                ...(_0x5aba81 ? {
                  rhStatusMessage: videoTaskText("task.generationCancelled"),
                  rhStatusCode: null,
                  ...this._buildRunningHubTaskPatch({
                    taskId: String(this._rhTaskId || "").trim() || String(_0x2840ec?.rhTaskId || "").trim(),
                    status: "cancelled",
                    startedAt: _0x91e3ca.startedAt,
                    recovering: false,
                    useOpenapiQuery: _0x2840ec?.rhTaskUseOpenapiQuery === true
                  })
                } : {})
              };
            },
            parseError: _0x2c955b => getGenerationErrorMessage(_0x2c955b, videoTaskText("task.generationFailed"))
          }), {
            store: _0x2c53fb,
            startedAt: _0x4d820b,
            abortController: this._rhAbortController
          });
          if (_0x5d339a.status === "pending") {
            return _0x5d339a;
          }
          if (_0x5d339a.status === "success") {
            const _0x50b585 = normalizeVideoGenerationResult(_0x5d339a.result).items;
            this._finalizeVideoSuccessSideEffects(_0x50b585, _0x4d820b);
            if (_0x1c8a5d) {
              this._persistDreaminaResumeCache();
            }
            if (_0x5aba81) {
              this._persistRunningHubResumeCache();
            }
            if (_0xd924fd) {
              this._persistAsyncResumeCache();
            }
            return _0x5d339a;
          }
          const _0x1bf650 = _0x5d339a.error;
          if (_0x5d339a.status === "failed" && _0x1c8a5d && this._isDreaminaPollTimeoutError(_0x1bf650)) {
            this._persistDreaminaResumeCache();
            this._showDreaminaBackgroundQueueingToast(_0x2c53fb.getState().nodes?.[this.nodeId]?.dreaminaSubmitId || "");
            return _0x5d339a;
          }
          if (_0x5d339a.status === "failed") {
            const _0x39027e = _0x1bf650?.message || "";
            const _0x5d9ab3 = showRunningHubMediaUploadGuideForError(_0x1bf650);
            const _0x58fdc2 = !_0x5d9ab3 && showProviderApiKeyMissingToastForError(_0x1bf650, {
              providerId: _0x24e405?.provider,
              model: _0x24e405?.model,
              adapterType: _0x4e3605 ? "modelApi" : _0x24e405?.adapterType
            });
            logDiagnosticEvent({
              type: "generation.video_failed",
              level: "error",
              source: "renderer",
              message: _0x39027e || videoTaskText("task.videoGenerationFailed"),
              error: _0x1bf650,
              context: {
                nodeId: this.nodeId,
                provider: _0x24e405?.provider || "",
                model: _0x24e405?.model || "",
                providerProfileId: _0x24e405?.providerProfileId || _0x24e405?.rhProviderProfileId || "",
                isDreamina: _0x1c8a5d,
                isRhWorkflow: _0x5aba81,
                isAsyncTaskModel: _0xd924fd
              }
            });
            if (!_0x5d9ab3 && !_0x58fdc2) {
              window.showToast?.(_0x39027e, "error", isDreaminaUploadDurationErrorMessage(_0x39027e) ? DREAMINA_UPLOAD_DURATION_ERROR_TOAST_MS : undefined);
            }
            if (_0x1c8a5d) {
              this._persistDreaminaResumeCache();
            }
            if (_0x5aba81) {
              this._persistRunningHubResumeCache();
            }
            if (_0xd924fd) {
              this._persistAsyncResumeCache();
            }
            return _0x5d339a;
          }
          return _0x5d339a;
        } catch (_0x21198b) {
          if (_0x5aba81 && (this._rhCancelRequested || isGenerationAbortError(_0x21198b))) {
            return;
          }
          if (_0x1c8a5d && this._isDreaminaPollTimeoutError(_0x21198b)) {
            const _0x10ae0d = _0x2c53fb.getState().nodes?.[this.nodeId] || {};
            const _0x5cb278 = String(_0x10ae0d?.dreaminaSubmitId || "").trim();
            const _0x108448 = this._buildDreaminaBackgroundPendingSnapshot(_0x5cb278);
            _0x2c53fb.updateNodeData(this.nodeId, Object.assign({
              isGenerating: true,
              jobStatus: "running",
              jobError: null,
              generationDuration: Date.now() - _0x4d820b
            }, this._buildDreaminaTaskPatch(_0x108448, {
              recovering: false,
              startedAt: Number(_0x10ae0d?.dreaminaTaskStartedAt || _0x10ae0d?.generationStartTime || _0x4d820b)
            })));
            this._persistDreaminaResumeCache();
            this._showDreaminaBackgroundQueueingToast(_0x5cb278);
            return;
          }
          const _0x48b472 = _0x21198b?.message || "";
          const _0x4a5785 = showRunningHubMediaUploadGuideForError(_0x21198b);
          const _0x39d711 = !_0x4a5785 && showProviderApiKeyMissingToastForError(_0x21198b, {
            providerId: _0x24e405?.provider,
            model: _0x24e405?.model,
            adapterType: _0x4e3605 ? "modelApi" : _0x24e405?.adapterType
          });
          logDiagnosticEvent({
            type: "generation.video_failed",
            level: "error",
            source: "renderer",
            message: _0x48b472 || videoTaskText("task.videoGenerationFailed"),
            error: _0x21198b,
            context: {
              nodeId: this.nodeId,
              provider: _0x24e405?.provider || "",
              model: _0x24e405?.model || "",
              providerProfileId: _0x24e405?.providerProfileId || _0x24e405?.rhProviderProfileId || "",
              isDreamina: _0x1c8a5d,
              isRhWorkflow: _0x5aba81,
              isAsyncTaskModel: _0xd924fd
            }
          });
          if (!_0x4a5785 && !_0x39d711) {
            window.showToast?.(_0x48b472, "error", isDreaminaUploadDurationErrorMessage(_0x48b472) ? DREAMINA_UPLOAD_DURATION_ERROR_TOAST_MS : undefined);
          }
          const _0x69eec = buildVideoGenerationFailurePatch({
            error: _0x48b472 || videoTaskText("task.generationFailed"),
            startedAt: _0x4d820b,
            duration: Date.now() - _0x4d820b
          });
          if (_0x1c8a5d) {
            Object.assign(_0x69eec, this._buildDreaminaTaskPatch(this._buildDreaminaFailedSnapshot(_0x2c53fb.getState().nodes?.[this.nodeId]?.dreaminaSubmitId || "", _0x21198b?.message || videoTaskText("task.generationFailed")), {
              recovering: false,
              startedAt: _0x4d820b
            }));
          }
          if (_0x5aba81) {
            Object.assign(_0x69eec, {
              rhStatusMessage: _0x21198b?.message || videoTaskText("task.generationFailed"),
              rhStatusCode: Number.isFinite(Number(_0x21198b?.code)) ? Number(_0x21198b.code) : null
            }, this._buildRunningHubTaskPatch({
              taskId: String(this._rhTaskId || "").trim() || String(_0x2c53fb.getState().nodes?.[this.nodeId]?.rhTaskId || "").trim(),
              status: "failed",
              startedAt: _0x4d820b,
              recovering: false,
              useOpenapiQuery: _0x2c53fb.getState().nodes?.[this.nodeId]?.rhTaskUseOpenapiQuery === true
            }));
          }
          if (_0xd924fd) {
            const _0x43f12b = _0x2c53fb.getState().nodes?.[this.nodeId] || {};
            Object.assign(_0x69eec, this._buildAsyncTaskPatch({
              provider: String(_0x43f12b?.asyncTaskProvider || _0x1f5189 || "").trim(),
              kind: "video",
              taskId: String(_0x43f12b?.asyncTaskId || "").trim(),
              status: "failed",
              startedAt: _0x4d820b,
              recovering: false
            }));
          }
          if (_0x1c8a5d) {
            this._emitDreaminaTaskCenterUpdate({
              submitId: _0x69eec.dreaminaSubmitId,
              status: _0x69eec.dreaminaTaskStatus,
              phase: _0x69eec.dreaminaTaskPhase,
              label: _0x69eec.dreaminaTaskLabel,
              failReason: _0x48b472
            }, {
              status: "failed",
              error: _0x48b472,
              startedAt: _0x4d820b
            });
          }
          _0x2c53fb.updateNodeData(this.nodeId, _0x69eec);
          if (_0x1c8a5d) {
            this._persistDreaminaResumeCache();
          }
          if (_0x5aba81) {
            this._persistRunningHubResumeCache();
          }
          if (_0xd924fd) {
            this._persistAsyncResumeCache();
          }
        } finally {
          const _0x1c5850 = this._syncLocalTaskNodeData();
          const _0x132d60 = shouldShowGenerationBusyUi(_0x1c5850);
          this._isGenerating = _0x132d60;
          if (_0x1c8a5d && !_0x132d60) {
            this._dreaminaActiveSubmitId = "";
          }
          this._rhAbortController = null;
          if (_0x5aba81 && _0x132d60) {
            const _0x10559e = String(_0x1c5850?.rhTaskId || "").trim();
            if (_0x10559e) {
              this._rhTaskId = _0x10559e;
            }
          } else {
            this._rhTaskId = null;
            if (!this._rhCancelRequested) {
              this._rhApiKey = null;
            }
          }
          if (_0x132d60) {
            this._updateSubmitButtonState?.();
          } else {
            this._resetGenerateButtonIdleUi({
              cancellable: _0x5aba81
            });
            _0x41ac89(this.previewEl);
            this._updateSubmitButtonState?.();
          }
        }
      } finally {
        releasePayloadObjectUrlLease(_0x12b62a);
        this._videoSubmitInFlight = false;
      }
    }
    async _buildPayloadImpl(_0x3c2d4c = null, _0x3ca696 = {}) {
      const _0x109797 = createPayloadObjectUrlLease({
        ownerId: "ai-video:" + this.nodeId + ":payload",
        kind: "image"
      });
      try {
        const _0x2ff872 = _0x2c53fb.getState?.() || {};
        const _0xcb5906 = _0x2ff872.nodes?.[this.nodeId];
        if (_0xcb5906 && typeof _0xcb5906 === "object") {
          this._data = _0xcb5906;
        }
        let _0x11eae9 = _0x2c53fb.getIncomingEdges(this.nodeId);
        if (shouldScopeRunningHubVideoSubmitEdges(this._data || {})) {
          _0x11eae9 = _0x11eae9.filter(_0x537161 => _0x537161?.targetId === this.nodeId);
        }
        const _0x2f22e7 = _0x2ff872.nodes || {};
        let _0x31c2d6 = [];
        let _0x41df16 = [];
        for (const _0x4f6a1b of _0x11eae9) {
          const _0x797aed = _0x2f22e7[_0x4f6a1b.sourceId];
          const _0x51cc39 = String(_0x797aed?.type || "").toLowerCase();
          const _0x58ad7f = _0x51cc39 === "source-image" || _0x51cc39 === "image" || _0x51cc39 === "ai-image";
          let _0x284ae7 = "";
          if (_0x58ad7f) {
            _0x284ae7 = resolveGenerationInputImageUrl(_0x797aed);
          }
          let _0x4e08ff = _0x58ad7f ? _0x284ae7 : _0x797aed?.videoUrl || _0x797aed?.imageUrl || "";
          if (String(_0x797aed?.type || "") === "ai-video") {
            const _0x42c566 = String(_0x4f6a1b?.sourceMediaKey || "").trim();
            if (_0x42c566) {
              const _0x10bab8 = Array.isArray(_0x797aed?.videos) ? _0x797aed.videos : [];
              const _0x3fc765 = _0x10bab8.find(_0x40de01 => {
                const _0x24b942 = String(_0x40de01?.localPath || "").trim() || String(_0x40de01?.videoUrl || "").trim();
                return _0x24b942 === _0x42c566;
              });
              if (_0x3fc765) {
                _0x4e08ff = localPathToUrl(_0x3fc765.localPath) || String(_0x3fc765.videoUrl || "").trim() || _0x4e08ff;
              }
            }
          }
          if (!_0x4e08ff && _0x2f22e7[_0x4f6a1b.sourceId]?.sourceId) {
            const _0x256938 = await _0x54f197(_0x2f22e7[_0x4f6a1b.sourceId].sourceId);
            if (_0x256938) {
              _0x4e08ff = _0x109797.create(_0x256938, {
                sourceUrl: _0x2f22e7[_0x4f6a1b.sourceId].sourceId
              });
            }
          }
          if (_0x4e08ff && !_0x31c2d6.includes(_0x4e08ff)) {
            _0x31c2d6.push(_0x4e08ff);
          }
          if (_0x58ad7f) {
            const _0x2a03bb = String(_0x284ae7 || _0x4e08ff || "").trim();
            if (_0x2a03bb && !_0x2a03bb.startsWith("blob:") && !_0x41df16.includes(_0x2a03bb)) {
              _0x41df16.push(_0x2a03bb);
            }
          }
        }
        const _0x2cb329 = [];
        const _0x2487c3 = resolvePresetPromptTextWithTextRefs({
          template: _0x3c2d4c,
          promptEl: this.promptEl,
          inEdges: _0x11eae9,
          nodes: _0x2f22e7,
          assetInputRefs: _0x2cb329,
          assetMediaCounts: {
            image: 0,
            video: 0,
            audio: 0
          },
          allowedAssetTypes: ["text", "image", "video", "audio"]
        });
        const _0x39aa8f = this._data.model || getDefaultRunningHubVideoWorkflowModelId();
        const _0x36466d = isDreaminaStyleVideoModel(_0x39aa8f, this._data.provider) ? resolveDreaminaStyleVideoProvider(_0x39aa8f, this._data.provider) : "";
        const _0x3f9822 = this._data.provider || _0x36466d || resolveModelProvider(_0x39aa8f) || "grsai";
        const _0xab71ec = isRunningHubWorkflowNode({
          ...this._data,
          model: _0x39aa8f,
          provider: _0x3f9822
        });
        if (_0xab71ec) {
          const _0x14db40 = _0x2f22e7?.[this.nodeId] || this._data || {};
          _0x2cb329.push(...getPromptAssetInputRefsFromNode(_0x14db40, {
            allowedTypes: ["image", "video", "audio"]
          }));
        }
        for (const _0x523305 of _0x2cb329) {
          if (_0x523305.url && !_0x31c2d6.includes(_0x523305.url)) {
            _0x31c2d6.push(_0x523305.url);
          }
          if (_0x523305.type === "image" && _0x523305.url && !_0x41df16.includes(_0x523305.url)) {
            _0x41df16.push(_0x523305.url);
          }
        }
        const _0x44626a = isDreaminaStyleVideoModel(_0x39aa8f, _0x3f9822);
        const _0x1db307 = _0x44626a ? _0x41df16.slice(0, 1) : _0x31c2d6;
        const _0x4504d8 = resolveModelExecution(_0x39aa8f, {
          providerHint: _0x3f9822
        }) || resolveModelExecution(_0x39aa8f);
        const _0x2c25cb = _0x4504d8?.modelManifest?.adapterType === "modelApi" && _0x4504d8?.modelManifest?.kind === "video" && _0x4504d8?.executionManifest?.adapterType === "modelApi";
        const _0x2373ea = this._isRunninghubWorkflowModel(_0x39aa8f, _0x3f9822) || _0xab71ec;
        if (_0x2c25cb) {
          const _0x270fc1 = validateModelApiVideoPrompt({
            model: _0x39aa8f,
            provider: _0x3f9822,
            prompt: _0x2487c3
          });
          if (!_0x270fc1.ok) {
            window.showToast?.(_0x270fc1.message, "warn");
            return null;
          }
        }
        const _0x2ff12d = evaluateGenerationPromptBoundary({
          model: _0x39aa8f,
          provider: _0x3f9822,
          promptText: _0x2487c3,
          hasInput: false
        });
        if (!_0x2ff12d.ok) {
          return null;
        }
        const _0x47d622 = this._data.resolution || "1080p";
        const _0x2d2c6f = _0x2373ea ? String(resolveVideoWorkflowSchemaParam(this._data, _0x39aa8f, "rhInstanceType")) === "plus" ? "plus" : "default" : this._data.rhInstanceType;
        const _0x391914 = String(_0x2f22e7?.[this.nodeId]?.providerProfileId || _0x2f22e7?.[this.nodeId]?.rhProviderProfileId || this._data?.providerProfileId || this._data?.rhProviderProfileId || "").trim();
        const _0x591230 = resolveModelGenerationProviderProfileId(_0x39aa8f, _0x3f9822, _0x391914);
        await _0xa6e637();
        const _0x191b4f = _0x3fde02(_0x591230 || _0x3f9822);
        let _0x2e7f9a = "";
        if (_0x3f9822 === "runninghub") {
          _0x2e7f9a = isModelApiModel(_0x39aa8f, _0x3f9822) ? _0x191b4f.modelApiKey || "" : _0x191b4f.apiKey || "";
        } else if (_0x3f9822 === "runninghubwf") {
          _0x2e7f9a = _0x191b4f.apiKey || "";
        } else {
          _0x2e7f9a = _0x191b4f.apiKey || "";
        }
        const _0x5aa66e = getPlainObject(this._data.generationParams);
        const _0x2eb495 = (_0x28db73, _0x41d0da) => Object.prototype.hasOwnProperty.call(_0x5aa66e, _0x28db73) ? _0x5aa66e[_0x28db73] : _0x41d0da;
        const _0x1903ba = {
          prompt: _0x2487c3,
          model: _0x39aa8f,
          generationParams: {
            ..._0x5aa66e
          },
          aspectRatio: _0x2eb495("aspectRatio", this._data.aspectRatio || "1:1"),
          resolution: _0x2eb495("resolution", _0x47d622),
          videoSize: _0x2eb495("resolution", _0x47d622),
          duration: _0x2eb495("duration", this._data.duration || 5),
          mode: this._data.mode || "全能参考",
          provider: _0x3f9822,
          ...(_0x591230 ? {
            providerProfileId: _0x591230
          } : {}),
          apiKey: _0x2e7f9a,
          cameraAngle: this._data.cameraAngle,
          inputUrls: _0x1db307,
          rhInstanceType: _0x2d2c6f,
          installId: String(window.__aicInstallId || "").trim()
        };
        if (_0x3ca696?.randomizeSubmitParams === true && _0x2c25cb) {
          const _0x4a59ff = buildSubmitRandomizedSeedPatch({
            modelManifest: _0x4504d8?.modelManifest || null,
            nodeData: this._data,
            payload: _0x1903ba
          });
          if (_0x4a59ff) {
            _0x1903ba.generationParams = _0x4a59ff.requestParams;
            _0x2c53fb.updateNodeData?.(this.nodeId, _0x4a59ff.storePatch);
            this._data = {
              ...(this._data || {}),
              ..._0x4a59ff.storePatch
            };
          }
        }
        const _0x42204d = resolveVideoSubmitInputMaterials({
          inEdges: _0x11eae9,
          nodes: _0x2f22e7,
          assetInputRefs: _0x2cb329,
          initialImageUrls: _0x41df16,
          resolveMediaUrl: _0x364500 => this._resolveMediaUrl(_0x364500)
        });
        const {
          getAudioUrl: _0x386618,
          getImageUrl: _0x31544d,
          getMaskImageUrl: _0x49b2ac,
          getVideoUrl: _0x4301fa
        } = _0x42204d.helpers;
        if (_0x44626a) {
          let _0x273596 = this._data;
          if (typeof this._normalizeDreaminaNodeData === "function") {
            _0x273596 = this._normalizeDreaminaNodeData(this._data, {
              syncStore: true
            }) || this._data;
            this._data = _0x273596;
          }
          const _0x5a400e = getPlainObject(_0x273596?.generationParams);
          const _0x4febe9 = (_0x839883, _0x266b1b) => {
            const _0x134604 = Array.isArray(_0x839883) ? _0x839883 : [_0x839883];
            for (const _0x2e9e2c of _0x134604) {
              const _0x2f2c6e = String(_0x2e9e2c || "").trim();
              if (_0x2f2c6e && Object.prototype.hasOwnProperty.call(_0x5a400e, _0x2f2c6e)) {
                return _0x5a400e[_0x2f2c6e];
              }
            }
            return _0x266b1b;
          };
          const _0x512b8c = resolveDreaminaStyleVideoProvider(_0x273596?.model || _0x39aa8f, _0x273596?.provider || _0x3f9822);
          const {
            images: _0x47a347,
            videos: _0x2270cf,
            audios: _0x3082bb,
            videoEntries: _0x25ccb5,
            audioEntries: _0x559724,
            providerAssetRefs: _0x400538
          } = _0x42204d.dreamina;
          const _0x386220 = validateModelMediaInputLimits({
            inputSlots: _0x4504d8?.modelManifest?.inputSlots || null,
            images: _0x47a347,
            videos: _0x2270cf,
            audios: _0x3082bb,
            videoEntries: _0x25ccb5,
            audioEntries: _0x559724
          });
          if (!_0x386220.ok) {
            window.showToast?.(getModelMediaInputLimitMessage(_0x386220), "warn");
            return null;
          }
          const _0x388a2b = normalizeDreaminaVideoRouteMode(_0x4febe9(["dreaminaRouteMode", "volcengine_seedance_2_mode", "rh_seedance_2_mode"], _0x273596?.dreaminaRouteMode), _0x273596?.mode);
          if (!isDreaminaVideoRouteModeEnabled(_0x388a2b)) {
            window.showToast?.(videoTaskText("toasts.smartMultiframeUnavailable"), "warn");
            return null;
          }
          const _0x26ffec = resolveDreaminaVideoTaskType({
            routeMode: _0x388a2b,
            imageCount: _0x47a347.length,
            videoCount: _0x2270cf.length,
            audioCount: _0x3082bb.length
          });
          const _0x24804b = validateDreaminaVideoRouteSelection({
            routeMode: _0x388a2b,
            taskType: _0x26ffec,
            model: _0x273596?.model,
            provider: _0x512b8c,
            imageCount: _0x47a347.length,
            videoCount: _0x2270cf.length,
            audioCount: _0x3082bb.length
          });
          if (_0x24804b) {
            window.showToast?.(_0x24804b, "warn");
            return null;
          }
          const _0x89dd3c = ensureDreaminaStyleVideoModelForTask(_0x26ffec, normalizeDreaminaStyleVideoModel(_0x273596?.model, _0x512b8c), _0x512b8c) || normalizeDreaminaStyleVideoModel(_0x273596?.model, _0x512b8c);
          const _0x215b1a = normalizeDreaminaStyleVideoResolution(_0x26ffec, _0x89dd3c, _0x4febe9("resolution", _0x273596?.resolution || _0x273596?.videoSize), _0x512b8c);
          const _0x3f8ba4 = normalizeDreaminaVideoAspectRatio(_0x4febe9("aspectRatio", _0x273596?.aspectRatio));
          const _0x9f1520 = normalizeDreaminaStyleVideoDuration(_0x26ffec, _0x89dd3c, _0x4febe9("duration", _0x273596?.duration), _0x512b8c);
          const _0x33a8ad = getDreaminaStyleVideoDefaultModel(_0x26ffec, _0x512b8c);
          const _0x4aba86 = {
            prompt: _0x2487c3,
            provider: _0x512b8c,
            model: _0x89dd3c || _0x33a8ad,
            generationParams: {
              ..._0x5a400e
            },
            modelVersion: _0x512b8c === "dreamina" ? getDreaminaStyleVideoModelVersion(_0x89dd3c, _0x512b8c) : "",
            dreaminaRouteMode: _0x388a2b,
            dreaminaTaskType: _0x26ffec,
            aspectRatio: _0x3f8ba4,
            duration: _0x9f1520,
            resolution: _0x215b1a,
            videoResolution: _0x215b1a,
            videoSize: _0x215b1a,
            images: _0x47a347,
            videos: _0x2270cf,
            audios: _0x3082bb,
            inputUrls: _0x47a347.slice(),
            providerAssetRefs: _0x400538,
            installId: String(window.__aicInstallId || "").trim()
          };
          if (Object.keys(_0x5a400e).length <= 0) {
            delete _0x4aba86.generationParams;
          }
          applyVideoNodeAdaptiveAspectRatio(_0x4aba86, {
            inEdges: _0x11eae9,
            nodes: _0x2f22e7,
            nodeData: _0x273596,
            provider: _0x512b8c,
            model: _0x4aba86.model,
            modelManifest: _0x4504d8?.modelManifest || null
          });
          if (_0x400538.length <= 0) {
            delete _0x4aba86.providerAssetRefs;
          }
          if (!_0x4aba86.modelVersion) {
            delete _0x4aba86.modelVersion;
          }
          if (!_0x215b1a) {
            delete _0x4aba86.resolution;
            delete _0x4aba86.videoResolution;
            delete _0x4aba86.videoSize;
          }
          if (_0x26ffec === "text2video") {
            if (!_0x2487c3) {
              return null;
            }
            _0x4aba86.inputUrls = [];
            _0x4aba86.images = [];
            _0x4aba86.videos = [];
            _0x4aba86.audios = [];
            return _0x109797.bind(_0x4aba86);
          }
          if (_0x26ffec === "image2video") {
            if (!_0x2487c3 || !_0x47a347[0]) {
              return null;
            }
            _0x4aba86.image = _0x47a347[0];
            _0x4aba86.inputUrls = [_0x47a347[0]];
            _0x4aba86.images = [_0x47a347[0]];
            if (_0x512b8c === "dreamina") {
              delete _0x4aba86.aspectRatio;
            }
            return _0x109797.bind(_0x4aba86);
          }
          if (_0x26ffec === "frames2video") {
            if (!_0x2487c3 || _0x47a347.length < 2) {
              return null;
            }
            _0x4aba86.first = _0x47a347[0];
            _0x4aba86.last = _0x47a347[1];
            _0x4aba86.inputUrls = _0x47a347.slice(0, 2);
            _0x4aba86.images = _0x47a347.slice(0, 2);
            if (_0x512b8c === "dreamina") {
              delete _0x4aba86.aspectRatio;
            }
            return _0x109797.bind(_0x4aba86);
          }
          if (_0x26ffec === "multiframe2video") {
            const _0x523684 = _0x47a347.slice(0, 20);
            if (_0x523684.length < 2) {
              return null;
            }
            const _0x2c96b7 = Math.max(0, _0x523684.length - 1);
            const _0x358b30 = Array.isArray(_0x273596?.dreaminaTransitionPrompts) ? _0x273596.dreaminaTransitionPrompts : [];
            const _0xd043f7 = Array.isArray(_0x273596?.dreaminaTransitionDurations) ? _0x273596.dreaminaTransitionDurations : [];
            const _0x45392a = [];
            const _0x284b6d = [];
            for (let _0x142b97 = 0; _0x142b97 < _0x2c96b7; _0x142b97 += 1) {
              const _0x9968a2 = String(_0x358b30[_0x142b97] || "").trim() || _0x2487c3;
              const _0x13f7c4 = Number(_0xd043f7[_0x142b97]);
              const _0x4a6d3a = Number.isFinite(_0x13f7c4) && _0x13f7c4 > 0 ? Math.max(1, Math.trunc(_0x13f7c4)) : 3;
              _0x45392a.push(_0x9968a2);
              _0x284b6d.push(_0x4a6d3a);
            }
            if (!_0x2487c3 && !_0x45392a.some(_0x323674 => String(_0x323674 || "").trim())) {
              return null;
            }
            _0x4aba86.images = _0x523684;
            _0x4aba86.inputUrls = _0x523684.slice();
            _0x4aba86.transitionPrompts = _0x45392a;
            _0x4aba86.transitionDurations = _0x284b6d;
            if (_0x523684.length === 2) {
              _0x4aba86.prompt = _0x45392a[0] || _0x2487c3;
              _0x4aba86.duration = _0x284b6d[0] || 3;
              delete _0x4aba86.transitionPrompts;
              delete _0x4aba86.transitionDurations;
            }
            delete _0x4aba86.modelVersion;
            delete _0x4aba86.model;
            delete _0x4aba86.aspectRatio;
            delete _0x4aba86.resolution;
            delete _0x4aba86.videoResolution;
            delete _0x4aba86.videoSize;
            return _0x109797.bind(_0x4aba86);
          }
          if (_0x26ffec === "multimodal2video") {
            if (_0x47a347.length <= 0 && _0x2270cf.length <= 0 && _0x3082bb.length <= 0) {
              return null;
            }
            if (!_0x4aba86.modelVersion) {
              if (_0x512b8c === "dreamina") {
                _0x4aba86.model = _0x33a8ad || _0x4aba86.model;
                _0x4aba86.modelVersion = getDreaminaStyleVideoModelVersion(_0x4aba86.model, _0x512b8c);
              } else if (!_0x4aba86.model) {
                _0x4aba86.model = APIMART_DREAMINA_VIDEO_DEFAULT_MODEL;
              }
            }
            return _0x109797.bind(_0x4aba86);
          }
          return null;
        }
        if (_0x2373ea) {
          const _0x1df7d1 = await buildRunningHubVideoWorkflowSubmitPatch({
            model: _0x39aa8f,
            nodeData: this._data,
            inEdges: _0x11eae9,
            nodes: _0x2f22e7,
            assetInputRefs: _0x2cb329,
            inputMaterials: _0x42204d.modelApi,
            prompt: _0x2487c3,
            helpers: {
              getVideoUrl: _0x4301fa,
              getImageUrl: _0x31544d,
              getMaskImageUrl: _0x49b2ac,
              getAudioUrl: _0x386618
            }
          });
          if (_0x1df7d1 === null) {
            return null;
          }
          Object.assign(_0x1903ba, _0x1df7d1.payloadPatch || {});
          applyVideoNodeAdaptiveAspectRatio(_0x1903ba, {
            inEdges: _0x11eae9,
            nodes: _0x2f22e7,
            nodeData: this._data,
            provider: _0x3f9822,
            model: _0x39aa8f,
            modelManifest: _0x4504d8?.modelManifest || null
          });
          if (Object.keys(_0x1df7d1.updateData || {}).length > 0) {
            _0x2c53fb.updateNodeData(this.nodeId, _0x1df7d1.updateData);
          }
          return _0x109797.bind(_0x1903ba);
        }
        if (_0x2c25cb && !_0x44626a) {
          const _0x578316 = compileModelApiVideoSubmit({
            payload: _0x1903ba,
            model: _0x39aa8f,
            provider: _0x3f9822,
            nodeData: this._data,
            modelExecution: _0x4504d8,
            inputMaterials: _0x42204d.modelApi,
            assetInputRefs: _0x2cb329,
            assetVideoCount: _0x42204d.assetVideoCount,
            inEdges: _0x11eae9,
            nodes: _0x2f22e7
          });
          if (!_0x578316.ok) {
            window.showToast?.(_0x578316.message, "warn");
            return null;
          }
          return _0x109797.bind(_0x578316.payload);
        }
        return _0x109797.bind(_0x1903ba);
      } finally {
        _0x109797.release();
      }
    }
  }
  return _0xf62074.prototype;
}
