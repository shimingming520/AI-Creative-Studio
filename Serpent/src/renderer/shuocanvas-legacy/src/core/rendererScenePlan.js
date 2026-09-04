import { isNodeInsideViewportPadding } from "./rendererVirtualization.js";
import { queryRendererSpatialIndexIds, screenViewportToWorldBounds } from "./rendererSpatialIndex.js";
import { shouldShowGenerationBusyUi } from "./generationTaskUiState.js";
function toIdSet(_0xdda27a) {
  if (_0xdda27a instanceof Set) {
    return new Set(_0xdda27a);
  }
  if (Array.isArray(_0xdda27a)) {
    return new Set(_0xdda27a);
  }
  return new Set();
}
function getContainerSize(_0x10776e) {
  return {
    width: Number.isFinite(_0x10776e?.width) ? _0x10776e.width : 0,
    height: Number.isFinite(_0x10776e?.height) ? _0x10776e.height : 0
  };
}
function createSpatialNodeMapView(_0x1312d4) {
  const _0x475a9e = _0x1312d4?.nodesById;
  if (!(_0x475a9e instanceof Map)) {
    return null;
  }
  return {
    get size() {
      return _0x475a9e.size;
    },
    get(_0x314f73) {
      return _0x475a9e.get(_0x314f73)?.node;
    },
    has(_0x173fae) {
      return _0x475a9e.has(_0x173fae);
    },
    keys() {
      return _0x475a9e.keys();
    },
    *[Symbol.iterator]() {
      for (const [_0x43c8c9, _0x4453d8] of _0x475a9e) {
        yield [_0x43c8c9, _0x4453d8?.node];
      }
    }
  };
}
function createNodeMap(_0x5642de, _0x35a2b3 = null) {
  const _0x3bf6e3 = createSpatialNodeMapView(_0x35a2b3);
  if (_0x3bf6e3) {
    return _0x3bf6e3;
  }
  const _0x4c45a0 = new Map();
  let _0x49455b = [];
  if (Array.isArray(_0x5642de)) {
    _0x49455b = _0x5642de.map(_0x3fca0d => [_0x3fca0d?.id, _0x3fca0d]);
  } else if (_0x5642de instanceof Map) {
    _0x49455b = _0x5642de.entries();
  } else if (_0x5642de && typeof _0x5642de === "object") {
    _0x49455b = Object.entries(_0x5642de);
  }
  for (const [_0x2914c1, _0x1ca63d] of _0x49455b) {
    if (!_0x1ca63d || typeof _0x1ca63d !== "object") {
      continue;
    }
    const _0x3d900d = _0x1ca63d.id ?? _0x2914c1;
    if (_0x3d900d == null || _0x3d900d === "") {
      continue;
    }
    _0x4c45a0.set(_0x3d900d, _0x1ca63d);
  }
  return _0x4c45a0;
}
function getSpatialNodeOrder(_0x162218, _0xe576d8) {
  const _0x22ec99 = _0x162218?.nodesById?.get?.(_0xe576d8)?.order;
  if (Number.isFinite(_0x22ec99)) {
    return _0x22ec99;
  } else {
    return 0;
  }
}
function collectViewportRangeIds({
  nodeById: _0x3ebe19,
  spatialIndex: _0x5c52e7,
  viewport: _0x37ad6d,
  width: _0x39d4b9,
  height: _0x5b9730,
  padding: _0x59f124
}) {
  if (!_0x5c52e7) {
    return new Set([..._0x3ebe19.keys()].filter(_0x26696c => isNodeInsideViewportPadding(_0x3ebe19.get(_0x26696c), _0x37ad6d, _0x39d4b9, _0x5b9730, _0x59f124)));
  }
  const _0x402d5f = screenViewportToWorldBounds({
    viewport: _0x37ad6d,
    containerWidth: _0x39d4b9,
    containerHeight: _0x5b9730,
    padding: _0x59f124
  });
  return new Set([...queryRendererSpatialIndexIds(_0x5c52e7, _0x402d5f)].filter(_0x60d504 => isNodeInsideViewportPadding(_0x3ebe19.get(_0x60d504), _0x37ad6d, _0x39d4b9, _0x5b9730, _0x59f124)));
}
function smoothstep(_0x2c1f27, _0x2d997c, _0x106f48) {
  if (_0x106f48 <= _0x2c1f27) {
    return 0;
  }
  if (_0x106f48 >= _0x2d997c) {
    return 1;
  }
  const _0x42686a = (_0x106f48 - _0x2c1f27) / (_0x2d997c - _0x2c1f27);
  return _0x42686a * _0x42686a * (3 - _0x42686a * 2);
}
function calculateScenePressure(_0x5a34ee, _0x926671) {
  const _0x32d877 = smoothstep(24, 120, _0x5a34ee);
  const _0x30b3f4 = smoothstep(80, 320, _0x926671);
  return Math.max(_0x32d877, _0x30b3f4);
}
function calculateProjectedDetail(_0x159517, _0xc303ee, _0x456465) {
  if (_0x159517.size === 0) {
    return 0;
  }
  const _0x2602cc = Number.isFinite(_0x456465?.zoom) && _0x456465.zoom > 0 ? _0x456465.zoom : 1;
  let _0x7ec939 = 0;
  let _0x12bbbd = 0;
  for (const _0x3c204b of _0x159517) {
    const _0x529cbf = _0xc303ee.get(_0x3c204b);
    if (!_0x529cbf) {
      continue;
    }
    const _0x3d9e61 = Math.max(1, Number(_0x529cbf.width) || 160) * _0x2602cc;
    const _0x575db9 = Math.max(1, Number(_0x529cbf.height) || 120) * _0x2602cc;
    _0x7ec939 += _0x3d9e61 * _0x575db9;
    _0x12bbbd += 1;
  }
  if (_0x12bbbd === 0) {
    return 0;
  }
  const _0x15c757 = _0x7ec939 / _0x12bbbd;
  const _0x3a17d3 = Math.round(_0x15c757 * 1000000000) / 1000000000;
  return smoothstep(1200, 7200, _0x3a17d3);
}
function interpolate(_0x5841d0, _0x415b65, _0x2e9925) {
  return _0x5841d0 + (_0x415b65 - _0x5841d0) * _0x2e9925;
}
function calculateDynamicPadding(_0x20333a, _0x24720a) {
  const _0x523933 = interpolate(420, 96, _0x20333a);
  const _0x2b3b09 = _0x20333a * 720 * (1 - _0x24720a) ** 2;
  const _0x2688b3 = Math.max(_0x523933, interpolate(720, 240, _0x20333a) + interpolate(240, 0, _0x24720a) - _0x20333a * 144 * _0x24720a + _0x2b3b09);
  return {
    mount: _0x523933,
    preview: _0x2688b3,
    park: Math.max(interpolate(900, 360, _0x20333a), _0x2688b3 + 120)
  };
}
function collectLiveIds(_0x3920ac, ..._0x28ca0a) {
  const _0x4531ac = new Set();
  for (const _0x3fbee2 of _0x28ca0a) {
    for (const _0xa1944a of toIdSet(_0x3fbee2)) {
      if (_0x3920ac.has(_0xa1944a)) {
        _0x4531ac.add(_0xa1944a);
      }
    }
  }
  return _0x4531ac;
}
function buildSurfaceSignature(_0x15db54, _0x13a6e8, _0x49ec4f) {
  return ["full", ..._0x15db54, "proxy", ..._0x13a6e8, "generation-busy", ..._0x49ec4f].join("");
}
function getNodeDistanceSquared(_0x548fed, _0x267ac7, _0x4a23be, _0x15d585) {
  const _0x346413 = Number.isFinite(_0x267ac7?.zoom) && _0x267ac7.zoom > 0 ? _0x267ac7.zoom : 1;
  const _0x11ce60 = Number.isFinite(_0x267ac7?.x) ? _0x267ac7.x : 0;
  const _0x32bcfe = Number.isFinite(_0x267ac7?.y) ? _0x267ac7.y : 0;
  const _0x157167 = ((Number.isFinite(_0x548fed?.x) ? _0x548fed.x : 0) + (Number.isFinite(_0x548fed?.width) ? _0x548fed.width : 0) / 2) * _0x346413 + _0x11ce60;
  const _0x221ee6 = ((Number.isFinite(_0x548fed?.y) ? _0x548fed.y : 0) + (Number.isFinite(_0x548fed?.height) ? _0x548fed.height : 0) / 2) * _0x346413 + _0x32bcfe;
  const _0x4bf674 = _0x157167 - _0x4a23be / 2;
  const _0x42e6cc = _0x221ee6 - _0x15d585 / 2;
  return _0x4bf674 * _0x4bf674 + _0x42e6cc * _0x42e6cc;
}
export function buildRendererScenePlan({
  nodes = [],
  spatialIndex = null,
  viewport = {
    x: 0,
    y: 0,
    zoom: 1
  },
  containerRect: _0x5ef139,
  mountCandidateIds: _0x161d64,
  previewCandidateIds: _0x18c3c8,
  parkCandidateIds: _0x302868,
  selectedNodeIds: _0x2e89d5,
  activeNodeIds: _0x6d3ecf,
  keepAliveNodeIds: _0x50bd75,
  mountedNodeIds: _0x3d4bb3,
  fullEligibleVisibleImageNodeIds: _0x3202e2,
  includeParkIds = true
} = {}) {
  const {
    width: _0x576c1b,
    height: _0x103cb9
  } = getContainerSize(_0x5ef139);
  const _0x5a2cae = createNodeMap(nodes, spatialIndex);
  const _0x59b480 = new Map();
  const _0x4a99d8 = _0x577bea => {
    if (_0x59b480.has(_0x577bea)) {
      return _0x59b480.get(_0x577bea);
    }
    const _0x30d225 = getNodeDistanceSquared(_0x5a2cae.get(_0x577bea), viewport, _0x576c1b, _0x103cb9);
    _0x59b480.set(_0x577bea, _0x30d225);
    return _0x30d225;
  };
  const _0x1c2e1c = collectViewportRangeIds({
    nodeById: _0x5a2cae,
    spatialIndex: spatialIndex,
    viewport: viewport,
    width: _0x576c1b,
    height: _0x103cb9,
    padding: 0
  });
  const _0xee9aac = new Set();
  const _0x4b8fcb = new Set();
  const _0x573f42 = calculateScenePressure(_0x1c2e1c.size, _0x5a2cae.size);
  const _0x3d1710 = calculateProjectedDetail(_0x1c2e1c, _0x5a2cae, viewport);
  const _0x240942 = calculateDynamicPadding(_0x573f42, _0x3d1710);
  const _0x4f4bbb = Math.round((48 - _0x573f42 * 16) * _0x3d1710);
  const _0x5001c0 = collectLiveIds(_0x5a2cae, _0x3d4bb3);
  const _0x7f7b7 = collectLiveIds(_0x5a2cae, _0x2e89d5, _0x6d3ecf, _0x50bd75);
  const _0x5c5ba2 = [];
  for (const _0x3781e7 of _0x1c2e1c) {
    if (shouldShowGenerationBusyUi(_0x5a2cae.get(_0x3781e7))) {
      _0x5c5ba2.push(_0x3781e7);
    }
  }
  if (spatialIndex && _0x5c5ba2.length > 1) {
    _0x5c5ba2.sort((_0x2811f6, _0x5c0cba) => getSpatialNodeOrder(spatialIndex, _0x2811f6) - getSpatialNodeOrder(spatialIndex, _0x5c0cba));
  }
  const _0x19e088 = new Set(_0x5c5ba2);
  const _0x156438 = collectLiveIds(_0x5a2cae, _0x161d64);
  for (const _0x2f87d6 of _0x7f7b7) {
    _0xee9aac.add(_0x2f87d6);
  }
  const _0x5595dc = collectViewportRangeIds({
    nodeById: _0x5a2cae,
    spatialIndex: spatialIndex,
    viewport: viewport,
    width: _0x576c1b,
    height: _0x103cb9,
    padding: _0x240942.mount
  });
  const _0x3d7ce6 = [..._0x5595dc].filter(_0x6ecb2a => !_0xee9aac.has(_0x6ecb2a)).sort((_0x2c5862, _0x5e4ef3) => {
    const _0x4f094d = Number(!_0x1c2e1c.has(_0x2c5862)) - Number(!_0x1c2e1c.has(_0x5e4ef3));
    if (_0x4f094d !== 0) {
      return _0x4f094d;
    }
    const _0x5cee53 = Number(!_0x19e088.has(_0x2c5862)) - Number(!_0x19e088.has(_0x5e4ef3));
    if (_0x5cee53 !== 0) {
      return _0x5cee53;
    }
    const _0x4eb309 = Number(!_0x156438.has(_0x2c5862)) - Number(!_0x156438.has(_0x5e4ef3));
    if (_0x4eb309 !== 0) {
      return _0x4eb309;
    }
    const _0x2fa957 = Number(!_0x5001c0.has(_0x2c5862)) - Number(!_0x5001c0.has(_0x5e4ef3));
    if (_0x2fa957 !== 0) {
      return _0x2fa957;
    }
    const _0x41ac63 = _0x4a99d8(_0x2c5862) - _0x4a99d8(_0x5e4ef3);
    if (_0x41ac63 !== 0) {
      return _0x41ac63;
    }
    return getSpatialNodeOrder(spatialIndex, _0x2c5862) - getSpatialNodeOrder(spatialIndex, _0x5e4ef3);
  });
  const _0x41e360 = Math.max(0, _0x4f4bbb - _0xee9aac.size);
  for (const _0x3a6e34 of _0x3d7ce6.slice(0, _0x41e360)) {
    _0xee9aac.add(_0x3a6e34);
  }
  const _0x24df16 = collectLiveIds(_0x5a2cae, _0x18c3c8);
  const _0x1a97cd = new Set([...collectViewportRangeIds({
    nodeById: _0x5a2cae,
    spatialIndex: spatialIndex,
    viewport: viewport,
    width: _0x576c1b,
    height: _0x103cb9,
    padding: _0x240942.preview
  })].sort((_0x207485, _0xc44373) => {
    const _0x44b383 = Number(!_0x24df16.has(_0x207485)) - Number(!_0x24df16.has(_0xc44373));
    if (_0x44b383 !== 0) {
      return _0x44b383;
    }
    const _0x28d7e5 = _0x4a99d8(_0x207485) - _0x4a99d8(_0xc44373);
    if (_0x28d7e5 !== 0) {
      return _0x28d7e5;
    }
    return getSpatialNodeOrder(spatialIndex, _0x207485) - getSpatialNodeOrder(spatialIndex, _0xc44373);
  }));
  for (const _0x118f19 of _0x5595dc) {
    _0x1a97cd.add(_0x118f19);
  }
  for (const _0x23aaf7 of _0x1c2e1c) {
    _0x1a97cd.add(_0x23aaf7);
  }
  for (const _0xc897af of _0x1a97cd) {
    if (!_0xee9aac.has(_0xc897af)) {
      _0x4b8fcb.add(_0xc897af);
    }
  }
  let _0x2254df = new Set();
  if (includeParkIds !== false) {
    const _0x33f462 = collectLiveIds(_0x5a2cae, _0x302868);
    const _0x2414a2 = collectViewportRangeIds({
      nodeById: _0x5a2cae,
      spatialIndex: spatialIndex,
      viewport: viewport,
      width: _0x576c1b,
      height: _0x103cb9,
      padding: _0x240942.park
    });
    _0x2254df = new Set([..._0x5a2cae.keys()].filter(_0x300172 => !_0x2414a2.has(_0x300172)).sort((_0x21dd11, _0x24ded7) => {
      const _0x1acd45 = Number(!_0x33f462.has(_0x21dd11)) - Number(!_0x33f462.has(_0x24ded7));
      if (_0x1acd45 !== 0) {
        return _0x1acd45;
      }
      return getSpatialNodeOrder(spatialIndex, _0x21dd11) - getSpatialNodeOrder(spatialIndex, _0x24ded7);
    }));
    for (const _0x255a4f of _0x5001c0) {
      if (!isNodeInsideViewportPadding(_0x5a2cae.get(_0x255a4f), viewport, _0x576c1b, _0x103cb9, _0x240942.park)) {
        _0x2254df.add(_0x255a4f);
      }
    }
    for (const _0x580123 of _0xee9aac) {
      _0x2254df.delete(_0x580123);
    }
    for (const _0x32f6b5 of _0x4b8fcb) {
      _0x2254df.delete(_0x32f6b5);
    }
  }
  const _0x1f8226 = new Set([..._0x5001c0].filter(_0x4ad790 => !_0xee9aac.has(_0x4ad790)));
  const _0x14323b = new Set([..._0xee9aac, ..._0x4b8fcb]);
  const _0x37e33f = new Set([...toIdSet(_0x3202e2)].filter(_0x479f54 => _0xee9aac.has(_0x479f54)));
  return {
    pressure: _0x573f42,
    projectedDetail: _0x3d1710,
    padding: _0x240942,
    fullSurfaceBudget: _0x4f4bbb,
    exactVisibleIds: _0x1c2e1c,
    exactVisibleGenerationBusyIds: _0x19e088,
    fullSurfaceIds: _0xee9aac,
    proxySurfaceIds: _0x4b8fcb,
    parkIds: _0x2254df,
    fullSurfaceReleaseIds: _0x1f8226,
    presentationSurfaceIds: _0x14323b,
    plannedFullEligibleVisibleImageNodeIds: _0x37e33f,
    surfaceSignature: buildSurfaceSignature(_0xee9aac, _0x4b8fcb, _0x19e088)
  };
}