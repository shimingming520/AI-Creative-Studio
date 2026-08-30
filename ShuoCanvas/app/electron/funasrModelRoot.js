import a226_0x25a8a2 from "node:path";
export const FUNASR_MODEL_DIR_NAME = "funasr";
function normalizePathText(_0x2c7fab) {
  return String(_0x2c7fab || "").trim();
}
function pathBasenameEquals(_0x23c6b4, _0x258d24) {
  return a226_0x25a8a2.basename(a226_0x25a8a2.resolve(_0x23c6b4)).toLowerCase() === String(_0x258d24).toLowerCase();
}
function sameResolvedPath(_0x1c4488, _0x4b602b) {
  return a226_0x25a8a2.resolve(_0x1c4488) === a226_0x25a8a2.resolve(_0x4b602b);
}
export function inferFileSaveRootDirFromManagedPaths(_0x406d89 = {}) {
  const _0x5b8165 = [[_0x406d89.canvasDir, "projects"], [_0x406d89.dataDir, "data"], [_0x406d89.outputDir, "output"]].map(([_0x3b46f4, _0x9ed150]) => [normalizePathText(_0x3b46f4), _0x9ed150]).filter(([_0x2efa78]) => !!_0x2efa78);
  const _0x54d46e = _0x5b8165.filter(([_0x4fa672, _0x3c1bc8]) => pathBasenameEquals(_0x4fa672, _0x3c1bc8)).map(([_0x51a1af]) => a226_0x25a8a2.dirname(a226_0x25a8a2.resolve(_0x51a1af)));
  if (_0x54d46e.length >= 2) {
    const _0x17621b = _0x54d46e[0];
    if (_0x54d46e.every(_0x110952 => sameResolvedPath(_0x110952, _0x17621b))) {
      return _0x17621b;
    }
  }
  const _0xef5d4f = normalizePathText(_0x406d89.dataDir);
  if (_0xef5d4f && pathBasenameEquals(_0xef5d4f, "data")) {
    return a226_0x25a8a2.dirname(a226_0x25a8a2.resolve(_0xef5d4f));
  }
  const _0x3e1812 = normalizePathText(_0x406d89.outputDir);
  if (_0x3e1812 && pathBasenameEquals(_0x3e1812, "output")) {
    return a226_0x25a8a2.dirname(a226_0x25a8a2.resolve(_0x3e1812));
  }
  const _0x1cb29a = normalizePathText(_0x406d89.canvasDir);
  if (_0x1cb29a && pathBasenameEquals(_0x1cb29a, "projects")) {
    return a226_0x25a8a2.dirname(a226_0x25a8a2.resolve(_0x1cb29a));
  }
  return "";
}
export function resolveFunasrModelRootDir(_0x2ba0b6 = {}, {
  fallbackDataDir = ""
} = {}) {
  const _0x2ae9d9 = normalizePathText(_0x2ba0b6?.fileSavePathsMeta?.rootDir);
  const _0x35c82f = _0x2ae9d9 || inferFileSaveRootDirFromManagedPaths(_0x2ba0b6?.fileSavePaths || {}) || normalizePathText(fallbackDataDir);
  if (_0x35c82f) {
    return a226_0x25a8a2.join(a226_0x25a8a2.resolve(_0x35c82f), FUNASR_MODEL_DIR_NAME);
  } else {
    return "";
  }
}