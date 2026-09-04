import { buildApiUrl } from "./apiBase.js";
import { get as a111_0x28365, post as a111_0x56a2bf, del as a111_0x45d964, requester } from "./requester.js";
import { normalizeLocalPath } from "../src/utils/localMediaPath.js";
const WORKFLOWS_FALLBACK_USER_FILE = "/api/v2/user/workflows.json";
const ASSET_CATEGORIES_USER_FILE = "/api/v2/user/asset-categories.json";
const PROJECT_FILE_EXTENSION_RE = /\.(?:aicanvas|json)$/i;
const _saveOutputFromUrlInflight = new Map();
const _saveOutputFromUrlCache = new Map();
const SAVE_OUTPUT_FROM_URL_CACHE_LIMIT = 500;
export const SAVE_OUTPUT_FROM_URL_TIMEOUT_MS = 300000;
export const ASSET_STAGE_UPLOAD_TIMEOUT_MS = 1800000;
const _localMediaStatInflight = new Map();
const _localMediaStatCache = new Map();
const LOCAL_MEDIA_EXISTS_CACHE_LIMIT = 1000;
const LOCAL_MEDIA_EXISTS_TRUE_CACHE_TTL_MS = 30000;
const LOCAL_MEDIA_EXISTS_FALSE_CACHE_TTL_MS = 3000;
function isLocalRelativeUrl(_0x2b3cb6) {
  const _0xb643a2 = String(_0x2b3cb6 || "").trim();
  return _0xb643a2.startsWith("/") && !_0xb643a2.startsWith("//");
}
function normalizePositiveTimeoutMs(_0x552496, _0x11e229) {
  const _0x4fe585 = Number(_0x552496);
  if (Number.isFinite(_0x4fe585) && _0x4fe585 > 0) {
    return _0x4fe585;
  } else {
    return _0x11e229;
  }
}
function _rememberSavedOutput(_0x4ca262, _0x75a815) {
  if (!_0x4ca262 || !_0x75a815 || typeof _0x75a815 !== "object") {
    return;
  }
  _saveOutputFromUrlCache.set(_0x4ca262, _0x75a815);
  if (_saveOutputFromUrlCache.size > SAVE_OUTPUT_FROM_URL_CACHE_LIMIT) {
    const _0x36198c = _saveOutputFromUrlCache.keys().next().value;
    if (_0x36198c) {
      _saveOutputFromUrlCache.delete(_0x36198c);
    }
  }
}
function _collectNormalizedLocalPaths(_0x5f3196) {
  const _0x20bc65 = new Set();
  for (const _0x8d95eb of Array.isArray(_0x5f3196) ? _0x5f3196 : []) {
    const _0x24c085 = normalizeLocalPath(_0x8d95eb);
    if (_0x24c085) {
      _0x20bc65.add(_0x24c085);
    }
  }
  return _0x20bc65;
}
function _evictSavedOutputCacheByLocalPaths(_0x3713fd) {
  const _0x3c5322 = _collectNormalizedLocalPaths(_0x3713fd);
  if (_0x3c5322.size === 0) {
    return;
  }
  for (const [_0x2c9c7c, _0x5e1fbf] of _saveOutputFromUrlCache.entries()) {
    const _0x46afd7 = normalizeLocalPath(_0x5e1fbf?.localPath || _0x5e1fbf?.path || _0x5e1fbf?.url);
    if (_0x46afd7 && _0x3c5322.has(_0x46afd7)) {
      _saveOutputFromUrlCache.delete(_0x2c9c7c);
    }
  }
}
function _evictLocalMediaExistsCacheByLocalPaths(_0x589608) {
  const _0x3d7c6e = _collectNormalizedLocalPaths(_0x589608);
  for (const _0x43634f of _0x3d7c6e) {
    const _0x5c985f = _localPathToStaticRequestPath(_0x43634f);
    if (_0x5c985f) {
      _localMediaStatCache.delete(_0x5c985f);
    }
  }
}
function _readLocalMediaStatCache(_0x573b85) {
  const _0x550dcc = _localMediaStatCache.get(_0x573b85);
  if (!_0x550dcc) {
    return undefined;
  }
  if (Number(_0x550dcc.expiresAt || 0) <= Date.now()) {
    _localMediaStatCache.delete(_0x573b85);
    return undefined;
  }
  return _0x550dcc.stat;
}
function _rememberLocalMediaStat(_0x466c46, _0xa9994e) {
  if (!_0x466c46) {
    return;
  }
  const _0x2506a3 = {
    exists: _0xa9994e?.exists === true,
    sizeBytes: Number.isSafeInteger(Number(_0xa9994e?.sizeBytes)) && Number(_0xa9994e.sizeBytes) >= 0 ? Number(_0xa9994e.sizeBytes) : 0,
    contentType: String(_0xa9994e?.contentType || "").trim(),
    lastModified: String(_0xa9994e?.lastModified || "").trim()
  };
  const _0x202e4d = _0x2506a3.exists ? LOCAL_MEDIA_EXISTS_TRUE_CACHE_TTL_MS : LOCAL_MEDIA_EXISTS_FALSE_CACHE_TTL_MS;
  _localMediaStatCache.set(_0x466c46, {
    stat: _0x2506a3,
    expiresAt: Date.now() + _0x202e4d
  });
  if (_localMediaStatCache.size > LOCAL_MEDIA_EXISTS_CACHE_LIMIT) {
    const _0x51d3bb = _localMediaStatCache.keys().next().value;
    if (_0x51d3bb) {
      _localMediaStatCache.delete(_0x51d3bb);
    }
  }
  return _0x2506a3;
}
function _normalizeProjectFilename(_0x208755) {
  const _0x58b023 = String(_0x208755 || "").trim();
  if (!_0x58b023) {
    return "default_v2_project.aicanvas";
  }
  if (PROJECT_FILE_EXTENSION_RE.test(_0x58b023)) {
    return _0x58b023;
  } else {
    return _0x58b023 + ".aicanvas";
  }
}
function _normalizeLegacyProjectFilename(_0x2a9ccd) {
  const _0x746c72 = String(_0x2a9ccd || "").trim();
  if (!_0x746c72) {
    return "default_v2_project.json";
  }
  if (PROJECT_FILE_EXTENSION_RE.test(_0x746c72)) {
    return _0x746c72;
  } else {
    return _0x746c72 + ".json";
  }
}
function _isNotFoundError(_0x290a73) {
  return Number(_0x290a73?.status) === 404 || /not found/i.test(String(_0x290a73?.message || ""));
}
function _extractWorkflowItems(_0x43f492) {
  if (Array.isArray(_0x43f492)) {
    return _0x43f492;
  }
  if (_0x43f492 && typeof _0x43f492 === "object" && Array.isArray(_0x43f492.items)) {
    return _0x43f492.items;
  }
  return [];
}
function _upsertWorkflowItems(_0x4a23b4, _0x247bd3) {
  const _0x2f831a = Array.isArray(_0x4a23b4) ? [..._0x4a23b4] : [];
  const _0x58f582 = String(_0x247bd3?.id || "").trim();
  if (!_0x58f582) {
    return _0x2f831a;
  }
  const _0x4a9f44 = _0x2f831a.findIndex(_0x3a5beb => String(_0x3a5beb?.id || "").trim() === _0x58f582);
  if (_0x4a9f44 >= 0) {
    _0x2f831a[_0x4a9f44] = {
      ..._0x2f831a[_0x4a9f44],
      ...(_0x247bd3 || {})
    };
  } else {
    _0x2f831a.unshift(_0x247bd3);
  }
  _0x2f831a.sort((_0x10f9b2, _0x1d6567) => Number(_0x1d6567?.updatedAt || 0) - Number(_0x10f9b2?.updatedAt || 0));
  return _0x2f831a;
}
export async function fetchV2ProjectFromServer(_0x557ffb) {
  const _0xc92e06 = _normalizeProjectFilename(_0x557ffb);
  const _0x1f8ca9 = "/api/v2/projects/" + encodeURIComponent(_0xc92e06);
  const _0x333327 = await a111_0x28365(_0x1f8ca9, {
    allow404Null: true,
    provider: "local"
  });
  if (_0x333327 || PROJECT_FILE_EXTENSION_RE.test(String(_0x557ffb || ""))) {
    return _0x333327;
  }
  const _0x389c97 = _normalizeLegacyProjectFilename(_0x557ffb);
  if (_0x389c97 !== _0xc92e06) {
    return await a111_0x28365("/api/v2/projects/" + encodeURIComponent(_0x389c97), {
      allow404Null: true,
      provider: "local"
    });
  }
  return _0x333327;
}
export async function saveV2ProjectToServer(_0x3a7f60) {
  const _0x7b6d7b = await a111_0x56a2bf("/api/v2/projects/save", _0x3a7f60 || {}, {
    provider: "local"
  });
  return _0x7b6d7b;
}
export async function fetchV2ProjectsFromServer() {
  const _0x7be44e = await a111_0x28365("/api/v2/projects", {
    provider: "local"
  });
  if (Array.isArray(_0x7be44e)) {
    return _0x7be44e;
  } else {
    return [];
  }
}
export async function deleteV2ProjectFromServer(_0x5ba36c) {
  const _0x5c88c3 = _normalizeProjectFilename(_0x5ba36c);
  try {
    await a111_0x45d964("/api/v2/projects/" + encodeURIComponent(_0x5c88c3), {
      provider: "local"
    });
    return true;
  } catch {
    const _0x374349 = _normalizeLegacyProjectFilename(_0x5ba36c);
    if (!PROJECT_FILE_EXTENSION_RE.test(String(_0x5ba36c || "")) && _0x374349 !== _0x5c88c3) {
      try {
        await a111_0x45d964("/api/v2/projects/" + encodeURIComponent(_0x374349), {
          provider: "local"
        });
        return true;
      } catch {
        return false;
      }
    }
    return false;
  }
}
export async function renameV2ProjectOnServer(_0x745f6d, _0x232bc9) {
  const _0x3ba8b9 = String(_0x232bc9 || "").trim();
  if (!_0x3ba8b9) {
    return {
      success: false
    };
  }
  const _0x263c33 = _normalizeProjectFilename(_0x745f6d);
  return await requester({
    url: "/api/v2/projects/" + encodeURIComponent(_0x263c33),
    method: "PATCH",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      name: _0x3ba8b9
    }),
    provider: "local"
  });
}
export async function fetchAssetsFromServer(_0x3ecb65 = {}) {
  try {
    const _0x1548ae = new URLSearchParams();
    for (const [_0x32b3de, _0x22967e] of Object.entries(_0x3ecb65 || {})) {
      if (_0x22967e === undefined || _0x22967e === null || _0x22967e === "") {
        continue;
      }
      _0x1548ae.set(_0x32b3de, String(_0x22967e));
    }
    const _0x29fa0d = _0x1548ae.toString() ? "?" + _0x1548ae.toString() : "";
    const _0xa82a6 = await a111_0x28365("/api/v2/assets" + _0x29fa0d, {
      provider: "local"
    });
    if (Array.isArray(_0xa82a6)) {
      return _0xa82a6;
    }
    if (_0xa82a6 && typeof _0xa82a6 === "object" && Array.isArray(_0xa82a6.items)) {
      return _0xa82a6;
    }
    return [];
  } catch {
    if (_0x3ecb65 && Object.keys(_0x3ecb65).length > 0) {
      return {
        items: [],
        total: 0,
        nextOffset: null,
        hasMore: false
      };
    } else {
      return [];
    }
  }
}
export async function fetchOutputFilesFromServer(_0x1eec1b = {}) {
  try {
    const _0xaa66d2 = new URLSearchParams();
    for (const [_0x10073b, _0x431ea2] of Object.entries(_0x1eec1b || {})) {
      if (_0x431ea2 === undefined || _0x431ea2 === null || _0x431ea2 === "") {
        continue;
      }
      _0xaa66d2.set(_0x10073b, String(_0x431ea2));
    }
    const _0x1b4227 = _0xaa66d2.toString() ? "?" + _0xaa66d2.toString() : "";
    const _0x19ec92 = await a111_0x28365("/api/v2/output-files" + _0x1b4227, {
      provider: "local"
    });
    if (_0x19ec92 && typeof _0x19ec92 === "object") {
      return _0x19ec92;
    } else {
      return {
        items: []
      };
    }
  } catch {
    return {
      items: []
    };
  }
}
export async function deleteOutputFilesFromServer(_0x40c6d9 = {}) {
  const _0x26ba74 = await a111_0x56a2bf("/api/v2/output-files/delete", _0x40c6d9 || {}, {
    provider: "local"
  });
  const _0x5f0252 = [...(Array.isArray(_0x40c6d9?.localPaths) ? _0x40c6d9.localPaths : []), ...(Array.isArray(_0x26ba74?.deleted) ? _0x26ba74.deleted : []), ...(Array.isArray(_0x26ba74?.deletedDerivatives) ? _0x26ba74.deletedDerivatives : []), ...(Array.isArray(_0x26ba74?.missing) ? _0x26ba74.missing : [])];
  _evictSavedOutputCacheByLocalPaths(_0x5f0252);
  _evictLocalMediaExistsCacheByLocalPaths(_0x5f0252);
  return _0x26ba74;
}
export async function saveOutputVideoThumbnailToServer(_0xea5481 = {}) {
  return await a111_0x56a2bf("/api/v2/output-files/video-thumbnail", _0xea5481 || {}, {
    provider: "local"
  });
}
export async function saveAssetToServer(_0x3b0bce) {
  const _0x3c74ef = await a111_0x56a2bf("/api/v2/assets/save", _0x3b0bce || {}, {
    provider: "local"
  });
  return _0x3c74ef;
}
export async function deleteAssetFromServer(_0x47a12f) {
  const _0x1310fd = _0x47a12f + ".json";
  try {
    await a111_0x45d964("/api/v2/assets/" + encodeURIComponent(_0x1310fd), {
      provider: "local"
    });
    return true;
  } catch {
    return false;
  }
}
export async function fetchAssetCategorySettingsFromServer() {
  try {
    const _0x5b6faa = await a111_0x28365(ASSET_CATEGORIES_USER_FILE, {
      provider: "local"
    });
    if (Array.isArray(_0x5b6faa)) {
      return {
        categories: _0x5b6faa,
        displayNames: {},
        parents: {}
      };
    }
    if (_0x5b6faa && typeof _0x5b6faa === "object") {
      const _0x1b8c0d = Array.isArray(_0x5b6faa.categories) ? _0x5b6faa.categories : Array.isArray(_0x5b6faa.items) ? _0x5b6faa.items : [];
      const _0x36dd1a = _0x5b6faa.displayNames && typeof _0x5b6faa.displayNames === "object" ? _0x5b6faa.displayNames : {};
      const _0x4781ca = _0x5b6faa.parents && typeof _0x5b6faa.parents === "object" ? _0x5b6faa.parents : {};
      return {
        categories: _0x1b8c0d,
        displayNames: _0x36dd1a,
        parents: _0x4781ca
      };
    }
    return {
      categories: [],
      displayNames: {},
      parents: {}
    };
  } catch {
    return {
      categories: [],
      displayNames: {},
      parents: {}
    };
  }
}
export async function fetchAssetCategoriesFromServer() {
  const _0x1f8f28 = await fetchAssetCategorySettingsFromServer();
  return _0x1f8f28.categories;
}
export async function saveAssetCategoriesToServer(_0x2d2f9b = [], {
  displayNames = {},
  parents = {}
} = {}) {
  const _0x6c04be = Array.isArray(_0x2d2f9b) ? _0x2d2f9b : [];
  const _0x54d209 = displayNames && typeof displayNames === "object" ? displayNames : {};
  const _0x479fbb = parents && typeof parents === "object" ? parents : {};
  const _0x52b7f3 = await a111_0x56a2bf(ASSET_CATEGORIES_USER_FILE, {
    version: 3,
    categories: _0x6c04be,
    displayNames: _0x54d209,
    parents: _0x479fbb
  }, {
    provider: "local"
  });
  return _0x52b7f3;
}
export async function saveAssetThumbToServer(_0x2fe53f) {
  const _0x53a35d = String(_0x2fe53f?.assetId ?? _0x2fe53f?.id ?? "").trim();
  const _0x230e36 = String(_0x2fe53f?.dataUrl || "");
  if (!_0x53a35d) {
    throw new Error("保存资产缩略图失败: 缺少 assetId");
  }
  if (!_0x230e36.startsWith("data:image/")) {
    throw new Error("保存资产缩略图失败: dataUrl 非法");
  }
  const _0x454b18 = await a111_0x56a2bf("/api/v2/assets/thumb/save", {
    ...(_0x2fe53f || {}),
    assetId: _0x53a35d
  }, {
    provider: "local"
  });
  return _0x454b18;
}
export async function fetchWorkflowsFromServer() {
  try {
    const _0x24c195 = await a111_0x28365("/api/v2/workflows", {
      provider: "local"
    });
    if (Array.isArray(_0x24c195)) {
      return _0x24c195;
    } else {
      return [];
    }
  } catch (_0x49f7d1) {
    if (!_isNotFoundError(_0x49f7d1)) {
      return [];
    }
    try {
      const _0x13481e = await a111_0x28365(WORKFLOWS_FALLBACK_USER_FILE, {
        provider: "local"
      });
      return _extractWorkflowItems(_0x13481e);
    } catch {
      return [];
    }
  }
}
async function deleteWorkflowFromFallbackFile(_0x1a9ad7) {
  const _0x3553be = await a111_0x28365(WORKFLOWS_FALLBACK_USER_FILE, {
    provider: "local"
  }).catch(() => ({}));
  const _0x6c53ff = String(_0x1a9ad7 || "").trim();
  const _0x973c42 = _extractWorkflowItems(_0x3553be).filter(_0x4053b0 => String(_0x4053b0?.id || "").trim() !== _0x6c53ff);
  await a111_0x56a2bf(WORKFLOWS_FALLBACK_USER_FILE, {
    items: _0x973c42
  }, {
    provider: "local"
  });
  return true;
}
async function saveWorkflowToFallbackFile(_0x3c3342) {
  const _0x3c0879 = await a111_0x28365(WORKFLOWS_FALLBACK_USER_FILE, {
    provider: "local"
  }).catch(() => ({}));
  const _0x278988 = _upsertWorkflowItems(_extractWorkflowItems(_0x3c0879), _0x3c3342 || {});
  await a111_0x56a2bf(WORKFLOWS_FALLBACK_USER_FILE, {
    items: _0x278988
  }, {
    provider: "local"
  });
  return {
    success: true,
    id: _0x3c3342?.id
  };
}
export async function saveWorkflowToServer(_0xcea7eb) {
  try {
    const _0x433241 = await a111_0x56a2bf("/api/v2/workflows/save", _0xcea7eb || {}, {
      provider: "local"
    });
    return _0x433241;
  } catch (_0x4dd069) {
    if (!_isNotFoundError(_0x4dd069)) {
      throw _0x4dd069;
    }
    return await saveWorkflowToFallbackFile(_0xcea7eb);
  }
}
export async function deleteWorkflowFromServer(_0x3a0d8d) {
  const _0xcdbe21 = String(_0x3a0d8d || "").trim();
  if (!_0xcdbe21) {
    return false;
  }
  const _0x4556d7 = _0xcdbe21 + ".json";
  try {
    await a111_0x45d964("/api/v2/workflows/" + encodeURIComponent(_0x4556d7), {
      provider: "local"
    });
    return true;
  } catch (_0x33cee6) {
    if (!_isNotFoundError(_0x33cee6)) {
      return false;
    }
    try {
      return await deleteWorkflowFromFallbackFile(_0xcdbe21);
    } catch {
      return false;
    }
  }
}
export async function saveWorkflowThumbToServer(_0x5ed7f6) {
  const _0x5598d2 = String(_0x5ed7f6?.workflowId ?? _0x5ed7f6?.id ?? "").trim();
  const _0x46e8db = String(_0x5ed7f6?.dataUrl || "");
  if (!_0x5598d2) {
    throw new Error("保存工作流封面失败: 缺少 workflowId");
  }
  if (!_0x46e8db.startsWith("data:image/")) {
    throw new Error("保存工作流封面失败: dataUrl 非法");
  }
  try {
    const _0x54d6f8 = await a111_0x56a2bf("/api/v2/workflows/thumb/save", {
      ...(_0x5ed7f6 || {}),
      workflowId: _0x5598d2
    }, {
      provider: "local"
    });
    return _0x54d6f8;
  } catch (_0x39130a) {
    if (!_isNotFoundError(_0x39130a)) {
      throw _0x39130a;
    }
    return {
      success: true,
      url: _0x46e8db,
      localPath: _0x46e8db,
      filename: _0x5598d2 + "_cover.inline"
    };
  }
}
export async function uploadFileToServer(_0x1f38e3) {
  const _0x3bc69f = _0x1f38e3?.name ? String(_0x1f38e3.name) : "file";
  const _0x26b7fa = new FormData();
  _0x26b7fa.append("file", _0x1f38e3, _0x3bc69f);
  const _0x3bc7aa = await a111_0x56a2bf("/api/upload?filename=" + encodeURIComponent(_0x3bc69f), _0x26b7fa, {
    provider: "local",
    timeout: ASSET_STAGE_UPLOAD_TIMEOUT_MS
  });
  return _0x3bc7aa;
}
export async function stageAssetUploadToServer(_0x3728de) {
  const _0xe2b74 = _0x3728de?.name ? String(_0x3728de.name) : "file";
  return await a111_0x56a2bf("/api/v2/assets/stage?filename=" + encodeURIComponent(_0xe2b74), _0x3728de, {
    provider: "local",
    timeout: ASSET_STAGE_UPLOAD_TIMEOUT_MS,
    retries: 0,
    headers: {
      "Content-Type": "application/octet-stream"
    }
  });
}
export async function discardStagedAssetUploadToServer(_0xd22f22) {
  const _0x1d2ae0 = String(_0xd22f22 || "").trim().toLowerCase();
  if (!/^[a-f0-9]{32}$/.test(_0x1d2ae0)) {
    return {
      success: false,
      removed: false
    };
  }
  return await a111_0x56a2bf("/api/v2/assets/stage/discard", {
    stageId: _0x1d2ae0
  }, {
    provider: "local",
    timeout: 30000,
    retries: 0
  });
}
export async function fetchRemoteBlob(_0x2f8fcf, _0x19cf12 = {}) {
  const _0x25ec5c = String(_0x2f8fcf || "").trim();
  const _0x25dcd4 = isLocalRelativeUrl(_0x25ec5c);
  const _0x138087 = await a111_0x28365(_0x25ec5c, {
    provider: _0x25dcd4 ? "local" : "remote",
    buildUrl: _0x25dcd4,
    responseType: "blob",
    signal: _0x19cf12?.signal,
    timeout: _0x19cf12?.timeout
  });
  return _0x138087;
}
export async function saveOutputToServer(_0x821cfd, _0x176b03 = {}) {
  const _0x1d30fe = String(_0x176b03?.ext || "").trim().toLowerCase() || "bin";
  const _0x4a396b = String(_0x176b03?.subDir || "").trim();
  const _0x29ab00 = String(_0x176b03?.kind || "").trim();
  const _0x14b73a = new URLSearchParams({
    ext: _0x1d30fe
  });
  if (_0x4a396b) {
    _0x14b73a.set("subDir", _0x4a396b);
  }
  if (_0x29ab00) {
    _0x14b73a.set("kind", _0x29ab00);
  }
  const _0x3536da = await a111_0x56a2bf("/api/v2/save_output?" + _0x14b73a.toString(), _0x821cfd, {
    provider: "local",
    headers: {
      "Content-Type": "application/octet-stream"
    }
  });
  return _0x3536da;
}
export async function saveOutputFromUrlToServer(_0x64c79e) {
  const _0x25acb5 = String(_0x64c79e?.url || "").trim();
  if (!_0x25acb5) {
    throw new Error("保存到 output 失败: 缺少 url");
  }
  const _0x153bcb = String(_0x64c79e?.dedupeKey || (_0x64c79e?.taskKey ? _0x64c79e.taskKey + ":" + _0x25acb5 : _0x25acb5)).trim();
  const _0x2f1972 = [_0x153bcb, String(_0x64c79e?.subDir || "").trim(), String(_0x64c79e?.kind || "").trim()].join("|");
  const _0x2f1973 = _0x2f1972 || _0x25acb5;
  if (_saveOutputFromUrlCache.has(_0x2f1973)) {
    return _saveOutputFromUrlCache.get(_0x2f1973);
  }
  if (_saveOutputFromUrlInflight.has(_0x2f1973)) {
    return _saveOutputFromUrlInflight.get(_0x2f1973);
  }
  const _0x3e88a2 = {
    url: _0x25acb5,
    ext: _0x64c79e?.ext,
    maxBytes: _0x64c79e?.maxBytes,
    dedupeKey: _0x153bcb,
    // 远程 URL 保存也必须携带项目目录/媒体类型，否则资源会落到通用
    // 输出目录，工作台项目树自然无法与工作室内容对齐。
    subDir: _0x64c79e?.subDir,
    kind: _0x64c79e?.kind
  };
  const _0x531508 = normalizePositiveTimeoutMs(_0x64c79e?.timeoutMs ?? _0x64c79e?.timeout, SAVE_OUTPUT_FROM_URL_TIMEOUT_MS);
  const _0x381e76 = a111_0x56a2bf("/api/v2/save_output_from_url", _0x3e88a2, {
    provider: "local",
    timeout: _0x531508
  }).then(_0x11f458 => {
    _rememberSavedOutput(_0x2f1973, _0x11f458);
    return _0x11f458;
  });
  _saveOutputFromUrlInflight.set(_0x2f1973, _0x381e76);
  _0x381e76.finally(() => {
    if (_saveOutputFromUrlInflight.get(_0x2f1973) === _0x381e76) {
      _saveOutputFromUrlInflight.delete(_0x2f1973);
    }
  }).catch(() => {});
  return _0x381e76;
}
export async function cropGridTilesToServer(_0x2e4b26 = {}) {
  const _0x3a7726 = String(_0x2e4b26?.localPath || _0x2e4b26?.path || "").trim();
  if (!_0x3a7726) {
    throw new Error("宫格裁切失败: 缺少 localPath");
  }
  const _0x47b899 = Math.round(Number(_0x2e4b26?.cols) || 0);
  const _0x4131ac = Math.round(Number(_0x2e4b26?.rows) || 0);
  if (_0x47b899 <= 0 || _0x4131ac <= 0) {
    throw new Error("宫格裁切失败: 网格尺寸非法");
  }
  const _0x18ae23 = {
    localPath: _0x3a7726,
    cols: _0x47b899,
    rows: _0x4131ac,
    ext: String(_0x2e4b26?.ext || "jpg").trim().toLowerCase() || "jpg",
    quality: Number(_0x2e4b26?.quality || 85)
  };
  const _0x275093 = String(_0x2e4b26?.subDir || "").trim();
  if (_0x275093) {
    _0x18ae23.subDir = _0x275093;
  }
  const _0x580e19 = await a111_0x56a2bf("/api/v2/grid_tiles/crop", _0x18ae23, {
    provider: "local"
  });
  return _0x580e19;
}
export async function ensureImageDerivativesToServer(_0xac7af7) {
  const _0x4ae801 = String(_0xac7af7?.localPath || _0xac7af7?.path || "").trim();
  if (!_0x4ae801) {
    throw new Error("生成图片派生文件失败: 缺少 localPath");
  }
  const _0x5b948f = await a111_0x56a2bf("/api/v2/images/derivatives/ensure", {
    localPath: _0x4ae801
  }, {
    provider: "local"
  });
  return _0x5b948f;
}
function _localPathToStaticRequestPath(_0x1c8d26) {
  const _0x4567cf = normalizeLocalPath(_0x1c8d26);
  if (!_0x4567cf) {
    return "";
  }
  return "/" + _0x4567cf.split("/").map(encodeURIComponent).join("/");
}
export async function statLocalMediaOnServer(_0x299e73) {
  const _0x4bce04 = typeof _0x299e73 === "string" ? _0x299e73 : String(_0x299e73?.localPath || _0x299e73?.path || "").trim();
  const _0x2127b8 = _localPathToStaticRequestPath(_0x4bce04);
  if (!_0x2127b8) {
    return {
      exists: false,
      sizeBytes: 0,
      contentType: "",
      lastModified: ""
    };
  }
  const _0x2974af = _readLocalMediaStatCache(_0x2127b8);
  if (_0x2974af !== undefined) {
    return _0x2974af;
  }
  if (_localMediaStatInflight.has(_0x2127b8)) {
    return await _localMediaStatInflight.get(_0x2127b8);
  }
  const _0x528299 = requester({
    url: _0x2127b8,
    method: "HEAD",
    provider: "local",
    responseType: "text",
    allow404Null: true,
    returnMeta: true,
    timeout: 10000
  }).then(_0x2aec5f => {
    const _0x3f3de8 = Number(_0x2aec5f?.status || 0);
    const _0x102e16 = _0x3f3de8 >= 200 && _0x3f3de8 < 400;
    const _0x5e9b82 = Number(_0x2aec5f?.headers?.get?.("content-length") || 0);
    return _rememberLocalMediaStat(_0x2127b8, {
      exists: _0x102e16,
      sizeBytes: _0x102e16 && Number.isSafeInteger(_0x5e9b82) && _0x5e9b82 >= 0 ? _0x5e9b82 : 0,
      contentType: _0x102e16 ? String(_0x2aec5f?.headers?.get?.("content-type") || "").trim() : "",
      lastModified: _0x102e16 ? String(_0x2aec5f?.headers?.get?.("last-modified") || "").trim() : ""
    });
  }).catch(() => {
    return _rememberLocalMediaStat(_0x2127b8, {
      exists: false,
      sizeBytes: 0,
      contentType: "",
      lastModified: ""
    });
  });
  _localMediaStatInflight.set(_0x2127b8, _0x528299);
  _0x528299.finally(() => {
    if (_localMediaStatInflight.get(_0x2127b8) === _0x528299) {
      _localMediaStatInflight.delete(_0x2127b8);
    }
  }).catch(() => {});
  return await _0x528299;
}
export async function checkLocalMediaExistsOnServer(_0x1d408c) {
  const _0x3ac9c3 = await statLocalMediaOnServer(_0x1d408c);
  return _0x3ac9c3.exists === true;
}
