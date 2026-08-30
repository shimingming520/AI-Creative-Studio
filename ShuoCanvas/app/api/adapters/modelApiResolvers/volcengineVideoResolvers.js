import { normalizeRatioLabelText } from "../../imageRatioPolicy.js";
import { appendUniqueUrl, normalizeInputList, normalizeInputUrlsBySlot, normalizePositiveInteger, stripPrefix } from "./sharedResolverUtils.js";
function normalizeSeedanceRouteMode(_0x151f2a) {
  const _0x4d9ec5 = String(_0x151f2a || "").trim().toLowerCase();
  if (_0x4d9ec5 === "multimodal2video" || _0x4d9ec5 === "reference") {
    return "multimodal2video";
  }
  if (_0x4d9ec5 === "frames2video" || _0x4d9ec5 === "frames") {
    return "frames2video";
  }
  if (_0x4d9ec5 === "image2video" || _0x4d9ec5 === "image" || _0x4d9ec5 === "frame") {
    return "image2video";
  }
  return "text2video";
}
function getVolcengineSeedance2Mode(_0x4c7f42 = {}, _0x22e1ba = {}) {
  return normalizeSeedanceRouteMode(_0x4c7f42?.dreaminaRouteMode || _0x4c7f42?.dreaminaTaskType || _0x4c7f42?.generationParams?.dreaminaRouteMode || _0x22e1ba.volcengine_seedance_2_mode || _0x4c7f42?.generationParams?.volcengine_seedance_2_mode || _0x4c7f42?.volcengine_seedance_2_mode);
}
function resolveVolcengineSeedance2TaskType({
  routeMode = "",
  frameImageCount = 0,
  referenceImageCount = 0,
  videoCount = 0,
  audioCount = 0
} = {}) {
  const _0xe3e236 = normalizeSeedanceRouteMode(routeMode);
  const _0x13fbeb = normalizePositiveInteger(frameImageCount, 0);
  const _0x113e48 = normalizePositiveInteger(referenceImageCount, 0);
  const _0x31d8a6 = normalizePositiveInteger(videoCount, 0);
  const _0x5e7313 = normalizePositiveInteger(audioCount, 0);
  if (_0xe3e236 === "frames2video") {
    if (_0x13fbeb >= 2) {
      return "frames2video";
    }
    if (_0x13fbeb === 1) {
      return "image2video";
    }
    return "text2video";
  }
  if (_0xe3e236 === "image2video") {
    return "image2video";
  }
  if (_0xe3e236 === "text2video") {
    return "text2video";
  }
  if (_0x113e48 > 0 || _0x31d8a6 > 0 || _0x5e7313 > 0) {
    return "multimodal2video";
  }
  return "text2video";
}
function getVolcengineSeedance2ModelTier(_0x29daeb = "") {
  const _0x463807 = String(_0x29daeb || "").toLowerCase();
  if (_0x463807.includes("mini")) {
    return "mini";
  }
  if (_0x463807.includes("fast")) {
    return "fast";
  }
  return "standard";
}
function normalizeVolcengineSeedance2Resolution(_0x4bbcd0, _0x58f291 = {}, _0x18b8c0 = "") {
  const _0x100d4b = String(_0x4bbcd0 || _0x58f291.defaultResolution || "720p").trim().toLowerCase();
  const _0x41e962 = Array.isArray(_0x58f291.allowedResolutions) ? _0x58f291.allowedResolutions.map(_0x270eea => String(_0x270eea || "").trim().toLowerCase()).filter(Boolean) : [];
  if (_0x41e962.length > 0) {
    if (_0x41e962.includes(_0x100d4b)) {
      return _0x100d4b;
    } else if (_0x41e962.includes(String(_0x58f291.defaultResolution || "").trim().toLowerCase())) {
      return String(_0x58f291.defaultResolution).trim().toLowerCase();
    } else {
      return _0x41e962[0];
    }
  }
  const _0x10a70a = getVolcengineSeedance2ModelTier(_0x18b8c0);
  if (_0x100d4b === "4k" && _0x10a70a === "standard") {
    return "4k";
  }
  if (_0x100d4b === "1080p" && _0x10a70a === "standard") {
    return "1080p";
  }
  if (_0x100d4b === "480p") {
    return "480p";
  }
  return "720p";
}
function normalizeVolcengineSeedance2Ratio(_0x5816c4, _0x41a3d6 = {}) {
  const _0x31dc12 = String(_0x5816c4 || "").trim();
  if (!_0x31dc12 || _0x31dc12 === "auto" || _0x31dc12 === "default" || _0x31dc12 === "自适应") {
    return _0x41a3d6.defaultRatio || "adaptive";
  }
  const _0x534713 = normalizeRatioLabelText(_0x31dc12);
  if (["16:9", "4:3", "1:1", "3:4", "9:16", "21:9"].includes(_0x534713)) {
    return _0x534713;
  } else {
    return _0x41a3d6.defaultRatio || "adaptive";
  }
}
function normalizeVolcengineSeedance2Duration(_0x814207, _0x1eea2b = {}) {
  const _0x3cfbec = Number(_0x814207);
  if (_0x3cfbec === -1 && _0x1eea2b.allowAutoDuration !== false) {
    return -1;
  }
  const _0x187700 = normalizePositiveInteger(_0x1eea2b.minDuration, 4);
  const _0x5f4bd2 = normalizePositiveInteger(_0x1eea2b.maxDuration, 15);
  if (!Number.isFinite(_0x3cfbec)) {
    const _0x566401 = Number(_0x1eea2b.defaultDuration);
    if (_0x566401 === -1 && _0x1eea2b.allowAutoDuration !== false) {
      return -1;
    } else if (Number.isFinite(_0x566401)) {
      return Math.max(_0x187700, Math.min(_0x5f4bd2, Math.trunc(_0x566401)));
    } else {
      return 5;
    }
  }
  return Math.max(_0x187700, Math.min(_0x5f4bd2, Math.trunc(_0x3cfbec)));
}
function normalizeVolcengineBoolean(_0x50e916, _0x38063d = false) {
  if (_0x50e916 === true || _0x50e916 === false) {
    return _0x50e916;
  }
  if (_0x50e916 === undefined || _0x50e916 === null || String(_0x50e916).trim() === "") {
    return _0x38063d;
  }
  const _0x50f34f = String(_0x50e916 ?? "").trim().toLowerCase();
  if (["true", "1", "yes", "on"].includes(_0x50f34f)) {
    return true;
  }
  if (["false", "0", "no", "off"].includes(_0x50f34f)) {
    return false;
  }
  return _0x38063d;
}
function normalizeVolcengineSeedance2Priority(_0x537490) {
  if (_0x537490 === undefined || _0x537490 === null || String(_0x537490).trim() === "") {
    return null;
  }
  const _0x220eb0 = Number.parseInt(String(_0x537490).trim(), 10);
  if (!Number.isFinite(_0x220eb0)) {
    return null;
  }
  return Math.max(0, Math.min(9, _0x220eb0));
}
function normalizeVolcengineSeedance2Seed(_0x4fbb94) {
  if (_0x4fbb94 === undefined || _0x4fbb94 === null || String(_0x4fbb94).trim() === "") {
    return null;
  }
  const _0x403bd9 = Number(_0x4fbb94);
  if (!Number.isFinite(_0x403bd9)) {
    return null;
  }
  return Math.max(-1, Math.min(2147483647, Math.trunc(_0x403bd9)));
}
function normalizeVolcengineSeedance2OutputFormat(_0x28de66) {
  const _0x4b7038 = String(_0x28de66 || "mp4").trim().toLowerCase();
  if (_0x4b7038 === "mov") {
    return "mov";
  } else {
    return "mp4";
  }
}
function getVolcengineSeedance2Policy(_0x12f537) {
  const _0x420822 = _0x12f537?.extensions?.seedanceVideo;
  if (_0x420822 && typeof _0x420822 === "object" && !Array.isArray(_0x420822)) {
    return _0x420822;
  } else {
    return {};
  }
}
function getVolcengineSlotMedia(_0x34f7e5 = {}, _0x40c00e) {
  return String(normalizeInputUrlsBySlot(_0x34f7e5)[_0x40c00e] || "").trim();
}
function collectVolcengineSeedance2FrameImages({
  inputImages = [],
  finalUrlsBySlot = {}
} = {}) {
  const _0x31ae25 = [];
  appendUniqueUrl(_0x31ae25, getVolcengineSlotMedia(finalUrlsBySlot, "firstFrame"));
  appendUniqueUrl(_0x31ae25, getVolcengineSlotMedia(finalUrlsBySlot, "lastFrame"));
  normalizeInputList(inputImages).forEach(_0x27c265 => appendUniqueUrl(_0x31ae25, _0x27c265));
  return _0x31ae25;
}
function collectVolcengineSeedance2ReferenceImages({
  inputImages = [],
  finalUrlsBySlot = {}
} = {}) {
  const _0x3d6f8e = [];
  appendUniqueUrl(_0x3d6f8e, getVolcengineSlotMedia(finalUrlsBySlot, "referenceImage"));
  const _0x449ef6 = new Set(normalizeInputList(Object.values(normalizeInputUrlsBySlot(finalUrlsBySlot))));
  normalizeInputList(inputImages).forEach(_0x4b80f1 => {
    if (!_0x449ef6.has(_0x4b80f1)) {
      appendUniqueUrl(_0x3d6f8e, _0x4b80f1);
    }
  });
  return _0x3d6f8e;
}
function pushVolcengineContentItem(_0x532468, _0x2bb85e, _0x1e790b, _0x4c0e0b) {
  const _0xa9b944 = String(_0x1e790b || "").trim();
  if (!_0xa9b944) {
    return;
  }
  const _0xf81434 = {
    type: _0x2bb85e
  };
  if (_0x2bb85e === "image_url") {
    _0xf81434.image_url = {
      url: _0xa9b944
    };
  } else if (_0x2bb85e === "video_url") {
    _0xf81434.video_url = {
      url: _0xa9b944
    };
  } else if (_0x2bb85e === "audio_url") {
    _0xf81434.audio_url = {
      url: _0xa9b944
    };
  }
  if (_0x4c0e0b) {
    _0xf81434.role = _0x4c0e0b;
  }
  _0x532468.push(_0xf81434);
}
export function volcengineSeedance2Video({
  currentBody: _0x40b8e4,
  inputImages = [],
  inputVideos = [],
  inputAudios = [],
  payload = {},
  finalPrompt = "",
  finalUrlsBySlot = {},
  modelToken = "",
  executionManifest: _0x4f0ac4
}) {
  const _0x1c678d = {
    ..._0x40b8e4
  };
  const _0x238aa8 = getVolcengineSeedance2Policy(_0x4f0ac4);
  const _0x3264fd = String(_0x1c678d.prompt || finalPrompt || payload?.prompt || "").trim();
  const _0x1834b = getVolcengineSeedance2Mode(payload, _0x1c678d);
  const _0x4c98fe = collectVolcengineSeedance2FrameImages({
    inputImages: inputImages,
    finalUrlsBySlot: finalUrlsBySlot
  });
  const _0x51d4fe = collectVolcengineSeedance2ReferenceImages({
    inputImages: inputImages,
    finalUrlsBySlot: finalUrlsBySlot
  });
  const _0x4aa51c = normalizeInputList(inputVideos);
  const _0x8fa71d = normalizeInputList(inputAudios);
  const _0x7d343a = resolveVolcengineSeedance2TaskType({
    routeMode: _0x1834b,
    frameImageCount: _0x4c98fe.length,
    referenceImageCount: _0x51d4fe.length,
    videoCount: _0x4aa51c.length,
    audioCount: _0x8fa71d.length
  });
  const _0x100dc3 = [];
  if (_0x3264fd) {
    _0x100dc3.push({
      type: "text",
      text: _0x3264fd
    });
  }
  if (_0x7d343a === "text2video") {
    if (!_0x3264fd) {
      throw new Error("Volcengine Seedance prompt is required");
    }
    if (_0x4c98fe.length > 0 || _0x4aa51c.length > 0 || _0x8fa71d.length > 0) {
      throw new Error("Volcengine Seedance text mode does not accept media input");
    }
  } else if (_0x7d343a === "image2video") {
    if (_0x4aa51c.length > 0 || _0x8fa71d.length > 0) {
      throw new Error("Volcengine Seedance image mode does not accept video or audio input");
    }
    if (_0x4c98fe.length < 1) {
      throw new Error("Volcengine Seedance image mode requires 1 image input");
    }
    pushVolcengineContentItem(_0x100dc3, "image_url", _0x4c98fe[0], "first_frame");
  } else if (_0x7d343a === "frames2video") {
    if (_0x4aa51c.length > 0 || _0x8fa71d.length > 0) {
      throw new Error("Volcengine Seedance first-last-frame mode only accepts images");
    }
    if (_0x4c98fe.length < 2) {
      throw new Error("Volcengine Seedance first-last-frame mode requires 2 image inputs");
    }
    pushVolcengineContentItem(_0x100dc3, "image_url", _0x4c98fe[0], "first_frame");
    pushVolcengineContentItem(_0x100dc3, "image_url", _0x4c98fe[1], "last_frame");
  } else {
    const _0x962b10 = normalizePositiveInteger(_0x238aa8.maxImageCount, 9);
    const _0x32ecf7 = normalizePositiveInteger(_0x238aa8.maxVideoReferenceCount, 3);
    const _0x5bd2ef = normalizePositiveInteger(_0x238aa8.maxAudioReferenceCount, 3);
    const _0x161d46 = _0x238aa8.allowAudioOnlyReferences === true;
    if (_0x51d4fe.length + _0x4aa51c.length <= 0 && (!_0x161d46 || !(_0x8fa71d.length > 0))) {
      throw new Error("Volcengine Seedance multimodal mode requires image or video input");
    }
    if (_0x51d4fe.length > _0x962b10) {
      throw new Error("Volcengine Seedance multimodal mode supports at most " + _0x962b10 + " image inputs");
    }
    if (_0x4aa51c.length > _0x32ecf7) {
      throw new Error("Volcengine Seedance multimodal mode supports at most " + _0x32ecf7 + " video inputs");
    }
    if (_0x8fa71d.length > _0x5bd2ef) {
      throw new Error("Volcengine Seedance multimodal mode supports at most " + _0x5bd2ef + " audio inputs");
    }
    _0x51d4fe.slice(0, _0x962b10).forEach(_0x104e18 => pushVolcengineContentItem(_0x100dc3, "image_url", _0x104e18, "reference_image"));
    _0x4aa51c.slice(0, _0x32ecf7).forEach(_0x53bb0e => pushVolcengineContentItem(_0x100dc3, "video_url", _0x53bb0e, "reference_video"));
    _0x8fa71d.slice(0, _0x5bd2ef).forEach(_0x1bbf88 => pushVolcengineContentItem(_0x100dc3, "audio_url", _0x1bbf88, "reference_audio"));
  }
  if (_0x100dc3.length === 0) {
    throw new Error("Volcengine Seedance request content is empty");
  }
  const _0x146942 = modelToken || _0x1c678d.model || stripPrefix(payload.model, "volcengine/");
  const _0x6c9c14 = _0x238aa8.roleImagesRequireAdaptiveRatio === true && (_0x7d343a === "image2video" || _0x7d343a === "frames2video") ? "adaptive" : normalizeVolcengineSeedance2Ratio(_0x1c678d.ratio, _0x238aa8);
  const _0x5cb1ce = {
    model: _0x146942,
    content: _0x100dc3,
    resolution: normalizeVolcengineSeedance2Resolution(_0x1c678d.resolution, _0x238aa8, _0x146942),
    ratio: _0x6c9c14,
    duration: normalizeVolcengineSeedance2Duration(_0x1c678d.duration, _0x238aa8),
    generate_audio: normalizeVolcengineBoolean(_0x1c678d.generate_audio, true),
    watermark: normalizeVolcengineBoolean(_0x1c678d.watermark, false)
  };
  if (_0x238aa8.supportsOutputFormatParam === true) {
    _0x5cb1ce.output_format = normalizeVolcengineSeedance2OutputFormat(_0x1c678d.output_format);
  }
  if (normalizeVolcengineBoolean(_0x1c678d.webSearch, false)) {
    _0x5cb1ce.tools = [{
      type: "web_search"
    }];
  }
  const _0x1e4572 = normalizeVolcengineSeedance2Priority(_0x1c678d.priority);
  if (_0x1e4572 !== null && _0x1e4572 > 0) {
    _0x5cb1ce.priority = _0x1e4572;
  }
  if (_0x238aa8.supportsSeedParam === true) {
    const _0x1ab42d = normalizeVolcengineSeedance2Seed(_0x1c678d.seed);
    if (_0x1ab42d !== null) {
      _0x5cb1ce.seed = _0x1ab42d;
    }
  }
  return _0x5cb1ce;
}