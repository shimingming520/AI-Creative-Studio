import { getModelManifest, resolveModelExecution } from "../../manifests/index.js";
import { buildGenerationModelSelectionDisplayPatch } from "../shared/generationDisplayPolicy.js";
import { buildModelUiSchemaDefaultParams } from "../aigenImage/uiSchemaRenderer.js";
const VIDEO_WORKFLOW_DISPLAY_FIELDS = Object.freeze(["rhVideoResolution", "rhVideoFps", "rhVideoFrames", "rhVideoSeconds"]);
const RUNNINGHUB_VIDEO_V54_PAYLOAD_RESOLVER = "runninghubVideoV54";
export function getPlainGenerationParams(_0xe84147) {
  if (_0xe84147 && typeof _0xe84147 === "object" && !Array.isArray(_0xe84147)) {
    return {
      ..._0xe84147
    };
  } else {
    return {};
  }
}
function normalizeUiPlacement(_0x4f9bee) {
  return String(_0x4f9bee || "").trim().toLowerCase();
}
function getRunningHubVideoWorkflowManifest(_0x3629c7) {
  const _0x4088c2 = getModelManifest(_0x3629c7);
  if (_0x4088c2?.provider === "runninghubwf" && _0x4088c2?.adapterType === "workflow" && _0x4088c2?.kind === "video") {
    return _0x4088c2;
  } else {
    return null;
  }
}
function isToolbarOnlyWorkflowManifest(_0x3401fd) {
  const _0x5c6ae4 = Array.isArray(_0x3401fd?.uiPlacement) ? _0x3401fd.uiPlacement : [];
  return _0x5c6ae4.includes("toolbar") && !_0x5c6ae4.includes("modelMenu");
}
function getRunningHubVideoWorkflowFields(_0x59922a, {
  includeToolbarOnly = false
} = {}) {
  const _0x1ccbe0 = getRunningHubVideoWorkflowManifest(_0x59922a);
  if (!_0x1ccbe0) {
    return [];
  }
  if (!includeToolbarOnly && isToolbarOnlyWorkflowManifest(_0x1ccbe0)) {
    return [];
  }
  const _0x21787b = _0x1ccbe0?.uiSchema?.fields;
  if (Array.isArray(_0x21787b)) {
    return _0x21787b;
  } else {
    return [];
  }
}
export function hasRunningHubVideoWorkflowUiPlacement(_0x55eb45, _0x289a6a, _0x5486bb = {}) {
  const _0xa8c892 = normalizeUiPlacement(_0x289a6a);
  if (!_0xa8c892) {
    return false;
  }
  return getRunningHubVideoWorkflowFields(_0x55eb45, _0x5486bb).some(_0x1d9177 => normalizeUiPlacement(_0x1d9177?.placement) === _0xa8c892);
}
export function hasRunningHubVideoWorkflowUiField(_0x159bd6, _0x1f807a, _0x360990 = {}) {
  const _0x2253e4 = String(_0x1f807a || "").trim();
  if (!_0x2253e4) {
    return false;
  }
  return getRunningHubVideoWorkflowFields(_0x159bd6, _0x360990).some(_0x7ded2f => String(_0x7ded2f?.id || "").trim() === _0x2253e4);
}
export function getRunningHubVideoWorkflowFpsOptions(_0x3d883b, {
  v54FpsOptions = [16, 24, 30]
} = {}) {
  const _0x447770 = getRunningHubVideoWorkflowFields(_0x3d883b);
  const _0x6ea54c = _0x447770.find(_0x9d4943 => String(_0x9d4943?.id || "").trim() === "rhVideoFps");
  const _0x3a7936 = (Array.isArray(_0x6ea54c?.options) ? _0x6ea54c.options : []).map(_0x427013 => Number(_0x427013?.value ?? _0x427013)).filter(Number.isFinite);
  const _0x541442 = _0x447770.some(_0xc4cc33 => String(_0xc4cc33?.id || "").trim() === "rhVideoSeconds");
  if (_0x541442 && _0x3a7936.length) {
    return _0x3a7936;
  }
  if (_0x541442) {
    return [16, 24];
  } else {
    return v54FpsOptions;
  }
}
function getManifestDisplayFieldIds(_0x388fff) {
  const _0x3b6470 = getModelManifest(_0x388fff)?.uiSchema?.fields;
  const _0x3f4050 = new Set((Array.isArray(_0x3b6470) ? _0x3b6470 : []).map(_0x19a6d6 => String(_0x19a6d6?.id || "").trim()));
  const _0x11d15f = VIDEO_WORKFLOW_DISPLAY_FIELDS.filter(_0x5d81b8 => _0x3f4050.has(_0x5d81b8));
  if (_0x11d15f.length) {
    return _0x11d15f;
  } else {
    return VIDEO_WORKFLOW_DISPLAY_FIELDS;
  }
}
function getDeclaredManifestDisplayFields(_0x211d2c) {
  const _0x3a5a39 = getModelManifest(_0x211d2c)?.uiSchema?.fields;
  const _0x3bee9a = new Set(VIDEO_WORKFLOW_DISPLAY_FIELDS);
  return (Array.isArray(_0x3a5a39) ? _0x3a5a39 : []).filter(_0x3bb247 => _0x3bee9a.has(String(_0x3bb247?.id || "").trim()));
}
function getDeclaredManifestField(_0x2b6000, _0x26e0ed) {
  const _0x5d1b50 = String(_0x26e0ed || "").trim();
  if (!_0x5d1b50) {
    return null;
  }
  const _0x1202d0 = getModelManifest(_0x2b6000)?.uiSchema?.fields;
  return (Array.isArray(_0x1202d0) ? _0x1202d0 : []).find(_0x4abca7 => String(_0x4abca7?.id || "").trim() === _0x5d1b50) || null;
}
function getRunningHubVideoExecution(_0x49214a) {
  try {
    const _0x29055e = resolveModelExecution(_0x49214a);
    return _0x29055e?.executionManifest || null;
  } catch {
    return null;
  }
}
export function getRunningHubVideoParameterPanelPolicy(_0x3189ca) {
  const _0x4a1e42 = getModelManifest(_0x3189ca)?.extensions?.videoParameterPanel;
  if (_0x4a1e42 && typeof _0x4a1e42 === "object" && !Array.isArray(_0x4a1e42)) {
    return _0x4a1e42;
  } else {
    return {};
  }
}
export function resolveBerniniVideoReplaceInputMode({
  hasSourceVideo = false,
  hasRefImage = false,
  hasReferenceVideo = false
} = {}) {
  if (hasSourceVideo && hasReferenceVideo) {
    return "videoVideo";
  }
  if (hasSourceVideo && hasRefImage) {
    return "videoImage";
  }
  if (hasSourceVideo) {
    return "video";
  }
  if (hasRefImage) {
    return "image";
  }
  return "none";
}
export function resolveBerniniFunctionForInputMode(_0x109010, _0x470616 = "") {
  const _0x35ddaf = {
    image: ["i2v", "r2v"],
    video: ["v2v", "mv2v"],
    videoImage: ["vi2v", "rv2v", "vrc2v"],
    videoVideo: ["ads2v"]
  };
  const _0x368f26 = _0x35ddaf[_0x109010] || [];
  const _0x4943c1 = String(_0x470616 || "").trim();
  if (_0x368f26.includes(_0x4943c1)) {
    return _0x4943c1;
  } else {
    return _0x368f26[0] || "";
  }
}
export function buildVideoWorkflowReferenceSummaryParamsPatch(_0x1bab3d = {}, _0x197284 = "", _0x24ade3 = {}) {
  const _0x303190 = getRunningHubVideoParameterPanelPolicy(_0x197284);
  const _0x58071a = _0x303190?.fixedSlotSummary;
  const _0x3ad13f = String(_0x58071a?.field || "").trim();
  if (!_0x3ad13f || _0x58071a?.resolver !== "berniniVideoReplaceInputMode") {
    return {};
  }
  const _0xae313f = Math.max(0, Number(_0x24ade3?.imageCount) || 0);
  const _0xab4abd = Math.max(0, Number(_0x24ade3?.videoCount) || 0);
  const _0x5a9de8 = resolveBerniniVideoReplaceInputMode({
    hasSourceVideo: _0xab4abd > 0,
    hasRefImage: _0xae313f > 0,
    hasReferenceVideo: _0xab4abd > 1
  });
  const _0x3fb10d = {
    [_0x3ad13f]: _0x5a9de8
  };
  const _0x3b3fe2 = resolveBerniniFunctionForInputMode(_0x5a9de8, _0x1bab3d?.generationParams?.rhBerniniFunction ?? _0x1bab3d?.rhBerniniFunction);
  if (_0x3b3fe2) {
    _0x3fb10d.rhBerniniFunction = _0x3b3fe2;
  }
  return _0x3fb10d;
}
function getTopLevelDisplayParams(_0x40dd36, _0x10063a) {
  const _0x20b84c = {};
  getManifestDisplayFieldIds(_0x10063a).forEach(_0x109fd2 => {
    if (Object.prototype.hasOwnProperty.call(_0x40dd36 || {}, _0x109fd2)) {
      _0x20b84c[_0x109fd2] = _0x40dd36[_0x109fd2];
    }
  });
  return _0x20b84c;
}
function normalizeRhV54SinglePreset(_0x243957) {
  const _0x23843c = String(_0x243957 ?? "").trim();
  if (_0x23843c === "efficiency" || _0x23843c === "stable" || _0x23843c === "quality") {
    return _0x23843c;
  } else {
    return "efficiency";
  }
}
function normalizeRhV54SpecialMode(_0x19d60a) {
  const _0x10bfa2 = String(_0x19d60a ?? "").trim();
  if (_0x10bfa2 === "longVideoOverlay" || _0x10bfa2 === "cameraMove") {
    return _0x10bfa2;
  } else {
    return null;
  }
}
function normalizeRhV54MaskExpand(_0x475493) {
  const _0x268a00 = Number(_0x475493);
  if (Number.isFinite(_0x268a00)) {
    return Math.max(-9999, Math.min(9999, Math.trunc(_0x268a00)));
  } else {
    return 25;
  }
}
function normalizeRhV54BreastJiggle(_0x51d483) {
  const _0x4f8c54 = Number(_0x51d483);
  if (!Number.isFinite(_0x4f8c54)) {
    return 0;
  }
  return Math.max(0, Math.min(1, Math.round(_0x4f8c54 * 20) / 20));
}
function normalizeBooleanParam(_0x42eb13, _0xadcd33 = false) {
  if (_0x42eb13 === true || String(_0x42eb13).trim() === "true") {
    return true;
  }
  if (_0x42eb13 === false || String(_0x42eb13).trim() === "false") {
    return false;
  }
  return _0xadcd33;
}
function buildRhV54AdvancedDisplayPatch(_0x5c0f6f) {
  const _0x2a41df = String(_0x5c0f6f.rhControlMode || "single") === "multi" ? "multi" : "single";
  const _0x4d3a37 = {
    rhBlendIntoScene: _0x5c0f6f.rhBlendIntoScene === true,
    rhControlMode: _0x2a41df,
    rhSingleControlPreset: _0x2a41df === "multi" ? null : normalizeRhV54SinglePreset(_0x5c0f6f.rhSingleControlPreset),
    rhSubtractSubject: _0x5c0f6f.rhSubtractSubject !== false,
    rhMaskExpand: normalizeRhV54MaskExpand(_0x5c0f6f.rhMaskExpand),
    rhMaskRect: _0x5c0f6f.rhMaskRect === true,
    rhSpecialMode: normalizeRhV54SpecialMode(_0x5c0f6f.rhSpecialMode),
    rhBreastJiggle: normalizeRhV54BreastJiggle(_0x5c0f6f.rhBreastJiggle)
  };
  return _0x4d3a37;
}
function getFieldDefaultNumber(_0x296091, _0x5a88ea) {
  const _0xae3855 = Number(_0x296091?.defaultValue);
  if (Number.isFinite(_0xae3855)) {
    return _0xae3855;
  } else {
    return _0x5a88ea;
  }
}
function getFieldMinNumber(_0x41fc7e, _0x51f942) {
  const _0xf4d137 = Number(_0x41fc7e?.min);
  if (Number.isFinite(_0xf4d137)) {
    return _0xf4d137;
  } else {
    return _0x51f942;
  }
}
function getFieldMinOptionNumber(_0xbf78b6, _0x4b0a08) {
  const _0x141398 = (Array.isArray(_0xbf78b6?.options) ? _0xbf78b6.options : []).map(_0xbd79e7 => Number(_0xbd79e7?.value ?? _0xbd79e7)).filter(Number.isFinite);
  if (_0x141398.length) {
    return Math.min(..._0x141398);
  }
  return getFieldMinNumber(_0xbf78b6, _0x4b0a08);
}
function getNormalizedDisplayFieldValue(_0x2c5550, _0x5ceecd, _0x5aa9e, _0x1a972a = {}) {
  const _0x10f16d = String(_0x5ceecd?.id || "").trim();
  const _0x5106e5 = _0x5aa9e[_0x10f16d];
  const _0x39df76 = Number(_0x5106e5);
  if (_0x10f16d === "rhVideoResolution") {
    const _0x4bebf7 = getFieldMinOptionNumber(_0x5ceecd, 832);
    const _0x5ed69d = getFieldDefaultNumber(_0x5ceecd, _0x4bebf7);
    if (Number.isFinite(_0x39df76)) {
      return Math.max(_0x4bebf7, Math.trunc(_0x39df76));
    } else {
      return _0x5ed69d;
    }
  }
  if (_0x10f16d === "rhVideoFps") {
    const _0x10a8c3 = getFieldDefaultNumber(_0x5ceecd, 24);
    const _0x164318 = getRunningHubVideoExecution(_0x2c5550);
    const _0x4d671a = _0x164318?.extensions?.payloadResolver === RUNNINGHUB_VIDEO_V54_PAYLOAD_RESOLVER ? _0x1a972a.v54FpsOptions : _0x5ceecd?.options;
    const _0x492a0d = (Array.isArray(_0x4d671a) ? _0x4d671a : []).map(_0x4852ff => Number(_0x4852ff?.value ?? _0x4852ff)).filter(Number.isFinite);
    const _0x5ee6ed = _0x492a0d.length ? _0x492a0d : [16, 24];
    if (_0x5ee6ed.includes(_0x39df76)) {
      return _0x39df76;
    } else {
      return _0x10a8c3;
    }
  }
  if (_0x10f16d === "rhVideoFrames") {
    const _0x42034e = getFieldDefaultNumber(_0x5ceecd, 77);
    const _0x32002c = getFieldMinNumber(_0x5ceecd, 0);
    if (Number.isFinite(_0x39df76)) {
      return Math.max(_0x32002c, Math.trunc(_0x39df76));
    } else {
      return _0x42034e;
    }
  }
  if (_0x10f16d === "rhVideoSeconds") {
    const _0x3134e4 = getFieldDefaultNumber(_0x5ceecd, 5);
    const _0x58b06f = getFieldMinNumber(_0x5ceecd, 1);
    if (Number.isFinite(_0x39df76)) {
      return Math.max(_0x58b06f, Math.trunc(_0x39df76));
    } else {
      return _0x3134e4;
    }
  }
  return undefined;
}
export function isRunningHubVideoWorkflowManifest(_0xef0399) {
  return !!getRunningHubVideoWorkflowManifest(_0xef0399);
}
export function buildVideoWorkflowGenerationParamsPatch(_0x3443f5, _0x27098b, _0x1e4381 = {}) {
  const _0x1e73ff = String(_0x3443f5?.model || "").trim();
  const _0x38d2e1 = String(_0x27098b || "").trim();
  if (!isRunningHubVideoWorkflowManifest(_0x38d2e1)) {
    return {};
  }
  const _0x59f8b7 = getPlainGenerationParams(_0x3443f5?.generationParamsByModel);
  if (_0x1e73ff) {
    _0x59f8b7[_0x1e73ff] = {
      ...getPlainGenerationParams(_0x3443f5?.generationParams),
      ...getTopLevelDisplayParams(_0x3443f5, _0x1e73ff)
    };
  }
  const _0x27d091 = buildModelUiSchemaDefaultParams(_0x38d2e1);
  const _0x306fd1 = getPlainGenerationParams(_0x59f8b7[_0x38d2e1]);
  const _0x5c5d8c = !_0x1e73ff || _0x1e73ff === _0x38d2e1 ? getTopLevelDisplayParams(_0x3443f5, _0x38d2e1) : {};
  const _0x2270cf = {
    ..._0x27d091,
    ..._0x306fd1,
    ..._0x5c5d8c,
    ...getPlainGenerationParams(_0x1e4381)
  };
  _0x59f8b7[_0x38d2e1] = _0x2270cf;
  return {
    generationParams: _0x2270cf,
    generationParamsByModel: _0x59f8b7
  };
}
export function buildVideoWorkflowDisplayParamsPatch(_0x1380d3, _0x50bc06, _0x4608e0 = {}) {
  const _0x5a9ce8 = String(_0x1380d3 || "").trim();
  const _0x2cfe39 = getPlainGenerationParams(_0x50bc06);
  const _0x476cc4 = Array.isArray(_0x4608e0?.v54FpsOptions) ? _0x4608e0.v54FpsOptions.map(_0xcffd35 => Number(_0xcffd35)).filter(Number.isFinite) : [16, 24, 30];
  const _0x208dcc = {};
  getDeclaredManifestDisplayFields(_0x5a9ce8).forEach(_0x1439fd => {
    const _0xfab826 = String(_0x1439fd?.id || "").trim();
    const _0x1598d5 = getNormalizedDisplayFieldValue(_0x5a9ce8, _0x1439fd, _0x2cfe39, {
      v54FpsOptions: _0x476cc4
    });
    if (_0x1598d5 !== undefined) {
      _0x208dcc[_0xfab826] = _0x1598d5;
    }
  });
  const _0x1a05ec = getRunningHubVideoParameterPanelPolicy(_0x5a9ce8);
  if (_0x1a05ec.advancedDisplayPatch === "runningHubVideoV54") {
    Object.assign(_0x208dcc, buildRhV54AdvancedDisplayPatch(_0x2cfe39));
  }
  if (getDeclaredManifestField(_0x5a9ce8, "rhEnableMask")) {
    _0x208dcc.rhEnableMask = normalizeBooleanParam(_0x2cfe39.rhEnableMask, false);
  }
  const _0x150cee = Number(_0x1a05ec.forceDisplayFps);
  if (Number.isFinite(_0x150cee)) {
    _0x208dcc.rhVideoFps = _0x150cee;
  }
  return _0x208dcc;
}
function buildVideoWorkflowSelectionStatePatch(_0x3e36d6, _0x189175, _0x359fa3 = {}) {
  const _0x26162d = {};
  const _0x3b7447 = getRunningHubVideoParameterPanelPolicy(_0x189175);
  const _0x404304 = _0x3b7447.frameStateDefaults;
  if (_0x404304 && typeof _0x404304 === "object") {
    const _0x21e26e = Number(_0x404304.frameRate);
    const _0x19042c = Number(_0x404304.frameCount);
    _0x26162d.frameRate = Number.isFinite(_0x3e36d6?.frameRate) ? _0x3e36d6.frameRate : Number.isFinite(_0x21e26e) ? _0x21e26e : 24;
    _0x26162d.frameCount = Number.isFinite(_0x3e36d6?.frameCount) ? _0x3e36d6.frameCount : Number.isFinite(_0x19042c) ? _0x19042c : 77;
    if (_0x359fa3.preserveMaskTouchedState || _0x3b7447.preserveMaskTouchedState) {
      _0x26162d.rhMaskExpandTouched = _0x3e36d6?.rhMaskExpandTouched === true;
    }
  }
  const _0x30f90c = _0x3b7447.defaultSelectionState && typeof _0x3b7447.defaultSelectionState === "object" ? _0x3b7447.defaultSelectionState : null;
  if (_0x30f90c) {
    Object.entries(_0x30f90c).forEach(([_0x1e4edd, _0xa8e101]) => {
      _0x26162d[_0x1e4edd] = _0x3e36d6?.[_0x1e4edd] || _0xa8e101;
    });
  }
  return _0x26162d;
}
export function buildVideoWorkflowModelSelectionPatch(_0xa8f091, _0x579aba, _0x1395de = {}) {
  if (!isRunningHubVideoWorkflowManifest(_0x579aba)) {
    return {};
  }
  const _0x556d9e = buildVideoWorkflowGenerationParamsPatch(_0xa8f091, _0x579aba);
  const _0x1d5731 = buildVideoWorkflowSelectionStatePatch(_0xa8f091 || {}, _0x579aba, _0x1395de);
  const _0x496bd2 = buildVideoWorkflowDisplayParamsPatch(_0x579aba, _0x556d9e.generationParams, _0x1395de);
  const _0x3073a5 = buildGenerationModelSelectionDisplayPatch({
    nodeData: _0xa8f091,
    fallbackNodeData: _0xa8f091,
    modelId: _0x579aba,
    generationParams: _0x556d9e.generationParams
  });
  return {
    ..._0x556d9e,
    ..._0x1d5731,
    ..._0x496bd2,
    ..._0x3073a5
  };
}
export function resolveVideoWorkflowSchemaParam(_0x4239a6, _0x50746d, _0x3c8978) {
  const _0x1945d9 = getModelManifest(_0x50746d);
  const _0xb6e018 = String(_0x3c8978 || "").trim();
  const _0x5100be = _0x1945d9?.uiSchema?.fields;
  const _0x27e918 = Array.isArray(_0x5100be) ? _0x5100be.find(_0x39b342 => String(_0x39b342?.id || "").trim() === _0xb6e018) : null;
  if (!_0x27e918) {
    throw new Error("RunningHub video manifest " + _0x50746d + " missing " + _0xb6e018);
  }
  if (_0x27e918.defaultValue === undefined) {
    throw new Error("RunningHub video manifest " + _0x50746d + " missing " + _0xb6e018 + " defaultValue");
  }
  const _0x57b066 = getPlainGenerationParams(_0x4239a6?.generationParams);
  if (!Object.prototype.hasOwnProperty.call(_0x57b066, _0xb6e018)) {
    throw new Error("RunningHub video node " + _0x50746d + " missing generationParams." + _0xb6e018);
  }
  const _0x30d66a = _0x57b066[_0xb6e018];
  if (_0x30d66a === undefined || _0x30d66a === null || String(_0x30d66a).trim() === "") {
    throw new Error("RunningHub video node " + _0x50746d + " missing generationParams." + _0xb6e018);
  }
  return _0x30d66a;
}