import { clearCanvasNearbyVideoWarmup, syncCanvasNearbyVideoWarmup } from "./canvasMediaWarmup.js";
import { isNodeInsideViewportPadding } from "./rendererVirtualization.js";
import { buildCanvasVideoProxyPromotionPatch } from "../services/canvasMediaLocalService.js";
import { cancelVideoProxyMigrationTask, getLegacyProjectImportVideoProxyMigration, requestVisibleVideoProxyMigration, subscribeVideoProxyMigrationUpdates } from "../services/mediaTaskService.js";
import { screenToWorld } from "./math.js";
import { isViewportPanPreviewActive } from "./viewportPanPreview.js";
const DEFAULT_DEBOUNCE_MS = 160;
const LOW_ZOOM_VIDEO_WARMUP_THRESHOLD = 0.45;
const DEFAULT_PROXY_MIGRATION_BATCH_SIZE = 4;
const MAX_PROXY_MIGRATION_BATCH_SIZE = 8;
const MAX_PENDING_PROXY_MIGRATION_UPDATE_COUNT = 120 + MAX_PROXY_MIGRATION_BATCH_SIZE;
const PROXY_MIGRATION_TERMINAL_STATUSES = new Set(["complete", "failed", "cancelled"]);
function normalizeViewport(_0x55d735) {
  return {
    x: Number.isFinite(Number(_0x55d735?.x)) ? Number(_0x55d735.x) : 0,
    y: Number.isFinite(Number(_0x55d735?.y)) ? Number(_0x55d735.y) : 0,
    zoom: Number.isFinite(Number(_0x55d735?.zoom)) && Number(_0x55d735.zoom) > 0 ? Number(_0x55d735.zoom) : 1
  };
}
function readStoreSnapshot(_0x993b1d) {
  return _0x993b1d?.getStateRaw?.() || _0x993b1d?.getState?.() || {};
}
function getContainerSize(_0x3e162) {
  return {
    width: Math.max(1, Number(_0x3e162?.clientWidth) || 1600),
    height: Math.max(1, Number(_0x3e162?.clientHeight) || 900)
  };
}
function normalizeProxyMigrationBatchSize(_0x455cb9) {
  const _0x203d03 = Math.trunc(Number(_0x455cb9));
  if (!Number.isFinite(_0x203d03) || _0x203d03 < 1) {
    return DEFAULT_PROXY_MIGRATION_BATCH_SIZE;
  }
  return Math.min(MAX_PROXY_MIGRATION_BATCH_SIZE, _0x203d03);
}
function sortProxyMigrationNodeIdsByPriority({
  nodeIds: _0x1b470b,
  nodes: _0x3608e2,
  selectedNodeIds: _0x408c73,
  viewport: _0x1e17c1,
  containerEl: _0x2d1b25
}) {
  const _0x439dcb = new Set(_0x408c73 || []);
  const {
    width: _0x5d3e66,
    height: _0x58ed1c
  } = getContainerSize(_0x2d1b25);
  const _0x439323 = screenToWorld(_0x5d3e66 / 2, _0x58ed1c / 2, normalizeViewport(_0x1e17c1));
  return (_0x1b470b || []).map((_0x2659a9, _0x2d333b) => {
    const _0x4f2617 = _0x3608e2?.[_0x2659a9] || {};
    const _0x2f9498 = Number(_0x4f2617.x || 0) + Number(_0x4f2617.width || 0) / 2;
    const _0x4fe6be = Number(_0x4f2617.y || 0) + Number(_0x4f2617.height || 0) / 2;
    const _0x480f22 = _0x2f9498 - _0x439323.x;
    const _0x1a9fbf = _0x4fe6be - _0x439323.y;
    return {
      nodeId: _0x2659a9,
      index: _0x2d333b,
      selected: _0x439dcb.has(_0x2659a9),
      distanceSq: _0x480f22 * _0x480f22 + _0x1a9fbf * _0x1a9fbf
    };
  }).sort((_0x30e7e3, _0x3c1290) => {
    if (_0x30e7e3.selected !== _0x3c1290.selected) {
      if (_0x30e7e3.selected) {
        return -1;
      } else {
        return 1;
      }
    }
    return _0x30e7e3.distanceSq - _0x3c1290.distanceSq || _0x30e7e3.index - _0x3c1290.index;
  }).map(_0x29f2f7 => _0x29f2f7.nodeId);
}
export function collectVisibleLegacySourceVideoNodeIds({
  nodes: _0x46e670,
  viewport: _0x1e07d5,
  containerEl: _0x38ce38,
  isLegacySourceVideo = getLegacyProjectImportVideoProxyMigration,
  buildProxyPromotionPatch = buildCanvasVideoProxyPromotionPatch
} = {}) {
  const _0x4f41ca = normalizeViewport(_0x1e07d5);
  if (_0x4f41ca.zoom > LOW_ZOOM_VIDEO_WARMUP_THRESHOLD) {
    return [];
  }
  const {
    width: _0x3cd8c7,
    height: _0x2dfa2a
  } = getContainerSize(_0x38ce38);
  const _0x1471bd = Array.isArray(_0x46e670) ? _0x46e670 : Object.values(_0x46e670 || {});
  const _0x568b62 = [];
  for (const _0x3b98f5 of _0x1471bd) {
    const _0xda112 = String(_0x3b98f5?.type || "").trim().toLowerCase() === "source-video" && !!buildProxyPromotionPatch(_0x3b98f5);
    if (!_0x3b98f5?.id || !isLegacySourceVideo(_0x3b98f5) && !_0xda112) {
      continue;
    }
    if (!isNodeInsideViewportPadding(_0x3b98f5, _0x4f41ca, _0x3cd8c7, _0x2dfa2a, 0)) {
      continue;
    }
    _0x568b62.push(String(_0x3b98f5.id));
  }
  return _0x568b62;
}
function buildCanvasViewportVideoWarmupScopeSignature(_0x286e92 = {}) {
  const _0x560db2 = normalizeViewport(_0x286e92.viewport);
  const _0x2b3634 = Number.isFinite(Number(_0x286e92._nodeGeometryRev)) ? Number(_0x286e92._nodeGeometryRev) : 0;
  const _0x51cce6 = Array.isArray(_0x286e92.selectedNodeIds) ? _0x286e92.selectedNodeIds.map(_0x422330 => String(_0x422330 || "")) : [];
  return [_0x560db2.x, _0x560db2.y, _0x560db2.zoom, _0x2b3634, JSON.stringify(_0x51cce6)].join(":");
}
export function buildCanvasViewportVideoWarmupSignature(_0x291942 = {}) {
  const _0x539f4a = Number.isFinite(Number(_0x291942._sourceVideoRev)) ? Number(_0x291942._sourceVideoRev) : 0;
  return buildCanvasViewportVideoWarmupScopeSignature(_0x291942) + ":" + _0x539f4a;
}
export function createCanvasViewportVideoWarmupController({
  store: _0x5c08a5,
  containerEl: _0x1b03bd,
  debounceMs = DEFAULT_DEBOUNCE_MS,
  syncWarmup = syncCanvasNearbyVideoWarmup,
  clearWarmup = clearCanvasNearbyVideoWarmup,
  requestProxyMigration = requestVisibleVideoProxyMigration,
  isLegacySourceVideo = getLegacyProjectImportVideoProxyMigration,
  buildProxyPromotionPatch = buildCanvasVideoProxyPromotionPatch,
  resolveProxyMigrationBatchSize = () => DEFAULT_PROXY_MIGRATION_BATCH_SIZE,
  proxyMigrationBatchIntervalMs = debounceMs,
  isViewportInteractionActive = isViewportPanPreviewActive,
  subscribeProxyMigrationUpdates = subscribeVideoProxyMigrationUpdates,
  cancelProxyMigrationTask = cancelVideoProxyMigrationTask,
  setTimer = setTimeout,
  clearTimer = clearTimeout
} = {}) {
  if (!_0x5c08a5 || typeof syncWarmup !== "function" || typeof clearWarmup !== "function") {
    return () => {};
  }
  const _0x13a022 = Math.max(120, Math.min(200, Number(debounceMs) || DEFAULT_DEBOUNCE_MS));
  const _0x2a719c = Math.max(120, Math.min(200, Number(proxyMigrationBatchIntervalMs) || _0x13a022));
  let _0x56728c = null;
  let _0x14f481 = null;
  let _0x1e0905 = [];
  let _0x45eb3c = "";
  let _0x4ce0d0 = null;
  const _0x59d70f = new Map();
  const _0x2f64d6 = new Map();
  let _0x2fe750 = false;
  let _0x565a0d = "";
  let _0x1f95ce = "";
  let _0x5573c1 = null;
  let _0x356ae6 = new Set();
  const _0x1f2905 = () => {
    if (_0x56728c === null) {
      return false;
    }
    clearTimer(_0x56728c);
    _0x56728c = null;
    return true;
  };
  const _0x201a5d = () => {
    _0x1e0905 = [];
    _0x45eb3c = "";
    _0x4ce0d0 = null;
    if (_0x14f481 === null) {
      return false;
    }
    clearTimer(_0x14f481);
    _0x14f481 = null;
    return true;
  };
  const _0x156a05 = _0x3ffe3f => {
    for (const [_0x4db58e, _0x2c1756] of _0x2f64d6) {
      if (_0x2c1756.entry === _0x3ffe3f) {
        _0x2f64d6.delete(_0x4db58e);
      }
    }
  };
  const _0x379640 = _0x1f2b84 => {
    if (!_0x1f2b84 || _0x59d70f.get(_0x1f2b84.nodeId) !== _0x1f2b84) {
      return false;
    }
    _0x59d70f.delete(_0x1f2b84.nodeId);
    _0x156a05(_0x1f2b84);
    return true;
  };
  const _0x3c780b = (_0x30ae9d = {}) => {
    const _0x518b9e = String(_0x30ae9d?.taskId || _0x30ae9d?.id || "").trim();
    if (_0x518b9e) {
      for (const _0x385c03 of _0x59d70f.values()) {
        if (_0x385c03.taskId === _0x518b9e) {
          return _0x385c03;
        }
      }
      return null;
    }
    const _0x5b92a3 = String(_0x30ae9d?.nodeId || "").trim();
    const _0x450b4c = _0x5b92a3 ? _0x59d70f.get(_0x5b92a3) || null : null;
    if (_0x450b4c?.taskId) {
      return _0x450b4c;
    } else {
      return null;
    }
  };
  const _0x3248d2 = (_0xc3fae3 = {}) => {
    const _0x55227f = String(_0xc3fae3?.taskId || _0xc3fae3?.id || "").trim();
    const _0x5c2f06 = String(_0xc3fae3?.nodeId || "").trim();
    const _0x36efee = _0x5c2f06 ? _0x59d70f.get(_0x5c2f06) || null : null;
    const _0x276bd5 = _0x36efee?.status === "submitting" && !_0x36efee.taskId ? _0x36efee : null;
    const _0xbf8268 = String(_0xc3fae3?.status || "").trim().toLowerCase();
    if (!_0x55227f || !_0x276bd5) {
      const _0x527ffa = !!_0x55227f && PROXY_MIGRATION_TERMINAL_STATUSES.has(_0xbf8268) && Array.from(_0x59d70f.values()).some(_0x31b5e0 => _0x31b5e0?.status === "submitting" && !_0x31b5e0?.taskId);
      if (!_0x527ffa) {
        return false;
      }
    }
    if (!_0x2f64d6.has(_0x55227f)) {
      while (_0x2f64d6.size >= MAX_PENDING_PROXY_MIGRATION_UPDATE_COUNT) {
        const _0x5174ae = _0x2f64d6.keys().next().value;
        _0x2f64d6.delete(_0x5174ae);
      }
    } else {
      _0x2f64d6.delete(_0x55227f);
    }
    _0x2f64d6.set(_0x55227f, {
      entry: _0x276bd5,
      event: _0xc3fae3
    });
    return true;
  };
  const _0x2241c6 = (_0x3ce519, _0x3137d4) => {
    let _0x45fa7e = null;
    for (const [_0xe5264f, _0x298d87] of _0x2f64d6) {
      const _0x652a50 = _0x298d87.entry === _0x3ce519;
      const _0x112124 = !_0x298d87.entry && _0xe5264f === _0x3137d4;
      if (_0xe5264f === _0x3137d4 && (_0x652a50 || _0x112124)) {
        _0x45fa7e = _0x298d87.event;
      }
      if (_0x652a50 || _0x112124) {
        _0x2f64d6.delete(_0xe5264f);
      }
    }
    return _0x45fa7e;
  };
  const _0x52553a = _0x5bfe42 => {
    if (!_0x5bfe42 || _0x5bfe42.cancelRequested || _0x5bfe42.status !== "waiting" || !_0x5bfe42.taskId) {
      return false;
    }
    _0x5bfe42.cancelRequested = true;
    try {
      Promise.resolve(cancelProxyMigrationTask(_0x5bfe42.taskId)).then(_0x45c63d => {
        if (_0x59d70f.get(_0x5bfe42.nodeId) !== _0x5bfe42) {
          return;
        }
        const _0x13fb0f = String(_0x45c63d?.task?.status || _0x45c63d?.status || "").trim().toLowerCase();
        if (_0x13fb0f) {
          _0x5bfe42.status = _0x13fb0f;
        }
        if (PROXY_MIGRATION_TERMINAL_STATUSES.has(_0x13fb0f)) {
          if (_0x379640(_0x5bfe42)) {
            _0x581dbd();
          }
          return;
        }
        if (_0x45c63d?.skipped === true || _0x45c63d?.ok === false) {
          _0x5bfe42.cancelRequested = false;
        }
      }).catch(_0x6bfc5d => {
        _0x5bfe42.cancelRequested = false;
        console.warn("[canvasViewportVideoWarmup] proxy migration cancel failed:", _0x6bfc5d);
      });
    } catch (_0x1a5170) {
      _0x5bfe42.cancelRequested = false;
      console.warn("[canvasViewportVideoWarmup] proxy migration cancel failed:", _0x1a5170);
    }
    return true;
  };
  const _0x1a4c44 = _0x1ddb89 => _0x5573c1 === _0x1f95ce && !_0x356ae6.has(_0x1ddb89.nodeId);
  const _0x42c0b5 = () => {
    for (const _0x7b78c4 of _0x59d70f.values()) {
      if (!_0x1a4c44(_0x7b78c4)) {
        continue;
      }
      _0x52553a(_0x7b78c4);
    }
  };
  const _0x2e691b = (_0x220ced, _0x1665de, _0x4211e8) => {
    const _0x4d0531 = {
      nodeId: _0x220ced,
      taskId: "",
      status: "submitting",
      signature: _0x1665de,
      viewport: _0x4211e8,
      cancelRequested: false
    };
    _0x59d70f.set(_0x220ced, _0x4d0531);
    try {
      Promise.resolve(requestProxyMigration(_0x220ced)).then(_0x283cd0 => {
        if (_0x59d70f.get(_0x220ced) !== _0x4d0531) {
          return;
        }
        if (!_0x283cd0 || typeof _0x283cd0 !== "object") {
          _0x379640(_0x4d0531);
          _0x581dbd();
          return;
        }
        _0x4d0531.taskId = String(_0x283cd0.taskId || _0x283cd0.id || "").trim();
        _0x4d0531.status = String(_0x283cd0.status || "waiting").trim().toLowerCase();
        const _0x1c34d5 = _0x2241c6(_0x4d0531, _0x4d0531.taskId);
        if (_0x1c34d5) {
          _0x38b432(_0x4d0531, _0x1c34d5);
          if (_0x59d70f.get(_0x220ced) !== _0x4d0531) {
            return;
          }
        }
        if (_0x1a4c44(_0x4d0531)) {
          _0x52553a(_0x4d0531);
        }
        if (PROXY_MIGRATION_TERMINAL_STATUSES.has(_0x4d0531.status)) {
          _0x379640(_0x4d0531);
          _0x581dbd();
        }
      }).catch(_0x4fd9bf => {
        if (_0x379640(_0x4d0531)) {
          _0x581dbd();
        }
        console.warn("[canvasViewportVideoWarmup] proxy migration request failed:", _0x4fd9bf);
      });
    } catch (_0x21c29b) {
      if (_0x379640(_0x4d0531)) {
        _0x581dbd();
      }
      console.warn("[canvasViewportVideoWarmup] proxy migration request failed:", _0x21c29b);
    }
  };
  const _0x15ef96 = _0x106a6c => {
    try {
      return isViewportInteractionActive({
        viewport: _0x106a6c,
        containerEl: _0x1b03bd
      }) === true;
    } catch {
      return false;
    }
  };
  const _0x4db4db = (_0x46d443, _0x28b6c2) => {
    if (_0x2fe750 || _0x45eb3c !== _0x46d443 || _0x1f95ce !== _0x46d443) {
      return;
    }
    if (_0x15ef96(_0x28b6c2)) {
      if (_0x14f481 === null) {
        _0x14f481 = setTimer(() => {
          _0x14f481 = null;
          _0x4db4db(_0x46d443, _0x28b6c2);
        }, _0x2a719c);
        _0x14f481?.unref?.();
      }
      return;
    }
    let _0x1975ff = DEFAULT_PROXY_MIGRATION_BATCH_SIZE;
    try {
      _0x1975ff = resolveProxyMigrationBatchSize({
        queuedCount: _0x1e0905.length,
        viewport: _0x28b6c2,
        containerEl: _0x1b03bd
      });
    } catch {}
    const _0x20ea86 = normalizeProxyMigrationBatchSize(_0x1975ff);
    const _0x3174f5 = Math.max(0, _0x20ea86 - _0x59d70f.size);
    if (_0x3174f5 === 0) {
      return;
    }
    const _0x123fda = _0x1e0905.splice(0, _0x3174f5);
    for (const _0x161230 of _0x123fda) {
      _0x2e691b(_0x161230, _0x46d443, _0x28b6c2);
    }
    if (_0x1e0905.length === 0) {
      _0x45eb3c = "";
      _0x4ce0d0 = null;
      return;
    }
  };
  const _0x581dbd = () => {
    if (!_0x45eb3c || !_0x4ce0d0) {
      return;
    }
    _0x4db4db(_0x45eb3c, _0x4ce0d0);
  };
  const _0x38b432 = (_0x803487, _0x15171c = {}) => {
    const _0x49bf77 = String(_0x15171c.status || "").trim().toLowerCase();
    if (_0x49bf77) {
      _0x803487.status = _0x49bf77;
    }
    const _0x5ce7bc = String(_0x15171c.taskId || _0x15171c.id || "").trim();
    if (_0x5ce7bc) {
      _0x803487.taskId = _0x5ce7bc;
    }
    if (_0x1a4c44(_0x803487)) {
      _0x52553a(_0x803487);
    }
    if (!PROXY_MIGRATION_TERMINAL_STATUSES.has(_0x49bf77)) {
      return;
    }
    if (!_0x379640(_0x803487)) {
      return;
    }
    _0x581dbd();
  };
  const _0x555df6 = subscribeProxyMigrationUpdates((_0x486925 = {}) => {
    const _0x2dac6d = _0x3c780b(_0x486925);
    if (!_0x2dac6d) {
      _0x3248d2(_0x486925);
      return;
    }
    _0x38b432(_0x2dac6d, _0x486925);
  });
  const _0x220b83 = _0x18b199 => {
    if (_0x2fe750) {
      return;
    }
    const _0x3adfdb = normalizeViewport(_0x18b199?.viewport);
    const _0x5587ae = _0x3adfdb.zoom <= LOW_ZOOM_VIDEO_WARMUP_THRESHOLD;
    if (!_0x5587ae) {
      _0x1f2905();
      _0x201a5d();
      _0x565a0d = "";
      _0x1f95ce = "";
      _0x5573c1 = "";
      _0x356ae6 = new Set();
      _0x42c0b5();
      return;
    }
    const _0x357c83 = buildCanvasViewportVideoWarmupSignature(_0x18b199);
    if (_0x357c83 === _0x565a0d) {
      return;
    }
    const _0x40f5db = buildCanvasViewportVideoWarmupScopeSignature(_0x18b199);
    const _0x1a5fd3 = _0x40f5db !== _0x1f95ce;
    _0x565a0d = _0x357c83;
    _0x1f95ce = _0x40f5db;
    _0x1f2905();
    if (_0x1a5fd3) {
      _0x201a5d();
    }
    const _0x58a804 = () => {
      _0x56728c = null;
      if (_0x2fe750) {
        return;
      }
      const _0x32087d = readStoreSnapshot(_0x5c08a5);
      const _0x5a22be = normalizeViewport(_0x32087d.viewport);
      if (_0x5a22be.zoom > LOW_ZOOM_VIDEO_WARMUP_THRESHOLD) {
        _0x565a0d = "";
        return;
      }
      if (buildCanvasViewportVideoWarmupSignature(_0x32087d) !== _0x357c83) {
        return;
      }
      if (_0x15ef96(_0x5a22be)) {
        _0x56728c = setTimer(_0x58a804, _0x13a022);
        _0x56728c?.unref?.();
        return;
      }
      const _0x1dc0d1 = collectVisibleLegacySourceVideoNodeIds({
        nodes: _0x32087d.nodes,
        viewport: _0x32087d.viewport,
        containerEl: _0x1b03bd,
        isLegacySourceVideo: isLegacySourceVideo,
        buildProxyPromotionPatch: buildProxyPromotionPatch
      });
      _0x5573c1 = _0x40f5db;
      _0x356ae6 = new Set(_0x1dc0d1);
      _0x42c0b5();
      const _0x172d22 = new Set(_0x32087d.selectedNodeIds || []);
      const _0x1deaf3 = {};
      const _0x3e2ae5 = [];
      for (const _0x1e43b7 of _0x1dc0d1) {
        const _0x1363fb = buildProxyPromotionPatch(_0x32087d.nodes?.[_0x1e43b7]);
        if (_0x1363fb) {
          if (!_0x172d22.has(_0x1e43b7)) {
            _0x1deaf3[_0x1e43b7] = _0x1363fb;
          }
          continue;
        }
        _0x3e2ae5.push(_0x1e43b7);
      }
      const _0xe8e9da = Object.keys(_0x1deaf3);
      if (_0xe8e9da.length > 0) {
        if (typeof _0x5c08a5.updateNodesData === "function") {
          _0x5c08a5.updateNodesData(_0x1deaf3);
        } else {
          for (const _0x35f37b of _0xe8e9da) {
            _0x5c08a5.updateNodeData?.(_0x35f37b, _0x1deaf3[_0x35f37b]);
          }
        }
      }
      const _0x5964c7 = readStoreSnapshot(_0x5c08a5);
      syncWarmup({
        canvas: {
          nodes: _0x5964c7.nodes || {},
          viewport: _0x5964c7.viewport,
          selectedNodeIds: _0x5964c7.selectedNodeIds
        },
        containerEl: _0x1b03bd
      });
      _0x1e0905 = sortProxyMigrationNodeIdsByPriority({
        nodeIds: _0x3e2ae5,
        nodes: _0x5964c7.nodes,
        selectedNodeIds: _0x5964c7.selectedNodeIds,
        viewport: _0x5964c7.viewport,
        containerEl: _0x1b03bd
      }).filter(_0x1805a8 => !_0x59d70f.has(_0x1805a8));
      _0x45eb3c = _0x40f5db;
      _0x4ce0d0 = _0x5a22be;
      _0x4db4db(_0x40f5db, _0x5a22be);
    };
    _0x56728c = setTimer(_0x58a804, _0x13a022);
    _0x56728c?.unref?.();
  };
  let _0x265987 = () => {};
  if (typeof _0x5c08a5.subscribeSelector === "function") {
    _0x265987 = _0x5c08a5.subscribeSelector(_0x355598 => ({
      viewport: _0x355598.viewport,
      selectedNodeIds: _0x355598.selectedNodeIds,
      _sourceVideoRev: _0x355598._sourceVideoRev,
      _nodeGeometryRev: _0x355598._nodeGeometryRev
    }), () => _0x220b83(readStoreSnapshot(_0x5c08a5)), {
      isEqual: (_0x4b2c8a, _0x1912f4) => _0x4b2c8a?.viewport === _0x1912f4?.viewport && _0x4b2c8a?.selectedNodeIds === _0x1912f4?.selectedNodeIds && _0x4b2c8a?._sourceVideoRev === _0x1912f4?._sourceVideoRev && _0x4b2c8a?._nodeGeometryRev === _0x1912f4?._nodeGeometryRev
    });
  } else if (typeof _0x5c08a5.subscribeRaw === "function") {
    _0x265987 = _0x5c08a5.subscribeRaw(_0x220b83);
  } else {
    _0x220b83(readStoreSnapshot(_0x5c08a5));
  }
  return () => {
    if (_0x2fe750) {
      return;
    }
    _0x2fe750 = true;
    _0x1f2905();
    _0x201a5d();
    _0x59d70f.clear();
    _0x2f64d6.clear();
    _0x555df6?.();
    _0x265987?.();
    clearWarmup();
  };
}