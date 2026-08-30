import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import a213_0x47be2a from "node:path";
export const CUSTOM_AI_APP_STORAGE_VERSION = 1;
export const CUSTOM_AI_APP_STORAGE_DIRNAME = "custom-ai-apps";
export const CUSTOM_AI_APP_SOURCE_TYPES = Object.freeze(["runninghub-ai-app", "comfyui-local-workflow", "comfyui-cloud-workflow"]);
const SOURCE_DIR_BY_TYPE = Object.freeze({
  "runninghub-ai-app": "runninghub-ai-app",
  "comfyui-local-workflow": "comfyui-local-workflow",
  "comfyui-cloud-workflow": "comfyui-cloud-workflow"
});
const SAVED_APPS_FILENAME = "saved-apps.json";
const PANEL_DRAFT_FILENAME = "panel-draft.json";
const KIND_KEYS = Object.freeze(["image", "video", "audio"]);
function normalizeSourceType(_0x4b16a8) {
  const _0x216beb = String(_0x4b16a8 || "").trim();
  if (CUSTOM_AI_APP_SOURCE_TYPES.includes(_0x216beb)) {
    return _0x216beb;
  } else {
    return "";
  }
}
function normalizeKind(_0xda2463) {
  const _0x5d383f = String(_0xda2463 || "").trim();
  if (KIND_KEYS.includes(_0x5d383f)) {
    return _0x5d383f;
  } else {
    return "image";
  }
}
function cloneJson(_0x120b23, _0x775041) {
  try {
    return JSON.parse(JSON.stringify(_0x120b23 ?? _0x775041));
  } catch {
    return _0x775041;
  }
}
function readJsonFileSafe(_0x4da40e) {
  try {
    if (!existsSync(_0x4da40e)) {
      return null;
    }
    const _0x10d5c6 = readFileSync(_0x4da40e, "utf8").replace(/^\uFEFF/, "");
    const _0xe8fb7d = _0x10d5c6 ? JSON.parse(_0x10d5c6) : null;
    if (_0xe8fb7d && typeof _0xe8fb7d === "object") {
      return _0xe8fb7d;
    } else {
      return null;
    }
  } catch {
    return null;
  }
}
function writeJsonFileAtomic(_0x32c03f, _0x5244e8) {
  mkdirSync(a213_0x47be2a.dirname(_0x32c03f), {
    recursive: true
  });
  const _0x36af8a = _0x32c03f + "." + process.pid + "." + Date.now() + ".tmp";
  writeFileSync(_0x36af8a, JSON.stringify(_0x5244e8, null, 2) + "\n", "utf8");
  renameSync(_0x36af8a, _0x32c03f);
}
function getSourceDirName(_0x456ce2) {
  return SOURCE_DIR_BY_TYPE[normalizeSourceType(_0x456ce2)] || SOURCE_DIR_BY_TYPE["runninghub-ai-app"];
}
function getSourceFilePath(_0x11e0b1, _0x5e196a, _0x4c3892) {
  return a213_0x47be2a.join(_0x11e0b1, getSourceDirName(_0x5e196a), _0x4c3892);
}
function getStorageFilePaths(_0x735d70) {
  return CUSTOM_AI_APP_SOURCE_TYPES.flatMap(_0x9933dd => [getSourceFilePath(_0x735d70, _0x9933dd, SAVED_APPS_FILENAME), getSourceFilePath(_0x735d70, _0x9933dd, PANEL_DRAFT_FILENAME)]);
}
function readSavedAppsForSource(_0xcdc9fc, _0x5ba57f) {
  const _0x5d5684 = readJsonFileSafe(getSourceFilePath(_0xcdc9fc, _0x5ba57f, SAVED_APPS_FILENAME));
  const _0x5cdb4a = Array.isArray(_0x5d5684?.items) ? _0x5d5684.items : Array.isArray(_0x5d5684) ? _0x5d5684 : [];
  return _0x5cdb4a.filter(_0x6db94b => _0x6db94b && typeof _0x6db94b === "object").map(_0x169e03 => ({
    ...cloneJson(_0x169e03, {}),
    sourceType: normalizeSourceType(_0x169e03.sourceType) || _0x5ba57f
  }));
}
function splitSavedAppsBySource(_0x51d431 = []) {
  const _0x301f38 = CUSTOM_AI_APP_SOURCE_TYPES.reduce((_0x266baf, _0x14df98) => {
    _0x266baf[_0x14df98] = [];
    return _0x266baf;
  }, {});
  (Array.isArray(_0x51d431) ? _0x51d431 : []).forEach(_0x23e3b4 => {
    if (!_0x23e3b4 || typeof _0x23e3b4 !== "object") {
      return;
    }
    const _0x46adf2 = normalizeSourceType(_0x23e3b4.sourceType) || "runninghub-ai-app";
    _0x301f38[_0x46adf2].push({
      ...cloneJson(_0x23e3b4, {}),
      sourceType: _0x46adf2
    });
  });
  return _0x301f38;
}
function resolveKindStateTarget(_0x43673f) {
  const _0x1165a5 = String(_0x43673f || "").trim();
  if (!_0x1165a5) {
    return null;
  }
  const _0x35164c = _0x1165a5.indexOf(":");
  if (_0x35164c > 0) {
    const _0x42d0b0 = normalizeSourceType(_0x1165a5.slice(0, _0x35164c));
    if (_0x42d0b0) {
      return {
        sourceType: _0x42d0b0,
        kind: normalizeKind(_0x1165a5.slice(_0x35164c + 1))
      };
    }
  }
  return {
    sourceType: "runninghub-ai-app",
    kind: normalizeKind(_0x1165a5)
  };
}
function splitPanelDraftBySource(_0x674130 = {}) {
  const _0x24b9b4 = normalizeSourceType(_0x674130?.sourceType);
  const _0x16abfd = normalizeKind(_0x674130?.kind);
  const _0x2e73a1 = CUSTOM_AI_APP_SOURCE_TYPES.reduce((_0x25b339, _0x5a9e66) => {
    _0x25b339[_0x5a9e66] = {
      version: CUSTOM_AI_APP_STORAGE_VERSION,
      sourceType: _0x5a9e66,
      active: _0x24b9b4 === _0x5a9e66,
      kind: _0x24b9b4 === _0x5a9e66 ? _0x16abfd : "image",
      kindStates: {}
    };
    return _0x25b339;
  }, {});
  const _0xc8b1ec = _0x674130?.kindStates && typeof _0x674130.kindStates === "object" ? _0x674130.kindStates : {};
  Object.entries(_0xc8b1ec).forEach(([_0x1c7d90, _0x120b89]) => {
    const _0x35f283 = resolveKindStateTarget(_0x1c7d90);
    if (!_0x35f283) {
      return;
    }
    _0x2e73a1[_0x35f283.sourceType].kindStates[_0x35f283.kind] = cloneJson(_0x120b89, {});
  });
  return _0x2e73a1;
}
function readPanelDraftForSource(_0x2472b5, _0x5f3252) {
  const _0x4b2b12 = readJsonFileSafe(getSourceFilePath(_0x2472b5, _0x5f3252, PANEL_DRAFT_FILENAME));
  if (!_0x4b2b12 || typeof _0x4b2b12 !== "object") {
    return {
      sourceType: _0x5f3252,
      active: false,
      kind: "image",
      kindStates: {}
    };
  }
  const _0x3d55d6 = _0x4b2b12.kindStates && typeof _0x4b2b12.kindStates === "object" ? _0x4b2b12.kindStates : {};
  return {
    sourceType: _0x5f3252,
    active: _0x4b2b12.active === true,
    kind: normalizeKind(_0x4b2b12.kind),
    kindStates: cloneJson(_0x3d55d6, {})
  };
}
function combinePanelDrafts(_0x4e504b = []) {
  const _0x12dd52 = _0x4e504b.find(_0x5bf85c => _0x5bf85c?.active === true);
  const _0x584a18 = {};
  _0x4e504b.forEach(_0x13254e => {
    const _0x3b5820 = normalizeSourceType(_0x13254e?.sourceType);
    if (!_0x3b5820) {
      return;
    }
    Object.entries(_0x13254e.kindStates || {}).forEach(([_0x19d738, _0x471881]) => {
      _0x584a18[_0x3b5820 + ":" + normalizeKind(_0x19d738)] = cloneJson(_0x471881, {});
    });
  });
  return {
    sourceType: normalizeSourceType(_0x12dd52?.sourceType),
    kind: normalizeKind(_0x12dd52?.kind),
    kindStates: _0x584a18
  };
}
export function createCustomAiAppStorage({
  getDataDir: _0x2b13ab
} = {}) {
  function _0x29198b() {
    const _0x254b49 = String(typeof _0x2b13ab === "function" ? _0x2b13ab() : "").trim();
    if (!_0x254b49) {
      throw new Error("Custom AI app storage data directory is unavailable");
    }
    return a213_0x47be2a.join(a213_0x47be2a.resolve(_0x254b49), CUSTOM_AI_APP_STORAGE_DIRNAME);
  }
  function _0x45646d() {
    const _0x2659f5 = _0x29198b();
    const _0x20efb9 = getStorageFilePaths(_0x2659f5).some(_0x2e0f82 => existsSync(_0x2e0f82));
    const _0x5c3d28 = CUSTOM_AI_APP_SOURCE_TYPES.flatMap(_0x39d3d1 => readSavedAppsForSource(_0x2659f5, _0x39d3d1));
    const _0x1ea10f = combinePanelDrafts(CUSTOM_AI_APP_SOURCE_TYPES.map(_0x54178b => readPanelDraftForSource(_0x2659f5, _0x54178b)));
    return {
      ok: true,
      version: CUSTOM_AI_APP_STORAGE_VERSION,
      storageRoot: _0x2659f5,
      hasData: _0x20efb9,
      savedApps: _0x5c3d28,
      panelDraft: _0x1ea10f
    };
  }
  function _0x5d078a(_0x129ea1 = {}) {
    const _0x3a4244 = _0x29198b();
    mkdirSync(_0x3a4244, {
      recursive: true
    });
    const _0x2ff52d = splitSavedAppsBySource(_0x129ea1?.savedApps);
    CUSTOM_AI_APP_SOURCE_TYPES.forEach(_0x3d4377 => {
      writeJsonFileAtomic(getSourceFilePath(_0x3a4244, _0x3d4377, SAVED_APPS_FILENAME), {
        version: CUSTOM_AI_APP_STORAGE_VERSION,
        sourceType: _0x3d4377,
        items: _0x2ff52d[_0x3d4377] || []
      });
    });
    const _0x55b8f8 = splitPanelDraftBySource(_0x129ea1?.panelDraft);
    CUSTOM_AI_APP_SOURCE_TYPES.forEach(_0x35c514 => {
      writeJsonFileAtomic(getSourceFilePath(_0x3a4244, _0x35c514, PANEL_DRAFT_FILENAME), _0x55b8f8[_0x35c514]);
    });
    return {
      ok: true,
      version: CUSTOM_AI_APP_STORAGE_VERSION,
      storageRoot: _0x3a4244
    };
  }
  return {
    getStorageRoot: _0x29198b,
    read: _0x45646d,
    write: _0x5d078a
  };
}