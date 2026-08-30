import { desktopBridge } from "../services/desktopBridge.js";
const SNAPSHOT_SCHEMA_VERSION = 1;
const SNAPSHOT_MAX_WIDTH = 1600;
const SNAPSHOT_MAX_HEIGHT = 1000;
const SNAPSHOT_MIN_NODE_COUNT = 8;
const SNAPSHOT_JPEG_QUALITY = 0.68;
const SNAPSHOT_MIN_HOLD_MS = 900;
const SNAPSHOT_MAX_HOLD_MS = 2800;
const SNAPSHOT_READY_POLL_MS = 450;
const SNAPSHOT_NODE_READY_RATIO = 0.95;
const SNAPSHOT_MEDIA_READY_RATIO = 0.94;
const SNAPSHOT_MEDIA_READY_TARGET = 36;
let overlayEl = null;
let overlayHideTimer = null;
let overlayPollTimer = null;
function getDocument() {
  if (typeof document !== "undefined") {
    return document;
  } else {
    return null;
  }
}
function getWindow() {
  if (typeof window !== "undefined") {
    return window;
  } else {
    return globalThis;
  }
}
function normalizeNodes(_0x2c0adf) {
  if (Array.isArray(_0x2c0adf)) {
    return _0x2c0adf;
  }
  if (_0x2c0adf && typeof _0x2c0adf === "object") {
    return Object.values(_0x2c0adf);
  }
  return [];
}
function normalizeEdges(_0x3db113) {
  if (Array.isArray(_0x3db113)) {
    return _0x3db113;
  }
  if (_0x3db113 && typeof _0x3db113 === "object") {
    return Object.values(_0x3db113);
  }
  return [];
}
function normalizeViewport(_0x5ebec6) {
  return {
    x: Number.isFinite(Number(_0x5ebec6?.x)) ? Number(_0x5ebec6.x) : 0,
    y: Number.isFinite(Number(_0x5ebec6?.y)) ? Number(_0x5ebec6.y) : 0,
    zoom: Number.isFinite(Number(_0x5ebec6?.zoom)) && Number(_0x5ebec6.zoom) > 0 ? Number(_0x5ebec6.zoom) : 1
  };
}
function getElementSize(_0x55f5bb, _0x2007f6 = 1600, _0x4929c1 = 900) {
  return {
    width: Math.max(1, Math.round(Number(_0x55f5bb?.clientWidth) || _0x2007f6)),
    height: Math.max(1, Math.round(Number(_0x55f5bb?.clientHeight) || _0x4929c1))
  };
}
function getElementViewportRect(_0x31b243) {
  const _0x3a1c04 = _0x31b243?.getBoundingClientRect?.();
  if (!_0x3a1c04) {
    return null;
  }
  const _0x3ca538 = Math.max(1, Math.round(Number(_0x3a1c04.width) || 1));
  const _0x239d0c = Math.max(1, Math.round(Number(_0x3a1c04.height) || 1));
  return {
    x: Math.max(0, Math.round(Number(_0x3a1c04.left) || 0)),
    y: Math.max(0, Math.round(Number(_0x3a1c04.top) || 0)),
    width: _0x3ca538,
    height: _0x239d0c
  };
}
function isNodeVisible(_0x3a4192, _0x15d01e, _0x4e0c76, _0x5b73bc) {
  if (!_0x3a4192?.id) {
    return false;
  }
  const _0x521989 = _0x15d01e.zoom || 1;
  const _0x1e3fa1 = (Number(_0x3a4192.x) || 0) * _0x521989 + _0x15d01e.x;
  const _0x2ceb84 = (Number(_0x3a4192.y) || 0) * _0x521989 + _0x15d01e.y;
  const _0x30c8e5 = Math.max(1, Number(_0x3a4192.width) || 160) * _0x521989;
  const _0xfff6cf = Math.max(1, Number(_0x3a4192.height) || 120) * _0x521989;
  return _0x1e3fa1 + _0x30c8e5 > 0 && _0x2ceb84 + _0xfff6cf > 0 && _0x1e3fa1 < _0x4e0c76 && _0x2ceb84 < _0x5b73bc;
}
function toScreenRect(_0x14e51f, _0x53c903, _0x35bfe1) {
  const _0x19e533 = _0x53c903.zoom || 1;
  return {
    x: ((Number(_0x14e51f.x) || 0) * _0x19e533 + _0x53c903.x) * _0x35bfe1,
    y: ((Number(_0x14e51f.y) || 0) * _0x19e533 + _0x53c903.y) * _0x35bfe1,
    width: Math.max(1, Number(_0x14e51f.width) || 160) * _0x19e533 * _0x35bfe1,
    height: Math.max(1, Number(_0x14e51f.height) || 120) * _0x19e533 * _0x35bfe1
  };
}
function getCssColor(_0x23a9f2, _0x568617) {
  const _0x18d846 = getDocument();
  const _0xdc1fdb = getWindow();
  const _0x4cc279 = _0x18d846?.documentElement || _0x18d846?.body;
  try {
    const _0x4401d4 = _0xdc1fdb.getComputedStyle?.(_0x4cc279)?.getPropertyValue?.(_0x23a9f2);
    return String(_0x4401d4 || "").trim() || _0x568617;
  } catch {
    return _0x568617;
  }
}
function roundRect(_0x5cba69, _0x307896, _0x5eadaf, _0x233aa4, _0x21a316, _0xa204e5) {
  const _0x5d9719 = Math.max(0, Math.min(_0xa204e5, _0x233aa4 / 2, _0x21a316 / 2));
  if (typeof _0x5cba69.roundRect === "function") {
    _0x5cba69.beginPath();
    _0x5cba69.roundRect(_0x307896, _0x5eadaf, _0x233aa4, _0x21a316, _0x5d9719);
    return;
  }
  _0x5cba69.beginPath();
  _0x5cba69.moveTo(_0x307896 + _0x5d9719, _0x5eadaf);
  _0x5cba69.lineTo(_0x307896 + _0x233aa4 - _0x5d9719, _0x5eadaf);
  _0x5cba69.quadraticCurveTo(_0x307896 + _0x233aa4, _0x5eadaf, _0x307896 + _0x233aa4, _0x5eadaf + _0x5d9719);
  _0x5cba69.lineTo(_0x307896 + _0x233aa4, _0x5eadaf + _0x21a316 - _0x5d9719);
  _0x5cba69.quadraticCurveTo(_0x307896 + _0x233aa4, _0x5eadaf + _0x21a316, _0x307896 + _0x233aa4 - _0x5d9719, _0x5eadaf + _0x21a316);
  _0x5cba69.lineTo(_0x307896 + _0x5d9719, _0x5eadaf + _0x21a316);
  _0x5cba69.quadraticCurveTo(_0x307896, _0x5eadaf + _0x21a316, _0x307896, _0x5eadaf + _0x21a316 - _0x5d9719);
  _0x5cba69.lineTo(_0x307896, _0x5eadaf + _0x5d9719);
  _0x5cba69.quadraticCurveTo(_0x307896, _0x5eadaf, _0x307896 + _0x5d9719, _0x5eadaf);
}
function findLoadedMediaElement(_0x35b976) {
  const _0x3d323b = getDocument();
  if (!_0x3d323b || !_0x35b976) {
    return null;
  }
  const _0x2af432 = _0x3d323b.querySelectorAll?.("#v2-canvas .v2-fast-preview-node") || [];
  for (const _0x4db68b of _0x2af432) {
    if (String(_0x4db68b?.dataset?.nodeId || "") !== String(_0x35b976)) {
      continue;
    }
    const _0x19b8ca = _0x4db68b.querySelector?.("img");
    if (isMediaElementReady(_0x19b8ca)) {
      return _0x19b8ca;
    }
  }
  const _0x12029e = _0x3d323b.getElementById?.(_0x35b976);
  const _0x30073d = [".node-img", ".source-video-poster-frame", ".v2-fast-preview-media", "img", "video"];
  for (const _0x28d76d of _0x30073d) {
    const _0x2a7886 = _0x12029e?.querySelector?.(_0x28d76d);
    if (!_0x2a7886) {
      continue;
    }
    if (_0x2a7886.tagName === "VIDEO") {
      if (_0x2a7886.readyState >= 2 && Number(_0x2a7886.videoWidth) > 0) {
        return _0x2a7886;
      }
      continue;
    }
    if (_0x2a7886.complete !== false && Number(_0x2a7886.naturalWidth || _0x2a7886.width || 0) > 0) {
      return _0x2a7886;
    }
  }
  return null;
}
function toRasterPreviewIdSet(_0xc997a2) {
  if (_0xc997a2 instanceof Set) {
    return new Set(_0xc997a2);
  }
  if (Array.isArray(_0xc997a2)) {
    return new Set(_0xc997a2.map(_0x463b66 => String(_0x463b66 || "")));
  }
  if (typeof _0xc997a2 === "string" && _0xc997a2.trim()) {
    try {
      return toRasterPreviewIdSet(JSON.parse(_0xc997a2));
    } catch {
      return new Set(_0xc997a2.split(",").map(_0x5a0a40 => _0x5a0a40.trim()).filter(Boolean));
    }
  }
  return new Set();
}
function readRasterPreviewSurface(_0x2049a9 = null) {
  const _0x21f51b = getDocument();
  const _0x1275b3 = _0x2049a9?.querySelector?.("canvas[data-role='raster-preview-canvas']") || _0x21f51b?.querySelector?.("#v2-canvas canvas[data-role='raster-preview-canvas']") || null;
  if (!_0x1275b3) {
    return null;
  }
  const _0x36b7e5 = _0x1275b3.__aicanvasRasterPreviewStats || _0x1275b3.dataset || {};
  const _0x53e2e6 = _0x36b7e5.worldBounds || {
    left: Number.parseFloat(_0x1275b3.style?.left || "0"),
    top: Number.parseFloat(_0x1275b3.style?.top || "0"),
    width: Number.parseFloat(_0x1275b3.style?.width || "0"),
    height: Number.parseFloat(_0x1275b3.style?.height || "0")
  };
  return {
    canvas: _0x1275b3,
    drawnNodeIds: toRasterPreviewIdSet(_0x36b7e5.drawnNodeIds ?? _0x1275b3.dataset?.drawnNodeIds),
    drawnMediaNodeIds: toRasterPreviewIdSet(_0x36b7e5.drawnMediaNodeIds ?? _0x1275b3.dataset?.drawnMediaNodeIds),
    worldBounds: _0x53e2e6
  };
}
function nodeHasMediaLikeContent(_0xc588ea) {
  if (!_0xc588ea || typeof _0xc588ea !== "object") {
    return false;
  }
  const _0x23b975 = String(_0xc588ea.type || "").toLowerCase();
  if (_0x23b975.includes("image") || _0x23b975.includes("video")) {
    return true;
  }
  const _0x298e05 = ["src", "imageUrl", "videoUrl", "localPath", "displayLocalPath", "thumbLocalPath", "thumbUrl", "posterUrl", "posterLocalPath", "capturePreviewUrl"];
  if (_0x298e05.some(_0x5e1bf0 => String(_0xc588ea[_0x5e1bf0] || "").trim())) {
    return true;
  }
  return Array.isArray(_0xc588ea.images) && _0xc588ea.images.length > 0 || Array.isArray(_0xc588ea.videos) && _0xc588ea.videos.length > 0;
}
function countReadyVisibleMediaNodes(_0x329221, _0x347be9 = null) {
  const _0x522bcd = readRasterPreviewSurface(_0x347be9);
  let _0x4d4b24 = 0;
  for (const _0x22303e of _0x329221 || []) {
    const _0x6db17c = String(_0x22303e?.id || "");
    if (_0x522bcd?.drawnNodeIds.has(_0x6db17c) && _0x522bcd.drawnMediaNodeIds.has(_0x6db17c)) {
      _0x4d4b24 += 1;
    } else if (findLoadedMediaElement(_0x6db17c)) {
      _0x4d4b24 += 1;
    }
  }
  return _0x4d4b24;
}
function countExpectedVisibleMediaNodes(_0x535544) {
  let _0x59962f = 0;
  for (const _0x4cdc6b of _0x535544 || []) {
    if (nodeHasMediaLikeContent(_0x4cdc6b)) {
      _0x59962f += 1;
    }
  }
  return _0x59962f;
}
function drawEdges(_0x450465, _0xeb5de7, _0x35d5eb, _0x49cb8c, _0x5c946f, _0x4b58a0) {
  _0x450465.save();
  _0x450465.strokeStyle = _0x4b58a0;
  _0x450465.lineWidth = Math.max(1, _0x5c946f * 1.2);
  _0x450465.globalAlpha = 0.45;
  for (const _0x24564d of _0xeb5de7) {
    const _0x2fdab8 = _0x35d5eb.get(_0x24564d?.sourceId);
    const _0x493126 = _0x35d5eb.get(_0x24564d?.targetId);
    if (!_0x2fdab8 || !_0x493126) {
      continue;
    }
    const _0xf409a4 = toScreenRect(_0x2fdab8, _0x49cb8c, _0x5c946f);
    const _0x55fc95 = toScreenRect(_0x493126, _0x49cb8c, _0x5c946f);
    const _0x18665f = _0xf409a4.x + _0xf409a4.width;
    const _0x44236d = _0xf409a4.y + _0xf409a4.height / 2;
    const _0x3f3182 = _0x55fc95.x;
    const _0x1bc93b = _0x55fc95.y + _0x55fc95.height / 2;
    const _0x2fd449 = Math.max(_0x5c946f * 80, Math.abs(_0x3f3182 - _0x18665f) * 0.42);
    _0x450465.beginPath();
    _0x450465.moveTo(_0x18665f, _0x44236d);
    _0x450465.bezierCurveTo(_0x18665f + _0x2fd449, _0x44236d, _0x3f3182 - _0x2fd449, _0x1bc93b, _0x3f3182, _0x1bc93b);
    _0x450465.stroke();
  }
  _0x450465.restore();
}
function drawNode(_0xced53d, _0x428810, _0x5698ef, _0x44a032, _0x216cea) {
  const _0x113b54 = toScreenRect(_0x428810, _0x5698ef, _0x44a032);
  if (_0x113b54.width <= 0 || _0x113b54.height <= 0) {
    return {
      drewMedia: false
    };
  }
  const _0x5457c9 = Math.max(4, Math.min(_0x44a032 * 12, _0x113b54.width / 4, _0x113b54.height / 4));
  _0xced53d.save();
  roundRect(_0xced53d, _0x113b54.x, _0x113b54.y, _0x113b54.width, _0x113b54.height, _0x5457c9);
  _0xced53d.fillStyle = _0x216cea.nodeFill;
  _0xced53d.fill();
  _0xced53d.strokeStyle = _0x216cea.nodeStroke;
  _0xced53d.lineWidth = Math.max(1, _0x44a032);
  _0xced53d.stroke();
  let _0x13bf1d = false;
  const _0x12e07b = findLoadedMediaElement(_0x428810.id);
  if (_0x12e07b) {
    try {
      _0xced53d.save();
      roundRect(_0xced53d, _0x113b54.x, _0x113b54.y, _0x113b54.width, _0x113b54.height, _0x5457c9);
      _0xced53d.clip();
      _0xced53d.drawImage(_0x12e07b, _0x113b54.x, _0x113b54.y, _0x113b54.width, _0x113b54.height);
      _0xced53d.restore();
      _0x13bf1d = true;
    } catch {}
  }
  const _0x30bb15 = String(_0x428810.name || _0x428810.type || "").trim();
  if (_0x30bb15 && _0x113b54.width > 48 && _0x113b54.height > 32) {
    _0xced53d.fillStyle = _0x216cea.text;
    _0xced53d.globalAlpha = 0.82;
    _0xced53d.font = Math.max(8, Math.min(12, _0x113b54.width / 14)) * _0x44a032 + "px system-ui, sans-serif";
    _0xced53d.fillText(_0x30bb15.slice(0, 24), _0x113b54.x + _0x44a032 * 6, _0x113b54.y + _0x44a032 * 14);
  }
  _0xced53d.restore();
  return {
    drewMedia: _0x13bf1d
  };
}
export function normalizeCanvasVisualSnapshot(_0x56a7d7) {
  if (!_0x56a7d7 || typeof _0x56a7d7 !== "object") {
    return null;
  }
  const _0x4e8714 = String(_0x56a7d7.src || "").trim();
  if (!_0x4e8714.startsWith("data:image/")) {
    return null;
  }
  return {
    schemaVersion: Number(_0x56a7d7.schemaVersion) || SNAPSHOT_SCHEMA_VERSION,
    src: _0x4e8714,
    width: Math.max(1, Math.round(Number(_0x56a7d7.width) || 1)),
    height: Math.max(1, Math.round(Number(_0x56a7d7.height) || 1)),
    viewport: normalizeViewport(_0x56a7d7.viewport),
    capturedAt: Number(_0x56a7d7.capturedAt) || Date.now(),
    visibleNodeCount: Math.max(0, Math.round(Number(_0x56a7d7.visibleNodeCount) || 0)),
    mediaNodeCount: Math.max(0, Math.round(Number(_0x56a7d7.mediaNodeCount) || 0)),
    readyMediaNodeCount: Math.max(0, Math.round(Number(_0x56a7d7.readyMediaNodeCount) || 0))
  };
}
export function captureCanvasVisualSnapshot({
  canvasEl: _0x11b99e,
  containerEl = null,
  nodes: _0x5ea165,
  edges: _0x7444ba,
  viewport: _0x22021b,
  force = false
} = {}) {
  const _0x34028b = getDocument();
  if (!_0x34028b || typeof _0x34028b.createElement !== "function" || !_0x11b99e) {
    return null;
  }
  const _0x356f3f = normalizeNodes(_0x5ea165);
  if (!force && _0x356f3f.length < SNAPSHOT_MIN_NODE_COUNT) {
    return null;
  }
  const _0x1fe720 = getElementSize(containerEl || _0x11b99e);
  const _0x5f5859 = normalizeViewport(_0x22021b);
  const _0x2573c8 = _0x356f3f.filter(_0xb759d => isNodeVisible(_0xb759d, _0x5f5859, _0x1fe720.width, _0x1fe720.height));
  if (!force && _0x2573c8.length < SNAPSHOT_MIN_NODE_COUNT) {
    return null;
  }
  const _0x52beb6 = Math.min(1, SNAPSHOT_MAX_WIDTH / _0x1fe720.width, SNAPSHOT_MAX_HEIGHT / _0x1fe720.height);
  const _0x4c9e1e = Math.max(1, Math.round(_0x1fe720.width * _0x52beb6));
  const _0x57ed77 = Math.max(1, Math.round(_0x1fe720.height * _0x52beb6));
  const _0x24995f = _0x34028b.createElement("canvas");
  _0x24995f.width = _0x4c9e1e;
  _0x24995f.height = _0x57ed77;
  const _0x1ec2c0 = _0x24995f.getContext?.("2d", {
    alpha: false
  });
  if (!_0x1ec2c0) {
    return null;
  }
  const _0x15c0e8 = {
    bg: getCssColor("--bg", "Canvas"),
    edge: getCssColor("--stroke-default", "GrayText"),
    nodeFill: getCssColor("--bg-panel-card", "ButtonFace"),
    nodeStroke: getCssColor("--stroke-default", "GrayText"),
    text: getCssColor("--text-primary", "CanvasText")
  };
  _0x1ec2c0.fillStyle = _0x15c0e8.bg;
  _0x1ec2c0.fillRect(0, 0, _0x4c9e1e, _0x57ed77);
  const _0x2b2541 = new Map(_0x356f3f.map(_0x3944be => [_0x3944be?.id, _0x3944be]));
  drawEdges(_0x1ec2c0, normalizeEdges(_0x7444ba), _0x2b2541, _0x5f5859, _0x52beb6, _0x15c0e8.edge);
  const _0x4ddaf5 = readRasterPreviewSurface(_0x11b99e);
  let _0x43282c = false;
  if (_0x4ddaf5) {
    const _0x50ef6e = _0x4ddaf5.worldBounds || {};
    const _0x30391b = Number(_0x50ef6e.left);
    const _0x11492c = Number(_0x50ef6e.top);
    const _0x450966 = Number(_0x50ef6e.width);
    const _0x46c5ad = Number(_0x50ef6e.height);
    if ([_0x30391b, _0x11492c, _0x450966, _0x46c5ad].every(Number.isFinite) && _0x450966 > 0 && _0x46c5ad > 0) {
      try {
        _0x1ec2c0.drawImage(_0x4ddaf5.canvas, (_0x30391b * _0x5f5859.zoom + _0x5f5859.x) * _0x52beb6, (_0x11492c * _0x5f5859.zoom + _0x5f5859.y) * _0x52beb6, _0x450966 * _0x5f5859.zoom * _0x52beb6, _0x46c5ad * _0x5f5859.zoom * _0x52beb6);
        _0x43282c = true;
      } catch {}
    }
  }
  let _0x1d17a9 = 0;
  for (const _0x7b4aaa of _0x2573c8) {
    const _0x3ac916 = String(_0x7b4aaa?.id || "");
    if (_0x43282c && _0x4ddaf5.drawnNodeIds.has(_0x3ac916)) {
      if (_0x4ddaf5.drawnMediaNodeIds.has(_0x3ac916)) {
        _0x1d17a9 += 1;
      }
      continue;
    }
    const _0xa78aaa = drawNode(_0x1ec2c0, _0x7b4aaa, _0x5f5859, _0x52beb6, _0x15c0e8);
    if (_0xa78aaa.drewMedia) {
      _0x1d17a9 += 1;
    }
  }
  try {
    const _0x46311c = _0x24995f.toDataURL("image/jpeg", SNAPSHOT_JPEG_QUALITY);
    if (!_0x46311c.startsWith("data:image/")) {
      return null;
    }
    return {
      schemaVersion: SNAPSHOT_SCHEMA_VERSION,
      src: _0x46311c,
      width: _0x4c9e1e,
      height: _0x57ed77,
      viewport: _0x5f5859,
      capturedAt: Date.now(),
      visibleNodeCount: _0x2573c8.length,
      mediaNodeCount: _0x1d17a9,
      readyMediaNodeCount: _0x1d17a9
    };
  } catch {
    return null;
  }
}
export async function captureCanvasVisualSnapshotFromElectron({
  canvasEl: _0x254798,
  containerEl = null,
  nodes: _0x51682a,
  viewport: _0x3eb0e6,
  force = false
} = {}) {
  const _0x58bdb8 = getDocument();
  const _0x8b9c85 = desktopBridge.canvasVisualSnapshot.isAvailable() ? desktopBridge.canvasVisualSnapshot : null;
  const _0x47af5e = containerEl || _0x254798;
  if (!_0x58bdb8 || !_0x47af5e || typeof _0x8b9c85?.capturePage !== "function") {
    return null;
  }
  if (overlayEl?.isConnected && !overlayEl.classList?.contains?.("is-hiding")) {
    return null;
  }
  const _0x128818 = normalizeNodes(_0x51682a);
  if (!force && _0x128818.length < SNAPSHOT_MIN_NODE_COUNT) {
    return null;
  }
  const _0x4f20f1 = getElementSize(_0x47af5e);
  const _0x4329c0 = normalizeViewport(_0x3eb0e6);
  const _0x2f2d35 = _0x128818.filter(_0x179b18 => isNodeVisible(_0x179b18, _0x4329c0, _0x4f20f1.width, _0x4f20f1.height));
  if (!force && _0x2f2d35.length < SNAPSHOT_MIN_NODE_COUNT) {
    return null;
  }
  const _0x4837e7 = getElementViewportRect(_0x47af5e);
  if (!_0x4837e7) {
    return null;
  }
  let _0x553cb6 = null;
  try {
    _0x553cb6 = await _0x8b9c85.capturePage({
      rect: _0x4837e7,
      maxWidth: SNAPSHOT_MAX_WIDTH,
      maxHeight: SNAPSHOT_MAX_HEIGHT
    });
  } catch {
    _0x553cb6 = null;
  }
  const _0x3dfe81 = String(_0x553cb6?.src || "").trim();
  if (_0x553cb6?.ok !== true || !_0x3dfe81.startsWith("data:image/")) {
    return null;
  }
  const _0x1897b6 = countReadyVisibleMediaNodes(_0x2f2d35, _0x254798);
  const _0x10c4b3 = countExpectedVisibleMediaNodes(_0x2f2d35);
  return {
    schemaVersion: SNAPSHOT_SCHEMA_VERSION,
    src: _0x3dfe81,
    width: Math.max(1, Math.round(Number(_0x553cb6.width) || _0x4837e7.width)),
    height: Math.max(1, Math.round(Number(_0x553cb6.height) || _0x4837e7.height)),
    viewport: _0x4329c0,
    capturedAt: Number(_0x553cb6.capturedAt) || Date.now(),
    visibleNodeCount: _0x2f2d35.length,
    mediaNodeCount: _0x10c4b3,
    readyMediaNodeCount: _0x1897b6
  };
}
function clearOverlayTimers() {
  if (overlayHideTimer !== null) {
    clearTimeout(overlayHideTimer);
  }
  if (overlayPollTimer !== null) {
    clearTimeout(overlayPollTimer);
  }
  overlayHideTimer = null;
  overlayPollTimer = null;
}
export function hideCanvasVisualSnapshotOverlay() {
  clearOverlayTimers();
  const _0x15c39d = overlayEl;
  overlayEl = null;
  if (!_0x15c39d) {
    return;
  }
  _0x15c39d.classList?.add?.("is-hiding");
  setTimeout(() => _0x15c39d.remove?.(), 180);
}
function isMediaElementReady(_0x1db146) {
  if (!_0x1db146) {
    return false;
  }
  if (_0x1db146.tagName === "VIDEO") {
    return _0x1db146.readyState >= 2 && Number(_0x1db146.videoWidth || _0x1db146.width || 0) > 0;
  }
  return _0x1db146.complete !== false && Number(_0x1db146.naturalWidth || _0x1db146.width || 0) > 0;
}
function countReadyMedia() {
  const _0x250ce6 = getDocument();
  const _0x122009 = _0x250ce6?.querySelectorAll?.("#v2-canvas .v2-node") || [];
  const _0x243e6f = _0x250ce6?.querySelectorAll?.("#v2-canvas .v2-fast-preview-node") || [];
  const _0x25bd18 = _0x250ce6?.querySelectorAll?.("#v2-canvas .v2-node img, #v2-canvas .v2-node video, #v2-canvas .v2-fast-preview-node img") || [];
  let _0x51c86b = 0;
  for (const _0xe72a6d of _0x25bd18) {
    if (isMediaElementReady(_0xe72a6d)) {
      _0x51c86b += 1;
    }
  }
  const _0x4be8c2 = new Set();
  for (const _0x916b09 of _0x122009) {
    const _0x3d1062 = String(_0x916b09?.id || _0x916b09?.dataset?.nodeId || "").trim();
    if (_0x3d1062) {
      _0x4be8c2.add(_0x3d1062);
    }
  }
  for (const _0x46563d of _0x243e6f) {
    const _0x249989 = String(_0x46563d?.dataset?.nodeId || "").trim();
    if (_0x249989) {
      _0x4be8c2.add(_0x249989);
    }
  }
  const _0x1c163d = readRasterPreviewSurface();
  for (const _0x345704 of _0x1c163d?.drawnNodeIds || []) {
    _0x4be8c2.add(_0x345704);
  }
  _0x51c86b += _0x1c163d?.drawnMediaNodeIds.size || 0;
  return {
    mountedNodeCount: _0x122009.length || 0,
    previewNodeCount: _0x243e6f.length || 0,
    visualNodeCount: _0x4be8c2.size || _0x122009.length || 0,
    readyMedia: _0x51c86b
  };
}
function pollOverlayReadiness(_0x1f1d8f, _0x5b2d34) {
  if (!overlayEl) {
    return;
  }
  const _0x3e350f = Date.now() - _0x5b2d34;
  const _0x424c0d = Math.max(0, Number(_0x1f1d8f.visibleNodeCount) || 0);
  const _0x4e65a8 = Math.max(0, Number(_0x1f1d8f.mediaNodeCount) || 0);
  const {
    visualNodeCount: _0xe24513,
    readyMedia: _0x3e4b4b
  } = countReadyMedia();
  const _0x24ca08 = _0x424c0d <= 0 || _0xe24513 >= Math.max(1, _0x424c0d * SNAPSHOT_NODE_READY_RATIO);
  const _0x1b0856 = _0x4e65a8 <= 0 || _0x3e4b4b >= Math.max(1, Math.min(SNAPSHOT_MEDIA_READY_TARGET, _0x4e65a8 * SNAPSHOT_MEDIA_READY_RATIO));
  if (_0x3e350f >= SNAPSHOT_MAX_HOLD_MS) {
    hideCanvasVisualSnapshotOverlay();
    return;
  }
  if (_0x3e350f >= SNAPSHOT_MIN_HOLD_MS && _0x24ca08 && _0x1b0856) {
    hideCanvasVisualSnapshotOverlay();
    return;
  }
  overlayPollTimer = setTimeout(() => pollOverlayReadiness(_0x1f1d8f, _0x5b2d34), SNAPSHOT_READY_POLL_MS);
}
export function showCanvasVisualSnapshotOverlay(_0x289d03) {
  hideCanvasVisualSnapshotOverlay();
  const _0x2ae1c2 = normalizeCanvasVisualSnapshot(_0x289d03);
  const _0x198884 = getDocument();
  if (!_0x198884 || !_0x2ae1c2) {
    return false;
  }
  const _0x9b4198 = _0x198884.getElementById?.("v2-wrap") || _0x198884.getElementById?.("v2-container") || _0x198884.body;
  if (!_0x9b4198 || typeof _0x198884.createElement !== "function") {
    return false;
  }
  const _0x47bf1e = _0x198884.createElement("div");
  _0x47bf1e.className = "canvas-visual-snapshot-overlay";
  _0x47bf1e.setAttribute?.("aria-hidden", "true");
  _0x47bf1e.dataset.visibleNodeCount = String(_0x2ae1c2.visibleNodeCount || 0);
  _0x47bf1e.dataset.mediaNodeCount = String(_0x2ae1c2.mediaNodeCount || 0);
  const _0x57b535 = _0x198884.createElement("img");
  _0x57b535.className = "canvas-visual-snapshot-image";
  _0x57b535.alt = "";
  _0x57b535.decoding = "async";
  _0x57b535.draggable = false;
  _0x57b535.src = _0x2ae1c2.src;
  _0x47bf1e.appendChild?.(_0x57b535);
  _0x9b4198.appendChild?.(_0x47bf1e);
  overlayEl = _0x47bf1e;
  const _0x5f08ad = getWindow();
  const _0x19c52a = () => overlayEl === _0x47bf1e && _0x47bf1e.classList?.add?.("is-visible");
  if (typeof _0x5f08ad.requestAnimationFrame === "function") {
    _0x5f08ad.requestAnimationFrame(_0x19c52a);
  } else {
    _0x19c52a();
  }
  pollOverlayReadiness(_0x2ae1c2, Date.now());
  return true;
}