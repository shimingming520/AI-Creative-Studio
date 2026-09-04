import { createWorkspaceEntityContextMenuItems, createWorkspaceProjectContextMenuItems } from "../workspaceEntityContextMenu.js";
import { t } from "../../i18n/index.js";
const contextMenuText = _0x25baec => t("workspaceContextMenu." + _0x25baec);
function normalizeText(_0x14ce4c) {
  return String(_0x14ce4c ?? "").trim();
}
export function resolvePersonReplacementContextMenuItems({
  event: _0x860b76,
  root: _0x4eaaf5,
  projects = [],
  commands = {}
} = {}) {
  const _0x312263 = _0x860b76?.target;
  const _0x55d390 = _0x312263?.closest?.("[data-story-open-project]");
  if (_0x55d390 && _0x4eaaf5?.contains?.(_0x55d390)) {
    const _0x39b2ab = normalizeText(_0x55d390.dataset.storyOpenProject);
    const _0x17999a = (Array.isArray(projects) ? projects : []).find(_0x483670 => normalizeText(_0x483670?.id) === _0x39b2ab);
    const _0xf7633a = Number(_0x17999a?.archivedAt || 0) > 0;
    return createWorkspaceProjectContextMenuItems({
      archived: _0xf7633a,
      onOpen: () => commands.openProject?.(_0x39b2ab),
      onRename: () => commands.renameProject?.(_0x39b2ab),
      onDuplicate: () => commands.duplicateProject?.(_0x39b2ab),
      onArchive: () => commands.setProjectArchived?.(_0x39b2ab, !_0xf7633a),
      onDelete: () => commands.requestDeleteProject?.(_0x39b2ab)
    });
  }
  const _0x1d2b77 = _0x312263?.closest?.(".story-media-history-entry");
  if (_0x1d2b77 && _0x4eaaf5?.contains?.(_0x1d2b77)) {
    const _0x5038a0 = _0x1d2b77.querySelector?.(".story-media-history-item");
    const _0x2fe38e = _0x1d2b77.querySelector?.(".story-card-delete-control");
    return createWorkspaceEntityContextMenuItems({
      activateLabel: contextMenuText("switchResult"),
      onActivate: _0x5038a0 ? () => _0x5038a0.click?.() : null,
      deleteLabel: contextMenuText("deleteResult"),
      onDelete: _0x2fe38e ? () => _0x2fe38e.click?.() : null,
      deleteDisabled: _0x2fe38e?.disabled === true
    });
  }
  const _0xf7de75 = _0x312263?.closest?.("[data-story-asset-id]");
  if (_0xf7de75 && _0x4eaaf5?.contains?.(_0xf7de75)) {
    const _0x321fb8 = _0xf7de75.dataset.personReplacementShotCard === "true";
    const _0x237453 = _0xf7de75.closest?.(".story-asset-card-shell, .story-clip-card-shell");
    const _0x178f94 = _0x237453?.querySelector?.(".story-card-delete-control");
    return createWorkspaceEntityContextMenuItems({
      activateLabel: contextMenuText(_0x321fb8 ? "selectClip" : "viewAsset"),
      onActivate: () => _0xf7de75.click?.(),
      deleteLabel: contextMenuText(_0x321fb8 ? "deleteClip" : "deleteAsset"),
      onDelete: _0x178f94 ? () => _0x178f94.click?.() : null,
      deleteDisabled: _0x178f94?.disabled === true
    });
  }
  return [];
}