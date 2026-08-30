function normalizeNumber(_0x15881a, _0x1b3807 = 0) {
  if (Number.isFinite(_0x15881a)) {
    return _0x15881a;
  } else {
    return _0x1b3807;
  }
}
function hasNodeRevision(_0x444a40 = {}) {
  return typeof _0x444a40._nodesRev === "number" || typeof _0x444a40._persistRev === "number";
}
export function createRendererSelectionFastPath({
  buildSelectionRelatedSets: _0x4c02d1,
  cancelPendingRender: _0x2cbb11,
  consumeViewport: _0x15a2d9,
  ensureEdgeIndex: _0x2262a6,
  flushSelectionUpdate: _0x3ee078,
  hasPendingRender: _0x3593d9,
  renderAffectedEdges: _0xbad28e,
  renderSelectionOverlays: _0x283d18,
  setCurrentSnapshot: _0x266359
} = {}) {
  let _0x88ff06 = "";
  let _0x28c554 = null;
  let _0x153994 = false;
  let _0x45a4de = null;
  function _0x31c303(_0x3be9ae = {}) {
    const _0x24f1c2 = _0x3be9ae.viewport || {};
    const _0x34cfbf = _0x3be9ae.ui || {};
    const _0x978267 = _0x3be9ae.selectionBox || {};
    const _0x32a1d5 = _0x3be9ae.picker || {};
    const _0x455c66 = _0x3be9ae.contextMenu || {};
    const _0x45229d = _0x3be9ae.connOverlay || {};
    const _0xfce5eb = _0x3be9ae.pickConnectMode || {};
    return JSON.stringify({
      nodeCount: typeof _0x3be9ae._nodeCount === "number" ? _0x3be9ae._nodeCount : Object.keys(_0x3be9ae.nodes || {}).length,
      nodesRev: typeof _0x3be9ae._nodesRev === "number" ? _0x3be9ae._nodesRev : typeof _0x3be9ae._persistRev === "number" ? _0x3be9ae._persistRev : 0,
      renderRequestRev: typeof _0x3be9ae._renderRequestRev === "number" ? _0x3be9ae._renderRequestRev : 0,
      edgesRev: typeof _0x3be9ae._edgesRev === "number" ? _0x3be9ae._edgesRev : 0,
      viewport: {
        x: normalizeNumber(_0x24f1c2.x),
        y: normalizeNumber(_0x24f1c2.y),
        zoom: normalizeNumber(_0x24f1c2.zoom, 1)
      },
      connOverlay: {
        srcId: _0x45229d.srcId || "",
        hoverId: _0x45229d.hoverId || "",
        side: _0x45229d.side || "",
        active: _0x45229d.active === true,
        invalidNodeIds: Array.isArray(_0x45229d.invalidNodeIds) ? _0x45229d.invalidNodeIds.map(_0x2a9fe3 => String(_0x2a9fe3)) : []
      },
      pickConnectMode: {
        active: _0xfce5eb.active === true,
        sourceNodeId: _0xfce5eb.sourceNodeId || "",
        hoverNodeId: _0xfce5eb.hoverNodeId || "",
        handleDirection: _0xfce5eb.handleDirection || ""
      },
      selectionBox: {
        active: _0x978267.active === true,
        x1: normalizeNumber(_0x978267.x1),
        y1: normalizeNumber(_0x978267.y1),
        x2: normalizeNumber(_0x978267.x2),
        y2: normalizeNumber(_0x978267.y2)
      },
      picker: {
        visible: _0x32a1d5.visible === true,
        x: normalizeNumber(_0x32a1d5.x),
        y: normalizeNumber(_0x32a1d5.y),
        screenX: normalizeNumber(_0x32a1d5.screenX),
        screenY: normalizeNumber(_0x32a1d5.screenY)
      },
      contextMenu: {
        visible: _0x455c66.visible === true,
        x: normalizeNumber(_0x455c66.x),
        y: normalizeNumber(_0x455c66.y),
        itemCount: Array.isArray(_0x455c66.items) ? _0x455c66.items.length : 0
      },
      ui: {
        connectionLinesVisible: _0x34cfbf.connectionLinesVisible !== false,
        connectionLineStyle: _0x34cfbf.connectionLineStyle || "curve",
        imageVideoNodeResizeEnabled: _0x34cfbf.imageVideoNodeResizeEnabled === true,
        selectionRelatedHighlightEnabled: _0x34cfbf.selectionRelatedHighlightEnabled !== false,
        selectionRelatedHighlightColor: _0x34cfbf.selectionRelatedHighlightColor || "",
        showVideoMeta: _0x34cfbf.showVideoMeta === true,
        titleFollowsCanvasZoom: _0x34cfbf.titleFollowsCanvasZoom === true,
        alignFeatureEnabled: _0x34cfbf.alignFeatureEnabled !== false,
        alignFeatureTriggerMode: _0x34cfbf.alignFeatureTriggerMode || "click",
        alignPanelVisible: _0x34cfbf.alignPanelVisible === true,
        alignPanelAnchorWorld: _0x34cfbf.alignPanelAnchorWorld ? {
          x: normalizeNumber(_0x34cfbf.alignPanelAnchorWorld.x),
          y: normalizeNumber(_0x34cfbf.alignPanelAnchorWorld.y)
        } : null
      }
    });
  }
  function _0x2b1732(_0x52c906 = {}) {
    const _0x276ef6 = Array.isArray(_0x52c906.selectedNodeIds) ? _0x52c906.selectedNodeIds.filter(Boolean) : [];
    const _0x42153c = new Set(_0x276ef6);
    const _0x1b316e = _0x52c906.edges || {};
    const _0x3ba2b7 = typeof _0x52c906._edgesRev === "number" ? _0x52c906._edgesRev : 0;
    _0x2262a6?.(_0x1b316e, _0x3ba2b7);
    const _0x190ba5 = _0x52c906.ui?.selectionRelatedHighlightEnabled === false ? {
      relatedNodeIds: new Set(),
      relatedEdgeIds: new Set()
    } : _0x4c02d1?.(_0x42153c, _0x1b316e) || {};
    return {
      selectedNodeIds: _0x276ef6,
      relatedNodeIds: _0x190ba5.relatedNodeIds || new Set(),
      relatedEdgeIds: _0x190ba5.relatedEdgeIds || new Set(),
      signature: _0x276ef6.map(_0x483a16 => String(_0x483a16)).join("")
    };
  }
  function _0x1cd052(_0x262cd2) {
    _0x88ff06 = _0x31c303(_0x262cd2);
    _0x28c554 = _0x2b1732(_0x262cd2);
    _0x153994 = hasNodeRevision(_0x262cd2);
    _0x45a4de = _0x262cd2?.nodes || null;
  }
  function _0x5c6491() {
    _0x88ff06 = "";
    _0x28c554 = null;
    _0x153994 = false;
    _0x45a4de = null;
  }
  function _0x4c206f(_0x4a715d, _0x42e2f4 = {}) {
    if (!_0x4a715d || !_0x88ff06) {
      return false;
    }
    if ((!_0x153994 || !hasNodeRevision(_0x4a715d)) && (_0x4a715d.nodes || null) !== _0x45a4de) {
      return false;
    }
    const _0x53b636 = _0x3593d9?.() === true;
    if (_0x53b636 && _0x42e2f4?.allowPendingRaf !== true) {
      return false;
    }
    const _0xfaabd0 = _0x31c303(_0x4a715d);
    if (_0xfaabd0 !== _0x88ff06) {
      return false;
    }
    const _0x4c738b = _0x2b1732(_0x4a715d);
    const _0x1c60ee = _0x28c554;
    if (!_0x1c60ee) {
      return false;
    }
    if (_0x4c738b.signature === _0x1c60ee.signature) {
      _0x266359?.(_0x4a715d);
      _0x28c554 = _0x4c738b;
      return true;
    }
    if (_0x53b636 && _0x42e2f4?.cancelPendingRaf === true) {
      _0x2cbb11?.();
    }
    const _0x2cba82 = new Set([...(_0x1c60ee.selectedNodeIds || []), ...(_0x4c738b.selectedNodeIds || []), ...(_0x1c60ee.relatedNodeIds || []), ...(_0x4c738b.relatedNodeIds || [])]);
    _0x266359?.(_0x4a715d);
    _0x15a2d9?.(_0x4a715d.viewport);
    _0x3ee078?.([..._0x2cba82], {
      skipInstanceUpdate: true
    });
    const _0x5d8094 = new Set([...(_0x1c60ee.relatedEdgeIds || []), ...(_0x4c738b.relatedEdgeIds || [])]);
    _0xbad28e?.(_0x5d8094, _0x4a715d, _0x4c738b.relatedEdgeIds);
    _0x283d18?.(_0x4a715d);
    _0x28c554 = _0x4c738b;
    return true;
  }
  return {
    flushSelectionOnlySnapshot: _0x4c206f,
    rememberRenderedSnapshot: _0x1cd052,
    reset: _0x5c6491
  };
}