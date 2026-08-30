function normalizeText(_0x4d27bd) {
  return String(_0x4d27bd ?? "").trim();
}
export function toggleWorkspaceAssetSelectAll(_0x504490 = [], _0x2c87bd = []) {
  const _0x1e826e = (Array.isArray(_0x504490) ? _0x504490 : []).map(_0x2d455b => normalizeText(_0x2d455b?.id)).filter(Boolean);
  const _0x25fe63 = new Set((Array.isArray(_0x2c87bd) ? _0x2c87bd : []).map(normalizeText).filter(Boolean));
  const _0x53aeab = _0x1e826e.length > 0 && _0x1e826e.every(_0x36431e => _0x25fe63.has(_0x36431e));
  if (_0x53aeab) {
    return [];
  } else {
    return _0x1e826e;
  }
}
export function toggleWorkspaceAssetSelection(_0x1bab31 = [], _0x4e0e44 = "", _0x5e8cb3 = false) {
  const _0x1f6412 = normalizeText(_0x4e0e44);
  const _0x433622 = (Array.isArray(_0x1bab31) ? _0x1bab31 : []).map(normalizeText).filter(Boolean);
  if (!_0x5e8cb3 || !_0x1f6412) {
    return _0x433622;
  }
  if (_0x433622.includes(_0x1f6412)) {
    return _0x433622.filter(_0x2b8b9b => _0x2b8b9b !== _0x1f6412);
  } else {
    return [..._0x433622, _0x1f6412];
  }
}
export function resolveWorkspaceCardMultiSelection({
  selectedIds = [],
  itemId = "",
  activeItemId = "",
  selectionMode = false,
  shiftKey = false,
  enabled = true
} = {}) {
  const _0x70e92a = (Array.isArray(selectedIds) ? selectedIds : []).map(normalizeText).filter(Boolean);
  const _0x28aa96 = normalizeText(itemId);
  const _0x58218d = enabled === true && Boolean(_0x28aa96) && (selectionMode === true || shiftKey === true);
  if (!_0x58218d) {
    return {
      handled: false,
      selectionMode: selectionMode === true,
      selectedIds: _0x70e92a
    };
  }
  if (shiftKey === true && selectionMode !== true) {
    return {
      handled: true,
      selectionMode: true,
      selectedIds: [...new Set([normalizeText(activeItemId), _0x28aa96].filter(Boolean))]
    };
  }
  return {
    handled: true,
    selectionMode: true,
    selectedIds: toggleWorkspaceAssetSelection(_0x70e92a, _0x28aa96, true)
  };
}
export function renderWorkspaceAssetSelectionActions({
  selectionMode = false,
  selectedCount = 0,
  allSelected = false,
  primaryActionHtml = "",
  enterSelectionLabel = "框选多选",
  selectAllLabel = "全选",
  clearSelectionLabel = "取消全选"
} = {}) {
  if (!selectionMode) {
    return primaryActionHtml + "<button type=\"button\" class=\"story-primary-button\" data-workspace-action=\"toggle-asset-selection\" data-story-action=\"toggle-asset-selection\">" + enterSelectionLabel + "</button>";
  }
  const _0x36c30d = Math.max(0, Math.trunc(Number(selectedCount) || 0));
  return "<button type=\"button\" class=\"story-secondary-button\" data-workspace-action=\"toggle-all-assets\" data-story-action=\"toggle-all-assets\" aria-pressed=\"" + allSelected + "\">" + (allSelected ? clearSelectionLabel : selectAllLabel) + "</button><button type=\"button\" class=\"story-secondary-button\" data-workspace-action=\"cancel-asset-selection\" data-story-action=\"cancel-asset-selection\">取消</button>" + (_0x36c30d || primaryActionHtml ? primaryActionHtml : "");
}