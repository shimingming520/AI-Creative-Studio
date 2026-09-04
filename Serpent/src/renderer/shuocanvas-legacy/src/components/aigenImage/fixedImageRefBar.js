import { buildFixedInputAssetSlotMap } from "../../modules/fixedInputAssetRefs.js";
import { bindRefThumbFixedSlotDrag } from "../../modules/refThumbDragController.js";
import { createReferenceInputThumbnailHtml } from "../../modules/referenceInputThumbnail.js";
import { t } from "../../i18n/index.js";
import { escapeInputSlotLabelHtml, formatInputSlotLabelHtml } from "../shared/inputSlotLabelFormatter.js";
function escapeRefBarHtml(_0x30176e) {
  return escapeInputSlotLabelHtml(_0x30176e);
}
function getFixedImageSlotLabelHtml(_0x19760d, _0xa87b52) {
  const _0x54bd7d = String(_0xa87b52 || "").trim();
  const _0x1d122b = _0x19760d?.slotById?.[_0x54bd7d] || {};
  const _0x3d7e0e = String(_0x1d122b.label || _0x54bd7d).trim() || _0x54bd7d;
  return formatInputSlotLabelHtml(_0x3d7e0e);
}
function getFixedImageSlotTitle(_0x3cd40e, _0x426286) {
  const _0x34083a = String(_0x426286 || "").trim();
  const _0x3bc811 = _0x3cd40e?.slotById?.[_0x34083a] || {};
  return String(_0x3bc811.description || _0x3bc811.label || _0x34083a).trim() || _0x34083a;
}
function getFixedImageSlotAcceptMap(_0x3ec166) {
  const _0x1ad001 = {};
  (_0x3ec166?.visibleSlots || []).forEach(_0x3abbad => {
    const _0x18e2f0 = String(_0x3ec166?.slotKindById?.[_0x3abbad] || "").trim();
    if (_0x3abbad && _0x18e2f0) {
      _0x1ad001[_0x3abbad] = _0x18e2f0;
    }
  });
  return _0x1ad001;
}
function getItemKey(_0x2e974e) {
  return String(_0x2e974e?.key || _0x2e974e?.edgeId || "");
}
function createAssetSlotItem({
  ref: _0x3d1b90,
  slot: _0x366eb6,
  fixedInputConfig: _0x204df7,
  ensureThumbDecoded: _0x1f69d7
}) {
  if (!_0x3d1b90?.url) {
    return null;
  }
  const _0x13ff25 = String(_0x3d1b90.thumbUrl || _0x3d1b90.url || "").trim();
  if (!_0x13ff25) {
    return null;
  }
  _0x1f69d7(_0x13ff25);
  const _0x1c1796 = String(_0x3d1b90.assetId || "");
  const _0xa0f3ed = String(_0x3d1b90.itemIndex ?? "");
  const _0x2c0e3e = String(_0x3d1b90.assetMentionOccurrence ?? "");
  const _0x3d9ccf = String(_0x3d1b90.assetRefSource || "prompt");
  return {
    key: "asset:" + _0x3d9ccf + ":" + _0x1c1796 + ":" + _0xa0f3ed + ":image:" + _0x366eb6,
    edgeId: "",
    sourceId: "asset:" + _0x1c1796 + ":" + _0xa0f3ed,
    refSlot: _0x366eb6,
    type: "image",
    label: _0x3d1b90.label || _0x3d1b90.name || getFixedImageSlotTitle(_0x204df7, _0x366eb6),
    sig: "asset:" + _0x366eb6 + "|" + String(_0x3d1b90.url || "") + "|" + _0x13ff25,
    thumbHTML: createReferenceInputThumbnailHtml({
      kind: "image",
      thumbnailUrl: _0x13ff25
    }),
    thumbSrc: _0x13ff25,
    previewSrc: String(_0x3d1b90.url || _0x13ff25),
    virtual: true,
    assetId: _0x1c1796,
    assetIndex: _0xa0f3ed,
    assetOccurrence: _0x2c0e3e,
    assetRefSource: _0x3d9ccf,
    refType: "image"
  };
}
function hasAssignedVirtualAsset(_0x23bb53, _0x5c27ab) {
  if (!_0x5c27ab?.virtual) {
    return false;
  }
  return Array.from(_0x23bb53.values()).some(_0x247594 => _0x247594?.virtual && String(_0x247594.assetId || "") === String(_0x5c27ab.assetId || "") && String(_0x247594.assetIndex || "") === String(_0x5c27ab.assetIndex || "") && String(_0x247594.assetOccurrence || "") === String(_0x5c27ab.assetOccurrence || "") && String(_0x247594.assetRefSource || "prompt") === String(_0x5c27ab.assetRefSource || "prompt"));
}
function ensureFixedImageSkeleton({
  refBarEl: _0x5d9456,
  attachBtnHTML: _0x1a8952,
  slotOrder: _0x3a3f23,
  fixedInputConfig: _0x579a75,
  owner: _0x5c6578
}) {
  let _0x50b506 = _0x5d9456.querySelector(".prompt-attachment-btn");
  let _0x55fcf4 = _0x5d9456.querySelector(".rh-v5-ref-container") || _0x5d9456.querySelector(".ref-thumb-container");
  const _0x478b8c = _0x3a3f23.every(_0x303d8c => _0x55fcf4?.querySelector?.("[data-slot=\"" + _0x303d8c + "\"]"));
  if (!_0x50b506 || !_0x55fcf4 || !_0x478b8c) {
    const _0x3e351d = _0x3a3f23.map(_0x484397 => {
      const _0x51461a = escapeRefBarHtml(getFixedImageSlotTitle(_0x579a75, _0x484397));
      return "<button type=\"button\" class=\"ref-thumb-wrap ref-upload-slot rh-v5-ref-box\" data-ref-slot=\"" + escapeRefBarHtml(_0x484397) + "\" data-slot=\"" + escapeRefBarHtml(_0x484397) + "\" data-kind=\"image\" draggable=\"false\" title=\"" + _0x51461a + "\"><span class=\"ref-upload-label\">" + getFixedImageSlotLabelHtml(_0x579a75, _0x484397) + "</span></button>";
    }).join("");
    _0x5d9456.innerHTML = _0x1a8952 + " <div class=\"ref-thumb-container rh-v5-ref-container\">" + _0x3e351d + "</div>";
    _0x50b506 = _0x5d9456.querySelector(".prompt-attachment-btn");
    _0x55fcf4 = _0x5d9456.querySelector(".rh-v5-ref-container") || _0x5d9456.querySelector(".ref-thumb-container");
    _0x5c6578._attachBtnIcon = _0x50b506 ? _0x50b506.querySelector(".btn-icon") : null;
  }
  return _0x55fcf4;
}
function collectFixedSlotItems({
  slotOrder: _0xf004,
  items: _0x3d9956,
  fixedInputConfig: _0x4fc18d,
  promptEl: _0x22af8c,
  targetNodeData: _0x210381,
  ensureThumbDecoded: _0x2b402d
}) {
  const _0x1b1794 = new Map();
  const _0x3cb8e7 = new Set();
  const _0x1af9f4 = new Set(_0xf004);
  for (const _0x12efeb of _0x3d9956) {
    if (_0x12efeb.type !== "image") {
      continue;
    }
    const _0x12e90d = getItemKey(_0x12efeb);
    const _0x4dd753 = String(_0x12efeb.refSlot || "").trim();
    if (!_0x12e90d || _0x3cb8e7.has(_0x12e90d) || !_0x1af9f4.has(_0x4dd753)) {
      continue;
    }
    if (_0x1b1794.has(_0x4dd753)) {
      continue;
    }
    _0x1b1794.set(_0x4dd753, _0x12efeb);
    _0x3cb8e7.add(_0x12e90d);
  }
  const _0x286cc9 = buildFixedInputAssetSlotMap(_0x22af8c, {
    slotOrderByType: _0x4fc18d.slotOrderByType || {},
    visibleSlots: _0xf004,
    exclusiveGroups: _0x4fc18d.exclusiveGroups || [],
    occupiedSlots: new Set(_0x1b1794.keys()),
    nodeData: _0x210381
  });
  _0xf004.forEach(_0x3c4864 => {
    if (_0x1b1794.has(_0x3c4864)) {
      return;
    }
    const _0x5de3c3 = createAssetSlotItem({
      ref: _0x286cc9[_0x3c4864],
      slot: _0x3c4864,
      fixedInputConfig: _0x4fc18d,
      ensureThumbDecoded: _0x2b402d
    });
    if (_0x5de3c3) {
      _0x1b1794.set(_0x3c4864, _0x5de3c3);
    }
  });
  for (const _0x16dbbe of _0x3d9956) {
    if (_0x16dbbe.type !== "image") {
      continue;
    }
    const _0x32eba5 = getItemKey(_0x16dbbe);
    if (!_0x32eba5 || _0x3cb8e7.has(_0x32eba5)) {
      continue;
    }
    if (hasAssignedVirtualAsset(_0x1b1794, _0x16dbbe)) {
      continue;
    }
    const _0x3d76db = _0xf004.find(_0x486791 => !_0x1b1794.has(_0x486791));
    if (!_0x3d76db) {
      break;
    }
    _0x1b1794.set(_0x3d76db, _0x16dbbe);
    _0x3cb8e7.add(_0x32eba5);
  }
  return _0x1b1794;
}
function syncFixedSlotElement({
  container: _0x33d8f1,
  slot: _0x5eaf7d,
  item: _0x2b8349,
  fixedInputConfig: _0x40177f,
  revealRefThumbMedia: _0x2f7035
}) {
  const _0x913756 = getFixedImageSlotTitle(_0x40177f, _0x5eaf7d);
  let _0x3072a4 = _0x33d8f1?.querySelector?.("[data-slot=\"" + _0x5eaf7d + "\"]");
  if (_0x2b8349 && _0x3072a4?.classList?.contains?.("ref-upload-slot")) {
    const _0x97938 = document.createElement("div");
    _0x97938.className = "ref-thumb-wrap rh-v5-ref-box" + (_0x2b8349.virtual ? " ref-thumb-wrap--asset" : "");
    _0x3072a4.replaceWith(_0x97938);
    _0x3072a4 = _0x97938;
  } else if (!_0x2b8349 && _0x3072a4 && !_0x3072a4.classList?.contains?.("ref-upload-slot")) {
    const _0x187674 = document.createElement("button");
    _0x187674.type = "button";
    _0x187674.className = "ref-thumb-wrap ref-upload-slot rh-v5-ref-box";
    _0x3072a4.replaceWith(_0x187674);
    _0x3072a4 = _0x187674;
  } else if (!_0x3072a4) {
    _0x3072a4 = document.createElement(_0x2b8349 ? "div" : "button");
    _0x33d8f1?.appendChild(_0x3072a4);
  }
  if (!_0x3072a4) {
    return;
  }
  _0x3072a4.dataset.refSlot = _0x5eaf7d;
  _0x3072a4.dataset.slot = _0x5eaf7d;
  _0x3072a4.dataset.kind = "image";
  _0x3072a4.title = _0x913756;
  if (_0x2b8349) {
    _0x3072a4.className = "ref-thumb-wrap rh-v5-ref-box" + (_0x2b8349.virtual ? " ref-thumb-wrap--asset" : "");
    _0x3072a4.classList.remove("ref-upload-slot");
    _0x3072a4.setAttribute("draggable", _0x2b8349.virtual ? "false" : "true");
    _0x3072a4.dataset.refKey = getItemKey(_0x2b8349);
    _0x3072a4.dataset.edgeId = _0x2b8349.edgeId || "";
    _0x3072a4.dataset.sourceId = _0x2b8349.sourceId || "";
    _0x3072a4.dataset.refOrigin = _0x2b8349.virtual ? "asset" : "node";
    if (_0x2b8349.virtual) {
      _0x3072a4.dataset.assetId = _0x2b8349.assetId || "";
      _0x3072a4.dataset.assetIndex = _0x2b8349.assetIndex || "";
      _0x3072a4.dataset.assetOccurrence = _0x2b8349.assetOccurrence || "";
      _0x3072a4.dataset.assetRefSource = _0x2b8349.assetRefSource || "prompt";
      _0x3072a4.dataset.refType = _0x2b8349.refType || _0x2b8349.type || "";
    } else {
      delete _0x3072a4.dataset.assetId;
      delete _0x3072a4.dataset.assetIndex;
      delete _0x3072a4.dataset.assetOccurrence;
      delete _0x3072a4.dataset.assetRefSource;
      delete _0x3072a4.dataset.refType;
    }
    if (_0x3072a4.dataset.sig !== _0x2b8349.sig) {
      _0x3072a4.innerHTML = _0x2b8349.thumbHTML + "<button type=\"button\" class=\"ref-thumb-delete\" title=\"" + t("aigenImage.refs.removeReference") + "\">&times;</button>";
      _0x3072a4.dataset.sig = _0x2b8349.sig;
      _0x2f7035(_0x3072a4, _0x2b8349.sig);
    }
    if (_0x2b8349.thumbSrc) {
      _0x3072a4.dataset.thumbSrc = _0x2b8349.thumbSrc;
    } else {
      delete _0x3072a4.dataset.thumbSrc;
    }
    if (_0x2b8349.previewSrc) {
      _0x3072a4.dataset.previewSrc = _0x2b8349.previewSrc;
    } else {
      delete _0x3072a4.dataset.previewSrc;
    }
    return;
  }
  _0x3072a4.className = "ref-thumb-wrap ref-upload-slot rh-v5-ref-box";
  _0x3072a4.setAttribute("draggable", "false");
  ["refKey", "edgeId", "sourceId", "refOrigin", "assetId", "assetIndex", "assetOccurrence", "assetRefSource", "refType", "sig", "thumbSrc", "previewSrc"].forEach(_0x584c5f => {
    if (_0x3072a4.dataset[_0x584c5f]) {
      delete _0x3072a4.dataset[_0x584c5f];
    }
  });
  const _0x568500 = "<span class=\"ref-upload-label\">" + getFixedImageSlotLabelHtml(_0x40177f, _0x5eaf7d) + "</span>";
  if (_0x3072a4.innerHTML !== _0x568500) {
    _0x3072a4.innerHTML = _0x568500;
  }
}
export function renderManifestFixedImageRefBar({
  owner: _0x26814d,
  refBarEl: _0x712157,
  promptEl: _0x1e5dd1,
  attachBtnHTML: _0x95279f,
  fixedInputConfig: _0x5553ae,
  items: _0x49825b,
  targetNodeData: _0x597448,
  sourceIdToLabel: _0x574a1d,
  store: _0x44bacb,
  nodeId: _0xa45140,
  ensureThumbDecoded: _0x401f4a,
  revealRefThumbMedia: _0xc3cc7f,
  syncPillLabels: _0x59a4ae
}) {
  const _0x5015f7 = (_0x5553ae?.visibleSlots || []).map(_0x29f1c7 => String(_0x29f1c7 || "").trim()).filter(_0x2a8e54 => _0x2a8e54 && String(_0x5553ae?.slotKindById?.[_0x2a8e54] || "") === "image");
  if (_0x5015f7.length === 0) {
    return false;
  }
  _0x712157.classList.add("active", "rh-v5-refbar");
  _0x26814d._lastRefHTML = "__rh-manifest-fixed-image__:" + _0x5015f7.join(",");
  const _0x2bc700 = ensureFixedImageSkeleton({
    refBarEl: _0x712157,
    attachBtnHTML: _0x95279f,
    slotOrder: _0x5015f7,
    fixedInputConfig: _0x5553ae,
    owner: _0x26814d
  });
  const _0x3cb7d3 = collectFixedSlotItems({
    slotOrder: _0x5015f7,
    items: _0x49825b,
    fixedInputConfig: _0x5553ae,
    promptEl: _0x1e5dd1,
    targetNodeData: _0x597448,
    ensureThumbDecoded: _0x401f4a
  });
  const _0x2a37d5 = new Set(_0x5015f7);
  Array.from(_0x2bc700?.querySelectorAll?.("[data-slot]") || []).filter(_0x1ef624 => !_0x2a37d5.has(String(_0x1ef624?.dataset?.slot || ""))).forEach(_0x24851f => _0x24851f.remove());
  _0x5015f7.forEach(_0x352e8e => {
    syncFixedSlotElement({
      container: _0x2bc700,
      slot: _0x352e8e,
      item: _0x3cb7d3.get(_0x352e8e) || null,
      fixedInputConfig: _0x5553ae,
      revealRefThumbMedia: _0xc3cc7f
    });
  });
  bindRefThumbFixedSlotDrag({
    owner: _0x26814d,
    container: _0x2bc700,
    store: _0x44bacb,
    nodeId: _0xa45140,
    acceptMap: getFixedImageSlotAcceptMap(_0x5553ae)
  });
  _0x26814d._syncBtnIconState();
  _0x59a4ae(_0x26814d, _0x574a1d);
  return true;
}