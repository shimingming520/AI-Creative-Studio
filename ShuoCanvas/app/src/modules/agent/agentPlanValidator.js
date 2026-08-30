import { canvasCommandRegistry, hasCanvasCommandPlanVariableReference } from "../canvasCommands/index.js";
import { AGENT_BATCH_CONFIRM_THRESHOLD, normalizeAgentPlan } from "./agentActionSchema.js";
import { buildSupportedAgentParamsFromHints, extractAgentDuplicateCountHint, extractAgentParameterHints } from "./agentParameterHints.js";
import { normalizeAgentSearchKey } from "./agentCapabilityDiscovery.js";
const RISK_ORDER = Object.freeze({
  safe: 0,
  confirm: 1,
  danger: 2,
  blocked: 3
});
const CREATE_NODE_TYPE_BY_KIND = Object.freeze({
  text: "ai-text",
  image: "ai-image",
  video: "ai-video",
  audio: "ai-audio"
});
function maxRisk(_0x187e34, _0x314c38) {
  if ((RISK_ORDER[_0x314c38] || 0) > (RISK_ORDER[_0x187e34] || 0)) {
    return _0x314c38;
  } else {
    return _0x187e34;
  }
}
function actionSize(_0x5418fe = {}) {
  const _0x2a8508 = _0x5418fe.args?.ids;
  const _0x42b671 = Array.isArray(_0x2a8508) ? _0x2a8508.length : _0x5418fe.args?.nodeId ? 1 : 0;
  if (_0x5418fe.type !== "node.duplicate") {
    return _0x42b671;
  }
  const _0x25cda8 = Math.max(1, Math.trunc(Number(_0x5418fe.args?.copies || 1)));
  return _0x42b671 * _0x25cda8;
}
function getAliasNodeIdReference(_0x517261) {
  const _0x3703bc = /^\$([A-Za-z_][A-Za-z0-9_]*)\.nodeId$/.exec(String(_0x517261 || "").trim());
  return _0x3703bc?.[1] || "";
}
function getAliasEdgeIdReference(_0x454479) {
  const _0x46f590 = /^\$([A-Za-z_][A-Za-z0-9_]*)\.edgeId$/.exec(String(_0x454479 || "").trim());
  return _0x46f590?.[1] || "";
}
function getPlainObject(_0x366b9b) {
  if (_0x366b9b && typeof _0x366b9b === "object" && !Array.isArray(_0x366b9b)) {
    return _0x366b9b;
  } else {
    return {};
  }
}
function isSamePlanCreatedNodeReference(_0x4612ef, _0x192eb1 = {}) {
  const _0x38ff35 = String(_0x4612ef || "").trim();
  if (_0x38ff35 && _0x192eb1.createdNodeIds?.has?.(_0x38ff35)) {
    return true;
  }
  const _0x305a0e = getAliasNodeIdReference(_0x4612ef);
  return !!_0x305a0e && _0x192eb1.createdNodeAliases?.has?.(_0x305a0e);
}
function isSamePlanCreatedEdgeReference(_0x5f213, _0x4a2d01 = {}) {
  const _0x36002e = String(_0x5f213 || "").trim();
  if (_0x36002e && _0x4a2d01.createdEdgeIds?.has?.(_0x36002e)) {
    return true;
  }
  const _0x587e20 = getAliasEdgeIdReference(_0x5f213);
  return !!_0x587e20 && _0x4a2d01.createdEdgeAliases?.has?.(_0x587e20);
}
function isSamePlanConnectionPreparation(_0x280a7a = {}, _0x5c16a9 = {}) {
  if (_0x280a7a.type !== "graph.connect") {
    return false;
  }
  return isSamePlanCreatedNodeReference(_0x280a7a.args?.sourceId, _0x5c16a9) || isSamePlanCreatedNodeReference(_0x280a7a.args?.targetId, _0x5c16a9);
}
function isSamePlanNodePreparation(_0x56299b = {}, _0x39d458 = {}) {
  if (_0x56299b.type === "node.setPrompt" || _0x56299b.type === "node.appendPrompt" || _0x56299b.type === "node.setParams" || _0x56299b.type === "node.setModel" || _0x56299b.type === "node.changeModel") {
    return isSamePlanCreatedNodeReference(_0x56299b.args?.nodeId, _0x39d458);
  }
  if (_0x56299b.type === "node.setInputSlot") {
    if (isSamePlanCreatedEdgeReference(_0x56299b.args?.edgeId, _0x39d458)) {
      return true;
    }
    return isSamePlanCreatedNodeReference(_0x56299b.args?.sourceId, _0x39d458) || isSamePlanCreatedNodeReference(_0x56299b.args?.targetId, _0x39d458);
  }
  return false;
}
function isExistingNodeMutationAction(_0x3003e7 = {}) {
  return _0x3003e7.type === "graph.connect" || _0x3003e7.type === "node.setPrompt" || _0x3003e7.type === "node.appendPrompt" || _0x3003e7.type === "node.setParams" || _0x3003e7.type === "node.setModel" || _0x3003e7.type === "node.changeModel" || _0x3003e7.type === "node.setInputSlot";
}
function getMutationConfirmReason(_0x304383 = {}) {
  if (_0x304383.type === "graph.connect") {
    return "existing node connection change requires confirmation";
  }
  if (_0x304383.type === "node.setPrompt" || _0x304383.type === "node.appendPrompt") {
    return "existing node prompt change requires confirmation";
  }
  if (_0x304383.type === "node.setParams") {
    return "existing node generation params change requires confirmation";
  }
  if (_0x304383.type === "node.setModel" || _0x304383.type === "node.changeModel") {
    return "existing node model change requires confirmation";
  }
  if (_0x304383.type === "node.setInputSlot") {
    return "existing input slot change requires confirmation";
  }
  return "";
}
function getActionRisk(_0x316b10, _0x3ec9c7, _0x40e720 = {}) {
  let _0x1a4d1b = _0x3ec9c7?.riskLevel || "safe";
  let _0x3f5595 = _0x1a4d1b !== "safe" ? "command risk requires confirmation" : "";
  if (_0x316b10.type === "generation.run") {
    _0x1a4d1b = maxRisk(_0x1a4d1b, "confirm");
    _0x3f5595 = "generation run requires confirmation";
  }
  if (_0x316b10.type === "node.delete") {
    _0x1a4d1b = maxRisk(_0x1a4d1b, "danger");
    _0x3f5595 = "node delete requires confirmation";
  }
  if (isExistingNodeMutationAction(_0x316b10) && !isSamePlanNodePreparation(_0x316b10, _0x40e720) && !isSamePlanConnectionPreparation(_0x316b10, _0x40e720)) {
    _0x1a4d1b = maxRisk(_0x1a4d1b, "confirm");
    _0x3f5595 = getMutationConfirmReason(_0x316b10);
  }
  if (actionSize(_0x316b10) > AGENT_BATCH_CONFIRM_THRESHOLD) {
    _0x1a4d1b = maxRisk(_0x1a4d1b, "confirm");
    _0x3f5595 = "large batch requires confirmation";
  }
  return {
    risk: _0x1a4d1b,
    reason: _0x3f5595
  };
}
function buildFailure(_0x1c0972, _0x547a5c = undefined) {
  return {
    ok: false,
    status: "failed",
    errorCode: "AGENT_PLAN_INVALID",
    message: _0x1c0972,
    details: _0x547a5c
  };
}
function isImageNodeType(_0x28983d = "") {
  const _0x3d0895 = String(_0x28983d || "");
  return _0x3d0895 === "ai-image" || _0x3d0895 === "source-image";
}
function findSelectedImageNodeId(_0x4562b5 = {}) {
  const _0x31988f = _0x4562b5?.canvas || {};
  const _0x4bb29a = Array.isArray(_0x31988f.selectedNodes) ? _0x31988f.selectedNodes : [];
  const _0x4150d1 = _0x4bb29a.find(_0x2f494e => isImageNodeType(_0x2f494e?.type));
  if (_0x4150d1?.id) {
    return String(_0x4150d1.id);
  }
  const _0x1257e0 = Array.isArray(_0x31988f.selectedNodeIds) ? _0x31988f.selectedNodeIds.map(_0x7c1f2b => String(_0x7c1f2b || "")).filter(Boolean) : [];
  if (_0x1257e0.length === 0) {
    return "";
  }
  const _0x2bd39f = new Set(_0x1257e0);
  const _0x1d6825 = Array.isArray(_0x31988f.nodes) ? _0x31988f.nodes : [];
  return String(_0x1d6825.find(_0x534aba => _0x2bd39f.has(String(_0x534aba?.id || "")) && isImageNodeType(_0x534aba?.type))?.id || "");
}
function modelAllowsImageInput(_0x2a5fa3 = {}) {
  const _0x48271a = _0x2a5fa3?.inputSlots && typeof _0x2a5fa3.inputSlots === "object" ? _0x2a5fa3.inputSlots : {};
  const _0x2ba108 = Array.isArray(_0x48271a.allowedKinds) ? _0x48271a.allowedKinds : [];
  if (_0x2ba108.includes("image")) {
    return true;
  }
  const _0x30b52e = Number(_0x48271a.maxByKind?.image);
  return Number.isFinite(_0x30b52e) && _0x30b52e > 0;
}
function modelRequiresMissingMedia(_0x4579f6 = {}) {
  const _0x14a9b0 = _0x4579f6?.inputSlots && typeof _0x4579f6.inputSlots === "object" ? _0x4579f6.inputSlots : {};
  const _0x4f132e = _0x14a9b0.minByKind || {};
  if (Number(_0x4f132e.video) > 0) {
    return true;
  }
  if (Number(_0x4f132e.audio) > 0) {
    return true;
  }
  const _0x1c767e = Array.isArray(_0x14a9b0.fixedSlots) ? _0x14a9b0.fixedSlots : [];
  return _0x1c767e.some(_0x326bd9 => _0x326bd9?.required === true && (String(_0x326bd9?.kind || "") === "video" || String(_0x326bd9?.kind || "") === "audio"));
}
function getModelFieldIds(_0x43602a = {}) {
  return new Set((Array.isArray(_0x43602a?.uiSchema?.fields) ? _0x43602a.uiSchema.fields : []).map(_0x1e990c => String(_0x1e990c?.id || "").trim()).filter(Boolean));
}
const CREATE_NODE_KINDS = Object.freeze({
  "ai-image": "image",
  "ai-video": "video",
  "ai-audio": "audio",
  "ai-text": "text",
  "storyboard-script": "text"
});
function findImageToVideoModel(_0x4b8a15 = {}) {
  const _0x9ed190 = Array.isArray(_0x4b8a15?.canvas?.availableModels) ? _0x4b8a15.canvas.availableModels : [];
  return _0x9ed190.find(_0x2c9be7 => _0x2c9be7?.kind === "video" && _0x2c9be7?.modelId && modelAllowsImageInput(_0x2c9be7) && !modelRequiresMissingMedia(_0x2c9be7)) || null;
}
function findContextModel(_0xdd121d = {}, _0x325787 = "") {
  const _0x4afe5e = String(_0x325787 || "").trim();
  if (!_0x4afe5e) {
    return null;
  }
  const _0x434c98 = Array.isArray(_0xdd121d?.canvas?.availableModels) ? _0xdd121d.canvas.availableModels : [];
  return _0x434c98.find(_0x2b3141 => _0x2b3141?.modelId === _0x4afe5e) || null;
}
function normalizeModelReference(_0x2461e7 = "") {
  return String(_0x2461e7 || "").trim().normalize("NFKC").toLocaleLowerCase();
}
function findContextModelByReference(_0x29712d = {}, _0x50694f = "", {
  kind = ""
} = {}) {
  const _0x254b3e = String(_0x50694f || "").trim();
  if (!_0x254b3e) {
    return null;
  }
  const _0x3f9eb3 = findContextModel(_0x29712d, _0x254b3e);
  if (_0x3f9eb3 && (!kind || String(_0x3f9eb3.kind || "") === kind)) {
    return {
      model: _0x3f9eb3,
      source: "modelId"
    };
  }
  const _0x13a8db = normalizeModelReference(_0x254b3e);
  const _0x518cfe = normalizeAgentSearchKey(_0x254b3e);
  const _0x5add9b = Array.isArray(_0x29712d?.canvas?.availableModels) ? _0x29712d.canvas.availableModels : [];
  const _0x56d518 = _0x5add9b.filter(_0x8bae90 => _0x8bae90?.modelId && (!kind || String(_0x8bae90.kind || "") === kind) && normalizeAgentSearchKey(_0x8bae90.modelId) === _0x518cfe);
  if (_0x56d518.length === 1) {
    return {
      model: _0x56d518[0],
      source: "compactModelId"
    };
  }
  const _0x53f7e6 = _0x5add9b.filter(_0x3ef8d0 => _0x3ef8d0?.modelId && (!kind || String(_0x3ef8d0.kind || "") === kind) && normalizeModelReference(_0x3ef8d0.displayName) === _0x13a8db);
  if (_0x53f7e6.length === 1) {
    return {
      model: _0x53f7e6[0],
      source: "displayName"
    };
  }
  const _0x56e712 = _0x5add9b.filter(_0x57e501 => _0x57e501?.modelId && (!kind || String(_0x57e501.kind || "") === kind) && normalizeAgentSearchKey(_0x57e501.displayName) === _0x518cfe);
  if (_0x56e712.length === 1) {
    return {
      model: _0x56e712[0],
      source: "compactDisplayName"
    };
  } else {
    return null;
  }
}
function matchExplicitUserModelDirective(_0x5d4577 = "") {
  const _0x2f6828 = String(_0x5d4577 || "").replace(/\s+/g, " ").trim();
  if (!_0x2f6828) {
    return null;
  }
  const _0x5b8532 = [/^(?:(?:请|麻烦)\s*)?(?:(?:帮我|给我)\s*)?(?:(?:使用|用|采用|选择|选用)\s*)?([^，。；;:：\n]{1,80}?)\s*模型\s*(?:来|去|进行)?\s*(?=(?:创建|生成|创作|制作|画|绘制))/i, /^(?:(?:请|麻烦)\s*)?(?:(?:帮我|给我)\s*)?(?:使用|用|采用|选择|选用)\s*([A-Za-z0-9][A-Za-z0-9 ._+\-/]{0,79}?)\s*(?:来|去)?\s*(?=(?:创建|生成|创作|制作|画|绘制))/i, /^(?:please\s+)?(?:use|with|choose|select)\s+(.{1,80}?)\s+(?:model\s+)?(?=(?:to\s+)?(?:create|generate|render|make))/i];
  for (const _0x28ff2f of _0x5b8532) {
    const _0x327b55 = _0x28ff2f.exec(_0x2f6828);
    const _0x265cce = String(_0x327b55?.[1] || "").trim();
    if (!_0x265cce) {
      continue;
    }
    return {
      message: _0x2f6828,
      reference: _0x265cce,
      prefixLength: _0x327b55[0].length
    };
  }
  return null;
}
function applyExplicitUserModelDefaults(_0x8e011a, _0x5c3231 = {}, {
  userMessage = ""
} = {}) {
  if (!Array.isArray(_0x8e011a?.actions) || _0x8e011a.actions.length === 0) {
    return {
      plan: _0x8e011a,
      trace: []
    };
  }
  const _0x5864e7 = matchExplicitUserModelDirective(userMessage);
  if (!_0x5864e7) {
    return {
      plan: _0x8e011a,
      trace: []
    };
  }
  const _0x3eca5c = [];
  let _0x12d18d = false;
  const _0x33a0c9 = _0x8e011a.actions.map(_0x1a82f9 => {
    if (_0x1a82f9.type !== "node.create") {
      return _0x1a82f9;
    }
    const _0x92c3fe = CREATE_NODE_KINDS[String(_0x1a82f9.args?.type || "")] || "";
    if (!_0x92c3fe) {
      return _0x1a82f9;
    }
    const _0x424cf4 = findContextModelByReference(_0x5c3231, _0x5864e7.reference, {
      kind: _0x92c3fe
    });
    const _0x299598 = _0x424cf4?.model || null;
    if (!_0x299598?.modelId) {
      return _0x1a82f9;
    }
    const _0x39eeca = String(_0x1a82f9.args?.model || _0x1a82f9.args?.modelId || "").trim();
    const _0x59ceb7 = String(_0x1a82f9.args?.provider || "").trim();
    const _0x1cf79d = String(_0x299598.provider || _0x59ceb7).trim();
    if (_0x39eeca === _0x299598.modelId && _0x59ceb7 === _0x1cf79d) {
      return _0x1a82f9;
    }
    const _0x5b72a3 = {
      ..._0x1a82f9.args,
      model: _0x299598.modelId,
      provider: _0x1cf79d
    };
    if (Object.hasOwn(_0x1a82f9.args || {}, "modelId")) {
      _0x5b72a3.modelId = _0x299598.modelId;
    }
    _0x12d18d = true;
    _0x3eca5c.push({
      type: "explicit_model_default_applied",
      actionType: _0x1a82f9.type,
      alias: String(_0x1a82f9.alias || _0x1a82f9.as || ""),
      reference: _0x5864e7.reference,
      source: _0x424cf4.source,
      modelId: _0x299598.modelId,
      provider: _0x1cf79d,
      replacedModelId: _0x39eeca,
      reason: "explicit user model reference matched one disclosed context model"
    });
    return {
      ..._0x1a82f9,
      args: _0x5b72a3
    };
  });
  return {
    plan: _0x12d18d ? {
      ..._0x8e011a,
      actions: _0x33a0c9
    } : _0x8e011a,
    trace: _0x3eca5c
  };
}
function canonicalizePlanModelReferences(_0xf7c701, _0x4fe29d = {}) {
  if (!Array.isArray(_0xf7c701?.actions) || _0xf7c701.actions.length === 0) {
    return {
      plan: _0xf7c701,
      trace: []
    };
  }
  const _0x2f5475 = [];
  let _0xe9dfb4 = false;
  const _0x2b31ad = _0xf7c701.actions.map(_0x33ccfb => {
    if (_0x33ccfb.type !== "node.create" && _0x33ccfb.type !== "node.setModel" && _0x33ccfb.type !== "node.changeModel") {
      return _0x33ccfb;
    }
    const _0x4c8d32 = String(_0x33ccfb.args?.model || _0x33ccfb.args?.modelId || "").trim();
    if (!_0x4c8d32 || normalizeModelPlaceholder(_0x4c8d32)) {
      return _0x33ccfb;
    }
    const _0x36e9eb = _0x33ccfb.type === "node.create" ? CREATE_NODE_KINDS[String(_0x33ccfb.args?.type || "")] || "" : "";
    const _0x3b5101 = findContextModelByReference(_0x4fe29d, _0x4c8d32, {
      kind: _0x36e9eb
    });
    const _0x3e403e = _0x3b5101?.model || null;
    if (!_0x3e403e?.modelId || _0x4c8d32 === _0x3e403e.modelId) {
      return _0x33ccfb;
    }
    const _0x478c24 = {
      ..._0x33ccfb.args,
      model: _0x3e403e.modelId,
      provider: _0x3e403e.provider || String(_0x33ccfb.args?.provider || "").trim()
    };
    if (Object.hasOwn(_0x33ccfb.args || {}, "modelId")) {
      _0x478c24.modelId = _0x3e403e.modelId;
    }
    _0xe9dfb4 = true;
    _0x2f5475.push({
      type: "model_reference_canonicalized",
      actionType: _0x33ccfb.type,
      alias: String(_0x33ccfb.alias || _0x33ccfb.as || ""),
      source: _0x3b5101.source,
      modelId: _0x3e403e.modelId,
      provider: _0x3e403e.provider || "",
      reason: "planner model display name matched one disclosed context model"
    });
    return {
      ..._0x33ccfb,
      args: _0x478c24
    };
  });
  return {
    plan: _0xe9dfb4 ? {
      ..._0xf7c701,
      actions: _0x2b31ad
    } : _0xf7c701,
    trace: _0x2f5475
  };
}
const RUNTIME_GENERATION_NODE_TARGET_ACTIONS = new Set(["node.setPrompt", "node.appendPrompt", "node.setParams", "node.setModel", "node.changeModel", "generation.run"]);
function applyRuntimeNodeTargetDefaults(_0x35a342, {
  runtimeProvenance = {},
  commandContext = {}
} = {}) {
  if (!Array.isArray(_0x35a342?.actions) || _0x35a342.actions.length === 0) {
    return {
      plan: _0x35a342,
      trace: []
    };
  }
  const _0x4ac358 = getCommandState(commandContext);
  const _0x2cb535 = [...new Set((Array.isArray(runtimeProvenance.createdNodeIds) ? runtimeProvenance.createdNodeIds : []).map(_0x21768d => String(_0x21768d || "").trim()).filter(_0x719df5 => _0x719df5 && isAgentGenerationNode(_0x4ac358.nodes?.[_0x719df5])))];
  if (_0x2cb535.length !== 1) {
    return {
      plan: _0x35a342,
      trace: []
    };
  }
  const _0x3c493a = _0x2cb535[0];
  const _0x5931aa = [];
  let _0x346235 = false;
  const _0x275483 = _0x35a342.actions.map(_0x4e8e89 => {
    if (!RUNTIME_GENERATION_NODE_TARGET_ACTIONS.has(String(_0x4e8e89?.type || ""))) {
      return _0x4e8e89;
    }
    const _0x500f2b = String(_0x4e8e89?.args?.nodeId || "").trim();
    if (_0x500f2b && _0x4ac358.nodes?.[_0x500f2b]) {
      return _0x4e8e89;
    }
    _0x346235 = true;
    _0x5931aa.push({
      type: "runtime_target_default_applied",
      actionType: _0x4e8e89.type,
      nodeId: _0x3c493a,
      ...(_0x500f2b ? {
        requestedNodeId: _0x500f2b
      } : {}),
      reason: _0x500f2b ? "planner target was not found and one runtime-created generation node remains in scope" : "one runtime-created generation node remains in scope"
    });
    return {
      ..._0x4e8e89,
      args: {
        ...(_0x4e8e89.args || {}),
        nodeId: _0x3c493a
      }
    };
  });
  return {
    plan: _0x346235 ? {
      ..._0x35a342,
      actions: _0x275483
    } : _0x35a342,
    trace: _0x5931aa
  };
}
function applyNodeCreateTypeDefaults(_0x1559cd, _0x25756c = {}) {
  const _0x849937 = String(_0x25756c?.canvas?.modelCatalog?.targetKind || "").trim();
  const _0x4b9e14 = CREATE_NODE_TYPE_BY_KIND[_0x849937] || "";
  if (!_0x4b9e14 || !Array.isArray(_0x1559cd?.actions)) {
    return {
      plan: _0x1559cd,
      trace: []
    };
  }
  let _0x44905c = false;
  const _0xf9cad3 = [];
  const _0x150042 = _0x1559cd.actions.map(_0x259b04 => {
    if (_0x259b04.type !== "node.create" || String(_0x259b04.args?.type || "").trim()) {
      return _0x259b04;
    }
    _0x44905c = true;
    _0xf9cad3.push({
      type: "contextual_default_applied",
      field: "type",
      actionType: "node.create",
      value: _0x4b9e14,
      reason: "canvas model target kind is " + _0x849937
    });
    return {
      ..._0x259b04,
      args: {
        ..._0x259b04.args,
        type: _0x4b9e14
      }
    };
  });
  return {
    plan: _0x44905c ? {
      ..._0x1559cd,
      actions: _0x150042
    } : _0x1559cd,
    trace: _0xf9cad3
  };
}
function normalizeModelPlaceholder(_0x495900 = "") {
  const _0x4133c9 = String(_0x495900 || "").trim().toLowerCase();
  return !_0x4133c9 || _0x4133c9 === "auto" || _0x4133c9 === "default" || _0x4133c9 === "unknown";
}
function getSelectedInputKinds(_0x552789 = {}) {
  const _0x5563ce = Array.isArray(_0x552789?.canvas?.modelCatalog?.selectedInputKinds) ? _0x552789.canvas.modelCatalog.selectedInputKinds : [];
  const _0x28197d = Array.isArray(_0x552789?.canvas?.selectedNodes) ? _0x552789.canvas.selectedNodes : [];
  const _0x9fd961 = new Set(_0x5563ce.map(_0x50839f => String(_0x50839f || "")).filter(Boolean));
  for (const _0x5ba8c9 of _0x28197d) {
    const _0x3b5713 = String(_0x5ba8c9?.type || "");
    if (_0x3b5713.includes("image")) {
      _0x9fd961.add("image");
    }
    if (_0x3b5713.includes("video")) {
      _0x9fd961.add("video");
    }
    if (_0x3b5713.includes("audio")) {
      _0x9fd961.add("audio");
    }
    if (_0x3b5713.includes("text")) {
      _0x9fd961.add("text");
    }
  }
  return _0x9fd961;
}
function modelRequiresUnavailableInput(_0x5ccb9f = {}, _0x1bf49a = new Set()) {
  const _0x55e04a = _0x5ccb9f?.inputSlots && typeof _0x5ccb9f.inputSlots === "object" ? _0x5ccb9f.inputSlots : {};
  for (const [_0x2f2cfc, _0x110a4a] of Object.entries(_0x55e04a.minByKind || {})) {
    if (_0x2f2cfc !== "text" && Number(_0x110a4a) > 0 && !_0x1bf49a.has(_0x2f2cfc)) {
      return true;
    }
  }
  const _0x2cf5fa = Array.isArray(_0x55e04a.fixedSlots) ? _0x55e04a.fixedSlots : [];
  return _0x2cf5fa.some(_0x58f4d0 => {
    const _0x4771d5 = String(_0x58f4d0?.kind || "");
    return _0x4771d5 && _0x4771d5 !== "text" && _0x58f4d0?.required === true && !_0x1bf49a.has(_0x4771d5);
  });
}
function findHintCompatibleModel(_0x1c3810 = {}, _0x212348 = "", _0x34cfdd = {}) {
  const _0x44cdc7 = Array.isArray(_0x1c3810?.canvas?.availableModels) ? _0x1c3810.canvas.availableModels : [];
  const _0x40c72c = getSelectedInputKinds(_0x1c3810);
  return _0x44cdc7.filter(_0x191fba => _0x191fba?.modelId && String(_0x191fba.kind || "") === _0x212348 && !modelRequiresUnavailableInput(_0x191fba, _0x40c72c)).map(_0x4bb061 => {
    const _0x50f4e8 = buildSupportedAgentParamsFromHints(_0x4bb061, _0x34cfdd);
    return {
      model: _0x4bb061,
      supported: _0x50f4e8,
      score: _0x50f4e8.appliedParamIds.length
    };
  }).filter(_0x531652 => _0x531652.score > 0).sort((_0x3ec185, _0x35db0e) => {
    if (_0x35db0e.score !== _0x3ec185.score) {
      return _0x35db0e.score - _0x3ec185.score;
    }
    return String(_0x3ec185.model.modelId).localeCompare(String(_0x35db0e.model.modelId));
  })[0]?.model || null;
}
function applyContextualPlanDefaults(_0x3c291e, _0x204ca9 = {}) {
  const _0x1f6fb9 = findSelectedImageNodeId(_0x204ca9);
  const _0x476953 = _0x1f6fb9 ? findImageToVideoModel(_0x204ca9) : null;
  if (!_0x1f6fb9 || !_0x476953) {
    return {
      plan: _0x3c291e,
      trace: []
    };
  }
  const _0x1fd9e6 = new Map();
  const _0x2baaf2 = [];
  let _0x4d2188 = false;
  const _0x31d094 = [];
  for (const _0x317918 of _0x3c291e.actions) {
    let _0x51b305 = _0x317918;
    if (_0x317918.type === "node.create" && _0x317918.args?.type === "ai-video") {
      const _0x1101b7 = String(_0x317918.args.model || _0x317918.args.modelId || "").trim();
      const _0x39d0b9 = _0x1101b7 ? findContextModel(_0x204ca9, _0x1101b7) : null;
      const _0x2b9f97 = _0x39d0b9 || _0x476953;
      if ((!_0x1101b7 || !_0x39d0b9) && _0x2b9f97?.modelId) {
        _0x51b305 = {
          ..._0x317918,
          args: {
            ..._0x317918.args,
            model: _0x2b9f97.modelId,
            provider: _0x2b9f97.provider || ""
          }
        };
        _0x4d2188 = true;
        _0x31d094.push({
          type: "contextual_default_applied",
          field: "model",
          actionType: _0x317918.type,
          alias: String(_0x317918.alias || _0x317918.as || ""),
          selectedImageId: _0x1f6fb9,
          modelId: _0x2b9f97.modelId,
          provider: _0x2b9f97.provider || "",
          reason: _0x39d0b9 ? "requested model was available in context" : "selected image has compatible image-to-video model"
        });
      }
      if (_0x317918.alias && _0x2b9f97) {
        _0x1fd9e6.set(_0x317918.alias, getModelFieldIds(_0x2b9f97));
      }
    }
    if (_0x51b305.type === "node.setParams") {
      const _0x485fbe = getAliasNodeIdReference(_0x51b305.args?.nodeId);
      const _0x22f5b9 = _0x485fbe ? _0x1fd9e6.get(_0x485fbe) : null;
      const _0x30d987 = _0x51b305.args?.params && typeof _0x51b305.args.params === "object" && !Array.isArray(_0x51b305.args.params) ? _0x51b305.args.params : null;
      if (_0x22f5b9 && _0x30d987) {
        const _0x99393d = {};
        for (const [_0x10b683, _0x2a3a5d] of Object.entries(_0x30d987)) {
          if (_0x22f5b9.has(_0x10b683)) {
            _0x99393d[_0x10b683] = _0x2a3a5d;
          }
        }
        if (Object.keys(_0x99393d).length !== Object.keys(_0x30d987).length) {
          _0x4d2188 = true;
          _0x31d094.push({
            type: "params_filtered",
            actionType: _0x51b305.type,
            alias: _0x485fbe,
            keptParamIds: Object.keys(_0x99393d),
            removedParamIds: Object.keys(_0x30d987).filter(_0x539600 => !_0x22f5b9.has(_0x539600)),
            reason: "target model uiSchema does not declare removed params"
          });
          if (Object.keys(_0x99393d).length === 0) {
            continue;
          }
          _0x51b305 = {
            ..._0x51b305,
            args: {
              ..._0x51b305.args,
              params: _0x99393d
            }
          };
        }
      }
    }
    _0x2baaf2.push(_0x51b305);
  }
  return {
    plan: _0x4d2188 ? {
      ..._0x3c291e,
      actions: _0x2baaf2
    } : _0x3c291e,
    trace: _0x31d094
  };
}
function getActionParamAlias(_0x3a7cb2 = {}) {
  if (_0x3a7cb2.type === "node.setParams") {
    return getAliasNodeIdReference(_0x3a7cb2.args?.nodeId);
  } else {
    return "";
  }
}
function mergeParams(_0x21831b = {}, _0x3a43bf = {}) {
  return {
    ...getPlainObject(_0x21831b),
    ...getPlainObject(_0x3a43bf)
  };
}
function applyUserParameterHints(_0x2a80a1, _0x4693d4 = {}, {
  userMessage = ""
} = {}) {
  const _0x179a43 = extractAgentParameterHints(userMessage || _0x4693d4?.userMessage || _0x4693d4?.message || "");
  if (!_0x179a43.hasHints || !Array.isArray(_0x2a80a1.actions) || _0x2a80a1.actions.length === 0) {
    return {
      plan: _0x2a80a1,
      trace: []
    };
  }
  const _0x423c49 = new Set(_0x2a80a1.actions.map(getActionParamAlias).filter(Boolean));
  const _0x13f1f0 = new Map();
  const _0x33726a = [];
  const _0x550bb3 = [];
  let _0x2ad993 = false;
  for (const _0x195588 of _0x2a80a1.actions) {
    let _0x175452 = _0x195588;
    if (_0x195588.type === "node.create") {
      const _0x22812e = String(_0x195588.alias || "").trim();
      const _0x4be551 = CREATE_NODE_KINDS[String(_0x195588.args?.type || "")] || "";
      const _0x6b3466 = String(_0x195588.args?.model || _0x195588.args?.modelId || "").trim();
      let _0x57e01f = normalizeModelPlaceholder(_0x6b3466) ? null : findContextModel(_0x4693d4, _0x6b3466);
      if (!_0x57e01f && _0x4be551) {
        const _0x22d841 = findHintCompatibleModel(_0x4693d4, _0x4be551, _0x179a43);
        if (_0x22d841) {
          _0x57e01f = _0x22d841;
          _0x175452 = {
            ..._0x175452,
            args: {
              ..._0x175452.args,
              model: _0x22d841.modelId,
              provider: _0x22d841.provider || ""
            }
          };
          _0x2ad993 = true;
          _0x33726a.push({
            type: "parameter_hints_model_applied",
            actionType: _0x195588.type,
            alias: _0x22812e,
            modelId: _0x22d841.modelId,
            provider: _0x22d841.provider || "",
            reason: "user requested params selected compatible model"
          });
        }
      }
      if (_0x57e01f) {
        const _0x1f56bc = buildSupportedAgentParamsFromHints(_0x57e01f, _0x179a43);
        const _0x27d222 = getPlainObject(_0x1f56bc.params);
        if (Object.keys(_0x27d222).length > 0) {
          if (_0x22812e && _0x423c49.has(_0x22812e)) {
            _0x13f1f0.set(_0x22812e, _0x27d222);
          } else {
            _0x175452 = {
              ..._0x175452,
              args: {
                ..._0x175452.args,
                params: mergeParams(_0x175452.args?.params, _0x27d222)
              }
            };
            _0x2ad993 = true;
          }
          _0x33726a.push({
            type: "parameter_hints_applied",
            actionType: _0x195588.type,
            alias: _0x22812e,
            appliedParamIds: Object.keys(_0x27d222),
            params: _0x27d222,
            reason: "user requested supported generation params"
          });
        }
        if (_0x1f56bc.unsupportedParamIds.length > 0 && _0x1f56bc.appliedParamIds.length > 0) {
          _0x33726a.push({
            type: "parameter_hints_unsupported",
            actionType: _0x195588.type,
            alias: _0x22812e,
            unsupportedParamIds: _0x1f56bc.unsupportedParamIds,
            reason: "user requested params unsupported by target model"
          });
        }
      }
      _0x550bb3.push(_0x175452);
      continue;
    }
    if (_0x195588.type === "node.setParams") {
      const _0x28bbf4 = getActionParamAlias(_0x195588);
      const _0x20c62c = _0x28bbf4 ? _0x13f1f0.get(_0x28bbf4) : null;
      if (_0x20c62c) {
        _0x175452 = {
          ..._0x195588,
          args: {
            ..._0x195588.args,
            params: mergeParams(_0x195588.args?.params, _0x20c62c)
          }
        };
        _0x2ad993 = true;
      }
    }
    _0x550bb3.push(_0x175452);
  }
  return {
    plan: _0x2ad993 ? {
      ..._0x2a80a1,
      actions: _0x550bb3
    } : _0x2a80a1,
    trace: _0x33726a
  };
}
function applyActionCountHints(_0x4d4af1, {
  userMessage = ""
} = {}) {
  const _0x1fd650 = extractAgentDuplicateCountHint(userMessage);
  if (!_0x1fd650 || !Array.isArray(_0x4d4af1.actions)) {
    return {
      plan: _0x4d4af1,
      trace: []
    };
  }
  let _0x4e306b = false;
  const _0x3e0195 = [];
  const _0x2b4c9a = _0x4d4af1.actions.map(_0x35035a => {
    if (_0x35035a.type !== "node.duplicate" || Object.prototype.hasOwnProperty.call(_0x35035a.args || {}, "copies")) {
      return _0x35035a;
    }
    _0x4e306b = true;
    _0x3e0195.push({
      type: "action_count_hint_applied",
      actionType: _0x35035a.type,
      field: "copies",
      value: _0x1fd650,
      reason: "user requested an explicit duplicate count"
    });
    return {
      ..._0x35035a,
      args: {
        ..._0x35035a.args,
        copies: _0x1fd650
      }
    };
  });
  return {
    plan: _0x4e306b ? {
      ..._0x4d4af1,
      actions: _0x2b4c9a
    } : _0x4d4af1,
    trace: _0x3e0195
  };
}
function getCommandState(_0x346877 = {}) {
  const _0x3f1f7f = _0x346877.store || _0x346877.graphStore;
  return _0x3f1f7f?.getStateRaw?.() || _0x3f1f7f?.getState?.() || {};
}
function isAgentGenerationNode(_0x4e63a3 = {}) {
  return ["ai-image", "ai-video", "ai-audio", "ai-text"].includes(String(_0x4e63a3?.type || "").trim());
}
function applyCreatedGenerationBatchScope(_0x57537f, {
  userMessage = "",
  runtimeProvenance = {},
  commandContext = {}
} = {}) {
  const _0x5efd13 = extractAgentDuplicateCountHint(userMessage);
  if (!_0x5efd13 || !Array.isArray(_0x57537f?.actions)) {
    return {
      plan: _0x57537f,
      trace: []
    };
  }
  const _0x3a6879 = getCommandState(commandContext);
  const _0x237022 = Array.isArray(runtimeProvenance.createdNodeIds) ? runtimeProvenance.createdNodeIds.map(_0x389e3e => String(_0x389e3e || "").trim()).filter(Boolean) : [];
  const _0x1802ad = _0x237022.filter(_0x11f39f => isAgentGenerationNode(_0x3a6879.nodes?.[_0x11f39f]));
  if (_0x1802ad.length !== _0x5efd13 + 1) {
    return {
      plan: _0x57537f,
      trace: []
    };
  }
  const _0x2b49f1 = new Set(_0x1802ad);
  let _0x51b8fe = false;
  const _0x54fed5 = [];
  const _0x2cc99f = _0x57537f.actions.map(_0x3f8fc7 => {
    if (_0x3f8fc7.type !== "generation.runBatch") {
      return _0x3f8fc7;
    }
    const _0x244e6a = Array.isArray(_0x3f8fc7.args?.nodeIds) ? [...new Set(_0x3f8fc7.args.nodeIds.map(_0x3af755 => String(_0x3af755 || "").trim()).filter(Boolean))] : [];
    if (_0x244e6a.length !== _0x5efd13 || !_0x244e6a.every(_0x1f8fce => _0x2b49f1.has(_0x1f8fce))) {
      return _0x3f8fc7;
    }
    _0x51b8fe = true;
    _0x54fed5.push({
      type: "generation_scope_expanded",
      actionType: _0x3f8fc7.type,
      requestedNodeIds: _0x244e6a,
      nodeIds: _0x1802ad,
      reason: "created source and requested copies belong to one generation batch"
    });
    return {
      ..._0x3f8fc7,
      args: {
        ..._0x3f8fc7.args,
        nodeIds: _0x1802ad
      }
    };
  });
  return {
    plan: _0x51b8fe ? {
      ..._0x57537f,
      actions: _0x2cc99f
    } : _0x57537f,
    trace: _0x54fed5
  };
}
function isExplicitBlankNodeRequest(_0x1c15b0 = "") {
  return /(?:空白?|空的)(?:图片|图像|视频|音频|文本)?节点|\b(?:empty|blank)\s+(?:image|video|audio|text)?\s*node\b/i.test(String(_0x1c15b0 || ""));
}
function hasCreativeOutputIntent(_0x104391 = "") {
  return /(?:创建|生成|创作|制作|画).*(?:图片|图像|视频|音频|文本|产品图|商品图|海报|封面|插画|效果图|宣传图|拼贴)|生成|创作|制作|做成|产品图|商品图|海报|封面|插画|效果图|宣传图|拼贴|\b(?:generate|render|create|make)\b.*\b(?:image|video|audio|text|poster|cover|collage)\b/i.test(String(_0x104391 || ""));
}
function buildCreativePromptDefault(_0x2e6494 = "", _0x45dbe6 = "") {
  const _0xc647f3 = String(_0x2e6494 || "").replace(/\s+/g, " ").trim();
  const _0xc24c4c = matchExplicitUserModelDirective(_0xc647f3);
  const _0x5418d3 = _0xc24c4c ? _0xc24c4c.message.slice(_0xc24c4c.prefixLength).trim() : _0xc647f3;
  if (/产品图|商品图|product\s+(?:image|photo)/i.test(_0x5418d3)) {
    return "极简高级棚拍产品图，主体居中，干净背景，柔和轮廓光，商业摄影质感";
  }
  const _0x2c67eb = _0x5418d3.replace(/^(?:请|麻烦)?(?:帮我|给我)?(?:创建|生成|制作|创作|画)(?:一张|一个|一幅|一段)?\s*/i, "").replace(/[，,]?(?:然后|再|并)?(?:复制|拷贝).*$/i, "").replace(/[，,]?(?:然后|再|并)?做成拼贴.*$/i, "").replace(/[，,]?(?:然后|再|并)?(?:把|将)?(?:比例|宽高比|尺寸|时长|模型|分辨率).*$/i, "").replace(/[。！？!?]+$/g, "").trim();
  const _0x1d8be8 = _0x2c67eb || "符合当前创作需求的内容";
  const _0x5626d6 = {
    "ai-image": "主体明确，构图完整，光线自然，细节清晰",
    "ai-video": "画面连贯，主体稳定，运镜自然，细节清晰",
    "ai-audio": "层次清晰，音质干净，节奏自然",
    "ai-text": "结构清晰，表达准确，内容完整"
  };
  return _0x1d8be8 + "，" + (_0x5626d6[_0x45dbe6] || _0x5626d6["ai-image"]);
}
function applyCreativePromptDefaults(_0x45ae59, {
  userMessage = ""
} = {}) {
  const _0x1e2dc6 = String(userMessage || "").trim();
  if (!_0x1e2dc6 || !Array.isArray(_0x45ae59?.actions) || isExplicitBlankNodeRequest(_0x1e2dc6) || !hasCreativeOutputIntent(_0x1e2dc6)) {
    return {
      plan: _0x45ae59,
      trace: []
    };
  }
  let _0x34167b = false;
  const _0x44cd72 = [];
  const _0x524343 = _0x45ae59.actions.map(_0x2dd5a2 => {
    if (_0x2dd5a2.type !== "node.create") {
      return _0x2dd5a2;
    }
    const _0x353f44 = String(_0x2dd5a2.args?.type || "").trim();
    if (!["ai-image", "ai-video", "ai-audio", "ai-text"].includes(_0x353f44)) {
      return _0x2dd5a2;
    }
    const _0x5ba6c3 = String(_0x2dd5a2.args?.prompt || _0x2dd5a2.args?.nodeData?.prompt || _0x2dd5a2.args?.data?.prompt || "").trim();
    if (_0x5ba6c3) {
      return _0x2dd5a2;
    }
    _0x34167b = true;
    _0x44cd72.push({
      type: "creative_prompt_default_applied",
      actionType: _0x2dd5a2.type,
      nodeType: _0x353f44,
      reason: "planner omitted prompt for an explicit creative request"
    });
    return {
      ..._0x2dd5a2,
      args: {
        ..._0x2dd5a2.args,
        prompt: buildCreativePromptDefault(_0x1e2dc6, _0x353f44)
      }
    };
  });
  return {
    plan: _0x34167b ? {
      ..._0x45ae59,
      actions: _0x524343
    } : _0x45ae59,
    trace: _0x44cd72
  };
}
function buildRiskContext(_0x41d407 = {}) {
  return {
    createdNodeAliases: new Set(),
    createdEdgeAliases: new Set(),
    createdNodeIds: new Set(Array.isArray(_0x41d407.createdNodeIds) ? _0x41d407.createdNodeIds.map(_0x30a676 => String(_0x30a676 || "").trim()).filter(Boolean) : []),
    createdEdgeIds: new Set(Array.isArray(_0x41d407.createdEdgeIds) ? _0x41d407.createdEdgeIds.map(_0x4f59e7 => String(_0x4f59e7 || "").trim()).filter(Boolean) : [])
  };
}
function rememberActionAlias(_0x51819d = {}, _0x5344d9 = {}) {
  const _0x3c45df = String(_0x51819d.alias || "").trim();
  if (!_0x3c45df) {
    return;
  }
  if (_0x51819d.type === "node.create") {
    _0x5344d9.createdNodeAliases.add(_0x3c45df);
  }
  if (isSamePlanConnectionPreparation(_0x51819d, _0x5344d9)) {
    _0x5344d9.createdEdgeAliases.add(_0x3c45df);
  }
}
export function validateAgentPlan(_0x569429, {
  commandRegistry = canvasCommandRegistry,
  commandContext = {},
  agentContext = {},
  userMessage = "",
  traceRecorder = null,
  runtimeProvenance = {}
} = {}) {
  const _0x74a3fa = applyNodeCreateTypeDefaults(normalizeAgentPlan(_0x569429), agentContext);
  const _0x43565b = applyRuntimeNodeTargetDefaults(_0x74a3fa.plan, {
    runtimeProvenance: runtimeProvenance,
    commandContext: commandContext
  });
  const _0x469ee6 = applyExplicitUserModelDefaults(_0x43565b.plan, agentContext, {
    userMessage: userMessage
  });
  const _0x3ab48b = canonicalizePlanModelReferences(_0x469ee6.plan, agentContext);
  const _0x545f5a = applyContextualPlanDefaults(_0x3ab48b.plan, agentContext);
  const _0x51d376 = applyUserParameterHints(_0x545f5a.plan, agentContext, {
    userMessage: userMessage
  });
  const _0x15390e = applyActionCountHints(_0x51d376.plan, {
    userMessage: userMessage
  });
  const _0x6f383c = applyCreativePromptDefaults(_0x15390e.plan, {
    userMessage: userMessage
  });
  const _0x461609 = applyCreatedGenerationBatchScope(_0x6f383c.plan, {
    userMessage: userMessage,
    runtimeProvenance: runtimeProvenance,
    commandContext: commandContext
  });
  const _0xba17da = _0x461609.plan;
  for (const _0xbda510 of _0x74a3fa.trace) {
    traceRecorder?.(_0xbda510);
  }
  for (const _0x4fd900 of _0x43565b.trace) {
    traceRecorder?.(_0x4fd900);
  }
  for (const _0x1460a1 of _0x469ee6.trace) {
    traceRecorder?.(_0x1460a1);
  }
  for (const _0x3e099c of _0x3ab48b.trace) {
    traceRecorder?.(_0x3e099c);
  }
  for (const _0x2907c8 of _0x545f5a.trace) {
    traceRecorder?.(_0x2907c8);
  }
  for (const _0x562c3e of _0x51d376.trace) {
    traceRecorder?.(_0x562c3e);
  }
  for (const _0x382d2d of _0x15390e.trace) {
    traceRecorder?.(_0x382d2d);
  }
  for (const _0x162b77 of _0x6f383c.trace) {
    traceRecorder?.(_0x162b77);
  }
  for (const _0x5f36a6 of _0x461609.trace) {
    traceRecorder?.(_0x5f36a6);
  }
  if (_0xba17da.status === "failed") {
    return {
      ok: false,
      status: "failed",
      errorCode: "AGENT_PLAN_FAILED",
      message: _0xba17da.reply || "Agent planner failed.",
      plan: _0xba17da
    };
  }
  if (_0xba17da.status === "chat") {
    return {
      ok: true,
      status: "chat",
      riskLevel: "safe",
      plan: {
        ..._0xba17da,
        status: "chat",
        actions: [],
        requiresConfirmation: false
      }
    };
  }
  if (_0xba17da.status === "need_clarification") {
    const _0xf56608 = String(_0xba17da.question || _0xba17da.reply || "").trim();
    if (!_0xf56608) {
      return buildFailure("Clarification plans require question.", {
        plan: _0xba17da
      });
    }
    return {
      ok: true,
      status: "need_clarification",
      plan: {
        ..._0xba17da,
        question: _0xf56608
      },
      riskLevel: "safe"
    };
  }
  if (_0xba17da.actions.length === 0) {
    return buildFailure("Ready or confirmation plans require at least one action.", {
      plan: _0xba17da
    });
  }
  let _0x55f5d2 = "safe";
  const _0x55e33c = [];
  const _0x1f592d = buildRiskContext(runtimeProvenance);
  const _0x5aa332 = Array.isArray(agentContext?.commands) ? new Set(agentContext.commands.map(_0x5c3057 => String(_0x5c3057?.id || _0x5c3057 || "").trim()).filter(Boolean)) : null;
  for (const _0x231a20 of _0xba17da.actions) {
    const _0x2a1e38 = commandRegistry?.get?.(_0x231a20.type);
    if (!_0x2a1e38) {
      return {
        ok: false,
        status: "failed",
        errorCode: "UNKNOWN_AGENT_ACTION",
        message: "Unknown canvas command in agent plan: " + _0x231a20.type,
        plan: _0xba17da
      };
    }
    if (_0x5aa332 && !_0x5aa332.has(_0x231a20.type)) {
      return {
        ok: false,
        status: "failed",
        errorCode: "DEFERRED_AGENT_ACTION",
        message: "Canvas command was not disclosed for this agent turn: " + _0x231a20.type,
        plan: _0xba17da
      };
    }
    const {
      risk: _0x4d9ded,
      reason: _0x18e5b6
    } = getActionRisk(_0x231a20, _0x2a1e38, _0x1f592d);
    if (_0x4d9ded === "blocked") {
      return {
        ok: false,
        status: "failed",
        errorCode: "BLOCKED_AGENT_ACTION",
        message: "Blocked canvas command in agent plan: " + _0x231a20.type,
        plan: _0xba17da
      };
    }
    const _0x3b3985 = hasCanvasCommandPlanVariableReference(_0x231a20.args);
    if (!_0x3b3985 && typeof _0x2a1e38.validate === "function") {
      const _0x25cf88 = _0x2a1e38.validate(_0x231a20.args, commandContext);
      if (_0x25cf88?.ok === false) {
        return {
          ok: false,
          status: "failed",
          errorCode: _0x25cf88.errorCode || "ACTION_ARGS_INVALID",
          message: _0x25cf88.message || "Invalid args for " + _0x231a20.type,
          details: _0x25cf88.details,
          plan: _0xba17da
        };
      }
    }
    _0x55f5d2 = maxRisk(_0x55f5d2, _0x4d9ded);
    if (_0x4d9ded !== "safe" && _0x18e5b6) {
      traceRecorder?.({
        type: "action_risk_elevated",
        actionType: _0x231a20.type,
        riskLevel: _0x4d9ded,
        reason: _0x18e5b6
      });
    }
    const _0x13fd5d = {
      ..._0x231a20,
      riskLevel: _0x4d9ded,
      ...(_0x18e5b6 ? {
        riskReason: _0x18e5b6
      } : {})
    };
    _0x55e33c.push(_0x13fd5d);
    rememberActionAlias(_0x231a20, _0x1f592d);
  }
  const _0x388c8f = _0x55f5d2 === "confirm" || _0x55f5d2 === "danger";
  if (_0x388c8f) {
    const _0x31a177 = _0x55e33c.find(_0x80afa1 => String(_0x80afa1.riskLevel || "safe") !== "safe") || _0x55e33c[0] || null;
    traceRecorder?.({
      type: "confirmation_required",
      actionType: String(_0x31a177?.type || ""),
      riskLevel: _0x55f5d2,
      reason: _0x31a177?.riskReason || "action risk requires confirmation"
    });
    return {
      ok: true,
      status: "need_confirmation",
      riskLevel: _0x55f5d2,
      plan: {
        ..._0xba17da,
        status: "need_confirmation",
        requiresConfirmation: true,
        riskLevel: _0x55f5d2,
        actions: _0x55e33c
      }
    };
  }
  return {
    ok: true,
    status: "ready",
    riskLevel: _0x55f5d2,
    plan: {
      ..._0xba17da,
      status: "ready",
      requiresConfirmation: false,
      riskLevel: _0x55f5d2,
      actions: _0x55e33c
    }
  };
}