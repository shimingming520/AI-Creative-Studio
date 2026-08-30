import a279_0x5171ed from "node:path";
import { inferFileSaveRootDirFromManagedPaths } from "./funasrModelRoot.js";
export const SORTFORMER_MODEL_DIR_NAME = "sortformer";
function normalizePathText(_0x560de8) {
  return String(_0x560de8 || "").trim();
}
export function resolveSortformerModelRootDir(_0x21df1f = {}, {
  fallbackDataDir = ""
} = {}) {
  const _0x48842e = normalizePathText(_0x21df1f?.fileSavePathsMeta?.rootDir);
  const _0x3e4363 = _0x48842e || inferFileSaveRootDirFromManagedPaths(_0x21df1f?.fileSavePaths || {}) || normalizePathText(fallbackDataDir);
  if (_0x3e4363) {
    return a279_0x5171ed.join(a279_0x5171ed.resolve(_0x3e4363), SORTFORMER_MODEL_DIR_NAME);
  } else {
    return "";
  }
}