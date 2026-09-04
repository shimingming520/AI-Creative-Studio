import { deleteAssetFromServer, deleteOutputFilesFromServer, fetchAssetsFromServer, fetchOutputFilesFromServer, saveAssetToServer, saveOutputVideoThumbnailToServer } from "../../api/projectsV2Api.js";
import { ensureVideoResultThumbnail } from "../../api/videoResultThumbnailApi.js";
import a969_0xe55b37 from "../core/stores/appStore.js";
import { findAvailablePosition, generateId, screenToWorld } from "../core/math.js";
import { getNodeDefaultSize } from "../services/fileService.js";
import { GENERATION_HISTORY_EVENT, GENERATION_HISTORY_MEDIA_KINDS, buildGenerationHistoryAssetsFromNode, isGenerationHistoryAsset } from "./generationHistoryAssets.js";
import { normalizeFileManagerSourceNodeForCanvas } from "./generationHistoryFileManagerSizing.js";
import { applyGenerationHistoryVideoThumbnail, createVideoThumbnailRequestQueue, resolveGenerationHistoryVideoPresentation } from "./generationHistoryVideoThumbnails.js";
import { buildFileManagerHistoryEntryKey, dedupeFileManagerHistoryRecords, getFileManagerMenuActions, getFileManagerSelectionAfterClick, isFileManagerBackfillDuplicate, isFileManagerHistoryRecordVisible, isActionableFileManagerMediaKind, resolveFileManagerBackfillStartedAt } from "./generationHistoryFileManagerSelection.js";
import { registerSidebarSubmenu } from "./sidebarSubmenuController.js";
import { showContextMenu } from "./interaction/contextMenuPresenter.js";
import { openImagePreview, openVideoPreview } from "./imagePreview.js";
import { canShowItemInFolder, showItemInFolder } from "../services/nativeFileActionService.js";
import { localPathToUrl, normalizeLocalPath } from "../utils/localMediaPath.js";
import { attachMediaElementPlaybackSource, clearDesktopMediaPlaybackSourceMetadata } from "../services/desktopMediaBlobSource.js";
import { onLocaleChange, t } from "../i18n/index.js";
const FILE_FILTERS = Object.freeze([{
  key: "all",
  labelKey: "filters.all"
}, {
  key: "image",
  labelKey: "filters.image"
}, {
  key: "video",
  labelKey: "filters.video"
}, {
  key: "audio",
  labelKey: "filters.audio"
}]);
const FILE_SOURCES = Object.freeze([{
  key: "current-canvas",
  labelKey: "sources.currentCanvas"
}, {
  key: "history",
  labelKey: "sources.history"
}, {
  key: "output",
  labelKey: "sources.output"
}]);
const FILE_MANAGER_SIDEBAR_KEY = "files";
const FILE_MANAGER_KEEP_OPEN_SELECTOR = "[data-sidebar-submenu-owner=\"" + FILE_MANAGER_SIDEBAR_KEY + "\"], #file-manager-delete-confirm-overlay";
const FILE_PANEL_RESIZE = Object.freeze({
  minWidth: 560,
  defaultWidth: 760,
  maxViewportGap: 24
});
const FILE_MASONRY = Object.freeze({
  gap: 16,
  placementStep: 8,
  fixedShortSide: 150,
  defaultShortSide: 260,
  maxLongSide: 560
});
const FILE_HISTORY_PAGE_SIZE = 80;
const FILE_OUTPUT_PAGE_SIZE = 80;
const FILE_HISTORY_SCROLL_PREFETCH_PX = 360;
function fileManagerText(_0xdc1f59, _0x5b4d85 = {}) {
  return t("generationHistoryFileManager." + _0xdc1f59, _0x5b4d85);
}
function isHistorySource(_0x28bd33) {
  const _0x11d9a8 = String(_0x28bd33 || "").trim();
  return _0x11d9a8 === "current-canvas" || _0x11d9a8 === "history";
}
function normalizeProjectId(_0x359d25) {
  return String(_0x359d25 || "").trim() || "default_v2_project";
}
function resolveThumbSrc(_0x20266a) {
  if (!resolveMediaSrc(_0x20266a)) {
    return "";
  }
  const _0xbc1aac = Array.isArray(_0x20266a?.items) ? _0x20266a.items[0] : null;
  const _0x127e09 = Array.isArray(_0x20266a?.nodes) ? _0x20266a.nodes[0] : null;
  return String(_0x20266a?.coverUrl || _0xbc1aac?.thumbSrc || _0x127e09?.thumbUrl || _0x127e09?.videoThumbSrc || _0x127e09?.imageUrl || _0x127e09?.videoUrl || _0x127e09?.src || "").trim();
}
function resolveMediaSrc(_0x317dd3) {
  const _0x4d6ef6 = Array.isArray(_0x317dd3?.nodes) ? _0x317dd3.nodes[0] : null;
  return String(_0x4d6ef6?.imageUrl || _0x4d6ef6?.sourceUrl || _0x4d6ef6?.videoUrl || _0x4d6ef6?.audioUrl || _0x4d6ef6?.src || "").trim();
}
function getRecordMediaKind(_0x337872) {
  const _0x3b3c2c = String(_0x337872?.mediaKind || "").trim().toLowerCase();
  if (_0x3b3c2c === "image" || _0x3b3c2c === "video" || _0x3b3c2c === "audio" || _0x3b3c2c === "folder" || _0x3b3c2c === "file") {
    return _0x3b3c2c;
  }
  const _0x1d716c = String(_0x337872?.coverType || "").trim().toLowerCase();
  if (_0x1d716c === "image" || _0x1d716c === "video" || _0x1d716c === "audio" || _0x1d716c === "folder" || _0x1d716c === "file") {
    return _0x1d716c;
  }
  const _0x8f7bcc = Array.isArray(_0x337872?.nodes) ? _0x337872.nodes[0] : null;
  const _0x586e3b = String(_0x8f7bcc?.type || "").trim().toLowerCase();
  if (_0x586e3b.includes("video")) {
    return "video";
  }
  if (_0x586e3b.includes("audio")) {
    return "audio";
  }
  return "image";
}
function getMediaLabel(_0x172fba) {
  if (_0x172fba === "video") {
    return fileManagerText("mediaKinds.video");
  }
  if (_0x172fba === "audio") {
    return fileManagerText("mediaKinds.audio");
  }
  if (_0x172fba === "folder") {
    return fileManagerText("mediaKinds.folder");
  }
  if (_0x172fba === "file") {
    return fileManagerText("mediaKinds.file");
  }
  return fileManagerText("mediaKinds.image");
}
function isSupportedOutputMediaKind(_0x25c2e2) {
  return isActionableFileManagerMediaKind(_0x25c2e2);
}
function isFileManagerActionableRecord(_0x4c7f3b) {
  const _0x358085 = getRecordMediaKind(_0x4c7f3b);
  if (!isSupportedOutputMediaKind(_0x358085)) {
    return false;
  }
  return Array.isArray(_0x4c7f3b?.nodes) && _0x4c7f3b.nodes.length > 0;
}
function resolveRecordLocalPath(_0x3096a3) {
  const _0x2ec11f = Array.isArray(_0x3096a3?.nodes) ? _0x3096a3.nodes[0] : null;
  return normalizeLocalPath(_0x3096a3?.localPath || _0x3096a3?.outputItem?.localPath || _0x2ec11f?.originalLocalPath || _0x2ec11f?.localPath || _0x2ec11f?.displayLocalPath || _0x2ec11f?.thumbLocalPath || _0x2ec11f?.src || _0x2ec11f?.imageUrl || _0x2ec11f?.videoUrl || _0x2ec11f?.audioUrl);
}
function buildHistoryRecordIdentityKey(_0x7688b9) {
  return buildFileManagerHistoryEntryKey({
    projectId: normalizeProjectId(_0x7688b9?.projectId),
    canvasId: String(_0x7688b9?.canvasId || "").trim(),
    generationRunId: String(_0x7688b9?.generationRunId || "").trim(),
    mediaKind: getRecordMediaKind(_0x7688b9),
    sourceIndex: _0x7688b9?.sourceIndex,
    localPath: resolveRecordLocalPath(_0x7688b9),
    resultFingerprint: _0x7688b9?.resultFingerprint
  });
}
function dedupeHistoryRecords(_0x152c54) {
  return dedupeFileManagerHistoryRecords(_0x152c54, {
    getMediaKind: getRecordMediaKind,
    getLocalPath: resolveRecordLocalPath
  });
}
function getOutputRecordIdForItem(_0x26f1d2) {
  if (_0x26f1d2?.isDir) {
    return "folder:" + String(_0x26f1d2?.relPath || "");
  }
  if (isSupportedOutputMediaKind(String(_0x26f1d2?.mediaKind || "").trim().toLowerCase())) {
    return "output:" + String(_0x26f1d2?.relPath || _0x26f1d2?.localPath || "");
  }
  return "file:" + String(_0x26f1d2?.relPath || _0x26f1d2?.name || "");
}
function outputFileToRecord(_0x3dc509) {
  const _0x1f613c = String(_0x3dc509?.mediaKind || "").trim().toLowerCase();
  if (!isSupportedOutputMediaKind(_0x1f613c)) {
    return null;
  }
  const _0x121311 = normalizeLocalPath(_0x3dc509?.localPath || _0x3dc509?.url);
  const _0x4e40c3 = String(_0x3dc509?.url || localPathToUrl(_0x121311)).trim();
  if (!_0x4e40c3) {
    return null;
  }
  const _0xec6696 = normalizeLocalPath(_0x3dc509?.displayLocalPath);
  const _0x32ffae = normalizeLocalPath(_0x3dc509?.thumbLocalPath);
  const _0x2a4ae = localPathToUrl(_0xec6696);
  const _0x29fab7 = localPathToUrl(_0x32ffae);
  const _0x56841d = String(_0x3dc509?.name || "").trim() || _0x121311.split(/[\\/]/).pop() || fileManagerText("fallback.outputFile");
  const _0x227ae7 = _0x1f613c === "video" ? "source-video" : _0x1f613c === "audio" ? "source-audio" : "source-image";
  const _0x57d796 = Number(_0x3dc509?.videoWidth || _0x3dc509?.originalWidth || _0x3dc509?.width || 0) || 0;
  const _0x18198a = Number(_0x3dc509?.videoHeight || _0x3dc509?.originalHeight || _0x3dc509?.height || 0) || 0;
  const _0x48cc38 = {
    id: _0x227ae7 + "-output-" + String(_0x3dc509?.relPath || _0x121311).replace(/[^\w-]+/g, "_"),
    type: _0x227ae7,
    name: _0x56841d,
    x: 0,
    y: 0,
    ...getNodeDefaultSize(_0x227ae7),
    src: _0x4e40c3,
    localPath: _0x121311,
    displayLocalPath: _0xec6696,
    thumbLocalPath: _0x32ffae,
    fileName: _0x56841d,
    needsAutoResize: _0x1f613c !== "audio"
  };
  if (_0x1f613c === "image") {
    _0x48cc38.imageUrl = _0x4e40c3;
    _0x48cc38.sourceUrl = _0x4e40c3;
    _0x48cc38.thumbUrl = _0x29fab7;
    if (_0x57d796 > 0) {
      _0x48cc38.originalWidth = _0x57d796;
      _0x48cc38.imageWidth = _0x57d796;
    }
    if (_0x18198a > 0) {
      _0x48cc38.originalHeight = _0x18198a;
      _0x48cc38.imageHeight = _0x18198a;
    }
  } else if (_0x1f613c === "video") {
    _0x48cc38.videoUrl = _0x4e40c3;
    _0x48cc38.posterUrl = _0x29fab7;
    _0x48cc38.thumbUrl = _0x29fab7;
    _0x48cc38.posterLocalPath = _0x32ffae;
    _0x48cc38.videoThumbSrc = _0x4e40c3;
    if (_0x57d796 > 0) {
      _0x48cc38.videoWidth = _0x57d796;
    }
    if (_0x18198a > 0) {
      _0x48cc38.videoHeight = _0x18198a;
    }
    if (Number(_0x3dc509?.duration || 0) > 0) {
      _0x48cc38.duration = Number(_0x3dc509.duration);
    }
  } else if (_0x1f613c === "audio") {
    _0x48cc38.audioUrl = _0x4e40c3;
  }
  return {
    id: "output:" + String(_0x3dc509?.relPath || _0x121311),
    mediaKind: _0x1f613c,
    coverType: _0x1f613c,
    coverUrl: _0x1f613c === "audio" ? "" : _0x1f613c === "video" ? _0x29fab7 : _0x29fab7 || _0x2a4ae || _0x4e40c3,
    name: _0x56841d,
    localPath: _0x121311,
    updatedAt: Number(_0x3dc509?.mtime || 0) || 0,
    nodes: [_0x48cc38]
  };
}
function outputFileToDisplayRecord(_0x37c8e8) {
  if (_0x37c8e8?.isDir) {
    return {
      id: "folder:" + String(_0x37c8e8?.relPath || _0x37c8e8?.name || ""),
      mediaKind: "folder",
      coverType: "folder",
      name: String(_0x37c8e8?.name || fileManagerText("fallback.folder")),
      updatedAt: Number(_0x37c8e8?.mtime || 0) || 0,
      outputItem: _0x37c8e8,
      nodes: []
    };
  }
  const _0x231a8a = outputFileToRecord(_0x37c8e8);
  if (_0x231a8a) {
    return {
      ..._0x231a8a,
      outputItem: _0x37c8e8
    };
  }
  return {
    id: "file:" + String(_0x37c8e8?.relPath || _0x37c8e8?.name || ""),
    mediaKind: "file",
    coverType: "file",
    name: String(_0x37c8e8?.name || fileManagerText("fallback.file")),
    updatedAt: Number(_0x37c8e8?.mtime || 0) || 0,
    outputItem: _0x37c8e8,
    nodes: []
  };
}
function resolveRecordSize(_0x397140, _0x272cff) {
  const _0x120b69 = Array.isArray(_0x397140?.nodes) ? _0x397140.nodes[0] : null;
  const _0x577557 = Array.isArray(_0x397140?.items) ? _0x397140.items[0] : null;
  const _0x3f1d8c = _0x577557?.nodeData || {};
  const _0x162455 = Number(_0x120b69?.videoWidth || _0x120b69?.imageWidth || _0x120b69?.originalWidth || _0x120b69?.width || _0x3f1d8c.width || 0) || 0;
  const _0x465f89 = Number(_0x120b69?.videoHeight || _0x120b69?.imageHeight || _0x120b69?.originalHeight || _0x120b69?.height || _0x3f1d8c.height || 0) || 0;
  if (_0x162455 > 0 && _0x465f89 > 0) {
    return {
      width: _0x162455,
      height: _0x465f89
    };
  }
  if (_0x272cff === GENERATION_HISTORY_MEDIA_KINDS.VIDEO) {
    return {
      width: Math.round(FILE_MASONRY.defaultShortSide * 16 / 9),
      height: FILE_MASONRY.defaultShortSide
    };
  }
  if (_0x272cff === GENERATION_HISTORY_MEDIA_KINDS.AUDIO) {
    return {
      width: 320,
      height: 140
    };
  }
  if (_0x272cff === "folder") {
    return {
      width: 150,
      height: 118
    };
  }
  if (_0x272cff === "file") {
    return {
      width: 150,
      height: 132
    };
  }
  return {
    width: FILE_MASONRY.defaultShortSide,
    height: FILE_MASONRY.defaultShortSide
  };
}
function resolveRecordAspect(_0x4e41ee, _0x166404) {
  const {
    width: _0x4ae04c,
    height: _0xd3ec0e
  } = resolveRecordSize(_0x4e41ee, _0x166404);
  return _0x4ae04c + " / " + _0xd3ec0e;
}
class GenerationHistoryFileManager {
  constructor() {
    this.panel = null;
    this.titleEl = null;
    this.contentEl = null;
    this.records = [];
    this._loading = false;
    this._savingIds = new Set();
    this._savingRecordKeys = new Set();
    this._backfillInFlight = false;
    this._activeFilter = "all";
    this._activeSource = "current-canvas";
    this._sortOrder = "desc";
    this.outputItems = [];
    this._outputDir = "";
    this._outputParent = "";
    this._outputBreadcrumbs = [{
      name: "output",
      dir: ""
    }];
    this._outputLoading = false;
    this._outputLoaded = false;
    this._outputNextOffset = 0;
    this._outputHasMore = true;
    this._outputTotalItems = 0;
    this._outputLoadToken = 0;
    this._panelWidth = 0;
    this._resizeState = null;
    this._recordsLoaded = false;
    this._recordsDirty = false;
    this._nextOffset = 0;
    this._hasMore = true;
    this._totalRecords = 0;
    this._loadToken = 0;
    this._selectedRecordIds = new Set();
    this._selectionDrag = null;
    this._suppressNextClick = false;
    this._unsubscribeLocale = null;
    this._videoThumbnailQueue = createVideoThumbnailRequestQueue({
      concurrency: 1
    });
    this._videoThumbnailObserver = null;
    this._videoThumbnailTargets = new WeakMap();
    this._videoThumbnailBackfills = new Map();
    this._mediaPreviewDisposers = new Set();
    this._initPanel();
    this._bindButton();
    this._bindLocaleChange();
    this._bindGenerationEvents();
  }
  _isOpen() {
    return this.panel?.classList.contains("show") === true;
  }
  _getCurrentProjectId() {
    return normalizeProjectId(window.currentProjectId);
  }
  _getCurrentCanvasId() {
    const _0x2eba19 = window.CanvasTabManager;
    return String(_0x2eba19?.getActiveCanvasId?.() || "").trim() || String(_0x2eba19?._activeId || "").trim() || "canvas_1";
  }
  _getCanvasCenterWorld() {
    const {
      viewport: _0x9a2bb0
    } = a969_0xe55b37.getState();
    const _0x2a4749 = window.innerWidth / 2;
    const _0x1129c5 = window.innerHeight / 2;
    const _0x302770 = document.documentElement?.clientWidth || window.innerWidth || 0;
    const _0x71206b = document.documentElement?.clientHeight || window.innerHeight || 0;
    if (!_0x302770 || !_0x71206b) {
      return screenToWorld(_0x2a4749, _0x1129c5, _0x9a2bb0);
    }
    let _0xfd9719 = 0;
    let _0x12221d = 0;
    let _0x5540c2 = _0x302770;
    let _0x47ce1b = _0x71206b;
    const _0x189874 = [];
    const _0x5afca3 = document.querySelector("header");
    const _0x508f0e = document.querySelector(".sidebar-floating");
    if (_0x5afca3) {
      _0x189874.push(_0x5afca3);
    }
    if (_0x508f0e) {
      _0x189874.push(_0x508f0e);
    }
    if (this.panel?.classList.contains("show")) {
      _0x189874.push(this.panel);
    }
    const _0x1a3eb1 = 8;
    for (const _0x21d894 of _0x189874) {
      if (!_0x21d894?.isConnected) {
        continue;
      }
      const _0x379268 = _0x21d894.getBoundingClientRect();
      const _0xa881f3 = Math.max(_0xfd9719, _0x379268.left);
      const _0x477ad9 = Math.max(_0x12221d, _0x379268.top);
      const _0x318129 = Math.min(_0x5540c2, _0x379268.right);
      const _0x246a9f = Math.min(_0x47ce1b, _0x379268.bottom);
      if (_0x318129 <= _0xa881f3 || _0x246a9f <= _0x477ad9) {
        continue;
      }
      if (_0x379268.left <= _0xfd9719 + _0x1a3eb1 && _0x379268.right > _0xfd9719 + _0x1a3eb1) {
        _0xfd9719 = Math.max(_0xfd9719, _0x379268.right);
        continue;
      }
      if (_0x379268.right >= _0x5540c2 - _0x1a3eb1 && _0x379268.left < _0x5540c2 - _0x1a3eb1) {
        _0x5540c2 = Math.min(_0x5540c2, _0x379268.left);
        continue;
      }
      if (_0x379268.top <= _0x12221d + _0x1a3eb1 && _0x379268.bottom > _0x12221d + _0x1a3eb1) {
        _0x12221d = Math.max(_0x12221d, _0x379268.bottom);
        continue;
      }
      if (_0x379268.bottom >= _0x47ce1b - _0x1a3eb1 && _0x379268.top < _0x47ce1b - _0x1a3eb1) {
        _0x47ce1b = Math.min(_0x47ce1b, _0x379268.top);
      }
    }
    const _0x8930b6 = _0x5540c2 - _0xfd9719;
    const _0x114c0a = _0x47ce1b - _0x12221d;
    const _0x39349d = _0x8930b6 > 40 ? _0xfd9719 + _0x8930b6 / 2 : _0x2a4749;
    const _0x2b3476 = _0x114c0a > 40 ? _0x12221d + _0x114c0a / 2 : _0x1129c5;
    return screenToWorld(_0x39349d, _0x2b3476, _0x9a2bb0);
  }
  _hasRecord(_0x2769e2) {
    const _0xd03bb7 = buildHistoryRecordIdentityKey(_0x2769e2);
    if (!_0xd03bb7) {
      return false;
    }
    return this.records.some(_0x2e11ca => buildHistoryRecordIdentityKey(_0x2e11ca) === _0xd03bb7);
  }
  _visibleRecords() {
    if (this._activeSource === "output") {
      return this._visibleOutputRecords();
    }
    const _0x2453ad = this._getCurrentProjectId();
    const _0x26e416 = this._getCurrentCanvasId();
    const _0x33c7cd = this._sortOrder === "asc" ? dedupeHistoryRecords(this.records).reverse() : dedupeHistoryRecords(this.records);
    return _0x33c7cd.filter(_0x23cc8e => isFileManagerHistoryRecordVisible({
      record: _0x23cc8e,
      source: this._activeSource,
      projectId: _0x2453ad,
      canvasId: _0x26e416,
      activeFilter: this._activeFilter,
      getMediaKind: getRecordMediaKind
    }));
  }
  _visibleOutputRecords() {
    const _0xf732b6 = (Array.isArray(this.outputItems) ? this.outputItems : []).map(outputFileToDisplayRecord).filter(Boolean).filter(_0x3c388d => {
      const _0x10dba3 = getRecordMediaKind(_0x3c388d);
      if (_0x3c388d?.outputItem?.isDir) {
        return true;
      }
      if (this._activeFilter === "all") {
        return _0x10dba3 !== "file";
      }
      return _0x10dba3 === this._activeFilter;
    });
    _0xf732b6.sort((_0x5b270d, _0x4d568c) => {
      const _0x19100b = _0x5b270d?.outputItem?.isDir ? 0 : 1;
      const _0x2b5ee9 = _0x4d568c?.outputItem?.isDir ? 0 : 1;
      if (_0x19100b !== _0x2b5ee9) {
        return _0x19100b - _0x2b5ee9;
      }
      const _0x1f572b = Number(_0x5b270d?.updatedAt || 0);
      const _0x12de5a = Number(_0x4d568c?.updatedAt || 0);
      const _0x2da267 = this._sortOrder === "asc" ? _0x1f572b - _0x12de5a : _0x12de5a - _0x1f572b;
      if (_0x2da267 !== 0) {
        return _0x2da267;
      }
      return String(_0x5b270d?.name || "").localeCompare(String(_0x4d568c?.name || ""), "zh-CN");
    });
    return _0xf732b6;
  }
  _findVisibleRecordById(_0x3778c7) {
    const _0x3e551e = String(_0x3778c7 || "");
    if (!_0x3e551e) {
      return null;
    }
    return this._visibleRecords().find(_0x1fe199 => String(_0x1fe199?.id || "") === _0x3e551e) || null;
  }
  _findOutputItemByRecordId(_0x3c8e64) {
    const _0x1bc33f = String(_0x3c8e64 || "");
    if (!_0x1bc33f) {
      return null;
    }
    return (Array.isArray(this.outputItems) ? this.outputItems : []).find(_0x5f2352 => getOutputRecordIdForItem(_0x5f2352) === _0x1bc33f) || null;
  }
  _clearSelection() {
    if (this._selectedRecordIds.size === 0) {
      return;
    }
    this._selectedRecordIds.clear();
    this._syncSelectionClasses();
  }
  _selectRecord(_0x5c58d9, {
    shiftKey = false
  } = {}) {
    const _0x313feb = this._findVisibleRecordById(_0x5c58d9);
    const _0x14d1ca = getFileManagerSelectionAfterClick({
      current: Array.from(this._selectedRecordIds),
      recordId: _0x5c58d9,
      shiftKey: shiftKey,
      actionable: isFileManagerActionableRecord(_0x313feb)
    });
    this._selectedRecordIds = new Set(_0x14d1ca);
    this._syncSelectionClasses();
  }
  _setSelection(_0x46602e) {
    const _0x15ee89 = (Array.isArray(_0x46602e) ? _0x46602e : []).filter(_0x47d055 => isFileManagerActionableRecord(this._findVisibleRecordById(_0x47d055)));
    this._selectedRecordIds = new Set(_0x15ee89);
    this._syncSelectionClasses();
  }
  _syncSelectionClasses() {
    if (!this.contentEl) {
      return;
    }
    this.contentEl.querySelectorAll(".v2-file-history-card").forEach(_0x14501a => {
      _0x14501a.classList.toggle("is-selected", this._selectedRecordIds.has(String(_0x14501a.dataset.recordId || "")));
    });
  }
  _pruneSelectionToVisibleRecords() {
    if (this._selectedRecordIds.size === 0) {
      return;
    }
    const _0x6a9906 = new Set(this._visibleRecords().filter(isFileManagerActionableRecord).map(_0x17b6b5 => String(_0x17b6b5?.id || "")));
    let _0x1e8f7e = false;
    for (const _0x14b7d5 of Array.from(this._selectedRecordIds)) {
      if (!_0x6a9906.has(_0x14b7d5)) {
        this._selectedRecordIds.delete(_0x14b7d5);
        _0x1e8f7e = true;
      }
    }
    if (_0x1e8f7e) {
      this._syncSelectionClasses();
    }
  }
  _initPanel() {
    this.panel = document.createElement("div");
    this.panel.className = "v2-file-history-panel canvas-toolbar-panel-surface";
    this.panel.innerHTML = "\n      <div class=\"v2-file-history-header\">\n        <div class=\"v2-file-history-title\"></div>\n        <div class=\"v2-file-history-source-tabs\" role=\"tablist\"></div>\n        <div class=\"v2-file-history-subtitle\"></div>\n        <div class=\"v2-file-history-toolbar\">\n        <div class=\"v2-file-history-filters\" role=\"tablist\"></div>\n          <div class=\"v2-file-history-order\" role=\"tablist\"></div>\n        </div>\n        <div class=\"v2-file-history-breadcrumbs\"></div>\n      </div>\n      <div class=\"v2-file-history-content\"></div>\n      <div class=\"v2-file-history-resize-handle\" aria-hidden=\"true\"></div>\n    ";
    this.titleEl = this.panel.querySelector(".v2-file-history-title");
    this.contentEl = this.panel.querySelector(".v2-file-history-content");
    this.sourceTabsEl = this.panel.querySelector(".v2-file-history-source-tabs");
    this.subtitleEl = this.panel.querySelector(".v2-file-history-subtitle");
    this.filterEl = this.panel.querySelector(".v2-file-history-filters");
    this.orderEl = this.panel.querySelector(".v2-file-history-order");
    this.breadcrumbsEl = this.panel.querySelector(".v2-file-history-breadcrumbs");
    this.resizeHandleEl = this.panel.querySelector(".v2-file-history-resize-handle");
    this._syncPanelStaticTexts();
    this._bindContentWheelGuard();
    this._bindContentPaging();
    this._bindMarqueeSelection();
    this._bindContextMenu();
    this._bindDoubleClickToCanvas();
    this.panel.addEventListener("click", _0x2957f5 => {
      if (this._suppressNextClick) {
        _0x2957f5.preventDefault();
        _0x2957f5.stopPropagation();
        this._suppressNextClick = false;
        return;
      }
      const _0x2e438f = _0x2957f5.target.closest("[data-file-action]");
      const _0x53511c = _0x2e438f?.dataset?.fileAction || "";
      if (_0x53511c === "filter") {
        _0x2957f5.preventDefault();
        _0x2957f5.stopPropagation();
        const _0x42e7ed = String(_0x2e438f.dataset.filter || "all").trim();
        if (FILE_FILTERS.some(_0x4a5865 => _0x4a5865.key === _0x42e7ed) && _0x42e7ed !== this._activeFilter) {
          this._activeFilter = _0x42e7ed;
          this._clearSelection();
          this.render();
          if (isHistorySource(this._activeSource)) {
            this._resetPageState();
            this.loadRecords({
              reset: true
            });
          }
        }
        return;
      }
      if (_0x53511c === "source") {
        _0x2957f5.preventDefault();
        _0x2957f5.stopPropagation();
        const _0x51bcc5 = String(_0x2e438f.dataset.source || "history").trim();
        if (FILE_SOURCES.some(_0x352ed8 => _0x352ed8.key === _0x51bcc5) && _0x51bcc5 !== this._activeSource) {
          this._activeSource = _0x51bcc5;
          this._clearSelection();
          this.render();
          if (isHistorySource(_0x51bcc5)) {
            this.loadRecords({
              backfillAfterLoad: true,
              reset: true
            });
          } else if (_0x51bcc5 === "output" && !this._outputLoaded) {
            this.loadOutputFiles({
              dir: this._outputDir,
              reset: true
            });
          }
        }
        return;
      }
      if (_0x53511c === "order") {
        _0x2957f5.preventDefault();
        _0x2957f5.stopPropagation();
        this._sortOrder = this._sortOrder === "asc" ? "desc" : "asc";
        this._clearSelection();
        this.render();
        if (isHistorySource(this._activeSource)) {
          this._resetPageState();
          this.loadRecords({
            reset: true
          });
        } else {
          this.loadOutputFiles({
            dir: this._outputDir,
            reset: true
          });
        }
        return;
      }
      if (_0x53511c === "output-dir") {
        _0x2957f5.preventDefault();
        _0x2957f5.stopPropagation();
        this._clearSelection();
        this.loadOutputFiles({
          dir: _0x2e438f.dataset.dir || "",
          reset: true
        });
        return;
      }
      const _0xf6d868 = _0x2957f5.target.closest(".v2-file-history-card");
      if (!_0xf6d868 || !_0xf6d868.dataset.recordId) {
        return;
      }
      if (this._activeSource === "output") {
        const _0x16992f = this._findOutputItemByRecordId(_0xf6d868.dataset.recordId);
        if (_0x16992f?.isDir) {
          this.loadOutputFiles({
            dir: _0x16992f.dir || _0x16992f.relPath || "",
            reset: true
          });
          return;
        }
      }
      this._selectRecord(_0xf6d868.dataset.recordId, {
        shiftKey: _0x2957f5.shiftKey
      });
    });
    const _0x1e61a3 = document.querySelector(".sidebar-floating") || document.body;
    _0x1e61a3.appendChild(this.panel);
    this._bindResizeHandle();
  }
  _bindContentWheelGuard() {
    if (!this.panel || !this.contentEl) {
      return;
    }
    this.panel.addEventListener("wheel", _0x3c5113 => {
      if (!this.panel?.classList.contains("show")) {
        return;
      }
      _0x3c5113.stopPropagation();
      _0x3c5113.stopImmediatePropagation?.();
    }, {
      passive: false,
      capture: true
    });
  }
  _bindContentPaging() {
    if (!this.contentEl) {
      return;
    }
    this.contentEl.addEventListener("scroll", () => {
      const _0x48740a = this.contentEl.scrollHeight - this.contentEl.scrollTop - this.contentEl.clientHeight;
      if (this._isOpen() && isHistorySource(this._activeSource) && !this._loading && this._hasMore && this._recordsLoaded && _0x48740a <= FILE_HISTORY_SCROLL_PREFETCH_PX) {
        this.loadRecords({
          reset: false
        });
        return;
      }
      if (this._isOpen() && this._activeSource === "output" && !this._outputLoading && this._outputHasMore && this._outputLoaded && _0x48740a <= FILE_HISTORY_SCROLL_PREFETCH_PX) {
        this.loadOutputFiles({
          dir: this._outputDir,
          reset: false
        });
      }
    }, {
      passive: true
    });
  }
  _bindMarqueeSelection() {
    if (!this.contentEl) {
      return;
    }
    this.contentEl.addEventListener("pointerdown", _0x337c1e => {
      if (_0x337c1e.button !== 0 || !this._isOpen()) {
        return;
      }
      if (_0x337c1e.target.closest("[data-file-action], .v2-file-history-resize-handle")) {
        return;
      }
      const _0x274894 = _0x337c1e.clientX;
      const _0x8bba00 = _0x337c1e.clientY;
      const _0x1a5d1b = {
        startX: _0x274894,
        startY: _0x8bba00,
        active: false,
        marqueeEl: null
      };
      this._selectionDrag = _0x1a5d1b;
      const _0x8b8e72 = _0x405b16 => {
        if (this._selectionDrag !== _0x1a5d1b) {
          return;
        }
        const _0x535804 = _0x405b16.clientX - _0x274894;
        const _0x55e0e8 = _0x405b16.clientY - _0x8bba00;
        if (!_0x1a5d1b.active && Math.hypot(_0x535804, _0x55e0e8) < 6) {
          return;
        }
        if (!_0x1a5d1b.active) {
          _0x1a5d1b.active = true;
          _0x1a5d1b.marqueeEl = document.createElement("div");
          _0x1a5d1b.marqueeEl.className = "v2-file-history-marquee";
          this.contentEl.appendChild(_0x1a5d1b.marqueeEl);
        }
        const _0x5ea1de = this.contentEl.getBoundingClientRect();
        const _0x12932b = Math.min(_0x274894, _0x405b16.clientX) - _0x5ea1de.left + this.contentEl.scrollLeft;
        const _0x2c15b9 = Math.min(_0x8bba00, _0x405b16.clientY) - _0x5ea1de.top + this.contentEl.scrollTop;
        const _0x304f87 = Math.abs(_0x405b16.clientX - _0x274894);
        const _0x117136 = Math.abs(_0x405b16.clientY - _0x8bba00);
        Object.assign(_0x1a5d1b.marqueeEl.style, {
          left: _0x12932b + "px",
          top: _0x2c15b9 + "px",
          width: _0x304f87 + "px",
          height: _0x117136 + "px"
        });
      };
      const _0x3954a8 = () => {
        window.removeEventListener("pointermove", _0x8b8e72, true);
        window.removeEventListener("pointerup", _0x3954a8, true);
        window.removeEventListener("pointercancel", _0x3954a8, true);
        if (this._selectionDrag !== _0x1a5d1b) {
          return;
        }
        this._selectionDrag = null;
        if (!_0x1a5d1b.active || !_0x1a5d1b.marqueeEl) {
          return;
        }
        const _0x2e81cf = _0x1a5d1b.marqueeEl.getBoundingClientRect();
        const _0xb3128a = Array.from(this.contentEl.querySelectorAll(".v2-file-history-card")).filter(_0x588558 => {
          const _0x4b66c5 = _0x588558.getBoundingClientRect();
          return !(_0x4b66c5.right < _0x2e81cf.left) && !(_0x4b66c5.left > _0x2e81cf.right) && !(_0x4b66c5.bottom < _0x2e81cf.top) && !(_0x4b66c5.top > _0x2e81cf.bottom);
        }).map(_0x11af7d => String(_0x11af7d.dataset.recordId || "")).filter(Boolean);
        _0x1a5d1b.marqueeEl.remove();
        this._suppressNextClick = true;
        this._setSelection(_0xb3128a);
      };
      window.addEventListener("pointermove", _0x8b8e72, true);
      window.addEventListener("pointerup", _0x3954a8, true);
      window.addEventListener("pointercancel", _0x3954a8, true);
    });
  }
  _bindContextMenu() {
    if (!this.panel) {
      return;
    }
    this.panel.addEventListener("contextmenu", _0x20b5ad => {
      const _0x5c47fb = _0x20b5ad.target.closest(".v2-file-history-card");
      if (!_0x5c47fb || !this.panel.contains(_0x5c47fb)) {
        return;
      }
      _0x20b5ad.preventDefault();
      _0x20b5ad.stopPropagation();
      const _0x5996d3 = String(_0x5c47fb.dataset.recordId || "");
      const _0x258212 = this._findVisibleRecordById(_0x5996d3);
      if (!isFileManagerActionableRecord(_0x258212)) {
        return;
      }
      if (!this._selectedRecordIds.has(_0x5996d3)) {
        this._setSelection([_0x5996d3]);
      }
      const _0x3fb781 = this._getSelectedRecords();
      const _0xd481b4 = this._buildContextMenuItems(_0x3fb781);
      if (_0xd481b4.length === 0) {
        return;
      }
      showContextMenu(_0x20b5ad.clientX, _0x20b5ad.clientY, _0xd481b4, {
        includeNodePicker: false,
        ownerElement: _0x5c47fb,
        ownerRoot: this.panel,
        sidebarSubmenuOwner: FILE_MANAGER_SIDEBAR_KEY
      });
    });
  }
  _bindDoubleClickToCanvas() {
    if (!this.panel) {
      return;
    }
    this.panel.addEventListener("dblclick", _0x5700c8 => {
      const _0x2c3b2d = _0x5700c8.target.closest(".v2-file-history-card");
      if (!_0x2c3b2d || !this.panel.contains(_0x2c3b2d)) {
        return;
      }
      const _0x485883 = String(_0x2c3b2d.dataset.recordId || "");
      const _0x552dc1 = this._findVisibleRecordById(_0x485883);
      if (!isFileManagerActionableRecord(_0x552dc1)) {
        return;
      }
      _0x5700c8.preventDefault();
      _0x5700c8.stopPropagation();
      const _0x556760 = this._selectedRecordIds.has(_0x485883) && this._getSelectedRecords().length > 0 ? this._getSelectedRecords() : [_0x552dc1];
      this.restoreRecordsToCanvas(_0x556760);
    });
  }
  _getSelectedRecords() {
    const _0x198725 = this._visibleRecords();
    const _0x4a0ee8 = this._selectedRecordIds;
    return _0x198725.filter(_0x503e6c => _0x4a0ee8.has(String(_0x503e6c?.id || "")));
  }
  _buildContextMenuItems(_0x1de40d) {
    const _0x517a81 = (Array.isArray(_0x1de40d) ? _0x1de40d : []).filter(isFileManagerActionableRecord);
    const _0x2b502f = _0x517a81[0] || null;
    const _0x17522c = _0x517a81.length === 1 ? resolveRecordLocalPath(_0x2b502f) : "";
    const _0x46ff2b = getFileManagerMenuActions({
      records: _0x517a81,
      canRevealInFolder: canShowItemInFolder(_0x17522c),
      getMediaKind: getRecordMediaKind,
      isActionableRecord: isFileManagerActionableRecord
    });
    const _0x207b36 = [];
    for (const _0x4e4bab of _0x46ff2b) {
      if (_0x4e4bab === "delete" && _0x207b36.length > 0) {
        _0x207b36.push("sep");
      }
      if (_0x4e4bab === "add-to-canvas") {
        _0x207b36.push({
          label: _0x517a81.length > 1 ? fileManagerText("contextMenu.addManyToCanvas", {
            count: _0x517a81.length
          }) : fileManagerText("contextMenu.addToCanvas"),
          action: () => this.restoreRecordsToCanvas(_0x517a81)
        });
      } else if (_0x4e4bab === "fullscreen") {
        _0x207b36.push({
          label: fileManagerText("contextMenu.fullscreen"),
          action: () => this._openRecordPreview(_0x2b502f)
        });
      } else if (_0x4e4bab === "reveal") {
        _0x207b36.push({
          label: fileManagerText("contextMenu.reveal"),
          action: () => this._showRecordInFolder(_0x2b502f)
        });
      } else if (_0x4e4bab === "delete") {
        _0x207b36.push({
          label: _0x517a81.length > 1 ? fileManagerText("contextMenu.deleteMany", {
            count: _0x517a81.length
          }) : fileManagerText("contextMenu.delete"),
          danger: true,
          action: () => void this._deleteRecords(_0x517a81)
        });
      }
    }
    return _0x207b36;
  }
  _clampContentScroll() {
    if (!this.contentEl) {
      return;
    }
    const _0x342f9a = Math.max(0, this.contentEl.scrollHeight - this.contentEl.clientHeight);
    if (_0x342f9a <= 0) {
      this.contentEl.scrollTop = 0;
      return;
    }
    if (this.contentEl.scrollTop > _0x342f9a) {
      this.contentEl.scrollTop = _0x342f9a;
    }
  }
  _bindResizeHandle() {
    if (!this.panel || !this.resizeHandleEl) {
      return;
    }
    const _0x19ef19 = () => {
      if (!this._resizeState) {
        return;
      }
      window.removeEventListener("pointermove", _0x2daa28, true);
      window.removeEventListener("pointerup", _0x19ef19, true);
      window.removeEventListener("pointercancel", _0x19ef19, true);
      this.panel.classList.remove("is-resizing");
      this._resizeState = null;
    };
    const _0x2daa28 = _0x2f6d6b => {
      if (!this._resizeState) {
        return;
      }
      _0x2f6d6b.preventDefault();
      const _0xb08460 = Math.max(FILE_PANEL_RESIZE.minWidth, window.innerWidth - this._resizeState.left - FILE_PANEL_RESIZE.maxViewportGap);
      const _0xf66399 = Math.max(FILE_PANEL_RESIZE.minWidth, Math.min(_0xb08460, this._resizeState.startWidth + _0x2f6d6b.clientX - this._resizeState.startX));
      this._panelWidth = Math.round(_0xf66399);
      this.panel.style.width = this._panelWidth + "px";
      this._relayoutMasonry();
      this._clampContentScroll();
    };
    this.resizeHandleEl.addEventListener("pointerdown", _0x2e1d98 => {
      if (_0x2e1d98.button !== 0) {
        return;
      }
      _0x2e1d98.preventDefault();
      _0x2e1d98.stopPropagation();
      const _0x27d0aa = this.panel.getBoundingClientRect();
      this._resizeState = {
        startX: _0x2e1d98.clientX,
        startWidth: _0x27d0aa.width || FILE_PANEL_RESIZE.defaultWidth,
        left: _0x27d0aa.left
      };
      this.panel.classList.add("is-resizing");
      this.resizeHandleEl.setPointerCapture?.(_0x2e1d98.pointerId);
      window.addEventListener("pointermove", _0x2daa28, true);
      window.addEventListener("pointerup", _0x19ef19, true);
      window.addEventListener("pointercancel", _0x19ef19, true);
    });
  }
  _bindLocaleChange() {
    this._unsubscribeLocale = onLocaleChange(() => {
      this._syncPanelStaticTexts();
      this.render();
    });
  }
  _syncPanelStaticTexts() {
    this.panel?.setAttribute("aria-label", fileManagerText("panel.ariaLabel"));
    if (this.titleEl) {
      this.titleEl.textContent = fileManagerText("panel.title");
    }
    this.sourceTabsEl?.setAttribute("aria-label", fileManagerText("panel.sourceTabsAria"));
    this.filterEl?.setAttribute("aria-label", fileManagerText("panel.filtersAria"));
    this.orderEl?.setAttribute("aria-label", fileManagerText("panel.orderAria"));
  }
  _bindButton() {
    const _0x3eba13 = document.getElementById("btnFiles");
    if (!_0x3eba13) {
      return;
    }
    const _0x2149c0 = () => {
      this.show();
    };
    registerSidebarSubmenu({
      key: FILE_MANAGER_SIDEBAR_KEY,
      button: _0x3eba13,
      panel: this.panel,
      open: _0x2149c0,
      close: () => this.hide(),
      isOpen: () => this.panel.classList.contains("show"),
      ignorePointerDown: _0x18d895 => this._shouldKeepOpenForExternalPointerDown(_0x18d895)
    });
  }
  _shouldKeepOpenForExternalPointerDown(_0x5d3956) {
    const _0x508223 = _0x5d3956?.target;
    if (!_0x508223?.closest) {
      return false;
    }
    return !!_0x508223.closest(FILE_MANAGER_KEEP_OPEN_SELECTOR);
  }
  _bindGenerationEvents() {
    window.addEventListener(GENERATION_HISTORY_EVENT, _0x5ac38c => {
      const _0x50fb36 = _0x5ac38c?.detail || {};
      const _0x3c6362 = {
        ...(_0x50fb36.nodeData || {})
      };
      if (!String(_0x3c6362.id || "").trim() && String(_0x50fb36.sourceNodeId || "").trim()) {
        _0x3c6362.id = String(_0x50fb36.sourceNodeId).trim();
      }
      const _0xc63d1b = buildGenerationHistoryAssetsFromNode({
        images: Array.isArray(_0x50fb36.images) ? _0x50fb36.images : [],
        videos: Array.isArray(_0x50fb36.videos) ? _0x50fb36.videos : [],
        audios: Array.isArray(_0x50fb36.audios) ? _0x50fb36.audios : [],
        nodeData: _0x3c6362,
        projectId: this._getCurrentProjectId(),
        canvasId: this._getCurrentCanvasId(),
        generationStartedAt: Number(_0x50fb36.startedAt || _0x3c6362.generationStartTime || 0) || undefined,
        now: Number(_0x50fb36.createdAt || Date.now()) || Date.now()
      });
      this._saveRecords(_0xc63d1b, {
        captureSource: "event"
      });
    });
  }
  _resetPageState() {
    this.records = [];
    this._recordsLoaded = false;
    this._recordsDirty = false;
    this._nextOffset = 0;
    this._hasMore = true;
    this._totalRecords = 0;
    if (this.contentEl) {
      this.contentEl.scrollTop = 0;
    }
  }
  _resetOutputPageState() {
    this.outputItems = [];
    this._outputLoaded = false;
    this._outputNextOffset = 0;
    this._outputHasMore = true;
    this._outputTotalItems = 0;
    if (this.contentEl) {
      this.contentEl.scrollTop = 0;
    }
  }
  _normalizeOutputPageResponse(_0x49ec7e, _0x131251) {
    const _0x5507e2 = Array.isArray(_0x49ec7e?.items) ? _0x49ec7e.items : [];
    return {
      items: _0x5507e2,
      total: Number(_0x49ec7e?.total || 0) || _0x5507e2.length,
      nextOffset: _0x49ec7e?.nextOffset === null || _0x49ec7e?.nextOffset === undefined ? null : Number(_0x49ec7e.nextOffset) || Number(_0x131251) + _0x5507e2.length,
      hasMore: Boolean(_0x49ec7e?.hasMore)
    };
  }
  async loadOutputFiles({
    dir = this._outputDir,
    reset = true
  } = {}) {
    if (this._outputLoading && !reset) {
      return;
    }
    const _0x1ae8fc = String(dir || "").trim();
    const _0x5c9caf = _0x1ae8fc !== String(this._outputDir || "").trim();
    if (reset || _0x5c9caf) {
      this._resetOutputPageState();
    } else if (!this._outputHasMore && this._outputLoaded) {
      return;
    }
    this._activeSource = "output";
    this._outputLoading = true;
    const _0x5bb59d = ++this._outputLoadToken;
    if (this._isOpen()) {
      this.render();
    }
    const _0x5a6645 = reset || _0x5c9caf ? 0 : this._outputNextOffset;
    try {
      const _0x38fe21 = await fetchOutputFilesFromServer({
        dir: _0x1ae8fc,
        order: this._sortOrder,
        offset: _0x5a6645,
        limit: FILE_OUTPUT_PAGE_SIZE
      });
      if (_0x5bb59d !== this._outputLoadToken) {
        return;
      }
      const _0x4f2803 = this._normalizeOutputPageResponse(_0x38fe21, _0x5a6645);
      if (_0x5a6645 === 0) {
        this.outputItems = _0x4f2803.items;
      } else {
        const _0x151851 = new Set(this.outputItems.map(_0x433678 => getOutputRecordIdForItem(_0x433678)));
        this.outputItems = [...this.outputItems, ..._0x4f2803.items.filter(_0x147d42 => {
          const _0x47e0dd = getOutputRecordIdForItem(_0x147d42);
          if (!_0x47e0dd || _0x151851.has(_0x47e0dd)) {
            return false;
          }
          _0x151851.add(_0x47e0dd);
          return true;
        })];
      }
      this._outputDir = String(_0x38fe21?.dir || "").trim();
      this._outputParent = String(_0x38fe21?.parent || "").trim();
      this._outputBreadcrumbs = Array.isArray(_0x38fe21?.breadcrumbs) && _0x38fe21.breadcrumbs.length > 0 ? _0x38fe21.breadcrumbs : [{
        name: "output",
        dir: ""
      }];
      this._outputNextOffset = _0x4f2803.nextOffset === null || _0x4f2803.nextOffset === undefined ? this.outputItems.length : _0x4f2803.nextOffset;
      this._outputHasMore = _0x4f2803.hasMore;
      this._outputTotalItems = _0x4f2803.total;
      this._outputLoaded = true;
    } catch (_0x402015) {
      if (_0x5bb59d !== this._outputLoadToken) {
        return;
      }
      console.error("[GenerationHistoryFileManager] 加载输出文件夹失败:", _0x402015);
      if (_0x5a6645 === 0) {
        this.outputItems = [];
      }
      this._outputLoaded = true;
    } finally {
      if (_0x5bb59d === this._outputLoadToken) {
        this._outputLoading = false;
        if (this._isOpen()) {
          this.render();
        }
      }
    }
  }
  _buildAssetPageParams(_0x2a2ae6) {
    const _0x416e5b = {
      kind: "generation-history",
      projectId: this._getCurrentProjectId(),
      offset: Number(_0x2a2ae6) || 0,
      limit: FILE_HISTORY_PAGE_SIZE
    };
    if (this._activeSource === "current-canvas") {
      _0x416e5b.canvasId = this._getCurrentCanvasId();
    }
    if (this._activeFilter !== "all") {
      _0x416e5b.mediaKind = this._activeFilter;
    }
    _0x416e5b.order = this._sortOrder;
    return _0x416e5b;
  }
  _normalizeAssetsPageResponse(_0xe25f6, _0x39addd) {
    if (Array.isArray(_0xe25f6)) {
      return {
        items: _0xe25f6.filter(isGenerationHistoryAsset),
        total: _0xe25f6.length,
        nextOffset: null,
        hasMore: false
      };
    }
    const _0x2bca37 = Array.isArray(_0xe25f6?.items) ? _0xe25f6.items.filter(isGenerationHistoryAsset) : [];
    return {
      items: _0x2bca37,
      total: Number(_0xe25f6?.total || 0) || _0x2bca37.length,
      nextOffset: _0xe25f6?.nextOffset === null || _0xe25f6?.nextOffset === undefined ? null : Number(_0xe25f6.nextOffset) || Number(_0x39addd) + _0x2bca37.length,
      hasMore: Boolean(_0xe25f6?.hasMore)
    };
  }
  async loadRecords({
    backfillAfterLoad = false,
    reset = false
  } = {}) {
    if (this._loading && !reset) {
      return;
    }
    if (reset) {
      this._resetPageState();
    }
    if (!this._hasMore && this._recordsLoaded) {
      return;
    }
    const _0x51c391 = ++this._loadToken;
    this._loading = true;
    if (this._isOpen()) {
      this.render();
    }
    let _0x34b6de = false;
    const _0x30d66c = reset ? 0 : this._nextOffset;
    try {
      const _0xdaaa5e = await fetchAssetsFromServer(this._buildAssetPageParams(_0x30d66c));
      if (_0x51c391 !== this._loadToken) {
        return;
      }
      const _0x41341b = this._normalizeAssetsPageResponse(_0xdaaa5e, _0x30d66c);
      const _0x63aa4 = _0x30d66c === 0 ? _0x41341b.items : [...this.records, ..._0x41341b.items.filter(_0x304bb8 => !this.records.some(_0x57ab4b => String(_0x57ab4b?.id || "") === String(_0x304bb8?.id || "")))];
      this.records = dedupeHistoryRecords(_0x63aa4);
      this._nextOffset = _0x41341b.nextOffset === null || _0x41341b.nextOffset === undefined ? this.records.length : _0x41341b.nextOffset;
      this._hasMore = _0x41341b.hasMore;
      this._totalRecords = _0x41341b.total;
      this._recordsLoaded = true;
      this._recordsDirty = false;
      _0x34b6de = backfillAfterLoad && _0x30d66c === 0;
    } catch (_0x409f15) {
      if (_0x51c391 !== this._loadToken) {
        return;
      }
      console.error("[GenerationHistoryFileManager] 加载生成媒体历史失败:", _0x409f15);
    } finally {
      if (_0x51c391 === this._loadToken) {
        this._loading = false;
        if (this._isOpen()) {
          this.render();
        }
      }
    }
    if (_0x51c391 === this._loadToken && _0x34b6de && this._isOpen()) {
      this._backfillCurrentCanvas();
    }
  }
  async _saveRecords(_0x415c87, {
    captureSource = ""
  } = {}) {
    const _0xd4fa6f = String(captureSource || "").trim();
    const _0x232738 = (Array.isArray(_0x415c87) ? _0x415c87 : []).map(_0x317501 => _0xd4fa6f ? {
      ..._0x317501,
      historyCaptureSource: _0xd4fa6f
    } : _0x317501);
    const _0x18509c = new Set();
    const _0x2fe8e3 = _0x232738.filter(_0x238508 => {
      const _0x163bcd = String(_0x238508?.resultFingerprint || "").trim();
      const _0x376467 = resolveRecordLocalPath(_0x238508);
      if (!_0x238508?.id || !_0x163bcd && !_0x376467) {
        return false;
      }
      const _0x266dfb = buildHistoryRecordIdentityKey(_0x238508);
      if (_0x18509c.has(_0x266dfb)) {
        return false;
      }
      _0x18509c.add(_0x266dfb);
      if (this._savingIds.has(_0x238508.id)) {
        return false;
      }
      if (this._savingRecordKeys.has(_0x266dfb)) {
        return false;
      }
      if (_0xd4fa6f === "backfill" && this.records.some(_0x3ef3d6 => isFileManagerBackfillDuplicate(_0x3ef3d6, _0x238508, {
        getMediaKind: getRecordMediaKind,
        getLocalPath: resolveRecordLocalPath
      }))) {
        return false;
      }
      return !this._hasRecord(_0x238508);
    });
    if (_0x2fe8e3.length === 0) {
      return 0;
    }
    let _0xeceefc = 0;
    for (const _0x24c929 of _0x2fe8e3) {
      const _0x63327c = buildHistoryRecordIdentityKey(_0x24c929);
      this._savingIds.add(_0x24c929.id);
      if (_0x63327c) {
        this._savingRecordKeys.add(_0x63327c);
      }
      try {
        await saveAssetToServer(_0x24c929);
        this.records = dedupeHistoryRecords([_0x24c929, ...this.records.filter(_0x104cd1 => _0x104cd1.id !== _0x24c929.id)]);
        _0xeceefc += 1;
      } catch (_0x3d8f57) {
        console.error("[GenerationHistoryFileManager] 保存生成媒体历史失败:", _0x3d8f57);
      } finally {
        this._savingIds.delete(_0x24c929.id);
        if (_0x63327c) {
          this._savingRecordKeys.delete(_0x63327c);
        }
      }
    }
    if (_0xeceefc > 0) {
      if (this._isOpen()) {
        this.render();
      } else {
        this._recordsDirty = true;
      }
    }
    return _0xeceefc;
  }
  async _backfillCurrentCanvas() {
    if (this._backfillInFlight) {
      return;
    }
    this._backfillInFlight = true;
    try {
      const _0x4d6169 = this._getCurrentProjectId();
      const _0x691b65 = this._getCurrentCanvasId();
      const _0x3c5733 = a969_0xe55b37.getStateRaw?.().nodes || a969_0xe55b37.getState().nodes || {};
      const _0xbe695d = [];
      for (const _0x1ea1c6 of Object.values(_0x3c5733 || {})) {
        if (!_0x1ea1c6) {
          continue;
        }
        const _0x354049 = String(_0x1ea1c6.type || "");
        if (!["ai-image", "ai-video", "ai-audio"].includes(_0x354049)) {
          continue;
        }
        const _0x367bfa = _0x354049 === "ai-image" && Array.isArray(_0x1ea1c6.images) ? _0x1ea1c6.images : [];
        const _0x49581f = Array.isArray(_0x1ea1c6.videos) ? _0x1ea1c6.videos : [];
        const _0x101b7f = _0x354049 === "ai-video" ? _0x49581f.length > 0 ? _0x49581f : String(_0x1ea1c6.videoUrl || _0x1ea1c6.localPath || "").trim() ? [_0x1ea1c6] : [] : [];
        const _0x91f5dc = _0x354049 === "ai-audio" && String(_0x1ea1c6.audioUrl || _0x1ea1c6.localPath || "").trim() ? [_0x1ea1c6] : [];
        if (_0x367bfa.length === 0 && _0x101b7f.length === 0 && _0x91f5dc.length === 0) {
          continue;
        }
        const _0x42d60d = resolveFileManagerBackfillStartedAt(_0x1ea1c6);
        _0xbe695d.push(...buildGenerationHistoryAssetsFromNode({
          images: _0x367bfa,
          videos: _0x101b7f,
          audios: _0x91f5dc,
          nodeData: _0x1ea1c6,
          projectId: _0x4d6169,
          canvasId: _0x691b65,
          generationStartedAt: _0x42d60d,
          now: _0x42d60d
        }));
      }
      await this._saveRecords(_0xbe695d, {
        captureSource: "backfill"
      });
    } finally {
      this._backfillInFlight = false;
    }
  }
  show() {
    this.panel?.classList.add("show");
    if (this.panel && !this._panelWidth) {
      this._panelWidth = FILE_PANEL_RESIZE.defaultWidth;
      this.panel.style.width = this._panelWidth + "px";
    }
    if (this._activeSource === "output") {
      if (!this._outputLoaded && !this._outputLoading) {
        this.loadOutputFiles({
          dir: this._outputDir,
          reset: true
        });
      } else {
        this.render();
      }
      return;
    }
    if (!this._recordsLoaded || this._recordsDirty) {
      if (!this._loading) {
        this.loadRecords({
          backfillAfterLoad: true,
          reset: true
        });
      } else {
        this.render();
      }
      return;
    }
    this._backfillCurrentCanvas();
    this._recordsDirty = false;
    this.render();
  }
  hide() {
    this._releaseVideoUiResources();
    this.panel?.classList.remove("show");
    document.getElementById("btnFiles")?.classList.remove("active");
  }
  render() {
    if (!this.contentEl || !this._isOpen()) {
      return;
    }
    this._releaseVideoUiResources();
    this._renderSourceTabs();
    this._renderFilters();
    this._renderOrderControls();
    this._renderSubtitle();
    this._renderBreadcrumbs();
    this.contentEl.replaceChildren();
    if (isHistorySource(this._activeSource) && this._loading && !this._recordsLoaded || this._activeSource === "output" && this._outputLoading && !this._outputLoaded) {
      const _0x5238c1 = document.createElement("div");
      _0x5238c1.className = "v2-file-history-empty";
      _0x5238c1.textContent = fileManagerText("loading.initial");
      this.contentEl.appendChild(_0x5238c1);
      return;
    }
    const _0x58cff2 = this._visibleRecords();
    this._pruneSelectionToVisibleRecords();
    if (_0x58cff2.length === 0) {
      const _0x4cac33 = document.createElement("div");
      _0x4cac33.className = "v2-file-history-empty";
      _0x4cac33.textContent = this._activeFilter === "all" ? this._activeSource === "output" ? fileManagerText("empty.output") : this._activeSource === "current-canvas" ? fileManagerText("empty.currentCanvas") : fileManagerText("empty.history") : fileManagerText("empty.filtered", {
        label: getMediaLabel(this._activeFilter)
      });
      this.contentEl.appendChild(_0x4cac33);
      this._clampContentScroll();
      return;
    }
    this._renderMasonry(_0x58cff2);
    if (isHistorySource(this._activeSource) && this._loading && this._recordsLoaded || this._activeSource === "output" && this._outputLoading && this._outputLoaded) {
      const _0x1d8f83 = document.createElement("div");
      _0x1d8f83.className = "v2-file-history-page-status";
      _0x1d8f83.textContent = fileManagerText("loading.more");
      this.contentEl.appendChild(_0x1d8f83);
    }
    this._clampContentScroll();
  }
  _renderSourceTabs() {
    if (!this.sourceTabsEl) {
      return;
    }
    const _0xaebf1f = document.createDocumentFragment();
    for (const _0x2e3015 of FILE_SOURCES) {
      const _0x7da0b7 = document.createElement("button");
      _0x7da0b7.type = "button";
      _0x7da0b7.className = "v2-file-history-source-tab";
      _0x7da0b7.dataset.fileAction = "source";
      _0x7da0b7.dataset.source = _0x2e3015.key;
      _0x7da0b7.setAttribute("role", "tab");
      _0x7da0b7.setAttribute("aria-selected", this._activeSource === _0x2e3015.key ? "true" : "false");
      _0x7da0b7.classList.toggle("is-active", this._activeSource === _0x2e3015.key);
      _0x7da0b7.textContent = fileManagerText(_0x2e3015.labelKey);
      _0xaebf1f.appendChild(_0x7da0b7);
    }
    this.sourceTabsEl.replaceChildren(_0xaebf1f);
  }
  _renderOrderControls() {
    if (!this.orderEl) {
      return;
    }
    const _0x4e5db4 = document.createElement("button");
    _0x4e5db4.type = "button";
    _0x4e5db4.className = "v2-file-history-order-btn";
    _0x4e5db4.dataset.fileAction = "order";
    _0x4e5db4.dataset.order = this._sortOrder;
    _0x4e5db4.setAttribute("aria-label", this._sortOrder === "asc" ? fileManagerText("sort.ascAria") : fileManagerText("sort.descAria"));
    _0x4e5db4.title = this._sortOrder === "asc" ? fileManagerText("sort.ascTitle") : fileManagerText("sort.descTitle");
    _0x4e5db4.innerHTML = "\n      <svg viewBox=\"0 0 24 24\" aria-hidden=\"true\" class=\"" + (this._sortOrder === "asc" ? "is-asc" : "is-desc") + "\">\n        <path d=\"M8 5v14\" />\n        <path d=\"M4.5 8.5 8 5l3.5 3.5\" />\n        <path d=\"M16 19V5\" />\n        <path d=\"m12.5 15.5 3.5 3.5 3.5-3.5\" />\n      </svg>\n    ";
    this.orderEl.replaceChildren(_0x4e5db4);
  }
  _renderSubtitle() {
    if (!this.subtitleEl) {
      return;
    }
    this.subtitleEl.textContent = this._activeSource === "output" ? fileManagerText("subtitle.output") : this._activeSource === "current-canvas" ? fileManagerText("subtitle.currentCanvas") : fileManagerText("subtitle.history");
  }
  _renderBreadcrumbs() {
    if (!this.breadcrumbsEl) {
      return;
    }
    this.breadcrumbsEl.replaceChildren();
    this.breadcrumbsEl.classList.toggle("is-visible", this._activeSource === "output");
    if (this._activeSource !== "output") {
      return;
    }
    const _0x26ea5e = Array.isArray(this._outputBreadcrumbs) ? this._outputBreadcrumbs : [{
      name: "output",
      dir: ""
    }];
    if (this._outputDir) {
      const _0xd9232e = document.createElement("button");
      _0xd9232e.type = "button";
      _0xd9232e.className = "v2-file-history-crumb";
      _0xd9232e.dataset.fileAction = "output-dir";
      _0xd9232e.dataset.dir = this._outputParent || "";
      _0xd9232e.textContent = fileManagerText("breadcrumbs.up");
      this.breadcrumbsEl.appendChild(_0xd9232e);
    }
    for (const _0x5f41e6 of _0x26ea5e) {
      const _0x58f56b = document.createElement("button");
      _0x58f56b.type = "button";
      _0x58f56b.className = "v2-file-history-crumb";
      _0x58f56b.dataset.fileAction = "output-dir";
      _0x58f56b.dataset.dir = String(_0x5f41e6?.dir || "");
      _0x58f56b.textContent = String(_0x5f41e6?.name || "output");
      this.breadcrumbsEl.appendChild(_0x58f56b);
    }
  }
  _getMasonryMetrics() {
    if (!this.contentEl) {
      return {
        contentWidth: 1
      };
    }
    const _0x49c80e = window.getComputedStyle(this.contentEl);
    const _0xe240ac = (Number.parseFloat(_0x49c80e.paddingLeft) || 0) + (Number.parseFloat(_0x49c80e.paddingRight) || 0);
    return {
      contentWidth: Math.max(1, (this.contentEl.clientWidth || 1) - _0xe240ac)
    };
  }
  _getRecordDisplaySize(_0x57f116, _0x18a5fb) {
    const _0xe1a63e = getRecordMediaKind(_0x57f116);
    const {
      width: _0x2f0a4a,
      height: _0x420efd
    } = resolveRecordSize(_0x57f116, _0xe1a63e);
    const _0x37c384 = Math.max(1, _0x2f0a4a);
    const _0x3e3c16 = Math.max(1, _0x420efd);
    const _0x446100 = Math.min(_0x37c384, _0x3e3c16);
    const _0x1e3d12 = Math.max(_0x37c384, _0x3e3c16);
    const _0x16f173 = FILE_MASONRY.fixedShortSide;
    const _0x3451ea = Math.min(_0x16f173 / _0x446100, FILE_MASONRY.maxLongSide / _0x1e3d12, _0x37c384 > _0x18a5fb ? _0x18a5fb / _0x37c384 : 1);
    return {
      width: Math.max(1, Math.round(_0x37c384 * _0x3451ea)),
      height: Math.max(1, Math.round(_0x3e3c16 * _0x3451ea))
    };
  }
  _findMasonrySlot(_0x4f4c5b, _0x23eac6, _0x350054) {
    const _0x5a4309 = FILE_MASONRY.gap;
    const _0x5e321d = Math.max(0, _0x350054 - _0x23eac6.width);
    const _0x50993d = [];
    for (let _0x5b803b = 0; _0x5b803b <= _0x5e321d; _0x5b803b += FILE_MASONRY.placementStep) {
      _0x50993d.push(_0x5b803b);
    }
    if (_0x50993d[_0x50993d.length - 1] !== _0x5e321d) {
      _0x50993d.push(_0x5e321d);
    }
    let _0x1d07a2 = null;
    for (const _0x76b095 of _0x50993d) {
      let _0x449676 = 0;
      for (const _0x49ef75 of _0x4f4c5b) {
        const _0x44d49a = _0x76b095 < _0x49ef75.x + _0x49ef75.width + _0x5a4309 && _0x76b095 + _0x23eac6.width + _0x5a4309 > _0x49ef75.x;
        if (_0x44d49a) {
          _0x449676 = Math.max(_0x449676, _0x49ef75.y + _0x49ef75.height + _0x5a4309);
        }
      }
      if (!_0x1d07a2 || _0x449676 < _0x1d07a2.y || _0x449676 === _0x1d07a2.y && _0x76b095 < _0x1d07a2.x) {
        _0x1d07a2 = {
          x: _0x76b095,
          y: _0x449676
        };
      }
    }
    return _0x1d07a2 || {
      x: 0,
      y: 0
    };
  }
  _renderMasonry(_0x4c24be) {
    const {
      contentWidth: _0x41d816
    } = this._getMasonryMetrics();
    const _0x4b117c = document.createElement("div");
    _0x4b117c.className = "v2-file-history-masonry-canvas";
    this.contentEl.appendChild(_0x4b117c);
    const _0x1b1a2a = [];
    let _0x114573 = 0;
    for (const _0x47cff5 of _0x4c24be) {
      const _0x5c9e2e = this._getRecordDisplaySize(_0x47cff5, _0x41d816);
      const _0x3e3cb3 = this._findMasonrySlot(_0x1b1a2a, _0x5c9e2e, _0x41d816);
      const _0x261a36 = this._renderCard(_0x47cff5);
      _0x261a36.style.left = _0x3e3cb3.x + "px";
      _0x261a36.style.top = _0x3e3cb3.y + "px";
      _0x261a36.style.width = _0x5c9e2e.width + "px";
      _0x261a36.style.height = _0x5c9e2e.height + "px";
      _0x4b117c.appendChild(_0x261a36);
      this._observeVideoThumbnail(_0x47cff5, _0x261a36);
      _0x1b1a2a.push({
        ..._0x3e3cb3,
        ..._0x5c9e2e
      });
      _0x114573 = Math.max(_0x114573, _0x3e3cb3.y + _0x5c9e2e.height);
    }
    _0x4b117c.style.height = _0x114573 + "px";
  }
  _observeVideoThumbnail(_0x126a90, _0x5d2d7d) {
    if (getRecordMediaKind(_0x126a90) !== GENERATION_HISTORY_MEDIA_KINDS.VIDEO) {
      return;
    }
    const _0x551f04 = resolveGenerationHistoryVideoPresentation(_0x126a90);
    if (!_0x551f04.needsBackfill) {
      return;
    }
    const _0x161a50 = () => {
      if (!_0x5d2d7d?.isConnected || !this._isOpen()) {
        return;
      }
      this._ensureVideoThumbnailForRecord(_0x126a90).then(_0x18f410 => {
        if (!_0x18f410 || !_0x5d2d7d?.isConnected) {
          return;
        }
        if (String(_0x5d2d7d.dataset.recordId || "") !== String(_0x126a90?.id || "")) {
          return;
        }
        const _0x117ac4 = resolveGenerationHistoryVideoPresentation(_0x18f410);
        this._setVideoPosterOnCard(_0x5d2d7d, _0x117ac4.posterSrc);
      });
    };
    const _0x5bfdfa = window.IntersectionObserver;
    if (typeof _0x5bfdfa !== "function") {
      queueMicrotask(_0x161a50);
      return;
    }
    if (!this._videoThumbnailObserver) {
      this._videoThumbnailObserver = new _0x5bfdfa(_0x324afd => {
        for (const _0x4a3879 of _0x324afd) {
          if (!_0x4a3879?.isIntersecting) {
            continue;
          }
          const _0x349adc = _0x4a3879.target;
          const _0xa0fa3a = this._videoThumbnailTargets.get(_0x349adc);
          this._videoThumbnailObserver?.unobserve(_0x349adc);
          if (!_0xa0fa3a || !_0x349adc?.isConnected || !this._isOpen()) {
            continue;
          }
          this._ensureVideoThumbnailForRecord(_0xa0fa3a).then(_0x190aad => {
            if (!_0x190aad || !_0x349adc?.isConnected) {
              return;
            }
            if (String(_0x349adc.dataset.recordId || "") !== String(_0xa0fa3a?.id || "")) {
              return;
            }
            const _0x1e6648 = resolveGenerationHistoryVideoPresentation(_0x190aad);
            this._setVideoPosterOnCard(_0x349adc, _0x1e6648.posterSrc);
          });
        }
      }, {
        root: this.contentEl,
        rootMargin: "240px 0px"
      });
    }
    this._videoThumbnailTargets.set(_0x5d2d7d, _0x126a90);
    this._videoThumbnailObserver.observe(_0x5d2d7d);
  }
  _ensureVideoThumbnailForRecord(_0x3870b5) {
    const _0x498d88 = resolveGenerationHistoryVideoPresentation(_0x3870b5);
    if (!_0x498d88.needsBackfill) {
      return Promise.resolve(_0x3870b5);
    }
    const _0x17a576 = String(_0x3870b5?.id || "") + ":" + _0x498d88.mediaSrc;
    const _0x331772 = this._videoThumbnailBackfills.get(_0x17a576);
    if (_0x331772) {
      return _0x331772;
    }
    const _0x367c6a = Array.isArray(_0x3870b5?.nodes) ? _0x3870b5.nodes[0] || {} : {};
    const _0x4ae545 = {
      ..._0x367c6a,
      localPath: resolveRecordLocalPath(_0x3870b5),
      videoUrl: _0x498d88.mediaSrc
    };
    let _0xed99ba;
    _0xed99ba = this._videoThumbnailQueue.enqueue(_0x498d88.mediaSrc, () => ensureVideoResultThumbnail(_0x4ae545)).then(_0x26e3f => {
      const _0x1f984e = applyGenerationHistoryVideoThumbnail(_0x3870b5, _0x26e3f);
      this._rememberVideoThumbnail(_0x1f984e, _0x3870b5);
      this._persistVideoThumbnail(_0x1f984e, _0x3870b5);
      return _0x1f984e;
    }).catch(_0x2b2fc9 => {
      console.warn("[GenerationHistoryFileManager] video thumbnail backfill failed", _0x2b2fc9);
      return null;
    }).finally(() => {
      if (this._videoThumbnailBackfills.get(_0x17a576) === _0xed99ba) {
        this._videoThumbnailBackfills.delete(_0x17a576);
      }
    });
    this._videoThumbnailBackfills.set(_0x17a576, _0xed99ba);
    return _0xed99ba;
  }
  _rememberVideoThumbnail(_0x4633ed, _0x66021d) {
    const _0x1fec25 = String(_0x66021d?.id || "");
    if (_0x66021d?.outputItem) {
      const _0x3a923a = Array.isArray(_0x4633ed?.nodes) ? _0x4633ed.nodes[0] || {} : {};
      const _0x7cf7f0 = normalizeLocalPath(_0x3a923a?.thumbLocalPath);
      if (!_0x7cf7f0) {
        return;
      }
      this.outputItems = (Array.isArray(this.outputItems) ? this.outputItems : []).map(_0x29f8bc => getOutputRecordIdForItem(_0x29f8bc) === _0x1fec25 ? {
        ..._0x29f8bc,
        thumbLocalPath: _0x7cf7f0
      } : _0x29f8bc);
      return;
    }
    this.records = (Array.isArray(this.records) ? this.records : []).map(_0x267100 => String(_0x267100?.id || "") === _0x1fec25 ? _0x4633ed : _0x267100);
  }
  async _persistVideoThumbnail(_0xc651fc, _0x357a2c) {
    try {
      if (_0x357a2c?.outputItem) {
        const _0x548e6a = Array.isArray(_0xc651fc?.nodes) ? _0xc651fc.nodes[0] || {} : {};
        const _0x132ccb = resolveRecordLocalPath(_0x357a2c);
        const _0x14e83f = normalizeLocalPath(_0x548e6a?.thumbLocalPath);
        if (!_0x132ccb || !_0x14e83f) {
          return;
        }
        await saveOutputVideoThumbnailToServer({
          localPath: _0x132ccb,
          thumbLocalPath: _0x14e83f
        });
        return;
      }
      await saveAssetToServer(_0xc651fc);
    } catch (_0xaba729) {
      console.warn("[GenerationHistoryFileManager] video thumbnail persistence failed", _0xaba729);
    }
  }
  _releaseVideoUiResources() {
    this._videoThumbnailObserver?.disconnect();
    this._videoThumbnailObserver = null;
    this._videoThumbnailTargets = new WeakMap();
    for (const _0x16fb17 of this._mediaPreviewDisposers) {
      _0x16fb17();
    }
    this._mediaPreviewDisposers.clear();
  }
  _relayoutMasonry() {
    if (!this.contentEl || !this._isOpen()) {
      return false;
    }
    const _0x29ca99 = this.contentEl.querySelector(".v2-file-history-masonry-canvas");
    if (!_0x29ca99) {
      this.render();
      return false;
    }
    const _0x2d101b = this._visibleRecords();
    const _0x54265c = new Map(Array.from(_0x29ca99.querySelectorAll(".v2-file-history-card")).map(_0x521468 => [String(_0x521468.dataset.recordId || ""), _0x521468]));
    if (_0x2d101b.length !== _0x54265c.size) {
      this.render();
      return false;
    }
    const {
      contentWidth: _0x2f7654
    } = this._getMasonryMetrics();
    const _0x1abb8f = [];
    let _0x557235 = 0;
    for (const _0x3c6b65 of _0x2d101b) {
      const _0x5368a5 = String(_0x3c6b65?.id || "");
      const _0x36558b = _0x54265c.get(_0x5368a5);
      if (!_0x36558b) {
        this.render();
        return false;
      }
      const _0x2ba166 = this._getRecordDisplaySize(_0x3c6b65, _0x2f7654);
      const _0x4201ed = this._findMasonrySlot(_0x1abb8f, _0x2ba166, _0x2f7654);
      _0x36558b.style.left = _0x4201ed.x + "px";
      _0x36558b.style.top = _0x4201ed.y + "px";
      _0x36558b.style.width = _0x2ba166.width + "px";
      _0x36558b.style.height = _0x2ba166.height + "px";
      _0x1abb8f.push({
        ..._0x4201ed,
        ..._0x2ba166
      });
      _0x557235 = Math.max(_0x557235, _0x4201ed.y + _0x2ba166.height);
    }
    _0x29ca99.style.height = _0x557235 + "px";
    return true;
  }
  _renderFilters() {
    if (!this.filterEl) {
      return;
    }
    const _0x3c4771 = new Map(Array.from(this.filterEl.querySelectorAll(".v2-file-history-filter")).map(_0x53a4e7 => [_0x53a4e7.dataset.filter || "", _0x53a4e7]));
    const _0x364660 = document.createDocumentFragment();
    for (const _0x59ba65 of FILE_FILTERS) {
      const _0x53b9ff = _0x3c4771.get(_0x59ba65.key) || document.createElement("button");
      if (!_0x53b9ff.dataset.filter) {
        _0x53b9ff.type = "button";
        _0x53b9ff.className = "v2-file-history-filter";
        _0x53b9ff.dataset.fileAction = "filter";
        _0x53b9ff.dataset.filter = _0x59ba65.key;
      }
      _0x53b9ff.setAttribute("role", "tab");
      _0x53b9ff.setAttribute("aria-selected", this._activeFilter === _0x59ba65.key ? "true" : "false");
      _0x53b9ff.classList.toggle("is-active", this._activeFilter === _0x59ba65.key);
      _0x53b9ff.textContent = fileManagerText(_0x59ba65.labelKey);
      _0x364660.appendChild(_0x53b9ff);
    }
    this.filterEl.replaceChildren(_0x364660);
  }
  _renderCard(_0x283b93) {
    const _0x263b0f = document.createElement("div");
    _0x263b0f.className = "v2-file-history-card";
    _0x263b0f.dataset.recordId = String(_0x283b93?.id || "");
    const _0x9edac3 = getRecordMediaKind(_0x283b93);
    _0x263b0f.dataset.mediaKind = _0x9edac3;
    _0x263b0f.classList.toggle("is-selected", this._selectedRecordIds.has(String(_0x283b93?.id || "")));
    const _0x2f2258 = document.createElement("div");
    _0x2f2258.className = "v2-file-history-thumb is-" + _0x9edac3;
    const _0x260de6 = resolveRecordAspect(_0x283b93, _0x9edac3);
    if (_0x260de6) {
      _0x2f2258.style.aspectRatio = _0x260de6;
    }
    const _0x4cf44b = _0x9edac3 === GENERATION_HISTORY_MEDIA_KINDS.VIDEO ? resolveGenerationHistoryVideoPresentation(_0x283b93) : null;
    const _0x241ffb = _0x4cf44b ? _0x4cf44b.posterSrc : resolveThumbSrc(_0x283b93);
    const _0x3c5021 = _0x4cf44b?.mediaSrc || resolveMediaSrc(_0x283b93);
    if (_0x9edac3 === "folder") {
      _0x2f2258.appendChild(this._renderFolderThumb(_0x283b93));
    } else if (_0x9edac3 === "file") {
      _0x2f2258.appendChild(this._renderFileThumb(_0x283b93));
    } else if (_0x9edac3 === GENERATION_HISTORY_MEDIA_KINDS.VIDEO) {
      _0x263b0f.dataset.videoMediaSrc = _0x3c5021;
      _0x263b0f.dataset.videoPosterSrc = _0x241ffb;
      if (_0x241ffb) {
        _0x2f2258.appendChild(this._createVideoPosterImage(_0x241ffb));
      } else {
        _0x2f2258.appendChild(this._renderVideoPosterPlaceholder());
      }
      if (_0x3c5021) {
        _0x2f2258.appendChild(this._renderVideoPreviewOverlay());
      }
    } else if (_0x9edac3 === GENERATION_HISTORY_MEDIA_KINDS.AUDIO) {
      _0x2f2258.appendChild(this._renderAudioThumb(_0x3c5021));
    } else if (_0x241ffb) {
      const _0x528228 = document.createElement("img");
      _0x528228.src = _0x241ffb;
      _0x528228.alt = fileManagerText("alt.imageHistory");
      _0x528228.draggable = false;
      _0x528228.decoding = "async";
      _0x528228.loading = "lazy";
      _0x2f2258.appendChild(_0x528228);
    }
    _0x263b0f.appendChild(_0x2f2258);
    this._bindHoverPreview(_0x263b0f, _0x9edac3, _0x3c5021);
    return _0x263b0f;
  }
  _bindHoverPreview(_0x27911e, _0x4cff6c, _0x23896e = "") {
    if (!_0x27911e) {
      return;
    }
    if (_0x4cff6c === GENERATION_HISTORY_MEDIA_KINDS.VIDEO) {
      const _0xd615ea = _0x27911e.querySelector(".v2-file-history-video-progress-fill");
      const _0x537490 = String(_0x23896e || _0x27911e.dataset.videoMediaSrc || "").trim();
      if (!_0x537490) {
        return;
      }
      let _0x333fbf = null;
      const _0x2b5b03 = () => {
        if (_0xd615ea) {
          _0xd615ea.style.transform = "scaleX(0)";
        }
      };
      const _0x268472 = () => {
        if (!_0xd615ea || !_0x333fbf) {
          return;
        }
        const _0x226e94 = Number(_0x333fbf.duration || 0);
        const _0x419ff2 = Number(_0x333fbf.currentTime || 0);
        const _0x23d4f8 = _0x226e94 > 0 ? Math.min(Math.max(_0x419ff2 / _0x226e94, 0), 1) : 0;
        _0xd615ea.style.transform = "scaleX(" + _0x23d4f8 + ")";
      };
      const _0x5d4a2f = () => {
        if (!_0x333fbf) {
          return;
        }
        const _0x25a880 = _0x333fbf;
        _0x333fbf = null;
        _0x25a880.removeEventListener("timeupdate", _0x268472);
        _0x25a880.removeEventListener("loadedmetadata", _0x268472);
        _0x25a880.pause();
        try {
          _0x25a880.currentTime = 0;
        } catch {}
        _0x25a880.removeAttribute("src");
        _0x25a880.load?.();
        _0x25a880.remove();
      };
      const _0x39316a = () => {
        if (_0x333fbf) {
          return;
        }
        const _0x568002 = _0x27911e.querySelector(".v2-file-history-thumb");
        if (!_0x568002) {
          return;
        }
        const _0x3dacee = document.createElement("video");
        _0x3dacee.className = "v2-file-history-hover-video";
        _0x3dacee.src = _0x537490;
        const _0x199506 = String(_0x27911e.dataset.videoPosterSrc || "").trim();
        if (_0x199506) {
          _0x3dacee.poster = _0x199506;
        }
        _0x3dacee.muted = false;
        _0x3dacee.volume = 0.72;
        _0x3dacee.loop = true;
        _0x3dacee.playsInline = true;
        _0x3dacee.preload = "metadata";
        _0x3dacee.draggable = false;
        _0x3dacee.addEventListener("timeupdate", _0x268472);
        _0x3dacee.addEventListener("loadedmetadata", _0x268472);
        const _0x16f7cb = _0x568002.querySelector(".v2-file-history-video-preview-overlay");
        _0x568002.insertBefore(_0x3dacee, _0x16f7cb || null);
        _0x333fbf = _0x3dacee;
        _0x27911e.classList.add("is-preview-playing");
        const _0x3af228 = _0x3dacee.play();
        if (_0x3af228 && typeof _0x3af228.catch === "function") {
          _0x3af228.catch(() => {
            if (_0x333fbf !== _0x3dacee) {
              return;
            }
            _0x3dacee.muted = true;
            const _0x1626b3 = _0x3dacee.play();
            if (_0x1626b3 && typeof _0x1626b3.catch === "function") {
              _0x1626b3.catch(() => {
                if (_0x333fbf !== _0x3dacee) {
                  return;
                }
                _0x27911e.classList.remove("is-preview-playing");
                _0x2b5b03();
                _0x5d4a2f();
              });
            }
          });
        }
      };
      const _0x1fb451 = () => {
        _0x5d4a2f();
        _0x2b5b03();
        _0x27911e.classList.remove("is-preview-playing");
      };
      _0x27911e.addEventListener("mouseenter", _0x39316a);
      _0x27911e.addEventListener("mouseleave", _0x1fb451);
      const _0x13928f = () => {
        _0x27911e.removeEventListener("mouseenter", _0x39316a);
        _0x27911e.removeEventListener("mouseleave", _0x1fb451);
        _0x5d4a2f();
        _0x2b5b03();
        _0x27911e.classList.remove("is-preview-playing");
      };
      this._mediaPreviewDisposers.add(_0x13928f);
      return;
    }
    if (_0x4cff6c === GENERATION_HISTORY_MEDIA_KINDS.AUDIO) {
      const _0x1cff39 = String(_0x23896e || "").trim();
      if (!_0x1cff39) {
        return;
      }
      let _0x14cd9b = null;
      let _0xbc4514 = 0;
      const _0x234a85 = () => {
        _0xbc4514 += 1;
        const _0x455fcd = _0x14cd9b;
        _0x14cd9b = null;
        _0x27911e.classList.remove("is-preview-playing");
        if (!_0x455fcd) {
          return;
        }
        try {
          _0x455fcd.pause?.();
        } catch {}
        try {
          _0x455fcd.removeAttribute?.("src");
          clearDesktopMediaPlaybackSourceMetadata(_0x455fcd);
          _0x455fcd.preload = "none";
          _0x455fcd.load?.();
        } catch {}
        _0x455fcd.remove?.();
      };
      const _0x22069b = () => {
        if (_0x14cd9b) {
          return;
        }
        const _0x322c3f = _0x27911e.querySelector(".v2-file-history-thumb");
        if (!_0x322c3f) {
          return;
        }
        const _0x21c0d7 = document.createElement("audio");
        const _0x5022f0 = _0xbc4514 + 1;
        _0xbc4514 = _0x5022f0;
        _0x21c0d7.preload = "auto";
        _0x21c0d7.className = "v2-file-history-preview-audio";
        _0x21c0d7.volume = 0.72;
        _0x322c3f.appendChild(_0x21c0d7);
        _0x14cd9b = _0x21c0d7;
        attachMediaElementPlaybackSource(_0x21c0d7, _0x1cff39, {
          preload: "auto",
          shouldAssign: () => _0x14cd9b === _0x21c0d7 && _0xbc4514 === _0x5022f0 && _0x27911e.isConnected !== false
        }).then(async _0x43c514 => {
          if (!_0x43c514 || _0x14cd9b !== _0x21c0d7 || _0xbc4514 !== _0x5022f0) {
            return false;
          }
          await _0x21c0d7.play?.();
          return true;
        }).then(_0x14914c => {
          if (_0x14914c === true && _0x14cd9b === _0x21c0d7 && _0xbc4514 === _0x5022f0) {
            _0x27911e.classList.add("is-preview-playing");
          }
        }).catch(() => {
          if (_0x14cd9b === _0x21c0d7 && _0xbc4514 === _0x5022f0) {
            _0x234a85();
          }
        });
      };
      const _0x6e1291 = () => {
        _0x234a85();
      };
      _0x27911e.addEventListener("mouseenter", _0x22069b);
      _0x27911e.addEventListener("mouseleave", _0x6e1291);
      const _0x5291c0 = () => {
        _0x27911e.removeEventListener("mouseenter", _0x22069b);
        _0x27911e.removeEventListener("mouseleave", _0x6e1291);
        _0x234a85();
      };
      this._mediaPreviewDisposers.add(_0x5291c0);
    }
  }
  _createVideoPosterImage(_0x2f27ea) {
    const _0x56a792 = document.createElement("img");
    _0x56a792.className = "v2-file-history-video-poster";
    _0x56a792.src = String(_0x2f27ea || "").trim();
    _0x56a792.alt = fileManagerText("alt.videoHistory");
    _0x56a792.draggable = false;
    _0x56a792.decoding = "async";
    _0x56a792.loading = "lazy";
    return _0x56a792;
  }
  _renderVideoPosterPlaceholder() {
    const _0x2d6de5 = document.createElement("div");
    _0x2d6de5.className = "v2-file-history-video-poster-placeholder";
    _0x2d6de5.setAttribute("aria-hidden", "true");
    _0x2d6de5.innerHTML = "\n      <svg viewBox=\"0 0 48 48\">\n        <rect x=\"7\" y=\"10\" width=\"34\" height=\"28\" rx=\"5\"></rect>\n        <path d=\"m21 18 10 6-10 6z\"></path>\n      </svg>\n    ";
    return _0x2d6de5;
  }
  _setVideoPosterOnCard(_0x44223d, _0x444824) {
    const _0x205e16 = String(_0x444824 || "").trim();
    if (!_0x44223d || !_0x205e16) {
      return;
    }
    _0x44223d.dataset.videoPosterSrc = _0x205e16;
    const _0x4450ba = _0x44223d.querySelector(".v2-file-history-video-poster");
    if (_0x4450ba) {
      _0x4450ba.src = _0x205e16;
      return;
    }
    const _0x466ded = _0x44223d.querySelector(".v2-file-history-video-poster-placeholder");
    const _0x310c24 = this._createVideoPosterImage(_0x205e16);
    if (_0x466ded) {
      _0x466ded.replaceWith(_0x310c24);
      return;
    }
    const _0x360136 = _0x44223d.querySelector(".v2-file-history-thumb");
    if (_0x360136) {
      _0x360136.insertBefore(_0x310c24, _0x360136.firstChild || null);
    }
  }
  _renderFolderThumb(_0x109028) {
    const _0x3c169e = document.createElement("div");
    _0x3c169e.className = "v2-file-history-folder-thumb";
    const _0x1148ed = document.createElement("div");
    _0x1148ed.className = "v2-file-history-folder-name";
    _0x1148ed.textContent = _0x109028?.name || fileManagerText("fallback.folder");
    _0x3c169e.innerHTML = "\n      <svg viewBox=\"0 0 96 72\" aria-hidden=\"true\">\n        <path d=\"M8 22h28l8 9h44v31a8 8 0 0 1-8 8H16a8 8 0 0 1-8-8V22z\" class=\"folder-body\"/>\n        <path d=\"M8 18a8 8 0 0 1 8-8h19l8 9h37a8 8 0 0 1 8 8v6H8V18z\" class=\"folder-tab\"/>\n      </svg>\n    ";
    _0x3c169e.appendChild(_0x1148ed);
    return _0x3c169e;
  }
  _renderVideoPreviewOverlay() {
    const _0x2f2c87 = document.createElement("div");
    _0x2f2c87.className = "v2-file-history-video-preview-overlay";
    _0x2f2c87.innerHTML = "\n      <div class=\"v2-file-history-video-progress\" aria-hidden=\"true\">\n        <div class=\"v2-file-history-video-progress-fill\"></div>\n      </div>\n    ";
    return _0x2f2c87;
  }
  _renderFileThumb(_0x8fffd7) {
    const _0x25c29b = document.createElement("div");
    _0x25c29b.className = "v2-file-history-file-thumb";
    _0x25c29b.innerHTML = "\n      <svg viewBox=\"0 0 72 88\" aria-hidden=\"true\">\n        <path d=\"M14 4h30l14 14v66H14z\" class=\"file-page\"/>\n        <path d=\"M44 4v15h14\" class=\"file-fold\"/>\n      </svg>\n    ";
    const _0x21e11c = document.createElement("div");
    _0x21e11c.className = "v2-file-history-folder-name";
    _0x21e11c.textContent = _0x8fffd7?.name || fileManagerText("fallback.file");
    _0x25c29b.appendChild(_0x21e11c);
    return _0x25c29b;
  }
  _renderAudioThumb() {
    const _0x25f6ff = document.createElement("div");
    _0x25f6ff.className = "v2-file-history-audio-thumb";
    _0x25f6ff.innerHTML = "\n      <svg viewBox=\"0 0 120 72\" aria-hidden=\"true\">\n        <path d=\"M12 38h8m8 0h8m8 0h8m8 0h8m8 0h8m8 0h8m8 0h8\" class=\"wave-line\"/>\n        <path d=\"M20 48V28m16 28V20m16 36V26m16 30V18m16 38V24m16 26V32\" class=\"wave-bars\"/>\n      </svg>\n      <div class=\"v2-file-history-audio-progress-line\" aria-hidden=\"true\"></div>\n    ";
    return _0x25f6ff;
  }
  _buildCanvasNodeFromRecord(_0x4cb259, {
    center: _0x41cd97,
    occupiedNodes: _0x4f7f70,
    index = 0
  } = {}) {
    const _0x16bafc = Array.isArray(_0x4cb259?.nodes) ? _0x4cb259.nodes[0] : null;
    if (!_0x16bafc) {
      return null;
    }
    const _0x26ac1e = getRecordMediaKind(_0x4cb259);
    const _0x2f048e = _0x26ac1e === GENERATION_HISTORY_MEDIA_KINDS.VIDEO ? "source-video" : _0x26ac1e === GENERATION_HISTORY_MEDIA_KINDS.AUDIO ? "source-audio" : "source-image";
    const _0x1b1a5c = String(_0x16bafc.type || _0x2f048e).trim() || _0x2f048e;
    const _0x50e0dd = normalizeFileManagerSourceNodeForCanvas({
      ..._0x16bafc,
      type: _0x1b1a5c
    });
    const _0xccc6ad = Number(_0x50e0dd.width ?? _0x50e0dd.w) || (_0x1b1a5c === "source-audio" ? 320 : 260);
    const _0x1bbe98 = Number(_0x50e0dd.height ?? _0x50e0dd.h) || (_0x1b1a5c === "source-audio" ? 140 : 260);
    const _0x481bb3 = _0x41cd97 || this._getCanvasCenterWorld();
    const _0x5b6a24 = findAvailablePosition(_0x4f7f70 || a969_0xe55b37.getState().nodes, _0x481bb3.x - _0xccc6ad / 2 + index * 24, _0x481bb3.y - _0x1bbe98 / 2 + index * 24, _0xccc6ad, _0x1bbe98, 24, "right");
    const _0x1f4a79 = JSON.parse(JSON.stringify(_0x50e0dd));
    _0x1f4a79.id = generateId(_0x1b1a5c);
    _0x1f4a79.type = _0x1b1a5c;
    _0x1f4a79.x = _0x5b6a24.x;
    _0x1f4a79.y = _0x5b6a24.y;
    return _0x1f4a79;
  }
  restoreRecordsToCanvas(_0x11cf3d) {
    const _0x55bb5b = (Array.isArray(_0x11cf3d) ? _0x11cf3d : []).filter(isFileManagerActionableRecord);
    if (_0x55bb5b.length === 0) {
      return;
    }
    const _0xfe0f16 = this._getCanvasCenterWorld();
    const _0x5db06b = {
      ...(a969_0xe55b37.getState().nodes || {})
    };
    const _0x551b90 = [];
    _0x55bb5b.forEach((_0x494aab, _0x430aa3) => {
      const _0xe09808 = this._buildCanvasNodeFromRecord(_0x494aab, {
        center: _0xfe0f16,
        occupiedNodes: _0x5db06b,
        index: _0x430aa3
      });
      if (!_0xe09808) {
        return;
      }
      _0x5db06b[_0xe09808.id] = _0xe09808;
      _0x551b90.push(_0xe09808);
    });
    if (_0x551b90.length === 0) {
      return;
    }
    a969_0xe55b37.batch(() => {
      _0x551b90.forEach(_0x25a9f5 => a969_0xe55b37.addNode(_0x25a9f5));
      a969_0xe55b37.setSelectedNodes(_0x551b90.map(_0x51e162 => _0x51e162.id));
    });
    const _0x370761 = _0x551b90.length > 1 ? fileManagerText("toasts.addedMany", {
      count: _0x551b90.length
    }) : this._activeSource === "output" ? fileManagerText("toasts.addedOutput") : fileManagerText("toasts.addedHistory", {
      label: getMediaLabel(getRecordMediaKind(_0x55bb5b[0]))
    });
    window.showToast?.(_0x370761, "success");
  }
  _openRecordPreview(_0x4a4e01) {
    if (!isFileManagerActionableRecord(_0x4a4e01)) {
      return;
    }
    const _0x2964f0 = getRecordMediaKind(_0x4a4e01);
    const _0x1c69d8 = resolveMediaSrc(_0x4a4e01);
    if (_0x2964f0 === "image") {
      const _0x5e950d = _0x1c69d8 || resolveThumbSrc(_0x4a4e01);
      if (_0x5e950d) {
        openImagePreview(_0x5e950d, {
          sidebarSubmenuOwner: FILE_MANAGER_SIDEBAR_KEY
        });
      }
      return;
    }
    if (_0x2964f0 === "video" && _0x1c69d8) {
      openVideoPreview(_0x1c69d8, {
        sidebarSubmenuOwner: FILE_MANAGER_SIDEBAR_KEY
      });
    }
  }
  async _showRecordInFolder(_0x2a1d39) {
    const _0x589f5e = resolveRecordLocalPath(_0x2a1d39);
    if (!canShowItemInFolder(_0x589f5e)) {
      return;
    }
    try {
      await showItemInFolder(_0x589f5e);
    } catch (_0x1a4173) {
      console.warn("[GenerationHistoryFileManager] 打开资源管理器失败:", _0x1a4173);
      window.showToast?.(fileManagerText("toasts.revealFailed"), "error");
    }
  }
  _showDeleteRecordsConfirm(_0x457859) {
    if (typeof document === "undefined" || !document.body) {
      return Promise.resolve(false);
    }
    document.getElementById("file-manager-delete-confirm-overlay")?.remove();
    return new Promise(_0x4b7e0c => {
      const _0x35a7f8 = document.createElement("div");
      _0x35a7f8.id = "file-manager-delete-confirm-overlay";
      _0x35a7f8.className = "custom-confirm-overlay";
      const _0x501f00 = document.createElement("div");
      _0x501f00.className = "custom-confirm-box";
      _0x501f00.setAttribute("role", "dialog");
      _0x501f00.setAttribute("aria-modal", "true");
      _0x501f00.setAttribute("aria-label", fileManagerText("deleteConfirm.ariaLabel"));
      const _0x56fcdc = document.createElement("div");
      _0x56fcdc.className = "confirm-title";
      _0x56fcdc.textContent = fileManagerText("deleteConfirm.title");
      const _0x71c33a = document.createElement("div");
      _0x71c33a.className = "confirm-msg";
      _0x71c33a.textContent = _0x457859 > 1 ? fileManagerText("deleteConfirm.messageMany", {
        count: _0x457859
      }) : fileManagerText("deleteConfirm.messageOne");
      const _0x344d91 = document.createElement("div");
      _0x344d91.className = "confirm-btns";
      const _0x2f82e7 = document.createElement("button");
      _0x2f82e7.type = "button";
      _0x2f82e7.className = "confirm-btn confirm-cancel";
      _0x2f82e7.textContent = fileManagerText("deleteConfirm.cancel");
      const _0x2d4326 = document.createElement("button");
      _0x2d4326.type = "button";
      _0x2d4326.className = "confirm-btn confirm-ok";
      _0x2d4326.textContent = fileManagerText("deleteConfirm.delete");
      _0x344d91.appendChild(_0x2f82e7);
      _0x344d91.appendChild(_0x2d4326);
      _0x501f00.appendChild(_0x56fcdc);
      _0x501f00.appendChild(_0x71c33a);
      _0x501f00.appendChild(_0x344d91);
      _0x35a7f8.appendChild(_0x501f00);
      document.body.appendChild(_0x35a7f8);
      let _0x2a95e9 = false;
      const _0x1ae346 = _0x1ce364 => {
        if (_0x2a95e9) {
          return;
        }
        _0x2a95e9 = true;
        document.removeEventListener("keydown", _0x391fe2, true);
        _0x35a7f8.remove();
        _0x4b7e0c(_0x1ce364);
      };
      const _0x391fe2 = _0x437e65 => {
        if (_0x437e65.key === "Escape") {
          _0x437e65.preventDefault();
          _0x1ae346(false);
          return;
        }
        if (_0x437e65.key === "Enter" && !_0x437e65.isComposing) {
          _0x437e65.preventDefault();
          _0x1ae346(true);
        }
      };
      _0x35a7f8.addEventListener("click", _0x4d3e3d => {
        if (_0x4d3e3d.target === _0x35a7f8) {
          _0x1ae346(false);
        }
      });
      _0x2f82e7.addEventListener("click", () => _0x1ae346(false));
      _0x2d4326.addEventListener("click", () => _0x1ae346(true));
      document.addEventListener("keydown", _0x391fe2, true);
      _0x2f82e7.focus?.();
    });
  }
  async _deleteRecords(_0x10203b) {
    const _0x251abd = (Array.isArray(_0x10203b) ? _0x10203b : []).filter(isFileManagerActionableRecord);
    if (_0x251abd.length === 0) {
      return;
    }
    const _0x4358ad = await this._showDeleteRecordsConfirm(_0x251abd.length);
    if (!_0x4358ad) {
      return;
    }
    try {
      if (this._activeSource === "output") {
        const _0x164547 = _0x251abd.map(resolveRecordLocalPath).filter(Boolean);
        if (_0x164547.length === 0) {
          return;
        }
        await deleteOutputFilesFromServer({
          localPaths: _0x164547
        });
        const _0x57e5a6 = new Set(_0x164547.map(_0x398bdd => normalizeLocalPath(_0x398bdd)));
        this.outputItems = (Array.isArray(this.outputItems) ? this.outputItems : []).filter(_0x2eb224 => !_0x57e5a6.has(normalizeLocalPath(_0x2eb224?.localPath)));
      } else {
        const _0x5bea36 = _0x251abd.map(_0x5edcfc => String(_0x5edcfc?.id || "")).filter(Boolean);
        const _0x277a4e = await Promise.all(_0x5bea36.map(_0x52886c => deleteAssetFromServer(_0x52886c)));
        if (_0x277a4e.some(_0x214ae6 => _0x214ae6 === false)) {
          throw new Error("delete asset failed");
        }
        const _0x74f413 = new Set(_0x5bea36);
        this.records = (Array.isArray(this.records) ? this.records : []).filter(_0x11acfa => !_0x74f413.has(String(_0x11acfa?.id || "")));
        this._totalRecords = Math.max(0, Number(this._totalRecords || 0) - _0x5bea36.length);
      }
      this._selectedRecordIds.clear();
      if (this._isOpen()) {
        this.render();
      }
      window.showToast?.(_0x251abd.length > 1 ? fileManagerText("toasts.deletedMany") : fileManagerText("toasts.deletedOne"), "success");
    } catch (_0x15159e) {
      console.error("[GenerationHistoryFileManager] 删除文件失败:", _0x15159e);
      window.showToast?.(fileManagerText("toasts.deleteFailed"), "error");
    }
  }
  restoreRecordToCanvas(_0x13ea43) {
    const _0x2c1107 = this._activeSource === "output" ? this._visibleOutputRecords().find(_0x4ed8fd => String(_0x4ed8fd?.id || "") === String(_0x13ea43 || "")) : this.records.find(_0x44d0bb => String(_0x44d0bb?.id || "") === String(_0x13ea43 || ""));
    this.restoreRecordsToCanvas(_0x2c1107 ? [_0x2c1107] : []);
  }
}
export const generationHistoryFileManager = new GenerationHistoryFileManager();