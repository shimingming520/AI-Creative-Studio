import a1012_0x59f163 from "../core/stores/appStore.js";
import { findAvailablePosition, generateId } from "../core/math.js";
import { t } from "../i18n/index.js";
import { buildSourceMediaNodePayload, getAutoMediaSizeByShortSide } from "../services/fileService.js";
import { cropGridTiles, saveOutputBlob } from "./project.js";
import { getNodeSpawnPrefs } from "./nodeSpawn.js";
import { normalizeGridTileResult, resolveGridCropImageRef, toPositiveInt } from "./imageToolbarHelpers.js";
const getCanvasFillColor = () => getComputedStyle(document.documentElement).getPropertyValue("--canvas-white").trim();
function imageGridCropText(_0x5d9aa7, _0x41e11b = {}) {
  return t("imageGridCrop." + _0x5d9aa7, _0x41e11b);
}
function getStateSnapshot() {
  if (typeof a1012_0x59f163.getStateRaw === "function") {
    return a1012_0x59f163.getStateRaw();
  } else {
    return a1012_0x59f163.getState();
  }
}
function loadImageForGridCrop(_0x5cf169, _0x2672c1) {
  return new Promise((_0x47ff2, _0x21556f) => {
    const _0xff65cd = new Image();
    _0xff65cd.crossOrigin = "anonymous";
    _0xff65cd.onload = () => _0x47ff2(_0xff65cd);
    _0xff65cd.onerror = () => _0x21556f(new Error(_0x2672c1));
    _0xff65cd.src = _0x5cf169;
  });
}
function cropLoadedImageTile({
  loadedImg: _0x3a817e,
  tileW: _0x4c37a3,
  tileH: _0x299d5e,
  col: _0x2de322,
  row: _0x25fbc9,
  quality: _0x17ab36,
  idPrefix: _0x123f6e,
  fileNamePrefix: _0x12c5e3,
  oneBasedFileName = true,
  subDir: _0x565fd8
}) {
  return new Promise((_0x11629f, _0x551460) => {
    try {
      const _0x3bd4f2 = document.createElement("canvas");
      _0x3bd4f2.width = _0x4c37a3;
      _0x3bd4f2.height = _0x299d5e;
      const _0x1164c4 = _0x3bd4f2.getContext("2d");
      _0x1164c4.fillStyle = getCanvasFillColor();
      _0x1164c4.fillRect(0, 0, _0x4c37a3, _0x299d5e);
      _0x1164c4.drawImage(_0x3a817e, _0x2de322 * _0x4c37a3, _0x25fbc9 * _0x299d5e, _0x4c37a3, _0x299d5e, 0, 0, _0x4c37a3, _0x299d5e);
      _0x3bd4f2.toBlob(async _0x40952a => {
        if (!_0x40952a) {
          _0x551460(new Error(imageGridCropText("errors.canvasBlobFailed")));
          return;
        }
        try {
          const _0x3d50e0 = generateId(_0x123f6e);
          const _0x22f7e3 = oneBasedFileName ? _0x25fbc9 + 1 : _0x25fbc9;
          const _0x44e4f3 = oneBasedFileName ? _0x2de322 + 1 : _0x2de322;
          const _0x1a62ee = new File([_0x40952a], _0x12c5e3 + "_" + _0x3d50e0 + "_" + _0x22f7e3 + "_" + _0x44e4f3 + ".jpg", {
            type: "image/jpeg"
          });
          const _0x425fbb = await saveOutputBlob(_0x1a62ee, {
            ext: "jpg",
            ...(_0x565fd8 ? {
              subDir: _0x565fd8
            } : {})
          });
          _0x11629f(normalizeGridTileResult(_0x425fbb, {
            row: _0x25fbc9,
            col: _0x2de322,
            fileName: _0x1a62ee.name,
            w: _0x4c37a3,
            h: _0x299d5e
          }));
        } catch (_0x1e4d32) {
          _0x551460(_0x1e4d32);
        }
      }, "image/jpeg", _0x17ab36);
    } catch {
      _0x551460(new Error(imageGridCropText("errors.canvasCorsBlocked")));
    }
  });
}
export async function tryCropGridTilesOnServer(_0x2fd629, _0x4294d4, _0x2d2262, _0x51c051 = {}) {
  const {
    localPath: _0x453521
  } = resolveGridCropImageRef(_0x2fd629);
  if (!_0x453521) {
    return null;
  }
  try {
    const _0x41a3f5 = await cropGridTiles({
      localPath: _0x453521,
      cols: _0x4294d4,
      rows: _0x2d2262,
      ext: _0x51c051.ext || "jpg",
      quality: _0x51c051.quality || 85,
      subDir: _0x51c051.subDir || ""
    });
    const _0x1ea2ef = Array.isArray(_0x41a3f5?.tiles) ? _0x41a3f5.tiles : [];
    if (_0x1ea2ef.length !== _0x4294d4 * _0x2d2262) {
      return null;
    }
    return {
      ..._0x41a3f5,
      tiles: _0x1ea2ef.map((_0x10a5ab, _0x3a9d63) => normalizeGridTileResult(_0x10a5ab, {
        row: Math.floor(_0x3a9d63 / _0x4294d4),
        col: _0x3a9d63 % _0x4294d4,
        w: _0x41a3f5.tileWidth,
        h: _0x41a3f5.tileHeight
      }))
    };
  } catch (_0x5514d9) {
    console.warn("[GridCrop] server crop failed, falling back to browser crop:", _0x5514d9);
    return null;
  }
}
async function cropGridTilesInBrowser({
  nodeData: _0x46c510,
  cols: _0x453bbd,
  rows: _0xd03252,
  quality: _0x2548a5,
  idPrefix: _0x36ce45,
  fileNamePrefix: _0xf0104e,
  oneBasedFileName = true,
  subDir = "",
  fallbackTile: _0x36a837
}) {
  const {
    imgUrl: _0x22574a
  } = resolveGridCropImageRef(_0x46c510);
  const _0x117886 = await loadImageForGridCrop(_0x22574a, _0x36a837?.loadErrorMessage || imageGridCropText("errors.localImageLoadFailed"));
  const _0xaee56 = Math.floor(_0x117886.naturalWidth / _0x453bbd);
  const _0x3d5986 = Math.floor(_0x117886.naturalHeight / _0xd03252);
  const _0x284d3e = [];
  for (let _0x250553 = 0; _0x250553 < _0xd03252; _0x250553++) {
    for (let _0x344794 = 0; _0x344794 < _0x453bbd; _0x344794++) {
      const _0x47bf8f = cropLoadedImageTile({
        loadedImg: _0x117886,
        tileW: _0xaee56,
        tileH: _0x3d5986,
        col: _0x344794,
        row: _0x250553,
        quality: _0x2548a5,
        idPrefix: _0x36ce45,
        fileNamePrefix: _0xf0104e,
        oneBasedFileName: oneBasedFileName,
        subDir: subDir
      });
      if (_0x36a837?.onError) {
        _0x284d3e.push(_0x47bf8f.catch(_0x23a9ea => _0x36a837.onError({
          err: _0x23a9ea,
          row: _0x250553,
          col: _0x344794,
          tileW: _0xaee56,
          tileH: _0x3d5986
        })));
      } else {
        _0x284d3e.push(_0x47bf8f);
      }
    }
  }
  const _0x509d9c = await Promise.all(_0x284d3e);
  return {
    tiles: _0x509d9c,
    tileW: _0xaee56,
    tileH: _0x3d5986,
    sourceWidth: _0x117886.naturalWidth,
    sourceHeight: _0x117886.naturalHeight
  };
}
export async function executeGridCrop({
  nodeData: _0x85c462,
  cols: _0x45b3de,
  rows: _0x45dec4
}) {
  const {
    imgUrl: _0x3f9925
  } = resolveGridCropImageRef(_0x85c462);
  if (!_0x3f9925) {
    throw new Error(imageGridCropText("errors.noImage"));
  }
  let _0x5c0b22 = null;
  let _0x105899 = 0;
  let _0x1877ca = 0;
  const _0x3b763b = await tryCropGridTilesOnServer(_0x85c462, _0x45b3de, _0x45dec4, {
    ext: "jpg",
    quality: 88,
    subDir: "Multiple grids"
  });
  if (_0x3b763b) {
    _0x5c0b22 = _0x3b763b.tiles;
    _0x105899 = toPositiveInt(_0x3b763b.tileWidth, _0x5c0b22[0]?.w || 0);
    _0x1877ca = toPositiveInt(_0x3b763b.tileHeight, _0x5c0b22[0]?.h || 0);
  }
  if (!_0x5c0b22) {
    try {
      const _0x84f7a9 = await cropGridTilesInBrowser({
        nodeData: _0x85c462,
        cols: _0x45b3de,
        rows: _0x45dec4,
        quality: 0.88,
        idPrefix: "crop",
        fileNamePrefix: "crop",
        oneBasedFileName: true,
        subDir: "Multiple grids",
        fallbackTile: {
          loadErrorMessage: imageGridCropText("errors.localFileReadFailed"),
          onError: ({
            err: _0x2111b4,
            row: _0x797695,
            col: _0x29c725,
            tileW: _0x16c0f6,
            tileH: _0x55e64e
          }) => {
            console.error("[GridCrop] tile " + _0x797695 + "-" + _0x29c725 + " failed:", _0x2111b4);
            return {
              row: _0x797695,
              col: _0x29c725,
              url: null,
              localPath: "",
              w: _0x16c0f6,
              h: _0x55e64e
            };
          }
        }
      });
      _0x5c0b22 = _0x84f7a9.tiles;
      _0x105899 = _0x84f7a9.tileW;
      _0x1877ca = _0x84f7a9.tileH;
    } catch (_0x303dee) {
      console.error("[GridCrop] load local image failed:", _0x3f9925, _0x303dee);
      throw new Error(imageGridCropText("errors.sourceMaybeRemoved"));
    }
  }
  const {
    direction: _0x4807be,
    spacing: _0x2065a3,
    avoidOverlap: _0x1b7423
  } = getNodeSpawnPrefs();
  const _0x224299 = getStateSnapshot();
  const _0x3a8fca = _0x224299.nodes[_0x85c462.id];
  if (!_0x3a8fca) {
    throw new Error(imageGridCropText("errors.sourceNodeMissing"));
  }
  const {
    width: _0x680b01,
    height: _0x23577c
  } = getAutoMediaSizeByShortSide(_0x105899, _0x1877ca);
  const _0x13a09c = 12;
  const _0x2e93d4 = _0x45b3de * _0x680b01 + (_0x45b3de - 1) * _0x13a09c;
  const _0x18339a = _0x45dec4 * _0x23577c + (_0x45dec4 - 1) * _0x13a09c;
  let _0x88e1e3;
  let _0x18c769;
  if (_0x4807be === "right") {
    _0x88e1e3 = _0x3a8fca.x + (_0x3a8fca.width || 260) + _0x2065a3;
    _0x18c769 = _0x3a8fca.y + ((_0x3a8fca.height || 260) - _0x18339a) / 2;
  } else {
    _0x88e1e3 = _0x3a8fca.x + ((_0x3a8fca.width || 260) - _0x2e93d4) / 2;
    _0x18c769 = _0x3a8fca.y + (_0x3a8fca.height || 260) + _0x2065a3;
  }
  if (_0x1b7423) {
    const _0xe07ff9 = findAvailablePosition(_0x224299.nodes, _0x88e1e3, _0x18c769, _0x2e93d4, _0x18339a, _0x2065a3, _0x4807be);
    _0x88e1e3 = _0xe07ff9.x;
    _0x18c769 = _0xe07ff9.y;
  }
  const _0x50c78d = [];
  _0x5c0b22.forEach(_0x2a57f6 => {
    const {
      row: _0x1ad43b,
      col: _0x4d2455,
      url: _0x3134a4,
      localPath: _0x630d80,
      fileName: _0x398523
    } = _0x2a57f6;
    if (!_0x3134a4 || !_0x630d80) {
      return;
    }
    const _0x293105 = "source-image-crop-" + Date.now() + "-" + _0x1ad43b + "-" + _0x4d2455 + "-" + Math.random().toString(36).slice(2, 6);
    const _0x104acc = _0x88e1e3 + _0x4d2455 * (_0x680b01 + _0x13a09c);
    const _0x182a76 = _0x18c769 + _0x1ad43b * (_0x23577c + _0x13a09c);
    const _0x2f0bc8 = _0x630d80.startsWith("/") ? _0x630d80.slice(1) : _0x630d80;
    a1012_0x59f163.addNode(buildSourceMediaNodePayload({
      id: _0x293105,
      type: "source-image",
      x: _0x104acc,
      y: _0x182a76,
      width: _0x680b01,
      height: _0x23577c,
      name: imageGridCropText("output.nodeName", {
        row: _0x1ad43b + 1,
        col: _0x4d2455 + 1
      }),
      src: "",
      localPath: _0x2f0bc8,
      originalLocalPath: _0x2a57f6.originalLocalPath || _0x2f0bc8,
      displayLocalPath: _0x2a57f6.displayLocalPath || "",
      thumbLocalPath: _0x2a57f6.thumbLocalPath || "",
      originalWidth: _0x2a57f6.originalWidth || _0x2a57f6.w || _0x105899,
      originalHeight: _0x2a57f6.originalHeight || _0x2a57f6.h || _0x1877ca,
      fileName: _0x398523 || "",
      needsAutoResize: false
    }));
    _0x50c78d.push(_0x293105);
  });
  if (_0x50c78d.length > 0) {
    a1012_0x59f163.setSelectedNodes(_0x50c78d);
    window._triggerLocalCacheSave?.();
  }
  return {
    newIds: _0x50c78d,
    srcNode: _0x3a8fca
  };
}
export async function prepareGridCells({
  nodeData: _0x59372d,
  cols: _0x4b2f3c,
  rows: _0x3f3346
}) {
  const {
    localPath: _0x37e227,
    imgUrl: _0x37c2f0
  } = resolveGridCropImageRef(_0x59372d);
  if (!_0x37c2f0) {
    throw new Error(imageGridCropText("errors.noImage"));
  }
  const _0x1dad32 = await tryCropGridTilesOnServer(_0x59372d, _0x4b2f3c, _0x3f3346, {
    ext: "jpg",
    quality: 85
  });
  if (_0x1dad32) {
    return _0x1dad32.tiles.map(_0x197467 => ({
      id: generateId("cell"),
      url: "",
      localPath: _0x197467.localPath,
      originalLocalPath: _0x197467.originalLocalPath || _0x197467.localPath,
      displayLocalPath: _0x197467.displayLocalPath || "",
      thumbLocalPath: _0x197467.thumbLocalPath || "",
      fileName: _0x197467.fileName || "",
      originalWidth: _0x197467.originalWidth || _0x197467.w || _0x1dad32.tileWidth,
      originalHeight: _0x197467.originalHeight || _0x197467.h || _0x1dad32.tileHeight,
      sourceLocalPath: _0x37e227 || "",
      sourceUrl: _0x37e227 ? "" : _0x37c2f0,
      sourceWidth: _0x1dad32.sourceWidth || _0x1dad32.tileWidth * _0x4b2f3c,
      sourceHeight: _0x1dad32.sourceHeight || _0x1dad32.tileHeight * _0x3f3346,
      w: _0x197467.w || _0x1dad32.tileWidth,
      h: _0x197467.h || _0x1dad32.tileHeight,
      row: _0x197467.row,
      col: _0x197467.col,
      isEmpty: false
    }));
  }
  const {
    tiles: _0x3ee876,
    sourceWidth: _0x1e8ffb,
    sourceHeight: _0x54c4c4
  } = await cropGridTilesInBrowser({
    nodeData: _0x59372d,
    cols: _0x4b2f3c,
    rows: _0x3f3346,
    quality: 0.85,
    idPrefix: "tile",
    fileNamePrefix: "sb",
    oneBasedFileName: false,
    fallbackTile: {
      loadErrorMessage: imageGridCropText("errors.localImageLoadFailed")
    }
  });
  return _0x3ee876.map(_0x425807 => ({
    id: generateId("cell"),
    url: "",
    localPath: _0x425807.localPath,
    originalLocalPath: _0x425807.originalLocalPath || _0x425807.localPath,
    displayLocalPath: _0x425807.displayLocalPath || "",
    thumbLocalPath: _0x425807.thumbLocalPath || "",
    fileName: _0x425807.fileName || "",
    originalWidth: _0x425807.originalWidth || _0x425807.w,
    originalHeight: _0x425807.originalHeight || _0x425807.h,
    sourceLocalPath: _0x37e227 || "",
    sourceUrl: _0x37e227 ? "" : _0x37c2f0,
    sourceWidth: _0x1e8ffb || _0x4b2f3c * _0x425807.w,
    sourceHeight: _0x54c4c4 || _0x3f3346 * _0x425807.h,
    w: _0x425807.w,
    h: _0x425807.h,
    row: _0x425807.row,
    col: _0x425807.col,
    isEmpty: false
  }));
}