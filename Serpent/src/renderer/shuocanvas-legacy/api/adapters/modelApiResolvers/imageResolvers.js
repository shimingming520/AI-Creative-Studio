import { normalizeRatioLabelText, parseRatioLabel, resolveProviderRatioPayload } from "../../imageRatioPolicy.js";
import { isRunningHubModelWithoutImageSizeParam, normalizeImageSizeForProviderModel, shouldOmitImageSizeParam } from "../../../src/modules/imageModelCapabilities.js";
import { NANO_BANANA_FAMILIES, getNanoBananaAllowedRatioLabels, normalizeNanoBananaRatioForFamily, resolveNanoBananaSelectionFromModel } from "../../../src/modules/nanoBananaModeRules.js";
import { resolveModelExecution } from "../../../src/manifests/index.js";
import { normalizeInputUrlsBySlot, normalizeInputUrlsBySlot as a14_0x2a2f60, stripPrefix } from "./sharedResolverUtils.js";
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
const PPIO_RATIO_LABEL_SET = new Set(PPIO_RATIO_OPTIONS.map(_0x1f0280 => _0x1f0280.label));
const RUNNINGHUB_MODEL_DIMENSION_MIN = 512;
const RUNNINGHUB_MODEL_DIMENSION_MAX = 8192;
const RUNNINGHUB_MODEL_DIMENSION_ALIGN = 8;
const RUNNINGHUB_MODEL_DEFAULT_QUALITY = "2K";
const RUNNINGHUB_MODEL_DEFAULT_RATIO = "1:1";
const RUNNINGHUB_MODEL_QUALITY_PIXEL_MAP = Object.freeze({
  "1K": 1048576,
  "2K": 4194304,
  "3K": 6553600,
  "4K": 8294400
});
const RUNNINGHUB_MODEL_RATIO_LIST = Object.freeze(["1:1", "9:16", "16:9", "3:4", "4:3", "3:2", "2:3", "5:4", "4:5", "21:9"]);
const RUNNINGHUB_MODEL_RATIO_SET = new Set(RUNNINGHUB_MODEL_RATIO_LIST);
export function normalizeApimartGptImage2Resolution(_0x5dce5f) {
  const _0x43cf5b = String(_0x5dce5f || "").trim().toUpperCase();
  if (_0x43cf5b === "1K" || _0x43cf5b === "2K" || _0x43cf5b === "4K") {
    return _0x43cf5b.toLowerCase();
  }
  return "2k";
}
export function normalizeApimartNanoBanana2Resolution(_0x617078) {
  const _0x28e936 = String(_0x617078 || "").trim().toUpperCase();
  if (_0x28e936 === "1K" || _0x28e936 === "2K" || _0x28e936 === "4K") {
    return _0x28e936;
  }
  return "2K";
}
export function apimartGptImage2Image({
  currentBody: _0x2ea5a6,
  payload: _0x3f8a53
}) {
  return {
    ..._0x2ea5a6,
    resolution: normalizeApimartGptImage2Resolution(_0x2ea5a6.resolution || _0x3f8a53.imageSize)
  };
}
function hasApimartGrokImagineImageInput(_0x3a75d2 = []) {
  return Array.isArray(_0x3a75d2) && _0x3a75d2.some(_0x1a4c89 => String(_0x1a4c89 || "").trim());
}
export function apimartGrokImagineImage({
  currentBody = {},
  finalUrls = []
}) {
  const _0x4b1e6b = Array.isArray(finalUrls) ? String(finalUrls[0] || "").trim() : "";
  const _0x50db7f = {
    ...currentBody,
    model: _0x4b1e6b ? "grok-imagine-1.5-edit-apimart" : "grok-imagine-1.5-apimart"
  };
  delete _0x50db7f.image_urls;
  if (_0x4b1e6b) {
    _0x50db7f.image_url = _0x4b1e6b;
  } else {
    delete _0x50db7f.image_url;
  }
  return _0x50db7f;
}
export function apimartGrokImagineImageEndpoint({
  cfg: _0x5c4e75,
  executionManifest: _0x396548,
  finalUrls = []
}) {
  const _0x23f811 = String(_0x5c4e75?.apiUrl || "").replace(/\/+$/, "");
  const _0x5b3c2e = hasApimartGrokImagineImageInput(finalUrls) ? "/v1/images/edits" : String(_0x396548?.endpoint || "/v1/images/generations").trim();
  return "" + _0x23f811 + (_0x5b3c2e || "/v1/images/generations");
}
function inferGeminiImageMimeType(_0x26d3fe) {
  let _0x48bfe4 = "";
  try {
    const _0x505a3d = new URL(String(_0x26d3fe || ""));
    if (_0x505a3d.protocol !== "https:" && _0x505a3d.protocol !== "http:") {
      throw new Error("unsupported protocol");
    }
    _0x48bfe4 = _0x505a3d.pathname.toLowerCase();
  } catch {
    throw new Error("Gemini image input upload did not return a public URL");
  }
  if (/\.jpe?g$/.test(_0x48bfe4)) {
    return "image/jpeg";
  }
  if (/\.webp$/.test(_0x48bfe4)) {
    return "image/webp";
  }
  if (/\.gif$/.test(_0x48bfe4)) {
    return "image/gif";
  }
  if (/\.avif$/.test(_0x48bfe4)) {
    return "image/avif";
  }
  return "image/png";
}
export async function customProviderGeminiImage({
  currentBody = {},
  finalPrompt = "",
  finalUrls = []
}) {
  const _0x857227 = String(currentBody.prompt || finalPrompt || "").trim();
  const _0x1ad1bf = currentBody.generationConfig && typeof currentBody.generationConfig === "object" && !Array.isArray(currentBody.generationConfig) ? currentBody.generationConfig : {};
  const _0x337827 = {
    ...currentBody
  };
  delete _0x337827.model;
  delete _0x337827.prompt;
  const _0x37fd62 = [{
    text: _0x857227
  }];
  const _0x81b9c2 = Array.isArray(finalUrls) ? finalUrls.map(_0x4ea510 => String(_0x4ea510 || "").trim()).filter(Boolean) : [];
  for (const _0x4d3447 of _0x81b9c2) {
    _0x37fd62.push({
      file_data: {
        mime_type: inferGeminiImageMimeType(_0x4d3447),
        file_uri: _0x4d3447
      }
    });
  }
  _0x337827.contents = [{
    role: "user",
    parts: _0x37fd62
  }];
  _0x337827.generationConfig = {
    ..._0x1ad1bf,
    responseModalities: ["IMAGE"]
  };
  return _0x337827;
}
export function customProviderGeminiImageEndpoint({
  cfg: _0x45f994,
  executionManifest: _0x122105,
  modelToken: _0x21c8ad
}) {
  const _0x4fde33 = String(_0x122105?.endpoint || "").trim();
  if (!/^\/v1(?:alpha|beta)?\/models\/\{model\}:generateContent$/.test(_0x4fde33)) {
    throw new Error("Invalid custom provider Gemini image endpoint template");
  }
  const _0x2d218c = String(_0x21c8ad || "").trim();
  if (!_0x2d218c) {
    throw new Error("Missing custom provider Gemini image model");
  }
  let _0xdee51f;
  try {
    _0xdee51f = new URL(String(_0x45f994?.apiUrl || ""));
  } catch {
    throw new Error("Invalid custom provider Gemini image base URL");
  }
  if (_0xdee51f.protocol !== "https:" && _0xdee51f.protocol !== "http:") {
    throw new Error("Invalid custom provider Gemini image base URL protocol");
  }
  const _0x2790aa = _0x4fde33.replace("{model}", encodeURIComponent(_0x2d218c));
  return new URL(_0x2790aa, _0xdee51f.origin).toString();
}
const APIMART_MIDJOURNEY_MODEL_OPTIONS = Object.freeze({
  "v8.2": Object.freeze({
    version: "8.2",
    niji: false
  }),
  "8.2": Object.freeze({
    version: "8.2",
    niji: false
  }),
  "v8.1": Object.freeze({
    version: "8.1",
    niji: false
  }),
  "8.1": Object.freeze({
    version: "8.1",
    niji: false
  }),
  v7: Object.freeze({
    version: "7",
    niji: false
  }),
  "7": Object.freeze({
    version: "7",
    niji: false
  }),
  "v6.1": Object.freeze({
    version: "6.1",
    niji: false
  }),
  "6.1": Object.freeze({
    version: "6.1",
    niji: false
  }),
  "v5.2": Object.freeze({
    version: "5.2",
    niji: false
  }),
  "5.2": Object.freeze({
    version: "5.2",
    niji: false
  }),
  "v5.1": Object.freeze({
    version: "5.1",
    niji: false
  }),
  "5.1": Object.freeze({
    version: "5.1",
    niji: false
  }),
  niji7: Object.freeze({
    version: "7",
    niji: true
  }),
  "niji-7": Object.freeze({
    version: "7",
    niji: true
  }),
  "niji 7": Object.freeze({
    version: "7",
    niji: true
  }),
  niji6: Object.freeze({
    version: "6",
    niji: true
  }),
  "niji-6": Object.freeze({
    version: "6",
    niji: true
  }),
  "niji 6": Object.freeze({
    version: "6",
    niji: true
  })
});
function resolveApimartMidjourneyModel(_0x581517 = {}) {
  const _0x47e83e = _0x581517.mjModel || _0x581517.midjourneyModel || _0x581517.version || _0x581517.generationParams?.mjModel || "v8.2";
  const _0x2d0b88 = String(_0x47e83e || "").trim().toLowerCase();
  return APIMART_MIDJOURNEY_MODEL_OPTIONS[_0x2d0b88] || APIMART_MIDJOURNEY_MODEL_OPTIONS["v8.2"];
}
function normalizeApimartMidjourneyNumber(_0x415dc6, {
  integer = false
} = {}) {
  const _0x4a5e69 = String(_0x415dc6 ?? "").trim();
  if (!_0x4a5e69 || _0x4a5e69.toLowerCase() === "auto" || _0x4a5e69.toLowerCase() === "none") {
    return undefined;
  }
  const _0x1a4601 = Number(_0x4a5e69);
  if (!Number.isFinite(_0x1a4601)) {
    return undefined;
  }
  if (integer) {
    return Math.trunc(_0x1a4601);
  } else {
    return _0x1a4601;
  }
}
function normalizeApimartMidjourneyBoolean(_0x27aebb) {
  if (_0x27aebb === true || _0x27aebb === false) {
    return _0x27aebb;
  }
  const _0x3c085f = String(_0x27aebb ?? "").trim().toLowerCase();
  if (!_0x3c085f) {
    return false;
  }
  return _0x3c085f === "true" || _0x3c085f === "1" || _0x3c085f === "yes";
}
function omitApimartMidjourneyAdaptiveSize(_0x5ee844) {
  const _0x2bf242 = String(_0x5ee844 || "").trim();
  const _0x22acdc = _0x2bf242.toLowerCase();
  return !_0x2bf242 || _0x2bf242 === "自适应" || _0x22acdc === "auto" || _0x22acdc === "adaptive" || _0x22acdc === "default";
}
function assignApimartMidjourneyNumber(_0x173ee6, _0x1fd4c2, _0x19ca09, _0x53dfe8 = {}) {
  const _0x100dc7 = normalizeApimartMidjourneyNumber(_0x19ca09, _0x53dfe8);
  if (_0x100dc7 !== undefined) {
    _0x173ee6[_0x1fd4c2] = _0x100dc7;
  }
}
function assignApimartMidjourneyBoolean(_0x535c68, _0xc87e57, _0x110609) {
  if (normalizeApimartMidjourneyBoolean(_0x110609)) {
    _0x535c68[_0xc87e57] = true;
  }
}
export function apimartMidjourneyImage({
  currentBody = {},
  payload = {},
  finalPrompt: _0x1b81c3,
  finalUrls = [],
  finalUrlsBySlot = {}
}) {
  const _0xf262fc = resolveApimartMidjourneyModel(payload);
  const _0x11ca9d = normalizeInputUrlsBySlot(finalUrlsBySlot);
  const _0x55077e = Object.keys(_0x11ca9d).length > 0;
  const _0x1ffe22 = [];
  if (_0x11ca9d.imageUrl) {
    _0x1ffe22.push(_0x11ca9d.imageUrl);
  } else if (!_0x55077e && Array.isArray(finalUrls)) {
    finalUrls.map(_0x5c1475 => String(_0x5c1475 || "").trim()).filter(Boolean).forEach(_0x392baa => {
      if (!_0x1ffe22.includes(_0x392baa)) {
        _0x1ffe22.push(_0x392baa);
      }
    });
  }
  const _0x52569f = {
    prompt: _0x1b81c3 || currentBody.prompt || "",
    version: _0xf262fc.version,
    ...(_0xf262fc.niji ? {
      niji: true
    } : {})
  };
  if (!omitApimartMidjourneyAdaptiveSize(currentBody.size)) {
    _0x52569f.size = currentBody.size;
  }
  const _0x1228a4 = String(currentBody.speed || payload.speed || "").trim().toLowerCase();
  if (_0x1228a4 === "relax" || _0x1228a4 === "fast" || _0x1228a4 === "turbo") {
    _0x52569f.speed = _0x1228a4;
  }
  const _0x2eb2b4 = String(currentBody.quality || payload.quality || "1").trim();
  if (_0x2eb2b4) {
    _0x52569f.quality = _0x2eb2b4;
  }
  if (_0x1ffe22.length > 0) {
    _0x52569f.image_urls = _0x1ffe22;
  }
  if (_0x11ca9d.cref) {
    _0x52569f.cref = _0x11ca9d.cref;
  }
  if (_0x11ca9d.sref) {
    _0x52569f.sref = _0x11ca9d.sref;
  }
  if (_0x11ca9d.dref) {
    _0x52569f.dref = _0x11ca9d.dref;
  }
  assignApimartMidjourneyNumber(_0x52569f, "seed", currentBody.seed, {
    integer: true
  });
  if (currentBody.negative_prompt) {
    _0x52569f.negative_prompt = String(currentBody.negative_prompt).trim();
  }
  assignApimartMidjourneyNumber(_0x52569f, "stylize", currentBody.stylize, {
    integer: true
  });
  assignApimartMidjourneyNumber(_0x52569f, "chaos", currentBody.chaos, {
    integer: true
  });
  assignApimartMidjourneyNumber(_0x52569f, "weird", currentBody.weird, {
    integer: true
  });
  if (_0x1ffe22.length > 0) {
    assignApimartMidjourneyNumber(_0x52569f, "iw", currentBody.iw);
  }
  if (_0x11ca9d.cref) {
    assignApimartMidjourneyNumber(_0x52569f, "cw", currentBody.cw, {
      integer: true
    });
  }
  if (_0x11ca9d.sref) {
    assignApimartMidjourneyNumber(_0x52569f, "sw", currentBody.sw, {
      integer: true
    });
  }
  if (_0x11ca9d.dref) {
    assignApimartMidjourneyNumber(_0x52569f, "dw", currentBody.dw);
  }
  const _0xbe49c8 = !_0xf262fc.niji && (_0xf262fc.version === "6.1" || _0xf262fc.version === "5.2" || _0xf262fc.version === "5.1") || _0xf262fc.niji && _0xf262fc.version === "6";
  if (_0xbe49c8) {
    assignApimartMidjourneyNumber(_0x52569f, "stop", currentBody.stop, {
      integer: true
    });
  }
  assignApimartMidjourneyBoolean(_0x52569f, "tile", currentBody.tile);
  assignApimartMidjourneyBoolean(_0x52569f, "raw", currentBody.raw);
  if (_0xf262fc.version === "8.2" || _0xf262fc.version === "8.1" || _0xf262fc.version === "7") {
    assignApimartMidjourneyBoolean(_0x52569f, "draft", currentBody.draft);
  }
  if (_0xf262fc.version === "8.2" || _0xf262fc.version === "8.1") {
    assignApimartMidjourneyBoolean(_0x52569f, "hd", currentBody.hd);
  }
  if (currentBody.extra) {
    _0x52569f.extra = String(currentBody.extra).trim();
  }
  return _0x52569f;
}
function pickClosestPpioRatio(_0xfba00f, _0x325a52) {
  const _0x2c3eed = Number(_0xfba00f || 1) / Number(_0x325a52 || 1);
  let _0x284547 = PPIO_RATIO_OPTIONS[0];
  let _0x1c4753 = Number.POSITIVE_INFINITY;
  for (const _0x3bc24c of PPIO_RATIO_OPTIONS) {
    const _0x5110f0 = Math.abs(_0x3bc24c.w / _0x3bc24c.h - _0x2c3eed);
    if (_0x5110f0 < _0x1c4753) {
      _0x1c4753 = _0x5110f0;
      _0x284547 = _0x3bc24c;
    }
  }
  return _0x284547.label;
}
function normalizePpioQuality(_0x31208b) {
  const _0x58b9b0 = String(_0x31208b || "").trim().toUpperCase();
  if (PPIO_QUALITY_PIXEL_MAP[_0x58b9b0]) {
    return _0x58b9b0;
  } else {
    return PPIO_DEFAULT_QUALITY;
  }
}
function normalizePpioAspectRatioLabel(_0x58ac5d) {
  const _0x2a8451 = String(_0x58ac5d || "").trim();
  if (!_0x2a8451) {
    return PPIO_DEFAULT_RATIO;
  }
  const _0x2ae840 = normalizeRatioLabelText(_0x2a8451);
  const _0x4be0c2 = _0x2ae840.toLowerCase();
  if (_0x4be0c2 === "auto" || _0x4be0c2 === "adaptive" || _0x2ae840 === "自适应" || _0x2ae840 === "默认") {
    return PPIO_DEFAULT_RATIO;
  }
  if (!_0x2ae840.includes(":")) {
    return PPIO_DEFAULT_RATIO;
  }
  const [_0x2dd184, _0xb245c8] = _0x2ae840.split(":");
  const _0x545681 = Number.parseFloat(_0x2dd184);
  const _0x44bae0 = Number.parseFloat(_0xb245c8);
  if (!(_0x545681 > 0) || !(_0x44bae0 > 0)) {
    return PPIO_DEFAULT_RATIO;
  }
  const _0xe49d60 = pickClosestPpioRatio(_0x545681, _0x44bae0);
  if (PPIO_RATIO_LABEL_SET.has(_0xe49d60)) {
    return _0xe49d60;
  } else {
    return PPIO_DEFAULT_RATIO;
  }
}
function calculatePpioSizeFromTargetPixels(_0xb00cf9, _0x2b96c0) {
  const [_0x4970e1, _0x35a19b] = String(_0x2b96c0 || PPIO_DEFAULT_RATIO).split(":");
  const _0x236880 = Number.parseFloat(_0x4970e1) || 1;
  const _0x47a7fd = Number.parseFloat(_0x35a19b) || 1;
  const _0x43b199 = Math.max(PPIO_MIN_RATIO, Math.min(PPIO_MAX_RATIO, _0x236880 / _0x47a7fd));
  const _0x41afb8 = Math.max(PPIO_MIN_PIXELS, Math.min(Number(_0xb00cf9) || PPIO_QUALITY_PIXEL_MAP["2K"], PPIO_MAX_PIXELS));
  let _0x2913f4 = Math.round(Math.sqrt(_0x41afb8 / _0x43b199));
  let _0x5d0a0b = Math.round(_0x2913f4 * _0x43b199);
  _0x5d0a0b = Math.max(PPIO_ALIGN_STEP, Math.round(_0x5d0a0b / PPIO_ALIGN_STEP) * PPIO_ALIGN_STEP);
  _0x2913f4 = Math.max(PPIO_ALIGN_STEP, Math.round(_0x2913f4 / PPIO_ALIGN_STEP) * PPIO_ALIGN_STEP);
  return _0x5d0a0b + "x" + _0x2913f4;
}
function resolvePpioSize(_0x1ba324, _0x2665ed) {
  const _0x1cea94 = normalizePpioQuality(_0x1ba324);
  const _0x10d407 = normalizePpioAspectRatioLabel(_0x2665ed);
  const _0x798159 = PPIO_QUALITY_PIXEL_MAP[_0x1cea94] || PPIO_QUALITY_PIXEL_MAP["2K"];
  return calculatePpioSizeFromTargetPixels(_0x798159, _0x10d407) || PPIO_DEFAULT_SIZE;
}
export function ppioImageSize({
  currentBody: _0xfbb155,
  payload: _0x2eb5ef,
  modelToken: _0x2a74eb,
  finalUrls: _0x2a9dea,
  executionManifest: _0x3a5fe7,
  modelManifest: _0x8b9f8a
}) {
  const _0x30a4e5 = _0x2a74eb || stripPrefix(_0x2eb5ef.model, "ppio/");
  const _0x23bdb3 = {
    ..._0xfbb155
  };
  const _0x142d07 = _0x3a5fe7?.extensions?.ppioImage || _0x8b9f8a?.extensions?.ppioImage || {};
  if (!_0x2eb5ef.suppressImageSize) {
    _0x23bdb3.size = resolvePpioSize(_0x2eb5ef.imageSize, _0x2eb5ef.resolvedRatioLabel || _0x2eb5ef.aspectRatio);
  }
  if (_0x142d07.optimizePromptOptions) {
    _0x23bdb3.optimize_prompt_options = {
      ..._0x142d07.optimizePromptOptions
    };
  }
  if (_0x142d07.batchSizeField && _0x2eb5ef.batchSize && _0x2eb5ef.batchSize > 1) {
    _0x23bdb3[_0x142d07.batchSizeField] = _0x2eb5ef.batchSize;
  }
  if (_0x2a9dea.length > 0) {
    _0x23bdb3[_0x142d07.imageInputField || "image"] = _0x2a9dea;
  }
  return _0x23bdb3;
}
function normalizeGrsaiImageModel(_0xe64594) {
  const _0x5c3b1b = String(_0xe64594 || "").trim();
  if (!_0x5c3b1b) {
    return "nano-banana-pro-vt";
  }
  return _0x5c3b1b.replace(/^grsai\//i, "");
}
const GRSAI_NANO_BANANA_IMAGE_SIZE_SET = new Set(["1K", "2K"]);
const GRSAI_NANO_BANANA_4K_IMAGE_SIZE_SET = new Set(["1K", "2K", "4K"]);
function getGrsaiNanoBananaSelection(_0x18df87) {
  const _0x253d6f = resolveNanoBananaSelectionFromModel(_0x18df87, "2K", "grsai");
  if (!_0x253d6f || _0x253d6f.family === NANO_BANANA_FAMILIES.GPT_IMAGE_2) {
    return null;
  }
  return _0x253d6f;
}
function getGrsaiImageSizePolicy(_0x1b6d1f) {
  const _0x24de01 = resolveModelExecution(_0x1b6d1f, {
    providerHint: "grsai"
  });
  const _0x36f6d8 = _0x24de01?.modelManifest?.extensions?.imageSizePolicy;
  if (_0x36f6d8 && typeof _0x36f6d8 === "object") {
    return _0x36f6d8;
  } else {
    return null;
  }
}
function normalizeGrsaiNanoBananaImageSize(_0x1ed06f, _0x1b2551 = "") {
  const _0x13928e = getGrsaiImageSizePolicy(_0x1b2551);
  const _0x4a0175 = String(_0x13928e?.fixedSize || "").trim().toUpperCase();
  if (_0x4a0175) {
    return _0x4a0175;
  }
  const _0x2dd301 = String(_0x1ed06f || "").trim().toUpperCase();
  const _0x379b45 = _0x13928e?.allow4KSelection ? GRSAI_NANO_BANANA_4K_IMAGE_SIZE_SET : GRSAI_NANO_BANANA_IMAGE_SIZE_SET;
  if (_0x379b45.has(_0x2dd301)) {
    return _0x2dd301;
  } else {
    return "2K";
  }
}
function getGrsaiGptImage2Policy(_0x13a20d) {
  const _0x5df942 = resolveModelExecution(_0x13a20d, {
    providerHint: "grsai"
  });
  const _0x203d1a = _0x5df942?.modelManifest?.extensions?.gptImage2;
  if (_0x203d1a && typeof _0x203d1a === "object" && !Array.isArray(_0x203d1a)) {
    return _0x203d1a;
  } else {
    return null;
  }
}
function getGrsaiGptImage2PixelSizesByRatio(_0x54c6f8) {
  const _0xb62744 = getGrsaiGptImage2Policy(_0x54c6f8)?.pixelSizesByRatio;
  if (_0xb62744 && typeof _0xb62744 === "object" && !Array.isArray(_0xb62744)) {
    return _0xb62744;
  } else {
    return {};
  }
}
function normalizeGrsaiNanoBananaAspectRatio(_0x5e3b82, _0x39f791) {
  const _0x1f3b8f = normalizeRatioLabelText(_0x5e3b82);
  const _0x5ac615 = _0x1f3b8f.toLowerCase();
  if (!_0x1f3b8f || _0x5ac615 === "auto" || _0x5ac615 === "adaptive" || _0x5ac615 === "default" || _0x1f3b8f === "自适应" || _0x1f3b8f === "默认") {
    return "auto";
  }
  const _0x1fd2a7 = parseRatioLabel(_0x1f3b8f);
  if (!_0x1fd2a7) {
    return "auto";
  }
  const _0x5b12cc = _0x1fd2a7.label;
  const _0xc20396 = new Set(getNanoBananaAllowedRatioLabels(_0x39f791));
  if (_0xc20396.has(_0x5b12cc)) {
    return _0x5b12cc;
  } else {
    return normalizeNanoBananaRatioForFamily(_0x5b12cc, _0x39f791);
  }
}
function normalizeGrsaiGptImage2ImageSize(_0x4f5dbb, _0x48f442) {
  const _0x1d64bc = getGrsaiGptImage2Policy(_0x48f442);
  const _0x108a85 = new Set((Array.isArray(_0x1d64bc?.allowedSizes) ? _0x1d64bc.allowedSizes : ["1K"]).map(_0x45b2f0 => String(_0x45b2f0 || "").trim().toUpperCase()));
  const _0x856f9e = String(_0x1d64bc?.defaultSize || "1K").trim().toUpperCase();
  const _0x476b60 = String(_0x4f5dbb || "").trim().toUpperCase();
  if (_0x108a85.has(_0x476b60)) {
    return _0x476b60;
  }
  if (_0x108a85.has(_0x856f9e)) {
    return _0x856f9e;
  } else {
    return "1K";
  }
}
function normalizePixelSize(_0x3e9bf0) {
  const _0x41477a = String(_0x3e9bf0 || "").trim().match(/^(\d{2,5})\s*[xX]\s*(\d{2,5})$/);
  if (!_0x41477a) {
    return "";
  }
  return _0x41477a[1] + "x" + _0x41477a[2];
}
function getGrsaiGptImage2RatioOptionsForSize(_0xf47c78, _0x3488ef) {
  const _0x1a23f7 = getGrsaiGptImage2PixelSizesByRatio(_0x3488ef);
  return Object.keys(_0x1a23f7).filter(_0xb89c52 => _0x1a23f7[_0xb89c52]?.[_0xf47c78]).map(_0x2fddc6 => {
    const _0x3c401c = parseRatioLabel(_0x2fddc6) || {
      w: 1,
      h: 1
    };
    return Object.freeze({
      label: _0x2fddc6,
      value: _0x3c401c.w / _0x3c401c.h
    });
  });
}
function getDefaultGrsaiGptImage2PixelSize(_0x560389, _0x333fe3) {
  return _0x560389["1:1"]?.[_0x333fe3] || _0x560389["1:1"]?.["1K"] || "1024x1024";
}
function pickClosestGrsaiGptImage2RatioLabel(_0x33925f, _0x1786e1, _0xdc4696) {
  const _0x333ae3 = parseRatioLabel(_0x33925f);
  const _0x1dccdc = _0x333ae3 ? _0x333ae3.w / _0x333ae3.h : 1;
  const _0x4bfc8d = getGrsaiGptImage2RatioOptionsForSize(_0x1786e1, _0xdc4696);
  let _0xcee17e = _0x4bfc8d[0] || {
    label: "1:1",
    value: 1
  };
  let _0x219896 = Number.POSITIVE_INFINITY;
  for (const _0x38b7db of _0x4bfc8d) {
    const _0x19e838 = Math.abs(_0x1dccdc - _0x38b7db.value);
    if (_0x19e838 < _0x219896) {
      _0xcee17e = _0x38b7db;
      _0x219896 = _0x19e838;
    }
  }
  return _0xcee17e?.label || "1:1";
}
function normalizeGrsaiGptImage2AspectRatio(_0x5ebf51, _0x3e166d, _0x3ba4f8) {
  const _0x160db3 = getGrsaiGptImage2PixelSizesByRatio(_0x3ba4f8);
  const _0x5bf6c3 = normalizePixelSize(_0x5ebf51);
  if (_0x5bf6c3) {
    return _0x5bf6c3;
  }
  const _0x451bb4 = normalizeRatioLabelText(_0x5ebf51);
  const _0x616c29 = _0x451bb4.toLowerCase();
  if (!_0x451bb4 || _0x616c29 === "auto" || _0x616c29 === "adaptive" || _0x616c29 === "default" || _0x451bb4 === "自适应" || _0x451bb4 === "默认") {
    return getDefaultGrsaiGptImage2PixelSize(_0x160db3, _0x3e166d);
  }
  const _0x4bedbd = parseRatioLabel(_0x451bb4);
  const _0x17c25d = _0x4bedbd?.label || "1:1";
  const _0x11bade = _0x160db3[_0x17c25d]?.[_0x3e166d];
  if (_0x11bade) {
    return _0x11bade;
  }
  const _0x514795 = pickClosestGrsaiGptImage2RatioLabel(_0x17c25d, _0x3e166d, _0x3ba4f8);
  return _0x160db3[_0x514795]?.[_0x3e166d] || getDefaultGrsaiGptImage2PixelSize(_0x160db3, _0x3e166d);
}
export function grsaiImage({
  payload: _0x3fb1d3,
  finalPrompt: _0x122a92,
  modelToken: _0x2b6d25,
  finalUrls: _0x158c1f
}) {
  const _0xf16388 = normalizeGrsaiImageModel(_0x2b6d25 || _0x3fb1d3.model || "nano-banana-pro-vt");
  const _0x5d4e19 = getGrsaiNanoBananaSelection(_0xf16388);
  const _0x4d6423 = _0x3fb1d3.resolvedRatioLabel || _0x3fb1d3.aspectRatio;
  const _0x1d1cdb = _0x5d4e19 ? normalizeGrsaiNanoBananaAspectRatio(_0x4d6423, _0x5d4e19.family) : _0x4d6423;
  const _0x2e69f3 = _0x5d4e19 ? normalizeGrsaiNanoBananaImageSize(_0x3fb1d3.imageSize, _0xf16388) : _0x3fb1d3.imageSize || "2K";
  return {
    model: _0xf16388,
    prompt: _0x122a92,
    images: _0x158c1f,
    replyType: "json",
    ...(!_0x3fb1d3.suppressImageSize && !shouldOmitImageSizeParam(_0xf16388) && {
      imageSize: _0x2e69f3
    }),
    ...(!_0x3fb1d3.suppressAspectRatio && _0x1d1cdb && {
      aspectRatio: _0x1d1cdb
    })
  };
}
export function grsaiGptImage2Image({
  payload: _0x4013d2,
  finalPrompt: _0x1907f0,
  modelToken: _0x209b89,
  finalUrls: _0x637d7d
}) {
  const _0x37fb2d = normalizeGrsaiImageModel(_0x209b89 || _0x4013d2.model || "gpt-image-2");
  const _0x230b7c = normalizeGrsaiGptImage2ImageSize(_0x4013d2.imageSize, _0x37fb2d);
  const _0x3efa20 = normalizeGrsaiGptImage2AspectRatio(_0x4013d2.resolvedRatioLabel || _0x4013d2.aspectRatio, _0x230b7c, _0x37fb2d);
  return {
    model: _0x37fb2d,
    prompt: _0x1907f0,
    images: _0x637d7d,
    replyType: "json",
    ...(!_0x4013d2.suppressAspectRatio && _0x3efa20 && {
      aspectRatio: _0x3efa20
    })
  };
}
function normalizeRunningHubModelId(_0x58f629) {
  return stripPrefix(_0x58f629, "runninghub-model/");
}
function getRunningHubImageExecutionPolicy({
  executionManifest: _0x57ebb0,
  modelManifest: _0x5d1796
} = {}) {
  const _0x147e48 = _0x57ebb0?.extensions?.runningHubImage || _0x5d1796?.extensions?.runningHubImage;
  if (_0x147e48 && typeof _0x147e48 === "object" && !Array.isArray(_0x147e48)) {
    return _0x147e48;
  } else {
    return {};
  }
}
function normalizeRunningHubImageRoute(_0x47dff8 = {}) {
  const _0x1edd8d = String(_0x47dff8?.rhModelRoute ?? _0x47dff8?.generationParams?.rhModelRoute ?? "").trim().toLowerCase();
  return _0x1edd8d || "low";
}
function isPlainRunningHubPolicyObject(_0xf4f99b) {
  return _0xf4f99b && typeof _0xf4f99b === "object" && !Array.isArray(_0xf4f99b);
}
function pickRunningHubRouteValue(_0x3d083a, _0x286948) {
  if (!isPlainRunningHubPolicyObject(_0x3d083a)) {
    return undefined;
  }
  if (Object.prototype.hasOwnProperty.call(_0x3d083a, _0x286948)) {
    return _0x3d083a[_0x286948];
  }
  if (Object.prototype.hasOwnProperty.call(_0x3d083a, "default")) {
    return _0x3d083a.default;
  }
  return undefined;
}
function pickRunningHubPolicyValue(_0x5614f4, _0x3df263, _0x25e988) {
  const _0x1f853e = pickRunningHubRouteValue(_0x5614f4?.[_0x3df263 + "ByRoute"], _0x25e988);
  if (_0x1f853e !== undefined) {
    return _0x1f853e;
  } else {
    return _0x5614f4?.[_0x3df263];
  }
}
function mergeRunningHubRoutePolicyObject(_0x502e7a, _0x508f7e, _0x17c9cb) {
  const _0x40711a = isPlainRunningHubPolicyObject(_0x502e7a?.[_0x508f7e]) ? _0x502e7a[_0x508f7e] : {};
  const _0x4e83d3 = pickRunningHubRouteValue(_0x502e7a?.[_0x508f7e + "ByRoute"], _0x17c9cb);
  if (!isPlainRunningHubPolicyObject(_0x4e83d3)) {
    return _0x40711a;
  }
  return {
    ..._0x40711a,
    ..._0x4e83d3
  };
}
function resolveRunningHubImageRoutePolicy(_0x3aebbf, _0x6232ab = {}) {
  const _0x5ae662 = normalizeRunningHubImageRoute(_0x6232ab);
  return {
    ..._0x3aebbf,
    route: _0x5ae662,
    textEndpoint: pickRunningHubPolicyValue(_0x3aebbf, "textEndpoint", _0x5ae662),
    inputEndpoint: pickRunningHubPolicyValue(_0x3aebbf, "inputEndpoint", _0x5ae662),
    omitResolution: pickRunningHubPolicyValue(_0x3aebbf, "omitResolution", _0x5ae662),
    quality: pickRunningHubPolicyValue(_0x3aebbf, "quality", _0x5ae662),
    omitAspectRatio: pickRunningHubPolicyValue(_0x3aebbf, "omitAspectRatio", _0x5ae662),
    aspectRatioValueMap: pickRunningHubPolicyValue(_0x3aebbf, "aspectRatioValueMap", _0x5ae662),
    omitAspectRatioWhenInput: pickRunningHubPolicyValue(_0x3aebbf, "omitAspectRatioWhenInput", _0x5ae662),
    inputSlotBodyFields: pickRunningHubPolicyValue(_0x3aebbf, "inputSlotBodyFields", _0x5ae662),
    constantParams: mergeRunningHubRoutePolicyObject(_0x3aebbf, "constantParams", _0x5ae662),
    defaultParams: mergeRunningHubRoutePolicyObject(_0x3aebbf, "defaultParams", _0x5ae662),
    bodyParamTypes: mergeRunningHubRoutePolicyObject(_0x3aebbf, "bodyParamTypes", _0x5ae662),
    bodyParamInputModes: mergeRunningHubRoutePolicyObject(_0x3aebbf, "bodyParamInputModes", _0x5ae662)
  };
}
function resolveRunningHubModelEndpoint({
  hasInputImages: _0x32ae9c,
  executionManifest: _0x1cb1e5,
  modelManifest: _0x56417a,
  payload: _0x3cac34
}) {
  const _0x3a6cc8 = resolveRunningHubImageRoutePolicy(getRunningHubImageExecutionPolicy({
    executionManifest: _0x1cb1e5,
    modelManifest: _0x56417a
  }), _0x3cac34);
  if (!_0x32ae9c) {
    return _0x3a6cc8.textEndpoint || "text-to-image";
  }
  return _0x3a6cc8.inputEndpoint || "image-to-image";
}
function normalizeRunningHubBodyParamValue(_0x2a8500, _0x4d3fda) {
  const _0x193a4a = String(_0x4d3fda || "string").trim().toLowerCase();
  if (_0x193a4a === "boolean") {
    if (_0x2a8500 === true || _0x2a8500 === false) {
      return _0x2a8500;
    }
    const _0x45c7ef = String(_0x2a8500 ?? "").trim().toLowerCase();
    if (["true", "1", "yes", "on"].includes(_0x45c7ef)) {
      return true;
    }
    if (["false", "0", "no", "off", ""].includes(_0x45c7ef)) {
      return false;
    }
    return Boolean(_0x2a8500);
  }
  if (_0x193a4a === "integer") {
    const _0x2a57b4 = Number.parseInt(String(_0x2a8500 ?? "").trim(), 10);
    if (Number.isFinite(_0x2a57b4)) {
      return _0x2a57b4;
    } else {
      return null;
    }
  }
  if (_0x193a4a === "number") {
    const _0x5aa44e = Number(_0x2a8500);
    if (Number.isFinite(_0x5aa44e)) {
      return _0x5aa44e;
    } else {
      return null;
    }
  }
  return String(_0x2a8500 ?? "").trim();
}
function normalizeRunningHubAspectRatioValueMap(_0x2e2d43) {
  if (_0x2e2d43 && typeof _0x2e2d43 === "object" && !Array.isArray(_0x2e2d43)) {
    return _0x2e2d43;
  } else {
    return {};
  }
}
function hasRunningHubAspectRatioValueMap(_0x423776) {
  return Object.keys(normalizeRunningHubAspectRatioValueMap(_0x423776?.aspectRatioValueMap)).length > 0;
}
function resolveRunningHubMappedAspectRatio(_0x3aa1aa, _0x62ae6f) {
  const _0x5ec5c5 = String(_0x3aa1aa || "").trim();
  if (!_0x5ec5c5) {
    return "";
  }
  const _0x634e3 = normalizeRunningHubAspectRatioValueMap(_0x62ae6f?.aspectRatioValueMap);
  const _0x412764 = Object.entries(_0x634e3).map(([_0x5765f5, _0x10013c]) => [normalizeRatioLabelText(_0x5765f5), String(_0x10013c || "").trim()]).filter(([_0x102577, _0x501f18]) => _0x102577 && _0x501f18);
  if (_0x412764.length === 0) {
    return _0x5ec5c5;
  }
  const _0x59220c = normalizeRatioLabelText(_0x5ec5c5);
  const _0x598153 = _0x412764.find(([_0x3bac77]) => _0x3bac77 === _0x59220c);
  if (_0x598153) {
    return _0x598153[1];
  }
  const _0x3539f1 = _0x59220c.toLowerCase();
  const _0x31bda1 = _0x412764.find(([, _0x3c54fd]) => _0x3c54fd.toLowerCase() === _0x3539f1);
  if (_0x31bda1) {
    return _0x31bda1[1];
  }
  const _0x4366cb = parseRatioLabel(_0x59220c);
  if (!_0x4366cb) {
    return _0x5ec5c5;
  }
  const _0x34c2e8 = _0x4366cb.w / _0x4366cb.h;
  let _0x5db95f = null;
  let _0x4c710c = Number.POSITIVE_INFINITY;
  _0x412764.forEach(([_0x43f575, _0x3f42e4]) => {
    const _0x42d26 = parseRatioLabel(_0x43f575);
    if (!_0x42d26) {
      return;
    }
    const _0x37529b = Math.abs(_0x42d26.w / _0x42d26.h - _0x34c2e8);
    if (_0x37529b < _0x4c710c) {
      _0x5db95f = _0x3f42e4;
      _0x4c710c = _0x37529b;
    }
  });
  return _0x5db95f || _0x5ec5c5;
}
function assignRunningHubInputSlotFields(_0x41d092, _0x4dac07, _0x1bc8eb) {
  const _0x31d4c2 = _0x4dac07?.inputSlotBodyFields && typeof _0x4dac07.inputSlotBodyFields === "object" && !Array.isArray(_0x4dac07.inputSlotBodyFields) ? _0x4dac07.inputSlotBodyFields : null;
  if (!_0x31d4c2) {
    return {};
  }
  const _0x2aa6cb = a14_0x2a2f60(_0x1bc8eb);
  Object.entries(_0x31d4c2).forEach(([_0x33a67f, _0x304515]) => {
    const _0x4a24bf = String(_0x304515 || "").trim();
    const _0x2fa285 = _0x2aa6cb[String(_0x33a67f || "").trim()];
    if (_0x4a24bf && _0x2fa285) {
      _0x41d092[_0x4a24bf] = _0x2fa285;
    }
  });
  return _0x2aa6cb;
}
function shouldIncludeRunningHubPolicyParam(_0x27cc57, _0x39f13a, _0x51d101) {
  const _0x3b25db = _0x39f13a?.conditionalParams && typeof _0x39f13a.conditionalParams === "object" && !Array.isArray(_0x39f13a.conditionalParams) ? _0x39f13a.conditionalParams : {};
  const _0x2c8c1d = String(_0x3b25db[_0x27cc57] || "").trim();
  if (!_0x2c8c1d) {
    return true;
  }
  return !!_0x51d101?.[_0x2c8c1d];
}
function shouldIncludeRunningHubParamForInputMode(_0x1c34c1, _0x45b223, _0x4ad300) {
  const _0x24e0f = _0x45b223?.bodyParamInputModes && typeof _0x45b223.bodyParamInputModes === "object" && !Array.isArray(_0x45b223.bodyParamInputModes) ? _0x45b223.bodyParamInputModes : {};
  const _0x219838 = String(_0x24e0f[_0x1c34c1] || "").trim().toLowerCase();
  if (!_0x219838) {
    return true;
  }
  if (_0x219838 === "textonly" || _0x219838 === "text-only") {
    return !_0x4ad300;
  }
  if (_0x219838 === "inputonly" || _0x219838 === "input-only") {
    return _0x4ad300;
  }
  return true;
}
function assignRunningHubPolicyParams(_0x2076c6, _0x9b309f, _0x3ef24, _0x1204b6, {
  hasInputImages = false
} = {}) {
  const _0x5639f1 = _0x3ef24?.constantParams && typeof _0x3ef24.constantParams === "object" && !Array.isArray(_0x3ef24.constantParams) ? _0x3ef24.constantParams : {};
  Object.entries(_0x5639f1).forEach(([_0x39e71f, _0x1c27d5]) => {
    if (!shouldIncludeRunningHubPolicyParam(_0x39e71f, _0x3ef24, _0x1204b6)) {
      return;
    }
    if (!shouldIncludeRunningHubParamForInputMode(_0x39e71f, _0x3ef24, hasInputImages)) {
      return;
    }
    _0x2076c6[_0x39e71f] = _0x1c27d5;
  });
  const _0x463651 = _0x3ef24?.bodyParamTypes && typeof _0x3ef24.bodyParamTypes === "object" && !Array.isArray(_0x3ef24.bodyParamTypes) ? _0x3ef24.bodyParamTypes : {};
  Object.entries(_0x463651).forEach(([_0x3d0b7a, _0x2106ef]) => {
    if (Object.prototype.hasOwnProperty.call(_0x2076c6, _0x3d0b7a)) {
      return;
    }
    if (!Object.prototype.hasOwnProperty.call(_0x9b309f || {}, _0x3d0b7a)) {
      return;
    }
    if (!shouldIncludeRunningHubPolicyParam(_0x3d0b7a, _0x3ef24, _0x1204b6)) {
      return;
    }
    if (!shouldIncludeRunningHubParamForInputMode(_0x3d0b7a, _0x3ef24, hasInputImages)) {
      return;
    }
    const _0x49bbe4 = _0x9b309f[_0x3d0b7a];
    if (_0x49bbe4 === undefined || _0x49bbe4 === null) {
      return;
    }
    if (typeof _0x49bbe4 === "string" && _0x49bbe4.trim() === "") {
      return;
    }
    const _0x1cd4cd = normalizeRunningHubBodyParamValue(_0x49bbe4, _0x2106ef);
    if (_0x1cd4cd === null || _0x1cd4cd === "") {
      return;
    }
    _0x2076c6[_0x3d0b7a] = _0x1cd4cd;
  });
  const _0x4f7a94 = _0x3ef24?.defaultParams && typeof _0x3ef24.defaultParams === "object" && !Array.isArray(_0x3ef24.defaultParams) ? _0x3ef24.defaultParams : {};
  Object.entries(_0x4f7a94).forEach(([_0x3641f8, _0x1345f9]) => {
    if (Object.prototype.hasOwnProperty.call(_0x2076c6, _0x3641f8)) {
      return;
    }
    if (!shouldIncludeRunningHubPolicyParam(_0x3641f8, _0x3ef24, _0x1204b6)) {
      return;
    }
    if (!shouldIncludeRunningHubParamForInputMode(_0x3641f8, _0x3ef24, hasInputImages)) {
      return;
    }
    _0x2076c6[_0x3641f8] = _0x1345f9;
  });
}
function normalizeRunningHubModelQuality(_0x423e48) {
  const _0x5d4765 = String(_0x423e48 || "").trim().toUpperCase();
  if (RUNNINGHUB_MODEL_QUALITY_PIXEL_MAP[_0x5d4765]) {
    return _0x5d4765;
  } else {
    return RUNNINGHUB_MODEL_DEFAULT_QUALITY;
  }
}
function normalizeRunningHubModelRatio(_0x4c22d3) {
  const _0x33fafa = String(_0x4c22d3 || "").trim();
  if (!_0x33fafa) {
    return RUNNINGHUB_MODEL_DEFAULT_RATIO;
  }
  const _0x39e4ec = normalizeRatioLabelText(_0x33fafa);
  const _0x114228 = _0x39e4ec.toLowerCase();
  if (_0x114228 === "auto" || _0x114228 === "default" || _0x114228 === "original" || _0x114228 === "adaptive") {
    return RUNNINGHUB_MODEL_DEFAULT_RATIO;
  }
  if (!_0x39e4ec.includes(":")) {
    return RUNNINGHUB_MODEL_DEFAULT_RATIO;
  }
  const [_0x316310, _0x491461] = _0x39e4ec.split(":");
  const _0xc774c2 = Number.parseFloat(_0x316310);
  const _0x89e0b1 = Number.parseFloat(_0x491461);
  if (!(_0xc774c2 > 0) || !(_0x89e0b1 > 0)) {
    return RUNNINGHUB_MODEL_DEFAULT_RATIO;
  }
  const _0x572e6a = _0xc774c2 + ":" + _0x89e0b1;
  if (RUNNINGHUB_MODEL_RATIO_SET.has(_0x572e6a)) {
    return _0x572e6a;
  } else {
    return RUNNINGHUB_MODEL_DEFAULT_RATIO;
  }
}
function alignRunningHubDimension(_0x22fc4b) {
  const _0x28068e = Math.round(Number(_0x22fc4b || 0) / RUNNINGHUB_MODEL_DIMENSION_ALIGN) * RUNNINGHUB_MODEL_DIMENSION_ALIGN;
  return Math.max(RUNNINGHUB_MODEL_DIMENSION_MIN, Math.min(RUNNINGHUB_MODEL_DIMENSION_MAX, _0x28068e));
}
function resolveRunningHubModelDimensions(_0x4f7c23, _0x253de4) {
  const _0x213048 = normalizeRunningHubModelQuality(_0x4f7c23);
  const _0x3c34e8 = normalizeRunningHubModelRatio(_0x253de4);
  const [_0x15ac69, _0x3a8880] = _0x3c34e8.split(":");
  const _0x4aca92 = Number.parseFloat(_0x15ac69) || 1;
  const _0x288dc4 = Number.parseFloat(_0x3a8880) || 1;
  const _0x4d9928 = RUNNINGHUB_MODEL_QUALITY_PIXEL_MAP[_0x213048] || RUNNINGHUB_MODEL_QUALITY_PIXEL_MAP[RUNNINGHUB_MODEL_DEFAULT_QUALITY];
  const _0x34415b = _0x4aca92 / _0x288dc4;
  const _0x257d3d = Math.sqrt(_0x4d9928 / _0x34415b);
  const _0x570e2c = _0x257d3d * _0x34415b;
  return {
    width: alignRunningHubDimension(_0x570e2c),
    height: alignRunningHubDimension(_0x257d3d)
  };
}
function isAdaptiveRatioInput(_0x329253) {
  const _0x4f88fd = String(_0x329253 || "").trim();
  if (!_0x4f88fd) {
    return true;
  }
  const _0x4a938d = normalizeRatioLabelText(_0x4f88fd);
  const _0x2a93bf = _0x4a938d.toLowerCase();
  if (/^\d+x\d+$/i.test(_0x4a938d)) {
    return false;
  }
  return _0x2a93bf === "auto" || _0x2a93bf === "default" || _0x2a93bf === "adaptive" || _0x2a93bf === "original" || !_0x4a938d.includes(":");
}
export function runninghubImage({
  payload: _0x3fc4b5,
  finalPrompt: _0x26036b,
  modelToken: _0x52471f,
  finalUrls: _0x322a6a,
  finalUrlsBySlot = {},
  executionManifest: _0x283104,
  modelManifest: _0x1b3e28
}) {
  const _0x1056c1 = normalizeRunningHubModelId(_0x52471f);
  const _0x1af918 = resolveRunningHubImageRoutePolicy(getRunningHubImageExecutionPolicy({
    executionManifest: _0x283104,
    modelManifest: _0x1b3e28
  }), _0x3fc4b5);
  const _0x2588bc = _0x1b3e28?.modelId || "runninghub-model/" + _0x1056c1;
  const _0x27dafe = _0x1af918.omitResolution === true || isRunningHubModelWithoutImageSizeParam(_0x3fc4b5.model);
  const _0x52fe1b = normalizeImageSizeForProviderModel({
    model: _0x2588bc,
    provider: "runninghub",
    imageSize: _0x3fc4b5.imageSize
  }) || _0x3fc4b5.imageSize;
  const _0x2a243d = {
    "1K": "1k",
    "2K": "2k",
    "4K": "4k"
  };
  const _0x53209a = _0x2a243d[_0x52fe1b] || "2k";
  const _0x5227b6 = resolveProviderRatioPayload({
    provider: "runninghub",
    model: "runninghub-model/" + _0x1056c1,
    ratioLabel: _0x3fc4b5.resolvedRatioLabel || _0x3fc4b5.aspectRatio,
    imageSize: _0x52fe1b,
    suppressAspectRatio: _0x3fc4b5.suppressAspectRatio
  });
  const _0x4b6da7 = String(_0x5227b6?.params?.aspectRatio || "").trim();
  const _0xce50ef = _0x3fc4b5.resolvedRatioLabel || _0x3fc4b5.aspectRatio;
  const _0x305768 = resolveRunningHubMappedAspectRatio(hasRunningHubAspectRatioValueMap(_0x1af918) ? _0xce50ef || _0x4b6da7 : _0x4b6da7, _0x1af918);
  const _0x5aaef1 = _0x305768.toLowerCase();
  const _0x3edd2a = _0x1af918.aspectRatioMode === "dimensions" || _0x1b3e28?.extensions?.ratioPolicy?.capability === "dimensions";
  const _0x555662 = _0x3edd2a ? _0x5227b6?.ratioCapability === "dimensions" ? {
    width: Number(_0x5227b6?.params?.width) || 2048,
    height: Number(_0x5227b6?.params?.height) || 2048
  } : resolveRunningHubModelDimensions(_0x52fe1b, _0x3fc4b5.aspectRatio) : null;
  const _0x207ab1 = _0x3edd2a || _0x1af918.omitAspectRatio === true || _0x1af918.omitAspectRatioWhenInput === true && _0x322a6a.length > 0 || _0x3fc4b5.suppressAspectRatio || isAdaptiveRatioInput(_0xce50ef) || !_0x305768 || _0x5aaef1 === "auto" || _0x5aaef1 === "default" || _0x5aaef1 === "adaptive" || _0x5aaef1 === "original";
  const _0x576164 = {
    prompt: _0x26036b || "",
    ...(_0x3edd2a ? {
      width: _0x555662?.width || 2048,
      height: _0x555662?.height || 2048
    } : !_0x27dafe ? {
      resolution: _0x53209a
    } : {}),
    ...(_0x1af918.quality ? {
      quality: _0x1af918.quality
    } : {}),
    ...(!_0x207ab1 && {
      aspectRatio: _0x305768
    }),
    ...(_0x3fc4b5.negativePrompt && {
      negativePrompt: _0x3fc4b5.negativePrompt
    }),
    ...(_0x3fc4b5.seed && {
      seed: _0x3fc4b5.seed
    })
  };
  const _0x51b906 = assignRunningHubInputSlotFields(_0x576164, _0x1af918, finalUrlsBySlot);
  assignRunningHubPolicyParams(_0x576164, _0x3fc4b5, _0x1af918, _0x51b906, {
    hasInputImages: _0x322a6a.length > 0
  });
  if (_0x322a6a.length > 0 && !_0x1af918.inputSlotBodyFields) {
    _0x576164.imageUrls = _0x322a6a;
  }
  return _0x576164;
}
export function runninghubImageEndpoint({
  modelToken: _0x2f0aa6,
  finalUrls: _0x1b97de,
  executionManifest: _0x38d2c8,
  modelManifest: _0x384d75,
  payload: _0x3b90d6
}) {
  const _0x825b29 = normalizeRunningHubModelId(_0x2f0aa6);
  const _0xc26b34 = resolveRunningHubModelEndpoint({
    hasInputImages: _0x1b97de.length > 0,
    executionManifest: _0x38d2c8,
    modelManifest: _0x384d75,
    payload: _0x3b90d6
  });
  return "https://www.runninghub.cn/openapi/v2/" + _0x825b29 + "/" + _0xc26b34;
}