import { localPathToUrl } from "../utils/localMediaPath.js";
import { createReferenceFallbackThumbHtml } from "./referenceThumbnailFallback.js";
const MEDIA_KINDS = new Set(["text", "image", "video", "audio"]);
function normalizeKind(_0x111dc7) {
  const _0x4bbbab = String(_0x111dc7 || "").trim().toLowerCase();
  if (MEDIA_KINDS.has(_0x4bbbab)) {
    return _0x4bbbab;
  } else {
    return "";
  }
}
function normalizeText(_0x5b5774) {
  return String(_0x5b5774 || "").trim();
}
function escapeHtmlAttr(_0x186a38) {
  return String(_0x186a38 ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
function normalizeClassName(_0x855eeb) {
  return String(_0x855eeb || "").split(/\s+/).map(_0x2bdb07 => _0x2bdb07.replace(/[^A-Za-z0-9_-]/g, "")).filter(Boolean).join(" ");
}
function normalizeVideoMediaKey(_0xcf7f4e) {
  return normalizeText(_0xcf7f4e).replace(/^\/+/, "");
}
function getVideoItemMediaKey(_0x1bbf12) {
  return normalizeVideoMediaKey(_0x1bbf12?.localPath) || normalizeVideoMediaKey(_0x1bbf12?.displayLocalPath) || normalizeVideoMediaKey(_0x1bbf12?.originalLocalPath) || normalizeVideoMediaKey(_0x1bbf12?.videoLocalPath) || normalizeVideoMediaKey(_0x1bbf12?.videoUrl);
}
function getVideoThumbnailUrl(_0x285f23) {
  return normalizeText(_0x285f23?.thumbUrl || _0x285f23?.thumbnailUrl || _0x285f23?.firstFrameThumbUrl || _0x285f23?.firstFrameUrl || _0x285f23?.imageUrl);
}
export function resolveReferenceVideoItemByEdge(_0x44daee = {}, _0x1d2a42 = null) {
  const _0x5b8e54 = Array.isArray(_0x44daee?.videos) ? _0x44daee.videos : [];
  if (!_0x5b8e54.length) {
    return {
      item: null,
      index: -1,
      matchedByKey: false
    };
  }
  const _0xe02d38 = normalizeVideoMediaKey(_0x1d2a42?.sourceMediaKey);
  let _0x10e5ad = _0xe02d38 ? _0x5b8e54.findIndex(_0x59ff0e => getVideoItemMediaKey(_0x59ff0e) === _0xe02d38) : -1;
  const _0x2a9ddb = _0x10e5ad >= 0;
  if (!_0x2a9ddb) {
    const _0x228984 = Number(_0x44daee?.mainVideoIndex);
    const _0x138c36 = Number.isFinite(_0x228984) ? Math.max(0, Math.trunc(_0x228984)) : 0;
    _0x10e5ad = Math.max(0, Math.min(_0x5b8e54.length - 1, _0x138c36));
  }
  return {
    item: _0x5b8e54[_0x10e5ad] || null,
    index: _0x10e5ad,
    matchedByKey: _0x2a9ddb
  };
}
export function resolveReferenceVideoThumbnail(_0x26d032 = {}, _0x269447 = null) {
  const _0x881eb5 = resolveReferenceVideoItemByEdge(_0x26d032, _0x269447);
  const _0x5c55aa = getVideoThumbnailUrl(_0x881eb5.item);
  if (_0x5c55aa) {
    return {
      thumbUrl: _0x5c55aa,
      selected: _0x881eb5
    };
  }
  const _0x34ceb0 = Array.isArray(_0x26d032?.videos) ? _0x26d032.videos : [];
  const _0x3bf70b = Number(_0x26d032?.mainVideoIndex);
  const _0x4725a3 = _0x34ceb0.length ? Math.max(0, Math.min(_0x34ceb0.length - 1, Number.isFinite(_0x3bf70b) ? Math.trunc(_0x3bf70b) : 0)) : -1;
  const _0x401d69 = _0x4725a3 >= 0 ? getVideoThumbnailUrl(_0x34ceb0[_0x4725a3]) : "";
  if (_0x401d69 && !_0x881eb5.matchedByKey) {
    return {
      thumbUrl: _0x401d69,
      selected: {
        item: _0x34ceb0[_0x4725a3] || null,
        index: _0x4725a3,
        matchedByKey: false
      }
    };
  }
  const _0x16978a = getVideoThumbnailUrl(_0x26d032);
  if (_0x16978a && (!_0x881eb5.matchedByKey || _0x881eb5.index === _0x4725a3)) {
    return {
      thumbUrl: _0x16978a,
      selected: _0x881eb5
    };
  }
  return {
    thumbUrl: "",
    selected: _0x881eb5
  };
}
export function resolveReferenceVideoSourcePath(_0x21ec2b = {}, _0x595c7b = null) {
  const _0x129157 = resolveReferenceVideoItemByEdge(_0x21ec2b, _0x595c7b);
  const _0x16eea2 = String(_0x21ec2b?.type || "") === "ai-video" ? [_0x129157.item?.localPath, _0x129157.item?.displayLocalPath, _0x129157.item?.originalLocalPath, _0x129157.item?.videoLocalPath, _0x129157.item?.videoUrl] : [_0x21ec2b?.localPath, _0x21ec2b?.displayLocalPath, _0x21ec2b?.originalLocalPath, _0x21ec2b?.videoLocalPath, _0x21ec2b?.videoUrl, _0x21ec2b?.src];
  for (const _0x2bbb28 of _0x16eea2) {
    const _0xafbec6 = localPathToUrl(normalizeText(_0x2bbb28));
    if (_0xafbec6) {
      return _0xafbec6;
    }
  }
  return "";
}
export function resolveReferenceVideoMediaSignature(_0x2e24ad = {}, _0x2a0554 = null) {
  const _0x6c7e30 = resolveReferenceVideoItemByEdge(_0x2e24ad, _0x2a0554);
  return getVideoItemMediaKey(_0x6c7e30.item) || normalizeVideoMediaKey(_0x2e24ad?.localPath) || normalizeVideoMediaKey(_0x2e24ad?.displayLocalPath) || normalizeVideoMediaKey(_0x2e24ad?.originalLocalPath) || normalizeVideoMediaKey(_0x2e24ad?.videoLocalPath) || normalizeVideoMediaKey(_0x2e24ad?.videoUrl) || normalizeVideoMediaKey(_0x2e24ad?.src);
}
function createMediaFallbackHtml(_0x54c385, _0x90ee83) {
  if (_0x54c385 === "text" || _0x54c385 === "audio") {
    return createReferenceFallbackThumbHtml(_0x54c385, _0x90ee83);
  }
  if (_0x54c385 !== "image" && _0x54c385 !== "video") {
    return "";
  }
  const _0x535dd7 = _0x54c385 === "video" ? "<polygon points=\"8,6 19,12 8,18\"></polygon>" : "<path d=\"M5 17l4-4 3 3 2-2 5 5M8.5 9.5h.01\"></path>";
  return "<div class=\"" + _0x90ee83 + " ref-input-thumbnail--fallback\" aria-hidden=\"true\"><svg class=\"ref-input-thumbnail-icon\" viewBox=\"0 0 24 24\" focusable=\"false\">" + _0x535dd7 + "</svg></div>";
}
export function createReferenceInputThumbnailHtml({
  kind: _0x57584a,
  thumbnailUrl = "",
  extraHtml = "",
  additionalClassName = ""
} = {}) {
  const _0x300801 = normalizeKind(_0x57584a);
  if (!_0x300801) {
    return "";
  }
  const _0x45ea68 = ["ref-thumb-media", "ref-input-thumbnail", "ref-input-thumbnail--" + _0x300801, normalizeClassName(additionalClassName)].filter(Boolean).join(" ");
  const _0x3d3b31 = normalizeText(thumbnailUrl);
  if (!_0x3d3b31) {
    return createMediaFallbackHtml(_0x300801, _0x45ea68);
  }
  return "<img src=\"" + escapeHtmlAttr(_0x3d3b31) + "\" class=\"" + _0x45ea68 + " is-pending\" draggable=\"false\" alt=\"\">" + String(extraHtml || "");
}