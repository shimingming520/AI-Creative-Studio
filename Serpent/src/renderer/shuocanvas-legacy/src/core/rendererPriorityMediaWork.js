import { isNodeType } from "../modules/registry.js";
import { resolveCanvasAudioUrl, resolveCanvasVideoDisplayUrl, resolveCanvasVideoPosterUrl, resolveCanvasVideoUrl } from "../services/canvasMediaLocalService.js";
import { isNodeInsideViewportPadding, RENDERER_VIRTUALIZATION_CONFIG, resolveRendererLowZoomMountLimit } from "./rendererVirtualization.js";
const PRIORITY_MEDIA_TYPES = Object.freeze(["source-video", "video", "ai-video", "source-audio", "audio", "ai-audio"]);
const PRIORITY_VIDEO_TYPES = Object.freeze(["source-video", "video", "ai-video"]);
function hasResolvedVideo(_0x45a5b6) {
  if (!isNodeType(_0x45a5b6, PRIORITY_VIDEO_TYPES)) {
    return false;
  }
  if (resolveCanvasVideoDisplayUrl(_0x45a5b6)) {
    return true;
  }
  const _0x4a31f3 = Array.isArray(_0x45a5b6?.videos) ? _0x45a5b6.videos : [];
  return _0x4a31f3.some(_0x261ad3 => !!resolveCanvasVideoDisplayUrl(_0x261ad3));
}
export function resolveRendererLowZoomRealVideoNodeIds({
  nodes: _0x53a981,
  candidateNodeIds: _0xe37f45,
  selectedNodeIds: _0x215b66,
  priorityNodeIds: _0x1e05cd,
  viewport: _0x326f74,
  nodeCount = 0,
  containerWidth: _0x4f0b1c,
  containerHeight: _0x30aaa1
} = {}) {
  const _0x3a77f3 = new Set();
  const _0x29aa82 = resolveRendererLowZoomMountLimit({
    viewport: _0x326f74,
    nodeCount: nodeCount
  });
  if (_0x29aa82 <= 0) {
    return _0x3a77f3;
  }
  const _0x4b3c68 = _0x53a981 && typeof _0x53a981 === "object" ? _0x53a981 : {};
  const _0x2328f1 = _0xe37f45 instanceof Set ? _0xe37f45 : new Set(_0xe37f45 || []);
  const _0x3f8b65 = _0x215b66 instanceof Set ? Array.from(_0x215b66) : Array.isArray(_0x215b66) ? _0x215b66 : [];
  for (const _0x58bf06 of _0x3f8b65) {
    const _0x36f2f7 = _0x4b3c68[_0x58bf06];
    if (!_0x2328f1.has(_0x58bf06) || !hasResolvedVideo(_0x36f2f7)) {
      continue;
    }
    _0x3a77f3.add(_0x58bf06);
  }
  const _0xe6bed1 = Number(_0x4f0b1c);
  const _0x5135e5 = Number(_0x30aaa1);
  if (!(_0xe6bed1 > 0) || !(_0x5135e5 > 0) || _0x3a77f3.size >= _0x29aa82) {
    return _0x3a77f3;
  }
  const _0x3e4caa = _0x1e05cd instanceof Set ? _0x1e05cd : new Set(_0x1e05cd || []);
  for (const _0x4b82f0 of _0x3e4caa) {
    if (_0x3a77f3.has(_0x4b82f0) || !_0x2328f1.has(_0x4b82f0)) {
      continue;
    }
    const _0x33c45c = _0x4b3c68[_0x4b82f0];
    if (!hasResolvedVideo(_0x33c45c) || !isNodeInsideViewportPadding(_0x33c45c, _0x326f74, _0xe6bed1, _0x5135e5, 0)) {
      continue;
    }
    _0x3a77f3.add(_0x4b82f0);
    if (_0x3a77f3.size >= _0x29aa82) {
      return _0x3a77f3;
    }
  }
  for (const _0xdbafae of _0x2328f1) {
    if (_0x3a77f3.has(_0xdbafae)) {
      continue;
    }
    const _0x568f99 = _0x4b3c68[_0xdbafae];
    if (!hasResolvedVideo(_0x568f99) || !isNodeInsideViewportPadding(_0x568f99, _0x326f74, _0xe6bed1, _0x5135e5, 0)) {
      continue;
    }
    _0x3a77f3.add(_0xdbafae);
    if (_0x3a77f3.size >= _0x29aa82) {
      break;
    }
  }
  return _0x3a77f3;
}
export function syncRendererPendingSourceVideoActivationIds({
  nodes: _0x131ea4,
  sourceKeysByNodeId: _0x4f35f1,
  pendingNodeIds: _0x3c22d4,
  isPresented: _0x14d03d,
  scanNodes = true
} = {}) {
  const _0x1e53ed = _0x131ea4 && typeof _0x131ea4 === "object" ? _0x131ea4 : {};
  const _0x1f8c44 = _0x4f35f1 instanceof Map ? _0x4f35f1 : new Map();
  const _0x5ece9a = _0x3c22d4 instanceof Set ? _0x3c22d4 : new Set();
  if (scanNodes !== false) {
    const _0x49e85f = new Set();
    for (const [_0x555f35, _0x34fe66] of Object.entries(_0x1e53ed)) {
      if (!_0x555f35 || !isNodeType(_0x34fe66, "source-video")) {
        continue;
      }
      _0x49e85f.add(_0x555f35);
      const _0x48f822 = String(resolveCanvasVideoUrl(_0x34fe66) || "").trim();
      const _0x1703aa = String(_0x1f8c44.get(_0x555f35) || "").trim();
      if (_0x48f822 && _0x48f822 !== _0x1703aa) {
        _0x5ece9a.add(_0x555f35);
      } else if (!_0x48f822) {
        _0x5ece9a.delete(_0x555f35);
      }
      _0x1f8c44.set(_0x555f35, _0x48f822);
    }
    for (const _0x11f1ba of _0x1f8c44.keys()) {
      if (_0x49e85f.has(_0x11f1ba)) {
        continue;
      }
      _0x1f8c44.delete(_0x11f1ba);
      _0x5ece9a.delete(_0x11f1ba);
    }
  }
  if (typeof _0x14d03d === "function") {
    for (const _0x14a430 of Array.from(_0x5ece9a)) {
      const _0x53cbee = String(_0x1f8c44.get(_0x14a430) || "").trim();
      if (!_0x53cbee || _0x14d03d(_0x14a430, _0x53cbee) === true) {
        _0x5ece9a.delete(_0x14a430);
      }
    }
  }
  return _0x5ece9a;
}
export function applyRendererLowZoomRealVideoCandidates(_0x54c649, _0x49741d) {
  if (!(_0x49741d instanceof Set) || _0x49741d.size === 0) {
    return _0x54c649;
  }
  const _0x3d1c14 = new Set(_0x54c649?.mountCandidateIds);
  const _0x3218ae = new Set(_0x54c649?.parkCandidateIds);
  for (const _0x34dc01 of _0x49741d) {
    _0x3d1c14.add(_0x34dc01);
    _0x3218ae.delete(_0x34dc01);
  }
  return {
    ..._0x54c649,
    mountCandidateIds: _0x3d1c14,
    parkCandidateIds: _0x3218ae
  };
}
function hasResolvedPriorityMedia(_0xf4f0fb) {
  if (!isNodeType(_0xf4f0fb, PRIORITY_MEDIA_TYPES)) {
    return false;
  }
  if (isNodeType(_0xf4f0fb, ["source-audio", "audio", "ai-audio"])) {
    return !!resolveCanvasAudioUrl(_0xf4f0fb);
  }
  return hasResolvedVideo(_0xf4f0fb);
}
function collectActiveNodeIds({
  selectedNodeIds: _0x1b6ced,
  connOverlay: _0x19db70,
  pickConnectMode: _0x4e0314
} = {}) {
  const _0x1e85d2 = new Set(_0x1b6ced instanceof Set ? _0x1b6ced : Array.isArray(_0x1b6ced) ? _0x1b6ced : []);
  [_0x19db70?.srcId, _0x19db70?.hoverId, _0x4e0314?.sourceNodeId, _0x4e0314?.srcId, _0x4e0314?.hoverNodeId, _0x4e0314?.hoverId].forEach(_0x526346 => {
    if (_0x526346) {
      _0x1e85d2.add(_0x526346);
    }
  });
  return _0x1e85d2;
}
export function hasRendererPriorityMediaWork({
  nodes: _0x1f3b38,
  selectedNodeIds: _0x2ccd73,
  connOverlay: _0x1ed652,
  pickConnectMode: _0x12f13f,
  viewport: _0x4112a4,
  containerWidth: _0x477bb5,
  containerHeight: _0x5c4812,
  viewportPadding = 200
} = {}) {
  const _0xc28763 = _0x1f3b38 && typeof _0x1f3b38 === "object" ? _0x1f3b38 : {};
  const _0x3e5917 = collectActiveNodeIds({
    selectedNodeIds: _0x2ccd73,
    connOverlay: _0x1ed652,
    pickConnectMode: _0x12f13f
  });
  for (const _0x16e2f5 of _0x3e5917) {
    if (hasResolvedPriorityMedia(_0xc28763[_0x16e2f5])) {
      return true;
    }
  }
  const _0x16d8ff = Number(_0x477bb5);
  const _0x1330a7 = Number(_0x5c4812);
  if (!_0x4112a4 || !(_0x16d8ff > 0) || !(_0x1330a7 > 0)) {
    return false;
  }
  return Object.values(_0xc28763).some(_0x2f2f10 => hasResolvedPriorityMedia(_0x2f2f10) && isNodeInsideViewportPadding(_0x2f2f10, _0x4112a4, _0x16d8ff, _0x1330a7, viewportPadding));
}
export function createRendererPriorityMediaWorkResolver({
  getContainerSize: _0x50e17e
} = {}) {
  return (_0x4a6cb6, _0x2ce97e = _0x4a6cb6?.viewport) => {
    const {
      width: _0x5d1469,
      height: _0x34e152
    } = _0x50e17e?.() || {};
    return hasRendererPriorityMediaWork({
      nodes: _0x4a6cb6?.nodes,
      selectedNodeIds: _0x4a6cb6?.selectedNodeIds,
      connOverlay: _0x4a6cb6?.connOverlay,
      pickConnectMode: _0x4a6cb6?.pickConnectMode,
      viewport: _0x2ce97e,
      containerWidth: _0x5d1469,
      containerHeight: _0x34e152
    });
  };
}
export function createRendererPriorityMediaFrameResolver({
  snapshot: _0x49abd5,
  viewport = _0x49abd5?.viewport,
  resolvePriorityMediaWork: _0x4c8e13
} = {}) {
  let _0x5add48 = false;
  let _0x32f3cd = false;
  return ({
    needed = true
  } = {}) => {
    if (!needed) {
      return false;
    }
    if (!_0x5add48) {
      _0x32f3cd = _0x4c8e13?.(_0x49abd5, viewport) === true;
      _0x5add48 = true;
    }
    return _0x32f3cd;
  };
}
export function shouldDeferInitialVideoMediaOnMount({
  node: _0x3b2b18,
  nodeId: _0x26f735,
  isSelected: _0x315686,
  isSelectionRelated: _0x50961b,
  dragTargets: _0x312190,
  nodeCount = 0,
  mountCandidateCount = 0
} = {}) {
  if (!_0x26f735 || !isNodeType(_0x3b2b18, ["source-video", "video", "ai-video"])) {
    return false;
  }
  if (_0x315686 || _0x50961b || _0x312190?.has?.(_0x26f735)) {
    return false;
  }
  return Number(nodeCount || 0) >= RENDERER_VIRTUALIZATION_CONFIG.veryDenseNodeCount || Number(mountCandidateCount || 0) >= 12;
}
export function shouldEagerPosterlessSourceVideoOnMount({
  node: _0x46e015,
  isVisibleVideoMediaNode: _0x8c3665
} = {}) {
  if (!_0x8c3665 || !isNodeType(_0x46e015, "source-video")) {
    return false;
  }
  return !!resolveCanvasVideoUrl(_0x46e015) && !resolveCanvasVideoPosterUrl(_0x46e015);
}
export const __rendererPriorityMediaWorkForTest = {
  hasResolvedPriorityMedia: hasResolvedPriorityMedia
};