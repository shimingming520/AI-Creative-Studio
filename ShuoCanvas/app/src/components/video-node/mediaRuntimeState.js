import { shouldDeferRendererDetailsOnMount, shouldDeferRendererMediaOnMount } from "../../core/rendererDeferredMedia.js";
import { readVideoAudioDefaultEnabledFromStore, resolveVideoMutedPreference } from "./videoMuteState.js";
import { createHoverVideoPlaybackLifecycle } from "../shared/hoverVideoPlaybackLifecycle.js";
export function initializeVideoNodeMediaRuntimeState(_0x9548eb, _0x1c2bd9, _0x2ad7ba) {
  _0x9548eb._multiStackWrap = null;
  _0x9548eb._multiLayerEls = [];
  _0x9548eb._multiErrorEls = [];
  _0x9548eb._multiToggleBtn = null;
  _0x9548eb._multiVideosContainer = null;
  _0x9548eb._cachedVideoUrls = new Map();
  _0x9548eb._localPlaybackBlobToken = 0;
  _0x9548eb._videoRenderEpoch = 0;
  _0x9548eb._videoSourceAttachToken = 0;
  _0x9548eb._videoSourceAttachTokens = new WeakMap();
  _0x9548eb._localPlaybackBlobPromise = null;
  _0x9548eb._localPlaybackBlobPromiseSource = "";
  _0x9548eb._localPlaybackBlobFetchController = null;
  _0x9548eb._localPlaybackObjectUrl = "";
  _0x9548eb._localPlaybackObjectSource = "";
  _0x9548eb._lastVideosKeyStr = null;
  _0x9548eb._lastMainIdx = null;
  _0x9548eb._lastIsExpanded = null;
  _0x9548eb._expandPanel = null;
  _0x9548eb._isMuted = resolveVideoMutedPreference(_0x1c2bd9, {
    videoAudioDefaultEnabled: readVideoAudioDefaultEnabledFromStore(_0x2ad7ba)
  });
  _0x9548eb._videoClickTimer = null;
  _0x9548eb._muteBtnEl = null;
  _0x9548eb._muteIconMutedEl = null;
  _0x9548eb._muteIconUnmutedEl = null;
  _0x9548eb._centerIndicatorEl = null;
  _0x9548eb._centerIndicatorInnerEl = null;
  _0x9548eb._centerIndicatorTimer = null;
  _0x9548eb._controlsEl = null;
  _0x9548eb._playBtnEl = null;
  _0x9548eb._timeCurrentEl = null;
  _0x9548eb._timeTotalEl = null;
  _0x9548eb._progressBarEl = null;
  _0x9548eb._progressFillEl = null;
  _0x9548eb._snapBtnEl = null;
  _0x9548eb._progressRaf = 0;
  _0x9548eb._progressRafVideoEl = null;
  _0x9548eb._isProgressSeeking = false;
  _0x9548eb._isProgressDragging = false;
  _0x9548eb._progressSeekToken = 0;
  _0x9548eb._isManualControl = false;
  _0x9548eb._isHovered = false;
  _0x9548eb._hoverManualPause = false;
  _0x9548eb._isManualLoopPlayback = false;
  _0x9548eb._autoPlayToken = 0;
  _0x9548eb._hoverPlaybackResumeState = null;
  _0x9548eb._hoverPlaybackLifecycle = createHoverVideoPlaybackLifecycle({
    releaseMedia: () => _0x9548eb._releaseIdlePreviewHoverPlaybackMedia?.()
  });
  _0x9548eb._metaFetchToken = 0;
  _0x9548eb._videoThumbPending = new Set();
  _0x9548eb._blobResolveToken = 0;
  _0x9548eb._resultThumbToken = 0;
  _0x9548eb._isExpandedPickClosing = false;
  _0x9548eb._rendererDetailsDeferred = shouldDeferRendererDetailsOnMount(_0x1c2bd9);
  _0x9548eb._rendererMediaDeferred = shouldDeferRendererMediaOnMount(_0x1c2bd9);
  _0x9548eb._rendererEagerVideoPreview = false;
  _0x9548eb._rendererThinVideoHydration = false;
  _0x9548eb._renderRefBarPendingWhenVisible = false;
  _0x9548eb._deferredVideoViewRefreshPending = false;
  _0x9548eb._deferredToolbarEl = null;
  _0x9548eb._deferredToolbarMarkupPending = false;
}