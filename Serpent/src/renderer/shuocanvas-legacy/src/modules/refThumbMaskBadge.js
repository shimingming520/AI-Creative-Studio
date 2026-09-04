const MASK_BADGE_HTML = "<span class=\"ref-thumb-mask-badge\">遮罩</span>";
const REFERENCE_MASK_FIELDS = Object.freeze(["mask", "maskImageDataUrl", "maskImageUrl", "maskUrl", "maskLocalPath"]);
function resolveSourceData(_0x481fb1 = null) {
  if (_0x481fb1?.nodeData && typeof _0x481fb1.nodeData === "object") {
    return _0x481fb1.nodeData;
  } else {
    return _0x481fb1;
  }
}
export function hasReferenceMask(_0x5adfc7 = null) {
  const _0x399a01 = resolveSourceData(_0x5adfc7);
  if (!_0x399a01 || typeof _0x399a01 !== "object") {
    return false;
  }
  return REFERENCE_MASK_FIELDS.some(_0x3b6cab => !!String(_0x399a01?.[_0x3b6cab] || "").trim());
}
export function createReferenceMaskBadgeHtml(_0x4ba073 = null) {
  if (hasReferenceMask(_0x4ba073)) {
    return MASK_BADGE_HTML;
  } else {
    return "";
  }
}
export function getReferenceMaskSignaturePart(_0x1a5414 = null) {
  if (hasReferenceMask(_0x1a5414)) {
    return "m1";
  } else {
    return "m0";
  }
}