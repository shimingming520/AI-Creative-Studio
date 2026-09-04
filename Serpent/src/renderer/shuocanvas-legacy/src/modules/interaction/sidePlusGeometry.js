import { findClosestNode } from "../../core/math.js";
import { isNodeType } from "../registry.js";
export function createGroupSidePlusCandidateIdCache() {
  let _0x460d31 = null;
  let _0x1bf114 = -1;
  let _0x58fc84 = [];
  return {
    get(_0x10b0af, _0x5e9be5) {
      const _0x159459 = Number.isFinite(_0x5e9be5) ? _0x5e9be5 : -1;
      if (_0x10b0af === _0x460d31 && _0x159459 === _0x1bf114) {
        return _0x58fc84;
      }
      _0x460d31 = _0x10b0af || null;
      _0x1bf114 = _0x159459;
      _0x58fc84 = [];
      for (const [_0x58d13e, _0x1430bc] of Object.entries(_0x10b0af || {})) {
        if (!isNodeType(_0x1430bc, "group")) {
          continue;
        }
        const _0x3129f3 = String(_0x1430bc?.id || _0x58d13e || "").trim();
        if (_0x3129f3) {
          _0x58fc84.push(_0x3129f3);
        }
      }
      return _0x58fc84;
    }
  };
}
function getClosestResultDistanceSq(_0x36039b, _0xbaf953, _0x174bde) {
  const _0x2f0d4b = _0xbaf953 - Number(_0x36039b?.screenRect?.cx || 0);
  const _0x999e11 = _0x174bde - Number(_0x36039b?.screenRect?.cy || 0);
  return _0x2f0d4b * _0x2f0d4b + _0x999e11 * _0x999e11;
}
function getSpatialNodeOrder(_0x3989c9, _0x5e2fd7) {
  return _0x3989c9?.nodeRects?.get?.(_0x5e2fd7)?.order ?? Infinity;
}
export function findClosestNodeWithGeometryOverrides({
  screenX: _0x35b9d5,
  screenY: _0x3f65ab,
  nodes: _0x2a9ea7,
  geometryNodes = _0x2a9ea7,
  overrideNodeIds = [],
  viewport: _0x32df99,
  spatialIndex: _0x32387e,
  ignoreGroup = false
} = {}) {
  const _0x125b35 = Array.isArray(overrideNodeIds) ? overrideNodeIds.filter(_0x28035f => !!geometryNodes?.[_0x28035f]).sort((_0xf93f93, _0x951cf9) => getSpatialNodeOrder(_0x32387e, _0xf93f93) - getSpatialNodeOrder(_0x32387e, _0x951cf9)) : [];
  if (_0x125b35.length === 0) {
    return findClosestNode(_0x35b9d5, _0x3f65ab, _0x2a9ea7, _0x32df99, ignoreGroup, {
      spatialIndex: _0x32387e
    });
  }
  const _0x7970eb = new Set(_0x125b35);
  const _0x2d22f0 = findClosestNode(_0x35b9d5, _0x3f65ab, _0x2a9ea7, _0x32df99, ignoreGroup, {
    spatialIndex: _0x32387e,
    candidateFilter: (_0x21107d, _0x3721d6) => !_0x7970eb.has(_0x3721d6)
  });
  const _0x449d1a = Object.create(null);
  for (const _0x275004 of _0x125b35) {
    _0x449d1a[_0x275004] = geometryNodes[_0x275004];
  }
  const _0x125c88 = findClosestNode(_0x35b9d5, _0x3f65ab, _0x449d1a, _0x32df99, ignoreGroup);
  if (!_0x2d22f0) {
    return _0x125c88;
  }
  if (!_0x125c88) {
    return _0x2d22f0;
  }
  const _0x30483e = getSpatialNodeOrder(_0x32387e, _0x2d22f0.nodeId);
  const _0x9597d6 = getSpatialNodeOrder(_0x32387e, _0x125c88.nodeId);
  if (_0x2d22f0.isInside && _0x125c88.isInside) {
    if (_0x9597d6 < _0x30483e) {
      return _0x125c88;
    } else {
      return _0x2d22f0;
    }
  }
  if (_0x2d22f0.isInside !== _0x125c88.isInside) {
    if (_0x125c88.isInside) {
      return _0x125c88;
    } else {
      return _0x2d22f0;
    }
  }
  const _0x295fd6 = getClosestResultDistanceSq(_0x2d22f0, _0x35b9d5, _0x3f65ab);
  const _0x849ef5 = getClosestResultDistanceSq(_0x125c88, _0x35b9d5, _0x3f65ab);
  if (_0x295fd6 !== _0x849ef5) {
    if (_0x849ef5 < _0x295fd6) {
      return _0x125c88;
    } else {
      return _0x2d22f0;
    }
  }
  if (_0x9597d6 < _0x30483e) {
    return _0x125c88;
  } else {
    return _0x2d22f0;
  }
}