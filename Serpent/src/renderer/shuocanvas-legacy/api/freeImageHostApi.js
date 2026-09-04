import { post as a85_0x2f9222 } from "./requester.js";
import { isConfiguredObjectStorageEnabled, uploadPublicMediaToConfiguredObjectStorage } from "./objectStorageApi.js";
const DEFAULT_FREE_IMAGE_HOST_UPLOAD_URL = "https://uguu.se/upload";
const DEFAULT_FILE_NAME = "image.png";
function buildUploadProxyUrl(_0x296623) {
  return "/api/v2/proxy/upload?apiUrl=" + encodeURIComponent(_0x296623);
}
function isPlainObject(_0xb6ceaf) {
  return !!_0xb6ceaf && typeof _0xb6ceaf === "object" && !Array.isArray(_0xb6ceaf);
}
function normalizeUrl(_0x477383) {
  const _0x142053 = String(_0x477383 || "").trim();
  if (!/^https?:\/\//i.test(_0x142053)) {
    return "";
  }
  return _0x142053;
}
function pickUrlFromRecord(_0x40c446) {
  if (!isPlainObject(_0x40c446)) {
    return "";
  }
  return normalizeUrl(_0x40c446.url || _0x40c446.downloadUrl || _0x40c446.download_url || _0x40c446.fileUrl || _0x40c446.file_url || _0x40c446.src);
}
export function pickFreeImageHostUrl(_0x23d11f) {
  if (typeof _0x23d11f === "string") {
    return normalizeUrl(_0x23d11f);
  }
  if (Array.isArray(_0x23d11f)) {
    for (const _0x3cdec6 of _0x23d11f) {
      const _0x4933c7 = typeof _0x3cdec6 === "string" ? normalizeUrl(_0x3cdec6) : pickUrlFromRecord(_0x3cdec6);
      if (_0x4933c7) {
        return _0x4933c7;
      }
    }
    return "";
  }
  if (!isPlainObject(_0x23d11f)) {
    return "";
  }
  const _0x34109c = pickUrlFromRecord(_0x23d11f);
  if (_0x34109c) {
    return _0x34109c;
  }
  const _0x459589 = Array.isArray(_0x23d11f.files) ? _0x23d11f.files : [];
  for (const _0xf0e02e of _0x459589) {
    const _0x3e3ca2 = typeof _0xf0e02e === "string" ? normalizeUrl(_0xf0e02e) : pickUrlFromRecord(_0xf0e02e);
    if (_0x3e3ca2) {
      return _0x3e3ca2;
    }
  }
  return "";
}
async function uploadToUguuImageHost(_0x3263dc, _0x1fd6d3 = {}) {
  const _0x2c26dc = new FormData();
  const _0x15f5c7 = String(_0x1fd6d3.fileName || _0x3263dc.name || DEFAULT_FILE_NAME).trim() || DEFAULT_FILE_NAME;
  _0x2c26dc.append("files[]", _0x3263dc, _0x15f5c7);
  const _0x219962 = _0x1fd6d3.uploadUrl || DEFAULT_FREE_IMAGE_HOST_UPLOAD_URL;
  const _0x48729b = _0x1fd6d3.useProxy === false ? _0x219962 : buildUploadProxyUrl(_0x219962);
  const _0x303c3f = await a85_0x2f9222(_0x48729b, _0x2c26dc, {
    provider: "free-image-host",
    buildUrl: _0x1fd6d3.useProxy === false ? false : true,
    timeout: Number(_0x1fd6d3.timeout || 60000),
    responseType: "auto"
  });
  const _0x3513e6 = pickFreeImageHostUrl(_0x303c3f);
  if (!_0x3513e6) {
    throw new Error("免费图床上传失败：未返回可用 URL");
  }
  return _0x3513e6;
}
export async function uploadToFreeImageHost(_0x54a03e, _0x1eae7a = {}) {
  if (!_0x54a03e) {
    throw new Error("免费图床上传失败：文件不能为空");
  }
  if (isConfiguredObjectStorageEnabled()) {
    return await uploadPublicMediaToConfiguredObjectStorage("image", _0x54a03e, _0x1eae7a);
  }
  return await uploadToUguuImageHost(_0x54a03e, _0x1eae7a);
}
export const 免费图床 = uploadToFreeImageHost;