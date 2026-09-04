import { removeContextMenus, showContextMenu } from "./interaction/contextMenuPresenter.js";
import { TEXT_CONTEXT_MENU_TARGET_SELECTOR } from "./textInputContextMenu.js";
const EDITABLE_SELECTOR = "select, " + TEXT_CONTEXT_MENU_TARGET_SELECTOR;
const FOLDER_ACTION_SELECTOR = ["[data-ui-action=\"material-folder-toggle\"]", "[data-ui-action=\"material-folder-rename\"]", "[data-ui-action=\"material-folder-delete-request\"]"].join(", ");
function getActionLabel(_0x3d112b) {
  return _0x3d112b?.getAttribute?.("aria-label") || String(_0x3d112b?.textContent || "").trim();
}
export function createMaterialLibraryContextMenuController({
  getPanel: _0xdb2b23,
  getText: _0x34c80c,
  closeAssetMenu: _0x2ee20f,
  openAssetMenu: _0x2807f2,
  restoreAssetSubItem: _0x2decf4,
  presentMenu = showContextMenu,
  removePresentedMenus = removeContextMenus
} = {}) {
  let _0x19302b = null;
  const _0x21b11f = () => {
    _0x19302b?.close?.();
    _0x19302b = null;
  };
  const _0x2c9118 = (_0x30a92c, _0x50fdf2) => {
    if (!_0x50fdf2.length) {
      return false;
    }
    _0x30a92c.preventDefault();
    _0x30a92c.stopPropagation();
    _0x2ee20f?.();
    _0x19302b = presentMenu(_0x30a92c.clientX, _0x30a92c.clientY, _0x50fdf2, {
      ownerElement: _0x30a92c.target,
      ownerRoot: _0xdb2b23?.()
    });
    return true;
  };
  const _0x9da8a3 = _0x448c80 => {
    if (_0x448c80.target?.closest?.(EDITABLE_SELECTOR)) {
      return false;
    }
    const _0x42574f = _0xdb2b23?.();
    const _0x28926c = _0x448c80.target?.closest?.(".v2-material-item-row");
    if (_0x28926c && _0x42574f?.contains?.(_0x28926c)) {
      const _0x56c73f = String(_0x28926c.dataset.assetId || "");
      const _0x9a5248 = Number(_0x28926c.dataset.itemIndex);
      const _0x208504 = _0x28926c.querySelector?.("[data-ui-action=\"material-item-rename\"]");
      if (!_0x56c73f || !Number.isInteger(_0x9a5248)) {
        return false;
      }
      const _0x43396f = [{
        label: _0x34c80c?.("loadToCanvas") || "",
        action: () => _0x2decf4?.(_0x56c73f, _0x9a5248)
      }];
      if (_0x208504) {
        _0x43396f.push({
          label: getActionLabel(_0x208504),
          action: () => _0x208504.click?.()
        });
      }
      return _0x2c9118(_0x448c80, _0x43396f);
    }
    const _0x49ab7d = _0x448c80.target?.closest?.(".v2-material-asset-row, .v2-material-project-row");
    if (_0x49ab7d && _0x42574f?.contains?.(_0x49ab7d)) {
      const _0x1b9f25 = String(_0x49ab7d.dataset.assetId || _0x49ab7d.querySelector?.("[data-asset-id]")?.dataset?.assetId || "");
      if (!_0x1b9f25) {
        return false;
      }
      _0x448c80.preventDefault();
      _0x448c80.stopPropagation();
      _0x21b11f();
      removePresentedMenus?.();
      _0x2807f2?.(_0x1b9f25, _0x49ab7d);
      return true;
    }
    const _0x3e7d37 = _0x448c80.target?.closest?.(".v2-material-folder-row");
    if (!_0x3e7d37 || !_0x42574f?.contains?.(_0x3e7d37)) {
      return false;
    }
    const _0x2fc736 = Array.from(_0x3e7d37.querySelectorAll?.(FOLDER_ACTION_SELECTOR) || []);
    return _0x2c9118(_0x448c80, _0x2fc736.map(_0x5177f7 => ({
      label: getActionLabel(_0x5177f7),
      disabled: _0x5177f7.disabled === true || _0x5177f7.getAttribute?.("aria-disabled") === "true",
      danger: _0x5177f7.dataset.uiAction === "material-folder-delete-request",
      action: () => _0x5177f7.click?.()
    })));
  };
  return {
    close: _0x21b11f,
    handleContextMenu: _0x9da8a3
  };
}