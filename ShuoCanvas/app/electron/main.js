import { app, autoUpdater as a249_0x1be7ae, BrowserWindow, dialog, Menu, nativeImage, Notification, powerSaveBlocker, protocol, safeStorage, screen, session, shell, WebContentsView } from "electron";
import a249_0x4d2a83 from "electron-updater";
import { execFileSync, spawn } from "node:child_process";
import { createHash, randomBytes } from "node:crypto";
import { createReadStream, createWriteStream, existsSync, mkdirSync, readFileSync, realpathSync, readdirSync, renameSync, statSync, unlinkSync, writeFileSync } from "node:fs";
import a249_0x4b7023 from "node:http";
import a249_0x815eab from "node:path";
import { Readable } from "node:stream";
import { fileURLToPath } from "node:url";
import { installAppMenu } from "./appMenu.js";
import { createAssetIndexCoordinator } from "./assetIndexCoordinator.js";
import { createAssetDerivativeScheduler } from "./assetDerivativeScheduler.js";
import { readAssetIndexFile, writeAssetIndexFile } from "./assetIndexFileStore.js";
import { getExistingAssetOriginalFilename, materializeAssetOriginal } from "./assetOriginalStore.js";
import { createKeyedOperationQueue } from "./keyedOperationQueue.js";
import { resolveExistingPathWithinRoot } from "./localPathContainment.js";
import { runToolCapture } from "./toolCapture.js";
import { configureFfmpegVideoEncoderRuntime, runFfmpegVideoTask } from "./ffmpegVideoEncoderRuntime.js";
import { createDeviceIdentityManager } from "./deviceIdentity.js";
import { createDiagnosticsManager } from "./diagnostics.js";
import { createForegroundDialogPresenter } from "./dialogPresenter.js";
import { createDoubaoAsrConfigResolver } from "./doubaoAsrConfig.js";
import { formatExternalUrlForLog, normalizeExternalUrl } from "./externalLinks.js";
import { createLocalAssetCleanupManager } from "./localAssetCleanup.js";
import { createLocalAssetCleanupRootsResolver, readFileSavePathsForLocalCleanup } from "./localAssetCleanupRoots.js";
import { MediaTaskQueue } from "./mediaTaskQueue.js";
import { registerLocalMediaTaskHandlers } from "./mediaTasks/registerLocalMediaTaskHandlers.js";
import { registerSharedMediaTaskHandlers } from "./mediaTasks/registerSharedMediaTaskHandlers.js";
import { syncRecentProjectsToSystemRecentDocuments } from "./recentDocuments.js";
import { installRecoverySnapshotBeforeClose, requestRendererRecoverySnapshot } from "./recoverySnapshot.js";
import { createSecureSettingsStore } from "./secureSettingsStore.js";
import { createScreenshotOverlayController } from "./screenshotOverlayController.js";
import { buildLegacyFileSavePathEnv, createStorageRoots } from "./storageRoots.js";
import { readUserSettingsFromFilesSync } from "./fileSaveSettingsReader.js";
import { resolveFunasrModelRootDir } from "./funasrModelRoot.js";
import { createUpdaterController } from "./updaterController.js";
import { extractPreviewVideoUrlFromNotes, normalizeUpdaterInfoPayload } from "./updaterInfoNormalizer.js";
import { createUpdateInstallPreparation } from "./updateInstallPreparation.js";
import { resolveAsrRuntimePythonCommand, resolvePreferredRuntimePythonCommand } from "./pythonRuntimeResolver.js";
import { createNodeExportController } from "./nodeExportController.js";
import { createProjectPackageController } from "./projectPackageController.js";
import { buildProjectOpenResponse } from "./projectCapabilityOperations.js";
import { createSystemNotificationSoundFileService, listNotificationSoundMp3Files } from "./notificationSoundFiles.js";
import { createBackgroundCompletionNotifier } from "./backgroundCompletionNotification.js";
import { resolveBackendLaunchSpec } from "./backendLaunchResolver.js";
import { findVerifiedBackendProcessPids } from "./backendProcessIdentity.js";
import { activateMainWindow } from "./mainWindowActivation.js";
import { buildMainIpcHandlerDeps, createMainIpcHandlerInstaller } from "./ipc/mainIpcSetup.js";
import { createLocalRuntimeKeepAliveController } from "./localRuntimeKeepAlive.js";
import { configureRendererResponsiveness } from "./rendererResponsiveness.js";
import { createRemoteAssetImporter } from "./remoteAssetImport.js";
import { buildRuntimePythonCertificateEnv, buildRuntimeToolEnv, resolveRuntimeRoot, resolveRuntimeToolPath } from "./runtimeAssetResolver.js";
import { installWindowsTaskbarIdentity } from "./windowsTaskbarIdentity.js";
import { createWebPreviewViewManager } from "./webPreviewViewManager.js";
import { createStartupHelpers } from "./mainStartupHelpers.js";
import { findFirstSupportedProjectPathFromArgs, getRecoverySnapshotInfo as a249_0x10dd75, readRecoverySnapshot as a249_0x1245aa, removeRecoverySnapshot as a249_0x2bdf10, SUPPORTED_PROJECT_FILE_EXTENSIONS, upsertRecentProject, writeRecoverySnapshot as a249_0x228266 } from "../src/services/desktopProjectFileStore.js";
import { buildChromeShellStartupMetadataUrl, CHROME_SHELL_STARTUP_READY_EVENT } from "../src/services/chromeShellStartupReadiness.js";
import { registerIpcHandlers } from "./ipc/registerIpcHandlers.js";
import { checkChromeShellBrowserVersionBeforeLaunch } from "./chromeShellBrowserVersion.js";
import { activateChromeShellWindowSoon, closeChromeShellLaunchForUpdate, focusChromeShellLaunchWindow, isChromeShellLaunchActive, resolveChromeShellBrowserExecutable, shouldQuitWhenAllElectronWindowsClosed, shouldUseChromeShellRuntime } from "./chromeShellLauncher.js";
import { promptForChromeShellStartupFailure, promptForMissingChromeShellBrowser } from "./chromeShellStartupFallback.js";
import { startChromeShellRuntime } from "./chromeShellRuntime.js";
import { launchMonitoredBackendProcess } from "./backendStartupMonitor.js";
import { createChromeShellStartupHealthController, resolveChromeShellStartupReadyTimeoutMs } from "./chromeShellStartupHealth.js";
import { installDevReloadShortcuts } from "./devReloadShortcuts.js";
import { startDesktopHttpBridge } from "./desktopHttpBridge.js";
import { buildLegacyRendererStorageMigrationAppUrl, createLegacyRendererStorageMigration } from "./legacyRendererStorageMigration.js";
import { reclaimStartupPort } from "./startupPortRecovery.js";
import { VIDEO_PLAYBACK_PROXY_VERSION, buildVideoPlaybackProxyFfmpegArgs, createVideoPlaybackProxyWorkDeduper, getVideoPlaybackProxyFilename, isCurrentVideoPlaybackProxyLocalPath, needsBrowserVideoProxy, resolveVideoPlaybackProxyTimeoutMs } from "./videoPlaybackProxy.js";
const videoPlaybackProxyWorkDeduper = createVideoPlaybackProxyWorkDeduper();
const assetImportQueue = createKeyedOperationQueue();
const ASSET_IMPORT_FFPROBE_TIMEOUT_MS = 30000;
const APP_DISPLAY_NAME = "SHUO Canvas";
const APP_USER_MODEL_ID = "com.shuocanvas.editor";
const APP_USER_DATA_DIRNAME = "AI CanvasPro";
const APP_USER_DATA_ROOT = process.env.AICANVAS_TEST_USER_DATA_DIR ? a249_0x815eab.resolve(process.env.AICANVAS_TEST_USER_DATA_DIR) : a249_0x815eab.join(app.getPath("appData"), APP_USER_DATA_DIRNAME);
const APP_TEST_SESSION_DATA_ROOT = process.env.AICANVAS_TEST_SESSION_DATA_DIR ? a249_0x815eab.resolve(process.env.AICANVAS_TEST_SESSION_DATA_DIR) : process.env.AICANVAS_TEST_USER_DATA_DIR ? a249_0x815eab.join(APP_USER_DATA_ROOT, "session") : "";
const __filename = fileURLToPath(import.meta.url);
const __dirname = a249_0x815eab.dirname(__filename);
const APP_ROOT = app.isPackaged ? app.getAppPath() : a249_0x815eab.resolve(__dirname, "..");
const APP_WINDOW_ICON_PATH = process.platform === "win32" ? a249_0x815eab.join(APP_ROOT, "build", "app-icon.ico") : undefined;
const RUNTIME_ROOT = resolveRuntimeRoot({
  appIsPackaged: app.isPackaged,
  appRoot: APP_ROOT,
  resourcesPath: process.resourcesPath
});
const STORAGE_ROOTS = createStorageRoots({
  appIsPackaged: app.isPackaged,
  appRoot: APP_ROOT,
  processExecPath: process.execPath,
  userDataRoot: APP_USER_DATA_ROOT,
  localAppData: process.env.LOCALAPPDATA
});
const PACKAGED_INSTALL_ROOT = STORAGE_ROOTS.installRoot;
const PACKAGED_INSTALL_DATA_ROOT = STORAGE_ROOTS.installDataRoot;
const PACKAGED_FILES_ROOT = STORAGE_ROOTS.storageRoot;
const LEGACY_PACKAGED_FILES_ROOTS = STORAGE_ROOTS.legacyFilesRoots;
const LEGACY_PACKAGED_FILES_ROOT = LEGACY_PACKAGED_FILES_ROOTS[0] || APP_ROOT;
const HOST = "127.0.0.1";
const PORT = Number.parseInt(process.env.AICANVAS_PORT || "8777", 10) || 8777;
const APP_ORIGIN = "http://" + HOST + ":" + PORT;
const APP_URL = APP_ORIGIN + "/";
const SERVER_READY_TIMEOUT_MS = /^(?:[1-9]\d*)$/.test(process.env.AICANVAS_SERVER_READY_TIMEOUT_MS || "") ? Number.parseInt(process.env.AICANVAS_SERVER_READY_TIMEOUT_MS, 10) : 120000;
const SERVER_READY_INTERVAL_MS = 400;
const LOCAL_ACCESS_TOKEN = randomBytes(32).toString("hex");
const SERVER_ID_HEADER = "x-aicanvas-server";
const SERVER_ID_VALUE = "AI CanvasPro";
const LOCAL_PREVIEW_SCHEME = "aic-local-preview";
const LOCAL_PREVIEW_TTL_MS = 43200000;
const LONG_MEDIA_TASK_NOTIFICATION_MS = 20000;
const PERSON_REPLACEMENT_COMPOSE_TASK_PURPOSE = "person-replacement-compose";
const VIDEO_PROXY_TRANSCODE_PRESET = "veryfast";
const VIDEO_PROXY_TRANSCODE_CRF = "23";
const CLIPBOARD_FILE_REFERENCES_FORMAT = "application/x-ai-canvas-file-references";
const RECOVERY_SNAPSHOT_FILENAME = "recovery-snapshot.json";
const GLOBAL_SCREENSHOT_ACCELERATOR = "Alt+Q";
let mainWindow = null;
let spawnedServer = null;
let updaterHandlersInstalled = false;
let updateCheckStarted = false;
let autoUpdaterInstance = null;
let updaterController = null;
let localApiTokenHeaderInstalled = false;
let latestUpdaterEvent = null;
let latestUpdaterInfo = null;
let localPreviewProtocolInstalled = false;
let backendRestartInProgress = false;
let mediaTaskQueue = null;
let localAssetCleanupManager = null;
let secureSettingsStore = null;
let updateInstallPreparation = null;
let mediaTaskActivity = {
  activeCount: 0,
  waitingCount: 0,
  totalCount: 0,
  progress: 0,
  activeTasks: []
};
let chromeShellLaunch = null;
let chromeShellBrowserWorker = null;
let chromeShellWebPreviewManager = null;
let desktopHttpBridge = null;
let chromeShellStartupInProgress = false;
let chromeShellStartupSettledPromise = Promise.resolve();
function isAssetImportLoggingEnabled() {
  return /^(1|true|yes|on)$/i.test(String(process.env.AIC_ASSET_IMPORT_LOG || "").trim());
}
let rendererProjectState = {
  hasUnsavedChanges: false,
  projectName: ""
};
let isQuittingForUpdate = false;
const pendingExternalProjectOpenRequests = [];
const pendingAssetUpdateEvents = [];
const localPreviewEntries = new Map();
const taskbarProgressSources = new Map();
const powerSaveBlockerReasons = new Map();
const notifiedMediaTaskIds = new Set();
const chromeShellStartupHealth = createChromeShellStartupHealthController();
configureRendererResponsiveness(app);
protocol.registerSchemesAsPrivileged([{
  scheme: LOCAL_PREVIEW_SCHEME,
  privileges: {
    standard: true,
    secure: true,
    supportFetchAPI: true,
    stream: true
  }
}]);
app.setName(APP_DISPLAY_NAME);
if (process.platform === "win32") {
  app.setAppUserModelId(APP_USER_MODEL_ID);
}
mkdirSync(APP_USER_DATA_ROOT, {
  recursive: true
});
app.setPath("userData", APP_USER_DATA_ROOT);
if (APP_TEST_SESSION_DATA_ROOT) {
  mkdirSync(APP_TEST_SESSION_DATA_ROOT, {
    recursive: true
  });
  app.setPath("sessionData", APP_TEST_SESSION_DATA_ROOT);
}
const GOT_SINGLE_INSTANCE_LOCK = app.requestSingleInstanceLock();
if (!GOT_SINGLE_INSTANCE_LOCK) {
  console.warn("[electron] " + APP_DISPLAY_NAME + " launcher is already running; forwarding to the existing instance.");
  app.exit(0);
  process.exit(0);
}
const USER_DATA_DIR = APP_USER_DATA_ROOT;
const LOG_DIR = a249_0x815eab.join(USER_DATA_DIR, "logs");
const SERVER_LOG_PATH = a249_0x815eab.join(LOG_DIR, "server.log");
const WINDOW_STATE_PATH = a249_0x815eab.join(USER_DATA_DIR, "window-state.json");
const LEGACY_CHROME_SHELL_BROWSER_CHOICE_PATH = a249_0x815eab.join(USER_DATA_DIR, "chrome-shell-browser-choice.json");
mkdirSync(LOG_DIR, {
  recursive: true
});
const legacyRendererStorageMigration = createLegacyRendererStorageMigration({
  userDataDir: USER_DATA_DIR,
  appUrl: APP_URL,
  createWindow: () => new BrowserWindow({
    show: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      backgroundThrottling: false
    }
  })
});
const DEFAULT_WINDOW_STATE = {
  width: 1440,
  height: 960,
  isMaximized: false
};
const diagnostics = createDiagnosticsManager({
  app: app,
  logDir: LOG_DIR,
  diagnosticsDir: a249_0x815eab.join(LOG_DIR, "diagnostics"),
  serverLogPath: SERVER_LOG_PATH,
  getMetadata: async () => {
    const _0x54572b = await requestLocalJson("/api/v2/runtime/info").catch(() => null);
    return {
      app: {
        name: APP_DISPLAY_NAME,
        version: readAppVersionFromIndexHtml() || app.getVersion(),
        packaged: app.isPackaged,
        appPathType: app.isPackaged ? "packaged" : "development"
      },
      runtime: {
        electron: process.versions.electron || "",
        chrome: process.versions.chrome || "",
        node: process.versions.node || "",
        v8: process.versions.v8 || ""
      },
      backend: {
        url: APP_URL,
        spawned: Boolean(spawnedServer),
        pid: spawnedServer?.pid || null,
        ready: Boolean(_0x54572b?.success),
        outboundTls: _0x54572b?.outboundTls || null
      },
      updater: {
        ...(updaterController?.getState?.() || {}),
        latestEvent: latestUpdaterEvent || null,
        latestInfo: latestUpdaterInfo || null
      },
      paths: {
        logs: "userData/logs",
        diagnostics: "userData/logs/diagnostics or Downloads"
      }
    };
  }
});
const foregroundDialogs = createForegroundDialogPresenter({
  app: app,
  dialog: dialog,
  getMainWindow: () => mainWindow,
  shouldUseOwnerWindow: () => shouldUseChromeShellRuntime(process.env, {
    appIsPackaged: app.isPackaged
  })
});
const showOpenDialog = foregroundDialogs.showOpenDialog;
const showSaveDialog = foregroundDialogs.showSaveDialog;
const getDialogParentWindow = foregroundDialogs.getDialogParentWindow;
const screenshotOverlayController = createScreenshotOverlayController({
  appRoot: APP_ROOT,
  dirname: __dirname,
  accelerator: GLOBAL_SCREENSHOT_ACCELERATOR,
  getMainWindow: () => mainWindow,
  logDiagnosticEvent: logDiagnosticEvent
});
diagnostics.ensureInitialFiles();
function logDiagnosticEvent(_0x1a1bb4 = {}) {
  const _0x31250d = chromeShellStartupHealth.observeDiagnosticEvent(_0x1a1bb4);
  const _0x1e2ce9 = diagnostics.logEvent(_0x1a1bb4);
  if (_0x1a1bb4?.type === CHROME_SHELL_STARTUP_READY_EVENT) {
    return {
      ..._0x1e2ce9,
      startupReadyAccepted: _0x31250d
    };
  } else {
    return _0x1e2ce9;
  }
}
const localRuntimeKeepAlive = createLocalRuntimeKeepAliveController({
  getWindow: () => mainWindow,
  requestLocalJson: requestLocalJson,
  setPowerSaveBlocker: setPowerSaveBlocker,
  logDiagnosticEvent: logDiagnosticEvent
});
const {
  delay,
  loadStartupStatus,
  isLocalAppUrl,
  openExternalUrl
} = createStartupHelpers({
  appDisplayName: APP_DISPLAY_NAME,
  appOrigin: APP_ORIGIN,
  getMainWindow: () => mainWindow,
  logDiagnosticEvent: logDiagnosticEvent,
  shellApi: shell,
  normalizeExternalUrl: normalizeExternalUrl,
  formatExternalUrlForLog: formatExternalUrlForLog
});
function normalizeTaskbarProgress(_0x447f31) {
  const _0x2f6c9c = Number(_0x447f31);
  if (!Number.isFinite(_0x2f6c9c) || _0x2f6c9c < 0) {
    return null;
  }
  return Math.max(0, Math.min(1, _0x2f6c9c));
}
function refreshTaskbarProgress() {
  if (!mainWindow || mainWindow.isDestroyed()) {
    return;
  }
  const _0xd4cb75 = taskbarProgressSources.get("updater") ?? taskbarProgressSources.get("media") ?? null;
  mainWindow.setProgressBar(_0xd4cb75 == null ? -1 : _0xd4cb75);
}
function setTaskbarProgressSource(_0x394c1c, _0x3aed86) {
  const _0x257b39 = String(_0x394c1c || "").trim();
  if (!_0x257b39) {
    return;
  }
  const _0x37e229 = normalizeTaskbarProgress(_0x3aed86);
  if (_0x37e229 == null) {
    taskbarProgressSources.delete(_0x257b39);
  } else {
    taskbarProgressSources.set(_0x257b39, _0x37e229);
  }
  refreshTaskbarProgress();
}
function setPowerSaveBlocker(_0xc81a05, _0x4b6d69, _0xc67d0c = "prevent-display-sleep") {
  const _0x5c985f = String(_0xc81a05 || "").trim();
  if (!_0x5c985f) {
    return;
  }
  const _0x370930 = _0xc67d0c === "prevent-app-suspension" ? "prevent-app-suspension" : "prevent-display-sleep";
  if (_0x4b6d69) {
    if (powerSaveBlockerReasons.has(_0x5c985f)) {
      return;
    }
    const _0x5b794e = powerSaveBlocker.start(_0x370930);
    powerSaveBlockerReasons.set(_0x5c985f, _0x5b794e);
    logDiagnosticEvent({
      type: "power_save_blocker.started",
      level: "info",
      source: "main",
      message: "Power save blocker started",
      context: {
        reason: _0x5c985f,
        blockerId: _0x5b794e,
        type: _0x370930
      }
    });
    return;
  }
  const _0x4ed37f = powerSaveBlockerReasons.get(_0x5c985f);
  if (_0x4ed37f == null) {
    return;
  }
  powerSaveBlockerReasons.delete(_0x5c985f);
  try {
    if (powerSaveBlocker.isStarted(_0x4ed37f)) {
      powerSaveBlocker.stop(_0x4ed37f);
    }
  } catch (_0x3df235) {
    console.warn("[electron] failed to stop power save blocker:", _0x3df235);
  }
  logDiagnosticEvent({
    type: "power_save_blocker.stopped",
    level: "info",
    source: "main",
    message: "Power save blocker stopped",
    context: {
      reason: _0x5c985f,
      blockerId: _0x4ed37f
    }
  });
}
function stopAllPowerSaveBlockers() {
  for (const _0x3c617f of [...powerSaveBlockerReasons.keys()]) {
    setPowerSaveBlocker(_0x3c617f, false);
  }
}
function normalizeWindowState(_0x1336aa) {
  const _0x4c0d9a = _0x1336aa && typeof _0x1336aa === "object" ? _0x1336aa : {};
  const _0x377802 = _0x4c0d9a.bounds && typeof _0x4c0d9a.bounds === "object" ? _0x4c0d9a.bounds : _0x4c0d9a;
  const _0x14f302 = Number.parseInt(_0x377802.width, 10);
  const _0xba4a65 = Number.parseInt(_0x377802.height, 10);
  const _0x39186f = Number.parseInt(_0x377802.x, 10);
  const _0x2fdd64 = Number.parseInt(_0x377802.y, 10);
  const _0x4fd10a = {
    width: Number.isFinite(_0x14f302) && _0x14f302 >= 1024 ? _0x14f302 : DEFAULT_WINDOW_STATE.width,
    height: Number.isFinite(_0xba4a65) && _0xba4a65 >= 720 ? _0xba4a65 : DEFAULT_WINDOW_STATE.height,
    isMaximized: _0x4c0d9a.isMaximized === true
  };
  if (Number.isFinite(_0x39186f) && Number.isFinite(_0x2fdd64)) {
    _0x4fd10a.x = _0x39186f;
    _0x4fd10a.y = _0x2fdd64;
  }
  return _0x4fd10a;
}
function isWindowStateOnDisplay(_0x40ef6d) {
  if (!Number.isFinite(_0x40ef6d?.x) || !Number.isFinite(_0x40ef6d?.y)) {
    return true;
  }
  const _0x3a42e2 = {
    x: _0x40ef6d.x,
    y: _0x40ef6d.y,
    width: _0x40ef6d.width,
    height: _0x40ef6d.height
  };
  return screen.getAllDisplays().some(({
    workArea: _0x581a8c
  }) => {
    return _0x3a42e2.x < _0x581a8c.x + _0x581a8c.width && _0x3a42e2.x + _0x3a42e2.width > _0x581a8c.x && _0x3a42e2.y < _0x581a8c.y + _0x581a8c.height && _0x3a42e2.y + _0x3a42e2.height > _0x581a8c.y;
  });
}
function readWindowState() {
  try {
    const _0x5c3c0d = normalizeWindowState(JSON.parse(readFileSync(WINDOW_STATE_PATH, "utf8")));
    if (!isWindowStateOnDisplay(_0x5c3c0d)) {
      delete _0x5c3c0d.x;
      delete _0x5c3c0d.y;
    }
    return _0x5c3c0d;
  } catch {
    return {
      ...DEFAULT_WINDOW_STATE
    };
  }
}
function writeWindowState(_0x133c82) {
  if (!_0x133c82 || _0x133c82.isDestroyed()) {
    return;
  }
  const _0x2d1618 = _0x133c82.getBounds();
  const _0x5eb894 = normalizeWindowState({
    ..._0x2d1618,
    isMaximized: _0x133c82.isMaximized()
  });
  const _0x575306 = WINDOW_STATE_PATH + "." + process.pid + "." + Date.now() + ".tmp";
  try {
    mkdirSync(a249_0x815eab.dirname(WINDOW_STATE_PATH), {
      recursive: true
    });
    writeFileSync(_0x575306, JSON.stringify(_0x5eb894, null, 2) + "\n", "utf8");
    renameSync(_0x575306, WINDOW_STATE_PATH);
  } catch (_0x854659) {
    console.warn("[electron] failed to save window state:", _0x854659);
  }
}
function installWindowStatePersistence(_0x2e6fbd) {
  let _0x1e4edf = null;
  const _0x532b4d = () => {
    if (_0x1e4edf) {
      clearTimeout(_0x1e4edf);
    }
    _0x1e4edf = setTimeout(() => {
      _0x1e4edf = null;
      writeWindowState(_0x2e6fbd);
    }, 400);
  };
  _0x2e6fbd.on("move", _0x532b4d);
  _0x2e6fbd.on("resize", _0x532b4d);
  _0x2e6fbd.on("maximize", _0x532b4d);
  _0x2e6fbd.on("unmaximize", _0x532b4d);
  _0x2e6fbd.on("close", () => {
    if (_0x1e4edf) {
      clearTimeout(_0x1e4edf);
      _0x1e4edf = null;
    }
    writeWindowState(_0x2e6fbd);
  });
}
function probeServer(_0x3389f8 = 1200) {
  return new Promise(_0x1e7e85 => {
    const _0x2b172c = a249_0x4b7023.get(APP_ORIGIN + "/api/v2/runtime/info", {
      timeout: _0x3389f8
    }, _0x3c62ff => {
      const _0x48c47d = String(_0x3c62ff.headers[SERVER_ID_HEADER] || "");
      _0x3c62ff.resume();
      _0x1e7e85(_0x3c62ff.statusCode === 200 && _0x48c47d === SERVER_ID_VALUE);
    });
    _0x2b172c.on("timeout", () => {
      _0x2b172c.destroy();
      _0x1e7e85(false);
    });
    _0x2b172c.on("error", () => {
      _0x1e7e85(false);
    });
  });
}
function requestLocalJson(_0x3dd0aa, _0x509bc3 = 1600) {
  return new Promise((_0x2e1f4e, _0x4fde3e) => {
    const _0xfe5288 = a249_0x4b7023.request({
      hostname: HOST,
      port: PORT,
      path: _0x3dd0aa,
      method: "GET",
      timeout: _0x509bc3,
      headers: {
        "X-AIC-Local-Token": LOCAL_ACCESS_TOKEN
      }
    }, _0x43d6ad => {
      const _0x120143 = [];
      _0x43d6ad.on("data", _0x276d01 => _0x120143.push(Buffer.from(_0x276d01)));
      _0x43d6ad.on("end", () => {
        const _0x763140 = Buffer.concat(_0x120143).toString("utf8");
        if (_0x43d6ad.statusCode < 200 || _0x43d6ad.statusCode >= 300) {
          _0x4fde3e(new Error(_0x763140 || "HTTP " + _0x43d6ad.statusCode));
          return;
        }
        try {
          _0x2e1f4e(_0x763140 ? JSON.parse(_0x763140) : {});
        } catch (_0x2d5b0c) {
          _0x4fde3e(_0x2d5b0c);
        }
      });
    });
    _0xfe5288.on("timeout", () => {
      _0xfe5288.destroy(new Error("Local service request timed out"));
    });
    _0xfe5288.on("error", _0x4fde3e);
    _0xfe5288.end();
  });
}
function collectListeningPortPids(_0x4fddbc) {
  try {
    if (process.platform === "win32") {
      const _0xea48f1 = execFileSync("netstat", ["-ano", "-p", "tcp"], {
        encoding: "utf8",
        windowsHide: true
      });
      return _0xea48f1.split(/\r?\n/).map(_0x2aa29c => _0x2aa29c.trim()).filter(_0x24e700 => _0x24e700.includes("LISTENING")).map(_0x373d46 => _0x373d46.split(/\s+/)).filter(_0x5cef96 => _0x5cef96.length >= 5 && _0x5cef96[1]?.endsWith(":" + _0x4fddbc)).map(_0x371493 => Number.parseInt(_0x371493[4], 10)).filter(_0x2ee635 => Number.isInteger(_0x2ee635) && _0x2ee635 > 0 && _0x2ee635 !== process.pid);
    }
    const _0x580405 = execFileSync("lsof", ["-nP", "-iTCP:" + _0x4fddbc, "-sTCP:LISTEN", "-t"], {
      encoding: "utf8",
      windowsHide: true
    });
    return _0x580405.split(/\r?\n/).map(_0x2d5470 => Number.parseInt(_0x2d5470.trim(), 10)).filter(_0x2c1990 => Number.isInteger(_0x2c1990) && _0x2c1990 > 0 && _0x2c1990 !== process.pid);
  } catch (_0xe39e3e) {
    if (process.platform !== "win32" && Number(_0xe39e3e?.status) === 1) {
      return [];
    }
    const _0x3eaab3 = new Error("Failed to inspect listeners on port " + _0x4fddbc);
    _0x3eaab3.code = "AIC_STARTUP_PORT_ENUMERATION_FAILED";
    _0x3eaab3.cause = _0xe39e3e;
    throw _0x3eaab3;
  }
}
async function clearPortBeforeStart(_0x40e869 = null) {
  const _0x507193 = resolveBackendLaunch();
  return reclaimStartupPort({
    port: PORT,
    env: process.env,
    collectListeningPortPids: collectListeningPortPids,
    confirmRuntimeIdentity: async ({
      pids: _0x22208f
    }) => {
      if (!(await probeServer())) {
        return [];
      }
      return findVerifiedBackendProcessPids({
        pids: _0x22208f,
        appIsPackaged: app.isPackaged,
        appRoot: APP_ROOT,
        backendCommand: _0x507193.command,
        host: HOST,
        port: PORT,
        platform: process.platform
      });
    },
    terminateProcess: _0x56db64 => {
      if (process.platform === "win32") {
        execFileSync("taskkill", ["/PID", String(_0x56db64), "/F", "/T"], {
          stdio: "ignore",
          windowsHide: true
        });
      } else {
        process.kill(_0x56db64, "SIGTERM");
      }
    },
    delayFn: delay,
    onReclaim: () => _0x40e869?.({
      kind: "loading",
      title: APP_DISPLAY_NAME + " 正在启动",
      detail: "正在恢复上次未关闭的运行环境。",
      hint: "启动完成后会自动进入画布。"
    })
  });
}
function resolvePythonCommand() {
  if (app.isPackaged) {
    const _0x47e1c8 = process.platform === "win32" ? [a249_0x815eab.join(RUNTIME_ROOT, "python", "python.exe"), a249_0x815eab.join(RUNTIME_ROOT, "python", "Scripts", "python.exe")] : [a249_0x815eab.join(RUNTIME_ROOT, "python", "bin", "python3"), a249_0x815eab.join(RUNTIME_ROOT, "python", "bin", "python")];
    return _0x47e1c8.find(_0x3a0802 => existsSync(_0x3a0802)) || _0x47e1c8[0];
  }
  const _0x7b17f3 = process.platform === "win32" ? [a249_0x815eab.join(APP_ROOT, "venv", "python.exe"), a249_0x815eab.join(APP_ROOT, "venv", "Scripts", "python.exe"), "python"] : [a249_0x815eab.join(APP_ROOT, "venv", "bin", "python3"), a249_0x815eab.join(APP_ROOT, "venv", "bin", "python"), "python3", "python"];
  return _0x7b17f3.find(_0x44035a => {
    if (a249_0x815eab.isAbsolute(_0x44035a)) {
      return existsSync(_0x44035a);
    } else {
      return true;
    }
  });
}
function resolveBackendLaunch() {
  return resolveBackendLaunchSpec({
    appIsPackaged: app.isPackaged,
    appRoot: APP_ROOT,
    runtimeRoot: RUNTIME_ROOT,
    platform: process.platform,
    existsSync: existsSync,
    pythonCommand: resolvePythonCommand()
  });
}
function resolveRuntimeTool(_0x5602fc) {
  return resolveRuntimeToolPath({
    name: _0x5602fc,
    runtimeRoot: RUNTIME_ROOT,
    platform: process.platform,
    existsSync: existsSync
  });
}
function buildPackagedServerEnv() {
  const _0x276899 = app.getPath("userData");
  const _0x2869c1 = getStorageRoot();
  return {
    AIC_USER_DIR: a249_0x815eab.join(_0x276899, "user"),
    AIC_CANVAS_DIR: a249_0x815eab.join(_0x2869c1, "projects"),
    AIC_DATA_DIR: a249_0x815eab.join(_0x2869c1, "data"),
    AIC_OUTPUT_DIR: a249_0x815eab.join(_0x2869c1, "output"),
    AIC_UPLOADS_DIR: a249_0x815eab.join(_0x2869c1, "data", "uploads"),
    AIC_ASSETS_DIR: a249_0x815eab.join(_0x2869c1, "data", "assets"),
    AIC_WORKFLOWS_DIR: a249_0x815eab.join(_0x2869c1, "data", "workflows"),
    ...buildLegacyFileSavePathEnv(LEGACY_PACKAGED_FILES_ROOTS),
    ...buildRuntimeToolEnv({
      runtimeRoot: RUNTIME_ROOT,
      platform: process.platform,
      existsSync: existsSync
    }),
    ...buildRuntimePythonCertificateEnv({
      runtimeRoot: RUNTIME_ROOT,
      existsSync: existsSync,
      readdirSync: readdirSync,
      env: process.env
    })
  };
}
function getStorageRoot() {
  return PACKAGED_FILES_ROOT;
}
function getUserRoot() {
  return a249_0x815eab.join(app.getPath("userData"), "user");
}
const {
  getStableDeviceId
} = createDeviceIdentityManager({
  app: app,
  appRoot: APP_ROOT,
  getUserRoot: getUserRoot,
  logEvent: logDiagnosticEvent
});
const webPreviewViewManager = createWebPreviewViewManager({
  WebContentsView: WebContentsView,
  BrowserWindow: BrowserWindow,
  getMainWindow: () => mainWindow,
  openExternalUrl: openExternalUrl,
  createContextMenu: _0x315a03 => Menu.buildFromTemplate(_0x315a03),
  logDiagnosticEvent: logDiagnosticEvent
});
const importRemoteAssetToLibrary = createRemoteAssetImporter({
  importAssetToLibrary: importAssetToLibrary,
  getWebPreviewEntry: (_0x531215, _0x43ac92) => webPreviewViewManager._getEntry(_0x531215, _0x43ac92),
  tempRoot: app.getPath("temp")
});
const projectPackageController = createProjectPackageController({
  app: app,
  dialog: dialog,
  getMainWindow: () => getDialogParentWindow(),
  getCanvasProjectDir: getCanvasProjectDir,
  getOutputDir: getOutputDir,
  getUploadsDir: getUploadsDir,
  getAssetsDir: getAssetsDir,
  getWorkflowsDir: getWorkflowsDir,
  readAppVersion: () => readAppVersionFromIndexHtml() || app.getVersion(),
  upsertRecentProject: upsertRecentProject,
  getRecentProjectsStorePath: getRecentProjectsStorePath,
  syncSystemRecentDocumentsBestEffort: syncSystemRecentDocumentsBestEffort,
  buildProjectOpenResponse: buildProjectOpenResponse,
  showSaveDialog: showSaveDialog,
  showOpenDialog: showOpenDialog
});
const nodeExportController = createNodeExportController({
  app: app,
  dialog: dialog,
  getMainWindow: () => getDialogParentWindow(),
  resolveLocalVirtualPath: resolveLocalVirtualPath,
  showSaveDialog: showSaveDialog,
  showOpenDialog: showOpenDialog
});
const systemNotificationSoundFiles = createSystemNotificationSoundFileService({
  appRoot: APP_ROOT,
  openPath: _0x201573 => shell.openPath(_0x201573),
  spawnProcess: spawn,
  platform: process.platform,
  logEvent: logDiagnosticEvent
});
const backgroundCompletionNotifier = createBackgroundCompletionNotifier({
  Notification: Notification,
  getMainWindow: () => mainWindow,
  focusMainWindow: focusMainWindow,
  onClick: _0x479bc7 => mainWindow && !mainWindow.isDestroyed?.() && mainWindow.webContents?.send?.("notification:generationCompleteClicked", _0x479bc7),
  logEvent: logDiagnosticEvent,
  resolveNotificationIconPath: resolveLocalVirtualPath,
  appName: APP_DISPLAY_NAME
});
const mainCapabilityContext = {
  app: app,
  readAppVersionFromIndexHtml: readAppVersionFromIndexHtml,
  getStableDeviceId: getStableDeviceId,
  getUpdaterController: getUpdaterController,
  getBackgroundCompletionNotifier: () => backgroundCompletionNotifier,
  getSecureSettingsStore: getSecureSettingsStore,
  normalizeSecureSettingsKeys: normalizeSecureSettingsKeys,
  fileReferencesFormat: CLIPBOARD_FILE_REFERENCES_FORMAT,
  createClipboardNativeImage: createClipboardNativeImage,
  screenshotOverlayController: screenshotOverlayController,
  normalizeClipboardFileReferences: normalizeClipboardFileReferences,
  parseClipboardFileReferencesFromText: parseClipboardFileReferencesFromText,
  ...projectPackageController,
  ...nodeExportController,
  handleRendererUnsavedState: handleRendererUnsavedState,
  getRecentProjectsStorePath: getRecentProjectsStorePath,
  syncSystemRecentDocumentsBestEffort: syncSystemRecentDocumentsBestEffort,
  pendingExternalProjectOpenRequests: pendingExternalProjectOpenRequests,
  getCanvasProjectDir: getCanvasProjectDir,
  showOpenDialog: showOpenDialog,
  showSaveDialog: showSaveDialog,
  supportedProjectFileExtensions: SUPPORTED_PROJECT_FILE_EXTENSIONS,
  getRecoverySnapshotPath: getRecoverySnapshotPath,
  writeRecoverySnapshotFile: a249_0x228266,
  getRecoverySnapshotFileInfo: a249_0x10dd75,
  readRecoverySnapshotFile: a249_0x1245aa,
  removeRecoverySnapshotFile: a249_0x2bdf10,
  importAssetToLibrary: importAssetToLibrary,
  importRemoteAssetToLibrary: importRemoteAssetToLibrary,
  createLocalPreviewUrl: createLocalPreviewUrl,
  resolveLocalVirtualPath: resolveLocalVirtualPath,
  resolveKnownFolder: resolveKnownFolder,
  openExternalUrl: openExternalUrl,
  getWebPreviewViewManager: () => shouldUseChromeShellRuntime(process.env, {
    appIsPackaged: app.isPackaged
  }) ? chromeShellWebPreviewManager : webPreviewViewManager,
  selectDirectory: selectDirectory,
  listNotificationSoundMp3Files: listNotificationSoundMp3Files,
  getDataDir: getDataDir,
  ...systemNotificationSoundFiles,
  getMediaTaskQueue: getMediaTaskQueue,
  getLocalAssetCleanupManager: getLocalAssetCleanupManager,
  consumeAssetUpdateEvents: consumeAssetUpdateEvents,
  readLegacyRendererStorageMigration: () => legacyRendererStorageMigration.read(),
  completeLegacyRendererStorageMigration: _0x333d94 => legacyRendererStorageMigration.complete(_0x333d94),
  diagnostics: diagnostics,
  logDir: LOG_DIR,
  logDiagnosticEvent: logDiagnosticEvent
};
const mainCapabilityHandlers = buildMainIpcHandlerDeps(mainCapabilityContext);
const installIpcHandlers = createMainIpcHandlerInstaller({
  registerIpcHandlers: registerIpcHandlers,
  context: mainCapabilityContext
});
function readConfiguredUserSettingsSync() {
  const _0x57d5e9 = process.env.LOCALAPPDATA || app.getPath("userData");
  return readUserSettingsFromFilesSync([a249_0x815eab.join(getUserRoot(), "settings.json"), a249_0x815eab.join(APP_ROOT, "user", "settings.json"), a249_0x815eab.join(_0x57d5e9, "AI-CanvasPro", "settings.json")]);
}
function readConfiguredFileSavePathsSync() {
  const _0x5b398e = readConfiguredUserSettingsSync()?.fileSavePaths;
  if (_0x5b398e && typeof _0x5b398e === "object") {
    return _0x5b398e;
  } else {
    return {};
  }
}
function getConfiguredPath(_0x31a0d7, _0x262868) {
  const _0x2f668a = String(readConfiguredFileSavePathsSync()?.[_0x31a0d7] || "").trim();
  if (_0x2f668a) {
    return a249_0x815eab.resolve(_0x2f668a);
  } else {
    return _0x262868;
  }
}
function getDataDir() {
  const _0x15aac9 = readConfiguredFileSavePathsSync();
  const _0x106489 = String(_0x15aac9?.dataDir || "").trim();
  if (_0x106489) {
    return a249_0x815eab.resolve(_0x106489);
  }
  const _0x52570e = String(_0x15aac9?.tempDir || "").trim();
  if (_0x52570e) {
    const _0x41fa62 = a249_0x815eab.resolve(_0x52570e);
    if (a249_0x815eab.basename(_0x41fa62).toLowerCase() === "uploads") {
      return a249_0x815eab.dirname(_0x41fa62);
    } else {
      return _0x41fa62;
    }
  }
  return a249_0x815eab.join(getStorageRoot(), "data");
}
function getCanvasProjectDir() {
  return getConfiguredPath("canvasDir", a249_0x815eab.join(getStorageRoot(), "projects"));
}
function getRecentProjectsStorePath() {
  return a249_0x815eab.join(app.getPath("userData"), "recent-projects.json");
}
function getSecureSettingsStorePath() {
  return a249_0x815eab.join(app.getPath("userData"), "secure-settings.json");
}
function getRecoverySnapshotPath() {
  return a249_0x815eab.join(app.getPath("userData"), RECOVERY_SNAPSHOT_FILENAME);
}
function getUploadsDir() {
  const _0x57d790 = readConfiguredFileSavePathsSync();
  if (!String(_0x57d790?.dataDir || "").trim() && String(_0x57d790?.tempDir || "").trim()) {
    return a249_0x815eab.resolve(_0x57d790.tempDir);
  }
  return a249_0x815eab.join(getDataDir(), "uploads");
}
function getOutputDir() {
  return getConfiguredPath("outputDir", a249_0x815eab.join(getStorageRoot(), "output"));
}
function getAssetsDir() {
  return a249_0x815eab.join(getDataDir(), "assets");
}
function getWorkflowsDir() {
  return a249_0x815eab.join(getDataDir(), "workflows");
}
function getFunasrModelRootDir() {
  return resolveFunasrModelRootDir(readConfiguredUserSettingsSync(), {
    fallbackDataDir: getDataDir()
  });
}
function getAssetOriginalDir() {
  return a249_0x815eab.join(getAssetsDir(), "original");
}
function getAssetIndexPath() {
  return a249_0x815eab.join(getAssetsDir(), "assets.index.json");
}
function sanitizeUploadFilename(_0x13e947) {
  const _0x508397 = a249_0x815eab.basename(String(_0x13e947 || "upload"));
  return _0x508397.replace(/[\\/:*?"<>|]/g, "_").trim() || "upload";
}
function getSafeOriginalExtension(_0x51449f, _0x20304a = "") {
  const _0x35193b = a249_0x815eab.extname(sanitizeUploadFilename(_0x51449f)).toLowerCase();
  if (_0x35193b && _0x35193b.length <= 12) {
    return _0x35193b;
  }
  const _0x4bb3df = String(_0x20304a || "").split(";")[0].trim().toLowerCase();
  const _0x34250a = {
    "image/png": ".png",
    "image/jpeg": ".jpg",
    "image/webp": ".webp",
    "image/gif": ".gif",
    "image/bmp": ".bmp",
    "image/avif": ".avif",
    "video/mp4": ".mp4",
    "video/webm": ".webm",
    "video/quicktime": ".mov",
    "audio/mpeg": ".mp3",
    "audio/mp3": ".mp3",
    "audio/wav": ".wav",
    "audio/x-wav": ".wav",
    "audio/mp4": ".m4a",
    "audio/x-m4a": ".m4a",
    "audio/aac": ".aac",
    "audio/ogg": ".ogg",
    "audio/flac": ".flac",
    "audio/webm": ".webm"
  };
  return _0x34250a[_0x4bb3df] || ".bin";
}
function classifyAssetKind(_0xac4d71 = "", _0xd36c10 = "") {
  const _0x5baa3e = String(_0xd36c10 || "").split(";")[0].trim().toLowerCase();
  if (_0x5baa3e.startsWith("image/")) {
    return "image";
  }
  if (_0x5baa3e.startsWith("video/")) {
    return "video";
  }
  if (_0x5baa3e.startsWith("audio/")) {
    return "audio";
  }
  const _0xf59099 = a249_0x815eab.extname(String(_0xac4d71 || "")).toLowerCase();
  if (/\.(?:png|jpe?g|webp|gif|bmp|avif|svg)$/i.test(_0xf59099)) {
    return "image";
  }
  if (/\.(?:mp4|webm|mov|m4v|avi|mkv)$/i.test(_0xf59099)) {
    return "video";
  }
  if (/\.(?:mp3|wav|m4a|aac|ogg|flac|opus|webm)$/i.test(_0xf59099)) {
    return "audio";
  }
  return "file";
}
function hashBuffer(_0x1f27b8) {
  return createHash("sha256").update(_0x1f27b8).digest("hex");
}
function readAssetIndex() {
  return readAssetIndexFile(getAssetIndexPath());
}
function writeAssetIndex(_0x5339a0) {
  writeAssetIndexFile(getAssetIndexPath(), _0x5339a0);
}
const assetIndexCoordinator = createAssetIndexCoordinator({
  readIndex: readAssetIndex,
  writeIndex: writeAssetIndex,
  now: () => new Date().toISOString()
});
function toAssetLocalPath(..._0x12ee99) {
  return ["data", "assets", ..._0x12ee99].filter(Boolean).join("/").replace(/\\/g, "/");
}
function buildAssetResponse(_0x258966, {
  reused = false,
  derivativeStatus = ""
} = {}) {
  const _0x361d8c = _0x258966.kind === "image" || _0x258966.kind === "video" ? _0x258966.displayLocalPath || _0x258966.originalLocalPath : _0x258966.originalLocalPath;
  return {
    success: true,
    assetId: _0x258966.assetId,
    assetRevision: Math.max(0, Math.trunc(Number(_0x258966.assetRevision || 0)) || 0),
    assetUpdatedAt: _0x258966.updatedAt || "",
    reused: !!reused,
    kind: _0x258966.kind,
    url: _0x361d8c ? "/" + _0x361d8c : "",
    localPath: _0x258966.originalLocalPath || "",
    originalLocalPath: _0x258966.originalLocalPath || "",
    displayLocalPath: _0x258966.displayLocalPath || "",
    thumbLocalPath: _0x258966.thumbLocalPath || _0x258966.posterLocalPath || "",
    posterLocalPath: _0x258966.posterLocalPath || "",
    waveformLocalPath: _0x258966.waveformLocalPath || "",
    filename: _0x258966.originalName || _0x258966.filename || "",
    storedFilename: a249_0x815eab.basename(_0x258966.originalLocalPath || ""),
    size: Number(_0x258966.size || 0),
    type: _0x258966.mimeType || "",
    derivativeStatus: derivativeStatus || _0x258966.status || "",
    status: _0x258966.status || "",
    mediaTaskId: _0x258966.mediaTaskId || "",
    mediaTaskKind: _0x258966.mediaTaskKind || "",
    mediaTaskStatus: _0x258966.mediaTaskStatus || "",
    mediaTaskProgress: Number(_0x258966.mediaTaskProgress || 0) || 0,
    mediaTaskError: _0x258966.mediaTaskError || "",
    videoProxyStatus: _0x258966.videoProxyStatus || "",
    videoProxyVersion: _0x258966.videoProxyVersion || "",
    videoCodec: _0x258966.videoCodec || "",
    videoWidth: Number(_0x258966.videoWidth || _0x258966.width || 0) || 0,
    videoHeight: Number(_0x258966.videoHeight || _0x258966.height || 0) || 0,
    videoDuration: Number(_0x258966.videoDuration || 0) || 0,
    videoFps: Number(_0x258966.videoFps || 0) || 0,
    width: Number(_0x258966.width || _0x258966.videoWidth || 0) || 0,
    height: Number(_0x258966.height || _0x258966.videoHeight || 0) || 0,
    originalUrl: _0x258966.originalLocalPath ? "/" + _0x258966.originalLocalPath : "",
    displayUrl: _0x258966.displayLocalPath ? "/" + _0x258966.displayLocalPath : "",
    thumbUrl: _0x258966.thumbLocalPath ? "/" + _0x258966.thumbLocalPath : _0x258966.posterLocalPath ? "/" + _0x258966.posterLocalPath : "",
    posterUrl: _0x258966.posterLocalPath ? "/" + _0x258966.posterLocalPath : "",
    waveformUrl: _0x258966.waveformLocalPath ? "/" + _0x258966.waveformLocalPath : ""
  };
}
function isPreviewableLocalMedia(_0x667c1a = {}, _0x26a44e = "") {
  const _0x2ef7e5 = String(_0x667c1a?.type || "").toLowerCase();
  if (_0x2ef7e5.startsWith("image/") || _0x2ef7e5.startsWith("video/") || _0x2ef7e5.startsWith("audio/")) {
    return true;
  }
  return /\.(?:png|jpe?g|webp|gif|bmp|avif|mp4|webm|mov|m4v|mp3|wav|m4a|aac|ogg|flac)$/i.test(String(_0x26a44e || ""));
}
function getMimeTypeForPreview(_0x394d16, _0x473d1e = "") {
  const _0x15bb76 = String(_0x473d1e || "").toLowerCase();
  if (_0x15bb76.startsWith("image/") || _0x15bb76.startsWith("video/") || _0x15bb76.startsWith("audio/")) {
    return _0x15bb76;
  }
  const _0x21e49b = a249_0x815eab.extname(String(_0x394d16 || "")).toLowerCase();
  const _0x13cb9a = {
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".webp": "image/webp",
    ".gif": "image/gif",
    ".bmp": "image/bmp",
    ".avif": "image/avif",
    ".mp4": "video/mp4",
    ".m4v": "video/mp4",
    ".webm": "video/webm",
    ".mov": "video/quicktime",
    ".mp3": "audio/mpeg",
    ".wav": "audio/wav",
    ".m4a": "audio/mp4",
    ".aac": "audio/aac",
    ".ogg": "audio/ogg",
    ".flac": "audio/flac"
  };
  return _0x13cb9a[_0x21e49b] || "application/octet-stream";
}
function resolveLocalPreviewSourcePath(_0x9722ee = {}) {
  const _0x26a502 = String(_0x9722ee?.path || "").trim();
  return _0x26a502 || resolveLocalVirtualPath(_0x9722ee?.localPath || _0x9722ee?.url || _0x9722ee?.src || "");
}
function cleanupLocalPreviewEntries() {
  const _0x128649 = Date.now();
  for (const [_0x3f2d56, _0x1b2caa] of localPreviewEntries.entries()) {
    if (!_0x1b2caa || Number(_0x1b2caa.expiresAt || 0) <= _0x128649) {
      localPreviewEntries.delete(_0x3f2d56);
    }
  }
}
function parseRangeHeader(_0x4d6d98, _0x28ef40) {
  const _0x263b66 = String(_0x4d6d98 || "").match(/^bytes=(\d*)-(\d*)$/);
  if (!_0x263b66) {
    return null;
  }
  const _0x5e8a56 = _0x263b66[1];
  const _0x539adf = _0x263b66[2];
  let _0x14d98d = _0x5e8a56 ? Number.parseInt(_0x5e8a56, 10) : 0;
  let _0x15718b = _0x539adf ? Number.parseInt(_0x539adf, 10) : _0x28ef40 - 1;
  if (!_0x5e8a56 && _0x539adf) {
    const _0x40fec4 = Number.parseInt(_0x539adf, 10);
    _0x14d98d = Math.max(0, _0x28ef40 - _0x40fec4);
    _0x15718b = _0x28ef40 - 1;
  }
  if (!Number.isInteger(_0x14d98d) || !Number.isInteger(_0x15718b)) {
    return null;
  }
  if (_0x14d98d < 0 || _0x15718b < _0x14d98d || _0x14d98d >= _0x28ef40) {
    return null;
  }
  return {
    start: _0x14d98d,
    end: Math.min(_0x15718b, _0x28ef40 - 1)
  };
}
function createLocalPreviewUrl(_0xf75b9e = {}) {
  const _0x379f96 = resolveLocalPreviewSourcePath(_0xf75b9e);
  if (!_0x379f96) {
    throw new Error("缺少文件路径");
  }
  if (!a249_0x815eab.isAbsolute(_0x379f96)) {
    throw new Error("文件路径必须是绝对路径");
  }
  const _0x1bc2fa = realpathSync(_0x379f96);
  const _0x41426c = statSync(_0x1bc2fa);
  if (!_0x41426c.isFile()) {
    throw new Error("只支持预览文件");
  }
  if (!isPreviewableLocalMedia(_0xf75b9e, _0x1bc2fa)) {
    throw new Error("只支持图片或视频快速预览");
  }
  cleanupLocalPreviewEntries();
  const _0x2ee9a2 = randomBytes(24).toString("hex");
  const _0x2e75b2 = getMimeTypeForPreview(_0x1bc2fa, _0xf75b9e?.type || "");
  localPreviewEntries.set(_0x2ee9a2, {
    path: _0x1bc2fa,
    mimeType: _0x2e75b2,
    size: _0x41426c.size,
    expiresAt: Date.now() + LOCAL_PREVIEW_TTL_MS
  });
  const _0x3a9858 = encodeURIComponent(a249_0x815eab.basename(_0x1bc2fa));
  return LOCAL_PREVIEW_SCHEME + "://preview/" + _0x2ee9a2 + "/" + _0x3a9858;
}
function installLocalPreviewProtocol() {
  if (localPreviewProtocolInstalled) {
    return;
  }
  localPreviewProtocolInstalled = true;
  protocol.handle(LOCAL_PREVIEW_SCHEME, _0xa4da55 => {
    try {
      cleanupLocalPreviewEntries();
      const _0x117a35 = new URL(_0xa4da55.url);
      const _0x19974c = decodeURIComponent(_0x117a35.pathname.split("/").filter(Boolean)[0] || "");
      const _0x395df8 = localPreviewEntries.get(_0x19974c);
      if (!_0x395df8) {
        return new Response("Preview not found", {
          status: 404
        });
      }
      const _0x3a07d3 = statSync(_0x395df8.path);
      if (!_0x3a07d3.isFile()) {
        localPreviewEntries.delete(_0x19974c);
        return new Response("Preview not found", {
          status: 404
        });
      }
      const _0x23613f = _0x3a07d3.size;
      const _0x306fcd = parseRangeHeader(_0xa4da55.headers.get("range"), _0x23613f);
      const _0x1ead68 = {
        "Content-Type": _0x395df8.mimeType,
        "Accept-Ranges": "bytes",
        "Cache-Control": "private, max-age=" + Math.floor(LOCAL_PREVIEW_TTL_MS / 1000) + ", immutable"
      };
      if (_0x306fcd) {
        _0x1ead68["Content-Range"] = "bytes " + _0x306fcd.start + "-" + _0x306fcd.end + "/" + _0x23613f;
        _0x1ead68["Content-Length"] = String(_0x306fcd.end - _0x306fcd.start + 1);
        return new Response(Readable.toWeb(createReadStream(_0x395df8.path, {
          start: _0x306fcd.start,
          end: _0x306fcd.end
        })), {
          status: 206,
          headers: _0x1ead68
        });
      }
      _0x1ead68["Content-Length"] = String(_0x23613f);
      return new Response(Readable.toWeb(createReadStream(_0x395df8.path)), {
        status: 200,
        headers: _0x1ead68
      });
    } catch (_0x8950a6) {
      console.warn("[electron] local preview failed:", _0x8950a6);
      return new Response("Preview failed", {
        status: 500
      });
    }
  });
}
function resizeImageToMaxEdge(_0x15740e, _0x51deaa) {
  const _0x478c42 = _0x15740e.getSize();
  const _0x4384aa = Number(_0x478c42.width) || 0;
  const _0x47efba = Number(_0x478c42.height) || 0;
  if (_0x4384aa <= 0 || _0x47efba <= 0) {
    return null;
  }
  const _0xf2e8d8 = Math.max(_0x4384aa, _0x47efba);
  if (_0xf2e8d8 <= _0x51deaa) {
    return _0x15740e;
  }
  const _0x1df966 = _0x51deaa / _0xf2e8d8;
  return _0x15740e.resize({
    width: Math.max(1, Math.round(_0x4384aa * _0x1df966)),
    height: Math.max(1, Math.round(_0x47efba * _0x1df966)),
    quality: "best"
  });
}
function writeAssetImageDerivatives(_0x161e3c, _0x3512cb) {
  const _0x137735 = nativeImage.createFromPath(_0x3512cb);
  const _0x48d360 = _0x137735.getSize();
  const _0x38f10a = Number(_0x48d360.width) || 0;
  const _0x3db332 = Number(_0x48d360.height) || 0;
  if (_0x137735.isEmpty() || _0x38f10a <= 0 || _0x3db332 <= 0) {
    return {};
  }
  const _0x3b6f89 = a249_0x815eab.join(getAssetsDir(), "derived", "image");
  mkdirSync(_0x3b6f89, {
    recursive: true
  });
  const _0x47ae78 = a249_0x815eab.join(_0x3b6f89, _0x161e3c + ".display.png");
  const _0x283da8 = a249_0x815eab.join(_0x3b6f89, _0x161e3c + ".thumb.png");
  const _0x37e67b = resizeImageToMaxEdge(_0x137735, 1280);
  const _0xb8d54d = resizeImageToMaxEdge(_0x137735, 320);
  if (!_0x37e67b || !_0xb8d54d) {
    return {};
  }
  if (!existsSync(_0x47ae78)) {
    writeFileSync(_0x47ae78, _0x37e67b.toPNG());
  }
  if (!existsSync(_0x283da8)) {
    writeFileSync(_0x283da8, _0xb8d54d.toPNG());
  }
  return {
    displayLocalPath: toAssetLocalPath("derived", "image", _0x161e3c + ".display.png"),
    thumbLocalPath: toAssetLocalPath("derived", "image", _0x161e3c + ".thumb.png"),
    originalWidth: _0x38f10a,
    originalHeight: _0x3db332
  };
}
function bufferFromImportPayload(_0x905bbb = {}) {
  const _0x11ff5f = _0x905bbb?.bytes;
  if (!_0x11ff5f) {
    return null;
  }
  if (Buffer.isBuffer(_0x11ff5f)) {
    return _0x11ff5f;
  }
  if (_0x11ff5f instanceof ArrayBuffer) {
    return Buffer.from(_0x11ff5f);
  }
  if (ArrayBuffer.isView(_0x11ff5f)) {
    return Buffer.from(_0x11ff5f.buffer, _0x11ff5f.byteOffset, _0x11ff5f.byteLength);
  }
  if (Array.isArray(_0x11ff5f)) {
    return Buffer.from(_0x11ff5f);
  }
  return null;
}
async function readFfprobeJsonCapture(_0x53c767, _0x43365b = "FFprobe failed") {
  const _0x49f552 = await runToolCapture(getRuntimeToolOrFallback("ffprobe"), _0x53c767, {
    cwd: APP_ROOT,
    timeoutMs: ASSET_IMPORT_FFPROBE_TIMEOUT_MS
  });
  const _0x4f4df4 = _0x49f552.toString("utf8").trim();
  if (!_0x4f4df4) {
    throw new Error(_0x43365b);
  }
  try {
    return JSON.parse(_0x4f4df4);
  } catch {
    throw new Error(_0x43365b);
  }
}
function getRuntimeToolOrFallback(_0x1fe261) {
  return resolveRuntimeTool(_0x1fe261) || _0x1fe261;
}
function createOutputFilename(_0x1f67c2, _0x8f0d25) {
  const _0x5c79d4 = String(_0x1f67c2 || "media").replace(/[^a-z0-9_-]/gi, "_") || "media";
  const _0x503db8 = String(_0x8f0d25 || "bin").replace(/^\.+/, "").replace(/[^a-z0-9]/gi, "") || "bin";
  return _0x5c79d4 + "_" + Date.now() + "_" + randomBytes(3).toString("hex") + "." + _0x503db8;
}
function toOutputLocalPath(..._0x170eb8) {
  return ["output", ..._0x170eb8].filter(Boolean).join("/").replace(/\\/g, "/");
}
async function hashFileSha256(_0x3393cf) {
  return await new Promise((_0x225ed7, _0x17ef4d) => {
    const _0x18a36a = createHash("sha256");
    const _0x567c8c = createReadStream(_0x3393cf);
    _0x567c8c.on("data", _0x5adc0e => _0x18a36a.update(_0x5adc0e));
    _0x567c8c.once("error", _0x17ef4d);
    _0x567c8c.once("end", () => _0x225ed7(_0x18a36a.digest("hex")));
  });
}
function resolveMediaTaskSource(_0x399ead) {
  const _0x15b10e = resolveLocalVirtualPath(_0x399ead);
  if (!_0x15b10e) {
    throw new Error("Invalid media source path");
  }
  return _0x15b10e;
}
async function readFfprobeJson(_0x46187c, _0x286bcb, _0x4caa23, _0x4d8af8 = "FFprobe failed") {
  const _0x426b34 = await _0x46187c.runProcess(_0x286bcb, getRuntimeToolOrFallback("ffprobe"), _0x4caa23, {
    timeoutMs: ASSET_IMPORT_FFPROBE_TIMEOUT_MS
  });
  const _0x2b5cad = _0x426b34.stdout.toString("utf8").trim();
  if (!_0x2b5cad) {
    throw new Error(_0x4d8af8);
  }
  try {
    return JSON.parse(_0x2b5cad);
  } catch {
    throw new Error(_0x4d8af8);
  }
}
function parseFfprobeRatio(_0x360337) {
  const _0x22571a = String(_0x360337 || "").trim();
  if (!_0x22571a) {
    return 0;
  }
  if (!_0x22571a.includes("/")) {
    return Number(_0x22571a) || 0;
  }
  const [_0x552506, _0x139806] = _0x22571a.split("/");
  const _0x10dec8 = Number(_0x139806);
  if (!_0x10dec8) {
    return 0;
  }
  return (Number(_0x552506) || 0) / _0x10dec8;
}
async function ffprobeVideoMeta(_0x1351c1, _0x277d13, _0xc01dba) {
  const _0x4ccea2 = await readFfprobeJson(_0x1351c1, _0x277d13, ["-v", "error", "-select_streams", "v:0", "-show_entries", "format=duration:stream=avg_frame_rate,r_frame_rate,nb_frames,duration,width,height", "-of", "json", _0xc01dba]);
  const _0x45dd5a = Array.isArray(_0x4ccea2.streams) && _0x4ccea2.streams[0] ? _0x4ccea2.streams[0] : {};
  const _0x52cf6c = _0x4ccea2.format || {};
  const _0x4b6a53 = Number(_0x52cf6c.duration || 0) || Number(_0x45dd5a.duration || 0) || 0;
  const _0x1bc7db = parseFfprobeRatio(_0x45dd5a.avg_frame_rate) || parseFfprobeRatio(_0x45dd5a.r_frame_rate) || 0;
  const _0x24306c = Math.trunc(Number(_0x45dd5a.width || 0)) || 0;
  const _0x1b4e96 = Math.trunc(Number(_0x45dd5a.height || 0)) || 0;
  return {
    duration: _0x4b6a53,
    fps: _0x1bc7db,
    width: _0x24306c,
    height: _0x1b4e96
  };
}
async function ffprobeHasAudio(_0x4aa7a6, _0x27e78b, _0x1f2889) {
  try {
    const _0xe3b45 = await _0x4aa7a6.runProcess(_0x27e78b, getRuntimeToolOrFallback("ffprobe"), ["-v", "error", "-select_streams", "a:0", "-show_entries", "stream=codec_type", "-of", "default=nw=1:nk=1", _0x1f2889], {
      timeoutMs: ASSET_IMPORT_FFPROBE_TIMEOUT_MS
    });
    return _0xe3b45.stdout.toString("utf8").toLowerCase().includes("audio");
  } catch {
    return false;
  }
}
async function ffprobeVideoPlaybackInfo(_0x5ccbc1, _0x33902b, _0x69ced9) {
  const _0x10b5c7 = await readFfprobeJson(_0x5ccbc1, _0x33902b, ["-v", "error", "-select_streams", "v:0", "-show_entries", "format=duration,format_name:stream=codec_name,codec_tag_string,pix_fmt,profile,width,height", "-of", "json", _0x69ced9]);
  const _0x4a2c05 = Array.isArray(_0x10b5c7.streams) && _0x10b5c7.streams[0] ? _0x10b5c7.streams[0] : {};
  const _0x575c6f = _0x10b5c7.format || {};
  return {
    codecName: String(_0x4a2c05.codec_name || "").trim().toLowerCase(),
    codecTag: String(_0x4a2c05.codec_tag_string || "").trim().toLowerCase(),
    pixelFormat: String(_0x4a2c05.pix_fmt || "").trim().toLowerCase(),
    profile: String(_0x4a2c05.profile || "").trim(),
    formatName: String(_0x575c6f.format_name || "").trim().toLowerCase(),
    duration: Number(_0x575c6f.duration || 0) || 0,
    width: Math.trunc(Number(_0x4a2c05.width || 0)) || 0,
    height: Math.trunc(Number(_0x4a2c05.height || 0)) || 0
  };
}
async function ffprobeVideoPlaybackInfoForImport(_0x4bd7c0) {
  const _0x5de99f = await readFfprobeJsonCapture(["-v", "error", "-select_streams", "v:0", "-show_entries", "format=duration,format_name:stream=avg_frame_rate,r_frame_rate,codec_name,codec_tag_string,pix_fmt,profile,width,height", "-of", "json", _0x4bd7c0]);
  const _0x3fa2d5 = Array.isArray(_0x5de99f.streams) && _0x5de99f.streams[0] ? _0x5de99f.streams[0] : {};
  const _0x38c76f = _0x5de99f.format || {};
  return {
    codecName: String(_0x3fa2d5.codec_name || "").trim().toLowerCase(),
    codecTag: String(_0x3fa2d5.codec_tag_string || "").trim().toLowerCase(),
    pixelFormat: String(_0x3fa2d5.pix_fmt || "").trim().toLowerCase(),
    profile: String(_0x3fa2d5.profile || "").trim(),
    formatName: String(_0x38c76f.format_name || "").trim().toLowerCase(),
    duration: Number(_0x38c76f.duration || 0) || 0,
    fps: parseFfprobeRatio(_0x3fa2d5.avg_frame_rate) || parseFfprobeRatio(_0x3fa2d5.r_frame_rate) || 0,
    width: Math.trunc(Number(_0x3fa2d5.width || 0)) || 0,
    height: Math.trunc(Number(_0x3fa2d5.height || 0)) || 0
  };
}
function getVideoProxyPaths(_0xd77e61) {
  const _0x2ab6a9 = a249_0x815eab.join(getAssetsDir(), "derived", "video");
  const _0x5b22f3 = getVideoPlaybackProxyFilename(_0xd77e61);
  return {
    derivedDir: _0x2ab6a9,
    proxyAbs: a249_0x815eab.join(_0x2ab6a9, _0x5b22f3),
    proxyLocalPath: toAssetLocalPath("derived", "video", _0x5b22f3)
  };
}
async function buildAssetVideoPlaybackProxy(_0x1c204a, _0x2a4dca, _0x3d0700, _0x218577) {
  const _0xe89559 = await ffprobeVideoPlaybackInfo(_0x2a4dca, _0x1c204a, _0x3d0700);
  if (!needsBrowserVideoProxy(_0xe89559)) {
    return {
      displayLocalPath: "",
      displayUrl: "",
      videoProxyStatus: "not_required",
      videoProxyVersion: "",
      videoCodec: _0xe89559.codecName
    };
  }
  const {
    derivedDir: _0x3fe100,
    proxyAbs: _0x5852ec,
    proxyLocalPath: _0x2b48c6
  } = getVideoProxyPaths(_0x218577);
  mkdirSync(_0x3fe100, {
    recursive: true
  });
  let _0x495614 = false;
  try {
    _0x495614 = existsSync(_0x5852ec) && statSync(_0x5852ec).size > 0;
  } catch {
    _0x495614 = false;
  }
  if (!_0x495614) {
    const _0x577204 = _0x5852ec + "." + process.pid + "." + Date.now() + ".tmp.mp4";
    try {
      await runFfmpegVideoTask(_0x1c204a, _0x2a4dca, buildVideoPlaybackProxyFfmpegArgs({
        inputPath: _0x3d0700,
        outputPath: _0x577204,
        preset: VIDEO_PROXY_TRANSCODE_PRESET,
        crf: VIDEO_PROXY_TRANSCODE_CRF
      }), {
        durationSec: _0xe89559.duration,
        progressMessage: "Transcoding video",
        timeoutMs: resolveVideoPlaybackProxyTimeoutMs(_0xe89559.duration)
      });
      renameSync(_0x577204, _0x5852ec);
    } catch (_0x3a8625) {
      try {
        if (existsSync(_0x577204)) {
          unlinkSync(_0x577204);
        }
      } catch {}
      throw _0x3a8625;
    }
  }
  return {
    displayLocalPath: _0x2b48c6,
    displayUrl: "/" + _0x2b48c6,
    videoProxyStatus: "generated",
    videoProxyVersion: VIDEO_PLAYBACK_PROXY_VERSION,
    videoCodec: _0xe89559.codecName
  };
}
async function ensureAssetVideoPlaybackProxy(_0xaddffd, _0x3ed847, _0xf37f25, _0x500562) {
  const _0x5cb1c8 = [VIDEO_PLAYBACK_PROXY_VERSION, String(_0x500562 || "").trim(), a249_0x815eab.resolve(_0xf37f25).toLowerCase()].join("|");
  return videoPlaybackProxyWorkDeduper.run(_0x5cb1c8, () => buildAssetVideoPlaybackProxy(_0xaddffd, _0x3ed847, _0xf37f25, _0x500562));
}
function buildMediaTaskStatePatch(_0x2125fe) {
  const _0x5a12d3 = String(_0x2125fe?.status || "");
  const _0x5b906b = {
    mediaTaskId: _0x2125fe?.taskId || "",
    mediaTaskKind: _0x2125fe?.kind || "",
    mediaTaskStatus: _0x5a12d3,
    mediaTaskProgress: Number(_0x2125fe?.progress || 0) || 0,
    mediaTaskError: _0x2125fe?.error || ""
  };
  if (_0x5a12d3 === "waiting" || _0x5a12d3 === "processing") {
    _0x5b906b.isGenerating = true;
    _0x5b906b.jobStatus = "running";
  } else if (_0x5a12d3 === "complete") {
    _0x5b906b.isGenerating = false;
    _0x5b906b.jobStatus = "success";
  } else if (_0x5a12d3 === "failed") {
    _0x5b906b.isGenerating = false;
    _0x5b906b.jobStatus = "error";
    _0x5b906b.jobError = _0x5b906b.mediaTaskError || "Media task failed";
  } else if (_0x5a12d3 === "cancelled") {
    _0x5b906b.isGenerating = false;
    _0x5b906b.jobStatus = null;
  }
  return _0x5b906b;
}
function getMediaTaskDisplayName(_0x2647ba) {
  const _0x51263e = String(_0x2647ba || "").trim();
  const _0x4b8afe = {
    videoPoster: "视频处理",
    audioWaveform: "音频波形",
    videoFirstFrame: "视频封面",
    videoCut: "视频剪辑",
    videoReverse: "视频倒放",
    audioCut: "音频剪辑",
    videoAudioSeparate: "音频分离",
    videoCompose: "视频合成",
    videoAudioMux: "完整视频封装",
    audioCompose: "音频合并",
    audioVoiceCompose: "语音工作室合成",
    mediaClipExport: "剪辑导出"
  };
  return _0x4b8afe[_0x51263e] || "媒体任务";
}
function formatNotificationBody(_0x273810, _0x2d7117) {
  const _0x2ca4d9 = String(_0x273810 || _0x2d7117 || "").replace(/\s+/g, " ").trim();
  if (_0x2ca4d9.length <= 180) {
    return _0x2ca4d9;
  }
  return _0x2ca4d9.slice(0, 177) + "...";
}
function handleMediaTaskActivity(_0x309570 = {}) {
  mediaTaskActivity = {
    activeCount: Number(_0x309570.activeCount || 0) || 0,
    waitingCount: Number(_0x309570.waitingCount || 0) || 0,
    totalCount: Number(_0x309570.totalCount || 0) || 0,
    progress: Number(_0x309570.progress || 0) || 0,
    activeTasks: Array.isArray(_0x309570.activeTasks) ? _0x309570.activeTasks : []
  };
  const _0x328a63 = mediaTaskActivity.activeCount > 0;
  setTaskbarProgressSource("media", _0x328a63 ? Math.max(0.01, mediaTaskActivity.progress) : -1);
  setPowerSaveBlocker("media", _0x328a63);
}
function maybeNotifyLongMediaTask(_0x66fb8a = {}) {
  const _0x318f6e = String(_0x66fb8a.status || "");
  if (_0x318f6e !== "complete" && _0x318f6e !== "failed") {
    return;
  }
  if (String(_0x66fb8a.purpose || "").trim() === PERSON_REPLACEMENT_COMPOSE_TASK_PURPOSE) {
    return;
  }
  const _0x5261a5 = String(_0x66fb8a.taskId || "").trim();
  if (!_0x5261a5 || notifiedMediaTaskIds.has(_0x5261a5)) {
    return;
  }
  const _0x9a9838 = Number(_0x66fb8a.startedAt || 0) || 0;
  const _0x431c9a = Number(_0x66fb8a.finishedAt || Date.now()) || Date.now();
  if (!_0x9a9838 || _0x431c9a - _0x9a9838 < LONG_MEDIA_TASK_NOTIFICATION_MS) {
    return;
  }
  if (typeof Notification?.isSupported === "function" && !Notification.isSupported()) {
    return;
  }
  notifiedMediaTaskIds.add(_0x5261a5);
  if (notifiedMediaTaskIds.size > 500) {
    notifiedMediaTaskIds.delete(notifiedMediaTaskIds.values().next().value);
  }
  const _0x41cf63 = getMediaTaskDisplayName(_0x66fb8a.kind);
  const _0x105ed4 = _0x318f6e === "failed";
  try {
    const _0x81039a = new Notification({
      title: "" + _0x41cf63 + (_0x105ed4 ? "失败" : "完成"),
      body: _0x105ed4 ? formatNotificationBody(_0x66fb8a.error, "任务处理失败。") : formatNotificationBody("", "长时间媒体任务已处理完成。"),
      silent: String(_0x66fb8a.kind || "") === "audioVoiceCompose"
    });
    _0x81039a.on("click", () => {
      focusMainWindow();
    });
    _0x81039a.show();
  } catch (_0x2bbfa9) {
    console.warn("[electron] failed to show media task notification:", _0x2bbfa9);
  }
}
function sendMediaTaskUpdate(_0x47e960) {
  const _0x6465a0 = String(_0x47e960?.status || "");
  if (_0x47e960?.assetId && (_0x6465a0 === "failed" || _0x6465a0 === "cancelled")) {
    const _0xf22a29 = updateAssetRecord(_0x47e960.assetId, {
      status: "partial",
      error: _0x47e960.error || _0x6465a0,
      mediaTaskId: _0x47e960.taskId || "",
      mediaTaskKind: _0x47e960.kind || "",
      mediaTaskStatus: _0x6465a0,
      mediaTaskProgress: Number(_0x47e960.progress || 0) || 0,
      mediaTaskError: _0x47e960.error || ""
    }, {
      expectedMediaTaskId: _0x47e960.taskId
    });
    sendAssetUpdated(_0xf22a29);
  }
  maybeNotifyLongMediaTask(_0x47e960);
  mainWindow?.webContents?.send("mediaTask:update", _0x47e960);
}
function getMediaTaskQueue() {
  if (mediaTaskQueue) {
    return mediaTaskQueue;
  }
  mediaTaskQueue = new MediaTaskQueue({
    concurrency: 2,
    onUpdate: sendMediaTaskUpdate,
    onActivity: handleMediaTaskActivity
  });
  configureFfmpegVideoEncoderRuntime({
    ffmpegPath: getRuntimeToolOrFallback("ffmpeg"),
    platform: process.platform,
    runCapture: runToolCapture,
    cwd: APP_ROOT
  });
  registerLocalMediaTaskHandlers(mediaTaskQueue, {
    buildWaveformJsonFromFloat32: buildWaveformJsonFromFloat32,
    createOutputFilename: createOutputFilename,
    ensureAssetVideoPlaybackProxy: ensureAssetVideoPlaybackProxy,
    ffprobeHasAudio: ffprobeHasAudio,
    ffprobeVideoMeta: ffprobeVideoMeta,
    getAssetsDir: getAssetsDir,
    getOutputDir: getOutputDir,
    getRuntimeToolOrFallback: getRuntimeToolOrFallback,
    runFfmpegTask: runFfmpegVideoTask,
    resolveMediaTaskSource: resolveMediaTaskSource,
    sendAssetUpdated: sendAssetUpdated,
    toAssetLocalPath: toAssetLocalPath,
    toOutputLocalPath: toOutputLocalPath,
    updateAssetRecord: updateAssetRecord
  });
  registerSharedMediaTaskHandlers(mediaTaskQueue, {
    createOutputFilename: createOutputFilename,
    ffprobeHasAudio: ffprobeHasAudio,
    ffprobeVideoMeta: ffprobeVideoMeta,
    getAsrRuntimeManifestUrl: () => String(process.env.AIC_ASR_RUNTIME_MANIFEST_URL || "https://modelscope.cn/models/q502892879/asr-runtime/resolve/master/asr-runtime-manifest.json").trim(),
    getDoubaoAsrConfig: resolveDoubaoAsrConfig,
    getPythonCertificateEnv: () => buildRuntimePythonCertificateEnv({
      runtimeRoot: RUNTIME_ROOT,
      existsSync: existsSync,
      readdirSync: readdirSync,
      env: process.env
    }),
    getFunasrModelRootDir: getFunasrModelRootDir,
    getOutputDir: getOutputDir,
    getRuntimeToolOrFallback: getRuntimeToolOrFallback,
    getUserDataRoot: () => app.getPath("userData"),
    runFfmpegTask: runFfmpegVideoTask,
    resolveMediaTaskSource: resolveMediaTaskSource,
    resolveFallbackPythonCommand: () => resolvePreferredRuntimePythonCommand({
      existsSync: existsSync,
      fallbackCommand: resolvePythonCommand(),
      platform: process.platform,
      runtimeRoot: RUNTIME_ROOT
    }),
    resolvePythonCommand: () => resolveAsrRuntimePythonCommand({
      userDataRoot: app.getPath("userData"),
      existsSync: existsSync,
      readFileSync: readFileSync,
      fallbackCommand: resolvePreferredRuntimePythonCommand({
        existsSync: existsSync,
        fallbackCommand: resolvePythonCommand(),
        platform: process.platform,
        runtimeRoot: RUNTIME_ROOT
      }),
      platform: process.platform
    }),
    appRoot: APP_ROOT,
    toOutputLocalPath: toOutputLocalPath
  });
  return mediaTaskQueue;
}
function buildWaveformJsonFromFloat32(_0x581313, _0x5ba01b = 190) {
  const _0x41ed4d = _0x581313.buffer.slice(_0x581313.byteOffset, _0x581313.byteOffset + _0x581313.byteLength);
  const _0x408b58 = new Float32Array(_0x41ed4d, 0, Math.floor(_0x581313.byteLength / 4));
  const _0x260314 = _0x408b58.length;
  const _0x2ea36 = Math.max(40, Math.min(400, Number(_0x5ba01b) || 190));
  const _0x1bea32 = Math.max(1, Math.floor(_0x260314 / _0x2ea36));
  const _0x37215b = [];
  for (let _0x451f1d = 0; _0x451f1d < _0x2ea36; _0x451f1d += 1) {
    const _0x3f7975 = _0x451f1d * _0x1bea32;
    const _0x490dcb = Math.min(_0x260314, _0x3f7975 + _0x1bea32);
    let _0x3e0d36 = 0;
    for (let _0x1d32a8 = _0x3f7975; _0x1d32a8 < _0x490dcb; _0x1d32a8 += 1) {
      const _0x41bf86 = Math.abs(Number(_0x408b58[_0x1d32a8]) || 0);
      if (_0x41bf86 > _0x3e0d36) {
        _0x3e0d36 = _0x41bf86;
      }
    }
    _0x37215b.push(Number(Math.min(1, _0x3e0d36).toFixed(4)));
  }
  return {
    version: 1,
    samples: _0x2ea36,
    peaks: _0x37215b
  };
}
function updateAssetRecord(_0x5656c4, _0x1d061f, _0x2014ae = {}) {
  return assetIndexCoordinator.patch(_0x5656c4, _0x1d061f, _0x2014ae);
}
function sendAssetUpdated(_0x3fbe04) {
  if (!_0x3fbe04) {
    return;
  }
  const _0x3474a0 = buildAssetResponse(_0x3fbe04);
  if (shouldUseChromeShellRuntime(process.env, {
    appIsPackaged: app.isPackaged
  })) {
    pendingAssetUpdateEvents.push(_0x3474a0);
    while (pendingAssetUpdateEvents.length > 200) {
      pendingAssetUpdateEvents.shift();
    }
  }
  mainWindow?.webContents?.send("asset:updated", _0x3474a0);
}
function consumeAssetUpdateEvents() {
  return pendingAssetUpdateEvents.splice(0, pendingAssetUpdateEvents.length);
}
function isVideoAssetReady(_0x231c91 = {}) {
  if (_0x231c91.kind !== "video") {
    return false;
  }
  if (!_0x231c91.posterLocalPath) {
    return false;
  }
  if (_0x231c91.videoProxyStatus === "not_required") {
    return true;
  }
  if (_0x231c91.videoProxyVersion !== VIDEO_PLAYBACK_PROXY_VERSION) {
    return false;
  }
  if (!isCurrentVideoPlaybackProxyLocalPath(_0x231c91.displayLocalPath, _0x231c91.assetId)) {
    return false;
  }
  const {
    proxyAbs: _0x40976e
  } = getVideoProxyPaths(_0x231c91.assetId);
  try {
    return existsSync(_0x40976e) && statSync(_0x40976e).size > 0;
  } catch {
    return false;
  }
}
const scheduleAssetDerivatives = createAssetDerivativeScheduler({
  readAssetRecord: _0x5c7a7b => readAssetIndex().assets[_0x5c7a7b] || null,
  getQueue: getMediaTaskQueue,
  updateAssetRecord: updateAssetRecord,
  sendAssetUpdated: sendAssetUpdated,
  createTaskId: _0x2a2b88 => "asset-" + _0x2a2b88 + "-" + Date.now() + "-" + randomBytes(6).toString("hex")
});
const ASSET_MEDIA_TASK_FIELDS = ["mediaTaskId", "mediaTaskKind", "mediaTaskStatus", "mediaTaskProgress", "mediaTaskError"];
function preserveLatestAssetFields(_0x2f9104, _0x5e9b3f, _0xd807e6) {
  for (const _0xfa3ccf of _0xd807e6) {
    if (Object.prototype.hasOwnProperty.call(_0x5e9b3f, _0xfa3ccf)) {
      _0x2f9104[_0xfa3ccf] = _0x5e9b3f[_0xfa3ccf];
    }
  }
}
function hasCurrentStoredVideoProxy(_0x3d46f4 = {}) {
  if (_0x3d46f4.videoProxyVersion !== VIDEO_PLAYBACK_PROXY_VERSION) {
    return false;
  }
  if (!isCurrentVideoPlaybackProxyLocalPath(_0x3d46f4.displayLocalPath, _0x3d46f4.assetId)) {
    return false;
  }
  const {
    proxyAbs: _0x487995
  } = getVideoProxyPaths(_0x3d46f4.assetId);
  try {
    return existsSync(_0x487995) && statSync(_0x487995).size > 0;
  } catch {
    return false;
  }
}
function mergePreparedAssetRecord(_0x1c7810, _0x45dd68) {
  const _0x412700 = _0x1c7810 || {};
  const _0x31b553 = {
    ..._0x412700,
    ..._0x45dd68,
    createdAt: _0x412700.createdAt || _0x45dd68.createdAt
  };
  if (_0x412700.mediaTaskId) {
    preserveLatestAssetFields(_0x31b553, _0x412700, ASSET_MEDIA_TASK_FIELDS);
  }
  if (_0x31b553.kind === "video") {
    if (_0x412700.posterLocalPath) {
      _0x31b553.posterLocalPath = _0x412700.posterLocalPath;
    }
    if (_0x412700.thumbLocalPath) {
      _0x31b553.thumbLocalPath = _0x412700.thumbLocalPath;
    }
    if (hasCurrentStoredVideoProxy(_0x412700)) {
      preserveLatestAssetFields(_0x31b553, _0x412700, ["displayLocalPath", "videoProxyStatus", "videoProxyVersion"]);
    }
    _0x31b553.status = isVideoAssetReady(_0x31b553) ? "ready" : "processing";
    if (_0x31b553.status === "ready") {
      _0x31b553.error = "";
    }
  } else if (_0x31b553.kind === "audio") {
    if (_0x412700.waveformLocalPath) {
      _0x31b553.waveformLocalPath = _0x412700.waveformLocalPath;
    }
    _0x31b553.status = _0x31b553.waveformLocalPath ? "ready" : "processing";
    if (_0x31b553.status === "ready") {
      _0x31b553.error = "";
    }
  }
  return _0x31b553;
}
async function importAssetToLibrary(_0xa9b060 = {}) {
  const _0x245168 = Date.now();
  const _0x3ec594 = String(_0xa9b060?.path || "").trim();
  const _0x120536 = bufferFromImportPayload(_0xa9b060);
  if (!_0x3ec594 && !_0x120536) {
    throw new Error("缺少文件路径或文件内容");
  }
  const _0x415480 = _0x3ec594 ? realpathSync(_0x3ec594) : "";
  let _0x52c323 = null;
  if (_0x415480) {
    if (!a249_0x815eab.isAbsolute(_0x415480)) {
      throw new Error("文件路径必须是绝对路径");
    }
    _0x52c323 = statSync(_0x415480);
    if (!_0x52c323.isFile()) {
      throw new Error("只支持导入文件");
    }
  }
  const _0x4a46ee = sanitizeUploadFilename(_0xa9b060?.name || (_0x415480 ? a249_0x815eab.basename(_0x415480) : "asset"));
  const _0xf97747 = String(_0xa9b060?.type || "").trim();
  const _0x1bdb3c = _0x120536 ? hashBuffer(_0x120536) : await hashFileSha256(_0x415480);
  return assetImportQueue.run(_0x1bdb3c, async () => {
    const _0x26ca65 = classifyAssetKind(_0x4a46ee, _0xf97747);
    const _0x3790bd = getSafeOriginalExtension(_0x4a46ee, _0xf97747);
    const _0x4ddaff = readAssetIndex();
    const _0x3fa9ed = _0x4ddaff.assets[_0x1bdb3c] || {};
    const _0x5c03bf = getAssetOriginalDir();
    mkdirSync(_0x5c03bf, {
      recursive: true
    });
    const _0x3f0064 = getExistingAssetOriginalFilename(_0x1bdb3c, _0x3fa9ed) || "" + _0x1bdb3c + _0x3790bd;
    const _0x5ee284 = a249_0x815eab.join(_0x5c03bf, _0x3f0064);
    const _0x3f603b = toAssetLocalPath("original", _0x3f0064);
    const _0x167d31 = _0x120536 ? _0x120536.length : Number(_0x52c323?.size || 0);
    const _0x4e35ac = await materializeAssetOriginal({
      targetPath: _0x5ee284,
      expectedSha256: _0x1bdb3c,
      expectedSize: _0x167d31,
      ...(_0x120536 ? {
        sourceBuffer: _0x120536
      } : {
        sourcePath: _0x415480
      })
    });
    const _0x446d97 = _0x4e35ac.reused;
    const _0x4d1988 = new Date().toISOString();
    let _0x2197c6 = {
      ..._0x3fa9ed,
      assetId: _0x1bdb3c,
      kind: _0x26ca65,
      originalName: _0x4a46ee,
      filename: _0x4a46ee,
      mimeType: _0xf97747,
      size: _0x167d31,
      sha256: _0x1bdb3c,
      originalLocalPath: _0x3f603b,
      createdAt: _0x3fa9ed.createdAt || _0x4d1988,
      updatedAt: _0x4d1988,
      status: _0x3fa9ed.status || (_0x26ca65 === "image" || _0x26ca65 === "file" ? "ready" : "processing"),
      error: _0x3fa9ed.error || ""
    };
    if (_0x26ca65 === "image") {
      try {
        _0x2197c6 = {
          ..._0x2197c6,
          ...writeAssetImageDerivatives(_0x1bdb3c, _0x5ee284),
          status: "ready",
          error: ""
        };
      } catch (_0x146422) {
        _0x2197c6 = {
          ..._0x2197c6,
          status: "partial",
          error: String(_0x146422?.message || _0x146422)
        };
        console.warn("[electron] image asset derivative failed:", _0x146422);
      }
    } else if (_0x26ca65 === "video") {
      try {
        const _0x13cef0 = await ffprobeVideoPlaybackInfoForImport(_0x5ee284);
        const _0x4cf124 = needsBrowserVideoProxy(_0x13cef0);
        const _0x43659e = _0x2197c6.videoProxyVersion === VIDEO_PLAYBACK_PROXY_VERSION && isCurrentVideoPlaybackProxyLocalPath(_0x2197c6.displayLocalPath, _0x1bdb3c);
        _0x2197c6 = {
          ..._0x2197c6,
          displayLocalPath: _0x4cf124 ? _0x2197c6.displayLocalPath || "" : "",
          videoCodec: _0x13cef0.codecName,
          videoWidth: _0x13cef0.width,
          videoHeight: _0x13cef0.height,
          width: _0x13cef0.width,
          height: _0x13cef0.height,
          videoDuration: _0x13cef0.duration,
          videoFps: _0x13cef0.fps,
          videoProxyStatus: _0x4cf124 ? _0x43659e ? "generated" : "processing" : "not_required",
          videoProxyVersion: _0x4cf124 && _0x43659e ? VIDEO_PLAYBACK_PROXY_VERSION : ""
        };
      } catch (_0x5b1c95) {
        _0x2197c6 = {
          ..._0x2197c6,
          videoProxyStatus: _0x2197c6.videoProxyVersion === VIDEO_PLAYBACK_PROXY_VERSION && isCurrentVideoPlaybackProxyLocalPath(_0x2197c6.displayLocalPath, _0x1bdb3c) ? "generated" : "processing",
          error: _0x2197c6.error || String(_0x5b1c95?.message || _0x5b1c95)
        };
        console.warn("[electron] video asset metadata probe failed:", _0x5b1c95);
      }
      _0x2197c6.status = isVideoAssetReady(_0x2197c6) ? "ready" : "processing";
    } else if (_0x26ca65 === "audio") {
      _0x2197c6.status = _0x2197c6.waveformLocalPath ? "ready" : "processing";
    }
    _0x2197c6 = assetIndexCoordinator.commit(_0x1bdb3c, _0x17f0de => mergePreparedAssetRecord(_0x17f0de, _0x2197c6));
    const _0x66f199 = scheduleAssetDerivatives(_0x2197c6);
    if (_0x66f199) {
      _0x2197c6 = readAssetIndex().assets[_0x1bdb3c] || {
        ..._0x2197c6,
        status: "processing",
        mediaTaskId: _0x66f199.taskId,
        mediaTaskKind: _0x66f199.kind,
        mediaTaskStatus: _0x66f199.status,
        mediaTaskProgress: _0x66f199.progress,
        mediaTaskError: ""
      };
    }
    if (isAssetImportLoggingEnabled()) {
      console.log("[asset-import] done", {
        t: Date.now(),
        elapsedMs: Date.now() - _0x245168,
        assetId: _0x1bdb3c,
        kind: _0x26ca65,
        reused: _0x446d97,
        originalLocalPath: _0x3f603b,
        status: _0x2197c6.status
      });
    }
    return buildAssetResponse(_0x2197c6, {
      reused: _0x446d97,
      derivativeStatus: _0x2197c6.status
    });
  });
}
function installLocalApiTokenHeader() {
  if (localApiTokenHeaderInstalled) {
    return;
  }
  localApiTokenHeaderInstalled = true;
  session.defaultSession.webRequest.onBeforeSendHeaders({
    urls: [APP_ORIGIN + "/api/*", "http://localhost:" + PORT + "/api/*"]
  }, (_0x3b4e3e, _0x5d26e5) => {
    _0x5d26e5({
      requestHeaders: {
        ..._0x3b4e3e.requestHeaders,
        "X-AIC-Local-Token": LOCAL_ACCESS_TOKEN
      }
    });
  });
}
async function waitForServerReady(_0x3f39a9 = null, _0x2d50f9 = null) {
  const _0x3ef094 = Date.now();
  while (Date.now() - _0x3ef094 < SERVER_READY_TIMEOUT_MS) {
    const _0x30cbea = _0x2d50f9 ? await Promise.race([probeServer(), _0x2d50f9]) : await probeServer();
    if (_0x30cbea) {
      return true;
    }
    const _0x431c59 = Date.now() - _0x3ef094;
    _0x3f39a9?.({
      kind: "loading",
      title: APP_DISPLAY_NAME + " 正在启动",
      detail: "正在准备画布环境。",
      hint: "已等待 " + Math.ceil(_0x431c59 / 1000) + " 秒，预计最多需要 " + Math.ceil(SERVER_READY_TIMEOUT_MS / 1000) + " 秒。"
    });
    if (_0x2d50f9) {
      await Promise.race([delay(SERVER_READY_INTERVAL_MS), _0x2d50f9]);
    } else {
      await delay(SERVER_READY_INTERVAL_MS);
    }
  }
  return false;
}
async function ensureServerRunning(_0x76f7bd = null) {
  _0x76f7bd?.({
    kind: "loading",
    title: APP_DISPLAY_NAME + " 正在启动",
    detail: "正在准备画布环境。",
    hint: "启动完成后会自动进入画布。"
  });
  if (await probeServer()) {
    _0x76f7bd?.({
      kind: "loading",
      title: APP_DISPLAY_NAME + " 正在启动",
      detail: "正在打开画布。",
      hint: ""
    });
    return "reused";
  }
  const _0x4eef94 = resolveBackendLaunch();
  _0x76f7bd?.({
    kind: "loading",
    title: APP_DISPLAY_NAME + " 正在启动",
    detail: "正在加载本地工作环境。",
    hint: "启动完成后会自动进入画布。"
  });
  const _0x20704c = createWriteStream(SERVER_LOG_PATH, {
    flags: "a"
  });
  _0x20704c.write("\n[" + new Date().toISOString() + "] starting " + _0x4eef94.kind + " " + (_0x4eef94.command + " --host=" + HOST + " --port=" + PORT + " ") + ("timeoutMs=" + SERVER_READY_TIMEOUT_MS + "\n"));
  const _0x1810f5 = _0x12bea0 => {
    _0x20704c.write("[" + new Date().toISOString() + "] spawn error: " + (_0x12bea0?.stack || _0x12bea0?.message || _0x12bea0) + "\n");
    logDiagnosticEvent({
      type: "backend.spawn_error",
      level: "error",
      source: "main",
      message: "Failed to spawn local Python service",
      error: _0x12bea0,
      context: {
        command: _0x4eef94.command,
        port: PORT
      }
    });
    _0x76f7bd?.({
      kind: "error",
      title: APP_DISPLAY_NAME + " 启动失败",
      detail: "启动本地工作环境失败。",
      hint: "请重启应用，若仍失败请导出诊断日志。"
    });
  };
  let _0x225a35;
  const _0x17de61 = launchMonitoredBackendProcess({
    spawnProcess: spawn,
    command: _0x4eef94.command,
    args: [..._0x4eef94.args, "--host=" + HOST, "--port=" + PORT],
    options: {
      cwd: _0x4eef94.cwd,
      env: {
        ...process.env,
        AIC_APP_ROOT: APP_ROOT,
        AICANVAS_PORT: String(PORT),
        AIC_LOCAL_TOKEN: LOCAL_ACCESS_TOKEN,
        PYTHONIOENCODING: "utf-8",
        PYTHONUNBUFFERED: "1",
        PYTHONUTF8: "1",
        ...buildPackagedServerEnv()
      },
      stdio: ["ignore", "pipe", "pipe"],
      windowsHide: true
    },
    logStream: _0x20704c,
    onSpawnError: _0x1810f5,
    onExit: (_0x504b9a, _0x41800b) => {
      _0x20704c.write("[" + new Date().toISOString() + "] exited code=" + (_0x504b9a ?? "") + " signal=" + (_0x41800b ?? "") + "\n");
      if (_0x504b9a !== 0 || _0x41800b) {
        logDiagnosticEvent({
          type: "backend.exited",
          level: "warn",
          source: "main",
          message: "Local Python service exited",
          context: {
            code: _0x504b9a,
            signal: _0x41800b,
            port: PORT
          }
        });
      }
      if (spawnedServer === _0x225a35) {
        spawnedServer = null;
      }
    }
  });
  _0x225a35 = _0x17de61.child;
  spawnedServer = _0x225a35;
  let _0x1b430b = false;
  try {
    _0x1b430b = await waitForServerReady(_0x76f7bd, _0x17de61.failure);
  } catch (_0x578363) {
    stopSpawnedServer();
    throw _0x578363;
  }
  if (!_0x1b430b) {
    _0x17de61.markReady();
    stopSpawnedServer();
    logDiagnosticEvent({
      type: "backend.ready_timeout",
      level: "error",
      source: "main",
      message: "Local Python service did not become ready",
      context: {
        appUrl: APP_URL,
        timeoutMs: SERVER_READY_TIMEOUT_MS
      }
    });
    throw new Error(APP_DISPLAY_NAME + " server did not become ready at " + APP_URL);
  }
  _0x17de61.markReady();
  _0x76f7bd?.({
    kind: "loading",
    title: APP_DISPLAY_NAME + " 正在启动",
    detail: "正在打开画布。",
    hint: ""
  });
  return "started";
}
function stopSpawnedServer() {
  if (!spawnedServer || spawnedServer.killed) {
    return;
  }
  try {
    spawnedServer.kill();
  } catch {} finally {
    spawnedServer = null;
  }
}
async function closeChromeShellForUpdate() {
  const _0x258246 = chromeShellLaunch;
  const _0x1d4573 = await closeChromeShellLaunchForUpdate({
    launch: _0x258246,
    env: process.env,
    platform: process.platform
  });
  if (!_0x1d4573) {
    const _0x4ce86c = new Error("Chrome shell window could not be closed before update");
    _0x4ce86c.code = "CHROME_SHELL_WINDOW_CLOSE_FAILED";
    throw _0x4ce86c;
  }
  if (chromeShellLaunch === _0x258246) {
    chromeShellLaunch = null;
  }
}
async function focusMainWindow() {
  if (activateMainWindow({
    app: app,
    window: mainWindow
  })) {
    return true;
  }
  if (process.platform === "win32") {
    return focusChromeShellLaunchWindow({
      launch: chromeShellLaunch,
      env: process.env,
      platform: process.platform
    });
  }
  return Boolean(activateChromeShellWindowSoon({
    child: chromeShellLaunch?.process
  }));
}
function normalizeVirtualLocalPath(_0x2d9fb0) {
  const _0x5136f2 = String(_0x2d9fb0 || "").trim();
  if (!_0x5136f2) {
    return "";
  }
  if (/^(?:file|javascript|data|blob):/i.test(_0x5136f2)) {
    return "";
  }
  if (/^https?:/i.test(_0x5136f2)) {
    try {
      const _0xe7d883 = new URL(_0x5136f2);
      const _0x418bc7 = String(_0xe7d883.hostname || "").toLowerCase();
      if (_0x418bc7 !== "localhost" && _0x418bc7 !== "127.0.0.1" && _0x418bc7 !== "::1" && _0x418bc7 !== "[::1]") {
        return "";
      }
      return normalizeVirtualLocalPath(_0xe7d883.pathname);
    } catch {
      return "";
    }
  }
  const _0x5d936e = _0x5136f2.replace(/\\/g, "/");
  if (/^[a-z][a-z0-9+.-]*:/i.test(_0x5d936e)) {
    return "";
  }
  if (/^[a-zA-Z]:\//.test(_0x5d936e) || _0x5d936e.startsWith("//")) {
    return "";
  }
  let _0x4c1149 = _0x5d936e.split(/[?#]/, 1)[0];
  try {
    _0x4c1149 = decodeURIComponent(_0x4c1149);
  } catch {}
  const _0x200c6d = a249_0x815eab.posix.normalize(_0x4c1149.replace(/^\/+/, ""));
  if (!_0x200c6d || _0x200c6d === "." || _0x200c6d === ".." || _0x200c6d.startsWith("../")) {
    return "";
  }
  if (!_0x200c6d.startsWith("data/assets/") && !_0x200c6d.startsWith("data/uploads/") && !_0x200c6d.startsWith("output/")) {
    return "";
  }
  return _0x200c6d;
}
function resolveLocalVirtualPath(_0x4f6cd5) {
  const _0x38eb64 = normalizeVirtualLocalPath(_0x4f6cd5);
  if (!_0x38eb64) {
    return "";
  }
  const _0x2b1bc4 = [["data/assets/", getAssetsDir()], ["data/uploads/", getUploadsDir()], ["output/", getOutputDir()]];
  for (const [_0x525d77, _0x36c91d] of _0x2b1bc4) {
    if (!_0x38eb64.startsWith(_0x525d77)) {
      continue;
    }
    const _0x41a509 = _0x38eb64.slice(_0x525d77.length);
    return resolveExistingPathWithinRoot(_0x36c91d, _0x41a509);
  }
  return "";
}
function getSecureSettingsStore() {
  if (!secureSettingsStore) {
    secureSettingsStore = createSecureSettingsStore({
      filePath: getSecureSettingsStorePath(),
      safeStorage: safeStorage
    });
  }
  return secureSettingsStore;
}
const resolveDoubaoAsrConfig = createDoubaoAsrConfigResolver({
  appRoot: APP_ROOT,
  getSecureSettingsStore: getSecureSettingsStore,
  getUserRoot: getUserRoot,
  processEnv: process.env
});
function normalizeSecureSettingsKeys(_0x32b793 = {}) {
  const _0xc3fb0d = Array.isArray(_0x32b793?.keys) ? _0x32b793.keys : [_0x32b793?.key];
  return _0xc3fb0d.map(_0x266603 => String(_0x266603 || "").trim()).filter(Boolean);
}
function syncSystemRecentDocumentsBestEffort() {
  try {
    return syncRecentProjectsToSystemRecentDocuments({
      app: app,
      recentStorePath: getRecentProjectsStorePath()
    });
  } catch (_0x7b9871) {
    console.warn("[electron] sync recent documents failed:", _0x7b9871);
    return {
      ok: false,
      error: String(_0x7b9871?.message || _0x7b9871),
      count: 0,
      paths: []
    };
  }
}
function resolveClipboardAbsoluteFilePath(_0xad4d18) {
  let _0x40b089 = String(_0xad4d18 || "").trim();
  if (!_0x40b089) {
    return "";
  }
  _0x40b089 = _0x40b089.replace(/^"|"$/g, "");
  if (/^file:\/\//i.test(_0x40b089)) {
    try {
      _0x40b089 = fileURLToPath(_0x40b089);
    } catch {
      return "";
    }
  }
  if (!a249_0x815eab.isAbsolute(_0x40b089)) {
    return "";
  }
  try {
    const _0x2047d6 = realpathSync(_0x40b089);
    const _0x382fe5 = statSync(_0x2047d6);
    if (_0x382fe5.isFile()) {
      return _0x2047d6;
    } else {
      return "";
    }
  } catch {
    return "";
  }
}
function resolveClipboardImagePath(_0x1011e6 = {}) {
  const _0x2283b1 = resolveClipboardAbsoluteFilePath(_0x1011e6?.absolutePath);
  if (_0x2283b1) {
    return _0x2283b1;
  }
  const _0x413656 = String(_0x1011e6?.localPath || "").trim();
  if (!_0x413656) {
    return "";
  }
  const _0x3064f3 = resolveLocalVirtualPath(_0x413656);
  if (!_0x3064f3) {
    return "";
  }
  try {
    const _0x277c43 = statSync(_0x3064f3);
    if (_0x277c43.isFile()) {
      return _0x3064f3;
    } else {
      return "";
    }
  } catch {
    return "";
  }
}
function createClipboardNativeImage(_0x33bac0 = {}) {
  const _0x591666 = String(_0x33bac0?.pngBase64 || "").trim();
  if (_0x591666) {
    return nativeImage.createFromBuffer(Buffer.from(_0x591666, "base64"));
  }
  const _0x26ccdf = resolveClipboardImagePath(_0x33bac0);
  if (!_0x26ccdf) {
    return nativeImage.createEmpty();
  }
  return nativeImage.createFromPath(_0x26ccdf);
}
function getMimeTypeForClipboardFile(_0x2a05a6) {
  const _0x4c4b98 = a249_0x815eab.extname(String(_0x2a05a6 || "")).toLowerCase();
  const _0x1d34ec = {
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".webp": "image/webp",
    ".gif": "image/gif",
    ".bmp": "image/bmp",
    ".avif": "image/avif",
    ".mp4": "video/mp4",
    ".m4v": "video/mp4",
    ".webm": "video/webm",
    ".mov": "video/quicktime",
    ".mp3": "audio/mpeg",
    ".wav": "audio/wav",
    ".m4a": "audio/mp4",
    ".aac": "audio/aac",
    ".ogg": "audio/ogg",
    ".flac": "audio/flac",
    ".txt": "text/plain"
  };
  return _0x1d34ec[_0x4c4b98] || "application/octet-stream";
}
function buildClipboardFileMeta(_0x5dd24a) {
  const _0x18f05c = statSync(_0x5dd24a);
  return {
    path: _0x5dd24a,
    name: a249_0x815eab.basename(_0x5dd24a),
    type: getMimeTypeForClipboardFile(_0x5dd24a),
    size: Number(_0x18f05c.size || 0) || 0
  };
}
function normalizeClipboardFileReferences(_0x5e1ae7 = []) {
  const _0x31029d = new Set();
  const _0x9f67d8 = [];
  (Array.isArray(_0x5e1ae7) ? _0x5e1ae7 : [_0x5e1ae7]).forEach(_0x193e4b => {
    const _0xcfe44a = _0x193e4b && typeof _0x193e4b === "object" ? _0x193e4b.path : _0x193e4b;
    const _0x4f33db = resolveClipboardAbsoluteFilePath(_0xcfe44a);
    if (!_0x4f33db) {
      return;
    }
    const _0x20ae3b = process.platform === "win32" || process.platform === "darwin" ? _0x4f33db.toLowerCase() : _0x4f33db;
    if (_0x31029d.has(_0x20ae3b)) {
      return;
    }
    _0x31029d.add(_0x20ae3b);
    _0x9f67d8.push(buildClipboardFileMeta(_0x4f33db));
  });
  return _0x9f67d8;
}
function parseClipboardFileReferencesFromText(_0x56a120) {
  const _0x52d650 = String(_0x56a120 || "").split(/\r?\n/).map(_0x1cd19c => _0x1cd19c.trim()).filter(Boolean);
  return normalizeClipboardFileReferences(_0x52d650);
}
function resolveKnownFolder(_0x4dba5b) {
  const _0xc53b5d = String(_0x4dba5b || "").trim();
  if (_0xc53b5d === "assets") {
    return getAssetsDir();
  }
  if (_0xc53b5d === "output") {
    return getOutputDir();
  }
  if (_0xc53b5d === "project") {
    return getCanvasProjectDir();
  }
  return "";
}
function getLocalAssetCleanupManager() {
  if (localAssetCleanupManager) {
    return localAssetCleanupManager;
  }
  localAssetCleanupManager = createLocalAssetCleanupManager({
    trashItem: _0xda3fd => shell.trashItem(_0xda3fd),
    getRoots: createLocalAssetCleanupRootsResolver({
      appIsPackaged: app.isPackaged,
      legacyFilesRoot: LEGACY_PACKAGED_FILES_ROOT,
      storageRoot: getStorageRoot(),
      readCurrentFileSavePaths: () => readFileSavePathsForLocalCleanup({
        requestLocalJson: requestLocalJson,
        logDiagnosticEvent: logDiagnosticEvent
      }),
      getCurrentDefaults: () => ({
        canvasDir: getCanvasProjectDir(),
        outputDir: getOutputDir(),
        dataDir: getDataDir(),
        uploadsDir: getUploadsDir(),
        assetsDir: getAssetsDir(),
        workflowsDir: getWorkflowsDir(),
        workflowThumbsDir: a249_0x815eab.join(getWorkflowsDir(), "thumbs"),
        recentProjectsStorePath: getRecentProjectsStorePath(),
        recoverySnapshotPath: getRecoverySnapshotPath()
      })
    })
  });
  return localAssetCleanupManager;
}
function normalizeWindowProjectName(_0x30f4e7) {
  return String(_0x30f4e7 || "").replace(/\s+/g, " ").trim();
}
function updateMainWindowUnsavedState(_0x46c3fa = mainWindow) {
  if (!_0x46c3fa || _0x46c3fa.isDestroyed()) {
    return;
  }
  const _0x2fe12b = rendererProjectState.hasUnsavedChanges === true;
  _0x46c3fa.setTitle("" + APP_DISPLAY_NAME + (_0x2fe12b ? " *" : ""));
  try {
    _0x46c3fa.setDocumentEdited(_0x2fe12b);
  } catch {}
}
function handleRendererUnsavedState(_0x37dc57 = {}) {
  rendererProjectState = {
    hasUnsavedChanges: _0x37dc57?.hasUnsavedChanges === true || _0x37dc57?.dirty === true,
    projectName: normalizeWindowProjectName(_0x37dc57?.projectName)
  };
  updateMainWindowUnsavedState();
}
function enqueueExternalProjectOpenRequest(_0x229100) {
  if (!_0x229100 || typeof _0x229100 !== "object") {
    return;
  }
  pendingExternalProjectOpenRequests.push({
    ..._0x229100,
    queuedAt: Date.now()
  });
  mainWindow?.webContents?.send("project:externalOpenAvailable");
}
function findFirstSupportedProjectPackagePathFromArgs(_0x4fa215) {
  const _0x721989 = Array.isArray(_0x4fa215) ? _0x4fa215 : [];
  for (const _0x34a99f of _0x721989) {
    const _0x52ff4b = String(_0x34a99f || "").trim().replace(/^"|"$/g, "");
    if (!_0x52ff4b || !a249_0x815eab.isAbsolute(_0x52ff4b) || a249_0x815eab.extname(_0x52ff4b).toLowerCase() !== ".aicpkg") {
      continue;
    }
    try {
      if (statSync(_0x52ff4b).isFile()) {
        return a249_0x815eab.resolve(_0x52ff4b);
      }
    } catch {}
  }
  return "";
}
function queueExternalProjectOpenPath(_0x3d79ca, _0x2634b7) {
  const _0x5e017d = findFirstSupportedProjectPackagePathFromArgs([_0x3d79ca]);
  const _0x21cfcb = _0x5e017d || findFirstSupportedProjectPathFromArgs([_0x3d79ca], {
    mustExist: true
  });
  if (!_0x21cfcb) {
    return false;
  }
  try {
    enqueueExternalProjectOpenRequest(_0x5e017d ? {
      success: true,
      canceled: false,
      kind: "projectPackage",
      path: _0x21cfcb,
      filePath: _0x21cfcb,
      filename: a249_0x815eab.basename(_0x21cfcb),
      source: _0x2634b7
    } : mainCapabilityHandlers.projectOperations.openPath(_0x21cfcb, {
      source: _0x2634b7
    }));
    logDiagnosticEvent({
      type: "project.external_open_queued",
      level: "info",
      source: "main",
      message: "External project open queued",
      context: {
        source: _0x2634b7,
        filePath: _0x21cfcb
      }
    });
  } catch (_0x2a9872) {
    logDiagnosticEvent({
      type: "project.external_open_failed",
      level: "error",
      source: "main",
      message: "External project open failed",
      error: _0x2a9872,
      context: {
        source: _0x2634b7,
        filePath: _0x21cfcb
      }
    });
    enqueueExternalProjectOpenRequest({
      success: false,
      canceled: false,
      source: _0x2634b7,
      filePath: _0x21cfcb,
      filename: a249_0x815eab.basename(_0x21cfcb),
      error: String(_0x2a9872?.message || _0x2a9872)
    });
  }
  return true;
}
function queueExternalProjectOpenFromArgs(_0x1f1972, _0x3e298e) {
  const _0x56ecb8 = findFirstSupportedProjectPackagePathFromArgs(_0x1f1972) || findFirstSupportedProjectPathFromArgs(_0x1f1972, {
    mustExist: true
  });
  if (_0x56ecb8) {
    return queueExternalProjectOpenPath(_0x56ecb8, _0x3e298e);
  } else {
    return false;
  }
}
function normalizeDialogOptionText(_0xd17214, _0x5062db = "", _0x32d109 = 180) {
  const _0x8551d2 = String(_0xd17214 || "").replace(/\0/g, "").trim();
  if (!_0x8551d2) {
    return _0x5062db;
  }
  return _0x8551d2.slice(0, _0x32d109);
}
async function selectDirectory(_0x3fb2ea = {}) {
  const _0x181fc6 = normalizeDialogOptionText(_0x3fb2ea?.title, "选择保存目录", 80);
  const _0x3c9685 = normalizeDialogOptionText(_0x3fb2ea?.defaultPath, "", 1024);
  const _0x3ae572 = {
    title: _0x181fc6,
    properties: ["openDirectory", "createDirectory"]
  };
  if (_0x3c9685) {
    _0x3ae572.defaultPath = _0x3c9685;
  }
  const _0x4a3969 = await showOpenDialog(_0x3ae572);
  if (_0x4a3969.canceled || !_0x4a3969.filePaths?.[0]) {
    return {
      success: false,
      canceled: true
    };
  }
  return {
    success: true,
    canceled: false,
    path: _0x4a3969.filePaths[0]
  };
}
function readAppVersionFromIndexHtml() {
  try {
    const _0x45ecc1 = readFileSync(a249_0x815eab.join(APP_ROOT, "index.html"), "utf8");
    const _0x1e1695 = _0x45ecc1.match(/<meta\s+name=["']app-version["']\s+content=["']([^"']+)["']/i);
    return String(_0x1e1695?.[1] || "").trim();
  } catch {
    return "";
  }
}
function getAutoUpdater() {
  if (!autoUpdaterInstance) {
    autoUpdaterInstance = a249_0x4d2a83.autoUpdater;
  }
  return autoUpdaterInstance;
}
function handleUpdaterEvent(_0xf0d370 = {}) {
  const _0x48e6db = String(_0xf0d370.type || "");
  if (_0x48e6db === "download-started" || _0x48e6db === "download-retry") {
    setTaskbarProgressSource("updater", 0);
    setPowerSaveBlocker("updater", true);
    return;
  }
  if (_0x48e6db === "download-progress") {
    setPowerSaveBlocker("updater", true);
    return;
  }
  if (_0x48e6db === "downloaded" || _0x48e6db === "download-cancelled" || _0x48e6db === "download-failed" || _0x48e6db === "error" || _0x48e6db === "not-available") {
    setTaskbarProgressSource("updater", -1);
    setPowerSaveBlocker("updater", false);
  }
}
function markQuittingForUpdate() {
  isQuittingForUpdate = true;
}
function getUpdateInstallPreparation() {
  if (!updateInstallPreparation) {
    updateInstallPreparation = createUpdateInstallPreparation({
      getSpawnedServer: () => spawnedServer,
      clearSpawnedServer: _0x14dac5 => {
        if (spawnedServer === _0x14dac5) {
          spawnedServer = null;
        }
      },
      markQuittingForUpdate: markQuittingForUpdate,
      resetQuittingForUpdate: () => {
        isQuittingForUpdate = false;
      },
      waitForChromeShellStartup: () => chromeShellStartupSettledPromise,
      getMainWindow: () => mainWindow,
      getRendererProjectState: () => rendererProjectState,
      requestRendererRecoverySnapshot: requestRendererRecoverySnapshot,
      destroyScreenshotOverlayWindow: () => screenshotOverlayController.destroyScreenshotOverlayWindow(),
      stopAllPowerSaveBlockers: stopAllPowerSaveBlockers,
      closeChromeShell: closeChromeShellForUpdate,
      logEvent: logDiagnosticEvent
    });
  }
  return updateInstallPreparation;
}
function getUpdaterController() {
  if (!updaterController) {
    updaterController = createUpdaterController({
      autoUpdater: getAutoUpdater(),
      createCancellationToken: () => new a249_0x4d2a83.CancellationToken(),
      isPackaged: () => app.isPackaged,
      normalizeInfo: normalizeUpdaterInfo,
      logEvent: logDiagnosticEvent,
      prepareBeforeInstall: () => getUpdateInstallPreparation().prepareForUpdateInstall(),
      quitApplication: () => app.quit(),
      setProgressBar: _0x4f0afb => {
        setTaskbarProgressSource("updater", _0x4f0afb);
      },
      sendEvent: _0x2421d8 => {
        latestUpdaterEvent = _0x2421d8;
        if (_0x2421d8?.info) {
          latestUpdaterInfo = _0x2421d8.info;
        }
        handleUpdaterEvent(_0x2421d8);
        if (!mainWindow || mainWindow.isDestroyed()) {
          return;
        }
        mainWindow.webContents.send("appUpdater:event", _0x2421d8);
      }
    });
  }
  return updaterController;
}
function readLocalPreviewVideoUrl() {
  try {
    const _0x438f77 = readFileSync(a249_0x815eab.join(APP_ROOT, "release_notes.txt"), "utf8");
    const _0x101a03 = extractPreviewVideoUrlFromNotes(_0x438f77);
    if (_0x101a03) {
      return _0x101a03;
    }
  } catch {}
  try {
    const _0x4df46c = readFileSync(a249_0x815eab.join(APP_ROOT, "release_video_url.txt"), "utf8");
    return _0x4df46c.split(/\r?\n/).map(_0x2c2a8d => _0x2c2a8d.trim()).find(_0x95efa3 => _0x95efa3 && !_0x95efa3.startsWith("#")) || "";
  } catch {
    return "";
  }
}
function normalizeUpdaterInfo(_0x555b99) {
  return normalizeUpdaterInfoPayload(_0x555b99, {
    readLocalPreviewVideoUrl: readLocalPreviewVideoUrl
  });
}
function installUpdaterHandlers() {
  if (updaterHandlersInstalled) {
    return;
  }
  updaterHandlersInstalled = true;
  getUpdaterController().installHandlers();
}
function scheduleUpdateCheck() {
  const recoveredBuild = /recovered/i.test(String(app.getName?.() || ""));
  if (!app.isPackaged || recoveredBuild || /^(1|true|yes|on)$/i.test(String(process.env.AIC_DISABLE_AUTO_UPDATE || "")) || updateCheckStarted) {
    return;
  }
  updateCheckStarted = true;
  installUpdaterHandlers();
  getUpdaterController().checkForUpdates().catch(_0x31ddce => {
    console.warn("[electron][updater] check failed:", _0x31ddce);
  });
}
function loadCanvasWindow(_0x3b4079 = mainWindow) {
  if (!_0x3b4079 || _0x3b4079.isDestroyed()) {
    return;
  }
  _0x3b4079.loadURL(APP_URL);
}
async function restartBackendAndReload() {
  if (app.isPackaged || backendRestartInProgress) {
    return;
  }
  backendRestartInProgress = true;
  try {
    loadStartupStatus({
      kind: "loading",
      title: APP_DISPLAY_NAME + " 正在重新启动",
      detail: "正在重新加载画布环境。",
      hint: "完成后会自动回到画布。"
    });
    localRuntimeKeepAlive.stop();
    stopSpawnedServer();
    await clearPortBeforeStart(loadStartupStatus);
    await ensureServerRunning(loadStartupStatus);
    localRuntimeKeepAlive.start("backend-restart");
    loadCanvasWindow();
  } catch (_0x17e2e7) {
    console.error("[electron] backend restart failed:", _0x17e2e7);
    logDiagnosticEvent({
      type: "backend.restart_failed",
      level: "error",
      source: "main",
      message: "Backend restart failed",
      error: _0x17e2e7
    });
    loadStartupStatus({
      kind: "error",
      title: APP_DISPLAY_NAME + " 重新启动失败",
      detail: "画布环境重新加载失败。",
      hint: "请重启应用，若仍失败请导出诊断日志。"
    });
  } finally {
    backendRestartInProgress = false;
  }
}
function createMainWindow() {
  installAppMenu({
    app: app,
    Menu: Menu,
    shell: shell,
    getMainWindow: () => mainWindow,
    logDir: LOG_DIR,
    restartBackendAndReload: restartBackendAndReload,
    stopSpawnedServer: stopSpawnedServer
  });
  installLocalApiTokenHeader();
  const {
    isMaximized: _0x579a35,
    ..._0x35c151
  } = readWindowState();
  rendererProjectState = {
    hasUnsavedChanges: false,
    projectName: ""
  };
  mainWindow = new BrowserWindow({
    ..._0x35c151,
    minWidth: 1024,
    minHeight: 720,
    title: APP_DISPLAY_NAME,
    icon: APP_WINDOW_ICON_PATH,
    show: false,
    autoHideMenuBar: true,
    webPreferences: {
      preload: a249_0x815eab.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      backgroundThrottling: false,
      devTools: !app.isPackaged
    }
  });
  installWindowsTaskbarIdentity({
    window: mainWindow,
    appId: APP_USER_MODEL_ID,
    iconPath: APP_WINDOW_ICON_PATH,
    executablePath: process.execPath,
    displayName: APP_DISPLAY_NAME
  });
  installDevReloadShortcuts({
    app: app,
    window: mainWindow
  });
  installWindowStatePersistence(mainWindow);
  installRecoverySnapshotBeforeClose(mainWindow, {
    getRendererProjectState: () => rendererProjectState,
    shouldBypassClose: () => isQuittingForUpdate,
    logEvent: logDiagnosticEvent
  });
  refreshTaskbarProgress();
  mainWindow.on("page-title-updated", _0x5e52fb => {
    _0x5e52fb.preventDefault();
    updateMainWindowUnsavedState(mainWindow);
  });
  mainWindow.once("ready-to-show", () => {
    if (_0x579a35) {
      mainWindow?.maximize();
    }
    mainWindow?.show();
    localRuntimeKeepAlive.start("ready-to-show");
  });
  mainWindow.webContents.on("did-finish-load", () => {
    if (latestUpdaterEvent) {
      mainWindow?.webContents.send("appUpdater:event", latestUpdaterEvent);
    }
    if (pendingExternalProjectOpenRequests.length > 0) {
      mainWindow?.webContents.send("project:externalOpenAvailable");
    }
    screenshotOverlayController.sendGlobalScreenshotShortcutStatus();
    localRuntimeKeepAlive.start("did-finish-load");
  });
  mainWindow.webContents.on("did-fail-load", (_0x4e3e94, _0x3db041, _0xb12011, _0x125a84) => {
    logDiagnosticEvent({
      type: "renderer.load_failed",
      level: "error",
      source: "main",
      message: "Renderer failed to load",
      context: {
        errorCode: _0x3db041,
        errorDescription: _0xb12011,
        url: _0x125a84
      }
    });
  });
  mainWindow.webContents.on("render-process-gone", (_0x506b4b, _0x4888a7 = {}) => {
    logDiagnosticEvent({
      type: "renderer.process_gone",
      level: "error",
      source: "main",
      message: "Renderer process exited unexpectedly",
      context: _0x4888a7
    });
  });
  mainWindow.webContents.setWindowOpenHandler(({
    url: _0x59a8f9
  }) => {
    openExternalUrl(_0x59a8f9);
    return {
      action: "deny"
    };
  });
  mainWindow.webContents.on("will-navigate", (_0x1313ba, _0x3a7e65) => {
    if (isLocalAppUrl(_0x3a7e65)) {
      return;
    }
    _0x1313ba.preventDefault();
    openExternalUrl(_0x3a7e65);
  });
  mainWindow.on("focus", () => void localRuntimeKeepAlive.start("focus"));
  mainWindow.on("show", () => void localRuntimeKeepAlive.start("show"));
  mainWindow.on("restore", () => void localRuntimeKeepAlive.start("restore"));
  mainWindow.on("hide", () => void localRuntimeKeepAlive.refresh("hide"));
  mainWindow.on("minimize", () => void localRuntimeKeepAlive.refresh("minimize"));
  mainWindow.on("closed", () => {
    webPreviewViewManager.disposeViews();
    localRuntimeKeepAlive.stop();
    mainWindow = null;
  });
  mainWindow.on("unresponsive", () => {
    logDiagnosticEvent({
      type: "renderer.unresponsive",
      level: "warn",
      source: "main",
      message: "Renderer became unresponsive"
    });
  });
}
async function startApp() {
  if (isQuittingForUpdate) {
    return;
  }
  installLocalPreviewProtocol();
  scheduleUpdateCheck();
  if (shouldUseChromeShellRuntime(process.env, {
    appIsPackaged: app.isPackaged
  })) {
    if (chromeShellStartupInProgress) {
      return chromeShellStartupSettledPromise;
    }
    chromeShellStartupInProgress = true;
    let _0x34c3e9;
    chromeShellStartupSettledPromise = new Promise(_0x575e8b => {
      _0x34c3e9 = _0x575e8b;
    });
    try {
      if (isChromeShellLaunchActive(chromeShellLaunch) && (await focusMainWindow())) {
        return;
      }
      if (chromeShellLaunch?.detached === true && (await focusChromeShellLaunchWindow({
        launch: chromeShellLaunch,
        env: process.env,
        platform: process.platform
      }))) {
        return;
      }
      chromeShellLaunch = null;
      const _0x4c6d39 = resolveChromeShellBrowserExecutable({
        env: process.env,
        platform: process.platform
      });
      const _0x350f29 = resolveChromeShellBrowserExecutable({
        env: process.env,
        platform: process.platform,
        preferredBrowser: "edge"
      });
      if (!_0x4c6d39 && !_0x350f29) {
        const _0x3f50f8 = await promptForMissingChromeShellBrowser({
          dialogApi: dialog,
          shellApi: shell,
          appName: APP_DISPLAY_NAME
        });
        if (_0x3f50f8 === "electron") {
          process.env.AIC_USE_ELECTRON_CANVAS = "1";
          return startApp();
        }
        app.quit();
        return;
      }
      const _0x2e74e0 = await checkChromeShellBrowserVersionBeforeLaunch({
        browserPath: _0x4c6d39,
        edgeBrowserPath: _0x350f29,
        preferencePath: LEGACY_CHROME_SHELL_BROWSER_CHOICE_PATH,
        env: process.env,
        platform: process.platform,
        logEvent: logDiagnosticEvent
      });
      if (!_0x2e74e0.continueLaunch) {
        if (_0x2e74e0.action === "electron-fallback") {
          const _0x4421e2 = _0x2e74e0.inspection?.reason === "version-unavailable";
          const _0x482357 = await promptForChromeShellStartupFailure({
            dialogApi: dialog,
            shellApi: shell,
            appName: APP_DISPLAY_NAME,
            error: new Error(_0x4421e2 ? "无法读取 Chrome / Edge 版本，不能启动浏览器窗口" : "当前 Chrome / Edge 版本过低，不能启动浏览器窗口")
          });
          if (_0x482357 === "electron") {
            process.env.AIC_USE_ELECTRON_CANVAS = "1";
            return startApp();
          }
        }
        app.quit();
        return;
      }
      if (_0x2e74e0.browserPath && _0x2e74e0.browserPath !== _0x4c6d39) {
        process.env.AIC_CHROME_SHELL_BROWSER = _0x2e74e0.browserPath;
      }
      const _0x50dd8f = randomBytes(16).toString("hex");
      const _0x402083 = resolveChromeShellStartupReadyTimeoutMs(process.env);
      const _0x4d6a51 = await startChromeShellRuntime({
        app: app,
        appUrl: APP_URL,
        env: process.env,
        windowsTaskbarIdentity: {
          appId: APP_USER_MODEL_ID,
          iconPath: APP_WINDOW_ICON_PATH,
          executablePath: process.execPath,
          displayName: APP_DISPLAY_NAME
        },
        displayWorkAreas: screen.getAllDisplays().map(({
          workArea: _0x362362
        }) => ({
          ..._0x362362
        })),
        desktopHttpBridge: desktopHttpBridge,
        startHttpBridge: startDesktopHttpBridge,
        token: LOCAL_ACCESS_TOKEN,
        handlers: mainCapabilityHandlers,
        logEvent: logDiagnosticEvent,
        waitForRendererReady: () => chromeShellStartupHealth.waitForReady({
          startupAttemptId: _0x50dd8f,
          timeoutMs: _0x402083
        }),
        prepare: async () => {
          screenshotOverlayController.installGlobalScreenshotShortcut();
          queueExternalProjectOpenFromArgs(process.argv, "startup");
          await clearPortBeforeStart();
          await ensureServerRunning();
          let _0x5a2b86 = {
            available: false
          };
          try {
            _0x5a2b86 = await legacyRendererStorageMigration.prepare();
          } catch (_0x3c0931) {
            logDiagnosticEvent({
              type: "storage.legacy_renderer_migration_prepare_failed",
              level: "warn",
              source: "main",
              message: "Legacy Electron renderer storage migration could not be prepared",
              error: _0x3c0931
            });
          }
          return {
            appUrl: buildChromeShellStartupMetadataUrl(buildLegacyRendererStorageMigrationAppUrl(APP_URL, _0x5a2b86), {
              startupAttemptId: _0x50dd8f,
              readyTimeoutMs: _0x402083
            })
          };
        },
        onClosed: () => {
          const _0x1372d1 = !isQuittingForUpdate && rendererProjectState.hasUnsavedChanges === true;
          chromeShellBrowserWorker = null;
          chromeShellWebPreviewManager = null;
          chromeShellLaunch = null;
          if (_0x1372d1) {
            setTimeout(() => app.quit(), 1200);
            return false;
          }
          return !isQuittingForUpdate;
        }
      });
      chromeShellLaunch = _0x4d6a51.chromeShellLaunch?.detached === true || isChromeShellLaunchActive(_0x4d6a51.chromeShellLaunch) ? _0x4d6a51.chromeShellLaunch : null;
      chromeShellBrowserWorker = _0x4d6a51.browserWorker;
      desktopHttpBridge = _0x4d6a51.desktopHttpBridge;
      chromeShellWebPreviewManager = _0x4d6a51.webPreviewManager;
      return;
    } finally {
      chromeShellStartupInProgress = false;
      _0x34c3e9();
    }
  }
  installIpcHandlers();
  createMainWindow();
  screenshotOverlayController.installGlobalScreenshotShortcut();
  queueExternalProjectOpenFromArgs(process.argv, "startup");
  await clearPortBeforeStart();
  await ensureServerRunning();
  localRuntimeKeepAlive.start("server-ready");
  loadCanvasWindow();
}
async function handleStartupFailure(_0x4cc11d) {
  console.error("[electron] startup failed:", _0x4cc11d);
  logDiagnosticEvent({
    type: "app.startup_failed",
    level: "error",
    source: "main",
    message: "Application startup failed",
    error: _0x4cc11d
  });
  if (shouldUseChromeShellRuntime(process.env, {
    appIsPackaged: app.isPackaged
  })) {
    chromeShellStartupHealth.cancel("Chrome shell startup failed before renderer readiness");
    const _0x4aeb5b = await promptForChromeShellStartupFailure({
      dialogApi: dialog,
      shellApi: shell,
      appName: APP_DISPLAY_NAME,
      error: _0x4cc11d
    });
    if (_0x4aeb5b === "electron") {
      const _0x582e4d = _0x4cc11d?.code === "CHROME_SHELL_RENDERER_READY_TIMEOUT";
      logDiagnosticEvent({
        type: _0x582e4d ? "chrome_shell.renderer_ready_timeout_fallback" : "chrome_shell.early_exit_fallback",
        level: "error",
        source: "main",
        message: _0x582e4d ? "Chrome shell renderer readiness timed out; user selected Electron compatibility mode" : "Chrome shell startup failed; user selected Electron compatibility mode",
        error: _0x4cc11d
      });
      process.env.AIC_USE_ELECTRON_CANVAS = "1";
      try {
        await startApp();
        return;
      } catch (_0x5a445b) {
        console.error("[electron] Electron compatibility fallback failed:", _0x5a445b);
      }
    } else {
      app.quit();
      return;
    }
  }
  loadStartupStatus({
    kind: "error",
    title: APP_DISPLAY_NAME + " 启动失败",
    detail: "应用启动时遇到问题。",
    hint: "请重启应用，若仍失败请导出诊断日志。"
  });
}
function installAppLifecycleHandlers() {
  a249_0x1be7ae.on("before-quit-for-update", markQuittingForUpdate);
  app.on("open-file", (_0x560d91, _0x4ca3a5) => {
    _0x560d91.preventDefault();
    queueExternalProjectOpenPath(_0x4ca3a5, "open-file");
    if (shouldUseChromeShellRuntime(process.env, {
      appIsPackaged: app.isPackaged
    })) {
      startApp().catch(handleStartupFailure);
      return;
    }
    focusMainWindow();
  });
  app.whenReady().then(() => {
    startApp().catch(handleStartupFailure);
  });
  app.on("second-instance", (_0x4680c5, _0x200d79) => {
    queueExternalProjectOpenFromArgs(_0x200d79, "second-instance");
    if (shouldUseChromeShellRuntime(process.env, {
      appIsPackaged: app.isPackaged
    })) {
      startApp().catch(handleStartupFailure);
      return;
    }
    focusMainWindow();
  });
  app.on("activate", () => {
    const _0x9800da = async () => {
      if (shouldUseChromeShellRuntime(process.env, {
        appIsPackaged: app.isPackaged
      })) {
        await startApp();
        return;
      }
      if (await focusMainWindow()) {
        return;
      }
      if (BrowserWindow.getAllWindows().length === 0) {
        await startApp();
      }
    };
    _0x9800da().catch(_0x2d1589 => {
      console.error("[electron] activate failed:", _0x2d1589);
      logDiagnosticEvent({
        type: "app.activate_failed",
        level: "error",
        source: "main",
        message: "Application activate failed",
        error: _0x2d1589
      });
    });
  });
  app.on("window-all-closed", () => {
    if (shouldQuitWhenAllElectronWindowsClosed({
      platform: process.platform,
      useChromeShellRuntime: shouldUseChromeShellRuntime(process.env, {
        appIsPackaged: app.isPackaged
      })
    })) {
      app.quit();
    }
  });
  app.on("before-quit", () => {
    try {
      const _0x9cb82f = chromeShellLaunch?.process;
      if (_0x9cb82f && _0x9cb82f.exitCode === null && !_0x9cb82f.killed) {
        _0x9cb82f.kill?.();
      }
    } catch {}
    screenshotOverlayController.destroyScreenshotOverlayWindow();
    foregroundDialogs.destroyOwnerWindow();
    localRuntimeKeepAlive.stop();
    chromeShellWebPreviewManager?.dispose?.();
    chromeShellWebPreviewManager = null;
    chromeShellBrowserWorker?.dispose?.();
    chromeShellBrowserWorker = null;
    desktopHttpBridge?.close?.();
    desktopHttpBridge = null;
    stopSpawnedServer();
    stopAllPowerSaveBlockers();
  });
  app.on("will-quit", () => {
    screenshotOverlayController.uninstallGlobalScreenshotShortcut();
  });
}
if (GOT_SINGLE_INSTANCE_LOCK) {
  installAppLifecycleHandlers();
}
process.on("uncaughtException", _0x539c95 => {
  logDiagnosticEvent({
    type: "main.uncaught_exception",
    level: "error",
    source: "main",
    message: "Uncaught exception in Electron main process",
    error: _0x539c95
  });
  console.error("[electron] uncaught exception:", _0x539c95);
});
process.on("unhandledRejection", _0x3d183a => {
  logDiagnosticEvent({
    type: "main.unhandled_rejection",
    level: "error",
    source: "main",
    message: "Unhandled rejection in Electron main process",
    error: _0x3d183a instanceof Error ? _0x3d183a : null,
    context: _0x3d183a instanceof Error ? {} : {
      reason: String(_0x3d183a)
    }
  });
  console.error("[electron] unhandled rejection:", _0x3d183a);
});
