function normalizeStatus(_0x216502, _0x452c7c = "pending") {
  return String(_0x216502 || _0x452c7c).trim() || _0x452c7c;
}
function normalizeNumber(_0xa7b88e, _0x1a1fab = 0) {
  const _0xab3a33 = Number(_0xa7b88e);
  if (Number.isFinite(_0xab3a33)) {
    return _0xab3a33;
  } else {
    return _0x1a1fab;
  }
}
function normalizeRecord(_0x583ca9) {
  if (_0x583ca9 && typeof _0x583ca9 === "object" && !Array.isArray(_0x583ca9)) {
    return _0x583ca9;
  } else {
    return {};
  }
}
function normalizeAdapterType(_0x21e9d5) {
  return String(_0x21e9d5 || "").trim().toLowerCase();
}
const DEFAULT_IMAGE_DREAMINA_TASK_LABEL = "生成中";
function isWorkflowProtocolSpec(_0x5e8185 = {}, _0x51c1ac = {}) {
  const _0x3d63fc = normalizeAdapterType(_0x5e8185.adapterType || _0x51c1ac.adapterType);
  return _0x3d63fc === "workflow";
}
function isAsyncModelApiProtocolSpec(_0x295f48 = {}, _0x57276a = {}) {
  const _0x10eb84 = normalizeAdapterType(_0x295f48.adapterType || _0x57276a.adapterType);
  return _0x10eb84 === "modelapi" && _0x295f48.async === true;
}
function buildTaskMetaPatch(_0xe06a58 = {}) {
  const _0x4d177d = String(_0xe06a58.providerProfileId || _0xe06a58.payload?.providerProfileId || _0xe06a58.payload?.rhProviderProfileId || "").trim();
  return {
    taskTrigger: String(_0xe06a58.trigger || ""),
    taskType: String(_0xe06a58.taskType || ""),
    taskProvider: String(_0xe06a58.provider || ""),
    ...(_0x4d177d ? {
      taskProviderProfileId: _0x4d177d
    } : {}),
    taskAdapterType: String(_0xe06a58.adapterType || ""),
    taskModelId: String(_0xe06a58.modelId || ""),
    taskExecutionId: String(_0xe06a58.executionId || ""),
    taskCancellable: _0xe06a58.cancellable === true,
    taskResumable: _0xe06a58.resumable === true
  };
}
export function buildRunningHubTaskPatch({
  taskId = "",
  status = "pending",
  startedAt = 0,
  recovering = false,
  useOpenapiQuery = false
} = {}) {
  return {
    rhTaskId: String(taskId || "").trim(),
    rhTaskStatus: normalizeStatus(status),
    rhTaskStartedAt: normalizeNumber(startedAt),
    rhTaskRecovering: recovering === true,
    rhTaskUseOpenapiQuery: useOpenapiQuery === true
  };
}
export function buildAsyncTaskPatch({
  provider = "",
  kind = "generation",
  taskId = "",
  status = "pending",
  startedAt = 0,
  recovering = false
} = {}) {
  return {
    asyncTaskProvider: String(provider || "").trim(),
    asyncTaskKind: String(kind || "generation").trim() || "generation",
    asyncTaskId: String(taskId || "").trim(),
    asyncTaskStatus: normalizeStatus(status),
    asyncTaskStartedAt: normalizeNumber(startedAt),
    asyncTaskRecovering: recovering === true
  };
}
export function buildDreaminaTaskPatch({
  submitId = "",
  status = "pending",
  phase = "generating",
  label = "",
  startedAt = 0,
  lastCheckedAt = Date.now(),
  recovering = false,
  raw = {},
  defaultLabel = ""
} = {}) {
  const _0x204089 = String(defaultLabel || "").trim();
  const _0x2b5cdf = String(label || _0x204089).trim() || _0x204089;
  return {
    dreaminaSubmitId: String(submitId || "").trim(),
    dreaminaTaskStatus: normalizeStatus(status),
    dreaminaTaskPhase: normalizeStatus(phase, "generating"),
    dreaminaTaskLabel: _0x2b5cdf,
    dreaminaTaskStartedAt: normalizeNumber(startedAt),
    dreaminaTaskLastCheckedAt: normalizeNumber(lastCheckedAt, Date.now()),
    dreaminaTaskRecovering: recovering === true,
    dreaminaTaskLastRaw: normalizeRecord(raw)
  };
}
export function buildImageGenerationRunningHubTaskPatch(_0x58eaf9 = {}) {
  return buildRunningHubTaskPatch(_0x58eaf9);
}
export function buildImageGenerationDreaminaTaskPatch({
  submitId = "",
  status = "pending",
  phase = "generating",
  label = DEFAULT_IMAGE_DREAMINA_TASK_LABEL,
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
    defaultLabel: DEFAULT_IMAGE_DREAMINA_TASK_LABEL
  });
}
export function buildImageGenerationAsyncTaskPatch({
  provider = "",
  kind = "image",
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
export function buildRunningHubOpenapiTaskPatch({
  taskId = "",
  status = "pending",
  startedAt = 0,
  recovering = false,
  useOpenapiQuery = true
} = {}) {
  return buildRunningHubTaskPatch({
    taskId: taskId,
    status: status,
    startedAt: startedAt,
    recovering: recovering,
    useOpenapiQuery: useOpenapiQuery
  });
}
export function buildIdleGenerationProtocolPatch({
  kind = "generation"
} = {}) {
  return {
    generationQueueStatus: "idle",
    generationQueueIndex: -1,
    generationQueueLength: 0,
    ...buildRunningHubTaskPatch({
      taskId: "",
      status: "idle",
      startedAt: 0,
      recovering: false,
      useOpenapiQuery: false
    }),
    ...buildDreaminaTaskPatch({
      submitId: "",
      status: "idle",
      phase: "idle",
      label: "",
      startedAt: 0,
      lastCheckedAt: 0,
      recovering: false,
      raw: {}
    }),
    ...buildAsyncTaskPatch({
      provider: "",
      kind: kind,
      taskId: "",
      status: "idle",
      startedAt: 0,
      recovering: false
    })
  };
}
export function buildGenerationProtocolResetPatch(_0x34b307 = {}) {
  return buildIdleGenerationProtocolPatch(_0x34b307);
}
export function buildGenerationProtocolStartPatch(_0x440a2f = {}, _0x4b228a = 0) {
  const _0x11d0dd = buildTaskMetaPatch(_0x440a2f);
  const _0x28221e = {
    generationQueueStatus: "submitting",
    generationQueueIndex: -1,
    generationQueueLength: 0
  };
  if (isWorkflowProtocolSpec(_0x440a2f)) {
    return {
      ..._0x11d0dd,
      ..._0x28221e,
      ...buildRunningHubTaskPatch({
        taskId: "",
        status: "pending",
        startedAt: _0x4b228a,
        recovering: false,
        useOpenapiQuery: false
      }),
      rhSourceNodeId: String(_0x440a2f.sourceNodeId || ""),
      rhToolbarTaskType: String(_0x440a2f.taskType || "")
    };
  }
  if (isAsyncModelApiProtocolSpec(_0x440a2f)) {
    return {
      ..._0x11d0dd,
      ..._0x28221e,
      asyncTaskId: "",
      asyncTaskStatus: "pending",
      asyncTaskStartedAt: normalizeNumber(_0x4b228a),
      asyncTaskRecovering: false
    };
  }
  return {
    ..._0x11d0dd,
    ..._0x28221e
  };
}
export function buildGenerationProtocolTaskIdPatch(_0x5503bc = {}, _0x3261c6 = "", _0x23e371 = 0) {
  const _0x11ad4d = String(_0x3261c6 || "").trim();
  if (!_0x11ad4d) {
    return {};
  }
  if (isWorkflowProtocolSpec(_0x5503bc)) {
    return buildRunningHubTaskPatch({
      taskId: _0x11ad4d,
      status: "running",
      startedAt: _0x23e371,
      recovering: false,
      useOpenapiQuery: false
    });
  }
  if (isAsyncModelApiProtocolSpec(_0x5503bc)) {
    return {
      asyncTaskId: _0x11ad4d,
      asyncTaskStatus: "running",
      asyncTaskStartedAt: normalizeNumber(_0x23e371),
      asyncTaskRecovering: false
    };
  }
  return {};
}
export function buildGenerationProtocolTerminalPatch(_0x17591e = {}, _0x438d14 = "idle") {
  const _0x9f2892 = normalizeStatus(_0x438d14, "idle");
  if (isWorkflowProtocolSpec(_0x17591e)) {
    return {
      generationQueueStatus: "idle",
      generationQueueIndex: -1,
      generationQueueLength: 0,
      rhTaskStatus: _0x9f2892,
      rhTaskRecovering: false
    };
  }
  if (isAsyncModelApiProtocolSpec(_0x17591e)) {
    return {
      generationQueueStatus: "idle",
      generationQueueIndex: -1,
      generationQueueLength: 0,
      asyncTaskStatus: _0x9f2892,
      asyncTaskRecovering: false
    };
  }
  return {
    generationQueueStatus: "idle",
    generationQueueIndex: -1,
    generationQueueLength: 0
  };
}
export function buildGenerationProtocolPendingPatch(_0xf66051 = {}, _0xb7750e = {}, _0x4e4890 = "") {
  const _0x4e917a = String(_0xb7750e?.taskId || "").trim();
  const _0x525d9f = String(_0x4e4890 || "").trim();
  const _0x4c901d = {
    isGenerating: true,
    jobStatus: "running",
    jobError: null,
    generationDuration: null,
    ...(_0x525d9f ? {
      statusMessage: _0x525d9f
    } : {})
  };
  if (isWorkflowProtocolSpec(_0xf66051)) {
    return {
      ..._0x4c901d,
      ...(_0x4e917a ? buildGenerationProtocolTaskIdPatch(_0xf66051, _0x4e917a, _0xb7750e.startedAt) : {
        rhTaskStatus: "pending"
      }),
      rhTaskRecovering: false,
      ...(_0x525d9f ? {
        rhStatusMessage: _0x525d9f
      } : {})
    };
  }
  if (isAsyncModelApiProtocolSpec(_0xf66051)) {
    return {
      ..._0x4c901d,
      ...(_0x4e917a ? buildGenerationProtocolTaskIdPatch(_0xf66051, _0x4e917a, _0xb7750e.startedAt) : {
        asyncTaskStatus: "pending"
      }),
      asyncTaskRecovering: false
    };
  }
  return _0x4c901d;
}
export function buildGenerationProtocolTransitionPatch({
  type = "",
  spec = {},
  context = {},
  startedAt = 0,
  taskId = "",
  status = "",
  message = "",
  kind = "generation"
} = {}) {
  const _0xaa72fd = String(type || "").trim();
  if (_0xaa72fd === "start") {
    return buildGenerationProtocolStartPatch(spec, startedAt);
  }
  if (_0xaa72fd === "taskId") {
    return buildGenerationProtocolTaskIdPatch(spec, taskId, startedAt);
  }
  if (_0xaa72fd === "pending") {
    return buildGenerationProtocolPendingPatch(spec, context, message);
  }
  if (_0xaa72fd === "terminal") {
    return buildGenerationProtocolTerminalPatch(spec, status);
  }
  if (_0xaa72fd === "reset") {
    return buildGenerationProtocolResetPatch({
      kind: kind
    });
  }
  return {};
}