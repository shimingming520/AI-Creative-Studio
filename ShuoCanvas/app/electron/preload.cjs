const { contextBridge, ipcRenderer, webUtils } = require("electron");

function invoke(channel, payload) {
  return ipcRenderer.invoke(channel, payload);
}

function send(channel, payload) {
  ipcRenderer.send(channel, payload);
}

function subscribe(channel, callback, mapPayload = (payload) => payload) {
  if (typeof callback !== "function") return () => {};
  const listener = (_event, payload) => {
    callback(mapPayload(payload));
  };
  ipcRenderer.on(channel, listener);
  return () => {
    ipcRenderer.removeListener(channel, listener);
  };
}

function buildDesktopCapability() {
  return {
    isElectron: true,
    getAppVersion: () => invoke("app:getVersion"),
    getDeviceId: (payload) => invoke("app:getDeviceId", payload),
    checkForUpdates: () => invoke("appUpdater:checkForUpdates"),
    getUpdateState: () => invoke("appUpdater:getState"),
    downloadUpdate: () => invoke("appUpdater:downloadUpdate"),
    cancelUpdateDownload: () => invoke("appUpdater:cancelDownload"),
    installDownloadedUpdate: () => invoke("appUpdater:quitAndInstall"),
    onUpdaterEvent: (callback) => subscribe("appUpdater:event", callback),
  };
}

function buildProjectCapability() {
  return {
    open: (payload) => invoke("project:open", payload),
    save: (payload) => invoke("project:save", payload),
    exportPackage: (payload) => invoke("project:exportPackage", payload),
    importPackage: (payload) => invoke("project:importPackage", payload),
    listRecent: () => invoke("project:listRecent"),
    removeRecent: (payload) => invoke("project:removeRecent", payload),
    setUnsavedState: (payload) => send("project:setUnsavedState", payload),
    writeRecoverySnapshot: (payload) =>
      invoke("project:writeRecoverySnapshot", payload),
    getRecoverySnapshotInfo: (payload) =>
      invoke("project:getRecoverySnapshotInfo", payload),
    readRecoverySnapshot: () => invoke("project:readRecoverySnapshot"),
    clearRecoverySnapshot: () => invoke("project:clearRecoverySnapshot"),
    consumeExternalOpenRequests: () =>
      invoke("project:consumeExternalOpenRequests"),
    onExternalOpen: (callback) => {
      if (typeof callback !== "function") return () => {};
      const listener = () => {
        invoke("project:consumeExternalOpenRequests")
          .then((requests) => {
            callback(Array.isArray(requests) ? requests : []);
          })
          .catch((error) => {
            callback([
              {
                success: false,
                error: String(error?.message || error),
              },
            ]);
          });
      };
      ipcRenderer.on("project:externalOpenAvailable", listener);
      return () => {
        ipcRenderer.removeListener("project:externalOpenAvailable", listener);
      };
    },
    onPackageProgress: (callback) =>
      subscribe("project:packageProgress", callback),
  };
}

function buildClipboardCapability() {
  return {
    writeImage: (payload) => invoke("clipboard:writeImage", payload),
    readImage: () => invoke("clipboard:readImage"),
    writeFileReferences: (payload) =>
      invoke("clipboard:writeFileReferences", payload),
    readFileReferences: () => invoke("clipboard:readFileReferences"),
    writeText: (payload) => invoke("clipboard:writeText", payload),
    readText: () => invoke("clipboard:readText"),
  };
}

function buildCanvasVisualSnapshotCapability() {
  return {
    capturePage: (payload) =>
      invoke("canvasVisualSnapshot:capturePage", payload),
  };
}

function buildScreenshotCapability() {
  return {
    captureDisplay: () => invoke("screenshot:captureDisplay"),
    updateGlobalShortcut: (payload) =>
      invoke("screenshot:updateGlobalShortcut", payload),
    onGlobalCapture: (callback) =>
      subscribe("screenshot:globalCaptureReady", callback),
    onGlobalShortcutStatus: (callback) =>
      subscribe("screenshot:globalShortcutStatus", callback),
  };
}

function buildSecureSettingsCapability() {
  return {
    get: (payload) => invoke("secureSettings:get", payload),
    set: (payload) => invoke("secureSettings:set", payload),
    delete: (payload) => invoke("secureSettings:delete", payload),
  };
}

