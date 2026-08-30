import { post as a64_0xfe3d2f } from "./requester.js";
import { isConfiguredObjectStorageEnabled, uploadToConfiguredObjectStorage } from "./objectStorageApi.js";
const CUSTOM_PROVIDER_ASSET_MAX_BYTES = 104857600;
function normalizeUploadProvider(_0x25ecad) {
  return String(_0x25ecad || "").trim().toLowerCase().replace(/[\s_-]+/g, "");
}
function normalizeCustomProviderAssetExtensions(_0xd8de51) {
  if (!Array.isArray(_0xd8de51)) {
    return [];
  }
  return [...new Set(_0xd8de51.map(_0x1be858 => String(_0x1be858 || "").trim().toLowerCase().replace(/^\./, "")).filter(_0x2ae867 => /^[a-z0-9]{1,10}$/.test(_0x2ae867)))].slice(0, 16);
}
function resolveCustomProviderAssetOptions(_0x4f45df = {}) {
  const _0x50a695 = String(_0x4f45df.apiUrl || "").trim();
  if (!/^https?:\/\//i.test(_0x50a695)) {
    throw new Error("中转站素材上传缺少安全的上传地址");
  }
  const _0x5711c7 = String(_0x4f45df.multipartField || "file").trim();
  if (!/^[A-Za-z_][A-Za-z0-9_-]{0,63}$/.test(_0x5711c7)) {
    throw new Error("中转站素材上传字段无效");
  }
  const _0xc0d47c = String(_0x4f45df.responsePath || "url").trim();
  if (!/^[A-Za-z0-9_.\[\]-]{1,160}$/.test(_0xc0d47c)) {
    throw new Error("中转站素材上传返回路径无效");
  }
  const _0x2b8f35 = Number(_0x4f45df.maxBytes);
  return {
    apiUrl: _0x50a695,
    multipartField: _0x5711c7,
    responsePath: _0xc0d47c,
    allowedExtensions: normalizeCustomProviderAssetExtensions(_0x4f45df.allowedExtensions),
    maxBytes: Number.isFinite(_0x2b8f35) && _0x2b8f35 > 0 ? Math.min(CUSTOM_PROVIDER_ASSET_MAX_BYTES, Math.trunc(_0x2b8f35)) : 0,
    filename: String(_0x4f45df.filename || "").trim(),
    timeout: Number(_0x4f45df.uploadTimeout || _0x4f45df.timeout || 60000)
  };
}
function getBlobFileExtension(_0x456b90, _0x3c6753 = "bin") {
  const _0xfbf8a0 = String(_0x456b90?.name || "").trim();
  const _0x47691d = _0xfbf8a0.match(/\.([A-Za-z0-9]{1,10})$/);
  if (_0x47691d) {
    const _0x2f0f7a = _0x47691d[1].toLowerCase();
    if (_0x2f0f7a === "jpeg") {
      return "jpg";
    } else {
      return _0x2f0f7a;
    }
  }
  const _0x2ad8ca = String(_0x456b90?.type || "").trim().toLowerCase();
  const _0x2b884f = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/gif": "gif",
    "audio/mpeg": "mp3",
    "audio/mp3": "mp3",
    "audio/wav": "wav",
    "audio/x-wav": "wav",
    "video/mp4": "mp4"
  }[_0x2ad8ca];
  return _0x2b884f || _0x3c6753;
}
function getFilenameExtension(_0x16df6c) {
  const _0x3f2276 = String(_0x16df6c || "").trim().match(/\.([A-Za-z0-9]{1,10})$/);
  if (!_0x3f2276) {
    return "";
  }
  const _0x3802be = _0x3f2276[1].toLowerCase();
  if (_0x3802be === "jpeg") {
    return "jpg";
  } else {
    return _0x3802be;
  }
}
function resolveCustomProviderAssetResponseValue(_0x2dc572, _0x52bd74) {
  const _0x1f759e = String(_0x52bd74 || "").match(/[^.\[\]]+|\[(\d+)\]/g) || [];
  let _0x527e9f = _0x2dc572;
  for (const _0x4f3a2f of _0x1f759e) {
    const _0x253406 = _0x4f3a2f.startsWith("[") ? _0x4f3a2f.slice(1, -1) : _0x4f3a2f;
    if (!_0x527e9f || typeof _0x527e9f !== "object" || !Object.prototype.hasOwnProperty.call(_0x527e9f, _0x253406)) {
      return "";
    }
    _0x527e9f = _0x527e9f[_0x253406];
  }
  const _0x5f1370 = String(_0x527e9f || "").trim();
  if (/^https?:\/\//i.test(_0x5f1370)) {
    return _0x5f1370;
  } else {
    return "";
  }
}
export function isCustomProviderAssetUploadProvider(_0x1d7d0b) {
  return normalizeUploadProvider(_0x1d7d0b) === "customproviderasset";
}
export function isReusableCustomProviderAssetUrl(_0x28e8a5, _0x490152) {
  try {
    const _0x4e16f2 = new URL(String(_0x28e8a5 || "").trim());
    const _0x1b1c7f = new URL(String(_0x490152 || "").trim());
    return _0x4e16f2.origin === _0x1b1c7f.origin && /\/assets\/uploads\//i.test(_0x4e16f2.pathname);
  } catch {
    return false;
  }
}
export async function uploadToCustomProviderAsset(_0x1f1bbc, _0x1c9080, _0x234800 = {}) {
  if (!_0x1f1bbc) {
    throw new Error("中转站素材上传失败：文件不能为空");
  }
  if (isConfiguredObjectStorageEnabled() && _0x234800.forceProviderUpload !== true) {
    return await uploadToConfiguredObjectStorage(_0x1f1bbc, _0x234800);
  }
  if (!_0x1c9080) {
    throw new Error("中转站素材上传失败：API Key 未配置");
  }
  const _0x38e7c8 = resolveCustomProviderAssetOptions(_0x234800);
  if (_0x38e7c8.maxBytes && Number(_0x1f1bbc.size || 0) > _0x38e7c8.maxBytes) {
    throw new Error("中转站素材上传失败：文件超过 " + Math.ceil(_0x38e7c8.maxBytes / 1048576) + "MB 限制");
  }
  const _0x561c7d = getFilenameExtension(_0x38e7c8.filename);
  const _0x4e5ff0 = getBlobFileExtension(_0x1f1bbc, _0x561c7d || "bin");
  if (_0x38e7c8.allowedExtensions.length > 0 && !_0x38e7c8.allowedExtensions.includes(_0x4e5ff0)) {
    throw new Error("中转站素材上传失败：不支持 ." + _0x4e5ff0 + " 格式");
  }
  const _0x37f781 = _0x561c7d === _0x4e5ff0 ? _0x38e7c8.filename : "asset." + _0x4e5ff0;
  const _0x3e5927 = new FormData();
  _0x3e5927.append(_0x38e7c8.multipartField, _0x1f1bbc, _0x37f781);
  const _0x34a4ca = "/api/v2/proxy/upload?apiUrl=" + encodeURIComponent(_0x38e7c8.apiUrl);
  const _0x256a59 = await a64_0xfe3d2f(_0x34a4ca, _0x3e5927, {
    headers: {
      Authorization: "Bearer " + _0x1c9080
    },
    provider: "custom-provider-asset",
    timeout: Number.isFinite(_0x38e7c8.timeout) && _0x38e7c8.timeout > 0 ? Math.min(300000, Math.trunc(_0x38e7c8.timeout)) : 60000
  });
  const _0x332d71 = resolveCustomProviderAssetResponseValue(_0x256a59, _0x38e7c8.responsePath);
  if (!_0x332d71) {
    throw new Error("中转站素材上传失败：未返回可用 URL");
  }
  return _0x332d71;
}