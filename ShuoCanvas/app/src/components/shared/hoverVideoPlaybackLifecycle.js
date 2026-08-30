const externalVideoPlaybackOwners = new WeakMap();
export function claimExternalVideoPlayback(_0x47de06, _0x466efe) {
  if (!_0x47de06 || !_0x466efe) {
    return false;
  }
  externalVideoPlaybackOwners.set(_0x47de06, _0x466efe);
  return true;
}
export function releaseExternalVideoPlayback(_0x358353, _0x975796) {
  if (!_0x358353) {
    return false;
  }
  const _0x4e6c36 = externalVideoPlaybackOwners.get(_0x358353);
  if (!_0x4e6c36 || _0x975796 && _0x4e6c36 !== _0x975796) {
    return false;
  }
  externalVideoPlaybackOwners.delete(_0x358353);
  return true;
}
export function isExternallyOwnedVideoPlayback(_0x3935d3) {
  return !!_0x3935d3 && externalVideoPlaybackOwners.has(_0x3935d3);
}
export function setHoverPlaybackChromeVisible({
  controlsEl = null,
  muteEl = null,
  centerEl = null
} = {}, _0x3060a9 = false) {
  const _0x1e76a5 = _0x3060a9 ? "flex" : "none";
  if (controlsEl?.style) {
    controlsEl.style.display = _0x1e76a5;
  }
  if (muteEl?.style) {
    muteEl.style.display = _0x1e76a5;
  }
  if (centerEl?.style) {
    centerEl.style.display = _0x1e76a5;
  }
}
export function shouldKeepManualPlaybackPresentationActive(_0x4f6610, _0x313e49) {
  return _0x313e49?.paused === false && (_0x4f6610?._isManualControl === true || _0x4f6610?._isManualLoopPlayback === true || isExternallyOwnedVideoPlayback(_0x313e49));
}
export function createHoverVideoPlaybackLifecycle({
  releaseMedia: _0x6351f,
  releaseDelayMs = 0,
  schedule = (_0x23dcfc, _0x5595fc) => globalThis.setTimeout(_0x23dcfc, _0x5595fc),
  cancel = _0x174de2 => globalThis.clearTimeout(_0x174de2)
} = {}) {
  let _0x36e126 = false;
  let _0x50dc55 = null;
  let _0x16df7f = 0;
  const _0xea34aa = () => {
    _0x16df7f += 1;
    if (_0x50dc55 === null) {
      return false;
    }
    cancel(_0x50dc55);
    _0x50dc55 = null;
    return true;
  };
  return {
    activate() {
      if (_0x36e126) {
        return false;
      }
      _0xea34aa();
      return true;
    },
    deactivate({
      release = true
    } = {}) {
      if (_0x36e126) {
        return false;
      }
      _0xea34aa();
      if (release !== true || typeof _0x6351f !== "function") {
        return false;
      }
      const _0x4237bb = ++_0x16df7f;
      _0x50dc55 = schedule(() => {
        if (_0x36e126 || _0x4237bb !== _0x16df7f) {
          return;
        }
        _0x50dc55 = null;
        _0x6351f();
      }, Math.max(0, Number(releaseDelayMs) || 0));
      return true;
    },
    dispose() {
      if (_0x36e126) {
        return;
      }
      _0xea34aa();
      _0x36e126 = true;
    },
    hasPendingRelease() {
      return _0x50dc55 !== null;
    }
  };
}