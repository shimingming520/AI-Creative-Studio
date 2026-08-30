import { saveMediaDownload } from "../services/downloadSaveService.js";
import { localPathToUrl, normalizeLocalPath } from "../utils/localMediaPath.js";
const IMAGE_MIME_EXTENSIONS = Object.freeze({
  "image/avif": "avif",
  "image/gif": "gif",
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/svg+xml": "svg",
  "image/webp": "webp"
});
function normalizeText(_0x778e11) {
  return String(_0x778e11 ?? "").trim();
}
function escapeHtml(_0x5e563f) {
  return String(_0x5e563f ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll("\"", "&quot;").replaceAll("'", "&#39;");
}
function resolveImageExtension(_0x3dc6af) {
  const _0x289fb3 = normalizeText(_0x3dc6af);
  const _0x5e5da4 = _0x289fb3.match(/^data:([^;,]+)/i)?.[1]?.toLowerCase();
  if (_0x5e5da4 && IMAGE_MIME_EXTENSIONS[_0x5e5da4]) {
    return IMAGE_MIME_EXTENSIONS[_0x5e5da4];
  }
  return _0x289fb3.split(/[?#]/, 1)[0].match(/\.([a-z0-9]{2,5})$/i)?.[1]?.toLowerCase() || "png";
}
function sanitizeFilenameBase(_0x642151) {
  return normalizeText(_0x642151).replace(/[\\/:*?"<>|]+/g, "-").replace(/-+/g, "-").replace(/[.\s-]+$/g, "").slice(0, 96) || "生成图片";
}
export function buildWorkspaceImageDownloadPayload({
  imageRef: _0x22370b,
  filenameBase = "生成图片",
  title = "下载图片"
} = {}) {
  const _0xcf7048 = normalizeText(_0x22370b);
  if (!_0xcf7048) {
    return null;
  }
  const _0x4e5828 = normalizeLocalPath(_0xcf7048);
  return {
    kind: "image",
    localPath: _0x4e5828,
    url: localPathToUrl(_0x4e5828) || _0xcf7048,
    filename: sanitizeFilenameBase(filenameBase) + "." + resolveImageExtension(_0xcf7048),
    title: normalizeText(title) || "下载图片"
  };
}
export async function saveWorkspaceImageDownload({
  imageRef: _0x52cf20,
  filenameBase: _0x12cf41,
  title: _0x522cf7,
  saveMedia = saveMediaDownload
} = {}) {
  const _0x586b1d = buildWorkspaceImageDownloadPayload({
    imageRef: _0x52cf20,
    filenameBase: _0x12cf41,
    title: _0x522cf7
  });
  if (!_0x586b1d) {
    throw new Error("当前没有可下载的图片。");
  }
  if (typeof saveMedia !== "function") {
    throw new Error("图片保存服务尚未初始化。");
  }
  return await saveMedia(_0x586b1d);
}
export function renderWorkspaceImageDownloadButton({
  action = "download-asset-image",
  enabled = false,
  className = "",
  label = "下载图片"
} = {}) {
  if (!enabled) {
    return "";
  }
  const _0x483d00 = normalizeText(className);
  const _0x44dd33 = normalizeText(label) || "下载图片";
  return "<button type=\"button\" class=\"workspace-image-download-button" + (_0x483d00 ? " " + escapeHtml(_0x483d00) : "") + "\" data-story-action=\"" + escapeHtml(action) + "\" aria-label=\"" + escapeHtml(_0x44dd33) + "\" title=\"" + escapeHtml(_0x44dd33) + "\"><svg viewBox=\"0 0 24 24\" fill=\"none\" aria-hidden=\"true\"><path d=\"M12 3v11m0 0 4-4m-4 4-4-4M5 15v4h14v-4\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/></svg></button>";
}
export async function runWorkspaceImageDownloadAction(_0x134ff6, _0x5141ca) {
  if (!_0x134ff6 || typeof _0x5141ca !== "function") {
    return null;
  }
  if (_0x134ff6.classList?.contains?.("is-pending")) {
    return null;
  }
  const _0xa2ad5f = Boolean(_0x134ff6.disabled);
  const _0x2229c0 = _0x134ff6.getAttribute?.("aria-busy");
  _0x134ff6.disabled = true;
  _0x134ff6.classList?.add?.("is-pending");
  _0x134ff6.setAttribute?.("aria-busy", "true");
  try {
    return await _0x5141ca();
  } finally {
    _0x134ff6.disabled = _0xa2ad5f;
    _0x134ff6.classList?.remove?.("is-pending");
    if (_0x2229c0 === null || _0x2229c0 === undefined) {
      _0x134ff6.removeAttribute?.("aria-busy");
    } else {
      _0x134ff6.setAttribute?.("aria-busy", _0x2229c0);
    }
  }
}