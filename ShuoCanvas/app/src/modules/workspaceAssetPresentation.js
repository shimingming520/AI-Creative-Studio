import { getWorkspaceAssetAppearances, getWorkspaceAssetBaseAppearance, getWorkspaceAssetAppearanceStats } from "./workspaceAssetAppearance.js";
function normalizeText(_0x4d1a53) {
  return String(_0x4d1a53 ?? "").trim();
}
function escapeHtml(_0x5df0a7) {
  return String(_0x5df0a7 ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll("\"", "&quot;").replaceAll("'", "&apos;");
}
function renderAttributes(_0x283423 = {}) {
  return Object.entries(_0x283423 && typeof _0x283423 === "object" ? _0x283423 : {}).filter(([_0xf08174, _0x5db6c4]) => normalizeText(_0xf08174) && _0x5db6c4 !== false && _0x5db6c4 != null).map(([_0x1df2b4, _0x441a7f]) => _0x441a7f === true ? " " + escapeHtml(_0x1df2b4) : " " + escapeHtml(_0x1df2b4) + "=\"" + escapeHtml(_0x441a7f) + "\"").join("");
}
export function renderWorkspaceCardDeleteControl({
  className = "",
  ariaLabel = "删除",
  actionAttributes = {},
  disabled = false
} = {}) {
  const _0x2ccaf9 = normalizeText(className);
  return "<button type=\"button\" class=\"story-action-icon-button is-danger story-project-delete-trigger story-card-delete-button story-card-delete-control" + (_0x2ccaf9 ? " " + escapeHtml(_0x2ccaf9) : "") + "\"" + renderAttributes(actionAttributes) + " aria-label=\"" + escapeHtml(ariaLabel) + "\"" + (disabled ? " disabled" : "") + ">×</button>";
}
export function isWorkspaceAssetHoverLandscape(_0x562a7e, _0x150158) {
  const _0x3e4956 = Number(_0x562a7e) || 0;
  const _0x9d500 = Number(_0x150158) || 0;
  return _0x3e4956 > 0 && _0x9d500 > 0 && _0x3e4956 > _0x9d500;
}
export function resolveWorkspaceWheelDelta(_0x50815e) {
  const _0x30eae7 = Number(_0x50815e?.deltaX || 0);
  const _0x1cea6f = Number(_0x50815e?.deltaY || 0);
  const _0x1af293 = Math.abs(_0x1cea6f) >= Math.abs(_0x30eae7) ? _0x1cea6f : _0x30eae7;
  const _0x55e2d6 = Number(_0x50815e?.deltaMode || 0);
  const _0x386a1e = _0x55e2d6 === 1 ? 16 : _0x55e2d6 === 2 ? 800 : 1;
  return _0x1af293 * _0x386a1e;
}
export function consumeWorkspaceWheelDirection(_0x924b5e, _0x5c8552, {
  threshold = 24,
  lockDuration = 220,
  now = Date.now()
} = {}) {
  if (!_0x5c8552 || now < Number(_0x5c8552.lockedUntil || 0)) {
    return 0;
  }
  const _0x333e99 = resolveWorkspaceWheelDelta(_0x924b5e);
  if (!_0x333e99) {
    return 0;
  }
  if (_0x5c8552.accumulator && Math.sign(_0x5c8552.accumulator) !== Math.sign(_0x333e99)) {
    _0x5c8552.accumulator = 0;
  }
  _0x5c8552.accumulator = Number(_0x5c8552.accumulator || 0) + _0x333e99;
  if (Math.abs(_0x5c8552.accumulator) < threshold) {
    return 0;
  }
  const _0x21d42e = _0x5c8552.accumulator > 0 ? 1 : -1;
  _0x5c8552.accumulator = 0;
  _0x5c8552.lockedUntil = now + lockDuration;
  return _0x21d42e;
}
export function resolveWorkspaceTabTransitionDirection(_0x5a9d03, _0x42393f, _0x4b1d0d = []) {
  const _0x57cf43 = Array.isArray(_0x4b1d0d) ? _0x4b1d0d.map(normalizeText) : [];
  const _0x4d8631 = _0x57cf43.indexOf(normalizeText(_0x5a9d03));
  const _0x4c13df = _0x57cf43.indexOf(normalizeText(_0x42393f));
  if (_0x4d8631 < 0 || _0x4c13df < 0 || _0x4d8631 === _0x4c13df) {
    return "none";
  }
  if (_0x4c13df > _0x4d8631) {
    return "forward";
  } else {
    return "backward";
  }
}
export function renderWorkspaceAssetTabIcon(_0x53aa13) {
  const _0x141b11 = ["character", "scene", "prop", "audio", "library"].includes(normalizeText(_0x53aa13)) ? normalizeText(_0x53aa13) : "character";
  const _0x45ca41 = _0x141b11 === "scene" ? "<rect x=\"3.5\" y=\"4.5\" width=\"17\" height=\"15\" rx=\"2.5\"/><path d=\"m6 16 4-4 3 3 2.5-2.5L18 15\"/><circle cx=\"15.5\" cy=\"8.5\" r=\"1.5\"/>" : _0x141b11 === "prop" ? "<path d=\"m12 3.5 7.5 4.25v8.5L12 20.5l-7.5-4.25v-8.5z\"/><path d=\"m4.5 7.75 7.5 4.5 7.5-4.5M12 12.25v8.25\"/>" : _0x141b11 === "audio" ? "<path d=\"M5 10v4M8.5 7.5v9M12 4v16M15.5 8.5v7M19 10v4\"/>" : _0x141b11 === "library" ? "<rect x=\"4\" y=\"4\" width=\"6.5\" height=\"6.5\" rx=\"1.5\"/><rect x=\"13.5\" y=\"4\" width=\"6.5\" height=\"6.5\" rx=\"1.5\"/><rect x=\"4\" y=\"13.5\" width=\"6.5\" height=\"6.5\" rx=\"1.5\"/><rect x=\"13.5\" y=\"13.5\" width=\"6.5\" height=\"6.5\" rx=\"1.5\"/>" : "<circle cx=\"12\" cy=\"8\" r=\"3.5\"/><path d=\"M5.5 20c.7-4 3-6 6.5-6s5.8 2 6.5 6\"/>";
  return "<span class=\"story-asset-tab-icon\" data-icon=\"" + _0x141b11 + "\" aria-hidden=\"true\"><svg viewBox=\"0 0 24 24\" fill=\"none\">" + _0x45ca41 + "</svg></span>";
}
export function renderWorkspaceAssetLoadingOverlay({
  compact = false,
  title = "图片生成中",
  description = "正在等待生成结果，完成后会自动显示。"
} = {}) {
  const _0x5678d2 = compact ? "" : "<span class=\"story-asset-loading-copy\"><strong>" + escapeHtml(title) + "</strong><small>" + escapeHtml(description) + "</small></span>";
  return "<div class=\"img-loading-overlay story-asset-loading-overlay" + (compact ? " is-compact" : "") + "\" aria-hidden=\"true\"><span class=\"storyboard-script-loading-spinner\" aria-hidden=\"true\"></span>" + _0x5678d2 + "</div>";
}
export function renderWorkspacePreviewArrow(_0x24dd4e, {
  action = "",
  label = "",
  className = "",
  actionAttributes = null
} = {}) {
  const _0x43269c = _0x24dd4e === "previous";
  const _0x37c918 = _0x43269c ? "story-appearance-arrow--previous" : "story-appearance-arrow--next";
  const _0x1da767 = _0x43269c ? "m14.5 6.5-5.5 5.5 5.5 5.5" : "m9.5 6.5 5.5 5.5-5.5 5.5";
  const _0x32c002 = actionAttributes || (action ? {
    "data-workspace-action": action
  } : {});
  return "<button type=\"button\" class=\"story-appearance-arrow " + _0x37c918 + (className ? " " + escapeHtml(className) : "") + "\"" + renderAttributes(_0x32c002) + " aria-label=\"" + escapeHtml(label) + "\"><svg class=\"story-appearance-arrow-icon\" viewBox=\"0 0 24 24\" fill=\"none\" aria-hidden=\"true\"><path d=\"" + _0x1da767 + "\"/></svg></button>";
}
export function buildWorkspaceAssetHoverPreviewContent(_0x51328c, {
  appearanceId = "",
  selectedAssetId = "",
  selectedAppearanceId = "",
  mediaOnly = false,
  getAppearances = getWorkspaceAssetAppearances,
  hasVoiceReference = () => false
} = {}) {
  if (!_0x51328c) {
    return null;
  }
  const _0x2d81c8 = _0x51328c.isLibraryAsset ? [_0x51328c] : getAppearances(_0x51328c);
  const _0x4956b7 = normalizeText(appearanceId);
  const _0x42000a = _0x2d81c8.filter(_0x4f68a0 => Boolean(normalizeText(_0x4f68a0?.imageUrl)) && (!_0x4956b7 || normalizeText(_0x4f68a0?.id) === _0x4956b7));
  if (!_0x42000a.length) {
    return null;
  }
  const _0x2e40e6 = _0x51328c.kind === "character" && !_0x51328c.isLibraryAsset;
  const _0x2fff59 = _0x2e40e6 && hasVoiceReference(_0x51328c);
  const _0x4019b2 = Math.ceil(Math.sqrt(Math.max(1, _0x42000a.length)));
  const _0xf9c0a5 = mediaOnly ? "" : "<div class=\"story-asset-hover-preview-heading\"><strong>" + escapeHtml(_0x51328c.hoverTitle || _0x51328c.name || "素材") + "</strong><span class=\"story-asset-hover-summary\">已生成 " + _0x42000a.length + "/" + _0x2d81c8.length + "</span>" + (_0x2e40e6 ? "<span class=\"story-character-voice-hover-status " + (_0x2fff59 ? "has-reference" : "is-missing") + "\"><i></i>" + (_0x2fff59 ? "有声音参考" : "无声音参考") + "</span>" : "") + "</div>";
  const _0x30a77a = _0xf9c0a5 + "\n    <div class=\"story-asset-hover-preview-grid\">\n      " + _0x42000a.map((_0x1ab291, _0x5839a3) => {
    const _0x162e59 = normalizeText(_0x1ab291?.imageUrl);
    const _0x34f1ef = _0x1ab291?.name || "形象 " + (_0x5839a3 + 1);
    const _0x4146b5 = ["story-asset-hover-preview-cell", _0x1ab291?.id === selectedAppearanceId && _0x51328c.id === selectedAssetId ? "is-current" : "", _0x51328c.baseAppearanceId === _0x1ab291?.id ? "is-base" : ""].filter(Boolean).join(" ");
    const _0x21d99c = mediaOnly ? "" : "<span class=\"story-asset-hover-preview-status\">" + escapeHtml(_0x34f1ef) + "</span>";
    const _0x5888a8 = mediaOnly ? " title=\"" + escapeHtml(_0x34f1ef) + "\"" : "";
    return "<span class=\"story-asset-hover-preview-item\">" + _0x21d99c + "<span class=\"" + _0x4146b5 + "\"" + _0x5888a8 + "><img src=\"" + escapeHtml(_0x162e59) + "\" alt=\"" + escapeHtml(_0x51328c.name + " · " + _0x34f1ef) + "\" data-story-asset-hover-image loading=\"eager\" decoding=\"async\" draggable=\"false\"></span></span>";
  }).join("") + "\n    </div>";
  return {
    allAppearances: _0x2d81c8,
    appearances: _0x42000a,
    columns: _0x4019b2,
    hasVoice: _0x2fff59,
    mediaOnly: mediaOnly,
    html: _0x30a77a
  };
}
export function renderWorkspaceAssetCard({
  asset = {},
  appearances = getWorkspaceAssetAppearances(asset),
  previewAppearance = null,
  stats = getWorkspaceAssetAppearanceStats(asset),
  selected = false,
  selectionMode = false,
  checked = false,
  loading = false,
  draggable = false,
  promptPreview = "",
  statusText = "",
  cardStatusHtml = "",
  cardClassName = "",
  cardAttributes = "",
  shellClassName = "",
  accessoryHtml = "",
  cardMetaHtml = "",
  cardMediaHtml = "",
  fallbackImageUrl = "",
  workspaceAssetLibraryImage = false,
  nameAttributes = "",
  roleHtml = "",
  deleteControlHtml = ""
} = {}) {
  const _0x5e7746 = Array.isArray(appearances) ? appearances : [];
  const _0x1e452c = previewAppearance || getWorkspaceAssetBaseAppearance(asset) || _0x5e7746.find(_0x44ed99 => normalizeText(_0x44ed99?.imageUrl)) || _0x5e7746[0] || asset;
  const _0x5eda54 = normalizeText(_0x1e452c?.imageUrl);
  const _0x164f3d = normalizeText(fallbackImageUrl);
  const _0x513cc9 = workspaceAssetLibraryImage ? " data-workspace-asset-library-image" + (_0x164f3d && _0x164f3d !== _0x5eda54 ? " data-workspace-asset-library-fallback-src=\"" + escapeHtml(_0x164f3d) + "\"" : "") : "";
  const _0xa950c0 = cardMediaHtml || (_0x5eda54 ? "<img class=\"story-asset-card-image\" src=\"" + escapeHtml(_0x5eda54) + "\" alt=\"" + escapeHtml("" + (asset.name || "") + (_0x1e452c?.name ? " · " + _0x1e452c.name : "")) + "\" loading=\"lazy\" decoding=\"async\"" + _0x513cc9 + ">" : "<div class=\"story-asset-card-image story-media-empty\" role=\"img\" aria-label=\"" + escapeHtml((asset.name || "素材") + "待生成") + "\"><span>待生成</span></div>");
  const _0x355d04 = stats && typeof stats === "object" ? stats : {
    total: _0x5e7746.length,
    generated: 0,
    failed: 0
  };
  const _0x219ab3 = "<button type=\"button\" class=\"story-asset-card " + (selected && !selectionMode ? "is-selected" : "") + " " + (selectionMode ? "is-selection-mode" : "") + " " + (checked ? "is-checked" : "") + (cardClassName ? " " + escapeHtml(cardClassName) : "") + "\" data-workspace-asset-id=\"" + escapeHtml(asset.id) + "\" data-story-asset-id=\"" + escapeHtml(asset.id) + "\" data-workspace-marquee-item data-story-marquee-item data-workspace-marquee-id=\"" + escapeHtml(asset.id) + "\" data-story-marquee-id=\"" + escapeHtml(asset.id) + "\" data-story-appearance-count=\"" + _0x5e7746.length + "\" aria-pressed=\"" + (selectionMode ? String(checked) : "false") + "\"" + (draggable ? " draggable=\"true\"" : "") + (cardAttributes ? " " + cardAttributes : "") + ">\n    " + (selectionMode ? "<span class=\"story-asset-select-indicator\" aria-hidden=\"true\">" + (checked ? "✓" : "") + "</span>" : "") + "\n    <span class=\"story-asset-card-media " + (loading ? "img-preview-loading" : "") + "\" aria-busy=\"" + loading + "\">\n      " + _0xa950c0 + "\n      " + (loading ? renderWorkspaceAssetLoadingOverlay({
    compact: true
  }) : "") + "\n    </span>\n    <span class=\"story-asset-card-copy\">\n      <span class=\"story-asset-card-heading\"><strong" + (nameAttributes ? " " + nameAttributes : "") + ">" + escapeHtml(asset.name || "未命名素材") + "</strong>" + roleHtml + "</span>\n      <span class=\"story-asset-card-status\">" + (cardStatusHtml || (statusText ? "<span>" + escapeHtml(statusText) + "</span>" : _0x355d04.total > 1 ? "<span>形象 " + _0x355d04.generated + "/" + _0x355d04.total + "</span>" : "")) + (_0x355d04.failed ? "<b>生成失败 " + _0x355d04.failed + "</b>" : "") + "</span>\n      " + cardMetaHtml + "\n      <p>" + escapeHtml(promptPreview) + "</p>\n    </span>\n  </button>";
  if (!deleteControlHtml && !accessoryHtml) {
    return _0x219ab3;
  }
  return "<span class=\"story-asset-card-shell" + (shellClassName ? " " + escapeHtml(shellClassName) : "") + "\">\n    " + _0x219ab3 + "\n    " + deleteControlHtml + accessoryHtml + "\n  </span>";
}