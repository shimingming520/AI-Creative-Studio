import { showContextMenu } from "./interaction/contextMenuPresenter.js";
import { TEXT_CONTEXT_MENU_TARGET_SELECTOR } from "./textInputContextMenu.js";
import { t } from "../i18n/index.js";
const workspaceContextMenuText = _0x1a7e71 => t("workspaceContextMenu." + _0x1a7e71);
function isEditableContextTarget(_0x595f04) {
  return Boolean(_0x595f04?.closest?.(TEXT_CONTEXT_MENU_TARGET_SELECTOR));
}
function compactItems(_0x2518a = []) {
  const _0x50bbde = [];
  for (const _0x3cba4e of _0x2518a) {
    if (!_0x3cba4e) {
      continue;
    }
    const _0x13b682 = _0x3cba4e === "sep" || _0x3cba4e?.type === "separator";
    if (_0x13b682 && (!_0x50bbde.length || _0x50bbde.at(-1) === "sep")) {
      continue;
    }
    _0x50bbde.push(_0x13b682 ? "sep" : _0x3cba4e);
  }
  if (_0x50bbde.at(-1) === "sep") {
    _0x50bbde.pop();
  }
  return _0x50bbde;
}
function actionItem(_0x594c2f, _0x24e9c5, _0x513fd6 = {}) {
  if (typeof _0x24e9c5 !== "function") {
    return null;
  }
  return {
    label: _0x594c2f,
    action: _0x24e9c5,
    ..._0x513fd6
  };
}
export function createWorkspaceProjectContextMenuItems({
  archived = false,
  onOpen = null,
  onRename = null,
  onDuplicate = null,
  onArchive = null,
  onDelete = null
} = {}) {
  return compactItems([actionItem(workspaceContextMenuText("openProject"), onOpen), "sep", actionItem(workspaceContextMenuText("renameProject"), onRename), actionItem(workspaceContextMenuText("duplicateProject"), onDuplicate), actionItem(workspaceContextMenuText(archived ? "unarchiveProject" : "archiveProject"), onArchive), "sep", actionItem(workspaceContextMenuText("deleteProject"), onDelete, {
    danger: true
  })]);
}
export function createWorkspaceEntityContextMenuItems({
  activateLabel = workspaceContextMenuText("view"),
  onActivate = null,
  deleteLabel = workspaceContextMenuText("delete"),
  onDelete = null,
  deleteDisabled = false,
  extraItems = []
} = {}) {
  return compactItems([actionItem(activateLabel, onActivate), ...extraItems, onDelete ? "sep" : null, actionItem(deleteLabel, onDelete, {
    danger: true,
    disabled: deleteDisabled === true
  })]);
}
export function bindWorkspaceEntityContextMenu(_0x1d2373, {
  resolveItems = () => [],
  presentMenu = showContextMenu,
  beforeOpen = null
} = {}) {
  if (!_0x1d2373?.addEventListener || typeof resolveItems !== "function") {
    return () => {};
  }
  let _0x521818 = null;
  const _0x36c012 = () => {
    _0x521818?.close?.();
    _0x521818 = null;
  };
  const _0x3ca91c = _0x1114a2 => {
    if (isEditableContextTarget(_0x1114a2?.target)) {
      return;
    }
    const _0xff991 = _0x1114a2?.defaultPrevented === true;
    _0x1114a2?.preventDefault?.();
    _0x1114a2?.stopPropagation?.();
    if (_0xff991) {
      _0x36c012();
      return;
    }
    const _0xd4f480 = compactItems(resolveItems(_0x1114a2));
    _0x36c012();
    if (!_0xd4f480.length) {
      return;
    }
    beforeOpen?.(_0x1114a2);
    _0x521818 = presentMenu(Number(_0x1114a2?.clientX) || 0, Number(_0x1114a2?.clientY) || 0, _0xd4f480, {
      ownerElement: _0x1114a2?.target?.isConnected === false ? _0x1d2373 : _0x1114a2?.target,
      ownerRoot: _0x1d2373
    }) || null;
  };
  _0x1d2373.addEventListener("contextmenu", _0x3ca91c);
  return () => {
    _0x1d2373.removeEventListener?.("contextmenu", _0x3ca91c);
    _0x36c012();
  };
}