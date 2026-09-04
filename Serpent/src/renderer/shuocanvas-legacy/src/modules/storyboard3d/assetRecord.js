import { countStoryboard3DSceneTriangles, getStoryboard3DModelImportCapability, measureStoryboard3DImportedSceneBounds } from "./gltfImportAdapter.js";
export const STORYBOARD_3D_ASSET_RECORD_VERSION = 1;
export const DEFAULT_STORYBOARD_3D_ASSET_DATABASE = "ai-canvaspro";
export const DEFAULT_STORYBOARD_3D_ASSET_STORE = "storyboard3d-assets";
function normalizeText(_0x1d8222) {
  return String(_0x1d8222 || "").trim();
}
function normalizeBounds(_0x53af60) {
  const _0x5a8053 = [_0x53af60?.min?.x, _0x53af60?.min?.y, _0x53af60?.min?.z, _0x53af60?.max?.x, _0x53af60?.max?.y, _0x53af60?.max?.z].map(Number);
  if (!_0x5a8053.every(Number.isFinite)) {
    return null;
  }
  return {
    min: {
      x: _0x5a8053[0],
      y: _0x5a8053[1],
      z: _0x5a8053[2]
    },
    max: {
      x: _0x5a8053[3],
      y: _0x5a8053[4],
      z: _0x5a8053[5]
    }
  };
}
function toHex(_0x1736d5) {
  return [..._0x1736d5].map(_0x134e7c => _0x134e7c.toString(16).padStart(2, "0")).join("");
}
export async function createCanonicalStoryboard3DAssetId(_0x47ba5c, {
  cryptoObject = globalThis.crypto
} = {}) {
  if (typeof _0x47ba5c?.arrayBuffer !== "function") {
    throw new Error("Asset file is unreadable.");
  }
  if (typeof cryptoObject?.subtle?.digest !== "function") {
    throw new Error("SHA-256 support is unavailable.");
  }
  const _0x16947e = await cryptoObject.subtle.digest("SHA-256", await _0x47ba5c.arrayBuffer());
  return "asset:sha256:" + toHex(new Uint8Array(_0x16947e));
}
export function createStoryboard3DIndexedDbAssetReference({
  databaseName = DEFAULT_STORYBOARD_3D_ASSET_DATABASE,
  storeName = DEFAULT_STORYBOARD_3D_ASSET_STORE,
  key: _0x13d7d4
} = {}) {
  const _0x3858f8 = normalizeText(_0x13d7d4);
  if (!_0x3858f8) {
    throw new Error("IndexedDB asset key is required.");
  }
  return {
    kind: "indexeddb",
    databaseName: normalizeText(databaseName) || DEFAULT_STORYBOARD_3D_ASSET_DATABASE,
    storeName: normalizeText(storeName) || DEFAULT_STORYBOARD_3D_ASSET_STORE,
    key: _0x3858f8
  };
}
export async function createStoryboard3DAssetRecord({
  file: _0x839ace,
  format: _0x112bd9,
  parsed: _0x10967e,
  normalization: _0x4ef98c,
  canonicalAssetId = "",
  indexedDbReference = null,
  limitations = null,
  createdAt = Date.now()
} = {}) {
  const _0x45bfdb = normalizeText(_0x112bd9).toLowerCase();
  const _0x2f88b8 = getStoryboard3DModelImportCapability(_0x45bfdb);
  if (!_0x2f88b8 || _0x2f88b8.parsing !== "available") {
    throw new Error("Unsupported parsed asset format: " + (_0x45bfdb || "unknown"));
  }
  const _0x22ad12 = normalizeText(canonicalAssetId) || (await createCanonicalStoryboard3DAssetId(_0x839ace));
  const _0x21bd10 = normalizeBounds(_0x10967e?.bounds) || normalizeBounds(measureStoryboard3DImportedSceneBounds(_0x10967e?.scene));
  if (!_0x21bd10) {
    throw new Error("Parsed asset bounds are required.");
  }
  const _0x40914a = _0x10967e?.scene ? countStoryboard3DSceneTriangles(_0x10967e.scene) : Number(_0x10967e?.triangleCount);
  const _0x4851c2 = Math.max(0, Math.floor(Number(_0x40914a) || 0));
  const _0x2812f0 = indexedDbReference ? createStoryboard3DIndexedDbAssetReference(indexedDbReference) : createStoryboard3DIndexedDbAssetReference({
    key: _0x22ad12
  });
  const _0x1ac3be = Array.isArray(limitations) ? limitations : _0x2f88b8.limitations;
  return {
    version: STORYBOARD_3D_ASSET_RECORD_VERSION,
    canonicalAssetId: _0x22ad12,
    name: normalizeText(_0x839ace?.name) || _0x22ad12,
    sourceFormat: _0x45bfdb,
    source: {
      fileName: normalizeText(_0x839ace?.name),
      mimeType: normalizeText(_0x839ace?.type),
      byteLength: Math.max(0, Number(_0x839ace?.size) || 0)
    },
    storage: _0x2812f0,
    defaultScale: _0x4ef98c?.status === "ready" ? Math.max(0.000001, Number(_0x4ef98c.uniformScale) || 1) : 1,
    bounds: _0x21bd10,
    triangleCount: _0x4851c2,
    limitations: [...new Set((_0x1ac3be || []).map(normalizeText).filter(Boolean))],
    normalizationStatus: _0x4ef98c?.status === "ready" ? "ready" : "awaiting-bounds",
    createdAt: Math.max(0, Number(createdAt) || 0)
  };
}