import { computeNodesWorldBounds } from "./math.js";
import { getRendererNodeLabelKind } from "./rendererNodePresentation.js";
import { isCanvasImageDisplayLoadPending, preloadCanvasImage } from "../modules/canvasMediaScheduler.js";
const DEFAULT_NODE_WIDTH = 160;
const DEFAULT_NODE_HEIGHT = 120;
const DEFAULT_WORLD_PADDING = 48;
const DEFAULT_MAX_CANVAS_DIMENSION = 4096;
const DEFAULT_MAX_BITMAP_PIXELS = 8388608;
const DEFAULT_MAX_DPR = 2;
const DEFAULT_MAX_IMAGE_CACHE = 640;
const DEFAULT_MAX_NEW_IMAGES_PER_SYNC = 24;
const DEFAULT_DENSE_MAX_NEW_IMAGES_PER_SYNC = 48;
const DEFAULT_MAX_READY_IMAGES_PER_FRAME = 8;
const DEFAULT_DENSE_MAX_READY_IMAGES_PER_FRAME = 16;
const DENSE_READY_REVEAL_NODE_COUNT = 320;
function finiteNumber(_0x6384d3, _0x29a98f = 0) {
  const _0xec0dc3 = Number(_0x6384d3);
  if (Number.isFinite(_0xec0dc3)) {
    return _0xec0dc3;
  } else {
    return _0x29a98f;
  }
}
function positiveInteger(_0x197a4f, _0x3d3889) {
  const _0x4b4fd9 = Math.trunc(finiteNumber(_0x197a4f, _0x3d3889));
  if (_0x4b4fd9 > 0) {
    return _0x4b4fd9;
  } else {
    return _0x3d3889;
  }
}
function normalizeIdSet(_0x1bb135) {
  const _0x56b2c2 = new Set();
  if (!_0x1bb135 || typeof _0x1bb135[Symbol.iterator] !== "function") {
    return _0x56b2c2;
  }
  for (const _0x56008b of _0x1bb135) {
    const _0x57ccd2 = String(_0x56008b?.id ?? _0x56008b ?? "").trim();
    if (_0x57ccd2) {
      _0x56b2c2.add(_0x57ccd2);
    }
  }
  return _0x56b2c2;
}
function resolveMediaLoadingBusy(_0x42976d) {
  if (_0x42976d && Object.prototype.hasOwnProperty.call(_0x42976d, "mediaLoadingBusy")) {
    return _0x42976d.mediaLoadingBusy === true;
  }
  return _0x42976d?.viewportBusy === true;
}
function normalizeSources(_0x431380) {
  const _0x40c2eb = typeof _0x431380 === "string" ? [_0x431380] : Array.isArray(_0x431380) ? _0x431380 : Array.isArray(_0x431380?.sources) ? _0x431380.sources : [_0x431380?.source, _0x431380?.src];
  const _0x467e38 = [];
  const _0x3322b0 = new Set();
  for (const _0x4622ee of _0x40c2eb || []) {
    const _0x2d1c3e = String(_0x4622ee || "").trim();
    if (!_0x2d1c3e || _0x3322b0.has(_0x2d1c3e)) {
      continue;
    }
    _0x3322b0.add(_0x2d1c3e);
    _0x467e38.push(_0x2d1c3e);
  }
  return _0x467e38;
}
function getNode(_0x43ee4b, _0x14b8a3) {
  if (_0x43ee4b instanceof Map) {
    return _0x43ee4b.get(_0x14b8a3) || null;
  }
  return _0x43ee4b?.[_0x14b8a3] || null;
}
function getCandidateIds(_0x3816ef, _0x34a0f2) {
  if (_0x34a0f2 && typeof _0x34a0f2[Symbol.iterator] === "function") {
    return normalizeIdSet(_0x34a0f2);
  }
  if (_0x3816ef instanceof Map) {
    return normalizeIdSet(_0x3816ef.keys());
  }
  return normalizeIdSet(Object.keys(_0x3816ef || {}));
}
function getNodeKind(_0x33fa7f) {
  const _0x218cad = getRendererNodeLabelKind(_0x33fa7f?.type);
  if (_0x218cad) {
    return _0x218cad;
  }
  const _0x3d208b = String(_0x33fa7f?.type || "").toLowerCase();
  if (_0x3d208b.includes("video") || _0x3d208b.includes("media-clip")) {
    return "video";
  }
  if (_0x3d208b.includes("image")) {
    return "image";
  }
  if (_0x3d208b.includes("text") || _0x3d208b.includes("comment")) {
    return "text";
  }
  if (_0x3d208b.includes("group")) {
    return "group";
  }
  return "node";
}
function getNodeLabel(_0x10c178, _0x1d64db) {
  const _0x4dc1fc = _0x1d64db === "video" ? "Video" : _0x1d64db === "image" ? "Image" : _0x1d64db === "text" ? "Text" : _0x1d64db === "group" ? "Group" : "Node";
  return String(_0x10c178?.name || _0x10c178?.title || _0x10c178?.text || _0x10c178?.prompt || _0x4dc1fc).replace(/\s+/g, " ").trim().slice(0, _0x1d64db === "text" ? 96 : 36);
}
function getCssColor(_0x100416, _0x434484, _0xb2b819) {
  const _0xfd30f3 = _0x100416?.documentElement || _0x100416?.body;
  const _0x2ff922 = _0x100416?.defaultView || globalThis.window;
  try {
    const _0x404913 = _0x2ff922?.getComputedStyle?.(_0xfd30f3)?.getPropertyValue?.(_0x434484);
    return String(_0x404913 || "").trim() || _0xb2b819;
  } catch {
    return _0xb2b819;
  }
}
function resolvePalette(_0x35b9e2, _0x3ddcc7 = {}) {
  return {
    nodeFill: _0x3ddcc7.nodeFill || getCssColor(_0x35b9e2, "--surface-node", "ButtonFace"),
    nodeStroke: _0x3ddcc7.nodeStroke || getCssColor(_0x35b9e2, "--stroke-default", "GrayText"),
    text: _0x3ddcc7.text || getCssColor(_0x35b9e2, "--text-primary", "CanvasText"),
    placeholder: _0x3ddcc7.placeholder || getCssColor(_0x35b9e2, "--text-secondary", "GrayText"),
    nodeLabel: _0x3ddcc7.nodeLabel || getCssColor(_0x35b9e2, "--white-40", "GrayText")
  };
}
function formatCssNumber(_0x46a155) {
  const _0x5962de = Math.abs(_0x46a155) < 0.0001 ? 0 : _0x46a155;
  return String(_0x5962de);
}
function normalizeExplicitWorldBounds(_0x232f45) {
  if (!_0x232f45 || typeof _0x232f45 !== "object") {
    return null;
  }
  const _0x323ea4 = finiteNumber(_0x232f45.left ?? _0x232f45.minX, NaN);
  const _0x5edfce = finiteNumber(_0x232f45.top ?? _0x232f45.minY, NaN);
  const _0x460cbd = finiteNumber(_0x232f45.width, finiteNumber(_0x232f45.maxX, NaN) - _0x323ea4);
  const _0x2212e4 = finiteNumber(_0x232f45.height, finiteNumber(_0x232f45.maxY, NaN) - _0x5edfce);
  if (!Number.isFinite(_0x323ea4) || !Number.isFinite(_0x5edfce) || !(_0x460cbd > 0) || !(_0x2212e4 > 0)) {
    return null;
  }
  return {
    left: _0x323ea4,
    top: _0x5edfce,
    width: _0x460cbd,
    height: _0x2212e4
  };
}
function computeRasterWorldBounds(_0xdea052, _0x16914a) {
  const _0x175f20 = normalizeExplicitWorldBounds(_0x16914a?.worldBounds);
  if (_0x175f20) {
    return _0x175f20;
  }
  const _0x11fbb3 = computeNodesWorldBounds(_0xdea052);
  if (!_0x11fbb3) {
    return null;
  }
  const _0x2bf566 = Math.max(0, finiteNumber(_0x16914a?.worldPadding, DEFAULT_WORLD_PADDING));
  const _0x4f5056 = Math.floor(_0x11fbb3.minX - _0x2bf566);
  const _0x42c533 = Math.floor(_0x11fbb3.minY - _0x2bf566);
  const _0x372456 = Math.ceil(_0x11fbb3.maxX + _0x2bf566);
  const _0x3b7713 = Math.ceil(_0x11fbb3.maxY + _0x2bf566);
  return {
    left: _0x4f5056,
    top: _0x42c533,
    width: Math.max(1, _0x372456 - _0x4f5056),
    height: Math.max(1, _0x3b7713 - _0x42c533)
  };
}
function createEmptyStats(_0x573aa3 = 0, _0x453158 = false) {
  return {
    active: false,
    supported: _0x453158,
    drawnNodeIds: [],
    drawnMediaNodeIds: [],
    drawnNodeCount: 0,
    mediaDrawCount: 0,
    mediaSourceCount: 0,
    placeholderCount: 0,
    candidateCount: 0,
    excludedNodeCount: 0,
    bitmapWidth: 0,
    bitmapHeight: 0,
    cssWidth: 0,
    cssHeight: 0,
    dpr: 1,
    renderScale: 1,
    effectiveScale: 1,
    rasterScale: 1,
    revision: _0x573aa3,
    worldBounds: null,
    cachedImageCount: 0,
    pendingImageCount: 0,
    readyImageCount: 0,
    loadedImageCount: 0,
    errorImageCount: 0,
    cacheLimit: 0,
    cacheHitCount: 0,
    cacheMissCount: 0,
    skippedBusyImageCount: 0,
    startedImageCount: 0,
    revealedImageCount: 0
  };
}
function defaultRequestFrame(_0x297c2f) {
  if (typeof globalThis.requestAnimationFrame === "function") {
    return globalThis.requestAnimationFrame(_0x297c2f);
  }
  _0x297c2f();
  return null;
}
function defaultCancelFrame(_0x501885) {
  if (_0x501885 != null && typeof globalThis.cancelAnimationFrame === "function") {
    globalThis.cancelAnimationFrame(_0x501885);
  }
}
function drawImageCover(_0x11e7e3, _0x3d29f7, _0x526a4b) {
  const _0x21d3fb = Math.max(0, finiteNumber(_0x3d29f7?.naturalWidth ?? _0x3d29f7?.videoWidth ?? _0x3d29f7?.width, 0));
  const _0x39bcb7 = Math.max(0, finiteNumber(_0x3d29f7?.naturalHeight ?? _0x3d29f7?.videoHeight ?? _0x3d29f7?.height, 0));
  try {
    if (!(_0x21d3fb > 0) || !(_0x39bcb7 > 0)) {
      _0x11e7e3.drawImage(_0x3d29f7, _0x526a4b.x, _0x526a4b.y, _0x526a4b.width, _0x526a4b.height);
      return true;
    }
    const _0x487d39 = _0x21d3fb / _0x39bcb7;
    const _0x46a064 = _0x526a4b.width / _0x526a4b.height;
    let _0x4d99d7 = 0;
    let _0x329bb1 = 0;
    let _0x2ff871 = _0x21d3fb;
    let _0x2fd2f8 = _0x39bcb7;
    if (_0x487d39 > _0x46a064) {
      _0x2ff871 = _0x39bcb7 * _0x46a064;
      _0x4d99d7 = (_0x21d3fb - _0x2ff871) / 2;
    } else if (_0x487d39 < _0x46a064) {
      _0x2fd2f8 = _0x21d3fb / _0x46a064;
      _0x329bb1 = (_0x39bcb7 - _0x2fd2f8) / 2;
    }
    _0x11e7e3.drawImage(_0x3d29f7, _0x4d99d7, _0x329bb1, _0x2ff871, _0x2fd2f8, _0x526a4b.x, _0x526a4b.y, _0x526a4b.width, _0x526a4b.height);
    return true;
  } catch {
    return false;
  }
}
function strokeRoundedRect(_0x4b5abf, _0x28ff24, _0x35f2d0, _0x56855c, _0x5783f6, _0x48d707) {
  if (typeof _0x4b5abf.roundRect === "function") {
    _0x4b5abf.beginPath();
    _0x4b5abf.roundRect(_0x28ff24, _0x35f2d0, _0x56855c, _0x5783f6, _0x48d707);
    _0x4b5abf.stroke();
    return;
  }
  _0x4b5abf.strokeRect(_0x28ff24, _0x35f2d0, _0x56855c, _0x5783f6);
}
function strokeCircle(_0x2746eb, _0x410770, _0x3d4688, _0x3756b6) {
  if (typeof _0x2746eb.arc !== "function") {
    return;
  }
  _0x2746eb.beginPath();
  _0x2746eb.arc(_0x410770, _0x3d4688, _0x3756b6, 0, Math.PI * 2);
  _0x2746eb.stroke();
}
function drawMediaTypeIcon(_0x4dbb4a, _0x3018fd, _0x46d1c9, _0x492c4a, _0x5559c2, _0x319007) {
  if (!["image", "video"].includes(_0x3018fd)) {
    return false;
  }
  if (!(_0x5559c2 > 0) || _0x5559c2 * _0x319007 < 3) {
    return false;
  }
  const _0x3d0115 = _0x5559c2 / 24;
  const _0x43bc8f = _0x46d1c9 - _0x5559c2 / 2;
  const _0x1e851c = _0x492c4a - _0x5559c2 / 2;
  const _0x21a89d = _0x4e6339 => _0x43bc8f + _0x4e6339 * _0x3d0115;
  const _0xb2fc1b = _0x47c266 => _0x1e851c + _0x47c266 * _0x3d0115;
  _0x4dbb4a.lineWidth = Math.min(3.2, Math.max(1.2, 0.7 / Math.max(0.01, _0x319007)));
  if (_0x3018fd === "image") {
    strokeRoundedRect(_0x4dbb4a, _0x21a89d(3), _0xb2fc1b(3), _0x3d0115 * 18, _0x3d0115 * 18, _0x3d0115 * 2);
    strokeCircle(_0x4dbb4a, _0x21a89d(8.5), _0xb2fc1b(8.5), _0x3d0115 * 1.5);
    _0x4dbb4a.beginPath();
    _0x4dbb4a.moveTo(_0x21a89d(21), _0xb2fc1b(15));
    _0x4dbb4a.lineTo(_0x21a89d(16), _0xb2fc1b(10));
    _0x4dbb4a.lineTo(_0x21a89d(5), _0xb2fc1b(21));
    _0x4dbb4a.stroke();
    return true;
  }
  if (_0x3018fd === "video") {
    strokeRoundedRect(_0x4dbb4a, _0x21a89d(1), _0xb2fc1b(5), _0x3d0115 * 15, _0x3d0115 * 14, _0x3d0115 * 2);
    _0x4dbb4a.beginPath();
    _0x4dbb4a.moveTo(_0x21a89d(23), _0xb2fc1b(7));
    _0x4dbb4a.lineTo(_0x21a89d(16), _0xb2fc1b(12));
    _0x4dbb4a.lineTo(_0x21a89d(23), _0xb2fc1b(17));
    _0x4dbb4a.closePath();
    _0x4dbb4a.stroke();
    return true;
  }
  return false;
}
function drawPlaceholder(_0x1284bb, _0x53bd23, _0xcb58fa, _0x4fc5f2, _0xb0d1ec) {
  const _0x4e659b = Math.min(40, _0x53bd23.width * 0.32, _0x53bd23.height * 0.32);
  _0x1284bb.strokeStyle = _0xcb58fa.placeholder;
  _0x1284bb.globalAlpha = _0xb0d1ec * 0.72;
  const _0x3a48a0 = drawMediaTypeIcon(_0x1284bb, _0x53bd23.kind, _0x53bd23.x + _0x53bd23.width / 2, _0x53bd23.y + _0x53bd23.height / 2, _0x4e659b, _0x4fc5f2);
  if (!_0x3a48a0) {
    const _0x45e5ac = Math.min(18, Math.max(10, _0x53bd23.height * 0.12));
    if (_0x45e5ac * _0x4fc5f2 >= 7) {
      _0x1284bb.fillStyle = _0xcb58fa.placeholder;
      _0x1284bb.font = "500 " + _0x45e5ac + "px system-ui, sans-serif";
      _0x1284bb.fillText(_0x53bd23.label, _0x53bd23.x + 8, _0x53bd23.y + _0x53bd23.height / 2 + _0x45e5ac * 0.35, Math.max(1, _0x53bd23.width - 16));
    }
  }
  _0x1284bb.globalAlpha = _0xb0d1ec;
}
function drawNodeLabel(_0x3c2e27, _0x2461dc, _0x4c1253, _0x376890, _0x5a8d1d) {
  if (!["image", "video"].includes(_0x2461dc.kind)) {
    return;
  }
  const _0x598e72 = 21;
  if (_0x598e72 * _0x376890 < 3) {
    return;
  }
  const _0xe9b4d0 = _0x598e72 * 1.33;
  _0x3c2e27.globalAlpha = _0x5a8d1d * 0.64;
  _0x3c2e27.strokeStyle = _0x4c1253.nodeLabel;
  _0x3c2e27.fillStyle = _0x4c1253.nodeLabel;
  drawMediaTypeIcon(_0x3c2e27, _0x2461dc.kind, _0x2461dc.x + _0xe9b4d0 / 2, _0x2461dc.y - 8 - _0xe9b4d0 / 2, _0xe9b4d0, _0x376890);
  _0x3c2e27.font = "500 " + _0x598e72 + "px system-ui, sans-serif";
  _0x3c2e27.fillText(_0x2461dc.label, _0x2461dc.x + _0xe9b4d0 + 6, _0x2461dc.y - 10, Math.max(1, _0x2461dc.width - _0xe9b4d0 - 6));
  _0x3c2e27.globalAlpha = _0x5a8d1d;
}
export function createRendererRasterPreviewLayer({
  documentRef = globalThis.document,
  resolveMediaSources = null,
  createImage = null,
  requestFrame = defaultRequestFrame,
  cancelFrame = defaultCancelFrame,
  maxImageCache = DEFAULT_MAX_IMAGE_CACHE,
  maxNewImagesPerSync = null,
  maxReadyImagesPerFrame = null,
  maxCanvasDimension = DEFAULT_MAX_CANVAS_DIMENSION,
  maxBitmapPixels = DEFAULT_MAX_BITMAP_PIXELS,
  maxDpr = DEFAULT_MAX_DPR,
  onMediaPresented = null
} = {}) {
  const _0x9ca8f4 = Math.max(0, Math.trunc(finiteNumber(maxImageCache, DEFAULT_MAX_IMAGE_CACHE)));
  const _0x5a066b = Number(maxNewImagesPerSync);
  const _0x15b1fe = maxNewImagesPerSync != null && Number.isFinite(_0x5a066b) && _0x5a066b >= 0;
  const _0xe63b42 = _0x15b1fe ? Math.max(0, Math.trunc(_0x5a066b)) : DEFAULT_MAX_NEW_IMAGES_PER_SYNC;
  const _0x28f222 = _0x15b1fe ? _0xe63b42 : DEFAULT_DENSE_MAX_NEW_IMAGES_PER_SYNC;
  const _0x4b750f = Number(maxReadyImagesPerFrame);
  const _0x124b08 = Number.isFinite(_0x4b750f) && _0x4b750f > 0;
  const _0x2bb039 = _0x124b08 ? Math.max(1, Math.trunc(_0x4b750f)) : DEFAULT_MAX_READY_IMAGES_PER_FRAME;
  const _0x4c9245 = _0x124b08 ? _0x2bb039 : DEFAULT_DENSE_MAX_READY_IMAGES_PER_FRAME;
  const _0x45813a = new Map();
  let _0x2c79c9 = null;
  let _0x4316a4 = null;
  let _0xf16a47 = false;
  let _0x3de20e = false;
  let _0x1a50ff = false;
  let _0xea6874 = 0;
  let _0x4c4827 = {
    ...createEmptyStats(),
    cacheLimit: _0x9ca8f4
  };
  let _0x3cd162 = null;
  let _0x1360b3 = null;
  let _0x50afd8 = 0;
  function _0x1b47f6(_0x3635e6) {
    let _0x544371 = 0;
    let _0x4c59f2 = 0;
    let _0x181c2a = 0;
    let _0x180782 = 0;
    for (const _0x185e64 of _0x45813a.values()) {
      if (_0x185e64.status === "pending") {
        _0x544371 += 1;
      } else if (_0x185e64.status === "ready") {
        _0x4c59f2 += 1;
      } else if (_0x185e64.status === "loaded") {
        _0x181c2a += 1;
      } else if (_0x185e64.status === "error") {
        _0x180782 += 1;
      }
    }
    _0x4c4827 = {
      ..._0x3635e6,
      cachedImageCount: _0x45813a.size,
      mediaSourceCount: _0x45813a.size,
      pendingImageCount: _0x544371,
      readyImageCount: _0x4c59f2,
      loadedImageCount: _0x181c2a,
      errorImageCount: _0x180782,
      cacheLimit: _0x9ca8f4
    };
    if (_0x2c79c9) {
      _0x2c79c9.__aicanvasRasterPreviewStats = _0x4c4827;
      const _0x8ef0f = new Set(_0x4c4827.drawnMediaNodeIds || []);
      _0x2c79c9.__aicanvasRasterPreviewRevealItems = (_0x3cd162?.items || []).filter(_0x3c8c4a => _0x3c8c4a.kind === "image" && _0x3c8c4a.sources.length > 0).map(_0x4dd4e9 => {
        const _0x301635 = _0x1a5916(_0x4dd4e9);
        const _0x2fd80a = _0x301635.find(_0x1b5afe => _0x45813a.get(_0x1b5afe)?.status === "loaded");
        return {
          height: _0x4dd4e9.height,
          kind: _0x4dd4e9.kind,
          nodeId: _0x4dd4e9.id,
          ready: _0x8ef0f.has(_0x4dd4e9.id),
          source: _0x2fd80a || _0x301635[0] || _0x4dd4e9.sources[0] || "",
          width: _0x4dd4e9.width,
          x: _0x4dd4e9.x,
          y: _0x4dd4e9.y
        };
      }).filter(_0x65a0d4 => _0x65a0d4.source);
    }
    return _0x4c4827;
  }
  function _0x5e83b0() {
    for (const _0x323239 of _0x45813a.values()) {
      if (_0x323239.status === "ready") {
        return true;
      }
    }
    return false;
  }
  function _0x5aa5aa() {
    let _0x3cc123 = 0;
    for (const _0x57c673 of _0x45813a.values()) {
      if (_0x57c673.status === "pending") {
        _0x3cc123 += 1;
      }
    }
    return _0x3cc123;
  }
  function _0x26dc21(_0x43b524 = _0x2bb039) {
    const _0x1e9fae = [];
    for (const _0x1a63ec of _0x45813a.values()) {
      if (_0x1a63ec.status !== "ready") {
        continue;
      }
      _0x1a63ec.status = "loaded";
      _0x1e9fae.push(_0x1a63ec.source);
      if (_0x1e9fae.length >= _0x43b524) {
        break;
      }
    }
    return _0x1e9fae;
  }
  function _0x411ec0() {
    _0x50afd8 += 1;
    if (_0x1360b3 != null) {
      cancelFrame(_0x1360b3);
    }
    _0x1360b3 = null;
  }
  function _0x727abf() {
    if (_0x1a50ff || !_0x3cd162 || _0x3cd162.viewportBusy || _0x1360b3 != null) {
      return;
    }
    const _0x15c2f0 = ++_0x50afd8;
    let _0x2d3f3c = false;
    const _0x38e89b = requestFrame(() => {
      _0x2d3f3c = true;
      if (_0x15c2f0 !== _0x50afd8 || _0x1a50ff) {
        return;
      }
      _0x1360b3 = null;
      _0x15ba7b();
    });
    if (!_0x2d3f3c) {
      _0x1360b3 = _0x38e89b;
    }
  }
  function _0x2129bc(_0x5c2682) {
    if (!_0x5c2682 || _0x5c2682.listenersRemoved) {
      return;
    }
    _0x5c2682.listenersRemoved = true;
    const {
      image: _0x585fd5,
      onLoad: _0xb943d6,
      onError: _0x2375ae
    } = _0x5c2682;
    if (typeof _0x585fd5?.removeEventListener === "function") {
      _0x585fd5.removeEventListener("load", _0xb943d6);
      _0x585fd5.removeEventListener("error", _0x2375ae);
    } else if (_0x585fd5) {
      if (_0x585fd5.onload === _0xb943d6) {
        _0x585fd5.onload = null;
      }
      if (_0x585fd5.onerror === _0x2375ae) {
        _0x585fd5.onerror = null;
      }
    }
  }
  function _0x34b509(_0x21d173) {
    if (!_0x21d173) {
      return;
    }
    _0x2129bc(_0x21d173);
    try {
      if (_0x21d173.ownsImage === true && _0x21d173.image) {
        _0x21d173.image.src = "";
      }
    } catch {}
  }
  function _0x3c5daa(_0x1ffb8d) {
    const _0x3eb102 = _0x45813a.get(_0x1ffb8d);
    if (!_0x3eb102) {
      return false;
    }
    _0x45813a.delete(_0x1ffb8d);
    _0x34b509(_0x3eb102);
    return true;
  }
  function _0x4adc58(_0x54eb7e) {
    if (!_0x54eb7e || _0x45813a.get(_0x54eb7e.source) !== _0x54eb7e) {
      return;
    }
    _0x45813a.delete(_0x54eb7e.source);
    _0x45813a.set(_0x54eb7e.source, _0x54eb7e);
  }
  function _0x4bd8f9(_0x136662 = null) {
    for (const [_0x2a6ce2] of _0x45813a) {
      if (_0x136662 instanceof Set ? _0x136662.has(_0x2a6ce2) : _0x2a6ce2 === _0x136662) {
        continue;
      }
      return _0x3c5daa(_0x2a6ce2);
    }
    return false;
  }
  function _0x1ade1e(_0x43f7fe, _0x2c7623 = null) {
    if (!_0x43f7fe || _0x9ca8f4 <= 0) {
      return null;
    }
    while (_0x45813a.size >= _0x9ca8f4) {
      if (!_0x4bd8f9(_0x2c7623 || _0x43f7fe)) {
        return null;
      }
    }
    const _0x225796 = typeof createImage === "function" ? createImage() : null;
    const _0x381c80 = {
      image: _0x225796,
      ownsImage: !!_0x225796,
      listenersRemoved: false,
      onError: null,
      onLoad: null,
      source: _0x43f7fe,
      status: "pending"
    };
    _0x45813a.set(_0x43f7fe, _0x381c80);
    if (!_0x225796) {
      preloadCanvasImage(_0x43f7fe, {
        decode: true,
        requireImage: true,
        priority: 5,
        fetchPriority: "auto",
        scope: "renderer-raster-preview",
        deferWhenPaused: true
      }).then(_0x22865a => {
        if (_0x45813a.get(_0x43f7fe) !== _0x381c80 || _0x381c80.status !== "pending") {
          return;
        }
        if (!_0x22865a?.image) {
          _0x381c80.status = "error";
          _0x727abf();
          return;
        }
        _0x381c80.image = _0x22865a.image;
        _0x381c80.status = "ready";
        _0x4adc58(_0x381c80);
        _0x727abf();
      }, () => {
        if (_0x45813a.get(_0x43f7fe) !== _0x381c80) {
          return;
        }
        _0x381c80.status = "error";
        _0x727abf();
      });
      return _0x381c80;
    }
    _0x381c80.onLoad = () => {
      if (_0x45813a.get(_0x43f7fe) !== _0x381c80) {
        return;
      }
      _0x2129bc(_0x381c80);
      const _0x4e7f3c = () => {
        if (_0x45813a.get(_0x43f7fe) !== _0x381c80 || _0x381c80.status !== "pending") {
          return;
        }
        _0x381c80.status = "ready";
        _0x4adc58(_0x381c80);
        _0x727abf();
      };
      try {
        const _0x25558a = typeof _0x225796.decode === "function" ? _0x225796.decode() : null;
        if (_0x25558a && typeof _0x25558a.then === "function") {
          Promise.resolve(_0x25558a).then(_0x4e7f3c, _0x4e7f3c);
        } else {
          _0x4e7f3c();
        }
      } catch {
        _0x4e7f3c();
      }
    };
    _0x381c80.onError = () => {
      if (_0x45813a.get(_0x43f7fe) !== _0x381c80) {
        return;
      }
      _0x381c80.status = "error";
      _0x2129bc(_0x381c80);
      _0x727abf();
    };
    if (typeof _0x225796.addEventListener === "function") {
      _0x225796.addEventListener("load", _0x381c80.onLoad);
      _0x225796.addEventListener("error", _0x381c80.onError);
    } else {
      _0x225796.onload = _0x381c80.onLoad;
      _0x225796.onerror = _0x381c80.onError;
    }
    try {
      _0x225796.decoding = "async";
      _0x225796.src = _0x43f7fe;
    } catch {
      _0x381c80.status = "error";
      _0x2129bc(_0x381c80);
    }
    return _0x381c80;
  }
  function _0x293f0c(_0x164d5b) {
    if (_0x1a50ff || !_0x164d5b || typeof documentRef?.createElement !== "function") {
      return false;
    }
    if (!_0x2c79c9) {
      _0x2c79c9 = documentRef.createElement("canvas");
      _0x2c79c9.className = "v2-raster-preview-canvas";
      _0x2c79c9.dataset.role = "raster-preview-canvas";
      _0x2c79c9.setAttribute?.("data-role", "raster-preview-canvas");
      _0x2c79c9.setAttribute?.("aria-hidden", "true");
      Object.assign(_0x2c79c9.style, {
        display: "none",
        height: "1px",
        left: "0px",
        top: "0px",
        width: "1px"
      });
    }
    if (_0x2c79c9.parentNode !== _0x164d5b) {
      _0x164d5b.appendChild?.(_0x2c79c9);
    }
    if (!_0xf16a47) {
      _0xf16a47 = true;
      _0x4316a4 = _0x2c79c9.getContext?.("2d", {
        alpha: true
      }) || null;
      _0x3de20e = Boolean(_0x4316a4 && typeof _0x4316a4.setTransform === "function" && typeof _0x4316a4.clearRect === "function" && typeof _0x4316a4.fillRect === "function" && typeof _0x4316a4.strokeRect === "function" && typeof _0x4316a4.drawImage === "function");
      if (!_0x3de20e) {
        _0x4316a4 = null;
        _0x2c79c9.style.display = "none";
      }
    }
    return _0x3de20e;
  }
  function _0x76ea9c(_0x4606c6, _0x37f02c, _0x44669c) {
    const _0x277ff3 = getCandidateIds(_0x4606c6, _0x37f02c);
    const _0x3e160a = normalizeIdSet(_0x44669c?.excludedNodeIds);
    const _0x2552d8 = String(_0x44669c?.sourceNodeId || "").trim();
    const _0x3191b0 = String(_0x44669c?.hoverNodeId || "").trim();
    if (_0x2552d8) {
      _0x3e160a.add(_0x2552d8);
    }
    if (_0x3191b0) {
      _0x3e160a.add(_0x3191b0);
    }
    const _0x298b8e = normalizeIdSet(_0x44669c?.invalidNodeIds);
    const _0x531c34 = typeof _0x44669c?.resolveMediaSources === "function" ? _0x44669c.resolveMediaSources : resolveMediaSources;
    const _0x5356bf = [];
    let _0x1a2293 = 0;
    for (const _0x31257e of _0x277ff3) {
      if (_0x3e160a.has(_0x31257e)) {
        _0x1a2293 += 1;
        continue;
      }
      const _0x43c80e = getNode(_0x4606c6, _0x31257e);
      if (!_0x43c80e || typeof _0x43c80e !== "object") {
        continue;
      }
      const _0x9b237e = Math.max(1, finiteNumber(_0x43c80e.width, DEFAULT_NODE_WIDTH));
      const _0x3f0e93 = Math.max(1, finiteNumber(_0x43c80e.height, DEFAULT_NODE_HEIGHT));
      const _0x3ebc06 = getNodeKind(_0x43c80e);
      if (_0x3ebc06 === "audio") {
        continue;
      }
      let _0x5855d5 = [];
      if (typeof _0x531c34 === "function") {
        try {
          _0x5855d5 = normalizeSources(_0x531c34(_0x43c80e, {
            nodeId: _0x31257e,
            options: _0x44669c
          }));
        } catch {
          _0x5855d5 = [];
        }
      }
      _0x5356bf.push({
        height: _0x3f0e93,
        id: _0x31257e,
        invalid: _0x298b8e.has(_0x31257e),
        kind: _0x3ebc06,
        label: getNodeLabel(_0x43c80e, _0x3ebc06),
        sources: _0x5855d5,
        width: _0x9b237e,
        x: finiteNumber(_0x43c80e.x, 0),
        y: finiteNumber(_0x43c80e.y, 0)
      });
    }
    const _0x4def81 = new Set();
    const _0x2f7f5c = _0x5356bf.reduce((_0x464a00, _0x37c556) => Math.max(_0x464a00, _0x37c556.sources.length), 0);
    for (let _0x313226 = 0; _0x313226 < _0x2f7f5c && _0x4def81.size < _0x9ca8f4; _0x313226 += 1) {
      for (const _0x3da585 of _0x5356bf) {
        const _0x2e825a = _0x3da585.sources[_0x313226];
        if (_0x2e825a) {
          _0x4def81.add(_0x2e825a);
        }
        if (_0x4def81.size >= _0x9ca8f4) {
          break;
        }
      }
    }
    return {
      admittedSources: _0x4def81,
      candidateCount: _0x277ff3.size,
      excludedNodeCount: _0x1a2293,
      items: _0x5356bf,
      options: _0x44669c,
      palette: resolvePalette(documentRef, _0x44669c?.palette),
      viewportBusy: resolveMediaLoadingBusy(_0x44669c),
      worldBounds: computeRasterWorldBounds(_0x5356bf, _0x44669c)
    };
  }
  function _0x392423(_0x3d6245, _0x31c93f) {
    const _0x47b278 = Math.max(0.1, finiteNumber(_0x31c93f?.dpr, finiteNumber(globalThis.devicePixelRatio, 1)));
    const _0x14adb8 = Math.max(0.0001, finiteNumber(_0x31c93f?.viewport?.zoom ?? _0x31c93f?.zoom, 1));
    const _0x12ff23 = Math.max(0.0001, finiteNumber(_0x31c93f?.renderScale, _0x14adb8 * _0x47b278));
    const _0x5ea270 = Math.max(0.1, finiteNumber(_0x31c93f?.maxDpr, maxDpr));
    const _0x5d5d6c = Math.min(_0x12ff23, _0x5ea270);
    const _0x260123 = positiveInteger(_0x31c93f?.maxCanvasDimension, positiveInteger(maxCanvasDimension, DEFAULT_MAX_CANVAS_DIMENSION));
    const _0x42d72f = positiveInteger(_0x31c93f?.maxBitmapPixels, positiveInteger(maxBitmapPixels, DEFAULT_MAX_BITMAP_PIXELS));
    let _0x3c66c7 = Math.max(0.0001, Math.min(_0x5d5d6c, _0x260123 / _0x3d6245.width, _0x260123 / _0x3d6245.height, Math.sqrt(_0x42d72f / (_0x3d6245.width * _0x3d6245.height))));
    let _0x4adb4e = Math.max(1, Math.min(_0x260123, Math.floor(_0x3d6245.width * _0x3c66c7)));
    let _0x535907 = Math.max(1, Math.min(_0x260123, Math.floor(_0x3d6245.height * _0x3c66c7)));
    if (_0x4adb4e * _0x535907 > _0x42d72f) {
      const _0x145907 = Math.sqrt(_0x42d72f / (_0x4adb4e * _0x535907));
      _0x4adb4e = Math.max(1, Math.floor(_0x4adb4e * _0x145907));
      _0x535907 = Math.max(1, Math.floor(_0x535907 * _0x145907));
    }
    _0x3c66c7 = Math.min(_0x3c66c7, _0x4adb4e / _0x3d6245.width, _0x535907 / _0x3d6245.height);
    if (_0x2c79c9.width !== _0x4adb4e) {
      _0x2c79c9.width = _0x4adb4e;
    }
    if (_0x2c79c9.height !== _0x535907) {
      _0x2c79c9.height = _0x535907;
    }
    Object.assign(_0x2c79c9.style, {
      display: "block",
      height: formatCssNumber(_0x3d6245.height) + "px",
      left: formatCssNumber(_0x3d6245.left) + "px",
      top: formatCssNumber(_0x3d6245.top) + "px",
      width: formatCssNumber(_0x3d6245.width) + "px"
    });
    _0x4316a4.setTransform(1, 0, 0, 1, 0, 0);
    _0x4316a4.clearRect(0, 0, _0x4adb4e, _0x535907);
    _0x4316a4.setTransform(_0x3c66c7, 0, 0, _0x3c66c7, _0x3d6245.left === 0 ? 0 : -_0x3d6245.left * _0x3c66c7, _0x3d6245.top === 0 ? 0 : -_0x3d6245.top * _0x3c66c7);
    _0x4316a4.imageSmoothingEnabled = true;
    _0x4316a4.imageSmoothingQuality = "low";
    return {
      bitmapHeight: _0x535907,
      bitmapWidth: _0x4adb4e,
      dpr: _0x47b278,
      effectiveScale: _0x3c66c7,
      rasterScale: _0x3c66c7,
      renderScale: _0x12ff23
    };
  }
  function _0x1a5916(_0xb30575) {
    const _0x4f04be = _0x3cd162?.admittedSources;
    return _0xb30575.sources.filter(_0x461d04 => _0x4f04be?.has(_0x461d04));
  }
  function _0x1258e0(_0x3b823, _0x48209d) {
    const _0x12de7b = _0x1a5916(_0x3b823);
    for (const _0x4c21e5 of _0x12de7b) {
      const _0x53a11e = _0x45813a.get(_0x4c21e5);
      if (_0x53a11e?.status !== "loaded") {
        continue;
      }
      _0x4adc58(_0x53a11e);
      _0x48209d.cacheHitCount += 1;
      if (drawImageCover(_0x4316a4, _0x53a11e.image, _0x3b823)) {
        return true;
      }
    }
    return false;
  }
  function _0x4542a4(_0x2ea547, _0x28d3c8) {
    const _0x3f804e = _0x3cd162?.admittedSources;
    const _0x3d863c = _0x1a5916(_0x2ea547);
    for (const _0x2831e2 of _0x3d863c) {
      const _0x16b780 = _0x45813a.get(_0x2831e2);
      if (_0x16b780?.status === "pending" || _0x16b780?.status === "ready" || _0x16b780?.status === "loaded") {
        return false;
      }
      if (_0x16b780?.status === "error") {
        continue;
      }
      if (isCanvasImageDisplayLoadPending(_0x2831e2)) {
        return false;
      }
      _0x28d3c8.cacheMissCount += 1;
      if (_0x28d3c8.viewportBusy) {
        _0x28d3c8.skippedBusyImageCount += 1;
        return false;
      }
      if (_0x28d3c8.newImageStartsRemaining <= 0) {
        return false;
      }
      _0x28d3c8.newImageStartsRemaining -= 1;
      const _0x311c5c = _0x1ade1e(_0x2831e2, _0x3f804e);
      if (_0x311c5c) {
        _0x28d3c8.startedImageCount += 1;
      }
      return false;
    }
    return false;
  }
  function _0x49a4ef(_0x13397f, _0x34cbaa) {
    if (_0x13397f.sources.length === 0) {
      return false;
    }
    if (_0x1258e0(_0x13397f, _0x34cbaa)) {
      return true;
    }
    _0x4542a4(_0x13397f, _0x34cbaa);
    return false;
  }
  function _0x362db5(_0x15bd5d, _0x12bb7c, _0x3dd528, _0x40a230) {
    const _0x2099a4 = _0x15bd5d.invalid ? 0.38 : 1;
    const _0x46708a = _0x15bd5d.kind === "image" || _0x15bd5d.kind === "video";
    _0x4316a4.globalAlpha = _0x2099a4;
    if (!_0x46708a) {
      _0x4316a4.fillStyle = _0x12bb7c.nodeFill;
      _0x4316a4.fillRect(_0x15bd5d.x, _0x15bd5d.y, _0x15bd5d.width, _0x15bd5d.height);
    }
    const _0x26a6cd = _0x49a4ef(_0x15bd5d, _0x40a230);
    if (!_0x26a6cd) {
      if (_0x46708a) {
        _0x4316a4.globalAlpha = 1;
        return false;
      }
      drawPlaceholder(_0x4316a4, _0x15bd5d, _0x12bb7c, _0x3dd528, _0x2099a4);
    }
    _0x4316a4.globalAlpha = _0x2099a4;
    _0x4316a4.strokeStyle = _0x12bb7c.nodeStroke;
    _0x4316a4.lineWidth = Math.max(1 / _0x3dd528, 0.5);
    _0x4316a4.strokeRect(_0x15bd5d.x, _0x15bd5d.y, _0x15bd5d.width, _0x15bd5d.height);
    drawNodeLabel(_0x4316a4, _0x15bd5d, _0x12bb7c, _0x3dd528, _0x2099a4);
    return _0x26a6cd;
  }
  function _0xaf8230(_0x3b7506, _0x3ce1cc) {
    const _0xfea4c0 = Number(_0x3ce1cc?.maxNewImagesPerSync);
    const _0x12e7d2 = Number.isFinite(_0xfea4c0) && _0xfea4c0 >= 0;
    if (_0x12e7d2) {
      return Math.max(0, Math.trunc(_0xfea4c0));
    } else if (_0x3b7506.length >= DENSE_READY_REVEAL_NODE_COUNT) {
      return _0x28f222;
    } else {
      return _0xe63b42;
    }
  }
  function _0x549e5a(_0x516de6, _0x36cffa) {
    const _0x37df34 = _0x5aa5aa();
    return {
      cacheHitCount: 0,
      cacheMissCount: 0,
      newImageStartsRemaining: _0x36cffa ? 0 : Math.min(_0x516de6, Math.max(0, _0x516de6 - _0x37df34)),
      skippedBusyImageCount: 0,
      startedImageCount: 0,
      viewportBusy: _0x36cffa
    };
  }
  function _0x15ba7b() {
    if (_0x1a50ff || !_0x3cd162 || _0x3cd162.viewportBusy || !_0x3de20e || !_0x2c79c9 || !_0x4316a4) {
      return _0x4c4827;
    }
    const {
      items: _0x221bb1,
      options: _0x20fc99,
      palette: _0x3ae96e,
      worldBounds: _0x173604
    } = _0x3cd162;
    if (!_0x173604 || _0x221bb1.length === 0 || _0x4c4827.active !== true) {
      return _0xb35e2c();
    }
    _0xea6874 += 1;
    const _0x2bf1a5 = _0x221bb1.length >= DENSE_READY_REVEAL_NODE_COUNT ? _0x4c9245 : _0x2bb039;
    const _0x3f25f3 = new Set(_0x26dc21(_0x2bf1a5));
    const _0x45e9c6 = Math.max(0.0001, finiteNumber(_0x4c4827.rasterScale, 1));
    const _0x15058f = new Set(_0x4c4827.drawnMediaNodeIds || []);
    const _0x13ee4b = [];
    const _0x128528 = _0x549e5a(0, false);
    if (_0x3f25f3.size > 0) {
      for (const _0x509753 of _0x221bb1) {
        if (_0x15058f.has(_0x509753.id) || !_0x509753.sources.some(_0x1c4760 => _0x3f25f3.has(_0x1c4760))) {
          continue;
        }
        if (_0x362db5(_0x509753, _0x3ae96e, _0x45e9c6, _0x128528)) {
          _0x15058f.add(_0x509753.id);
          _0x13ee4b.push(_0x509753.id);
        }
      }
    }
    const _0x52f31e = _0xaf8230(_0x221bb1, _0x20fc99);
    _0x128528.newImageStartsRemaining = Math.min(_0x52f31e, Math.max(0, _0x52f31e - _0x5aa5aa()));
    for (const _0x48b435 of _0x221bb1) {
      if (_0x15058f.has(_0x48b435.id)) {
        continue;
      }
      _0x4542a4(_0x48b435, _0x128528);
      if (_0x128528.newImageStartsRemaining <= 0) {
        break;
      }
    }
    const _0x41de4e = _0x1b47f6({
      ..._0x4c4827,
      drawnMediaNodeIds: [..._0x15058f],
      mediaDrawCount: _0x15058f.size,
      placeholderCount: _0x221bb1.reduce((_0x5e935c, _0x35962d) => _0x5e935c + Number(_0x35962d.kind !== "image" && _0x35962d.kind !== "video" && !_0x15058f.has(_0x35962d.id)), 0),
      revision: _0xea6874,
      cacheHitCount: _0x128528.cacheHitCount,
      cacheMissCount: _0x128528.cacheMissCount,
      skippedBusyImageCount: _0x128528.skippedBusyImageCount,
      startedImageCount: _0x128528.startedImageCount,
      revealedImageCount: _0x3f25f3.size
    });
    if (_0x13ee4b.length > 0 && typeof onMediaPresented === "function") {
      try {
        onMediaPresented({
          nodeIds: _0x13ee4b,
          revision: _0xea6874
        });
      } catch {}
    }
    if (_0x5e83b0()) {
      _0x727abf();
    }
    return _0x41de4e;
  }
  function _0xb35e2c() {
    if (_0x1a50ff || !_0x3cd162 || !_0x3de20e || !_0x2c79c9 || !_0x4316a4) {
      return _0x4c4827;
    }
    _0xea6874 += 1;
    const {
      items: _0x335855,
      options: _0x1a94bc,
      palette: _0x278e49,
      worldBounds: _0x4df99d
    } = _0x3cd162;
    const _0x2398ae = _0x335855.length >= DENSE_READY_REVEAL_NODE_COUNT ? _0x4c9245 : _0x2bb039;
    const _0x577c8b = _0x3cd162.viewportBusy ? 0 : _0x26dc21(_0x2398ae).length;
    if (!_0x4df99d || _0x335855.length === 0) {
      _0x2c79c9.style.display = "none";
      _0x2c79c9.width = 1;
      _0x2c79c9.height = 1;
      return _0x1b47f6({
        ...createEmptyStats(_0xea6874, true),
        candidateCount: _0x3cd162.candidateCount,
        excludedNodeCount: _0x3cd162.excludedNodeCount
      });
    }
    const _0x4f39e4 = _0x392423(_0x4df99d, _0x1a94bc);
    const _0x403402 = _0xaf8230(_0x335855, _0x1a94bc);
    const _0x2d2630 = _0x549e5a(_0x403402, _0x3cd162.viewportBusy);
    const _0x59b4c2 = [];
    const _0x776bc = [];
    let _0x2093e3 = 0;
    _0x4316a4.lineWidth = Math.max(1 / _0x4f39e4.rasterScale, 0.5);
    for (const _0x4ea7f9 of _0x335855) {
      const _0x1fc26f = _0x362db5(_0x4ea7f9, _0x278e49, _0x4f39e4.rasterScale, _0x2d2630);
      if (_0x1fc26f) {
        _0x776bc.push(_0x4ea7f9.id);
      } else if (_0x4ea7f9.kind !== "image" && _0x4ea7f9.kind !== "video") {
        _0x2093e3 += 1;
      }
      _0x59b4c2.push(_0x4ea7f9.id);
    }
    const _0x1316dd = _0x1b47f6({
      active: _0x59b4c2.length > 0,
      supported: true,
      drawnNodeIds: _0x59b4c2,
      drawnMediaNodeIds: _0x776bc,
      drawnNodeCount: _0x59b4c2.length,
      mediaDrawCount: _0x776bc.length,
      placeholderCount: _0x2093e3,
      candidateCount: _0x3cd162.candidateCount,
      excludedNodeCount: _0x3cd162.excludedNodeCount,
      bitmapWidth: _0x4f39e4.bitmapWidth,
      bitmapHeight: _0x4f39e4.bitmapHeight,
      cssWidth: _0x4df99d.width,
      cssHeight: _0x4df99d.height,
      dpr: _0x4f39e4.dpr,
      renderScale: _0x4f39e4.renderScale,
      effectiveScale: _0x4f39e4.effectiveScale,
      rasterScale: _0x4f39e4.rasterScale,
      revision: _0xea6874,
      worldBounds: {
        ..._0x4df99d
      },
      cacheHitCount: _0x2d2630.cacheHitCount,
      cacheMissCount: _0x2d2630.cacheMissCount,
      skippedBusyImageCount: _0x2d2630.skippedBusyImageCount,
      startedImageCount: _0x2d2630.startedImageCount,
      revealedImageCount: _0x577c8b
    });
    if (!_0x3cd162.viewportBusy && _0x5e83b0()) {
      _0x727abf();
    }
    return _0x1316dd;
  }
  function _0x216ed5(_0x50316c, _0x2d73ab, _0xb8f944, _0x2ebc6a = {}) {
    const _0x369049 = _0x2ebc6a?.viewportBusy === true && _0x2ebc6a?.reuseWhileBusy === true && _0x2ebc6a?.forceRender !== true && _0x4c4827.active && (Number(_0xb8f944?.size) > 0 || Number(_0xb8f944?.length) > 0);
    if (_0x369049 && _0x293f0c(_0x50316c)) {
      const _0x5329b0 = resolveMediaLoadingBusy(_0x2ebc6a);
      if (_0x3cd162) {
        _0x3cd162.viewportBusy = _0x5329b0;
      }
      if (_0x5329b0) {
        _0x411ec0();
      } else if (_0x5e83b0()) {
        _0x727abf();
      }
      return _0x4c4827;
    }
    _0x411ec0();
    const _0x3ea618 = _0x76ea9c(_0x2d73ab, _0xb8f944, _0x2ebc6a);
    if (!_0x293f0c(_0x50316c)) {
      _0xea6874 += 1;
      _0x3cd162 = null;
      return _0x1b47f6({
        ...createEmptyStats(_0xea6874, false),
        candidateCount: _0x3ea618.candidateCount,
        excludedNodeCount: _0x3ea618.excludedNodeCount
      });
    }
    _0x3cd162 = _0x3ea618;
    return _0xb35e2c();
  }
  function _0x2c5404(_0x5e2910) {
    const _0x1ff79d = String(_0x5e2910 || "").trim();
    if (!_0x1ff79d || !_0x3cd162) {
      return false;
    }
    const _0x232550 = _0x3cd162.items || [];
    const _0x1e3e1b = _0x232550.filter(_0x2dd903 => _0x2dd903.id !== _0x1ff79d);
    if (_0x1e3e1b.length === _0x232550.length) {
      return false;
    }
    _0x411ec0();
    _0x3cd162 = {
      ..._0x3cd162,
      excludedNodeCount: Number(_0x3cd162.excludedNodeCount || 0) + 1,
      items: _0x1e3e1b,
      worldBounds: computeRasterWorldBounds(_0x1e3e1b, _0x3cd162.options)
    };
    _0xb35e2c();
    return true;
  }
  function _0x469170(_0x112afd) {
    if (_0x1a50ff || !_0x3cd162) {
      return _0x4c4827;
    }
    const _0x95de5a = _0x3cd162.viewportBusy;
    _0x3cd162.viewportBusy = _0x112afd === true;
    if (_0x3cd162.viewportBusy) {
      _0x411ec0();
    } else if (_0x95de5a && _0x5e83b0()) {
      _0x15ba7b();
    } else {
      _0x727abf();
    }
    return _0x1b47f6(_0x4c4827);
  }
  function _0x5b263c(_0x4769ae = {}) {
    if (_0x1a50ff) {
      return _0x4c4827;
    }
    let _0x3e1e39 = null;
    let _0x501977 = _0x9ca8f4;
    if (_0x4769ae && typeof _0x4769ae[Symbol.iterator] === "function") {
      _0x3e1e39 = normalizeIdSet(_0x4769ae);
    } else if (_0x4769ae && typeof _0x4769ae === "object") {
      if (Object.prototype.hasOwnProperty.call(_0x4769ae, "keepSources")) {
        _0x3e1e39 = normalizeIdSet(_0x4769ae.keepSources);
      }
      _0x501977 = Math.max(0, Math.trunc(finiteNumber(_0x4769ae.maxEntries, _0x9ca8f4)));
    }
    let _0x4bb452 = false;
    for (const [_0x108e74, _0x3f87e0] of Array.from(_0x45813a.entries())) {
      if (_0x3e1e39 && !_0x3e1e39.has(_0x108e74) || !_0x3e1e39 && _0x3f87e0.status === "error") {
        _0x4bb452 = _0x3c5daa(_0x108e74) || _0x4bb452;
      }
    }
    while (_0x45813a.size > _0x501977) {
      const _0x383f85 = _0x4bd8f9();
      if (!_0x383f85) {
        break;
      }
      _0x4bb452 = true;
    }
    if (_0x4bb452 && _0x3cd162 && _0x3de20e) {
      const _0x5c8cc0 = _0x3cd162.viewportBusy;
      _0x3cd162.viewportBusy = true;
      const _0xc1bc63 = _0xb35e2c();
      _0x3cd162.viewportBusy = _0x5c8cc0;
      return _0xc1bc63;
    }
    return _0x1b47f6(_0x4c4827);
  }
  function _0xcfbb14() {
    if (_0x1a50ff) {
      return;
    }
    _0x1a50ff = true;
    _0x411ec0();
    _0x3cd162 = null;
    for (const _0x54e9e7 of _0x45813a.values()) {
      _0x34b509(_0x54e9e7);
    }
    _0x45813a.clear();
    _0xea6874 += 1;
    const _0x315e40 = _0x2c79c9;
    _0x4c4827 = {
      ...createEmptyStats(_0xea6874, _0x3de20e),
      cacheLimit: _0x9ca8f4
    };
    if (_0x315e40) {
      _0x315e40.__aicanvasRasterPreviewStats = _0x4c4827;
      _0x315e40.__aicanvasRasterPreviewRevealItems = [];
      _0x315e40.width = 1;
      _0x315e40.height = 1;
      _0x315e40.style.display = "none";
      _0x315e40.remove?.();
    }
    _0x2c79c9 = null;
    _0x4316a4 = null;
  }
  function _0x472841() {
    return _0x4c4827;
  }
  return {
    sync: _0x216ed5,
    excludeNode: _0x2c5404,
    setMediaLoadingBusy: _0x469170,
    prune: _0x5b263c,
    destroy: _0xcfbb14,
    getStats: _0x472841
  };
}