import { createHash } from "node:crypto";
import { copyFileSync, createReadStream, createWriteStream, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, statSync } from "node:fs";
import a267_0x210ba5 from "node:os";
import a267_0x913021 from "node:path";
import a267_0x20e0eb from "extract-zip";
import a267_0x3ef467 from "yazl";
import { buildProjectFilePayload, sanitizeProjectName, writeProjectJson } from "../src/services/desktopProjectFileStore.js";
import { collectReferencedLocalPaths, collectVirtualLocalPathsFromString, isPathInside, normalizeVirtualLocalPath, resolveVirtualPathToAbsolute } from "./localAssetCleanup.js";
import { getVideoPlaybackProxyFilename } from "./videoPlaybackProxy.js";
export const PROJECT_PACKAGE_SCHEMA_VERSION = 1;
export const PROJECT_PACKAGE_KIND = "aiCanvas.projectPackage";
export const PROJECT_PACKAGE_FILE_EXTENSION = ".aicpkg";
export const PROJECT_PACKAGE_MANIFEST_NAME = "manifest.json";
export const PROJECT_PACKAGE_PROJECT_FILE = "project/project.aicanvas";
const IMPORT_DIR_ROOT = "ProjectImports";
const DEFAULT_MAX_IMPORT_PACKAGE_BYTES = 10737418240;
const DEFAULT_MAX_IMPORT_ASSET_BYTES = 5368709120;
const ROOT_DEFINITIONS = Object.freeze([{
  rootKey: "workflowThumbsRoot",
  virtualPrefix: "data/workflows/thumbs/"
}, {
  rootKey: "uploadsRoot",
  virtualPrefix: "data/uploads/"
}, {
  rootKey: "assetsRoot",
  virtualPrefix: "data/assets/"
}, {
  rootKey: "outputRoot",
  virtualPrefix: "output/"
}]);
const LOCAL_PATH_KEYS = new Set(["localPath", "originalLocalPath", "displayLocalPath", "thumbLocalPath", "posterLocalPath", "coverLocalPath", "waveformLocalPath", "path"]);
const URL_KEYS = new Set(["url", "src", "imageUrl", "videoUrl", "audioUrl", "thumbUrl", "posterUrl", "coverUrl", "sourceUrl", "originalUrl", "displayUrl", "resultUrl"]);
const VIDEO_EXTENSIONS = new Set([".mp4", ".webm", ".mov", ".m4v", ".avi", ".mkv"]);
const RECOVERABLE_DERIVED_VIDEO_EXTENSIONS = new Set([".mp4", ".webm", ".mov", ".m4v"]);
function isPlainObject(_0xc10d12) {
  return !!_0xc10d12 && typeof _0xc10d12 === "object" && !Array.isArray(_0xc10d12);
}
function trimText(_0x26e8ba) {
  return String(_0x26e8ba || "").trim();
}
function normalizePackagePath(_0x358e4b) {
  const _0xca859d = trimText(_0x358e4b);
  if (!_0xca859d) {
    throw new Error("Project package path is required");
  }
  if (!a267_0x913021.isAbsolute(_0xca859d)) {
    throw new Error("Project package path must be absolute");
  }
  if (a267_0x913021.extname(_0xca859d).toLowerCase() !== PROJECT_PACKAGE_FILE_EXTENSION) {
    throw new Error("Only .aicpkg project packages are supported");
  }
  return a267_0x913021.resolve(_0xca859d);
}
export function withProjectPackageExtension(_0x1fd7fc) {
  const _0x35602c = trimText(_0x1fd7fc);
  if (!_0x35602c) {
    return _0x35602c;
  }
  if (a267_0x913021.extname(_0x35602c)) {
    return _0x35602c;
  } else {
    return "" + _0x35602c + PROJECT_PACKAGE_FILE_EXTENSION;
  }
}
function stripUtf8Bom(_0x39ad35) {
  return String(_0x39ad35 || "").replace(/^\uFEFF/, "");
}
function readJsonFile(_0x17ca2a, _0xc11e56) {
  let _0x300bf4 = null;
  try {
    _0x300bf4 = JSON.parse(stripUtf8Bom(readFileSync(_0x17ca2a, "utf8")));
  } catch (_0x37c030) {
    throw new Error("Invalid " + (_0xc11e56 || "JSON") + ": " + String(_0x37c030?.message || _0x37c030));
  }
  if (!isPlainObject(_0x300bf4)) {
    throw new Error((_0xc11e56 || "JSON") + " must be an object");
  }
  return _0x300bf4;
}
function timestampForFilename(_0x12d4a6 = new Date()) {
  const _0x3fcefa = _0xfb1a74 => String(_0xfb1a74).padStart(2, "0");
  return [_0x12d4a6.getFullYear(), _0x3fcefa(_0x12d4a6.getMonth() + 1), _0x3fcefa(_0x12d4a6.getDate()), "-", _0x3fcefa(_0x12d4a6.getHours()), _0x3fcefa(_0x12d4a6.getMinutes()), _0x3fcefa(_0x12d4a6.getSeconds())].join("");
}
function safePathSegment(_0x4245db, _0x433cdd = "project") {
  const _0x3c3fd7 = sanitizeProjectName(_0x4245db || _0x433cdd).replace(/[.]+$/g, "").replace(/\s+/g, " ").trim();
  return _0x3c3fd7 || _0x433cdd;
}
function normalizeArchivePath(_0x5bce3a) {
  const _0x5eb003 = trimText(_0x5bce3a).replace(/\\/g, "/").replace(/^\/+/, "");
  if (!_0x5eb003 || _0x5eb003.includes("\0")) {
    return "";
  }
  if (/^[a-z][a-z0-9+.-]*:/i.test(_0x5eb003) || /^[a-zA-Z]:\//.test(_0x5eb003) || _0x5eb003.startsWith("//")) {
    return "";
  }
  const _0xf69742 = [];
  for (const _0x7270d of _0x5eb003.split("/")) {
    const _0x3ceae1 = _0x7270d.trim();
    if (!_0x3ceae1 || _0x3ceae1 === ".") {
      continue;
    }
    if (_0x3ceae1 === "..") {
      return "";
    }
    _0xf69742.push(_0x3ceae1);
  }
  if (_0xf69742.length > 0) {
    return _0xf69742.join("/");
  } else {
    return "";
  }
}
function buildAssetArchivePath(_0x47c234) {
  const _0x4f78d4 = normalizeVirtualLocalPath(_0x47c234);
  if (!_0x4f78d4) {
    return "";
  }
  return "assets/" + _0x4f78d4;
}
function findRootDefinition(_0x3403c1, _0x3c1ce9) {
  const _0x2710d5 = normalizeVirtualLocalPath(_0x3403c1);
  if (!_0x2710d5) {
    return null;
  }
  for (const _0x8d78d0 of ROOT_DEFINITIONS) {
    if (!_0x2710d5.startsWith(_0x8d78d0.virtualPrefix)) {
      continue;
    }
    const _0x304008 = trimText(_0x3c1ce9?.[_0x8d78d0.rootKey]);
    if (!_0x304008) {
      return null;
    }
    return {
      ..._0x8d78d0,
      absRoot: a267_0x913021.resolve(_0x304008),
      localPath: _0x2710d5,
      relPath: _0x2710d5.slice(_0x8d78d0.virtualPrefix.length)
    };
  }
  return null;
}
function clampProgress(_0x562dea) {
  const _0x3f76e0 = Number(_0x562dea);
  if (!Number.isFinite(_0x3f76e0)) {
    return null;
  }
  return Math.max(0, Math.min(1, _0x3f76e0));
}
function emitProgress(_0x4ea4f5, _0x77cce8 = {}) {
  if (typeof _0x4ea4f5 !== "function") {
    return;
  }
  const _0x5673ec = clampProgress(_0x77cce8.progress);
  _0x4ea4f5({
    phase: trimText(_0x77cce8.phase) || "working",
    message: trimText(_0x77cce8.message),
    progress: _0x5673ec,
    current: Number.isFinite(Number(_0x77cce8.current)) ? Number(_0x77cce8.current) : null,
    total: Number.isFinite(Number(_0x77cce8.total)) ? Number(_0x77cce8.total) : null
  });
}
function writeZip(_0x4d1903, _0x29cc7a, _0x8aab2b = {}) {
  return new Promise((_0x379356, _0x3f55f1) => {
    const _0x435467 = createWriteStream(_0x29cc7a);
    const _0x397b12 = Math.max(1, Number(_0x8aab2b.estimatedBytes || 0) || 1);
    let _0x28cb82 = 0;
    _0x435467.once("close", _0x379356);
    _0x435467.once("error", _0x3f55f1);
    _0x4d1903.outputStream.once("error", _0x3f55f1);
    _0x4d1903.outputStream.on("data", _0x5bbf1b => {
      _0x28cb82 += Number(_0x5bbf1b?.length || 0) || 0;
      const _0x3cba1c = Math.min(1, _0x28cb82 / _0x397b12);
      emitProgress(_0x8aab2b.onProgress, {
        phase: "zipping",
        message: "正在写入项目包...",
        progress: 0.85 + _0x3cba1c * 0.13,
        current: _0x28cb82,
        total: _0x397b12
      });
    });
    _0x4d1903.outputStream.pipe(_0x435467);
    _0x4d1903.end();
  });
}
function hashFileSha256(_0x5c5c91, _0x2e9a96 = {}) {
  return new Promise((_0xd552c6, _0x527929) => {
    const _0x28d5d2 = createHash("sha256");
    const _0x218f3c = createReadStream(_0x5c5c91);
    _0x218f3c.once("error", _0x527929);
    _0x218f3c.on("data", _0x3325fa => {
      _0x28d5d2.update(_0x3325fa);
      if (typeof _0x2e9a96.onChunk === "function") {
        _0x2e9a96.onChunk(Number(_0x3325fa?.length || 0) || 0);
      }
    });
    _0x218f3c.once("end", () => _0xd552c6(_0x28d5d2.digest("hex")));
  });
}
function findExistingAssetPath(_0x2cbad0, _0x412aed) {
  const _0x4da50 = normalizeVirtualLocalPath(_0x2cbad0);
  if (!_0x4da50) {
    return null;
  }
  const _0x28fea8 = resolveVirtualPathToAbsolute(_0x4da50, _0x412aed);
  if (!_0x28fea8 || !existsSync(_0x28fea8)) {
    return null;
  }
  const _0x3f031e = statSync(_0x28fea8);
  if (!_0x3f031e.isFile()) {
    return null;
  }
  return {
    localPath: _0x4da50,
    absPath: _0x28fea8,
    size: Number(_0x3f031e.size || 0)
  };
}
function getRecoverableOriginalVideoFallback(_0x6b7022, _0x39c9ff) {
  const _0x451ded = normalizeVirtualLocalPath(_0x6b7022);
  const _0x4b5dd9 = "data/assets/original/";
  if (!_0x451ded.startsWith(_0x4b5dd9)) {
    return null;
  }
  const _0x341344 = a267_0x913021.posix.parse(_0x451ded.slice(_0x4b5dd9.length));
  const _0x386a12 = _0x341344.name;
  if (!_0x386a12 || !VIDEO_EXTENSIONS.has(_0x341344.ext.toLowerCase())) {
    return null;
  }
  const _0x866d11 = "data/assets/derived/video";
  const _0x3b4b5e = [_0x866d11 + "/" + getVideoPlaybackProxyFilename(_0x386a12), _0x866d11 + "/" + _0x386a12 + ".proxy.mp4", _0x866d11 + "/" + _0x386a12 + ".mp4", _0x866d11 + "/" + _0x386a12 + ".webm", _0x866d11 + "/" + _0x386a12 + ".mov", _0x866d11 + "/" + _0x386a12 + ".m4v", _0x866d11 + "/" + _0x386a12 + ".poster.jpg"];
  for (const _0x108d81 of _0x3b4b5e) {
    const _0x28de4e = findExistingAssetPath(_0x108d81, _0x39c9ff);
    if (!_0x28de4e) {
      continue;
    }
    const _0x1a5e68 = a267_0x913021.extname(_0x28de4e.localPath).toLowerCase();
    return {
      ..._0x28de4e,
      canReplaceOriginal: RECOVERABLE_DERIVED_VIDEO_EXTENSIONS.has(_0x1a5e68)
    };
  }
  return null;
}
function collectRemoteMediaReferences(_0x4bbff0, _0x3cfe56 = [], _0x40fabf = new Set()) {
  if (_0x4bbff0 == null || typeof _0x4bbff0 !== "object") {
    return _0x3cfe56;
  }
  if (_0x40fabf.has(_0x4bbff0)) {
    return _0x3cfe56;
  }
  _0x40fabf.add(_0x4bbff0);
  if (Array.isArray(_0x4bbff0)) {
    for (const _0x4e57fe of _0x4bbff0) {
      collectRemoteMediaReferences(_0x4e57fe, _0x3cfe56, _0x40fabf);
    }
    return _0x3cfe56;
  }
  const _0x10277c = Object.entries(_0x4bbff0);
  const _0x18f224 = _0x10277c.some(([_0x12fdb2, _0x3ca8fa]) => {
    if (!LOCAL_PATH_KEYS.has(_0x12fdb2)) {
      return false;
    }
    return collectVirtualLocalPathsFromString(_0x3ca8fa).length > 0;
  });
  for (const [_0x6953c2, _0x5ad0a2] of _0x10277c) {
    if (URL_KEYS.has(_0x6953c2) && typeof _0x5ad0a2 === "string" && /^https?:\/\//i.test(_0x5ad0a2) && collectVirtualLocalPathsFromString(_0x5ad0a2).length === 0 && !_0x18f224) {
      _0x3cfe56.push({
        key: _0x6953c2,
        url: _0x5ad0a2
      });
      continue;
    }
    collectRemoteMediaReferences(_0x5ad0a2, _0x3cfe56, _0x40fabf);
  }
  return _0x3cfe56;
}
async function buildExportAssets(_0x449c72, _0x5cb412, _0x781d18 = {}) {
  const _0x1fd5c3 = [...collectReferencedLocalPaths(_0x449c72)].sort();
  const _0x413ef2 = [];
  const _0x4059b9 = [];
  const _0x58b0f9 = [];
  const _0x2d52c3 = [];
  const _0x5bde75 = new Set(_0x1fd5c3);
  let _0x644a68 = 0;
  emitProgress(_0x781d18.onProgress, {
    phase: "collecting",
    message: _0x1fd5c3.length ? "正在收集本地素材 0/" + _0x1fd5c3.length : "正在检查项目素材...",
    progress: 0.05,
    current: 0,
    total: _0x1fd5c3.length
  });
  for (let _0x7e60d1 = 0; _0x7e60d1 < _0x1fd5c3.length; _0x7e60d1 += 1) {
    const _0x4b74e9 = _0x1fd5c3[_0x7e60d1];
    const _0x2cb777 = buildAssetArchivePath(_0x4b74e9);
    const _0x358927 = resolveVirtualPathToAbsolute(_0x4b74e9, _0x5cb412);
    if (!_0x2cb777 || !_0x358927 || !existsSync(_0x358927)) {
      const _0x2756e9 = getRecoverableOriginalVideoFallback(_0x4b74e9, _0x5cb412);
      if (_0x2756e9) {
        _0x2d52c3.push({
          type: "missing-original-video-fallback",
          localPath: _0x4b74e9,
          fallbackLocalPath: _0x2756e9.localPath,
          canReplaceOriginal: _0x2756e9.canReplaceOriginal
        });
        if (!_0x5bde75.has(_0x2756e9.localPath)) {
          _0x5bde75.add(_0x2756e9.localPath);
          _0x1fd5c3.push(_0x2756e9.localPath);
        }
        continue;
      }
      _0x58b0f9.push(_0x4b74e9);
      continue;
    }
    const _0x85c2b = statSync(_0x358927);
    if (!_0x85c2b.isFile()) {
      _0x58b0f9.push(_0x4b74e9);
      continue;
    }
    _0x413ef2.push({
      localPath: _0x4b74e9,
      archivePath: _0x2cb777,
      absPath: _0x358927,
      size: Number(_0x85c2b.size || 0)
    });
    emitProgress(_0x781d18.onProgress, {
      phase: "collecting",
      message: "正在收集本地素材 " + (_0x7e60d1 + 1) + "/" + _0x1fd5c3.length,
      progress: 0.05 + (_0x7e60d1 + 1) / Math.max(1, _0x1fd5c3.length) * 0.2,
      current: _0x7e60d1 + 1,
      total: _0x1fd5c3.length
    });
  }
  const _0x33d820 = _0x413ef2.reduce((_0x2cd7ef, _0x58084a) => _0x2cd7ef + Number(_0x58084a.size || 0), 0);
  for (let _0x2d304e = 0; _0x2d304e < _0x413ef2.length; _0x2d304e += 1) {
    const _0xca8ec9 = _0x413ef2[_0x2d304e];
    _0x4059b9.push({
      ..._0xca8ec9,
      sha256: await hashFileSha256(_0xca8ec9.absPath, {
        onChunk: _0x1c8a10 => {
          _0x644a68 += _0x1c8a10;
          emitProgress(_0x781d18.onProgress, {
            phase: "hashing",
            message: "正在校验素材 " + (_0x2d304e + 1) + "/" + _0x413ef2.length,
            progress: 0.25 + _0x644a68 / Math.max(1, _0x33d820) * 0.5,
            current: _0x644a68,
            total: _0x33d820
          });
        }
      })
    });
  }
  return {
    assets: _0x4059b9,
    missing: _0x58b0f9,
    warnings: _0x2d52c3
  };
}
export async function exportProjectPackageToPath({
  outputPath: _0x341f7b,
  multiData: _0x22e904,
  projectId = "",
  projectName = "",
  appVersion = "",
  roots: _0x209d12,
  now = new Date(),
  onProgress: _0x47665f
} = {}) {
  const _0x4811d4 = a267_0x913021.resolve(withProjectPackageExtension(_0x341f7b));
  if (a267_0x913021.extname(_0x4811d4).toLowerCase() !== PROJECT_PACKAGE_FILE_EXTENSION) {
    throw new Error("Project package output path must end with .aicpkg");
  }
  emitProgress(_0x47665f, {
    phase: "preparing",
    message: "正在准备项目包...",
    progress: 0.02
  });
  const _0x850794 = buildProjectFilePayload(_0x22e904 || {});
  const _0xd64d83 = collectRemoteMediaReferences(_0x850794);
  if (_0xd64d83.length > 0) {
    const _0x371ef6 = new Error("Project package export blocked: remote media must be saved locally first");
    _0x371ef6.code = "REMOTE_MEDIA_NOT_LOCALIZED";
    _0x371ef6.remoteMedia = _0xd64d83.slice(0, 20);
    throw _0x371ef6;
  }
  const {
    assets: _0x29b0ba,
    missing: _0x42c314,
    warnings: _0xd0afbb
  } = await buildExportAssets(_0x850794, _0x209d12 || {}, {
    onProgress: _0x47665f
  });
  if (_0x42c314.length > 0) {
    const _0x44d927 = new Error("Project package export blocked: missing local assets");
    _0x44d927.code = "MISSING_LOCAL_ASSETS";
    _0x44d927.missing = _0x42c314;
    throw _0x44d927;
  }
  const _0x267826 = _0x29b0ba.map(({
    absPath: _0x20a2c0,
    ..._0x10c4f8
  }) => _0x10c4f8);
  const _0x570cf1 = {
    schemaVersion: PROJECT_PACKAGE_SCHEMA_VERSION,
    packageKind: PROJECT_PACKAGE_KIND,
    exportedAt: now.toISOString(),
    appVersion: trimText(appVersion),
    project: {
      projectId: trimText(projectId),
      projectName: safePathSegment(projectName || projectId || "未命名画布", "未命名画布")
    },
    projectFile: PROJECT_PACKAGE_PROJECT_FILE,
    assets: _0x267826,
    warnings: _0xd0afbb
  };
  mkdirSync(a267_0x913021.dirname(_0x4811d4), {
    recursive: true
  });
  const _0x3df6e7 = new a267_0x3ef467.ZipFile();
  const _0xbfb7f0 = Buffer.from(JSON.stringify(_0x570cf1, null, 2) + "\n", "utf8");
  const _0x59f715 = Buffer.from(JSON.stringify(_0x850794, null, 2) + "\n", "utf8");
  _0x3df6e7.addBuffer(_0xbfb7f0, PROJECT_PACKAGE_MANIFEST_NAME);
  _0x3df6e7.addBuffer(_0x59f715, PROJECT_PACKAGE_PROJECT_FILE);
  for (const _0x10f070 of _0x29b0ba) {
    _0x3df6e7.addFile(_0x10f070.absPath, _0x10f070.archivePath);
  }
  emitProgress(_0x47665f, {
    phase: "zipping",
    message: "正在写入项目包...",
    progress: 0.85,
    current: 0,
    total: _0x29b0ba.length
  });
  await writeZip(_0x3df6e7, _0x4811d4, {
    onProgress: _0x47665f,
    estimatedBytes: _0xbfb7f0.length + _0x59f715.length + _0x29b0ba.reduce((_0x5c65bb, _0x5ad357) => _0x5c65bb + Number(_0x5ad357.size || 0), 0)
  });
  emitProgress(_0x47665f, {
    phase: "done",
    message: "项目包收集完成",
    progress: 1,
    current: _0x29b0ba.length,
    total: _0x29b0ba.length
  });
  return {
    success: true,
    canceled: false,
    path: _0x4811d4,
    filename: a267_0x913021.basename(_0x4811d4),
    assetsCount: _0x29b0ba.length,
    warnings: _0x570cf1.warnings
  };
}
function assertImportPackageSize(_0x5b992f, _0x51a30a) {
  const _0x9ff2e2 = statSync(_0x5b992f);
  if (!_0x9ff2e2.isFile()) {
    throw new Error("Project package path is not a file");
  }
  const _0x3264a0 = Number(_0x51a30a || DEFAULT_MAX_IMPORT_PACKAGE_BYTES);
  if (Number(_0x9ff2e2.size || 0) > _0x3264a0) {
    throw new Error("Project package is too large");
  }
}
function assertPackageManifest(_0x31a105) {
  if (!isPlainObject(_0x31a105)) {
    throw new Error("Invalid project package manifest");
  }
  if (Number(_0x31a105.schemaVersion) !== PROJECT_PACKAGE_SCHEMA_VERSION) {
    throw new Error("Unsupported project package schemaVersion");
  }
  if (_0x31a105.packageKind !== PROJECT_PACKAGE_KIND) {
    throw new Error("Invalid project package kind");
  }
  const _0x347aaa = normalizeArchivePath(_0x31a105.projectFile);
  if (_0x347aaa !== PROJECT_PACKAGE_PROJECT_FILE) {
    throw new Error("Invalid project package projectFile");
  }
  if (!Array.isArray(_0x31a105.assets)) {
    throw new Error("Invalid project package assets");
  }
}
function assertArchivePathInsideTemp(_0x39f64e, _0x4e4401) {
  const _0xda060b = normalizeArchivePath(_0x4e4401);
  if (!_0xda060b) {
    return "";
  }
  const _0x5655c1 = a267_0x913021.resolve(_0x39f64e, ..._0xda060b.split("/"));
  if (isPathInside(_0x5655c1, _0x39f64e)) {
    return _0x5655c1;
  } else {
    return "";
  }
}
function allocateUniqueFilePath(_0x3aa101) {
  if (!existsSync(_0x3aa101)) {
    return _0x3aa101;
  }
  const _0x1187cd = a267_0x913021.dirname(_0x3aa101);
  const _0x5d7fd = a267_0x913021.parse(_0x3aa101);
  for (let _0x2c095e = 2; _0x2c095e < 1000; _0x2c095e += 1) {
    const _0x5d58f0 = a267_0x913021.join(_0x1187cd, _0x5d7fd.name + " (" + _0x2c095e + ")" + _0x5d7fd.ext);
    if (!existsSync(_0x5d58f0)) {
      return _0x5d58f0;
    }
  }
  throw new Error("Unable to allocate unique import file path");
}
function allocateImportedAssetTarget(_0x4ffd58, _0x36cdaa, _0x337df7) {
  const _0x175fdf = findRootDefinition(_0x4ffd58, _0x36cdaa);
  if (!_0x175fdf) {
    throw new Error("Unsupported local asset path: " + _0x4ffd58);
  }
  const _0x4c8165 = _0x175fdf.relPath.split("/").filter(Boolean);
  const _0x1ed7ba = [IMPORT_DIR_ROOT, _0x337df7, ..._0x4c8165].join("/");
  const _0x3461ea = allocateUniqueFilePath(a267_0x913021.resolve(_0x175fdf.absRoot, ..._0x1ed7ba.split("/")));
  if (!isPathInside(_0x3461ea, _0x175fdf.absRoot)) {
    throw new Error("Invalid imported asset target: " + _0x4ffd58);
  }
  const _0x375387 = a267_0x913021.relative(_0x175fdf.absRoot, _0x3461ea).replace(/\\/g, "/");
  return {
    absPath: _0x3461ea,
    localPath: "" + _0x175fdf.virtualPrefix + _0x375387
  };
}
function isUrlLikeKey(_0x17835e) {
  return URL_KEYS.has(String(_0x17835e || ""));
}
function rewriteStringLocalReferences(_0x170060, _0x3c299f, _0x3e605a = "") {
  const _0x344203 = String(_0x170060 || "").split("|");
  const _0x2a026c = _0x344203.map(_0x25eb17 => {
    const _0x3f55e2 = normalizeVirtualLocalPath(_0x25eb17);
    const _0x3b2fbd = _0x3f55e2 ? _0x3c299f.get(_0x3f55e2) : "";
    if (!_0x3b2fbd) {
      return _0x25eb17;
    }
    const _0x37e11a = _0x25eb17.trim();
    if (LOCAL_PATH_KEYS.has(_0x3e605a)) {
      return _0x3b2fbd;
    }
    if (isUrlLikeKey(_0x3e605a) || /^https?:\/\//i.test(_0x37e11a) || _0x37e11a.startsWith("/")) {
      return "/" + _0x3b2fbd;
    }
    return _0x3b2fbd;
  });
  return _0x2a026c.join("|");
}
function rewriteProjectLocalReferences(_0xb3d436, _0x40eae9, _0x25a9bb = "") {
  if (typeof _0xb3d436 === "string") {
    const _0x542f18 = collectVirtualLocalPathsFromString(_0xb3d436);
    if (!_0x542f18.some(_0x1f83d0 => _0x40eae9.has(_0x1f83d0))) {
      return _0xb3d436;
    }
    return rewriteStringLocalReferences(_0xb3d436, _0x40eae9, _0x25a9bb);
  }
  if (Array.isArray(_0xb3d436)) {
    return _0xb3d436.map(_0x4f72e5 => rewriteProjectLocalReferences(_0x4f72e5, _0x40eae9, _0x25a9bb));
  }
  if (!isPlainObject(_0xb3d436)) {
    return _0xb3d436;
  }
  const _0x23d847 = {};
  for (const [_0x40765c, _0x225d62] of Object.entries(_0xb3d436)) {
    _0x23d847[_0x40765c] = rewriteProjectLocalReferences(_0x225d62, _0x40eae9, _0x40765c);
  }
  return _0x23d847;
}
function allocateUniqueProjectPath(_0x3ce261, _0x52ae13) {
  const _0x20cfda = a267_0x913021.resolve(trimText(_0x3ce261));
  mkdirSync(_0x20cfda, {
    recursive: true
  });
  const _0x30cb26 = safePathSegment((_0x52ae13 || "未命名画布") + " - 导入", "imported-project");
  const _0xaca803 = a267_0x913021.join(_0x20cfda, _0x30cb26 + ".aicanvas");
  if (!existsSync(_0xaca803)) {
    return _0xaca803;
  }
  for (let _0x38404d = 2; _0x38404d < 1000; _0x38404d += 1) {
    const _0x268757 = a267_0x913021.join(_0x20cfda, _0x30cb26 + " (" + _0x38404d + ").aicanvas");
    if (!existsSync(_0x268757)) {
      return _0x268757;
    }
  }
  throw new Error("Unable to allocate imported project file path");
}
function importDirNameForProject(_0x294a9d, _0x3f34bb = new Date()) {
  return safePathSegment((_0x294a9d || "Project") + "-" + timestampForFilename(_0x3f34bb), "Project");
}
function validateImportAssets(_0x1a1ecb, _0x3e24ff, _0xa2438, _0x1ee77a = {}) {
  const _0x3af291 = Number(_0x1ee77a.maxAssetBytes || DEFAULT_MAX_IMPORT_ASSET_BYTES);
  const _0x5a5338 = [];
  const _0x54fb59 = new Set();
  for (const _0x507efb of _0x1a1ecb.assets) {
    if (!isPlainObject(_0x507efb)) {
      throw new Error("Invalid project package asset");
    }
    const _0x2a9245 = normalizeVirtualLocalPath(_0x507efb.localPath);
    const _0x60e725 = normalizeArchivePath(_0x507efb.archivePath);
    if (!_0x2a9245 || String(_0x507efb.localPath || "").replace(/\\/g, "/").replace(/^\/+/, "") !== _0x2a9245) {
      throw new Error("Invalid project package asset localPath");
    }
    if (!_0x60e725 || !_0x60e725.startsWith("assets/")) {
      throw new Error("Invalid project package asset path");
    }
    if (_0x54fb59.has(_0x2a9245)) {
      continue;
    }
    _0x54fb59.add(_0x2a9245);
    const _0x1f570a = assertArchivePathInsideTemp(_0x3e24ff, _0x60e725);
    if (!_0x1f570a || !existsSync(_0x1f570a)) {
      throw new Error("Project package asset is missing: " + _0x2a9245);
    }
    const _0x402dc2 = statSync(_0x1f570a);
    if (!_0x402dc2.isFile()) {
      throw new Error("Project package asset is not a file: " + _0x2a9245);
    }
    const _0x329227 = Number(_0x402dc2.size || 0);
    if (_0x329227 > _0x3af291) {
      throw new Error("Project package asset is too large");
    }
    const _0x14e7a0 = Number(_0x507efb.size || 0) || 0;
    if (_0x14e7a0 > 0 && _0x14e7a0 !== _0x329227) {
      throw new Error("Project package asset size mismatch: " + _0x2a9245);
    }
    if (!findRootDefinition(_0x2a9245, _0xa2438)) {
      throw new Error("Unsupported project package asset localPath: " + _0x2a9245);
    }
    _0x5a5338.push({
      localPath: _0x2a9245,
      archivePath: _0x60e725,
      absPath: _0x1f570a,
      size: _0x329227
    });
  }
  return _0x5a5338;
}
export async function importProjectPackageFromPath({
  packagePath: _0x29a3a8,
  roots: _0x5936df,
  projectRoot: _0x50e3ea,
  tempRoot = a267_0x210ba5.tmpdir(),
  now = new Date(),
  maxPackageBytes = DEFAULT_MAX_IMPORT_PACKAGE_BYTES,
  maxAssetBytes = DEFAULT_MAX_IMPORT_ASSET_BYTES
} = {}) {
  const _0x53cc80 = normalizePackagePath(_0x29a3a8);
  assertImportPackageSize(_0x53cc80, maxPackageBytes);
  const _0x4458b9 = a267_0x913021.resolve(tempRoot || a267_0x210ba5.tmpdir());
  mkdirSync(_0x4458b9, {
    recursive: true
  });
  const _0x354017 = mkdtempSync(a267_0x913021.join(_0x4458b9, "aicpkg-"));
  try {
    await a267_0x20e0eb(_0x53cc80, {
      dir: _0x354017
    });
    const _0x279bc2 = a267_0x913021.join(_0x354017, PROJECT_PACKAGE_MANIFEST_NAME);
    if (!existsSync(_0x279bc2)) {
      throw new Error("Project package manifest is missing");
    }
    const _0x5e0877 = readJsonFile(_0x279bc2, "project package manifest");
    assertPackageManifest(_0x5e0877);
    const _0x434338 = assertArchivePathInsideTemp(_0x354017, _0x5e0877.projectFile);
    if (!_0x434338 || !existsSync(_0x434338)) {
      throw new Error("Project package project file is missing");
    }
    const _0x18f19d = readJsonFile(_0x434338, "project package project file");
    const _0x16f3fd = safePathSegment(_0x5e0877.project?.projectName || _0x5e0877.project?.projectId || a267_0x913021.basename(_0x53cc80, PROJECT_PACKAGE_FILE_EXTENSION), "Imported Project");
    const _0x4e6805 = importDirNameForProject(_0x16f3fd, now);
    const _0xc5dd3f = validateImportAssets(_0x5e0877, _0x354017, _0x5936df || {}, {
      maxAssetBytes: maxAssetBytes
    });
    const _0x250254 = new Map();
    const _0x133b91 = _0xc5dd3f.map(_0x3e5575 => {
      const _0x4a8888 = allocateImportedAssetTarget(_0x3e5575.localPath, _0x5936df || {}, _0x4e6805);
      _0x250254.set(_0x3e5575.localPath, _0x4a8888.localPath);
      return {
        from: _0x3e5575.absPath,
        to: _0x4a8888.absPath
      };
    });
    for (const _0x260e85 of _0x133b91) {
      mkdirSync(a267_0x913021.dirname(_0x260e85.to), {
        recursive: true
      });
      copyFileSync(_0x260e85.from, _0x260e85.to);
    }
    const _0x113c8f = rewriteProjectLocalReferences(_0x18f19d, _0x250254);
    const _0x5d43d3 = allocateUniqueProjectPath(_0x50e3ea, _0x16f3fd);
    writeProjectJson(_0x5d43d3, _0x113c8f);
    return {
      success: true,
      canceled: false,
      projectPath: _0x5d43d3,
      projectName: _0x16f3fd + " - 导入",
      filename: a267_0x913021.basename(_0x5d43d3),
      data: _0x113c8f,
      assetsCount: _0xc5dd3f.length,
      sourcePackagePath: _0x53cc80
    };
  } finally {
    rmSync(_0x354017, {
      recursive: true,
      force: true
    });
  }
}
export const projectPackageInternals = {
  collectRemoteMediaReferences: collectRemoteMediaReferences,
  rewriteProjectLocalReferences: rewriteProjectLocalReferences,
  normalizeArchivePath: normalizeArchivePath,
  allocateImportedAssetTarget: allocateImportedAssetTarget
};