import { getModelManifest } from "../manifests/index.js";
function toPositiveDimension(_0x5c894d) {
  const _0x4b81aa = Number(_0x5c894d);
  if (Number.isFinite(_0x4b81aa) && _0x4b81aa > 0) {
    return _0x4b81aa;
  } else {
    return 0;
  }
}
function pickPositiveDimension(..._0x546502) {
  for (const _0x5167a2 of _0x546502) {
    const _0x4dc371 = toPositiveDimension(_0x5167a2);
    if (_0x4dc371 > 0) {
      return _0x4dc371;
    }
  }
  return 0;
}
function pickIndexedItem(_0x2434a4, _0x20c48d, _0xfcff17 = "") {
  const _0x449b17 = Array.isArray(_0x2434a4) ? _0x2434a4 : [];
  if (_0x449b17.length === 0) {
    return null;
  }
  const _0x4ee80f = String(_0xfcff17 || "").trim();
  if (_0x4ee80f) {
    const _0x36a535 = _0x449b17.find(_0x4b3bf5 => {
      const _0x560683 = String(_0x4b3bf5?.originalLocalPath || "").trim() || String(_0x4b3bf5?.localPath || "").trim() || String(_0x4b3bf5?.videoUrl || "").trim() || String(_0x4b3bf5?.imageUrl || "").trim() || String(_0x4b3bf5?.sourceUrl || "").trim() || String(_0x4b3bf5?.thumbUrl || "").trim();
      return _0x560683 === _0x4ee80f;
    });
    if (_0x36a535) {
      return _0x36a535;
    }
  }
  const _0x4e6418 = Number(_0x20c48d);
  const _0x2ec757 = Number.isFinite(_0x4e6418) ? Math.max(0, Math.trunc(_0x4e6418)) : 0;
  return _0x449b17[Math.min(_0x2ec757, _0x449b17.length - 1)] || null;
}
function normalizeSourceIndex(_0x8a8c9f) {
  const _0x3274af = Number(_0x8a8c9f);
  if (Number.isFinite(_0x3274af) && _0x3274af >= 0) {
    return Math.trunc(_0x3274af);
  } else {
    return null;
  }
}
export function getGenerationDisplayRatioSourceConfig(_0x21204c = {}) {
  const _0x39717e = typeof _0x21204c === "string" ? _0x21204c : _0x21204c?.model || _0x21204c?.modelId;
  const _0x1079d0 = getModelManifest(_0x39717e);
  const _0x1ce19e = _0x1079d0?.inputSlots?.displayAspectRatioSource;
  if (!_0x1ce19e || typeof _0x1ce19e !== "object" || Array.isArray(_0x1ce19e)) {
    return null;
  }
  const _0x3d5a3e = Array.from(new Set([String(_0x1ce19e.slot || _0x1ce19e.refSlot || "").trim(), ...(Array.isArray(_0x1ce19e.slots) ? _0x1ce19e.slots : [])].map(_0x6d2289 => String(_0x6d2289 || "").trim()).filter(Boolean)));
  const _0x2a9d27 = String(_0x1ce19e.kind || "").trim();
  const _0x4139a8 = normalizeSourceIndex(_0x1ce19e.inputIndex ?? _0x1ce19e.index);
  const _0x193091 = normalizeSourceIndex(_0x1ce19e.fallbackIndex ?? _0x1ce19e.inputIndex ?? _0x1ce19e.index);
  if (_0x3d5a3e.length === 0 && _0x4139a8 === null && _0x193091 === null) {
    return null;
  }
  return {
    ...(_0x2a9d27 ? {
      kind: _0x2a9d27
    } : {}),
    ...(_0x3d5a3e.length ? {
      slot: _0x3d5a3e[0],
      slots: _0x3d5a3e
    } : {}),
    ...(_0x4139a8 !== null ? {
      inputIndex: _0x4139a8
    } : {}),
    ...(_0x193091 !== null ? {
      fallbackIndex: _0x193091
    } : {})
  };
}
export function getGenerationMediaItemSize(_0x4449b7 = {}) {
  const _0x2dce85 = _0x4449b7 && typeof _0x4449b7 === "object" ? _0x4449b7 : {};
  const _0x5ecc47 = _0x2dce85.metadata && typeof _0x2dce85.metadata === "object" ? _0x2dce85.metadata : {};
  const _0x11de13 = pickPositiveDimension(_0x2dce85.originalWidth, _0x2dce85.imageWidth, _0x2dce85.videoWidth, _0x2dce85.naturalWidth, _0x2dce85.mediaWidth, _0x2dce85.width, _0x5ecc47.originalWidth, _0x5ecc47.imageWidth, _0x5ecc47.videoWidth, _0x5ecc47.width);
  const _0x2f22eb = pickPositiveDimension(_0x2dce85.originalHeight, _0x2dce85.imageHeight, _0x2dce85.videoHeight, _0x2dce85.naturalHeight, _0x2dce85.mediaHeight, _0x2dce85.height, _0x5ecc47.originalHeight, _0x5ecc47.imageHeight, _0x5ecc47.videoHeight, _0x5ecc47.height);
  if (_0x11de13 > 0 && _0x2f22eb > 0) {
    return {
      width: _0x11de13,
      height: _0x2f22eb
    };
  } else {
    return null;
  }
}
export function pickGenerationRatioSourceInput(_0x462fdb = {}, _0x17e7a3 = {}) {
  const _0x3c1f71 = _0x462fdb && typeof _0x462fdb === "object" && !Array.isArray(_0x462fdb) ? _0x462fdb : {};
  const _0xea45a6 = ["image", "video"].flatMap(_0x634d1a => {
    const _0x277d5a = _0x3c1f71[_0x634d1a] ?? _0x3c1f71[_0x634d1a + "s"] ?? [];
    const _0x32fc1d = Array.isArray(_0x277d5a) ? _0x277d5a : _0x277d5a ? [_0x277d5a] : [];
    return _0x32fc1d.filter(Boolean).map(_0x4340fd => ({
      item: _0x4340fd,
      kind: _0x634d1a
    }));
  });
  if (_0xea45a6.length === 0) {
    return null;
  }
  const _0x107fd6 = getGenerationDisplayRatioSourceConfig(_0x17e7a3);
  const _0x3fba16 = _0x107fd6?.kind ? _0xea45a6.filter(({
    kind: _0xd6da6d
  }) => _0xd6da6d === _0x107fd6.kind) : _0xea45a6;
  const _0x1ece67 = _0x3fba16.length > 0 ? _0x3fba16 : _0xea45a6;
  const _0x4b76fd = Array.isArray(_0x107fd6?.slots) ? _0x107fd6.slots : _0x107fd6?.slot ? [_0x107fd6.slot] : [];
  for (const _0x69f2e4 of _0x4b76fd) {
    const _0xd908e1 = _0x1ece67.find(({
      item: _0x4027d0
    }) => String(_0x4027d0?.slotId || _0x4027d0?.refSlot || "").trim() === _0x69f2e4);
    if (_0xd908e1) {
      return _0xd908e1.item;
    }
  }
  const _0x3052e6 = _0x107fd6?.inputIndex !== undefined ? _0x107fd6.inputIndex : _0x107fd6?.fallbackIndex;
  if (Number.isInteger(_0x3052e6) && _0x3052e6 >= 0 && _0x3052e6 < _0x1ece67.length) {
    return _0x1ece67[_0x3052e6]?.item || null;
  }
  return _0x1ece67[0]?.item || null;
}
export function getGenerationInputRatioMediaSize(_0x281ec3 = {}, _0x529fed = {}) {
  return getGenerationMediaItemSize(pickGenerationRatioSourceInput(_0x281ec3, _0x529fed));
}
export function pickGenerationRatioSourceEdge(_0x25c3c5 = [], _0x3d8415 = {}) {
  const _0x54904e = Array.isArray(_0x25c3c5) ? _0x25c3c5.filter(Boolean) : [];
  if (_0x54904e.length === 0) {
    return null;
  }
  const _0xce8133 = getGenerationDisplayRatioSourceConfig(_0x3d8415);
  if (!_0xce8133) {
    return _0x54904e[0] || null;
  }
  const _0x301c0d = Array.isArray(_0xce8133.slots) ? _0xce8133.slots : _0xce8133.slot ? [_0xce8133.slot] : [];
  for (const _0x295e8a of _0x301c0d) {
    const _0x14e7c5 = _0x54904e.find(_0x592348 => String(_0x592348?.refSlot || "").trim() === _0x295e8a);
    if (_0x14e7c5) {
      return _0x14e7c5;
    }
  }
  const _0x5d0616 = _0xce8133.inputIndex !== undefined ? _0xce8133.inputIndex : _0xce8133.fallbackIndex;
  if (Number.isInteger(_0x5d0616) && _0x5d0616 >= 0 && _0x5d0616 < _0x54904e.length) {
    return _0x54904e[_0x5d0616] || null;
  }
  return _0x54904e[0] || null;
}
function getMainImageItem(_0x3157f8, _0x2e402c = null) {
  return pickIndexedItem(_0x3157f8?.images, _0x3157f8?.mainImageIndex, _0x2e402c?.sourceMediaKey);
}
function getMainVideoItem(_0x921f84, _0x40b980 = null) {
  return pickIndexedItem(_0x921f84?.videos, _0x921f84?.mainVideoIndex, _0x40b980?.sourceMediaKey);
}
function getDomMediaSizeByNodeId(_0x129dbb, _0x5bb0c6 = "img, video") {
  const _0x1e37a0 = typeof document !== "undefined" && typeof document.getElementById === "function" && _0x129dbb ? document.getElementById(_0x129dbb) : null;
  const _0x264e1f = _0x1e37a0?.querySelector?.(_0x5bb0c6);
  const _0x71cb00 = pickPositiveDimension(_0x264e1f?.naturalWidth, _0x264e1f?.videoWidth, _0x264e1f?.width);
  const _0x423939 = pickPositiveDimension(_0x264e1f?.naturalHeight, _0x264e1f?.videoHeight, _0x264e1f?.height);
  if (_0x71cb00 > 0 && _0x423939 > 0) {
    return {
      width: _0x71cb00,
      height: _0x423939
    };
  } else {
    return null;
  }
}
export function getGenerationRatioMediaSize(_0x4ac501 = {}, _0x49afd1 = null, {
  includeNodeFrame = false
} = {}) {
  const _0x25b098 = getMainImageItem(_0x4ac501, _0x49afd1);
  const _0x3c552 = getMainVideoItem(_0x4ac501, _0x49afd1);
  const _0x27c7ee = pickPositiveDimension(_0x49afd1?.sourceMediaW, _0x49afd1?.sourceWidth, _0x49afd1?.mediaWidth, _0x25b098?.originalWidth, _0x25b098?.imageWidth, _0x25b098?.width, _0x3c552?.videoWidth, _0x3c552?.originalWidth, _0x3c552?.width, _0x4ac501?.originalWidth, _0x4ac501?.naturalWidth, _0x4ac501?.imageWidth, _0x4ac501?.selectedVideoWidth, _0x4ac501?.videoWidth, _0x4ac501?.mediaWidth, includeNodeFrame ? _0x4ac501?.width : 0);
  const _0x40747c = pickPositiveDimension(_0x49afd1?.sourceMediaH, _0x49afd1?.sourceHeight, _0x49afd1?.mediaHeight, _0x25b098?.originalHeight, _0x25b098?.imageHeight, _0x25b098?.height, _0x3c552?.videoHeight, _0x3c552?.originalHeight, _0x3c552?.height, _0x4ac501?.originalHeight, _0x4ac501?.naturalHeight, _0x4ac501?.imageHeight, _0x4ac501?.selectedVideoHeight, _0x4ac501?.videoHeight, _0x4ac501?.mediaHeight, includeNodeFrame ? _0x4ac501?.height : 0);
  if (_0x27c7ee > 0 && _0x40747c > 0) {
    return {
      width: _0x27c7ee,
      height: _0x40747c
    };
  } else {
    return null;
  }
}
export function getGenerationRatioSizeWithDom({
  nodeId = "",
  nodeData = {},
  edge = null,
  mediaSelector = "img, video",
  includeNodeFrame = false
} = {}) {
  return getGenerationRatioMediaSize(nodeData, edge, {
    includeNodeFrame: false
  }) || getDomMediaSizeByNodeId(nodeId || nodeData?.id, mediaSelector) || getGenerationRatioMediaSize(nodeData, edge, {
    includeNodeFrame: includeNodeFrame
  });
}