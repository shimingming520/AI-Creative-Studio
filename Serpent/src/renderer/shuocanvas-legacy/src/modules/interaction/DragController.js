import { buildSourceMediaNodePayload, getAutoMediaSizeByShortSide } from "../../services/fileService.js";
import { computeSingleNodeSnapGuides, computeMultiNodeSnapGuides, createNodeSpatialIndex, getViewportScreenBounds, snapToCanvasGrid, worldToScreen } from "../../core/math.js";
import { markRendererNodeDragCommitHint } from "../../core/rendererCommitHints.js";
import { buildConnectionPathGeometry, resolveConnectionEndpoints } from "../../core/edgePathGeometry.js";
import { getStoryboardCellPixelBounds, getStoryboardCellIndexAtWorldPoint, getStoryboardCellMetrics, getStoryboardNearestCellIndexAtWorldPoint, isStoryboardCellEmpty, resolveStoryboardCellSourceIndex } from "../../core/storyboardCellUtils.js";
import { isPerfProbeEnabled, recordEdgeRedrawSample } from "../perf/perfProbe.js";
import { collectGroupContainmentReparentOps } from "../groupMembership.js";
import { saveOutputBlob } from "../project.js";
import { localPathToUrl, normalizeLocalPath, pickResultLocalPath } from "../../utils/localMediaPath.js";
import { getCollageItemIndexAtWorldPoint, resolveCollageItemFrames } from "../collage/collageFactory.js";
import { buildEmptyStoryboardCellForSlot as a1020_0x239057, buildFrozenStoryboardCellFromSnapshot, buildStoryboardSourceCropExtract as a1020_0x475f77, buildStoryboardSourceCropExtractFromImage as a1020_0x2e8e00, dataImageUrlToBlob as a1020_0x21c486, getDataImageExtension as a1020_0x2219bd, getImageElementDisplaySrc as a1020_0x4ae07c, getStoryboardCellDisplaySrc as a1020_0x506829, getStoryboardNodeSourceContext as a1020_0x581980, getStoryboardNodeSourceImageUrl as a1020_0x1217b9, getStoryboardPieceSourceImageUrl as a1020_0x288b54, isDataImageRef as a1020_0x50a099, loadStoryboardSourceImage as a1020_0x3b5cac, normalizeStoryboardImageUrl as a1020_0x225e36, resolveCollagePayloadDisplaySnapshot as a1020_0x47f777, resolveStoryboardCellDisplaySnapshot, resolveStoryboardPayloadDisplaySnapshot as a1020_0x281a64, swapStoryboardCellsWithDisplaySnapshots as a1020_0x5752f7, trimStoryboardImageRef as a1020_0x5068c1 } from "../storyboard/storyboardDisplaySnapshot.js";
const MINIMAP_LIVE_DRAG_DOT_LIMIT = 16;
function _looksLikeImageRef(_0x3536a5) {
  if (!_0x3536a5) {
    return false;
  }
  const _0x1bd757 = String(_0x3536a5);
  if (_0x1bd757.startsWith("data:image/")) {
    return true;
  }
  const _0x50b705 = _0x1bd757.split("#")[0].split("?")[0];
  const _0x337ae9 = _0x50b705.toLowerCase();
  if (_0x337ae9.endsWith(".mp4") || _0x337ae9.endsWith(".webm") || _0x337ae9.endsWith(".mov") || _0x337ae9.endsWith(".mkv") || _0x337ae9.endsWith(".mp3") || _0x337ae9.endsWith(".wav") || _0x337ae9.endsWith(".m4a") || _0x337ae9.endsWith(".aac") || _0x337ae9.endsWith(".ogg")) {
    return false;
  }
  if (_0x337ae9.endsWith(".png") || _0x337ae9.endsWith(".jpg") || _0x337ae9.endsWith(".jpeg") || _0x337ae9.endsWith(".webp") || _0x337ae9.endsWith(".gif") || _0x337ae9.endsWith(".bmp") || _0x337ae9.endsWith(".svg")) {
    return true;
  }
  return _0x1bd757.startsWith("http://") || _0x1bd757.startsWith("https://") || _0x1bd757.startsWith("/") || _0x1bd757.startsWith("aic-local-preview:") || _0x1bd757.startsWith("blob:");
}
function _toPositiveNumber(_0x4d8cd4, _0x1d5d57 = null) {
  const _0x505a52 = Number(_0x4d8cd4);
  if (Number.isFinite(_0x505a52) && _0x505a52 > 0) {
    return _0x505a52;
  } else {
    return _0x1d5d57;
  }
}
function _getImagePayloadFromNode(_0x36ed34, _0x1221e9) {
  if (!_0x1221e9) {
    return null;
  }
  let _0x1966f0 = "";
  let _0x3ee929 = null;
  let _0x3638e4 = null;
  let _0x49c3bd = null;
  let _0x3961dc = null;
  let _0x32193c = "";
  let _0x1e5097 = null;
  let _0x513d0f = null;
  let _0x47f3ee = null;
  let _0x55e5fd = "";
  let _0x272e37 = null;
  let _0xbb79f0 = null;
  let _0x68068e = null;
  let _0x35109e = null;
  let _0x190f5c = false;
  let _0x4a3c33 = false;
  let _0x1d0801 = "";
  let _0x1f24da = null;
  let _0x45f81b = "";
  let _0x5c56b3 = null;
  let _0x1885e1 = "";
  if (Array.isArray(_0x1221e9.images) && _0x1221e9.images.length > 0) {
    let _0x13e116 = typeof _0x1221e9.mainImageIndex === "number" ? _0x1221e9.mainImageIndex : 0;
    if (_0x13e116 < 0 || _0x13e116 >= _0x1221e9.images.length) {
      _0x13e116 = 0;
    }
    const _0x4ec5d3 = _0x1221e9.images[_0x13e116] || {};
    _0x190f5c = _0x4ec5d3.storyboardSourceCrop === true || !!_0x4ec5d3.sourceLocalPath || !!_0x4ec5d3.sourceUrl;
    _0x4a3c33 = _0x4ec5d3.storyboardExtractedCell === true || _0x1221e9.storyboardExtractedCell === true;
    const _0x153de4 = _0x4ec5d3.storyboardSourceIndex ?? _0x1221e9.storyboardSourceIndex;
    const _0x97a13f = Number(_0x153de4);
    if (Number.isInteger(_0x97a13f) && _0x97a13f >= 0) {
      _0x1f24da = _0x97a13f;
    }
    _0x45f81b = String(_0x4ec5d3.storyboardSourceNodeId || _0x1221e9.storyboardSourceNodeId || "").trim();
    _0x5c56b3 = _0x4ec5d3.storyboardSourceLocalPath || _0x1221e9.storyboardSourceLocalPath || null;
    _0x1885e1 = _0x4ec5d3.storyboardSourceUrl || _0x1221e9.storyboardSourceUrl || "";
    _0x1d0801 = _0x4ec5d3.capturePreviewUrl || _0x1221e9.capturePreviewUrl || "";
    _0x1966f0 = _0x4ec5d3.imageUrl || _0x4ec5d3.url || _0x1d0801 || "";
    _0x3ee929 = _0x4ec5d3.localPath || _0x1221e9.localPath || null;
    _0x3638e4 = _0x4ec5d3.originalLocalPath || _0x1221e9.originalLocalPath || null;
    _0x49c3bd = _0x4ec5d3.displayLocalPath || _0x1221e9.displayLocalPath || null;
    _0x3961dc = _0x4ec5d3.thumbLocalPath || null;
    _0x32193c = _0x4ec5d3.thumbUrl || "";
    _0x1e5097 = _0x4ec5d3.thumbId || null;
    _0x513d0f = _0x4ec5d3.sourceId || null;
    _0x68068e = _0x4ec5d3.imageWidth || _0x4ec5d3.width || _0x1221e9.imageWidth || null;
    _0x35109e = _0x4ec5d3.imageHeight || _0x4ec5d3.height || _0x1221e9.imageHeight || null;
    if (_0x190f5c) {
      _0x47f3ee = _0x4ec5d3.sourceLocalPath || null;
      _0x55e5fd = _0x4ec5d3.sourceUrl || "";
      _0x272e37 = _0x4ec5d3.sourceWidth || null;
      _0xbb79f0 = _0x4ec5d3.sourceHeight || null;
    }
  } else {
    _0x190f5c = _0x1221e9.storyboardSourceCrop === true || !!_0x1221e9.sourceLocalPath || !!_0x1221e9.sourceUrl;
    _0x4a3c33 = _0x1221e9.storyboardExtractedCell === true;
    const _0x35b598 = Number(_0x1221e9.storyboardSourceIndex);
    if (Number.isInteger(_0x35b598) && _0x35b598 >= 0) {
      _0x1f24da = _0x35b598;
    }
    _0x45f81b = String(_0x1221e9.storyboardSourceNodeId || "").trim();
    _0x5c56b3 = _0x1221e9.storyboardSourceLocalPath || null;
    _0x1885e1 = _0x1221e9.storyboardSourceUrl || "";
    _0x1d0801 = _0x1221e9.capturePreviewUrl || (String(_0x1221e9.src || "").startsWith("data:image/") ? _0x1221e9.src : "");
    _0x1966f0 = _0x1221e9.imageUrl || _0x1221e9.src || _0x1d0801 || "";
    _0x3ee929 = _0x1221e9.localPath || null;
    _0x3638e4 = _0x1221e9.originalLocalPath || null;
    _0x49c3bd = _0x1221e9.displayLocalPath || null;
    _0x3961dc = _0x1221e9.thumbLocalPath || null;
    _0x32193c = _0x1221e9.thumbUrl || "";
    _0x1e5097 = _0x1221e9.thumbId || null;
    _0x513d0f = _0x1221e9.sourceId || null;
    _0x68068e = _0x1221e9.imageWidth || null;
    _0x35109e = _0x1221e9.imageHeight || null;
    if (_0x190f5c) {
      _0x47f3ee = _0x1221e9.sourceLocalPath || null;
      _0x55e5fd = _0x1221e9.sourceUrl || "";
      _0x272e37 = _0x1221e9.sourceWidth || null;
      _0xbb79f0 = _0x1221e9.sourceHeight || null;
    }
  }
  if (!_0x1966f0 && !_0x3ee929 && !_0x3961dc && !_0x32193c && !_0x1e5097 && !_0x513d0f && !_0x1d0801 && !_0x47f3ee && !_0x55e5fd) {
    return null;
  }
  if (_0x36ed34(_0x1221e9, "source-image")) {
    if (_0x1e5097 || _0x513d0f) {
      return {
        url: _0x1966f0,
        localPath: _0x3ee929,
        originalLocalPath: _0x3638e4,
        displayLocalPath: _0x49c3bd,
        thumbLocalPath: _0x3961dc,
        thumbUrl: _0x32193c,
        thumbId: _0x1e5097,
        sourceId: _0x513d0f,
        sourceLocalPath: _0x47f3ee,
        sourceUrl: _0x55e5fd,
        sourceWidth: _0x272e37,
        sourceHeight: _0xbb79f0,
        imageWidth: _0x68068e,
        imageHeight: _0x35109e,
        storyboardSourceCrop: _0x190f5c,
        storyboardExtractedCell: _0x4a3c33,
        capturePreviewUrl: _0x1d0801,
        storyboardSourceIndex: _0x1f24da,
        storyboardSourceNodeId: _0x45f81b,
        storyboardSourceLocalPath: _0x5c56b3,
        storyboardSourceUrl: _0x1885e1
      };
    }
  }
  if (!_looksLikeImageRef(_0x32193c) && !_looksLikeImageRef(_0x3961dc) && !_looksLikeImageRef(_0x3ee929) && !_looksLikeImageRef(_0x1966f0) && !_looksLikeImageRef(_0x1d0801) && !_looksLikeImageRef(_0x47f3ee) && !_looksLikeImageRef(_0x55e5fd)) {
    return null;
  }
  return {
    url: _0x1966f0,
    localPath: _0x3ee929,
    originalLocalPath: _0x3638e4,
    displayLocalPath: _0x49c3bd,
    thumbLocalPath: _0x3961dc,
    thumbUrl: _0x32193c,
    thumbId: _0x1e5097,
    sourceId: _0x513d0f,
    sourceLocalPath: _0x47f3ee,
    sourceUrl: _0x55e5fd,
    sourceWidth: _0x272e37,
    sourceHeight: _0xbb79f0,
    imageWidth: _0x68068e,
    imageHeight: _0x35109e,
    storyboardSourceCrop: _0x190f5c,
    storyboardExtractedCell: _0x4a3c33,
    capturePreviewUrl: _0x1d0801,
    storyboardSourceIndex: _0x1f24da,
    storyboardSourceNodeId: _0x45f81b,
    storyboardSourceLocalPath: _0x5c56b3,
    storyboardSourceUrl: _0x1885e1
  };
}
function _isCellEmpty(_0x33c263) {
  return isStoryboardCellEmpty(_0x33c263);
}
function _resolveStoryboardReplayDropContext(_0x569a83, _0x3bccb7) {
  if (!_0x569a83 || !_0x3bccb7) {
    return {
      isReplay: false
    };
  }
  const _0x3e04ec = Number(_0x569a83.storyboardSourceIndex);
  if (!Number.isInteger(_0x3e04ec) || _0x3e04ec < 0) {
    return {
      isReplay: false
    };
  }
  const _0x43b1fe = String(_0x569a83.storyboardSourceNodeId || "").trim();
  const _0x703528 = a1020_0x225e36(_0x569a83.storyboardSourceLocalPath) || a1020_0x225e36(_0x569a83.storyboardSourceUrl);
  const _0x57bdbe = a1020_0x1217b9(_0x3bccb7);
  const _0x16e732 = !!_0x43b1fe && _0x43b1fe === String(_0x3bccb7.id);
  const _0x18ed17 = !!_0x703528 && !!_0x57bdbe && _0x703528 === _0x57bdbe;
  if (!_0x16e732 && !_0x18ed17) {
    return {
      isReplay: false
    };
  }
  const _0x4f2b5f = a1020_0x581980(_0x3bccb7);
  return {
    isReplay: true,
    sourceIndex: _0x3e04ec,
    sourceLocalPath: _0x4f2b5f.sourceLocalPath,
    sourceUrl: _0x4f2b5f.sourceUrl,
    sourceWidth: Number(_0x3bccb7.storyboardSourceWidth || _0x3bccb7.sourceWidth) || null,
    sourceHeight: Number(_0x3bccb7.storyboardSourceHeight || _0x3bccb7.sourceHeight) || null
  };
}
function _getStoryboardCellInfoAt(_0x201613, _0x16a26a, _0x211234, _0x5e9a92 = {}) {
  for (const _0x39f5bf of Object.values(_0x211234)) {
    if (_0x39f5bf.type !== "storyboard") {
      continue;
    }
    let _0x3420c7 = getStoryboardCellIndexAtWorldPoint(_0x39f5bf, _0x201613, _0x16a26a);
    if (_0x3420c7 < 0 && _0x5e9a92.nearestInGap === true) {
      _0x3420c7 = getStoryboardNearestCellIndexAtWorldPoint(_0x39f5bf, _0x201613, _0x16a26a);
    }
    if (_0x3420c7 >= 0) {
      return {
        nodeId: _0x39f5bf.id,
        cellIndex: _0x3420c7
      };
    }
  }
  return null;
}
function _getLastHoveredStoryboardCellInfo(_0x1aea23, _0x6098cc, _0x5c6779, _0x2e3f6c) {
  const _0x34c973 = _0x1aea23?.lastHoverNodeId || null;
  const _0xfabdc0 = Number(_0x1aea23?.lastHoverCellIndex);
  if (!_0x34c973 || !Number.isInteger(_0xfabdc0) || _0xfabdc0 < 0) {
    return null;
  }
  if (_0x1aea23?.lastHoverKind && _0x1aea23.lastHoverKind !== "storyboard") {
    return null;
  }
  const _0x555d0a = _0x2e3f6c?.[_0x34c973];
  if (!_0x555d0a || _0x555d0a.type !== "storyboard") {
    return null;
  }
  const _0x27954c = getStoryboardCellMetrics(_0x555d0a);
  const _0x59b567 = _0x27954c.cols * _0x27954c.rows;
  if (_0xfabdc0 >= _0x59b567) {
    return null;
  }
  const _0xffccf6 = Number(_0x555d0a.x) || 0;
  const _0x4f3de3 = Number(_0x555d0a.y) || 0;
  const _0x545d16 = Math.max(8, Math.min(40, (Number(_0x555d0a.gridGap) || 0) / 2 + 8));
  if (_0x6098cc < _0xffccf6 - _0x545d16 || _0x6098cc > _0xffccf6 + _0x27954c.width + _0x545d16 || _0x5c6779 < _0x4f3de3 - _0x545d16 || _0x5c6779 > _0x4f3de3 + _0x27954c.height + _0x545d16) {
    return null;
  }
  return {
    nodeId: _0x34c973,
    cellIndex: _0xfabdc0
  };
}
function _getCollageSlotInfoAt(_0x592e4a, _0x323804, _0x29702b) {
  for (const _0x4ec3f9 of Object.values(_0x29702b)) {
    if (_0x4ec3f9.type !== "collage") {
      continue;
    }
    const _0x4bbe30 = getCollageItemIndexAtWorldPoint(_0x4ec3f9, _0x592e4a, _0x323804);
    if (_0x4bbe30 >= 0) {
      return {
        nodeId: _0x4ec3f9.id,
        itemIndex: _0x4bbe30
      };
    }
  }
  return null;
}
function _getCollageItemFrameInfo(_0x269eaf, _0x4983b5) {
  return resolveCollageItemFrames(_0x269eaf).find(_0x9d5dd0 => _0x9d5dd0.index === _0x4983b5) || null;
}
function _getCollageItemCenterWorldPoint(_0x27d003, _0x3f4d67) {
  const _0x553c61 = _getCollageItemFrameInfo(_0x27d003, _0x3f4d67);
  const _0x3a815e = _0x553c61?.frame;
  if (!_0x3a815e) {
    return {
      x: (Number(_0x27d003?.x) || 0) + (Number(_0x27d003?.width) || 1) / 2,
      y: (Number(_0x27d003?.y) || 0) + (Number(_0x27d003?.height) || 1) / 2
    };
  }
  return {
    x: (Number(_0x27d003?.x) || 0) + _0x3a815e.x + _0x3a815e.width / 2,
    y: (Number(_0x27d003?.y) || 0) + _0x3a815e.y + _0x3a815e.height / 2
  };
}
function _clearStoryboardHighlight(_0x121092) {
  if (!_0x121092) {
    return;
  }
  window.v2Renderer?.highlightDropSlot?.(_0x121092, {
    kind: "storyboard",
    index: -1
  });
}
function _clearDropSlotHighlight(_0x45af7e) {
  if (!_0x45af7e) {
    return;
  }
  window.v2Renderer?.clearDropSlotHighlight?.(_0x45af7e);
}
function _highlightDropSlot(_0x19bbf2, _0x4a02dc, _0x31ac17) {
  if (!_0x19bbf2) {
    return;
  }
  window.v2Renderer?.highlightDropSlot?.(_0x19bbf2, {
    kind: _0x4a02dc,
    index: _0x31ac17
  });
}
function _getStoryboardCellCenterWorldPoint(_0x5aef39, _0x41185f) {
  const _0x54d116 = getStoryboardCellMetrics(_0x5aef39);
  const _0x4c1e15 = getStoryboardCellPixelBounds(_0x5aef39, _0x41185f);
  if (_0x4c1e15) {
    return {
      x: (Number(_0x5aef39?.x) || 0) + _0x4c1e15.x0 + _0x4c1e15.width / 2,
      y: (Number(_0x5aef39?.y) || 0) + _0x4c1e15.y0 + _0x4c1e15.height / 2
    };
  }
  const _0x76c374 = _0x41185f % _0x54d116.cols;
  const _0x7ac47 = Math.floor(_0x41185f / _0x54d116.cols);
  return {
    x: (Number(_0x5aef39?.x) || 0) + _0x54d116.inset + _0x76c374 * (_0x54d116.cellWidth + _0x54d116.gap) + _0x54d116.cellWidth / 2,
    y: (Number(_0x5aef39?.y) || 0) + _0x54d116.inset + _0x7ac47 * (_0x54d116.cellHeight + _0x54d116.gap) + _0x54d116.cellHeight / 2
  };
}
function _canvasToJpegBlob(_0x23b610) {
  if (!_0x23b610 || typeof _0x23b610.toBlob !== "function") {
    return Promise.resolve(null);
  }
  return new Promise(_0x2407e5 => _0x23b610.toBlob(_0x2407e5, "image/jpeg", 0.9));
}
function _buildExtractNodeCropPatch(_0x243d7d) {
  if (!_0x243d7d?.dataUrl) {
    return null;
  }
  return {
    src: "",
    capturePreviewUrl: _0x243d7d.dataUrl,
    localPath: "",
    fileName: _0x243d7d.fileName,
    originalWidth: _0x243d7d.width,
    originalHeight: _0x243d7d.height,
    imageWidth: _0x243d7d.width,
    imageHeight: _0x243d7d.height,
    needsAutoResize: false,
    sourceLocalPath: null,
    sourceUrl: "",
    sourceWidth: null,
    sourceHeight: null,
    storyboardSourceCrop: false,
    storyboardExtractedCell: true
  };
}
async function _saveStoryboardDataImageSnapshot(_0x342900, _0x595817, _0xe1b25) {
  const _0x19e82d = a1020_0x5068c1(_0x342900?.capturePreviewUrl);
  if (!a1020_0x50a099(_0x19e82d)) {
    return null;
  }
  const _0x3fb742 = a1020_0x21c486(_0x19e82d);
  if (!_0x3fb742) {
    return null;
  }
  const _0x197aba = a1020_0x2219bd(_0x19e82d);
  const _0x19c905 = _0x595817 || _0x342900?.fileName || "storyboard_extract." + _0x197aba;
  const _0x310cea = typeof File === "function" ? new File([_0x3fb742], _0x19c905, {
    type: _0x3fb742.type || "image/" + (_0x197aba === "jpg" ? "jpeg" : _0x197aba)
  }) : _0x3fb742;
  const _0x5bc278 = await _0xe1b25(_0x310cea, {
    ext: _0x197aba
  });
  const _0x3b76fc = pickResultLocalPath(_0x5bc278);
  const _0x284488 = String(_0x5bc278?.url || "").trim() || localPathToUrl(_0x3b76fc);
  if (!_0x284488 || !_0x3b76fc) {
    return null;
  }
  return {
    saved: _0x5bc278,
    localPath: _0x3b76fc,
    src: _0x284488
  };
}
function _buildPersistedStoryboardImagePatch(_0x5e90de, _0x33d73b) {
  const _0x27fe66 = _0x33d73b?.saved || {};
  const _0x4c8342 = _0x33d73b?.localPath || "";
  const _0x41f75e = _0x33d73b?.src || localPathToUrl(_0x4c8342);
  const _0x297484 = _toPositiveNumber(_0x27fe66.originalWidth) || _toPositiveNumber(_0x5e90de?.width) || null;
  const _0x2c74de = _toPositiveNumber(_0x27fe66.originalHeight) || _toPositiveNumber(_0x5e90de?.height) || null;
  return {
    src: _0x41f75e,
    url: "",
    localPath: _0x4c8342,
    originalLocalPath: normalizeLocalPath(_0x27fe66.originalLocalPath || _0x4c8342),
    displayLocalPath: normalizeLocalPath(_0x27fe66.displayLocalPath),
    thumbLocalPath: normalizeLocalPath(_0x27fe66.thumbLocalPath),
    capturePreviewUrl: "",
    fileName: _0x27fe66.filename || _0x5e90de?.fileName || "",
    originalWidth: _0x297484,
    originalHeight: _0x2c74de,
    imageWidth: _0x297484,
    imageHeight: _0x2c74de
  };
}
async function _persistStoryboardSnapshotPreviewToNode(_0x313f9a, _0x2f1d7f, _0x266841, _0x419cc8, _0xc78f6a = saveOutputBlob) {
  if (!a1020_0x50a099(_0x266841?.capturePreviewUrl)) {
    return;
  }
  try {
    const _0x4cc477 = await _saveStoryboardDataImageSnapshot(_0x266841, _0x419cc8, _0xc78f6a);
    if (!_0x4cc477) {
      return;
    }
    if (!_0x313f9a.getStateRaw().nodes?.[_0x2f1d7f]) {
      return;
    }
    _0x313f9a.updateNodeData(_0x2f1d7f, _buildPersistedStoryboardImagePatch(_0x266841, _0x4cc477));
  } catch (_0x1baff5) {
    console.warn("[DragController] 分镜临时预览落盘失败:", _0x1baff5);
  }
}
async function _persistStoryboardSnapshotPreviewToCell(_0x215fd3, _0x3c7bd2, _0x25e241, _0x3da6a0, _0x571141, _0x240623, _0x5e1547 = saveOutputBlob) {
  const _0x20c423 = a1020_0x5068c1(_0x571141?.capturePreviewUrl);
  if (!a1020_0x50a099(_0x20c423)) {
    return;
  }
  try {
    const _0xe3a2ae = await _saveStoryboardDataImageSnapshot(_0x571141, _0x240623, _0x5e1547);
    if (!_0xe3a2ae) {
      return;
    }
    const _0x48a3f7 = _0x215fd3.getStateRaw().nodes?.[_0x3c7bd2];
    const _0x4ac879 = Array.isArray(_0x48a3f7?.cells) ? _0x48a3f7.cells : [];
    const _0x5ad311 = _0x4ac879[_0x25e241];
    if (!_0x5ad311 || _isCellEmpty(_0x5ad311)) {
      return;
    }
    if (_0x3da6a0 && String(_0x5ad311.id || "") !== String(_0x3da6a0)) {
      return;
    }
    if (a1020_0x5068c1(_0x5ad311.capturePreviewUrl) !== _0x20c423) {
      return;
    }
    const _0x1a0d9a = [..._0x4ac879];
    _0x1a0d9a[_0x25e241] = {
      ..._0x5ad311,
      ..._buildPersistedStoryboardImagePatch(_0x571141, _0xe3a2ae),
      sourceLocalPath: null,
      sourceUrl: "",
      sourceWidth: null,
      sourceHeight: null,
      storyboardSourceCrop: false,
      storyboardPiece: false,
      isEmpty: false
    };
    _0x215fd3.updateNodeData(_0x3c7bd2, {
      cells: _0x1a0d9a
    });
  } catch (_0x545dc6) {
    console.warn("[DragController] 分镜宫格临时预览落盘失败:", _0x545dc6);
  }
}
async function _persistStoryboardSourceCropExtract(_0x151e60, _0x570189, _0x1866a9, _0x56da77 = saveOutputBlob) {
  if (typeof window === "undefined") {
    return;
  }
  if (!_0x1866a9?.canvas || !_0x1866a9.dataUrl || !_0x570189) {
    return;
  }
  try {
    const _0x58e805 = await _canvasToJpegBlob(_0x1866a9.canvas);
    if (!_0x58e805) {
      return;
    }
    const _0x45124c = typeof File === "function" ? new File([_0x58e805], _0x1866a9.fileName, {
      type: "image/jpeg"
    }) : _0x58e805;
    const _0x3f0bf7 = await _0x56da77(_0x45124c, {
      ext: "jpg"
    });
    const _0x538085 = pickResultLocalPath(_0x3f0bf7);
    const _0x13149d = String(_0x3f0bf7?.url || "").trim() || localPathToUrl(_0x538085);
    if (!_0x13149d || !_0x538085) {
      return;
    }
    if (!_0x151e60.getStateRaw().nodes?.[_0x570189]) {
      return;
    }
    _0x151e60.updateNodeData(_0x570189, {
      src: _0x13149d,
      localPath: _0x538085,
      originalLocalPath: normalizeLocalPath(_0x3f0bf7?.originalLocalPath || _0x538085),
      displayLocalPath: normalizeLocalPath(_0x3f0bf7?.displayLocalPath),
      thumbLocalPath: normalizeLocalPath(_0x3f0bf7?.thumbLocalPath),
      fileName: _0x3f0bf7?.filename || _0x1866a9.fileName,
      originalWidth: Number(_0x3f0bf7?.originalWidth || _0x1866a9.width) || _0x1866a9.width,
      originalHeight: Number(_0x3f0bf7?.originalHeight || _0x1866a9.height) || _0x1866a9.height,
      imageWidth: _0x1866a9.width,
      imageHeight: _0x1866a9.height,
      needsAutoResize: false
    });
  } catch (_0xd574bc) {
    console.warn("[DragController] 保存自定义分镜提取结果失败:", _0xd574bc);
  }
}
function _refreshStoryboardSourceCropExtractInBackground(_0x34ecf0, _0x18bb46, _0x4a0a9a, _0x4ceb99, _0x148714, _0x28e3f7) {
  const _0x452403 = a1020_0x288b54(_0x148714, _0x4a0a9a);
  if (!_0x452403 || !_0x18bb46) {
    return;
  }
  const _0x5cf08e = {
    cols: _0x4a0a9a?.cols,
    rows: _0x4a0a9a?.rows,
    width: _0x4a0a9a?.width,
    height: _0x4a0a9a?.height,
    gridGap: _0x4a0a9a?.gridGap,
    gridLayout: _0x4a0a9a?.gridLayout
  };
  a1020_0x3b5cac(_0x452403).then(_0x47775b => {
    if (!_0x47775b || !_0x34ecf0.getStateRaw().nodes?.[_0x18bb46]) {
      return;
    }
    const _0x42be8e = resolveStoryboardCellSourceIndex(_0x148714, _0x4ceb99, _0x4a0a9a);
    const _0x1290db = a1020_0x2e8e00(_0x5cf08e, _0x4ceb99, _0x47775b, _0x28e3f7, _0x42be8e);
    const _0x2f06e8 = _buildExtractNodeCropPatch(_0x1290db);
    if (!_0x2f06e8 || !_0x34ecf0.getStateRaw().nodes?.[_0x18bb46]) {
      return;
    }
    _0x34ecf0.updateNodeData(_0x18bb46, _0x2f06e8);
    _persistStoryboardSourceCropExtract(_0x34ecf0, _0x18bb46, _0x1290db);
  }).catch(_0x13e861 => {
    console.warn("[DragController] 异步刷新自定义分镜提取预览失败:", _0x13e861);
  });
}
let _cachedMultiSelectBoxEl = null;
const TITLE_DRAG_ACTIVATE_THRESHOLD_PX = 5;
const HEAVY_EDGE_DRAG_MIN_ZOOM = 0.2;
const HEAVY_EDGE_DRAG_MAX_ZOOM = 0.48;
const HEAVY_EDGE_DRAG_MIN_EDGES = 3;
const HEAVY_EDGE_DRAG_SUPPRESS_LIVE_PAINT_EDGES = 400;
const DRAG_SNAP_GUIDE_NODE_LIMIT = 160;
const DRAG_EDGE_SCREEN_EPSILON_PX = 6;
const EDGE_INTERACTION_LITE_CLASS = "is-edge-interaction-lite";
const _dragSnapSpatialIndexCache = {
  nodes: null,
  persistRev: -1,
  index: null
};
const _dragHitSpatialIndexCache = {
  nodes: null,
  persistRev: -1,
  index: null
};
function _resolveDragSnapNodeRect(_0x481292) {
  if (!_0x481292 || typeof _0x481292 !== "object") {
    return null;
  }
  return {
    x: _0x481292.x,
    y: _0x481292.y,
    width: _0x481292.width || 200,
    height: _0x481292.height || 200
  };
}
function _getDragSnapSpatialIndex(_0x32948d) {
  const _0x4e6b7e = _0x32948d?.nodes;
  if (!_0x4e6b7e || typeof _0x4e6b7e !== "object") {
    return null;
  }
  const _0x199ad9 = Number.isFinite(_0x32948d?._persistRev) ? _0x32948d._persistRev : -1;
  if (_dragSnapSpatialIndexCache.nodes === _0x4e6b7e && _dragSnapSpatialIndexCache.persistRev === _0x199ad9) {
    return _dragSnapSpatialIndexCache.index;
  }
  const _0x334800 = createNodeSpatialIndex(_0x4e6b7e, {
    resolveRect: _resolveDragSnapNodeRect
  });
  _dragSnapSpatialIndexCache.nodes = _0x4e6b7e;
  _dragSnapSpatialIndexCache.persistRev = _0x199ad9;
  _dragSnapSpatialIndexCache.index = _0x334800;
  return _0x334800;
}
function _getDragHitSpatialIndex(_0x56b63f) {
  const _0x3bf11e = _0x56b63f?.nodes;
  if (!_0x3bf11e || typeof _0x3bf11e !== "object") {
    return null;
  }
  const _0x5de7e9 = Number.isFinite(_0x56b63f?._persistRev) ? _0x56b63f._persistRev : -1;
  if (_dragHitSpatialIndexCache.nodes === _0x3bf11e && _dragHitSpatialIndexCache.persistRev === _0x5de7e9) {
    return _dragHitSpatialIndexCache.index;
  }
  const _0x4a05d9 = createNodeSpatialIndex(_0x3bf11e);
  _dragHitSpatialIndexCache.nodes = _0x3bf11e;
  _dragHitSpatialIndexCache.persistRev = _0x5de7e9;
  _dragHitSpatialIndexCache.index = _0x4a05d9;
  return _0x4a05d9;
}
function _shouldUseDragSnapGuides(_0x28c813, _0x537a37) {
  if (_0x28c813?.ui?.snapGuidesEnabled === false || _0x537a37) {
    return false;
  }
  const _0x1e997d = Number.isFinite(_0x28c813?._nodeCount) ? _0x28c813._nodeCount : Object.keys(_0x28c813?.nodes || {}).length;
  return _0x1e997d <= DRAG_SNAP_GUIDE_NODE_LIMIT;
}
function _collectAffectedEdgesForTargets(_0x3672b3, _0x46d768) {
  const _0x3786f2 = window.v2Renderer;
  if (_0x3786f2 && typeof _0x3786f2.getEdgeIdsForNode === "function") {
    const _0x5727e7 = new Set();
    for (const _0x2b6553 of _0x3672b3 || []) {
      const _0x45ff47 = _0x3786f2.getEdgeIdsForNode(_0x2b6553);
      if (!Array.isArray(_0x45ff47) || _0x45ff47.length === 0) {
        continue;
      }
      for (const _0x55b231 of _0x45ff47) {
        _0x5727e7.add(_0x55b231);
      }
    }
    return Array.from(_0x5727e7).map(_0x304f63 => _0x46d768?.[_0x304f63]).filter(Boolean);
  }
  const _0x4af953 = _0x3672b3 instanceof Set ? _0x3672b3 : new Set(_0x3672b3 || []);
  return Object.values(_0x46d768 || {}).filter(_0x9219fa => _0x4af953.has(_0x9219fa?.sourceId) || _0x4af953.has(_0x9219fa?.targetId));
}
function _flushStoryboardNodesNow(..._0x43702e) {
  const _0x638af5 = typeof window !== "undefined" ? window.v2Renderer : null;
  if (!_0x638af5 || typeof _0x638af5.flushNodes !== "function") {
    return false;
  }
  return _0x638af5.flushNodes(Array.from(new Set(_0x43702e.filter(Boolean))));
}
function _flushMovedGroupPositionsNow(_0x5f4b3c, _0x1b3234, _0x8bf363) {
  if (typeof _0x8bf363 !== "function") {
    return false;
  }
  const _0x585b3e = Array.from(new Set(_0x1b3234 || [])).filter(_0x590027 => _0x8bf363(_0x5f4b3c?.[_0x590027], "group"));
  if (_0x585b3e.length === 0) {
    return false;
  }
  const _0x2ea6f1 = typeof window !== "undefined" ? window.v2Renderer : null;
  if (!_0x2ea6f1 || typeof _0x2ea6f1.flushNodes !== "function") {
    return false;
  }
  return _0x2ea6f1.flushNodes(_0x585b3e);
}
function _flushSelectionFeedbackNow(_0x2906c9) {
  const _0x16cc65 = typeof window !== "undefined" ? window.v2Renderer : null;
  if (!_0x16cc65 || typeof _0x16cc65.flushSelection !== "function") {
    return false;
  }
  return _0x16cc65.flushSelection(Array.from(new Set((_0x2906c9 || []).filter(Boolean))));
}
function _applyImmediateCellSwapPreview(_0x56afd0, _0x4a181a, _0x265e5f) {
  const _0x924a9b = typeof window !== "undefined" ? window.v2Renderer : null;
  if (!_0x924a9b || typeof _0x924a9b.applyImmediateCellSwapPreview !== "function") {
    return {
      ok: false,
      revert() {}
    };
  }
  return _0x924a9b.applyImmediateCellSwapPreview(_0x56afd0, {
    sourceIndex: _0x4a181a,
    targetIndex: _0x265e5f
  });
}
function _getDragEdgeScheduler(_0x5f192a) {
  if (!_0x5f192a._dragEdgeScheduler) {
    _0x5f192a._dragEdgeScheduler = {
      rafId: 0,
      pendingPayload: null,
      lastPayload: null,
      lastPaintDx: null,
      lastPaintDy: null,
      liteClassActive: false,
      transformedEdgeIds: new Set()
    };
  }
  return _0x5f192a._dragEdgeScheduler;
}
function _setEdgeInteractionLiteClass(_0x3c0a2d, _0x2dfb75) {
  if (!_0x3c0a2d || _0x3c0a2d.liteClassActive === _0x2dfb75) {
    return;
  }
  const _0x71672 = typeof document !== "undefined" ? document.body : null;
  if (!_0x71672 || !_0x71672.classList) {
    _0x3c0a2d.liteClassActive = _0x2dfb75;
    return;
  }
  _0x71672.classList.toggle(EDGE_INTERACTION_LITE_CLASS, _0x2dfb75);
  _0x3c0a2d.liteClassActive = _0x2dfb75;
}
function _getRafFns() {
  const _0x3b7fd7 = typeof requestAnimationFrame === "function" && requestAnimationFrame || typeof window !== "undefined" && typeof window.requestAnimationFrame === "function" && window.requestAnimationFrame.bind(window);
  const _0x4f6be4 = typeof cancelAnimationFrame === "function" && cancelAnimationFrame || typeof window !== "undefined" && typeof window.cancelAnimationFrame === "function" && window.cancelAnimationFrame.bind(window);
  return {
    raf: _0x3b7fd7 || (_0x3dad76 => setTimeout(_0x3dad76, 0)),
    cancel: _0x4f6be4 || (_0x38c867 => clearTimeout(_0x38c867))
  };
}
function _isDraggedEdgeVisible(_0x34188e, _0x7084e7, _0x5bcdf6, _0x5aeb77, _0x2edec5) {
  const _0x28323b = typeof window !== "undefined" && Number.isFinite(window.innerWidth) ? window.innerWidth : 0;
  const _0x966cad = typeof window !== "undefined" && Number.isFinite(window.innerHeight) ? window.innerHeight : 0;
  const _0x292188 = getViewportScreenBounds(_0x2edec5, _0x28323b, _0x966cad);
  const _0x44c394 = 200;
  const _0x2a7c44 = worldToScreen(_0x34188e, _0x7084e7, _0x2edec5);
  const _0x6d70ba = worldToScreen(_0x5bcdf6, _0x5aeb77, _0x2edec5);
  const _0x345490 = _0x2a7c44.x;
  const _0x43d1a4 = _0x2a7c44.y;
  const _0x5b5991 = _0x6d70ba.x;
  const _0x30dfd6 = _0x6d70ba.y;
  const _0x199e14 = Math.min(_0x345490, _0x5b5991);
  const _0x1c1876 = Math.min(_0x43d1a4, _0x30dfd6);
  const _0x481caf = Math.max(_0x345490, _0x5b5991);
  const _0x55d3cd = Math.max(_0x43d1a4, _0x30dfd6);
  return _0x481caf > _0x292188.left - _0x44c394 && _0x199e14 < _0x292188.right + _0x44c394 && _0x55d3cd > _0x292188.top - _0x44c394 && _0x1c1876 < _0x292188.bottom + _0x44c394;
}
function _formatEdgeTranslate(_0x139dc1, _0x4b9fdd) {
  return "translate(" + (Number(_0x139dc1) || 0) + " " + (Number(_0x4b9fdd) || 0) + ")";
}
function _collectDraggedEdgeUpdates(_0x251652, {
  cullInvisible = false
} = {}) {
  const {
    affectedEdges: _0x5b0724,
    edgeDomCache: _0x30be61,
    nodes: _0x372673,
    targetSet: _0x313610,
    viewport: _0x4f825c,
    pendingDx: _0x29b467,
    pendingDy: _0x19ed44,
    connectionLineStyle: _0x47c54f,
    useEdgeGroupTransform = false
  } = _0x251652;
  const _0x3021b4 = [];
  const _0x49ba52 = [];
  _0x5b0724.forEach(_0x2aeb85 => {
    const _0x5a57db = _0x30be61.get(_0x2aeb85.id);
    if (!_0x5a57db) {
      return;
    }
    const _0x84e890 = _0x2aeb85.sourceId;
    const _0x892ec4 = _0x2aeb85.targetId;
    const _0x123274 = _0x372673[_0x84e890];
    const _0x1930ba = _0x372673[_0x892ec4];
    if (!_0x123274 || !_0x1930ba) {
      return;
    }
    const _0x4816f5 = _0x313610.has(_0x84e890);
    const _0x5efe4f = _0x313610.has(_0x892ec4);
    const _0x59bf1e = _0x4816f5 ? _0x123274.x + _0x29b467 : _0x123274.x;
    const _0x53724c = _0x4816f5 ? _0x123274.y + _0x19ed44 : _0x123274.y;
    const _0x17e72b = _0x5efe4f ? _0x1930ba.x + _0x29b467 : _0x1930ba.x;
    const _0x3cc779 = _0x5efe4f ? _0x1930ba.y + _0x19ed44 : _0x1930ba.y;
    const _0x4f9fa1 = resolveConnectionEndpoints({
      sourceX: _0x59bf1e,
      sourceY: _0x53724c,
      sourceWidth: _0x123274.width || 260,
      sourceHeight: _0x123274.height || 100,
      targetX: _0x17e72b,
      targetY: _0x3cc779,
      targetWidth: _0x1930ba.width || 260,
      targetHeight: _0x1930ba.height || 100
    });
    const {
      startX: _0x13a1bf,
      startY: _0x269cdd,
      endX: _0x371ccb,
      endY: _0x3470d5
    } = _0x4f9fa1;
    if (cullInvisible && !_isDraggedEdgeVisible(_0x13a1bf, _0x269cdd, _0x371ccb, _0x3470d5, _0x4f825c)) {
      return;
    }
    if (useEdgeGroupTransform && _0x4816f5 && _0x5efe4f) {
      _0x49ba52.push({
        edgeId: _0x2aeb85.id,
        domCache: _0x5a57db,
        transform: _formatEdgeTranslate(_0x29b467, _0x19ed44)
      });
      return;
    }
    const {
      d: _0xa0e2f8
    } = buildConnectionPathGeometry({
      ..._0x4f9fa1,
      style: _0x47c54f
    });
    _0x3021b4.push({
      domCache: _0x5a57db,
      d: _0xa0e2f8
    });
  });
  return {
    pathsToUpdate: _0x3021b4,
    transformsToUpdate: _0x49ba52
  };
}
function _applyDraggedEdgePathUpdates(_0x2b0f48, {
  mainOnly = false
} = {}) {
  for (const _0x11725f of _0x2b0f48) {
    if (!mainOnly) {
      _0x11725f.domCache.hoverPath?.setAttribute?.("d", _0x11725f.d);
    }
    _0x11725f.domCache.pathEl?.setAttribute?.("d", _0x11725f.d);
  }
}
function _applyDraggedEdgeTransformUpdates(_0x6e8860, _0xae19f8 = null) {
  for (const _0x115683 of _0x6e8860) {
    if (!_0x115683?.domCache?.groupEl) {
      continue;
    }
    if (_0x115683.transform) {
      _0x115683.domCache.groupEl.setAttribute?.("transform", _0x115683.transform);
      _0xae19f8?.transformedEdgeIds?.add?.(_0x115683.edgeId);
    } else {
      _0x115683.domCache.groupEl.removeAttribute?.("transform");
      _0xae19f8?.transformedEdgeIds?.delete?.(_0x115683.edgeId);
    }
  }
}
function _clearDragEdgeTransformPreview(_0x4ba8b5) {
  const _0x21307a = _0x4ba8b5?._dragEdgeScheduler;
  if (!_0x21307a?.transformedEdgeIds?.size) {
    return;
  }
  const _0x4aef45 = typeof window !== "undefined" ? window._edgeDomCache : null;
  if (!_0x4aef45 || typeof _0x4aef45.get !== "function") {
    _0x21307a.transformedEdgeIds.clear();
    return;
  }
  for (const _0x51b45c of _0x21307a.transformedEdgeIds) {
    _0x4aef45.get(_0x51b45c)?.groupEl?.removeAttribute?.("transform");
  }
  _0x21307a.transformedEdgeIds.clear();
}
function _trackMinimapDragDot(_0x116c1e, _0x986672) {
  if (!_0x116c1e || !_0x986672) {
    return;
  }
  if (!_0x116c1e._minimapDragDots) {
    _0x116c1e._minimapDragDots = new Set();
  }
  _0x116c1e._minimapDragDots.add(_0x986672);
}
function _deferMinimapDragDotRefresh(_0x3cba64) {
  if (_0x3cba64) {
    _0x3cba64._minimapDragDotsDeferred = true;
  }
}
function _finishMinimapDragPreview(_0x545e06) {
  if (!_0x545e06) {
    return;
  }
  const _0x17c954 = _0x545e06._minimapDragDots instanceof Set ? _0x545e06._minimapDragDots : null;
  if (_0x17c954) {
    _0x17c954.forEach(_0x567b50 => {
      if (_0x567b50?.style) {
        _0x567b50.style.transform = "";
      }
    });
    _0x17c954.clear();
  }
  const _0x69a520 = Boolean(_0x545e06._minimapDragDotsDeferred || _0x17c954);
  _0x545e06._minimapDragDotsDeferred = false;
  if (_0x69a520 && typeof window !== "undefined" && typeof window._v2ScheduleMinimapNodeRefresh === "function") {
    window._v2ScheduleMinimapNodeRefresh();
  }
}
function _paintDraggedEdges(_0x177612, _0x39609b, {
  force = false,
  mainOnly = false,
  cullInvisible = false
} = {}) {
  const _0x20adbd = Number(_0x177612?.viewport?.zoom) || 1;
  if (!force && _0x39609b) {
    const _0x58b0c7 = _0x39609b.lastPaintDx;
    const _0x1635ae = _0x39609b.lastPaintDy;
    if (Number.isFinite(_0x58b0c7) && Number.isFinite(_0x1635ae)) {
      const _0x278d47 = Math.abs((_0x177612.pendingDx - _0x58b0c7) * _0x20adbd);
      const _0x2da275 = Math.abs((_0x177612.pendingDy - _0x1635ae) * _0x20adbd);
      if (_0x278d47 < DRAG_EDGE_SCREEN_EPSILON_PX && _0x2da275 < DRAG_EDGE_SCREEN_EPSILON_PX) {
        return false;
      }
    }
  }
  const _0x1b156c = isPerfProbeEnabled();
  const _0x3e4247 = _0x1b156c && typeof performance !== "undefined" && typeof performance.now === "function" ? performance.now() : 0;
  const {
    pathsToUpdate: _0x4005b9,
    transformsToUpdate: _0x23654b
  } = _collectDraggedEdgeUpdates(_0x177612, {
    cullInvisible: cullInvisible
  });
  _applyDraggedEdgeTransformUpdates(_0x23654b, _0x39609b);
  _applyDraggedEdgePathUpdates(_0x4005b9, {
    mainOnly: mainOnly
  });
  if (_0x1b156c) {
    const _0x2f755f = typeof performance !== "undefined" && typeof performance.now === "function" ? performance.now() : Date.now();
    const _0x5c21f6 = Array.isArray(_0x177612?.affectedEdges) ? _0x177612.affectedEdges.length : 0;
    const _0x1ec23a = _0x4005b9.length + _0x23654b.length;
    recordEdgeRedrawSample("partial", _0x2f755f - _0x3e4247, {
      reason: "drag-controller",
      edgeCount: _0x5c21f6,
      visibleEdgeCount: _0x1ec23a,
      updatedCount: _0x1ec23a,
      createdCount: 0,
      removedCount: 0,
      reusedCount: _0x1ec23a,
      skippedInvisibleCount: Math.max(0, _0x5c21f6 - _0x1ec23a),
      cacheSize: Number.isFinite(_0x177612?.edgeDomCache?.size) ? _0x177612.edgeDomCache.size : 0
    });
  }
  if (_0x39609b) {
    _0x39609b.lastPaintDx = _0x177612.pendingDx;
    _0x39609b.lastPaintDy = _0x177612.pendingDy;
    _0x39609b.lastPayload = _0x177612;
  }
  return true;
}
function _flushDragEdgeScheduler(_0x5c2555) {
  const _0x335e65 = _0x5c2555?._dragEdgeScheduler;
  if (!_0x335e65) {
    return;
  }
  const _0x512973 = _0x335e65.pendingPayload || _0x335e65.lastPayload;
  _0x335e65.pendingPayload = null;
  _0x335e65.lastPayload = null;
  if (_0x335e65.rafId) {
    const {
      cancel: _0x44435c
    } = _getRafFns();
    _0x44435c(_0x335e65.rafId);
    _0x335e65.rafId = 0;
  }
  if (_0x512973) {
    _paintDraggedEdges(_0x512973, _0x335e65, {
      force: true
    });
  }
  _0x335e65.lastPaintDx = null;
  _0x335e65.lastPaintDy = null;
  _setEdgeInteractionLiteClass(_0x335e65, false);
}
function _scheduleDraggedEdges(_0x33395c, _0x178307) {
  const _0x5cf1bf = _getDragEdgeScheduler(_0x33395c);
  _0x5cf1bf.pendingPayload = _0x178307;
  _0x5cf1bf.lastPayload = _0x178307;
  _setEdgeInteractionLiteClass(_0x5cf1bf, true);
  if (_0x5cf1bf.rafId) {
    return;
  }
  const {
    raf: _0x28e932
  } = _getRafFns();
  _0x5cf1bf.rafId = _0x28e932(() => {
    _0x5cf1bf.rafId = 0;
    const _0x574b6e = _0x5cf1bf.pendingPayload;
    _0x5cf1bf.pendingPayload = null;
    if (_0x574b6e) {
      _paintDraggedEdges(_0x574b6e, _0x5cf1bf, {
        mainOnly: true,
        cullInvisible: true
      });
    }
  });
}
function _updateDraggedEdges(_0x579194, _0x53946d) {
  const _0x88b608 = _getDragEdgeScheduler(_0x579194);
  const _0x2cc1aa = Number(_0x53946d?.viewport?.zoom) || 1;
  const _0x390cab = Number.isFinite(_0x53946d?.edgeCount) ? _0x53946d.edgeCount : 0;
  const _0x35a7f1 = _0x53946d?.fullFidelityDragEdges === true;
  const _0x1e7a15 = Math.max(_0x390cab, _0x53946d.affectedEdges.length);
  const _0xc8d782 = !_0x35a7f1 && _0x2cc1aa >= HEAVY_EDGE_DRAG_MIN_ZOOM && _0x2cc1aa <= HEAVY_EDGE_DRAG_MAX_ZOOM && _0x1e7a15 >= HEAVY_EDGE_DRAG_MIN_EDGES && _0x53946d.edgeDomCache && _0x53946d.edgeDomCache.size > 0;
  if (!_0xc8d782) {
    if (_0x88b608.pendingPayload || _0x88b608.rafId) {
      _flushDragEdgeScheduler(_0x579194);
    }
    _0x88b608.lastPaintDx = null;
    _0x88b608.lastPaintDy = null;
    _setEdgeInteractionLiteClass(_0x88b608, false);
    _paintDraggedEdges(_0x53946d, _0x88b608, {
      force: true
    });
    return;
  }
  if (_0x390cab >= HEAVY_EDGE_DRAG_SUPPRESS_LIVE_PAINT_EDGES) {
    _0x88b608.pendingPayload = _0x53946d;
    _0x88b608.lastPayload = _0x53946d;
    _setEdgeInteractionLiteClass(_0x88b608, true);
    return;
  }
  _scheduleDraggedEdges(_0x579194, _0x53946d);
}
function _getNodeWrapperEl(_0x56f647) {
  if (!_0x56f647) {
    return null;
  }
  if (typeof window === "undefined") {
    return null;
  }
  return window.v2Renderer?.getMountedWrapper?.(_0x56f647) || null;
}
function _syncNodeDragPreview(_0x3a8794, _0x5275fc) {
  if (!_0x3a8794) {
    return;
  }
  window.v2Renderer?.syncNodeDragPreview?.(_0x3a8794, _0x5275fc);
}
function _trackNodeDragPreviewProxy(_0x237ab9, _0x3080e6) {
  if (!_0x237ab9 || !_0x3080e6) {
    return;
  }
  if (!_0x237ab9._nodeDragPreviewProxyIds) {
    _0x237ab9._nodeDragPreviewProxyIds = new Set();
  }
  _0x237ab9._nodeDragPreviewProxyIds.add(String(_0x3080e6));
}
function _clearNodeDragPreviewProxies(_0x3f2471, {
  settle = false,
  dx = 0,
  dy = 0
} = {}) {
  const _0x625804 = _0x3f2471?._nodeDragPreviewProxyIds instanceof Set ? Array.from(_0x3f2471._nodeDragPreviewProxyIds) : [];
  const _0x16c8fe = Number(dx);
  const _0x5d5368 = Number(dy);
  const _0xf7eee8 = settle === true && Number.isFinite(_0x16c8fe) && Number.isFinite(_0x5d5368);
  _0x625804.forEach(_0x413eb8 => {
    _syncNodeDragPreview(_0x413eb8, _0xf7eee8 ? {
      dx: _0x16c8fe,
      dy: _0x5d5368,
      active: false,
      settle: true
    } : {
      dx: 0,
      dy: 0,
      active: false
    });
  });
  _0x3f2471?._nodeDragPreviewProxyIds?.clear?.();
}
function _settleNodeDragPreviewProxiesOnCommit(_0xa26035, _0x12540b, _0x4b733d) {
  if (!_0xa26035?._nodeDragPreviewProxyIds?.size) {
    return;
  }
  _0xa26035._nodeDragPreviewProxySettle = {
    dx: _0x12540b,
    dy: _0x4b733d
  };
}
function _getMultiSelectBoxEl() {
  if (_cachedMultiSelectBoxEl && _cachedMultiSelectBoxEl.isConnected) {
    return _cachedMultiSelectBoxEl;
  }
  _cachedMultiSelectBoxEl = document.getElementById("v2-multi-select-box");
  return _cachedMultiSelectBoxEl;
}
function _collectDragTargetIds(_0x186844, _0x2ea888) {
  const _0x4eb714 = new Set(_0x2ea888 || []);
  const _0x8f9fac = _0x186844._parentToChildren || {};
  const _0x1b9cc0 = Array.from(_0x4eb714);
  while (_0x1b9cc0.length > 0) {
    const _0x3aa917 = _0x1b9cc0.pop();
    const _0x1a0768 = _0x8f9fac[_0x3aa917];
    if (_0x1a0768 && typeof _0x1a0768[Symbol.iterator] === "function") {
      for (const _0x1cc642 of _0x1a0768) {
        if (!_0x4eb714.has(_0x1cc642)) {
          _0x4eb714.add(_0x1cc642);
          _0x1b9cc0.push(_0x1cc642);
        }
      }
      continue;
    }
    for (const _0x521edf of Object.values(_0x186844.nodes || {})) {
      if (_0x521edf?.parentId === _0x3aa917 && !_0x4eb714.has(_0x521edf.id)) {
        _0x4eb714.add(_0x521edf.id);
        _0x1b9cc0.push(_0x521edf.id);
      }
    }
  }
  return _0x4eb714;
}
function _getNodeDragSessionCache(_0x4dc1a3, _0x52d6a4, _0x5ba3ec, _0x3ed081, _0x8cd484) {
  const _0x567006 = Array.isArray(_0x5ba3ec) ? _0x5ba3ec.join("") : "";
  const _0x480e51 = _0x52d6a4?.nodes || {};
  const _0x1c21cf = _0x52d6a4?.edges || {};
  const _0x5b464f = _0x52d6a4?._parentToChildren || null;
  const _0x19ae83 = _0x4dc1a3?._nodeDragSessionCache;
  if (_0x19ae83 && _0x19ae83.targetNodeId === _0x4dc1a3.targetNodeId && _0x19ae83.selectionKey === _0x567006 && _0x19ae83.nodes === _0x480e51 && _0x19ae83.edges === _0x1c21cf && _0x19ae83.parentToChildren === _0x5b464f && _0x19ae83.isGroupDrag === _0x3ed081) {
    return _0x19ae83;
  }
  const _0x2496a9 = new Set(_0x5ba3ec || []);
  const _0xac825d = _collectDragTargetIds(_0x52d6a4, _0x5ba3ec || []);
  const _0x5ed65c = Array.from(_0xac825d);
  const _0x1cbb48 = _0x5ed65c.map(_0x33e787 => ({
    id: _0x33e787,
    origNode: _0x480e51[_0x33e787],
    minimapDot: !_0x3ed081 || _0x2496a9.has(_0x33e787) ? window._v2MinimapDotMap?.get(_0x33e787) || document.getElementById("minimap-node-" + _0x33e787) : null
  })).filter(_0x52a0da => _0x52a0da.origNode);
  const _0x3eeaf8 = {
    targetNodeId: _0x4dc1a3.targetNodeId,
    selectionKey: _0x567006,
    nodes: _0x480e51,
    edges: _0x1c21cf,
    parentToChildren: _0x5b464f,
    isGroupDrag: _0x3ed081,
    directTargetSet: _0x2496a9,
    targetSet: _0xac825d,
    targets: _0x5ed65c,
    targetEntries: _0x1cbb48,
    affectedEdges: _collectAffectedEdgesForTargets(_0xac825d, _0x1c21cf),
    edgeCount: Object.keys(_0x1c21cf || {}).length,
    dragPayload: Array.isArray(_0x5ba3ec) && _0x5ba3ec.length === 1 && typeof _0x8cd484 === "function" ? _getImagePayloadFromNode(_0x8cd484, _0x480e51[_0x4dc1a3.targetNodeId]) : null
  };
  _0x4dc1a3._nodeDragSessionCache = _0x3eeaf8;
  return _0x3eeaf8;
}
function _markNodeDraggingUiHidden(_0x4fbff2, _0x4e0db4, _0x3d4656) {
  if (!_0x4fbff2 || !_0x4e0db4 || !_0x3d4656) {
    return;
  }
  if (!_0x4fbff2._draggingClassAppliedElements) {
    _0x4fbff2._draggingClassAppliedElements = new Map();
  }
  if (_0x4fbff2._draggingClassAppliedElements.get(_0x3d4656) === _0x4e0db4) {
    return;
  }
  _0x4e0db4.classList.add("is-ui-hidden");
  _0x4e0db4.classList.add("is-dragging");
  _0x4fbff2._draggingClassAppliedElements.set(_0x3d4656, _0x4e0db4);
}
function _waitForCollageItemImage(_0x19e3a1, _0x311e66, _0xce662b, _0x387748) {
  if (typeof document === "undefined") {
    _0x387748();
    return;
  }
  const _0x27087d = window.v2Renderer?.queryMountedNodeElement;
  if (typeof _0x27087d !== "function") {
    _0x387748();
    return;
  }
  const _0x1cb603 = performance.now();
  const _0x331c80 = 1800;
  const _0x5c32ab = () => {
    const _0x30fe3d = _0x27087d(_0x19e3a1, ".collage-item[data-collage-slot-index=\"" + _0x311e66 + "\"]");
    const _0x338a3e = _0x30fe3d ? _0x30fe3d.querySelector("img") : null;
    if (_0x338a3e && _0x338a3e.complete && _0x338a3e.naturalWidth > 0) {
      const _0x4024db = _0x338a3e.getAttribute("src") || "";
      if (!_0xce662b || _0x4024db === _0xce662b) {
        _0x387748();
        return;
      }
    }
    if (performance.now() - _0x1cb603 >= _0x331c80) {
      _0x387748();
      return;
    }
    requestAnimationFrame(_0x5c32ab);
  };
  requestAnimationFrame(_0x5c32ab);
}
function _fadeOutGhost(_0x67528c, _0xaa67d2 = 160) {
  if (!_0x67528c) {
    return;
  }
  const _0x533db2 = "opacity " + _0xaa67d2 / 1000 + "s cubic-bezier(0.4, 0, 0.2, 1)";
  const _0x2570f6 = String(_0x67528c.style.transition || "").trim();
  _0x67528c.style.transition = _0x2570f6 && _0x2570f6 !== "none" ? _0x2570f6 + ", " + _0x533db2 : _0x533db2;
  _0x67528c.style.opacity = "0";
  setTimeout(() => _0x67528c.remove(), _0xaa67d2);
}
function _drawImageCover(_0x10155e, _0x2ee06d, _0x405a50, _0x3ae76b) {
  const _0x2c50d7 = Math.max(1, Number(_0x2ee06d?.naturalWidth || _0x2ee06d?.width) || 1);
  const _0x485dae = Math.max(1, Number(_0x2ee06d?.naturalHeight || _0x2ee06d?.height) || 1);
  const _0x26fcf2 = Math.max(1, Number(_0x405a50) || 1);
  const _0x1b928c = Math.max(1, Number(_0x3ae76b) || 1);
  const _0x256ab8 = _0x2c50d7 / _0x485dae;
  const _0x48623e = _0x26fcf2 / _0x1b928c;
  let _0x205c66 = 0;
  let _0x5e6527 = 0;
  let _0x3f46f3 = _0x2c50d7;
  let _0x528ee1 = _0x485dae;
  if (_0x256ab8 > _0x48623e) {
    _0x3f46f3 = Math.max(1, _0x485dae * _0x48623e);
    _0x205c66 = (_0x2c50d7 - _0x3f46f3) / 2;
  } else if (_0x256ab8 < _0x48623e) {
    _0x528ee1 = Math.max(1, _0x2c50d7 / _0x48623e);
    _0x5e6527 = (_0x485dae - _0x528ee1) / 2;
  }
  _0x10155e.drawImage(_0x2ee06d, _0x205c66, _0x5e6527, _0x3f46f3, _0x528ee1, 0, 0, _0x26fcf2, _0x1b928c);
}
function _createGhostFromImage(_0x4ded4e, _0x193587, _0x40eab9, _0x1d9fac) {
  const _0x524d97 = document.createElement("div");
  _0x524d97.className = "v2-ghost-image";
  Object.assign(_0x524d97.style, {
    position: "fixed",
    left: "0",
    top: "0",
    width: _0x193587 + "px",
    height: _0x40eab9 + "px",
    opacity: "0.92",
    pointerEvents: "none",
    zIndex: "10000",
    borderRadius: "8px",
    border: "none",
    boxShadow: "0 0 0 2px var(--white-80), 0 0 30px 0 var(--white-40), 0 12px 40px var(--black-60)",
    overflow: "hidden",
    willChange: "transform, opacity",
    transition: "none",
    background: "var(--bg-node)"
  });
  if (_0x4ded4e && _0x4ded4e.complete && _0x4ded4e.naturalWidth > 0 && _0x4ded4e.naturalHeight > 0) {
    const _0x421b84 = document.createElement("canvas");
    _0x421b84.width = Math.max(1, Math.round(_0x193587));
    _0x421b84.height = Math.max(1, Math.round(_0x40eab9));
    Object.assign(_0x421b84.style, {
      width: "100%",
      height: "100%",
      display: "block"
    });
    const _0x57de15 = _0x421b84.getContext("2d", {
      alpha: false
    });
    if (_0x57de15) {
      try {
        _0x57de15.imageSmoothingEnabled = true;
        _0x57de15.imageSmoothingQuality = "high";
        _drawImageCover(_0x57de15, _0x4ded4e, _0x421b84.width, _0x421b84.height);
        _0x524d97.appendChild(_0x421b84);
        return _0x524d97;
      } catch {}
    }
  }
  const _0xb3ff03 = document.createElement("img");
  const _0x5832a3 = _0x4ded4e && (_0x4ded4e.currentSrc || _0x4ded4e.src) || _0x1d9fac || "";
  if (_0x5832a3) {
    _0xb3ff03.setAttribute("src", _0x5832a3);
  }
  Object.assign(_0xb3ff03.style, {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
    transition: "none"
  });
  _0x524d97.appendChild(_0xb3ff03);
  return _0x524d97;
}
export function createDragController({
  store: _0x18ea80,
  isNodeType: _0x2b5cda,
  getShortcuts: _0x2fa0df,
  hitTestNode: _0xf7abb1,
  screenToWorld: _0xd6215,
  generateId: _0x4b9f73,
  cloneNodesWithEdges: _0x5069fe,
  commit: _0x124320,
  saveOutputBlobImpl = saveOutputBlob,
  isFullFidelityDragEdgesEnabled = () => false
}) {
  function _0x431ca1(_0x2975a7, _0x512853 = null) {
    const _0x47dc60 = _0x18ea80.getStateRaw?.() || {};
    const _0x2b0b5f = Array.isArray(_0x47dc60.selectedNodeIds) ? [..._0x47dc60.selectedNodeIds] : [];
    const _0x399cc6 = () => {
      if (_0x512853 && typeof _0x18ea80.setSelectionMeta === "function") {
        _0x18ea80.setSelectionMeta(_0x512853);
      }
      _0x18ea80.setSelectedNodes(_0x2975a7);
    };
    if (typeof _0x18ea80.batch === "function") {
      _0x18ea80.batch(_0x399cc6);
    } else {
      _0x399cc6();
    }
    _flushSelectionFeedbackNow([..._0x2b0b5f, ...(Array.isArray(_0x2975a7) ? _0x2975a7 : [])]);
  }
  function _0x198497(_0x1adc1c, _0x492c1e, _0x12bf93, _0x582d97) {
    if (!_0x492c1e || !_0x492c1e.target) {
      return false;
    }
    const _0x4169cc = _0x492c1e.target.closest(".node-label");
    if (!_0x4169cc || _0x4169cc.contentEditable === "true") {
      return false;
    }
    const _0x50adae = _0x4169cc.dataset.nodeId || _0x4169cc.parentElement && _0x4169cc.parentElement.id;
    if (!_0x50adae) {
      return false;
    }
    const _0x1846a1 = _0x18ea80.getStateRaw().selectedNodeIds || [];
    const _0x122d29 = _0x1846a1.includes(_0x50adae);
    _0x1adc1c.isDragging = true;
    _0x1adc1c.dragSource = "title";
    _0x1adc1c.targetNodeId = _0x50adae;
    _0x1adc1c.lastWorldX = _0x12bf93;
    _0x1adc1c.lastWorldY = _0x582d97;
    _0x1adc1c.pendingDx = 0;
    _0x1adc1c.pendingDy = 0;
    _0x1adc1c.hasMoved = false;
    _0x1adc1c.wasSelectedOnDown = _0x122d29;
    _0x1adc1c.titleDragStartScreenX = Number.isFinite(_0x492c1e.clientX) ? _0x492c1e.clientX : 0;
    _0x1adc1c.titleDragStartScreenY = Number.isFinite(_0x492c1e.clientY) ? _0x492c1e.clientY : 0;
    _0x1adc1c.titleDragActivated = false;
    _0x1adc1c.titleDragPendingSelectNodeId = _0x122d29 ? null : _0x50adae;
    return true;
  }
  function _0x2a1b04(_0x121603, _0x480058, _0x153548, _0xa52bd7, _0x58fd20, _0x5d3aed, _0x5e7479) {
    const _0xf036b2 = _0x18ea80.getStateRaw();
    const {
      viewport: _0x2690de,
      nodes: _0x1a45a8
    } = _0xf036b2;
    const _0x5ef881 = _0xf7abb1(_0x480058, _0x153548, _0x1a45a8, _0x2690de, null, false, {
      spatialIndex: _getDragHitSpatialIndex(_0xf036b2)
    });
    const _0x1fa71e = _0x5ef881 ? _0x1a45a8[_0x5ef881] : null;
    if (!_0x1fa71e) {
      return false;
    }
    const _0x48e37b = _0x1fa71e;
    if (_0x2b5cda(_0x48e37b, "group")) {
      const _0x19c932 = typeof _0x5e7479?.target?.closest === "function" ? _0x5e7479.target.closest("[data-group-drag-handle-for]") : null;
      if (String(_0x19c932?.dataset?.groupDragHandleFor || "") !== String(_0x48e37b.id)) {
        return false;
      }
    }
    if (_0x5d3aed) {
      const _0xe27f1a = _0x18ea80.getStateRaw().selectedNodeIds;
      const _0xd402ae = _0xe27f1a.includes(_0x48e37b.id) ? [..._0xe27f1a] : [_0x48e37b.id];
      const _0x58bb37 = _0x5069fe(_0xd402ae, 0, 0);
      const _0x1851c9 = Object.values(_0x58bb37);
      _0x18ea80.setSelectedNodes(_0x1851c9);
      const _0x547a5f = _0x58bb37[_0x48e37b.id] || _0x1851c9[0];
      _0x121603.isDragging = true;
      _0x121603.dragSource = "node";
      _0x121603.targetNodeId = _0x547a5f;
      _0x121603.lastWorldX = _0xa52bd7;
      _0x121603.lastWorldY = _0x58fd20;
      _0x121603.titleDragPendingSelectNodeId = null;
      _0x121603.titleDragActivated = false;
      _0x121603.titleDragStartScreenX = 0;
      _0x121603.titleDragStartScreenY = 0;
      document.body.classList.add("is-dragging");
      return true;
    }
    if (_0x2b5cda(_0x48e37b, "storyboard") && _0x48e37b.isEditing) {
      const _0x506e24 = getStoryboardCellMetrics(_0x48e37b);
      const _0x583cd4 = getStoryboardCellIndexAtWorldPoint(_0x48e37b, _0xa52bd7, _0x58fd20);
      const _0x423559 = _0x48e37b.cells && _0x48e37b.cells[_0x583cd4];
      if (_0x583cd4 >= 0 && _0x423559 && !_isCellEmpty(_0x423559)) {
        const _0xe42d96 = getStoryboardCellPixelBounds(_0x48e37b, _0x583cd4);
        const _0x6a6280 = (_0xe42d96?.width || _0x506e24.cellWidth) * _0x2690de.zoom;
        const _0x4110db = (_0xe42d96?.height || _0x506e24.cellHeight) * _0x2690de.zoom;
        const _0x5d21fb = _0x480058 - _0x6a6280 / 2;
        const _0x19407a = _0x153548 - _0x4110db / 2;
        const _0x14435e = document.createElement("div");
        _0x14435e.className = "v2-ghost-image";
        Object.assign(_0x14435e.style, {
          position: "fixed",
          left: "0",
          top: "0",
          width: _0x6a6280 + "px",
          height: _0x4110db + "px",
          transform: "translate(" + _0x5d21fb + "px, " + _0x19407a + "px)",
          opacity: "0.85",
          pointerEvents: "none",
          zIndex: "10000",
          borderRadius: "8px",
          border: "none",
          boxShadow: "0 0 0 2px var(--white-80), 0 0 30px 0 var(--white-40), 0 12px 40px var(--black-60)",
          overflow: "hidden",
          willChange: "transform",
          transition: "none"
        });
        const _0xd0b2ea = document.getElementById("cell-" + _0x48e37b.id + "-" + _0x583cd4);
        const _0x47be84 = _0xd0b2ea?.querySelector("img.storyboard-cell-img--source-crop") || null;
        const _0x4381e6 = _0xd0b2ea?.querySelector(".storyboard-cell-img") || null;
        const _0x37eb7e = a1020_0x506829(_0x423559);
        const _0x535ad7 = _0x47be84 ? a1020_0x475f77(_0x48e37b, _0x583cd4, _0x423559, "storyboard_drag_" + _0x48e37b.id + "_" + _0x583cd4 + ".jpg") : null;
        if (_0x535ad7?.dataUrl) {
          const _0x4ba745 = getAutoMediaSizeByShortSide(_0x535ad7.width, _0x535ad7.height);
          const _0x37f15a = _0x4ba745.width * _0x2690de.zoom;
          const _0xf0c57f = _0x4ba745.height * _0x2690de.zoom;
          Object.assign(_0x14435e.style, {
            width: _0x37f15a + "px",
            height: _0xf0c57f + "px",
            transform: "translate(" + _0x480058 + "px, " + _0x153548 + "px) translate(-50%, -50%)"
          });
          const _0x21bfd0 = document.createElement("img");
          _0x21bfd0.setAttribute("src", _0x535ad7.dataUrl);
          Object.assign(_0x21bfd0.style, {
            width: "100%",
            height: "100%",
            objectFit: "contain",
            display: "block",
            pointerEvents: "none",
            transition: "none"
          });
          _0x14435e.appendChild(_0x21bfd0);
        } else if (_0x4381e6) {
          const _0x1d038d = Math.max(1, Math.round(_0x6a6280));
          const _0x43164f = Math.max(1, Math.round(_0x4110db));
          const _0x1cbe2a = document.createElement("canvas");
          _0x1cbe2a.width = _0x1d038d;
          _0x1cbe2a.height = _0x43164f;
          Object.assign(_0x1cbe2a.style, {
            width: "100%",
            height: "100%",
            display: "block"
          });
          const _0x146646 = _0x1cbe2a.getContext("2d", {
            alpha: false
          });
          if (_0x146646 && _0x4381e6.complete && _0x4381e6.naturalWidth > 0) {
            try {
              _0x146646.imageSmoothingEnabled = true;
              _0x146646.imageSmoothingQuality = "high";
              _0x146646.drawImage(_0x4381e6, 0, 0, _0x1d038d, _0x43164f);
              _0x14435e.appendChild(_0x1cbe2a);
            } catch {
              const _0x4b8d62 = document.createElement("img");
              const _0x136884 = _0x4381e6.currentSrc || _0x4381e6.src || _0x37eb7e;
              if (_0x136884) {
                _0x4b8d62.setAttribute("src", _0x136884);
              }
              Object.assign(_0x4b8d62.style, {
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block",
                transition: "none"
              });
              _0x14435e.appendChild(_0x4b8d62);
            }
          } else {
            const _0x75175b = document.createElement("img");
            const _0x7d16ab = _0x4381e6.currentSrc || _0x4381e6.src || _0x37eb7e;
            if (_0x7d16ab) {
              _0x75175b.setAttribute("src", _0x7d16ab);
            }
            Object.assign(_0x75175b.style, {
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
              transition: "none"
            });
            _0x14435e.appendChild(_0x75175b);
          }
        } else {
          const _0x5e9d7d = document.createElement("img");
          if (_0x37eb7e) {
            _0x5e9d7d.setAttribute("src", _0x37eb7e);
          }
          Object.assign(_0x5e9d7d.style, {
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
            transition: "none"
          });
          _0x14435e.appendChild(_0x5e9d7d);
        }
        document.body.appendChild(_0x14435e);
        const _0x56c44d = _0x5e7479?.target?.closest(".sb-cell") || null;
        if (_0x56c44d) {
          _0x56c44d.classList.add("is-drag-source");
        }
        _0x121603.isDraggingCell = true;
        _0x121603.dragSource = "cell";
        _0x121603.targetNodeId = _0x48e37b.id;
        _0x121603.sourceCellIndex = _0x583cd4;
        _0x121603.draggedCellData = {
          ..._0x423559
        };
        _0x121603.ghostEl = _0x14435e;
        _0x121603.sourceCellEl = _0x56c44d;
        _0x121603.lastWorldX = _0xa52bd7;
        _0x121603.lastWorldY = _0x58fd20;
        _0x121603.titleDragPendingSelectNodeId = null;
        _0x121603.titleDragActivated = false;
        _0x121603.titleDragStartScreenX = 0;
        _0x121603.titleDragStartScreenY = 0;
        document.body.classList.add("is-dragging");
        return true;
      }
    }
    const _0x4ddd73 = _0x18ea80.getStateRaw().selectedNodeIds;
    const _0x31975e = _0x4ddd73.includes(_0x48e37b.id);
    _0x121603.isDragging = true;
    _0x121603.dragSource = "node";
    _0x121603.targetNodeId = _0x48e37b.id;
    _0x121603.lastWorldX = _0xa52bd7;
    _0x121603.lastWorldY = _0x58fd20;
    _0x121603.titleDragPendingSelectNodeId = null;
    _0x121603.titleDragActivated = false;
    _0x121603.titleDragStartScreenX = 0;
    _0x121603.titleDragStartScreenY = 0;
    _0x121603.wasSelectedOnDown = _0x31975e;
    document.body.classList.add("is-dragging");
    const _0x50e784 = _0x2fa0df();
    const _0x170965 = _0x50e784["multi-select"] ? _0x50e784["multi-select"].keys[0] : "Shift";
    let _0x5c0491 = false;
    if (_0x170965 === "Ctrl") {
      _0x5c0491 = _0x5e7479?.ctrlKey || _0x5e7479?.metaKey;
    } else if (_0x170965 === "Shift") {
      _0x5c0491 = _0x5e7479?.shiftKey;
    } else if (_0x170965 === "Alt") {
      _0x5c0491 = _0x5e7479?.altKey;
    }
    if (_0x5c0491) {
      if (_0x4ddd73.includes(_0x48e37b.id)) {
        _0x431ca1(_0x4ddd73.filter(_0x2f0f8c => _0x2f0f8c !== _0x48e37b.id), {
          source: "shift"
        });
        _0x121603.isDragging = false;
        _0x121603.dragSource = null;
        _0x121603.targetNodeId = null;
      } else {
        _0x431ca1([..._0x4ddd73, _0x48e37b.id], {
          source: "shift"
        });
      }
    } else if (!_0x4ddd73.includes(_0x48e37b.id)) {
      _0x431ca1([_0x48e37b.id], {
        source: "click"
      });
    }
    return true;
  }
  function _0x312bdc(_0x560a35, _0x30f944, _0x35d44b, _0x2f4f52, _0x55fe71, _0x4ede5c) {
    if (_0x560a35.ghostEl) {
      _0x560a35.ghostEl.style.transform = "translate(" + _0x30f944 + "px, " + _0x35d44b + "px) translate(-50%, -50%)";
    }
    const _0x2c5e30 = _getStoryboardCellInfoAt(_0x2f4f52, _0x55fe71, _0x4ede5c, {
      nearestInGap: true
    });
    const _0x5aea1b = _0x2c5e30 ? _0x2c5e30.nodeId : null;
    const _0x1af1ca = _0x560a35.lastHoverNodeId || null;
    if (_0x5aea1b !== _0x1af1ca || _0x2c5e30 && _0x2c5e30.cellIndex !== _0x560a35.lastHoverCellIndex) {
      if (_0x1af1ca) {
        window.v2Renderer?.highlightDropSlot?.(_0x1af1ca, {
          kind: "storyboard",
          index: -1
        });
      }
      if (_0x5aea1b) {
        window.v2Renderer?.highlightDropSlot?.(_0x5aea1b, {
          kind: "storyboard",
          index: _0x2c5e30.cellIndex
        });
      }
      _0x560a35.lastHoverNodeId = _0x5aea1b;
      _0x560a35.lastHoverCellIndex = _0x2c5e30 ? _0x2c5e30.cellIndex : -1;
    }
    _0x560a35.lastWorldX = _0x2f4f52;
    _0x560a35.lastWorldY = _0x55fe71;
  }
  function _0x4d2070(_0x25fd76, _0xca6ee2, _0x13a49f, _0x39e8b3, _0x45ec8c, _0x645e63, _0x5be775, _0x1dd9a5) {
    const {
      viewport: _0x1a7656,
      nodes: _0x21be41,
      selectedNodeIds: _0x522dc1,
      edges: _0x1f7ee8
    } = _0x1dd9a5;
    const _0x5c36b7 = _0x522dc1.includes(_0x25fd76.targetNodeId) ? _0x522dc1 : [_0x25fd76.targetNodeId];
    const _0x1ac05a = _0x21be41[_0x25fd76.targetNodeId];
    const _0x4fd8f5 = _0x5c36b7.length === 1 && _0x2b5cda(_0x1ac05a, "group");
    const {
      targetSet: _0x39b161,
      targets: _0x54374c,
      targetEntries: _0x923b5b,
      affectedEdges: _0x4d9af7,
      edgeCount: _0x10881f,
      dragPayload: _0x44ae66
    } = _getNodeDragSessionCache(_0x25fd76, _0x1dd9a5, _0x5c36b7, _0x4fd8f5, _0x2b5cda);
    if (_0x25fd76.dragSource === "title" && _0x25fd76.titleDragActivated !== true) {
      const _0x8098db = Number.isFinite(_0x25fd76.titleDragStartScreenX) ? _0x25fd76.titleDragStartScreenX : _0xca6ee2;
      const _0x4be23c = Number.isFinite(_0x25fd76.titleDragStartScreenY) ? _0x25fd76.titleDragStartScreenY : _0x13a49f;
      const _0x3cb78f = Math.hypot(_0xca6ee2 - _0x8098db, _0x13a49f - _0x4be23c);
      if (_0x3cb78f <= TITLE_DRAG_ACTIVATE_THRESHOLD_PX) {
        return;
      }
      _0x25fd76.titleDragActivated = true;
      document.body.classList.add("is-dragging");
      const _0x543b2c = _0x25fd76.titleDragPendingSelectNodeId;
      if (_0x543b2c && !_0x522dc1.includes(_0x543b2c)) {
        _0x431ca1([_0x543b2c], {
          source: "click"
        });
      }
      _0x25fd76.titleDragPendingSelectNodeId = null;
    }
    if (_0x5c36b7.length === 1) {
      const _0x3d49bd = _0x44ae66;
      if (_0x3d49bd) {
        const _0x5b3e70 = _getStoryboardCellInfoAt(_0x645e63, _0x5be775, _0x21be41);
        const _0xcdb4bb = _0x5b3e70 ? _0x21be41[_0x5b3e70.nodeId] : null;
        const _0x3c2994 = !!_0x3d49bd && !!_0xcdb4bb && _0xcdb4bb.isEditing === true;
        let _0x208f13 = _0x3c2994 ? _0x5b3e70.nodeId : null;
        let _0x25fa17 = _0x3c2994 ? _0x5b3e70.cellIndex : -1;
        let _0x77add2 = _0x3c2994 ? "storyboard" : "";
        if (!_0x3c2994) {
          const _0x2d0f3c = _getCollageSlotInfoAt(_0x645e63, _0x5be775, _0x21be41);
          const _0x50206a = _0x2d0f3c ? _0x21be41[_0x2d0f3c.nodeId] : null;
          const _0xe6eafa = !!_0x3d49bd && !!_0x50206a && _0x50206a.isEditing === true;
          _0x208f13 = _0xe6eafa ? _0x2d0f3c.nodeId : null;
          _0x25fa17 = _0xe6eafa ? _0x2d0f3c.itemIndex : -1;
          _0x77add2 = _0xe6eafa ? "collage" : "";
        }
        const _0x4cf183 = _0x25fd76.lastHoverNodeId || null;
        if (_0x208f13 !== _0x4cf183 || _0x25fa17 !== (_0x25fd76.lastHoverCellIndex ?? -1) || _0x77add2 !== (_0x25fd76.lastHoverKind || "")) {
          if (_0x4cf183) {
            _clearDropSlotHighlight(_0x4cf183);
          }
          if (_0x208f13) {
            _highlightDropSlot(_0x208f13, _0x77add2, _0x25fa17);
          }
          _0x25fd76.lastHoverNodeId = _0x208f13;
          _0x25fd76.lastHoverCellIndex = _0x25fa17;
          _0x25fd76.lastHoverKind = _0x77add2;
        }
      } else if (_0x25fd76.lastHoverNodeId) {
        _clearDropSlotHighlight(_0x25fd76.lastHoverNodeId);
        _0x25fd76.lastHoverNodeId = null;
        _0x25fd76.lastHoverCellIndex = -1;
        _0x25fd76.lastHoverKind = "";
      }
    }
    let _0x2a0eeb = _0x39e8b3;
    let _0x4f901b = _0x45ec8c;
    if (window.v2SnapToGrid) {
      const _0x1cbae9 = _0x25fd76.pendingDx || 0;
      const _0x127c35 = _0x25fd76.pendingDy || 0;
      const _0x2b614c = _0x2a0eeb - _0x25fd76.lastWorldX;
      const _0x516688 = _0x4f901b - _0x25fd76.lastWorldY;
      if (_0x5c36b7.length === 1) {
        const _0x175dce = _0x21be41[_0x25fd76.targetNodeId];
        if (_0x175dce) {
          const _0x2e39c4 = _0x175dce.x + _0x1cbae9 + _0x2b614c;
          const _0x40a754 = _0x175dce.y + _0x127c35 + _0x516688;
          _0x2a0eeb += snapToCanvasGrid(_0x2e39c4) - _0x2e39c4;
          _0x4f901b += snapToCanvasGrid(_0x40a754) - _0x40a754;
        }
      } else {
        let _0x16449d = Infinity;
        let _0x20b879 = Infinity;
        _0x54374c.forEach(_0x2eb5cd => {
          const _0x5198d8 = _0x21be41[_0x2eb5cd];
          if (!_0x5198d8) {
            return;
          }
          _0x16449d = Math.min(_0x16449d, (_0x5198d8.x || 0) + _0x1cbae9);
          _0x20b879 = Math.min(_0x20b879, (_0x5198d8.y || 0) + _0x127c35);
        });
        if (Number.isFinite(_0x16449d) && Number.isFinite(_0x20b879)) {
          const _0x51a81c = _0x16449d + _0x2b614c;
          const _0x2cbd87 = _0x20b879 + _0x516688;
          _0x2a0eeb += snapToCanvasGrid(_0x51a81c) - _0x51a81c;
          _0x4f901b += snapToCanvasGrid(_0x2cbd87) - _0x2cbd87;
        }
      }
    }
    const _0x70fc60 = _shouldUseDragSnapGuides(_0x1dd9a5, _0x4fd8f5);
    const _0x41ab58 = _0x70fc60 ? _getDragSnapSpatialIndex(_0x1dd9a5) : null;
    if (_0x70fc60 && _0x5c36b7.length === 1) {
      const _0x42e7fc = _0x1ac05a;
      if (_0x42e7fc) {
        const _0x569ab5 = _0x25fd76.pendingDx || 0;
        const _0x1fbc60 = _0x25fd76.pendingDy || 0;
        const _0x51e7d6 = _0x42e7fc.x + _0x569ab5 + (_0x2a0eeb - _0x25fd76.lastWorldX);
        const _0x5baff7 = _0x42e7fc.y + _0x1fbc60 + (_0x4f901b - _0x25fd76.lastWorldY);
        const _0x3dce74 = computeSingleNodeSnapGuides({
          nodesById: _0x1dd9a5.nodes,
          dragNodeId: _0x25fd76.targetNodeId,
          proposedX: _0x51e7d6,
          proposedY: _0x5baff7,
          width: _0x42e7fc.width || 200,
          height: _0x42e7fc.height || 200,
          viewport: _0x1a7656,
          thresholdPx: 8,
          spatialIndex: _0x41ab58
        });
        if (Number.isFinite(_0x3dce74.snappedX)) {
          _0x2a0eeb += _0x3dce74.snappedX - _0x51e7d6;
        }
        if (Number.isFinite(_0x3dce74.snappedY)) {
          _0x4f901b += _0x3dce74.snappedY - _0x5baff7;
        }
        if (Array.isArray(_0x3dce74.guideLines) && _0x3dce74.guideLines.length > 0) {
          window._showSnapGuideLines?.(_0x3dce74.guideLines);
        } else {
          window._clearSnapGuideLines?.();
        }
      } else {
        window._clearSnapGuideLines?.();
      }
    } else if (_0x70fc60 && _0x5c36b7.length >= 2) {
      const _0x32b462 = _0x25fd76.pendingDx || 0;
      const _0xe238f7 = _0x25fd76.pendingDy || 0;
      const _0x5c389b = _0x2a0eeb - _0x25fd76.lastWorldX;
      const _0x130342 = _0x4f901b - _0x25fd76.lastWorldY;
      let _0x165ebb = Infinity;
      let _0x34247b = Infinity;
      let _0xa65f0d = -Infinity;
      let _0x30b949 = -Infinity;
      let _0xd4dda3 = 0;
      _0x54374c.forEach(_0x37a117 => {
        const _0x47871b = _0x21be41[_0x37a117];
        if (!_0x47871b) {
          return;
        }
        _0xd4dda3 += 1;
        const _0x4d59c0 = (_0x47871b.x || 0) + _0x32b462;
        const _0x39d209 = (_0x47871b.y || 0) + _0xe238f7;
        const _0x1e5871 = _0x47871b.width || 200;
        const _0x5063a2 = _0x47871b.height || 200;
        _0x165ebb = Math.min(_0x165ebb, _0x4d59c0);
        _0x34247b = Math.min(_0x34247b, _0x39d209);
        _0xa65f0d = Math.max(_0xa65f0d, _0x4d59c0 + _0x1e5871);
        _0x30b949 = Math.max(_0x30b949, _0x39d209 + _0x5063a2);
      });
      if (_0xd4dda3 > 0 && Number.isFinite(_0x165ebb) && Number.isFinite(_0x34247b)) {
        const _0x580eee = _0x165ebb + _0x5c389b;
        const _0x2f54d1 = _0x34247b + _0x130342;
        const _0xd4a0a7 = computeMultiNodeSnapGuides({
          nodesById: _0x1dd9a5.nodes,
          movingNodeIds: _0x54374c,
          proposedBounds: {
            minX: _0x580eee,
            minY: _0x2f54d1,
            width: _0xa65f0d - _0x165ebb,
            height: _0x30b949 - _0x34247b
          },
          viewport: _0x1a7656,
          thresholdPx: 8,
          spatialIndex: _0x41ab58
        });
        if (Number.isFinite(_0xd4a0a7.snappedX)) {
          _0x2a0eeb += _0xd4a0a7.snappedX - _0x580eee;
        }
        if (Number.isFinite(_0xd4a0a7.snappedY)) {
          _0x4f901b += _0xd4a0a7.snappedY - _0x2f54d1;
        }
        if (Array.isArray(_0xd4a0a7.guideLines) && _0xd4a0a7.guideLines.length > 0) {
          window._showSnapGuideLines?.(_0xd4a0a7.guideLines);
        } else {
          window._clearSnapGuideLines?.();
        }
      } else {
        window._clearSnapGuideLines?.();
      }
    } else {
      window._clearSnapGuideLines?.();
    }
    const _0x355c1a = _0x2a0eeb - _0x25fd76.lastWorldX;
    const _0x516484 = _0x4f901b - _0x25fd76.lastWorldY;
    if (_0x355c1a !== 0 || _0x516484 !== 0) {
      _0x25fd76.pendingDx = (_0x25fd76.pendingDx || 0) + _0x355c1a;
      _0x25fd76.pendingDy = (_0x25fd76.pendingDy || 0) + _0x516484;
      if (!_0x25fd76.hasMoved && Math.hypot(_0x25fd76.pendingDx, _0x25fd76.pendingDy) > 3) {
        _0x25fd76.hasMoved = true;
      }
      const _0x2cf9be = [];
      const _0x35f854 = [];
      const _0x3c0512 = [];
      _0x923b5b.forEach(({
        id: _0x3d3422,
        origNode: _0x37f328,
        minimapDot: _0x1b893d
      }) => {
        const _0x40f75c = _getNodeWrapperEl(_0x3d3422);
        if (_0x25fd76.hasMoved) {
          if (_0x40f75c) {
            if (_0x2b5cda(_0x37f328, "group")) {
              _trackNodeDragPreviewProxy(_0x25fd76, _0x3d3422);
              _syncNodeDragPreview(_0x3d3422, {
                remove: true,
                dx: _0x25fd76.pendingDx,
                dy: _0x25fd76.pendingDy,
                active: true
              });
            } else {
              _syncNodeDragPreview(_0x3d3422, {
                remove: true
              });
            }
          } else {
            _0x35f854.push({
              id: _0x3d3422,
              pendingDx: _0x25fd76.pendingDx,
              pendingDy: _0x25fd76.pendingDy
            });
          }
        }
        if (_0x40f75c) {
          _0x2cf9be.push({
            id: _0x3d3422,
            el: _0x40f75c,
            origNode: _0x37f328,
            pendingDx: _0x25fd76.pendingDx,
            pendingDy: _0x25fd76.pendingDy,
            hasMoved: _0x25fd76.hasMoved
          });
        }
        if (_0x1b893d && window._v2MinimapScale) {
          if (_0x3c0512.length >= MINIMAP_LIVE_DRAG_DOT_LIMIT) {
            _deferMinimapDragDotRefresh(_0x25fd76);
            return;
          }
          _0x3c0512.push({
            minimapDot: _0x1b893d,
            pendingDx: _0x25fd76.pendingDx,
            pendingDy: _0x25fd76.pendingDy,
            scale: window._v2MinimapScale
          });
        }
      });
      _0x2cf9be.forEach(({
        id: _0x44218,
        el: _0x1685a4,
        origNode: _0x44a015,
        pendingDx: _0x1ee9cd,
        pendingDy: _0x4d6337,
        hasMoved: _0x4ad4f0
      }) => {
        const _0x115146 = _0x44a015.x + _0x1ee9cd;
        const _0x2063fb = _0x44a015.y + _0x4d6337;
        _0x1685a4.style.transform = "translate(" + _0x115146 + "px, " + _0x2063fb + "px)";
        if (_0x4ad4f0) {
          _markNodeDraggingUiHidden(_0x25fd76, _0x1685a4, _0x44218);
        }
      });
      _0x35f854.forEach(({
        id: _0x2ee030,
        pendingDx: _0x46f324,
        pendingDy: _0x2a59e4
      }) => {
        _trackNodeDragPreviewProxy(_0x25fd76, _0x2ee030);
        _syncNodeDragPreview(_0x2ee030, {
          dx: _0x46f324,
          dy: _0x2a59e4,
          active: true
        });
      });
      _0x3c0512.forEach(({
        minimapDot: _0x889ff6,
        pendingDx: _0x4fced1,
        pendingDy: _0x30edb,
        scale: _0x2b42de
      }) => {
        _0x889ff6.style.transform = "translate(" + _0x4fced1 * _0x2b42de + "px, " + _0x30edb * _0x2b42de + "px)";
        _trackMinimapDragDot(_0x25fd76, _0x889ff6);
      });
      window.v2Renderer?.prepareDynamicEdges?.(_0x4d9af7.map(_0x322194 => _0x322194?.id).filter(Boolean));
      const _0x4acb51 = window._edgeDomCache;
      if (_0x4acb51 && _0x4acb51.size > 0) {
        _updateDraggedEdges(_0x25fd76, {
          affectedEdges: _0x4d9af7,
          edgeDomCache: _0x4acb51,
          nodes: _0x1dd9a5.nodes,
          targetSet: _0x39b161,
          viewport: _0x1a7656,
          edgeCount: _0x10881f,
          pendingDx: _0x25fd76.pendingDx,
          pendingDy: _0x25fd76.pendingDy,
          connectionLineStyle: _0x1dd9a5.ui?.connectionLineStyle,
          useEdgeGroupTransform: _0x4fd8f5,
          fullFidelityDragEdges: isFullFidelityDragEdgesEnabled() === true
        });
      } else {
        _flushDragEdgeScheduler(_0x25fd76);
      }
      _0x25fd76.lastWorldX = _0x2a0eeb;
      _0x25fd76.lastWorldY = _0x4f901b;
      const _0x1560de = _getMultiSelectBoxEl();
      if (_0x5c36b7.length >= 2 && _0x1560de && _0x1560de.style.display !== "none") {
        const _0x1e1f47 = _0x522dc1.length > 0 ? _0x522dc1 : [_0x25fd76.targetNodeId];
        let _0x351642 = Infinity;
        let _0x8d4463 = Infinity;
        let _0x6ee02b = -Infinity;
        let _0xd4db55 = -Infinity;
        let _0x3e23dd = 0;
        _0x1e1f47.forEach(_0x16e9fb => {
          const _0x3548c3 = _0x1dd9a5.nodes[_0x16e9fb];
          if (!_0x3548c3) {
            return;
          }
          _0x3e23dd++;
          const _0x24b55d = _0x3548c3.x + (_0x39b161.has(_0x16e9fb) ? _0x25fd76.pendingDx : 0);
          const _0xf7dd65 = _0x3548c3.y + (_0x39b161.has(_0x16e9fb) ? _0x25fd76.pendingDy : 0);
          const _0x393a3f = _0x3548c3.width || 260;
          const _0x473e85 = _0x3548c3.height || 100;
          const _0x27ab92 = _0x3548c3.type !== "group" ? _0xf7dd65 - 30 : _0xf7dd65;
          _0x351642 = Math.min(_0x351642, _0x24b55d);
          _0x8d4463 = Math.min(_0x8d4463, _0x27ab92);
          _0x6ee02b = Math.max(_0x6ee02b, _0x24b55d + _0x393a3f);
          _0xd4db55 = Math.max(_0xd4db55, _0xf7dd65 + _0x473e85);
        });
        if (_0x3e23dd >= 2) {
          const _0x4208a7 = 18;
          _0x1560de.style.left = _0x351642 - _0x4208a7 + "px";
          _0x1560de.style.top = _0x8d4463 - _0x4208a7 + "px";
          _0x1560de.style.width = _0x6ee02b - _0x351642 + _0x4208a7 * 2 + "px";
          _0x1560de.style.height = _0xd4db55 - _0x8d4463 + _0x4208a7 * 2 + "px";
        }
      }
    }
  }
  function _0x6e0d05(_0x3421d3, _0x4fa48a, _0xaa00f0) {
    const _0x11ea8c = _0x18ea80.getStateRaw();
    const {
      viewport: _0x114b5f,
      nodes: _0x36b205
    } = _0x11ea8c;
    const {
      x: _0x99e5df,
      y: _0x8791e4
    } = _0xd6215(_0x4fa48a, _0xaa00f0, _0x114b5f);
    const _0x3539fe = _0x3421d3.ghostEl;
    if (_0x3421d3.sourceCellEl) {
      _0x3421d3.sourceCellEl.classList.remove("is-drag-source");
      _0x3421d3.sourceCellEl = null;
    }
    const _0x5d3639 = _0x36b205[_0x3421d3.targetNodeId];
    const _0x39039a = _0x3421d3.sourceCellIndex;
    const _0xe0f463 = _0x3421d3.draggedCellData;
    if (!_0x5d3639) {
      if (_0x3539fe) {
        _0x3539fe.remove();
      }
      _0x3421d3.ghostEl = null;
      return {
        didAct: false,
        committed: false
      };
    }
    const _0x260007 = _getStoryboardCellInfoAt(_0x99e5df, _0x8791e4, _0x36b205, {
      nearestInGap: true
    }) || _getLastHoveredStoryboardCellInfo(_0x3421d3, _0x99e5df, _0x8791e4, _0x36b205);
    let _0x53b0c0 = false;
    if (_0x260007) {
      const _0x4f32e4 = _0x36b205[_0x260007.nodeId];
      const _0x250087 = _0x260007.cellIndex;
      if (_0x4f32e4.id === _0x5d3639.id && _0x250087 === _0x39039a) {
        if (_0x3539fe) {
          _0x3539fe.remove();
        }
        _0x53b0c0 = false;
      } else {
        const _0x3554ef = _0x5d3639.cells?.[_0x39039a] || _0xe0f463;
        const _0x7c7c4d = _0x4f32e4.cells?.[_0x250087];
        const _0x95a6b8 = resolveStoryboardCellDisplaySnapshot(_0x5d3639, _0x3554ef, _0x39039a);
        const _0x43b2ac = _0x7c7c4d && !_isCellEmpty(_0x7c7c4d) ? resolveStoryboardCellDisplaySnapshot(_0x4f32e4, _0x7c7c4d, _0x250087) : null;
        if (!_0x95a6b8 || _0x7c7c4d && !_isCellEmpty(_0x7c7c4d) && !_0x43b2ac) {
          if (_0x3539fe) {
            _0x3539fe.remove();
          }
          _0x53b0c0 = false;
        } else {
          const _0x30c8b4 = _0x4f32e4.id === _0x5d3639.id ? _applyImmediateCellSwapPreview(_0x5d3639.id, _0x39039a, _0x250087) : {
            ok: false,
            revert() {}
          };
          if (_0x30c8b4.ok && _0x3539fe) {
            _0x3539fe.remove();
          }
          _0x53b0c0 = a1020_0x5752f7({
            store: _0x18ea80,
            sourceNode: _0x5d3639,
            sourceCellIndex: _0x39039a,
            targetNode: _0x4f32e4,
            targetCellIndex: _0x250087,
            sourceSnapshot: _0x95a6b8,
            targetSnapshot: _0x43b2ac
          });
          if (!_0x53b0c0 && _0x30c8b4.ok) {
            _0x30c8b4.revert();
          }
          if (_0x53b0c0) {
            _flushStoryboardNodesNow(_0x5d3639.id, _0x4f32e4.id);
            if (!_0x30c8b4.ok && _0x3539fe) {
              _0x3539fe.remove();
            }
          } else if (_0x3539fe) {
            _0x3539fe.remove();
          }
        }
      }
    } else {
      const _0x10e1b1 = getStoryboardCellMetrics(_0x5d3639);
      const _0x79fe9d = _0x5d3639?.cells?.[_0x39039a];
      const _0x4714a0 = _0x79fe9d && !_isCellEmpty(_0x79fe9d) ? _0x79fe9d : _0xe0f463;
      const _0x4f8ce4 = _0x4714a0 || {};
      const _0x4ad2df = _0x4b9f73("source-image");
      const _0x195e83 = resolveStoryboardCellDisplaySnapshot(_0x5d3639, _0x4f8ce4, _0x39039a, {
        fileName: "storyboard_extract_" + _0x4ad2df + ".jpg"
      });
      if (!_0x195e83?.src) {
        if (_0x3539fe) {
          _0x3539fe.remove();
        }
        _0x53b0c0 = false;
      } else {
        const _0x5f18cd = Number(_0x195e83.storyboardSourceIndex);
        const _0x4ab488 = Number.isInteger(_0x5f18cd) && _0x5f18cd >= 0 ? _0x5f18cd : resolveStoryboardCellSourceIndex(_0x4f8ce4, _0x39039a, _0x5d3639);
        const _0x85d89f = getStoryboardCellPixelBounds(_0x5d3639, _0x4ab488);
        const _0x523355 = a1020_0x581980(_0x5d3639);
        _0x18ea80.batch(() => {
          const _0xaf2538 = _0x39039a % _0x5d3639.cols + 1;
          const _0x3fba44 = Math.floor(_0x39039a / _0x5d3639.cols) + 1;
          const _0x376691 = _0x195e83.width || _0x85d89f?.width || _0x10e1b1.cellWidth;
          const _0xce95b2 = _0x195e83.height || _0x85d89f?.height || _0x10e1b1.cellHeight;
          const _0x3bd121 = getAutoMediaSizeByShortSide(_0x376691, _0xce95b2);
          _0x18ea80.addNode(buildSourceMediaNodePayload({
            id: _0x4ad2df,
            type: "source-image",
            src: _0x195e83.capturePreviewUrl ? "" : _0x195e83.src,
            capturePreviewUrl: _0x195e83.capturePreviewUrl || "",
            localPath: _0x195e83.capturePreviewUrl ? null : _0x195e83.localPath,
            thumbUrl: null,
            fileName: _0x195e83.fileName || _0x4f8ce4.fileName || "",
            originalWidth: _0x195e83.width || _0x4f8ce4.originalWidth,
            originalHeight: _0x195e83.height || _0x4f8ce4.originalHeight,
            imageWidth: _0x195e83.width || _0x4f8ce4.imageWidth,
            imageHeight: _0x195e83.height || _0x4f8ce4.imageHeight,
            sourceLocalPath: null,
            sourceUrl: "",
            sourceWidth: null,
            sourceHeight: null,
            storyboardSourceCrop: false,
            storyboardExtractedCell: true,
            storyboardSourceIndex: _0x4ab488,
            storyboardSourceNodeId: _0x5d3639.id,
            storyboardSourceLocalPath: _0x523355.sourceLocalPath,
            storyboardSourceUrl: _0x523355.sourceUrl,
            naturalWidth: _0x195e83.width,
            naturalHeight: _0x195e83.height,
            x: _0x99e5df - _0x3bd121.width / 2,
            y: _0x8791e4 - _0x3bd121.height / 2,
            width: _0x3bd121.width,
            height: _0x3bd121.height,
            name: "提取分镜" + _0x3fba44 + "-" + _0xaf2538,
            fixedSize: true,
            needsAutoResize: false
          }));
          _0x18ea80.setSelectedNodes([_0x4ad2df]);
          const _0x16d128 = [..._0x5d3639.cells];
          _0x16d128[_0x39039a] = a1020_0x239057(_0x16d128[_0x39039a], _0x5d3639, _0x39039a);
          _0x18ea80.updateNodeData(_0x5d3639.id, {
            cells: _0x16d128
          });
        });
        if (_0x195e83.crop) {
          _persistStoryboardSourceCropExtract(_0x18ea80, _0x4ad2df, _0x195e83.crop, saveOutputBlobImpl);
        } else {
          _persistStoryboardSnapshotPreviewToNode(_0x18ea80, _0x4ad2df, _0x195e83, _0x195e83.fileName || "storyboard_extract_" + _0x4ad2df + ".jpg", saveOutputBlobImpl);
        }
        if (_0x3539fe && _0x4ad2df) {
          const _0x4a7e6d = performance.now();
          const _0x5f419a = 1600;
          const _0x27af54 = () => {
            const _0x1cf88e = _getNodeWrapperEl(_0x4ad2df);
            const _0x2f9e6c = _0x1cf88e ? _0x1cf88e.querySelector("img") : null;
            if (_0x2f9e6c && _0x2f9e6c.complete && _0x2f9e6c.naturalWidth > 0) {
              _0x3539fe.style.transition = "opacity 0.18s cubic-bezier(0.4, 0, 0.2, 1)";
              _0x3539fe.style.opacity = "0";
              setTimeout(() => _0x3539fe.remove(), 180);
              return;
            }
            if (performance.now() - _0x4a7e6d >= _0x5f419a) {
              _0x3539fe.remove();
              return;
            }
            requestAnimationFrame(_0x27af54);
          };
          requestAnimationFrame(_0x27af54);
        } else if (_0x3539fe) {
          _0x3539fe.remove();
        }
        _0x53b0c0 = true;
      }
    }
    _0x3421d3.ghostEl = null;
    if (_0x3421d3.lastHoverNodeId) {
      window.v2Renderer?.highlightDropSlot?.(_0x3421d3.lastHoverNodeId, {
        kind: "storyboard",
        index: -1
      });
    }
    return {
      didAct: _0x53b0c0,
      committed: _0x53b0c0
    };
  }
  function _0x51a096(_0x5c438a, _0x41daec, _0x183cca) {
    _flushDragEdgeScheduler(_0x5c438a);
    try {
      return _0x44de09(_0x5c438a, _0x41daec, _0x183cca);
    } finally {
      const _0x1c0ea4 = _0x5c438a?._nodeDragPreviewProxySettle;
      _clearNodeDragPreviewProxies(_0x5c438a, _0x1c0ea4 ? {
        settle: true,
        dx: _0x1c0ea4.dx,
        dy: _0x1c0ea4.dy
      } : undefined);
      delete _0x5c438a._nodeDragPreviewProxySettle;
      _finishMinimapDragPreview(_0x5c438a);
    }
  }
  function _0x44de09(_0x3cf4f6, _0x2a374d, _0x4749f9) {
    if (_0x3cf4f6.dragSource === "title" && _0x3cf4f6.titleDragActivated !== true) {
      const _0x377943 = _0x3cf4f6.titleDragPendingSelectNodeId;
      if (_0x377943) {
        const _0x2fe772 = _0x18ea80.getStateRaw().selectedNodeIds || [];
        if (!_0x2fe772.includes(_0x377943)) {
          _0x431ca1([_0x377943], {
            source: "click"
          });
        }
      }
      _0x3cf4f6.titleDragPendingSelectNodeId = null;
      _0x3cf4f6.titleDragActivated = false;
      _0x3cf4f6.titleDragStartScreenX = 0;
      _0x3cf4f6.titleDragStartScreenY = 0;
      return {
        earlyCommit: false,
        didAct: false
      };
    }
    const _0x35807d = _0x18ea80.getStateRaw();
    const {
      viewport: _0x1cf59b,
      nodes: _0x584a58
    } = _0x35807d;
    const {
      x: _0xe6f64d,
      y: _0x497236
    } = _0xd6215(_0x2a374d, _0x4749f9, _0x1cf59b);
    const {
      selectedNodeIds: _0x3eb7ae
    } = _0x35807d;
    const _0x1fdb4d = _0x3eb7ae.includes(_0x3cf4f6.targetNodeId) ? Array.from(_0x3eb7ae) : [_0x3cf4f6.targetNodeId];
    if (_0x1fdb4d.length === 1) {
      const _0x55c292 = _0x584a58[_0x1fdb4d[0]];
      const _0x4ed316 = _getImagePayloadFromNode(_0x2b5cda, _0x55c292);
      if (_0x4ed316) {
        const _0x4fbebd = _getStoryboardCellInfoAt(_0xe6f64d, _0x497236, _0x584a58);
        if (_0x4fbebd) {
          const _0x4f8630 = _0x584a58[_0x4fbebd.nodeId];
          const _0x4991ef = (_0x4f8630?.cells || [])[_0x4fbebd.cellIndex];
          const _0x49c447 = !!_0x4ed316 && !!_0x4f8630 && _0x4f8630.isEditing === true;
          if (_0x49c447) {
            const _0x19fcba = _getNodeWrapperEl(_0x55c292.id);
            const _0x2e9216 = _0x19fcba ? _0x19fcba.querySelector("img") : null;
            const _0x32d617 = a1020_0x281a64(_0x4ed316, {
              visibleSrc: a1020_0x4ae07c(_0x2e9216)
            });
            if (!_0x32d617?.src) {
              return {
                earlyCommit: false,
                didAct: false
              };
            }
            const _0x5d1cbc = [...(_0x4f8630.cells || [])];
            const _0x2b15f2 = _0x4ed316.storyboardExtractedCell === true;
            const _0x10ef92 = _0x2b15f2 && _isCellEmpty(_0x4991ef);
            const _0x227933 = _0x10ef92 ? {
              ...(_0x4991ef?.residualImageLocalPath ? {
                residualImageLocalPath: _0x4991ef.residualImageLocalPath
              } : {}),
              ...(_0x4991ef?.residualImageUrl ? {
                residualImageUrl: _0x4991ef.residualImageUrl
              } : {}),
              ...(_0x4991ef?.residualImageWidth ? {
                residualImageWidth: _0x4991ef.residualImageWidth
              } : {}),
              ...(_0x4991ef?.residualImageHeight ? {
                residualImageHeight: _0x4991ef.residualImageHeight
              } : {}),
              ...(_0x4991ef?.residualImageMode ? {
                residualImageMode: _0x4991ef.residualImageMode
              } : {})
            } : {};
            const _0x5efafb = getStoryboardCellMetrics(_0x4f8630);
            const _0x5dae08 = getStoryboardCellPixelBounds(_0x4f8630, _0x4fbebd.cellIndex);
            const _0x21a9a = Math.max(1, Math.round((_0x5dae08?.width || _0x5efafb.cellWidth) * _0x1cf59b.zoom));
            const _0xb19450 = Math.max(1, Math.round((_0x5dae08?.height || _0x5efafb.cellHeight) * _0x1cf59b.zoom));
            const _0xd863c6 = _getStoryboardCellCenterWorldPoint(_0x4f8630, _0x4fbebd.cellIndex);
            const _0x1d38cb = worldToScreen(_0xd863c6.x, _0xd863c6.y, _0x1cf59b);
            const _0xb97bb0 = _createGhostFromImage(_0x2e9216, _0x21a9a, _0xb19450, _0x32d617.src || _0x4ed316.thumbUrl || _0x4ed316.url || "");
            _0xb97bb0.style.transform = "translate(" + _0x2a374d + "px, " + _0x4749f9 + "px) translate(-50%, -50%)";
            document.body.appendChild(_0xb97bb0);
            requestAnimationFrame(() => {
              _0xb97bb0.style.transition = "transform 0.18s cubic-bezier(0.4, 0, 0.2, 1)";
              _0xb97bb0.style.transform = "translate(" + _0x1d38cb.x + "px, " + _0x1d38cb.y + "px) translate(-50%, -50%)";
            });
            const _0x19a42e = buildFrozenStoryboardCellFromSnapshot(_0x32d617, _0x4f8630, _0x4fbebd.cellIndex, {
              id: _0x4b9f73("cell")
            });
            _0x5d1cbc[_0x4fbebd.cellIndex] = {
              ..._0x19a42e,
              ..._0x227933
            };
            _0x18ea80.updateNodeData(_0x4f8630.id, {
              cells: _0x5d1cbc
            });
            _flushStoryboardNodesNow(_0x4f8630.id);
            _persistStoryboardSnapshotPreviewToCell(_0x18ea80, _0x4f8630.id, _0x4fbebd.cellIndex, _0x19a42e?.id, _0x32d617, _0x32d617.fileName || "storyboard_cell_" + _0x4f8630.id + "_" + _0x4fbebd.cellIndex + ".jpg", saveOutputBlobImpl);
            const _0x155c3f = () => {
              _0x18ea80.setSelectedNodes([]);
              _0x18ea80.deleteNodes([_0x55c292.id]);
            };
            if (typeof _0x18ea80.batch === "function") {
              _0x18ea80.batch(_0x155c3f);
            } else {
              _0x155c3f();
            }
            requestAnimationFrame(() => {
              setTimeout(() => _0x124320(), 0);
            });
            _fadeOutGhost(_0xb97bb0, 0);
            return {
              earlyCommit: true,
              didAct: true
            };
          }
        }
        const _0x55e1ef = _getCollageSlotInfoAt(_0xe6f64d, _0x497236, _0x584a58);
        if (_0x55e1ef) {
          const _0x330f40 = _0x584a58[_0x55e1ef.nodeId];
          const _0x4d7c37 = (_0x330f40?.items || [])[_0x55e1ef.itemIndex];
          if (_0x330f40 && _0x330f40.isEditing === true) {
            const _0x355131 = _getNodeWrapperEl(_0x55c292.id);
            const _0x561bb1 = _0x355131 ? _0x355131.querySelector("img") : null;
            const _0x27cf17 = a1020_0x47f777(_0x4ed316, {
              visibleSrc: a1020_0x4ae07c(_0x561bb1)
            });
            if (!_0x27cf17?.src) {
              return {
                earlyCommit: false,
                didAct: false
              };
            }
            const _0x235f81 = _0x27cf17.localPath || "";
            const _0x4fb3ae = _0x27cf17.src;
            if (_0x4fb3ae) {
              let _0x26de77 = null;
              const _0x1d0282 = _getCollageItemFrameInfo(_0x330f40, _0x55e1ef.itemIndex);
              if (typeof document !== "undefined" && document.body && _0x1d0282?.frame) {
                const _0x17052b = Math.max(1, Math.round(_0x1d0282.frame.width * _0x1cf59b.zoom));
                const _0x502067 = Math.max(1, Math.round(_0x1d0282.frame.height * _0x1cf59b.zoom));
                const _0x10a321 = _getCollageItemCenterWorldPoint(_0x330f40, _0x55e1ef.itemIndex);
                const _0x4dd7ba = worldToScreen(_0x10a321.x, _0x10a321.y, _0x1cf59b);
                _0x26de77 = _createGhostFromImage(_0x561bb1, _0x17052b, _0x502067, _0x4fb3ae);
                _0x26de77.style.transform = "translate(" + _0x2a374d + "px, " + _0x4749f9 + "px) translate(-50%, -50%)";
                document.body.appendChild(_0x26de77);
                requestAnimationFrame(() => {
                  _0x26de77.style.transition = "transform 0.18s cubic-bezier(0.4, 0, 0.2, 1)";
                  _0x26de77.style.transform = "translate(" + _0x4dd7ba.x + "px, " + _0x4dd7ba.y + "px) translate(-50%, -50%)";
                });
              }
              const _0xdc635d = [...(_0x330f40.items || [])];
              _0xdc635d[_0x55e1ef.itemIndex] = {
                ...(_0x4d7c37 || {}),
                id: _0x4b9f73("collage-item"),
                sourceNodeId: _0x55c292.id,
                url: _0x4fb3ae,
                localPath: normalizeLocalPath(_0x235f81),
                thumbLocalPath: normalizeLocalPath(_0x27cf17.thumbLocalPath),
                sourceLocalPath: "",
                sourceUrl: "",
                sourceWidth: null,
                sourceHeight: null,
                imageWidth: _0x27cf17.width || null,
                imageHeight: _0x27cf17.height || null,
                sourceDisplayWidth: _toPositiveNumber(_0x55c292.width),
                sourceDisplayHeight: _toPositiveNumber(_0x55c292.height),
                label: _0x55c292.name || _0x55c292.fileName || "拼图图片",
                fit: "cover",
                focusX: 0.5,
                focusY: 0.5,
                isEmpty: false
              };
              window.v2Renderer?.previewCollageItems?.(_0x330f40.id, _0xdc635d);
              const _0x58071e = () => {
                _0x18ea80.updateNodeData(_0x330f40.id, {
                  items: _0xdc635d
                });
                _0x18ea80.setSelectedNodes([_0x330f40.id]);
                _0x18ea80.deleteNodes([_0x55c292.id]);
              };
              if (typeof _0x18ea80.batch === "function") {
                _0x18ea80.batch(_0x58071e);
              } else {
                _0x58071e();
              }
              requestAnimationFrame(() => {
                _0x124320();
              });
              if (_0x26de77) {
                _waitForCollageItemImage(_0x330f40.id, _0x55e1ef.itemIndex, _0x4fb3ae, () => _fadeOutGhost(_0x26de77));
              }
              window.v2Renderer?.clearDropSlotHighlight?.(_0x330f40.id);
              return {
                earlyCommit: true,
                didAct: true
              };
            }
          }
        }
      }
    }
    let _0x3170d7 = false;
    if (_0x3cf4f6.pendingDx || _0x3cf4f6.pendingDy) {
      _0x3cf4f6.isCommittingDrag = true;
      markRendererNodeDragCommitHint();
      const _0x1506f0 = new Map();
      _0x1fdb4d.forEach(_0x2b6243 => {
        const _0x5a91ef = _0x584a58[_0x2b6243];
        const _0x3ed8ed = Number(_0x5a91ef?.x);
        const _0xf77acd = Number(_0x5a91ef?.y);
        if (!Number.isFinite(_0x3ed8ed) || !Number.isFinite(_0xf77acd)) {
          return;
        }
        _0x1506f0.set(_0x2b6243, "translate(" + (_0x3ed8ed + _0x3cf4f6.pendingDx) + "px, " + (_0xf77acd + _0x3cf4f6.pendingDy) + "px)");
      });
      if (_0x3eb7ae.includes(_0x3cf4f6.targetNodeId)) {
        _0x18ea80.moveNodes(_0x3eb7ae, _0x3cf4f6.pendingDx, _0x3cf4f6.pendingDy);
      } else {
        _0x18ea80.updateNodePosition(_0x3cf4f6.targetNodeId, _0x3cf4f6.pendingDx, _0x3cf4f6.pendingDy);
      }
      _flushMovedGroupPositionsNow(_0x584a58, _0x1fdb4d, _0x2b5cda);
      _0x1fdb4d.forEach(_0x3d1c7d => {
        const _0x18ee10 = _getNodeWrapperEl(_0x3d1c7d);
        if (_0x18ee10) {
          _0x18ee10.classList.remove("is-ui-hidden");
          _0x18ee10.classList.remove("is-dragging");
          const _0xe1a2f4 = _0x1506f0.get(_0x3d1c7d);
          if (_0xe1a2f4) {
            const _0x2a1456 = () => {
              if (_0x18ee10.isConnected !== false) {
                _0x18ee10.style.transform = _0xe1a2f4;
              }
            };
            _0x2a1456();
            if (typeof queueMicrotask === "function") {
              queueMicrotask(_0x2a1456);
            } else {
              Promise.resolve().then(_0x2a1456);
            }
          }
          delete _0x18ee10._posKey;
        }
      });
      _settleNodeDragPreviewProxiesOnCommit(_0x3cf4f6, _0x3cf4f6.pendingDx, _0x3cf4f6.pendingDy);
      _0x3cf4f6.pendingDx = 0;
      _0x3cf4f6.pendingDy = 0;
      _clearDragEdgeTransformPreview(_0x3cf4f6);
      _0x3170d7 = true;
    }
    const _0x5d559f = _0x18ea80.getStateRaw();
    const _0x5dade9 = collectGroupContainmentReparentOps(_0x5d559f.nodes, _0x1fdb4d);
    if (_0x5dade9.length > 0) {
      _0x18ea80.batch(() => {
        _0x5dade9.forEach(({
          nodeId: _0x3793cb,
          parentId: _0x2dc232
        }) => {
          _0x18ea80.groupNodes([_0x3793cb], _0x2dc232);
        });
      });
      _0x3170d7 = true;
    }
    return {
      earlyCommit: false,
      didAct: _0x3170d7
    };
  }
  return {
    tryStartTitleDrag: _0x198497,
    tryStartNodeDrag: _0x2a1b04,
    updateDraggingCell: _0x312bdc,
    updateDraggingNodes: _0x4d2070,
    finishDraggingCell: _0x6e0d05,
    finishDraggingNodes: _0x51a096
  };
}