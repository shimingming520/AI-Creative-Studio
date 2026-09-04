import { createHash } from "node:crypto";
import { closeSync, copyFileSync, existsSync, fsyncSync, mkdirSync, openSync, readFileSync, renameSync, statSync, unlinkSync, writeFileSync } from "node:fs";
import a1531_0x41f7da from "node:path";
import { t } from "../i18n/index.js";
export const PROJECT_RECENTS_VERSION = 1;
export const PROJECT_RECENTS_LIMIT = 20;
export const RECOVERY_SNAPSHOT_VERSION = 1;
export const DEFAULT_PROJECT_FILE_EXTENSION = ".aicanvas";
export const PROJECT_BACKUP_LIMIT = 5;
export const SUPPORTED_PROJECT_FILE_EXTENSIONS = Object.freeze([".aicanvas", ".aicproj", ".json"]);
export const ASSOCIATED_PROJECT_FILE_EXTENSIONS = Object.freeze(["aicanvas", "aicproj"]);
function isPlainObject(_0x49f126) {
  return !!_0x49f126 && typeof _0x49f126 === "object" && !Array.isArray(_0x49f126);
}
function normalizeComparablePath(_0x31e001) {
  const _0x5cf186 = a1531_0x41f7da.resolve(String(_0x31e001 || ""));
  if (process.platform === "win32" || process.platform === "darwin") {
    return _0x5cf186.toLowerCase();
  } else {
    return _0x5cf186;
  }
}
function stripUtf8Bom(_0x4b52ef) {
  return String(_0x4b52ef || "").replace(/^\uFEFF/, "");
}
function readProjectJsonFile(_0xd53952) {
  const _0x40006f = JSON.parse(stripUtf8Bom(readFileSync(_0xd53952, "utf8")));
  if (!isPlainObject(_0x40006f)) {
    throw new Error("Project JSON must be an object");
  }
  if ("canvases" in _0x40006f && !Array.isArray(_0x40006f.canvases)) {
    throw new Error("Project canvases must be an array");
  }
  return _0x40006f;
}
function projectBackupPath(_0x5a864e, _0x22d17f = 0) {
  if (_0x22d17f === 0) {
    return _0x5a864e + ".bak";
  } else {
    return _0x5a864e + ".bak." + _0x22d17f;
  }
}
function readValidProjectBackup(_0x42b12d) {
  for (let _0x26cb68 = 0; _0x26cb68 < PROJECT_BACKUP_LIMIT; _0x26cb68 += 1) {
    const _0x5a0b17 = projectBackupPath(_0x42b12d, _0x26cb68);
    if (!existsSync(_0x5a0b17)) {
      continue;
    }
    try {
      return readProjectJsonFile(_0x5a0b17);
    } catch {}
  }
  return null;
}
function projectHasMeaningfulContent(_0x3f6087) {
  if (!isPlainObject(_0x3f6087)) {
    return false;
  }
  if (Array.isArray(_0x3f6087.canvases)) {
    return _0x3f6087.canvases.some(_0x39e320 => {
      if (!isPlainObject(_0x39e320)) {
        return false;
      }
      return ["nodes", "edges", "assets", "storyboard3dProjects"].some(_0x1131ea => {
        const _0x463e18 = _0x39e320[_0x1131ea];
        return (Array.isArray(_0x463e18) || isPlainObject(_0x463e18)) && Object.keys(_0x463e18).length > 0;
      });
    });
  }
  return ["nodes", "edges", "assets", "storyboard3dProjects"].some(_0x5e300e => {
    const _0x234421 = _0x3f6087[_0x5e300e];
    return (Array.isArray(_0x234421) || isPlainObject(_0x234421)) && Object.keys(_0x234421).length > 0;
  });
}
function writeTextAtomically(_0x2674e0, _0x2470a6) {
  mkdirSync(a1531_0x41f7da.dirname(_0x2674e0), {
    recursive: true
  });
  const _0x5b61ec = _0x2674e0 + ".tmp-" + process.pid + "-" + Date.now() + "-" + Math.random().toString(16).slice(2);
  let _0x295bf4 = null;
  try {
    writeFileSync(_0x5b61ec, _0x2470a6, "utf8");
    _0x295bf4 = openSync(_0x5b61ec, "r+");
    fsyncSync(_0x295bf4);
    closeSync(_0x295bf4);
    _0x295bf4 = null;
    renameSync(_0x5b61ec, _0x2674e0);
  } finally {
    if (_0x295bf4 !== null) {
      try {
        closeSync(_0x295bf4);
      } catch {}
    }
    if (existsSync(_0x5b61ec)) {
      try {
        unlinkSync(_0x5b61ec);
      } catch {}
    }
  }
}
function rotateProjectBackups(_0x50f9c3, _0x2b2dba) {
  for (let _0xafe2ac = PROJECT_BACKUP_LIMIT - 1; _0xafe2ac > 0; _0xafe2ac -= 1) {
    const _0x4e61d9 = projectBackupPath(_0x50f9c3, _0xafe2ac - 1);
    if (!existsSync(_0x4e61d9)) {
      continue;
    }
    copyFileSync(_0x4e61d9, projectBackupPath(_0x50f9c3, _0xafe2ac));
  }
  writeTextAtomically(projectBackupPath(_0x50f9c3), JSON.stringify(_0x2b2dba, null, 2) + "\n");
}
function preserveCorruptProjectFile(_0x5beec4) {
  let _0x3694f0 = 0;
  let _0x2eedd5 = "";
  do {
    const _0x70bb85 = _0x3694f0 > 0 ? "-" + _0x3694f0 : "";
    _0x2eedd5 = _0x5beec4 + ".corrupt-" + Date.now() + _0x70bb85;
    _0x3694f0 += 1;
  } while (existsSync(_0x2eedd5));
  copyFileSync(_0x5beec4, _0x2eedd5);
  return _0x2eedd5;
}
function normalizeTimestamp(_0x382d67, _0x203b78 = 0) {
  const _0x432aad = Number(_0x382d67);
  if (Number.isFinite(_0x432aad) && _0x432aad > 0) {
    return Math.round(_0x432aad);
  } else {
    return _0x203b78;
  }
}
export function isSupportedProjectFileExtension(_0x46c38f) {
  const _0x11ae6f = a1531_0x41f7da.extname(String(_0x46c38f || "")).toLowerCase();
  return SUPPORTED_PROJECT_FILE_EXTENSIONS.includes(_0x11ae6f);
}
export function stripProjectFileExtension(_0x2e56ee) {
  const _0x17e42d = String(_0x2e56ee || "");
  const _0x4ec713 = a1531_0x41f7da.extname(_0x17e42d).toLowerCase();
  if (SUPPORTED_PROJECT_FILE_EXTENSIONS.includes(_0x4ec713)) {
    return _0x17e42d.slice(0, -_0x4ec713.length);
  } else {
    return _0x17e42d;
  }
}
export function sanitizeProjectName(_0x496307) {
  const _0x254e14 = t("coreServices.projectFile.unnamedCanvas");
  const _0x2b7e6f = String(_0x496307 || "").trim() || _0x254e14;
  return _0x2b7e6f.replace(/[\\/:*?"<>|]/g, "_").replace(/\s+/g, " ").trim() || _0x254e14;
}
export function sanitizeProjectFilename(_0x1c0310) {
  const _0x2eee6a = sanitizeProjectName(stripProjectFileExtension(_0x1c0310));
  return "" + _0x2eee6a + DEFAULT_PROJECT_FILE_EXTENSION;
}
export function withJsonProjectExtension(_0x322517) {
  const _0x4d8381 = String(_0x322517 || "").trim();
  if (!_0x4d8381) {
    return _0x4d8381;
  }
  if (a1531_0x41f7da.extname(_0x4d8381)) {
    return _0x4d8381;
  } else {
    return "" + _0x4d8381 + DEFAULT_PROJECT_FILE_EXTENSION;
  }
}
export function assertJsonProjectPath(_0x2ce19f, {
  mustExist = false
} = {}) {
  const _0xcfdc3a = String(_0x2ce19f || "").trim();
  if (!_0xcfdc3a) {
    throw new Error("Project path is required");
  }
  if (!a1531_0x41f7da.isAbsolute(_0xcfdc3a)) {
    throw new Error("Project path must be absolute");
  }
  if (!isSupportedProjectFileExtension(_0xcfdc3a)) {
    throw new Error("Only .aicanvas, .aicproj, or .json project files are supported");
  }
  if (mustExist) {
    const _0x3f7043 = statSync(_0xcfdc3a);
    if (!_0x3f7043.isFile()) {
      throw new Error("Project path is not a file");
    }
  }
  return a1531_0x41f7da.resolve(_0xcfdc3a);
}
export function findFirstSupportedProjectPathFromArgs(_0x2304d4, {
  mustExist = true
} = {}) {
  const _0x2d8228 = Array.isArray(_0x2304d4) ? _0x2304d4 : [];
  for (const _0x5c5c7b of _0x2d8228) {
    const _0x1d93b5 = String(_0x5c5c7b || "").trim().replace(/^"|"$/g, "");
    if (!_0x1d93b5 || !a1531_0x41f7da.isAbsolute(_0x1d93b5)) {
      continue;
    }
    if (!isSupportedProjectFileExtension(_0x1d93b5)) {
      continue;
    }
    try {
      return assertJsonProjectPath(_0x1d93b5, {
        mustExist: mustExist
      });
    } catch {}
  }
  return "";
}
export function readProjectJson(_0x4b9c11) {
  const _0x477a86 = assertJsonProjectPath(_0x4b9c11);
  try {
    return readProjectJsonFile(_0x477a86);
  } catch (_0x309142) {
    const _0x55f32e = readValidProjectBackup(_0x477a86);
    if (_0x55f32e) {
      return _0x55f32e;
    }
    throw _0x309142;
  }
}
export function buildProjectFilePayload(_0x95b38b) {
  if (!isPlainObject(_0x95b38b)) {
    throw new Error("Project data must be an object");
  }
  if (Array.isArray(_0x95b38b.canvases)) {
    return {
      canvases: _0x95b38b.canvases,
      activeCanvasId: String(_0x95b38b.activeCanvasId || _0x95b38b.canvases[0]?.id || "canvas_1")
    };
  }
  return {
    nodes: isPlainObject(_0x95b38b.nodes) || Array.isArray(_0x95b38b.nodes) ? _0x95b38b.nodes : [],
    edges: isPlainObject(_0x95b38b.edges) || Array.isArray(_0x95b38b.edges) ? _0x95b38b.edges : [],
    viewport: isPlainObject(_0x95b38b.viewport) ? _0x95b38b.viewport : {}
  };
}
export function writeProjectJson(_0x230ac8, _0x5e5527, {
  allowEmptyOverwrite = false
} = {}) {
  const _0x4c5c0b = assertJsonProjectPath(_0x230ac8);
  const _0x3c5dcb = buildProjectFilePayload(_0x5e5527);
  mkdirSync(a1531_0x41f7da.dirname(_0x4c5c0b), {
    recursive: true
  });
  if (existsSync(_0x4c5c0b)) {
    let _0x3f8190 = null;
    let _0x11d58b = false;
    try {
      _0x3f8190 = readProjectJsonFile(_0x4c5c0b);
    } catch (_0x1d2f48) {
      _0x3f8190 = readValidProjectBackup(_0x4c5c0b);
      if (!_0x3f8190) {
        throw new Error("Project data is corrupted and has no valid backup: " + (_0x1d2f48?.message || _0x1d2f48));
      }
      _0x11d58b = true;
    }
    if (allowEmptyOverwrite !== true && projectHasMeaningfulContent(_0x3f8190) && !projectHasMeaningfulContent(_0x3c5dcb)) {
      throw new Error("Refusing to replace a non-empty project with an empty snapshot");
    }
    if (_0x11d58b) {
      preserveCorruptProjectFile(_0x4c5c0b);
    } else {
      rotateProjectBackups(_0x4c5c0b, _0x3f8190);
    }
  }
  writeTextAtomically(_0x4c5c0b, JSON.stringify(_0x3c5dcb, null, 2) + "\n");
  return _0x3c5dcb;
}
export function buildRecoverySnapshotPayload(_0x2b62bd = {}, {
  now = Date.now()
} = {}) {
  const _0x28bc69 = isPlainObject(_0x2b62bd?.data) ? _0x2b62bd.data : _0x2b62bd?.multiData;
  const _0x94e7e2 = buildProjectFilePayload(_0x28bc69 || {});
  const _0xd55114 = normalizeTimestamp(_0x2b62bd?.savedAt, normalizeTimestamp(now, Date.now()));
  const _0x26de88 = String(_0x2b62bd?.filename || "").trim();
  return {
    version: RECOVERY_SNAPSHOT_VERSION,
    savedAt: _0xd55114,
    reason: String(_0x2b62bd?.reason || "auto").trim() || "auto",
    projectId: String(_0x2b62bd?.projectId || "").trim() || "default_v2_project",
    projectName: sanitizeProjectName(_0x2b62bd?.projectName || _0x2b62bd?.projectId || t("coreServices.projectFile.unnamedCanvas")),
    filename: _0x26de88 ? a1531_0x41f7da.basename(_0x26de88) : "",
    recentId: String(_0x2b62bd?.recentId || "").trim(),
    displayPath: String(_0x2b62bd?.displayPath || "").trim(),
    lastKnownProjectLastModified: normalizeTimestamp(_0x2b62bd?.lastKnownProjectLastModified ?? _0x2b62bd?.lastModified, 0),
    data: _0x94e7e2
  };
}
export function writeRecoverySnapshot(_0x2a71c0, _0x23a89a, _0x2a6862 = {}) {
  const _0x4b34e5 = String(_0x2a71c0 || "").trim();
  if (!_0x4b34e5) {
    throw new Error("Recovery path is required");
  }
  const _0x4d7b44 = a1531_0x41f7da.resolve(_0x4b34e5);
  const _0x1788e1 = buildRecoverySnapshotPayload(_0x23a89a, _0x2a6862);
  writeTextAtomically(_0x4d7b44, JSON.stringify(_0x1788e1, null, 2) + "\n");
  return _0x1788e1;
}
export function readRecoverySnapshot(_0x265494) {
  try {
    const _0xf2500a = String(_0x265494 || "").trim();
    if (!_0xf2500a) {
      return null;
    }
    const _0x40fbbe = a1531_0x41f7da.resolve(_0xf2500a);
    const _0x3b2899 = JSON.parse(stripUtf8Bom(readFileSync(_0x40fbbe, "utf8")));
    if (!isPlainObject(_0x3b2899)) {
      return null;
    }
    if (Number(_0x3b2899.version) !== RECOVERY_SNAPSHOT_VERSION) {
      return null;
    }
    if (!isPlainObject(_0x3b2899.data)) {
      return null;
    }
    const _0x4a6a6f = normalizeTimestamp(_0x3b2899.savedAt, 0);
    if (!_0x4a6a6f) {
      return null;
    }
    return {
      ..._0x3b2899,
      savedAt: _0x4a6a6f,
      projectId: String(_0x3b2899.projectId || "").trim() || "default_v2_project",
      projectName: sanitizeProjectName(_0x3b2899.projectName || _0x3b2899.projectId || t("coreServices.projectFile.unnamedCanvas")),
      filename: String(_0x3b2899.filename || "").trim(),
      recentId: String(_0x3b2899.recentId || "").trim(),
      displayPath: String(_0x3b2899.displayPath || "").trim(),
      lastKnownProjectLastModified: normalizeTimestamp(_0x3b2899.lastKnownProjectLastModified, 0)
    };
  } catch {
    return null;
  }
}
export function removeRecoverySnapshot(_0x2e0541) {
  try {
    const _0xb85969 = String(_0x2e0541 || "").trim();
    if (!_0xb85969) {
      return;
    }
    unlinkSync(a1531_0x41f7da.resolve(_0xb85969));
  } catch (_0x16be21) {
    if (_0x16be21?.code !== "ENOENT") {
      throw _0x16be21;
    }
  }
}
export function getRecoverySnapshotInfo(_0x3cdc3e, {
  currentLastModified = 0
} = {}) {
  const _0x4fe696 = readRecoverySnapshot(_0x3cdc3e);
  if (!_0x4fe696) {
    return {
      exists: false,
      isNewerThanProject: false,
      savedAt: 0,
      currentLastModified: normalizeTimestamp(currentLastModified, 0)
    };
  }
  const _0x21c14e = normalizeTimestamp(currentLastModified, _0x4fe696.lastKnownProjectLastModified);
  return {
    exists: true,
    isNewerThanProject: _0x4fe696.savedAt > _0x21c14e,
    savedAt: _0x4fe696.savedAt,
    currentLastModified: _0x21c14e,
    projectId: _0x4fe696.projectId,
    projectName: _0x4fe696.projectName,
    filename: _0x4fe696.filename,
    recentId: _0x4fe696.recentId,
    displayPath: _0x4fe696.displayPath,
    lastKnownProjectLastModified: _0x4fe696.lastKnownProjectLastModified
  };
}
export function buildDefaultProjectPath(_0x169e25, _0x486b83) {
  const _0x67444a = a1531_0x41f7da.resolve(String(_0x169e25 || ""));
  return a1531_0x41f7da.join(_0x67444a, sanitizeProjectFilename(_0x486b83));
}
export function getProjectRecentId(_0x47adc5) {
  const _0x44ce0e = normalizeComparablePath(_0x47adc5);
  return createHash("sha256").update(_0x44ce0e).digest("hex").slice(0, 24);
}
export function readRecentProjects(_0x14cb0a) {
  try {
    const _0x5a61e5 = readFileSync(_0x14cb0a, "utf8");
    const _0x3eab95 = JSON.parse(stripUtf8Bom(_0x5a61e5));
    if (Array.isArray(_0x3eab95?.items)) {
      return _0x3eab95.items;
    } else {
      return [];
    }
  } catch {
    return [];
  }
}
export function writeRecentProjects(_0x34ce6d, _0x232cd8) {
  const _0x5018b0 = {
    version: PROJECT_RECENTS_VERSION,
    updatedAt: Date.now(),
    items: Array.isArray(_0x232cd8) ? _0x232cd8.slice(0, PROJECT_RECENTS_LIMIT) : []
  };
  writeTextAtomically(_0x34ce6d, JSON.stringify(_0x5018b0, null, 2) + "\n");
  return _0x5018b0.items;
}
export function buildRecentProjectItem(_0x165db4, {
  name = "",
  now = Date.now()
} = {}) {
  const _0x26d9e5 = assertJsonProjectPath(_0x165db4);
  const _0x42c579 = existsSync(_0x26d9e5);
  const _0x1db820 = _0x42c579 ? statSync(_0x26d9e5) : null;
  const _0x12aee3 = a1531_0x41f7da.basename(_0x26d9e5);
  return {
    recentId: getProjectRecentId(_0x26d9e5),
    name: sanitizeProjectName(name || stripProjectFileExtension(_0x12aee3)),
    filename: _0x12aee3,
    path: _0x26d9e5,
    displayPath: _0x26d9e5,
    lastModified: _0x1db820 ? Math.round(_0x1db820.mtimeMs) : 0,
    updatedAt: now,
    exists: _0x42c579
  };
}
export function listRecentProjects(_0x3aeb90) {
  const _0x5aee39 = readRecentProjects(_0x3aeb90).filter(_0x270466 => _0x270466 && _0x270466.path).map(_0x4fec37 => {
    try {
      return {
        ...buildRecentProjectItem(_0x4fec37.path, {
          name: _0x4fec37.name || _0x4fec37.filename,
          now: Number(_0x4fec37.updatedAt || 0) || Date.now()
        }),
        updatedAt: Number(_0x4fec37.updatedAt || 0) || 0
      };
    } catch {
      return null;
    }
  }).filter(Boolean);
  _0x5aee39.sort((_0x33d481, _0x26582b) => Number(_0x26582b.updatedAt || _0x26582b.lastModified || 0) - Number(_0x33d481.updatedAt || _0x33d481.lastModified || 0));
  return _0x5aee39;
}
export function upsertRecentProject(_0x2686a9, _0x18b61d, {
  name = ""
} = {}) {
  const _0x4f53c4 = buildRecentProjectItem(_0x18b61d, {
    name: name,
    now: Date.now()
  });
  const _0x26c863 = readRecentProjects(_0x2686a9).filter(_0x5156b4 => _0x5156b4?.recentId !== _0x4f53c4.recentId);
  _0x26c863.unshift(_0x4f53c4);
  writeRecentProjects(_0x2686a9, _0x26c863);
  return _0x4f53c4;
}
export function removeRecentProject(_0x3b3284, _0x2f8984) {
  const _0x2cb9f5 = String(_0x2f8984 || "").trim();
  if (!_0x2cb9f5) {
    return listRecentProjects(_0x3b3284);
  }
  const _0x57644a = readRecentProjects(_0x3b3284).filter(_0x4e4788 => String(_0x4e4788?.recentId || "") !== _0x2cb9f5);
  writeRecentProjects(_0x3b3284, _0x57644a);
  return listRecentProjects(_0x3b3284);
}
export function findRecentProject(_0x120b7c, _0x57d481) {
  const _0x3beab0 = String(_0x57d481 || "").trim();
  if (!_0x3beab0) {
    return null;
  }
  return listRecentProjects(_0x120b7c).find(_0x2e7c72 => _0x2e7c72.recentId === _0x3beab0) || null;
}