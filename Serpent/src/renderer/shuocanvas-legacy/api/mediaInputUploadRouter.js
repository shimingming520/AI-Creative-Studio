import { createRunningHubMediaUploadApiKeyMissingError } from "./mediaUploadErrors.js";
import { isConfiguredObjectStorageEnabled, isConfiguredObjectStoragePublicUrl, OBJECT_STORAGE_UPLOAD_PROVIDER } from "./objectStorageApi.js";
const USER_MEDIA_STORAGE_PROVIDERS = Object.freeze({
  FREE_IMAGE_HOST: "freeImageHost",
  RUNNINGHUB: "runninghub",
  OBJECT_STORAGE: OBJECT_STORAGE_UPLOAD_PROVIDER
});
export const DEFAULT_MODEL_API_MEDIA_UPLOAD_PROVIDERS = Object.freeze({
  image: USER_MEDIA_STORAGE_PROVIDERS.FREE_IMAGE_HOST,
  video: USER_MEDIA_STORAGE_PROVIDERS.RUNNINGHUB,
  audio: USER_MEDIA_STORAGE_PROVIDERS.RUNNINGHUB
});
function normalizeMediaUrl(_0x5ac49d) {
  return String(_0x5ac49d || "").trim();
}
function isPrivateIpv4Host(_0x229b0d) {
  const _0x541d1f = String(_0x229b0d || "").split(".").map(_0x1368c2 => Number(_0x1368c2));
  if (_0x541d1f.length !== 4 || _0x541d1f.some(_0x1e7ba8 => !Number.isInteger(_0x1e7ba8))) {
    return false;
  }
  const [_0x333cef, _0x35cff0] = _0x541d1f;
  return _0x333cef === 10 || _0x333cef === 127 || _0x333cef === 172 && _0x35cff0 >= 16 && _0x35cff0 <= 31 || _0x333cef === 192 && _0x35cff0 === 168 || _0x333cef === 169 && _0x35cff0 === 254 || _0x333cef === 0 && _0x35cff0 === 0;
}
export function isPublicHttpMediaUrl(_0x4b9d6d) {
  const _0x300bcd = normalizeMediaUrl(_0x4b9d6d);
  if (!_0x300bcd) {
    return false;
  }
  try {
    const _0x2c9579 = new URL(_0x300bcd);
    if (_0x2c9579.protocol !== "http:" && _0x2c9579.protocol !== "https:") {
      return false;
    }
    const _0x359a3 = _0x2c9579.hostname.toLowerCase();
    if (_0x359a3 === "localhost" || _0x359a3 === "0.0.0.0" || _0x359a3 === "::1" || _0x359a3 === "[::1]" || _0x359a3.endsWith(".local") || isPrivateIpv4Host(_0x359a3)) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}
function isReusableProviderMediaUrl(_0x560633) {
  return /^asset:\/\//i.test(normalizeMediaUrl(_0x560633));
}
function isProviderUploadRequired(_0x551c1f = {}) {
  return _0x551c1f.forceProviderUpload === true || _0x551c1f.uploadOptions?.forceProviderUpload === true;
}
export function isReusableModelApiMediaUrl(_0x1b11b7) {
  return isPublicHttpMediaUrl(_0x1b11b7) || isReusableProviderMediaUrl(_0x1b11b7);
}
function shouldReuseMediaUrl(_0x2c790f, _0x800999, _0x26fbd9 = {}) {
  if (isReusableProviderMediaUrl(_0x2c790f)) {
    return true;
  }
  if (!isPublicHttpMediaUrl(_0x2c790f)) {
    return false;
  }
  if (!isProviderUploadRequired(_0x26fbd9) && isConfiguredObjectStoragePublicUrl(_0x2c790f)) {
    return true;
  }
  if (_0x800999?.provider === USER_MEDIA_STORAGE_PROVIDERS.OBJECT_STORAGE) {
    return false;
  }
  if (typeof _0x26fbd9.reusePublicUrls === "boolean") {
    return _0x26fbd9.reusePublicUrls;
  }
  return _0x800999?.provider === USER_MEDIA_STORAGE_PROVIDERS.RUNNINGHUB;
}
export function resolveUserMediaStorageUploadTarget(_0x4ef45f = {}, _0x20f8ab = {}, _0x2a4630 = "") {
  const _0x425cc4 = isProviderUploadRequired(_0x20f8ab);
  if (isConfiguredObjectStorageEnabled() && !_0x425cc4) {
    return {
      provider: USER_MEDIA_STORAGE_PROVIDERS.OBJECT_STORAGE
    };
  }
  const _0x2d29ee = String(_0x2a4630 || _0x20f8ab.mediaKind || "").trim().toLowerCase();
  const _0x28a74d = _0x4ef45f.resolveUserMediaStorageUploadTarget;
  if (!_0x425cc4 && typeof _0x28a74d === "function") {
    const _0x3713e0 = _0x28a74d({
      ..._0x20f8ab,
      ...(_0x2d29ee ? {
        mediaKind: _0x2d29ee
      } : {})
    });
    const _0x1f125d = String(_0x3713e0?.provider || "").trim();
    if (_0x1f125d) {
      return {
        ..._0x3713e0,
        provider: _0x1f125d
      };
    }
  }
  const _0x3f1ecd = String(_0x20f8ab.fallbackProvider || "").trim() || DEFAULT_MODEL_API_MEDIA_UPLOAD_PROVIDERS[_0x2d29ee] || USER_MEDIA_STORAGE_PROVIDERS.RUNNINGHUB;
  return {
    provider: _0x3f1ecd
  };
}
export function resolveRunningHubMediaUploadApiKey(_0x20aa32 = {}, _0x2f8844 = {}) {
  const _0x266040 = String(_0x2f8844.apiKey || "").trim().replace(/^Bearer\s+/i, "");
  if (_0x266040) {
    return _0x266040;
  }
  const _0x44dff6 = String(_0x2f8844.providerProfileId || "runninghub").trim();
  const _0x2d8365 = typeof _0x20aa32.getProviderConfig === "function" ? _0x20aa32.getProviderConfig(_0x44dff6) || {} : {};
  return String(_0x2d8365.modelApiKey || _0x2d8365.apiKey || "").trim().replace(/^Bearer\s+/i, "");
}
function resolveMediaProcessor(_0x13d966, _0x1e6883 = {}) {
  if (_0x13d966 === "image") {
    return _0x1e6883.processInputImages;
  }
  if (_0x13d966 === "video") {
    return _0x1e6883.processInputVideos;
  }
  if (_0x13d966 === "audio") {
    return _0x1e6883.processInputAudios;
  }
  return null;
}
function assertMediaUploadAvailable(_0x123024, _0x39a316, _0x1a7a79) {
  if (_0x123024 === "image" && typeof _0x39a316.processInputImages !== "function") {
    throw new Error(_0x1a7a79 + " image input upload is not available");
  }
  if (_0x123024 === "video" && typeof _0x39a316.processInputVideos !== "function") {
    throw new Error(_0x1a7a79 + " video input upload is not available");
  }
  if (_0x123024 === "audio" && typeof _0x39a316.processInputAudios !== "function") {
    throw new Error(_0x1a7a79 + " audio input upload is not available");
  }
}
async function uploadViaTarget(_0x70a9e7, _0x267f4d, _0x3d42e5, _0x151622, _0x20b4b6 = {}) {
  const _0x251394 = String(_0x3d42e5?.provider || "").trim();
  assertMediaUploadAvailable(_0x70a9e7, _0x151622, _0x251394);
  const _0x3cc5a1 = resolveMediaProcessor(_0x70a9e7, _0x151622);
  let _0xbe5856 = String(_0x3d42e5?.apiKey || _0x20b4b6.apiKey || "").trim();
  if (_0x251394 === USER_MEDIA_STORAGE_PROVIDERS.RUNNINGHUB) {
    _0xbe5856 = resolveRunningHubMediaUploadApiKey(_0x151622, {
      ..._0x20b4b6,
      apiKey: _0xbe5856
    });
    if (!_0xbe5856) {
      throw createRunningHubMediaUploadApiKeyMissingError(_0x70a9e7);
    }
  }
  const _0x3edfa9 = {
    ...(_0x20b4b6.uploadOptions || {}),
    ...(_0x3d42e5?.uploadOptions || {}),
    provider: _0x251394,
    strictUpload: _0x20b4b6.strictUpload !== false,
    ...(_0x3d42e5?.apiUrl || _0x20b4b6.apiUrl ? {
      apiUrl: _0x3d42e5?.apiUrl || _0x20b4b6.apiUrl
    } : {})
  };
  return await _0x3cc5a1(_0x267f4d, _0xbe5856, _0x3edfa9);
}
export async function uploadModelApiMediaInputs(_0x78bf26, _0x485765, _0x15a6bc, _0x45ddaf = {}) {
  const _0x47e53b = String(_0x78bf26 || "").trim().toLowerCase();
  if (!["image", "video", "audio"].includes(_0x47e53b)) {
    throw new Error("Unsupported media upload kind: " + (_0x47e53b || _0x78bf26));
  }
  const _0x14b68a = Array.isArray(_0x485765) ? _0x485765.map(normalizeMediaUrl).filter(Boolean) : [];
  if (_0x14b68a.length === 0) {
    return [];
  }
  const _0x35e299 = resolveUserMediaStorageUploadTarget(_0x15a6bc, _0x45ddaf, _0x47e53b);
  const _0x40a534 = new Array(_0x14b68a.length).fill("");
  const _0x145f48 = [];
  const _0x5ac12d = [];
  _0x14b68a.forEach((_0x4a0265, _0x3db1af) => {
    if (shouldReuseMediaUrl(_0x4a0265, _0x35e299, _0x45ddaf)) {
      _0x40a534[_0x3db1af] = _0x4a0265;
      return;
    }
    _0x5ac12d.push(_0x3db1af);
    _0x145f48.push(_0x4a0265);
  });
  if (_0x145f48.length === 0) {
    return _0x40a534.filter(Boolean);
  }
  const _0x65d686 = await uploadViaTarget(_0x47e53b, _0x145f48, _0x35e299, _0x15a6bc, _0x45ddaf);
  _0x5ac12d.forEach((_0x81bdd0, _0x21743d) => {
    _0x40a534[_0x81bdd0] = String(_0x65d686?.[_0x21743d] || "").trim();
  });
  const _0xfed71a = _0x40a534.filter(Boolean);
  if (_0x45ddaf.strictUpload !== false && _0xfed71a.length !== _0x14b68a.length) {
    throw new Error(_0x35e299.provider + " " + _0x47e53b + " upload failed");
  }
  return _0xfed71a;
}