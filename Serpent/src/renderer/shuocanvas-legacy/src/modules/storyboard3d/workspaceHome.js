import { getActiveStoryboard3DScene, getActiveStoryboard3DShot, migrateStoryboard3DProject, summarizeStoryboard3DProject } from "./projectModel.js";
import { bindAIGenTextModelSelector, renderAIGenTextModelSelectorMarkup } from "../../components/aigenText/modelSelector.js";
import { getDisplayModelName } from "../providers.js";
import { getStoryWorkspaceModelChoice, resolveStoryWorkspaceModelId } from "../storyWorkspace/storyWorkspaceModelCatalog.js";
import { STORYBOARD_3D_PROMPT_MAX_CHARACTERS } from "./projectGeneration.js";
import { containWorkspaceContextMenu } from "../workspaceContextMenuGuard.js";
function escapeHtml(_0x17d71e) {
  return String(_0x17d71e ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll("\"", "&quot;").replaceAll("'", "&#39;");
}
function normalizeText(_0x5e7988) {
  return String(_0x5e7988 || "").trim();
}
function normalizeSearchText(_0x4394f0) {
  return normalizeText(_0x4394f0).toLocaleLowerCase("zh-CN");
}
function formatModelPackSize(_0x34ebe6) {
  const _0x4354b5 = Math.max(0, Number(_0x34ebe6) || 0);
  if (!_0x4354b5) {
    return "";
  }
  return Math.max(1, Math.round(_0x4354b5 / 1048576)) + " MB";
}
function formatDownloadedBytes(_0x426c02) {
  const _0x6ff64 = Math.max(0, Number(_0x426c02) || 0);
  if (_0x6ff64 < 1024) {
    return Math.floor(_0x6ff64) + " B";
  }
  if (_0x6ff64 < 1048576) {
    return (_0x6ff64 / 1024).toFixed(1) + " KB";
  }
  return (_0x6ff64 / 1048576).toFixed(1) + " MB";
}
function getModelPackInstallProgress(_0xc13177 = {}) {
  const _0x33a529 = _0xc13177?.installProgress && typeof _0xc13177.installProgress === "object" ? _0xc13177.installProgress : {};
  const _0x27726b = Math.max(0, Number(_0x33a529.downloadedBytes) || 0);
  const _0x24824a = Math.max(0, Number(_0x33a529.totalBytes) || Number(_0xc13177?.downloadBytes) || 0);
  const _0x1a1379 = _0x24824a > 0 ? _0x27726b / _0x24824a * 100 : 0;
  return {
    state: normalizeText(_0x33a529.state),
    downloadedBytes: _0x27726b,
    totalBytes: _0x24824a,
    percent: Math.min(100, Math.max(0, Number(_0x33a529.percent) || _0x1a1379)),
    currentSource: normalizeText(_0x33a529.currentSource),
    completedSources: Math.max(0, Math.floor(Number(_0x33a529.completedSources) || 0)),
    totalSources: Math.max(0, Math.floor(Number(_0x33a529.totalSources) || 0)),
    message: normalizeText(_0x33a529.message)
  };
}
function getModelPackProgressMessage(_0x34531a) {
  if (_0x34531a.message) {
    return _0x34531a.message;
  }
  if (_0x34531a.state === "extracting") {
    return "正在解压并校验模型";
  }
  if (_0x34531a.state === "installing") {
    return "正在安装模型素材";
  }
  if (_0x34531a.state === "complete") {
    return "模型包下载完成";
  }
  return "正在下载模型包";
}
export function isStoryboard3DModelPackReady(_0x406fe4 = {}) {
  return _0x406fe4?.installed === true && Array.isArray(_0x406fe4?.assets) && _0x406fe4.assets.length > 0;
}
export function formatStoryboard3DProjectUpdatedAt(_0xa8c761, {
  now = Date.now()
} = {}) {
  const _0x250ded = Number(_0xa8c761 || 0);
  if (!Number.isFinite(_0x250ded) || _0x250ded <= 0) {
    return "刚刚更新";
  }
  const _0x2abe0e = Math.max(0, Number(now) - _0x250ded);
  const _0x3a2f06 = 60000;
  const _0x2bfbe6 = _0x3a2f06 * 60;
  const _0x124790 = _0x2bfbe6 * 24;
  if (_0x2abe0e < _0x3a2f06) {
    return "刚刚更新";
  }
  if (_0x2abe0e < _0x2bfbe6) {
    return Math.max(1, Math.floor(_0x2abe0e / _0x3a2f06)) + " 分钟前";
  }
  if (_0x2abe0e < _0x124790) {
    return Math.max(1, Math.floor(_0x2abe0e / _0x2bfbe6)) + " 小时前";
  }
  if (_0x2abe0e < _0x124790 * 7) {
    return Math.max(1, Math.floor(_0x2abe0e / _0x124790)) + " 天前";
  }
  return new Date(_0x250ded).toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  });
}
export function getStoryboard3DWorkspaceProjects(_0x52c31a = {}) {
  const _0x2f0f0f = Array.isArray(_0x52c31a?.storyboard3dProjects) ? _0x52c31a.storyboard3dProjects : [];
  return _0x2f0f0f.filter(_0x5cb169 => _0x5cb169 && typeof _0x5cb169 === "object" && normalizeText(_0x5cb169.id)).map(_0x3c8ae1 => {
    const _0x2b9c1c = migrateStoryboard3DProject(_0x3c8ae1);
    const _0x1d7f05 = getActiveStoryboard3DScene(_0x2b9c1c);
    const _0x3ffa5e = getActiveStoryboard3DShot(_0x2b9c1c);
    const _0x9fdee9 = summarizeStoryboard3DProject(_0x2b9c1c);
    return {
      projectId: _0x2b9c1c.id,
      title: _0x2b9c1c.name,
      previewUrl: _0x3ffa5e?.thumbnailUrl || "",
      activeSceneName: _0x1d7f05?.name || "未命名场景",
      ..._0x9fdee9,
      updatedAt: Number(_0x2b9c1c.updatedAt || 0)
    };
  }).sort((_0x18e38b, _0x404808) => _0x404808.updatedAt - _0x18e38b.updatedAt || _0x18e38b.title.localeCompare(_0x404808.title, "zh-CN"));
}
export function filterStoryboard3DWorkspaceProjects(_0x55058e = [], _0x57daa6 = "") {
  const _0x4d1525 = normalizeSearchText(_0x57daa6);
  if (!_0x4d1525) {
    return [..._0x55058e];
  }
  return _0x55058e.filter(_0x3a0815 => normalizeSearchText((_0x3a0815?.title || "") + " " + (_0x3a0815?.activeSceneName || "")).includes(_0x4d1525));
}
function renderCubeIcon(_0x36b6b0 = "") {
  return "<svg class=\"" + escapeHtml(_0x36b6b0) + "\" viewBox=\"0 0 24 24\" fill=\"none\" aria-hidden=\"true\">\n    <path d=\"m12 3 8 4.5v9L12 21l-8-4.5v-9z\"/>\n    <path d=\"m4 7.5 8 4.5 8-4.5M12 12v9\"/>\n    <circle cx=\"12\" cy=\"8\" r=\"1.5\"/>\n  </svg>";
}
function renderProjectPreview(_0x584760) {
  if (_0x584760.previewUrl) {
    return "<img src=\"" + escapeHtml(_0x584760.previewUrl) + "\" alt=\"" + escapeHtml(_0x584760.title) + " 的镜头预览\">";
  }
  return "<div class=\"storyboard-3d-home-project-placeholder\" aria-hidden=\"true\">\n    <span class=\"storyboard-3d-home-grid-plane\"></span>\n    " + renderCubeIcon("storyboard-3d-home-placeholder-icon") + "\n    <small>" + escapeHtml(_0x584760.activeSceneName) + "</small>\n  </div>";
}
export function renderStoryboard3DProjectCard(_0x38a31d, _0x36aee8, {
  menuOpen = false,
  editing = false,
  editingName = "",
  confirmingDelete = false
} = {}) {
  const _0x4e35f8 = _0x38a31d.title + " " + _0x38a31d.activeSceneName;
  const _0x2e6906 = escapeHtml(_0x38a31d.projectId);
  return "<article class=\"storyboard-3d-home-project-card" + (menuOpen ? " is-menu-open" : "") + (editing ? " is-renaming" : "") + (confirmingDelete ? " is-delete-confirming" : "") + "\" data-storyboard-3d-project-id=\"" + _0x2e6906 + "\" data-storyboard-3d-project-search=\"" + escapeHtml(normalizeSearchText(_0x4e35f8)) + "\">\n    <button type=\"button\" class=\"storyboard-3d-home-project-preview\" data-storyboard-3d-home-action=\"open-project\" data-storyboard-3d-project-id=\"" + _0x2e6906 + "\" aria-label=\"打开项目 " + escapeHtml(_0x38a31d.title) + "\">\n      " + renderProjectPreview(_0x38a31d) + "\n    </button>\n    " + (confirmingDelete ? "<div class=\"storyboard-3d-home-project-delete-confirm\" role=\"group\" aria-label=\"确认删除项目 " + escapeHtml(_0x38a31d.title) + "\">\n          <button type=\"button\" class=\"storyboard-3d-home-project-delete-confirm-button is-danger\" data-storyboard-3d-home-action=\"confirm-project-delete\" data-storyboard-3d-project-id=\"" + _0x2e6906 + "\">删除</button>\n          <button type=\"button\" class=\"storyboard-3d-home-project-delete-confirm-button\" data-storyboard-3d-home-action=\"cancel-project-delete\" data-storyboard-3d-project-id=\"" + _0x2e6906 + "\">取消</button>\n        </div>" : "<button type=\"button\" class=\"storyboard-3d-home-project-more\" data-storyboard-3d-home-action=\"toggle-project-menu\" data-storyboard-3d-project-id=\"" + _0x2e6906 + "\" aria-label=\"" + escapeHtml(_0x38a31d.title) + " 的更多选项\" aria-haspopup=\"menu\" aria-expanded=\"" + menuOpen + "\">\n          <span aria-hidden=\"true\">•••</span>\n        </button>\n        <div class=\"storyboard-3d-home-project-menu\" role=\"menu\" aria-label=\"" + escapeHtml(_0x38a31d.title) + " 的项目操作\" " + (menuOpen ? "" : "hidden") + ">\n          <button type=\"button\" role=\"menuitem\" data-storyboard-3d-home-action=\"clone-project\" data-storyboard-3d-project-id=\"" + _0x2e6906 + "\">克隆</button>\n          <button type=\"button\" role=\"menuitem\" data-storyboard-3d-home-action=\"start-project-rename\" data-storyboard-3d-project-id=\"" + _0x2e6906 + "\">重命名</button>\n          <button type=\"button\" class=\"is-danger\" role=\"menuitem\" data-storyboard-3d-home-action=\"delete-project\" data-storyboard-3d-project-id=\"" + _0x2e6906 + "\">删除</button>\n        </div>") + "\n    <span class=\"storyboard-3d-home-project-copy\">\n      <span class=\"storyboard-3d-home-project-heading\">\n        " + (editing ? "<input type=\"text\" value=\"" + escapeHtml(editingName) + "\" maxlength=\"120\" data-storyboard-3d-project-rename-input data-storyboard-3d-project-id=\"" + _0x2e6906 + "\" aria-label=\"重命名项目 " + escapeHtml(_0x38a31d.title) + "\">" : "<button type=\"button\" class=\"storyboard-3d-home-project-title\" data-storyboard-3d-home-action=\"start-project-rename\" data-storyboard-3d-project-id=\"" + _0x2e6906 + "\" title=\"点击重命名\"><strong>" + escapeHtml(_0x38a31d.title) + "</strong></button>") + "\n        <small>" + escapeHtml(formatStoryboard3DProjectUpdatedAt(_0x38a31d.updatedAt, {
    now: _0x36aee8
  })) + "</small>\n      </span>\n      <button type=\"button\" class=\"storyboard-3d-home-project-details\" data-storyboard-3d-home-action=\"open-project\" data-storyboard-3d-project-id=\"" + _0x2e6906 + "\" aria-label=\"打开项目 " + escapeHtml(_0x38a31d.title) + "\">\n        <span class=\"storyboard-3d-home-visually-hidden\">" + escapeHtml(_0x38a31d.title) + "</span>\n        <span class=\"storyboard-3d-home-project-scene\">当前场景 · " + escapeHtml(_0x38a31d.activeSceneName) + "</span>\n        <span class=\"storyboard-3d-home-project-stats\">\n          <span><b>" + _0x38a31d.sceneCount + "</b> 场景</span>\n          <span><b>" + _0x38a31d.shotCount + "</b> 镜头</span>\n          <span><b>" + _0x38a31d.objectCount + "</b> 物体</span>\n        </span>\n      </button>\n    </span>\n  </article>";
}
function renderHome({
  projects: _0x18b901,
  searchQuery: _0x11a4ab,
  prompt: _0x4d3c2a,
  modelId: _0x543eff,
  provider: _0x355a60,
  isGenerating: _0x11dac,
  generationStatus: _0x3f8b62,
  generationError: _0x1dc883,
  modelPackStatus: _0x580429,
  modelPackDialogOpen: _0x3e79b0,
  referenceImageUrl: _0x2f876a,
  referenceImageName: _0x37d069,
  openProjectMenuId: _0x2f471d,
  editingProjectId: _0x4c6117,
  editingProjectName: _0x27b28f,
  confirmingDeleteProjectId: _0x477063
}) {
  const _0x40f09a = Date.now();
  const _0x7501a2 = isStoryboard3DModelPackReady(_0x580429);
  const _0x236e37 = Boolean(normalizeText(_0x4d3c2a) && _0x543eff && _0x355a60 && _0x7501a2);
  const _0x431a8a = _0x580429?.state === "installing";
  const _0xb73880 = Math.max(0, Math.floor(Number(_0x580429?.assetCount) || 0), Array.isArray(_0x580429?.assets) ? _0x580429.assets.length : 0);
  const _0x2ae7bc = formatModelPackSize(_0x580429?.downloadBytes);
  const _0x3d0aa2 = getModelPackInstallProgress(_0x580429);
  const _0x42ca26 = [_0xb73880 ? _0xb73880.toLocaleString("zh-CN") + " 项素材" : "", _0x2ae7bc ? "约 " + _0x2ae7bc : ""].filter(Boolean).join(" · ");
  return "<div class=\"storyboard-3d-workspace-home-page\">\n    <section class=\"storyboard-3d-home-hero\">\n      <span class=\"storyboard-3d-home-eyebrow\">SHUO Canvas · Previz Studio</span>\n      <h1>先在空间里走一遍，再把镜头交给生成模型</h1>\n      <p>用场景、人物、道具和机位搭建可持续编辑的 3D 预演项目，让镜头关系在生成前就清晰可控。</p>\n      <div class=\"storyboard-3d-home-composer " + (_0x11dac ? "is-generating" : "") + "\" aria-busy=\"" + (_0x11dac ? "true" : "false") + "\">\n        <div class=\"storyboard-3d-home-prompt-wrap\">\n          <label for=\"storyboard3DHomePrompt\">描述想要搭建的 3D 场景</label>\n          <textarea id=\"storyboard3DHomePrompt\" data-storyboard-3d-prompt-input maxlength=\"" + STORYBOARD_3D_PROMPT_MAX_CHARACTERS + "\" placeholder=\"例如：雨夜的旧车站，站台中央有一张长椅，两个人隔着行李箱对坐，使用低机位中景。\">" + escapeHtml(_0x4d3c2a) + "</textarea>\n          <div class=\"storyboard-3d-home-prompt-meta\">\n            <p>AI 会规划场景类型、可用素材、空间位置和首个镜头，生成后仍可逐项编辑。</p>\n            <span data-storyboard-3d-prompt-count>" + _0x4d3c2a.length + " / " + STORYBOARD_3D_PROMPT_MAX_CHARACTERS + "</span>\n          </div>\n        </div>\n        <div class=\"storyboard-3d-home-model-bar\">\n          " + renderAIGenTextModelSelectorMarkup({
    modelId: _0x543eff,
    provider: _0x355a60,
    getDisplayModelName: getDisplayModelName,
    className: "storyboard-3d-home-text-model-selector"
  }) + "\n          <div class=\"storyboard-3d-home-composer-actions\">\n            <input type=\"file\" accept=\"image/*\" data-storyboard-3d-reference-image-input hidden>\n            <button type=\"button\" class=\"storyboard-3d-home-reference-button\" data-storyboard-3d-home-action=\"choose-reference-image\">\n              <span aria-hidden=\"true\">▧</span><span>参考图</span>\n            </button>\n            <button type=\"button\" class=\"storyboard-3d-home-primary storyboard-3d-home-generate\" data-storyboard-3d-home-action=\"generate-project\" " + (_0x236e37 && !_0x11dac ? "" : "disabled") + ">\n              <span data-storyboard-3d-generate-label>" + escapeHtml(_0x11dac ? _0x3f8b62 || "正在创建 3D 场景" : "生成 3D 场景") + "</span>\n              <span class=\"storyboard-3d-home-generate-arrow\" aria-hidden=\"true\">→</span>\n            </button>\n          </div>\n        </div>\n        " + (_0x2f876a ? "<div class=\"storyboard-3d-home-reference-preview\" data-storyboard-3d-reference-preview>\n              <img src=\"" + escapeHtml(_0x2f876a) + "\" alt=\"参考图预览\">\n              <span><strong>" + escapeHtml(_0x37d069 || "参考图") + "</strong><small>AI 将从图片估计人物、物品和空间关系</small></span>\n              <button type=\"button\" data-storyboard-3d-home-action=\"remove-reference-image\" aria-label=\"移除参考图\">×</button>\n            </div>" : "") + "\n        " + (!_0x7501a2 && _0x580429?.state !== "checking" ? "<div class=\"storyboard-3d-home-model-pack-hint\" role=\"status\">需要先下载基础轻量模型包，场景 Agent 才能调用固定素材搭建场景。</div>" : "") + "\n        <div class=\"storyboard-3d-home-generation-error\" data-storyboard-3d-generation-error role=\"alert\" " + (_0x1dc883 ? "" : "hidden") + ">" + escapeHtml(_0x1dc883) + "</div>\n        <div class=\"storyboard-3d-home-generation-loading storyboard-script-loading-overlay\" data-storyboard-3d-generation-loading role=\"status\" aria-live=\"polite\" " + (_0x11dac ? "" : "hidden") + ">\n          <div class=\"storyboard-script-loading-spinner\"></div>\n          <div class=\"storyboard-script-loading-label\" data-storyboard-3d-generation-loading-label>" + escapeHtml(_0x3f8b62 || "正在创建 3D 场景") + "</div>\n          <div class=\"storyboard-script-loading-bar\"><div class=\"storyboard-script-loading-bar-fill\"></div></div>\n        </div>\n      </div>\n    </section>\n\n    <section class=\"storyboard-3d-home-projects\" aria-labelledby=\"storyboard3DHomeProjectsTitle\">\n      <div class=\"storyboard-3d-home-section-heading\">\n        <div>\n          <span class=\"storyboard-3d-home-eyebrow\">独立项目 · " + _0x18b901.length + "</span>\n          <h2 id=\"storyboard3DHomeProjectsTitle\">我的3D场景项目</h2>\n        </div>\n        " + (_0x18b901.length ? "<label class=\"storyboard-3d-home-search\">\n              <span aria-hidden=\"true\">⌕</span>\n              <input type=\"search\" value=\"" + escapeHtml(_0x11a4ab) + "\" data-storyboard-3d-project-search-input placeholder=\"搜索项目或场景\" aria-label=\"搜索 3D 场景项目\">\n            </label>" : "") + "\n      </div>\n      " + (_0x18b901.length ? "<div class=\"storyboard-3d-home-project-grid\">\n            " + _0x18b901.map(_0x1df442 => renderStoryboard3DProjectCard(_0x1df442, _0x40f09a, {
    menuOpen: _0x1df442.projectId === _0x2f471d,
    editing: _0x1df442.projectId === _0x4c6117,
    editingName: _0x1df442.projectId === _0x4c6117 ? _0x27b28f : _0x1df442.title,
    confirmingDelete: _0x1df442.projectId === _0x477063
  })).join("") + "\n            <button type=\"button\" class=\"storyboard-3d-home-create-card\" data-storyboard-3d-home-action=\"new-project\">\n              <span aria-hidden=\"true\">+</span><strong>新建 3D 场景项目</strong><small>创建空场景与首个镜头</small>\n            </button>\n          </div>\n          <div class=\"storyboard-3d-home-search-empty\" data-storyboard-3d-search-empty hidden>\n            <strong>没有找到匹配的项目</strong><span>换一个项目名称或场景名称试试。</span>\n          </div>" : "<div class=\"storyboard-3d-home-empty-projects\">\n            <div>" + renderCubeIcon("storyboard-3d-home-empty-icon") + "</div>\n            <strong>还没有 3D 场景项目</strong>\n            <span>创建项目后，它会保存在当前用户项目数据中。</span>\n            <button type=\"button\" class=\"storyboard-3d-home-primary\" data-storyboard-3d-home-action=\"new-project\">创建第一个项目</button>\n          </div>") + "\n    </section>\n    " + (_0x3e79b0 ? "<div class=\"storyboard-3d-model-pack-backdrop\" data-storyboard-3d-model-pack-dialog role=\"presentation\">\n          <section class=\"storyboard-3d-model-pack-dialog\" role=\"dialog\" aria-modal=\"true\" aria-labelledby=\"storyboard3DModelPackTitle\">\n            <span class=\"storyboard-3d-model-pack-mark\" aria-hidden=\"true\">" + renderCubeIcon() + "</span>\n            <div>\n              <span class=\"storyboard-3d-home-eyebrow\">首次使用准备</span>\n              <h2 id=\"storyboard3DModelPackTitle\">下载 3D 场景基础模型包</h2>\n              <p>场景 Agent 只会调用这个固定的轻量素材库来搭建人物、家具和环境物品，不会在线搜索模型。素材以性能友好的中低复杂度模型为主，未下载时无法生成 3D 场景。</p>\n              " + (_0x42ca26 ? "<small>" + escapeHtml(_0x42ca26) + " · 按需加载，不会一次性占用内存</small>" : "") + "\n              <small>下载渠道：本地服务通过 HTTPS 从 Kenney 官方与 OpenGameArt 镜像获取，并在安装前校验文件。</small>\n              " + (_0x431a8a ? "<div class=\"storyboard-3d-model-pack-progress\" data-storyboard-3d-model-pack-progress>\n                    <div class=\"storyboard-3d-model-pack-progress-heading\">\n                      <strong>" + escapeHtml(getModelPackProgressMessage(_0x3d0aa2)) + "</strong>\n                      <span>" + Math.round(_0x3d0aa2.percent) + "%</span>\n                    </div>\n                    <progress max=\"100\" value=\"" + _0x3d0aa2.percent + "\" aria-label=\"模型包下载进度\">" + Math.round(_0x3d0aa2.percent) + "%</progress>\n                    <div class=\"storyboard-3d-model-pack-progress-meta\">\n                      <span>" + escapeHtml(formatDownloadedBytes(_0x3d0aa2.downloadedBytes)) + " / " + escapeHtml(formatDownloadedBytes(_0x3d0aa2.totalBytes)) + "</span>\n                      " + (_0x3d0aa2.totalSources ? "<span>" + _0x3d0aa2.completedSources + " / " + _0x3d0aa2.totalSources + " 个资源包</span>" : "") + "\n                    </div>\n                    " + (_0x3d0aa2.currentSource ? "<small title=\"" + escapeHtml(_0x3d0aa2.currentSource) + "\">下载源 · " + escapeHtml(_0x3d0aa2.currentSource) + "</small>" : "") + "\n                  </div>" : "") + "\n              " + (_0x580429?.error ? "<small class=\"storyboard-3d-model-pack-error\">" + escapeHtml(_0x580429.error) + "</small>" : "") + "\n            </div>\n            <footer>\n              <button type=\"button\" data-storyboard-3d-home-action=\"skip-model-pack\" " + (_0x431a8a ? "disabled" : "") + ">暂不下载</button>\n              <button type=\"button\" class=\"storyboard-3d-home-primary\" data-storyboard-3d-home-action=\"install-model-pack\" " + (_0x431a8a ? "disabled" : "") + ">" + (_0x431a8a ? "正在下载模型包…" : "下载模型包") + "</button>\n            </footer>\n          </section>\n        </div>" : "") + "\n  </div>";
}
export class Storyboard3DWorkspaceHome {
  constructor({
    getProjects: _0x1fbe61,
    onCreateProject: _0x4f9b05,
    onGenerateProject: _0x109a79,
    onOpenProject: _0xb7d091,
    onCloneProject: _0x172bfb,
    onRenameProject: _0x52746e,
    onDeleteProject: _0x4f4d6a,
    onNotify: _0x4bf50c,
    modelPackApi = null,
    documentObject = globalThis.document,
    urlApi = globalThis.URL,
    setTimeoutFn = globalThis.setTimeout,
    clearTimeoutFn = globalThis.clearTimeout,
    modelPackProgressPollIntervalMs = 350
  } = {}) {
    this.document = documentObject;
    this.getProjects = _0x1fbe61;
    this.onCreateProject = _0x4f9b05;
    this.onGenerateProject = _0x109a79;
    this.onOpenProject = _0xb7d091;
    this.onCloneProject = _0x172bfb;
    this.onRenameProject = _0x52746e;
    this.onDeleteProject = _0x4f4d6a;
    this.onNotify = _0x4bf50c;
    this.modelPackApi = modelPackApi;
    this.urlApi = urlApi;
    this.setTimeoutFn = setTimeoutFn;
    this.clearTimeoutFn = clearTimeoutFn;
    this.modelPackProgressPollIntervalMs = Math.min(500, Math.max(250, Number(modelPackProgressPollIntervalMs) || 350));
    this.root = null;
    this.searchQuery = "";
    this.prompt = "";
    this.modelId = resolveStoryWorkspaceModelId("text");
    this.provider = getStoryWorkspaceModelChoice("text", this.modelId)?.provider || "";
    this.isGenerating = false;
    this.generationStatus = "";
    this.generationError = "";
    this.modelPackStatus = {
      state: "checking",
      installed: false,
      assets: [],
      error: ""
    };
    this.modelPackDialogOpen = false;
    this.referenceImageUrl = "";
    this.referenceImageName = "";
    this.openProjectMenuId = "";
    this.editingProjectId = "";
    this.editingProjectName = "";
    this.confirmingDeleteProjectId = "";
    this._modelPackCheckPromise = null;
    this._modelPackProgressTimer = null;
    this._modelPackProgressPollGeneration = 0;
    this._destroyed = false;
    this._promptForMissingModelPack = false;
    this._modelSelectorController = null;
    this._handleClick = this._handleClick.bind(this);
    this._handleInput = this._handleInput.bind(this);
    this._handleChange = this._handleChange.bind(this);
    this._handleKeyDown = this._handleKeyDown.bind(this);
  }
  mount() {
    if (this.root || !this.document?.body) {
      return this.root;
    }
    const _0x408ecc = this.document.createElement("section");
    _0x408ecc.id = "storyboard3DWorkspaceHome";
    _0x408ecc.className = "storyboard-3d-workspace-home";
    _0x408ecc.hidden = true;
    _0x408ecc.setAttribute("aria-hidden", "true");
    _0x408ecc.setAttribute("aria-label", "3D 场景预演项目首页");
    _0x408ecc.dataset.uiStop = "1";
    _0x408ecc.addEventListener("contextmenu", containWorkspaceContextMenu);
    _0x408ecc.addEventListener("pointerdown", _0x243054 => _0x243054.stopPropagation());
    _0x408ecc.addEventListener("wheel", _0x54c3e3 => _0x54c3e3.stopPropagation(), {
      passive: true
    });
    _0x408ecc.addEventListener("click", this._handleClick);
    _0x408ecc.addEventListener("input", this._handleInput);
    _0x408ecc.addEventListener("change", this._handleChange);
    _0x408ecc.addEventListener("keydown", this._handleKeyDown);
    this.document.body.appendChild(_0x408ecc);
    this.root = _0x408ecc;
    this._destroyed = false;
    this._refreshModelPackStatus({
      promptIfMissing: false
    });
    return _0x408ecc;
  }
  _readProjects() {
    const _0x1cb45b = this.getProjects?.();
    if (Array.isArray(_0x1cb45b)) {
      return _0x1cb45b;
    } else {
      return [];
    }
  }
  render() {
    if (!this.root) {
      return;
    }
    const _0x56ae83 = this.root.scrollTop;
    const _0x1a796b = this.root.contains(this.document?.activeElement) ? this.document.activeElement?.getAttribute?.("data-storyboard-3d-project-id") || "" : "";
    this._modelSelectorController?.destroy?.();
    this.root.innerHTML = renderHome({
      projects: this._readProjects(),
      searchQuery: this.searchQuery,
      prompt: this.prompt,
      modelId: this.modelId,
      provider: this.provider,
      isGenerating: this.isGenerating,
      generationStatus: this.generationStatus,
      generationError: this.generationError,
      modelPackStatus: this.modelPackStatus,
      modelPackDialogOpen: this.modelPackDialogOpen,
      referenceImageUrl: this.referenceImageUrl,
      referenceImageName: this.referenceImageName,
      openProjectMenuId: this.openProjectMenuId,
      editingProjectId: this.editingProjectId,
      editingProjectName: this.editingProjectName,
      confirmingDeleteProjectId: this.confirmingDeleteProjectId
    });
    this._bindModelSelector();
    this._applySearch();
    this.root.scrollTop = _0x56ae83;
    const _0x1e251a = this.root.querySelector("[data-storyboard-3d-project-rename-input]");
    if (_0x1e251a) {
      _0x1e251a.focus();
      _0x1e251a.select?.();
    } else if (_0x1a796b) {
      this.focusProject(_0x1a796b);
    }
  }
  _bindModelSelector() {
    const _0x1c2bbb = this.root?.querySelector("[data-aigen-text-model-selector]");
    if (!_0x1c2bbb) {
      return;
    }
    this._modelSelectorController = bindAIGenTextModelSelector(_0x1c2bbb, {
      modelId: this.modelId,
      provider: this.provider,
      getDisplayModelName: getDisplayModelName,
      documentObject: this.document,
      onChange: ({
        modelId: _0x94993c,
        provider: _0x56aede
      }) => {
        this.modelId = _0x94993c;
        this.provider = _0x56aede;
        this._syncGenerationUi();
      }
    });
  }
  _syncGenerationUi() {
    if (!this.root) {
      return;
    }
    const _0x30ec57 = Boolean(normalizeText(this.prompt) && this.modelId && this.provider && isStoryboard3DModelPackReady(this.modelPackStatus));
    const _0x54be34 = this.root.querySelector("[data-storyboard-3d-home-action=\"generate-project\"]");
    if (_0x54be34) {
      _0x54be34.disabled = !_0x30ec57 || this.isGenerating;
    }
    const _0x362e28 = this.root.querySelector("[data-storyboard-3d-generate-label]");
    if (_0x362e28) {
      _0x362e28.textContent = this.isGenerating ? this.generationStatus || "正在创建 3D 场景" : "生成 3D 场景";
    }
    const _0x436799 = this.root.querySelector(".storyboard-3d-home-composer");
    _0x436799?.classList.toggle("is-generating", this.isGenerating);
    _0x436799?.setAttribute("aria-busy", this.isGenerating ? "true" : "false");
    const _0x50c2f0 = this.root.querySelector("[data-storyboard-3d-generation-loading]");
    if (_0x50c2f0) {
      _0x50c2f0.hidden = !this.isGenerating;
    }
    const _0x155b81 = this.root.querySelector("[data-storyboard-3d-generation-loading-label]");
    if (_0x155b81) {
      _0x155b81.textContent = this.generationStatus || "正在创建 3D 场景";
    }
    const _0xb5cad9 = this.root.querySelector("[data-storyboard-3d-generation-error]");
    if (_0xb5cad9) {
      _0xb5cad9.hidden = !this.generationError;
      _0xb5cad9.textContent = this.generationError;
    }
    const _0x76e1e3 = this.root.querySelector("[data-storyboard-3d-prompt-count]");
    if (_0x76e1e3) {
      _0x76e1e3.textContent = this.prompt.length + " / " + STORYBOARD_3D_PROMPT_MAX_CHARACTERS;
    }
  }
  async _generateProject() {
    if (this.isGenerating) {
      return null;
    }
    if (!isStoryboard3DModelPackReady(this.modelPackStatus)) {
      this.generationError = "请先下载 3D 场景基础模型包。";
      this.modelPackDialogOpen = true;
      this.render();
      return null;
    }
    const _0x4a23b6 = normalizeText(this.prompt);
    if (!_0x4a23b6) {
      this.generationError = "请先描述要搭建的 3D 场景。";
      this._syncGenerationUi();
      return null;
    }
    if (typeof this.onGenerateProject !== "function") {
      this.generationError = "3D 场景生成功能尚未初始化。";
      this._syncGenerationUi();
      return null;
    }
    this.isGenerating = true;
    this.generationStatus = "正在规划场景、物体与镜头";
    this.generationError = "";
    this._syncGenerationUi();
    try {
      const _0x7b07e2 = await this.onGenerateProject({
        prompt: _0x4a23b6,
        model: this.modelId,
        provider: this.provider,
        assets: this.modelPackStatus.assets,
        inputImageUrls: this.referenceImageUrl ? [this.referenceImageUrl] : [],
        onProgress: ({
          message: _0x382013
        } = {}) => {
          this.generationStatus = normalizeText(_0x382013) || "正在创建 3D 场景";
          this._syncGenerationUi();
        }
      });
      this.isGenerating = false;
      this.generationStatus = "";
      this.onNotify?.("3D 场景项目创建完成。", "success");
      this._syncGenerationUi();
      return _0x7b07e2;
    } catch (_0x343326) {
      this.isGenerating = false;
      this.generationStatus = "";
      this.generationError = normalizeText(_0x343326?.message) || "3D 场景创建失败，请稍后重试。";
      this.onNotify?.(this.generationError, "error");
      this._syncGenerationUi();
      return null;
    }
  }
  _applySearch() {
    if (!this.root) {
      return;
    }
    const _0x428f17 = normalizeSearchText(this.searchQuery);
    let _0x38d83f = 0;
    this.root.querySelectorAll("[data-storyboard-3d-project-search]").forEach(_0x50d0e9 => {
      const _0x1f56f3 = _0x50d0e9.getAttribute("data-storyboard-3d-project-search") || "";
      const _0x526af4 = !_0x428f17 || _0x1f56f3.includes(_0x428f17);
      _0x50d0e9.hidden = !_0x526af4;
      if (_0x526af4) {
        _0x38d83f += 1;
      }
    });
    const _0x5ca4ef = this.root.querySelector("[data-storyboard-3d-search-empty]");
    if (_0x5ca4ef) {
      _0x5ca4ef.hidden = _0x38d83f > 0 || !_0x428f17;
    }
  }
  _findProject(_0x55d278) {
    const _0x2dcaae = normalizeText(_0x55d278);
    return this._readProjects().find(_0x28a1d2 => _0x28a1d2.projectId === _0x2dcaae) || null;
  }
  _cloneProject(_0x1eed19) {
    const _0x2a49e5 = this._findProject(_0x1eed19);
    if (!_0x2a49e5) {
      return false;
    }
    try {
      const _0x52e834 = this.onCloneProject?.(_0x2a49e5.projectId);
      if (!_0x52e834) {
        this.onNotify?.("克隆项目失败。", "error");
        return false;
      }
      this.onNotify?.("已克隆：" + _0x2a49e5.title, "success");
      this.render();
      return _0x52e834;
    } catch (_0x308526) {
      this.onNotify?.(_0x308526?.message || "克隆项目失败。", "error");
      return false;
    }
  }
  _startProjectRename(_0x128eea) {
    const _0x4033c5 = this._findProject(_0x128eea);
    if (!_0x4033c5) {
      return false;
    }
    this.openProjectMenuId = "";
    this.confirmingDeleteProjectId = "";
    this.editingProjectId = _0x4033c5.projectId;
    this.editingProjectName = _0x4033c5.title;
    this.render();
    return true;
  }
  _commitProjectRename({
    render = true
  } = {}) {
    const _0x2c9a8d = this.editingProjectId;
    const _0x255845 = this._findProject(_0x2c9a8d);
    const _0x3fb942 = normalizeText(this.editingProjectName).slice(0, 120);
    if (!_0x255845) {
      this._cancelProjectRename({
        render: render
      });
      return false;
    }
    if (!_0x3fb942) {
      this.onNotify?.("项目名称不能为空。", "error");
      if (render) {
        this.render();
      }
      return false;
    }
    if (_0x3fb942 === _0x255845.title) {
      this._cancelProjectRename({
        render: render
      });
      return _0x255845;
    }
    try {
      const _0x367be8 = this.onRenameProject?.(_0x2c9a8d, _0x3fb942);
      if (!_0x367be8) {
        this.onNotify?.("重命名项目失败。", "error");
        if (render) {
          this.render();
        }
        return false;
      }
      this.editingProjectId = "";
      this.editingProjectName = "";
      this.onNotify?.("已重命名：" + _0x3fb942, "success");
      if (render) {
        this.render();
      }
      return _0x367be8;
    } catch (_0x243dd1) {
      this.onNotify?.(_0x243dd1?.message || "重命名项目失败。", "error");
      if (render) {
        this.render();
      }
      return false;
    }
  }
  _cancelProjectRename({
    render = true
  } = {}) {
    const _0xb73d27 = Boolean(this.editingProjectId);
    this.editingProjectId = "";
    this.editingProjectName = "";
    if (render && _0xb73d27) {
      this.render();
    }
    return _0xb73d27;
  }
  _closeProjectMenu() {
    if (!this.openProjectMenuId) {
      return false;
    }
    this.openProjectMenuId = "";
    this.root?.querySelectorAll(".storyboard-3d-home-project-card.is-menu-open").forEach(_0x3225c0 => _0x3225c0.classList.remove("is-menu-open"));
    this.root?.querySelectorAll(".storyboard-3d-home-project-menu:not([hidden])").forEach(_0x926288 => {
      _0x926288.hidden = true;
    });
    this.root?.querySelectorAll("[data-storyboard-3d-home-action=\"toggle-project-menu\"]").forEach(_0x3748a3 => _0x3748a3.setAttribute("aria-expanded", "false"));
    return true;
  }
  _deleteProject(_0x39f202) {
    const _0x10a4ee = this._findProject(_0x39f202);
    if (!_0x10a4ee || this.confirmingDeleteProjectId !== _0x10a4ee.projectId) {
      return false;
    }
    try {
      const _0x1effea = this.onDeleteProject?.(_0x10a4ee.projectId);
      if (!_0x1effea) {
        this.onNotify?.("删除项目失败。", "error");
        this.render();
        return false;
      }
      this.confirmingDeleteProjectId = "";
      this.onNotify?.("已删除：" + _0x10a4ee.title, "success");
      this.render();
      return true;
    } catch (_0x30e801) {
      this.onNotify?.(_0x30e801?.message || "删除项目失败。", "error");
      this.render();
      return false;
    }
  }
  _startProjectDelete(_0x399a9c) {
    const _0x31974d = this._findProject(_0x399a9c);
    if (!_0x31974d) {
      return false;
    }
    this.openProjectMenuId = "";
    this._cancelProjectRename({
      render: false
    });
    this.confirmingDeleteProjectId = _0x31974d.projectId;
    this.render();
    [...(this.root?.querySelectorAll("[data-storyboard-3d-home-action=\"confirm-project-delete\"]") || [])].find(_0x296bf6 => _0x296bf6.getAttribute("data-storyboard-3d-project-id") === _0x31974d.projectId)?.focus?.();
    return true;
  }
  _cancelProjectDelete({
    render = true,
    focusProjectId = ""
  } = {}) {
    const _0x109ef3 = this.confirmingDeleteProjectId || normalizeText(focusProjectId);
    const _0x339440 = Boolean(this.confirmingDeleteProjectId);
    this.confirmingDeleteProjectId = "";
    if (render && _0x339440) {
      this.render();
    }
    if (render && _0x109ef3) {
      [...(this.root?.querySelectorAll("[data-storyboard-3d-home-action=\"toggle-project-menu\"]") || [])].find(_0x3cfd1d => _0x3cfd1d.getAttribute("data-storyboard-3d-project-id") === _0x109ef3)?.focus?.();
    }
    return _0x339440;
  }
  _handleClick(_0x37e8f1) {
    const _0x59e42c = _0x37e8f1.target.closest("[data-storyboard-3d-home-action]");
    if (!_0x59e42c || !this.root?.contains(_0x59e42c)) {
      this._closeProjectMenu();
      return;
    }
    const _0x183694 = _0x59e42c.getAttribute("data-storyboard-3d-home-action");
    const _0x48b9e0 = _0x59e42c.getAttribute("data-storyboard-3d-project-id") || "";
    if (_0x183694 === "toggle-project-menu") {
      this._cancelProjectDelete({
        render: false
      });
      this.openProjectMenuId = this.openProjectMenuId === _0x48b9e0 ? "" : _0x48b9e0;
      this._cancelProjectRename({
        render: false
      });
      this.render();
      if (this.openProjectMenuId) {
        [...(this.root?.querySelectorAll("[data-storyboard-3d-home-action=\"clone-project\"]") || [])].find(_0x1c119c => _0x1c119c.getAttribute("data-storyboard-3d-project-id") === _0x48b9e0)?.focus?.();
      }
      return;
    }
    if (_0x183694 === "clone-project") {
      this.openProjectMenuId = "";
      this._cloneProject(_0x48b9e0);
      return;
    }
    if (_0x183694 === "start-project-rename") {
      this._startProjectRename(_0x48b9e0);
      return;
    }
    if (_0x183694 === "delete-project") {
      this._startProjectDelete(_0x48b9e0);
      return;
    }
    if (_0x183694 === "confirm-project-delete") {
      if (this.confirmingDeleteProjectId === _0x48b9e0) {
        this._deleteProject(_0x48b9e0);
      }
      return;
    }
    if (_0x183694 === "cancel-project-delete") {
      this._cancelProjectDelete({
        focusProjectId: _0x48b9e0
      });
      return;
    }
    this._closeProjectMenu();
    if (_0x183694 === "choose-reference-image") {
      this.root?.querySelector("[data-storyboard-3d-reference-image-input]")?.click();
      return;
    }
    if (_0x183694 === "remove-reference-image") {
      this._clearReferenceImage();
      this.render();
      return;
    }
    if (_0x183694 === "install-model-pack") {
      this._installModelPack();
      return;
    }
    if (_0x183694 === "skip-model-pack") {
      this.modelPackDialogOpen = false;
      this.generationError = "未下载模型包，暂时不能生成 3D 场景。";
      this.render();
      return;
    }
    if (_0x183694 === "generate-project") {
      this._generateProject();
      return;
    }
    if (_0x183694 === "new-project") {
      this.onCreateProject?.();
      return;
    }
    if (_0x183694 === "open-project") {
      this.onOpenProject?.(_0x48b9e0);
    }
  }
  _handleInput(_0x1ce02c) {
    if (_0x1ce02c.target.matches("[data-storyboard-3d-project-rename-input]")) {
      this.editingProjectName = String(_0x1ce02c.target.value || "").slice(0, 120);
      return;
    }
    if (_0x1ce02c.target.matches("[data-storyboard-3d-prompt-input]")) {
      this.prompt = String(_0x1ce02c.target.value || "").slice(0, STORYBOARD_3D_PROMPT_MAX_CHARACTERS);
      this.generationError = "";
      this._syncGenerationUi();
      return;
    }
    if (!_0x1ce02c.target.matches("[data-storyboard-3d-project-search-input]")) {
      return;
    }
    this.searchQuery = String(_0x1ce02c.target.value || "");
    this._applySearch();
  }
  _handleChange(_0x4b062e) {
    if (_0x4b062e.target.matches("[data-storyboard-3d-project-rename-input]")) {
      this._commitProjectRename({
        render: false
      });
      this.setTimeoutFn?.(() => {
        if (!this._destroyed) {
          this.render();
        }
      }, 0);
      return;
    }
    if (!_0x4b062e.target.matches("[data-storyboard-3d-reference-image-input]")) {
      return;
    }
    const _0x45e1f6 = _0x4b062e.target.files?.[0] || null;
    _0x4b062e.target.value = "";
    if (!_0x45e1f6) {
      return;
    }
    if (!String(_0x45e1f6.type || "").toLowerCase().startsWith("image/")) {
      this.generationError = "参考图必须是图片文件。";
      this._syncGenerationUi();
      return;
    }
    this._clearReferenceImage();
    this.referenceImageUrl = this.urlApi?.createObjectURL?.(_0x45e1f6) || "";
    this.referenceImageName = String(_0x45e1f6.name || "参考图");
    if (!this.referenceImageUrl) {
      this.generationError = "无法读取参考图，请重新选择。";
    }
    this.render();
  }
  _clearReferenceImage() {
    if (this.referenceImageUrl) {
      this.urlApi?.revokeObjectURL?.(this.referenceImageUrl);
    }
    this.referenceImageUrl = "";
    this.referenceImageName = "";
  }
  async _refreshModelPackStatus({
    promptIfMissing = false
  } = {}) {
    if (promptIfMissing) {
      this._promptForMissingModelPack = true;
    }
    if (this.modelPackStatus.state === "installing") {
      return this.modelPackStatus;
    }
    if (this._modelPackCheckPromise) {
      return this._modelPackCheckPromise;
    }
    if (typeof this.modelPackApi?.getStatus !== "function") {
      this.modelPackStatus = {
        state: "error",
        installed: false,
        assets: [],
        error: "模型包服务尚未初始化。"
      };
      if (this._promptForMissingModelPack) {
        this.modelPackDialogOpen = true;
      }
      this.render();
      return this.modelPackStatus;
    }
    this.modelPackStatus = {
      ...this.modelPackStatus,
      state: "checking",
      error: ""
    };
    this._syncGenerationUi();
    const _0x1428e8 = Promise.resolve(this.modelPackApi.getStatus()).then(_0x187fd4 => {
      const _0x1212eb = Array.isArray(_0x187fd4?.assets) ? _0x187fd4.assets : [];
      const _0x2bb50e = _0x187fd4?.installed === true && _0x1212eb.length > 0;
      this.modelPackStatus = {
        ..._0x187fd4,
        state: _0x2bb50e ? "installed" : "missing",
        installed: _0x2bb50e,
        assets: _0x1212eb,
        error: ""
      };
      this.modelPackDialogOpen = !_0x2bb50e && this._promptForMissingModelPack;
      this.render();
      return this.modelPackStatus;
    }).catch(_0x1a15ad => {
      this.modelPackStatus = {
        state: "error",
        installed: false,
        assets: [],
        error: normalizeText(_0x1a15ad?.message) || "无法检测模型包状态。"
      };
      if (this._promptForMissingModelPack) {
        this.modelPackDialogOpen = true;
      }
      this.render();
      return this.modelPackStatus;
    }).finally(() => {
      this._modelPackCheckPromise = null;
    });
    this._modelPackCheckPromise = _0x1428e8;
    return _0x1428e8;
  }
  async _installModelPack() {
    if (this.modelPackStatus.state === "installing") {
      return null;
    }
    if (typeof this.modelPackApi?.install !== "function") {
      this.modelPackStatus = {
        ...this.modelPackStatus,
        error: "模型包下载服务尚未初始化。"
      };
      this.render();
      return null;
    }
    this.modelPackDialogOpen = true;
    this.modelPackStatus = {
      ...this.modelPackStatus,
      state: "installing",
      installed: false,
      error: "",
      installProgress: {
        state: "downloading",
        downloadedBytes: 0,
        totalBytes: Math.max(0, Number(this.modelPackStatus.downloadBytes) || 0),
        percent: 0,
        currentSource: "",
        completedSources: 0,
        totalSources: 0,
        message: "正在连接模型包下载源"
      }
    };
    this.render();
    try {
      const _0x495b2c = this.modelPackApi.install();
      this._startModelPackProgressPolling();
      const _0x5614e5 = await _0x495b2c;
      const _0x15c62c = Array.isArray(_0x5614e5?.assets) ? _0x5614e5.assets : [];
      if (_0x5614e5?.installed !== true || _0x15c62c.length === 0) {
        throw new Error("模型包下载未完成，请重试。");
      }
      this._stopModelPackProgressPolling();
      this.modelPackStatus = {
        ..._0x5614e5,
        state: "installed",
        installed: true,
        assets: _0x15c62c,
        error: ""
      };
      this.modelPackDialogOpen = false;
      this.generationError = "";
      this.onNotify?.("3D 场景基础模型包下载完成。", "success");
      this.render();
      return this.modelPackStatus;
    } catch (_0x2b775a) {
      this._stopModelPackProgressPolling();
      try {
        const _0x372e07 = await this.modelPackApi.getStatus?.();
        const _0x2e7e1e = Array.isArray(_0x372e07?.assets) ? _0x372e07.assets : [];
        if (_0x372e07?.installed === true && _0x2e7e1e.length > 0) {
          this.modelPackStatus = {
            ..._0x372e07,
            state: "installed",
            installed: true,
            assets: _0x2e7e1e,
            error: ""
          };
          this.modelPackDialogOpen = false;
          this.generationError = "";
          this.onNotify?.("3D 场景基础模型包下载完成。", "success");
          this.render();
          return this.modelPackStatus;
        }
      } catch {}
      this.modelPackStatus = {
        state: "error",
        installed: false,
        assets: [],
        error: normalizeText(_0x2b775a?.message) || "模型包下载失败，请稍后重试。"
      };
      this.modelPackDialogOpen = true;
      this.render();
      return null;
    }
  }
  _startModelPackProgressPolling() {
    this._stopModelPackProgressPolling();
    if (typeof this.modelPackApi?.getStatus !== "function") {
      return;
    }
    const _0x1f1e8c = ++this._modelPackProgressPollGeneration;
    const _0x511872 = async () => {
      if (this._destroyed || _0x1f1e8c !== this._modelPackProgressPollGeneration || this.modelPackStatus.state !== "installing") {
        return;
      }
      try {
        const _0x4a1278 = await this.modelPackApi.getStatus();
        if (this._destroyed || _0x1f1e8c !== this._modelPackProgressPollGeneration || this.modelPackStatus.state !== "installing") {
          return;
        }
        this.modelPackStatus = {
          ...this.modelPackStatus,
          ..._0x4a1278,
          state: "installing",
          installed: false,
          assets: this.modelPackStatus.assets,
          error: ""
        };
        this.render();
      } catch {}
      if (this._destroyed || _0x1f1e8c !== this._modelPackProgressPollGeneration || this.modelPackStatus.state !== "installing") {
        return;
      }
      this._modelPackProgressTimer = this.setTimeoutFn?.(_0x511872, this.modelPackProgressPollIntervalMs);
    };
    _0x511872();
  }
  _stopModelPackProgressPolling() {
    this._modelPackProgressPollGeneration += 1;
    if (this._modelPackProgressTimer !== null) {
      this.clearTimeoutFn?.(this._modelPackProgressTimer);
      this._modelPackProgressTimer = null;
    }
  }
  _handleKeyDown(_0xed6277) {
    if (_0xed6277.key === "Escape" && this.confirmingDeleteProjectId) {
      _0xed6277.preventDefault();
      this._cancelProjectDelete();
      return;
    }
    if (_0xed6277.target.matches("[data-storyboard-3d-project-rename-input]")) {
      if (_0xed6277.isComposing) {
        return;
      }
      if (_0xed6277.key === "Enter") {
        _0xed6277.preventDefault();
        this.editingProjectName = String(_0xed6277.target.value || "").slice(0, 120);
        this._commitProjectRename();
      } else if (_0xed6277.key === "Escape") {
        _0xed6277.preventDefault();
        this._cancelProjectRename();
      }
      return;
    }
    if (!_0xed6277.target.matches("[data-storyboard-3d-prompt-input]")) {
      return;
    }
    if (_0xed6277.isComposing || _0xed6277.key !== "Enter" || !_0xed6277.ctrlKey && !_0xed6277.metaKey) {
      return;
    }
    _0xed6277.preventDefault();
    this._generateProject();
  }
  show() {
    this.mount();
    if (!this.root) {
      return null;
    }
    this.render();
    this.root.hidden = false;
    this.root.setAttribute("aria-hidden", "false");
    this._refreshModelPackStatus({
      promptIfMissing: true
    });
    return this;
  }
  hide() {
    if (!this.root) {
      return false;
    }
    this.openProjectMenuId = "";
    this.editingProjectId = "";
    this.editingProjectName = "";
    this.confirmingDeleteProjectId = "";
    this.root.hidden = true;
    this.root.setAttribute("aria-hidden", "true");
    return true;
  }
  isVisible() {
    return Boolean(this.root && !this.root.hidden);
  }
  focusProject(_0x7dd53e) {
    const _0x3994c6 = String(_0x7dd53e || "").trim();
    if (!_0x3994c6 || !this.root || this.root.hidden) {
      return false;
    }
    const _0x473e9 = [...this.root.querySelectorAll(".storyboard-3d-home-project-details[data-storyboard-3d-home-action=\"open-project\"]")].find(_0x5e4720 => _0x5e4720.getAttribute("data-storyboard-3d-project-id") === _0x3994c6);
    if (!_0x473e9 || typeof _0x473e9.focus !== "function") {
      return false;
    }
    _0x473e9.focus({
      preventScroll: true
    });
    return true;
  }
  destroy() {
    this._destroyed = true;
    this._stopModelPackProgressPolling();
    if (!this.root) {
      return;
    }
    this.root.removeEventListener("contextmenu", containWorkspaceContextMenu);
    this.root.removeEventListener("click", this._handleClick);
    this.root.removeEventListener("input", this._handleInput);
    this.root.removeEventListener("change", this._handleChange);
    this.root.removeEventListener("keydown", this._handleKeyDown);
    this._modelSelectorController?.destroy?.();
    this._modelSelectorController = null;
    this._clearReferenceImage();
    this.root.remove();
    this.root = null;
  }
}
export function initStoryboard3DWorkspaceHome(_0x4a2516 = {}) {
  const _0x23a9d8 = new Storyboard3DWorkspaceHome(_0x4a2516);
  _0x23a9d8.mount();
  return _0x23a9d8;
}