import { queryRendererSpatialIndexIds, screenViewportToWorldBounds } from "./rendererSpatialIndex.js";
export const RENDERER_VIRTUALIZATION_CONFIG = Object.freeze({
  mountPadding: 600,
  parkPadding: 900,
  denseLowZoomMountPadding: 420,
  denseLowZoomParkPadding: 650,
  denseLowZoomPreviewPadding: 1200,
  veryDenseLowZoomMountPadding: 320,
  veryDenseLowZoomParkPadding: 520,
  veryDenseLowZoomPreviewPadding: 1600,
  denseLowZoomThreshold: 0.45,
  veryDenseLowZoomThreshold: 0.32,
  denseLowZoomMaxMountCandidates: 36,
  veryDenseLowZoomMaxMountCandidates: 24,
  denseNodeCount: 80,
  veryDenseNodeCount: 120,
  settleDelayMs: 120,
  parkAfterInteractionDelayMs: 320,
  batchSize: 12,
  structuralFrameBudgetMs: 8,
  denseStructuralReconcileDelayMs: 720,
  veryDenseStructuralReconcileDelayMs: 1600,
  lowZoomViewportCommitReconcileDelayMs: 720,
  dragCommitReconcileDelayMs: 480,
  recentPinMs: 2000
});
export function resolveRendererVirtualizationTier({
  viewport: _0x4e458e,
  nodeCount = 0
} = {}) {
  const _0x57a58e = Number.isFinite(Number(_0x4e458e?.zoom)) ? Number(_0x4e458e.zoom) : 1;
  const _0x5b97b0 = Number.isFinite(Number(nodeCount)) ? Number(nodeCount) : 0;
  if (_0x57a58e <= RENDERER_VIRTUALIZATION_CONFIG.veryDenseLowZoomThreshold && _0x5b97b0 >= RENDERER_VIRTUALIZATION_CONFIG.veryDenseNodeCount) {
    return "very-dense-low-zoom";
  }
  if (_0x57a58e <= RENDERER_VIRTUALIZATION_CONFIG.denseLowZoomThreshold && _0x5b97b0 >= RENDERER_VIRTUALIZATION_CONFIG.denseNodeCount) {
    return "dense-low-zoom";
  }
  return "default";
}
export function createRendererStructuralBudget({
  batchSize = RENDERER_VIRTUALIZATION_CONFIG.batchSize,
  frameBudgetMs = RENDERER_VIRTUALIZATION_CONFIG.structuralFrameBudgetMs,
  now = () => typeof performance !== "undefined" && typeof performance.now === "function" ? performance.now() : 0
} = {}) {
  let _0x5d5a57 = batchSize;
  let _0x4a297b = 0;
  const _0x208f77 = now();
  return {
    hasBudget() {
      return _0x5d5a57 > 0 && (_0x4a297b <= 0 || !_0x208f77 || now() - _0x208f77 < frameBudgetMs);
    },
    consume() {
      _0x5d5a57 -= 1;
      _0x4a297b += 1;
    }
  };
}
export function getRendererStructuralReconcileDelayMs(_0x3eb3d5) {
  const _0x577b49 = Number(_0x3eb3d5);
  if (!Number.isFinite(_0x577b49)) {
    return 0;
  }
  if (_0x577b49 >= RENDERER_VIRTUALIZATION_CONFIG.veryDenseNodeCount) {
    return RENDERER_VIRTUALIZATION_CONFIG.veryDenseStructuralReconcileDelayMs;
  }
  if (_0x577b49 >= RENDERER_VIRTUALIZATION_CONFIG.denseNodeCount) {
    return RENDERER_VIRTUALIZATION_CONFIG.denseStructuralReconcileDelayMs;
  }
  return 0;
}
function addNodeAndChildren(_0x10c83d, _0x4a3af6, _0x89b09) {
  if (!_0x4a3af6 || _0x10c83d.has(_0x4a3af6)) {
    return;
  }
  const _0x84da83 = [_0x4a3af6];
  for (let _0xc726f7 = 0; _0xc726f7 < _0x84da83.length; _0xc726f7 += 1) {
    const _0xdd6659 = _0x84da83[_0xc726f7];
    if (!_0xdd6659 || _0x10c83d.has(_0xdd6659)) {
      continue;
    }
    _0x10c83d.add(_0xdd6659);
    const _0x51d095 = _0x89b09?.[_0xdd6659];
    if (!_0x51d095) {
      continue;
    }
    const _0x2c5b95 = _0x51d095 instanceof Set ? _0x51d095 : Array.isArray(_0x51d095) ? _0x51d095 : typeof _0x51d095[Symbol.iterator] === "function" ? _0x51d095 : [];
    for (const _0x10be3d of _0x2c5b95) {
      if (!_0x10c83d.has(_0x10be3d)) {
        _0x84da83.push(_0x10be3d);
      }
    }
  }
}
function isWebPreviewNode(_0x235e9b = {}) {
  return String(_0x235e9b?.type || "").trim().toLowerCase() === "web-preview";
}
function isPreferredLowZoomMountNode(_0x318c39 = {}) {
  const _0x15cad5 = String(_0x318c39?.type || "").trim().toLowerCase();
  return _0x15cad5 === "comment-note" || _0x15cad5 === "group" || _0x15cad5 === "web-preview";
}
function isHeavyMediaNode(_0xfc74b9 = {}) {
  const _0x4f3379 = String(_0xfc74b9?.type || "").trim().toLowerCase();
  return _0x4f3379 === "source-image" || _0x4f3379 === "ai-image" || _0x4f3379 === "source-video" || _0x4f3379 === "video" || _0x4f3379 === "ai-video" || _0x4f3379 === "source-audio" || _0x4f3379 === "audio" || _0x4f3379 === "ai-audio";
}
function getViewportWorldCenter(_0x22cc0d, _0x27b187, _0x2f6e4d) {
  const _0x5b00ce = screenViewportToWorldBounds({
    viewport: _0x22cc0d,
    containerWidth: _0x27b187,
    containerHeight: _0x2f6e4d,
    padding: 0
  });
  return {
    x: (_0x5b00ce.minX + _0x5b00ce.maxX) / 2,
    y: (_0x5b00ce.minY + _0x5b00ce.maxY) / 2
  };
}
function getNodeCenterDistanceSq(_0x252b0c = {}, _0x4957b3 = {}) {
  const _0x24ee64 = Number.isFinite(Number(_0x252b0c.x)) ? Number(_0x252b0c.x) : 0;
  const _0x266ec3 = Number.isFinite(Number(_0x252b0c.y)) ? Number(_0x252b0c.y) : 0;
  const _0xe03c0e = Math.max(1, Number(_0x252b0c.width) || 160);
  const _0x3abde4 = Math.max(1, Number(_0x252b0c.height) || 120);
  const _0x83bb5 = _0x24ee64 + _0xe03c0e / 2 - _0x4957b3.x;
  const _0x200c31 = _0x266ec3 + _0x3abde4 / 2 - _0x4957b3.y;
  return _0x83bb5 * _0x83bb5 + _0x200c31 * _0x200c31;
}
function collectViewportWebPreviewNodeIds({
  nodes: _0x41e60f,
  spatialIndex: _0x5331e9,
  viewport: _0x1a19d0,
  containerWidth: _0xeb01d2,
  containerHeight: _0x29bab9,
  padding: _0x36e558
} = {}) {
  const _0x3cd6e9 = new Set();
  if (!_0x41e60f || !_0x1a19d0) {
    return _0x3cd6e9;
  }
  if (_0x5331e9) {
    const _0x507441 = screenViewportToWorldBounds({
      viewport: _0x1a19d0,
      containerWidth: _0xeb01d2,
      containerHeight: _0x29bab9,
      padding: _0x36e558
    });
    for (const _0x5ccd03 of queryRendererSpatialIndexIds(_0x5331e9, _0x507441)) {
      if (isWebPreviewNode(_0x41e60f?.[_0x5ccd03])) {
        _0x3cd6e9.add(_0x5ccd03);
      }
    }
    return _0x3cd6e9;
  }
  for (const _0x4d59ae of Object.values(_0x41e60f || {})) {
    if (!_0x4d59ae?.id || !isWebPreviewNode(_0x4d59ae)) {
      continue;
    }
    if (isNodeInsideViewportPadding(_0x4d59ae, _0x1a19d0, _0xeb01d2, _0x29bab9, _0x36e558)) {
      _0x3cd6e9.add(_0x4d59ae.id);
    }
  }
  return _0x3cd6e9;
}
export function isNodeInsideViewportPadding(_0x988cf9, _0x11d0e1, _0x56ccd7, _0x48b106, _0x5f1cef = 0, _0x46302a = 0, _0x32b216 = 0) {
  if (!_0x988cf9 || !_0x11d0e1) {
    return false;
  }
  const _0xc2dd36 = Number.isFinite(_0x11d0e1.zoom) ? _0x11d0e1.zoom : 1;
  const _0x5219ce = Number.isFinite(_0x988cf9.x) ? _0x988cf9.x : 0;
  const _0xb86d81 = Number.isFinite(_0x988cf9.y) ? _0x988cf9.y : 0;
  const _0x3c77af = Number.isFinite(_0x988cf9.width) ? _0x988cf9.width : 0;
  const _0x354841 = Number.isFinite(_0x988cf9.height) ? _0x988cf9.height : 0;
  const _0x4aa108 = Number.isFinite(_0x46302a) ? _0x46302a : 0;
  const _0x53d2f7 = Number.isFinite(_0x32b216) ? _0x32b216 : 0;
  const _0x295753 = (_0x5219ce + _0x4aa108) * _0xc2dd36 + (Number.isFinite(_0x11d0e1.x) ? _0x11d0e1.x : 0);
  const _0x5d8c74 = (_0xb86d81 + _0x53d2f7) * _0xc2dd36 + (Number.isFinite(_0x11d0e1.y) ? _0x11d0e1.y : 0);
  const _0x4ee3df = _0x3c77af * _0xc2dd36;
  const _0x2ccb92 = _0x354841 * _0xc2dd36;
  return _0x295753 + _0x4ee3df > -_0x5f1cef && _0x295753 < _0x56ccd7 + _0x5f1cef && _0x5d8c74 + _0x2ccb92 > -_0x5f1cef && _0x5d8c74 < _0x48b106 + _0x5f1cef;
}
export function collectVirtualKeepAliveNodeIds({
  selectedNodeIds: _0x17b541,
  connOverlay: _0x17be45,
  pickConnectMode: _0xdfda42,
  dragContext: _0x191cc6,
  parentToChildren: _0x2808f1,
  pinnedNodeIds: _0x2e9d1a
} = {}) {
  const _0x10f95d = new Set();
  const _0x231579 = _0x17b541 instanceof Set ? Array.from(_0x17b541) : Array.isArray(_0x17b541) ? _0x17b541 : [];
  _0x231579.forEach(_0x4092a4 => addNodeAndChildren(_0x10f95d, _0x4092a4, _0x2808f1));
  if (_0x191cc6?.isDragging && _0x191cc6?.targetNodeId) {
    const _0x5c4e1a = _0x231579.includes(_0x191cc6.targetNodeId) ? _0x231579 : [_0x191cc6.targetNodeId];
    _0x5c4e1a.forEach(_0x4cf195 => addNodeAndChildren(_0x10f95d, _0x4cf195, _0x2808f1));
  }
  if (_0x17be45?.srcId) {
    _0x10f95d.add(_0x17be45.srcId);
  }
  if (_0x17be45?.hoverId) {
    _0x10f95d.add(_0x17be45.hoverId);
  }
  if (_0xdfda42?.sourceNodeId) {
    _0x10f95d.add(_0xdfda42.sourceNodeId);
  }
  if (_0xdfda42?.hoverNodeId) {
    _0x10f95d.add(_0xdfda42.hoverNodeId);
  }
  const _0x6ff294 = _0x2e9d1a instanceof Set ? _0x2e9d1a : Array.isArray(_0x2e9d1a) ? _0x2e9d1a : [];
  for (const _0x232e62 of _0x6ff294) {
    _0x10f95d.add(_0x232e62);
  }
  return _0x10f95d;
}
export function resolveRendererVirtualizationPadding({
  viewport: _0x298966,
  nodeCount = 0,
  mountPadding = RENDERER_VIRTUALIZATION_CONFIG.mountPadding,
  parkPadding = RENDERER_VIRTUALIZATION_CONFIG.parkPadding
} = {}) {
  const _0x2ca588 = Number.isFinite(_0x298966?.zoom) ? _0x298966.zoom : 1;
  const _0x5069cb = Number.isFinite(nodeCount) ? nodeCount : 0;
  if (_0x2ca588 <= RENDERER_VIRTUALIZATION_CONFIG.veryDenseLowZoomThreshold && _0x5069cb >= RENDERER_VIRTUALIZATION_CONFIG.veryDenseNodeCount) {
    return {
      mountPadding: RENDERER_VIRTUALIZATION_CONFIG.veryDenseLowZoomMountPadding,
      parkPadding: RENDERER_VIRTUALIZATION_CONFIG.veryDenseLowZoomParkPadding
    };
  }
  if (_0x2ca588 <= RENDERER_VIRTUALIZATION_CONFIG.denseLowZoomThreshold && _0x5069cb >= RENDERER_VIRTUALIZATION_CONFIG.denseNodeCount) {
    return {
      mountPadding: RENDERER_VIRTUALIZATION_CONFIG.denseLowZoomMountPadding,
      parkPadding: RENDERER_VIRTUALIZATION_CONFIG.denseLowZoomParkPadding
    };
  }
  return {
    mountPadding: mountPadding,
    parkPadding: parkPadding
  };
}
export function resolveRendererPreviewPadding({
  viewport: _0x865c2d,
  nodeCount = 0,
  mountPadding = RENDERER_VIRTUALIZATION_CONFIG.mountPadding,
  previewPadding = mountPadding
} = {}) {
  const _0xb887a8 = Number.isFinite(_0x865c2d?.zoom) ? _0x865c2d.zoom : 1;
  const _0x38d51a = Number.isFinite(nodeCount) ? nodeCount : 0;
  const _0x378fa1 = Number.isFinite(Number(previewPadding)) ? Number(previewPadding) : mountPadding;
  if (_0xb887a8 <= RENDERER_VIRTUALIZATION_CONFIG.veryDenseLowZoomThreshold && _0x38d51a >= RENDERER_VIRTUALIZATION_CONFIG.veryDenseNodeCount) {
    return Math.max(mountPadding, RENDERER_VIRTUALIZATION_CONFIG.veryDenseLowZoomPreviewPadding);
  }
  if (_0xb887a8 <= RENDERER_VIRTUALIZATION_CONFIG.denseLowZoomThreshold && _0x38d51a >= RENDERER_VIRTUALIZATION_CONFIG.denseNodeCount) {
    return Math.max(mountPadding, RENDERER_VIRTUALIZATION_CONFIG.denseLowZoomPreviewPadding);
  }
  return Math.max(mountPadding, _0x378fa1);
}
export function resolveRendererLowZoomMountLimit({
  viewport: _0x4f6101,
  nodeCount = 0
} = {}) {
  const _0x23bcfa = Number.isFinite(_0x4f6101?.zoom) ? _0x4f6101.zoom : 1;
  const _0xc29eeb = Number.isFinite(nodeCount) ? nodeCount : 0;
  if (_0x23bcfa <= RENDERER_VIRTUALIZATION_CONFIG.veryDenseLowZoomThreshold && _0xc29eeb >= RENDERER_VIRTUALIZATION_CONFIG.veryDenseNodeCount) {
    return RENDERER_VIRTUALIZATION_CONFIG.veryDenseLowZoomMaxMountCandidates;
  }
  if (_0x23bcfa <= RENDERER_VIRTUALIZATION_CONFIG.denseLowZoomThreshold && _0xc29eeb >= RENDERER_VIRTUALIZATION_CONFIG.denseNodeCount) {
    return RENDERER_VIRTUALIZATION_CONFIG.denseLowZoomMaxMountCandidates;
  }
  return 0;
}
function limitLowZoomMountCandidates({
  nodes: _0x5a12e3,
  mountCandidateIds: _0x6a936a,
  keepAliveNodeIds: _0xe0bfe6,
  viewport: _0x28de3a,
  containerWidth: _0x44656b,
  containerHeight: _0x55dc7c,
  limit: _0x22666e
} = {}) {
  if (!(_0x6a936a instanceof Set) || !(_0x22666e > 0)) {
    return _0x6a936a;
  }
  const _0x24e3c0 = new Set(_0xe0bfe6 || []);
  for (const _0x3b7fd7 of _0x6a936a) {
    const _0x22e95c = _0x5a12e3?.[_0x3b7fd7];
    if (isPreferredLowZoomMountNode(_0x22e95c)) {
      _0x24e3c0.add(_0x3b7fd7);
    }
  }
  const _0x5edf69 = new Set();
  for (const _0x331d74 of _0x24e3c0) {
    if (_0x6a936a.has(_0x331d74)) {
      _0x5edf69.add(_0x331d74);
    }
  }
  const _0xd337d6 = Math.max(0, Math.floor(_0x22666e) - _0x5edf69.size);
  if (_0xd337d6 <= 0) {
    return _0x5edf69;
  }
  const _0x11e133 = getViewportWorldCenter(_0x28de3a, _0x44656b, _0x55dc7c);
  const _0x9e3fbb = [];
  let _0x41c6bc = 0;
  for (const _0x2c69eb of _0x6a936a) {
    if (_0x5edf69.has(_0x2c69eb)) {
      continue;
    }
    const _0x10c41f = _0x5a12e3?.[_0x2c69eb];
    if (!_0x10c41f?.id) {
      continue;
    }
    if (isHeavyMediaNode(_0x10c41f)) {
      continue;
    }
    _0x9e3fbb.push({
      nodeId: _0x2c69eb,
      distanceSq: getNodeCenterDistanceSq(_0x10c41f, _0x11e133),
      order: _0x41c6bc
    });
    _0x41c6bc += 1;
  }
  _0x9e3fbb.sort((_0x595ab2, _0x395c0c) => _0x595ab2.distanceSq - _0x395c0c.distanceSq || _0x595ab2.order - _0x395c0c.order);
  for (const _0x4bee53 of _0x9e3fbb.slice(0, _0xd337d6)) {
    _0x5edf69.add(_0x4bee53.nodeId);
  }
  return _0x5edf69;
}
function finalizeVirtualizationCandidateSets({
  nodes: _0x2c40ee,
  nodeCount: _0x1a43da,
  mountCandidateIds: _0x58066f,
  previewCandidateIds = _0x58066f,
  parkCandidateIds: _0x139188,
  keepAliveNodeIds: _0x1be31b,
  mountedNodeIds: _0x50450d,
  viewport: _0xb16103,
  containerWidth: _0x3e1c3c,
  containerHeight: _0x337142
} = {}) {
  const _0x45f904 = resolveRendererLowZoomMountLimit({
    viewport: _0xb16103,
    nodeCount: _0x1a43da
  });
  if (!(_0x45f904 > 0)) {
    return {
      keepAliveNodeIds: _0x1be31b,
      mountCandidateIds: _0x58066f,
      previewCandidateIds: previewCandidateIds,
      parkCandidateIds: _0x139188
    };
  }
  const _0x320f46 = limitLowZoomMountCandidates({
    nodes: _0x2c40ee,
    mountCandidateIds: _0x58066f,
    keepAliveNodeIds: _0x1be31b,
    viewport: _0xb16103,
    containerWidth: _0x3e1c3c,
    containerHeight: _0x337142,
    limit: _0x45f904
  });
  const _0x4fdd18 = _0x50450d instanceof Set ? _0x50450d : Array.isArray(_0x50450d) ? new Set(_0x50450d) : new Set();
  for (const _0x149ba7 of _0x4fdd18) {
    if (!_0x149ba7 || _0x1be31b.has(_0x149ba7)) {
      continue;
    }
    if (!_0x320f46.has(_0x149ba7)) {
      _0x139188.add(_0x149ba7);
    }
  }
  for (const _0x11e562 of _0x1be31b) {
    _0x139188.delete(_0x11e562);
  }
  return {
    keepAliveNodeIds: _0x1be31b,
    mountCandidateIds: _0x320f46,
    previewCandidateIds: previewCandidateIds,
    parkCandidateIds: _0x139188
  };
}
export function buildVirtualizationCandidateSets({
  nodes: _0x5669eb,
  spatialIndex = null,
  viewport: _0x3c427a,
  containerWidth: _0x487d29,
  containerHeight: _0x25dc62,
  selectedNodeIds: _0x3d9b29,
  connOverlay: _0x3905dd,
  pickConnectMode: _0x5602cd,
  dragContext: _0x2394c8,
  parentToChildren: _0x5a4314,
  pinnedNodeIds: _0x485c49,
  mountedNodeIds: _0x2baf0e,
  mountPadding = RENDERER_VIRTUALIZATION_CONFIG.mountPadding,
  parkPadding = RENDERER_VIRTUALIZATION_CONFIG.parkPadding
} = {}) {
  const _0x505f80 = spatialIndex ? null : Object.values(_0x5669eb || {});
  const _0x196afe = spatialIndex?.nodeCount ?? _0x505f80.length;
  const _0x57478c = resolveRendererVirtualizationPadding({
    viewport: _0x3c427a,
    nodeCount: _0x196afe,
    mountPadding: mountPadding,
    parkPadding: parkPadding
  });
  const _0x4d4e0c = resolveRendererPreviewPadding({
    viewport: _0x3c427a,
    nodeCount: _0x196afe,
    mountPadding: _0x57478c.mountPadding
  });
  const _0x2bb501 = collectVirtualKeepAliveNodeIds({
    selectedNodeIds: _0x3d9b29,
    connOverlay: _0x3905dd,
    pickConnectMode: _0x5602cd,
    dragContext: _0x2394c8,
    parentToChildren: _0x5a4314,
    pinnedNodeIds: _0x485c49
  });
  for (const _0x5a73d6 of collectViewportWebPreviewNodeIds({
    nodes: _0x5669eb,
    spatialIndex: spatialIndex,
    viewport: _0x3c427a,
    containerWidth: _0x487d29,
    containerHeight: _0x25dc62,
    padding: _0x57478c.parkPadding
  })) {
    _0x2bb501.add(_0x5a73d6);
  }
  const _0x56a73a = new Set();
  const _0x217ecb = new Set();
  const _0x241801 = new Set();
  if (spatialIndex) {
    const _0x35c748 = screenViewportToWorldBounds({
      viewport: _0x3c427a,
      containerWidth: _0x487d29,
      containerHeight: _0x25dc62,
      padding: _0x57478c.mountPadding
    });
    const _0x39c15c = screenViewportToWorldBounds({
      viewport: _0x3c427a,
      containerWidth: _0x487d29,
      containerHeight: _0x25dc62,
      padding: _0x57478c.parkPadding
    });
    const _0x28e5b9 = _0x4d4e0c > _0x57478c.mountPadding ? screenViewportToWorldBounds({
      viewport: _0x3c427a,
      containerWidth: _0x487d29,
      containerHeight: _0x25dc62,
      padding: _0x4d4e0c
    }) : _0x35c748;
    const _0x22962c = queryRendererSpatialIndexIds(spatialIndex, _0x35c748);
    const _0x2a23ed = _0x28e5b9 === _0x35c748 ? _0x22962c : queryRendererSpatialIndexIds(spatialIndex, _0x28e5b9);
    const _0x354edd = queryRendererSpatialIndexIds(spatialIndex, _0x39c15c);
    for (const _0x1cd91f of _0x2bb501) {
      _0x56a73a.add(_0x1cd91f);
      _0x217ecb.add(_0x1cd91f);
    }
    for (const _0x5ec526 of _0x22962c) {
      _0x56a73a.add(_0x5ec526);
      _0x217ecb.add(_0x5ec526);
    }
    for (const _0x525197 of _0x2a23ed) {
      _0x217ecb.add(_0x525197);
    }
    const _0x27ed1c = _0x2baf0e instanceof Set ? _0x2baf0e : Array.isArray(_0x2baf0e) ? _0x2baf0e : spatialIndex.nodeIds || [];
    for (const _0x4746f0 of _0x27ed1c) {
      if (!_0x4746f0 || _0x2bb501.has(_0x4746f0)) {
        continue;
      }
      if (!_0x354edd.has(_0x4746f0)) {
        _0x241801.add(_0x4746f0);
      }
    }
    return finalizeVirtualizationCandidateSets({
      nodes: _0x5669eb,
      nodeCount: _0x196afe,
      keepAliveNodeIds: _0x2bb501,
      mountCandidateIds: _0x56a73a,
      previewCandidateIds: _0x217ecb,
      parkCandidateIds: _0x241801,
      mountedNodeIds: _0x2baf0e,
      viewport: _0x3c427a,
      containerWidth: _0x487d29,
      containerHeight: _0x25dc62
    });
  }
  for (const _0x4e9d79 of _0x505f80) {
    if (!_0x4e9d79?.id) {
      continue;
    }
    const _0x37fd37 = _0x4e9d79.id;
    if (_0x2bb501.has(_0x37fd37)) {
      _0x56a73a.add(_0x37fd37);
      _0x217ecb.add(_0x37fd37);
      continue;
    }
    const _0x38ee3e = isNodeInsideViewportPadding(_0x4e9d79, _0x3c427a, _0x487d29, _0x25dc62, _0x57478c.mountPadding);
    if (_0x38ee3e) {
      _0x56a73a.add(_0x37fd37);
      _0x217ecb.add(_0x37fd37);
      continue;
    }
    if (_0x4d4e0c > _0x57478c.mountPadding) {
      const _0x32100b = isNodeInsideViewportPadding(_0x4e9d79, _0x3c427a, _0x487d29, _0x25dc62, _0x4d4e0c);
      if (_0x32100b) {
        _0x217ecb.add(_0x37fd37);
      }
    }
    const _0x57a686 = isNodeInsideViewportPadding(_0x4e9d79, _0x3c427a, _0x487d29, _0x25dc62, _0x57478c.parkPadding);
    if (!_0x57a686) {
      _0x241801.add(_0x37fd37);
    }
  }
  return finalizeVirtualizationCandidateSets({
    nodes: _0x5669eb,
    nodeCount: _0x196afe,
    keepAliveNodeIds: _0x2bb501,
    mountCandidateIds: _0x56a73a,
    previewCandidateIds: _0x217ecb,
    parkCandidateIds: _0x241801,
    mountedNodeIds: _0x2baf0e,
    viewport: _0x3c427a,
    containerWidth: _0x487d29,
    containerHeight: _0x25dc62
  });
}
export function ensureRendererExactVisiblePreviewCandidates({
  virtualizationResult: _0x361620,
  nodes: _0x42288e,
  spatialIndex = null,
  viewport: _0x174017,
  containerWidth: _0x410af2,
  containerHeight: _0x142349,
  nodeCount: _0x3731f6
} = {}) {
  const _0x5ebf67 = Number.isFinite(Number(_0x3731f6)) ? Number(_0x3731f6) : Object.keys(_0x42288e || {}).length;
  const _0x26be54 = Number(_0x174017?.zoom);
  if (_0x5ebf67 < RENDERER_VIRTUALIZATION_CONFIG.denseNodeCount || !Number.isFinite(_0x26be54) || _0x26be54 > RENDERER_VIRTUALIZATION_CONFIG.denseLowZoomThreshold) {
    return _0x361620;
  }
  const _0x304afc = spatialIndex ? queryRendererSpatialIndexIds(spatialIndex, screenViewportToWorldBounds({
    viewport: _0x174017,
    containerWidth: _0x410af2,
    containerHeight: _0x142349,
    padding: 0
  })) : new Set(Object.values(_0x42288e || {}).filter(_0x4da4bc => _0x4da4bc?.id && isNodeInsideViewportPadding(_0x4da4bc, _0x174017, _0x410af2, _0x142349, 0)).map(_0x5265eb => _0x5265eb.id));
  const _0xe0699c = _0x361620?.previewCandidateIds || _0x361620?.mountCandidateIds || new Set();
  const _0x578850 = Array.from(_0x304afc).filter(_0x1e8f72 => !_0xe0699c.has(_0x1e8f72));
  if (_0x578850.length === 0) {
    return _0x361620;
  }
  return {
    ..._0x361620,
    previewCandidateIds: new Set([..._0xe0699c, ..._0x578850])
  };
}