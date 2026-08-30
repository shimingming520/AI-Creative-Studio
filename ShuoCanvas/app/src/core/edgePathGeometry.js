export const CONNECTION_LINE_STYLES = Object.freeze({
  CURVE: "curve",
  ORTHOGONAL: "orthogonal",
  STRAIGHT: "straight"
});
const CONNECTION_ROUTE_CLEARANCE = 60;
export function normalizeConnectionLineStyle(_0x13d25f) {
  const _0x52876f = String(_0x13d25f || "").trim();
  if (_0x52876f === CONNECTION_LINE_STYLES.ORTHOGONAL || _0x52876f === CONNECTION_LINE_STYLES.STRAIGHT) {
    return _0x52876f;
  } else {
    return CONNECTION_LINE_STYLES.CURVE;
  }
}
function normalizeNumber(_0x5a5e92, _0xa47bad = 0) {
  const _0x2e05a5 = Number(_0x5a5e92);
  if (Number.isFinite(_0x2e05a5)) {
    return _0x2e05a5;
  } else {
    return _0xa47bad;
  }
}
export function resolveConnectionEndpoints({
  sourceX: _0x5de0d8,
  sourceY: _0x69a83,
  sourceWidth: _0x265bb7,
  sourceHeight: _0x2bf0c5,
  targetX: _0x1291b8,
  targetY: _0x1e316,
  targetHeight: _0x41cf51
} = {}) {
  const _0x39efc1 = normalizeNumber(_0x5de0d8);
  const _0x3a5dca = normalizeNumber(_0x69a83);
  const _0x5c45c3 = Math.max(0, normalizeNumber(_0x265bb7));
  const _0x10225d = Math.max(0, normalizeNumber(_0x2bf0c5));
  const _0x3ce2eb = normalizeNumber(_0x1291b8);
  const _0x1931fa = normalizeNumber(_0x1e316);
  const _0x3d6df1 = Math.max(0, normalizeNumber(_0x41cf51));
  const _0x8b603a = _0x39efc1 + _0x5c45c3;
  const _0xc7bd7a = _0x3a5dca + _0x10225d / 2;
  const _0x2774cd = _0x3ce2eb;
  const _0x35286b = _0x1931fa + _0x3d6df1 / 2;
  let _0x4573c4 = null;
  if (_0x2774cd < _0x8b603a) {
    const _0x5455ef = _0x3a5dca + _0x10225d;
    const _0x10312e = _0x1931fa + _0x3d6df1;
    if (_0x5455ef <= _0x1931fa) {
      _0x4573c4 = (_0x5455ef + _0x1931fa) / 2;
    } else if (_0x10312e <= _0x3a5dca) {
      _0x4573c4 = (_0x10312e + _0x3a5dca) / 2;
    } else {
      const _0x5898da = Math.min(_0x3a5dca, _0x1931fa) - CONNECTION_ROUTE_CLEARANCE;
      const _0xefe296 = Math.max(_0x5455ef, _0x10312e) + CONNECTION_ROUTE_CLEARANCE;
      const _0x15f742 = Math.abs(_0xc7bd7a - _0x5898da) + Math.abs(_0x35286b - _0x5898da);
      const _0x5a55f1 = Math.abs(_0xc7bd7a - _0xefe296) + Math.abs(_0x35286b - _0xefe296);
      _0x4573c4 = _0x5a55f1 <= _0x15f742 ? _0xefe296 : _0x5898da;
    }
  }
  return {
    startX: _0x8b603a,
    startY: _0xc7bd7a,
    startSide: "right",
    endX: _0x2774cd,
    endY: _0x35286b,
    endSide: "left",
    orthogonalRouteY: _0x4573c4
  };
}
export function buildConnectionPathGeometry({
  startX: _0x6a036,
  startY: _0xbb1cd9,
  endX: _0x4dac0a,
  endY: _0x59bebc,
  style: _0x1b23d3,
  startSide = "right",
  endSide = "left",
  orthogonalRouteY: _0xe5421e,
  curveOffset: _0x2ae5d8
} = {}) {
  const _0x3b0222 = normalizeNumber(_0x6a036);
  const _0x3b1d92 = normalizeNumber(_0xbb1cd9);
  const _0x47bf71 = normalizeNumber(_0x4dac0a);
  const _0x7ce1a3 = normalizeNumber(_0x59bebc);
  const _0x4f26b3 = normalizeConnectionLineStyle(_0x1b23d3);
  const _0x84cf40 = _0x3b0222.toFixed(1) + "," + _0x3b1d92.toFixed(1) + "," + _0x47bf71.toFixed(1) + "," + _0x7ce1a3.toFixed(1);
  if (_0x4f26b3 === CONNECTION_LINE_STYLES.STRAIGHT) {
    return {
      pathStyle: _0x4f26b3,
      startX: _0x3b0222,
      startY: _0x3b1d92,
      startSide: startSide,
      endX: _0x47bf71,
      endY: _0x7ce1a3,
      endSide: endSide,
      hitPoints: [{
        x: _0x3b0222,
        y: _0x3b1d92
      }, {
        x: _0x47bf71,
        y: _0x7ce1a3
      }],
      d: "M " + _0x3b0222 + " " + _0x3b1d92 + " L " + _0x47bf71 + " " + _0x7ce1a3,
      endpointSignature: _0x84cf40
    };
  }
  if (_0x4f26b3 === CONNECTION_LINE_STYLES.ORTHOGONAL) {
    const _0x2f7ce1 = startSide === "right" && endSide === "left" && _0x47bf71 < _0x3b0222;
    if (_0x2f7ce1) {
      const _0x473bef = _0x3b0222 + CONNECTION_ROUTE_CLEARANCE;
      const _0x12b650 = _0x47bf71 - CONNECTION_ROUTE_CLEARANCE;
      const _0x1c8690 = Number.isFinite(Number(_0xe5421e)) ? Number(_0xe5421e) : (_0x3b1d92 + _0x7ce1a3) / 2;
      return {
        pathStyle: _0x4f26b3,
        startX: _0x3b0222,
        startY: _0x3b1d92,
        startSide: startSide,
        endX: _0x47bf71,
        endY: _0x7ce1a3,
        endSide: endSide,
        hitPoints: [{
          x: _0x3b0222,
          y: _0x3b1d92
        }, {
          x: _0x473bef,
          y: _0x3b1d92
        }, {
          x: _0x473bef,
          y: _0x1c8690
        }, {
          x: _0x12b650,
          y: _0x1c8690
        }, {
          x: _0x12b650,
          y: _0x7ce1a3
        }, {
          x: _0x47bf71,
          y: _0x7ce1a3
        }],
        d: "M " + _0x3b0222 + " " + _0x3b1d92 + " H " + _0x473bef + " V " + _0x1c8690 + " H " + _0x12b650 + " V " + _0x7ce1a3 + " H " + _0x47bf71,
        endpointSignature: _0x84cf40
      };
    }
    const _0xda596a = (_0x3b0222 + _0x47bf71) / 2;
    return {
      pathStyle: _0x4f26b3,
      startX: _0x3b0222,
      startY: _0x3b1d92,
      startSide: startSide,
      endX: _0x47bf71,
      endY: _0x7ce1a3,
      endSide: endSide,
      hitPoints: [{
        x: _0x3b0222,
        y: _0x3b1d92
      }, {
        x: _0xda596a,
        y: _0x3b1d92
      }, {
        x: _0xda596a,
        y: _0x7ce1a3
      }, {
        x: _0x47bf71,
        y: _0x7ce1a3
      }],
      d: "M " + _0x3b0222 + " " + _0x3b1d92 + " H " + _0xda596a + " V " + _0x7ce1a3 + " H " + _0x47bf71,
      endpointSignature: _0x84cf40
    };
  }
  const _0x423184 = Math.max(Math.abs(_0x47bf71 - _0x3b0222) * 0.5, 60);
  const _0x40fb74 = Number.isFinite(Number(_0x2ae5d8)) ? Math.max(0, Number(_0x2ae5d8)) : _0x423184;
  const _0x50c58b = startSide === "left" ? -1 : 1;
  const _0x35a98b = _0x3b0222 + _0x50c58b * _0x40fb74;
  const _0x8fd1ee = _0x47bf71 - _0x50c58b * _0x40fb74;
  return {
    pathStyle: _0x4f26b3,
    startX: _0x3b0222,
    startY: _0x3b1d92,
    startSide: startSide,
    control1X: _0x35a98b,
    control1Y: _0x3b1d92,
    control2X: _0x8fd1ee,
    control2Y: _0x7ce1a3,
    endX: _0x47bf71,
    endY: _0x7ce1a3,
    endSide: endSide,
    hitPoints: null,
    d: "M " + _0x3b0222 + " " + _0x3b1d92 + " C " + _0x35a98b + " " + _0x3b1d92 + ", " + _0x8fd1ee + " " + _0x7ce1a3 + ", " + _0x47bf71 + " " + _0x7ce1a3,
    endpointSignature: _0x84cf40
  };
}