import { bindAIGenTextModelSelector } from "../../components/aigenText/modelSelector.js";
import { bindAIGenVideoModelSelector } from "../../components/aigenVideo/modelSelector.js";
import { buildWorkspaceAssetLibraryItems } from "../workspaceAssetLibrary.js";
import { getDisplayModelName } from "../providers.js";
import { normalizeWorkspaceProjectSortOrder } from "../workspaceProjectHome.js";
import { bindWorkspaceEntityContextMenu } from "../workspaceEntityContextMenu.js";
import { resolveVideoReplicationContextMenuItems as a1460_0x5021e0 } from "./videoReplicationContextMenu.js";
import { VIDEO_REPLICATION_CLIP_LIMIT_OPTIONS, renderVideoReplicationHome, renderVideoReplicationProject } from "./videoReplicationPresentation.js";
import { VIDEO_REPLICATION_STUDIO_NAME } from "./videoReplicationStudioTerminology.js";
import { isVideoReplicationStudioAvailable } from "./videoReplicationStudioAccess.js";
export { VIDEO_REPLICATION_CLIP_LIMIT_OPTIONS, renderVideoReplicationHome, renderVideoReplicationProject } from "./videoReplicationPresentation.js";
function normalizeText(_0x42bc13, _0x28c21f = "") {
  const _0x1813e2 = String(_0x42bc13 ?? "").trim();
  return _0x1813e2 || _0x28c21f;
}
function normalizeClipLimit(_0x36ac39) {
  const _0x15e2fb = Number(_0x36ac39);
  if (VIDEO_REPLICATION_CLIP_LIMIT_OPTIONS.includes(_0x15e2fb)) {
    return _0x15e2fb;
  } else {
    return 15;
  }
}
function resolveMountTarget(_0x52ba48, _0x4775a5) {
  if (typeof _0x4775a5 === "string") {
    return _0x52ba48?.querySelector?.(_0x4775a5) || null;
  }
  return _0x4775a5 || null;
}
function isVideoFile(_0x500aa3) {
  return String(_0x500aa3?.type || "").startsWith("video/") || /\.(?:mp4|mov|webm|m4v|mpeg|mpg)$/iu.test(String(_0x500aa3?.name || ""));
}
function isImageFile(_0x19105d) {
  return String(_0x19105d?.type || "").startsWith("image/") || /\.(?:png|jpe?g|webp|gif|bmp|avif)$/iu.test(String(_0x19105d?.name || ""));
}
export function captureVideoReplicationRenderContinuity(_0x4d0b96, _0x4d272d = globalThis.document) {
  const _0x13908e = new Map();
  _0x4d0b96?.querySelectorAll?.("[data-video-replication-media-key]")?.forEach?.(_0x25874e => {
    const _0x32de18 = normalizeText(_0x25874e?.dataset?.videoReplicationMediaKey);
    if (_0x32de18) {
      _0x13908e.set(_0x32de18, _0x25874e);
    }
  });
  const _0x1bccbf = new Map();
  _0x4d0b96?.querySelectorAll?.("[data-video-replication-scroll-key]")?.forEach?.(_0x59ab82 => {
    const _0xfb4c95 = normalizeText(_0x59ab82?.dataset?.videoReplicationScrollKey);
    if (!_0xfb4c95) {
      return;
    }
    _0x1bccbf.set(_0xfb4c95, {
      top: Number(_0x59ab82.scrollTop) || 0,
      left: Number(_0x59ab82.scrollLeft) || 0
    });
  });
  const _0x4c61fb = _0x4d272d?.activeElement;
  const _0x105c6e = _0x4c61fb && _0x4d0b96?.contains?.(_0x4c61fb) && _0x4c61fb.matches?.("[data-video-replication-prompt-input]") ? {
    episodeId: normalizeText(_0x4c61fb.dataset?.episodeId),
    clipId: normalizeText(_0x4c61fb.dataset?.clipId),
    selectionStart: Math.max(0, Number(_0x4c61fb.selectionStart) || 0),
    selectionEnd: Math.max(0, Number(_0x4c61fb.selectionEnd) || 0)
  } : null;
  return {
    mediaByKey: _0x13908e,
    scrollByKey: _0x1bccbf,
    promptFocus: _0x105c6e
  };
}
export function restoreVideoReplicationRenderContinuity(_0x1ce2de, _0xf6205c = {}) {
  _0x1ce2de?.querySelectorAll?.("[data-video-replication-media-key]")?.forEach?.(_0x352a47 => {
    const _0x778fb8 = normalizeText(_0x352a47?.dataset?.videoReplicationMediaKey);
    const _0x45066e = _0xf6205c.mediaByKey?.get?.(_0x778fb8);
    if (!_0x45066e) {
      return;
    }
    const _0x47d241 = normalizeText(_0x45066e.getAttribute?.("src"));
    const _0x431871 = normalizeText(_0x352a47.getAttribute?.("src"));
    if (_0x47d241 !== _0x431871) {
      return;
    }
    _0x352a47.replaceWith?.(_0x45066e);
  });
  _0x1ce2de?.querySelectorAll?.("[data-video-replication-scroll-key]")?.forEach?.(_0x4b56cb => {
    const _0x53085a = normalizeText(_0x4b56cb?.dataset?.videoReplicationScrollKey);
    const _0x48831c = _0xf6205c.scrollByKey?.get?.(_0x53085a);
    if (!_0x48831c) {
      return;
    }
    _0x4b56cb.scrollTop = _0x48831c.top;
    _0x4b56cb.scrollLeft = _0x48831c.left;
  });
  const _0x161e52 = _0xf6205c.promptFocus;
  if (!_0x161e52) {
    return;
  }
  const _0x21db24 = Array.from(_0x1ce2de?.querySelectorAll?.("[data-video-replication-prompt-input]") || []).find(_0x26a78f => normalizeText(_0x26a78f?.dataset?.episodeId) === _0x161e52.episodeId && normalizeText(_0x26a78f?.dataset?.clipId) === _0x161e52.clipId);
  if (!_0x21db24) {
    return;
  }
  try {
    _0x21db24.focus?.({
      preventScroll: true
    });
  } catch {
    _0x21db24.focus?.();
  }
  const _0x15a139 = String(_0x21db24.value ?? _0x21db24.textContent ?? "").length;
  _0x21db24.setSelectionRange?.(Math.min(_0x161e52.selectionStart, _0x15a139), Math.min(_0x161e52.selectionEnd, _0x15a139));
}
export function createVideoReplicationWorkspace({
  documentObject = globalThis.document,
  windowObject = globalThis.window,
  mountTarget = "#v2-wrap",
  onSourceVideosSelected = null,
  onClipLimitChanged = null,
  onSourceReferenceChanged = null,
  onTextModelChanged = null,
  onStartAnalysis = null,
  onOpenProject = null,
  onBackHome = null,
  onProjectStepChanged = null,
  onAssetTabChanged = null,
  onAssetSelected = null,
  onAssetImagesSelected = null,
  onRemoveAsset = null,
  onAssetDescriptionChanged = null,
  onEpisodeSelected = null,
  onClipSelected = null,
  onEpisodeAssetTabChanged = null,
  onPromptChanged = null,
  onVideoModelChanged = null,
  onRenameProject = null,
  onDuplicateProject = null,
  onArchiveProject = null,
  onDeleteProject = null
} = {}) {
  if (!documentObject?.body) {
    return null;
  }
  const _0x2e4a95 = resolveMountTarget(documentObject, mountTarget);
  if (!_0x2e4a95) {
    return null;
  }
  const _0x32a6ff = _0x2e4a95.querySelector?.("[data-video-replication-workspace]");
  if (_0x32a6ff?._videoReplicationWorkspaceApi) {
    return _0x32a6ff._videoReplicationWorkspaceApi;
  }
  let _0x2e08a8 = {
    view: "home",
    sourceFiles: [],
    clipLimitSeconds: 15,
    useSourceVideoReference: true,
    promptModelId: "",
    textProvider: "",
    textProviderProfileId: "",
    projects: [],
    project: null,
    isAnalyzing: false,
    uploadingAssetKind: "",
    isGenerating: false
  };
  let _0x31d00f = {
    projectSearchQuery: "",
    projectSortOrder: "updated-desc",
    showArchivedProjects: false,
    openProjectMenuId: "",
    pendingDeleteProjectId: ""
  };
  let _0x2eabfe = [];
  let _0x288cae = false;
  const _0x3972d4 = documentObject.createElement("section");
  _0x3972d4.className = "story-workspace-root video-replication-workspace";
  _0x3972d4.dataset.videoReplicationWorkspace = "";
  _0x3972d4.dataset.uiStop = "1";
  _0x3972d4.hidden = true;
  _0x3972d4.setAttribute("aria-hidden", "true");
  _0x3972d4.setAttribute("aria-label", VIDEO_REPLICATION_STUDIO_NAME);
  _0x2e4a95.appendChild(_0x3972d4);
  const _0x4ed613 = () => {
    _0x2eabfe.forEach(_0x2350ea => _0x2350ea?.());
    _0x2eabfe = [];
  };
  const _0x3b2869 = () => {
    const _0x549998 = _0x3972d4.querySelector?.("[data-aigen-text-model-selector]");
    if (_0x549998) {
      const _0x4657c6 = bindAIGenTextModelSelector(_0x549998, {
        modelId: _0x2e08a8.promptModelId,
        provider: _0x2e08a8.textProvider,
        providerProfileId: _0x2e08a8.textProviderProfileId,
        getDisplayModelName: getDisplayModelName,
        documentObject: documentObject,
        onChange: onTextModelChanged
      });
      _0x2eabfe.push(() => _0x4657c6?.destroy?.());
    }
    const _0x9ccb36 = _0x3972d4.querySelector?.("[data-aigen-video-model-selector]");
    if (_0x9ccb36 && _0x2e08a8.project) {
      const _0xadddff = _0x2e08a8.project.settings || {};
      const _0x1c551f = bindAIGenVideoModelSelector(_0x9ccb36, {
        modelId: _0xadddff.videoModelId,
        provider: _0xadddff.videoProvider,
        generationParams: _0xadddff.generationParams,
        generationParamsByModel: _0xadddff.generationParamsByModel,
        providerProfileId: _0xadddff.videoProviderProfileId,
        showSchemaControls: true,
        documentObject: documentObject,
        windowObject: windowObject,
        floatingMenuHost: _0x3972d4,
        schemaPopupPlacement: "viewport-auto-up",
        onChange: onVideoModelChanged
      });
      _0x2eabfe.push(() => _0x1c551f?.destroy?.());
    }
  };
  const _0x3e8691 = (_0x15bf7d, _0x335c72 = null) => {
    _0x3972d4.querySelectorAll?.("[data-workspace-project-sort-wrap]")?.forEach?.(_0x21d38c => {
      const _0x50f275 = Boolean(_0x15bf7d && (!_0x335c72 || _0x21d38c === _0x335c72));
      _0x21d38c.classList?.toggle?.("is-open", _0x50f275);
      _0x21d38c.querySelector?.("[data-workspace-action=\"toggle-project-sort-menu\"]")?.setAttribute?.("aria-expanded", String(_0x50f275));
      _0x21d38c.querySelector?.("[data-workspace-project-sort-menu]")?.setAttribute?.("aria-hidden", String(!_0x50f275));
    });
  };
  const _0x5026ec = () => {
    const _0x19ffca = captureVideoReplicationRenderContinuity(_0x3972d4, documentObject);
    _0x4ed613();
    if (_0x2e08a8.view === "project" && _0x2e08a8.project) {
      _0x3972d4.innerHTML = renderVideoReplicationProject(_0x2e08a8.project, {
        uploadingAssetKind: _0x2e08a8.uploadingAssetKind,
        libraryAssets: buildWorkspaceAssetLibraryItems({
          allowedTypes: ["image"]
        })
      }) + "\n      <input type=\"file\" class=\"story-hidden-input\" data-video-replication-source-input accept=\"video/*\" multiple>\n      <input type=\"file\" class=\"story-hidden-input\" data-video-replication-asset-input accept=\"image/*\" multiple>";
    } else {
      _0x3972d4.innerHTML = renderVideoReplicationHome({
        ..._0x2e08a8,
        ..._0x31d00f,
        analysisAvailable: typeof onStartAnalysis === "function"
      }) + "\n      <input type=\"file\" class=\"story-hidden-input\" data-video-replication-source-input accept=\"video/*\" multiple>\n      <input type=\"file\" class=\"story-hidden-input\" data-video-replication-asset-input accept=\"image/*\" multiple>";
    }
    restoreVideoReplicationRenderContinuity(_0x3972d4, _0x19ffca);
    _0x3b2869();
  };
  const _0x232ac7 = () => {
    const _0x5c3297 = _0x3972d4.querySelector?.("[data-video-replication-source-input]");
    if (_0x5c3297) {
      _0x5c3297.value = "";
    }
    _0x5c3297?.click?.();
  };
  const _0xcb12a3 = _0x3e34d5 => {
    const _0x2b8aa5 = _0x3972d4.querySelector?.("[data-video-replication-asset-input]");
    if (!_0x2b8aa5) {
      return;
    }
    _0x2b8aa5.value = "";
    _0x2b8aa5.dataset.assetKind = ["character", "scene", "prop"].includes(_0x3e34d5) ? _0x3e34d5 : "character";
    _0x2b8aa5.click?.();
  };
  const _0x22d2ed = _0x39ada0 => {
    const _0x3055fe = normalizeText(_0x39ada0?.dataset?.workspaceAction);
    const _0x357c39 = normalizeText(_0x39ada0?.dataset?.workspaceProjectId || _0x39ada0?.closest?.("[data-workspace-open-project]")?.dataset?.workspaceOpenProject);
    if (_0x3055fe === "toggle-project-sort-menu") {
      const _0x291853 = _0x39ada0.closest?.("[data-workspace-project-sort-wrap]");
      const _0x430c8b = !_0x291853?.classList?.contains?.("is-open");
      _0x3e8691(_0x430c8b, _0x291853);
      return true;
    }
    if (_0x3055fe === "select-project-sort") {
      _0x31d00f.projectSortOrder = normalizeWorkspaceProjectSortOrder(_0x39ada0.dataset.workspaceProjectSortOption);
      _0x5026ec();
      return true;
    }
    if (_0x3055fe === "toggle-project-menu") {
      _0x3e8691(false);
      _0x31d00f.openProjectMenuId = _0x31d00f.openProjectMenuId === _0x357c39 ? "" : _0x357c39;
      _0x31d00f.pendingDeleteProjectId = "";
      _0x5026ec();
      return true;
    }
    if (_0x3055fe === "request-delete-project") {
      _0x31d00f.pendingDeleteProjectId = _0x357c39;
      _0x31d00f.openProjectMenuId = "";
      _0x5026ec();
      return true;
    }
    if (_0x3055fe === "cancel-delete-project") {
      _0x31d00f.pendingDeleteProjectId = "";
      _0x5026ec();
      return true;
    }
    if (_0x3055fe === "confirm-delete-project") {
      _0x31d00f.pendingDeleteProjectId = "";
      onDeleteProject?.(_0x357c39);
      return true;
    }
    if (_0x3055fe === "duplicate-project") {
      _0x31d00f.openProjectMenuId = "";
      onDuplicateProject?.(_0x357c39);
      return true;
    }
    if (_0x3055fe === "archive-project" || _0x3055fe === "unarchive-project") {
      _0x31d00f.openProjectMenuId = "";
      onArchiveProject?.(_0x357c39, _0x3055fe === "archive-project");
      return true;
    }
    if (_0x3055fe === "rename-project") {
      _0x31d00f.openProjectMenuId = "";
      _0x5026ec();
      _0x3972d4.querySelector?.("[data-workspace-project-title=\"" + _0x357c39 + "\"]")?.focus?.();
      return true;
    }
    return false;
  };
  const _0x58c27b = _0x38981a => {
    const _0x395d7f = _0x38981a.target?.closest?.("[data-workspace-action]");
    if (_0x395d7f && _0x3972d4.contains(_0x395d7f) && _0x22d2ed(_0x395d7f)) {
      return;
    }
    const _0x15af63 = _0x38981a.target?.closest?.("[data-video-replication-action]");
    if (_0x15af63 && _0x3972d4.contains(_0x15af63)) {
      const _0x2dc1a4 = _0x15af63.dataset.videoReplicationAction;
      if (_0x2dc1a4 === "choose-source-videos") {
        _0x232ac7();
      } else if (_0x2dc1a4 === "set-clip-limit") {
        onClipLimitChanged?.(normalizeClipLimit(_0x15af63.dataset.clipLimitSeconds));
      } else if (_0x2dc1a4 === "toggle-source-reference") {
        onSourceReferenceChanged?.(!_0x2e08a8.useSourceVideoReference);
      } else if (_0x2dc1a4 === "start-analysis") {
        onStartAnalysis?.();
      } else if (_0x2dc1a4 === "back-home") {
        onBackHome?.();
      } else if (_0x2dc1a4 === "toggle-archived-projects") {
        _0x31d00f.showArchivedProjects = !_0x31d00f.showArchivedProjects;
        _0x31d00f.openProjectMenuId = "";
        _0x31d00f.pendingDeleteProjectId = "";
        _0x5026ec();
      } else if (_0x2dc1a4 === "go-project-step") {
        onProjectStepChanged?.(Number(_0x15af63.dataset.projectStep));
      } else if (_0x2dc1a4 === "select-asset-tab") {
        onAssetTabChanged?.(_0x15af63.dataset.assetKind);
      } else if (_0x2dc1a4 === "select-asset") {
        onAssetSelected?.({
          kind: _0x15af63.dataset.assetKind,
          assetId: _0x15af63.dataset.assetId
        });
      } else if (_0x2dc1a4 === "choose-asset-images") {
        _0xcb12a3(_0x15af63.dataset.assetKind);
      } else if (_0x2dc1a4 === "remove-asset") {
        onRemoveAsset?.({
          kind: _0x15af63.dataset.assetKind,
          assetId: _0x15af63.dataset.assetId
        });
      } else if (_0x2dc1a4 === "select-episode") {
        onEpisodeSelected?.(_0x15af63.dataset.episodeId);
      } else if (_0x2dc1a4 === "select-clip") {
        onClipSelected?.(_0x15af63.dataset.clipId);
      } else if (_0x2dc1a4 === "select-episode-asset-tab") {
        onEpisodeAssetTabChanged?.(_0x15af63.dataset.episodeAssetTab);
      }
      return;
    }
    const _0x1569e5 = _0x38981a.target?.closest?.("[data-workspace-open-project]");
    if (_0x1569e5 && _0x3972d4.contains(_0x1569e5) && !_0x38981a.target?.closest?.("button, input, textarea, [contenteditable='true'], [role='menu']")) {
      onOpenProject?.(_0x1569e5.dataset.workspaceOpenProject);
    }
  };
  const _0x3507ee = _0x4bfdee => {
    if (_0x4bfdee.target?.matches?.("[data-video-replication-project-search]")) {
      _0x31d00f.projectSearchQuery = _0x4bfdee.target.value;
      const _0x540200 = Number(_0x4bfdee.target.selectionStart) || 0;
      const _0x559b2d = Number(_0x4bfdee.target.selectionEnd) || _0x540200;
      _0x5026ec();
      const _0x315b27 = _0x3972d4.querySelector?.("[data-video-replication-project-search]");
      try {
        _0x315b27?.focus?.({
          preventScroll: true
        });
      } catch {
        _0x315b27?.focus?.();
      }
      _0x315b27?.setSelectionRange?.(_0x540200, _0x559b2d);
      return;
    }
    if (_0x4bfdee.target?.matches?.("[data-video-replication-prompt-input]")) {
      onPromptChanged?.({
        episodeId: _0x4bfdee.target.dataset.episodeId,
        clipId: _0x4bfdee.target.dataset.clipId,
        prompt: _0x4bfdee.target.value ?? _0x4bfdee.target.innerText ?? ""
      });
      return;
    }
    if (_0x4bfdee.target?.matches?.("[data-video-replication-asset-description]")) {
      onAssetDescriptionChanged?.({
        kind: _0x4bfdee.target.dataset.assetKind,
        assetId: _0x4bfdee.target.dataset.assetId,
        description: _0x4bfdee.target.value
      });
    }
  };
  const _0x3f742a = _0x26fbe7 => {
    if (_0x26fbe7.target?.matches?.("[data-video-replication-source-input]")) {
      const _0x222d34 = Array.from(_0x26fbe7.target.files || []).filter(isVideoFile);
      onSourceVideosSelected?.(_0x222d34);
      return;
    }
    if (_0x26fbe7.target?.matches?.("[data-video-replication-asset-input]")) {
      const _0x1ce5f2 = Array.from(_0x26fbe7.target.files || []).filter(isImageFile);
      onAssetImagesSelected?.(_0x26fbe7.target.dataset.assetKind || "character", _0x1ce5f2);
      return;
    }
    if (_0x26fbe7.target?.matches?.("[data-workspace-project-title]")) {
      onRenameProject?.(_0x26fbe7.target.dataset.workspaceProjectTitle, _0x26fbe7.target.value);
    }
  };
  const _0x3bdad5 = _0x22b4d9 => {
    if (!_0x22b4d9.target?.closest?.("[data-video-replication-drop]")) {
      return;
    }
    _0x22b4d9.preventDefault();
  };
  const _0x29b269 = _0x1d74ed => {
    if (!_0x1d74ed.target?.closest?.("[data-video-replication-drop]")) {
      return;
    }
    _0x1d74ed.preventDefault();
    const _0x1884a6 = Array.from(_0x1d74ed.dataTransfer?.files || []).filter(isVideoFile);
    if (_0x1884a6.length) {
      onSourceVideosSelected?.(_0x1884a6);
    }
  };
  const _0x4614a3 = _0x1f5591 => {
    const _0xf36ee7 = (_0x4a98b9, _0x4b0912) => _0x22d2ed({
      dataset: {
        workspaceAction: _0x4b0912,
        workspaceProjectId: _0x4a98b9
      }
    });
    return a1460_0x5021e0({
      event: _0x1f5591,
      root: _0x3972d4,
      projects: _0x2e08a8.projects,
      commands: {
        openProject: _0x358634 => onOpenProject?.(_0x358634),
        renameProject: _0x3ef5f8 => _0xf36ee7(_0x3ef5f8, "rename-project"),
        duplicateProject: _0x5d93bf => _0xf36ee7(_0x5d93bf, "duplicate-project"),
        setProjectArchived: (_0x5e57fb, _0xd18972) => _0xf36ee7(_0x5e57fb, _0xd18972 ? "archive-project" : "unarchive-project"),
        requestDeleteProject: _0x19e5db => _0xf36ee7(_0x19e5db, "request-delete-project"),
        selectAsset: _0x44ab8a => onAssetSelected?.(_0x44ab8a),
        removeAsset: _0x33bf5c => onRemoveAsset?.(_0x33bf5c),
        selectClip: _0x2b5ecc => onClipSelected?.(_0x2b5ecc),
        selectEpisode: _0x575a12 => onEpisodeSelected?.(_0x575a12)
      }
    });
  };
  const _0x383255 = bindWorkspaceEntityContextMenu(_0x3972d4, {
    resolveItems: _0x4614a3,
    beforeOpen() {
      if (!_0x31d00f.openProjectMenuId) {
        return;
      }
      _0x31d00f.openProjectMenuId = "";
      _0x5026ec();
    }
  });
  const _0x1af500 = Object.freeze({
    open() {
      if (_0x288cae || !isVideoReplicationStudioAvailable(windowObject)) {
        return null;
      }
      _0x3972d4.hidden = false;
      _0x3972d4.setAttribute("aria-hidden", "false");
      _0x5026ec();
      return _0x1af500;
    },
    close() {
      if (_0x288cae) {
        return false;
      }
      _0x3972d4.hidden = true;
      _0x3972d4.setAttribute("aria-hidden", "true");
      return true;
    },
    setState(_0xd00a14 = {}) {
      if (_0x288cae) {
        return false;
      }
      _0x2e08a8 = {
        ..._0x2e08a8,
        ..._0xd00a14
      };
      _0x5026ec();
      return true;
    },
    getState() {
      return {
        ..._0x2e08a8
      };
    },
    destroy() {
      if (_0x288cae) {
        return;
      }
      _0x288cae = true;
      _0x4ed613();
      _0x3972d4.removeEventListener("click", _0x58c27b);
      _0x3972d4.removeEventListener("input", _0x3507ee);
      _0x3972d4.removeEventListener("change", _0x3f742a);
      _0x3972d4.removeEventListener("dragover", _0x3bdad5);
      _0x3972d4.removeEventListener("drop", _0x29b269);
      _0x383255();
      _0x3972d4.remove();
    }
  });
  _0x3972d4._videoReplicationWorkspaceApi = _0x1af500;
  _0x3972d4.addEventListener("click", _0x58c27b);
  _0x3972d4.addEventListener("input", _0x3507ee);
  _0x3972d4.addEventListener("change", _0x3f742a);
  _0x3972d4.addEventListener("dragover", _0x3bdad5);
  _0x3972d4.addEventListener("drop", _0x29b269);
  _0x5026ec();
  return _0x1af500;
}