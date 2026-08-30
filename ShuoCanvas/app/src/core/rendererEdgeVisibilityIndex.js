export const MANY_EDGES_THRESHOLD = 400;
export const EDGE_RENDER_ALL_LOW_ZOOM_THRESHOLD = 0.22;
export const EDGE_RENDER_ALL_MAX_EDGE_COUNT = 300;
const EDGE_VISIBILITY_CELL_SIZE = 1024;
let cachedEdgeVisibilityIndexSignature = "";
let cachedEdgeVisibilityIndexNodes = null;
let cachedEdgeVisibilityIndex = null;
let cachedEdgeGeometrySignatureKey = "";
let cachedEdgeGeometrySignatureNodes = null;
let cachedEdgeGeometrySignature = "";
function formatEdgeSignatureNumber(_0x1fd162) {
  const _0x11339c = Number(_0x1fd162);
  if (Number.isFinite(_0x11339c)) {
    return _0x11339c.toFixed(1);
  } else {
    return "0.0";
  }
}
function updateStringHash(_0x1da555, _0x414c16) {
  const _0x2fb174 = String(_0x414c16);
  let _0x2e479a = _0x1da555 >>> 0;
  for (let _0x4c5e5f = 0; _0x4c5e5f < _0x2fb174.length; _0x4c5e5f += 1) {
    _0x2e479a ^= _0x2fb174.charCodeAt(_0x4c5e5f);
    _0x2e479a = Math.imul(_0x2e479a, 16777619) >>> 0;
  }
  return _0x2e479a;
}
function appendSortedSetSignature(_0x1246b5, _0x9225e4, _0x32f9cf) {
  if (!(_0x32f9cf instanceof Set) || _0x32f9cf.size === 0) {
    _0x1246b5.push(_0x9225e4 + ":");
    return;
  }
  _0x1246b5.push(_0x9225e4 + ":" + Array.from(_0x32f9cf).sort().join(","));
}
function normalizeEdgeLodZoom(_0x133b24) {
  const _0x3a0802 = Number(_0x133b24?.zoom);
  if (Number.isFinite(_0x3a0802) && _0x3a0802 > 0) {
    return _0x3a0802;
  } else {
    return 1;
  }
}
export function shouldRenderAllEdgesAtLowZoom({
  edgeCount: _0x1aa2d3,
  viewport: _0x5ef749,
  maxEdgeCount = EDGE_RENDER_ALL_MAX_EDGE_COUNT,
  lowZoomThreshold = EDGE_RENDER_ALL_LOW_ZOOM_THRESHOLD
} = {}) {
  const _0x54f066 = Number(_0x1aa2d3) || 0;
  if (_0x54f066 <= 0 || _0x54f066 > maxEdgeCount) {
    return false;
  }
  return normalizeEdgeLodZoom(_0x5ef749) <= lowZoomThreshold;
}
function edgeVisibilityCellCoord(_0x504e4f, _0x902437 = EDGE_VISIBILITY_CELL_SIZE) {
  return Math.floor((Number(_0x504e4f) || 0) / _0x902437);
}
function edgeVisibilityCellKey(_0x3260df, _0x3a94dd) {
  return _0x3260df + ":" + _0x3a94dd;
}
function pushEdgeVisibilityCell(_0x1604b8, _0xe3e5d4, _0x5bac34, _0x8c2690) {
  const _0x2c0b34 = edgeVisibilityCellKey(_0xe3e5d4, _0x5bac34);
  let _0x4782a0 = _0x1604b8.get(_0x2c0b34);
  if (!_0x4782a0) {
    _0x4782a0 = [];
    _0x1604b8.set(_0x2c0b34, _0x4782a0);
  }
  _0x4782a0.push(_0x8c2690);
}
function intersectsEdgeVisibilityBounds(_0x48b3f6, _0x3edb62) {
  return _0x48b3f6.maxX > _0x3edb62.minX && _0x48b3f6.minX < _0x3edb62.maxX && _0x48b3f6.maxY > _0x3edb62.minY && _0x48b3f6.minY < _0x3edb62.maxY;
}
function computeEdgeWorldBounds(_0x173eaf, _0x3fc067) {
  if (!_0x173eaf?.id) {
    return null;
  }
  const _0x5d5bca = _0x3fc067?.[_0x173eaf.sourceId];
  const _0x5bb39d = _0x3fc067?.[_0x173eaf.targetId];
  if (!_0x5d5bca || !_0x5bb39d) {
    return null;
  }
  const _0x3d9f3d = Number(_0x5d5bca.x || 0);
  const _0x2916da = Number(_0x5d5bca.y || 0);
  const _0x282bec = Number(_0x5bb39d.x || 0);
  const _0x9c1d91 = Number(_0x5bb39d.y || 0);
  const _0x409b98 = _0x3d9f3d + Number(_0x5d5bca.width ?? 0);
  const _0x99d5bd = _0x2916da + Number(_0x5d5bca.height ?? 0) / 2;
  const _0xd9a8f8 = _0x282bec;
  const _0xf89be = _0x9c1d91 + Number(_0x5bb39d.height ?? 0) / 2;
  const _0x2aa3df = Math.max(Math.abs(_0xd9a8f8 - _0x409b98) * 0.5, 60);
  return {
    minX: Math.min(_0x409b98, _0xd9a8f8, _0x409b98 + _0x2aa3df, _0xd9a8f8 - _0x2aa3df),
    maxX: Math.max(_0x409b98, _0xd9a8f8, _0x409b98 + _0x2aa3df, _0xd9a8f8 - _0x2aa3df),
    minY: Math.min(_0x99d5bd, _0xf89be),
    maxY: Math.max(_0x99d5bd, _0xf89be)
  };
}
export function createEdgeVisibilityIndex(_0xa3d8e5, _0x2f03fe) {
  const _0x3234a2 = new Map();
  const _0x2cb018 = new Map();
  const _0x282c30 = new Map();
  const _0xa5a5c4 = new Map();
  let _0x54d439 = 0;
  for (const _0x4d5607 of _0xa3d8e5 || []) {
    const _0x3a79e0 = String(_0x4d5607?.id || "").trim();
    if (!_0x3a79e0) {
      continue;
    }
    const _0x5d12d4 = computeEdgeWorldBounds(_0x4d5607, _0x2f03fe);
    if (!_0x5d12d4) {
      continue;
    }
    _0x2cb018.set(_0x3a79e0, _0x5d12d4);
    _0x282c30.set(_0x3a79e0, _0x4d5607);
    _0xa5a5c4.set(_0x3a79e0, _0x54d439);
    _0x54d439 += 1;
    const _0x197a0d = edgeVisibilityCellCoord(_0x5d12d4.minX);
    const _0x203647 = edgeVisibilityCellCoord(_0x5d12d4.maxX);
    const _0x137fb2 = edgeVisibilityCellCoord(_0x5d12d4.minY);
    const _0x2c727b = edgeVisibilityCellCoord(_0x5d12d4.maxY);
    for (let _0x5f2837 = _0x197a0d; _0x5f2837 <= _0x203647; _0x5f2837 += 1) {
      for (let _0x1c2658 = _0x137fb2; _0x1c2658 <= _0x2c727b; _0x1c2658 += 1) {
        pushEdgeVisibilityCell(_0x3234a2, _0x5f2837, _0x1c2658, _0x3a79e0);
      }
    }
  }
  return {
    cellSize: EDGE_VISIBILITY_CELL_SIZE,
    cells: _0x3234a2,
    edgeBounds: _0x2cb018,
    edgesById: _0x282c30,
    edgeOrder: _0xa5a5c4,
    edgeCount: _0xa5a5c4.size
  };
}
export function clearCachedEdgeVisibilityIndex() {
  cachedEdgeVisibilityIndexSignature = "";
  cachedEdgeVisibilityIndexNodes = null;
  cachedEdgeVisibilityIndex = null;
  cachedEdgeGeometrySignatureKey = "";
  cachedEdgeGeometrySignatureNodes = null;
  cachedEdgeGeometrySignature = "";
}
export function getCachedEdgeGeometrySignature(_0x508ac3, _0x1d8cb2, {
  edgesRev = 0,
  geometryRev = 0
} = {}) {
  const _0x4c8d36 = Array.isArray(_0x508ac3) ? _0x508ac3.length : 0;
  const _0x46cd5a = _0x4c8d36 + ":" + (Number.isFinite(edgesRev) ? edgesRev : 0) + ":" + (Number.isFinite(geometryRev) ? geometryRev : 0);
  if (cachedEdgeGeometrySignature && cachedEdgeGeometrySignatureKey === _0x46cd5a && cachedEdgeGeometrySignatureNodes === _0x1d8cb2) {
    return cachedEdgeGeometrySignature;
  }
  const _0x2a7c09 = Number.isFinite(edgesRev) ? edgesRev : 0;
  let _0x21907e = 2166136261;
  _0x21907e = updateStringHash(_0x21907e, "geom:" + _0x4c8d36 + ":" + _0x2a7c09);
  for (const _0x3f97ac of _0x508ac3 || []) {
    if (!_0x3f97ac?.id) {
      continue;
    }
    const _0x59e3d2 = _0x1d8cb2?.[_0x3f97ac.sourceId];
    const _0x5aa826 = _0x1d8cb2?.[_0x3f97ac.targetId];
    if (!_0x59e3d2 || !_0x5aa826) {
      _0x21907e = updateStringHash(_0x21907e, "e:" + _0x3f97ac.id + ":" + (_0x3f97ac.sourceId || "") + ":" + (_0x3f97ac.targetId || "") + ":missing");
      continue;
    }
    const _0x51f690 = Number(_0x59e3d2.x || 0) + Number(_0x59e3d2.width ?? 0);
    const _0x2d4fc0 = Number(_0x59e3d2.y || 0) + Number(_0x59e3d2.height ?? 0) / 2;
    const _0xf7f753 = Number(_0x5aa826.x || 0);
    const _0x160f0d = Number(_0x5aa826.y || 0) + Number(_0x5aa826.height ?? 0) / 2;
    _0x21907e = updateStringHash(_0x21907e, "e:" + _0x3f97ac.id + ":" + (_0x3f97ac.sourceId || "") + ":" + (_0x3f97ac.targetId || "") + ":" + formatEdgeSignatureNumber(_0x51f690) + ":" + formatEdgeSignatureNumber(_0x2d4fc0) + ":" + formatEdgeSignatureNumber(_0xf7f753) + ":" + formatEdgeSignatureNumber(_0x160f0d));
  }
  cachedEdgeGeometrySignatureKey = _0x46cd5a;
  cachedEdgeGeometrySignatureNodes = _0x1d8cb2 || null;
  cachedEdgeGeometrySignature = "geom:" + _0x4c8d36 + ":" + _0x2a7c09 + ":" + _0x21907e.toString(36);
  return cachedEdgeGeometrySignature;
}
export function getCachedEdgeVisibilityIndex(_0x305d97, _0x3b94c9, {
  edgesRev = 0,
  geometryRev = 0,
  threshold = MANY_EDGES_THRESHOLD,
  geometrySignature = ""
} = {}) {
  const _0x21e36c = Array.isArray(_0x305d97) ? _0x305d97.length : 0;
  if (_0x21e36c < threshold) {
    clearCachedEdgeVisibilityIndex();
    return null;
  }
  const _0x293f42 = typeof geometrySignature === "string" && geometrySignature ? geometrySignature : String(Number.isFinite(geometryRev) ? geometryRev : 0);
  const _0x22e14d = _0x21e36c + ":" + (Number.isFinite(edgesRev) ? edgesRev : 0) + ":" + _0x293f42;
  if (cachedEdgeVisibilityIndex && cachedEdgeVisibilityIndexSignature === _0x22e14d && cachedEdgeVisibilityIndexNodes === _0x3b94c9) {
    return cachedEdgeVisibilityIndex;
  }
  cachedEdgeVisibilityIndex = createEdgeVisibilityIndex(_0x305d97, _0x3b94c9);
  cachedEdgeVisibilityIndexSignature = _0x22e14d;
  cachedEdgeVisibilityIndexNodes = _0x3b94c9 || null;
  return cachedEdgeVisibilityIndex;
}
export function queryEdgeVisibilityIndex(_0x26a0e1, _0x49a0e5) {
  if (!_0x26a0e1 || !_0x49a0e5 || !(_0x26a0e1.cells instanceof Map)) {
    return [];
  }
  const _0x3d1d0f = edgeVisibilityCellCoord(_0x49a0e5.minX, _0x26a0e1.cellSize);
  const _0x39dd40 = edgeVisibilityCellCoord(_0x49a0e5.maxX, _0x26a0e1.cellSize);
  const _0x2667ae = edgeVisibilityCellCoord(_0x49a0e5.minY, _0x26a0e1.cellSize);
  const _0x52941d = edgeVisibilityCellCoord(_0x49a0e5.maxY, _0x26a0e1.cellSize);
  const _0x2cca32 = new Set();
  for (let _0x405d8d = _0x3d1d0f; _0x405d8d <= _0x39dd40; _0x405d8d += 1) {
    for (let _0x331251 = _0x2667ae; _0x331251 <= _0x52941d; _0x331251 += 1) {
      const _0x59fd32 = _0x26a0e1.cells.get(edgeVisibilityCellKey(_0x405d8d, _0x331251));
      if (!_0x59fd32 || _0x59fd32.length === 0) {
        continue;
      }
      for (const _0x4646af of _0x59fd32) {
        const _0x4c1f51 = _0x26a0e1.edgeBounds?.get?.(_0x4646af);
        if (_0x4c1f51 && intersectsEdgeVisibilityBounds(_0x4c1f51, _0x49a0e5)) {
          _0x2cca32.add(_0x4646af);
        }
      }
    }
  }
  return Array.from(_0x2cca32).sort((_0x46386d, _0x43ecf9) => {
    const _0x66f9ed = _0x26a0e1.edgeOrder?.get?.(_0x46386d) ?? Infinity;
    const _0x1b87c0 = _0x26a0e1.edgeOrder?.get?.(_0x43ecf9) ?? Infinity;
    return _0x66f9ed - _0x1b87c0;
  });
}
export function buildFullEdgeRenderSignature({
  edgeEntries: _0x98dae7,
  nodes: _0x5635dc,
  viewport: _0x50669c,
  dragOffsetCtx: _0x399a81,
  relatedEdgeIds: _0xbdb394,
  containerW: _0x5d8365,
  containerH: _0x472f85,
  edgesRev = 0,
  geometryRev = 0,
  threshold = MANY_EDGES_THRESHOLD,
  geometrySignature = "",
  edgePathStyle = "curve"
}) {
  const _0x2b2ee8 = _0x50669c || {
    x: 0,
    y: 0,
    zoom: 1
  };
  const _0x4e8cc8 = _0x399a81?.movedNodeIds instanceof Set ? _0x399a81.movedNodeIds : null;
  const _0x3da5cc = Number.isFinite(_0x399a81?.dx) ? _0x399a81.dx : 0;
  const _0x1f5106 = Number.isFinite(_0x399a81?.dy) ? _0x399a81.dy : 0;
  const _0x3c0e95 = Array.isArray(_0x98dae7) ? _0x98dae7.length : 0;
  const _0x39946f = _0x4e8cc8 && _0x4e8cc8.size > 0 || _0x3da5cc !== 0 || _0x1f5106 !== 0;
  const _0x26b5f7 = ["edge-full", "vp:" + formatEdgeSignatureNumber(_0x2b2ee8.x) + ":" + formatEdgeSignatureNumber(_0x2b2ee8.y) + ":" + formatEdgeSignatureNumber(_0x2b2ee8.zoom || 1), "box:" + formatEdgeSignatureNumber(_0x5d8365) + ":" + formatEdgeSignatureNumber(_0x472f85), "drag:" + formatEdgeSignatureNumber(_0x3da5cc) + ":" + formatEdgeSignatureNumber(_0x1f5106), "path:" + String(edgePathStyle || "curve")];
  appendSortedSetSignature(_0x26b5f7, "dragIds", _0x4e8cc8);
  appendSortedSetSignature(_0x26b5f7, "highlight", _0xbdb394);
  if (_0x3c0e95 >= threshold && !_0x39946f) {
    const _0x40b282 = typeof geometrySignature === "string" && geometrySignature ? geometrySignature : getCachedEdgeGeometrySignature(_0x98dae7, _0x5635dc, {
      edgesRev: edgesRev,
      geometryRev: geometryRev
    });
    _0x26b5f7.push("compact:" + _0x3c0e95 + ":" + (Number.isFinite(edgesRev) ? edgesRev : 0) + ":" + _0x40b282);
    return _0x26b5f7.join("|");
  }
  for (const _0x4bb6c9 of _0x98dae7 || []) {
    if (!_0x4bb6c9?.id) {
      continue;
    }
    const _0x4c199b = _0x5635dc?.[_0x4bb6c9.sourceId];
    const _0x7448c3 = _0x5635dc?.[_0x4bb6c9.targetId];
    if (!_0x4c199b || !_0x7448c3) {
      _0x26b5f7.push("e:" + _0x4bb6c9.id + ":" + (_0x4bb6c9.sourceId || "") + ":" + (_0x4bb6c9.targetId || "") + ":missing");
      continue;
    }
    const _0xe81cfa = _0x4e8cc8 && _0x4e8cc8.has(_0x4bb6c9.sourceId) ? _0x3da5cc : 0;
    const _0x50eda4 = _0x4e8cc8 && _0x4e8cc8.has(_0x4bb6c9.sourceId) ? _0x1f5106 : 0;
    const _0x235666 = _0x4e8cc8 && _0x4e8cc8.has(_0x4bb6c9.targetId) ? _0x3da5cc : 0;
    const _0x5a9692 = _0x4e8cc8 && _0x4e8cc8.has(_0x4bb6c9.targetId) ? _0x1f5106 : 0;
    const _0x6c1d85 = Number(_0x4c199b.x || 0) + _0xe81cfa;
    const _0x1037c1 = Number(_0x4c199b.y || 0) + _0x50eda4;
    const _0x12e8fe = Number(_0x7448c3.x || 0) + _0x235666;
    const _0x204222 = Number(_0x7448c3.y || 0) + _0x5a9692;
    const _0x39e61f = _0x6c1d85 + Number(_0x4c199b.width ?? 0);
    const _0x57219b = _0x1037c1 + Number(_0x4c199b.height ?? 0) / 2;
    const _0x73a0e0 = _0x12e8fe;
    const _0x578919 = _0x204222 + Number(_0x7448c3.height ?? 0) / 2;
    _0x26b5f7.push("e:" + _0x4bb6c9.id + ":" + (_0x4bb6c9.sourceId || "") + ":" + (_0x4bb6c9.targetId || "") + ":" + formatEdgeSignatureNumber(_0x39e61f) + ":" + formatEdgeSignatureNumber(_0x57219b) + ":" + formatEdgeSignatureNumber(_0x73a0e0) + ":" + formatEdgeSignatureNumber(_0x578919));
  }
  return _0x26b5f7.join("|");
}