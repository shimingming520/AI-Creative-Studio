import { compressImage } from "../src/modules/imageUtils.js";
import { post as a88_0x71f0d6, get as a88_0x4cdd00 } from "./requester.js";
import { resolveImageInputUploadQualityOptions } from "../src/services/imageInputUploadQualityService.js";
import { convertImageBlobToPngBlob, resolveImageMimeType } from "../src/services/imagePngConversionService.js";
import { isApimartReusableUrl, uploadImageToApimart } from "./apimartUploadApi.js";
import { isCustomProviderAssetUploadProvider, isReusableCustomProviderAssetUrl, uploadToCustomProviderAsset } from "./customProviderAssetUploadApi.js";
import { uploadToFreeImageHost } from "./freeImageHostApi.js";
import { isConfiguredObjectStorageEnabled, isConfiguredObjectStoragePublicUrl, OBJECT_STORAGE_UPLOAD_PROVIDER, uploadPublicMediaToConfiguredObjectStorage } from "./objectStorageApi.js";
import { getRunningHubUploadErrorMessage, getRunningHubUploadUrl, hasRunningHubUploadFailureCode } from "./runningHubUploadResponse.js";
function _createLimiter(_0x457a99) {
  let _0x5e9353 = 0;
  const _0x2f8042 = [];
  return function _0x3d3650(_0x20ee29) {
    return new Promise((_0x83be2c, _0x629588) => {
      const _0x346e68 = () => {
        _0x5e9353++;
        Promise.resolve().then(_0x20ee29).then(_0x4c99d8 => {
          _0x5e9353--;
          if (_0x2f8042.length && _0x5e9353 < _0x457a99) {
            _0x2f8042.shift()();
          }
          _0x83be2c(_0x4c99d8);
        }, _0x68f208 => {
          _0x5e9353--;
          if (_0x2f8042.length && _0x5e9353 < _0x457a99) {
            _0x2f8042.shift()();
          }
          _0x629588(_0x68f208);
        });
      };
      if (_0x5e9353 < _0x457a99) {
        _0x346e68();
      } else {
        _0x2f8042.push(_0x346e68);
      }
    });
  };
}
const _runLimited = _createLimiter(3);
const _inflight = new Map();
const DEFAULT_IMAGE_UPLOAD_RETRIES = 1;
const DEFAULT_IMAGE_UPLOAD_RETRY_DELAY_MS = 500;
const DEFAULT_IMAGE_UPLOAD_PROVIDER = "freeImageHost";
function sleep(_0x390abd) {
  const _0x4efbe3 = Number(_0x390abd);
  if (_0x4efbe3 > 0) {
    return new Promise(_0x455250 => setTimeout(_0x455250, _0x4efbe3));
  } else {
    return Promise.resolve();
  }
}
function normalizeRetryCount(_0x54b121, _0xf97566 = DEFAULT_IMAGE_UPLOAD_RETRIES) {
  const _0x4d39c3 = Number(_0x54b121);
  if (Number.isFinite(_0x4d39c3) && _0x4d39c3 >= 0) {
    return Math.min(5, Math.trunc(_0x4d39c3));
  } else {
    return _0xf97566;
  }
}
function normalizeDelayMs(_0x4d307b, _0xd14d2f = DEFAULT_IMAGE_UPLOAD_RETRY_DELAY_MS) {
  const _0x34e77b = Number(_0x4d307b);
  if (Number.isFinite(_0x34e77b) && _0x34e77b >= 0) {
    return Math.trunc(_0x34e77b);
  } else {
    return _0xd14d2f;
  }
}
function getErrorStatus(_0x1561eb) {
  const _0x44ff19 = _0x1561eb?.status ?? _0x1561eb?.statusCode ?? _0x1561eb?.httpStatus;
  const _0x191d1e = Number(_0x44ff19);
  if (Number.isFinite(_0x191d1e)) {
    return _0x191d1e;
  } else {
    return 0;
  }
}
function isMissingUploadUrlError(_0x3e2ff7) {
  const _0x45e304 = String(_0x3e2ff7?.message || _0x3e2ff7 || "");
  return /未返回可用.*(?:URL|链接)/i.test(_0x45e304) || /(?:URL|链接).*(?:为空|缺失)/i.test(_0x45e304) || /返回格式异常/i.test(_0x45e304) || /(?:empty|missing).*(?:url|link)/i.test(_0x45e304);
}
function isRetryableImageUploadError(_0x554044) {
  if (_0x554044?.retryable === true || isMissingUploadUrlError(_0x554044)) {
    return true;
  }
  const _0x33df39 = getErrorStatus(_0x554044);
  return _0x33df39 === 408 || _0x33df39 === 425 || _0x33df39 === 429 || _0x33df39 >= 500;
}
function _buildKey(_0x4c7da2, _0x1d30cd, _0x2d7eaf) {
  const {
    compress = true,
    maxDim = 2048,
    quality = 0.9,
    provider = DEFAULT_IMAGE_UPLOAD_PROVIDER,
    preferFree = false,
    apiUrl = "",
    multipartField = "",
    responsePath = "",
    uploadRetries = DEFAULT_IMAGE_UPLOAD_RETRIES,
    retryDelayMs = DEFAULT_IMAGE_UPLOAD_RETRY_DELAY_MS
  } = _0x2d7eaf || {};
  const _0x3aae54 = Math.round(quality * 1000);
  const _0x455b96 = _0x1d30cd ? 1 : 0;
  const _0x2183f1 = compress ? 1 : 0;
  const _0x389eae = preferFree ? 1 : 0;
  const _0x20c659 = _0x2d7eaf?.forceProviderUpload === true ? 1 : 0;
  const _0x1926e6 = isConfiguredObjectStorageEnabled() && !_0x20c659 ? 1 : 0;
  return [_0x4c7da2, provider, _0x2183f1, maxDim, _0x3aae54, _0x455b96, _0x389eae, _0x1926e6, _0x20c659, apiUrl, multipartField, responsePath, normalizeRetryCount(uploadRetries), normalizeDelayMs(retryDelayMs)].join("|");
}
function _getUploadPromise(_0x48f123, _0x2b05cf, _0x52e31c) {
  const _0x9588b4 = _buildKey(_0x48f123, _0x2b05cf, _0x52e31c);
  let _0x29d8a6 = _inflight.get(_0x9588b4);
  if (!_0x29d8a6) {
    _0x29d8a6 = _runLimited(() => _processSingle(_0x48f123, _0x2b05cf, _0x52e31c));
    _inflight.set(_0x9588b4, _0x29d8a6);
    _0x29d8a6.finally(() => {
      _inflight.delete(_0x9588b4);
    }).catch(() => {});
  }
  return _0x29d8a6;
}
function isReusableRunningHubUrl(_0x4ee135, _0x4280bf = "") {
  try {
    const _0x327b23 = new URL(String(_0x4ee135 || "").trim()).hostname;
    const _0x3a006b = new URL(String(_0x4280bf || "https://www.runninghub.cn").trim()).hostname;
    return _0x327b23 === _0x3a006b;
  } catch {
    return false;
  }
}
function isProviderAssetIdentifier(_0x3c0f5e) {
  return /^asset:\/\//i.test(String(_0x3c0f5e || "").trim());
}
function guessImageExtension(_0x561435, _0x10440c = "png") {
  try {
    const _0x2431fe = new URL(String(_0x561435 || "").trim(), "https://local.invalid");
    const _0x58aa70 = String(_0x2431fe.pathname || "").split("/").pop() || "";
    const _0x1ce240 = _0x58aa70.includes(".") ? _0x58aa70.split(".").pop().toLowerCase() : "";
    if (/^(?:jpe?g|png|webp)$/.test(_0x1ce240)) {
      if (_0x1ce240 === "jpeg") {
        return "jpg";
      } else {
        return _0x1ce240;
      }
    }
  } catch {}
  return _0x10440c;
}
function normalizeImageExtension(_0x336217) {
  const _0x2101c2 = String(_0x336217 || "").trim().toLowerCase().replace(/^\./, "");
  if (_0x2101c2 === "jpeg") {
    return "jpg";
  } else {
    return _0x2101c2;
  }
}
function resolveImageExtension(_0x55046a, _0x53066e) {
  const _0x2ce77e = resolveImageMimeType(_0x55046a, _0x53066e);
  return {
    "image/jpeg": "jpg",
    "image/jpg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/gif": "gif",
    "image/bmp": "bmp",
    "image/x-ms-bmp": "bmp",
    "image/avif": "avif",
    "image/svg+xml": "svg"
  }[_0x2ce77e] || "";
}
async function normalizeCustomProviderImageBlob(_0x25018c, _0x166450, _0xfd6d8d = {}) {
  if (!isCustomProviderAssetUploadProvider(_0xfd6d8d.provider)) {
    return _0x25018c;
  }
  const _0x5d2457 = new Set((Array.isArray(_0xfd6d8d.allowedExtensions) ? _0xfd6d8d.allowedExtensions : []).map(normalizeImageExtension).filter(Boolean));
  if (!_0x5d2457.size || !_0x5d2457.has("png")) {
    return _0x25018c;
  }
  const _0x3d50e2 = resolveImageExtension(_0x25018c, _0x166450);
  if (!_0x3d50e2 || _0x5d2457.has(_0x3d50e2)) {
    return _0x25018c;
  }
  const _0x109a09 = await convertImageBlobToPngBlob(_0x25018c);
  if (!_0x109a09) {
    throw new Error("中转站素材上传失败：无法将 ." + _0x3d50e2 + " 图片转换为支持的 PNG 格式");
  }
  return _0x109a09;
}
async function _processSingle(_0x8e69fd, _0x6268a3, _0x370968) {
  const {
    compress = true,
    maxDim = 2048,
    quality = 0.9,
    provider = DEFAULT_IMAGE_UPLOAD_PROVIDER,
    fallbackCompressOnError = false,
    fallbackMaxDim = 2048,
    fallbackQuality = 0.9
  } = _0x370968 || {};
  if (isProviderAssetIdentifier(_0x8e69fd)) {
    return _0x8e69fd;
  }
  const _0x45ca08 = _0x370968?.forceProviderUpload === true;
  if (!_0x45ca08 && isConfiguredObjectStoragePublicUrl(_0x8e69fd)) {
    return _0x8e69fd;
  }
  const _0x44d516 = isConfiguredObjectStorageEnabled() && !_0x45ca08;
  if (!_0x44d516 && provider === "runninghub" && isReusableRunningHubUrl(_0x8e69fd, _0x370968?.apiUrl)) {
    return _0x8e69fd;
  }
  if (!_0x44d516 && provider === "apimart" && isApimartReusableUrl(_0x8e69fd)) {
    return _0x8e69fd;
  }
  const _0x14fe2a = async _0x5c8531 => {
    if (_0x44d516 || provider === OBJECT_STORAGE_UPLOAD_PROVIDER) {
      return await uploadPublicMediaToConfiguredObjectStorage("image", _0x5c8531, {
        ...(_0x370968 || {}),
        fileName: _0x370968?.filename || _0x370968?.fileName || "image.png"
      });
    }
    if (provider === "runninghub") {
      return await uploadToRunningHub(_0x5c8531, _0x6268a3, _0x370968 || {});
    }
    if (isCustomProviderAssetUploadProvider(provider)) {
      const _0x3890dc = await normalizeCustomProviderImageBlob(_0x5c8531, _0x8e69fd, _0x370968);
      return await uploadToCustomProviderAsset(_0x3890dc, _0x6268a3, {
        ...(_0x370968 || {}),
        filename: _0x370968?.filename || "image." + guessImageExtension(_0x8e69fd)
      });
    }
    if (provider === "apimart") {
      return await uploadImageToApimart(_0x5c8531, {
        ...(_0x370968 || {}),
        apiKey: _0x6268a3
      });
    }
    if (provider === "grsai") {
      return await uploadImageToBed(_0x5c8531, _0x6268a3, {
        ...(_0x370968 || {}),
        preferFree: false
      });
    }
    if (isFreeImageHostProvider(provider)) {
      return await uploadImageToBed(_0x5c8531, "", {
        ...(_0x370968 || {}),
        preferFree: true
      });
    }
    return await uploadImageToBed(_0x5c8531, "", {
      ...(_0x370968 || {}),
      preferFree: true
    });
  };
  const _0x588cc5 = async _0x1c4677 => {
    const _0x500b24 = normalizeRetryCount(_0x370968?.uploadRetries);
    const _0x426b81 = normalizeDelayMs(_0x370968?.retryDelayMs);
    for (let _0x303483 = 0;; _0x303483++) {
      try {
        const _0x35917c = String((await _0x14fe2a(_0x1c4677)) || "").trim();
        if (!_0x35917c) {
          const _0x2f5e93 = new Error(provider + " 图片上传失败: 未返回可用文件 URL，请重试");
          _0x2f5e93.retryable = true;
          throw _0x2f5e93;
        }
        return _0x35917c;
      } catch (_0x32b17f) {
        if (_0x303483 >= _0x500b24 || !isRetryableImageUploadError(_0x32b17f)) {
          throw _0x32b17f;
        }
        await sleep(_0x426b81 * (_0x303483 + 1));
      }
    }
  };
  if (compress) {
    let _0x4ce6a1;
    try {
      _0x4ce6a1 = await compressImage(_0x8e69fd, maxDim, quality);
    } catch (_0x4f765d) {
      _0x4ce6a1 = await a88_0x4cdd00(_0x8e69fd, {
        provider: "remote",
        buildUrl: false,
        responseType: "blob"
      });
    }
    return await _0x588cc5(_0x4ce6a1);
  }
  if (fallbackCompressOnError) {
    try {
      const _0x6315b6 = await a88_0x4cdd00(_0x8e69fd, {
        provider: "remote",
        buildUrl: false,
        responseType: "blob"
      });
      return await _0x588cc5(_0x6315b6);
    } catch (_0x2220b2) {
      const _0x423e5a = await compressImage(_0x8e69fd, fallbackMaxDim, fallbackQuality);
      return await _0x588cc5(_0x423e5a);
    }
  }
  const _0x54cabc = await a88_0x4cdd00(_0x8e69fd, {
    provider: "remote",
    buildUrl: false,
    responseType: "blob"
  });
  return await _0x588cc5(_0x54cabc);
}
async function uploadToTelegraph(_0x4ff36a) {
  const _0x5727a5 = new FormData();
  _0x5727a5.append("file", _0x4ff36a, "image.png");
  const _0x57e2c9 = "https://telegra.ph/upload";
  const _0x4804ac = "/api/v2/proxy/upload?apiUrl=" + encodeURIComponent(_0x57e2c9);
  const _0x30cb17 = await a88_0x71f0d6(_0x4804ac, _0x5727a5, {
    provider: "telegraph"
  });
  if (Array.isArray(_0x30cb17) && _0x30cb17[0]?.src) {
    return "https://telegra.ph" + _0x30cb17[0].src;
  }
  throw new Error("Telegraph 返回格式异常");
}
function isFreeImageHostProvider(_0x5389aa) {
  const _0x49dc17 = String(_0x5389aa || "").trim();
  const _0x39865c = _0x49dc17.toLowerCase().replace(/[\s_-]+/g, "");
  return _0x49dc17 === "免费图床" || _0x39865c === "freeimagehost";
}
async function uploadToQiniu(_0x6c152, _0x348aa1) {
  const _0x767131 = {
    "Content-Type": "application/json"
  };
  if (_0x348aa1) {
    _0x767131.Authorization = "Bearer " + _0x348aa1;
  }
  const _0x4cb355 = await a88_0x71f0d6("https://grsai.dakka.com.cn/client/resource/newUploadTokenZH", {
    sux: "png"
  }, {
    provider: "grsai",
    buildUrl: false,
    headers: _0x767131
  });
  if (!_0x4cb355.data) {
    throw new Error("GRSAI 返回了无效的上传凭证");
  }
  const {
    token: _0x4a4f56,
    key: _0x435187,
    url: _0x27ed80,
    domain: _0x251df4
  } = _0x4cb355.data;
  const _0x1d9ff5 = new FormData();
  _0x1d9ff5.append("token", _0x4a4f56);
  _0x1d9ff5.append("key", _0x435187);
  _0x1d9ff5.append("file", _0x6c152, "image.png");
  await a88_0x71f0d6(_0x27ed80, _0x1d9ff5, {
    provider: "qiniu",
    buildUrl: false
  });
  return _0x251df4 + "/" + _0x435187;
}
export async function uploadImageToBed(_0xa70c17, _0x18853d, _0x1a55f0 = {}) {
  const {
    preferFree = false
  } = _0x1a55f0;
  if (isConfiguredObjectStorageEnabled()) {
    return await uploadPublicMediaToConfiguredObjectStorage("image", _0xa70c17, _0x1a55f0);
  }
  if (!preferFree && _0x18853d) {
    try {
      return await uploadToQiniu(_0xa70c17, _0x18853d);
    } catch {
      return await uploadToTelegraph(_0xa70c17);
    }
  }
  try {
    return await uploadToFreeImageHost(_0xa70c17, _0x1a55f0);
  } catch (_0x51ca9e) {
    try {
      return await uploadToTelegraph(_0xa70c17);
    } catch (_0x3f096e) {
      throw new Error("免费图床上传失败：" + (_0x3f096e?.message || _0x51ca9e?.message || "未知错误"));
    }
  }
}
export async function uploadToRunningHub(_0x290603, _0x1ec63a, _0x585c15 = {}) {
  if (isConfiguredObjectStorageEnabled()) {
    return await uploadPublicMediaToConfiguredObjectStorage("image", _0x290603, _0x585c15);
  }
  if (!_0x1ec63a) {
    throw new Error("RunningHUB API Key 未配置，无法上传图片");
  }
  const _0x2f049a = String(_0x585c15?.apiUrl || "https://www.runninghub.cn").trim().replace(/\/+$/, "");
  const _0x70580 = _0x2f049a + "/openapi/v2/media/upload/binary";
  const _0x131a53 = "/api/v2/proxy/upload?apiUrl=" + encodeURIComponent(_0x70580);
  const _0x14b287 = new FormData();
  _0x14b287.append("file", _0x290603, "image.png");
  const _0x34fad5 = await a88_0x71f0d6(_0x131a53, _0x14b287, {
    headers: {
      Authorization: "Bearer " + _0x1ec63a
    },
    provider: "runninghub"
  });
  if (hasRunningHubUploadFailureCode(_0x34fad5)) {
    throw new Error("RunningHUB 上传失败: " + getRunningHubUploadErrorMessage(_0x34fad5));
  }
  const _0x249334 = getRunningHubUploadUrl(_0x34fad5);
  if (!_0x249334) {
    throw new Error("RunningHUB 上传失败: 未返回可用文件 URL，请重试");
  }
  return _0x249334;
}
async function _processInputImagesOrdered(_0x2bfaba, _0x1bbe67, _0x3f684d = {}) {
  const _0x56917b = _0x3f684d?.applyInputQualityProfile === true ? resolveImageInputUploadQualityOptions(_0x3f684d) : _0x3f684d || {};
  const {
    compress = true,
    maxDim = 2048,
    quality = 0.9,
    provider = DEFAULT_IMAGE_UPLOAD_PROVIDER
  } = _0x56917b;
  if (!_0x2bfaba || _0x2bfaba.length === 0) {
    return [];
  }
  const _0x468863 = {
    ..._0x56917b,
    compress: compress,
    maxDim: maxDim,
    quality: quality,
    provider: provider
  };
  const _0x327ea3 = _0x468863.strictUpload === true;
  const _0x3e229e = _0x468863.forceProviderUpload === true;
  const _0x39bf29 = isConfiguredObjectStorageEnabled() && !_0x3e229e;
  const _0x471044 = new Array(_0x2bfaba.length).fill("");
  const _0x336771 = [];
  for (let _0x849313 = 0; _0x849313 < _0x2bfaba.length; _0x849313++) {
    const _0x2080ed = String(_0x2bfaba[_0x849313] || "").trim();
    if (!_0x2080ed) {
      continue;
    }
    if (isProviderAssetIdentifier(_0x2080ed)) {
      _0x471044[_0x849313] = _0x2080ed;
      continue;
    }
    if (!_0x3e229e && isConfiguredObjectStoragePublicUrl(_0x2080ed)) {
      _0x471044[_0x849313] = _0x2080ed;
      continue;
    }
    if (!_0x39bf29 && provider === "runninghub" && isReusableRunningHubUrl(_0x2080ed, _0x468863.apiUrl)) {
      _0x471044[_0x849313] = _0x2080ed;
      continue;
    }
    if (!_0x39bf29 && provider === "apimart" && isApimartReusableUrl(_0x2080ed)) {
      _0x471044[_0x849313] = _0x2080ed;
      continue;
    }
    if (!_0x39bf29 && isCustomProviderAssetUploadProvider(provider) && isReusableCustomProviderAssetUrl(_0x2080ed, _0x468863.apiUrl)) {
      _0x471044[_0x849313] = _0x2080ed;
      continue;
    }
    const _0x2c9d69 = _getUploadPromise(_0x2080ed, _0x1bbe67, _0x468863);
    const _0x4c857f = _0x2c9d69.then(_0x1a7c08 => {
      _0x471044[_0x849313] = String(_0x1a7c08 || "").trim();
    });
    _0x336771.push(_0x327ea3 ? _0x4c857f : _0x4c857f.catch(() => {
      _0x471044[_0x849313] = "";
    }));
  }
  if (_0x336771.length > 0) {
    if (_0x327ea3) {
      await Promise.all(_0x336771);
    } else {
      await Promise.allSettled(_0x336771);
    }
  }
  return _0x471044;
}
export async function processInputImages(_0x55b953, _0x97d0c3, _0x3662cf = {}) {
  const _0x4f0d78 = await _processInputImagesOrdered(_0x55b953, _0x97d0c3, {
    ..._0x3662cf,
    strictUpload: _0x3662cf.strictUpload !== false
  });
  return _0x4f0d78.filter(Boolean);
}
export async function processInputImagesPreserveOrder(_0x1aadac, _0x205acb, _0xaecdb5 = {}) {
  return await _processInputImagesOrdered(_0x1aadac, _0x205acb, _0xaecdb5);
}