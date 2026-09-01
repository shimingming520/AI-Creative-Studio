/**
 * Sidebar / workspace-bar active predicates for browse scopes.
 * Keeps NavigationSidebar and title derivation from drifting apart (CU-B3).
 */

export type BrowseNavFlags = {
  assetScope: "all" | "root" | string;
  showTrash: boolean;
  showTagManagement?: boolean;
  activePluginSidebarViewId?: string | null;
  activeTagId: string | null;
  activeCollectionId: string | null;
  activeSmartCollectionId: string | null;
  /** 生成资产: which media-kind row is currently active ('all'|'image'|...). */
  activeGeneratedKind?: string | null;
};

function isPluginSidebarViewActive(flags: BrowseNavFlags): boolean {
  return flags.activePluginSidebarViewId != null && flags.activePluginSidebarViewId.length > 0;
}

function isTagManagementActive(flags: BrowseNavFlags): boolean {
  return Boolean(flags.showTagManagement);
}

function isAlternateBrowseSurfaceActive(flags: BrowseNavFlags): boolean {
  return isTagManagementActive(flags) || isPluginSidebarViewActive(flags);
}

export function isAllAssetsNavActive(flags: BrowseNavFlags): boolean {
  return (
    flags.assetScope === "all" &&
    !flags.showTrash &&
    !isAlternateBrowseSurfaceActive(flags) &&
    !flags.activeTagId &&
    !flags.activeCollectionId &&
    !flags.activeSmartCollectionId
  );
}

export function isTrashNavActive(flags: BrowseNavFlags): boolean {
  return (
    flags.showTrash &&
    !isAlternateBrowseSurfaceActive(flags) &&
    !flags.activeTagId &&
    !flags.activeCollectionId &&
    !flags.activeSmartCollectionId
  );
}

export function isTagManagementNavActive(flags: BrowseNavFlags): boolean {
  return isTagManagementActive(flags);
}

export function isPluginSidebarViewNavActive(
  flags: BrowseNavFlags,
  viewId: string,
): boolean {
  return flags.activePluginSidebarViewId === viewId;
}

export function isRootFolderNavActive(flags: BrowseNavFlags): boolean {
  return (
    flags.assetScope === "root" &&
    !flags.showTrash &&
    !isAlternateBrowseSurfaceActive(flags) &&
    !flags.activeTagId &&
    !flags.activeCollectionId &&
    !flags.activeSmartCollectionId
  );
}

export function isManagedFolderNavActive(
  flags: BrowseNavFlags,
  folderId: string,
): boolean {
  return (
    flags.assetScope === folderId &&
    !flags.showTrash &&
    !isAlternateBrowseSurfaceActive(flags) &&
    !flags.activeTagId &&
    !flags.activeCollectionId &&
    !flags.activeSmartCollectionId
  );
}

/**
 * 生成资产 row active predicate. `assetScope === 'generated'` is the fixed
 * tab's scope marker; the media-kind row (all/image/video/audio/other) is
 * carried in activeGeneratedKind so the row highlight is unambiguous even
 * though the browse session itself is a linked-folder scope + format filters.
 */
export function isGeneratedAssetsNavActive(
  flags: BrowseNavFlags,
  kind: string,
): boolean {
  return (
    flags.assetScope === "generated" &&
    flags.activeGeneratedKind === kind &&
    !flags.showTrash &&
    !isAlternateBrowseSurfaceActive(flags) &&
    !flags.activeTagId &&
    !flags.activeCollectionId &&
    !flags.activeSmartCollectionId
  );
}
