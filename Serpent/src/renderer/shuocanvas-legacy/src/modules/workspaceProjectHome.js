function normalizeText(_0x4049fd) {
  return String(_0x4049fd ?? "").trim();
}
function escapeHtml(_0x33c388) {
  return String(_0x33c388 ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll("\"", "&quot;").replaceAll("'", "&#039;");
}
export function getWorkspaceProjectTaskPresentation({
  activeCount = 0,
  failedCount = 0
} = {}) {
  const _0x29fa0c = Math.max(0, Math.trunc(Number(activeCount) || 0));
  const _0x5c188d = Math.max(0, Math.trunc(Number(failedCount) || 0));
  return {
    activeCount: _0x29fa0c,
    failedCount: _0x5c188d,
    label: _0x29fa0c ? "后台生成中 · " + _0x29fa0c + " 个任务" : _0x5c188d ? _0x5c188d + " 个任务需重试" : "制作中"
  };
}
const WORKSPACE_PROJECT_SORT_ORDERS = Object.freeze(["updated-desc", "created-asc", "title-asc"]);
const WORKSPACE_PROJECT_SORT_OPTIONS = Object.freeze([{
  value: "updated-desc",
  label: "最近更新"
}, {
  value: "created-asc",
  label: "最早创建"
}, {
  value: "title-asc",
  label: "按名称"
}]);
export function normalizeWorkspaceProjectSortOrder(_0x115d7f) {
  const _0x171511 = normalizeText(_0x115d7f);
  if (WORKSPACE_PROJECT_SORT_ORDERS.includes(_0x171511)) {
    return _0x171511;
  } else {
    return "updated-desc";
  }
}
function getWorkspaceProjectCreatedAt(_0x13c4c4 = {}) {
  const _0x18d689 = Number(_0x13c4c4?.createdAt || _0x13c4c4?.data?.project?.createdAt || 0);
  if (Number.isFinite(_0x18d689) && _0x18d689 > 0) {
    return _0x18d689;
  }
  const _0x27b7c8 = Number(normalizeText(_0x13c4c4?.id).match(/\d{10,}/)?.[0] || 0);
  if (Number.isFinite(_0x27b7c8) && _0x27b7c8 > 0) {
    return _0x27b7c8;
  }
  return Math.max(0, Number(_0x13c4c4?.updatedAt || 0));
}
export function getWorkspaceProjectHomeEntries(_0x5dd93e = [], {
  query = "",
  sortOrder = "updated-desc",
  showArchived = false
} = {}) {
  const _0x577fb4 = normalizeText(query).toLocaleLowerCase("zh-CN");
  const _0xc36afb = normalizeWorkspaceProjectSortOrder(sortOrder);
  return (Array.isArray(_0x5dd93e) ? _0x5dd93e : []).filter(_0x4d453d => Boolean(Number(_0x4d453d?.archivedAt || 0)) === Boolean(showArchived)).filter(_0x296b0f => {
    if (!_0x577fb4) {
      return true;
    }
    const _0x464f18 = normalizeText(_0x296b0f?.title || _0x296b0f?.data?.project?.title).toLocaleLowerCase("zh-CN");
    return _0x464f18.includes(_0x577fb4);
  }).map((_0x320c8a, _0x5a2616) => ({
    entry: _0x320c8a,
    index: _0x5a2616
  })).sort((_0xf8d61f, _0x522974) => {
    if (_0xc36afb === "title-asc") {
      const _0x40f302 = normalizeText(_0xf8d61f.entry?.title || _0xf8d61f.entry?.data?.project?.title);
      const _0x449672 = normalizeText(_0x522974.entry?.title || _0x522974.entry?.data?.project?.title);
      return _0x40f302.localeCompare(_0x449672, "zh-CN") || _0xf8d61f.index - _0x522974.index;
    }
    if (_0xc36afb === "created-asc") {
      return getWorkspaceProjectCreatedAt(_0xf8d61f.entry) - getWorkspaceProjectCreatedAt(_0x522974.entry) || _0xf8d61f.index - _0x522974.index;
    }
    return Number(_0x522974.entry?.updatedAt || 0) - Number(_0xf8d61f.entry?.updatedAt || 0) || _0xf8d61f.index - _0x522974.index;
  }).map(({
    entry: _0x2604f0
  }) => _0x2604f0);
}
export function renderWorkspaceProjectSortControl(_0x27eaeb = "updated-desc") {
  const _0x3e787c = normalizeWorkspaceProjectSortOrder(_0x27eaeb);
  const _0x58be48 = WORKSPACE_PROJECT_SORT_OPTIONS.find(_0x4d52b3 => _0x4d52b3.value === _0x3e787c) || WORKSPACE_PROJECT_SORT_OPTIONS[0];
  return "<div class=\"story-project-sort\" data-workspace-project-sort-wrap data-story-project-sort-wrap>\n    <button type=\"button\" class=\"story-project-sort-trigger story-menu-trigger\" data-workspace-action=\"toggle-project-sort-menu\" data-story-action=\"toggle-project-sort-menu\" aria-haspopup=\"menu\" aria-expanded=\"false\">\n      <span>" + _0x58be48.label + "</span><span class=\"story-project-sort-chevron\" aria-hidden=\"true\"></span>\n    </button>\n    <div class=\"story-project-sort-menu\" data-workspace-project-sort-menu data-story-project-sort-menu role=\"menu\" aria-label=\"项目排序\" aria-hidden=\"true\">\n      " + WORKSPACE_PROJECT_SORT_OPTIONS.map(_0x361c75 => "<button type=\"button\" class=\"story-project-sort-option" + (_0x361c75.value === _0x3e787c ? " is-selected" : "") + "\" data-workspace-action=\"select-project-sort\" data-story-action=\"select-project-sort\" data-workspace-project-sort-option=\"" + _0x361c75.value + "\" data-story-project-sort-option=\"" + _0x361c75.value + "\" role=\"menuitemradio\" aria-checked=\"" + (_0x361c75.value === _0x3e787c) + "\">\n        <span>" + _0x361c75.label + "</span><span class=\"story-project-sort-check\" aria-hidden=\"true\">✓</span>\n      </button>").join("") + "\n    </div>\n  </div>";
}
function renderWorkspaceProjectCover(_0x134cdf = [], {
  emptyLabel = "项目",
  altPrefix = "项目封面",
  projectTypeLabel = ""
} = {}) {
  const _0x27e80e = normalizeText(projectTypeLabel);
  const _0x5d9b49 = (Array.isArray(_0x134cdf) ? _0x134cdf : []).map(normalizeText).filter((_0x706f9c, _0xdcb759, _0x1f6da3) => _0x706f9c && _0x1f6da3.indexOf(_0x706f9c) === _0xdcb759).slice(0, 3);
  if (!_0x5d9b49.length) {
    return "<div class=\"story-project-cover story-media-empty\" data-workspace-project-cover role=\"img\" aria-label=\"" + escapeHtml(emptyLabel) + "\">" + (_0x27e80e ? "" : "<span class=\"story-project-empty-label\">" + escapeHtml(emptyLabel) + "</span>") + "</div>";
  }
  return "<div class=\"story-project-cover story-project-cover--collage story-project-cover--count-" + _0x5d9b49.length + "\" data-workspace-project-cover>\n    " + _0x5d9b49.map((_0x50a38f, _0x4cf325) => "<img src=\"" + escapeHtml(_0x50a38f) + "\" alt=\"" + escapeHtml(altPrefix) + " " + (_0x4cf325 + 1) + "\" loading=\"lazy\" decoding=\"async\" draggable=\"false\">").join("") + "\n  </div>";
}
export function renderWorkspaceProjectCard(_0x283ecc, {
  isDeleteConfirming = false,
  isMenuOpen = false,
  fallbackTitle = "未命名项目",
  itemCount = 0,
  itemLabel = "项",
  coverImageUrls = [],
  emptyCoverLabel = "项目",
  coverAltPrefix = "项目封面",
  projectTypeLabel = "",
  taskSummary = null
} = {}) {
  const _0x1dedaa = _0x283ecc?.data?.project || {};
  const _0x209779 = normalizeText(_0x283ecc?.id || _0x1dedaa.id) || "current";
  const _0x2b28c3 = Number(_0x283ecc?.archivedAt || 0) > 0;
  const _0x5efa25 = Number.isFinite(Number(itemCount)) ? Math.max(0, Math.trunc(Number(itemCount))) : 0;
  const _0x47e716 = normalizeText(_0x1dedaa.title || _0x283ecc?.title) || normalizeText(fallbackTitle) || "未命名项目";
  const _0x245841 = Number(_0x283ecc?.updatedAt || 0);
  const _0xfd6e24 = taskSummary && typeof taskSummary === "object" ? taskSummary : {};
  const _0x430070 = getWorkspaceProjectTaskPresentation({
    activeCount: _0xfd6e24.activeCount,
    failedCount: _0xfd6e24.failedCount
  });
  const {
    activeCount: _0x2ff4ac,
    failedCount: _0x2b55ce
  } = _0x430070;
  const _0x4fd4be = _0x2ff4ac ? " is-generating" : "";
  const _0x4b7797 = !_0x2ff4ac && _0x2b55ce ? " has-task-error" : "";
  const _0x4e57b3 = _0x2b28c3 && !_0x2ff4ac && !_0x2b55ce ? "已归档" : normalizeText(_0xfd6e24.label) || _0x430070.label;
  const _0x45a03d = _0x2ff4ac ? "<span class=\"story-project-status" + _0x4fd4be + "\" data-workspace-project-status role=\"status\" aria-live=\"polite\">" + escapeHtml(_0x4e57b3) + "</span>" : "";
  const _0x4746f0 = _0x2b55ce || _0x2b28c3 ? "<span class=\"story-project-inline-status" + (_0x2b55ce ? " has-task-error" : " is-archived") + "\" data-workspace-project-inline-status " + (_0x2b55ce ? "role=\"status\" aria-live=\"polite\"" : "") + ">" + escapeHtml(_0x4e57b3) + "</span>" : "";
  const _0x97598c = normalizeText(projectTypeLabel) ? "<span class=\"story-project-type\" data-workspace-project-type>" + escapeHtml(projectTypeLabel) + "</span>" : "";
  return "<article class=\"story-project-card " + (isDeleteConfirming ? "is-delete-confirming" : "") + (_0x2b28c3 ? " is-archived" : "") + (isMenuOpen ? " is-menu-open" : "") + _0x4fd4be + _0x4b7797 + "\" data-workspace-open-project=\"" + escapeHtml(_0x209779) + "\" data-story-open-project=\"" + escapeHtml(_0x209779) + "\">\n    " + renderWorkspaceProjectCover(coverImageUrls, {
    emptyLabel: emptyCoverLabel,
    altPrefix: coverAltPrefix,
    projectTypeLabel: projectTypeLabel
  }) + "\n    " + _0x45a03d + "\n    <div class=\"story-project-menu-wrap\" data-workspace-project-menu-wrap data-story-project-menu-wrap>\n      <button type=\"button\" class=\"story-project-menu-trigger\" data-workspace-action=\"toggle-project-menu\" data-story-action=\"toggle-project-menu\" data-workspace-project-id=\"" + escapeHtml(_0x209779) + "\" data-story-project-id=\"" + escapeHtml(_0x209779) + "\" aria-label=\"" + escapeHtml(_0x47e716) + " 项目操作\" aria-haspopup=\"menu\" aria-expanded=\"" + isMenuOpen + "\" " + (isDeleteConfirming ? "hidden" : "") + ">•••</button>\n      <div class=\"story-project-menu\" data-workspace-project-menu data-story-project-menu role=\"menu\" aria-hidden=\"" + (!isMenuOpen || !!isDeleteConfirming) + "\" " + (isMenuOpen && !isDeleteConfirming ? "" : "hidden") + ">\n        <button type=\"button\" data-workspace-action=\"rename-project\" data-story-action=\"rename-project\" data-workspace-project-id=\"" + escapeHtml(_0x209779) + "\" data-story-project-id=\"" + escapeHtml(_0x209779) + "\" role=\"menuitem\">重命名</button>\n        <button type=\"button\" data-workspace-action=\"duplicate-project\" data-story-action=\"duplicate-project\" data-workspace-project-id=\"" + escapeHtml(_0x209779) + "\" data-story-project-id=\"" + escapeHtml(_0x209779) + "\" role=\"menuitem\">复制项目</button>\n        <button type=\"button\" data-workspace-action=\"" + (_0x2b28c3 ? "unarchive-project" : "archive-project") + "\" data-story-action=\"" + (_0x2b28c3 ? "unarchive-project" : "archive-project") + "\" data-workspace-project-id=\"" + escapeHtml(_0x209779) + "\" data-story-project-id=\"" + escapeHtml(_0x209779) + "\" role=\"menuitem\">" + (_0x2b28c3 ? "取消归档" : "归档项目") + "</button>\n        <button type=\"button\" class=\"is-danger\" data-workspace-action=\"request-delete-project\" data-story-action=\"request-delete-project\" data-workspace-project-id=\"" + escapeHtml(_0x209779) + "\" data-story-project-id=\"" + escapeHtml(_0x209779) + "\" role=\"menuitem\">删除项目</button>\n      </div>\n    </div>\n    <div data-workspace-project-delete-confirm class=\"story-project-delete-confirm\" " + (isDeleteConfirming ? "" : "hidden") + " aria-label=\"确认删除 " + escapeHtml(_0x47e716) + "\">\n      <button type=\"button\" class=\"confirm-btn confirm-cancel\" data-workspace-action=\"cancel-delete-project\" data-story-action=\"cancel-delete-project\" data-workspace-project-id=\"" + escapeHtml(_0x209779) + "\" data-story-project-id=\"" + escapeHtml(_0x209779) + "\">取消</button>\n      <button type=\"button\" class=\"confirm-btn confirm-ok\" data-workspace-action=\"confirm-delete-project\" data-story-action=\"confirm-delete-project\" data-workspace-project-id=\"" + escapeHtml(_0x209779) + "\" data-story-project-id=\"" + escapeHtml(_0x209779) + "\">删除</button>\n    </div>\n    <div class=\"story-project-card-copy" + (_0x97598c ? " has-project-type" : "") + "\" data-workspace-project-card-copy>\n      " + _0x97598c + "\n      <input class=\"story-project-title-input\" data-workspace-project-title=\"" + escapeHtml(_0x209779) + "\" data-story-project-title=\"" + escapeHtml(_0x209779) + "\" value=\"" + escapeHtml(_0x47e716) + "\" maxlength=\"120\" aria-label=\"项目名称\">\n      <div class=\"story-project-card-meta\"><small>" + (_0x245841 ? "已自动保存" : "刚刚更新") + " · " + _0x5efa25 + " " + escapeHtml(itemLabel) + "</small>" + _0x4746f0 + "</div>\n    </div>\n  </article>";
}