function buildCustomAiAppCapability() {
  return {
    read: () => invoke("customAiApps:read"),
    write: (payload) => invoke("customAiApps:write", payload),
  };
}

function buildMediaTaskCapability() {
  return {
    enqueue: (payload) => invoke("mediaTask:enqueue", payload),
    cancel: (payload) => invoke("mediaTask:cancel", payload),
    list: (payload) => invoke("mediaTask:list", payload),
    onUpdate: (callback) => subscribe("mediaTask:update", callback),
  };
}

function buildNodeExportCapability() {
  return {
    exportSelected: (payload) => invoke("nodeExport:exportSelected", payload),
    saveMedia: (payload) => invoke("nodeExport:saveMedia", payload),
    saveText: (payload) => invoke("nodeExport:saveText", payload),
    saveMediaFiles: (payload) => invoke("nodeExport:saveMediaFiles", payload),
  };
}

function buildNotificationSoundCapability() {
  return {
    listMp3Files: (payload) =>
      invoke("notificationSound:listMp3Files", payload),
    listSystemSounds: () => invoke("notificationSound:listSystemSounds"),
    openSystemSoundFolder: () =>
      invoke("notificationSound:openSystemSoundFolder"),
    play: (payload) => invoke("notificationSound:play", payload),
  };
}

function buildShellCapability() {
  return {
    openExternal: (url) => invoke("shell:openExternal", { url }),
  };
}

function buildWebPreviewCapability() {
  return {
    syncViews: (payload) => invoke("webPreview:syncViews", payload),
    syncViewsFast: (payload) => {
      send("webPreview:syncViewsFast", payload);
      return Promise.resolve({ ok: true });
    },
    disposeViews: (payload) => invoke("webPreview:disposeViews", payload),
    controlView: (payload) => invoke("webPreview:controlView", payload),
    onEvent: (callback) => subscribe("webPreview:event", callback),
  };
}

function buildDiagnosticsCapability() {
  return {
    logEvent: (payload) => invoke("diagnostics:logEvent", payload),
    createPackage: (payload) => invoke("diagnostics:createPackage", payload),
    openLogsFolder: () => invoke("diagnostics:openLogsFolder"),
  };
}

function buildNotificationCapability() {
  return {
    showGenerationComplete: (payload) =>
      invoke("notification:showGenerationComplete", payload),
    onGenerationCompleteClick: (callback) =>
      subscribe("notification:generationCompleteClicked", callback),
  };
}

function buildLocalAssetCleanupCapability() {
  return {
    scan: (payload) => invoke("localAssetCleanup:scan", payload),
    trash: (payload) => invoke("localAssetCleanup:trash", payload),
  };
}

function buildElectronCapability() {
  return {
    getPathForFile: (file) => webUtils.getPathForFile(file),
    project: buildProjectCapability(),
    clipboard: buildClipboardCapability(),
    canvasVisualSnapshot: buildCanvasVisualSnapshotCapability(),
    screenshot: buildScreenshotCapability(),
    secureSettings: buildSecureSettingsCapability(),
    customAiApps: buildCustomAiAppCapability(),
    importAsset: (payload) => invoke("asset:import", payload),
    importRemoteAsset: (payload) => invoke("asset:importRemote", payload),
    mediaTask: buildMediaTaskCapability(),
    nodeExport: buildNodeExportCapability(),
    getLocalPreviewUrl: (payload) => invoke("file:getLocalPreviewUrl", payload),
    importLocalFile: (payload) => invoke("file:importLocalFile", payload),
    selectDirectory: (payload) => invoke("dialog:selectDirectory", payload),
    notificationSound: buildNotificationSoundCapability(),
    showItemInFolder: (payload) => invoke("shell:showItemInFolder", payload),
    openKnownFolder: (payload) => invoke("shell:openKnownFolder", payload),
    shell: buildShellCapability(),
    webPreview: buildWebPreviewCapability(),
    diagnostics: buildDiagnosticsCapability(),
    notification: buildNotificationCapability(),
    localAssetCleanup: buildLocalAssetCleanupCapability(),
    onAssetUpdated: (callback) => subscribe("asset:updated", callback),
    logDragImport: (label, payload) =>
      send("diagnostics:dragImportLog", { label, payload }),
  };
}

contextBridge.exposeInMainWorld("aiCanvasDesktop", buildDesktopCapability());
contextBridge.exposeInMainWorld("electronAPI", buildElectronCapability());
