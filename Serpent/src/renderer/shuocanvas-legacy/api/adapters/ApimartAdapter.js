import { resolveProviderRatioPayload } from "../imageRatioPolicy.js";
import { applyApimartPrivateAvatarAssetsToUrls, isApimartSeedance2PrivateAvatarModel } from "./apimartPrivateAvatarAssetResolver.js";
import { normalizeApimartBaseUrl } from "../apimartUploadApi.js";
import { uploadModelApiMediaInputs } from "../mediaInputUploadRouter.js";
const APIMART_DIMENSION_TARGET_PIXELS = Object.freeze({
  "1K": 1048576,
  "2K": 4194304,
  "3K": 6553600,
  "4K": 8294400
});
const APIMART_DIMENSION_DEFAULT_RESOLUTION = "2K";
const APIMART_DIMENSION_ALIGN = 8;
const APIMART_DIMENSION_MIN = 512;
const APIMART_DIMENSION_MAX = 8192;
function parseRatioLabel(_0x4298a9) {
  const [_0x7b6110, _0x128ba6] = String(_0x4298a9 || "1:1").split(":");
  const _0x50eed1 = Number.parseFloat(_0x7b6110);
  const _0x3e2168 = Number.parseFloat(_0x128ba6);
  if (!(_0x50eed1 > 0) || !(_0x3e2168 > 0)) {
    return {
      w: 1,
      h: 1
    };
  }
  return {
    w: _0x50eed1,
    h: _0x3e2168
  };
}
function alignDimension(_0x368f20) {
  const _0x3358ff = Math.round(Number(_0x368f20 || 0) / APIMART_DIMENSION_ALIGN) * APIMART_DIMENSION_ALIGN;
  return Math.max(APIMART_DIMENSION_MIN, Math.min(APIMART_DIMENSION_MAX, _0x3358ff));
}
function resolveDimensionsByResolutionAndRatio(_0x438ce8, _0xef9db7) {
  const _0x4426eb = String(_0x438ce8 || "").trim().toUpperCase();
  const _0x38e4be = APIMART_DIMENSION_TARGET_PIXELS[_0x4426eb] || APIMART_DIMENSION_TARGET_PIXELS[APIMART_DIMENSION_DEFAULT_RESOLUTION];
  const {
    w: _0x455fa4,
    h: _0x7ec724
  } = parseRatioLabel(_0xef9db7);
  const _0x286ef8 = _0x455fa4 / _0x7ec724;
  const _0x11b9f8 = Math.sqrt(_0x38e4be / _0x286ef8);
  const _0x433d1e = _0x11b9f8 * _0x286ef8;
  return {
    width: alignDimension(_0x433d1e),
    height: alignDimension(_0x11b9f8)
  };
}
function isApimartGptImage2Model(_0x1274a0) {
  const _0x327c0c = String(_0x1274a0 || "").trim().toLowerCase();
  return _0x327c0c === "apimart/gpt-image-2" || _0x327c0c === "gpt-image-2";
}
function isApimartSeedanceVideoModel(_0x15a40d) {
  return String(_0x15a40d || "").trim().replace(/^apimart\//, "").startsWith("doubao-seedance-");
}
function normalizeSeedanceVideoSize(_0x18645f) {
  const _0x1e51f0 = String(_0x18645f || "").trim();
  if (!_0x1e51f0) {
    return "16:9";
  }
  if (_0x1e51f0 === "自适应" || _0x1e51f0.toLowerCase() === "auto") {
    return "adaptive";
  }
  if (_0x1e51f0 === "1:1" || _0x1e51f0 === "3:4" || _0x1e51f0 === "16:9" || _0x1e51f0 === "4:3" || _0x1e51f0 === "9:16" || _0x1e51f0 === "21:9" || _0x1e51f0 === "adaptive") {
    return _0x1e51f0;
  }
  return "16:9";
}
function normalizeSeedanceAspectRatio(_0x53a51e) {
  const _0x357187 = String(_0x53a51e || "").trim();
  if (_0x357187 === "1:1" || _0x357187 === "3:4" || _0x357187 === "16:9" || _0x357187 === "4:3" || _0x357187 === "9:16" || _0x357187 === "21:9") {
    return _0x357187;
  }
  return "16:9";
}
function isPresentValue(_0x569842) {
  return _0x569842 !== undefined && _0x569842 !== null && String(_0x569842).trim() !== "";
}
function normalizeGptImage2Resolution(_0x31a74b) {
  const _0x183cf7 = String(_0x31a74b || "").trim().toUpperCase();
  if (_0x183cf7 === "1K" || _0x183cf7 === "2K" || _0x183cf7 === "4K") {
    return _0x183cf7.toLowerCase();
  }
  return "2k";
}
export function normalizeTextModel(_0x3a11dc) {
  if (_0x3a11dc === "apimart/gpt-5.4") {
    return "gpt-5.4-apimart";
  }
  if (String(_0x3a11dc || "").startsWith("apimart/")) {
    return String(_0x3a11dc).replace(/^apimart\//, "");
  }
  return _0x3a11dc;
}
export function getTextProxyApiUrl(_0x1ce6b8) {
  return _0x1ce6b8 + "/v1/chat/completions";
}
export async function buildImageRequest(_0x5f2f5c, _0x12218c, _0x14c288) {
  if (!_0x5f2f5c.model) {
    throw new Error("未指定模型，无法发起图像生成请求");
  }
  const _0x851d07 = _0x14c288.getProviderConfig("apimart");
  const _0xc5c84d = normalizeApimartBaseUrl(_0x851d07.apiUrl);
  const _0x239aca = _0x851d07.apiKey || _0x5f2f5c.apiKey;
  if (!_0x239aca) {
    throw new Error("API Key 未配置，无法发起图像生成请求");
  }
  const _0x1e458b = await uploadModelApiMediaInputs("image", _0x5f2f5c.inputUrls, _0x14c288, {
    apiKey: _0x239aca,
    apiUrl: _0xc5c84d,
    fallbackProvider: "apimart",
    uploadOptions: {
      applyInputQualityProfile: true
    },
    strictUpload: true
  });
  const _0xfe5a65 = {
    "apimart/nano-banana-2": "gemini-3.1-flash-image-preview",
    "apimart/nano-banana-pro": "gemini-3-pro-image-preview",
    "apimart/nano-banana-dot": "gemini-2.5-flash-image-preview",
    "apimart/gpt-image-2": "gpt-image-2",
    "apimart/seedream-5.0-lite": "doubao-seedream-5-0-lite",
    "apimart/seedream-4.5": "doubao-seedance-4-5",
    "apimart/seedream-4.0": "doubao-seedance-4-0"
  };
  const _0x1db5c0 = _0xfe5a65[_0x5f2f5c.model] || _0x5f2f5c.model.replace("apimart/", "");
  const _0x3106e0 = _0x5f2f5c.model === "apimart/seedream-4.0" || _0x5f2f5c.model === "apimart/seedream-4.5" || _0x5f2f5c.model === "apimart/seedream-5.0-lite";
  let _0x22ee31 = _0x5f2f5c.imageSize || "2K";
  if ((_0x5f2f5c.model === "apimart/seedream-4.5" || _0x5f2f5c.model === "apimart/seedream-5.0-lite") && _0x22ee31 === "1K") {
    _0x22ee31 = "2K";
  }
  if (_0x5f2f5c.model === "apimart/seedream-5.0-lite" && _0x22ee31 === "4K") {
    _0x22ee31 = "3K";
  }
  if (isApimartGptImage2Model(_0x5f2f5c.model)) {
    _0x22ee31 = normalizeGptImage2Resolution(_0x22ee31);
  }
  const _0x216ac7 = resolveProviderRatioPayload({
    provider: "apimart",
    model: _0x5f2f5c.model,
    ratioLabel: _0x5f2f5c.resolvedRatioLabel || _0x5f2f5c.aspectRatio,
    imageSize: _0x22ee31,
    suppressAspectRatio: _0x5f2f5c.suppressAspectRatio
  });
  const _0x45d40e = {
    model: _0x1db5c0,
    prompt: _0x12218c,
    n: 1,
    ...(!_0x3106e0 && {
      resolution: _0x22ee31
    })
  };
  if (!_0x5f2f5c.suppressAspectRatio && _0x216ac7?.params?.size) {
    if (_0x3106e0) {
      const _0x2e8f8c = resolveDimensionsByResolutionAndRatio(_0x22ee31, _0x216ac7.params.size);
      _0x45d40e.width = _0x2e8f8c.width;
      _0x45d40e.height = _0x2e8f8c.height;
    } else {
      _0x45d40e.size = _0x216ac7.params.size;
    }
  }
  if (_0x1e458b.length > 0) {
    _0x45d40e.image_urls = _0x1e458b;
  }
  return {
    url: "/api/v2/proxy/image",
    headers: {
      "Content-Type": "application/json"
    },
    body: {
      apiUrl: _0xc5c84d + "/v1/images/generations",
      apiKey: _0x239aca,
      ..._0x45d40e
    }
  };
}
export async function buildVideoRequest(_0x2b7e67, _0x3df74, _0x29b0c7) {
  if (!_0x2b7e67.model) {
    throw new Error("未指定视频模型，无法发起视频生成请求");
  }
  const _0x3b3cb1 = _0x29b0c7.getProviderConfig("apimart");
  const _0x5152e5 = normalizeApimartBaseUrl(_0x3b3cb1.apiUrl);
  const _0x30bf81 = _0x3b3cb1.apiKey || _0x2b7e67.apiKey;
  if (!_0x30bf81) {
    throw new Error("API Key 未配置（厂商：Apimart），无法发起视频生成请求");
  }
  const _0x123969 = {
    "apimart/luma-ray-v2": "luma-ray-v2",
    "apimart/kling-v1-5": "kling-v1-5-gen-video",
    "apimart/happyhorse-1.0": "happyhorse-1.0",
    "apimart/doubao-seedance-2.0-fast": "doubao-seedance-2.0-fast",
    "apimart/doubao-seedance-2.0": "doubao-seedance-2.0",
    "apimart/doubao-seedance-2.0-fast-face": "doubao-seedance-2.0-fast-face",
    "apimart/doubao-seedance-2.0-face": "doubao-seedance-2.0-face",
    "apimart/doubao-seedance-1-5-pro": "doubao-seedance-1-5-pro",
    "apimart/doubao-seedance-1-0-pro-fast": "doubao-seedance-1-0-pro-fast",
    "apimart/doubao-seedance-1-0-pro-quality": "doubao-seedance-1-0-pro-quality"
  };
  const _0x56bd10 = _0x123969[_0x2b7e67.model] || _0x2b7e67.model.replace("apimart/", "");
  const _0x149a8e = isApimartSeedanceVideoModel(_0x56bd10);
  const _0x53544e = _0x56bd10.startsWith("doubao-seedance-2.0");
  const _0x971ac = isApimartSeedance2PrivateAvatarModel(_0x56bd10);
  const _0x1cac17 = _0x56bd10 === "doubao-seedance-1-5-pro";
  const _0x53e3c4 = _0x56bd10.startsWith("doubao-seedance-1-0-pro-");
  const _0x4e99e2 = _0x56bd10 === "doubao-seedance-1-0-pro-fast";
  const _0x6983aa = [];
  if (Array.isArray(_0x2b7e67.videos)) {
    _0x6983aa.push(..._0x2b7e67.videos);
  }
  if (Array.isArray(_0x2b7e67.videoUrls)) {
    _0x6983aa.push(..._0x2b7e67.videoUrls);
  }
  const _0x5c808e = String(_0x2b7e67.videoUrl || "").trim();
  if (_0x5c808e) {
    _0x6983aa.unshift(_0x5c808e);
  }
  const _0x34a4b8 = applyApimartPrivateAvatarAssetsToUrls(Array.from(new Set(_0x6983aa.map(_0x1a31e0 => String(_0x1a31e0 || "").trim()).filter(Boolean))), _0x2b7e67, {
    sourceKind: "video",
    enabled: _0x971ac
  });
  if (_0x149a8e && !_0x53544e && _0x34a4b8.length > 0) {
    throw new Error("该 APIMart Seedance 模型暂不支持视频参考");
  }
  const _0x36bbc0 = _0x34a4b8.length > 0 && (!_0x149a8e || _0x53544e) && _0x29b0c7.processInputVideos ? await uploadModelApiMediaInputs("video", _0x34a4b8, _0x29b0c7, {
    fallbackProvider: "runninghub",
    strictUpload: true
  }) : [];
  if (_0x34a4b8.length > 0 && _0x36bbc0.length <= 0) {
    throw new Error("APIMART 源视频上传失败");
  }
  const _0x52c3d9 = applyApimartPrivateAvatarAssetsToUrls([String(_0x2b7e67.first || _0x2b7e67.firstFrameUrl || "").trim(), String(_0x2b7e67.last || _0x2b7e67.lastFrameUrl || "").trim()].filter(Boolean), _0x2b7e67, {
    sourceKind: "image",
    enabled: _0x971ac
  });
  let _0x29281c = [];
  if (_0x4e99e2 && _0x52c3d9.length > 1) {
    throw new Error("Seedance 1.0 Pro Fast 不支持尾帧图，请切换 Quality 模型");
  }
  if (_0x149a8e && _0x52c3d9.length > 0 && _0x29b0c7.processInputImages) {
    const _0x59de78 = await uploadModelApiMediaInputs("image", _0x52c3d9, _0x29b0c7, {
      apiKey: _0x30bf81,
      apiUrl: _0x5152e5,
      fallbackProvider: "apimart",
      uploadOptions: {
        applyInputQualityProfile: true
      },
      strictUpload: true
    });
    const _0x78735b = String(_0x59de78?.[0] || "").trim();
    const _0x59e094 = String(_0x59de78?.[1] || "").trim();
    _0x29281c = [_0x78735b ? {
      url: _0x78735b,
      role: "first_frame"
    } : null, _0x59e094 ? {
      url: _0x59e094,
      role: "last_frame"
    } : null].filter(Boolean);
  }
  const _0x564143 = Array.isArray(_0x2b7e67.images) ? _0x2b7e67.images : Array.isArray(_0x2b7e67.inputUrls) ? _0x2b7e67.inputUrls : [];
  const _0x2e5674 = applyApimartPrivateAvatarAssetsToUrls(_0x564143, _0x2b7e67, {
    sourceKind: "image",
    enabled: _0x971ac
  });
  const _0x4cb1ac = _0x149a8e && _0x29281c.length <= 0;
  const _0x51a732 = _0x4cb1ac && _0x2e5674.length > 0 && _0x29b0c7.processInputImages ? await uploadModelApiMediaInputs("image", _0x2e5674, _0x29b0c7, {
    apiKey: _0x30bf81,
    apiUrl: _0x5152e5,
    fallbackProvider: "apimart",
    uploadOptions: {
      applyInputQualityProfile: true
    },
    strictUpload: true
  }) : [];
  const _0x38e3ec = [];
  if (Array.isArray(_0x2b7e67.audios)) {
    _0x38e3ec.push(..._0x2b7e67.audios);
  }
  if (Array.isArray(_0x2b7e67.audioUrls)) {
    _0x38e3ec.push(..._0x2b7e67.audioUrls);
  }
  const _0x4edff7 = String(_0x2b7e67.audioUrl || "").trim();
  if (_0x4edff7) {
    _0x38e3ec.unshift(_0x4edff7);
  }
  const _0x37e545 = applyApimartPrivateAvatarAssetsToUrls(Array.from(new Set(_0x38e3ec.map(_0xd43dcc => String(_0xd43dcc || "").trim()).filter(Boolean))), _0x2b7e67, {
    sourceKind: "audio",
    enabled: _0x971ac
  });
  if (_0x149a8e && !_0x53544e && _0x37e545.length > 0) {
    throw new Error("该 APIMart Seedance 模型暂不支持音频参考");
  }
  const _0x5dad3f = _0x53544e && _0x37e545.length > 0 && _0x29b0c7.processInputAudios ? await uploadModelApiMediaInputs("audio", _0x37e545, _0x29b0c7, {
    fallbackProvider: "runninghub",
    strictUpload: true
  }) : [];
  if (_0x149a8e && _0x37e545.length > 0 && _0x5dad3f.length <= 0) {
    throw new Error("APIMART 源音频上传失败");
  }
  if (_0x149a8e) {
    const _0xe2288f = {
      model: _0x56bd10,
      prompt: _0x3df74,
      duration: _0x2b7e67.duration || 5,
      resolution: _0x2b7e67.resolution || (_0x53e3c4 ? "1080p" : "720p")
    };
    if (_0x53544e) {
      _0xe2288f.size = normalizeSeedanceVideoSize(_0x2b7e67.aspectRatio || _0x2b7e67.size);
    } else {
      _0xe2288f.aspect_ratio = normalizeSeedanceAspectRatio(_0x2b7e67.aspectRatio || _0x2b7e67.aspect_ratio);
    }
    if (isPresentValue(_0x2b7e67.seed)) {
      _0xe2288f.seed = _0x2b7e67.seed;
    }
    if (_0x1cac17 && (_0x2b7e67.audio === true || _0x2b7e67.generateAudio === true)) {
      _0xe2288f.audio = true;
    }
    if (_0x1cac17 && _0x2b7e67.camerafixed === true) {
      _0xe2288f.camerafixed = true;
    }
    if (_0x29281c.length > 0) {
      _0xe2288f.image_with_roles = _0x29281c;
    } else if (_0x51a732.length > 0) {
      const _0x8c9d78 = _0x53544e ? 9 : _0x1cac17 ? 2 : 1;
      _0xe2288f.image_urls = _0x51a732.slice(0, _0x8c9d78);
    }
    if (_0x53544e && _0x29281c.length <= 0 && _0x36bbc0.length > 0) {
      _0xe2288f.video_urls = _0x36bbc0.slice(0, 3);
    }
    if (_0x53544e && _0x29281c.length <= 0 && _0x5dad3f.length > 0) {
      _0xe2288f.audio_urls = _0x5dad3f.slice(0, 3);
    }
    return {
      url: "/api/v2/proxy/image",
      headers: {
        "Content-Type": "application/json"
      },
      body: {
        apiUrl: _0x5152e5 + "/v1/videos/generations",
        apiKey: _0x30bf81,
        ..._0xe2288f
      }
    };
  }
  let _0x54bf7e = "";
  if (_0x36bbc0.length > 0) {
    _0x54bf7e = String(_0x36bbc0[0] || "").trim();
  } else if (_0x5c808e && _0x29b0c7.processInputVideos) {
    const _0x2950c8 = await uploadModelApiMediaInputs("video", [_0x5c808e], _0x29b0c7, {
      fallbackProvider: "runninghub",
      strictUpload: true
    });
    _0x54bf7e = String(_0x2950c8?.[0] || "").trim();
    if (!_0x54bf7e) {
      throw new Error("APIMART 源视频上传失败");
    }
  }
  const _0x56a1da = _0x2b7e67.inputUrls && _0x2b7e67.inputUrls.length > 0 && _0x29b0c7.processInputImages ? await uploadModelApiMediaInputs("image", _0x2b7e67.inputUrls, _0x29b0c7, {
    apiKey: _0x30bf81,
    apiUrl: _0x5152e5,
    fallbackProvider: "apimart",
    uploadOptions: {
      applyInputQualityProfile: true
    },
    strictUpload: true
  }) : [];
  const _0x4c96ea = {
    model: _0x56bd10,
    prompt: _0x3df74,
    size: _0x2b7e67.aspectRatio || "16:9",
    quality: _0x2b7e67.videoSize || "standard"
  };
  if (_0x2b7e67.duration) {
    _0x4c96ea.duration = _0x2b7e67.duration;
  }
  if (_0x2b7e67.resolution) {
    _0x4c96ea.resolution = _0x2b7e67.resolution;
  }
  if (_0x54bf7e) {
    _0x4c96ea.video_url = _0x54bf7e;
  }
  if (_0x56a1da.length > 0) {
    _0x4c96ea.image_urls = _0x56a1da;
  }
  return {
    url: "/api/v2/proxy/image",
    headers: {
      "Content-Type": "application/json"
    },
    body: {
      apiUrl: _0x5152e5 + "/v1/videos/generations",
      apiKey: _0x30bf81,
      ..._0x4c96ea
    }
  };
}