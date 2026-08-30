import { resolveCanvasImageDisplayUrl, resolveCanvasImageSourceUrl, resolveCanvasImageThumbUrl } from "../../services/canvasMediaLocalService.js";
function resolveAiImagePrimaryItem(_0x30c852) {
  if (!_0x30c852 || String(_0x30c852.type || "") !== "ai-image") {
    return null;
  }
  const _0x7740b6 = Array.isArray(_0x30c852.images) ? _0x30c852.images : [];
  if (_0x7740b6.length === 0) {
    return null;
  }
  const _0x486737 = Number(_0x30c852.mainImageIndex);
  const _0x5cde58 = Number.isFinite(_0x486737) ? Math.max(0, Math.trunc(_0x486737)) : 0;
  return _0x7740b6[Math.min(_0x5cde58, _0x7740b6.length - 1)] || null;
}
function firstNonEmptyUrl(..._0x26fe9a) {
  for (const _0x3ea0a0 of _0x26fe9a) {
    const _0x4e1e06 = String(_0x3ea0a0 || "").trim();
    if (_0x4e1e06) {
      return _0x4e1e06;
    }
  }
  return "";
}
function normalizeIdentityPart(_0x2f418f) {
  return String(_0x2f418f ?? "").trim();
}
function appendImageIdentityFields(_0x508c71, _0x52026c, _0x15a677 = {}) {
  ["assetId", "sourceId", "thumbId", "imageUrl", "sourceUrl", "thumbUrl", "url", "resultUrl", "localPath", "originalLocalPath", "displayLocalPath", "thumbLocalPath", "fileName", "derivativeStatus"].forEach(_0x5ed6f6 => {
    const _0xcfae96 = normalizeIdentityPart(_0x15a677?.[_0x5ed6f6]);
    if (_0xcfae96) {
      _0x508c71.push(_0x52026c + "." + _0x5ed6f6 + "=" + _0xcfae96);
    }
  });
}
function hashRefImageVersionKey(_0xdc5414 = "") {
  const _0x53e45f = normalizeIdentityPart(_0xdc5414);
  let _0x173ac1 = 5381;
  for (let _0x57966e = 0; _0x57966e < _0x53e45f.length; _0x57966e += 1) {
    _0x173ac1 = (_0x173ac1 << 5) + _0x173ac1 ^ _0x53e45f.charCodeAt(_0x57966e);
    _0x173ac1 >>>= 0;
  }
  return _0x173ac1.toString(36);
}
export function resolveRefImageMediaIdentityKey(_0x4e43e6, _0x198866 = {}) {
  const _0x2b10bb = resolveAiImagePrimaryItem(_0x4e43e6);
  const _0x37a1ba = ["node=" + normalizeIdentityPart(_0x4e43e6?.id), "type=" + normalizeIdentityPart(_0x4e43e6?.type), "_bizRev=" + normalizeIdentityPart(_0x4e43e6?._bizRev), "main=" + normalizeIdentityPart(_0x4e43e6?.mainImageIndex), "edgeSourceMediaKey=" + normalizeIdentityPart(_0x198866?.sourceMediaKey)];
  appendImageIdentityFields(_0x37a1ba, "node", _0x4e43e6);
  appendImageIdentityFields(_0x37a1ba, "primary", _0x2b10bb);
  return _0x37a1ba.join("|");
}
export function versionRefImageUrl(_0x94b67e = "", _0x4cffc3 = "") {
  const _0x5af576 = String(_0x94b67e || "").trim();
  const _0x203a13 = normalizeIdentityPart(_0x4cffc3);
  if (!_0x5af576 || !_0x203a13) {
    return _0x5af576;
  }
  if (/^(?:blob:|data:)/i.test(_0x5af576)) {
    return _0x5af576;
  }
  if (!_0x5af576.startsWith("/")) {
    return _0x5af576;
  }
  const [_0x1bbdfb, _0x52dcc5 = ""] = _0x5af576.split("#", 2);
  const _0xcd8cc6 = _0x1bbdfb.includes("?") ? "&" : "?";
  const _0x5ccd7c = hashRefImageVersionKey(_0x203a13);
  return "" + _0x1bbdfb + _0xcd8cc6 + "aicv=" + _0x5ccd7c + (_0x52dcc5 ? "#" + _0x52dcc5 : "");
}
export function resolveVersionedRefImageRenderSources(_0x1a4c47, _0x5652bf = {}, _0x41ca0b = {}) {
  const _0x51f3ba = resolveRefImageMediaIdentityKey(_0x1a4c47, _0x5652bf);
  const {
    thumbSrc: _0x418865,
    previewSrc: _0x39b970
  } = resolveRefImageRenderSources(_0x1a4c47, _0x41ca0b);
  const _0x8a1ac1 = versionRefImageUrl(_0x418865, _0x51f3ba);
  return {
    thumbSrc: _0x8a1ac1,
    previewSrc: versionRefImageUrl(_0x39b970 || _0x8a1ac1, _0x51f3ba),
    mediaIdentityKey: _0x51f3ba
  };
}
export function collectRefThumbIds(_0x403986) {
  const _0x4f9dd4 = [];
  const _0x4c0bd8 = _0x5356ee => {
    const _0x455983 = String(_0x5356ee || "").trim();
    if (!_0x455983 || _0x4f9dd4.includes(_0x455983)) {
      return;
    }
    _0x4f9dd4.push(_0x455983);
  };
  const _0x30d3b4 = resolveAiImagePrimaryItem(_0x403986);
  _0x4c0bd8(_0x403986?.thumbId);
  _0x4c0bd8(_0x30d3b4?.thumbId);
  return _0x4f9dd4;
}
export function resolveRefImageRenderSources(_0x47674, _0x4b80af = {}) {
  const _0x42df41 = resolveAiImagePrimaryItem(_0x47674);
  const _0x1bdc83 = String(_0x4b80af?.thumbBlobUrl || "").trim();
  const _0xdd6048 = firstNonEmptyUrl(resolveCanvasImageThumbUrl(_0x47674), resolveCanvasImageThumbUrl(_0x42df41), _0x1bdc83);
  const _0x3ccdeb = firstNonEmptyUrl(resolveCanvasImageDisplayUrl(_0x47674), resolveCanvasImageSourceUrl(_0x47674), resolveCanvasImageDisplayUrl(_0x42df41), resolveCanvasImageSourceUrl(_0x42df41), _0xdd6048);
  return {
    thumbSrc: _0xdd6048,
    previewSrc: _0x3ccdeb
  };
}
export function resolveRefImageCandidateUrls(_0x25fbc8) {
  const {
    thumbSrc: _0x47ca7a,
    previewSrc: _0x40dbe4
  } = resolveRefImageRenderSources(_0x25fbc8);
  const _0x5d817a = [_0x47ca7a, _0x40dbe4].filter(Boolean);
  return Array.from(new Set(_0x5d817a));
}