function escapeHtml(_0x4321a9) {
  return String(_0x4321a9 ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll("\"", "&quot;").replaceAll("'", "&#39;");
}
function normalizeText(_0x20aedc) {
  return String(_0x20aedc ?? "").trim();
}
const STORY_CONTRACT_FIELD_LABELS = Object.freeze({
  protagonistGoal: "主角目标",
  centralConflict: "核心冲突",
  stakes: "失败代价",
  progressionDriver: "推进动力",
  constraints: "约束条件",
  climax: "高潮事件",
  ending: "明确结局"
});
function renderWorkflowLoading(_0x96db0e) {
  return "<div class=\"story-script-workflow-loading\" role=\"status\" aria-live=\"polite\">\n    <span class=\"storyboard-script-loading-spinner\" aria-hidden=\"true\"></span>\n    <span>" + escapeHtml(_0x96db0e) + "</span>\n  </div>";
}
function renderOutlineField(_0x18b1ea, _0x24b6b2, _0x236cc5, {
  singleLine = false
} = {}) {
  const _0x12a40b = singleLine ? "<input type=\"text\" value=\"" + escapeHtml(_0x24b6b2 || "") + "\" data-story-outline-field=\"" + escapeHtml(_0x236cc5) + "\">" : "<textarea data-story-outline-field=\"" + escapeHtml(_0x236cc5) + "\">" + escapeHtml(_0x24b6b2 || "") + "</textarea>";
  return "<label class=\"story-outline-field\"><span>" + escapeHtml(_0x18b1ea) + "</span>" + _0x12a40b + "</label>";
}
function renderSummaryCharacterField(_0x3a7d3f, _0x23facb, _0xee3812, _0x17aa64, {
  multiline = true,
  value = _0x3a7d3f?.[_0xee3812] || ""
} = {}) {
  const _0x59c53a = "data-story-summary-character-index=\"" + _0x23facb + "\" data-story-summary-character-field=\"" + escapeHtml(_0xee3812) + "\" aria-label=\"" + escapeHtml(_0x17aa64) + "\"";
  const _0x2fecc4 = multiline ? "<textarea " + _0x59c53a + ">" + escapeHtml(value) + "</textarea>" : "<input type=\"text\" value=\"" + escapeHtml(value) + "\" " + _0x59c53a + ">";
  return "<label><b>" + escapeHtml(_0x17aa64) + "：</b>" + _0x2fecc4 + "</label>";
}
function renderSummaryCharacters(_0x2c788c = []) {
  if (!_0x2c788c.length) {
    return "";
  }
  return "<div class=\"story-summary-characters\">\n    <span class=\"story-summary-label\">人物小传</span>\n    " + _0x2c788c.map((_0x18a966, _0x4a346c) => "<article class=\"story-summary-character\">\n      <input class=\"story-summary-character-name\" type=\"text\" value=\"" + escapeHtml(_0x18a966.name || "") + "\" placeholder=\"未命名角色\" data-story-summary-character-index=\"" + _0x4a346c + "\" data-story-summary-character-field=\"name\" aria-label=\"角色姓名\">\n      <div class=\"story-summary-character-fields\">\n        " + renderSummaryCharacterField(_0x18a966, _0x4a346c, "roleType", "角色类型", {
    multiline: false,
    value: _0x18a966.roleType || "其他角色"
  }) + "\n        " + renderSummaryCharacterField(_0x18a966, _0x4a346c, "fixedTraits", "剧情固定特征", {
    value: _0x18a966.fixedTraits || _0x18a966.visualAppearance || ""
  }) + "\n        " + renderSummaryCharacterField(_0x18a966, _0x4a346c, "coreTags", "核心标签", {
    multiline: false,
    value: Array.isArray(_0x18a966.coreTags) ? _0x18a966.coreTags.join("、") : ""
  }) + "\n        " + renderSummaryCharacterField(_0x18a966, _0x4a346c, "profile", "身份背景") + "\n        " + renderSummaryCharacterField(_0x18a966, _0x4a346c, "motivation", "核心动机") + "\n        " + renderSummaryCharacterField(_0x18a966, _0x4a346c, "personality", "性格特点") + "\n        " + renderSummaryCharacterField(_0x18a966, _0x4a346c, "relationships", "角色关系") + "\n        " + renderSummaryCharacterField(_0x18a966, _0x4a346c, "arc", "成长弧线") + "\n      </div>\n    </article>").join("") + "\n  </div>";
}
function renderStoryContract(_0x363e3d = {}) {
  return "<div class=\"story-summary-characters\">\n    <span class=\"story-summary-label\">故事契约</span>\n    <article class=\"story-summary-character\">\n      <div class=\"story-summary-character-fields\">\n        " + Object.entries(STORY_CONTRACT_FIELD_LABELS).map(([_0x1abde7, _0x1d15ca]) => "<label><b>" + escapeHtml(_0x1d15ca) + "：</b><textarea data-story-contract-field=\"" + escapeHtml(_0x1abde7) + "\">" + escapeHtml(_0x363e3d?.[_0x1abde7] || "") + "</textarea></label>").join("") + "\n      </div>\n    </article>\n  </div>";
}
function renderPlotBeats(_0x49d7fe = []) {
  if (!Array.isArray(_0x49d7fe) || !_0x49d7fe.length) {
    return "";
  }
  return "<div class=\"story-summary-characters\">\n    <span class=\"story-summary-label\">因果剧情节点</span>\n    " + _0x49d7fe.map((_0xa0f1c4, _0xa9077f) => "<article class=\"story-summary-character\">\n      <input class=\"story-summary-character-name\" type=\"text\" value=\"" + escapeHtml(_0xa0f1c4?.stage || "") + "\" data-story-plot-beat-index=\"" + _0xa9077f + "\" data-story-plot-beat-field=\"stage\" aria-label=\"剧情阶段\">\n      <div class=\"story-summary-character-fields\">\n        <label><b>关键事件：</b><textarea data-story-plot-beat-index=\"" + _0xa9077f + "\" data-story-plot-beat-field=\"event\">" + escapeHtml(_0xa0f1c4?.event || "") + "</textarea></label>\n        <label><b>造成结果：</b><textarea data-story-plot-beat-index=\"" + _0xa9077f + "\" data-story-plot-beat-field=\"consequence\">" + escapeHtml(_0xa0f1c4?.consequence || "") + "</textarea></label>\n      </div>\n    </article>").join("") + "\n  </div>";
}
function renderContinuityFacts(_0x1ff8ba = []) {
  return "<label class=\"story-outline-field\">\n    <span>连续性事实</span>\n    <textarea data-story-continuity-facts placeholder=\"每行一条，例如关系阶段、承诺、秘密、身份、线索、能力或物品归属\">" + escapeHtml((Array.isArray(_0x1ff8ba) ? _0x1ff8ba : []).join("\n")) + "</textarea>\n  </label>";
}
function renderSummary(_0x349efd = {}) {
  if (_0x349efd.status === "generating") {
    return renderWorkflowLoading(_0x349efd.loadingMessage || "正在根据原始创意生成剧本摘要...");
  }
  if (!normalizeText(_0x349efd.synopsis)) {
    return "<div class=\"story-inline-empty\">剧本摘要尚未生成。</div>";
  }
  return "<div class=\"story-summary-content\">\n    " + (_0x349efd.isStale ? "<div class=\"story-inline-empty\">故事蓝图已修改，现有分集大纲和正文仍然保留；点击“重新运行”后更新下游内容。</div>" : "") + "\n    <div class=\"story-summary-meta-grid\">\n      <label><span>分集目标</span><strong>" + Math.max(1, Math.trunc(Number(_0x349efd.episodeCount) || 1)) + " 集</strong></label>\n      <label><span>故事类型</span><input type=\"text\" value=\"" + escapeHtml(_0x349efd.storyType || "") + "\" data-story-outline-field=\"story-type\"></label>\n      <label><span>目标受众</span><input type=\"text\" value=\"" + escapeHtml(_0x349efd.targetAudience || "") + "\" data-story-outline-field=\"story-target-audience\"></label>\n    </div>\n    " + renderOutlineField("一句话故事", _0x349efd.logline, "story-logline") + "\n    " + renderOutlineField("核心梗", _0x349efd.coreHook, "story-core-hook", {
    singleLine: true
  }) + "\n    " + renderOutlineField("故事梗概", _0x349efd.synopsis, "story-summary") + "\n    <div class=\"story-summary-secondary-fields\">\n      " + renderOutlineField("故事背景", _0x349efd.background, "story-background") + "\n      " + renderOutlineField("故事设定", _0x349efd.setting, "story-setting") + "\n    </div>\n    " + renderStoryContract(_0x349efd.contract) + "\n    " + renderPlotBeats(_0x349efd.plotBeats) + "\n    " + renderContinuityFacts(_0x349efd.continuityFacts) + "\n    " + renderSummaryCharacters(_0x349efd.characters) + "\n  </div>";
}
function renderInlineRegenerationControl({
  target = "",
  prompt = "",
  confirmLabel = "",
  episodeId = "",
  placement = "heading",
  isConfirming = false,
  disabled = false
} = {}) {
  const _0xb0e435 = normalizeText(target);
  if (!_0xb0e435) {
    return "";
  }
  const _0x1c0ac3 = escapeHtml(_0xb0e435);
  const _0x3602c2 = normalizeText(episodeId) ? " data-story-episode-id=\"" + escapeHtml(episodeId) + "\"" : "";
  if (!isConfirming) {
    return "<span class=\"story-inline-regeneration-control is-" + escapeHtml(placement) + "\">\n      <button type=\"button\" class=\"story-inline-regeneration-button story-regenerate-button\" data-story-action=\"request-inline-regeneration\" data-story-regeneration-target=\"" + _0x1c0ac3 + "\"" + _0x3602c2 + " aria-label=\"" + escapeHtml(confirmLabel) + "\" " + (disabled ? "disabled" : "") + ">" + escapeHtml(confirmLabel) + "</button>\n    </span>";
  }
  return "<span class=\"story-inline-regeneration-control is-" + escapeHtml(placement) + " is-confirming\" data-story-regeneration-confirm=\"" + _0x1c0ac3 + "\" role=\"group\" aria-label=\"" + escapeHtml(prompt) + "\">\n    <span class=\"story-inline-regeneration-prompt\">" + escapeHtml(prompt) + "</span>\n    <button type=\"button\" class=\"story-inline-regeneration-button story-regenerate-button is-confirm\" data-story-action=\"confirm-inline-regeneration\" data-story-regeneration-target=\"" + _0x1c0ac3 + "\"" + _0x3602c2 + " aria-label=\"" + escapeHtml(confirmLabel) + "\" " + (disabled ? "disabled" : "") + ">确认</button>\n    <button type=\"button\" class=\"story-inline-regeneration-button story-regenerate-button is-cancel\" data-story-action=\"cancel-inline-regeneration\" aria-label=\"取消重新生成\">取消</button>\n  </span>";
}
function renderEpisodeScriptBody(_0x57b3c7 = {}, _0x39466c = 1) {
  if (!_0x57b3c7.scriptFullText) {
    return "";
  }
  return "<label class=\"story-episode-full-script\">\n    <span>完整分场剧本</span>\n    <textarea data-story-episode-script=\"" + escapeHtml(_0x57b3c7.id) + "\">" + escapeHtml(_0x57b3c7.scriptFullText) + "</textarea>\n  </label>\n  " + (_0x57b3c7.allowRegeneration ? "<div class=\"story-episode-completed-actions\">\n    " + renderInlineRegenerationControl({
    target: "episode-script:" + _0x57b3c7.id,
    prompt: "是否重新生成第 " + _0x39466c + " 集正文？本集及后续正文、素材将清空",
    confirmLabel: "重新生成第 " + _0x39466c + " 集正文",
    episodeId: _0x57b3c7.id,
    placement: "episode",
    ..._0x57b3c7.regeneration
  }) + "\n  </div>" : "");
}
function renderEpisodeItem(_0x175cdc = {}) {
  const _0x272770 = Math.max(0, Math.trunc(Number(_0x175cdc.index) || 0));
  const _0x347a03 = Math.max(1, Math.trunc(Number(_0x175cdc.number) || _0x272770 + 1));
  const _0x144733 = _0x175cdc.isGenerating ? {
    className: "is-generating",
    label: "正在生成"
  } : _0x175cdc.isComplete ? {
    className: "is-complete",
    label: "已生成"
  } : null;
  const _0x458ab9 = _0x175cdc.canSelect ? " data-story-select-script-episode=\"" + escapeHtml(_0x175cdc.id) + "\"" : "";
  return "<details class=\"story-episode-outline-item " + (_0x175cdc.isComplete ? "is-complete" : "is-pending") + "\" data-story-outline-section=\"episode-" + escapeHtml(_0x175cdc.id) + "\" " + (_0x175cdc.isOpen ? "open" : "") + ">\n    <summary" + _0x458ab9 + ">\n      " + (_0x175cdc.selectionMode && !_0x175cdc.isComplete ? "<button type=\"button\" class=\"story-script-select " + (_0x175cdc.isSelected ? "is-selected" : "") + "\" data-story-action=\"select-script-episode\" data-story-episode-id=\"" + escapeHtml(_0x175cdc.id) + "\" aria-label=\"" + (_0x175cdc.isSelected ? "取消选择" : "选择") + "第 " + _0x347a03 + " 集\" aria-pressed=\"" + Boolean(_0x175cdc.isSelected) + "\" " + (_0x175cdc.canSelect ? "" : "disabled") + "></button>" : "<span class=\"story-episode-outline-number\">" + (_0x272770 + 1) + ".</span>") + "\n      <strong>第 " + _0x347a03 + " 集" + (_0x175cdc.isComplete && _0x175cdc.title ? " · " + escapeHtml(_0x175cdc.title) : "") + "</strong>\n      " + (_0x144733 ? "<span class=\"story-episode-script-status " + _0x144733.className + "\">" + _0x144733.label + "</span>" : "") + "\n    </summary>\n    <div class=\"story-episode-outline-body\">\n      " + (_0x175cdc.isGenerating ? renderWorkflowLoading(_0x175cdc.generationMessage || "正在生成第 " + _0x347a03 + " 集完整剧本") : _0x175cdc.isComplete ? renderEpisodeScriptBody(_0x175cdc, _0x347a03) : "<label class=\"story-episode-synopsis-field\">\n              <span>分集简介</span>\n              <textarea data-story-episode-synopsis=\"" + escapeHtml(_0x175cdc.id) + "\">" + escapeHtml(_0x175cdc.synopsis || "") + "</textarea>\n            </label>\n            " + (_0x175cdc.hook ? "<label class=\"story-episode-synopsis-field story-episode-hook-field\">\n              <span>结尾钩子</span>\n              <textarea rows=\"1\" data-story-episode-hook=\"" + escapeHtml(_0x175cdc.id) + "\">" + escapeHtml(_0x175cdc.hook) + "</textarea>\n            </label>" : "") + "\n            " + (_0x175cdc.canGenerate ? "<div class=\"story-episode-script-action\">\n              <button type=\"button\" class=\"story-secondary-button\" data-story-action=\"generate-episode-script\" data-story-episode-id=\"" + escapeHtml(_0x175cdc.id) + "\" " + (_0x175cdc.disabled ? "disabled" : "") + ">生成此集</button>\n            </div>" : "")) + "\n    </div>\n  </details>";
}
function renderEpisodeSection(_0xadd068 = {}) {
  if (_0xadd068.isOutlineGenerating) {
    return renderWorkflowLoading(_0xadd068.loadingMessage || "正在生成所有分集大纲...");
  }
  const _0x3029ad = Array.isArray(_0xadd068.episodes) ? _0xadd068.episodes : [];
  if (!_0x3029ad.length) {
    return "";
  }
  const _0x35762c = _0xadd068.isUploadedOriginal ? "已按原剧本结构导入，正文未扩写" : _0xadd068.isStale ? "故事蓝图已修改；当前内容保留为旧版本，请先重新运行分集规划" : _0xadd068.complete ? "完整分集剧本已全部完成" : "分集大纲已完成，请按顺序生成正文";
  return "<section class=\"story-script-episodes-section\">\n    <header class=\"story-script-episodes-heading\">\n      <div><h2>共 " + _0x3029ad.length + " 集</h2><p>" + _0x35762c + "</p></div>\n      " + (_0xadd068.complete || _0xadd068.isStale ? "" : _0xadd068.selectionMode ? "<div class=\"story-script-selection-actions\">\n            <button type=\"button\" class=\"story-secondary-button\" data-story-action=\"cancel-script-selection\">" + (_0xadd068.batchGenerating ? "退出多选" : "取消") + "</button>\n            <button type=\"button\" class=\"story-secondary-button\" data-story-action=\"select-all-script-episodes\"" + (_0xadd068.batchGenerating ? " disabled" : "") + ">全选</button>\n            " + (_0xadd068.batchGenerating ? "<button type=\"button\" class=\"story-primary-button\" data-story-action=\"cancel-episode-scripts-batch\" aria-label=\"取消尚未开始的分集\" " + (_0xadd068.batchCancelRequested ? "disabled" : "") + ">" + (_0xadd068.batchCancelRequested ? "已取消排队" : "取消") + "</button>" : "<button type=\"button\" class=\"story-primary-button\" data-story-action=\"generate-episode-scripts-batch\" data-story-script-batch-scope=\"selected\" " + (_0xadd068.busy || !_0xadd068.batchCount ? "disabled" : "") + ">批量生成" + (_0xadd068.batchCount ? " (" + _0xadd068.batchCount + ")" : "") + "</button>") + "\n          </div>" : "<button type=\"button\" class=\"story-secondary-button\" data-story-action=\"toggle-script-selection\">批量选择</button>") + "\n    </header>\n    <div class=\"story-episode-outline-list\">\n      " + _0x3029ad.map(renderEpisodeItem).join("") + "\n    </div>\n  </section>";
}
function renderOutlineNavigation(_0x2d9391 = {}) {
  const _0x27feb0 = Array.isArray(_0x2d9391.episodeSection?.episodes) ? _0x2d9391.episodeSection.episodes : [];
  const _0x30d379 = _0x27feb0.length || _0x2d9391.episodeSection?.isOutlineGenerating;
  return "<aside class=\"story-outline-nav-shell\" data-story-outline-nav aria-label=\"剧本目录\">\n    <button type=\"button\" class=\"story-outline-nav-trigger\" data-story-outline-nav-toggle aria-expanded=\"false\">目录</button>\n    <nav class=\"story-outline-nav-panel\" aria-label=\"剧本内容导航\">\n      <strong>剧本目录</strong>\n      " + (_0x2d9391.isUploadedOriginal ? "" : "<button type=\"button\" class=\"story-outline-nav-section\" data-story-outline-nav-target=\"summary\">剧本摘要</button>") + "\n      " + (_0x30d379 ? "<div class=\"story-outline-nav-group\">\n        <button type=\"button\" class=\"story-outline-nav-section\" data-story-outline-nav-target=\"episodes\">分集剧本</button>\n        " + (_0x27feb0.length ? "<div class=\"story-outline-nav-episodes\">\n          " + _0x27feb0.map(_0xfed7ba => {
    const _0xd12dc1 = _0xfed7ba.isComplete && _0xfed7ba.title ? "第 " + _0xfed7ba.number + " 集 · " + _0xfed7ba.title : "第 " + _0xfed7ba.number + " 集";
    return "<button type=\"button\" data-story-outline-nav-target=\"episode-" + escapeHtml(_0xfed7ba.id) + "\"><span>" + _0xfed7ba.number + ".</span><span>" + escapeHtml(_0xd12dc1) + "</span></button>";
  }).join("") + "\n        </div>" : "") + "\n      </div>" : "") + "\n    </nav>\n  </aside>";
}
function renderPlanningPage(_0x15e0b1 = {}) {
  const _0xe853da = _0x15e0b1.episodeSection || {};
  const _0x4aa528 = _0x15e0b1.isUploadedOriginal ? "原始剧本" : _0x15e0b1.isUploadedRewrite ? "参考剧本" : "原始创意";
  const _0x4d8912 = Array.isArray(_0xe853da.episodes) && _0xe853da.episodes.length > 0 || _0xe853da.isOutlineGenerating;
  return "<div class=\"story-outline-page story-content-page story-script-workflow-page\">\n    " + renderOutlineNavigation(_0x15e0b1) + "\n    <div class=\"story-script-workflow-card\">\n      <details class=\"story-script-accordion\" data-story-outline-section=\"original\" " + (_0x15e0b1.originalOpen ? "open" : "") + ">\n        <summary><span class=\"story-script-accordion-summary-row\"><span class=\"story-script-accordion-title\">" + _0x4aa528 + "</span></span></summary>\n        <div class=\"story-original-creative\">" + escapeHtml(_0x15e0b1.originalCreative || "未记录原始创意") + "</div>\n        " + (_0x15e0b1.isUploadedRewrite ? "<div class=\"story-rewrite-instruction\"><strong>改写要求</strong><p>" + escapeHtml(_0x15e0b1.rewriteInstruction || "未记录改写要求") + "</p></div>" : "") + "\n      </details>\n      " + (_0x15e0b1.isUploadedOriginal ? "" : "<details class=\"story-script-accordion\" data-story-outline-section=\"summary\" " + (_0x15e0b1.summaryOpen ? "open" : "") + ">\n        <summary><span class=\"story-script-accordion-summary-row\">\n          <span class=\"story-script-accordion-title\">剧本摘要</span>\n          " + (normalizeText(_0x15e0b1.summary?.synopsis) && _0x15e0b1.summary?.status !== "generating" ? renderInlineRegenerationControl({
    target: "summary",
    prompt: "是否重新生成剧本摘要？分集大纲、分集正文和素材将全部清空",
    confirmLabel: "重新生成剧本摘要",
    ..._0x15e0b1.summaryRegeneration
  }) : "") + "\n        </span></summary>\n        " + renderSummary(_0x15e0b1.summary) + "\n      </details>") + "\n      " + (_0x4d8912 ? "<details class=\"story-script-accordion\" data-story-outline-section=\"episodes\" " + (_0x15e0b1.episodesOpen ? "open" : "") + ">\n        <summary><span class=\"story-script-accordion-summary-row\">\n          <span class=\"story-script-accordion-title\">分集剧本</span>\n          " + (!_0x15e0b1.isUploadedOriginal && _0xe853da.episodes?.length && ["completed", "stale"].includes(_0x15e0b1.outlineStatus) ? renderInlineRegenerationControl({
    target: "episode-outlines",
    prompt: _0x15e0b1.outlineStatus === "stale" ? "是否按修改后的故事蓝图重新运行？分集正文和素材将全部清空" : "是否重新生成分集大纲？分集正文和素材将全部清空",
    confirmLabel: _0x15e0b1.outlineStatus === "stale" ? "重新运行" : "重新生成分集大纲",
    ..._0x15e0b1.outlineRegeneration
  }) : "") + "\n        </span></summary>\n        " + renderEpisodeSection(_0xe853da) + "\n      </details>" : "") + "\n    </div>\n    " + (_0x15e0b1.footerMarkup || "") + "\n  </div>";
}
function renderPlanning(_0x3080f8 = {}) {
  if (_0x3080f8.kind === "episode-item") {
    return renderEpisodeItem(_0x3080f8.item);
  }
  if (_0x3080f8.kind === "episode-section") {
    return renderEpisodeSection(_0x3080f8.section);
  }
  return renderPlanningPage(_0x3080f8.page);
}
function renderAssetBreakdown(_0x41679e = {}) {
  const _0x3d0d78 = Array.isArray(_0x41679e.episodes) ? _0x41679e.episodes : [];
  return "<div class=\"story-asset-breakdown-page story-content-page\" data-story-asset-breakdown>\n    <header class=\"story-asset-breakdown-heading\">\n      <h1>剧本素材拆解</h1>\n    </header>\n    <section class=\"story-asset-breakdown-card\" aria-busy=\"true\">\n      <div class=\"story-asset-breakdown-list\">\n        " + _0x3d0d78.map((_0x345c41, _0x3e82a7) => "<article class=\"story-asset-breakdown-episode\" data-story-asset-breakdown-episode=\"" + escapeHtml(_0x345c41.id) + "\">\n          <h2 class=\"story-asset-breakdown-episode-heading\">\n            <span>第 " + _0x345c41.number + " 集</span>\n            " + (_0x3e82a7 === 0 ? "<span class=\"story-asset-breakdown-inline-status\" data-story-asset-breakdown-inline-status role=\"status\" aria-live=\"polite\">\n              <span class=\"storyboard-script-loading-spinner\" aria-hidden=\"true\"></span>\n              <span>剧情解析中</span>\n            </span>" : "") + "\n          </h2>\n          <p>" + escapeHtml(_0x345c41.synopsis || "本集剧情大纲待补充。") + "</p>\n        </article>").join("") + "\n      </div>\n      <div class=\"story-asset-breakdown-status\" data-story-asset-breakdown-status role=\"status\" aria-live=\"polite\">\n        <span class=\"storyboard-script-loading-spinner\" aria-hidden=\"true\"></span>\n        <span>剧情解析中</span>\n      </div>\n    </section>\n  </div>";
}
export function createStoryScriptPlanningPresentation() {
  return Object.freeze({
    renderAssetBreakdown: renderAssetBreakdown,
    renderPlanning: renderPlanning
  });
}