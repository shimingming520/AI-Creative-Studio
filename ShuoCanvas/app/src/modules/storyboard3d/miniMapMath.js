function finite(_0x33665e, _0x6d8a3d = 0) {
  const _0x3b4aa8 = Number(_0x33665e);
  if (Number.isFinite(_0x3b4aa8)) {
    return _0x3b4aa8;
  } else {
    return _0x6d8a3d;
  }
}
function clamp(_0x3f65a0, _0x1ffa60, _0x344510) {
  return Math.max(_0x1ffa60, Math.min(_0x344510, _0x3f65a0));
}
function rotateMiniMapVector(_0x594651, _0x5e9acb, _0x2b7b33 = 0) {
  const _0x390bdc = finite(_0x2b7b33);
  const _0x4969a4 = Math.cos(_0x390bdc);
  const _0x2626ed = Math.sin(_0x390bdc);
  return {
    x: _0x594651 * _0x4969a4 - _0x5e9acb * _0x2626ed,
    z: _0x594651 * _0x2626ed + _0x5e9acb * _0x4969a4
  };
}
export function createStoryboard3DMiniMapProjection({
  worldBounds = {
    minX: -10,
    maxX: 10,
    minZ: -10,
    maxZ: 10
  },
  viewport = {
    x: 0,
    y: 0,
    width: 240,
    height: 180
  },
  padding = 12,
  center = null,
  rotation = 0
} = {}) {
  const _0x4283ff = finite(worldBounds.minX, -10);
  const _0x29a9fa = Math.max(_0x4283ff + 0.000001, finite(worldBounds.maxX, 10));
  const _0x2e3571 = finite(worldBounds.minZ, -10);
  const _0x2c2de1 = Math.max(_0x2e3571 + 0.000001, finite(worldBounds.maxZ, 10));
  const _0x3aca27 = {
    x: finite(viewport.x),
    y: finite(viewport.y),
    width: Math.max(1, finite(viewport.width, 240)),
    height: Math.max(1, finite(viewport.height, 180))
  };
  const _0x1ba609 = clamp(finite(padding, 12), 0, Math.min(_0x3aca27.width, _0x3aca27.height) / 2);
  const _0x20da24 = Math.max(1, _0x3aca27.width - _0x1ba609 * 2);
  const _0x40f448 = Math.max(1, _0x3aca27.height - _0x1ba609 * 2);
  const _0x14a143 = {
    x: finite(center?.x, (_0x4283ff + _0x29a9fa) / 2),
    z: finite(center?.z, (_0x2e3571 + _0x2c2de1) / 2)
  };
  const _0x45e5e4 = finite(rotation);
  const _0x547ceb = [{
    x: _0x4283ff,
    z: _0x2e3571
  }, {
    x: _0x4283ff,
    z: _0x2c2de1
  }, {
    x: _0x29a9fa,
    z: _0x2e3571
  }, {
    x: _0x29a9fa,
    z: _0x2c2de1
  }].map(_0x1dd5bc => rotateMiniMapVector(_0x1dd5bc.x - _0x14a143.x, _0x1dd5bc.z - _0x14a143.z, _0x45e5e4));
  const _0x3d4070 = Math.min(..._0x547ceb.map(_0x5ebb92 => _0x5ebb92.x));
  const _0x539d0e = Math.max(..._0x547ceb.map(_0x305e55 => _0x305e55.x));
  const _0x4464d2 = Math.min(..._0x547ceb.map(_0xbab2a7 => _0xbab2a7.z));
  const _0xfa08e = Math.max(..._0x547ceb.map(_0x479e72 => _0x479e72.z));
  const _0x5a17fb = Math.max(0.000001, _0x539d0e - _0x3d4070);
  const _0x76f69c = Math.max(0.000001, _0xfa08e - _0x4464d2);
  const _0x1719dd = Math.min(_0x20da24 / _0x5a17fb, _0x40f448 / _0x76f69c);
  const _0x45b3d2 = _0x5a17fb * _0x1719dd;
  const _0x474038 = _0x76f69c * _0x1719dd;
  return {
    worldBounds: {
      minX: _0x4283ff,
      maxX: _0x29a9fa,
      minZ: _0x2e3571,
      maxZ: _0x2c2de1
    },
    viewport: _0x3aca27,
    scale: _0x1719dd,
    worldCenter: _0x14a143,
    rotation: _0x45e5e4,
    originX: _0x3aca27.x + _0x3aca27.width / 2,
    originY: _0x3aca27.y + _0x3aca27.height / 2,
    contentWidth: _0x45b3d2,
    contentHeight: _0x474038
  };
}
export function projectStoryboard3DWorldToMiniMap(_0x1e59d0, _0x23a0c0) {
  const _0x3f776a = rotateMiniMapVector(finite(_0x1e59d0?.x) - finite(_0x23a0c0?.worldCenter?.x), finite(_0x1e59d0?.z) - finite(_0x23a0c0?.worldCenter?.z), _0x23a0c0?.rotation);
  return {
    x: _0x23a0c0.originX + _0x3f776a.x * _0x23a0c0.scale,
    y: _0x23a0c0.originY + _0x3f776a.z * _0x23a0c0.scale
  };
}
export function projectStoryboard3DWorldToMiniMapRatio(_0x80ff12, _0x270b77) {
  const _0x56870d = projectStoryboard3DWorldToMiniMap(_0x80ff12, _0x270b77);
  const _0x2f28ba = _0x270b77?.viewport || {};
  const _0x30e949 = Math.max(1e-8, finite(_0x2f28ba.width, 1));
  const _0x3988c = Math.max(1e-8, finite(_0x2f28ba.height, 1));
  return {
    x: (_0x56870d.x - finite(_0x2f28ba.x)) / _0x30e949,
    y: (_0x56870d.y - finite(_0x2f28ba.y)) / _0x3988c
  };
}
export function projectStoryboard3DTopViewFootprint(_0x552c37, _0x32eafc) {
  const _0x137f27 = (Array.isArray(_0x552c37) ? _0x552c37 : []).map(_0x3609d8 => projectStoryboard3DWorldToMiniMapRatio(_0x3609d8, _0x32eafc)).filter(_0x55911d => Number.isFinite(_0x55911d.x) && Number.isFinite(_0x55911d.y));
  if (_0x137f27.length < 3) {
    return null;
  }
  const _0x2dc86b = Math.min(..._0x137f27.map(_0x552e2e => _0x552e2e.x));
  const _0x2a81f9 = Math.max(..._0x137f27.map(_0x477b8a => _0x477b8a.x));
  const _0x3310f1 = Math.min(..._0x137f27.map(_0x4e252e => _0x4e252e.y));
  const _0x3046bf = Math.max(..._0x137f27.map(_0x5886de => _0x5886de.y));
  const _0x2f7e72 = Math.max(1e-8, _0x2a81f9 - _0x2dc86b);
  const _0x14987d = Math.max(1e-8, _0x3046bf - _0x3310f1);
  return {
    left: _0x2dc86b,
    top: _0x3310f1,
    width: _0x2f7e72,
    height: _0x14987d,
    centerX: _0x2dc86b + _0x2f7e72 / 2,
    centerY: _0x3310f1 + _0x14987d / 2,
    polygon: _0x137f27.map(_0x5daf58 => ({
      x: (_0x5daf58.x - _0x2dc86b) / _0x2f7e72,
      y: (_0x5daf58.y - _0x3310f1) / _0x14987d
    }))
  };
}
export function unprojectStoryboard3DMiniMapToWorld(_0x2c37f3, _0x577fbb, {
  y = 0,
  clampToBounds = true
} = {}) {
  const _0x26a140 = {
    x: (finite(_0x2c37f3?.x) - _0x577fbb.originX) / _0x577fbb.scale,
    z: (finite(_0x2c37f3?.y) - _0x577fbb.originY) / _0x577fbb.scale
  };
  const _0x2f3de4 = rotateMiniMapVector(_0x26a140.x, _0x26a140.z, -finite(_0x577fbb?.rotation));
  let _0x3303f5 = finite(_0x577fbb?.worldCenter?.x) + _0x2f3de4.x;
  let _0x2446af = finite(_0x577fbb?.worldCenter?.z) + _0x2f3de4.z;
  if (clampToBounds) {
    _0x3303f5 = clamp(_0x3303f5, _0x577fbb.worldBounds.minX, _0x577fbb.worldBounds.maxX);
    _0x2446af = clamp(_0x2446af, _0x577fbb.worldBounds.minZ, _0x577fbb.worldBounds.maxZ);
  }
  return {
    x: _0x3303f5,
    y: finite(y),
    z: _0x2446af
  };
}
export function createStoryboard3DMiniMapCameraMarker(_0x3bdf73, _0x53561c) {
  const _0x4f3047 = _0x3bdf73?.position || {
    x: 0,
    y: 0,
    z: 0
  };
  const _0x46a14b = _0x3bdf73?.target || {
    x: _0x4f3047.x,
    y: _0x4f3047.y,
    z: _0x4f3047.z - 1
  };
  const _0x3ef8d3 = finite(_0x46a14b.x) - finite(_0x4f3047.x);
  const _0x24c7c9 = finite(_0x46a14b.z) - finite(_0x4f3047.z);
  return {
    ...projectStoryboard3DWorldToMiniMap(_0x4f3047, _0x53561c),
    angle: Math.atan2(_0x24c7c9, _0x3ef8d3) + finite(_0x53561c?.rotation)
  };
}
export function hitTestStoryboard3DMiniMapObjects(_0x4043eb, _0x171d11, _0x2821dc, {
  radius = 8
} = {}) {
  const _0x517b92 = Math.max(1, finite(radius, 8));
  let _0x1e914e = null;
  for (const _0x20a54d of _0x171d11 || []) {
    if (_0x20a54d?.visible === false) {
      continue;
    }
    const _0x4b62ce = projectStoryboard3DWorldToMiniMap({
      x: _0x20a54d?.transform?.position?.[0] ?? _0x20a54d?.position?.x,
      z: _0x20a54d?.transform?.position?.[2] ?? _0x20a54d?.position?.z
    }, _0x2821dc);
    const _0x82c895 = Math.hypot(_0x4b62ce.x - finite(_0x4043eb?.x), _0x4b62ce.y - finite(_0x4043eb?.y));
    if (_0x82c895 <= _0x517b92 && (!_0x1e914e || _0x82c895 < _0x1e914e.distance)) {
      _0x1e914e = {
        objectId: String(_0x20a54d.id || ""),
        distance: _0x82c895,
        point: _0x4b62ce
      };
    }
  }
  return _0x1e914e;
}
export function computeStoryboard3DMiniMapObjectDrag(_0x51ed60, _0x211995, _0x498df4) {
  const _0x258389 = _0x211995?.transform?.position || [0, 0, 0];
  const _0x23d2ca = unprojectStoryboard3DMiniMapToWorld(_0x51ed60, _0x498df4, {
    y: _0x258389[1]
  });
  return {
    ..._0x211995.transform,
    position: [_0x23d2ca.x, _0x23d2ca.y, _0x23d2ca.z]
  };
}
export function moveStoryboard3DMiniMapWindow(_0x448e4d, _0x42bcfa, _0xd73680 = {}) {
  const _0x56677e = normalizeStoryboard3DMiniMapState(_0x448e4d);
  const _0x4b67d9 = Math.max(0, finite(_0xd73680.width, _0x56677e.width) - _0x56677e.width);
  const _0x3af167 = Math.max(0, finite(_0xd73680.height, _0x56677e.height) - _0x56677e.height);
  return {
    ..._0x56677e,
    windowPosition: {
      x: clamp(_0x56677e.windowPosition.x + finite(_0x42bcfa?.x), 0, _0x4b67d9),
      y: clamp(_0x56677e.windowPosition.y + finite(_0x42bcfa?.y), 0, _0x3af167)
    }
  };
}
export function normalizeStoryboard3DMiniMapState(_0x5ebfc6 = {}) {
  return {
    collapsed: _0x5ebfc6.collapsed === true,
    windowPosition: {
      x: finite(_0x5ebfc6.windowPosition?.x, 16),
      y: finite(_0x5ebfc6.windowPosition?.y, 16)
    },
    width: clamp(finite(_0x5ebfc6.width, 240), 160, 640),
    height: clamp(finite(_0x5ebfc6.height, 180), 120, 480),
    zoom: clamp(finite(_0x5ebfc6.zoom, 1), 0.25, 8),
    pan: {
      x: finite(_0x5ebfc6.pan?.x),
      z: finite(_0x5ebfc6.pan?.z)
    }
  };
}
export function setStoryboard3DMiniMapExpanded(_0x120824, _0x24da2c) {
  return {
    ...normalizeStoryboard3DMiniMapState(_0x120824),
    collapsed: _0x24da2c !== true
  };
}
export function zoomStoryboard3DMiniMapState(_0x441c86, _0x20fdb9) {
  const _0x4d2798 = normalizeStoryboard3DMiniMapState(_0x441c86);
  return {
    ..._0x4d2798,
    zoom: clamp(_0x4d2798.zoom * Math.max(0.01, finite(_0x20fdb9, 1)), 0.25, 8)
  };
}
export function panStoryboard3DMiniMapState(_0x214f29, _0x434ebe, _0x27be51) {
  const _0x3664ba = normalizeStoryboard3DMiniMapState(_0x214f29);
  const _0x4c9484 = Math.max(1e-8, finite(_0x27be51?.scale, 1));
  return {
    ..._0x3664ba,
    pan: {
      x: _0x3664ba.pan.x - finite(_0x434ebe?.x) / _0x4c9484,
      z: _0x3664ba.pan.z - finite(_0x434ebe?.y) / _0x4c9484
    }
  };
}
export function createStoryboard3DMiniMapProjectionFromState({
  worldBounds: _0x153665,
  viewport: _0x3b3cb7,
  padding: _0x46b8b6,
  state: _0x1692b3
} = {}) {
  const _0x307176 = normalizeStoryboard3DMiniMapState(_0x1692b3);
  const _0xea9352 = {
    minX: finite(_0x153665?.minX, -10),
    maxX: finite(_0x153665?.maxX, 10),
    minZ: finite(_0x153665?.minZ, -10),
    maxZ: finite(_0x153665?.maxZ, 10)
  };
  const _0x6c203b = (_0xea9352.minX + _0xea9352.maxX) / 2 + _0x307176.pan.x;
  const _0x1c1abd = (_0xea9352.minZ + _0xea9352.maxZ) / 2 + _0x307176.pan.z;
  const _0x1c4942 = Math.max(0.000001, (_0xea9352.maxX - _0xea9352.minX) / 2 / _0x307176.zoom);
  const _0x9fc32 = Math.max(0.000001, (_0xea9352.maxZ - _0xea9352.minZ) / 2 / _0x307176.zoom);
  return createStoryboard3DMiniMapProjection({
    worldBounds: {
      minX: _0x6c203b - _0x1c4942,
      maxX: _0x6c203b + _0x1c4942,
      minZ: _0x1c1abd - _0x9fc32,
      maxZ: _0x1c1abd + _0x9fc32
    },
    viewport: _0x3b3cb7,
    padding: _0x46b8b6
  });
}