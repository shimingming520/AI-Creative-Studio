const GENERATION_NODE_TYPES = ["ai-image", "ai-text", "ai-video", "ai-audio"];
const IMAGE_RESULT_FIELDS = ["src", "url", "imageUrl", "sourceUrl", "resultUrl", "thumbUrl", "localPath", "originalLocalPath", "displayLocalPath", "thumbLocalPath", "thumbId"];
const VIDEO_RESULT_FIELDS = ["src", "url", "videoUrl", "sourceUrl", "resultUrl", "videoLocalPath", "localPath", "originalLocalPath", "displayLocalPath", "thumbId", "thumbUrl", "posterUrl", "posterLocalPath", "thumbLocalPath", "videoThumbSrc", "videoMetaSrc", "remoteFallbackUrl"];
const AUDIO_RESULT_FIELDS = ["audioUrl", "url", "src", "resultUrl", "localPath"];
function matchesNodeType(_0xc4b959, _0x580abf, _0x4636fb) {
  if (typeof _0x4636fb === "function") {
    return _0x4636fb(_0xc4b959, _0x580abf);
  }
  return String(_0xc4b959?.type || "") === _0x580abf;
}
function hasStringValue(_0x206183) {
  return String(_0x206183 || "").trim().length > 0;
}
function hasAnyField(_0x41eb8a, _0x596019) {
  if (!_0x41eb8a || typeof _0x41eb8a !== "object") {
    return false;
  }
  return _0x596019.some(_0x4ef11f => hasStringValue(_0x41eb8a[_0x4ef11f]));
}
function hasAnyResultItem(_0x5650df, _0x1113c8) {
  if (!Array.isArray(_0x5650df)) {
    return false;
  }
  return _0x5650df.some(_0xc365 => hasAnyField(_0xc365, _0x1113c8));
}
export function hasDisplayableImageResult(_0x4b6693) {
  return hasAnyField(_0x4b6693, IMAGE_RESULT_FIELDS) || hasAnyResultItem(_0x4b6693?.images, IMAGE_RESULT_FIELDS);
}
export function hasDisplayableVideoResult(_0x5697dd) {
  const _0xa253a0 = Array.isArray(_0x5697dd?.videos) ? _0x5697dd.videos : [];
  if (hasAnyResultItem(_0xa253a0, VIDEO_RESULT_FIELDS)) {
    return true;
  }
  if (_0xa253a0.some(_0x22cf30 => hasStringValue(_0x22cf30?.error))) {
    return false;
  }
  return hasAnyField(_0x5697dd, VIDEO_RESULT_FIELDS);
}
export function hasDisplayableAudioResult(_0x27c484) {
  return hasAnyField(_0x27c484, AUDIO_RESULT_FIELDS) || hasAnyResultItem(_0x27c484?.audios, AUDIO_RESULT_FIELDS);
}
export function hasDisplayableNodeResult(_0xcf5292, _0x50d3a2) {
  if (matchesNodeType(_0xcf5292, "ai-image", _0x50d3a2)) {
    return hasDisplayableImageResult(_0xcf5292);
  }
  if (matchesNodeType(_0xcf5292, "ai-text", _0x50d3a2)) {
    return hasStringValue(_0xcf5292?.outputText);
  }
  if (matchesNodeType(_0xcf5292, "ai-video", _0x50d3a2)) {
    return hasDisplayableVideoResult(_0xcf5292);
  }
  if (matchesNodeType(_0xcf5292, "ai-audio", _0x50d3a2)) {
    return hasDisplayableAudioResult(_0xcf5292);
  }
  return false;
}
export function isNodeMissingResult(_0x2a5588, _0x4695e5) {
  if (!_0x2a5588 || !GENERATION_NODE_TYPES.some(_0x3dd333 => matchesNodeType(_0x2a5588, _0x3dd333, _0x4695e5))) {
    return false;
  }
  return !hasDisplayableNodeResult(_0x2a5588, _0x4695e5);
}
export function syncNodeResultClass(_0x13a5c5, _0x56e329, _0x4fc087) {
  if (!_0x13a5c5?.classList) {
    return;
  }
  if (isNodeMissingResult(_0x56e329, _0x4fc087)) {
    _0x13a5c5.classList.add("no-result");
  } else {
    _0x13a5c5.classList.remove("no-result");
  }
}