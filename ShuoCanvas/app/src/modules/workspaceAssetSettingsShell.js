function escapeHtml(_0x2d0362) {
  return String(_0x2d0362 ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll("\"", "&quot;").replaceAll("'", "&#039;");
}
export const WORKSPACE_ASSET_SPLIT_RATIO_MIN = 28;
export const WORKSPACE_ASSET_SPLIT_RATIO_MAX = 72;
export const WORKSPACE_ASSET_SPLIT_RATIO_DEFAULT = 50;
export function normalizeWorkspaceAssetSplitRatio(_0x1d1289) {
  const _0x194d1d = Number(_0x1d1289);
  return Math.max(WORKSPACE_ASSET_SPLIT_RATIO_MIN, Math.min(WORKSPACE_ASSET_SPLIT_RATIO_MAX, Number.isFinite(_0x194d1d) ? _0x194d1d : WORKSPACE_ASSET_SPLIT_RATIO_DEFAULT));
}
export function applyWorkspaceAssetSplitRatioToLayout(_0x4283a7, _0x4c5448, _0x5dacbd, {
  styleProperty = "--story-assets-left"
} = {}) {
  const _0x3d41be = normalizeWorkspaceAssetSplitRatio(_0x5dacbd);
  _0x4283a7?.style?.setProperty?.(styleProperty, _0x3d41be + "%");
  _0x4c5448?.setAttribute?.("aria-valuenow", String(Math.round(_0x3d41be)));
  return _0x3d41be;
}
export function renderWorkspaceAssetSettingsShell({
  className = "",
  tabsHtml = "",
  tablistLabel = "素材分类",
  calloutTitle = "",
  calloutDescription = "",
  calloutActionsHtml = "",
  cardsHtml = "",
  emptyText = "暂无素材",
  detailHtml = "",
  footerHtml = "",
  splitRatio = 50,
  activeTab = "",
  tabCount = 1
} = {}) {
  const _0x163334 = normalizeWorkspaceAssetSplitRatio(splitRatio);
  const _0xa72493 = Math.max(1, Math.trunc(Number(tabCount) || 1));
  const _0x1bb030 = activeTab === "library" ? "story-asset-grid story-asset-grid--workspace-library" : "story-asset-grid";
  return "<div class=\"story-assets-page story-content-page" + (className ? " " + escapeHtml(className) : "") + "\" data-story-marquee-page-surface=\"assets\" data-workspace-marquee-page-surface=\"assets\">\n    <header class=\"story-page-heading\">\n      <div class=\"story-asset-tabs\" role=\"tablist\" aria-label=\"" + escapeHtml(tablistLabel) + "\" data-active-tab=\"" + escapeHtml(activeTab) + "\" data-tab-count=\"" + _0xa72493 + "\">\n        " + tabsHtml + "\n      </div>\n    </header>\n    <div class=\"story-assets-switch-region\" data-story-assets-switch-region data-workspace-assets-switch-region>\n      <div class=\"story-assets-layout\" style=\"--story-assets-left: " + _0x163334 + "%;\">\n        <section class=\"story-assets-list\" data-story-marquee-surface=\"assets\" data-workspace-marquee-surface=\"assets\">\n          <div class=\"story-assets-callout\">\n            <div>\n              <strong>" + escapeHtml(calloutTitle) + "</strong>\n              <p>" + escapeHtml(calloutDescription) + "</p>\n            </div>\n            <div class=\"story-assets-callout-actions\">" + calloutActionsHtml + "</div>\n          </div>\n          <div class=\"" + _0x1bb030 + "\">\n            " + (cardsHtml || "<div class=\"story-inline-empty\">" + escapeHtml(emptyText) + "</div>") + "\n          </div>\n        </section>\n        <div class=\"story-assets-splitter panel-resize-handle panel-resize-handle--transient\" data-story-assets-splitter data-workspace-assets-splitter role=\"separator\" aria-orientation=\"vertical\" aria-label=\"调整素材列表与详情区域宽度\" aria-valuemin=\"28\" aria-valuemax=\"72\" aria-valuenow=\"" + Math.round(_0x163334) + "\" tabindex=\"0\"></div>\n        " + detailHtml + "\n      </div>\n      " + footerHtml + "\n    </div>\n  </div>";
}