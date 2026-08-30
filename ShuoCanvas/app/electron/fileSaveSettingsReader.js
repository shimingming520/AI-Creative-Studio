import { readFileSync } from "node:fs";
function readJsonFileSyncSafe(_0x518a2b) {
  try {
    return JSON.parse(readFileSync(_0x518a2b, "utf8").replace(/^\uFEFF/, ""));
  } catch {
    return {};
  }
}
export function readUserSettingsFromFilesSync(_0x4b74a7 = []) {
  for (const _0x28920b of _0x4b74a7) {
    const _0x1fd404 = readJsonFileSyncSafe(_0x28920b);
    if (!_0x1fd404 || typeof _0x1fd404 !== "object") {
      continue;
    }
    const _0x115176 = _0x1fd404.fileSavePaths;
    const _0x3d95c3 = _0x1fd404.fileSavePathsMeta;
    if (_0x115176 && typeof _0x115176 === "object" || _0x3d95c3 && typeof _0x3d95c3 === "object") {
      return _0x1fd404;
    }
  }
  return {};
}