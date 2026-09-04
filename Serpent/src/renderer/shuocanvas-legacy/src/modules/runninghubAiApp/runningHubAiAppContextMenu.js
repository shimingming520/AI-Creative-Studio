import { showContextMenu } from "../interaction/contextMenuPresenter.js";
import { TEXT_CONTEXT_MENU_TARGET_SELECTOR } from "../textInputContextMenu.js";
const EDITABLE_SELECTOR = "select, " + TEXT_CONTEXT_MENU_TARGET_SELECTOR;
const PREVIEW_ACTION_SELECTOR = ["[data-action=\"rename-preview-param\"]", "[data-action=\"edit-preview-description\"]", "[data-action=\"choose-preview-control-type\"]", "[data-action=\"remove-preview-param\"]", "[data-action=\"remove-preview-input\"]"].join(", ");
const DANGER_ACTIONS = new Set(["remove-preview-param", "remove-preview-input"]);
function getActionLabel(_0x5f3f65) {
  return _0x5f3f65?.getAttribute?.("aria-label") || String(_0x5f3f65?.textContent || "").trim();
}
function createActionItem(_0x3f4f57) {
  return {
    label: getActionLabel(_0x3f4f57),
    disabled: _0x3f4f57?.disabled === true || _0x3f4f57?.getAttribute?.("aria-disabled") === "true",
    danger: DANGER_ACTIONS.has(_0x3f4f57?.dataset?.action),
    action: () => _0x3f4f57?.click?.()
  };
}
export function createRunningHubAiAppContextMenuController({
  getPanel: _0x10c38e,
  presentMenu = showContextMenu,
  beforeOpen = null
} = {}) {
  let _0x430d51 = null;
  const _0x7d4ee3 = (_0x48605e, _0x5854ce) => {
    if (!_0x5854ce.length) {
      return false;
    }
    _0x48605e.preventDefault();
    _0x48605e.stopPropagation();
    beforeOpen?.(_0x48605e);
    _0x430d51?.close?.();
    _0x430d51 = presentMenu(_0x48605e.clientX, _0x48605e.clientY, _0x5854ce, {
      ownerElement: _0x48605e.target,
      ownerRoot: _0x10c38e?.()
    });
    return true;
  };
  const _0x30cdc7 = () => {
    _0x430d51?.close?.();
    _0x430d51 = null;
  };
  const _0x20fcdb = _0x87cd85 => {
    if (_0x87cd85.target?.closest?.(EDITABLE_SELECTOR)) {
      return false;
    }
    const _0x589b13 = _0x10c38e?.();
    const _0xf866d4 = _0x87cd85.target?.closest?.(".rh-ai-app-saved-app-row");
    if (_0xf866d4 && _0x589b13?.contains?.(_0xf866d4)) {
      const _0x99273c = _0xf866d4.querySelector?.("[data-action=\"load-saved-app\"]");
      const _0xa7a410 = _0xf866d4.querySelector?.("[data-action=\"request-delete-app\"]");
      return _0x7d4ee3(_0x87cd85, [_0x99273c, _0xa7a410].filter(Boolean).map(_0x6043c0 => ({
        ...createActionItem(_0x6043c0),
        danger: _0x6043c0 === _0xa7a410
      })));
    }
    const _0x300243 = _0x87cd85.target?.closest?.(".rh-ai-app-preview-component");
    if (!_0x300243 || !_0x589b13?.contains?.(_0x300243)) {
      return false;
    }
    const _0x4c11d9 = Array.from(_0x300243.querySelectorAll?.(PREVIEW_ACTION_SELECTOR) || []);
    return _0x7d4ee3(_0x87cd85, _0x4c11d9.map(createActionItem));
  };
  return {
    close: _0x30cdc7,
    handleContextMenu: _0x20fcdb
  };
}