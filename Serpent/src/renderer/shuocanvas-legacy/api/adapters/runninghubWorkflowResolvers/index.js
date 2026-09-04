import { resolveRunningHubHailuoH3OmniPayload } from "./runningHubHailuoH3OmniResolver.js";
import { normalizeRunningHubInstanceType } from "../../../src/modules/runningHubInstanceTypes.js";
const VIDEO_MATTING_MAX_SOURCE_VIDEO_BYTES = 31457280;
const VIDEO_MATTING_SOURCE_VIDEO_TOO_LARGE_MESSAGE = "裁剪后视频仍超过 30MB，请继续裁剪或压缩";
const RUNNINGHUB_WORKFLOW_PAYLOAD_RESOLVERS = Object.freeze({
  runninghubVideoV54: resolveRunningHubVideoV54Payload,
  runninghubBerniniVideoReplaceV1: resolveRunningHubBerniniVideoReplaceV1Payload,
  runninghubLtx23FullVideo: resolveRunningHubLtx23FullVideoPayload,
  runninghubWan22Video: resolveRunningHubWan22VideoPayload,
  runninghubVideoMatting: resolveRunningHubVideoMattingPayload,
  runninghubHailuoH3Omni: resolveRunningHubHailuoH3OmniPayload
});
const RH_WAN22_RATIO_PAIRS = Object.freeze({
  "9:16": Object.freeze({
    widthRatio: 9,
    heightRatio: 16
  }),
  "16:9": Object.freeze({
    widthRatio: 16,
    heightRatio: 9
  }),
  "1:1": Object.freeze({
    widthRatio: 1,
    heightRatio: 1
  }),
  "4:3": Object.freeze({
    widthRatio: 4,
    heightRatio: 3
  }),
  "3:4": Object.freeze({
    widthRatio: 3,
    heightRatio: 4
  }),
  "3:2": Object.freeze({
    widthRatio: 3,
    heightRatio: 2
  }),
  "2:3": Object.freeze({
    widthRatio: 2,
    heightRatio: 3
  }),
  "21:9": Object.freeze({
    widthRatio: 21,
    heightRatio: 9
  }),
  "9:21": Object.freeze({
    widthRatio: 9,
    heightRatio: 21
  }),
  "5:4": Object.freeze({
    widthRatio: 5,
    heightRatio: 4
  }),
  "4:5": Object.freeze({
    widthRatio: 4,
    heightRatio: 5
  }),
  "2:1": Object.freeze({
    widthRatio: 2,
    heightRatio: 1
  }),
  "1:2": Object.freeze({
    widthRatio: 1,
    heightRatio: 2
  })
});
const RH_WAN22_RESOLUTION_OPTIONS = Object.freeze([832, 1024, 1280, 1440]);
const RH_LTX23_RESOLUTION_OPTIONS = Object.freeze([1024, 1280, 1440, 1600, 1920]);
const RH_LTX23_FPS_OPTIONS = Object.freeze([16, 24, 30]);
const RH_VIDEO_WORKFLOW_DEFAULT_RATIO = "1:1";
export function getRunningHubWorkflowPayloadResolver(_0x15eade) {
  const _0x2f153c = String(_0x15eade || "").trim();
  return RUNNINGHUB_WORKFLOW_PAYLOAD_RESOLVERS[_0x2f153c] || null;
}
async function resolveRunningHubVideoV54Payload({
  executionManifest: _0x333fad,
  payload: _0xa522de,
  finalPrompt: _0x5e80f3,
  apiKey: _0x5a6d9e,
  ctx: _0x3202b7,
  helpers: _0x21fe3c
}) {
  const _0x3be528 = _0x333fad.mapping || {};
  const _0x558f3f = [];
  const {
    buildOpenApiVideoWorkflowRequest: _0x58eb81,
    getMappedValue: _0x594e31,
    normalizeRhVideoResolution: _0x5086cf,
    pushManifestNode: _0x4e20b5,
    resolveRunningHubFirstImageInput: _0x71c3d9,
    resolveRunningHubOptionalVideoInput: _0xdc7e05,
    resolveRunningHubVideoInput: _0x2f0f26,
    sourceVideoMissingMessage: _0x2ca234,
    sourceVideoUploadFailedMessage: _0x3075e7
  } = _0x21fe3c;
  const _0x25703c = String(_0x5e80f3 || "").trim() || "4K，高质量";
  _0x4e20b5(_0x558f3f, _0x3be528.promptNode, _0x25703c);
  _0x4e20b5(_0x558f3f, _0x3be528.characterIntegrationNode, _0xa522de.characterIntegration === true ? "true" : "false");
  const _0x1d3fb1 = String(_0xa522de.controlMode || "").trim();
  const _0x2d1ce2 = _0x594e31(_0x1d3fb1, _0x3be528.controlModeNode, "0");
  _0x4e20b5(_0x558f3f, _0x3be528.controlModeNode, _0x2d1ce2);
  _0x4e20b5(_0x558f3f, _0x3be528.resolutionNode, _0x5086cf(_0xa522de.rhVideoResolution, _0x3be528.resolutionNode?.defaultValue));
  const _0x4f025c = Number(_0xa522de.frameRate ?? _0xa522de.rhVideoFps ?? _0x3be528.fpsNode?.defaultValue);
  const _0x18fe53 = Number.isFinite(_0x4f025c) ? Math.trunc(_0x4f025c) : 24;
  _0x4e20b5(_0x558f3f, _0x3be528.fpsNode, _0x18fe53);
  const _0x506a23 = Number(_0xa522de.frameCount ?? _0xa522de.rhVideoFrames ?? _0x3be528.sourceVideoNode?.frameCountDefaultValue);
  const _0x1b422c = Number.isFinite(_0x506a23) ? Math.max(0, Math.trunc(_0x506a23)) : 0;
  _0x4e20b5(_0x558f3f, _0x3be528.sourceVideoNode, _0x1b422c, {
    fieldName: _0x3be528.sourceVideoNode?.frameCountFieldName
  });
  const _0x428da0 = await _0x2f0f26(_0xa522de, _0x5a6d9e, {
    missingMessage: _0x2ca234,
    uploadFailedMessage: _0x3075e7
  });
  _0x4e20b5(_0x558f3f, _0x3be528.sourceVideoNode, _0x428da0);
  const _0x187a69 = await _0x71c3d9(_0xa522de, _0x5a6d9e, _0x3202b7, {
    required: true,
    missingMessage: "请接入参考图",
    uploadFailedMessage: "参考图上传失败"
  });
  if (_0x187a69) {
    _0x4e20b5(_0x558f3f, _0x3be528.refImageNode, _0x187a69);
  }
  const _0x57c06a = await _0xdc7e05(_0xa522de, _0x5a6d9e, "maskVideoUrl");
  if (_0x57c06a) {
    _0x4e20b5(_0x558f3f, _0x3be528.maskVideoNode, _0x57c06a);
  }
  const _0x3ac010 = await _0x71c3d9(_0xa522de, _0x5a6d9e, _0x3202b7, {
    field: "firstFrameUrl",
    uploadFailedMessage: "首帧上传失败"
  });
  if (_0x3ac010) {
    _0x4e20b5(_0x558f3f, _0x3be528.firstFrameNode, _0x3ac010);
    _0x4e20b5(_0x558f3f, _0x3be528.firstFrameEnabledNode, _0x3be528.firstFrameEnabledNode?.value ?? "1");
  }
  const _0x478cc8 = String(_0xa522de.specialMode || _0xa522de.rhSpecialMode || "");
  const _0x35bff0 = _0x478cc8 === "cameraMove";
  const _0x1416d1 = !_0x35bff0 && _0xa522de.subtractSubject === true;
  if (_0x1416d1) {
    _0x4e20b5(_0x558f3f, _0x3be528.subtractSubjectNode, _0x3be528.subtractSubjectNode?.value ?? "true");
  }
  const _0x5783c8 = !_0x35bff0 && (_0x57c06a || _0x1416d1);
  if (_0x5783c8) {
    const _0x54d49f = Number(_0xa522de.maskExpansion);
    const _0x23bfdf = Number.isFinite(_0x54d49f) ? _0x54d49f : _0x3be528.maskExpansionNode?.defaultValue ?? 25;
    _0x4e20b5(_0x558f3f, _0x3be528.maskExpansionNode, _0x23bfdf);
    _0x4e20b5(_0x558f3f, _0x3be528.maskRectNode, _0xa522de.maskRect === true ? _0x3be528.maskRectNode?.trueValue ?? "1" : _0x3be528.maskRectNode?.falseValue ?? "0");
    _0x4e20b5(_0x558f3f, _0x3be528.maskParamsEnabledNode, _0x3be528.maskParamsEnabledNode?.value ?? "1");
  }
  if (_0x478cc8 === "longVideoOverlay" || _0x478cc8 === "cameraMove") {
    _0x4e20b5(_0x558f3f, _0x3be528.specialModeNode, _0x594e31(_0x478cc8, _0x3be528.specialModeNode, ""));
  }
  if (_0x478cc8 === "longVideoOverlay") {
    _0x4e20b5(_0x558f3f, _0x3be528.longVideoOverlayNode, _0x3be528.longVideoOverlayNode?.value ?? "1");
  }
  const _0x239d5c = Number(_0xa522de.breastJiggle ?? _0xa522de.rhBreastJiggle ?? 0);
  const _0x4314ff = Number.isFinite(_0x239d5c) ? Math.max(0, Math.min(1, Math.round(_0x239d5c * 20) / 20)) : 0;
  if (_0x4314ff > 0) {
    _0x4e20b5(_0x558f3f, _0x3be528.breastJiggleNode, Number(_0x4314ff.toFixed(2)));
    _0x4e20b5(_0x558f3f, _0x3be528.breastJiggleEnabledNode, _0x3be528.breastJiggleEnabledNode?.value ?? "true");
  }
  return _0x58eb81({
    executionManifest: _0x333fad,
    payload: _0xa522de,
    apiKey: _0x5a6d9e,
    nodeInfoList: _0x558f3f
  });
}
function normalizeBerniniInputMode(_0x5390c) {
  const _0x49d688 = String(_0x5390c || "").trim();
  if (["none", "image", "video", "videoImage", "videoVideo"].includes(_0x49d688)) {
    return _0x49d688;
  } else {
    return "none";
  }
}
function resolveBerniniFunctionForMode(_0x5daab9, _0x4fccd1 = "") {
  const _0x5a5ce6 = {
    none: ["t2v"],
    image: ["i2v", "r2v"],
    video: ["v2v", "mv2v"],
    videoImage: ["vi2v", "rv2v", "vrc2v"],
    videoVideo: ["ads2v"]
  };
  const _0x2f2a4e = normalizeBerniniInputMode(_0x5daab9);
  const _0x28cf6b = _0x5a5ce6[_0x2f2a4e] || _0x5a5ce6.none;
  const _0x42b521 = String(_0x4fccd1 || "").trim();
  if (_0x28cf6b.includes(_0x42b521)) {
    return _0x42b521;
  } else {
    return _0x28cf6b[0];
  }
}
function resolveBerniniModeValue(_0x41d276, _0x43696d = "") {
  const _0x92a082 = {
    t2v: "0",
    i2v: "1",
    v2v: "2",
    r2v: "3",
    vi2v: "4",
    rv2v: "5",
    ads2v: "6",
    vrc2v: "7",
    mv2v: "8"
  };
  return _0x92a082[resolveBerniniFunctionForMode(_0x41d276, _0x43696d)] || "0";
}
function normalizeBerniniResolutionBase(_0x1c01ef) {
  const _0x5a8ce0 = Number(_0x1c01ef);
  if ([832, 1024, 1280, 1440].includes(_0x5a8ce0)) {
    return _0x5a8ce0;
  } else {
    return 1024;
  }
}
function parseBerniniAspectRatio(_0x535d5b) {
  const _0x41cda7 = String(_0x535d5b || "16:9").trim();
  const _0x4246d6 = _0x41cda7.toLowerCase();
  if (_0x41cda7 === "自适应" || _0x4246d6 === "auto" || _0x4246d6 === "adaptive") {
    return {
      widthRatio: 16,
      heightRatio: 9
    };
  }
  const [_0xd7ecff, _0x416725] = _0x41cda7.split(":");
  const _0x4e6d5e = Number(_0xd7ecff);
  const _0x528e97 = Number(_0x416725);
  if (_0x4e6d5e > 0 && _0x528e97 > 0) {
    return {
      widthRatio: _0x4e6d5e,
      heightRatio: _0x528e97
    };
  }
  return {
    widthRatio: 16,
    heightRatio: 9
  };
}
function resolveBerniniAspectRatioValue(_0x2962ea = {}) {
  const _0x24aa1a = _0x2962ea.rhBerniniAspectRatio ?? _0x2962ea.generationParams?.rhBerniniAspectRatio ?? _0x2962ea.resolvedRatioLabel ?? _0x2962ea.aspectRatio;
  const _0x5d4b20 = String(_0x24aa1a || "").trim();
  const _0x2434ff = _0x5d4b20.toLowerCase();
  if (_0x5d4b20 === "自适应" || _0x2434ff === "auto" || _0x2434ff === "adaptive") {
    return _0x2962ea.resolvedRatioLabel || _0x2962ea.aspectRatio || "16:9";
  }
  return _0x24aa1a;
}
function roundBerniniDimensionToEight(_0x10ed5f) {
  return Math.max(8, Math.round(Number(_0x10ed5f || 0) / 8) * 8);
}
function resolveBerniniDimensions({
  resolutionBase: _0x413178,
  aspectRatio: _0x139d26
} = {}) {
  const _0x5763fb = normalizeBerniniResolutionBase(_0x413178);
  const {
    widthRatio: _0x27ee3b,
    heightRatio: _0x5d8ef3
  } = parseBerniniAspectRatio(_0x139d26);
  if (_0x27ee3b >= _0x5d8ef3) {
    return {
      width: _0x5763fb,
      height: roundBerniniDimensionToEight(_0x5763fb * _0x5d8ef3 / _0x27ee3b)
    };
  }
  return {
    width: roundBerniniDimensionToEight(_0x5763fb * _0x27ee3b / _0x5d8ef3),
    height: _0x5763fb
  };
}
async function resolveRunningHubBerniniVideoReplaceV1Payload({
  executionManifest: _0x3c79fe,
  payload: _0x463a6f,
  finalPrompt: _0x25e5ed,
  apiKey: _0x21dcd0,
  ctx: _0x56dd6a,
  helpers: _0x24ee9a
}) {
  const _0x279dfa = _0x3c79fe.mapping || {};
  const _0x2c9824 = [];
  const {
    buildOpenApiVideoWorkflowRequest: _0x217c89,
    pushManifestNode: _0x471c48,
    resolveRunningHubFirstImageInput: _0x1a5725,
    resolveRunningHubOptionalVideoInput: _0x50a4e4,
    resolveRunningHubVideoInput: _0x13a91b
  } = _0x24ee9a;
  let _0x530da8 = "";
  if (String(_0x463a6f.videoUrl || "").trim() || _0x463a6f.videoFile) {
    _0x530da8 = await _0x13a91b(_0x463a6f, _0x21dcd0, {
      missingMessage: "请接入源视频",
      uploadFailedMessage: "源视频上传失败"
    });
  }
  const _0x4a4f0a = await _0x1a5725(_0x463a6f, _0x21dcd0, _0x56dd6a, {
    required: false,
    missingMessage: "请接入参考图像"
  });
  const _0x38eaf2 = await _0x50a4e4(_0x463a6f, _0x21dcd0, "referenceVideoUrl");
  const _0x593d76 = _0x530da8 ? _0x38eaf2 ? "videoVideo" : _0x4a4f0a ? "videoImage" : "video" : _0x4a4f0a ? "image" : "none";
  if (_0x38eaf2 && !_0x530da8) {
    throw new Error("参考视频需要同时接入源视频");
  }
  const _0x2b9e72 = resolveBerniniModeValue(_0x593d76, _0x463a6f.rhBerniniFunction ?? _0x463a6f.generationParams?.rhBerniniFunction);
  const _0x2741d3 = resolveBerniniDimensions({
    resolutionBase: _0x463a6f.rhVideoResolution ?? _0x463a6f.generationParams?.rhVideoResolution ?? _0x463a6f.rhBerniniResolutionBase ?? _0x463a6f.generationParams?.rhBerniniResolutionBase,
    aspectRatio: resolveBerniniAspectRatioValue(_0x463a6f)
  });
  if (_0x530da8) {
    _0x471c48(_0x2c9824, _0x279dfa.sourceVideoNode, _0x530da8);
  }
  if (_0x4a4f0a && _0x593d76 !== "videoVideo") {
    _0x471c48(_0x2c9824, _0x279dfa.refImageNode, _0x4a4f0a);
  }
  _0x471c48(_0x2c9824, _0x279dfa.modeNode, _0x2b9e72);
  const _0x141784 = Number(_0x463a6f.rhVideoFps ?? _0x279dfa.fpsNode?.value);
  const _0x4bada2 = Number.isFinite(_0x141784) ? Math.trunc(_0x141784) : 24;
  _0x471c48(_0x2c9824, _0x279dfa.fpsNode, String(_0x4bada2));
  const _0x2b1030 = Number(_0x463a6f.rhVideoFrames ?? _0x279dfa.framesNode?.value);
  const _0x3237f9 = Number.isFinite(_0x2b1030) ? Math.max(0, Math.trunc(_0x2b1030)) : 0;
  _0x471c48(_0x2c9824, _0x279dfa.framesNode, String(_0x3237f9));
  _0x471c48(_0x2c9824, _0x279dfa.widthNode, _0x2741d3.width);
  _0x471c48(_0x2c9824, _0x279dfa.heightNode, _0x2741d3.height);
  _0x471c48(_0x2c9824, _0x279dfa.promptNode, _0x25e5ed || "");
  if (_0x593d76 === "videoVideo") {
    _0x471c48(_0x2c9824, _0x279dfa.referenceVideoNode, _0x38eaf2);
  }
  return _0x217c89({
    executionManifest: _0x3c79fe,
    payload: _0x463a6f,
    apiKey: _0x21dcd0,
    nodeInfoList: _0x2c9824
  });
}
function getLtx23PayloadPathValue(_0x5f1b72 = {}, _0x5436e8 = "") {
  const _0x5375fd = String(_0x5436e8 || "").trim();
  if (!_0x5375fd) {
    return undefined;
  }
  return _0x5375fd.split(".").reduce((_0x29d373, _0x436c3a) => {
    if (_0x29d373 === undefined || _0x29d373 === null) {
      return undefined;
    }
    return _0x29d373[_0x436c3a];
  }, _0x5f1b72);
}
function hasLtx23InputValue(_0x372bcc) {
  if (_0x372bcc === undefined || _0x372bcc === null) {
    return false;
  }
  if (typeof _0x372bcc === "string") {
    return _0x372bcc.trim() !== "";
  }
  if (Array.isArray(_0x372bcc)) {
    return _0x372bcc.some(_0x57ff63 => hasLtx23InputValue(_0x57ff63));
  }
  return true;
}
function resolveLtx23FirstPresentField(_0x123ee2 = {}, _0x504272 = []) {
  for (const _0x46e627 of _0x504272) {
    const _0xea388c = getLtx23PayloadPathValue(_0x123ee2, _0x46e627);
    if (hasLtx23InputValue(_0xea388c)) {
      return _0xea388c;
    }
  }
  return undefined;
}
async function uploadLtx23OptionalImage({
  payload: _0x479457,
  apiKey: _0x7b8887,
  ctx: _0x24caf3,
  fields: _0x28325f,
  rawValue: _0x310fc0
}) {
  const _0x2902be = _0x310fc0 !== undefined ? _0x310fc0 : resolveLtx23FirstPresentField(_0x479457, _0x28325f);
  if (!hasLtx23InputValue(_0x2902be)) {
    return "";
  }
  const _0x47d225 = _0x24caf3?.processInputImages;
  if (typeof _0x47d225 !== "function") {
    throw new Error("缺少 RunningHUB 图片上传能力");
  }
  const _0x56c5a8 = (Array.isArray(_0x2902be) ? _0x2902be : [_0x2902be]).filter(_0x51b7a3 => hasLtx23InputValue(_0x51b7a3));
  const _0x1c8a10 = await _0x47d225(_0x56c5a8, _0x7b8887, {
    applyInputQualityProfile: true,
    provider: "runninghub",
    strictUpload: true
  });
  const _0x9aac99 = String(_0x1c8a10?.[0] || "").trim();
  if (!_0x9aac99) {
    throw new Error("图片参考上传失败");
  }
  return _0x9aac99;
}
async function uploadLtx23OptionalAudio({
  payload: _0x5e6bd4,
  apiKey: _0x3e45ef,
  helpers: _0x3d79d8,
  rawValue: _0x263cf6
}) {
  const _0x2df929 = getLtx23PayloadPathValue(_0x5e6bd4, "audioFile");
  if (!hasLtx23InputValue(_0x263cf6) && !hasLtx23InputValue(_0x2df929)) {
    return "";
  }
  const _0x1ea1ee = _0x3d79d8?.resolveRunningHubAudioInput;
  if (typeof _0x1ea1ee !== "function") {
    throw new Error("缺少 RunningHUB 音频上传能力");
  }
  const _0x58df33 = hasLtx23InputValue(_0x263cf6) ? {
    ..._0x5e6bd4,
    audioUrl: _0x263cf6
  } : _0x5e6bd4;
  const _0x163d02 = await _0x1ea1ee(_0x58df33, _0x3e45ef, {
    required: true,
    missingMessage: "音频参考上传失败"
  });
  return String(_0x163d02 || "").trim();
}
function resolveLtx23AspectRatio(_0x2ce175 = {}) {
  const _0x1a65f7 = String(_0x2ce175.rhLtx23AspectRatio ?? _0x2ce175.generationParams?.rhLtx23AspectRatio ?? _0x2ce175.resolvedRatioLabel ?? _0x2ce175.generationParams?.resolvedRatioLabel ?? _0x2ce175.aspectRatio ?? _0x2ce175.generationParams?.aspectRatio ?? RH_VIDEO_WORKFLOW_DEFAULT_RATIO).trim();
  const _0x44a9e3 = _0x1a65f7.toLowerCase();
  const _0x33c0ca = _0x1a65f7 === "自适应" || _0x44a9e3 === "auto" || _0x44a9e3 === "adaptive" ? String(_0x2ce175.resolvedRatioLabel || _0x2ce175.generationParams?.resolvedRatioLabel || _0x2ce175.aspectRatio || _0x2ce175.generationParams?.aspectRatio || RH_VIDEO_WORKFLOW_DEFAULT_RATIO).trim() : _0x1a65f7;
  if (RH_WAN22_RATIO_PAIRS[_0x33c0ca]) {
    return _0x33c0ca;
  } else {
    return RH_VIDEO_WORKFLOW_DEFAULT_RATIO;
  }
}
function resolveLtx23Resolution(_0x339a70 = {}) {
  const _0x4dab7e = Number(_0x339a70.rhVideoResolution ?? _0x339a70.generationParams?.rhVideoResolution ?? 1280);
  if (RH_LTX23_RESOLUTION_OPTIONS.includes(_0x4dab7e)) {
    return _0x4dab7e;
  } else {
    return 1280;
  }
}
function resolveLtx23Dimensions(_0x2a7743 = {}) {
  const {
    widthRatio: _0x1b0b3d,
    heightRatio: _0x181284
  } = RH_WAN22_RATIO_PAIRS[resolveLtx23AspectRatio(_0x2a7743)] || RH_WAN22_RATIO_PAIRS[RH_VIDEO_WORKFLOW_DEFAULT_RATIO];
  const _0x7ca8fb = resolveLtx23Resolution(_0x2a7743);
  if (_0x1b0b3d === _0x181284) {
    return {
      width: _0x7ca8fb,
      height: _0x7ca8fb
    };
  }
  if (_0x1b0b3d > _0x181284) {
    return {
      width: _0x7ca8fb,
      height: ceilWan22DimensionToSixteen(_0x7ca8fb * _0x181284 / _0x1b0b3d)
    };
  }
  return {
    width: ceilWan22DimensionToSixteen(_0x7ca8fb * _0x1b0b3d / _0x181284),
    height: _0x7ca8fb
  };
}
function resolveLtx23Seconds(_0x2964b4 = {}, _0x43fa94 = {}) {
  const _0x4ea3e5 = Number(_0x2964b4.rhVideoSeconds ?? _0x2964b4.generationParams?.rhVideoSeconds ?? _0x43fa94.secondsNode?.defaultValue ?? 8);
  if (Number.isFinite(_0x4ea3e5)) {
    return Math.max(1, Math.trunc(_0x4ea3e5));
  } else {
    return 8;
  }
}
function resolveLtx23Fps(_0x590876 = {}, _0x173634 = {}) {
  const _0xe0d0be = Number(_0x590876.rhVideoFps ?? _0x590876.generationParams?.rhVideoFps ?? _0x173634.fpsNode?.defaultValue ?? 24);
  if (RH_LTX23_FPS_OPTIONS.includes(_0xe0d0be)) {
    return _0xe0d0be;
  } else {
    return 24;
  }
}
async function resolveRunningHubLtx23FullVideoPayload({
  executionManifest: _0x403b86,
  payload: _0xa3ce56,
  finalPrompt: _0x2f3359,
  apiKey: _0x3e7d30,
  ctx: _0x1776d3,
  helpers: _0x249f80
}) {
  const _0xa11968 = _0x403b86.mapping || {};
  const _0x5e0710 = [];
  const {
    buildOpenApiVideoWorkflowRequest: _0x595132,
    pushManifestNode: _0x10c935
  } = _0x249f80;
  const _0x1dbad0 = ["refImageUrl", "refImage", "imageUrl", "inputUrls.0"];
  const _0x375b8b = ["audioUrl", "audio", "inputAudios.0"];
  const _0x25a515 = resolveLtx23FirstPresentField(_0xa3ce56, _0x1dbad0);
  const _0x4efaa0 = resolveLtx23FirstPresentField(_0xa3ce56, _0x375b8b);
  const _0x52e771 = await uploadLtx23OptionalImage({
    payload: _0xa3ce56,
    apiKey: _0x3e7d30,
    ctx: _0x1776d3,
    fields: _0x1dbad0,
    rawValue: _0x25a515
  });
  const _0x5e59f8 = await uploadLtx23OptionalAudio({
    payload: _0xa3ce56,
    apiKey: _0x3e7d30,
    helpers: _0x249f80,
    rawValue: _0x4efaa0
  });
  if (_0x52e771) {
    _0x10c935(_0x5e0710, _0xa11968.imageNode, _0x52e771);
  }
  if (_0x5e59f8) {
    _0x10c935(_0x5e0710, _0xa11968.audioNode, _0x5e59f8);
  }
  const _0x544348 = resolveLtx23Dimensions(_0xa3ce56);
  _0x10c935(_0x5e0710, _0xa11968.textToVideoNode, _0x52e771 ? "false" : "true");
  _0x10c935(_0x5e0710, _0xa11968.customAudioNode, _0x5e59f8 ? "true" : "false");
  _0x10c935(_0x5e0710, _0xa11968.secondsNode, resolveLtx23Seconds(_0xa3ce56, _0xa11968));
  _0x10c935(_0x5e0710, _0xa11968.widthNode, _0x544348.width);
  _0x10c935(_0x5e0710, _0xa11968.heightNode, _0x544348.height);
  _0x10c935(_0x5e0710, _0xa11968.fpsNode, resolveLtx23Fps(_0xa3ce56, _0xa11968));
  _0x10c935(_0x5e0710, _0xa11968.promptNode, _0x2f3359 || "");
  return _0x595132({
    executionManifest: _0x403b86,
    payload: _0xa3ce56,
    apiKey: _0x3e7d30,
    nodeInfoList: _0x5e0710
  });
}
function getWan22PayloadPathValue(_0x3a3e30 = {}, _0x347fb8 = "") {
  const _0x3e5514 = String(_0x347fb8 || "").trim();
  if (!_0x3e5514) {
    return undefined;
  }
  return _0x3e5514.split(".").reduce((_0x397753, _0x250de6) => {
    if (_0x397753 === undefined || _0x397753 === null) {
      return undefined;
    }
    return _0x397753[_0x250de6];
  }, _0x3a3e30);
}
function hasWan22InputValue(_0x393c9e) {
  if (_0x393c9e === undefined || _0x393c9e === null) {
    return false;
  }
  if (typeof _0x393c9e === "string") {
    return _0x393c9e.trim() !== "";
  }
  if (Array.isArray(_0x393c9e)) {
    return _0x393c9e.some(_0x2be6c0 => hasWan22InputValue(_0x2be6c0));
  }
  return true;
}
function resolveWan22FirstPresentField(_0x267d47 = {}, _0xc4b31f = []) {
  for (const _0x1f2a61 of _0xc4b31f) {
    const _0x30eb21 = getWan22PayloadPathValue(_0x267d47, _0x1f2a61);
    if (hasWan22InputValue(_0x30eb21)) {
      return _0x30eb21;
    }
  }
  return undefined;
}
async function uploadWan22OptionalImage({
  payload: _0x580ecf,
  apiKey: _0xec461e,
  ctx: _0x4abb73,
  fields: _0x58a9cf,
  rawValue: _0x3004c4,
  label: _0x5ee43c
}) {
  const _0x41d7c3 = _0x3004c4 !== undefined ? _0x3004c4 : resolveWan22FirstPresentField(_0x580ecf, _0x58a9cf);
  if (!hasWan22InputValue(_0x41d7c3)) {
    return "";
  }
  const _0x521ab0 = _0x4abb73?.processInputImages;
  if (typeof _0x521ab0 !== "function") {
    throw new Error("缺少 RunningHUB 图片上传能力");
  }
  const _0x585978 = (Array.isArray(_0x41d7c3) ? _0x41d7c3 : [_0x41d7c3]).filter(_0x518eb3 => hasWan22InputValue(_0x518eb3));
  const _0x302482 = await _0x521ab0(_0x585978, _0xec461e, {
    applyInputQualityProfile: true,
    provider: "runninghub",
    strictUpload: true
  });
  const _0x4ac655 = String(_0x302482?.[0] || "").trim();
  if (!_0x4ac655) {
    throw new Error(_0x5ee43c + "上传失败");
  }
  return _0x4ac655;
}
function resolveWan22AspectRatio(_0x1a26c4 = {}) {
  const _0x3fc5a4 = String(_0x1a26c4.rhWan22AspectRatio ?? _0x1a26c4.generationParams?.rhWan22AspectRatio ?? _0x1a26c4.resolvedRatioLabel ?? _0x1a26c4.generationParams?.resolvedRatioLabel ?? _0x1a26c4.aspectRatio ?? _0x1a26c4.generationParams?.aspectRatio ?? RH_VIDEO_WORKFLOW_DEFAULT_RATIO).trim();
  const _0x1106cd = _0x3fc5a4.toLowerCase();
  const _0x5d26aa = _0x3fc5a4 === "自适应" || _0x1106cd === "auto" || _0x1106cd === "adaptive" ? String(_0x1a26c4.resolvedRatioLabel || _0x1a26c4.generationParams?.resolvedRatioLabel || _0x1a26c4.aspectRatio || _0x1a26c4.generationParams?.aspectRatio || RH_VIDEO_WORKFLOW_DEFAULT_RATIO).trim() : _0x3fc5a4;
  if (RH_WAN22_RATIO_PAIRS[_0x5d26aa]) {
    return _0x5d26aa;
  } else {
    return RH_VIDEO_WORKFLOW_DEFAULT_RATIO;
  }
}
function resolveWan22Resolution(_0x36ebd2 = {}) {
  const _0x569964 = Number(_0x36ebd2.rhVideoResolution ?? _0x36ebd2.generationParams?.rhVideoResolution ?? 832);
  if (RH_WAN22_RESOLUTION_OPTIONS.includes(_0x569964)) {
    return _0x569964;
  } else {
    return 832;
  }
}
function ceilWan22DimensionToSixteen(_0x5528a5) {
  return Math.max(16, Math.ceil(Number(_0x5528a5 || 0) / 16) * 16);
}
function resolveWan22Dimensions(_0x29b958 = {}) {
  const {
    widthRatio: _0x19e1ac,
    heightRatio: _0x2b4d57
  } = RH_WAN22_RATIO_PAIRS[resolveWan22AspectRatio(_0x29b958)] || RH_WAN22_RATIO_PAIRS[RH_VIDEO_WORKFLOW_DEFAULT_RATIO];
  const _0x5426e0 = resolveWan22Resolution(_0x29b958);
  if (_0x19e1ac === _0x2b4d57) {
    return {
      width: _0x5426e0,
      height: _0x5426e0
    };
  }
  if (_0x19e1ac > _0x2b4d57) {
    return {
      width: _0x5426e0,
      height: ceilWan22DimensionToSixteen(_0x5426e0 * _0x2b4d57 / _0x19e1ac)
    };
  }
  return {
    width: ceilWan22DimensionToSixteen(_0x5426e0 * _0x19e1ac / _0x2b4d57),
    height: _0x5426e0
  };
}
function resolveWan22FrameCount(_0x11ef08 = {}, _0x3183b1 = {}) {
  const _0x396bec = Number(_0x11ef08.rhVideoFrames ?? _0x11ef08.generationParams?.rhVideoFrames ?? _0x3183b1.framesNode?.defaultValue ?? 81);
  if (Number.isFinite(_0x396bec)) {
    return Math.max(1, Math.trunc(_0x396bec));
  } else {
    return 81;
  }
}
async function resolveRunningHubWan22VideoPayload({
  executionManifest: _0x1d00b5,
  payload: _0x50b646,
  finalPrompt: _0x517ac0,
  apiKey: _0x1c863a,
  ctx: _0x2de44e,
  helpers: _0x594aaf
}) {
  const _0x2206b1 = _0x1d00b5.mapping || {};
  const _0x33ab9b = [];
  const {
    buildOpenApiVideoWorkflowRequest: _0x110984,
    pushManifestNode: _0x475329
  } = _0x594aaf;
  const _0x4d6837 = ["firstFrameUrl", "firstFrame", "inputUrls.0"];
  const _0x3a139f = ["lastFrameUrl", "lastFrame", "inputUrls.1"];
  const _0x17d9a0 = resolveWan22FirstPresentField(_0x50b646, _0x4d6837);
  const _0x73858c = resolveWan22FirstPresentField(_0x50b646, _0x3a139f);
  if (hasWan22InputValue(_0x73858c) && !hasWan22InputValue(_0x17d9a0)) {
    throw new Error("尾帧需要同时接入首帧");
  }
  const _0x522899 = await uploadWan22OptionalImage({
    payload: _0x50b646,
    apiKey: _0x1c863a,
    ctx: _0x2de44e,
    fields: _0x4d6837,
    rawValue: _0x17d9a0,
    label: "首帧"
  });
  const _0x8efc33 = await uploadWan22OptionalImage({
    payload: _0x50b646,
    apiKey: _0x1c863a,
    ctx: _0x2de44e,
    fields: _0x3a139f,
    rawValue: _0x73858c,
    label: "尾帧"
  });
  if (_0x522899) {
    _0x475329(_0x33ab9b, _0x2206b1.firstFrameNode, _0x522899);
  }
  if (_0x8efc33) {
    _0x475329(_0x33ab9b, _0x2206b1.lastFrameNode, _0x8efc33);
  }
  const _0x5a4076 = resolveWan22Dimensions(_0x50b646);
  _0x475329(_0x33ab9b, _0x2206b1.modeNode, _0x522899 ? _0x8efc33 ? "2" : "1" : "0");
  _0x475329(_0x33ab9b, _0x2206b1.widthNode, _0x5a4076.width);
  _0x475329(_0x33ab9b, _0x2206b1.heightNode, _0x5a4076.height);
  _0x475329(_0x33ab9b, _0x2206b1.framesNode, resolveWan22FrameCount(_0x50b646, _0x2206b1));
  _0x475329(_0x33ab9b, _0x2206b1.promptNode, _0x517ac0 || "");
  return _0x110984({
    executionManifest: _0x1d00b5,
    payload: _0x50b646,
    apiKey: _0x1c863a,
    nodeInfoList: _0x33ab9b
  });
}
async function resolveRunningHubVideoMattingPayload({
  executionManifest: _0x3a5849,
  payload: _0x4670d9,
  apiKey: _0x4dd5a2,
  ctx: _0x597c69,
  helpers: _0xaf34ff
}) {
  const _0x130ff2 = _0x3a5849.mapping || {};
  const _0x27710b = [];
  const {
    buildTaskCreateVideoWorkflowRequest: _0x3d72a1,
    getRunningHubWorkflowBaseUrl: _0x15a196,
    normalizeRhVideoFps: _0x243aca,
    normalizeRhVideoResolution: _0x4c8612,
    normalizeVideoMattingMaskModeIndex: _0x17638e,
    pushManifestNode: _0x19ffc5
  } = _0xaf34ff;
  const _0x28f95d = String(_0x4670d9.maskImageDataUrl || "").trim();
  const _0x155945 = String(_0x4670d9.videoUrl || "").trim();
  const _0x4dc3f0 = _0x15a196(_0x4670d9);
  if (!_0x155945) {
    throw new Error("请接入源视频");
  }
  const _0x8ece02 = _0x597c69.processInputVideos;
  if (typeof _0x8ece02 !== "function") {
    throw new Error("缺少 RunningHUB 视频上传能力");
  }
  const _0x2dd38d = await _0x8ece02([_0x155945], _0x4dd5a2, {
    strictUpload: true,
    maxBytes: VIDEO_MATTING_MAX_SOURCE_VIDEO_BYTES,
    maxBytesMessage: VIDEO_MATTING_SOURCE_VIDEO_TOO_LARGE_MESSAGE,
    apiUrl: _0x4dc3f0
  });
  const _0x278b2a = String(_0x2dd38d?.[0] || "").trim();
  if (!_0x278b2a) {
    throw new Error("源视频上传失败");
  }
  if (_0x28f95d) {
    const _0x2fd3f8 = _0x597c69.processInputImages;
    if (typeof _0x2fd3f8 !== "function") {
      throw new Error("缺少 RunningHUB 图片上传能力");
    }
    const _0x184343 = await _0x2fd3f8([_0x28f95d], _0x4dd5a2, {
      compress: false,
      provider: "runninghub",
      strictUpload: true,
      apiUrl: _0x4dc3f0
    });
    const _0xc6b2db = String(_0x184343?.[0] || "").trim();
    if (!_0xc6b2db) {
      throw new Error("擦除遮罩上传失败");
    }
    const _0x23c6c9 = Number(_0x4670d9.sourceFrameCount ?? _0x4670d9.frameCount);
    const _0x59c8cf = Number.isFinite(_0x23c6c9) ? Math.max(1, Math.trunc(_0x23c6c9)) : 1;
    _0x19ffc5(_0x27710b, _0x130ff2.maskVideoNode, _0x278b2a);
    _0x19ffc5(_0x27710b, _0x130ff2.maskFrameCapNode, String(_0x59c8cf));
    _0x19ffc5(_0x27710b, _0x130ff2.maskFpsNode, String(_0x243aca(_0x4670d9.rhVideoFps ?? _0x4670d9.frameRate)));
    _0x19ffc5(_0x27710b, _0x130ff2.maskResolutionNode, String(_0x4c8612(_0x4670d9.rhVideoResolution, 1024)));
    _0x19ffc5(_0x27710b, _0x130ff2.maskImageNode, _0xc6b2db);
    const _0x1e4a7f = normalizeRunningHubInstanceType(_0x4670d9.rhInstanceType);
    return {
      url: "/api/v2/video/matting/run",
      headers: {
        "Content-Type": "application/json"
      },
      body: {
        apiKey: _0x4dd5a2,
        apiUrl: _0x4dc3f0,
        appId: _0x130ff2.maskAppId,
        nodeInfoList: _0x27710b,
        instanceType: _0x1e4a7f,
        usePersonalQueue: "false"
      },
      adapterTrace: {
        source: "manifest",
        executionId: _0x3a5849.id,
        modelId: _0x4670d9.model
      },
      isAsync: true,
      taskIdPath: "taskId",
      useOpenapiQuery: true,
      pollUrlBuilder: () => _0x4dc3f0 + "/openapi/v2/query",
      resultExtractor: _0x39d066 => _0x39d066.status === "COMPLETED" && Array.isArray(_0x39d066.results) ? _0x39d066.results.map(_0x12dc51 => _0x12dc51.videoUrl || _0x12dc51.url).filter(Boolean) : []
    };
  }
  _0x19ffc5(_0x27710b, _0x130ff2.noMaskVideoNode, _0x278b2a);
  const _0x2d8cc6 = _0x4670d9.frameRate || _0x4670d9.rhVideoFps;
  if (_0x2d8cc6) {
    _0x19ffc5(_0x27710b, _0x130ff2.noMaskFpsNode, String(_0x2d8cc6));
  }
  if (_0x4670d9.rhVideoResolution !== undefined && _0x4670d9.rhVideoResolution !== null) {
    _0x19ffc5(_0x27710b, _0x130ff2.noMaskResolutionNode, String(_0x4c8612(_0x4670d9.rhVideoResolution)));
  }
  const _0x12eace = _0x4670d9.pos_points ?? _0x4670d9.positive ?? "";
  const _0x1c97a9 = _0x4670d9.neg_points ?? _0x4670d9.negative ?? "";
  _0x19ffc5(_0x27710b, _0x130ff2.positiveNode, Array.isArray(_0x12eace) ? JSON.stringify(_0x12eace) : String(_0x12eace || ""));
  _0x19ffc5(_0x27710b, _0x130ff2.negativeNode, Array.isArray(_0x1c97a9) ? JSON.stringify(_0x1c97a9) : String(_0x1c97a9 || ""));
  const _0xe16ca0 = _0x4670d9.frameRate || _0x4670d9.rhVideoFps || _0x4670d9.fps;
  const _0x467aaf = Number.isFinite(_0x4670d9.timeSec) && Number.isFinite(Number(_0xe16ca0)) ? Math.max(0, Math.round(Number(_0x4670d9.timeSec) * Number(_0xe16ca0))) : _0x4670d9.frame_index !== undefined && _0x4670d9.frame_index !== null ? _0x4670d9.frame_index : 0;
  _0x19ffc5(_0x27710b, _0x130ff2.frameIndexNode, String(_0x467aaf));
  _0x19ffc5(_0x27710b, _0x130ff2.maskModeNode, _0x17638e(_0x4670d9.rhMaskMode));
  return _0x3d72a1({
    executionManifest: _0x3a5849,
    payload: _0x4670d9,
    apiKey: _0x4dd5a2,
    nodeInfoList: _0x27710b
  });
}