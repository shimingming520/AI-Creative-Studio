import { normalizeCanvasLocalPath, resolveCanvasVideoUrl } from "../../services/canvasMediaLocalService.js";
const NODE_GEOMETRY_KEYS = Object.freeze(["id", "x", "y", "width", "height"]);
function hasGeometryChange(_0x4623a7, _0x1dad4a) {
  return NODE_GEOMETRY_KEYS.some(_0x3f6060 => _0x4623a7?.[_0x3f6060] !== _0x1dad4a?.[_0x3f6060]);
}
function getSourceVideoSignature(_0x49d4be) {
  if (!_0x49d4be || _0x49d4be.type !== "source-video") {
    return "";
  }
  return JSON.stringify(["source-video", String(resolveCanvasVideoUrl(_0x49d4be) || ""), String(_0x49d4be.videoProxyVersion || "").trim(), normalizeCanvasLocalPath(_0x49d4be.pendingVideoProxyLocalPath), String(_0x49d4be.pendingVideoProxyVersion || "").trim()]);
}
function hasSourceVideoChange(_0x1c59b5, _0x135410) {
  return getSourceVideoSignature(_0x1c59b5) !== getSourceVideoSignature(_0x135410);
}
export function createRendererStateRevisionTracker(_0x3f4ee7) {
  function _0x441e0a(_0x167cb7) {
    _0x3f4ee7[_0x167cb7] = (_0x3f4ee7[_0x167cb7] || 0) + 1;
  }
  function _0x5a1204({
    nodes = false,
    geometry = false,
    sourceVideo = false
  } = {}) {
    if (nodes) {
      _0x441e0a("_nodesRev");
    }
    if (geometry) {
      _0x441e0a("_nodeGeometryRev");
    }
    if (sourceVideo) {
      _0x441e0a("_sourceVideoRev");
    }
  }
  function _0x560524() {
    const _0x3ea5b2 = {
      nodes: false,
      geometry: false,
      sourceVideo: false
    };
    return {
      patch(_0x1fd227, _0x3ae032) {
        _0x3ea5b2.nodes = true;
        _0x3ea5b2.geometry = _0x3ea5b2.geometry || hasGeometryChange(_0x1fd227, _0x3ae032);
        _0x3ea5b2.sourceVideo = _0x3ea5b2.sourceVideo || hasSourceVideoChange(_0x1fd227, _0x3ae032);
      },
      commit() {
        _0x5a1204(_0x3ea5b2);
      }
    };
  }
  return {
    add(_0x20be29, _0x4619a5) {
      _0x5a1204({
        nodes: true,
        geometry: true,
        sourceVideo: hasSourceVideoChange(_0x20be29, _0x4619a5)
      });
    },
    content() {
      _0x5a1204({
        nodes: true
      });
    },
    geometry() {
      _0x5a1204({
        nodes: true,
        geometry: true
      });
    },
    remove(_0x1f72a5) {
      const _0x38b168 = (_0x1f72a5 || []).map(_0x2ddf53 => _0x3f4ee7.nodes?.[_0x2ddf53]).filter(Boolean);
      if (_0x38b168.length === 0) {
        return;
      }
      _0x5a1204({
        nodes: true,
        geometry: true,
        sourceVideo: _0x38b168.some(_0x20aa22 => _0x20aa22.type === "source-video")
      });
    },
    patch(_0x196ff5, _0x4d82f8) {
      _0x5a1204({
        nodes: true,
        geometry: hasGeometryChange(_0x196ff5, _0x4d82f8),
        sourceVideo: hasSourceVideoChange(_0x196ff5, _0x4d82f8)
      });
    },
    batch: _0x560524,
    reload() {
      _0x5a1204({
        nodes: true,
        geometry: true,
        sourceVideo: true
      });
    },
    renderRequest() {
      _0x441e0a("_renderRequestRev");
    }
  };
}