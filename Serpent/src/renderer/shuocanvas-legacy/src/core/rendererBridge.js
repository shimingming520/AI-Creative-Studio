export function syncRendererBridge(_0xa991c5, _0x416156 = {}) {
  if (!_0xa991c5) {
    return;
  }
  const {
    componentMap: _0x214d7d,
    wrapperMap: _0xb47e6d,
    mountedNodeIds: _0x2b461b,
    nodeToEdgeIds: _0x48a077,
    getEdgeLayerStats: _0x33346c,
    hitTestEdgeAtScreenPoint: _0x5a1600,
    prepareDynamicEdges: _0x47a64d,
    setEdgeInteractionHighlight: _0x3747f0,
    setHoveredEdge: _0x22513b,
    markViewportInteractionBusy: _0x4ac932,
    releaseViewportInteractionBusy: _0x364d3a,
    pinNode: _0x409a1b,
    unpinNode: _0x37cf80,
    releaseFastPreviewForPlayback: _0x2d89a5,
    prepareMediaSlotSource: _0x4f0b9e,
    reportMediaSlotFrame: _0x151d14,
    flushNode: _0x440f2d,
    flushNodes: _0x3cf946,
    flushSelection: _0x612568,
    excludeRasterPreviewNode: _0x4fab8f,
    syncFastPreviewDragProxy: _0x293d06
  } = _0x416156;
  _0xa991c5.v2Renderer = _0xa991c5.v2Renderer || {};
  delete _0xa991c5.v2Renderer.nodeInstances;
  delete _0xa991c5.v2Renderer.wrapperMap;
  Object.assign(_0xa991c5.v2Renderer, {
    getMountedNodeCount() {
      return _0xb47e6d?.size || 0;
    },
    isNodeMounted(_0x561029) {
      return !!_0x561029 && !!_0x2b461b?.has?.(_0x561029) && !!_0xb47e6d?.get?.(_0x561029)?.isConnected;
    },
    getMountedWrapper(_0x3d060e) {
      if (!_0x3d060e || !_0x2b461b?.has?.(_0x3d060e)) {
        return null;
      }
      const _0x1c2276 = _0xb47e6d?.get?.(_0x3d060e);
      if (_0x1c2276?.isConnected) {
        return _0x1c2276;
      } else {
        return null;
      }
    },
    queryMountedNodeElement(_0x34044d, _0x435db8) {
      const _0x4f4bfe = _0x34044d ? _0x214d7d?.get?.(_0x34044d) : null;
      const _0x2a61c5 = _0x4f4bfe?.el || this.getMountedWrapper(_0x34044d);
      if (_0x435db8) {
        return _0x2a61c5?.querySelector?.(_0x435db8) || null;
      } else {
        return _0x2a61c5 || null;
      }
    },
    highlightDropSlot(_0x4fc0b7, {
      kind = "",
      index = -1
    } = {}) {
      if (!_0x4fc0b7) {
        return false;
      }
      const _0x2acd22 = _0x214d7d?.get?.(_0x4fc0b7);
      if (kind === "storyboard" && typeof _0x2acd22?.highlightCell === "function") {
        _0x2acd22.highlightCell(index);
        return true;
      }
      if (kind === "collage" && typeof _0x2acd22?.highlightSlot === "function") {
        _0x2acd22.highlightSlot(index);
        return true;
      }
      return false;
    },
    clearDropSlotHighlight(_0x33e803) {
      if (!_0x33e803) {
        return false;
      }
      const _0x318c5b = _0x214d7d?.get?.(_0x33e803);
      let _0x37c72a = false;
      if (typeof _0x318c5b?.highlightCell === "function") {
        _0x318c5b.highlightCell(-1);
        _0x37c72a = true;
      }
      if (typeof _0x318c5b?.highlightSlot === "function") {
        _0x318c5b.highlightSlot(-1);
        _0x37c72a = true;
      }
      return _0x37c72a;
    },
    syncNodeDragPreview(_0x2f231a, _0x616fe5) {
      if (!_0x2f231a) {
        return false;
      }
      let _0x1e154c = false;
      if ((_0x616fe5?.active === true || _0x616fe5?.remove === true) && typeof _0x4fab8f === "function") {
        _0x1e154c = _0x4fab8f(_0x2f231a) === true || _0x1e154c;
      }
      const _0x49a9ef = _0x214d7d?.get?.(_0x2f231a);
      if (typeof _0x49a9ef?.syncDragPreview === "function") {
        _0x49a9ef.syncDragPreview(_0x616fe5);
        _0x1e154c = true;
      }
      if (typeof _0x293d06 === "function") {
        _0x1e154c = _0x293d06(_0x2f231a, _0x616fe5) || _0x1e154c;
      }
      return _0x1e154c;
    },
    applyImmediateCellSwapPreview(_0xd55e18, {
      sourceIndex: _0x460e83,
      targetIndex: _0x3a72d1
    } = {}) {
      if (!_0xd55e18) {
        return {
          ok: false,
          revert() {}
        };
      }
      const _0x579d70 = _0x214d7d?.get?.(_0xd55e18);
      if (typeof _0x579d70?.applyImmediateCellSwap !== "function") {
        return {
          ok: false,
          revert() {}
        };
      }
      const _0x154c4b = _0x579d70.applyImmediateCellSwap(_0x460e83, _0x3a72d1);
      if (_0x154c4b && _0x154c4b.ok === true && typeof _0x154c4b.revert === "function") {
        return _0x154c4b;
      } else {
        return {
          ok: false,
          revert() {}
        };
      }
    },
    previewCollageItems(_0x12006b, _0x4cf8fe) {
      if (!_0x12006b) {
        return false;
      }
      const _0x1b244a = _0x214d7d?.get?.(_0x12006b);
      if (typeof _0x1b244a?.previewItems !== "function") {
        return false;
      }
      _0x1b244a.previewItems(_0x4cf8fe);
      return true;
    },
    runMountedNodeGeneration(_0x58fb88) {
      if (!_0x58fb88) {
        return {
          started: false,
          result: null
        };
      }
      const _0x47cd28 = _0x214d7d?.get?.(_0x58fb88);
      if (typeof _0x47cd28?.runGeneration !== "function") {
        return {
          started: false,
          result: null
        };
      }
      return {
        started: true,
        result: Promise.resolve().then(() => _0x47cd28.runGeneration())
      };
    },
    getEdgeIdsForNode(_0x1a299c) {
      if (!_0x1a299c) {
        return [];
      }
      const _0x526de4 = _0x48a077?.get?.(_0x1a299c);
      if (_0x526de4) {
        return Array.from(_0x526de4);
      } else {
        return [];
      }
    },
    ...(typeof _0x33346c === "function" ? {
      getEdgeLayerStats: _0x33346c
    } : {}),
    ...(typeof _0x5a1600 === "function" ? {
      hitTestEdgeAtScreenPoint: _0x5a1600
    } : {}),
    ...(typeof _0x47a64d === "function" ? {
      prepareDynamicEdges: _0x47a64d
    } : {}),
    ...(typeof _0x3747f0 === "function" ? {
      setEdgeInteractionHighlight: _0x3747f0
    } : {}),
    ...(typeof _0x22513b === "function" ? {
      setHoveredEdge: _0x22513b
    } : {}),
    markViewportInteractionBusy: _0x4ac932,
    releaseViewportInteractionBusy: _0x364d3a,
    ...(typeof _0x2d89a5 === "function" ? {
      releaseFastPreviewForPlayback: _0x2d89a5
    } : {}),
    ...(typeof _0x4f0b9e === "function" ? {
      prepareMediaSlotSource: _0x4f0b9e
    } : {}),
    ...(typeof _0x151d14 === "function" ? {
      reportMediaSlotFrame: _0x151d14
    } : {}),
    pinNode: _0x409a1b,
    unpinNode: _0x37cf80,
    ...(typeof _0x440f2d === "function" ? {
      flushNode: _0x440f2d
    } : {}),
    ...(typeof _0x3cf946 === "function" ? {
      flushNodes: _0x3cf946
    } : {}),
    ...(typeof _0x612568 === "function" ? {
      flushSelection: _0x612568
    } : {})
  });
}