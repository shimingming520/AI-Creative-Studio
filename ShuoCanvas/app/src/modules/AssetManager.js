import a885_0x5af3bf from "../core/stores/appStore.js";
import { MATERIAL_FOLDER_ICON_MARKUP, MATERIAL_TREE_CHEVRON_ICON_SVG } from "../components/sharedIconMarkup.js";
import { findAvailablePosition, generateId, screenToWorld } from "../core/math.js";
import { getImage } from "./storage.js";
import { fetchAssetsFromServer, fetchAssetCategorySettingsFromServer, saveAssetToServer, saveAssetCategoriesToServer, deleteAssetFromServer, saveAssetThumbToServer } from "../../api/projectsV2Api.js";
import { registerSidebarSubmenu } from "./sidebarSubmenuController.js";
import { createMaterialLibraryContextMenuController } from "./materialLibraryContextMenu.js";
import { removeAssetMentionAsset, setAssetMentionLibrarySettings, setAssetMentionAssets, upsertAssetMentionAsset } from "./assetMentionRegistry.js";
import { createReferenceFallbackThumbHtml } from "./referenceThumbnailFallback.js";
import { localPathToUrl } from "../utils/localMediaPath.js";
import { attachMediaElementPlaybackSource } from "../services/desktopMediaBlobSource.js";
import { prepareAssetNodeForRestore, prepareAssetNodesForRestore } from "./assetRestoreLayout.js";
import { getLocale, t } from "../i18n/index.js";
import { preloadCanvasImage } from "./canvasMediaScheduler.js";
import { playAssetCreateFly } from "./assetCreateFly.js";
import { fitAssetMaterialVideoThumbnail, getAssetMaterialVideoThumbnailKey, isAssetMaterialThumbnailUrl, isAssetMaterialVideoThumbnailUrl, resolveAssetMaterialVideoSourceUrl, resolveAssetNodeCoverThumbId, resolveAssetNodeCoverUrl, resolveAssetNodePreviewAspectRatio, resolveAssetNodePreviewUrl, resolveMaterialItemPreviewUrl, resolveMaterialItemThumbUrl } from "./assetCoverResolver.js";
import { upsertMediaAssetPackage } from "./assetPackageMedia.js";
import { saveMediaFilesDownload } from "../services/downloadSaveService.js";
import { buildMaterialCategoryRenamePlan, buildMaterialDownloadFiles, buildMaterialDuplicate, DEFAULT_MATERIAL_LIBRARY_CATEGORIES, deleteMaterialFolderParent, getMaterialAssetItems, getMaterialFolderAssetCounts, getMaterialLibraryGroups, isMaterialAssetFavorite, MATERIAL_LIBRARY_CATEGORY_LIMIT, normalizeMaterialFolderParents, renameMaterialFolderParent } from "./materialLibraryPolicy.js";
const DEFAULT_ASSET_CATEGORIES = DEFAULT_MATERIAL_LIBRARY_CATEGORIES;
const REPLACEMENT_STUDIO_CATEGORY = "替换工作室";
const REPLACEMENT_STUDIO_CATEGORY_ALIASES = Object.freeze([REPLACEMENT_STUDIO_CATEGORY, "替换工作室资产", "替换工作室入参"]);
const PROTECTED_ASSET_CATEGORIES = Object.freeze([...DEFAULT_ASSET_CATEGORIES, "剧本资产", ...REPLACEMENT_STUDIO_CATEGORY_ALIASES]);
const ASSET_CATEGORY_LIMIT = MATERIAL_LIBRARY_CATEGORY_LIMIT;
const HIDDEN_ASSET_CATEGORIES = ["出图历史"];
const HIDDEN_ASSET_KINDS = ["generation-history"];
const ASSET_CATEGORY_I18N_KEYS = Object.freeze({
  人物: "people",
  场景: "scenes",
  物品: "objects",
  风格: "styles",
  音效: "soundEffects",
  Others: "others",
  剧本资产: "storyWorkspace",
  替换工作室: "replacementStudio",
  替换工作室资产: "replacementStudio",
  替换工作室入参: "replacementStudio",
  出图历史: "history",
  自定义: "custom"
});
function assetManagerText(_0xab4b97, _0x7e122c = {}) {
  return t("assetManager." + _0xab4b97, _0x7e122c);
}
function _formatAssetCategoryLabel(_0x26db24) {
  const _0x1b781a = String(_0x26db24 || "").trim();
  const _0x4fc893 = ASSET_CATEGORY_I18N_KEYS[_0x1b781a];
  if (_0x4fc893) {
    return assetManagerText("categories." + _0x4fc893);
  } else {
    return _0x1b781a;
  }
}
function _escapeHtml(_0x5c1725) {
  return String(_0x5c1725 ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll("\"", "&quot;").replaceAll("'", "&#39;");
}
function _clonePlain(_0x16d6c4, _0x42fb12) {
  if (_0x16d6c4 == null) {
    return _0x42fb12;
  }
  try {
    return JSON.parse(JSON.stringify(_0x16d6c4));
  } catch (_0x2a8961) {
    return _0x42fb12;
  }
}
function _normalizeAssetType(_0x5e65a3) {
  const _0x5b3563 = String(_0x5e65a3 || "");
  if (_0x5b3563 === "text" || _0x5b3563 === "source-text" || _0x5b3563 === "ai-text") {
    return "text";
  }
  if (_0x5b3563 === "audio" || _0x5b3563 === "source-audio" || _0x5b3563 === "ai-audio") {
    return "audio";
  }
  if (_0x5b3563 === "video" || _0x5b3563 === "source-video" || _0x5b3563 === "ai-video") {
    return "video";
  }
  if (_0x5b3563 === "image" || _0x5b3563 === "source-image" || _0x5b3563 === "ai-image") {
    return "image";
  }
  return "other";
}
function _formatAssetTypeLabel(_0x5552ce) {
  const _0x3c4ea5 = _normalizeAssetType(_0x5552ce);
  return assetManagerText("types." + _0x3c4ea5);
}
function _resolveNodeStableThumbSrc(_0x1502c8) {
  if (!_0x1502c8) {
    return "";
  }
  const _0x3e5e9b = _0x1502c8.thumbLocalPath || _0x1502c8.displayLocalPath || _0x1502c8.localPath || _0x1502c8.originalLocalPath;
  if (_0x3e5e9b) {
    return localPathToUrl(_0x3e5e9b) || (String(_0x3e5e9b).startsWith("/") ? String(_0x3e5e9b) : "/" + String(_0x3e5e9b).replace(/^\/+/, ""));
  }
  if (_0x1502c8.thumbUrl && typeof _0x1502c8.thumbUrl === "string") {
    return _0x1502c8.thumbUrl;
  }
  return String(_0x1502c8.src || _0x1502c8.imageUrl || "");
}
function _renderAssetIcon(_0x5832f8) {
  const _0x45e984 = _normalizeAssetType(_0x5832f8);
  if (_0x45e984 === "text") {
    return createReferenceFallbackThumbHtml("text", "v2-asset-icon");
  }
  if (_0x45e984 === "audio") {
    return createReferenceFallbackThumbHtml("audio", "v2-asset-icon");
  }
  if (_0x45e984 === "video") {
    return "<div class=\"v2-asset-icon v2-asset-icon--video\" aria-hidden=\"true\">\n      <svg class=\"v2-asset-icon-svg\" viewBox=\"0 0 24 24\" fill=\"currentColor\" opacity=\"0.5\">\n        <polygon points=\"5 3 19 12 5 21 5 3\" />\n      </svg>\n    </div>";
  }
  return "<div class=\"v2-asset-icon v2-asset-icon--other\" aria-hidden=\"true\">\n    <svg class=\"v2-asset-icon-svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"var(--text-muted)\" stroke-width=\"1.5\">\n      <rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"2\" />\n    </svg>\n  </div>";
}
function _buildAssetItem(_0x1ae425) {
  const _0x347a8c = _0x1ae425?.type || "other";
  const _0x3fb5cd = resolveAssetNodeCoverUrl(_0x1ae425) || _resolveNodeStableThumbSrc(_0x1ae425);
  return {
    type: _0x347a8c,
    name: _0x1ae425?.name || "",
    thumbSrc: _0x3fb5cd || "",
    nodeData: _0x1ae425
  };
}
function _resolveMaterialItemThumbSrc(_0x376daf) {
  return String(resolveMaterialItemThumbUrl(_0x376daf) || _resolveNodeStableThumbSrc(_0x376daf?.nodeData) || "");
}
function _resolveMaterialItemPreviewSrc(_0x30798a) {
  return String(resolveMaterialItemPreviewUrl(_0x30798a) || _resolveMaterialItemThumbSrc(_0x30798a));
}
function _sortAssetsByUpdatedTime(_0x1da8b6) {
  return [...(Array.isArray(_0x1da8b6) ? _0x1da8b6 : [])].sort((_0x2ce3c4, _0x165984) => {
    const _0x1d5370 = Number(_0x2ce3c4?.updatedAt || _0x2ce3c4?.createdAt || 0);
    const _0x172301 = Number(_0x165984?.updatedAt || _0x165984?.createdAt || 0);
    return _0x172301 - _0x1d5370;
  });
}
function _formatAssetDateTime(_0x49b9d7) {
  const _0x54a63f = Number(_0x49b9d7);
  if (!Number.isFinite(_0x54a63f) || _0x54a63f <= 0) {
    return assetManagerText("unknownTime");
  }
  return new Date(_0x54a63f).toLocaleString(getLocale(), {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  });
}
class AssetManager {
  constructor() {
    this.createPanel = null;
    this.createPanelBackdrop = null;
    this._createPanelKeydownHandler = null;
    this._createPanelDropdownOutsideHandler = null;
    this._createPanelDropdownEl = null;
    this._createPanelCoverObjectUrl = "";
    this._createPanelState = null;
    this.sidebarPanel = null;
    this._openAssetId = null;
    this._thumbPreloadSet = new Set();
    this._thumbDecodePromiseMap = new Map();
    this._videoThumbInFlight = new Set();
    this._videoThumbTimer = 0;
    this._sidebarRenderRaf = 0;
    this._pendingDeleteAssetId = "";
    this._renamingAssetId = "";
    this._renamingMaterialItemKey = "";
    this._savingMaterialItemKey = "";
    this._newAssetPulseId = "";
    this._sidebarTabsLayoutRaf = 0;
    this._assetPackageUpsertByKey = new Map();
    this._materialSearchQuery = "";
    this._materialFavoritesOnly = false;
    this._expandedMaterialCategories = new Set();
    this._expandedMaterialAssets = new Set();
    this._pendingMaterialFolderDeleteKey = "";
    this._deletingMaterialFolderKey = "";
    this._renamingMaterialCategoryKey = "";
    this._savingMaterialCategoryKey = "";
    this._materialMenuEl = null;
    this._materialMenuState = null;
    this._materialMenuOutsideHandler = null;
    this._materialMenuKeydownHandler = null;
    this._materialAssetRowClickTimer = 0;
    this._materialAssetRowClickToggle = null;
    this._materialPreviewEl = null;
    this._materialPreviewRow = null;
    this._materialDropTarget = null;
    this._materialLoadingCount = 0;
    this.activeTab = "人物";
    this._materialCurrentFolderCategory = this.activeTab;
    this.tabs = [...DEFAULT_ASSET_CATEGORIES];
    this.userCategories = [];
    this.materialCategoryDisplayNames = {};
    this.materialCategoryParents = {};
    this._materialCategorySaveQueue = Promise.resolve();
    this.assets = [];
    this._materialContextMenuController = createMaterialLibraryContextMenuController({
      getPanel: () => this.sidebarPanel,
      getText: _0x41a687 => assetManagerText(_0x41a687),
      closeAssetMenu: () => this._closeMaterialMenu(),
      openAssetMenu: (_0x2e4f7d, _0x465368) => this._openMaterialMenu(_0x2e4f7d, _0x465368),
      restoreAssetSubItem: (_0x115623, _0xc7a590) => this._restoreAssetSubItem(_0x115623, _0xc7a590)
    });
    this.initSidebarPanel();
    this.loadAssetCategoriesFromServer();
    this._assetLoadPromise = this.loadAssetsFromServer();
  }
  _getSortedAssets() {
    return _sortAssetsByUpdatedTime((this.assets || []).filter(_0x2e4f60 => this._isManagedAsset(_0x2e4f60)));
  }
  _normalizeCategoryName(_0x2af71a) {
    return String(_0x2af71a || "").trim();
  }
  _canonicalCategoryName(_0x26c799) {
    const _0x46a223 = this._normalizeCategoryName(_0x26c799);
    if (REPLACEMENT_STUDIO_CATEGORY_ALIASES.some(_0x180be1 => _0x180be1.toLocaleLowerCase() === _0x46a223.toLocaleLowerCase())) {
      return REPLACEMENT_STUDIO_CATEGORY;
    }
    return _0x46a223;
  }
  _categoryKey(_0x25f149) {
    return this._canonicalCategoryName(_0x25f149).toLocaleLowerCase();
  }
  _isDefaultCategory(_0x4bfb86) {
    return !!this._findCategoryByName(_0x4bfb86, DEFAULT_ASSET_CATEGORIES);
  }
  _isProtectedCategory(_0x4691d4) {
    return !!this._findCategoryByName(_0x4691d4, PROTECTED_ASSET_CATEGORIES);
  }
  _isHiddenAssetCategory(_0x572c4c) {
    return !!this._findCategoryByName(_0x572c4c, HIDDEN_ASSET_CATEGORIES);
  }
  _isManagedAsset(_0x1bbcbf) {
    if (!_0x1bbcbf || typeof _0x1bbcbf !== "object") {
      return false;
    }
    if (HIDDEN_ASSET_KINDS.includes(String(_0x1bbcbf?.kind || "").trim().toLowerCase())) {
      return false;
    }
    return !this._isHiddenAssetCategory(_0x1bbcbf?.category);
  }
  _findCategoryByName(_0x1f3390, _0x54002a = this.tabs) {
    const _0x22e4fe = this._categoryKey(_0x1f3390);
    if (!_0x22e4fe) {
      return "";
    }
    return (_0x54002a || []).find(_0x165ad8 => this._categoryKey(_0x165ad8) === _0x22e4fe) || "";
  }
  _normalizeUserCategories(_0x126cf1 = []) {
    const _0xc9113e = [];
    const _0x4dd29c = _0x52288e => {
      const _0x2d0d96 = this._normalizeCategoryName(_0x52288e);
      if (!_0x2d0d96) {
        return;
      }
      if (this._isProtectedCategory(_0x2d0d96) || this._isHiddenAssetCategory(_0x2d0d96)) {
        return;
      }
      if (this._findCategoryByName(_0x2d0d96, _0xc9113e)) {
        return;
      }
      if (DEFAULT_ASSET_CATEGORIES.length + _0xc9113e.length >= ASSET_CATEGORY_LIMIT) {
        return;
      }
      _0xc9113e.push(_0x2d0d96);
    };
    (Array.isArray(_0x126cf1) ? _0x126cf1 : []).forEach(_0x4dd29c);
    return _0xc9113e;
  }
  _normalizeCategoryDisplayNames(_0x165de9 = {}) {
    const _0x53f60d = {};
    if (!_0x165de9 || typeof _0x165de9 !== "object") {
      return _0x53f60d;
    }
    for (const [_0x468869, _0x1505f2] of Object.entries(_0x165de9)) {
      const _0x57371e = this._canonicalCategoryName(_0x468869);
      const _0x324f5c = this._normalizeCategoryName(_0x1505f2);
      if (!_0x57371e || !_0x324f5c || !this._isProtectedCategory(_0x57371e)) {
        continue;
      }
      if (_0x324f5c === _formatAssetCategoryLabel(_0x57371e)) {
        continue;
      }
      _0x53f60d[_0x57371e] = _0x324f5c;
    }
    return _0x53f60d;
  }
  _normalizeMaterialCategoryParents(_0x4c817c = this.materialCategoryParents, _0x67a92a = this.userCategories) {
    return normalizeMaterialFolderParents({
      parents: _0x4c817c,
      userCategories: _0x67a92a,
      allCategories: this._getAssetCategories(),
      categoryKey: _0x5a4962 => this._categoryKey(_0x5a4962)
    });
  }
  _getMaterialParentCategory(_0x3bb1f) {
    const _0x541410 = this._categoryKey(_0x3bb1f);
    if (!_0x541410) {
      return "";
    }
    return Object.entries(this.materialCategoryParents || {}).find(([_0x183668]) => this._categoryKey(_0x183668) === _0x541410)?.[1] || "";
  }
  _createUniqueMaterialFolderName() {
    const _0x5dfb3b = this._normalizeCategoryName(assetManagerText("newFolder"));
    if (!this._findCategoryByName(_0x5dfb3b, this._getAssetCategories())) {
      return _0x5dfb3b;
    }
    for (let _0x39245f = 2; _0x39245f <= ASSET_CATEGORY_LIMIT; _0x39245f += 1) {
      const _0x26be44 = _0x5dfb3b + " " + _0x39245f;
      if (!this._findCategoryByName(_0x26be44, this._getAssetCategories())) {
        return _0x26be44;
      }
    }
    return "";
  }
  _createMaterialFolder({
    parentCategory: _0xf1d437,
    surface = "sidebar"
  } = {}) {
    const _0x928b15 = this._normalizeCategoryName(_0xf1d437);
    const _0x5740c3 = this._findCategoryByName(_0x928b15, this._getAssetCategories());
    const _0x1e209a = this._createUniqueMaterialFolderName();
    if (_0x928b15 && !_0x5740c3 || !_0x1e209a) {
      window.showToast?.(assetManagerText("categoryLimit", {
        limit: ASSET_CATEGORY_LIMIT
      }), "warn");
      return "";
    }
    const _0x24d911 = this._addUserCategory(_0x1e209a, {
      parentCategory: _0x5740c3
    });
    if (!_0x24d911) {
      return "";
    }
    const _0x2754c7 = this._categoryKey(_0x5740c3);
    const _0x120cdf = this._categoryKey(_0x24d911);
    this._materialCurrentFolderCategory = _0x24d911;
    this._renamingMaterialCategoryKey = _0x120cdf;
    if (_0x2754c7) {
      this._expandedMaterialCategories.add(_0x2754c7);
    }
    if (surface === "create-panel" && this._createPanelState) {
      const _0x3e48ab = new Set(this._createPanelState.expandedFolderKeys || []);
      if (_0x2754c7) {
        _0x3e48ab.add(_0x2754c7);
      }
      const _0x56c6fa = [...(this._createPanelState.customCategories || [])];
      if (!this._findCategoryByName(_0x24d911, _0x56c6fa)) {
        _0x56c6fa.push(_0x24d911);
      }
      this._setCreatePanelState({
        draft: {
          category: _0x24d911
        },
        selectedFolderCategory: _0x24d911,
        customCategories: _0x56c6fa,
        expandedFolderKeys: _0x3e48ab,
        editingFolderCategory: _0x24d911,
        editingFolderDraft: _0x24d911,
        pendingFolderDeleteKey: "",
        error: ""
      });
      this._renderCreatePanelFolderTree({
        focusRename: true
      });
      return _0x24d911;
    }
    this.renderSidebarContent();
    this._focusMaterialCategoryRenameInput(_0x120cdf, {
      select: true
    });
    return _0x24d911;
  }
  _formatCategoryLabel(_0x151199) {
    const _0xa8b78e = this._canonicalCategoryName(_0x151199);
    return this.materialCategoryDisplayNames?.[_0xa8b78e] || _formatAssetCategoryLabel(_0xa8b78e);
  }
  _isUserCategory(_0x55fac9) {
    return !!this._findCategoryByName(_0x55fac9, this.userCategories);
  }
  _getAssetCategories(_0x406d07 = "") {
    const _0x251d1e = [];
    const _0x3c7b29 = _0x4ce768 => {
      const _0x2e6925 = this._canonicalCategoryName(_0x4ce768);
      if (!_0x2e6925) {
        return;
      }
      if (this._isHiddenAssetCategory(_0x2e6925)) {
        return;
      }
      if (this._findCategoryByName(_0x2e6925, _0x251d1e)) {
        return;
      }
      if (_0x251d1e.length >= ASSET_CATEGORY_LIMIT) {
        return;
      }
      _0x251d1e.push(_0x2e6925);
    };
    DEFAULT_ASSET_CATEGORIES.forEach(_0x3c7b29);
    for (const _0x443add of this.userCategories || []) {
      _0x3c7b29(_0x443add);
    }
    for (const _0x2540b6 of this._getSortedAssets()) {
      _0x3c7b29(_0x2540b6?.category);
    }
    _0x3c7b29(_0x406d07);
    return _0x251d1e;
  }
  _syncTabsFromAssets() {
    this.tabs = this._getAssetCategories();
    setAssetMentionLibrarySettings({
      categories: this.tabs,
      displayNames: this.materialCategoryDisplayNames,
      parents: this.materialCategoryParents
    });
    if (!this._findCategoryByName(this.activeTab, this.tabs)) {
      this.activeTab = DEFAULT_ASSET_CATEGORIES[0];
      this._openAssetId = null;
    }
  }
  _renderSidebarTabsHtml() {
    return (this.tabs || []).map(_0x5398fa => {
      const _0x3c3630 = this._categoryKey(_0x5398fa) === this._categoryKey(this.activeTab) ? " active" : "";
      const _0x22d95b = _escapeHtml(_0x5398fa);
      const _0x20970f = _escapeHtml(this._formatCategoryLabel(_0x5398fa));
      const _0x5f4ec0 = this._isUserCategory(_0x5398fa) ? "<button\n              type=\"button\"\n              class=\"v2-asset-category-delete\"\n              data-ui-action=\"asset-category-delete\"\n              data-cat=\"" + _0x22d95b + "\"\n              aria-label=\"" + _escapeHtml(assetManagerText("deleteCategoryAria", {
        category: this._formatCategoryLabel(_0x5398fa)
      })) + "\"\n            >×</button>" : "";
      return "\n          <div class=\"v2-asset-sidebar-tab" + _0x3c3630 + "\" data-cat=\"" + _0x22d95b + "\">\n            <span class=\"v2-asset-sidebar-tab-text\">" + _0x20970f + "</span>\n            " + _0x5f4ec0 + "\n          </div>\n        ";
    }).join("");
  }
  _renderSidebarTabs() {
    const _0x20e341 = this.sidebarPanel?.querySelector("#asset-sidebar-tabs");
    if (!_0x20e341) {
      if (this.sidebarPanel?.classList.contains("show")) {
        this.renderSidebarContent();
      }
      return;
    }
    _0x20e341.innerHTML = this._renderSidebarTabsHtml();
    this._queueSidebarTabsLayoutSync();
  }
  _queueSidebarTabsLayoutSync() {
    if (!this.sidebarPanel) {
      return;
    }
    if (this._sidebarTabsLayoutRaf) {
      window.cancelAnimationFrame?.(this._sidebarTabsLayoutRaf);
    }
    this._sidebarTabsLayoutRaf = window.requestAnimationFrame(() => {
      this._sidebarTabsLayoutRaf = 0;
      this._syncSidebarTabsViewport();
    });
  }
  _syncSidebarTabsViewport() {
    const _0x38949b = this.sidebarPanel?.querySelector("#asset-sidebar-tabs");
    if (!_0x38949b) {
      return;
    }
    const _0x2d204a = _0x38949b.querySelector(".v2-asset-sidebar-tab.active");
    if (_0x2d204a && _0x38949b.clientWidth > 0) {
      if (this._isDefaultCategory(this.activeTab)) {
        _0x38949b.scrollLeft = 0;
      } else {
        const _0x46c340 = _0x2d204a.offsetLeft;
        const _0x109732 = _0x46c340 + _0x2d204a.offsetWidth;
        const _0x1d1d31 = _0x38949b.scrollLeft;
        const _0x3f9f77 = _0x1d1d31 + _0x38949b.clientWidth;
        if (_0x46c340 < _0x1d1d31) {
          _0x38949b.scrollLeft = _0x46c340;
        } else if (_0x109732 > _0x3f9f77) {
          _0x38949b.scrollLeft = _0x109732 - _0x38949b.clientWidth;
        }
      }
    }
    this._updateSidebarTabsOverflowHint();
  }
  _updateSidebarTabsOverflowHint() {
    const _0x4629cf = this.sidebarPanel?.querySelector("#asset-sidebar-tabs-shell");
    const _0x5d9b72 = this.sidebarPanel?.querySelector("#asset-sidebar-tabs");
    if (!_0x4629cf || !_0x5d9b72) {
      return;
    }
    const _0x47d47a = Math.max(0, _0x5d9b72.scrollWidth - _0x5d9b72.clientWidth);
    const _0x1d8099 = _0x47d47a > 2;
    const _0x100218 = !_0x1d8099 || _0x5d9b72.scrollLeft <= 2;
    const _0x1e492b = !_0x1d8099 || _0x5d9b72.scrollLeft >= _0x47d47a - 2;
    _0x4629cf.classList.toggle("has-overflow", _0x1d8099);
    _0x4629cf.classList.toggle("is-at-start", _0x100218);
    _0x4629cf.classList.toggle("is-at-end", _0x1e492b);
    const _0x22cf78 = _0x4629cf.querySelector(".v2-asset-sidebar-tabs-nav--prev");
    const _0x1647cf = _0x4629cf.querySelector(".v2-asset-sidebar-tabs-nav--next");
    if (_0x22cf78) {
      _0x22cf78.hidden = !_0x1d8099 || _0x100218;
    }
    if (_0x1647cf) {
      _0x1647cf.hidden = !_0x1d8099 || _0x1e492b;
    }
  }
  _scrollSidebarTabs(_0x323e91 = 1) {
    const _0x58adc9 = this.sidebarPanel?.querySelector("#asset-sidebar-tabs");
    if (!_0x58adc9) {
      return;
    }
    const _0x3c3640 = Math.max(1, Math.floor(_0x58adc9.clientWidth * 0.75));
    const _0x8acc60 = _0x58adc9.scrollLeft + _0x3c3640 * (_0x323e91 < 0 ? -1 : 1);
    if (typeof _0x58adc9.scrollTo === "function") {
      _0x58adc9.scrollTo({
        left: _0x8acc60,
        behavior: "smooth"
      });
    } else {
      _0x58adc9.scrollLeft = _0x8acc60;
    }
    window.setTimeout(() => this._updateSidebarTabsOverflowHint(), 220);
  }
  _getCreatePanelCategories() {
    const _0x59ce9e = this._getAssetCategories();
    const _0x4adaba = _0x2b1531 => {
      const _0x16ff40 = this._normalizeCategoryName(_0x2b1531);
      if (!_0x16ff40) {
        return;
      }
      if (this._findCategoryByName(_0x16ff40, _0x59ce9e)) {
        return;
      }
      _0x59ce9e.push(_0x16ff40);
    };
    for (const _0xf29b96 of this._createPanelState?.customCategories || []) {
      _0x4adaba(_0xf29b96);
    }
    _0x4adaba(this._createPanelState?.draft?.category || this.activeTab);
    return _0x59ce9e;
  }
  _canAddCustomCategory() {
    return this._getCreatePanelCategories().length < ASSET_CATEGORY_LIMIT;
  }
  async loadAssetCategoriesFromServer() {
    try {
      const _0x2f6588 = await fetchAssetCategorySettingsFromServer();
      this.userCategories = this._normalizeUserCategories(_0x2f6588.categories);
      this.materialCategoryDisplayNames = this._normalizeCategoryDisplayNames(_0x2f6588.displayNames);
      this.materialCategoryParents = this._normalizeMaterialCategoryParents(_0x2f6588.parents, this.userCategories);
      this._syncTabsFromAssets();
      this._renderSidebarTabs();
      if (this.sidebarPanel?.classList.contains("show")) {
        this.renderSidebarContent();
      }
    } catch (_0x5aaa99) {
      console.error("加载素材分类失败", _0x5aaa99);
    }
  }
  async _saveUserCategories() {
    const _0x3f9f29 = this._normalizeUserCategories(this.userCategories);
    this.userCategories = _0x3f9f29;
    this.materialCategoryParents = this._normalizeMaterialCategoryParents(this.materialCategoryParents, _0x3f9f29);
    await this._saveMaterialCategorySettings(_0x3f9f29, this.materialCategoryDisplayNames, this.materialCategoryParents);
  }
  async _saveMaterialCategorySettings(_0x29d705 = this.userCategories, _0x211458 = this.materialCategoryDisplayNames, _0x5b3a95 = this.materialCategoryParents) {
    const _0xdb2a6f = [..._0x29d705];
    const _0x54d7f8 = {
      ...(_0x211458 || {})
    };
    const _0x3f7362 = {
      ...(_0x5b3a95 || {})
    };
    const _0x2ca45a = () => saveAssetCategoriesToServer(_0xdb2a6f, {
      displayNames: _0x54d7f8,
      parents: _0x3f7362
    });
    const _0x22004b = this._materialCategorySaveQueue.catch(() => {}).then(_0x2ca45a);
    this._materialCategorySaveQueue = _0x22004b;
    await _0x22004b;
  }
  _addUserCategory(_0x5e1170, {
    parentCategory = ""
  } = {}) {
    const _0x79770 = this._normalizeCategoryName(_0x5e1170);
    if (!_0x79770 || this._isProtectedCategory(_0x79770) || this._isHiddenAssetCategory(_0x79770)) {
      return "";
    }
    const _0x449a78 = this._findCategoryByName(_0x79770, this.userCategories);
    if (_0x449a78) {
      return _0x449a78;
    }
    if (DEFAULT_ASSET_CATEGORIES.length + this.userCategories.length >= ASSET_CATEGORY_LIMIT) {
      window.showToast?.(assetManagerText("categoryLimit", {
        limit: ASSET_CATEGORY_LIMIT
      }), "warn");
      return "";
    }
    this.userCategories = this._normalizeUserCategories([...this.userCategories, _0x79770]);
    const _0x29de2b = this._findCategoryByName(parentCategory, this._getAssetCategories());
    if (_0x29de2b && this._categoryKey(_0x29de2b) !== this._categoryKey(_0x79770)) {
      this.materialCategoryParents = this._normalizeMaterialCategoryParents({
        ...this.materialCategoryParents,
        [_0x79770]: _0x29de2b
      }, this.userCategories);
    }
    this._syncTabsFromAssets();
    this._renderSidebarTabs();
    this._saveUserCategories().catch(_0x23eed3 => {
      console.error("保存素材分类失败", _0x23eed3);
      window.showToast?.(assetManagerText("categorySaveFailed"), "error");
    });
    return _0x79770;
  }
  _getMentionEligibleAssets() {
    return this._getSortedAssets().filter(_0x3df2e5 => this._findCategoryByName(_0x3df2e5?.category, this.tabs));
  }
  _normalizeAssetEntity(_0x427027) {
    if (!_0x427027 || typeof _0x427027 !== "object") {
      return null;
    }
    const _0x4582a0 = {
      ..._0x427027
    };
    const _0xfc070d = Number(_0x4582a0.createdAt || 0);
    const _0x59c66b = Number(_0x4582a0.updatedAt || _0xfc070d || 0);
    if (_0xfc070d > 0) {
      _0x4582a0.createdAt = _0xfc070d;
    } else {
      delete _0x4582a0.createdAt;
    }
    if (_0x59c66b > 0) {
      _0x4582a0.updatedAt = _0x59c66b;
    } else if (_0xfc070d > 0) {
      _0x4582a0.updatedAt = _0xfc070d;
    }
    if (Array.isArray(_0x4582a0.nodes) && _0x4582a0.nodes[0] && !isAssetMaterialThumbnailUrl(_0x4582a0.coverUrl)) {
      _0x4582a0.coverUrl = resolveAssetNodeCoverUrl(_0x4582a0.nodes[0]) || _0x4582a0.coverUrl || "";
    }
    const _0x47d338 = getMaterialAssetItems(_0x4582a0);
    if (_0x47d338.length > 0) {
      _0x4582a0.items = _0x47d338.map(_0x439f83 => ({
        ..._0x439f83,
        thumbSrc: _resolveMaterialItemThumbSrc(_0x439f83)
      }));
    }
    return _0x4582a0;
  }
  _upsertLocalAsset(_0x54adbb) {
    const _0x3c40e0 = this._normalizeAssetEntity(_0x54adbb);
    if (!_0x3c40e0?.id) {
      return;
    }
    const _0x4aaffc = Array.isArray(this.assets) ? this.assets : [];
    const _0xb6a0fa = _0x4aaffc.filter(_0x540345 => String(_0x540345?.id || "") !== String(_0x3c40e0.id));
    this.assets = _sortAssetsByUpdatedTime([_0x3c40e0, ..._0xb6a0fa]);
    this._syncTabsFromAssets();
    this._renderSidebarTabs();
    if (this._findCategoryByName(_0x3c40e0.category, this.tabs)) {
      upsertAssetMentionAsset(_0x3c40e0);
    } else {
      removeAssetMentionAsset(_0x3c40e0.id);
    }
  }
  _getSelectedAssetNodes(_0x30af70) {
    const _0x1596eb = Array.isArray(_0x30af70) ? _0x30af70 : [];
    const _0x25075f = a885_0x5af3bf.getState();
    return _0x1596eb.map(_0x136592 => _0x25075f.nodes[_0x136592]).filter(Boolean);
  }
  _getSelectedAssetEdges(_0x33cfa5) {
    const _0xc71753 = Array.isArray(_0x33cfa5) ? _0x33cfa5 : [];
    const _0xce0306 = new Set(_0xc71753);
    const _0x4899f8 = a885_0x5af3bf.getState();
    return Object.values(_0x4899f8.edges || {}).filter(_0x2fd9b0 => _0xce0306.has(_0x2fd9b0?.sourceId) && _0xce0306.has(_0x2fd9b0?.targetId));
  }
  _buildCreatePanelCoverInfo(_0x34ccc2, _0x3bb50d = "") {
    const _0x523432 = String(_0x3bb50d || "").trim();
    const _0x5427ad = _0x34ccc2?.type || "other";
    return {
      coverUrl: _0x523432,
      coverType: _0x5427ad,
      aspectRatio: resolveAssetNodePreviewAspectRatio(_0x34ccc2),
      coverHtml: _0x523432 ? "<img src=\"" + _escapeHtml(_0x523432) + "\" alt=\"" + _escapeHtml(assetManagerText("coverAlt")) + "\" id=\"asset-create-cover-img\" draggable=\"false\" />" : _renderAssetIcon(_0x5427ad)
    };
  }
  async _resolveCreatePanelCover(_0x262e3d, _0x20e1b0 = {}) {
    const _0x3be0af = _0x20e1b0.preferPreview === true ? resolveAssetNodePreviewUrl(_0x262e3d) : resolveAssetNodeCoverUrl(_0x262e3d);
    if (_0x3be0af) {
      return {
        ...this._buildCreatePanelCoverInfo(_0x262e3d, _0x3be0af),
        objectUrl: ""
      };
    }
    let _0x3781ad = "";
    let _0x203b06 = "";
    const _0x47559d = resolveAssetNodeCoverThumbId(_0x262e3d);
    if (_0x47559d) {
      try {
        const _0x45c809 = await getImage(_0x47559d);
        const _0x349beb = String(_0x45c809?.type || "").trim().toLowerCase();
        if (_0x45c809 && (!_0x349beb || _0x349beb.startsWith("image/"))) {
          _0x203b06 = URL.createObjectURL(_0x45c809);
          _0x3781ad = _0x203b06;
        }
      } catch (_0x2d1c39) {}
    }
    return {
      ...this._buildCreatePanelCoverInfo(_0x262e3d, _0x3781ad),
      objectUrl: _0x203b06
    };
  }
  _applyCreatePanelCoverAspect(_0x2afd10, _0x356ddb) {
    if (!_0x2afd10) {
      return;
    }
    const _0x2d5a9e = Number(_0x356ddb) > 0 ? Number(_0x356ddb) : 4 / 3;
    _0x2afd10.style.setProperty("--asset-create-cover-aspect", String(_0x2d5a9e));
    _0x2afd10.style.setProperty("--asset-create-cover-width-limit", _0x2d5a9e * 100 + "cqh");
    _0x2afd10.style.setProperty("--asset-create-cover-height-limit", 100 / _0x2d5a9e + "cqw");
  }
  _applyCreatePanelCoverInfo(_0x411cb0, _0x398d17) {
    const _0x4085ca = String(_0x398d17?.objectUrl || "");
    if (!_0x411cb0 || this.createPanel !== _0x411cb0 || !this._createPanelState) {
      if (_0x4085ca.startsWith("blob:")) {
        URL.revokeObjectURL(_0x4085ca);
      }
      return false;
    }
    if (this._createPanelCoverObjectUrl && this._createPanelCoverObjectUrl !== _0x4085ca && this._createPanelCoverObjectUrl.startsWith("blob:")) {
      URL.revokeObjectURL(this._createPanelCoverObjectUrl);
    }
    this._createPanelCoverObjectUrl = _0x4085ca;
    const _0x436a4f = {
      coverUrl: String(_0x398d17?.coverUrl || ""),
      coverType: _0x398d17?.coverType || "other",
      aspectRatio: Number(_0x398d17?.aspectRatio) > 0 ? Number(_0x398d17.aspectRatio) : Number(this._createPanelState?.coverInfo?.aspectRatio) || 4 / 3,
      coverHtml: _0x398d17?.coverHtml || _renderAssetIcon(_0x398d17?.coverType || "other")
    };
    this._setCreatePanelState({
      coverInfo: _0x436a4f
    });
    const _0x30f3ce = _0x411cb0.querySelector(".v2-asset-create-cover");
    if (_0x30f3ce) {
      _0x30f3ce.innerHTML = _0x436a4f.coverHtml;
      this._applyCreatePanelCoverAspect(_0x30f3ce, _0x436a4f.aspectRatio);
    }
    return true;
  }
  _buildAssetPayloadFromSelection(_0x266959, _0x212f34 = {}) {
    const _0xe3d62f = this._getSelectedAssetNodes(_0x266959);
    const _0x29444b = _0xe3d62f[0] || null;
    const _0x4c19b9 = Date.now();
    const _0x1273c2 = String(_0x212f34.name || "").trim() || assetManagerText("unnamedAsset");
    const _0x2a1f4f = String(_0x212f34.category || "").trim() || this.activeTab;
    const _0x1b4437 = _0x29444b?.type || "other";
    const _0x56c1b5 = resolveAssetNodeCoverUrl(_0x29444b);
    const _0x53425c = String(_0x212f34.id || "").trim();
    const _0x165906 = Number(_0x212f34.createdAt || _0x4c19b9) || _0x4c19b9;
    const _0x2b2e37 = Number(_0x212f34.updatedAt || _0x4c19b9) || _0x4c19b9;
    return {
      id: _0x53425c || generateId("asset"),
      name: _0x1273c2,
      category: _0x2a1f4f,
      coverUrl: _0x56c1b5,
      coverType: _0x1b4437,
      items: _0xe3d62f.map(_0x16d3dc => _buildAssetItem(_0x16d3dc)),
      nodes: _0xe3d62f,
      edges: this._getSelectedAssetEdges(_0x266959),
      createdAt: _0x165906,
      updatedAt: _0x2b2e37
    };
  }
  _buildAssetAppendPayload(_0x4f9d35, _0x16822b, _0x47fda6 = {}) {
    const _0x4dffb6 = this._getSelectedAssetNodes(_0x16822b);
    const _0x221117 = this._getSelectedAssetEdges(_0x16822b);
    const _0x543ca4 = Date.now();
    const _0x1c2a71 = {};
    const _0x5da0fd = _0x4dffb6.map(_0xf5612f => {
      const _0x5931df = _clonePlain(_0xf5612f, {
        ..._0xf5612f
      });
      const _0x386b00 = String(_0x5931df.id || "");
      const _0x4fce40 = generateId(_0x5931df.type);
      if (_0x386b00) {
        _0x1c2a71[_0x386b00] = _0x4fce40;
      }
      _0x5931df.id = _0x4fce40;
      return _0x5931df;
    });
    const _0x4d1b60 = _0x221117.map(_0x11d110 => {
      const _0xbabb8e = _clonePlain(_0x11d110, {
        ..._0x11d110
      });
      _0xbabb8e.id = generateId("edge");
      if (_0x1c2a71[_0xbabb8e.sourceId]) {
        _0xbabb8e.sourceId = _0x1c2a71[_0xbabb8e.sourceId];
      }
      if (_0x1c2a71[_0xbabb8e.targetId]) {
        _0xbabb8e.targetId = _0x1c2a71[_0xbabb8e.targetId];
      }
      return _0xbabb8e;
    });
    const _0x548dc3 = Array.isArray(_0x4f9d35?.nodes) ? _clonePlain(_0x4f9d35.nodes, []) : [];
    const _0x189217 = Array.isArray(_0x4f9d35?.items) ? _clonePlain(_0x4f9d35.items, []) : _0x548dc3.map(_0x27de30 => _buildAssetItem(_0x27de30));
    const _0x108f72 = Array.isArray(_0x4f9d35?.edges) ? _clonePlain(_0x4f9d35.edges, []) : [];
    const _0x34b0a0 = _0x5da0fd[0] || null;
    const _0x2f7b53 = _0x34b0a0 ? resolveAssetNodeCoverUrl(_0x34b0a0) : "";
    const _0x428bf0 = _0x4f9d35?.coverUrl || _0x2f7b53;
    const _0x2eff09 = _0x4f9d35?.coverType || _0x34b0a0?.type || "other";
    return {
      ...(_0x4f9d35 || {}),
      id: _0x4f9d35?.id,
      name: String(_0x47fda6.name || "").trim() || assetManagerText("unnamedAsset"),
      category: String(_0x47fda6.category || "").trim() || this.activeTab,
      coverUrl: _0x428bf0,
      coverType: _0x2eff09,
      items: [..._0x189217, ..._0x5da0fd.map(_0x154fc4 => _buildAssetItem(_0x154fc4))],
      nodes: [..._0x548dc3, ..._0x5da0fd],
      edges: [..._0x108f72, ..._0x4d1b60],
      createdAt: Number(_0x4f9d35?.createdAt || _0x4f9d35?.updatedAt || _0x543ca4) || _0x543ca4,
      updatedAt: Number(_0x47fda6.updatedAt || _0x543ca4) || _0x543ca4
    };
  }
  _createDefaultPanelState(_0x51430b, _0x379e40, _0x57f771 = {}) {
    const _0x462297 = String(_0x57f771.defaultName || "").trim();
    return {
      selectedIds: [..._0x51430b],
      presentation: _0x57f771.presentation === "library-save" ? "library-save" : "default",
      mode: "create",
      selectedAssetId: "",
      updateSearchKeyword: "",
      updateConfirmOpen: false,
      expandedFolderKeys: new Set(),
      selectedFolderCategory: "",
      editingFolderCategory: "",
      editingFolderDraft: "",
      folderActionBusyKey: "",
      pendingFolderDeleteKey: "",
      deletingFolderKey: "",
      customCategoryEditing: false,
      customCategoryDraft: "",
      customCategories: [],
      error: "",
      saving: false,
      savingAction: "",
      draft: {
        name: _0x462297 || assetManagerText("newAsset"),
        category: this.activeTab
      },
      coverInfo: _0x379e40 || {
        coverUrl: "",
        coverType: "other",
        aspectRatio: 4 / 3,
        coverHtml: _renderAssetIcon("other")
      }
    };
  }
  _setCreatePanelState(_0x47c8ce = {}) {
    if (!this._createPanelState) {
      return;
    }
    const _0x225b7b = this._createPanelState;
    const _0x150ab9 = _0x47c8ce.draft ? {
      ...(_0x225b7b.draft || {}),
      ..._0x47c8ce.draft
    } : _0x225b7b.draft;
    this._createPanelState = {
      ..._0x225b7b,
      ..._0x47c8ce,
      draft: _0x150ab9
    };
  }
  _getUpdateListCategory() {
    const _0x4ea994 = this._normalizeCategoryName(this._createPanelState?.draft?.category);
    if (this._createPanelState?.mode === "update" && _0x4ea994) {
      return _0x4ea994;
    }
    return this._findCategoryByName(this.activeTab, this.tabs) || this.activeTab;
  }
  _getFilteredUpdateAssets(_0x1841cd = "") {
    const _0x19d848 = String(_0x1841cd || "").trim().toLowerCase();
    const _0x19563b = this._categoryKey(this._getUpdateListCategory());
    const _0xbf850e = this._getSortedAssets().filter(_0x9775de => this._categoryKey(_0x9775de?.category) === _0x19563b);
    if (!_0x19d848) {
      return _0xbf850e;
    }
    return _0xbf850e.filter(_0x3637bd => String(_0x3637bd?.name || "").toLowerCase().includes(_0x19d848));
  }
  _syncCreatePanelDraftFromTarget(_0x34d8ff) {
    this._setCreatePanelState({
      draft: {
        name: String(_0x34d8ff?.name || "").trim() || assetManagerText("unnamedAsset"),
        category: String(_0x34d8ff?.category || "").trim() || this.activeTab
      },
      selectedAssetId: String(_0x34d8ff?.id || ""),
      updateConfirmOpen: false,
      customCategoryEditing: false,
      customCategoryDraft: "",
      error: ""
    });
  }
  _syncUpdateSelectionForCategory(_0x175a66) {
    if (this._createPanelState?.mode !== "update") {
      return;
    }
    const _0xb4561d = this._normalizeCategoryName(_0x175a66) || this.activeTab;
    this._setCreatePanelState({
      draft: {
        category: _0xb4561d
      },
      selectedAssetId: "",
      updateSearchKeyword: "",
      updateConfirmOpen: false,
      error: ""
    });
    const _0x4b2c8a = this._getFilteredUpdateAssets()[0] || null;
    if (!_0x4b2c8a) {
      return;
    }
    this._setCreatePanelState({
      draft: {
        name: String(_0x4b2c8a?.name || "").trim() || assetManagerText("unnamedAsset"),
        category: String(_0x4b2c8a?.category || "").trim() || _0xb4561d
      },
      selectedAssetId: String(_0x4b2c8a?.id || "")
    });
  }
  _getCreatePanelFolderEntries() {
    const _0x234bb6 = this._getSortedAssets();
    const _0x441b42 = this._getCreatePanelCategories().map(_0x1ffeba => {
      const _0x3cd120 = _0x234bb6.filter(_0xe96294 => this._categoryKey(_0xe96294?.category) === this._categoryKey(_0x1ffeba));
      return {
        category: _0x1ffeba,
        assets: _0x3cd120
      };
    });
    const _0x57a77d = getMaterialFolderAssetCounts({
      groups: _0x441b42,
      parents: this.materialCategoryParents,
      categoryKey: _0x1804ef => this._categoryKey(_0x1804ef)
    });
    return _0x441b42.map(_0x5b3999 => ({
      ..._0x5b3999,
      count: _0x57a77d.get(this._categoryKey(_0x5b3999.category)) ?? _0x5b3999.assets.length
    }));
  }
  _renderCreatePanelFolderAssetHtml(_0xad7f3) {
    const _0x20f16a = getMaterialAssetItems(_0xad7f3);
    const _0x1d7989 = _0x20f16a[0] || null;
    const _0x3cd4bc = _resolveMaterialItemThumbSrc(_0x1d7989) || String(_0xad7f3?.coverUrl || "");
    const _0x39c796 = _0x1d7989?.type || _0xad7f3?.coverType || "other";
    const _0x32abff = _0x3cd4bc && !this._isNonImageMediaSrc(_0x3cd4bc) ? "<img src=\"" + _escapeHtml(_0x3cd4bc) + "\" alt=\"\" loading=\"lazy\" decoding=\"async\" draggable=\"false\" />" : _renderAssetIcon(_0x39c796);
    return "\n      <div class=\"v2-material-asset-row\" role=\"treeitem\">\n        <button type=\"button\" class=\"v2-material-asset-toggle\" disabled aria-hidden=\"true\" tabindex=\"-1\"></button>\n        <div class=\"v2-material-asset-use\">\n          <span class=\"v2-material-row-thumb\" aria-hidden=\"true\">" + _0x32abff + "</span>\n          <span class=\"v2-material-asset-name\">" + _escapeHtml(_0xad7f3?.name || assetManagerText("unnamedAsset")) + "</span>\n        </div>\n      </div>\n    ";
  }
  _createMaterialFolderSection({
    category: _0x2cde99,
    count = 0,
    expanded = false,
    canManageFolder = false,
    isRenamingFolder = false,
    isSavingFolder = false,
    isDeleteConfirming = false,
    isDeletingFolder = false,
    isDeleteRequested = false,
    actionPrefix = "material-folder",
    renameValue = ""
  } = {}) {
    const _0x4364a5 = this._normalizeCategoryName(_0x2cde99);
    const _0x50a3b9 = this._categoryKey(_0x4364a5);
    const _0x2d450c = this._formatCategoryLabel(_0x4364a5);
    const _0x55f089 = _0x2e321a => actionPrefix + "-" + _0x2e321a;
    const _0x41b27c = document.createElement("section");
    _0x41b27c.className = "v2-material-folder";
    _0x41b27c.dataset.category = _0x4364a5;
    _0x41b27c.setAttribute("role", "treeitem");
    _0x41b27c.setAttribute("aria-expanded", expanded ? "true" : "false");
    _0x41b27c.classList.toggle("is-delete-shaking", canManageFolder && isDeleteRequested);
    const _0x3ed689 = document.createElement("div");
    _0x3ed689.className = "v2-material-folder-row";
    _0x3ed689.classList.toggle("has-delete-actions", canManageFolder);
    _0x3ed689.classList.toggle("is-renaming", isRenamingFolder);
    _0x3ed689.classList.toggle("is-saving", isSavingFolder);
    const _0x3298ff = document.createElement("button");
    _0x3298ff.type = "button";
    _0x3298ff.className = "v2-material-folder-toggle";
    _0x3298ff.dataset.uiAction = _0x55f089("toggle");
    _0x3298ff.dataset.category = _0x4364a5;
    _0x3298ff.setAttribute("aria-expanded", expanded ? "true" : "false");
    _0x3298ff.setAttribute("aria-label", assetManagerText(expanded ? "collapseFolder" : "expandFolder", {
      name: _0x2d450c
    }));
    _0x3298ff.disabled = isRenamingFolder || isDeletingFolder;
    _0x3298ff.innerHTML = "\n      <span class=\"v2-material-tree-chevron" + (expanded ? " is-open" : "") + "\" aria-hidden=\"true\">\n        " + MATERIAL_TREE_CHEVRON_ICON_SVG + "\n      </span>\n      <span class=\"v2-material-folder-icon\" aria-hidden=\"true\">\n        " + MATERIAL_FOLDER_ICON_MARKUP + "\n      </span>\n    ";
    _0x3ed689.appendChild(_0x3298ff);
    if (isRenamingFolder) {
      const _0x88194e = document.createElement("input");
      _0x88194e.type = "text";
      _0x88194e.className = "v2-material-folder-name-input";
      _0x88194e.dataset.category = _0x4364a5;
      _0x88194e.dataset.categoryKey = _0x50a3b9;
      _0x88194e.value = String(renameValue || _0x2d450c);
      _0x88194e.maxLength = 32;
      _0x88194e.disabled = isSavingFolder;
      _0x88194e.setAttribute("aria-label", assetManagerText("renameCategoryAria", {
        category: _0x2d450c
      }));
      if (isSavingFolder) {
        _0x88194e.setAttribute("aria-busy", "true");
      }
      _0x3ed689.appendChild(_0x88194e);
    } else if (canManageFolder) {
      const _0x11a700 = document.createElement("button");
      _0x11a700.type = "button";
      _0x11a700.className = "v2-material-folder-name is-renameable";
      _0x11a700.dataset.uiAction = _0x55f089("rename");
      _0x11a700.dataset.category = _0x4364a5;
      _0x11a700.setAttribute("aria-label", assetManagerText("renameCategoryAria", {
        category: _0x2d450c
      }));
      _0x11a700.textContent = _0x2d450c;
      _0x3ed689.appendChild(_0x11a700);
    } else {
      const _0x97db59 = document.createElement("span");
      _0x97db59.className = "v2-material-folder-name";
      _0x97db59.textContent = _0x2d450c;
      _0x3ed689.appendChild(_0x97db59);
    }
    if (canManageFolder) {
      const _0x1ae243 = document.createElement("div");
      _0x1ae243.className = "v2-material-folder-delete-actions";
      _0x1ae243.classList.toggle("is-confirming", isDeleteConfirming);
      _0x1ae243.classList.toggle("is-busy", isDeletingFolder);
      _0x1ae243.setAttribute("aria-busy", isDeletingFolder ? "true" : "false");
      if (isDeletingFolder) {
        const _0x2f06f5 = document.createElement("span");
        _0x2f06f5.className = "v2-material-folder-delete-pending";
        _0x2f06f5.setAttribute("role", "status");
        _0x2f06f5.setAttribute("aria-live", "polite");
        _0x2f06f5.setAttribute("aria-label", assetManagerText("menu.processing"));
        _0x2f06f5.innerHTML = "<span aria-hidden=\"true\"></span>";
        _0x1ae243.appendChild(_0x2f06f5);
      } else if (isDeleteConfirming) {
        const _0x519457 = document.createElement("button");
        _0x519457.type = "button";
        _0x519457.className = "v2-material-folder-delete-choice is-confirm";
        _0x519457.dataset.uiAction = _0x55f089("delete-confirm");
        _0x519457.dataset.category = _0x4364a5;
        _0x519457.textContent = assetManagerText("confirm");
        _0x519457.setAttribute("aria-label", assetManagerText("confirm") + " " + _0x2d450c);
        const _0x20f145 = document.createElement("button");
        _0x20f145.type = "button";
        _0x20f145.className = "v2-material-folder-delete-choice is-cancel";
        _0x20f145.dataset.uiAction = _0x55f089("delete-cancel");
        _0x20f145.dataset.category = _0x4364a5;
        _0x20f145.textContent = assetManagerText("cancel");
        _0x20f145.setAttribute("aria-label", assetManagerText("cancel") + " " + _0x2d450c);
        _0x1ae243.append(_0x519457, _0x20f145);
      } else {
        const _0x15452a = document.createElement("button");
        _0x15452a.type = "button";
        _0x15452a.className = "v2-material-folder-delete-trigger";
        _0x15452a.dataset.uiAction = _0x55f089("delete-request");
        _0x15452a.dataset.category = _0x4364a5;
        _0x15452a.setAttribute("aria-label", assetManagerText("deleteCategoryAria", {
          category: _0x2d450c
        }));
        _0x15452a.innerHTML = "\n          <svg viewBox=\"0 0 24 24\" aria-hidden=\"true\" fill=\"none\">\n            <path d=\"M4 7h16M9 3h6l1 4H8l1-4Zm-2 4 1 14h8l1-14M10 11v6m4-6v6\" stroke=\"currentColor\" stroke-width=\"1.7\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/>\n          </svg>\n        ";
        _0x1ae243.appendChild(_0x15452a);
      }
      _0x3ed689.appendChild(_0x1ae243);
    }
    const _0x1aea8b = document.createElement("span");
    _0x1aea8b.className = "v2-material-folder-count";
    _0x1aea8b.textContent = String(count);
    _0x3ed689.appendChild(_0x1aea8b);
    _0x41b27c.appendChild(_0x3ed689);
    const _0x326e18 = document.createElement("div");
    _0x326e18.className = "v2-material-folder-content";
    _0x326e18.setAttribute("role", "group");
    _0x326e18.hidden = !expanded;
    _0x41b27c.appendChild(_0x326e18);
    return {
      section: _0x41b27c,
      folderRow: _0x3ed689,
      folderContent: _0x326e18,
      folderToggle: _0x3298ff
    };
  }
  _nestMaterialFolderSections(_0x369e0d) {
    if (!_0x369e0d) {
      return;
    }
    const _0x10f1e3 = Array.from(_0x369e0d.querySelectorAll(":scope > .v2-material-folder"));
    const _0x5a1633 = new Map(_0x10f1e3.map(_0x828529 => [this._categoryKey(_0x828529.dataset.category), _0x828529]));
    for (const _0x12c6f1 of _0x10f1e3) {
      const _0x166837 = _0x12c6f1.dataset.category;
      const _0x2fd930 = this._getMaterialParentCategory(_0x166837);
      const _0x5573b6 = _0x5a1633.get(this._categoryKey(_0x2fd930));
      if (!_0x5573b6 || _0x5573b6 === _0x12c6f1) {
        continue;
      }
      const _0x1fcd49 = _0x5573b6.querySelector(":scope > .v2-material-folder-content");
      if (!_0x1fcd49) {
        continue;
      }
      _0x1fcd49.querySelector(":scope > .v2-material-folder-empty")?.remove();
      _0x12c6f1.classList.add("is-nested");
      const _0x5d8ef4 = Array.from(_0x1fcd49.children).find(_0x48c570 => !_0x48c570.classList.contains("v2-material-folder"));
      _0x1fcd49.insertBefore(_0x12c6f1, _0x5d8ef4 || null);
    }
  }
  _renderCreatePanelFolderTree(_0x3e1723 = {}) {
    const _0x557616 = this.createPanel?.querySelector("[data-asset-create-folder-tree]");
    const _0x285244 = this._createPanelState;
    if (!_0x557616 || !_0x285244) {
      return;
    }
    const _0x21d6ee = _0x557616.scrollTop;
    const _0x139d20 = this._normalizeCategoryName(_0x285244.selectedFolderCategory);
    const _0x5a60ac = this._categoryKey(_0x139d20);
    const _0x2326b0 = _0x285244.expandedFolderKeys instanceof Set ? _0x285244.expandedFolderKeys : new Set();
    const _0x239d01 = this._categoryKey(_0x285244.editingFolderCategory);
    const _0x53604c = String(_0x285244.folderActionBusyKey || "");
    const _0x971a35 = String(_0x285244.pendingFolderDeleteKey || "");
    const _0xd69edd = String(_0x285244.deletingFolderKey || "");
    const _0x10d17e = document.createDocumentFragment();
    this._getCreatePanelFolderEntries().forEach(({
      category: _0x8a40dd,
      count: _0x5e03b3,
      assets: _0x51f5fb
    }) => {
      const _0x36323e = this._categoryKey(_0x8a40dd);
      const _0x3025bd = this._isUserCategory(_0x8a40dd);
      const _0x4cc8d2 = _0x2326b0.has(_0x36323e);
      const _0x265f15 = _0x3025bd && _0x239d01 === _0x36323e;
      const _0x61afa1 = _0x3025bd && _0xd69edd === _0x36323e;
      const {
        section: _0x432443,
        folderContent: _0xca8a1b
      } = this._createMaterialFolderSection({
        category: _0x8a40dd,
        count: _0x5e03b3,
        expanded: _0x4cc8d2,
        canManageFolder: _0x3025bd,
        isRenamingFolder: _0x265f15,
        isSavingFolder: _0x265f15 && _0x53604c === _0x36323e,
        isDeleteConfirming: _0x3025bd && (_0x971a35 === _0x36323e || _0x61afa1),
        isDeletingFolder: _0x61afa1,
        isDeleteRequested: _0x971a35 === _0x36323e,
        actionPrefix: "asset-create-folder",
        renameValue: _0x285244.editingFolderDraft
      });
      _0x432443.dataset.assetCreateFolder = "";
      _0x432443.setAttribute("aria-selected", _0x36323e === _0x5a60ac ? "true" : "false");
      _0xca8a1b.innerHTML = _0x51f5fb.length ? _0x51f5fb.map(_0x42a17c => this._renderCreatePanelFolderAssetHtml(_0x42a17c)).join("") : "<div class=\"v2-material-folder-empty\">" + _escapeHtml(assetManagerText("emptyFolder")) + "</div>";
      _0x10d17e.appendChild(_0x432443);
    });
    _0x557616.replaceChildren(_0x10d17e);
    this._nestMaterialFolderSections(_0x557616);
    _0x557616.scrollTop = _0x21d6ee;
    this._syncCreatePanelError();
    if (_0x3e1723.focusRename === true) {
      window.requestAnimationFrame(() => {
        const _0x4d79b = _0x557616.querySelector(".v2-material-folder-name-input");
        _0x4d79b?.focus();
        _0x4d79b?.select?.();
      });
    }
  }
  _syncCreatePanelError() {
    const _0x500251 = this.createPanel?.querySelector(".v2-asset-create-error");
    if (!_0x500251) {
      return;
    }
    const _0x3ec644 = String(this._createPanelState?.error || "");
    _0x500251.textContent = _0x3ec644;
    _0x500251.hidden = !_0x3ec644;
  }
  _renderLibrarySavePanelContent() {
    const _0x2391b0 = this.createPanel;
    const _0x453f81 = this._createPanelState;
    if (!_0x2391b0 || !_0x453f81) {
      return;
    }
    const _0x119325 = Array.isArray(_0x453f81.selectedIds) ? _0x453f81.selectedIds.length : 0;
    const _0xec91ba = _0x453f81.coverInfo || {};
    const _0x55322a = _0xec91ba.coverHtml || _renderAssetIcon(_0xec91ba.coverType || "other");
    const _0x20a449 = Number(_0xec91ba.aspectRatio) > 0 ? Number(_0xec91ba.aspectRatio) : 4 / 3;
    const _0x4e33b6 = _0x453f81.saving ? assetManagerText("createPanel.saving") : assetManagerText("createPanel.save");
    _0x2391b0.innerHTML = "\n      <div class=\"v2-asset-create-header v2-asset-create-header--library-save\">\n        <div class=\"v2-asset-create-title\">\n          <span class=\"v2-asset-create-header-text\">" + assetManagerText("createPanel.saveTitle") + "</span>\n        </div>\n        <button\n          type=\"button\"\n          class=\"v2-asset-create-new-folder\"\n          data-ui-action=\"asset-create-new-folder\"\n        >\n          <svg viewBox=\"0 0 24 24\" fill=\"none\" aria-hidden=\"true\">\n            <path d=\"M12 5v14M5 12h14\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\"/>\n          </svg>\n          <span>" + assetManagerText("newFolder") + "</span>\n        </button>\n      </div>\n      <div class=\"v2-asset-create-modal-body v2-asset-create-modal-body--library-save\">\n        <div class=\"v2-asset-create-library-layout\">\n          <section class=\"v2-asset-create-source-panel\">\n            <div class=\"v2-asset-create-source-header\">\n              <div class=\"v2-asset-create-source-title\">" + assetManagerText("createPanel.currentSelection") + "</div>\n              <div class=\"v2-asset-create-source-scope\">" + assetManagerText("createPanel.selectedNodes", {
      count: _0x119325
    }) + "</div>\n            </div>\n            <div class=\"v2-asset-create-preview-stage\">\n              <div class=\"v2-asset-create-cover\">\n                " + _0x55322a + "\n              </div>\n            </div>\n            <label class=\"v2-asset-create-field\" for=\"asset-create-name\">\n              <span class=\"v2-asset-create-label\">" + assetManagerText("createPanel.assetName") + "</span>\n              <input\n                type=\"text\"\n                id=\"asset-create-name\"\n                placeholder=\"" + _escapeHtml(assetManagerText("createPanel.assetNamePlaceholder")) + "\"\n                value=\"" + _escapeHtml(_0x453f81.draft?.name || "") + "\"\n                autocomplete=\"off\"\n              />\n            </label>\n            <div class=\"v2-asset-create-error\" role=\"alert\"" + (_0x453f81.error ? "" : " hidden") + ">" + _escapeHtml(_0x453f81.error || "") + "</div>\n          </section>\n          <section class=\"v2-asset-create-library-pane\">\n            <div\n              class=\"v2-asset-create-folder-list v2-material-library-tree\"\n              data-asset-create-folder-tree\n              role=\"tree\"\n              aria-label=\"" + _escapeHtml(assetManagerText("createPanel.folderListAria")) + "\"\n            >\n            </div>\n          </section>\n        </div>\n      </div>\n      <div class=\"v2-asset-create-footer v2-asset-create-footer--library-save\">\n        <button\n          type=\"button\"\n          class=\"v2-asset-create-btn v2-asset-create-btn--secondary\"\n          data-ui-action=\"asset-create-cancel\"\n          " + (_0x453f81.saving ? "disabled" : "") + "\n        >" + assetManagerText("cancel") + "</button>\n        <button\n          type=\"button\"\n          class=\"v2-asset-create-btn\"\n          id=\"asset-create-submit\"\n          aria-busy=\"" + (_0x453f81.saving ? "true" : "false") + "\"\n          " + (_0x453f81.saving ? "disabled" : "") + "\n        >\n          <span class=\"v2-asset-create-submit-spinner\" aria-hidden=\"true\"" + (_0x453f81.saving ? "" : " hidden") + "></span>\n          <span>" + _0x4e33b6 + "</span>\n        </button>\n      </div>\n    ";
    this._applyCreatePanelCoverAspect(_0x2391b0.querySelector(".v2-asset-create-cover"), _0x20a449);
    this._renderCreatePanelFolderTree();
    this._bindLibrarySavePanelEvents();
  }
  _bindLibrarySavePanelEvents() {
    const _0xe9dbd = this.createPanel;
    const _0x5d5983 = this._createPanelState;
    if (!_0xe9dbd || !_0x5d5983) {
      return;
    }
    _0xe9dbd.querySelector("[data-ui-action='asset-create-cancel']")?.addEventListener("click", () => this.closeCreatePanel());
    _0xe9dbd.querySelector("[data-ui-action='asset-create-new-folder']")?.addEventListener("click", () => {
      this._createMaterialFolder({
        parentCategory: this._createPanelState?.selectedFolderCategory || "",
        surface: "create-panel"
      });
    });
    const _0x4305ba = _0xe9dbd.querySelector("[data-asset-create-folder-tree]");
    _0x4305ba?.addEventListener("click", _0x5beb05 => {
      const _0x27c2b8 = _0x5beb05.target.closest("[data-ui-action]");
      const _0x59cd29 = String(_0x27c2b8?.dataset?.uiAction || "");
      const _0x58fb8c = this._normalizeCategoryName(_0x27c2b8?.dataset?.category);
      if (_0x59cd29 === "asset-create-folder-rename" && _0x58fb8c) {
        this._beginCreatePanelFolderRename(_0x58fb8c);
        return;
      }
      if (_0x59cd29 === "asset-create-folder-delete-request" && _0x58fb8c) {
        if (!this._isUserCategory(_0x58fb8c)) {
          return;
        }
        this._setCreatePanelState({
          pendingFolderDeleteKey: this._categoryKey(_0x58fb8c),
          error: ""
        });
        this._renderCreatePanelFolderTree();
        return;
      }
      if (_0x59cd29 === "asset-create-folder-delete-cancel") {
        this._setCreatePanelState({
          pendingFolderDeleteKey: ""
        });
        this._renderCreatePanelFolderTree();
        return;
      }
      if (_0x59cd29 === "asset-create-folder-delete-confirm" && _0x58fb8c) {
        this._deleteCreatePanelFolder(_0x58fb8c);
        return;
      }
      if (_0x59cd29 === "asset-create-folder-toggle" && _0x58fb8c) {
        this._toggleCreatePanelFolderDisclosure(_0x58fb8c);
        return;
      }
      if (_0x59cd29 || _0x5beb05.target.closest("input, button, [contenteditable='true'], .v2-material-folder-delete-actions")) {
        return;
      }
      const _0x151a77 = _0x5beb05.target.closest(".v2-material-folder-row");
      const _0x2d06a8 = _0x151a77?.querySelector("[data-ui-action='asset-create-folder-toggle']");
      if (_0x2d06a8 && !_0x2d06a8.disabled && _0x5beb05.detail <= 1) {
        this._toggleCreatePanelFolderDisclosure(_0x2d06a8.dataset.category);
        return;
      }
      if (_0x5beb05.target === _0x4305ba && this._createPanelState?.selectedFolderCategory) {
        this._setCreatePanelState({
          selectedFolderCategory: ""
        });
        this._renderCreatePanelFolderTree();
      }
    });
    _0x4305ba?.addEventListener("input", _0x2a9ca4 => {
      const _0x54c2f4 = _0x2a9ca4.target.closest(".v2-material-folder-name-input");
      if (!_0x54c2f4) {
        return;
      }
      this._setCreatePanelState({
        editingFolderDraft: _0x54c2f4.value || "",
        error: ""
      });
      this._syncCreatePanelError();
    });
    _0x4305ba?.addEventListener("keydown", _0x527a61 => {
      const _0x3e74db = _0x527a61.target.closest(".v2-material-folder-name-input");
      if (!_0x3e74db) {
        return;
      }
      if (_0x527a61.key === "Enter" && !_0x527a61.isComposing) {
        _0x527a61.preventDefault();
        _0x527a61.stopPropagation();
        _0x3e74db.dataset.submitted = "1";
        this._commitCreatePanelFolderRename(_0x3e74db.dataset.category, _0x3e74db.value);
        return;
      }
      if (_0x527a61.key === "Escape") {
        _0x527a61.preventDefault();
        _0x527a61.stopPropagation();
        _0x3e74db.dataset.submitted = "1";
        this._renamingMaterialCategoryKey = "";
        this._setCreatePanelState({
          editingFolderCategory: "",
          editingFolderDraft: "",
          folderActionBusyKey: "",
          error: ""
        });
        this._renderCreatePanelFolderTree();
      }
    });
    _0x4305ba?.addEventListener("focusout", _0x306390 => {
      const _0x2d7271 = _0x306390.target.closest(".v2-material-folder-name-input");
      if (!_0x2d7271 || _0x2d7271.dataset.submitted === "1") {
        return;
      }
      _0x2d7271.dataset.submitted = "1";
      this._commitCreatePanelFolderRename(_0x2d7271.dataset.category, _0x2d7271.value);
    });
    const _0x21cfd7 = _0xe9dbd.querySelector("#asset-create-name");
    _0x21cfd7?.addEventListener("input", _0x543b9e => {
      this._setCreatePanelState({
        draft: {
          name: _0x543b9e.currentTarget?.value || ""
        },
        error: ""
      });
    });
    _0x21cfd7?.addEventListener("keydown", _0x559fb0 => {
      if (_0x559fb0.key !== "Enter" || _0x559fb0.isComposing) {
        return;
      }
      _0x559fb0.preventDefault();
      this._submitCreatePanel();
    });
    _0xe9dbd.querySelector("#asset-create-submit")?.addEventListener("click", () => {
      this._submitCreatePanel();
    });
  }
  _toggleCreatePanelFolderDisclosure(_0x15814a) {
    const _0x23532d = this._findCategoryByName(_0x15814a, this.tabs);
    const _0x27d2c7 = this._categoryKey(_0x23532d);
    if (!_0x23532d || !_0x27d2c7) {
      return;
    }
    this._materialCurrentFolderCategory = _0x23532d;
    const _0x56b846 = new Set(this._createPanelState?.expandedFolderKeys || []);
    if (_0x56b846.has(_0x27d2c7)) {
      _0x56b846.delete(_0x27d2c7);
    } else {
      _0x56b846.add(_0x27d2c7);
    }
    this._setCreatePanelState({
      draft: {
        category: _0x23532d
      },
      selectedFolderCategory: _0x23532d,
      expandedFolderKeys: _0x56b846,
      error: ""
    });
    this._renderCreatePanelFolderTree();
  }
  _beginCreatePanelFolderRename(_0x476229) {
    const _0x593934 = this._findCategoryByName(_0x476229, this.tabs);
    const _0x344294 = this._categoryKey(_0x593934);
    if (!_0x593934 || !_0x344294 || !this._isUserCategory(_0x593934) || this._createPanelState?.folderActionBusyKey) {
      return;
    }
    this._materialCurrentFolderCategory = _0x593934;
    this._renamingMaterialCategoryKey = _0x344294;
    this._setCreatePanelState({
      editingFolderCategory: _0x593934,
      editingFolderDraft: this._formatCategoryLabel(_0x593934),
      pendingFolderDeleteKey: "",
      error: ""
    });
    this._renderCreatePanelFolderTree({
      focusRename: true
    });
  }
  async _deleteCreatePanelFolder(_0x12c7cb) {
    const _0x1a534a = this._findCategoryByName(_0x12c7cb, this.tabs);
    const _0x3e3943 = this._categoryKey(_0x1a534a);
    if (!_0x1a534a || !_0x3e3943 || !this._isUserCategory(_0x1a534a) || this._createPanelState?.pendingFolderDeleteKey !== _0x3e3943 || this._createPanelState?.deletingFolderKey) {
      return false;
    }
    const _0x51c1f2 = this._categoryKey(this._createPanelState.draft?.category) === _0x3e3943;
    const _0x3a9e93 = this._categoryKey(this._createPanelState.selectedFolderCategory) === _0x3e3943;
    this._setCreatePanelState({
      pendingFolderDeleteKey: "",
      deletingFolderKey: _0x3e3943,
      folderActionBusyKey: _0x3e3943,
      error: ""
    });
    this._renderCreatePanelFolderTree();
    const _0x1e1a72 = await this._deleteUserCategory(_0x1a534a);
    if (!this.createPanel || !this._createPanelState) {
      return _0x1e1a72;
    }
    if (!_0x1e1a72) {
      this._setCreatePanelState({
        deletingFolderKey: "",
        folderActionBusyKey: ""
      });
      this._renderCreatePanelFolderTree();
      return false;
    }
    const _0x7cf917 = this._findCategoryByName("Others", this.tabs) || this.tabs[0] || DEFAULT_ASSET_CATEGORIES[0];
    const _0x2aa442 = new Set(this._createPanelState.expandedFolderKeys || []);
    _0x2aa442.delete(_0x3e3943);
    const _0x3ee53c = (this._createPanelState.customCategories || []).filter(_0x4435e1 => this._categoryKey(_0x4435e1) !== _0x3e3943);
    this._setCreatePanelState({
      draft: _0x51c1f2 ? {
        category: _0x7cf917
      } : undefined,
      selectedFolderCategory: _0x3a9e93 ? "" : this._createPanelState.selectedFolderCategory,
      customCategories: _0x3ee53c,
      expandedFolderKeys: _0x2aa442,
      editingFolderCategory: "",
      editingFolderDraft: "",
      pendingFolderDeleteKey: "",
      deletingFolderKey: "",
      folderActionBusyKey: "",
      error: ""
    });
    this._renderCreatePanelFolderTree();
    return true;
  }
  async _commitCreatePanelFolderRename(_0x21f86a, _0x88352c) {
    const _0x1ae8fa = this._findCategoryByName(_0x21f86a, this.tabs);
    const _0x10b7e3 = this._categoryKey(_0x1ae8fa);
    if (!_0x1ae8fa || !_0x10b7e3 || !this._isUserCategory(_0x1ae8fa) || !this.createPanel || this._createPanelState?.folderActionBusyKey) {
      return false;
    }
    const _0x27ccd5 = this._isUserCategory(_0x1ae8fa);
    const _0x1e1bab = this._categoryKey(this._createPanelState?.draft?.category) === _0x10b7e3;
    const _0x2213da = this._categoryKey(this._createPanelState?.selectedFolderCategory) === _0x10b7e3;
    const _0x5c7f65 = new Set(this._createPanelState?.expandedFolderKeys || []);
    this._renamingMaterialCategoryKey = _0x10b7e3;
    this._setCreatePanelState({
      editingFolderDraft: String(_0x88352c || ""),
      folderActionBusyKey: _0x10b7e3,
      error: ""
    });
    this._renderCreatePanelFolderTree();
    const _0x35bef7 = await this._commitRenameMaterialCategory(_0x1ae8fa, _0x88352c);
    if (!this.createPanel || !this._createPanelState) {
      return _0x35bef7;
    }
    if (!_0x35bef7) {
      if (this._renamingMaterialCategoryKey === _0x10b7e3) {
        this._renamingMaterialCategoryKey = "";
      }
      this._setCreatePanelState({
        folderActionBusyKey: "",
        error: assetManagerText("categoryRenameFailed")
      });
      this._renderCreatePanelFolderTree({
        focusRename: true
      });
      return false;
    }
    const _0x295da4 = _0x27ccd5 ? this._findCategoryByName(_0x88352c, this.tabs) || this._normalizeCategoryName(_0x88352c) : _0x1ae8fa;
    const _0x56525a = this._categoryKey(_0x295da4);
    if (_0x5c7f65.delete(_0x10b7e3)) {
      _0x5c7f65.add(_0x56525a);
    }
    const _0x38fe3b = (this._createPanelState.customCategories || []).map(_0x538bb6 => this._categoryKey(_0x538bb6) === _0x10b7e3 ? _0x295da4 : _0x538bb6);
    this._setCreatePanelState({
      draft: _0x1e1bab ? {
        category: _0x295da4
      } : undefined,
      selectedFolderCategory: _0x2213da ? _0x295da4 : this._createPanelState.selectedFolderCategory,
      customCategories: _0x38fe3b,
      expandedFolderKeys: _0x5c7f65,
      editingFolderCategory: "",
      editingFolderDraft: "",
      folderActionBusyKey: "",
      error: ""
    });
    this._renderCreatePanelFolderTree();
    return true;
  }
  _renderCreatePanelContent() {
    const _0x183e2c = this.createPanel;
    const _0x61f1ae = this._createPanelState;
    if (!_0x183e2c || !_0x61f1ae) {
      return;
    }
    if (_0x61f1ae.presentation === "library-save") {
      this._renderLibrarySavePanelContent();
      return;
    }
    const _0x512bbe = _0x61f1ae.coverInfo?.coverHtml || _renderAssetIcon(_0x61f1ae.coverInfo?.coverType || "other");
    const _0x17ce87 = _0x61f1ae.mode === "update" ? assetManagerText("createPanel.updateTitle") : assetManagerText("createPanel.createTitle");
    const _0x4fbf66 = Array.isArray(_0x61f1ae.selectedIds) ? _0x61f1ae.selectedIds.length : 0;
    const _0xb921a9 = _0x61f1ae.saving ? _0x61f1ae.mode === "update" && _0x61f1ae.savingAction === "join" ? assetManagerText("createPanel.overwrite") : _0x61f1ae.mode === "update" ? assetManagerText("createPanel.saving") : assetManagerText("createPanel.creating") : _0x61f1ae.mode === "update" ? _0x61f1ae.updateConfirmOpen ? assetManagerText("createPanel.confirmOverwrite") : assetManagerText("createPanel.overwrite") : assetManagerText("createPanel.create");
    const _0x2a8084 = _0x61f1ae.saving && _0x61f1ae.savingAction === "join" ? assetManagerText("createPanel.joining") : assetManagerText("createPanel.join");
    const _0x1ad356 = this._getFilteredUpdateAssets(_0x61f1ae.updateSearchKeyword);
    const _0x171408 = _0x1ad356.find(_0xab7f47 => String(_0xab7f47?.id || "") === _0x61f1ae.selectedAssetId) || null;
    const _0x4a899d = this._getUpdateListCategory();
    const _0x538f73 = _0x61f1ae.error ? "<div class=\"v2-asset-create-error\" role=\"alert\">" + _escapeHtml(_0x61f1ae.error) + "</div>" : "";
    const _0x3cdcb5 = _0x61f1ae.mode === "update" && _0x61f1ae.updateConfirmOpen && _0x171408 ? "<div class=\"v2-asset-create-confirm\">" + _escapeHtml(assetManagerText("createPanel.confirmOverwriteAsset", {
      name: _0x171408.name || assetManagerText("unnamedAsset")
    })) + "</div>" : "";
    const _0x1faa1e = _0x61f1ae.mode === "update" ? "\n          <div class=\"v2-asset-update-layout\">\n            <div class=\"v2-asset-update-picker\">\n              <input\n                type=\"search\"\n                class=\"v2-asset-update-search\"\n                id=\"asset-update-search\"\n                placeholder=\"" + _escapeHtml(assetManagerText("createPanel.searchAssets", {
      category: this._formatCategoryLabel(_0x4a899d)
    })) + "\"\n                value=\"" + _escapeHtml(_0x61f1ae.updateSearchKeyword || "") + "\"\n              />\n              <div class=\"v2-asset-update-list\">\n                " + (_0x1ad356.length === 0 ? "<div class=\"v2-asset-update-empty\">" + (String(_0x61f1ae.updateSearchKeyword || "").trim() ? _escapeHtml(assetManagerText("createPanel.noMatchedAssets")) : _escapeHtml(assetManagerText("createPanel.noCategoryAssets", {
      category: this._formatCategoryLabel(_0x4a899d)
    }))) + "</div>" : _0x1ad356.map(_0x53dac4 => {
      const _0x11124c = String(_0x53dac4?.id || "") === _0x61f1ae.selectedAssetId ? " active" : "";
      const _0x158618 = _0x53dac4?.coverUrl ? "<img src=\"" + _escapeHtml(_0x53dac4.coverUrl) + "\" alt=\"" + _escapeHtml(_0x53dac4?.name || assetManagerText("assetAlt")) + "\" draggable=\"false\" />" : _renderAssetIcon(_0x53dac4?.coverType || "other");
      return "\n                            <button\n                              type=\"button\"\n                              class=\"v2-asset-update-item" + _0x11124c + "\"\n                              data-asset-id=\"" + _escapeHtml(_0x53dac4.id) + "\"\n                            >\n                              <div class=\"v2-asset-update-thumb\">" + _0x158618 + "</div>\n                              <div class=\"v2-asset-update-info\">\n                                <span>" + _escapeHtml(_0x53dac4.name || assetManagerText("unnamedAsset")) + "</span>\n                                <small>" + _formatAssetDateTime(_0x53dac4.updatedAt || _0x53dac4.createdAt) + "</small>\n                              </div>\n                            </button>\n                          ";
    }).join("")) + "\n              </div>\n            </div>\n            <div class=\"v2-asset-update-editor\">\n        " : "";
    const _0x5a60a4 = _0x61f1ae.mode === "update" ? "</div></div>" : "";
    const _0x2816f7 = _0x61f1ae.mode === "update";
    const _0x5cde9d = _0x2816f7 ? "v2-asset-create-body v2-asset-create-body--update" : "v2-asset-create-body";
    const _0x2656ce = _0x2816f7 ? "" : "\n        <div class=\"v2-asset-create-source-panel\">\n          <div class=\"v2-asset-create-source-header\">\n            <div class=\"v2-asset-create-source-title\">" + assetManagerText("createPanel.currentSelection") + "</div>\n            <div class=\"v2-asset-create-source-scope\">" + assetManagerText("createPanel.selectedNodes", {
      count: _0x4fbf66
    }) + "</div>\n          </div>\n          <div class=\"v2-asset-create-cover\">\n            " + _0x512bbe + "\n          </div>\n        </div>\n      ";
    _0x183e2c.innerHTML = "\n      <div class=\"v2-asset-create-header\">\n        <div class=\"v2-asset-create-title\">\n          <span class=\"v2-asset-create-header-text\">" + _0x17ce87 + "</span>\n        </div>\n        <button type=\"button\" class=\"v2-asset-create-close\" data-ui-action=\"asset-create-close\" aria-label=\"" + _escapeHtml(assetManagerText("close")) + "\">×</button>\n      </div>\n      <div class=\"v2-asset-create-tabs\">\n        <button\n          type=\"button\"\n          class=\"v2-asset-create-tab" + (_0x61f1ae.mode === "create" ? " active" : "") + "\"\n          data-mode=\"create\"\n        >" + assetManagerText("createPanel.createTab") + "</button>\n        <button\n          type=\"button\"\n          class=\"v2-asset-create-tab" + (_0x61f1ae.mode === "update" ? " active" : "") + "\"\n          data-mode=\"update\"\n        >" + assetManagerText("createPanel.updateTab") + "</button>\n      </div>\n      <div class=\"v2-asset-create-modal-body\">\n        " + _0x1faa1e + "\n        <div class=\"" + _0x5cde9d + "\">\n          " + _0x2656ce + "\n          <div class=\"v2-asset-create-right\">\n            <div class=\"v2-asset-create-field\">\n              <div class=\"v2-asset-create-label\">" + assetManagerText("createPanel.assetName") + "</div>\n              <input\n                type=\"text\"\n                id=\"asset-create-name\"\n                placeholder=\"" + _escapeHtml(assetManagerText("createPanel.assetNamePlaceholder")) + "\"\n                value=\"" + _escapeHtml(_0x61f1ae.draft?.name || "") + "\"\n              />\n            </div>\n            <div class=\"v2-asset-create-field\">\n              <div class=\"v2-asset-create-label\">" + assetManagerText("createPanel.category") + "</div>\n              <button type=\"button\" class=\"v2-asset-create-select-trigger\" id=\"asset-create-category-trigger\">\n                <span id=\"asset-create-category-val\">" + _escapeHtml(this._formatCategoryLabel(_0x61f1ae.draft?.category || this.activeTab)) + "</span>\n                <svg width=\"12\" height=\"8\" viewBox=\"0 0 12 8\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n                  <path d=\"M1 1.5L6 6.5L11 1.5\" stroke=\"var(--white-40)\" stroke-width=\"1.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/>\n                </svg>\n              </button>\n            </div>\n            " + _0x538f73 + "\n            " + _0x3cdcb5 + "\n          </div>\n        </div>\n        " + _0x5a60a4 + "\n      </div>\n      <div class=\"v2-asset-create-footer" + (_0x2816f7 ? " v2-asset-create-footer--update" : "") + "\">\n        <button\n          type=\"button\"\n          class=\"v2-asset-create-btn\"\n          id=\"asset-create-submit\"\n          " + (_0x61f1ae.saving ? "disabled" : "") + "\n        >" + _0xb921a9 + "</button>\n        " + (_0x2816f7 ? "<button\n                type=\"button\"\n                class=\"v2-asset-create-btn v2-asset-create-btn--secondary\"\n                id=\"asset-join-submit\"\n                " + (_0x61f1ae.saving ? "disabled" : "") + "\n              >" + _0x2a8084 + "</button>" : "") + "\n      </div>\n    ";
    this._bindCreatePanelEvents();
  }
  _bindCreatePanelEvents() {
    const _0xb39147 = this.createPanel;
    const _0x5f0c1a = this._createPanelState;
    if (!_0xb39147 || !_0x5f0c1a) {
      return;
    }
    _0xb39147.querySelector("[data-ui-action='asset-create-close']")?.addEventListener("click", () => {
      this.closeCreatePanel();
    });
    const _0x1dd199 = _0xb39147.querySelector("#asset-create-category-trigger");
    const _0x191b9f = _0xb39147.querySelector("#asset-create-category-val");
    if (this._createPanelDropdownOutsideHandler) {
      document.removeEventListener("pointerdown", this._createPanelDropdownOutsideHandler);
      this._createPanelDropdownOutsideHandler = null;
    }
    if (this._createPanelDropdownEl) {
      this._createPanelDropdownEl.remove();
      this._createPanelDropdownEl = null;
    }
    if (_0x1dd199 && _0x191b9f) {
      const _0x548b88 = document.createElement("div");
      _0x548b88.className = "v2-asset-select-dropdown";
      const _0x1610a2 = () => {
        const _0x29c32b = this._createPanelState?.draft?.category || this.activeTab;
        const _0x3e0371 = this._getCreatePanelCategories().map(_0x1e46cc => {
          const _0x2258f2 = this._categoryKey(_0x1e46cc) === this._categoryKey(_0x29c32b) ? " selected" : "";
          const _0x46be15 = _escapeHtml(_0x1e46cc);
          const _0x46e185 = _escapeHtml(this._formatCategoryLabel(_0x1e46cc));
          return "<div class=\"v2-asset-select-item" + _0x2258f2 + "\" data-val=\"" + _0x46be15 + "\">" + _0x46e185 + "</div>";
        }).join("");
        const _0x3816fa = this._canAddCustomCategory() ? this._createPanelState?.customCategoryEditing ? "<div class=\"v2-asset-select-custom-row\">\n                <input\n                  type=\"text\"\n                  class=\"v2-asset-select-custom-input\"\n                  id=\"asset-category-custom-input\"\n                  placeholder=\"" + _escapeHtml(assetManagerText("createPanel.categoryNamePlaceholder")) + "\"\n                  value=\"" + _escapeHtml(this._createPanelState?.customCategoryDraft || "") + "\"\n                />\n              </div>" : "<div class=\"v2-asset-select-item v2-asset-select-item--custom\" data-custom-category=\"1\">" + assetManagerText("categories.custom") + "</div>" : "";
        _0x548b88.innerHTML = _0x3e0371 + _0x3816fa;
      };
      const _0x207ed0 = () => {
        const _0x57c109 = _0x548b88.querySelector("#asset-category-custom-input");
        const _0x409e94 = _0x57c109?.value ?? this._createPanelState?.customCategoryDraft ?? "";
        const _0x208a89 = this._normalizeCategoryName(_0x409e94);
        if (!_0x208a89) {
          this._setCreatePanelState({
            customCategoryEditing: false,
            customCategoryDraft: ""
          });
          _0x1610a2();
          return;
        }
        const _0x64093c = this._getCreatePanelCategories();
        const _0x273f33 = this._findCategoryByName(_0x208a89, _0x64093c);
        if (!_0x273f33 && _0x64093c.length >= ASSET_CATEGORY_LIMIT) {
          window.showToast?.(assetManagerText("categoryLimit", {
            limit: ASSET_CATEGORY_LIMIT
          }), "warn");
          return;
        }
        const _0x5ca76e = _0x273f33 || this._addUserCategory(_0x208a89);
        if (!_0x5ca76e) {
          return;
        }
        const _0x4c8bfe = [...(this._createPanelState?.customCategories || [])];
        if (!_0x273f33 && !this._findCategoryByName(_0x5ca76e, _0x4c8bfe)) {
          _0x4c8bfe.push(_0x5ca76e);
        }
        this._setCreatePanelState({
          draft: {
            category: _0x5ca76e
          },
          customCategoryEditing: false,
          customCategoryDraft: "",
          customCategories: _0x4c8bfe,
          updateConfirmOpen: false,
          error: ""
        });
        if (this._createPanelState?.mode === "update") {
          this._syncUpdateSelectionForCategory(_0x5ca76e);
        }
        _0x191b9f.textContent = this._formatCategoryLabel(_0x5ca76e);
        if (this._createPanelState?.mode === "update") {
          _0xff05f3();
          this._renderCreatePanelContent();
          return;
        }
        _0x1610a2();
      };
      _0x1610a2();
      document.body.appendChild(_0x548b88);
      this._createPanelDropdownEl = _0x548b88;
      const _0xff05f3 = () => {
        _0x548b88.classList.remove("show");
        _0x1dd199.classList.remove("active");
      };
      _0x1dd199.addEventListener("click", _0x4dab4c => {
        _0x4dab4c.stopPropagation();
        if (_0x548b88.classList.contains("show")) {
          _0xff05f3();
          return;
        }
        const _0x10bba6 = _0x1dd199.getBoundingClientRect();
        _0x548b88.style.left = _0x10bba6.left + "px";
        _0x548b88.style.top = _0x10bba6.bottom + 4 + "px";
        _0x548b88.style.width = _0x10bba6.width + "px";
        _0x548b88.classList.add("show");
        _0x1dd199.classList.add("active");
      });
      _0x548b88.addEventListener("click", _0x5c37a2 => {
        const _0x427532 = _0x5c37a2.target.closest("[data-custom-category='1']");
        if (_0x427532) {
          this._setCreatePanelState({
            customCategoryEditing: true,
            customCategoryDraft: "",
            error: ""
          });
          _0x1610a2();
          window.requestAnimationFrame(() => {
            _0x548b88.querySelector("#asset-category-custom-input")?.focus();
          });
          return;
        }
        const _0x31484f = _0x5c37a2.target.closest(".v2-asset-select-item[data-val]");
        if (!_0x31484f) {
          return;
        }
        const _0x1b8f03 = this._normalizeCategoryName(_0x31484f.dataset.val) || this.activeTab;
        if (this._createPanelState?.mode === "update") {
          this._setCreatePanelState({
            customCategoryEditing: false,
            customCategoryDraft: ""
          });
          this._syncUpdateSelectionForCategory(_0x1b8f03);
        } else {
          this._setCreatePanelState({
            draft: {
              category: _0x1b8f03
            },
            customCategoryEditing: false,
            customCategoryDraft: "",
            updateConfirmOpen: false,
            error: ""
          });
        }
        _0xff05f3();
        this._renderCreatePanelContent();
      });
      _0x548b88.addEventListener("input", _0x479d6e => {
        if (!_0x479d6e.target.matches("#asset-category-custom-input")) {
          return;
        }
        this._setCreatePanelState({
          customCategoryDraft: _0x479d6e.target.value || ""
        });
      });
      _0x548b88.addEventListener("keydown", _0x313cbf => {
        if (!_0x313cbf.target.matches("#asset-category-custom-input")) {
          return;
        }
        if (_0x313cbf.key === "Enter") {
          _0x313cbf.preventDefault();
          _0x207ed0();
          return;
        }
        if (_0x313cbf.key === "Escape") {
          _0x313cbf.preventDefault();
          this._setCreatePanelState({
            customCategoryEditing: false,
            customCategoryDraft: ""
          });
          _0x1610a2();
        }
      });
      _0x548b88.addEventListener("focusout", _0xb2c01b => {
        if (!_0xb2c01b.target.matches("#asset-category-custom-input")) {
          return;
        }
        _0x207ed0();
      });
      const _0x4699ae = _0x273f43 => {
        if (!_0x548b88.contains(_0x273f43.target) && !_0x1dd199.contains(_0x273f43.target)) {
          _0xff05f3();
        }
      };
      this._createPanelDropdownOutsideHandler = _0x4699ae;
      document.addEventListener("pointerdown", _0x4699ae);
    }
    _0xb39147.querySelectorAll(".v2-asset-create-tab").forEach(_0x411c44 => {
      _0x411c44.addEventListener("click", () => {
        const _0x580314 = _0x411c44.dataset.mode === "update" ? "update" : "create";
        if (_0x580314 === this._createPanelState?.mode) {
          return;
        }
        this._setCreatePanelState({
          mode: _0x580314,
          updateConfirmOpen: false,
          customCategoryEditing: false,
          customCategoryDraft: "",
          error: ""
        });
        if (_0x580314 === "update" && !this._createPanelState?.selectedAssetId) {
          const _0x1758b3 = this._getFilteredUpdateAssets()[0] || null;
          if (_0x1758b3) {
            this._syncCreatePanelDraftFromTarget(_0x1758b3);
          }
        }
        this._renderCreatePanelContent();
      });
    });
    const _0x50df36 = _0xb39147.querySelector("#asset-create-name");
    if (_0x50df36) {
      _0x50df36.addEventListener("input", _0x52ab16 => {
        this._setCreatePanelState({
          draft: {
            name: _0x52ab16.target.value || ""
          },
          updateConfirmOpen: false,
          error: ""
        });
      });
    }
    const _0x5c3f55 = _0xb39147.querySelector("#asset-update-search");
    if (_0x5c3f55) {
      _0x5c3f55.addEventListener("input", _0x2abc63 => {
        this._setCreatePanelState({
          updateSearchKeyword: _0x2abc63.target.value || "",
          updateConfirmOpen: false,
          error: ""
        });
        this._renderCreatePanelContent();
      });
    }
    _0xb39147.querySelectorAll(".v2-asset-update-item").forEach(_0x76cb38 => {
      _0x76cb38.addEventListener("click", () => {
        const _0x5af781 = String(_0x76cb38.dataset.assetId || "");
        const _0x2c1262 = this._getSortedAssets().find(_0x1e2539 => String(_0x1e2539?.id || "") === _0x5af781);
        if (!_0x2c1262) {
          return;
        }
        this._syncCreatePanelDraftFromTarget(_0x2c1262);
        this._renderCreatePanelContent();
      });
    });
    const _0x580f79 = _0xb39147.querySelector("#asset-create-submit");
    if (_0x580f79) {
      _0x580f79.addEventListener("click", () => {
        this._submitCreatePanel();
      });
    }
    const _0x1fb3c1 = _0xb39147.querySelector("#asset-join-submit");
    if (_0x1fb3c1) {
      _0x1fb3c1.addEventListener("click", () => {
        this._joinCreatePanelToAsset();
      });
    }
  }
  async _submitCreatePanel() {
    const _0x457310 = this._createPanelState;
    const _0x3ac86a = this.createPanel;
    if (!_0x457310 || !_0x3ac86a || _0x457310.saving) {
      return;
    }
    const _0x311380 = Array.isArray(_0x457310.selectedIds) ? _0x457310.selectedIds : [];
    const _0x3d13d5 = this._getSelectedAssetNodes(_0x311380);
    if (!_0x3d13d5.length) {
      this._setCreatePanelState({
        error: assetManagerText("errors.noSavableNodes")
      });
      this._renderCreatePanelContent();
      return;
    }
    const _0x5d52f3 = String(this._createPanelState?.draft?.name || "").trim() || assetManagerText("unnamedAsset");
    const _0x19ffe0 = String(this._createPanelState?.draft?.category || "").trim() || this.activeTab;
    if (_0x457310.mode === "update") {
      const _0x8c557e = this._getFilteredUpdateAssets().find(_0x46f6fc => String(_0x46f6fc?.id || "") === String(_0x457310.selectedAssetId || ""));
      if (!_0x8c557e) {
        this._setCreatePanelState({
          error: assetManagerText("errors.selectAssetToUpdate")
        });
        this._renderCreatePanelContent();
        return;
      }
      if (!_0x457310.updateConfirmOpen) {
        this._setCreatePanelState({
          updateConfirmOpen: true,
          error: ""
        });
        this._renderCreatePanelContent();
        return;
      }
      const _0x3a2e95 = this._buildAssetPayloadFromSelection(_0x311380, {
        id: _0x8c557e.id,
        name: _0x5d52f3,
        category: _0x19ffe0,
        createdAt: _0x8c557e.createdAt || _0x8c557e.updatedAt || Date.now(),
        updatedAt: Date.now()
      });
      this._setCreatePanelState({
        saving: true,
        savingAction: "overwrite",
        error: ""
      });
      this._renderCreatePanelContent();
      try {
        await saveAssetToServer(_0x3a2e95);
        this._upsertLocalAsset(_0x3a2e95);
        this._scheduleVideoThumbJobs();
        this._openAssetId = String(_0x3a2e95.id || "") === this._openAssetId ? _0x3a2e95.id : this._openAssetId;
        window.showToast?.(assetManagerText("toasts.assetUpdated"), "success");
        this.closeCreatePanel();
        if (this.sidebarPanel?.classList.contains("show")) {
          this.renderSidebarContent();
        }
      } catch (_0x2ebfd0) {
        this._setCreatePanelState({
          saving: false,
          savingAction: "",
          error: assetManagerText("errors.assetUpdateFailed")
        });
        this._renderCreatePanelContent();
        console.error(_0x2ebfd0);
        window.showToast?.(assetManagerText("errors.assetUpdateFailed"), "error");
      }
      return;
    }
    const _0x2fa9d9 = this._buildAssetPayloadFromSelection(_0x311380, {
      name: _0x5d52f3,
      category: _0x19ffe0,
      createdAt: Date.now(),
      updatedAt: Date.now()
    });
    this._setCreatePanelState({
      saving: true,
      savingAction: "create",
      error: ""
    });
    this._renderCreatePanelContent();
    try {
      await saveAssetToServer(_0x2fa9d9);
      this._upsertLocalAsset(_0x2fa9d9);
      this._scheduleVideoThumbJobs();
      window.showToast?.(assetManagerText("toasts.assetCreated"), "success");
      this._playCreateAssetFly(_0x3ac86a);
      this.closeCreatePanel();
      if (this.sidebarPanel?.classList.contains("show")) {
        this._newAssetPulseId = String(_0x2fa9d9.id || "");
        this.renderSidebarContent();
      }
    } catch (_0x129ee9) {
      this._setCreatePanelState({
        saving: false,
        savingAction: "",
        error: assetManagerText("errors.assetCreateFailed")
      });
      this._renderCreatePanelContent();
      console.error(_0x129ee9);
      window.showToast?.(assetManagerText("errors.assetCreateFailed"), "error");
    }
  }
  async _joinCreatePanelToAsset() {
    const _0x38342a = this._createPanelState;
    const _0x3a1b90 = this.createPanel;
    if (!_0x38342a || !_0x3a1b90 || _0x38342a.saving) {
      return;
    }
    const _0x52a5cb = Array.isArray(_0x38342a.selectedIds) ? _0x38342a.selectedIds : [];
    const _0xfc3e57 = this._getSelectedAssetNodes(_0x52a5cb);
    if (!_0xfc3e57.length) {
      this._setCreatePanelState({
        error: assetManagerText("errors.noJoinableNodes")
      });
      this._renderCreatePanelContent();
      return;
    }
    const _0x45026a = this._getFilteredUpdateAssets().find(_0x1a3971 => String(_0x1a3971?.id || "") === String(_0x38342a.selectedAssetId || ""));
    if (!_0x45026a) {
      this._setCreatePanelState({
        error: assetManagerText("errors.selectAssetToJoin")
      });
      this._renderCreatePanelContent();
      return;
    }
    const _0x2d4695 = String(this._createPanelState?.draft?.name || "").trim() || assetManagerText("unnamedAsset");
    const _0x4d5cf7 = String(this._createPanelState?.draft?.category || "").trim() || this.activeTab;
    const _0x57be10 = this._buildAssetAppendPayload(_0x45026a, _0x52a5cb, {
      name: _0x2d4695,
      category: _0x4d5cf7,
      updatedAt: Date.now()
    });
    this._setCreatePanelState({
      saving: true,
      savingAction: "join",
      updateConfirmOpen: false,
      error: ""
    });
    this._renderCreatePanelContent();
    try {
      await saveAssetToServer(_0x57be10);
      this._upsertLocalAsset(_0x57be10);
      this._scheduleVideoThumbJobs();
      this._openAssetId = String(_0x57be10.id || "") === this._openAssetId ? _0x57be10.id : this._openAssetId;
      window.showToast?.(assetManagerText("toasts.assetJoined"), "success");
      this.closeCreatePanel();
      if (this.sidebarPanel?.classList.contains("show")) {
        this.renderSidebarContent();
      }
    } catch (_0x5a2f9d) {
      this._setCreatePanelState({
        saving: false,
        savingAction: "",
        error: assetManagerText("errors.assetJoinFailed")
      });
      this._renderCreatePanelContent();
      console.error(_0x5a2f9d);
      window.showToast?.(assetManagerText("errors.assetJoinFailed"), "error");
    }
  }
  _getCanvasCenterWorld() {
    const {
      viewport: _0x5988fe
    } = a885_0x5af3bf.getState();
    const _0x90ab80 = window.innerWidth / 2;
    const _0x290a0b = window.innerHeight / 2;
    const _0x3fc4ec = document.documentElement?.clientWidth || window.innerWidth || 0;
    const _0x1fa4b7 = document.documentElement?.clientHeight || window.innerHeight || 0;
    if (!_0x3fc4ec || !_0x1fa4b7) {
      return screenToWorld(_0x90ab80, _0x290a0b, _0x5988fe);
    }
    let _0xb3c722 = 0;
    let _0x5a3087 = 0;
    let _0x573d84 = _0x3fc4ec;
    let _0x5bf1a7 = _0x1fa4b7;
    const _0x30ac87 = [];
    const _0x1b2967 = document.querySelector("header");
    if (_0x1b2967) {
      _0x30ac87.push(_0x1b2967);
    }
    const _0x1c335c = document.querySelector(".sidebar-floating");
    if (_0x1c335c) {
      _0x30ac87.push(_0x1c335c);
    }
    if (this.sidebarPanel?.classList?.contains("show")) {
      _0x30ac87.push(this.sidebarPanel);
    }
    const _0x135b7 = 8;
    for (const _0x10984c of _0x30ac87) {
      if (!_0x10984c?.isConnected) {
        continue;
      }
      const _0x12070e = _0x10984c.getBoundingClientRect();
      const _0x5859f1 = Math.max(_0xb3c722, _0x12070e.left);
      const _0x396a40 = Math.max(_0x5a3087, _0x12070e.top);
      const _0x176dba = Math.min(_0x573d84, _0x12070e.right);
      const _0xa7b5cf = Math.min(_0x5bf1a7, _0x12070e.bottom);
      if (_0x176dba <= _0x5859f1 || _0xa7b5cf <= _0x396a40) {
        continue;
      }
      if (_0x12070e.left <= _0xb3c722 + _0x135b7 && _0x12070e.right > _0xb3c722 + _0x135b7) {
        _0xb3c722 = Math.max(_0xb3c722, _0x12070e.right);
        continue;
      }
      if (_0x12070e.right >= _0x573d84 - _0x135b7 && _0x12070e.left < _0x573d84 - _0x135b7) {
        _0x573d84 = Math.min(_0x573d84, _0x12070e.left);
        continue;
      }
      if (_0x12070e.top <= _0x5a3087 + _0x135b7 && _0x12070e.bottom > _0x5a3087 + _0x135b7) {
        _0x5a3087 = Math.max(_0x5a3087, _0x12070e.bottom);
        continue;
      }
      if (_0x12070e.bottom >= _0x5bf1a7 - _0x135b7 && _0x12070e.top < _0x5bf1a7 - _0x135b7) {
        _0x5bf1a7 = Math.min(_0x5bf1a7, _0x12070e.top);
        continue;
      }
    }
    const _0x46f9cf = _0x573d84 - _0xb3c722;
    const _0x50bed7 = _0x5bf1a7 - _0x5a3087;
    const _0x435162 = _0x46f9cf > 40 ? _0xb3c722 + _0x46f9cf / 2 : _0x90ab80;
    const _0x2a3aad = _0x50bed7 > 40 ? _0x5a3087 + _0x50bed7 / 2 : _0x290a0b;
    return screenToWorld(_0x435162, _0x2a3aad, _0x5988fe);
  }
  _calcNodesBBox(_0x891351) {
    let _0xfcfb40 = Infinity;
    let _0x23db18 = Infinity;
    let _0x558db0 = -Infinity;
    let _0xc42ea2 = -Infinity;
    for (const _0x5a3201 of _0x891351 || []) {
      if (!_0x5a3201) {
        continue;
      }
      const _0x5cef72 = Number(_0x5a3201.x) || 0;
      const _0x56e439 = Number(_0x5a3201.y) || 0;
      const _0x6dc0f9 = Number(_0x5a3201.width ?? _0x5a3201.w) || 100;
      const _0x52ed90 = Number(_0x5a3201.height ?? _0x5a3201.h) || 100;
      _0xfcfb40 = Math.min(_0xfcfb40, _0x5cef72);
      _0x23db18 = Math.min(_0x23db18, _0x56e439);
      _0x558db0 = Math.max(_0x558db0, _0x5cef72 + _0x6dc0f9);
      _0xc42ea2 = Math.max(_0xc42ea2, _0x56e439 + _0x52ed90);
    }
    if (!Number.isFinite(_0xfcfb40) || !Number.isFinite(_0x23db18)) {
      return {
        minX: 0,
        minY: 0,
        maxX: 0,
        maxY: 0,
        w: 0,
        h: 0,
        cx: 0,
        cy: 0
      };
    }
    const _0x2f0313 = Math.max(0, _0x558db0 - _0xfcfb40);
    const _0x18aba3 = Math.max(0, _0xc42ea2 - _0x23db18);
    return {
      minX: _0xfcfb40,
      minY: _0x23db18,
      maxX: _0x558db0,
      maxY: _0xc42ea2,
      w: _0x2f0313,
      h: _0x18aba3,
      cx: _0xfcfb40 + _0x2f0313 / 2,
      cy: _0x23db18 + _0x18aba3 / 2
    };
  }
  _preloadThumb(_0x2d73d7) {
    const _0x3fd63d = String(_0x2d73d7 || "").trim();
    if (!_0x3fd63d) {
      return false;
    }
    if (_0x3fd63d.startsWith("data:")) {
      return false;
    }
    if (this._isNonImageMediaSrc(_0x3fd63d)) {
      return false;
    }
    if (this._thumbPreloadSet.has(_0x3fd63d)) {
      return false;
    }
    this._thumbPreloadSet.add(_0x3fd63d);
    this._ensureThumbDecoded(_0x3fd63d);
    return true;
  }
  _isSidebarOpen() {
    return this.sidebarPanel?.classList?.contains("show") === true;
  }
  _renderMaterialLoadingState() {
    const _0x1d4484 = this.sidebarPanel?.querySelector("[data-material-loading]");
    if (!_0x1d4484) {
      return;
    }
    _0x1d4484.hidden = this._materialLoadingCount <= 0;
  }
  _warmVisibleAssetMedia() {
    if (!this._isSidebarOpen()) {
      return false;
    }
    let _0x3bf23d = 0;
    for (const _0xc2881d of this._getSortedAssets()) {
      if (_0x3bf23d >= 32) {
        break;
      }
      if (_0xc2881d?.coverUrl) {
        this._preloadThumb(_0xc2881d.coverUrl);
        _0x3bf23d += 1;
      }
      const _0x410844 = Array.isArray(_0xc2881d?.items) ? _0xc2881d.items : [];
      for (const _0x3c9ded of _0x410844) {
        if (_0x3bf23d >= 32) {
          break;
        }
        if (_0x3c9ded?.thumbSrc) {
          this._preloadThumb(_0x3c9ded.thumbSrc);
          _0x3bf23d += 1;
        }
      }
    }
    this._scheduleVideoThumbJobs();
    return _0x3bf23d > 0;
  }
  _ensureThumbDecoded(_0x597e35) {
    const _0x59c73e = String(_0x597e35 || "").trim();
    if (!_0x59c73e) {
      return Promise.resolve(false);
    }
    if (_0x59c73e.startsWith("data:")) {
      return Promise.resolve(true);
    }
    if (this._isNonImageMediaSrc(_0x59c73e)) {
      return Promise.resolve(false);
    }
    const _0x118593 = this._thumbDecodePromiseMap.get(_0x59c73e);
    if (_0x118593) {
      return _0x118593;
    }
    const _0x46968c = preloadCanvasImage(_0x59c73e, {
      priority: 20,
      fetchPriority: "auto"
    }).then(() => true, () => false);
    this._thumbDecodePromiseMap.set(_0x59c73e, _0x46968c);
    return _0x46968c;
  }
  _isVideoMediaSrc(_0x4a5174) {
    const _0x5a8450 = String(_0x4a5174 || "").trim().toLowerCase();
    return /^data:video\//.test(_0x5a8450) || /\.(?:mp4|webm|mov|mkv|m4v)(?:[?#].*)?$/.test(_0x5a8450);
  }
  _isAudioMediaSrc(_0x45b51a) {
    const _0xf0a98 = String(_0x45b51a || "").trim().toLowerCase();
    return /^data:audio\//.test(_0xf0a98) || /\.(?:mp3|wav|m4a|aac|flac|ogg|opus|wma)(?:[?#].*)?$/.test(_0xf0a98);
  }
  _isNonImageMediaSrc(_0x1c2bc6) {
    return this._isVideoMediaSrc(_0x1c2bc6) || this._isAudioMediaSrc(_0x1c2bc6);
  }
  async _captureVideoFirstFrameDataUrl(_0x355b87) {
    const _0x478335 = String(_0x355b87 || "");
    if (!_0x478335) {
      return "";
    }
    return await new Promise(_0x2d8952 => {
      const _0x55c3de = document.createElement("video");
      _0x55c3de.preload = "auto";
      _0x55c3de.muted = true;
      _0x55c3de.playsInline = true;
      _0x55c3de.crossOrigin = "anonymous";
      const _0x4409c9 = () => {
        _0x55c3de.removeAttribute("src");
        _0x55c3de.load();
      };
      const _0x30c192 = () => {
        _0x4409c9();
        _0x2d8952("");
      };
      const _0x3edb0b = async () => {
        try {
          const _0x2b940c = Number.isFinite(_0x55c3de.duration) ? _0x55c3de.duration : 0;
          const _0x3aadb6 = _0x2b940c > 0 ? Math.min(0.08, Math.max(0, _0x2b940c - 0.08)) : 0;
          const _0x1e6699 = () => {
            try {
              const _0x3d4d5e = _0x55c3de.videoWidth || 0;
              const _0x1025b7 = _0x55c3de.videoHeight || 0;
              if (!_0x3d4d5e || !_0x1025b7) {
                return _0x30c192();
              }
              const {
                width: _0xb1f6a,
                height: _0x483fa9
              } = fitAssetMaterialVideoThumbnail(_0x3d4d5e, _0x1025b7);
              const _0x2c2dbc = document.createElement("canvas");
              _0x2c2dbc.width = _0xb1f6a;
              _0x2c2dbc.height = _0x483fa9;
              const _0x1ad705 = _0x2c2dbc.getContext("2d");
              _0x1ad705.drawImage(_0x55c3de, 0, 0, _0xb1f6a, _0x483fa9);
              const _0x34d565 = _0x2c2dbc.toDataURL("image/jpeg", 0.9);
              _0x4409c9();
              _0x2d8952(_0x34d565);
            } catch (_0x525fc1) {
              _0x30c192();
            } finally {
              _0x55c3de.removeEventListener("seeked", _0x1e6699);
            }
          };
          _0x55c3de.addEventListener("seeked", _0x1e6699, {
            once: true
          });
          _0x55c3de.currentTime = _0x3aadb6;
        } catch (_0x488fad) {
          _0x30c192();
        }
      };
      _0x55c3de.addEventListener("error", _0x30c192, {
        once: true
      });
      _0x55c3de.addEventListener("loadeddata", _0x3edb0b, {
        once: true
      });
      attachMediaElementPlaybackSource(_0x55c3de, _0x478335, {
        preload: "auto"
      }).catch(() => {
        if (!String(_0x55c3de.getAttribute("src") || _0x55c3de.src || "").trim()) {
          _0x55c3de.src = _0x478335;
          try {
            _0x55c3de.load?.();
          } catch {}
        }
      });
    });
  }
  _scheduleVideoThumbJobs() {
    if (!this._isSidebarOpen()) {
      return;
    }
    if (this._videoThumbTimer) {
      return;
    }
    this._videoThumbTimer = window.setTimeout(() => {
      this._videoThumbTimer = 0;
      if (!this._isSidebarOpen()) {
        return;
      }
      this._runVideoThumbJobs();
    }, 0);
  }
  _scheduleSidebarRender() {
    if (!this._isSidebarOpen()) {
      return;
    }
    if (this._renamingAssetId || this._renamingMaterialItemKey || this._renamingMaterialCategoryKey) {
      return;
    }
    if (this._sidebarRenderRaf) {
      return;
    }
    this._sidebarRenderRaf = window.requestAnimationFrame(() => {
      this._sidebarRenderRaf = 0;
      if (!this._isSidebarOpen()) {
        return;
      }
      if (this._renamingAssetId || this._renamingMaterialItemKey || this._renamingMaterialCategoryKey) {
        return;
      }
      this.renderSidebarContent();
    });
  }
  _beginRenameAsset(_0x42b910) {
    const _0x3d767f = String(_0x42b910 || "");
    if (!_0x3d767f) {
      return;
    }
    if (this._savingMaterialCategoryKey || this._savingMaterialItemKey) {
      return;
    }
    if (this._pendingDeleteAssetId) {
      this._pendingDeleteAssetId = "";
    }
    this._renamingMaterialCategoryKey = "";
    this._renamingMaterialItemKey = "";
    this._renamingAssetId = _0x3d767f;
    this._closeMaterialMenu();
    this._hideMaterialPreview();
    this.renderSidebarContent();
  }
  _cancelRenameAsset() {
    if (!this._renamingAssetId) {
      return;
    }
    this._renamingAssetId = "";
    this.renderSidebarContent();
  }
  async _commitRenameAsset(_0x244f8d, _0x5c8145) {
    const _0x44a5fe = String(_0x244f8d || "");
    const _0x5101fb = String(_0x5c8145 || "").trim();
    if (!_0x44a5fe) {
      return;
    }
    if (!_0x5101fb) {
      window.showToast?.(assetManagerText("errors.nameRequired"), "error");
      return;
    }
    const _0x37ef18 = (this.assets || []).find(_0x29184a => String(_0x29184a?.id || "") === _0x44a5fe);
    if (!_0x37ef18) {
      return;
    }
    const _0x49bf56 = String(_0x37ef18?.name || "");
    const _0x2cd333 = _0x37ef18?.updatedAt;
    if (_0x49bf56 === _0x5101fb) {
      this._renamingAssetId = "";
      this.renderSidebarContent();
      return;
    }
    _0x37ef18.name = _0x5101fb;
    _0x37ef18.updatedAt = Date.now();
    const _0x46cd44 = this.sidebarPanel?.querySelector(".v2-material-name-input[data-asset-id=\"" + CSS.escape(_0x44a5fe) + "\"]");
    _0x46cd44?.setAttribute("aria-busy", "true");
    if (_0x46cd44) {
      _0x46cd44.disabled = true;
    }
    _0x46cd44?.closest(".v2-material-asset-row, .v2-material-project-row")?.classList.add("is-saving");
    try {
      await saveAssetToServer(_0x37ef18);
      this._upsertLocalAsset(_0x37ef18);
      window.showToast?.(assetManagerText("toasts.renamed"), "success");
    } catch (_0x3826f2) {
      _0x37ef18.name = _0x49bf56;
      _0x37ef18.updatedAt = _0x2cd333;
      window.showToast?.(assetManagerText("errors.renameFailed"), "error");
    } finally {
      this._renamingAssetId = "";
      this.renderSidebarContent();
    }
  }
  _materialItemKey(_0x4aa199, _0x313c23) {
    const _0x4e5d07 = String(_0x4aa199 || "");
    const _0x56e34b = Number(_0x313c23);
    if (_0x4e5d07 && Number.isInteger(_0x56e34b) && _0x56e34b >= 0) {
      return _0x4e5d07 + ":" + _0x56e34b;
    } else {
      return "";
    }
  }
  _beginRenameMaterialItem(_0x2d3eb5, _0x561de5) {
    const _0x45578d = this._materialItemKey(_0x2d3eb5, _0x561de5);
    const _0x2ea294 = this._getMaterialAsset(_0x2d3eb5);
    if (!_0x45578d || !getMaterialAssetItems(_0x2ea294)[Number(_0x561de5)] || this._savingMaterialCategoryKey || this._savingMaterialItemKey) {
      return;
    }
    this._renamingAssetId = "";
    this._renamingMaterialCategoryKey = "";
    this._renamingMaterialItemKey = _0x45578d;
    this._closeMaterialMenu();
    this._hideMaterialPreview();
    this.renderSidebarContent();
  }
  _cancelRenameMaterialItem() {
    if (!this._renamingMaterialItemKey || this._savingMaterialItemKey) {
      return;
    }
    this._renamingMaterialItemKey = "";
    this.renderSidebarContent();
  }
  async _commitRenameMaterialItem(_0x32fcf6, _0x4717ce, _0x4594d3) {
    const _0x57df50 = String(_0x32fcf6 || "");
    const _0x2fd731 = Number(_0x4717ce);
    const _0x415fc7 = this._materialItemKey(_0x57df50, _0x2fd731);
    const _0x5a7ef8 = String(_0x4594d3 || "").trim();
    if (!_0x415fc7 || _0x415fc7 !== this._renamingMaterialItemKey || this._savingMaterialItemKey) {
      return false;
    }
    if (!_0x5a7ef8) {
      window.showToast?.(assetManagerText("errors.nameRequired"), "error");
      this.sidebarPanel?.querySelector(".v2-material-item-name-input[data-item-key=\"" + CSS.escape(_0x415fc7) + "\"]")?.focus();
      return false;
    }
    const _0x3009e3 = this._getMaterialAsset(_0x57df50);
    const _0x29993c = getMaterialAssetItems(_0x3009e3)[_0x2fd731];
    if (!_0x3009e3 || !_0x29993c) {
      return false;
    }
    const _0x19206c = String(_0x29993c?.name || _0x29993c?.nodeData?.name || "");
    if (_0x19206c === _0x5a7ef8) {
      this._renamingMaterialItemKey = "";
      this.renderSidebarContent();
      return true;
    }
    const _0x20ce97 = {
      ..._0x3009e3,
      updatedAt: Date.now(),
      nodes: Array.isArray(_0x3009e3.nodes) ? _0x3009e3.nodes.map((_0x13f493, _0x475ce2) => _0x475ce2 === _0x2fd731 ? {
        ..._0x13f493,
        name: _0x5a7ef8
      } : _0x13f493) : _0x3009e3.nodes,
      items: Array.isArray(_0x3009e3.items) ? _0x3009e3.items.map((_0x3c0aee, _0x66249e) => _0x66249e === _0x2fd731 ? {
        ..._0x3c0aee,
        name: _0x5a7ef8,
        nodeData: _0x3c0aee?.nodeData ? {
          ..._0x3c0aee.nodeData,
          name: _0x5a7ef8
        } : _0x3c0aee?.nodeData
      } : _0x3c0aee) : _0x3009e3.items
    };
    this._savingMaterialItemKey = _0x415fc7;
    const _0x293981 = this.sidebarPanel?.querySelector(".v2-material-item-name-input[data-item-key=\"" + CSS.escape(_0x415fc7) + "\"]");
    _0x293981?.setAttribute("aria-busy", "true");
    if (_0x293981) {
      _0x293981.disabled = true;
    }
    _0x293981?.closest(".v2-material-item-row")?.classList.add("is-saving");
    try {
      await saveAssetToServer(_0x20ce97);
      this._upsertLocalAsset(_0x20ce97);
      window.showToast?.(assetManagerText("toasts.renamed"), "success");
      return true;
    } catch (_0x8f8e9d) {
      console.error(_0x8f8e9d);
      window.showToast?.(assetManagerText("errors.renameFailed"), "error");
      return false;
    } finally {
      this._renamingMaterialItemKey = "";
      this._savingMaterialItemKey = "";
      this.renderSidebarContent();
    }
  }
  _getMaterialCategoryRenameInput(_0x41beb0) {
    return Array.from(this.sidebarPanel?.querySelectorAll?.(".v2-material-folder-name-input[data-category-key]") || []).find(_0x5cfc86 => _0x5cfc86.dataset.categoryKey === _0x41beb0) || null;
  }
  _focusMaterialCategoryRenameInput(_0x4e0309, {
    select = false
  } = {}) {
    window.requestAnimationFrame(() => {
      const _0x288dca = this._getMaterialCategoryRenameInput(_0x4e0309);
      if (!_0x288dca || _0x288dca.disabled || !_0x288dca.isConnected) {
        return;
      }
      _0x288dca.dataset.submitted = "";
      _0x288dca.focus();
      if (select) {
        _0x288dca.select?.();
      }
    });
  }
  _beginRenameMaterialCategory(_0x339d5a) {
    const _0x26a6f6 = this._findCategoryByName(_0x339d5a, this.tabs);
    const _0x2b77f8 = this._categoryKey(_0x26a6f6);
    if (!_0x26a6f6 || !_0x2b77f8 || !this._isUserCategory(_0x26a6f6)) {
      return;
    }
    if (this._savingMaterialCategoryKey || this._savingMaterialItemKey) {
      return;
    }
    this._materialCurrentFolderCategory = _0x26a6f6;
    this._pendingMaterialFolderDeleteKey = "";
    this._renamingAssetId = "";
    this._renamingMaterialItemKey = "";
    this._renamingMaterialCategoryKey = _0x2b77f8;
    this._closeMaterialMenu();
    this._hideMaterialPreview();
    this.renderSidebarContent();
    this._focusMaterialCategoryRenameInput(_0x2b77f8, {
      select: true
    });
  }
  _cancelRenameMaterialCategory() {
    if (!this._renamingMaterialCategoryKey || this._savingMaterialCategoryKey) {
      return;
    }
    this._renamingMaterialCategoryKey = "";
    this.renderSidebarContent();
  }
  _rejectMaterialCategoryRename(_0x1c1fa9, _0x7610f3) {
    window.showToast?.(_0x7610f3, "error");
    this._focusMaterialCategoryRenameInput(_0x1c1fa9);
  }
  async _commitRenameMaterialCategory(_0x2a3844, _0x68705f) {
    const _0x188259 = this._findCategoryByName(_0x2a3844, this.tabs);
    const _0x17b80b = this._categoryKey(_0x188259);
    const _0x4caab1 = this._normalizeCategoryName(_0x68705f);
    if (!_0x188259 || !_0x17b80b || !this._isUserCategory(_0x188259) || this._renamingMaterialCategoryKey !== _0x17b80b || this._savingMaterialCategoryKey) {
      return false;
    }
    if (!_0x4caab1) {
      this._rejectMaterialCategoryRename(_0x17b80b, assetManagerText("errors.nameRequired"));
      return false;
    }
    if (this._isHiddenAssetCategory(_0x4caab1)) {
      this._rejectMaterialCategoryRename(_0x17b80b, assetManagerText("categoryNameUnavailable"));
      return false;
    }
    const _0x4d2533 = this._formatCategoryLabel(_0x188259);
    if (_0x4d2533 === _0x4caab1) {
      this._renamingMaterialCategoryKey = "";
      this.renderSidebarContent();
      return true;
    }
    const _0x19d26c = _0x4caab1.toLocaleLowerCase();
    const _0x2ecc86 = this.tabs.some(_0x2095ca => this._categoryKey(_0x2095ca) !== _0x17b80b && this._formatCategoryLabel(_0x2095ca).toLocaleLowerCase() === _0x19d26c);
    if (_0x2ecc86) {
      this._rejectMaterialCategoryRename(_0x17b80b, assetManagerText("categoryNameExists"));
      return false;
    }
    if (this._isProtectedCategory(_0x4caab1)) {
      this._rejectMaterialCategoryRename(_0x17b80b, assetManagerText("categoryNameUnavailable"));
      return false;
    }
    const _0x197716 = [...this.userCategories];
    const _0x136899 = {
      ...this.materialCategoryParents
    };
    const _0x4ff34f = buildMaterialCategoryRenamePlan({
      assets: this._getSortedAssets(),
      userCategories: _0x197716,
      allCategories: this.tabs,
      currentCategory: _0x188259,
      nextCategory: _0x4caab1,
      categoryKey: _0x50206a => this._categoryKey(_0x50206a),
      now: Date.now()
    });
    if (_0x4ff34f.status === "unchanged") {
      this._renamingMaterialCategoryKey = "";
      this.renderSidebarContent();
      return true;
    }
    if (_0x4ff34f.status === "duplicate") {
      this._rejectMaterialCategoryRename(_0x17b80b, assetManagerText("categoryNameExists"));
      return false;
    }
    if (_0x4ff34f.status !== "ready") {
      this._rejectMaterialCategoryRename(_0x17b80b, assetManagerText("categoryRenameFailed"));
      return false;
    }
    const _0x2dda37 = renameMaterialFolderParent({
      parents: _0x136899,
      currentCategory: _0x188259,
      nextCategory: _0x4ff34f.nextCategory,
      categoryKey: _0x350cc8 => this._categoryKey(_0x350cc8)
    });
    this._savingMaterialCategoryKey = _0x17b80b;
    const _0x42976b = this._getMaterialCategoryRenameInput(_0x17b80b);
    _0x42976b?.setAttribute("aria-busy", "true");
    if (_0x42976b) {
      _0x42976b.disabled = true;
    }
    _0x42976b?.closest(".v2-material-folder-row")?.classList.add("is-saving");
    const _0x1af3fb = [];
    let _0x567a62 = false;
    try {
      for (let _0x38e786 = 0; _0x38e786 < _0x4ff34f.renamedAssets.length; _0x38e786 += 1) {
        _0x1af3fb.push(_0x4ff34f.originalAssets[_0x38e786]);
        await saveAssetToServer(_0x4ff34f.renamedAssets[_0x38e786]);
      }
      _0x567a62 = true;
      await this._saveMaterialCategorySettings(_0x4ff34f.nextUserCategories, this.materialCategoryDisplayNames, _0x2dda37);
      this.userCategories = _0x4ff34f.nextUserCategories;
      this.materialCategoryParents = _0x2dda37;
      _0x4ff34f.renamedAssets.forEach(_0x260e37 => this._upsertLocalAsset(_0x260e37));
      if (this._categoryKey(this.activeTab) === _0x17b80b) {
        this.activeTab = _0x4ff34f.nextCategory;
      }
      if (this._expandedMaterialCategories.delete(_0x17b80b)) {
        this._expandedMaterialCategories.add(_0x4ff34f.nextKey);
      }
      if (this._categoryKey(this._materialCurrentFolderCategory) === _0x17b80b) {
        this._materialCurrentFolderCategory = _0x4ff34f.nextCategory;
      }
      this._syncTabsFromAssets();
      this._renderSidebarTabs();
      window.showToast?.(assetManagerText("categoryRenamed"), "success");
      return true;
    } catch (_0x2b16fe) {
      const _0x1f3a33 = [];
      for (const _0x3daca0 of _0x1af3fb.reverse()) {
        try {
          await saveAssetToServer(_0x3daca0);
        } catch (_0xc9641e) {
          _0x1f3a33.push(_0xc9641e);
        }
      }
      if (_0x567a62) {
        try {
          await this._saveMaterialCategorySettings(_0x197716, this.materialCategoryDisplayNames, _0x136899);
        } catch (_0x32dece) {
          _0x1f3a33.push(_0x32dece);
        }
      }
      if (_0x1f3a33.length) {
        console.error("回滚素材文件夹重命名失败", _0x1f3a33);
      }
      console.error(_0x2b16fe);
      window.showToast?.(assetManagerText("categoryRenameFailed"), "error");
      return false;
    } finally {
      this._renamingMaterialCategoryKey = "";
      this._savingMaterialCategoryKey = "";
      this.renderSidebarContent();
    }
  }
  async _runVideoThumbJobs() {
    if (!this._isSidebarOpen()) {
      return;
    }
    let _0x323230 = 2;
    for (const _0x5cc6e9 of this._getSortedAssets()) {
      if (!this._isSidebarOpen()) {
        break;
      }
      if (_0x323230 <= 0) {
        break;
      }
      const _0x4f1391 = String(_0x5cc6e9?.id || "").trim();
      if (!_0x4f1391) {
        continue;
      }
      const _0x138376 = Array.isArray(_0x5cc6e9?.items) ? _0x5cc6e9.items : [];
      for (let _0x1c8172 = 0; _0x1c8172 < _0x138376.length; _0x1c8172++) {
        if (_0x323230 <= 0) {
          break;
        }
        const _0x5a4acd = _0x138376[_0x1c8172];
        const _0x39e0db = _normalizeAssetType(_0x5a4acd?.type);
        if (_0x39e0db !== "video") {
          continue;
        }
        const _0x59765b = String(_0x5a4acd?.thumbSrc || "");
        if (isAssetMaterialVideoThumbnailUrl(_0x59765b)) {
          continue;
        }
        const _0x53823f = _0x4f1391 + ":" + _0x1c8172;
        if (this._videoThumbInFlight.has(_0x53823f)) {
          continue;
        }
        const _0x493253 = resolveAssetMaterialVideoSourceUrl(_0x5a4acd?.nodeData) || (this._isVideoMediaSrc(_0x59765b) ? _0x59765b : "");
        if (!_0x493253) {
          continue;
        }
        this._videoThumbInFlight.add(_0x53823f);
        _0x323230 -= 1;
        this._captureVideoFirstFrameDataUrl(_0x493253).then(async _0x3e4de4 => {
          if (!String(_0x3e4de4 || "").startsWith("data:image/")) {
            return;
          }
          const _0x34cd75 = await saveAssetThumbToServer({
            assetId: _0x4f1391,
            key: getAssetMaterialVideoThumbnailKey(_0x1c8172),
            dataUrl: _0x3e4de4
          });
          const _0x102eea = String(_0x34cd75?.url || "");
          if (!_0x102eea) {
            return;
          }
          _0x5a4acd.thumbSrc = _0x102eea;
          if (_0x1c8172 === 0) {
            _0x5cc6e9.coverUrl = _0x102eea;
          }
          await saveAssetToServer(_0x5cc6e9);
          upsertAssetMentionAsset(_0x5cc6e9);
          if (this.sidebarPanel?.classList.contains("show")) {
            this._scheduleSidebarRender();
          }
        }).catch(() => {}).finally(() => {
          this._videoThumbInFlight.delete(_0x53823f);
        });
      }
    }
  }
  async loadAssetsFromServer() {
    this._materialLoadingCount += 1;
    this._renderMaterialLoadingState();
    try {
      const _0x3b79ed = await fetchAssetsFromServer();
      this.assets = _sortAssetsByUpdatedTime((Array.isArray(_0x3b79ed) ? _0x3b79ed : []).map(_0x5f2b9e => this._normalizeAssetEntity(_0x5f2b9e)).filter(Boolean));
      this._syncTabsFromAssets();
      this._renderSidebarTabs();
      this.assets.forEach(_0x9cae4a => {
        if (_0x9cae4a.nodes && _0x9cae4a.nodes[0] && !isAssetMaterialThumbnailUrl(_0x9cae4a.coverUrl)) {
          _0x9cae4a.coverUrl = resolveAssetNodeCoverUrl(_0x9cae4a.nodes[0]) || _0x9cae4a.coverUrl || "";
        }
        if (Array.isArray(_0x9cae4a.items)) {
          _0x9cae4a.items = getMaterialAssetItems(_0x9cae4a).map(_0x3e4263 => ({
            ..._0x3e4263,
            thumbSrc: _resolveMaterialItemThumbSrc(_0x3e4263)
          }));
        } else if (Array.isArray(_0x9cae4a.nodes)) {
          _0x9cae4a.items = _0x9cae4a.nodes.map(_0x55d71a => _buildAssetItem(_0x55d71a));
        }
      });
      setAssetMentionAssets(this._getMentionEligibleAssets());
      this._warmVisibleAssetMedia();
      if (this.sidebarPanel && this.sidebarPanel.classList.contains("show")) {
        this.renderSidebarContent();
      }
    } catch (_0xa5c489) {
      console.error("加载全局素材失败", _0xa5c489);
    } finally {
      this._materialLoadingCount = Math.max(0, this._materialLoadingCount - 1);
      this._renderMaterialLoadingState();
    }
  }
  refreshAssetsFromServer() {
    const _0x4e79a5 = Promise.resolve(this._assetLoadPromise).catch(() => {}).then(() => this.loadAssetsFromServer());
    this._assetLoadPromise = _0x4e79a5;
    return _0x4e79a5;
  }
  async upsertMediaAssetPackage(_0x4582d2 = {}) {
    const _0x1dcbb2 = String(_0x4582d2?.packageKey || "").trim();
    if (!_0x1dcbb2) {
      throw new Error("加入素材包失败：缺少素材包标识。");
    }
    const _0x3302b2 = this._assetPackageUpsertByKey.get(_0x1dcbb2) || Promise.resolve();
    const _0x5ca341 = _0x3302b2.catch(() => {}).then(async () => {
      await this._assetLoadPromise;
      const _0x44cc81 = (this.assets || []).find(_0x512253 => String(_0x512253?.packageKey || "").trim() === _0x1dcbb2) || null;
      const _0x5a4c1e = upsertMediaAssetPackage(_0x44cc81, _0x4582d2, {
        createId: _0x5b02da => generateId(_0x5b02da),
        now: Date.now()
      });
      await saveAssetToServer(_0x5a4c1e.asset);
      this._upsertLocalAsset(_0x5a4c1e.asset);
      this._scheduleVideoThumbJobs();
      if (this.sidebarPanel?.classList.contains("show")) {
        this._newAssetPulseId = String(_0x5a4c1e.asset.id || "");
        this.renderSidebarContent();
      }
      return {
        assetId: _0x5a4c1e.asset.id,
        asset: _0x5a4c1e.asset,
        itemIndex: _0x5a4c1e.itemIndex,
        itemCreated: _0x5a4c1e.itemCreated,
        packageCreated: _0x5a4c1e.packageCreated,
        imageUrl: String(_0x5a4c1e.item?.nodeData?.imageUrl || (_0x5a4c1e.item?.type !== "source-audio" ? _0x5a4c1e.item?.nodeData?.src : "") || "").trim(),
        audioUrl: String(_0x5a4c1e.item?.nodeData?.audioUrl || (_0x5a4c1e.item?.type === "source-audio" ? _0x5a4c1e.item?.nodeData?.src : "") || "").trim()
      };
    });
    this._assetPackageUpsertByKey.set(_0x1dcbb2, _0x5ca341);
    try {
      return await _0x5ca341;
    } finally {
      if (this._assetPackageUpsertByKey.get(_0x1dcbb2) === _0x5ca341) {
        this._assetPackageUpsertByKey.delete(_0x1dcbb2);
      }
    }
  }
  showCreatePanel(_0x30f40d, _0x51ab81, _0x4065f8 = {}) {
    if (!_0x30f40d || _0x30f40d.length === 0) {
      return;
    }
    _0x51ab81;
    this.closeCreatePanel();
    const _0x11eeb4 = _0x4065f8.presentation === "library-save" ? "library-save" : "default";
    const _0x32db3e = document.createElement("div");
    _0x32db3e.className = "v2-asset-create-backdrop show";
    const _0x309205 = document.createElement("div");
    _0x309205.className = "v2-asset-create-panel" + (_0x11eeb4 === "library-save" ? " v2-asset-create-panel--library-save" : "");
    _0x309205.setAttribute("role", "dialog");
    _0x309205.setAttribute("aria-modal", "true");
    _0x309205.setAttribute("aria-label", _0x11eeb4 === "library-save" ? assetManagerText("createPanel.saveTitle") : assetManagerText("title"));
    const _0x5d0a03 = a885_0x5af3bf.getState();
    const _0x5c6636 = _0x5d0a03.nodes[_0x30f40d[0]];
    _0x32db3e.appendChild(_0x309205);
    document.body.appendChild(_0x32db3e);
    this.createPanelBackdrop = _0x32db3e;
    this.createPanel = _0x309205;
    const _0x2b1415 = _0x11eeb4 === "library-save" ? resolveAssetNodePreviewUrl(_0x5c6636) : resolveAssetNodeCoverUrl(_0x5c6636);
    const _0x28bfc4 = this._buildCreatePanelCoverInfo(_0x5c6636, _0x2b1415);
    this._createPanelState = this._createDefaultPanelState(_0x30f40d, _0x28bfc4, {
      presentation: _0x11eeb4,
      defaultName: _0x11eeb4 === "library-save" ? _0x5c6636?.name : ""
    });
    this._renderCreatePanelContent();
    _0x32db3e.addEventListener("pointerdown", _0x5118c4 => {
      if (_0x5118c4.target === _0x32db3e) {
        this.closeCreatePanel();
      }
    });
    this._createPanelKeydownHandler = _0x10b4a4 => {
      if (_0x10b4a4.key !== "Escape") {
        return;
      }
      if (this._createPanelDropdownEl?.contains(_0x10b4a4.target)) {
        return;
      }
      this.closeCreatePanel();
    };
    document.addEventListener("keydown", this._createPanelKeydownHandler);
    if (!_0x28bfc4.coverUrl && resolveAssetNodeCoverThumbId(_0x5c6636)) {
      this._resolveCreatePanelCover(_0x5c6636, {
        preferPreview: _0x11eeb4 === "library-save"
      }).then(_0x155815 => {
        this._applyCreatePanelCoverInfo(_0x309205, _0x155815);
      }).catch(() => {});
    }
  }
  showLibrarySavePanel(_0x17ef7d, _0x31b98f = null, _0x1f3df2 = {}) {
    this.showCreatePanel(_0x17ef7d, _0x31b98f, {
      ..._0x1f3df2,
      placement: "center",
      presentation: "library-save"
    });
  }
  _playCreateAssetFly(_0x51682b) {
    const _0x36eb79 = _0x51682b && _0x51682b.isConnected ? _0x51682b : this.createPanel;
    if (!_0x36eb79?.isConnected) {
      return;
    }
    const _0x22849a = _0x36eb79.querySelector(".v2-asset-create-cover");
    const _0x10effe = _0x22849a?.firstElementChild;
    if (!_0x10effe) {
      return;
    }
    const _0x389008 = document.getElementById("btnAssets");
    playAssetCreateFly({
      fromElement: _0x10effe,
      toElement: _0x389008
    });
  }
  closeCreatePanel() {
    const _0x24b01a = this._categoryKey(this._createPanelState?.editingFolderCategory);
    if (_0x24b01a && !this._createPanelState?.folderActionBusyKey && this._renamingMaterialCategoryKey === _0x24b01a) {
      this._renamingMaterialCategoryKey = "";
    }
    if (this._createPanelDropdownOutsideHandler) {
      document.removeEventListener("pointerdown", this._createPanelDropdownOutsideHandler);
      this._createPanelDropdownOutsideHandler = null;
    }
    if (this._createPanelDropdownEl) {
      this._createPanelDropdownEl.remove();
      this._createPanelDropdownEl = null;
    }
    if (this._createPanelKeydownHandler) {
      document.removeEventListener("keydown", this._createPanelKeydownHandler);
      this._createPanelKeydownHandler = null;
    }
    if (this._createPanelCoverObjectUrl) {
      if (String(this._createPanelCoverObjectUrl).startsWith("blob:")) {
        URL.revokeObjectURL(this._createPanelCoverObjectUrl);
      }
      this._createPanelCoverObjectUrl = "";
    }
    if (this.createPanel) {
      this.createPanel.remove();
      this.createPanel = null;
    }
    if (this.createPanelBackdrop) {
      this.createPanelBackdrop.remove();
      this.createPanelBackdrop = null;
    }
    this._createPanelState = null;
  }
  initSidebarPanel() {
    this.sidebarPanel = document.createElement("div");
    this.sidebarPanel.className = "v2-asset-sidebar-panel canvas-toolbar-panel-surface";
    this.sidebarPanel.setAttribute("aria-label", assetManagerText("libraryTitle"));
    this.sidebarPanel.innerHTML = "\n      <div class=\"v2-asset-sidebar-header\">\n        <button type=\"button\" class=\"v2-material-library-close\" data-ui-action=\"material-library-close\" aria-label=\"" + _escapeHtml(assetManagerText("back")) + "\">\n          <svg viewBox=\"0 0 24 24\" fill=\"none\" aria-hidden=\"true\"><path d=\"m15 18-6-6 6-6\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/></svg>\n        </button>\n        <div class=\"v2-asset-sidebar-title\" id=\"asset-sidebar-title\">\n          <span class=\"v2-asset-sidebar-title-text\" id=\"asset-sidebar-title-text\">" + assetManagerText("libraryTitle") + "</span>\n          <span class=\"v2-material-library-loading\" data-material-loading role=\"status\" aria-live=\"polite\" hidden>\n            <span class=\"v2-material-library-loading-spinner\" aria-hidden=\"true\"></span>\n            <span class=\"v2-material-library-loading-label\">" + _escapeHtml(assetManagerText("loading")) + "</span>\n          </span>\n        </div>\n        <button type=\"button\" class=\"v2-material-library-add\" data-ui-action=\"material-new-folder\" aria-label=\"" + _escapeHtml(assetManagerText("newFolder")) + "\">\n          <svg viewBox=\"0 0 24 24\" fill=\"none\" aria-hidden=\"true\"><path d=\"M12 5v14M5 12h14\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\"/></svg>\n        </button>\n      </div>\n      <div class=\"v2-material-library-tools\">\n        <label class=\"v2-material-library-search\">\n          <svg viewBox=\"0 0 24 24\" fill=\"none\" aria-hidden=\"true\"><circle cx=\"11\" cy=\"11\" r=\"7\" stroke=\"currentColor\" stroke-width=\"1.7\"/><path d=\"m16.5 16.5 4 4\" stroke=\"currentColor\" stroke-width=\"1.7\" stroke-linecap=\"round\"/></svg>\n          <input type=\"search\" data-material-search placeholder=\"" + _escapeHtml(assetManagerText("searchPlaceholder")) + "\" aria-label=\"" + _escapeHtml(assetManagerText("searchAria")) + "\" autocomplete=\"off\" />\n        </label>\n        <button type=\"button\" class=\"v2-material-library-favorites\" data-ui-action=\"material-favorites-toggle\" aria-pressed=\"false\">\n          <svg viewBox=\"0 0 24 24\" aria-hidden=\"true\"><path d=\"m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-2.9-5.6 2.9 1.1-6.2L3 9.6l6.2-.9L12 3Z\" fill=\"currentColor\"/></svg>\n          <span>" + assetManagerText("favorites") + "</span>\n        </button>\n        <div class=\"v2-material-library-divider\"></div>\n        <div class=\"v2-material-library-section-label\">" + assetManagerText("folders") + "</div>\n      </div>\n      <div class=\"v2-asset-sidebar-content\" id=\"asset-sidebar-content\">\n        <div class=\"v2-material-library-tree\" role=\"tree\" aria-label=\"" + _escapeHtml(assetManagerText("folders")) + "\"></div>\n      </div>\n    ";
    const _0x44fc00 = document.querySelector(".sidebar-floating");
    if (_0x44fc00) {
      _0x44fc00.appendChild(this.sidebarPanel);
    } else {
      document.body.appendChild(this.sidebarPanel);
    }
    const _0x2f20e9 = this.sidebarPanel.querySelector("[data-material-search]");
    _0x2f20e9?.addEventListener("input", _0x1ac505 => {
      this._materialSearchQuery = String(_0x1ac505.currentTarget?.value || "");
      this._closeMaterialMenu();
      this._hideMaterialPreview();
      this.renderSidebarContent();
    });
    this.sidebarPanel.querySelector("#asset-sidebar-content")?.addEventListener("scroll", () => {
      this._closeMaterialMenu();
      const _0x5a8287 = this._materialPreviewRow;
      if (_0x5a8287?.isConnected) {
        window.requestAnimationFrame(() => {
          if (_0x5a8287 === this._materialPreviewRow) {
            this._showMaterialPreview(_0x5a8287);
          }
        });
      } else {
        this._hideMaterialPreview();
      }
    }, {
      passive: true
    });
    this.sidebarPanel.addEventListener("click", _0x56770d => {
      const _0x9068f = _0x56770d.target.closest("[data-ui-action]");
      const _0x444d04 = _0x9068f?.dataset?.uiAction || "";
      if (_0x444d04) {
        this._cancelPendingMaterialAssetRowToggle();
      }
      if (_0x444d04 === "material-library-close") {
        this.hideSidebarPanel();
        return;
      }
      if (_0x444d04 === "material-new-folder") {
        this._createMaterialFolder({
          parentCategory: this._materialCurrentFolderCategory || this.activeTab,
          surface: "sidebar"
        });
        return;
      }
      if (_0x444d04 === "material-favorites-toggle") {
        this._materialFavoritesOnly = !this._materialFavoritesOnly;
        this._closeMaterialMenu();
        this._hideMaterialPreview();
        this.renderSidebarContent();
        return;
      }
      if (_0x444d04 === "material-folder-rename") {
        this._beginRenameMaterialCategory(_0x9068f?.dataset?.category);
        return;
      }
      if (_0x444d04 === "material-rename") {
        this._beginRenameAsset(_0x9068f?.dataset?.assetId);
        return;
      }
      if (_0x444d04 === "material-item-rename") {
        this._beginRenameMaterialItem(_0x9068f?.dataset?.assetId, _0x9068f?.dataset?.itemIndex);
        return;
      }
      if (_0x444d04 === "material-folder-delete-request") {
        const _0x347263 = this._normalizeCategoryName(_0x9068f?.dataset?.category);
        if (!_0x347263 || !this._isUserCategory(_0x347263)) {
          return;
        }
        this._pendingMaterialFolderDeleteKey = this._categoryKey(_0x347263);
        this._closeMaterialMenu();
        this._hideMaterialPreview();
        this.renderSidebarContent();
        return;
      }
      if (_0x444d04 === "material-folder-delete-cancel") {
        this._pendingMaterialFolderDeleteKey = "";
        this.renderSidebarContent();
        return;
      }
      if (_0x444d04 === "material-folder-delete-confirm") {
        const _0x4bb437 = this._normalizeCategoryName(_0x9068f?.dataset?.category);
        const _0x2e7f6d = this._categoryKey(_0x4bb437);
        if (!_0x4bb437 || !this._isUserCategory(_0x4bb437) || this._pendingMaterialFolderDeleteKey !== _0x2e7f6d || this._deletingMaterialFolderKey) {
          return;
        }
        this._pendingMaterialFolderDeleteKey = "";
        this._deletingMaterialFolderKey = _0x2e7f6d;
        this.renderSidebarContent();
        this._deleteUserCategory(_0x4bb437).finally(() => {
          if (this._deletingMaterialFolderKey === _0x2e7f6d) {
            this._deletingMaterialFolderKey = "";
          }
          this.renderSidebarContent();
        });
        return;
      }
      if (_0x444d04 === "material-folder-toggle") {
        this._toggleMaterialFolderDisclosure(_0x9068f);
        return;
      }
      if (_0x444d04 === "material-asset-toggle") {
        this._toggleMaterialAssetDisclosure(_0x9068f);
        return;
      }
      if (_0x444d04 === "material-menu-open") {
        _0x56770d.preventDefault();
        _0x56770d.stopPropagation();
        const _0x2111e9 = String(_0x9068f?.dataset?.assetId || "");
        if (_0x2111e9) {
          this._openMaterialMenu(_0x2111e9, _0x9068f);
        }
        return;
      }
      if (_0x444d04 || _0x56770d.target.closest("input, button, [contenteditable='true'], .v2-material-folder-delete-actions")) {
        return;
      }
      const _0x15b154 = _0x56770d.target.closest(".v2-material-folder-row");
      if (_0x15b154) {
        const _0x4ed682 = _0x15b154.querySelector("[data-ui-action=\"material-folder-toggle\"]");
        if (_0x4ed682 && !_0x4ed682.disabled && _0x56770d.detail <= 1) {
          this._toggleMaterialFolderDisclosure(_0x4ed682);
        }
        return;
      }
      const _0x1f2509 = _0x56770d.target.closest(".v2-material-project-row");
      if (_0x1f2509) {
        const _0x11940c = _0x1f2509.querySelector("[data-ui-action=\"material-asset-toggle\"]");
        if (_0x11940c && !_0x11940c.disabled && _0x56770d.detail <= 1) {
          this._toggleMaterialAssetDisclosure(_0x11940c);
        }
        return;
      }
      const _0x175309 = _0x56770d.target.closest(".v2-material-asset-row");
      if (_0x175309) {
        const _0x2f610e = _0x175309.querySelector("[data-ui-action=\"material-asset-toggle\"]");
        if (!_0x2f610e || _0x2f610e.disabled) {
          return;
        }
        if (_0x56770d.detail > 1) {
          this._cancelPendingMaterialAssetRowToggle();
          return;
        }
        this._scheduleMaterialAssetRowToggle(_0x2f610e);
      }
    });
    this.sidebarPanel.addEventListener("contextmenu", _0x1f5cd0 => {
      this._materialContextMenuController.handleContextMenu(_0x1f5cd0);
    });
    this.sidebarPanel.addEventListener("dblclick", _0x1609fd => {
      _0x1609fd.stopPropagation();
      if (_0x1609fd.target.closest(".v2-material-name-input, .v2-material-item-name-input, .v2-material-folder-name-input, [data-ui-action]")) {
        return;
      }
      const _0x3cdc4a = _0x1609fd.target.closest("[data-material-use]");
      const _0xaa8df = String(_0x3cdc4a?.dataset?.assetId || "");
      if (!_0x3cdc4a || !_0xaa8df) {
        return;
      }
      this._cancelPendingMaterialAssetRowToggle();
      _0x1609fd.preventDefault();
      _0x1609fd.stopPropagation();
      const _0x33c6af = Number(_0x3cdc4a.dataset.itemIndex);
      if (_0x3cdc4a.dataset.itemIndex !== undefined && Number.isFinite(_0x33c6af)) {
        this._restoreAssetSubItem(_0xaa8df, _0x33c6af);
      } else {
        this.restoreAssetToCanvas(_0xaa8df);
      }
    });
    this.sidebarPanel.addEventListener("keydown", _0x3e38a1 => {
      const _0x47806a = _0x3e38a1.target.closest(".v2-material-item-name-input");
      if (_0x47806a) {
        if (_0x3e38a1.key === "Enter") {
          _0x3e38a1.preventDefault();
          _0x3e38a1.stopPropagation();
          _0x47806a.dataset.submitted = "1";
          this._commitRenameMaterialItem(_0x47806a.dataset.assetId, _0x47806a.dataset.itemIndex, _0x47806a.value);
        } else if (_0x3e38a1.key === "Escape") {
          _0x3e38a1.preventDefault();
          _0x3e38a1.stopPropagation();
          _0x47806a.dataset.submitted = "1";
          this._cancelRenameMaterialItem();
        }
        return;
      }
      const _0x20fc1a = _0x3e38a1.target.closest(".v2-material-folder-name-input");
      if (_0x20fc1a) {
        if (_0x3e38a1.key === "Enter") {
          _0x3e38a1.preventDefault();
          _0x3e38a1.stopPropagation();
          _0x20fc1a.dataset.submitted = "1";
          this._commitRenameMaterialCategory(_0x20fc1a.dataset.category, _0x20fc1a.value);
        } else if (_0x3e38a1.key === "Escape") {
          _0x3e38a1.preventDefault();
          _0x3e38a1.stopPropagation();
          _0x20fc1a.dataset.submitted = "1";
          this._cancelRenameMaterialCategory();
        }
        return;
      }
      const _0x1509ff = _0x3e38a1.target.closest(".v2-material-name-input");
      if (!_0x1509ff) {
        return;
      }
      const _0x10eb57 = String(_0x1509ff.dataset.assetId || "");
      if (_0x3e38a1.key === "Enter") {
        _0x3e38a1.preventDefault();
        _0x1509ff.dataset.submitted = "1";
        this._commitRenameAsset(_0x10eb57, _0x1509ff.value);
      } else if (_0x3e38a1.key === "Escape") {
        _0x3e38a1.preventDefault();
        _0x1509ff.dataset.submitted = "1";
        this._cancelRenameAsset();
      }
    });
    this.sidebarPanel.addEventListener("focusout", _0x471d35 => {
      const _0x282b1f = _0x471d35.target.closest(".v2-material-item-name-input");
      if (_0x282b1f) {
        if (_0x282b1f.dataset.submitted === "1") {
          return;
        }
        _0x282b1f.dataset.submitted = "1";
        this._commitRenameMaterialItem(_0x282b1f.dataset.assetId, _0x282b1f.dataset.itemIndex, _0x282b1f.value);
        return;
      }
      const _0x9f6965 = _0x471d35.target.closest(".v2-material-folder-name-input");
      if (_0x9f6965) {
        if (_0x9f6965.dataset.submitted === "1") {
          return;
        }
        _0x9f6965.dataset.submitted = "1";
        this._commitRenameMaterialCategory(_0x9f6965.dataset.category, _0x9f6965.value);
        return;
      }
      const _0x2d2aba = _0x471d35.target.closest(".v2-material-name-input");
      if (!_0x2d2aba || _0x2d2aba.dataset.submitted === "1") {
        return;
      }
      _0x2d2aba.dataset.submitted = "1";
      this._commitRenameAsset(_0x2d2aba.dataset.assetId, _0x2d2aba.value);
    });
    this.sidebarPanel.addEventListener("pointerover", _0x3946f9 => {
      const _0x2a38c1 = _0x3946f9.target.closest("[data-material-preview]");
      if (!_0x2a38c1 || _0x2a38c1.contains(_0x3946f9.relatedTarget)) {
        return;
      }
      this._showMaterialPreview(_0x2a38c1);
    });
    this.sidebarPanel.addEventListener("pointerout", _0x4fdc26 => {
      const _0x3111cf = _0x4fdc26.target.closest("[data-material-preview]");
      if (!_0x3111cf || _0x3111cf.contains(_0x4fdc26.relatedTarget)) {
        return;
      }
      this._hideMaterialPreview();
    });
    this.sidebarPanel.addEventListener("dragstart", _0xa0eab8 => {
      const _0x424b84 = _0xa0eab8.target.closest("[data-material-drag]");
      const _0x138a6c = String(_0x424b84?.dataset?.assetId || "");
      if (!_0x424b84 || !_0x138a6c || !_0xa0eab8.dataTransfer) {
        _0xa0eab8.preventDefault();
        return;
      }
      const _0x3c18a8 = {
        assetId: _0x138a6c,
        itemIndex: _0x424b84.dataset.itemIndex === undefined ? null : Number(_0x424b84.dataset.itemIndex)
      };
      _0xa0eab8.dataTransfer.setData("application/x-aicanvas-material", JSON.stringify(_0x3c18a8));
      _0xa0eab8.dataTransfer.effectAllowed = "copy";
      _0x424b84.classList.add("is-dragging");
      this._hideMaterialPreview();
      this._closeMaterialMenu();
    });
    this.sidebarPanel.addEventListener("dragend", _0x61e3eb => {
      _0x61e3eb.target.closest("[data-material-drag]")?.classList.remove("is-dragging");
    });
    this._installMaterialDropTarget();
    const _0x58e43b = document.getElementById("btnAssets");
    if (_0x58e43b) {
      let _0x1812c4 = false;
      const _0x333f0b = () => {
        if (!this.sidebarPanel.classList.contains("show")) {
          this.showSidebarPanel();
        }
        if (!_0x1812c4) {
          _0x1812c4 = true;
          const _0x5f1a48 = this._materialLoadingCount > 0 ? this._assetLoadPromise : this.loadAssetsFromServer();
          this._assetLoadPromise = Promise.resolve(_0x5f1a48);
          this._assetLoadPromise.finally(() => {
            _0x1812c4 = false;
          });
        }
      };
      registerSidebarSubmenu({
        key: "assets",
        button: _0x58e43b,
        panel: this.sidebarPanel,
        open: _0x333f0b,
        close: () => this.hideSidebarPanel(),
        isOpen: () => this.sidebarPanel.classList.contains("show"),
        ignorePointerDown: _0x91ec84 => this._materialMenuEl?.contains?.(_0x91ec84.target) === true
      });
    }
  }
  showSidebarPanel() {
    this._expandedMaterialCategories.clear();
    this._expandedMaterialAssets.clear();
    this._pendingMaterialFolderDeleteKey = "";
    this._deletingMaterialFolderKey = "";
    this.sidebarPanel.classList.add("show");
    this.renderSidebarContent();
    this._warmVisibleAssetMedia();
  }
  hideSidebarPanel() {
    this._materialContextMenuController.close();
    this._closeMaterialMenu();
    this._hideMaterialPreview();
    this.sidebarPanel.classList.remove("show");
    const _0x5b99a7 = document.getElementById("btnAssets");
    _0x5b99a7?.classList.remove("active");
    _0x5b99a7?.setAttribute("aria-expanded", "false");
  }
  _installMaterialDropTarget() {
    if (this._materialDropTarget) {
      return;
    }
    const _0x66b9f6 = document.getElementById("v2-wrap");
    if (!_0x66b9f6) {
      return;
    }
    this._materialDropTarget = _0x66b9f6;
    const _0x2098df = _0x9235a6 => Array.from(_0x9235a6.dataTransfer?.types || []).includes("application/x-aicanvas-material");
    _0x66b9f6.addEventListener("dragover", _0x19bf9e => {
      if (!_0x2098df(_0x19bf9e)) {
        return;
      }
      if (_0x19bf9e.target.closest(".v2-asset-sidebar-panel") || _0x19bf9e.target.closest(".v2-material-context-menu")) {
        return;
      }
      _0x19bf9e.preventDefault();
      _0x19bf9e.dataTransfer.dropEffect = "copy";
    });
    _0x66b9f6.addEventListener("drop", _0x367634 => {
      const _0x4ba6b1 = _0x367634.dataTransfer?.getData("application/x-aicanvas-material");
      if (!_0x4ba6b1 || _0x367634.target.closest(".v2-asset-sidebar-panel")) {
        return;
      }
      _0x367634.preventDefault();
      let _0x35fb10 = null;
      try {
        _0x35fb10 = JSON.parse(_0x4ba6b1);
      } catch (_0x362ff1) {
        return;
      }
      const _0x8f9b09 = String(_0x35fb10?.assetId || "");
      if (!_0x8f9b09) {
        return;
      }
      const _0x2f372d = screenToWorld(_0x367634.clientX, _0x367634.clientY, a885_0x5af3bf.getState().viewport);
      if (Number.isFinite(_0x35fb10?.itemIndex)) {
        this._restoreAssetSubItem(_0x8f9b09, _0x35fb10.itemIndex, _0x2f372d);
      } else {
        this.restoreAssetToCanvas(_0x8f9b09, _0x2f372d);
      }
    });
  }
  _getMaterialAsset(_0x3cc560) {
    const _0xf78d7 = String(_0x3cc560 || "");
    return (this.assets || []).find(_0x1ecd0b => String(_0x1ecd0b?.id || "") === _0xf78d7);
  }
  _materialMenuIcon(_0x4eadc3) {
    const _0x5e3234 = {
      favorite: "<path d=\"m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-2.9-5.6 2.9 1.1-6.2L3 9.6l6.2-.9L12 3Z\" stroke=\"currentColor\" stroke-width=\"1.6\" stroke-linejoin=\"round\"/>",
      rename: "<path d=\"m4 16-.8 4 4-.8L18.4 8 15.9 5.6 4 16Z\" stroke=\"currentColor\" stroke-width=\"1.7\" stroke-linejoin=\"round\"/><path d=\"m13.8 7.7 2.5 2.5\" stroke=\"currentColor\" stroke-width=\"1.7\"/>",
      move: "<path d=\"M3.5 7.5h6l2-2h9v13h-17v-11Z\" stroke=\"currentColor\" stroke-width=\"1.7\" stroke-linejoin=\"round\"/>",
      duplicate: "<rect x=\"7\" y=\"7\" width=\"12\" height=\"12\" rx=\"2\" stroke=\"currentColor\" stroke-width=\"1.7\"/><path d=\"M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1\" stroke=\"currentColor\" stroke-width=\"1.7\"/>",
      download: "<path d=\"M12 3v12m0 0 4-4m-4 4-4-4M5 18v3h14v-3\" stroke=\"currentColor\" stroke-width=\"1.7\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/>",
      delete: "<path d=\"M4 7h16M9 3h6l1 2H8l1-2Zm-3 4 1 14h10l1-14M10 11v6m4-6v6\" stroke=\"currentColor\" stroke-width=\"1.7\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/>"
    };
    return "<svg viewBox=\"0 0 24 24\" fill=\"none\" aria-hidden=\"true\">" + (_0x5e3234[_0x4eadc3] || "") + "</svg>";
  }
  _materialMenuButton(_0x47c248, _0x43125c, _0x40a6b3, _0x566eb0 = "") {
    return "<button type=\"button\" role=\"menuitem\" data-material-menu-action=\"" + _0x47c248 + "\" " + _0x566eb0 + ">\n      " + this._materialMenuIcon(_0x43125c) + "\n      <span>" + _escapeHtml(_0x40a6b3) + "</span>\n    </button>";
  }
  _openMaterialMenu(_0x3e8ba6, _0x4d0378) {
    const _0x2411ac = this._getMaterialAsset(_0x3e8ba6);
    if (!_0x2411ac || !_0x4d0378) {
      return;
    }
    this._hideMaterialPreview();
    this._closeMaterialMenu();
    this._materialMenuState = {
      assetId: String(_0x3e8ba6),
      anchorEl: _0x4d0378,
      showMove: false,
      confirmDelete: false,
      busy: false
    };
    const _0x3383e2 = document.createElement("div");
    _0x3383e2.className = "v2-material-context-menu";
    _0x3383e2.setAttribute("role", "menu");
    _0x3383e2.setAttribute("aria-label", assetManagerText("menu.aria"));
    _0x3383e2.addEventListener("click", _0x274068 => {
      const _0x5f5600 = _0x274068.target.closest("[data-material-menu-action]");
      const _0x48efe7 = String(_0x5f5600?.dataset?.materialMenuAction || "");
      if (!_0x48efe7 || this._materialMenuState?.busy) {
        return;
      }
      _0x274068.preventDefault();
      _0x274068.stopPropagation();
      this._handleMaterialMenuAction(_0x48efe7, _0x5f5600);
    });
    document.body.appendChild(_0x3383e2);
    this._materialMenuEl = _0x3383e2;
    this._renderMaterialMenu();
    this._materialMenuOutsideHandler = _0x528bc3 => {
      if (this._materialMenuEl?.contains(_0x528bc3.target) || this._materialMenuState?.anchorEl?.contains?.(_0x528bc3.target)) {
        return;
      }
      this._closeMaterialMenu();
    };
    this._materialMenuKeydownHandler = _0x52c4b3 => {
      if (_0x52c4b3.key !== "Escape") {
        return;
      }
      _0x52c4b3.preventDefault();
      _0x52c4b3.stopImmediatePropagation();
      const _0x4d2aa4 = this._materialMenuState?.anchorEl;
      this._closeMaterialMenu();
      _0x4d2aa4?.focus?.({
        preventScroll: true
      });
    };
    document.addEventListener("pointerdown", this._materialMenuOutsideHandler);
    document.addEventListener("keydown", this._materialMenuKeydownHandler, true);
  }
  _positionMaterialMenu() {
    const _0x31e536 = this._materialMenuEl;
    const _0x1ed41e = this._materialMenuState?.anchorEl;
    if (!_0x31e536) {
      return;
    }
    if (!_0x1ed41e?.isConnected) {
      this._closeMaterialMenu();
      return;
    }
    const _0xe70f43 = _0x1ed41e.getBoundingClientRect();
    const _0x36555b = _0x31e536.getBoundingClientRect();
    const _0x408021 = document.documentElement?.clientWidth || window.innerWidth || 0;
    const _0x3a8681 = document.documentElement?.clientHeight || window.innerHeight || 0;
    const _0x37c093 = 8;
    let _0x1280cc = _0xe70f43.right + _0x37c093;
    if (_0x1280cc + _0x36555b.width > _0x408021 - 12) {
      _0x1280cc = Math.max(12, _0xe70f43.left - _0x36555b.width - _0x37c093);
    }
    const _0x1e5386 = Math.max(12, Math.min(_0xe70f43.top - 8, _0x3a8681 - _0x36555b.height - 12));
    _0x31e536.style.left = Math.round(_0x1280cc) + "px";
    _0x31e536.style.top = Math.round(_0x1e5386) + "px";
  }
  _renderMaterialMenu() {
    const _0x308b22 = this._materialMenuEl;
    const _0x4078d6 = this._materialMenuState;
    const _0x274ca5 = this._getMaterialAsset(_0x4078d6?.assetId);
    if (!_0x308b22 || !_0x4078d6 || !_0x274ca5) {
      this._closeMaterialMenu();
      return;
    }
    if (_0x4078d6.busy) {
      _0x308b22.innerHTML = "<div class=\"v2-material-menu-pending\" role=\"status\"><span></span>" + _escapeHtml(assetManagerText("menu.processing")) + "</div>";
      this._positionMaterialMenu();
      return;
    }
    if (_0x4078d6.confirmDelete) {
      _0x308b22.innerHTML = "\n        <div class=\"v2-material-menu-confirm\">" + _escapeHtml(assetManagerText("menu.confirmDelete", {
        name: _0x274ca5.name || assetManagerText("unnamedAsset")
      })) + "</div>\n        <div class=\"v2-material-menu-confirm-actions\">\n          <button type=\"button\" data-material-menu-action=\"delete-cancel\">" + assetManagerText("cancel") + "</button>\n          <button type=\"button\" class=\"is-danger\" data-material-menu-action=\"delete-confirm\">" + assetManagerText("menu.delete") + "</button>\n        </div>\n      ";
      this._positionMaterialMenu();
      return;
    }
    const _0x171906 = this._categoryKey(_0x274ca5.category);
    const _0x1983df = (this.tabs || []).filter(_0x108a22 => this._categoryKey(_0x108a22) !== _0x171906);
    const _0x3f55eb = _0x4078d6.showMove ? "<div class=\"v2-material-move-submenu\" role=\"menu\" aria-label=\"" + _escapeHtml(assetManagerText("menu.moveTo")) + "\">\n          " + (_0x1983df.length ? _0x1983df.map(_0x21c4d0 => "<button type=\"button\" role=\"menuitem\" data-material-menu-action=\"move-target\" data-category=\"" + _escapeHtml(_0x21c4d0) + "\">" + _escapeHtml(this._formatCategoryLabel(_0x21c4d0)) + "</button>").join("") : "<div class=\"v2-material-menu-empty\">" + _escapeHtml(assetManagerText("menu.noMoveTarget")) + "</div>") + "\n        </div>" : "";
    _0x308b22.innerHTML = "\n      " + this._materialMenuButton("favorite", "favorite", isMaterialAssetFavorite(_0x274ca5) ? assetManagerText("menu.unfavorite") : assetManagerText("menu.favorite")) + "\n      " + this._materialMenuButton("rename", "rename", assetManagerText("menu.rename")) + "\n      <div class=\"v2-material-menu-submenu-wrap\">\n        " + this._materialMenuButton("move", "move", assetManagerText("menu.moveTo"), "aria-haspopup=\"menu\" aria-expanded=\"" + (_0x4078d6.showMove ? "true" : "false") + "\"") + "\n        " + _0x3f55eb + "\n      </div>\n      " + this._materialMenuButton("duplicate", "duplicate", assetManagerText("menu.duplicate")) + "\n      " + this._materialMenuButton("download", "download", assetManagerText("menu.download")) + "\n      <div class=\"v2-material-menu-separator\"></div>\n      " + this._materialMenuButton("delete", "delete", assetManagerText("menu.delete"), "class=\"is-danger\"") + "\n    ";
    this._positionMaterialMenu();
  }
  _closeMaterialMenu() {
    if (this._materialMenuOutsideHandler) {
      document.removeEventListener("pointerdown", this._materialMenuOutsideHandler);
      this._materialMenuOutsideHandler = null;
    }
    if (this._materialMenuKeydownHandler) {
      document.removeEventListener("keydown", this._materialMenuKeydownHandler, true);
      this._materialMenuKeydownHandler = null;
    }
    this._materialMenuEl?.remove();
    this._materialMenuEl = null;
    this._materialMenuState = null;
  }
  async _runMaterialMenuTask(_0x483f88, _0xd70851, _0x14770e) {
    const _0x49af32 = this._materialMenuState;
    if (!_0x49af32 || _0x49af32.busy) {
      return;
    }
    _0x49af32.busy = true;
    this._renderMaterialMenu();
    try {
      const _0x83992d = await _0x483f88();
      this._closeMaterialMenu();
      this.renderSidebarContent();
      if (_0xd70851 && _0x83992d !== false && _0x83992d?.canceled !== true) {
        window.showToast?.(_0xd70851, "success");
      }
    } catch (_0x2f2feb) {
      if (this._materialMenuState === _0x49af32) {
        _0x49af32.busy = false;
        this._renderMaterialMenu();
      }
      window.showToast?.(_0x2f2feb?.message || _0x14770e || assetManagerText("menu.actionFailed"), "error");
    }
  }
  _handleMaterialMenuAction(_0x12972a, _0x53d00c) {
    const _0x338d84 = this._materialMenuState;
    const _0x440017 = String(_0x338d84?.assetId || "");
    if (!_0x440017) {
      return;
    }
    if (_0x12972a === "rename") {
      this._closeMaterialMenu();
      this._beginRenameAsset(_0x440017);
      return;
    }
    if (_0x12972a === "move") {
      _0x338d84.showMove = !_0x338d84.showMove;
      this._renderMaterialMenu();
      return;
    }
    if (_0x12972a === "delete") {
      _0x338d84.confirmDelete = true;
      this._renderMaterialMenu();
      return;
    }
    if (_0x12972a === "delete-cancel") {
      _0x338d84.confirmDelete = false;
      this._renderMaterialMenu();
      return;
    }
    if (_0x12972a === "favorite") {
      this._runMaterialMenuTask(() => this._toggleMaterialFavorite(_0x440017), assetManagerText("toasts.favoriteUpdated"), assetManagerText("menu.actionFailed"));
      return;
    }
    if (_0x12972a === "move-target") {
      this._runMaterialMenuTask(() => this._moveMaterialAsset(_0x440017, _0x53d00c?.dataset?.category), assetManagerText("toasts.moved"), assetManagerText("menu.actionFailed"));
      return;
    }
    if (_0x12972a === "duplicate") {
      this._runMaterialMenuTask(() => this._duplicateMaterialAsset(_0x440017), assetManagerText("toasts.duplicated"), assetManagerText("menu.actionFailed"));
      return;
    }
    if (_0x12972a === "download") {
      this._runMaterialMenuTask(() => this._downloadMaterialAsset(_0x440017), "", assetManagerText("menu.downloadFailed"));
      return;
    }
    if (_0x12972a === "delete-confirm") {
      this._runMaterialMenuTask(() => this._deleteAsset(_0x440017), assetManagerText("toasts.deleted"), assetManagerText("deleteFailed"));
    }
  }
  async _toggleMaterialFavorite(_0x482813) {
    const _0x3dc9da = this._getMaterialAsset(_0x482813);
    if (!_0x3dc9da) {
      throw new Error(assetManagerText("menu.actionFailed"));
    }
    const _0x3753db = {
      ..._0x3dc9da,
      favorite: !isMaterialAssetFavorite(_0x3dc9da),
      updatedAt: Date.now()
    };
    delete _0x3753db.isFavorite;
    await saveAssetToServer(_0x3753db);
    this._upsertLocalAsset(_0x3753db);
    return _0x3753db;
  }
  async _moveMaterialAsset(_0x42cb20, _0x107450) {
    const _0x34d114 = this._getMaterialAsset(_0x42cb20);
    const _0x4ad338 = this._findCategoryByName(_0x107450, this.tabs);
    if (!_0x34d114 || !_0x4ad338) {
      throw new Error(assetManagerText("menu.actionFailed"));
    }
    const _0x3d7f06 = {
      ..._0x34d114,
      category: _0x4ad338,
      updatedAt: Date.now()
    };
    await saveAssetToServer(_0x3d7f06);
    this._upsertLocalAsset(_0x3d7f06);
    this._expandedMaterialCategories.add(this._categoryKey(_0x4ad338));
    return _0x3d7f06;
  }
  async _duplicateMaterialAsset(_0x13f8c6) {
    const _0x20a03c = this._getMaterialAsset(_0x13f8c6);
    const _0x38b147 = buildMaterialDuplicate(_0x20a03c, {
      id: generateId("asset"),
      now: Date.now(),
      nameSuffix: assetManagerText("copySuffix")
    });
    if (!_0x38b147) {
      throw new Error(assetManagerText("menu.actionFailed"));
    }
    await saveAssetToServer(_0x38b147);
    this._upsertLocalAsset(_0x38b147);
    this._newAssetPulseId = _0x38b147.id;
    return _0x38b147;
  }
  async _downloadMaterialAsset(_0x3dfd66) {
    const _0xff123c = this._getMaterialAsset(_0x3dfd66);
    const _0x1d7a15 = buildMaterialDownloadFiles(_0xff123c);
    if (!_0x1d7a15.length) {
      throw new Error(assetManagerText("menu.noDownloadableMedia"));
    }
    return await saveMediaFilesDownload({
      title: assetManagerText("menu.downloadTitle", {
        name: _0xff123c?.name || assetManagerText("unnamedAsset")
      }),
      files: _0x1d7a15
    });
  }
  _ensureMaterialPreview() {
    if (this._materialPreviewEl?.isConnected) {
      return this._materialPreviewEl;
    }
    const _0x11c07d = document.createElement("div");
    _0x11c07d.className = "v2-material-hover-preview";
    _0x11c07d.setAttribute("role", "tooltip");
    _0x11c07d.hidden = true;
    document.body.appendChild(_0x11c07d);
    this._materialPreviewEl = _0x11c07d;
    return _0x11c07d;
  }
  _showMaterialPreview(_0x1f8588) {
    if (!this.sidebarPanel?.classList.contains("show")) {
      return;
    }
    const _0x226e9e = this._getMaterialAsset(_0x1f8588?.dataset?.assetId);
    if (!_0x226e9e) {
      return;
    }
    this._materialPreviewRow = _0x1f8588;
    const _0xffeb00 = _0x1f8588.dataset.itemIndex === undefined ? null : Number(_0x1f8588.dataset.itemIndex);
    const _0x24ea26 = getMaterialAssetItems(_0x226e9e).map(_0xd56a66 => ({
      ..._0xd56a66,
      thumbSrc: _resolveMaterialItemThumbSrc(_0xd56a66),
      previewSrc: _resolveMaterialItemPreviewSrc(_0xd56a66),
      previewAspectRatio: resolveAssetNodePreviewAspectRatio(_0xd56a66?.nodeData)
    }));
    const _0x4f762b = Number.isFinite(_0xffeb00) ? _0x24ea26.slice(_0xffeb00, _0xffeb00 + 1) : _0x24ea26.slice(0, 4);
    const _0x165819 = Number.isFinite(_0xffeb00) ? _0x24ea26[_0xffeb00] : null;
    const _0x1b6ab3 = _0x165819?.name || _0x165819?.nodeData?.name || _0x226e9e.name || assetManagerText("unnamedAsset");
    const _0x494471 = this._ensureMaterialPreview();
    const _0x455cf5 = _0x4f762b.length === 1 ? _0x4f762b[0] : null;
    const _0x26121b = _0x455cf5?.previewAspectRatio || 4 / 3;
    _0x494471.classList.toggle("is-single", Boolean(_0x455cf5));
    if (_0x455cf5) {
      _0x494471.style.setProperty("--material-preview-aspect", String(_0x26121b));
    } else {
      _0x494471.style.removeProperty("--material-preview-aspect");
    }
    _0x494471.innerHTML = "\n      <div class=\"v2-material-preview-media\"></div>\n      <div class=\"v2-material-preview-copy\">\n        <strong>" + _escapeHtml(_0x1b6ab3) + "</strong>\n      </div>\n    ";
    const _0x1eecb7 = _0x494471.querySelector(".v2-material-preview-media");
    if (!_0x4f762b.length) {
      this._setThumbContent(_0x1eecb7, _0x226e9e.coverUrl, _0x226e9e.coverType || "other");
    } else if (_0x455cf5) {
      this._setThumbContent(_0x1eecb7, _0x455cf5.previewSrc, _0x455cf5.type);
    } else {
      const _0x3c192d = document.createElement("div");
      _0x3c192d.className = "v2-material-preview-grid has-" + Math.min(4, _0x4f762b.length);
      _0x4f762b.forEach(_0x59dca0 => {
        const _0x56764b = document.createElement("div");
        _0x56764b.className = "v2-material-preview-cell";
        _0x3c192d.appendChild(_0x56764b);
        this._setThumbContent(_0x56764b, _0x59dca0.thumbSrc, _0x59dca0.type);
      });
      _0x1eecb7.replaceChildren(_0x3c192d);
    }
    _0x494471.hidden = false;
    const _0x5df02d = _0x1f8588.getBoundingClientRect();
    const _0x2598d4 = this.sidebarPanel.getBoundingClientRect();
    const _0x876065 = _0x494471.getBoundingClientRect();
    const _0x2042a5 = document.documentElement?.clientWidth || window.innerWidth || 0;
    const _0x161243 = document.documentElement?.clientHeight || window.innerHeight || 0;
    let _0x1a6a16 = _0x2598d4.right + 12;
    if (_0x1a6a16 + _0x876065.width > _0x2042a5 - 12) {
      _0x1a6a16 = Math.max(12, _0x2598d4.left - _0x876065.width - 12);
    }
    const _0x1b84f4 = Math.max(12, Math.min(_0x5df02d.top - 8, _0x161243 - _0x876065.height - 12));
    _0x494471.style.left = Math.round(_0x1a6a16) + "px";
    _0x494471.style.top = Math.round(_0x1b84f4) + "px";
  }
  _hideMaterialPreview() {
    this._materialPreviewRow = null;
    if (this._materialPreviewEl) {
      this._materialPreviewEl.hidden = true;
    }
  }
  _getVisibleAssetCardsInList() {
    const _0x1b0d03 = this.sidebarPanel?.querySelector("#asset-sidebar-content > .v2-asset-view-list");
    if (!_0x1b0d03) {
      return {
        listView: null,
        cards: []
      };
    }
    const _0x4c964e = Array.from(_0x1b0d03.querySelectorAll(":scope > .v2-asset-item")).filter(_0x57467f => _0x57467f.style.display !== "none");
    return {
      listView: _0x1b0d03,
      cards: _0x4c964e
    };
  }
  _captureRectsById(_0x237884) {
    const _0xacd50 = new Map();
    for (const _0x104a01 of _0x237884) {
      const _0x4e8f5d = String(_0x104a01.dataset?.id || "");
      if (!_0x4e8f5d) {
        continue;
      }
      _0xacd50.set(_0x4e8f5d, _0x104a01.getBoundingClientRect());
    }
    return _0xacd50;
  }
  _playFlip(_0x520efc, _0x1a8ff4) {
    if (!_0x520efc || !_0x1a8ff4?.size) {
      return;
    }
    const _0x28d0aa = Array.from(_0x520efc.querySelectorAll(":scope > .v2-asset-item")).filter(_0x2663a2 => _0x2663a2.style.display !== "none");
    const _0x58d1d6 = new Map();
    for (const _0x677263 of _0x28d0aa) {
      const _0x3f8f51 = String(_0x677263.dataset?.id || "");
      if (!_0x3f8f51) {
        continue;
      }
      _0x58d1d6.set(_0x3f8f51, _0x677263.getBoundingClientRect());
    }
    for (const _0x53cccc of _0x28d0aa) {
      const _0x2e9d36 = String(_0x53cccc.dataset?.id || "");
      if (!_0x2e9d36) {
        continue;
      }
      const _0xf5422 = _0x1a8ff4.get(_0x2e9d36);
      const _0x4438aa = _0x58d1d6.get(_0x2e9d36);
      if (!_0xf5422 || !_0x4438aa) {
        continue;
      }
      const _0x477599 = _0xf5422.left - _0x4438aa.left;
      const _0x211027 = _0xf5422.top - _0x4438aa.top;
      if (!_0x477599 && !_0x211027) {
        continue;
      }
      _0x53cccc.animate([{
        transform: "translate(" + _0x477599 + "px, " + _0x211027 + "px)"
      }, {
        transform: "translate(0, 0)"
      }], {
        duration: 220,
        easing: "cubic-bezier(0.2, 0, 0, 1)"
      });
    }
  }
  _playDeleteShake(_0x25724b) {
    if (!_0x25724b) {
      return;
    }
    _0x25724b.classList.remove("is-delete-shaking");
    _0x25724b.offsetWidth;
    _0x25724b.classList.add("is-delete-shaking");
    window.setTimeout(() => {
      if (_0x25724b.isConnected) {
        _0x25724b.classList.remove("is-delete-shaking");
      }
    }, 240);
  }
  async _deleteAsset(_0xdf51b2) {
    const _0x46c03f = String(_0xdf51b2 || "");
    if (!_0x46c03f) {
      return;
    }
    const {
      listView: _0x1f360f,
      cards: _0x5c3087
    } = this._getVisibleAssetCardsInList();
    const _0xfd5c7a = this._captureRectsById(_0x5c3087);
    try {
      const _0x5b51d1 = await deleteAssetFromServer(_0x46c03f);
      if (_0x5b51d1 !== true) {
        throw new Error(assetManagerText("deleteFailed"));
      }
    } catch (_0x45df5c) {
      window.showToast?.(assetManagerText("deleteFailed"), "error");
      return false;
    }
    this.assets = (this.assets || []).filter(_0x3493c3 => String(_0x3493c3?.id || "") !== _0x46c03f);
    this._syncTabsFromAssets();
    this._renderSidebarTabs();
    removeAssetMentionAsset(_0x46c03f);
    if (this._openAssetId === _0x46c03f) {
      this._openAssetId = null;
    }
    const _0x296555 = this._assetCardPool?.get?.(_0x46c03f);
    if (_0x296555?.isConnected) {
      _0x296555.remove();
    }
    this._assetCardPool?.delete?.(_0x46c03f);
    this.renderSidebarContent();
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        const {
          listView: _0x55070f
        } = this._getVisibleAssetCardsInList();
        this._playFlip(_0x55070f, _0xfd5c7a);
      });
    });
    return true;
  }
  async _deleteUserCategory(_0x1aa79d) {
    const _0x5b4c53 = this._normalizeCategoryName(_0x1aa79d);
    if (!_0x5b4c53 || !this._isUserCategory(_0x5b4c53)) {
      return false;
    }
    const _0x2a8d89 = this._getSortedAssets().filter(_0x43772b => this._categoryKey(_0x43772b?.category) === this._categoryKey(_0x5b4c53));
    const _0x307571 = [...this.userCategories];
    const _0x5d2b61 = {
      ...this.materialCategoryParents
    };
    const _0xf43e0e = this._getMaterialParentCategory(_0x5b4c53);
    const _0x2ed5e4 = this._findCategoryByName("Others", this.tabs) || "Others";
    const _0x2ed16a = this._normalizeUserCategories(_0x307571.filter(_0x5c6c42 => this._categoryKey(_0x5c6c42) !== this._categoryKey(_0x5b4c53)));
    const _0x44904d = deleteMaterialFolderParent({
      parents: _0x5d2b61,
      category: _0x5b4c53,
      categoryKey: _0x2b243d => this._categoryKey(_0x2b243d)
    });
    const _0x5ebc7f = Date.now();
    const _0x549b8d = _0x2a8d89.map((_0x3861b1, _0x563a86) => ({
      ..._0x3861b1,
      category: _0x2ed5e4,
      updatedAt: _0x5ebc7f + _0x563a86
    }));
    const _0x1d92a2 = [];
    let _0x34af3a = false;
    try {
      for (let _0x5722c9 = 0; _0x5722c9 < _0x549b8d.length; _0x5722c9 += 1) {
        _0x1d92a2.push(_0x2a8d89[_0x5722c9]);
        await saveAssetToServer(_0x549b8d[_0x5722c9]);
      }
      _0x34af3a = true;
      await this._saveMaterialCategorySettings(_0x2ed16a, this.materialCategoryDisplayNames, _0x44904d);
      this.userCategories = _0x2ed16a;
      this.materialCategoryParents = _0x44904d;
      _0x549b8d.forEach(_0x3b9821 => this._upsertLocalAsset(_0x3b9821));
      if (this._categoryKey(this.activeTab) === this._categoryKey(_0x5b4c53)) {
        this.activeTab = DEFAULT_ASSET_CATEGORIES[0];
        this._openAssetId = null;
      }
      this._expandedMaterialCategories.delete(this._categoryKey(_0x5b4c53));
      if (this._categoryKey(this._materialCurrentFolderCategory) === this._categoryKey(_0x5b4c53)) {
        this._materialCurrentFolderCategory = _0xf43e0e || DEFAULT_ASSET_CATEGORIES[0];
      }
      this._syncTabsFromAssets();
      this._renderSidebarTabs();
      this.renderSidebarContent();
      window.showToast?.(assetManagerText("categoryDeleted"), "success");
      return true;
    } catch (_0x53dfa8) {
      const _0x2a6ef2 = [];
      for (const _0x4ec42e of _0x1d92a2.reverse()) {
        try {
          await saveAssetToServer(_0x4ec42e);
        } catch (_0x2078da) {
          _0x2a6ef2.push(_0x2078da);
        }
      }
      if (_0x34af3a) {
        try {
          await this._saveMaterialCategorySettings(_0x307571, this.materialCategoryDisplayNames, _0x5d2b61);
        } catch (_0x281a70) {
          _0x2a6ef2.push(_0x281a70);
        }
      }
      if (_0x2a6ef2.length) {
        console.error("回滚素材文件夹删除失败", _0x2a6ef2);
      }
      console.error(_0x53dfa8);
      window.showToast?.(assetManagerText("categoryDeleteFailed"), "error");
      return false;
    }
  }
  _setThumbContent(_0x3ab5d9, _0x2a532e, _0x267198) {
    if (!_0x3ab5d9) {
      return;
    }
    const _0x37918b = String(_0x2a532e || "");
    if (_0x37918b && !this._isNonImageMediaSrc(_0x37918b)) {
      const _0x4dbee6 = _0x3ab5d9.dataset.thumbSrc || "";
      if (_0x3ab5d9.dataset.thumbKind === "img" && _0x4dbee6 === _0x37918b && _0x3ab5d9.querySelector(":scope > img")) {
        return;
      }
      const _0x45c093 = document.createElement("img");
      _0x45c093.alt = assetManagerText("thumbnailAlt");
      _0x45c093.draggable = false;
      _0x45c093.decoding = "async";
      _0x45c093.loading = "eager";
      _0x45c093.className = "v2-asset-thumb-img";
      _0x45c093.addEventListener("error", () => {
        if (_0x3ab5d9.dataset.thumbSrc !== _0x37918b) {
          return;
        }
        _0x3ab5d9.dataset.thumbKind = "icon";
        _0x3ab5d9.dataset.thumbType = String(_0x267198 || "other");
        _0x3ab5d9.dataset.thumbSrc = "";
        _0x3ab5d9.innerHTML = _renderAssetIcon(_0x267198);
      }, {
        once: true
      });
      _0x3ab5d9.dataset.thumbKind = "img";
      _0x3ab5d9.dataset.thumbType = "";
      _0x3ab5d9.dataset.thumbSrc = _0x37918b;
      _0x3ab5d9.dataset.pendingSrc = "";
      _0x3ab5d9.replaceChildren(_0x45c093);
      _0x45c093.src = _0x37918b;
      this._ensureThumbDecoded(_0x37918b).catch(() => {});
      return;
    }
    const _0x1b18fa = String(_0x267198 || "other");
    if (_0x3ab5d9.dataset.thumbKind === "icon" && _0x3ab5d9.dataset.thumbType === _0x1b18fa) {
      return;
    }
    _0x3ab5d9.dataset.thumbKind = "icon";
    _0x3ab5d9.dataset.thumbType = _0x1b18fa;
    _0x3ab5d9.dataset.thumbSrc = "";
    _0x3ab5d9.dataset.pendingSrc = "";
    _0x3ab5d9.innerHTML = _renderAssetIcon(_0x1b18fa);
  }
  _createMaterialMenuButton(_0x423ba0, _0x3b7f4b) {
    const _0x4164ae = document.createElement("button");
    _0x4164ae.type = "button";
    _0x4164ae.className = "v2-material-more";
    _0x4164ae.dataset.uiAction = "material-menu-open";
    _0x4164ae.dataset.assetId = _0x3b7f4b;
    _0x4164ae.setAttribute("aria-label", assetManagerText("menu.open", {
      name: _0x423ba0.name || assetManagerText("unnamedAsset")
    }));
    _0x4164ae.setAttribute("aria-haspopup", "menu");
    _0x4164ae.innerHTML = "<svg viewBox=\"0 0 24 24\" aria-hidden=\"true\"><circle cx=\"5\" cy=\"12\" r=\"1.5\" fill=\"currentColor\"/><circle cx=\"12\" cy=\"12\" r=\"1.5\" fill=\"currentColor\"/><circle cx=\"19\" cy=\"12\" r=\"1.5\" fill=\"currentColor\"/></svg>";
    return _0x4164ae;
  }
  _createMaterialItemGroup(_0x25cd0c, _0x1029b3, _0x54f7a1) {
    const _0x35117b = document.createElement("div");
    _0x35117b.className = "v2-material-asset-children";
    _0x35117b.dataset.assetId = _0x1029b3;
    _0x35117b.setAttribute("role", "group");
    _0x54f7a1.forEach((_0xea2f47, _0x5c059f) => {
      const _0x3a5d82 = this._materialItemKey(_0x1029b3, _0x5c059f);
      const _0x4a8cbd = this._renamingMaterialItemKey === _0x3a5d82;
      const _0x36c876 = this._savingMaterialItemKey === _0x3a5d82;
      const _0x18513a = document.createElement("div");
      _0x18513a.className = "v2-material-item-row";
      _0x18513a.classList.toggle("is-renaming", _0x4a8cbd);
      _0x18513a.classList.toggle("is-saving", _0x36c876);
      _0x18513a.dataset.materialUse = "";
      _0x18513a.dataset.assetId = _0x1029b3;
      _0x18513a.dataset.itemIndex = String(_0x5c059f);
      _0x18513a.dataset.materialDrag = "";
      _0x18513a.dataset.materialPreview = "";
      _0x18513a.draggable = !_0x4a8cbd;
      _0x18513a.setAttribute("role", "treeitem");
      const _0x4a75b9 = _0xea2f47?.name || _0xea2f47?.nodeData?.name || assetManagerText("detail.childAssetName", {
        index: _0x5c059f + 1
      });
      _0x18513a.setAttribute("aria-label", assetManagerText("doubleClickMaterial", {
        name: _0x4a75b9
      }));
      const _0x72121e = document.createElement("span");
      _0x72121e.className = "v2-material-row-thumb is-child";
      this._setThumbContent(_0x72121e, _resolveMaterialItemThumbSrc(_0xea2f47), _0xea2f47?.type || "other");
      _0x18513a.appendChild(_0x72121e);
      if (_0x4a8cbd) {
        const _0x3e95cb = document.createElement("input");
        _0x3e95cb.type = "text";
        _0x3e95cb.className = "v2-material-item-name-input";
        _0x3e95cb.dataset.assetId = _0x1029b3;
        _0x3e95cb.dataset.itemIndex = String(_0x5c059f);
        _0x3e95cb.dataset.itemKey = _0x3a5d82;
        _0x3e95cb.value = _0x4a75b9;
        _0x3e95cb.disabled = _0x36c876;
        _0x3e95cb.setAttribute("aria-label", assetManagerText("renameMaterialAria", {
          name: _0x4a75b9
        }));
        if (_0x36c876) {
          _0x3e95cb.setAttribute("aria-busy", "true");
        }
        _0x18513a.appendChild(_0x3e95cb);
      } else {
        const _0x300431 = document.createElement("button");
        _0x300431.type = "button";
        _0x300431.className = "v2-material-item-name is-renameable";
        _0x300431.dataset.uiAction = "material-item-rename";
        _0x300431.dataset.assetId = _0x1029b3;
        _0x300431.dataset.itemIndex = String(_0x5c059f);
        _0x300431.textContent = _0x4a75b9;
        _0x300431.setAttribute("aria-label", assetManagerText("renameMaterialAria", {
          name: _0x4a75b9
        }));
        _0x18513a.appendChild(_0x300431);
      }
      _0x35117b.appendChild(_0x18513a);
    });
    return _0x35117b;
  }
  _toggleMaterialFolderDisclosure(_0x223d1a) {
    if (this._materialSearchQuery || this._materialFavoritesOnly) {
      return;
    }
    const _0x4bc123 = this._categoryKey(_0x223d1a?.dataset?.category);
    const _0x33f085 = _0x223d1a?.closest?.(".v2-material-folder");
    const _0x33c526 = _0x33f085?.querySelector?.(":scope > .v2-material-folder-content");
    if (!_0x4bc123 || !_0x33f085 || !_0x33c526) {
      return;
    }
    this._materialCurrentFolderCategory = this._findCategoryByName(_0x223d1a?.dataset?.category, this.tabs) || this.activeTab;
    const _0x16b685 = _0x33f085.getAttribute("aria-expanded") !== "true";
    if (_0x16b685) {
      this._expandedMaterialCategories.add(_0x4bc123);
    } else {
      this._expandedMaterialCategories.delete(_0x4bc123);
      this._hideMaterialPreview();
      this._closeMaterialMenu();
    }
    _0x33f085.setAttribute("aria-expanded", _0x16b685 ? "true" : "false");
    _0x223d1a.setAttribute("aria-expanded", _0x16b685 ? "true" : "false");
    _0x223d1a.setAttribute("aria-label", assetManagerText(_0x16b685 ? "collapseFolder" : "expandFolder", {
      name: this._formatCategoryLabel(_0x223d1a?.dataset?.category)
    }));
    _0x223d1a.querySelector(".v2-material-tree-chevron")?.classList.toggle("is-open", _0x16b685);
    _0x33c526.hidden = !_0x16b685;
  }
  _cancelPendingMaterialAssetRowToggle() {
    if (this._materialAssetRowClickTimer) {
      window.clearTimeout(this._materialAssetRowClickTimer);
    }
    this._materialAssetRowClickTimer = 0;
    this._materialAssetRowClickToggle = null;
  }
  _scheduleMaterialAssetRowToggle(_0x4391ac) {
    this._cancelPendingMaterialAssetRowToggle();
    if (!_0x4391ac || _0x4391ac.disabled) {
      return;
    }
    this._materialAssetRowClickToggle = _0x4391ac;
    this._materialAssetRowClickTimer = window.setTimeout(() => {
      const _0x525c43 = this._materialAssetRowClickToggle;
      this._materialAssetRowClickTimer = 0;
      this._materialAssetRowClickToggle = null;
      if (_0x525c43?.isConnected && !_0x525c43.disabled) {
        this._toggleMaterialAssetDisclosure(_0x525c43);
      }
    }, 260);
  }
  _toggleMaterialAssetDisclosure(_0x1b83f1) {
    if (this._materialSearchQuery || this._materialFavoritesOnly) {
      return;
    }
    const _0x39cfb6 = String(_0x1b83f1?.dataset?.assetId || "");
    const _0x525f01 = this._getMaterialAsset(_0x39cfb6);
    const _0x51665d = getMaterialAssetItems(_0x525f01);
    if (!_0x39cfb6 || !_0x525f01 || _0x51665d.length < 1) {
      return;
    }
    const _0x27894e = _0x1b83f1.closest(".v2-material-project-folder");
    const _0x178bd8 = _0x1b83f1.closest(".v2-material-project-row, .v2-material-asset-row");
    const _0x4ab67f = _0x27894e || _0x178bd8;
    if (!_0x178bd8 || !_0x4ab67f) {
      return;
    }
    const _0x4a7bb1 = _0x4ab67f.getAttribute("aria-expanded") !== "true";
    if (_0x4a7bb1) {
      this._expandedMaterialAssets.add(_0x39cfb6);
    } else {
      this._expandedMaterialAssets.delete(_0x39cfb6);
      this._hideMaterialPreview();
      this._closeMaterialMenu();
    }
    _0x4ab67f.setAttribute("aria-expanded", _0x4a7bb1 ? "true" : "false");
    _0x1b83f1.setAttribute("aria-expanded", _0x4a7bb1 ? "true" : "false");
    _0x1b83f1.setAttribute("aria-label", assetManagerText(_0x4a7bb1 ? "collapseMaterial" : "expandMaterial", {
      name: _0x525f01.name || assetManagerText("unnamedAsset")
    }));
    _0x1b83f1.querySelector(".v2-material-tree-chevron, svg")?.classList.toggle("is-open", _0x4a7bb1);
    let _0x3dbd90 = _0x27894e ? _0x27894e.querySelector(":scope > .v2-material-asset-children[data-asset-id=\"" + CSS.escape(_0x39cfb6) + "\"]") : _0x178bd8.nextElementSibling?.matches?.(".v2-material-asset-children[data-asset-id=\"" + CSS.escape(_0x39cfb6) + "\"]") ? _0x178bd8.nextElementSibling : null;
    if (_0x4a7bb1 && !_0x3dbd90) {
      _0x3dbd90 = this._createMaterialItemGroup(_0x525f01, _0x39cfb6, _0x51665d);
      if (_0x27894e) {
        _0x27894e.appendChild(_0x3dbd90);
      } else {
        _0x178bd8.insertAdjacentElement("afterend", _0x3dbd90);
      }
    }
    if (_0x3dbd90) {
      _0x3dbd90.hidden = !_0x4a7bb1;
    }
  }
  _renderReplacementStudioProjectFolder(_0xcff822, _0x4b5bc7, {
    forceExpanded = false
  } = {}) {
    const _0x2e5a2f = String(_0xcff822?.id || "");
    if (!_0x2e5a2f) {
      return;
    }
    const _0x1652aa = getMaterialAssetItems(_0xcff822);
    const _0x2d2391 = forceExpanded || this._expandedMaterialAssets.has(_0x2e5a2f);
    const _0x245656 = document.createElement("div");
    _0x245656.className = "v2-material-project-folder";
    _0x245656.dataset.assetId = _0x2e5a2f;
    _0x245656.setAttribute("role", "treeitem");
    _0x245656.setAttribute("aria-expanded", _0x2d2391 ? "true" : "false");
    if (this._newAssetPulseId === _0x2e5a2f) {
      _0x245656.classList.add("is-new");
    }
    const _0x130cff = document.createElement("div");
    _0x130cff.className = "v2-material-project-row";
    const _0x38d4fe = document.createElement("button");
    _0x38d4fe.type = "button";
    _0x38d4fe.className = "v2-material-project-toggle";
    _0x38d4fe.dataset.uiAction = "material-asset-toggle";
    _0x38d4fe.dataset.assetId = _0x2e5a2f;
    _0x38d4fe.setAttribute("aria-expanded", _0x2d2391 ? "true" : "false");
    _0x38d4fe.setAttribute("aria-label", assetManagerText(_0x2d2391 ? "collapseMaterial" : "expandMaterial", {
      name: _0xcff822.name || assetManagerText("unnamedAsset")
    }));
    const _0x56974a = document.createElement("span");
    _0x56974a.className = "v2-material-tree-chevron" + (_0x2d2391 ? " is-open" : "");
    _0x56974a.setAttribute("aria-hidden", "true");
    _0x56974a.innerHTML = MATERIAL_TREE_CHEVRON_ICON_SVG;
    const _0x2d6f2d = document.createElement("span");
    _0x2d6f2d.className = "v2-material-project-icon";
    _0x2d6f2d.setAttribute("aria-hidden", "true");
    _0x2d6f2d.innerHTML = MATERIAL_FOLDER_ICON_MARKUP;
    _0x38d4fe.append(_0x56974a, _0x2d6f2d);
    _0x130cff.appendChild(_0x38d4fe);
    if (this._renamingAssetId === _0x2e5a2f) {
      _0x130cff.classList.add("is-renaming");
      const _0x2672c7 = document.createElement("input");
      _0x2672c7.type = "text";
      _0x2672c7.className = "v2-material-name-input";
      _0x2672c7.dataset.assetId = _0x2e5a2f;
      _0x2672c7.value = String(_0xcff822.name || "");
      _0x2672c7.setAttribute("aria-label", assetManagerText("createPanel.assetName"));
      _0x130cff.appendChild(_0x2672c7);
    } else {
      const _0x289a0f = document.createElement("button");
      _0x289a0f.type = "button";
      _0x289a0f.className = "v2-material-project-name is-renameable";
      _0x289a0f.dataset.uiAction = "material-rename";
      _0x289a0f.dataset.assetId = _0x2e5a2f;
      _0x289a0f.textContent = _0xcff822.name || assetManagerText("unnamedAsset");
      _0x289a0f.setAttribute("aria-label", assetManagerText("renameMaterialAria", {
        name: _0xcff822.name || assetManagerText("unnamedAsset")
      }));
      if (isMaterialAssetFavorite(_0xcff822)) {
        const _0x48cdab = document.createElement("span");
        _0x48cdab.className = "v2-material-favorite-indicator";
        _0x48cdab.textContent = "★";
        _0x48cdab.setAttribute("aria-label", assetManagerText("favorites"));
        _0x289a0f.appendChild(_0x48cdab);
      }
      _0x130cff.appendChild(_0x289a0f);
    }
    const _0x2f7684 = document.createElement("span");
    _0x2f7684.className = "v2-material-project-count";
    _0x2f7684.textContent = String(_0x1652aa.length);
    _0x130cff.append(_0x2f7684, this._createMaterialMenuButton(_0xcff822, _0x2e5a2f));
    _0x245656.appendChild(_0x130cff);
    if (_0x2d2391) {
      _0x245656.appendChild(this._createMaterialItemGroup(_0xcff822, _0x2e5a2f, _0x1652aa));
    }
    _0x4b5bc7.appendChild(_0x245656);
  }
  renderSidebarContent() {
    this._materialContextMenuController.close();
    const _0xe5e126 = this.sidebarPanel?.querySelector("#asset-sidebar-content");
    const _0x3e3977 = _0xe5e126?.querySelector(".v2-material-library-tree");
    if (!_0xe5e126 || !_0x3e3977) {
      return;
    }
    const _0x1bb3f6 = _0xe5e126.scrollTop;
    const _0x243429 = this.sidebarPanel.querySelector("[data-material-search]");
    if (_0x243429 && _0x243429.value !== this._materialSearchQuery) {
      _0x243429.value = this._materialSearchQuery;
    }
    const _0x325d1b = this.sidebarPanel.querySelector("[data-ui-action='material-favorites-toggle']");
    _0x325d1b?.classList.toggle("is-active", this._materialFavoritesOnly);
    _0x325d1b?.setAttribute("aria-pressed", this._materialFavoritesOnly ? "true" : "false");
    const _0x5b4464 = this._getSortedAssets();
    const _0x44e899 = getMaterialLibraryGroups({
      assets: _0x5b4464,
      categories: this.tabs,
      query: this._materialSearchQuery,
      favoritesOnly: this._materialFavoritesOnly,
      categoryKey: _0x24b738 => this._categoryKey(_0x24b738)
    });
    const _0x1501ba = getMaterialFolderAssetCounts({
      groups: _0x44e899,
      parents: this.materialCategoryParents,
      categoryKey: _0x3b5c38 => this._categoryKey(_0x3b5c38)
    });
    const _0x1c7a82 = this._materialMenuState?.anchorEl;
    if (_0x1c7a82 && _0x3e3977.contains(_0x1c7a82)) {
      this._closeMaterialMenu();
    }
    if (this._materialPreviewRow && _0x3e3977.contains(this._materialPreviewRow)) {
      this._hideMaterialPreview();
    }
    _0x3e3977.replaceChildren();
    if (!_0x44e899.length) {
      const _0x4fec46 = document.createElement("div");
      _0x4fec46.className = "v2-material-library-empty";
      _0x4fec46.innerHTML = "<strong>" + _escapeHtml(this._materialFavoritesOnly ? assetManagerText("emptyFavorites") : this._materialSearchQuery ? assetManagerText("emptySearch") : assetManagerText("emptyLibrary")) + "</strong>";
      _0x3e3977.appendChild(_0x4fec46);
      _0xe5e126.scrollTop = 0;
      return;
    }
    for (const _0x2b1120 of _0x44e899) {
      const _0x34d560 = this._categoryKey(_0x2b1120.category);
      const _0xd6b571 = this._isUserCategory(_0x2b1120.category);
      const _0x289f15 = _0xd6b571 && this._renamingMaterialCategoryKey === _0x34d560;
      const _0x4f9c61 = _0x289f15 && this._savingMaterialCategoryKey === _0x34d560;
      const _0x14729a = _0xd6b571 && (this._pendingMaterialFolderDeleteKey === _0x34d560 || this._deletingMaterialFolderKey === _0x34d560);
      const _0xda28ef = _0xd6b571 && this._deletingMaterialFolderKey === _0x34d560;
      const _0xcfbade = Boolean(this._materialSearchQuery || this._materialFavoritesOnly);
      const _0x5dd2e6 = !_0xcfbade && !this._expandedMaterialCategories.has(_0x34d560);
      const {
        section: _0x5b2731,
        folderContent: _0x514a0f
      } = this._createMaterialFolderSection({
        category: _0x2b1120.category,
        count: _0x1501ba.get(this._categoryKey(_0x2b1120.category)) ?? _0x2b1120.assets.length,
        expanded: !_0x5dd2e6,
        canManageFolder: _0xd6b571,
        isRenamingFolder: _0x289f15,
        isSavingFolder: _0x4f9c61,
        isDeleteConfirming: _0x14729a,
        isDeletingFolder: _0xda28ef,
        isDeleteRequested: this._pendingMaterialFolderDeleteKey === _0x34d560,
        actionPrefix: "material-folder"
      });
      if (!_0x2b1120.assets.length) {
        const _0x5e682b = document.createElement("div");
        _0x5e682b.className = "v2-material-folder-empty";
        _0x5e682b.textContent = assetManagerText("emptyFolder");
        _0x514a0f.appendChild(_0x5e682b);
      }
      for (const _0x2d9e46 of _0x2b1120.assets) {
        if (this._categoryKey(_0x2b1120.category) === this._categoryKey(REPLACEMENT_STUDIO_CATEGORY)) {
          this._renderReplacementStudioProjectFolder(_0x2d9e46, _0x514a0f, {
            forceExpanded: _0xcfbade
          });
          continue;
        }
        const _0x194c6d = String(_0x2d9e46?.id || "");
        if (!_0x194c6d) {
          continue;
        }
        const _0x3d1c58 = getMaterialAssetItems(_0x2d9e46);
        const _0x4e93d2 = _0x3d1c58.length > 1;
        const _0x3d1393 = _0x4e93d2 && this._expandedMaterialAssets.has(_0x194c6d);
        const _0x5e38ce = document.createElement("div");
        _0x5e38ce.className = "v2-material-asset-row";
        _0x5e38ce.dataset.assetId = _0x194c6d;
        _0x5e38ce.dataset.materialPreview = "";
        _0x5e38ce.setAttribute("role", "treeitem");
        if (_0x4e93d2) {
          _0x5e38ce.setAttribute("aria-expanded", _0x3d1393 ? "true" : "false");
        }
        if (this._newAssetPulseId === _0x194c6d) {
          _0x5e38ce.classList.add("is-new");
        }
        const _0xd46118 = document.createElement("button");
        _0xd46118.type = "button";
        _0xd46118.className = "v2-material-asset-toggle";
        _0xd46118.dataset.uiAction = "material-asset-toggle";
        _0xd46118.dataset.assetId = _0x194c6d;
        _0xd46118.disabled = !_0x4e93d2;
        if (_0x4e93d2) {
          _0xd46118.setAttribute("aria-expanded", _0x3d1393 ? "true" : "false");
        }
        _0xd46118.setAttribute("aria-label", _0x4e93d2 ? assetManagerText(_0x3d1393 ? "collapseMaterial" : "expandMaterial", {
          name: _0x2d9e46.name || assetManagerText("unnamedAsset")
        }) : "");
        _0xd46118.innerHTML = _0x4e93d2 ? "<svg class=\"" + (_0x3d1393 ? "is-open" : "") + "\" viewBox=\"0 0 24 24\" fill=\"none\" aria-hidden=\"true\"><path d=\"m9 6 6 6-6 6\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/></svg>" : "";
        _0x5e38ce.appendChild(_0xd46118);
        const _0x3418a4 = document.createElement("div");
        _0x3418a4.className = "v2-material-asset-use";
        _0x3418a4.dataset.materialUse = "";
        _0x3418a4.dataset.assetId = _0x194c6d;
        _0x3418a4.dataset.materialDrag = "";
        _0x3418a4.draggable = this._renamingAssetId !== _0x194c6d;
        _0x3418a4.setAttribute("aria-label", assetManagerText("doubleClickMaterial", {
          name: _0x2d9e46.name || assetManagerText("unnamedAsset")
        }));
        const _0x3c1cee = document.createElement("span");
        _0x3c1cee.className = "v2-material-row-thumb";
        const _0x49bb39 = _0x3d1c58[0];
        const _0x3285c6 = _resolveMaterialItemThumbSrc(_0x49bb39) || _0x2d9e46.coverUrl;
        this._setThumbContent(_0x3c1cee, _0x3285c6, _0x49bb39?.type || _0x2d9e46.coverType || "other");
        _0x3418a4.appendChild(_0x3c1cee);
        if (this._renamingAssetId === _0x194c6d) {
          _0x5e38ce.classList.add("is-renaming");
          const _0xea5952 = document.createElement("input");
          _0xea5952.type = "text";
          _0xea5952.className = "v2-material-name-input";
          _0xea5952.dataset.assetId = _0x194c6d;
          _0xea5952.value = String(_0x2d9e46.name || "");
          _0xea5952.setAttribute("aria-label", assetManagerText("createPanel.assetName"));
          _0x3418a4.appendChild(_0xea5952);
          _0x5e38ce.appendChild(_0x3418a4);
        } else {
          const _0x296dd4 = document.createElement("button");
          _0x296dd4.type = "button";
          _0x296dd4.className = "v2-material-asset-name is-renameable";
          _0x296dd4.dataset.uiAction = "material-rename";
          _0x296dd4.dataset.assetId = _0x194c6d;
          _0x296dd4.textContent = _0x2d9e46.name || assetManagerText("unnamedAsset");
          _0x296dd4.setAttribute("aria-label", assetManagerText("renameMaterialAria", {
            name: _0x2d9e46.name || assetManagerText("unnamedAsset")
          }));
          _0x3418a4.appendChild(_0x296dd4);
          if (isMaterialAssetFavorite(_0x2d9e46)) {
            const _0x487de0 = document.createElement("span");
            _0x487de0.className = "v2-material-favorite-indicator";
            _0x487de0.textContent = "★";
            _0x487de0.setAttribute("aria-label", assetManagerText("favorites"));
            _0x3418a4.appendChild(_0x487de0);
          }
          _0x5e38ce.appendChild(_0x3418a4);
        }
        const _0x1e7f84 = this._createMaterialMenuButton(_0x2d9e46, _0x194c6d);
        _0x5e38ce.appendChild(_0x1e7f84);
        _0x514a0f.appendChild(_0x5e38ce);
        if (_0x3d1393) {
          _0x514a0f.appendChild(this._createMaterialItemGroup(_0x2d9e46, _0x194c6d, _0x3d1c58));
        }
      }
      _0x3e3977.appendChild(_0x5b2731);
    }
    this._nestMaterialFolderSections(_0x3e3977);
    _0xe5e126.scrollTop = _0x1bb3f6;
    if (this._newAssetPulseId) {
      const _0x29fd87 = this._newAssetPulseId;
      this._newAssetPulseId = "";
      window.setTimeout(() => {
        _0x3e3977.querySelector("[data-asset-id=\"" + CSS.escape(_0x29fd87) + "\"]")?.classList.remove("is-new");
      }, 650);
    }
    if (this._renamingAssetId) {
      window.requestAnimationFrame(() => {
        const _0x6b9279 = _0x3e3977.querySelector(".v2-material-name-input");
        _0x6b9279?.focus();
        _0x6b9279?.select?.();
      });
    } else if (this._renamingMaterialItemKey) {
      window.requestAnimationFrame(() => {
        const _0x3fbbfa = _0x3e3977.querySelector(".v2-material-item-name-input[data-item-key=\"" + CSS.escape(this._renamingMaterialItemKey) + "\"]");
        _0x3fbbfa?.focus();
        _0x3fbbfa?.select?.();
      });
    }
  }
  _renderLegacySidebarContent() {
    const _0x2a2734 = this.sidebarPanel?.querySelector("#asset-sidebar-content");
    if (!_0x2a2734) {
      return;
    }
    const _0x56d12d = this.sidebarPanel.querySelector("#asset-sidebar-title-text");
    const _0x66ed6b = this.sidebarPanel.querySelector(".v2-asset-back");
    this._renderSidebarTabs();
    const _0x1f4a72 = () => {
      let _0x27bf2a = _0x2a2734.querySelector(":scope > .v2-asset-view-list");
      if (!_0x27bf2a) {
        _0x27bf2a = document.createElement("div");
        _0x27bf2a.className = "v2-asset-view-list";
        _0x2a2734.appendChild(_0x27bf2a);
      }
      let _0x348d22 = _0x2a2734.querySelector(":scope > .v2-asset-view-detail");
      if (!_0x348d22) {
        _0x348d22 = document.createElement("div");
        _0x348d22.className = "v2-asset-view-detail";
        _0x2a2734.appendChild(_0x348d22);
      }
      _0x2a2734.querySelectorAll(":scope > .v2-asset-item, :scope > .v2-asset-empty").forEach(_0x23826e => _0x27bf2a.appendChild(_0x23826e));
      _0x2a2734.querySelectorAll(":scope > .v2-asset-detail-actions, :scope > .v2-asset-subgrid").forEach(_0x348c24 => _0x348d22.appendChild(_0x348c24));
      return {
        listView: _0x27bf2a,
        detailView: _0x348d22
      };
    };
    const {
      listView: _0x32c605,
      detailView: _0x3b0897
    } = _0x1f4a72();
    const _0x15007f = (_0x5ec0fd, _0xaa1d61, _0x16c726) => this._setThumbContent(_0x5ec0fd, _0xaa1d61, _0x16c726);
    const _0x4b42d1 = _0x2cec57 => {
      let _0x2f134d = _0x2cec57.querySelector(":scope > .v2-asset-cover-grid");
      if (!_0x2f134d) {
        _0x2f134d = document.createElement("div");
        _0x2f134d.className = "v2-asset-cover-grid";
        for (let _0x4851ae = 0; _0x4851ae < 4; _0x4851ae++) {
          const _0x4fec85 = document.createElement("div");
          _0x4fec85.className = "v2-asset-cover-cell";
          _0x2f134d.appendChild(_0x4fec85);
        }
        _0x2cec57.replaceChildren(_0x2f134d);
      } else {
        const _0x4c371b = _0x2f134d.querySelectorAll(":scope > .v2-asset-cover-cell");
        for (let _0x1f807e = _0x4c371b.length; _0x1f807e < 4; _0x1f807e++) {
          const _0x2662f4 = document.createElement("div");
          _0x2662f4.className = "v2-asset-cover-cell";
          _0x2f134d.appendChild(_0x2662f4);
        }
      }
      return _0x2f134d;
    };
    const _0x2824d4 = (_0x221b0b, _0x3771c8) => {
      let _0x1379c2 = _0x221b0b.querySelector(":scope > .v2-asset-item-load");
      let _0x12b6ab = _0x221b0b.querySelector(":scope > .v2-asset-item-delete");
      let _0x5f3845 = _0x221b0b.querySelector(":scope > .v2-asset-item-delete-confirm");
      let _0x25eae9 = _0x221b0b.querySelector(":scope > .v2-asset-item-cover");
      let _0x5a8188 = _0x221b0b.querySelector(":scope > .v2-asset-item-name");
      if (!_0x1379c2) {
        _0x1379c2 = document.createElement("button");
        _0x1379c2.type = "button";
        _0x1379c2.className = "v2-asset-item-load";
        _0x1379c2.dataset.uiAction = "asset-add-all";
        _0x1379c2.setAttribute("aria-label", assetManagerText("loadToCanvas"));
        _0x1379c2.innerHTML = "<svg viewBox=\"0 0 24 24\" aria-hidden=\"true\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M16.5 5.5a7.5 7.5 0 1 0-1 13.5\"/><path d=\"M12 14h6v6\"/><path d=\"m18 14-6 6\"/></svg>";
        _0x221b0b.appendChild(_0x1379c2);
      }
      if (!_0x12b6ab) {
        _0x12b6ab = document.createElement("button");
        _0x12b6ab.type = "button";
        _0x12b6ab.className = "v2-asset-item-delete";
        _0x12b6ab.dataset.uiAction = "asset-delete-open";
        _0x12b6ab.setAttribute("aria-label", assetManagerText("deleteAsset"));
        _0x12b6ab.innerHTML = "<svg viewBox=\"0 0 24 24\" aria-hidden=\"true\"><path fill=\"currentColor\" d=\"M9 3h6l1 2h5v2H3V5h5l1-2zm1 6h2v10h-2V9zm4 0h2v10h-2V9zM7 9h2v10H7V9z\"/></svg>";
        _0x221b0b.appendChild(_0x12b6ab);
      }
      if (!_0x5f3845) {
        _0x5f3845 = document.createElement("div");
        _0x5f3845.className = "v2-asset-item-delete-confirm";
        _0x5f3845.hidden = true;
        _0x5f3845.addEventListener("click", _0x5344b8 => {
          if (_0x5344b8.target !== _0x5f3845) {
            return;
          }
          _0x5344b8.stopPropagation();
          this._pendingDeleteAssetId = "";
          this.renderSidebarContent();
        });
        const _0x1028c7 = document.createElement("button");
        _0x1028c7.type = "button";
        _0x1028c7.className = "v2-asset-item-delete-confirm-btn v2-asset-item-delete-confirm-btn--danger";
        _0x1028c7.dataset.uiAction = "asset-delete-confirm";
        _0x1028c7.textContent = "✔";
        _0x1028c7.setAttribute("aria-label", assetManagerText("confirm"));
        const _0x57a838 = document.createElement("button");
        _0x57a838.type = "button";
        _0x57a838.className = "v2-asset-item-delete-confirm-btn v2-asset-item-delete-confirm-btn--neutral";
        _0x57a838.dataset.uiAction = "asset-delete-cancel";
        _0x57a838.textContent = "×";
        _0x57a838.setAttribute("aria-label", assetManagerText("cancel"));
        _0x5f3845.appendChild(_0x1028c7);
        _0x5f3845.appendChild(_0x57a838);
        _0x221b0b.appendChild(_0x5f3845);
      }
      const _0x35fb67 = String(_0x3771c8?.id || "");
      _0x1379c2.dataset.assetId = _0x35fb67;
      _0x1379c2.disabled = !Array.isArray(_0x3771c8?.nodes) || _0x3771c8.nodes.length === 0;
      _0x12b6ab.dataset.assetId = _0x35fb67;
      _0x5f3845.querySelectorAll(":scope > button").forEach(_0xdd5789 => {
        _0xdd5789.dataset.assetId = _0x35fb67;
      });
      const _0x3316a9 = this._pendingDeleteAssetId === _0x35fb67;
      _0x12b6ab.hidden = _0x3316a9;
      _0x5f3845.hidden = !_0x3316a9;
      if (!_0x25eae9) {
        _0x25eae9 = document.createElement("div");
        _0x25eae9.className = "v2-asset-item-cover";
        _0x221b0b.appendChild(_0x25eae9);
      }
      if (!_0x5a8188) {
        _0x5a8188 = document.createElement("div");
        _0x5a8188.className = "v2-asset-item-name";
        _0x5a8188.addEventListener("click", _0x34f1d2 => {
          _0x34f1d2.stopPropagation();
          const _0x763801 = _0x34f1d2.currentTarget?.closest?.(".v2-asset-item");
          const _0x2b0768 = _0x763801?.dataset?.id || "";
          this._beginRenameAsset(_0x2b0768);
        });
        _0x221b0b.appendChild(_0x5a8188);
      }
      const _0x446929 = String(_0x3771c8?.name || "");
      if (this._renamingAssetId === _0x35fb67) {
        _0x5a8188.classList.add("is-editing");
        let _0x208b97 = _0x5a8188.querySelector(":scope > input.v2-asset-item-name-input");
        if (!_0x208b97) {
          _0x208b97 = document.createElement("input");
          _0x208b97.type = "text";
          _0x208b97.className = "v2-asset-item-name-input";
          _0x208b97.addEventListener("click", _0x5c59cf => _0x5c59cf.stopPropagation());
          _0x208b97.addEventListener("keydown", _0x5bde2d => {
            if (_0x5bde2d.key === "Enter") {
              _0x5bde2d.preventDefault();
              _0x5bde2d.stopPropagation();
              _0x208b97.dataset.submitted = "1";
              this._commitRenameAsset(_0x35fb67, _0x208b97.value);
              return;
            }
            if (_0x5bde2d.key === "Escape") {
              _0x5bde2d.preventDefault();
              _0x5bde2d.stopPropagation();
              this._cancelRenameAsset();
            }
          });
          _0x208b97.addEventListener("blur", () => {
            if (_0x208b97.dataset.submitted === "1") {
              return;
            }
            this._commitRenameAsset(_0x35fb67, _0x208b97.value);
          });
          _0x5a8188.replaceChildren(_0x208b97);
        }
        if (_0x208b97.value !== _0x446929) {
          _0x208b97.value = _0x446929;
        }
        if (_0x208b97.getAttribute("aria-label") !== assetManagerText("createPanel.assetName")) {
          _0x208b97.setAttribute("aria-label", assetManagerText("createPanel.assetName"));
        }
        window.requestAnimationFrame(() => {
          if (!_0x208b97.isConnected) {
            return;
          }
          try {
            _0x208b97.focus();
            _0x208b97.select?.();
          } catch (_0x3e5278) {}
        });
      } else {
        if (_0x5a8188.classList.contains("is-editing")) {
          _0x5a8188.classList.remove("is-editing");
        }
        const _0x214b1e = _0x5a8188.querySelector(":scope > input.v2-asset-item-name-input");
        if (_0x214b1e) {
          _0x5a8188.replaceChildren();
        }
        if (_0x5a8188.textContent !== _0x446929) {
          _0x5a8188.textContent = _0x446929;
        }
        if (_0x5a8188.getAttribute("title") !== _0x446929) {
          _0x5a8188.setAttribute("title", _0x446929);
        }
      }
      const _0x1ddda0 = Array.isArray(_0x3771c8?.items) ? _0x3771c8.items : Array.isArray(_0x3771c8?.nodes) ? _0x3771c8.nodes.map(_0x1ecccb => _buildAssetItem(_0x1ecccb)) : [];
      if (_0x1ddda0.length > 0) {
        const _0x25da6e = _0x4b42d1(_0x25eae9);
        const _0x2ff912 = _0x25da6e.querySelectorAll(":scope > .v2-asset-cover-cell");
        for (let _0x2705d8 = 0; _0x2705d8 < 4; _0x2705d8++) {
          const _0x94b584 = _0x1ddda0[_0x2705d8];
          if (!_0x94b584) {
            const _0x5978d9 = _0x2ff912[_0x2705d8];
            if (_0x5978d9) {
              _0x5978d9.dataset.thumbKind = "empty";
              _0x5978d9.dataset.thumbType = "";
              _0x5978d9.dataset.thumbSrc = "";
              _0x5978d9.dataset.pendingSrc = "";
              _0x5978d9.replaceChildren();
            }
            continue;
          }
          _0x15007f(_0x2ff912[_0x2705d8], _0x94b584.thumbSrc, _0x94b584.type);
        }
        return;
      }
      if (_0x3771c8?.coverUrl) {
        _0x15007f(_0x25eae9, _0x3771c8.coverUrl, _0x3771c8.coverType);
      } else {
        _0x15007f(_0x25eae9, "", _0x3771c8?.coverType || "other");
      }
    };
    const _0x47f6ff = this._getSortedAssets().filter(_0x250c5d => this._categoryKey(_0x250c5d?.category) === this._categoryKey(this.activeTab));
    if (this._openAssetId) {
      const _0x1577ef = _0x47f6ff.find(_0x507041 => _0x507041.id === this._openAssetId);
      if (!_0x1577ef) {
        this._openAssetId = null;
        this.renderSidebarContent();
        return;
      }
      if (_0x56d12d) {
        _0x56d12d.textContent = _0x1577ef.name || assetManagerText("title");
      }
      if (_0x66ed6b) {
        _0x66ed6b.classList.add("show");
      }
      this.sidebarPanel.classList.add("is-detail-view");
      _0x32c605.style.display = "none";
      _0x3b0897.style.display = "";
      const _0x1c83fd = Array.isArray(_0x1577ef?.items) ? _0x1577ef.items : Array.isArray(_0x1577ef?.nodes) ? _0x1577ef.nodes.map(_0x2aefa9 => _buildAssetItem(_0x2aefa9)) : [];
      _0x3b0897.replaceChildren();
      const _0x2c2cb7 = document.createElement("div");
      _0x2c2cb7.className = "v2-asset-detail";
      const _0x268555 = document.createElement("div");
      _0x268555.className = "v2-asset-detail-cover";
      _0x2c2cb7.appendChild(_0x268555);
      if (_0x1c83fd.length > 0) {
        const _0xdec693 = _0x4b42d1(_0x268555);
        const _0x3798f6 = _0xdec693.querySelectorAll(":scope > .v2-asset-cover-cell");
        for (let _0x1bfeb6 = 0; _0x1bfeb6 < 4; _0x1bfeb6++) {
          const _0x243e8a = _0x1c83fd[_0x1bfeb6];
          if (_0x243e8a) {
            _0x15007f(_0x3798f6[_0x1bfeb6], _0x243e8a.thumbSrc, _0x243e8a.type);
          } else if (_0x3798f6[_0x1bfeb6]) {
            _0x3798f6[_0x1bfeb6].replaceChildren();
          }
        }
      } else {
        _0x15007f(_0x268555, _0x1577ef?.coverUrl, _0x1577ef?.coverType || "other");
      }
      const _0x409bf3 = document.createElement("div");
      _0x409bf3.className = "v2-asset-detail-title";
      _0x409bf3.textContent = _0x1577ef.name || assetManagerText("unnamedAsset");
      _0x2c2cb7.appendChild(_0x409bf3);
      const _0x1f424c = document.createElement("div");
      _0x1f424c.className = "v2-asset-detail-meta";
      const _0x12d1f9 = Array.isArray(_0x1577ef?.nodes) ? _0x1577ef.nodes.length : _0x1c83fd.length;
      _0x1f424c.textContent = assetManagerText("detail.meta", {
        category: _0x1577ef.category ? this._formatCategoryLabel(_0x1577ef.category) : assetManagerText("uncategorized"),
        count: _0x12d1f9,
        time: _formatAssetDateTime(_0x1577ef.updatedAt || _0x1577ef.createdAt)
      });
      _0x2c2cb7.appendChild(_0x1f424c);
      const _0x39a0fa = document.createElement("section");
      _0x39a0fa.className = "v2-asset-detail-section";
      const _0x244170 = document.createElement("div");
      _0x244170.className = "v2-asset-detail-section-title";
      _0x244170.textContent = assetManagerText("detail.content");
      _0x39a0fa.appendChild(_0x244170);
      const _0x46ec8f = document.createElement("div");
      _0x46ec8f.className = "v2-asset-subgrid";
      if (_0x1c83fd.length === 0) {
        const _0x4d3eb7 = document.createElement("div");
        _0x4d3eb7.className = "v2-asset-empty";
        _0x4d3eb7.textContent = assetManagerText("detail.empty");
        _0x46ec8f.appendChild(_0x4d3eb7);
      } else {
        for (let _0x31a009 = 0; _0x31a009 < _0x1c83fd.length; _0x31a009++) {
          const _0x232f3f = _0x1c83fd[_0x31a009];
          const _0x31c223 = document.createElement("button");
          _0x31c223.type = "button";
          _0x31c223.className = "v2-asset-subitem";
          _0x31c223.dataset.assetId = _0x1577ef.id;
          _0x31c223.dataset.idx = String(_0x31a009);
          const _0x571a58 = document.createElement("div");
          _0x571a58.className = "v2-asset-subitem-thumb";
          _0x15007f(_0x571a58, _0x232f3f?.thumbSrc, _0x232f3f?.type);
          const _0x5e1ea5 = document.createElement("div");
          _0x5e1ea5.className = "v2-asset-subitem-info";
          const _0x94e872 = document.createElement("span");
          _0x94e872.className = "v2-asset-subitem-type";
          _0x94e872.textContent = _formatAssetTypeLabel(_0x232f3f?.type);
          const _0x3daa2e = document.createElement("div");
          _0x3daa2e.className = "v2-asset-subitem-name";
          const _0x118560 = String(_0x232f3f?.name || _0x232f3f?.type || assetManagerText("detail.childAssetName", {
            index: _0x31a009 + 1
          }));
          _0x3daa2e.textContent = _0x118560;
          _0x5e1ea5.append(_0x94e872, _0x3daa2e);
          _0x31c223.append(_0x571a58, _0x5e1ea5);
          _0x46ec8f.appendChild(_0x31c223);
        }
      }
      _0x39a0fa.appendChild(_0x46ec8f);
      _0x2c2cb7.appendChild(_0x39a0fa);
      const _0x96124 = document.createElement("div");
      _0x96124.className = "v2-asset-detail-actions";
      const _0x34bda6 = document.createElement("button");
      _0x34bda6.type = "button";
      _0x34bda6.className = "v2-asset-detail-btn";
      _0x34bda6.dataset.uiAction = "asset-add-all";
      _0x34bda6.dataset.assetId = _0x1577ef.id;
      _0x34bda6.textContent = assetManagerText("loadToCanvas");
      _0x96124.appendChild(_0x34bda6);
      _0x2c2cb7.appendChild(_0x96124);
      _0x3b0897.appendChild(_0x2c2cb7);
      return;
    }
    if (_0x56d12d) {
      _0x56d12d.textContent = assetManagerText("title");
    }
    if (_0x66ed6b) {
      _0x66ed6b.classList.remove("show");
    }
    this.sidebarPanel.classList.remove("is-detail-view");
    _0x32c605.style.display = "";
    _0x3b0897.style.display = "none";
    _0x3b0897.replaceChildren();
    let _0x3a1530 = _0x32c605.querySelector(":scope > .v2-asset-empty");
    if (!_0x3a1530) {
      _0x3a1530 = document.createElement("div");
      _0x3a1530.className = "v2-asset-empty";
      _0x32c605.appendChild(_0x3a1530);
    }
    const _0x28bca8 = this._getSortedAssets();
    let _0x10aa12 = 0;
    let _0x170258 = 0;
    for (const _0x13bf62 of _0x28bca8) {
      const _0x5734fb = String(_0x13bf62?.id || "");
      if (!_0x5734fb) {
        continue;
      }
      let _0x53b293 = this._assetCardPool?.get?.(_0x5734fb);
      if (!_0x53b293) {
        _0x53b293 = document.createElement("div");
        _0x53b293.className = "v2-asset-item";
        _0x53b293.dataset.id = _0x5734fb;
        if (!this._assetCardPool) {
          this._assetCardPool = new Map();
        }
        this._assetCardPool.set(_0x5734fb, _0x53b293);
      }
      if (_0x53b293.parentElement !== _0x32c605) {
        _0x32c605.appendChild(_0x53b293);
      }
      const _0x4fad47 = this._categoryKey(_0x13bf62?.category) === this._categoryKey(this.activeTab);
      _0x53b293.style.display = _0x4fad47 ? "" : "none";
      if (_0x4fad47) {
        _0x53b293.style.order = String(_0x170258++);
        _0x2824d4(_0x53b293, _0x13bf62);
        if (this._newAssetPulseId && this._newAssetPulseId === _0x5734fb) {
          this._newAssetPulseId = "";
          window.requestAnimationFrame(() => {
            if (!_0x53b293.isConnected) {
              return;
            }
            _0x53b293.classList.add("is-new");
            const _0x19b94d = window.setTimeout(() => {
              if (_0x53b293.isConnected) {
                _0x53b293.classList.remove("is-new");
              }
            }, 650);
            _0x53b293.dataset._pulseTimer = String(_0x19b94d);
          });
        }
        _0x10aa12 += 1;
      }
    }
    _0x3a1530.style.display = _0x10aa12 === 0 ? "" : "none";
    if (_0x10aa12 === 0) {
      _0x3a1530.textContent = assetManagerText("emptyCategory", {
        category: this._formatCategoryLabel(this.activeTab)
      });
      _0x3a1530.style.order = "0";
    }
  }
  _restoreAssetSubItem(_0x902317, _0x5ad1a7, _0x105c1d = null) {
    const _0x1ccf01 = (this.assets || []).find(_0x33b5e0 => _0x33b5e0.id === _0x902317);
    if (!_0x1ccf01 || !Array.isArray(_0x1ccf01.nodes)) {
      return;
    }
    const _0x10b843 = prepareAssetNodeForRestore(_0x1ccf01, _0x1ccf01.nodes[_0x5ad1a7]);
    if (!_0x10b843) {
      return;
    }
    const _0x10e51b = Number.isFinite(_0x105c1d?.x) && Number.isFinite(_0x105c1d?.y);
    const _0x275562 = _0x10e51b ? _0x105c1d : this._getCanvasCenterWorld();
    const _0x5098c1 = Number(_0x10b843.width ?? _0x10b843.w) || 240;
    const _0x3d7ff9 = Number(_0x10b843.height ?? _0x10b843.h) || 240;
    const _0x1c375b = _0x275562.x - _0x5098c1 / 2;
    const _0x554602 = _0x275562.y - _0x3d7ff9 / 2;
    const _0x2de12a = _0x10e51b ? {
      x: _0x1c375b,
      y: _0x554602
    } : findAvailablePosition(a885_0x5af3bf.getState().nodes, _0x1c375b, _0x554602, _0x5098c1, _0x3d7ff9, 24, "right");
    a885_0x5af3bf.batch(() => {
      const _0x50581c = JSON.parse(JSON.stringify(_0x10b843));
      _0x50581c.id = generateId(_0x50581c.type);
      _0x50581c.x = _0x2de12a.x;
      _0x50581c.y = _0x2de12a.y;
      a885_0x5af3bf.addNode(_0x50581c);
      a885_0x5af3bf.setSelectedNodes([_0x50581c.id]);
    });
    window.showToast?.(assetManagerText("toasts.subAssetAdded"), "success");
  }
  restoreAssetToCanvas(_0x58385, _0x998e2e = null) {
    const _0xb5a4c8 = (this.assets || []).find(_0x5d9c40 => _0x5d9c40.id === _0x58385);
    if (!_0xb5a4c8 || !_0xb5a4c8.nodes) {
      return;
    }
    const _0xba42db = prepareAssetNodesForRestore(_0xb5a4c8, 24);
    const _0x294977 = Number.isFinite(_0x998e2e?.x) && Number.isFinite(_0x998e2e?.y);
    const _0x3d788f = _0x294977 ? _0x998e2e : this._getCanvasCenterWorld();
    const _0x4dbe26 = this._calcNodesBBox(_0xba42db);
    const _0x57af58 = _0x3d788f.x - _0x4dbe26.cx;
    const _0x17ca39 = _0x3d788f.y - _0x4dbe26.cy;
    const _0x6e49b = _0x4dbe26.minX + _0x57af58;
    const _0x3ce8e8 = _0x4dbe26.minY + _0x17ca39;
    const _0x3eda1a = _0x294977 ? {
      x: _0x6e49b,
      y: _0x3ce8e8
    } : findAvailablePosition(a885_0x5af3bf.getState().nodes, _0x6e49b, _0x3ce8e8, Math.max(1, _0x4dbe26.w), Math.max(1, _0x4dbe26.h), 24, "right");
    const _0x5b4708 = _0x57af58 + (_0x3eda1a.x - _0x6e49b);
    const _0x5f850d = _0x17ca39 + (_0x3eda1a.y - _0x3ce8e8);
    a885_0x5af3bf.batch(() => {
      const _0x100b66 = {};
      _0xba42db.forEach(_0x25067c => {
        const _0x55958c = JSON.parse(JSON.stringify(_0x25067c));
        const _0x14dbdd = _0x55958c.id;
        const _0x3ec0e2 = generateId(_0x55958c.type);
        _0x100b66[_0x14dbdd] = _0x3ec0e2;
        _0x55958c.id = _0x3ec0e2;
        _0x55958c.x = (Number(_0x55958c.x) || 0) + _0x5b4708;
        _0x55958c.y = (Number(_0x55958c.y) || 0) + _0x5f850d;
        a885_0x5af3bf.addNode(_0x55958c);
      });
      if (_0xb5a4c8.edges) {
        _0xb5a4c8.edges.forEach(_0x4b7345 => {
          const _0x211a2b = JSON.parse(JSON.stringify(_0x4b7345));
          _0x211a2b.id = generateId("edge");
          if (_0x100b66[_0x211a2b.sourceId]) {
            _0x211a2b.sourceId = _0x100b66[_0x211a2b.sourceId];
          }
          if (_0x100b66[_0x211a2b.targetId]) {
            _0x211a2b.targetId = _0x100b66[_0x211a2b.targetId];
          }
          a885_0x5af3bf.addEdge(_0x211a2b);
        });
      }
      a885_0x5af3bf.setSelectedNodes(Object.values(_0x100b66));
    });
    window.showToast?.(assetManagerText("toasts.assetAdded"), "success");
  }
}
export const assetManager = new AssetManager();