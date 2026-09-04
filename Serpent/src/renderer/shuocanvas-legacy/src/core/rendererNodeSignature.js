const IMAGE_LOD_SIGNATURE_NODE_TYPES = new Set(["source-image", "ai-image"]);
const VIDEO_SELECTION_WRAPPER_ONLY_TYPES = new Set(["source-video", "ai-video", "video"]);
export function buildRendererNodeSignature({
  node: _0x15f3cb,
  inEdgeSig = "",
  pickMode = null,
  isSelected = false,
  isSelectionRelated = false,
  showVideoMeta = false,
  viewport = null,
  mediaLodMode = null
} = {}) {
  isSelectionRelated;
  viewport;
  showVideoMeta;
  const _0x1a270c = _0x15f3cb || {};
  const _0x1713c3 = pickMode && pickMode.active && pickMode.sourceNodeId === _0x1a270c.id ? "1" : "0";
  const _0x1576c8 = typeof _0x1a270c._bizRev === "number" ? _0x1a270c._bizRev : 0;
  const _0x76c7d5 = String(_0x1a270c.type || "").trim().toLowerCase();
  const _0x1cfd28 = VIDEO_SELECTION_WRAPPER_ONLY_TYPES.has(_0x76c7d5) ? "" : isSelected ? "1" : "0";
  const _0x794643 = IMAGE_LOD_SIGNATURE_NODE_TYPES.has(_0x76c7d5) ? String(mediaLodMode || "").trim() : "";
  const _0x377308 = _0x76c7d5 === "group" ? (_0x1a270c.x ?? "") + "," + (_0x1a270c.y ?? "") + "," + (_0x1a270c.width ?? "") + "," + (_0x1a270c.height ?? "") : "";
  return _0x1576c8 + "|" + inEdgeSig + "|" + _0x1713c3 + "|" + _0x1cfd28 + "|" + _0x794643 + "|" + _0x377308;
}