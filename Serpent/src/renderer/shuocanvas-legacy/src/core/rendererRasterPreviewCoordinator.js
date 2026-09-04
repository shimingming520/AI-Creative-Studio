import { resolveRendererPreviewNodePresentation } from "./rendererFastPreviewLayer.js";
import { createRendererRasterPreviewLayer } from "./rendererRasterPreviewLayer.js";
import { getRendererNodeLabelKind } from "./rendererNodePresentation.js";
import { planRendererRasterProxies } from "./rendererRasterProxyPolicy.js";
function toIdSet(_0x2b40a1) {
  if (_0x2b40a1 instanceof Set) {
    return new Set(_0x2b40a1);
  }
  if (Array.isArray(_0x2b40a1)) {
    return new Set(_0x2b40a1);
  }
  return new Set();
}
function defaultSupportsRasterPreview(_0x1072dd) {
  const _0x1c20bd = String(_0x1072dd?.type || "").trim().toLowerCase();
  return !["web-preview", "source-audio", "ai-audio", "audio"].includes(_0x1c20bd);
}
function getNode(_0x29fe12, _0x506652) {
  if (_0x29fe12 instanceof Map) {
    return _0x29fe12.get(_0x506652) || null;
  }
  return _0x29fe12?.[_0x506652] || null;
}
function isVisualMediaNode(_0x50080f) {
  const _0x32775c = getRendererNodeLabelKind(_0x50080f?.type);
  if (_0x32775c) {
    return _0x32775c === "image" || _0x32775c === "video";
  }
  const _0x51ac5d = String(_0x50080f?.type || "").trim().toLowerCase();
  return _0x51ac5d.includes("image") || _0x51ac5d.includes("video") || _0x51ac5d.includes("media-clip");
}
function resolveRenderScale(_0x513408, _0xafc352) {
  const _0x295b4a = Number(_0x513408?.zoom);
  const _0x3bc56c = Number(_0xafc352);
  return (Number.isFinite(_0x295b4a) && _0x295b4a > 0 ? _0x295b4a : 1) * (Number.isFinite(_0x3bc56c) && _0x3bc56c > 0 ? _0x3bc56c : 1);
}
function buildRasterVisualStateSignature(_0x33dde0, _0x564c46) {
  return [...toIdSet(_0x33dde0?.invalidNodeIds)].filter(_0x28f395 => _0x564c46.has(_0x28f395)).map(String).sort().join("");
}
function buildRasterPresentationIdentity(_0x139c0e) {
  if (!_0x139c0e || typeof _0x139c0e !== "object") {
    return "";
  }
  const _0x2167eb = resolveRendererPreviewNodePresentation(_0x139c0e, {
    displayFirst: true
  });
  const _0x5670c3 = _0x2167eb.geometry || {};
  return [_0x2167eb.kind, _0x2167eb.text, Number.isFinite(Number(_0x5670c3.x)) ? Number(_0x5670c3.x) : 0, Number.isFinite(Number(_0x5670c3.y)) ? Number(_0x5670c3.y) : 0, Math.max(1, Number(_0x5670c3.width) || 1), Math.max(1, Number(_0x5670c3.height) || 1), ..._0x2167eb.sources].join("");
}
function collectExplicitDomRequiredIds({
  selectedNodeIds: _0x4d4f36,
  hoveredNodeIds: _0x5365e8,
  hoverNodeId: _0x534fad,
  dragNodeIds: _0x30e50,
  connOverlay: _0x10cc7f,
  pickConnectMode: _0x9d2f2a,
  activeMediaNodeIds: _0x57a88b,
  domRequiredNodeIds: _0x2a6e24
} = {}) {
  const _0x62cb7d = new Set();
  for (const _0x30e568 of [_0x4d4f36, _0x5365e8, _0x30e50, _0x57a88b, _0x2a6e24]) {
    for (const _0x1dbb51 of toIdSet(_0x30e568)) {
      _0x62cb7d.add(_0x1dbb51);
    }
  }
  for (const _0x6cc956 of [_0x534fad, _0x10cc7f?.srcId, _0x10cc7f?.hoverId, _0x9d2f2a?.active ? _0x9d2f2a.sourceNodeId : null, _0x9d2f2a?.active ? _0x9d2f2a.srcId : null, _0x9d2f2a?.active ? _0x9d2f2a.hoverNodeId : null, _0x9d2f2a?.active ? _0x9d2f2a.hoverId : null]) {
    if (_0x6cc956 != null && _0x6cc956 !== "") {
      _0x62cb7d.add(_0x6cc956);
    }
  }
  for (const _0x49724a of [_0x10cc7f?.activeNodeIds, _0x9d2f2a?.active ? _0x9d2f2a.activeNodeIds : null]) {
    for (const _0x1f0926 of toIdSet(_0x49724a)) {
      _0x62cb7d.add(_0x1f0926);
    }
  }
  return _0x62cb7d;
}
export function resolveRendererRasterPreviewSources(_0x47e025) {
  return resolveRendererPreviewNodePresentation(_0x47e025, {
    displayFirst: false
  }).sources;
}
export function createRendererRasterPreviewCoordinator({
  layer = null,
  isRasterSupportedNode = defaultSupportsRasterPreview,
  isDomMediaPresented = null,
  onMediaPresented = null
} = {}) {
  const _0x13ad9d = () => createRendererRasterPreviewLayer({
    resolveMediaSources: resolveRendererRasterPreviewSources,
    onMediaPresented: onMediaPresented
  });
  let _0x1aabb9 = layer || _0x13ad9d();
  let _0x55a32f = new Set();
  let _0x3b9677 = new Set();
  let _0x499b2d = new Set();
  let _0x4b3296 = new Set();
  let _0x2b086d = new Map();
  let _0x1d8e6c = "";
  let _0x386876 = false;
  let _0x1b69ca = false;
  function _0x1534cb({
    canvasEl: _0x54d623,
    nodes: _0x58ca24,
    scenePlan: _0x9475dd,
    selectedNodeIds: _0x4f4a6d,
    hoveredNodeIds: _0x52b9aa,
    hoverNodeId: _0x6bb968,
    dragNodeIds: _0x10c57d,
    connOverlay: _0x18600c,
    pickConnectMode: _0x14f1ab,
    activeMediaNodeIds: _0x24fdaa,
    domRequiredNodeIds: _0x1929da,
    viewport: _0x19d511,
    viewportBusy = false,
    mediaLoadingBusy = viewportBusy,
    freezeRasterSurface = false,
    lockRasterParticipation = false,
    releaseFullSurface: _0x37b352,
    devicePixelRatio = typeof window !== "undefined" ? window.devicePixelRatio : 1
  } = {}) {
    _0x386876 = mediaLoadingBusy === true;
    const _0x8a085e = toIdSet(_0x9475dd?.fullSurfaceIds);
    const _0x501e9d = toIdSet(_0x9475dd?.proxySurfaceIds);
    const _0x4985c2 = toIdSet(_0x9475dd?.fullSurfaceReleaseIds);
    const _0xc3f5c2 = new Set([..._0x501e9d].filter(_0xc4b68 => isRasterSupportedNode(getNode(_0x58ca24, _0xc4b68), _0xc4b68)));
    const _0x549280 = planRendererRasterProxies({
      nodes: _0x58ca24,
      fullSurfaceIds: _0x8a085e,
      proxySurfaceIds: _0x501e9d,
      exactVisibleIds: _0x9475dd?.exactVisibleIds,
      rasterSupportedNodeIds: _0xc3f5c2,
      previousRasterIds: _0x55a32f,
      selectedNodeIds: _0x4f4a6d,
      hoveredNodeIds: _0x52b9aa,
      hoverNodeId: _0x6bb968,
      dragNodeIds: _0x10c57d,
      connOverlay: _0x18600c,
      pickConnectMode: _0x14f1ab,
      activeMediaNodeIds: _0x24fdaa,
      domRequiredNodeIds: _0x1929da,
      viewport: _0x19d511,
      scenePressure: _0x9475dd?.pressure
    });
    const _0x571817 = toIdSet(_0x9475dd?.exactVisibleIds);
    const _0x5901e3 = collectExplicitDomRequiredIds({
      selectedNodeIds: _0x4f4a6d,
      hoveredNodeIds: _0x52b9aa,
      hoverNodeId: _0x6bb968,
      dragNodeIds: _0x10c57d,
      connOverlay: _0x18600c,
      pickConnectMode: _0x14f1ab,
      activeMediaNodeIds: _0x24fdaa,
      domRequiredNodeIds: _0x1929da
    });
    const _0x53c8db = new Set([..._0x4b3296].filter(_0x51f003 => {
      if (typeof isDomMediaPresented !== "function" || _0x549280.rasterIds.has(_0x51f003) || !_0x571817.has(_0x51f003) || _0x5901e3.has(_0x51f003)) {
        return false;
      }
      const _0x3f5f64 = getNode(_0x58ca24, _0x51f003);
      if (!_0x3f5f64 || !isVisualMediaNode(_0x3f5f64)) {
        return false;
      }
      if (_0x2b086d.get(_0x51f003) !== buildRasterPresentationIdentity(_0x3f5f64)) {
        return false;
      }
      try {
        return isDomMediaPresented?.(_0x51f003, _0x3f5f64) !== true;
      } catch {
        return true;
      }
    }));
    const _0x15de83 = lockRasterParticipation === true && freezeRasterSurface === true && viewportBusy === true;
    const _0x2c8468 = _0x15de83 && _0x499b2d.size === 0 ? new Set() : _0x549280.rasterIds;
    const _0x283562 = new Set([..._0x2c8468, ..._0x53c8db]);
    const _0x1cf81a = [..._0x2c8468].filter(_0x5c14ae => _0x571817.has(_0x5c14ae));
    const _0x175507 = [..._0x499b2d].some(_0x4304ad => !_0x283562.has(_0x4304ad));
    const _0x1c1bec = buildRasterVisualStateSignature(_0x18600c, _0x549280.rasterIds);
    const _0x5405fd = _0x1c1bec !== _0x1d8e6c;
    const _0x59cfc9 = [..._0x499b2d].some(_0xd5ae98 => {
      const _0x4093c5 = getNode(_0x58ca24, _0xd5ae98);
      return !_0x4093c5 || _0x2b086d.get(_0xd5ae98) !== buildRasterPresentationIdentity(_0x4093c5);
    });
    const _0x8c74f1 = [..._0x499b2d].some(_0x3ee347 => _0x5901e3.has(_0x3ee347));
    const _0x4517a8 = freezeRasterSurface === true && viewportBusy && _0x499b2d.size > 0 && (_0x2c8468.size > 0 || _0x15de83) && !_0x5405fd && !_0x59cfc9 && !_0x8c74f1;
    const _0x5de9db = _0x5405fd || _0x59cfc9 || _0x8c74f1 || !_0x4517a8 && _0x175507;
    const _0x3a970f = _0x4517a8 ? _0x499b2d : _0x283562;
    const _0x334122 = _0x1aabb9.sync(_0x54d623, _0x58ca24, _0x3a970f, {
      forceRender: _0x5de9db,
      reuseWhileBusy: _0x4517a8 || viewportBusy && !_0x5de9db && _0x1cf81a.every(_0x4a6c83 => _0x55a32f.has(_0x4a6c83)),
      renderScale: resolveRenderScale(_0x19d511, devicePixelRatio),
      viewport: _0x19d511,
      viewportBusy: viewportBusy,
      mediaLoadingBusy: _0x386876 || _0x1b69ca,
      invalidNodeIds: _0x18600c?.invalidNodeIds,
      sourceNodeId: _0x18600c?.srcId,
      hoverNodeId: _0x18600c?.hoverId || (_0x14f1ab?.active ? _0x14f1ab.hoverNodeId : null)
    });
    const _0x406eeb = _0x334122?.supported === true && _0x334122?.active === true ? toIdSet(_0x334122.drawnNodeIds) : new Set();
    const _0x3f3f85 = _0x334122?.supported === true && _0x334122?.active === true ? toIdSet(_0x334122.drawnMediaNodeIds) : new Set();
    _0x499b2d = _0x406eeb;
    _0x4b3296 = _0x3f3f85;
    _0x2b086d = new Map([..._0x406eeb].map(_0x1e9eef => [_0x1e9eef, buildRasterPresentationIdentity(getNode(_0x58ca24, _0x1e9eef))]));
    _0x1d8e6c = _0x1c1bec;
    const _0x42de89 = new Set([...(_0x4517a8 ? _0x406eeb : _0x2c8468)].filter(_0x49ba56 => _0x406eeb.has(_0x49ba56) && (!isVisualMediaNode(getNode(_0x58ca24, _0x49ba56)) || _0x3f3f85.has(_0x49ba56)) && getNode(_0x58ca24, _0x49ba56) && !_0x5901e3.has(_0x49ba56)));
    const _0x10d29d = new Set(_0x549280.domProxyIds);
    for (const _0x363816 of _0x549280.rasterIds) {
      if (!_0x42de89.has(_0x363816) && (_0x334122?.active !== true || _0x571817.has(_0x363816))) {
        _0x10d29d.add(_0x363816);
      }
    }
    _0x55a32f = _0x42de89;
    const _0x40bc8c = new Set([..._0x8a085e, ..._0x10d29d]);
    for (const _0x177476 of _0x42de89) {
      _0x40bc8c.delete(_0x177476);
      _0x10d29d.delete(_0x177476);
    }
    const _0x2b40bf = new Set(_0x4517a8 ? [..._0x549280.rasterIds].filter(_0x3be9c6 => !_0x42de89.has(_0x3be9c6)) : []);
    const _0x2736b9 = new Set([..._0x40bc8c].filter(_0x4b84b7 => _0x571817.has(_0x4b84b7) && !_0x2b40bf.has(_0x4b84b7)));
    if (_0x4517a8) {
      for (const _0x578447 of _0x3b9677) {
        if (_0x40bc8c.has(_0x578447) && _0x571817.has(_0x578447) && !_0x3f3f85.has(_0x578447)) {
          _0x2736b9.add(_0x578447);
        }
      }
    }
    if (_0x15de83) {
      for (const _0x3e34a1 of _0x3b9677) {
        if (_0x3f3f85.has(_0x3e34a1) || !getNode(_0x58ca24, _0x3e34a1)) {
          continue;
        }
        _0x40bc8c.add(_0x3e34a1);
        _0x10d29d.add(_0x3e34a1);
        _0x2736b9.add(_0x3e34a1);
      }
    }
    _0x3b9677 = new Set(_0x2736b9);
    const _0x427dd4 = new Set([..._0x4985c2].filter(_0x4ae219 => !_0x571817.has(_0x4ae219) || !isVisualMediaNode(getNode(_0x58ca24, _0x4ae219)) || _0x42de89.has(_0x4ae219)));
    if (typeof _0x37b352 === "function") {
      for (const _0x1af650 of _0x427dd4) {
        _0x37b352(_0x1af650);
      }
    }
    return {
      active: _0x42de89.size > 0,
      rasterIds: _0x42de89,
      domProxyIds: _0x10d29d,
      domPreviewCandidateIds: _0x40bc8c,
      domPreviewMediaSourceOwnerIds: _0x2736b9,
      releasableFullSurfaceIds: _0x427dd4,
      policy: _0x549280,
      layerStats: _0x334122,
      freezeActive: _0x4517a8,
      signature: _0x549280.signature + "|claimed:" + [..._0x42de89].join("") + "|handoff:" + [..._0x53c8db].join("")
    };
  }
  function _0x47eb95() {
    _0x55a32f = new Set();
    _0x3b9677 = new Set();
    _0x499b2d = new Set();
    _0x4b3296 = new Set();
    _0x2b086d = new Map();
    _0x1d8e6c = "";
    _0x386876 = false;
    _0x1b69ca = false;
    _0x1aabb9.destroy?.();
    if (!layer) {
      _0x1aabb9 = _0x13ad9d();
    }
  }
  function _0x484c7c(_0x41b07e) {
    _0x1b69ca = _0x41b07e === true;
    return _0x1aabb9.setMediaLoadingBusy?.(_0x386876 || _0x1b69ca) || null;
  }
  function _0x35b03a(_0x36a5f3) {
    const _0x3f75ae = String(_0x36a5f3 || "").trim();
    if (!_0x3f75ae) {
      return false;
    }
    const _0x419558 = _0x499b2d.has(_0x3f75ae) || _0x4b3296.has(_0x3f75ae) || _0x55a32f.has(_0x3f75ae);
    if (typeof _0x1aabb9.excludeNode !== "function") {
      return false;
    }
    const _0x1a10c9 = _0x1aabb9.excludeNode(_0x3f75ae) === true;
    if (!_0x1a10c9 && !_0x419558) {
      return false;
    }
    _0x499b2d.delete(_0x3f75ae);
    _0x4b3296.delete(_0x3f75ae);
    _0x2b086d.delete(_0x3f75ae);
    _0x55a32f.delete(_0x3f75ae);
    return true;
  }
  return {
    sync: _0x1534cb,
    reset: _0x47eb95,
    excludeNode: _0x35b03a,
    setMediaLoadingBusy: _0x484c7c,
    getStats: () => _0x1aabb9.getStats?.() || null
  };
}