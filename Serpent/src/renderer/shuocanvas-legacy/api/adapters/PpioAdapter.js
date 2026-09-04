import { pickClosestRatio, resolveProviderRatioPayload } from "../imageRatioPolicy.js";
import { uploadModelApiMediaInputs } from "../mediaInputUploadRouter.js";
const PPIO_MIN_PIXELS = 3686400;
const PPIO_MAX_PIXELS = 10404496;
const PPIO_MIN_RATIO = 1 / 16;
const PPIO_MAX_RATIO = 16;
const PPIO_ALIGN_STEP = 64;
const PPIO_DEFAULT_SIZE = "2048x2048";
const PPIO_DEFAULT_QUALITY = "2K";
const PPIO_DEFAULT_RATIO = "1:1";
const PPIO_QUALITY_PIXEL_MAP = Object.freeze({
  "1K": 1048576,
  "2K": 4194304,
  "3K": 6553600,
  "4K": 8294400
});
const PPIO_RATIO_OPTIONS = Object.freeze([Object.freeze({
  label: "1:1",
  w: 1,
  h: 1
}), Object.freeze({
  label: "9:16",
  w: 9,
  h: 16
}), Object.freeze({
  label: "16:9",
  w: 16,
  h: 9
}), Object.freeze({
  label: "3:4",
  w: 3,
  h: 4
}), Object.freeze({
  label: "4:3",
  w: 4,
  h: 3
}), Object.freeze({
  label: "3:2",
  w: 3,
  h: 2
}), Object.freeze({
  label: "2:3",
  w: 2,
  h: 3
}), Object.freeze({
  label: "5:4",
  w: 5,
  h: 4
}), Object.freeze({
  label: "4:5",
  w: 4,
  h: 5
}), Object.freeze({
  label: "21:9",
  w: 21,
  h: 9
})]);
const PPIO_RATIO_LABEL_SET = new Set(PPIO_RATIO_OPTIONS.map(_0x3f1dc3 => _0x3f1dc3.label));
function normalizePpioQuality(_0x52e1df) {
  const _0x4b8993 = String(_0x52e1df || "").trim().toUpperCase();
  if (PPIO_QUALITY_PIXEL_MAP[_0x4b8993]) {
    return _0x4b8993;
  } else {
    return PPIO_DEFAULT_QUALITY;
  }
}
function normalizePpioAspectRatioLabel(_0x4007af) {
  const _0xe31f1 = String(_0x4007af || "").trim();
  if (!_0xe31f1) {
    return PPIO_DEFAULT_RATIO;
  }
  const _0x44aadd = _0xe31f1.replace(/[：∶]/g, ":").replace(/\s+/g, "");
  const _0xe6b57b = _0x44aadd.toLowerCase();
  if (_0xe6b57b === "auto" || _0xe6b57b === "adaptive" || _0x44aadd === "自适应" || _0x44aadd === "默认") {
    return PPIO_DEFAULT_RATIO;
  }
  if (!_0x44aadd.includes(":")) {
    return PPIO_DEFAULT_RATIO;
  }
  const [_0x5dca57, _0x29b0df] = _0x44aadd.split(":");
  const _0x2f00db = Number.parseFloat(_0x5dca57);
  const _0x29ea1a = Number.parseFloat(_0x29b0df);
  if (!(_0x2f00db > 0) || !(_0x29ea1a > 0)) {
    return PPIO_DEFAULT_RATIO;
  }
  const _0x3ebba6 = pickClosestRatio(_0x2f00db, _0x29ea1a, PPIO_RATIO_OPTIONS);
  if (PPIO_RATIO_LABEL_SET.has(_0x3ebba6)) {
    return _0x3ebba6;
  } else {
    return PPIO_DEFAULT_RATIO;
  }
}
function calculatePpioSizeFromTargetPixels(_0x3d6c21, _0x6b029) {
  const [_0x2495fd, _0x42e290] = String(_0x6b029 || PPIO_DEFAULT_RATIO).split(":");
  const _0x3e5bc1 = Number.parseFloat(_0x2495fd) || 1;
  const _0x2c5bee = Number.parseFloat(_0x42e290) || 1;
  const _0x46dbd1 = Math.max(PPIO_MIN_RATIO, Math.min(PPIO_MAX_RATIO, _0x3e5bc1 / _0x2c5bee));
  const _0x3d405b = Math.max(PPIO_MIN_PIXELS, Math.min(PPIO_MAX_PIXELS, Number(_0x3d6c21) || PPIO_QUALITY_PIXEL_MAP["2K"]));
  let _0x34ce68 = Math.round(Math.sqrt(_0x3d405b / _0x46dbd1));
  let _0x229cd6 = Math.round(_0x34ce68 * _0x46dbd1);
  _0x229cd6 = Math.max(PPIO_ALIGN_STEP, Math.round(_0x229cd6 / PPIO_ALIGN_STEP) * PPIO_ALIGN_STEP);
  _0x34ce68 = Math.max(PPIO_ALIGN_STEP, Math.round(_0x34ce68 / PPIO_ALIGN_STEP) * PPIO_ALIGN_STEP);
  return _0x229cd6 + "x" + _0x34ce68;
}
function buildPpioSizeTable() {
  const _0x3842cf = Object.entries(PPIO_QUALITY_PIXEL_MAP).map(([_0x118c16, _0x34c511]) => {
    const _0x4d66c4 = PPIO_RATIO_OPTIONS.map(_0x509d17 => [_0x509d17.label, calculatePpioSizeFromTargetPixels(_0x34c511, _0x509d17.label)]);
    return [_0x118c16, Object.freeze(Object.fromEntries(_0x4d66c4))];
  });
  return Object.freeze(Object.fromEntries(_0x3842cf));
}
const PPIO_SIZE_TABLE = buildPpioSizeTable();
function resolvePpioSize(_0x68ab0f, _0x22dc22) {
  const _0x8c13f3 = normalizePpioQuality(_0x68ab0f);
  const _0x5bc9c4 = normalizePpioAspectRatioLabel(_0x22dc22);
  return PPIO_SIZE_TABLE?.[_0x8c13f3]?.[_0x5bc9c4] || PPIO_SIZE_TABLE?.[PPIO_DEFAULT_QUALITY]?.[PPIO_DEFAULT_RATIO] || PPIO_DEFAULT_SIZE;
}
async function buildPpioSeedreamRequest(_0x2ae35c, _0x9db5c0, _0x26f966, _0x67cc92, _0x41b8f9 = {}) {
  const {
    imageField = "image",
    supportBatch = false
  } = _0x41b8f9;
  const _0x5ebf39 = _0x67cc92.getProviderConfig("ppio");
  const _0x1aedc8 = _0x5ebf39.apiUrl.replace(/\/+$/, "");
  const _0x59ff38 = _0x5ebf39.apiKey || _0x9db5c0.apiKey;
  if (!_0x59ff38) {
    throw new Error("PPIO API Key 未配置，无法发起图像生成请求");
  }
  const _0x24890c = await uploadModelApiMediaInputs("image", _0x9db5c0.inputUrls, _0x67cc92, {
    strictUpload: true,
    uploadOptions: {
      applyInputQualityProfile: true
    }
  });
  if (_0x9db5c0.inputUrls?.length > 0 && _0x24890c.length === 0) {
    throw new Error("参考素材上传云端失败，无法继续生成");
  }
  const _0x221724 = resolveProviderRatioPayload({
    provider: "ppio",
    model: _0x9db5c0.model,
    ratioLabel: _0x9db5c0.resolvedRatioLabel || _0x9db5c0.aspectRatio,
    imageSize: _0x9db5c0.imageSize,
    suppressAspectRatio: _0x9db5c0.suppressAspectRatio
  });
  const _0x58c53b = {
    prompt: _0x26f966,
    watermark: false,
    ...(!_0x9db5c0.suppressImageSize && {
      size: resolvePpioSize(_0x9db5c0.imageSize, _0x221724?.resolvedRatioLabel || _0x9db5c0.aspectRatio)
    })
  };
  if (_0x2ae35c !== "4.0") {
    _0x58c53b.optimize_prompt_options = {
      mode: "standard"
    };
  }
  if (supportBatch && _0x9db5c0.batchSize && _0x9db5c0.batchSize > 1) {
    _0x58c53b.max_images = _0x9db5c0.batchSize;
  }
  if (_0x24890c.length > 0) {
    _0x58c53b[imageField] = _0x24890c;
  }
  return {
    url: "/api/v2/proxy/image",
    headers: {
      "Content-Type": "application/json"
    },
    body: {
      apiUrl: _0x1aedc8 + "/v3/seedream-" + _0x2ae35c,
      apiKey: _0x59ff38,
      ..._0x58c53b
    }
  };
}
export async function buildImageRequest(_0x24c197, _0x434849, _0x294de0) {
  if (_0x24c197.model === "ppio/seedream-5.0-lite") {
    return buildPpioSeedreamRequest("5.0-lite", _0x24c197, _0x434849, _0x294de0, {
      imageField: "image"
    });
  }
  if (_0x24c197.model === "ppio/seedream-4.5") {
    return buildPpioSeedreamRequest("4.5", _0x24c197, _0x434849, _0x294de0, {
      imageField: "image"
    });
  }
  if (_0x24c197.model === "ppio/seedream-4.0") {
    return buildPpioSeedreamRequest("4.0", _0x24c197, _0x434849, _0x294de0, {
      imageField: "images",
      supportBatch: true
    });
  }
  throw new Error("PPIO 暂不支持模型 " + (_0x24c197.model || "(未指定)"));
}
export function getTextProxyApiUrl(_0x290d24) {
  return _0x290d24 + "/openai/v1";
}