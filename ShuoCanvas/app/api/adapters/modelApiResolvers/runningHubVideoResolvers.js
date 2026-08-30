import { appendUniqueUrl, normalizeInputList, normalizeInputUrlsBySlot as a20_0x3155f4, normalizeKlingKeepOriginalSound, replaceKlingO1PromptImageReferences } from "./sharedResolverUtils.js";
const RUNNINGHUB_HAPPYHORSE_ENDPOINTS = Object.freeze({
  text: "https://www.runninghub.cn/openapi/v2/alibaba/happyhorse-1.0/text-to-video",
  image: "https://www.runninghub.cn/openapi/v2/alibaba/happyhorse-1.0/image-to-video",
  reference: "https://www.runninghub.cn/openapi/v2/alibaba/happyhorse-1.0/reference-to-video",
  edit: "https://www.runninghub.cn/openapi/v2/alibaba/happyhorse-1.0/video-edit"
});
const RUNNINGHUB_HAPPYHORSE_11_ENDPOINTS = Object.freeze({
  text: "https://www.runninghub.cn/openapi/v2/alibaba/happyhorse-1.1/text-to-video",
  image: "https://www.runninghub.cn/openapi/v2/alibaba/happyhorse-1.1/image-to-video",
  reference: "https://www.runninghub.cn/openapi/v2/alibaba/happyhorse-1.1/reference-to-video"
});
function normalizeHappyHorseGenerationMode(_0x267988) {
  const _0x5aa966 = String(_0x267988 || "").trim().toLowerCase();
  if (_0x5aa966 === "image" || _0x5aa966 === "reference" || _0x5aa966 === "edit") {
    return _0x5aa966;
  } else {
    return "auto";
  }
}
function getRunningHubHappyHorseMode(_0xa70a80 = {}, _0xffacf5 = {}) {
  return normalizeHappyHorseGenerationMode(_0xffacf5.happyhorse_mode || _0xa70a80?.generationParams?.happyhorse_mode || _0xa70a80?.happyhorse_mode);
}
function isRunningHubHappyHorse11Model(_0x3f4dca = {}, _0x27bd7f = {}, _0x56d242 = "", _0x4e9735 = {}, _0x3e34ed = {}) {
  const _0x168d45 = String(_0x4e9735?.id || _0x3e34ed?.modelId || _0x56d242 || _0x3f4dca?.model || _0x3f4dca?.generationParams?.model || _0x27bd7f?.model || "").trim().toLowerCase();
  return _0x168d45.includes("happyhorse-1.1") || _0x168d45.includes("happyhorse-1-1");
}
function normalizeRunningHubHappyHorseAudioSettingValue(_0x280603) {
  const _0x462196 = String(_0x280603 || "").trim().toLowerCase();
  if (_0x462196 === "origin") {
    return "origin";
  } else {
    return "auto";
  }
}
export function runninghubHappyHorseVideo({
  currentBody: _0x1cab14,
  inputImages = [],
  inputVideos = [],
  payload = {},
  finalPrompt = "",
  finalUrlsBySlot = {},
  modelToken = "",
  executionManifest = {},
  modelManifest = {}
}) {
  const _0x49211b = {
    ..._0x1cab14
  };
  const _0x8b1ba9 = isRunningHubHappyHorse11Model(payload, _0x1cab14, modelToken, executionManifest, modelManifest);
  const _0x209ef0 = String(_0x49211b.prompt || finalPrompt || payload?.prompt || "").trim();
  if (!_0x209ef0) {
    throw new Error("RunningHub HappyHorse 1.0 prompt is required");
  }
  const _0x23806c = normalizeInputList(inputImages);
  const _0x1da92f = normalizeInputList(inputVideos);
  const _0x449d6c = a20_0x3155f4(finalUrlsBySlot);
  const _0x538406 = (_0x56d545 = [], _0x2bb0b6 = []) => {
    const _0x279545 = [];
    const _0x24d693 = _0x5e0a2d => {
      const _0x5a5bd3 = String(_0x5e0a2d || "").trim();
      if (_0x5a5bd3 && !_0x279545.includes(_0x5a5bd3)) {
        _0x279545.push(_0x5a5bd3);
      }
    };
    _0x56d545.forEach(_0x36733c => _0x24d693(_0x449d6c[_0x36733c]));
    normalizeInputList(_0x2bb0b6).forEach(_0x24d693);
    return _0x279545;
  };
  let _0xb82103 = getRunningHubHappyHorseMode(payload, _0x49211b);
  const _0x2d5d60 = _0x23806c.length > 0 || _0x1da92f.length > 0 || Object.keys(_0x449d6c).length > 0;
  if (_0xb82103 !== "auto" && !_0x2d5d60) {
    _0xb82103 = "auto";
  }
  _0x49211b.prompt = _0x209ef0;
  delete _0x49211b.happyhorse_mode;
  delete _0x49211b.imageUrl;
  delete _0x49211b.imageUrls;
  delete _0x49211b.videoUrl;
  if (_0x8b1ba9 && _0x1da92f.length > 0) {
    throw new Error("RunningHub HappyHorse 1.1 does not support video edit mode");
  }
  if (_0xb82103 === "edit") {
    if (_0x8b1ba9) {
      throw new Error("RunningHub HappyHorse 1.1 does not support video edit mode");
    }
    if (!_0x1da92f[0]) {
      throw new Error("RunningHub HappyHorse 1.0 video edit requires videoUrl input");
    }
    const _0x51bc60 = _0x538406(["editRefImage"], _0x23806c);
    _0x49211b.videoUrl = _0x1da92f[0];
    if (_0x51bc60.length > 0) {
      _0x49211b.imageUrls = _0x51bc60.slice(0, 5);
    }
    _0x49211b.audioSetting = normalizeRunningHubHappyHorseAudioSettingValue(_0x49211b.audioSetting ?? payload?.generationParams?.audioSetting ?? payload?.generationParams?.audio_setting ?? payload?.audioSetting ?? payload?.audio_setting);
    delete _0x49211b.aspectRatio;
    delete _0x49211b.duration;
    delete _0x49211b.imageUrl;
    return _0x49211b;
  }
  delete _0x49211b.audioSetting;
  if (_0xb82103 === "image") {
    const _0x5d2d16 = _0x538406(["firstFrame"], _0x23806c);
    if (!_0x5d2d16[0]) {
      throw new Error("RunningHub HappyHorse 1.0 image-to-video requires imageUrl input");
    }
    _0x49211b.imageUrl = _0x5d2d16[0];
    delete _0x49211b.imageUrls;
    delete _0x49211b.videoUrl;
    delete _0x49211b.aspectRatio;
    return _0x49211b;
  }
  if (_0xb82103 === "reference") {
    const _0x51154e = _0x538406(["referenceImage"], _0x23806c);
    if (_0x51154e.length <= 0) {
      throw new Error("RunningHub HappyHorse 1.0 reference mode requires imageUrls input");
    }
    _0x49211b.imageUrls = _0x51154e.slice(0, 9);
    delete _0x49211b.imageUrl;
    delete _0x49211b.videoUrl;
    return _0x49211b;
  }
  if (_0x23806c.length > 0 || _0x1da92f.length > 0) {
    throw new Error("RunningHub HappyHorse 1.0 media inputs require an explicit mode selection");
  }
  delete _0x49211b.imageUrl;
  delete _0x49211b.imageUrls;
  delete _0x49211b.videoUrl;
  return _0x49211b;
}
function hasRunningHubHappyHorseEndpointMedia({
  currentBody = {},
  finalUrlsBySlot = {},
  inputImages = [],
  inputVideos = []
} = {}) {
  return normalizeInputList(inputImages).length > 0 || normalizeInputList(inputVideos).length > 0 || Object.keys(a20_0x3155f4(finalUrlsBySlot)).length > 0 || Boolean(String(currentBody?.imageUrl || currentBody?.videoUrl || "").trim()) || normalizeInputList(currentBody?.imageUrls).length > 0;
}
export function runninghubHappyHorseVideoEndpoint(_0x4cfc05 = {}) {
  const {
    payload = {},
    currentBody = {},
    modelToken = "",
    executionManifest = {},
    modelManifest = {}
  } = _0x4cfc05;
  const _0xe0d586 = isRunningHubHappyHorse11Model(payload, currentBody, modelToken, executionManifest, modelManifest) ? RUNNINGHUB_HAPPYHORSE_11_ENDPOINTS : RUNNINGHUB_HAPPYHORSE_ENDPOINTS;
  let _0x3d976e = getRunningHubHappyHorseMode(payload, currentBody);
  if (_0x3d976e !== "auto" && !hasRunningHubHappyHorseEndpointMedia(_0x4cfc05)) {
    _0x3d976e = "auto";
  }
  return _0xe0d586[_0x3d976e] || _0xe0d586.text;
}
const RUNNINGHUB_SEEDANCE_2_ENDPOINTS = Object.freeze({
  mini: Object.freeze({
    text: "https://www.runninghub.cn/openapi/v2/rhart-video/sparkvideo-2.0-mini/text-to-video",
    image: "https://www.runninghub.cn/openapi/v2/rhart-video/sparkvideo-2.0-mini/image-to-video",
    reference: "https://www.runninghub.cn/openapi/v2/rhart-video/sparkvideo-2.0-mini/multimodal-video"
  }),
  fast: Object.freeze({
    text: "https://www.runninghub.cn/openapi/v2/rhart-video/sparkvideo-2.0-fast/text-to-video",
    image: "https://www.runninghub.cn/openapi/v2/rhart-video/sparkvideo-2.0-fast/image-to-video",
    reference: "https://www.runninghub.cn/openapi/v2/rhart-video/sparkvideo-2.0-fast/multimodal-video"
  }),
  standard: Object.freeze({
    text: "https://www.runninghub.cn/openapi/v2/rhart-video/sparkvideo-2.0/text-to-video",
    image: "https://www.runninghub.cn/openapi/v2/rhart-video/sparkvideo-2.0/image-to-video",
    reference: "https://www.runninghub.cn/openapi/v2/rhart-video/sparkvideo-2.0/multimodal-video"
  })
});
function normalizeRunningHubSeedance2Model(_0x4e3247) {
  const _0x701430 = String(_0x4e3247 || "").trim().toLowerCase();
  if (_0x701430 === "standard" || _0x701430 === "std") {
    return "standard";
  } else {
    return "fast";
  }
}
function normalizeRunningHubSeedance2Mode(_0x4c04eb) {
  const _0x2cb2cd = String(_0x4c04eb || "").trim().toLowerCase();
  if (_0x2cb2cd === "multimodal2video" || _0x2cb2cd === "reference") {
    return "multimodal2video";
  }
  if (_0x2cb2cd === "frames2video" || _0x2cb2cd === "frames") {
    return "frames2video";
  }
  if (_0x2cb2cd === "image2video" || _0x2cb2cd === "image" || _0x2cb2cd === "frame") {
    return "image2video";
  }
  return "text2video";
}
function getRunningHubSeedance2Model(_0x5d94e0 = {}, _0x7c18c4 = {}, _0x50fd69 = "", _0x55f517 = {}, _0x4e5423 = {}) {
  const _0x505b98 = String(_0x50fd69 || _0x5d94e0?.model || _0x7c18c4?.model || "").trim().toLowerCase();
  const _0x127036 = String(_0x55f517?.id || _0x4e5423?.modelId || "").trim().toLowerCase();
  if (_0x505b98.includes("seedance-2.0-mini") || _0x505b98.includes("sparkvideo-2.0-mini") || _0x127036.includes("seedance-2-mini") || _0x127036.includes("sparkvideo-2.0-mini")) {
    return "mini";
  }
  return normalizeRunningHubSeedance2Model(_0x7c18c4.rh_seedance_2_model || _0x5d94e0?.generationParams?.rh_seedance_2_model || _0x5d94e0?.rh_seedance_2_model);
}
function getRunningHubSeedance2Mode(_0x43ca92 = {}, _0x47d28d = {}) {
  return normalizeRunningHubSeedance2Mode(_0x47d28d.rh_seedance_2_mode || _0x43ca92?.generationParams?.rh_seedance_2_mode || _0x43ca92?.rh_seedance_2_mode);
}
function collectRunningHubSeedance2SlotImages({
  inputImages = [],
  finalUrlsBySlot = {},
  slotIds = []
} = {}) {
  const _0x315fd2 = [];
  const _0x37ef2b = a20_0x3155f4(finalUrlsBySlot);
  const _0x1275e3 = new Set(normalizeInputList(Object.values(_0x37ef2b)));
  slotIds.forEach(_0x5cca0f => appendUniqueUrl(_0x315fd2, _0x37ef2b[_0x5cca0f]));
  normalizeInputList(inputImages).forEach(_0x264bdd => {
    if (!_0x1275e3.has(_0x264bdd)) {
      appendUniqueUrl(_0x315fd2, _0x264bdd);
    }
  });
  return _0x315fd2;
}
function collectRunningHubSeedance2FrameImages(_0x1ad091 = {}) {
  return collectRunningHubSeedance2SlotImages({
    ..._0x1ad091,
    slotIds: ["firstFrame", "lastFrame"]
  });
}
function collectRunningHubSeedance2ReferenceImages(_0x3ac9a7 = {}) {
  return collectRunningHubSeedance2SlotImages({
    ..._0x3ac9a7,
    slotIds: ["referenceImage"]
  });
}
function resolveRunningHubSeedance2Route({
  payload = {},
  currentBody = {},
  modelToken = "",
  executionManifest = {},
  modelManifest = {}
} = {}) {
  const _0x1732a6 = getRunningHubSeedance2Model(payload, currentBody, modelToken, executionManifest, modelManifest);
  const _0x18d20b = getRunningHubSeedance2Mode(payload, currentBody);
  if (_0x18d20b === "multimodal2video") {
    return Object.freeze({
      model: _0x1732a6,
      route: "reference"
    });
  }
  if (_0x18d20b === "image2video" || _0x18d20b === "frames2video") {
    return Object.freeze({
      model: _0x1732a6,
      route: "image"
    });
  }
  return Object.freeze({
    model: _0x1732a6,
    route: "text"
  });
}
function removeRunningHubSeedance2TransientFields(_0x25453c) {
  delete _0x25453c.rh_seedance_2_model;
  delete _0x25453c.rh_seedance_2_mode;
  delete _0x25453c.firstFrameUrl;
  delete _0x25453c.lastFrameUrl;
  delete _0x25453c.imageUrls;
  delete _0x25453c.videoUrls;
  delete _0x25453c.audioUrls;
}
function normalizeRunningHubSeedance2ConversionSlots(_0x207d8d) {
  const _0x1ad45a = Array.isArray(_0x207d8d) ? _0x207d8d : ["all"];
  const _0x4933b3 = _0x1ad45a.map(_0xe81d1a => String(_0xe81d1a || "").trim()).filter(Boolean);
  if (_0x4933b3.length > 0) {
    return _0x4933b3;
  } else {
    return ["all"];
  }
}
export function runninghubSeedance2Video({
  currentBody: _0x3d121b,
  inputImages = [],
  inputVideos = [],
  inputAudios = [],
  payload = {},
  finalPrompt = "",
  finalUrlsBySlot = {},
  modelToken = "",
  executionManifest = {},
  modelManifest = {}
}) {
  const _0x1e2d55 = {
    ..._0x3d121b
  };
  const _0x37cc80 = String(_0x1e2d55.prompt || finalPrompt || payload?.prompt || "").trim();
  if (!_0x37cc80) {
    throw new Error("RunningHub Seedance 2.0 prompt is required");
  }
  const _0xdc73fc = getRunningHubSeedance2Mode(payload, _0x1e2d55);
  const _0x4bddcb = collectRunningHubSeedance2FrameImages({
    inputImages: inputImages,
    finalUrlsBySlot: finalUrlsBySlot
  });
  const _0x9afb3e = collectRunningHubSeedance2ReferenceImages({
    inputImages: inputImages,
    finalUrlsBySlot: finalUrlsBySlot
  });
  const _0x1cbd2a = normalizeInputList(inputVideos);
  const _0x54f083 = normalizeInputList(inputAudios);
  const _0x3fe190 = getRunningHubKlingV3RawMediaCount(payload, inputVideos, "video");
  const _0x3b7651 = getRunningHubKlingV3RawMediaCount(payload, inputAudios, "audio");
  _0x1e2d55.prompt = _0x37cc80;
  removeRunningHubSeedance2TransientFields(_0x1e2d55);
  if (_0xdc73fc === "multimodal2video") {
    if (_0x9afb3e.length + _0x1cbd2a.length <= 0) {
      throw new Error("RunningHub Seedance 2.0 multimodal mode requires image or video input");
    }
    if (_0x9afb3e.length > 9) {
      throw new Error("RunningHub Seedance 2.0 multimodal mode supports at most 9 image inputs");
    }
    if (_0x3fe190 > 3) {
      throw new Error("RunningHub Seedance 2.0 multimodal mode supports at most 3 video inputs");
    }
    if (_0x3b7651 > 3) {
      throw new Error("RunningHub Seedance 2.0 multimodal mode supports at most 3 audio inputs");
    }
    if (_0x54f083.length > 0 && _0x9afb3e.length + _0x1cbd2a.length <= 0) {
      throw new Error("RunningHub Seedance 2.0 audio input requires image or video input");
    }
    if (_0x9afb3e.length > 0) {
      _0x1e2d55.imageUrls = _0x9afb3e.slice(0, 9);
    }
    if (_0x1cbd2a.length > 0) {
      _0x1e2d55.videoUrls = _0x1cbd2a.slice(0, 3);
    }
    if (_0x54f083.length > 0) {
      _0x1e2d55.audioUrls = _0x54f083.slice(0, 3);
    }
    if (_0x1e2d55.realPersonMode === true) {
      _0x1e2d55.conversionSlots = normalizeRunningHubSeedance2ConversionSlots(_0x1e2d55.conversionSlots);
    } else {
      delete _0x1e2d55.conversionSlots;
    }
    delete _0x1e2d55.webSearch;
    return _0x1e2d55;
  }
  if (_0x3fe190 > 0) {
    throw new Error("RunningHub Seedance 2.0 text/image/frame modes do not accept video input; use multimodal mode");
  }
  if (_0x3b7651 > 0) {
    throw new Error("RunningHub Seedance 2.0 text/image/frame modes do not accept audio input; use multimodal mode");
  }
  if (_0xdc73fc === "text2video") {
    if (_0x4bddcb.length > 0) {
      throw new Error("RunningHub Seedance 2.0 text-to-video mode does not accept image input");
    }
    delete _0x1e2d55.realPersonMode;
    delete _0x1e2d55.conversionSlots;
    return _0x1e2d55;
  }
  if (_0xdc73fc === "image2video" && _0x4bddcb.length !== 1) {
    throw new Error("RunningHub Seedance 2.0 image-to-video mode requires exactly 1 image input");
  }
  if (_0xdc73fc === "frames2video" && _0x4bddcb.length !== 2) {
    throw new Error("RunningHub Seedance 2.0 first-last-frame mode requires exactly 2 image inputs");
  }
  _0x1e2d55.firstFrameUrl = _0x4bddcb[0];
  if (_0x4bddcb[1]) {
    _0x1e2d55.lastFrameUrl = _0x4bddcb[1];
  }
  delete _0x1e2d55.webSearch;
  if (_0x1e2d55.realPersonMode === true) {
    _0x1e2d55.conversionSlots = normalizeRunningHubSeedance2ConversionSlots(_0x1e2d55.conversionSlots);
  } else {
    delete _0x1e2d55.conversionSlots;
  }
  return _0x1e2d55;
}
export function runninghubSeedance2VideoEndpoint({
  payload = {},
  modelToken = "",
  executionManifest = {},
  modelManifest = {}
}) {
  const {
    model: _0x3f292a,
    route: _0x4d83ed
  } = resolveRunningHubSeedance2Route({
    payload: payload,
    currentBody: {},
    modelToken: modelToken || payload?.model || "",
    executionManifest: executionManifest,
    modelManifest: modelManifest
  });
  return RUNNINGHUB_SEEDANCE_2_ENDPOINTS[_0x3f292a]?.[_0x4d83ed] || RUNNINGHUB_SEEDANCE_2_ENDPOINTS.fast.text;
}
const RUNNINGHUB_KLING_O1_ENDPOINTS = Object.freeze({
  text: "https://www.runninghub.cn/openapi/v2/kling-video-o1/text-to-video",
  image: "https://www.runninghub.cn/openapi/v2/kling-video-o1/image-to-video",
  frames: "https://www.runninghub.cn/openapi/v2/kling-video-o1/start-to-end",
  reference: "https://www.runninghub.cn/openapi/v2/kling-video-o1-std/refrence-to-video",
  edit: "https://www.runninghub.cn/openapi/v2/kling-video-o1-std/edit-video"
});
function normalizeRunningHubKlingO1GenerationMode(_0xf8785a) {
  const _0x3c526f = String(_0xf8785a || "").trim().toLowerCase();
  if (_0x3c526f === "reference" || _0x3c526f === "edit") {
    return _0x3c526f;
  }
  return "frame";
}
function normalizeRunningHubKlingO1QualityMode(_0x215350) {
  const _0x4c4643 = String(_0x215350 || "").trim().toLowerCase();
  if (_0x4c4643 === "pro") {
    return "pro";
  } else {
    return "std";
  }
}
function normalizeRunningHubKlingO1AspectRatio(_0x2e9f54) {
  const _0x3aa63f = String(_0x2e9f54 || "9:16").trim();
  if (["16:9", "9:16", "1:1"].includes(_0x3aa63f)) {
    return _0x3aa63f;
  } else {
    return "9:16";
  }
}
function normalizeRunningHubKlingO1Duration(_0x5d42c9) {
  const _0x43bfd1 = Number(_0x5d42c9);
  if (Number.isFinite(_0x43bfd1) && Math.trunc(_0x43bfd1) === 10) {
    return "10";
  } else {
    return "5";
  }
}
function getRunningHubKlingO1GenerationMode(_0x310bc0 = {}, _0x2bbe88 = {}) {
  return normalizeRunningHubKlingO1GenerationMode(_0x2bbe88.rh_kling_o1_generation_mode || _0x310bc0?.generationParams?.rh_kling_o1_generation_mode || _0x310bc0?.rh_kling_o1_generation_mode);
}
function collectRunningHubKlingO1FrameImages({
  inputImages = [],
  finalUrlsBySlot = {}
} = {}) {
  const _0x155427 = [];
  const _0x251456 = a20_0x3155f4(finalUrlsBySlot);
  appendUniqueUrl(_0x155427, _0x251456.firstFrame);
  appendUniqueUrl(_0x155427, _0x251456.lastFrame);
  normalizeInputList(inputImages).forEach(_0x2026ea => appendUniqueUrl(_0x155427, _0x2026ea));
  return _0x155427;
}
function collectRunningHubKlingO1ReferenceImages({
  inputImages = [],
  finalUrlsBySlot = {}
} = {}) {
  const _0x33872d = [];
  const _0x2e6dd4 = a20_0x3155f4(finalUrlsBySlot);
  appendUniqueUrl(_0x33872d, _0x2e6dd4.referenceImage);
  normalizeInputList(inputImages).forEach(_0x1d7c9c => appendUniqueUrl(_0x33872d, _0x1d7c9c));
  return _0x33872d;
}
function resolveRunningHubKlingO1Route({
  inputImages = [],
  inputVideos = [],
  payload = {},
  finalUrlsBySlot = {},
  currentBody = {}
} = {}) {
  const _0x458694 = getRunningHubKlingO1GenerationMode(payload, currentBody);
  if (_0x458694 === "reference") {
    return "reference";
  }
  if (_0x458694 === "edit") {
    return "edit";
  }
  const _0xda75f4 = collectRunningHubKlingO1FrameImages({
    inputImages: inputImages,
    finalUrlsBySlot: finalUrlsBySlot
  }).length;
  if (_0xda75f4 >= 2) {
    return "frames";
  }
  if (_0xda75f4 === 1) {
    return "image";
  }
  const _0x19f39d = normalizeInputList(inputVideos).length;
  if (_0x19f39d > 0) {
    return "reference";
  } else {
    return "text";
  }
}
export function runninghubKlingO1Video({
  currentBody: _0x47d17c,
  inputImages = [],
  inputVideos = [],
  payload = {},
  finalUrlsBySlot = {}
}) {
  const _0x5b2485 = {
    ..._0x47d17c
  };
  const _0x4f4657 = getRunningHubKlingO1GenerationMode(payload, _0x5b2485);
  const _0x1f1f35 = normalizeKlingKeepOriginalSound(payload?.generationParams?.keepOriginalSound ?? payload?.generationParams?.keep_original_sound ?? payload?.keepOriginalSound ?? payload?.keep_original_sound ?? _0x5b2485.keepOriginalSound ?? _0x5b2485.keep_original_sound);
  const _0x5de6e7 = String(_0x5b2485.prompt || payload?.prompt || "").trim();
  if (!_0x5de6e7) {
    throw new Error("RunningHub Kling O1 prompt is required");
  }
  _0x5b2485.prompt = _0x5de6e7;
  _0x5b2485.mode = normalizeRunningHubKlingO1QualityMode(_0x5b2485.mode);
  _0x5b2485.aspectRatio = normalizeRunningHubKlingO1AspectRatio(_0x5b2485.aspectRatio);
  _0x5b2485.duration = normalizeRunningHubKlingO1Duration(_0x5b2485.duration);
  delete _0x5b2485.rh_kling_o1_generation_mode;
  delete _0x5b2485.keep_original_sound;
  delete _0x5b2485.keepOriginalSound;
  delete _0x5b2485.firstImageUrl;
  delete _0x5b2485.lastImageUrl;
  delete _0x5b2485.imageUrls;
  delete _0x5b2485.videoUrl;
  const _0xd21ca5 = normalizeInputList(inputVideos);
  const _0x29ae33 = Math.max(_0xd21ca5.length, normalizeInputList(payload?.videos).length, normalizeInputList(payload?.videoUrls).length, String(payload?.videoUrl || "").trim() ? 1 : 0);
  if (_0x4f4657 === "edit") {
    const _0x4dbcf2 = [];
    collectRunningHubKlingO1FrameImages({
      inputImages: inputImages,
      finalUrlsBySlot: finalUrlsBySlot
    }).forEach(_0x54e078 => appendUniqueUrl(_0x4dbcf2, _0x54e078));
    collectRunningHubKlingO1ReferenceImages({
      inputImages: inputImages,
      finalUrlsBySlot: finalUrlsBySlot
    }).forEach(_0x11cca7 => appendUniqueUrl(_0x4dbcf2, _0x11cca7));
    if (_0x4dbcf2.length > 0) {
      throw new Error("RunningHub Kling O1 edit mode does not accept image input");
    }
    if (_0x29ae33 < 1 || !_0xd21ca5[0]) {
      throw new Error("RunningHub Kling O1 edit mode requires 1 video input");
    }
    if (_0x29ae33 > 1) {
      throw new Error("RunningHub Kling O1 edit mode supports at most 1 video input");
    }
    _0x5b2485.mode = "std";
    _0x5b2485.videoUrl = _0xd21ca5[0];
    _0x5b2485.keepOriginalSound = _0x1f1f35;
    delete _0x5b2485.aspectRatio;
    delete _0x5b2485.duration;
    return _0x5b2485;
  }
  if (_0x4f4657 === "reference") {
    const _0x3cb215 = collectRunningHubKlingO1ReferenceImages({
      inputImages: inputImages,
      finalUrlsBySlot: finalUrlsBySlot
    });
    if (_0x3cb215.length < 1) {
      throw new Error("RunningHub Kling O1 reference mode requires at least 1 image input");
    }
    if (_0x3cb215.length > 7) {
      throw new Error("RunningHub Kling O1 reference mode supports at most 7 image inputs");
    }
    if (_0x29ae33 < 1 || !_0xd21ca5[0]) {
      throw new Error("RunningHub Kling O1 reference mode requires 1 video input");
    }
    if (_0x29ae33 > 1) {
      throw new Error("RunningHub Kling O1 reference mode supports at most 1 video input");
    }
    _0x5b2485.imageUrls = _0x3cb215;
    _0x5b2485.videoUrl = _0xd21ca5[0];
    _0x5b2485.keepOriginalSound = _0x1f1f35;
    _0x5b2485.prompt = replaceKlingO1PromptImageReferences(_0x5b2485.prompt, _0x3cb215.length);
    return _0x5b2485;
  }
  const _0x5e8726 = collectRunningHubKlingO1FrameImages({
    inputImages: inputImages,
    finalUrlsBySlot: finalUrlsBySlot
  });
  if (_0xd21ca5.length > 0) {
    throw new Error("RunningHub Kling O1 frame mode does not accept video input; use reference mode");
  }
  if (_0x5e8726.length > 2) {
    throw new Error("RunningHub Kling O1 frame mode supports at most 2 image inputs");
  }
  if (_0x5e8726[0]) {
    _0x5b2485.firstImageUrl = _0x5e8726[0];
  }
  if (_0x5e8726[1]) {
    _0x5b2485.lastImageUrl = _0x5e8726[1];
  }
  _0x5b2485.prompt = replaceKlingO1PromptImageReferences(_0x5b2485.prompt, _0x5e8726.length);
  return _0x5b2485;
}
export function runninghubKlingO1VideoEndpoint({
  inputImages = [],
  inputVideos = [],
  payload = {},
  finalUrlsBySlot = {}
}) {
  const _0x49740f = resolveRunningHubKlingO1Route({
    inputImages: inputImages,
    inputVideos: inputVideos,
    payload: payload,
    finalUrlsBySlot: finalUrlsBySlot
  });
  return RUNNINGHUB_KLING_O1_ENDPOINTS[_0x49740f] || RUNNINGHUB_KLING_O1_ENDPOINTS.text;
}
const RUNNINGHUB_KLING_V3_ENDPOINTS = Object.freeze({
  "turbo-pro": Object.freeze({
    text: "https://www.runninghub.cn/openapi/v2/kling-v3-turbo-pro/text-to-video",
    image: "https://www.runninghub.cn/openapi/v2/kling-v3-turbo-pro/image-to-video"
  }),
  std: Object.freeze({
    text: "https://www.runninghub.cn/openapi/v2/kling-v3.0-std/text-to-video",
    image: "https://www.runninghub.cn/openapi/v2/kling-v3.0-std/image-to-video"
  }),
  pro: Object.freeze({
    text: "https://www.runninghub.cn/openapi/v2/kling-v3.0-pro/text-to-video",
    image: "https://www.runninghub.cn/openapi/v2/kling-v3.0-pro/image-to-video"
  }),
  "4k": Object.freeze({
    text: "https://www.runninghub.cn/openapi/v2/kling-v3-4k/text-to-video",
    image: "https://www.runninghub.cn/openapi/v2/kling-v3-4k/image-to-video"
  })
});
function normalizeRunningHubKlingV3Model(_0x9d9c29) {
  const _0x403530 = String(_0x9d9c29 || "").trim().toLowerCase();
  if (_0x403530 === "4k") {
    return "4k";
  }
  if (_0x403530 === "pro") {
    return "pro";
  }
  return "std";
}
function getRunningHubKlingV3Model(_0x425c30 = {}, _0x17e0df = {}, _0x3984b4 = "", _0x58d2d4 = {}, _0x496834 = {}) {
  const _0x194f34 = String(_0x3984b4 || _0x425c30?.model || _0x17e0df?.model || "").trim().toLowerCase();
  const _0x77229c = String(_0x58d2d4?.id || _0x496834?.modelId || "").trim().toLowerCase();
  if (_0x194f34.includes("kling-v3-turbo-pro") || _0x77229c.includes("kling-v3-turbo-pro")) {
    return "turbo-pro";
  }
  return normalizeRunningHubKlingV3Model(_0x17e0df.rh_kling_v3_model || _0x425c30?.generationParams?.resolution || _0x425c30?.resolution);
}
function collectRunningHubKlingV3FrameImages({
  inputImages = [],
  finalUrlsBySlot = {}
} = {}) {
  const _0x2159ba = [];
  const _0x486339 = a20_0x3155f4(finalUrlsBySlot);
  appendUniqueUrl(_0x2159ba, _0x486339.firstFrame);
  appendUniqueUrl(_0x2159ba, _0x486339.lastFrame);
  normalizeInputList(inputImages).forEach(_0x78c5f => appendUniqueUrl(_0x2159ba, _0x78c5f));
  return _0x2159ba;
}
function getRunningHubKlingV3RawMediaCount(_0x427999 = {}, _0x20c6ae = [], _0x3f115c = "") {
  const _0x4c5fef = _0x3f115c === "audio" ? "audioUrl" : _0x3f115c + "Url";
  const _0x2a9b4b = _0x3f115c + "s";
  const _0x8599c1 = _0x3f115c + "Urls";
  return Math.max(normalizeInputList(_0x20c6ae).length, normalizeInputList(_0x427999?.[_0x2a9b4b]).length, normalizeInputList(_0x427999?.[_0x8599c1]).length, String(_0x427999?.[_0x4c5fef] || "").trim() ? 1 : 0);
}
function resolveRunningHubKlingV3Route({
  inputImages = [],
  payload = {},
  finalUrlsBySlot = {},
  currentBody = {},
  modelToken = "",
  executionManifest = {},
  modelManifest = {}
} = {}) {
  const _0x34b889 = getRunningHubKlingV3Model(payload, currentBody, modelToken, executionManifest, modelManifest);
  const _0x348ab9 = collectRunningHubKlingV3FrameImages({
    inputImages: inputImages,
    finalUrlsBySlot: finalUrlsBySlot
  }).length;
  return {
    model: _0x34b889,
    route: _0x348ab9 > 0 ? "image" : "text"
  };
}
export function runninghubKlingV3Video({
  currentBody: _0x3a391d,
  inputImages = [],
  inputVideos = [],
  inputAudios = [],
  payload = {},
  finalUrlsBySlot = {},
  modelToken = "",
  executionManifest = {},
  modelManifest = {}
}) {
  const _0x49df8a = {
    ..._0x3a391d
  };
  const _0x89220b = getRunningHubKlingV3Model(payload, _0x49df8a, modelToken, executionManifest, modelManifest);
  const _0x11fd3e = String(_0x49df8a.prompt || payload?.prompt || "").trim();
  if (!_0x11fd3e) {
    throw new Error("RunningHub Kling V3.0 prompt is required");
  }
  const _0x737e98 = getRunningHubKlingV3RawMediaCount(payload, inputVideos, "video");
  if (_0x737e98 > 0) {
    throw new Error("RunningHub Kling V3.0 does not accept video input");
  }
  const _0x18fc74 = getRunningHubKlingV3RawMediaCount(payload, inputAudios, "audio");
  if (_0x18fc74 > 0) {
    throw new Error("RunningHub Kling V3.0 does not accept audio input");
  }
  _0x49df8a.prompt = _0x11fd3e;
  delete _0x49df8a.rh_kling_v3_model;
  delete _0x49df8a.imageUrl;
  delete _0x49df8a.firstImageUrl;
  delete _0x49df8a.lastImageUrl;
  delete _0x49df8a.imageUrls;
  const _0x2dfc29 = collectRunningHubKlingV3FrameImages({
    inputImages: inputImages,
    finalUrlsBySlot: finalUrlsBySlot
  });
  if (_0x2dfc29.length > 2) {
    throw new Error("RunningHub Kling V3.0 supports at most 2 image inputs");
  }
  if (_0x2dfc29.length > 0) {
    delete _0x49df8a.aspectRatio;
    if (_0x89220b === "4k") {
      if (_0x2dfc29.length > 1) {
        throw new Error("RunningHub Kling V3.0 4K image-to-video supports only one imageUrl");
      }
      _0x49df8a.imageUrl = _0x2dfc29[0];
      return _0x49df8a;
    }
    _0x49df8a.firstImageUrl = _0x2dfc29[0];
    if (_0x2dfc29[1]) {
      _0x49df8a.lastImageUrl = _0x2dfc29[1];
    }
  }
  return _0x49df8a;
}
export function runninghubKlingV3VideoEndpoint({
  inputImages = [],
  payload = {},
  finalUrlsBySlot = {},
  modelToken = "",
  executionManifest = {},
  modelManifest = {}
}) {
  const {
    model: _0x1a561e,
    route: _0x9d1b8d
  } = resolveRunningHubKlingV3Route({
    inputImages: inputImages,
    payload: payload,
    finalUrlsBySlot: finalUrlsBySlot,
    currentBody: {
      model: modelToken
    },
    modelToken: modelToken,
    executionManifest: executionManifest,
    modelManifest: modelManifest
  });
  return RUNNINGHUB_KLING_V3_ENDPOINTS[_0x1a561e]?.[_0x9d1b8d] || RUNNINGHUB_KLING_V3_ENDPOINTS.std.text;
}
const RUNNINGHUB_KLING_O3_ENDPOINTS = Object.freeze({
  std: Object.freeze({
    text: "https://www.runninghub.cn/openapi/v2/kling-video-o3-std/text-to-video",
    image: "https://www.runninghub.cn/openapi/v2/kling-video-o3-std/image-to-video",
    reference: "https://www.runninghub.cn/openapi/v2/kling-video-o3-std/reference-to-video",
    edit: "https://www.runninghub.cn/openapi/v2/kling-video-o3-std/video-edit"
  }),
  pro: Object.freeze({
    text: "https://www.runninghub.cn/openapi/v2/kling-video-o3-pro/text-to-video",
    image: "https://www.runninghub.cn/openapi/v2/kling-video-o3-pro/image-to-video",
    reference: "https://www.runninghub.cn/openapi/v2/kling-video-o3-pro/reference-to-video",
    edit: "https://www.runninghub.cn/openapi/v2/kling-video-o3-pro/video-edit"
  }),
  "4k": Object.freeze({
    text: "https://www.runninghub.cn/openapi/v2/kling-video-o3-4k/text-to-video",
    image: "https://www.runninghub.cn/openapi/v2/kling-video-o3-4k/image-to-video",
    reference: "https://www.runninghub.cn/openapi/v2/kling-video-o3-4k/reference-to-video"
  })
});
function normalizeRunningHubKlingO3GenerationMode(_0x5184bc) {
  const _0x4ea31f = String(_0x5184bc || "").trim().toLowerCase();
  if (_0x4ea31f === "reference" || _0x4ea31f === "edit") {
    return _0x4ea31f;
  }
  return "frame";
}
function normalizeRunningHubKlingO3Model(_0x119700) {
  const _0x44979a = String(_0x119700 || "").trim().toLowerCase();
  if (_0x44979a === "4k") {
    return "4k";
  }
  if (_0x44979a === "pro") {
    return "pro";
  }
  return "std";
}
function getRunningHubKlingO3GenerationMode(_0x3edc89 = {}, _0x4d6f69 = {}) {
  return normalizeRunningHubKlingO3GenerationMode(_0x4d6f69.kling_v3_omni_mode || _0x3edc89?.generationParams?.kling_v3_omni_mode || _0x3edc89?.kling_v3_omni_mode);
}
function getRunningHubKlingO3Model(_0x3146dc = {}, _0x525448 = {}) {
  return normalizeRunningHubKlingO3Model(_0x525448.rh_kling_o3_model || _0x3146dc?.generationParams?.resolution || _0x3146dc?.resolution);
}
function collectRunningHubKlingO3SlotImages({
  inputImages = [],
  finalUrlsBySlot = {},
  slotIds = []
} = {}) {
  const _0x32f79a = [];
  const _0x5272cb = a20_0x3155f4(finalUrlsBySlot);
  const _0x457507 = new Set(normalizeInputList(Object.values(_0x5272cb)));
  slotIds.forEach(_0x320150 => appendUniqueUrl(_0x32f79a, _0x5272cb[_0x320150]));
  normalizeInputList(inputImages).forEach(_0x1344c2 => {
    if (!_0x457507.has(_0x1344c2)) {
      appendUniqueUrl(_0x32f79a, _0x1344c2);
    }
  });
  return _0x32f79a;
}
function collectRunningHubKlingO3FrameImages(_0x5ee09e = {}) {
  return collectRunningHubKlingO3SlotImages({
    ..._0x5ee09e,
    slotIds: ["firstFrame", "lastFrame"]
  });
}
function collectRunningHubKlingO3ReferenceImages(_0x4520ae = {}) {
  return collectRunningHubKlingO3SlotImages({
    ..._0x4520ae,
    slotIds: ["referenceImage"]
  });
}
function collectRunningHubKlingO3EditImages(_0x34d4e6 = {}) {
  return collectRunningHubKlingO3SlotImages({
    ..._0x34d4e6,
    slotIds: ["editRefImage"]
  });
}
function resolveRunningHubKlingO3Route({
  inputImages = [],
  payload = {},
  finalUrlsBySlot = {},
  currentBody = {}
} = {}) {
  const _0xf207f5 = getRunningHubKlingO3Model(payload, currentBody);
  const _0xab7465 = getRunningHubKlingO3GenerationMode(payload, currentBody);
  if (_0xab7465 === "reference") {
    return {
      model: _0xf207f5,
      route: "reference"
    };
  }
  if (_0xab7465 === "edit") {
    return {
      model: _0xf207f5,
      route: "edit"
    };
  }
  const _0x54a088 = collectRunningHubKlingO3FrameImages({
    inputImages: inputImages,
    finalUrlsBySlot: finalUrlsBySlot
  }).length;
  return {
    model: _0xf207f5,
    route: _0x54a088 > 0 ? "image" : "text"
  };
}
export function runninghubKlingO3Video({
  currentBody: _0xc6174d,
  inputImages = [],
  inputVideos = [],
  inputAudios = [],
  payload = {},
  finalUrlsBySlot = {}
}) {
  const _0x14b103 = {
    ..._0xc6174d
  };
  const _0x26826e = getRunningHubKlingO3Model(payload, _0x14b103);
  const _0x1ab543 = getRunningHubKlingO3GenerationMode(payload, _0x14b103);
  const _0x550076 = String(_0x14b103.prompt || payload?.prompt || "").trim();
  if (!_0x550076) {
    throw new Error("RunningHub Kling O3 prompt is required");
  }
  const _0x5643da = getRunningHubKlingV3RawMediaCount(payload, inputAudios, "audio");
  if (_0x5643da > 0) {
    throw new Error("RunningHub Kling O3 does not accept direct audio input");
  }
  const _0x217e45 = normalizeInputList(inputVideos);
  const _0x42bfc3 = getRunningHubKlingV3RawMediaCount(payload, inputVideos, "video");
  const _0x3d50d9 = normalizeKlingKeepOriginalSound(_0x14b103.keepOriginalSound ?? _0x14b103.keep_original_sound ?? payload?.generationParams?.keepOriginalSound ?? payload?.generationParams?.keep_original_sound ?? payload?.keepOriginalSound ?? payload?.keep_original_sound);
  _0x14b103.prompt = _0x550076;
  delete _0x14b103.kling_v3_omni_mode;
  delete _0x14b103.rh_kling_o3_model;
  delete _0x14b103.keep_original_sound;
  delete _0x14b103.keepOriginalSound;
  delete _0x14b103.firstImageUrl;
  delete _0x14b103.lastImageUrl;
  delete _0x14b103.imageUrl;
  delete _0x14b103.imageUrls;
  delete _0x14b103.videoUrl;
  if (_0x1ab543 === "edit") {
    if (_0x26826e === "4k") {
      throw new Error("RunningHub Kling O3 4K does not support video edit");
    }
    if (_0x42bfc3 < 1 || !_0x217e45[0]) {
      throw new Error("RunningHub Kling O3 edit mode requires 1 video input");
    }
    if (_0x42bfc3 > 1) {
      throw new Error("RunningHub Kling O3 edit mode supports at most 1 video input");
    }
    const _0x5c5b78 = collectRunningHubKlingO3EditImages({
      inputImages: inputImages,
      finalUrlsBySlot: finalUrlsBySlot
    });
    if (_0x5c5b78.length > 7) {
      throw new Error("RunningHub Kling O3 edit mode supports at most 7 image inputs");
    }
    _0x14b103.videoUrl = _0x217e45[0];
    if (_0x5c5b78.length > 0) {
      _0x14b103.imageUrls = _0x5c5b78;
    }
    _0x14b103.keepOriginalSound = _0x3d50d9;
    delete _0x14b103.aspectRatio;
    delete _0x14b103.duration;
    delete _0x14b103.sound;
    delete _0x14b103.multiShot;
    delete _0x14b103.shotType;
    return _0x14b103;
  }
  if (_0x1ab543 === "reference") {
    const _0x33aab3 = collectRunningHubKlingO3ReferenceImages({
      inputImages: inputImages,
      finalUrlsBySlot: finalUrlsBySlot
    });
    if (_0x33aab3.length < 1) {
      throw new Error("RunningHub Kling O3 reference mode requires at least 1 image input");
    }
    if (_0x42bfc3 > 1) {
      throw new Error("RunningHub Kling O3 reference mode supports at most 1 video input");
    }
    if (_0x217e45[0] && _0x33aab3.length > 4) {
      throw new Error("RunningHub Kling O3 reference mode supports at most 4 image inputs with video input");
    }
    if (_0x33aab3.length > 7) {
      throw new Error("RunningHub Kling O3 reference mode supports at most 7 image inputs");
    }
    _0x14b103.imageUrls = _0x33aab3;
    if (_0x217e45[0]) {
      _0x14b103.videoUrl = _0x217e45[0];
    }
    _0x14b103.keepOriginalSound = _0x3d50d9;
    if (_0x26826e !== "4k") {
      delete _0x14b103.shotType;
    }
    return _0x14b103;
  }
  if (_0x42bfc3 > 0) {
    throw new Error("RunningHub Kling O3 frame mode does not accept video input; use reference or edit mode");
  }
  const _0x389f55 = collectRunningHubKlingO3FrameImages({
    inputImages: inputImages,
    finalUrlsBySlot: finalUrlsBySlot
  });
  if (_0x389f55.length > 2) {
    throw new Error("RunningHub Kling O3 frame mode supports at most 2 image inputs");
  }
  if (_0x26826e === "4k" && _0x389f55.length > 1) {
    throw new Error("RunningHub Kling O3 4K image-to-video supports only one firstImageUrl");
  }
  if (_0x389f55.length > 0) {
    delete _0x14b103.aspectRatio;
    _0x14b103.firstImageUrl = _0x389f55[0];
    if (_0x389f55[1]) {
      _0x14b103.lastImageUrl = _0x389f55[1];
    }
  }
  return _0x14b103;
}
export function runninghubKlingO3VideoEndpoint({
  inputImages = [],
  payload = {},
  finalUrlsBySlot = {}
}) {
  const {
    model: _0x51cb9f,
    route: _0x3f154c
  } = resolveRunningHubKlingO3Route({
    inputImages: inputImages,
    payload: payload,
    finalUrlsBySlot: finalUrlsBySlot
  });
  return RUNNINGHUB_KLING_O3_ENDPOINTS[_0x51cb9f]?.[_0x3f154c] || RUNNINGHUB_KLING_O3_ENDPOINTS.std.text;
}
const RUNNINGHUB_HAILUO_02_ENDPOINTS = Object.freeze({
  t2vStandard: "https://www.runninghub.cn/openapi/v2/minimax/hailuo-02/t2v-standard",
  t2vPro: "https://www.runninghub.cn/openapi/v2/minimax/hailuo-02/t2v-pro",
  i2vStandard: "https://www.runninghub.cn/openapi/v2/minimax/hailuo-02/i2v-standard",
  i2vPro: "https://www.runninghub.cn/openapi/v2/minimax/hailuo-02/i2v-pro",
  i2vFast: "https://www.runninghub.cn/openapi/v2/minimax/hailuo-02/fast"
});
function normalizeRunningHubHailuo02Quality(_0x482322) {
  const _0x2ca729 = String(_0x482322 || "").trim().toLowerCase();
  if (_0x2ca729 === "pro") {
    return "pro";
  }
  if (_0x2ca729 === "fast") {
    return "fast";
  }
  return "standard";
}
function normalizeRunningHubHailuo02Duration(_0x3e6748) {
  const _0x104a4d = Number(_0x3e6748);
  if (Number.isFinite(_0x104a4d) && Math.trunc(_0x104a4d) === 10) {
    return "10";
  } else {
    return "6";
  }
}
function getRunningHubHailuo02Quality(_0x242a16 = {}, _0x98b5b6 = {}) {
  return normalizeRunningHubHailuo02Quality(_0x98b5b6.rh_hailuo_02_quality || _0x242a16?.generationParams?.rh_hailuo_02_quality || _0x242a16?.rh_hailuo_02_quality);
}
function collectRunningHubHailuo02FrameImages({
  inputImages = [],
  finalUrlsBySlot = {}
} = {}) {
  const _0x3389c0 = [];
  const _0x472964 = a20_0x3155f4(finalUrlsBySlot);
  appendUniqueUrl(_0x3389c0, _0x472964.firstFrame);
  appendUniqueUrl(_0x3389c0, _0x472964.lastFrame);
  normalizeInputList(inputImages).forEach(_0x44b6cb => appendUniqueUrl(_0x3389c0, _0x44b6cb));
  return _0x3389c0;
}
function getRunningHubHailuo02RawVideoCount(_0x6fff64 = {}, _0x573c60 = []) {
  return Math.max(normalizeInputList(_0x573c60).length, normalizeInputList(_0x6fff64?.videos).length, normalizeInputList(_0x6fff64?.videoUrls).length, String(_0x6fff64?.videoUrl || "").trim() ? 1 : 0);
}
function resolveRunningHubHailuo02Route({
  inputImages = [],
  payload = {},
  finalUrlsBySlot = {},
  currentBody = {}
} = {}) {
  const _0x2e5358 = getRunningHubHailuo02Quality(payload, currentBody);
  const _0x40d71f = collectRunningHubHailuo02FrameImages({
    inputImages: inputImages,
    finalUrlsBySlot: finalUrlsBySlot
  }).length;
  if (_0x2e5358 === "fast") {
    return "i2vFast";
  }
  if (_0x2e5358 === "pro") {
    if (_0x40d71f > 0) {
      return "i2vPro";
    } else {
      return "t2vPro";
    }
  }
  if (_0x40d71f > 0) {
    return "i2vStandard";
  } else {
    return "t2vStandard";
  }
}
export function runninghubHailuo02Video({
  currentBody: _0x32f83d,
  inputImages = [],
  inputVideos = [],
  payload = {},
  finalUrlsBySlot = {}
}) {
  const _0x3cac2f = {
    ..._0x32f83d
  };
  const _0xcbcabb = String(_0x3cac2f.prompt || payload?.prompt || "").trim();
  if (!_0xcbcabb) {
    throw new Error("RunningHub Hailuo 02 prompt is required");
  }
  const _0x4664ab = getRunningHubHailuo02Quality(payload, _0x3cac2f);
  const _0x248ebf = collectRunningHubHailuo02FrameImages({
    inputImages: inputImages,
    finalUrlsBySlot: finalUrlsBySlot
  });
  const _0x305036 = getRunningHubHailuo02RawVideoCount(payload, inputVideos);
  if (_0x305036 > 0) {
    throw new Error("RunningHub Hailuo 02 does not accept video input");
  }
  _0x3cac2f.prompt = _0xcbcabb;
  _0x3cac2f.duration = normalizeRunningHubHailuo02Duration(_0x3cac2f.duration);
  delete _0x3cac2f.rh_hailuo_02_quality;
  delete _0x3cac2f.firstImageUrl;
  delete _0x3cac2f.lastImageUrl;
  delete _0x3cac2f.imageUrl;
  delete _0x3cac2f.imageUrls;
  delete _0x3cac2f.videoUrl;
  if (_0x4664ab === "fast") {
    if (_0x248ebf.length < 1) {
      throw new Error("RunningHub Hailuo 02 Fast requires imageUrl input");
    }
    if (_0x248ebf.length > 1) {
      throw new Error("RunningHub Hailuo 02 Fast supports only imageUrl input");
    }
    _0x3cac2f.imageUrl = _0x248ebf[0];
    return _0x3cac2f;
  }
  if (_0x4664ab === "pro") {
    delete _0x3cac2f.duration;
    if (_0x248ebf.length > 1) {
      throw new Error("RunningHub Hailuo 02 Pro supports only firstImageUrl input");
    }
    if (_0x248ebf[0]) {
      _0x3cac2f.firstImageUrl = _0x248ebf[0];
    }
    return _0x3cac2f;
  }
  if (_0x248ebf.length > 2) {
    throw new Error("RunningHub Hailuo 02 Standard supports at most 2 image inputs");
  }
  if (_0x248ebf[0]) {
    _0x3cac2f.firstImageUrl = _0x248ebf[0];
  }
  if (_0x248ebf[1]) {
    _0x3cac2f.lastImageUrl = _0x248ebf[1];
  }
  return _0x3cac2f;
}
export function runninghubHailuo02VideoEndpoint({
  inputImages = [],
  payload = {},
  finalUrlsBySlot = {}
}) {
  const _0x3b7308 = resolveRunningHubHailuo02Route({
    inputImages: inputImages,
    payload: payload,
    finalUrlsBySlot: finalUrlsBySlot
  });
  return RUNNINGHUB_HAILUO_02_ENDPOINTS[_0x3b7308] || RUNNINGHUB_HAILUO_02_ENDPOINTS.t2vStandard;
}
const RUNNINGHUB_HAILUO_23_ENDPOINTS = Object.freeze({
  t2vStandard: "https://www.runninghub.cn/openapi/v2/minimax/hailuo-2.3/t2v-standard",
  t2vPro: "https://www.runninghub.cn/openapi/v2/minimax/hailuo-2.3/t2v-pro",
  i2vStandard: "https://www.runninghub.cn/openapi/v2/minimax/hailuo-2.3/i2v-standard",
  i2vPro: "https://www.runninghub.cn/openapi/v2/minimax/hailuo-2.3/image-to-video-pro",
  i2vFast: "https://www.runninghub.cn/openapi/v2/minimax/hailuo-2.3-fast/image-to-video",
  i2vFastPro: "https://www.runninghub.cn/openapi/v2/minimax/hailuo-2.3-fast-pro/image-to-video"
});
function normalizeRunningHubHailuo23Quality(_0x4b9e53) {
  const _0x1f3541 = String(_0x4b9e53 || "").trim().toLowerCase();
  if (_0x1f3541 === "pro") {
    return "pro";
  }
  if (_0x1f3541 === "fast") {
    return "fast";
  }
  if (_0x1f3541 === "fastpro" || _0x1f3541 === "fast-pro" || _0x1f3541 === "fast_pro") {
    return "fastPro";
  }
  return "standard";
}
function normalizeRunningHubHailuo23Duration(_0x5e6ebb) {
  const _0xa8c7e2 = Number(_0x5e6ebb);
  if (Number.isFinite(_0xa8c7e2) && Math.trunc(_0xa8c7e2) === 10) {
    return "10";
  } else {
    return "6";
  }
}
function getRunningHubHailuo23Quality(_0x2589c6 = {}, _0x126950 = {}) {
  return normalizeRunningHubHailuo23Quality(_0x126950.rh_hailuo_23_quality || _0x2589c6?.generationParams?.rh_hailuo_23_quality || _0x2589c6?.rh_hailuo_23_quality);
}
function collectRunningHubHailuo23FrameImages({
  inputImages = [],
  finalUrlsBySlot = {}
} = {}) {
  const _0x381b7c = [];
  const _0x5e4736 = a20_0x3155f4(finalUrlsBySlot);
  appendUniqueUrl(_0x381b7c, _0x5e4736.firstFrame);
  normalizeInputList(inputImages).forEach(_0x2aa062 => appendUniqueUrl(_0x381b7c, _0x2aa062));
  return _0x381b7c;
}
function getRunningHubHailuo23RawVideoCount(_0x257845 = {}, _0x16cd2d = []) {
  return Math.max(normalizeInputList(_0x16cd2d).length, normalizeInputList(_0x257845?.videos).length, normalizeInputList(_0x257845?.videoUrls).length, String(_0x257845?.videoUrl || "").trim() ? 1 : 0);
}
function resolveRunningHubHailuo23Route({
  inputImages = [],
  payload = {},
  finalUrlsBySlot = {},
  currentBody = {}
} = {}) {
  const _0x43f1cf = getRunningHubHailuo23Quality(payload, currentBody);
  const _0x5d7934 = collectRunningHubHailuo23FrameImages({
    inputImages: inputImages,
    finalUrlsBySlot: finalUrlsBySlot
  }).length;
  if (_0x43f1cf === "fast") {
    return "i2vFast";
  }
  if (_0x43f1cf === "fastPro") {
    return "i2vFastPro";
  }
  if (_0x43f1cf === "pro") {
    if (_0x5d7934 > 0) {
      return "i2vPro";
    } else {
      return "t2vPro";
    }
  }
  if (_0x5d7934 > 0) {
    return "i2vStandard";
  } else {
    return "t2vStandard";
  }
}
export function runninghubHailuo23Video({
  currentBody: _0x5a750d,
  inputImages = [],
  inputVideos = [],
  payload = {},
  finalUrlsBySlot = {}
}) {
  const _0x266de2 = {
    ..._0x5a750d
  };
  const _0x4c48f0 = String(_0x266de2.prompt || payload?.prompt || "").trim();
  if (!_0x4c48f0) {
    throw new Error("RunningHub Hailuo 2.3 prompt is required");
  }
  const _0x1b3583 = getRunningHubHailuo23Quality(payload, _0x266de2);
  const _0x5dd9bc = collectRunningHubHailuo23FrameImages({
    inputImages: inputImages,
    finalUrlsBySlot: finalUrlsBySlot
  });
  const _0xe1a966 = getRunningHubHailuo23RawVideoCount(payload, inputVideos);
  if (_0xe1a966 > 0) {
    throw new Error("RunningHub Hailuo 2.3 does not accept video input");
  }
  if (_0x5dd9bc.length > 1) {
    throw new Error("RunningHub Hailuo 2.3 supports only imageUrl input");
  }
  _0x266de2.prompt = _0x4c48f0;
  _0x266de2.duration = normalizeRunningHubHailuo23Duration(_0x266de2.duration);
  delete _0x266de2.rh_hailuo_23_quality;
  delete _0x266de2.firstImageUrl;
  delete _0x266de2.lastImageUrl;
  delete _0x266de2.imageUrl;
  delete _0x266de2.imageUrls;
  delete _0x266de2.videoUrl;
  if (_0x1b3583 === "fast" || _0x1b3583 === "fastPro") {
    if (!_0x5dd9bc[0]) {
      throw new Error("RunningHub Hailuo 2.3 Fast requires imageUrl input");
    }
    _0x266de2.imageUrl = _0x5dd9bc[0];
    if (_0x1b3583 === "fastPro") {
      _0x266de2.duration = "6";
    }
    return _0x266de2;
  }
  if (_0x1b3583 === "pro") {
    delete _0x266de2.duration;
  }
  if (_0x5dd9bc[0]) {
    _0x266de2.imageUrl = _0x5dd9bc[0];
  }
  return _0x266de2;
}
export function runninghubHailuo23VideoEndpoint({
  inputImages = [],
  payload = {},
  finalUrlsBySlot = {}
}) {
  const _0xfcc608 = resolveRunningHubHailuo23Route({
    inputImages: inputImages,
    payload: payload,
    finalUrlsBySlot: finalUrlsBySlot
  });
  return RUNNINGHUB_HAILUO_23_ENDPOINTS[_0xfcc608] || RUNNINGHUB_HAILUO_23_ENDPOINTS.t2vStandard;
}
const RUNNINGHUB_VEO3_ENDPOINTS = Object.freeze({
  lowCost: Object.freeze({
    text: Object.freeze({
      fast: "https://www.runninghub.cn/openapi/v2/rhart-video-v3.1-fast/text-to-video",
      pro: "https://www.runninghub.cn/openapi/v2/rhart-video-v3.1-pro/text-to-video"
    }),
    image: Object.freeze({
      fast: "https://www.runninghub.cn/openapi/v2/rhart-video-v3.1-fast/image-to-video"
    }),
    frames: Object.freeze({
      fast: "https://www.runninghub.cn/openapi/v2/rhart-video-v3.1-fast/start-end-to-video",
      pro: "https://www.runninghub.cn/openapi/v2/rhart-video-v3.1-pro/start-end-to-video"
    })
  }),
  official: Object.freeze({
    text: Object.freeze({
      fast: "https://www.runninghub.cn/openapi/v2/rhart-video-v3.1-fast-official/text-to-video",
      pro: "https://www.runninghub.cn/openapi/v2/rhart-video-v3.1-pro-official/text-to-video",
      lite: "https://www.runninghub.cn/openapi/v2/rhart-video-v3.1-lite-official/text-to-video"
    }),
    image: Object.freeze({
      fast: "https://www.runninghub.cn/openapi/v2/rhart-video-v3.1-fast-official/image-to-video",
      pro: "https://www.runninghub.cn/openapi/v2/rhart-video-v3.1-pro-official/image-to-video",
      lite: "https://www.runninghub.cn/openapi/v2/rhart-video-v3.1-lite-official/image-to-video"
    }),
    frames: Object.freeze({
      lite: "https://www.runninghub.cn/openapi/v2/rhart-video-v3.1-lite-official/start-end-to-video"
    }),
    reference: Object.freeze({
      fast: "https://www.runninghub.cn/openapi/v2/rhart-video-v3.1-fast-official/reference-to-video",
      pro: "https://www.runninghub.cn/openapi/v2/rhart-video-v3.1-pro-official/reference-to-video"
    }),
    extend: Object.freeze({
      fast: "https://www.runninghub.cn/openapi/v2/rhart-video-v3.1-fast-official/video-extend",
      pro: "https://www.runninghub.cn/openapi/v2/rhart-video-v3.1-pro-official/video-extend"
    })
  })
});
function normalizeRunningHubVeo3Channel(_0x2ee8b3) {
  const _0x5b966d = String(_0x2ee8b3 || "").trim().toLowerCase();
  if (_0x5b966d === "official" || _0x5b966d === "stable" || _0x5b966d === "officialstable") {
    return "official";
  }
  return "lowCost";
}
function normalizeRunningHubVeo3Mode(_0x16a6f0, {
  channel = "lowCost"
} = {}) {
  const _0x4fa7c6 = String(_0x16a6f0 || "").trim().toLowerCase();
  if (_0x4fa7c6 === "quality" || _0x4fa7c6 === "pro") {
    return "pro";
  }
  if (_0x4fa7c6 === "lite" && channel === "official") {
    return "lite";
  }
  return "fast";
}
function getRunningHubVeo3Channel(_0x45c3f = {}, _0x3433b9 = {}) {
  return normalizeRunningHubVeo3Channel(_0x3433b9.rh_veo3_channel || _0x45c3f?.generationParams?.rh_veo3_channel || _0x45c3f?.rh_veo3_channel);
}
function getRunningHubVeo3Mode(_0x32986e = {}, _0x37d7de = {}) {
  const _0x87f57b = getRunningHubVeo3Channel(_0x32986e, _0x37d7de);
  return normalizeRunningHubVeo3Mode(_0x37d7de.mode || _0x32986e?.generationParams?.mode || _0x32986e?.mode, {
    channel: _0x87f57b
  });
}
function getRunningHubVeo3GenerationType(_0x115ce1 = {}, _0x44608f = {}) {
  const _0x4ec313 = String(_0x44608f.generation_type || _0x115ce1?.generationParams?.generation_type || _0x115ce1?.generation_type || "frame").trim().toLowerCase();
  if (_0x4ec313 === "reference" || _0x4ec313 === "extend") {
    return _0x4ec313;
  }
  return "frame";
}
function collectRunningHubVeo3FrameImages({
  inputImages = [],
  finalUrlsBySlot = {}
} = {}) {
  const _0x18dfbc = [];
  const _0x4ab94e = a20_0x3155f4(finalUrlsBySlot);
  appendUniqueUrl(_0x18dfbc, _0x4ab94e.firstFrame);
  appendUniqueUrl(_0x18dfbc, _0x4ab94e.lastFrame);
  normalizeInputList(inputImages).forEach(_0x4fc610 => appendUniqueUrl(_0x18dfbc, _0x4fc610));
  return _0x18dfbc;
}
function collectRunningHubVeo3ReferenceImages({
  inputImages = [],
  finalUrlsBySlot = {}
} = {}) {
  const _0x24cf2c = [];
  const _0x47adc4 = a20_0x3155f4(finalUrlsBySlot);
  appendUniqueUrl(_0x24cf2c, _0x47adc4.referenceImage);
  normalizeInputList(inputImages).forEach(_0x4f22fb => appendUniqueUrl(_0x24cf2c, _0x4f22fb));
  return _0x24cf2c;
}
function getRunningHubVeo3RawVideoCount(_0x22c8b3 = {}, _0x59047b = []) {
  return Math.max(normalizeInputList(_0x59047b).length, normalizeInputList(_0x22c8b3?.videos).length, normalizeInputList(_0x22c8b3?.videoUrls).length, String(_0x22c8b3?.videoUrl || "").trim() ? 1 : 0);
}
function resolveRunningHubVeo3Route({
  inputImages = [],
  inputVideos = [],
  payload = {},
  finalUrlsBySlot = {},
  currentBody = {}
} = {}) {
  const _0x2a9836 = getRunningHubVeo3Channel(payload, currentBody);
  const _0x82db8d = getRunningHubVeo3Mode(payload, currentBody);
  const _0x59af35 = getRunningHubVeo3GenerationType(payload, currentBody);
  if (_0x59af35 === "extend" || normalizeInputList(inputVideos).length > 0) {
    return Object.freeze({
      channel: _0x2a9836,
      mode: _0x82db8d,
      route: "extend"
    });
  }
  if (_0x59af35 === "reference") {
    return Object.freeze({
      channel: _0x2a9836,
      mode: _0x82db8d,
      route: "reference"
    });
  }
  const _0x57b9fa = collectRunningHubVeo3FrameImages({
    inputImages: inputImages,
    finalUrlsBySlot: finalUrlsBySlot
  });
  if (_0x57b9fa.length >= 2) {
    return Object.freeze({
      channel: _0x2a9836,
      mode: _0x82db8d,
      route: "frames"
    });
  }
  if (_0x57b9fa.length === 1) {
    return Object.freeze({
      channel: _0x2a9836,
      mode: _0x82db8d,
      route: _0x2a9836 === "lowCost" && _0x82db8d === "pro" ? "frames" : "image"
    });
  }
  return Object.freeze({
    channel: _0x2a9836,
    mode: _0x82db8d,
    route: "text"
  });
}
function normalizeRunningHubVeo3BodyResolution(_0x6444a2, {
  channel: _0x4b4ada,
  mode: _0x572093
}) {
  const _0xa5ea43 = String(_0x6444a2 || "720p").trim().toLowerCase();
  if (_0x4b4ada === "lowCost") {
    return "720p";
  }
  if (_0x572093 === "lite" && _0xa5ea43 === "4k") {
    return "1080p";
  }
  if (_0xa5ea43 === "4k" || _0xa5ea43 === "1080p") {
    return _0xa5ea43;
  }
  return "720p";
}
function normalizeRunningHubVeo3BodyDuration(_0x444dc0, {
  channel: _0x14f85d,
  mode: _0x37d26a
}) {
  if (_0x14f85d === "lowCost") {
    return "8";
  }
  const _0x2e5dec = Math.trunc(Number(_0x444dc0));
  if (_0x37d26a === "lite") {
    if (_0x2e5dec === 8) {
      return "8";
    } else {
      return "6";
    }
  }
  if ([4, 6, 8].includes(_0x2e5dec)) {
    return String(_0x2e5dec);
  } else {
    return "8";
  }
}
function removeRunningHubVeo3TransientFields(_0x2c733d) {
  delete _0x2c733d.rh_veo3_channel;
  delete _0x2c733d.mode;
  delete _0x2c733d.generation_type;
  delete _0x2c733d.imageUrl;
  delete _0x2c733d.imageUrls;
  delete _0x2c733d.firstFrameUrl;
  delete _0x2c733d.lastFrameUrl;
  delete _0x2c733d.firstImageUrl;
  delete _0x2c733d.lastImageUrl;
  delete _0x2c733d.videoUrl;
  delete _0x2c733d.video;
}
export function runninghubVeo3Video({
  currentBody: _0x533f2d,
  inputImages = [],
  inputVideos = [],
  payload = {},
  finalUrlsBySlot = {}
}) {
  const _0x14364b = {
    ..._0x533f2d
  };
  const _0x404a97 = resolveRunningHubVeo3Route({
    inputImages: inputImages,
    inputVideos: inputVideos,
    payload: payload,
    finalUrlsBySlot: finalUrlsBySlot,
    currentBody: _0x14364b
  });
  const {
    channel: _0x1bf28b,
    mode: _0x368e03,
    route: _0x32b6d6
  } = _0x404a97;
  const _0x312e78 = getRunningHubVeo3GenerationType(payload, _0x14364b);
  const _0x322e01 = getRunningHubVeo3RawVideoCount(payload, inputVideos);
  if (_0x322e01 > 0 && _0x32b6d6 !== "extend") {
    throw new Error("RunningHub Veo3 does not accept video input");
  }
  const _0xa68ac7 = String(_0x14364b.prompt || payload?.prompt || "").trim();
  if (_0x32b6d6 !== "extend") {
    if (!_0xa68ac7) {
      throw new Error("RunningHub Veo3 prompt is required");
    }
    _0x14364b.prompt = _0xa68ac7;
  }
  _0x14364b.resolution = normalizeRunningHubVeo3BodyResolution(_0x14364b.resolution, {
    channel: _0x1bf28b,
    mode: _0x368e03
  });
  _0x14364b.duration = normalizeRunningHubVeo3BodyDuration(_0x14364b.duration, {
    channel: _0x1bf28b,
    mode: _0x368e03
  });
  removeRunningHubVeo3TransientFields(_0x14364b);
  if (_0x32b6d6 === "extend") {
    if (_0x1bf28b !== "official" || _0x368e03 === "lite") {
      throw new Error("RunningHub Veo3 video extend only supports official Fast or Pro");
    }
    const _0x4bffa1 = normalizeInputList(inputVideos);
    if (_0x322e01 < 1 || !_0x4bffa1[0]) {
      throw new Error("RunningHub Veo3 video extend requires 1 video input");
    }
    if (_0x322e01 > 1) {
      throw new Error("RunningHub Veo3 video extend supports at most 1 video input");
    }
    const _0x2f0ff1 = [];
    collectRunningHubVeo3FrameImages({
      inputImages: inputImages,
      finalUrlsBySlot: finalUrlsBySlot
    }).forEach(_0x1a7d3f => appendUniqueUrl(_0x2f0ff1, _0x1a7d3f));
    collectRunningHubVeo3ReferenceImages({
      inputImages: inputImages,
      finalUrlsBySlot: finalUrlsBySlot
    }).forEach(_0x430fa4 => appendUniqueUrl(_0x2f0ff1, _0x430fa4));
    if (_0x2f0ff1.length > 0) {
      throw new Error("RunningHub Veo3 video extend does not accept image input");
    }
    _0x14364b.video = _0x4bffa1[0];
    delete _0x14364b.prompt;
    delete _0x14364b.duration;
    delete _0x14364b.aspectRatio;
    delete _0x14364b.generateAudio;
    return _0x14364b;
  }
  if (_0x312e78 === "reference") {
    if (_0x1bf28b !== "official" || _0x368e03 === "lite") {
      throw new Error("RunningHub Veo3 reference mode only supports official Fast or Pro");
    }
    const _0x24bcb9 = collectRunningHubVeo3ReferenceImages({
      inputImages: inputImages,
      finalUrlsBySlot: finalUrlsBySlot
    });
    if (_0x24bcb9.length < 1) {
      throw new Error("RunningHub Veo3 reference mode requires 1-3 image inputs");
    }
    if (_0x24bcb9.length > 3) {
      throw new Error("RunningHub Veo3 reference mode supports at most 3 image inputs");
    }
    _0x14364b.imageUrls = _0x24bcb9;
    delete _0x14364b.duration;
    if (_0x368e03 === "pro") {
      delete _0x14364b.aspectRatio;
    }
    return _0x14364b;
  }
  const _0x4b790e = collectRunningHubVeo3FrameImages({
    inputImages: inputImages,
    finalUrlsBySlot: finalUrlsBySlot
  });
  if (_0x4b790e.length > 2) {
    throw new Error("RunningHub Veo3 frame mode supports at most 2 image inputs");
  }
  if (_0x4b790e.length >= 2 && _0x1bf28b === "official" && _0x368e03 !== "lite") {
    throw new Error("RunningHub Veo3 official Fast/Pro start-end endpoint is not published; use official Lite or low-cost channel");
  }
  if (_0x4b790e.length === 1) {
    if (_0x1bf28b === "official") {
      _0x14364b.imageUrl = _0x4b790e[0];
    } else if (_0x368e03 === "pro") {
      _0x14364b.firstFrameUrl = _0x4b790e[0];
    } else {
      _0x14364b.imageUrls = [_0x4b790e[0]];
    }
  } else if (_0x4b790e.length === 2) {
    if (_0x1bf28b === "official") {
      _0x14364b.firstImageUrl = _0x4b790e[0];
      _0x14364b.lastImageUrl = _0x4b790e[1];
      delete _0x14364b.duration;
    } else {
      _0x14364b.firstFrameUrl = _0x4b790e[0];
      _0x14364b.lastFrameUrl = _0x4b790e[1];
    }
  }
  if (_0x1bf28b === "lowCost" || _0x368e03 === "lite") {
    delete _0x14364b.generateAudio;
  }
  return _0x14364b;
}
export function runninghubVeo3VideoEndpoint({
  inputImages = [],
  inputVideos = [],
  payload = {},
  finalUrlsBySlot = {}
}) {
  const {
    channel: _0x20510d,
    mode: _0x3aee28,
    route: _0x4ce5b2
  } = resolveRunningHubVeo3Route({
    inputImages: inputImages,
    inputVideos: inputVideos,
    payload: payload,
    finalUrlsBySlot: finalUrlsBySlot
  });
  return RUNNINGHUB_VEO3_ENDPOINTS[_0x20510d]?.[_0x4ce5b2]?.[_0x3aee28] || RUNNINGHUB_VEO3_ENDPOINTS.lowCost.text.fast;
}
const RUNNINGHUB_WAN27_ENDPOINTS = Object.freeze({
  text: "https://www.runninghub.cn/openapi/v2/alibaba/wan-2.7/text-to-video",
  image: "https://www.runninghub.cn/openapi/v2/alibaba/wan-2.7/image-to-video",
  video: "https://www.runninghub.cn/openapi/v2/alibaba/wan-2.7/video-extend",
  reference: "https://www.runninghub.cn/openapi/v2/alibaba/wan-2.7/reference-to-video",
  edit: "https://www.runninghub.cn/openapi/v2/alibaba/wan-2.7/video-edit"
});
function normalizeRunningHubWan27Mode(_0xd12af1) {
  const _0x479e19 = String(_0xd12af1 || "").trim().toLowerCase();
  if (_0x479e19 === "video" || _0x479e19 === "reference" || _0x479e19 === "edit") {
    return _0x479e19;
  } else {
    return "image";
  }
}
function getRunningHubWan27Mode(_0x3bd29d = {}, _0x344c32 = {}) {
  return normalizeRunningHubWan27Mode(_0x344c32.wan27_mode || _0x3bd29d?.generationParams?.wan27_mode || _0x3bd29d?.wan27_mode);
}
function collectRunningHubWan27Images({
  mode: _0x231bad,
  inputImages = [],
  finalUrlsBySlot = {}
} = {}) {
  const _0x4cfb4d = [];
  const _0x4871c9 = a20_0x3155f4(finalUrlsBySlot);
  if (_0x231bad === "image") {
    appendUniqueUrl(_0x4cfb4d, _0x4871c9.firstFrame);
    appendUniqueUrl(_0x4cfb4d, _0x4871c9.lastFrame);
  } else if (_0x231bad === "reference") {
    appendUniqueUrl(_0x4cfb4d, _0x4871c9.referenceImage);
  } else if (_0x231bad === "edit") {
    appendUniqueUrl(_0x4cfb4d, _0x4871c9.editRefImage);
  }
  normalizeInputList(inputImages).forEach(_0x57c981 => appendUniqueUrl(_0x4cfb4d, _0x57c981));
  return _0x4cfb4d;
}
function removeRunningHubWan27TransientFields(_0x6c02b9) {
  delete _0x6c02b9.wan27_mode;
  delete _0x6c02b9.firstImageUrl;
  delete _0x6c02b9.lastImageUrl;
  delete _0x6c02b9.imageUrl;
  delete _0x6c02b9.imageUrls;
  delete _0x6c02b9.videoUrl;
  delete _0x6c02b9.videoUrls;
  if (!_0x6c02b9.aspectRatio) {
    delete _0x6c02b9.aspectRatio;
  }
}
function resolveRunningHubWan27Route({
  inputImages = [],
  inputVideos = [],
  payload = {},
  finalUrlsBySlot = {},
  currentBody = {}
} = {}) {
  const _0x5a67d1 = getRunningHubWan27Mode(payload, currentBody);
  if (_0x5a67d1 === "reference" || _0x5a67d1 === "edit") {
    return _0x5a67d1;
  }
  const _0x4fcd4f = normalizeInputList(inputVideos);
  if (_0x5a67d1 === "video" && _0x4fcd4f.length > 0) {
    return "video";
  }
  const _0x25cf94 = collectRunningHubWan27Images({
    mode: _0x5a67d1,
    inputImages: inputImages,
    finalUrlsBySlot: finalUrlsBySlot
  });
  if (_0x25cf94.length > 0) {
    return "image";
  }
  return "text";
}
export function runninghubWan27Video({
  currentBody: _0x4aefdf,
  inputImages = [],
  inputVideos = [],
  inputAudios = [],
  payload = {},
  finalUrlsBySlot = {}
}) {
  const _0x16e059 = {
    ..._0x4aefdf
  };
  const _0x4e7841 = String(_0x16e059.prompt || payload?.prompt || "").trim();
  if (!_0x4e7841) {
    throw new Error("RunningHub Wan2.7 prompt is required");
  }
  const _0x38fe8d = getRunningHubWan27Mode(payload, _0x16e059);
  const _0x3b36de = collectRunningHubWan27Images({
    mode: _0x38fe8d,
    inputImages: inputImages,
    finalUrlsBySlot: finalUrlsBySlot
  });
  const _0x3fbd6c = normalizeInputList(inputVideos);
  const _0x25ad1e = String(_0x16e059.audioUrl || "").trim() || normalizeInputList(inputAudios)[0] || "";
  _0x16e059.prompt = _0x4e7841;
  if (_0x25ad1e) {
    _0x16e059.audioUrl = _0x25ad1e;
  }
  removeRunningHubWan27TransientFields(_0x16e059);
  if (_0x38fe8d === "reference") {
    const _0xe354fc = _0x3b36de.length + _0x3fbd6c.length;
    if (_0xe354fc <= 0) {
      throw new Error("RunningHub Wan2.7 reference mode requires image or video input");
    }
    if (_0xe354fc > 5) {
      throw new Error("RunningHub Wan2.7 reference mode supports at most 5 inputs");
    }
    if (_0x25ad1e) {
      throw new Error("RunningHub Wan2.7 reference mode does not accept audio input");
    }
    if (_0x3b36de.length > 0) {
      _0x16e059.imageUrls = _0x3b36de;
    }
    if (_0x3fbd6c.length > 0) {
      _0x16e059.videoUrls = _0x3fbd6c;
    }
    return _0x16e059;
  }
  if (_0x38fe8d === "edit") {
    if (!_0x3fbd6c[0]) {
      throw new Error("RunningHub Wan2.7 video edit requires original video input");
    }
    if (_0x3fbd6c.length > 1) {
      throw new Error("RunningHub Wan2.7 video edit accepts only one original video");
    }
    if (_0x3b36de.length > 3) {
      throw new Error("RunningHub Wan2.7 video edit supports at most 3 image inputs");
    }
    if (_0x25ad1e) {
      throw new Error("RunningHub Wan2.7 video edit does not accept audio input");
    }
    _0x16e059.videoUrl = _0x3fbd6c[0];
    if (_0x3b36de.length > 0) {
      _0x16e059.imageUrls = _0x3b36de.slice(0, 3);
    }
    return _0x16e059;
  }
  if (_0x38fe8d === "video") {
    if (_0x3b36de.length > 0) {
      throw new Error("RunningHub Wan2.7 video extend does not accept image input");
    }
    if (_0x3fbd6c.length > 1) {
      throw new Error("RunningHub Wan2.7 video extend accepts only one video input");
    }
    if (_0x3fbd6c[0]) {
      _0x16e059.videoUrl = _0x3fbd6c[0];
    }
    return _0x16e059;
  }
  if (_0x3fbd6c.length > 0) {
    throw new Error("RunningHub Wan2.7 image mode does not accept video input");
  }
  if (_0x3b36de.length > 2) {
    throw new Error("RunningHub Wan2.7 image mode supports at most 2 image inputs");
  }
  if (_0x3b36de[0]) {
    delete _0x16e059.aspectRatio;
    _0x16e059.firstImageUrl = _0x3b36de[0];
  }
  if (_0x3b36de[1]) {
    _0x16e059.lastImageUrl = _0x3b36de[1];
  }
  return _0x16e059;
}
export function runninghubWan27VideoEndpoint({
  inputImages = [],
  inputVideos = [],
  payload = {},
  finalUrlsBySlot = {}
}) {
  const _0x713020 = resolveRunningHubWan27Route({
    inputImages: inputImages,
    inputVideos: inputVideos,
    payload: payload,
    finalUrlsBySlot: finalUrlsBySlot
  });
  return RUNNINGHUB_WAN27_ENDPOINTS[_0x713020] || RUNNINGHUB_WAN27_ENDPOINTS.text;
}