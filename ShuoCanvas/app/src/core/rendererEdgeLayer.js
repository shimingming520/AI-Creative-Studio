import { MANY_EDGES_THRESHOLD, queryEdgeVisibilityIndex, shouldRenderAllEdgesAtLowZoom } from "./rendererEdgeVisibilityIndex.js";
import { screenViewportToWorldBounds } from "./rendererSpatialIndex.js";
import { screenToWorld } from "./math.js";
import { createEdgeHitSpatialIndex } from "./rendererEdgeHitIndex.js";
import { buildConnectionPathGeometry, normalizeConnectionLineStyle, resolveConnectionEndpoints } from "./edgePathGeometry.js";
const SVG_NS = "http://www.w3.org/2000/svg";
const EDGE_VIEWPORT_PADDING = 200;
export const DEFAULT_EDGE_POOL_BUCKET_COUNT = 8;
function normalizeNumber(_0x598da0, _0x11dc78 = 0) {
  const _0x3724a2 = Number(_0x598da0);
  if (Number.isFinite(_0x3724a2)) {
    return _0x3724a2;
  } else {
    return _0x11dc78;
  }
}
function normalizeBucketCount(_0x1dcee8) {
  return Math.max(1, Math.floor(normalizeNumber(_0x1dcee8, DEFAULT_EDGE_POOL_BUCKET_COUNT)));
}
export function resolveEdgePoolBucketIndex(_0x46390a, _0x34f027 = DEFAULT_EDGE_POOL_BUCKET_COUNT) {
  const _0xcad7d4 = normalizeBucketCount(_0x34f027);
  const _0x523059 = String(_0x46390a || "");
  let _0x562385 = 2166136261;
  for (let _0x40ae27 = 0; _0x40ae27 < _0x523059.length; _0x40ae27 += 1) {
    _0x562385 ^= _0x523059.charCodeAt(_0x40ae27);
    _0x562385 = Math.imul(_0x562385, 16777619);
  }
  return (_0x562385 >>> 0) % _0xcad7d4;
}
export function buildEdgePathGeometry(_0x2b5700, _0x4cbe1d, _0x4198ef = null, _0x5a98d4 = "curve") {
  if (!_0x2b5700?.id) {
    return null;
  }
  const _0x9908c0 = _0x4cbe1d?.[_0x2b5700.sourceId];
  const _0x233030 = _0x4cbe1d?.[_0x2b5700.targetId];
  if (!_0x9908c0 || !_0x233030) {
    return null;
  }
  const _0x22c3c8 = _0x4198ef?.movedNodeIds instanceof Set ? _0x4198ef.movedNodeIds : null;
  const _0x2ec485 = normalizeNumber(_0x4198ef?.dx);
  const _0x5b9550 = normalizeNumber(_0x4198ef?.dy);
  const _0x38b828 = _0x22c3c8?.has(_0x2b5700.sourceId) ? _0x2ec485 : 0;
  const _0x4448df = _0x22c3c8?.has(_0x2b5700.sourceId) ? _0x5b9550 : 0;
  const _0x50646b = _0x22c3c8?.has(_0x2b5700.targetId) ? _0x2ec485 : 0;
  const _0x5b0f08 = _0x22c3c8?.has(_0x2b5700.targetId) ? _0x5b9550 : 0;
  const _0x197bce = normalizeNumber(_0x9908c0.x) + _0x38b828;
  const _0x153037 = normalizeNumber(_0x9908c0.y) + _0x4448df;
  const _0x544935 = normalizeNumber(_0x233030.x) + _0x50646b;
  const _0x1e1c3a = normalizeNumber(_0x233030.y) + _0x5b0f08;
  const _0x5f2d0e = resolveConnectionEndpoints({
    sourceX: _0x197bce,
    sourceY: _0x153037,
    sourceWidth: _0x9908c0.width,
    sourceHeight: _0x9908c0.height,
    targetX: _0x544935,
    targetY: _0x1e1c3a,
    targetWidth: _0x233030.width,
    targetHeight: _0x233030.height
  });
  return buildConnectionPathGeometry({
    ..._0x5f2d0e,
    style: _0x5a98d4
  });
}
export function resolveEdgeVisualOwner({
  poolingEnabled = false,
  edge: _0x32cf56,
  relatedEdgeIds: _0x564322,
  movedNodeIds: _0x4e9e21,
  forcedDynamicEdgeIds: _0xbec685
} = {}) {
  if (!poolingEnabled || !_0x32cf56?.id) {
    return "individual";
  }
  if (_0x564322?.has?.(_0x32cf56.id)) {
    return "individual";
  }
  if (_0xbec685?.has?.(_0x32cf56.id)) {
    return "individual";
  }
  if (_0x4e9e21?.has?.(_0x32cf56.sourceId) || _0x4e9e21?.has?.(_0x32cf56.targetId)) {
    return "individual";
  }
  return "pooled";
}
export function buildPooledEdgeVisualBuckets(_0x481734, {
  bucketCount = DEFAULT_EDGE_POOL_BUCKET_COUNT
} = {}) {
  const _0x15543e = normalizeBucketCount(bucketCount);
  const _0x109903 = Array.from({
    length: _0x15543e
  }, (_0x3c52a5, _0x719c59) => ({
    index: _0x719c59,
    edgeIds: [],
    dParts: []
  }));
  for (const _0x211e31 of _0x481734 || []) {
    if (_0x211e31?.owner !== "pooled" || !_0x211e31.edgeId || !_0x211e31.d) {
      continue;
    }
    const _0x197764 = _0x109903[resolveEdgePoolBucketIndex(_0x211e31.edgeId, _0x15543e)];
    _0x197764.edgeIds.push(_0x211e31.edgeId);
    _0x197764.dParts.push(_0x211e31.d);
  }
  return _0x109903.map(_0x1d191d => ({
    index: _0x1d191d.index,
    edgeIds: _0x1d191d.edgeIds,
    edgeCount: _0x1d191d.edgeIds.length,
    d: _0x1d191d.dParts.join(" ")
  }));
}
function isEdgeVisible(_0x2dbd4c, _0x2681a8, _0x142578, _0x5c8c7d, _0x422039) {
  if (!_0x2dbd4c) {
    return false;
  }
  if (_0x422039) {
    return true;
  }
  const _0x1ddf23 = normalizeNumber(_0x2681a8?.zoom, 1);
  const _0x205579 = normalizeNumber(_0x2681a8?.x);
  const _0x2cde33 = normalizeNumber(_0x2681a8?.y);
  const _0x14df8b = _0x2dbd4c.startX * _0x1ddf23 + _0x205579;
  const _0x38165f = _0x2dbd4c.startY * _0x1ddf23 + _0x2cde33;
  const _0x42895f = _0x2dbd4c.endX * _0x1ddf23 + _0x205579;
  const _0x5e8ba1 = _0x2dbd4c.endY * _0x1ddf23 + _0x2cde33;
  return Math.max(_0x14df8b, _0x42895f) > -EDGE_VIEWPORT_PADDING && Math.min(_0x14df8b, _0x42895f) < _0x142578 + EDGE_VIEWPORT_PADDING && Math.max(_0x38165f, _0x5e8ba1) > -EDGE_VIEWPORT_PADDING && Math.min(_0x38165f, _0x5e8ba1) < _0x5c8c7d + EDGE_VIEWPORT_PADDING;
}
export function createRendererEdgeLayer({
  getContainerSize: _0x21bb1c,
  manyEdgesThreshold = MANY_EDGES_THRESHOLD,
  nowMs = () => typeof performance !== "undefined" && typeof performance.now === "function" ? performance.now() : Date.now(),
  poolBucketCount = DEFAULT_EDGE_POOL_BUCKET_COUNT,
  recordRedrawSample = () => {}
} = {}) {
  const _0x54829a = normalizeBucketCount(poolBucketCount);
  const _0x52869b = new Map();
  const _0xc9f822 = new Map();
  const _0x389441 = new Set();
  const _0x404b6a = Array.from({
    length: _0x54829a
  }, () => new Map());
  const _0x5ad3da = createEdgeHitSpatialIndex();
  const _0x132278 = new Set();
  const _0x31bd05 = Array.from({
    length: _0x54829a
  }, () => null);
  let _0x183dd7 = null;
  let _0x21e13a = null;
  let _0x353556 = null;
  let _0x3de29e = null;
  let _0x427aab = null;
  let _0x286f86 = {
    x: 0,
    y: 0,
    zoom: 1
  };
  let _0x2fcbe5 = false;
  let _0x1d8ac7 = "";
  let _0x28b6c7 = "";
  let _0x4e2b96 = 0;
  function _0x81fe41() {
    return _0x183dd7?.ownerDocument || globalThis.document;
  }
  function _0x292699(_0x4485a1) {
    if (!_0x4485a1 || _0x183dd7 === _0x4485a1) {
      return;
    }
    _0x40b09a(_0x183dd7);
    _0x183dd7 = _0x4485a1;
  }
  function _0x472b03() {
    if (!_0x183dd7 || !_0x2fcbe5) {
      return null;
    }
    if (!_0x21e13a || _0x21e13a.parentNode !== _0x183dd7) {
      _0x21e13a = _0x81fe41().createElementNS(SVG_NS, "g");
      _0x21e13a.id = "v2-edge-pool";
      _0x21e13a.setAttribute("class", "connection-pool");
      _0x21e13a.setAttribute("data-edge-visual-layer", "pooled");
      _0x183dd7.prepend(_0x21e13a);
    }
    for (let _0x7a5221 = 0; _0x7a5221 < _0x54829a; _0x7a5221 += 1) {
      let _0x4c2898 = _0x31bd05[_0x7a5221];
      if (_0x4c2898 && _0x4c2898.parentNode === _0x21e13a) {
        continue;
      }
      _0x4c2898 = _0x81fe41().createElementNS(SVG_NS, "path");
      _0x4c2898.id = "v2-edge-pool-" + _0x7a5221;
      _0x4c2898.setAttribute("class", "connection-main connection-pooled-main");
      _0x4c2898.setAttribute("data-edge-pool-bucket", String(_0x7a5221));
      _0x4c2898.setAttribute("d", "");
      _0x21e13a.appendChild(_0x4c2898);
      _0x31bd05[_0x7a5221] = _0x4c2898;
    }
    return _0x21e13a;
  }
  function _0x38ba71() {
    _0x21e13a?.remove?.();
    _0x21e13a = null;
    for (let _0xc630a6 = 0; _0xc630a6 < _0x31bd05.length; _0xc630a6 += 1) {
      _0x31bd05[_0xc630a6] = null;
    }
  }
  function _0xd3254c(_0x1cb12e) {
    const _0x24a165 = _0x1cb12e === true;
    if (_0x2fcbe5 === _0x24a165) {
      return;
    }
    _0x2fcbe5 = _0x24a165;
    _0x5ad3da.clear();
    for (const _0x991c1b of _0x404b6a) {
      _0x991c1b.clear();
    }
    _0x132278.clear();
    if (_0x2fcbe5) {
      _0x472b03();
      for (let _0x5ad567 = 0; _0x5ad567 < _0x54829a; _0x5ad567 += 1) {
        _0x132278.add(_0x5ad567);
      }
    } else {
      _0x38ba71();
    }
  }
  function _0x574c35(_0x2eb1fc, _0x147110, _0x51f58e) {
    const _0x34103a = resolveEdgePoolBucketIndex(_0x2eb1fc, _0x54829a);
    const _0x130e5b = _0x404b6a[_0x34103a];
    const _0x3bfd16 = _0x130e5b.get(_0x2eb1fc);
    if (_0x51f58e) {
      if (_0x3bfd16 === _0x147110) {
        return false;
      }
      _0x130e5b.set(_0x2eb1fc, _0x147110);
    } else {
      if (!_0x130e5b.has(_0x2eb1fc)) {
        return false;
      }
      _0x130e5b.delete(_0x2eb1fc);
    }
    _0x132278.add(_0x34103a);
    return true;
  }
  function _0x52810d() {
    if (!_0x2fcbe5 || _0x132278.size === 0) {
      return 0;
    }
    _0x472b03();
    let _0x49756c = 0;
    for (const _0x1285eb of _0x132278) {
      const _0x809e65 = _0x31bd05[_0x1285eb];
      if (!_0x809e65) {
        continue;
      }
      const _0x2659bc = _0x404b6a[_0x1285eb];
      const _0x565d8f = Array.from(_0x2659bc.values()).join(" ");
      if (_0x809e65.getAttribute("d") !== _0x565d8f) {
        _0x809e65.setAttribute("d", _0x565d8f);
        _0x4e2b96 += 1;
        _0x49756c += 1;
      }
      _0x809e65.setAttribute("data-pooled-edge-count", String(_0x2659bc.size));
    }
    _0x132278.clear();
    return _0x49756c;
  }
  function _0x50a180(_0x40dbd1) {
    let _0x513617 = _0x52869b.get(_0x40dbd1);
    if (_0x513617) {
      return {
        cache: _0x513617,
        created: false
      };
    }
    _0x513617 = {
      edgeId: _0x40dbd1,
      groupEl: null,
      hoverPath: null,
      pathEl: null,
      highlighted: null,
      pooled: false,
      d: "",
      geometry: null,
      order: 0
    };
    _0x52869b.set(_0x40dbd1, _0x513617);
    return {
      cache: _0x513617,
      created: true
    };
  }
  function _0xe4501e(_0x1235b0) {
    if (!_0x1235b0) {
      return null;
    }
    if (_0x1235b0.groupEl?.parentNode !== _0x183dd7) {
      const _0x49d2b9 = _0x81fe41().createElementNS(SVG_NS, "g");
      _0x49d2b9.id = "edge-group-" + _0x1235b0.edgeId;
      _0x49d2b9.setAttribute("class", "connection-group");
      _0x49d2b9.setAttribute("data-conn-id", _0x1235b0.edgeId);
      const _0x2dbd4e = _0x81fe41().createElementNS(SVG_NS, "path");
      _0x2dbd4e.setAttribute("class", "connection-bg");
      if (_0x1235b0.d) {
        _0x2dbd4e.setAttribute("d", _0x1235b0.d);
      }
      _0x49d2b9.appendChild(_0x2dbd4e);
      _0x183dd7.appendChild(_0x49d2b9);
      _0x1235b0.groupEl = _0x49d2b9;
      _0x1235b0.hoverPath = _0x2dbd4e;
    }
    return _0x1235b0.groupEl;
  }
  function _0x39b361(_0x2318d6) {
    _0xe4501e(_0x2318d6);
    if (_0x2318d6?.pathEl?.parentNode === _0x2318d6.groupEl) {
      return _0x2318d6.pathEl;
    }
    const _0x45e3ac = _0x81fe41().createElementNS(SVG_NS, "path");
    _0x45e3ac.setAttribute("class", "connection-main");
    if (_0x2318d6?.d) {
      _0x45e3ac.setAttribute("d", _0x2318d6.d);
    }
    _0x2318d6.groupEl.appendChild(_0x45e3ac);
    _0x2318d6.pathEl = _0x45e3ac;
    return _0x45e3ac;
  }
  function _0x20dfd1(_0x110db7) {
    if (!_0x110db7) {
      return false;
    }
    const _0x5b1d9b = _0x110db7.groupEl?.isConnected === true;
    _0x110db7.groupEl?.remove?.();
    _0x110db7.groupEl = null;
    _0x110db7.hoverPath = null;
    _0x110db7.pathEl = null;
    _0x110db7.highlighted = null;
    return _0x5b1d9b;
  }
  function _0x330328(_0x4453b5, _0x4b9d4f) {
    if (!_0x4453b5?.groupEl?.classList) {
      return;
    }
    const _0x1d3bc2 = _0x4453b5.groupEl.classList.contains("connection-highlighted");
    if (_0x4b9d4f && !_0x1d3bc2) {
      _0x4453b5.groupEl.classList.add("connection-highlighted");
    } else if (!_0x4b9d4f && _0x1d3bc2) {
      _0x4453b5.groupEl.classList.remove("connection-highlighted");
    }
    _0x4453b5.highlighted = _0x4b9d4f;
  }
  function _0x1cf162(_0x36e8ab, _0x3f520b, _0x3e6c03, _0x258419, _0x20a6f0, _0x1ece94 = _0x36e8ab?.order || 0) {
    const _0x232f8b = _0x258419 === "pooled";
    const _0x879625 = _0x36e8ab.d !== _0x3e6c03.d;
    _0x36e8ab.d = _0x3e6c03.d;
    _0x36e8ab.geometry = _0x3e6c03;
    _0x36e8ab.order = _0x1ece94;
    if (_0x232f8b) {
      _0x20dfd1(_0x36e8ab);
      _0x574c35(_0x3f520b.id, _0x3e6c03.d, true);
      _0x5ad3da.upsert({
        edgeId: _0x3f520b.id,
        geometry: _0x3e6c03,
        order: _0x1ece94
      });
    } else {
      _0x5ad3da.remove(_0x3f520b.id);
      _0x574c35(_0x3f520b.id, _0x3e6c03.d, false);
      _0xe4501e(_0x36e8ab);
      _0x330328(_0x36e8ab, !!_0x20a6f0?.has?.(_0x3f520b.id));
      if (_0x36e8ab.hoverPath.getAttribute("d") !== _0x3e6c03.d) {
        _0x36e8ab.hoverPath.setAttribute("d", _0x3e6c03.d);
      }
      const _0x13985c = _0x39b361(_0x36e8ab);
      if (_0x13985c.getAttribute("d") !== _0x3e6c03.d) {
        _0x13985c.setAttribute("d", _0x3e6c03.d);
      }
    }
    _0x36e8ab.pooled = _0x232f8b;
    _0xc9f822.set(_0x3f520b.id, _0x3e6c03.endpointSignature);
    return _0x879625;
  }
  function _0x149fc7(_0x1f692a) {
    const _0x2d08c9 = _0x52869b.get(_0x1f692a);
    if (!_0x2d08c9) {
      return false;
    }
    _0x5ad3da.remove(_0x1f692a);
    _0x574c35(_0x1f692a, _0x2d08c9.d, false);
    _0x2d08c9.groupEl?.remove?.();
    _0x52869b.delete(_0x1f692a);
    _0xc9f822.delete(_0x1f692a);
    _0x389441.delete(_0x1f692a);
    if (_0x1d8ac7 === _0x1f692a) {
      _0x1d8ac7 = "";
    }
    if (_0x28b6c7 === _0x1f692a) {
      _0x28b6c7 = "";
    }
    return true;
  }
  function _0x3d73b4() {
    if (!_0x183dd7) {
      return null;
    }
    if (_0x353556?.parentNode === _0x183dd7) {
      return _0x353556;
    }
    _0x353556 = _0x81fe41().createElementNS(SVG_NS, "g");
    _0x353556.id = "v2-edge-interaction-group";
    _0x353556.setAttribute("class", "connection-group connection-interaction-group");
    _0x353556.setAttribute("data-edge-visual-layer", "interaction");
    _0x3de29e = _0x81fe41().createElementNS(SVG_NS, "path");
    _0x3de29e.setAttribute("class", "connection-bg");
    _0x427aab = _0x81fe41().createElementNS(SVG_NS, "path");
    _0x427aab.id = "v2-edge-interaction-highlight";
    _0x427aab.setAttribute("class", "connection-main connection-hover-main");
    _0x353556.appendChild(_0x3de29e);
    _0x353556.appendChild(_0x427aab);
    _0x183dd7.appendChild(_0x353556);
    return _0x353556;
  }
  function _0x146b69() {
    _0x353556?.remove?.();
    _0x353556 = null;
    _0x3de29e = null;
    _0x427aab = null;
  }
  function _0x5bf652() {
    const _0x1dcd76 = _0x28b6c7 || _0x1d8ac7;
    const _0x2493dd = _0x1dcd76 ? _0x52869b.get(_0x1dcd76) : null;
    if (!_0x2fcbe5 || !_0x2493dd?.pooled || !_0x2493dd.d) {
      _0x146b69();
      return;
    }
    const _0x41b18b = _0x3d73b4();
    _0x41b18b.setAttribute("data-conn-id", _0x1dcd76);
    _0x3de29e.setAttribute("d", _0x2493dd.d);
    _0x427aab.setAttribute("d", _0x2493dd.d);
  }
  function _0x13d03a(_0x42b230, _0x14b483, _0x490d8e = 10) {
    if (!_0x2fcbe5) {
      return null;
    }
    const _0x148e18 = Math.max(0.01, normalizeNumber(_0x286f86?.zoom, 1));
    const _0x504f68 = screenToWorld(_0x42b230, _0x14b483, _0x286f86);
    return _0x5ad3da.hitTest(_0x504f68.x, _0x504f68.y, Math.max(1, normalizeNumber(_0x490d8e, 10)) / _0x148e18)?.edgeId || null;
  }
  function _0x4d630f(_0x2ace9d, _0x2de1f7) {
    return _0x2de1f7?.containerSize || _0x21bb1c?.(_0x2ace9d) || {
      containerW: 0,
      containerH: 0,
      layoutReadMs: 0
    };
  }
  function _0x53dfb4(_0x17af8c, _0x26b4fa, _0x4c7165) {
    recordRedrawSample(_0x17af8c, Math.max(0, nowMs() - _0x26b4fa), {
      ..._0x4c7165,
      ..._0x291d42()
    });
  }
  function _0x55b11c({
    svgEl: _0x201133,
    edgeIds: _0x580951,
    edges: _0x59fc6e,
    nodes: _0x563abc,
    viewport: _0x50dc6b,
    containerEl: _0x309d0f,
    dragOffsetCtx = null,
    relatedEdgeIds = null,
    options = {}
  } = {}) {
    _0x292699(_0x201133);
    const _0x46c0ca = nowMs();
    const _0x1a53e7 = nowMs();
    const _0x1242b8 = _0x50dc6b || {
      x: 0,
      y: 0,
      zoom: 1
    };
    const _0x584155 = normalizeConnectionLineStyle(options?.pathStyle);
    _0x286f86 = _0x1242b8;
    const _0x531172 = _0x4d630f(_0x309d0f, options);
    const _0x1570f9 = dragOffsetCtx?.movedNodeIds instanceof Set ? dragOffsetCtx.movedNodeIds : null;
    let _0x4a7db7 = 0;
    let _0x4f1c3f = 0;
    let _0x25fade = 0;
    let _0x46394b = 0;
    let _0x434580 = 0;
    let _0x5e5e3a = 0;
    for (const _0x3ca269 of _0x580951 || []) {
      const _0xde8d8a = _0x59fc6e?.[_0x3ca269];
      if (!_0xde8d8a) {
        continue;
      }
      const _0x470646 = buildEdgePathGeometry(_0xde8d8a, _0x563abc, dragOffsetCtx, _0x584155);
      if (!isEdgeVisible(_0x470646, _0x1242b8, _0x531172.containerW, _0x531172.containerH, false)) {
        _0x5e5e3a += 1;
        if (_0x149fc7(_0x3ca269)) {
          _0x25fade += 1;
        }
        continue;
      }
      _0x4a7db7 += 1;
      const _0x2b7c5a = _0x50a180(_0x3ca269);
      if (_0x2b7c5a.created) {
        _0x4f1c3f += 1;
      } else {
        _0x46394b += 1;
      }
      const _0x4c40d5 = resolveEdgeVisualOwner({
        poolingEnabled: _0x2fcbe5,
        edge: _0xde8d8a,
        relatedEdgeIds: relatedEdgeIds,
        movedNodeIds: _0x1570f9,
        forcedDynamicEdgeIds: _0x389441
      });
      if (_0x1cf162(_0x2b7c5a.cache, _0xde8d8a, _0x470646, _0x4c40d5, relatedEdgeIds)) {
        _0x434580 += 1;
      }
    }
    const _0x5b77e8 = nowMs();
    const _0x2b529c = _0x52810d();
    _0x5bf652();
    const _0x5dc3e2 = nowMs();
    const _0x4967e1 = _0x434580 > 0 || _0x4f1c3f > 0 || _0x25fade > 0 || _0x2b529c > 0;
    _0x53dfb4("partial", _0x46c0ca, {
      reason: options?.reason || "drag-related-edges",
      edgeCount: _0x580951?.size ?? Array.from(_0x580951 || []).length,
      visibleEdgeCount: _0x4a7db7,
      updatedCount: _0x434580,
      createdCount: _0x4f1c3f,
      removedCount: _0x25fade,
      reusedCount: _0x46394b,
      skippedInvisibleCount: _0x5e5e3a,
      cacheSize: _0x52869b.size,
      layoutReadMs: _0x531172.layoutReadMs || 0,
      pathBuildMs: Math.max(0, _0x5b77e8 - _0x1a53e7),
      domWriteMs: Math.max(0, _0x5dc3e2 - _0x5b77e8),
      clearedDom: false
    });
    return {
      mutated: _0x4967e1,
      ..._0x291d42()
    };
  }
  function _0x740c9({
    svgEl: _0xfff763,
    edges: _0x6cb703,
    nodes: _0x2aa85c,
    viewport: _0x5ce443,
    containerEl: _0x53e50b,
    dragOffsetCtx = null,
    relatedEdgeIds = null,
    edgeEntries = null,
    reason = "steady",
    options = {}
  } = {}) {
    _0x292699(_0xfff763);
    const _0xc9f4e5 = nowMs();
    const _0x489b94 = nowMs();
    const _0x166be7 = _0x5ce443 || {
      x: 0,
      y: 0,
      zoom: 1
    };
    const _0x523713 = normalizeConnectionLineStyle(options?.pathStyle);
    _0x286f86 = _0x166be7;
    const _0x19654f = _0x4d630f(_0x53e50b, options);
    const _0x26cdeb = Array.isArray(edgeEntries) ? edgeEntries : Object.values(_0x6cb703 || {});
    _0xd3254c(_0x26cdeb.length >= manyEdgesThreshold);
    _0x5ad3da.clear();
    _0x389441.clear();
    const _0x560bbb = shouldRenderAllEdgesAtLowZoom({
      edgeCount: _0x26cdeb.length,
      viewport: _0x166be7
    });
    let _0x5b2678 = _0x26cdeb;
    let _0x224e27 = null;
    if (options?.edgeVisibilityIndex && !_0x560bbb) {
      const _0x1922d4 = screenViewportToWorldBounds({
        viewport: _0x166be7,
        containerWidth: _0x19654f.containerW,
        containerHeight: _0x19654f.containerH,
        padding: EDGE_VIEWPORT_PADDING
      });
      const _0x5b9fa2 = queryEdgeVisibilityIndex(options.edgeVisibilityIndex, _0x1922d4);
      _0x224e27 = new Set(_0x5b9fa2);
      _0x5b2678 = _0x5b9fa2.map(_0x2866d4 => options.edgeVisibilityIndex.edgesById?.get?.(_0x2866d4) || _0x6cb703?.[_0x2866d4]).filter(Boolean);
    }
    const _0xde0da6 = dragOffsetCtx?.movedNodeIds instanceof Set ? dragOffsetCtx.movedNodeIds : null;
    let _0x5a1f2f = 0;
    let _0x34c498 = 0;
    let _0x446a3d = 0;
    let _0x404a0a = 0;
    let _0x30a218 = 0;
    let _0x1a5936 = 0;
    const _0x2071aa = _0x224e27;
    if (_0x2071aa) {
      _0x1a5936 += Math.max(0, _0x26cdeb.length - (_0x2071aa.size || _0x5b2678.length));
      for (const _0x5dbf12 of Array.from(_0x52869b.keys())) {
        if (_0x6cb703?.[_0x5dbf12] && _0x2071aa.has(_0x5dbf12)) {
          continue;
        }
        if (_0x149fc7(_0x5dbf12)) {
          _0x446a3d += 1;
        }
      }
    }
    let _0x24604d = 0;
    for (const _0x1bc682 of _0x5b2678) {
      const _0x2e3d43 = buildEdgePathGeometry(_0x1bc682, _0x2aa85c, dragOffsetCtx, _0x523713);
      if (!isEdgeVisible(_0x2e3d43, _0x166be7, _0x19654f.containerW, _0x19654f.containerH, _0x560bbb)) {
        _0x1a5936 += 1;
        if (_0x149fc7(_0x1bc682.id)) {
          _0x446a3d += 1;
        }
        continue;
      }
      _0x5a1f2f += 1;
      const _0x5d57b5 = _0x50a180(_0x1bc682.id);
      if (_0x5d57b5.created) {
        _0x34c498 += 1;
      } else {
        _0x404a0a += 1;
      }
      const _0x7611ac = resolveEdgeVisualOwner({
        poolingEnabled: _0x2fcbe5,
        edge: _0x1bc682,
        relatedEdgeIds: relatedEdgeIds,
        movedNodeIds: _0xde0da6
      });
      if (_0x1cf162(_0x5d57b5.cache, _0x1bc682, _0x2e3d43, _0x7611ac, relatedEdgeIds, _0x24604d)) {
        _0x30a218 += 1;
      }
      _0x24604d += 1;
    }
    const _0x45b0bc = nowMs();
    _0x52810d();
    _0x5bf652();
    const _0x548d42 = nowMs();
    _0x53dfb4("full", _0xc9f4e5, {
      reason: reason,
      edgeCount: _0x26cdeb.length,
      visibleEdgeCount: _0x5a1f2f,
      updatedCount: _0x30a218,
      createdCount: _0x34c498,
      removedCount: _0x446a3d,
      reusedCount: _0x404a0a,
      skippedInvisibleCount: _0x1a5936,
      cacheSize: _0x52869b.size,
      layoutReadMs: _0x19654f.layoutReadMs || 0,
      pathBuildMs: Math.max(0, _0x45b0bc - _0x489b94),
      domWriteMs: Math.max(0, _0x548d42 - _0x45b0bc),
      clearedDom: options?.clearedDom === true,
      renderAllLowZoomEdges: _0x560bbb
    });
    return {
      mutated: true,
      ..._0x291d42()
    };
  }
  function _0xca5417(_0x55052e) {
    let _0x1c92e1 = false;
    for (const _0x8c4433 of _0x55052e || []) {
      const _0x4d2c44 = _0x52869b.get(_0x8c4433);
      if (!_0x4d2c44) {
        continue;
      }
      _0x389441.add(_0x8c4433);
      if (!_0x4d2c44.pooled) {
        continue;
      }
      _0x5ad3da.remove(_0x8c4433);
      _0x574c35(_0x8c4433, _0x4d2c44.d, false);
      _0x39b361(_0x4d2c44);
      _0x4d2c44.pooled = false;
      _0x1c92e1 = true;
    }
    if (_0x1c92e1) {
      _0x52810d();
      _0x5bf652();
    }
    return _0x1c92e1;
  }
  function _0x8740f1(_0xdb4646, _0x2329cc) {
    const _0x5f4f9a = String(_0xdb4646 || "");
    if (_0x2329cc) {
      _0x1d8ac7 = _0x5f4f9a;
    } else if (!_0x5f4f9a || _0x1d8ac7 === _0x5f4f9a) {
      _0x1d8ac7 = "";
    }
    _0x5bf652();
  }
  function _0x226542(_0x14f2cb, _0x2b730b) {
    const _0x3eaf59 = String(_0x14f2cb || "");
    if (_0x2b730b) {
      _0x28b6c7 = _0x3eaf59;
    } else if (!_0x3eaf59 || _0x28b6c7 === _0x3eaf59) {
      _0x28b6c7 = "";
    }
    _0x5bf652();
  }
  function _0x451cd9(_0x165a87, _0x6357d8) {
    _0x292699(_0x165a87);
    let _0x13297e = 0;
    for (const _0x268e0f of Array.from(_0x52869b.keys())) {
      if (_0x6357d8?.[_0x268e0f]) {
        continue;
      }
      if (_0x149fc7(_0x268e0f)) {
        _0x13297e += 1;
      }
    }
    _0x52810d();
    for (const _0x3bdbf4 of _0x183dd7?.querySelectorAll?.("path") || []) {
      if (_0x3bdbf4.id === "v2-draft-edge") {
        continue;
      }
      if (!_0x3bdbf4.id?.startsWith?.("edge-") && !_0x3bdbf4.id?.startsWith?.("hover-edge-")) {
        continue;
      }
      const _0x226e5a = _0x3bdbf4.id.replace("hover-edge-", "").replace("edge-", "");
      if (_0x6357d8?.[_0x226e5a]) {
        continue;
      }
      _0x3bdbf4.remove();
      _0x13297e += 1;
    }
    return _0x13297e;
  }
  function _0x40b09a(_0x5e55b9 = _0x183dd7) {
    if (_0x5e55b9 && _0x183dd7 && _0x5e55b9 !== _0x183dd7) {
      return 0;
    }
    let _0x37de17 = 0;
    for (const _0x5807cb of _0x52869b.values()) {
      if (_0x5807cb.groupEl?.isConnected) {
        _0x37de17 += 1;
      }
      _0x5807cb.groupEl?.remove?.();
    }
    _0x52869b.clear();
    _0xc9f822.clear();
    _0x389441.clear();
    _0x5ad3da.clear();
    for (const _0x498c3e of _0x404b6a) {
      _0x498c3e.clear();
    }
    _0x132278.clear();
    if (_0x21e13a?.isConnected) {
      _0x37de17 += 1;
    }
    _0x38ba71();
    if (_0x353556?.isConnected) {
      _0x37de17 += 1;
    }
    _0x146b69();
    _0x2fcbe5 = false;
    _0x1d8ac7 = "";
    _0x28b6c7 = "";
    return _0x37de17;
  }
  function _0x2fb57d() {
    const _0x3106e3 = _0x40b09a(_0x183dd7);
    _0x183dd7 = null;
    _0x4e2b96 = 0;
    return _0x3106e3;
  }
  function _0x291d42() {
    let _0x1040ee = 0;
    for (const _0x1bf57d of _0x404b6a) {
      _0x1040ee += _0x1bf57d.size;
    }
    let _0x10c9f9 = 0;
    let _0x2938c2 = 0;
    for (const _0x1ba223 of _0x52869b.values()) {
      if (_0x1ba223.pathEl?.isConnected) {
        _0x10c9f9 += 1;
      }
      if (_0x1ba223.hoverPath?.isConnected) {
        _0x2938c2 += 1;
      }
    }
    if (_0x3de29e?.isConnected) {
      _0x2938c2 += 1;
    }
    return {
      poolingEnabled: _0x2fcbe5,
      pooledEdgeCount: _0x1040ee,
      pooledPathCount: _0x31bd05.filter(_0x887cbb => _0x887cbb?.isConnected).length,
      individualVisualCount: _0x10c9f9,
      interactionVisualCount: _0x427aab?.isConnected ? 1 : 0,
      hitPathCount: _0x2938c2,
      hitIndexEdgeCount: _0x5ad3da.getStats().edgeCount,
      hitIndexCellCount: _0x5ad3da.getStats().cellCount,
      dynamicEdgeCount: _0x389441.size,
      pooledPathWriteCount: _0x4e2b96
    };
  }
  return {
    cleanupEdges: _0x451cd9,
    clearRenderedEdges: _0x40b09a,
    getDomCache: () => _0x52869b,
    getStats: _0x291d42,
    hitTestEdgeAtScreenPoint: _0x13d03a,
    prepareDynamicEdges: _0xca5417,
    renderFull: _0x740c9,
    renderPartial: _0x55b11c,
    reset: _0x2fb57d,
    setActiveEdge: _0x226542,
    setHoveredEdge: _0x8740f1
  };
}