import { resolveCanvasImageDisplayUrl, resolveCanvasImagePreviewUrl, resolveCanvasImageSourceUrl, resolveCanvasImageThumbUrl, resolveCanvasVideoDisplayUrl, resolveCanvasVideoPosterUrl } from "../services/canvasMediaLocalService.js";
import { localPathToUrl } from "../utils/localMediaPath.js";
const IMAGE_NODE_TYPES = new Set(["image", "source-image", "ai-image"]);
const VIDEO_NODE_TYPES = new Set(["video", "source-video", "ai-video"]);
const NON_IMAGE_MEDIA_RE = /\.(?:mp4|webm|mov|mkv|m4v|mp3|wav|m4a|aac|flac|ogg|opus|wma)(?:[?#].*)?$/i;
const ASSET_MATERIAL_THUMB_RE = /(?:^|\/)data\/assets\/thumbs\//i;
export const ASSET_MATERIAL_VIDEO_THUMB_MAX_EDGE = 960;
const ASSET_MATERIAL_VIDEO_THUMB_VERSION = "video-v2-" + ASSET_MATERIAL_VIDEO_THUMB_MAX_EDGE;
function normalizeText(_0x341a52) {
  return String(_0x341a52 || "").trim();
}
function firstUsableCoverUrl(..._0x32e891) {
  for (const _0xc0ed47 of _0x32e891) {
    const _0x1b5a12 = normalizeText(_0xc0ed47);
    if (!_0x1b5a12 || /^data:(?:video|audio)\//i.test(_0x1b5a12) || NON_IMAGE_MEDIA_RE.test(_0x1b5a12)) {
      continue;
    }
    return _0x1b5a12;
  }
  return "";
}
function pickIndexedItem(_0x565fc8, _0x4dc9e2) {
  if (!Array.isArray(_0x565fc8) || _0x565fc8.length === 0) {
    return null;
  }
  const _0x5f1fae = Number(_0x4dc9e2);
  const _0x2f7442 = Number.isFinite(_0x5f1fae) ? Math.max(0, Math.trunc(_0x5f1fae)) : 0;
  return _0x565fc8[_0x2f7442] || _0x565fc8[0] || null;
}
function resolveImageCoverUrl(_0x93d1cd = {}) {
  if (!_0x93d1cd || typeof _0x93d1cd !== "object") {
    return "";
  }
  return firstUsableCoverUrl(resolveCanvasImageThumbUrl(_0x93d1cd), resolveCanvasImageDisplayUrl(_0x93d1cd), resolveCanvasImageSourceUrl(_0x93d1cd), localPathToUrl(_0x93d1cd.thumbLocalPath), localPathToUrl(_0x93d1cd.thumbnailLocalPath), localPathToUrl(_0x93d1cd.previewLocalPath), localPathToUrl(_0x93d1cd.displayLocalPath), localPathToUrl(_0x93d1cd.localPath), localPathToUrl(_0x93d1cd.originalLocalPath), _0x93d1cd.thumbUrl, _0x93d1cd.thumbnailUrl, _0x93d1cd.previewUrl, _0x93d1cd.displayUrl, _0x93d1cd.imageUrl, _0x93d1cd.sourceUrl, _0x93d1cd.src, _0x93d1cd.url, _0x93d1cd.resultUrl);
}
function resolveImagePreviewUrl(_0x2d6feb = {}) {
  if (!_0x2d6feb || typeof _0x2d6feb !== "object") {
    return "";
  }
  return firstUsableCoverUrl(resolveCanvasImageDisplayUrl(_0x2d6feb), resolveCanvasImagePreviewUrl(_0x2d6feb), resolveCanvasImageSourceUrl(_0x2d6feb), localPathToUrl(_0x2d6feb.displayLocalPath), localPathToUrl(_0x2d6feb.previewLocalPath), localPathToUrl(_0x2d6feb.originalLocalPath), localPathToUrl(_0x2d6feb.localPath), _0x2d6feb.displayUrl, _0x2d6feb.previewUrl, _0x2d6feb.imageUrl, _0x2d6feb.sourceUrl, _0x2d6feb.src, _0x2d6feb.url, _0x2d6feb.resultUrl, _0x2d6feb.thumbUrl, _0x2d6feb.thumbnailUrl);
}
function resolveVideoCoverUrl(_0x5ab56e = {}) {
  if (!_0x5ab56e || typeof _0x5ab56e !== "object") {
    return "";
  }
  return firstUsableCoverUrl(resolveCanvasVideoPosterUrl(_0x5ab56e), localPathToUrl(_0x5ab56e.posterLocalPath), localPathToUrl(_0x5ab56e.coverLocalPath), localPathToUrl(_0x5ab56e.previewLocalPath), localPathToUrl(_0x5ab56e.thumbLocalPath), localPathToUrl(_0x5ab56e.thumbnailLocalPath), _0x5ab56e.posterUrl, _0x5ab56e.coverUrl, _0x5ab56e.previewUrl, _0x5ab56e.thumbUrl, _0x5ab56e.thumbnailUrl);
}
function resolveGenericCoverUrl(_0x346adf = {}) {
  return firstUsableCoverUrl(localPathToUrl(_0x346adf.coverLocalPath), localPathToUrl(_0x346adf.posterLocalPath), localPathToUrl(_0x346adf.thumbLocalPath), localPathToUrl(_0x346adf.thumbnailLocalPath), _0x346adf.coverUrl, _0x346adf.posterUrl, _0x346adf.thumbUrl, _0x346adf.thumbnailUrl, _0x346adf.imageUrl, _0x346adf.sourceUrl);
}
function resolveNodeMediaKind(_0x4ccedf = {}) {
  const _0x1488ac = normalizeText(_0x4ccedf.type).toLowerCase();
  if (VIDEO_NODE_TYPES.has(_0x1488ac)) {
    return "video";
  }
  if (IMAGE_NODE_TYPES.has(_0x1488ac)) {
    return "image";
  }
  if (Array.isArray(_0x4ccedf.videos) && _0x4ccedf.videos.length > 0) {
    return "video";
  }
  if (Array.isArray(_0x4ccedf.images) && _0x4ccedf.images.length > 0 || Array.isArray(_0x4ccedf.outputImages) && _0x4ccedf.outputImages.length > 0) {
    return "image";
  }
  return "other";
}
function getCurrentImage(_0x4babac = {}) {
  return pickIndexedItem(Array.isArray(_0x4babac.images) ? _0x4babac.images : _0x4babac.outputImages, _0x4babac.mainImageIndex);
}
function getCurrentVideo(_0x2ceb64 = {}) {
  return pickIndexedItem(_0x2ceb64.videos, _0x2ceb64.mainVideoIndex);
}
function resolvePositiveDimension(..._0x3984d2) {
  for (const _0x2ccd43 of _0x3984d2) {
    const _0x4b77ca = Number(_0x2ccd43);
    if (Number.isFinite(_0x4b77ca) && _0x4b77ca > 0) {
      return _0x4b77ca;
    }
  }
  return 0;
}
function resolveSourceAspectRatio(_0x56f4e1 = {}) {
  if (!_0x56f4e1 || typeof _0x56f4e1 !== "object") {
    return 0;
  }
  const _0xb13ed0 = resolvePositiveDimension(_0x56f4e1.originalWidth, _0x56f4e1.imageWidth, _0x56f4e1.videoWidth, _0x56f4e1.naturalWidth, _0x56f4e1.mediaWidth, _0x56f4e1.width);
  const _0x2a0f5b = resolvePositiveDimension(_0x56f4e1.originalHeight, _0x56f4e1.imageHeight, _0x56f4e1.videoHeight, _0x56f4e1.naturalHeight, _0x56f4e1.mediaHeight, _0x56f4e1.height);
  const _0x1ea038 = _0xb13ed0 > 0 && _0x2a0f5b > 0 ? _0xb13ed0 / _0x2a0f5b : 0;
  if (_0x1ea038 >= 0.1 && _0x1ea038 <= 10) {
    return _0x1ea038;
  } else {
    return 0;
  }
}
export function resolveAssetNodeCoverUrl(_0x135988 = {}) {
  const _0x25dbd6 = resolveNodeMediaKind(_0x135988);
  if (_0x25dbd6 === "image") {
    return resolveImageCoverUrl(getCurrentImage(_0x135988)) || resolveImageCoverUrl(_0x135988);
  }
  if (_0x25dbd6 === "video") {
    return resolveVideoCoverUrl(getCurrentVideo(_0x135988)) || resolveVideoCoverUrl(_0x135988);
  }
  return resolveGenericCoverUrl(_0x135988);
}
export function resolveAssetNodePreviewUrl(_0x160443 = {}) {
  const _0x51361d = resolveNodeMediaKind(_0x160443);
  if (_0x51361d === "image") {
    return resolveImagePreviewUrl(getCurrentImage(_0x160443)) || resolveImagePreviewUrl(_0x160443);
  }
  if (_0x51361d === "video") {
    return resolveVideoCoverUrl(getCurrentVideo(_0x160443)) || resolveVideoCoverUrl(_0x160443);
  }
  return resolveGenericCoverUrl(_0x160443);
}
export function resolveAssetNodePreviewAspectRatio(_0x340bb1 = {}) {
  const _0x432728 = resolveNodeMediaKind(_0x340bb1);
  const _0xc9f8d0 = _0x432728 === "image" ? getCurrentImage(_0x340bb1) : _0x432728 === "video" ? getCurrentVideo(_0x340bb1) : null;
  return resolveSourceAspectRatio(_0xc9f8d0) || resolveSourceAspectRatio(_0x340bb1) || 4 / 3;
}
export function resolveAssetNodeCoverThumbId(_0x36379f = {}) {
  if (resolveNodeMediaKind(_0x36379f) !== "image") {
    return "";
  }
  const _0x1ed5f4 = getCurrentImage(_0x36379f);
  return normalizeText(_0x1ed5f4?.thumbId || _0x1ed5f4?.sourceId || _0x36379f.thumbId || _0x36379f.sourceId);
}
export function isAssetMaterialThumbnailUrl(_0x206068) {
  return ASSET_MATERIAL_THUMB_RE.test(normalizeText(_0x206068));
}
export function getAssetMaterialVideoThumbnailKey(_0x5839bd) {
  const _0x52f37f = Number.isFinite(Number(_0x5839bd)) ? Math.max(0, Math.trunc(Number(_0x5839bd))) : 0;
  return ASSET_MATERIAL_VIDEO_THUMB_VERSION + "-" + _0x52f37f;
}
export function isAssetMaterialVideoThumbnailUrl(_0x1be021) {
  const _0x7495bf = normalizeText(_0x1be021);
  return isAssetMaterialThumbnailUrl(_0x7495bf) && _0x7495bf.includes("_" + ASSET_MATERIAL_VIDEO_THUMB_VERSION + "-");
}
export function resolveMaterialItemThumbUrl(_0x29e576 = {}) {
  const _0x7c913a = _0x29e576?.nodeData || {};
  const _0x8e1e9 = resolveNodeMediaKind({
    ..._0x7c913a,
    type: _0x7c913a?.type || _0x29e576?.type
  });
  const _0x272484 = normalizeText(_0x29e576?.thumbSrc);
  if (_0x8e1e9 === "video" && isAssetMaterialThumbnailUrl(_0x272484)) {
    return _0x272484;
  }
  return resolveAssetNodeCoverUrl(_0x7c913a) || _0x272484;
}
export function resolveMaterialItemPreviewUrl(_0x1f1a5b = {}) {
  const _0x1e2618 = _0x1f1a5b?.nodeData || {};
  const _0x187cd3 = resolveNodeMediaKind({
    ..._0x1e2618,
    type: _0x1e2618?.type || _0x1f1a5b?.type
  });
  const _0x2660e8 = normalizeText(_0x1f1a5b?.thumbSrc);
  if (_0x187cd3 === "video" && isAssetMaterialThumbnailUrl(_0x2660e8)) {
    return _0x2660e8;
  }
  return resolveAssetNodePreviewUrl(_0x1e2618) || resolveMaterialItemThumbUrl(_0x1f1a5b);
}
export function resolveAssetMaterialVideoSourceUrl(_0x54a766 = {}) {
  if (resolveNodeMediaKind(_0x54a766) !== "video") {
    return "";
  }
  const _0x2e1e1e = getCurrentVideo(_0x54a766);
  return resolveCanvasVideoDisplayUrl(_0x2e1e1e || {}) || resolveCanvasVideoDisplayUrl(_0x54a766);
}
export function fitAssetMaterialVideoThumbnail(_0x4f1435, _0x20faf1, _0x1dc922 = ASSET_MATERIAL_VIDEO_THUMB_MAX_EDGE) {
  const _0x40b7e5 = Number(_0x4f1435) || 0;
  const _0x4998ff = Number(_0x20faf1) || 0;
  const _0x4f2eea = Math.max(1, Number(_0x1dc922) || ASSET_MATERIAL_VIDEO_THUMB_MAX_EDGE);
  if (_0x40b7e5 <= 0 || _0x4998ff <= 0) {
    return {
      width: 0,
      height: 0
    };
  }
  const _0x551451 = Math.min(1, _0x4f2eea / _0x40b7e5, _0x4f2eea / _0x4998ff);
  return {
    width: Math.max(1, Math.round(_0x40b7e5 * _0x551451)),
    height: Math.max(1, Math.round(_0x4998ff * _0x551451))
  };
}