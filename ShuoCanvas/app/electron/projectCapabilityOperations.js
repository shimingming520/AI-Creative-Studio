import a265_0x4349aa from "node:path";
import { mkdirSync, statSync } from "node:fs";
import * as a265_0x3d54b9 from "../src/services/desktopProjectFileStore.js";
function normalizeProjectPayload(_0x9e7cce) {
  return _0x9e7cce || {};
}
function normalizeOperationContext(_0x2d2c01) {
  return _0x2d2c01 || {};
}
function formatOperationError(_0x52d4e1) {
  return String(_0x52d4e1?.message || _0x52d4e1);
}
function normalizePositiveTimestamp(_0x41f1b1) {
  const _0x4fb2c9 = Number(_0x41f1b1);
  if (Number.isFinite(_0x4fb2c9) && _0x4fb2c9 > 0) {
    return Math.round(_0x4fb2c9);
  } else {
    return 0;
  }
}
export function buildProjectOpenResponse(_0x3cef83, _0x512764, _0x8a442f, {
  stripProjectFileExtension = a265_0x3d54b9.stripProjectFileExtension
} = {}) {
  const _0x571420 = _0x8a442f?.filename || a265_0x4349aa.basename(_0x3cef83);
  const _0x3d4aac = _0x8a442f?.name || stripProjectFileExtension(_0x571420);
  return {
    success: true,
    canceled: false,
    projectId: stripProjectFileExtension(_0x571420),
    projectName: _0x3d4aac,
    filename: _0x571420,
    recentId: _0x8a442f?.recentId || "",
    displayPath: _0x8a442f?.displayPath || _0x3cef83,
    lastModified: Number(_0x8a442f?.lastModified || 0) || 0,
    data: _0x512764
  };
}
export function createProjectCapabilityOperations({
  exportDesktopProjectPackage: _0xc475b3,
  importDesktopProjectPackage: _0x382057,
  handleRendererUnsavedState: _0x33cd07,
  getRecentProjectsStorePath: _0x2186d0,
  syncSystemRecentDocumentsBestEffort: _0x14e725,
  pendingExternalProjectOpenRequests: _0x326f93,
  getCanvasProjectDir: _0x39390a,
  showOpenDialog: _0x5afcb8,
  showSaveDialog: _0x2ff50c,
  projectFileStore = a265_0x3d54b9,
  supportedProjectFileExtensions = a265_0x3d54b9.SUPPORTED_PROJECT_FILE_EXTENSIONS,
  getRecoverySnapshotPath: _0x211bab,
  writeRecoverySnapshotFile: _0xffd984,
  getRecoverySnapshotFileInfo: _0x32680e,
  readRecoverySnapshotFile: _0x120b21,
  removeRecoverySnapshotFile: _0x32eca0,
  statPath = statSync
} = {}) {
  function _0xd49243() {
    return [{
      name: "SHUO Canvas Project",
      extensions: supportedProjectFileExtensions.map(_0x4fa938 => String(_0x4fa938 || "").replace(/^\./, ""))
    }];
  }
  function _0x17d5d3(_0x347368, {
    source = "dialog"
  } = {}) {
    const _0x4b16f8 = a265_0x4349aa.resolve(String(_0x347368 || ""));
    const _0x5457b3 = projectFileStore.readProjectJson(_0x4b16f8);
    const _0x2c5996 = projectFileStore.upsertRecentProject(_0x2186d0(), _0x4b16f8, {
      name: projectFileStore.stripProjectFileExtension(a265_0x4349aa.basename(_0x4b16f8))
    });
    _0x14e725();
    return {
      ...buildProjectOpenResponse(_0x4b16f8, _0x5457b3, _0x2c5996, {
        stripProjectFileExtension: projectFileStore.stripProjectFileExtension
      }),
      source: source
    };
  }
  function _0x39f50f(_0x38451c) {
    const _0x56f199 = String(_0x38451c || "").trim();
    if (!_0x56f199 || !a265_0x4349aa.isAbsolute(_0x56f199)) {
      return 0;
    }
    try {
      const _0x1294fa = statPath(_0x56f199);
      if (_0x1294fa.isFile()) {
        return Math.round(_0x1294fa.mtimeMs);
      } else {
        return 0;
      }
    } catch {
      return 0;
    }
  }
  function _0x437f08(_0x21cf84 = {}, _0x4e8532 = {}) {
    const _0x2da023 = [normalizePositiveTimestamp(_0x21cf84?.lastKnownProjectLastModified ?? _0x21cf84?.lastModified)];
    const _0x1d233e = String(_0x21cf84?.recentId || _0x4e8532?.recentId || "").trim();
    if (_0x1d233e) {
      const _0x4d4cad = projectFileStore.findRecentProject(_0x2186d0(), _0x1d233e);
      _0x2da023.push(normalizePositiveTimestamp(_0x4d4cad?.lastModified));
      _0x2da023.push(_0x39f50f(_0x4d4cad?.path));
    }
    _0x2da023.push(_0x39f50f(_0x21cf84?.displayPath));
    _0x2da023.push(_0x39f50f(_0x4e8532?.displayPath));
    return Math.max(0, ..._0x2da023);
  }
  return Object.freeze({
    async open(_0x10d026) {
      const _0x5e49f7 = normalizeProjectPayload(_0x10d026);
      const _0x18c1cd = _0x2186d0();
      const _0x4cb9ea = String(_0x5e49f7?.recentId || "").trim();
      let _0x3e0d68 = "";
      if (_0x4cb9ea) {
        const _0x13a5b6 = projectFileStore.findRecentProject(_0x18c1cd, _0x4cb9ea);
        if (!_0x13a5b6) {
          throw new Error("最近项目不存在");
        }
        if (!_0x13a5b6.exists) {
          throw new Error("最近项目文件不存在");
        }
        _0x3e0d68 = _0x13a5b6.path;
      } else {
        mkdirSync(_0x39390a(), {
          recursive: true
        });
        const _0x5e1f14 = await _0x5afcb8({
          title: "打开项目",
          defaultPath: _0x39390a(),
          properties: ["openFile"],
          filters: _0xd49243()
        });
        if (_0x5e1f14.canceled || !_0x5e1f14.filePaths?.[0]) {
          return {
            success: false,
            canceled: true
          };
        }
        _0x3e0d68 = _0x5e1f14.filePaths[0];
      }
      return _0x17d5d3(_0x3e0d68, {
        source: _0x4cb9ea ? "recent" : "dialog"
      });
    },
    async save(_0xf6b6a9) {
      const _0x27eedb = normalizeProjectPayload(_0xf6b6a9);
      const _0x11c421 = _0x2186d0();
      const _0x56733a = String(_0x27eedb?.mode || "save").trim() === "saveAs" ? "saveAs" : "save";
      const _0x4f9dd4 = projectFileStore.sanitizeProjectName(_0x27eedb?.projectName || _0x27eedb?.projectId || "未命名画布");
      let _0x43d6d1 = "";
      if (_0x56733a === "save") {
        const _0x49e296 = String(_0x27eedb?.recentId || "").trim();
        const _0x371fd8 = _0x49e296 ? projectFileStore.findRecentProject(_0x11c421, _0x49e296) : null;
        _0x43d6d1 = _0x371fd8?.path || projectFileStore.buildDefaultProjectPath(_0x39390a(), _0x4f9dd4);
      } else {
        mkdirSync(_0x39390a(), {
          recursive: true
        });
        const _0x4207d6 = await _0x2ff50c({
          title: "另存为项目",
          defaultPath: projectFileStore.buildDefaultProjectPath(_0x39390a(), _0x4f9dd4),
          filters: _0xd49243()
        });
        if (_0x4207d6.canceled || !_0x4207d6.filePath) {
          return {
            success: false,
            canceled: true
          };
        }
        _0x43d6d1 = projectFileStore.withJsonProjectExtension(_0x4207d6.filePath);
      }
      projectFileStore.writeProjectJson(_0x43d6d1, _0x27eedb?.multiData || {}, {
        allowEmptyOverwrite: _0x27eedb?.allowEmptyOverwrite === true
      });
      const _0x1aae8d = projectFileStore.upsertRecentProject(_0x11c421, _0x43d6d1, {
        name: _0x4f9dd4
      });
      _0x14e725();
      return {
        success: true,
        canceled: false,
        projectId: projectFileStore.stripProjectFileExtension(_0x1aae8d.filename || ""),
        projectName: _0x1aae8d.name,
        filename: _0x1aae8d.filename,
        recentId: _0x1aae8d.recentId,
        displayPath: _0x1aae8d.displayPath,
        lastModified: _0x1aae8d.lastModified
      };
    },
    openPath(_0x18605c, _0x1212fa) {
      return _0x17d5d3(_0x18605c, _0x1212fa);
    },
    exportPackage(_0x1f7903, _0x4062cc) {
      return _0xc475b3(normalizeProjectPayload(_0x1f7903), normalizeOperationContext(_0x4062cc));
    },
    importPackage(_0x1b0a77, _0x3337e3) {
      return _0x382057(normalizeProjectPayload(_0x1b0a77), normalizeOperationContext(_0x3337e3));
    },
    setUnsavedState(_0x1f9221) {
      return _0x33cd07(normalizeProjectPayload(_0x1f9221));
    },
    listRecent() {
      return projectFileStore.listRecentProjects(_0x2186d0());
    },
    removeRecent(_0x5688e4) {
      const _0x3854e5 = normalizeProjectPayload(_0x5688e4).recentId || "";
      const _0x3ac510 = projectFileStore.removeRecentProject(_0x2186d0(), _0x3854e5);
      _0x14e725();
      return _0x3ac510;
    },
    consumeExternalOpenRequests() {
      return _0x326f93.splice(0, _0x326f93.length);
    },
    writeRecoverySnapshot(_0x49d47a) {
      try {
        const _0xa14444 = _0xffd984(_0x211bab(), normalizeProjectPayload(_0x49d47a));
        return {
          success: true,
          savedAt: _0xa14444.savedAt,
          projectId: _0xa14444.projectId,
          projectName: _0xa14444.projectName
        };
      } catch (_0x5d775e) {
        return {
          success: false,
          error: formatOperationError(_0x5d775e)
        };
      }
    },
    getRecoverySnapshotInfo(_0xe974c7) {
      try {
        const _0x4d1e88 = _0x211bab();
        const _0x56b787 = _0x120b21(_0x4d1e88);
        const _0x36c257 = _0x437f08(normalizeProjectPayload(_0xe974c7), _0x56b787 || {});
        return _0x32680e(_0x4d1e88, {
          currentLastModified: _0x36c257
        });
      } catch (_0xb2ad22) {
        return {
          exists: false,
          isNewerThanProject: false,
          savedAt: 0,
          currentLastModified: 0,
          error: formatOperationError(_0xb2ad22)
        };
      }
    },
    readRecoverySnapshot() {
      try {
        const _0x31b45a = _0x120b21(_0x211bab());
        if (!_0x31b45a) {
          return {
            success: false,
            exists: false,
            canceled: false
          };
        }
        return {
          success: true,
          exists: true,
          canceled: false,
          recovery: true,
          projectId: _0x31b45a.projectId,
          projectName: _0x31b45a.projectName,
          filename: _0x31b45a.filename,
          recentId: _0x31b45a.recentId,
          displayPath: _0x31b45a.displayPath,
          lastModified: _0x31b45a.lastKnownProjectLastModified,
          recoverySavedAt: _0x31b45a.savedAt,
          data: _0x31b45a.data
        };
      } catch (_0x5a566e) {
        return {
          success: false,
          exists: false,
          error: formatOperationError(_0x5a566e)
        };
      }
    },
    clearRecoverySnapshot() {
      try {
        _0x32eca0(_0x211bab());
        return {
          success: true
        };
      } catch (_0x3a7a01) {
        return {
          success: false,
          error: formatOperationError(_0x3a7a01)
        };
      }
    }
  });
}