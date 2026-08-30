import { randomBytes } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, renameSync, unlinkSync, writeFileSync } from "node:fs";
import a199_0x190a01 from "node:path";
function emptyIndex() {
  return {
    version: 1,
    assets: {}
  };
}
export class AssetIndexReadError extends Error {
  constructor(_0x1c134d, _0x332cdc) {
    super("Failed to read asset index " + _0x1c134d + ": " + (_0x332cdc?.message || _0x332cdc));
    this.name = "AssetIndexReadError";
    this.code = "ASSET_INDEX_READ_FAILED";
    this.indexPath = _0x1c134d;
    this.cause = _0x332cdc;
  }
}
export function readAssetIndexFile(_0xaa2d1e) {
  try {
    const _0x4d11b8 = JSON.parse(readFileSync(_0xaa2d1e, "utf8"));
    if (!_0x4d11b8 || typeof _0x4d11b8 !== "object" || Array.isArray(_0x4d11b8)) {
      throw new TypeError("Asset index root must be an object");
    }
    if (_0x4d11b8.assets !== undefined && (!_0x4d11b8.assets || typeof _0x4d11b8.assets !== "object" || Array.isArray(_0x4d11b8.assets))) {
      throw new TypeError("Asset index assets must be an object");
    }
    return {
      version: 1,
      assets: _0x4d11b8.assets || {}
    };
  } catch (_0x3cc73d) {
    if (_0x3cc73d?.code === "ENOENT") {
      return emptyIndex();
    }
    throw new AssetIndexReadError(_0xaa2d1e, _0x3cc73d);
  }
}
export function writeAssetIndexFile(_0x4a09fc, _0x3c678e) {
  mkdirSync(a199_0x190a01.dirname(_0x4a09fc), {
    recursive: true
  });
  const _0x32fbf2 = {
    version: 1,
    assets: _0x3c678e?.assets && typeof _0x3c678e.assets === "object" && !Array.isArray(_0x3c678e.assets) ? _0x3c678e.assets : {}
  };
  const _0x33dd4b = _0x4a09fc + "." + process.pid + "." + Date.now() + "." + randomBytes(6).toString("hex") + ".tmp";
  try {
    writeFileSync(_0x33dd4b, JSON.stringify(_0x32fbf2, null, 2) + "\n", "utf8");
    renameSync(_0x33dd4b, _0x4a09fc);
  } finally {
    try {
      if (existsSync(_0x33dd4b)) {
        unlinkSync(_0x33dd4b);
      }
    } catch {}
  }
}