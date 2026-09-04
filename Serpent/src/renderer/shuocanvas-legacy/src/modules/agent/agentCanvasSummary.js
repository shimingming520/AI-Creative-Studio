import { getExecutionManifest, listModelManifests, resolveModelExecution } from "../../manifests/index.js";
import { buildCanvasSummary } from "../canvasCommands/graphCommands.js";
import { normalizeAgentSearchKey, normalizeAgentSearchText } from "./agentCapabilityDiscovery.js";
const DEFAULT_PROMPT_PREVIEW_LIMIT = 500;
const REFERENCE_PROMPT_PREVIEW_LIMIT = 180;
const DEFAULT_MODEL_LIMIT = 22;
const NO_INTENT_MODEL_LIMIT = 12;
const MODEL_KINDS = new Set(["image", "video", "audio", "text"]);
const NODE_TYPE_KIND_HINTS = Object.freeze({
  "ai-image": "image",
  "source-image": "image",
  storyboard: "image",
  "ai-video": "video",
  "source-video": "video",
  "media-clip": "video",
  "ai-audio": "audio",
  "source-audio": "audio",
  "ai-text": "text",
  "source-text": "text",
  "comment-note": "text",
  "storyboard-script": "text"
});
const MESSAGE_KIND_PATTERNS = Object.freeze({
  image: Object.freeze([/\bimage\b/i, /\bpicture\b/i, /\bphoto\b/i, /\bposter\b/i, /\bthumbnail\b/i, /\billustration\b/i, /[\u56fe\u5716]\u7247/, /\u56fe\u50cf/, /\u7167\u7247/, /\u6d77\u62a5/, /\u5c01\u9762/, /(?:\u4ea7\u54c1\u56fe|\u5546\u54c1\u56fe|\u6548\u679c\u56fe|\u6982\u5ff5\u56fe)/, /(?:\u4f5c\u56fe|\u7ed8\u56fe|\u5e2e\u6211\u753b|\u8bf7(?:\u5e2e\u6211)?\u753b|\u753b(?:\u4e00|\u4e2a|\u5f20|\u5e45|\u53ea))/]),
  video: Object.freeze([/\bvideo\b/i, /\bmovie\b/i, /\bfilm\b/i, /\banimation\b/i, /\banimate\b/i, /\bclip\b/i, /\u89c6\u9891/, /\u5f71\u7247/, /\u52a8\u753b/, /\u8fd0\u955c/]),
  audio: Object.freeze([/\baudio\b/i, /\bvoice\b/i, /\bspeech\b/i, /\bsound\b/i, /\bmusic\b/i, /\u97f3\u9891/, /\u58f0\u97f3/, /\u914d\u97f3/, /\u97f3\u4e50/]),
  text: Object.freeze([/\btext\b/i, /\bcopy\b/i, /\bscript\b/i, /\bprompt\b/i, /\bstoryboard\b/i, /\u6587\u672c/, /\u6587\u5b57/, /\u811a\u672c/, /\u5206\u955c/, /\u63d0\u793a\u8bcd/, /\u6587\u6848/])
});
const MESSAGE_KIND_PRIORITY = Object.freeze({
  video: 4,
  image: 3,
  audio: 2,
  text: 1
});
function truncate(_0xd1141d, _0x2b519f = DEFAULT_PROMPT_PREVIEW_LIMIT) {
  const _0x457246 = String(_0xd1141d || "").replace(/<[^>]*>/g, " ").replace(/data:[^\s"'<>)]{20,}/gi, "[omitted-data-url]").replace(/[A-Za-z0-9+/]{120,}={0,2}/g, "[omitted-base64]").replace(/\s+/g, " ").trim();
  if (_0x457246.length <= _0x2b519f) {
    return _0x457246;
  }
  return _0x457246.slice(0, Math.max(0, _0x2b519f - 3)) + "...";
}
function normalizeKind(_0x49ea93) {
  const _0x37de72 = String(_0x49ea93 || "").trim().toLowerCase();
  if (MODEL_KINDS.has(_0x37de72)) {
    return _0x37de72;
  } else {
    return "";
  }
}
function normalizeStringArray(_0x1b2f3c) {
  if (!Array.isArray(_0x1b2f3c)) {
    return [];
  }
  const _0x26f1a6 = [];
  const _0x19a572 = new Set();
  for (const _0x2df6d7 of _0x1b2f3c) {
    const _0x9d16ad = String(_0x2df6d7 || "").trim();
    if (!_0x9d16ad || _0x19a572.has(_0x9d16ad)) {
      continue;
    }
    _0x26f1a6.push(_0x9d16ad);
    _0x19a572.add(_0x9d16ad);
  }
  return _0x26f1a6;
}
function nodeTypeToInputKind(_0x1a8683 = "") {
  return NODE_TYPE_KIND_HINTS[String(_0x1a8683 || "").trim()] || "";
}
function getSelectedInputKinds(_0x4133f2 = []) {
  return new Set(_0x4133f2.map(_0x306164 => nodeTypeToInputKind(_0x306164?.type)).filter(Boolean));
}
function getManifestUiFieldIds(_0x2b118b) {
  return new Set((Array.isArray(_0x2b118b?.uiSchema?.fields) ? _0x2b118b.uiSchema.fields : []).map(_0x4f276e => String(_0x4f276e?.id || "").trim()).filter(Boolean));
}
function getManifestInputSlots(_0x48b3bd) {
  if (_0x48b3bd?.inputSlots && typeof _0x48b3bd.inputSlots === "object") {
    return _0x48b3bd.inputSlots;
  } else {
    return {};
  }
}
function manifestAllowsInputKind(_0x25a443, _0x2e6206) {
  const _0x26ec52 = getManifestInputSlots(_0x25a443);
  const _0x369af8 = normalizeStringArray(_0x26ec52.allowedKinds);
  if (_0x369af8.includes(_0x2e6206)) {
    return true;
  }
  const _0x45d970 = Number(_0x26ec52.maxByKind?.[_0x2e6206]);
  if (Number.isFinite(_0x45d970) && _0x45d970 > 0) {
    return true;
  }
  const _0x5f3432 = Array.isArray(_0x26ec52.fixedSlots) ? _0x26ec52.fixedSlots : [];
  return _0x5f3432.some(_0x3df31f => String(_0x3df31f?.kind || "") === _0x2e6206);
}
function getRequiredInputKinds(_0x1910f9) {
  const _0x3dde7e = getManifestInputSlots(_0x1910f9);
  const _0x119de0 = new Set();
  for (const [_0x46196a, _0x38d728] of Object.entries(_0x3dde7e.minByKind || {})) {
    if (Number(_0x38d728) > 0 && _0x46196a !== "text") {
      _0x119de0.add(_0x46196a);
    }
  }
  for (const _0x1dfe61 of Array.isArray(_0x3dde7e.fixedSlots) ? _0x3dde7e.fixedSlots : []) {
    const _0x1e71f4 = String(_0x1dfe61?.kind || "");
    if (_0x1e71f4 && _0x1e71f4 !== "text" && _0x1dfe61?.required === true) {
      _0x119de0.add(_0x1e71f4);
    }
  }
  return _0x119de0;
}
function scoreSelectedInputCompatibility(_0x5eea21, {
  selectedInputKinds = new Set(),
  targetKind = "",
  userMessage = ""
} = {}) {
  if (!targetKind || selectedInputKinds.size === 0) {
    return 0;
  }
  let _0x3b34cc = 0;
  for (const _0x5710f7 of selectedInputKinds) {
    _0x3b34cc += manifestAllowsInputKind(_0x5eea21, _0x5710f7) ? 180 : -120;
  }
  for (const _0x59cdae of getRequiredInputKinds(_0x5eea21)) {
    if (!selectedInputKinds.has(_0x59cdae)) {
      _0x3b34cc -= 420;
    }
  }
  if (targetKind === "video" && selectedInputKinds.has("image")) {
    const _0x80f521 = getManifestUiFieldIds(_0x5eea21);
    if (_0x80f521.has("duration") && /\d+\s*(?:s|sec|second|seconds|\u79d2)/i.test(userMessage)) {
      _0x3b34cc += 35;
    }
    if (_0x80f521.has("aspectRatio") && /(?:16:9|9:16|1:1|aspect|ratio|\u6bd4\u4f8b)/i.test(userMessage)) {
      _0x3b34cc += 20;
    }
  }
  return _0x3b34cc;
}
function compactObject(_0x2faa7d, {
  maxKeys = 12,
  maxArrayItems = 8,
  maxString = 160,
  depth = 0
} = {}) {
  if (_0x2faa7d == null) {
    return _0x2faa7d;
  }
  if (typeof _0x2faa7d === "string") {
    return truncate(_0x2faa7d, maxString);
  }
  if (typeof _0x2faa7d !== "object") {
    return _0x2faa7d;
  }
  if (depth >= 2) {
    if (Array.isArray(_0x2faa7d)) {
      return "[array:" + _0x2faa7d.length + "]";
    }
    return "[object]";
  }
  if (Array.isArray(_0x2faa7d)) {
    return _0x2faa7d.slice(0, maxArrayItems).map(_0x498d68 => compactObject(_0x498d68, {
      maxKeys: maxKeys,
      maxArrayItems: maxArrayItems,
      maxString: maxString,
      depth: depth + 1
    }));
  }
  const _0x39031d = Object.entries(_0x2faa7d).filter(([, _0x5087bb]) => _0x5087bb !== undefined);
  const _0x6b3d76 = {};
  for (const [_0x460554, _0x3742c4] of _0x39031d.slice(0, maxKeys)) {
    _0x6b3d76[_0x460554] = compactObject(_0x3742c4, {
      maxKeys: maxKeys,
      maxArrayItems: maxArrayItems,
      maxString: maxString,
      depth: depth + 1
    });
  }
  if (_0x39031d.length > maxKeys) {
    _0x6b3d76._truncatedKeys = _0x39031d.length - maxKeys;
  }
  return _0x6b3d76;
}
function normalizeViewport(_0x1026de = {}) {
  return {
    x: Number.isFinite(Number(_0x1026de.x)) ? Number(_0x1026de.x) : 0,
    y: Number.isFinite(Number(_0x1026de.y)) ? Number(_0x1026de.y) : 0,
    zoom: Number.isFinite(Number(_0x1026de.zoom)) ? Number(_0x1026de.zoom) : 1
  };
}
function compactPlanningValue(_0x3ecad8, {
  key = ""
} = {}) {
  if (_0x3ecad8 == null || typeof _0x3ecad8 === "number" || typeof _0x3ecad8 === "boolean") {
    return _0x3ecad8;
  }
  if (typeof _0x3ecad8 === "string") {
    return truncate(_0x3ecad8, key === "description" ? 180 : 240);
  }
  if (Array.isArray(_0x3ecad8)) {
    return _0x3ecad8.map(_0x221b3d => compactPlanningValue(_0x221b3d, {
      key: key
    }));
  }
  if (typeof _0x3ecad8 !== "object") {
    return _0x3ecad8;
  }
  return Object.fromEntries(Object.entries(_0x3ecad8).map(([_0x5df970, _0x4da2b5]) => [_0x5df970, compactPlanningValue(_0x4da2b5, {
    key: _0x5df970
  })]));
}
const MODEL_FIELD_PLANNING_KEYS = Object.freeze(["variant", "description", "min", "max", "step", "placeholder", "allowEmpty", "randomSeedMin", "randomSeedMax", "defaultValueAliases", "showWhen", "hideWhen", "disabled", "readOnly", "modeField", "defaultModeValue", "customModeValue"]);
function summarizeModelField(_0x564f9b = {}, {
  optionLimit = 40
} = {}) {
  const _0xadc2ed = {
    id: String(_0x564f9b?.id || ""),
    type: String(_0x564f9b?.type || ""),
    label: String(_0x564f9b?.label || _0x564f9b?.id || ""),
    defaultValue: _0x564f9b?.defaultValue,
    displayRole: String(_0x564f9b?.displayRole || ""),
    options: Array.isArray(_0x564f9b?.options) ? _0x564f9b.options.slice(0, optionLimit).map(_0x184914 => {
      if (!_0x184914 || typeof _0x184914 !== "object") {
        return {
          value: _0x184914,
          label: String(_0x184914 || "")
        };
      }
      return {
        value: _0x184914.value,
        label: String(_0x184914.label || _0x184914.value || ""),
        ...(_0x184914.selectedLabel ? {
          selectedLabel: String(_0x184914.selectedLabel)
        } : {}),
        ...(_0x184914.displayLabel ? {
          displayLabel: String(_0x184914.displayLabel)
        } : {}),
        ...(_0x184914.disabled === true ? {
          disabled: true
        } : {}),
        ...(_0x184914.hidden === true ? {
          hidden: true
        } : {})
      };
    }) : undefined
  };
  for (const _0x4b53c5 of MODEL_FIELD_PLANNING_KEYS) {
    if (_0x564f9b[_0x4b53c5] === undefined) {
      continue;
    }
    _0xadc2ed[_0x4b53c5] = _0x4b53c5 === "description" ? truncate(_0x564f9b[_0x4b53c5], 180) : compactObject(_0x564f9b[_0x4b53c5], {
      maxKeys: 12,
      maxArrayItems: 16,
      maxString: 180
    });
  }
  return _0xadc2ed;
}
function summarizeModel(_0x29fe3f, {
  fieldLimit = 24,
  optionLimit = 40
} = {}) {
  const _0x5aa6b8 = getExecutionManifest(_0x29fe3f?.executionId);
  const _0x377ebd = Array.isArray(_0x29fe3f?.uiSchema?.fields) ? _0x29fe3f.uiSchema.fields : [];
  return {
    modelId: String(_0x29fe3f?.modelId || ""),
    provider: String(_0x29fe3f?.provider || ""),
    kind: String(_0x29fe3f?.kind || ""),
    adapterType: String(_0x29fe3f?.adapterType || _0x5aa6b8?.adapterType || ""),
    displayName: String(_0x29fe3f?.displayName || _0x29fe3f?.modelId || ""),
    inputSlots: compactPlanningValue(_0x29fe3f?.inputSlots || {}),
    outputType: String(_0x29fe3f?.outputType || ""),
    vip: _0x29fe3f?.vip === true,
    async: _0x29fe3f?.async === true,
    cancellable: _0x29fe3f?.cancellable === true,
    detailLevel: _0x377ebd.length <= fieldLimit ? "full" : "truncated",
    uiSchema: {
      fieldCount: _0x377ebd.length,
      includedFieldCount: Math.min(_0x377ebd.length, fieldLimit),
      fields: _0x377ebd.slice(0, fieldLimit).map(_0x1d7864 => summarizeModelField(_0x1d7864, {
        optionLimit: optionLimit
      }))
    }
  };
}
function summarizeWorkflow(_0xf8fac) {
  return {
    modelId: _0xf8fac.modelId,
    provider: _0xf8fac.provider,
    kind: _0xf8fac.kind,
    adapterType: _0xf8fac.adapterType,
    displayName: _0xf8fac.displayName
  };
}
function summarizeTaskNode(_0x4ddac4 = {}) {
  const _0xb69991 = String(_0x4ddac4.jobStatus || _0x4ddac4.storyboardScript?.jobStatus || (_0x4ddac4.isGenerating ? "running" : "idle"));
  if (_0xb69991 !== "running" && _0xb69991 !== "pending") {
    return null;
  }
  return {
    nodeId: String(_0x4ddac4.id || ""),
    type: String(_0x4ddac4.type || ""),
    model: String(_0x4ddac4.model || ""),
    provider: String(_0x4ddac4.provider || ""),
    jobStatus: _0xb69991,
    taskId: String(_0x4ddac4.taskId || _0x4ddac4.rhTaskId || _0x4ddac4.asyncTaskId || "")
  };
}
function getSelectedNodes(_0x340e10 = {}, _0x50d09b = {}) {
  const _0x124331 = Array.isArray(_0x50d09b.selectedNodeIds) ? _0x50d09b.selectedNodeIds : Array.isArray(_0x340e10.selectedNodeIds) ? _0x340e10.selectedNodeIds : [];
  return _0x124331.map(_0x19e067 => _0x340e10.nodes?.[_0x19e067]).filter(Boolean);
}
function getSelectedNodeTypes(_0x2994c9 = []) {
  return normalizeStringArray(_0x2994c9.map(_0x266d30 => _0x266d30?.type));
}
function getInputRefSelectedNodes(_0x1d1999 = [], _0x4bba6d = {}) {
  if (!Array.isArray(_0x1d1999)) {
    return [];
  }
  return _0x1d1999.map((_0x148e62 = {}) => {
    const _0x321c60 = String(_0x148e62.nodeId || _0x148e62.id || "").trim();
    if (!_0x321c60) {
      return null;
    }
    const _0x5020b5 = _0x4bba6d.nodes?.[_0x321c60];
    if (_0x5020b5) {
      return _0x5020b5;
    }
    const _0x2b46b6 = String(_0x148e62.type || "").trim() || "source-" + String(_0x148e62.kind || "node");
    return {
      id: _0x321c60,
      type: _0x2b46b6,
      name: String(_0x148e62.label || _0x148e62.name || _0x321c60).trim(),
      width: Number(_0x148e62.width) || undefined,
      height: Number(_0x148e62.height) || undefined
    };
  }).filter(Boolean);
}
function resolveNodeKind(_0x3851d5 = {}) {
  if (!_0x3851d5 || typeof _0x3851d5 !== "object") {
    return "";
  }
  return resolveSelectedNodeModelKind(_0x3851d5) || NODE_TYPE_KIND_HINTS[String(_0x3851d5?.type || "").trim()] || "";
}
function isMaterialNodeSummary(_0x294c03 = {}) {
  return MODEL_KINDS.has(resolveNodeKind(_0x294c03));
}
function summarizeReferenceInputRef(_0x4801b1 = {}) {
  const _0x4482fa = String(_0x4801b1.nodeId || _0x4801b1.id || "").trim();
  if (!_0x4482fa) {
    return null;
  }
  const _0x195df9 = String(_0x4801b1.type || "").trim();
  const _0x189fac = normalizeKind(_0x4801b1.kind) || nodeTypeToInputKind(_0x195df9);
  const _0x54b6bb = {
    nodeId: _0x4482fa,
    id: _0x4482fa,
    type: _0x195df9,
    kind: _0x189fac,
    label: truncate(_0x4801b1.label || _0x4801b1.name || _0x4482fa, 80),
    source: String(_0x4801b1.source || "agent-panel").trim()
  };
  const _0x380a8f = Number(_0x4801b1.width);
  const _0x28ceb0 = Number(_0x4801b1.height);
  if (Number.isFinite(_0x380a8f) && _0x380a8f > 0) {
    _0x54b6bb.width = Math.round(_0x380a8f);
  }
  if (Number.isFinite(_0x28ceb0) && _0x28ceb0 > 0) {
    _0x54b6bb.height = Math.round(_0x28ceb0);
  }
  return _0x54b6bb;
}
function summarizeReferenceNode(_0x49d658 = {}, {
  promptPreviewLimit = REFERENCE_PROMPT_PREVIEW_LIMIT
} = {}) {
  if (!_0x49d658 || typeof _0x49d658 !== "object") {
    return null;
  }
  const _0x5b7334 = String(_0x49d658.id || _0x49d658.nodeId || "").trim();
  if (!_0x5b7334) {
    return null;
  }
  const _0x2c5ef6 = Number(_0x49d658.width);
  const _0x26283f = Number(_0x49d658.height);
  const _0xf23638 = {
    nodeId: _0x5b7334,
    id: _0x5b7334,
    type: String(_0x49d658.type || ""),
    kind: resolveNodeKind(_0x49d658),
    name: String(_0x49d658.name || ""),
    promptPreview: truncate(_0x49d658.promptPreview || _0x49d658.prompt || "", promptPreviewLimit),
    contentPreview: truncate(_0x49d658.contentPreview || _0x49d658.content || "", promptPreviewLimit),
    model: String(_0x49d658.model || ""),
    provider: String(_0x49d658.provider || ""),
    adapterType: String(_0x49d658.adapterType || ""),
    status: String(_0x49d658.jobStatus || _0x49d658.status || "")
  };
  if (Number.isFinite(_0x2c5ef6) && _0x2c5ef6 > 0) {
    _0xf23638.width = Math.round(_0x2c5ef6);
  }
  if (Number.isFinite(_0x26283f) && _0x26283f > 0) {
    _0xf23638.height = Math.round(_0x26283f);
  }
  return _0xf23638;
}
function summarizeRelatedEdge(_0xc97ae2 = {}, _0x1b48e3, _0xd98b8e) {
  const _0x46e856 = String(_0xc97ae2.sourceId || "").trim();
  const _0x84c721 = String(_0xc97ae2.targetId || "").trim();
  if (!_0x46e856 && !_0x84c721) {
    return null;
  }
  const _0xa27660 = _0xd98b8e.has(_0x46e856);
  const _0x3450ff = _0xd98b8e.has(_0x84c721);
  const _0x4b7112 = [_0xa27660 ? _0x46e856 : "", _0x3450ff ? _0x84c721 : ""].filter(Boolean);
  const _0x4c5fcd = _0xa27660 && _0x3450ff ? "internal" : _0xa27660 ? "out" : "in";
  return {
    id: String(_0xc97ae2.id || ""),
    sourceId: _0x46e856,
    targetId: _0x84c721,
    refSlot: String(_0xc97ae2.refSlot || ""),
    type: String(_0xc97ae2.type || ""),
    direction: _0x4c5fcd,
    referenceNodeIds: _0x4b7112,
    sourceNode: summarizeReferenceNode(_0x1b48e3.get(_0x46e856) || {}),
    targetNode: summarizeReferenceNode(_0x1b48e3.get(_0x84c721) || {})
  };
}
function buildReferenceContext({
  inputRefs = [],
  nodes = [],
  edges = []
} = {}) {
  const _0xa8b748 = Array.isArray(inputRefs) ? inputRefs.map(summarizeReferenceInputRef).filter(Boolean) : [];
  const _0x3341fd = normalizeStringArray(_0xa8b748.map(_0x34fd8e => _0x34fd8e.nodeId || _0x34fd8e.id));
  const _0x334e04 = new Set(_0x3341fd);
  const _0x23b4f9 = new Map((Array.isArray(nodes) ? nodes : []).map(_0x1b47ec => [String(_0x1b47ec?.id || _0x1b47ec?.nodeId || "").trim(), _0x1b47ec]).filter(([_0x36b714]) => Boolean(_0x36b714)));
  const _0x51d4bd = _0x3341fd.map(_0x23258f => _0x23b4f9.get(_0x23258f)).filter(isMaterialNodeSummary).map(_0x3e39a2 => summarizeReferenceNode(_0x3e39a2)).filter(Boolean);
  const _0x1c308e = (Array.isArray(edges) ? edges : []).filter(_0x1b0fc4 => _0x334e04.has(String(_0x1b0fc4?.sourceId || "")) || _0x334e04.has(String(_0x1b0fc4?.targetId || ""))).map(_0x28f307 => summarizeRelatedEdge(_0x28f307, _0x23b4f9, _0x334e04)).filter(Boolean);
  const _0x30de53 = new Set();
  _0x1c308e.forEach(_0x2aa08f => {
    if (_0x334e04.has(_0x2aa08f.sourceId) && _0x2aa08f.targetId && !_0x334e04.has(_0x2aa08f.targetId)) {
      _0x30de53.add(_0x2aa08f.targetId);
    }
    if (_0x334e04.has(_0x2aa08f.targetId) && _0x2aa08f.sourceId && !_0x334e04.has(_0x2aa08f.sourceId)) {
      _0x30de53.add(_0x2aa08f.sourceId);
    }
  });
  const _0x487586 = Array.from(_0x30de53).map(_0x30120f => _0x23b4f9.get(_0x30120f)).map(_0x1183d2 => summarizeReferenceNode(_0x1183d2)).filter(Boolean);
  return {
    inputRefs: _0xa8b748,
    referencedNodes: _0x51d4bd,
    relatedEdges: _0x1c308e,
    neighborNodes: _0x487586
  };
}
function inferKindFromMessage(_0x6f24c0) {
  const _0x21b2ce = String(_0x6f24c0 || "").trim();
  if (!_0x21b2ce) {
    return "";
  }
  let _0x884bf4 = "";
  let _0x27960a = 0;
  for (const [_0x585b89, _0x397a66] of Object.entries(MESSAGE_KIND_PATTERNS)) {
    let _0xa71770 = 0;
    for (const _0x3e2b51 of _0x397a66) {
      if (_0x3e2b51.test(_0x21b2ce)) {
        _0xa71770 += 1;
      }
    }
    if (_0xa71770 > _0x27960a || _0xa71770 === _0x27960a && _0xa71770 > 0 && (MESSAGE_KIND_PRIORITY[_0x585b89] || 0) > (MESSAGE_KIND_PRIORITY[_0x884bf4] || 0)) {
      _0x884bf4 = _0x585b89;
      _0x27960a = _0xa71770;
    }
  }
  return _0x884bf4;
}
function inferKindFromSelectedNodes(_0x28f2c8 = []) {
  const _0x21c4be = new Map();
  for (const _0x175609 of _0x28f2c8) {
    const _0x33fdd7 = resolveSelectedNodeModelKind(_0x175609);
    const _0x188b87 = _0x33fdd7 || NODE_TYPE_KIND_HINTS[String(_0x175609?.type || "").trim()] || "";
    if (!_0x188b87) {
      continue;
    }
    _0x21c4be.set(_0x188b87, (_0x21c4be.get(_0x188b87) || 0) + 1);
  }
  return Array.from(_0x21c4be.entries()).sort((_0x35a979, _0x10e1df) => _0x10e1df[1] - _0x35a979[1])[0]?.[0] || "";
}
function resolveSelectedNodeModelKind(_0x288dc3 = {}) {
  const _0x526fb5 = String(_0x288dc3.model || "").trim();
  if (!_0x526fb5) {
    return "";
  }
  return normalizeKind(resolveModelExecution(_0x526fb5, {
    providerHint: _0x288dc3.provider
  })?.modelManifest?.kind);
}
function resolveTargetKind({
  targetKind: _0x2a3bc7,
  intent = null,
  userMessage = "",
  selectedNodes = []
} = {}) {
  return normalizeKind(_0x2a3bc7) || normalizeKind(intent?.targetKind) || normalizeKind(intent?.kind) || inferKindFromMessage(userMessage) || inferKindFromSelectedNodes(selectedNodes);
}
function scoreModel(_0x2739e6, {
  targetKind = "",
  selectedModelIds = [],
  selectedProviders = [],
  selectedInputKinds = new Set(),
  userMessage = ""
} = {}) {
  let _0x1f3699 = 0;
  const _0x48f312 = normalizeKind(_0x2739e6?.kind);
  if (targetKind && _0x48f312 === targetKind) {
    _0x1f3699 += 1000;
  }
  if (selectedModelIds.includes(_0x2739e6?.modelId)) {
    _0x1f3699 += 500;
  }
  if (selectedProviders.includes(_0x2739e6?.provider)) {
    _0x1f3699 += 80;
  }
  if (_0x2739e6?.adapterType === "workflow") {
    _0x1f3699 += 20;
  }
  if (_0x2739e6?.vip !== true) {
    _0x1f3699 += 4;
  }
  const _0x11fd82 = Number(_0x2739e6?.extensions?.imageMenu?.order) || Number(_0x2739e6?.extensions?.videoMenu?.order) || Number(_0x2739e6?.extensions?.audioMenu?.order) || Number(_0x2739e6?.extensions?.textMenu?.order) || 0;
  _0x1f3699 += Math.max(0, 100 - _0x11fd82) / 100;
  _0x1f3699 += scoreSelectedInputCompatibility(_0x2739e6, {
    selectedInputKinds: selectedInputKinds,
    targetKind: targetKind,
    userMessage: userMessage
  });
  const _0x2274b5 = [_0x2739e6?.modelId, _0x2739e6?.provider, _0x2739e6?.displayName, _0x2739e6?.description].join(" ").toLowerCase();
  const _0x2688ee = String(userMessage || "").trim().toLowerCase();
  const _0x46461f = normalizeAgentSearchKey(userMessage);
  const _0x34c114 = [_0x2739e6?.modelId, _0x2739e6?.displayName].map(_0x5a4931 => String(_0x5a4931 || "").trim().toLowerCase()).filter(_0x5a76c7 => _0x5a76c7.length >= 3);
  if (_0x2688ee && _0x34c114.some(_0x5130d1 => _0x2688ee.includes(_0x5130d1))) {
    _0x1f3699 += 2000;
  }
  const _0x258bc6 = normalizeAgentSearchKey(_0x2739e6?.modelId);
  const _0x2cddc1 = normalizeAgentSearchKey(_0x2739e6?.displayName);
  if (_0x258bc6.length >= 4 && _0x46461f.includes(_0x258bc6)) {
    _0x1f3699 += 2600;
  }
  if (_0x2cddc1.length >= 4 && _0x46461f.includes(_0x2cddc1)) {
    _0x1f3699 += 2200;
  }
  for (const _0x254c93 of _0x2688ee.split(/[\s,，。:：/]+/)) {
    if (_0x254c93.length >= 3 && _0x2274b5.includes(_0x254c93)) {
      _0x1f3699 += 10;
    }
  }
  return _0x1f3699;
}
function getExplicitMessageModelIds(_0xbd74f2 = [], _0x1421ab = "") {
  const _0x53305d = normalizeAgentSearchText(_0x1421ab);
  const _0x5d5cf5 = normalizeAgentSearchKey(_0x1421ab);
  if (!_0x53305d || !_0x5d5cf5) {
    return [];
  }
  return _0xbd74f2.filter(_0x2a626e => {
    const _0x3cbbb3 = [_0x2a626e?.modelId, _0x2a626e?.displayName].map(_0x964642 => ({
      text: normalizeAgentSearchText(_0x964642),
      key: normalizeAgentSearchKey(_0x964642)
    })).filter(_0x4ee661 => _0x4ee661.text);
    return _0x3cbbb3.some(({
      text: _0xe960e7,
      key: _0x244740
    }) => {
      if (_0xe960e7.length >= 4 && _0x53305d.includes(_0xe960e7)) {
        return true;
      }
      if (_0x244740.length < 4 || !_0x5d5cf5.includes(_0x244740)) {
        return false;
      }
      return /\d/.test(_0x244740) || _0x244740.length >= 8;
    });
  }).map(_0x34ae8e => _0x34ae8e.modelId);
}
function filterModelManifests({
  targetKind = "",
  selectedNodes = [],
  userMessage = "",
  modelLimit = undefined,
  disclosedModelIds = []
} = {}) {
  const _0x17e3f6 = listModelManifests();
  const _0x188512 = getExplicitMessageModelIds(_0x17e3f6, userMessage);
  const _0x4793d8 = normalizeStringArray(_0x17e3f6.filter(_0x200b73 => _0x188512.includes(_0x200b73.modelId)).map(_0x566919 => normalizeKind(_0x566919.kind)));
  const _0xc07267 = _0x4793d8.length === 1 ? _0x4793d8[0] : targetKind;
  const _0x533864 = normalizeStringArray(selectedNodes.map(_0x29e4ea => _0x29e4ea?.model));
  const _0x16993f = normalizeStringArray(selectedNodes.map(_0x12f863 => _0x12f863?.provider));
  const _0x23dac9 = normalizeStringArray([..._0x533864, ...normalizeStringArray(disclosedModelIds), ..._0x188512]);
  const _0xb2f593 = getSelectedInputKinds(selectedNodes);
  const _0x1cef08 = Boolean(_0xc07267);
  const _0x46be07 = Number(modelLimit);
  const _0x5f0253 = _0x1cef08 ? DEFAULT_MODEL_LIMIT : NO_INTENT_MODEL_LIMIT;
  const _0x7984d5 = Math.max(0, Math.trunc(Number.isFinite(_0x46be07) ? _0x46be07 : _0x5f0253));
  const _0xc3467d = _0x17e3f6.filter(_0x2989d6 => {
    if (!_0x2989d6?.modelId) {
      return false;
    }
    if (_0x23dac9.includes(_0x2989d6.modelId)) {
      return true;
    }
    return !_0x1cef08 || normalizeKind(_0x2989d6.kind) === _0xc07267;
  }).map(_0xcdb7a0 => ({
    manifest: _0xcdb7a0,
    score: scoreModel(_0xcdb7a0, {
      targetKind: _0xc07267,
      selectedModelIds: _0x533864,
      selectedProviders: _0x16993f,
      selectedInputKinds: _0xb2f593,
      userMessage: userMessage
    })
  })).sort((_0x1b961d, _0x2b8e21) => {
    const _0x4b34e2 = _0x23dac9.includes(_0x1b961d.manifest.modelId);
    const _0x526530 = _0x23dac9.includes(_0x2b8e21.manifest.modelId);
    if (_0x4b34e2 !== _0x526530) {
      if (_0x526530) {
        return 1;
      } else {
        return -1;
      }
    }
    if (_0x2b8e21.score !== _0x1b961d.score) {
      return _0x2b8e21.score - _0x1b961d.score;
    }
    return String(_0x1b961d.manifest.modelId).localeCompare(String(_0x2b8e21.manifest.modelId));
  });
  const _0x1dbf17 = Math.max(_0x7984d5, _0x23dac9.length);
  const _0x2eb945 = _0xc3467d.slice(0, _0x1dbf17).map(_0x5e3861 => _0x5e3861.manifest);
  return {
    manifests: _0x2eb945,
    totalAvailable: _0x17e3f6.length,
    totalMatched: _0xc3467d.length,
    truncated: _0xc3467d.length > _0x2eb945.length,
    targetKind: _0xc07267,
    selectedModelIds: _0x533864,
    disclosedModelIds: normalizeStringArray(disclosedModelIds),
    selectedInputKinds: Array.from(_0xb2f593)
  };
}
export function buildAgentCanvasSummary({
  store: _0x459405,
  recentCommands = [],
  includeCommands = true,
  userMessage = "",
  intent = null,
  targetKind = "",
  inputRefs = [],
  modelLimit = undefined,
  disclosedModelIds = [],
  promptPreviewLimit = DEFAULT_PROMPT_PREVIEW_LIMIT
} = {}) {
  const _0x28b799 = _0x459405?.getStateRaw?.() || _0x459405?.getState?.() || {};
  const _0x5a724d = buildCanvasSummary({
    store: _0x459405
  });
  const _0x52f84c = (_0x5a724d.nodes || []).map(_0x4b8116 => ({
    ..._0x4b8116,
    promptPreview: truncate(_0x4b8116.promptPreview, promptPreviewLimit),
    contentPreview: truncate(_0x4b8116.contentPreview, promptPreviewLimit)
  }));
  const _0x1356e3 = getSelectedNodes(_0x28b799, _0x5a724d);
  const _0x3eeef9 = new Set(_0x1356e3.map(_0xce227f => String(_0xce227f?.id || "")).filter(Boolean));
  const _0x2d13bc = getInputRefSelectedNodes(inputRefs, _0x28b799).filter(_0x17cc64 => !_0x3eeef9.has(String(_0x17cc64.id || "")));
  const _0x1340ee = [..._0x1356e3, ..._0x2d13bc];
  const _0x2ed03b = resolveTargetKind({
    targetKind: targetKind,
    intent: intent,
    userMessage: userMessage,
    selectedNodes: _0x1340ee
  });
  const _0x397671 = filterModelManifests({
    targetKind: _0x2ed03b,
    selectedNodes: _0x1340ee,
    userMessage: userMessage,
    modelLimit: modelLimit,
    disclosedModelIds: disclosedModelIds
  });
  const _0x5d7408 = _0x397671.manifests.map(_0x3b02d7 => summarizeModel(_0x3b02d7));
  const _0x3c2847 = _0x5d7408.filter(_0x12925c => _0x12925c.adapterType === "workflow").map(summarizeWorkflow);
  const _0x195f4d = Array.isArray(recentCommands) ? recentCommands : [];
  const _0x4ceaff = new Set((_0x5a724d.selectedNodeIds || []).map(_0x10c782 => String(_0x10c782 || "")));
  const _0x5bc50d = _0x52f84c.filter(_0x3a03f6 => _0x4ceaff.has(String(_0x3a03f6?.id || ""))).map(_0x55c6c9 => ({
    id: _0x55c6c9.id,
    type: _0x55c6c9.type,
    name: _0x55c6c9.name,
    promptPreview: _0x55c6c9.promptPreview,
    contentPreview: _0x55c6c9.contentPreview,
    model: _0x55c6c9.model,
    provider: _0x55c6c9.provider,
    adapterType: _0x55c6c9.adapterType,
    x: _0x55c6c9.x,
    y: _0x55c6c9.y,
    width: _0x55c6c9.width,
    height: _0x55c6c9.height,
    jobStatus: _0x55c6c9.jobStatus
  }));
  const _0x41c24f = _0x5a724d.edges || [];
  const _0x44bba2 = buildReferenceContext({
    inputRefs: inputRefs,
    nodes: _0x52f84c,
    edges: _0x41c24f
  });
  return {
    selectedNodeIds: _0x5a724d.selectedNodeIds || [],
    selectedNodes: _0x5bc50d,
    nodes: _0x52f84c,
    edges: _0x41c24f,
    referenceContext: _0x44bba2,
    viewport: normalizeViewport(_0x5a724d.viewport),
    availableModels: _0x5d7408,
    availableWorkflows: _0x3c2847,
    modelCatalog: {
      targetKind: _0x397671.targetKind,
      selectedNodeTypes: getSelectedNodeTypes(_0x1340ee),
      selectedInputKinds: _0x397671.selectedInputKinds,
      selectedNodeModels: _0x397671.selectedModelIds,
      selectedModelIds: _0x397671.selectedModelIds,
      disclosedModelIds: _0x397671.disclosedModelIds,
      totalAvailable: _0x397671.totalAvailable,
      totalMatched: _0x397671.totalMatched,
      includedModels: _0x5d7408.length,
      truncated: _0x397671.truncated
    },
    runningTasks: Object.values(_0x28b799.nodes || {}).map(summarizeTaskNode).filter(Boolean),
    recentCommands: includeCommands ? _0x195f4d.slice(-20) : []
  };
}
export const agentCanvasSummaryInternals = Object.freeze({
  inferKindFromMessage: inferKindFromMessage,
  resolveTargetKind: resolveTargetKind,
  filterModelManifests: filterModelManifests,
  buildReferenceContext: buildReferenceContext
});