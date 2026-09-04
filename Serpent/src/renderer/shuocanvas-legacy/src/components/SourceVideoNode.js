import a521_0x473f31 from "../core/stores/appStore.js";
import { onLocaleChange, t } from "../i18n/index.js";
import { resumeAsyncVideoTask, resumeRunningHubVideoTask } from "../../api/aiVideoApi.js";
import { ensureConfig, getProviderConfig } from "../../api/configApi.js";
import { fetchVideoMetaFromServer } from "../../api/videoMetaApi.js";
import { desktopBridge } from "../services/desktopBridge.js";
import { fetchVideoFirstFrameThumbFromServer } from "../../api/videoThumbApi.js";
import { fetchRemoteBlob, saveOutputFromUrlToServer, saveOutputToServer } from "../../api/projectsV2Api.js";
import { resumeRunninghubWorkflowTask } from "../../api/runninghubWorkflowApi.js";
import { discardLocalStagedAsset, importLocalStagedAsset, uploadFile } from "../modules/project.js";
import { startLoading, stopLoading } from "../modules/loadingOverlay.js";
import a521_0x1e173c from "../modules/VideoKeyingController.js";
import { commit } from "../modules/history.js";
import { startNodeResizePreview } from "../modules/interaction/nodeResizePreview.js";
import { VIDEO_TOOLBAR_HTML, bindVideoToolbarEvents } from "./NodeToolbarConfig.js";
import { registerStaticInnerHTML, setStaticInnerHTML } from "../utils/dom.js";
import { CANVAS_VIDEO_IMPORT_MAX_BYTES, CANVAS_VIDEO_IMPORT_MAX_MB, buildSourceMediaNodePayload, getAutoMediaSizeByShortSide } from "../services/fileService.js";
import { buildCanvasVideoProxyPromotionPatch, buildCanvasLocalVideoFields, resolveCanvasVideoUrl } from "../services/canvasMediaLocalService.js";
import { requestVisibleVideoProxyMigration } from "../services/mediaTaskService.js";
import { isTaskTerminal, shouldShowGenerationResultLoadingUi } from "../core/generationTaskUiState.js";
import { resumeTask } from "../core/generationTaskRuntime.js";
import { extractCurrentVideoFrameToImageNode } from "../modules/videoFrameExtraction.js";
import { attachVideoPlaybackRecovery, getVideoCurrentSource, logVideoPlaybackEvent, playVideoWithRecovery } from "./video-node/mediaPlaybackRecovery.js";
import { attachMediaElementPlaybackSource, clearDesktopMediaPlaybackSourceMetadata, isMediaElementPlaybackSource } from "../services/desktopMediaBlobSource.js";
import { localPathToUrl, pickResultLocalPath, urlToLocalPath } from "../utils/localMediaPath.js";
import { getVideoSourceKey } from "../modules/modelInputPolicy.js";
import { buildVideoMutedPatch, readVideoAudioDefaultEnabledFromStore, resolveVideoMutedPreference } from "./video-node/videoMuteState.js";
import { createHoverVideoPlaybackLifecycle, isExternallyOwnedVideoPlayback } from "./shared/hoverVideoPlaybackLifecycle.js";
import { deactivateSourceVideoHoverPlayback, releaseIdleSourceVideoHoverPlaybackMedia, shouldActivateSourceVideoHoverPlayback, syncSourceVideoPlaybackChromeVisibility } from "./source-video/sourceVideoHoverPlayback.js";
import { isCanvasImagePreloadRecentlyResolved, preloadCanvasImage } from "../modules/canvasMediaScheduler.js";
import { shouldDeferRendererDetailsOnMount, shouldDeferRendererMediaOnMount, shouldPrebuildRendererRuntimeOffscreen } from "../core/rendererDeferredMedia.js";
import { hasPresentedVideoFrame, resetVideoFramePresentation, watchVideoFramePresentation } from "../services/videoFramePresentation.js";
import { hasReportedSourceVideoMediaSlotFrame, reportSourceVideoMediaSlotFrameOnce, scheduleSourceVideoFramePresentationCommit } from "./video-node/sourceVideoFramePresentationBatch.js";
import { acquireLocalVideoPlaybackObjectUrlResult, releaseLocalVideoPlaybackObjectUrlOwner } from "../services/localVideoPlaybackObjectUrlService.js";
import { revokeTrackedMediaObjectUrl } from "../services/mediaObjectUrlRegistry.js";
import { createVideoNodeUpdatePerf } from "./video-node/videoNodeUpdatePerf.js";
import { createVideoGenerationErrorCard } from "./video-node/videoGenerationErrorCard.js";
import { openSourceVideoFullscreenPreview } from "./video-node/sourceVideoFullscreenPreview.js";
import { hasSourceVideoRecoveryWork, isClientFetchableMediaUrl, isDesktopRenderer, isSourceVideoInteractionBusy, scheduleSourceVideoIdleTask, shouldFetchVideoMetaForNodeInfo, sourceVideoText } from "./source-video/sourceVideoRuntime.js";
import { buildSourceVideoUploadSizePatch, createVideoCapturePreviewUrl, readVideoFileNaturalSize, waitForNextPaint } from "./source-video/sourceVideoUploadMedia.js";
import { buildRunningHubVideoTerminalStatePatch, buildSourceVideoRecoveryFailurePatch, getVideoMattingModelId, isRunningHubVideoTask, resolveRunningHubVideoStatusName, resolveSourceVideoGenerationFailureMessage } from "./source-video/sourceVideoTaskState.js";
import { resolveSourceVideoMediaTaskSrc, resolveSourceVideoPosterSrc } from "./source-video/sourceVideoMediaState.js";
export { buildSourceVideoUploadSizePatch, resolveSourceVideoGenerationFailureMessage, resolveSourceVideoMediaTaskSrc, resolveSourceVideoPosterSrc };
const SOURCE_VIDEO_MIN_SIZE = 150;
const SOURCE_VIDEO_POSTER_PRELOAD = "metadata";
const SOURCE_VIDEO_POSTER_PRELOAD_PRIORITY = 55;
const SOURCE_VIDEO_RENDER_PIN_REASON = "source-video:playback";
const SOURCE_VIDEO_LOCAL_BLOB_MAX_BYTES = 33554432;
const SOURCE_VIDEO_LOCAL_BLOB_FETCH_TIMEOUT_MS = 900;
const SOURCE_VIDEO_CANONICAL_IMPORT_RETRY_MS = 10000;
const _SOURCE_VIDEO_NODE_TEMPLATE_ID = "node:source-video";
registerStaticInnerHTML(_SOURCE_VIDEO_NODE_TEMPLATE_ID, VIDEO_TOOLBAR_HTML + "\n        <div class=\"node-card media-card video-card\" style=\"width: 100%; height: 100%; padding: 0; background: var(--white-05); border: 1px solid var(--video-node-surface-border-color, var(--stroke-08)); border-radius: 18px; overflow: hidden; position: relative; display: flex; align-items: stretch; pointer-events: auto; cursor: var(--link-cursor);\">\n        <img class=\"source-video-poster-frame\" alt=\"\" draggable=\"false\">\n\n        <div class=\"video-center-indicator\">\n          <div class=\"indicator-inner\">\n          </div>\n        </div>\n\n        <div class=\"node-upload-hint source-upload-hint\">\n          <button type=\"button\" class=\"upload-btn source-upload-btn\">\n            <svg width=\"14\" height=\"14\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.5\"><path d=\"M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4\"/><polyline points=\"17 8 12 3 7 8\"/><line x1=\"12\" y1=\"3\" x2=\"12\" y2=\"15\"/></svg>\n            <span class=\"source-upload-label\"></span>\n          </button>\n        </div>\n\n        <div class=\"video-controls\">\n          <div class=\"video-play-btn\">\n            <svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"currentColor\"><polygon points=\"5 3 19 12 5 21 5 3\"/></svg>\n          </div>\n          <span class=\"video-time-current\">0:00</span>\n          <div class=\"media-progress-bar\">\n             <div class=\"media-progress-fill\">\n                <div class=\"media-progress-knob\"></div>\n             </div>\n          </div>\n          <span class=\"video-time-total\">0:00</span>\n          <div class=\"video-mute-btn\">\n            <svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" class=\"icon-unmuted\" style=\"display:none;\"><polygon points=\"11 5 6 9 2 9 2 15 6 15 11 19 11 5\"></polygon><path d=\"M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07\"></path></svg>\n            <svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" class=\"icon-muted\"><polygon points=\"11 5 6 9 2 9 2 15 6 15 11 19 11 5\"></polygon><line x1=\"23\" y1=\"1\" x2=\"1\" y2=\"23\"></line><line x1=\"15.54\" y1=\"8.46\" x2=\"19.07\" y2=\"12\"></line></svg>\n          </div>\n          <div class=\"video-snap-btn\">\n            <svg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><path d=\"M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z\"></path><circle cx=\"12\" cy=\"13\" r=\"4\"></circle></svg>\n          </div>\n        </div>\n        <div class=\"node-port out-port\"></div>\n        <div class=\"node-resizer\"></div>\n      </div>");
export class SourceVideoNode {
  constructor(_0x713a25) {
    this._data = _0x713a25;
    this.el = document.createElement("div");
    this.id = _0x713a25.id;
    this.el.className = "v2-node-component source-video-node-component";
    this._currentSrc = null;
    this._rendererMediaSlotToken = null;
    this._objUrl = null;
    this._objUrlSource = "";
    this._playbackBlobFetchController = null;
    this._playbackSourcePromise = null;
    this._playbackSourcePromiseSource = "";
    this._playbackSourceToken = 0;
    this._pendingPlaybackSource = "";
    this._hasPendingPlaybackSource = false;
    this._playbackResumeGeneration = 0;
    this._pendingPlaybackResume = null;
    this._isMuted = resolveVideoMutedPreference(_0x713a25, {
      videoAudioDefaultEnabled: readVideoAudioDefaultEnabledFromStore(a521_0x473f31)
    });
    this._isManualControl = false;
    this._isHovered = false;
    this._hoverManualPause = false;
    this._isManualLoopPlayback = false;
    this._autoPlayToken = 0;
    this._seekToken = 0;
    this._isSeeking = false;
    this._clickTimer = null;
    this._clip = null;
    this._metaFetchToken = 0;
    this._canonicalAssetImportRetryTimer = null;
    this._canonicalAssetImportSource = "";
    this._canonicalAssetImportPromise = null;
    this._canonicalAssetImportRetryGeneration = 0;
    this._canonicalAssetImportDisposed = false;
    this._canonicalAssetImportFailedAt = 0;
    this._thumbFetchToken = 0;
    this._activeCapturePreviewUrl = "";
    this._lastPosterSrc = "";
    this._rhResumeAbortController = null;
    this._rhResumeTaskId = "";
    this._rhResumePromise = null;
    this._asyncResumeAbortController = null;
    this._asyncResumeTaskId = "";
    this._asyncResumePromise = null;
    this._idleVideoThumbCancel = null;
    this._deferredVideoMetaCancel = null;
    this._isUploading = false;
    this._unsubscribeLocale = null;
    this._rendererMediaDeferred = shouldDeferRendererMediaOnMount(_0x713a25);
    this._rendererDetailsDeferred = shouldDeferRendererDetailsOnMount(_0x713a25);
    this._rendererRuntimePrebuiltOffscreen = shouldPrebuildRendererRuntimeOffscreen(_0x713a25);
    this._videoEventsBound = false;
    this._progressRaf = 0;
    this._toolbarEl = null;
    this._videoToolbarBound = false;
    this._removeDeferredToolbarActivator = null;
    this._videoInteractionBound = false;
    this._removeDeferredInteractionActivator = null;
    this._rendererEagerVideoPreview = false;
    this._rendererPlaybackPinned = false;
    this._hoverPlaybackLifecycle = createHoverVideoPlaybackLifecycle({
      releaseMedia: () => this._releaseIdleHoverPlaybackMedia()
    });
  }
  _ensureVideoToolbarBound() {
    if (this._videoToolbarBound === true) {
      return;
    }
    const _0x34b33d = this._toolbarEl || this.el?.querySelector?.(".node-floating-toolbar") || null;
    if (!_0x34b33d) {
      return;
    }
    this._removeDeferredToolbarActivator?.();
    this._removeDeferredToolbarActivator = null;
    bindVideoToolbarEvents(_0x34b33d, this._data);
    this._toolbarEl = _0x34b33d;
    this._videoToolbarBound = true;
  }
  _armDeferredVideoToolbarBinding() {
    if (!this._toolbarEl || this._removeDeferredToolbarActivator) {
      return;
    }
    const _0x58e6d1 = _0x338f4f => {
      _0x338f4f?.stopPropagation?.();
      this._ensureVideoToolbarBound();
    };
    const _0x59c473 = () => {
      this._ensureVideoToolbarBound();
    };
    this._toolbarEl.addEventListener?.("pointerdown", _0x58e6d1, true);
    this._toolbarEl.addEventListener?.("focusin", _0x59c473, true);
    this._removeDeferredToolbarActivator = () => {
      this._toolbarEl?.removeEventListener?.("pointerdown", _0x58e6d1, true);
      this._toolbarEl?.removeEventListener?.("focusin", _0x59c473, true);
    };
  }
  _ensureVideoInputElement() {
    if (this._input) {
      return this._input;
    }
    if (!this.el || typeof document?.createElement !== "function") {
      return null;
    }
    const _0x4f745e = document.createElement("input");
    _0x4f745e.type = "file";
    _0x4f745e.accept = "video/*";
    _0x4f745e.style.display = "none";
    this.el.appendChild(_0x4f745e);
    this._input = _0x4f745e;
    return _0x4f745e;
  }
  _armDeferredVideoInteractionBinding() {
    if (!this.el || this._removeDeferredInteractionActivator || this._videoInteractionBound) {
      return;
    }
    const _0x535964 = () => {
      this._bindVideoInteractionHandlers();
    };
    const _0x49d5dc = () => {
      if (!shouldActivateSourceVideoHoverPlayback(a521_0x473f31, this.id)) {
        return;
      }
      this.hydrateDeferredMedia();
      this._activateHoverPlayback();
    };
    this.el.addEventListener?.("pointerdown", _0x535964, true);
    this.el.addEventListener?.("focusin", _0x535964, true);
    this.el.addEventListener?.("mouseenter", _0x49d5dc, true);
    this._removeDeferredInteractionActivator = () => {
      this.el?.removeEventListener?.("pointerdown", _0x535964, true);
      this.el?.removeEventListener?.("focusin", _0x535964, true);
      this.el?.removeEventListener?.("mouseenter", _0x49d5dc, true);
    };
  }
  _bindVideoInteractionHandlers() {
    if (this._videoInteractionBound === true) {
      return;
    }
    if (!this.el || typeof this._card?.addEventListener !== "function") {
      return;
    }
    this._videoInteractionBound = true;
    this._removeDeferredInteractionActivator?.();
    this._removeDeferredInteractionActivator = null;
    this._card.addEventListener("dblclick", _0x2f04f8 => {
      _0x2f04f8.stopPropagation();
      if (this._clickTimer) {
        clearTimeout(this._clickTimer);
        this._clickTimer = null;
      }
      const _0x57f10d = this._currentSrc || this._resolveVideoSrc(this._data) || this._video?.dataset?.desktopMediaSourceUrl || (this._video ? getVideoCurrentSource(this._video) : "");
      if (_0x57f10d) {
        this._openFullscreenFromCurrentVideo();
      }
    });
    this._card.addEventListener("click", _0x4196c2 => {
      if (_0x4196c2.detail && _0x4196c2.detail > 1) {
        return;
      }
      if (_0x4196c2.target.closest(".video-controls") || _0x4196c2.target.closest(".video-mute-btn") || _0x4196c2.target.closest(".node-upload-hint") || _0x4196c2.target.closest(".node-floating-toolbar")) {
        return;
      }
      _0x4196c2.stopPropagation();
      if (this._clickTimer) {
        clearTimeout(this._clickTimer);
      }
      this._clickTimer = setTimeout(() => {
        this._clickTimer = null;
        if (!this._currentSrc) {
          return;
        }
        this._toggleManualPlayback({
          forcePlay: this._shouldKeepHoverPlaybackOnManualClick()
        });
      }, 180);
    });
    const _0x23d113 = this._ensureVideoInputElement();
    this._uploadBtn?.addEventListener?.("click", _0xd2ad22 => {
      _0xd2ad22.stopPropagation();
      _0x23d113?.click?.();
    });
    if (this._resizer) {
      this._resizer.addEventListener("pointerdown", _0x2a0827 => {
        const _0x1d1b88 = a521_0x473f31.getStateRaw().ui?.imageVideoNodeResizeEnabled === true;
        const _0x1ef37d = document.getElementById("v2-wrap")?.classList.contains("v2-media-node-resize-enabled");
        if (!_0x1d1b88 || !_0x1ef37d) {
          return;
        }
        startNodeResizePreview({
          event: _0x2a0827,
          nodeId: this.id,
          getNode: () => a521_0x473f31.getStateRaw().nodes?.[this.id] || this._data,
          getViewport: () => a521_0x473f31.getStateRaw().viewport,
          resolveSize: ({
            startWidth: _0x378cfd,
            startHeight: _0x405728,
            dx: _0x1e517d,
            dy: _0x50db45
          }) => {
            const _0x1b469d = _0x378cfd / _0x405728;
            const _0x23d58 = Math.max(_0x1e517d / _0x378cfd, _0x50db45 / _0x405728);
            const _0x5d542f = Math.max(SOURCE_VIDEO_MIN_SIZE / _0x378cfd, SOURCE_VIDEO_MIN_SIZE / _0x405728);
            const _0x9de5ee = Math.max(_0x5d542f, 1 + _0x23d58);
            const _0x48aef2 = Math.max(SOURCE_VIDEO_MIN_SIZE, Math.round(_0x378cfd * _0x9de5ee));
            const _0x17888f = Math.max(SOURCE_VIDEO_MIN_SIZE, Math.round(_0x48aef2 / _0x1b469d));
            return {
              width: _0x48aef2,
              height: _0x17888f
            };
          },
          buildFinalPatch: ({
            startNode: _0x1b3a90
          }) => _0x1b3a90?.needsAutoResize ? {
            needsAutoResize: false
          } : {},
          applyPatch: _0x2fcbaa => a521_0x473f31.updateNodeData(this.id, _0x2fcbaa),
          commit: commit
        });
      });
    }
    _0x23d113?.addEventListener?.("change", async _0x12141d => {
      const _0x4b6024 = _0x12141d.target.files[0];
      if (!_0x4b6024) {
        return;
      }
      await this._handleUploadInputFile(_0x4b6024);
    });
    this._muteBtn?.addEventListener?.("click", _0x15fa40 => {
      _0x15fa40.stopPropagation();
      if (a521_0x1e173c.isActiveFor(this._data?.id)) {
        return;
      }
      this._setMuted(!this._isMuted, {
        persist: true
      });
    });
    this._playBtn?.addEventListener?.("click", _0x422cd9 => {
      _0x422cd9.stopPropagation();
      if (a521_0x1e173c.isActiveFor(this._data?.id)) {
        return;
      }
      if (!this._currentSrc) {
        return;
      }
      this._toggleManualPlayback({
        loop: _0x422cd9.altKey === true,
        forcePlay: this._shouldKeepHoverPlaybackOnManualClick()
      });
    });
    if (this._bar) {
      let _0x3a6920 = false;
      let _0x523e89 = 0;
      this._updateDragVisual = _0x28dbbb => {
        if (this._fill) {
          this._fill.style.width = _0x28dbbb * 100 + "%";
        }
        if (!this._timeCurrent) {
          return;
        }
        const _0x2ec0b = this._getBaseDuration();
        const _0x4d9b2f = this._getClipRange(_0x2ec0b);
        const _0x249990 = _0x4d9b2f.active ? Math.max(0, _0x4d9b2f.end - _0x4d9b2f.start) : _0x2ec0b;
        if (_0x249990 && Number.isFinite(_0x249990)) {
          this._timeCurrent.textContent = this._fmt(_0x28dbbb * _0x249990);
        }
      };
      const _0x468d76 = _0x2df727 => {
        const _0x2e7fb4 = this._bar;
        if (!_0x2e7fb4) {
          return 0;
        }
        const _0x2e6bab = _0x2e7fb4.getBoundingClientRect();
        const _0x731863 = _0x2e6bab.width || 0;
        if (!_0x731863) {
          return 0;
        }
        const _0x51e313 = _0x2df727.clientX - _0x2e6bab.left;
        if (!Number.isFinite(_0x51e313)) {
          return 0;
        }
        return Math.max(0, Math.min(1, _0x51e313 / _0x731863));
      };
      const _0x2e283b = _0x21a40d => {
        if (!Number.isFinite(_0x21a40d)) {
          return;
        }
        const _0x514de6 = this._getBaseDuration();
        if (!_0x514de6 || !Number.isFinite(_0x514de6)) {
          return;
        }
        const _0x45652c = this._getClipRange(_0x514de6);
        const _0x3749a5 = _0x45652c.active ? Math.max(0, _0x45652c.end - _0x45652c.start) : _0x514de6;
        if (!_0x3749a5 || !Number.isFinite(_0x3749a5)) {
          return;
        }
        const _0x1fb046 = Math.max(0, Math.min(_0x514de6, (_0x45652c.active ? _0x45652c.start : 0) + _0x21a40d * _0x3749a5));
        if (!Number.isFinite(_0x1fb046)) {
          return;
        }
        const _0x517e81 = this._ensureVideoElement();
        if (!_0x517e81) {
          return;
        }
        this._isSeeking = true;
        const _0xd65d4e = ++this._seekToken;
        _0x517e81.currentTime = _0x1fb046;
        const _0x3134a3 = () => {
          if (_0xd65d4e !== this._seekToken) {
            return;
          }
          this._isSeeking = false;
          const _0x261f15 = this._getBaseDuration();
          const _0x1368c0 = this._getClipRange(_0x261f15);
          const _0x528b4a = _0x1368c0.active ? Math.max(0, _0x1368c0.end - _0x1368c0.start) : _0x261f15;
          const _0x5d0306 = _0x517e81.currentTime || 0;
          if (_0x528b4a && Number.isFinite(_0x528b4a)) {
            const _0x2e7a1 = _0x1368c0.active ? Math.max(0, Math.min(_0x528b4a, _0x5d0306 - _0x1368c0.start)) : _0x5d0306;
            this._fill.style.width = _0x2e7a1 / _0x528b4a * 100 + "%";
            this._timeCurrent.textContent = this._fmt(_0x2e7a1);
            this._timeTotal.textContent = this._fmt(_0x528b4a);
          }
        };
        _0x517e81.addEventListener("seeked", _0x3134a3, {
          once: true
        });
        window.setTimeout(_0x3134a3, 300);
      };
      const _0x42cce7 = _0x517a35 => {
        if (!_0x3a6920) {
          return;
        }
        _0x517a35.stopPropagation();
        _0x517a35.preventDefault();
        _0x523e89 = _0x468d76(_0x517a35);
        this._updateDragVisual(_0x523e89);
      };
      const _0x3e6227 = _0x1fd3b9 => {
        if (!_0x3a6920) {
          return;
        }
        _0x3a6920 = false;
        this._bar.dataset.dragging = "false";
        window.removeEventListener("pointermove", _0x42cce7, true);
        window.removeEventListener("pointerup", _0x3e6227, true);
        _0x2e283b(_0x523e89);
        this._isSeeking = false;
        this._syncRendererPlaybackPin();
      };
      this._bar.addEventListener?.("pointerdown", _0x745e => {
        _0x745e.stopPropagation();
        _0x745e.preventDefault();
        if (a521_0x1e173c.isActiveFor(this._data?.id)) {
          return;
        }
        if (!this._currentSrc) {
          return;
        }
        this._isManualControl = true;
        this._setManualLoopPlayback(false);
        this._syncPlaybackChromeVisibility();
        this._autoPlayToken++;
        this._hoverManualPause = true;
        this._ensureVideoElement()?.pause?.();
        this._isSeeking = true;
        this._syncRendererPlaybackPin();
        _0x3a6920 = true;
        this._bar.dataset.dragging = "true";
        _0x523e89 = _0x468d76(_0x745e);
        this._updateDragVisual(_0x523e89);
        _0x2e283b(_0x523e89);
        window.addEventListener("pointermove", _0x42cce7, true);
        window.addEventListener("pointerup", _0x3e6227, true);
      });
    }
    this._snapBtn?.addEventListener?.("click", _0x5beed0 => {
      _0x5beed0.stopPropagation();
      if (a521_0x1e173c.isActiveFor(this._data?.id)) {
        return;
      }
      this._captureFrame();
    });
    this.el.addEventListener("mouseenter", () => this._activateHoverPlayback());
    this.el.addEventListener("mouseleave", () => {
      const _0x23e7b8 = a521_0x473f31.getState().videoClip;
      if (_0x23e7b8 && _0x23e7b8.active && _0x23e7b8.nodeId === this._data?.id) {
        return;
      }
      this._deactivateHoverPlayback();
    });
    this._controls?.addEventListener?.("pointerdown", _0x26f5c3 => _0x26f5c3.stopPropagation());
    this._muteBtn?.addEventListener?.("pointerdown", _0x2fec5b => _0x2fec5b.stopPropagation());
  }
  _activateHoverPlayback() {
    if (!shouldActivateSourceVideoHoverPlayback(a521_0x473f31, this.id)) {
      return false;
    }
    const _0x2d4d81 = a521_0x473f31.getState().videoClip;
    if (_0x2d4d81 && _0x2d4d81.active && _0x2d4d81.nodeId === this._data?.id) {
      return false;
    }
    this._hoverPlaybackLifecycle?.activate?.();
    if (!this._currentSrc || this._rendererMediaDeferred === true) {
      return false;
    }
    const _0x3fae6c = this._ensureVideoElement();
    if (!_0x3fae6c) {
      return false;
    }
    this._isHovered = true;
    this._syncPlaybackChromeVisibility();
    this._syncRendererPlaybackPin();
    if (a521_0x1e173c.isActiveFor(this._data?.id)) {
      _0x3fae6c.pause();
      return false;
    }
    if (isExternallyOwnedVideoPlayback(_0x3fae6c)) {
      return true;
    }
    if (this._hoverManualPause || this._isManualLoopPlayback) {
      return false;
    }
    const _0x21aae2 = this._getBaseDuration();
    const _0x34e325 = this._getClipRange(_0x21aae2);
    _0x3fae6c.loop = !_0x34e325.active;
    if (_0x34e325.active) {
      const _0x562439 = _0x3fae6c.currentTime || 0;
      if (_0x562439 < _0x34e325.start || _0x562439 > _0x34e325.end) {
        _0x3fae6c.currentTime = _0x34e325.start;
      }
    }
    const _0x5c1087 = ++this._autoPlayToken;
    logVideoPlaybackEvent(_0x3fae6c, "hover-enter", {
      label: this._getPlaybackLabel("hover")
    });
    this._playVideoWithRecovery("hover", () => this._autoPlayToken === _0x5c1087 && this._isHovered === true && !this._hoverManualPause);
    return true;
  }
  _ensureVideoElement() {
    if (this._video) {
      return this._video;
    }
    if (!this._card) {
      return null;
    }
    const _0x53db83 = document.createElement("video");
    _0x53db83.className = "video-player";
    _0x53db83.setAttribute("playsinline", "");
    _0x53db83.preload = "none";
    _0x53db83.muted = this._isMuted;
    Object.assign(_0x53db83.style, {
      width: "100%",
      height: "100%",
      display: "block",
      opacity: "0",
      visibility: "hidden",
      objectFit: "cover",
      borderRadius: "0",
      margin: "0",
      pointerEvents: "none"
    });
    if (this._posterFrame?.parentNode === this._card) {
      this._card.insertBefore(_0x53db83, this._posterFrame);
    } else if (typeof this._card.prepend === "function") {
      this._card.prepend(_0x53db83);
    } else {
      this._card.appendChild(_0x53db83);
    }
    this._video = _0x53db83;
    this._bindVideoElementEvents();
    return _0x53db83;
  }
  _syncPlaybackChromeVisibility({
    forceHidden = false
  } = {}) {
    return syncSourceVideoPlaybackChromeVisibility(this, {
      forceHidden: forceHidden
    });
  }
  _deactivateHoverPlayback() {
    return deactivateSourceVideoHoverPlayback(this);
  }
  _releaseIdleHoverPlaybackMedia() {
    return releaseIdleSourceVideoHoverPlaybackMedia(this);
  }
  _syncLoadedVideoMetadata(_0x354a04 = this._video) {
    if (!_0x354a04 || _0x354a04 !== this._video) {
      return false;
    }
    const _0x90f680 = a521_0x473f31.getState().nodes?.[this.id];
    if (!_0x90f680) {
      return false;
    }
    const _0x58b416 = String(this._resolveVideoSrc(_0x90f680) || "").trim();
    const _0x457384 = String(this._currentSrc || "").trim();
    if (_0x58b416 && _0x457384 && _0x58b416 !== _0x457384) {
      return false;
    }
    const _0x539ab2 = _0x457384 || _0x58b416;
    if (_0x539ab2 && !isMediaElementPlaybackSource(_0x354a04, _0x539ab2)) {
      return false;
    }
    this._syncVideoDurationUi();
    this._syncVideoProgressUi();
    const _0x4b2208 = Number(_0x354a04.duration || 0);
    const _0x39a20c = Number(_0x354a04.videoWidth || 0);
    const _0x5e0d5f = Number(_0x354a04.videoHeight || 0);
    const _0x4933a0 = {};
    if (Number.isFinite(_0x4b2208) && _0x4b2208 > 0 && Number(_0x90f680.videoDuration || 0) !== _0x4b2208) {
      _0x4933a0.videoDuration = _0x4b2208;
    }
    if (_0x39a20c > 0 && Number(_0x90f680.videoWidth || 0) !== _0x39a20c) {
      _0x4933a0.videoWidth = _0x39a20c;
    }
    if (_0x5e0d5f > 0 && Number(_0x90f680.videoHeight || 0) !== _0x5e0d5f) {
      _0x4933a0.videoHeight = _0x5e0d5f;
    }
    if (_0x90f680.fixedSize !== true && _0x90f680.needsAutoResize === true && _0x39a20c > 0 && _0x5e0d5f > 0) {
      const _0x3cca01 = getAutoMediaSizeByShortSide(_0x39a20c, _0x5e0d5f);
      _0x4933a0.width = _0x3cca01.width;
      _0x4933a0.height = _0x3cca01.height;
      _0x4933a0.needsAutoResize = false;
    }
    if (Object.keys(_0x4933a0).length > 0) {
      a521_0x473f31.updateNodeData(this.id, _0x4933a0);
      this._data = {
        ..._0x90f680,
        ..._0x4933a0
      };
    }
    return true;
  }
  _bindVideoElementEvents() {
    if (!this._video || this._videoEventsBound === true) {
      return;
    }
    this._videoEventsBound = true;
    this._video.addEventListener("play", () => {
      this._syncRendererPlaybackPin();
      this._syncPosterFrameVisibility();
      this._updatePlayIcon(false);
      this._syncPlaybackChromeVisibility();
      this._hideCenterIndicator();
      this._startProgressLoop();
    });
    this._video.addEventListener("pause", () => {
      this._cancelProgressLoop();
      this._syncVideoProgressUi();
      this._syncPosterFrameVisibility();
      this._updatePlayIcon(true);
      this._syncPlaybackChromeVisibility();
      this._syncRendererPlaybackPin();
      this._applyPendingPlaybackSourceAtBoundary();
    });
    this._video.addEventListener("ended", () => {
      this._applyPendingPlaybackSourceAtBoundary();
    });
    const _0x42a9d8 = () => {
      const _0x9cbfe6 = this._rendererMediaSlotToken;
      this._armFirstVideoFramePresentation(this._currentSrc, _0x9cbfe6);
    };
    for (const _0x57c28f of ["loadeddata", "playing", "timeupdate", "seeked"]) {
      this._video.addEventListener(_0x57c28f, () => {
        _0x42a9d8();
        this._syncPosterFrameVisibility();
        this._releaseFastPreviewForPlaybackIfReady();
        this._syncRendererPlaybackPin();
      });
    }
    this._video.addEventListener("timeupdate", () => this._syncVideoProgressUi());
    const _0x42f4e1 = this._video;
    _0x42f4e1.addEventListener("loadedmetadata", () => {
      this._applyPendingPlaybackResume(_0x42f4e1);
      this._syncLoadedVideoMetadata(_0x42f4e1);
    });
    _0x42f4e1.addEventListener("canplay", () => {
      this._applyPendingPlaybackResume(_0x42f4e1);
    });
  }
  mount() {
    const _0x5139ff = this.el;
    setStaticInnerHTML(_0x5139ff, _SOURCE_VIDEO_NODE_TEMPLATE_ID);
    this._card = _0x5139ff.querySelector(".node-card");
    this._video = null;
    this._posterFrame = _0x5139ff.querySelector(".source-video-poster-frame");
    if (this._posterFrame) {
      this._posterFrame.decoding = "async";
      this._posterFrame.loading = "lazy";
      if ("fetchPriority" in this._posterFrame) {
        this._posterFrame.fetchPriority = "auto";
      }
    }
    if (!this._rendererRuntimePrebuiltOffscreen) {
      this._applyVideoPoster(this._data);
    }
    this._attachPlaybackRecovery();
    this._hint = _0x5139ff.querySelector(".node-upload-hint");
    this._uploadBtn = _0x5139ff.querySelector(".upload-btn");
    this._controls = _0x5139ff.querySelector(".video-controls");
    this._playBtn = _0x5139ff.querySelector(".video-play-btn");
    this._muteBtn = _0x5139ff.querySelector(".video-mute-btn");
    this._iconUnmuted = _0x5139ff.querySelector(".icon-unmuted");
    this._iconMuted = _0x5139ff.querySelector(".icon-muted");
    this._syncMutedStateFromData(this._data);
    this._fill = _0x5139ff.querySelector(".media-progress-fill");
    this._bar = _0x5139ff.querySelector(".media-progress-bar");
    this._timeCurrent = _0x5139ff.querySelector(".video-time-current");
    this._timeTotal = _0x5139ff.querySelector(".video-time-total");
    this._snapBtn = _0x5139ff.querySelector(".video-snap-btn");
    this._centerIndicator = _0x5139ff.querySelector(".video-center-indicator");
    this._indicatorInner = _0x5139ff.querySelector(".indicator-inner");
    this._centerIndicatorTimer = null;
    this._resizer = _0x5139ff.querySelector(".node-resizer");
    this._syncPlaybackChromeVisibility({
      forceHidden: true
    });
    this._syncLocaleTexts();
    if (this._rendererDetailsDeferred !== true) {
      this._unsubscribeLocale = onLocaleChange(() => this._syncLocaleTexts());
    }
    if (this._data?.isGenerating && !this._resolveVideoSrc(this._data)) {
      startLoading(this._card, {
        variant: "full"
      });
      if (this._hint) {
        this._hint.style.display = "none";
      }
      if (this._uploadBtn) {
        this._uploadBtn.disabled = true;
      }
    }
    if (this._rendererMediaDeferred === true || this._rendererDetailsDeferred === true) {
      this._armDeferredVideoInteractionBinding();
    } else {
      this._bindVideoInteractionHandlers();
    }
    const _0x1d65e5 = this._rendererMediaDeferred === true ? this._data : this._promotePendingProxyAtMediaSegmentBoundary(this._data);
    const _0x5c28e1 = this._resolveVideoSrc(_0x1d65e5);
    if (this._rendererMediaDeferred === true) {
      this._currentSrc = _0x5c28e1 || "";
      this._syncPosterFrameVisibility({
        force: !!this._lastPosterSrc
      });
    } else {
      this._requestVisibleProxyMigration();
      if (_0x5c28e1) {
        this._loadVideo(_0x5c28e1);
      } else {
        this._loadVideo("");
      }
    }
    if (this._rendererDetailsDeferred !== true) {
      this._clearResolvedVideoTimer(this._data, _0x5c28e1);
    }
    if (this._rendererMediaDeferred !== true && this._rendererDetailsDeferred !== true) {
      this._maybeFetchVideoMeta(this._data);
    }
    if (this._rendererDetailsDeferred !== true) {
      this._syncRunningHubVideoTaskState(this._data);
      this._maybeResumeRunningHubTask();
      this._maybeResumeAsyncTask();
    }
    this._syncGenerationFailureUi(a521_0x473f31.getState().nodes?.[this.id] || this._data);
    this._toolbarEl = _0x5139ff.querySelector(".node-floating-toolbar");
    if (this._rendererMediaDeferred === true || this._rendererDetailsDeferred === true) {
      this._armDeferredVideoToolbarBinding();
    } else {
      this._ensureVideoToolbarBound();
    }
    return _0x5139ff;
  }
  _syncGenerationFailureUi(_0xa00848 = this._data) {
    const _0x2d2248 = resolveSourceVideoGenerationFailureMessage(_0xa00848);
    if (!_0x2d2248) {
      this._generationErrorOverlay?.remove?.();
      this._generationErrorOverlay = null;
      this._generationErrorMessage = "";
      return false;
    }
    if (!this._card || typeof this._card.appendChild !== "function" || typeof globalThis.document?.createElement !== "function") {
      return false;
    }
    stopLoading(this._card);
    let _0x3b5b67 = false;
    if (!this._generationErrorOverlay) {
      this._generationErrorOverlay = document.createElement("div");
      this._generationErrorOverlay.className = "dreamina-status-overlay source-video-generation-error-overlay";
      this._card?.appendChild?.(this._generationErrorOverlay);
      _0x3b5b67 = true;
    }
    if (_0x3b5b67 || this._generationErrorMessage !== _0x2d2248) {
      this._generationErrorOverlay.innerHTML = "";
      this._generationErrorOverlay.appendChild(createVideoGenerationErrorCard(_0x2d2248));
      this._generationErrorMessage = _0x2d2248;
    }
    this._setPosterFrameVisible(false);
    if (this._hint) {
      this._hint.style.display = "none";
    }
    this._syncPlaybackChromeVisibility({
      forceHidden: true
    });
    if (this._uploadBtn) {
      this._uploadBtn.disabled = false;
    }
    return true;
  }
  hydrateDeferredDetails() {
    if (this._rendererDetailsDeferred !== true) {
      return false;
    }
    this._rendererDetailsDeferred = false;
    this._syncLocaleTexts();
    if (!this._unsubscribeLocale) {
      this._unsubscribeLocale = onLocaleChange(() => this._syncLocaleTexts());
    }
    this._bindVideoInteractionHandlers();
    this._ensureVideoToolbarBound();
    const _0x41b07f = a521_0x473f31.getStateRaw().nodes?.[this.id] || this._data;
    this._data = _0x41b07f;
    const _0x1aedf7 = this._resolveVideoSrc(_0x41b07f);
    this._clearResolvedVideoTimer(_0x41b07f, _0x1aedf7);
    this._maybeFetchVideoMeta(_0x41b07f);
    this._syncRunningHubVideoTaskState(_0x41b07f);
    this._maybeResumeRunningHubTask();
    this._maybeResumeAsyncTask();
    return true;
  }
  _waitForUploadPaint() {
    return waitForNextPaint();
  }
  _syncLocaleTexts() {
    if (this._muteBtn) {
      this._muteBtn.title = sourceVideoText("controls.toggleMute");
    }
    if (this._snapBtn) {
      this._snapBtn.title = sourceVideoText("controls.captureFrame");
    }
    if (this._uploadBtn && !this._isUploading) {
      const _0x4f81ad = this._uploadBtn.querySelector?.(".source-upload-label");
      if (_0x4f81ad) {
        _0x4f81ad.textContent = sourceVideoText("upload.button");
      } else {
        this._uploadBtn.textContent = sourceVideoText("upload.button");
      }
    }
  }
  _syncMuteButtonIcon() {
    if (!this._iconMuted || !this._iconUnmuted) {
      return;
    }
    this._iconMuted.style.display = this._isMuted ? "block" : "none";
    this._iconUnmuted.style.display = this._isMuted ? "none" : "block";
  }
  _applyMutedState() {
    if (this._video) {
      this._video.muted = !!this._isMuted;
    }
    this._syncMuteButtonIcon();
  }
  _syncMutedStateFromData(_0x41a712 = this._data) {
    this._isMuted = resolveVideoMutedPreference(_0x41a712, {
      videoAudioDefaultEnabled: readVideoAudioDefaultEnabledFromStore(a521_0x473f31)
    });
    this._applyMutedState();
  }
  _setMuted(_0xb3440c, {
    persist = false
  } = {}) {
    this._isMuted = !!_0xb3440c;
    this._applyMutedState();
    if (!persist) {
      return;
    }
    const _0x4b1dba = a521_0x473f31.getState().nodes?.[this.id] || this._data || {};
    const _0x3d0e24 = buildVideoMutedPatch(_0x4b1dba, this._isMuted);
    if (!_0x3d0e24) {
      return;
    }
    a521_0x473f31.updateNodeData(this.id, _0x3d0e24);
    this._data = {
      ..._0x4b1dba,
      ..._0x3d0e24
    };
  }
  _readUploadVideoNaturalSize(_0x4558bc) {
    return readVideoFileNaturalSize(_0x4558bc);
  }
  _uploadSourceVideoFile(_0x38807e, _0x39841f) {
    return uploadFile(_0x38807e, _0x39841f);
  }
  async _handleUploadInputFile(_0x3227a2) {
    if (Number(_0x3227a2?.size || 0) > CANVAS_VIDEO_IMPORT_MAX_BYTES) {
      window.showToast?.(t("fileService.errors.videoTooLarge", {
        file: _0x3227a2?.name || t("fileService.defaultNames.video"),
        maxMB: CANVAS_VIDEO_IMPORT_MAX_MB
      }), "error");
      if (this._input) {
        this._input.value = "";
      }
      return false;
    }
    this._isUploading = true;
    startLoading(this._card, {
      variant: "static"
    });
    const _0x22b9ee = this._ensureVideoElement();
    if (_0x22b9ee) {
      _0x22b9ee.style.display = "none";
    }
    this._syncPlaybackChromeVisibility({
      forceHidden: true
    });
    const _0x354a34 = Array.from(this._uploadBtn.childNodes).map(_0x29d744 => _0x29d744.cloneNode(true));
    this._uploadBtn.textContent = sourceVideoText("upload.uploading");
    this._uploadBtn.style.pointerEvents = "none";
    const _0x48a707 = this._currentSrc;
    const _0x223c81 = createVideoCapturePreviewUrl(_0x3227a2);
    if (_0x223c81) {
      this._data = {
        ...this._data,
        capturePreviewUrl: _0x223c81
      };
      this._loadVideo(_0x223c81);
    }
    try {
      const _0x471e05 = window.currentProjectId || "default_v2_project";
      await this._waitForUploadPaint();
      const _0x26658e = Promise.resolve().then(() => this._readUploadVideoNaturalSize(_0x3227a2)).catch(() => null);
      _0x26658e.then(_0x52b0ca => {
        const _0x3a3584 = buildSourceVideoUploadSizePatch(_0x52b0ca);
        if (_0x3a3584.needsAutoResize !== false) {
          return;
        }
        const _0x4f891a = a521_0x473f31.getState().nodes?.[this.id];
        if (!_0x4f891a) {
          return;
        }
        a521_0x473f31.updateNodeData(this.id, _0x3a3584);
        this._data = {
          ..._0x4f891a,
          ..._0x3a3584
        };
      });
      const _0x115981 = await this._uploadSourceVideoFile(_0x3227a2, _0x471e05);
      const _0x2563c4 = await _0x26658e;
      const _0x18d84c = _0x3227a2.name.replace(/\.[^/.]+$/, "");
      const _0x5bc236 = _0x115981.url;
      const _0x32cbbc = pickResultLocalPath(_0x115981) || urlToLocalPath(_0x5bc236);
      const _0x472c6e = String(_0x115981.videoProxyStatus || "").trim();
      const _0x5728fc = _0x472c6e === "processing" && !!_0x223c81;
      const _0x1dfcb3 = _0x472c6e === "processing" ? "" : String(_0x115981.displayUrl || "").trim() || String(_0x115981.displayLocalPath ? "/" + _0x115981.displayLocalPath : "").trim() || _0x5bc236;
      const _0x3d6386 = buildSourceVideoUploadSizePatch({
        width: _0x115981.videoWidth || _0x115981.width,
        height: _0x115981.videoHeight || _0x115981.height
      }, _0x2563c4);
      a521_0x473f31.updateNodeData(this.id, {
        name: _0x18d84c,
        src: _0x1dfcb3,
        localPath: _0x32cbbc,
        assetId: _0x115981.assetId || "",
        assetRevision: Number(_0x115981.assetRevision || 0) || 0,
        assetUpdatedAt: _0x115981.assetUpdatedAt || _0x115981.updatedAt || "",
        originalLocalPath: _0x115981.originalLocalPath || _0x115981.localPath || "",
        displayLocalPath: _0x115981.displayLocalPath || "",
        posterLocalPath: _0x115981.posterLocalPath || "",
        thumbLocalPath: _0x115981.posterLocalPath || _0x115981.thumbLocalPath || "",
        thumbUrl: _0x115981.posterUrl || _0x115981.thumbUrl || "",
        derivativeStatus: _0x115981.derivativeStatus || _0x115981.status || "",
        mediaTaskId: _0x115981.mediaTaskId || "",
        mediaTaskKind: _0x115981.mediaTaskKind || "",
        mediaTaskStatus: _0x115981.mediaTaskStatus || "",
        mediaTaskProgress: Number(_0x115981.mediaTaskProgress || 0) || 0,
        mediaTaskError: _0x115981.mediaTaskError || "",
        videoProxyStatus: _0x472c6e,
        videoProxyVersion: _0x115981.videoProxyVersion || "",
        videoCodec: _0x115981.videoCodec || "",
        videoDuration: Number(_0x115981.videoDuration || _0x2563c4?.duration || 0) || 0,
        videoFps: Number(_0x115981.videoFps || 0) || 0,
        fileSize: Number(_0x115981.size || _0x3227a2?.size || 0) || 0,
        fileName: _0x115981.filename || _0x3227a2.name,
        stagedUploadId: _0x115981.stagedUploadId || "",
        canonicalImportPending: _0x115981.canonicalImportPending === true,
        canonicalImportStatus: _0x115981.canonicalImportStatus || "",
        canonicalImportError: _0x115981.canonicalImportError || "",
        capturePreviewUrl: _0x5728fc ? _0x223c81 : "",
        ..._0x3d6386
      });
    } catch (_0x3e4f7c) {
      console.error("视频上传失败:", _0x3e4f7c);
      window.showToast(sourceVideoText("upload.failedRetry"));
      stopLoading(this._card);
      if (_0x223c81 && this._currentSrc === _0x223c81) {
        this._releaseActiveCapturePreviewUrl();
        if (_0x48a707) {
          this._loadVideo(_0x48a707);
        } else {
          this._currentSrc = "";
          this._loadVideo("");
        }
      }
      if (this._currentSrc) {
        const _0x3b6298 = this._ensureVideoElement();
        if (_0x3b6298) {
          _0x3b6298.style.display = "block";
        }
        this._syncPlaybackChromeVisibility();
      }
    } finally {
      this._isUploading = false;
      this._uploadBtn.replaceChildren(..._0x354a34.map(_0x103653 => _0x103653.cloneNode(true)));
      this._syncLocaleTexts();
      this._uploadBtn.style.pointerEvents = "auto";
      if (this._input) {
        this._input.value = "";
      }
    }
  }
  _applyVideoPoster(_0x4d255f = this._data, _0x502fd4 = {}) {
    const _0x4140b0 = resolveSourceVideoPosterSrc(_0x4d255f);
    const _0x274830 = !!_0x4140b0 && (_0x502fd4?.restoreNativePoster === true || !hasPresentedVideoFrame(this._video, this._currentSrc));
    if (_0x4140b0) {
      if (this._video && _0x274830 && this._video.poster !== _0x4140b0) {
        this._video.poster = _0x4140b0;
      }
      this._lastPosterSrc = _0x4140b0;
      this._applyPosterFrameSource(_0x4140b0);
    } else if (this._video?.poster) {
      this._video.removeAttribute?.("poster");
      if (this._posterFrame) {
        this._posterFrame.removeAttribute?.("src");
      }
      this._lastPosterSrc = "";
    } else {
      if (this._posterFrame) {
        this._posterFrame.removeAttribute?.("src");
      }
      this._lastPosterSrc = "";
    }
    if (_0x274830) {
      this._syncPosterFrameVisibility({
        force: true
      });
    } else {
      this._syncPosterFrameVisibility();
    }
    return _0x4140b0;
  }
  _getPosterFrameSrc() {
    if (!this._posterFrame) {
      return "";
    }
    return String(this._posterFrame.getAttribute?.("src") || this._posterFrame.src || "").trim();
  }
  _setPosterFrameSrc(_0x2919cd) {
    if (!this._posterFrame) {
      return;
    }
    if (typeof this._posterFrame.setAttribute === "function") {
      this._posterFrame.setAttribute("src", _0x2919cd);
    } else {
      this._posterFrame.src = _0x2919cd;
    }
  }
  _applyPosterFrameSource(_0x44a699) {
    if (!this._posterFrame || !_0x44a699) {
      return;
    }
    const _0x510593 = this._getPosterFrameSrc();
    if (_0x510593 === _0x44a699) {
      return;
    }
    const _0x39c88a = ({
      requireConnected = false
    } = {}) => {
      if (!this._posterFrame || requireConnected && this._posterFrame.isConnected === false || this._lastPosterSrc !== _0x44a699) {
        return;
      }
      this._setPosterFrameSrc(_0x44a699);
      this._syncPosterFrameVisibility();
    };
    if (!_0x510593 || _0x44a699.startsWith("data:") || typeof Image !== "function") {
      _0x39c88a();
      return;
    }
    if (isCanvasImagePreloadRecentlyResolved(_0x44a699)) {
      _0x39c88a();
      return;
    }
    const _0xf7318f = (this._posterFramePreloadToken || 0) + 1;
    this._posterFramePreloadToken = _0xf7318f;
    preloadCanvasImage(_0x44a699, {
      priority: SOURCE_VIDEO_POSTER_PRELOAD_PRIORITY,
      fetchPriority: "auto",
      deferWhenPaused: true
    }).then(() => {
      if (this._posterFramePreloadToken === _0xf7318f) {
        _0x39c88a({
          requireConnected: true
        });
      }
    }, () => {});
  }
  _setPosterFrameVisible(_0x5e2ee1) {
    if (!this._posterFrame) {
      return;
    }
    this._posterFrame.classList?.toggle("is-visible", !!_0x5e2ee1);
  }
  _shouldPinRendererForPlayback() {
    return !!this._isHovered || !!this._isManualControl || !!this._isManualLoopPlayback || !!this._isSeeking || this._video?.paused === false;
  }
  _setRendererPlaybackPin(_0x3d46ed) {
    const _0x3d2725 = _0x3d46ed === true;
    if (this._rendererPlaybackPinned === _0x3d2725) {
      return;
    }
    this._rendererPlaybackPinned = _0x3d2725;
    const _0x9d4d4 = globalThis.window?.v2Renderer;
    if (_0x3d2725) {
      _0x9d4d4?.pinNode?.(this.id, SOURCE_VIDEO_RENDER_PIN_REASON);
    } else {
      _0x9d4d4?.unpinNode?.(this.id, SOURCE_VIDEO_RENDER_PIN_REASON);
    }
  }
  _syncRendererPlaybackPin() {
    this._setRendererPlaybackPin(this._shouldPinRendererForPlayback());
  }
  _prepareRendererMediaSlotSource(_0x291f89, _0xe8c3b9 = {}) {
    const _0x44df0f = String(_0x291f89 || "").trim();
    const _0x50a63f = globalThis.window?.v2Renderer?.prepareMediaSlotSource?.(this.id, _0x44df0f, {
      slotIndex: 0,
      rebind: _0xe8c3b9?.rebind === true
    });
    if (!_0x50a63f || String(_0x50a63f.sourceKey || "").trim() !== _0x44df0f || !Number.isInteger(_0x50a63f.sourceEpoch)) {
      this._rendererMediaSlotToken = null;
      return null;
    }
    const _0x55800e = Object.freeze({
      sourceKey: _0x44df0f,
      sourceEpoch: _0x50a63f.sourceEpoch
    });
    this._rendererMediaSlotToken = _0x55800e;
    return _0x55800e;
  }
  _armFirstVideoFramePresentation(_0x4ca249 = this._currentSrc, _0x4f3a34 = this._rendererMediaSlotToken) {
    const _0x26de46 = String(_0x4ca249 || "").trim();
    const _0xb8dc3a = this._video;
    if (!_0xb8dc3a || !_0x26de46) {
      return false;
    }
    if (this._isCurrentRendererMediaSlotToken(_0x26de46, _0x4f3a34) && hasReportedSourceVideoMediaSlotFrame(this, {
      sourceKey: _0x26de46,
      mediaSlotToken: _0x4f3a34
    })) {
      return true;
    }
    if (!_0xb8dc3a.style) {
      _0xb8dc3a.style = {};
    }
    _0xb8dc3a.style.display = "block";
    _0xb8dc3a.style.opacity = "1";
    _0xb8dc3a.style.visibility = "visible";
    return watchVideoFramePresentation(_0xb8dc3a, () => scheduleSourceVideoFramePresentationCommit(this, _0x26de46, _0x4f3a34));
  }
  _isCurrentRendererMediaSlotToken(_0x5b84d7, _0x21801a) {
    if (!_0x21801a) {
      return true;
    }
    const _0x5154c4 = this._rendererMediaSlotToken;
    return !!_0x5154c4 && _0x5154c4.sourceKey === String(_0x5b84d7 || "").trim() && _0x5154c4.sourceEpoch === _0x21801a.sourceEpoch && _0x5154c4.sourceKey === _0x21801a.sourceKey;
  }
  _removeNativePosterForPresentedSource(_0x2f40e5 = this._currentSrc, _0x4de05 = this._rendererMediaSlotToken, _0x54b53c = null) {
    const _0x5609c7 = String(_0x2f40e5 || "").trim();
    const _0x5b0bdb = this._video;
    if (!_0x5b0bdb || !_0x5b0bdb.poster || !_0x5609c7 || this._currentSrc !== _0x5609c7 || !this._isCurrentRendererMediaSlotToken(_0x5609c7, _0x4de05)) {
      return false;
    }
    const _0x29b95a = _0x54b53c || this._getRendererVideoPresentationFacts();
    if (_0x29b95a.domConnected !== true || _0x29b95a.readyState < 2 || _0x29b95a.videoWidth <= 0 || _0x29b95a.videoHeight <= 0 || _0x29b95a.error || _0x29b95a.rvfcObserved !== true || _0x29b95a.cssDisplayVisible !== true || _0x29b95a.cssVisibilityVisible !== true || _0x29b95a.cssOpacityVisible !== true || _0x29b95a.overlayClear !== true) {
      return false;
    }
    _0x5b0bdb.removeAttribute?.("poster");
    return !_0x5b0bdb.poster;
  }
  _restorePausedFirstFrameNudge(_0x53c97a = this._currentSrc) {
    const _0x2652a6 = this._pausedFirstFrameNudge;
    if (!_0x2652a6 || _0x2652a6.sourceKey !== String(_0x53c97a || "").trim()) {
      return false;
    }
    this._pausedFirstFrameNudge = null;
    if (_0x2652a6.timer) {
      clearTimeout(_0x2652a6.timer);
    }
    const _0x21a02d = this._video;
    if (!_0x21a02d || this._currentSrc !== _0x2652a6.sourceKey || _0x21a02d.paused !== true || Math.abs(Number(_0x21a02d.currentTime || 0) - _0x2652a6.nudgedTime) > 0.0005) {
      return false;
    }
    try {
      _0x21a02d.currentTime = _0x2652a6.originalTime;
      return true;
    } catch {
      return false;
    }
  }
  _nudgePausedVideoForFirstFrame(_0x5862d4 = this._currentSrc) {
    const _0x192332 = String(_0x5862d4 || "").trim();
    const _0x4a6c49 = this._video;
    if (!_0x4a6c49 || !_0x192332 || this._currentSrc !== _0x192332 || _0x4a6c49.paused !== true || Number(_0x4a6c49.readyState || 0) < 2 || Number(_0x4a6c49.videoWidth || 0) <= 0 || Number(_0x4a6c49.videoHeight || 0) <= 0 || hasPresentedVideoFrame(_0x4a6c49, _0x192332) || this._pausedFirstFrameNudge?.sourceKey === _0x192332) {
      return false;
    }
    const _0x4dad78 = Number(_0x4a6c49.currentTime || 0);
    const _0x5b2357 = Number(_0x4a6c49.duration || 0);
    const _0x2d15e4 = 0.001;
    const _0x548de8 = Number.isFinite(_0x5b2357) && _0x5b2357 > _0x2d15e4 && _0x4dad78 + _0x2d15e4 >= _0x5b2357 ? Math.max(0, _0x4dad78 - _0x2d15e4) : _0x4dad78 + _0x2d15e4;
    if (_0x548de8 === _0x4dad78) {
      return false;
    }
    const _0x368808 = {
      sourceKey: _0x192332,
      originalTime: _0x4dad78,
      nudgedTime: _0x548de8,
      timer: null
    };
    this._pausedFirstFrameNudge = _0x368808;
    _0x368808.timer = setTimeout(() => {
      this._restorePausedFirstFrameNudge(_0x192332);
    }, 250);
    try {
      _0x4a6c49.currentTime = _0x548de8;
      return true;
    } catch {
      this._restorePausedFirstFrameNudge(_0x192332);
      return false;
    }
  }
  _releaseFastPreviewForPlaybackIfReady(_0x5bb267 = this._rendererMediaSlotToken, _0x7a5517 = null) {
    const _0x5762af = String(this._currentSrc || "").trim();
    if (!_0x5762af || _0x5bb267?.sourceKey !== _0x5762af || !Number.isInteger(_0x5bb267?.sourceEpoch) || !this._isVideoFrameReadyToShow()) {
      return false;
    }
    return reportSourceVideoMediaSlotFrameOnce(this, {
      sourceKey: _0x5762af,
      mediaSlotToken: _0x5bb267,
      presentationFacts: _0x7a5517
    });
  }
  _isVideoFrameReadyToShow() {
    return hasPresentedVideoFrame(this._video, this._currentSrc);
  }
  hasPresentedRendererMedia() {
    return !!this._video && !!getVideoCurrentSource(this._video) && !!this._isVideoFrameReadyToShow();
  }
  _getRendererVideoPresentationFacts() {
    const _0x16c370 = this._video;
    const _0x6849dc = _0x17d723 => {
      if (!_0x17d723 || _0x17d723.isConnected === false) {
        return false;
      }
      let _0x49b03a = _0x17d723;
      while (_0x49b03a && _0x49b03a !== globalThis.document) {
        const _0x264d35 = typeof globalThis.getComputedStyle === "function" ? globalThis.getComputedStyle(_0x49b03a) : _0x49b03a.style || {};
        if (_0x264d35?.display === "none" || _0x264d35?.visibility === "hidden" || Number.parseFloat(_0x264d35?.opacity ?? "1") === 0) {
          return false;
        }
        _0x49b03a = _0x49b03a.parentElement || _0x49b03a.parentNode;
      }
      return true;
    };
    const _0x13e7f1 = this._posterFrame?.classList?.contains?.("is-visible") === true;
    const _0x4842d1 = !!this._card?.classList?.contains?.("img-preview-loading") || !!this._card?.querySelector?.(".img-loading-overlay");
    const _0x1586bb = _0x16c370?.style || {};
    const _0x2d8bdd = _0x6849dc(_0x16c370);
    return {
      domConnected: _0x16c370?.isConnected === true,
      readyState: Number(_0x16c370?.readyState || 0),
      videoWidth: Number(_0x16c370?.videoWidth || 0),
      videoHeight: Number(_0x16c370?.videoHeight || 0),
      error: _0x16c370?.error || null,
      rvfcObserved: hasPresentedVideoFrame(_0x16c370, this._currentSrc),
      cssDisplayVisible: _0x1586bb.display !== "none" && _0x2d8bdd,
      cssVisibilityVisible: _0x1586bb.visibility !== "hidden" && _0x2d8bdd,
      cssOpacityVisible: Number.parseFloat(_0x1586bb.opacity || "1") > 0 && _0x2d8bdd,
      overlayClear: !_0x13e7f1 && !_0x4842d1
    };
  }
  _isPosterFrameReadyToShow() {
    if (!this._posterFrame || !this._getPosterFrameSrc()) {
      return false;
    }
    if (typeof this._posterFrame.complete !== "boolean") {
      return true;
    }
    return this._posterFrame.complete === true && Number(this._posterFrame.naturalWidth || 0) > 0;
  }
  _syncVideoElementFrameVisibility({
    forceHidden = false
  } = {}) {
    if (!this._video) {
      return;
    }
    if (!this._video.style) {
      this._video.style = {};
    }
    const _0x217852 = !!getVideoCurrentSource(this._video);
    if (!_0x217852) {
      this._video.style.display = "none";
      this._video.style.opacity = "";
      this._video.style.visibility = "";
      return;
    }
    this._video.style.display = "block";
    if (!String(this._lastPosterSrc || "").trim()) {
      this._video.style.opacity = "1";
      this._video.style.visibility = "visible";
      return;
    }
    const _0xf6161a = this._getPosterFrameSrc();
    const _0x3f7664 = Number(this._video.readyState || 0) >= 2 && !!_0xf6161a && typeof this._posterFrame?.complete === "boolean" && !this._isPosterFrameReadyToShow();
    const _0x658bca = _0x3f7664 || !forceHidden && this._isVideoFrameReadyToShow();
    this._video.style.opacity = _0x658bca ? "1" : "0";
    this._video.style.visibility = _0x658bca ? "visible" : "hidden";
  }
  _syncPosterFrameVisibility(_0x1a52f2 = {}) {
    this._syncVideoElementFrameVisibility();
    if (!this._posterFrame) {
      return;
    }
    const _0x3f4ffa = String(this._lastPosterSrc || "").trim();
    if (!_0x3f4ffa) {
      this._setPosterFrameVisible(false);
      return;
    }
    if (Object.prototype.hasOwnProperty.call(_0x1a52f2, "force")) {
      this._setPosterFrameVisible(!!_0x1a52f2.force);
      if (_0x1a52f2.force === true) {
        this._syncVideoElementFrameVisibility({
          forceHidden: true
        });
      }
      return;
    }
    if (this._isVideoFrameReadyToShow()) {
      this._setPosterFrameVisible(false);
      return;
    }
    this._setPosterFrameVisible(true);
  }
  _clearVideoElementSource({
    load = true,
    invalidateRendererSlot = true
  } = {}) {
    if (!this._video) {
      return;
    }
    if (invalidateRendererSlot) {
      const _0x4df5ec = String(this._rendererMediaSlotToken?.sourceKey || this._currentSrc || "").trim();
      this._prepareRendererMediaSlotSource(_0x4df5ec, {
        rebind: true
      });
      this._rendererMediaSlotToken = null;
    }
    this._cancelProgressLoop();
    const _0x48eaa5 = this._pausedFirstFrameNudge;
    this._pausedFirstFrameNudge = null;
    if (_0x48eaa5?.timer) {
      clearTimeout(_0x48eaa5.timer);
    }
    resetVideoFramePresentation(this._video);
    clearDesktopMediaPlaybackSourceMetadata(this._video);
    this._video.removeAttribute?.("src");
    this._releasePlaybackObjectUrl();
    if (load !== false) {
      try {
        this._video.load?.();
      } catch {}
    }
  }
  _releasePlaybackObjectUrl() {
    this._playbackBlobFetchController?.abort?.();
    this._playbackBlobFetchController = null;
    const _0x45f273 = String(this._objUrl || "").trim();
    const _0x4fe6b0 = releaseLocalVideoPlaybackObjectUrlOwner("source-video:" + this.id + ":playback");
    this._objUrl = null;
    this._objUrlSource = "";
    if (_0x45f273 && !_0x4fe6b0) {
      revokeTrackedMediaObjectUrl(_0x45f273);
    }
  }
  async _resolveLocalPlaybackObjectUrl(_0x853f2e, {
    resultMode = "legacy"
  } = {}) {
    const _0x1d2bd2 = resultMode === "typed";
    const _0x2f2370 = (_0x1286a1, _0x37e80a = "", _0x559a73 = 0) => _0x1d2bd2 ? {
      status: _0x1286a1,
      playbackUrl: _0x37e80a,
      httpStatus: Number(_0x559a73 || 0)
    } : _0x37e80a;
    const _0x5bfc75 = String(_0x853f2e || "").trim();
    if (!_0x5bfc75) {
      return _0x2f2370("empty-url");
    }
    let _0x3e81e5;
    try {
      _0x3e81e5 = new URL(_0x5bfc75, globalThis.location?.href || globalThis.window?.location?.href);
    } catch {
      return _0x2f2370("invalid-url");
    }
    const _0x470526 = String(globalThis.location?.origin || globalThis.window?.location?.origin || "");
    if (!_0x470526 || _0x3e81e5.origin !== _0x470526 || !/^\/(?:output|data\/assets|data\/uploads)\//i.test(_0x3e81e5.pathname)) {
      return _0x2f2370("not-local");
    }
    const _0x5ec091 = _0x3e81e5.href;
    if (this._hardMissingPlaybackSource === _0x5ec091) {
      return _0x2f2370("hard-missing", "", this._hardMissingPlaybackStatus || 404);
    }
    if (this._objUrl && this._objUrlSource === _0x5ec091) {
      return _0x2f2370("ready", this._objUrl);
    }
    const _0x500d81 = typeof AbortController === "function" ? new AbortController() : null;
    this._playbackBlobFetchController?.abort?.();
    this._playbackBlobFetchController = _0x500d81;
    try {
      const _0x4e4dbf = await acquireLocalVideoPlaybackObjectUrlResult(_0x5ec091, "source-video:" + this.id + ":playback", {
        signal: _0x500d81?.signal,
        timeout: SOURCE_VIDEO_LOCAL_BLOB_FETCH_TIMEOUT_MS,
        maxBytes: SOURCE_VIDEO_LOCAL_BLOB_MAX_BYTES
      });
      if (_0x4e4dbf?.status === "hard-missing") {
        this._hardMissingPlaybackSource = _0x5ec091;
        this._hardMissingPlaybackStatus = Number(_0x4e4dbf.httpStatus || 0);
        return _0x2f2370("hard-missing", "", _0x4e4dbf.httpStatus);
      }
      if (_0x4e4dbf?.status === "aborted") {
        return _0x2f2370("aborted");
      }
      const _0x1e5444 = String(_0x4e4dbf?.playbackUrl || "").trim();
      if (!_0x1e5444 || this._playbackBlobFetchController !== _0x500d81) {
        globalThis.window?.__runtimeCompareMark?.("source-video-playback:blob-discarded", {
          nodeId: this.id,
          sourceUrl: _0x5ec091,
          hasBlob: !!_0x1e5444,
          controllerMatches: this._playbackBlobFetchController === _0x500d81,
          status: String(_0x4e4dbf?.status || "failed")
        });
        return _0x2f2370(this._playbackBlobFetchController === _0x500d81 ? String(_0x4e4dbf?.status || "failed") : "aborted");
      }
      if (this._playbackBlobFetchController === _0x500d81) {
        this._playbackBlobFetchController = null;
      }
      this._objUrl = _0x1e5444;
      this._objUrlSource = _0x5ec091;
      return _0x2f2370("ready", _0x1e5444);
    } catch (_0x51e982) {
      return _0x2f2370(_0x51e982?.name === "AbortError" ? "aborted" : "failed");
    } finally {
      if (this._playbackBlobFetchController === _0x500d81) {
        this._playbackBlobFetchController = null;
      }
    }
  }
  _applyHardMissingPlaybackState(_0x4b483e, _0x5519e7 = 0) {
    stopLoading(this._card);
    if (this._video) {
      this._video.style.opacity = "0";
      this._video.style.visibility = "hidden";
    }
    this._setPosterFrameVisible(true);
    const _0x1aec9b = a521_0x473f31.getStateRaw?.().nodes?.[this.id] || a521_0x473f31.getState().nodes?.[this.id] || this._data || null;
    const _0x5a4908 = getVideoSourceKey(_0x1aec9b);
    const _0x3ca2a6 = urlToLocalPath(_0x4b483e);
    const _0x34f597 = urlToLocalPath(_0x5a4908);
    const _0x16aa7a = !!_0x5a4908 && (_0x5a4908 === String(_0x4b483e || "").trim() || !!_0x3ca2a6 && _0x3ca2a6 === _0x34f597);
    if (_0x16aa7a && (_0x1aec9b.mediaUnavailable !== true || String(_0x1aec9b.mediaUnavailableSource || "").trim() !== _0x5a4908)) {
      const _0x3cb6a6 = {
        mediaUnavailable: true,
        mediaUnavailableSource: _0x5a4908
      };
      a521_0x473f31.updateNodeData(this.id, _0x3cb6a6);
      this._data = {
        ..._0x1aec9b,
        ..._0x3cb6a6
      };
    }
    globalThis.window?.__runtimeCompareMark?.("source-video-playback:hard-missing", {
      nodeId: this.id,
      sourceUrl: String(_0x4b483e || ""),
      status: Number(_0x5519e7 || 0)
    });
  }
  _isHardMissingPlaybackSource(_0x434cb3) {
    const _0x928af5 = String(this._hardMissingPlaybackSource || "").trim();
    const _0x141c7f = String(_0x434cb3 || "").trim();
    if (!_0x928af5 || !_0x141c7f) {
      return false;
    }
    if (_0x141c7f === _0x928af5) {
      return true;
    }
    try {
      return new URL(_0x141c7f, globalThis.location?.href || globalThis.window?.location?.href).href === _0x928af5;
    } catch {
      return false;
    }
  }
  _resolveVideoSrc(_0x6321e2) {
    return resolveCanvasVideoUrl(_0x6321e2) || this._getCapturePreviewUrl(_0x6321e2);
  }
  _shouldDeferActivePlaybackSourceChange(_0x1e6e66) {
    const _0x543d1f = String(_0x1e6e66 || "").trim();
    const _0x1ccb28 = String(this._currentSrc || "").trim();
    if (_0x543d1f === _0x1ccb28) {
      return false;
    }
    const _0x127731 = this._video;
    if (!_0x127731 || _0x127731.isConnected === false || _0x127731.paused !== false) {
      return false;
    }
    return !!getVideoCurrentSource(_0x127731) || !!_0x127731.dataset?.desktopMediaSourceUrl || !!this._objUrl;
  }
  _setPendingPlaybackSource(_0x21414f) {
    this._invalidatePendingPlaybackResume();
    this._pendingPlaybackSource = String(_0x21414f || "").trim();
    this._hasPendingPlaybackSource = true;
  }
  _clearPendingPlaybackSource() {
    this._pendingPlaybackSource = "";
    this._hasPendingPlaybackSource = false;
  }
  _invalidatePendingPlaybackResume() {
    this._playbackResumeGeneration = Number(this._playbackResumeGeneration || 0) + 1;
    this._pendingPlaybackResume = null;
  }
  _replacePendingPlaybackResume(_0x4ca5e8, _0x4a61db) {
    this._invalidatePendingPlaybackResume();
    const _0xbd5833 = String(_0x4ca5e8 || "").trim();
    const _0x276750 = Number(_0x4a61db);
    if (!_0xbd5833 || !Number.isFinite(_0x276750) || _0x276750 <= 0) {
      return false;
    }
    this._pendingPlaybackResume = {
      generation: this._playbackResumeGeneration,
      source: _0xbd5833,
      time: _0x276750
    };
    return true;
  }
  _applyPendingPlaybackResume(_0x2eceaf = this._video) {
    const _0x48d1bc = this._pendingPlaybackResume;
    if (!_0x48d1bc || !_0x2eceaf || _0x2eceaf !== this._video) {
      return false;
    }
    if (_0x48d1bc.generation !== this._playbackResumeGeneration) {
      this._pendingPlaybackResume = null;
      return false;
    }
    const _0xcbfb6c = String(_0x48d1bc.source || "").trim();
    if (_0xcbfb6c !== String(this._currentSrc || "").trim()) {
      this._invalidatePendingPlaybackResume();
      return false;
    }
    if (Number(_0x2eceaf.readyState || 0) < 1 || !isMediaElementPlaybackSource(_0x2eceaf, _0xcbfb6c)) {
      return false;
    }
    const _0x358ff4 = Number(_0x2eceaf.duration);
    if (!Number.isFinite(_0x358ff4) || _0x358ff4 <= 0) {
      return false;
    }
    const _0x34b7ce = Number(_0x48d1bc.time);
    const _0x5a4130 = Math.min(Math.max(0, _0x34b7ce), Math.max(0, _0x358ff4 - 0.05));
    try {
      _0x2eceaf.currentTime = _0x5a4130;
    } catch {
      return false;
    }
    if (this._pendingPlaybackResume === _0x48d1bc && _0x48d1bc.generation === this._playbackResumeGeneration) {
      this._pendingPlaybackResume = null;
    }
    return true;
  }
  _applyPendingPlaybackSourceAtBoundary() {
    if (this._hasPendingPlaybackSource !== true || this._rendererMediaDeferred === true || this._video?.paused === false) {
      return false;
    }
    const _0x20b799 = a521_0x473f31.getStateRaw().nodes?.[this.id] || this._data;
    const _0x473255 = String(this._resolveVideoSrc(_0x20b799) || "").trim();
    const _0x3521c2 = Number(this._video?.currentTime);
    const _0x55caa4 = Number(this._video?.duration);
    const _0x8e176c = this._video?.ended === true || Number.isFinite(_0x3521c2) && Number.isFinite(_0x55caa4) && _0x55caa4 > 0 && _0x3521c2 >= Math.max(0, _0x55caa4 - 0.05);
    const _0x276a82 = !_0x8e176c && this._shouldKeepReadyCapturePreview(_0x473255) ? _0x3521c2 : 0;
    this._clearPendingPlaybackSource();
    if (_0x473255 === String(this._currentSrc || "").trim()) {
      return false;
    }
    this._data = _0x20b799;
    this._loadVideo(_0x473255, {
      forceCapturePreviewPromotion: true,
      ...(Number.isFinite(_0x276a82) && _0x276a82 > 0 ? {
        resumePlaybackTime: _0x276a82
      } : {})
    });
    this._clearStoredCapturePreviewAfterSourcePromotion(_0x473255);
    return true;
  }
  _promotePendingProxyAtMediaSegmentBoundary(_0x51d53a = null) {
    const _0x38db2a = _0x51d53a || a521_0x473f31.getStateRaw().nodes?.[this.id] || this._data || null;
    const _0x5ca3e7 = buildCanvasVideoProxyPromotionPatch(_0x38db2a);
    if (!_0x5ca3e7) {
      return _0x38db2a;
    }
    const _0x21078b = !!this._video?.getAttribute?.("src") || !!this._video?.dataset?.desktopMediaSourceUrl || !!this._objUrl || !!this._playbackBlobFetchController || !!this._playbackSourcePromise;
    if (_0x21078b) {
      return _0x38db2a;
    }
    a521_0x473f31.updateNodeData(this.id, _0x5ca3e7);
    const _0x211c47 = a521_0x473f31.getStateRaw().nodes?.[this.id] || {
      ..._0x38db2a,
      ..._0x5ca3e7
    };
    this._data = _0x211c47;
    return _0x211c47;
  }
  _importLocalStagedAsset(_0x5e2fe3, _0x22649a) {
    return importLocalStagedAsset(_0x5e2fe3, _0x22649a);
  }
  _discardLocalStagedAsset(_0x28f683) {
    return discardLocalStagedAsset(_0x28f683);
  }
  _clearCanonicalAssetImportRetry() {
    const _0x56adc5 = this._canonicalAssetImportRetryTimer;
    this._canonicalAssetImportRetryTimer = null;
    if (_0x56adc5 == null) {
      return;
    }
    const _0x37c870 = globalThis.window?.clearTimeout || globalThis.clearTimeout;
    try {
      _0x37c870?.(_0x56adc5);
    } catch {}
  }
  _invalidateCanonicalAssetImportRetry() {
    this._clearCanonicalAssetImportRetry();
    this._canonicalAssetImportRetryGeneration = Number(this._canonicalAssetImportRetryGeneration || 0) + 1;
  }
  _scheduleCanonicalAssetImportRetry(_0x5c5fa0, _0x2ea482 = SOURCE_VIDEO_CANONICAL_IMPORT_RETRY_MS) {
    const _0x15d9a6 = String(_0x5c5fa0 || "").trim();
    if (!_0x15d9a6 || this._canonicalAssetImportDisposed === true) {
      return false;
    }
    this._clearCanonicalAssetImportRetry();
    const _0x62076 = globalThis.window?.setTimeout || globalThis.setTimeout;
    if (typeof _0x62076 !== "function") {
      return false;
    }
    const _0x500d6b = Number(this._canonicalAssetImportRetryGeneration || 0) + 1;
    this._canonicalAssetImportRetryGeneration = _0x500d6b;
    const _0x2e18b9 = _0x62076(() => {
      if (this._canonicalAssetImportRetryTimer === _0x2e18b9) {
        this._canonicalAssetImportRetryTimer = null;
      }
      if (this._canonicalAssetImportDisposed === true || Number(this._canonicalAssetImportRetryGeneration || 0) !== _0x500d6b) {
        return;
      }
      const _0x7bb1cc = a521_0x473f31.getStateRaw().nodes?.[this.id];
      if (!_0x7bb1cc || _0x7bb1cc.assetId || resolveSourceVideoMediaTaskSrc(_0x7bb1cc) !== _0x15d9a6) {
        return;
      }
      this._requestCanonicalAssetImport(_0x7bb1cc);
    }, Math.max(0, Number(_0x2ea482) || 0));
    this._canonicalAssetImportRetryTimer = _0x2e18b9;
    return true;
  }
  _requestCanonicalAssetImport(_0x32c2ef = this._data) {
    if (!desktopBridge.isChromeShell) {
      return null;
    }
    if (!_0x32c2ef || _0x32c2ef.assetId) {
      this._invalidateCanonicalAssetImportRetry();
      return null;
    }
    const _0x4ed041 = resolveSourceVideoMediaTaskSrc(_0x32c2ef);
    if (!_0x4ed041.startsWith("data/uploads/")) {
      this._invalidateCanonicalAssetImportRetry();
      return null;
    }
    if (this._canonicalAssetImportSource && this._canonicalAssetImportSource !== _0x4ed041) {
      this._invalidateCanonicalAssetImportRetry();
    }
    if (this._canonicalAssetImportSource === _0x4ed041 && this._canonicalAssetImportPromise) {
      return this._canonicalAssetImportPromise;
    }
    const _0x54f5a7 = Date.now() - Number(this._canonicalAssetImportFailedAt || 0);
    if (this._canonicalAssetImportSource === _0x4ed041 && _0x54f5a7 < SOURCE_VIDEO_CANONICAL_IMPORT_RETRY_MS) {
      if (this._canonicalAssetImportRetryTimer == null) {
        this._scheduleCanonicalAssetImportRetry(_0x4ed041, SOURCE_VIDEO_CANONICAL_IMPORT_RETRY_MS - Math.max(0, _0x54f5a7));
      }
      return null;
    }
    this._canonicalAssetImportSource = _0x4ed041;
    const _0x3f8aba = Promise.resolve().then(() => this._importLocalStagedAsset(_0x4ed041, {
      name: _0x32c2ef.fileName || _0x32c2ef.name,
      type: _0x32c2ef.mimeType || _0x32c2ef.fileType || "",
      projectId: globalThis.window?.currentProjectId || "default_v2_project"
    })).then(_0x3ead50 => {
      if (!_0x3ead50?.success || !_0x3ead50.assetId) {
        throw new Error("Canonical asset import returned no assetId");
      }
      const _0x11cbc1 = a521_0x473f31.getStateRaw().nodes?.[this.id];
      if (!_0x11cbc1 || _0x11cbc1.assetId) {
        return null;
      }
      if (resolveSourceVideoMediaTaskSrc(_0x11cbc1) !== _0x4ed041) {
        return null;
      }
      const _0x17f0a3 = String(_0x3ead50.videoProxyStatus || "").trim();
      const _0x466b16 = _0x17f0a3 === "processing" || _0x17f0a3 === "waiting";
      const _0x5b67f0 = _0x3ead50.localPath || _0x3ead50.originalLocalPath || _0x4ed041;
      const _0x5a273e = _0x466b16 ? _0x4ed041 : _0x3ead50.displayLocalPath || "";
      const _0x1a2350 = _0x466b16 ? _0x11cbc1.src || localPathToUrl(_0x4ed041) : _0x3ead50.displayUrl || _0x3ead50.url || localPathToUrl(_0x5a273e || _0x5b67f0);
      const _0x1444e3 = String(_0x11cbc1.stagedUploadId || "").trim();
      const _0x58cc11 = {
        assetId: _0x3ead50.assetId,
        assetRevision: Number(_0x3ead50.assetRevision || 0) || 0,
        assetUpdatedAt: _0x3ead50.assetUpdatedAt || _0x3ead50.updatedAt || "",
        src: _0x1a2350,
        localPath: _0x466b16 ? _0x11cbc1.localPath || _0x4ed041 : _0x5b67f0,
        originalLocalPath: _0x3ead50.originalLocalPath || _0x5b67f0,
        displayLocalPath: _0x5a273e,
        posterLocalPath: _0x3ead50.posterLocalPath || _0x11cbc1.posterLocalPath || "",
        thumbLocalPath: _0x3ead50.posterLocalPath || _0x3ead50.thumbLocalPath || _0x11cbc1.thumbLocalPath || "",
        thumbUrl: _0x3ead50.posterUrl || _0x3ead50.thumbUrl || _0x11cbc1.thumbUrl || "",
        derivativeStatus: _0x3ead50.derivativeStatus || _0x3ead50.status || _0x11cbc1.derivativeStatus || "",
        mediaTaskId: _0x3ead50.mediaTaskId || "",
        mediaTaskKind: _0x3ead50.mediaTaskKind || "",
        mediaTaskStatus: _0x3ead50.mediaTaskStatus || "",
        mediaTaskProgress: Number(_0x3ead50.mediaTaskProgress || 0) || 0,
        mediaTaskError: _0x3ead50.mediaTaskError || "",
        videoProxyStatus: _0x17f0a3,
        videoProxyVersion: _0x3ead50.videoProxyVersion || "",
        videoCodec: _0x3ead50.videoCodec || _0x11cbc1.videoCodec || "",
        videoDuration: Number(_0x3ead50.videoDuration || _0x11cbc1.videoDuration || 0) || 0,
        videoFps: Number(_0x3ead50.videoFps || _0x11cbc1.videoFps || 0) || 0,
        videoWidth: Number(_0x3ead50.videoWidth || _0x11cbc1.videoWidth || 0) || 0,
        videoHeight: Number(_0x3ead50.videoHeight || _0x11cbc1.videoHeight || 0) || 0,
        fileSize: Number(_0x3ead50.size || _0x11cbc1.fileSize || 0) || 0,
        fileName: _0x3ead50.filename || _0x11cbc1.fileName || _0x32c2ef.fileName || "",
        stagedUploadId: "",
        canonicalImportPending: false,
        canonicalImportStatus: "succeeded",
        canonicalImportError: ""
      };
      a521_0x473f31.updateNodeData(this.id, _0x58cc11);
      this._data = {
        ..._0x11cbc1,
        ..._0x58cc11
      };
      this._canonicalAssetImportFailedAt = 0;
      this._clearCanonicalAssetImportRetry();
      if (_0x1444e3) {
        Promise.resolve().then(() => this._discardLocalStagedAsset(_0x1444e3)).catch(() => {});
      }
      return _0x3ead50;
    }).catch(_0x37f96c => {
      const _0x43643a = a521_0x473f31.getStateRaw().nodes?.[this.id];
      if (this._canonicalAssetImportDisposed === true || !_0x43643a || _0x43643a.assetId || resolveSourceVideoMediaTaskSrc(_0x43643a) !== _0x4ed041) {
        return null;
      }
      this._canonicalAssetImportFailedAt = Date.now();
      const _0x420c22 = {
        canonicalImportPending: true,
        canonicalImportStatus: "failed",
        canonicalImportError: String(_0x37f96c?.message || _0x37f96c || "")
      };
      a521_0x473f31.updateNodeData(this.id, _0x420c22);
      this._data = {
        ..._0x43643a,
        ..._0x420c22
      };
      this._scheduleCanonicalAssetImportRetry(_0x4ed041, SOURCE_VIDEO_CANONICAL_IMPORT_RETRY_MS);
      console.warn("[SourceVideoNode] canonical asset import failed:", _0x37f96c);
      return null;
    }).finally(() => {
      if (this._canonicalAssetImportPromise === _0x3f8aba) {
        this._canonicalAssetImportPromise = null;
      }
    });
    this._canonicalAssetImportPromise = _0x3f8aba;
    return _0x3f8aba;
  }
  _requestVisibleProxyMigration() {
    this._requestCanonicalAssetImport();
    requestVisibleVideoProxyMigration(this.id).catch(_0x45d903 => {
      console.warn("[SourceVideoNode] failed to enqueue legacy proxy migration:", _0x45d903);
    });
  }
  _clearResolvedVideoTimer(_0x168ef2, _0x247056) {
    if (!_0x247056 || !_0x168ef2 || typeof _0x168ef2 !== "object") {
      return;
    }
    const _0x30177e = !!String(_0x168ef2.rhTaskId || _0x168ef2.asyncTaskId || _0x168ef2.dreaminaSubmitId || "").trim() || _0x168ef2.rhTaskRecovering === true || _0x168ef2.asyncTaskRecovering === true || _0x168ef2.dreaminaTaskRecovering === true;
    if (_0x30177e) {
      return;
    }
    if (!_0x168ef2.generationStartTime && _0x168ef2.generationDuration == null) {
      return;
    }
    const _0x5a9b5c = a521_0x473f31.getState().nodes?.[this.id];
    if (!_0x5a9b5c) {
      return;
    }
    const _0x1f2152 = {};
    if (_0x5a9b5c.generationStartTime) {
      _0x1f2152.generationStartTime = null;
    }
    if (_0x5a9b5c.generationDuration != null) {
      _0x1f2152.generationDuration = null;
    }
    if (_0x5a9b5c.isGenerating === true) {
      _0x1f2152.isGenerating = false;
    }
    if (Object.keys(_0x1f2152).length > 0) {
      a521_0x473f31.updateNodeData(this.id, _0x1f2152);
    }
  }
  _clearMediaUnavailableAfterPlayback(_0x3accbc) {
    const _0x5e15a6 = a521_0x473f31.getState().nodes?.[this.id] || this._data || null;
    if (!_0x5e15a6 || _0x5e15a6.mediaUnavailable !== true) {
      return;
    }
    const _0x489db1 = String(_0x5e15a6.mediaUnavailableSource || "").trim();
    if (!_0x489db1) {
      return;
    }
    const _0xdfae81 = new Set();
    const _0x29c91d = _0xb12929 => {
      const _0x58fdaa = String(_0xb12929 || "").trim();
      if (!_0x58fdaa) {
        return;
      }
      _0xdfae81.add(_0x58fdaa);
      const _0x3d56ea = urlToLocalPath(_0x58fdaa);
      if (_0x3d56ea) {
        _0xdfae81.add(_0x3d56ea);
      }
      const _0x363eb6 = localPathToUrl(_0x58fdaa);
      if (_0x363eb6) {
        _0xdfae81.add(_0x363eb6);
      }
    };
    [_0x5e15a6.localPath, _0x5e15a6.displayLocalPath, _0x5e15a6.originalLocalPath, _0x5e15a6.videoLocalPath, _0x5e15a6.videoUrl, _0x5e15a6.src, _0x5e15a6.url, _0x5e15a6.resultUrl, _0x5e15a6.sourceUrl, _0x3accbc].forEach(_0x29c91d);
    if (!_0xdfae81.has(_0x489db1)) {
      return;
    }
    a521_0x473f31.updateNodeData(this.id, {
      mediaUnavailable: false,
      mediaUnavailableSource: ""
    });
  }
  _getCapturePreviewUrl(_0x540c82 = this._data) {
    const _0x3f0dfc = String(_0x540c82?.capturePreviewUrl || "").trim();
    if (_0x3f0dfc.startsWith("blob:") || _0x3f0dfc.startsWith("aic-local-preview:")) {
      return _0x3f0dfc;
    } else {
      return "";
    }
  }
  _revokeCapturePreviewUrl(_0x2d1397) {
    const _0x1700fe = String(_0x2d1397 || "").trim();
    if (!_0x1700fe.startsWith("blob:")) {
      return;
    }
    const _0x3c02c6 = globalThis.window?.URL || globalThis.URL;
    if (typeof _0x3c02c6?.revokeObjectURL !== "function") {
      return;
    }
    try {
      _0x3c02c6.revokeObjectURL(_0x1700fe);
    } catch {}
  }
  _adoptCapturePreviewUrl(_0x5aa710) {
    const _0x109fcf = String(_0x5aa710 || "").trim();
    if (this._activeCapturePreviewUrl && this._activeCapturePreviewUrl !== _0x109fcf) {
      this._revokeCapturePreviewUrl(this._activeCapturePreviewUrl);
    }
    this._activeCapturePreviewUrl = _0x109fcf;
  }
  _releaseActiveCapturePreviewUrl() {
    if (!this._activeCapturePreviewUrl) {
      return;
    }
    const _0x204cb2 = this._activeCapturePreviewUrl;
    this._activeCapturePreviewUrl = "";
    this._revokeCapturePreviewUrl(_0x204cb2);
  }
  _clearStoredCapturePreviewAfterSourcePromotion(_0x13d7d6) {
    const _0x1a3cab = String(_0x13d7d6 || "").trim();
    const _0x214440 = this._getCapturePreviewUrl(this._data);
    if (!_0x1a3cab || !_0x214440 || _0x1a3cab === _0x214440) {
      return false;
    }
    const _0x476662 = a521_0x473f31.getStateRaw().nodes?.[this.id];
    if (!_0x476662 || this._getCapturePreviewUrl(_0x476662) !== _0x214440) {
      return false;
    }
    a521_0x473f31.updateNodeData(this.id, {
      capturePreviewUrl: ""
    });
    this._data = {
      ..._0x476662,
      capturePreviewUrl: ""
    };
    return true;
  }
  _shouldKeepReadyCapturePreview(_0x1e2cc2) {
    const _0x1005fa = String(this._activeCapturePreviewUrl || "").trim();
    const _0x825332 = String(_0x1e2cc2 || "").trim();
    if (!_0x1005fa || !this._video || Number(this._video.readyState || 0) < 2) {
      return false;
    }
    const _0x4a0dbb = getVideoCurrentSource(this._video);
    const _0x1d638a = this._currentSrc === _0x1005fa || _0x4a0dbb === _0x1005fa;
    if (!_0x1d638a) {
      return false;
    }
    if (!_0x825332) {
      return this._isUploading === true;
    }
    if (_0x825332 === _0x1005fa || /^(?:blob:|aic-local-preview:)/i.test(_0x825332)) {
      return false;
    }
    return true;
  }
  _resolveVideoMetaSrc(_0x50ca47) {
    if (!_0x50ca47) {
      return "";
    }
    const _0x2a3086 = resolveSourceVideoMediaTaskSrc(_0x50ca47);
    if (_0x2a3086) {
      return _0x2a3086;
    }
    const _0x314de3 = this._resolveVideoSrc(_0x50ca47);
    if (!_0x314de3) {
      return "";
    }
    const _0x54eed5 = String(_0x314de3);
    if (_0x54eed5.startsWith("http://") || _0x54eed5.startsWith("https://") || _0x54eed5.startsWith("blob:") || _0x54eed5.startsWith("aic-local-preview:") || _0x54eed5.startsWith("data:")) {
      return "";
    }
    return urlToLocalPath(_0x54eed5) || "";
  }
  requestVideoMetaForNodeInfo(_0x22d3fb = this._data) {
    const _0x39f580 = this._resolveVideoMetaSrc(_0x22d3fb);
    if (!_0x39f580) {
      return null;
    }
    const _0x448b2e = Date.now();
    if (this._videoMetaInfoRequestSrc === _0x39f580 && _0x448b2e - Number(this._videoMetaInfoRequestAt || 0) < 5000) {
      return this._metaFetchPromise || null;
    }
    this._videoMetaInfoRequestSrc = _0x39f580;
    this._videoMetaInfoRequestAt = _0x448b2e;
    this._cancelDeferredVideoMetaFetch();
    return this._maybeFetchVideoMeta(_0x22d3fb);
  }
  _cancelDeferredVideoMetaFetch() {
    if (!this._deferredVideoMetaCancel) {
      return;
    }
    this._deferredVideoMetaCancel();
    this._deferredVideoMetaCancel = null;
  }
  _scheduleDeferredVideoMetaFetch(_0x542591 = this._data) {
    this._cancelDeferredVideoMetaFetch();
    this._deferredVideoMetaCancel = scheduleSourceVideoIdleTask(() => {
      this._deferredVideoMetaCancel = null;
      const _0x2584e2 = a521_0x473f31.getStateRaw().nodes?.[this.id] || _0x542591 || this._data;
      this._maybeFetchVideoMeta(_0x2584e2);
    });
  }
  async _maybeFetchVideoMeta(_0x40e699) {
    const _0x86e1c6 = this._getNodeDuration(_0x40e699) <= 0;
    if (!_0x86e1c6 && !shouldFetchVideoMetaForNodeInfo()) {
      return;
    }
    const _0x4ed7e8 = this._resolveVideoMetaSrc(_0x40e699);
    if (!_0x4ed7e8) {
      return;
    }
    const _0x4ab6d4 = a521_0x473f31.getState().nodes[this.id];
    if (!_0x4ab6d4) {
      return;
    }
    if (this._resolveVideoMetaSrc(_0x4ab6d4) !== _0x4ed7e8) {
      return;
    }
    const _0x3564e7 = String(_0x4ab6d4.videoMetaSrc || "");
    const _0x4373ab = Number.isFinite(Number(_0x4ab6d4.videoFps)) && Number(_0x4ab6d4.videoFps) > 0 && Number.isFinite(Number(_0x4ab6d4.videoFrameCount)) && Number(_0x4ab6d4.videoFrameCount) > 0;
    if (_0x4373ab && _0x3564e7 === _0x4ed7e8) {
      return;
    }
    if (this._metaFetchPromise && this._metaFetchSrc === _0x4ed7e8) {
      return this._metaFetchPromise;
    }
    if (_0x3564e7 && _0x3564e7 !== _0x4ed7e8) {
      a521_0x473f31.updateNodeData(this.id, {
        videoMetaSrc: _0x4ed7e8,
        videoFps: null,
        videoFrameCount: null
      });
    }
    const _0x53ab85 = ++this._metaFetchToken;
    const _0x44a3a7 = (async () => {
      try {
        const _0x539cd2 = await fetchVideoMetaFromServer(_0x4ed7e8);
        if (_0x53ab85 !== this._metaFetchToken) {
          return;
        }
        if (!_0x539cd2 || _0x539cd2.success !== true) {
          return;
        }
        const _0x3a773f = Number(_0x539cd2.fps);
        const _0x5dafc3 = Number(_0x539cd2.frameCount);
        const _0x49237a = Number(_0x539cd2.duration);
        const _0x2d5886 = Number(_0x539cd2.width);
        const _0x1aa532 = Number(_0x539cd2.height);
        const _0x699f0a = {
          videoMetaSrc: _0x4ed7e8
        };
        if (Number.isFinite(_0x3a773f) && _0x3a773f > 0) {
          _0x699f0a.videoFps = _0x3a773f;
        }
        if (Number.isFinite(_0x5dafc3) && _0x5dafc3 > 0) {
          _0x699f0a.videoFrameCount = Math.round(_0x5dafc3);
        }
        if (Number.isFinite(_0x49237a) && _0x49237a > 0) {
          _0x699f0a.videoDuration = _0x49237a;
        }
        if (Number.isFinite(_0x2d5886) && _0x2d5886 > 0) {
          _0x699f0a.videoWidth = Math.round(_0x2d5886);
        }
        if (Number.isFinite(_0x1aa532) && _0x1aa532 > 0) {
          _0x699f0a.videoHeight = Math.round(_0x1aa532);
        }
        const _0x3b075e = a521_0x473f31.getState().nodes[this.id];
        if (!_0x3b075e) {
          return;
        }
        if (this._resolveVideoMetaSrc(_0x3b075e) !== _0x4ed7e8) {
          return;
        }
        const _0x575cdc = String(_0x3b075e.videoMetaSrc || "") !== String(_0x699f0a.videoMetaSrc || "") || Number(_0x3b075e.videoFps || 0) !== Number(_0x699f0a.videoFps || 0) || Number(_0x3b075e.videoFrameCount || 0) !== Number(_0x699f0a.videoFrameCount || 0) || Number(_0x3b075e.videoDuration || 0) !== Number(_0x699f0a.videoDuration || 0) || Number(_0x3b075e.videoWidth || 0) !== Number(_0x699f0a.videoWidth || 0) || Number(_0x3b075e.videoHeight || 0) !== Number(_0x699f0a.videoHeight || 0);
        if (_0x575cdc) {
          a521_0x473f31.updateNodeData(this.id, _0x699f0a);
        }
      } catch {} finally {
        if (this._metaFetchPromise === _0x44a3a7) {
          this._metaFetchPromise = null;
          this._metaFetchSrc = "";
        }
      }
    })();
    this._metaFetchSrc = _0x4ed7e8;
    this._metaFetchPromise = _0x44a3a7;
    return _0x44a3a7;
  }
  _scheduleMaybeEnsureVideoThumb() {
    if (this._idleVideoThumbCancel) {
      return;
    }
    this._idleVideoThumbCancel = scheduleSourceVideoIdleTask(() => {
      this._idleVideoThumbCancel = null;
      this._maybeEnsureVideoThumb(this._data);
    });
  }
  async _maybeEnsureVideoThumb(_0x35e446) {
    if (isSourceVideoInteractionBusy()) {
      this._scheduleMaybeEnsureVideoThumb();
      return;
    }
    const _0x4ecaf3 = this._resolveVideoMetaSrc(_0x35e446);
    if (!_0x4ecaf3) {
      return;
    }
    const _0x4188ee = a521_0x473f31.getState().nodes[this.id];
    if (!_0x4188ee) {
      return;
    }
    const _0x3e0a21 = String(_0x4188ee.videoThumbSrc || "");
    const _0x216733 = !!String(_0x4188ee.thumbUrl || "").trim();
    if (_0x216733 && _0x3e0a21 === _0x4ecaf3) {
      return;
    }
    if (_0x3e0a21 === _0x4ecaf3 && ["waiting", "processing"].includes(String(_0x4188ee.mediaTaskStatus || "")) && ["videoFirstFrame", "videoPoster"].includes(String(_0x4188ee.mediaTaskKind || ""))) {
      return;
    }
    if (_0x3e0a21 && _0x3e0a21 !== _0x4ecaf3) {
      a521_0x473f31.updateNodeData(this.id, {
        videoThumbSrc: _0x4ecaf3
      });
    } else if (!_0x3e0a21) {
      a521_0x473f31.updateNodeData(this.id, {
        videoThumbSrc: _0x4ecaf3
      });
    }
    const _0x10f635 = ++this._thumbFetchToken;
    try {
      const _0x34bb9f = await fetchVideoFirstFrameThumbFromServer(_0x4ecaf3, {
        nodeId: this.id,
        assetId: String(_0x4188ee.assetId || "")
      });
      if (_0x10f635 !== this._thumbFetchToken) {
        return;
      }
      if (!_0x34bb9f || _0x34bb9f.success === false) {
        return;
      }
      const _0x912224 = String(_0x34bb9f.thumbUrl || _0x34bb9f.url || "").trim();
      if (!_0x912224) {
        return;
      }
      const _0x45304b = a521_0x473f31.getState().nodes[this.id];
      if (!_0x45304b) {
        return;
      }
      const _0x45bfb2 = String(_0x45304b.videoThumbSrc || "") !== String(_0x4ecaf3 || "") || String(_0x45304b.thumbUrl || "") !== _0x912224;
      if (_0x45bfb2) {
        a521_0x473f31.updateNodeData(this.id, {
          videoThumbSrc: _0x4ecaf3,
          thumbUrl: _0x912224
        });
      }
    } catch {}
  }
  _getBaseDuration() {
    const _0x56a99d = this._video;
    if (!_0x56a99d) {
      return 0;
    }
    const _0x403644 = Number(_0x56a99d.duration);
    if (Number.isFinite(_0x403644) && _0x403644 > 0) {
      return _0x403644;
    }
    const _0x2156c9 = _0x56a99d.seekable;
    if (_0x2156c9 && _0x2156c9.length) {
      const _0x4d55a0 = Number(_0x2156c9.end(_0x2156c9.length - 1));
      if (Number.isFinite(_0x4d55a0) && _0x4d55a0 > 0) {
        return _0x4d55a0;
      }
    }
    return 0;
  }
  _getClipRange(_0x1bdeca) {
    const _0x502c2c = Number(_0x1bdeca);
    if (!Number.isFinite(_0x502c2c) || _0x502c2c <= 0) {
      return {
        active: false,
        start: 0,
        end: 0
      };
    }
    const _0xcec8eb = Number(this._data?.clipStart);
    const _0x28d95f = Number(this._data?.clipEnd);
    if (!Number.isFinite(_0xcec8eb) || !Number.isFinite(_0x28d95f) || !(_0x28d95f > _0xcec8eb)) {
      return {
        active: false,
        start: 0,
        end: _0x502c2c
      };
    }
    const _0x1178ac = Math.max(0, Math.min(_0x502c2c, _0xcec8eb));
    const _0x41c8ab = Math.max(0, Math.min(_0x502c2c, _0x28d95f));
    if (!(_0x41c8ab > _0x1178ac)) {
      return {
        active: false,
        start: 0,
        end: _0x502c2c
      };
    }
    return {
      active: true,
      start: _0x1178ac,
      end: _0x41c8ab
    };
  }
  _requestProgressFrame(_0x456cae) {
    const _0x271eef = globalThis.window?.requestAnimationFrame || globalThis.requestAnimationFrame;
    if (typeof _0x271eef === "function") {
      return _0x271eef.call(globalThis.window || globalThis, _0x456cae);
    }
    return setTimeout(_0x456cae, 16);
  }
  _cancelProgressFrame(_0x2eb9ee) {
    const _0x5c89f8 = globalThis.window?.cancelAnimationFrame || globalThis.cancelAnimationFrame;
    if (typeof _0x5c89f8 === "function") {
      _0x5c89f8.call(globalThis.window || globalThis, _0x2eb9ee);
      return;
    }
    clearTimeout(_0x2eb9ee);
  }
  _cancelProgressLoop() {
    if (!this._progressRaf) {
      return;
    }
    this._cancelProgressFrame(this._progressRaf);
    this._progressRaf = 0;
  }
  _startProgressLoop() {
    if (this._progressRaf || !this._video || this._video.paused) {
      return;
    }
    const _0x39c02d = () => {
      this._progressRaf = 0;
      this._syncVideoProgressUi();
      if (!this._video || this._video.paused || this._video.ended) {
        return;
      }
      this._progressRaf = this._requestProgressFrame(_0x39c02d);
    };
    this._progressRaf = this._requestProgressFrame(_0x39c02d);
  }
  _syncVideoProgressUi() {
    if (!this._video || !this._fill || !this._timeCurrent || !this._timeTotal) {
      return;
    }
    if (this._isSeeking || this._bar && this._bar.dataset.dragging === "true") {
      return;
    }
    const _0x5b0861 = this._getBaseDuration();
    if (!_0x5b0861 || !Number.isFinite(_0x5b0861)) {
      return;
    }
    const _0x513d73 = this._getClipRange(_0x5b0861);
    const _0x2ac97b = _0x513d73.active ? Math.max(0, _0x513d73.end - _0x513d73.start) : _0x5b0861;
    if (!_0x2ac97b || !Number.isFinite(_0x2ac97b)) {
      return;
    }
    let _0xa18374 = this._video.currentTime || 0;
    if (_0x513d73.active) {
      if (_0xa18374 < _0x513d73.start) {
        this._video.currentTime = _0x513d73.start;
        _0xa18374 = _0x513d73.start;
      } else if (_0xa18374 > _0x513d73.end - 0.03) {
        this._video.currentTime = _0x513d73.start;
        _0xa18374 = _0x513d73.start;
      }
    }
    const _0x282d7d = _0x513d73.active ? Math.max(0, Math.min(_0x2ac97b, _0xa18374 - _0x513d73.start)) : _0xa18374;
    this._fill.style.width = _0x282d7d / _0x2ac97b * 100 + "%";
    const _0x196442 = this._fmt(_0x282d7d);
    const _0x5d7a5c = this._fmt(_0x2ac97b);
    if (this._timeCurrent.textContent !== _0x196442) {
      this._timeCurrent.textContent = _0x196442;
    }
    if (this._timeTotal.textContent !== _0x5d7a5c) {
      this._timeTotal.textContent = _0x5d7a5c;
    }
  }
  _setManualLoopPlayback(_0x10b0ea) {
    this._isManualLoopPlayback = _0x10b0ea === true;
    if (!this._video) {
      return;
    }
    if (!this._isManualLoopPlayback) {
      this._video.loop = false;
      return;
    }
    const _0x16b581 = this._getClipRange(this._getBaseDuration());
    this._video.loop = !_0x16b581.active;
  }
  _shouldKeepHoverPlaybackOnManualClick() {
    if (!this._video) {
      return false;
    }
    if (!this._isHovered || this._isManualControl || this._hoverManualPause) {
      return false;
    }
    return this._video.paused === false;
  }
  _toggleManualPlayback({
    loop = false,
    forcePlay = false
  } = {}) {
    if (!this._currentSrc) {
      return;
    }
    const _0x5d477e = this._ensureVideoElement();
    if (!_0x5d477e) {
      return;
    }
    this._isManualControl = true;
    this._syncPlaybackChromeVisibility();
    this._syncRendererPlaybackPin();
    this._autoPlayToken++;
    if (_0x5d477e.paused || forcePlay === true) {
      this._hoverManualPause = false;
      this._setManualLoopPlayback(loop === true);
      const _0x690c00 = this._getBaseDuration();
      const _0x1297fa = this._getClipRange(_0x690c00);
      if (_0x1297fa.active) {
        const _0x579bb7 = _0x5d477e.currentTime || 0;
        if (_0x579bb7 < _0x1297fa.start || _0x579bb7 > _0x1297fa.end) {
          _0x5d477e.currentTime = _0x1297fa.start;
        }
      }
      this._playVideoWithRecovery("manual", () => this._isManualControl).then(_0x114f7a => {
        if (_0x114f7a) {
          this._flashCenterIndicator("play");
        } else {
          this._setManualLoopPlayback(false);
          this._syncPlaybackChromeVisibility();
          this._syncRendererPlaybackPin();
        }
      });
    } else {
      this._hoverManualPause = true;
      this._setManualLoopPlayback(false);
      _0x5d477e.pause();
      this._flashCenterIndicator("pause");
      this._syncRendererPlaybackPin();
    }
  }
  _getPlaybackLabel(_0x32b4cc = "preview") {
    return "source-video:" + this.id + ":" + _0x32b4cc;
  }
  _openFullscreenFromCurrentVideo() {
    const _0x7f82ae = String(this._resolveVideoSrc(this._data) || this._video?.dataset?.desktopMediaSourceUrl || this._currentSrc || "").trim();
    if (!_0x7f82ae) {
      return null;
    }
    return openSourceVideoFullscreenPreview({
      nodeData: this._data,
      previewUrl: _0x7f82ae,
      previewPlaybackUrl: getVideoCurrentSource(this._video),
      currentTime: Number(this._video?.currentTime || 0),
      muted: !!this._isMuted
    });
  }
  async _ensurePlaybackVideoSrc({
    forPlayback = false,
    preload = forPlayback ? "auto" : SOURCE_VIDEO_POSTER_PRELOAD
  } = {}) {
    const _0x38e02b = this._ensureVideoElement();
    if (!_0x38e02b) {
      return false;
    }
    this._applyPendingPlaybackSourceAtBoundary();
    const _0x4c8b82 = String(this._currentSrc || this._resolveVideoSrc(this._data) || "").trim();
    if (!_0x4c8b82) {
      return false;
    }
    if (isMediaElementPlaybackSource(_0x38e02b, _0x4c8b82)) {
      if (forPlayback && _0x38e02b.preload !== preload) {
        _0x38e02b.preload = preload;
      }
      return true;
    }
    if (this._isHardMissingPlaybackSource(_0x4c8b82)) {
      this._applyHardMissingPlaybackState(_0x4c8b82, this._hardMissingPlaybackStatus);
      return false;
    }
    if (this._playbackSourcePromise && this._playbackSourcePromiseSource === _0x4c8b82) {
      return this._playbackSourcePromise;
    }
    const _0x3b113e = Number(this._playbackSourceToken || 0);
    const _0xc445ea = (async () => {
      this._currentSrc = _0x4c8b82;
      const _0x2d6731 = forPlayback ? await this._resolveLocalPlaybackObjectUrl(_0x4c8b82, {
        resultMode: "typed"
      }) : "";
      const _0x31be2f = typeof _0x2d6731 === "string" ? _0x2d6731 : String(_0x2d6731?.playbackUrl || "");
      const _0xdb0b2b = typeof _0x2d6731 === "string" ? _0x31be2f ? "ready" : "fallback" : String(_0x2d6731?.status || "fallback");
      if (this._currentSrc !== _0x4c8b82 || this._rendererMediaDeferred === true || Number(this._playbackSourceToken || 0) !== _0x3b113e) {
        return false;
      }
      if (_0xdb0b2b === "hard-missing") {
        this._applyHardMissingPlaybackState(_0x4c8b82, _0x2d6731?.httpStatus);
        return false;
      }
      if (_0xdb0b2b === "aborted") {
        return false;
      }
      globalThis.window?.__runtimeCompareMark?.("source-video-playback:attach", {
        nodeId: this.id,
        sourceUrl: _0x4c8b82,
        playbackUrl: _0x31be2f
      });
      const _0x2ab1ed = this._rendererMediaSlotToken;
      let _0x2d6830 = false;
      const _0x313578 = () => {
        _0x2d6830 = this._armFirstVideoFramePresentation(_0x4c8b82, _0x2ab1ed) || _0x2d6830;
      };
      const _0x41ce40 = () => this._video === _0x38e02b && this._currentSrc === _0x4c8b82 && this._rendererMediaDeferred !== true && Number(this._playbackSourceToken || 0) === _0x3b113e;
      const _0x1034d0 = await attachMediaElementPlaybackSource(_0x38e02b, _0x4c8b82, {
        playbackUrl: _0x31be2f,
        preload: preload,
        warmRanges: false,
        load: forPlayback || !forPlayback && !isDesktopRenderer(),
        onSourceAssigned: _0x313578,
        shouldAssign: _0x41ce40
      });
      if (!_0x1034d0 || !_0x41ce40()) {
        return false;
      }
      if (!_0x2d6830) {
        _0x313578();
      }
      return true;
    })();
    this._playbackSourcePromise = _0xc445ea;
    this._playbackSourcePromiseSource = _0x4c8b82;
    try {
      return await _0xc445ea;
    } finally {
      if (this._playbackSourcePromise === _0xc445ea) {
        this._playbackSourcePromise = null;
        this._playbackSourcePromiseSource = "";
      }
    }
  }
  _attachPlaybackRecovery(_0xefa9cc = "hover") {
    if (!this._video) {
      return null;
    }
    const _0xc58b80 = _0xefa9cc === "hover" || _0xefa9cc === "fullscreen";
    return attachVideoPlaybackRecovery(this._video, {
      label: this._getPlaybackLabel(_0xefa9cc),
      ensureSrc: () => this._ensurePlaybackVideoSrc({
        forPlayback: true,
        preload: _0xefa9cc === "hover" ? "metadata" : "auto"
      }),
      minBufferAhead: _0xc58b80 ? 0.5 : undefined,
      readyTimeoutMs: _0xc58b80 ? 350 : undefined,
      recoveryDebounceMs: _0xc58b80 ? 150 : undefined,
      recoveryCooldownMs: _0xc58b80 ? 500 : undefined,
      shouldRecover: () => this._video?.isConnected !== false && (this._isHovered || this._isManualControl || !this._video?.paused)
    });
  }
  async _playVideoWithRecovery(_0x4e6bc1, _0x563dcf) {
    const _0x4f0735 = this._ensureVideoElement();
    if (!_0x4f0735) {
      return false;
    }
    this._attachPlaybackRecovery(_0x4e6bc1);
    return playVideoWithRecovery(_0x4f0735, {
      label: this._getPlaybackLabel(_0x4e6bc1),
      playbackIntent: _0x4e6bc1,
      ensureSrc: () => this._ensurePlaybackVideoSrc({
        forPlayback: true,
        preload: _0x4e6bc1 === "hover" ? "metadata" : "auto"
      }),
      minBufferAhead: _0x4e6bc1 === "hover" ? 0.5 : undefined,
      readyTimeoutMs: _0x4e6bc1 === "hover" ? 350 : undefined,
      recoveryDebounceMs: _0x4e6bc1 === "hover" ? 150 : undefined,
      recoveryCooldownMs: _0x4e6bc1 === "hover" ? 500 : undefined,
      shouldRecover: () => this._video?.isConnected !== false && (this._isHovered || this._isManualControl || !this._video?.paused),
      shouldContinue: _0x563dcf
    });
  }
  _loadVideo(_0x1f34a5, {
    forceCapturePreviewPromotion = false,
    resumePlaybackTime = null
  } = {}) {
    const _0x15d22e = String(_0x1f34a5 || "").trim();
    this._replacePendingPlaybackResume(_0x15d22e, resumePlaybackTime);
    const _0x1be99a = String(this._currentSrc || "").trim();
    if (_0x15d22e !== _0x1be99a) {
      this._playbackSourceToken = Number(this._playbackSourceToken || 0) + 1;
    }
    const _0x37e2fd = forceCapturePreviewPromotion === true;
    if (forceCapturePreviewPromotion !== true && this._shouldKeepReadyCapturePreview(_0x15d22e)) {
      this._prepareRendererMediaSlotSource(_0x15d22e);
      this._applyVideoPoster(this._data);
      stopLoading(this._card);
      this._syncVideoElementFrameVisibility();
      return;
    }
    if (this._rendererMediaDeferred === true) {
      const _0x3debcc = _0x15d22e !== String(this._currentSrc || "").trim();
      this._currentSrc = _0x15d22e;
      this._prepareRendererMediaSlotSource(_0x15d22e);
      this._applyVideoPoster(this._data, {
        restoreNativePoster: !!_0x15d22e && _0x3debcc
      });
      return;
    }
    this._setManualLoopPlayback(false);
    const _0x89f7b9 = _0x15d22e !== String(this._currentSrc || "").trim();
    const _0x2d5b6d = this._applyVideoPoster(this._data, {
      restoreNativePoster: !!_0x15d22e && _0x89f7b9
    });
    if (!_0x15d22e) {
      this._currentSrc = "";
      this._prepareRendererMediaSlotSource("");
      this._setRendererPlaybackPin(false);
      const _0x343deb = shouldShowGenerationResultLoadingUi(this._data, {
        hasResult: false
      });
      if (this._idleVideoThumbCancel) {
        this._idleVideoThumbCancel();
        this._idleVideoThumbCancel = null;
      }
      this._loadVideoToken = null;
      this._releaseActiveCapturePreviewUrl();
      if (this._video) {
        this._video.onloadeddata = null;
        this._video.onerror = null;
        this._video.preload = "none";
        this._clearVideoElementSource({
          invalidateRendererSlot: false
        });
        this._video.style.display = "none";
      }
      this._setPosterFrameVisible(_0x343deb && !!_0x2d5b6d);
      if (_0x343deb) {
        startLoading(this._card, {
          variant: "full"
        });
      } else {
        stopLoading(this._card);
      }
      if (this._hint) {
        this._hint.style.display = _0x343deb ? "none" : "block";
      }
      this._syncPlaybackChromeVisibility({
        forceHidden: true
      });
      if (this._uploadBtn) {
        this._uploadBtn.disabled = _0x343deb;
      }
      return;
    }
    const _0x5e06ef = this._getCapturePreviewUrl(this._data);
    if (_0x15d22e === _0x5e06ef) {
      this._adoptCapturePreviewUrl(_0x15d22e);
    } else if (this._activeCapturePreviewUrl) {
      this._releaseActiveCapturePreviewUrl();
    }
    if (_0x15d22e !== _0x5e06ef) {
      this._clearStoredCapturePreviewAfterSourcePromotion(_0x15d22e);
    }
    this._currentSrc = _0x15d22e;
    this._prepareRendererMediaSlotSource(_0x15d22e);
    const _0x8ed97a = !!this._video && !!isMediaElementPlaybackSource(this._video, _0x15d22e);
    if (_0x2d5b6d) {
      if (this._idleVideoThumbCancel) {
        this._idleVideoThumbCancel();
        this._idleVideoThumbCancel = null;
      }
      this._loadVideoToken = null;
      if (this._video) {
        this._video.onloadeddata = null;
        this._video.onerror = null;
        const _0x148579 = getVideoCurrentSource(this._video);
        if (_0x148579 && !isMediaElementPlaybackSource(this._video, _0x15d22e)) {
          this._clearVideoElementSource({
            load: false,
            invalidateRendererSlot: false
          });
        }
        this._video.preload = "none";
        this._syncVideoElementFrameVisibility({
          forceHidden: !_0x8ed97a
        });
      }
      this._syncVideoDurationUi();
      if (!_0x37e2fd || this._card?.classList?.contains?.("img-preview-loading") !== true) {
        stopLoading(this._card);
      }
      this._syncPosterFrameVisibility(_0x8ed97a ? {} : {
        force: true
      });
      this._syncPlaybackChromeVisibility();
      if (this._hint) {
        this._hint.style.display = "block";
      }
      if (!_0x37e2fd) {
        return;
      }
    }
    let _0x1a6e8b = false;
    const _0x4340f0 = () => {
      if (_0x1a6e8b || this._currentSrc !== _0x15d22e) {
        return;
      }
      _0x1a6e8b = true;
      this._clearMediaUnavailableAfterPlayback(_0x15d22e);
      if (this._activeCapturePreviewUrl && this._activeCapturePreviewUrl !== _0x15d22e) {
        this._releaseActiveCapturePreviewUrl();
      }
      this._syncPlaybackChromeVisibility();
      if (this._hint) {
        this._hint.style.display = "block";
      }
      this._maybeEnsureVideoThumb(this._data);
      const _0x5ddaa8 = this._rendererMediaSlotToken;
      if (!this._armFirstVideoFramePresentation(_0x15d22e, _0x5ddaa8)) {
        stopLoading(this._card);
      }
      this._nudgePausedVideoForFirstFrame(_0x15d22e);
      this._syncPosterFrameVisibility();
    };
    if (!_0x37e2fd) {
      this._loadVideoToken = null;
      if (this._video && getVideoCurrentSource(this._video) && !_0x8ed97a) {
        this._clearVideoElementSource();
      }
      if (this._video) {
        this._video.onloadeddata = _0x4340f0;
        this._video.onerror = () => {
          if (this._currentSrc === _0x15d22e) {
            stopLoading(this._card);
          }
        };
        this._video.preload = "none";
        this._syncVideoElementFrameVisibility({
          forceHidden: !_0x8ed97a
        });
      }
      this._syncPosterFrameVisibility(_0x8ed97a ? {} : {
        force: !!_0x2d5b6d
      });
      this._syncPlaybackChromeVisibility();
      if (this._hint) {
        this._hint.style.display = "block";
      }
      stopLoading(this._card);
      this._scheduleMaybeEnsureVideoThumb();
      this._attachPlaybackRecovery();
      return;
    }
    const _0xa5da2b = this._ensureVideoElement();
    if (!_0xa5da2b) {
      stopLoading(this._card);
      return;
    }
    _0xa5da2b.onloadeddata = _0x4340f0;
    _0xa5da2b.onerror = () => {
      if (this._currentSrc === _0x15d22e) {
        stopLoading(this._card);
      }
    };
    startLoading(this._card, {
      variant: "full"
    });
    _0xa5da2b.style.display = "block";
    this._syncVideoElementFrameVisibility();
    if (_0x2d5b6d) {
      this._syncPosterFrameVisibility({
        force: true
      });
      this._syncPlaybackChromeVisibility();
    } else {
      this._setPosterFrameVisible(false);
      this._syncPlaybackChromeVisibility({
        forceHidden: true
      });
    }
    const _0x2a9854 = {};
    this._loadVideoToken = _0x2a9854;
    const _0x10af53 = () => {
      if (!this._video || this._loadVideoToken !== _0x2a9854 || this._currentSrc !== _0x15d22e) {
        return;
      }
      this._video.preload = "auto";
      if (!_0x2d5b6d && !isDesktopRenderer()) {
        this._video.src = _0x15d22e;
        this._armFirstVideoFramePresentation(_0x15d22e, this._rendererMediaSlotToken);
        try {
          this._video.load?.();
        } catch {}
        if (Number(this._video.readyState || 0) >= 2) {
          _0x4340f0();
        }
        return;
      }
      if (!_0x2d5b6d) {
        const _0x99f457 = this._rendererMediaSlotToken;
        let _0x4e9533 = false;
        const _0x4328e8 = () => {
          _0x4e9533 = this._armFirstVideoFramePresentation(_0x15d22e, _0x99f457) || _0x4e9533;
        };
        const _0x291abb = Number(this._playbackSourceToken || 0);
        const _0x419ff7 = this._video;
        const _0x10b939 = () => this._video === _0x419ff7 && this._loadVideoToken === _0x2a9854 && this._currentSrc === _0x15d22e && this._rendererMediaDeferred !== true && Number(this._playbackSourceToken || 0) === _0x291abb;
        attachMediaElementPlaybackSource(_0x419ff7, _0x15d22e, {
          preload: "auto",
          warmRanges: false,
          load: true,
          onSourceAssigned: _0x4328e8,
          shouldAssign: _0x10b939
        }).then(_0x565084 => {
          if (!_0x565084 || !_0x10b939()) {
            return;
          }
          if (!_0x4e9533) {
            _0x4328e8();
          }
          if (this._video && this._loadVideoToken === _0x2a9854 && this._currentSrc === _0x15d22e && Number(this._video.readyState || 0) >= 2) {
            _0x4340f0();
          }
        }).catch(() => {
          if (this._currentSrc === _0x15d22e) {
            stopLoading(this._card);
          }
        });
        return;
      }
      this._ensurePlaybackVideoSrc({
        forPlayback: true
      }).then(() => {
        if (this._video && this._loadVideoToken === _0x2a9854 && this._currentSrc === _0x15d22e && Number(this._video.readyState || 0) >= 2) {
          _0x4340f0();
        }
      }).catch(() => {
        if (this._currentSrc === _0x15d22e) {
          stopLoading(this._card);
        }
      });
    };
    _0x10af53();
    this._attachPlaybackRecovery();
    if (this._hint) {
      this._hint.style.display = "block";
    }
  }
  _fmt(_0xc00a91) {
    if (!_0xc00a91 || isNaN(_0xc00a91)) {
      return "0:00";
    }
    return Math.floor(_0xc00a91 / 60) + ":" + String(Math.floor(_0xc00a91 % 60)).padStart(2, "0");
  }
  _getNodeDuration(_0x77cbdc = this._data) {
    const _0x1a164e = Number(_0x77cbdc?.videoDuration || _0x77cbdc?.duration || 0);
    if (Number.isFinite(_0x1a164e) && _0x1a164e > 0) {
      return _0x1a164e;
    }
    const _0x1e466c = Number(_0x77cbdc?.videoFrameCount || _0x77cbdc?.frameCount || 0);
    const _0x145889 = Number(_0x77cbdc?.videoFps || _0x77cbdc?.fps || 0);
    if (Number.isFinite(_0x1e466c) && _0x1e466c > 0 && Number.isFinite(_0x145889) && _0x145889 > 0) {
      return _0x1e466c / _0x145889;
    }
    return 0;
  }
  _syncVideoDurationUi() {
    if (!this._timeTotal) {
      return;
    }
    const _0xb6da49 = this._getBaseDuration() || this._getNodeDuration(this._data);
    if (!_0xb6da49 || !Number.isFinite(_0xb6da49)) {
      this._timeTotal.textContent = "0:00";
      return;
    }
    const _0x48b272 = this._getClipRange(_0xb6da49);
    const _0x5033d6 = _0x48b272.active ? Math.max(0, _0x48b272.end - _0x48b272.start) : _0xb6da49;
    if (!_0x5033d6 || !Number.isFinite(_0x5033d6)) {
      this._timeTotal.textContent = "0:00";
      return;
    }
    this._timeTotal.textContent = this._fmt(_0x5033d6);
  }
  _setCenterIndicatorIcon(_0x3fc888) {
    if (!this._indicatorInner) {
      return;
    }
    const _0x33f44d = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    _0x33f44d.setAttribute("width", "28");
    _0x33f44d.setAttribute("height", "28");
    _0x33f44d.setAttribute("viewBox", "0 0 24 24");
    _0x33f44d.setAttribute("fill", "currentColor");
    _0x33f44d.style.color = "var(--canvas-white)";
    if (_0x3fc888 === "play") {
      _0x33f44d.innerHTML = "<polygon points=\"6 4 20 12 6 20 6 4\"></polygon>";
    } else {
      _0x33f44d.innerHTML = "<rect x=\"6\" y=\"5\" width=\"4\" height=\"14\" rx=\"1\"></rect><rect x=\"14\" y=\"5\" width=\"4\" height=\"14\" rx=\"1\"></rect>";
    }
    this._indicatorInner.innerHTML = "";
    this._indicatorInner.appendChild(_0x33f44d);
  }
  _showPausedCenterIndicator() {
    if (!this._indicatorInner) {
      return;
    }
    if (this._centerIndicatorTimer) {
      clearTimeout(this._centerIndicatorTimer);
      this._centerIndicatorTimer = null;
    }
    this._setCenterIndicatorIcon("play");
    this._indicatorInner.style.opacity = "1";
    this._indicatorInner.style.transform = "scale(1)";
  }
  _hideCenterIndicator() {
    if (!this._indicatorInner) {
      return;
    }
    if (this._centerIndicatorTimer) {
      clearTimeout(this._centerIndicatorTimer);
      this._centerIndicatorTimer = null;
    }
    this._indicatorInner.style.opacity = "0";
    this._indicatorInner.style.transform = "scale(0.92)";
  }
  _flashCenterIndicator(_0xb5a68) {
    if (!this._indicatorInner) {
      return;
    }
    if (this._centerIndicatorTimer) {
      clearTimeout(this._centerIndicatorTimer);
      this._centerIndicatorTimer = null;
    }
    this._setCenterIndicatorIcon(_0xb5a68);
    this._indicatorInner.style.opacity = "1";
    this._indicatorInner.style.transform = "scale(1)";
    this._centerIndicatorTimer = setTimeout(() => {
      if (!this._indicatorInner) {
        return;
      }
      if (_0xb5a68 === "pause") {
        this._showPausedCenterIndicator();
      } else {
        this._hideCenterIndicator();
      }
      this._centerIndicatorTimer = null;
    }, 520);
  }
  _updatePlayIcon(_0x1d61a0) {
    if (!this._playBtn) {
      return;
    }
    this._playBtn.replaceChildren();
    const _0x5abeaf = "http://www.w3.org/2000/svg";
    const _0x37a487 = document.createElementNS(_0x5abeaf, "svg");
    _0x37a487.setAttribute("width", "16");
    _0x37a487.setAttribute("height", "16");
    _0x37a487.setAttribute("viewBox", "0 0 24 24");
    _0x37a487.setAttribute("fill", "currentColor");
    if (_0x1d61a0) {
      const _0x32598d = document.createElementNS(_0x5abeaf, "polygon");
      _0x32598d.setAttribute("points", "5 3 19 12 5 21 5 3");
      _0x37a487.appendChild(_0x32598d);
    } else {
      const _0xe387eb = document.createElementNS(_0x5abeaf, "rect");
      _0xe387eb.setAttribute("x", "6");
      _0xe387eb.setAttribute("y", "4");
      _0xe387eb.setAttribute("width", "4");
      _0xe387eb.setAttribute("height", "16");
      const _0x2e3da8 = document.createElementNS(_0x5abeaf, "rect");
      _0x2e3da8.setAttribute("x", "14");
      _0x2e3da8.setAttribute("y", "4");
      _0x2e3da8.setAttribute("width", "4");
      _0x2e3da8.setAttribute("height", "16");
      _0x37a487.appendChild(_0xe387eb);
      _0x37a487.appendChild(_0x2e3da8);
    }
    this._playBtn.appendChild(_0x37a487);
  }
  async _captureFrame() {
    const _0xf2e52f = await this._ensurePlaybackVideoSrc();
    if (!_0xf2e52f || !this._video) {
      return;
    }
    await extractCurrentVideoFrameToImageNode({
      videoEl: this._video,
      anchorNodeId: this.id,
      fallbackDurationSec: this._getBaseDuration(),
      onMissingMetadata: _0x4b436a => this._maybeFetchVideoMeta(_0x4b436a),
      logPrefix: "[SourceVideoNode]"
    });
  }
  _computeGenerationDuration(_0x3df47c = this._data) {
    if (!_0x3df47c) {
      return 0;
    }
    if (typeof _0x3df47c.generationDuration === "number") {
      return _0x3df47c.generationDuration;
    }
    const _0x31f48b = Number(_0x3df47c.generationStartTime || 0);
    if (!Number.isFinite(_0x31f48b) || _0x31f48b <= 0) {
      return 0;
    }
    return Math.max(0, Date.now() - _0x31f48b);
  }
  _isRunningHubRecoverableTask(_0x379a1e = this._data) {
    if (!_0x379a1e || typeof _0x379a1e !== "object") {
      return false;
    }
    const _0x21633d = String(_0x379a1e.rhTaskId || "").trim();
    if (!_0x21633d) {
      return false;
    }
    const _0x26a9ff = String(_0x379a1e.rhTaskStatus || "").trim().toLowerCase();
    if (["success", "failed", "idle", "cancelled"].includes(_0x26a9ff)) {
      return false;
    }
    return isRunningHubVideoTask(_0x379a1e);
  }
  _syncRunningHubVideoTaskState(_0x51f57b = this._data) {
    if (!_0x51f57b || typeof _0x51f57b !== "object") {
      return false;
    }
    const _0x398c4d = buildRunningHubVideoTerminalStatePatch(_0x51f57b, _0x51f57b.rhTaskStatus, this._computeGenerationDuration(_0x51f57b));
    if (!_0x398c4d) {
      return false;
    }
    a521_0x473f31.updateNodeData(this.id, _0x398c4d);
    return true;
  }
  _isAsyncRecoverableTask(_0x11f7db = this._data) {
    if (!_0x11f7db || typeof _0x11f7db !== "object") {
      return false;
    }
    const _0xbe0c31 = String(_0x11f7db.asyncTaskId || "").trim();
    if (!_0xbe0c31) {
      return false;
    }
    const _0x2a7002 = String(_0x11f7db.asyncTaskProvider || _0x11f7db.provider || "").trim().toLowerCase();
    if (!_0x2a7002 || _0x2a7002 === "runninghubwf" || _0x2a7002 === "runninghub" || _0x2a7002 === "dreamina") {
      return false;
    }
    const _0x325785 = String(_0x11f7db.asyncTaskKind || "").trim().toLowerCase();
    if (_0x325785 && _0x325785 !== "video") {
      return false;
    }
    const _0x51dec2 = String(_0x11f7db.asyncTaskStatus || "").trim().toLowerCase();
    if (["success", "failed", "idle", "cancelled"].includes(_0x51dec2)) {
      return false;
    }
    return true;
  }
  _stopRunningHubRecovery(_0x5b5b70 = true) {
    try {
      this._rhResumeAbortController?.abort?.();
    } catch {}
    this._rhResumeAbortController = null;
    this._rhResumePromise = null;
    this._rhResumeTaskId = "";
    if (!_0x5b5b70) {
      return;
    }
    const _0x2ee004 = a521_0x473f31.getState().nodes?.[this.id];
    if (!_0x2ee004 || _0x2ee004.rhTaskRecovering !== true) {
      return;
    }
    a521_0x473f31.updateNodeData(this.id, {
      rhTaskRecovering: false
    });
  }
  _stopAsyncRecovery(_0x1bf8ed = true) {
    try {
      this._asyncResumeAbortController?.abort?.();
    } catch {}
    this._asyncResumeAbortController = null;
    this._asyncResumePromise = null;
    this._asyncResumeTaskId = "";
    if (!_0x1bf8ed) {
      return;
    }
    const _0x1912b7 = a521_0x473f31.getState().nodes?.[this.id];
    if (!_0x1912b7 || _0x1912b7.asyncTaskRecovering !== true) {
      return;
    }
    a521_0x473f31.updateNodeData(this.id, {
      asyncTaskRecovering: false
    });
  }
  _extractFirstVideoUrl(_0xe1adaf) {
    const _0x9bd68 = new Set();
    const _0x221919 = _0x1c9b07 => {
      if (_0x1c9b07 == null) {
        return "";
      }
      if (typeof _0x1c9b07 === "string") {
        const _0xb7dc02 = _0x1c9b07.trim();
        if (!_0xb7dc02) {
          return "";
        }
        if (_0xb7dc02.startsWith("http://") || _0xb7dc02.startsWith("https://") || _0xb7dc02.startsWith("/")) {
          return _0xb7dc02;
        }
        if (_0xb7dc02.startsWith("{") || _0xb7dc02.startsWith("[")) {
          try {
            return _0x221919(JSON.parse(_0xb7dc02));
          } catch {
            return "";
          }
        }
        const _0x15cd97 = _0xb7dc02.match(/https?:\/\/[^\s"'<>]+/);
        if (_0x15cd97 && _0x15cd97[0]) {
          return _0x15cd97[0];
        } else {
          return "";
        }
      }
      if (typeof _0x1c9b07 !== "object") {
        return "";
      }
      if (_0x9bd68.has(_0x1c9b07)) {
        return "";
      }
      _0x9bd68.add(_0x1c9b07);
      if (Array.isArray(_0x1c9b07)) {
        for (const _0xf604c7 of _0x1c9b07) {
          const _0x5a3065 = _0x221919(_0xf604c7);
          if (_0x5a3065) {
            return _0x5a3065;
          }
        }
        return "";
      }
      const _0x41cf91 = ["url", "videoUrl", "video_url", "fileUrl", "file_url", "download_url", "output", "result", "data", "results", "outputs"];
      for (const _0x574e94 of _0x41cf91) {
        const _0x57fc1a = _0x221919(_0x1c9b07[_0x574e94]);
        if (_0x57fc1a) {
          return _0x57fc1a;
        }
      }
      return "";
    };
    return _0x221919(_0xe1adaf);
  }
  _toLocalPathIfSameOrigin(_0x236250) {
    return urlToLocalPath(_0x236250);
  }
  async _saveVideoToOutput(_0x385b3) {
    const _0x4bba1e = String(_0x385b3 || "").trim();
    const _0x4b1aa0 = this._toLocalPathIfSameOrigin(_0x4bba1e);
    if (_0x4b1aa0) {
      return _0x4b1aa0;
    }
    if (!isClientFetchableMediaUrl(_0x4bba1e)) {
      return "";
    }
    let _0x1eb877 = "";
    try {
      const _0x38ff15 = new AbortController();
      const _0x4f6c7d = setTimeout(() => _0x38ff15.abort(), 120000);
      let _0xdd7ea8 = null;
      try {
        _0xdd7ea8 = await fetchRemoteBlob(_0x4bba1e, {
          signal: _0x38ff15.signal
        });
      } finally {
        clearTimeout(_0x4f6c7d);
      }
      const _0xceca84 = await saveOutputToServer(_0xdd7ea8, {
        ext: "mp4"
      });
      if (_0xceca84?.success) {
        _0x1eb877 = pickResultLocalPath(_0xceca84);
      }
    } catch (_0x5c7043) {
      const _0x1dc4e2 = _0x5c7043 instanceof Error ? _0x5c7043.message : String(_0x5c7043 || "");
      const _0x208837 = _0x1dc4e2.includes("Failed to fetch") || _0x1dc4e2.includes("NetworkError") || _0x1dc4e2.toLowerCase().includes("cors");
      if (_0x208837 && /^https?:\/\//i.test(_0x4bba1e)) {
        const _0xab2e72 = await saveOutputFromUrlToServer({
          url: _0x4bba1e,
          ext: "mp4"
        });
        _0x1eb877 = pickResultLocalPath(_0xab2e72);
      }
    }
    return _0x1eb877;
  }
  async _buildRecoveredVideoResultPatch(_0x4c6dbd) {
    let _0x167ddc = buildCanvasLocalVideoFields(_0x4c6dbd);
    if (_0x167ddc.src && _0x167ddc.localPath) {
      return _0x167ddc;
    }
    const _0x63db40 = this._extractFirstVideoUrl(_0x4c6dbd);
    if (!_0x63db40) {
      throw new Error(sourceVideoText("recovery.noOutputVideoUrl"));
    }
    const _0x410cd2 = this._toLocalPathIfSameOrigin(_0x63db40) || (await this._saveVideoToOutput(_0x63db40));
    _0x167ddc = buildCanvasLocalVideoFields({
      localPath: _0x410cd2,
      videoUrl: _0x63db40
    });
    if (!_0x167ddc.src || !_0x167ddc.localPath) {
      throw new Error(sourceVideoText("recovery.noOutputVideoUrl"));
    }
    return _0x167ddc;
  }
  _resolveAsyncResumePayload(_0x3e655b) {
    return {
      model: String(_0x3e655b?.model || "").trim(),
      provider: String(_0x3e655b?.asyncTaskProvider || _0x3e655b?.provider || "").trim()
    };
  }
  _maybeResumeRunningHubTask() {
    const _0x1b853b = a521_0x473f31.getStateRaw().nodes?.[this.id] || this._data;
    if (!this._isRunningHubRecoverableTask(_0x1b853b)) {
      this._stopRunningHubRecovery(true);
      return;
    }
    const _0x14e1cf = String(_0x1b853b?.rhTaskId || "").trim();
    if (!_0x14e1cf) {
      return;
    }
    if (this._rhResumePromise && this._rhResumeTaskId === _0x14e1cf) {
      return;
    }
    const _0x595148 = Number(_0x1b853b?.rhTaskStartedAt || _0x1b853b?.generationStartTime || 0) || Date.now();
    const _0x47897b = String(_0x1b853b?.model || "").trim().toLowerCase();
    const _0x527292 = _0x1b853b?.rhTaskUseOpenapiQuery === true;
    const _0x38018e = getVideoMattingModelId();
    const _0x9032f3 = _0x47897b === _0x38018e;
    const _0x48293 = String(_0x1b853b?.taskProviderProfileId || _0x1b853b?.providerProfileId || _0x1b853b?.rhProviderProfileId || "").trim();
    const _0x538f4d = {
      provider: _0x9032f3 ? "runninghubwf" : String(_0x1b853b?.provider || "runninghubwf").trim() || "runninghubwf",
      model: _0x9032f3 ? _0x38018e : String(_0x1b853b?.model || "").trim(),
      ...(_0x48293 ? {
        providerProfileId: _0x48293,
        rhProviderProfileId: _0x48293
      } : {})
    };
    const _0x3bb18f = typeof this._resumeRunningHubTaskPoller === "function" ? this._resumeRunningHubTaskPoller : null;
    const _0xd7f61e = new AbortController();
    this._rhResumeAbortController = _0xd7f61e;
    this._rhResumeTaskId = _0x14e1cf;
    const _0x2ad6b8 = (async () => {
      try {
        const _0x5a5bc2 = await resumeTask({
          sourceNodeId: this.id,
          targetNodeId: this.id,
          trigger: "node",
          taskType: "video-generation",
          provider: _0x538f4d.provider || _0x1b853b?.provider || "runninghubwf",
          adapterType: "workflow",
          modelId: _0x538f4d.model || _0x1b853b?.model || "",
          executionId: "runninghub.source-video." + (_0x538f4d.model || _0x1b853b?.model || "workflow"),
          payload: _0x538f4d,
          taskId: _0x14e1cf,
          cancellable: false,
          resumable: true,
          pauseOnAbort: true,
          startBuilder: () => ({
            rhTaskStatus: String(_0x1b853b?.rhTaskStatus || "").trim().toLowerCase() === "pending" ? "pending" : "running",
            rhTaskUseOpenapiQuery: _0x527292
          }),
          poll: async () => {
            if (_0x3bb18f) {
              return _0x3bb18f(_0x14e1cf, _0x1b853b, {
                signal: _0xd7f61e.signal,
                payload: _0x538f4d,
                useOpenapiQuery: _0x527292
              });
            }
            if (_0x9032f3) {
              return resumeRunningHubVideoTask(_0x14e1cf, _0x538f4d, {
                signal: _0xd7f61e.signal,
                useOpenapiQuery: _0x527292
              });
            }
            await ensureConfig();
            const _0x5c90ae = getProviderConfig(_0x538f4d.providerProfileId || "runninghubwf");
            const _0x231e8b = String(_0x5c90ae?.apiKey || "").trim();
            if (!_0x231e8b) {
              throw new Error(sourceVideoText("recovery.runninghubApiKeyMissing"));
            }
            return resumeRunninghubWorkflowTask({
              apiKey: _0x231e8b,
              taskId: _0x14e1cf,
              providerProfileId: _0x538f4d.providerProfileId,
              runningHubApiUrl: _0x5c90ae?.apiUrl
            }, {
              signal: _0xd7f61e.signal,
              useOpenapiQuery: _0x527292
            });
          },
          resultBuilder: async _0x10d778 => {
            const _0xab840f = a521_0x473f31.getState().nodes?.[this.id] || {};
            const _0x2779d2 = resolveRunningHubVideoStatusName(_0xab840f, "success") || (_0xab840f?.name?.includes(sourceVideoText("result.hdVideo")) ? sourceVideoText("result.hdVideo") : _0xab840f?.name || sourceVideoText("result.defaultName"));
            return {
              ...(await this._buildRecoveredVideoResultPatch(_0x10d778)),
              name: _0x2779d2,
              generationDuration: this._computeGenerationDuration(_0xab840f)
            };
          },
          failureBuilder: (_0x344791, _0x40d402) => {
            const _0x11ddb3 = _0x344791 instanceof Error ? _0x344791.message : String(_0x344791 || sourceVideoText("recovery.taskFailed"));
            const _0x256950 = a521_0x473f31.getState().nodes?.[this.id] || {};
            const _0x181c2d = buildRunningHubVideoTerminalStatePatch(_0x256950, "failed", this._computeGenerationDuration(_0x256950)) || {};
            const _0x1a94d5 = _0x181c2d.generationDuration ?? this._computeGenerationDuration(_0x256950);
            return {
              ...buildSourceVideoRecoveryFailurePatch(_0x256950, {
                error: _0x11ddb3,
                startedAt: _0x40d402.startedAt,
                duration: _0x1a94d5
              }),
              ..._0x181c2d,
              generationDuration: _0x1a94d5
            };
          },
          parseError: _0x12613a => _0x12613a instanceof Error ? _0x12613a.message : String(_0x12613a || sourceVideoText("recovery.taskFailed"))
        }, {
          store: a521_0x473f31,
          startedAt: _0x595148,
          abortController: _0xd7f61e
        });
        if (_0x5a5bc2.status === "success") {
          window._triggerLocalCacheSave?.();
        }
      } catch (_0x16c970) {
        if (_0xd7f61e.signal.aborted || String(_0x16c970?.message || "") === "CANCELLED") {
          return;
        }
        const _0x10ced0 = _0x16c970 instanceof Error ? _0x16c970.message : String(_0x16c970 || sourceVideoText("recovery.taskFailed"));
        const _0x30201e = a521_0x473f31.getState().nodes?.[this.id];
        if (!_0x30201e) {
          return;
        }
        const _0xaaf760 = buildRunningHubVideoTerminalStatePatch(_0x30201e, "failed", this._computeGenerationDuration(_0x30201e)) || {};
        a521_0x473f31.updateNodeData(this.id, {
          ...buildSourceVideoRecoveryFailurePatch(_0x30201e, {
            error: _0x10ced0,
            startedAt: _0x595148,
            duration: _0xaaf760.generationDuration ?? this._computeGenerationDuration(_0x30201e)
          }),
          ..._0xaaf760,
          isGenerating: false,
          generationDuration: _0xaaf760.generationDuration ?? this._computeGenerationDuration(_0x30201e),
          rhTaskStatus: "failed",
          rhTaskRecovering: false
        });
      } finally {
        if (this._rhResumeAbortController === _0xd7f61e) {
          this._rhResumeAbortController = null;
        }
        if (this._rhResumeTaskId === _0x14e1cf) {
          this._rhResumeTaskId = "";
        }
        this._rhResumePromise = null;
      }
    })();
    this._rhResumePromise = _0x2ad6b8;
  }
  _maybeResumeAsyncTask() {
    const _0x24155e = a521_0x473f31.getStateRaw().nodes?.[this.id] || this._data;
    if (!this._isAsyncRecoverableTask(_0x24155e)) {
      this._stopAsyncRecovery(true);
      return;
    }
    const _0x122fbf = String(_0x24155e?.asyncTaskId || "").trim();
    if (!_0x122fbf) {
      return;
    }
    if (this._asyncResumePromise && this._asyncResumeTaskId === _0x122fbf) {
      return;
    }
    const _0x21277e = Number(_0x24155e?.asyncTaskStartedAt || _0x24155e?.generationStartTime || 0) || Date.now();
    const _0x33d6af = this._resolveAsyncResumePayload(_0x24155e);
    const _0x436009 = String(_0x33d6af.provider || _0x24155e?.asyncTaskProvider || _0x24155e?.provider || "").trim().toLowerCase();
    const _0x175b4b = typeof this._resumeAsyncTaskPoller === "function" ? this._resumeAsyncTaskPoller : resumeAsyncVideoTask;
    const _0x353448 = new AbortController();
    this._asyncResumeAbortController = _0x353448;
    this._asyncResumeTaskId = _0x122fbf;
    const _0x3d3b43 = (async () => {
      try {
        const _0x1bd24e = await resumeTask({
          sourceNodeId: this.id,
          targetNodeId: this.id,
          trigger: "node",
          taskType: "video-generation",
          provider: _0x436009 || _0x33d6af.provider || _0x24155e?.provider || "",
          adapterType: "modelApi",
          modelId: _0x33d6af.model || _0x24155e?.model || "",
          executionId: (_0x436009 || _0x33d6af.provider || "model") + ".source-video.async",
          payload: _0x33d6af,
          taskId: _0x122fbf,
          async: true,
          cancellable: false,
          resumable: true,
          pauseOnAbort: true,
          startBuilder: () => ({
            asyncTaskProvider: _0x436009,
            asyncTaskKind: "video",
            asyncTaskStatus: String(_0x24155e?.asyncTaskStatus || "").trim().toLowerCase() === "pending" ? "pending" : "running"
          }),
          poll: async () => _0x175b4b(_0x122fbf, _0x33d6af, {
            signal: _0x353448.signal
          }),
          resultBuilder: async _0x123a42 => {
            const _0x13522d = a521_0x473f31.getState().nodes?.[this.id] || {};
            return {
              ...(await this._buildRecoveredVideoResultPatch(_0x123a42)),
              name: _0x13522d?.name?.includes(sourceVideoText("result.hdVideo")) ? sourceVideoText("result.hdVideo") : _0x13522d?.name || sourceVideoText("result.defaultName"),
              generationDuration: this._computeGenerationDuration(_0x13522d)
            };
          },
          failureBuilder: (_0x2ba809, _0x44e15d) => {
            const _0x544d1e = _0x2ba809 instanceof Error ? _0x2ba809.message : String(_0x2ba809 || sourceVideoText("recovery.taskFailed"));
            const _0x56ae2b = a521_0x473f31.getState().nodes?.[this.id] || {};
            return buildSourceVideoRecoveryFailurePatch(_0x56ae2b, {
              error: _0x544d1e,
              startedAt: _0x44e15d.startedAt,
              duration: this._computeGenerationDuration(_0x56ae2b)
            });
          },
          parseError: _0x1b88b7 => _0x1b88b7 instanceof Error ? _0x1b88b7.message : String(_0x1b88b7 || sourceVideoText("recovery.taskFailed"))
        }, {
          store: a521_0x473f31,
          startedAt: _0x21277e,
          abortController: _0x353448
        });
        if (_0x1bd24e.status === "success") {
          window._triggerLocalCacheSave?.();
        }
      } catch (_0x22dd02) {
        if (_0x353448.signal.aborted || String(_0x22dd02?.message || "") === "CANCELLED" || _0x22dd02?.name === "AbortError") {
          return;
        }
        const _0x332fbc = _0x22dd02 instanceof Error ? _0x22dd02.message : String(_0x22dd02 || sourceVideoText("recovery.taskFailed"));
        const _0x23fb63 = a521_0x473f31.getState().nodes?.[this.id];
        if (!_0x23fb63) {
          return;
        }
        a521_0x473f31.updateNodeData(this.id, {
          ...buildSourceVideoRecoveryFailurePatch(_0x23fb63, {
            error: _0x332fbc,
            startedAt: _0x21277e,
            duration: this._computeGenerationDuration(_0x23fb63)
          }),
          isGenerating: false,
          asyncTaskStatus: "failed",
          asyncTaskRecovering: false
        });
      } finally {
        if (this._asyncResumeAbortController === _0x353448) {
          this._asyncResumeAbortController = null;
        }
        if (this._asyncResumeTaskId === _0x122fbf) {
          this._asyncResumeTaskId = "";
        }
        this._asyncResumePromise = null;
      }
    })();
    this._asyncResumePromise = _0x3d3b43;
  }
  update(_0x41702d) {
    const _0x7994c9 = createVideoNodeUpdatePerf();
    this._data = _0x41702d;
    if (this._syncRunningHubVideoTaskState(_0x41702d)) {
      this._data = a521_0x473f31.getState().nodes?.[this.id] || _0x41702d;
      _0x41702d = this._data;
    }
    this._syncMutedStateFromData(_0x41702d);
    this._syncVideoDurationUi();
    _0x7994c9?.mark("task-muted-state");
    const _0x37741f = this._resolveVideoSrc(_0x41702d);
    _0x7994c9?.mark("resolve-source");
    const _0x30b9cf = shouldShowGenerationResultLoadingUi(_0x41702d, {
      hasResult: !!_0x37741f
    });
    if (_0x30b9cf) {
      startLoading(this._card, {
        variant: "full"
      });
      if (this._hint) {
        this._hint.style.display = "none";
      }
      if (this._uploadBtn) {
        this._uploadBtn.disabled = true;
      }
    } else if (isTaskTerminal(_0x41702d)) {
      if (!_0x37741f) {
        stopLoading(this._card);
      }
      if (this._uploadBtn) {
        this._uploadBtn.disabled = false;
      }
    } else {
      if (this._uploadBtn) {
        this._uploadBtn.disabled = false;
      }
      if (!_0x37741f) {
        stopLoading(this._card);
      }
    }
    _0x7994c9?.mark("loading-ui");
    const _0x429c01 = resolveSourceVideoPosterSrc(_0x41702d);
    const _0x12ad6b = _0x429c01 !== this._lastPosterSrc;
    if (this._rendererMediaDeferred === true) {
      this._currentSrc = _0x37741f || "";
      if (this._video) {
        this._video.preload = "none";
        this._clearVideoElementSource({
          load: false
        });
      }
      if (_0x12ad6b || _0x429c01) {
        this._applyVideoPoster(_0x41702d);
      } else {
        this._setPosterFrameVisible(false);
      }
      _0x7994c9?.mark("deferred-poster");
      if (this._rendererDetailsDeferred !== true && hasSourceVideoRecoveryWork(_0x41702d)) {
        this._maybeResumeRunningHubTask();
        this._maybeResumeAsyncTask();
      }
      _0x7994c9?.mark("deferred-task-resume");
      if (this._label && _0x41702d.name && document.activeElement !== this._label && this._label.textContent !== _0x41702d.name) {
        this._label.textContent = _0x41702d.name;
      }
      this._syncGenerationFailureUi(_0x41702d);
      _0x7994c9?.mark("label");
      this._lastUpdatePerfBreakdown = _0x7994c9?.finish() || null;
      return;
    }
    this._requestVisibleProxyMigration();
    _0x7994c9?.mark("proxy-migration");
    const _0x26f3d6 = String(_0x37741f || "").trim() !== String(this._currentSrc || "").trim();
    const _0x52faa8 = _0x26f3d6 && (this._shouldDeferActivePlaybackSourceChange(_0x37741f) || this._shouldKeepReadyCapturePreview(_0x37741f));
    if (!_0x26f3d6 && this._hasPendingPlaybackSource === true) {
      this._clearPendingPlaybackSource();
    }
    if (_0x52faa8) {
      this._setPendingPlaybackSource(_0x37741f);
    } else if (_0x26f3d6) {
      this._clearPendingPlaybackSource();
      this._loadVideo(_0x37741f || "");
    } else if (_0x37741f && _0x12ad6b && (!this._video || this._video.paused) && !this._isVideoFrameReadyToShow()) {
      this._loadVideo(_0x37741f);
    } else if (_0x12ad6b) {
      this._applyVideoPoster(_0x41702d);
    }
    _0x7994c9?.mark("media-poster");
    this._maybeFetchVideoMeta(_0x41702d);
    if (hasSourceVideoRecoveryWork(_0x41702d)) {
      this._maybeResumeRunningHubTask();
      this._maybeResumeAsyncTask();
    }
    _0x7994c9?.mark("meta-task-resume");
    if (this._label && _0x41702d.name && document.activeElement !== this._label && this._label.textContent !== _0x41702d.name) {
      this._label.textContent = _0x41702d.name;
    }
    this._syncGenerationFailureUi(_0x41702d);
    _0x7994c9?.mark("label");
    this._lastUpdatePerfBreakdown = _0x7994c9?.finish() || null;
  }
  unmount() {
    this._canonicalAssetImportDisposed = true;
    this._invalidateCanonicalAssetImportRetry();
    this._clearPendingPlaybackSource();
    this._invalidatePendingPlaybackResume();
    this._metaFetchToken = Number(this._metaFetchToken || 0) + 1;
    this._playbackSourceToken = Number(this._playbackSourceToken || 0) + 1;
    this._setRendererPlaybackPin(false);
    this._hoverPlaybackLifecycle?.dispose?.();
    this._unsubscribeLocale?.();
    this._unsubscribeLocale = null;
    this._removeDeferredToolbarActivator?.();
    this._removeDeferredToolbarActivator = null;
    this._removeDeferredInteractionActivator?.();
    this._removeDeferredInteractionActivator = null;
    this._cancelProgressLoop();
    this._posterFramePreloadToken = (this._posterFramePreloadToken || 0) + 1;
    if (this._idleVideoThumbCancel) {
      this._idleVideoThumbCancel();
      this._idleVideoThumbCancel = null;
    }
    this._cancelDeferredVideoMetaFetch();
    this._releaseActiveCapturePreviewUrl();
    this._stopRunningHubRecovery(false);
    this._stopAsyncRecovery(false);
    if (this._centerIndicatorTimer) {
      clearTimeout(this._centerIndicatorTimer);
      this._centerIndicatorTimer = null;
    }
    if (this._video) {
      this._setManualLoopPlayback(false);
      this._video.pause();
      this._video.src = "";
    }
    this._releasePlaybackObjectUrl();
  }
  prepareRendererVisibleVideoPreview() {
    this._rendererEagerVideoPreview = false;
    return this._rendererMediaDeferred === true;
  }
  adoptRendererVisibleVideoSurface(_0x9e7399) {
    const _0x103cee = _0x9e7399?.videoEl;
    const _0x27c120 = String(_0x9e7399?.sourceUrl || "").trim();
    const _0x596db1 = String(this._resolveVideoSrc(this._data) || "").trim();
    if (!_0x103cee || !_0x27c120 || _0x27c120 !== _0x596db1 || _0x103cee.isConnected === false || this._card?.isConnected === false) {
      return false;
    }
    _0x103cee.classList?.remove?.("v2-renderer-visible-video-surface");
    _0x103cee.classList?.add?.("video-player");
    for (const _0xdc4b2d of ["position", "left", "top", "transform", "contain"]) {
      _0x103cee.style?.removeProperty?.(_0xdc4b2d);
    }
    Object.assign(_0x103cee.style, {
      width: "100%",
      height: "100%",
      display: "block",
      opacity: "1",
      visibility: "visible",
      objectFit: "cover",
      borderRadius: "0",
      margin: "0",
      pointerEvents: "none"
    });
    const _0xef75bd = this._posterFrame?.parentNode === this._card ? this._posterFrame : null;
    if (typeof this._card.moveBefore === "function") {
      this._card.moveBefore(_0x103cee, _0xef75bd);
      _0x103cee.dataset.rendererSurfaceMove = "state-preserving";
    } else {
      this._card.insertBefore(_0x103cee, _0xef75bd);
      _0x103cee.dataset.rendererSurfaceMove = "legacy";
    }
    this._video = _0x103cee;
    this._videoEventsBound = false;
    this._bindVideoElementEvents();
    this._currentSrc = _0x27c120;
    this._prepareRendererMediaSlotSource(_0x27c120);
    this._rendererVisibleVideoSurface = _0x9e7399;
    if (Number(_0x103cee.readyState || 0) >= 1) {
      this._syncLoadedVideoMetadata(_0x103cee);
    }
    return true;
  }
  prepareRendererMediaFallbackForSuspend() {
    const _0x28e6a1 = String(this._lastPosterSrc || "").trim();
    if (!_0x28e6a1 || !this._posterFrame) {
      return false;
    }
    this._posterFrame.loading = "eager";
    try {
      this._posterFrame.fetchPriority = "high";
    } catch {}
    this._applyPosterFrameSource(_0x28e6a1);
    const _0x488932 = this._posterFrame.isConnected !== false && this._posterFrame.complete === true && Number(this._posterFrame.naturalWidth || 0) > 0;
    if (_0x488932) {
      this._setPosterFrameVisible(true);
    }
    return _0x488932;
  }
  suspendRendererMedia() {
    this._setRendererPlaybackPin(false);
    if (this._rendererVisibleVideoSurface) {
      this._rendererVisibleVideoSurface.cancelled = true;
      this._rendererVisibleVideoSurface = null;
    }
    this._rendererMediaDeferred = true;
    this._rendererEagerVideoPreview = false;
    this._playbackSourceToken = Number(this._playbackSourceToken || 0) + 1;
    this._playbackSourcePromise = null;
    this._clearPendingPlaybackSource();
    this._invalidatePendingPlaybackResume();
    this._playbackSourcePromiseSource = "";
    this._loadVideoToken = null;
    this._currentSrc = null;
    this._isHovered = false;
    this._isManualControl = false;
    this._hoverManualPause = false;
    this._autoPlayToken += 1;
    if (this._video) {
      this._video.onloadeddata = null;
      this._video.onerror = null;
      this._video.preload = "none";
      try {
        this._video.pause?.();
      } catch {}
      this._clearVideoElementSource();
      this._syncPosterFrameVisibility();
    } else {
      this._releasePlaybackObjectUrl();
    }
    this._syncPlaybackChromeVisibility({
      forceHidden: true
    });
  }
  hydrateDeferredMedia() {
    if (this._rendererMediaDeferred !== true) {
      return;
    }
    this._rendererMediaDeferred = false;
    this._rendererEagerVideoPreview = false;
    this._bindVideoInteractionHandlers();
    this._ensureVideoToolbarBound();
    const _0x43d313 = this._promotePendingProxyAtMediaSegmentBoundary(a521_0x473f31.getStateRaw().nodes?.[this.id] || this._data);
    this._requestVisibleProxyMigration();
    const _0x3c5d4a = this._resolveVideoSrc(_0x43d313);
    const _0x405394 = this._rendererVisibleVideoSurface;
    if (_0x405394) {
      _0x405394.cancelled = true;
    }
    this._rendererVisibleVideoSurface = null;
    if (_0x3c5d4a) {
      this._loadVideo(_0x3c5d4a);
    } else {
      this._loadVideo("");
    }
    this._scheduleDeferredVideoMetaFetch(_0x43d313);
  }
}