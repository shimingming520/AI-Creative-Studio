import a409_0x2af79e from "../core/stores/appStore.js";
import { generateId } from "../core/math.js";
import { syncRendererNodePresentationZIndex } from "../core/rendererNodePresentation.js";
import { commit } from "../modules/history.js";
import { onLocaleChange, t } from "../i18n/index.js";
import { getShortcuts } from "../modules/shortcuts.js";
import { getWaveformBarsPathFromPersistedUrl, getWaveformBarsPathFromUrl } from "../utils/audioWaveform.js";
import { MEDIA_CLIP_COMPACT_SIZE, MEDIA_CLIP_AUDIO_LANE_COUNT_MAX, MEDIA_CLIP_TIMELINE_ZOOM_MIN, buildMediaClipExportPayload, buildMediaClipIncomingSignature, getMediaClipInputKind, normalizeMediaClipAudioLaneIndex, normalizeMediaClipTimelineView, normalizeMediaClipState, patchMediaClipAudioLaneMuted, patchMediaClipAudioClipState, removeMediaClipAudioClip, removeMediaClipClip, resolveMediaClipSourceKey, splitMediaClipAudioAtTimelineSec, splitMediaClipAtTimelineSec } from "./media-clip/mediaClipState.js";
import { buildMediaClipTimelineTicks, getMediaClipFrameCount, getMediaClipTimelineAddSlotLeftPx, getMediaClipTimelineContentWidthPx, getMediaClipTimelineDisplayDuration, getMediaClipTimelinePercent, getMediaClipTimelinePlayheadModel, getMediaClipTimelineRangeRect, getMediaClipTimelineSecFromClientX, getMediaClipTimelineTrackWidthPx } from "./media-clip/mediaClipTimelineModel.js";
import { pausePreviewPlayback as a409_0x2db77b, playbackClockTimelineSec as a409_0x1595f7, playPreview as a409_0x4ad437, playReplacementAudioFromVideo as a409_0x1fddc9, preparePreviewMediaForPlayback as a409_0x219ff1, resetPlaybackClock as a409_0x498829, setPreviewPlayIcon as a409_0xd82b3f, startPlaybackLoop as a409_0x304c70, syncReplacementAudioFromVideo as a409_0x437d1d, togglePreviewPlayback as a409_0x3700af, updatePreviewControls as a409_0x33621d } from "./media-clip/mediaClipPlaybackController.js";
import { disposeMediaElement, setMediaElementSource } from "./media-clip/mediaClipMediaElement.js";
import { applyPreviewVideoLayout as a409_0x41c7dc, clearPreviewVideoFallback as a409_0x2e858a, ensurePreviewAudioElement as a409_0x369d00, ensurePreviewImageElement as a409_0x11d15b, ensurePreviewVideoElement as a409_0x4a5a0f, getPreviewLayoutTokens as a409_0x14a952, getPreviewVideoLayoutClasses as a409_0x44bde3, renderPreview as a409_0x1a6d20, renderPreviewControls as a409_0x359d5a, renderPreviewPanel as a409_0x72df93, renderVideoFallback as a409_0x24c599, showPreviewImage as a409_0x4a694e, showPreviewVideo as a409_0x3a3da5, syncPreviewPanelLayout as a409_0xae69f1, syncPreviewVideoLayoutFromElement as a409_0x53752c } from "./media-clip/mediaClipPreviewView.js";
import { collectMediaClipFrameUrls, resolveMediaClipAudioUrl, resolveMediaClipImageUrl, resolveMediaClipLocalPath, resolveMediaClipThumbUrl, resolveMediaClipVideoUrl, resolveMediaClipWaveformUrl } from "./media-clip/mediaClipSourceResolver.js";
import { firstNonEmpty, formatDurationLabel, formatTime, getTrackDuration, isSameMediaClipState, normalizeText, parsePercentValue, readLayoutWidthPx, stopPointer, toNumber } from "./media-clip/mediaClipUtils.js";
import { MEDIA_CLIP_WAVEFORM_HEIGHT, MEDIA_CLIP_WAVEFORM_SAMPLES, MEDIA_CLIP_WAVEFORM_WIDTH, createConnectCursorIcon, createMediaClipSvgElement, fillFilmstripPlaceholder, formatWaveformPct, getMediaClipWaveformViewBox, getMediaClipWaveformViewport, iconButton, makeButton, setMediaClipSvgClass } from "./media-clip/mediaClipViewUtils.js";
import { clearTimelineHoverState as a409_0xabb986, createTimelineInteractionState as a409_0x1f0e50, getTimelineDrag as a409_0x2fc6c6, isTimelineDragSession as a409_0x2cdf5c, nextTimelineDragSessionId as a409_0x2729b4, setTimelineDrag as a409_0x5b9dd2, setTimelineHoverSegment as a409_0x3024a2 } from "./media-clip/mediaClipTimelineInteractionController.js";
import { applyMediaClipTimelineDragPreviewFromPointer, commitMediaClipTimelineEdit, detachMediaClipTimelineEditDrag, handleMediaClipTimelineDrag, handleMediaClipTimelineSegmentDrag, previewMediaClipTimelineMoveDrag, previewMediaClipTimelineTrimDrag, renderMediaClipTimelineTrimHandle, startMediaClipTimelineSegmentDrag } from "./media-clip/mediaClipTimelineEditController.js";
import { bindTimelineScroll as a409_0x5958e2, clampTimelineScrollLeft as a409_0x2b6fff, handleTimelineZoomWheel as a409_0x182829, persistTimelineDragScroll as a409_0x47cab9, primeTimelineScroll as a409_0x2d4e91, runTimelineDragAutoScroll as a409_0x45aa9c, scheduleTimelineDragAutoScroll as a409_0x1ab06c, shouldLockTimelineWheelScroll as a409_0x5a8091, stopTimelineDragAutoScroll as a409_0x54db8a, syncTimelineScrollFade as a409_0x37d780, timelineDragAutoScrollVelocity as a409_0x140b2a, timelineDragDeltaPx as a409_0x31ae20, timelineDragScrollDeltaPx as a409_0x354033, timelineMaterialRangeSec as a409_0x5f3eb0, timelineMaterialScrollBounds as a409_0x172350 } from "./media-clip/mediaClipTimelineViewportController.js";
import { addImageOutputNodeFromSource as a409_0x5df673, addOutputNode as a409_0x4050d3, exportAndUse as a409_0x3432cc, exportAudioClips as a409_0x5c85cb, exportLoadingTargetElement as a409_0x2780cc, exportMaterialToCanvas as a409_0xf11d73, exportVisualClips as a409_0x4eb073, exportVisualDurationSec as a409_0x29f2e7, firstExportVideoSource as a409_0x11c7dd, renderDownloadMenu as a409_0x4da2ba, resolveOutputNodePosition as a409_0x4800dc, singleVisualClipExportTrack as a409_0xf3728c, startExportLoading as a409_0x1a3b8d, stopExportLoading as a409_0xdf5c76, waitForExportLoadingFrame as a409_0x547399 } from "./media-clip/mediaClipExportController.js";
const TIMELINE_VIEW_PERSIST_DELAY_MS = 180;
const TIMELINE_SETTLE_ANIMATION_MS = 360;
const PREVIEW_SCRUB_SEEK_EPSILON_SEC = 0.04;
const TIMELINE_ZOOM_OUT_DISPLAY_MULTIPLIER = 4;
const MEDIA_CLIP_AUDIO_LANE_HEIGHT_PX = 30;
const MEDIA_CLIP_AUDIO_LANE_GAP_PX = 6;
const MEDIA_CLIP_AUDIO_LANE_DRAG_THRESHOLD_PX = 18;
const MEDIA_CLIP_TIMELINE_AXIS_WIDTH_PX = 48;
const MEDIA_CLIP_DELETE_MATERIAL_EVENT = "media-clip-delete-material";
const MEDIA_CLIP_EXPANDED_HOST_Z_INDEX = "12000";
let activeExpandedMediaClipNode = null;
function mediaClipText(_0x534af7, _0x55e49e = {}) {
  return t("mediaClip." + _0x534af7, _0x55e49e);
}
export { getMediaClipFrameCount, getMediaClipTimelineAddSlotLeftPx, getMediaClipTimelineContentWidthPx, getMediaClipTimelineDisplayDuration, shouldLockMediaClipTimelineWheelScroll } from "./media-clip/mediaClipTimelineModel.js";
export class MediaClipNode {
  constructor(_0x19ecb5) {
    this.nodeData = _0x19ecb5 || {};
    this.id = this.nodeData.id;
    this.el = document.createElement("div");
    this.el.className = "media-clip-node-shell";
    this._sources = {
      video: null,
      videos: [],
      audio: null,
      audios: []
    };
    this._mediaClip = normalizeMediaClipState(this.nodeData, this._sources);
    this._timelineView = normalizeMediaClipTimelineView(this._mediaClip.timelineView);
    this._playheadSec = 0;
    this._exporting = false;
    this._menuOpen = false;
    this._materialMenu = null;
    this._materialMenuEl = null;
    this._exportLoadingTarget = null;
    this._unsubscribePick = null;
    this._unsubscribeInputs = null;
    this._unsubscribeLocale = null;
    this._timelineInteractionState = this._createTimelineInteractionState();
    this._suppressTrackClick = false;
    this._activeClipIndex = 0;
    this._selectedClipIndex = -1;
    this._activeAudioClipIndex = 0;
    this._selectedAudioClipIndex = -1;
    this._timelineScrollLeft = this._timelineView.scrollLeft;
    this._timelineViewPersistTimer = 0;
    this._timelineViewPersistRender = false;
    this._timelineSettleTimer = 0;
    this._timelineSettleRow = null;
    this._timelineSettlePendingPersist = false;
    this._timelineSettlePendingCommit = false;
    this._timelineSettleVersion = 0;
    this._timelineDragSessionSeq = 0;
    this._timelineDragAutoScrollRaf = 0;
    this._deferredTimelineDragNodeData = null;
    this._skipNextStoreMediaClipRender = false;
    this._skipNextIncomingMediaClipRender = false;
    this._restoringTimelineScroll = null;
    this._onDocumentPointerDown = null;
    this._onMaterialMenuPointerDown = null;
    this._onDocumentKeyDown = null;
    this._onDeleteMaterialShortcut = null;
    this._onShortcutsUpdated = null;
    this._lastDeleteMaterialShortcutAt = Number.NEGATIVE_INFINITY;
    this._pendingPreviewSeek = {
      video: null,
      audio: null
    };
    this._previewSeekRaf = {
      video: 0,
      audio: 0
    };
    this._previewSeekState = {
      video: this._createPreviewSeekState(),
      audio: this._createPreviewSeekState()
    };
    this._playbackRaf = 0;
    this._playing = false;
    this._playPreviewPending = null;
    this._previewVisualKind = "";
    this._playbackStartedAtMs = Number.NaN;
    this._playbackStartSec = 0;
    this._imagePlaybackStartedAt = 0;
    this._imagePlaybackStartSec = 0;
    this._videoPreview = null;
    this._imagePreview = null;
    this._audioPreview = null;
    this._previewPlayButton = null;
    this._previewTimeLabel = null;
    this._previewVideoSrc = "";
    this._previewAudioSrc = "";
  }
  _createTimelineInteractionState(_0x28977d = {}) {
    return a409_0x1f0e50(_0x28977d);
  }
  _timelineDrag() {
    return a409_0x2fc6c6(this);
  }
  _compactLayoutSize(_0x2ee23e = this._mediaClip) {
    return {
      width: MEDIA_CLIP_COMPACT_SIZE.width,
      height: MEDIA_CLIP_COMPACT_SIZE.height
    };
  }
  _nextTimelineDragSessionId() {
    return a409_0x2729b4(this);
  }
  _isTimelineDragSession(_0x1c8340) {
    return a409_0x2cdf5c(this, _0x1c8340);
  }
  _setTimelineDrag(_0x59c017 = null) {
    return a409_0x5b9dd2(this, _0x59c017);
  }
  _setTimelineHoverSegment(_0x34841d, _0x1b8aab, _0x124a65 = "", _0xc8cf74 = -1) {
    return a409_0x3024a2(this, _0x34841d, _0x1b8aab, _0x124a65, _0xc8cf74);
  }
  _clearTimelineHoverState(_0x5603ce = this.el) {
    return a409_0xabb986(this, _0x5603ce);
  }
  mount() {
    this.el.addEventListener("pointerdown", _0x2edc6a => {
      if (this._mediaClip.expanded === true || _0x2edc6a.target.closest("button, video, audio, .media-clip-menu")) {
        _0x2edc6a.stopPropagation();
      }
    });
    this._unsubscribePick = a409_0x2af79e.subscribeSelector?.(_0x138e1b => ({
      active: _0x138e1b.pickConnectMode?.active === true,
      sourceNodeId: _0x138e1b.pickConnectMode?.sourceNodeId || ""
    }), () => this._render());
    this._unsubscribeInputs = a409_0x2af79e.subscribeSelector?.(_0x5a2dc2 => buildMediaClipIncomingSignature(_0x5a2dc2, this.id), () => {
      const _0x8da7e5 = this._skipNextIncomingMediaClipRender === true;
      this._skipNextIncomingMediaClipRender = false;
      const _0x1fffb5 = a409_0x2af79e.getState()?.nodes?.[this.id] || this.nodeData;
      this.nodeData = _0x1fffb5;
      this._syncFromStore(_0x1fffb5);
      if (_0x8da7e5) {
        return;
      }
      this._render();
    });
    this._unsubscribeLocale = onLocaleChange(() => this._render());
    this._onShortcutsUpdated = () => this._rerenderCompactOnly();
    window.addEventListener("shortcuts-updated", this._onShortcutsUpdated);
    this._syncFromStore(this.nodeData);
    this._render();
    return this.el;
  }
  unmount() {
    this._unsubscribePick?.();
    this._unsubscribeInputs?.();
    this._unsubscribeLocale?.();
    this._unsubscribePick = null;
    this._unsubscribeInputs = null;
    this._unsubscribeLocale = null;
    if (this._onShortcutsUpdated) {
      window.removeEventListener("shortcuts-updated", this._onShortcutsUpdated);
      this._onShortcutsUpdated = null;
    }
    this._detachDragListeners();
    this._syncDocumentExitListener(false);
    this._syncMaterialMenuDismissListener(false);
    this._syncDocumentKeyListener(false);
    this._syncDeleteMaterialShortcutListener(false);
    this._removeMaterialMenuPortal();
    this._stopExportLoading();
    this._releaseExpandedEditor();
    this._disposePreviewMedia();
    if (this._timelineViewPersistTimer) {
      clearTimeout(this._timelineViewPersistTimer);
      this._timelineViewPersistTimer = 0;
    }
    if (this._timelineSettleTimer) {
      clearTimeout(this._timelineSettleTimer);
      this._timelineSettleTimer = 0;
      this._timelineSettleRow?.classList.remove("is-settling");
      this._flushTimelineSettlePersist();
    }
    this._timelineSettleRow = null;
    this._skipNextStoreMediaClipRender = false;
    this._skipNextIncomingMediaClipRender = false;
    this._timelineViewPersistRender = false;
    this._restoringTimelineScroll = null;
    this._stopTimelineDragAutoScroll();
  }
  update(_0x2c21ae) {
    const _0x455a35 = _0x2c21ae || this.nodeData;
    if (this._timelineDrag()) {
      this._deferredTimelineDragNodeData = _0x455a35;
      this.nodeData = {
        ...(_0x455a35 || {}),
        mediaClip: this._mediaClip
      };
      return;
    }
    if (this._skipNextStoreMediaClipRender && isSameMediaClipState(_0x455a35?.mediaClip, this._mediaClip)) {
      this._skipNextStoreMediaClipRender = false;
      this.nodeData = _0x455a35;
      return;
    }
    if ((this._timelineSettleTimer || this._timelineSettleRow) && isSameMediaClipState(_0x455a35?.mediaClip, this._mediaClip)) {
      this._skipNextStoreMediaClipRender = false;
      this.nodeData = _0x455a35;
      return;
    }
    if (this._isTimelinePresentationOnlyUpdate(_0x455a35)) {
      this._skipNextStoreMediaClipRender = false;
      this.nodeData = {
        ...(_0x455a35 || {}),
        mediaClip: this._mediaClip
      };
      return;
    }
    this._skipNextStoreMediaClipRender = false;
    this.nodeData = _0x455a35;
    this._syncFromStore(this.nodeData);
    this._render();
  }
  _isTimelinePresentationOnlyUpdate(_0x155bb1 = {}) {
    if (!_0x155bb1 || !Object.prototype.hasOwnProperty.call(_0x155bb1, "mediaClip")) {
      return false;
    }
    if (!isSameMediaClipState(_0x155bb1.mediaClip, this._mediaClip)) {
      return false;
    }
    const _0x2198cc = this.nodeData || {};
    const _0xd25f6 = toNumber(_0x2198cc.width, MEDIA_CLIP_COMPACT_SIZE.width);
    const _0x3dde6f = toNumber(_0x2198cc.height, MEDIA_CLIP_COMPACT_SIZE.height);
    const _0xe78d69 = toNumber(_0x155bb1.width, _0xd25f6);
    const _0x43e1af = toNumber(_0x155bb1.height, _0x3dde6f);
    return Math.abs(_0xe78d69 - _0xd25f6) <= 0.01 && Math.abs(_0x43e1af - _0x3dde6f) <= 0.01;
  }
  _syncFromStore(_0x5c4e17) {
    const _0x106488 = a409_0x2af79e.getState();
    const _0x5eedf7 = Object.values(_0x106488.edges || {}).filter(_0x119e74 => _0x119e74?.targetId === this.id).sort((_0x3a2681, _0xdd0b69) => {
      const _0x1931ac = toNumber(_0x3a2681?.createdAt, 0);
      const _0x47f353 = toNumber(_0xdd0b69?.createdAt, 0);
      if (_0x1931ac !== _0x47f353) {
        return _0x1931ac - _0x47f353;
      }
      return normalizeText(_0x3a2681?.id).localeCompare(normalizeText(_0xdd0b69?.id));
    }).map(_0x442b38 => {
      const _0x266fcf = _0x106488.nodes?.[_0x442b38.sourceId];
      if (_0x266fcf) {
        return {
          ..._0x266fcf,
          __mediaClipEdgeId: normalizeText(_0x442b38?.id)
        };
      } else {
        return null;
      }
    }).filter(Boolean);
    const _0x172d52 = _0x5eedf7.filter(_0x4f6c07 => {
      const _0x63b0e8 = getMediaClipInputKind(_0x4f6c07);
      return _0x63b0e8 === "video" || _0x63b0e8 === "image";
    });
    const _0x3a9b55 = _0x5eedf7.filter(_0x235142 => getMediaClipInputKind(_0x235142) === "audio");
    this._sources = {
      video: _0x172d52[0] || null,
      videos: _0x172d52,
      audio: _0x3a9b55[0] || null,
      audios: _0x3a9b55
    };
    const _0x4427ea = normalizeMediaClipState(_0x5c4e17, this._sources);
    const _0x58b4ed = this._timelineViewPersistTimer ? normalizeMediaClipTimelineView(this._timelineView) : normalizeMediaClipTimelineView(_0x4427ea.timelineView);
    const _0x386482 = {
      ..._0x4427ea,
      timelineView: _0x58b4ed
    };
    this._timelineView = _0x58b4ed;
    this._timelineScrollLeft = _0x58b4ed.scrollLeft;
    this._mediaClip = _0x386482;
    this._activeClipIndex = this._clampVideoClipIndex(this._activeClipIndex);
    this._selectedClipIndex = this._clampSelectedClipIndex(this._selectedClipIndex);
    this._activeAudioClipIndex = this._clampAudioClipIndex(this._activeAudioClipIndex);
    this._selectedAudioClipIndex = this._clampSelectedAudioClipIndex(this._selectedAudioClipIndex);
    const _0x17d2f9 = !!_0x386482.tracks?.video || !!_0x386482.tracks?.audio;
    const _0x192b19 = this._compactLayoutSize(_0x386482);
    const _0x4e24a2 = {};
    if (_0x17d2f9 && toNumber(_0x5c4e17?.width, _0x192b19.width) !== _0x192b19.width) {
      _0x4e24a2.width = _0x192b19.width;
    }
    if (_0x17d2f9 && toNumber(_0x5c4e17?.height, _0x192b19.height) !== _0x192b19.height) {
      _0x4e24a2.height = _0x192b19.height;
    }
    const _0x20ec5e = {
      ..._0x4e24a2
    };
    if (!isSameMediaClipState(_0x5c4e17?.mediaClip, _0x386482)) {
      _0x20ec5e.mediaClip = _0x386482;
    }
    if (Object.keys(_0x20ec5e).length) {
      a409_0x2af79e.updateNodeData(this.id, _0x20ec5e);
    }
    this.nodeData = {
      ...(_0x5c4e17 || {}),
      ..._0x4e24a2,
      mediaClip: _0x386482
    };
    const _0x214a2a = _0x386482.tracks?.[_0x386482.activeTrack] || _0x386482.tracks?.video || _0x386482.tracks?.audio;
    if (_0x214a2a && this._playheadSec <= 0) {
      this._playheadSec = _0x386482.activeTrack === "video" ? this._videoTimelineStart(_0x214a2a, _0x386482.clips) : _0x214a2a.startSec;
    }
  }
  _isPicking() {
    const _0x5ed6e0 = a409_0x2af79e.getState()?.pickConnectMode || {};
    return _0x5ed6e0.active === true && _0x5ed6e0.sourceNodeId === this.id;
  }
  _normalizeMediaClipWithTimelineView(_0x5d0b90 = {}) {
    const _0x5d0f90 = normalizeMediaClipTimelineView(_0x5d0b90.timelineView || this._timelineView);
    this._timelineView = _0x5d0f90;
    this._timelineScrollLeft = _0x5d0f90.scrollLeft;
    return {
      ..._0x5d0b90,
      timelineView: _0x5d0f90
    };
  }
  _updateTimelineView(_0x4d217d = {}, _0x1fb2d1 = {}) {
    const _0x3d511a = normalizeMediaClipTimelineView({
      ...this._timelineView,
      ..._0x4d217d
    });
    this._timelineView = _0x3d511a;
    this._timelineScrollLeft = _0x3d511a.scrollLeft;
    this._mediaClip = {
      ...this._mediaClip,
      timelineView: _0x3d511a
    };
    this.nodeData = {
      ...(this.nodeData || {}),
      mediaClip: this._mediaClip
    };
    if (_0x1fb2d1.persist === true) {
      this._scheduleTimelineViewPersist({
        render: _0x1fb2d1.renderOnPersist !== false
      });
    }
    return _0x3d511a;
  }
  _persistTimelineView(_0x209fe5 = {}) {
    const _0x4525d9 = normalizeMediaClipTimelineView(this._timelineView);
    const _0x82050e = {
      ...this._mediaClip,
      timelineView: _0x4525d9
    };
    this._timelineView = _0x4525d9;
    this._timelineScrollLeft = _0x4525d9.scrollLeft;
    this._mediaClip = _0x82050e;
    this.nodeData = {
      ...(this.nodeData || {}),
      mediaClip: _0x82050e
    };
    if (_0x209fe5.render === false) {
      this._skipNextStoreMediaClipRender = true;
    }
    a409_0x2af79e.updateNodeData(this.id, {
      mediaClip: _0x82050e
    });
    if (_0x209fe5.render !== false) {
      this._render();
    }
  }
  _flushTimelineViewPersist(_0x54ffd7 = {}) {
    if (!this._timelineViewPersistTimer) {
      return false;
    }
    clearTimeout(this._timelineViewPersistTimer);
    this._timelineViewPersistTimer = 0;
    const _0x3550f7 = _0x54ffd7.render === false ? false : _0x54ffd7.render === true || this._timelineViewPersistRender;
    this._timelineViewPersistRender = false;
    this._persistTimelineView({
      render: _0x3550f7
    });
    return true;
  }
  _scheduleTimelineViewPersist(_0x26ebf4 = {}) {
    if (this._timelineViewPersistTimer) {
      clearTimeout(this._timelineViewPersistTimer);
    }
    this._timelineViewPersistRender = this._timelineViewPersistRender || _0x26ebf4.render !== false;
    this._timelineViewPersistTimer = setTimeout(() => {
      const _0x2f179b = this._timelineViewPersistRender;
      this._timelineViewPersistTimer = 0;
      this._timelineViewPersistRender = false;
      this._persistTimelineView({
        render: _0x2f179b
      });
    }, TIMELINE_VIEW_PERSIST_DELAY_MS);
  }
  _setMediaClip(_0xf11fcd, _0x390156 = false, _0xa60746 = {}) {
    const _0x55c5b2 = this._normalizeMediaClipWithTimelineView(_0xf11fcd);
    this._mediaClip = _0x55c5b2;
    this.nodeData = {
      ...(this.nodeData || {}),
      mediaClip: _0x55c5b2
    };
    if (_0xa60746.render === false) {
      this._skipNextStoreMediaClipRender = true;
    }
    a409_0x2af79e.updateNodeData(this.id, {
      mediaClip: _0x55c5b2
    });
    if (_0x390156) {
      commit();
    }
    if (_0xa60746.render !== false) {
      this._render();
    }
  }
  _claimExpandedEditor() {
    if (activeExpandedMediaClipNode && activeExpandedMediaClipNode !== this) {
      activeExpandedMediaClipNode._collapseFromPeer();
    }
    activeExpandedMediaClipNode = this;
  }
  _releaseExpandedEditor() {
    if (activeExpandedMediaClipNode === this) {
      activeExpandedMediaClipNode = null;
    }
  }
  _collapseFromPeer() {
    if (this._mediaClip.expanded !== true) {
      return;
    }
    this._setMediaClipWithLayout({
      ...this._mediaClip,
      expanded: false
    }, false, {
      claimExpanded: false
    });
  }
  _prepareTimelineForCollapse() {
    this._stopTimelineDragAutoScroll();
    this._cancelTimelineSettle();
    this._flushTimelineViewPersist({
      render: false
    });
    this._deferredTimelineDragNodeData = null;
  }
  _setMediaClipWithLayout(_0x3756c9, _0x4e1d93 = false, _0x1d97d9 = {}) {
    if (_0x3756c9.expanded === true && _0x1d97d9.claimExpanded !== false) {
      this._claimExpandedEditor();
    } else if (_0x3756c9.expanded !== true) {
      this._prepareTimelineForCollapse();
      this._releaseExpandedEditor();
      this._disposePreviewMedia();
    }
    const _0x1ff9aa = this.nodeData || {};
    const _0xdfcec = this._normalizeMediaClipWithTimelineView(_0x3756c9);
    const _0x14093a = this._compactLayoutSize(_0xdfcec);
    const _0x21a40b = {
      width: _0x14093a.width,
      height: _0x14093a.height,
      mediaClip: _0xdfcec
    };
    this._mediaClip = _0x21a40b.mediaClip;
    this.nodeData = {
      ..._0x1ff9aa,
      ..._0x21a40b
    };
    if (_0x1d97d9.render === false) {
      this._skipNextStoreMediaClipRender = true;
    }
    a409_0x2af79e.updateNodeData(this.id, _0x21a40b);
    if (_0x4e1d93) {
      commit();
    }
    if (_0x1d97d9.render !== false) {
      this._render();
    }
  }
  _setActiveTrack(_0x3224bb, _0x17fb3b = null, _0x40fd49 = {}) {
    const _0x4e01d1 = this._mediaClip.tracks?.[_0x3224bb];
    if (!_0x4e01d1) {
      return;
    }
    this._pausePreviewPlayback({
      updateControls: false
    });
    const _0x5543bb = {
      ...this._mediaClip,
      activeTrack: _0x3224bb
    };
    this._playheadSec = _0x17fb3b == null ? this._playheadSec : _0x17fb3b;
    const _0x1cd4ee = this._mediaClip.activeTrack !== _0x3224bb;
    this._mediaClip = _0x5543bb;
    this.nodeData = {
      ...(this.nodeData || {}),
      mediaClip: _0x5543bb
    };
    if (_0x1cd4ee) {
      a409_0x2af79e.updateNodeData(this.id, {
        mediaClip: _0x5543bb
      });
    }
    if (_0x1cd4ee || _0x40fd49.forceRender === true) {
      this._render();
    } else {
      this._updateTrackVisuals(_0x3224bb, {
        syncTimelineWidth: false
      });
    }
    if (_0x3224bb === "video") {
      this._syncVideoPreviewSourceForTimelineSec(this._playheadSec);
    } else if (_0x3224bb === "audio") {
      this._setActiveAudioClipIndex(this._audioClipIndexAtTimelineSec(this._playheadSec));
      this._syncAudioPreviewSourceForTimelineSec(this._playheadSec);
    }
    this._syncPreviewTime(_0x3224bb, this._previewSourceSecForTimelineSec(_0x3224bb, this._playheadSec));
  }
  _togglePickConnect(_0x421c16) {
    stopPointer(_0x421c16);
    const _0x52c92f = this._isPicking();
    if (_0x52c92f) {
      a409_0x2af79e.setPickConnectMode({
        active: false
      });
      return;
    }
    a409_0x2af79e.setPickConnectMode({
      active: true,
      sourceNodeId: this.id,
      handleDirection: "left"
    });
  }
  _setExpanded(_0x5db0c4, _0x17b7f9 = {}) {
    const _0x5bcd7a = {
      ...this._mediaClip,
      ..._0x17b7f9,
      expanded: _0x5db0c4 === true
    };
    this._setMediaClipWithLayout(_0x5bcd7a, true);
  }
  _splitActiveMaterial(_0x40de20 = this._getPlaybackKind()) {
    const _0x5d1d9e = _0x40de20 === "audio" ? "audio" : "video";
    const _0x4db4a2 = this._mediaClip.tracks?.[_0x5d1d9e];
    if (!_0x4db4a2) {
      return;
    }
    const _0x346ae2 = this._playheadSec;
    const _0x2f344f = _0x5d1d9e === "audio" ? splitMediaClipAudioAtTimelineSec(this._mediaClip, _0x346ae2, generateId("split")) : splitMediaClipAtTimelineSec(this._mediaClip, _0x346ae2, generateId("split"));
    if (isSameMediaClipState(_0x2f344f, this._mediaClip)) {
      window.showToast?.(mediaClipText("toasts.splitAtMiddle"));
      return;
    }
    if (_0x5d1d9e === "audio") {
      const _0x43a9ce = this._audioClipIndexAtTimelineSec(_0x346ae2 + 0.001, _0x2f344f.audioClips);
      this._activeAudioClipIndex = _0x43a9ce;
      this._selectedAudioClipIndex = _0x43a9ce;
    } else {
      const _0x49f352 = this._clipIndexAtTimelineSec(_0x346ae2 + 0.001, _0x2f344f.clips);
      this._activeClipIndex = _0x49f352;
      this._selectedClipIndex = _0x49f352;
    }
    this._pausePreviewPlayback({
      updateControls: false
    });
    this._setMediaClipWithLayout({
      ..._0x2f344f,
      activeTrack: _0x5d1d9e,
      expanded: true
    }, true, {
      render: false
    });
    this._rerenderCompactOnly();
    if (_0x5d1d9e === "audio") {
      this._syncAudioPreviewSourceForTimelineSec(_0x346ae2);
      this._syncPreviewTime("audio", this._audioSourceSecForPlayhead(_0x346ae2), {
        immediate: true
      });
    } else {
      this._syncVideoPreviewSourceForTimelineSec(_0x346ae2);
      this._syncPreviewTime("video", this._videoSourceSecForPlayhead(_0x346ae2), {
        immediate: true
      });
    }
    this._updatePreviewControls();
  }
  _splitActiveVideoClip() {
    this._splitActiveMaterial("video");
  }
  _getPlaybackKind() {
    const _0xed3628 = this._mediaClip.activeTrack;
    if (this._mediaClip.tracks?.[_0xed3628]) {
      return _0xed3628;
    }
    if (this._mediaClip.tracks?.video) {
      return "video";
    }
    if (this._mediaClip.tracks?.audio) {
      return "audio";
    }
    return "";
  }
  _getPlaybackTrack(_0x5177ef = this._getPlaybackKind()) {
    if (_0x5177ef) {
      return this._mediaClip.tracks?.[_0x5177ef] || null;
    } else {
      return null;
    }
  }
  _getVideoClipAtTimelineSec(_0x51e041 = this._playheadSec, _0x2b4cf8 = this._videoTimelineClips(this._mediaClip.tracks?.video)) {
    const _0x559d17 = Array.isArray(_0x2b4cf8) ? _0x2b4cf8 : [];
    if (!_0x559d17.length) {
      return null;
    }
    return _0x559d17[this._clipIndexAtTimelineSec(_0x51e041, _0x559d17)] || _0x559d17[0];
  }
  _videoTimelineStart(_0x1f7c19 = this._mediaClip.tracks?.video, _0x1213dc = this._videoTimelineClips(_0x1f7c19)) {
    const _0x2d01e3 = Array.isArray(_0x1213dc) ? _0x1213dc : [];
    if (_0x2d01e3.length) {
      return _0x2d01e3.reduce((_0x11e58c, _0x390915) => Math.min(_0x11e58c, toNumber(_0x390915.timelineStartSec, 0)), Number.POSITIVE_INFINITY);
    }
    return toNumber(_0x1f7c19?.startSec, 0);
  }
  _timelineDisplayEnd(_0x59a396 = this._getPlaybackKind()) {
    if (_0x59a396 === "video") {
      return this._videoTimelineBaseDuration(this._mediaClip.tracks?.video);
    }
    const _0xa4715a = this._mediaClip.tracks?.[_0x59a396];
    return toNumber(_0xa4715a?.endSec || _0xa4715a?.durationSec, 0);
  }
  _getPlaybackMedia(_0x42673a = this._getPlaybackKind()) {
    if (_0x42673a) {
      return this._getPreviewMedia(_0x42673a);
    } else {
      return null;
    }
  }
  _isSecInsideTrack(_0x326a73, _0x284268) {
    if (!_0x326a73) {
      return false;
    }
    const _0xccf38a = toNumber(_0x284268, -1);
    return _0xccf38a >= toNumber(_0x326a73.startSec, 0) && _0xccf38a <= toNumber(_0x326a73.endSec, 0);
  }
  _cancelPlaybackLoop() {
    const _0x2f8349 = this._playbackRaf;
    if (!_0x2f8349) {
      return;
    }
    try {
      if (typeof cancelAnimationFrame === "function") {
        cancelAnimationFrame(_0x2f8349);
      }
    } catch {}
    try {
      clearTimeout(_0x2f8349);
    } catch {}
    this._playbackRaf = 0;
  }
  _pausePreviewPlayback(_0x4440ce = {}) {
    return a409_0x2db77b(this, _0x4440ce);
  }
  _resetPlaybackClock(_0x5466c2 = this._playheadSec) {
    return a409_0x498829(this, _0x5466c2);
  }
  _playbackClockTimelineSec(_0x5c8279 = this._playheadSec) {
    return a409_0x1595f7(this, _0x5c8279);
  }
  async _preparePreviewMediaForPlayback(_0x24ae53, _0x5b6aab = null) {
    return a409_0x219ff1(this, _0x24ae53, _0x5b6aab);
  }
  _togglePreviewPlayback(_0x45b15b) {
    return a409_0x3700af(this, _0x45b15b);
  }
  async _playPreview() {
    return a409_0x4ad437(this);
  }
  async _playReplacementAudioFromVideo(_0x237613) {
    return a409_0x1fddc9(this, _0x237613);
  }
  _syncReplacementAudioFromVideo(_0x5bfb5b, _0x2d105d = {}) {
    return a409_0x437d1d(this, _0x5bfb5b, _0x2d105d);
  }
  _startPlaybackLoop(_0x34711e) {
    return a409_0x304c70(this, _0x34711e);
  }
  _setPreviewPlayIcon(_0x219f52 = this._previewPlayButton) {
    return a409_0xd82b3f(this, _0x219f52);
  }
  _updatePreviewControls() {
    return a409_0x33621d(this);
  }
  _getPreviewMedia(_0x58e0a5) {
    if (_0x58e0a5 === "audio") {
      return this._audioPreview;
    } else {
      return this._videoPreview;
    }
  }
  _visualClipKind(_0x1bd4ac = null, _0x455bdc = null) {
    const _0x29ffdb = normalizeText(_0x1bd4ac?.kind);
    if (_0x29ffdb === "image") {
      return "image";
    }
    const _0x168b69 = getMediaClipInputKind(_0x455bdc || {});
    if (_0x168b69 === "image") {
      return "image";
    } else {
      return "video";
    }
  }
  _getVisualClipContextAtTimelineSec(_0x3ee730 = this._playheadSec, _0x10b78d = null) {
    const _0x3020bf = Array.isArray(_0x10b78d) ? _0x10b78d : this._videoTimelineClips(this._mediaClip.tracks?.video);
    const _0x35f8e2 = this._clipIndexAtTimelineSec(_0x3ee730, _0x3020bf);
    const _0x2f3e91 = _0x3020bf[_0x35f8e2] || this._getVideoClipAtTimelineSec(_0x3ee730, _0x3020bf);
    const _0x216e10 = _0x2f3e91 ? this._videoClipSource(_0x2f3e91, _0x35f8e2) : this._sources.video;
    const _0x313520 = this._visualClipKind(_0x2f3e91, _0x216e10);
    return {
      clip: _0x2f3e91,
      index: _0x35f8e2,
      source: _0x216e10,
      clipKind: _0x313520
    };
  }
  _resolveVideoPreviewSeekTarget() {
    const _0x89bf7b = toNumber(this._pendingPreviewSeek?.video, Number.NaN);
    if (Number.isFinite(_0x89bf7b)) {
      return Math.max(0, _0x89bf7b);
    }
    return this._videoSourceSecForPlayhead(this._playheadSec || 0);
  }
  _getVideoPreviewContextAtTimelineSec(_0x42638f = this._playheadSec, _0x13d8ca = null) {
    const _0x12ab68 = this._getVisualClipContextAtTimelineSec(_0x42638f, _0x13d8ca);
    const {
      clip: _0x2f3415,
      index: _0x518f65,
      source: _0x4dae40,
      clipKind: _0x31c140
    } = _0x12ab68;
    const _0x94a2ac = _0x31c140 === "image" ? resolveMediaClipImageUrl(_0x4dae40) : resolveMediaClipVideoUrl(_0x4dae40);
    return {
      clip: _0x2f3415,
      index: _0x518f65,
      clipKind: _0x31c140,
      source: _0x4dae40,
      url: _0x94a2ac,
      posterUrl: resolveMediaClipThumbUrl(_0x4dae40),
      sourceSec: _0x2f3415 ? this._videoSourceSecForTimelineSec(_0x42638f, _0x13d8ca) : _0x42638f
    };
  }
  _syncVideoPreviewSourceForTimelineSec(_0x2261ca = this._playheadSec, _0x3e854d = {}) {
    const _0x2f3cdf = this._videoPreview;
    const _0x29bbbe = this._getVideoPreviewContextAtTimelineSec(_0x2261ca, _0x3e854d.clips);
    if (!_0x29bbbe.url) {
      return false;
    }
    if (_0x29bbbe.clipKind === "image") {
      this._showPreviewImage(_0x29bbbe.source, _0x29bbbe.url);
      return true;
    }
    if (!_0x2f3cdf) {
      return false;
    }
    this._showPreviewVideo(_0x29bbbe.source);
    _0x2f3cdf.__mediaClipFallbackHost ??= _0x2f3cdf.parentElement || null;
    _0x2f3cdf.__mediaClipPosterUrl = _0x29bbbe.posterUrl;
    if (_0x29bbbe.posterUrl) {
      _0x2f3cdf.poster = _0x29bbbe.posterUrl;
    } else {
      _0x2f3cdf.removeAttribute?.("poster");
    }
    this._applyPreviewVideoLayout(_0x2f3cdf.parentElement, _0x29bbbe.source);
    const _0x4f3ce9 = this._normalizePreviewSourceIdentity(firstNonEmpty(_0x2f3cdf.dataset?.desktopMediaSourceUrl, _0x2f3cdf.dataset?.mediaClipSourceUrl, _0x2f3cdf.getAttribute?.("src"), _0x2f3cdf.currentSrc, _0x2f3cdf.src));
    const _0x2ca0c9 = this._normalizePreviewSourceIdentity(_0x29bbbe.url);
    if (_0x2ca0c9 && _0x4f3ce9 !== _0x2ca0c9) {
      this._showVideoSourceSwitchHold(_0x2f3cdf);
      _0x2f3cdf.classList?.add("is-source-switching");
    }
    const _0x42ea69 = setMediaElementSource(_0x2f3cdf, _0x29bbbe.url);
    if (_0x42ea69) {
      this._cancelPendingVideoSourceSeek(_0x2f3cdf, {
        clearHold: false
      });
      this._resetPreviewSeekState("video");
      _0x2f3cdf.__mediaClipPendingSourceSeek = {
        src: normalizeText(_0x29bbbe.url),
        sec: Math.max(0, toNumber(_0x29bbbe.sourceSec, 0))
      };
      _0x2f3cdf.classList?.add("is-source-switching");
    } else {
      const _0x58f4db = this._normalizePreviewSourceIdentity(_0x2f3cdf.__mediaClipPendingSourceSeek?.src);
      if (_0x58f4db && _0x58f4db === _0x2ca0c9) {
        _0x2f3cdf.__mediaClipPendingSourceSeek.sec = Math.max(0, toNumber(_0x29bbbe.sourceSec, 0));
        _0x2f3cdf.classList?.add("is-source-switching");
      } else if (!_0x2f3cdf.__mediaClipWaitingSourceSeek) {
        this._clearVideoSourceSwitchHold(_0x2f3cdf);
      }
    }
    this._previewVideoSrc = _0x29bbbe.url;
    return _0x42ea69;
  }
  _getAudioClipContextAtTimelineSec(_0x1550ee = this._playheadSec, _0x201a1d = {}) {
    const _0x502434 = this._audioTimelineClips(this._mediaClip.tracks?.audio);
    const _0x441d56 = _0x502434.map((_0x4e3ad8, _0x520298) => ({
      clip: _0x4e3ad8,
      index: _0x520298
    })).filter(({
      clip: _0x48eb29
    }) => _0x201a1d.audibleOnly === true ? _0x48eb29?.muted !== true && _0x48eb29?.disabled !== true : true);
    const _0x3e7ea4 = toNumber(_0x1550ee, 0);
    const _0x37f296 = _0x441d56.findIndex(({
      clip: _0x167e06
    }, _0x23276b) => {
      const _0x3e6469 = toNumber(_0x167e06.timelineStartSec, 0);
      const _0x54268d = Math.max(_0x3e6469, toNumber(_0x167e06.timelineEndSec, _0x3e6469));
      if (_0x23276b === _0x441d56.length - 1) {
        return _0x3e7ea4 >= _0x3e6469 && _0x3e7ea4 <= _0x54268d;
      } else {
        return _0x3e7ea4 >= _0x3e6469 && _0x3e7ea4 < _0x54268d;
      }
    });
    const _0xc89c49 = _0x37f296 >= 0 || _0x201a1d.nearest === false ? _0x37f296 : this._audioClipIndexAtTimelineSec(_0x1550ee, _0x441d56.map(({
      clip: _0x238569
    }) => _0x238569));
    const _0x14eefa = _0x201a1d.nearest === false ? null : _0x441d56[0] || null;
    const _0x4b1173 = _0xc89c49 >= 0 ? _0x441d56[_0xc89c49] || null : _0x14eefa;
    const _0x3634f8 = _0x4b1173?.clip || null;
    const _0x59e85a = _0x4b1173?.index ?? -1;
    const _0x5d09a2 = _0x3634f8 ? this._audioClipSource(_0x3634f8, _0x59e85a) : _0x201a1d.nearest === false ? null : this._sources.audio;
    return {
      clip: _0x3634f8,
      index: _0x59e85a,
      source: _0x5d09a2,
      url: resolveMediaClipAudioUrl(_0x5d09a2),
      sourceSec: _0x3634f8 ? this._audioClipSourceSec(_0x3634f8, _0x1550ee) : _0x1550ee
    };
  }
  _syncAudioPreviewSourceForTimelineSec(_0x62af57 = this._playheadSec) {
    const _0x437dd3 = this._audioPreview;
    if (!_0x437dd3) {
      return false;
    }
    if (this._videoPreview && this._mediaClip.tracks?.audio) {
      this._videoPreview.muted = true;
    }
    const _0x1708a5 = this._getAudioClipContextAtTimelineSec(_0x62af57, {
      audibleOnly: true,
      nearest: false
    });
    if (!_0x1708a5.url) {
      setMediaElementSource(_0x437dd3, "");
      this._previewAudioSrc = "";
      return false;
    }
    const _0x48d6c3 = setMediaElementSource(_0x437dd3, _0x1708a5.url);
    if (_0x48d6c3) {
      this._resetPreviewSeekState("audio");
    }
    this._previewAudioSrc = _0x1708a5.url;
    return _0x48d6c3;
  }
  _createPreviewSeekState(_0x307546 = {}) {
    return {
      lastAppliedSec: null,
      ..._0x307546
    };
  }
  _getPreviewSeekState(_0x2b7681) {
    if (!this._previewSeekState) {
      this._previewSeekState = {};
    }
    if (!this._previewSeekState[_0x2b7681]) {
      this._previewSeekState[_0x2b7681] = this._createPreviewSeekState();
    }
    return this._previewSeekState[_0x2b7681];
  }
  _resetPreviewSeekState(_0x54be1c = "") {
    const _0x2a6303 = _0x54be1c ? [_0x54be1c] : ["video", "audio"];
    if (!this._previewSeekState) {
      this._previewSeekState = {};
    }
    _0x2a6303.forEach(_0x5b3c3b => {
      this._cancelPreviewSeek(_0x5b3c3b);
      this._previewSeekState[_0x5b3c3b] = this._createPreviewSeekState();
    });
  }
  _cancelPreviewSeek(_0x2b9b96) {
    const _0x454a40 = this._previewSeekRaf?.[_0x2b9b96];
    if (!_0x454a40) {
      return;
    }
    try {
      if (typeof cancelAnimationFrame === "function") {
        cancelAnimationFrame(_0x454a40);
      }
    } catch {}
    try {
      clearTimeout(_0x454a40);
    } catch {}
    this._previewSeekRaf[_0x2b9b96] = 0;
  }
  _disposePreviewMedia(_0x54d0b6 = "") {
    if (!_0x54d0b6 || _0x54d0b6 === this._getPlaybackKind()) {
      this._pausePreviewPlayback({
        updateControls: false
      });
    }
    const _0x25d432 = !_0x54d0b6 || _0x54d0b6 === "video";
    const _0x3b84d5 = !_0x54d0b6 || _0x54d0b6 === "video" || _0x54d0b6 === "image";
    const _0xbf2ef3 = !_0x54d0b6 || _0x54d0b6 === "audio";
    if (_0x25d432) {
      this._resetPreviewSeekState("video");
      this._clearVideoSourceSwitchHold(this._videoPreview);
      disposeMediaElement(this._videoPreview);
      this._videoPreview?.remove?.();
      this._videoPreview = null;
      this._previewVideoSrc = "";
    }
    if (_0x3b84d5) {
      this._imagePreview?.remove?.();
      this._imagePreview = null;
      if (this._previewVisualKind === "image") {
        this._previewVisualKind = "";
      }
    }
    if (_0xbf2ef3) {
      this._resetPreviewSeekState("audio");
      disposeMediaElement(this._audioPreview);
      this._audioPreview?.remove?.();
      this._audioPreview = null;
      this._previewAudioSrc = "";
    }
  }
  _schedulePreviewSeek(_0x252fff, _0x86ab5d = {}) {
    if (this._previewSeekRaf[_0x252fff]) {
      return;
    }
    const _0x31181d = typeof requestAnimationFrame === "function" ? _0x5f573a => requestAnimationFrame(_0x5f573a) : _0x48408a => setTimeout(_0x48408a, 16);
    this._previewSeekRaf[_0x252fff] = _0x31181d(() => {
      this._previewSeekRaf[_0x252fff] = 0;
      this._applyPreviewSeek(_0x252fff, _0x86ab5d);
    });
  }
  _applyPreviewSeek(_0xc0b66d, _0x45b6b7 = {}) {
    if (_0xc0b66d === "video" && this._previewVisualKind === "image") {
      this._updatePreviewControls();
      return;
    }
    const _0x5a2c10 = _0x45b6b7.immediate === true || _0x45b6b7.allowDuringPlayback === true;
    if ((this._playing || this._playPreviewPending) && !_0x5a2c10) {
      this._pendingPreviewSeek[_0xc0b66d] = null;
      this._updatePreviewControls();
      return;
    }
    const _0x5493cd = this._getPreviewMedia(_0xc0b66d);
    const _0x546908 = Math.max(0, toNumber(this._pendingPreviewSeek[_0xc0b66d], 0));
    if (!_0x5493cd) {
      return;
    }
    if (_0x5493cd.readyState < 1) {
      if (!_0x5493cd.__mediaClipSeekPending) {
        _0x5493cd.__mediaClipSeekPending = true;
        _0x5493cd.addEventListener("loadedmetadata", () => {
          _0x5493cd.__mediaClipSeekPending = false;
          this._applyPreviewSeek(_0xc0b66d, _0x45b6b7);
        }, {
          once: true
        });
      }
      return;
    }
    const _0x53b9d5 = this._getPreviewSeekState(_0xc0b66d);
    const _0x51d5a3 = _0x45b6b7.immediate === true;
    const _0x53a3f9 = Number.isFinite(_0x5493cd.duration) && _0x5493cd.duration > 0 ? Math.min(_0x546908, _0x5493cd.duration) : _0x546908;
    const _0x21826d = toNumber(_0x5493cd.currentTime, _0x53a3f9);
    const _0x20abb3 = toNumber(_0x53b9d5.lastAppliedSec, Number.NaN);
    if (!_0x51d5a3 && (Math.abs(_0x21826d - _0x53a3f9) < PREVIEW_SCRUB_SEEK_EPSILON_SEC || Number.isFinite(_0x20abb3) && Math.abs(_0x53a3f9 - _0x20abb3) < PREVIEW_SCRUB_SEEK_EPSILON_SEC)) {
      this._updatePreviewControls();
      return;
    }
    try {
      _0x5493cd.currentTime = _0x53a3f9;
      _0x53b9d5.lastAppliedSec = _0x53a3f9;
    } catch {}
    this._updatePreviewControls();
  }
  _syncPreviewTime(_0x3a93f6, _0x4fdec4, _0x477a2a = {}) {
    const _0x6f87d = _0x477a2a.immediate === true || _0x477a2a.allowDuringPlayback === true;
    if ((this._playing || this._playPreviewPending) && !_0x6f87d) {
      return;
    }
    const _0x2c1336 = Math.max(0, toNumber(_0x4fdec4, 0));
    this._pendingPreviewSeek[_0x3a93f6] = _0x2c1336;
    if (_0x3a93f6 === "video" && this._previewVisualKind === "image") {
      this._updatePreviewControls();
      return;
    }
    if (!this._getPreviewMedia(_0x3a93f6)) {
      return;
    }
    if (_0x477a2a.immediate === true) {
      this._cancelPreviewSeek(_0x3a93f6);
      this._applyPreviewSeek(_0x3a93f6, {
        immediate: true
      });
      return;
    }
    this._schedulePreviewSeek(_0x3a93f6, _0x477a2a);
  }
  _applyPendingVideoSourceSeek(_0x47a007 = this._videoPreview) {
    const _0x1aa179 = _0x47a007?.__mediaClipPendingSourceSeek;
    if (!_0x1aa179 || typeof _0x1aa179 !== "object") {
      return false;
    }
    const _0x2dd549 = normalizeText(_0x1aa179.src);
    const _0x4c4bff = this._normalizePreviewSourceIdentity(firstNonEmpty(_0x47a007.dataset?.desktopMediaSourceUrl, _0x47a007.getAttribute?.("src"), _0x47a007.currentSrc, _0x47a007.src));
    const _0x2336a7 = this._normalizePreviewSourceIdentity(_0x2dd549);
    if (_0x2336a7 && _0x4c4bff !== _0x2336a7) {
      return false;
    }
    delete _0x47a007.__mediaClipPendingSourceSeek;
    const _0x28a22b = toNumber(_0x1aa179.sec, Number.NaN);
    if (!Number.isFinite(_0x28a22b)) {
      return false;
    }
    this._syncPreviewTime("video", Math.max(0, _0x28a22b), {
      immediate: true
    });
    this._waitForPendingVideoSourceSeek(_0x47a007, _0x28a22b);
    return true;
  }
  _normalizePreviewSourceIdentity(_0x16b2a5) {
    const _0x2b13bb = normalizeText(_0x16b2a5);
    if (!_0x2b13bb) {
      return "";
    }
    try {
      return new URL(_0x2b13bb, globalThis.location?.href || "http://127.0.0.1/").href;
    } catch {
      return _0x2b13bb;
    }
  }
  _showVideoSourceSwitchHold(_0x35fe21 = this._videoPreview) {
    const _0x396d52 = _0x35fe21?.parentElement;
    if (!_0x396d52 || !_0x35fe21) {
      return false;
    }
    this._clearVideoSourceSwitchHold(_0x35fe21);
    const _0x4fe2cb = document.createElement("canvas");
    _0x4fe2cb.className = "media-clip-source-switch-hold";
    const _0x3a23c3 = _0x35fe21.getBoundingClientRect?.() || _0x396d52.getBoundingClientRect?.() || {};
    const _0x3b53c3 = Math.max(1, Math.round(toNumber(_0x35fe21.videoWidth, 0) || toNumber(_0x3a23c3.width, 0) || 1));
    const _0x21d801 = Math.max(1, Math.round(toNumber(_0x35fe21.videoHeight, 0) || toNumber(_0x3a23c3.height, 0) || 1));
    _0x4fe2cb.width = _0x3b53c3;
    _0x4fe2cb.height = _0x21d801;
    let _0x433647 = false;
    try {
      const _0x5b09f4 = _0x4fe2cb.getContext?.("2d");
      if (_0x5b09f4) {
        _0x5b09f4.drawImage(_0x35fe21, 0, 0, _0x3b53c3, _0x21d801);
        _0x433647 = true;
      }
    } catch {}
    if (_0x433647) {
      _0x396d52.appendChild(_0x4fe2cb);
      _0x35fe21.__mediaClipSourceSwitchHold = _0x4fe2cb;
      this._videoSourceSwitchHold = _0x4fe2cb;
    }
    return _0x433647;
  }
  _clearVideoSourceSwitchHold(_0x4eac56 = this._videoPreview) {
    const _0x3b1dfa = _0x4eac56?.__mediaClipSourceSwitchHold || this._videoSourceSwitchHold || null;
    _0x3b1dfa?.remove?.();
    if (_0x4eac56 && _0x3b1dfa && _0x4eac56.__mediaClipSourceSwitchHold === _0x3b1dfa) {
      delete _0x4eac56.__mediaClipSourceSwitchHold;
    }
    if (_0x3b1dfa && this._videoSourceSwitchHold === _0x3b1dfa) {
      this._videoSourceSwitchHold = null;
    }
    _0x4eac56?.classList?.remove("is-source-switching");
  }
  _cancelPendingVideoSourceSeek(_0x4dedaa = this._videoPreview, _0x3a06f1 = {}) {
    if (!_0x4dedaa) {
      return;
    }
    const _0x2b50a0 = _0x4dedaa.__mediaClipSourceSeekFinish;
    if (_0x2b50a0) {
      try {
        _0x4dedaa.removeEventListener?.("seeked", _0x2b50a0);
      } catch {}
    }
    const _0x54ee5d = _0x4dedaa.__mediaClipSourceSeekFallbackTimer;
    if (_0x54ee5d) {
      try {
        clearTimeout(_0x54ee5d);
      } catch {}
    }
    delete _0x4dedaa.__mediaClipWaitingSourceSeek;
    delete _0x4dedaa.__mediaClipSourceSeekFinish;
    delete _0x4dedaa.__mediaClipSourceSeekFallbackTimer;
    delete _0x4dedaa.__mediaClipSourceSeekTargetSec;
    delete _0x4dedaa.__mediaClipSourceSeekToken;
    if (_0x3a06f1.clearHold !== false) {
      this._clearVideoSourceSwitchHold(_0x4dedaa);
    }
  }
  _waitForPendingVideoSourceSeek(_0x59951f = this._videoPreview, _0x5c6d40 = 0) {
    if (!_0x59951f) {
      return;
    }
    const _0x22481f = Math.max(0, toNumber(_0x5c6d40, 0));
    _0x59951f.__mediaClipSourceSeekTargetSec = _0x22481f;
    if (_0x22481f <= PREVIEW_SCRUB_SEEK_EPSILON_SEC) {
      this._finishPendingVideoSourceSeek(_0x59951f);
      return;
    }
    if (!_0x59951f.__mediaClipWaitingSourceSeek) {
      _0x59951f.__mediaClipWaitingSourceSeek = true;
      const _0x5ecec0 = () => this._finishPendingVideoSourceSeek(_0x59951f);
      _0x59951f.__mediaClipSourceSeekFinish = _0x5ecec0;
      _0x59951f.addEventListener?.("seeked", _0x5ecec0, {
        once: true
      });
    }
    const _0x47a26b = _0x59951f.__mediaClipSourceSeekFallbackTimer;
    if (_0x47a26b) {
      try {
        clearTimeout(_0x47a26b);
      } catch {}
    }
    if (typeof setTimeout === "function") {
      const _0x10b28c = toNumber(_0x59951f.__mediaClipSourceSeekToken, 0) + 1;
      _0x59951f.__mediaClipSourceSeekToken = _0x10b28c;
      _0x59951f.__mediaClipSourceSeekFallbackTimer = setTimeout(() => {
        if (_0x59951f.__mediaClipSourceSeekToken !== _0x10b28c) {
          return;
        }
        this._finishPendingVideoSourceSeek(_0x59951f);
      }, 250);
    }
  }
  _finishPendingVideoSourceSeek(_0x16ce4e = this._videoPreview) {
    if (!_0x16ce4e?.__mediaClipWaitingSourceSeek && !_0x16ce4e?.__mediaClipSourceSwitchHold && !_0x16ce4e?.classList?.contains?.("is-source-switching")) {
      return;
    }
    const _0x5ea4da = _0x16ce4e.__mediaClipSourceSeekFinish;
    if (_0x5ea4da) {
      try {
        _0x16ce4e.removeEventListener?.("seeked", _0x5ea4da);
      } catch {}
    }
    const _0x178a0c = _0x16ce4e.__mediaClipSourceSeekFallbackTimer;
    if (_0x178a0c) {
      try {
        clearTimeout(_0x178a0c);
      } catch {}
    }
    delete _0x16ce4e.__mediaClipWaitingSourceSeek;
    delete _0x16ce4e.__mediaClipSourceSeekFinish;
    delete _0x16ce4e.__mediaClipSourceSeekFallbackTimer;
    delete _0x16ce4e.__mediaClipSourceSeekTargetSec;
    delete _0x16ce4e.__mediaClipSourceSeekToken;
    this._clearVideoSourceSwitchHold(_0x16ce4e);
    if (this._playing) {
      try {
        _0x16ce4e.play?.()?.catch?.(() => {});
      } catch {}
    }
    this._updatePreviewControls();
  }
  _render() {
    if (!this.el) {
      return;
    }
    this._removeMaterialMenuPortal();
    const _0x2a24f4 = !!this._mediaClip.tracks?.video || !!this._mediaClip.tracks?.audio;
    const _0x2167e2 = _0x2a24f4 && this._mediaClip.expanded === true;
    if (_0x2167e2) {
      this._claimExpandedEditor();
    } else {
      this._materialMenu = null;
      this._releaseExpandedEditor();
      this._disposePreviewMedia();
    }
    this.el.replaceChildren();
    this.el.classList.toggle("is-picking", this._isPicking());
    this.el.classList.toggle("is-expanded", _0x2167e2);
    this._syncHostPresentation(_0x2167e2);
    this._syncDocumentExitListener(_0x2167e2);
    this._syncMaterialMenuDismissListener(_0x2167e2 && !!this._materialMenu);
    this._syncDocumentKeyListener(_0x2167e2);
    this._syncDeleteMaterialShortcutListener(_0x2167e2);
    if (!_0x2a24f4) {
      this.el.appendChild(this._renderEmpty());
      return;
    }
    if (_0x2167e2) {
      this.el.append(this._renderCompact(), this._renderPreviewPanel());
    } else {
      this.el.appendChild(this._renderCompact());
    }
    if (_0x2167e2 && this._materialMenu) {
      this._renderMaterialMenuPortal();
    }
    if (this._exporting) {
      this._startExportLoading();
    }
  }
  _rerenderCompactOnly() {
    if (!this.el) {
      return false;
    }
    const _0x156f95 = this.el.querySelector?.(".media-clip-compact");
    const _0x492021 = _0x156f95?.parentNode;
    if (!_0x156f95 || !_0x492021) {
      this._render();
      return false;
    }
    this._removeMaterialMenuPortal();
    const _0x431f2f = this._renderCompact();
    if (typeof _0x492021.replaceChild === "function") {
      _0x492021.replaceChild(_0x431f2f, _0x156f95);
    } else if (Array.isArray(_0x492021.children)) {
      const _0x1104c9 = _0x492021.children.indexOf(_0x156f95);
      if (_0x1104c9 >= 0) {
        _0x431f2f.parentNode = _0x492021;
        _0x156f95.parentNode = null;
        _0x492021.children.splice(_0x1104c9, 1, _0x431f2f);
      }
    }
    const _0x4873ae = !!this._mediaClip.tracks?.video || !!this._mediaClip.tracks?.audio;
    const _0x542e87 = _0x4873ae && this._mediaClip.expanded === true;
    this._syncDocumentExitListener(_0x542e87);
    this._syncMaterialMenuDismissListener(_0x542e87 && !!this._materialMenu);
    this._syncDocumentKeyListener(_0x542e87);
    this._syncDeleteMaterialShortcutListener(_0x542e87);
    if (_0x542e87 && this._materialMenu) {
      this._renderMaterialMenuPortal();
    }
    return true;
  }
  _syncHostPresentation(_0x2d5f9e) {
    const _0x21fefc = () => {
      const _0x3d0508 = this.el?.closest?.(".v2-node-component") || this.el?.parentElement;
      if (_0x3d0508?.style) {
        _0x3d0508.style.overflow = "visible";
      }
      const _0x556433 = document.getElementById(this.id);
      if (!_0x556433?.style) {
        return;
      }
      _0x556433.classList.toggle("media-clip-expanded-host", _0x2d5f9e === true);
      syncRendererNodePresentationZIndex(_0x556433, _0x2d5f9e === true ? MEDIA_CLIP_EXPANDED_HOST_Z_INDEX : _0x556433.classList.contains("selected") || _0x556433.classList.contains("v2-selected") ? "100" : "10");
    };
    _0x21fefc();
    if (!this.el?.parentElement && typeof requestAnimationFrame === "function") {
      requestAnimationFrame(_0x21fefc);
    }
  }
  _syncDocumentExitListener(_0x524676) {
    if (typeof document === "undefined") {
      return;
    }
    if (!_0x524676) {
      if (this._onDocumentPointerDown) {
        document.removeEventListener("pointerdown", this._onDocumentPointerDown, true);
        this._onDocumentPointerDown = null;
      }
      return;
    }
    if (this._onDocumentPointerDown) {
      return;
    }
    this._onDocumentPointerDown = _0x146f7b => {
      if (this._mediaClip.expanded !== true) {
        return;
      }
      const _0x482346 = document.getElementById(this.id);
      if (this.el?.contains?.(_0x146f7b.target)) {
        return;
      }
      if (this._materialMenuEl?.contains?.(_0x146f7b.target)) {
        return;
      }
      if (_0x482346?.contains?.(_0x146f7b.target)) {
        _0x146f7b.preventDefault?.();
        _0x146f7b.stopPropagation?.();
        return;
      }
      this._setExpanded(false);
    };
    document.addEventListener("pointerdown", this._onDocumentPointerDown, true);
  }
  _syncMaterialMenuDismissListener(_0x54c303) {
    if (typeof document === "undefined") {
      return;
    }
    if (!_0x54c303) {
      if (this._onMaterialMenuPointerDown) {
        document.removeEventListener("pointerdown", this._onMaterialMenuPointerDown, true);
        this._onMaterialMenuPointerDown = null;
      }
      return;
    }
    if (this._onMaterialMenuPointerDown) {
      return;
    }
    this._onMaterialMenuPointerDown = _0xb268a => {
      if (!this._materialMenu) {
        return;
      }
      if (_0xb268a?.button === 2) {
        return;
      }
      if (this._materialMenuEl?.contains?.(_0xb268a.target)) {
        return;
      }
      this._closeMaterialMenu();
    };
    document.addEventListener("pointerdown", this._onMaterialMenuPointerDown, true);
  }
  _removeMaterialMenuPortal() {
    this._materialMenuEl?.parentNode?.removeChild?.(this._materialMenuEl);
    this._materialMenuEl = null;
  }
  _closeMaterialMenu(_0x378145 = {}) {
    if (!this._materialMenu && !this._materialMenuEl) {
      return;
    }
    this._materialMenu = null;
    this._syncMaterialMenuDismissListener(false);
    this._removeMaterialMenuPortal();
    if (_0x378145.render === true) {
      this._render();
    }
  }
  _materialMenuHost() {
    return this.el?.querySelector?.(".media-clip-compact.is-editing") || this.el?.querySelector?.(".media-clip-compact") || this.el || null;
  }
  _materialMenuLocalPoint(_0x2c4f58, _0xb7d036, _0x28322b = this._materialMenuHost()) {
    const _0x53746e = _0x28322b?.getBoundingClientRect?.() || {
      left: 0,
      top: 0,
      width: 0,
      height: 0
    };
    const _0x5b8caa = readLayoutWidthPx(_0x28322b, _0x53746e.width || 1);
    const _0x1abb72 = toNumber(_0x28322b?.offsetHeight, 0) || parseFloat(_0x28322b?.style?.getPropertyValue?.("height")) || _0x53746e.height || 1;
    const _0x5a8bf5 = _0x53746e.width > 0 && _0x5b8caa > 0 ? _0x53746e.width / _0x5b8caa : 1;
    const _0x37d381 = _0x53746e.height > 0 && _0x1abb72 > 0 ? _0x53746e.height / _0x1abb72 : _0x5a8bf5;
    return {
      x: (toNumber(_0x2c4f58, _0x53746e.left) - toNumber(_0x53746e.left, 0)) / (_0x5a8bf5 || 1),
      y: (toNumber(_0xb7d036, _0x53746e.top) - toNumber(_0x53746e.top, 0)) / (_0x37d381 || 1)
    };
  }
  _renderMaterialMenuPortal() {
    if (typeof document === "undefined" || !this._materialMenu) {
      return;
    }
    const _0x50b415 = this._materialMenuHost();
    if (!_0x50b415) {
      return;
    }
    const _0x382307 = this._renderMaterialMenu();
    this._materialMenuEl = _0x382307;
    _0x50b415.appendChild(_0x382307);
    this._positionMaterialMenu(_0x382307, _0x50b415);
  }
  _positionMaterialMenu(_0x130843, _0x4b868a = this._materialMenuHost()) {
    if (!_0x130843) {
      return;
    }
    const _0x3b09d7 = this._materialMenu || {};
    const _0x33ddc7 = 8;
    const _0x3accf1 = toNumber(_0x3b09d7.x ?? _0x3b09d7.left, _0x33ddc7);
    const _0x13871b = toNumber(_0x3b09d7.y ?? _0x3b09d7.top, _0x33ddc7);
    const _0x51faa4 = _0x4b868a?.getBoundingClientRect?.() || {
      left: 0,
      top: 0,
      width: 0,
      height: 0
    };
    const _0x258c67 = readLayoutWidthPx(_0x4b868a, _0x51faa4.width || 1);
    const _0x41a847 = toNumber(_0x4b868a?.offsetHeight, 0) || parseFloat(_0x4b868a?.style?.getPropertyValue?.("height")) || _0x51faa4.height || 1;
    const _0x3d72cc = _0x51faa4.width > 0 && _0x258c67 > 0 ? _0x51faa4.width / _0x258c67 : 1;
    const _0x18ed8c = _0x51faa4.height > 0 && _0x41a847 > 0 ? _0x51faa4.height / _0x41a847 : _0x3d72cc;
    const _0x2ad80c = toNumber(_0x130843.offsetWidth, 0);
    const _0x25cc8c = toNumber(_0x130843.offsetHeight, 0);
    const _0x50d2b1 = typeof window !== "undefined" ? toNumber(window.innerWidth, 0) : 0;
    const _0x160e12 = typeof window !== "undefined" ? toNumber(window.innerHeight, 0) : 0;
    const _0x2c7403 = _0x50d2b1 > 0 && _0x3d72cc > 0 ? Math.max(_0x33ddc7, (_0x50d2b1 - _0x51faa4.left) / _0x3d72cc - _0x2ad80c - _0x33ddc7) : _0x3accf1;
    const _0x1cdb34 = _0x160e12 > 0 && _0x18ed8c > 0 ? Math.max(_0x33ddc7, (_0x160e12 - _0x51faa4.top) / _0x18ed8c - _0x25cc8c - _0x33ddc7) : _0x13871b;
    _0x130843.style.left = Math.min(_0x2c7403, Math.max(_0x33ddc7, _0x3accf1)) + "px";
    _0x130843.style.top = Math.min(_0x1cdb34, Math.max(_0x33ddc7, _0x13871b)) + "px";
  }
  _isEditableEventTarget(_0x201f5d) {
    return !!_0x201f5d?.closest?.("input, textarea, select, [contenteditable=\"true\"], [role=\"textbox\"]");
  }
  _syncDocumentKeyListener(_0x1045f0) {
    if (typeof document === "undefined") {
      return;
    }
    if (!_0x1045f0) {
      if (this._onDocumentKeyDown) {
        document.removeEventListener("keydown", this._onDocumentKeyDown, true);
        this._onDocumentKeyDown = null;
      }
      return;
    }
    if (this._onDocumentKeyDown) {
      return;
    }
    this._onDocumentKeyDown = _0x2e4df7 => this._handleDocumentKeyDown(_0x2e4df7);
    document.addEventListener("keydown", this._onDocumentKeyDown, true);
  }
  _syncDeleteMaterialShortcutListener(_0x5a2794) {
    if (typeof window === "undefined") {
      return;
    }
    if (!_0x5a2794) {
      if (this._onDeleteMaterialShortcut) {
        window.removeEventListener(MEDIA_CLIP_DELETE_MATERIAL_EVENT, this._onDeleteMaterialShortcut);
        this._onDeleteMaterialShortcut = null;
      }
      return;
    }
    if (this._onDeleteMaterialShortcut) {
      return;
    }
    this._onDeleteMaterialShortcut = _0x4a8fdc => {
      const _0xb71c14 = normalizeText(_0x4a8fdc?.detail?.nodeId);
      if (_0xb71c14 && _0xb71c14 !== this.id) {
        return;
      }
      if (this._mediaClip.expanded !== true) {
        return;
      }
      this._deleteActiveMaterialFromShortcut();
    };
    window.addEventListener(MEDIA_CLIP_DELETE_MATERIAL_EVENT, this._onDeleteMaterialShortcut);
  }
  _deleteActiveMaterialFromShortcut() {
    const _0x68afda = typeof performance !== "undefined" && typeof performance.now === "function" ? performance.now() : Date.now();
    if (_0x68afda - this._lastDeleteMaterialShortcutAt < 80) {
      return;
    }
    this._lastDeleteMaterialShortcutAt = _0x68afda;
    this._deleteActiveMaterial();
  }
  _handleDocumentKeyDown(_0x1a9e37) {
    if (this._mediaClip.expanded !== true) {
      return;
    }
    if (this._isEditableEventTarget(_0x1a9e37?.target)) {
      return;
    }
    if (_0x1a9e37?.key === "Escape" && this._materialMenu) {
      _0x1a9e37.preventDefault?.();
      _0x1a9e37.stopPropagation?.();
      this._closeMaterialMenu();
      return;
    }
    if (_0x1a9e37?.key === " " || _0x1a9e37?.code === "Space") {
      _0x1a9e37.preventDefault?.();
      _0x1a9e37.stopPropagation?.();
      _0x1a9e37.stopImmediatePropagation?.();
      if (!_0x1a9e37?.repeat) {
        this._togglePreviewPlayback();
      }
      return;
    }
  }
  _renderPickButton() {
    const _0x28b2de = document.createElement("button");
    _0x28b2de.type = "button";
    _0x28b2de.className = "media-clip-pick-btn";
    _0x28b2de.classList.toggle("is-active", this._isPicking());
    const _0x38de8a = mediaClipText("pick.addByConnection");
    _0x28b2de.title = _0x38de8a;
    _0x28b2de.setAttribute("aria-label", _0x38de8a);
    _0x28b2de.appendChild(createConnectCursorIcon());
    _0x28b2de.addEventListener("click", _0x143866 => this._togglePickConnect(_0x143866));
    return _0x28b2de;
  }
  _renderEmpty() {
    const _0x1f0bfa = document.createElement("div");
    _0x1f0bfa.className = "media-clip-empty";
    const _0x91d0c7 = document.createElement("div");
    _0x91d0c7.className = "media-clip-empty-body";
    const _0x2b28c5 = document.createElement("button");
    _0x2b28c5.type = "button";
    _0x2b28c5.className = "media-clip-pick-btn";
    _0x2b28c5.classList.toggle("is-active", this._isPicking());
    const _0x5c22bf = mediaClipText("pick.addByConnection");
    _0x2b28c5.title = _0x5c22bf;
    _0x2b28c5.setAttribute("aria-label", _0x5c22bf);
    _0x2b28c5.appendChild(createConnectCursorIcon());
    _0x2b28c5.addEventListener("click", _0x36d5fb => this._togglePickConnect(_0x36d5fb));
    _0x91d0c7.appendChild(_0x2b28c5);
    const _0x498c66 = document.createElement("div");
    _0x498c66.className = "media-clip-empty-copy";
    _0x498c66.classList.toggle("is-picking", this._isPicking());
    const _0x110203 = document.createElement("div");
    _0x110203.textContent = this._isPicking() ? mediaClipText("empty.selectMaterial") : mediaClipText("empty.connectHint");
    _0x498c66.appendChild(_0x110203);
    if (this._isPicking()) {
      const _0xbcca12 = document.createElement("div");
      _0xbcca12.className = "media-clip-esc";
      _0xbcca12.textContent = mediaClipText("empty.exit");
      _0x498c66.appendChild(_0xbcca12);
    }
    _0x91d0c7.appendChild(_0x498c66);
    _0x1f0bfa.appendChild(_0x91d0c7);
    return _0x1f0bfa;
  }
  _renderCompact() {
    const _0xfc9bf8 = this._mediaClip.expanded === true;
    const _0x46df35 = document.createElement("div");
    _0x46df35.className = "media-clip-compact";
    _0x46df35.classList.toggle("is-editing", _0xfc9bf8);
    _0x46df35.classList.toggle("is-menu-open", this._menuOpen === true);
    const _0x21a094 = document.createElement("div");
    _0x21a094.className = "media-clip-compact-body";
    const _0x271c11 = document.createElement("div");
    _0x271c11.className = "media-clip-timeline-scroll";
    this._primeTimelineScroll(_0x271c11);
    _0x271c11.addEventListener("click", () => {
      if (this._mediaClip.expanded === true) {
        return;
      }
      this._setExpanded(true);
    });
    this._bindTimelineScroll(_0x271c11);
    const _0x3e4478 = document.createElement("div");
    _0x3e4478.className = "media-clip-compact-timeline";
    _0x3e4478.classList.toggle("is-editing", _0xfc9bf8);
    const _0x478731 = this._timelineTrackContentWidth({
      compact: !_0xfc9bf8
    });
    const _0x4517c8 = this._timelineAddSlotLeftPx(_0x478731);
    const _0x5a2f21 = this._timelineContentWidth(_0x478731);
    const _0x1b757c = this._timelineAxisWidthPx();
    _0x3e4478.style.setProperty("--media-clip-track-content-width", _0x478731 + "px");
    _0x3e4478.style.setProperty("--media-clip-timeline-content-width", _0x5a2f21 + "px");
    _0x3e4478.style.setProperty("--media-clip-add-left", _0x4517c8 + "px");
    _0x3e4478.style.setProperty("--media-clip-track-axis-width", _0x1b757c + "px");
    const _0x3c63f6 = this._audioTimelineClips(this._mediaClip.tracks.audio);
    const _0x51edb3 = this._audioLaneCount(_0x3c63f6);
    this._setAudioLaneCountStyle(_0x3e4478, _0x51edb3);
    _0x3e4478.appendChild(this._renderRuler(this._primaryDuration(), {
      compact: !_0xfc9bf8,
      timelineWidthPx: _0x478731
    }));
    const _0x2f354a = document.createElement("div");
    _0x2f354a.className = "media-clip-timeline-lane";
    _0x2f354a.classList.toggle("has-audio-track", !!this._mediaClip.tracks.audio);
    this._setAudioLaneCountStyle(_0x2f354a, _0x51edb3);
    _0x2f354a.addEventListener("pointerleave", () => {
      if (this._timelineDrag()) {
        return;
      }
      this._clearTimelineHoverState(_0x2f354a);
      this._restoreTimelinePlayheads();
    });
    const _0x57016b = document.createElement("div");
    _0x57016b.className = "media-clip-timeline-tracks";
    _0x57016b.classList.toggle("has-audio-track", !!this._mediaClip.tracks.audio);
    this._setAudioLaneCountStyle(_0x57016b, _0x51edb3);
    if (this._mediaClip.tracks.audio) {
      _0x2f354a.appendChild(this._renderAudioLaneControls(_0x3c63f6, _0x51edb3));
    }
    if (this._mediaClip.tracks.video) {
      _0x57016b.appendChild(this._renderTrack("video", {
        compact: !_0xfc9bf8,
        timelineWidthPx: _0x478731
      }));
    }
    if (this._mediaClip.tracks.audio) {
      _0x57016b.appendChild(this._renderTrack("audio", {
        compact: !_0xfc9bf8,
        timelineWidthPx: _0x478731
      }));
    }
    const _0x394f54 = this._renderShortcutCropButton();
    const _0x2da2d7 = this._renderPickButton();
    _0x2da2d7.classList.add("media-clip-add-btn");
    const _0xeea1b5 = mediaClipText("pick.continueAdd");
    _0x2da2d7.title = _0xeea1b5;
    _0x2da2d7.setAttribute("aria-label", _0xeea1b5);
    _0x2f354a.append(_0x57016b, _0x2da2d7);
    _0x3e4478.appendChild(_0x2f354a);
    if (_0xfc9bf8) {
      this._bindTimelinePointerCursors(_0x3e4478, _0x57016b);
      _0x3e4478.appendChild(this._renderTimelineCursors(this._primaryDuration()));
    }
    _0x271c11.appendChild(_0x3e4478);
    this._primeTimelineScroll(_0x271c11);
    _0x21a094.append(_0x271c11);
    _0x46df35.append(_0x21a094, _0x394f54);
    if (_0xfc9bf8) {
      _0x46df35.appendChild(this._renderTimelineHintCarousel());
      _0x46df35.appendChild(this._renderTimelineTools());
    }
    return _0x46df35;
  }
  _renderAudioLaneControls(_0x1df593 = [], _0x341420 = 1) {
    const _0x3d5851 = document.createElement("div");
    _0x3d5851.className = "media-clip-audio-lane-controls";
    _0x3d5851.dataset.uiStop = "true";
    this._setAudioLaneCountStyle(_0x3d5851, _0x341420);
    for (let _0x23eeba = 0; _0x23eeba < _0x341420; _0x23eeba += 1) {
      const _0x540baf = this._audioClipsForLane(_0x23eeba, _0x1df593);
      const _0xb109a8 = this._isAudioLaneMuted(_0x23eeba, _0x1df593);
      const _0x322f73 = document.createElement("button");
      _0x322f73.type = "button";
      _0x322f73.className = "media-clip-audio-lane-mute-btn";
      _0x322f73.classList.toggle("is-muted", _0xb109a8);
      _0x322f73.disabled = _0x540baf.length === 0;
      _0x322f73.dataset.audioLaneIndex = String(_0x23eeba);
      _0x322f73.dataset.uiStop = "true";
      _0x322f73.title = mediaClipText(_0xb109a8 ? "audioLane.unmute" : "audioLane.mute");
      _0x322f73.setAttribute("aria-label", _0x322f73.title);
      _0x322f73.style.setProperty("--media-clip-audio-lane-top", _0x23eeba * (MEDIA_CLIP_AUDIO_LANE_HEIGHT_PX + MEDIA_CLIP_AUDIO_LANE_GAP_PX) + "px");
      const _0x58cdd9 = createMediaClipSvgElement("svg");
      _0x58cdd9.setAttribute("viewBox", "0 0 24 24");
      _0x58cdd9.setAttribute("width", "16");
      _0x58cdd9.setAttribute("height", "16");
      _0x58cdd9.setAttribute("aria-hidden", "true");
      const _0x4c7339 = createMediaClipSvgElement("path");
      _0x4c7339.setAttribute("d", "M4 9v6h4l5 4V5L8 9H4z");
      _0x4c7339.setAttribute("fill", "currentColor");
      _0x58cdd9.appendChild(_0x4c7339);
      const _0x58640c = createMediaClipSvgElement("path");
      _0x58640c.setAttribute("d", _0xb109a8 ? "M16 9l5 5m0-5l-5 5" : "M16 8c1.3 1.4 1.3 4.6 0 6M18.5 6c2.4 2.6 2.4 8.4 0 11");
      _0x58640c.setAttribute("fill", "none");
      _0x58640c.setAttribute("stroke", "currentColor");
      _0x58640c.setAttribute("stroke-width", "2");
      _0x58640c.setAttribute("stroke-linecap", "round");
      _0x58cdd9.appendChild(_0x58640c);
      _0x322f73.appendChild(_0x58cdd9);
      _0x322f73.addEventListener("pointerdown", stopPointer);
      _0x322f73.addEventListener("click", _0x4fb85f => {
        stopPointer(_0x4fb85f);
        this._toggleAudioLaneMuted(_0x23eeba);
      });
      _0x3d5851.appendChild(_0x322f73);
    }
    return _0x3d5851;
  }
  _syncAudioLaneControls(_0x5e51ae = this._audioTimelineClips(this._mediaClip.tracks?.audio), _0x570342 = this._audioLaneCount(_0x5e51ae)) {
    const _0x3889d9 = this.el?.querySelector?.(".media-clip-audio-lane-controls");
    if (!_0x3889d9) {
      return;
    }
    const _0x2602b0 = this._renderAudioLaneControls(_0x5e51ae, _0x570342);
    this._setAudioLaneCountStyle(_0x3889d9, _0x570342);
    _0x3889d9.replaceChildren?.(...Array.from(_0x2602b0.children || []));
  }
  _primeTimelineScroll(_0x24163a) {
    return a409_0x2d4e91(this, _0x24163a);
  }
  _bindTimelineScroll(_0x2ddf82) {
    return a409_0x5958e2(this, _0x2ddf82);
  }
  _shouldLockTimelineWheelScroll(_0x3ca2d7, _0x37c2d7 = {}) {
    return a409_0x5a8091(this, _0x3ca2d7, _0x37c2d7);
  }
  _timelineMaterialRangeSec() {
    return a409_0x5f3eb0(this);
  }
  _timelineMaterialScrollBounds(_0x19b0db, _0x118da2 = {}) {
    return a409_0x172350(this, _0x19b0db, _0x118da2);
  }
  _clampTimelineScrollLeft(_0x38c540, _0x435de2 = 0, _0x595a4f = {}) {
    return a409_0x2b6fff(this, _0x38c540, _0x435de2, _0x595a4f);
  }
  _handleTimelineZoomWheel(_0xf4ea5, _0x1f7d96) {
    return a409_0x182829(this, _0xf4ea5, _0x1f7d96);
  }
  _syncTimelineScrollFade(_0x3e30b4) {
    return a409_0x37d780(this, _0x3e30b4);
  }
  _timelineDragScrollDeltaPx(_0x1bb3d0 = this._timelineDrag()) {
    return a409_0x354033(this, _0x1bb3d0);
  }
  _timelineDragDeltaPx(_0x3493a0 = this._timelineDrag(), _0x10bb00 = {}) {
    return a409_0x31ae20(this, _0x3493a0, _0x10bb00);
  }
  _timelineDragAutoScrollVelocity(_0x22a718, _0x417b29) {
    return a409_0x140b2a(_0x22a718, _0x417b29);
  }
  _scheduleTimelineDragAutoScroll(_0x1bca21 = this._timelineDrag()) {
    return a409_0x1ab06c(this, _0x1bca21);
  }
  _stopTimelineDragAutoScroll() {
    return a409_0x54db8a(this);
  }
  _runTimelineDragAutoScroll(_0x567491) {
    return a409_0x45aa9c(this, _0x567491);
  }
  _persistTimelineDragScroll(_0x1d62c7 = this._timelineDrag()) {
    return a409_0x47cab9(this, _0x1d62c7);
  }
  _renderShortcutCropButton() {
    const _0x5994b4 = makeButton("media-clip-tool-crop media-clip-shortcut-crop", mediaClipText("tools.splitMaterial"), "");
    _0x5994b4.tabIndex = -1;
    _0x5994b4.setAttribute("aria-hidden", "true");
    _0x5994b4.addEventListener("click", _0x11cf59 => {
      stopPointer(_0x11cf59);
      this._splitActiveMaterial();
    });
    return _0x5994b4;
  }
  _setDownloadMenuOpen(_0x404a49) {
    this._menuOpen = _0x404a49 === true;
    if (this._materialMenu) {
      this._materialMenu = null;
      this._removeMaterialMenuPortal();
      this._syncMaterialMenuDismissListener(false);
    }
    const _0x1bcfc3 = this.el?.querySelector?.(".media-clip-compact");
    _0x1bcfc3?.classList?.toggle("is-menu-open", this._menuOpen);
    const _0x4c3e27 = this.el?.querySelector?.(".media-clip-compact-tools");
    if (!_0x4c3e27) {
      return;
    }
    const _0x338811 = _0x4c3e27.querySelector?.(".media-clip-tool-download");
    _0x338811?.classList?.toggle("is-active", this._menuOpen);
    _0x4c3e27.querySelectorAll?.(".media-clip-menu")?.forEach(_0x3cbd0d => _0x3cbd0d.remove?.());
    if (this._menuOpen) {
      _0x4c3e27.appendChild(this._renderDownloadMenu());
    }
  }
  _renderTimelineTools() {
    const _0xacff2b = document.createElement("div");
    _0xacff2b.className = "media-clip-tools media-clip-compact-tools";
    const _0x2938ba = iconButton("media-clip-tool media-clip-tool-crop", mediaClipText("tools.splitMaterial"), "<circle cx=\"6\" cy=\"6\" r=\"3\"/><path d=\"M8.12 8.12 12 12\"/><path d=\"M20 4 8.12 15.88\"/><circle cx=\"6\" cy=\"18\" r=\"3\"/><path d=\"M14.8 14.8 20 20\"/>");
    const _0x3313f9 = document.createElement("span");
    _0x3313f9.className = "media-clip-tool-kbd";
    _0x3313f9.textContent = this._getShortcutLabel("clip-tool-crop", "C");
    _0x2938ba.appendChild(_0x3313f9);
    _0x2938ba.addEventListener("click", _0x18aed1 => {
      stopPointer(_0x18aed1);
      this._splitActiveMaterial();
    });
    const _0x5d6ff0 = iconButton("media-clip-tool media-clip-tool-download", mediaClipText("tools.export"), "<path d=\"M12 3v12\"/><path d=\"m7 10 5 5 5-5\"/><path d=\"M5 21h14\"/>");
    _0x5d6ff0.classList.toggle("is-active", this._menuOpen);
    _0x5d6ff0.addEventListener("click", _0x346b51 => {
      stopPointer(_0x346b51);
      this._setDownloadMenuOpen(!this._menuOpen);
    });
    _0xacff2b.append(_0x2938ba, _0x5d6ff0);
    if (this._menuOpen) {
      _0xacff2b.appendChild(this._renderDownloadMenu());
    }
    return _0xacff2b;
  }
  _renderTimelineHintCarousel() {
    const _0x5c5cb8 = document.createElement("div");
    _0x5c5cb8.className = "media-clip-helper-row";
    const _0x4d8e28 = document.createElement("div");
    _0x4d8e28.className = "media-clip-helper-left";
    const _0x511a9c = [[["kbd", "Space"], ["text", mediaClipText("hints.playPause")]], [["kbd", this._getShortcutLabel("clip-tool-crop", "C")], ["text", mediaClipText("hints.splitAtPlayhead")]], [["kbd", this._getShortcutLabel("delete", "Delete")], ["text", mediaClipText("hints.deleteCurrent")]], [["kbd", mediaClipText("hints.dragMaterial")], ["text", mediaClipText("hints.adjustOrder")]], [["kbd", mediaClipText("hints.dragEdges")], ["text", mediaClipText("hints.trimMaterial")]], [["kbd", mediaClipText("hints.rightClick")], ["text", mediaClipText("hints.exportOrDelete")]], [["text", mediaClipText("hints.connectButtonAdd")]], [["kbd", "Ctrl"], ["text", mediaClipText("hints.zoomTimeline")]]];
    _0x5c5cb8.style.setProperty("--media-clip-helper-count", String(_0x511a9c.length));
    _0x511a9c.forEach((_0x2a678c, _0x5ad675) => {
      const _0x39192d = document.createElement("div");
      _0x39192d.className = "media-clip-helper-msg";
      _0x39192d.style.setProperty("--media-clip-helper-index", String(_0x5ad675));
      _0x2a678c.forEach(([_0x18ed22, _0xa6999f]) => {
        const _0x9eda76 = document.createElement("span");
        _0x9eda76.className = _0x18ed22 === "kbd" ? "media-clip-helper-kbd" : "media-clip-helper-text";
        _0x9eda76.textContent = _0xa6999f;
        _0x39192d.appendChild(_0x9eda76);
      });
      _0x4d8e28.appendChild(_0x39192d);
    });
    _0x5c5cb8.appendChild(_0x4d8e28);
    return _0x5c5cb8;
  }
  _getShortcutLabel(_0x91b243, _0x4ebb0e = "") {
    const _0x2bcb78 = getShortcuts()?.[_0x91b243]?.keys;
    if (Array.isArray(_0x2bcb78) && _0x2bcb78.length > 0) {
      return _0x2bcb78.join("+");
    } else {
      return _0x4ebb0e;
    }
  }
  _renderMaterialMenu() {
    const _0x24fbde = this._materialMenu || {};
    const _0x36b6d5 = document.createElement("div");
    _0x36b6d5.className = "v2-canvas-ctx-menu media-clip-material-menu";
    _0x36b6d5.setAttribute("role", "menu");
    _0x36b6d5.dataset.uiStop = "true";
    const _0x4a5219 = (_0x328e64, _0x5de732) => {
      const _0xcc542e = document.createElement("div");
      _0xcc542e.className = "v2-menu-row";
      _0xcc542e.setAttribute("role", "menuitem");
      const _0x573ef1 = document.createElement("span");
      _0x573ef1.textContent = _0x328e64;
      _0xcc542e.appendChild(_0x573ef1);
      _0xcc542e.addEventListener("pointerdown", _0xb5a46d => {
        if (_0xb5a46d.button !== 0) {
          return;
        }
        stopPointer(_0xb5a46d);
        _0x5de732(_0xb5a46d);
      });
      return _0xcc542e;
    };
    const _0x5d66c4 = _0x4a5219(mediaClipText("materialMenu.exportToCanvas"), async () => {
      if (this._exporting === true) {
        return;
      }
      const {
        kind: _0x2874ff,
        clipIndex: _0x234d51
      } = this._materialMenu || _0x24fbde;
      this._closeMaterialMenu({
        render: false
      });
      await this._exportMaterialToCanvas(_0x2874ff, _0x234d51);
    });
    const _0xc063f7 = _0x24fbde.kind === "audio" ? this._audioTimelineClips(this._mediaClip.tracks?.audio)[Math.max(0, Math.trunc(toNumber(_0x24fbde.clipIndex, 0)))] || null : null;
    const _0x68a9e6 = _0xc063f7 ? _0x4a5219(mediaClipText(_0xc063f7.disabled === true ? "materialMenu.enable" : "materialMenu.disable"), () => {
      const {
        clipIndex: _0x1c17ff
      } = this._materialMenu || _0x24fbde;
      this._closeMaterialMenu({
        render: false
      });
      this._toggleAudioClipDisabled(_0x1c17ff);
    }) : null;
    const _0x4a3e69 = _0x4a5219(mediaClipText("materialMenu.delete"), () => {
      const {
        kind: _0x13aecc,
        clipIndex: _0x2ff105
      } = this._materialMenu || _0x24fbde;
      this._closeMaterialMenu({
        render: false
      });
      this._deleteMaterial(_0x13aecc, _0x2ff105);
    });
    _0x36b6d5.append(_0x5d66c4);
    if (_0x68a9e6) {
      _0x36b6d5.append(_0x68a9e6);
    }
    _0x36b6d5.append(_0x4a3e69);
    return _0x36b6d5;
  }
  _renderPreviewPanel() {
    return a409_0x72df93(this);
  }
  _previewLayoutTokens() {
    return a409_0x14a952();
  }
  _previewVideoLayoutClasses(_0x2d81c3 = {}) {
    return a409_0x44bde3(_0x2d81c3);
  }
  _syncPreviewPanelLayout(_0x455723, _0x31945c) {
    return a409_0xae69f1(this, _0x455723, _0x31945c);
  }
  _applyPreviewVideoLayout(_0x2cae04, _0x18dcc4 = {}) {
    return a409_0x41c7dc(this, _0x2cae04, _0x18dcc4);
  }
  _syncPreviewVideoLayoutFromElement(_0x3763f4 = this._videoPreview) {
    return a409_0x53752c(this, _0x3763f4);
  }
  _showPreviewImage(_0x5f3ad5 = {}, _0x5018ad = "") {
    return a409_0x4a694e(this, _0x5f3ad5, _0x5018ad);
  }
  _clearPreviewVideoFallback() {
    return a409_0x2e858a(this);
  }
  _showPreviewVideo(_0x28bbb6 = {}) {
    return a409_0x3a3da5(this, _0x28bbb6);
  }
  _ensurePreviewVideoElement() {
    return a409_0x4a5a0f(this);
  }
  _ensurePreviewImageElement() {
    return a409_0x11d15b(this);
  }
  _ensurePreviewAudioElement() {
    return a409_0x369d00(this);
  }
  _renderPreviewControls() {
    return a409_0x359d5a(this);
  }
  _renderPreview() {
    return a409_0x1a6d20(this);
  }
  _renderVideoFallback(_0x3a104d = "") {
    return a409_0x24c599(_0x3a104d);
  }
  _estimateTimelineWidth(_0x315321 = {}) {
    const _0x168848 = toNumber(_0x315321.timelineWidthPx, 0);
    if (_0x168848 > 0) {
      return Math.max(240, _0x168848);
    }
    const _0x30f682 = toNumber(this.nodeData?.width, MEDIA_CLIP_COMPACT_SIZE.width);
    const _0x5679b4 = _0x315321.compact === true ? 136 : 116;
    return Math.max(240, _0x30f682 - _0x5679b4);
  }
  _timelineViewportWidth() {
    const _0x2cbc44 = toNumber(this.nodeData?.width, MEDIA_CLIP_COMPACT_SIZE.width);
    return Math.max(240, _0x2cbc44 - 64);
  }
  _timelineZoom(_0x325da9 = {}) {
    return normalizeMediaClipTimelineView({
      zoom: _0x325da9.timelineZoom ?? this._timelineView?.zoom ?? this._mediaClip?.timelineView?.zoom
    }).zoom;
  }
  _timelineTrackContentWidth(_0x587f50 = {}) {
    const _0x2263e9 = this._timelineZoom(_0x587f50);
    const _0x3fadcd = this._primaryDuration({
      timelineZoom: _0x2263e9
    });
    return getMediaClipTimelineTrackWidthPx({
      durationSec: _0x3fadcd,
      viewportWidthPx: this._timelineViewportWidth(),
      zoom: _0x2263e9
    });
  }
  _timelineAxisWidthPx() {
    if (this._mediaClip.tracks?.audio) {
      return MEDIA_CLIP_TIMELINE_AXIS_WIDTH_PX;
    } else {
      return 0;
    }
  }
  _timelineMaterialEndSec() {
    const _0x39ec46 = this._mediaClip.tracks?.video;
    const _0x14296c = this._videoTimelineMaterialEnd(_0x39ec46);
    if (_0x14296c > 0) {
      return _0x14296c;
    }
    const _0x2bbf81 = this._mediaClip.tracks?.audio;
    if (_0x2bbf81) {
      return this._audioTimelineMaterialEnd(_0x2bbf81);
    }
    return 0;
  }
  _timelineAddSlotLeftPx(_0x318d04 = this._timelineTrackContentWidth(), _0x39bb7b = {}) {
    return getMediaClipTimelineAddSlotLeftPx({
      trackWidthPx: _0x318d04,
      displayDurationSec: _0x39bb7b.displayDurationSec ?? this._primaryDuration(),
      materialEndSec: _0x39bb7b.materialEndSec ?? this._timelineMaterialEndSec()
    });
  }
  _timelineContentWidth(_0x24b1c0 = this._timelineTrackContentWidth(), _0x317136 = {}) {
    return this._timelineAxisWidthPx() + getMediaClipTimelineContentWidthPx({
      trackWidthPx: _0x24b1c0,
      displayDurationSec: _0x317136.displayDurationSec ?? this._primaryDuration(),
      materialEndSec: _0x317136.materialEndSec ?? this._timelineMaterialEndSec()
    });
  }
  _syncTimelineAddSlotPosition(_0x5066d0 = this._timelineTrackContentWidth(), _0x1b6f3b = {}) {
    const _0x45a85d = Math.max(240, Math.ceil(toNumber(_0x5066d0, 0)));
    const _0x2a95fa = this._timelineAddSlotLeftPx(_0x45a85d, _0x1b6f3b);
    const _0x2dcedd = this._timelineContentWidth(_0x45a85d, _0x1b6f3b);
    const _0x3c3bea = this.el?.querySelector?.(".media-clip-compact-timeline");
    if (!_0x3c3bea) {
      return;
    }
    _0x3c3bea.style.setProperty("--media-clip-add-left", _0x2a95fa + "px");
    _0x3c3bea.style.setProperty("--media-clip-timeline-content-width", _0x2dcedd + "px");
    _0x3c3bea.style.setProperty("--media-clip-track-axis-width", this._timelineAxisWidthPx() + "px");
    const _0x173b4e = _0x3c3bea.querySelector?.(".media-clip-add-btn");
    if (_0x173b4e) {
      _0x173b4e.style.left = this._timelineAxisWidthPx() + _0x2a95fa + "px";
    }
  }
  _syncTimelineAddSlotForRow(_0x4b5c13, _0x5618e5 = {}) {
    const _0x31d9c1 = Math.max(240, readLayoutWidthPx(_0x4b5c13, this._timelineTrackContentWidth()));
    this._syncTimelineCursorLayerForRow(_0x4b5c13);
    const _0x1a54ba = _0x5618e5.displayDurationSec ?? _0x5618e5.durationSec;
    if (Number.isFinite(toNumber(_0x1a54ba, NaN))) {
      const _0x3ae82c = getMediaClipTimelineDisplayDuration(_0x1a54ba);
      this._setTimelineRowDuration(_0x4b5c13, _0x3ae82c);
      this._syncTimelineRulerTicks(_0x31d9c1, {
        ..._0x5618e5,
        durationSec: _0x3ae82c
      });
    }
    this._syncTimelineAddSlotPosition(_0x31d9c1, _0x5618e5);
  }
  _syncTimelineContentWidth(_0x23aacf = this._timelineTrackContentWidth(), _0x5cb253 = {}) {
    const _0x23897e = Math.max(240, Math.ceil(toNumber(_0x23aacf, 0)));
    const _0x1c51d7 = this.el?.querySelector?.(".media-clip-compact-timeline");
    if (!_0x1c51d7) {
      return;
    }
    _0x1c51d7.style.setProperty("--media-clip-track-content-width", _0x23897e + "px");
    _0x1c51d7.style.setProperty("--media-clip-track-axis-width", this._timelineAxisWidthPx() + "px");
    this._syncTimelineAddSlotPosition(_0x23897e, _0x5cb253);
    this.el?.querySelectorAll?.(".media-clip-track, .media-clip-ruler")?.forEach(_0x35889d => {
      _0x35889d.style.width = _0x23897e + "px";
    });
    this._syncTimelineRulerTicks(_0x23897e, _0x5cb253);
    this._syncTimelineScrollFade(this.el?.querySelector?.(".media-clip-timeline-scroll"));
  }
  _timelineRulerTicks(_0x2c313d, _0x2d1320, _0x237559 = {}) {
    const _0x44db26 = getMediaClipTimelineDisplayDuration(_0x2c313d);
    return buildMediaClipTimelineTicks(_0x44db26, _0x2d1320);
  }
  _populateTimelineRuler(_0x5e723a, _0x5ef20d, _0x17e627, _0x4ee26a = {}) {
    if (!_0x5e723a) {
      return;
    }
    const _0x269e73 = getMediaClipTimelineDisplayDuration(_0x5ef20d);
    const _0x451aa5 = this._timelineRulerTicks(_0x269e73, _0x17e627, _0x4ee26a);
    const _0x2ce186 = _0x269e73 + ":" + _0x451aa5.join(",");
    if (_0x5e723a.dataset?.tickSignature === _0x2ce186) {
      return;
    }
    if (_0x5e723a.dataset) {
      _0x5e723a.dataset.tickSignature = _0x2ce186;
    }
    if (typeof _0x5e723a.replaceChildren === "function") {
      _0x5e723a.replaceChildren();
    } else {
      _0x5e723a.textContent = "";
    }
    _0x451aa5.forEach(_0x56f2ce => {
      const _0x45cf4a = document.createElement("span");
      _0x45cf4a.className = "media-clip-ruler-tick";
      _0x45cf4a.textContent = formatTime(_0x56f2ce);
      const _0x33f9e1 = getMediaClipTimelinePercent(_0x56f2ce, _0x269e73);
      _0x45cf4a.style.left = _0x33f9e1 + "%";
      _0x5e723a.appendChild(_0x45cf4a);
    });
  }
  _syncTimelineRulerTicks(_0x107ad0 = this._timelineTrackContentWidth(), _0x62ccb7 = {}) {
    const _0x314c04 = this.el?.querySelector?.(".media-clip-ruler");
    if (!_0x314c04) {
      return;
    }
    const _0x10d0de = _0x62ccb7.durationSec ?? _0x62ccb7.displayDurationSec ?? this._primaryDuration();
    this._populateTimelineRuler(_0x314c04, _0x10d0de, _0x107ad0, _0x62ccb7);
  }
  _renderRuler(_0x35ccee, _0x32379c = {}) {
    const _0x48288e = getMediaClipTimelineDisplayDuration(_0x35ccee);
    const _0x4fab00 = this._estimateTimelineWidth(_0x32379c);
    const _0x499235 = document.createElement("div");
    _0x499235.className = "media-clip-ruler";
    this._populateTimelineRuler(_0x499235, _0x48288e, _0x4fab00, _0x32379c);
    return _0x499235;
  }
  _renderTimelineCursors(_0xde5c8d = this._primaryDuration()) {
    const _0x2052cb = document.createElement("div");
    _0x2052cb.className = "media-clip-timeline-cursors";
    _0x2052cb.setAttribute("aria-hidden", "true");
    const _0x12b73c = document.createElement("div");
    _0x12b73c.className = "media-clip-playhead media-clip-timeline-cursor media-clip-timeline-cursor-fixed";
    this._applyTimelinePlayheadModel(_0x12b73c, getMediaClipTimelinePlayheadModel({
      playheadSec: this._playheadSec,
      durationSec: _0xde5c8d
    }));
    const _0x46e292 = document.createElement("div");
    _0x46e292.className = "media-clip-hover-playhead media-clip-timeline-cursor media-clip-timeline-cursor-hover";
    _0x46e292.hidden = true;
    _0x2052cb.append(_0x12b73c, _0x46e292);
    return _0x2052cb;
  }
  _timelineCursorKind() {
    const _0x512f7c = normalizeText(this._mediaClip.activeTrack);
    if (_0x512f7c && this._mediaClip.tracks?.[_0x512f7c]) {
      return _0x512f7c;
    }
    if (this._mediaClip.tracks?.video) {
      return "video";
    }
    if (this._mediaClip.tracks?.audio) {
      return "audio";
    }
    return "";
  }
  _timelineDurationForKind(_0x1b22aa = this._timelineCursorKind(), _0x14b151 = {}) {
    const _0x5ba41b = this._mediaClip.tracks?.[_0x1b22aa];
    if (!_0x5ba41b) {
      return this._primaryDuration(_0x14b151);
    }
    if (_0x1b22aa === "video") {
      return this._videoTimelineDuration(_0x5ba41b, null, _0x14b151);
    }
    if (_0x1b22aa === "audio") {
      const _0x510411 = this._mediaClip.tracks?.video;
      if (_0x510411) {
        return this._videoTimelineDuration(_0x510411, null, _0x14b151);
      } else {
        return this._audioTimelineDuration(_0x5ba41b, null, _0x14b151);
      }
    }
    return getTrackDuration(_0x5ba41b);
  }
  _timelinePointerContext(_0x570291, _0x2cf327 = null) {
    const _0x92e5ef = _0x2cf327?.closest?.(".media-clip-track:not(.is-compact)");
    const _0x56eb18 = _0x92e5ef?.classList?.contains("media-clip-track-audio") ? "audio" : _0x92e5ef?.classList?.contains("media-clip-track-video") ? "video" : "";
    const _0x2c0d10 = _0x56eb18 || this._timelineCursorKind();
    if (!_0x2c0d10) {
      return null;
    }
    const _0x2b55c4 = _0x56eb18 ? _0x92e5ef : _0x570291?.querySelector?.(".media-clip-track-" + _0x2c0d10 + ":not(.is-compact)");
    if (!_0x2b55c4) {
      return null;
    }
    const _0x177f6d = this._timelineDurationForKind(_0x2c0d10);
    return {
      kind: _0x2c0d10,
      row: _0x2b55c4,
      duration: this._timelineRowDuration(_0x2b55c4, _0x177f6d)
    };
  }
  _isTimelineControlTarget(_0x5811bf) {
    return !!_0x5811bf?.closest?.(".media-clip-pick-btn, .media-clip-tool, .media-clip-menu, .media-clip-material-menu, .media-clip-menu-item, .media-clip-audio-lane-mute-btn, .media-clip-trim");
  }
  _timelineEventSegment(_0xa222d) {
    return _0xa222d?.closest?.(".media-clip-segment") || null;
  }
  _openMaterialMenu(_0x47f5a2, _0x1b11bc, _0x2477d4) {
    if (!_0x47f5a2 || !_0x2477d4) {
      return;
    }
    _0x2477d4.preventDefault?.();
    _0x2477d4.stopPropagation?.();
    const _0x4441a5 = this._materialMenuHost();
    const _0x480578 = this._materialMenuLocalPoint(_0x2477d4.clientX, _0x2477d4.clientY, _0x4441a5);
    this._menuOpen = false;
    this._materialMenu = {
      kind: _0x47f5a2,
      clipIndex: Math.max(0, Math.trunc(toNumber(_0x1b11bc, 0))),
      x: _0x480578.x,
      y: _0x480578.y
    };
    this._syncMaterialMenuDismissListener(true);
    this._removeMaterialMenuPortal();
    this._renderMaterialMenuPortal();
  }
  _bindTimelinePointerCursors(_0x191299, _0x7aa0ed) {
    if (!_0x191299 || !_0x7aa0ed) {
      return;
    }
    _0x191299.addEventListener("pointermove", _0x4136aa => {
      if (this._timelineDrag() || this._isTimelineControlTarget(_0x4136aa.target)) {
        return;
      }
      const _0x5b7af7 = this._timelinePointerContext(_0x7aa0ed, _0x4136aa.target);
      if (!_0x5b7af7) {
        return;
      }
      const _0x992d9a = this._timelineSecFromPointerEvent(_0x5b7af7.row, _0x4136aa, _0x5b7af7.duration);
      if (this._timelineEventSegment(_0x4136aa.target)) {
        this._previewTrackPlayhead(_0x5b7af7.row, _0x5b7af7.kind, _0x992d9a, _0x5b7af7.duration);
      } else {
        this._updateTimelineHoverPlayheadVisual(_0x5b7af7.row, _0x5b7af7.duration, {
          playheadSec: _0x992d9a
        });
      }
    });
    _0x191299.addEventListener("pointerdown", _0x52a025 => {
      if (_0x52a025.button !== 0 || this._timelineDrag() || this._isTimelineControlTarget(_0x52a025.target)) {
        return;
      }
      if (this._timelineEventSegment(_0x52a025.target)) {
        return;
      }
      const _0x10140a = this._timelinePointerContext(_0x7aa0ed, _0x52a025.target);
      if (!_0x10140a) {
        return;
      }
      this._setTimelinePlayheadFromPointer(_0x10140a.row, _0x10140a.kind, _0x52a025, _0x10140a.duration, {
        updateActiveTrack: false,
        updateClipSelection: false,
        selectClip: false,
        syncPreview: false
      });
    });
    _0x191299.addEventListener("pointerleave", () => {
      if (this._timelineDrag()) {
        return;
      }
      this._hideTimelineHoverPlayhead(_0x191299);
      this._restoreTimelinePlayheads();
    });
    _0x191299.addEventListener("click", _0x23b2a4 => {
      if (this._timelineDrag() || this._isTimelineControlTarget(_0x23b2a4.target)) {
        return;
      }
      if (!this._timelineEventSegment(_0x23b2a4.target)) {
        return;
      }
      const _0x57a167 = this._timelinePointerContext(_0x7aa0ed, _0x23b2a4.target);
      if (!_0x57a167) {
        return;
      }
      const _0x280da1 = this._timelineSecFromPointerEvent(_0x57a167.row, _0x23b2a4, _0x57a167.duration);
      const _0x1469c7 = _0x57a167.kind === "video" ? this._setActiveClipIndex(this._clipIndexAtTimelineSec(_0x280da1)) : _0x57a167.kind === "audio" ? this._setActiveAudioClipIndex(this._audioClipIndexAtTimelineSec(_0x280da1)) : false;
      if (_0x57a167.kind === "audio") {
        this._selectAudioClipIndex(this._activeAudioClipIndex);
      }
      this._setActiveTrack(_0x57a167.kind, _0x280da1, {
        forceRender: _0x1469c7
      });
    });
  }
  _videoSources() {
    const _0x19d61a = Array.isArray(this._sources?.videos) ? this._sources.videos : [];
    if (_0x19d61a.length) {
      return _0x19d61a;
    }
    if (this._sources?.video) {
      return [this._sources.video];
    } else {
      return [];
    }
  }
  _firstVideoSource() {
    return this._videoSources().find(_0x332596 => getMediaClipInputKind(_0x332596) === "video") || null;
  }
  _videoClipSource(_0x457144 = {}, _0x2779f1 = 0) {
    const _0x2dd745 = this._videoSources();
    const _0x1fd158 = normalizeText(_0x457144.sourceId);
    const _0x1124b3 = normalizeText(_0x457144.sourceKey);
    return _0x2dd745.find(_0x2cf4bf => normalizeText(_0x2cf4bf?.id) === _0x1fd158) || _0x2dd745.find(_0x21422b => normalizeText(_0x21422b?.__mediaClipEdgeId) === normalizeText(_0x457144.id)) || _0x2dd745.find(_0x22b638 => normalizeText(resolveMediaClipSourceKey(_0x22b638)) === _0x1124b3) || _0x2dd745[_0x2779f1] || this._sources?.video || null;
  }
  _audioSources() {
    const _0x3e4e2d = Array.isArray(this._sources?.audios) ? this._sources.audios : [];
    if (_0x3e4e2d.length) {
      return _0x3e4e2d;
    }
    if (this._sources?.audio) {
      return [this._sources.audio];
    } else {
      return [];
    }
  }
  _audioClipSource(_0x45c227 = {}, _0x1c9cd4 = 0) {
    const _0x922d1f = this._audioSources();
    const _0x40c3b0 = normalizeText(_0x45c227.sourceId);
    const _0x2443b4 = normalizeText(_0x45c227.sourceKey);
    return _0x922d1f.find(_0x5b339b => normalizeText(_0x5b339b?.id) === _0x40c3b0) || _0x922d1f.find(_0x432640 => normalizeText(_0x432640?.__mediaClipEdgeId) === normalizeText(_0x45c227.id)) || _0x922d1f.find(_0x30e2d9 => normalizeText(resolveMediaClipSourceKey(_0x30e2d9)) === _0x2443b4) || _0x922d1f[_0x1c9cd4] || this._sources?.audio || null;
  }
  _videoTimelineClips(_0x366e9a = null) {
    const _0x52cc60 = Array.isArray(this._mediaClip?.clips) ? this._mediaClip.clips : [];
    if (_0x52cc60.length) {
      return _0x52cc60;
    }
    if (!_0x366e9a) {
      return [];
    }
    return [{
      id: "video:0",
      sourceKey: _0x366e9a.sourceKey,
      startSec: _0x366e9a.startSec,
      endSec: _0x366e9a.endSec,
      durationSec: _0x366e9a.durationSec,
      timelineStartSec: _0x366e9a.startSec,
      timelineEndSec: _0x366e9a.endSec
    }];
  }
  _audioTimelineClips(_0x385d74 = null) {
    const _0x4bcbd0 = Array.isArray(this._mediaClip?.audioClips) ? this._mediaClip.audioClips : [];
    if (_0x4bcbd0.length) {
      return _0x4bcbd0;
    }
    if (!_0x385d74) {
      return [];
    }
    const _0x29851a = toNumber(_0x385d74.startSec, 0);
    const _0x3f6d53 = Math.max(_0x29851a, toNumber(_0x385d74.endSec, _0x29851a));
    return [{
      id: "audio:0",
      kind: "audio",
      sourceKey: _0x385d74.sourceKey,
      startSec: _0x29851a,
      endSec: _0x3f6d53,
      durationSec: _0x385d74.durationSec,
      timelineStartSec: _0x29851a,
      timelineEndSec: _0x3f6d53,
      laneIndex: 0,
      muted: false,
      disabled: false
    }];
  }
  _timelineDurationForZoom(_0x49506b = 0, _0x33e939 = {}) {
    const _0x1efaf1 = getMediaClipTimelineDisplayDuration(_0x49506b);
    const _0x5b24cc = Math.max(_0x1efaf1, _0x1efaf1 * TIMELINE_ZOOM_OUT_DISPLAY_MULTIPLIER);
    if (_0x5b24cc <= _0x1efaf1) {
      return _0x1efaf1;
    }
    const _0x1aacce = this._timelineZoom(_0x33e939);
    if (_0x1aacce >= 1) {
      return _0x1efaf1;
    }
    const _0xe362c5 = Math.max(0.001, 1 - MEDIA_CLIP_TIMELINE_ZOOM_MIN);
    const _0x50bbf3 = Math.max(0, Math.min(1, (1 - _0x1aacce) / _0xe362c5));
    return Math.round((_0x1efaf1 + (_0x5b24cc - _0x1efaf1) * _0x50bbf3) * 1000) / 1000;
  }
  _videoTimelineBaseDuration(_0x344e05 = null, _0x2529fc = null) {
    const _0x1c644e = Array.isArray(_0x2529fc) ? _0x2529fc : this._videoTimelineClips(_0x344e05);
    const _0x1d27fa = this._videoTimelineMaterialEnd(_0x344e05, _0x1c644e);
    const _0x43a3a0 = _0x1c644e.reduce((_0x582453, _0x5d2031) => Math.min(_0x582453, toNumber(_0x5d2031?.timelineStartSec, 0)), 0);
    const _0x10bc9c = _0x43a3a0 < 0 ? Math.max(0, _0x1d27fa - _0x43a3a0) : _0x1d27fa;
    if (_0x1c644e.length) {
      const _0x23086f = _0x1c644e.length === 1 ? Math.max(toNumber(_0x1c644e[0]?.durationSec, 0), toNumber(_0x344e05?.durationSec, 0)) : 0;
      return getMediaClipTimelineDisplayDuration(Math.max(_0x1d27fa, _0x10bc9c, _0x23086f));
    }
    return getMediaClipTimelineDisplayDuration(Math.max(toNumber(_0x344e05?.durationSec, 0), getTrackDuration(_0x344e05)));
  }
  _videoTimelineDuration(_0x3b1e51 = null, _0x27da71 = null, _0x145fb4 = {}) {
    return this._timelineDurationForZoom(this._videoTimelineBaseDuration(_0x3b1e51, _0x27da71), _0x145fb4);
  }
  _timelineSegmentVisualDurationSec(_0x146b51 = null, _0x1765f1 = null) {
    if (!_0x146b51 || !_0x1765f1) {
      return 0;
    }
    const _0x5c7356 = Math.max(0, toNumber(_0x1765f1.timelineStartSec, 0));
    const _0x1b6f32 = Math.max(_0x5c7356, toNumber(_0x1765f1.timelineEndSec, _0x5c7356));
    const _0x260c6d = Math.max(0, _0x1b6f32 - _0x5c7356);
    const _0x24fbfc = parsePercentValue(_0x146b51?.style?.left);
    const _0x5e9454 = parsePercentValue(_0x146b51?.style?.width);
    const _0x4a297e = parsePercentValue(_0x146b51?.style?.right);
    const _0x585672 = Number.isFinite(_0x5e9454) && _0x5e9454 > 0 ? _0x5e9454 : Number.isFinite(_0x24fbfc) && Number.isFinite(_0x4a297e) ? Math.max(0, 100 - _0x24fbfc - _0x4a297e) : NaN;
    const _0x547f5f = [];
    if (Number.isFinite(_0x24fbfc) && _0x24fbfc > 0 && _0x5c7356 > 0) {
      _0x547f5f.push(_0x5c7356 / (_0x24fbfc / 100));
    }
    if (Number.isFinite(_0x585672) && _0x585672 > 0 && _0x260c6d > 0) {
      _0x547f5f.push(_0x260c6d / (_0x585672 / 100));
    }
    if (Number.isFinite(_0x24fbfc) && Number.isFinite(_0x585672) && _0x24fbfc + _0x585672 > 0 && _0x1b6f32 > 0) {
      _0x547f5f.push(_0x1b6f32 / ((_0x24fbfc + _0x585672) / 100));
    }
    return Math.max(0, ..._0x547f5f.filter(_0x431d3d => Number.isFinite(_0x431d3d) && _0x431d3d > 0));
  }
  _setTimelineRowDuration(_0x4543b = null, _0x470ff1 = 0) {
    if (!_0x4543b?.dataset) {
      return;
    }
    _0x4543b.dataset.timelineDurationSec = String(getMediaClipTimelineDisplayDuration(_0x470ff1));
  }
  _timelineRowDuration(_0x597c8a = null, _0x43fd20 = 0) {
    const _0x547f74 = toNumber(_0x597c8a?.dataset?.timelineDurationSec, NaN);
    if (Number.isFinite(_0x547f74) && _0x547f74 > 0) {
      return getMediaClipTimelineDisplayDuration(_0x547f74);
    }
    return getMediaClipTimelineDisplayDuration(_0x43fd20);
  }
  _resolveTimelineDragDuration(_0x2d90e5, _0x2cb38c = null, _0x5b97c1 = null, _0x106d05 = null, _0x5eeb77 = 0) {
    if (_0x2d90e5 === "audio") {
      const _0x10857f = Array.isArray(_0x5b97c1) ? _0x5b97c1 : this._audioTimelineClips(_0x2cb38c);
      const _0xc69de5 = this._timelineDurationForKind("audio");
      const _0x2d748a = _0x106d05?.closest?.(".media-clip-track") || null;
      return this._timelineRowDuration(_0x2d748a, _0xc69de5);
    }
    if (_0x2d90e5 !== "video") {
      return getTrackDuration(_0x2cb38c);
    }
    const _0x30fa2e = Array.isArray(_0x5b97c1) ? _0x5b97c1 : this._videoTimelineClips(_0x2cb38c);
    const _0x5356e6 = this._videoTimelineDuration(_0x2cb38c, _0x30fa2e);
    const _0x3446ac = _0x106d05?.closest?.(".media-clip-track") || null;
    return this._timelineRowDuration(_0x3446ac, _0x5356e6);
  }
  _videoTimelineMaterialEnd(_0x4b702e = null, _0x314219 = null) {
    const _0x2f9460 = Array.isArray(_0x314219) ? _0x314219 : this._videoTimelineClips(_0x4b702e);
    if (_0x2f9460.length) {
      return _0x2f9460.reduce((_0x28aef1, _0x21a9d4) => Math.max(_0x28aef1, toNumber(_0x21a9d4.timelineEndSec, 0)), 0);
    }
    return Math.max(0, toNumber(_0x4b702e?.endSec || _0x4b702e?.durationSec, 0));
  }
  _audioTimelineMaterialEnd(_0x32ce57 = null, _0x870714 = null) {
    const _0x449cf2 = Array.isArray(_0x870714) ? _0x870714 : this._audioTimelineClips(_0x32ce57);
    if (_0x449cf2.length) {
      return _0x449cf2.reduce((_0x443ad7, _0x49bb08) => Math.max(_0x443ad7, toNumber(_0x49bb08.timelineEndSec, 0)), 0);
    }
    return Math.max(0, toNumber(_0x32ce57?.endSec || _0x32ce57?.durationSec, 0));
  }
  _audioTimelineDuration(_0x5243e5 = null, _0x224450 = null, _0x35e48c = {}) {
    const _0x4c6559 = Array.isArray(_0x224450) ? _0x224450 : this._audioTimelineClips(_0x5243e5);
    const _0xe1f405 = this._audioTimelineMaterialEnd(_0x5243e5, _0x4c6559);
    const _0x289d44 = _0x4c6559.length === 1 ? Math.max(toNumber(_0x4c6559[0]?.durationSec, 0), toNumber(_0x5243e5?.durationSec, 0)) : toNumber(_0x5243e5?.durationSec, 0);
    return this._timelineDurationForZoom(Math.max(_0xe1f405, _0x289d44), _0x35e48c);
  }
  _clampVideoClipIndex(_0x42170a = this._activeClipIndex) {
    const _0x4b3fa8 = Math.max(0, this._videoTimelineClips(this._mediaClip.tracks?.video).length);
    const _0x598060 = Math.max(0, _0x4b3fa8 - 1);
    return Math.max(0, Math.min(_0x598060, Math.trunc(toNumber(_0x42170a, 0))));
  }
  _clampAudioClipIndex(_0xf32370 = this._activeAudioClipIndex) {
    const _0x5f02cb = Math.max(0, this._audioTimelineClips(this._mediaClip.tracks?.audio).length);
    const _0x577c81 = Math.max(0, _0x5f02cb - 1);
    return Math.max(0, Math.min(_0x577c81, Math.trunc(toNumber(_0xf32370, 0))));
  }
  _clipIndexAtTimelineSec(_0x578bf2, _0x286f29 = this._videoTimelineClips(this._mediaClip.tracks?.video)) {
    const _0x494bee = Array.isArray(_0x286f29) ? _0x286f29 : [];
    if (!_0x494bee.length) {
      return 0;
    }
    const _0x4c554f = toNumber(_0x578bf2, 0);
    const _0x279572 = _0x494bee.findIndex((_0x393a83, _0x51b44c) => {
      const _0x399540 = toNumber(_0x393a83.timelineStartSec, 0);
      const _0x21c980 = Math.max(_0x399540, toNumber(_0x393a83.timelineEndSec, _0x399540));
      if (_0x51b44c === _0x494bee.length - 1) {
        return _0x4c554f >= _0x399540 && _0x4c554f <= _0x21c980;
      } else {
        return _0x4c554f >= _0x399540 && _0x4c554f < _0x21c980;
      }
    });
    if (_0x279572 >= 0) {
      return _0x279572;
    }
    let _0x31ef19 = 0;
    let _0x16964c = Number.POSITIVE_INFINITY;
    _0x494bee.forEach((_0x1c4643, _0x2a417c) => {
      const _0x620f53 = toNumber(_0x1c4643.timelineStartSec, 0);
      const _0x29bb58 = Math.max(_0x620f53, toNumber(_0x1c4643.timelineEndSec, _0x620f53));
      const _0x5d78eb = _0x4c554f < _0x620f53 ? _0x620f53 - _0x4c554f : _0x4c554f - _0x29bb58;
      if (_0x5d78eb < _0x16964c) {
        _0x31ef19 = _0x2a417c;
        _0x16964c = _0x5d78eb;
      }
    });
    return _0x31ef19;
  }
  _audioClipIndexAtTimelineSec(_0x26de53, _0x1aedfc = this._audioTimelineClips(this._mediaClip.tracks?.audio)) {
    const _0x419fe9 = Array.isArray(_0x1aedfc) ? _0x1aedfc : [];
    if (!_0x419fe9.length) {
      return 0;
    }
    const _0xfa42d3 = toNumber(_0x26de53, 0);
    const _0x49cc32 = _0x419fe9.findIndex((_0x304680, _0x167dd3) => {
      const _0x9e8d04 = toNumber(_0x304680.timelineStartSec, 0);
      const _0x5314d8 = Math.max(_0x9e8d04, toNumber(_0x304680.timelineEndSec, _0x9e8d04));
      if (_0x167dd3 === _0x419fe9.length - 1) {
        return _0xfa42d3 >= _0x9e8d04 && _0xfa42d3 <= _0x5314d8;
      } else {
        return _0xfa42d3 >= _0x9e8d04 && _0xfa42d3 < _0x5314d8;
      }
    });
    if (_0x49cc32 >= 0) {
      return _0x49cc32;
    }
    let _0x2e4bfa = 0;
    let _0x44977f = Number.POSITIVE_INFINITY;
    _0x419fe9.forEach((_0x17bf82, _0x5cdd5f) => {
      const _0x189ad0 = toNumber(_0x17bf82.timelineStartSec, 0);
      const _0x272289 = Math.max(_0x189ad0, toNumber(_0x17bf82.timelineEndSec, _0x189ad0));
      const _0x5e61a7 = _0xfa42d3 < _0x189ad0 ? _0x189ad0 - _0xfa42d3 : _0xfa42d3 - _0x272289;
      if (_0x5e61a7 < _0x44977f) {
        _0x2e4bfa = _0x5cdd5f;
        _0x44977f = _0x5e61a7;
      }
    });
    return _0x2e4bfa;
  }
  _setActiveClipIndex(_0x208390 = this._activeClipIndex) {
    const _0x5775d1 = this._clampVideoClipIndex(_0x208390);
    const _0x5cbd9c = _0x5775d1 !== this._activeClipIndex;
    this._activeClipIndex = _0x5775d1;
    return _0x5cbd9c;
  }
  _setActiveAudioClipIndex(_0x5e5808 = this._activeAudioClipIndex) {
    const _0x47c129 = this._clampAudioClipIndex(_0x5e5808);
    const _0x4ec98b = _0x47c129 !== this._activeAudioClipIndex;
    this._activeAudioClipIndex = _0x47c129;
    return _0x4ec98b;
  }
  _clampSelectedClipIndex(_0xd108b3 = this._selectedClipIndex) {
    const _0x4da185 = Math.max(0, this._videoTimelineClips(this._mediaClip.tracks?.video).length);
    const _0x237e3f = Math.trunc(toNumber(_0xd108b3, -1));
    if (_0x237e3f >= 0 && _0x237e3f < _0x4da185) {
      return _0x237e3f;
    } else {
      return -1;
    }
  }
  _clampSelectedAudioClipIndex(_0x671380 = this._selectedAudioClipIndex) {
    const _0x501400 = Math.max(0, this._audioTimelineClips(this._mediaClip.tracks?.audio).length);
    const _0x14875f = Math.trunc(toNumber(_0x671380, -1));
    if (_0x14875f >= 0 && _0x14875f < _0x501400) {
      return _0x14875f;
    } else {
      return -1;
    }
  }
  _selectClipIndex(_0x1856b4 = this._activeClipIndex) {
    const _0x4d5fd8 = this._clampVideoClipIndex(_0x1856b4);
    const _0x30ef0d = _0x4d5fd8 !== this._selectedClipIndex;
    this._selectedClipIndex = _0x4d5fd8;
    return _0x30ef0d;
  }
  _selectAudioClipIndex(_0x178418 = this._activeAudioClipIndex) {
    const _0x53c894 = this._clampAudioClipIndex(_0x178418);
    const _0x512153 = _0x53c894 !== this._selectedAudioClipIndex;
    this._selectedAudioClipIndex = _0x53c894;
    return _0x512153;
  }
  _patchAudioClipState(_0x5d5d7a = this._activeAudioClipIndex, _0x2575b9 = {}) {
    const _0x380972 = Math.max(0, Math.trunc(toNumber(_0x5d5d7a, 0)));
    const _0x14e583 = this._audioTimelineClips(this._mediaClip.tracks?.audio);
    const _0x4997b2 = _0x14e583[_0x380972];
    if (!_0x4997b2) {
      return false;
    }
    this._mediaClip = patchMediaClipAudioClipState(this._mediaClip, _0x380972, _0x2575b9);
    this._setActiveAudioClipIndex(_0x380972);
    this._selectAudioClipIndex(_0x380972);
    this.nodeData = {
      ...(this.nodeData || {}),
      mediaClip: this._mediaClip
    };
    a409_0x2af79e.updateNodeData(this.id, {
      mediaClip: this._mediaClip
    });
    commit();
    this._refreshMediaClipTimelineInPlace();
    return true;
  }
  _toggleAudioClipMuted(_0x308cf8 = this._activeAudioClipIndex) {
    const _0x196613 = Math.max(0, Math.trunc(toNumber(_0x308cf8, 0)));
    const _0x4c2226 = this._audioTimelineClips(this._mediaClip.tracks?.audio)[_0x196613];
    if (!_0x4c2226) {
      return false;
    }
    return this._patchAudioClipState(_0x196613, {
      muted: _0x4c2226.muted !== true
    });
  }
  _audioClipsForLane(_0x20bdd7 = 0, _0x4f33a3 = this._audioTimelineClips(this._mediaClip.tracks?.audio)) {
    const _0x117e28 = normalizeMediaClipAudioLaneIndex(_0x20bdd7);
    const _0x3943e1 = Array.isArray(_0x4f33a3) ? _0x4f33a3 : [];
    return _0x3943e1.filter(_0x1285c5 => this._audioClipLaneIndex(_0x1285c5) === _0x117e28);
  }
  _isAudioLaneMuted(_0x150d90 = 0, _0x41c73d = this._audioTimelineClips(this._mediaClip.tracks?.audio)) {
    const _0x20ded9 = this._audioClipsForLane(_0x150d90, _0x41c73d);
    return _0x20ded9.length > 0 && _0x20ded9.every(_0xda4a9a => _0xda4a9a?.muted === true);
  }
  _toggleAudioLaneMuted(_0x45957a = 0) {
    const _0x34c719 = normalizeMediaClipAudioLaneIndex(_0x45957a);
    const _0x4c00c3 = this._audioTimelineClips(this._mediaClip.tracks?.audio);
    const _0x377d2f = this._audioClipsForLane(_0x34c719, _0x4c00c3);
    if (!_0x377d2f.length) {
      return false;
    }
    const _0x14ece0 = !this._isAudioLaneMuted(_0x34c719, _0x4c00c3);
    this._mediaClip = patchMediaClipAudioLaneMuted(this._mediaClip, _0x34c719, _0x14ece0);
    const _0x1ce40a = Math.max(0, this._mediaClip.audioClips?.findIndex?.(_0x5d0427 => this._audioClipLaneIndex(_0x5d0427) === _0x34c719) ?? 0);
    this._setActiveAudioClipIndex(_0x1ce40a);
    this._selectAudioClipIndex(_0x1ce40a);
    this.nodeData = {
      ...(this.nodeData || {}),
      mediaClip: this._mediaClip
    };
    a409_0x2af79e.updateNodeData(this.id, {
      mediaClip: this._mediaClip
    });
    commit();
    this._refreshMediaClipTimelineInPlace();
    return true;
  }
  _toggleAudioClipDisabled(_0x31d200 = this._activeAudioClipIndex) {
    const _0x5973b7 = Math.max(0, Math.trunc(toNumber(_0x31d200, 0)));
    const _0xc3f7b4 = this._audioTimelineClips(this._mediaClip.tracks?.audio)[_0x5973b7];
    if (!_0xc3f7b4) {
      return false;
    }
    return this._patchAudioClipState(_0x5973b7, {
      disabled: _0xc3f7b4.disabled !== true
    });
  }
  _segmentClipIndex(_0x182764, _0x4bec0f = "video", _0x3c0e86 = null) {
    const _0x1451b1 = normalizeText(_0x182764?.dataset?.clipId);
    if (_0x1451b1) {
      const _0x5a60ce = Array.isArray(_0x3c0e86) ? _0x3c0e86 : _0x4bec0f === "audio" ? this._mediaClip.audioClips || [] : this._mediaClip.clips || [];
      const _0x2b0128 = _0x5a60ce.findIndex(_0x2a6678 => normalizeText(_0x2a6678?.id) === _0x1451b1);
      if (_0x2b0128 >= 0) {
        return _0x2b0128;
      }
    }
    return Math.max(0, Math.trunc(toNumber(_0x182764?.dataset?.clipIndex, 0)));
  }
  _timelineRowForDrag(_0x2ff484 = this._timelineDrag()) {
    if (_0x2ff484?.rowEl) {
      return _0x2ff484.rowEl;
    }
    const _0x40e5dc = normalizeText(_0x2ff484?.kind);
    if (!_0x40e5dc) {
      return null;
    }
    return this.el?.querySelector?.(".media-clip-track-" + _0x40e5dc + ":not(.is-compact)") || this.el?.querySelector?.(".media-clip-track-" + _0x40e5dc) || null;
  }
  _videoSourceSecForTimelineSec(_0x302951 = this._playheadSec, _0x25fe18 = null) {
    const _0x4cc734 = Array.isArray(_0x25fe18) ? _0x25fe18 : this._videoTimelineClips(this._mediaClip.tracks?.video);
    if (!_0x4cc734.length) {
      return _0x302951;
    }
    const _0x21ea88 = toNumber(_0x302951, 0);
    if (_0x4cc734.length === 1) {
      const _0x1c515f = _0x4cc734[0];
      const _0x44c17d = toNumber(_0x1c515f.startSec, 0);
      const _0x445a19 = toNumber(_0x1c515f.endSec, _0x44c17d);
      const _0x1da959 = toNumber(_0x1c515f.timelineStartSec, 0);
      const _0xf2a42d = toNumber(_0x1c515f.timelineEndSec, _0x1da959);
      if (_0x21ea88 >= _0x1da959 && _0x21ea88 <= _0xf2a42d) {
        return _0x44c17d + (_0x21ea88 - _0x1da959);
      }
      return Math.max(_0x44c17d, Math.min(_0x445a19, _0x21ea88));
    }
    const _0x41844f = _0x4cc734[this._clipIndexAtTimelineSec(_0x21ea88, _0x4cc734)] || _0x4cc734[_0x4cc734.length - 1];
    const _0xee7fb3 = toNumber(_0x41844f.timelineStartSec, 0);
    const _0x48120c = toNumber(_0x41844f.startSec, 0);
    const _0xebf67 = toNumber(_0x41844f.endSec, _0x48120c);
    return Math.max(_0x48120c, Math.min(_0xebf67, _0x48120c + (_0x21ea88 - _0xee7fb3)));
  }
  _videoSourceSecForPlayhead(_0x5d0206 = this._playheadSec) {
    return this._videoSourceSecForTimelineSec(_0x5d0206);
  }
  _audioSourceSecForPlayhead(_0x111f86 = this._playheadSec) {
    const _0x2205fb = this._audioTimelineClips(this._mediaClip.tracks?.audio);
    if (!_0x2205fb.length) {
      return _0x111f86;
    }
    const _0xc4e3c8 = toNumber(_0x111f86, 0);
    const _0x1d7aff = _0x2205fb[this._audioClipIndexAtTimelineSec(_0xc4e3c8, _0x2205fb)] || _0x2205fb[_0x2205fb.length - 1];
    const _0x3f0301 = toNumber(_0x1d7aff.timelineStartSec, 0);
    const _0x1d82a4 = toNumber(_0x1d7aff.startSec, 0);
    const _0x3b40c6 = toNumber(_0x1d7aff.endSec, _0x1d82a4);
    return Math.max(_0x1d82a4, Math.min(_0x3b40c6, _0x1d82a4 + (_0xc4e3c8 - _0x3f0301)));
  }
  _audioClipSourceSec(_0x1e16fd = {}, _0xa6f326 = this._playheadSec) {
    const _0x5307e6 = toNumber(_0x1e16fd.timelineStartSec, 0);
    const _0x51fa94 = toNumber(_0x1e16fd.startSec, 0);
    const _0x1aafa3 = toNumber(_0x1e16fd.endSec, _0x51fa94);
    return Math.max(_0x51fa94, Math.min(_0x1aafa3, _0x51fa94 + (toNumber(_0xa6f326, 0) - _0x5307e6)));
  }
  _audioClipLaneIndex(_0x227518 = {}) {
    return normalizeMediaClipAudioLaneIndex(_0x227518?.laneIndex);
  }
  _audioLaneCount(_0x12fd9d = this._audioTimelineClips(this._mediaClip.tracks?.audio), _0x4c9f0b = {}) {
    const _0x72ae4a = Array.isArray(_0x12fd9d) ? _0x12fd9d : [];
    const _0x2670d1 = _0x72ae4a.reduce((_0x20c0d1, _0x5550e8) => Math.max(_0x20c0d1, this._audioClipLaneIndex(_0x5550e8)), 0);
    const _0x1551d5 = Number.isFinite(Number(_0x4c9f0b.previewLaneIndex)) ? normalizeMediaClipAudioLaneIndex(_0x4c9f0b.previewLaneIndex) : 0;
    return Math.max(1, Math.min(MEDIA_CLIP_AUDIO_LANE_COUNT_MAX, Math.max(_0x2670d1, _0x1551d5) + 1));
  }
  _setAudioLaneCountStyle(_0x5e1825, _0xd4e557 = 1) {
    if (!_0x5e1825?.style) {
      return;
    }
    const _0x2e25d3 = Math.max(1, Math.min(MEDIA_CLIP_AUDIO_LANE_COUNT_MAX, Math.trunc(toNumber(_0xd4e557, 1))));
    const _0x51901b = _0x2e25d3 * MEDIA_CLIP_AUDIO_LANE_HEIGHT_PX + Math.max(0, _0x2e25d3 - 1) * MEDIA_CLIP_AUDIO_LANE_GAP_PX;
    const _0x450727 = (_0x320305, _0x31c279) => {
      if (typeof _0x5e1825.style.setProperty === "function") {
        _0x5e1825.style.setProperty(_0x320305, _0x31c279);
      } else {
        _0x5e1825.style[_0x320305] = _0x31c279;
      }
    };
    _0x450727("--media-clip-audio-lane-count", String(_0x2e25d3));
    _0x450727("--media-clip-audio-lane-height", MEDIA_CLIP_AUDIO_LANE_HEIGHT_PX + "px");
    _0x450727("--media-clip-audio-lane-gap", MEDIA_CLIP_AUDIO_LANE_GAP_PX + "px");
    _0x450727("--media-clip-audio-stack-height", _0x51901b + "px");
  }
  _setAudioSegmentLaneVisual(_0x4b3c5d, _0x2f9418 = 0) {
    if (!_0x4b3c5d?.style) {
      return;
    }
    const _0x17ce7e = normalizeMediaClipAudioLaneIndex(_0x2f9418);
    const _0x7ad262 = _0x17ce7e * (MEDIA_CLIP_AUDIO_LANE_HEIGHT_PX + MEDIA_CLIP_AUDIO_LANE_GAP_PX);
    _0x4b3c5d.dataset.audioLaneIndex = String(_0x17ce7e);
    if (typeof _0x4b3c5d.style.setProperty === "function") {
      _0x4b3c5d.style.setProperty("--media-clip-audio-lane-index", String(_0x17ce7e));
      _0x4b3c5d.style.setProperty("--media-clip-audio-lane-top", _0x7ad262 + "px");
    } else {
      _0x4b3c5d.style["--media-clip-audio-lane-index"] = String(_0x17ce7e);
      _0x4b3c5d.style["--media-clip-audio-lane-top"] = _0x7ad262 + "px";
    }
  }
  _audioLaneIndexFromDrag(_0xf452f8 = {}) {
    const _0x54d904 = normalizeMediaClipAudioLaneIndex(_0xf452f8.startLaneIndex);
    const _0x87ea30 = toNumber(_0xf452f8.latestClientY, _0xf452f8.startY) - toNumber(_0xf452f8.startY, 0);
    if (Math.abs(_0x87ea30) < MEDIA_CLIP_AUDIO_LANE_DRAG_THRESHOLD_PX) {
      return _0x54d904;
    }
    const _0x327596 = MEDIA_CLIP_AUDIO_LANE_HEIGHT_PX + MEDIA_CLIP_AUDIO_LANE_GAP_PX;
    const _0xc01d53 = Math.round(_0x87ea30 / _0x327596);
    return normalizeMediaClipAudioLaneIndex(_0x54d904 + _0xc01d53);
  }
  _previewSourceSecForTimelineSec(_0x19761f, _0x557228 = this._playheadSec) {
    if (_0x19761f === "video") {
      return this._videoSourceSecForPlayhead(_0x557228);
    }
    if (_0x19761f === "audio") {
      return this._audioSourceSecForPlayhead(_0x557228);
    }
    return _0x557228;
  }
  _applyTimelineSegmentRect(_0x318561, _0x10699e = {}) {
    if (!_0x318561) {
      return;
    }
    _0x318561.style.left = toNumber(_0x10699e.leftPct, 0) + "%";
    _0x318561.style.width = toNumber(_0x10699e.widthPct, 0) + "%";
    _0x318561.style.right = "";
  }
  _applyAudioTimelineSegmentRect(_0x1a0b38, _0x54ac0a = {}) {
    if (!_0x1a0b38) {
      return;
    }
    _0x1a0b38.style.left = toNumber(_0x54ac0a.leftPct, 0) + "%";
    _0x1a0b38.style.right = Math.max(0, 100 - toNumber(_0x54ac0a.rightPct, 0)) + "%";
    _0x1a0b38.style.width = "auto";
  }
  _applyAudioTimelineTrimRect(_0x421b6b, _0x513272 = {}) {
    this._applyAudioTimelineSegmentRect(_0x421b6b, _0x513272);
  }
  _timelinePreviewRangeRect(_0x2a0baa = {}) {
    const _0x3fa68e = toNumber(_0x2a0baa.startSec, 0);
    const _0xa1923f = Math.max(_0x3fa68e, toNumber(_0x2a0baa.endSec, _0x3fa68e));
    if (_0x3fa68e >= 0) {
      return getMediaClipTimelineRangeRect(_0x2a0baa);
    }
    const _0x501eb7 = getMediaClipTimelineDisplayDuration(_0x2a0baa.durationSec);
    const _0x3db301 = _0x3fa68e / _0x501eb7 * 100;
    const _0x2dbfeb = _0xa1923f / _0x501eb7 * 100;
    return {
      startSec: _0x3fa68e,
      endSec: _0xa1923f,
      leftPct: _0x3db301,
      rightPct: _0x2dbfeb,
      widthPct: Math.max(0, _0x2dbfeb - _0x3db301)
    };
  }
  _timelineCursorHost(_0x5eb011 = null) {
    return _0x5eb011?.closest?.(".media-clip-compact-timeline") || this.el?.querySelector?.(".media-clip-compact-timeline") || _0x5eb011;
  }
  _syncTimelineCursorLayerForRow(_0x578349 = null) {
    if (!_0x578349) {
      return;
    }
    const _0x455d4e = this._timelineCursorHost(_0x578349);
    const _0x71491d = Math.max(240, readLayoutWidthPx(_0x578349, this._timelineTrackContentWidth()));
    _0x455d4e?.style?.setProperty?.("--media-clip-track-content-width", _0x71491d + "px");
    const _0x232b7c = _0x455d4e?.querySelector?.(".media-clip-timeline-cursors");
    if (_0x232b7c?.style) {
      _0x232b7c.style.width = _0x71491d + "px";
    }
  }
  _updateTimelineSegmentLabel(_0x26bfa9, _0x4b8430 = 0) {
    const _0x1c86b1 = _0x26bfa9?.querySelector?.(".media-clip-material-label");
    if (!_0x1c86b1) {
      return;
    }
    _0x1c86b1.textContent = formatDurationLabel(_0x4b8430);
  }
  _syncAudioSegmentWaveformViewport(_0x2957a8, _0x539097 = {}) {
    const _0x36d537 = _0x2957a8?.querySelector?.(".media-clip-wave-svg");
    if (!_0x36d537) {
      return;
    }
    const _0x36744d = _0x2957a8?.querySelector?.(".media-clip-wave-source") || _0x36d537;
    const _0x3dd4a0 = getMediaClipWaveformViewport(_0x539097);
    const _0x3356ec = formatWaveformPct(_0x3dd4a0.widthPct) + "%";
    const _0xaf4d95 = _0x3dd4a0.marginLeftPct > 0 ? "-" + formatWaveformPct(_0x3dd4a0.marginLeftPct) + "%" : "0";
    _0x36d537.setAttribute("viewBox", getMediaClipWaveformViewBox());
    _0x36d537.setAttribute("width", "100%");
    if (_0x36744d?.style) {
      _0x36744d.style.width = _0x3356ec;
      _0x36744d.style.marginLeft = _0xaf4d95;
      _0x36744d.style.transform = "none";
      _0x36744d.style.transformOrigin = "";
    }
    if (_0x36d537.style) {
      _0x36d537.style.width = "100%";
      _0x36d537.style.marginLeft = "0";
      _0x36d537.style.transform = "none";
      _0x36d537.style.transformOrigin = "";
    }
  }
  _applyVideoTimelinePreview(_0x4abf7f, _0xcff881 = [], _0xc58668 = 0) {
    const _0x11b6aa = Array.isArray(_0xcff881) ? _0xcff881 : [];
    if (!_0x4abf7f || !_0x11b6aa.length) {
      return 0;
    }
    let _0x2f2901 = 0;
    _0x4abf7f.querySelectorAll?.(".media-clip-segment")?.forEach(_0x166655 => {
      const _0xb8ccce = this._segmentClipIndex(_0x166655, "video", _0x11b6aa);
      const _0x49a3c9 = _0x11b6aa[_0xb8ccce];
      if (!_0x49a3c9) {
        return;
      }
      const _0x3f7b6b = toNumber(_0x49a3c9.timelineStartSec, 0);
      const _0x52da3b = Math.max(_0x3f7b6b, toNumber(_0x49a3c9.timelineEndSec, _0x3f7b6b));
      const _0x1d17e6 = Math.max(0, _0x52da3b - _0x3f7b6b);
      this._applyTimelineSegmentRect(_0x166655, this._timelinePreviewRangeRect({
        startSec: _0x3f7b6b,
        endSec: _0x52da3b,
        durationSec: _0xc58668
      }));
      this._updateTimelineSegmentLabel(_0x166655, _0x1d17e6);
      _0x2f2901 += 1;
    });
    return _0x2f2901;
  }
  _applyAudioTimelinePreview(_0x513728, _0xef00c6 = [], _0x5c8cc8 = 0) {
    const _0x96ac58 = Array.isArray(_0xef00c6) ? _0xef00c6 : [];
    if (!_0x513728 || !_0x96ac58.length) {
      return 0;
    }
    const _0x38de98 = this._audioLaneCount(_0x96ac58);
    this._setAudioLaneCountStyle(_0x513728, _0x38de98);
    this._setAudioLaneCountStyle(_0x513728.parentElement, _0x38de98);
    this._setAudioLaneCountStyle(_0x513728.closest?.(".media-clip-timeline-lane"), _0x38de98);
    this._setAudioLaneCountStyle(_0x513728.closest?.(".media-clip-compact-timeline"), _0x38de98);
    let _0x26df64 = 0;
    _0x513728.querySelectorAll?.(".media-clip-segment")?.forEach(_0x2eb175 => {
      const _0x49fc55 = this._segmentClipIndex(_0x2eb175, "audio", _0x96ac58);
      const _0x26b9a9 = _0x96ac58[_0x49fc55];
      if (!_0x26b9a9) {
        return;
      }
      const _0x462733 = toNumber(_0x26b9a9.timelineStartSec, 0);
      const _0x2f27f1 = Math.max(_0x462733, toNumber(_0x26b9a9.timelineEndSec, _0x462733));
      const _0x18df46 = Math.max(0, _0x2f27f1 - _0x462733);
      this._applyAudioTimelineSegmentRect(_0x2eb175, this._timelinePreviewRangeRect({
        startSec: _0x462733,
        endSec: _0x2f27f1,
        durationSec: _0x5c8cc8
      }));
      this._updateTimelineSegmentLabel(_0x2eb175, _0x18df46);
      this._setAudioSegmentLaneVisual(_0x2eb175, this._audioClipLaneIndex(_0x26b9a9));
      _0x2eb175.dataset.mutedClip = _0x26b9a9.muted === true ? "true" : "false";
      _0x2eb175.dataset.disabledClip = _0x26b9a9.disabled === true ? "true" : "false";
      _0x2eb175.classList?.toggle?.("is-muted", _0x26b9a9.muted === true);
      _0x2eb175.classList?.toggle?.("is-disabled", _0x26b9a9.disabled === true);
      this._syncAudioSegmentWaveformViewport(_0x2eb175, _0x26b9a9);
      _0x26df64 += 1;
    });
    return _0x26df64;
  }
  _setTimelinePlayheadFromPointer(_0x5a6b42, _0x4847d3, _0x4489cf, _0x186b70 = 0, _0x35cfb5 = {}) {
    if (!_0x5a6b42 || !this._mediaClip.tracks?.[_0x4847d3]) {
      return false;
    }
    const _0x4e550f = this._timelineSecFromPointerEvent(_0x5a6b42, _0x4489cf, _0x186b70);
    this._playheadSec = _0x4e550f;
    const _0xcdc99c = this._mediaClip.activeTrack !== _0x4847d3;
    if (_0x4847d3 === "video") {
      if (_0x35cfb5.updateClipSelection !== false) {
        const _0x39a83e = _0x35cfb5.clipIndex == null ? this._clipIndexAtTimelineSec(_0x4e550f) : Math.max(0, Math.trunc(toNumber(_0x35cfb5.clipIndex, 0)));
        this._setActiveClipIndex(_0x39a83e);
        if (_0x35cfb5.selectClip !== false) {
          this._selectClipIndex(_0x39a83e);
        }
      }
      if (_0x35cfb5.syncPreview !== false) {
        this._syncVideoPreviewSourceForTimelineSec(_0x4e550f);
      }
    } else if (_0x4847d3 === "audio") {
      const _0x516a00 = _0x35cfb5.clipIndex == null ? this._audioClipIndexAtTimelineSec(_0x4e550f) : Math.max(0, Math.trunc(toNumber(_0x35cfb5.clipIndex, 0)));
      this._setActiveAudioClipIndex(_0x516a00);
      if (_0x35cfb5.selectClip !== false) {
        this._selectAudioClipIndex(_0x516a00);
      }
      if (_0x35cfb5.syncPreview !== false) {
        this._syncAudioPreviewSourceForTimelineSec(_0x4e550f);
      }
    }
    if (_0xcdc99c && _0x35cfb5.updateActiveTrack !== false) {
      this._mediaClip = {
        ...this._mediaClip,
        activeTrack: _0x4847d3
      };
      this.nodeData = {
        ...(this.nodeData || {}),
        mediaClip: this._mediaClip
      };
      if (_0x35cfb5.persistActiveTrack !== false) {
        a409_0x2af79e.updateNodeData(this.id, {
          mediaClip: this._mediaClip
        });
      }
    }
    this._updateTrackPlayheadVisual(_0x5a6b42, _0x186b70, {
      playheadSec: _0x4e550f
    });
    if (_0x35cfb5.syncPreview !== false) {
      this._syncPreviewTime(_0x4847d3, this._previewSourceSecForTimelineSec(_0x4847d3, _0x4e550f));
    }
    return true;
  }
  _applyTimelinePlayheadModel(_0x5d836d, _0x1944fb = {}) {
    if (!_0x5d836d) {
      return;
    }
    _0x5d836d.style.left = toNumber(_0x1944fb.leftPct, 0) + "%";
  }
  async _loadAudioWaveformPath(_0x12331d, _0x90f78c, _0x5da158 = {}) {
    if (!_0x12331d || !_0x90f78c) {
      return;
    }
    const _0x5aebdd = resolveMediaClipWaveformUrl(_0x5da158);
    const _0x45f0a8 = resolveMediaClipAudioUrl(_0x5da158);
    if (!_0x5aebdd && !_0x45f0a8) {
      return;
    }
    const _0x407275 = [_0x5aebdd, _0x45f0a8, resolveMediaClipSourceKey(_0x5da158)].join("|");
    if (_0x12331d.dataset) {
      _0x12331d.dataset.waveformKey = _0x407275;
    }
    const _0x4c02a9 = {
      width: MEDIA_CLIP_WAVEFORM_WIDTH,
      height: MEDIA_CLIP_WAVEFORM_HEIGHT,
      samples: MEDIA_CLIP_WAVEFORM_SAMPLES
    };
    let _0x18a3ea = "";
    if (_0x5aebdd) {
      _0x18a3ea = await getWaveformBarsPathFromPersistedUrl(_0x5aebdd, _0x4c02a9);
    }
    if (!_0x18a3ea && _0x45f0a8 && typeof window !== "undefined") {
      _0x18a3ea = await getWaveformBarsPathFromUrl(_0x45f0a8, _0x4c02a9);
    }
    if (!_0x18a3ea) {
      return;
    }
    if (_0x12331d.dataset?.waveformKey && _0x12331d.dataset.waveformKey !== _0x407275) {
      return;
    }
    if (this.el?.isConnected === false) {
      return;
    }
    _0x90f78c.setAttribute("d", _0x18a3ea);
    _0x12331d.classList?.add("has-waveform");
  }
  _renderTrack(_0x2dc3e7, _0x19c29f = {}) {
    const _0x3c297c = this._mediaClip.tracks?.[_0x2dc3e7];
    const _0x5ba172 = _0x2dc3e7 === "video" ? getMediaClipTimelineDisplayDuration(_0x19c29f.durationSec ?? this._videoTimelineDuration(_0x3c297c)) : getMediaClipTimelineDisplayDuration(_0x19c29f.durationSec ?? this._timelineDurationForKind(_0x2dc3e7));
    const _0x274372 = this._mediaClip.activeTrack === _0x2dc3e7;
    const _0x578ece = _0x2dc3e7 === "audio" ? this._audioTimelineClips(_0x3c297c) : [];
    const _0x4573b5 = _0x2dc3e7 === "audio" ? this._audioLaneCount(_0x578ece) : 1;
    const _0x280b1b = document.createElement("div");
    _0x280b1b.className = "media-clip-track media-clip-track-" + _0x2dc3e7;
    _0x280b1b.classList.toggle("is-active", _0x274372);
    _0x280b1b.classList.toggle("is-compact", _0x19c29f.compact === true);
    if (_0x2dc3e7 === "audio") {
      _0x280b1b.dataset.audioLaneCount = String(_0x4573b5);
      this._setAudioLaneCountStyle(_0x280b1b, _0x4573b5);
      for (let _0x3f87ef = 0; _0x3f87ef < _0x4573b5; _0x3f87ef += 1) {
        const _0x3c726e = document.createElement("div");
        _0x3c726e.className = "media-clip-audio-lane-guide";
        _0x3c726e.dataset.audioLaneIndex = String(_0x3f87ef);
        _0x3c726e.style.setProperty("--media-clip-audio-lane-index", String(_0x3f87ef));
        _0x3c726e.style.setProperty("--media-clip-audio-lane-top", _0x3f87ef * (MEDIA_CLIP_AUDIO_LANE_HEIGHT_PX + MEDIA_CLIP_AUDIO_LANE_GAP_PX) + "px");
        _0x280b1b.appendChild(_0x3c726e);
      }
    }
    this._setTimelineRowDuration(_0x280b1b, _0x5ba172);
    const _0x117dfe = toNumber(_0x19c29f.timelineWidthPx, 0);
    if (_0x117dfe > 0) {
      _0x280b1b.style.width = Math.max(240, _0x117dfe) + "px";
    }
    _0x280b1b.addEventListener("click", _0x3bac7f => {
      _0x3bac7f.stopPropagation();
      if (this._suppressTrackClick) {
        this._suppressTrackClick = false;
        return;
      }
      if (this._isTimelineControlTarget(_0x3bac7f.target)) {
        return;
      }
      if (_0x19c29f.compact === true) {
        this._setMediaClipWithLayout({
          ...this._mediaClip,
          expanded: true
        }, true);
        return;
      }
      if (!this._timelineEventSegment(_0x3bac7f.target)) {
        return;
      }
      const _0x1c527f = this._timelineRowDuration(_0x280b1b, _0x5ba172);
      const _0x1a26ef = this._timelineSecFromPointerEvent(_0x280b1b, _0x3bac7f, _0x1c527f);
      const _0x330a2f = _0x2dc3e7 === "video" ? this._setActiveClipIndex(this._clipIndexAtTimelineSec(_0x1a26ef)) : _0x2dc3e7 === "audio" ? this._setActiveAudioClipIndex(this._audioClipIndexAtTimelineSec(_0x1a26ef)) : false;
      if (_0x2dc3e7 === "audio") {
        this._selectAudioClipIndex(this._activeAudioClipIndex);
      }
      this._setActiveTrack(_0x2dc3e7, _0x1a26ef, {
        forceRender: _0x330a2f
      });
    });
    const _0x1e9994 = (_0x460b4d, _0x3f0e94) => {
      const _0x245995 = document.createElement("div");
      _0x245995.className = "media-clip-filmstrip";
      const _0x102834 = collectMediaClipFrameUrls(_0x3f0e94);
      const _0xcd4f95 = getMediaClipFrameCount(this._estimateTimelineWidth(_0x19c29f), _0x19c29f);
      if (_0x102834.length > 0) {
        for (let _0x30fbc9 = 0; _0x30fbc9 < _0xcd4f95; _0x30fbc9 += 1) {
          const _0x41352c = document.createElement("img");
          _0x41352c.className = "media-clip-filmstrip-frame";
          _0x41352c.src = _0x102834[_0x30fbc9 % _0x102834.length];
          _0x41352c.alt = "";
          _0x41352c.draggable = false;
          _0x41352c.addEventListener("error", () => fillFilmstripPlaceholder(_0x245995, _0xcd4f95), {
            once: true
          });
          _0x245995.appendChild(_0x41352c);
        }
      } else {
        fillFilmstripPlaceholder(_0x245995, _0xcd4f95);
      }
      _0x460b4d.appendChild(_0x245995);
    };
    const _0x446c38 = (_0x606940, _0x185451 = {}, _0x13fa79 = null) => {
      const _0x3246ee = document.createElement("div");
      _0x3246ee.className = "media-clip-wave";
      const _0x5a40d8 = document.createElement("div");
      _0x5a40d8.className = "media-clip-wave-source";
      const _0x2d24a6 = createMediaClipSvgElement("svg");
      setMediaClipSvgClass(_0x2d24a6, "media-clip-wave-svg");
      _0x2d24a6.setAttribute("width", "100%");
      _0x2d24a6.setAttribute("height", "100%");
      _0x2d24a6.setAttribute("viewBox", getMediaClipWaveformViewBox());
      _0x2d24a6.setAttribute("preserveAspectRatio", "none");
      const _0x1a9544 = createMediaClipSvgElement("path");
      setMediaClipSvgClass(_0x1a9544, "media-clip-wave-path");
      _0x1a9544.setAttribute("d", "");
      _0x2d24a6.appendChild(_0x1a9544);
      _0x5a40d8.appendChild(_0x2d24a6);
      _0x3246ee.appendChild(_0x5a40d8);
      _0x606940.appendChild(_0x3246ee);
      this._syncAudioSegmentWaveformViewport(_0x606940, _0x185451);
      this._loadAudioWaveformPath(_0x3246ee, _0x1a9544, _0x13fa79);
    };
    const _0x44f15f = (_0x4ffe4b, _0x54ca3c = {}) => {
      const _0x4a0bec = document.createElement("div");
      _0x4a0bec.className = "media-clip-material-selection v2-video-clipselection";
      _0x4a0bec.style.left = "0%";
      _0x4a0bec.style.width = "100%";
      const _0x522e3d = document.createElement("div");
      _0x522e3d.className = "media-clip-material-label v2-video-cliplabel";
      const _0x105c1a = toNumber(_0x54ca3c.startSec ?? _0x54ca3c.timelineStartSec, 0);
      const _0x5e25c7 = toNumber(_0x54ca3c.endSec ?? _0x54ca3c.timelineEndSec, _0x105c1a);
      _0x522e3d.textContent = formatDurationLabel(Math.max(0, _0x5e25c7 - _0x105c1a));
      _0x4a0bec.append(_0x522e3d);
      _0x4ffe4b.appendChild(_0x4a0bec);
    };
    const _0x2675f2 = ({
      rect = {},
      source = null,
      clipIndex = 0,
      item = null
    }) => {
      const _0x445371 = document.createElement("div");
      _0x445371.className = "media-clip-segment media-clip-material-strip";
      if (_0x2dc3e7 === "audio") {
        this._applyAudioTimelineSegmentRect(_0x445371, rect);
      } else {
        this._applyTimelineSegmentRect(_0x445371, rect);
      }
      _0x445371.dataset.clipIndex = String(clipIndex);
      const _0x22c668 = normalizeText(item?.id);
      if (_0x22c668) {
        _0x445371.dataset.clipId = _0x22c668;
      }
      if (_0x2dc3e7 === "video") {
        const _0x3c5e43 = this._visualClipKind(item, source);
        _0x445371.classList.add("media-clip-segment-" + _0x3c5e43);
        _0x445371.dataset.mediaKind = _0x3c5e43;
        if (clipIndex === this._clampVideoClipIndex()) {
          _0x445371.dataset.activeClip = "true";
        }
        if (clipIndex === this._selectedClipIndex) {
          _0x445371.dataset.selectedClip = "true";
        }
        _0x1e9994(_0x445371, source);
      } else {
        _0x445371.classList.add("media-clip-segment-audio");
        _0x445371.dataset.mediaKind = "audio";
        this._setAudioSegmentLaneVisual(_0x445371, this._audioClipLaneIndex(item));
        _0x445371.dataset.mutedClip = item?.muted === true ? "true" : "false";
        _0x445371.dataset.disabledClip = item?.disabled === true ? "true" : "false";
        _0x445371.classList.toggle("is-muted", item?.muted === true);
        _0x445371.classList.toggle("is-disabled", item?.disabled === true);
        if (clipIndex === this._clampAudioClipIndex()) {
          _0x445371.dataset.activeClip = "true";
        }
        if (clipIndex === this._selectedAudioClipIndex) {
          _0x445371.dataset.selectedClip = "true";
        }
        _0x446c38(_0x445371, item, source);
      }
      _0x44f15f(_0x445371, item || {});
      if (_0x19c29f.compact !== true) {
        _0x445371.addEventListener("contextmenu", _0x4b1a44 => {
          const _0x1ca489 = this._segmentClipIndex(_0x445371, _0x2dc3e7);
          if (_0x2dc3e7 === "video") {
            this._setActiveClipIndex(_0x1ca489);
            this._selectClipIndex(_0x1ca489);
            this._syncTrackActiveClipChrome(_0x280b1b, _0x2dc3e7);
          } else if (_0x2dc3e7 === "audio") {
            this._setActiveAudioClipIndex(_0x1ca489);
            this._selectAudioClipIndex(_0x1ca489);
            this._syncTrackActiveClipChrome(_0x280b1b, _0x2dc3e7);
          }
          this._openMaterialMenu(_0x2dc3e7, _0x1ca489, _0x4b1a44);
        });
        const _0x540ae5 = _0x365840 => {
          if (this._timelineDrag()) {
            return;
          }
          const _0x577b52 = this._segmentClipIndex(_0x445371, _0x2dc3e7);
          this._setTimelineHoverSegment(_0x280b1b, _0x445371, _0x2dc3e7, _0x577b52);
          const _0x5d85e4 = this._timelineRowDuration(_0x280b1b, _0x5ba172);
          const _0x1c3e9e = this._timelineSecFromPointerEvent(_0x280b1b, _0x365840, _0x5d85e4);
          this._previewTrackPlayhead(_0x280b1b, _0x2dc3e7, _0x1c3e9e, _0x5d85e4);
        };
        _0x445371.addEventListener("pointerenter", _0x540ae5);
        _0x445371.addEventListener("pointermove", _0x540ae5);
        _0x445371.addEventListener("pointerleave", () => {
          if (!this._timelineDrag()) {
            this._clearTimelineHoverState(_0x280b1b);
          }
          this._restoreTrackPlayhead(_0x280b1b, _0x2dc3e7);
        });
        _0x445371.addEventListener("pointerdown", _0x58f25e => {
          const _0x4c898f = this._segmentClipIndex(_0x445371, _0x2dc3e7);
          if (_0x2dc3e7 === "video") {
            this._setActiveClipIndex(_0x4c898f);
            this._selectClipIndex(_0x4c898f);
            this._syncTrackActiveClipChrome(_0x280b1b, _0x2dc3e7);
          } else if (_0x2dc3e7 === "audio") {
            this._setActiveAudioClipIndex(_0x4c898f);
            this._selectAudioClipIndex(_0x4c898f);
            this._syncTrackActiveClipChrome(_0x280b1b, _0x2dc3e7);
          }
          this._startSegmentDrag(_0x2dc3e7, _0x58f25e, {
            ..._0x19c29f,
            clipIndex: _0x4c898f
          });
        });
      }
      _0x280b1b.appendChild(_0x445371);
      return _0x445371;
    };
    if (_0x2dc3e7 === "video") {
      const _0x886dd9 = this._videoTimelineClips(_0x3c297c);
      if (_0x886dd9.length) {
        _0x886dd9.forEach((_0xaf1363, _0x4d4351) => {
          const _0x2b8f59 = toNumber(_0xaf1363.timelineStartSec, 0);
          const _0x4e393e = Math.max(_0x2b8f59, toNumber(_0xaf1363.timelineEndSec, _0x2b8f59));
          _0x2675f2({
            rect: getMediaClipTimelineRangeRect({
              startSec: _0x2b8f59,
              endSec: _0x4e393e,
              durationSec: _0x5ba172
            }),
            source: this._videoClipSource(_0xaf1363, _0x4d4351),
            clipIndex: _0x4d4351,
            item: _0xaf1363
          });
        });
      } else {
        _0x2675f2({
          rect: getMediaClipTimelineRangeRect({
            startSec: _0x3c297c.startSec,
            endSec: _0x3c297c.endSec,
            durationSec: _0x5ba172
          }),
          source: this._videoClipSource(_0x886dd9[0] || _0x3c297c, 0),
          clipIndex: 0,
          item: _0x886dd9[0] || _0x3c297c
        });
      }
    } else {
      const _0x31bf7c = _0x578ece;
      if (_0x31bf7c.length) {
        _0x31bf7c.forEach((_0x452fa4, _0x25640c) => {
          const _0x757d74 = toNumber(_0x452fa4.timelineStartSec, 0);
          const _0x4f02fd = Math.max(_0x757d74, toNumber(_0x452fa4.timelineEndSec, _0x757d74));
          _0x2675f2({
            rect: getMediaClipTimelineRangeRect({
              startSec: _0x757d74,
              endSec: _0x4f02fd,
              durationSec: _0x5ba172
            }),
            source: this._audioClipSource(_0x452fa4, _0x25640c),
            clipIndex: _0x25640c,
            item: _0x452fa4
          });
        });
      }
    }
    if (!_0x19c29f.compact && _0x274372) {
      this._syncTrackActiveClipChrome(_0x280b1b, _0x2dc3e7);
    }
    return _0x280b1b;
  }
  _timelineSecFromPointerEvent(_0xe2131e, _0x248153, _0x3c3b35 = 0) {
    const _0x3a94c3 = _0xe2131e?.getBoundingClientRect?.();
    const _0x214e50 = Math.max(1, toNumber(_0x3a94c3?.width, readLayoutWidthPx(_0xe2131e, 1)));
    const _0x38a964 = toNumber(_0x3a94c3?.left, 0);
    return getMediaClipTimelineSecFromClientX(_0x248153?.clientX, {
      durationSec: _0x3c3b35,
      trackLeftPx: _0x38a964,
      trackWidthPx: _0x214e50
    });
  }
  _previewTrackPlayhead(_0x31eb57, _0x3f06b9, _0xf62f9e = 0, _0x1d0a63 = 0) {
    if (!_0x31eb57 || this._playing || this._playPreviewPending) {
      return;
    }
    this._updateTimelineHoverPlayheadVisual(_0x31eb57, _0x1d0a63, {
      playheadSec: _0xf62f9e
    });
    if (_0x3f06b9 === "video") {
      this._syncVideoPreviewSourceForTimelineSec(_0xf62f9e);
    } else if (_0x3f06b9 === "audio") {
      this._syncAudioPreviewSourceForTimelineSec(_0xf62f9e);
    }
    this._syncPreviewTime(_0x3f06b9, this._previewSourceSecForTimelineSec(_0x3f06b9, _0xf62f9e));
  }
  _syncTimelineHoverPlayheadFromPointer(_0x52a00f, _0xfa7e8, _0x4ddec8 = 0) {
    if (!_0x52a00f || !_0xfa7e8 || this._playing || this._playPreviewPending) {
      return;
    }
    const _0x2f7934 = this._timelineSecFromPointerEvent(_0x52a00f, _0xfa7e8, _0x4ddec8);
    this._updateTimelineHoverPlayheadVisual(_0x52a00f, _0x4ddec8, {
      playheadSec: _0x2f7934
    });
  }
  _restoreTrackPlayhead(_0x2318fa, _0x3bd2d7) {
    if (!_0x2318fa || this._playing || this._playPreviewPending) {
      return;
    }
    this._hideTimelineHoverPlayhead(_0x2318fa);
    this._updatePlaybackVisuals(_0x3bd2d7);
  }
  _restoreTimelinePlayheads() {
    if (this._playing || this._playPreviewPending) {
      return;
    }
    this._hideTimelineHoverPlayhead();
    this._updatePlaybackVisuals("video");
    this._updatePlaybackVisuals("audio");
  }
  _syncTrackActiveClipChrome(_0x34d032, _0x351b97) {
    if (!_0x34d032 || _0x34d032.classList?.contains("is-compact")) {
      return;
    }
    const _0x1627fb = this._mediaClip.activeTrack === _0x351b97;
    const _0x3a52d6 = _0x351b97 === "video" ? this._clampVideoClipIndex() : this._clampAudioClipIndex();
    const _0x258611 = _0x351b97 === "video" ? this._clampSelectedClipIndex() : this._clampSelectedAudioClipIndex();
    const _0x4c8cb5 = _0x351b97 === "audio" ? this._mediaClip.audioClips || [] : this._mediaClip.clips || [];
    _0x34d032.querySelectorAll(".media-clip-segment").forEach(_0x224210 => {
      const _0x48ebfc = this._segmentClipIndex(_0x224210, _0x351b97, _0x4c8cb5);
      if (_0x351b97 === "video") {
        const _0x24ee5b = normalizeText(_0x4c8cb5[_0x48ebfc]?.id);
        _0x224210.dataset.clipIndex = String(_0x48ebfc);
        if (_0x24ee5b) {
          _0x224210.dataset.clipId = _0x24ee5b;
        }
      } else if (_0x351b97 === "audio") {
        const _0x50a572 = normalizeText(_0x4c8cb5[_0x48ebfc]?.id);
        _0x224210.dataset.clipIndex = String(_0x48ebfc);
        if (_0x50a572) {
          _0x224210.dataset.clipId = _0x50a572;
        }
      }
      const _0x5b343b = _0x1627fb && _0x48ebfc === _0x3a52d6;
      const _0x2fe91d = _0x1627fb && _0x48ebfc === _0x258611;
      if (_0x5b343b) {
        _0x224210.dataset.activeClip = "true";
      } else {
        delete _0x224210.dataset.activeClip;
      }
      if (_0x2fe91d) {
        _0x224210.dataset.selectedClip = "true";
      } else {
        delete _0x224210.dataset.selectedClip;
      }
      _0x224210.querySelectorAll(".media-clip-trim").forEach(_0x11fee9 => {
        if (!_0x1627fb || Math.trunc(toNumber(_0x11fee9.dataset.clipIndex, -1)) !== _0x48ebfc) {
          _0x11fee9.remove();
        }
      });
      if (!_0x1627fb) {
        return;
      }
      _0x224210.querySelectorAll(".media-clip-material-selection .media-clip-trim").forEach(_0x579f69 => _0x579f69.remove());
      const _0x4444e5 = _0x224210;
      const _0x42e3a8 = _0xa3dec6 => Array.from(_0x4444e5.children).some(_0x5575f4 => _0x5575f4.classList?.contains("media-clip-trim-" + _0xa3dec6));
      if (!_0x42e3a8("left")) {
        _0x4444e5.appendChild(this._renderTrimHandle(_0x351b97, "left", {
          clipIndex: _0x48ebfc
        }));
      }
      if (!_0x42e3a8("right")) {
        _0x4444e5.appendChild(this._renderTrimHandle(_0x351b97, "right", {
          clipIndex: _0x48ebfc
        }));
      }
    });
  }
  _renderTrimHandle(_0x55e6c7, _0x14f4a7, _0x2bc32f = {}) {
    return renderMediaClipTimelineTrimHandle(this, _0x55e6c7, _0x14f4a7, _0x2bc32f);
  }
  _detachDragListeners() {
    return detachMediaClipTimelineEditDrag(this);
  }
  _startSegmentDrag(_0x15d5ef, _0x33f4f8, _0x4578d9 = {}) {
    return startMediaClipTimelineSegmentDrag(this, _0x15d5ef, _0x33f4f8, _0x4578d9);
  }
  _handleTrimDrag(_0x3c41a0, _0x446e7c = null) {
    return handleMediaClipTimelineDrag(this, _0x3c41a0, _0x446e7c);
  }
  _applyTimelineDragPreviewFromPointer(_0x2aec26 = this._timelineDrag(), _0x539fcc = {}) {
    return applyMediaClipTimelineDragPreviewFromPointer(this, _0x2aec26, _0x539fcc);
  }
  _previewVideoTrimDrag(_0x380791, _0x2a41f6 = 0, _0x6058f0 = 0, _0x43f07a = null) {
    return previewMediaClipTimelineTrimDrag(this, "video", _0x380791, _0x2a41f6, _0x6058f0, _0x43f07a);
  }
  _previewAudioTrimDrag(_0x1a6d3a, _0x662d6b = 0, _0x23f5fc = 0, _0x21fccf = null) {
    return previewMediaClipTimelineTrimDrag(this, "audio", _0x1a6d3a, _0x662d6b, _0x23f5fc, _0x21fccf);
  }
  _commitVideoTrimDrag(_0x2915bb, _0x2e5712 = {}) {
    return commitMediaClipTimelineEdit(this, "video", "trim", _0x2915bb, _0x2e5712);
  }
  _commitAudioTrimDrag(_0x405369, _0x19ddda = {}) {
    return commitMediaClipTimelineEdit(this, "audio", "trim", _0x405369, _0x19ddda);
  }
  _handleSegmentDrag(_0x1825f0) {
    return handleMediaClipTimelineSegmentDrag(this, _0x1825f0);
  }
  _previewVideoSegmentDrag(_0x458471, _0x12c320 = 0, _0x18c0eb = 0) {
    return previewMediaClipTimelineMoveDrag(this, "video", _0x458471, _0x12c320, _0x18c0eb);
  }
  _previewAudioSegmentDrag(_0x3800a2, _0x4ae6e6 = 0, _0x102644 = 0) {
    return previewMediaClipTimelineMoveDrag(this, "audio", _0x3800a2, _0x4ae6e6, _0x102644);
  }
  _commitVideoSegmentDrag(_0x3cc1f7, _0x5e2e81 = {}) {
    return commitMediaClipTimelineEdit(this, "video", "move", _0x3cc1f7, _0x5e2e81);
  }
  _commitAudioSegmentDrag(_0x3c9170, _0x5b7c0d = {}) {
    return commitMediaClipTimelineEdit(this, "audio", "move", _0x3c9170, _0x5b7c0d);
  }
  _flushTimelineSettlePersist() {
    if (!this._timelineSettlePendingPersist) {
      return;
    }
    const _0x431d02 = this._timelineSettlePendingCommit;
    this._timelineSettlePendingPersist = false;
    this._timelineSettlePendingCommit = false;
    this._persistTimelineMediaClip({
      commitHistory: _0x431d02
    });
  }
  _persistTimelineMediaClip(_0x58a67c = {}) {
    this._skipNextStoreMediaClipRender = true;
    a409_0x2af79e.updateNodeData(this.id, {
      mediaClip: this._mediaClip
    });
    this.nodeData = {
      ...(this.nodeData || {}),
      mediaClip: this._mediaClip
    };
    if (_0x58a67c.commitHistory === true) {
      commit();
    }
  }
  _applyDeferredTimelineDragUpdate(_0x555a60 = null) {
    const _0x1a1cdb = this._deferredTimelineDragNodeData;
    this._deferredTimelineDragNodeData = null;
    if (!_0x1a1cdb || this._timelineDrag()) {
      return;
    }
    const _0x53e25d = _0x1a1cdb.mediaClip;
    if (isSameMediaClipState(_0x53e25d, this._mediaClip)) {
      return;
    }
    if (_0x555a60?.startMediaClip && isSameMediaClipState(_0x53e25d, _0x555a60.startMediaClip)) {
      return;
    }
    this.update(_0x1a1cdb);
  }
  _scheduleTimelineSettleRender(_0xf41e80, _0x536ab0 = {}) {
    if (this._timelineSettleTimer) {
      clearTimeout(this._timelineSettleTimer);
    }
    this._timelineSettleRow = _0xf41e80 || this._timelineSettleRow;
    const _0x521903 = this._timelineSettleVersion;
    this._timelineSettlePendingPersist = this._timelineSettlePendingPersist || _0x536ab0.persist === true;
    this._timelineSettlePendingCommit = this._timelineSettlePendingCommit || _0x536ab0.commitHistory === true;
    this._timelineSettleTimer = setTimeout(() => {
      if (_0x521903 !== this._timelineSettleVersion) {
        return;
      }
      this._timelineSettleTimer = 0;
      const _0x591ec2 = this._timelineSettleRow || _0xf41e80;
      _0x591ec2?.classList.remove("is-settling");
      this._timelineSettleRow = null;
      if (_0x536ab0.syncTimelineWidthAfterSettle !== false) {
        this._syncTimelineContentWidth();
      }
      this._flushTimelineSettlePersist();
    }, TIMELINE_SETTLE_ANIMATION_MS);
  }
  _animateTrackVisualsToCurrentState(_0x2d013f, _0x3264f1 = "video", _0x1ad654 = {}) {
    const _0x1edfa7 = this._startTimelineSettle(_0x2d013f);
    const _0x1b8109 = {
      ..._0x1ad654
    };
    if (_0x1b8109.persist === true) {
      this._persistTimelineMediaClip({
        commitHistory: _0x1b8109.commitHistory === true
      });
      _0x1b8109.persist = false;
      _0x1b8109.commitHistory = false;
    }
    const _0x36b40f = () => {
      if (_0x1edfa7 !== this._timelineSettleVersion || this._timelineDrag()) {
        return;
      }
      this._updateTrackVisuals(_0x3264f1, {
        durationSec: _0x1b8109.durationSec,
        syncTimelineWidth: false
      });
      this._scheduleTimelineSettleRender(_0x2d013f, _0x1b8109);
    };
    if (typeof requestAnimationFrame === "function") {
      requestAnimationFrame(() => requestAnimationFrame(_0x36b40f));
    } else {
      setTimeout(_0x36b40f, 0);
    }
  }
  _startTimelineSettle(_0x10528a) {
    this._cancelTimelineSettle();
    this._timelineSettleVersion += 1;
    if (this._timelineSettleTimer) {
      clearTimeout(this._timelineSettleTimer);
      this._timelineSettleTimer = 0;
      const _0x46c316 = this._timelineSettleRow || _0x10528a;
      _0x46c316?.classList.remove("is-settling");
      this._timelineSettleRow = null;
      this._flushTimelineSettlePersist();
    }
    this._timelineSettleRow = _0x10528a || null;
    _0x10528a?.classList.add("is-settling");
    _0x10528a?.getBoundingClientRect?.();
    return this._timelineSettleVersion;
  }
  _cancelTimelineSettle(_0x53415f = {}) {
    this._timelineSettleVersion = toNumber(this._timelineSettleVersion, 0) + 1;
    if (this._timelineSettleTimer) {
      clearTimeout(this._timelineSettleTimer);
      this._timelineSettleTimer = 0;
    }
    const _0x1c3b50 = this._timelineSettleRow;
    _0x1c3b50?.classList.remove("is-settling");
    this._timelineSettleRow = null;
    if (_0x53415f.flushPersist !== false) {
      this._flushTimelineSettlePersist();
    } else {
      this._timelineSettlePendingPersist = false;
      this._timelineSettlePendingCommit = false;
    }
  }
  _updateTrackPlayheadVisual(_0x3e0283, _0x3ec677 = 0, _0x366d47 = {}) {
    if (!_0x3e0283) {
      return;
    }
    const _0x41ef07 = this._timelineRowDuration(_0x3e0283, _0x3ec677);
    this._setTimelineRowDuration(_0x3e0283, _0x41ef07);
    this._syncTimelineCursorLayerForRow(_0x3e0283);
    const _0x56bc48 = this._timelineCursorHost(_0x3e0283);
    const _0x2a5ff3 = _0x56bc48?.querySelector?.(".media-clip-playhead") || _0x3e0283.querySelector?.(".media-clip-playhead");
    if (!_0x2a5ff3) {
      return;
    }
    this._applyTimelinePlayheadModel(_0x2a5ff3, getMediaClipTimelinePlayheadModel({
      playheadSec: _0x366d47.playheadSec ?? this._playheadSec,
      durationSec: _0x41ef07
    }));
  }
  _updateTimelineHoverPlayheadVisual(_0xa5d44a, _0x2ef315 = 0, _0x155d96 = {}) {
    if (!_0xa5d44a) {
      return;
    }
    const _0xedf46a = this._timelineRowDuration(_0xa5d44a, _0x2ef315);
    this._setTimelineRowDuration(_0xa5d44a, _0xedf46a);
    this._syncTimelineCursorLayerForRow(_0xa5d44a);
    const _0xc4bd97 = this._timelineCursorHost(_0xa5d44a);
    const _0x9577f7 = _0xc4bd97?.querySelector?.(".media-clip-hover-playhead") || _0xa5d44a.querySelector?.(".media-clip-hover-playhead");
    if (!_0x9577f7) {
      return;
    }
    _0x9577f7.hidden = false;
    _0x9577f7.classList?.add("is-visible");
    this._applyTimelinePlayheadModel(_0x9577f7, getMediaClipTimelinePlayheadModel({
      playheadSec: _0x155d96.playheadSec ?? this._playheadSec,
      durationSec: _0xedf46a
    }));
  }
  _hideTimelineHoverPlayhead(_0x32f828 = null) {
    const _0x57dd5a = this._timelineCursorHost(_0x32f828);
    const _0x1a03b1 = [];
    const _0x448249 = _0x57dd5a?.querySelectorAll ? _0x57dd5a.querySelectorAll(".media-clip-hover-playhead") : this.el?.querySelectorAll?.(".media-clip-hover-playhead");
    _0x448249?.forEach?.(_0x477b56 => _0x1a03b1.push(_0x477b56));
    const _0x383094 = _0x57dd5a?.querySelector?.(".media-clip-hover-playhead") || _0x32f828?.querySelector?.(".media-clip-hover-playhead");
    if (_0x383094 && !_0x1a03b1.includes(_0x383094)) {
      _0x1a03b1.push(_0x383094);
    }
    _0x1a03b1.forEach(_0x414102 => {
      _0x414102.classList?.remove("is-visible");
      _0x414102.hidden = true;
    });
  }
  _clearTimelinePlaybackVisualLocks() {
    const _0x4c2ef2 = this.el;
    _0x4c2ef2?.querySelectorAll?.(".media-clip-compact-timeline")?.forEach(_0x52298e => {
      _0x52298e.classList?.remove("is-moving-material");
    });
    _0x4c2ef2?.querySelectorAll?.(".media-clip-timeline-lane")?.forEach(_0xc9ad2d => {
      _0xc9ad2d.classList?.remove("is-moving");
      _0xc9ad2d.classList?.remove("is-trimming");
    });
    _0x4c2ef2?.querySelectorAll?.(".media-clip-timeline-scroll")?.forEach(_0x3073d1 => {
      _0x3073d1.classList?.remove("is-trimming");
    });
    _0x4c2ef2?.querySelectorAll?.(".media-clip-track")?.forEach(_0x16d9d8 => {
      _0x16d9d8.classList?.remove("is-trimming");
      _0x16d9d8.classList?.remove("is-preview-dragging");
    });
    _0x4c2ef2?.querySelectorAll?.(".media-clip-segment")?.forEach(_0xdf779f => {
      _0xdf779f.classList?.remove("is-dragging");
      _0xdf779f.classList?.remove("is-trimming");
    });
  }
  _updatePlaybackVisuals(_0x3f9050) {
    const _0x1d290a = this._mediaClip.tracks?.[_0x3f9050];
    const _0x8aed61 = this.el?.querySelector(".media-clip-track-" + _0x3f9050 + ":not(.is-compact)");
    if (!_0x1d290a || !_0x8aed61) {
      return;
    }
    const _0x1b46fe = this._timelineDurationForKind(_0x3f9050);
    this._updateTrackPlayheadVisual(_0x8aed61, _0x1b46fe);
  }
  _updateTrackVisuals(_0x4b1c18, _0x9cc016 = {}) {
    const _0x2f2c54 = this._mediaClip.tracks?.[_0x4b1c18];
    const _0x5cb5c2 = this.el?.querySelector(".media-clip-track-" + _0x4b1c18 + ":not(.is-compact)");
    if (!_0x2f2c54 || !_0x5cb5c2) {
      return;
    }
    const _0x4a8340 = _0x4b1c18 === "video" ? getMediaClipTimelineDisplayDuration(_0x9cc016.durationSec ?? this._videoTimelineDuration(_0x2f2c54)) : getMediaClipTimelineDisplayDuration(_0x9cc016.durationSec ?? this._timelineDurationForKind(_0x4b1c18));
    this._setTimelineRowDuration(_0x5cb5c2, _0x4a8340);
    if (_0x4b1c18 === "video" && _0x9cc016.syncTimelineWidth !== false) {
      this._syncTimelineContentWidth(undefined, {
        durationSec: _0x4a8340
      });
    } else if (_0x4b1c18 === "video") {
      this._syncTimelineAddSlotForRow(_0x5cb5c2, {
        displayDurationSec: _0x4a8340
      });
    }
    if (_0x4b1c18 === "video" && (this._mediaClip.clips || []).length) {
      const _0xc09053 = this._mediaClip.clips || [];
      _0x5cb5c2.querySelectorAll(".media-clip-segment").forEach(_0x4168e3 => {
        const _0x474368 = this._segmentClipIndex(_0x4168e3, _0x4b1c18, _0xc09053);
        const _0x5e68b9 = _0xc09053[_0x474368];
        if (!_0x5e68b9) {
          return;
        }
        _0x4168e3.dataset.clipIndex = String(_0x474368);
        const _0x15cd44 = normalizeText(_0x5e68b9.id);
        if (_0x15cd44) {
          _0x4168e3.dataset.clipId = _0x15cd44;
        }
        const _0x4fd83d = toNumber(_0x5e68b9.timelineStartSec, 0);
        const _0x229866 = Math.max(_0x4fd83d, toNumber(_0x5e68b9.timelineEndSec, _0x4fd83d));
        this._applyTimelineSegmentRect(_0x4168e3, this._timelinePreviewRangeRect({
          startSec: _0x4fd83d,
          endSec: _0x229866,
          durationSec: _0x4a8340
        }));
        this._updateTimelineSegmentLabel(_0x4168e3, Math.max(0, _0x229866 - _0x4fd83d));
      });
    } else if (_0x4b1c18 === "audio" && (this._mediaClip.audioClips || []).length) {
      const _0xc64e2b = this._mediaClip.audioClips || [];
      const _0x4d4149 = this._audioLaneCount(_0xc64e2b);
      this._setAudioLaneCountStyle(_0x5cb5c2, _0x4d4149);
      this._setAudioLaneCountStyle(_0x5cb5c2.parentElement, _0x4d4149);
      this._setAudioLaneCountStyle(_0x5cb5c2.closest?.(".media-clip-timeline-lane"), _0x4d4149);
      this._setAudioLaneCountStyle(_0x5cb5c2.closest?.(".media-clip-compact-timeline"), _0x4d4149);
      this._syncAudioLaneControls(_0xc64e2b, _0x4d4149);
      _0x5cb5c2.querySelectorAll(".media-clip-segment").forEach(_0x5444f9 => {
        const _0x59c44f = this._segmentClipIndex(_0x5444f9, _0x4b1c18, _0xc64e2b);
        const _0x174ebd = _0xc64e2b[_0x59c44f];
        if (!_0x174ebd) {
          return;
        }
        _0x5444f9.dataset.clipIndex = String(_0x59c44f);
        const _0x64cfae = normalizeText(_0x174ebd.id);
        if (_0x64cfae) {
          _0x5444f9.dataset.clipId = _0x64cfae;
        }
        const _0x7f971e = toNumber(_0x174ebd.timelineStartSec, 0);
        const _0x4c039b = Math.max(_0x7f971e, toNumber(_0x174ebd.timelineEndSec, _0x7f971e));
        this._applyAudioTimelineSegmentRect(_0x5444f9, getMediaClipTimelineRangeRect({
          startSec: _0x7f971e,
          endSec: _0x4c039b,
          durationSec: _0x4a8340
        }));
        this._updateTimelineSegmentLabel(_0x5444f9, Math.max(0, _0x4c039b - _0x7f971e));
        this._setAudioSegmentLaneVisual(_0x5444f9, this._audioClipLaneIndex(_0x174ebd));
        _0x5444f9.dataset.mutedClip = _0x174ebd.muted === true ? "true" : "false";
        _0x5444f9.dataset.disabledClip = _0x174ebd.disabled === true ? "true" : "false";
        _0x5444f9.classList?.toggle?.("is-muted", _0x174ebd.muted === true);
        _0x5444f9.classList?.toggle?.("is-disabled", _0x174ebd.disabled === true);
        this._syncAudioSegmentWaveformViewport(_0x5444f9, _0x174ebd);
      });
    } else {
      const _0x81cda0 = _0x5cb5c2.querySelector(".media-clip-segment");
      if (_0x81cda0) {
        const _0x2dba15 = toNumber(_0x2f2c54.startSec, 0);
        const _0x540118 = Math.max(_0x2dba15, toNumber(_0x2f2c54.endSec, _0x2dba15));
        if (_0x4b1c18 === "audio") {
          this._applyAudioTimelineSegmentRect(_0x81cda0, getMediaClipTimelineRangeRect({
            startSec: _0x2dba15,
            endSec: _0x540118,
            durationSec: _0x4a8340
          }));
        } else {
          this._applyTimelineSegmentRect(_0x81cda0, getMediaClipTimelineRangeRect({
            startSec: _0x2dba15,
            endSec: _0x540118,
            durationSec: _0x4a8340
          }));
        }
        this._updateTimelineSegmentLabel(_0x81cda0, Math.max(0, _0x540118 - _0x2dba15));
        if (_0x4b1c18 === "audio") {
          this._syncAudioSegmentWaveformViewport(_0x81cda0, _0x2f2c54);
        }
      }
    }
    this._syncTrackActiveClipChrome(_0x5cb5c2, _0x4b1c18);
    this._updateTrackPlayheadVisual(_0x5cb5c2, _0x4a8340);
  }
  _primaryDuration(_0x8db263 = {}) {
    const _0x389e8a = this._mediaClip.tracks?.video;
    const _0x4525b8 = this._mediaClip.tracks?.audio;
    return (_0x389e8a ? this._videoTimelineDuration(_0x389e8a, null, _0x8db263) : 0) || this._audioTimelineDuration(_0x4525b8, null, _0x8db263) || 10;
  }
  _refreshMediaClipTimelineInPlace() {
    if (this._mediaClip.expanded !== true || !this._mediaClip.tracks?.video && !this._mediaClip.tracks?.audio) {
      this._render();
      return;
    }
    this._rerenderCompactOnly();
    const _0x1be209 = this._getPlaybackKind();
    if (_0x1be209 === "video") {
      this._syncVideoPreviewSourceForTimelineSec(this._playheadSec);
      this._syncPreviewTime("video", this._videoSourceSecForPlayhead(this._playheadSec), {
        immediate: true
      });
    } else if (_0x1be209 === "audio") {
      this._setActiveAudioClipIndex(this._audioClipIndexAtTimelineSec(this._playheadSec));
      this._syncAudioPreviewSourceForTimelineSec(this._playheadSec);
      this._syncPreviewTime("audio", this._audioSourceSecForPlayhead(this._playheadSec), {
        immediate: true
      });
    }
    this._updatePreviewControls();
  }
  _edgeIdForMaterial(_0x452c23 = "video", _0x324ee3 = 0) {
    if (_0x452c23 === "audio") {
      const _0x942641 = this._audioTimelineClips(this._mediaClip.tracks?.audio)[_0x324ee3];
      const _0x27c5cf = this._audioClipSource(_0x942641, _0x324ee3);
      return normalizeText(_0x27c5cf?.__mediaClipEdgeId);
    }
    const _0x2c7ebb = this._videoTimelineClips(this._mediaClip.tracks?.video)[_0x324ee3];
    const _0x57c512 = this._videoClipSource(_0x2c7ebb, _0x324ee3);
    return normalizeText(_0x57c512?.__mediaClipEdgeId);
  }
  _deleteActiveMaterial() {
    const _0x2ddf20 = this._mediaClip.activeTrack === "audio" ? "audio" : "video";
    const _0x3b19f4 = _0x2ddf20 === "video" ? this._clampSelectedClipIndex(this._selectedClipIndex) >= 0 ? this._clampSelectedClipIndex(this._selectedClipIndex) : this._clampVideoClipIndex(this._activeClipIndex) : this._clampSelectedAudioClipIndex(this._selectedAudioClipIndex) >= 0 ? this._clampSelectedAudioClipIndex(this._selectedAudioClipIndex) : this._clampAudioClipIndex(this._activeAudioClipIndex);
    this._deleteMaterial(_0x2ddf20, _0x3b19f4);
  }
  _deleteMaterial(_0x48ada9 = "video", _0x3b1d5e = 0) {
    if (this._timelineDrag()) {
      return;
    }
    const _0x163dbc = _0x48ada9 === "audio" ? "audio" : "video";
    const _0x217e3a = this._mediaClip.activeTrack;
    this._pausePreviewPlayback({
      updateControls: false
    });
    this._materialMenu = null;
    let _0xdb0e = this._mediaClip;
    let _0x278fa5 = "";
    if (_0x163dbc === "audio") {
      if (!this._mediaClip.tracks?.audio) {
        return;
      }
      const _0x53f5cd = this._audioTimelineClips(this._mediaClip.tracks?.audio);
      const _0x1e1600 = Math.max(0, Math.min(_0x53f5cd.length - 1, Math.trunc(toNumber(_0x3b1d5e, 0))));
      const _0x3a90a6 = _0x53f5cd[_0x1e1600];
      if (!_0x3a90a6) {
        return;
      }
      const _0x2a2061 = this._audioClipSource(_0x3a90a6, _0x1e1600);
      const _0x1f4a12 = normalizeText(_0x3a90a6.sourceId || _0x2a2061?.id);
      const _0x5d6183 = normalizeText(_0x3a90a6.sourceKey || resolveMediaClipLocalPath(_0x2a2061));
      _0x278fa5 = this._edgeIdForMaterial("audio", _0x1e1600);
      _0xdb0e = removeMediaClipAudioClip(this._mediaClip, _0x1e1600);
      const _0x465a25 = Array.isArray(_0xdb0e.audioClips) ? _0xdb0e.audioClips : [];
      const _0x4884d8 = _0x465a25.some(_0x46fe12 => {
        const _0xec0474 = normalizeText(_0x46fe12?.sourceId);
        const _0x1a90dd = normalizeText(_0x46fe12?.sourceKey);
        return _0x1f4a12 && _0xec0474 === _0x1f4a12 || _0x5d6183 && _0x1a90dd === _0x5d6183;
      });
      if (_0x4884d8) {
        _0x278fa5 = "";
      }
      this._activeAudioClipIndex = _0x465a25.length ? Math.max(0, Math.min(_0x465a25.length - 1, _0x1e1600)) : 0;
      this._selectedAudioClipIndex = _0x465a25.length ? this._activeAudioClipIndex : -1;
      _0xdb0e = {
        ..._0xdb0e,
        activeTrack: _0xdb0e.tracks?.video ? "video" : _0xdb0e.tracks?.audio ? "audio" : "video",
        expanded: (!!_0xdb0e.tracks?.video || !!_0xdb0e.tracks?.audio) && this._mediaClip.expanded === true
      };
    } else {
      const _0x5f4212 = this._videoTimelineClips(this._mediaClip.tracks?.video);
      const _0x3caf7b = Math.max(0, Math.min(_0x5f4212.length - 1, Math.trunc(toNumber(_0x3b1d5e, 0))));
      const _0x2374b9 = _0x5f4212[_0x3caf7b];
      if (!_0x2374b9) {
        return;
      }
      const _0xb14dcf = this._videoClipSource(_0x2374b9, _0x3caf7b);
      const _0x257077 = normalizeText(_0x2374b9.sourceId || _0xb14dcf?.id);
      const _0x54a2e5 = normalizeText(_0x2374b9.sourceKey || resolveMediaClipLocalPath(_0xb14dcf));
      _0x278fa5 = this._edgeIdForMaterial("video", _0x3caf7b);
      _0xdb0e = removeMediaClipClip(this._mediaClip, _0x3caf7b);
      const _0x367b7f = Array.isArray(_0xdb0e.clips) ? _0xdb0e.clips : [];
      const _0x127389 = _0x367b7f.some(_0x2ac54b => {
        const _0x1c582a = normalizeText(_0x2ac54b?.sourceId);
        const _0x1ee707 = normalizeText(_0x2ac54b?.sourceKey);
        return _0x257077 && _0x1c582a === _0x257077 || _0x54a2e5 && _0x1ee707 === _0x54a2e5;
      });
      if (_0x127389) {
        _0x278fa5 = "";
      }
      this._activeClipIndex = _0x367b7f.length ? Math.max(0, Math.min(_0x367b7f.length - 1, _0x3caf7b)) : 0;
      this._selectedClipIndex = _0x367b7f.length ? this._activeClipIndex : -1;
      _0xdb0e = {
        ..._0xdb0e,
        activeTrack: _0xdb0e.tracks?.video ? "video" : _0xdb0e.tracks?.audio ? "audio" : "video",
        expanded: (!!_0xdb0e.tracks?.video || !!_0xdb0e.tracks?.audio) && this._mediaClip.expanded === true
      };
    }
    const _0xc1f1b4 = _0xdb0e.expanded !== true || _0x217e3a !== _0xdb0e.activeTrack;
    this._setMediaClipWithLayout(_0xdb0e, false, {
      render: false
    });
    if (_0x278fa5 && typeof a409_0x2af79e.removeEdge === "function") {
      this._skipNextIncomingMediaClipRender = true;
      a409_0x2af79e.removeEdge(_0x278fa5);
      if (this._skipNextIncomingMediaClipRender === true) {
        this._skipNextIncomingMediaClipRender = false;
      }
    }
    commit();
    if (_0xc1f1b4) {
      this._render();
    } else {
      this._refreshMediaClipTimelineInPlace();
    }
  }
  _singleVisualClipExportTrack(_0x4a7c40 = {}) {
    return a409_0xf3728c(_0x4a7c40);
  }
  _exportVisualClips(_0x2aec8c = this._mediaClip.tracks?.video) {
    return a409_0x4eb073(this, _0x2aec8c);
  }
  _firstExportVideoSource(_0x242069 = []) {
    return a409_0x11c7dd(this, _0x242069);
  }
  _exportVisualDurationSec(_0x501f4d = []) {
    return a409_0x29f2e7(_0x501f4d);
  }
  _exportAudioClips(_0x1a1724 = this._mediaClip.tracks?.audio) {
    return a409_0x5c85cb(this, _0x1a1724);
  }
  _exportLoadingTargetElement() {
    return a409_0x2780cc(this);
  }
  _startExportLoading(_0x420c38 = mediaClipText("export.loading")) {
    return a409_0x1a3b8d(this, _0x420c38);
  }
  _stopExportLoading() {
    return a409_0xdf5c76(this);
  }
  _waitForExportLoadingFrame() {
    return a409_0x547399();
  }
  async _exportMaterialToCanvas(_0x827acb = "video", _0x3b78f1 = 0) {
    return a409_0xf11d73(this, _0x827acb, _0x3b78f1);
  }
  _renderDownloadMenu() {
    return a409_0x4da2ba(this);
  }
  async _exportAndUse(_0x1cb8db) {
    return a409_0x3432cc(this, _0x1cb8db);
  }
  _resolveOutputNodePosition(_0x298a52, _0x30294e) {
    return a409_0x4800dc(this, _0x298a52, _0x30294e);
  }
  _addImageOutputNodeFromSource(_0x234e28 = {}, _0x246c71 = {}) {
    return a409_0x5df673(this, _0x234e28, _0x246c71);
  }
  _addOutputNode(_0x46dc0e, _0x2febbf = {}, _0x198ae3 = {}) {
    return a409_0x4050d3(this, _0x46dc0e, _0x2febbf, _0x198ae3);
  }
}