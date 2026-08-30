import { t } from "../i18n/index.js";
const TASK_TERMINAL_STATUS = new Set(["success", "succeeded", "completed", "complete", "done", "finished", "finish", "failed", "fail", "error", "cancelled", "canceled", "idle"]);
const TASK_FAILURE_STATUS = new Set(["failed", "fail", "error"]);
const TASK_CANCELLED_STATUS = new Set(["cancelled", "canceled"]);
function normalizeStatus(_0x176c0c) {
  return String(_0x176c0c || "").trim().toLowerCase();
}
function buildGenerationDurationPatch({
  startedAt = 0,
  duration = null
} = {}) {
  const _0x3d3bd7 = Number(duration);
  if (duration !== null && duration !== undefined && Number.isFinite(_0x3d3bd7) && _0x3d3bd7 >= 0) {
    return {
      generationDuration: _0x3d3bd7
    };
  }
  const _0x12ea0f = Number(startedAt);
  if (Number.isFinite(_0x12ea0f) && _0x12ea0f > 0) {
    return {
      generationDuration: Math.max(0, Date.now() - _0x12ea0f)
    };
  }
  return {};
}
export function isGenerationTaskTerminalStatus(_0x827ef8) {
  return TASK_TERMINAL_STATUS.has(normalizeStatus(_0x827ef8));
}
export function isGenerationTaskFailureStatus(_0xbd1bd4) {
  return TASK_FAILURE_STATUS.has(normalizeStatus(_0xbd1bd4));
}
export function isGenerationTaskCancelledStatus(_0x365bb9) {
  return TASK_CANCELLED_STATUS.has(normalizeStatus(_0x365bb9));
}
export function resolveJobStatusFromTaskStatus(_0x285ca5, _0x269aa9 = null) {
  const _0x344100 = normalizeStatus(_0x285ca5);
  if (TASK_FAILURE_STATUS.has(_0x344100)) {
    return "error";
  }
  if (TASK_CANCELLED_STATUS.has(_0x344100)) {
    return "cancelled";
  }
  if (_0x344100 === "success" || _0x344100 === "succeeded" || _0x344100 === "completed" || _0x344100 === "complete" || _0x344100 === "done" || _0x344100 === "finished" || _0x344100 === "finish") {
    return "success";
  }
  if (_0x344100 === "idle") {
    return _0x269aa9;
  }
  return _0x269aa9;
}
export function buildGenerationStartPatch({
  startedAt = Date.now()
} = {}) {
  return {
    isGenerating: true,
    jobStatus: "running",
    jobError: null,
    statusMessage: "",
    rhStatusMessage: null,
    rhStatusCode: null,
    generationStartTime: Number(startedAt || 0) || Date.now(),
    generationDuration: null
  };
}
export function buildGenerationSuccessPatch({
  startedAt = 0,
  duration = null
} = {}) {
  return {
    isGenerating: false,
    jobStatus: "success",
    jobError: null,
    ...buildGenerationDurationPatch({
      startedAt: startedAt,
      duration: duration
    })
  };
}
export function buildGenerationFailurePatch({
  error = "",
  startedAt = 0,
  duration = null
} = {}) {
  const _0x3c7133 = t("coreUi.generationTask.generateFailed");
  const _0x2d712a = String(error || _0x3c7133).trim() || _0x3c7133;
  return {
    isGenerating: false,
    jobStatus: "error",
    jobError: _0x2d712a,
    ...buildGenerationDurationPatch({
      startedAt: startedAt,
      duration: duration
    })
  };
}
export function buildGenerationCancelledPatch({
  startedAt = 0,
  duration = null
} = {}) {
  return {
    isGenerating: false,
    jobStatus: "cancelled",
    jobError: null,
    ...buildGenerationDurationPatch({
      startedAt: startedAt,
      duration: duration
    })
  };
}