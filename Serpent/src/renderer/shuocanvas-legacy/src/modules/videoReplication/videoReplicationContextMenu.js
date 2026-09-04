import { createWorkspaceEntityContextMenuItems, createWorkspaceProjectContextMenuItems } from "../workspaceEntityContextMenu.js";
import { t } from "../../i18n/index.js";
const contextMenuText = _0x25ec83 => t("workspaceContextMenu." + _0x25ec83);
function normalizeText(_0x4b29e8) {
  return String(_0x4b29e8 ?? "").trim();
}
export function resolveVideoReplicationContextMenuItems({
  event: _0x551a66,
  root: _0x4db0bc,
  projects = [],
  commands = {}
} = {}) {
  const _0x2e8e46 = _0x551a66?.target;
  const _0xda72f4 = _0x2e8e46?.closest?.("[data-workspace-open-project]");
  if (_0xda72f4 && _0x4db0bc?.contains?.(_0xda72f4)) {
    const _0x19c531 = normalizeText(_0xda72f4.dataset.workspaceOpenProject);
    const _0x30b00b = (Array.isArray(projects) ? projects : []).find(_0x1212fb => normalizeText(_0x1212fb?.id) === _0x19c531);
    const _0x522e26 = Number(_0x30b00b?.archivedAt || 0) > 0;
    return createWorkspaceProjectContextMenuItems({
      archived: _0x522e26,
      onOpen: () => commands.openProject?.(_0x19c531),
      onRename: () => commands.renameProject?.(_0x19c531),
      onDuplicate: () => commands.duplicateProject?.(_0x19c531),
      onArchive: () => commands.setProjectArchived?.(_0x19c531, !_0x522e26),
      onDelete: () => commands.requestDeleteProject?.(_0x19c531)
    });
  }
  const _0x1b45f1 = _0x2e8e46?.closest?.("[data-video-replication-action=\"select-asset\"]");
  if (_0x1b45f1 && _0x4db0bc?.contains?.(_0x1b45f1)) {
    const _0x82df33 = normalizeText(_0x1b45f1.dataset.assetKind);
    const _0x126c64 = normalizeText(_0x1b45f1.dataset.assetId);
    const _0x45eba4 = _0x1b45f1.closest?.(".story-asset-card-shell");
    const _0xcc553a = _0x45eba4?.querySelector?.(".story-card-delete-control");
    return createWorkspaceEntityContextMenuItems({
      activateLabel: contextMenuText(_0x82df33 === "library" ? "viewLibraryAsset" : "viewAsset"),
      onActivate: () => commands.selectAsset?.({
        kind: _0x82df33,
        assetId: _0x126c64
      }),
      deleteLabel: contextMenuText("deleteAsset"),
      onDelete: _0xcc553a ? () => commands.removeAsset?.({
        kind: _0x82df33,
        assetId: _0x126c64
      }) : null,
      deleteDisabled: _0xcc553a?.disabled === true
    });
  }
  const _0x30fbd8 = _0x2e8e46?.closest?.("[data-video-replication-action=\"select-clip\"]");
  if (_0x30fbd8 && _0x4db0bc?.contains?.(_0x30fbd8)) {
    const _0x96012 = normalizeText(_0x30fbd8.dataset.clipId);
    return createWorkspaceEntityContextMenuItems({
      activateLabel: contextMenuText("selectClip"),
      onActivate: () => commands.selectClip?.(_0x96012)
    });
  }
  const _0x8e5452 = _0x2e8e46?.closest?.("[data-video-replication-action=\"select-episode\"]");
  if (_0x8e5452 && _0x4db0bc?.contains?.(_0x8e5452)) {
    const _0x1f82a9 = normalizeText(_0x8e5452.dataset.episodeId);
    return createWorkspaceEntityContextMenuItems({
      activateLabel: contextMenuText("openEpisode"),
      onActivate: () => commands.selectEpisode?.(_0x1f82a9)
    });
  }
  return [];
}