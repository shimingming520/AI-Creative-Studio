const DEFAULT_CELL_SIZE = 1024;
const DEFAULT_NODE_WIDTH = 160;
const DEFAULT_NODE_HEIGHT = 120;
let cachedSpatialIndexSignature = "";
let cachedSpatialIndex = null;
function finiteNumber(_0xc5d857, _0x246618 = 0) {
  const _0xae2a3 = Number(_0xc5d857);
  if (Number.isFinite(_0xae2a3)) {
    return _0xae2a3;
  } else {
    return _0x246618;
  }
}
function normalizeNodeBounds(_0x98d483) {
  const _0x4c3dac = finiteNumber(_0x98d483?.x, 0);
  const _0x327783 = finiteNumber(_0x98d483?.y, 0);
  const _0x3738c4 = Math.max(1, finiteNumber(_0x98d483?.width, DEFAULT_NODE_WIDTH));
  const _0x1833cb = Math.max(1, finiteNumber(_0x98d483?.height, DEFAULT_NODE_HEIGHT));
  return {
    minX: _0x4c3dac,
    minY: _0x327783,
    maxX: _0x4c3dac + _0x3738c4,
    maxY: _0x327783 + _0x1833cb
  };
}
function cellRangeForBounds(_0x486d9d, _0x2b4cbf) {
  return {
    minCellX: Math.floor(_0x486d9d.minX / _0x2b4cbf),
    maxCellX: Math.floor(_0x486d9d.maxX / _0x2b4cbf),
    minCellY: Math.floor(_0x486d9d.minY / _0x2b4cbf),
    maxCellY: Math.floor(_0x486d9d.maxY / _0x2b4cbf)
  };
}
function cellKey(_0x226a1c, _0x3035aa) {
  return _0x226a1c + ":" + _0x3035aa;
}
function intersectsBounds(_0x5a8c10, _0x3a5964) {
  return _0x5a8c10.maxX > _0x3a5964.minX && _0x5a8c10.minX < _0x3a5964.maxX && _0x5a8c10.maxY > _0x3a5964.minY && _0x5a8c10.minY < _0x3a5964.maxY;
}
function getViewportWorldCenter(_0x1b4712, _0x2854a1, _0x56134c) {
  const _0x20466c = screenViewportToWorldBounds({
    viewport: _0x1b4712,
    containerWidth: _0x2854a1,
    containerHeight: _0x56134c,
    padding: 0
  });
  return {
    x: (_0x20466c.minX + _0x20466c.maxX) / 2,
    y: (_0x20466c.minY + _0x20466c.maxY) / 2
  };
}
function getNodeDistanceSqToCenter(_0x93c8a4, _0x3f4dc) {
  if (!_0x93c8a4 || !_0x3f4dc) {
    return 0;
  }
  const _0x25c5f0 = normalizeNodeBounds(_0x93c8a4);
  const _0x164ca8 = (_0x25c5f0.minX + _0x25c5f0.maxX) / 2;
  const _0x41721e = (_0x25c5f0.minY + _0x25c5f0.maxY) / 2;
  const _0xfb7d94 = _0x164ca8 - _0x3f4dc.x;
  const _0x8133ef = _0x41721e - _0x3f4dc.y;
  return _0xfb7d94 * _0xfb7d94 + _0x8133ef * _0x8133ef;
}
export function screenViewportToWorldBounds({
  viewport: _0x406f91,
  containerWidth: _0x28e916,
  containerHeight: _0x2d36d1,
  padding = 0
} = {}) {
  const _0x2d6a9d = Math.max(0.0001, finiteNumber(_0x406f91?.zoom, 1));
  const _0x9b405e = finiteNumber(_0x406f91?.x, 0);
  const _0x111f43 = finiteNumber(_0x406f91?.y, 0);
  const _0x1ae16b = Math.max(1, finiteNumber(_0x28e916, 1));
  const _0x31ebcb = Math.max(1, finiteNumber(_0x2d36d1, 1));
  const _0x74260b = Math.max(0, finiteNumber(padding, 0));
  return {
    minX: (-_0x74260b - _0x9b405e) / _0x2d6a9d,
    minY: (-_0x74260b - _0x111f43) / _0x2d6a9d,
    maxX: (_0x1ae16b + _0x74260b - _0x9b405e) / _0x2d6a9d,
    maxY: (_0x31ebcb + _0x74260b - _0x111f43) / _0x2d6a9d
  };
}
export function createRendererSpatialIndex(_0x1aa76b, {
  cellSize = DEFAULT_CELL_SIZE
} = {}) {
  const _0x4dee50 = _0x1aa76b || {};
  const _0x4cc943 = Object.values(_0x4dee50);
  const _0x1650b4 = new Map();
  const _0x22c434 = new Map();
  const _0x527c92 = new Set();
  const _0x3ee5cd = Math.max(128, finiteNumber(cellSize, DEFAULT_CELL_SIZE));
  let _0x7bab93 = 0;
  for (const _0x1b16c3 of _0x4cc943) {
    const _0x66774f = String(_0x1b16c3?.id || "").trim();
    if (!_0x66774f) {
      continue;
    }
    const _0x38c19b = normalizeNodeBounds(_0x1b16c3);
    const _0x46e3ae = cellRangeForBounds(_0x38c19b, _0x3ee5cd);
    _0x22c434.set(_0x66774f, {
      node: _0x1b16c3,
      bounds: _0x38c19b,
      order: _0x7bab93
    });
    _0x7bab93 += 1;
    _0x527c92.add(_0x66774f);
    for (let _0xc36296 = _0x46e3ae.minCellX; _0xc36296 <= _0x46e3ae.maxCellX; _0xc36296 += 1) {
      for (let _0x53192b = _0x46e3ae.minCellY; _0x53192b <= _0x46e3ae.maxCellY; _0x53192b += 1) {
        const _0x9877e1 = cellKey(_0xc36296, _0x53192b);
        let _0x3d3312 = _0x1650b4.get(_0x9877e1);
        if (!_0x3d3312) {
          _0x3d3312 = new Set();
          _0x1650b4.set(_0x9877e1, _0x3d3312);
        }
        _0x3d3312.add(_0x66774f);
      }
    }
  }
  return {
    nodeSource: _0x4dee50,
    cellSize: _0x3ee5cd,
    cells: _0x1650b4,
    nodesById: _0x22c434,
    nodeIds: _0x527c92,
    nodeCount: _0x527c92.size
  };
}
export function queryRendererSpatialIndex(_0x326d11, _0x45e947) {
  if (!_0x326d11 || !_0x45e947) {
    return [];
  }
  const _0x274c6b = cellRangeForBounds(_0x45e947, _0x326d11.cellSize || DEFAULT_CELL_SIZE);
  const _0x4e447f = new Set();
  const _0x46090e = [];
  for (let _0x1ebadb = _0x274c6b.minCellX; _0x1ebadb <= _0x274c6b.maxCellX; _0x1ebadb += 1) {
    for (let _0x487240 = _0x274c6b.minCellY; _0x487240 <= _0x274c6b.maxCellY; _0x487240 += 1) {
      const _0x2d7286 = _0x326d11.cells?.get?.(cellKey(_0x1ebadb, _0x487240));
      if (!_0x2d7286) {
        continue;
      }
      for (const _0x6bd6c8 of _0x2d7286) {
        if (_0x4e447f.has(_0x6bd6c8)) {
          continue;
        }
        _0x4e447f.add(_0x6bd6c8);
        const _0x371e7b = _0x326d11.nodesById?.get?.(_0x6bd6c8);
        if (!_0x371e7b || !intersectsBounds(_0x371e7b.bounds, _0x45e947)) {
          continue;
        }
        const _0x156577 = _0x326d11.nodeSource?.[_0x6bd6c8] || _0x371e7b.node;
        if (_0x156577) {
          _0x46090e.push(_0x156577);
        }
      }
    }
  }
  return _0x46090e;
}
export function queryRendererSpatialIndexIds(_0x100816, _0xbd983) {
  return new Set(queryRendererSpatialIndex(_0x100816, _0xbd983).map(_0x206251 => _0x206251.id));
}
export function clearRendererSpatialIndexCache() {
  cachedSpatialIndexSignature = "";
  cachedSpatialIndex = null;
}
export function getCachedRendererSpatialIndex(_0x1c7f03, {
  geometryRev: _0x47dba9,
  nodeCount: _0x79b33a,
  denseNodeCount = 80
} = {}) {
  const _0x34b32d = Number.isFinite(_0x79b33a) ? _0x79b33a : Object.keys(_0x1c7f03 || {}).length;
  if (_0x34b32d < denseNodeCount) {
    clearRendererSpatialIndexCache();
    return null;
  }
  const _0x6a79f3 = (Number.isFinite(_0x47dba9) ? _0x47dba9 : 0) + "|" + _0x34b32d;
  if (cachedSpatialIndex && cachedSpatialIndexSignature === _0x6a79f3) {
    cachedSpatialIndex.nodeSource = _0x1c7f03 || {};
    return cachedSpatialIndex;
  }
  cachedSpatialIndex = createRendererSpatialIndex(_0x1c7f03);
  cachedSpatialIndexSignature = _0x6a79f3;
  return cachedSpatialIndex;
}
export function collectVirtualizedRenderNodes({
  nodes: _0x3c5aa5,
  virtualizationResult: _0x2c7f15,
  spatialIndex: _0x2189cb,
  mountedNodeIds: _0x2b5771,
  viewport: _0xa6a41d,
  containerWidth: _0x465228,
  containerHeight: _0x29dce9
} = {}) {
  if (!_0x2189cb) {
    return Object.values(_0x3c5aa5 || {});
  }
  const _0xa0f025 = new Set();
  for (const _0xb0c296 of _0x2c7f15?.mountCandidateIds || []) {
    _0xa0f025.add(_0xb0c296);
  }
  const _0x1d8c90 = _0x2b5771 instanceof Set ? _0x2b5771 : Array.isArray(_0x2b5771) ? _0x2b5771 : [];
  for (const _0x5a460f of _0x1d8c90) {
    _0xa0f025.add(_0x5a460f);
  }
  const _0x213664 = [];
  for (const _0x8113f2 of _0xa0f025) {
    const _0x274eb1 = _0x3c5aa5?.[_0x8113f2];
    if (_0x274eb1?.id) {
      _0x213664.push(_0x274eb1);
    }
  }
  const _0xfc88dd = _0xa6a41d && Number.isFinite(Number(_0x465228)) && Number.isFinite(Number(_0x29dce9));
  if (!_0xfc88dd || _0x213664.length < 2) {
    return _0x213664;
  }
  const _0x568528 = getViewportWorldCenter(_0xa6a41d, _0x465228, _0x29dce9);
  const _0x2be648 = _0x2c7f15?.mountCandidateIds || new Set();
  const _0x4b5b5d = _0x2c7f15?.keepAliveNodeIds || new Set();
  return _0x213664.sort((_0x29ddfc, _0x4a63ea) => {
    const _0x3d34c0 = String(_0x29ddfc?.id || "");
    const _0x347695 = String(_0x4a63ea?.id || "");
    const _0x49bd95 = _0x2be648.has(_0x3d34c0);
    const _0x593e6d = _0x2be648.has(_0x347695);
    if (_0x49bd95 !== _0x593e6d) {
      if (_0x49bd95) {
        return -1;
      } else {
        return 1;
      }
    }
    const _0x27ac0b = _0x4b5b5d.has(_0x3d34c0);
    const _0x16e10a = _0x4b5b5d.has(_0x347695);
    if (_0x27ac0b !== _0x16e10a) {
      if (_0x27ac0b) {
        return -1;
      } else {
        return 1;
      }
    }
    const _0x13f256 = getNodeDistanceSqToCenter(_0x29ddfc, _0x568528) - getNodeDistanceSqToCenter(_0x4a63ea, _0x568528);
    if (_0x13f256 !== 0) {
      return _0x13f256;
    }
    return (_0x2189cb.nodesById?.get?.(_0x3d34c0)?.order ?? 0) - (_0x2189cb.nodesById?.get?.(_0x347695)?.order ?? 0);
  });
}