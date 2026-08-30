import { buildManifestDraftBundle } from "../../manifests/index.js";
export const COMFYUI_WORKFLOW_DISPLAY_NAME = "ComfyUI 工作流";
const MEDIA_COMPONENT_KINDS = new Set(["image", "video", "audio"]);
const COMPONENT_KINDS = new Set(["image", "video", "audio", "prompt", "param"]);
const CONTROL_TYPES = new Set(["text", "textarea", "stepper", "float", "toggle", "prompt"]);
const OUTPUT_KINDS = new Set(["image", "video", "audio"]);
const BASE_URL_MODES = new Set(["local", "cloud"]);
const COMPONENT_SELECTION_MODES = new Set(["auto", "manual"]);
const SCALAR_INPUT_TYPES = new Set(["string", "number", "boolean"]);
const TEXT_CONTROL_OPTIONS = Object.freeze(["text", "textarea", "prompt"]);
const AMBIGUOUS_ZERO_CONTROL_OPTIONS = Object.freeze(["text", "stepper", "float"]);
const TEXT_COMPONENT_KIND_OPTIONS = Object.freeze(["param", "prompt"]);
export const COMFYUI_GENERATION_COUNT_FIELD_ID = "batchSize";
export const COMFYUI_GENERATION_COUNT_OPTIONS = Object.freeze([1, 2, 4, 6, 8, 10, 12]);
const COMFYUI_GENERATION_COUNT_FIELD = Object.freeze({
  id: COMFYUI_GENERATION_COUNT_FIELD_ID,
  type: "segmented",
  placement: "batch",
  label: "生成数量",
  defaultValue: 1,
  options: Object.freeze(COMFYUI_GENERATION_COUNT_OPTIONS.map(_0x1e143d => Object.freeze({
    value: _0x1e143d,
    label: _0x1e143d + "x",
    selectedLabel: _0x1e143d + "x"
  }))),
  comfyUiSystemField: true
});
function normalizeText(_0xc5797c, _0x563e49 = "") {
  const _0x33c4ba = String(_0xc5797c ?? "").trim();
  return _0x33c4ba || _0x563e49;
}
function normalizeOutputKind(_0x1021d7) {
  const _0x435af9 = String(_0x1021d7 || "").trim().toLowerCase();
  if (OUTPUT_KINDS.has(_0x435af9)) {
    return _0x435af9;
  } else {
    return "image";
  }
}
function normalizeBaseUrlMode(_0x316554) {
  const _0x31db5b = String(_0x316554 || "").trim().toLowerCase();
  if (BASE_URL_MODES.has(_0x31db5b)) {
    return _0x31db5b;
  } else {
    return "local";
  }
}
function normalizeComponentSelectionMode(_0x32da37) {
  const _0x191c3a = String(_0x32da37 || "").trim().toLowerCase();
  if (COMPONENT_SELECTION_MODES.has(_0x191c3a)) {
    return _0x191c3a;
  } else {
    return "auto";
  }
}
function sanitizeIdentifierPart(_0x56ef24, _0x214e7e = "field") {
  const _0x35cf15 = String(_0x56ef24 || "").trim().toLowerCase().replace(/[^a-z0-9_-]+/g, "_").replace(/^_+|_+$/g, "");
  return _0x35cf15 || _0x214e7e;
}
function createStableHash(_0x58e3de) {
  const _0x195ca2 = String(_0x58e3de || "");
  let _0x34b409 = 2166136261;
  for (let _0x57b711 = 0; _0x57b711 < _0x195ca2.length; _0x57b711 += 1) {
    _0x34b409 ^= _0x195ca2.charCodeAt(_0x57b711);
    _0x34b409 = Math.imul(_0x34b409, 16777619);
  }
  return (_0x34b409 >>> 0).toString(36).padStart(7, "0").slice(0, 8);
}
function extractFirstJsonObject(_0x737a10) {
  const _0x87796 = String(_0x737a10 || "");
  const _0x290167 = _0x87796.indexOf("{");
  if (_0x290167 < 0) {
    return "";
  }
  let _0x1cb03d = 0;
  let _0x2787b8 = false;
  let _0x44d2b9 = "";
  let _0x315932 = false;
  for (let _0x2273e4 = _0x290167; _0x2273e4 < _0x87796.length; _0x2273e4 += 1) {
    const _0x5496b4 = _0x87796[_0x2273e4];
    if (_0x2787b8) {
      if (_0x315932) {
        _0x315932 = false;
        continue;
      }
      if (_0x5496b4 === "\\") {
        _0x315932 = true;
        continue;
      }
      if (_0x5496b4 === _0x44d2b9) {
        _0x2787b8 = false;
        _0x44d2b9 = "";
      }
      continue;
    }
    if (_0x5496b4 === "\"" || _0x5496b4 === "'") {
      _0x2787b8 = true;
      _0x44d2b9 = _0x5496b4;
      continue;
    }
    if (_0x5496b4 === "{") {
      _0x1cb03d += 1;
    }
    if (_0x5496b4 === "}") {
      _0x1cb03d -= 1;
      if (_0x1cb03d === 0) {
        return _0x87796.slice(_0x290167, _0x2273e4 + 1);
      }
    }
  }
  return "";
}
function parseJsonPayload(_0x51bb56) {
  try {
    return JSON.parse(_0x51bb56);
  } catch (_0x25b1b4) {
    throw new Error("ComfyUI 工作流 JSON 解析失败：" + (_0x25b1b4?.message || "格式错误"));
  }
}
function isComfyUiApiNode(_0x5a8064) {
  return Boolean(_0x5a8064 && typeof _0x5a8064 === "object" && !Array.isArray(_0x5a8064) && _0x5a8064.inputs && typeof _0x5a8064.inputs === "object" && !Array.isArray(_0x5a8064.inputs));
}
function normalizeComfyUiWorkflowGraph(_0x2c1db2) {
  const _0x1ade9d = _0x2c1db2?.prompt && typeof _0x2c1db2.prompt === "object" && !Array.isArray(_0x2c1db2.prompt) ? _0x2c1db2.prompt : _0x2c1db2?.workflow && typeof _0x2c1db2.workflow === "object" && !Array.isArray(_0x2c1db2.workflow) ? _0x2c1db2.workflow : _0x2c1db2;
  if (!_0x1ade9d || typeof _0x1ade9d !== "object" || Array.isArray(_0x1ade9d)) {
    throw new Error("ComfyUI 工作流 API JSON 必须是节点对象");
  }
  const _0x3b18e3 = Object.entries(_0x1ade9d).filter(([, _0x5d70cf]) => isComfyUiApiNode(_0x5d70cf));
  if (_0x3b18e3.length === 0) {
    throw new Error("未找到 ComfyUI API 格式节点，请导出 API format workflow JSON");
  }
  return _0x3b18e3.reduce((_0x2d2094, [_0x266153, _0x1a94c6]) => {
    _0x2d2094[String(_0x266153)] = {
      ..._0x1a94c6,
      inputs: {
        ...(_0x1a94c6.inputs || {})
      }
    };
    return _0x2d2094;
  }, {});
}
export function parseComfyUiWorkflowApiInput(_0x340186) {
  const _0x1f32f9 = String(_0x340186 || "").trim();
  if (!_0x1f32f9) {
    throw new Error("请粘贴 ComfyUI API workflow JSON");
  }
  const _0x5c9275 = _0x1f32f9.startsWith("{") ? _0x1f32f9 : extractFirstJsonObject(_0x1f32f9);
  if (!_0x5c9275) {
    throw new Error("未找到 ComfyUI workflow JSON");
  }
  const _0x4c9f58 = parseJsonPayload(_0x5c9275);
  const _0x30a3d9 = normalizeComfyUiWorkflowGraph(_0x4c9f58);
  return {
    body: _0x4c9f58,
    workflow: _0x30a3d9,
    sourceText: _0x1f32f9
  };
}
function isConnectionValue(_0x1a04d7) {
  return Array.isArray(_0x1a04d7) && _0x1a04d7.length >= 2 && (typeof _0x1a04d7[0] === "string" || typeof _0x1a04d7[0] === "number") && typeof _0x1a04d7[1] === "number";
}
function isScalarValue(_0x260aad) {
  return SCALAR_INPUT_TYPES.has(typeof _0x260aad) || _0x260aad === null;
}
function isComfyUiMediaUiInputName(_0x4f9e7e) {
  const _0xd594cf = String(_0x4f9e7e || "").trim().toLowerCase();
  return _0xd594cf === "imageui" || _0xd594cf === "videoui" || _0xd594cf === "audioui";
}
function sortNodeEntries(_0x38c02f) {
  return Object.entries(_0x38c02f).sort(([_0x5bf32a], [_0x20f32d]) => {
    const _0x1081d2 = Number(_0x5bf32a);
    const _0x3b5a06 = Number(_0x20f32d);
    if (Number.isFinite(_0x1081d2) && Number.isFinite(_0x3b5a06) && _0x1081d2 !== _0x3b5a06) {
      return _0x1081d2 - _0x3b5a06;
    }
    return String(_0x5bf32a).localeCompare(String(_0x20f32d));
  });
}
function isMediaInput(_0x1fc489, _0x1dea46) {
  const _0x28fac1 = String(_0x1fc489 || "").toLowerCase();
  const _0x25e640 = String(_0x1dea46 || "").toLowerCase();
  if (isComfyUiMediaUiInputName(_0x25e640)) {
    return "";
  }
  if (_0x28fac1.includes("loadimage") && _0x25e640 === "image") {
    return "image";
  }
  if ((_0x28fac1.includes("loadvideo") || _0x28fac1.includes("videoload")) && _0x25e640.includes("video")) {
    return "video";
  }
  if ((_0x28fac1.includes("loadaudio") || _0x28fac1.includes("audioload")) && _0x25e640.includes("audio")) {
    return "audio";
  }
  if (_0x25e640 === "image" || _0x25e640.endsWith("_image")) {
    return "image";
  }
  if (_0x25e640 === "video" || _0x25e640.endsWith("_video")) {
    return "video";
  }
  if (_0x25e640 === "audio" || _0x25e640.endsWith("_audio")) {
    return "audio";
  }
  return "";
}
function isPromptInput(_0x103131, _0x213527, _0x1bbec5) {
  const _0x502067 = String(_0x103131 || "").toLowerCase();
  const _0x3a5ca7 = String(_0x213527 || "").toLowerCase();
  if (typeof _0x1bbec5 !== "string") {
    return false;
  }
  if (_0x502067.includes("cliptextencode") && _0x3a5ca7 === "text") {
    return true;
  }
  return /prompt|positive|negative|text|caption|description/.test(_0x3a5ca7) && looksLikeStructuredText(_0x1bbec5);
}
function containsCjkText(_0x13c9d8) {
  return /[\u3400-\u9fff]/u.test(String(_0x13c9d8 ?? ""));
}
function looksLikeLongEnglishText(_0x596298) {
  const _0x3e4ed9 = String(_0x596298 ?? "").trim();
  const _0x350922 = _0x3e4ed9.match(/[A-Za-z][A-Za-z'-]*/g) || [];
  const _0x5f316b = (_0x3e4ed9.match(/[A-Za-z]/g) || []).length;
  return _0x350922.length >= 4 || _0x5f316b >= 28;
}
function looksLikeStructuredText(_0xc93241) {
  const _0x3fcb74 = String(_0xc93241 ?? "").trim();
  if (!_0x3fcb74) {
    return true;
  }
  return containsCjkText(_0x3fcb74) || looksLikeLongEnglishText(_0x3fcb74) || _0x3fcb74.length > 42 || /[\s,.;:!?，。；：！？、]/.test(_0x3fcb74);
}
function isBooleanLiteral(_0x39fdb8) {
  const _0x4bd400 = String(_0x39fdb8 ?? "").trim().toLowerCase();
  return _0x4bd400 === "true" || _0x4bd400 === "false";
}
function isIntegerLiteral(_0x12559b) {
  return /^[+-]?\d+$/.test(String(_0x12559b ?? "").trim());
}
function isDecimalLiteral(_0x3f4ebc) {
  return /^[+-]?(?:\d+\.\d+|\.\d+)$/.test(String(_0x3f4ebc ?? "").trim());
}
function isAmbiguousZeroLiteral(_0xf19285) {
  return /^[+-]?0+$/.test(String(_0xf19285 ?? "").trim());
}
function inferTextControlType(_0x2ab180, _0x17e624) {
  const _0x2dbd = String(_0x17e624 || "").toLowerCase();
  if (/prompt|positive|negative|text|caption|description/.test(_0x2dbd)) {
    return "textarea";
  }
  if (looksLikeStructuredText(_0x2ab180)) {
    return "textarea";
  } else {
    return "text";
  }
}
function inferComponentConfig({
  classType: _0x277e5a,
  inputName: _0xb1baee,
  value: _0xd34a2d
}) {
  const _0x335e53 = isMediaInput(_0x277e5a, _0xb1baee);
  if (_0x335e53) {
    return {
      componentKind: _0x335e53,
      componentKindLocked: true,
      componentKindOptions: [_0x335e53],
      controlType: "text",
      controlTypeLocked: true,
      controlTypeOptions: []
    };
  }
  if (isPromptInput(_0x277e5a, _0xb1baee, _0xd34a2d)) {
    return {
      componentKind: "prompt",
      componentKindLocked: false,
      componentKindOptions: TEXT_COMPONENT_KIND_OPTIONS.slice(),
      controlType: "prompt",
      controlTypeLocked: false,
      controlTypeOptions: TEXT_CONTROL_OPTIONS.slice()
    };
  }
  if (typeof _0xd34a2d === "boolean" || isBooleanLiteral(_0xd34a2d)) {
    return {
      componentKind: "param",
      componentKindLocked: true,
      componentKindOptions: ["param"],
      controlType: "toggle",
      controlTypeLocked: true,
      controlTypeOptions: ["toggle"]
    };
  }
  if (typeof _0xd34a2d === "number" && Number.isInteger(_0xd34a2d)) {
    return {
      componentKind: "param",
      componentKindLocked: true,
      componentKindOptions: ["param"],
      controlType: "stepper",
      controlTypeLocked: _0xd34a2d !== 0,
      controlTypeOptions: _0xd34a2d === 0 ? AMBIGUOUS_ZERO_CONTROL_OPTIONS.slice() : ["stepper"]
    };
  }
  if (typeof _0xd34a2d === "number" || isDecimalLiteral(_0xd34a2d)) {
    return {
      componentKind: "param",
      componentKindLocked: true,
      componentKindOptions: ["param"],
      controlType: "float",
      controlTypeLocked: true,
      controlTypeOptions: ["float"]
    };
  }
  if (isIntegerLiteral(_0xd34a2d)) {
    return {
      componentKind: "param",
      componentKindLocked: true,
      componentKindOptions: ["param"],
      controlType: "stepper",
      controlTypeLocked: !isAmbiguousZeroLiteral(_0xd34a2d),
      controlTypeOptions: isAmbiguousZeroLiteral(_0xd34a2d) ? AMBIGUOUS_ZERO_CONTROL_OPTIONS.slice() : ["stepper"]
    };
  }
  return {
    componentKind: "param",
    componentKindLocked: false,
    componentKindOptions: TEXT_COMPONENT_KIND_OPTIONS.slice(),
    controlType: inferTextControlType(_0xd34a2d, _0xb1baee),
    controlTypeLocked: false,
    controlTypeOptions: TEXT_CONTROL_OPTIONS.slice()
  };
}
export function formatComfyUiComponentLabel(_0x169ccb = {}) {
  const _0x5d9dc6 = normalizeText(_0x169ccb?.inputName, "value");
  const _0x4f9d19 = normalizeText(_0x169ccb?.nodeTitle) || normalizeText(_0x169ccb?.classType) || normalizeText(_0x169ccb?.nodeId);
  if (_0x4f9d19) {
    return _0x4f9d19 + "." + _0x5d9dc6;
  } else {
    return _0x5d9dc6;
  }
}
function createComponentLabel({
  nodeId: _0x3269d3,
  nodeTitle: _0x40f969,
  classType: _0x3eedaf,
  inputName: _0x303ac2
} = {}) {
  return formatComfyUiComponentLabel({
    nodeId: _0x3269d3,
    nodeTitle: _0x40f969,
    classType: _0x3eedaf,
    inputName: _0x303ac2
  });
}
function createComponentKey(_0x5830b5, _0x39e815, _0x7974b7) {
  return [_0x5830b5, _0x39e815, _0x7974b7].map(_0x4a2dee => normalizeText(_0x4a2dee).toLowerCase()).join("::");
}
function getComfyUiNodeTitle(_0x5905ae = {}) {
  return normalizeText(_0x5905ae?._meta?.title || _0x5905ae?._meta?.name || _0x5905ae?.title || _0x5905ae?.name || _0x5905ae?.label);
}
function createComponentId(_0x529fe7, _0x37d13a) {
  const _0x3d613e = sanitizeIdentifierPart(_0x529fe7?.nodeId, "node_" + _0x37d13a);
  const _0xea5db9 = sanitizeIdentifierPart(_0x529fe7?.inputName, "value");
  return "comfyui_" + _0x3d613e + "_" + _0xea5db9 + "_" + _0x37d13a;
}
function createSlotId(_0x4458f2, _0x4861a2, _0xa412ee) {
  const _0x489f0c = sanitizeIdentifierPart(_0x4861a2?.nodeId, "node_" + _0xa412ee);
  const _0x1d5858 = sanitizeIdentifierPart(_0x4861a2?.inputName, _0x4458f2);
  return "comfyui_" + _0x4458f2 + "_" + _0x489f0c + "_" + _0x1d5858 + "_" + _0xa412ee;
}
function normalizeComponentKind(_0x518e72, _0xc0e17a = "param") {
  const _0x4b9d0a = String(_0x518e72 || "").trim().toLowerCase();
  if (COMPONENT_KINDS.has(_0x4b9d0a)) {
    return _0x4b9d0a;
  } else {
    return _0xc0e17a;
  }
}
function normalizeControlType(_0x351821, _0x56fa13 = "text") {
  const _0x2c1181 = String(_0x351821 || "").trim().toLowerCase();
  if (_0x2c1181 === "integer" || _0x2c1181 === "number") {
    return "stepper";
  }
  if (_0x2c1181 === "decimal") {
    return "float";
  }
  if (_0x2c1181 === "boolean" || _0x2c1181 === "bool") {
    return "toggle";
  }
  if (CONTROL_TYPES.has(_0x2c1181)) {
    return _0x2c1181;
  } else {
    return _0x56fa13;
  }
}
function normalizeBooleanDefault(_0x21c248) {
  const _0x53cb2a = String(_0x21c248 ?? "").trim().toLowerCase();
  return _0x21c248 === true || _0x53cb2a === "true" || _0x53cb2a === "1" || _0x53cb2a === "yes" || _0x53cb2a === "on";
}
function normalizeIntegerDefault(_0x166f22) {
  const _0x132bd5 = Number(_0x166f22);
  if (Number.isFinite(_0x132bd5)) {
    return Math.trunc(_0x132bd5);
  } else {
    return 0;
  }
}
function normalizeFloatDefault(_0x506f34) {
  const _0x1d9c24 = Number(_0x506f34);
  if (Number.isFinite(_0x1d9c24)) {
    return _0x1d9c24;
  } else {
    return 0;
  }
}
function normalizeDefaultValueForControl(_0x247a57, _0x404f9e) {
  const _0x3434c7 = normalizeControlType(_0x247a57);
  if (_0x3434c7 === "toggle") {
    return normalizeBooleanDefault(_0x404f9e);
  }
  if (_0x3434c7 === "stepper") {
    return normalizeIntegerDefault(_0x404f9e);
  }
  if (_0x3434c7 === "float") {
    return normalizeFloatDefault(_0x404f9e);
  }
  return String(_0x404f9e ?? "");
}
function normalizeOrderValue(_0x1b3850, _0x4f9c73) {
  const _0x5d7a45 = Number(_0x1b3850);
  if (Number.isFinite(_0x5d7a45)) {
    return _0x5d7a45;
  } else {
    return _0x4f9c73;
  }
}
function normalizePreviewPlacement(_0x24297e) {
  if (String(_0x24297e || "").trim() === "home") {
    return "home";
  } else {
    return "advanced";
  }
}
function getNodeTransformForControl(_0x3a109a) {
  const _0x104989 = normalizeControlType(_0x3a109a);
  if (_0x104989 === "toggle") {
    return "boolean";
  }
  if (_0x104989 === "stepper") {
    return "integer";
  }
  if (_0x104989 === "float") {
    return "number";
  }
  return "";
}
function getUiSchemaTypeForControl(_0x853db3) {
  const _0x4ea825 = normalizeControlType(_0x853db3);
  if (_0x4ea825 === "float") {
    return "stepper";
  } else {
    return _0x4ea825;
  }
}
function getFloatStep(_0x53eb76) {
  const _0x2c483c = String(_0x53eb76 ?? "").trim();
  const _0xef9376 = _0x2c483c.match(/\.(\d+)/);
  const _0x2e0ede = _0xef9376 ? Math.max(1, _0xef9376[1].length) : 2;
  return Number("0." + "0".repeat(Math.max(0, _0x2e0ede - 1)) + "1");
}
function normalizeOptionList(_0x25bc77 = [], _0x436de7 = null) {
  if (!Array.isArray(_0x25bc77)) {
    return [];
  }
  return _0x25bc77.map(_0x214875 => String(_0x214875 || "").trim().toLowerCase()).filter((_0x227dfc, _0x2ca789, _0x41c6f2) => {
    if (!_0x227dfc || _0x41c6f2.indexOf(_0x227dfc) !== _0x2ca789) {
      return false;
    }
    return !_0x436de7 || _0x436de7.has(_0x227dfc);
  });
}
function pickAllowedValue(_0x1e2908, _0x51cd84, _0x2bab75) {
  const _0x4e1cdb = String(_0x1e2908 || "").trim().toLowerCase();
  if (_0x51cd84.includes(_0x4e1cdb)) {
    return _0x4e1cdb;
  } else {
    return _0x2bab75;
  }
}
function normalizeComponentOverride(_0x283b34, _0x18c7e8) {
  const _0x2e74a5 = inferComponentConfig(_0x18c7e8);
  const _0x1ff6cc = normalizeOptionList(_0x2e74a5.componentKindOptions, COMPONENT_KINDS);
  const _0x1fb4e2 = normalizeOptionList(_0x2e74a5.controlTypeOptions, CONTROL_TYPES);
  const _0x40394d = _0x2e74a5.componentKind || "param";
  const _0xcaed7 = normalizeControlType(_0x2e74a5.controlType);
  const _0x2b6faa = normalizeComponentKind(_0x283b34?.componentKind, _0x40394d);
  let _0x5bf43e = _0x2e74a5.componentKindLocked === true ? _0x40394d : pickAllowedValue(_0x2b6faa, _0x1ff6cc.length ? _0x1ff6cc : [_0x2b6faa], _0x40394d);
  const _0x3a6aba = normalizeControlType(_0x283b34?.controlType, _0xcaed7);
  let _0x37ed4d = _0x5bf43e === "prompt" ? "prompt" : _0x2e74a5.controlTypeLocked === true ? _0xcaed7 : pickAllowedValue(_0x3a6aba, _0x1fb4e2.length ? _0x1fb4e2 : [_0xcaed7], _0xcaed7);
  if (_0x37ed4d === "prompt" && !_0x2e74a5.componentKindLocked && _0x1ff6cc.includes("prompt")) {
    _0x5bf43e = "prompt";
  }
  return {
    label: normalizeText(_0x283b34?.label, _0x18c7e8.label),
    description: normalizeText(_0x283b34?.description, _0x18c7e8.label),
    componentKind: _0x5bf43e,
    componentKindLocked: _0x2e74a5.componentKindLocked === true,
    componentKindOptions: _0x1ff6cc.length ? _0x1ff6cc : [_0x5bf43e],
    controlType: _0x37ed4d,
    controlTypeLocked: _0x2e74a5.controlTypeLocked === true,
    controlTypeOptions: _0x1fb4e2,
    inputOrder: normalizeOrderValue(_0x283b34?.inputOrder, _0x18c7e8.index),
    homeParamOrder: normalizeOrderValue(_0x283b34?.homeParamOrder, _0x18c7e8.index),
    advancedParamOrder: normalizeOrderValue(_0x283b34?.advancedParamOrder, _0x18c7e8.index),
    previewPlacement: normalizePreviewPlacement(_0x283b34?.previewPlacement),
    required: _0x283b34?.required !== false,
    defaultValue: normalizeDefaultValueForControl(_0x37ed4d, _0x283b34?.defaultValue === undefined ? _0x18c7e8.value : _0x283b34.defaultValue)
  };
}
function buildComponentOverrideMap(_0x26155b = []) {
  const _0x3462a7 = new Map();
  if (!Array.isArray(_0x26155b)) {
    return _0x3462a7;
  }
  _0x26155b.forEach(_0x2d81ad => {
    const _0x165d80 = Number(_0x2d81ad?.index);
    if (!Number.isInteger(_0x165d80) || _0x165d80 < 0) {
      return;
    }
    _0x3462a7.set(_0x165d80, _0x2d81ad);
  });
  return _0x3462a7;
}
function collectComponentDraftItems(_0x1f8bfe) {
  const _0x4f223d = [];
  sortNodeEntries(_0x1f8bfe).forEach(([_0x5d5ff1, _0x507ab2]) => {
    const _0x446481 = normalizeText(_0x507ab2?.class_type || _0x507ab2?.classType);
    const _0x1dd43c = getComfyUiNodeTitle(_0x507ab2);
    Object.entries(_0x507ab2.inputs || {}).forEach(([_0x5bf6d2, _0x1cc887]) => {
      if (isComfyUiMediaUiInputName(_0x5bf6d2)) {
        return;
      }
      if (isConnectionValue(_0x1cc887) || !isScalarValue(_0x1cc887)) {
        return;
      }
      const _0x191b84 = _0x4f223d.length;
      const _0x6dd51e = {
        index: _0x191b84,
        nodeId: String(_0x5d5ff1),
        nodeTitle: _0x1dd43c,
        classType: _0x446481,
        inputName: _0x5bf6d2,
        value: _0x1cc887,
        componentKey: createComponentKey(_0x5d5ff1, _0x446481, _0x5bf6d2),
        label: createComponentLabel({
          nodeId: _0x5d5ff1,
          nodeTitle: _0x1dd43c,
          classType: _0x446481,
          inputName: _0x5bf6d2
        })
      };
      const _0x2bf448 = inferComponentConfig(_0x6dd51e);
      _0x4f223d.push({
        ..._0x6dd51e,
        componentKind: _0x2bf448.componentKind,
        componentKindLocked: _0x2bf448.componentKindLocked === true,
        componentKindOptions: _0x2bf448.componentKindOptions || ["param"],
        controlType: _0x2bf448.controlType,
        controlTypeLocked: _0x2bf448.controlTypeLocked === true,
        controlTypeOptions: _0x2bf448.controlTypeOptions || [],
        defaultValue: String(_0x1cc887 ?? "")
      });
    });
  });
  return _0x4f223d;
}
export function createComfyUiWorkflowComponentDrafts(_0x318d97) {
  const _0x36ddeb = parseComfyUiWorkflowApiInput(_0x318d97);
  return {
    parsed: _0x36ddeb,
    components: collectComponentDraftItems(_0x36ddeb.workflow)
  };
}
function buildInputSlotCounts(_0x553101) {
  return _0x553101.reduce((_0xe202a2, _0x20431e) => {
    const _0x40d05c = String(_0x20431e?.kind || "").trim();
    if (!_0x40d05c) {
      return _0xe202a2;
    }
    _0xe202a2[_0x40d05c] = (_0xe202a2[_0x40d05c] || 0) + 1;
    return _0xe202a2;
  }, {});
}
function buildManifestParts(_0x3fe321, _0x86a7bf, _0x2c0360 = [], _0xd61877 = {}) {
  const _0x25743e = normalizeComponentSelectionMode(_0xd61877.componentSelectionMode);
  const _0xc3f3e5 = _0x25743e === "manual" ? new Set((Array.isArray(_0x2c0360) ? _0x2c0360 : []).map(_0x445629 => Number(_0x445629?.index)).filter(_0x204454 => Number.isInteger(_0x204454) && _0x204454 >= 0)) : null;
  const _0x47eaef = buildComponentOverrideMap(_0x2c0360);
  const _0x357f19 = [];
  const _0x329b32 = [];
  const _0x415576 = [];
  let _0x5832a9 = false;
  let _0x507612 = "";
  collectComponentDraftItems(_0x3fe321.workflow).forEach((_0x31c75b, _0x4b34c5) => {
    if (_0xc3f3e5 && !_0xc3f3e5.has(Number(_0x31c75b.index))) {
      return;
    }
    const _0x5cecb1 = normalizeComponentOverride(_0x47eaef.get(_0x31c75b.index), _0x31c75b);
    const _0x4b0841 = _0x5cecb1.label;
    const _0x1dc2d1 = _0x5cecb1.description || _0x4b0841;
    const _0x317dd1 = _0x5cecb1.componentKind;
    if (MEDIA_COMPONENT_KINDS.has(_0x317dd1)) {
      const _0x40c2a2 = createSlotId(_0x317dd1, _0x31c75b, _0x4b34c5);
      _0x357f19.push({
        id: _0x40c2a2,
        kind: _0x317dd1,
        label: _0x4b0841,
        description: _0x1dc2d1,
        required: _0x5cecb1.required,
        displayOrder: _0x5cecb1.inputOrder,
        customAiAppComponentIndex: _0x31c75b.index,
        comfyUiComponentIndex: _0x31c75b.index
      });
      _0x415576.push({
        nodeId: _0x31c75b.nodeId,
        inputName: _0x31c75b.inputName,
        source: _0x317dd1 + "Input",
        field: _0x40c2a2,
        slot: _0x40c2a2,
        required: _0x5cecb1.required,
        missingMessage: "请接入" + _0x4b0841,
        description: _0x1dc2d1
      });
      return;
    }
    if (_0x317dd1 === "prompt") {
      _0x5832a9 = true;
      if (!_0x507612) {
        _0x507612 = normalizeText(_0x47eaef.get(_0x31c75b.index)?.description);
      }
      _0x415576.push({
        nodeId: _0x31c75b.nodeId,
        inputName: _0x31c75b.inputName,
        source: "prompt",
        defaultValue: _0x5cecb1.defaultValue,
        includeEmpty: true,
        description: _0x1dc2d1
      });
      return;
    }
    const _0x299630 = createComponentId(_0x31c75b, _0x4b34c5);
    const _0x57cd55 = normalizeControlType(_0x5cecb1.controlType);
    const _0x44ad52 = getUiSchemaTypeForControl(_0x57cd55);
    const _0x4becb1 = normalizeDefaultValueForControl(_0x57cd55, _0x5cecb1.defaultValue);
    const _0x28308d = getNodeTransformForControl(_0x57cd55);
    _0x329b32.push({
      id: _0x299630,
      type: _0x44ad52,
      placement: _0x5cecb1.previewPlacement === "home" ? "mode" : "advanced",
      ...(_0x5cecb1.previewPlacement === "home" ? {
        variant: "rhAiAppFooterParam",
        displayOrder: _0x5cecb1.homeParamOrder
      } : {
        displayOrder: _0x5cecb1.advancedParamOrder
      }),
      label: _0x4b0841,
      defaultValue: _0x4becb1,
      description: _0x1dc2d1,
      customAiAppComponentIndex: _0x31c75b.index,
      comfyUiComponentIndex: _0x31c75b.index,
      ...(_0x44ad52 === "stepper" ? {
        step: _0x57cd55 === "float" ? getFloatStep(_0x4becb1) : 1,
        ...(_0x57cd55 === "float" ? {
          valueType: "float"
        } : {})
      } : {})
    });
    _0x415576.push({
      nodeId: _0x31c75b.nodeId,
      inputName: _0x31c75b.inputName,
      source: "param",
      field: _0x299630,
      defaultValue: _0x4becb1,
      ...(_0x28308d ? {
        transform: _0x28308d
      } : {}),
      description: _0x1dc2d1
    });
  });
  const _0x38fa58 = buildInputSlotCounts(_0x357f19);
  const _0x2aeb1d = Array.from(new Set([...(_0x5832a9 ? ["text"] : []), ..._0x357f19.map(_0x1c08bd => _0x1c08bd.kind)]));
  const _0x2f41d6 = _0x357f19.map((_0x3df6f7, _0x4fbbb8) => ({
    ..._0x3df6f7,
    _sourceOrder: _0x4fbbb8
  })).sort((_0x3415f3, _0x5ece49) => {
    const _0x4e4097 = normalizeOrderValue(_0x3415f3.displayOrder, _0x3415f3._sourceOrder) - normalizeOrderValue(_0x5ece49.displayOrder, _0x5ece49._sourceOrder);
    if (_0x4e4097 !== 0) {
      return _0x4e4097;
    }
    return _0x3415f3._sourceOrder - _0x5ece49._sourceOrder;
  }).map(({
    _sourceOrder: _0x3b2140,
    ..._0x2f0ce9
  }, _0x3af149) => ({
    ..._0x2f0ce9,
    displayOrder: _0x3af149
  }));
  const _0x148483 = _0x329b32.sort((_0x3e2336, _0x4b3462) => {
    const _0x33f106 = String(_0x3e2336?.placement || "").localeCompare(String(_0x4b3462?.placement || ""));
    if (_0x33f106 !== 0) {
      return _0x33f106;
    }
    return normalizeOrderValue(_0x3e2336?.displayOrder, Number.MAX_SAFE_INTEGER) - normalizeOrderValue(_0x4b3462?.displayOrder, Number.MAX_SAFE_INTEGER);
  });
  const _0x3fcdf2 = normalizeText(_0xd61877.promptHelpTooltip);
  return {
    fixedSlots: _0x2f41d6,
    uiFields: _0x148483,
    inputSlots: {
      allowedKinds: _0x2aeb1d.slice(),
      minByKind: {
        ..._0x38fa58
      },
      maxByKind: {
        ..._0x38fa58
      },
      fixedSlots: _0x2f41d6
    },
    capabilities: {
      inputKinds: _0x2aeb1d.slice(),
      outputType: _0x86a7bf,
      fixedAssetSlots: _0x2f41d6.map(_0x148a2d => _0x148a2d.id)
    },
    mapping: {
      workflow: _0x3fe321.workflow,
      inputs: _0x415576
    },
    help: _0x3fcdf2 || _0x507612 ? {
      tooltip: _0x3fcdf2 || _0x507612
    } : null,
    prompt: {
      emptyPolicy: "allow"
    }
  };
}
function classTypeLooksLikeOutput(_0x1d31af, _0x118118) {
  const _0x45c1c4 = String(_0x118118 || "").toLowerCase();
  if (_0x1d31af === "video") {
    return _0x45c1c4.includes("video") || _0x45c1c4.includes("vhs") || _0x45c1c4.includes("webp") || _0x45c1c4.includes("gif");
  }
  if (_0x1d31af === "audio") {
    return _0x45c1c4.includes("audio") || _0x45c1c4.includes("sound");
  }
  return _0x45c1c4.includes("saveimage") || _0x45c1c4.includes("previewimage") || _0x45c1c4.includes("image");
}
function inferOutputNodes(_0x4032e8, _0x359da6) {
  return sortNodeEntries(_0x4032e8).filter(([, _0x3a06c0]) => classTypeLooksLikeOutput(_0x359da6, _0x3a06c0?.class_type || _0x3a06c0?.classType)).map(([_0x330f44]) => String(_0x330f44));
}
function buildResultConfig(_0x56617c, _0xae238b) {
  const _0x2c17ed = inferOutputNodes(_0x56617c, _0xae238b);
  if (_0xae238b === "video") {
    return {
      outputType: "video",
      taskIdPath: "prompt_id",
      resultPaths: ["videos[].url", "video_urls[]", "results[].videoUrl", "results[].url"],
      ...(_0x2c17ed.length ? {
        outputNodes: _0x2c17ed
      } : {})
    };
  }
  if (_0xae238b === "audio") {
    return {
      outputType: "audio",
      taskIdPath: "prompt_id",
      resultPaths: ["audios[].url", "audio_urls[]", "results[].audioUrl", "results[].url"],
      ...(_0x2c17ed.length ? {
        outputNodes: _0x2c17ed
      } : {})
    };
  }
  return {
    outputType: "image",
    taskIdPath: "prompt_id",
    resultPaths: ["images[].url", "image_urls[]", "results[].imageUrl", "results[].url"],
    ...(_0x2c17ed.length ? {
      outputNodes: _0x2c17ed
    } : {})
  };
}
function buildComfyUiSystemUiFields(_0x1d9fab) {
  if (_0x1d9fab !== "image") {
    return [];
  }
  return [COMFYUI_GENERATION_COUNT_FIELD];
}
function isComfyUiSystemUiField(_0x4b8e64) {
  return _0x4b8e64?.comfyUiSystemField === true;
}
function getComfyUiWorkflowImageMenuGroup(_0x4ef886) {
  if (_0x4ef886 === "cloud") {
    return "comfyUiCloudWorkflow";
  } else {
    return "comfyUiLocalWorkflow";
  }
}
function getComfyUiWorkflowImageMenuIconKind(_0x23caab) {
  if (_0x23caab === "cloud") {
    return "comfyUiCloudWorkflowBadge";
  } else {
    return "comfyUiLocalWorkflowBadge";
  }
}
function getComfyUiWorkflowImageMenuSubtitle(_0x288373, _0x5e4b90 = "") {
  const _0x2c0bc9 = normalizeText(_0x5e4b90);
  if (_0x2c0bc9 && _0x2c0bc9 !== "ComfyUI cloud workflow" && _0x2c0bc9 !== "ComfyUI local workflow") {
    return _0x2c0bc9;
  }
  if (_0x288373 === "cloud") {
    return "ComfyUI 云端工作流";
  } else {
    return "ComfyUI 本地工作流";
  }
}
function buildModelExtensions(_0xe4e0f8, _0xce8286, _0x561a6b, _0x1f48e7 = "", _0x3c4cc6 = "", _0x99aab3 = {}) {
  const _0x4d7f7a = normalizeText(_0x1f48e7);
  const _0x1342e5 = Boolean(_0x4d7f7a);
  const _0x4f1625 = normalizeBaseUrlMode(_0x99aab3.baseUrlMode);
  const _0x5365b5 = normalizeComponentSelectionMode(_0x99aab3.componentSelectionMode);
  const _0x177ae9 = {
    comfyUiWorkflow: {
      workflowId: _0xce8286,
      kind: _0xe4e0f8,
      appKey: _0x4d7f7a,
      name: _0x561a6b,
      description: normalizeText(_0x3c4cc6),
      baseUrlMode: _0x4f1625,
      componentSelectionMode: _0x5365b5,
      isSavedApp: _0x1342e5
    }
  };
  if (_0x1342e5 && _0xe4e0f8 === "image") {
    _0x177ae9.imageMenu = {
      group: getComfyUiWorkflowImageMenuGroup(_0x4f1625),
      order: 999,
      title: _0x561a6b,
      subtitle: getComfyUiWorkflowImageMenuSubtitle(_0x4f1625, _0x3c4cc6),
      iconKind: getComfyUiWorkflowImageMenuIconKind(_0x4f1625)
    };
  }
  if (_0x1342e5 && _0xe4e0f8 === "video") {
    _0x177ae9.videoMenu = {
      role: "comfyUiWorkflow",
      group: getComfyUiWorkflowImageMenuGroup(_0x4f1625),
      order: 999,
      label: _0x561a6b,
      subtitle: getComfyUiWorkflowImageMenuSubtitle(_0x4f1625, _0x3c4cc6),
      iconKind: getComfyUiWorkflowImageMenuIconKind(_0x4f1625)
    };
  }
  if (_0x1342e5 && _0xe4e0f8 === "audio") {
    _0x177ae9.audioMenu = {
      group: getComfyUiWorkflowImageMenuGroup(_0x4f1625),
      order: 999,
      label: _0x561a6b,
      subtitle: getComfyUiWorkflowImageMenuSubtitle(_0x4f1625, _0x3c4cc6),
      iconKind: getComfyUiWorkflowImageMenuIconKind(_0x4f1625)
    };
  }
  return _0x177ae9;
}
export function buildComfyUiWorkflowManifestBundle({
  input: _0x2d5eb3,
  kind = "image",
  components = [],
  displayName = COMFYUI_WORKFLOW_DISPLAY_NAME,
  description = "",
  appKey = "",
  baseUrlMode = "local",
  componentSelectionMode = "auto",
  promptHelpTooltip = ""
} = {}) {
  const _0x4609cc = parseComfyUiWorkflowApiInput(_0x2d5eb3);
  const _0x41a476 = normalizeOutputKind(kind);
  const _0x173eae = normalizeBaseUrlMode(baseUrlMode);
  const _0x1afa4f = normalizeComponentSelectionMode(componentSelectionMode);
  const _0xe4794 = normalizeText(displayName, COMFYUI_WORKFLOW_DISPLAY_NAME);
  const _0x483004 = normalizeText(description) || (_0x173eae === "cloud" ? "ComfyUI cloud workflow" : "ComfyUI local workflow");
  const _0x997b0b = normalizeText(promptHelpTooltip);
  const _0xcf83e8 = createStableHash(JSON.stringify({
    kind: _0x41a476,
    appKey: normalizeText(appKey),
    description: _0x483004,
    promptHelpTooltip: _0x997b0b,
    baseUrlMode: _0x173eae,
    componentSelectionMode: _0x1afa4f,
    workflow: _0x4609cc.workflow,
    components: components
  }));
  const _0x354a0a = "comfyui-" + _0x41a476 + "-" + _0xcf83e8;
  const _0x283b5d = "comfyui/workflow-" + _0x41a476 + "-" + _0xcf83e8;
  const _0x369ab5 = "comfyui.workflow." + _0x41a476 + "." + _0xcf83e8 + ".v1";
  const _0x2d758b = buildManifestParts(_0x4609cc, _0x41a476, components, {
    componentSelectionMode: _0x1afa4f,
    promptHelpTooltip: _0x997b0b
  });
  const _0x26ef31 = [...buildComfyUiSystemUiFields(_0x41a476), ..._0x2d758b.uiFields];
  return buildManifestDraftBundle({
    sourceId: "comfyui-workflow:" + _0x41a476 + ":" + _0xcf83e8,
    modelId: _0x283b5d,
    executionId: _0x369ab5,
    provider: "comfyui",
    adapterType: "workflow",
    kind: _0x41a476,
    outputType: _0x41a476,
    displayName: _0xe4794,
    description: _0x483004,
    workflowId: _0x354a0a,
    submitMode: "comfyui-prompt",
    queryMode: "comfyui-history",
    mapping: _0x2d758b.mapping,
    uiFields: _0x26ef31,
    inputSlots: _0x2d758b.inputSlots,
    help: _0x2d758b.help,
    prompt: _0x2d758b.prompt,
    capabilities: _0x2d758b.capabilities,
    modelExtensions: buildModelExtensions(_0x41a476, _0x354a0a, _0xe4794, appKey, _0x483004, {
      baseUrlMode: _0x173eae,
      componentSelectionMode: _0x1afa4f
    }),
    executionExtensions: {
      comfyui: {
        baseUrlMode: _0x173eae,
        componentSelectionMode: _0x1afa4f
      }
    },
    result: buildResultConfig(_0x4609cc.workflow, _0x41a476)
  });
}
export function summarizeComfyUiWorkflowBundle(_0x1b7c7a) {
  const _0x3b8273 = _0x1b7c7a?.models?.[0] || {};
  const _0x369030 = _0x1b7c7a?.executions?.[0] || {};
  const _0x43ef52 = Array.isArray(_0x3b8273?.inputSlots?.fixedSlots) ? _0x3b8273.inputSlots.fixedSlots : [];
  const _0x272483 = Array.isArray(_0x3b8273?.uiSchema?.fields) ? _0x3b8273.uiSchema.fields : [];
  const _0xd8afc5 = _0x272483.filter(_0x5a4662 => !isComfyUiSystemUiField(_0x5a4662));
  const _0x5340f6 = Array.isArray(_0x369030?.mapping?.inputs) ? _0x369030.mapping.inputs : [];
  return {
    workflowId: _0x369030.workflowId || "",
    kind: _0x3b8273.kind || _0x369030.kind || "",
    modelId: _0x3b8273.modelId || "",
    displayName: _0x3b8273.displayName || "",
    baseUrlMode: _0x369030.extensions?.comfyui?.baseUrlMode || _0x3b8273.extensions?.comfyUiWorkflow?.baseUrlMode || "local",
    componentSelectionMode: _0x369030.extensions?.comfyui?.componentSelectionMode || _0x3b8273.extensions?.comfyUiWorkflow?.componentSelectionMode || "auto",
    slotCount: _0x43ef52.length,
    paramCount: _0xd8afc5.length,
    mappingCount: _0x5340f6.length,
    slots: _0x43ef52.map(_0x267ed5 => ({
      id: _0x267ed5.id,
      kind: _0x267ed5.kind,
      label: _0x267ed5.label || _0x267ed5.id,
      required: _0x267ed5.required === true
    })),
    params: _0xd8afc5.map(_0x22b0a6 => ({
      id: _0x22b0a6.id,
      label: _0x22b0a6.label || _0x22b0a6.id,
      type: _0x22b0a6.type || "text",
      placement: _0x22b0a6.placement || "advanced",
      variant: _0x22b0a6.variant || ""
    }))
  };
}