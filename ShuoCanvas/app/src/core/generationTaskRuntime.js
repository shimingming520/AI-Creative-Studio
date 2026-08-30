import a628_0x491558 from "./stores/appStore.js";
import { buildGenerationCancelledPatch, buildGenerationFailurePatch, buildGenerationStartPatch, buildGenerationSuccessPatch } from "./generationTaskLifecycle.js";
import { buildGenerationProtocolTransitionPatch } from "./generationTaskProtocolState.js";
import { playCompletionSound } from "../services/completionSoundService.js";
import { showGenerationCompleteNotification } from "../services/completionNotificationService.js";
import { logDiagnosticEvent } from "../services/diagnosticsService.js";
import { t } from "../i18n/index.js";
import { __resetRunningHubWorkflowQueueForTest, isRunningHubWorkflowQueueTarget, resolveRunningHubWorkflowQueueConfig, runWithRunningHubWorkflowQueue } from "../../api/runningHubWorkflowQueue.js";
import { buildManifestResultPatch } from "../../api/adapters/ManifestResultRenderer.js";
import { emitGenerationTaskCenterUpdate } from "../modules/generationTaskCenterEvents.js";
import { resolveModelExecution } from "../manifests/index.js";
import { createMissingModelCredentialError, ensureModelGenerationReadiness, getModelGenerationReadiness } from "../services/modelGenerationReadiness.js";
const WORKFLOW_ADAPTER = "workflow";
const MODEL_API_ADAPTER = "modelapi";
const RUNNINGHUB_WORKFLOW_TASK_KIND = "runningHubWorkflow";
const REQUIRED_SPEC_FIELDS = Object.freeze(["sourceNodeId", "trigger", "taskType", "provider", "adapterType", "modelId", "executionId", "payload", "cancellable", "resumable", "resultBuilder"]);
const activeTasks = new Map();
let activeTaskSequence = 0;
const CANCELLED_MESSAGE_ALIASES = Object.freeze(["任务已取消", "Task cancelled"]);
function findActiveTaskContext(_0x3a104d, {
  storeLike = null,
  taskCenterTaskId = ""
} = {}) {
  const _0x2c4268 = String(_0x3a104d || "").trim();
  if (!_0x2c4268) {
    return null;
  }
  const _0x13feb3 = String(taskCenterTaskId || "").trim();
  const _0x31a933 = Array.from(activeTasks.values()).filter(_0x3aa048 => _0x3aa048?.targetNodeId === _0x2c4268 && (!storeLike || _0x3aa048.store === storeLike) && (!_0x13feb3 || _0x3aa048.taskCenterTaskId === _0x13feb3));
  return _0x31a933.find(_0x288c5b => isContextInFlight(_0x288c5b)) || _0x31a933[0] || null;
}
function normalizeCompletionFeedbackOutcome(_0xc7edb7, _0x516607) {
  if (_0xc7edb7.status === "rejected") {
    return {
      ok: false,
      error: String(_0xc7edb7.reason?.message || _0xc7edb7.reason || "Unknown error")
    };
  }
  const _0x284e68 = _0xc7edb7.value && typeof _0xc7edb7.value === "object" ? _0xc7edb7.value : {};
  if (_0x516607 === "notification") {
    return {
      ok: _0x284e68.success !== false,
      shown: _0x284e68.shown === true,
      reason: String(_0x284e68.reason || ""),
      error: String(_0x284e68.error || "")
    };
  }
  return {
    ok: _0x284e68.ok === true,
    native: _0x284e68.native === true,
    skipped: String(_0x284e68.skipped || ""),
    error: String(_0x284e68.error?.message || _0x284e68.error || "")
  };
}
function dispatchGenerationCompletionFeedback(_0x1be933, {
  recovering = false
} = {}) {
  const _0x439e7b = getStateSnapshot(_0x1be933.store).nodes?.[_0x1be933.targetNodeId] || {};
  const _0x2954a5 = Promise.allSettled([playCompletionSound("generation-success"), showGenerationCompleteNotification({
    nodeId: _0x1be933.targetNodeId,
    node: _0x439e7b,
    mediaKind: _0x1be933.spec?.modelManifest?.outputType || _0x1be933.spec?.executionManifest?.kind || _0x1be933.taskType || _0x439e7b?.outputType || _0x439e7b?.type || ""
  })]).then(([_0x4f851b, _0x5b833d]) => {
    const _0x2cd80e = normalizeCompletionFeedbackOutcome(_0x4f851b, "sound");
    const _0x4fdd74 = normalizeCompletionFeedbackOutcome(_0x5b833d, "notification");
    const _0x152f9b = !_0x2cd80e.ok && _0x2cd80e.skipped !== "disabled";
    const _0xc392d4 = !_0x4fdd74.ok;
    return logDiagnosticEvent({
      type: "generation.completion_feedback",
      level: _0x152f9b || _0xc392d4 ? "warn" : "info",
      source: "renderer",
      message: "Generation completion feedback dispatched",
      context: {
        targetNodeId: _0x1be933.targetNodeId,
        taskId: _0x1be933.taskId,
        taskType: _0x1be933.taskType,
        provider: String(_0x1be933.spec?.provider || ""),
        modelId: String(_0x1be933.spec?.modelId || ""),
        recovering: recovering,
        sound: _0x2cd80e,
        notification: _0x4fdd74
      }
    });
  });
  _0x2954a5.catch(() => {});
  return _0x2954a5;
}
function normalizeProjectId(_0x2fb671) {
  return String(_0x2fb671 || "").trim();
}
function resolveTaskProjectId(_0x3e8952 = {}, _0x10c056 = {}) {
  return normalizeProjectId(_0x10c056.projectId || _0x3e8952.projectId || globalThis.window?.currentProjectId || "");
}
function getCancelledMessage() {
  return t("coreUi.generationTask.cancelled");
}
function nowFrom(_0x6fd4c0 = {}) {
  if (typeof _0x6fd4c0.now === "function") {
    return _0x6fd4c0.now();
  } else {
    return Date.now();
  }
}
function getStore(_0x61bc5a = {}) {
  return _0x61bc5a.store || a628_0x491558;
}
function getStateSnapshot(_0x4fa3e7) {
  if (typeof _0x4fa3e7.getStateRaw === "function") {
    return _0x4fa3e7.getStateRaw();
  } else {
    return _0x4fa3e7.getState();
  }
}
function normalizeAdapterType(_0x199dd9) {
  return String(_0x199dd9 || "").trim().toLowerCase();
}
function isWorkflowSpec(_0x510a60 = {}, _0x5b7d57 = {}) {
  const _0xb14846 = normalizeAdapterType(_0x510a60.adapterType || _0x5b7d57.adapterType);
  return _0xb14846 === WORKFLOW_ADAPTER;
}
function isAsyncModelApiSpec(_0x3ddb69 = {}, _0x1d7669 = {}) {
  const _0x24735c = normalizeAdapterType(_0x3ddb69.adapterType || _0x1d7669.adapterType);
  return _0x24735c === MODEL_API_ADAPTER && _0x3ddb69.async === true;
}
function isRunningHubWorkflowQueueSpec(_0xb5de7c = {}) {
  return isRunningHubWorkflowQueueTarget({
    provider: _0xb5de7c.provider,
    adapterType: _0xb5de7c.adapterType,
    payload: {
      ...(_0xb5de7c.payload && typeof _0xb5de7c.payload === "object" ? _0xb5de7c.payload : {}),
      model: _0xb5de7c.modelId,
      provider: _0xb5de7c.provider,
      adapterType: _0xb5de7c.adapterType
    }
  });
}
function assertSpec(_0x7b01b1, {
  requireSubmit = false,
  requireTarget = false
} = {}) {
  if (!_0x7b01b1 || typeof _0x7b01b1 !== "object" || Array.isArray(_0x7b01b1)) {
    throw new Error("[generationTaskRuntime] task spec must be an object");
  }
  const _0x351402 = REQUIRED_SPEC_FIELDS.filter(_0x1569df => {
    if (_0x1569df === "targetNodeId" || _0x1569df === "payload") {
      return false;
    }
    if (_0x1569df === "resultBuilder") {
      return !hasResultNormalizer(_0x7b01b1);
    }
    return _0x7b01b1[_0x1569df] === undefined || _0x7b01b1[_0x1569df] === null || _0x7b01b1[_0x1569df] === "";
  });
  if (_0x7b01b1.payload === undefined) {
    _0x351402.push("payload");
  }
  if (requireTarget && !String(_0x7b01b1.targetNodeId || "").trim()) {
    _0x351402.push("targetNodeId");
  }
  if (requireSubmit && typeof getSubmitFn(_0x7b01b1) !== "function") {
    _0x351402.push("submit");
  }
  if (_0x351402.length) {
    throw new Error("[generationTaskRuntime] missing required task fields: " + _0x351402.join(", "));
  }
}
function getSubmitFn(_0x2a0176) {
  return _0x2a0176.submit || _0x2a0176.adapter?.submit || null;
}
function resolveSpecManifestContext(_0x4a4614 = {}) {
  const _0x224d4e = _0x4a4614.modelManifest && typeof _0x4a4614.modelManifest === "object" ? _0x4a4614.modelManifest : null;
  const _0xa06861 = _0x4a4614.executionManifest && typeof _0x4a4614.executionManifest === "object" ? _0x4a4614.executionManifest : null;
  if (_0x224d4e && _0xa06861) {
    return {
      modelManifest: _0x224d4e,
      executionManifest: _0xa06861
    };
  }
  const _0x289c7f = String(_0x4a4614.modelId || "").trim();
  if (!_0x289c7f) {
    return null;
  }
  const _0x564943 = String(_0x4a4614.provider || "").trim();
  let _0x3d7ac1 = null;
  try {
    _0x3d7ac1 = resolveModelExecution(_0x289c7f, _0x564943 ? {
      providerHint: _0x564943
    } : {}) || resolveModelExecution(_0x289c7f);
  } catch {
    _0x3d7ac1 = null;
  }
  if (!_0x3d7ac1?.modelManifest || !_0x3d7ac1?.executionManifest) {
    return null;
  }
  const _0x559298 = String(_0x4a4614.executionId || "").trim();
  const _0x326b6e = String(_0x3d7ac1.executionManifest.id || "").trim();
  if (_0x559298 && _0x326b6e !== _0x559298) {
    return null;
  }
  return {
    modelManifest: _0x224d4e || _0x3d7ac1.modelManifest,
    executionManifest: _0xa06861 || _0x3d7ac1.executionManifest
  };
}
function hasResultNormalizer(_0x586f57 = {}) {
  return typeof _0x586f57.resultBuilder === "function" || !!resolveSpecManifestContext(_0x586f57);
}
function mergeManifestResultPatch(_0x3fccff, _0x507b8b) {
  if (!_0x507b8b || typeof _0x507b8b !== "object") {
    return _0x3fccff;
  }
  if (!_0x3fccff || typeof _0x3fccff !== "object" || Array.isArray(_0x3fccff)) {
    return _0x507b8b;
  }
  return {
    ..._0x507b8b,
    ..._0x3fccff
  };
}
function getPollFn(_0x3095a9) {
  return _0x3095a9.poll || _0x3095a9.spec?.poll || _0x3095a9.spec?.adapter?.poll || null;
}
function getCancelFn(_0x254d00, _0xf58e9e = {}) {
  return _0xf58e9e.cancel || _0x254d00.cancel || _0x254d00.spec?.cancel || _0x254d00.spec?.adapter?.cancel || null;
}
function extractTaskId(_0x307ceb) {
  const _0x5b2f22 = [_0x307ceb?.taskId, _0x307ceb?.task_id, _0x307ceb?.id, _0x307ceb?.data?.taskId, _0x307ceb?.data?.task_id, _0x307ceb?.data?.id];
  return String(_0x5b2f22.find(_0x29f00d => String(_0x29f00d || "").trim()) || "").trim();
}
function extractSubmittedResult(_0x575ef3) {
  if (!_0x575ef3 || typeof _0x575ef3 !== "object") {
    return _0x575ef3;
  }
  if (Object.prototype.hasOwnProperty.call(_0x575ef3, "result")) {
    return _0x575ef3.result;
  }
  if (Object.prototype.hasOwnProperty.call(_0x575ef3, "output")) {
    return _0x575ef3.output;
  }
  return _0x575ef3;
}
function isPendingResult(_0x132eb7) {
  return !!_0x132eb7 && typeof _0x132eb7 === "object" && _0x132eb7.pending === true;
}
function getPendingMessage(_0xb020fa) {
  return String(_0xb020fa?.message || _0xb020fa?.statusMessage || _0xb020fa?.msg || "").trim();
}
function isMissingTargetNodeError(_0x565b96, _0x405b73) {
  const _0x38f217 = String(_0x565b96?.message || "");
  return _0x38f217.includes("updateNodeData()") && _0x38f217.includes(String(_0x405b73 || ""));
}
function persistResumableTaskState(_0x541b64, _0x33caa6 = {}) {
  if (_0x541b64?.spec?.resumable !== true) {
    return;
  }
  if (typeof _0x541b64.persistTaskState !== "function") {
    return;
  }
  try {
    const _0x1ae446 = _0x541b64.persistTaskState({
      sourceNodeId: _0x541b64.sourceNodeId,
      targetNodeId: _0x541b64.targetNodeId,
      taskId: _0x541b64.taskId,
      spec: _0x541b64.spec,
      patch: _0x33caa6
    });
    _0x1ae446?.catch?.(() => {});
  } catch {}
}
function updateTaskNode(_0x4a3d5f, _0x89cf90, _0x2c64a3, {
  allowMissing = false
} = {}) {
  if (!_0x89cf90 || !_0x2c64a3 || typeof _0x2c64a3 !== "object") {
    return false;
  }
  try {
    _0x4a3d5f.updateNodeData(_0x89cf90, _0x2c64a3);
    return true;
  } catch (_0x3a2dcd) {
    if (allowMissing && isMissingTargetNodeError(_0x3a2dcd, _0x89cf90)) {
      return false;
    }
    throw _0x3a2dcd;
  }
}
function updateContextNode(_0xb4ec45, _0x592c8a, _0x5b4e13, _0x1e50ca = {}) {
  const _0x337129 = updateTaskNode(_0xb4ec45.store, _0x592c8a, _0x5b4e13, _0x1e50ca);
  if (_0x337129) {
    if (_0x592c8a === _0xb4ec45.targetNodeId) {
      persistResumableTaskState(_0xb4ec45, _0x5b4e13);
    }
    if (typeof _0xb4ec45.mirrorTaskState === "function") {
      try {
        const _0x6fccd9 = _0xb4ec45.mirrorTaskState({
          sourceNodeId: _0xb4ec45.sourceNodeId,
          targetNodeId: _0xb4ec45.targetNodeId,
          taskId: _0xb4ec45.taskId,
          taskScopeId: _0xb4ec45.taskScopeId,
          spec: _0xb4ec45.spec,
          patch: _0x5b4e13,
          updatedNodeId: _0x592c8a,
          store: _0xb4ec45.store
        });
        _0x6fccd9?.catch?.(_0x524a3e => {
          console.error("[generationTaskRuntime] Failed to mirror background task state:", _0x524a3e);
        });
      } catch (_0x47a8bd) {
        console.error("[generationTaskRuntime] Failed to mirror background task state:", _0x47a8bd);
      }
    }
  }
  return _0x337129;
}
function updateContextTaskNode(_0x1d6cf4, _0x1e6703, _0x4b4554 = {}) {
  return updateContextNode(_0x1d6cf4, _0x1d6cf4.targetNodeId, _0x1e6703, _0x4b4554);
}
function notifyTaskChange(_0x280cf8, _0x477d22 = {}) {
  if (typeof _0x280cf8?.spec?.onTaskChange === "function") {
    _0x280cf8.spec.onTaskChange({
      sourceNodeId: _0x280cf8.sourceNodeId,
      targetNodeId: _0x280cf8.targetNodeId,
      taskId: _0x280cf8.taskId,
      ..._0x477d22
    });
  }
}
function buildTaskCenterTaskId(_0x82dd23) {
  const _0x42566b = String(_0x82dd23?.targetNodeId || "").trim() || "task";
  const _0x297ebe = Number(_0x82dd23?.startedAt || 0) || Date.now();
  return "generation:" + _0x42566b + ":" + _0x297ebe;
}
function getTaskCenterTaskId(_0x253c74) {
  if (!_0x253c74) {
    return "";
  }
  if (!_0x253c74.taskCenterTaskId) {
    _0x253c74.taskCenterTaskId = buildTaskCenterTaskId(_0x253c74);
  }
  return _0x253c74.taskCenterTaskId;
}
function normalizeTaskCenterStatus(_0x4d5fae) {
  const _0x9d6ecb = String(_0x4d5fae || "").trim().toLowerCase();
  if (_0x9d6ecb === "queued" || _0x9d6ecb === "waiting") {
    return "waiting";
  }
  if (_0x9d6ecb === "running" || _0x9d6ecb === "processing" || _0x9d6ecb === "pending") {
    return "processing";
  }
  if (_0x9d6ecb === "success" || _0x9d6ecb === "complete" || _0x9d6ecb === "completed") {
    return "complete";
  }
  if (_0x9d6ecb === "cancelled" || _0x9d6ecb === "canceled") {
    return "cancelled";
  }
  if (_0x9d6ecb === "failed" || _0x9d6ecb === "error") {
    return "failed";
  }
  return "";
}
function isTaskCenterTerminalStatus(_0x135f7a) {
  return _0x135f7a === "complete" || _0x135f7a === "failed" || _0x135f7a === "cancelled";
}
function resolveTaskCenterProgress(_0x7664a1, _0x495fe6 = {}) {
  if (_0x7664a1 === "waiting" || _0x7664a1 === "cancelled") {
    return 0;
  }
  if (_0x7664a1 === "complete") {
    return 1;
  }
  if (_0x7664a1 === "failed") {
    return 1;
  }
  const _0x292d6a = Number(_0x495fe6.progress);
  if (Number.isFinite(_0x292d6a)) {
    return Math.max(0, Math.min(1, _0x292d6a));
  }
  if (_0x7664a1 === "processing") {
    return 0.05;
  } else {
    return 0;
  }
}
function emitRunningHubWorkflowTaskCenterUpdate(_0x27b7ee, _0x42435d = {}) {
  if (!_0x27b7ee || !isRunningHubWorkflowQueueSpec(_0x27b7ee.spec || {})) {
    return false;
  }
  const _0x3215c6 = normalizeTaskCenterStatus(_0x42435d.status);
  if (!_0x3215c6) {
    return false;
  }
  const _0x4586e4 = Number(_0x27b7ee.startedAt || 0) || 0;
  const _0xb32aa4 = isTaskCenterTerminalStatus(_0x3215c6);
  const _0x2fd9cb = String(_0x42435d.message || "").trim();
  const _0x2caa06 = String(_0x42435d.error || "").trim();
  return emitGenerationTaskCenterUpdate({
    taskId: getTaskCenterTaskId(_0x27b7ee),
    nodeId: _0x27b7ee.targetNodeId,
    kind: RUNNINGHUB_WORKFLOW_TASK_KIND,
    source: "generation",
    status: _0x3215c6,
    progress: resolveTaskCenterProgress(_0x3215c6, _0x42435d),
    message: _0x2fd9cb,
    error: _0x2caa06,
    cancellable: _0xb32aa4 ? false : _0x27b7ee.spec?.cancellable === true,
    result: _0x42435d.result && typeof _0x42435d.result === "object" ? _0x42435d.result : null,
    createdAt: _0x4586e4 || undefined,
    startedAt: _0x4586e4,
    finishedAt: _0xb32aa4 ? Number(_0x42435d.finishedAt || 0) || Date.now() : 0,
    remoteTaskId: String(_0x42435d.remoteTaskId || _0x27b7ee.taskId || "")
  });
}
function isAbortLike(_0x47a8d0) {
  const _0x161829 = String(_0x47a8d0?.message || _0x47a8d0 || "");
  return _0x47a8d0?.name === "AbortError" || _0x161829 === "CANCELLED" || _0x161829 === getCancelledMessage() || CANCELLED_MESSAGE_ALIASES.includes(_0x161829) || _0x161829.toLowerCase().includes("aborted");
}
function parseErrorMessage(_0x45d1ab, _0x1aed45 = {}, _0x1bdb71 = t("coreUi.generationTask.generateFailed")) {
  if (typeof _0x1aed45.parseError === "function") {
    const _0x498569 = _0x1aed45.parseError(_0x45d1ab);
    const _0x1c7fd2 = String(_0x498569 || "").trim();
    if (_0x1c7fd2) {
      return _0x1c7fd2;
    }
  }
  if (typeof _0x45d1ab?.getUserMessage === "function") {
    const _0x3e0ab2 = String(_0x45d1ab.getUserMessage() || "").trim();
    if (_0x3e0ab2) {
      return _0x3e0ab2;
    }
  }
  return String(_0x45d1ab?.message || _0x1bdb71).trim() || _0x1bdb71;
}
function createCancelledError() {
  const _0x22eb07 = new Error(getCancelledMessage());
  _0x22eb07.name = "AbortError";
  return _0x22eb07;
}
function getQueuedMessage() {
  const _0x233526 = String(t("coreUi.generationTask.queued") || "").trim();
  if (_0x233526 && _0x233526 !== "coreUi.generationTask.queued") {
    return _0x233526;
  } else {
    return "Queued";
  }
}
function isCancelledStatus(_0x1ade7c) {
  const _0x1caa90 = String(_0x1ade7c || "").trim().toLowerCase();
  return _0x1caa90 === "cancelled" || _0x1caa90 === "canceled";
}
function isContextCancelled(_0x595c25) {
  if (_0x595c25?.cancelRequested === true) {
    return true;
  }
  const _0x55702f = getStateSnapshot(_0x595c25.store).nodes?.[_0x595c25.targetNodeId];
  return isCancelledStatus(_0x55702f?.jobStatus) || isCancelledStatus(_0x55702f?.rhTaskStatus) || isCancelledStatus(_0x55702f?.asyncTaskStatus);
}
function shouldPauseOnAbort(_0x14f20b = {}, _0x7a9df6 = {}) {
  if (_0x14f20b.pauseOnAbort === true) {
    return true;
  }
  if (_0x14f20b.pauseOnAbort !== "afterTaskId") {
    return false;
  }
  return !!String(_0x7a9df6?.taskId || _0x14f20b.taskId || "").trim();
}
function isContextInFlight(_0x5ddbd5) {
  return !!_0x5ddbd5 && _0x5ddbd5.inFlight === true && !isContextCancelled(_0x5ddbd5);
}
function canAbortContextSignal(_0x1b091a) {
  if (typeof _0x1b091a?.abortController?.abort !== "function") {
    return false;
  }
  return !_0x1b091a.signal || _0x1b091a.signal === _0x1b091a.abortController.signal;
}
function markContextIdle(_0x13bcd3) {
  if (!_0x13bcd3) {
    return;
  }
  _0x13bcd3.inFlight = false;
  _0x13bcd3.resolveSettled?.();
}
function deleteActiveTask(_0x325f4c, _0x4846aa) {
  _0x4846aa?.resolveSettled?.();
  if (_0x4846aa?.runtimeTaskKey) {
    activeTasks.delete(_0x4846aa.runtimeTaskKey);
    return;
  }
  for (const [_0x4fedf6, _0x3df004] of activeTasks.entries()) {
    if (_0x3df004?.targetNodeId === _0x325f4c) {
      activeTasks.delete(_0x4fedf6);
    }
  }
}
function buildAlreadyActiveResult(_0x2a9a32, _0x386cf4, _0x1e40f3) {
  return {
    ok: true,
    status: "running",
    alreadyActive: true,
    targetNodeId: _0x386cf4,
    taskId: String(_0x2a9a32?.taskId || _0x1e40f3 || "").trim()
  };
}
async function cancelRemoteTask(_0x3e975a, {
  taskId: _0x5613af,
  node = null,
  options = {}
} = {}) {
  const _0x577f93 = String(_0x5613af || _0x3e975a?.taskId || "").trim();
  const _0x5787d0 = getCancelFn(_0x3e975a || {
    spec: options.spec
  }, options);
  if (typeof _0x5787d0 !== "function" || !_0x577f93) {
    return;
  }
  return await _0x5787d0({
    taskId: _0x577f93,
    targetNodeId: _0x3e975a?.targetNodeId || options.targetNodeId || "",
    sourceNodeId: _0x3e975a?.sourceNodeId || node?.rhSourceNodeId || "",
    spec: _0x3e975a?.spec || options.spec || {},
    node: node
  });
}
function cancelContextRemoteTaskOnce(_0x3035d1, {
  taskId: _0x1d087b,
  node = null,
  options = {}
} = {}) {
  const _0x4b9a05 = String(_0x1d087b || _0x3035d1?.taskId || "").trim();
  if (!_0x3035d1 || !_0x4b9a05) {
    return Promise.resolve(cancelRemoteTask(_0x3035d1, {
      taskId: _0x4b9a05,
      node: node,
      options: options
    }));
  }
  if (_0x3035d1.remoteCancellationTaskId === _0x4b9a05 && _0x3035d1.remoteCancellationPromise) {
    return _0x3035d1.remoteCancellationPromise;
  }
  _0x3035d1.remoteCancellationTaskId = _0x4b9a05;
  _0x3035d1.remoteCancellationPromise = Promise.resolve(cancelRemoteTask(_0x3035d1, {
    taskId: _0x4b9a05,
    node: node,
    options: options
  }));
  return _0x3035d1.remoteCancellationPromise;
}
async function ensureTargetNode(_0xa8f01a, _0xce0c21, _0x1024a9) {
  const _0x36440b = String(_0xa8f01a.targetNodeId || "").trim();
  if (_0x36440b) {
    return _0x36440b;
  }
  if (typeof _0xa8f01a.createTargetNode !== "function") {
    throw new Error("[generationTaskRuntime] targetNodeId or createTargetNode() is required");
  }
  const _0x3af632 = await _0xa8f01a.createTargetNode({
    spec: _0xa8f01a,
    startedAt: _0x1024a9,
    startPatch: buildGenerationStartPatch({
      startedAt: _0x1024a9
    }),
    protocolPatch: buildGenerationProtocolTransitionPatch({
      type: "start",
      spec: _0xa8f01a,
      startedAt: _0x1024a9
    })
  });
  if (!_0x3af632 || typeof _0x3af632 !== "object") {
    throw new Error("[generationTaskRuntime] createTargetNode() must return a node");
  }
  const _0x83a1bd = String(_0x3af632.id || "").trim();
  if (!_0x83a1bd) {
    throw new Error("[generationTaskRuntime] created target node must include id");
  }
  _0xce0c21.addNode(_0x3af632);
  return _0x83a1bd;
}
function buildContext(_0x28240f, _0x487051, _0x373840, _0x47fcee, _0x52eee6) {
  const _0x49499c = _0x52eee6.abortController || (typeof AbortController === "function" ? new AbortController() : null);
  let _0x440acf = false;
  let _0x4d274d;
  const _0x55eb81 = new Promise(_0x4133e3 => {
    _0x4d274d = _0x4133e3;
  });
  const _0x516af6 = {
    runtimeTaskKey: "generation-task:" + _0x487051 + ":" + _0x47fcee + ":" + ++activeTaskSequence,
    spec: _0x28240f,
    store: _0x373840,
    targetNodeId: _0x487051,
    sourceNodeId: String(_0x28240f.sourceNodeId || ""),
    taskType: String(_0x28240f.taskType || ""),
    projectId: resolveTaskProjectId(_0x28240f, _0x52eee6),
    taskScopeId: String(_0x52eee6.taskScopeId || _0x28240f.taskScopeId || "").trim(),
    background: false,
    mirrorTaskState: null,
    startedAt: _0x47fcee,
    taskId: String(_0x28240f.taskId || ""),
    taskCenterTaskId: "",
    abortController: _0x49499c,
    signal: _0x52eee6.signal || _0x49499c?.signal || null,
    persistTaskState: _0x52eee6.persistTaskState || _0x28240f.persistTaskState || null,
    remoteCancellationTaskId: "",
    remoteCancellationPromise: null,
    cancelRequested: false,
    inFlight: true,
    settledPromise: _0x55eb81,
    resolveSettled() {
      if (_0x440acf) {
        return;
      }
      _0x440acf = true;
      _0x4d274d();
    }
  };
  _0x516af6.getTaskNode = () => getStateSnapshot(_0x516af6.store).nodes?.[_0x516af6.targetNodeId] || null;
  _0x516af6.getNode = _0x2fade5 => getStateSnapshot(_0x516af6.store).nodes?.[String(_0x2fade5 || "").trim()] || null;
  _0x516af6.updateTaskNode = (_0xaf873e, _0x534f03 = {}) => updateContextTaskNode(_0x516af6, _0xaf873e, _0x534f03);
  _0x516af6.updateNode = (_0x1450e6, _0x1cc9ca, _0x42fd15 = {}) => updateContextNode(_0x516af6, String(_0x1450e6 || "").trim(), _0x1cc9ca, _0x42fd15);
  _0x516af6.isBackgroundTask = () => _0x516af6.background === true;
  return _0x516af6;
}
async function pauseTaskContexts(_0x4b2126, _0x2cd74f, _0x161d96 = {}) {
  const _0x518430 = _0x4b2126.filter(_0x1a9cbf => {
    if (_0x1a9cbf?.spec?.resumable !== true) {
      return true;
    }
    if (!String(_0x1a9cbf?.taskId || "").trim()) {
      return true;
    }
    if (!shouldPauseOnAbort(_0x1a9cbf.spec, _0x1a9cbf)) {
      return true;
    }
    return !canAbortContextSignal(_0x1a9cbf);
  }).map(_0x329259 => ({
    targetNodeId: _0x329259.targetNodeId,
    taskId: String(_0x329259.taskId || "").trim(),
    taskType: _0x329259.taskType,
    reason: _0x329259?.spec?.resumable !== true ? "not-resumable" : !String(_0x329259?.taskId || "").trim() ? "missing-task-id" : !shouldPauseOnAbort(_0x329259.spec, _0x329259) ? "pause-not-supported" : "abort-unavailable"
  }));
  if (_0x518430.length > 0) {
    return {
      ok: false,
      projectId: _0x2cd74f,
      activeCount: _0x4b2126.length,
      pausedCount: 0,
      blockers: _0x518430
    };
  }
  if (_0x161d96.dryRun === true) {
    return {
      ok: true,
      projectId: _0x2cd74f,
      activeCount: _0x4b2126.length,
      pausedCount: 0,
      blockers: [],
      pausedTasks: []
    };
  }
  const _0x35a933 = [];
  _0x4b2126.forEach(_0x5f0932 => {
    if (_0x5f0932.abortController.signal?.aborted !== true) {
      _0x5f0932.abortController.abort();
    }
    _0x35a933.push({
      targetNodeId: _0x5f0932.targetNodeId,
      taskId: String(_0x5f0932.taskId || "").trim(),
      taskType: _0x5f0932.taskType
    });
  });
  const _0x385f69 = Math.max(100, Number(_0x161d96.timeoutMs) || 3000);
  if (_0x4b2126.length > 0) {
    let _0x4ad334 = null;
    const _0x11322b = new Promise(_0x505d00 => {
      _0x4ad334 = setTimeout(() => _0x505d00(false), _0x385f69);
      _0x4ad334?.unref?.();
    });
    const _0x1a263e = await Promise.race([Promise.all(_0x4b2126.map(_0x1c6b9d => _0x1c6b9d.settledPromise)).then(() => true), _0x11322b]);
    if (_0x4ad334 !== null) {
      clearTimeout(_0x4ad334);
    }
    if (!_0x1a263e) {
      return {
        ok: false,
        projectId: _0x2cd74f,
        activeCount: _0x4b2126.length,
        pausedCount: _0x35a933.length,
        blockers: _0x35a933.map(_0x31e781 => ({
          ..._0x31e781,
          reason: "pause-timeout"
        })),
        pausedTasks: _0x35a933
      };
    }
    await new Promise(_0x3a69f9 => setTimeout(_0x3a69f9, 0));
  }
  return {
    ok: true,
    projectId: _0x2cd74f,
    activeCount: _0x4b2126.length,
    pausedCount: _0x35a933.length,
    blockers: [],
    pausedTasks: _0x35a933
  };
}
export async function pauseProjectTasks(_0x7b7432, _0x2721b0 = {}) {
  const _0x5e0581 = normalizeProjectId(_0x7b7432);
  const _0x457e03 = Array.from(activeTasks.values()).filter(_0x4a23e3 => isContextInFlight(_0x4a23e3) && normalizeProjectId(_0x4a23e3?.projectId) === _0x5e0581);
  return pauseTaskContexts(_0x457e03, _0x5e0581, _0x2721b0);
}
export async function pauseActiveWorkspaceTasks(_0x181807 = {}) {
  const _0x36e5d8 = Array.from(activeTasks.values()).filter(isContextInFlight);
  return pauseTaskContexts(_0x36e5d8, "active-workspace", _0x181807);
}
export function handoffActiveGenerationTasks({
  sourceStore = a628_0x491558,
  targetStore: _0x5f2d11,
  taskScopeId: _0xb1ff20,
  mirrorTaskState = null
} = {}) {
  const _0x1fdfb1 = String(_0xb1ff20 || "").trim();
  if (!_0x5f2d11 || !_0x1fdfb1) {
    return {
      ok: false,
      movedCount: 0,
      taskScopeId: _0x1fdfb1
    };
  }
  const _0x2d895e = Array.from(activeTasks.values()).filter(_0x2dd2a3 => isContextInFlight(_0x2dd2a3) && _0x2dd2a3.store === sourceStore);
  _0x2d895e.forEach(_0x406bc0 => {
    _0x406bc0.store = _0x5f2d11;
    _0x406bc0.taskScopeId = _0x1fdfb1;
    _0x406bc0.background = true;
    _0x406bc0.mirrorTaskState = typeof mirrorTaskState === "function" ? mirrorTaskState : null;
  });
  return {
    ok: true,
    movedCount: _0x2d895e.length,
    taskScopeId: _0x1fdfb1,
    targetNodeIds: _0x2d895e.map(_0x32450d => _0x32450d.targetNodeId)
  };
}
export function restoreActiveGenerationTasks({
  taskScopeId: _0x4845bd,
  targetStore = a628_0x491558
} = {}) {
  const _0x19d6f1 = String(_0x4845bd || "").trim();
  const _0x517da1 = Array.from(activeTasks.values()).filter(_0x22fab6 => isContextInFlight(_0x22fab6) && String(_0x22fab6.taskScopeId || "").trim() === _0x19d6f1);
  _0x517da1.forEach(_0xfb227b => {
    _0xfb227b.store = targetStore;
    _0xfb227b.background = false;
    _0xfb227b.mirrorTaskState = null;
  });
  return {
    ok: true,
    restoredCount: _0x517da1.length,
    taskScopeId: _0x19d6f1,
    targetNodeIds: _0x517da1.map(_0x82e4c1 => _0x82e4c1.targetNodeId)
  };
}
export function hasActiveGenerationTasksForStore(_0x5df08c) {
  return Array.from(activeTasks.values()).some(_0x3076ab => isContextInFlight(_0x3076ab) && _0x3076ab.store === _0x5df08c);
}
export function hasActiveGenerationTasksForScope(_0x555bd1) {
  const _0x2a203f = String(_0x555bd1 || "").trim();
  if (!_0x2a203f) {
    return false;
  }
  return Array.from(activeTasks.values()).some(_0x1943c5 => isContextInFlight(_0x1943c5) && String(_0x1943c5.taskScopeId || "").trim() === _0x2a203f);
}
export function shouldPreserveGenerationTaskOnUnmount(_0x26bfcf) {
  const _0x559027 = String(_0x26bfcf || "").trim();
  return Array.from(activeTasks.values()).some(_0x4b4337 => _0x4b4337?.targetNodeId === _0x559027 && isContextInFlight(_0x4b4337) && _0x4b4337.background === true);
}
export async function normalizeResult(_0x3aa42c, {
  spec: _0x16771a,
  context: _0x3cd9b6
} = {}) {
  const _0x2d0ccb = resolveSpecManifestContext(_0x16771a);
  const _0x333c26 = _0x2d0ccb ? buildManifestResultPatch(_0x3aa42c, _0x2d0ccb) : {};
  const _0x4b86cd = typeof _0x16771a?.resultBuilder === "function" ? mergeManifestResultPatch(await _0x16771a.resultBuilder(_0x3aa42c, {
    spec: _0x16771a,
    targetNodeId: _0x3cd9b6?.targetNodeId || _0x16771a.targetNodeId,
    sourceNodeId: _0x3cd9b6?.sourceNodeId || _0x16771a.sourceNodeId,
    taskId: _0x3cd9b6?.taskId || _0x16771a.taskId || "",
    startedAt: _0x3cd9b6?.startedAt || _0x16771a.startedAt || 0,
    getNode: _0x3cd9b6?.getNode,
    getTaskNode: _0x3cd9b6?.getTaskNode,
    updateNode: _0x3cd9b6?.updateNode,
    updateTaskNode: _0x3cd9b6?.updateTaskNode,
    isBackgroundTask: _0x3cd9b6?.isBackgroundTask,
    manifestResultPatch: _0x333c26
  }), _0x333c26) : _0x333c26;
  if (!_0x4b86cd || typeof _0x4b86cd !== "object" || Array.isArray(_0x4b86cd) || Object.keys(_0x4b86cd).length === 0) {
    if (_0x16771a?.allowEmptyResult === true) {
      return {};
    }
    throw new Error("Generation completed without output.");
  }
  return _0x4b86cd;
}
async function buildOptionalTaskPatch(_0x25fb7e, _0x244fa8) {
  if (typeof _0x25fb7e !== "function") {
    return {};
  }
  const _0x2ac330 = await _0x25fb7e(..._0x244fa8);
  if (_0x2ac330 && typeof _0x2ac330 === "object") {
    return _0x2ac330;
  } else {
    return {};
  }
}
async function buildStartExtraPatch(_0x4f0a77, _0x583775) {
  if (typeof _0x4f0a77?.startBuilder === "function") {
    const _0x2ac548 = await _0x4f0a77.startBuilder(_0x583775);
    if (_0x2ac548 && typeof _0x2ac548 === "object") {
      return _0x2ac548;
    } else {
      return {};
    }
  }
  if (_0x4f0a77?.startPatch && typeof _0x4f0a77.startPatch === "object" && !Array.isArray(_0x4f0a77.startPatch)) {
    return {
      ..._0x4f0a77.startPatch
    };
  }
  return {};
}
export async function pollTask(_0x2991b1, _0x56680b = {}) {
  const _0x57cef9 = getPollFn(_0x2991b1);
  if (typeof _0x57cef9 !== "function") {
    throw new Error("[generationTaskRuntime] poll function is required");
  }
  return _0x57cef9({
    taskId: String(_0x2991b1.taskId || _0x2991b1.spec?.taskId || ""),
    targetNodeId: _0x2991b1.targetNodeId || _0x2991b1.spec?.targetNodeId,
    sourceNodeId: _0x2991b1.sourceNodeId || _0x2991b1.spec?.sourceNodeId,
    taskType: _0x2991b1.taskType || _0x2991b1.spec?.taskType,
    payload: _0x2991b1.payload || _0x2991b1.spec?.payload,
    spec: _0x2991b1.spec || _0x2991b1,
    signal: _0x56680b.signal || _0x2991b1.signal || _0x2991b1.abortController?.signal || null,
    runningHubWorkflowQueueLease: _0x56680b.runningHubWorkflowQueueLease || _0x2991b1.runningHubWorkflowQueueLease || _0x2991b1.spec?.runningHubWorkflowQueueLease || null
  });
}
export async function submitTask(_0x3f5ed0, _0xd78aec = {}) {
  assertSpec(_0x3f5ed0, {
    requireSubmit: true
  });
  const _0x5d1d7b = {
    modelId: _0x3f5ed0.modelId,
    provider: _0x3f5ed0.provider,
    providerProfileId: _0x3f5ed0.providerProfileId || _0x3f5ed0.payload?.providerProfileId || _0x3f5ed0.payload?.rhProviderProfileId,
    adapterType: _0x3f5ed0.adapterType,
    modelManifest: _0x3f5ed0.modelManifest,
    executionManifest: _0x3f5ed0.executionManifest,
    payload: _0x3f5ed0.payload
  };
  let _0xd91242 = getModelGenerationReadiness(_0x5d1d7b);
  if (_0xd91242.status === "unverified") {
    _0xd91242 = await ensureModelGenerationReadiness({
      ..._0x5d1d7b,
      autoVerify: true
    });
  }
  if (!_0xd91242.ready && _0xd91242.reason !== "cli-status-loading") {
    return {
      ok: false,
      status: "failed",
      blocked: true,
      reason: _0xd91242.reason,
      targetNodeId: String(_0x3f5ed0.targetNodeId || ""),
      taskId: "",
      readiness: _0xd91242,
      error: createMissingModelCredentialError(_0xd91242)
    };
  }
  const _0x1280ca = getStore(_0xd78aec);
  const _0x55ede2 = Number(_0x3f5ed0.startedAt || _0xd78aec.startedAt || nowFrom(_0xd78aec));
  const _0x2c0282 = String(_0x3f5ed0.targetNodeId || "").trim();
  const _0x208b67 = _0x2c0282 || (await ensureTargetNode(_0x3f5ed0, _0x1280ca, _0x55ede2));
  const _0xa36c87 = {
    ..._0x3f5ed0,
    targetNodeId: _0x208b67
  };
  const _0x19ca7e = buildContext(_0xa36c87, _0x208b67, _0x1280ca, _0x55ede2, _0xd78aec);
  activeTasks.set(_0x19ca7e.runtimeTaskKey, _0x19ca7e);
  const _0x136668 = await buildStartExtraPatch(_0xa36c87, _0x19ca7e);
  updateContextTaskNode(_0x19ca7e, {
    ...buildGenerationStartPatch({
      startedAt: _0x55ede2
    }),
    ...buildGenerationProtocolTransitionPatch({
      type: "start",
      spec: _0xa36c87,
      startedAt: _0x55ede2
    }),
    ..._0x136668
  });
  if (typeof _0xa36c87.onTaskStart === "function") {
    _0xa36c87.onTaskStart(_0x19ca7e);
  }
  notifyTaskChange(_0x19ca7e, {
    status: "running"
  });
  emitRunningHubWorkflowTaskCenterUpdate(_0x19ca7e, {
    status: "processing",
    progress: 0.02
  });
  const _0x5dd1c7 = (_0x115396 = {}) => {
    if (!isRunningHubWorkflowQueueSpec(_0xa36c87)) {
      return;
    }
    const _0x461bfb = String(_0x115396?.status || "").trim().toLowerCase();
    if (_0x461bfb === "queued") {
      const _0x5bcad4 = Number(_0x115396?.queueIndex ?? -1);
      const _0xdc276a = Number(_0x115396?.queueLength ?? 0);
      const _0x3f10a4 = _0x19ca7e.getTaskNode?.() || {};
      if (_0x3f10a4.generationQueueStatus === "queued" && Number(_0x3f10a4.generationQueueIndex ?? -1) === _0x5bcad4 && Number(_0x3f10a4.generationQueueLength ?? 0) === _0xdc276a && _0x3f10a4.rhStatusMessage === getQueuedMessage()) {
        return;
      }
      updateContextTaskNode(_0x19ca7e, {
        ...buildGenerationProtocolTransitionPatch({
          type: "pending",
          spec: _0xa36c87,
          context: _0x19ca7e,
          message: getQueuedMessage()
        }),
        generationQueueStatus: "queued",
        generationQueueIndex: _0x5bcad4,
        generationQueueLength: _0xdc276a
      });
      notifyTaskChange(_0x19ca7e, {
        status: "queued"
      });
      emitRunningHubWorkflowTaskCenterUpdate(_0x19ca7e, {
        status: "waiting",
        progress: 0,
        message: getQueuedMessage()
      });
      return;
    }
    if (_0x461bfb === "running") {
      const _0x27bddd = Number(_0x115396?.queueLength ?? 0);
      const _0x58a5fb = _0x19ca7e.getTaskNode?.() || {};
      if (_0x58a5fb.generationQueueStatus === "running" && Number(_0x58a5fb.generationQueueIndex ?? -1) === -1 && Number(_0x58a5fb.generationQueueLength ?? 0) === _0x27bddd && !_0x58a5fb.statusMessage && _0x58a5fb.rhStatusMessage == null) {
        return;
      }
      updateContextTaskNode(_0x19ca7e, {
        generationQueueStatus: "running",
        generationQueueIndex: -1,
        generationQueueLength: _0x27bddd,
        statusMessage: "",
        rhStatusMessage: null
      });
      notifyTaskChange(_0x19ca7e, {
        status: "running"
      });
      emitRunningHubWorkflowTaskCenterUpdate(_0x19ca7e, {
        status: "processing",
        progress: 0.05
      });
    }
  };
  const _0x48e82d = async (_0x3207cc = null) => {
    _0x19ca7e.runningHubWorkflowQueueLease = _0x3207cc || null;
    const _0x4ded28 = getSubmitFn(_0xa36c87);
    const _0x22a980 = await _0x4ded28(_0xa36c87.payload, {
      spec: _0xa36c87,
      targetNodeId: _0x208b67,
      sourceNodeId: _0x19ca7e.sourceNodeId,
      taskType: _0x19ca7e.taskType,
      signal: _0x19ca7e.signal,
      getNode: _0x19ca7e.getNode,
      getTaskNode: _0x19ca7e.getTaskNode,
      updateNode: _0x19ca7e.updateNode,
      updateTaskNode: _0x19ca7e.updateTaskNode,
      isBackgroundTask: _0x19ca7e.isBackgroundTask,
      runningHubWorkflowQueueLease: _0x19ca7e.runningHubWorkflowQueueLease,
      onRunningHubWorkflowQueueChange: _0x5dd1c7,
      onTaskId: _0x38ecd2 => {
        const _0x291be7 = String(_0x38ecd2 || "").trim();
        if (!_0x291be7) {
          return;
        }
        _0x19ca7e.taskId = _0x291be7;
        if (isContextCancelled(_0x19ca7e)) {
          cancelContextRemoteTaskOnce(_0x19ca7e, {
            taskId: _0x291be7,
            node: _0x19ca7e.getTaskNode?.()
          }).catch(() => {});
          return;
        }
        updateContextTaskNode(_0x19ca7e, buildGenerationProtocolTransitionPatch({
          type: "taskId",
          spec: _0xa36c87,
          taskId: _0x291be7,
          startedAt: _0x55ede2
        }));
        notifyTaskChange(_0x19ca7e, {
          status: "running"
        });
        emitRunningHubWorkflowTaskCenterUpdate(_0x19ca7e, {
          status: "processing",
          progress: 0.12,
          remoteTaskId: _0x291be7
        });
      }
    });
    const _0x2cddab = extractTaskId(_0x22a980);
    if (_0x2cddab) {
      _0x19ca7e.taskId = _0x2cddab;
    }
    if (isContextCancelled(_0x19ca7e)) {
      try {
        await cancelContextRemoteTaskOnce(_0x19ca7e, {
          taskId: _0x19ca7e.taskId,
          node: _0x19ca7e.getTaskNode?.()
        });
      } catch {}
      throw createCancelledError();
    }
    if (_0x2cddab) {
      updateContextTaskNode(_0x19ca7e, buildGenerationProtocolTransitionPatch({
        type: "taskId",
        spec: _0xa36c87,
        taskId: _0x2cddab,
        startedAt: _0x55ede2
      }));
      notifyTaskChange(_0x19ca7e, {
        status: "running"
      });
      emitRunningHubWorkflowTaskCenterUpdate(_0x19ca7e, {
        status: "processing",
        progress: 0.12,
        remoteTaskId: _0x2cddab
      });
    }
    if (_0xa36c87.waitForResult === false) {
      markContextIdle(_0x19ca7e);
      emitRunningHubWorkflowTaskCenterUpdate(_0x19ca7e, {
        status: "processing",
        progress: 0.15,
        remoteTaskId: _0x19ca7e.taskId
      });
      return {
        ok: true,
        status: "submitted",
        targetNodeId: _0x208b67,
        taskId: _0x19ca7e.taskId
      };
    }
    const _0x299725 = _0x19ca7e.taskId && getPollFn({
      spec: _0xa36c87
    }) ? await pollTask({
      ..._0x19ca7e,
      spec: _0xa36c87
    }, {
      signal: _0x19ca7e.signal,
      runningHubWorkflowQueueLease: _0x19ca7e.runningHubWorkflowQueueLease
    }) : extractSubmittedResult(_0x22a980);
    if (isContextCancelled(_0x19ca7e)) {
      throw createCancelledError();
    }
    if (isPendingResult(_0x299725)) {
      const _0x330db0 = getPendingMessage(_0x299725);
      markContextIdle(_0x19ca7e);
      updateContextTaskNode(_0x19ca7e, buildGenerationProtocolTransitionPatch({
        type: "pending",
        spec: _0xa36c87,
        context: _0x19ca7e,
        message: _0x330db0
      }));
      notifyTaskChange(_0x19ca7e, {
        status: "pending"
      });
      emitRunningHubWorkflowTaskCenterUpdate(_0x19ca7e, {
        status: "processing",
        progress: 0.15,
        message: _0x330db0,
        remoteTaskId: _0x19ca7e.taskId
      });
      return {
        ok: true,
        status: "pending",
        pending: true,
        targetNodeId: _0x208b67,
        taskId: _0x19ca7e.taskId,
        result: _0x299725
      };
    }
    const _0x1adc1b = await normalizeResult(_0x299725, {
      spec: _0xa36c87,
      context: _0x19ca7e
    });
    if (isContextCancelled(_0x19ca7e)) {
      throw createCancelledError();
    }
    const _0x263374 = nowFrom(_0xd78aec) - _0x55ede2;
    updateContextTaskNode(_0x19ca7e, {
      ...buildGenerationSuccessPatch({
        startedAt: _0x55ede2,
        duration: _0x263374
      }),
      ..._0x1adc1b,
      ...buildGenerationProtocolTransitionPatch({
        type: "terminal",
        spec: _0xa36c87,
        status: "success"
      })
    });
    deleteActiveTask(_0x208b67, _0x19ca7e);
    notifyTaskChange(_0x19ca7e, {
      status: "success"
    });
    emitRunningHubWorkflowTaskCenterUpdate(_0x19ca7e, {
      status: "complete",
      progress: 1,
      result: _0x1adc1b,
      remoteTaskId: _0x19ca7e.taskId
    });
    if (_0xa36c87.completionFeedback !== false) {
      dispatchGenerationCompletionFeedback(_0x19ca7e);
    }
    return {
      ok: true,
      status: "success",
      targetNodeId: _0x208b67,
      taskId: _0x19ca7e.taskId,
      result: _0x299725
    };
  };
  try {
    if (isRunningHubWorkflowQueueSpec(_0xa36c87)) {
      const _0x4698d8 = resolveRunningHubWorkflowQueueConfig({
        payload: _0xa36c87.payload,
        concurrency: _0xd78aec.runningHubWorkflowConcurrency
      });
      return await runWithRunningHubWorkflowQueue({
        ..._0x4698d8,
        signal: _0x19ca7e.signal,
        lease: _0xd78aec.runningHubWorkflowQueueLease,
        onQueueChange: _0x5dd1c7,
        autoProbeConcurrency: _0xd78aec.autoProbeConcurrency,
        concurrencyProbe: _0xd78aec.runningHubWorkflowConcurrencyProbe,
        queuePollIntervalMs: _0xd78aec.runningHubWorkflowQueuePollIntervalMs
      }, _0x48e82d);
    }
    return await _0x48e82d(_0xd78aec.runningHubWorkflowQueueLease || null);
  } catch (_0x3b718f) {
    try {
      if (_0x19ca7e.remoteCancellationPromise) {
        await _0x19ca7e.remoteCancellationPromise.catch(() => {});
      }
      const _0x127a49 = nowFrom(_0xd78aec) - _0x55ede2;
      const _0x3f9cd0 = isAbortLike(_0x3b718f);
      const _0x4ca53c = _0x19ca7e.getTaskNode?.() || {};
      if (_0x3f9cd0 && (isCancelledStatus(_0x4ca53c?.jobStatus) || isCancelledStatus(_0x4ca53c?.rhTaskStatus) || isCancelledStatus(_0x4ca53c?.asyncTaskStatus))) {
        notifyTaskChange(_0x19ca7e, {
          status: "cancelled"
        });
        emitRunningHubWorkflowTaskCenterUpdate(_0x19ca7e, {
          status: "cancelled",
          message: getCancelledMessage(),
          remoteTaskId: _0x19ca7e.taskId
        });
        return {
          ok: false,
          status: "cancelled",
          targetNodeId: _0x208b67,
          taskId: _0x19ca7e.taskId,
          error: _0x3b718f
        };
      }
      if (_0x3f9cd0 && shouldPauseOnAbort(_0xa36c87, _0x19ca7e)) {
        const _0x21cfdb = await buildOptionalTaskPatch(_0xa36c87.pauseBuilder, [_0x19ca7e]);
        updateContextTaskNode(_0x19ca7e, {
          ...buildGenerationProtocolTransitionPatch({
            type: "pending",
            spec: _0xa36c87,
            context: _0x19ca7e
          }),
          ..._0x21cfdb
        }, {
          allowMissing: true
        });
        notifyTaskChange(_0x19ca7e, {
          status: "paused"
        });
        emitRunningHubWorkflowTaskCenterUpdate(_0x19ca7e, {
          status: "processing",
          progress: 0.15,
          remoteTaskId: _0x19ca7e.taskId
        });
        return {
          ok: false,
          status: "paused",
          targetNodeId: _0x208b67,
          taskId: _0x19ca7e.taskId,
          error: _0x3b718f
        };
      }
      const _0x2ee783 = _0x3f9cd0 ? "" : parseErrorMessage(_0x3b718f, _0xa36c87, t("coreUi.generationTask.generateFailed"));
      const _0x52bc0e = _0x3f9cd0 ? buildGenerationCancelledPatch({
        startedAt: _0x55ede2,
        duration: _0x127a49
      }) : buildGenerationFailurePatch({
        error: _0x2ee783,
        startedAt: _0x55ede2,
        duration: _0x127a49
      });
      const _0x5a1cae = await buildOptionalTaskPatch(_0x3f9cd0 ? _0xa36c87.cancelledBuilder : _0xa36c87.failureBuilder, _0x3f9cd0 ? [_0x19ca7e] : [_0x3b718f, _0x19ca7e]);
      updateContextTaskNode(_0x19ca7e, {
        ..._0x52bc0e,
        ..._0x5a1cae,
        ...buildGenerationProtocolTransitionPatch({
          type: "terminal",
          spec: _0xa36c87,
          status: _0x3f9cd0 ? "cancelled" : "failed"
        })
      });
      notifyTaskChange(_0x19ca7e, {
        status: _0x3f9cd0 ? "cancelled" : "failed"
      });
      emitRunningHubWorkflowTaskCenterUpdate(_0x19ca7e, {
        status: _0x3f9cd0 ? "cancelled" : "failed",
        message: _0x3f9cd0 ? getCancelledMessage() : "",
        error: _0x2ee783,
        remoteTaskId: _0x19ca7e.taskId
      });
      return {
        ok: false,
        status: _0x3f9cd0 ? "cancelled" : "failed",
        targetNodeId: _0x208b67,
        taskId: _0x19ca7e.taskId,
        error: _0x3b718f
      };
    } finally {
      deleteActiveTask(_0x208b67, _0x19ca7e);
    }
  }
}
export async function cancelTask(_0xb83b5f, _0x27e5c5 = {}) {
  const _0x542796 = getStore(_0x27e5c5);
  const _0x189648 = String(typeof _0xb83b5f === "object" ? _0xb83b5f?.targetNodeId || _0xb83b5f?.outId || _0xb83b5f?.id : _0xb83b5f || "").trim();
  if (!_0x189648) {
    return {
      ok: false,
      reason: "missing-target"
    };
  }
  const _0x4002ac = String(_0x27e5c5.taskCenterTaskId || (typeof _0xb83b5f === "object" ? _0xb83b5f?.taskCenterTaskId : "") || "").trim();
  const _0xb51dfc = _0x4002ac ? findActiveTaskContext(_0x189648, {
    taskCenterTaskId: _0x4002ac
  }) : findActiveTaskContext(_0x189648, {
    storeLike: _0x542796
  });
  const _0x4a3335 = _0xb51dfc?.store || _0x542796;
  const _0x195c21 = getStateSnapshot(_0x4a3335).nodes?.[_0x189648] || {};
  const _0xc774c1 = _0xb51dfc?.spec || _0x27e5c5.spec || {
    adapterType: _0x195c21.adapterType,
    provider: _0x195c21.provider,
    async: !!_0x195c21.asyncTaskId
  };
  const _0x57dfbe = _0x27e5c5.cancellable === true || _0xb51dfc?.spec?.cancellable === true;
  if (!_0x57dfbe) {
    if (_0x27e5c5.abortLocal === true) {
      if (_0xb51dfc) {
        _0xb51dfc.cancelRequested = true;
      }
      _0xb51dfc?.abortController?.abort?.();
    }
    return {
      ok: false,
      reason: "not-cancellable",
      targetNodeId: _0x189648
    };
  }
  const _0x22c064 = String(_0x27e5c5.taskId || _0xb51dfc?.taskId || _0xb83b5f?.taskId || _0x195c21.rhTaskId || _0x195c21.asyncTaskId || "");
  const _0x1d5ede = getCancelFn(_0xb51dfc || {
    spec: _0xc774c1
  }, _0x27e5c5);
  let _0x9e9442 = null;
  let _0x32dfc2 = null;
  try {
    if (_0xb51dfc) {
      _0xb51dfc.cancelRequested = true;
    }
    _0xb51dfc?.abortController?.abort?.();
  } catch {}
  if (typeof _0x1d5ede === "function" && _0x22c064) {
    try {
      _0x9e9442 = _0xb51dfc ? await cancelContextRemoteTaskOnce(_0xb51dfc, {
        taskId: _0x22c064,
        node: _0x195c21,
        options: {
          ..._0x27e5c5,
          cancel: _0x1d5ede,
          spec: _0xc774c1,
          targetNodeId: _0x189648
        }
      }) : await cancelRemoteTask({
        spec: _0xc774c1,
        targetNodeId: _0x189648
      }, {
        taskId: _0x22c064,
        node: _0x195c21,
        options: {
          ..._0x27e5c5,
          cancel: _0x1d5ede,
          spec: _0xc774c1,
          targetNodeId: _0x189648
        }
      });
    } catch (_0x3611ab) {
      _0x32dfc2 = _0x3611ab;
    }
  }
  const _0x1aa598 = Number(_0x195c21.generationStartTime || _0x195c21.rhTaskStartedAt || 0) || 0;
  const _0x1ddc34 = await buildOptionalTaskPatch(_0x27e5c5.cancelledBuilder || _0xc774c1.cancelledBuilder, [{
    spec: _0xc774c1,
    store: _0x4a3335,
    targetNodeId: _0x189648,
    startedAt: _0x1aa598,
    taskId: _0x22c064,
    remoteResult: _0x9e9442,
    remoteError: _0x32dfc2
  }]);
  const _0x1b3b09 = _0xb51dfc || {
    spec: _0xc774c1,
    store: _0x4a3335,
    targetNodeId: _0x189648,
    sourceNodeId: String(_0xc774c1.sourceNodeId || _0x195c21.rhSourceNodeId || ""),
    taskId: _0x22c064,
    persistTaskState: _0x27e5c5.persistTaskState || _0xc774c1.persistTaskState || null
  };
  updateContextTaskNode(_0x1b3b09, {
    ...buildGenerationCancelledPatch({
      startedAt: _0x1aa598
    }),
    ..._0x1ddc34,
    ...buildGenerationProtocolTransitionPatch({
      type: "terminal",
      spec: _0xc774c1,
      status: "cancelled"
    })
  });
  deleteActiveTask(_0x189648, _0xb51dfc);
  notifyTaskChange(_0xb51dfc, {
    status: "cancelled"
  });
  emitRunningHubWorkflowTaskCenterUpdate(_0xb51dfc, {
    status: "cancelled",
    message: getCancelledMessage(),
    remoteTaskId: _0x22c064
  });
  return {
    ok: true,
    status: "cancelled",
    targetNodeId: _0x189648,
    taskId: _0x22c064
  };
}
export async function resumeTask(_0x5ae9db, _0x156ef9 = {}) {
  assertSpec(_0x5ae9db, {
    requireTarget: true
  });
  const _0x1380a8 = getStore(_0x156ef9);
  const _0x5c27cd = String(_0x5ae9db.targetNodeId || "").trim();
  const _0x315ed1 = getStateSnapshot(_0x1380a8).nodes?.[_0x5c27cd] || {};
  const _0x369906 = Number(_0x5ae9db.startedAt || _0x315ed1.generationStartTime || _0x315ed1.rhTaskStartedAt || nowFrom(_0x156ef9)) || nowFrom(_0x156ef9);
  const _0x52cf98 = String(_0x5ae9db.taskId || _0x315ed1.rhTaskId || _0x315ed1.asyncTaskId || "").trim();
  if (!_0x52cf98) {
    throw new Error("[generationTaskRuntime] resumeTask requires taskId");
  }
  const _0x4c72e3 = findActiveTaskContext(_0x5c27cd, {
    storeLike: _0x1380a8
  });
  if (isContextInFlight(_0x4c72e3)) {
    return buildAlreadyActiveResult(_0x4c72e3, _0x5c27cd, _0x52cf98);
  }
  const _0x4aac16 = {
    ..._0x5ae9db,
    targetNodeId: _0x5c27cd,
    taskId: _0x52cf98
  };
  const _0x5a7215 = buildContext(_0x4aac16, _0x5c27cd, _0x1380a8, _0x369906, _0x156ef9);
  _0x5a7215.taskId = _0x52cf98;
  activeTasks.set(_0x5a7215.runtimeTaskKey, _0x5a7215);
  const _0x315bdb = await buildStartExtraPatch(_0x4aac16, _0x5a7215);
  updateContextTaskNode(_0x5a7215, {
    ...buildGenerationStartPatch({
      startedAt: _0x369906
    }),
    ...buildGenerationProtocolTransitionPatch({
      type: "start",
      spec: _0x4aac16,
      startedAt: _0x369906
    }),
    ...buildGenerationProtocolTransitionPatch({
      type: "taskId",
      spec: _0x4aac16,
      taskId: _0x52cf98,
      startedAt: _0x369906
    }),
    ..._0x315bdb,
    ...(isWorkflowSpec(_0x4aac16) ? {
      rhTaskRecovering: true
    } : {}),
    ...(isAsyncModelApiSpec(_0x4aac16) ? {
      asyncTaskRecovering: true
    } : {})
  });
  if (typeof _0x4aac16.onTaskStart === "function") {
    _0x4aac16.onTaskStart(_0x5a7215);
  }
  notifyTaskChange(_0x5a7215, {
    status: "running",
    recovering: true
  });
  try {
    const _0x3211f6 = await pollTask({
      ..._0x5a7215,
      spec: _0x4aac16
    }, {
      signal: _0x5a7215.signal
    });
    if (isContextCancelled(_0x5a7215)) {
      throw createCancelledError();
    }
    if (isPendingResult(_0x3211f6)) {
      const _0x5e92ee = getPendingMessage(_0x3211f6);
      markContextIdle(_0x5a7215);
      updateContextTaskNode(_0x5a7215, buildGenerationProtocolTransitionPatch({
        type: "pending",
        spec: _0x4aac16,
        context: _0x5a7215,
        message: _0x5e92ee
      }));
      notifyTaskChange(_0x5a7215, {
        status: "pending",
        recovering: true
      });
      return {
        ok: true,
        status: "pending",
        pending: true,
        targetNodeId: _0x5c27cd,
        taskId: _0x52cf98,
        result: _0x3211f6
      };
    }
    const _0x554c47 = await normalizeResult(_0x3211f6, {
      spec: _0x4aac16,
      context: _0x5a7215
    });
    if (isContextCancelled(_0x5a7215)) {
      throw createCancelledError();
    }
    const _0x7a8c96 = nowFrom(_0x156ef9) - _0x369906;
    updateContextTaskNode(_0x5a7215, {
      ...buildGenerationSuccessPatch({
        startedAt: _0x369906,
        duration: _0x7a8c96
      }),
      ..._0x554c47,
      ...buildGenerationProtocolTransitionPatch({
        type: "terminal",
        spec: _0x4aac16,
        status: "success"
      })
    });
    deleteActiveTask(_0x5c27cd, _0x5a7215);
    notifyTaskChange(_0x5a7215, {
      status: "success",
      recovering: false
    });
    if (_0x4aac16.completionFeedback !== false) {
      dispatchGenerationCompletionFeedback(_0x5a7215, {
        recovering: true
      });
    }
    return {
      ok: true,
      status: "success",
      targetNodeId: _0x5c27cd,
      taskId: _0x52cf98,
      result: _0x3211f6
    };
  } catch (_0x4ac6d2) {
    try {
      const _0x1da532 = nowFrom(_0x156ef9) - _0x369906;
      const _0x2a6fc1 = isAbortLike(_0x4ac6d2);
      const _0x4e65c7 = _0x5a7215.getTaskNode?.() || {};
      if (_0x2a6fc1 && (isCancelledStatus(_0x4e65c7?.jobStatus) || isCancelledStatus(_0x4e65c7?.rhTaskStatus) || isCancelledStatus(_0x4e65c7?.asyncTaskStatus))) {
        notifyTaskChange(_0x5a7215, {
          status: "cancelled",
          recovering: false
        });
        return {
          ok: false,
          status: "cancelled",
          targetNodeId: _0x5c27cd,
          taskId: _0x52cf98,
          error: _0x4ac6d2
        };
      }
      if (_0x2a6fc1 && shouldPauseOnAbort(_0x4aac16, _0x5a7215)) {
        const _0x1cfc42 = await buildOptionalTaskPatch(_0x4aac16.pauseBuilder, [_0x5a7215]);
        updateContextTaskNode(_0x5a7215, {
          ...buildGenerationProtocolTransitionPatch({
            type: "pending",
            spec: _0x4aac16,
            context: _0x5a7215
          }),
          ..._0x1cfc42
        }, {
          allowMissing: true
        });
        notifyTaskChange(_0x5a7215, {
          status: "paused",
          recovering: false
        });
        return {
          ok: false,
          status: "paused",
          targetNodeId: _0x5c27cd,
          taskId: _0x52cf98,
          error: _0x4ac6d2
        };
      }
      const _0x12043 = _0x2a6fc1 ? buildGenerationCancelledPatch({
        startedAt: _0x369906,
        duration: _0x1da532
      }) : buildGenerationFailurePatch({
        error: parseErrorMessage(_0x4ac6d2, _0x4aac16, t("coreUi.generationTask.resumeFailed")),
        startedAt: _0x369906,
        duration: _0x1da532
      });
      const _0x1a39ca = await buildOptionalTaskPatch(_0x2a6fc1 ? _0x4aac16.cancelledBuilder : _0x4aac16.failureBuilder, _0x2a6fc1 ? [_0x5a7215] : [_0x4ac6d2, _0x5a7215]);
      updateContextTaskNode(_0x5a7215, {
        ..._0x12043,
        ..._0x1a39ca,
        ...buildGenerationProtocolTransitionPatch({
          type: "terminal",
          spec: _0x4aac16,
          status: _0x2a6fc1 ? "cancelled" : "failed"
        })
      });
      notifyTaskChange(_0x5a7215, {
        status: _0x2a6fc1 ? "cancelled" : "failed",
        recovering: false
      });
      return {
        ok: false,
        status: _0x2a6fc1 ? "cancelled" : "failed",
        targetNodeId: _0x5c27cd,
        taskId: _0x52cf98,
        error: _0x4ac6d2
      };
    } finally {
      deleteActiveTask(_0x5c27cd, _0x5a7215);
    }
  }
}
export function getActiveGenerationTask(_0x3c9217) {
  const _0x23a36b = String(_0x3c9217 || "").trim();
  const _0x80ca3f = Array.from(activeTasks.values()).filter(_0x26225c => _0x26225c?.targetNodeId === _0x23a36b);
  return _0x80ca3f.find(_0x5750d4 => isContextInFlight(_0x5750d4) && _0x5750d4.background !== true) || _0x80ca3f.find(_0x16a1a5 => isContextInFlight(_0x16a1a5)) || _0x80ca3f[0] || null;
}
export function __resetGenerationTaskRuntimeForTest() {
  activeTasks.forEach(_0x128834 => _0x128834?.resolveSettled?.());
  activeTasks.clear();
  activeTaskSequence = 0;
  __resetRunningHubWorkflowQueueForTest();
}