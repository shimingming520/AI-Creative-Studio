import { generateId } from "../../core/math.js";
import { buildStoryboardCropRect, detachStoryboardCellSourceContext, isStoryboardCellEmpty, resolveStoryboardCellPreviewSrc, resolveStoryboardCellSourceIndex } from "../../core/storyboardCellUtils.js";
import { getStoryboardCellCommitSourceUrl, getStoryboardCellSourceImageUrl, isStoryboardCellSourceCropRequired } from "./storyboardAssetRefs.js";
function drawStoryboardCropToDataUrl(_0x3571cd, _0x50b345) {
  const _0x4dcdba = document.createElement("canvas");
  if (!_0x4dcdba || typeof _0x4dcdba.getContext !== "function") {
    return "";
  }
  _0x4dcdba.width = _0x50b345.sw;
  _0x4dcdba.height = _0x50b345.sh;
  const _0x33029a = _0x4dcdba.getContext("2d", {
    alpha: false
  });
  if (!_0x33029a || typeof _0x33029a.drawImage !== "function") {
    return "";
  }
  _0x33029a.imageSmoothingEnabled = true;
  _0x33029a.imageSmoothingQuality = "high";
  _0x33029a.drawImage(_0x3571cd, _0x50b345.sx, _0x50b345.sy, _0x50b345.sw, _0x50b345.sh, 0, 0, _0x50b345.sw, _0x50b345.sh);
  const _0x58a975 = _0x4dcdba.toDataURL("image/jpeg", 0.9);
  if (String(_0x58a975 || "").startsWith("data:image/")) {
    return _0x58a975;
  } else {
    return "";
  }
}
export function buildStoryboardMaterializedCellCrop({
  cell: _0x43015b,
  index: _0x4477ba,
  img: _0xec6302,
  sourceNode: _0x4842aa
} = {}) {
  if (!_0xec6302 || typeof document === "undefined") {
    return null;
  }
  const _0x43f5bf = Math.max(1, Math.trunc(Number(_0xec6302.naturalWidth) || 0));
  const _0xd6a39c = Math.max(1, Math.trunc(Number(_0xec6302.naturalHeight) || 0));
  if (_0x43f5bf <= 0 || _0xd6a39c <= 0) {
    return null;
  }
  const _0xde988 = resolveStoryboardCellSourceIndex(_0x43015b, _0x4477ba, _0x4842aa);
  const _0x211989 = buildStoryboardCropRect(_0x4842aa, _0xde988, {
    width: _0x43f5bf,
    height: _0xd6a39c,
    inset: 0
  });
  if (!_0x211989 || _0x211989.sw <= 0 || _0x211989.sh <= 0) {
    return null;
  }
  try {
    const _0x39c9cb = drawStoryboardCropToDataUrl(_0xec6302, _0x211989);
    if (!_0x39c9cb) {
      return null;
    }
    return {
      capturePreviewUrl: _0x39c9cb,
      fileName: _0x43015b?.fileName || "storyboard_piece_" + generateId("storyboard-cell") + ".jpg",
      originalWidth: _0x211989.sw,
      originalHeight: _0x211989.sh,
      imageWidth: _0x211989.sw,
      imageHeight: _0x211989.sh,
      w: _0x211989.sw,
      h: _0x211989.sh
    };
  } catch {
    return null;
  }
}
export function materializeStoryboardSourceBackedCellsForEditing({
  node: _0xf6a6da,
  cells: _0x585ad8,
  getLoadedSourceImageForCell: _0x477114
} = {}) {
  const _0x554e6c = Array.isArray(_0x585ad8) ? _0x585ad8 : [];
  let _0x197962 = false;
  const _0x26b65c = _0xf6a6da;
  const _0xa52b4f = _0x554e6c.map((_0x40c953, _0x1b35c4) => {
    const _0x6a719c = getStoryboardCellSourceImageUrl(_0x40c953);
    if (!_0x6a719c || isStoryboardCellEmpty(_0x40c953)) {
      return _0x40c953;
    }
    const _0x1edfa3 = _0x477114(_0x1b35c4, _0x6a719c);
    const _0x55a6d2 = buildStoryboardMaterializedCellCrop({
      cell: _0x40c953,
      index: _0x1b35c4,
      img: _0x1edfa3,
      sourceNode: _0x26b65c
    });
    const _0x1511bd = !!_0x55a6d2?.capturePreviewUrl || !!resolveStoryboardCellPreviewSrc(_0x40c953);
    if (!_0x1511bd) {
      return _0x40c953;
    }
    _0x197962 = true;
    return detachStoryboardCellSourceContext({
      ...(_0x40c953 && typeof _0x40c953 === "object" ? _0x40c953 : {}),
      ...(_0x55a6d2 || {}),
      localPath: _0x55a6d2?.capturePreviewUrl ? null : _0x40c953.localPath || null,
      originalLocalPath: _0x55a6d2?.capturePreviewUrl ? null : _0x40c953.originalLocalPath || null,
      displayLocalPath: _0x55a6d2?.capturePreviewUrl ? "" : _0x40c953.displayLocalPath || "",
      thumbLocalPath: _0x55a6d2?.capturePreviewUrl ? "" : _0x40c953.thumbLocalPath || "",
      thumbUrl: _0x55a6d2?.capturePreviewUrl ? "" : _0x40c953.thumbUrl || "",
      thumbId: null,
      storyboardSourceIndex: resolveStoryboardCellSourceIndex(_0x40c953, _0x1b35c4, _0x26b65c),
      storyboardLockedCell: true,
      isEmpty: false
    }, {
      locked: true,
      extracted: _0x40c953.storyboardExtractedCell === true
    });
  });
  if (_0x197962) {
    return _0xa52b4f;
  } else {
    return null;
  }
}
export async function cropStoryboardCellFromSource({
  cell: _0x4d84a6,
  index: _0x9e12c8,
  sourceNode: _0x580915,
  imageCache: _0x5dc92f,
  resolveSourceImage: _0x3f847f
} = {}) {
  const _0x4cb208 = getStoryboardCellCommitSourceUrl(_0x4d84a6, _0x580915);
  if (!_0x4cb208) {
    if (isStoryboardCellSourceCropRequired(_0x4d84a6)) {
      return {
        cell: _0x4d84a6,
        ok: false,
        skipped: false
      };
    }
    return {
      cell: _0x4d84a6,
      ok: true,
      skipped: true
    };
  }
  const _0x5e00e0 = await _0x3f847f(_0x9e12c8, _0x4cb208, _0x5dc92f);
  if (!_0x5e00e0) {
    return {
      cell: _0x4d84a6,
      ok: false,
      skipped: false
    };
  }
  const _0x5220c8 = resolveStoryboardCellSourceIndex(_0x4d84a6, _0x9e12c8, _0x580915);
  const _0x5b024e = buildStoryboardCropRect(_0x580915, _0x5220c8, {
    width: _0x5e00e0.naturalWidth,
    height: _0x5e00e0.naturalHeight,
    inset: 0
  });
  if (!_0x5b024e || _0x5b024e.sw <= 0 || _0x5b024e.sh <= 0) {
    return {
      cell: _0x4d84a6,
      ok: false,
      skipped: false
    };
  }
  let _0x5db907 = "";
  try {
    _0x5db907 = drawStoryboardCropToDataUrl(_0x5e00e0, _0x5b024e);
  } catch {
    _0x5db907 = "";
  }
  if (!_0x5db907) {
    return {
      cell: _0x4d84a6,
      ok: false,
      skipped: false
    };
  }
  const _0x2f57b3 = detachStoryboardCellSourceContext({
    ...(_0x4d84a6 && typeof _0x4d84a6 === "object" ? _0x4d84a6 : {}),
    url: "",
    localPath: null,
    originalLocalPath: null,
    displayLocalPath: "",
    thumbLocalPath: "",
    thumbUrl: "",
    thumbId: null,
    capturePreviewUrl: _0x5db907,
    fileName: "storyboard_cell_" + generateId("storyboard-cell") + ".jpg",
    originalWidth: _0x5b024e.sw,
    originalHeight: _0x5b024e.sh,
    imageWidth: _0x5b024e.sw,
    imageHeight: _0x5b024e.sh,
    w: _0x5b024e.sw,
    h: _0x5b024e.sh,
    storyboardPiece: true,
    storyboardSourceIndex: _0x5220c8,
    storyboardLockedCell: true,
    storyboardExtractedCell: false,
    isEmpty: false
  }, {
    locked: true,
    extracted: false
  });
  _0x2f57b3.storyboardPiece = true;
  return {
    cell: _0x2f57b3,
    ok: true,
    skipped: false
  };
}
export async function materializeStoryboardCellsForConfirmedGrid({
  node: _0x317391,
  gridLayout: _0x30820e,
  gridGap: _0x1328a0,
  cellsOverride = null,
  cropCell: _0x552e21
} = {}) {
  const _0x43f2fa = Array.isArray(cellsOverride) ? cellsOverride : Array.isArray(_0x317391?.cells) ? _0x317391.cells : [];
  if (!Array.isArray(_0x43f2fa) || _0x43f2fa.length <= 0) {
    return {
      cells: _0x43f2fa,
      partialFailure: false
    };
  }
  const _0x13a4a8 = {
    ..._0x317391,
    gridLayout: _0x30820e,
    gridGap: _0x1328a0
  };
  const _0x2d80ca = new Map();
  const _0x1b441c = [];
  const _0xda98cb = [..._0x43f2fa];
  for (let _0x328db7 = 0; _0x328db7 < _0x43f2fa.length; _0x328db7 += 1) {
    const _0x699575 = _0x43f2fa[_0x328db7];
    if (isStoryboardCellEmpty(_0x699575)) {
      continue;
    }
    const _0x462c18 = await _0x552e21(_0x699575, _0x328db7, _0x13a4a8, _0x2d80ca);
    if (!_0x462c18.ok && !_0x462c18.skipped) {
      _0x1b441c.push(_0x328db7);
      continue;
    }
    _0xda98cb[_0x328db7] = _0x462c18.cell;
  }
  const _0x28ec90 = _0x1b441c.length === 0;
  return {
    ok: _0x28ec90,
    cells: _0x28ec90 ? _0xda98cb : _0x43f2fa,
    failedIndices: _0x1b441c
  };
}