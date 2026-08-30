import { createProjectCapabilityOperations } from "../projectCapabilityOperations.js";
import { createSecureSettingsCapabilityOperations } from "../secureSettingsCapabilityOperations.js";
import { createDiagnosticsCapabilityOperations } from "../diagnosticsCapabilityOperations.js";
import { openShellFolder } from "../shellItemRevealer.js";
import a234_0x28bf76 from "electron";
const {
  shell = {}
} = typeof a234_0x28bf76 === "object" && a234_0x28bf76 ? a234_0x28bf76 : {};
export function buildMainIpcHandlerDeps(_0x59e5ef = {}) {
  const {
    app: _0x254e7a,
    readAppVersionFromIndexHtml: _0xdeb8ab,
    getStableDeviceId: _0x1a2cc2,
    getUpdaterController: _0x2019b2,
    getBackgroundCompletionNotifier: _0x4c697a,
    getDataDir: _0x483996,
    getSecureSettingsStore: _0x4a918b,
    normalizeSecureSettingsKeys: _0x3ddbdd,
    fileReferencesFormat: _0xcff682,
    createClipboardNativeImage: _0x2dcff1,
    screenshotOverlayController: _0x10350e,
    normalizeClipboardFileReferences: _0x297c42,
    parseClipboardFileReferencesFromText: _0xd3c29,
    exportDesktopProjectPackage: _0x3d1646,
    importDesktopProjectPackage: _0x559c3c,
    exportSelectedNodesPackage: _0x4297db,
    saveMediaFile: _0x17f96d,
    saveTextFile: _0x371868,
    saveMediaFiles: _0x357a55,
    handleRendererUnsavedState: _0x15b404,
    getRecentProjectsStorePath: _0x25f9e8,
    syncSystemRecentDocumentsBestEffort: _0x498a37,
    pendingExternalProjectOpenRequests: _0x9c8397,
    getCanvasProjectDir: _0x23c9be,
    showOpenDialog: _0x1c706f,
    showSaveDialog: _0x256960,
    projectFileStore: _0x20c2cf,
    supportedProjectFileExtensions: _0x3af8cb,
    getRecoverySnapshotPath: _0x335603,
    writeRecoverySnapshotFile: _0xc79f13,
    getRecoverySnapshotFileInfo: _0x1f52fa,
    readRecoverySnapshotFile: _0x2884c5,
    removeRecoverySnapshotFile: _0xac29d6,
    importAssetToLibrary: _0x1af5b7,
    importRemoteAssetToLibrary: _0x2178ce,
    createLocalPreviewUrl: _0x17aea8,
    resolveLocalVirtualPath: _0x1ea3c4,
    resolveKnownFolder: _0x5a17ed,
    openExternalUrl: _0x590975,
    getWebPreviewViewManager: _0x540410,
    selectDirectory: _0x380c7b,
    listNotificationSoundMp3Files: _0x4ff901,
    listSystemNotificationSoundFiles: _0x4567c2,
    openSystemNotificationSoundFolder: _0x4bc97e,
    playNotificationSound: _0x12c071,
    getMediaTaskQueue: _0x267ae5,
    getLocalAssetCleanupManager: _0x41657a,
    consumeAssetUpdateEvents: _0x56e1e8,
    readLegacyRendererStorageMigration: _0x1b1580,
    completeLegacyRendererStorageMigration: _0x751cb7,
    diagnostics: _0x49c552,
    logDir: _0x28f8be,
    logDiagnosticEvent: _0x16617d,
    openFolder: _0x4d62d8
  } = _0x59e5ef;
  const _0x18504f = createProjectCapabilityOperations({
    exportDesktopProjectPackage: _0x3d1646,
    importDesktopProjectPackage: _0x559c3c,
    handleRendererUnsavedState: _0x15b404,
    getRecentProjectsStorePath: _0x25f9e8,
    syncSystemRecentDocumentsBestEffort: _0x498a37,
    pendingExternalProjectOpenRequests: _0x9c8397,
    getCanvasProjectDir: _0x23c9be,
    showOpenDialog: _0x1c706f,
    showSaveDialog: _0x256960,
    projectFileStore: _0x20c2cf,
    supportedProjectFileExtensions: _0x3af8cb,
    getRecoverySnapshotPath: _0x335603,
    writeRecoverySnapshotFile: _0xc79f13,
    getRecoverySnapshotFileInfo: _0x1f52fa,
    readRecoverySnapshotFile: _0x2884c5,
    removeRecoverySnapshotFile: _0xac29d6
  });
  const _0x58692b = createSecureSettingsCapabilityOperations({
    getSecureSettingsStore: _0x4a918b,
    normalizeSecureSettingsKeys: _0x3ddbdd
  });
  const _0x3890c8 = createDiagnosticsCapabilityOperations({
    diagnostics: _0x49c552,
    logDir: _0x28f8be,
    showSaveDialog: _0x256960,
    openFolder: typeof _0x4d62d8 === "function" ? _0x4d62d8 : _0x1285a7 => openShellFolder(_0x1285a7, {
      shellApi: shell,
      logEvent: _0x16617d
    })
  });
  return {
    getAppVersion: () => _0xdeb8ab() || _0x254e7a.getVersion(),
    getStableDeviceId: _0x1a2cc2,
    getUpdaterController: _0x2019b2,
    getBackgroundCompletionNotifier: _0x4c697a,
    getDataDir: _0x483996,
    secureSettingsOperations: _0x58692b,
    fileReferencesFormat: _0xcff682,
    createClipboardNativeImage: _0x2dcff1,
    captureDesktopDisplay: _0x10350e.captureDesktopDisplay,
    configureGlobalScreenshotShortcut: _0x10350e.configureGlobalScreenshotShortcut,
    consumeGlobalScreenshotCaptureEvents: _0x10350e.consumeGlobalScreenshotCaptureEvents,
    getGlobalScreenshotShortcutStatus: _0x10350e.getGlobalScreenshotShortcutStatus,
    handleScreenshotOverlayConfirm: _0x10350e.handleScreenshotOverlayConfirm,
    handleScreenshotOverlayCancel: _0x10350e.handleScreenshotOverlayCancel,
    normalizeClipboardFileReferences: _0x297c42,
    parseClipboardFileReferencesFromText: _0xd3c29,
    projectOperations: _0x18504f,
    exportSelectedNodesPackage: _0x4297db,
    saveMediaFile: _0x17f96d,
    saveTextFile: _0x371868,
    saveMediaFiles: _0x357a55,
    importAssetToLibrary: _0x1af5b7,
    importRemoteAssetToLibrary: _0x2178ce,
    createLocalPreviewUrl: _0x17aea8,
    resolveLocalVirtualPath: _0x1ea3c4,
    resolveKnownFolder: _0x5a17ed,
    openExternalUrl: _0x590975,
    getWebPreviewViewManager: _0x540410,
    selectDirectory: _0x380c7b,
    listNotificationSoundMp3Files: _0x4ff901,
    listSystemNotificationSoundFiles: _0x4567c2,
    openSystemNotificationSoundFolder: _0x4bc97e,
    playNotificationSound: _0x12c071,
    getMediaTaskQueue: _0x267ae5,
    getLocalAssetCleanupManager: _0x41657a,
    consumeAssetUpdateEvents: _0x56e1e8,
    readLegacyRendererStorageMigration: _0x1b1580,
    completeLegacyRendererStorageMigration: _0x751cb7,
    diagnostics: _0x49c552,
    diagnosticsOperations: _0x3890c8,
    logDir: _0x28f8be,
    logDiagnosticEvent: _0x16617d,
    openFolder: _0x4d62d8
  };
}
export function createMainIpcHandlerInstaller({
  registerIpcHandlers: _0x135571,
  context: _0x513335
} = {}) {
  if (typeof _0x135571 !== "function") {
    throw new TypeError("registerIpcHandlers must be a function");
  }
  let _0x3a8846 = false;
  return function _0x2ac31f() {
    if (_0x3a8846) {
      return false;
    }
    _0x3a8846 = true;
    _0x135571(buildMainIpcHandlerDeps(_0x513335));
    return true;
  };
}