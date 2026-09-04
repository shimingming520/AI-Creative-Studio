import { attachVideoPlaybackRecovery, getVideoCurrentSource, logVideoPlaybackEvent, playVideoWithRecovery } from "./mediaPlaybackRecovery.js";
import { localPathToUrl, urlToLocalPath } from "../../utils/localMediaPath.js";
import { attachMediaElementPlaybackSource, clearDesktopMediaPlaybackSourceMetadata, isMediaElementPlaybackSource } from "../../services/desktopMediaBlobSource.js";
import { getModelManifest } from "../../manifests/index.js";
import { desktopBridge } from "../../services/desktopBridge.js";
import { getTaskMessage, isTaskCancelled, isTaskFailed } from "../../core/generationTaskUiState.js";
import { buildRhAiAppResultDisplayPatch, isRunningHubAiAppManifest } from "../shared/rhAiAppNodeBehavior.js";
import { t } from "../../i18n/index.js";
import { readViewportInteractionState } from "../../core/viewportInteractionState.js";
import { acquireLocalVideoPlaybackObjectUrl, releaseLocalVideoPlaybackObjectUrlOwnerScope } from "../../services/localVideoPlaybackObjectUrlService.js";
import { resolveCanvasVideoDisplayUrl } from "../../services/canvasMediaLocalService.js";
import { revokeTrackedMediaObjectUrl } from "../../services/mediaObjectUrlRegistry.js";
import { getVideoPresentationSource, hasPresentedVideoFrame, resetVideoFramePresentation, watchVideoFramePresentation } from "../../services/videoFramePresentation.js";
import { createVideoGenerationErrorCard } from "./videoGenerationErrorCard.js";
function videoResultRenderText(_0x309b29, _0x576472 = {}) {
  return t("videoResultRender." + _0x309b29, _0x576472);
}
function isChromeShellRuntime() {
  const _0x45b288 = String(globalThis.location?.search || globalThis.window?.location?.search || "");
  return new URLSearchParams(_0x45b288).get("aicRuntime") === "chrome-shell";
}
function shouldUseSharedLocalVideoBlob() {
  if (isChromeShellRuntime()) {
    return true;
  }
  return !desktopBridge.mediaPreview.isAvailable();
}
function isVideoResultViewportBusy() {
  return readViewportInteractionState().isViewportBusy;
}
function isLikelyPosterImageUrl(_0x51bf0b) {
  const _0x56ab0a = String(_0x51bf0b || "").trim();
  if (!_0x56ab0a) {
    return false;
  }
  if (/^(data:image\/|blob:|aic-local-preview:)/i.test(_0x56ab0a)) {
    return true;
  }
  return /\.(?:png|jpe?g|webp|gif|avif|bmp)(?:[?#].*)?$/i.test(_0x56ab0a);
}
function setVideoResultElementVisible(_0x18df50, _0x5f1087) {
  if (!_0x18df50) {
    return;
  }
  const _0x520519 = _0x5f1087 !== true;
  _0x18df50.hidden = _0x520519;
  if (_0x520519) {
    _0x18df50.classList?.add?.("is-hidden");
  } else if (_0x18df50.classList?.contains?.("is-hidden")) {
    _0x18df50.classList?.remove?.("is-hidden");
  }
}
function isVideoResultElementVisible(_0x463f5b) {
  return !!_0x463f5b && _0x463f5b.hidden !== true;
}
function isVideoResultFrameReady(_0x84c954, _0x38efd2 = "") {
  if (!_0x84c954) {
    return false;
  }
  return hasPresentedVideoFrame(_0x84c954, _0x38efd2);
}
function setVideoResultLayerActive(_0x21dc4a, _0x3dfc06, _0x2f48a6) {
  if (!_0x21dc4a) {
    return;
  }
  setVideoResultElementVisible(_0x21dc4a, _0x3dfc06);
  _0x21dc4a.classList?.toggle?.("is-main-result", _0x3dfc06 === true);
  if (Number.isFinite(Number(_0x2f48a6))) {
    _0x21dc4a.style.zIndex = String(_0x2f48a6);
  }
}
function applyVideoResultGeometryAnimationStyle(_0x220cae, _0x1099f1) {
  if (!_0x220cae || !_0x1099f1 || typeof _0x1099f1 !== "object") {
    return;
  }
  Object.assign(_0x220cae.style, _0x1099f1);
}
function getVideoResultMediaKey(_0x4efd22 = {}, _0x139d10 = {}) {
  return [_0x4efd22.displayLocalPath, _0x4efd22.localPath, _0x4efd22.videoUrl, _0x4efd22.url, _0x4efd22.src, _0x4efd22.thumbUrl, _0x4efd22.thumbId, _0x139d10?.localPath, _0x139d10?.videoUrl, _0x139d10?.src, _0x139d10?.thumbUrl].map(_0x3d62be => String(_0x3d62be || "").trim()).find(Boolean) || "";
}
const SELECTED_VIDEO_PRESENTATION_FIELDS = ["videoUrl", "localPath", "displayLocalPath", "videoLocalPath", "thumbId", "thumbUrl", "posterUrl", "thumbnailUrl", "previewUrl", "coverUrl", "posterLocalPath", "thumbLocalPath", "thumbnailLocalPath", "previewLocalPath", "capturePreviewUrl", "capturePreviewLocalPath", "videoThumbSrc", "videoThumbUnavailableSource", "mediaUnavailableSource"];
export function buildSelectedVideoResultPresentationPatch(_0x27cf11 = [], _0x13093b = 0) {
  const _0x46bf3d = Array.isArray(_0x27cf11) ? _0x27cf11 : [];
  const _0x104128 = Math.max(0, Math.min(_0x46bf3d.length - 1, Math.trunc(Number(_0x13093b) || 0)));
  const _0x8e7d4b = _0x46bf3d[_0x104128] && typeof _0x46bf3d[_0x104128] === "object" ? _0x46bf3d[_0x104128] : {};
  const _0xd95cb = {
    mainVideoIndex: _0x104128,
    isVideosExpanded: false,
    mediaUnavailable: _0x8e7d4b.mediaUnavailable === true
  };
  for (const _0x4c072a of SELECTED_VIDEO_PRESENTATION_FIELDS) {
    _0xd95cb[_0x4c072a] = _0x8e7d4b[_0x4c072a] ?? "";
  }
  return _0xd95cb;
}
export function createVideoNodeResultRenderModule(_0x127284) {
  const {
    store: _0x6680a0,
    api: _0x55b1a8,
    getImage: _0xb70b0c,
    ensureThumbDecoded: _0xac96f0,
    buildApiUrl: _0x8c8c14,
    VideoKeyingController: _0x3047cf
  } = _0x127284;
  class _0x42d1f0 {
    _buildRhAiAppVideoResultDisplayPatch(_0x589c28 = {}, _0x1b8acc = 0, _0x39d717 = 0, _0xd40928 = "") {
      if (!isRunningHubAiAppManifest(getModelManifest(_0x589c28?.model))) {
        return {};
      }
      return buildRhAiAppResultDisplayPatch({
        nodeData: _0x589c28,
        mediaWidth: _0x1b8acc,
        mediaHeight: _0x39d717,
        mediaKey: _0xd40928
      });
    }
    _getPreviewVideoRecoveryLabel(_0x178639, _0x1cdc5e = "preview") {
      const _0x51db94 = String(_0x178639?.dataset?.idx ?? "");
      const _0x479059 = _0x51db94 ? _0x1cdc5e + ":" + _0x51db94 : _0x1cdc5e;
      return "ai-video:" + this.nodeId + ":" + _0x479059;
    }
    _shouldRecoverPreviewPlayback(_0x3b6237) {
      return _0x3b6237?.isConnected !== false && this._hoverManualPause !== true && (this._isHovered || this._isManualControl || !_0x3b6237?.paused);
    }
    _clearPreviewPosterForVisibleFrame(_0x287c28) {
      if (isVideoResultFrameReady(_0x287c28)) {
        this._markPreviewPosterClearedForPlayback(_0x287c28);
        return true;
      }
      watchVideoFramePresentation(_0x287c28, () => {
        const _0x5d150d = (typeof _0x6680a0.getStateRaw === "function" ? _0x6680a0.getStateRaw() : _0x6680a0.getState()).nodes?.[this.nodeId] || this._data || {};
        const _0x1355cb = Math.max(0, Math.trunc(Number(_0x5d150d.mainVideoIndex) || 0));
        const _0x437801 = Math.max(0, Math.trunc(Number(_0x287c28?.dataset?.idx) || 0));
        if (_0x437801 !== _0x1355cb || !isVideoResultFrameReady(_0x287c28)) {
          return;
        }
        this._markPreviewPosterClearedForPlayback(_0x287c28);
      });
      return false;
    }
    _markPreviewPosterClearedForPlayback(_0x5e9a57) {
      if (!_0x5e9a57) {
        return false;
      }
      if (!this._previewPostersClearedForPlayback) {
        this._previewPostersClearedForPlayback = new WeakMap();
      }
      const _0x95a08c = getVideoPresentationSource(_0x5e9a57);
      if (_0x95a08c && this._previewPostersClearedForPlayback.get(_0x5e9a57) === _0x95a08c) {
        return false;
      }
      this._previewPostersClearedForPlayback.set(_0x5e9a57, _0x95a08c);
      this._removeDeferredVideoPosterPreview();
      globalThis.window?.v2Renderer?.releaseFastPreviewForPlayback?.(this.nodeId);
      if (String(_0x5e9a57?.poster || "").trim()) {
        _0x5e9a57.removeAttribute?.("poster");
        return true;
      }
      return false;
    }
    _isPreviewPosterClearedForPlayback(_0x9843e8) {
      const _0x1b5813 = getVideoPresentationSource(_0x9843e8);
      return !!_0x1b5813 && this._previewPostersClearedForPlayback?.get?.(_0x9843e8) === _0x1b5813;
    }
    _attachPreviewVideoRecovery(_0x4bcead, _0x684a1d = "preview") {
      if (!_0x4bcead) {
        return null;
      }
      const _0x27a8e9 = _0x684a1d === "hover" || _0x684a1d === "fullscreen";
      return attachVideoPlaybackRecovery(_0x4bcead, {
        label: this._getPreviewVideoRecoveryLabel(_0x4bcead, _0x684a1d),
        ensureSrc: () => this._ensureVideoSrcFor(_0x4bcead, {
          forPlayback: true,
          preload: _0x684a1d === "hover" ? "metadata" : "auto"
        }),
        minBufferAhead: _0x27a8e9 ? 0.5 : undefined,
        readyTimeoutMs: _0x27a8e9 ? 350 : undefined,
        recoveryDebounceMs: _0x27a8e9 ? 150 : undefined,
        recoveryCooldownMs: _0x27a8e9 ? 500 : undefined,
        shouldRecover: () => this._shouldRecoverPreviewPlayback(_0x4bcead)
      });
    }
    _logPreviewVideoPlaybackEvent(_0x5882ec, _0x2d295c, _0x1ef117 = "preview") {
      if (!_0x5882ec) {
        return;
      }
      this._attachPreviewVideoRecovery(_0x5882ec, _0x1ef117);
      logVideoPlaybackEvent(_0x5882ec, _0x2d295c, {
        label: this._getPreviewVideoRecoveryLabel(_0x5882ec, _0x1ef117)
      });
    }
    async _playPreviewVideoWithRecovery(_0x5a873a, _0x3549d9 = {}) {
      if (!_0x5a873a) {
        return false;
      }
      const _0x4ac469 = _0x3549d9.reason || "preview";
      this._attachPreviewVideoRecovery(_0x5a873a, _0x4ac469);
      return playVideoWithRecovery(_0x5a873a, {
        label: this._getPreviewVideoRecoveryLabel(_0x5a873a, _0x4ac469),
        playbackIntent: _0x4ac469,
        ensureSrc: () => this._ensureVideoSrcFor(_0x5a873a, {
          forPlayback: true,
          preload: _0x4ac469 === "hover" ? "metadata" : "auto"
        }),
        minBufferAhead: _0x4ac469 === "hover" ? 0.5 : undefined,
        readyTimeoutMs: _0x4ac469 === "hover" ? 350 : undefined,
        recoveryDebounceMs: _0x4ac469 === "hover" ? 150 : undefined,
        recoveryCooldownMs: _0x4ac469 === "hover" ? 500 : undefined,
        shouldRecover: () => this._shouldRecoverPreviewPlayback(_0x5a873a),
        shouldContinue: typeof _0x3549d9.shouldContinue === "function" ? _0x3549d9.shouldContinue : undefined
      });
    }
    _handlePreviewVideoEnded(_0x582dd7) {
      if (!_0x582dd7) {
        return false;
      }
      const _0x45999f = _0x6680a0.getState().nodes?.[this.nodeId] || this._data || {};
      const _0x392e1c = Math.max(0, Math.trunc(Number(_0x45999f.mainVideoIndex) || 0));
      const _0x1feb8e = Math.max(0, Math.trunc(Number(_0x582dd7.dataset?.idx) || 0));
      if (_0x1feb8e !== _0x392e1c) {
        return false;
      }
      try {
        _0x582dd7.currentTime = 0;
      } catch {}
      const _0x2b825f = this._isHovered === true && this._isManualControl !== true && this._hoverManualPause !== true;
      const _0x279536 = this._isManualLoopPlayback === true;
      const _0x32c4a4 = _0x2b825f || _0x279536;
      if (_0x32c4a4) {
        _0x582dd7.loop = true;
        this._hideCenterIndicator?.();
        this._autoPlayToken = Number(this._autoPlayToken || 0) + 1;
        const _0x2427c2 = this._autoPlayToken;
        const _0xa63753 = () => this._autoPlayToken === _0x2427c2 && (this._isManualLoopPlayback === true || this._isHovered === true && this._isManualControl !== true && this._hoverManualPause !== true);
        if (typeof this._playPreviewVideoWithRecovery === "function") {
          this._playPreviewVideoWithRecovery(_0x582dd7, {
            reason: _0x279536 ? "manual" : "hover",
            shouldContinue: _0xa63753
          }).catch(() => {});
        } else {
          const _0x35ed14 = _0x582dd7.play?.();
          if (_0x35ed14 && typeof _0x35ed14.catch === "function") {
            _0x35ed14.catch(() => {});
          }
        }
      } else {
        _0x582dd7.loop = false;
        _0x582dd7.pause?.();
        this._showPausedCenterIndicator?.();
      }
      this._syncVideoControlsFromVideo?.(_0x582dd7);
      return true;
    }
    async _ensureVideoSrcFor(_0x59ba1c, _0x2ad310 = {}) {
      if (!_0x59ba1c) {
        return false;
      }
      const _0x4d5991 = _0x2ad310.preload === "metadata" ? "metadata" : "auto";
      const _0xb8ed9 = !!String(_0x59ba1c.getAttribute("src") || "").trim();
      if (_0xb8ed9) {
        if (_0x2ad310.forPlayback === true && _0x59ba1c.preload !== _0x4d5991) {
          _0x59ba1c.preload = _0x4d5991;
        }
        this._clearPreviewPosterForVisibleFrame(_0x59ba1c);
        return true;
      }
      const _0x2d9c74 = _0x6680a0.getState();
      const _0x504d2d = _0x2d9c74.nodes?.[this.nodeId] || this._data || {};
      const _0x14385a = Array.isArray(_0x504d2d.videos) ? _0x504d2d.videos : [];
      const _0x5c19b4 = Number(_0x59ba1c.dataset?.idx);
      const _0x6a3a37 = Number.isFinite(_0x5c19b4) ? Math.max(0, Math.trunc(_0x5c19b4)) : 0;
      const _0x38a8d3 = _0x14385a[_0x6a3a37] || null;
      if (!_0x38a8d3) {
        return false;
      }
      const _0x1c190b = Number(this._videoSourceAttachToken || 0);
      if (!this._videoSourceAttachTokens) {
        this._videoSourceAttachTokens = new WeakMap();
      }
      const _0x5b5d4a = Number(this._videoSourceAttachTokens.get(_0x59ba1c) || 0) + 1;
      this._videoSourceAttachTokens.set(_0x59ba1c, _0x5b5d4a);
      const _0x1fb1c4 = () => Number(this._videoSourceAttachToken || 0) === _0x1c190b && this._videoSourceAttachTokens?.get(_0x59ba1c) === _0x5b5d4a;
      let _0x2100f6 = this._resolveVideoPlaybackUrl(_0x38a8d3);
      if (!_0x2100f6 && _0x38a8d3.thumbId) {
        const _0x3fd2da = String(_0x38a8d3.thumbId || "");
        if (_0x3fd2da) {
          const _0x413e93 = this._cachedVideoUrls.get(_0x3fd2da);
          if (_0x413e93) {
            _0x2100f6 = _0x413e93;
          } else {
            let _0x355081 = null;
            try {
              _0x355081 = await _0xb70b0c(_0x3fd2da);
            } catch {
              _0x355081 = null;
            }
            if (!_0x1fb1c4()) {
              return false;
            }
            if (_0x355081) {
              const _0x10cd39 = URL.createObjectURL(_0x355081);
              this._cachedVideoUrls.set(_0x3fd2da, _0x10cd39);
              _0x2100f6 = _0x10cd39;
            }
          }
        }
      }
      if (!_0x2100f6) {
        return false;
      }
      const _0x5995e1 = await this._resolveLocalVideoPlaybackObjectUrl(_0x2100f6, "ai-video:" + this.nodeId + ":slot:" + _0x6a3a37);
      if (!_0x1fb1c4()) {
        return false;
      }
      globalThis.window?.__runtimeCompareMark?.("ai-video-playback:attach", {
        nodeId: this.nodeId,
        slotIndex: _0x6a3a37,
        sourceUrl: _0x2100f6,
        playbackUrl: _0x5995e1
      });
      await attachMediaElementPlaybackSource(_0x59ba1c, _0x2100f6, {
        playbackUrl: _0x5995e1,
        preload: _0x4d5991,
        warmRanges: false,
        load: _0x2ad310.forPlayback === true,
        shouldAssign: _0x1fb1c4,
        onSourceAssigned: () => {
          this._clearPreviewPosterForVisibleFrame(_0x59ba1c);
        }
      });
      this._restorePreviewHoverPlaybackTime(_0x59ba1c, _0x2100f6);
      this._clearPreviewPosterForVisibleFrame(_0x59ba1c);
      return _0x1fb1c4();
    }
    _resolveVideoPlaybackUrl(_0x7484d0) {
      if (!_0x7484d0 || typeof _0x7484d0 !== "object") {
        return "";
      }
      return this._resolveMediaUrl(localPathToUrl(_0x7484d0.displayLocalPath)) || this._resolveMediaUrl(localPathToUrl(_0x7484d0.localPath)) || this._resolveMediaUrl(_0x7484d0.videoUrl) || this._resolveMediaUrl(resolveCanvasVideoDisplayUrl(_0x7484d0)) || "";
    }
    _resolveMediaUrl(_0x418a86) {
      const _0x1c19c0 = String(_0x418a86 || "").trim();
      if (!_0x1c19c0) {
        return "";
      }
      if (_0x1c19c0.startsWith("http://") || _0x1c19c0.startsWith("https://") || _0x1c19c0.startsWith("blob:") || _0x1c19c0.startsWith("data:")) {
        return _0x1c19c0;
      }
      const _0x2fd1e3 = localPathToUrl(_0x1c19c0);
      if (_0x2fd1e3) {
        return _0x8c8c14(_0x2fd1e3);
      }
      if (_0x1c19c0.startsWith("/")) {
        return _0x8c8c14(_0x1c19c0);
      }
      return _0x8c8c14("/" + _0x1c19c0.replace(/^\/+/, ""));
    }
    async _resolveLocalVideoPlaybackObjectUrl(_0x68a654, _0x57113b = "") {
      if (!shouldUseSharedLocalVideoBlob()) {
        return "";
      }
      const _0xc28551 = String(_0x57113b || "").trim() || "ai-video:" + this.nodeId + ":slot:main";
      return acquireLocalVideoPlaybackObjectUrl(_0x68a654, _0xc28551);
    }
    _releaseLocalVideoPlaybackObjectUrl() {
      this._localPlaybackBlobToken = Number(this._localPlaybackBlobToken || 0) + 1;
      this._localPlaybackBlobFetchController?.abort?.();
      this._localPlaybackBlobFetchController = null;
      this._localPlaybackBlobPromise = null;
      this._localPlaybackBlobPromiseSource = "";
      const _0x16a321 = String(this._localPlaybackObjectUrl || "").trim();
      this._localPlaybackObjectUrl = "";
      this._localPlaybackObjectSource = "";
      const _0x343318 = releaseLocalVideoPlaybackObjectUrlOwnerScope("ai-video:" + this.nodeId) > 0;
      if (_0x16a321) {
        revokeTrackedMediaObjectUrl(_0x16a321);
      }
      return _0x343318 || !!_0x16a321;
    }
    _discardRendererVisibleVideoSurface() {
      const _0x3c8cf9 = this._rendererVisibleVideoSurface;
      if (!_0x3c8cf9) {
        return false;
      }
      this._rendererVisibleVideoSurface = null;
      _0x3c8cf9.cancelled = true;
      const _0x26338a = _0x3c8cf9.videoEl;
      if (!_0x26338a) {
        return true;
      }
      resetVideoFramePresentation(_0x26338a);
      try {
        _0x26338a.pause?.();
      } catch {}
      clearDesktopMediaPlaybackSourceMetadata(_0x26338a);
      _0x26338a.removeAttribute?.("src");
      _0x26338a.removeAttribute?.("poster");
      try {
        _0x26338a.load?.();
      } catch {}
      _0x26338a.remove?.();
      return true;
    }
    _restorePreviewHoverPlaybackTime(_0x58cbb3, _0x8c8ca) {
      const _0x4c0ea9 = this._hoverPlaybackResumeState;
      const _0x947857 = String(_0x8c8ca || "").trim();
      if (!_0x4c0ea9 || !_0x58cbb3 || !_0x947857 || _0x4c0ea9.source !== _0x947857) {
        return false;
      }
      const _0x107e24 = () => {
        if (this._hoverPlaybackResumeState !== _0x4c0ea9 || !isMediaElementPlaybackSource(_0x58cbb3, _0x947857)) {
          return false;
        }
        const _0x11c172 = Number(_0x58cbb3.duration || 0);
        if (!Number.isFinite(_0x11c172) || _0x11c172 <= 0) {
          return false;
        }
        const _0x10ad14 = Math.min(Math.max(0, Number(_0x4c0ea9.time || 0)), Math.max(0, _0x11c172 - 0.05));
        try {
          _0x58cbb3.currentTime = _0x10ad14;
        } catch {
          return false;
        }
        this._hoverPlaybackResumeState = null;
        return true;
      };
      if (_0x107e24()) {
        return true;
      }
      const _0x4498a0 = () => {
        if (!_0x107e24()) {
          return;
        }
        _0x58cbb3.removeEventListener?.("loadedmetadata", _0x4498a0);
        _0x58cbb3.removeEventListener?.("canplay", _0x4498a0);
      };
      _0x58cbb3.addEventListener?.("loadedmetadata", _0x4498a0);
      _0x58cbb3.addEventListener?.("canplay", _0x4498a0);
      return true;
    }
    _restoreIdlePreviewPoster(_0x57278f) {
      if (!_0x57278f) {
        return false;
      }
      const _0xe5a8bc = this._resolveDeferredVideoPosterUrl();
      if (_0xe5a8bc) {
        _0x57278f.poster = _0xe5a8bc;
        setVideoResultElementVisible(this._placeholderEl, false);
      } else {
        _0x57278f.removeAttribute?.("poster");
        setVideoResultElementVisible(this._placeholderEl, true);
      }
      this._removeDeferredVideoPosterPreview();
      this._setVideoOverlaysVisible?.(false);
      return !!_0xe5a8bc;
    }
    _releaseIdlePreviewHoverPlaybackMedia() {
      const _0x2a4588 = this._getActivePreviewVideoEl?.();
      if (!_0x2a4588 || this._isHovered === true || this._isManualControl === true || this._isManualLoopPlayback === true || this._isProgressSeeking === true || this._isProgressDragging === true || _0x2a4588.paused === false) {
        return false;
      }
      const _0xd31c08 = this._data || {};
      const _0x4a1e13 = Array.isArray(_0xd31c08.videos) ? _0xd31c08.videos : [];
      const _0x336d8a = Math.max(0, Math.min(Math.max(0, _0x4a1e13.length - 1), Math.trunc(Number(_0xd31c08.mainVideoIndex) || 0)));
      const _0x348bbb = this._resolveVideoPlaybackUrl(_0x4a1e13[_0x336d8a] || _0x4a1e13[0]);
      const _0x2d785c = Number(_0x2a4588.currentTime || 0);
      this._hoverPlaybackResumeState = _0x348bbb && Number.isFinite(_0x2d785c) && _0x2d785c > 0 ? {
        source: _0x348bbb,
        time: _0x2d785c
      } : null;
      this._videoSourceAttachToken = Number(this._videoSourceAttachToken || 0) + 1;
      this._videoSourceAttachTokens?.set?.(_0x2a4588, Number(this._videoSourceAttachTokens?.get?.(_0x2a4588) || 0) + 1);
      this._releaseLocalVideoPlaybackObjectUrl();
      this._previewPostersClearedForPlayback = new WeakMap();
      resetVideoFramePresentation(_0x2a4588);
      clearDesktopMediaPlaybackSourceMetadata(_0x2a4588);
      this._restoreIdlePreviewPoster(_0x2a4588);
      _0x2a4588.preload = "none";
      _0x2a4588.removeAttribute?.("src");
      try {
        _0x2a4588.load?.();
      } catch {}
      return true;
    }
    prepareRendererMediaFallbackForSuspend() {
      if (this._showDeferredVideoPosterPreview() !== true) {
        return false;
      }
      const _0x3dc8df = this._deferredPosterImgEl;
      if (!_0x3dc8df) {
        return false;
      }
      _0x3dc8df.loading = "eager";
      try {
        _0x3dc8df.fetchPriority = "high";
      } catch {}
      return _0x3dc8df.isConnected !== false && _0x3dc8df.complete === true && Number(_0x3dc8df.naturalWidth || 0) > 0;
    }
    hasPresentedRendererMedia() {
      const _0x1a7929 = this._data || {};
      const _0x4be04d = Array.isArray(_0x1a7929.videos) ? _0x1a7929.videos : [];
      const _0x4b6796 = Math.max(0, Math.min(Math.max(0, _0x4be04d.length - 1), Math.trunc(Number(_0x1a7929.mainVideoIndex) || 0)));
      const _0x81ea6c = this._multiLayerEls?.[_0x4b6796] || null;
      return !!_0x81ea6c && !!getVideoCurrentSource(_0x81ea6c) && !!isVideoResultFrameReady(_0x81ea6c);
    }
    suspendRendererMedia() {
      this._videoRenderEpoch = Number(this._videoRenderEpoch || 0) + 1;
      this._videoSourceAttachToken = Number(this._videoSourceAttachToken || 0) + 1;
      this._isHovered = false;
      this._previewHoverActivationPending = false;
      this._hoverManualPause = false;
      this._isManualControl = false;
      this._autoPlayToken = Number(this._autoPlayToken || 0) + 1;
      this._setVideoOverlaysVisible?.(false);
      this._releaseLocalVideoPlaybackObjectUrl();
      this._previewPostersClearedForPlayback = new WeakMap();
      for (const _0x5de968 of this.previewEl?.querySelectorAll?.("video") || []) {
        resetVideoFramePresentation(_0x5de968);
        try {
          _0x5de968.pause?.();
        } catch {}
        _0x5de968.removeAttribute?.("src");
        try {
          _0x5de968.load?.();
        } catch {}
      }
      this._rendererMediaDeferred = true;
      this._rendererEagerVideoPreview = false;
      this._deferredVideoViewRefreshPending = true;
      this._showDeferredVideoPosterPreview();
    }
    _resolveDeferredVideoPosterUrl() {
      const _0x1701ac = this._data || {};
      const _0x2dd614 = Array.isArray(_0x1701ac.videos) ? _0x1701ac.videos : [];
      const _0x90175e = Number(_0x1701ac.mainVideoIndex);
      const _0x5bfb99 = Number.isFinite(_0x90175e) ? Math.max(0, Math.trunc(_0x90175e)) : 0;
      const _0x35cfe7 = _0x2dd614[_0x5bfb99] || _0x2dd614[0] || null;
      if (isTaskFailed(_0x1701ac) || isTaskCancelled(_0x1701ac) || String(_0x35cfe7?.error || "").trim()) {
        return "";
      }
      return this._resolveVideoResultPosterUrl(_0x35cfe7, {
        nodeData: _0x1701ac,
        allowNodeFallback: _0x2dd614.length <= 1
      });
    }
    _resolveVideoResultPosterUrl(_0x559150, {
      nodeData = this._data || {},
      allowNodeFallback = false
    } = {}) {
      const _0x2ddb33 = _0x4cda0a => [_0x4cda0a?.posterUrl, _0x4cda0a?.thumbUrl, _0x4cda0a?.thumbnailUrl, _0x4cda0a?.previewUrl, _0x4cda0a?.videoThumbSrc, localPathToUrl(_0x4cda0a?.posterLocalPath), localPathToUrl(_0x4cda0a?.thumbLocalPath), localPathToUrl(_0x4cda0a?.thumbnailLocalPath), localPathToUrl(_0x4cda0a?.previewLocalPath)];
      const _0x19672b = [..._0x2ddb33(_0x559150), ...(allowNodeFallback ? _0x2ddb33(nodeData) : [])];
      for (const _0x31881d of _0x19672b) {
        const _0x95788a = String(_0x31881d || "").trim();
        if (!isLikelyPosterImageUrl(_0x95788a)) {
          continue;
        }
        const _0x92a8f8 = this._resolveMediaUrl(_0x95788a);
        if (_0x92a8f8) {
          return _0x92a8f8;
        }
      }
      return "";
    }
    _removeDeferredVideoPosterPreview() {
      this._deferredPosterImgEl?.remove?.();
      this._deferredPosterImgEl = null;
    }
    _showDeferredVideoPosterPreview() {
      const _0x1d62ff = this._resolveDeferredVideoPosterUrl();
      if (!_0x1d62ff || !this.previewEl) {
        this._removeDeferredVideoPosterPreview();
        const _0x207a4a = this._mustRenderTerminalVideoState?.(this._data) === true;
        setVideoResultElementVisible(this._placeholderEl, !_0x207a4a);
        this._setVideoOverlaysVisible?.(false);
        return false;
      }
      let _0x532512 = this._deferredPosterImgEl;
      if (!_0x532512 || _0x532512.parentNode !== this.previewEl) {
        _0x532512 = document.createElement("img");
        _0x532512.classList?.add?.("v2-media-preview", "ai-video-deferred-poster");
        _0x532512.draggable = false;
        _0x532512.alt = "";
        _0x532512.decoding = "async";
        _0x532512.loading = "lazy";
        try {
          _0x532512.fetchPriority = "auto";
        } catch {}
        this.previewEl.appendChild(_0x532512);
        this._deferredPosterImgEl = _0x532512;
      }
      const _0x2332d8 = _0x532512.getAttribute?.("src") || _0x532512.src || "";
      if (_0x2332d8 !== _0x1d62ff) {
        if (typeof _0x532512.setAttribute === "function") {
          _0x532512.setAttribute("src", _0x1d62ff);
        }
        _0x532512.src = _0x1d62ff;
      }
      setVideoResultElementVisible(this._placeholderEl, false);
      this._setVideoOverlaysVisible?.(false);
      if (!isVideoResultViewportBusy()) {
        _0xac96f0?.(_0x1d62ff);
      }
      return true;
    }
    _resolveVideoMetaSrcFromVideoData(_0xbc28d0) {
      if (!_0xbc28d0) {
        return "";
      }
      const _0x525bcc = localPathToUrl(_0xbc28d0.displayLocalPath);
      if (_0x525bcc) {
        return _0x525bcc;
      }
      const _0xd95c05 = localPathToUrl(_0xbc28d0.localPath);
      if (_0xd95c05) {
        return _0xd95c05;
      }
      const _0xfc7eaa = String(_0xbc28d0.videoUrl || "").trim();
      if (!_0xfc7eaa) {
        return "";
      }
      if (_0xfc7eaa.startsWith("blob:") || _0xfc7eaa.startsWith("data:")) {
        return "";
      }
      return localPathToUrl(urlToLocalPath(_0xfc7eaa));
    }
    _getVideoSourceKey(_0x173576) {
      if (!_0x173576 || typeof _0x173576 !== "object") {
        return "";
      }
      return String(_0x173576.localPath || "").trim() || String(_0x173576.videoUrl || "").trim() || String(_0x173576.src || "").trim() || String(_0x173576.thumbId || "").trim();
    }
    _isVideoMarkedUnavailable(_0x28474b) {
      const _0x397f97 = this._getVideoSourceKey(_0x28474b);
      if (!_0x397f97) {
        return false;
      }
      const _0x2a5840 = String(_0x28474b?.mediaUnavailableSource || "").trim();
      return _0x28474b?.mediaUnavailable === true && _0x2a5840 === _0x397f97;
    }
    _isVideoThumbMarkedUnavailable(_0x12d106, _0x2645c0 = "") {
      const _0x32bc3d = String(_0x2645c0 || this._resolveVideoMetaSrcFromVideoData(_0x12d106)).trim();
      if (!_0x32bc3d) {
        return false;
      }
      return String(_0x12d106?.videoThumbUnavailableSource || "").trim() === _0x32bc3d;
    }
    _markVideoThumbUnavailable(_0x3839fa, _0x1bf941, _0x3d0503 = "") {
      const _0x270ee8 = String(_0x3d0503 || this._resolveVideoMetaSrcFromVideoData(_0x1bf941)).trim();
      if (!_0x270ee8) {
        return;
      }
      const _0x4862d5 = _0x6680a0.getState().nodes[this.nodeId];
      if (!_0x4862d5) {
        return;
      }
      const _0x3899a3 = Array.isArray(_0x4862d5.videos) ? _0x4862d5.videos : [];
      const _0xbc5b7b = Number(_0x4862d5.mainVideoIndex);
      const _0x50c50a = Number.isFinite(_0xbc5b7b) ? Math.max(0, Math.trunc(_0xbc5b7b)) : 0;
      const _0x27a8ce = {};
      if (_0x3839fa < 0 || _0x3839fa === _0x50c50a) {
        _0x27a8ce.videoThumbUnavailableSource = _0x270ee8;
        _0x27a8ce.thumbUrl = "";
      }
      if (_0x3839fa >= 0 && _0x3839fa < _0x3899a3.length) {
        const _0xfe3649 = _0x3899a3[_0x3839fa];
        if (_0xfe3649 && typeof _0xfe3649 === "object") {
          const _0x59273c = _0x3899a3.slice();
          _0x59273c[_0x3839fa] = {
            ..._0xfe3649,
            videoThumbUnavailableSource: _0x270ee8,
            thumbUrl: ""
          };
          _0x27a8ce.videos = _0x59273c;
        }
      }
      if (Object.keys(_0x27a8ce).length) {
        _0x6680a0.updateNodeData(this.nodeId, _0x27a8ce);
      }
    }
    _markVideoUnavailable(_0x48357b, _0x50dfff) {
      const _0x45ce3d = this._getVideoSourceKey(_0x50dfff);
      if (!_0x45ce3d) {
        return;
      }
      const _0x3c80cd = _0x6680a0.getState().nodes[this.nodeId];
      if (!_0x3c80cd) {
        return;
      }
      const _0x1a34e5 = Array.isArray(_0x3c80cd.videos) ? _0x3c80cd.videos : [];
      const _0x4c2764 = Number(_0x3c80cd.mainVideoIndex);
      const _0x3e3fb7 = Number.isFinite(_0x4c2764) ? Math.max(0, Math.trunc(_0x4c2764)) : 0;
      const _0x3f312a = {
        mediaUnavailable: true,
        mediaUnavailableSource: _0x45ce3d
      };
      if (_0x48357b < 0 || _0x48357b === _0x3e3fb7) {
        _0x3f312a.thumbUrl = "";
      }
      if (_0x48357b >= 0 && _0x48357b < _0x1a34e5.length) {
        const _0x244de1 = _0x1a34e5[_0x48357b];
        if (_0x244de1 && typeof _0x244de1 === "object") {
          const _0x4f050e = _0x1a34e5.slice();
          _0x4f050e[_0x48357b] = {
            ..._0x244de1,
            mediaUnavailable: true,
            mediaUnavailableSource: _0x45ce3d,
            thumbUrl: ""
          };
          _0x3f312a.videos = _0x4f050e;
        }
      }
      _0x6680a0.updateNodeData(this.nodeId, _0x3f312a);
    }
    _clearVideoUnavailable(_0x15a58d, _0x2e1fb3) {
      const _0x54819b = this._getVideoSourceKey(_0x2e1fb3);
      if (!_0x54819b) {
        return;
      }
      const _0x3d321b = _0x6680a0.getState().nodes[this.nodeId];
      if (!_0x3d321b) {
        return;
      }
      const _0x320cbf = {};
      if (_0x3d321b.mediaUnavailable === true && String(_0x3d321b.mediaUnavailableSource || "") === _0x54819b) {
        _0x320cbf.mediaUnavailable = false;
        _0x320cbf.mediaUnavailableSource = "";
      }
      const _0x3b16cd = Array.isArray(_0x3d321b.videos) ? _0x3d321b.videos : [];
      if (_0x15a58d >= 0 && _0x15a58d < _0x3b16cd.length) {
        const _0x5d9b6e = _0x3b16cd[_0x15a58d];
        if (_0x5d9b6e && typeof _0x5d9b6e === "object" && _0x5d9b6e.mediaUnavailable === true && String(_0x5d9b6e.mediaUnavailableSource || "") === _0x54819b) {
          const _0x5eee58 = _0x3b16cd.slice();
          _0x5eee58[_0x15a58d] = {
            ..._0x5d9b6e,
            mediaUnavailable: false,
            mediaUnavailableSource: ""
          };
          _0x320cbf.videos = _0x5eee58;
        }
      }
      if (Object.keys(_0x320cbf).length) {
        _0x6680a0.updateNodeData(this.nodeId, _0x320cbf);
      }
    }
    _shouldFetchVideoMetaForNodeInfo() {
      try {
        const _0x576d9b = typeof _0x6680a0.getStateRaw === "function" ? _0x6680a0.getStateRaw() : _0x6680a0.getState();
        return _0x576d9b?.ui?.showVideoMeta === true;
      } catch {
        return false;
      }
    }
    requestVideoMetaForNodeInfo(_0x348caf = this._data) {
      const _0xd491a5 = Array.isArray(_0x348caf?.videos) ? _0x348caf.videos : [];
      if (!_0xd491a5.length) {
        return null;
      }
      const _0x2c45a9 = Number(_0x348caf?.mainVideoIndex);
      const _0x30d5a8 = Number.isFinite(_0x2c45a9) ? Math.max(0, Math.trunc(_0x2c45a9)) : 0;
      const _0x2f8016 = _0xd491a5[Math.min(_0x30d5a8, _0xd491a5.length - 1)] || _0xd491a5[0] || null;
      if (!_0x2f8016 || this._isVideoMarkedUnavailable(_0x2f8016)) {
        return null;
      }
      if (String(_0x2f8016.error || "").trim()) {
        return null;
      }
      const _0x5784eb = this._resolveVideoMetaSrcFromVideoData(_0x2f8016);
      if (!_0x5784eb) {
        return null;
      }
      const _0x21fcf8 = Date.now();
      if (this._videoMetaInfoRequestSrc === _0x5784eb && _0x21fcf8 - Number(this._videoMetaInfoRequestAt || 0) < 5000) {
        return this._metaFetchPromise || null;
      }
      this._videoMetaInfoRequestSrc = _0x5784eb;
      this._videoMetaInfoRequestAt = _0x21fcf8;
      return this._maybeFetchVideoMeta(_0x5784eb);
    }
    async _maybeFetchVideoMeta(_0xfefcfe) {
      if (!this._shouldFetchVideoMetaForNodeInfo()) {
        return;
      }
      const _0x3f1881 = String(_0xfefcfe || "").trim();
      if (!_0x3f1881) {
        return;
      }
      const _0x5db5c4 = _0x6680a0.getState().nodes[this.nodeId];
      if (!_0x5db5c4) {
        return;
      }
      const _0x567429 = String(_0x5db5c4.videoMetaSrc || "");
      const _0x4b593f = Number.isFinite(Number(_0x5db5c4.videoFps)) && Number(_0x5db5c4.videoFps) > 0 && Number.isFinite(Number(_0x5db5c4.videoFrameCount)) && Number(_0x5db5c4.videoFrameCount) > 0;
      if (_0x4b593f && _0x567429 === _0x3f1881) {
        return;
      }
      if (this._metaFetchPromise && this._metaFetchSrc === _0x3f1881) {
        return this._metaFetchPromise;
      }
      if (_0x567429 && _0x567429 !== _0x3f1881) {
        _0x6680a0.updateNodeData(this.nodeId, {
          videoMetaSrc: _0x3f1881,
          videoFps: null,
          videoFrameCount: null,
          videoDuration: null,
          videoWidth: null,
          videoHeight: null
        });
      }
      const _0x973b9f = ++this._metaFetchToken;
      const _0x242797 = (async () => {
        try {
          const _0x3c0647 = await _0x55b1a8.fetchVideoMetaFromServer(_0x3f1881);
          if (_0x973b9f !== this._metaFetchToken) {
            return;
          }
          if (!_0x3c0647 || _0x3c0647.success !== true) {
            return;
          }
          const _0x2e3ece = Number(_0x3c0647.fps);
          const _0x397a78 = Number(_0x3c0647.frameCount);
          const _0x4f4cac = Number(_0x3c0647.duration);
          const _0x5b0eda = Number(_0x3c0647.width);
          const _0x3b7474 = Number(_0x3c0647.height);
          const _0x37c1ba = {
            videoMetaSrc: _0x3f1881
          };
          if (Number.isFinite(_0x2e3ece) && _0x2e3ece > 0) {
            _0x37c1ba.videoFps = _0x2e3ece;
          }
          if (Number.isFinite(_0x397a78) && _0x397a78 > 0) {
            _0x37c1ba.videoFrameCount = Math.round(_0x397a78);
          }
          if (Number.isFinite(_0x4f4cac) && _0x4f4cac > 0) {
            _0x37c1ba.videoDuration = _0x4f4cac;
          }
          if (Number.isFinite(_0x5b0eda) && _0x5b0eda > 0) {
            _0x37c1ba.videoWidth = Math.round(_0x5b0eda);
          }
          if (Number.isFinite(_0x3b7474) && _0x3b7474 > 0) {
            _0x37c1ba.videoHeight = Math.round(_0x3b7474);
          }
          const _0x437413 = _0x6680a0.getState().nodes[this.nodeId];
          if (!_0x437413) {
            return;
          }
          const _0x41c68f = String(_0x437413.videoMetaSrc || "") !== String(_0x37c1ba.videoMetaSrc || "") || Number(_0x437413.videoFps || 0) !== Number(_0x37c1ba.videoFps || 0) || Number(_0x437413.videoFrameCount || 0) !== Number(_0x37c1ba.videoFrameCount || 0) || Number(_0x437413.videoDuration || 0) !== Number(_0x37c1ba.videoDuration || 0) || Number(_0x437413.videoWidth || 0) !== Number(_0x37c1ba.videoWidth || 0) || Number(_0x437413.videoHeight || 0) !== Number(_0x37c1ba.videoHeight || 0);
          if (_0x41c68f) {
            _0x6680a0.updateNodeData(this.nodeId, _0x37c1ba);
          }
        } catch {} finally {
          if (this._metaFetchPromise === _0x242797) {
            this._metaFetchPromise = null;
            this._metaFetchSrc = "";
          }
        }
      })();
      this._metaFetchSrc = _0x3f1881;
      this._metaFetchPromise = _0x242797;
      return _0x242797;
    }
    _createStatusCard(_0x488f8d, _0x17eec2) {
      const _0x280d45 = document.createElement("div");
      const _0x170f0b = Number(_0x17eec2) === 0;
      _0x280d45.className = "gen-status-card " + (_0x170f0b ? "is-success" : "is-neutral");
      const _0x2f7d2c = document.createElement("div");
      _0x2f7d2c.className = "gen-status-card-icon";
      _0x2f7d2c.innerHTML = "<svg width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><circle cx=\"12\" cy=\"12\" r=\"10\"/><path d=\"" + (_0x170f0b ? "M8 12l2.5 2.5L16 9" : "M12 8v5") + "\" />" + (_0x170f0b ? "" : "<line x1=\"12\" y1=\"16\" x2=\"12.01\" y2=\"16\" />") + "</svg>";
      const _0x38370c = document.createElement("span");
      _0x38370c.className = "gen-status-card-message";
      _0x38370c.textContent = String(_0x488f8d || "");
      _0x280d45.appendChild(_0x2f7d2c);
      _0x280d45.appendChild(_0x38370c);
      return _0x280d45;
    }
    _ensureStatusOverlayEl() {
      if (this._statusOverlayEl) {
        return this._statusOverlayEl;
      }
      this._statusOverlayEl = document.createElement("div");
      this._statusOverlayEl.className = "dreamina-status-overlay";
      this.previewEl.appendChild(this._statusOverlayEl);
      return this._statusOverlayEl;
    }
    _clearStatusOverlay() {
      if (!this._statusOverlayEl) {
        return;
      }
      this._statusOverlayEl.remove();
      this._statusOverlayEl = null;
    }
    _getGenerationFailureMessage(_0x44d2c0 = this._data) {
      if (!_0x44d2c0 || typeof _0x44d2c0 !== "object") {
        return "";
      }
      const _0x5de56c = isTaskFailed(_0x44d2c0) || isTaskCancelled(_0x44d2c0);
      if (!_0x5de56c) {
        return "";
      }
      return getTaskMessage(_0x44d2c0) || videoResultRenderText("generationFailed");
    }
    _mustRenderTerminalVideoState(_0x1f92dd = this._data) {
      const _0xf9f5be = _0x1f92dd && typeof _0x1f92dd === "object" ? _0x1f92dd : {};
      const _0x5a34a5 = Array.isArray(_0xf9f5be.videos) ? _0xf9f5be.videos : [];
      const _0x4d1217 = Math.max(0, Math.trunc(Number(_0xf9f5be.mainVideoIndex) || 0));
      const _0x5ee166 = _0x5a34a5[_0x4d1217] || _0x5a34a5[0] || null;
      return !!this._getGenerationFailureMessage(_0xf9f5be) || !!String(_0x5ee166?.error || "").trim();
    }
    _createErrorCard(_0x9df25a) {
      return createVideoGenerationErrorCard(_0x9df25a);
    }
    _formatDreaminaElapsed(_0x257bac) {
      const _0x2e2cd2 = Math.max(0, Math.floor(Number(_0x257bac || 0) / 1000));
      const _0x379ae0 = Math.floor(_0x2e2cd2 / 60);
      const _0x1b972d = _0x2e2cd2 % 60;
      if (_0x379ae0 > 0) {
        return videoResultRenderText("elapsedMinutesSeconds", {
          minutes: _0x379ae0,
          seconds: String(_0x1b972d).padStart(2, "0")
        });
      }
      return videoResultRenderText("elapsedSeconds", {
        seconds: _0x1b972d
      });
    }
    async _loadAndDisplayVideo() {
      const _0x29a86b = Number(this._videoRenderEpoch || 0) + 1;
      this._videoRenderEpoch = _0x29a86b;
      let _0x2d87f4 = Number(this._videoSourceAttachToken || 0);
      const _0x1daed3 = () => Number(this._videoRenderEpoch || 0) === _0x29a86b && Number(this._videoSourceAttachToken || 0) === _0x2d87f4 && (this._isHovered === true || this._isManualControl === true);
      if (this._isHovered !== true && this._isManualControl !== true) {
        this._discardRendererVisibleVideoSurface();
      }
      const _0x34a6db = this._data || {};
      const _0xc52b9c = this._mustRenderTerminalVideoState(_0x34a6db);
      if (this._rendererMediaDeferred === true && !_0xc52b9c) {
        this._deferredVideoViewRefreshPending = true;
        this._showDeferredVideoPosterPreview();
        return;
      }
      if (this._deferredPosterImgEl && !_0xc52b9c) {
        this._showDeferredVideoPosterPreview();
      } else {
        this._removeDeferredVideoPosterPreview();
      }
      const _0x372fc = this._data.videos || [];
      if (_0x372fc.length === 0 && (this._data.videoUrl || this._data.localPath || this._data.thumbId)) {
        _0x372fc.push({
          videoUrl: this._data.videoUrl,
          thumbId: this._data.thumbId,
          localPath: this._data.localPath
        });
      }
      const _0x1b399c = (this._data.rhStatusMessage || "").trim();
      const _0x580030 = this._data.rhStatusCode;
      const _0x3fcb54 = this._getGenerationFailureMessage(this._data);
      if (_0x3fcb54 && _0x372fc.length === 0) {
        this._videoSourceAttachToken = Number(this._videoSourceAttachToken || 0) + 1;
        this._discardRendererVisibleVideoSurface();
        this._releaseLocalVideoPlaybackObjectUrl();
        if (this.videoEl) {
          setVideoResultElementVisible(this.videoEl, false);
          this.videoEl.removeAttribute?.("src");
          this.videoEl.load?.();
        }
        setVideoResultElementVisible(this._placeholderEl, false);
        this._setVideoOverlaysVisible(false);
        if (this._multiVideosContainer) {
          this._multiVideosContainer.remove();
          this._multiVideosContainer = null;
        }
        const _0x58fef4 = this._ensureStatusOverlayEl();
        _0x58fef4.innerHTML = "";
        _0x58fef4.appendChild(this._createErrorCard(_0x3fcb54));
        return;
      }
      if (_0x1b399c && _0x372fc.length === 0) {
        this._videoSourceAttachToken = Number(this._videoSourceAttachToken || 0) + 1;
        this._releaseLocalVideoPlaybackObjectUrl();
        if (this.videoEl) {
          setVideoResultElementVisible(this.videoEl, false);
          this.videoEl.removeAttribute?.("src");
          this.videoEl.load?.();
        }
        setVideoResultElementVisible(this._placeholderEl, false);
        this._setVideoOverlaysVisible(false);
        if (this._multiVideosContainer) {
          this._multiVideosContainer.remove();
          this._multiVideosContainer = null;
        }
        const _0x19f1a1 = this._ensureStatusOverlayEl();
        _0x19f1a1.innerHTML = "";
        _0x19f1a1.appendChild(this._createStatusCard(_0x1b399c, _0x580030));
        return;
      }
      this._clearStatusOverlay();
      const _0x4b205b = _0x372fc.length;
      if (_0x4b205b === 0) {
        this._videoSourceAttachToken = Number(this._videoSourceAttachToken || 0) + 1;
        this._releaseLocalVideoPlaybackObjectUrl();
        if (this.videoEl) {
          setVideoResultElementVisible(this.videoEl, false);
          this.videoEl.removeAttribute?.("src");
          this.videoEl.load?.();
        }
        setVideoResultElementVisible(this._placeholderEl, true);
        this._setVideoOverlaysVisible(false);
        if (this._multiVideosContainer) {
          this._multiVideosContainer.remove();
          this._multiVideosContainer = null;
        }
        return;
      }
      const _0x5b9c83 = this._data.mainVideoIndex || 0;
      const _0x159047 = this._rendererThinVideoHydration === true;
      const _0x31e619 = this._lastVideoRenderWasThin === true;
      const _0x38bc09 = _0x4b205b > 1;
      const _0x487029 = !_0x159047 && _0x38bc09 && !!this._data.isVideosExpanded;
      const _0xb0faa2 = Math.max(0, Math.min(_0x4b205b - 1, Math.trunc(Number(_0x5b9c83) || 0)));
      const _0x52b919 = _0x372fc[Math.max(0, Math.min(_0x4b205b - 1, Math.trunc(Number(_0x5b9c83) || 0)))] || _0x372fc[0] || null;
      const _0x58b6ad = !!String(_0x52b919?.error || "").trim();
      if (_0x58b6ad) {
        this._discardRendererVisibleVideoSurface();
      }
      const _0x124a90 = this._isVideoMarkedUnavailable(_0x52b919);
      const _0x100238 = this._resolveVideoMetaSrcFromVideoData(_0x52b919);
      if (_0x100238 && !_0x124a90 && !_0x58b6ad) {
        this._maybeFetchVideoMeta(_0x100238);
      }
      const _0x1cc7e5 = (_0x43c274, _0x54287c) => {
        if (isVideoResultViewportBusy()) {
          return;
        }
        if (this._isVideoMarkedUnavailable(_0x54287c)) {
          return;
        }
        const _0x112180 = this._resolveVideoMetaSrcFromVideoData(_0x54287c);
        if (!_0x112180) {
          return;
        }
        if (!_0x112180.startsWith("/output/") && !_0x112180.startsWith("/data/")) {
          return;
        }
        if (this._isVideoThumbMarkedUnavailable(_0x54287c, _0x112180)) {
          return;
        }
        const _0x703c26 = _0x6680a0.getState().nodes?.[this.nodeId] || {};
        const _0x2c2c9e = ["waiting", "processing"].includes(String(_0x703c26.mediaTaskStatus || "")) && ["videoFirstFrame", "videoPoster"].includes(String(_0x703c26.mediaTaskKind || ""));
        if (String(_0x54287c?.videoThumbSrc || "").trim() === _0x112180) {
          if (String(_0x54287c?.thumbUrl || "").trim() || _0x2c2c9e) {
            return;
          }
        }
        const _0x5b26e8 = "out|" + this.nodeId + "|" + _0x43c274 + "|" + _0x112180;
        if (this._videoThumbPending.has(_0x5b26e8)) {
          return;
        }
        this._videoThumbPending.add(_0x5b26e8);
        const _0x5ebe87 = _0x6680a0.getState().nodes?.[this.nodeId];
        const _0x4cd928 = Array.isArray(_0x5ebe87?.videos) ? _0x5ebe87.videos : [];
        if (_0x43c274 >= 0 && _0x43c274 < _0x4cd928.length) {
          const _0x731b85 = _0x4cd928[_0x43c274];
          if (_0x731b85 && typeof _0x731b85 === "object" && String(_0x731b85.videoThumbSrc || "").trim() !== _0x112180) {
            const _0x1d3c0c = _0x4cd928.slice();
            _0x1d3c0c[_0x43c274] = {
              ..._0x731b85,
              videoThumbSrc: _0x112180
            };
            _0x6680a0.updateNodeData(this.nodeId, {
              videos: _0x1d3c0c
            });
          }
        }
        _0x55b1a8.fetchVideoFirstFrameThumbFromServer(_0x112180, {
          nodeId: this.nodeId,
          assetId: String(_0x54287c?.assetId || _0x54287c?.thumbId || "")
        }).then(_0x593a3f => {
          const _0x5b08f1 = String(_0x593a3f?.thumbUrl || _0x593a3f?.url || "").trim();
          if (!_0x5b08f1) {
            return;
          }
          const _0x51d78c = _0x6680a0.getState();
          const _0x33d32a = _0x51d78c.nodes?.[this.nodeId];
          if (!_0x33d32a) {
            return;
          }
          const _0x22ef86 = Array.isArray(_0x33d32a.videos) ? _0x33d32a.videos : [];
          if (!(_0x43c274 >= 0) || !(_0x43c274 < _0x22ef86.length)) {
            return;
          }
          const _0x1db330 = _0x22ef86[_0x43c274];
          if (!_0x1db330 || typeof _0x1db330 !== "object") {
            return;
          }
          const _0x3f263f = {
            ..._0x1db330,
            videoThumbSrc: _0x112180,
            videoThumbUnavailableSource: ""
          };
          if (!String(_0x3f263f.thumbUrl || "").trim() && _0x5b08f1) {
            _0x3f263f.thumbUrl = _0x5b08f1;
          }
          const _0x2b9c7c = _0x22ef86.slice();
          _0x2b9c7c[_0x43c274] = _0x3f263f;
          const _0x43aa0f = {
            videos: _0x2b9c7c
          };
          const _0xfc66ad = Number(_0x33d32a.mainVideoIndex);
          const _0x22229c = Number.isFinite(_0xfc66ad) ? Math.max(0, Math.trunc(_0xfc66ad)) : 0;
          if (_0x43c274 === _0x22229c) {
            _0x43aa0f.videoThumbUnavailableSource = "";
          }
          if (_0x43c274 === _0x22229c) {
            if (!String(_0x33d32a.thumbUrl || "").trim() && _0x5b08f1) {
              _0x43aa0f.thumbUrl = _0x5b08f1;
            }
          }
          _0x6680a0.updateNodeData(this.nodeId, _0x43aa0f);
        }).catch(() => {
          const _0x83ef7d = _0x6680a0.getState().nodes?.[this.nodeId] || this._data || {};
          const _0x283c19 = Array.isArray(_0x83ef7d.videos) ? _0x83ef7d.videos : [];
          const _0x1d4376 = _0x283c19[_0x43c274] || _0x54287c || {};
          const _0xc7b9ba = this._resolveVideoMetaSrcFromVideoData(_0x1d4376);
          if (_0xc7b9ba === _0x112180) {
            this._markVideoThumbUnavailable(_0x43c274, _0x1d4376, _0x112180);
          }
        }).finally(() => {
          this._videoThumbPending.delete(_0x5b26e8);
        });
      };
      const _0x219f8e = _0x372fc.map(_0x559098 => (_0x559098.videoUrl || "") + "|" + (_0x559098.localPath || "") + "|" + (_0x559098.displayLocalPath || "") + "|" + (_0x559098.thumbId || "") + "|" + (_0x559098.error || "")).join("||");
      const _0xf12e01 = _0x219f8e !== this._lastVideosKeyStr;
      const _0x40122b = _0x5b9c83 !== this._lastMainIdx;
      const _0x1ad1e7 = _0x487029 !== this._lastIsExpanded;
      const _0x3fb455 = _0x31e619 && !_0x159047;
      const _0x49d372 = !this._expandPanel || _0xf12e01 || _0x40122b || _0x1ad1e7;
      this._lastVideosKeyStr = _0x219f8e;
      this._lastMainIdx = _0x5b9c83;
      this._lastIsExpanded = _0x487029;
      this._lastVideoRenderWasThin = _0x159047;
      if (!this._multiVideosContainer) {
        this._multiVideosContainer = document.createElement("div");
        this._multiVideosContainer.className = "multi-video-container";
        this.previewEl.appendChild(this._multiVideosContainer);
      }
      const _0x5ba3e7 = new Array(_0x4b205b).fill("");
      const _0x398871 = new Array(_0x4b205b).fill("");
      const _0x25dccc = [];
      const _0xe2cf53 = this._isHovered === true || this._isManualControl === true;
      const _0xfddbf5 = this._isManualControl === true ? "auto" : "metadata";
      for (let _0xc5bc22 = 0; _0xc5bc22 < _0x4b205b; _0xc5bc22++) {
        const _0x4428f9 = _0x372fc[_0xc5bc22] || {};
        const _0x514824 = this._isVideoMarkedUnavailable(_0x4428f9);
        if (!_0x514824) {
          _0x398871[_0xc5bc22] = this._resolveVideoResultPosterUrl(_0x4428f9, {
            nodeData: this._data,
            allowNodeFallback: _0x4b205b <= 1 && _0xc5bc22 === _0xb0faa2
          });
        }
        const _0x36a90b = _0xc5bc22 === _0xb0faa2;
        const _0x3892a6 = _0x487029 || _0x36a90b && _0xe2cf53;
        if (_0x3892a6 && !_0x514824) {
          let _0x561109 = this._resolveVideoPlaybackUrl(_0x4428f9);
          if (!_0x561109 && _0x4428f9.thumbId) {
            const _0x3dff01 = String(_0x4428f9.thumbId || "");
            const _0x4b4382 = _0x3dff01 ? this._cachedVideoUrls.get(_0x3dff01) : "";
            if (_0x4b4382) {
              _0x561109 = _0x4b4382;
            } else {
              _0x25dccc.push({
                i: _0xc5bc22,
                thumbId: _0x3dff01
              });
            }
          }
          _0x5ba3e7[_0xc5bc22] = _0x561109;
        }
      }
      const _0x2a9878 = _0x58b6ad || !_0x124a90 && (!!_0x5ba3e7[_0xb0faa2] || !!_0x398871[_0xb0faa2]);
      setVideoResultElementVisible(this._placeholderEl, !_0x2a9878);
      this._setVideoOverlaysVisible(!_0x58b6ad && _0x2a9878 && !_0x487029);
      if (!_0x58b6ad && _0x398871[_0xb0faa2]) {
        if (!isVideoResultViewportBusy()) {
          _0xac96f0(_0x398871[_0xb0faa2]);
        }
      } else if (!_0x58b6ad) {
        _0x1cc7e5(_0xb0faa2, _0x52b919);
      }
      const _0x54de2b = _0x4321b1 => {
        if (this._isExpandedPickClosing) {
          return;
        }
        this._isExpandedPickClosing = true;
        const _0x436b34 = this._root.querySelectorAll(".multi-flyout-panel > div");
        const _0x2fc4aa = () => {
          const _0x442e11 = _0x372fc[_0x4321b1];
          if (!_0x442e11 || typeof _0x442e11 !== "object") {
            return {
              w: 0,
              h: 0,
              d: 0
            };
          }
          const _0xba77d3 = Number(_0x442e11.videoWidth || 0);
          const _0x1433c9 = Number(_0x442e11.videoHeight || 0);
          const _0x2c476f = Number(_0x442e11.duration);
          return {
            w: Number.isFinite(_0xba77d3) ? _0xba77d3 : 0,
            h: Number.isFinite(_0x1433c9) ? _0x1433c9 : 0,
            d: _0x2c476f
          };
        };
        const _0x5e5553 = () => {
          const _0x266165 = _0x2fc4aa();
          const _0xf256fd = {
            ...buildSelectedVideoResultPresentationPatch(_0x372fc, _0x4321b1)
          };
          if (_0x266165.w > 0 && _0x266165.h > 0) {
            _0xf256fd.selectedVideoWidth = _0x266165.w;
            _0xf256fd.selectedVideoHeight = _0x266165.h;
            _0xf256fd.videoWidth = _0x266165.w;
            _0xf256fd.videoHeight = _0x266165.h;
          }
          if (Number.isFinite(_0x266165.d) && _0x266165.d > 0) {
            _0xf256fd.videoDuration = _0x266165.d;
          }
          return _0xf256fd;
        };
        if (_0x436b34.length > 0) {
          const _0x5ba79e = this.previewEl.offsetTop;
          const _0x19555f = 0;
          const _0x55bf01 = _0x5ba79e;
          _0x436b34.forEach(_0x5563fe => {
            applyVideoResultGeometryAnimationStyle(_0x5563fe, {
              transition: "all 0.35s cubic-bezier(0.6, -0.28, 0.735, 0.045)",
              opacity: "0",
              transform: "scale(0.01) rotate(-45deg)",
              filter: "blur(10px)",
              top: _0x55bf01 + "px",
              left: _0x19555f + "px"
            });
          });
          setTimeout(() => {
            _0x6680a0.updateNodeData(this.nodeId, _0x5e5553());
            this._isExpandedPickClosing = false;
          }, 350);
        } else {
          _0x6680a0.updateNodeData(this.nodeId, _0x5e5553());
          this._isExpandedPickClosing = false;
        }
      };
      const _0x1e5d1d = (_0x44a4b4, _0xd5291d) => {
        _0x44a4b4.innerHTML = _0xd5291d ? "<span>" + _0x4b205b + " 个</span><svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><polyline points=\"9 18 15 12 9 6\"></polyline></svg>" : "<span>" + _0x4b205b + " 个</span><svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><polyline points=\"6 9 12 15 18 9\"></polyline></svg>";
        _0x44a4b4.classList?.toggle?.("is-expanded", _0xd5291d === true);
      };
      if (_0xf12e01 || !this._multiStackWrap || _0x3fb455) {
        const _0x2e7667 = _0x3fb455 && !_0x58b6ad ? this._multiLayerEls?.[_0xb0faa2] || null : null;
        if (_0xf12e01 || !_0x2e7667) {
          this._videoSourceAttachToken = Number(this._videoSourceAttachToken || 0) + 1;
          _0x2d87f4 = Number(this._videoSourceAttachToken || 0);
        }
        if (!_0x2e7667) {
          this._multiVideosContainer.innerHTML = "";
          this._multiStackWrap = document.createElement("div");
          this._multiStackWrap.className = "multi-stack-wrap ai-video-result-stack";
          if (!!this._rendererVisibleVideoSurface?.videoEl && this._rendererVisibleVideoSurface.videoEl.isConnected !== false && this._multiVideosContainer.isConnected === true) {
            this._multiVideosContainer.appendChild(this._multiStackWrap);
          }
        } else {
          this._multiToggleBtn?.remove?.();
        }
        this._multiLayerEls = [];
        this._multiErrorEls = [];
        this._multiToggleBtn = null;
        for (let _0x20b384 = _0x4b205b - 1; _0x20b384 >= 0; _0x20b384--) {
          if (_0x159047 && _0x20b384 !== _0xb0faa2) {
            continue;
          }
          if (_0x2e7667 && _0x20b384 === _0xb0faa2) {
            this._multiLayerEls[_0x20b384] = _0x2e7667;
            continue;
          }
          const _0x39faf1 = String(_0x372fc[_0x20b384]?.error || "").trim();
          if (_0x39faf1) {
            const _0x39886f = this._createErrorCard(_0x39faf1);
            _0x39886f.className = ((_0x39886f.className || "") + " ai-video-result-error-layer").trim();
            this._multiErrorEls[_0x20b384] = _0x39886f;
            this._multiStackWrap.appendChild(_0x39886f);
            continue;
          }
          const _0x110beb = _0x20b384 === _0xb0faa2 ? this._rendererVisibleVideoSurface : null;
          const _0x2b849a = _0x110beb?.videoEl || document.createElement("video");
          if (_0x110beb) {
            this._rendererVisibleVideoSurface = null;
            _0x2b849a.classList?.remove?.("v2-renderer-visible-video-surface");
            for (const _0x37d0ae of ["position", "left", "top", "transform", "contain"]) {
              _0x2b849a.style?.removeProperty?.(_0x37d0ae);
            }
            Object.assign(_0x2b849a.style, {
              width: "",
              height: ""
            });
            const _0x1cb70e = typeof this._multiStackWrap.moveBefore === "function" && this._multiStackWrap.isConnected === true && _0x2b849a.isConnected === true && this._multiStackWrap.ownerDocument === _0x2b849a.ownerDocument;
            if (_0x1cb70e) {
              this._multiStackWrap.moveBefore(_0x2b849a, null);
              _0x2b849a.dataset.rendererSurfaceMove = "state-preserving";
            } else {
              this._multiStackWrap.appendChild(_0x2b849a);
              _0x2b849a.dataset.rendererSurfaceMove = "legacy";
            }
          }
          _0x2b849a.dataset.idx = String(_0x20b384);
          if (_0x398871[_0x20b384]) {
            _0x2b849a.poster = _0x398871[_0x20b384];
          }
          const _0x155acf = _0x20b384 === _0xb0faa2 && _0xe2cf53 && !_0x398871[_0x20b384];
          if (_0x155acf && _0x5ba3e7[_0x20b384]) {
            const _0x1cacb1 = await this._resolveLocalVideoPlaybackObjectUrl(_0x5ba3e7[_0x20b384], "ai-video:" + this.nodeId + ":slot:" + _0x20b384);
            if (Number(this._videoRenderEpoch || 0) !== _0x29a86b) {
              return;
            }
            await attachMediaElementPlaybackSource(_0x2b849a, _0x5ba3e7[_0x20b384], {
              playbackUrl: _0x1cacb1,
              preload: _0xfddbf5,
              warmRanges: false,
              load: false,
              shouldAssign: _0x1daed3
            });
            if (!_0x1daed3()) {
              return;
            }
            this._restorePreviewHoverPlaybackTime(_0x2b849a, _0x5ba3e7[_0x20b384]);
          }
          _0x2b849a.autoplay = false;
          _0x2b849a.loop = false;
          _0x2b849a.muted = true;
          _0x2b849a.playsInline = true;
          if (!_0x110beb) {
            _0x2b849a.preload = _0x155acf ? _0xfddbf5 : "none";
          }
          _0x2b849a.draggable = false;
          _0x2b849a.addEventListener("dragstart", _0x2e1135 => _0x2e1135.preventDefault());
          _0x2b849a.classList.add("v2-media-preview", "ai-video-result-layer");
          this._attachPreviewVideoRecovery(_0x2b849a, "preview");
          const _0x7aecb = () => {
            const _0x133ac1 = _0x6680a0.getState().nodes[this.nodeId] || this._data || {};
            const _0x188ee9 = Number(_0x133ac1.mainVideoIndex) || 0;
            const _0x585160 = Math.max(0, Math.trunc(_0x188ee9));
            return _0x20b384 === _0x585160;
          };
          const _0x5e09b0 = (_0x396938, _0x56c5c0, _0x55392e) => {
            const _0x5d388f = _0x6680a0.getState().nodes[this.nodeId];
            if (!_0x5d388f) {
              return;
            }
            const _0xf45388 = Array.isArray(_0x5d388f.videos) ? _0x5d388f.videos : [];
            const _0x25fb84 = _0xf45388[_0x20b384] || null;
            if (!_0x25fb84 || typeof _0x25fb84 !== "object") {
              return;
            }
            const _0x4f9bfd = {
              ..._0x25fb84
            };
            let _0x4449da = false;
            if (_0x396938 > 0 && Number(_0x4f9bfd.videoWidth || 0) !== _0x396938) {
              _0x4f9bfd.videoWidth = _0x396938;
              _0x4449da = true;
            }
            if (_0x56c5c0 > 0 && Number(_0x4f9bfd.videoHeight || 0) !== _0x56c5c0) {
              _0x4f9bfd.videoHeight = _0x56c5c0;
              _0x4449da = true;
            }
            if (Number.isFinite(_0x55392e) && _0x55392e > 0 && Number(_0x4f9bfd.duration || 0) !== _0x55392e) {
              _0x4f9bfd.duration = _0x55392e;
              _0x4449da = true;
            }
            if (!_0x4449da) {
              return;
            }
            const _0x22ebed = _0xf45388.slice();
            _0x22ebed[_0x20b384] = _0x4f9bfd;
            const _0x1ace1c = {
              videos: _0x22ebed
            };
            if (_0x7aecb()) {
              if (_0x396938 > 0 && Number(_0x5d388f.videoWidth || 0) !== _0x396938) {
                _0x1ace1c.videoWidth = _0x396938;
              }
              if (_0x56c5c0 > 0 && Number(_0x5d388f.videoHeight || 0) !== _0x56c5c0) {
                _0x1ace1c.videoHeight = _0x56c5c0;
              }
              if (_0x396938 > 0 && Number(_0x5d388f.selectedVideoWidth || 0) !== _0x396938) {
                _0x1ace1c.selectedVideoWidth = _0x396938;
              }
              if (_0x56c5c0 > 0 && Number(_0x5d388f.selectedVideoHeight || 0) !== _0x56c5c0) {
                _0x1ace1c.selectedVideoHeight = _0x56c5c0;
              }
              if (Number.isFinite(_0x55392e) && _0x55392e > 0 && Number(_0x5d388f.videoDuration || 0) !== _0x55392e) {
                _0x1ace1c.videoDuration = _0x55392e;
              }
              Object.assign(_0x1ace1c, this._buildRhAiAppVideoResultDisplayPatch(_0x5d388f, _0x396938, _0x56c5c0, getVideoResultMediaKey(_0x4f9bfd, _0x5d388f)));
            }
            _0x6680a0.updateNodeData(this.nodeId, _0x1ace1c);
          };
          _0x2b849a.addEventListener("loadedmetadata", () => {
            this._clearVideoUnavailable(_0x20b384, _0x372fc[_0x20b384]);
            const _0x187eb2 = _0x2b849a.videoWidth || 0;
            const _0x14c0b5 = _0x2b849a.videoHeight || 0;
            const _0x498adb = Number(_0x2b849a.duration);
            _0x5e09b0(_0x187eb2, _0x14c0b5, _0x498adb);
            if (_0x7aecb()) {
              this._syncVideoControlsFromVideo(_0x2b849a);
            }
          });
          _0x2b849a.addEventListener("error", () => {
            const _0x4f91a8 = _0x6680a0.getState().nodes[this.nodeId] || this._data || {};
            const _0x5c56fe = Array.isArray(_0x4f91a8.videos) ? _0x4f91a8.videos : [];
            const _0x5063fd = _0x5c56fe[_0x20b384] || _0x372fc[_0x20b384] || {};
            const _0x1633f2 = Number(_0x4f91a8.mainVideoIndex);
            const _0x18b8a4 = Number.isFinite(_0x1633f2) ? Math.max(0, Math.trunc(_0x1633f2)) : 0;
            if (_0x20b384 === _0x18b8a4) {
              _0x2b849a.removeAttribute("poster");
              _0x2b849a.removeAttribute("src");
              try {
                _0x2b849a.load?.();
              } catch {}
              setVideoResultElementVisible(this._placeholderEl, true);
              this._setVideoOverlaysVisible(false);
              this._hideCenterIndicator();
              this._syncVideoControlsFromVideo(null);
            }
            this._markVideoUnavailable(_0x20b384, _0x5063fd);
          });
          _0x2b849a.addEventListener("timeupdate", () => {
            if (_0x7aecb()) {
              this._clearPreviewPosterForVisibleFrame(_0x2b849a);
              this._syncVideoControlsFromVideo(_0x2b849a);
            }
          });
          const _0x1d6565 = () => {
            if (_0x7aecb()) {
              this._clearPreviewPosterForVisibleFrame(_0x2b849a);
            }
          };
          _0x2b849a.addEventListener("loadeddata", _0x1d6565);
          _0x2b849a.addEventListener("canplay", _0x1d6565);
          _0x2b849a.addEventListener("playing", _0x1d6565);
          _0x2b849a.addEventListener("pause", () => {
            if (_0x7aecb()) {
              this._showPausedCenterIndicator();
              this._syncVideoControlsFromVideo(_0x2b849a);
            }
          });
          _0x2b849a.addEventListener("play", () => {
            if (_0x7aecb()) {
              this._hideCenterIndicator();
              this._syncVideoControlsFromVideo(_0x2b849a);
            }
          });
          _0x2b849a.addEventListener("ended", () => {
            if (_0x7aecb()) {
              this._handlePreviewVideoEnded(_0x2b849a);
            }
          });
          _0x2b849a.addEventListener("click", _0x3c0ff7 => {
            const _0x2a86fe = _0x6680a0.getState().nodes[this.nodeId];
            if (_0x2a86fe.isVideosExpanded) {
              _0x3c0ff7.stopPropagation();
              _0x54de2b(this._lastMainIdx || 0);
              return;
            }
            if (_0x3c0ff7.detail && _0x3c0ff7.detail > 1) {
              return;
            }
            _0x3c0ff7.stopPropagation();
            if (_0x3047cf.isActiveFor(this.nodeId)) {
              return;
            }
            if (this._videoClickTimer) {
              clearTimeout(this._videoClickTimer);
            }
            this._videoClickTimer = setTimeout(() => {
              this._videoClickTimer = null;
              const _0x4a8b7e = _0x6680a0.getState().nodes[this.nodeId];
              if (_0x4a8b7e?.isVideosExpanded) {
                return;
              }
              if (_0x3047cf.isActiveFor(this.nodeId)) {
                return;
              }
              this._toggleVideoPlayPause(_0x2b849a);
            }, 180);
          });
          _0x2b849a.addEventListener("dblclick", _0x1d18be => {
            _0x1d18be.stopPropagation();
            if (_0x3047cf.isActiveFor(this.nodeId)) {
              return;
            }
            if (this._videoClickTimer) {
              clearTimeout(this._videoClickTimer);
              this._videoClickTimer = null;
            }
            const _0x4f6eb6 = this._lastMainIdx || 0;
            const _0x518eb8 = _0x6680a0.getState().nodes[this.nodeId];
            const _0x33969b = _0x518eb8.videos || [];
            const _0x2775c8 = _0x33969b[_0x4f6eb6] || _0x33969b[0];
            this._openFullScreenFromVideo(_0x2775c8, _0x2b849a);
          });
          this._multiLayerEls[_0x20b384] = _0x2b849a;
          if (_0x2b849a.parentNode !== this._multiStackWrap) {
            this._multiStackWrap.appendChild(_0x2b849a);
          }
        }
        if (_0x25dccc.length > 0) {
          const _0x1492d1 = ++this._blobResolveToken;
          for (const _0xccbd0b of _0x25dccc) {
            const _0x2aa662 = _0xccbd0b.i;
            const _0x15a20c = String(_0xccbd0b.thumbId || "");
            if (!_0x15a20c) {
              continue;
            }
            if (this._cachedVideoUrls.has(_0x15a20c)) {
              continue;
            }
            _0xb70b0c(_0x15a20c).then(_0x3219dd => {
              if (_0x1492d1 !== this._blobResolveToken) {
                return;
              }
              if (!_0x3219dd) {
                return;
              }
              const _0x1bc1a7 = URL.createObjectURL(_0x3219dd);
              this._cachedVideoUrls.set(_0x15a20c, _0x1bc1a7);
              const _0x54904e = this._multiLayerEls?.[_0x2aa662];
              if (!_0x54904e || !_0x54904e.isConnected) {
                return;
              }
              if (!_0x487029 && _0x2aa662 !== _0xb0faa2) {
                return;
              }
              _0x54904e.src = _0x1bc1a7;
              try {
                _0x54904e.load?.();
              } catch {}
              if (_0x2aa662 === _0xb0faa2) {
                if (this._placeholderEl && isVideoResultElementVisible(this._placeholderEl)) {
                  setVideoResultElementVisible(this._placeholderEl, false);
                  this._setVideoOverlaysVisible(true);
                }
              }
            }).catch(() => {});
          }
        }
        if (_0x38bc09 && !_0x159047) {
          this._multiToggleBtn = document.createElement("div");
          this._multiToggleBtn.className = "multi-toggle-btn";
          this._multiToggleBtn.addEventListener("pointerdown", _0x15f4f1 => {
            if (_0x15f4f1.button !== 0) {
              return;
            }
            _0x15f4f1.preventDefault();
            _0x15f4f1.stopPropagation();
            const _0x1915d5 = _0x6680a0.getState().nodes[this.nodeId];
            const _0x2ed152 = !!_0x1915d5.isVideosExpanded;
            if (_0x2ed152) {
              const _0x45bf16 = this._root.querySelectorAll(".multi-flyout-panel > div");
              if (_0x45bf16.length > 0) {
                const _0xa2442 = this.previewEl.offsetTop;
                const _0x31c750 = 0;
                const _0x462c7b = _0xa2442;
                _0x45bf16.forEach(_0xdf0361 => {
                  applyVideoResultGeometryAnimationStyle(_0xdf0361, {
                    transition: "all 0.35s cubic-bezier(0.6, -0.28, 0.735, 0.045)",
                    opacity: "0",
                    transform: "scale(0.01) rotate(-45deg)",
                    filter: "blur(10px)",
                    top: _0x462c7b + "px",
                    left: _0x31c750 + "px"
                  });
                });
                setTimeout(() => {
                  _0x6680a0.updateNodeData(this.nodeId, {
                    isVideosExpanded: false
                  });
                }, 350);
              } else {
                _0x6680a0.updateNodeData(this.nodeId, {
                  isVideosExpanded: false
                });
              }
            } else {
              _0x6680a0.updateNodeData(this.nodeId, {
                isVideosExpanded: true
              });
            }
          });
          this._multiToggleBtn.addEventListener("mouseenter", () => _0x1e5d1d(this._multiToggleBtn, true));
          this._multiToggleBtn.addEventListener("mouseleave", () => {
            const _0x317d4d = _0x6680a0.getState().nodes[this.nodeId];
            _0x1e5d1d(this._multiToggleBtn, !!_0x317d4d.isVideosExpanded);
          });
          this._multiToggleBtn.addEventListener("click", _0xd65731 => {
            _0xd65731.preventDefault();
            _0xd65731.stopPropagation();
          });
          this._multiStackWrap.appendChild(this._multiToggleBtn);
        }
        if (this._multiStackWrap.parentNode !== this._multiVideosContainer) {
          this._multiVideosContainer.appendChild(this._multiStackWrap);
        }
      }
      if (this._multiToggleBtn) {
        _0x1e5d1d(this._multiToggleBtn, _0x487029);
      }
      this._applyMuteStateToPreviewVideos();
      for (let _0x1002eb = 0; _0x1002eb < _0x4b205b; _0x1002eb++) {
        const _0x52f094 = _0x1002eb === _0x5b9c83;
        const _0x5bc932 = this._multiLayerEls[_0x1002eb];
        const _0x5b57cb = this._multiErrorEls[_0x1002eb];
        if (_0x5bc932) {
          const _0x54dd60 = _0x5ba3e7[_0x1002eb] || "";
          const _0x21dd85 = _0x398871[_0x1002eb] || "";
          const _0x1d0c68 = String(_0x5bc932.getAttribute("src") || "").trim();
          const _0x3d0a0e = _0x52f094 && _0xe2cf53;
          const _0x2bb3a6 = _0x3d0a0e ? _0xfddbf5 : "none";
          const _0x2311e2 = isVideoResultFrameReady(_0x5bc932, _0x54dd60);
          const _0x51f451 = _0x52f094 && !_0x3d0a0e && _0x2311e2 && !!_0x1d0c68;
          const _0x13d06e = this._isPreviewPosterClearedForPlayback(_0x5bc932);
          const _0xd06b44 = !!_0x21dd85 && !_0x13d06e && !_0x2311e2;
          if (_0xd06b44 && _0x5bc932.poster !== _0x21dd85) {
            _0x5bc932.poster = _0x21dd85;
          } else if ((!_0x21dd85 || _0x13d06e || _0x2311e2) && _0x5bc932.poster) {
            _0x5bc932.removeAttribute("poster");
          }
          if (_0x5bc932.preload !== _0x2bb3a6) {
            _0x5bc932.preload = _0x2bb3a6;
            if (_0x2bb3a6 === "auto" && _0x1d0c68 && _0x5bc932.paused && !this._isHovered && !this._isManualControl && Number(_0x5bc932.readyState || 0) < 2) {
              try {
                _0x5bc932.load?.();
              } catch {}
            }
          }
          if (_0x3d0a0e) {
            if (!_0x52f094 && _0x21dd85 && !_0x54dd60 && _0x1d0c68 && _0x5bc932.paused && !this._isHovered && !this._isManualControl) {
              _0x5bc932.removeAttribute("src");
              _0x5bc932.load?.();
            }
            if (_0x54dd60 && _0x1d0c68 !== _0x54dd60 && !isMediaElementPlaybackSource(_0x5bc932, _0x54dd60)) {
              const _0xf88cee = await this._resolveLocalVideoPlaybackObjectUrl(_0x54dd60, "ai-video:" + this.nodeId + ":slot:" + _0x1002eb);
              if (Number(this._videoRenderEpoch || 0) !== _0x29a86b) {
                return;
              }
              globalThis.window?.__runtimeCompareMark?.("ai-video-playback:attach", {
                nodeId: this.nodeId,
                slotIndex: _0x1002eb,
                sourceUrl: _0x54dd60,
                playbackUrl: _0xf88cee
              });
              await attachMediaElementPlaybackSource(_0x5bc932, _0x54dd60, {
                playbackUrl: _0xf88cee,
                preload: _0x2bb3a6,
                warmRanges: false,
                load: false,
                shouldAssign: _0x1daed3,
                onSourceAssigned: () => {
                  this._clearPreviewPosterForVisibleFrame(_0x5bc932);
                }
              });
              if (!_0x1daed3()) {
                return;
              }
              this._restorePreviewHoverPlaybackTime(_0x5bc932, _0x54dd60);
              this._clearPreviewPosterForVisibleFrame(_0x5bc932);
            } else if (!_0x54dd60 && !_0x1d0c68 && !_0x21dd85) {
              const _0x87a4b = _0x372fc[_0x1002eb] || {};
              const _0x592134 = String(_0x87a4b.thumbId || "");
              if (_0x592134 && (_0x487029 || _0x1002eb === _0xb0faa2)) {
                if (this._cachedVideoUrls.has(_0x592134)) {
                  _0x5bc932.src = this._cachedVideoUrls.get(_0x592134);
                } else {
                  const _0x545b0d = ++this._blobResolveToken;
                  _0xb70b0c(_0x592134).then(_0x177d7a => {
                    if (_0x545b0d !== this._blobResolveToken) {
                      return;
                    }
                    if (!_0x177d7a) {
                      return;
                    }
                    const _0x58ebaa = URL.createObjectURL(_0x177d7a);
                    this._cachedVideoUrls.set(_0x592134, _0x58ebaa);
                    if (!_0x5bc932.isConnected) {
                      return;
                    }
                    _0x5bc932.src = _0x58ebaa;
                    try {
                      _0x5bc932.load?.();
                    } catch {}
                    if (_0x1002eb === _0xb0faa2) {
                      if (this._placeholderEl && isVideoResultElementVisible(this._placeholderEl)) {
                        setVideoResultElementVisible(this._placeholderEl, false);
                        this._setVideoOverlaysVisible(!_0x487029);
                      }
                    }
                  }).catch(() => {});
                }
              }
            }
            if (_0x52f094 && _0x54dd60 && isMediaElementPlaybackSource(_0x5bc932, _0x54dd60)) {
              this._clearPreviewPosterForVisibleFrame(_0x5bc932);
            }
          } else if (_0x1d0c68 && !_0x51f451) {
            _0x5bc932.removeAttribute("src");
            _0x5bc932.load?.();
          }
          setVideoResultLayerActive(_0x5bc932, _0x52f094, _0x52f094 ? _0x4b205b + 1 : _0x1002eb);
        }
        if (_0x5b57cb) {
          setVideoResultLayerActive(_0x5b57cb, _0x52f094, _0x52f094 ? _0x4b205b + 1 : _0x1002eb);
        }
      }
      const _0x10ce8d = this._multiLayerEls[_0x5b9c83];
      if (_0x10ce8d) {
        const _0x13d250 = _0x10ce8d.videoWidth || 0;
        const _0x28cdc3 = _0x10ce8d.videoHeight || 0;
        const _0x1e87d3 = Number(_0x10ce8d.duration);
        const _0x4ba33d = _0x6680a0.getState().nodes[this.nodeId];
        if (_0x4ba33d) {
          const _0x37f7c0 = {};
          if (_0x13d250 > 0 && Number(_0x4ba33d.videoWidth || 0) !== _0x13d250) {
            _0x37f7c0.videoWidth = _0x13d250;
          }
          if (_0x28cdc3 > 0 && Number(_0x4ba33d.videoHeight || 0) !== _0x28cdc3) {
            _0x37f7c0.videoHeight = _0x28cdc3;
          }
          if (_0x13d250 > 0 && Number(_0x4ba33d.selectedVideoWidth || 0) !== _0x13d250) {
            _0x37f7c0.selectedVideoWidth = _0x13d250;
          }
          if (_0x28cdc3 > 0 && Number(_0x4ba33d.selectedVideoHeight || 0) !== _0x28cdc3) {
            _0x37f7c0.selectedVideoHeight = _0x28cdc3;
          }
          if (Number.isFinite(_0x1e87d3) && _0x1e87d3 > 0 && Number(_0x4ba33d.videoDuration || 0) !== _0x1e87d3) {
            _0x37f7c0.videoDuration = _0x1e87d3;
          }
          Object.assign(_0x37f7c0, this._buildRhAiAppVideoResultDisplayPatch(_0x4ba33d, _0x13d250, _0x28cdc3, getVideoResultMediaKey(_0x4ba33d, _0x4ba33d)));
          if (Object.keys(_0x37f7c0).length) {
            _0x6680a0.updateNodeData(this.nodeId, _0x37f7c0);
          }
        }
      }
      if (_0x10ce8d && _0x10ce8d.paused) {
        this._showPausedCenterIndicator();
      } else {
        this._hideCenterIndicator();
      }
      this._syncVideoControlsFromVideo(_0x10ce8d || null);
      if (_0x487029) {
        this._root.classList?.add?.("is-video-result-expanded");
        if (!_0x49d372) {
          return;
        }
        const _0x11b5c0 = _0x4b205b <= 2 ? _0x4b205b : 2;
        const _0x2f32b9 = Math.ceil(_0x4b205b / _0x11b5c0);
        const _0x424c52 = 12;
        const _0x47c18a = this.previewEl.offsetWidth;
        const _0x47c373 = this.previewEl.offsetHeight;
        const _0x14c757 = this.previewEl.offsetTop;
        const _0x2dc4dc = _0x2f32b9 - 1;
        const _0x50c817 = 0;
        const _0x9e6ad8 = [];
        for (let _0x2c33af = 0; _0x2c33af < _0x4b205b; _0x2c33af++) {
          if (_0x2c33af !== _0x5b9c83) {
            _0x9e6ad8.push({
              video: _0x372fc[_0x2c33af],
              url: _0x5ba3e7[_0x2c33af],
              origIdx: _0x2c33af
            });
          }
        }
        if (this._expandPanel && this._expandPanel.parentNode) {
          this._expandPanel.parentNode.removeChild(this._expandPanel);
        }
        this._expandPanel = document.createElement("div");
        this._expandPanel.className = "multi-flyout-panel";
        const _0x5b30ad = [];
        for (let _0x373c0c = 0; _0x373c0c < _0x2f32b9; _0x373c0c++) {
          for (let _0x2b6746 = 0; _0x2b6746 < _0x11b5c0; _0x2b6746++) {
            if (_0x373c0c === _0x2dc4dc && _0x2b6746 === _0x50c817) {
              continue;
            }
            _0x5b30ad.push({
              r: _0x373c0c,
              c: _0x2b6746
            });
          }
        }
        if (_0x2f32b9 === 2 && _0x11b5c0 === 2) {
          _0x5b30ad.length = 0;
          _0x5b30ad.push({
            r: 1,
            c: 1
          });
          _0x5b30ad.push({
            r: 0,
            c: 0
          });
          _0x5b30ad.push({
            r: 0,
            c: 1
          });
        }
        for (let _0x34de90 = 0; _0x34de90 < _0x9e6ad8.length; _0x34de90++) {
          if (_0x34de90 >= _0x5b30ad.length) {
            break;
          }
          const _0xbbb4b9 = _0x5b30ad[_0x34de90].r;
          const _0x5510f7 = _0x5b30ad[_0x34de90].c;
          const {
            video: _0x1d2ba2,
            url: _0x38b23d,
            origIdx: _0x43f111
          } = _0x9e6ad8[_0x34de90];
          const _0x201a9c = _0x14c757 + (_0xbbb4b9 - _0x2dc4dc) * (_0x47c373 + _0x424c52);
          const _0x381e4 = _0x5510f7 * (_0x47c18a + _0x424c52);
          const _0x196ee1 = _0x14c757;
          const _0x1316b4 = 0;
          const _0x11251f = document.createElement("div");
          _0x11251f.className = "ai-video-expanded-result-cell";
          applyVideoResultGeometryAnimationStyle(_0x11251f, {
            top: _0x196ee1 + "px",
            left: _0x1316b4 + "px",
            width: _0x47c18a + "px",
            height: _0x47c373 + "px",
            opacity: "0",
            transform: "scale(0.2) rotate(-30deg)",
            filter: "blur(8px)",
            zIndex: String(12000 - _0x34de90)
          });
          requestAnimationFrame(() => {
            setTimeout(() => {
              applyVideoResultGeometryAnimationStyle(_0x11251f, {
                opacity: "1",
                top: _0x201a9c + "px",
                left: _0x381e4 + "px",
                transform: "scale(1) rotate(0deg)",
                filter: "blur(0px)"
              });
            }, _0x34de90 * 60);
          });
          if (_0x1d2ba2.error) {
            const _0x2feacd = this._createErrorCard(_0x1d2ba2.error);
            _0x11251f.appendChild(_0x2feacd);
          } else {
            const _0x422d2a = document.createElement("video");
            _0x422d2a.className = "ai-video-expanded-result-video";
            _0x422d2a.dataset.idx = String(_0x43f111);
            _0x422d2a.autoplay = false;
            _0x422d2a.loop = false;
            _0x422d2a.muted = true;
            _0x422d2a.playsInline = true;
            const _0x55cf64 = _0x398871[_0x43f111] || "";
            if (_0x55cf64) {
              _0x422d2a.poster = _0x55cf64;
            }
            _0x422d2a.preload = _0x38b23d ? "auto" : "none";
            if (_0x38b23d) {
              _0x422d2a.src = _0x38b23d;
            }
            attachVideoPlaybackRecovery(_0x422d2a, {
              label: "ai-video:" + this.nodeId + ":expanded:" + _0x43f111,
              ensureSrc: () => this._ensureVideoSrcFor(_0x422d2a, {
                forPlayback: true
              }),
              shouldRecover: () => _0x422d2a.isConnected !== false && !_0x422d2a.paused
            });
            _0x11251f.appendChild(_0x422d2a);
          }
          const _0x22e4a1 = _0x3c2cf5 => {
            if (_0x3c2cf5.type === "pointerdown" && _0x3c2cf5.button !== 0) {
              return;
            }
            _0x3c2cf5.preventDefault();
            _0x3c2cf5.stopPropagation();
            _0x54de2b(_0x43f111);
          };
          _0x11251f.addEventListener("pointerdown", _0x22e4a1);
          _0x11251f.addEventListener("click", _0x22e4a1);
          _0x11251f.addEventListener("dblclick", _0xd6adc8 => {
            _0xd6adc8.preventDefault();
            _0xd6adc8.stopPropagation();
          });
          this._expandPanel.appendChild(_0x11251f);
        }
        this._root.appendChild(this._expandPanel);
      } else {
        this._root.classList?.remove?.("is-video-result-expanded");
        if (this._expandPanel && this._expandPanel.parentNode) {
          this._expandPanel.parentNode.removeChild(this._expandPanel);
          this._expandPanel = null;
        }
      }
    }
    hydrateRendererThinVideoPresentation() {
      if (this._rendererThinVideoHydration !== true) {
        return false;
      }
      this._rendererThinVideoHydration = false;
      return this._loadAndDisplayVideo();
    }
    _resolveVideoDataPlaybackUrl(_0x2e6edf) {
      if (!_0x2e6edf) {
        return "";
      }
      return this._resolveMediaUrl(localPathToUrl(_0x2e6edf.displayLocalPath)) || this._resolveMediaUrl(localPathToUrl(_0x2e6edf.localPath)) || this._resolveMediaUrl(_0x2e6edf.videoUrl) || "";
    }
    async _openFullScreenFromVideo(_0x38f532, _0x3a9f91 = null) {
      const _0x160bad = document.createElement("div");
      _0x160bad.className = "ai-video-fullscreen-overlay";
      const _0x498735 = getVideoCurrentSource(_0x3a9f91);
      if (_0x3a9f91 && _0x498735) {
        const _0x5a24ed = _0x3a9f91.parentNode;
        const _0xe32566 = _0x3a9f91.nextSibling;
        const _0x4cf268 = this._isManualControl;
        const _0x569eae = this._hoverManualPause;
        const _0x1ddecc = {
          controls: _0x3a9f91.controls,
          loop: _0x3a9f91.loop,
          muted: _0x3a9f91.muted,
          position: _0x3a9f91.style.position,
          top: _0x3a9f91.style.top,
          left: _0x3a9f91.style.left,
          width: _0x3a9f91.style.width,
          height: _0x3a9f91.style.height,
          maxWidth: _0x3a9f91.style.maxWidth,
          maxHeight: _0x3a9f91.style.maxHeight,
          objectFit: _0x3a9f91.style.objectFit,
          borderRadius: _0x3a9f91.style.borderRadius,
          pointerEvents: _0x3a9f91.style.pointerEvents,
          transform: _0x3a9f91.style.transform,
          opacity: _0x3a9f91.style.opacity,
          zIndex: _0x3a9f91.style.zIndex,
          boxShadow: _0x3a9f91.style.boxShadow
        };
        this._isManualControl = true;
        this._hoverManualPause = false;
        _0x3a9f91.controls = true;
        _0x3a9f91.loop = true;
        _0x3a9f91.muted = !!this._isMuted;
        _0x3a9f91.classList?.add?.("ai-video-fullscreen-source");
        applyVideoResultGeometryAnimationStyle(_0x3a9f91, {
          position: "static",
          top: "",
          left: "",
          width: "auto",
          height: "auto",
          maxWidth: "90%",
          maxHeight: "90%",
          objectFit: "contain",
          borderRadius: "8px",
          pointerEvents: "auto",
          transform: "none",
          opacity: "1",
          zIndex: "",
          boxShadow: "0 0 50px var(--black-95)"
        });
        attachVideoPlaybackRecovery(_0x3a9f91, {
          label: "ai-video:" + this.nodeId + ":fullscreen",
          minBufferAhead: 0.5,
          readyTimeoutMs: 350,
          recoveryDebounceMs: 150,
          recoveryCooldownMs: 500,
          shouldRecover: () => _0x3a9f91.isConnected !== false && !_0x3a9f91.paused
        });
        let _0x511b05 = false;
        const _0x339c21 = () => {
          if (_0x511b05) {
            return;
          }
          _0x511b05 = true;
          try {
            _0x3a9f91.pause();
          } catch {}
          _0x3a9f91.controls = _0x1ddecc.controls;
          _0x3a9f91.loop = _0x1ddecc.loop;
          _0x3a9f91.muted = _0x1ddecc.muted;
          _0x3a9f91.classList?.remove?.("ai-video-fullscreen-source");
          applyVideoResultGeometryAnimationStyle(_0x3a9f91, {
            position: _0x1ddecc.position,
            top: _0x1ddecc.top,
            left: _0x1ddecc.left,
            width: _0x1ddecc.width,
            height: _0x1ddecc.height,
            maxWidth: _0x1ddecc.maxWidth,
            maxHeight: _0x1ddecc.maxHeight,
            objectFit: _0x1ddecc.objectFit,
            borderRadius: _0x1ddecc.borderRadius,
            pointerEvents: _0x1ddecc.pointerEvents,
            transform: _0x1ddecc.transform,
            opacity: _0x1ddecc.opacity,
            zIndex: _0x1ddecc.zIndex,
            boxShadow: _0x1ddecc.boxShadow
          });
          if (_0x5a24ed) {
            _0x5a24ed.insertBefore(_0x3a9f91, _0xe32566);
          }
          _0x160bad.remove();
          this._isManualControl = _0x4cf268;
          this._hoverManualPause = _0x569eae;
          this._attachPreviewVideoRecovery(_0x3a9f91, "preview");
        };
        _0x160bad.addEventListener("click", _0x32285b => {
          if (_0x32285b.target === _0x160bad) {
            _0x339c21();
          }
        });
        _0x160bad.appendChild(_0x3a9f91);
        document.body.appendChild(_0x160bad);
        playVideoWithRecovery(_0x3a9f91, {
          label: "ai-video:" + this.nodeId + ":fullscreen",
          minBufferAhead: 0.5,
          readyTimeoutMs: 350,
          recoveryDebounceMs: 150,
          recoveryCooldownMs: 500,
          shouldRecover: () => _0x3a9f91.isConnected !== false && !_0x3a9f91.paused
        });
        return;
      }
      const _0x6284b = document.createElement("video");
      let _0x108a21 = "";
      const _0x33197b = this._resolveVideoDataPlaybackUrl(_0x38f532);
      const _0x29d235 = String(_0x38f532?.thumbId || "");
      const _0x41e431 = Number(_0x3a9f91?.currentTime || 0);
      const _0x272293 = () => {
        if (!(_0x41e431 > 0)) {
          return;
        }
        const _0x5cc2b5 = Number(_0x6284b.duration);
        const _0x141c18 = Number.isFinite(_0x5cc2b5) && _0x5cc2b5 > 0 ? Math.min(_0x41e431, Math.max(0, _0x5cc2b5 - 0.05)) : _0x41e431;
        try {
          _0x6284b.currentTime = _0x141c18;
        } catch {}
      };
      _0x6284b.addEventListener("loadedmetadata", _0x272293, {
        once: true
      });
      const _0x392a5f = _0x498735 || _0x33197b;
      if (_0x392a5f) {
        await attachMediaElementPlaybackSource(_0x6284b, _0x392a5f, {
          preload: "auto",
          warmRanges: false,
          load: false
        });
      } else if (_0x29d235) {
        _0xb70b0c(_0x29d235).then(_0x492f17 => {
          if (_0x492f17) {
            _0x108a21 = URL.createObjectURL(_0x492f17);
            _0x6284b.src = _0x108a21;
            _0x272293();
            playVideoWithRecovery(_0x6284b, {
              label: "ai-video:" + this.nodeId + ":fullscreen",
              minBufferAhead: 0.5,
              readyTimeoutMs: 350,
              recoveryDebounceMs: 150,
              recoveryCooldownMs: 500,
              shouldRecover: () => _0x6284b.isConnected !== false && !_0x6284b.paused
            });
          }
        });
      }
      attachVideoPlaybackRecovery(_0x6284b, {
        label: "ai-video:" + this.nodeId + ":fullscreen",
        minBufferAhead: 0.5,
        readyTimeoutMs: 350,
        recoveryDebounceMs: 150,
        recoveryCooldownMs: 500,
        shouldRecover: () => _0x6284b.isConnected !== false && !_0x6284b.paused
      });
      _0x6284b.preload = "auto";
      _0x6284b.controls = true;
      _0x6284b.autoplay = true;
      _0x6284b.loop = true;
      _0x6284b.muted = !!this._isMuted;
      _0x6284b.className = "ai-video-fullscreen-video";
      _0x160bad.appendChild(_0x6284b);
      const _0x3f992a = () => {
        try {
          _0x6284b.pause();
        } catch {}
        _0x160bad.remove();
        if (_0x108a21) {
          try {
            URL.revokeObjectURL(_0x108a21);
          } catch {}
          _0x108a21 = "";
        }
      };
      _0x160bad.addEventListener("click", _0x3ef129 => {
        if (_0x3ef129.target === _0x160bad) {
          _0x3f992a();
        }
      });
      document.body.appendChild(_0x160bad);
      if (_0x392a5f) {
        playVideoWithRecovery(_0x6284b, {
          label: "ai-video:" + this.nodeId + ":fullscreen",
          minBufferAhead: 0.5,
          readyTimeoutMs: 350,
          recoveryDebounceMs: 150,
          recoveryCooldownMs: 500,
          shouldRecover: () => _0x6284b.isConnected !== false && !_0x6284b.paused
        });
      }
    }
  }
  return _0x42d1f0.prototype;
}