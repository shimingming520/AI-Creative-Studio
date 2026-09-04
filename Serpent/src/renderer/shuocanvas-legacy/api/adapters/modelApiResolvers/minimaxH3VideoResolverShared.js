import { appendUniqueUrl, normalizeInputList, normalizeInputUrlsBySlot } from "./sharedResolverUtils.js";
import { translateMinimaxH3EditorAssetMentions } from "../minimaxH3Prompt.js";
const MINIMAX_H3_RATIOS = new Set(["adaptive", "21:9", "16:9", "4:3", "1:1", "3:4", "9:16"]);
function normalizeMode(_0x386f07) {
  const _0x4ca3db = String(_0x386f07 || "").trim().toLowerCase();
  if (_0x4ca3db === "reference" || _0x4ca3db === "multimodal") {
    return "reference";
  } else {
    return "frames";
  }
}
function normalizeDuration(_0x284f19) {
  const _0x264367 = Math.trunc(Number(_0x284f19));
  if (Number.isFinite(_0x264367) && _0x264367 >= 4 && _0x264367 <= 15) {
    return _0x264367;
  } else {
    return 5;
  }
}
function normalizeResolution(_0x53ba13) {
  if (String(_0x53ba13 || "").trim().toUpperCase() === "768P") {
    return "768P";
  } else {
    return "2K";
  }
}
function normalizeRatio(_0x57f1dc, {
  allowAdaptive: _0x4ead56
}) {
  const _0x4a39f1 = String(_0x57f1dc || "").trim();
  const _0x3a38e7 = _0x4a39f1.toLowerCase();
  const _0x2a7ae3 = _0x4a39f1 === "自适应" || ["auto", "default"].includes(_0x3a38e7) ? "adaptive" : _0x3a38e7 || "adaptive";
  if (!MINIMAX_H3_RATIOS.has(_0x2a7ae3)) {
    return "16:9";
  }
  if (_0x2a7ae3 === "adaptive" && !_0x4ead56) {
    return "16:9";
  } else {
    return _0x2a7ae3;
  }
}
function collectImages({
  inputImages = [],
  finalUrlsBySlot = {},
  slotIds = []
}) {
  const _0x38745d = [];
  const _0x4e882c = normalizeInputUrlsBySlot(finalUrlsBySlot);
  const _0x412c48 = new Set(normalizeInputList(slotIds.map(_0x5ebaab => _0x4e882c[_0x5ebaab])));
  slotIds.forEach(_0x565cba => appendUniqueUrl(_0x38745d, _0x4e882c[_0x565cba]));
  normalizeInputList(inputImages).forEach(_0x7297e0 => {
    if (!_0x412c48.has(_0x7297e0)) {
      appendUniqueUrl(_0x38745d, _0x7297e0);
    }
  });
  return {
    images: _0x38745d,
    slotUrls: _0x4e882c
  };
}
function resolveFrameInputs({
  inputImages = [],
  finalUrlsBySlot = {}
}) {
  const {
    images: _0x24ddb4,
    slotUrls: _0x155f7a
  } = collectImages({
    inputImages: inputImages,
    finalUrlsBySlot: finalUrlsBySlot,
    slotIds: ["firstFrame", "lastFrame"]
  });
  const _0x3b2c67 = new Set(normalizeInputList([_0x155f7a.firstFrame, _0x155f7a.lastFrame]));
  const _0x20752c = normalizeInputList(inputImages).filter(_0x5a8f73 => !_0x3b2c67.has(_0x5a8f73));
  let _0x524d74 = String(_0x155f7a.firstFrame || "").trim();
  let _0x48cb6d = String(_0x155f7a.lastFrame || "").trim();
  if (!_0x524d74 && _0x20752c.length > 0) {
    _0x524d74 = _0x20752c.shift();
  }
  if (!_0x48cb6d && _0x20752c.length > 0) {
    _0x48cb6d = _0x20752c.shift();
  }
  return {
    count: _0x24ddb4.length,
    firstFrameImage: _0x524d74,
    lastFrameImage: _0x48cb6d
  };
}
export function resolveMinimaxH3Request({
  currentBody = {},
  inputImages = [],
  inputVideos = [],
  inputAudios = [],
  payload = {},
  finalPrompt = "",
  finalUrlsBySlot = {},
  modeFieldId: _0x59f45b,
  providerLabel: _0x463141,
  allowStandaloneAudioReference = false
}) {
  const _0x2c47d6 = {
    ...currentBody
  };
  const _0x4ee862 = translateMinimaxH3EditorAssetMentions(_0x2c47d6.prompt || finalPrompt || payload?.prompt || "").trim();
  if (!_0x4ee862) {
    throw new Error(_0x463141 + " MiniMax-H3 prompt is required");
  }
  if (_0x4ee862.length > 7000) {
    throw new Error(_0x463141 + " MiniMax-H3 prompt must not exceed 7000 characters");
  }
  const _0x41d4ea = normalizeMode(_0x2c47d6[_0x59f45b] || payload?.generationParams?.[_0x59f45b] || payload?.[_0x59f45b]);
  const _0x4c4a9f = normalizeResolution(_0x2c47d6.resolution);
  const _0x5a9a0e = normalizeDuration(_0x2c47d6.duration);
  const _0x16cf7b = Boolean(_0x2c47d6.aigc_watermark ?? _0x2c47d6.watermark ?? false);
  const _0x44cb5b = normalizeInputList(inputVideos);
  const _0x1d64ed = normalizeInputList(inputAudios);
  if (_0x41d4ea === "reference") {
    const {
      images: _0x54200d
    } = collectImages({
      inputImages: inputImages,
      finalUrlsBySlot: finalUrlsBySlot,
      slotIds: ["referenceImage"]
    });
    if (_0x54200d.length > 9) {
      throw new Error(_0x463141 + " MiniMax-H3 reference mode supports at most 9 image inputs");
    }
    if (_0x44cb5b.length > 3) {
      throw new Error(_0x463141 + " MiniMax-H3 reference mode supports at most 3 video inputs");
    }
    if (_0x1d64ed.length > 3) {
      throw new Error(_0x463141 + " MiniMax-H3 reference mode supports at most 3 audio inputs");
    }
    if (!allowStandaloneAudioReference && _0x1d64ed.length > 0 && _0x54200d.length === 0 && _0x44cb5b.length === 0) {
      throw new Error(_0x463141 + " MiniMax-H3 audio references require an image or video reference");
    }
    return {
      mode: _0x41d4ea,
      prompt: _0x4ee862,
      resolution: _0x4c4a9f,
      duration: _0x5a9a0e,
      watermark: _0x16cf7b,
      ratio: normalizeRatio(_0x2c47d6.ratio || _0x2c47d6.aspect_ratio || payload?.generationParams?.aspectRatio || payload?.aspectRatio, {
        allowAdaptive: true
      }),
      referenceImages: _0x54200d,
      referenceVideos: _0x44cb5b,
      referenceAudios: _0x1d64ed
    };
  }
  if (_0x44cb5b.length > 0 || _0x1d64ed.length > 0) {
    throw new Error(_0x463141 + " MiniMax-H3 first-last-frame mode accepts images only; use reference mode for video or audio inputs");
  }
  const _0x2f9083 = resolveFrameInputs({
    inputImages: inputImages,
    finalUrlsBySlot: finalUrlsBySlot
  });
  if (_0x2f9083.count > 2) {
    throw new Error(_0x463141 + " MiniMax-H3 first-last-frame mode supports at most 2 image inputs");
  }
  return {
    mode: _0x41d4ea,
    prompt: _0x4ee862,
    resolution: _0x4c4a9f,
    duration: _0x5a9a0e,
    watermark: _0x16cf7b,
    ratio: _0x2f9083.count > 0 ? "adaptive" : normalizeRatio(_0x2c47d6.ratio || _0x2c47d6.aspect_ratio || payload?.generationParams?.aspectRatio || payload?.aspectRatio, {
      allowAdaptive: false
    }),
    firstFrameImage: _0x2f9083.firstFrameImage,
    lastFrameImage: _0x2f9083.lastFrameImage
  };
}