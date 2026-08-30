import { isNodeType } from "../modules/registry.js";
import { resolveRendererLowZoomMountLimit } from "./rendererVirtualization.js";
export const RENDERER_DEFER_MEDIA_ON_MOUNT_FLAG = "__rendererDeferMediaOnMount";
export const RENDERER_DEFER_DETAILS_ON_MOUNT_FLAG = "__rendererDeferDetailsOnMount";
export const RENDERER_EAGER_VIDEO_PREVIEW_ON_MOUNT_FLAG = "__rendererEagerVideoPreviewOnMount";
export const RENDERER_PREBUILD_OFFSCREEN_FLAG = "__rendererPrebuildOffscreen";
export function shouldDeferRendererMediaOnMount(_0xb8bc48 = {}) {
  return _0xb8bc48?.[RENDERER_DEFER_MEDIA_ON_MOUNT_FLAG] === true;
}
export function shouldDeferRendererDetailsOnMount(_0x1ad2fb = {}) {
  return _0x1ad2fb?.[RENDERER_DEFER_DETAILS_ON_MOUNT_FLAG] === true;
}
export function shouldUseRendererEagerVideoPreviewOnMount(_0x31b23d = {}) {
  return _0x31b23d?.[RENDERER_EAGER_VIDEO_PREVIEW_ON_MOUNT_FLAG] === true;
}
export function shouldPrebuildRendererRuntimeOffscreen(_0x3a4aa8 = {}) {
  return _0x3a4aa8?.[RENDERER_PREBUILD_OFFSCREEN_FLAG] === true;
}
export function shouldActivateRendererMediaHoverPlayback({
  viewport: _0x5c6d33,
  nodeCount = 0,
  isSelected = false
} = {}) {
  if (isSelected === true) {
    return true;
  }
  return resolveRendererLowZoomMountLimit({
    viewport: _0x5c6d33,
    nodeCount: nodeCount
  }) <= 0;
}
export function withRendererDeferredMountHints(_0x5c5355 = {}, {
  deferMedia = false,
  deferDetails = false,
  eagerVideoPreview = false,
  prebuildOffscreen = false
} = {}) {
  if (!deferMedia && !deferDetails && !eagerVideoPreview && !prebuildOffscreen) {
    return _0x5c5355;
  }
  return {
    ...(_0x5c5355 || {}),
    ...(deferMedia ? {
      [RENDERER_DEFER_MEDIA_ON_MOUNT_FLAG]: true
    } : {}),
    ...(deferDetails ? {
      [RENDERER_DEFER_DETAILS_ON_MOUNT_FLAG]: true
    } : {}),
    ...(eagerVideoPreview ? {
      [RENDERER_EAGER_VIDEO_PREVIEW_ON_MOUNT_FLAG]: true
    } : {}),
    ...(prebuildOffscreen ? {
      [RENDERER_PREBUILD_OFFSCREEN_FLAG]: true
    } : {})
  };
}
export function withRendererDeferredMediaHint(_0x3e886d = {}, _0x16d91e = false) {
  return withRendererDeferredMountHints(_0x3e886d, {
    deferMedia: _0x16d91e
  });
}
export function scheduleRendererVisibleAudioWarmup({
  node: _0x4da11b,
  nodeId: _0x1a5fe7,
  isVisible: _0x52a8d9,
  isSelected: _0x13fe31,
  viewport: _0x160c48,
  nodeCount: _0x2ed5a9,
  visibleAudioRank = 1,
  component: _0x1e5a78,
  deferredMedia: _0x385fad
} = {}) {
  if (!_0x1a5fe7 || _0x52a8d9 !== true) {
    return false;
  }
  if (!isNodeType(_0x4da11b, ["source-audio", "ai-audio", "audio"])) {
    return false;
  }
  if (_0x13fe31 !== true && resolveRendererLowZoomMountLimit({
    viewport: _0x160c48,
    nodeCount: _0x2ed5a9
  }) > 0) {
    return false;
  }
  if (_0x1e5a78?.prepareRendererVisibleAudioPlayback?.({
    eager: true
  }) !== true) {
    return false;
  }
  if (_0x13fe31) {
    _0x385fad?.hydrateNow?.(_0x1a5fe7);
  } else {
    _0x385fad?.enqueue?.(_0x1a5fe7, {
      urgent: true
    });
  }
  return true;
}
export function createRendererVisibleAudioWarmupPass({
  viewport: _0x2d73b9,
  nodeCount: _0x5b5aa3,
  deferredMedia: _0x53c27c
} = {}) {
  let _0x53fe15 = 0;
  return ({
    node: _0x3dc6b6,
    nodeId: _0x29cbe1,
    isVisible: _0x20577e,
    isSelected: _0x5cca73,
    component: _0x940ae3
  } = {}) => {
    const _0x40dbb1 = _0x5cca73 !== true && _0x20577e === true && isNodeType(_0x3dc6b6, ["source-audio", "ai-audio", "audio"]) ? _0x53fe15 += 1 : 1;
    return scheduleRendererVisibleAudioWarmup({
      node: _0x3dc6b6,
      nodeId: _0x29cbe1,
      isVisible: _0x20577e,
      isSelected: _0x5cca73,
      viewport: _0x2d73b9,
      nodeCount: _0x5b5aa3,
      visibleAudioRank: _0x40dbb1,
      component: _0x940ae3,
      deferredMedia: _0x53c27c
    });
  };
}
const DEFAULT_MEDIA_HYDRATION_BATCH_SIZE = 3;
const DEFAULT_MEDIA_HYDRATION_RETRY_MS = 120;
const DEFAULT_MEDIA_HYDRATION_FALLBACK_MS = 24;
const DEFAULT_MEDIA_HYDRATION_IDLE_TIMEOUT_MS = 180;
const DEFAULT_VIDEO_HYDRATION_BATCH_SIZE = 1;
const VIDEO_MEDIA_NODE_TYPES = new Set(["source-video", "ai-video", "video"]);
function getWindowLike() {
  if (typeof window !== "undefined") {
    return window;
  } else {
    return globalThis;
  }
}
function getDeferredMediaComponentType(_0x206f41) {
  return String(_0x206f41?._data?.type || _0x206f41?.nodeData?.type || _0x206f41?.data?.type || "").trim().toLowerCase();
}
function isDeferredVideoMediaComponent(_0x21fa20) {
  return VIDEO_MEDIA_NODE_TYPES.has(getDeferredMediaComponentType(_0x21fa20));
}
export function createRendererDeferredMediaController({
  getComponent: _0x58f58c,
  isInteractionBusy: _0x1e2597,
  onHydrateMedia: _0x36b12c,
  onHydrateDiagnostic: _0x1ef6e1,
  canHydrateMedia: _0x7311da,
  canHydrateVideo: _0x476f16,
  batchSize = DEFAULT_MEDIA_HYDRATION_BATCH_SIZE,
  videoBatchSize = DEFAULT_VIDEO_HYDRATION_BATCH_SIZE
} = {}) {
  let _0x503943 = [];
  let _0x2a2b8a = new Set();
  let _0x5c9c57 = new Set();
  let _0x127255 = null;
  let _0x149100 = "";
  const _0xbb50d9 = Math.max(1, Math.trunc(Number(batchSize) || 1));
  const _0x18ab2e = Math.max(1, Math.min(_0xbb50d9, Math.trunc(Number(videoBatchSize) || 1)));
  function _0x5112e7(_0x1c2f1d) {
    const _0x304904 = _0x503943.filter(_0x3b57e5 => _0x3b57e5 !== _0x1c2f1d);
    const _0x46128d = _0x304904.findIndex(_0x44bff7 => !_0x5c9c57.has(_0x44bff7));
    if (_0x46128d < 0) {
      _0x304904.push(_0x1c2f1d);
    } else {
      _0x304904.splice(_0x46128d, 0, _0x1c2f1d);
    }
    _0x503943 = _0x304904;
  }
  function _0x515add() {
    if (_0x127255 === null) {
      return;
    }
    const _0x1dfd28 = getWindowLike();
    if (_0x149100 === "idle" && typeof _0x1dfd28.cancelIdleCallback === "function") {
      _0x1dfd28.cancelIdleCallback(_0x127255);
    } else if (_0x149100 === "timeout") {
      clearTimeout(_0x127255);
    }
    _0x127255 = null;
    _0x149100 = "";
  }
  function _0x58b51f(_0x3bcfed = DEFAULT_MEDIA_HYDRATION_FALLBACK_MS, _0x1b753f = false) {
    if (_0x503943.length === 0) {
      return;
    }
    if (_0x127255 !== null) {
      if (!_0x1b753f) {
        return;
      }
      _0x515add();
    }
    const _0x5ba566 = getWindowLike();
    if (!_0x1b753f && _0x1e2597?.()) {
      _0x149100 = "timeout";
      _0x127255 = setTimeout(_0x5df15a, DEFAULT_MEDIA_HYDRATION_RETRY_MS);
      return;
    }
    if (_0x1b753f || _0x503943.length >= _0xbb50d9 * 4) {
      _0x149100 = "timeout";
      _0x127255 = setTimeout(_0x5df15a, Math.max(0, Number(_0x3bcfed) || 0));
      return;
    }
    if (typeof _0x5ba566.requestIdleCallback === "function") {
      _0x149100 = "idle";
      _0x127255 = _0x5ba566.requestIdleCallback(_0x5df15a, {
        timeout: DEFAULT_MEDIA_HYDRATION_IDLE_TIMEOUT_MS
      });
      return;
    }
    _0x149100 = "timeout";
    _0x127255 = setTimeout(_0x5df15a, Math.max(0, Number(_0x3bcfed) || 0));
  }
  function _0x11b5d5(_0x44fe4f) {
    _0x2a2b8a.delete(_0x44fe4f);
    _0x5c9c57.delete(_0x44fe4f);
    const _0x10731b = _0x58f58c?.(_0x44fe4f);
    if (typeof _0x7311da === "function" && _0x7311da(_0x44fe4f, _0x10731b) !== true) {
      return {
        isVideoMedia: isDeferredVideoMediaComponent(_0x10731b),
        hydrated: false
      };
    }
    const _0x2fc494 = isDeferredVideoMediaComponent(_0x10731b);
    const _0x215204 = typeof _0x1ef6e1 === "function" && typeof performance !== "undefined" && typeof performance.now === "function" ? performance.now() : 0;
    _0x10731b?.hydrateDeferredMedia?.();
    _0x36b12c?.(_0x44fe4f);
    if (typeof _0x1ef6e1 === "function") {
      const _0x2d6b8f = typeof performance !== "undefined" && typeof performance.now === "function" ? performance.now() : _0x215204;
      _0x1ef6e1({
        nodeId: _0x44fe4f,
        isVideoMedia: _0x2fc494,
        durationMs: Math.max(0, _0x2d6b8f - _0x215204)
      });
    }
    return {
      isVideoMedia: _0x2fc494,
      hydrated: true
    };
  }
  function _0x494e1d() {
    if (typeof _0x7311da !== "function" || _0x503943.length === 0) {
      return;
    }
    _0x503943 = _0x503943.filter(_0x37b6c3 => {
      if (!_0x2a2b8a.has(_0x37b6c3)) {
        return false;
      }
      const _0x48bf9a = _0x58f58c?.(_0x37b6c3);
      if (_0x7311da(_0x37b6c3, _0x48bf9a) === true) {
        return true;
      }
      _0x2a2b8a.delete(_0x37b6c3);
      _0x5c9c57.delete(_0x37b6c3);
      return false;
    });
  }
  function _0x5df15a(_0x459e10 = null) {
    _0x127255 = null;
    _0x149100 = "";
    _0x494e1d();
    if (_0x503943.length === 0) {
      return;
    }
    const _0x74fd53 = _0x1e2597?.() === true;
    if (_0x74fd53 && !_0x503943.some(_0x3d099e => _0x5c9c57.has(_0x3d099e))) {
      _0x58b51f(DEFAULT_MEDIA_HYDRATION_RETRY_MS);
      return;
    }
    const _0x5c017a = () => {
      if (!_0x459e10 || _0x459e10.didTimeout) {
        return true;
      }
      if (typeof _0x459e10.timeRemaining !== "function") {
        return true;
      }
      return _0x459e10.timeRemaining() > 8;
    };
    let _0x200eb5 = 0;
    let _0xb05576 = 0;
    while (_0x503943.length > 0 && _0x200eb5 < _0xbb50d9 && _0x5c017a()) {
      const _0x2eb47c = _0x503943.findIndex(_0xc3bc4b => {
        if (!_0x2a2b8a.has(_0xc3bc4b)) {
          return true;
        }
        if (_0x74fd53 && !_0x5c9c57.has(_0xc3bc4b)) {
          return false;
        }
        const _0x2a7239 = _0x58f58c?.(_0xc3bc4b);
        return !isDeferredVideoMediaComponent(_0x2a7239) || typeof _0x476f16 !== "function" || _0x476f16(_0xc3bc4b, _0x2a7239) === true;
      });
      if (_0x2eb47c < 0) {
        break;
      }
      const [_0x288231] = _0x503943.splice(_0x2eb47c, 1);
      if (!_0x2a2b8a.has(_0x288231)) {
        continue;
      }
      const {
        isVideoMedia: _0x5e9108,
        hydrated: _0x16107d
      } = _0x11b5d5(_0x288231);
      if (!_0x16107d) {
        continue;
      }
      _0x200eb5 += 1;
      if (_0x5e9108) {
        _0xb05576 += 1;
        if (_0xb05576 >= _0x18ab2e) {
          break;
        }
      }
    }
    if (_0x503943.length > 0) {
      const _0x5b2f40 = _0x503943.some(_0x7a5f8f => _0x5c9c57.has(_0x7a5f8f));
      _0x58b51f(_0x5b2f40 ? 0 : undefined, _0x5b2f40);
    }
  }
  function _0x1e5f8e(_0x3cfa15, _0x5fe349 = {}) {
    if (!_0x3cfa15) {
      return;
    }
    const _0x268f67 = _0x58f58c?.(_0x3cfa15);
    if (typeof _0x7311da === "function" && _0x7311da(_0x3cfa15, _0x268f67) !== true) {
      _0x14bd17(_0x3cfa15);
      return;
    }
    const _0x1a0b45 = _0x5fe349?.urgent === true;
    if (_0x2a2b8a.has(_0x3cfa15)) {
      if (_0x1a0b45 && !_0x5c9c57.has(_0x3cfa15)) {
        _0x5c9c57.add(_0x3cfa15);
        _0x5112e7(_0x3cfa15);
        _0x58b51f(0, true);
      }
      return;
    }
    _0x2a2b8a.add(_0x3cfa15);
    if (_0x1a0b45) {
      _0x5c9c57.add(_0x3cfa15);
      _0x5112e7(_0x3cfa15);
    } else {
      _0x503943.push(_0x3cfa15);
    }
    _0x58b51f(_0x1a0b45 ? 0 : undefined, _0x1a0b45);
  }
  function _0x14bd17(_0x2d42fb) {
    if (!_0x2d42fb) {
      return;
    }
    _0x2a2b8a.delete(_0x2d42fb);
    _0x5c9c57.delete(_0x2d42fb);
  }
  function _0x18c855(_0x334800) {
    if (!_0x334800) {
      return null;
    }
    _0x2a2b8a.delete(_0x334800);
    _0x5c9c57.delete(_0x334800);
    _0x503943 = _0x503943.filter(_0x2a19ec => _0x2a19ec !== _0x334800);
    const _0x2db395 = _0x58f58c?.(_0x334800);
    if (typeof _0x7311da === "function" && _0x7311da(_0x334800, _0x2db395) !== true) {
      return null;
    }
    return _0x11b5d5(_0x334800);
  }
  function _0x1d789d() {
    _0x515add();
    _0x503943 = [];
    _0x2a2b8a = new Set();
    _0x5c9c57 = new Set();
  }
  return {
    clear: _0x1d789d,
    enqueue: _0x1e5f8e,
    flush: _0x5df15a,
    forget: _0x14bd17,
    hydrateNow: _0x18c855,
    resume: _0x58b51f,
    getQueuedCount: () => _0x2a2b8a.size
  };
}