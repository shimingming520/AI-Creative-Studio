function toIdSet(_0x5c0582) {
  if (_0x5c0582 instanceof Set) {
    return new Set(_0x5c0582);
  }
  if (Array.isArray(_0x5c0582)) {
    return new Set(_0x5c0582);
  }
  return new Set();
}
function createNodeAccessor(_0x53a39e) {
  if (_0x53a39e instanceof Map) {
    return _0x1a155c => _0x53a39e.get(_0x1a155c);
  }
  if (Array.isArray(_0x53a39e)) {
    let _0x2f5028 = null;
    return _0x13bbc1 => {
      if (!_0x2f5028) {
        _0x2f5028 = new Map();
        for (const _0x4037ef of _0x53a39e) {
          if (!_0x4037ef || typeof _0x4037ef !== "object") {
            continue;
          }
          const _0x4900fb = _0x4037ef.id;
          if (_0x4900fb == null || _0x4900fb === "") {
            continue;
          }
          _0x2f5028.set(_0x4900fb, _0x4037ef);
        }
      }
      return _0x2f5028.get(_0x13bbc1);
    };
  }
  if (_0x53a39e && typeof _0x53a39e === "object") {
    return _0x9e908b => {
      if (!Object.prototype.hasOwnProperty.call(_0x53a39e, _0x9e908b)) {
        return undefined;
      }
      const _0x1e5f36 = _0x53a39e[_0x9e908b];
      if (_0x1e5f36 && typeof _0x1e5f36 === "object") {
        return _0x1e5f36;
      } else {
        return undefined;
      }
    };
  }
  return () => undefined;
}
function clampUnit(_0x2a42f9) {
  const _0x3b6475 = Number(_0x2a42f9);
  if (!Number.isFinite(_0x3b6475)) {
    return 0;
  }
  return Math.max(0, Math.min(1, _0x3b6475));
}
function smoothstep(_0x521043, _0x2ecfd7, _0x28d58c) {
  if (_0x28d58c <= _0x521043) {
    return 0;
  }
  if (_0x28d58c >= _0x2ecfd7) {
    return 1;
  }
  const _0x5c0cea = (_0x28d58c - _0x521043) / (_0x2ecfd7 - _0x521043);
  return _0x5c0cea * _0x5c0cea * (3 - _0x5c0cea * 2);
}
function addId(_0x5364f0, _0x3693b3) {
  if (_0x3693b3 != null && _0x3693b3 !== "") {
    _0x5364f0.add(_0x3693b3);
  }
}
function addIds(_0x3ebb6d, _0x4438a9) {
  for (const _0x1b6b56 of toIdSet(_0x4438a9)) {
    addId(_0x3ebb6d, _0x1b6b56);
  }
}
function collectDomRequiredIds({
  selectedNodeIds: _0x3508f1,
  hoveredNodeIds: _0x2eedb4,
  hoverNodeId: _0x3002c3,
  dragNodeIds: _0x2f7504,
  dragTargets: _0x4c9c29,
  connectingNodeIds: _0x10f65a,
  connOverlay: _0x3b9a29,
  pickNodeIds: _0x54698b,
  pickConnectMode: _0x5683b1,
  activeMediaNodeIds: _0x5841e7,
  activeNodeIds: _0x2b9dc1,
  domRequiredNodeIds: _0x3aad2c
} = {}) {
  const _0x4664bc = new Set();
  [_0x3508f1, _0x2eedb4, _0x2f7504, _0x4c9c29, _0x10f65a, _0x54698b, _0x5841e7, _0x2b9dc1, _0x3aad2c].forEach(_0x398e75 => addIds(_0x4664bc, _0x398e75));
  addId(_0x4664bc, _0x3002c3);
  addId(_0x4664bc, _0x3b9a29?.srcId);
  addId(_0x4664bc, _0x3b9a29?.hoverId);
  addIds(_0x4664bc, _0x3b9a29?.activeNodeIds);
  if (_0x5683b1?.active === true) {
    addId(_0x4664bc, _0x5683b1.sourceNodeId);
    addId(_0x4664bc, _0x5683b1.srcId);
    addId(_0x4664bc, _0x5683b1.hoverNodeId);
    addId(_0x4664bc, _0x5683b1.hoverId);
    addIds(_0x4664bc, _0x5683b1.activeNodeIds);
  }
  return _0x4664bc;
}
function isRasterSupported(_0x4d6e64, _0x436052, _0x2137b1, _0x4f4dd1) {
  if (_0x2137b1.has(_0x4d6e64)) {
    return true;
  }
  const _0x12c3c0 = String(_0x436052?.type || "").trim().toLowerCase();
  return !!_0x12c3c0 && _0x4f4dd1.has(_0x12c3c0);
}
function getProjectedMetrics(_0x29456b, _0x392a29) {
  const _0x4973a0 = Math.max(1, Number(_0x29456b?.width) || 160) * _0x392a29;
  const _0x1e3152 = Math.max(1, Number(_0x29456b?.height) || 120) * _0x392a29;
  const _0x50d663 = _0x4973a0 * _0x1e3152;
  return {
    area: _0x50d663,
    compactness: 1 - smoothstep(3000, 14000, _0x50d663)
  };
}
function buildCoverageSignature(_0x9b3806, _0x20bcc9, _0x362b40) {
  const _0x5c7945 = _0x4e8236 => [..._0x4e8236].map(String).sort();
  return ["full", ..._0x5c7945(_0x9b3806), "raster", ..._0x5c7945(_0x20bcc9), "dom", ..._0x5c7945(_0x362b40)].join("");
}
export function planRendererRasterProxies({
  nodes = [],
  fullSurfaceIds: _0x56a3cc,
  proxySurfaceIds: _0x4ce1fd,
  exactVisibleIds: _0x4116b3,
  rasterSupportedNodeIds: _0x5081d5,
  rasterSupportedNodeTypes: _0x366221,
  previousRasterIds: _0x456f8d,
  viewport: _0x208f22,
  scenePressure = 0,
  ..._0x5ddf5d
} = {}) {
  const _0x23e12a = createNodeAccessor(nodes);
  const _0x52fd54 = toIdSet(_0x56a3cc);
  const _0x3c1ad3 = new Set([...toIdSet(_0x4ce1fd)].filter(_0x4d9215 => !_0x52fd54.has(_0x4d9215)));
  const _0x26c53c = toIdSet(_0x4116b3);
  const _0xd91e53 = toIdSet(_0x5081d5);
  const _0x257391 = new Set([...toIdSet(_0x366221)].map(_0x5ed14f => String(_0x5ed14f || "").trim().toLowerCase()));
  const _0x16dc19 = toIdSet(_0x456f8d);
  const _0x30c4d8 = collectDomRequiredIds(_0x5ddf5d);
  const _0x1b3997 = new Set();
  const _0x19d095 = new Set();
  const _0x485de3 = [];
  let _0x22f6c3 = 0;
  let _0x3bac5a = 0;
  let _0xb777ba = 0;
  const _0x5ea490 = Number(_0x208f22?.zoom);
  const _0x202b57 = Number.isFinite(_0x5ea490) && _0x5ea490 > 0 ? _0x5ea490 : 1;
  for (const _0x1ac1ea of _0x3c1ad3) {
    if (_0x30c4d8.has(_0x1ac1ea)) {
      _0x19d095.add(_0x1ac1ea);
      _0x22f6c3 += 1;
      continue;
    }
    const _0x86834 = _0x23e12a(_0x1ac1ea);
    if (!isRasterSupported(_0x1ac1ea, _0x86834, _0xd91e53, _0x257391)) {
      _0x19d095.add(_0x1ac1ea);
      _0x3bac5a += 1;
      continue;
    }
    const _0x5dd924 = getProjectedMetrics(_0x86834, _0x202b57);
    if (_0x5dd924.compactness < 0.2) {
      _0x19d095.add(_0x1ac1ea);
      _0xb777ba += 1;
      continue;
    }
    _0x485de3.push({
      id: _0x1ac1ea,
      ..._0x5dd924,
      exactVisible: _0x26c53c.has(_0x1ac1ea),
      retained: _0x16dc19.has(_0x1ac1ea)
    });
  }
  const _0x41374f = clampUnit(scenePressure);
  const _0x1f1b70 = smoothstep(12, 72, _0x3c1ad3.size);
  const _0x4d9af2 = 1 - (1 - _0x41374f) * (1 - _0x1f1b70);
  const _0x26148f = _0x485de3.length > 0 ? _0x485de3.reduce((_0x1747bb, _0x588e7c) => _0x1747bb + _0x588e7c.compactness, 0) / _0x485de3.length : 0;
  const _0x3ef619 = _0x4d9af2 * _0x26148f;
  const _0xaefdd9 = smoothstep(0.32, 0.78, _0x3ef619);
  const _0x38766f = _0x16dc19.size > 0 ? 0.24 : 0.32;
  const _0x34e6f2 = Math.min(_0x485de3.length, _0x3ef619 >= _0x38766f ? _0x485de3.length : 0);
  _0x485de3.sort((_0x155bdd, _0x4de71c) => {
    const _0x4c444d = Number(!_0x155bdd.exactVisible) - Number(!_0x4de71c.exactVisible);
    if (_0x4c444d !== 0) {
      return _0x4c444d;
    }
    const _0x48c831 = _0x155bdd.compactness + (_0x155bdd.retained ? 0.08 : 0);
    const _0x426e07 = _0x4de71c.compactness + (_0x4de71c.retained ? 0.08 : 0);
    if (_0x48c831 !== _0x426e07) {
      return _0x426e07 - _0x48c831;
    }
    if (_0x155bdd.area !== _0x4de71c.area) {
      return _0x155bdd.area - _0x4de71c.area;
    }
    return String(_0x155bdd.id).localeCompare(String(_0x4de71c.id));
  });
  for (const _0x3633fa of _0x485de3.slice(0, _0x34e6f2)) {
    _0x1b3997.add(_0x3633fa.id);
  }
  for (const _0x5722b4 of _0x485de3.slice(_0x34e6f2)) {
    _0x19d095.add(_0x5722b4.id);
  }
  let _0x7e189 = "mixed-raster-dom";
  if (_0x3c1ad3.size === 0) {
    _0x7e189 = "no-proxy-candidates";
  } else if (_0x485de3.length === 0) {
    _0x7e189 = "dom-required-only";
  } else if (_0x1b3997.size === 0) {
    _0x7e189 = "below-raster-load";
  } else if (_0x19d095.size === 0) {
    _0x7e189 = "rasterized-all-proxies";
  }
  let _0x49efc8 = 0;
  for (const _0x1c5bca of _0x26c53c) {
    if (_0x52fd54.has(_0x1c5bca) || _0x1b3997.has(_0x1c5bca) || _0x19d095.has(_0x1c5bca)) {
      _0x49efc8 += 1;
    }
  }
  const _0x4d337 = buildCoverageSignature(_0x52fd54, _0x1b3997, _0x19d095);
  return {
    active: _0x1b3997.size > 0,
    rasterIds: _0x1b3997,
    domProxyIds: _0x19d095,
    reason: _0x7e189,
    signature: _0x4d337,
    coverageSignature: _0x4d337,
    stats: {
      scenePressure: _0x41374f,
      proxyPressure: _0x1f1b70,
      activationSignal: _0x3ef619,
      activationFloor: _0x38766f,
      rasterShare: _0xaefdd9,
      proxyCount: _0x3c1ad3.size,
      rasterCandidateCount: _0x485de3.length,
      rasterCount: _0x1b3997.size,
      domProxyCount: _0x19d095.size,
      interactiveDomCount: _0x22f6c3,
      unsupportedDomCount: _0x3bac5a,
      projectedDomCount: _0xb777ba,
      exactVisibleCount: _0x26c53c.size,
      exactVisibleCoveredCount: _0x49efc8,
      exactVisibleMissingCount: _0x26c53c.size - _0x49efc8
    }
  };
}