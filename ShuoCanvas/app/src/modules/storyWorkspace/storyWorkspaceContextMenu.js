import { createWorkspaceEntityContextMenuItems, createWorkspaceProjectContextMenuItems } from "../workspaceEntityContextMenu.js";
import { t } from "../../i18n/index.js";
const contextMenuText = _0x1f86c4 => t("workspaceContextMenu." + _0x1f86c4);
function normalizeText(_0x224dee) {
  return String(_0x224dee ?? "").trim();
}
export function resolveStoryWorkspaceContextMenuItems({
  event: _0x1280f0,
  root: _0x14c876,
  projects = [],
  commands = {}
} = {}) {
  const _0x37854e = _0x1280f0?.target;
  const _0x525fd6 = _0x37854e?.closest?.("[data-story-open-project]");
  if (_0x525fd6 && _0x14c876?.contains?.(_0x525fd6)) {
    const _0x12f4f9 = normalizeText(_0x525fd6.dataset.storyOpenProject);
    const _0x5393b8 = (Array.isArray(projects) ? projects : []).find(_0x350236 => normalizeText(_0x350236?.id || _0x350236?.data?.project?.id) === _0x12f4f9);
    const _0x274c67 = Number(_0x5393b8?.archivedAt || 0) > 0;
    return createWorkspaceProjectContextMenuItems({
      archived: _0x274c67,
      onOpen: () => commands.openProject?.(_0x12f4f9),
      onRename: () => commands.renameProject?.(_0x12f4f9),
      onDuplicate: () => commands.duplicateProject?.(_0x12f4f9),
      onArchive: () => commands.setProjectArchived?.(_0x12f4f9, !_0x274c67),
      onDelete: () => commands.requestDeleteProject?.(_0x12f4f9)
    });
  }
  const _0x5e2132 = _0x37854e?.closest?.(".story-media-history-entry");
  if (_0x5e2132 && _0x14c876?.contains?.(_0x5e2132)) {
    const _0x40df08 = _0x5e2132.querySelector?.(".story-media-history-item");
    const _0x4f8c04 = _0x5e2132.querySelector?.(".story-card-delete-control");
    return createWorkspaceEntityContextMenuItems({
      activateLabel: contextMenuText("switchVersion"),
      onActivate: _0x40df08 ? () => _0x40df08.click?.() : null,
      deleteLabel: contextMenuText("deleteVersion"),
      onDelete: _0x4f8c04 ? () => _0x4f8c04.click?.() : null,
      deleteDisabled: _0x4f8c04?.disabled === true
    });
  }
  const _0x39a5cb = _0x37854e?.closest?.(".story-clip-card[data-story-clip-id]");
  if (_0x39a5cb && _0x14c876?.contains?.(_0x39a5cb)) {
    const _0x122305 = _0x39a5cb.closest?.(".story-clip-card-shell");
    const _0x38aa50 = _0x122305?.querySelector?.(".story-card-delete-control");
    return createWorkspaceEntityContextMenuItems({
      activateLabel: contextMenuText("selectClip"),
      onActivate: () => _0x39a5cb.click?.(),
      deleteLabel: contextMenuText("deleteClip"),
      onDelete: _0x38aa50 ? () => _0x38aa50.click?.() : null,
      deleteDisabled: _0x38aa50?.disabled === true
    });
  }
  const _0x14c8eb = _0x37854e?.closest?.("[data-story-asset-id]");
  if (_0x14c8eb && _0x14c876?.contains?.(_0x14c8eb)) {
    const _0x35072e = _0x14c8eb.closest?.(".story-asset-card-shell");
    const _0x55d54a = _0x35072e?.querySelector?.(".story-card-delete-control");
    return createWorkspaceEntityContextMenuItems({
      activateLabel: contextMenuText("viewAsset"),
      onActivate: () => _0x14c8eb.click?.(),
      deleteLabel: contextMenuText("deleteAsset"),
      onDelete: _0x55d54a ? () => _0x55d54a.click?.() : null,
      deleteDisabled: _0x55d54a?.disabled === true
    });
  }
  return [];
}