import { cropGridTilesToServer, checkLocalMediaExistsOnServer, discardStagedAssetUploadToServer, deleteV2ProjectFromServer, ensureImageDerivativesToServer, fetchRemoteBlob, fetchV2ProjectFromServer, fetchV2ProjectsFromServer, saveV2ProjectToServer, saveOutputFromUrlToServer, stageAssetUploadToServer, saveOutputToServer, uploadFileToServer } from "../../api/projectsV2Api.js";
import { sanitizeMultiCanvasDataForPersistence } from "../utils/thumbnailPersistence.js";
import { localPathToUrl, normalizeLocalPath, pickResultLocalPath } from "../utils/localMediaPath.js";
import { buildImageNodeStorageFields, hasImageDerivativeFields, toLocalPathUrl } from "./imageDerivativeService.js";
import { PANORAMA_360_DEFAULT_NAME, PANORAMA_360_NODE_TYPE, PANORAMA_SCENE_DEFAULT_NAME, PANORAMA_SCENE_NODE_TYPE, getPanorama360DefaultName, getPanoramaSceneDefaultName, isPanorama360NodeType, isPanoramaSceneNodeType, normalizePanorama360State, normalizeSceneOnlyPanoramaSceneState } from "../modules/panoramaSceneNode/sceneNode.js";
import { desktopBridge } from "./desktopBridge.js";
import { saveTextDownload } from "./downloadSaveService.js";
const PROJECT_FILE_EXTENSION_RE = /\.(?:aicanvas|json)$/i;
const RETIRED_CANVAS_NODE_TYPES = new Set(["storyboard-3d"]);
function stripProjectFileExtension(_0x3e1b91) {
  return String(_0x3e1b91 || "").replace(PROJECT_FILE_EXTENSION_RE, "");
}
function _getActiveProjectIdentity() {
  if (typeof window === "undefined") {
    return "";
  }
  return stripProjectFileExtension(window.currentProjectId || window._v2CurrentFile || "");
}
const DEFAULT_PROJECT_NAME = "default_v2_project";
const REMOTE_SAVE_CACHE_LIMIT = 500;
const REMOTE_IMAGE_MAX_BYTES = 314572800;
const _remoteSaveInflight = new Map();
const _remoteSaveCache = new Map();
const _localStagedAssetImportInflight = new Map();
const _projectSaveTailById = new Map();
let _projectPersistenceBlockedReason = "";
export function setProjectPersistenceBlocked(_0x5bb981 = "项目尚未安全加载") {
  _projectPersistenceBlockedReason = String(_0x5bb981 || "项目尚未安全加载").trim();
}
export function clearProjectPersistenceBlock() {
  _projectPersistenceBlockedReason = "";
}
export function isProjectPersistenceBlocked() {
  return !!_projectPersistenceBlockedReason;
}
function _isLocalRelativeUrl(_0x495708) {
  const _0x14bc07 = String(_0x495708 || "").trim();
  return _0x14bc07.startsWith("/") && !_0x14bc07.startsWith("//");
}
function _shouldFetchClientSideBeforeSaving(_0x5afbfd) {
  const _0x4d2146 = String(_0x5afbfd || "").trim();
  return _0x4d2146.startsWith("blob:") || _0x4d2146.startsWith("data:") || _isLocalRelativeUrl(_0x4d2146);
}
function _buildRemoteSaveCacheKey(_0x3324fb, _0x3689e3, _0x3b8429 = {}) {
  const _0x50f874 = String(_0x3689e3 || "").trim();
  const _0x341801 = String(_0x3b8429?.dedupeKey || (_0x3b8429?.taskKey ? _0x3b8429.taskKey + ":" + _0x50f874 : _0x50f874)).trim();
  return (String(_0x3324fb || "media").trim() || "media") + ":" + (_0x341801 || _0x50f874);
}
function _rememberRemoteSave(_0x5967d1, _0x525c81) {
  if (!_0x5967d1 || !_0x525c81 || typeof _0x525c81 !== "object") {
    return;
  }
  _remoteSaveCache.set(_0x5967d1, _0x525c81);
  if (_remoteSaveCache.size > REMOTE_SAVE_CACHE_LIMIT) {
    const _0x10d5a5 = _remoteSaveCache.keys().next().value;
    if (_0x10d5a5) {
      _remoteSaveCache.delete(_0x10d5a5);
    }
  }
}
function _runRemoteSaveOnce(_0x150868, _0x1bdedd) {
  if (_remoteSaveCache.has(_0x150868)) {
    return Promise.resolve(_remoteSaveCache.get(_0x150868));
  }
  if (_remoteSaveInflight.has(_0x150868)) {
    return _remoteSaveInflight.get(_0x150868);
  }
  const _0x65bdff = Promise.resolve().then(_0x1bdedd).then(_0x55f2e3 => {
    _rememberRemoteSave(_0x150868, _0x55f2e3);
    return _0x55f2e3;
  });
  _remoteSaveInflight.set(_0x150868, _0x65bdff);
  _0x65bdff.finally(() => {
    if (_remoteSaveInflight.get(_0x150868) === _0x65bdff) {
      _remoteSaveInflight.delete(_0x150868);
    }
  }).catch(() => {});
  return _0x65bdff;
}
function _isPlainObject(_0x7df413) {
  return !!_0x7df413 && typeof _0x7df413 === "object" && !Array.isArray(_0x7df413);
}
function _migratePanoramaNodeInPlace(_0x2a9489) {
  if (!_isPlainObject(_0x2a9489)) {
    return;
  }
  const _0x59d6a4 = String(_0x2a9489.type || "").trim();
  if (isPanorama360NodeType(_0x59d6a4)) {
    _0x2a9489.type = PANORAMA_360_NODE_TYPE;
    const _0x51b8b3 = _isPlainObject(_0x2a9489.panorama360Node) ? _0x2a9489.panorama360Node : _0x2a9489.sceneNode;
    _0x2a9489.panorama360Node = normalizePanorama360State(_0x51b8b3);
    delete _0x2a9489.sceneNode;
    if (!String(_0x2a9489.name || "").trim()) {
      _0x2a9489.name = getPanorama360DefaultName();
    }
    return;
  }
  if (!isPanoramaSceneNodeType(_0x59d6a4)) {
    return;
  }
  _0x2a9489.type = PANORAMA_SCENE_NODE_TYPE;
  const _0x388972 = _isPlainObject(_0x2a9489.sceneNode) ? _0x2a9489.sceneNode : _0x2a9489.panorama360Node;
  const _0x2f9d58 = normalizeSceneOnlyPanoramaSceneState(_0x388972);
  const _0x1775ae = String(_0x388972?.mode || "").trim().toLowerCase();
  const _0x1cee8f = _0x1775ae === "panorama";
  if (_0x1cee8f) {
    _0x2a9489.type = PANORAMA_360_NODE_TYPE;
    _0x2a9489.panorama360Node = normalizePanorama360State(_0x388972);
    delete _0x2a9489.sceneNode;
    const _0xa0854e = String(_0x2a9489.name || "").trim();
    const _0x381361 = getPanoramaSceneDefaultName();
    if (!_0xa0854e || _0xa0854e === PANORAMA_SCENE_DEFAULT_NAME || _0xa0854e === _0x381361) {
      _0x2a9489.name = getPanorama360DefaultName();
    }
    return;
  }
  _0x2a9489.sceneNode = _0x2f9d58;
  delete _0x2a9489.panorama360Node;
  if (!String(_0x2a9489.name || "").trim()) {
    _0x2a9489.name = getPanoramaSceneDefaultName();
  }
}
function _migrateCanvasDataInPlace(_0x25007f) {
  const _0x1b1c59 = Array.isArray(_0x25007f?.canvases) ? _0x25007f.canvases : [];
  for (const _0x2e0fe4 of _0x1b1c59) {
    if (!_0x2e0fe4) {
      continue;
    }
    if (_0x2e0fe4.nodes && !Array.isArray(_0x2e0fe4.nodes)) {
      _0x2e0fe4.nodes = Object.values(_0x2e0fe4.nodes);
    }
    if (_0x2e0fe4.edges && !Array.isArray(_0x2e0fe4.edges)) {
      _0x2e0fe4.edges = Object.values(_0x2e0fe4.edges);
    }
    const _0x492ad3 = Array.isArray(_0x2e0fe4.nodes) ? _0x2e0fe4.nodes : [];
    const _0x5e1d34 = new Set(_0x492ad3.filter(_0x31e78f => RETIRED_CANVAS_NODE_TYPES.has(String(_0x31e78f?.type || ""))).map(_0xbef93c => String(_0xbef93c?.id || "")).filter(Boolean));
    _0x2e0fe4.nodes = _0x492ad3.filter(_0x3b2877 => !RETIRED_CANVAS_NODE_TYPES.has(String(_0x3b2877?.type || "")));
    if (_0x5e1d34.size > 0) {
      _0x2e0fe4.edges = (Array.isArray(_0x2e0fe4.edges) ? _0x2e0fe4.edges : []).filter(_0x42a5c1 => !_0x5e1d34.has(String(_0x42a5c1?.sourceId || "")) && !_0x5e1d34.has(String(_0x42a5c1?.targetId || "")));
    }
    for (const _0x5c1e20 of _0x2e0fe4.nodes) {
      _migratePanoramaNodeInPlace(_0x5c1e20);
    }
  }
  return _0x25007f;
}
const getCssVar = _0x30eef1 => getComputedStyle(document.documentElement).getPropertyValue(_0x30eef1).trim();
export function resolveCanvasData(_0x58998f) {
  if (!_0x58998f) {
    return _migrateCanvasDataInPlace({
      canvases: [{
        id: "canvas_1",
        name: "默认画布",
        nodes: [],
        edges: [],
        viewport: {
          x: 0,
          y: 0,
          zoom: 1.1
        }
      }],
      activeCanvasId: "canvas_1"
    });
  }
  if (Array.isArray(_0x58998f.canvases) && _0x58998f.canvases.length > 0) {
    let _0x292ed6 = _0x58998f.activeCanvasId || _0x58998f.canvases[0].id;
    const _0x35e31c = _0x58998f.canvases.find(_0x58218b => _0x58218b.id === _0x292ed6);
    if (_0x35e31c && (!_0x35e31c.nodes || _0x35e31c.nodes.length === 0) && (!_0x35e31c.storyboard3dProjects || _0x35e31c.storyboard3dProjects.length === 0)) {
      const _0x1c70aa = _0x58998f.canvases.find(_0x3ffbaf => _0x3ffbaf.nodes && _0x3ffbaf.nodes.length > 0 || _0x3ffbaf.storyboard3dProjects && _0x3ffbaf.storyboard3dProjects.length > 0);
      if (_0x1c70aa) {
        _0x292ed6 = _0x1c70aa.id;
      }
    }
    return _migrateCanvasDataInPlace({
      canvases: _0x58998f.canvases,
      activeCanvasId: _0x292ed6
    });
  }
  let _0x198df3 = _0x58998f.nodes || _0x58998f.v2_nodes || [];
  let _0x37ac0c = _0x58998f.edges || _0x58998f.v2_edges || [];
  if (!Array.isArray(_0x198df3)) {
    _0x198df3 = Object.values(_0x198df3);
  }
  if (!Array.isArray(_0x37ac0c)) {
    _0x37ac0c = Object.values(_0x37ac0c);
  }
  const _0x498b59 = {
    id: "canvas_1",
    name: "默认画布",
    nodes: _0x198df3,
    edges: _0x37ac0c,
    viewport: _0x58998f.viewport || {
      x: 0,
      y: 0,
      zoom: 1.1
    }
  };
  return _migrateCanvasDataInPlace({
    canvases: [_0x498b59],
    activeCanvasId: "canvas_1"
  });
}
export async function loadProject(_0x54b9a5, {
  allowMissing = false
} = {}) {
  try {
    return await loadProjectStrict(_0x54b9a5);
  } catch (_0x46f5aa) {
    console.error("[projectService] 加载项目异常:", _0x46f5aa);
    if (allowMissing === true && _0x46f5aa?.code === "PROJECT_NOT_FOUND") {
      return resolveCanvasData({});
    }
    throw _0x46f5aa;
  }
}
export async function loadProjectStrict(_0x15ca91) {
  const _0x95284a = PROJECT_FILE_EXTENSION_RE.test(String(_0x15ca91 || "")) ? _0x15ca91 : _0x15ca91 + ".aicanvas";
  const _0x40de17 = await fetchV2ProjectFromServer(_0x15ca91);
  if (!_0x40de17) {
    const _0x19c9f0 = new Error("Project file not found: " + _0x95284a);
    _0x19c9f0.code = "PROJECT_NOT_FOUND";
    throw _0x19c9f0;
  }
  const _0x230a31 = resolveCanvasData(_0x40de17);
  console.log("[projectService] 项目 " + _0x15ca91 + " 已加载，共 " + _0x230a31.canvases.length + " 个画布页面");
  return _0x230a31;
}
async function _persistProjectSnapshot(_0x1da6f6, _0x2a854a, _0x17cd85) {
  try {
    const _0x45f63b = await saveV2ProjectToServer(_0x2a854a);
    if (_0x45f63b && _0x45f63b.success && _getActiveProjectIdentity() === _0x17cd85) {
      window._v2CurrentFile = _0x45f63b.filename;
      window.currentProjectId = stripProjectFileExtension(_0x45f63b.filename);
      _clearElectronRecoverySnapshotAfterSave();
    }
    console.log("[projectService] 项目 " + _0x1da6f6 + " 已持久化（" + _0x2a854a.canvases.length + " 个画布）");
    return _0x45f63b;
  } catch (_0x3cf8b3) {
    console.error("[projectService] 存档异常:", _0x3cf8b3);
    throw _0x3cf8b3;
  }
}
export async function saveProject(_0x2f3777, _0x53a995) {
  if (_projectPersistenceBlockedReason) {
    throw new Error(_projectPersistenceBlockedReason);
  }
  const _0x2d2172 = _getActiveProjectIdentity();
  const _0x481dcb = sanitizeMultiCanvasDataForPersistence(_0x53a995 || {});
  const _0x5033b1 = _0x2f3777 || DEFAULT_PROJECT_NAME;
  const _0x4ef2b9 = {
    projectName: _0x5033b1,
    activeCanvasId: _0x481dcb?.activeCanvasId || "canvas_1",
    canvases: _0x481dcb?.canvases || []
  };
  const _0x372512 = stripProjectFileExtension(String(_0x5033b1)).trim().toLowerCase();
  const _0xc14712 = _projectSaveTailById.get(_0x372512) || Promise.resolve();
  const _0x1d85b2 = _0xc14712.catch(() => undefined).then(() => _persistProjectSnapshot(_0x5033b1, _0x4ef2b9, _0x2d2172));
  const _0x1045a4 = _0x1d85b2.catch(() => undefined).finally(() => {
    if (_projectSaveTailById.get(_0x372512) === _0x1045a4) {
      _projectSaveTailById.delete(_0x372512);
    }
  });
  _projectSaveTailById.set(_0x372512, _0x1045a4);
  return await _0x1d85b2;
}
export async function getProjects() {
  try {
    return await fetchV2ProjectsFromServer();
  } catch {
    return [];
  }
}
export async function deleteProject(_0x5aeeb9) {
  try {
    return await deleteV2ProjectFromServer(_0x5aeeb9);
  } catch (_0x2e8a4d) {
    console.error("[projectService] 删除项目失败:", _0x2e8a4d);
    return false;
  }
}
function _getElectronImportAsset() {
  if (!desktopBridge.assetImport.canImportAsset()) {
    return null;
  }
  return _0x41c8f4 => desktopBridge.assetImport.importAsset(_0x41c8f4);
}
function _clearElectronRecoverySnapshotAfterSave() {
  if (!desktopBridge.project.isAvailable()) {
    return;
  }
  Promise.resolve().then(() => desktopBridge.project.clearRecoverySnapshot()).catch(_0x59dcbc => {
    console.warn("[projectService] 清理恢复快照失败:", _0x59dcbc);
  });
}
function _getElectronPathForFile(_0x1fc5e4) {
  if (!desktopBridge.assetImport.isAvailable()) {
    return "";
  }
  const _0x5275b4 = String(_0x1fc5e4?.path || "").trim();
  if (_0x5275b4) {
    return _0x5275b4;
  }
  try {
    return String(desktopBridge.assetImport.getPathForFile(_0x1fc5e4) || "").trim();
  } catch {
    return "";
  }
}
async function _importAssetWithElectron(_0x50ee37, _0x1bf0f0) {
  const _0x4bb38d = _getElectronImportAsset();
  if (!_0x4bb38d || !_0x50ee37) {
    return null;
  }
  const _0x36769b = {
    name: _0x50ee37.name || "asset",
    type: _0x50ee37.type || "",
    projectId: _0x1bf0f0
  };
  const _0x2ca4fd = _getElectronPathForFile(_0x50ee37);
  if (_0x2ca4fd) {
    _0x36769b.path = _0x2ca4fd;
  } else if (typeof _0x50ee37.arrayBuffer === "function") {
    _0x36769b.bytes = await _0x50ee37.arrayBuffer();
  } else {
    return null;
  }
  return _normalizeImageSaveResult(await _0x4bb38d(_0x36769b));
}
export function importLocalStagedAsset(_0x597c17, _0x1435fb = {}) {
  const _0x1f141c = normalizeLocalPath(_0x597c17);
  if (!_0x1f141c.startsWith("data/uploads/")) {
    throw new Error("Only staged local uploads can be imported as assets");
  }
  if (!desktopBridge.isChromeShell) {
    return null;
  }
  const _0x39ab2d = _getElectronImportAsset();
  if (!_0x39ab2d) {
    return null;
  }
  const _0x1488bc = _localStagedAssetImportInflight.get(_0x1f141c);
  if (_0x1488bc) {
    return _0x1488bc;
  }
  const _0x54825b = Promise.resolve().then(() => _0x39ab2d({
    name: String(_0x1435fb?.name || "").trim() || _0x1f141c.split("/").pop() || "asset",
    type: String(_0x1435fb?.type || "").trim(),
    projectId: _0x1435fb?.projectId,
    localPath: _0x1f141c
  })).then(_0x3475eb => {
    const _0x64f3b = _normalizeImageSaveResult(_0x3475eb);
    if (!_0x64f3b?.success) {
      throw new Error("Canonical asset import failed");
    }
    return _0x64f3b;
  }).finally(() => {
    if (_localStagedAssetImportInflight.get(_0x1f141c) === _0x54825b) {
      _localStagedAssetImportInflight.delete(_0x1f141c);
    }
  });
  _localStagedAssetImportInflight.set(_0x1f141c, _0x54825b);
  return _0x54825b;
}
async function _importStagedChromeShellAsset(_0x5993ad, _0x2df0b) {
  if (!desktopBridge.isChromeShell || !_0x5993ad) {
    return null;
  }
  const _0x4af8f4 = _normalizeImageSaveResult(await stageAssetUploadToServer(_0x5993ad));
  const _0x1009bd = pickResultLocalPath(_0x4af8f4) || urlToLocalPath(_0x4af8f4?.url);
  if (!_0x1009bd) {
    throw new Error("Chrome shell staged upload did not return a local path");
  }
  try {
    const _0x3c976c = await importLocalStagedAsset(_0x1009bd, {
      name: _0x5993ad.name || _0x4af8f4?.filename || "asset",
      type: _0x5993ad.type || "",
      projectId: _0x2df0b
    });
    if (_0x4af8f4?.stageId) {
      discardStagedAssetUploadToServer(_0x4af8f4.stageId).catch(() => {});
    }
    return _0x3c976c;
  } catch (_0x4c185c) {
    if (!String(_0x5993ad.type || "").toLowerCase().startsWith("video/")) {
      throw _0x4c185c;
    }
    return {
      ..._0x4af8f4,
      success: true,
      stagedUploadId: _0x4af8f4.stageId || "",
      canonicalImportPending: true,
      canonicalImportStatus: "failed",
      canonicalImportError: String(_0x4c185c?.message || _0x4c185c || "")
    };
  }
}
export function discardLocalStagedAsset(_0x4bfd72) {
  return discardStagedAssetUploadToServer(_0x4bfd72);
}
export async function uploadFile(_0x3b54ef, _0x12f877) {
  try {
    const _0x1462e9 = _getElectronPathForFile(_0x3b54ef);
    if (desktopBridge.isChromeShell && !_0x1462e9) {
      const _0x3b28aa = await _importStagedChromeShellAsset(_0x3b54ef, _0x12f877);
      if (_0x3b28aa?.success) {
        return _0x3b28aa;
      }
      throw new Error("Chrome shell canonical asset import failed");
    }
    try {
      const _0x58625d = await _importAssetWithElectron(_0x3b54ef, _0x12f877);
      if (_0x58625d?.success) {
        return _0x58625d;
      }
    } catch (_0x553ec4) {
      console.warn("[projectService] Electron 素材导入失败，回退上传流程:", _0x553ec4);
    }
    return _normalizeImageSaveResult(await uploadFileToServer(_0x3b54ef));
  } catch (_0x3e7c75) {
    console.error("[projectService] 文件上传异常:", _0x3e7c75);
    throw _0x3e7c75;
  }
}
export async function saveOutputBlob(_0x1cd155, _0x3aff37 = {}) {
  return _normalizeImageSaveResult(await saveOutputToServer(_0x1cd155, _0x3aff37));
}
export async function cropGridTiles(_0x7774b3 = {}) {
  const _0x44205d = await cropGridTilesToServer(_0x7774b3);
  if (!_0x44205d || typeof _0x44205d !== "object") {
    return _0x44205d;
  }
  const _0x4c838e = Array.isArray(_0x44205d.tiles) ? _0x44205d.tiles.map(_0x2c9207 => _normalizeImageSaveResult(_0x2c9207)) : [];
  return {
    ..._0x44205d,
    tiles: _0x4c838e
  };
}
export async function saveOutputFromUrl(_0x2c46cc, _0x449c0c = {}) {
  const _0x39d7f0 = String(_0x2c46cc || "").trim();
  if (_shouldFetchClientSideBeforeSaving(_0x39d7f0)) {
    try {
      const _0x23b061 = await fetchRemoteBlob(_0x39d7f0);
      return await saveOutputBlob(_0x23b061, _0x449c0c);
    } catch (_0x4b56e) {
      console.error("[projectService] Client-side output blob save failed:", _0x4b56e);
      return {
        error: "Client-side output blob save failed: " + _0x4b56e.message
      };
    }
  }
  return _normalizeImageSaveResult(await saveOutputFromUrlToServer({
    url: _0x39d7f0,
    ..._0x449c0c
  }));
}
function _guessAudioExtFromUrl(_0x2f3225) {
  try {
    const _0x443e3e = new URL(String(_0x2f3225 || ""), "http://localhost");
    const _0x448988 = String(_0x443e3e.pathname || "").match(/\.([a-z0-9]{1,5})$/i);
    const _0x21b727 = String(_0x448988?.[1] || "").toLowerCase();
    if (["wav", "mp3", "m4a", "flac", "aac", "ogg", "opus", "wma", "amr", "webm"].includes(_0x21b727)) {
      return _0x21b727;
    }
  } catch {}
  return "";
}
function _guessAudioExtFromMime(_0x1a61db) {
  const _0x13073d = String(_0x1a61db || "").trim().toLowerCase();
  if (!_0x13073d) {
    return "";
  }
  if (_0x13073d === "audio/mpeg") {
    return "mp3";
  }
  if (_0x13073d === "audio/wav" || _0x13073d === "audio/x-wav") {
    return "wav";
  }
  if (_0x13073d === "audio/mp4" || _0x13073d === "audio/x-m4a") {
    return "m4a";
  }
  if (_0x13073d === "audio/flac" || _0x13073d === "audio/x-flac") {
    return "flac";
  }
  if (_0x13073d === "audio/aac") {
    return "aac";
  }
  if (_0x13073d === "audio/ogg") {
    return "ogg";
  }
  if (_0x13073d === "audio/opus") {
    return "opus";
  }
  if (_0x13073d === "audio/webm") {
    return "webm";
  }
  if (_0x13073d === "audio/amr") {
    return "amr";
  }
  return "";
}
function _toLocalAudioResult(_0x963bc5) {
  const _0x4c67cd = normalizeLocalPath(_0x963bc5?.localPath || _0x963bc5?.originalLocalPath || _0x963bc5?.path);
  const _0x5ef09e = localPathToUrl(_0x4c67cd);
  return {
    ...(_0x963bc5 && typeof _0x963bc5 === "object" ? _0x963bc5 : {}),
    localPath: _0x4c67cd,
    localUrl: _0x5ef09e
  };
}
export async function saveRemoteAudioLocallyDetailed(_0x43292d, _0x549866 = {}) {
  const _0x317dc8 = String(_0x43292d || "").trim();
  if (!_0x317dc8) {
    throw new Error("保存音频失败: 缺少 remoteUrl");
  }
  return _runRemoteSaveOnce(_buildRemoteSaveCacheKey("audio", _0x317dc8, _0x549866), async () => {
    if (_0x317dc8.startsWith("blob:") || _0x317dc8.startsWith("data:")) {
      const _0x19472d = await fetchRemoteBlob(_0x317dc8);
      const _0x4f5110 = _guessAudioExtFromMime(_0x19472d?.type) || "mp3";
      return _toLocalAudioResult(await saveOutputBlob(_0x19472d, {
        ext: _0x4f5110,
        ..._0x549866
      }));
    }
    const _0x5a81f5 = _guessAudioExtFromUrl(_0x317dc8) || "mp3";
    try {
      return _toLocalAudioResult(await saveOutputFromUrl(_0x317dc8, {
        ext: _0x5a81f5,
        maxBytes: 209715200,
        ..._0x549866
      }));
    } catch {}
    const _0x12dadc = await fetchRemoteBlob(_0x317dc8);
    const _0x219ae3 = _guessAudioExtFromMime(_0x12dadc?.type) || _0x5a81f5;
    return _toLocalAudioResult(await saveOutputBlob(_0x12dadc, {
      ext: _0x219ae3,
      ..._0x549866
    }));
  });
}
function _toLocalUrlFromSaveResult(_0xf76512) {
  return localPathToUrl(_0xf76512?.originalLocalPath) || localPathToUrl(pickResultLocalPath(_0xf76512));
}
function _stringifyRemoteSaveError(_0x12e418) {
  if (!_0x12e418) {
    return "";
  }
  if (typeof _0x12e418.getUserMessage === "function") {
    try {
      const _0x346faa = String(_0x12e418.getUserMessage() || "").trim();
      if (_0x346faa) {
        return _0x346faa;
      }
    } catch {}
  }
  if (typeof _0x12e418 === "string") {
    return _0x12e418.trim();
  }
  const _0x14160f = _0x12e418?.message || _0x12e418?.errorMessage || _0x12e418?.error_message || _0x12e418?.reason || _0x12e418?.detail || _0x12e418?.details || _0x12e418?.error;
  if (_0x14160f !== undefined && _0x14160f !== null && _0x14160f !== _0x12e418) {
    return _stringifyRemoteSaveError(_0x14160f);
  }
  try {
    return JSON.stringify(_0x12e418);
  } catch {
    return String(_0x12e418 || "").trim();
  }
}
function _createRemoteImageSaveError({
  serverError = null,
  clientError = null
} = {}) {
  const _0x4b7337 = [];
  const _0x2d09c3 = _stringifyRemoteSaveError(serverError);
  const _0x5b998c = _stringifyRemoteSaveError(clientError);
  if (_0x2d09c3) {
    _0x4b7337.push("服务端下载失败：" + _0x2d09c3);
  }
  if (_0x5b998c) {
    _0x4b7337.push("浏览器下载失败：" + _0x5b998c);
  }
  const _0x2cd0d0 = new Error(_0x4b7337.length > 0 ? "保存到本地失败：" + _0x4b7337.join("；") : "保存到本地失败");
  _0x2cd0d0.serverError = serverError || null;
  _0x2cd0d0.clientError = clientError || null;
  return _0x2cd0d0;
}
function _normalizeImageSaveResult(_0xd1b530) {
  if (!_0xd1b530 || typeof _0xd1b530 !== "object") {
    return _0xd1b530;
  }
  if (!hasImageDerivativeFields(_0xd1b530)) {
    return _0xd1b530;
  }
  const _0x3a16c8 = buildImageNodeStorageFields(_0xd1b530);
  const _0x3083dd = {
    ..._0xd1b530,
    ..._0x3a16c8
  };
  if (!String(_0x3083dd.url || "").trim() && _0x3a16c8.localPath) {
    _0x3083dd.url = toLocalPathUrl(_0x3a16c8.localPath);
  }
  if (!String(_0x3083dd.originalUrl || "").trim() && _0x3a16c8.originalLocalPath) {
    _0x3083dd.originalUrl = toLocalPathUrl(_0x3a16c8.originalLocalPath);
  }
  if (!String(_0x3083dd.displayUrl || "").trim() && _0x3a16c8.displayLocalPath) {
    _0x3083dd.displayUrl = toLocalPathUrl(_0x3a16c8.displayLocalPath);
  }
  if (!String(_0x3083dd.thumbUrl || "").trim() && _0x3a16c8.thumbLocalPath) {
    _0x3083dd.thumbUrl = toLocalPathUrl(_0x3a16c8.thumbLocalPath);
  }
  return _0x3083dd;
}
function _guessImageExtFromUrl(_0x47818a) {
  const _0x70c0f3 = String(_0x47818a || "").trim();
  if (!_0x70c0f3) {
    return "";
  }
  try {
    const _0x58e14d = new URL(_0x70c0f3, window.location.href);
    const _0x1bf3c5 = String(_0x58e14d.pathname || "");
    const _0x5d3ff8 = _0x1bf3c5.match(/\.([a-z0-9]{1,5})$/i);
    const _0x283c53 = (_0x5d3ff8?.[1] || "").toLowerCase();
    if (!_0x283c53) {
      return "";
    }
    if (_0x283c53 === "jpeg") {
      return "jpg";
    }
    if (_0x283c53 === "jpg") {
      return "jpg";
    }
    if (_0x283c53 === "png") {
      return "png";
    }
    if (_0x283c53 === "webp") {
      return "webp";
    }
    if (_0x283c53 === "gif") {
      return "gif";
    }
    return "";
  } catch {
    return "";
  }
}
export async function ensureLocalImageDerivatives(_0x27907c) {
  return _normalizeImageSaveResult(await ensureImageDerivativesToServer({
    localPath: _0x27907c
  }));
}
export async function checkLocalMediaExists(_0x477763) {
  return await checkLocalMediaExistsOnServer({
    localPath: _0x477763
  });
}
export async function saveRemoteImageLocallyDetailed(_0x1a92d4, _0x130270, _0x23fd8a = {}) {
  const _0x48dcbd = String(_0x1a92d4 || "").trim();
  if (!_0x48dcbd) {
    throw new Error("保存到本地失败: 缺少 remoteUrl");
  }
  return _runRemoteSaveOnce(_buildRemoteSaveCacheKey("image", _0x48dcbd, _0x23fd8a), async () => {
    if (_0x48dcbd.startsWith("blob:") || _0x48dcbd.startsWith("data:")) {
      let _0x4a3ae4 = null;
      try {
        const _0x22479c = await fetchRemoteBlob(_0x48dcbd);
        let _0x3656ec = "png";
        if (_0x22479c.type === "image/jpeg") {
          _0x3656ec = "jpg";
        } else if (_0x22479c.type === "image/webp") {
          _0x3656ec = "webp";
        } else if (_0x22479c.type === "image/png") {
          _0x3656ec = "png";
        } else if (_0x22479c.type === "image/gif") {
          _0x3656ec = "gif";
        }
        const _0x1754b9 = await saveOutputBlob(_0x22479c, {
          ext: _0x3656ec,
          ..._0x23fd8a
        });
        const _0xa2762e = _toLocalUrlFromSaveResult(_0x1754b9);
        if (_0xa2762e) {
          return {
            ..._0x1754b9,
            localUrl: _0xa2762e
          };
        }
        throw new Error("服务器未返回本地路径");
      } catch (_0x58aecc) {
        _0x4a3ae4 = _0x58aecc;
      }
      throw _createRemoteImageSaveError({
        clientError: _0x4a3ae4
      });
    }
    let _0x28e95e = null;
    try {
      const _0x5b2a32 = _guessImageExtFromUrl(_0x48dcbd) || "png";
      const _0x34b724 = await saveOutputFromUrl(_0x48dcbd, {
        ext: _0x5b2a32,
        maxBytes: REMOTE_IMAGE_MAX_BYTES,
        ..._0x23fd8a
      });
      const _0x4b2560 = _toLocalUrlFromSaveResult(_0x34b724);
      if (_0x4b2560) {
        return {
          ..._0x34b724,
          localUrl: _0x4b2560
        };
      }
      throw new Error("服务器未返回本地路径");
    } catch (_0x3c5eea) {
      _0x28e95e = _0x3c5eea;
    }
    try {
      const _0x40528c = await fetchRemoteBlob(_0x48dcbd);
      let _0x3bda98 = "png";
      if (_0x40528c.type === "image/jpeg") {
        _0x3bda98 = "jpg";
      } else if (_0x40528c.type === "image/webp") {
        _0x3bda98 = "webp";
      } else if (_0x40528c.type === "image/png") {
        _0x3bda98 = "png";
      } else if (_0x40528c.type === "image/gif") {
        _0x3bda98 = "gif";
      }
      const _0x4216fb = await saveOutputBlob(_0x40528c, {
        ext: _0x3bda98,
        ..._0x23fd8a
      });
      const _0x57add0 = _toLocalUrlFromSaveResult(_0x4216fb);
      if (_0x57add0) {
        return {
          ..._0x4216fb,
          localUrl: _0x57add0
        };
      }
      throw new Error("服务器未返回本地路径");
    } catch (_0x269343) {
      throw _createRemoteImageSaveError({
        serverError: _0x28e95e,
        clientError: _0x269343
      });
    }
  });
}
export async function saveRemoteImageLocally(_0x35f04b, _0xa905a2, _0x3290bf = {}) {
  const _0x1393a1 = await saveRemoteImageLocallyDetailed(_0x35f04b, _0xa905a2, _0x3290bf);
  return String(_0x1393a1?.localUrl || "").trim() || _toLocalUrlFromSaveResult(_0x1393a1);
}
export function exportProject(_0x228e4c, _0x46a452) {
  return saveTextDownload({
    filename: _0x228e4c + ".aicanvas",
    content: JSON.stringify(_0x46a452, null, 2),
    mimeType: "application/json",
    filterName: "SHUO Canvas Project"
  });
}
export async function importProject(_0x4d133a) {
  return new Promise((_0x487b6e, _0x2b941b) => {
    const _0x262ff2 = new FileReader();
    _0x262ff2.onload = _0x3cf5ea => {
      try {
        const _0xcb3f8 = JSON.parse(_0x3cf5ea.target.result);
        const _0x31bd5a = resolveCanvasData(_0xcb3f8);
        _0x487b6e(_0x31bd5a);
      } catch (_0x2af9de) {
        _0x2b941b(new Error("解析 JSON 存档失败"));
      }
    };
    _0x262ff2.onerror = () => _0x2b941b(new Error("文件读取失败"));
    _0x262ff2.readAsText(_0x4d133a);
  });
}