import { normalizeRatioLabelText } from "../../imageRatioPolicy.js";
import { uploadModelApiMediaInputs } from "../../mediaInputUploadRouter.js";
import { applyApimartPrivateAvatarAssetsToUrls, supportsApimartPrivateAvatarAssets } from "../apimartPrivateAvatarAssetResolver.js";
import { appendUniqueUrl, isPresentValue, normalizeInputList, normalizeInputUrlsBySlot as a12_0x111db3, normalizeKlingKeepOriginalSound, normalizePositiveInteger, replaceKlingO1PromptImageReferences, stripPrefix } from "./sharedResolverUtils.js";
import { resolveMinimaxH3Request } from "./minimaxH3VideoResolverShared.js";
const VEO3_MODEL_CHOICES = new Set(["fast", "quality"]);
const VEO3_IMAGE_GENERATION_TYPES = new Set(["frame", "reference"]);
const VIDU_Q3_VIDEO_MODELS = new Set(["viduq3-turbo", "viduq3-pro"]);
const VIDU_Q3_REFERENCE_MODELS = new Set(["viduq3", "viduq3-mix"]);
function normalizeApimartVeo3ModelChoice(_0x3a4d79) {
  const _0x2658f6 = String(_0x3a4d79 || "").trim().toLowerCase();
  if (VEO3_MODEL_CHOICES.has(_0x2658f6)) {
    return _0x2658f6;
  } else {
    return "fast";
  }
}
function getApimartVeo3ModelChoice(_0x3d5ab4 = {}) {
  return normalizeApimartVeo3ModelChoice(_0x3d5ab4?.generationParams?.mode ?? _0x3d5ab4?.mode);
}
function normalizeApimartVeo3GenerationType(_0xf6ca87, {
  modelChoice = "fast"
} = {}) {
  const _0x38c5f3 = String(_0xf6ca87 || "").trim().toLowerCase();
  const _0x3f3718 = VEO3_IMAGE_GENERATION_TYPES.has(_0x38c5f3) ? _0x38c5f3 : "frame";
  if (normalizeApimartVeo3ModelChoice(modelChoice) === "quality") {
    return "frame";
  }
  return _0x3f3718;
}
function getApimartVeo3GenerationType(_0x379c3c = {}) {
  const _0x270849 = getApimartVeo3ModelChoice(_0x379c3c);
  return normalizeApimartVeo3GenerationType(_0x379c3c?.generationParams?.generation_type ?? _0x379c3c?.generation_type, {
    modelChoice: _0x270849
  });
}
function validateApimartVeo3ImageCount(_0x2a2ca5 = {}, _0x50a356 = 0, {
  allowTextOnly = false
} = {}) {
  const _0x43686c = Math.max(0, Math.trunc(Number(_0x50a356) || 0));
  if (allowTextOnly && _0x43686c === 0) {
    return Object.freeze({
      ok: true,
      message: ""
    });
  }
  const _0x28c207 = getApimartVeo3GenerationType(_0x2a2ca5);
  if (_0x28c207 === "reference") {
    return Object.freeze({
      ok: _0x43686c <= 3,
      message: _0x43686c <= 3 ? "" : "VEO3 参考图模式最多接入 3 张图片"
    });
  }
  return Object.freeze({
    ok: _0x43686c <= 2,
    message: _0x43686c <= 2 ? "" : "VEO3 首尾帧模式最多接入 2 张图片"
  });
}
export function apimartOmniFlashVideo({
  currentBody: _0x1a975c
}) {
  const _0x2e6795 = {
    ..._0x1a975c
  };
  if (normalizeInputList(_0x2e6795.video_urls).length > 0) {
    delete _0x2e6795.duration;
  }
  return _0x2e6795;
}
export function apimartVeo3Video({
  currentBody: _0x9c7351,
  inputImages = [],
  payload = {}
}) {
  const _0x2dcb2c = {
    ..._0x9c7351
  };
  const _0x6b3d12 = normalizeInputList(inputImages);
  const _0x4e33bb = getApimartVeo3ModelChoice(payload);
  const _0x411a9c = getApimartVeo3GenerationType(payload);
  _0x2dcb2c.duration = 8;
  delete _0x2dcb2c.official_fallback;
  const _0x50c0ae = String(_0x2dcb2c.resolution || "").trim().toLowerCase();
  if (_0x2dcb2c.enable_gif === true && (_0x50c0ae === "1080p" || _0x50c0ae === "4k")) {
    throw new Error("APIMart VEO3 GIF output only supports 720p resolution");
  }
  const _0xf20562 = validateApimartVeo3ImageCount({
    generationParams: {
      mode: _0x4e33bb,
      generation_type: _0x411a9c
    }
  }, _0x6b3d12.length, {
    allowTextOnly: true
  });
  if (!_0xf20562.ok) {
    throw new Error(_0xf20562.message);
  }
  if (_0x6b3d12.length === 0) {
    delete _0x2dcb2c.generation_type;
    delete _0x2dcb2c.image_urls;
    return _0x2dcb2c;
  }
  _0x2dcb2c.generation_type = _0x411a9c === "reference" ? "reference" : "frame";
  _0x2dcb2c.image_urls = _0x2dcb2c.generation_type === "reference" ? _0x6b3d12.slice(0, 3) : _0x6b3d12.slice(0, 2);
  return _0x2dcb2c;
}
export function apimartHappyHorseVideo({
  currentBody: _0x17a399,
  inputImages = [],
  inputVideos = [],
  payload = {},
  finalPrompt = "",
  finalUrlsBySlot = {},
  executionManifest = null
}) {
  const _0x169afe = {
    ..._0x17a399
  };
  const _0x377cb0 = executionManifest?.extensions?.happyHorse && typeof executionManifest.extensions.happyHorse === "object" && !Array.isArray(executionManifest.extensions.happyHorse) ? executionManifest.extensions.happyHorse : {};
  const _0x106b86 = String(_0x377cb0.versionLabel || "HappyHorse 1.0").trim();
  const _0x37e587 = _0x377cb0.supportsEdit !== false;
  const _0x33e196 = String(_0x169afe.prompt || finalPrompt || payload?.prompt || "").trim();
  if (!_0x33e196) {
    throw new Error(_0x106b86 + " prompt is required");
  }
  const _0x42e874 = normalizeInputList(inputImages);
  const _0x46b4f6 = normalizeInputList(inputVideos);
  const _0x19c6b6 = a12_0x111db3(finalUrlsBySlot);
  const _0x1c0db9 = (_0x154108 = [], _0xaccb57 = []) => {
    const _0x3b014e = [];
    const _0x221981 = _0x26a69b => {
      const _0x56c111 = String(_0x26a69b || "").trim();
      if (_0x56c111 && !_0x3b014e.includes(_0x56c111)) {
        _0x3b014e.push(_0x56c111);
      }
    };
    _0x154108.forEach(_0x583bc7 => _0x221981(_0x19c6b6[_0x583bc7]));
    normalizeInputList(_0xaccb57).forEach(_0x221981);
    return _0x3b014e;
  };
  let _0x2ce24f = String(payload?.generationParams?.happyhorse_mode || payload?.happyhorse_mode || "auto").trim();
  const _0x2593bf = _0x42e874.length > 0 || _0x46b4f6.length > 0 || Object.keys(_0x19c6b6).length > 0;
  if ((_0x2ce24f === "image" || _0x2ce24f === "reference" || _0x2ce24f === "edit") && !_0x2593bf) {
    _0x2ce24f = "auto";
  }
  delete _0x169afe.happyhorse_mode;
  if (!_0x37e587 && _0x46b4f6.length > 0) {
    throw new Error(_0x106b86 + " does not support video edit mode");
  }
  if (_0x2ce24f === "edit") {
    if (!_0x37e587) {
      throw new Error(_0x106b86 + " does not support video edit mode");
    }
    if (!_0x46b4f6[0]) {
      throw new Error(_0x106b86 + " video edit requires video_url input");
    }
    const _0x127ef2 = _0x1c0db9(["editRefImage"], _0x42e874);
    _0x169afe.video_url = _0x46b4f6[0];
    if (_0x127ef2.length > 0) {
      _0x169afe.image_urls = _0x127ef2.slice(0, 5);
    }
    const _0xd82870 = String(payload?.generationParams?.audio_setting || payload?.audio_setting || "").trim();
    if (_0xd82870 === "auto" || _0xd82870 === "origin") {
      _0x169afe.audio_setting = _0xd82870;
    }
    delete _0x169afe.first_frame_image;
    delete _0x169afe.size;
    delete _0x169afe.duration;
    return _0x169afe;
  }
  delete _0x169afe.audio_setting;
  if (_0x2ce24f === "image") {
    const _0x5002a3 = _0x1c0db9(["firstFrame"], _0x42e874);
    if (!_0x5002a3[0]) {
      throw new Error(_0x106b86 + " image-to-video requires first_frame_image input");
    }
    _0x169afe.first_frame_image = _0x5002a3[0];
    delete _0x169afe.image_urls;
    delete _0x169afe.video_url;
    delete _0x169afe.size;
    return _0x169afe;
  }
  if (_0x2ce24f === "reference") {
    const _0x3ff24a = _0x1c0db9(["referenceImage"], _0x42e874);
    if (_0x3ff24a.length <= 0) {
      throw new Error(_0x106b86 + " reference mode requires image_urls input");
    }
    _0x169afe.image_urls = _0x3ff24a.slice(0, 9);
    delete _0x169afe.first_frame_image;
    delete _0x169afe.video_url;
    return _0x169afe;
  }
  if (_0x2ce24f !== "auto") {
    throw new Error("Unsupported " + _0x106b86 + " mode: " + _0x2ce24f);
  }
  if (_0x42e874.length > 0 || _0x46b4f6.length > 0) {
    throw new Error(_0x106b86 + " media inputs require an explicit mode selection");
  }
  delete _0x169afe.first_frame_image;
  delete _0x169afe.image_urls;
  delete _0x169afe.video_url;
  return _0x169afe;
}
export function apimartHailuo02Video({
  currentBody: _0x33d550,
  inputImages = [],
  finalUrlsBySlot = {}
}) {
  const _0x5136d4 = {
    ..._0x33d550
  };
  const _0x134dc2 = normalizeInputList(inputImages);
  const _0x4d8536 = a12_0x111db3(finalUrlsBySlot);
  const _0x5eaf14 = Object.keys(_0x4d8536).length > 0;
  if (_0x5eaf14) {
    delete _0x5136d4.first_frame_image;
    delete _0x5136d4.last_frame_image;
    if (_0x4d8536.firstFrame) {
      _0x5136d4.first_frame_image = _0x4d8536.firstFrame;
    }
    if (_0x4d8536.lastFrame) {
      _0x5136d4.last_frame_image = _0x4d8536.lastFrame;
    }
    return _0x5136d4;
  }
  if (_0x134dc2[0]) {
    _0x5136d4.first_frame_image = _0x134dc2[0];
  }
  if (_0x134dc2[1]) {
    _0x5136d4.last_frame_image = _0x134dc2[1];
  }
  return _0x5136d4;
}
export function apimartHailuo23Video({
  currentBody: _0x512595,
  inputImages = [],
  finalUrlsBySlot = {},
  modelToken = ""
}) {
  const _0x335b65 = {
    ..._0x512595
  };
  delete _0x335b65.last_frame_image;
  const _0xe74cec = normalizeInputList(inputImages);
  const _0x44b2e4 = a12_0x111db3(finalUrlsBySlot);
  const _0x106a2d = Object.keys(_0x44b2e4).length > 0;
  if (_0x106a2d) {
    delete _0x335b65.first_frame_image;
    if (_0x44b2e4.firstFrame) {
      _0x335b65.first_frame_image = _0x44b2e4.firstFrame;
    }
  } else if (_0xe74cec[0]) {
    _0x335b65.first_frame_image = _0xe74cec[0];
  }
  const _0x208c0b = String(modelToken || _0x335b65.model || "").trim().toLowerCase();
  if (_0x208c0b === "minimax-hailuo-2.3-fast" && !String(_0x335b65.first_frame_image || "").trim()) {
    throw new Error("APIMart Hailuo 2.3 Fast requires first_frame_image input");
  }
  return _0x335b65;
}
function removeApimartMinimaxH3TransientFields(_0x22cf4a) {
  delete _0x22cf4a.apimart_minimax_h3_mode;
  delete _0x22cf4a.first_frame_image;
  delete _0x22cf4a.last_frame_image;
  delete _0x22cf4a.image_urls;
  delete _0x22cf4a.video_urls;
  delete _0x22cf4a.audio_urls;
}
export function apimartMinimaxH3Video({
  currentBody: _0x13ab89,
  inputImages = [],
  inputVideos = [],
  inputAudios = [],
  payload = {},
  finalPrompt = "",
  finalUrlsBySlot = {}
}) {
  const _0x321b62 = {
    ..._0x13ab89
  };
  const _0x3fa0ff = resolveMinimaxH3Request({
    currentBody: _0x13ab89,
    inputImages: inputImages,
    inputVideos: inputVideos,
    inputAudios: inputAudios,
    payload: payload,
    finalPrompt: finalPrompt,
    finalUrlsBySlot: finalUrlsBySlot,
    modeFieldId: "apimart_minimax_h3_mode",
    providerLabel: "APIMart"
  });
  _0x321b62.prompt = _0x3fa0ff.prompt;
  _0x321b62.resolution = _0x3fa0ff.resolution;
  _0x321b62.duration = _0x3fa0ff.duration;
  removeApimartMinimaxH3TransientFields(_0x321b62);
  if (_0x3fa0ff.mode === "reference") {
    if (_0x3fa0ff.referenceImages.length > 0) {
      _0x321b62.image_urls = _0x3fa0ff.referenceImages;
    }
    if (_0x3fa0ff.referenceVideos.length > 0) {
      _0x321b62.video_urls = _0x3fa0ff.referenceVideos;
    }
    if (_0x3fa0ff.referenceAudios.length > 0) {
      _0x321b62.audio_urls = _0x3fa0ff.referenceAudios;
    }
    _0x321b62.aspect_ratio = _0x3fa0ff.ratio;
    return _0x321b62;
  }
  if (!_0x3fa0ff.firstFrameImage && !_0x3fa0ff.lastFrameImage) {
    _0x321b62.aspect_ratio = _0x3fa0ff.ratio;
    return _0x321b62;
  }
  if (_0x3fa0ff.firstFrameImage) {
    _0x321b62.first_frame_image = _0x3fa0ff.firstFrameImage;
  }
  if (_0x3fa0ff.lastFrameImage) {
    _0x321b62.last_frame_image = _0x3fa0ff.lastFrameImage;
  }
  delete _0x321b62.aspect_ratio;
  return _0x321b62;
}
export function apimartViduQ3Video({
  currentBody: _0x1382f7,
  inputImages = [],
  payload = {},
  finalPrompt = "",
  modelToken = ""
}) {
  const _0x4b6acc = {
    ..._0x1382f7
  };
  const _0x58feb6 = String(_0x4b6acc.prompt || finalPrompt || payload?.prompt || "").trim();
  if (!_0x58feb6) {
    throw new Error("APIMart Vidu Q3 prompt is required");
  }
  _0x4b6acc.prompt = _0x58feb6;
  const _0x38d531 = String(payload?.generationParams?.vidu_q3_generation_mode || payload?.vidu_q3_generation_mode || "video").trim().toLowerCase();
  const _0x5c41ad = String(modelToken || _0x4b6acc.model || "viduq3-turbo").trim().toLowerCase();
  const _0x41989e = normalizeInputList(inputImages);
  const _0x5ac2a9 = a12_0x111db3(payload?.inputUrlsBySlot);
  const _0x4d7afd = Math.max(_0x41989e.length, normalizeInputList(payload?.inputUrls).length, normalizeInputList(payload?.images).length, Object.keys(_0x5ac2a9).length);
  if (_0x38d531 === "reference") {
    if (!VIDU_Q3_REFERENCE_MODELS.has(_0x5c41ad)) {
      throw new Error("APIMart Vidu Q3 reference mode only supports viduq3 or viduq3-mix");
    }
    if (_0x41989e.length < 1 || _0x4d7afd > 7) {
      throw new Error("APIMart Vidu Q3 reference mode requires 1-7 image inputs");
    }
    _0x4b6acc.model = _0x5c41ad;
    _0x4b6acc.image_urls = _0x41989e.slice(0, 7);
    delete _0x4b6acc.audio;
    return _0x4b6acc;
  }
  if (!VIDU_Q3_VIDEO_MODELS.has(_0x5c41ad)) {
    throw new Error("APIMart Vidu Q3 video generation mode only supports viduq3-turbo or viduq3-pro");
  }
  if (_0x4d7afd > 2) {
    throw new Error("APIMart Vidu Q3 video generation mode supports at most 2 image inputs");
  }
  _0x4b6acc.model = _0x5c41ad;
  if (_0x41989e.length > 0) {
    _0x4b6acc.image_urls = _0x41989e.slice(0, 2);
    delete _0x4b6acc.aspect_ratio;
  } else {
    delete _0x4b6acc.image_urls;
  }
  return _0x4b6acc;
}
export function apimartWan27Video({
  currentBody: _0x745f35,
  payload = {}
}) {
  const _0x30fa21 = {
    ..._0x745f35
  };
  const _0x131cd7 = normalizeInputList(_0x30fa21.image_urls);
  const _0x22c15a = normalizeInputList(_0x30fa21.video_urls);
  const _0xf62d73 = isPresentValue(_0x30fa21.audio_url) ? String(_0x30fa21.audio_url || "").trim() : "";
  const _0x292daf = !!_0xf62d73;
  const _0x3f23b6 = String(payload?.generationParams?.wan27_mode || payload?.wan27_mode || "image").trim().toLowerCase();
  delete _0x30fa21.wan27_mode;
  delete _0x30fa21.wan27_reference_input;
  delete _0x30fa21.wan27_edit_input;
  if (_0x3f23b6 === "reference") {
    _0x30fa21.model = "wan2.7-r2v";
    const _0x5c0e15 = _0x131cd7.slice(0, 1);
    const _0x41615d = _0x22c15a.slice(0, Math.max(0, 5 - _0x5c0e15.length));
    if (_0x5c0e15.length <= 0 && _0x41615d.length <= 0) {
      throw new Error("APIMart Wan2.7-R2V requires image_with_roles or video_urls input");
    }
    if (_0x5c0e15.length > 0) {
      _0x30fa21.image_with_roles = _0x5c0e15.map((_0x5b82a2, _0x4bcc2a) => ({
        url: _0x5b82a2,
        role: "reference_image",
        ...(_0x4bcc2a === 0 && _0xf62d73 ? {
          reference_voice: _0xf62d73
        } : {})
      }));
    } else {
      delete _0x30fa21.image_with_roles;
    }
    if (_0x41615d.length > 0) {
      _0x30fa21.video_urls = _0x41615d;
    } else {
      delete _0x30fa21.video_urls;
    }
    delete _0x30fa21.image_urls;
    delete _0x30fa21.audio_url;
    return _0x30fa21;
  }
  if (_0x3f23b6 === "edit") {
    _0x30fa21.model = "wan2.7-videoedit";
    if (!_0x22c15a[0]) {
      throw new Error("APIMart Wan2.7-VideoEdit requires video_urls input");
    }
    _0x30fa21.video_urls = _0x22c15a.slice(0, 2);
    if (_0x131cd7.length > 0) {
      _0x30fa21.image_urls = _0x131cd7.slice(0, 4);
    } else {
      delete _0x30fa21.image_urls;
    }
    delete _0x30fa21.audio_url;
    return _0x30fa21;
  }
  _0x30fa21.model = "wan2.7";
  if (_0x131cd7.length > 0 && _0x22c15a.length > 0) {
    throw new Error("APIMart Wan2.7 image_urls cannot be used with video_urls");
  }
  if (_0x22c15a.length > 0 && _0x292daf) {
    throw new Error("APIMart Wan2.7 video_urls cannot be used with audio_url");
  }
  if (_0x131cd7.length > 0 || _0x22c15a.length > 0) {
    delete _0x30fa21.size;
  }
  return _0x30fa21;
}
function normalizeKlingV3OmniMode(_0x71b9b3) {
  const _0x2ed5be = String(_0x71b9b3 || "").trim().toLowerCase();
  if (_0x2ed5be === "reference" || _0x2ed5be === "edit") {
    return _0x2ed5be;
  } else {
    return "image";
  }
}
function buildKlingV3OmniVideoItem(_0x2da560, _0x119117, _0x46dc20 = false) {
  return {
    video_url: _0x2da560,
    refer_type: _0x119117,
    keep_original_sound: normalizeKlingKeepOriginalSound(_0x46dc20) ? "yes" : "no"
  };
}
function normalizeKlingO1VideoRole(_0x557459) {
  const _0x5b45f8 = String(_0x557459 || "").trim().toLowerCase();
  if (_0x5b45f8 === "feature" || _0x5b45f8 === "feature_reference") {
    return "feature";
  }
  if (_0x5b45f8 === "base" || _0x5b45f8 === "edit") {
    return "base";
  } else {
    return "";
  }
}
export function apimartKlingO1Video({
  currentBody: _0x14b398,
  inputImages = [],
  inputVideos = [],
  payload = {}
}) {
  const _0x37ecc7 = {
    ..._0x14b398
  };
  const _0x20b031 = normalizeInputList(inputImages).slice(0, 2);
  const _0x1b4b0d = normalizeInputList(inputVideos).slice(0, 1);
  const _0x5f20f3 = normalizeKlingO1VideoRole(payload?.klingO1VideoRole || payload?.kling_o1_video_role || payload?.generationParams?.kling_o1_video_role);
  const _0x141f6f = normalizeKlingKeepOriginalSound(_0x37ecc7.keep_original_sound ?? payload?.generationParams?.keep_original_sound ?? payload?.keep_original_sound);
  delete _0x37ecc7.kling_o1_video_role;
  delete _0x37ecc7.klingO1VideoRole;
  delete _0x37ecc7.keep_original_sound;
  delete _0x37ecc7.video_list;
  if (_0x1b4b0d.length > 0) {
    const _0x2952a1 = _0x5f20f3 || "base";
    _0x37ecc7.video_list = [buildKlingV3OmniVideoItem(_0x1b4b0d[0], _0x2952a1, _0x141f6f)];
    if (_0x2952a1 === "base") {
      if (_0x20b031.length > 0) {
        throw new Error("APIMart Kling O1 base video cannot be used with image_urls");
      }
      delete _0x37ecc7.image_urls;
      delete _0x37ecc7.duration;
      delete _0x37ecc7.aspect_ratio;
      _0x37ecc7.prompt = replaceKlingO1PromptImageReferences(_0x37ecc7.prompt, 0);
      return _0x37ecc7;
    }
    if (_0x20b031.length > 1) {
      throw new Error("APIMart Kling O1 feature video supports at most one image_url");
    }
    if (_0x20b031.length > 0) {
      _0x37ecc7.image_urls = _0x20b031.slice(0, 1);
    } else {
      delete _0x37ecc7.image_urls;
    }
    _0x37ecc7.prompt = replaceKlingO1PromptImageReferences(_0x37ecc7.prompt, _0x37ecc7.image_urls?.length || 0);
    return _0x37ecc7;
  }
  if (_0x20b031.length > 0) {
    _0x37ecc7.image_urls = _0x20b031;
  } else {
    delete _0x37ecc7.image_urls;
  }
  _0x37ecc7.prompt = replaceKlingO1PromptImageReferences(_0x37ecc7.prompt, _0x37ecc7.image_urls?.length || 0);
  return _0x37ecc7;
}
export function apimartKlingV3OmniVideo({
  currentBody: _0x1a3ae2,
  inputImages = [],
  inputVideos = [],
  payload = {},
  finalUrlsBySlot = {}
}) {
  const _0x4ede0 = {
    ..._0x1a3ae2
  };
  const _0x4389eb = normalizeInputList(inputImages);
  const _0x380a2c = normalizeInputList(inputVideos);
  const _0x4953be = a12_0x111db3(finalUrlsBySlot);
  const _0x336722 = normalizeKlingV3OmniMode(payload?.generationParams?.kling_v3_omni_mode || payload?.kling_v3_omni_mode || "image");
  delete _0x4ede0.kling_v3_omni_mode;
  delete _0x4ede0.image_with_roles;
  delete _0x4ede0.video_list;
  if (_0x336722 === "edit") {
    if (!_0x380a2c[0]) {
      throw new Error("APIMart Kling V3 Omni video edit requires video_list input");
    }
    _0x4ede0.video_list = [buildKlingV3OmniVideoItem(_0x380a2c[0], "base")];
    delete _0x4ede0.image_urls;
    delete _0x4ede0.image_with_roles;
    delete _0x4ede0.audio;
    delete _0x4ede0.duration;
    delete _0x4ede0.aspect_ratio;
    return _0x4ede0;
  }
  if (_0x336722 === "reference") {
    const _0x23d63c = [];
    appendUniqueUrl(_0x23d63c, _0x4953be.referenceImage);
    _0x4389eb.forEach(_0x43ab3b => appendUniqueUrl(_0x23d63c, _0x43ab3b));
    const _0x4c2f34 = _0x23d63c.slice(0, 1);
    const _0x5ceb1b = _0x380a2c[0] || "";
    if (_0x4c2f34.length <= 0 && !_0x5ceb1b) {
      throw new Error("APIMart Kling V3 Omni reference mode requires image or video input");
    }
    if (_0x4c2f34.length > 0) {
      _0x4ede0.image_with_roles = _0x4c2f34.map(_0x199495 => ({
        url: _0x199495,
        role: "reference"
      }));
    } else {
      delete _0x4ede0.image_with_roles;
    }
    if (_0x5ceb1b) {
      _0x4ede0.video_list = [buildKlingV3OmniVideoItem(_0x5ceb1b, "feature")];
      delete _0x4ede0.audio;
    } else {
      delete _0x4ede0.video_list;
    }
    delete _0x4ede0.image_urls;
    return _0x4ede0;
  }
  if (_0x380a2c.length > 0) {
    throw new Error("APIMart Kling V3 Omni image mode does not support video_list input");
  }
  const _0x4aeb13 = Object.prototype.hasOwnProperty.call(_0x4953be, "firstFrame") || Object.prototype.hasOwnProperty.call(_0x4953be, "lastFrame");
  const _0x4254d9 = _0x4aeb13 ? _0x4953be.firstFrame || "" : _0x4389eb[0] || "";
  const _0x46d2d8 = _0x4aeb13 ? _0x4953be.lastFrame || "" : _0x4389eb.find(_0x1f65c2 => _0x1f65c2 && _0x1f65c2 !== _0x4254d9) || "";
  if (!_0x4254d9 && _0x46d2d8) {
    throw new Error("APIMart Kling V3 Omni last_frame requires first_frame input");
  }
  const _0x2cbdd0 = [];
  if (_0x4254d9) {
    _0x2cbdd0.push({
      url: _0x4254d9,
      role: "first_frame"
    });
  }
  if (_0x46d2d8) {
    _0x2cbdd0.push({
      url: _0x46d2d8,
      role: "last_frame"
    });
  }
  if (_0x2cbdd0.length > 0) {
    _0x4ede0.image_with_roles = _0x2cbdd0;
    delete _0x4ede0.image_urls;
  } else {
    delete _0x4ede0.image_urls;
  }
  return _0x4ede0;
}
function normalizeSeedanceVideoSize(_0x494b6b) {
  const _0x58ca05 = String(_0x494b6b || "").trim();
  if (!_0x58ca05) {
    return "16:9";
  }
  if (isSeedanceAdaptiveRatio(_0x58ca05)) {
    return "adaptive";
  }
  return normalizeRatioLabelText(_0x58ca05);
}
function normalizeSeedanceAspectRatio(_0x56d2f6) {
  return normalizeSeedanceVideoSize(_0x56d2f6 || "16:9");
}
function readSeedanceVideoParam(_0x343fd5, ..._0x45e9cb) {
  const _0x3d8a0d = [_0x343fd5, _0x343fd5?.generationParams];
  for (const _0x4f8e83 of _0x3d8a0d) {
    if (!_0x4f8e83 || typeof _0x4f8e83 !== "object" || Array.isArray(_0x4f8e83)) {
      continue;
    }
    for (const _0xb9c540 of _0x45e9cb) {
      if (Object.prototype.hasOwnProperty.call(_0x4f8e83, _0xb9c540)) {
        return _0x4f8e83[_0xb9c540];
      }
    }
  }
  return undefined;
}
function isSeedanceAdaptiveRatio(_0x3a922b) {
  const _0x43d4f0 = String(_0x3a922b ?? "").trim().toLowerCase();
  return ["自适应", "adaptive", "auto", "default"].includes(_0x43d4f0);
}
function normalizeSeedanceBoolean(_0x2394ef, _0x3417e3 = false) {
  if (typeof _0x2394ef === "boolean") {
    return _0x2394ef;
  }
  if (typeof _0x2394ef === "number") {
    return _0x2394ef !== 0;
  }
  const _0x400573 = String(_0x2394ef ?? "").trim().toLowerCase();
  if (["true", "1", "yes", "on"].includes(_0x400573)) {
    return true;
  }
  if (["false", "0", "no", "off"].includes(_0x400573)) {
    return false;
  }
  return _0x3417e3 === true;
}
function normalizeSeedanceVideoDuration(_0x4698f3, _0x1ddbbf = {}) {
  const _0x418971 = Number(_0x1ddbbf.defaultDuration ?? 5);
  const _0x52ce23 = Number.isFinite(_0x418971) ? Math.trunc(_0x418971) : 5;
  const _0x378d3c = Number(_0x4698f3 ?? _0x52ce23);
  if (!Number.isFinite(_0x378d3c)) {
    return _0x52ce23;
  }
  const _0x263386 = Math.trunc(_0x378d3c);
  if (_0x1ddbbf.allowAutoDuration === true && _0x263386 === -1) {
    return -1;
  }
  const _0x11fb49 = Number(_0x1ddbbf.minDuration);
  const _0x47b1c1 = Number(_0x1ddbbf.maxDuration);
  if (Number.isFinite(_0x11fb49) && _0x263386 < _0x11fb49) {
    throw new Error("APIMart Seedance duration must be at least " + _0x11fb49 + " seconds");
  }
  if (Number.isFinite(_0x47b1c1) && _0x263386 > _0x47b1c1) {
    throw new Error("APIMart Seedance duration must be at most " + _0x47b1c1 + " seconds");
  }
  return _0x263386;
}
function normalizeSeedanceVideoResolution(_0x5cf727, _0x545328 = {}) {
  const _0x66a6a6 = String(_0x545328.defaultResolution || "720p").trim().toLowerCase();
  const _0x3b4ec8 = String(_0x5cf727 || _0x66a6a6).trim().toLowerCase();
  const _0x24e43a = Array.isArray(_0x545328.allowedResolutions) ? _0x545328.allowedResolutions.map(_0x24c536 => String(_0x24c536 || "").trim().toLowerCase()).filter(Boolean) : [];
  if (_0x24e43a.length === 0) {
    return _0x3b4ec8 || _0x66a6a6;
  }
  if (_0x24e43a.includes(_0x3b4ec8)) {
    return _0x3b4ec8;
  }
  if (_0x24e43a.includes(_0x66a6a6)) {
    return _0x66a6a6;
  } else {
    return _0x24e43a[0];
  }
}
function getApimartSeedanceVideoPolicy(_0x4cc96b) {
  const _0x91a610 = _0x4cc96b?.extensions?.seedanceVideo;
  if (_0x91a610 && typeof _0x91a610 === "object" && !Array.isArray(_0x91a610)) {
    return _0x91a610;
  } else {
    return {};
  }
}
function collectVideoInputUrls(_0x1c43dd) {
  return Array.from(new Set([String(_0x1c43dd.videoUrl || "").trim(), ...normalizeInputList(_0x1c43dd.videos), ...normalizeInputList(_0x1c43dd.videoUrls)].filter(Boolean)));
}
function collectAudioInputUrls(_0x609b4f) {
  return Array.from(new Set([String(_0x609b4f.audioUrl || "").trim(), ...normalizeInputList(_0x609b4f.audios), ...normalizeInputList(_0x609b4f.audioUrls)].filter(Boolean)));
}
async function resolveInputVideos(_0x564443, _0x28e7ec) {
  if (_0x564443.length === 0) {
    return [];
  }
  const _0x330ae1 = await uploadModelApiMediaInputs("video", _0x564443, _0x28e7ec, {
    fallbackProvider: "runninghub",
    strictUpload: true
  });
  if (!Array.isArray(_0x330ae1) || _0x330ae1.length === 0) {
    throw new Error("APIMART video upload failed");
  }
  return _0x330ae1.map(_0x2d59f4 => String(_0x2d59f4 || "").trim()).filter(Boolean);
}
async function resolveInputAudios(_0x3c179f, _0x57bb89) {
  if (_0x3c179f.length === 0) {
    return [];
  }
  const _0x5e6491 = await uploadModelApiMediaInputs("audio", _0x3c179f, _0x57bb89, {
    fallbackProvider: "runninghub",
    strictUpload: true
  });
  if (!Array.isArray(_0x5e6491) || _0x5e6491.length === 0) {
    throw new Error("APIMART audio upload failed");
  }
  return _0x5e6491.map(_0x554fa6 => String(_0x554fa6 || "").trim()).filter(Boolean);
}
export async function apimartSeedanceVideo({
  payload: _0x103840,
  finalPrompt: _0xc01e4d,
  modelToken: _0x3b440a,
  apiKey: _0x39a025,
  ctx: _0x34055a,
  executionManifest: _0x2507e5
}) {
  const _0x91ea05 = _0x3b440a || stripPrefix(_0x103840.model, "apimart/");
  const _0x5bbc46 = getApimartSeedanceVideoPolicy(_0x2507e5);
  const _0xf2e880 = supportsApimartPrivateAvatarAssets(_0x91ea05, _0x5bbc46);
  const _0x2c6f33 = _0x5bbc46.supportsVideoReferences === true;
  const _0x31b1f3 = _0x5bbc46.supportsAudioReferences === true;
  const _0x59b838 = applyApimartPrivateAvatarAssetsToUrls(collectVideoInputUrls(_0x103840), _0x103840, {
    sourceKind: "video",
    enabled: _0xf2e880
  });
  if (!_0x2c6f33 && _0x59b838.length > 0) {
    throw new Error("APIMart Seedance model does not support video references");
  }
  const _0x4b6f6d = _0x59b838.length > 0 && _0x2c6f33 ? await resolveInputVideos(_0x59b838, _0x34055a) : [];
  const _0x285169 = applyApimartPrivateAvatarAssetsToUrls([String(_0x103840.first || _0x103840.firstFrameUrl || "").trim(), String(_0x103840.last || _0x103840.lastFrameUrl || "").trim()].filter(Boolean), _0x103840, {
    sourceKind: "image",
    enabled: _0xf2e880
  });
  const _0x24a38a = normalizePositiveInteger(_0x5bbc46.maxRoleImageCount, 2);
  if (_0x285169.length > _0x24a38a) {
    throw new Error(_0x5bbc46.roleImageLimitError || "APIMart Seedance model does not support this many role images");
  }
  let _0x5b4018 = [];
  if (_0x285169.length > 0) {
    const _0x5e03fe = await uploadModelApiMediaInputs("image", _0x285169, _0x34055a, {
      apiKey: _0x39a025,
      fallbackProvider: "apimart",
      uploadOptions: {
        applyInputQualityProfile: true
      },
      strictUpload: true
    });
    _0x5b4018 = [_0x5e03fe?.[0] ? {
      url: String(_0x5e03fe[0]).trim(),
      role: "first_frame"
    } : null, _0x5e03fe?.[1] ? {
      url: String(_0x5e03fe[1]).trim(),
      role: "last_frame"
    } : null].filter(Boolean);
  }
  const _0xfe52bd = Array.isArray(_0x103840.images) ? _0x103840.images : Array.isArray(_0x103840.inputUrls) ? _0x103840.inputUrls : [];
  const _0x5d3ed5 = applyApimartPrivateAvatarAssetsToUrls(_0xfe52bd, _0x103840, {
    sourceKind: "image",
    enabled: _0xf2e880
  });
  const _0x15965a = new Set(_0x285169);
  const _0x150795 = _0x5b4018.length > 0 && _0x5bbc46.combineRoleAndReferenceImages === true ? _0x5d3ed5.filter(_0x240213 => !_0x15965a.has(_0x240213)) : _0x5d3ed5;
  const _0x4d3c18 = _0x150795.length > 0 && (_0x5b4018.length <= 0 || _0x5bbc46.combineRoleAndReferenceImages === true) ? await uploadModelApiMediaInputs("image", _0x150795, _0x34055a, {
    apiKey: _0x39a025,
    fallbackProvider: "apimart",
    uploadOptions: {
      applyInputQualityProfile: true
    },
    strictUpload: true
  }) : [];
  const _0x558fda = applyApimartPrivateAvatarAssetsToUrls(collectAudioInputUrls(_0x103840), _0x103840, {
    sourceKind: "audio",
    enabled: _0xf2e880
  });
  if (!_0x31b1f3 && _0x558fda.length > 0) {
    throw new Error("APIMart Seedance model does not support audio references");
  }
  const _0x29be37 = _0x31b1f3 && _0x558fda.length > 0 ? await resolveInputAudios(_0x558fda, _0x34055a) : [];
  const _0x32aa44 = readSeedanceVideoParam(_0x103840, "duration");
  const _0x1f53c1 = readSeedanceVideoParam(_0x103840, "resolution");
  const _0x5cbd46 = readSeedanceVideoParam(_0x103840, "aspectRatio", "size", "aspect_ratio");
  const _0x1595f0 = _0x5bbc46.preserveAdaptiveRatio === true && isSeedanceAdaptiveRatio(_0x5cbd46) ? _0x5cbd46 : _0x103840.resolvedRatioLabel || _0x5cbd46;
  const _0x24f435 = {
    model: _0x91ea05,
    prompt: _0xc01e4d,
    duration: normalizeSeedanceVideoDuration(_0x32aa44, _0x5bbc46),
    resolution: normalizeSeedanceVideoResolution(_0x1f53c1, _0x5bbc46)
  };
  if (_0x5bbc46.ratioField === "size") {
    _0x24f435.size = normalizeSeedanceVideoSize(_0x1595f0 || _0x5bbc46.defaultRatio);
  } else {
    _0x24f435.aspect_ratio = normalizeSeedanceAspectRatio(_0x1595f0 || _0x5bbc46.defaultRatio);
  }
  const _0x4474c7 = readSeedanceVideoParam(_0x103840, "seed");
  if (isPresentValue(_0x4474c7)) {
    _0x24f435.seed = _0x4474c7;
  }
  if (_0x5bbc46.supportsGenerateAudioParam === true) {
    const _0x5b62f2 = readSeedanceVideoParam(_0x103840, "generateAudio", "generate_audio", "audio");
    const _0x78aae0 = normalizeSeedanceBoolean(_0x5b62f2, _0x5bbc46.generateAudioDefault === true);
    if (_0x78aae0 || _0x5bbc46.emitGenerateAudioBoolean === true) {
      const _0x3183e4 = String(_0x5bbc46.generateAudioField || "audio").trim();
      _0x24f435[_0x3183e4 || "audio"] = _0x78aae0;
    }
  }
  if (_0x5bbc46.supportsWatermarkParam === true) {
    _0x24f435.watermark = normalizeSeedanceBoolean(readSeedanceVideoParam(_0x103840, "watermark"), false);
  }
  if (_0x5bbc46.supportsOutputFormatParam === true) {
    const _0x2158cc = String(readSeedanceVideoParam(_0x103840, "outputFormat", "output_format") || "mp4").trim().toLowerCase();
    _0x24f435.output_format = ["mp4", "mov"].includes(_0x2158cc) ? _0x2158cc : "mp4";
  }
  if (_0x5bbc46.supportsWebSearchParam === true && normalizeSeedanceBoolean(readSeedanceVideoParam(_0x103840, "webSearch"), false)) {
    _0x24f435.tools = [{
      type: "web_search"
    }];
  }
  if (_0x5bbc46.supportsCameraFixedParam === true && normalizeSeedanceBoolean(readSeedanceVideoParam(_0x103840, "camerafixed", "cameraFixed"), false)) {
    _0x24f435.camerafixed = true;
  }
  const _0x18ec30 = normalizePositiveInteger(_0x5bbc46.maxImageCount, 1);
  if (_0x5b4018.length > 0) {
    const _0x44f25a = _0x5bbc46.allowRoleImagesWithMedia === true;
    const _0x4e1828 = _0x4b6f6d.length > 0 || _0x29be37.length > 0;
    const _0x1f4181 = _0x44f25a && _0x4e1828 ? _0x5b4018.map(_0x1ffcd6 => ({
      ..._0x1ffcd6,
      role: "reference_image"
    })) : _0x5b4018;
    const _0x1c7b21 = new Set(_0x1f4181.map(_0x599c3f => String(_0x599c3f?.url || "").trim()));
    _0x24f435.image_with_roles = [..._0x1f4181, ...(_0x5bbc46.combineRoleAndReferenceImages === true ? _0x4d3c18.filter(_0x1dd5e3 => !_0x1c7b21.has(String(_0x1dd5e3 || "").trim())).map(_0x1da3da => ({
      url: _0x1da3da,
      role: "reference_image"
    })) : [])].slice(0, _0x18ec30);
    const _0x459d66 = _0x24f435.image_with_roles.some(_0x488856 => _0x488856.role === "first_frame" || _0x488856.role === "last_frame");
    if (_0x459d66 && _0x5bbc46.roleImagesRequireAdaptiveRatio === true) {
      const _0x2aec18 = _0x5bbc46.ratioField === "size" ? "size" : "aspect_ratio";
      _0x24f435[_0x2aec18] = "adaptive";
    }
  } else if (_0x4d3c18.length > 0) {
    _0x24f435.image_urls = _0x4d3c18.slice(0, _0x18ec30);
  }
  const _0x5a3321 = _0x5b4018.length > 0 && _0x5bbc46.allowRoleImagesWithMedia !== true;
  if (_0x2c6f33 && !_0x5a3321 && _0x4b6f6d.length > 0) {
    _0x24f435.video_urls = _0x4b6f6d.slice(0, normalizePositiveInteger(_0x5bbc46.maxVideoReferenceCount, 3));
  }
  if (_0x31b1f3 && !_0x5a3321 && _0x29be37.length > 0) {
    _0x24f435.audio_urls = _0x29be37.slice(0, normalizePositiveInteger(_0x5bbc46.maxAudioReferenceCount, 3));
  }
  return _0x24f435;
}