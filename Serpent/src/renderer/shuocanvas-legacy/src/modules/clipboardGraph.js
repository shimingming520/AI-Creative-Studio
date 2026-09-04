const CLIPBOARD_GRAPH_SCHEMA_VERSION = 1;
function deepClone(_0x58bd8a) {
  return JSON.parse(JSON.stringify(_0x58bd8a));
}
function normalizeNodeId(_0x2ef64a) {
  return String(_0x2ef64a || "").trim();
}
function normalizeEdgeList(_0x4a5c04) {
  if (Array.isArray(_0x4a5c04)) {
    return _0x4a5c04;
  }
  if (_0x4a5c04 && typeof _0x4a5c04 === "object") {
    return Object.values(_0x4a5c04);
  }
  return [];
}
function normalizeNodeList(_0x5d3d85) {
  if (Array.isArray(_0x5d3d85)) {
    return _0x5d3d85;
  }
  if (Array.isArray(_0x5d3d85?.nodes)) {
    return _0x5d3d85.nodes;
  }
  return [];
}
export function buildClipboardGraphSnapshot({
  nodesById = {},
  edgesById = {},
  selectedIds = [],
  sanitizeNode = null
} = {}) {
  const _0xa794e5 = Array.isArray(selectedIds) ? selectedIds : [];
  const _0x26baeb = new Set();
  const _0x2b3ff3 = [];
  for (const _0xe2c685 of _0xa794e5) {
    const _0x45ced5 = normalizeNodeId(_0xe2c685);
    if (!_0x45ced5 || _0x26baeb.has(_0x45ced5)) {
      continue;
    }
    const _0x20afb9 = nodesById?.[_0x45ced5];
    if (!_0x20afb9 || typeof _0x20afb9 !== "object") {
      continue;
    }
    const _0x36f025 = deepClone(_0x20afb9);
    const _0x4eb544 = typeof sanitizeNode === "function" ? sanitizeNode(_0x36f025) : _0x36f025;
    if (!_0x4eb544 || typeof _0x4eb544 !== "object") {
      continue;
    }
    _0x26baeb.add(_0x45ced5);
    _0x2b3ff3.push(_0x4eb544);
  }
  const _0x2b5499 = [];
  for (const _0x2825d3 of normalizeEdgeList(edgesById)) {
    if (!_0x2825d3 || typeof _0x2825d3 !== "object") {
      continue;
    }
    const _0x3bb09e = normalizeNodeId(_0x2825d3.sourceId);
    const _0x5a6efe = normalizeNodeId(_0x2825d3.targetId);
    if (!_0x3bb09e || !_0x5a6efe) {
      continue;
    }
    if (!_0x26baeb.has(_0x3bb09e) || !_0x26baeb.has(_0x5a6efe)) {
      continue;
    }
    _0x2b5499.push(deepClone(_0x2825d3));
  }
  return {
    schemaVersion: CLIPBOARD_GRAPH_SCHEMA_VERSION,
    nodes: _0x2b3ff3,
    edges: _0x2b5499
  };
}
export function normalizeClipboardGraphPayload(_0x3e9abf) {
  const _0x1b4633 = normalizeNodeList(_0x3e9abf).filter(_0x217481 => _0x217481 && typeof _0x217481 === "object");
  const _0x3e725d = normalizeEdgeList(_0x3e9abf?.edges).filter(_0x52564a => _0x52564a && typeof _0x52564a === "object");
  if (_0x1b4633.length === 0) {
    return null;
  }
  return {
    schemaVersion: CLIPBOARD_GRAPH_SCHEMA_VERSION,
    nodes: deepClone(_0x1b4633),
    edges: deepClone(_0x3e725d)
  };
}
export function prepareClipboardGraphPaste({
  graph: _0x56c21b,
  x = 0,
  y = 0,
  generateNodeId = null,
  generateEdgeId = null,
  sanitizeNode = null
} = {}) {
  const _0x1a8591 = normalizeClipboardGraphPayload(_0x56c21b);
  if (!_0x1a8591) {
    return {
      nodes: [],
      edges: [],
      newIds: [],
      idMap: {}
    };
  }
  const _0x2be493 = Number.isFinite(Number(x)) ? Number(x) : 0;
  const _0x2a9e28 = Number.isFinite(Number(y)) ? Number(y) : 0;
  let _0x284199 = Infinity;
  let _0x497ae6 = Infinity;
  for (const _0x5d3a24 of _0x1a8591.nodes) {
    const _0x4e81d9 = Number(_0x5d3a24.x);
    const _0x53b9e4 = Number(_0x5d3a24.y);
    if (Number.isFinite(_0x4e81d9)) {
      _0x284199 = Math.min(_0x284199, _0x4e81d9);
    }
    if (Number.isFinite(_0x53b9e4)) {
      _0x497ae6 = Math.min(_0x497ae6, _0x53b9e4);
    }
  }
  if (!Number.isFinite(_0x284199)) {
    _0x284199 = 0;
  }
  if (!Number.isFinite(_0x497ae6)) {
    _0x497ae6 = 0;
  }
  const _0x33bd5a = {};
  const _0x3a91a5 = [];
  const _0x577491 = [];
  const _0x410c41 = Date.now() + "_" + Math.random().toString(36).slice(2, 7);
  _0x1a8591.nodes.forEach((_0xfbea1d, _0x7df7c8) => {
    const _0x1b520b = deepClone(_0xfbea1d);
    const _0x3e981e = normalizeNodeId(_0x1b520b.id) || "clipboard-node-" + _0x7df7c8;
    const _0x5d7760 = typeof generateNodeId === "function" ? generateNodeId(_0x3e981e, _0x7df7c8, _0x1b520b) : _0x3e981e + "_copy_" + _0x410c41 + "_" + _0x7df7c8;
    const _0x4ddbec = Number(_0x1b520b.x);
    const _0x34e043 = Number(_0x1b520b.y);
    const _0x198bfb = Number.isFinite(_0x4ddbec) ? _0x4ddbec - _0x284199 : 0;
    const _0xdfae7c = Number.isFinite(_0x34e043) ? _0x34e043 - _0x497ae6 : 0;
    _0x1b520b.id = _0x5d7760;
    _0x1b520b.x = _0x2be493 + _0x198bfb;
    _0x1b520b.y = _0x2a9e28 + _0xdfae7c;
    const _0x2cfe88 = typeof sanitizeNode === "function" ? sanitizeNode(_0x1b520b) : _0x1b520b;
    if (!_0x2cfe88 || typeof _0x2cfe88 !== "object") {
      return;
    }
    _0x33bd5a[_0x3e981e] = _0x5d7760;
    _0x3a91a5.push(_0x2cfe88);
    _0x577491.push(_0x5d7760);
  });
  for (const _0x1faf32 of _0x3a91a5) {
    const _0x22f318 = normalizeNodeId(_0x1faf32.parentId);
    if (!_0x22f318) {
      continue;
    }
    if (_0x33bd5a[_0x22f318]) {
      _0x1faf32.parentId = _0x33bd5a[_0x22f318];
    }
  }
  const _0x14c287 = [];
  _0x1a8591.edges.forEach((_0x496906, _0x29c1c1) => {
    const _0x2e3203 = normalizeNodeId(_0x496906.sourceId);
    const _0x3d6655 = normalizeNodeId(_0x496906.targetId);
    const _0x226a62 = _0x33bd5a[_0x2e3203];
    const _0x22eb10 = _0x33bd5a[_0x3d6655];
    if (!_0x226a62 || !_0x22eb10) {
      return;
    }
    const _0x4f5d1d = typeof generateEdgeId === "function" ? generateEdgeId(normalizeNodeId(_0x496906.id), _0x29c1c1, _0x496906) : "edge_copy_" + _0x410c41 + "_" + _0x29c1c1;
    _0x14c287.push({
      ...deepClone(_0x496906),
      id: _0x4f5d1d,
      sourceId: _0x226a62,
      targetId: _0x22eb10
    });
  });
  return {
    nodes: _0x3a91a5,
    edges: _0x14c287,
    newIds: _0x577491,
    idMap: _0x33bd5a
  };
}