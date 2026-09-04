import { RH_VIDEO_BASIC_EXECUTION_ID, RH_VIDEO_BASIC_MODEL_ID, RH_VIDEO_LIPSYNC_EXECUTION_ID, RH_VIDEO_LTX23_EXECUTION_ID, resolveModelExecution } from "../../manifests/index.js";
import { buildVideoWorkflowDisplayParamsPatch, getRunningHubVideoParameterPanelPolicy, getPlainGenerationParams, resolveBerniniFunctionForInputMode, resolveBerniniVideoReplaceInputMode } from "./runningHubVideoUiSchema.js";
import { buildFixedInputAssetSlotMapFromRefs, getFixedInputSlotConfigFromManifest, resolveFixedInputSlotForRef } from "../../modules/fixedInputAssetRefs.js";
import { resolveEffectiveInputKind } from "../../modules/modelInputPolicy.js";
import { resolveAudioDurationSec } from "../../services/audioMetadataService.js";
import { t } from "../../i18n/index.js";
function runningHubVideoSubmitText(_0x127211, _0x52378e = {}) {
  return t("runningHubVideoSubmit." + _0x127211, _0x52378e);
}
const RH_STANDARD_FPS_OPTIONS = Object.freeze([16, 24]);
const RH_V54_FPS_OPTIONS = Object.freeze([16, 24, 30]);
const RH_LTX23_RESOLUTION_OPTIONS = Object.freeze([1024, 1280, 1440, 1600, 1920]);
const RH_MIN_VIDEO_RESOLUTION = 832;
const RH_VIDEO_V54_PAYLOAD_RESOLVER = "runninghubVideoV54";
function normalizeRhStandardFps(_0x5cac52) {
  const _0x3ae8ac = Number(_0x5cac52);
  if (RH_STANDARD_FPS_OPTIONS.includes(_0x3ae8ac)) {
    return _0x3ae8ac;
  } else {
    return 24;
  }
}
function normalizeRhV54Fps(_0x4b50a8) {
  const _0x412df9 = Number(_0x4b50a8);
  if (RH_V54_FPS_OPTIONS.includes(_0x412df9)) {
    return _0x412df9;
  } else {
    return 24;
  }
}
function normalizeRhVideoResolution(_0x54b5bf) {
  const _0x4117e7 = Number(_0x54b5bf);
  if (Number.isFinite(_0x4117e7)) {
    return Math.max(RH_MIN_VIDEO_RESOLUTION, Math.trunc(_0x4117e7));
  } else {
    return RH_MIN_VIDEO_RESOLUTION;
  }
}
function normalizeRhLtx23Resolution(_0x482628) {
  const _0x4ff241 = Number(_0x482628);
  if (RH_LTX23_RESOLUTION_OPTIONS.includes(_0x4ff241)) {
    return _0x4ff241;
  } else {
    return 1280;
  }
}
function getRunningHubVideoExecution(_0x5c75de) {
  try {
    return resolveModelExecution(_0x5c75de)?.executionManifest || null;
  } catch {
    return null;
  }
}
export function getDefaultRunningHubVideoWorkflowModelId() {
  return RH_VIDEO_BASIC_MODEL_ID;
}
export function shouldScopeRunningHubVideoSubmitEdges(_0x43d3c7 = {}) {
  const _0x194745 = getRunningHubVideoParameterPanelPolicy(_0x43d3c7?.model);
  return _0x194745?.submitScopeTargetEdges === true;
}
function getUrlForFixedSlot(_0x1cabf3, _0x14ae25, _0x3bdd33, _0x512b8e, _0x276969) {
  if (_0x1cabf3 === "maskImage") {
    return _0x276969.getMaskImageUrl?.(_0x3bdd33, _0x512b8e) || "";
  }
  if (_0x14ae25 === "video") {
    return _0x276969.getVideoUrl(_0x3bdd33, _0x512b8e);
  }
  if (_0x14ae25 === "image") {
    return _0x276969.getImageUrl(_0x3bdd33);
  }
  if (_0x14ae25 === "audio") {
    return _0x276969.getAudioUrl(_0x3bdd33);
  }
  return "";
}
function assignSlotPayload(_0xd4f64, _0x53f282, _0x3ec18b) {
  const _0x155dfc = String(_0x3ec18b?.url || "").trim();
  if (!_0x155dfc) {
    return;
  }
  if (_0x53f282 === "sourceVideo" && !_0xd4f64.videoUrl) {
    _0xd4f64.videoUrl = _0x155dfc;
  } else if (_0x53f282 === "refImage") {
    _0xd4f64.inputUrls = [_0x155dfc];
  } else if (_0x53f282 === "referenceVideo" && !_0xd4f64.referenceVideoUrl) {
    _0xd4f64.referenceVideoUrl = _0x155dfc;
  } else if (_0x53f282 === "maskImage" && !_0xd4f64.maskImageDataUrl) {
    _0xd4f64.maskImageDataUrl = _0x155dfc;
  } else if (_0x53f282 === "audio" && !_0xd4f64.audioUrl) {
    _0xd4f64.audioUrl = _0x155dfc;
  } else if (_0x53f282 === "firstFrame" && !_0xd4f64.firstFrameUrl) {
    _0xd4f64.firstFrameUrl = _0x155dfc;
  } else if (_0x53f282 === "videoMask" && !_0xd4f64.maskVideoUrl) {
    _0xd4f64.maskVideoUrl = _0x155dfc;
  } else if (_0x53f282 && !_0xd4f64[_0x53f282]) {
    _0xd4f64[_0x53f282] = _0x155dfc;
  }
}
function buildBerniniFixedSlotPayloadPatch(_0x5b6004 = {}) {
  const _0x2ce58f = {};
  assignSlotPayload(_0x2ce58f, "sourceVideo", _0x5b6004.sourceVideo);
  assignSlotPayload(_0x2ce58f, "refImage", _0x5b6004.refImage);
  assignSlotPayload(_0x2ce58f, "referenceVideo", _0x5b6004.referenceVideo);
  if (!_0x5b6004.refImage?.url) {
    _0x2ce58f.inputUrls = [];
  }
  return _0x2ce58f;
}
export function buildRunningHubVideoFixedSlotSummaryPatch({
  model: _0x2d776e,
  nodeData = {},
  slotEntries = {}
} = {}) {
  const _0x354c7c = String(_0x2d776e || nodeData?.model || "").trim();
  const _0x35deb1 = getRunningHubVideoParameterPanelPolicy(_0x354c7c);
  const _0xb5e4fb = _0x35deb1?.fixedSlotSummary;
  if (!_0xb5e4fb || typeof _0xb5e4fb !== "object" || Array.isArray(_0xb5e4fb)) {
    return {};
  }
  const _0x1de602 = String(_0xb5e4fb.field || "").trim();
  if (!_0x1de602) {
    return {};
  }
  let _0x4fa938 = "";
  if (_0xb5e4fb.resolver === "berniniVideoReplaceInputMode") {
    _0x4fa938 = resolveBerniniVideoReplaceInputMode({
      hasSourceVideo: !!slotEntries.sourceVideo?.url,
      hasRefImage: !!slotEntries.refImage?.url,
      hasReferenceVideo: !!slotEntries.referenceVideo?.url
    });
  }
  if (!_0x4fa938) {
    return {};
  }
  const _0x54ba5d = {
    [_0x1de602]: _0x4fa938
  };
  const _0x3d3848 = resolveBerniniFunctionForInputMode(_0x4fa938, nodeData?.generationParams?.rhBerniniFunction ?? nodeData?.rhBerniniFunction);
  if (_0x3d3848) {
    _0x54ba5d.rhBerniniFunction = _0x3d3848;
  }
  return _0x54ba5d;
}
function resolveManifestFixedSlotInputs({
  nodeData: _0x81a315,
  inEdges: _0x38314e,
  nodes: _0x31f230,
  assetInputRefs: _0x1f3e18,
  helpers: _0xda79d
}) {
  const _0x4be321 = getFixedInputSlotConfigFromManifest(_0x81a315 || {});
  if (!_0x4be321) {
    return {
      config: null,
      slotEntries: {}
    };
  }
  const _0x5d9a2b = {};
  for (const _0x5d11c7 of _0x38314e || []) {
    const _0x315205 = _0x31f230?.[_0x5d11c7?.sourceId];
    if (!_0x315205) {
      continue;
    }
    const _0x2337a5 = String(resolveEffectiveInputKind(_0x315205, _0x5d11c7) || "");
    const {
      slot: _0x11047b
    } = resolveFixedInputSlotForRef({
      fixedInputConfig: _0x4be321,
      refSlot: _0x5d11c7?.refSlot,
      kind: _0x2337a5,
      occupiedSlots: _0x5d9a2b,
      sourceNode: _0x315205
    });
    if (!_0x11047b || _0x5d9a2b[_0x11047b]) {
      continue;
    }
    const _0x3c0d34 = String(_0x4be321.slotKindById?.[_0x11047b] || "");
    const _0x2b07c3 = getUrlForFixedSlot(_0x11047b, _0x3c0d34, _0x315205, _0x5d11c7, _0xda79d);
    if (_0x2b07c3) {
      _0x5d9a2b[_0x11047b] = {
        url: _0x2b07c3,
        node: _0x315205,
        edge: _0x5d11c7
      };
    }
  }
  const _0x3c5d4d = new Set(Object.keys(_0x5d9a2b));
  const _0x1fafeb = buildFixedInputAssetSlotMapFromRefs(_0x1f3e18, {
    slotOrderByType: _0x4be321.slotOrderByType,
    visibleSlots: _0x4be321.visibleSlots,
    exclusiveGroups: _0x4be321.exclusiveGroups,
    slotById: _0x4be321.slotById,
    occupiedSlots: _0x3c5d4d
  });
  Object.entries(_0x1fafeb).forEach(([_0x360287, _0x519dc4]) => {
    const _0x5980bf = _0x360287 === "maskImage" ? _0xda79d.getMaskImageUrl?.(_0x519dc4?.nodeData || _0x519dc4, _0x519dc4) || "" : String(_0x519dc4?.url || "").trim();
    if (!_0x5d9a2b[_0x360287] && _0x5980bf) {
      _0x5d9a2b[_0x360287] = {
        url: _0x5980bf,
        node: _0x519dc4.nodeData || null,
        ref: _0x519dc4
      };
    }
  });
  return {
    config: _0x4be321,
    slotEntries: _0x5d9a2b
  };
}
function fixedInputConfigHasImageSlot(_0x4f5dac = {}) {
  return Object.values(_0x4f5dac?.slotKindById || {}).some(_0x522d45 => String(_0x522d45 || "") === "image");
}
function buildGenericFixedSlotPayloadPatchFromEntries(_0x1a5fef = {}, _0x3face9 = null) {
  const _0x230c5a = {};
  Object.entries(_0x1a5fef).forEach(([_0x1ea728, _0x3c2d64]) => {
    assignSlotPayload(_0x230c5a, _0x1ea728, _0x3c2d64);
  });
  if (!Object.hasOwn(_0x230c5a, "inputUrls") && fixedInputConfigHasImageSlot(_0x3face9)) {
    _0x230c5a.inputUrls = [];
  }
  return _0x230c5a;
}
export function buildRunningHubVideoFixedSlotPayloadPatch({
  model = "",
  nodeData = {},
  slotEntries = {}
} = {}) {
  const _0x38afbd = String(model || nodeData?.model || "").trim();
  const _0x98a911 = getFixedInputSlotConfigFromManifest({
    ...nodeData,
    model: _0x38afbd
  }, {
    includeHiddenSlots: true
  });
  if (!_0x98a911) {
    return {};
  }
  const _0x518ee1 = getRunningHubVideoParameterPanelPolicy(_0x38afbd)?.fixedSlotSummary?.resolver === "berniniVideoReplaceInputMode";
  const _0x444e44 = _0x518ee1 ? buildBerniniFixedSlotPayloadPatch(slotEntries) : buildGenericFixedSlotPayloadPatchFromEntries(slotEntries, _0x98a911);
  const _0x352745 = Object.fromEntries(Object.entries(slotEntries).map(([_0x564638, _0x2ce301]) => [String(_0x564638 || "").trim(), String(_0x2ce301?.url || "").trim()]).filter(([_0x520ae1, _0x395468]) => _0x520ae1 && _0x395468));
  if (Object.keys(_0x352745).length) {
    _0x444e44.inputUrlsBySlot = _0x352745;
  }
  return {
    ..._0x444e44,
    ...buildRunningHubVideoFixedSlotSummaryPatch({
      model: _0x38afbd,
      nodeData: nodeData,
      slotEntries: slotEntries
    })
  };
}
function edgeTimeKey(_0x5e255d) {
  const _0x5912bf = Number(_0x5e255d?.createdAt);
  if (Number.isFinite(_0x5912bf) && _0x5912bf > 0) {
    return _0x5912bf;
  }
  const _0x541f9b = String(_0x5e255d?.id || "");
  const _0x1bef10 = _0x541f9b.match(/(\d{10,})/g);
  if (_0x1bef10 && _0x1bef10.length) {
    return Number(_0x1bef10[_0x1bef10.length - 1]) || 0;
  }
  return 0;
}
function buildV54FixedSlotPatch({
  nodeData: _0x3896d4,
  inEdges: _0x313356,
  nodes: _0x26d819,
  assetInputRefs: _0xba50f0,
  helpers: _0x452a56
}) {
  const _0x14f784 = getFixedInputSlotConfigFromManifest(_0x3896d4 || {});
  const _0x6d9a82 = {};
  if (!_0x14f784) {
    return _0x6d9a82;
  }
  const _0x17e6ce = {};
  for (const _0x363a90 of _0x313356 || []) {
    const _0x14ba22 = _0x26d819?.[_0x363a90?.sourceId];
    if (!_0x14ba22) {
      continue;
    }
    const _0x4abe9c = String(resolveEffectiveInputKind(_0x14ba22, _0x363a90) || "");
    const {
      slot: _0xd798e5
    } = resolveFixedInputSlotForRef({
      fixedInputConfig: _0x14f784,
      refSlot: _0x363a90?.refSlot,
      kind: _0x4abe9c,
      occupiedSlots: _0x17e6ce,
      sourceNode: _0x14ba22
    });
    if (!_0xd798e5 || _0x17e6ce[_0xd798e5]) {
      continue;
    }
    const _0x18f90c = String(_0x14f784.slotKindById?.[_0xd798e5] || "");
    if (!_0x18f90c) {
      continue;
    }
    const _0x5dac41 = getUrlForFixedSlot(_0xd798e5, _0x18f90c, _0x14ba22, _0x363a90, _0x452a56);
    if (_0x5dac41) {
      _0x17e6ce[_0xd798e5] = {
        url: _0x5dac41,
        node: _0x14ba22,
        edge: _0x363a90
      };
    }
  }
  const _0x2888c8 = new Set(Object.keys(_0x17e6ce));
  const _0x5ef54d = buildFixedInputAssetSlotMapFromRefs(_0xba50f0, {
    slotOrderByType: _0x14f784.slotOrderByType,
    visibleSlots: _0x14f784.visibleSlots,
    exclusiveGroups: _0x14f784.exclusiveGroups,
    slotById: _0x14f784.slotById,
    occupiedSlots: _0x2888c8
  });
  Object.entries(_0x5ef54d).forEach(([_0x3ab416, _0x3c2894]) => {
    if (!_0x17e6ce[_0x3ab416] && _0x3c2894?.url) {
      _0x17e6ce[_0x3ab416] = {
        url: _0x3c2894.url,
        node: _0x3c2894.nodeData || null,
        ref: _0x3c2894
      };
    }
  });
  if (!_0x17e6ce.sourceVideo) {
    const _0xfbcc73 = (_0x313356 || []).map(_0x22eae7 => ({
      edge: _0x22eae7,
      node: _0x26d819?.[_0x22eae7?.sourceId]
    })).filter(({
      node: _0x55794c
    }) => String(_0x55794c?.type || "").includes("video")).sort((_0x4958d5, _0x1c8dec) => edgeTimeKey(_0x4958d5.edge) - edgeTimeKey(_0x1c8dec.edge));
    const _0x123b88 = _0xfbcc73[0];
    const _0x3fb580 = _0x123b88 ? _0x452a56.getVideoUrl(_0x123b88.node, _0x123b88.edge) : "";
    if (_0x3fb580) {
      _0x17e6ce.sourceVideo = {
        url: _0x3fb580,
        node: _0x123b88.node,
        edge: _0x123b88.edge
      };
    }
  }
  ["sourceVideo", "refImage", "firstFrame", "videoMask"].forEach(_0x46c6b1 => {
    assignSlotPayload(_0x6d9a82, _0x46c6b1, _0x17e6ce[_0x46c6b1]);
  });
  return _0x6d9a82;
}
function buildV54SubmitPatch(_0x1c3792) {
  const {
    nodeData: _0x3893e4
  } = _0x1c3792;
  const _0x109884 = {};
  const _0x5e7c1b = {};
  const _0x135f22 = _0x3893e4.rhBlendIntoScene !== undefined ? _0x3893e4.rhBlendIntoScene : false;
  if (_0x3893e4.rhBlendIntoScene === undefined) {
    _0x109884.rhBlendIntoScene = false;
  }
  _0x5e7c1b.characterIntegration = _0x135f22;
  const _0x15c934 = _0x3893e4.rhControlMode || "single";
  if (!_0x3893e4.rhControlMode) {
    _0x109884.rhControlMode = "single";
  }
  const _0xf79db = _0x3893e4.rhSingleControlPreset;
  const _0x42de4e = _0xf79db === "efficiency" || _0xf79db === "stable" || _0xf79db === "quality" ? _0xf79db : "efficiency";
  if (_0x15c934 !== "multi") {
    if (_0xf79db !== _0x42de4e) {
      _0x109884.rhSingleControlPreset = _0x42de4e;
    }
  } else if (_0x3893e4.rhSingleControlPreset !== null) {
    _0x109884.rhSingleControlPreset = null;
  }
  _0x5e7c1b.controlMode = _0x15c934 === "multi" ? "multi" : _0x42de4e;
  if (_0x3893e4.rhSpecialMode === "longVideoOverlay" || _0x3893e4.rhSpecialMode === "cameraMove") {
    _0x5e7c1b.specialMode = _0x3893e4.rhSpecialMode;
  }
  const _0x30bd72 = Number(_0x3893e4.rhBreastJiggle);
  const _0x2c6cc9 = Number.isFinite(_0x30bd72) ? Math.max(0, Math.min(1, Math.round(_0x30bd72 * 20) / 20)) : 0;
  if (_0x3893e4.rhBreastJiggle === undefined) {
    _0x109884.rhBreastJiggle = 0;
  }
  _0x5e7c1b.rhBreastJiggle = _0x2c6cc9;
  const _0x3dbbf5 = _0x3893e4.rhMaskExpandTouched === true;
  const _0x1d6d0e = Number(_0x3893e4.rhMaskExpand);
  const _0x497745 = Number.isFinite(_0x1d6d0e) && (_0x1d6d0e !== 0 || _0x3dbbf5);
  const _0x5a3553 = _0x497745 ? _0x1d6d0e : 25;
  if (!_0x497745) {
    _0x109884.rhMaskExpand = 25;
  }
  _0x5e7c1b.maskExpansion = _0x5a3553;
  _0x5e7c1b.maskRect = _0x3893e4.rhMaskRect === true;
  const _0x8e6399 = _0x3893e4.rhSubtractSubject !== false;
  if (_0x3893e4.rhSubtractSubject === undefined) {
    _0x109884.rhSubtractSubject = true;
  }
  const _0x32e600 = normalizeRhV54Fps(_0x3893e4.rhVideoFps);
  _0x5e7c1b.frameRate = _0x32e600;
  const _0x180b73 = Number.isFinite(_0x3893e4.rhVideoFrames) ? Math.max(0, Math.trunc(_0x3893e4.rhVideoFrames)) : 77;
  _0x5e7c1b.frameCount = _0x180b73;
  const _0x43339e = Number(_0x3893e4.rhVideoResolution);
  const _0x46d921 = normalizeRhVideoResolution(_0x43339e);
  if (!Number.isFinite(_0x43339e) || _0x46d921 !== _0x43339e) {
    _0x109884.rhVideoResolution = _0x46d921;
  }
  _0x5e7c1b.rhVideoResolution = _0x46d921;
  _0x5e7c1b.rhVideoFps = _0x32e600;
  Object.assign(_0x5e7c1b, buildV54FixedSlotPatch(_0x1c3792));
  if (_0x5e7c1b.maskVideoUrl && _0x8e6399) {
    _0x109884.rhSubtractSubject = false;
    _0x5e7c1b.subtractSubject = false;
  } else {
    _0x5e7c1b.subtractSubject = _0x8e6399;
  }
  return {
    payloadPatch: _0x5e7c1b,
    updateData: _0x109884
  };
}
function buildBasicSubmitPatch({
  nodeData: _0x10423e,
  slotEntries: _0x19e1c5
}) {
  const _0x2fc1f0 = {};
  const _0x11eeef = {};
  const _0x41299d = normalizeRhStandardFps(_0x10423e.rhVideoFps);
  if (![16, 24].includes(Number(_0x10423e.rhVideoFps))) {
    _0x2fc1f0.rhVideoFps = 24;
  }
  _0x11eeef.rhVideoFps = _0x41299d;
  const _0x31bfc3 = Number(_0x10423e.rhVideoFrames);
  const _0x3a8af7 = Number.isFinite(_0x31bfc3) ? Math.max(0, Math.trunc(_0x31bfc3)) : 77;
  if (!Number.isFinite(_0x31bfc3)) {
    _0x2fc1f0.rhVideoFrames = 77;
  }
  _0x11eeef.rhVideoFrames = _0x3a8af7;
  const _0x35a20d = Number(_0x10423e.rhVideoResolution);
  const _0x23a700 = normalizeRhVideoResolution(_0x35a20d);
  if (!Number.isFinite(_0x35a20d) || _0x23a700 !== _0x35a20d) {
    _0x2fc1f0.rhVideoResolution = _0x23a700;
  }
  _0x11eeef.rhVideoResolution = _0x23a700;
  if (_0x10423e.rhEnableMask === undefined) {
    _0x2fc1f0.rhEnableMask = false;
  }
  _0x11eeef.rhEnableMask = _0x10423e.rhEnableMask === true;
  assignSlotPayload(_0x11eeef, "sourceVideo", _0x19e1c5.sourceVideo);
  assignSlotPayload(_0x11eeef, "refImage", _0x19e1c5.refImage);
  return {
    payloadPatch: _0x11eeef,
    updateData: _0x2fc1f0
  };
}
function buildLtxSubmitPatch({
  nodeData: _0x7a689c,
  slotEntries: _0x3763c3
}) {
  const _0x19fd3d = {};
  const _0x52af62 = {};
  const _0x269949 = getPlainGenerationParams(_0x7a689c?.generationParams);
  const _0x2ca9a7 = _0x7a689c.rhVideoFps ?? _0x269949.rhVideoFps;
  const _0x13e3ea = normalizeRhV54Fps(_0x2ca9a7);
  if (![16, 24, 30].includes(Number(_0x2ca9a7))) {
    _0x19fd3d.rhVideoFps = 24;
  }
  _0x52af62.rhVideoFps = _0x13e3ea;
  const _0x385a85 = Number(_0x7a689c.rhVideoSeconds ?? _0x269949.rhVideoSeconds);
  const _0x54fd7a = Number.isFinite(_0x385a85) ? Math.max(1, Math.trunc(_0x385a85)) : 8;
  if (!Number.isFinite(_0x385a85)) {
    _0x19fd3d.rhVideoSeconds = 8;
  }
  _0x52af62.rhVideoSeconds = _0x54fd7a;
  const _0x8b17a7 = Number(_0x7a689c.rhVideoResolution ?? _0x269949.rhVideoResolution);
  const _0x16e143 = normalizeRhLtx23Resolution(_0x8b17a7);
  if (!Number.isFinite(_0x8b17a7) || _0x16e143 !== _0x8b17a7) {
    _0x19fd3d.rhVideoResolution = _0x16e143;
  }
  _0x52af62.rhVideoResolution = _0x16e143;
  assignSlotPayload(_0x52af62, "refImage", _0x3763c3.refImage);
  assignSlotPayload(_0x52af62, "audio", _0x3763c3.audio);
  return {
    payloadPatch: _0x52af62,
    updateData: _0x19fd3d
  };
}
function getVideoDurationSec(_0xbbc7f0) {
  const _0x3ddf94 = Number(_0xbbc7f0?.videoDuration);
  if (Number.isFinite(_0x3ddf94) && _0x3ddf94 > 0) {
    return _0x3ddf94;
  }
  const _0x1cafb7 = Number(_0xbbc7f0?.videoFrameCount);
  const _0x563548 = Number(_0xbbc7f0?.videoFps);
  if (Number.isFinite(_0x1cafb7) && _0x1cafb7 > 0 && Number.isFinite(_0x563548) && _0x563548 > 0) {
    return _0x1cafb7 / _0x563548;
  }
  const _0x20b0f5 = Number(_0xbbc7f0?.duration);
  if (Number.isFinite(_0x20b0f5) && _0x20b0f5 > 0) {
    return _0x20b0f5;
  } else {
    return 0;
  }
}
async function getAudioDurationSec(_0x4c770a, _0x551028) {
  return await resolveAudioDurationSec(_0x4c770a, _0x551028);
}
async function buildLipSyncSubmitPatch({
  nodeData: _0x1fad78,
  slotEntries: _0x2dfdd9,
  prompt: _0x44c23d
}) {
  const _0x384460 = {};
  const _0x38f896 = {
    prompt: _0x44c23d,
    inputUrls: [],
    rhVideoFps: 24
  };
  const _0x25f747 = Number(_0x1fad78.rhVideoFrames);
  let _0x494d14 = Number.isFinite(_0x25f747) ? Math.max(0, Math.trunc(_0x25f747)) : 77;
  if (!Number.isFinite(_0x25f747)) {
    _0x384460.rhVideoFrames = 77;
  }
  const _0x2bb7bd = Number(_0x1fad78.rhVideoResolution);
  const _0x4f5b4d = normalizeRhVideoResolution(_0x2bb7bd);
  if (!Number.isFinite(_0x2bb7bd) || _0x4f5b4d !== _0x2bb7bd) {
    _0x384460.rhVideoResolution = _0x4f5b4d;
  }
  _0x38f896.rhVideoResolution = _0x4f5b4d;
  const _0x1b0a63 = _0x2dfdd9.sourceVideo;
  const _0x36986b = _0x2dfdd9.refImage;
  const _0x563461 = _0x2dfdd9.audio;
  const _0x2811c0 = _0x36986b?.url ? "image" : _0x1b0a63?.url ? "video" : "";
  if (!_0x2811c0) {
    globalThis.window?.showToast?.(runningHubVideoSubmitText("visualInputRequired"), "warn");
    return null;
  }
  if (!_0x563461?.url) {
    globalThis.window?.showToast?.(runningHubVideoSubmitText("audioInputRequired"), "warn");
    return null;
  }
  const _0x261380 = _0x2811c0 === "video" ? getVideoDurationSec(_0x1b0a63.node) : 0;
  if (_0x494d14 === 0) {
    if (_0x2811c0 === "image") {
      globalThis.window?.showToast?.(runningHubVideoSubmitText("referenceImageFramesRequired"), "warn");
      return null;
    }
    if (!Number.isFinite(_0x261380) || !(_0x261380 > 0)) {
      globalThis.window?.showToast?.(runningHubVideoSubmitText("videoDurationMissing"), "warn");
      return null;
    }
    _0x494d14 = Math.max(1, Math.round(_0x261380 * 24));
  }
  const _0x16ff84 = await getAudioDurationSec(_0x563461.node, _0x563461.url);
  if (!Number.isFinite(_0x16ff84) || !(_0x16ff84 > 0)) {
    globalThis.window?.showToast?.(runningHubVideoSubmitText("audioDurationMissing"), "warn");
    return null;
  }
  if (_0x494d14 / 24 > _0x16ff84 + 0.001) {
    globalThis.window?.showToast?.(runningHubVideoSubmitText("videoLongerThanAudio"), "warn");
    return null;
  }
  _0x38f896.rhVideoFrames = _0x494d14;
  _0x38f896.frameCount = _0x494d14;
  _0x38f896.rhLipSyncInputIndex = _0x2811c0 === "image" ? 0 : 1;
  if (_0x2811c0 === "image") {
    _0x38f896.inputUrls = [_0x36986b.url];
  } else {
    _0x38f896.inputUrls = [];
    _0x38f896.videoUrl = _0x1b0a63.url;
  }
  _0x38f896.audioUrl = _0x563461.url;
  return {
    payloadPatch: _0x38f896,
    updateData: _0x384460
  };
}
function getAudioDurationGuard(_0x138952) {
  const _0x15cb66 = _0x138952?.extensions?.audioDurationGuard;
  if (_0x15cb66 && typeof _0x15cb66 === "object" && !Array.isArray(_0x15cb66)) {
    return _0x15cb66;
  } else {
    return null;
  }
}
function resolveFrameCountForAudioDurationGuard(_0x3b53cc, _0x32ad49) {
  const _0x3e1573 = Array.isArray(_0x32ad49?.frameFields) ? _0x32ad49.frameFields : [_0x32ad49?.frameField || "rhVideoFrames"];
  for (const _0x2166d4 of _0x3e1573) {
    const _0x48882f = String(_0x2166d4 || "").trim();
    if (!_0x48882f) {
      continue;
    }
    const _0x16608e = Number(_0x3b53cc?.[_0x48882f]);
    if (Number.isFinite(_0x16608e)) {
      return Math.max(0, Math.trunc(_0x16608e));
    }
  }
  const _0x365f45 = Number(_0x32ad49?.defaultFrames);
  if (Number.isFinite(_0x365f45)) {
    return Math.max(0, Math.trunc(_0x365f45));
  } else {
    return 0;
  }
}
async function validateAudioDurationGuard({
  execution: _0x5c4c2c,
  payloadPatch: _0x1748b6,
  slotEntries: _0xfaf86c
} = {}) {
  const _0x33ee05 = getAudioDurationGuard(_0x5c4c2c);
  if (!_0x33ee05) {
    return true;
  }
  const _0x3c8e6e = Number(_0x33ee05.fps);
  if (!Number.isFinite(_0x3c8e6e) || !(_0x3c8e6e > 0)) {
    return true;
  }
  const _0x441147 = resolveFrameCountForAudioDurationGuard(_0x1748b6, _0x33ee05);
  if (!Number.isFinite(_0x441147) || !(_0x441147 > 0)) {
    return true;
  }
  const _0x431b01 = String(_0x33ee05.audioSlot || "audio").trim() || "audio";
  const _0x49df96 = _0xfaf86c?.[_0x431b01] || {};
  const _0x42aa91 = String(_0x1748b6?.audioUrl || _0x49df96?.url || "").trim();
  const _0x2b09e5 = await getAudioDurationSec(_0x49df96.node, _0x42aa91);
  if (!Number.isFinite(_0x2b09e5) || !(_0x2b09e5 > 0)) {
    globalThis.window?.showToast?.(_0x33ee05.missingDurationMessage || "无法读取音频时长，请等待音频加载后再生成", "warn");
    return false;
  }
  if (_0x441147 / _0x3c8e6e > _0x2b09e5 + 0.001) {
    globalThis.window?.showToast?.(_0x33ee05.message || runningHubVideoSubmitText("videoLongerThanAudio"), "warn");
    return false;
  }
  return true;
}
async function buildSpecificSubmitPatch(_0x4ff237, _0x6e2397) {
  if (_0x6e2397?.extensions?.payloadResolver === RH_VIDEO_V54_PAYLOAD_RESOLVER) {
    return buildV54SubmitPatch(_0x4ff237);
  }
  const {
    slotEntries: _0x43df5a
  } = resolveManifestFixedSlotInputs(_0x4ff237);
  if (_0x6e2397?.id === RH_VIDEO_BASIC_EXECUTION_ID) {
    return buildBasicSubmitPatch({
      ..._0x4ff237,
      slotEntries: _0x43df5a
    });
  }
  if (_0x6e2397?.id === RH_VIDEO_LTX23_EXECUTION_ID) {
    return buildLtxSubmitPatch({
      ..._0x4ff237,
      slotEntries: _0x43df5a
    });
  }
  if (_0x6e2397?.id === RH_VIDEO_LIPSYNC_EXECUTION_ID) {
    return await buildLipSyncSubmitPatch({
      ..._0x4ff237,
      slotEntries: _0x43df5a
    });
  }
  return {
    payloadPatch: {},
    updateData: {}
  };
}
function buildCollectedMediaPayloadPatch(_0x5c1e11, _0xe6aa09 = {}) {
  if (_0x5c1e11?.extensions?.collectMediaInputs !== true) {
    return {};
  }
  const _0x4239ca = _0x1b2041 => (Array.isArray(_0x1b2041) ? _0x1b2041 : []).map(_0x39139b => String(_0x39139b || "").trim()).filter(Boolean);
  return {
    inputImages: _0x4239ca(_0xe6aa09.images),
    inputVideos: _0x4239ca(_0xe6aa09.videos),
    inputAudios: _0x4239ca(_0xe6aa09.audios)
  };
}
export async function buildRunningHubVideoWorkflowSubmitPatch(_0x50dd83 = {}) {
  const _0x5c54db = String(_0x50dd83.model || _0x50dd83.nodeData?.model || "").trim();
  const _0x3fea86 = getRunningHubVideoExecution(_0x5c54db);
  const _0x1526b1 = buildVideoWorkflowDisplayParamsPatch(_0x5c54db, _0x50dd83.nodeData?.generationParams);
  const _0x21b7d7 = getPlainGenerationParams(_0x50dd83.nodeData?.generationParams);
  const {
    config: _0x3d0b65,
    slotEntries: _0x4a88e8
  } = resolveManifestFixedSlotInputs(_0x50dd83);
  const _0x54ed8c = buildGenericFixedSlotPayloadPatchFromEntries(_0x4a88e8, _0x3d0b65);
  const _0x545e84 = buildRunningHubVideoFixedSlotSummaryPatch({
    model: _0x5c54db,
    nodeData: _0x50dd83.nodeData,
    slotEntries: _0x4a88e8
  });
  const _0x378645 = _0x545e84.rhBerniniInputMode !== undefined;
  const _0x1843cb = await buildSpecificSubmitPatch(_0x50dd83, _0x3fea86);
  if (_0x1843cb === null) {
    return null;
  }
  const _0x169127 = {
    generationParams: _0x21b7d7,
    ..._0x1526b1,
    ...buildCollectedMediaPayloadPatch(_0x3fea86, _0x50dd83.inputMaterials),
    ...(_0x378645 ? buildBerniniFixedSlotPayloadPatch(_0x4a88e8) : _0x54ed8c),
    ..._0x545e84,
    ...(_0x1843cb?.payloadPatch || {})
  };
  const _0x37b123 = await validateAudioDurationGuard({
    execution: _0x3fea86,
    payloadPatch: _0x169127,
    slotEntries: _0x4a88e8
  });
  if (!_0x37b123) {
    return null;
  }
  return {
    payloadPatch: _0x169127,
    updateData: _0x1843cb?.updateData || {}
  };
}