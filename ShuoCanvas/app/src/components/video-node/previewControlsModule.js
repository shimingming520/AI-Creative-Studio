import { buildVideoFrameCaptureNodeName, captureVideoFrameSnapshot, DEFAULT_VIDEO_FRAME_CAPTURE_FPS, getVideoFrameSource, isVideoFrameReady, resolveVideoFrameCaptureIndex, startVideoFrameSnapshotPersistence, waitForVideoFrame } from "../videoFrameCapture.js";
import { t } from "../../i18n/index.js";
import { buildVideoMutedPatch, readVideoAudioDefaultEnabledFromStore, resolveVideoMutedPreference } from "./videoMuteState.js";
import { isTaskFailed } from "../../core/generationTaskUiState.js";
import { shouldActivateRendererMediaHoverPlayback } from "../../core/rendererDeferredMedia.js";
import { isExternallyOwnedVideoPlayback, setHoverPlaybackChromeVisible, shouldKeepManualPlaybackPresentationActive } from "../shared/hoverVideoPlaybackLifecycle.js";
function previewControlsText(_0x14d8ed, _0x2e541d = {}) {
  return t(_0x14d8ed, _0x2e541d);
}
export function createVideoNodePreviewControlsModule(_0x530360) {
  const {
    store: _0x1bb27e,
    saveOutputBlob: _0xa5c152,
    VideoKeyingController: _0x33ed6f,
    getAutoMediaSizeByShortSide: _0x596fab,
    buildSourceMediaNodePayload: _0x32274f,
    calcSafeSpawnPosNearNode: _0x587443
  } = _0x530360;
  class _0x4afb09 {
    _schedulePreviewHoverPlaybackWhenVideoReady() {
      if (this._previewHoverActivationPending === true) {
        return true;
      }
      if (this.previewEl?.matches?.(":hover") !== true) {
        return false;
      }
      this._previewHoverActivationPending = true;
      this._isHovered = true;
      const _0x134aac = ++this._autoPlayToken;
      const _0x5cffdf = [0, 32, 96, 240, 600, 1200];
      const _0x3ec61f = _0x3033f8 => {
        setTimeout(() => {
          const _0xcfde0b = this.previewEl?.matches?.(":hover") === true;
          if (this._autoPlayToken !== _0x134aac || this._isHovered !== true || this.previewEl?.isConnected === false || !_0xcfde0b) {
            this._previewHoverActivationPending = false;
            return;
          }
          const _0x5ceae3 = this._getActivePreviewVideoEl();
          if (_0x5ceae3) {
            this._previewHoverActivationPending = false;
            this._isHovered = false;
            this.activatePreviewHoverPlayback();
            return;
          }
          if (_0x3033f8 + 1 < _0x5cffdf.length) {
            _0x3ec61f(_0x3033f8 + 1);
          } else {
            this._previewHoverActivationPending = false;
            this._isHovered = false;
          }
        }, _0x5cffdf[_0x3033f8]);
      };
      _0x3ec61f(0);
      return true;
    }
    activatePreviewHoverPlayback() {
      const _0x35c8f8 = typeof _0x1bb27e.getStateRaw === "function" ? _0x1bb27e.getStateRaw() : _0x1bb27e.getState();
      if (!shouldActivateRendererMediaHoverPlayback({
        viewport: _0x35c8f8?.viewport,
        nodeCount: Object.keys(_0x35c8f8?.nodes || {}).length,
        isSelected: _0x35c8f8?.selectedNodeIds?.includes?.(this.nodeId) === true
      })) {
        return false;
      }
      const _0x55aa4d = _0x35c8f8.videoClip;
      if (_0x55aa4d && _0x55aa4d.active && _0x55aa4d.nodeId === this.nodeId) {
        return false;
      }
      const _0x4b26e8 = _0x35c8f8.nodes?.[this.nodeId] || this._data || {};
      if (isTaskFailed(_0x4b26e8)) {
        this._setVideoOverlaysVisible(false);
        return false;
      }
      if (_0x4b26e8.isVideosExpanded) {
        return false;
      }
      this._hoverPlaybackLifecycle?.activate?.();
      const _0x43d0d7 = this._isHovered === true;
      this._isHovered = true;
      if (typeof this.previewEl?.querySelectorAll === "function") {
        this._ensurePreviewVideoOverlays();
      }
      if (this._rendererDetailsDeferred !== true && this._rendererThinVideoHydration === true) {
        this.hydrateRendererThinVideoPresentation?.();
      }
      if (this._rendererMediaDeferred === true) {
        this.hydrateDeferredMedia();
      }
      const _0x5b3e8f = this._getActivePreviewVideoEl();
      if (!_0x5b3e8f) {
        return this._schedulePreviewHoverPlaybackWhenVideoReady();
      }
      this._setVideoOverlaysVisible(true);
      if (_0x43d0d7 && _0x5b3e8f.paused === false) {
        return true;
      }
      const _0x5f17f8 = Number(_0x5b3e8f.duration || 0);
      const _0x4545b8 = Number(_0x5b3e8f.currentTime || 0);
      const _0x27b917 = (_0x5b3e8f.ended === true || Number.isFinite(_0x5f17f8) && _0x5f17f8 > 0 && _0x4545b8 >= Math.max(0, _0x5f17f8 - 0.05)) && this._isPreviewPosterClearedForPlayback?.(_0x5b3e8f) === true;
      if (_0x27b917) {
        try {
          _0x5b3e8f.currentTime = 0;
        } catch {}
      }
      this._previewHoverActivationPending = false;
      this._isHovered = true;
      if (_0x33ed6f.isActiveFor(this.nodeId)) {
        _0x5b3e8f.pause();
        return false;
      }
      if (isExternallyOwnedVideoPlayback(_0x5b3e8f)) {
        return true;
      }
      if (this._hoverManualPause) {
        return false;
      }
      if (this._isManualLoopPlayback) {
        return false;
      }
      _0x5b3e8f.loop = true;
      const _0x50f31a = ++this._autoPlayToken;
      if (typeof this._logPreviewVideoPlaybackEvent === "function") {
        this._logPreviewVideoPlaybackEvent(_0x5b3e8f, "hover-enter", "hover");
      }
      if (typeof this._playPreviewVideoWithRecovery === "function") {
        let _0x509285 = false;
        let _0x24939c = false;
        const _0x1246d6 = () => this._autoPlayToken === _0x50f31a && this._isHovered === true && !this._hoverManualPause && !this._isManualLoopPlayback;
        const _0x34845c = () => {
          if (!_0x1246d6()) {
            return Promise.resolve(false);
          }
          if (_0x24939c || _0x509285) {
            return Promise.resolve(_0x509285);
          }
          _0x24939c = true;
          return Promise.resolve(this._playPreviewVideoWithRecovery(_0x5b3e8f, {
            reason: "hover",
            shouldContinue: _0x1246d6
          })).then(_0x3435b7 => {
            if (_0x3435b7 || !_0x5b3e8f.paused && Number(_0x5b3e8f.currentTime || 0) >= 0) {
              _0x509285 = true;
            }
            _0x24939c = false;
            return _0x3435b7;
          }, _0x57e959 => {
            _0x24939c = false;
            throw _0x57e959;
          });
        };
        const _0x38905f = _0x3e4f61 => {
          setTimeout(() => {
            if (!_0x1246d6()) {
              return;
            }
            if (_0x5b3e8f.isConnected === false || this._getActivePreviewVideoEl() !== _0x5b3e8f) {
              return;
            }
            if (_0x24939c || _0x509285 || _0x5b3e8f.ended === true) {
              return;
            }
            const _0x1957bd = Number(_0x5b3e8f.duration || 0);
            const _0xcdc286 = Number(_0x5b3e8f.currentTime || 0);
            if (Number.isFinite(_0x1957bd) && _0x1957bd > 0 && _0xcdc286 >= Math.max(0, _0x1957bd - 0.05)) {
              return;
            }
            if (_0x5b3e8f.paused || Number(_0x5b3e8f.currentTime || 0) <= 0) {
              _0x34845c();
            }
          }, _0x3e4f61);
        };
        _0x34845c().then(_0x2ecf93 => {
          if (!_0x2ecf93) {
            _0x38905f(0);
          }
        });
        _0x38905f(180);
        _0x38905f(700);
        _0x38905f(1400);
        return true;
      }
      if (typeof this._markPreviewPosterClearedForPlayback === "function") {
        this._markPreviewPosterClearedForPlayback(_0x5b3e8f);
      }
      if (this._autoPlayToken !== _0x50f31a) {
        _0x5b3e8f.pause();
        return false;
      }
      const _0x5a3925 = _0x5b3e8f.play();
      if (_0x5a3925 && typeof _0x5a3925.catch === "function") {
        _0x5a3925.catch(() => {});
      }
      return true;
    }
    _deactivatePreviewHoverPlayback() {
      this._isHovered = false;
      this._previewHoverActivationPending = false;
      const _0x23b058 = this._getActivePreviewVideoEl();
      const _0x39c394 = shouldKeepManualPlaybackPresentationActive(this, _0x23b058);
      if (!_0x39c394) {
        this._autoPlayToken++;
      }
      if (_0x23b058) {
        if (!_0x39c394) {
          _0x23b058.loop = false;
        }
        this._logPreviewVideoPlaybackEvent?.(_0x23b058, "hover-leave", "hover");
        if (!_0x39c394) {
          _0x23b058.pause?.();
        }
      }
      this._hoverManualPause = false;
      if (!_0x39c394 && !this._isManualLoopPlayback) {
        this._isManualControl = false;
      }
      this._setVideoOverlaysVisible(_0x39c394, _0x23b058);
      this._hoverPlaybackLifecycle?.deactivate?.({
        release: false
      });
      return !!_0x23b058;
    }
    _ensurePreviewVideoOverlays() {
      if (!this.previewEl) {
        return;
      }
      this._syncMutedStateFromNodeData(this._data);
      if (!this._muteBtnEl) {
        const _0x17f4bd = document.createElement("div");
        _0x17f4bd.className = "video-mute-btn";
        _0x17f4bd.title = previewControlsText("sourceVideoNode.controls.toggleMute");
        Object.assign(_0x17f4bd.style, {
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--media-control-button-text)",
          cursor: "pointer",
          userSelect: "none"
        });
        const _0x4ebec0 = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        _0x4ebec0.setAttribute("width", "16");
        _0x4ebec0.setAttribute("height", "16");
        _0x4ebec0.setAttribute("viewBox", "0 0 24 24");
        _0x4ebec0.setAttribute("fill", "none");
        _0x4ebec0.setAttribute("stroke", "currentColor");
        _0x4ebec0.setAttribute("stroke-width", "2");
        _0x4ebec0.classList.add("icon-unmuted");
        _0x4ebec0.innerHTML = "<polygon points=\"11 5 6 9 2 9 2 15 6 15 11 19 11 5\"></polygon><path d=\"M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07\"></path>";
        const _0x2a39ea = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        _0x2a39ea.setAttribute("width", "16");
        _0x2a39ea.setAttribute("height", "16");
        _0x2a39ea.setAttribute("viewBox", "0 0 24 24");
        _0x2a39ea.setAttribute("fill", "none");
        _0x2a39ea.setAttribute("stroke", "currentColor");
        _0x2a39ea.setAttribute("stroke-width", "2");
        _0x2a39ea.classList.add("icon-muted");
        _0x2a39ea.innerHTML = "<polygon points=\"11 5 6 9 2 9 2 15 6 15 11 19 11 5\"></polygon><line x1=\"23\" y1=\"1\" x2=\"1\" y2=\"23\"></line><line x1=\"15.54\" y1=\"8.46\" x2=\"19.07\" y2=\"12\"></line>";
        _0x17f4bd.appendChild(_0x4ebec0);
        _0x17f4bd.appendChild(_0x2a39ea);
        _0x17f4bd.addEventListener("pointerdown", _0x15d8af => _0x15d8af.stopPropagation());
        _0x17f4bd.addEventListener("click", _0x5e9956 => {
          _0x5e9956.stopPropagation();
          this._setPreviewMuted(!this._isMuted, {
            persist: true
          });
          this._applyMuteStateToPreviewVideos();
          this._syncMuteBtnIcon();
        });
        this.previewEl.appendChild(_0x17f4bd);
        this._muteBtnEl = _0x17f4bd;
        this._muteIconUnmutedEl = _0x4ebec0;
        this._muteIconMutedEl = _0x2a39ea;
        this._syncMuteBtnIcon?.();
      }
      if (!this._centerIndicatorEl) {
        const _0x2a9cce = document.createElement("div");
        _0x2a9cce.className = "gen-video-center-indicator";
        Object.assign(_0x2a9cce.style, {
          position: "absolute",
          inset: "0",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          pointerEvents: "none",
          zIndex: "11"
        });
        const _0x48b656 = document.createElement("div");
        Object.assign(_0x48b656.style, {
          width: "64px",
          height: "64px",
          borderRadius: "18px",
          background: "var(--media-control-center-bg)",
          border: "1px solid var(--media-control-center-border)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--media-control-button-text)",
          opacity: "0",
          transform: "scale(0.92)",
          transition: "opacity 0.18s ease, transform 0.18s ease"
        });
        _0x2a9cce.appendChild(_0x48b656);
        this.previewEl.appendChild(_0x2a9cce);
        this._centerIndicatorEl = _0x2a9cce;
        this._centerIndicatorInnerEl = _0x48b656;
      }
      if (!this._controlsEl) {
        const _0x357873 = document.createElement("div");
        _0x357873.className = "video-controls";
        Object.assign(_0x357873.style, {
          position: "absolute",
          bottom: "0",
          left: "0",
          width: "100%",
          padding: "16px 16px",
          display: "flex",
          alignItems: "center",
          gap: "12px",
          background: "var(--media-control-overlay-bg)",
          zIndex: "60",
          opacity: "1",
          transition: "opacity 0.2s"
        });
        const _0x497357 = document.createElement("div");
        _0x497357.className = "video-play-btn";
        Object.assign(_0x497357.style, {
          cursor: "pointer",
          color: "var(--media-control-button-text)",
          display: "flex",
          alignItems: "center"
        });
        const _0x446cf4 = document.createElement("span");
        _0x446cf4.className = "video-time-current";
        Object.assign(_0x446cf4.style, {
          color: "var(--media-control-time-text)",
          fontSize: "12px",
          fontVariantNumeric: "tabular-nums"
        });
        _0x446cf4.textContent = "0:00";
        const _0x3fdc44 = document.createElement("div");
        _0x3fdc44.className = "media-progress-bar";
        Object.assign(_0x3fdc44.style, {
          flex: "1",
          height: "4px",
          background: "var(--media-control-progress-track)",
          borderRadius: "2px",
          cursor: "pointer",
          position: "relative"
        });
        const _0x2eede9 = document.createElement("div");
        _0x2eede9.className = "media-progress-fill";
        Object.assign(_0x2eede9.style, {
          width: "0%",
          height: "100%",
          background: "var(--media-control-progress-fill)",
          borderRadius: "2px",
          pointerEvents: "none",
          position: "relative"
        });
        const _0x45adc2 = document.createElement("div");
        _0x45adc2.className = "media-progress-knob";
        Object.assign(_0x45adc2.style, {
          width: "10px",
          height: "10px",
          background: "var(--media-control-progress-fill)",
          borderRadius: "50%",
          position: "absolute",
          right: "-5px",
          top: "-3px",
          boxShadow: "0 0 4px var(--media-control-knob-shadow)"
        });
        _0x2eede9.appendChild(_0x45adc2);
        _0x3fdc44.appendChild(_0x2eede9);
        const _0x2fbe84 = document.createElement("span");
        _0x2fbe84.className = "video-time-total";
        Object.assign(_0x2fbe84.style, {
          color: "var(--media-control-time-text)",
          fontSize: "12px",
          fontVariantNumeric: "tabular-nums"
        });
        _0x2fbe84.textContent = "0:00";
        const _0x2b9b97 = document.createElement("div");
        _0x2b9b97.className = "video-snap-btn";
        _0x2b9b97.title = previewControlsText("sourceVideoNode.controls.captureFrame");
        Object.assign(_0x2b9b97.style, {
          cursor: "pointer",
          color: "var(--media-control-button-text)",
          display: "flex",
          alignItems: "center"
        });
        _0x2b9b97.innerHTML = "<svg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><path d=\"M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z\"></path><circle cx=\"12\" cy=\"13\" r=\"4\"></circle></svg>";
        _0x357873.appendChild(_0x497357);
        _0x357873.appendChild(_0x446cf4);
        _0x357873.appendChild(_0x3fdc44);
        _0x357873.appendChild(_0x2fbe84);
        _0x357873.appendChild(this._muteBtnEl);
        _0x357873.appendChild(_0x2b9b97);
        _0x357873.addEventListener("pointerdown", _0x367274 => _0x367274.stopPropagation());
        _0x357873.addEventListener("click", _0x564ec0 => _0x564ec0.stopPropagation());
        let _0x1981df = false;
        const _0x218d54 = _0x185626 => {
          if (_0x33ed6f.isActiveFor(this.nodeId)) {
            return;
          }
          const _0x2d44c3 = this._getActivePreviewVideoEl();
          if (!_0x2d44c3) {
            return;
          }
          this._toggleVideoPlayPause(_0x2d44c3, {
            loop: _0x185626.altKey === true
          });
          this._syncVideoControlsFromVideo(_0x2d44c3);
        };
        _0x497357.addEventListener("pointerdown", _0x206a72 => {
          _0x206a72.stopPropagation();
          _0x206a72.preventDefault();
          _0x1981df = true;
          _0x218d54(_0x206a72);
        });
        _0x497357.addEventListener("click", _0x3abf9 => {
          _0x3abf9.stopPropagation();
          if (_0x1981df) {
            _0x1981df = false;
            return;
          }
          _0x218d54(_0x3abf9);
        });
        const _0x369d3e = _0x27d01e => {
          if (!this._progressBarEl) {
            return 0;
          }
          const _0x4bbb60 = this._progressBarEl.getBoundingClientRect();
          const _0x4c20a2 = _0x4bbb60.width || 0;
          if (!_0x4c20a2) {
            return 0;
          }
          const _0x3e4921 = _0x27d01e.clientX - _0x4bbb60.left;
          if (!Number.isFinite(_0x3e4921)) {
            return 0;
          }
          return Math.max(0, Math.min(1, _0x3e4921 / _0x4c20a2));
        };
        const _0x8d1425 = _0x441408 => {
          if (this._progressFillEl) {
            this._progressFillEl.style.width = _0x441408 * 100 + "%";
          }
          const _0x1e68b7 = this._getActivePreviewVideoEl();
          const _0x1e6684 = this._getActiveVideoDuration(_0x1e68b7);
          if (this._timeCurrentEl && _0x1e6684 > 0) {
            this._timeCurrentEl.textContent = this._fmtVideoTime(_0x441408 * _0x1e6684);
          }
        };
        const _0x4a6035 = _0x2026ae => {
          const _0x2b2412 = this._getActivePreviewVideoEl();
          this._seekActiveVideoByPos(_0x2b2412, _0x2026ae);
        };
        _0x3fdc44.addEventListener("pointerdown", _0x4b8bb9 => {
          _0x4b8bb9.stopPropagation();
          _0x4b8bb9.preventDefault();
          if (_0x33ed6f.isActiveFor(this.nodeId)) {
            return;
          }
          const _0x12c73e = this._getActivePreviewVideoEl();
          if (!_0x12c73e) {
            return;
          }
          const _0x3a2520 = !!String(_0x12c73e.getAttribute("src") || "").trim();
          this._isManualControl = true;
          this._isManualLoopPlayback = false;
          _0x12c73e.loop = false;
          this._autoPlayToken++;
          this._hoverManualPause = true;
          _0x12c73e.pause();
          if (!_0x3a2520) {
            this._ensureVideoSrcFor(_0x12c73e).then(_0x3bf6f3 => {
              if (!_0x3bf6f3) {
                return;
              }
              const _0x4d4bb8 = _0x369d3e(_0x4b8bb9);
              _0x8d1425(_0x4d4bb8);
              _0x4a6035(_0x4d4bb8);
            });
            return;
          }
          this._isProgressDragging = true;
          const _0x559170 = _0x369d3e(_0x4b8bb9);
          _0x8d1425(_0x559170);
          _0x4a6035(_0x559170);
          const _0x463799 = _0x5768da => {
            const _0x4ea997 = _0x369d3e(_0x5768da);
            _0x8d1425(_0x4ea997);
            _0x4a6035(_0x4ea997);
          };
          const _0x3f4bd4 = _0x3c1237 => {
            _0x3c1237.stopPropagation();
            this._isProgressDragging = false;
            window.removeEventListener("pointermove", _0x463799, true);
            window.removeEventListener("pointerup", _0x3f4bd4, true);
            const _0x372c20 = this._getActivePreviewVideoEl();
            this._syncVideoControlsFromVideo(_0x372c20);
          };
          window.addEventListener("pointermove", _0x463799, true);
          window.addEventListener("pointerup", _0x3f4bd4, true);
        });
        _0x2b9b97.addEventListener("click", _0x35974a => {
          _0x35974a.stopPropagation();
          if (_0x33ed6f.isActiveFor(this.nodeId)) {
            return;
          }
          this._captureCurrentFrameFromActiveVideo();
        });
        this.previewEl.appendChild(_0x357873);
        this._controlsEl = _0x357873;
        this._playBtnEl = _0x497357;
        this._timeCurrentEl = _0x446cf4;
        this._timeTotalEl = _0x2fbe84;
        this._progressBarEl = _0x3fdc44;
        this._progressFillEl = _0x2eede9;
        this._snapBtnEl = _0x2b9b97;
        this._updatePlayIcon(true);
      }
      this._setVideoOverlaysVisible(!this.isNoResult);
    }
    _setVideoOverlaysVisible(_0x54d642, _0x3fca05 = null) {
      const _0x5dc06d = typeof _0x1bb27e.getStateRaw === "function" ? _0x1bb27e.getStateRaw() : _0x1bb27e.getState();
      const _0x2ae5ad = _0x5dc06d?.nodes?.[this.nodeId] || this._data || {};
      const _0x27ae5b = !!_0x2ae5ad.isVideosExpanded;
      const _0x177343 = !!_0x54d642 && !isTaskFailed(_0x2ae5ad) && !_0x27ae5b && (!!this._isHovered || !!this._isManualControl || !!this._isManualLoopPlayback || !!this._isProgressSeeking || !!this._isProgressDragging) && !_0x33ed6f.isActiveFor(this.nodeId);
      setHoverPlaybackChromeVisible({
        controlsEl: this._controlsEl,
        muteEl: this._muteBtnEl
      }, _0x177343);
      const _0x1f49b3 = _0x177343 && (!!this._isManualControl || !!this._isManualLoopPlayback);
      if (this._centerIndicatorEl?.style) {
        this._centerIndicatorEl.style.display = _0x1f49b3 ? "flex" : "none";
      }
      if (!_0x1f49b3) {
        this._hideCenterIndicator?.();
      }
      if (_0x177343) {
        this._syncVideoControlsFromVideo(_0x3fca05 || this._getActivePreviewVideoEl());
      }
    }
    _syncMuteBtnIconImpl() {
      if (!this._muteIconMutedEl || !this._muteIconUnmutedEl) {
        return;
      }
      this._muteIconMutedEl.style.display = this._isMuted ? "" : "none";
      this._muteIconUnmutedEl.style.display = this._isMuted ? "none" : "";
    }
    _syncMutedStateFromNodeData(_0x2eb45b = this._data) {
      this._isMuted = resolveVideoMutedPreference(_0x2eb45b, {
        videoAudioDefaultEnabled: readVideoAudioDefaultEnabledFromStore(_0x1bb27e)
      });
      this._applyMuteStateToPreviewVideos();
      this._syncMuteBtnIcon();
    }
    _setPreviewMuted(_0x310f3d, {
      persist = false
    } = {}) {
      this._isMuted = !!_0x310f3d;
      if (!persist) {
        return;
      }
      const _0x49118b = _0x1bb27e.getState().nodes?.[this.nodeId] || this._data || {};
      const _0x28d551 = buildVideoMutedPatch(_0x49118b, this._isMuted);
      if (!_0x28d551 || typeof _0x1bb27e.updateNodeData !== "function") {
        return;
      }
      _0x1bb27e.updateNodeData(this.nodeId, _0x28d551);
      this._data = {
        ..._0x49118b,
        ..._0x28d551
      };
    }
    _applyMuteStateToPreviewVideos() {
      if (!this.previewEl) {
        return;
      }
      const _0x561ffa = this._data && Number.isFinite(Number(this._data.mainVideoIndex)) ? Number(this._data.mainVideoIndex) : Number.isFinite(Number(this._lastMainIdx)) ? Number(this._lastMainIdx) : 0;
      const _0x396dab = Math.max(0, Math.trunc(_0x561ffa));
      const _0x21ee07 = Array.isArray(this._multiLayerEls) && this._multiLayerEls.length > 0;
      if (_0x21ee07) {
        for (let _0x3fe37a = 0; _0x3fe37a < this._multiLayerEls.length; _0x3fe37a++) {
          const _0x22ef25 = this._multiLayerEls[_0x3fe37a];
          if (!_0x22ef25) {
            continue;
          }
          _0x22ef25.muted = _0x3fe37a === _0x396dab ? !!this._isMuted : true;
        }
        if (this._expandPanel) {
          this._expandPanel.querySelectorAll("video").forEach(_0x221c44 => {
            _0x221c44.muted = true;
          });
        }
        return;
      }
      this.previewEl.querySelectorAll("video").forEach(_0x57a84b => {
        _0x57a84b.muted = !!this._isMuted;
      });
    }
    _setCenterIndicatorIcon(_0x1ca90d) {
      if (!this._centerIndicatorInnerEl) {
        return;
      }
      const _0x34606b = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      _0x34606b.setAttribute("width", "28");
      _0x34606b.setAttribute("height", "28");
      _0x34606b.setAttribute("viewBox", "0 0 24 24");
      _0x34606b.setAttribute("fill", "currentColor");
      _0x34606b.style.color = "var(--canvas-white)";
      if (_0x1ca90d === "play") {
        _0x34606b.innerHTML = "<polygon points=\"6 4 20 12 6 20 6 4\"></polygon>";
      } else {
        _0x34606b.innerHTML = "<rect x=\"6\" y=\"5\" width=\"4\" height=\"14\" rx=\"1\"></rect><rect x=\"14\" y=\"5\" width=\"4\" height=\"14\" rx=\"1\"></rect>";
      }
      this._centerIndicatorInnerEl.innerHTML = "";
      this._centerIndicatorInnerEl.appendChild(_0x34606b);
    }
    _showPausedCenterIndicator() {
      if (!this._centerIndicatorInnerEl) {
        return;
      }
      if (this._centerIndicatorTimer) {
        clearTimeout(this._centerIndicatorTimer);
        this._centerIndicatorTimer = null;
      }
      this._setCenterIndicatorIcon("play");
      this._centerIndicatorInnerEl.style.opacity = "1";
      this._centerIndicatorInnerEl.style.transform = "scale(1)";
    }
    _hideCenterIndicator() {
      if (!this._centerIndicatorInnerEl) {
        return;
      }
      if (this._centerIndicatorTimer) {
        clearTimeout(this._centerIndicatorTimer);
        this._centerIndicatorTimer = null;
      }
      this._centerIndicatorInnerEl.style.opacity = "0";
      this._centerIndicatorInnerEl.style.transform = "scale(0.92)";
    }
    _flashCenterIndicator(_0x497fe0) {
      if (!this._centerIndicatorInnerEl) {
        return;
      }
      if (this._centerIndicatorTimer) {
        clearTimeout(this._centerIndicatorTimer);
        this._centerIndicatorTimer = null;
      }
      this._setCenterIndicatorIcon(_0x497fe0);
      this._centerIndicatorInnerEl.style.opacity = "1";
      this._centerIndicatorInnerEl.style.transform = "scale(1)";
      this._centerIndicatorTimer = setTimeout(() => {
        if (!this._centerIndicatorInnerEl) {
          return;
        }
        if (_0x497fe0 === "pause") {
          this._showPausedCenterIndicator();
        } else {
          this._hideCenterIndicator();
        }
        this._centerIndicatorTimer = null;
      }, 520);
    }
    _getActivePreviewVideoEl() {
      const _0x3e70ae = this._data && Number.isFinite(Number(this._data.mainVideoIndex)) ? Number(this._data.mainVideoIndex) : Number.isFinite(Number(this._lastMainIdx)) ? Number(this._lastMainIdx) : 0;
      const _0x536ff9 = Math.max(0, Math.trunc(_0x3e70ae));
      if (Array.isArray(this._multiLayerEls) && this._multiLayerEls.length > 0) {
        return this._multiLayerEls[_0x536ff9] || this._multiLayerEls[0] || this.videoEl || null;
      }
      return this.videoEl || null;
    }
    _toggleVideoPlayPause(_0x1db9d8, _0x2c406a = {}) {
      if (!_0x1db9d8) {
        return;
      }
      const _0x1e53e8 = _0x2c406a?.loop === true;
      const _0x2a57f9 = this._isHovered === true && this._isManualControl !== true && this._hoverManualPause !== true && _0x1db9d8.paused === false;
      this._isManualControl = true;
      this._hoverPlaybackLifecycle?.activate?.();
      this._setVideoOverlaysVisible(true, _0x1db9d8);
      this._autoPlayToken++;
      const _0x37728f = !!String(_0x1db9d8.getAttribute("src") || "").trim();
      if (_0x1db9d8.paused || _0x2a57f9) {
        this._hoverManualPause = false;
        this._isManualLoopPlayback = _0x1e53e8;
        _0x1db9d8.loop = _0x1e53e8;
        const _0x506cdb = this._autoPlayToken;
        if (typeof this._playPreviewVideoWithRecovery === "function") {
          this._playPreviewVideoWithRecovery(_0x1db9d8, {
            reason: "manual",
            shouldContinue: () => this._isManualControl === true && this._hoverManualPause !== true && this._autoPlayToken === _0x506cdb
          }).then(_0x4648e5 => {
            if (this._autoPlayToken !== _0x506cdb || this._hoverManualPause === true) {
              this._isManualLoopPlayback = false;
              _0x1db9d8.loop = false;
              _0x1db9d8.pause?.();
              return;
            }
            if (!_0x4648e5) {
              this._isManualLoopPlayback = false;
              _0x1db9d8.loop = false;
              return;
            }
            this._flashCenterIndicator("play");
            this._syncVideoControlsFromVideo(_0x1db9d8);
          });
          return;
        }
        if (!_0x37728f) {
          this._ensureVideoSrcFor(_0x1db9d8).then(_0x1ea31e => {
            if (!_0x1ea31e) {
              this._isManualLoopPlayback = false;
              _0x1db9d8.loop = false;
              return;
            }
            const _0xf920d = _0x1db9d8.play();
            if (_0xf920d && typeof _0xf920d.catch === "function") {
              _0xf920d.catch(() => {
                this._isManualLoopPlayback = false;
                _0x1db9d8.loop = false;
              });
            }
            this._flashCenterIndicator("play");
            this._syncVideoControlsFromVideo(_0x1db9d8);
          });
          return;
        }
        const _0x205781 = _0x1db9d8.play();
        if (_0x205781 && typeof _0x205781.catch === "function") {
          _0x205781.catch(() => {
            this._isManualLoopPlayback = false;
            _0x1db9d8.loop = false;
          });
        }
        this._flashCenterIndicator("play");
        this._syncVideoControlsFromVideo(_0x1db9d8);
      } else {
        this._hoverManualPause = true;
        this._isManualLoopPlayback = false;
        _0x1db9d8.loop = false;
        _0x1db9d8.pause();
        this._showPausedCenterIndicator();
        this._syncVideoControlsFromVideo(_0x1db9d8);
      }
    }
    _updatePlayIcon(_0x315985) {
      if (!this._playBtnEl) {
        return;
      }
      this._playBtnEl.replaceChildren();
      const _0x2d285f = "http://www.w3.org/2000/svg";
      const _0x1a4d36 = document.createElementNS(_0x2d285f, "svg");
      _0x1a4d36.setAttribute("width", "16");
      _0x1a4d36.setAttribute("height", "16");
      _0x1a4d36.setAttribute("viewBox", "0 0 24 24");
      _0x1a4d36.setAttribute("fill", "currentColor");
      if (_0x315985) {
        const _0x566732 = document.createElementNS(_0x2d285f, "polygon");
        _0x566732.setAttribute("points", "5 3 19 12 5 21 5 3");
        _0x1a4d36.appendChild(_0x566732);
      } else {
        const _0x543982 = document.createElementNS(_0x2d285f, "rect");
        _0x543982.setAttribute("x", "6");
        _0x543982.setAttribute("y", "4");
        _0x543982.setAttribute("width", "4");
        _0x543982.setAttribute("height", "16");
        const _0x2d09f6 = document.createElementNS(_0x2d285f, "rect");
        _0x2d09f6.setAttribute("x", "14");
        _0x2d09f6.setAttribute("y", "4");
        _0x2d09f6.setAttribute("width", "4");
        _0x2d09f6.setAttribute("height", "16");
        _0x1a4d36.appendChild(_0x543982);
        _0x1a4d36.appendChild(_0x2d09f6);
      }
      this._playBtnEl.appendChild(_0x1a4d36);
    }
    _fmtVideoTime(_0x1459e5) {
      const _0x3bba96 = Number(_0x1459e5);
      if (!Number.isFinite(_0x3bba96) || _0x3bba96 <= 0) {
        return "0:00";
      }
      return Math.floor(_0x3bba96 / 60) + ":" + String(Math.floor(_0x3bba96 % 60)).padStart(2, "0");
    }
    _getActiveVideoDuration(_0x531fc2) {
      if (_0x531fc2) {
        const _0x37710c = Number(_0x531fc2.duration);
        if (Number.isFinite(_0x37710c) && _0x37710c > 0) {
          return _0x37710c;
        }
        const _0x4649e6 = _0x531fc2.seekable;
        if (_0x4649e6 && _0x4649e6.length) {
          const _0x442f75 = Number(_0x4649e6.end(_0x4649e6.length - 1));
          if (Number.isFinite(_0x442f75) && _0x442f75 > 0) {
            return _0x442f75;
          }
        }
      }
      const _0x15a1ed = Number(this._data?.videoDuration);
      if (Number.isFinite(_0x15a1ed) && _0x15a1ed > 0) {
        return _0x15a1ed;
      }
      return 0;
    }
    _requestVideoProgressFrame(_0x646395) {
      const _0x18a9a5 = globalThis.window?.requestAnimationFrame || globalThis.requestAnimationFrame;
      if (typeof _0x18a9a5 === "function") {
        return _0x18a9a5.call(globalThis.window || globalThis, _0x646395);
      }
      return setTimeout(_0x646395, 16);
    }
    _cancelVideoProgressFrame(_0x1c91d1) {
      const _0x1d1c59 = globalThis.window?.cancelAnimationFrame || globalThis.cancelAnimationFrame;
      if (typeof _0x1d1c59 === "function") {
        _0x1d1c59.call(globalThis.window || globalThis, _0x1c91d1);
        return;
      }
      clearTimeout(_0x1c91d1);
    }
    _cancelVideoProgressLoop() {
      if (this._progressRaf) {
        this._cancelVideoProgressFrame(this._progressRaf);
      }
      this._progressRaf = 0;
      this._progressRafVideoEl = null;
    }
    _startVideoProgressLoop(_0x2c6f8e) {
      const _0x3d42f7 = _0x2c6f8e || this._getActivePreviewVideoEl();
      if (!_0x3d42f7 || _0x3d42f7.paused || _0x3d42f7.ended) {
        this._cancelVideoProgressLoop();
        return;
      }
      if (this._progressRaf && this._progressRafVideoEl === _0x3d42f7) {
        return;
      }
      this._cancelVideoProgressLoop();
      this._progressRafVideoEl = _0x3d42f7;
      const _0x51e128 = () => {
        const _0x33a1a8 = this._getActivePreviewVideoEl();
        if (!_0x33a1a8 || _0x33a1a8 !== this._progressRafVideoEl || _0x33a1a8.paused || _0x33a1a8.ended) {
          this._progressRaf = 0;
          this._progressRafVideoEl = null;
          this._syncVideoControlsFromVideo(_0x33a1a8 || null);
          return;
        }
        this._syncVideoControlsFromVideo(_0x33a1a8);
        this._progressRaf = this._requestVideoProgressFrame(_0x51e128);
      };
      this._progressRaf = this._requestVideoProgressFrame(_0x51e128);
    }
    _syncVideoControlsFromVideo(_0x18bcd7) {
      if (!this._controlsEl || !this._playBtnEl || !this._progressFillEl) {
        return;
      }
      const _0xca4ecc = _0x18bcd7 || this._getActivePreviewVideoEl();
      if (!_0xca4ecc) {
        this._cancelVideoProgressLoop();
        this._updatePlayIcon(true);
        this._progressFillEl.style.width = "0%";
        if (this._timeCurrentEl) {
          this._timeCurrentEl.textContent = "0:00";
        }
        if (this._timeTotalEl) {
          this._timeTotalEl.textContent = "0:00";
        }
        return;
      }
      const _0x24cbd4 = this._getActiveVideoDuration(_0xca4ecc);
      const _0x243eea = Math.max(0, Number(_0xca4ecc.currentTime) || 0);
      const _0xf65259 = _0x24cbd4 > 0 ? Math.max(0, Math.min(1, _0x243eea / _0x24cbd4)) : 0;
      if (!this._isProgressDragging && !this._isProgressSeeking) {
        this._progressFillEl.style.width = _0xf65259 * 100 + "%";
        if (this._timeCurrentEl) {
          const _0x49b4a1 = this._fmtVideoTime(_0x243eea);
          if (this._timeCurrentEl.textContent !== _0x49b4a1) {
            this._timeCurrentEl.textContent = _0x49b4a1;
          }
        }
      }
      if (this._timeTotalEl) {
        const _0x25c13b = this._fmtVideoTime(_0x24cbd4);
        if (this._timeTotalEl.textContent !== _0x25c13b) {
          this._timeTotalEl.textContent = _0x25c13b;
        }
      }
      this._updatePlayIcon(!!_0xca4ecc.paused);
      if (_0xca4ecc.paused || _0xca4ecc.ended) {
        this._showPausedCenterIndicator();
        this._cancelVideoProgressLoop();
      } else {
        this._hideCenterIndicator();
        this._startVideoProgressLoop(_0xca4ecc);
      }
    }
    _seekActiveVideoByPos(_0x304f85, _0x111cf0) {
      const _0x2bf81a = _0x304f85 || this._getActivePreviewVideoEl();
      if (!_0x2bf81a) {
        return;
      }
      const _0x8059c8 = this._getActiveVideoDuration(_0x2bf81a);
      if (!Number.isFinite(_0x8059c8) || _0x8059c8 <= 0) {
        return;
      }
      const _0x883b28 = Math.max(0, Math.min(1, Number(_0x111cf0) || 0));
      const _0x3482ff = _0x883b28 * _0x8059c8;
      this._isProgressSeeking = true;
      const _0x3df9bb = ++this._progressSeekToken;
      _0x2bf81a.currentTime = _0x3482ff;
      if (this._progressFillEl) {
        this._progressFillEl.style.width = _0x883b28 * 100 + "%";
      }
      if (this._timeCurrentEl) {
        this._timeCurrentEl.textContent = this._fmtVideoTime(_0x3482ff);
      }
      queueMicrotask(() => {
        if (_0x3df9bb !== this._progressSeekToken) {
          return;
        }
        this._isProgressSeeking = false;
        this._syncVideoControlsFromVideo(_0x2bf81a);
      });
    }
    async _captureCurrentFrameFromActiveVideo() {
      const _0x20423f = this._getActivePreviewVideoEl();
      if (!_0x20423f) {
        return;
      }
      if (!getVideoFrameSource(_0x20423f)) {
        const _0x2c55d8 = await this._ensureVideoSrcFor(_0x20423f);
        if (!_0x2c55d8) {
          window.showToast?.(previewControlsText("videoFrameExtraction.videoNotLoaded"), "info");
          return;
        }
      }
      if (!isVideoFrameReady(_0x20423f)) {
        const _0x4f5645 = await waitForVideoFrame(_0x20423f);
        if (!_0x4f5645) {
          window.showToast?.(previewControlsText("videoFrameExtraction.videoNotLoaded"), "info");
          return;
        }
      }
      const _0xc1dd2 = _0x20423f.videoWidth || 0;
      const _0x44c973 = _0x20423f.videoHeight || 0;
      if (!_0xc1dd2 || !_0x44c973) {
        return;
      }
      let _0x54e35e = null;
      try {
        _0x54e35e = await captureVideoFrameSnapshot(_0x20423f, {
          fileNamePrefix: "ai_video_frame"
        });
      } catch (_0x5b835a) {
        console.warn("[AIGenVideoNode] capture frame failed:", _0x5b835a);
        window.showToast?.(previewControlsText("videoFrameExtraction.captureUnsupported"), "error");
        return;
      }
      if (!_0x54e35e?.blob) {
        return;
      }
      const _0x4211bc = _0x1bb27e.getState().nodes[this.nodeId];
      if (!_0x4211bc) {
        return;
      }
      const _0x3e553c = Array.isArray(_0x4211bc.videos) && _0x4211bc.videos[Math.max(0, Number(_0x4211bc.mainVideoIndex) || 0)] || (Array.isArray(_0x4211bc.videos) ? _0x4211bc.videos[0] : null) || _0x4211bc;
      const _0x24d1b7 = typeof this._resolveVideoMetaSrcFromVideoData === "function" ? this._resolveVideoMetaSrcFromVideoData(_0x3e553c) : "";
      const {
        frameIndex: _0x5e4c8c,
        nextSnapSeq: _0x2f5bb2
      } = resolveVideoFrameCaptureIndex(_0x4211bc, {
        currentTimeSec: Number(_0x20423f.currentTime) || 0,
        fallbackDurationSec: this._getActiveVideoDuration(_0x20423f),
        fallbackFrameRate: DEFAULT_VIDEO_FRAME_CAPTURE_FPS
      });
      if (_0x2f5bb2) {
        _0x1bb27e.updateNodeData(this.nodeId, {
          snapSeq: _0x2f5bb2
        });
      }
      if (_0x24d1b7 && typeof this._maybeFetchVideoMeta === "function") {
        this._maybeFetchVideoMeta(_0x24d1b7);
      }
      const _0x1bcc1a = _0x596fab(_0xc1dd2, _0x44c973);
      const _0x59e466 = _0x587443(_0x1bb27e.getState().nodes, _0x4211bc, _0x1bcc1a.width, _0x1bcc1a.height);
      const _0x25ced8 = "src-img-" + Date.now();
      const _0x49b138 = previewControlsText("videoFrameExtraction.capturedFrameName", {
        frameIndex: _0x5e4c8c
      });
      const _0x558759 = buildVideoFrameCaptureNodeName(_0x4211bc, {
        frameIndex: _0x5e4c8c,
        fallbackName: _0x49b138,
        formatSourceFrameName: _0x55ac9e => previewControlsText("videoFrameExtraction.capturedFrameNameWithSource", _0x55ac9e)
      });
      const {
        savePromise: _0x4d05c7
      } = startVideoFrameSnapshotPersistence(_0x54e35e, _0xa5c152, {
        onPreview: ({
          previewUrl: _0x1f3a46
        }) => {
          _0x1bb27e.addNode(_0x32274f({
            id: _0x25ced8,
            type: "source-image",
            name: _0x558759,
            capturePreviewUrl: _0x1f3a46,
            captureSavePending: true,
            captureSaveError: null,
            originalWidth: _0x54e35e.originalWidth,
            originalHeight: _0x54e35e.originalHeight,
            fileName: _0x54e35e.fileName,
            x: _0x59e466.x,
            y: _0x59e466.y,
            width: _0x1bcc1a.width,
            height: _0x1bcc1a.height,
            needsAutoResize: false
          }));
        }
      });
      _0x4d05c7.then(_0x3ef459 => {
        if (!_0x1bb27e.getStateRaw().nodes?.[_0x25ced8]) {
          return;
        }
        _0x1bb27e.updateNodeData(_0x25ced8, {
          src: _0x3ef459.src,
          localPath: _0x3ef459.localPath,
          originalLocalPath: _0x3ef459.originalLocalPath,
          displayLocalPath: _0x3ef459.displayLocalPath,
          thumbLocalPath: _0x3ef459.thumbLocalPath,
          originalWidth: _0x3ef459.originalWidth,
          originalHeight: _0x3ef459.originalHeight,
          fileName: _0x3ef459.fileName,
          captureSavePending: false,
          captureSaveError: null
        });
      }).catch(_0x1a878c => {
        const _0x42429a = String(_0x1a878c?.message || previewControlsText("videoFrameExtraction.localSaveFailed"));
        console.warn("[AIGenVideoNode] save captured frame failed:", _0x1a878c);
        if (_0x1bb27e.getStateRaw().nodes?.[_0x25ced8]) {
          _0x1bb27e.updateNodeData(_0x25ced8, {
            captureSavePending: false,
            captureSaveError: _0x42429a
          });
        }
        window.showToast?.(previewControlsText("videoFrameExtraction.shownButSaveFailed"), "warning");
      });
    }
  }
  return _0x4afb09.prototype;
}