import { t } from "../i18n/index.js";
import { desktopBridge } from "./desktopBridge.js";
function getCleanupApi() {
  if (desktopBridge.localAssetCleanup.isAvailable()) {
    return desktopBridge.localAssetCleanup;
  } else {
    return null;
  }
}
function cleanupText(_0xd3fa94, _0x44aca3 = {}) {
  return t("settings.fileSave.cleanupRuntime." + _0xd3fa94, _0x44aca3);
}
export function canUseLocalAssetCleanup() {
  const _0x127dab = getCleanupApi();
  return !!_0x127dab && typeof _0x127dab.scan === "function" && typeof _0x127dab.trash === "function";
}
export function getCurrentProjectSnapshotForCleanup() {
  const _0x57b93e = globalThis.window?.CanvasTabManager;
  if (!_0x57b93e || typeof _0x57b93e.getMultiDataSnapshot !== "function") {
    return null;
  }
  try {
    return _0x57b93e.getMultiDataSnapshot({
      sanitizeForPersistence: false,
      captureVisualSnapshot: false
    }) || null;
  } catch {
    return null;
  }
}
export async function scanLocalAssetCleanup(_0x3cd6b4 = {}) {
  const _0x2c446b = getCleanupApi();
  if (!canUseLocalAssetCleanup()) {
    throw new Error(cleanupText("notSupported"));
  }
  const _0x56e394 = Object.prototype.hasOwnProperty.call(_0x3cd6b4, "currentProjectSnapshot") ? _0x3cd6b4.currentProjectSnapshot : getCurrentProjectSnapshotForCleanup();
  return await _0x2c446b.scan({
    currentProjectSnapshot: _0x56e394,
    ...(_0x3cd6b4?.scope ? {
      scope: _0x3cd6b4.scope
    } : {})
  });
}
export async function scanLegacyLocalAssetCleanup(_0x1af92e = {}) {
  return await scanLocalAssetCleanup({
    ..._0x1af92e,
    scope: "legacy-defaults"
  });
}
export async function trashLocalAssetCleanup(_0x18372d, _0x36c5e1, _0x42fcc5 = {}) {
  const _0x16faa9 = getCleanupApi();
  if (!canUseLocalAssetCleanup()) {
    throw new Error(cleanupText("notSupported"));
  }
  const _0x44bb07 = typeof _0x18372d === "string" ? _0x18372d : String(_0x18372d?.scanId || "").trim();
  const _0x4aead0 = typeof _0x18372d === "string" ? "" : String(_0x18372d?.scope || "").trim();
  const _0x2a7989 = Object.prototype.hasOwnProperty.call(_0x42fcc5, "currentProjectSnapshot") ? _0x42fcc5.currentProjectSnapshot : getCurrentProjectSnapshotForCleanup();
  return await _0x16faa9.trash({
    scanId: _0x44bb07,
    localPaths: Array.isArray(_0x36c5e1) ? _0x36c5e1 : [],
    currentProjectSnapshot: _0x2a7989,
    ...(_0x42fcc5?.scope || _0x4aead0 ? {
      scope: _0x42fcc5?.scope || _0x4aead0
    } : {})
  });
}
export function formatCleanupBytes(_0x511225) {
  const _0x31b1ee = Number(_0x511225 || 0);
  if (!Number.isFinite(_0x31b1ee) || _0x31b1ee <= 0) {
    return "0 B";
  }
  const _0x1887d6 = ["B", "KB", "MB", "GB", "TB"];
  let _0x48971f = _0x31b1ee;
  let _0x35fb4e = 0;
  while (_0x48971f >= 1024 && _0x35fb4e < _0x1887d6.length - 1) {
    _0x48971f /= 1024;
    _0x35fb4e += 1;
  }
  const _0x640b34 = _0x48971f >= 100 || _0x35fb4e === 0 ? 0 : _0x48971f >= 10 ? 1 : 2;
  return _0x48971f.toFixed(_0x640b34) + " " + _0x1887d6[_0x35fb4e];
}
export function summarizeLocalAssetCleanupScan(_0x365a1e = {}) {
  const _0x4501b3 = Number(_0x365a1e?.orphanCount || 0);
  const _0x5c2e88 = Number(_0x365a1e?.candidateCount || 0);
  const _0x196861 = Number(_0x365a1e?.orphanBytes || 0);
  if (!_0x365a1e?.ok) {
    return cleanupText("scanIncomplete");
  }
  if (_0x4501b3 <= 0) {
    return cleanupText("scanEmptySummary", {
      candidateCount: _0x5c2e88
    });
  }
  return cleanupText("scanFoundSummary", {
    candidateCount: _0x5c2e88,
    orphanCount: _0x4501b3,
    orphanBytes: formatCleanupBytes(_0x196861)
  });
}