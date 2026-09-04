import { buildManifestDraftBundle } from "../../manifests/index.js";
import { resolveRunningHubSiteProfileIdFromUrl } from "../runningHubProviderProfiles.js";
import { RUNNINGHUB_DEVELOPER_INSTANCE_OPTIONS, RUNNINGHUB_INSTANCE_OPTIONS, normalizeRunningHubInstanceType } from "../runningHubInstanceTypes.js";
export const RH_AI_APP_DISPLAY_NAME = "RH AI应用";
export const RH_AI_APP_FOOTER_PARAM_LIMIT = 3;
const RUNNINGHUB_AI_APP_URL_RE = /https?:\/\/(?:www\.)?runninghub\.(?:cn|ai)\/openapi\/v2\/run\/ai-app\/([^'"`\s\\]+)/i;
const DATA_FLAG_RE = /--data(?:-raw|-binary)?\s+/i;
const MEDIA_FIELD_KINDS = new Set(["image", "video", "audio"]);
const OUTPUT_KINDS = new Set(["image", "video", "audio"]);
const COMPONENT_KINDS = new Set(["image", "video", "audio", "prompt", "param"]);
const CONTROL_TYPES = new Set(["text", "textarea", "stepper", "float", "toggle", "prompt"]);
const TEXT_CONTROL_OPTIONS = Object.freeze(["text", "textarea", "prompt"]);
const AMBIGUOUS_ZERO_CONTROL_OPTIONS = Object.freeze(["text", "stepper", "float"]);
const TEXT_COMPONENT_KIND_OPTIONS = Object.freeze(["param", "prompt"]);
const INSTANCE_FIELD = Object.freeze({
  id: "rhInstanceType",
  type: "segmented",
  placement: "instance",
  label: "显存",
  defaultValue: "default",
  options: RUNNINGHUB_INSTANCE_OPTIONS,
  developerOptions: RUNNINGHUB_DEVELOPER_INSTANCE_OPTIONS
});
function normalizeText(_0x4d4be8, _0x22a5bf = "") {
  const _0x5b2c12 = String(_0x4d4be8 ?? "").trim();
  return _0x5b2c12 || _0x22a5bf;
}
function normalizeOutputKind(_0x3eb0cc) {
  const _0x523926 = String(_0x3eb0cc || "").trim().toLowerCase();
  if (OUTPUT_KINDS.has(_0x523926)) {
    return _0x523926;
  } else {
    return "image";
  }
}
function normalizeInstanceType(_0x2d8293) {
  return normalizeRunningHubInstanceType(_0x2d8293);
}
function sanitizeIdentifierPart(_0x2a8cf0, _0x3b02c4 = "field") {
  const _0x198a18 = String(_0x2a8cf0 || "").trim().toLowerCase().replace(/[^a-z0-9_-]+/g, "_").replace(/^_+|_+$/g, "");
  return _0x198a18 || _0x3b02c4;
}
function createStableHash(_0x2ed263) {
  const _0x4e34d2 = String(_0x2ed263 || "");
  let _0x3e4e9a = 2166136261;
  for (let _0x531dd7 = 0; _0x531dd7 < _0x4e34d2.length; _0x531dd7 += 1) {
    _0x3e4e9a ^= _0x4e34d2.charCodeAt(_0x531dd7);
    _0x3e4e9a = Math.imul(_0x3e4e9a, 16777619);
  }
  return (_0x3e4e9a >>> 0).toString(36).padStart(7, "0").slice(0, 8);
}
function stripCurlLineContinuations(_0x1858b7) {
  return String(_0x1858b7 || "").replace(/\\\r?\n/g, "\n");
}
function readQuotedCurlValue(_0x429492, _0x575f7b) {
  let _0x192a15 = _0x575f7b;
  while (_0x192a15 < _0x429492.length && /\s/.test(_0x429492[_0x192a15])) {
    _0x192a15 += 1;
  }
  const _0x233793 = _0x429492[_0x192a15];
  if (_0x233793 !== "'" && _0x233793 !== "\"") {
    const _0x207c79 = _0x429492.slice(_0x192a15);
    const _0x4f5291 = _0x207c79.split(/\r?\n/)[0] || _0x207c79;
    return _0x4f5291.trim();
  }
  _0x192a15 += 1;
  let _0x57cd24 = "";
  for (; _0x192a15 < _0x429492.length; _0x192a15 += 1) {
    const _0x44f525 = _0x429492[_0x192a15];
    if (_0x44f525 === _0x233793) {
      const _0xc56857 = _0x429492[_0x192a15 - 1] === "\\";
      if (!_0xc56857 || _0x233793 === "'") {
        return _0x57cd24;
      }
    }
    _0x57cd24 += _0x44f525;
  }
  return _0x57cd24.trim();
}
function extractCurlDataPayload(_0x40a771) {
  const _0x27e2bd = stripCurlLineContinuations(_0x40a771);
  const _0x24586d = DATA_FLAG_RE.exec(_0x27e2bd);
  if (!_0x24586d) {
    return "";
  }
  return readQuotedCurlValue(_0x27e2bd, _0x24586d.index + _0x24586d[0].length);
}
function extractFirstJsonObject(_0x22e398) {
  const _0x2b003f = String(_0x22e398 || "");
  const _0x10683d = _0x2b003f.indexOf("{");
  if (_0x10683d < 0) {
    return "";
  }
  let _0x6b25a6 = 0;
  let _0x2cd00d = false;
  let _0x3f5143 = "";
  let _0x164b54 = false;
  for (let _0x1aa0a1 = _0x10683d; _0x1aa0a1 < _0x2b003f.length; _0x1aa0a1 += 1) {
    const _0x105e3d = _0x2b003f[_0x1aa0a1];
    if (_0x2cd00d) {
      if (_0x164b54) {
        _0x164b54 = false;
        continue;
      }
      if (_0x105e3d === "\\") {
        _0x164b54 = true;
        continue;
      }
      if (_0x105e3d === _0x3f5143) {
        _0x2cd00d = false;
        _0x3f5143 = "";
      }
      continue;
    }
    if (_0x105e3d === "\"" || _0x105e3d === "'") {
      _0x2cd00d = true;
      _0x3f5143 = _0x105e3d;
      continue;
    }
    if (_0x105e3d === "{") {
      _0x6b25a6 += 1;
    }
    if (_0x105e3d === "}") {
      _0x6b25a6 -= 1;
      if (_0x6b25a6 === 0) {
        return _0x2b003f.slice(_0x10683d, _0x1aa0a1 + 1);
      }
    }
  }
  return "";
}
function extractAiAppId(_0x50eb02, _0x1891de = {}, _0x2f1414 = "") {
  const _0x28f557 = normalizeText(_0x2f1414);
  if (_0x28f557) {
    return _0x28f557;
  }
  const _0x21e0d2 = String(_0x50eb02 || "");
  const _0x15af5e = _0x21e0d2.match(RUNNINGHUB_AI_APP_URL_RE);
  const _0x41dbc8 = normalizeText(_0x15af5e?.[1]);
  if (_0x41dbc8) {
    return _0x41dbc8;
  }
  return normalizeText(_0x1891de.appId || _0x1891de.workflowId || _0x1891de.aiAppId);
}
function parseJsonPayload(_0x4e72fc) {
  try {
    return JSON.parse(_0x4e72fc);
  } catch (_0x565a5e) {
    throw new Error("RH AI应用 JSON 解析失败：" + (_0x565a5e?.message || "格式错误"));
  }
}
export function parseRunningHubAiAppInput(_0x31fff3, {
  appId: _0x555624 = ""
} = {}) {
  const _0x55e944 = String(_0x31fff3 || "").trim();
  if (!_0x55e944) {
    throw new Error("请粘贴 RunningHub AI App 的 curl 或 JSON");
  }
  const _0x1c5b14 = (_0x55e944.startsWith("{") ? _0x55e944 : "") || extractCurlDataPayload(_0x55e944) || extractFirstJsonObject(_0x55e944);
  if (!_0x1c5b14) {
    throw new Error("未找到 --data-raw JSON 请求体");
  }
  const _0x243dee = parseJsonPayload(_0x1c5b14);
  const _0x4f0aa2 = extractAiAppId(_0x55e944, _0x243dee, _0x555624);
  if (!_0x4f0aa2) {
    throw new Error("未找到 RunningHub AI App 的 appId");
  }
  if (!Array.isArray(_0x243dee.nodeInfoList) || _0x243dee.nodeInfoList.length === 0) {
    throw new Error("JSON 中缺少 nodeInfoList");
  }
  return {
    appId: _0x4f0aa2,
    body: _0x243dee,
    nodeInfoList: _0x243dee.nodeInfoList,
    providerProfileId: resolveRunningHubSiteProfileIdFromUrl(_0x55e944),
    sourceText: _0x55e944
  };
}
function normalizeFieldName(_0x5de183) {
  return String(_0x5de183 || "").trim();
}
function getFieldKind(_0x9ad361) {
  const _0x19630a = normalizeFieldName(_0x9ad361).toLowerCase();
  if (MEDIA_FIELD_KINDS.has(_0x19630a)) {
    return _0x19630a;
  } else {
    return "";
  }
}
function getDefaultComponentKind(_0xa3edc0) {
  const _0x4d8386 = getFieldKind(_0xa3edc0);
  if (_0x4d8386) {
    return _0x4d8386;
  }
  if (String(_0xa3edc0 || "").trim().toLowerCase() === "prompt") {
    return "prompt";
  } else {
    return "param";
  }
}
function createLabelFromDescription(_0x12a4c4, _0x2f55e9, _0xa627eb) {
  const _0x283f65 = normalizeText(_0x12a4c4);
  const _0x43c7d9 = normalizeFieldName(_0x2f55e9);
  if (!_0x283f65) {
    return _0xa627eb;
  }
  if (_0x43c7d9 && _0x283f65.toLowerCase().startsWith(_0x43c7d9.toLowerCase())) {
    return normalizeText(_0x283f65.slice(_0x43c7d9.length), _0x283f65);
  }
  return _0x283f65;
}
function isBooleanLiteral(_0x1193ff) {
  const _0x4f09ad = String(_0x1193ff ?? "").trim().toLowerCase();
  return _0x4f09ad === "true" || _0x4f09ad === "false";
}
function isIntegerLiteral(_0x4844ef) {
  return /^[+-]?\d+$/.test(String(_0x4844ef ?? "").trim());
}
function isDecimalLiteral(_0xe60a82) {
  return /^[+-]?(?:\d+\.\d+|\.\d+)$/.test(String(_0xe60a82 ?? "").trim());
}
function isAmbiguousZeroLiteral(_0x3efb0d) {
  return /^[+-]?0+$/.test(String(_0x3efb0d ?? "").trim());
}
function containsCjkText(_0x5d24cf) {
  return /[\u3400-\u9fff]/u.test(String(_0x5d24cf ?? ""));
}
function looksLikeLongEnglishText(_0x5c9e98) {
  const _0x51481c = String(_0x5c9e98 ?? "").trim();
  const _0x249fad = _0x51481c.match(/[A-Za-z][A-Za-z'-]*/g) || [];
  const _0x328803 = (_0x51481c.match(/[A-Za-z]/g) || []).length;
  return _0x249fad.length >= 4 || _0x328803 >= 28;
}
function looksLikeStructuredText(_0x910678) {
  const _0x2fd731 = String(_0x910678 ?? "").trim();
  if (!_0x2fd731) {
    return true;
  }
  return containsCjkText(_0x2fd731) || looksLikeLongEnglishText(_0x2fd731) || _0x2fd731.length > 42 || /[\s,.;:!?，。；：！？、]/.test(_0x2fd731) || /^[\[{]/.test(_0x2fd731);
}
function labelSuggestsPrompt(_0xbd9873, _0x1b9cd2) {
  const _0x3e66a1 = String(_0xbd9873 || "");
  const _0x384abd = String(_0x1b9cd2 || "").toLowerCase();
  return _0x384abd === "prompt" || /prompt|提示词|描述|文案|动作|内容|台词|歌词/i.test(_0x3e66a1);
}
function inferTextControlType(_0x432e1e, _0x1d97e2, _0x26c42f) {
  if (labelSuggestsPrompt(_0x1d97e2, _0x26c42f) || looksLikeStructuredText(_0x432e1e)) {
    return "textarea";
  }
  return "text";
}
function inferComponentConfig(_0x3258df, _0x48d0e6, _0x56c5a0) {
  const _0x86cc2c = String(_0x56c5a0 || "").trim().toLowerCase();
  const _0x8feae7 = getFieldKind(_0x56c5a0);
  if (_0x8feae7) {
    return {
      componentKind: _0x8feae7,
      componentKindLocked: true,
      componentKindOptions: [_0x8feae7],
      controlType: "text",
      controlTypeLocked: true,
      controlTypeOptions: []
    };
  }
  if (_0x86cc2c === "prompt") {
    return {
      componentKind: "prompt",
      componentKindLocked: true,
      componentKindOptions: ["prompt"],
      controlType: "prompt",
      controlTypeLocked: true,
      controlTypeOptions: []
    };
  }
  if (_0x86cc2c === "index") {
    return {
      componentKind: "param",
      componentKindLocked: true,
      componentKindOptions: ["param"],
      controlType: "stepper",
      controlTypeLocked: true,
      controlTypeOptions: ["stepper"]
    };
  }
  if (isBooleanLiteral(_0x3258df)) {
    return {
      componentKind: "param",
      componentKindLocked: true,
      componentKindOptions: ["param"],
      controlType: "toggle",
      controlTypeLocked: true,
      controlTypeOptions: ["toggle"]
    };
  }
  if (isDecimalLiteral(_0x3258df)) {
    return {
      componentKind: "param",
      componentKindLocked: true,
      componentKindOptions: ["param"],
      controlType: "float",
      controlTypeLocked: true,
      controlTypeOptions: ["float"]
    };
  }
  if (isIntegerLiteral(_0x3258df)) {
    return {
      componentKind: "param",
      componentKindLocked: true,
      componentKindOptions: ["param"],
      controlType: "stepper",
      controlTypeLocked: !isAmbiguousZeroLiteral(_0x3258df),
      controlTypeOptions: isAmbiguousZeroLiteral(_0x3258df) ? AMBIGUOUS_ZERO_CONTROL_OPTIONS.slice() : ["stepper"]
    };
  }
  return {
    componentKind: "param",
    componentKindLocked: false,
    componentKindOptions: TEXT_COMPONENT_KIND_OPTIONS.slice(),
    controlType: inferTextControlType(_0x3258df, _0x48d0e6, _0x56c5a0),
    controlTypeLocked: false,
    controlTypeOptions: TEXT_CONTROL_OPTIONS.slice()
  };
}
function normalizeComponentKind(_0xb47404, _0x47cdd2 = "param") {
  const _0x307b78 = String(_0xb47404 || "").trim().toLowerCase();
  if (COMPONENT_KINDS.has(_0x307b78)) {
    return _0x307b78;
  } else {
    return _0x47cdd2;
  }
}
function normalizeControlType(_0x2c7c69, _0x2c7932 = "text") {
  const _0x11bcda = String(_0x2c7c69 || "").trim().toLowerCase();
  if (_0x11bcda === "integer" || _0x11bcda === "number") {
    return "stepper";
  }
  if (_0x11bcda === "decimal") {
    return "float";
  }
  if (_0x11bcda === "boolean" || _0x11bcda === "bool") {
    return "toggle";
  }
  if (CONTROL_TYPES.has(_0x11bcda)) {
    return _0x11bcda;
  } else {
    return _0x2c7932;
  }
}
function normalizeBooleanDefault(_0x47bf3c) {
  const _0x4a0b74 = String(_0x47bf3c ?? "").trim().toLowerCase();
  return _0x47bf3c === true || _0x4a0b74 === "true" || _0x4a0b74 === "1" || _0x4a0b74 === "yes" || _0x4a0b74 === "on";
}
function normalizeIntegerDefault(_0x35a5a5) {
  const _0x74ca56 = Number(_0x35a5a5);
  if (Number.isFinite(_0x74ca56)) {
    return Math.trunc(_0x74ca56);
  } else {
    return 0;
  }
}
function normalizeFloatDefault(_0x2b3537) {
  const _0x3b34b0 = Number(_0x2b3537);
  if (Number.isFinite(_0x3b34b0)) {
    return _0x3b34b0;
  } else {
    return 0;
  }
}
function normalizeDefaultValueForControl(_0x4bbe0a, _0x110515) {
  const _0x38856e = normalizeControlType(_0x4bbe0a);
  if (_0x38856e === "toggle") {
    return normalizeBooleanDefault(_0x110515);
  }
  if (_0x38856e === "stepper") {
    return normalizeIntegerDefault(_0x110515);
  }
  if (_0x38856e === "float") {
    return normalizeFloatDefault(_0x110515);
  }
  return String(_0x110515 ?? "");
}
function normalizeOrderValue(_0x1382b9, _0x22ed8f) {
  const _0x38199e = Number(_0x1382b9);
  if (Number.isFinite(_0x38199e)) {
    return _0x38199e;
  } else {
    return _0x22ed8f;
  }
}
function normalizePreviewPlacement(_0x5ad089) {
  if (String(_0x5ad089 || "").trim() === "home") {
    return "home";
  } else {
    return "advanced";
  }
}
function getNodeTransformForControl(_0x19c738) {
  const _0x477f89 = normalizeControlType(_0x19c738);
  if (_0x477f89 === "toggle") {
    return "booleanString";
  }
  if (_0x477f89 === "stepper") {
    return "integer";
  }
  if (_0x477f89 === "float") {
    return "number";
  }
  return "";
}
function getUiSchemaTypeForControl(_0x5a0c29) {
  const _0x3f9688 = normalizeControlType(_0x5a0c29);
  if (_0x3f9688 === "float") {
    return "stepper";
  } else {
    return _0x3f9688;
  }
}
function getFloatStep(_0x5b3c68) {
  const _0x13a0cc = String(_0x5b3c68 ?? "").trim();
  const _0x598e5d = _0x13a0cc.match(/\.(\d+)/);
  const _0x3be24b = _0x598e5d ? Math.max(1, _0x598e5d[1].length) : 2;
  return Number("0." + "0".repeat(Math.max(0, _0x3be24b - 1)) + "1");
}
function createParamFieldId(_0x38bede, _0x14c08c) {
  const _0x51bee5 = sanitizeIdentifierPart(_0x38bede?.nodeId, "node_" + _0x14c08c);
  const _0x373bab = sanitizeIdentifierPart(_0x38bede?.fieldName, "value");
  return "rh_aiapp_" + _0x51bee5 + "_" + _0x373bab + "_" + _0x14c08c;
}
function createSlotId(_0xf8e95d, _0x16d521, _0x88299e) {
  const _0x27cd02 = sanitizeIdentifierPart(_0x16d521?.nodeId, "node_" + _0x88299e);
  return "rh_aiapp_" + _0xf8e95d + "_" + _0x27cd02 + "_" + _0x88299e;
}
function buildInputSlotCounts(_0x24acf4) {
  return _0x24acf4.reduce((_0x5ede58, _0x277f7a) => {
    const _0x292272 = String(_0x277f7a?.kind || "").trim();
    if (!_0x292272) {
      return _0x5ede58;
    }
    _0x5ede58[_0x292272] = (_0x5ede58[_0x292272] || 0) + 1;
    return _0x5ede58;
  }, {});
}
function buildResultConfig(_0x586971) {
  if (_0x586971 === "video") {
    return {
      outputType: "video",
      taskIdPath: "taskId",
      videoPaths: ["results[].videoUrl", "results[].url", "videoUrl", "url"]
    };
  }
  if (_0x586971 === "audio") {
    return {
      outputType: "audio",
      taskIdPath: "taskId",
      audioPaths: ["results[].audioUrl", "results[].url", "audioUrl", "url"]
    };
  }
  return {
    outputType: "image",
    taskIdPath: "taskId",
    imagePaths: ["results[].imageUrl", "results[].url", "imageUrl", "url"]
  };
}
function buildModelExtensions(_0x56e356, _0x643db6, _0x441a16, _0xcdb119 = "", _0x4e6843 = "") {
  const _0x4feb03 = normalizeText(_0x4e6843) || "AI App " + _0x643db6;
  const _0xa1d371 = normalizeText(_0xcdb119);
  const _0x1b53d1 = Boolean(_0xa1d371);
  const _0x288019 = {
    rhAiApp: {
      appId: _0x643db6,
      kind: _0x56e356,
      appKey: _0xa1d371,
      name: _0x441a16,
      description: normalizeText(_0x4e6843),
      isSavedApp: _0x1b53d1
    }
  };
  if (_0x1b53d1 && _0x56e356 === "image") {
    _0x288019.imageMenu = {
      group: "rhAiApp",
      order: 999,
      title: _0x441a16,
      subtitle: _0x4feb03,
      icon: "images/RH.png",
      iconAlt: "runninghub"
    };
  }
  if (_0x1b53d1 && _0x56e356 === "video") {
    _0x288019.videoMenu = {
      role: "rhAiApp",
      group: "rhAiApp",
      order: 999,
      label: _0x441a16,
      subtitle: _0x4feb03
    };
  }
  if (_0x1b53d1 && _0x56e356 === "audio") {
    _0x288019.audioMenu = {
      group: "rhAiApp",
      order: 999
    };
  }
  return _0x288019;
}
function normalizeNodeInfoItem(_0x961aa6, _0x55f747) {
  if (!_0x961aa6 || typeof _0x961aa6 !== "object" || Array.isArray(_0x961aa6)) {
    return null;
  }
  const _0x282ce0 = normalizeText(_0x961aa6.nodeId);
  const _0x446134 = normalizeFieldName(_0x961aa6.fieldName);
  if (!_0x282ce0 || !_0x446134) {
    return null;
  }
  return {
    nodeId: _0x282ce0,
    fieldName: _0x446134,
    fieldValue: _0x961aa6.fieldValue ?? "",
    description: normalizeText(_0x961aa6.description),
    index: _0x55f747
  };
}
export function createRunningHubAiAppComponentDrafts(_0x1437e5, {
  appId = ""
} = {}) {
  const _0x185187 = parseRunningHubAiAppInput(_0x1437e5, {
    appId: appId
  });
  return {
    parsed: _0x185187,
    components: _0x185187.nodeInfoList.map(normalizeNodeInfoItem).filter(Boolean).map(_0x2fe86d => {
      const _0x1373ff = getDefaultComponentKind(_0x2fe86d.fieldName);
      const _0x1d8b55 = createLabelFromDescription(_0x2fe86d.description, _0x2fe86d.fieldName, _0x2fe86d.fieldName);
      const _0x347bd8 = inferComponentConfig(_0x2fe86d.fieldValue, _0x1d8b55, _0x2fe86d.fieldName);
      const _0x52b9b2 = _0x347bd8.componentKind || _0x1373ff;
      const _0x106238 = {
        index: _0x2fe86d.index,
        nodeId: _0x2fe86d.nodeId,
        fieldName: _0x2fe86d.fieldName,
        description: _0x2fe86d.description,
        label: _0x1d8b55,
        componentKind: _0x52b9b2,
        componentKindLocked: _0x347bd8.componentKindLocked === true,
        componentKindOptions: _0x347bd8.componentKindOptions || [_0x1373ff],
        controlType: _0x347bd8.controlType,
        controlTypeLocked: _0x347bd8.controlTypeLocked === true,
        controlTypeOptions: _0x347bd8.controlTypeOptions || [],
        defaultValue: String(_0x2fe86d.fieldValue ?? "")
      };
      if (_0x52b9b2 === "param") {
        _0x106238.previewPlacement = "advanced";
        _0x106238.advancedParamOrder = _0x2fe86d.index;
      }
      return _0x106238;
    })
  };
}
function normalizeOptionList(_0xec93c5 = [], _0x55dd20 = null) {
  if (!Array.isArray(_0xec93c5)) {
    return [];
  }
  return _0xec93c5.map(_0x341214 => String(_0x341214 || "").trim().toLowerCase()).filter((_0x479577, _0x4b29f0, _0x565100) => {
    if (!_0x479577 || _0x565100.indexOf(_0x479577) !== _0x4b29f0) {
      return false;
    }
    return !_0x55dd20 || _0x55dd20.has(_0x479577);
  });
}
function pickAllowedValue(_0x4e2ad5, _0x524f60, _0xafccbb) {
  const _0x46bd6d = String(_0x4e2ad5 || "").trim().toLowerCase();
  if (_0x524f60.includes(_0x46bd6d)) {
    return _0x46bd6d;
  } else {
    return _0xafccbb;
  }
}
function normalizeComponentOverride(_0x3941f5, _0x38367b, _0xf1d953) {
  const _0x358424 = getDefaultComponentKind(_0x38367b.fieldName);
  const _0x57ffab = inferComponentConfig(_0x38367b.fieldValue, _0xf1d953, _0x38367b.fieldName);
  const _0x4d8339 = normalizeOptionList(_0x57ffab.componentKindOptions, COMPONENT_KINDS);
  const _0x406043 = normalizeOptionList(_0x57ffab.controlTypeOptions, CONTROL_TYPES);
  const _0x11caa3 = normalizeControlType(_0x57ffab.controlType);
  const _0x1cf730 = normalizeComponentKind(_0x3941f5?.componentKind, _0x57ffab.componentKind || _0x358424);
  let _0x536201 = _0x57ffab.componentKindLocked === true ? _0x57ffab.componentKind : pickAllowedValue(_0x1cf730, _0x4d8339.length ? _0x4d8339 : [_0x1cf730], _0x57ffab.componentKind || _0x358424);
  const _0x29aa8f = normalizeControlType(_0x3941f5?.controlType, _0x11caa3);
  let _0x6b3fa9 = _0x536201 === "prompt" ? "prompt" : _0x57ffab.controlTypeLocked === true ? _0x11caa3 : pickAllowedValue(_0x29aa8f, _0x406043.length ? _0x406043 : [_0x11caa3], _0x11caa3);
  if (_0x6b3fa9 === "prompt" && !_0x57ffab.componentKindLocked && _0x4d8339.includes("prompt")) {
    _0x536201 = "prompt";
  }
  return {
    label: normalizeText(_0x3941f5?.label, _0xf1d953),
    description: normalizeText(_0x3941f5?.description, _0x38367b.description || _0xf1d953),
    componentKind: _0x536201,
    componentKindLocked: _0x57ffab.componentKindLocked === true,
    componentKindOptions: _0x4d8339.length ? _0x4d8339 : [_0x536201],
    controlType: _0x6b3fa9,
    controlTypeLocked: _0x57ffab.controlTypeLocked === true,
    controlTypeOptions: _0x406043,
    inputOrder: normalizeOrderValue(_0x3941f5?.inputOrder, _0x38367b.index),
    homeParamOrder: normalizeOrderValue(_0x3941f5?.homeParamOrder, _0x38367b.index),
    advancedParamOrder: normalizeOrderValue(_0x3941f5?.advancedParamOrder, _0x38367b.index),
    previewPlacement: normalizePreviewPlacement(_0x3941f5?.previewPlacement),
    defaultValue: normalizeDefaultValueForControl(_0x6b3fa9, _0x3941f5?.defaultValue === undefined ? _0x38367b.fieldValue : _0x3941f5.defaultValue)
  };
}
function buildComponentOverrideMap(_0x1a83b6 = []) {
  const _0xe1fc17 = new Map();
  if (!Array.isArray(_0x1a83b6)) {
    return _0xe1fc17;
  }
  _0x1a83b6.forEach(_0x436b46 => {
    const _0x9224a5 = Number(_0x436b46?.index);
    if (!Number.isInteger(_0x9224a5) || _0x9224a5 < 0) {
      return;
    }
    _0xe1fc17.set(_0x9224a5, _0x436b46);
  });
  return _0xe1fc17;
}
function buildManifestParts(_0x1e2c64, _0x50373a, _0x55879d = [], _0x90f1a0 = {}) {
  const _0xa3f748 = [];
  const _0x582644 = [{
    ...INSTANCE_FIELD,
    defaultValue: normalizeInstanceType(_0x1e2c64.body?.instanceType)
  }];
  const _0x2f0280 = [];
  let _0x461387 = false;
  let _0x7b45da = "";
  const _0x2c9462 = buildComponentOverrideMap(_0x55879d);
  const _0x5796e7 = _0x1e2c64.nodeInfoList.map(normalizeNodeInfoItem).filter(Boolean).map((_0x3a86b8, _0x1e6024) => {
    const _0x3ed342 = createLabelFromDescription(_0x3a86b8.description, _0x3a86b8.fieldName, _0x3a86b8.fieldName);
    return {
      item: _0x3a86b8,
      index: _0x1e6024,
      component: normalizeComponentOverride(_0x2c9462.get(_0x3a86b8.index), _0x3a86b8, _0x3ed342)
    };
  });
  const _0x3db32f = new Set(_0x5796e7.filter(({
    component: _0x3e9cbd
  }) => _0x3e9cbd.componentKind === "param" && _0x3e9cbd.previewPlacement === "home").sort((_0x1f5440, _0x288661) => {
    const _0x1f8d13 = normalizeOrderValue(_0x1f5440.component.homeParamOrder, _0x1f5440.item.index) - normalizeOrderValue(_0x288661.component.homeParamOrder, _0x288661.item.index);
    if (_0x1f8d13 !== 0) {
      return _0x1f8d13;
    }
    return _0x1f5440.index - _0x288661.index;
  }).slice(0, RH_AI_APP_FOOTER_PARAM_LIMIT).map(({
    item: _0x2734fc
  }) => _0x2734fc.index));
  _0x5796e7.forEach(({
    item: _0x1e0cff,
    index: _0x1b4c5c,
    component: _0x2db21b
  }) => {
    const _0x49eaad = _0x2db21b.label;
    const _0x5de93a = _0x2db21b.description || _0x1e0cff.description || _0x49eaad;
    const _0x58c3aa = _0x2db21b.componentKind;
    if (MEDIA_FIELD_KINDS.has(_0x58c3aa)) {
      const _0x59e8d4 = createSlotId(_0x58c3aa, _0x1e0cff, _0x1b4c5c);
      _0xa3f748.push({
        id: _0x59e8d4,
        kind: _0x58c3aa,
        label: _0x49eaad,
        description: _0x5de93a,
        required: true,
        displayOrder: _0x2db21b.inputOrder,
        customAiAppComponentIndex: _0x1e0cff.index,
        rhAiAppComponentIndex: _0x1e0cff.index
      });
      _0x2f0280.push({
        nodeId: _0x1e0cff.nodeId,
        fieldName: _0x1e0cff.fieldName,
        source: _0x58c3aa + "Input",
        field: _0x59e8d4,
        slot: _0x59e8d4,
        urlField: _0x59e8d4,
        required: true,
        missingMessage: "请接入" + _0x49eaad,
        description: _0x5de93a
      });
      return;
    }
    if (_0x58c3aa === "prompt") {
      _0x461387 = true;
      if (!_0x7b45da) {
        _0x7b45da = normalizeText(_0x2c9462.get(_0x1e0cff.index)?.description || _0x1e0cff.description);
      }
      _0x2f0280.push({
        nodeId: _0x1e0cff.nodeId,
        fieldName: _0x1e0cff.fieldName,
        source: "prompt",
        defaultValue: _0x2db21b.defaultValue,
        description: _0x5de93a || "提示词"
      });
      return;
    }
    const _0x256992 = createParamFieldId(_0x1e0cff, _0x1b4c5c);
    const _0xc4d06e = normalizeControlType(_0x2db21b.controlType);
    const _0x1e1696 = getUiSchemaTypeForControl(_0xc4d06e);
    const _0x4ed2af = normalizeDefaultValueForControl(_0xc4d06e, _0x2db21b.defaultValue);
    const _0x353d3a = getNodeTransformForControl(_0xc4d06e);
    const _0x1963db = _0x2db21b.previewPlacement === "home" && _0x3db32f.has(_0x1e0cff.index);
    _0x582644.push({
      id: _0x256992,
      type: _0x1e1696,
      placement: _0x1963db ? "mode" : "advanced",
      ...(_0x1963db ? {
        variant: "rhAiAppFooterParam",
        displayOrder: _0x2db21b.homeParamOrder
      } : {
        displayOrder: _0x2db21b.advancedParamOrder
      }),
      label: _0x49eaad,
      defaultValue: _0x4ed2af,
      description: _0x5de93a,
      customAiAppComponentIndex: _0x1e0cff.index,
      rhAiAppComponentIndex: _0x1e0cff.index,
      ...(_0x1e1696 === "stepper" ? {
        step: _0xc4d06e === "float" ? getFloatStep(_0x4ed2af) : 1,
        ...(_0xc4d06e === "float" ? {
          valueType: "float"
        } : {})
      } : {})
    });
    _0x2f0280.push({
      nodeId: _0x1e0cff.nodeId,
      fieldName: _0x1e0cff.fieldName,
      source: "param",
      field: _0x256992,
      defaultValue: _0x4ed2af,
      ...(_0x353d3a ? {
        transform: _0x353d3a
      } : {}),
      description: _0x5de93a
    });
  });
  const _0x12a26e = buildInputSlotCounts(_0xa3f748);
  const _0x23fcba = Array.from(new Set([...(_0x461387 ? ["text"] : []), ..._0xa3f748.map(_0x51cd2f => _0x51cd2f.kind)]));
  const _0x30a87f = _0xa3f748.map((_0x124bb3, _0x359bd5) => ({
    ..._0x124bb3,
    _sourceOrder: _0x359bd5
  })).sort((_0x30769c, _0x5d92cb) => {
    const _0x3e38c1 = normalizeOrderValue(_0x30769c.displayOrder, _0x30769c._sourceOrder) - normalizeOrderValue(_0x5d92cb.displayOrder, _0x5d92cb._sourceOrder);
    if (_0x3e38c1 !== 0) {
      return _0x3e38c1;
    }
    return _0x30769c._sourceOrder - _0x5d92cb._sourceOrder;
  }).map(({
    _sourceOrder: _0x1c4808,
    ..._0x3f8bb8
  }, _0x4a3c21) => ({
    ..._0x3f8bb8,
    displayOrder: _0x4a3c21
  }));
  const _0x3f78d6 = [_0x582644[0], ..._0x582644.slice(1).sort((_0x2c27e6, _0x4f0541) => {
    const _0xf30e05 = String(_0x2c27e6?.placement || "").localeCompare(String(_0x4f0541?.placement || ""));
    if (_0xf30e05 !== 0) {
      return _0xf30e05;
    }
    return normalizeOrderValue(_0x2c27e6?.displayOrder, Number.MAX_SAFE_INTEGER) - normalizeOrderValue(_0x4f0541?.displayOrder, Number.MAX_SAFE_INTEGER);
  })];
  const _0x5395a9 = normalizeText(_0x90f1a0.promptHelpTooltip);
  return {
    fixedSlots: _0x30a87f,
    uiFields: _0x3f78d6,
    nodeInfoList: _0x2f0280,
    inputSlots: {
      allowedKinds: _0x23fcba.slice(),
      minByKind: {
        ..._0x12a26e
      },
      maxByKind: {
        ..._0x12a26e
      },
      fixedSlots: _0x30a87f
    },
    capabilities: {
      inputKinds: _0x23fcba.slice(),
      outputType: _0x50373a,
      fixedAssetSlots: _0x30a87f.map(_0x4c927b => _0x4c927b.id)
    },
    help: _0x5395a9 || _0x7b45da ? {
      tooltip: _0x5395a9 || _0x7b45da
    } : null,
    prompt: {
      emptyPolicy: "allow",
      visible: _0x461387
    }
  };
}
export function buildRunningHubAiAppManifestBundle({
  input: _0x4f0581,
  appId = "",
  kind = "image",
  components = [],
  displayName = RH_AI_APP_DISPLAY_NAME,
  description = "",
  promptHelpTooltip = "",
  appKey = ""
} = {}) {
  const _0x3999b3 = parseRunningHubAiAppInput(_0x4f0581, {
    appId: appId
  });
  const _0x514186 = normalizeOutputKind(kind);
  const _0x59cf31 = normalizeText(displayName, RH_AI_APP_DISPLAY_NAME);
  const _0x1264ff = normalizeText(description) || "RunningHub AI App " + _0x3999b3.appId;
  const _0x1d2719 = normalizeText(promptHelpTooltip);
  const _0x539961 = createStableHash(JSON.stringify({
    appId: _0x3999b3.appId,
    appKey: normalizeText(appKey),
    kind: _0x514186,
    description: _0x1264ff,
    promptHelpTooltip: _0x1d2719,
    nodeInfoList: _0x3999b3.nodeInfoList,
    components: components
  }));
  const _0x1b44c2 = "runninghub/ai-app-" + _0x514186 + "-" + _0x3999b3.appId + "-" + _0x539961;
  const _0x3b4819 = "runninghub.workflow." + _0x514186 + ".ai-app-" + _0x3999b3.appId + "-" + _0x539961 + ".v1";
  const _0x45afbe = buildManifestParts(_0x3999b3, _0x514186, components, {
    promptHelpTooltip: _0x1d2719
  });
  return buildManifestDraftBundle({
    sourceId: "runninghub-ai-app:" + _0x514186 + ":" + _0x3999b3.appId + ":" + _0x539961,
    modelId: _0x1b44c2,
    executionId: _0x3b4819,
    provider: "runninghubwf",
    adapterType: "workflow",
    kind: _0x514186,
    outputType: _0x514186,
    displayName: _0x59cf31,
    description: _0x1264ff,
    icon: "images/RH.png",
    vip: true,
    appId: _0x3999b3.appId,
    submitMode: "openapi-v2-ai-app",
    queryMode: "openapi-v2-query",
    mapping: {
      nodeInfoList: _0x45afbe.nodeInfoList
    },
    instanceType: {
      field: "rhInstanceType",
      defaultValue: normalizeInstanceType(_0x3999b3.body?.instanceType)
    },
    uiFields: _0x45afbe.uiFields,
    inputSlots: _0x45afbe.inputSlots,
    help: _0x45afbe.help,
    prompt: _0x45afbe.prompt,
    modelExtensions: buildModelExtensions(_0x514186, _0x3999b3.appId, _0x59cf31, appKey, _0x1264ff),
    result: buildResultConfig(_0x514186)
  });
}
export function summarizeRunningHubAiAppBundle(_0x42d7e8) {
  const _0x14a076 = _0x42d7e8?.models?.[0] || {};
  const _0x30b311 = _0x42d7e8?.executions?.[0] || {};
  const _0x3a0456 = Array.isArray(_0x14a076?.inputSlots?.fixedSlots) ? _0x14a076.inputSlots.fixedSlots : [];
  const _0x54ce57 = Array.isArray(_0x14a076?.uiSchema?.fields) ? _0x14a076.uiSchema.fields : [];
  return {
    appId: _0x30b311.appId || _0x30b311.workflowId || "",
    kind: _0x14a076.kind || _0x30b311.kind || "",
    modelId: _0x14a076.modelId || "",
    displayName: _0x14a076.displayName || "",
    slotCount: _0x3a0456.length,
    paramCount: _0x54ce57.filter(_0x4aabd3 => _0x4aabd3?.id !== "rhInstanceType").length,
    slots: _0x3a0456.map(_0x2abd8d => ({
      id: _0x2abd8d.id,
      kind: _0x2abd8d.kind,
      label: _0x2abd8d.label || _0x2abd8d.id,
      required: _0x2abd8d.required === true
    })),
    params: _0x54ce57.filter(_0x48d4bd => _0x48d4bd?.id !== "rhInstanceType").map(_0x2cbe5b => ({
      id: _0x2cbe5b.id,
      label: _0x2cbe5b.label || _0x2cbe5b.id,
      type: _0x2cbe5b.type || "text",
      placement: _0x2cbe5b.placement || "advanced",
      variant: _0x2cbe5b.variant || ""
    }))
  };
}