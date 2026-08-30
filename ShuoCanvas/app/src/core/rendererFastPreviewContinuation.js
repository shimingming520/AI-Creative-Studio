function nowContinuationProbeMs() {
  if (typeof globalThis.performance?.now === "function") {
    return globalThis.performance.now();
  } else {
    return Date.now();
  }
}
function recordFastPreviewContinuationEvent(_0x33ef0f, _0x1cdd89 = {}) {
  globalThis.window?.__runtimeCompareRecordFastPreviewContinuation?.({
    type: _0x33ef0f,
    ..._0x1cdd89
  });
}
function buildContinuationProbeContext(_0x165b05 = {}) {
  return {
    deferFullSync: _0x165b05.deferFullSync === true,
    hasPendingStructuralOps: _0x165b05.hasPendingStructuralOps === true
  };
}
function buildNodeIdSetKey(_0x538a95) {
  if (!_0x538a95 || typeof _0x538a95[Symbol.iterator] !== "function") {
    return "";
  }
  return Array.from(_0x538a95, _0x122cfe => String(_0x122cfe || "")).join("");
}
function buildContinuationKey(_0x517c4e, _0x2c2947 = {}) {
  const _0x116088 = _0x2c2947.viewport || {};
  const _0x4802f7 = _0x2c2947.connOverlay || {};
  const _0x23d77f = _0x2c2947.dragContext || {};
  const _0x2e5f2f = _0x2c2947.keepMountedMediaPreview === true ? _0x2c2947.nonMediaLifecycleRevision : _0x2c2947.lifecycleRevision;
  const _0x1071a8 = Array.isArray(_0x4802f7.invalidNodeIds) ? _0x4802f7.invalidNodeIds.join("") : "";
  return [_0x517c4e, _0x116088.x, _0x116088.y, _0x116088.zoom, _0x2c2947.viewportBusy === true ? 1 : 0, _0x2c2947.suppressNewMedia === true ? 1 : 0, _0x2c2947.suspendNewMediaSrc === true ? 1 : 0, _0x2c2947.keepMountedMediaPreview === true ? 1 : 0, buildNodeIdSetKey(_0x2c2947.fullEligibleVisibleImageNodeIds), buildNodeIdSetKey(_0x2c2947.fullEligiblePreviewImageNodeIds), _0x2c2947.mediaSourceOwnerIds == null ? "legacy-media-source-owners" : buildNodeIdSetKey(_0x2c2947.mediaSourceOwnerIds), _0x2c2947.requiredImmediateMediaSourceOwnerIds == null ? "legacy-required-media-source-owners" : buildNodeIdSetKey(_0x2c2947.requiredImmediateMediaSourceOwnerIds), Number(_0x2e5f2f) || 0, _0x4802f7.side || "", _0x1071a8, _0x23d77f.isCommittingDrag === true ? 1 : 0, _0x23d77f.hasMoved === true ? 1 : 0].join("|");
}
function requestContinuationFrame(_0x4cdf81) {
  if (typeof requestAnimationFrame === "function") {
    return {
      kind: "raf",
      id: requestAnimationFrame(_0x4cdf81)
    };
  }
  return {
    kind: "timer",
    id: setTimeout(_0x4cdf81, 32)
  };
}
function cancelContinuationFrame(_0x8f7ee0) {
  if (!_0x8f7ee0) {
    return;
  }
  if (_0x8f7ee0.kind === "raf" && typeof cancelAnimationFrame === "function") {
    cancelAnimationFrame(_0x8f7ee0.id);
    return;
  }
  if (_0x8f7ee0.kind === "timer") {
    clearTimeout(_0x8f7ee0.id);
  }
}
export function createRendererFastPreviewLifecycleTracker() {
  let _0x3236fd = 0;
  let _0x34e293 = 0;
  return {
    record(_0x446472) {
      _0x3236fd += 1;
      const _0x13eb27 = String(_0x446472 || "").toLowerCase();
      if (!_0x13eb27.includes("image") && !_0x13eb27.includes("video") && !_0x13eb27.includes("media-clip")) {
        _0x34e293 += 1;
      }
    },
    reset() {
      _0x3236fd = 0;
      _0x34e293 = 0;
    },
    getContinuationOptions() {
      return {
        lifecycleRevision: _0x3236fd,
        nonMediaLifecycleRevision: _0x34e293
      };
    }
  };
}
export function shouldDeferRendererFastPreviewSync({
  mountedHeavyMediaThisFrame = false,
  updatedHeavyMediaThisFrame = false,
  hasPendingStructuralVideoMounts = false,
  hasExistingPreviewSurface = false,
  dragContext = null
} = {}) {
  if (dragContext?.isDragging === true) {
    return false;
  }
  if (hasExistingPreviewSurface !== true) {
    return false;
  }
  return mountedHeavyMediaThisFrame === true || updatedHeavyMediaThisFrame === true || hasPendingStructuralVideoMounts === true;
}
export function syncRendererFastPreviewAfterNodeRender({
  continuation: _0x47c828,
  layer: _0xe6469e,
  canvasEl: _0x12cdfc,
  nodes: _0x31fec1,
  previewCandidateIds: _0x5829e3,
  selectedNodeSet: _0x5a6ab3,
  candidateSignature: _0x2e3798,
  hasPendingStructuralOps: _0x25341e,
  connOverlay: _0x45d182,
  pickConnectMode: _0x44f480,
  nodeCount = 0,
  viewport: _0x1ed209,
  containerWidth: _0x45be6c,
  containerHeight: _0x198a9c,
  suppressNewMedia = false,
  viewportBusy = false,
  dragContext: _0x2b2afb,
  dragTargets: _0x280465,
  suspendNewMediaSrc = false,
  fullEligibleVisibleImageNodeIds = null,
  fullEligiblePreviewImageNodeIds = null,
  mediaSourceOwnerIds = null,
  requiredImmediateMediaSourceOwnerIds = null,
  lifecycleRevision = 0,
  nonMediaLifecycleRevision = 0,
  mountedHeavyMediaThisFrame = false,
  updatedHeavyMediaThisFrame = false,
  hasPendingStructuralVideoMounts = false
} = {}) {
  const _0x4baa6 = {
    connOverlay: _0x45d182,
    pickConnectMode: _0x44f480,
    nodeCount: nodeCount,
    viewport: _0x1ed209,
    containerWidth: _0x45be6c,
    containerHeight: _0x198a9c,
    suppressNewMedia: suppressNewMedia,
    viewportBusy: viewportBusy,
    dragContext: _0x2b2afb,
    dragTargets: _0x280465,
    suspendNewMediaSrc: suspendNewMediaSrc,
    fullEligibleVisibleImageNodeIds: fullEligibleVisibleImageNodeIds,
    fullEligiblePreviewImageNodeIds: fullEligiblePreviewImageNodeIds,
    mediaSourceOwnerIds: mediaSourceOwnerIds,
    requiredImmediateMediaSourceOwnerIds: requiredImmediateMediaSourceOwnerIds,
    lifecycleRevision: lifecycleRevision,
    nonMediaLifecycleRevision: nonMediaLifecycleRevision,
    keepMountedMediaPreview: nodeCount >= 48 && (viewportBusy || Number(_0x1ed209?.zoom || 1) <= 0.45)
  };
  const _0x468255 = shouldDeferRendererFastPreviewSync({
    mountedHeavyMediaThisFrame: mountedHeavyMediaThisFrame,
    updatedHeavyMediaThisFrame: updatedHeavyMediaThisFrame,
    hasPendingStructuralVideoMounts: hasPendingStructuralVideoMounts,
    hasExistingPreviewSurface: _0xe6469e?.getStats?.().fastPreviewCount > 0,
    dragContext: _0x2b2afb
  }) && (requiredImmediateMediaSourceOwnerIds == null || typeof requiredImmediateMediaSourceOwnerIds?.[Symbol.iterator] !== "function" || !Array.from(requiredImmediateMediaSourceOwnerIds).some(_0x2b31e8 => _0xe6469e?.isNodePreviewReady?.(_0x2b31e8) !== true));
  _0xe6469e?.prune?.(_0x5829e3);
  return _0x47c828?.syncIfNeeded({
    canvasEl: _0x12cdfc,
    nodes: _0x31fec1,
    previewCandidateIds: _0x5829e3,
    selectedNodeSet: _0x5a6ab3,
    candidateSignature: _0x2e3798,
    hasPendingStructuralOps: _0x25341e,
    options: _0x4baa6,
    deferFullSync: _0x468255
  });
}
export function createRendererFastPreviewContinuationController({
  sync: _0x1a0949,
  requestFrame = requestContinuationFrame,
  cancelFrame = cancelContinuationFrame
} = {}) {
  let _0x420475 = "";
  let _0x40123f = null;
  let _0x9a43e7 = null;
  let _0x297165 = null;
  function _0x506163(_0x159d39 = "clear") {
    _0x9a43e7 = null;
    if (_0x297165 === null) {
      return;
    }
    recordFastPreviewContinuationEvent("deferred-cleared", {
      reason: _0x159d39
    });
    cancelFrame?.(_0x297165);
    _0x297165 = null;
  }
  function _0x474770() {
    _0x420475 = "";
    _0x40123f = null;
    _0x506163("reset");
  }
  function _0xee3d26(_0x67e54d) {
    _0x9a43e7 = _0x67e54d;
    if (_0x297165 !== null) {
      recordFastPreviewContinuationEvent("deferred-coalesced", {
        ...buildContinuationProbeContext(_0x67e54d)
      });
      return;
    }
    _0x297165 = requestFrame?.(() => {
      _0x297165 = null;
      const _0x14b15a = _0x9a43e7;
      _0x9a43e7 = null;
      if (!_0x14b15a) {
        return;
      }
      recordFastPreviewContinuationEvent("deferred-flush", {
        ...buildContinuationProbeContext(_0x14b15a)
      });
      _0x427637({
        ..._0x14b15a,
        deferFullSync: false
      });
    });
    recordFastPreviewContinuationEvent("deferred-created", {
      ...buildContinuationProbeContext(_0x67e54d)
    });
  }
  function _0x2187d1({
    candidateSignature: _0x3456d6,
    nodes: _0x397e8d,
    hasPendingStructuralOps: _0x5e21fc,
    options: _0x35ced8
  } = {}) {
    const _0x32c3c0 = buildContinuationKey(_0x3456d6, _0x35ced8);
    const _0x5b77dc = _0x420475 !== _0x32c3c0;
    const _0x21e92c = _0x40123f !== _0x397e8d;
    const _0xefd373 = _0x5e21fc !== true || _0x5b77dc || _0x21e92c;
    recordFastPreviewContinuationEvent("full-sync-decision", {
      hasPendingStructuralOps: _0x5e21fc === true,
      keyChanged: _0x5b77dc,
      nodesChanged: _0x21e92c,
      shouldRun: _0xefd373
    });
    if (_0x5e21fc === true) {
      _0x420475 = _0x32c3c0;
      _0x40123f = _0x397e8d;
    } else {
      _0x474770();
    }
    return _0xefd373;
  }
  function _0x427637({
    canvasEl: _0x2c624d,
    nodes: _0x34af21,
    previewCandidateIds: _0x44f5cb,
    selectedNodeSet: _0x1958d3,
    candidateSignature: _0x1b991c,
    hasPendingStructuralOps: _0x3c8d8c,
    options: _0x5c6931,
    deferFullSync = false
  } = {}) {
    recordFastPreviewContinuationEvent("sync-call", {
      deferFullSync: deferFullSync === true,
      hasPendingStructuralOps: _0x3c8d8c === true
    });
    if (deferFullSync === true) {
      _0xee3d26({
        canvasEl: _0x2c624d,
        nodes: _0x34af21,
        previewCandidateIds: _0x44f5cb,
        selectedNodeSet: _0x1958d3,
        candidateSignature: _0x1b991c,
        hasPendingStructuralOps: _0x3c8d8c,
        options: _0x5c6931
      });
      return false;
    }
    _0x506163("direct-sync");
    if (!_0x2187d1({
      candidateSignature: _0x1b991c,
      nodes: _0x34af21,
      hasPendingStructuralOps: _0x3c8d8c,
      options: _0x5c6931
    })) {
      recordFastPreviewContinuationEvent("full-sync-skipped", {
        hasPendingStructuralOps: _0x3c8d8c === true
      });
      return false;
    }
    const _0x469427 = nowContinuationProbeMs();
    try {
      _0x1a0949?.(_0x2c624d, _0x34af21, _0x44f5cb, _0x1958d3, _0x5c6931);
    } finally {
      recordFastPreviewContinuationEvent("full-sync-run", {
        durationMs: Math.max(0, nowContinuationProbeMs() - _0x469427),
        hasPendingStructuralOps: _0x3c8d8c === true
      });
    }
    return true;
  }
  return {
    reset: _0x474770,
    shouldRunFullSync: _0x2187d1,
    syncIfNeeded: _0x427637
  };
}