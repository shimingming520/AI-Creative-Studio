import { clearRendererCache } from "../core/renderer.js";
import { warmupCanvasVisibleMedia } from "../core/canvasMediaWarmup.js";
import { getCanvasMediaSchedulerStats } from "./canvasMediaScheduler.js";
import { commit, resetHistory } from "./history.js";
import a949_0x297288, { createStore } from "../core/stores/appStore.js";
import { isGenerationTaskTerminalStatus } from "../core/generationTaskLifecycle.js";
import { handoffActiveGenerationTasks, hasActiveGenerationTasksForStore, restoreActiveGenerationTasks } from "../core/generationTaskRuntime.js";
import { startVideoThumbBackfill } from "./videoThumbBackfill.js";
import { sanitizeMultiCanvasDataForPersistence } from "../utils/thumbnailPersistence.js";
import { createStableSignature } from "../utils/stableSignature.js";
import { flushAllPendingPromptHtmlCommits } from "./nodePromptShared.js";
import { captureCanvasVisualSnapshot, captureCanvasVisualSnapshotFromElectron, hideCanvasVisualSnapshotOverlay, normalizeCanvasVisualSnapshot } from "./canvasVisualSnapshot.js";
import { t } from "../i18n/index.js";
import { desktopBridge } from "../services/desktopBridge.js";
import { saveTextDownload } from "../services/downloadSaveService.js";
function canvasTabsText(_0x542d15, _0x27a745 = {}) {
  return t("canvasTabs." + _0x542d15, _0x27a745);
}
function markPerf(_0x3e654a) {
  if (typeof performance?.mark !== "function") {
    return;
  }
  performance.mark(_0x3e654a);
}
function measurePerf(_0x523317, _0x54b6b9, _0x2cd6b1) {
  if (typeof performance?.measure !== "function") {
    return;
  }
  try {
    performance.measure(_0x523317, _0x54b6b9, _0x2cd6b1);
  } catch {}
}
const CANVAS_MEDIA_WARMUP_OPEN_DELAY_MS = 350;
const CANVAS_MEDIA_WARMUP_OPEN_MAX_JOBS = 96;
const CANVAS_MEDIA_WARMUP_SNAPSHOT_MAX_JOBS = 48;
const VISUAL_SNAPSHOT_BACKFILL_DELAYS_MS = [1200, 3000, 7000, 14000, 22000];
const DENSE_VISUAL_SNAPSHOT_NODE_COUNT = 120;
const DENSE_VISUAL_SNAPSHOT_BACKFILL_DELAYS_MS = [9000, 18000, 30000, 45000];
const VISUAL_SNAPSHOT_BACKFILL_RETRY_MS = 2500;
const VISUAL_SNAPSHOT_INTERACTION_SETTLE_MS = 500;
function countCanvasNodes(_0xdf8ccc) {
  if (Array.isArray(_0xdf8ccc)) {
    return _0xdf8ccc.length;
  }
  if (_0xdf8ccc && typeof _0xdf8ccc === "object") {
    return Object.keys(_0xdf8ccc).length;
  }
  return 0;
}
function isChromeShellRuntime() {
  const _0xdf05bd = String(globalThis.location?.search || globalThis.window?.location?.search || "");
  return new URLSearchParams(_0xdf05bd).get("aicRuntime") === "chrome-shell";
}
function createEmptyCanvasSnapshot() {
  return {
    nodes: [],
    edges: [],
    viewport: {
      x: 0,
      y: 0,
      zoom: 1.1
    },
    assets: [],
    storyboard3dProjects: [],
    _persistRevHint: 0
  };
}
function cloneMultiDataSnapshot(_0x93e43) {
  if (typeof structuredClone === "function") {
    try {
      return structuredClone(_0x93e43);
    } catch {}
  }
  try {
    return JSON.parse(JSON.stringify(_0x93e43));
  } catch {
    return {
      canvases: [],
      activeCanvasId: null
    };
  }
}
function isRecoverableTaskStatus(_0x1d1862) {
  const _0x755c61 = String(_0x1d1862 || "").trim();
  return !_0x755c61 || !isGenerationTaskTerminalStatus(_0x755c61);
}
function markRecoveringGenerationNode(_0x4dcff7) {
  if (!_0x4dcff7 || typeof _0x4dcff7 !== "object") {
    return _0x4dcff7;
  }
  if (!_0x4dcff7.generationStartTime || _0x4dcff7.generationDuration != null) {
    return _0x4dcff7;
  }
  const _0x9d21fa = {
    ..._0x4dcff7
  };
  let _0x35cc2e = false;
  if (String(_0x9d21fa.rhTaskId || "").trim() && isRecoverableTaskStatus(_0x9d21fa.rhTaskStatus)) {
    _0x9d21fa.rhTaskRecovering = true;
    _0x35cc2e = true;
  }
  if (String(_0x9d21fa.dreaminaSubmitId || "").trim() && isRecoverableTaskStatus(_0x9d21fa.dreaminaTaskStatus) && isRecoverableTaskStatus(_0x9d21fa.dreaminaTaskPhase)) {
    _0x9d21fa.dreaminaTaskRecovering = true;
    _0x35cc2e = true;
  }
  if (String(_0x9d21fa.asyncTaskId || "").trim() && isRecoverableTaskStatus(_0x9d21fa.asyncTaskStatus)) {
    _0x9d21fa.asyncTaskRecovering = true;
    _0x35cc2e = true;
  }
  if (!_0x35cc2e) {
    return _0x4dcff7;
  }
  _0x9d21fa.isGenerating = true;
  _0x9d21fa.jobStatus = isRecoverableTaskStatus(_0x9d21fa.jobStatus) ? "running" : _0x9d21fa.jobStatus;
  _0x9d21fa.generationDuration = null;
  return _0x9d21fa;
}
function markRecoveringGenerationSnapshot(_0x5f06c6) {
  if (!_0x5f06c6 || typeof _0x5f06c6 !== "object") {
    return _0x5f06c6;
  }
  if (Array.isArray(_0x5f06c6.nodes)) {
    return {
      ..._0x5f06c6,
      nodes: _0x5f06c6.nodes.map(_0x3878df => markRecoveringGenerationNode(_0x3878df))
    };
  }
  if (_0x5f06c6.nodes && typeof _0x5f06c6.nodes === "object") {
    return {
      ..._0x5f06c6,
      nodes: Object.fromEntries(Object.entries(_0x5f06c6.nodes).map(([_0x43c376, _0x237c4f]) => [_0x43c376, markRecoveringGenerationNode(_0x237c4f)]))
    };
  }
  return _0x5f06c6;
}
function getCanvasNodesList(_0x4a330c = {}) {
  const _0x5bb4e7 = _0x4a330c?.nodes;
  if (Array.isArray(_0x5bb4e7)) {
    return _0x5bb4e7;
  }
  if (_0x5bb4e7 && typeof _0x5bb4e7 === "object") {
    return Object.values(_0x5bb4e7);
  }
  return [];
}
function hasLiveGenerationNode(_0x255446 = {}) {
  if (!_0x255446 || typeof _0x255446 !== "object") {
    return false;
  }
  if (_0x255446.isGenerating !== true || _0x255446.generationDuration != null) {
    return false;
  }
  const _0x9d39e7 = [_0x255446.jobStatus, _0x255446.rhTaskStatus, _0x255446.dreaminaTaskStatus, _0x255446.dreaminaTaskPhase, _0x255446.asyncTaskStatus, _0x255446.mediaTaskStatus];
  return !_0x9d39e7.some(_0x109048 => {
    const _0x19a2c7 = String(_0x109048 || "").trim().toLowerCase();
    if (!_0x19a2c7 || _0x19a2c7 === "idle") {
      return false;
    }
    return isGenerationTaskTerminalStatus(_0x19a2c7);
  });
}
function canvasHasLiveGeneration(_0x4b8b6f = {}) {
  return getCanvasNodesList(_0x4b8b6f).some(_0x19f4c4 => hasLiveGenerationNode(_0x19f4c4));
}
export function buildTabsRenderSignature(_0x2cbdad = [], _0xc36c62 = null) {
  return (_0xc36c62 || "") + "::" + (Array.isArray(_0x2cbdad) ? _0x2cbdad : []).map(_0x18f7e4 => (_0x18f7e4?.id || "") + ":" + (_0x18f7e4?.name || "")).join("|");
}
export function getCanvasTabScrollMetrics(_0x170359 = {}) {
  const _0x3f5c87 = Math.max(0, Number(_0x170359.scrollWidth) || 0);
  const _0x54348f = Math.max(0, Number(_0x170359.clientWidth) || Number(_0x170359.getBoundingClientRect?.().width) || Number(_0x170359.offsetWidth) || 0);
  const _0x31a2f7 = Math.max(0, _0x3f5c87 - _0x54348f);
  const _0x253275 = Math.min(_0x31a2f7, Math.max(0, Number(_0x170359.scrollLeft) || 0));
  return {
    clientWidth: _0x54348f,
    maxScrollLeft: _0x31a2f7,
    scrollLeft: _0x253275,
    scrollWidth: _0x3f5c87
  };
}
export function scrollCanvasTabsWithWheel(_0x1d3bb1, _0x15c495 = {}) {
  if (!_0x1d3bb1) {
    return false;
  }
  const {
    clientWidth: _0x3164fb,
    maxScrollLeft: _0x380104,
    scrollLeft: _0x460328
  } = getCanvasTabScrollMetrics(_0x1d3bb1);
  if (_0x380104 <= 1) {
    return false;
  }
  const _0x18ebcc = Number(_0x15c495.deltaX) || 0;
  const _0x8c3d0e = Number(_0x15c495.deltaY) || 0;
  const _0x3c4d43 = Math.abs(_0x18ebcc) > Math.abs(_0x8c3d0e) && _0x18ebcc !== 0 ? _0x18ebcc : _0x8c3d0e;
  if (!_0x3c4d43) {
    return false;
  }
  const _0xd6c546 = Number(_0x15c495.deltaMode) || 0;
  const _0x106c22 = _0xd6c546 === 1 ? 16 : _0xd6c546 === 2 ? Math.max(_0x3164fb, 1) : 1;
  const _0x3e8b55 = Math.min(_0x380104, Math.max(0, _0x460328 + _0x3c4d43 * _0x106c22));
  if (_0x3e8b55 === _0x460328) {
    return false;
  }
  _0x1d3bb1.scrollLeft = _0x3e8b55;
  _0x15c495.preventDefault?.();
  return true;
}
function normalizeCanvasProjectContext(_0x2f9f7f = {}, _0x675254 = {}) {
  const _0x15acf1 = String(_0x675254.canvasId || "").trim();
  const _0x5d3904 = String(_0x2f9f7f.projectName || _0x675254.projectName || "").trim();
  return {
    projectId: String(_0x2f9f7f.projectId || _0x675254.projectId || _0x15acf1).trim(),
    filename: String(_0x2f9f7f.filename || "").trim(),
    projectName: _0x5d3904,
    recentId: String(_0x2f9f7f.recentId || "").trim(),
    displayPath: String(_0x2f9f7f.displayPath || "").trim(),
    lastModified: Math.max(0, Number(_0x2f9f7f.lastModified || 0) || 0),
    isTemporary: _0x2f9f7f.isTemporary === true,
    workspaceProjectScoped: _0x2f9f7f.workspaceProjectScoped !== false
  };
}
function captureCurrentProjectContext(_0x2499d9 = {}) {
  if (typeof window === "undefined") {
    return normalizeCanvasProjectContext({}, {
      canvasId: _0x2499d9?.id,
      projectName: _0x2499d9?.name
    });
  }
  return normalizeCanvasProjectContext({
    projectId: window.currentProjectId,
    filename: window._v2CurrentFile,
    projectName: globalThis.document?.getElementById?.("projectNameText")?.textContent || _0x2499d9?.name,
    recentId: window._v2CurrentRecentProjectId,
    displayPath: window._v2CurrentProjectDisplayPath,
    lastModified: window._v2CurrentProjectLastModified,
    workspaceProjectScoped: window._v2WorkspaceProjectScoped !== false
  }, {
    canvasId: _0x2499d9?.id,
    projectName: _0x2499d9?.name
  });
}
const CanvasTabManager = {
  _canvases: [],
  _activeId: null,
  _projectContextByCanvasId: new Map(),
  _lastPersistRevByCanvas: new Map(),
  _savedSignatureByCanvas: new Map(),
  _lastTabsRenderSignature: "",
  _tabContainerBound: false,
  _visualSnapshotBackfillTimers: [],
  _visualSnapshotIdleRetryTimer: null,
  _visualSnapshotIdleRetryCanvasId: null,
  _visualSnapshotBackfillCapturePromise: null,
  _visualSnapshotBackfillGeneration: 0,
  _visualSnapshotInteractionGuardDocument: null,
  _visualSnapshotInteractionGuardHandlers: null,
  _visualSnapshotActivePointers: new Set(),
  _visualSnapshotSettleUntil: 0,
  _mediaWarmupTimer: null,
  _tabOverflowResizeObserver: null,
  _taskSafeCanvasTransitionPromise: null,
  _backgroundTaskStores: new Map(),
  _showTaskTransitionBlocked(_0x480c1b, _0x138a12 = "switchBlockedByTasks") {
    const _0x345897 = Math.max(1, Number(_0x480c1b?.blockers?.length || _0x480c1b?.activeCount || 0));
    window.showToast?.(canvasTabsText(_0x138a12, {
      count: _0x345897
    }), "warn");
  },
  async _runTaskSafeCanvasTransition(_0x773c50) {
    if (this._taskSafeCanvasTransitionPromise) {
      return this._taskSafeCanvasTransitionPromise;
    }
    const _0x4be5e9 = (async () => {
      return _0x773c50();
    })();
    this._taskSafeCanvasTransitionPromise = _0x4be5e9;
    try {
      return await _0x4be5e9;
    } finally {
      if (this._taskSafeCanvasTransitionPromise === _0x4be5e9) {
        this._taskSafeCanvasTransitionPromise = null;
      }
    }
  },
  _getStorePersistRev() {
    return Number(a949_0x297288.getStateRaw()?._persistRev || 0);
  },
  _rememberCanvasPersistRev(_0xc7894a = this._activeId) {
    if (!_0xc7894a) {
      return;
    }
    this._lastPersistRevByCanvas.set(_0xc7894a, this._getStorePersistRev());
  },
  _scheduleWorkspaceCacheSave() {
    return window._triggerLocalCacheSave?.();
  },
  _syncBackgroundTaskCanvas(_0x30ef89, _0x55c0c4, {
    persist = true
  } = {}) {
    const _0x14599a = this._canvases.findIndex(_0x363e11 => _0x363e11.id === _0x30ef89);
    if (_0x14599a === -1 || !_0x55c0c4) {
      return false;
    }
    const _0x5b5069 = _0x55c0c4.serialize();
    const _0x52acae = Number(_0x55c0c4.getStateRaw()?._persistRev || 0);
    const _0x2cac89 = this._buildCanvasRecord(this._canvases[_0x14599a], _0x5b5069);
    _0x2cac89._persistRevHint = _0x52acae;
    this._canvases[_0x14599a] = _0x2cac89;
    if (persist) {
      this._scheduleWorkspaceCacheSave();
      this._notifyDirtyStateChanged();
    }
    return true;
  },
  _handoffActiveCanvasTasks(_0x40e3d1 = this._activeId) {
    if (!_0x40e3d1 || !hasActiveGenerationTasksForStore(a949_0x297288)) {
      return {
        ok: true,
        movedCount: 0,
        taskScopeId: _0x40e3d1 || ""
      };
    }
    let _0xa23adf = null;
    let _0x444ef9 = null;
    try {
      _0xa23adf = createStore();
      _0xa23adf.hydrateTrustedSnapshot(a949_0x297288.serialize(), {
        preserveLiveGeneration: true
      });
      _0x444ef9 = handoffActiveGenerationTasks({
        sourceStore: a949_0x297288,
        targetStore: _0xa23adf,
        taskScopeId: _0x40e3d1,
        mirrorTaskState: () => this._syncBackgroundTaskCanvas(_0x40e3d1, _0xa23adf, {
          persist: true
        })
      });
      if (_0x444ef9.movedCount > 0) {
        this._backgroundTaskStores.set(_0x40e3d1, _0xa23adf);
        this._syncBackgroundTaskCanvas(_0x40e3d1, _0xa23adf, {
          persist: false
        });
      }
      return _0x444ef9;
    } catch (_0x4db8e1) {
      restoreActiveGenerationTasks({
        taskScopeId: _0x40e3d1,
        targetStore: a949_0x297288
      });
      this._backgroundTaskStores.delete(_0x40e3d1);
      console.error("[CanvasTabManager] Failed to hand off active generation tasks:", _0x4db8e1);
      return {
        ok: false,
        movedCount: 0,
        activeCount: Number(_0x444ef9?.movedCount || 1),
        taskScopeId: _0x40e3d1,
        blockers: [{
          reason: "background-store-handoff-failed",
          error: _0x4db8e1
        }]
      };
    }
  },
  _restoreActiveCanvasTasks(_0xab77ad = this._activeId) {
    const _0x2015a3 = restoreActiveGenerationTasks({
      taskScopeId: _0xab77ad,
      targetStore: a949_0x297288
    });
    this._backgroundTaskStores.delete(_0xab77ad);
    return _0x2015a3;
  },
  _scheduleWorkspaceMetaCacheSave() {
    return window._triggerLocalCacheMetaSave?.() ?? window._triggerLocalCacheSave?.();
  },
  _markCanvasMetaDirty() {
    return this._scheduleWorkspaceMetaCacheSave();
  },
  _notifyDirtyStateChanged() {
    if (typeof window === "undefined" || typeof window.dispatchEvent !== "function") {
      return;
    }
    if (typeof CustomEvent === "function") {
      window.dispatchEvent(new CustomEvent("aicanvas:dirty-state-changed"));
      return;
    }
    if (typeof Event === "function") {
      window.dispatchEvent(new Event("aicanvas:dirty-state-changed"));
    }
  },
  _notifyActiveCanvasChanged(_0x58551e = "switch") {
    const _0x1b58da = this._activeId || "";
    if (!_0x1b58da || typeof window === "undefined" || typeof window.dispatchEvent !== "function") {
      return;
    }
    const _0x344de2 = {
      canvasId: _0x1b58da,
      reason: _0x58551e,
      projectContext: this.getCanvasProjectContext(_0x1b58da)
    };
    if (typeof CustomEvent === "function") {
      window.dispatchEvent(new CustomEvent("aicanvas:active-canvas-changed", {
        detail: _0x344de2
      }));
      return;
    }
    if (typeof Event === "function") {
      const _0x2f8125 = new Event("aicanvas:active-canvas-changed");
      _0x2f8125.detail = _0x344de2;
      window.dispatchEvent(_0x2f8125);
    }
  },
  _applyActiveCanvasProjectContext() {
    if (typeof window === "undefined") {
      return false;
    }
    const _0x45b309 = this.getCanvasProjectContext();
    if (!_0x45b309) {
      return false;
    }
    window.currentProjectId = _0x45b309.projectId;
    window._v2CurrentFile = _0x45b309.filename;
    window._v2CurrentRecentProjectId = _0x45b309.recentId;
    window._v2CurrentProjectDisplayPath = _0x45b309.displayPath;
    window._v2CurrentProjectLastModified = _0x45b309.lastModified;
    window._v2WorkspaceProjectScoped = _0x45b309.workspaceProjectScoped;
    const _0x3eec0c = globalThis.document?.getElementById?.("projectNameText");
    if (_0x3eec0c) {
      _0x3eec0c.textContent = _0x45b309.projectName || this._canvases.find(_0x507a67 => _0x507a67?.id === this._activeId)?.name || "";
    }
    return true;
  },
  setCanvasProjectContext(_0xf5f7d6, _0x177958 = {}, {
    persist = true
  } = {}) {
    const _0x35138d = this._canvases.find(_0x7cfced => _0x7cfced?.id === _0xf5f7d6);
    if (!_0x35138d) {
      return null;
    }
    const _0x19a5aa = normalizeCanvasProjectContext(_0x177958, {
      canvasId: _0xf5f7d6,
      projectName: _0x35138d.name
    });
    this._projectContextByCanvasId.set(_0xf5f7d6, _0x19a5aa);
    if (_0xf5f7d6 === this._activeId) {
      this._applyActiveCanvasProjectContext();
      this._notifyActiveCanvasChanged("context");
    }
    if (persist) {
      this._markCanvasMetaDirty();
    }
    return {
      ..._0x19a5aa
    };
  },
  getCanvasProjectContext(_0x7ec586 = this._activeId) {
    const _0x2af458 = this._projectContextByCanvasId.get(_0x7ec586);
    if (_0x2af458) {
      return {
        ..._0x2af458
      };
    } else {
      return null;
    }
  },
  findCanvasIdByProjectIdentity(_0xbdd2fa = {}) {
    const _0x4b4cbe = (_0x200c8d, {
      path = false
    } = {}) => {
      const _0x385a3d = String(_0x200c8d || "").trim().toLowerCase();
      if (path) {
        return _0x385a3d.replace(/\\/g, "/");
      } else {
        return _0x385a3d;
      }
    };
    const _0x2c8e5f = _0x4b4cbe(_0xbdd2fa.projectName);
    const _0x9a2b52 = [["recentId", _0x4b4cbe(_0xbdd2fa.recentId)], ["displayPath", _0x4b4cbe(_0xbdd2fa.displayPath, {
      path: true
    })], ["filename", _0x4b4cbe(_0xbdd2fa.filename, {
      path: true
    })], ["projectId", _0x4b4cbe(_0xbdd2fa.projectId)]].filter(([, _0x2843e4]) => _0x2843e4);
    for (const [_0x57bf68, _0x146b1b] of _0x9a2b52) {
      const _0x77f630 = [];
      for (const _0x5e0353 of this._canvases) {
        const _0x50fe79 = this._projectContextByCanvasId.get(_0x5e0353?.id);
        if (!_0x50fe79) {
          continue;
        }
        const _0x19835b = _0x4b4cbe(_0x50fe79[_0x57bf68], {
          path: _0x57bf68 === "displayPath" || _0x57bf68 === "filename"
        });
        if (_0x19835b === _0x146b1b) {
          _0x77f630.push({
            canvas: _0x5e0353,
            context: _0x50fe79
          });
        }
      }
      if (_0x77f630.length === 0) {
        continue;
      }
      if (_0x2c8e5f) {
        const _0x36e9ad = _0x77f630.find(({
          canvas: _0x48fb80
        }) => _0x4b4cbe(_0x48fb80?.name) === _0x2c8e5f) || _0x77f630.find(({
          context: _0x5df15d
        }) => _0x4b4cbe(_0x5df15d?.projectName) === _0x2c8e5f);
        if (_0x36e9ad) {
          return _0x36e9ad.canvas.id;
        }
      }
      return _0x77f630[0].canvas.id;
    }
    if (_0x2c8e5f) {
      const _0x17c50d = this._canvases.filter(_0x410380 => _0x4b4cbe(_0x410380?.name) === _0x2c8e5f);
      if (_0x17c50d.length === 1) {
        return _0x17c50d[0].id;
      }
    }
    return "";
  },
  _getTabsRenderSignature() {
    return buildTabsRenderSignature(this._canvases, this._activeId);
  },
  _buildCanvasStructureDigest(_0x14da1e, _0x502a0a) {
    const _0x2a5331 = Array.isArray(_0x14da1e) ? _0x14da1e : _0x14da1e && typeof _0x14da1e === "object" ? Object.values(_0x14da1e) : [];
    let _0xd263a9 = "" + _0x2a5331.length;
    for (const _0x20970 of _0x2a5331) {
      if (!_0x20970 || typeof _0x20970 !== "object") {
        continue;
      }
      _0xd263a9 += "|";
      for (const _0x3f0d43 of _0x502a0a) {
        _0xd263a9 += String(_0x20970[_0x3f0d43] ?? "") + ",";
      }
    }
    return _0xd263a9;
  },
  _buildCanvasSavedSignature(_0x397e52) {
    const _0x37fb1f = _0x397e52?.viewport && typeof _0x397e52.viewport === "object" ? _0x397e52.viewport : {
      x: 0,
      y: 0,
      zoom: 1.1
    };
    const _0x3f8515 = Number.isFinite(_0x397e52?._persistRevHint) ? Number(_0x397e52._persistRevHint) : 0;
    return createStableSignature({
      id: _0x397e52?.id ?? null,
      name: _0x397e52?.name ?? "未命名画布",
      persistRevHint: _0x3f8515,
      viewport: {
        x: Number(_0x37fb1f.x) || 0,
        y: Number(_0x37fb1f.y) || 0,
        zoom: Number(_0x37fb1f.zoom) || 1.1
      },
      nodes: this._buildCanvasStructureDigest(_0x397e52?.nodes, ["id", "type", "x", "y", "width", "height", "parentId"]),
      edges: this._buildCanvasStructureDigest(_0x397e52?.edges, ["id", "sourceId", "targetId"]),
      assets: this._buildCanvasStructureDigest(_0x397e52?.assets, ["id", "type", "localPath"]),
      storyboard3dProjects: this._buildCanvasStructureDigest(_0x397e52?.storyboard3dProjects, ["id", "name", "updatedAt"])
    });
  },
  _resetSavedCanvasSignatures({
    markClean = true
  } = {}) {
    this._savedSignatureByCanvas = new Map();
    if (!markClean) {
      return;
    }
    this._canvases.forEach(_0xa6b21 => {
      if (!_0xa6b21?.id) {
        return;
      }
      this._savedSignatureByCanvas.set(_0xa6b21.id, this._buildCanvasSavedSignature(_0xa6b21));
    });
  },
  _removeTabContextMenu() {
    const _0x312900 = document.getElementById("tab-context-menu");
    if (_0x312900) {
      _0x312900.remove();
    }
  },
  _startTabRename(_0x5a4b45) {
    if (!_0x5a4b45) {
      return;
    }
    _0x5a4b45.contentEditable = "true";
    _0x5a4b45.focus();
    const _0x1cde93 = document.createRange();
    _0x1cde93.selectNodeContents(_0x5a4b45);
    const _0x1200af = window.getSelection?.();
    if (!_0x1200af) {
      return;
    }
    _0x1200af.removeAllRanges();
    _0x1200af.addRange(_0x1cde93);
  },
  _commitTabRename(_0x370bed, {
    deferRender = false
  } = {}) {
    if (!_0x370bed) {
      return;
    }
    const _0x4e091d = _0x370bed.closest(".canvas-tab");
    const _0x13c80e = _0x4e091d?.dataset?.id;
    if (!_0x13c80e) {
      return;
    }
    const _0xe05a6f = this._canvases.find(_0x236f12 => _0x236f12.id === _0x13c80e);
    if (!_0xe05a6f) {
      return;
    }
    const _0x19fee4 = _0xe05a6f.name;
    const _0x13dcbd = String(_0x370bed.textContent || "").trim();
    _0x370bed.contentEditable = "false";
    this.renameCanvas(_0x13c80e, _0x13dcbd);
    _0x370bed.textContent = this._canvases.find(_0x3c6aaa => _0x3c6aaa.id === _0x13c80e)?.name || _0x19fee4;
    if (deferRender) {
      window.setTimeout(() => this.renderTabs(), 0);
      return;
    }
    this.renderTabs();
  },
  _bindTabContainerEvents(_0x18a52a) {
    if (this._tabContainerBound || !_0x18a52a) {
      return;
    }
    this._tabContainerBound = true;
    let _0x354adb = "";
    let _0xfca420 = 0;
    const _0x59f5e0 = _0x2943a8 => {
      const _0x1c5d67 = _0x2943a8.target.closest(".canvas-tab");
      if (!_0x1c5d67 || !_0x18a52a.contains(_0x1c5d67)) {
        return "";
      }
      return _0x1c5d67.dataset.id || "";
    };
    const _0x4efaf1 = _0x2e4595 => {
      if (_0x2e4595.button !== 1) {
        return false;
      }
      const _0x474bea = _0x59f5e0(_0x2e4595);
      if (!_0x474bea) {
        return false;
      }
      _0x2e4595.preventDefault();
      _0x2e4595.stopPropagation();
      _0x354adb = _0x474bea;
      _0xfca420 = Date.now();
      this.deleteCanvas(_0x474bea);
      return true;
    };
    _0x18a52a.addEventListener("click", _0x530845 => {
      const _0x2c90eb = _0x530845.target.closest(".canvas-tab");
      if (!_0x2c90eb || !_0x18a52a.contains(_0x2c90eb)) {
        return;
      }
      const _0x150334 = _0x2c90eb.dataset.id;
      if (!_0x150334) {
        return;
      }
      const _0x47f67a = this._canvases.find(_0x10e938 => _0x10e938.id === _0x150334);
      if (!_0x47f67a) {
        return;
      }
      const _0x4a36c5 = _0x530845.target.closest(".canvas-tab-close");
      if (_0x4a36c5) {
        _0x530845.stopPropagation();
        this.deleteCanvas(_0x150334);
        return;
      }
      const _0x426f6f = _0x2c90eb.querySelector(".canvas-tab-name");
      const _0x48198b = _0x150334 === this._activeId;
      if (_0x48198b) {
        if (_0x426f6f?.contentEditable === "true") {
          return;
        }
        this._startTabRename(_0x426f6f);
        return;
      }
      this.switchTo(_0x150334);
    });
    _0x18a52a.addEventListener("pointerdown", _0x4a84e6 => {
      _0x4efaf1(_0x4a84e6);
    });
    _0x18a52a.addEventListener("auxclick", _0x520f60 => {
      if (_0x520f60.button !== 1) {
        return;
      }
      const _0x2e9c40 = _0x59f5e0(_0x520f60);
      if (!_0x2e9c40) {
        return;
      }
      _0x520f60.preventDefault();
      _0x520f60.stopPropagation();
      if (_0x2e9c40 === _0x354adb && Date.now() - _0xfca420 < 800) {
        return;
      }
      _0x354adb = _0x2e9c40;
      _0xfca420 = Date.now();
      this.deleteCanvas(_0x2e9c40);
    });
    _0x18a52a.addEventListener("contextmenu", async _0x290258 => {
      const _0x282321 = _0x290258.target.closest(".canvas-tab");
      if (!_0x282321 || !_0x18a52a.contains(_0x282321)) {
        return;
      }
      const _0x16edcb = _0x282321.dataset.id;
      if (!_0x16edcb) {
        return;
      }
      const _0x3e15f4 = this._canvases.find(_0xec14c6 => _0xec14c6.id === _0x16edcb);
      if (!_0x3e15f4) {
        return;
      }
      _0x290258.preventDefault();
      _0x290258.stopPropagation();
      const _0x263291 = () => {
        this._showTabContextMenu(_0x3e15f4, {
          clientX: _0x290258.clientX,
          clientY: _0x290258.clientY
        });
      };
      if (_0x16edcb !== this._activeId) {
        await this.switchTo(_0x16edcb);
      }
      _0x263291();
    });
    _0x18a52a.addEventListener("focusout", _0x2a2745 => {
      const _0x589581 = _0x2a2745.target.closest(".canvas-tab-name");
      if (!_0x589581 || !_0x18a52a.contains(_0x589581)) {
        return;
      }
      if (_0x589581.contentEditable !== "true") {
        return;
      }
      this._commitTabRename(_0x589581, {
        deferRender: true
      });
    });
    _0x18a52a.addEventListener("keydown", _0x37b57d => {
      const _0x593fd6 = _0x37b57d.target.closest(".canvas-tab-name");
      if (!_0x593fd6 || !_0x18a52a.contains(_0x593fd6)) {
        return;
      }
      if (_0x593fd6.contentEditable !== "true") {
        return;
      }
      if (_0x37b57d.key === "Enter") {
        _0x37b57d.preventDefault();
        _0x593fd6.blur();
        return;
      }
      if (_0x37b57d.key === "Escape") {
        _0x37b57d.preventDefault();
        const _0x5ed970 = _0x593fd6.closest(".canvas-tab")?.dataset?.id;
        const _0xb24779 = this._canvases.find(_0xb798bc => _0xb798bc.id === _0x5ed970);
        if (_0xb24779) {
          _0x593fd6.textContent = _0xb24779.name;
        }
        _0x593fd6.blur();
      }
    });
    _0x18a52a.addEventListener("scroll", () => this._updateTabScrollHints(_0x18a52a), {
      passive: true
    });
    _0x18a52a.addEventListener("wheel", _0xde5dbe => {
      _0xde5dbe.stopPropagation?.();
      if (scrollCanvasTabsWithWheel(_0x18a52a, _0xde5dbe)) {
        this._updateTabScrollHints(_0x18a52a);
      }
    }, {
      passive: false
    });
    const _0x38a621 = globalThis.ResizeObserver;
    if (typeof _0x38a621 === "function") {
      this._tabOverflowResizeObserver?.disconnect?.();
      this._tabOverflowResizeObserver = new _0x38a621(() => {
        this._updateTabScrollHints(_0x18a52a);
      });
      this._tabOverflowResizeObserver.observe(_0x18a52a);
      const _0x40f5f1 = this._getTabScrollShell(_0x18a52a);
      if (_0x40f5f1 && _0x40f5f1 !== _0x18a52a) {
        this._tabOverflowResizeObserver.observe(_0x40f5f1);
      }
    }
    this._updateTabScrollHints(_0x18a52a);
  },
  _getTabScrollShell(_0x21a2a5) {
    return _0x21a2a5?.closest?.(".canvas-tabs-wrap") || globalThis.document?.getElementById?.("canvasTabsWrap") || null;
  },
  _updateTabScrollHints(_0x57b7bb) {
    const _0x4257de = this._getTabScrollShell(_0x57b7bb);
    if (!_0x4257de?.classList) {
      return;
    }
    const {
      maxScrollLeft: _0x543f87,
      scrollLeft: _0x2ef50e
    } = getCanvasTabScrollMetrics(_0x57b7bb);
    const _0x599487 = _0x543f87 > 1;
    _0x4257de.classList.toggle("has-overflow", _0x599487);
    _0x4257de.classList.toggle("has-left-fade", _0x599487 && _0x2ef50e > 1);
    _0x4257de.classList.toggle("has-right-fade", _0x599487 && _0x2ef50e < _0x543f87 - 1);
  },
  _revealActiveTab(_0x248845) {
    const _0x582177 = _0x248845?.querySelector?.(".canvas-tab.active");
    _0x582177?.scrollIntoView?.({
      behavior: "auto",
      block: "nearest",
      inline: "nearest"
    });
  },
  _showTabContextMenu(_0x3b502f, {
    clientX = 0,
    clientY = 0
  } = {}) {
    if (!_0x3b502f) {
      return;
    }
    this._removeTabContextMenu();
    const _0x2c369b = document.createElement("div");
    _0x2c369b.id = "tab-context-menu";
    _0x2c369b.className = "v2-dropdown-menu open";
    _0x2c369b.style.position = "fixed";
    _0x2c369b.style.left = clientX + "px";
    _0x2c369b.style.top = clientY + "px";
    _0x2c369b.style.zIndex = 9999;
    _0x2c369b.style.minWidth = "120px";
    const _0x243c2f = "http://www.w3.org/2000/svg";
    const _0x11e958 = () => {
      const _0xb0e334 = document.createElementNS(_0x243c2f, "svg");
      _0xb0e334.setAttribute("width", "14");
      _0xb0e334.setAttribute("height", "14");
      _0xb0e334.setAttribute("viewBox", "0 0 24 24");
      _0xb0e334.setAttribute("fill", "none");
      _0xb0e334.setAttribute("stroke", "currentColor");
      _0xb0e334.setAttribute("stroke-width", "2");
      return _0xb0e334;
    };
    const _0x651d3c = (() => {
      const _0x43aca9 = _0x11e958();
      const _0x4057b3 = document.createElementNS(_0x243c2f, "path");
      _0x4057b3.setAttribute("d", "M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z");
      const _0x59a26f = document.createElementNS(_0x243c2f, "polyline");
      _0x59a26f.setAttribute("points", "17 21 17 13 7 13 7 21");
      const _0x11443c = document.createElementNS(_0x243c2f, "polyline");
      _0x11443c.setAttribute("points", "7 3 7 8 15 8");
      _0x43aca9.appendChild(_0x4057b3);
      _0x43aca9.appendChild(_0x59a26f);
      _0x43aca9.appendChild(_0x11443c);
      return _0x43aca9;
    })();
    const _0x3d674b = (() => {
      const _0x1536e6 = _0x11e958();
      const _0x3bb674 = document.createElementNS(_0x243c2f, "path");
      _0x3bb674.setAttribute("d", "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z");
      const _0x11e194 = document.createElementNS(_0x243c2f, "polyline");
      _0x11e194.setAttribute("points", "14 2 14 8 20 8");
      const _0x2c9e7c = document.createElementNS(_0x243c2f, "line");
      _0x2c9e7c.setAttribute("x1", "12");
      _0x2c9e7c.setAttribute("y1", "18");
      _0x2c9e7c.setAttribute("x2", "12");
      _0x2c9e7c.setAttribute("y2", "12");
      const _0x43e340 = document.createElementNS(_0x243c2f, "line");
      _0x43e340.setAttribute("x1", "9");
      _0x43e340.setAttribute("y1", "15");
      _0x43e340.setAttribute("x2", "15");
      _0x43e340.setAttribute("y2", "15");
      _0x1536e6.appendChild(_0x3bb674);
      _0x1536e6.appendChild(_0x11e194);
      _0x1536e6.appendChild(_0x2c9e7c);
      _0x1536e6.appendChild(_0x43e340);
      return _0x1536e6;
    })();
    const _0x4822a9 = (() => {
      const _0xa4ffd9 = _0x11e958();
      const _0x597b5b = document.createElementNS(_0x243c2f, "rect");
      _0x597b5b.setAttribute("x", "3");
      _0x597b5b.setAttribute("y", "5");
      _0x597b5b.setAttribute("width", "18");
      _0x597b5b.setAttribute("height", "14");
      _0x597b5b.setAttribute("rx", "2");
      const _0x17b9af = document.createElementNS(_0x243c2f, "path");
      _0x17b9af.setAttribute("d", "M8 9h8M12 9v6m0 0-3-3m3 3 3-3");
      _0xa4ffd9.appendChild(_0x597b5b);
      _0xa4ffd9.appendChild(_0x17b9af);
      return _0xa4ffd9;
    })();
    const _0x45d0ff = (() => {
      const _0x48375f = _0x11e958();
      const _0x255c81 = document.createElementNS(_0x243c2f, "polyline");
      _0x255c81.setAttribute("points", "3 6 5 6 21 6");
      const _0x3775ea = document.createElementNS(_0x243c2f, "path");
      _0x3775ea.setAttribute("d", "M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2");
      _0x48375f.appendChild(_0x255c81);
      _0x48375f.appendChild(_0x3775ea);
      return _0x48375f;
    })();
    const _0x396179 = (_0x276c49, _0x50ec8f, _0x5c20c6, _0x3e7a15 = false) => {
      const _0x14d421 = document.createElement("div");
      _0x14d421.className = "v2-menu-row";
      if (_0x3e7a15) {
        _0x14d421.style.color = "var(--red)";
      }
      const _0x409cbe = document.createElement("span");
      _0x409cbe.className = "v2-menu-icon";
      _0x409cbe.appendChild(_0x50ec8f.cloneNode(true));
      const _0x5f2c3b = document.createElement("span");
      _0x5f2c3b.className = "v2-menu-text";
      _0x5f2c3b.textContent = _0x276c49;
      _0x14d421.appendChild(_0x409cbe);
      _0x14d421.appendChild(_0x5f2c3b);
      _0x14d421.addEventListener("pointerdown", _0x282d6e => {
        _0x282d6e.stopPropagation();
        _0x2c369b.remove();
        _0x5c20c6();
      });
      _0x14d421.addEventListener("contextmenu", _0x5e1516 => _0x5e1516.preventDefault());
      _0x2c369b.appendChild(_0x14d421);
    };
    _0x396179(canvasTabsText("contextMenu.save"), _0x651d3c, () => {
      if (window._v2SaveProject) {
        window._v2SaveProject(_0x3b502f.name, {
          canvasId: _0x3b502f.id
        });
      }
    });
    _0x396179(canvasTabsText("contextMenu.saveAs"), _0x3d674b, async () => {
      if (desktopBridge.project.isAvailable() && typeof window._v2SaveProjectAsLocal === "function") {
        window._v2SaveProjectAsLocal({
          canvasId: _0x3b502f.id
        });
        return;
      }
      const _0x2a6253 = this.getMultiDataSnapshot({
        sanitizeForPersistence: true
      }) || {};
      const _0x409eeb = Array.isArray(_0x2a6253.canvases) ? _0x2a6253.canvases : [];
      const _0x2284eb = _0x409eeb.find(_0x124bec => String(_0x124bec?.id || "") === String(_0x3b502f.id || "")) || _0x3b502f;
      const _0x10e3d6 = {
        ..._0x2a6253,
        canvases: _0x2284eb ? [_0x2284eb] : [],
        activeCanvasId: _0x2284eb?.id || _0x3b502f.id || null
      };
      const _0x2dee41 = _0x3b502f.name + ".aicanvas";
      const _0x259669 = await saveTextDownload({
        filename: _0x2dee41,
        content: JSON.stringify(_0x10e3d6, null, 2),
        mimeType: "application/json",
        filterName: "SHUO Canvas Project"
      });
      if (_0x259669?.canceled) {
        return;
      }
      window.showToast?.(canvasTabsText("downloadedWorkflow", {
        filename: _0x2dee41
      }));
    });
    if (typeof window._v2ExportCurrentProjectPackage === "function") {
      _0x396179(canvasTabsText("contextMenu.collectProject"), _0x4822a9, () => {
        window._v2ExportCurrentProjectPackage({
          canvasId: _0x3b502f.id,
          projectName: _0x3b502f.name
        });
      });
    }
    const _0x4fb05d = document.createElement("div");
    _0x4fb05d.className = "v2-menu-sep";
    _0x2c369b.appendChild(_0x4fb05d);
    _0x396179(canvasTabsText("contextMenu.delete"), _0x45d0ff, () => {
      this.deleteCanvas(_0x3b502f.id);
    }, true);
    document.body.appendChild(_0x2c369b);
    const _0x4e81b7 = _0x16032e => {
      if (!_0x2c369b.contains(_0x16032e.target)) {
        _0x2c369b.remove();
        document.removeEventListener("pointerdown", _0x4e81b7, true);
      }
    };
    requestAnimationFrame(() => document.addEventListener("pointerdown", _0x4e81b7, true));
  },
  _clearCanvasSurface() {
    clearRendererCache();
    const _0x17f95e = document.getElementById("v2-canvas");
    if (!_0x17f95e) {
      return;
    }
    Array.from(_0x17f95e.children).forEach(_0x5f3e7 => {
      if (_0x5f3e7.classList.contains("v2-node")) {
        _0x5f3e7.remove();
      }
    });
  },
  _buildCanvasRecord(_0x2f1d0c = {}, _0x1d18fc = {}) {
    const _0x53c537 = createEmptyCanvasSnapshot();
    const _0x124043 = Number.isFinite(_0x2f1d0c?._persistRevHint) ? _0x2f1d0c._persistRevHint : Number.isFinite(_0x1d18fc?._persistRevHint) ? _0x1d18fc._persistRevHint : _0x53c537._persistRevHint;
    return {
      ..._0x2f1d0c,
      nodes: Array.isArray(_0x1d18fc?.nodes) ? _0x1d18fc.nodes : _0x1d18fc?.nodes && typeof _0x1d18fc.nodes === "object" ? _0x1d18fc.nodes : _0x53c537.nodes,
      edges: Array.isArray(_0x1d18fc?.edges) ? _0x1d18fc.edges : _0x1d18fc?.edges && typeof _0x1d18fc.edges === "object" ? _0x1d18fc.edges : _0x53c537.edges,
      viewport: _0x1d18fc?.viewport && typeof _0x1d18fc.viewport === "object" ? {
        ..._0x1d18fc.viewport
      } : {
        ..._0x53c537.viewport
      },
      assets: Array.isArray(_0x1d18fc?.assets) ? _0x1d18fc.assets : _0x53c537.assets,
      storyboard3dProjects: Array.isArray(_0x1d18fc?.storyboard3dProjects) ? _0x1d18fc.storyboard3dProjects : _0x53c537.storyboard3dProjects,
      visualSnapshot: normalizeCanvasVisualSnapshot(_0x1d18fc?.visualSnapshot) || normalizeCanvasVisualSnapshot(_0x2f1d0c?.visualSnapshot) || null,
      _persistRevHint: _0x124043
    };
  },
  _clearVisualSnapshotBackfillTimers() {
    for (const _0x2f11ed of this._visualSnapshotBackfillTimers || []) {
      clearTimeout(_0x2f11ed);
    }
    this._visualSnapshotBackfillTimers = [];
    this._clearVisualSnapshotIdleRetryTimer();
  },
  _clearVisualSnapshotIdleRetryTimer() {
    if (this._visualSnapshotIdleRetryTimer !== null) {
      clearTimeout(this._visualSnapshotIdleRetryTimer);
    }
    this._visualSnapshotIdleRetryTimer = null;
    this._visualSnapshotIdleRetryCanvasId = null;
  },
  _getVisualSnapshotNow() {
    return Date.now();
  },
  _holdVisualSnapshotCaptureAfterInteraction() {
    this._visualSnapshotSettleUntil = Math.max(Number(this._visualSnapshotSettleUntil) || 0, this._getVisualSnapshotNow() + VISUAL_SNAPSHOT_INTERACTION_SETTLE_MS);
  },
  _invalidateVisualSnapshotBackfillCapture() {
    this._visualSnapshotBackfillGeneration = (Number(this._visualSnapshotBackfillGeneration) || 0) + 1;
    return this._visualSnapshotBackfillGeneration;
  },
  _deferVisualSnapshotBackfillAfterInteraction() {
    this._holdVisualSnapshotCaptureAfterInteraction();
    this._invalidateVisualSnapshotBackfillCapture();
    this._clearVisualSnapshotBackfillTimers();
    if (this._activeId) {
      this._scheduleVisualSnapshotIdleRetry(this._activeId);
    }
  },
  _bindVisualSnapshotInteractionGuard() {
    const _0x32f484 = typeof document !== "undefined" ? document : null;
    if (!_0x32f484 || typeof _0x32f484.addEventListener !== "function") {
      return;
    }
    if (this._visualSnapshotInteractionGuardDocument === _0x32f484) {
      return;
    }
    const _0x31ea5c = this._visualSnapshotInteractionGuardDocument;
    const _0x2ec72f = this._visualSnapshotInteractionGuardHandlers;
    if (_0x31ea5c && _0x2ec72f) {
      _0x31ea5c.removeEventListener?.("pointerdown", _0x2ec72f.pointerdown, true);
      _0x31ea5c.removeEventListener?.("pointerup", _0x2ec72f.pointerup, true);
      _0x31ea5c.removeEventListener?.("pointercancel", _0x2ec72f.pointercancel, true);
      _0x31ea5c.removeEventListener?.("wheel", _0x2ec72f.wheel, true);
    }
    this._visualSnapshotActivePointers = new Set();
    const _0x5bd591 = _0x395856 => Number.isFinite(_0x395856?.pointerId) ? _0x395856.pointerId : "primary";
    const _0x523a08 = {
      pointerdown: _0x2866c5 => {
        this._visualSnapshotActivePointers.add(_0x5bd591(_0x2866c5));
        this._deferVisualSnapshotBackfillAfterInteraction();
      },
      pointerup: _0x5dd8e4 => {
        this._visualSnapshotActivePointers.delete(_0x5bd591(_0x5dd8e4));
        this._deferVisualSnapshotBackfillAfterInteraction();
      },
      pointercancel: _0x22050e => {
        this._visualSnapshotActivePointers.delete(_0x5bd591(_0x22050e));
        this._deferVisualSnapshotBackfillAfterInteraction();
      },
      wheel: () => {
        this._deferVisualSnapshotBackfillAfterInteraction();
      }
    };
    _0x32f484.addEventListener("pointerdown", _0x523a08.pointerdown, true);
    _0x32f484.addEventListener("pointerup", _0x523a08.pointerup, true);
    _0x32f484.addEventListener("pointercancel", _0x523a08.pointercancel, true);
    _0x32f484.addEventListener("wheel", _0x523a08.wheel, {
      capture: true,
      passive: true
    });
    this._visualSnapshotInteractionGuardDocument = _0x32f484;
    this._visualSnapshotInteractionGuardHandlers = _0x523a08;
  },
  _getActiveCanvasNodeCount() {
    const _0x59b881 = this._canvases.find(_0x5d3086 => _0x5d3086.id === this._activeId);
    const _0x1cd5b5 = countCanvasNodes(_0x59b881?.nodes);
    if (_0x1cd5b5 > 0) {
      return _0x1cd5b5;
    }
    return countCanvasNodes(a949_0x297288.getStateRaw?.()?.nodes);
  },
  _resolveVisualSnapshotBackfillDelays() {
    if (this._getActiveCanvasNodeCount() >= DENSE_VISUAL_SNAPSHOT_NODE_COUNT) {
      return DENSE_VISUAL_SNAPSHOT_BACKFILL_DELAYS_MS;
    } else {
      return VISUAL_SNAPSHOT_BACKFILL_DELAYS_MS;
    }
  },
  _isViewportBusyForVisualSnapshot() {
    const _0x851a39 = typeof document !== "undefined" ? document : null;
    const _0x428d3d = _0x851a39?.body?.classList;
    const _0x4e95a7 = _0x851a39?.documentElement?.classList;
    return Boolean(_0x428d3d?.contains?.("is-panning") || _0x428d3d?.contains?.("is-zooming") || _0x428d3d?.contains?.("is-viewport-animating") || _0x428d3d?.contains?.("is-dragging") || _0x4e95a7?.contains?.("is-connecting-mode"));
  },
  _isVisualSnapshotInteractionBusy() {
    if (this._isViewportBusyForVisualSnapshot()) {
      this._holdVisualSnapshotCaptureAfterInteraction();
      return true;
    }
    if ((this._visualSnapshotActivePointers?.size || 0) > 0) {
      return true;
    }
    return this._getVisualSnapshotNow() < (Number(this._visualSnapshotSettleUntil) || 0);
  },
  _hasPendingVideoLoadForVisualSnapshot() {
    const _0x2f3514 = typeof document !== "undefined" ? document : null;
    const _0x2a663f = _0x2f3514?.getElementById?.("v2-canvas");
    if (!_0x2a663f?.querySelectorAll) {
      return false;
    }
    return Array.from(_0x2a663f.querySelectorAll("video")).some(_0x286d17 => {
      if (_0x286d17?.isConnected === false || _0x286d17?.error) {
        return false;
      }
      const _0x22d29a = String(_0x286d17?.currentSrc || _0x286d17?.getAttribute?.("src") || _0x286d17?.src || "").trim();
      return !!_0x22d29a && Number(_0x286d17?.readyState || 0) < 2;
    });
  },
  _shouldDeferVisualSnapshotBackfill() {
    if (this._isVisualSnapshotInteractionBusy()) {
      return true;
    }
    if (this._getActiveCanvasNodeCount() < DENSE_VISUAL_SNAPSHOT_NODE_COUNT) {
      return false;
    }
    if (this._hasPendingVideoLoadForVisualSnapshot()) {
      return true;
    }
    const _0xb3a6f = getCanvasMediaSchedulerStats();
    return Number(_0xb3a6f.imagePreloadActive || 0) > 0 || Number(_0xb3a6f.imagePreloadQueued || 0) > 0;
  },
  _isVisualSnapshotWorthReplacing(_0x58ae26, _0x1438c9, {
    force = false
  } = {}) {
    if (!_0x1438c9) {
      return false;
    }
    if (!_0x58ae26) {
      return true;
    }
    const _0xa7ad25 = Math.max(0, Number(_0x58ae26.readyMediaNodeCount ?? _0x58ae26.mediaNodeCount) || 0);
    const _0x4df729 = Math.max(0, Number(_0x1438c9.readyMediaNodeCount ?? _0x1438c9.mediaNodeCount) || 0);
    if (_0x4df729 > _0xa7ad25) {
      return true;
    }
    if (_0x4df729 < _0xa7ad25) {
      return false;
    }
    const _0x3fd08a = Math.max(0, Number(_0x58ae26.visibleNodeCount) || 0);
    const _0x257a68 = Math.max(0, Number(_0x1438c9.visibleNodeCount) || 0);
    if (_0x257a68 > _0x3fd08a) {
      return true;
    }
    return force && _0x257a68 >= _0x3fd08a;
  },
  _captureActiveVisualSnapshot({
    force = false,
    persistIfChanged = false
  } = {}) {
    if (!this._activeId) {
      return null;
    }
    if (this._isVisualSnapshotInteractionBusy()) {
      this._scheduleVisualSnapshotIdleRetry(this._activeId);
      return null;
    }
    const _0x4fb0a9 = this._canvases.findIndex(_0xa8512c => _0xa8512c.id === this._activeId);
    if (_0x4fb0a9 === -1) {
      return null;
    }
    if (typeof document === "undefined") {
      return null;
    }
    const _0x1f7b40 = document.getElementById("v2-canvas");
    if (!_0x1f7b40) {
      return null;
    }
    const _0x34b73b = a949_0x297288.getStateRaw?.() || {};
    const _0xda71e = captureCanvasVisualSnapshot({
      canvasEl: _0x1f7b40,
      containerEl: _0x1f7b40.parentElement || document.getElementById("v2-container"),
      nodes: _0x34b73b.nodes,
      edges: _0x34b73b.edges,
      viewport: _0x34b73b.viewport,
      force: force
    });
    if (!_0xda71e) {
      return null;
    }
    const _0x56aa56 = this._canvases[_0x4fb0a9]?.visualSnapshot || null;
    if (!this._isVisualSnapshotWorthReplacing(_0x56aa56, _0xda71e, {
      force: force
    })) {
      return null;
    }
    this._canvases[_0x4fb0a9] = {
      ...this._canvases[_0x4fb0a9],
      visualSnapshot: _0xda71e
    };
    if (persistIfChanged) {
      this._scheduleWorkspaceMetaCacheSave();
    }
    return _0xda71e;
  },
  _getActiveVisualSnapshotCaptureInput({
    force = false
  } = {}) {
    if (!this._activeId) {
      return null;
    }
    const _0x15c103 = this._canvases.findIndex(_0x3878e2 => _0x3878e2.id === this._activeId);
    if (_0x15c103 === -1) {
      return null;
    }
    if (typeof document === "undefined") {
      return null;
    }
    const _0x5b920e = document.getElementById("v2-canvas");
    if (!_0x5b920e) {
      return null;
    }
    const _0x3d340c = a949_0x297288.getStateRaw?.() || {};
    return {
      idx: _0x15c103,
      canvasId: this._activeId,
      canvasEl: _0x5b920e,
      containerEl: _0x5b920e.parentElement || document.getElementById("v2-container"),
      nodes: _0x3d340c.nodes,
      edges: _0x3d340c.edges,
      viewport: _0x3d340c.viewport,
      force: force
    };
  },
  async _captureActiveVisualSnapshotAsync({
    force = false,
    persistIfChanged = false
  } = {}) {
    const _0x13a4a0 = Number(this._visualSnapshotBackfillGeneration) || 0;
    const _0x5d370d = this._getActiveVisualSnapshotCaptureInput({
      force: force
    });
    if (!_0x5d370d) {
      return null;
    }
    if (this._isVisualSnapshotInteractionBusy()) {
      this._scheduleVisualSnapshotIdleRetry(_0x5d370d.canvasId);
      return null;
    }
    let _0x1a04fd = await captureCanvasVisualSnapshotFromElectron(_0x5d370d);
    if (this._activeId !== _0x5d370d.canvasId || _0x13a4a0 !== (Number(this._visualSnapshotBackfillGeneration) || 0) || this._isVisualSnapshotInteractionBusy()) {
      if (this._activeId === _0x5d370d.canvasId) {
        this._scheduleVisualSnapshotIdleRetry(_0x5d370d.canvasId);
      }
      return null;
    }
    if (!_0x1a04fd) {
      if (isChromeShellRuntime() && countCanvasNodes(_0x5d370d.nodes) >= DENSE_VISUAL_SNAPSHOT_NODE_COUNT) {
        return null;
      }
      _0x1a04fd = captureCanvasVisualSnapshot(_0x5d370d);
    }
    if (!_0x1a04fd) {
      return null;
    }
    if (this._activeId !== _0x5d370d.canvasId || _0x13a4a0 !== (Number(this._visualSnapshotBackfillGeneration) || 0) || this._isVisualSnapshotInteractionBusy()) {
      if (this._activeId === _0x5d370d.canvasId) {
        this._scheduleVisualSnapshotIdleRetry(_0x5d370d.canvasId);
      }
      return null;
    }
    const _0x1d50c8 = this._canvases.findIndex(_0x78240d => _0x78240d.id === _0x5d370d.canvasId);
    if (_0x1d50c8 === -1) {
      return null;
    }
    const _0x2fb8e8 = this._canvases[_0x1d50c8]?.visualSnapshot || null;
    if (!this._isVisualSnapshotWorthReplacing(_0x2fb8e8, _0x1a04fd, {
      force: force
    })) {
      return null;
    }
    this._canvases[_0x1d50c8] = {
      ...this._canvases[_0x1d50c8],
      visualSnapshot: _0x1a04fd
    };
    if (persistIfChanged) {
      this._scheduleWorkspaceMetaCacheSave();
    }
    return _0x1a04fd;
  },
  _showCanvasVisualSnapshot(_0xb3bc9c) {
    hideCanvasVisualSnapshotOverlay();
    this._scheduleCanvasVisibleMediaWarmup(_0xb3bc9c, {
      delayMs: CANVAS_MEDIA_WARMUP_OPEN_DELAY_MS,
      maxJobs: CANVAS_MEDIA_WARMUP_SNAPSHOT_MAX_JOBS
    });
    return false;
  },
  _warmupCanvasVisibleMedia(_0x5afb36, {
    maxJobs: _0x570842
  } = {}) {
    if (typeof document === "undefined" || !_0x5afb36) {
      return null;
    }
    if (typeof document.getElementById !== "function") {
      return null;
    }
    const _0x186133 = document.getElementById("v2-canvas");
    const _0x51f0f4 = _0x186133?.parentElement || document.getElementById("v2-container");
    return warmupCanvasVisibleMedia({
      canvas: _0x5afb36,
      containerEl: _0x51f0f4,
      maxJobs: _0x570842
    });
  },
  _clearCanvasVisibleMediaWarmupTimer() {
    if (this._mediaWarmupTimer !== null) {
      clearTimeout(this._mediaWarmupTimer);
      this._mediaWarmupTimer = null;
    }
  },
  _scheduleCanvasVisibleMediaWarmup(_0x272590, {
    delayMs = CANVAS_MEDIA_WARMUP_OPEN_DELAY_MS,
    maxJobs = CANVAS_MEDIA_WARMUP_OPEN_MAX_JOBS
  } = {}) {
    this._clearCanvasVisibleMediaWarmupTimer();
    if (!_0x272590) {
      return null;
    }
    const _0x470ebd = _0x272590.id || null;
    const _0x594bf0 = setTimeout(() => {
      this._mediaWarmupTimer = null;
      if (_0x470ebd && this._activeId !== _0x470ebd) {
        return;
      }
      this._warmupCanvasVisibleMedia(_0x272590, {
        maxJobs: maxJobs
      });
    }, Math.max(0, Number(delayMs) || 0));
    _0x594bf0?.unref?.();
    this._mediaWarmupTimer = _0x594bf0;
    return _0x594bf0;
  },
  _scheduleVisualSnapshotBackfill() {
    this._clearVisualSnapshotBackfillTimers();
    if (!this._activeId) {
      return;
    }
    this._invalidateVisualSnapshotBackfillCapture();
    this._bindVisualSnapshotInteractionGuard();
    const _0x3ae11e = this._activeId;
    this._visualSnapshotBackfillTimers = this._resolveVisualSnapshotBackfillDelays().map(_0x1bec65 => this._scheduleVisualSnapshotBackfillTimer(_0x3ae11e, _0x1bec65));
  },
  _scheduleVisualSnapshotIdleRetry(_0x2f269f, _0x31c191 = VISUAL_SNAPSHOT_BACKFILL_RETRY_MS) {
    if (this._visualSnapshotIdleRetryTimer !== null && this._visualSnapshotIdleRetryCanvasId === _0x2f269f) {
      return this._visualSnapshotIdleRetryTimer;
    }
    this._clearVisualSnapshotIdleRetryTimer();
    const _0x5b88c6 = setTimeout(() => {
      if (this._visualSnapshotIdleRetryTimer !== _0x5b88c6) {
        return;
      }
      this._visualSnapshotIdleRetryTimer = null;
      this._visualSnapshotIdleRetryCanvasId = null;
      if (this._activeId !== _0x2f269f) {
        return;
      }
      if (this._shouldDeferVisualSnapshotBackfill()) {
        this._scheduleVisualSnapshotIdleRetry(_0x2f269f);
        return;
      }
      this._requestVisualSnapshotBackfillCapture(_0x2f269f);
    }, Math.max(0, Number(_0x31c191) || 0));
    _0x5b88c6?.unref?.();
    this._visualSnapshotIdleRetryTimer = _0x5b88c6;
    this._visualSnapshotIdleRetryCanvasId = _0x2f269f;
    return _0x5b88c6;
  },
  _requestVisualSnapshotBackfillCapture(_0xbf1580) {
    if (this._activeId !== _0xbf1580) {
      return Promise.resolve(null);
    }
    if (this._shouldDeferVisualSnapshotBackfill()) {
      this._scheduleVisualSnapshotIdleRetry(_0xbf1580);
      return Promise.resolve(null);
    }
    if (this._visualSnapshotBackfillCapturePromise) {
      return this._visualSnapshotBackfillCapturePromise;
    }
    const _0x357ef8 = this._captureActiveVisualSnapshotAsync({
      force: false,
      persistIfChanged: true
    });
    const _0x1d6929 = Promise.resolve(_0x357ef8).finally(() => {
      if (this._visualSnapshotBackfillCapturePromise === _0x1d6929) {
        this._visualSnapshotBackfillCapturePromise = null;
      }
    });
    this._visualSnapshotBackfillCapturePromise = _0x1d6929;
    return _0x1d6929;
  },
  _scheduleVisualSnapshotBackfillTimer(_0x197978, _0x30eba5) {
    const _0x3090b4 = setTimeout(() => {
      this._visualSnapshotBackfillTimers = (this._visualSnapshotBackfillTimers || []).filter(_0x5ef3f9 => _0x5ef3f9 !== _0x3090b4);
      if (this._activeId !== _0x197978) {
        return;
      }
      if (this._shouldDeferVisualSnapshotBackfill()) {
        this._scheduleVisualSnapshotIdleRetry(_0x197978);
        return;
      }
      this._clearVisualSnapshotIdleRetryTimer();
      this._requestVisualSnapshotBackfillCapture(_0x197978);
    }, Math.max(0, Number(_0x30eba5) || 0));
    _0x3090b4?.unref?.();
    return _0x3090b4;
  },
  _hydrateCanvasSnapshot(_0x377442, {
    preserveLiveGeneration = false
  } = {}) {
    markPerf("hydrateTrustedSnapshot:start");
    a949_0x297288.hydrateTrustedSnapshot(_0x377442, {
      preserveLiveGeneration: preserveLiveGeneration
    });
    markPerf("hydrateTrustedSnapshot:end");
    measurePerf("hydrateTrustedSnapshot", "hydrateTrustedSnapshot:start", "hydrateTrustedSnapshot:end");
    this._rememberCanvasPersistRev();
  },
  hydrateActiveCanvasSnapshot(_0x315447) {
    if (!this._activeId) {
      return;
    }
    const _0x3bc1b2 = this._canvases.findIndex(_0x8c5ce1 => _0x8c5ce1.id === this._activeId);
    if (_0x3bc1b2 === -1) {
      return;
    }
    this._canvases[_0x3bc1b2] = this._buildCanvasRecord(this._canvases[_0x3bc1b2], _0x315447);
    this._scheduleCanvasVisibleMediaWarmup(this._canvases[_0x3bc1b2]);
    this._clearCanvasSurface();
    this._hydrateCanvasSnapshot(this._canvases[_0x3bc1b2]);
    this._scheduleVisualSnapshotBackfill();
  },
  init(_0x113fb2, {
    markClean = true
  } = {}) {
    this._bindVisualSnapshotInteractionGuard();
    this._invalidateVisualSnapshotBackfillCapture();
    this._backgroundTaskStores = new Map();
    this._canvases = Array.isArray(_0x113fb2.canvases) ? _0x113fb2.canvases.map(_0x33c8d6 => this._buildCanvasRecord(_0x33c8d6, _0x33c8d6)) : [];
    const _0x137148 = new Map((Array.isArray(_0x113fb2?.projectContexts) ? _0x113fb2.projectContexts : []).filter(_0x341b74 => _0x341b74?.canvasId).map(_0x28dc41 => [String(_0x28dc41.canvasId), _0x28dc41]));
    this._projectContextByCanvasId = new Map();
    this._lastPersistRevByCanvas = new Map();
    this._savedSignatureByCanvas = new Map();
    this._lastTabsRenderSignature = "";
    if (this._canvases.length === 0) {
      const _0x577e19 = "canvas_default_" + Date.now();
      this._canvases.push({
        id: _0x577e19,
        name: canvasTabsText("defaultCanvasName"),
        ...createEmptyCanvasSnapshot()
      });
      this._activeId = _0x577e19;
      this._projectContextByCanvasId.set(_0x577e19, normalizeCanvasProjectContext({
        projectName: this._canvases[0].name,
        isTemporary: true
      }, {
        canvasId: _0x577e19,
        projectName: this._canvases[0].name
      }));
      this._hydrateCanvasSnapshot(this._canvases[0]);
    } else {
      const _0x12608a = this._canvases.find(_0x1bf05 => _0x1bf05?.id === _0x113fb2.activeCanvasId) || this._canvases[0];
      this._activeId = _0x12608a?.id ?? null;
      const _0x43e7a7 = captureCurrentProjectContext(_0x12608a);
      this._canvases.forEach(_0x376503 => {
        const _0x4fa6af = _0x137148.get(String(_0x376503?.id));
        const _0x88ecf8 = _0x376503.id === this._activeId ? _0x43e7a7 : {
          projectId: _0x376503.name || _0x376503.id,
          projectName: _0x376503.name,
          isTemporary: true,
          workspaceProjectScoped: true
        };
        this._projectContextByCanvasId.set(_0x376503.id, normalizeCanvasProjectContext(_0x4fa6af || _0x88ecf8, {
          canvasId: _0x376503.id,
          projectName: _0x376503.name
        }));
      });
      if (_0x12608a) {
        this._showCanvasVisualSnapshot(_0x12608a);
        this._hydrateCanvasSnapshot(_0x12608a);
        this._scheduleVisualSnapshotBackfill();
      }
    }
    this._resetSavedCanvasSignatures({
      markClean: markClean
    });
    this.renderTabs();
    startVideoThumbBackfill();
    this._applyActiveCanvasProjectContext();
    this._notifyActiveCanvasChanged("init");
    this._notifyDirtyStateChanged();
  },
  replaceWorkspace(_0x45f237, {
    markClean = true
  } = {}) {
    this._flushCurrentCanvas();
    this._clearVisualSnapshotBackfillTimers();
    this._clearCanvasVisibleMediaWarmupTimer();
    this._clearCanvasSurface();
    this.init(_0x45f237, {
      markClean: markClean
    });
    resetHistory();
    this._scheduleWorkspaceCacheSave();
    return true;
  },
  _flushCurrentCanvas() {
    if (!this._activeId) {
      return;
    }
    const _0x45a2f2 = this._canvases.findIndex(_0x19f757 => _0x19f757.id === this._activeId);
    if (_0x45a2f2 === -1) {
      return;
    }
    flushAllPendingPromptHtmlCommits();
    const _0x33876f = this._getStorePersistRev();
    if (this._lastPersistRevByCanvas.get(this._activeId) === _0x33876f) {
      return;
    }
    const _0x18d447 = markRecoveringGenerationSnapshot(a949_0x297288.serialize());
    const _0x4b6af0 = this._buildCanvasRecord(this._canvases[_0x45a2f2], _0x18d447);
    _0x4b6af0._persistRevHint = _0x33876f;
    this._canvases[_0x45a2f2] = _0x4b6af0;
    this._lastPersistRevByCanvas.set(this._activeId, _0x33876f);
  },
  async switchTo(_0x57835e) {
    if (_0x57835e === this._activeId) {
      return;
    }
    if (!this._canvases.some(_0x36eb80 => _0x36eb80.id === _0x57835e)) {
      return;
    }
    return this._runTaskSafeCanvasTransition(() => {
      let _0x17f109 = this._canvases.find(_0x310a0b => _0x310a0b.id === _0x57835e);
      if (!_0x17f109 || _0x57835e === this._activeId) {
        return false;
      }
      this._flushCurrentCanvas();
      const _0x51f778 = this._handoffActiveCanvasTasks(this._activeId);
      if (_0x51f778?.ok === false) {
        this._showTaskTransitionBlocked(_0x51f778);
        return false;
      }
      const _0x1e92d3 = this._backgroundTaskStores.get(_0x57835e);
      if (_0x1e92d3) {
        this._syncBackgroundTaskCanvas(_0x57835e, _0x1e92d3, {
          persist: false
        });
        _0x17f109 = this._canvases.find(_0xe11689 => _0xe11689.id === _0x57835e);
      }
      this._showCanvasVisualSnapshot(_0x17f109);
      this._clearCanvasSurface();
      this._activeId = _0x57835e;
      this._hydrateCanvasSnapshot(_0x17f109, {
        preserveLiveGeneration: canvasHasLiveGeneration(_0x17f109)
      });
      this._restoreActiveCanvasTasks(_0x57835e);
      this._scheduleVisualSnapshotBackfill();
      commit();
      this.renderTabs();
      startVideoThumbBackfill();
      this._applyActiveCanvasProjectContext();
      this._notifyActiveCanvasChanged("switch");
      this._markCanvasMetaDirty();
      this._notifyDirtyStateChanged();
      return true;
    });
  },
  async addCanvas() {
    return this._runTaskSafeCanvasTransition(() => {
      this._flushCurrentCanvas();
      const _0x4b03d2 = this._handoffActiveCanvasTasks(this._activeId);
      if (_0x4b03d2?.ok === false) {
        this._showTaskTransitionBlocked(_0x4b03d2);
        return false;
      }
      this._clearCanvasSurface();
      const _0x3f5ccf = "canvas_" + Date.now();
      const _0x3570aa = canvasTabsText("newCanvasName", {
        index: this._canvases.length + 1
      });
      this._canvases.push({
        id: _0x3f5ccf,
        name: _0x3570aa,
        ...createEmptyCanvasSnapshot()
      });
      this._projectContextByCanvasId.set(_0x3f5ccf, normalizeCanvasProjectContext({
        projectName: _0x3570aa,
        isTemporary: true
      }, {
        canvasId: _0x3f5ccf,
        projectName: _0x3570aa
      }));
      this._activeId = _0x3f5ccf;
      this._hydrateCanvasSnapshot(createEmptyCanvasSnapshot());
      this._scheduleVisualSnapshotBackfill();
      commit();
      this.renderTabs();
      startVideoThumbBackfill();
      this._applyActiveCanvasProjectContext();
      this._notifyActiveCanvasChanged("add");
      this._markCanvasMetaDirty();
      this._notifyDirtyStateChanged();
      return true;
    });
  },
  async _confirmDeleteDirtyCanvas(_0x207888, {
    skipDirtyConfirm = false
  } = {}) {
    if (skipDirtyConfirm || !this.isCanvasDirty(_0x207888?.id)) {
      return true;
    }
    return this._showUnsavedDeleteConfirm(_0x207888);
  },
  _showUnsavedDeleteConfirm(_0x346562) {
    if (typeof document === "undefined" || !document.body) {
      return Promise.resolve(false);
    }
    document.getElementById("canvas-delete-confirm-overlay")?.remove();
    return new Promise(_0x5e980f => {
      const _0x52f2fa = document.createElement("div");
      _0x52f2fa.id = "canvas-delete-confirm-overlay";
      _0x52f2fa.className = "custom-confirm-overlay";
      const _0x566fd3 = document.createElement("div");
      _0x566fd3.className = "custom-confirm-box";
      const _0x19da8c = document.createElement("div");
      _0x19da8c.className = "confirm-title";
      _0x19da8c.textContent = canvasTabsText("deleteUnsaved.title");
      const _0x2140df = document.createElement("div");
      _0x2140df.className = "confirm-msg";
      _0x2140df.textContent = canvasTabsText("deleteUnsaved.message", {
        name: _0x346562?.name || canvasTabsText("untitledCanvas")
      });
      const _0x94056b = document.createElement("div");
      _0x94056b.className = "confirm-btns";
      const _0xb4eec4 = document.createElement("button");
      _0xb4eec4.type = "button";
      _0xb4eec4.className = "confirm-btn confirm-cancel";
      _0xb4eec4.textContent = canvasTabsText("deleteUnsaved.cancel");
      const _0x171699 = document.createElement("button");
      _0x171699.type = "button";
      _0x171699.className = "confirm-btn confirm-ok";
      _0x171699.textContent = canvasTabsText("deleteUnsaved.delete");
      _0x94056b.appendChild(_0xb4eec4);
      _0x94056b.appendChild(_0x171699);
      _0x566fd3.appendChild(_0x19da8c);
      _0x566fd3.appendChild(_0x2140df);
      _0x566fd3.appendChild(_0x94056b);
      _0x52f2fa.appendChild(_0x566fd3);
      document.body.appendChild(_0x52f2fa);
      let _0x59d124 = false;
      const _0x4568d5 = _0x365bdc => {
        if (_0x59d124) {
          return;
        }
        _0x59d124 = true;
        document.removeEventListener("keydown", _0x3d73a0, true);
        _0x52f2fa.remove();
        _0x5e980f(_0x365bdc);
      };
      const _0x3d73a0 = _0x4695cf => {
        if (_0x4695cf.key === "Escape") {
          _0x4695cf.preventDefault();
          _0x4568d5(false);
          return;
        }
        if (_0x4695cf.key === "Enter" && !_0x4695cf.isComposing) {
          _0x4695cf.preventDefault();
          _0x4568d5(true);
        }
      };
      _0x52f2fa.addEventListener("click", _0x4e2d51 => {
        if (_0x4e2d51.target === _0x52f2fa) {
          _0x4568d5(false);
        }
      });
      _0xb4eec4.addEventListener("click", () => _0x4568d5(false));
      _0x171699.addEventListener("click", () => _0x4568d5(true));
      document.addEventListener("keydown", _0x3d73a0, true);
      _0xb4eec4.focus?.();
    });
  },
  async deleteCanvas(_0x56b515, _0x226a80 = {}) {
    if (this._canvases.length <= 1) {
      window.showToast(canvasTabsText("keepOneCanvas"), "warn");
      return false;
    }
    const _0x3906db = this._canvases.findIndex(_0x1212f0 => _0x1212f0.id === _0x56b515);
    if (_0x3906db === -1) {
      return false;
    }
    if (_0x56b515 === this._activeId) {
      this._flushCurrentCanvas();
    }
    const _0x42728f = this._canvases[_0x3906db];
    if (canvasHasLiveGeneration(_0x42728f)) {
      this._showTaskTransitionBlocked({
        activeCount: 1
      }, "deleteBlockedByTasks");
      return false;
    }
    const _0x3de727 = await this._confirmDeleteDirtyCanvas(_0x42728f, _0x226a80);
    if (!_0x3de727) {
      return false;
    }
    this._canvases.splice(_0x3906db, 1);
    this._projectContextByCanvasId.delete(_0x56b515);
    this._backgroundTaskStores.delete(_0x56b515);
    this._lastPersistRevByCanvas.delete(_0x56b515);
    this._savedSignatureByCanvas.delete(_0x56b515);
    if (this._activeId === _0x56b515) {
      const _0x1674ea = this._canvases[Math.max(0, _0x3906db - 1)];
      this._activeId = _0x1674ea.id;
      this._showCanvasVisualSnapshot(_0x1674ea);
      this._clearCanvasSurface();
      this._hydrateCanvasSnapshot(_0x1674ea, {
        preserveLiveGeneration: canvasHasLiveGeneration(_0x1674ea)
      });
      this._scheduleVisualSnapshotBackfill();
      commit();
      this._applyActiveCanvasProjectContext();
      this._notifyActiveCanvasChanged("delete");
    }
    this.renderTabs();
    startVideoThumbBackfill();
    this._markCanvasMetaDirty();
    this._notifyDirtyStateChanged();
    return true;
  },
  renameCanvas(_0x456262, _0x459d66) {
    const _0x2a3829 = this._canvases.find(_0x38759e => _0x38759e.id === _0x456262);
    if (!_0x2a3829) {
      return;
    }
    const _0x3d13e2 = String(_0x459d66 || "").trim();
    const _0x5450b0 = String(_0x2a3829.name || "").trim();
    if (!_0x3d13e2 || _0x3d13e2 === _0x5450b0) {
      return;
    }
    _0x2a3829.name = _0x3d13e2;
    this.renderTabs();
    this._markCanvasMetaDirty();
    this._notifyDirtyStateChanged();
  },
  markCanvasClean(_0x4beaa7 = this._activeId) {
    if (!_0x4beaa7) {
      return false;
    }
    if (_0x4beaa7 === this._activeId) {
      this._flushCurrentCanvas();
    }
    const _0x5e6d79 = this._canvases.find(_0x1c1193 => _0x1c1193.id === _0x4beaa7);
    if (!_0x5e6d79) {
      return false;
    }
    this._savedSignatureByCanvas.set(_0x4beaa7, this._buildCanvasSavedSignature(_0x5e6d79));
    this._notifyDirtyStateChanged();
    return true;
  },
  markAllCanvasesClean() {
    this._flushCurrentCanvas();
    this._resetSavedCanvasSignatures({
      markClean: true
    });
    this._notifyDirtyStateChanged();
    return true;
  },
  isCanvasDirty(_0x2ffef4 = this._activeId) {
    if (!_0x2ffef4) {
      return false;
    }
    if (_0x2ffef4 === this._activeId) {
      this._flushCurrentCanvas();
    }
    const _0x576911 = this._canvases.find(_0x3de1fe => _0x3de1fe.id === _0x2ffef4);
    if (!_0x576911) {
      return false;
    }
    const _0x55e74a = this._savedSignatureByCanvas.get(_0x2ffef4);
    if (!_0x55e74a) {
      return true;
    }
    return _0x55e74a !== this._buildCanvasSavedSignature(_0x576911);
  },
  hasDirtyCanvases() {
    this._flushCurrentCanvas();
    return this._canvases.some(_0x530027 => {
      const _0x4fe0bd = _0x530027?.id;
      if (!_0x4fe0bd) {
        return false;
      }
      const _0x55c869 = this._savedSignatureByCanvas.get(_0x4fe0bd);
      return !_0x55c869 || _0x55c869 !== this._buildCanvasSavedSignature(_0x530027);
    });
  },
  getMultiDataSnapshot({
    sanitizeForPersistence = false,
    captureVisualSnapshot = true,
    includeProjectContexts = false
  } = {}) {
    this._flushCurrentCanvas();
    if (captureVisualSnapshot) {
      this._captureActiveVisualSnapshot({
        force: false
      });
    }
    const _0x108097 = cloneMultiDataSnapshot({
      canvases: this._canvases,
      activeCanvasId: this._activeId,
      ...(includeProjectContexts ? {
        projectContexts: this._canvases.map(_0x24a581 => {
          const _0x487fa7 = this._projectContextByCanvasId.get(_0x24a581?.id);
          if (_0x487fa7) {
            return {
              canvasId: _0x24a581.id,
              ..._0x487fa7
            };
          } else {
            return null;
          }
        }).filter(Boolean)
      } : {})
    });
    if (!sanitizeForPersistence) {
      return _0x108097;
    }
    return sanitizeMultiCanvasDataForPersistence(_0x108097 || {});
  },
  getMultiData() {
    return this.getMultiDataSnapshot();
  },
  getActiveCanvasId() {
    return this._activeId || "";
  },
  getPersistenceRevisionSnapshot() {
    const _0x5ca9ef = this._activeId || "";
    const _0x322ccd = this._getStorePersistRev();
    return {
      activeCanvasId: _0x5ca9ef,
      canvases: this._canvases.map(_0x1493d5 => ({
        id: String(_0x1493d5?.id || ""),
        name: String(_0x1493d5?.name || ""),
        persistRev: _0x1493d5?.id === _0x5ca9ef ? _0x322ccd : Number(_0x1493d5?._persistRevHint) || 0
      }))
    };
  },
  renderTabs() {
    const _0x500027 = document.getElementById("canvasTabs");
    if (!_0x500027) {
      return;
    }
    this._bindTabContainerEvents(_0x500027);
    const _0x4f67d6 = this._getTabsRenderSignature();
    if (_0x4f67d6 === this._lastTabsRenderSignature) {
      return;
    }
    this._lastTabsRenderSignature = _0x4f67d6;
    this._removeTabContextMenu();
    const _0x567850 = document.createDocumentFragment();
    this._canvases.forEach(_0x2a3098 => {
      const _0xcdd8d1 = _0x2a3098.id === this._activeId;
      const _0x19440a = document.createElement("div");
      _0x19440a.className = "canvas-tab" + (_0xcdd8d1 ? " active" : "");
      _0x19440a.dataset.id = _0x2a3098.id;
      const _0x2b7fbd = document.createElement("span");
      _0x2b7fbd.className = "canvas-tab-name";
      _0x2b7fbd.dataset.tooltip = _0x2a3098.name;
      _0x2b7fbd.dataset.tooltipOverflow = "true";
      _0x2b7fbd.textContent = _0x2a3098.name;
      const _0x585a0c = document.createElement("button");
      _0x585a0c.type = "button";
      _0x585a0c.className = "canvas-tab-close";
      _0x585a0c.title = canvasTabsText("closeCanvas");
      _0x585a0c.textContent = "×";
      _0x19440a.appendChild(_0x2b7fbd);
      _0x19440a.appendChild(_0x585a0c);
      _0x567850.appendChild(_0x19440a);
    });
    _0x500027.replaceChildren(_0x567850);
    this._revealActiveTab(_0x500027);
    this._updateTabScrollHints(_0x500027);
  }
};
export default CanvasTabManager;
export { CanvasTabManager };