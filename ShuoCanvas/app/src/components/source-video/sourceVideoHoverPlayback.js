import { logVideoPlaybackEvent } from "../video-node/mediaPlaybackRecovery.js";
import { shouldKeepManualPlaybackPresentationActive } from "../shared/hoverVideoPlaybackLifecycle.js";
import { shouldActivateRendererMediaHoverPlayback } from "../../core/rendererDeferredMedia.js";
export function shouldActivateSourceVideoHoverPlayback(_0x106fa2, _0x59a569) {
  const _0x4e2240 = typeof _0x106fa2?.getStateRaw === "function" ? _0x106fa2.getStateRaw() : _0x106fa2?.getState?.();
  return shouldActivateRendererMediaHoverPlayback({
    viewport: _0x4e2240?.viewport,
    nodeCount: Object.keys(_0x4e2240?.nodes || {}).length,
    isSelected: _0x4e2240?.selectedNodeIds?.includes?.(_0x59a569) === true
  });
}
export function syncSourceVideoPlaybackChromeVisibility(_0x536c2c, {
  forceHidden = false
} = {}) {
  const _0x451935 = forceHidden !== true && !!String(_0x536c2c?._currentSrc || "").trim() && (!!_0x536c2c?._isHovered || !!_0x536c2c?._isManualControl || !!_0x536c2c?._isManualLoopPlayback || !!_0x536c2c?._isSeeking);
  if (_0x536c2c?._controls?.style) {
    _0x536c2c._controls.style.opacity = _0x451935 ? "1" : "0";
    _0x536c2c._controls.style.pointerEvents = _0x451935 ? "auto" : "none";
  }
  if (_0x536c2c?._muteBtn?.style) {
    _0x536c2c._muteBtn.style.display = _0x451935 ? "flex" : "none";
    _0x536c2c._muteBtn.style.pointerEvents = _0x451935 ? "auto" : "none";
  }
  const _0x42d2c0 = _0x451935 && (!!_0x536c2c?._isManualControl || !!_0x536c2c?._isManualLoopPlayback);
  if (_0x536c2c?._centerIndicator?.style) {
    _0x536c2c._centerIndicator.style.display = _0x42d2c0 ? "flex" : "none";
  }
  if (!_0x42d2c0 || _0x536c2c?._video?.paused === false) {
    _0x536c2c?._hideCenterIndicator?.();
  } else {
    _0x536c2c?._showPausedCenterIndicator?.();
  }
  return _0x451935;
}
export function deactivateSourceVideoHoverPlayback(_0x1a0ece) {
  if (!_0x1a0ece) {
    return false;
  }
  _0x1a0ece._isHovered = false;
  const _0xb9ef87 = _0x1a0ece._video;
  const _0x23f788 = shouldKeepManualPlaybackPresentationActive(_0x1a0ece, _0xb9ef87);
  if (!_0x23f788) {
    _0x1a0ece._autoPlayToken++;
  }
  if (_0xb9ef87) {
    if (!_0x23f788) {
      _0xb9ef87.loop = false;
    }
    logVideoPlaybackEvent(_0xb9ef87, "hover-leave", {
      label: _0x1a0ece._getPlaybackLabel("hover")
    });
    if (!_0x23f788) {
      _0xb9ef87.pause();
    }
  }
  _0x1a0ece._hoverManualPause = false;
  if (!_0x23f788 && !_0x1a0ece._isManualLoopPlayback) {
    _0x1a0ece._isManualControl = false;
  }
  _0x1a0ece._syncPlaybackChromeVisibility({
    forceHidden: !_0x23f788
  });
  _0x1a0ece._syncRendererPlaybackPin();
  _0x1a0ece._hoverPlaybackLifecycle?.deactivate?.({
    release: false
  });
  return !!_0xb9ef87;
}
export function releaseIdleSourceVideoHoverPlaybackMedia(_0x203957) {
  const _0x417650 = _0x203957?._video;
  if (!_0x417650 || _0x203957._isHovered === true || _0x203957._isManualControl === true || _0x203957._isManualLoopPlayback === true || _0x203957._isSeeking === true || _0x417650.paused === false) {
    return false;
  }
  const _0x598fb2 = String(_0x203957._currentSrc || "").trim();
  const _0x13bb45 = Number(_0x417650.currentTime || 0);
  _0x203957._replacePendingPlaybackResume(_0x598fb2, _0x13bb45);
  _0x203957._playbackSourceToken = Number(_0x203957._playbackSourceToken || 0) + 1;
  _0x203957._playbackSourcePromise = null;
  _0x203957._playbackSourcePromiseSource = "";
  _0x417650.preload = "none";
  _0x203957._clearVideoElementSource();
  _0x203957._syncPosterFrameVisibility({
    force: !!_0x203957._lastPosterSrc
  });
  _0x203957._syncPlaybackChromeVisibility({
    forceHidden: true
  });
  return true;
}