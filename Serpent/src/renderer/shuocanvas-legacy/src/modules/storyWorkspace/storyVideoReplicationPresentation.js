function escapeHtml(_0x532c0c) {
  return String(_0x532c0c ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll("\"", "&quot;").replaceAll("'", "&#39;");
}
function formatBytes(_0x211f10) {
  const _0x2c9927 = Math.max(0, Number(_0x211f10) || 0);
  if (_0x2c9927 < 1048576) {
    return Math.max(1, Math.round(_0x2c9927 / 1024)) + "KB";
  }
  return (_0x2c9927 / 1048576).toFixed(1) + "MB";
}
function getStatusView(_0x42eac8 = {}) {
  const _0x5d1528 = _0x42eac8?.replication?.status || "queued";
  if (_0x5d1528 === "uploading") {
    return {
      label: "上传中",
      busy: true
    };
  }
  if (_0x5d1528 === "analyzing") {
    return {
      label: "解析中",
      busy: true
    };
  }
  if (_0x5d1528 === "ready") {
    return {
      label: "解析完成",
      busy: false
    };
  }
  if (_0x5d1528 === "failed") {
    return {
      label: "解析失败",
      busy: false
    };
  }
  return {
    label: "等待解析",
    busy: true
  };
}
function renderVideoCard(_0x34695b = {}, _0x39edb7 = 0) {
  const _0x2a618f = _0x34695b.sourceVideo || {};
  const _0x434dd5 = getStatusView(_0x34695b);
  const _0x21e4f7 = String(_0x2a618f.posterUrl || _0x34695b.coverUrl || "").trim();
  const _0x3f5182 = String(_0x34695b?.replication?.error || "").trim();
  const _0x4c16ae = _0x34695b?.replication?.status === "failed" && !_0x2a618f.videoRef;
  return "<article class=\"story-episode-card story-replication-card is-" + escapeHtml(_0x34695b?.replication?.status || "queued") + "\" data-story-replication-episode-id=\"" + escapeHtml(_0x34695b.id) + "\" draggable=\"false\" aria-busy=\"" + _0x434dd5.busy + "\">\n    <span class=\"story-replication-drag-handle\" data-story-replication-drag-handle draggable=\"true\" role=\"button\" tabindex=\"0\" aria-label=\"拖动调整第 " + (_0x39edb7 + 1) + " 集顺序\" title=\"拖动调整顺序\"><span></span><span></span><span></span><span></span><span></span><span></span></span>\n    <button type=\"button\" class=\"story-replication-preview\" data-story-action=\"preview-replication-video\" data-story-replication-episode-id=\"" + escapeHtml(_0x34695b.id) + "\" aria-label=\"播放第 " + (_0x39edb7 + 1) + " 集原视频\" " + (_0x2a618f.videoRef ? "" : "disabled") + ">\n      <img" + (_0x21e4f7 ? " src=\"" + escapeHtml(_0x21e4f7) + "\"" : "") + " alt=\"第 " + (_0x39edb7 + 1) + " 集视频首帧\" draggable=\"false\" " + (_0x21e4f7 ? "" : "hidden") + ">\n      <span class=\"story-replication-poster-placeholder\" " + (_0x21e4f7 ? "hidden" : "") + " aria-hidden=\"true\">▶</span>\n      <span class=\"story-replication-play\" aria-hidden=\"true\">▶</span>\n    </button>\n    <div class=\"story-episode-copy story-replication-copy\">\n      <div class=\"story-replication-title-row\">\n        <strong data-story-replication-number>第 " + (_0x39edb7 + 1) + " 集</strong>\n        <span class=\"story-replication-status\" data-story-replication-status>" + escapeHtml(_0x434dd5.label) + "</span>\n      </div>\n      <h3 data-story-replication-title>" + escapeHtml(_0x34695b.title || "第 " + (_0x39edb7 + 1) + " 集") + "</h3>\n      <p class=\"story-replication-meta\"><span data-story-replication-duration>" + escapeHtml(_0x34695b.duration || "--:--") + "</span><span>" + escapeHtml(formatBytes(_0x2a618f.size)) + "</span><span>" + escapeHtml(_0x2a618f.fileName || "视频") + "</span></p>\n      <p class=\"story-replication-synopsis\" data-story-replication-synopsis>" + escapeHtml(_0x3f5182 || _0x34695b.synopsis || "AI 将提取剧情、台词、镜头和声音结构") + "</p>\n      <div class=\"story-replication-card-actions\" data-story-replication-card-actions " + (_0x4c16ae ? "" : "hidden") + ">\n        <button type=\"button\" data-story-action=\"reupload-replication-video\" data-story-replication-episode-id=\"" + escapeHtml(_0x34695b.id) + "\">重新上传该视频</button>\n      </div>\n    </div>\n  </article>";
}
export function renderStoryVideoReplicationPage({
  episodes = [],
  targetLabel = "中文",
  styleLabel = "",
  footerMarkup = ""
} = {}) {
  return "<section class=\"story-replication-page\" data-story-replication-page>\n    <header class=\"story-replication-heading\">\n      <div>\n        <span class=\"story-eyebrow\">VIDEO REPLICATION</span>\n        <h1>视频解析</h1>\n        <p>正在按上传顺序提取每条视频的剧情、台词、角色关系与镜头节奏；目标地区为 " + escapeHtml(targetLabel) + (styleLabel ? "，视觉风格为 " + escapeHtml(styleLabel) : "") + "。</p>\n      </div>\n      <span class=\"story-replication-count\">" + episodes.length + " 条视频</span>\n    </header>\n    <div class=\"story-episode-grid story-replication-grid\" data-story-replication-grid>\n      " + episodes.map(renderVideoCard).join("") + "\n    </div>\n    " + footerMarkup + "\n  </section>";
}
export function syncStoryVideoReplicationCardElement(_0x10e7f0, _0x10dad3 = {}, _0x18a5be = 0) {
  if (!_0x10e7f0 || !_0x10dad3) {
    return false;
  }
  const _0x48cb43 = _0x10dad3.sourceVideo || {};
  const _0x293799 = getStatusView(_0x10dad3);
  const _0x493871 = _0x10dad3?.replication?.status || "queued";
  ["queued", "uploading", "analyzing", "ready", "failed"].forEach(_0x1dd8d1 => {
    _0x10e7f0.classList?.toggle?.("is-" + _0x1dd8d1, _0x1dd8d1 === _0x493871);
  });
  _0x10e7f0.setAttribute?.("aria-busy", String(_0x293799.busy));
  const _0x16e7bb = _0x10e7f0.querySelector?.("[data-story-replication-number]");
  const _0x3ade0b = _0x10e7f0.querySelector?.("[data-story-replication-title]");
  const _0x36f450 = _0x10e7f0.querySelector?.("[data-story-replication-duration]");
  const _0x767285 = _0x10e7f0.querySelector?.("[data-story-replication-status]");
  const _0x8023bf = _0x10e7f0.querySelector?.("[data-story-replication-synopsis]");
  const _0x17c001 = _0x10e7f0.querySelector?.("[data-story-replication-card-actions]");
  const _0x1655f0 = _0x10e7f0.querySelector?.(".story-replication-preview");
  const _0x54b7a1 = _0x1655f0?.querySelector?.("img");
  const _0x3ad286 = _0x1655f0?.querySelector?.(".story-replication-poster-placeholder");
  const _0x32ea21 = String(_0x48cb43.posterUrl || _0x10dad3.coverUrl || "").trim();
  if (_0x16e7bb) {
    _0x16e7bb.textContent = "第 " + (_0x18a5be + 1) + " 集";
  }
  if (_0x3ade0b) {
    _0x3ade0b.textContent = _0x10dad3.title || "第 " + (_0x18a5be + 1) + " 集";
  }
  if (_0x36f450) {
    _0x36f450.textContent = _0x10dad3.duration || "--:--";
  }
  if (_0x767285) {
    _0x767285.textContent = _0x293799.label;
  }
  if (_0x8023bf) {
    _0x8023bf.textContent = _0x10dad3?.replication?.error || _0x10dad3.synopsis || "AI 将提取剧情、台词、镜头和声音结构";
  }
  if (_0x17c001) {
    _0x17c001.hidden = _0x493871 !== "failed" || !!String(_0x48cb43.videoRef || "").trim();
    const _0xc8cb78 = _0x17c001.querySelector?.("[data-story-action=\"reupload-replication-video\"]");
    if (_0xc8cb78) {
      _0xc8cb78.dataset.storyReplicationEpisodeId = _0x10dad3.id;
    }
  }
  if (_0x1655f0) {
    _0x1655f0.disabled = !String(_0x48cb43.videoRef || "").trim();
    _0x1655f0.dataset.storyReplicationEpisodeId = _0x10dad3.id;
    _0x1655f0.setAttribute("aria-label", "播放第 " + (_0x18a5be + 1) + " 集原视频");
  }
  if (_0x54b7a1) {
    if (_0x32ea21 && _0x54b7a1.getAttribute("src") !== _0x32ea21) {
      _0x54b7a1.setAttribute("src", _0x32ea21);
    }
    _0x54b7a1.hidden = !_0x32ea21;
    _0x54b7a1.alt = "第 " + (_0x18a5be + 1) + " 集视频首帧";
  }
  if (_0x3ad286) {
    _0x3ad286.hidden = Boolean(_0x32ea21);
  }
  const _0x122c61 = _0x10e7f0.querySelector?.("[data-story-replication-drag-handle]");
  if (_0x122c61) {
    _0x122c61.setAttribute("aria-label", "拖动调整第 " + (_0x18a5be + 1) + " 集顺序");
  }
  return true;
}