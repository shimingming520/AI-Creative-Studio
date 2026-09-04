import { loadProject, resolveCanvasData, saveProject } from "./projectService.js";
import { desktopBridge } from "./desktopBridge.js";
import { sanitizeMultiCanvasDataForPersistence } from "../utils/thumbnailPersistence.js";
import { discardStagedProjectPackage, stageProjectPackageFile } from "../../api/projectPackageApi.js";
function getDesktopProjectApi() {
  if (!desktopBridge.project.api && !desktopBridge.isChromeShell) {
    return null;
  }
  return desktopBridge.project;
}
async function clearRecoverySnapshotAfterSave(_0x218a1b) {
  if (!_0x218a1b || typeof _0x218a1b.clearRecoverySnapshot !== "function") {
    return;
  }
  try {
    await _0x218a1b.clearRecoverySnapshot();
  } catch (_0x1b5a5d) {
    console.warn("[desktopProjectService] 清理恢复快照失败:", _0x1b5a5d);
  }
}
function isAutoDefaultRecentProject(_0x1a888e) {
  const _0x199c8b = String(_0x1a888e?.filename || "").trim().toLowerCase();
  const _0x5708ce = String(_0x1a888e?.name || "").trim();
  const _0x1c79fa = String(_0x1a888e?.displayPath || _0x1a888e?.path || "");
  return /\.(?:aicanvas|aicproj|json)$/i.test(_0x199c8b) && _0x199c8b.replace(/\.(?:aicanvas|aicproj|json)$/i, "") === "默认画布" && _0x5708ce === "默认画布" && /(^|[\\/])user[\\/]Canvas Project[\\/]/i.test(_0x1c79fa);
}
export function canUseDesktopProjectApi() {
  const _0x527719 = getDesktopProjectApi();
  return !!_0x527719 && typeof _0x527719.open === "function" && typeof _0x527719.save === "function" && typeof _0x527719.listRecent === "function" && typeof _0x527719.removeRecent === "function";
}
export function normalizeDesktopProjectOpenResult(_0x2e6c1a) {
  if (!_0x2e6c1a || _0x2e6c1a.canceled) {
    return _0x2e6c1a || {
      canceled: true
    };
  }
  return {
    ..._0x2e6c1a,
    multiData: resolveCanvasData(_0x2e6c1a.data || {})
  };
}
export async function openDesktopProject(_0x3eb7f6 = {}) {
  const _0x1a1ea2 = getDesktopProjectApi();
  if (!_0x1a1ea2 || typeof _0x1a1ea2.open !== "function") {
    throw new Error("Electron project API is unavailable");
  }
  const _0x5726ca = await _0x1a1ea2.open({
    recentId: _0x3eb7f6.recentId || ""
  });
  return normalizeDesktopProjectOpenResult(_0x5726ca);
}
export async function saveDesktopProject(_0x5b17f2, _0x5833be, _0x27834f = {}) {
  const _0x375b30 = sanitizeMultiCanvasDataForPersistence(_0x5833be || {});
  const _0x40bb41 = getDesktopProjectApi();
  if (_0x40bb41 && typeof _0x40bb41.save === "function") {
    const _0x106ece = await _0x40bb41.save({
      projectName: _0x5b17f2,
      projectId: _0x27834f.projectId || globalThis.window?.currentProjectId || "",
      recentId: _0x27834f.recentId || globalThis.window?._v2CurrentRecentProjectId || "",
      mode: _0x27834f.mode || "save",
      multiData: _0x375b30
    });
    if (_0x106ece?.success) {
      await clearRecoverySnapshotAfterSave(_0x40bb41);
    }
    return _0x106ece;
  }
  return await saveProject(_0x5b17f2, _0x375b30);
}
export async function exportDesktopProjectPackage(_0xc67b23, _0x146ae1, _0x173c34 = {}) {
  const _0x57c4fe = sanitizeMultiCanvasDataForPersistence(_0x146ae1 || {});
  const _0x338c81 = getDesktopProjectApi();
  if (!_0x338c81 || typeof _0x338c81.exportPackage !== "function") {
    throw new Error("Electron project package export API is unavailable");
  }
  return await _0x338c81.exportPackage({
    projectName: _0xc67b23,
    projectId: _0x173c34.projectId || globalThis.window?.currentProjectId || "",
    recentId: _0x173c34.recentId || globalThis.window?._v2CurrentRecentProjectId || "",
    displayPath: _0x173c34.displayPath || globalThis.window?._v2CurrentProjectDisplayPath || "",
    operationId: _0x173c34.operationId || "",
    multiData: _0x57c4fe
  });
}
export async function importDesktopProjectPackage(_0xa61ca5 = {}) {
  const _0x3fd734 = getDesktopProjectApi();
  if (!_0x3fd734 || typeof _0x3fd734.importPackage !== "function") {
    throw new Error("Electron project package import API is unavailable");
  }
  let _0x3672c4 = null;
  try {
    let _0x27cba7 = String(_0xa61ca5.path || "").trim();
    if (!_0x27cba7 && _0xa61ca5.file) {
      _0x3672c4 = await stageProjectPackageFile(_0xa61ca5.file, {
        signal: _0xa61ca5.signal
      });
      _0x27cba7 = _0x3672c4.path;
    }
    const _0x28de8c = await _0x3fd734.importPackage({
      path: _0x27cba7,
      operationId: _0xa61ca5.operationId || ""
    });
    return normalizeDesktopProjectOpenResult(_0x28de8c);
  } finally {
    if (_0x3672c4?.stageId) {
      try {
        await discardStagedProjectPackage(_0x3672c4.stageId);
      } catch (_0x272355) {
        console.warn("[desktopProjectService] 清理暂存项目包失败:", _0x272355);
      }
    }
  }
}
export async function listDesktopRecentProjects() {
  const _0x5d8861 = getDesktopProjectApi();
  if (!_0x5d8861 || typeof _0x5d8861.listRecent !== "function") {
    return [];
  }
  const _0x274a9b = await _0x5d8861.listRecent();
  if (Array.isArray(_0x274a9b)) {
    return _0x274a9b.filter(_0x30da4c => !isAutoDefaultRecentProject(_0x30da4c));
  } else {
    return [];
  }
}
export async function removeDesktopRecentProject(_0x5dce3c) {
  const _0x4bacbe = getDesktopProjectApi();
  if (!_0x4bacbe || typeof _0x4bacbe.removeRecent !== "function") {
    return [];
  }
  const _0x5b71e6 = await _0x4bacbe.removeRecent({
    recentId: _0x5dce3c
  });
  if (Array.isArray(_0x5b71e6)) {
    return _0x5b71e6;
  } else {
    return [];
  }
}
export async function loadProjectWithFallback(_0x342653) {
  return await loadProject(_0x342653);
}