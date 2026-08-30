import { renderStoryGenerationSpinner } from "./storyAsyncButtonPresentation.js";
function escapeHtml(_0x330407) {
  return String(_0x330407 ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll("\"", "&quot;").replaceAll("'", "&#39;");
}
function normalizeText(_0x18971e) {
  return String(_0x18971e ?? "").trim();
}
function defaultLocalPathToUrl(_0x10aeb6) {
  return normalizeText(_0x10aeb6);
}
function defaultIsUsableImageUrl(_0x4fdaee) {
  return Boolean(normalizeText(_0x4fdaee));
}
function defaultRenderImageOrEmpty({
  imageUrl = "",
  alt = "",
  className = ""
} = {}) {
  if (imageUrl) {
    return "<img class=\"" + escapeHtml(className) + "\" src=\"" + escapeHtml(imageUrl) + "\" alt=\"" + escapeHtml(alt) + "\" loading=\"lazy\" decoding=\"async\" draggable=\"false\">";
  } else {
    return "<div class=\"" + escapeHtml(className) + " is-empty\" role=\"img\" aria-label=\"" + escapeHtml(alt) + "\"></div>";
  }
}
function defaultRenderEpisodeCardActionIcon() {
  return "";
}
export function createStoryClipProductionPresentation({
  localPathToUrl = defaultLocalPathToUrl,
  isUsableImageUrl = defaultIsUsableImageUrl,
  renderImageOrEmpty = defaultRenderImageOrEmpty,
  renderDeleteIcon = () => "",
  renderEpisodeCardActionIcon = defaultRenderEpisodeCardActionIcon
} = {}) {
  function _0x5452c2(_0x28abd5 = {}) {
    const _0x457c6c = [_0x28abd5.posterUrl, _0x28abd5.thumbUrl, _0x28abd5.thumbnailUrl, _0x28abd5.coverUrl, localPathToUrl(_0x28abd5.posterLocalPath), localPathToUrl(_0x28abd5.thumbLocalPath), localPathToUrl(_0x28abd5.thumbnailLocalPath)];
    return _0x457c6c.map(_0x43654d => normalizeText(_0x43654d)).find(isUsableImageUrl) || "";
  }
  function _0xd986a1(_0x5b2fe1 = {}) {
    const _0xaa069f = Array.isArray(_0x5b2fe1?.video?.results) ? _0x5b2fe1.video.results.filter(_0x39071c => _0x39071c && typeof _0x39071c === "object") : [];
    if (!_0xaa069f.length) {
      return [];
    }
    const _0x52c511 = Math.max(0, Math.min(_0xaa069f.length - 1, Math.trunc(Number(_0x5b2fe1?.video?.activeIndex) || 0)));
    return [_0xaa069f[_0x52c511], ..._0xaa069f.filter((_0x3e89b5, _0x3be27a) => _0x3be27a !== _0x52c511)].filter(_0x50d333 => !normalizeText(_0x50d333.error));
  }
  function _0x35b13f(_0x1d635d = {}) {
    const _0x1e5f88 = Array.isArray(_0x1d635d?.clips) ? _0x1d635d.clips : [];
    for (const _0x1fb711 of _0x1e5f88) {
      for (const _0x32ea3d of _0xd986a1(_0x1fb711)) {
        const _0x23f3b1 = _0x5452c2(_0x32ea3d);
        if (_0x23f3b1) {
          return {
            kind: "image",
            url: _0x23f3b1,
            source: "video-result"
          };
        }
      }
    }
    const _0x4f6611 = normalizeText(_0x1d635d?.coverUrl);
    if (isUsableImageUrl(_0x4f6611)) {
      return {
        kind: "image",
        url: _0x4f6611,
        source: "episode-cover"
      };
    }
    return {
      kind: "empty",
      url: "",
      source: "empty"
    };
  }
  function _0x43f0f1(_0x53b86c = {}) {
    const _0x3de7af = _0x53b86c.media || {
      kind: "empty",
      url: "",
      source: "empty"
    };
    const _0xee4d5 = normalizeText(_0x53b86c.title) || "第 " + (_0x53b86c.number || "") + " 集";
    if (_0x3de7af.kind === "image") {
      return "<img class=\"story-episode-cover\" src=\"" + escapeHtml(_0x3de7af.url) + "\" alt=\"" + escapeHtml(_0xee4d5) + "\" data-story-episode-cover-source=\"" + escapeHtml(_0x3de7af.source) + "\" loading=\"lazy\" decoding=\"async\" draggable=\"false\">";
    }
    return renderImageOrEmpty({
      imageUrl: "",
      alt: _0xee4d5,
      className: "story-episode-cover"
    });
  }
  function _0x168d6a(_0x2ad705 = {}) {
    const {
      id = "",
      number = "",
      title = "",
      status = "",
      characterCount = 0,
      sceneCount = 0,
      propCount = 0,
      clipCount = 0,
      isChecked = false,
      isSelectionMode = false,
      isSplitting = false,
      disabled = false,
      actionKind = "generate",
      actionLabel: _0x5acbd0 = "",
      experimentalActionMarkup = "",
      requestDebugMarkup = "",
      splitDraftMarkup = ""
    } = _0x2ad705;
    const _0x412017 = isSelectionMode ? (isChecked ? "取消选择" : "选择") + "第 " + number + " 集：" + title : (actionKind === "edit" ? "进入" : "生成") + "第 " + number + " 集" + (actionKind === "edit" ? "编辑" : "分镜脚本") + "：" + title;
    const _0x126884 = isSelectionMode ? "" : actionKind === "generate" ? "<button type=\"button\" class=\"story-episode-enter story-episode-enter--" + escapeHtml(actionKind) + "\" data-story-action=\"split-episode\" data-story-episode-id=\"" + escapeHtml(id) + "\" aria-label=\"" + escapeHtml(_0x412017) + "\" " + (disabled ? "disabled" : "") + " aria-busy=\"" + isSplitting + "\">" + (isSplitting ? renderStoryGenerationSpinner({
      button: true
    }) : renderEpisodeCardActionIcon(actionKind)) + "<span class=\"story-episode-enter-label\">" + escapeHtml(isSplitting ? "生成中" : _0x5acbd0) + "</span></button>" : "<span class=\"story-episode-enter story-episode-enter--" + escapeHtml(actionKind) + "\" aria-hidden=\"true\">" + renderEpisodeCardActionIcon(actionKind) + "<span class=\"story-episode-enter-label\">" + escapeHtml(_0x5acbd0) + "</span></span>";
    const _0x1e4ce5 = actionKind === "edit";
    const _0x15a8a2 = "\n      " + (isSelectionMode ? "<span class=\"story-asset-select-indicator\" aria-hidden=\"true\">" + (isChecked ? "✓" : "") + "</span>" : "") + "\n      " + _0x43f0f1(_0x2ad705) + "\n      <span class=\"story-episode-copy\">\n        <span class=\"story-episode-status\">" + escapeHtml(status) + "</span>\n        <span class=\"story-episode-title\">第 " + number + " 集：" + escapeHtml(title) + "</span>\n        <span class=\"story-episode-summary\">角色 " + characterCount + " · 场景 " + sceneCount + " · 道具 " + propCount + " · 片段 " + (clipCount || "待拆分") + "</span>\n        " + _0x126884 + "\n      </span>";
    const _0x40a81a = isSelectionMode || actionKind === "edit";
    const _0x4b4374 = _0x40a81a ? "<button type=\"button\" class=\"story-episode-open\" data-story-select-episode=\"" + escapeHtml(id) + "\" data-story-open-episode=\"" + escapeHtml(id) + "\" aria-label=\"" + escapeHtml(_0x412017) + "\" aria-pressed=\"" + (isSelectionMode ? String(isChecked) : "false") + "\" " + (disabled ? "disabled aria-disabled=\"true\"" : "") + ">" + _0x15a8a2 + "\n    </button>" : "<div class=\"story-episode-open story-episode-open--static\" data-story-select-episode=\"" + escapeHtml(id) + "\" aria-label=\"" + escapeHtml(_0x412017) + "\">" + _0x15a8a2 + "\n    </div>";
    return "<article class=\"story-episode-card " + (isSelectionMode ? "is-selection-mode" : "") + " " + (isChecked ? "is-checked" : "") + " " + (isSplitting ? "is-splitting" : "") + "\" data-story-marquee-item data-story-marquee-id=\"" + escapeHtml(id) + "\" aria-busy=\"" + isSplitting + "\">\n    " + _0x4b4374 + "\n    " + (isSelectionMode ? "" : experimentalActionMarkup) + "\n    " + (isSelectionMode ? "" : requestDebugMarkup) + "\n    " + (isSelectionMode || !_0x1e4ce5 ? "" : "<button type=\"button\" class=\"story-episode-regenerate story-episode-enter story-regenerate-button\" data-story-action=\"regenerate-episode\" data-story-episode-id=\"" + escapeHtml(id) + "\" aria-label=\"重新生成第 " + number + " 集\" " + (disabled ? "disabled" : "") + " aria-busy=\"" + isSplitting + "\">" + (isSplitting ? renderStoryGenerationSpinner({
      button: true
    }) : renderEpisodeCardActionIcon("regenerate")) + "<span class=\"story-episode-enter-label\">" + (isSplitting ? "重新生成中" : "重新生成") + "</span></button>") + "\n    " + (isSelectionMode ? "" : splitDraftMarkup) + "\n    " + (isSplitting ? "<div class=\"story-episode-loading storyboard-script-loading-overlay\" role=\"status\" aria-live=\"polite\">\n      <div class=\"storyboard-script-loading-spinner\"></div>\n      <div class=\"storyboard-script-loading-label\">正在拆分第 " + number + " 集</div>\n      <div class=\"storyboard-script-loading-bar\"><div class=\"storyboard-script-loading-bar-fill\"></div></div>\n    </div>" : "") + "\n  </article>";
  }
  function _0x53a6b7(_0x482d75 = {}) {
    if (_0x482d75.kind === "card") {
      return _0x168d6a(_0x482d75.card);
    }
    const _0x47e7ec = Array.isArray(_0x482d75.cards) ? _0x482d75.cards : [];
    const _0x3f4f47 = _0x482d75.batchControl || {};
    const _0x15755e = Math.max(0, Math.trunc(Number(_0x482d75.selectedCount) || 0));
    const _0xb8cc67 = _0x3f4f47.operation === "splitting-selected";
    const _0x394114 = _0x3f4f47.operation === "splitting-all";
    const _0x3a5c60 = _0xb8cc67 || _0x394114;
    const _0x251754 = _0x3a5c60 ? "<button type=\"button\" class=\"story-primary-button story-main-action-button\" data-story-action=\"cancel-episode-split-batch\" " + (_0x3f4f47.cancelRequested ? "disabled" : "") + " aria-busy=\"true\">" + renderStoryGenerationSpinner({
      button: true
    }) + escapeHtml(_0x3f4f47.cancelRequested ? "正在停止" : "停止批量拆分") + "</button>" : "";
    return "<div class=\"story-episodes-page story-content-page " + (_0x482d75.experimentalMode ? "is-experimental-split-mode" : "") + "\" data-story-marquee-page-surface=\"episodes\" data-story-experimental-mode=\"" + Boolean(_0x482d75.experimentalMode) + "\">\n    <header class=\"story-page-heading\">\n      <div>\n        <span class=\"story-eyebrow\">剧本拆分结果</span>\n        <h2>分集视频</h2>\n      </div>\n      <div class=\"story-heading-actions\">\n        " + (_0x482d75.experimentalModeToggleMarkup || "") + "\n        " + (_0x482d75.selectionMode ? "<button type=\"button\" class=\"story-secondary-button\" data-story-action=\"toggle-all-episodes\" aria-pressed=\"" + Boolean(_0x482d75.allEpisodesSelected) + "\" " + (_0x3f4f47.disabled || !_0x47e7ec.length ? "disabled" : "") + ">" + (_0x482d75.allEpisodesSelected ? "取消全选" : "全选") + "</button><button type=\"button\" class=\"story-secondary-button\" data-story-action=\"cancel-episode-selection\">取消多选</button>" + (_0x3a5c60 ? _0x251754 : "<button type=\"button\" class=\"story-primary-button story-main-action-button\" data-story-action=\"split-selected-episodes\" " + (_0x3f4f47.disabled || !_0x15755e ? "disabled" : "") + " aria-busy=\"false\">拆分选中" + (_0x15755e ? " (" + _0x15755e + ")" : "") + "</button>") : "<button type=\"button\" class=\"story-secondary-button\" data-story-action=\"toggle-episode-selection\" " + (_0x3f4f47.disabled || !_0x47e7ec.length ? "disabled" : "") + ">多选</button>" + (_0x3a5c60 ? _0x251754 : "<button type=\"button\" class=\"story-primary-button story-main-action-button\" data-story-action=\"split-all-episodes\" " + (_0x3f4f47.disabled || !_0x47e7ec.length ? "disabled" : "") + " aria-busy=\"false\">批量拆分</button>")) + "\n      </div>\n    </header>\n    <p class=\"story-page-description\">每一集会形成一套片段脚本；确认后可创建为新的画布页面。</p>\n    <div class=\"story-episode-grid\">\n      " + _0x47e7ec.map(_0x168d6a).join("") + "\n    </div>\n    " + (_0x482d75.footerMarkup || "") + "\n  </div>";
  }
  function _0x36a6de(_0x4db980 = {}) {
    if (isUsableImageUrl(_0x4db980.imageUrl)) {
      return "<img class=\"story-episode-asset-image story-episode-library-asset-image\" src=\"" + escapeHtml(_0x4db980.imageUrl) + "\" alt=\"" + escapeHtml(_0x4db980.name) + "\" loading=\"lazy\" decoding=\"async\">";
    }
    return "<div class=\"story-episode-asset-image story-episode-library-asset-fallback\" data-media-type=\"" + escapeHtml(_0x4db980.mediaKind || "other") + "\" role=\"img\" aria-label=\"" + escapeHtml(_0x4db980.name + "，" + _0x4db980.typeLabel + "素材") + "\"><span>" + escapeHtml(_0x4db980.typeLabel) + "</span></div>";
  }
  function _0x344383(_0x4974fe = []) {
    if (!_0x4974fe.length) {
      return {
        count: 0,
        markup: "<div class=\"story-episode-asset-empty\">\n        <strong>画布素材库暂无可引用素材</strong>\n        <span>在画布中把节点加入素材库后，可在这里直接拖入片段提示词。</span>\n      </div>"
      };
    }
    const _0x4d057a = new Map();
    _0x4974fe.forEach(_0x3f02da => {
      const _0x46915f = normalizeText(_0x3f02da.sourceAssetId) || "ungrouped";
      if (!_0x4d057a.has(_0x46915f)) {
        _0x4d057a.set(_0x46915f, {
          name: normalizeText(_0x3f02da.assetName) || "未分组素材",
          assets: []
        });
      }
      _0x4d057a.get(_0x46915f).assets.push(_0x3f02da);
    });
    return {
      count: _0x4974fe.length,
      markup: Array.from(_0x4d057a.entries()).map(([_0xe9c666, _0x4cf1df]) => "<section data-story-episode-library-group=\"" + escapeHtml(_0xe9c666) + "\">\n      <h3>" + escapeHtml(_0x4cf1df.name) + " · " + _0x4cf1df.assets.length + " 项</h3>\n      <div class=\"story-episode-asset-grid story-episode-library-asset-grid\">\n        " + _0x4cf1df.assets.map(_0x2c7d60 => "<button type=\"button\" draggable=\"true\" data-story-reference-asset=\"" + escapeHtml(_0x2c7d60.sourceAssetId) + "\" data-story-reference-asset-index=\"" + Math.max(0, Math.trunc(Number(_0x2c7d60.sourceItemIndex) || 0)) + "\" data-story-reference-source=\"library\" data-story-reference-media-type=\"" + escapeHtml(_0x2c7d60.mediaKind) + "\" aria-label=\"引用总素材 " + escapeHtml(_0x2c7d60.name) + "，仅可拖入提示词\">\n          " + _0x36a6de(_0x2c7d60) + "\n          <span>" + escapeHtml(_0x2c7d60.name) + "</span>\n          <small>" + escapeHtml(_0x2c7d60.role) + "</small>\n        </button>").join("") + "\n      </div>\n    </section>").join("")
    };
  }
  function _0x24d53a(_0x82a20a) {
    const _0x4e7f02 = _0x82a20a === "frames" ? "<rect x=\"4\" y=\"5\" width=\"16\" height=\"14\" rx=\"2\"/><path d=\"m7 15 3.5-3.5 2.5 2.5 2-2 2 3\"/><circle cx=\"15.5\" cy=\"9\" r=\"1.25\"/>" : _0x82a20a === "library" ? "<rect x=\"4\" y=\"4\" width=\"7\" height=\"7\" rx=\"1.5\"/><rect x=\"13\" y=\"4\" width=\"7\" height=\"7\" rx=\"1.5\"/><rect x=\"4\" y=\"13\" width=\"7\" height=\"7\" rx=\"1.5\"/><rect x=\"13\" y=\"13\" width=\"7\" height=\"7\" rx=\"1.5\"/>" : "<path d=\"M4 6.5h6l1.7 2H20v9.5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z\"/><path d=\"M4 9h16\"/>";
    return "<span class=\"story-episode-asset-tab-icon\" data-icon=\"" + _0x82a20a + "\" aria-hidden=\"true\"><svg viewBox=\"0 0 24 24\" fill=\"none\">" + _0x4e7f02 + "</svg></span>";
  }
  function _0x49c83b(_0x2d57f2 = {}) {
    const _0x433161 = Array.isArray(_0x2d57f2.assets) ? _0x2d57f2.assets : [];
    const _0x494272 = Array.isArray(_0x2d57f2.frames) ? _0x2d57f2.frames : [];
    const _0x3f886f = Array.isArray(_0x2d57f2.clips) ? _0x2d57f2.clips : [];
    const _0x55360 = ["assets", "frames", "library"].includes(_0x2d57f2.activeTab) ? _0x2d57f2.activeTab : "assets";
    const _0x174057 = _0x344383(Array.isArray(_0x2d57f2.libraryAssets) ? _0x2d57f2.libraryAssets : []);
    const _0x43e1fc = ["character", "scene", "prop"].map(_0x301e81 => "<section>\n      <h3>" + escapeHtml(_0x2d57f2.assetKindLabels?.[_0x301e81] || _0x301e81) + "</h3>\n      <div class=\"story-episode-asset-grid\">\n        " + _0x433161.filter(_0x47301f => _0x47301f.kind === _0x301e81).map(_0x101f0c => "<button type=\"button\" draggable=\"true\" data-story-reference-asset=\"" + escapeHtml(_0x101f0c.id) + "\" aria-label=\"引用素材 " + escapeHtml(_0x101f0c.name) + "，仅可拖入提示词\">\n          " + renderImageOrEmpty({
      imageUrl: _0x101f0c.imageUrl,
      alt: _0x101f0c.name,
      className: "story-episode-asset-image"
    }) + "\n          <span>" + escapeHtml(_0x101f0c.name) + "</span>\n        </button>").join("") + "\n      </div>\n    </section>").join("");
    const _0x5b0808 = new Map();
    _0x494272.forEach(_0x1d8603 => {
      const _0x34de6c = normalizeText(_0x1d8603.clipId) || "unassigned";
      if (!_0x5b0808.has(_0x34de6c)) {
        _0x5b0808.set(_0x34de6c, []);
      }
      _0x5b0808.get(_0x34de6c).push(_0x1d8603);
    });
    const _0x575d82 = _0x3f886f.map((_0x6952c3, _0x211cf1) => {
      const _0xf6e4ce = normalizeText(_0x6952c3?.id);
      return {
        clipId: _0xf6e4ce,
        label: normalizeText(_0x6952c3?.title) || "片段 " + (_0x211cf1 + 1),
        frames: _0x5b0808.get(_0xf6e4ce) || []
      };
    }).filter(_0x54d270 => _0x54d270.frames.length > 0);
    const _0x3edfb0 = new Set(_0x575d82.map(_0x2f67fd => _0x2f67fd.clipId));
    _0x5b0808.forEach((_0x4b87bb, _0x2ea376) => {
      if (_0x3edfb0.has(_0x2ea376)) {
        return;
      }
      _0x575d82.push({
        clipId: _0x2ea376,
        label: normalizeText(_0x4b87bb[0]?.clipTitle) || "其他片段",
        frames: _0x4b87bb
      });
    });
    const _0x191e19 = _0x575d82.length ? _0x575d82.map(_0x5ab126 => "<section class=\"story-episode-frame-section\" data-story-clip-frame-group=\"" + escapeHtml(_0x5ab126.clipId) + "\">\n        <h3>" + escapeHtml(_0x5ab126.label) + " · " + _0x5ab126.frames.length + " 项</h3>\n        <div class=\"story-episode-asset-grid story-episode-frame-grid\">\n          " + _0x5ab126.frames.map(_0x48ac2c => {
      const _0x5dfe1c = _0x48ac2c.mediaType === "video";
      const _0x46d956 = "删除" + (_0x5dfe1c ? "视频片段" : "片段帧") + " " + _0x48ac2c.name;
      const _0xaec020 = _0x5dfe1c ? "<div class=\"story-episode-frame-video-wrap\">\n                  <video class=\"story-episode-asset-image story-episode-frame-video\" src=\"" + escapeHtml(_0x48ac2c.mediaUrl) + "\"" + (_0x48ac2c.imageUrl ? " poster=\"" + escapeHtml(_0x48ac2c.imageUrl) + "\"" : "") + " muted playsinline preload=\"metadata\" aria-label=\"" + escapeHtml(_0x48ac2c.name) + "\"></video>\n                  <span class=\"story-episode-frame-video-badge\" aria-hidden=\"true\">视频</span>\n                </div>" : renderImageOrEmpty({
        imageUrl: _0x48ac2c.imageUrl,
        alt: _0x48ac2c.name,
        className: "story-episode-asset-image story-episode-frame-image"
      });
      return "<div class=\"story-episode-frame-card\">\n              <button type=\"button\" draggable=\"true\" data-story-reference-asset=\"" + escapeHtml(_0x48ac2c.mentionId) + "\" data-story-reference-frame=\"" + escapeHtml(_0x48ac2c.id) + "\" data-story-reference-media-type=\"" + escapeHtml(_0x48ac2c.mediaType) + "\" aria-label=\"引用" + (_0x5dfe1c ? "裁剪视频" : "片段帧") + " " + escapeHtml(_0x48ac2c.name) + "，仅可拖入提示词\" aria-busy=\"" + (_0x48ac2c.captureSavePending === true) + "\">\n                " + _0xaec020 + "\n                <span>" + escapeHtml(_0x48ac2c.name) + "</span>\n              </button>\n              <button type=\"button\" class=\"story-action-icon-button is-danger story-project-delete-trigger story-card-delete-button story-episode-frame-delete-trigger\" data-story-action=\"delete-clip-frame\" data-story-clip-frame-id=\"" + escapeHtml(_0x48ac2c.id) + "\" aria-label=\"" + escapeHtml(_0x46d956) + "\" " + (_0x48ac2c.captureSavePending === true ? "disabled" : "") + ">" + renderDeleteIcon() + "</button>\n            </div>";
    }).join("") + "\n        </div>\n      </section>").join("") : "<div class=\"story-episode-asset-empty\">\n        <strong>还没有片段帧</strong>\n        <span>在右侧视频预览中截取当前帧，或点击裁剪按钮提取视频片段。</span>\n      </div>";
    return "<aside class=\"story-episode-assets\" data-story-episode-asset-rail data-active-tab=\"" + _0x55360 + "\">\n    <header class=\"story-episode-asset-rail-header\">\n      <div class=\"story-episode-asset-rail-tabs\" role=\"tablist\" aria-label=\"剧本素材类型\">\n        <button type=\"button\" class=\"" + (_0x55360 === "assets" ? "is-active" : "") + "\" data-story-episode-asset-tab=\"assets\" role=\"tab\" aria-selected=\"" + (_0x55360 === "assets") + "\">\n          " + _0x24d53a("assets") + "<span class=\"story-episode-asset-tab-label\">本集素材</span><span class=\"story-episode-asset-count\" data-story-episode-asset-count=\"assets\">" + _0x433161.length + "</span>\n        </button>\n        <button type=\"button\" class=\"" + (_0x55360 === "frames" ? "is-active" : "") + "\" data-story-episode-asset-tab=\"frames\" role=\"tab\" aria-selected=\"" + (_0x55360 === "frames") + "\">\n          " + _0x24d53a("frames") + "<span class=\"story-episode-asset-tab-label\">片段帧</span><span class=\"story-episode-asset-count\" data-story-episode-asset-count=\"frames\">" + _0x494272.length + "</span>\n        </button>\n        <button type=\"button\" class=\"" + (_0x55360 === "library" ? "is-active" : "") + "\" data-story-episode-asset-tab=\"library\" role=\"tab\" aria-selected=\"" + (_0x55360 === "library") + "\">\n          " + _0x24d53a("library") + "<span class=\"story-episode-asset-tab-label\">总素材</span><span class=\"story-episode-asset-count\" data-story-episode-asset-count=\"library\">" + _0x174057.count + "</span>\n        </button>\n      </div>\n      <small data-story-episode-asset-help>" + escapeHtml(_0x2d57f2.helpText) + "</small>\n    </header>\n    <div class=\"story-episode-asset-rail-viewport\">\n      <div class=\"story-episode-asset-rail-track\" data-story-episode-asset-rail-track>\n        <div class=\"story-episode-asset-rail-page " + (_0x55360 === "assets" ? "is-active" : "") + "\" data-story-episode-asset-panel=\"assets\" role=\"tabpanel\" aria-hidden=\"" + (_0x55360 !== "assets") + "\">\n          " + _0x43e1fc + "\n        </div>\n        <div class=\"story-episode-asset-rail-page " + (_0x55360 === "frames" ? "is-active" : "") + "\" data-story-episode-asset-panel=\"frames\" role=\"tabpanel\" aria-hidden=\"" + (_0x55360 !== "frames") + "\">\n          " + _0x191e19 + "\n        </div>\n        <div class=\"story-episode-asset-rail-page " + (_0x55360 === "library" ? "is-active" : "") + "\" data-story-episode-asset-panel=\"library\" role=\"tabpanel\" aria-hidden=\"" + (_0x55360 !== "library") + "\">\n          " + _0x174057.markup + "\n        </div>\n      </div>\n    </div>\n  </aside>";
  }
  function _0x491448(_0x5d1d33 = {}) {
    const _0x12f6d1 = _0x5d1d33.ratios || {
      left: 24,
      center: 44
    };
    return "<div class=\"story-episode-detail-page\">\n    " + (_0x5d1d33.assetRailMarkup || "") + "\n    <div class=\"story-episode-splitter story-episode-splitter--assets panel-resize-handle panel-resize-handle--transient\" data-story-episode-splitter=\"assets\" role=\"separator\" aria-orientation=\"vertical\" aria-label=\"调整本集素材区域宽度\" aria-valuemin=\"14\" aria-valuemax=\"34\" aria-valuenow=\"" + Math.round(Number(_0x12f6d1.left) || 0) + "\" tabindex=\"0\"></div>\n    <section class=\"story-clip-editor\">\n      <header>\n        <h2>" + escapeHtml(_0x5d1d33.title || "片段脚本") + "</h2>\n      </header>\n      <div class=\"story-clip-context-row\">\n        <div class=\"story-clip-meta\">\n          " + (Array.isArray(_0x5d1d33.clipMeta) ? _0x5d1d33.clipMeta : []).map(_0x458113 => "<span>" + escapeHtml(_0x458113) + "</span>").join("") + "\n        </div>\n        " + (_0x5d1d33.referenceSummary || "") + "\n      </div>\n      " + (_0x5d1d33.promptSurface || "") + "\n    </section>\n    <div class=\"story-episode-splitter story-episode-splitter--preview panel-resize-handle panel-resize-handle--transient\" data-story-episode-splitter=\"preview\" role=\"separator\" aria-orientation=\"vertical\" aria-label=\"调整脚本与视频结果区域宽度\" aria-valuemin=\"38\" aria-valuemax=\"76\" aria-valuenow=\"" + Math.round((Number(_0x12f6d1.left) || 0) + (Number(_0x12f6d1.center) || 0)) + "\" tabindex=\"0\"></div>\n    <section class=\"story-video-preview\" data-story-clip-navigation=\"" + Boolean(_0x5d1d33.hasMultipleClips) + "\" " + (_0x5d1d33.hasMultipleClips ? "tabindex=\"0\" aria-label=\"滚动鼠标滚轮或按左右方向键切换上一幕、下一幕\"" : "") + ">\n      " + (_0x5d1d33.navigationMarkup || "") + "\n      <div class=\"story-clip-preview-slide\" data-story-clip-preview-slide>\n        " + (_0x5d1d33.videoPreview || "") + "\n      </div>\n    </section>\n    " + (_0x5d1d33.timeline || "") + "\n  </div>";
  }
  return Object.freeze({
    renderAssetRail: _0x49c83b,
    renderDetail: _0x491448,
    renderOverview: _0x53a6b7,
    resolveEpisodeCardMedia: _0x35b13f
  });
}