import { appendUniqueUrl, normalizeInputList, normalizeInputUrlsBySlot } from "./sharedResolverUtils.js";
import { translateMinimaxH3EditorAssetMentions } from "../minimaxH3Prompt.js";
const RUNNINGHUB_HAILUO_H3_ENDPOINTS = Object.freeze({
  text: "https://www.runninghub.cn/openapi/v2/minimax/hailuo-h3/text-to-video",
  image: "https://www.runninghub.cn/openapi/v2/minimax/hailuo-h3/image-to-video",
  reference: "https://www.runninghub.cn/openapi/v2/minimax/hailuo-h3/multimodal-to-video"
});
const RUNNINGHUB_HAILUO_H3_RATIOS = new Set(["adaptive", "21:9", "16:9", "4:3", "1:1", "3:4", "9:16"]);
function normalizeHailuoH3Mode(_0x4f56cc) {
  const _0x5c91d6 = String(_0x4f56cc || "").trim().toLowerCase();
  if (_0x5c91d6 === "reference" || _0x5c91d6 === "multimodal") {
    return "reference";
  } else {
    return "frames";
  }
}
function getHailuoH3Mode(_0x1311d8 = {}, _0x4c77d6 = {}) {
  return normalizeHailuoH3Mode(_0x4c77d6.rh_hailuo_h3_mode || _0x1311d8?.generationParams?.rh_hailuo_h3_mode || _0x1311d8?.rh_hailuo_h3_mode);
}
function normalizeHailuoH3Duration(_0x6442d4) {
  const _0x41f2ac = Math.trunc(Number(_0x6442d4));
  if (Number.isFinite(_0x41f2ac) && _0x41f2ac >= 5 && _0x41f2ac <= 15) {
    return String(_0x41f2ac);
  } else {
    return "5";
  }
}
function normalizeHailuoH3Ratio(_0x32346, {
  allowAdaptive: _0x2e254b
}) {
  const _0x165c25 = String(_0x32346 || "").trim();
  const _0x62f96f = _0x165c25 === "自适应" || _0x165c25.toLowerCase() === "auto" ? "adaptive" : _0x165c25.toLowerCase();
  if (!RUNNINGHUB_HAILUO_H3_RATIOS.has(_0x62f96f)) {
    return "16:9";
  }
  if (_0x62f96f === "adaptive" && !_0x2e254b) {
    return "16:9";
  } else {
    return _0x62f96f;
  }
}
function collectImagesWithSlotPriority({
  inputImages = [],
  finalUrlsBySlot = {},
  slotIds = []
}) {
  const _0x4fd77e = [];
  const _0x5cc78e = normalizeInputUrlsBySlot(finalUrlsBySlot);
  const _0x2c5a5a = new Set(normalizeInputList(slotIds.map(_0x45122d => _0x5cc78e[_0x45122d])));
  slotIds.forEach(_0x5a8733 => appendUniqueUrl(_0x4fd77e, _0x5cc78e[_0x5a8733]));
  normalizeInputList(inputImages).forEach(_0x14ef6b => {
    if (!_0x2c5a5a.has(_0x14ef6b)) {
      appendUniqueUrl(_0x4fd77e, _0x14ef6b);
    }
  });
  return {
    images: _0x4fd77e,
    slotUrls: _0x5cc78e
  };
}
function resolveHailuoH3FrameInputs({
  inputImages = [],
  finalUrlsBySlot = {}
}) {
  const {
    images: _0x43cdbb,
    slotUrls: _0x3fb97c
  } = collectImagesWithSlotPriority({
    inputImages: inputImages,
    finalUrlsBySlot: finalUrlsBySlot,
    slotIds: ["firstFrame", "lastFrame"]
  });
  const _0x58a0a8 = new Set(normalizeInputList([_0x3fb97c.firstFrame, _0x3fb97c.lastFrame]));
  const _0x5d456c = normalizeInputList(inputImages).filter(_0x1a056d => !_0x58a0a8.has(_0x1a056d));
  let _0x1a62dd = String(_0x3fb97c.firstFrame || "").trim();
  let _0x25729f = String(_0x3fb97c.lastFrame || "").trim();
  if (!_0x1a62dd && _0x5d456c.length > 0) {
    _0x1a62dd = _0x5d456c.shift();
  }
  if (!_0x25729f && _0x5d456c.length > 0) {
    _0x25729f = _0x5d456c.shift();
  }
  return {
    count: _0x43cdbb.length,
    firstFrameUrl: _0x1a62dd,
    lastFrameUrl: _0x25729f
  };
}
function removeHailuoH3TransientFields(_0x2203ce) {
  delete _0x2203ce.rh_hailuo_h3_mode;
  delete _0x2203ce.firstFrameUrl;
  delete _0x2203ce.lastFrameUrl;
  delete _0x2203ce.imageUrls;
  delete _0x2203ce.videoUrls;
  delete _0x2203ce.audioUrls;
}
export function runninghubHailuoH3Video({
  currentBody: _0x552009,
  inputImages = [],
  inputVideos = [],
  inputAudios = [],
  payload = {},
  finalPrompt = "",
  finalUrlsBySlot = {}
}) {
  const _0x331f12 = {
    ..._0x552009
  };
  const _0x8dce34 = translateMinimaxH3EditorAssetMentions(_0x331f12.prompt || finalPrompt || payload?.prompt || "").trim();
  if (!_0x8dce34) {
    throw new Error("RunningHub MiniMax-H3 prompt is required");
  }
  const _0x4a567d = getHailuoH3Mode(payload, _0x331f12);
  const _0x38f83d = normalizeInputList(inputVideos);
  const _0x3d1531 = normalizeInputList(inputAudios);
  _0x331f12.prompt = _0x8dce34;
  _0x331f12.resolution = "2K";
  _0x331f12.duration = normalizeHailuoH3Duration(_0x331f12.duration);
  removeHailuoH3TransientFields(_0x331f12);
  if (_0x4a567d === "reference") {
    const {
      images: _0x3032ae
    } = collectImagesWithSlotPriority({
      inputImages: inputImages,
      finalUrlsBySlot: finalUrlsBySlot,
      slotIds: ["referenceImage"]
    });
    if (_0x3032ae.length === 0 && _0x38f83d.length === 0 && _0x3d1531.length === 0) {
      throw new Error("MiniMax-H3 多参考模式至少需要一张图片、一个视频或一段音频");
    }
    if (_0x3032ae.length > 9) {
      throw new Error("RunningHub MiniMax-H3 reference mode supports at most 9 image inputs");
    }
    if (_0x38f83d.length > 3) {
      throw new Error("RunningHub MiniMax-H3 reference mode supports at most 3 video inputs");
    }
    if (_0x3d1531.length > 3) {
      throw new Error("RunningHub MiniMax-H3 reference mode supports at most 3 audio inputs");
    }
    if (_0x3032ae.length > 0) {
      _0x331f12.imageUrls = _0x3032ae;
    }
    if (_0x38f83d.length > 0) {
      _0x331f12.videoUrls = _0x38f83d;
    }
    if (_0x3d1531.length > 0) {
      _0x331f12.audioUrls = _0x3d1531;
    }
    _0x331f12.ratio = normalizeHailuoH3Ratio(_0x331f12.ratio, {
      allowAdaptive: true
    });
    return _0x331f12;
  }
  if (_0x38f83d.length > 0 || _0x3d1531.length > 0) {
    throw new Error("RunningHub MiniMax-H3 first-last-frame mode accepts images only; use reference mode for video or audio inputs");
  }
  const _0x63679b = resolveHailuoH3FrameInputs({
    inputImages: inputImages,
    finalUrlsBySlot: finalUrlsBySlot
  });
  if (_0x63679b.count > 2) {
    throw new Error("RunningHub MiniMax-H3 first-last-frame mode supports at most 2 image inputs");
  }
  if (_0x63679b.count === 0) {
    _0x331f12.ratio = normalizeHailuoH3Ratio(_0x331f12.ratio, {
      allowAdaptive: false
    });
    return _0x331f12;
  }
  if (_0x63679b.firstFrameUrl) {
    _0x331f12.firstFrameUrl = _0x63679b.firstFrameUrl;
  }
  if (_0x63679b.lastFrameUrl) {
    _0x331f12.lastFrameUrl = _0x63679b.lastFrameUrl;
  }
  delete _0x331f12.ratio;
  return _0x331f12;
}
export function runninghubHailuoH3VideoEndpoint(_0x392b6f = {}) {
  const _0x28fba4 = getHailuoH3Mode(_0x392b6f.payload, _0x392b6f.currentBody);
  if (_0x28fba4 === "reference") {
    return RUNNINGHUB_HAILUO_H3_ENDPOINTS.reference;
  }
  const _0x237274 = resolveHailuoH3FrameInputs(_0x392b6f);
  if (_0x237274.count > 0) {
    return RUNNINGHUB_HAILUO_H3_ENDPOINTS.image;
  } else {
    return RUNNINGHUB_HAILUO_H3_ENDPOINTS.text;
  }
}