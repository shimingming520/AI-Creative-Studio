const videoFramePresentationState = new WeakMap();
function normalizeSource(_0x2a08b2) {
  const _0xbae977 = String(_0x2a08b2 || "").trim();
  if (!_0xbae977) {
    return "";
  }
  try {
    return new URL(_0xbae977, globalThis.location?.href || globalThis.window?.location?.href).href;
  } catch {
    return _0xbae977;
  }
}
export function getVideoPresentationSource(_0x2e9a21) {
  return normalizeSource(_0x2e9a21?.dataset?.desktopMediaSourceUrl || _0x2e9a21?.currentSrc || _0x2e9a21?.getAttribute?.("src") || _0x2e9a21?.src);
}
function cancelPendingFrameCallback(_0x5f5af1, _0x492717) {
  if (!_0x492717 || _0x492717.callbackId == null) {
    return;
  }
  try {
    _0x5f5af1?.cancelVideoFrameCallback?.(_0x492717.callbackId);
  } catch {}
  _0x492717.callbackId = null;
}
function clearPresentedDataset(_0x1523ab) {
  if (!_0x1523ab?.dataset) {
    return;
  }
  delete _0x1523ab.dataset.firstFramePresented;
  delete _0x1523ab.dataset.firstFramePresentedAt;
  delete _0x1523ab.dataset.firstFramePresentedSource;
}
function createSourceState(_0x2df8ad, _0x74d104) {
  const _0x17151c = videoFramePresentationState.get(_0x2df8ad);
  cancelPendingFrameCallback(_0x2df8ad, _0x17151c);
  clearPresentedDataset(_0x2df8ad);
  const _0x4aac20 = {
    source: _0x74d104,
    callbackId: null,
    frameCallbackObserved: false,
    frameCallbackAt: 0,
    presented: false,
    presentedAt: 0,
    metadata: null,
    listeners: new Set()
  };
  videoFramePresentationState.set(_0x2df8ad, _0x4aac20);
  return _0x4aac20;
}
function readSourceState(_0x265b6f) {
  const _0x20c4a5 = getVideoPresentationSource(_0x265b6f);
  const _0x5a86ed = videoFramePresentationState.get(_0x265b6f);
  if (!_0x20c4a5) {
    if (_0x5a86ed) {
      createSourceState(_0x265b6f, "");
    }
    return {
      source: "",
      state: videoFramePresentationState.get(_0x265b6f) || null
    };
  }
  if (!_0x5a86ed || _0x5a86ed.source !== _0x20c4a5) {
    return {
      source: _0x20c4a5,
      state: createSourceState(_0x265b6f, _0x20c4a5)
    };
  }
  return {
    source: _0x20c4a5,
    state: _0x5a86ed
  };
}
function isCurrentPresentedFrameValid(_0x199223, _0x217022) {
  return !!_0x199223 && !!_0x217022 && _0x199223.isConnected !== false && getVideoPresentationSource(_0x199223) === _0x217022 && !!(Number(_0x199223.readyState || 0) >= 2) && !!(Number(_0x199223.videoWidth || 0) > 0) && !!(Number(_0x199223.videoHeight || 0) > 0) && !_0x199223.error;
}
export function resetVideoFramePresentation(_0x475c78) {
  if (!_0x475c78) {
    return;
  }
  const _0x3fe666 = videoFramePresentationState.get(_0x475c78);
  cancelPendingFrameCallback(_0x475c78, _0x3fe666);
  videoFramePresentationState.delete(_0x475c78);
  clearPresentedDataset(_0x475c78);
}
export function hasPresentedVideoFrame(_0x47b74a, _0x21dfc4 = "") {
  if (!_0x47b74a) {
    return false;
  }
  const _0x152058 = getVideoPresentationSource(_0x47b74a);
  const _0x3c4a4e = normalizeSource(_0x21dfc4);
  if (!_0x152058 || _0x3c4a4e && _0x152058 !== _0x3c4a4e) {
    return false;
  }
  const _0x2a11f8 = videoFramePresentationState.get(_0x47b74a);
  return _0x2a11f8?.presented === true && _0x2a11f8.source === _0x152058 && !!isCurrentPresentedFrameValid(_0x47b74a, _0x152058);
}
export function watchVideoFramePresentation(_0x39329b, _0x50ea75) {
  if (!_0x39329b) {
    return false;
  }
  const {
    source: _0x2e898b,
    state: _0x1513a5
  } = readSourceState(_0x39329b);
  if (!_0x2e898b || !_0x1513a5) {
    return false;
  }
  if (!_0x1513a5.presented && _0x1513a5.frameCallbackObserved && isCurrentPresentedFrameValid(_0x39329b, _0x2e898b)) {
    _0x1513a5.presented = true;
    _0x1513a5.presentedAt = _0x1513a5.frameCallbackAt;
    if (_0x39329b.dataset) {
      _0x39329b.dataset.firstFramePresented = "1";
      _0x39329b.dataset.firstFramePresentedAt = String(_0x1513a5.presentedAt);
      _0x39329b.dataset.firstFramePresentedSource = _0x2e898b;
    }
    globalThis.window?.__runtimeCompareMark?.("video-frame-presentation:ready", {
      source: _0x2e898b,
      readyState: Number(_0x39329b.readyState || 0),
      videoWidth: Number(_0x39329b.videoWidth || 0),
      videoHeight: Number(_0x39329b.videoHeight || 0)
    });
    const _0x482c42 = Array.from(_0x1513a5.listeners);
    _0x1513a5.listeners.clear();
    const _0x451374 = {
      source: _0x2e898b,
      presentedAt: _0x1513a5.presentedAt,
      metadata: _0x1513a5.metadata
    };
    for (const _0xb00181 of _0x482c42) {
      if (videoFramePresentationState.get(_0x39329b) !== _0x1513a5) {
        break;
      }
      _0xb00181(_0x451374);
    }
  }
  if (_0x1513a5.presented && isCurrentPresentedFrameValid(_0x39329b, _0x2e898b)) {
    _0x50ea75?.({
      source: _0x2e898b,
      presentedAt: _0x1513a5.presentedAt,
      metadata: _0x1513a5.metadata
    });
    return true;
  }
  if (typeof _0x50ea75 === "function") {
    _0x1513a5.listeners.add(_0x50ea75);
  }
  if (_0x1513a5.callbackId != null) {
    return true;
  }
  if (typeof _0x39329b.requestVideoFrameCallback !== "function") {
    return false;
  }
  _0x1513a5.callbackId = _0x39329b.requestVideoFrameCallback((_0x27595c, _0x6a2835 = {}) => {
    const _0x2ab367 = videoFramePresentationState.get(_0x39329b);
    if (_0x2ab367 !== _0x1513a5) {
      return;
    }
    _0x1513a5.callbackId = null;
    const _0x22babb = _0x39329b?.isConnected !== false && getVideoPresentationSource(_0x39329b) === _0x2e898b && !!(Number(_0x39329b?.videoWidth || _0x6a2835.width || 0) > 0) && !!(Number(_0x39329b?.videoHeight || _0x6a2835.height || 0) > 0) && !_0x39329b?.error;
    if (_0x22babb) {
      _0x1513a5.frameCallbackObserved = true;
      _0x1513a5.frameCallbackAt = Number(_0x27595c || 0);
      _0x1513a5.metadata = {
        mediaTime: Number(_0x6a2835.mediaTime || 0),
        presentedFrames: Number(_0x6a2835.presentedFrames || 0),
        width: Number(_0x6a2835.width || _0x39329b.videoWidth || 0),
        height: Number(_0x6a2835.height || _0x39329b.videoHeight || 0)
      };
    }
    if (!isCurrentPresentedFrameValid(_0x39329b, _0x2e898b)) {
      globalThis.window?.__runtimeCompareMark?.("video-frame-presentation:invalid", {
        source: _0x2e898b,
        currentSource: getVideoPresentationSource(_0x39329b),
        readyState: Number(_0x39329b?.readyState || 0),
        videoWidth: Number(_0x39329b?.videoWidth || 0),
        videoHeight: Number(_0x39329b?.videoHeight || 0)
      });
      return;
    }
    _0x1513a5.presented = true;
    _0x1513a5.presentedAt = _0x1513a5.frameCallbackAt;
    if (_0x39329b.dataset) {
      _0x39329b.dataset.firstFramePresented = "1";
      _0x39329b.dataset.firstFramePresentedAt = String(_0x1513a5.presentedAt);
      _0x39329b.dataset.firstFramePresentedSource = _0x2e898b;
    }
    globalThis.window?.__runtimeCompareMark?.("video-frame-presentation:ready", {
      source: _0x2e898b,
      readyState: Number(_0x39329b.readyState || 0),
      videoWidth: Number(_0x39329b.videoWidth || 0),
      videoHeight: Number(_0x39329b.videoHeight || 0)
    });
    const _0x1140d1 = Array.from(_0x1513a5.listeners);
    _0x1513a5.listeners.clear();
    const _0x3666e9 = {
      source: _0x2e898b,
      presentedAt: _0x1513a5.presentedAt,
      metadata: _0x1513a5.metadata
    };
    for (const _0x49a431 of _0x1140d1) {
      if (videoFramePresentationState.get(_0x39329b) !== _0x1513a5) {
        break;
      }
      _0x49a431(_0x3666e9);
    }
  });
  return true;
}
export const __videoFramePresentationForTest = {
  getState(_0x33778b) {
    return videoFramePresentationState.get(_0x33778b) || null;
  }
};