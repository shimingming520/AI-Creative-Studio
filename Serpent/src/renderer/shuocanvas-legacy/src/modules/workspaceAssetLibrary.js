import { getAssetMentionCandidates, getAssetMentionLibrarySettings } from "./assetMentionRegistry.js";
import { DEFAULT_MATERIAL_LIBRARY_CATEGORIES, getMaterialFolderAssetCounts, getMaterialLibraryGroups, normalizeMaterialFolderParents } from "./materialLibraryPolicy.js";
const MEDIA_LABELS = Object.freeze({
  image: "图片",
  video: "视频",
  audio: "音频",
  text: "文本"
});
function normalizeText(_0x146490) {
  return String(_0x146490 ?? "").trim();
}
function normalizeCategoryKey(_0x1d414e) {
  return normalizeText(_0x1d414e).toLocaleLowerCase();
}
function escapeHtml(_0x1c6c52) {
  return String(_0x1c6c52 ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll("\"", "&quot;").replaceAll("'", "&#39;");
}
function resolveAssetCategory(_0x49252f = {}) {
  return normalizeText(_0x49252f.category || _0x49252f.assetCategory) || "其他";
}
function formatCategoryLabel(_0x51c0e5) {
  if (normalizeText(_0x51c0e5) === "Others") {
    return "其他";
  } else {
    return normalizeText(_0x51c0e5);
  }
}
function createCategoryValueMap(_0x4fc5de = {}) {
  return new Map(Object.entries(_0x4fc5de && typeof _0x4fc5de === "object" ? _0x4fc5de : {}).map(([_0x1d6487, _0x2a7a12]) => [normalizeCategoryKey(_0x1d6487), normalizeText(_0x2a7a12)]).filter(([_0x2c08ef, _0x4112c8]) => _0x2c08ef && _0x4112c8));
}
function activateWorkspaceAssetLibraryImages(_0xd8d714) {
  _0xd8d714?.querySelectorAll?.(":scope > .workspace-asset-library-grid [data-workspace-asset-library-image]")?.forEach?.(_0x3d9ca5 => {
    _0x3d9ca5.loading = "eager";
  });
}
export function handleWorkspaceAssetLibraryImageError(_0x3650d5) {
  const _0x5a8ac2 = _0x3650d5?.target;
  const _0x3045b1 = normalizeText(_0x5a8ac2?.getAttribute?.("data-workspace-asset-library-fallback-src"));
  if (!_0x3045b1) {
    return false;
  }
  _0x5a8ac2.removeAttribute?.("data-workspace-asset-library-fallback-src");
  if (normalizeText(_0x5a8ac2.getAttribute?.("src")) === _0x3045b1) {
    return false;
  }
  _0x5a8ac2.loading = "eager";
  _0x5a8ac2.setAttribute?.("src", _0x3045b1);
  return true;
}
export function getWorkspaceAssetLibraryMediaLabel(_0xf3ebfb) {
  return MEDIA_LABELS[normalizeText(_0xf3ebfb).toLocaleLowerCase()] || "素材";
}
export function buildWorkspaceAssetLibraryItems({
  allowedTypes = ["image"],
  limit = 0
} = {}) {
  const _0x10cf03 = getAssetMentionCandidates({
    allowedTypes: allowedTypes
  });
  const _0x2373a0 = Number(limit) > 0 ? _0x10cf03.slice(0, Math.trunc(Number(limit))) : _0x10cf03;
  return _0x2373a0.map(_0x27c8a1 => {
    const _0x128097 = normalizeText(_0x27c8a1.thumbUrl);
    const _0x48550e = normalizeText(_0x27c8a1.url) || _0x128097;
    const _0xf311bc = normalizeText(_0x27c8a1.category || _0x27c8a1.assetCategory) || "其他";
    return {
      id: "library-" + _0x27c8a1.assetId + "-" + _0x27c8a1.itemIndex,
      sourceAssetId: _0x27c8a1.assetId,
      sourceItemIndex: _0x27c8a1.itemIndex,
      kind: "library",
      mediaKind: _0x27c8a1.type,
      category: _0xf311bc,
      assetCategory: _0xf311bc,
      name: _0x27c8a1.name || _0x27c8a1.assetName || "素材",
      assetName: _0x27c8a1.assetName || "未分组素材",
      role: getWorkspaceAssetLibraryMediaLabel(_0x27c8a1.type) + "素材",
      occurrences: "来自总素材",
      description: _0x27c8a1.assetName ? "来自素材组「" + _0x27c8a1.assetName + "」" : "来自总素材",
      prompt: "",
      imageUrl: _0x48550e,
      thumbnailUrl: _0x128097,
      sourceUrl: _0x48550e,
      isLibraryAsset: true
    };
  });
}
export function buildWorkspaceAssetLibraryHierarchy({
  assets = [],
  categories = null,
  displayNames = null,
  parents = null
} = {}) {
  const _0x1d14bb = getAssetMentionLibrarySettings();
  const _0x3d7c17 = Array.isArray(categories) ? categories : _0x1d14bb.categories;
  const _0x5e6792 = displayNames && typeof displayNames === "object" ? displayNames : _0x1d14bb.displayNames;
  const _0x10f543 = parents && typeof parents === "object" ? parents : _0x1d14bb.parents;
  const _0x39d9a6 = (Array.isArray(assets) ? assets : []).map(_0x21edad => ({
    ..._0x21edad,
    category: resolveAssetCategory(_0x21edad)
  }));
  const _0x3ed00b = getMaterialLibraryGroups({
    assets: _0x39d9a6,
    categories: _0x3d7c17.length ? _0x3d7c17 : DEFAULT_MATERIAL_LIBRARY_CATEGORIES,
    categoryKey: normalizeCategoryKey
  });
  const _0x50c796 = normalizeMaterialFolderParents({
    parents: _0x10f543,
    userCategories: Object.keys(_0x10f543 || {}),
    allCategories: _0x3ed00b.map(_0x45680d => _0x45680d.category),
    categoryKey: normalizeCategoryKey
  });
  const _0x57af0f = createCategoryValueMap(_0x50c796);
  const _0x53eb40 = createCategoryValueMap(_0x5e6792);
  const _0x1f026e = getMaterialFolderAssetCounts({
    groups: _0x3ed00b,
    parents: _0x50c796,
    categoryKey: normalizeCategoryKey
  });
  const _0x2beeaa = _0x3ed00b.map(_0x2500f7 => {
    const _0x599e6c = resolveAssetCategory(_0x2500f7);
    const _0x3d70ff = normalizeCategoryKey(_0x599e6c);
    return {
      category: _0x599e6c,
      label: _0x53eb40.get(_0x3d70ff) || formatCategoryLabel(_0x599e6c),
      count: _0x1f026e.get(_0x3d70ff) ?? _0x2500f7.assets.length,
      assets: _0x2500f7.assets,
      children: []
    };
  });
  const _0x501e27 = new Map(_0x2beeaa.map(_0x26c3b3 => [normalizeCategoryKey(_0x26c3b3.category), _0x26c3b3]));
  const _0x1284b2 = [];
  _0x2beeaa.forEach(_0x3e44cb => {
    const _0x4d6746 = _0x501e27.get(normalizeCategoryKey(_0x57af0f.get(normalizeCategoryKey(_0x3e44cb.category))));
    if (_0x4d6746 && _0x4d6746 !== _0x3e44cb) {
      _0x4d6746.children.push(_0x3e44cb);
    } else {
      _0x1284b2.push(_0x3e44cb);
    }
  });
  const _0x47c4ab = _0x3917f5 => {
    _0x3917f5.children = _0x3917f5.children.filter(_0x47c4ab);
    return _0x3917f5.assets.length > 0 || _0x3917f5.children.length > 0;
  };
  return _0x1284b2.filter(_0x47c4ab);
}
export function renderWorkspaceAssetLibraryGroups({
  assets = [],
  expandedCategories = [],
  renderAsset = () => ""
} = {}) {
  const _0x25d2c6 = new Set((Array.isArray(expandedCategories) ? expandedCategories : []).map(normalizeCategoryKey).filter(Boolean));
  const _0x4c5c75 = buildWorkspaceAssetLibraryHierarchy({
    assets: assets
  });
  if (!_0x4c5c75.length) {
    return "";
  }
  const _0xa90594 = (_0x56afee, _0xd44243 = 0) => {
    const _0x1dab11 = _0x56afee.category;
    const _0x1faff8 = escapeHtml(_0x1dab11);
    const _0x382bf = _0x25d2c6.has(normalizeCategoryKey(_0x1dab11));
    const _0x1c3898 = _0x56afee.children.map(_0x21fdc2 => _0xa90594(_0x21fdc2, _0xd44243 + 1)).join("");
    const _0x453fc2 = _0x56afee.assets.length ? "<div class=\"story-asset-grid workspace-asset-library-grid\">" + _0x56afee.assets.map(renderAsset).join("") + "</div>" : "";
    return "<section class=\"v2-material-folder workspace-asset-library-group" + (_0xd44243 > 0 ? " is-nested" : "") + "\" data-workspace-asset-library-category=\"" + _0x1faff8 + "\" role=\"treeitem\" aria-level=\"" + (_0xd44243 + 1) + "\" aria-expanded=\"" + _0x382bf + "\">\n      <div class=\"v2-material-folder-row workspace-asset-library-folder-row\">\n        <button type=\"button\" class=\"v2-material-folder-toggle workspace-asset-library-folder-toggle\" data-workspace-asset-library-toggle=\"" + _0x1faff8 + "\" aria-expanded=\"" + _0x382bf + "\">\n          <span class=\"v2-material-tree-chevron" + (_0x382bf ? " is-open" : "") + "\" aria-hidden=\"true\"><svg viewBox=\"0 0 24 24\" fill=\"none\"><path d=\"m9 6 6 6-6 6\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/></svg></span>\n          <span class=\"v2-material-folder-icon\" aria-hidden=\"true\"><svg viewBox=\"0 0 28 24\"><path d=\"M2 5.5A2.5 2.5 0 0 1 4.5 3H11l2.4 2.5h10.1A2.5 2.5 0 0 1 26 8v11.5a2.5 2.5 0 0 1-2.5 2.5h-19A2.5 2.5 0 0 1 2 19.5v-14Z\" fill=\"currentColor\"/></svg></span>\n          <span class=\"v2-material-folder-name\">" + escapeHtml(_0x56afee.label) + "</span>\n        </button>\n        <span class=\"v2-material-folder-count\">" + _0x56afee.count + "</span>\n      </div>\n      <div class=\"v2-material-folder-content workspace-asset-library-category-content\" data-workspace-asset-library-category-content=\"" + _0x1faff8 + "\" role=\"group\" aria-hidden=\"" + !_0x382bf + "\"" + (_0x382bf ? "" : " hidden") + ">\n        " + _0x1c3898 + _0x453fc2 + "\n      </div>\n    </section>";
  };
  return "<div class=\"workspace-asset-library-groups\" data-workspace-asset-library-groups role=\"tree\" aria-label=\"总素材分类\">\n    " + _0x4c5c75.map(_0x5f42cb => _0xa90594(_0x5f42cb)).join("") + "\n  </div>";
}
export function createWorkspaceAssetLibraryDisclosure({
  expandedCategories = []
} = {}) {
  const _0x3a2d30 = new Set((Array.isArray(expandedCategories) ? expandedCategories : []).map(normalizeCategoryKey).filter(Boolean));
  const _0x1cdb08 = new Map();
  const _0x2aaab4 = _0x1c83aa => _0x3a2d30.has(normalizeCategoryKey(_0x1c83aa));
  const _0x3fa456 = _0x1ebd91 => {
    const _0x4ba0e1 = normalizeText(_0x1ebd91);
    const _0x403ef1 = normalizeCategoryKey(_0x4ba0e1);
    if (!_0x403ef1) {
      return false;
    }
    _0x1cdb08.set(_0x403ef1, _0x4ba0e1);
    if (_0x3a2d30.has(_0x403ef1)) {
      _0x3a2d30.delete(_0x403ef1);
    } else {
      _0x3a2d30.add(_0x403ef1);
    }
    return _0x3a2d30.has(_0x403ef1);
  };
  return {
    getExpandedCategories: () => [..._0x3a2d30].map(_0x1d2ebf => _0x1cdb08.get(_0x1d2ebf) || _0x1d2ebf),
    isExpanded: _0x2aaab4,
    toggle: _0x3fa456,
    toggleFromTarget(_0x1737e2) {
      const _0xc9c282 = _0x1737e2?.closest?.("[data-workspace-asset-library-toggle]");
      if (!_0xc9c282) {
        return false;
      }
      const _0x146aad = _0xc9c282.dataset?.workspaceAssetLibraryToggle;
      const _0x1fde8e = _0x3fa456(_0x146aad);
      const _0x1dd147 = _0xc9c282.closest?.("[data-workspace-asset-library-category]");
      const _0x5b1530 = _0x1dd147?.querySelector?.("[data-workspace-asset-library-category-content]");
      _0x1dd147?.setAttribute?.("aria-expanded", String(_0x1fde8e));
      _0xc9c282.setAttribute?.("aria-expanded", String(_0x1fde8e));
      _0xc9c282.querySelector?.(".v2-material-tree-chevron")?.classList?.toggle?.("is-open", _0x1fde8e);
      if (_0x5b1530) {
        _0x5b1530.hidden = !_0x1fde8e;
        _0x5b1530.setAttribute?.("aria-hidden", String(!_0x1fde8e));
        if (_0x1fde8e) {
          activateWorkspaceAssetLibraryImages(_0x5b1530);
        }
      }
      return true;
    },
    render(_0x1d0204 = {}) {
      return renderWorkspaceAssetLibraryGroups({
        ..._0x1d0204,
        expandedCategories: [..._0x3a2d30]
      });
    }
  };
}