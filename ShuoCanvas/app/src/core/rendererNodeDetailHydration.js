import { isNodeType } from "../modules/registry.js";
export const NODE_DETAIL_DEFERRED_CLASS = "v2-node-detail-deferred";
const NODE_DETAIL_LOW_ZOOM_THRESHOLD = 0.45;
const NODE_DETAIL_DEFERRED_STAGE = "deferred";
const NODE_DETAIL_HYDRATED_STAGE = "hydrated";
const NODE_DETAIL_HYDRATION_BATCH_SIZE = 2;
const NODE_DETAIL_DEFER_VISIBLE_COUNT = 32;
const NODE_DETAIL_DEFER_GENERATION_MEDIA_NODE_COUNT = 120;
const NODE_DETAIL_HYDRATION_BUSY_RETRY_MS = 120;
const NODE_DETAIL_HYDRATION_FALLBACK_MS = 48;
const NODE_DETAIL_HYDRATION_IDLE_TIMEOUT_MS = 180;
export function createNodeDetailHydrationController({
  getWrapper: _0x30729c,
  getParkedWrapper: _0x51ebe4,
  getWrappers: _0x1c632e,
  getParkedWrappers: _0x310115,
  isMounted: _0x50e8a4,
  isInteractionBusy: _0x571493,
  onHydrateNodeDetails: _0x2297f7,
  isVideoNodeDetails: _0x247d3f,
  canHydrateVideoDetails: _0x2e9082
} = {}) {
  let _0x165541 = [];
  let _0x53e390 = new Set();
  let _0x221fe7 = null;
  let _0x2bf7ab = "";
  function _0x4bb728() {
    if (_0x221fe7 === null) {
      return;
    }
    if (_0x2bf7ab === "idle" && typeof cancelIdleCallback === "function") {
      cancelIdleCallback(_0x221fe7);
    } else if (_0x2bf7ab === "timeout") {
      clearTimeout(_0x221fe7);
    }
    _0x221fe7 = null;
    _0x2bf7ab = "";
  }
  function _0x4bb37d(_0x923ab3, _0x424272 = _0x30729c?.(_0x923ab3)) {
    if (!_0x923ab3 || !_0x424272) {
      return;
    }
    const _0x61661 = _0x424272.classList.contains(NODE_DETAIL_DEFERRED_CLASS) || _0x424272.dataset?.detailStage === NODE_DETAIL_DEFERRED_STAGE;
    if (!_0x61661 && _0x424272.dataset?.detailStage === NODE_DETAIL_HYDRATED_STAGE) {
      return;
    }
    _0x53e390.delete(_0x923ab3);
    _0x424272.classList.remove(NODE_DETAIL_DEFERRED_CLASS);
    if (_0x424272.dataset) {
      _0x424272.dataset.detailStage = NODE_DETAIL_HYDRATED_STAGE;
    }
    _0x2297f7?.(_0x923ab3, _0x424272);
  }
  function _0x1ecb38(_0x11b084) {
    return _0x11b084?.classList?.contains?.(NODE_DETAIL_DEFERRED_CLASS) || _0x11b084?.dataset?.detailStage === NODE_DETAIL_DEFERRED_STAGE;
  }
  function _0x1ef311() {
    if (_0x221fe7 !== null) {
      return;
    }
    if (_0x571493?.()) {
      _0x2bf7ab = "timeout";
      _0x221fe7 = setTimeout(() => _0x2472d5(), NODE_DETAIL_HYDRATION_BUSY_RETRY_MS);
      return;
    }
    if (_0x165541.length >= NODE_DETAIL_HYDRATION_BATCH_SIZE * 3) {
      _0x2bf7ab = "timeout";
      _0x221fe7 = setTimeout(() => _0x2472d5(), NODE_DETAIL_HYDRATION_FALLBACK_MS);
      return;
    }
    if (typeof requestIdleCallback === "function") {
      _0x2bf7ab = "idle";
      _0x221fe7 = requestIdleCallback(_0x2472d5, {
        timeout: NODE_DETAIL_HYDRATION_IDLE_TIMEOUT_MS
      });
      return;
    }
    _0x2bf7ab = "timeout";
    _0x221fe7 = setTimeout(() => _0x2472d5(), NODE_DETAIL_HYDRATION_FALLBACK_MS);
  }
  function _0x2472d5(_0x585453 = null) {
    _0x221fe7 = null;
    _0x2bf7ab = "";
    if (_0x571493?.()) {
      _0x1ef311();
      return;
    }
    let _0x45bd17 = 0;
    const _0x38716c = () => {
      if (!_0x585453 || _0x585453.didTimeout) {
        return true;
      }
      if (typeof _0x585453.timeRemaining !== "function") {
        return true;
      }
      return _0x585453.timeRemaining() > 2;
    };
    while (_0x165541.length > 0 && _0x45bd17 < NODE_DETAIL_HYDRATION_BATCH_SIZE && _0x38716c()) {
      const _0x12d2f4 = _0x165541.findIndex(_0x11c945 => {
        if (!_0x53e390.has(_0x11c945)) {
          return true;
        }
        if (typeof _0x247d3f !== "function" || !_0x247d3f(_0x11c945)) {
          return true;
        }
        return typeof _0x2e9082 !== "function" || _0x2e9082(_0x11c945) === true;
      });
      if (_0x12d2f4 < 0) {
        break;
      }
      const [_0x4dd6d1] = _0x165541.splice(_0x12d2f4, 1);
      if (!_0x53e390.delete(_0x4dd6d1)) {
        continue;
      }
      const _0x15ac63 = _0x30729c?.(_0x4dd6d1);
      if (!_0x15ac63 || !_0x50e8a4?.(_0x4dd6d1) || !_0x15ac63.isConnected) {
        continue;
      }
      const _0x597824 = _0x247d3f?.(_0x4dd6d1) === true;
      _0x4bb37d(_0x4dd6d1, _0x15ac63);
      _0x45bd17 += 1;
      if (_0x597824) {
        break;
      }
    }
    if (_0x165541.length > 0) {
      _0x1ef311();
    }
  }
  function _0x22c1aa(_0x37911b) {
    if (!_0x37911b || _0x53e390.has(_0x37911b)) {
      return;
    }
    _0x53e390.add(_0x37911b);
    _0x165541.push(_0x37911b);
    _0x1ef311();
  }
  function _0x34f873() {
    if (_0x165541.length === 0) {
      return;
    }
    _0x1ef311();
  }
  function _0x3cef1c(_0x31fb17, _0x31aaa8, {
    autoHydrate = true
  } = {}) {
    if (!_0x31fb17 || !_0x31aaa8) {
      return;
    }
    _0x31fb17.classList.add(NODE_DETAIL_DEFERRED_CLASS);
    if (_0x31fb17.dataset) {
      _0x31fb17.dataset.detailStage = NODE_DETAIL_DEFERRED_STAGE;
    }
    if (autoHydrate) {
      _0x22c1aa(_0x31aaa8);
    } else {
      _0x53e390.delete(_0x31aaa8);
    }
  }
  function _0x14327b(_0x238864, {
    removeClass = true
  } = {}) {
    if (!_0x238864) {
      return;
    }
    _0x53e390.delete(_0x238864);
    const _0x41e5c6 = _0x30729c?.(_0x238864) || _0x51ebe4?.(_0x238864);
    if (removeClass && _0x41e5c6) {
      _0x41e5c6.classList.remove(NODE_DETAIL_DEFERRED_CLASS);
      if (_0x41e5c6.dataset && _0x41e5c6.dataset.detailStage) {
        delete _0x41e5c6.dataset.detailStage;
      }
    }
  }
  function _0x586582() {
    _0x4bb728();
    _0x165541 = [];
    _0x53e390 = new Set();
    for (const _0x1ba8af of _0x1c632e?.() || []) {
      _0x1ba8af?.classList?.remove?.(NODE_DETAIL_DEFERRED_CLASS);
      if (_0x1ba8af?.dataset && _0x1ba8af.dataset.detailStage) {
        delete _0x1ba8af.dataset.detailStage;
      }
    }
    for (const _0x499a11 of _0x310115?.() || []) {
      _0x499a11?.classList?.remove?.(NODE_DETAIL_DEFERRED_CLASS);
      if (_0x499a11?.dataset && _0x499a11.dataset.detailStage) {
        delete _0x499a11.dataset.detailStage;
      }
    }
  }
  function _0x53561e({
    node: _0x444b5e,
    nodeId: _0x42996d,
    isSelected: _0x207a28,
    connOverlay: _0x3e9780,
    pickMode: _0x5f2170,
    relatedNodeIds: _0x541cff
  } = {}) {
    if (_0x207a28) {
      return true;
    }
    if (_0x541cff?.has?.(_0x42996d)) {
      return true;
    }
    if (_0x3e9780?.srcId === _0x42996d || _0x3e9780?.hoverId === _0x42996d) {
      return true;
    }
    if (_0x5f2170?.sourceNodeId === _0x42996d || _0x5f2170?.hoverNodeId === _0x42996d) {
      return true;
    }
    return !!_0x444b5e?.isImagesExpanded || !!_0x444b5e?.isVideosExpanded;
  }
  function _0x268caf({
    node: _0x139435,
    nodeId: _0x527b2a,
    isSelected: _0x583e25,
    connOverlay: _0x206b86,
    pickMode: _0x4b590d,
    relatedNodeIds: _0x52f127,
    viewport: _0x5c29b6,
    mountCandidateCount: _0x2a9999,
    nodeCount = 0,
    forceDeferActiveNodeDetails = false
  } = {}) {
    if (!_0x139435?.id) {
      return false;
    }
    if (isNodeType(_0x139435, ["group", "comment-note", "web-preview"])) {
      return false;
    }
    if (forceDeferActiveNodeDetails) {
      return true;
    }
    if (_0x53561e({
      node: _0x139435,
      nodeId: _0x527b2a,
      isSelected: _0x583e25,
      connOverlay: _0x206b86,
      pickMode: _0x4b590d,
      relatedNodeIds: _0x52f127
    })) {
      return false;
    }
    const _0x5ef80a = Number.isFinite(_0x5c29b6?.zoom) ? _0x5c29b6.zoom : 1;
    return Number(nodeCount || 0) >= NODE_DETAIL_DEFER_GENERATION_MEDIA_NODE_COUNT && isNodeType(_0x139435, ["ai-video", "ai-audio"]) || _0x5ef80a <= NODE_DETAIL_LOW_ZOOM_THRESHOLD || Number(_0x2a9999 || 0) >= NODE_DETAIL_DEFER_VISIBLE_COUNT;
  }
  function _0x37e0b4({
    wrapperEl: _0xaab418,
    node: _0x324145,
    nodeId: _0xbaf2b1,
    isSelected: _0x2c5c02,
    connOverlay: _0x5630de,
    pickMode: _0x189bd3,
    relatedNodeIds: _0x2ff158,
    viewport: _0x255a3d,
    mountCandidateCount: _0x3b9475,
    nodeCount = 0,
    autoHydrate = true,
    deferHydrate = false,
    forceDeferActiveNodeDetails = false
  } = {}) {
    if (!_0xaab418 || !_0xbaf2b1) {
      return;
    }
    const _0x58144d = _0x268caf({
      node: _0x324145,
      nodeId: _0xbaf2b1,
      isSelected: _0x2c5c02,
      connOverlay: _0x5630de,
      pickMode: _0x189bd3,
      relatedNodeIds: _0x2ff158,
      viewport: _0x255a3d,
      mountCandidateCount: _0x3b9475,
      nodeCount: nodeCount,
      forceDeferActiveNodeDetails: forceDeferActiveNodeDetails
    });
    const _0x3cec42 = _0x53561e({
      node: _0x324145,
      nodeId: _0xbaf2b1,
      isSelected: _0x2c5c02,
      connOverlay: _0x5630de,
      pickMode: _0x189bd3,
      relatedNodeIds: _0x2ff158
    });
    if (_0x58144d) {
      _0x3cef1c(_0xaab418, _0xbaf2b1, {
        autoHydrate: autoHydrate
      });
    } else if (_0x3cec42) {
      _0x4bb37d(_0xbaf2b1, _0xaab418);
    } else if (deferHydrate && _0x1ecb38(_0xaab418)) {
      _0x22c1aa(_0xbaf2b1);
    } else {
      _0x4bb37d(_0xbaf2b1, _0xaab418);
    }
  }
  return {
    clearNodeDetailHydrationState: _0x586582,
    enqueueNodeDetailHydration: _0x22c1aa,
    forgetNodeDetailHydration: _0x14327b,
    hydrateNodeDetails: _0x4bb37d,
    isNodeDetailActive: _0x53561e,
    resumeNodeDetailHydration: _0x34f873,
    shouldDeferNodeDetails: _0x268caf,
    syncNodeDetailMountStage: _0x37e0b4
  };
}