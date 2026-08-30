import a266_0x22ef55 from "node:path";
import { PROJECT_PACKAGE_FILE_EXTENSION, exportProjectPackageToPath, importProjectPackageFromPath, withProjectPackageExtension } from "./projectPackageService.js";
import { sanitizeProjectName } from "../src/services/desktopProjectFileStore.js";
function trimText(_0x3a4799) {
  return String(_0x3a4799 || "").trim();
}
function getProjectPackageDialogFilters() {
  return [{
    name: "SHUO Canvas Project Package",
    extensions: [PROJECT_PACKAGE_FILE_EXTENSION.replace(/^\./, "")]
  }];
}
function resolveProjectPackageImportPath(_0x388d34 = {}) {
  const _0x335249 = trimText(_0x388d34?.path);
  if (!_0x335249) {
    return "";
  }
  if (!a266_0x22ef55.isAbsolute(_0x335249)) {
    throw new Error("项目包路径必须是绝对路径");
  }
  if (a266_0x22ef55.extname(_0x335249).toLowerCase() !== PROJECT_PACKAGE_FILE_EXTENSION) {
    throw new Error("只支持 .aicpkg 项目包");
  }
  return a266_0x22ef55.resolve(_0x335249);
}
function toProjectPackageBlockedResult(_0x1415f8) {
  const _0x5d2446 = String(_0x1415f8?.code || "");
  if (_0x5d2446 === "MISSING_LOCAL_ASSETS") {
    const _0x2e8344 = Array.isArray(_0x1415f8?.missing) ? _0x1415f8.missing.filter(Boolean) : [];
    return {
      success: false,
      canceled: false,
      blocked: true,
      code: _0x5d2446,
      message: "收集失败：当前项目引用的本地素材文件不存在",
      missing: _0x2e8344
    };
  }
  if (_0x5d2446 === "REMOTE_MEDIA_NOT_LOCALIZED") {
    const _0xd37f90 = Array.isArray(_0x1415f8?.remoteMedia) ? _0x1415f8.remoteMedia.filter(Boolean) : [];
    return {
      success: false,
      canceled: false,
      blocked: true,
      code: _0x5d2446,
      message: "收集失败：当前项目还有未本地化的远程素材",
      remoteMedia: _0xd37f90
    };
  }
  return null;
}
function normalizeProgressPayload(_0x1f13fc = {}) {
  const _0x234f91 = Number(_0x1f13fc?.progress);
  const _0xf98ee2 = Number(_0x1f13fc?.current);
  const _0x378f91 = Number(_0x1f13fc?.total);
  return {
    phase: trimText(_0x1f13fc?.phase) || "working",
    message: trimText(_0x1f13fc?.message),
    progress: Number.isFinite(_0x234f91) ? Math.max(0, Math.min(1, _0x234f91)) : null,
    current: Number.isFinite(_0xf98ee2) ? _0xf98ee2 : null,
    total: Number.isFinite(_0x378f91) ? _0x378f91 : null
  };
}
function emitPackageProgress(_0x230da8, _0x1340ce, _0x36bbf7 = {}, _0x1b5793 = null) {
  const _0x5c7b5f = trimText(_0x1340ce);
  if (!_0x5c7b5f) {
    return;
  }
  const _0x5abc4a = {
    operationId: _0x5c7b5f,
    ...normalizeProgressPayload(_0x36bbf7)
  };
  if (_0x230da8 && typeof _0x230da8.send === "function") {
    _0x230da8.send("project:packageProgress", _0x5abc4a);
  }
  if (typeof _0x1b5793 === "function") {
    _0x1b5793(_0x5abc4a);
  }
}
function showSaveDialog(_0x53780e, _0x98e21, _0x5dcc62) {
  if (_0x98e21) {
    return _0x53780e.showSaveDialog(_0x98e21, _0x5dcc62);
  } else {
    return _0x53780e.showSaveDialog(_0x5dcc62);
  }
}
function showOpenDialog(_0x13526, _0x4bba98, _0x4bd4af) {
  if (_0x4bba98) {
    return _0x13526.showOpenDialog(_0x4bba98, _0x4bd4af);
  } else {
    return _0x13526.showOpenDialog(_0x4bd4af);
  }
}
export function createProjectPackageController({
  app: _0x5bd9f0,
  dialog: _0xfbf155,
  getMainWindow = () => null,
  getCanvasProjectDir: _0x1b9ce5,
  getOutputDir: _0x35d1a5,
  getUploadsDir: _0x42a5a5,
  getAssetsDir: _0x451629,
  getWorkflowsDir: _0x35ef21,
  readAppVersion: _0x2e2b92,
  upsertRecentProject: _0x262bad,
  getRecentProjectsStorePath: _0x60ff92,
  syncSystemRecentDocumentsBestEffort: _0x3934e4,
  buildProjectOpenResponse: _0x4bed8c,
  showSaveDialog: _0x3bef7e,
  showOpenDialog: _0x4d57bc
} = {}) {
  const _0x332511 = () => ({
    canvasRoot: _0x1b9ce5(),
    outputRoot: _0x35d1a5(),
    uploadsRoot: _0x42a5a5(),
    assetsRoot: _0x451629(),
    workflowsRoot: _0x35ef21(),
    workflowThumbsRoot: a266_0x22ef55.join(_0x35ef21(), "thumbs")
  });
  const _0x24e694 = _0x3e7967 => {
    const _0x47402e = sanitizeProjectName(_0x3e7967 || "未命名画布");
    let _0x446ba3 = "";
    try {
      _0x446ba3 = _0x5bd9f0.getPath("downloads");
    } catch {}
    return a266_0x22ef55.join(_0x446ba3 || _0x1b9ce5(), "" + _0x47402e + PROJECT_PACKAGE_FILE_EXTENSION);
  };
  const _0x45c78a = async (_0x5cdf57 = {}, _0x4186c5 = {}) => {
    const _0x64957b = sanitizeProjectName(_0x5cdf57?.projectName || _0x5cdf57?.projectId || "未命名画布");
    const _0x1e3958 = trimText(_0x5cdf57?.operationId);
    const _0x47545a = _0x4186c5?.sender || null;
    const _0xef45e8 = typeof _0x3bef7e === "function" ? _0x3bef7e : _0x4798db => showSaveDialog(_0xfbf155, getMainWindow(), _0x4798db);
    const _0x3dcf77 = await _0xef45e8({
      title: "收集当前项目",
      defaultPath: _0x24e694(_0x64957b),
      filters: getProjectPackageDialogFilters()
    });
    if (_0x3dcf77.canceled || !_0x3dcf77.filePath) {
      return {
        success: false,
        canceled: true
      };
    }
    try {
      return await exportProjectPackageToPath({
        outputPath: withProjectPackageExtension(_0x3dcf77.filePath),
        multiData: _0x5cdf57?.multiData || {},
        projectId: _0x5cdf57?.projectId || "",
        projectName: _0x64957b,
        appVersion: _0x2e2b92(),
        roots: _0x332511(),
        onProgress: _0x227731 => emitPackageProgress(_0x47545a, _0x1e3958, _0x227731, _0x4186c5?.onProgress)
      });
    } catch (_0x5e19bd) {
      const _0x13e39b = toProjectPackageBlockedResult(_0x5e19bd);
      if (_0x13e39b) {
        return _0x13e39b;
      }
      throw _0x5e19bd;
    }
  };
  const _0xd1c4b4 = async (_0x44e6cb = {}, _0x2b3bfd = {}) => {
    const _0x2a99ba = trimText(_0x44e6cb?.operationId);
    const _0x41c0ec = _0x2b3bfd?.sender || null;
    let _0x15dec7 = resolveProjectPackageImportPath(_0x44e6cb);
    if (!_0x15dec7) {
      const _0x5e78e2 = typeof _0x4d57bc === "function" ? _0x4d57bc : _0x38e659 => showOpenDialog(_0xfbf155, getMainWindow(), _0x38e659);
      const _0x33e7d5 = await _0x5e78e2({
        title: "加载项目包",
        defaultPath: _0x1b9ce5(),
        properties: ["openFile"],
        filters: getProjectPackageDialogFilters()
      });
      if (_0x33e7d5.canceled || !_0x33e7d5.filePaths?.[0]) {
        return {
          success: false,
          canceled: true
        };
      }
      _0x15dec7 = _0x33e7d5.filePaths[0];
    }
    emitPackageProgress(_0x41c0ec, _0x2a99ba, {
      phase: "importing",
      message: "正在读取项目包..."
    }, _0x2b3bfd?.onProgress);
    const _0x22e28b = await importProjectPackageFromPath({
      packagePath: _0x15dec7,
      roots: _0x332511(),
      projectRoot: _0x1b9ce5(),
      tempRoot: _0x5bd9f0.getPath("temp")
    });
    const _0x147227 = _0x262bad(_0x60ff92(), _0x22e28b.projectPath, {
      name: _0x22e28b.projectName
    });
    _0x3934e4();
    return {
      ..._0x4bed8c(_0x22e28b.projectPath, _0x22e28b.data, _0x147227),
      source: _0x44e6cb?.path ? "package-drop" : "package-dialog",
      imported: true,
      packagePath: _0x15dec7,
      assetsCount: _0x22e28b.assetsCount
    };
  };
  return {
    exportDesktopProjectPackage: _0x45c78a,
    importDesktopProjectPackage: _0xd1c4b4
  };
}