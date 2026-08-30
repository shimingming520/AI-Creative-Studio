import { renderAIGenTextModelSelectorMarkup } from "../../components/aigenText/modelSelector.js";
import { getDisplayModelName } from "../providers.js";
import { renderWorkspaceProjectCard, renderWorkspaceProjectSortControl } from "../workspaceProjectHome.js";
import { getStoryAssetAppearances } from "./storyAssetAppearances.js";
import { getStoryBackgroundTaskSummary } from "./storyBackgroundTasks.js";
import { renderStoryGenerationSpinner } from "./storyAsyncButtonPresentation.js";
import { STORY_HOME_REWRITE_SOURCE_HINT, canStartStoryHomeGeneration, hasStoryHomeReferenceScript } from "./storyHomeRewrite.js";
import { STORY_STYLE_CATEGORIES, STORY_STYLE_PRESETS, resolveStoryStyleSelection } from "./storyStyleCatalog.js";
import { STORY_ASPECT_RATIO_OPTIONS, STORY_CUSTOM_STYLE_MAX_CHARACTERS, STORY_DEVELOPER_EPISODE_COUNT_OPTIONS, STORY_EPISODE_COUNT_MAX, STORY_EPISODE_COUNT_OPTIONS, STORY_IDEA_MAX_CHARACTERS, STORY_PROMPT_MODE_OPTIONS, STORY_PUBLIC_EPISODE_COUNT_OPTIONS, STORY_SCRIPT_MAX_CHARACTERS, getStoryPromptModeLabel, getStoryScriptModeHint, normalizeStoryAspectRatio, normalizeStoryEpisodeCount, normalizeStoryPromptMode, normalizeStoryScriptMode } from "./storyProjectPlanning.js";
import { getStoryProjectHomeEntries } from "./storyProjectSession.js";
import { getStoryVideoInputTextModelOptions } from "./storyWorkspaceModelCatalog.js";
import { STORY_REPLICATION_LOCALES, getStoryReplicationLocale, isStoryVideoReplicationHomeAvailable } from "./storyVideoReplication.js";
function escapeHtml(_0x42bd0d) {
  return String(_0x42bd0d ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll("\"", "&quot;").replaceAll("'", "&#39;");
}
function normalizeText(_0x4a4511) {
  return String(_0x4a4511 ?? "").trim();
}
function getStoryDocumentExtension(_0x2077fb = "") {
  const _0xcecd0a = normalizeText(_0x2077fb).split(".").pop();
  if (_0xcecd0a && _0xcecd0a !== _0x2077fb) {
    return "." + _0xcecd0a.toLowerCase();
  } else {
    return ".txt";
  }
}
function renderStoryReplicationVideoIcon() {
  return "<svg class=\"story-replication-upload-video-icon\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.7\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><rect x=\"3\" y=\"5\" width=\"14\" height=\"14\" rx=\"3\"/><path d=\"m17 10 4-2v8l-4-2\"/></svg>";
}
function renderStoryHomeTabIcon(_0x3a5360) {
  if (_0x3a5360 === "upload") {
    return "<span class=\"story-home-tab-icon story-home-tab-icon--upload\" aria-hidden=\"true\"><svg viewBox=\"0 0 24 24\" fill=\"none\"><path d=\"M12 15V4M7.5 8.5 12 4l4.5 4.5\"/><path d=\"M4 14.5v3.75A1.75 1.75 0 0 0 5.75 20h12.5A1.75 1.75 0 0 0 20 18.25V14.5\"/></svg></span>";
  }
  if (_0x3a5360 === "replication") {
    return "<span class=\"story-home-tab-icon story-home-tab-icon--replication\" aria-hidden=\"true\"><svg viewBox=\"0 0 24 24\" fill=\"none\"><rect x=\"3.5\" y=\"5\" width=\"13\" height=\"14\" rx=\"2\"/><path d=\"m16.5 9 4-2v10l-4-2z\"/><path d=\"m8.5 9 4 3-4 3z\"/></svg></span>";
  }
  return "<span class=\"story-home-tab-icon story-home-tab-icon--generate\" aria-hidden=\"true\"><svg viewBox=\"0 0 24 24\" fill=\"none\"><path d=\"m11.5 3 .9 3.1a4.7 4.7 0 0 0 3.2 3.2l3.1.9-3.1.9a4.7 4.7 0 0 0-3.2 3.2l-.9 3.1-.9-3.1a4.7 4.7 0 0 0-3.2-3.2l-3.1-.9 3.1-.9a4.7 4.7 0 0 0 3.2-3.2z\"/><path d=\"m18.5 15.5.35 1.15a2.2 2.2 0 0 0 1.5 1.5l1.15.35-1.15.35a2.2 2.2 0 0 0-1.5 1.5l-.35 1.15-.35-1.15a2.2 2.2 0 0 0-1.5-1.5l-1.15-.35 1.15-.35a2.2 2.2 0 0 0 1.5-1.5z\"/></svg></span>";
}
function renderHomeTabs(_0x5429ac) {
  const _0x43dafa = isStoryVideoReplicationHomeAvailable(_0x5429ac);
  const _0x5b01b2 = [["upload", "上传剧本"], ["generate", "剧本创作"], ["replication", "复刻视频"]];
  return "<div class=\"story-home-tabs\" data-story-home-tabs data-active-tab=\"" + escapeHtml(_0x5429ac.homeTab) + "\" role=\"tablist\">\n    <span class=\"story-home-tab-indicator\" aria-hidden=\"true\"></span>\n    " + _0x5b01b2.map(([_0x36353a, _0x531d44]) => {
    const _0x2a2108 = _0x36353a === "replication" && !_0x43dafa;
    const _0x58b151 = _0x5429ac.homeTab === _0x36353a && !_0x2a2108;
    return "<button type=\"button\" class=\"story-home-tab " + (_0x58b151 ? "is-active" : "") + "\" data-story-home-tab=\"" + _0x36353a + "\" role=\"tab\" aria-selected=\"" + _0x58b151 + "\" aria-disabled=\"" + _0x2a2108 + "\" tabindex=\"" + (_0x58b151 ? "0" : "-1") + "\" " + (_0x2a2108 ? "disabled" : "") + "><span class=\"story-home-tab-content\">" + renderStoryHomeTabIcon(_0x36353a) + "<span>" + _0x531d44 + "</span></span></button>";
  }).join("") + "\n  </div>";
}
export function renderStoryHomeComposerBody(_0x192857) {
  if (_0x192857.homeTab === "replication") {
    const _0x5c116e = Array.isArray(_0x192857.replicationSourceFiles) ? _0x192857.replicationSourceFiles : [];
    const _0x5bfbda = Array.isArray(_0x192857.replicationSourcePreviewUrls) ? _0x192857.replicationSourcePreviewUrls : [];
    const _0x3165b5 = _0x5c116e.length ? "<div class=\"story-replication-upload-list\" data-story-replication-upload-list>\n          " + _0x5c116e.map((_0x2ad527, _0xf1f092) => {
      const _0x2bfe8e = _0x2ad527.name || "视频 " + (_0xf1f092 + 1);
      const _0x5aa5ec = normalizeText(_0x5bfbda[_0xf1f092]);
      return "<article class=\"story-replication-upload-item\">\n              <div class=\"story-replication-upload-thumbnail\">\n                " + (_0x5aa5ec ? "<video src=\"" + escapeHtml(_0x5aa5ec) + "\" preload=\"metadata\" muted playsinline aria-label=\"" + escapeHtml(_0x2bfe8e) + " 视频缩略图\" draggable=\"false\"></video>" : "<span class=\"story-replication-upload-placeholder\">" + renderStoryReplicationVideoIcon() + "</span>") + "\n                <span class=\"story-replication-upload-status\">等待分析</span>\n                <button type=\"button\" class=\"story-replication-upload-remove\" data-story-action=\"remove-replication-video\" data-story-replication-file-index=\"" + _0xf1f092 + "\" aria-label=\"移除 " + escapeHtml(_0x2bfe8e) + "\">×</button>\n              </div>\n              <div class=\"story-replication-upload-copy\"><strong>" + escapeHtml(_0x2bfe8e) + "</strong><small>" + (Math.max(0, Number(_0x2ad527.size) || 0) / 1048576).toFixed(1) + "MB · 等待分析</small></div>\n            </article>";
    }).join("") + "\n        </div>" : "<div class=\"story-replication-upload-empty\">\n          <strong>上传需要复刻的视频</strong>\n          <p>支持多选 MP4、MOV、AVI；每条视频不超过 50MB。</p>\n        </div>";
    return "<div class=\"story-home-composer-panel story-upload-drop story-replication-upload " + (_0x5c116e.length ? "has-sources" : "") + "\" data-story-replication-drop>\n      " + _0x3165b5 + "\n      <div class=\"story-upload-actions\">\n        <button type=\"button\" class=\"story-secondary-button\" data-story-action=\"choose-replication-videos\">" + (_0x5c116e.length ? "继续添加" : "上传视频") + "</button>\n      </div>\n    </div>";
  }
  if (_0x192857.homeTab === "generate") {
    const _0x55288c = hasStoryHomeReferenceScript(_0x192857);
    const _0x57c14e = normalizeText(_0x192857.scriptFileName);
    const _0x3de76a = _0x55288c ? "描述你希望如何改写这份剧本，例如：改成海外爆款短剧风格，强化冲突与集尾钩子。" : "输入你想创作的剧本内容，或上传参考剧本进行改编……";
    return "<div class=\"story-home-composer-panel story-home-input-wrap story-home-story-input story-home-creation-input " + (_0x55288c ? "has-reference-script" : "") + "\" data-story-rewrite-drop>\n      <div class=\"story-home-reference-source\">\n        <button type=\"button\" class=\"story-home-reference-upload\" data-story-action=\"choose-rewrite-script\" aria-label=\"" + (_0x55288c ? "替换参考剧本（改写模式）" : "上传参考剧本") + "\" " + (_0x192857.isParsingDocument ? "disabled" : "") + " aria-busy=\"" + Boolean(_0x192857.isParsingDocument) + "\">\n          <span class=\"story-home-reference-upload-icon\" aria-hidden=\"true\">" + (_0x192857.isParsingDocument ? renderStoryGenerationSpinner({
      button: true
    }) : "<span class=\"story-home-reference-document-icon\"></span><span class=\"story-home-reference-add-icon\"></span><span class=\"story-home-reference-extension\">" + escapeHtml(getStoryDocumentExtension(_0x57c14e)) + "</span>") + "</span>\n          " + (_0x192857.isParsingDocument ? "<span class=\"story-home-reference-status\">解析中</span>" : "") + "\n        </button>\n        " + (_0x55288c ? "<span class=\"story-home-reference-file-name\">" + escapeHtml(_0x57c14e) + "</span>\n          <button type=\"button\" class=\"story-home-reference-remove\" data-story-action=\"remove-rewrite-script\" aria-label=\"移除参考剧本\">×</button>" : "") + "\n      </div>\n      <div class=\"story-home-creation-copy\">\n        <label for=\"storyIdeaInput\">" + (_0x55288c ? "填写改写要求" : "输入故事设定") + "</label>\n        <textarea id=\"storyIdeaInput\" data-story-idea-input maxlength=\"" + STORY_IDEA_MAX_CHARACTERS + "\" placeholder=\"" + _0x3de76a + "\">" + escapeHtml(_0x192857.idea) + "</textarea>\n        <div class=\"story-home-input-meta\">\n          <p data-story-script-mode-hint>" + (_0x55288c ? STORY_HOME_REWRITE_SOURCE_HINT : escapeHtml(getStoryScriptModeHint(_0x192857.scriptMode))) + "</p>\n          <span data-story-idea-count>" + _0x192857.idea.length + " / " + STORY_IDEA_MAX_CHARACTERS + "</span>\n        </div>\n      </div>\n    </div>";
  }
  if (_0x192857.uploadInputMode === "paste") {
    return "<div class=\"story-home-composer-panel story-home-input-wrap story-home-story-input story-home-paste-input\" data-story-script-drop>\n      <label for=\"storyPasteInput\">粘贴剧本文本</label>\n      <textarea id=\"storyPasteInput\" data-story-paste-input maxlength=\"" + STORY_SCRIPT_MAX_CHARACTERS + "\" placeholder=\"在这里粘贴完整剧本……\">" + escapeHtml(_0x192857.scriptText) + "</textarea>\n      <div class=\"story-home-input-meta\">\n        <p>支持最多 " + STORY_SCRIPT_MAX_CHARACTERS + " 字，将按原稿导入，不扩写、不重新分集。</p>\n        <span data-story-paste-count>" + _0x192857.scriptText.length + " / " + STORY_SCRIPT_MAX_CHARACTERS + "</span>\n      </div>\n      <div class=\"story-upload-actions\">\n        <button type=\"button\" class=\"story-secondary-button\" data-story-action=\"choose-script\">上传剧本</button>\n        <button type=\"button\" class=\"story-secondary-button is-active\" data-story-action=\"paste-script\" aria-pressed=\"true\">粘贴文本</button>\n      </div>\n    </div>";
  }
  return "<div class=\"story-home-composer-panel story-upload-drop\" data-story-script-drop>\n    <strong>" + (_0x192857.isParsingDocument ? "正在解析文档…" : _0x192857.scriptFileName ? escapeHtml(_0x192857.scriptFileName) : "上传剧本文件") + "</strong>\n    <p>" + (_0x192857.scriptFileName ? "剧本已就绪，将按原稿结构导入并直接提取素材。" : "支持 TXT、DOCX、文本型 PDF，文本内容不超过 " + STORY_SCRIPT_MAX_CHARACTERS + " 字。") + "</p>\n    <div class=\"story-upload-actions\">\n      <button type=\"button\" class=\"story-secondary-button\" data-story-action=\"choose-script\" " + (_0x192857.isParsingDocument ? "disabled" : "") + " aria-busy=\"" + Boolean(_0x192857.isParsingDocument) + "\">" + (_0x192857.isParsingDocument ? renderStoryGenerationSpinner({
    button: true
  }) : "") + "<span>" + (_0x192857.isParsingDocument ? "解析中" : "上传剧本") + "</span></button>\n      <button type=\"button\" class=\"story-secondary-button\" data-story-action=\"paste-script\" aria-pressed=\"false\">粘贴文本</button>\n    </div>\n  </div>";
}
export function renderStoryScriptModeControl(_0x368656 = "plot", {
  hidden = false
} = {}) {
  const _0x4562a9 = normalizeStoryScriptMode(_0x368656);
  const _0x432b02 = _0x4562a9 === "narration" ? "解说模式" : "剧情模式";
  const _0x300db9 = _0x4562a9 === "narration" ? "剧情模式" : "解说模式";
  return "<button type=\"button\" class=\"story-home-param-trigger story-script-mode-toggle " + (_0x4562a9 === "narration" ? "is-narration" : "") + "\" data-story-script-mode-control data-story-script-mode=\"" + _0x4562a9 + "\" aria-pressed=\"" + (_0x4562a9 === "narration") + "\" aria-label=\"当前" + _0x432b02 + "，点击切换为" + _0x300db9 + "\" " + (hidden ? "hidden" : "") + ">\n    <span class=\"story-home-param-icon story-script-mode-icon\" aria-hidden=\"true\"><svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M7 7h10l-2.5-2.5M17 17H7l2.5 2.5\"/><path d=\"M17 7l-2.5 2.5M7 17l2.5-2.5\"/></svg></span>\n    <span data-story-script-mode-label>" + _0x432b02 + "</span>\n  </button>";
}
export function getStoryHomeGenerateButtonLabel(_0x535694) {
  if (_0x535694.isGeneratingStory) {
    return _0x535694.generationStatus || "正在创建剧情";
  }
  if (_0x535694.homeTab === "replication") {
    return "开始分析";
  }
  if (_0x535694.homeTab === "upload") {
    return "导入剧本";
  }
  if (hasStoryHomeReferenceScript(_0x535694)) {
    return "开始改写";
  }
  return "生成剧本";
}
export function renderStoryHomeParamChevron() {
  return "<svg width=\"10\" height=\"10\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" class=\"story-home-param-chevron node-menu-caret\" aria-hidden=\"true\"><polyline points=\"6 9 12 15 18 9\"></polyline></svg>";
}
function renderStoryAspectRatioPicker(_0x17b4b5, {
  placement = "above",
  compact = false
} = {}) {
  const _0x293686 = normalizeStoryAspectRatio(_0x17b4b5.data?.project?.aspectRatio);
  const _0x4157d4 = placement === "below" ? " story-ratio-picker--below" : "";
  const _0xd0659 = compact ? " story-home-param-picker--compact" : "";
  return "<div class=\"story-home-param-picker story-ratio-picker" + _0x4157d4 + _0xd0659 + "\">\n    <button type=\"button\" class=\"story-home-param-trigger story-menu-trigger\" data-story-home-param-trigger=\"ratio\" aria-haspopup=\"listbox\" aria-expanded=\"false\">\n      <span class=\"story-home-param-icon\" aria-hidden=\"true\">▭</span>\n      <span>" + escapeHtml(_0x293686) + "</span>\n      " + renderStoryHomeParamChevron() + "\n    </button>\n    <div class=\"story-home-param-popover story-ratio-popover\" role=\"listbox\" aria-label=\"画面比例\">\n      <strong>画面比例</strong>\n      <div class=\"story-ratio-options\">\n        " + STORY_ASPECT_RATIO_OPTIONS.map(_0x209e85 => "<button type=\"button\" class=\"story-ratio-option " + (_0x209e85.value === _0x293686 ? "is-selected" : "") + "\" data-story-aspect-ratio-option=\"" + escapeHtml(_0x209e85.value) + "\" role=\"option\" aria-selected=\"" + (_0x209e85.value === _0x293686) + "\">" + escapeHtml(_0x209e85.selectedLabel || _0x209e85.label) + "</button>").join("") + "\n      </div>\n    </div>\n  </div>";
}
function renderStoryPlanningPicker({
  field: _0x12c591,
  label: _0x59f09e,
  icon: _0x218829,
  value: _0x2e3876,
  options: _0xc6d600,
  disabledOptions = [],
  customOption = null,
  formatOption: _0xbea9a7,
  singleColumn = false,
  hidden = false
} = {}) {
  const _0x3af37e = new Set(disabledOptions);
  return "<div class=\"story-home-param-picker story-ratio-picker story-planning-picker\" data-story-planning-picker=\"" + escapeHtml(_0x12c591) + "\" " + (hidden ? "hidden" : "") + ">\n    <button type=\"button\" class=\"story-home-param-trigger story-menu-trigger\" data-story-home-param-trigger=\"" + escapeHtml(_0x12c591) + "\" aria-haspopup=\"listbox\" aria-expanded=\"false\">\n      <span class=\"story-home-param-icon\" aria-hidden=\"true\">" + escapeHtml(_0x218829) + "</span>\n      <span data-story-planning-trigger-label>" + escapeHtml(_0xbea9a7(_0x2e3876)) + "</span>\n      " + renderStoryHomeParamChevron() + "\n    </button>\n    <div class=\"story-home-param-popover story-ratio-popover story-planning-popover\" role=\"listbox\" aria-label=\"" + escapeHtml(_0x59f09e) + "\">\n      <strong>" + escapeHtml(_0x59f09e) + "</strong>\n      <div class=\"story-ratio-options story-planning-options" + (singleColumn ? " story-planning-options--single-column" : "") + "\">\n        " + _0xc6d600.map(_0x2d5bcb => {
    const _0x23d6fb = _0x3af37e.has(_0x2d5bcb);
    return "<button type=\"button\" class=\"story-ratio-option " + (_0x2d5bcb === _0x2e3876 ? "is-selected" : "") + " " + (_0x23d6fb ? "is-disabled" : "") + "\" data-story-planning-field=\"" + escapeHtml(_0x12c591) + "\" data-story-planning-option=\"" + _0x2d5bcb + "\" role=\"option\" aria-selected=\"" + (_0x2d5bcb === _0x2e3876) + "\" aria-disabled=\"" + _0x23d6fb + "\" " + (_0x23d6fb ? "disabled" : "") + ">" + escapeHtml(_0xbea9a7(_0x2d5bcb)) + "</button>";
  }).join("") + "\n        " + (customOption?.visible ? "<label class=\"story-ratio-option story-episode-count-custom-editor " + (customOption.selected ? "is-selected" : "") + "\" data-story-custom-episode-count role=\"option\" aria-selected=\"" + customOption.selected + "\" aria-label=\"自定义分集数，最多 " + STORY_EPISODE_COUNT_MAX + " 集\">\n          <input type=\"number\" min=\"1\" max=\"" + STORY_EPISODE_COUNT_MAX + "\" step=\"1\" inputmode=\"numeric\" autocomplete=\"off\" data-story-custom-episode-count-input aria-label=\"输入自定义分集数，1 到 " + STORY_EPISODE_COUNT_MAX + " 集\" placeholder=\"输入集数\" value=\"" + (customOption.selected ? escapeHtml(_0x2e3876) : "") + "\">\n          <span>集</span>\n        </label>" : "") + "\n      </div>\n    </div>\n  </div>";
}
function renderStoryStylePicker(_0x2b9815, {
  placement = "overlay",
  compact = false
} = {}) {
  const _0x21e381 = _0x2b9815.data?.project || {};
  const _0x8d9441 = resolveStoryStyleSelection({
    styleId: _0x21e381.videoStyleId,
    stylePrompt: _0x21e381.videoStylePrompt,
    videoStyle: _0x21e381.videoStyle
  });
  const _0xfff3e1 = _0x8d9441.isCustom ? _0x8d9441.stylePrompt : normalizeText(_0x21e381.customVideoStylePrompt);
  const _0x2c1a46 = placement === "below" ? " story-style-picker--below" : "";
  const _0x420914 = compact ? " story-home-param-picker--compact" : "";
  return "<div class=\"story-home-param-picker story-style-picker" + _0x2c1a46 + _0x420914 + "\">\n    <button type=\"button\" class=\"story-home-param-trigger story-menu-trigger story-style-trigger\" data-story-home-param-trigger=\"style\" aria-haspopup=\"dialog\" aria-expanded=\"false\">\n      " + (_0x8d9441.thumbnail ? "<img src=\"" + escapeHtml(_0x8d9441.thumbnail) + "\" alt=\"\" draggable=\"false\">" : "<span class=\"story-home-param-icon story-style-custom-icon\" aria-hidden=\"true\">✦</span>") + "\n      <span class=\"story-style-trigger-label\">" + escapeHtml(_0x8d9441.label) + "</span>\n      " + renderStoryHomeParamChevron() + "\n    </button>\n    <section class=\"story-home-param-popover story-style-popover\" role=\"dialog\" aria-label=\"风格库\">\n      <div class=\"story-style-library\" data-story-style-library>\n        <div class=\"story-style-header\">\n          <div>\n            <strong>风格库</strong>\n            <small>为后续角色、场景、道具和分集画面统一视觉方向</small>\n          </div>\n          <label class=\"story-style-search\">\n            <span aria-hidden=\"true\">⌕</span>\n            <input type=\"search\" data-story-style-search-input placeholder=\"搜索风格\" autocomplete=\"off\">\n          </label>\n        </div>\n        <div class=\"story-style-tabs\" role=\"tablist\">\n          " + STORY_STYLE_CATEGORIES.map(_0x431c89 => "<button type=\"button\" class=\"story-style-tab " + (_0x431c89.id === "all" ? "is-active" : "") + "\" data-story-style-category=\"" + _0x431c89.id + "\" role=\"tab\" aria-selected=\"" + (_0x431c89.id === "all") + "\">" + _0x431c89.label + "</button>").join("") + "\n        </div>\n        <div class=\"story-style-grid\" data-story-style-grid>\n          <button type=\"button\" class=\"story-style-card story-style-card--custom " + (_0x8d9441.isCustom ? "is-selected" : "") + "\" data-story-style-custom data-story-style-search=\"自定义风格提示词\" data-story-style-card-category=\"custom\">\n            <span class=\"story-style-custom-mark\" aria-hidden=\"true\">✦</span>\n            <span>自定义风格提示词</span>\n          </button>\n          " + STORY_STYLE_PRESETS.map(_0x32080f => "<button type=\"button\" class=\"story-style-card " + (_0x32080f.id === _0x8d9441.styleId ? "is-selected" : "") + "\" data-story-style-option=\"" + escapeHtml(_0x32080f.id) + "\" data-story-style-search=\"" + escapeHtml(_0x32080f.label.toLowerCase()) + "\" data-story-style-card-category=\"" + escapeHtml(_0x32080f.category) + "\">\n            <img src=\"" + escapeHtml(_0x32080f.thumbnail) + "\" alt=\"\" loading=\"lazy\" decoding=\"async\" draggable=\"false\">\n            <span>" + escapeHtml(_0x32080f.label) + "</span>\n          </button>").join("") + "\n        </div>\n        <p class=\"story-style-empty\" data-story-style-empty hidden>没有匹配的风格</p>\n      </div>\n      <div class=\"story-style-custom-editor\" data-story-style-custom-editor hidden>\n        <div class=\"story-style-custom-editor-heading\">\n          <button type=\"button\" data-story-style-custom-back aria-label=\"返回风格库\">←</button>\n          <div>\n            <strong>自定义风格提示词</strong>\n            <small>描述画面媒介、光线、色调、质感与时代气质</small>\n          </div>\n        </div>\n        <textarea data-story-style-custom-input maxlength=\"" + STORY_CUSTOM_STYLE_MAX_CHARACTERS + "\" placeholder=\"例如：真人写实，90 年代港片胶片质感，暖黄色街灯，低饱和色调\">" + escapeHtml(_0xfff3e1) + "</textarea>\n        <div class=\"story-style-custom-footer\">\n          <span data-story-style-custom-count>" + _0xfff3e1.length + " / " + STORY_CUSTOM_STYLE_MAX_CHARACTERS + "</span>\n          <button type=\"button\" class=\"story-style-custom-confirm\" data-story-style-custom-confirm aria-label=\"确认自定义风格\">✓</button>\n        </div>\n      </div>\n    </section>\n  </div>";
}
function renderStoryHomeEmptyIcon() {
  return "<span class=\"workspace-mode-icon workspace-mode-icon--story\" aria-hidden=\"true\"><svg viewBox=\"0 0 24 24\" fill=\"none\"><path d=\"M7 3.75h8.5L19 7.25v13H7z\"/><path d=\"M15.5 3.75v3.5H19M10 11h6M10 14.5h6M10 18h4\"/></svg></span>";
}
export function renderStoryHomeModelBar(_0x10a741) {
  const _0x385458 = _0x10a741.data?.project?.planning || {};
  const _0x2d7b3c = normalizeStoryEpisodeCount(_0x385458.episodeCount);
  const _0x446aa8 = normalizeStoryPromptMode(_0x385458.promptMode, {
    allowDeveloperModes: _0x10a741.developerModeAvailable === true
  });
  const _0x26957e = canStartStoryHomeGeneration(_0x10a741);
  const _0x2b4536 = getStoryVideoInputTextModelOptions().map(_0x29df2f => _0x29df2f.modelId);
  const _0x3bd9e7 = _0x10a741.homeTab === "replication" && !_0x2b4536.includes(_0x10a741.models.text) ? _0x2b4536[0] || _0x10a741.models.text : _0x10a741.models.text;
  const _0x391085 = getStoryReplicationLocale(_0x10a741.replicationTargetLocale);
  return "<div class=\"story-home-model-bar\">\n    <div class=\"story-home-model-controls\">\n      " + renderAIGenTextModelSelectorMarkup({
    modelId: _0x3bd9e7,
    provider: _0x10a741.textProvider,
    providerProfileId: _0x10a741.textProviderProfileId,
    includeRunningHubInternational: true,
    getDisplayModelName: getDisplayModelName,
    className: "story-home-text-model-selector",
    allowedModelIds: _0x10a741.homeTab === "replication" ? _0x2b4536 : undefined
  }) + "\n      " + renderStoryStylePicker(_0x10a741) + "\n      " + renderStoryPlanningPicker({
    field: "promptMode",
    label: "单片段提示词模式",
    icon: "✦",
    value: _0x446aa8,
    options: STORY_PROMPT_MODE_OPTIONS.map(_0x3dad39 => _0x3dad39.value),
    disabledOptions: STORY_PROMPT_MODE_OPTIONS.filter(_0x3d2ece => !_0x3d2ece.enabled && !_0x10a741.developerModeAvailable).map(_0x2f1bec => _0x2f1bec.value),
    formatOption: getStoryPromptModeLabel,
    singleColumn: true,
    hidden: _0x10a741.homeTab === "replication"
  }) + "\n      " + renderStoryPlanningPicker({
    field: "targetLocale",
    label: "语种与地区",
    icon: "文",
    value: _0x391085.value,
    options: STORY_REPLICATION_LOCALES.map(_0x2c06a6 => _0x2c06a6.value),
    formatOption: _0x12e9fa => getStoryReplicationLocale(_0x12e9fa).shortLabel,
    hidden: _0x10a741.homeTab !== "replication"
  }) + "\n      " + renderStoryPlanningPicker({
    field: "episodeCount",
    label: "目标分集数",
    icon: "≡",
    value: _0x2d7b3c,
    options: _0x10a741.developerModeAvailable ? [...STORY_PUBLIC_EPISODE_COUNT_OPTIONS, ...STORY_DEVELOPER_EPISODE_COUNT_OPTIONS] : STORY_PUBLIC_EPISODE_COUNT_OPTIONS,
    customOption: {
      visible: _0x10a741.developerModeAvailable === true,
      selected: !STORY_EPISODE_COUNT_OPTIONS.includes(_0x2d7b3c)
    },
    formatOption: _0x20f1e2 => _0x20f1e2 + "集",
    singleColumn: true,
    hidden: _0x10a741.homeTab !== "generate"
  }) + "\n      " + renderStoryScriptModeControl(_0x10a741.scriptMode, {
    hidden: _0x10a741.homeTab !== "generate"
  }) + "\n    </div>\n    <button type=\"button\" class=\"story-primary-button story-home-generate story-main-action-button\" data-story-action=\"generate-story\" " + (_0x26957e && !_0x10a741.isGeneratingStory ? "" : "disabled") + " aria-busy=\"" + Boolean(_0x10a741.isGeneratingStory) + "\">" + (_0x10a741.isGeneratingStory ? renderStoryGenerationSpinner({
    button: true
  }) : "") + "<span data-story-generate-label>" + escapeHtml(getStoryHomeGenerateButtonLabel(_0x10a741)) + "</span>" + (_0x10a741.isGeneratingStory ? "" : "<span class=\"story-generate-arrow\" aria-hidden=\"true\">→</span>") + "</button>\n  </div>";
}
export function renderStoryHome(_0x4357cb) {
  const _0x5cb9c5 = _0x4357cb.homeTab === "replication" && !isStoryVideoReplicationHomeAvailable(_0x4357cb) ? {
    ..._0x4357cb,
    homeTab: "upload"
  } : _0x4357cb;
  const _0x326a6c = _0x4357cb.showArchivedProjects === true;
  const _0x3f27a0 = _0x4357cb.projects.filter(_0x43eab2 => Number(_0x43eab2?.archivedAt || 0) > 0).length;
  const _0x51f401 = getStoryProjectHomeEntries(_0x4357cb.projects, {
    query: _0x4357cb.projectSearchQuery,
    sortOrder: _0x4357cb.projectSortOrder,
    showArchived: _0x326a6c
  });
  return "<div class=\"story-home-page\">\n    <section class=\"story-home-hero\">\n      <span class=\"story-eyebrow\">SHUO Canvas · Story Studio</span>\n      <h1>从一个想法到完整的AI视频</h1>\n      <div class=\"story-home-composer " + (_0x4357cb.isGeneratingStory ? "is-generating" : "") + "\" aria-busy=\"" + (_0x4357cb.isGeneratingStory ? "true" : "false") + "\">\n        " + renderHomeTabs(_0x5cb9c5) + "\n        <div class=\"story-home-composer-body\">" + renderStoryHomeComposerBody(_0x5cb9c5) + "</div>\n        " + renderStoryHomeModelBar(_0x5cb9c5) + "\n        <div class=\"story-home-generation-loading storyboard-script-loading-overlay\" data-story-generation-loading role=\"status\" aria-live=\"polite\" " + (_0x4357cb.isGeneratingStory ? "" : "hidden") + ">\n          <div class=\"storyboard-script-loading-spinner\"></div>\n          <div class=\"storyboard-script-loading-label\" data-story-generation-loading-label>" + escapeHtml(_0x4357cb.generationStatus || "正在创建剧情") + "</div>\n          <div class=\"storyboard-script-loading-bar\"><div class=\"storyboard-script-loading-bar-fill\"></div></div>\n        </div>\n      </div>\n    </section>\n    <section class=\"story-projects-section\">\n      <div class=\"story-section-heading\">\n        <div>\n          <h2>" + (_0x326a6c ? "已归档项目" : "我的剧本项目") + "</h2>\n        </div>\n        <div class=\"story-project-list-controls\">\n          <label class=\"story-project-search\">\n            <span aria-hidden=\"true\">⌕</span>\n            <input type=\"search\" data-story-project-search value=\"" + escapeHtml(_0x4357cb.projectSearchQuery || "") + "\" placeholder=\"搜索项目名称\" autocomplete=\"off\" aria-label=\"搜索剧本项目\">\n          </label>\n          " + renderStoryProjectSortControl(_0x4357cb.projectSortOrder) + "\n          <button type=\"button\" class=\"story-project-archive-toggle " + (_0x326a6c ? "is-active" : "") + "\" data-story-action=\"toggle-archived-projects\" aria-pressed=\"" + _0x326a6c + "\">" + (_0x326a6c ? "返回项目" : "已归档 " + _0x3f27a0) + "</button>\n        </div>\n      </div>\n      " + (_0x4357cb.projects.length ? "<div class=\"story-project-grid\">\n            " + _0x51f401.map(_0x22b2f1 => renderStoryProjectCard(_0x22b2f1, {
    isDeleteConfirming: normalizeText(_0x4357cb.pendingDeleteProjectId) === normalizeText(_0x22b2f1?.id || _0x22b2f1?.data?.project?.id),
    isMenuOpen: normalizeText(_0x4357cb.openProjectMenuId) === normalizeText(_0x22b2f1?.id || _0x22b2f1?.data?.project?.id)
  })).join("") + "\n            " + (_0x51f401.length ? "" : "<div class=\"story-project-filter-empty\"><strong>" + (_0x326a6c ? "没有匹配的归档项目" : "没有匹配的剧本项目") + "</strong><span>可以尝试其他搜索词，或清空搜索条件。</span></div>") + "\n            " + (_0x326a6c ? "" : "<button type=\"button\" class=\"story-project-create-tile\" data-story-action=\"new-story\" aria-label=\"新建剧本项目\">\n              <span aria-hidden=\"true\">+</span>\n              <strong>新建剧本项目</strong>\n            </button>") + "\n          </div>" : "<div class=\"story-project-empty\">\n            <div class=\"story-project-empty-icon\" aria-hidden=\"true\">" + renderStoryHomeEmptyIcon() + "</div>\n            <strong>还没有剧本项目</strong>\n            <span>创建项目后，它会保存在当前用户项目数据中。</span>\n            <button type=\"button\" class=\"story-primary-button story-project-empty-action\" data-story-action=\"new-story\">创建第一个项目</button>\n          </div>") + "\n    </section>\n  </div>";
}
export function renderStoryProjectSortControl(_0xab4908 = "updated-desc") {
  return renderWorkspaceProjectSortControl(_0xab4908);
}
export function getStoryProjectTypeLabel(_0x1665b6 = {}) {
  const _0x57001d = normalizeText(_0x1665b6?.data?.project?.sourceMode);
  if (_0x57001d === "upload-original") {
    return "个人剧本";
  }
  if (_0x57001d === "upload-rewrite") {
    return "AI改写";
  }
  if (_0x57001d === "video-replication") {
    return "复刻视频";
  }
  return "AI剧本";
}
export function renderStoryProjectCard(_0x2be757, {
  isDeleteConfirming = false,
  isMenuOpen = false,
  fallbackTitle = "未命名故事",
  itemCount = null,
  itemLabel = "集",
  coverImageUrls = null,
  emptyCoverLabel = "剧本项目",
  coverAltPrefix = "项目角色封面"
} = {}) {
  const _0x5a63f5 = Array.isArray(_0x2be757?.data?.episodes) ? _0x2be757.data.episodes.length : 0;
  const _0x3d3cd3 = itemCount !== null && itemCount !== undefined && Number.isFinite(Number(itemCount)) ? Math.max(0, Math.trunc(Number(itemCount))) : _0x5a63f5;
  const _0x43295f = getStoryBackgroundTaskSummary(_0x2be757?.data);
  return renderWorkspaceProjectCard(_0x2be757, {
    isDeleteConfirming: isDeleteConfirming,
    isMenuOpen: isMenuOpen,
    fallbackTitle: fallbackTitle,
    itemCount: _0x3d3cd3,
    itemLabel: itemLabel,
    coverImageUrls: resolveStoryProjectCoverImageUrls(_0x2be757, coverImageUrls),
    emptyCoverLabel: emptyCoverLabel,
    coverAltPrefix: coverAltPrefix,
    projectTypeLabel: getStoryProjectTypeLabel(_0x2be757),
    taskSummary: _0x43295f
  });
}
function resolveStoryProjectCoverImageUrls(_0x68ba41, _0x5b03f0 = null) {
  return (Array.isArray(_0x5b03f0) ? _0x5b03f0 : (Array.isArray(_0x68ba41?.data?.assets) ? _0x68ba41.data.assets : []).filter(_0x2a80e7 => _0x2a80e7?.kind === "character").flatMap(_0x30450a => getStoryAssetAppearances(_0x30450a)).map(_0x5b6f89 => _0x5b6f89?.imageUrl)).map(normalizeText).filter((_0x1401db, _0x24cd25, _0x2d986d) => _0x1401db && _0x2d986d.indexOf(_0x1401db) === _0x24cd25).slice(0, 3);
}