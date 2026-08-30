const ADAPTER_TYPE_ALIASES = Object.freeze({
  workflow: "workflow",
  modelapi: "modelApi",
  model_api: "modelApi",
  "model-api": "modelApi",
  localruntime: "localRuntime",
  local_runtime: "localRuntime",
  "local-runtime": "localRuntime"
});
const PROTOCOL_BY_ADAPTER_TYPE = Object.freeze({
  workflow: "workflow",
  modelApi: "modelApi",
  localRuntime: "localRuntime"
});
const TASK_PROTOCOL_ALIASES = Object.freeze({
  workflow: "workflow",
  runninghub: "workflow",
  runninghubworkflow: "workflow",
  rh: "workflow",
  asyncmodelapi: "asyncModelApi",
  async_model_api: "asyncModelApi",
  "async-model-api": "asyncModelApi",
  modelapi: "asyncModelApi",
  model_api: "asyncModelApi",
  "model-api": "asyncModelApi",
  dreamina: "dreamina"
});
function compactIdPart(_0x43a466, _0x580534 = "") {
  return String(_0x43a466 || _0x580534).trim().replace(/\s+/g, "-");
}
function normalizeTaskProtocol(_0x32bde4) {
  const _0x435a9a = String(_0x32bde4 || "").trim().toLowerCase();
  return TASK_PROTOCOL_ALIASES[_0x435a9a] || "";
}
function firstTrimmed(..._0x3b7b96) {
  for (const _0x24093f of _0x3b7b96) {
    const _0x293112 = String(_0x24093f || "").trim();
    if (_0x293112) {
      return _0x293112;
    }
  }
  return "";
}
function inferTaskProtocol({
  taskProtocol = "",
  adapterType = "",
  node = {}
} = {}) {
  const _0x109733 = normalizeTaskProtocol(taskProtocol);
  if (_0x109733) {
    return _0x109733;
  }
  const _0x594ad7 = normalizeGenerationAdapterType(adapterType || node.taskAdapterType || node.adapterType, "");
  if (_0x594ad7 === "workflow") {
    return "workflow";
  }
  if (firstTrimmed(node.asyncTaskId)) {
    return "asyncModelApi";
  }
  if (firstTrimmed(node.dreaminaSubmitId)) {
    return "dreamina";
  }
  if (_0x594ad7 === "modelApi") {
    return "asyncModelApi";
  }
  return "";
}
function inferAdapterTypeForTaskProtocol(_0x4ddb90, _0x48532f = "") {
  const _0x3c09bf = normalizeGenerationAdapterType(_0x48532f, "");
  if (_0x3c09bf) {
    return _0x3c09bf;
  }
  if (_0x4ddb90 === "workflow") {
    return "workflow";
  }
  if (_0x4ddb90 === "asyncModelApi") {
    return "modelApi";
  }
  if (_0x4ddb90 === "dreamina") {
    return "localRuntime";
  }
  return "modelApi";
}
function inferTaskIdForProtocol(_0x181486, _0x5499a3 = {}, _0x3bba7a = "") {
  if (firstTrimmed(_0x3bba7a)) {
    return firstTrimmed(_0x3bba7a);
  }
  if (_0x181486 === "workflow") {
    return firstTrimmed(_0x5499a3.rhTaskId);
  }
  if (_0x181486 === "asyncModelApi") {
    return firstTrimmed(_0x5499a3.asyncTaskId);
  }
  if (_0x181486 === "dreamina") {
    return firstTrimmed(_0x5499a3.dreaminaSubmitId);
  }
  return firstTrimmed(_0x5499a3.rhTaskId, _0x5499a3.asyncTaskId, _0x5499a3.dreaminaSubmitId, _0x5499a3.taskId);
}
function inferStartedAtForProtocol(_0x3a9836, _0x2822a0 = {}, _0x76d369 = 0) {
  const _0x5838e2 = Number(_0x76d369);
  if (Number.isFinite(_0x5838e2) && _0x5838e2 > 0) {
    return _0x5838e2;
  }
  const _0x4a8da3 = _0x3a9836 === "workflow" ? _0x2822a0.rhTaskStartedAt : _0x3a9836 === "asyncModelApi" ? _0x2822a0.asyncTaskStartedAt : _0x3a9836 === "dreamina" ? _0x2822a0.dreaminaTaskStartedAt : 0;
  const _0x17c5e8 = Number(_0x4a8da3 || _0x2822a0.generationStartTime || 0);
  if (Number.isFinite(_0x17c5e8) && _0x17c5e8 > 0) {
    return _0x17c5e8;
  } else {
    return 0;
  }
}
export function normalizeGenerationAdapterType(_0x498dc2, _0x54d038 = "modelApi") {
  const _0x429447 = String(_0x498dc2 || _0x54d038).trim().toLowerCase();
  return ADAPTER_TYPE_ALIASES[_0x429447] || _0x54d038;
}
export function resolveGenerationTaskIdentity(_0x430922 = {}) {
  const {
    kind = "generation",
    node = {},
    payload = {},
    taskProtocol = "",
    provider = "",
    adapterType = "",
    modelId = "",
    executionId = "",
    taskId = "",
    startedAt = 0
  } = _0x430922 || {};
  const _0x5d8fe2 = inferTaskProtocol({
    taskProtocol: taskProtocol,
    adapterType: adapterType,
    node: node
  });
  const _0x2d4bc0 = inferAdapterTypeForTaskProtocol(_0x5d8fe2, adapterType || node.taskAdapterType || node.adapterType);
  const _0x1efe88 = firstTrimmed(provider, node.taskProvider, payload?.provider, _0x5d8fe2 === "asyncModelApi" ? node.asyncTaskProvider : "", node.provider, _0x5d8fe2 === "workflow" ? "runninghubwf" : "", _0x5d8fe2 === "dreamina" ? "dreamina" : "", _0x2d4bc0);
  const _0x466edd = firstTrimmed(modelId, node.taskModelId, payload?.model, node.model);
  const _0xd9be8 = firstTrimmed(executionId, node.taskExecutionId, buildGenerationExecutionId({
    kind: kind,
    provider: _0x1efe88,
    adapterType: _0x2d4bc0,
    modelId: _0x466edd
  }));
  return {
    protocol: _0x5d8fe2,
    provider: _0x1efe88,
    adapterType: _0x2d4bc0,
    modelId: _0x466edd,
    executionId: _0xd9be8,
    taskId: inferTaskIdForProtocol(_0x5d8fe2, node, taskId),
    startedAt: inferStartedAtForProtocol(_0x5d8fe2, node, startedAt),
    async: _0x5d8fe2 === "asyncModelApi"
  };
}
export function buildGenerationExecutionId({
  kind: _0xee710e,
  provider: _0x47d0cd,
  adapterType: _0x483b67,
  modelId: _0x485545,
  fallbackModel = "default"
} = {}) {
  const _0x1d9290 = compactIdPart(_0xee710e, "generation");
  const _0x2389c0 = compactIdPart(_0x47d0cd, normalizeGenerationAdapterType(_0x483b67, "modelApi"));
  const _0x1c330e = compactIdPart(_0x485545, fallbackModel);
  return _0x1d9290 + "." + _0x2389c0 + "." + _0x1c330e;
}
export function createGenerationExecutionPlan(_0x102959 = {}) {
  const {
    kind = "generation",
    sourceNodeId = "",
    targetNodeId = "",
    trigger = "node",
    taskType = "",
    provider = "",
    adapterType = "modelApi",
    modelId = "",
    executionId = "",
    payload: _0x5a9588,
    cancellable: _0x3a4471,
    resumable: _0x2af5e4,
    async: _0x28bcbd,
    ..._0x1abbf4
  } = _0x102959 || {};
  const _0x5d7a5a = normalizeGenerationAdapterType(adapterType);
  const _0x360de8 = _0x5d7a5a === "workflow";
  const _0x1772e7 = _0x28bcbd === true && _0x5d7a5a === "modelApi";
  const _0x3af3f2 = _0x1772e7 ? "asyncModelApi" : PROTOCOL_BY_ADAPTER_TYPE[_0x5d7a5a] || "modelApi";
  const _0x3445e0 = compactIdPart(provider || _0x5a9588?.provider, _0x5d7a5a);
  const _0x2e15e2 = String(modelId || _0x5a9588?.model || "").trim();
  return {
    ..._0x1abbf4,
    sourceNodeId: sourceNodeId,
    targetNodeId: targetNodeId,
    trigger: trigger,
    taskType: String(taskType || kind + "-generation").trim(),
    provider: _0x3445e0,
    adapterType: _0x5d7a5a,
    protocol: _0x3af3f2,
    modelId: _0x2e15e2,
    executionId: String(executionId || "").trim() || buildGenerationExecutionId({
      kind: kind,
      provider: _0x3445e0,
      adapterType: _0x5d7a5a,
      modelId: _0x2e15e2
    }),
    payload: _0x5a9588,
    cancellable: _0x3a4471 === undefined ? _0x360de8 : _0x3a4471 === true,
    resumable: _0x2af5e4 === undefined ? _0x360de8 || _0x1772e7 : _0x2af5e4 === true,
    async: _0x1772e7,
    capabilities: {
      async: _0x1772e7,
      cancellable: _0x3a4471 === undefined ? _0x360de8 : _0x3a4471 === true,
      resumable: _0x2af5e4 === undefined ? _0x360de8 || _0x1772e7 : _0x2af5e4 === true
    }
  };
}
function createGenerationLifecyclePlan(_0xf246b5, _0x55cb5a = {}) {
  const _0xabdc5a = createGenerationExecutionPlan(_0x55cb5a);
  return {
    ..._0xabdc5a,
    lifecycle: String(_0xf246b5 || "submit")
  };
}
export function createGenerationSubmitPlan(_0x7f118b = {}) {
  return createGenerationLifecyclePlan("submit", _0x7f118b);
}
export function createGenerationResumePlan(_0x199c4e = {}) {
  return createGenerationLifecyclePlan("resume", {
    resumable: true,
    ..._0x199c4e
  });
}
export function createGenerationCancelPlan(_0x14b5e2 = {}) {
  return createGenerationLifecyclePlan("cancel", {
    cancellable: true,
    ..._0x14b5e2
  });
}
function createGenerationPlanFromNode(_0x406150, _0x184592 = {}) {
  const {
    node = {},
    payload = {},
    taskProtocol = "",
    provider = "",
    adapterType = "",
    modelId = "",
    executionId = "",
    taskId = "",
    startedAt = 0,
    ..._0x48fe62
  } = _0x184592 || {};
  const _0x30a68a = resolveGenerationTaskIdentity({
    kind: _0x48fe62.kind,
    node: node,
    payload: payload,
    taskProtocol: taskProtocol,
    provider: provider,
    adapterType: adapterType,
    modelId: modelId,
    executionId: executionId,
    taskId: taskId,
    startedAt: startedAt
  });
  const _0x279393 = {
    ..._0x48fe62,
    provider: _0x30a68a.provider,
    adapterType: _0x30a68a.adapterType,
    modelId: _0x30a68a.modelId,
    executionId: _0x30a68a.executionId,
    payload: payload,
    taskId: _0x30a68a.taskId,
    startedAt: _0x30a68a.startedAt,
    async: _0x30a68a.async
  };
  if (_0x406150 === "resume") {
    return createGenerationResumePlan(_0x279393);
  }
  if (_0x406150 === "cancel") {
    return createGenerationCancelPlan(_0x279393);
  }
  return createGenerationSubmitPlan(_0x279393);
}
export function createGenerationSubmitPlanFromNode(_0x4de7fd = {}) {
  return createGenerationPlanFromNode("submit", _0x4de7fd);
}
export function createGenerationResumePlanFromNode(_0xfe0c3a = {}) {
  return createGenerationPlanFromNode("resume", _0xfe0c3a);
}
export function createGenerationCancelPlanFromNode(_0xfbeebd = {}) {
  return createGenerationPlanFromNode("cancel", _0xfbeebd);
}