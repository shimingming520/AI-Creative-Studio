import { captureWorkspaceNestedScrollPositions, captureWorkspaceScrollPosition, restoreWorkspaceNestedScrollPositions, restoreWorkspaceScrollPosition, scrollWorkspaceTrackWithWheel, shouldPreserveWorkspaceNestedWheel } from "../workspaceWheelNavigation.js";
import { beginWorkspaceHorizontalResizeSession } from "../workspaceResizeSession.js";
import { applyWorkspaceAssetSplitRatioToLayout, normalizeWorkspaceAssetSplitRatio } from "../workspaceAssetSettingsShell.js";
export function isStoryGenerateShortcut(_0x1ad263) {
  return String(_0x1ad263?.key || "") === "Enter" && (_0x1ad263?.ctrlKey === true || _0x1ad263?.metaKey === true) && _0x1ad263?.altKey !== true && _0x1ad263?.shiftKey !== true && _0x1ad263?.isComposing !== true;
}
const STORY_WORKSPACE_NESTED_WHEEL_SELECTOR = "textarea, [contenteditable=\"true\"], .node-model-submenu, .story-style-grid, .story-assets-list, .story-episode-assets, .story-clip-prompt-history-list, .story-clip-strip";
const STORY_WORKSPACE_PERSISTENT_NESTED_SCROLL_SELECTORS = Object.freeze([".story-assets-list", ".story-asset-prompt-editor", ".story-character-voice-history-list", "[data-story-episode-asset-panel]", ".story-clip-editor", ".story-clip-prompt-comparison", ".story-clip-prompt-version-content", ".story-clip-generation-actions", ".story-clip-strip"]);
export const STORY_ASSET_HOVER_CARD_SELECTOR = "[data-story-asset-id], [data-story-reference-asset], [data-story-asset-hover-id]";
export function shouldPreserveStoryWorkspaceNestedWheel(_0x825774, _0x5c8a26 = {}) {
  return shouldPreserveWorkspaceNestedWheel(_0x825774, {
    ..._0x5c8a26,
    nestedSelector: STORY_WORKSPACE_NESTED_WHEEL_SELECTOR,
    boundarySelector: ".story-workspace-root"
  });
}
export function captureStoryAssetListScrollPosition(_0x487ccd) {
  const _0x2bdb4f = _0x487ccd?.querySelector?.(".story-assets-list");
  return captureWorkspaceScrollPosition(_0x2bdb4f);
}
export function restoreStoryAssetListScrollPosition(_0x4f63e2, _0x1a8200) {
  const _0x417bf7 = _0x4f63e2?.querySelector?.(".story-assets-list");
  return restoreWorkspaceScrollPosition(_0x417bf7, _0x1a8200);
}
export function captureStoryWorkspaceNestedScrollPositions(_0x118ec3) {
  return captureWorkspaceNestedScrollPositions(_0x118ec3, STORY_WORKSPACE_PERSISTENT_NESTED_SCROLL_SELECTORS);
}
export function restoreStoryWorkspaceNestedScrollPositions(_0x166f64, _0x4e02c7) {
  return restoreWorkspaceNestedScrollPositions(_0x166f64, _0x4e02c7);
}
export function scrollStoryClipStripWithWheel(_0x103351) {
  return scrollWorkspaceTrackWithWheel(_0x103351, ".story-clip-strip");
}
export function scrollStoryClipPromptHistoryWithWheel(_0x29be25) {
  const _0x18fe69 = _0x29be25?.target?.closest?.(".story-clip-prompt-history-list");
  if (!_0x18fe69) {
    return false;
  }
  const _0x5c846c = Math.max(0, Number(_0x18fe69.scrollHeight || 0) - Number(_0x18fe69.clientHeight || 0));
  if (_0x5c846c <= 0) {
    return false;
  }
  const _0x518f92 = Math.max(0, Number(_0x18fe69.scrollTop) || 0);
  const _0x3e469e = Math.max(0, Math.min(_0x5c846c, _0x518f92 + Number(_0x29be25.deltaY || 0)));
  _0x29be25.preventDefault?.();
  _0x29be25.stopPropagation?.();
  _0x18fe69.scrollTop = _0x3e469e;
  return true;
}
export function getStoryAssetHoverCard(_0x3504ed) {
  return _0x3504ed?.closest?.(STORY_ASSET_HOVER_CARD_SELECTOR) || null;
}
export function getStoryAssetHoverCardId(_0x519a9b) {
  return String(_0x519a9b?.dataset?.storyAssetHoverId || _0x519a9b?.dataset?.storyAssetId || _0x519a9b?.dataset?.storyReferenceAsset || "");
}
export function getStoryAssetHoverCardAppearanceId(_0x3f55cb) {
  return String(_0x3f55cb?.dataset?.storyAssetHoverAppearanceId || "");
}
export function findStoryAssetForHover(_0x41ff55, _0x30ab4c, _0x430e50 = []) {
  const _0x3f9126 = String(_0x30ab4c || "");
  return (Array.isArray(_0x41ff55?.data?.assets) ? _0x41ff55.data.assets : []).find(_0x33675d => String(_0x33675d?.id) === _0x3f9126) || (Array.isArray(_0x430e50) ? _0x430e50 : []).find(_0xa43ef2 => String(_0xa43ef2?.id) === _0x3f9126) || null;
}
export function normalizeStoryAssetSplitRatio(_0x800101) {
  return normalizeWorkspaceAssetSplitRatio(_0x800101);
}
export function normalizeStoryEpisodePanelRatios(_0x5cb8f3, _0x51fc72) {
  const _0x187e64 = Math.max(14, Math.min(34, Number.isFinite(Number(_0x5cb8f3)) ? Number(_0x5cb8f3) : 22));
  const _0x221098 = Math.max(24, Math.min(50, Number.isFinite(Number(_0x51fc72)) ? Number(_0x51fc72) : 34));
  return {
    left: _0x187e64,
    center: Math.min(_0x221098, 76 - _0x187e64)
  };
}
export function applyStoryAssetSplitRatioToLayout(_0x3f6dbc, _0x528283, _0xae1103) {
  return applyWorkspaceAssetSplitRatioToLayout(_0x3f6dbc, _0x528283, _0xae1103);
}
export function applyStoryEpisodePanelRatiosToLayout(_0xb22ef, {
  assetSplitter = null,
  previewSplitter = null
} = {}, _0x3bdcd1, _0xccffa1) {
  const _0x17b648 = normalizeStoryEpisodePanelRatios(_0x3bdcd1, _0xccffa1);
  _0xb22ef?.style?.setProperty?.("--story-episode-assets-width", _0x17b648.left + "%");
  _0xb22ef?.style?.setProperty?.("--story-episode-editor-width", _0x17b648.center + "%");
  assetSplitter?.setAttribute?.("aria-valuenow", String(Math.round(_0x17b648.left)));
  previewSplitter?.setAttribute?.("aria-valuenow", String(Math.round(_0x17b648.left + _0x17b648.center)));
  return _0x17b648;
}
export function beginStoryHorizontalResizeSession({
  ..._0x52be94
} = {}) {
  return beginWorkspaceHorizontalResizeSession(_0x52be94);
}