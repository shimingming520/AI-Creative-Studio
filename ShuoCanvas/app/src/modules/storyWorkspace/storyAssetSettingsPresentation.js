import { renderAudioPlaybackSurface } from "../../components/audio-node/audioPlaybackSurface.js";
import { renderWorkspaceCardDeleteControl } from "../workspaceAssetPresentation.js";
import { renderStoryGenerationSpinner } from "./storyAsyncButtonPresentation.js";
function escapeHtml(_0x331eb3) {
  return String(_0x331eb3 ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll("\"", "&quot;").replaceAll("'", "&#39;");
}
function normalizeText(_0x26296d) {
  return String(_0x26296d ?? "").trim();
}
function emptyRenderer() {
  return "";
}
export function createStoryAssetSettingsPresentation({
  renderAddToLibraryIcon = emptyRenderer,
  renderDeleteIcon = emptyRenderer,
  renderDownloadButton = emptyRenderer,
  renderHomeParamChevron = emptyRenderer,
  renderImage = emptyRenderer,
  renderImageModelSelector = emptyRenderer,
  renderLoadingOverlay = emptyRenderer,
  renderPromptMentions = _0x86c848 => escapeHtml(_0x86c848),
  renderSelectionActions = ({
    primaryActionHtml = ""
  } = {}) => primaryActionHtml,
  renderTabIcon = emptyRenderer,
  renderUploadIcon = emptyRenderer,
  renderVoiceFooter = emptyRenderer
} = {}) {
  function _0x49c0f8(_0x22c486 = {}, {
    canRename = false
  } = {}) {
    const _0x23ed9f = normalizeText(_0x22c486.name) || "未命名素材";
    const _0x2237f7 = canRename ? " data-story-asset-name-id=\"" + escapeHtml(_0x22c486.id) + "\" aria-label=\"重命名" + escapeHtml(_0x23ed9f) + "\"" : "";
    return "<strong" + _0x2237f7 + ">" + escapeHtml(_0x23ed9f) + "</strong>";
  }
  function _0x1d016a(_0x37459f = {}) {
    const _0x47d66e = "<button type=\"button\" class=\"story-asset-card " + (_0x37459f.isCurrent && !_0x37459f.isSelectionMode ? "is-selected" : "") + " " + (_0x37459f.isSelectionMode ? "is-selection-mode" : "") + " " + (_0x37459f.isChecked ? "is-checked" : "") + (_0x37459f.cardClassName ? " " + escapeHtml(_0x37459f.cardClassName) : "") + "\" data-story-asset-id=\"" + escapeHtml(_0x37459f.id) + "\" data-story-marquee-item data-story-marquee-id=\"" + escapeHtml(_0x37459f.id) + "\" data-story-appearance-count=\"" + Math.max(0, Number(_0x37459f.appearanceCount) || 0) + "\" aria-pressed=\"" + (_0x37459f.isSelectionMode ? String(Boolean(_0x37459f.isChecked)) : "false") + "\"" + (_0x37459f.draggable ? " draggable=\"true\"" : "") + (_0x37459f.cardAttributes ? " " + _0x37459f.cardAttributes : "") + ">\n    " + (_0x37459f.isSelectionMode ? "<span class=\"story-asset-select-indicator\" aria-hidden=\"true\">" + (_0x37459f.isChecked ? "✓" : "") + "</span>" : "") + "\n    <span class=\"story-asset-card-media " + (_0x37459f.isLoading ? "img-preview-loading" : "") + "\" aria-busy=\"" + Boolean(_0x37459f.isLoading) + "\">\n      " + (_0x37459f.cardMediaHtml || renderImage({
      imageUrl: _0x37459f.preview?.imageUrl,
      fallbackImageUrl: _0x37459f.fallbackImageUrl,
      workspaceAssetLibraryImage: _0x37459f.workspaceAssetLibraryImage,
      alt: "" + _0x37459f.name + (_0x37459f.preview?.name ? " · " + _0x37459f.preview.name : ""),
      className: "story-asset-card-image"
    })) + "\n      " + (_0x37459f.isLoading ? renderLoadingOverlay({
      compact: true
    }) : "") + "\n    </span>\n    <span class=\"story-asset-card-copy\">\n      <span class=\"story-asset-card-heading\">" + _0x49c0f8(_0x37459f, {
      canRename: _0x37459f.canRename
    }) + (_0x37459f.showRoleTag ? "<small>" + escapeHtml(_0x37459f.role || "素材") + "</small>" : "") + "</span>\n      <span class=\"story-asset-card-status\">" + (_0x37459f.cardStatusHtml || (_0x37459f.statusText ? "<span>" + escapeHtml(_0x37459f.statusText) + "</span>" : _0x37459f.stats?.total > 1 ? "<span>形象 " + _0x37459f.stats.generated + "/" + _0x37459f.stats.total + "</span>" : "")) + (_0x37459f.stats?.failed ? "<b>生成失败 " + _0x37459f.stats.failed + "</b>" : "") + "</span>\n      " + (_0x37459f.cardMetaHtml || "") + "\n      <p>" + escapeHtml(_0x37459f.promptPreview || "") + "</p>\n    </span>\n  </button>";
    const _0x1f3fde = _0x37459f.canDelete ? renderWorkspaceCardDeleteControl({
      className: "story-asset-card-delete-trigger",
      ariaLabel: "删除" + (normalizeText(_0x37459f.kind).toLowerCase() === "scene" ? "场景" : "人物") + " " + _0x37459f.name,
      actionAttributes: {
        "data-story-action": "delete-asset-card",
        "data-story-asset-delete-id": _0x37459f.id
      },
      disabled: _0x37459f.isLoading
    }) : "";
    if (!_0x1f3fde && !_0x37459f.accessoryHtml) {
      return _0x47d66e;
    }
    return "<span class=\"story-asset-card-shell" + (_0x37459f.shellClassName ? " " + escapeHtml(_0x37459f.shellClassName) : "") + "\">\n    " + _0x47d66e + "\n    " + _0x1f3fde + (_0x37459f.accessoryHtml || "") + "\n  </span>";
  }
  function _0x15e70b(_0x1d103c) {
    if (_0x1d103c === "previous") {
      return "<button type=\"button\" class=\"story-appearance-arrow story-appearance-arrow--previous\" data-story-action=\"previous-appearance\" aria-label=\"上一个形象\"><svg class=\"story-appearance-arrow-icon\" viewBox=\"0 0 24 24\" fill=\"none\" aria-hidden=\"true\"><path d=\"m14.5 6.5-5.5 5.5 5.5 5.5\"/></svg></button>";
    }
    return "<button type=\"button\" class=\"story-appearance-arrow story-appearance-arrow--next\" data-story-action=\"next-appearance\" aria-label=\"下一个形象\"><svg class=\"story-appearance-arrow-icon\" viewBox=\"0 0 24 24\" fill=\"none\" aria-hidden=\"true\"><path d=\"m9.5 6.5 5.5 5.5-5.5 5.5\"/></svg></button>";
  }
  function _0x4a7e90() {
    return "<svg viewBox=\"0 0 24 24\" fill=\"none\" aria-hidden=\"true\"><rect x=\"4\" y=\"5\" width=\"16\" height=\"14\" rx=\"2.5\"/><circle cx=\"9\" cy=\"10\" r=\"1.5\"/><path d=\"m6.5 16 3.5-3.5 2.6 2.6 1.8-1.8 3.1 2.7\"/></svg>";
  }
  function _0x4d3027(_0x25511f = {}) {
    const _0xc93b89 = normalizeText(_0x25511f.referenceImageUrl);
    return "<span class=\"story-asset-style-reference-control " + (_0xc93b89 ? "has-reference" : "") + "\">\n    <button type=\"button\" class=\"story-character-voice-capsule story-asset-style-reference-capsule " + (_0xc93b89 ? "has-reference" : "") + "\" data-story-action=\"upload-asset-reference\" aria-label=\"" + (_0xc93b89 ? "替换风格参考" : "上传风格参考") + "\" " + (_0x25511f.disabled ? "disabled" : "") + ">\n      <span class=\"story-character-voice-icon\">" + (_0xc93b89 ? "<img src=\"" + escapeHtml(_0xc93b89) + "\" alt=\"\">" : _0x4a7e90()) + "</span>\n      <span>风格参考</span>\n    </button>\n    " + (_0xc93b89 ? "<span class=\"story-asset-style-reference-preview\" aria-hidden=\"true\"><img src=\"" + escapeHtml(_0xc93b89) + "\" alt=\"\"></span>" : "") + "\n    " + (_0xc93b89 ? "<button type=\"button\" class=\"story-asset-style-reference-remove\" data-story-action=\"remove-asset-reference\" aria-label=\"删除风格参考\" " + (_0x25511f.disabled ? "disabled" : "") + ">&times;</button>" : "") + "\n  </span>";
  }
  function _0x412779(_0x1b3232 = {}) {
    if (!_0x1b3232.visible) {
      return "";
    }
    return "<div class=\"story-home-param-picker story-asset-preset-picker\">\n    <button type=\"button\" class=\"story-home-param-trigger story-menu-trigger story-asset-preset-trigger\" data-story-home-param-trigger=\"asset-preset\" aria-haspopup=\"listbox\" aria-expanded=\"false\" " + (_0x1b3232.disabled ? "disabled" : "") + ">\n      <span>预设：" + escapeHtml(_0x1b3232.selectedLabel) + "</span>\n      " + renderHomeParamChevron() + "\n    </button>\n    <div class=\"story-home-param-popover story-asset-preset-popover\" role=\"listbox\" aria-label=\"" + escapeHtml(_0x1b3232.label) + "\">\n      <strong>" + escapeHtml(_0x1b3232.label) + "</strong>\n      <div class=\"story-asset-preset-options\">\n        " + (Array.isArray(_0x1b3232.options) ? _0x1b3232.options : []).map(_0x484270 => "<button type=\"button\" class=\"story-asset-preset-option floating-menu-item has-subtitle " + (_0x484270.id === _0x1b3232.selectedId ? "active is-selected" : "") + "\" data-story-asset-preset-option=\"" + escapeHtml(_0x484270.id) + "\" data-story-asset-preset-kind=\"" + escapeHtml(_0x1b3232.assetKind) + "\" role=\"option\" aria-selected=\"" + (_0x484270.id === _0x1b3232.selectedId) + "\"><span class=\"fmi-content\"><span class=\"fmi-title\">" + escapeHtml(_0x484270.label) + "</span><small class=\"fmi-sub\">" + escapeHtml(_0x484270.description) + "</small></span></button>").join("") + "\n      </div>\n    </div>\n  </div>";
  }
  function _0x5199bd(_0x1babaf = false) {
    if (_0x1babaf) {
      return "<svg viewBox=\"0 0 24 24\" fill=\"none\" aria-hidden=\"true\"><path d=\"M8 6.5v11l9-5.5-9-5.5Z\"/></svg>";
    }
    return "<svg viewBox=\"0 0 24 24\" fill=\"none\" aria-hidden=\"true\"><path d=\"M12 4v16M8.5 7.5v9M15.5 8.5v7M5 10v4M19 10v4\"/></svg>";
  }
  function _0x2be83f() {
    return "<svg viewBox=\"0 0 24 24\" fill=\"none\" aria-hidden=\"true\"><path d=\"M4 7V3m0 4h4\"/><path d=\"M5.4 6.2A8 8 0 1 1 4 12\"/><path d=\"M12 8v4l2.8 1.8\"/></svg>";
  }
  function _0x4b3058(_0x1e54c5 = {}) {
    if (!_0x1e54c5.visible) {
      return "";
    }
    if (_0x1e54c5.uploadLabel) {
      return "<button type=\"button\" class=\"story-character-voice-capsule " + (_0x1e54c5.hasReference ? "has-reference" : "is-missing") + "\" data-story-character-voice-capsule data-story-action=\"upload-character-voice\" aria-label=\"" + escapeHtml(_0x1e54c5.uploadLabel) + "\">\n      <span class=\"story-character-voice-icon\">" + _0x5199bd(false) + "</span>\n      <span>" + escapeHtml(_0x1e54c5.uploadLabel) + "</span>\n    </button>";
    }
    const _0x3d145b = _0x1e54c5.isOpen ? "close-character-voice" : "open-character-voice";
    const _0x506910 = _0x1e54c5.isOpen ? "图片参考" : "声音参考";
    return "<button type=\"button\" class=\"story-character-voice-capsule " + (_0x1e54c5.hasReference ? "has-reference" : "is-missing") + " " + (_0x1e54c5.isOpen ? "is-active" : "") + "\" data-story-character-voice-capsule data-story-action=\"" + _0x3d145b + "\" aria-label=\"打开角色" + _0x506910 + "\" aria-pressed=\"" + Boolean(_0x1e54c5.isOpen) + "\">\n    <span class=\"story-character-voice-icon\">" + (_0x1e54c5.isOpen ? _0x4a7e90() : _0x5199bd(false)) + "</span>\n    <span>" + _0x506910 + "</span>\n  </button>";
  }
  function _0x3dbdf8(_0x29674a = {}) {
    if (!_0x29674a.visible) {
      return "";
    }
    return "<span class=\"story-character-voice-name-player\" data-story-character-voice-player=\"" + escapeHtml(_0x29674a.id) + "\">\n    <button type=\"button\" class=\"story-character-voice-name-play\" data-story-action=\"play-character-voice\" data-story-voice-asset-id=\"" + escapeHtml(_0x29674a.id) + "\" aria-label=\"播放 " + escapeHtml(_0x29674a.name) + " 的声音参考\">\n      <svg class=\"story-character-voice-name-play-icon\" viewBox=\"0 0 20 20\" aria-hidden=\"true\"><path d=\"M7 5.4v9.2l7.2-4.6L7 5.4Z\"/></svg>\n      <svg class=\"story-character-voice-name-pause-icon\" viewBox=\"0 0 20 20\" aria-hidden=\"true\"><path d=\"M6.5 5.5h2.3v9H6.5zM11.2 5.5h2.3v9h-2.3z\"/></svg>\n    </button>\n    <span class=\"story-character-voice-waveform\" data-story-character-voice-waveform hidden aria-hidden=\"true\">" + Array.from({
      length: 12
    }, () => "<i></i>").join("") + "</span>\n  </span>";
  }
  function _0x3c2a0c(_0x2a3744) {
    if (_0x2a3744 === "image") {
      return "<svg viewBox=\"0 0 20 20\" fill=\"none\" aria-hidden=\"true\"><rect x=\"2.5\" y=\"3\" width=\"15\" height=\"14\" rx=\"2.2\"/><circle cx=\"7\" cy=\"7.5\" r=\"1.3\"/><path d=\"m4.5 14 3.4-3.4 2.7 2.7 1.8-1.8 3.1 2.5\"/></svg>";
    }
    if (_0x2a3744 === "voice") {
      return "<svg viewBox=\"0 0 20 20\" fill=\"none\" aria-hidden=\"true\"><path d=\"M3 10h1.5m2-3.5v7m3-10v13m3-9v5m3-7v9M18 10h-1.5\"/></svg>";
    }
    return "<svg viewBox=\"0 0 20 20\" fill=\"none\" aria-hidden=\"true\"><rect x=\"2.5\" y=\"3\" width=\"6\" height=\"6\" rx=\"1.2\"/><rect x=\"11.5\" y=\"3\" width=\"6\" height=\"6\" rx=\"1.2\"/><rect x=\"2.5\" y=\"12\" width=\"6\" height=\"5\" rx=\"1.2\"/><rect x=\"11.5\" y=\"12\" width=\"6\" height=\"5\" rx=\"1.2\"/></svg>";
  }
  function _0x2bc224(_0x1c12a6 = {}) {
    const _0xa2db2d = normalizeText(_0x1c12a6.directMode);
    const _0x361bf8 = normalizeText(_0x1c12a6.action) || "batch-generate-assets";
    const _0x36ddf2 = _0x1c12a6.isCancellation ? "aria-label=\"取消尚未开始的素材生成任务\"" : _0xa2db2d ? "data-story-asset-batch-direct-mode=\"" + escapeHtml(_0xa2db2d) + "\"" : "aria-haspopup=\"menu\" aria-expanded=\"false\"";
    const _0x100f4c = "<button type=\"button\" class=\"story-primary-button story-asset-batch-trigger\" data-story-action=\"" + escapeHtml(_0x361bf8) + "\" data-story-asset-batch-control " + _0x36ddf2 + " " + (_0x1c12a6.disabled ? "disabled" : "") + " aria-busy=\"" + Boolean(_0x1c12a6.busy) + "\">" + (_0x1c12a6.busy ? renderStoryGenerationSpinner({
      button: true
    }) : "") + "<span class=\"story-asset-batch-trigger-label\">" + escapeHtml(_0x1c12a6.label) + "</span></button>";
    if (_0x1c12a6.isCancellation) {
      return _0x100f4c;
    }
    if (_0xa2db2d) {
      return _0x100f4c;
    }
    return "<div class=\"story-asset-batch-menu-wrap\">\n    " + _0x100f4c + "\n    <div class=\"story-asset-batch-menu\" role=\"menu\" aria-label=\"选择批量生成内容\">\n      <button type=\"button\" role=\"menuitem\" data-story-asset-batch-mode=\"image\"><span class=\"story-asset-batch-mode-icon\">" + _0x3c2a0c("image") + "</span><span>仅图片</span></button>\n      <button type=\"button\" role=\"menuitem\" data-story-asset-batch-mode=\"voice\"><span class=\"story-asset-batch-mode-icon\">" + _0x3c2a0c("voice") + "</span><span>仅音频</span></button>\n      <button type=\"button\" role=\"menuitem\" data-story-asset-batch-mode=\"all\"><span class=\"story-asset-batch-mode-icon\">" + _0x3c2a0c("all") + "</span><span>全部</span></button>\n    </div>\n  </div>";
  }
  function _0x34de2e(_0x36f0e1 = {}) {
    if (!_0x36f0e1.isMultiSelection) {
      return "<button type=\"button\" class=\"story-asset-generate-button story-main-action-button\" data-story-action=\"generate-asset\" " + (_0x36f0e1.disabled ? "disabled" : "") + " aria-busy=\"" + Boolean(_0x36f0e1.busy) + "\">" + (_0x36f0e1.busy ? renderStoryGenerationSpinner({
        button: true
      }) : "") + "<span data-story-asset-generate-label>" + escapeHtml(_0x36f0e1.label || "生成素材图") + "</span></button>";
    }
    const _0x3dfecc = normalizeText(_0x36f0e1.action) || "batch-generate-assets";
    return "<button type=\"button\" class=\"story-asset-generate-button story-main-action-button story-asset-batch-trigger\" data-story-action=\"" + escapeHtml(_0x3dfecc) + "\" data-story-asset-batch-control " + (_0x36f0e1.isCancellation ? "aria-label=\"取消尚未开始的素材生成任务\"" : "data-story-asset-batch-direct-mode=\"image\"") + " " + (_0x36f0e1.disabled ? "disabled" : "") + " aria-busy=\"" + Boolean(_0x36f0e1.busy) + "\">" + (_0x36f0e1.busy ? renderStoryGenerationSpinner({
      button: true
    }) : "") + "<span class=\"story-asset-batch-trigger-label\">" + escapeHtml(_0x36f0e1.label) + "</span></button>";
  }
  function _0x12a2d4(_0x1b7a55 = {}) {
    return "<button type=\"button\" class=\"story-library-target-option\" role=\"option\" data-story-library-appearance-target=\"" + escapeHtml(_0x1b7a55.id) + "\" data-story-library-target-asset-kind=\"" + escapeHtml(_0x1b7a55.kind) + "\" aria-haspopup=\"menu\" aria-expanded=\"false\">\n    <span class=\"story-library-target-thumb\">" + renderImage({
      imageUrl: _0x1b7a55.preview?.imageUrl,
      alt: _0x1b7a55.name,
      className: "story-library-target-image"
    }) + "</span>\n    <span class=\"story-library-target-copy\"><strong>" + escapeHtml(_0x1b7a55.name) + "</strong><small>" + (_0x1b7a55.appearanceCount ? _0x1b7a55.appearanceCount + " 个形象" : "暂无形象") + "</small></span>\n  </button>";
  }
  function _0x3f9559(_0x1f47fd = {}, _0x4b1ddf = {}, _0x2ca665 = false) {
    const _0x33eb84 = normalizeText(_0x4b1ddf.name) || "未命名形象";
    return "<button type=\"button\" class=\"story-library-appearance-option\" role=\"menuitem\" data-story-library-target-asset-id=\"" + escapeHtml(_0x1f47fd.id) + "\" data-story-library-target-appearance-id=\"" + escapeHtml(_0x4b1ddf.id) + "\" " + (_0x2ca665 ? "disabled title=\"替换已有形象时只能选择一张图片\"" : "") + ">\n      <span class=\"story-library-appearance-thumb\">" + renderImage({
      imageUrl: _0x4b1ddf.imageUrl,
      alt: _0x1f47fd.name + " · " + _0x33eb84,
      className: "story-library-appearance-image"
    }) + "</span>\n      <span class=\"story-library-appearance-copy\"><strong>" + escapeHtml(_0x33eb84) + "</strong><small>替换此形象图片</small></span>\n    </button>";
  }
  function _0x17c11e(_0x22be76 = {}, _0x27d0a7 = 0) {
    const _0x4fba11 = Array.isArray(_0x22be76.appearances) ? _0x22be76.appearances : [];
    const _0xda9664 = _0x27d0a7 !== 1;
    return "<div class=\"story-library-appearance-popover\" data-story-library-appearance-menu=\"" + escapeHtml(_0x22be76.id) + "\" role=\"menu\" aria-label=\"选择" + escapeHtml(_0x22be76.name) + "的形象\" aria-hidden=\"true\">\n      <div class=\"story-library-target-heading\"><strong>" + escapeHtml(_0x22be76.name) + "的形象</strong><small>" + (_0xda9664 ? "选择一张图片后可替换已有形象" : "选择要替换的形象") + "</small></div>\n      <div class=\"story-library-appearance-list\">\n        " + _0x4fba11.map(_0x1f62c2 => _0x3f9559(_0x22be76, _0x1f62c2, _0xda9664)).join("") + "\n      </div>\n      <button type=\"button\" class=\"story-library-appearance-add\" role=\"menuitem\" data-story-library-target-asset-id=\"" + escapeHtml(_0x22be76.id) + "\" data-story-library-target-create-appearance=\"true\"><span aria-hidden=\"true\">＋</span><strong>新增形象</strong></button>\n    </div>";
  }
  function _0x4cff88(_0x23d67e = {}) {
    const _0xb8440a = Array.isArray(_0x23d67e.targetGroups) ? _0x23d67e.targetGroups : [];
    const _0x52b39f = Math.max(0, Math.trunc(Number(_0x23d67e.selectedCount) || 0));
    return "<div class=\"story-asset-batch-menu-wrap story-library-add-menu-wrap\">\n    <button type=\"button\" class=\"story-primary-button story-asset-batch-trigger\" data-story-action=\"add-library-assets-to-project\" aria-haspopup=\"menu\" aria-expanded=\"false\" " + (_0x52b39f ? "" : "disabled") + "><span class=\"story-asset-batch-trigger-label\">加入到项目" + (_0x23d67e.showCount && _0x52b39f ? " (" + _0x52b39f + ")" : "") + "</span></button>\n    <div class=\"story-asset-batch-menu story-library-add-menu\" role=\"menu\" aria-label=\"选择加入项目的素材分类\">\n      " + _0xb8440a.map(_0x3cb1e2 => "<button type=\"button\" role=\"menuitem\" data-story-library-target-kind=\"" + escapeHtml(_0x3cb1e2.kind) + "\" aria-haspopup=\"listbox\" aria-expanded=\"false\"><span class=\"story-asset-batch-mode-icon\">" + renderTabIcon(_0x3cb1e2.kind) + "</span><span>" + escapeHtml(_0x3cb1e2.label) + "</span></button>").join("") + "\n    </div>\n    " + _0xb8440a.map(_0x13f032 => "<div class=\"story-library-target-popover\" data-story-library-target-menu=\"" + escapeHtml(_0x13f032.kind) + "\" role=\"listbox\" aria-label=\"选择本剧" + escapeHtml(_0x13f032.label) + "\" aria-hidden=\"true\">\n      <div class=\"story-library-target-heading\"><strong>选择本剧" + escapeHtml(_0x13f032.label) + "</strong><small>悬停后选择已有形象或新增</small></div>\n      <div class=\"story-library-target-list\">\n        " + (_0x13f032.targets?.length ? _0x13f032.targets.map(_0x12a2d4).join("") : "<div class=\"story-library-target-empty\">本剧暂无可绑定的" + escapeHtml(_0x13f032.label) + "</div>") + "\n      </div>\n      " + (_0x13f032.targets?.map(_0xaa0c1c => _0x17c11e(_0xaa0c1c, _0x52b39f)).join("") || "") + "\n    </div>").join("") + "\n  </div>";
  }
  function _0x2c0350(_0x29b87f = {}) {
    return renderSelectionActions({
      selectionMode: _0x29b87f.selectionMode,
      selectedCount: _0x29b87f.selectedCount,
      allSelected: _0x29b87f.allSelected,
      primaryActionHtml: _0x4cff88({
        ..._0x29b87f,
        showCount: _0x29b87f.selectionMode
      }),
      selectAllLabel: "全选图片",
      clearSelectionLabel: "取消全选"
    });
  }
  function _0x2cecd9(_0x3d8c45 = {}) {
    const _0x493b65 = renderDownloadButton({
      action: "download-asset-image",
      enabled: Boolean(_0x3d8c45.canDownload)
    });
    if (!_0x3d8c45.showProjectActions) {
      if (_0x493b65) {
        return "<div class=\"story-asset-preview-actions\">" + _0x493b65 + "</div>";
      } else {
        return "";
      }
    }
    return "<div class=\"story-asset-preview-actions\">\n    " + _0x493b65 + "\n    <button type=\"button\" class=\"story-character-voice-upload-button story-add-to-library-button " + (_0x3d8c45.librarySynced ? "is-synced" : "") + "\" data-story-action=\"add-asset-appearance-to-library\" aria-label=\"" + escapeHtml(_0x3d8c45.saveToLibraryLabel) + "\" title=\"" + escapeHtml(_0x3d8c45.saveToLibraryLabel) + "\" " + (_0x3d8c45.canSaveToLibrary ? "" : "disabled") + " aria-busy=\"" + Boolean(_0x3d8c45.isSavingToLibrary) + "\">" + (_0x3d8c45.isSavingToLibrary ? renderStoryGenerationSpinner({
      button: true
    }) : renderAddToLibraryIcon()) + "</button>\n    <button type=\"button\" class=\"story-upload-replace story-character-voice-upload-button\" data-story-action=\"upload-asset\" aria-label=\"上传替换图片\" title=\"上传替换图片\" " + (_0x3d8c45.canUpload ? "" : "disabled") + ">" + renderUploadIcon() + "</button>\n    " + (_0x3d8c45.showDeleteAppearance ? "<button type=\"button\" class=\"story-character-voice-remove story-delete-current-appearance-button\" data-story-action=\"request-delete-asset-appearance\" aria-label=\"删除当前形象\" title=\"删除当前形象\" " + (_0x3d8c45.canDeleteAppearance ? "" : "disabled") + ">" + renderDeleteIcon() + "</button>" : "") + "\n    " + (_0x3d8c45.isDeleteAppearanceConfirming ? "<div class=\"story-project-delete-confirm story-asset-appearance-delete-confirm\" role=\"alertdialog\" aria-label=\"删除当前形象\">\n      <span>删除当前形象？</span>\n      <button type=\"button\" class=\"confirm-btn confirm-cancel\" data-story-action=\"cancel-delete-asset-appearance\">取消</button>\n      <button type=\"button\" class=\"confirm-btn confirm-ok\" data-story-action=\"confirm-delete-asset-appearance\" aria-label=\"确认删除当前形象\">删除</button>\n    </div>" : "") + "\n  </div>";
  }
  function _0x251282(_0x5390cf = {}) {
    if (!_0x5390cf.visible) {
      return "";
    }
    const _0x2c8fce = _0x5390cf.reference;
    const _0x171005 = Array.isArray(_0x5390cf.history) ? _0x5390cf.history : [];
    const _0x45466e = renderVoiceFooter({
      workflow: _0x5390cf.footer?.workflow,
      nodeData: _0x5390cf.footer?.nodeData,
      workflowItems: _0x5390cf.footer?.workflowItems,
      labels: {
        advanced: "高级设置",
        generateTitle: "生成声音参考"
      }
    });
    const _0x5d19a8 = _0x2c8fce ? "" : "<button type=\"button\" class=\"story-character-voice-upload-zone is-empty " + (_0x5390cf.isGenerating ? "img-preview-loading" : "") + "\" data-story-character-voice-drop data-story-action=\"upload-character-voice\" aria-busy=\"" + Boolean(_0x5390cf.isGenerating) + "\" " + (_0x5390cf.isGenerating ? "disabled" : "") + ">\n      <span class=\"story-character-voice-upload-icon\">" + renderUploadIcon() + "</span>\n        <span class=\"story-character-voice-upload-copy\">\n          <strong>上传或拖入声音参考</strong>\n          <small>支持 MP3 / WAV / M4A，建议 5–15 秒</small>\n        </span>\n        " + (_0x5390cf.isGenerating ? renderLoadingOverlay({
      compact: true
    }) : "") + "\n      </button>";
    const _0x37adaa = _0x171005.length ? "<div class=\"story-character-voice-history-wrap\">\n        <button type=\"button\" class=\"story-character-voice-history-button\" data-story-action=\"toggle-character-voice-history\" aria-label=\"历史音频\" aria-haspopup=\"true\" aria-expanded=\"false\" " + (_0x5390cf.isGenerating ? "disabled" : "") + ">" + _0x2be83f() + "</button>\n        <div class=\"story-character-voice-history-panel\" aria-hidden=\"true\">\n          <strong>历史音频</strong>\n          <div class=\"story-character-voice-history-list\">\n            " + _0x171005.map((_0x4d4c24, _0x46771a) => "<div class=\"story-character-voice-history-item\">\n              <button type=\"button\" class=\"story-character-voice-history-play\" data-story-character-voice-history-play=\"" + _0x46771a + "\" aria-label=\"试听历史音频 " + (_0x46771a + 1) + "\">" + _0x5199bd(true) + "</button>\n              <span><strong>" + escapeHtml(_0x4d4c24.label) + "</strong><small>" + escapeHtml(_0x4d4c24.timeLabel) + "</small></span>\n              <button type=\"button\" class=\"story-character-voice-history-restore\" data-story-character-voice-history-restore=\"" + _0x46771a + "\">设为当前</button>\n            </div>").join("") + "\n          </div>\n        </div>\n      </div>" : "";
    return "<div class=\"story-asset-detail-copy story-asset-detail-panel-face story-asset-detail-panel-face--voice story-character-voice-panel\" data-story-character-voice-panel aria-hidden=\"" + !_0x5390cf.isActive + "\" " + (_0x5390cf.isActive ? "" : "inert") + ">\n      <div class=\"story-character-voice-current " + (_0x2c8fce ? "has-reference" : "is-empty") + "\">\n        " + (_0x2c8fce ? renderAudioPlaybackSurface({
      audioUrl: _0x2c8fce.audioUrl || _0x2c8fce.localPath,
      waveformUrl: _0x2c8fce.waveformLocalPath || _0x2c8fce.waveformUrl,
      className: "story-character-voice-audio-card has-reference " + (_0x5390cf.isGenerating ? "img-preview-loading" : ""),
      playLabel: "播放声音参考",
      pauseLabel: "暂停声音参考",
      disabled: _0x5390cf.isGenerating,
      ariaBusy: _0x5390cf.isGenerating,
      dataAttributes: {
        "data-story-character-voice-audio-surface": "",
        "data-story-character-voice-drop": ""
      },
      trailingHtml: _0x5390cf.isGenerating ? renderLoadingOverlay({
        compact: true
      }) : ""
    }) : "") + "\n        " + _0x5d19a8 + "\n        " + (_0x2c8fce || _0x171005.length ? "<div class=\"story-character-voice-current-actions " + (_0x5390cf.isGenerating ? "is-generating" : "") + "\">\n          " + (_0x2c8fce ? "<button type=\"button\" class=\"story-character-voice-upload-button\" data-story-action=\"upload-character-voice\" aria-label=\"上传替换声音参考\" " + (_0x5390cf.isGenerating ? "disabled" : "") + ">" + renderUploadIcon() + "</button>\n          <button type=\"button\" class=\"story-character-voice-remove\" data-story-action=\"remove-character-voice\" aria-label=\"移除声音参考\" " + (_0x5390cf.isGenerating ? "disabled" : "") + ">" + renderDeleteIcon() + "</button>" : "") + "\n          " + _0x37adaa + "\n        </div>" : "") + "\n      </div>\n      <div class=\"story-character-voice-fields\">\n        <label>\n          <span>试听台词 <small>优先合并角色对白，生成结果最多 5 秒</small></span>\n          <textarea data-story-character-voice-sample maxlength=\"" + Math.max(1, Number(_0x5390cf.sampleMaxCharacters) || 1) + "\">" + escapeHtml(_0x5390cf.sampleText || "") + "</textarea>\n        </label>\n        <label>\n          <span>声音设定 <small>用于描述音色、年龄、情绪和说话方式</small></span>\n          <textarea data-story-character-voice-description maxlength=\"600\">" + escapeHtml(_0x5390cf.voiceDescription || "") + "</textarea>\n        </label>\n      </div>\n      " + (_0x5390cf.error ? "<p class=\"story-character-voice-error\" role=\"alert\">" + escapeHtml(_0x5390cf.error) + "</p>" : "") + "\n      <div class=\"story-character-voice-generation-bar story-asset-generation-bar prompt-panel-footer\">\n        <footer class=\"story-character-voice-model-footer " + (_0x5390cf.isGenerating ? "is-generating" : "") + "\" data-story-character-voice-model-footer>\n          " + _0x45466e + "\n        </footer>\n        <button type=\"button\" class=\"story-asset-generate-button story-main-action-button\" data-story-action=\"generate-character-voice\" " + (_0x5390cf.isGenerating ? "disabled" : "") + " aria-busy=\"" + Boolean(_0x5390cf.isGenerating) + "\">" + (_0x5390cf.isGenerating ? renderStoryGenerationSpinner({
      button: true
    }) : "") + "<span>" + (_0x5390cf.isGenerating ? "生成中" : _0x2c8fce ? "重新生成声音" : "生成声音") + "</span></button>\n      </div>\n  </div>";
  }
  function _0x4fa9a8(_0x51d69a = {}) {
    if (_0x51d69a.empty) {
      return "<aside class=\"story-asset-detail story-empty-panel\">\n      <strong>暂无可用素材</strong>\n      " + (_0x51d69a.showEmptyDescription ? "<p>" + escapeHtml(_0x51d69a.emptyDescription) + "</p>" : "") + "\n    </aside>";
    }
    const _0x2f6ce0 = _0x51d69a.asset || {};
    const _0x576a82 = _0x51d69a.appearance || {};
    return "<aside class=\"story-asset-detail " + escapeHtml(_0x51d69a.motionClass || "") + "\">\n    <div class=\"story-asset-preview-wrap\" data-story-appearance-wheel=\"" + Boolean(_0x51d69a.hasMultipleAppearances) + "\" " + (_0x51d69a.hasMultipleAppearances ? "tabindex=\"0\" aria-label=\"滚动鼠标滚轮或按左右方向键切换形象\"" : "") + ">\n      <div class=\"story-asset-preview-slide " + (_0x51d69a.isGeneratingAppearance ? "img-preview-loading" : "") + "\" aria-busy=\"" + Boolean(_0x51d69a.isGeneratingAppearance) + "\">\n        " + renderImage({
      imageUrl: _0x576a82.imageUrl,
      alt: _0x2f6ce0.name + " · " + (_0x576a82.name || "形象"),
      className: "story-asset-preview"
    }) + "\n        " + (_0x51d69a.isGeneratingAppearance ? renderLoadingOverlay() : "") + "\n      </div>\n      " + _0x2cecd9(_0x51d69a.previewActions) + "\n      " + (_0x51d69a.hasMultipleAppearances ? "" + _0x15e70b("previous") + _0x15e70b("next") : "") + "\n      <div class=\"story-asset-preview-caption\">\n        <div class=\"story-asset-caption-heading\">\n          <span class=\"story-asset-caption-title\">" + _0x49c0f8(_0x2f6ce0, {
      canRename: _0x51d69a.canRename
    }) + _0x3dbdf8({
      ..._0x51d69a.voicePlayer,
      id: _0x2f6ce0.id,
      name: _0x2f6ce0.name
    }) + "</span>\n          <span class=\"story-asset-caption-tags\">\n            " + (_0x51d69a.supportsBaseAppearance ? "<button type=\"button\" class=\"story-base-appearance-button " + (_0x51d69a.isBaseAppearance ? "is-active" : "") + " " + (_0x51d69a.isBaseAppearanceSelectionDisabled ? "is-disabled" : "") + "\" " + (_0x51d69a.hasMultipleAppearances ? "data-story-action=\"set-base-appearance\"" : "disabled") + " aria-pressed=\"" + Boolean(_0x51d69a.isBaseAppearance) + "\" aria-disabled=\"" + !_0x51d69a.canSetBaseAppearance + "\" title=\"会以基础形象作为参考，生成角色的其他形象\">" + (_0x51d69a.isBaseAppearance ? "基础形象" : "设为基础形象") + "</button>" : "") + "\n            " + (_0x51d69a.showStyleReference ? _0x4d3027(_0x51d69a.styleReference) : "") + "\n            " + _0x4b3058(_0x51d69a.voiceCapsule) + "\n            " + (_0x51d69a.allowDeleteAppearance ? "<button type=\"button\" class=\"story-character-voice-capsule story-delete-appearance-button\" data-story-action=\"delete-appearance\">删除形象</button>" : "") + "\n          </span>\n        </div>\n        <span data-story-asset-caption-meta>" + escapeHtml(_0x51d69a.captionMeta) + "</span>\n      </div>\n    </div>\n    <div class=\"story-asset-detail-panel-stage " + (_0x51d69a.panel?.isVoice ? "is-voice" : "is-image") + " " + (_0x51d69a.panel?.isAnimating ? "is-animating" : "is-settled") + "\" data-story-asset-detail-panel-stage>\n      <div class=\"story-asset-detail-panel-cube " + escapeHtml(_0x51d69a.panel?.motionClass || "") + "\">\n        <div class=\"story-asset-detail-copy story-asset-detail-panel-face story-asset-detail-panel-face--image\" aria-hidden=\"" + Boolean(_0x51d69a.panel?.isVoice) + "\" " + (_0x51d69a.panel?.isVoice ? "inert" : "") + ">\n          <div class=\"story-asset-prompt-field\">\n            <div class=\"story-asset-prompt-editor\" data-story-asset-prompt data-story-asset-prompt-asset-id=\"" + escapeHtml(_0x2f6ce0.id) + "\" data-story-asset-prompt-appearance-id=\"" + escapeHtml(_0x576a82.id) + "\" contenteditable=\"" + (_0x2f6ce0.isLibraryAsset || _0x51d69a.readOnly ? "false" : "true") + "\" role=\"textbox\" aria-multiline=\"true\" aria-label=\"形象提示词\" spellcheck=\"false\">" + renderPromptMentions(_0x2f6ce0.isLibraryAsset || _0x51d69a.readOnly ? _0x2f6ce0.description || _0x576a82.prompt || "" : _0x576a82.prompt || "", _0x576a82) + "</div>\n          </div>\n          " + (_0x2f6ce0.isLibraryAsset || _0x51d69a.readOnly ? "" : "<div class=\"story-asset-generation-bar prompt-panel-footer\">\n            " + renderImageModelSelector({
      ..._0x51d69a.imageModel,
      showSchemaControls: true,
      className: "story-asset-image-model-selector"
    }) + "\n            <div class=\"story-asset-generation-actions\">\n              " + _0x412779(_0x51d69a.preset) + "\n              " + _0x34de2e(_0x51d69a.promptControl) + "\n            </div>\n          </div>") + "\n        </div>\n        " + _0x251282(_0x51d69a.voicePanel) + "\n      </div>\n    </div>\n  </aside>";
  }
  function _0x4d2316(_0x335bf7 = {}) {
    if (_0x335bf7.kind === "batch-generation") {
      return _0x2bc224(_0x335bf7.control);
    }
    if (_0x335bf7.kind === "prompt-generation") {
      return _0x34de2e(_0x335bf7.control);
    }
    if (_0x335bf7.kind === "preset") {
      return _0x412779(_0x335bf7.control);
    }
    if (_0x335bf7.kind === "library-add") {
      return _0x4cff88(_0x335bf7.control);
    }
    if (_0x335bf7.kind === "library-selection") {
      return _0x2c0350(_0x335bf7.control);
    }
    return "";
  }
  function _0x445c3d(_0x39f7ba = {}) {
    if (_0x39f7ba.kind === "card") {
      return _0x1d016a(_0x39f7ba.card);
    }
    if (_0x39f7ba.kind === "detail") {
      return _0x4fa9a8(_0x39f7ba.detail);
    }
    if (_0x39f7ba.kind === "appearance-arrow") {
      return _0x15e70b(_0x39f7ba.direction);
    }
    if (_0x39f7ba.kind === "preview-actions") {
      return _0x2cecd9(_0x39f7ba.actions);
    }
    if (_0x39f7ba.kind === "reference-input") {
      return _0x4d3027(_0x39f7ba.reference);
    }
    if (_0x39f7ba.kind === "voice-capsule") {
      return _0x4b3058(_0x39f7ba.voiceCapsule);
    }
    if (_0x39f7ba.kind === "voice-panel") {
      return _0x251282(_0x39f7ba.voicePanel);
    }
    if (_0x39f7ba.kind === "voice-player") {
      return _0x3dbdf8(_0x39f7ba.voicePlayer);
    }
    if (_0x39f7ba.kind === "voice-icon") {
      return _0x5199bd(_0x39f7ba.hasVoice === true);
    }
    return "";
  }
  return Object.freeze({
    renderAssetControls: _0x4d2316,
    renderAssetSurface: _0x445c3d
  });
}