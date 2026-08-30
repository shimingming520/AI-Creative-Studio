const RUNNING_STATUSES = new Set(["running", "processing", "generating", "in_progress", "in-progress"]);
const QUEUED_STATUSES = new Set(["pending", "queued", "queueing", "waiting", "submitted"]);
const SUBMITTING_STATUSES = new Set(["submitting", "submit"]);
const SUCCESS_STATUSES = new Set(["success", "succeeded", "completed", "complete", "done", "finished", "finish"]);
const ERROR_STATUSES = new Set(["error", "failed", "fail"]);
const CANCELLED_STATUSES = new Set(["cancelled", "canceled"]);
const RECOVERING_FIELDS = Object.freeze(["rhTaskRecovering", "dreaminaTaskRecovering", "asyncTaskRecovering"]);
const STATUS_FIELDS = Object.freeze(["jobStatus", "rhTaskStatus", "dreaminaTaskStatus", "dreaminaTaskPhase", "asyncTaskStatus", "mediaTaskStatus"]);
const MESSAGE_FIELDS = Object.freeze(["jobError", "rhStatusMessage", "dreaminaTaskLabel", "asyncTaskError", "mediaTaskError", "error", "statusMessage"]);
const IDLE_STATUSES = new Set(["idle", ""]);
function normalizeStatus(_0x5691fd) {
  return String(_0x5691fd || "").trim().toLowerCase();
}
function isNonIdleStatus(_0x455bcd) {
  return !IDLE_STATUSES.has(normalizeStatus(_0x455bcd));
}
function hasActiveTaskFamily(_0x23fff3) {
  if (!_0x23fff3 || typeof _0x23fff3 !== "object") {
    return false;
  }
  return _0x23fff3.rhTaskRecovering === true || _0x23fff3.dreaminaTaskRecovering === true || _0x23fff3.asyncTaskRecovering === true || !!String(_0x23fff3.rhTaskId || "").trim() || !!String(_0x23fff3.dreaminaSubmitId || "").trim() || !!String(_0x23fff3.asyncTaskId || "").trim() || isNonIdleStatus(_0x23fff3.rhTaskStatus) || isNonIdleStatus(_0x23fff3.dreaminaTaskStatus) || isNonIdleStatus(_0x23fff3.asyncTaskStatus);
}
function collectStatuses(_0x5b4b39) {
  if (!_0x5b4b39 || typeof _0x5b4b39 !== "object") {
    return [];
  }
  if (hasActiveTaskFamily(_0x5b4b39)) {
    const _0x13a345 = [_0x5b4b39.jobStatus];
    if (_0x5b4b39.rhTaskRecovering === true || !!String(_0x5b4b39.rhTaskId || "").trim() || isNonIdleStatus(_0x5b4b39.rhTaskStatus)) {
      _0x13a345.push(_0x5b4b39.rhTaskStatus);
    }
    if (_0x5b4b39.dreaminaTaskRecovering === true || !!String(_0x5b4b39.dreaminaSubmitId || "").trim() || isNonIdleStatus(_0x5b4b39.dreaminaTaskStatus)) {
      _0x13a345.push(_0x5b4b39.dreaminaTaskStatus, _0x5b4b39.dreaminaTaskPhase);
    }
    if (_0x5b4b39.asyncTaskRecovering === true || !!String(_0x5b4b39.asyncTaskId || "").trim() || isNonIdleStatus(_0x5b4b39.asyncTaskStatus)) {
      _0x13a345.push(_0x5b4b39.asyncTaskStatus);
    }
    return _0x13a345.map(normalizeStatus).filter(Boolean);
  }
  return STATUS_FIELDS.map(_0x1dcd6a => normalizeStatus(_0x5b4b39[_0x1dcd6a])).filter(Boolean);
}
function hasAnyStatus(_0x37c375, _0x2b27fe) {
  return _0x37c375.some(_0xed496 => _0x2b27fe.has(_0xed496));
}
function hasRecoveringFlag(_0x1208f4) {
  if (!_0x1208f4 || typeof _0x1208f4 !== "object") {
    return false;
  }
  return RECOVERING_FIELDS.some(_0x4b4365 => _0x1208f4[_0x4b4365] === true);
}
export function resolveGenerationUiState(_0x463c33) {
  const _0xa7558 = collectStatuses(_0x463c33);
  const _0x3c0d87 = normalizeStatus(_0x463c33?.generationQueueStatus);
  if (hasAnyStatus(_0xa7558, ERROR_STATUSES)) {
    return "error";
  }
  if (hasAnyStatus(_0xa7558, CANCELLED_STATUSES)) {
    return "cancelled";
  }
  if (hasAnyStatus(_0xa7558, SUCCESS_STATUSES)) {
    return "success";
  }
  if (hasRecoveringFlag(_0x463c33)) {
    return "recovering";
  }
  if (QUEUED_STATUSES.has(_0x3c0d87)) {
    return "queued";
  }
  if (SUBMITTING_STATUSES.has(_0x3c0d87)) {
    return "submitting";
  }
  if (hasAnyStatus(_0xa7558, RUNNING_STATUSES)) {
    return "running";
  }
  if (hasAnyStatus(_0xa7558, QUEUED_STATUSES)) {
    return "queued";
  }
  if (hasAnyStatus(_0xa7558, SUBMITTING_STATUSES)) {
    return "submitting";
  }
  if (_0x463c33?.isGenerating === true) {
    return "running";
  }
  return "idle";
}
export function isTaskRunning(_0xe8198e) {
  return ["submitting", "queued", "running", "recovering"].includes(resolveGenerationUiState(_0xe8198e));
}
export function isTaskTerminal(_0x4844fb) {
  return ["success", "error", "cancelled"].includes(resolveGenerationUiState(_0x4844fb));
}
export function isTaskFailed(_0x48cac1) {
  return resolveGenerationUiState(_0x48cac1) === "error";
}
export function isTaskCancelled(_0xd17007) {
  return resolveGenerationUiState(_0xd17007) === "cancelled";
}
export function shouldShowGenerationBusyUi(_0x2d31b8) {
  return isTaskRunning(_0x2d31b8);
}
export function shouldShowGenerationResultLoadingUi(_0x16d2ef, {
  hasResult = false
} = {}) {
  return hasResult !== true && shouldShowGenerationBusyUi(_0x16d2ef);
}
export function shouldAllowCancel(_0x44865a, {
  cancellable = false,
  cancelInFlight = false
} = {}) {
  return cancellable === true && isTaskRunning(_0x44865a) && cancelInFlight !== true;
}
export function resolveGenerationButtonMode(_0x1edbc, {
  cancellable = false,
  cancelInFlight = false
} = {}) {
  const _0x10e156 = resolveGenerationUiState(_0x1edbc);
  const _0x489f8a = isTaskRunning(_0x1edbc);
  const _0x5f2222 = shouldAllowCancel(_0x1edbc, {
    cancellable: cancellable,
    cancelInFlight: cancelInFlight
  });
  return {
    state: _0x10e156,
    busy: _0x489f8a,
    canCancel: _0x5f2222,
    disabled: _0x489f8a ? !_0x5f2222 || cancelInFlight === true : false,
    cursor: _0x489f8a && (!_0x5f2222 || cancelInFlight === true) ? "var(--unavailable-cursor)" : ""
  };
}
export function getTaskMessage(_0x45a1a9) {
  if (!_0x45a1a9 || typeof _0x45a1a9 !== "object") {
    return "";
  }
  for (const _0xd079f0 of MESSAGE_FIELDS) {
    const _0x20d89e = String(_0x45a1a9[_0xd079f0] || "").trim();
    if (_0x20d89e) {
      return _0x20d89e;
    }
  }
  return "";
}
export function isDreaminaTaskTerminal(_0x5bceaa) {
  const _0x599a18 = [normalizeStatus(_0x5bceaa?.dreaminaTaskStatus), normalizeStatus(_0x5bceaa?.dreaminaTaskPhase)].filter(Boolean);
  return hasAnyStatus(_0x599a18, ERROR_STATUSES) || hasAnyStatus(_0x599a18, CANCELLED_STATUSES) || hasAnyStatus(_0x599a18, SUCCESS_STATUSES);
}