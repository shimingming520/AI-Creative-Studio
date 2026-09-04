import { canvasCommandRegistry } from "../canvasCommands/index.js";
import { buildAgentCanvasSummary } from "./agentCanvasSummary.js";
import { buildAgentReferenceContext } from "./agentReferenceContext.js";
import { routeAgentCapabilities } from "./agentCapabilityRouter.js";
import { listAgentSkillCatalog, selectAgentSkills } from "./agentSkillCatalog.js";
export const DEFAULT_AGENT_CONTEXT_BUDGET_CHARS = 36000;
export const MAX_EMPTY_CANVAS_CONTEXT_CHARS = 40000;
const AGENT_INPUT_REF_CONTEXT_LIMIT = 12;
const AGENT_SELECTED_NODE_DETAIL_LIMIT = 12;
function estimateJsonChars(_0x1341ec) {
  try {
    return JSON.stringify(_0x1341ec).length;
  } catch {
    return 0;
  }
}
function normalizeContextBudget(_0x271458) {
  const _0x3eff4d = Number(_0x271458);
  if (!Number.isFinite(_0x3eff4d) || _0x3eff4d <= 0) {
    return DEFAULT_AGENT_CONTEXT_BUDGET_CHARS;
  }
  return Math.trunc(_0x3eff4d);
}
function getModelLimitForBudget(_0x5788df) {
  if (_0x5788df <= 25000) {
    return 6;
  }
  if (_0x5788df <= 32000) {
    return 8;
  }
  return 10;
}
function summarizeWorkflowsFromModels(_0x5531fd = []) {
  return _0x5531fd.filter(_0x56b22d => _0x56b22d?.adapterType === "workflow").map(_0x3bcdee => ({
    modelId: _0x3bcdee.modelId,
    provider: _0x3bcdee.provider,
    kind: _0x3bcdee.kind,
    adapterType: _0x3bcdee.adapterType,
    executionId: _0x3bcdee.executionId,
    displayName: _0x3bcdee.displayName
  }));
}
function markCanvasCatalogTruncated(_0x416e70 = {}) {
  if (!_0x416e70.modelCatalog) {
    _0x416e70.modelCatalog = {};
  }
  _0x416e70.modelCatalog.truncated = true;
  _0x416e70.modelCatalog.includedModels = Array.isArray(_0x416e70.availableModels) ? _0x416e70.availableModels.length : 0;
}
function truncatePreviewText(_0x48ab8e, _0x16e8ec) {
  const _0x4442c5 = String(_0x48ab8e || "");
  if (_0x4442c5.length <= _0x16e8ec) {
    return _0x4442c5;
  }
  return _0x4442c5.slice(0, Math.max(0, _0x16e8ec - 3)) + "...";
}
function normalizeInputKind(_0x466b2d = "") {
  const _0x39ac6b = String(_0x466b2d || "").trim();
  if (_0x39ac6b.includes("image")) {
    return "image";
  }
  if (_0x39ac6b.includes("video")) {
    return "video";
  }
  if (_0x39ac6b.includes("audio")) {
    return "audio";
  }
  if (_0x39ac6b.includes("text")) {
    return "text";
  }
  return _0x39ac6b || "node";
}
function normalizeAgentInputRefs(_0xadf2cb = []) {
  if (!Array.isArray(_0xadf2cb)) {
    return [];
  }
  const _0x136cd5 = new Set();
  return _0xadf2cb.map((_0x8c3663 = {}) => {
    const _0x3a24e6 = String(_0x8c3663.nodeId || _0x8c3663.id || "").trim();
    if (!_0x3a24e6 || _0x136cd5.has(_0x3a24e6)) {
      return null;
    }
    _0x136cd5.add(_0x3a24e6);
    const _0x315d9f = String(_0x8c3663.type || "").trim();
    const _0x1e1061 = Number(_0x8c3663.width);
    const _0x56d824 = Number(_0x8c3663.height);
    const _0x41c855 = {
      nodeId: _0x3a24e6,
      id: _0x3a24e6,
      type: _0x315d9f,
      kind: String(_0x8c3663.kind || normalizeInputKind(_0x315d9f)).trim(),
      label: truncatePreviewText(_0x8c3663.label || _0x8c3663.name || _0x3a24e6, 80),
      source: String(_0x8c3663.source || "agent-panel").trim()
    };
    if (Number.isFinite(_0x1e1061) && _0x1e1061 > 0) {
      _0x41c855.width = Math.round(_0x1e1061);
    }
    if (Number.isFinite(_0x56d824) && _0x56d824 > 0) {
      _0x41c855.height = Math.round(_0x56d824);
    }
    return _0x41c855;
  }).filter(Boolean).slice(0, AGENT_INPUT_REF_CONTEXT_LIMIT);
}
function updateBudgetMetadata(_0x706fe9, _0x3d0d0f, _0x54d3e1 = false) {
  const _0x33652c = Array.isArray(_0x706fe9.commands) ? _0x706fe9.commands.every(_0xd16110 => _0xd16110?.argsSchema && typeof _0xd16110.argsSchema === "object" && _0xd16110.argsSchema.properties && typeof _0xd16110.argsSchema.properties === "object") : true;
  _0x706fe9.contextBudget = {
    maxChars: _0x3d0d0f,
    estimatedChars: 0,
    truncated: _0x54d3e1 === true || _0x706fe9.canvas?.modelCatalog?.truncated === true,
    availableModels: Array.isArray(_0x706fe9.canvas?.availableModels) ? _0x706fe9.canvas.availableModels.length : 0,
    commandSchemasRetained: _0x33652c,
    schemaIntegrity: _0x33652c,
    budgetExceeded: false
  };
  for (let _0x5ee0c1 = 0; _0x5ee0c1 < 3; _0x5ee0c1 += 1) {
    _0x706fe9.contextBudget.estimatedChars = estimateJsonChars(_0x706fe9);
  }
  _0x706fe9.contextBudget.budgetExceeded = _0x706fe9.contextBudget.estimatedChars > _0x3d0d0f;
  _0x706fe9.contextBudget.estimatedChars = estimateJsonChars(_0x706fe9);
  return _0x706fe9.contextBudget.estimatedChars;
}
function compactCommandDescription(_0x4c129f = {}) {
  return {
    id: _0x4c129f.id,
    riskLevel: _0x4c129f.riskLevel,
    argsSchema: _0x4c129f.argsSchema,
    capabilitySchema: _0x4c129f.capabilitySchema,
    returnSchema: _0x4c129f.returnSchema,
    returnAliasFields: _0x4c129f.returnAliasFields
  };
}
function getPinnedCanvasNodeIds(_0x121471 = {}) {
  const _0x1d4518 = new Set();
  const _0x4152f5 = _0x13298f => {
    const _0x44f086 = String(_0x13298f || "").trim();
    if (_0x44f086) {
      _0x1d4518.add(_0x44f086);
    }
  };
  (_0x121471.selectedNodes || []).slice(0, AGENT_SELECTED_NODE_DETAIL_LIMIT).forEach(_0x48ef9f => _0x4152f5(_0x48ef9f?.id || _0x48ef9f?.nodeId));
  (_0x121471.inputRefs || []).forEach(_0x28b03f => _0x4152f5(_0x28b03f?.nodeId || _0x28b03f?.id));
  (_0x121471.referenceContext?.referencedNodes || []).forEach(_0x19aec0 => _0x4152f5(_0x19aec0?.nodeId || _0x19aec0?.id));
  (_0x121471.referenceContext?.neighborNodes || []).forEach(_0x30be7f => _0x4152f5(_0x30be7f?.nodeId || _0x30be7f?.id));
  (_0x121471.referenceContext?.relatedEdges || []).forEach(_0x4ab498 => {
    _0x4152f5(_0x4ab498?.sourceId);
    _0x4152f5(_0x4ab498?.targetId);
  });
  (_0x121471.runningTasks || []).forEach(_0x6d325 => _0x4152f5(_0x6d325?.nodeId));
  (_0x121471.agentReferences?.recentCreatedNodeIds || []).forEach(_0x4152f5);
  return _0x1d4518;
}
function pruneCanvasGraph(_0x216bf7 = {}, _0x52a3ef = 30) {
  const _0x2c15aa = Array.isArray(_0x216bf7.nodes) ? _0x216bf7.nodes : [];
  const _0x529c5d = Array.isArray(_0x216bf7.edges) ? _0x216bf7.edges : [];
  const _0x4ffe52 = Array.isArray(_0x216bf7.selectedNodes) ? _0x216bf7.selectedNodes : [];
  const _0x5e3b7d = _0x4ffe52.slice(0, AGENT_SELECTED_NODE_DETAIL_LIMIT);
  const _0x2416b5 = getPinnedCanvasNodeIds(_0x216bf7);
  const _0x33f1ab = _0x2c15aa.filter(_0x20ef0c => _0x2416b5.has(String(_0x20ef0c?.id || "")));
  const _0x2be91 = _0x2c15aa.filter(_0xb2c6c6 => !_0x2416b5.has(String(_0xb2c6c6?.id || "")));
  const _0x1e30a1 = Math.max(_0x52a3ef, _0x33f1ab.length);
  const _0x105f63 = [..._0x33f1ab, ..._0x2be91.slice(0, Math.max(0, _0x1e30a1 - _0x33f1ab.length))];
  const _0x50a8f2 = new Set(_0x105f63.map(_0x290801 => String(_0x290801?.id || "")).filter(Boolean));
  const _0xe391f4 = _0x529c5d.filter(_0x263def => _0x50a8f2.has(String(_0x263def?.sourceId || "")) && _0x50a8f2.has(String(_0x263def?.targetId || "")));
  const _0x47a69d = Math.max(24, _0x1e30a1 * 3);
  const _0x4d596b = _0xe391f4.slice(0, _0x47a69d);
  const _0xfe6852 = Number(_0x216bf7.graphCatalog?.totalNodes ?? _0x2c15aa.length);
  const _0x75710c = Number(_0x216bf7.graphCatalog?.totalEdges ?? _0x529c5d.length);
  const _0x4d4435 = _0x105f63.length < _0x2c15aa.length || _0x4d596b.length < _0x529c5d.length || _0x5e3b7d.length < _0x4ffe52.length;
  if (!_0x4d4435) {
    return false;
  }
  _0x216bf7.nodes = _0x105f63;
  _0x216bf7.edges = _0x4d596b;
  _0x216bf7.selectedNodes = _0x5e3b7d;
  if (_0x5e3b7d.length < _0x4ffe52.length) {
    _0x216bf7.selectionCatalog = {
      totalSelected: _0x4ffe52.length,
      includedSelectedNodeDetails: _0x5e3b7d.length,
      selectedNodeIdsRetained: Array.isArray(_0x216bf7.selectedNodeIds) ? _0x216bf7.selectedNodeIds.length : 0,
      truncated: true
    };
  }
  _0x216bf7.graphCatalog = {
    totalNodes: _0xfe6852,
    totalEdges: _0x75710c,
    includedNodes: _0x105f63.length,
    includedEdges: _0x4d596b.length,
    pinnedNodes: _0x33f1ab.length,
    truncated: true
  };
  return true;
}
function enforceContextBudget(_0x3c08a3, _0x1e46f0) {
  let _0x527a34 = updateBudgetMetadata(_0x3c08a3, _0x1e46f0);
  let _0x3ab2bc = _0x3c08a3.contextBudget.truncated;
  const _0x519e88 = _0x3c08a3.canvas || {};
  for (const _0x276239 of [60, 30, 12]) {
    if (_0x527a34 <= _0x1e46f0) {
      break;
    }
    if (!pruneCanvasGraph(_0x519e88, _0x276239)) {
      continue;
    }
    _0x3ab2bc = true;
    _0x527a34 = updateBudgetMetadata(_0x3c08a3, _0x1e46f0, _0x3ab2bc);
  }
  for (const _0x14dd52 of [14, 10, 6]) {
    if (_0x527a34 <= _0x1e46f0) {
      break;
    }
    if (!Array.isArray(_0x519e88.availableModels) || _0x519e88.availableModels.length <= _0x14dd52) {
      continue;
    }
    _0x519e88.availableModels = _0x519e88.availableModels.slice(0, _0x14dd52);
    _0x519e88.availableWorkflows = summarizeWorkflowsFromModels(_0x519e88.availableModels);
    markCanvasCatalogTruncated(_0x519e88);
    _0x3ab2bc = true;
    _0x527a34 = updateBudgetMetadata(_0x3c08a3, _0x1e46f0, _0x3ab2bc);
  }
  for (const _0x677ccd of [10, 5, 0]) {
    if (_0x527a34 <= _0x1e46f0) {
      break;
    }
    if (!Array.isArray(_0x519e88.recentCommands) || _0x519e88.recentCommands.length <= _0x677ccd) {
      continue;
    }
    _0x519e88.recentCommands = _0x519e88.recentCommands.slice(-_0x677ccd);
    _0x3ab2bc = true;
    _0x527a34 = updateBudgetMetadata(_0x3c08a3, _0x1e46f0, _0x3ab2bc);
  }
  for (const _0x35a11e of [240, 120, 60]) {
    if (_0x527a34 <= _0x1e46f0) {
      break;
    }
    if (!Array.isArray(_0x519e88.nodes) || _0x519e88.nodes.length === 0) {
      continue;
    }
    _0x519e88.nodes = _0x519e88.nodes.map(_0x258b70 => ({
      ..._0x258b70,
      promptPreview: truncatePreviewText(_0x258b70.promptPreview, _0x35a11e),
      contentPreview: truncatePreviewText(_0x258b70.contentPreview, _0x35a11e)
    }));
    _0x3ab2bc = true;
    _0x527a34 = updateBudgetMetadata(_0x3c08a3, _0x1e46f0, _0x3ab2bc);
  }
  if (_0x527a34 > _0x1e46f0 && Array.isArray(_0x3c08a3.commands)) {
    _0x3c08a3.commands = _0x3c08a3.commands.map(compactCommandDescription);
    _0x3ab2bc = true;
    _0x527a34 = updateBudgetMetadata(_0x3c08a3, _0x1e46f0, _0x3ab2bc);
  }
  for (const _0x253996 of [3, 1, 0]) {
    if (_0x527a34 <= _0x1e46f0) {
      break;
    }
    if (!Array.isArray(_0x519e88.availableModels) || _0x519e88.availableModels.length <= _0x253996) {
      continue;
    }
    _0x519e88.availableModels = _0x519e88.availableModels.slice(0, _0x253996);
    _0x519e88.availableWorkflows = summarizeWorkflowsFromModels(_0x519e88.availableModels);
    markCanvasCatalogTruncated(_0x519e88);
    _0x3ab2bc = true;
    _0x527a34 = updateBudgetMetadata(_0x3c08a3, _0x1e46f0, _0x3ab2bc);
  }
  if (_0x527a34 > _0x1e46f0 && Array.isArray(_0x3c08a3.skillCatalog?.available)) {
    _0x3c08a3.skillCatalog.available = _0x3c08a3.skillCatalog.available.map(_0x1dbfde => ({
      id: _0x1dbfde.id,
      title: _0x1dbfde.title,
      category: _0x1dbfde.category
    }));
    _0x3ab2bc = true;
    _0x527a34 = updateBudgetMetadata(_0x3c08a3, _0x1e46f0, _0x3ab2bc);
  }
  updateBudgetMetadata(_0x3c08a3, _0x1e46f0, _0x3ab2bc);
  return _0x3c08a3;
}
export function buildAgentContext({
  store: _0x763d10,
  commandRegistry = canvasCommandRegistry,
  sessionStore = null,
  recentCommands = undefined,
  userMessage = "",
  intent = null,
  targetKind = "",
  inputRefs = [],
  contextBudgetChars = DEFAULT_AGENT_CONTEXT_BUDGET_CHARS,
  modelLimit = undefined,
  disclosedCommandIds = [],
  disclosedModelIds = []
} = {}) {
  const _0x3175a8 = normalizeContextBudget(contextBudgetChars);
  const _0x58f788 = normalizeAgentInputRefs(inputRefs);
  const _0x22ecec = typeof commandRegistry?.list === "function" ? commandRegistry.list() : [];
  const _0x423014 = recentCommands !== undefined ? recentCommands : sessionStore?.getRecentCommands?.() || [];
  const _0x2b875c = buildAgentCanvasSummary({
    store: _0x763d10,
    recentCommands: _0x423014,
    userMessage: userMessage,
    intent: intent,
    targetKind: targetKind,
    inputRefs: _0x58f788,
    modelLimit: modelLimit ?? getModelLimitForBudget(_0x3175a8),
    disclosedModelIds: disclosedModelIds
  });
  _0x2b875c.agentReferences = buildAgentReferenceContext({
    canvas: _0x2b875c,
    operationLedger: sessionStore?.getOperationLedger?.() || []
  });
  const _0x275841 = selectAgentSkills({
    userMessage: userMessage,
    targetKind: _0x2b875c.modelCatalog?.targetKind,
    selectedInputKinds: _0x2b875c.modelCatalog?.selectedInputKinds
  });
  const _0x5d0714 = new Set(_0x22ecec.map(_0x2a5134 => String(_0x2a5134?.id || "").trim()).filter(Boolean));
  const _0x498595 = _0x275841.filter(_0x2c1159 => _0x2c1159.commands.every(_0x51967a => _0x5d0714.has(_0x51967a)));
  const _0x21e642 = routeAgentCapabilities({
    commands: _0x22ecec,
    skills: _0x498595,
    userMessage: userMessage,
    intent: intent,
    targetKind: _0x2b875c.modelCatalog?.targetKind,
    requiredCommandIds: disclosedCommandIds
  });
  const _0x151588 = _0x21e642.catalog.selectedNamespaces.includes("generation") || Boolean(_0x2b875c.modelCatalog?.targetKind) && _0x21e642.commands.some(_0x1319f2 => ["node.setModel", "node.changeModel", "node.setParams", "generation.run"].includes(_0x1319f2.id));
  if (!_0x151588) {
    _0x2b875c.availableModels = [];
    _0x2b875c.availableWorkflows = [];
    if (_0x2b875c.modelCatalog) {
      _0x2b875c.modelCatalog.includedModels = 0;
      _0x2b875c.modelCatalog.truncated = _0x2b875c.modelCatalog.totalMatched > 0;
    }
  }
  const _0x3d857c = listAgentSkillCatalog();
  const _0x6b4b = _0x498595.map(_0x5b53fa => _0x5b53fa.id);
  const _0x5c8076 = new Set(_0x6b4b);
  const _0x502e4a = {
    schemaVersion: 1,
    canvas: _0x2b875c,
    commands: _0x21e642.commands,
    skills: _0x498595,
    capabilityRouting: _0x21e642.catalog,
    skillCatalog: {
      mode: "progressive",
      includedSkillIds: _0x6b4b,
      deferredSkillIds: _0x3d857c.map(_0x26426f => _0x26426f.id).filter(_0x5cc914 => !_0x5c8076.has(_0x5cc914)),
      available: _0x3d857c,
      totalAvailable: _0x3d857c.length
    },
    policies: {
      actionPlanOnly: true,
      skillsProduceActionPlansOnly: true,
      progressiveCapabilityDisclosure: true,
      commandSchemasProtected: true,
      noDomAccess: true,
      noArbitraryStoreWrites: true,
      noDirectNetwork: true,
      noElectronAccess: true,
      batchConfirmThreshold: 5
    }
  };
  _0x502e4a.canvas.inputRefs = _0x58f788;
  return enforceContextBudget(_0x502e4a, _0x3175a8);
}