import { post as a47_0x41778d } from "./requester.js";
import { DEFAULT_APIMART_API_URL } from "../src/modules/providers.js";
import { isConfiguredObjectStorageEnabled, uploadToConfiguredObjectStorage } from "./objectStorageApi.js";
const DEFAULT_APIMART_BASE_URL = DEFAULT_APIMART_API_URL;
const APIMART_UPLOAD_CDN_HOSTS = Object.freeze(["cdn.apimart.ai", "upload.apimart.ai", "cdn.apib.ai", "upload.apib.ai", "cdn.aishuch.com", "upload.aishuch.com"]);
export function normalizeApimartBaseUrl(_0x3e4e6a) {
  return String(_0x3e4e6a || DEFAULT_APIMART_BASE_URL).trim().replace(/\/+$/, "").replace(/\/v1$/i, "");
}
function getBlobType(_0x414d4c, _0x5dcec6) {
  return String(_0x414d4c?.type || _0x5dcec6 || "application/octet-stream").trim();
}
function extensionFromContentType(_0x1030d9, _0x5541be) {
  const _0xb2413e = String(_0x1030d9 || "").toLowerCase();
  const _0xae95a7 = {
    "image/jpeg": "jpg",
    "image/jpg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/gif": "gif",
    "image/bmp": "bmp"
  };
  return _0xae95a7[_0xb2413e] || String(_0x5541be || "").replace(/^\./, "") || "bin";
}
function isApimartUploadUrl(_0x260e47) {
  try {
    const _0x3c2fb0 = new URL(String(_0x260e47 || ""));
    return APIMART_UPLOAD_CDN_HOSTS.includes(_0x3c2fb0.hostname.toLowerCase());
  } catch {
    return false;
  }
}
export function isApimartAssetUrl(_0x6c2892) {
  return /^asset:\/\//i.test(String(_0x6c2892 || "").trim());
}
export function isApimartReusableUrl(_0x539ead) {
  return isApimartAssetUrl(_0x539ead) || isApimartUploadUrl(_0x539ead);
}
async function uploadBlobToApimart(_0x19f562, _0x57f41c = {}) {
  if (!_0x19f562) {
    throw new Error("APIMART 上传文件不能为空");
  }
  if (isConfiguredObjectStorageEnabled()) {
    return await uploadToConfiguredObjectStorage(_0x19f562, _0x57f41c);
  }
  const _0x330a0c = String(_0x57f41c.apiKey || "").trim().replace(/^Bearer\s+/i, "");
  if (!_0x330a0c) {
    throw new Error("APIMART API Key 未配置，无法上传素材");
  }
  const _0x58ac2a = getBlobType(_0x19f562, _0x57f41c.contentType);
  if (!/^image\//i.test(_0x58ac2a)) {
    throw new Error("APIMART 仅提供图片上传；视频和音频请使用 RunningHub 上传");
  }
  const _0x5a9004 = extensionFromContentType(_0x58ac2a, _0x57f41c.fileExtension);
  const _0x4de92e = new FormData();
  _0x4de92e.append("file", _0x19f562, _0x57f41c.filename || "upload." + _0x5a9004);
  _0x4de92e.append("contentType", _0x58ac2a);
  _0x4de92e.append("fileExtension", _0x5a9004);
  _0x4de92e.append("permanent", _0x57f41c.permanent === true ? "1" : "0");
  _0x4de92e.append("apiKey", _0x330a0c);
  _0x4de92e.append("apiUrl", normalizeApimartBaseUrl(_0x57f41c.apiUrl));
  const _0x1fa29d = await a47_0x41778d("/api/v2/proxy/apimart-upload", _0x4de92e, {
    provider: "apimart",
    timeout: _0x57f41c.uploadTimeout || 300000
  });
  const _0x9acbeb = _0x1fa29d?.cdnUrl || _0x1fa29d?.url || "";
  if (!_0x9acbeb) {
    throw new Error("APIMART 上传返回 URL 为空");
  }
  return String(_0x9acbeb).trim();
}
export async function uploadImageToApimart(_0x37fc92, _0x2dc29e = {}) {
  return await uploadBlobToApimart(_0x37fc92, {
    ..._0x2dc29e,
    contentType: _0x2dc29e.contentType || getBlobType(_0x37fc92, "image/jpeg"),
    fileExtension: _0x2dc29e.fileExtension || "jpg"
  });
}
export function isApimartUploadedUrl(_0x4128d7) {
  return isApimartUploadUrl(_0x4128d7);
}