import { desktopBridge } from "../../services/desktopBridge.js";
import { RUNNINGHUB_DOMESTIC_PROFILE_ID, normalizeRunningHubModelApiProfileId, resolveRunningHubSiteProfileIdFromUrl } from "../runningHubProviderProfiles.js";
const PANEL_KIND_KEYS = Object.freeze(["image", "video", "audio"]);
const SOURCE_TYPES = Object.freeze({
  runninghub: "runninghub-ai-app",
  comfyuiLocal: "comfyui-local-workflow",
  comfyuiCloud: "comfyui-cloud-workflow"
});
const SOURCE_TYPE_KEYS = Object.freeze(Object.values(SOURCE_TYPES));
const COMFYUI_WORKFLOW_STATE_SCOPE = "comfyui-workflow";
const DEFAULT_AI_APP_NAME = "未命名 AI应用";
const SAVED_APPS_STORAGE_KEY = "aiCanvas.runningHubAiApp.savedApps.v1";
const PANEL_DRAFT_STORAGE_KEY = "aiCanvas.runningHubAiApp.panelDraft.v1";
const CUSTOM_AI_APP_STORAGE_SAVE_DELAY_MS = 250;
function normalizeKind(_0x30de89) {
  if (PANEL_KIND_KEYS.includes(_0x30de89)) {
    return _0x30de89;
  } else {
    return "image";
  }
}
function normalizeSourceType(_0x14649e) {
  const _0x3523e1 = String(_0x14649e || "").trim();
  if (SOURCE_TYPE_KEYS.includes(_0x3523e1)) {
    return _0x3523e1;
  } else {
    return "";
  }
}
function isComfyUiSource(_0x2bd97a) {
  const _0x421875 = normalizeSourceType(_0x2bd97a);
  return _0x421875 === SOURCE_TYPES.comfyuiLocal || _0x421875 === SOURCE_TYPES.comfyuiCloud;
}
function cloneComponentDrafts(_0x528b96 = []) {
  if (Array.isArray(_0x528b96)) {
    return _0x528b96.map(_0x416a6a => ({
      ..._0x416a6a
    }));
  } else {
    return [];
  }
}
function normalizeAppName(_0x32d8a) {
  const _0x4c5079 = String(_0x32d8a || "").trim();
  return _0x4c5079 || DEFAULT_AI_APP_NAME;
}
function normalizeAppDescription(_0x9d6fc3) {
  return String(_0x9d6fc3 || "").trim();
}
function normalizePromptHelpTooltip(_0x49e700) {
  return String(_0x49e700 || "").trim();
}
function buildKindStateKey(_0x5bafa1, _0x4055da) {
  const _0x30c998 = normalizeKind(_0x4055da);
  const _0x268993 = normalizeSourceType(_0x5bafa1);
  const _0x1f39ad = isComfyUiSource(_0x268993) ? COMFYUI_WORKFLOW_STATE_SCOPE : _0x268993;
  if (_0x1f39ad) {
    return _0x1f39ad + ":" + _0x30c998;
  } else {
    return _0x30c998;
  }
}
function buildLegacyKindStateKey(_0x5dc1d7, _0x56c2e4) {
  const _0x3daf0d = normalizeKind(_0x56c2e4);
  const _0x50c950 = normalizeSourceType(_0x5dc1d7);
  if (_0x50c950) {
    return _0x50c950 + ":" + _0x3daf0d;
  } else {
    return _0x3daf0d;
  }
}
function createSavedAppId() {
  const _0x127230 = typeof globalThis.crypto?.randomUUID === "function" ? globalThis.crypto.randomUUID() : Date.now() + "-" + Math.random().toString(36).slice(2, 10);
  return "rh-ai-app-" + _0x127230;
}
function serializeSavedAppRecord(_0x434932 = {}) {
  return {
    id: String(_0x434932.id || "").trim(),
    sourceType: normalizeSourceType(_0x434932.sourceType) || SOURCE_TYPES.runninghub,
    kind: normalizeKind(_0x434932.kind),
    runningHubProfileId: normalizeRunningHubModelApiProfileId(_0x434932.runningHubProfileId || resolveRunningHubSiteProfileIdFromUrl(_0x434932.input) || RUNNINGHUB_DOMESTIC_PROFILE_ID),
    name: normalizeAppName(_0x434932.name),
    description: normalizeAppDescription(_0x434932.description),
    promptHelpTooltip: normalizePromptHelpTooltip(_0x434932.promptHelpTooltip),
    input: String(_0x434932.input || ""),
    componentDraftKey: String(_0x434932.componentDraftKey || ""),
    componentDrafts: cloneComponentDrafts(_0x434932.componentDrafts),
    createdAt: String(_0x434932.createdAt || ""),
    updatedAt: String(_0x434932.updatedAt || "")
  };
}
function normalizeSavedAppRecord(_0x59ba84 = {}) {
  const _0x3e4198 = serializeSavedAppRecord(_0x59ba84);
  if (!_0x3e4198.id || !_0x3e4198.input.trim()) {
    return null;
  }
  return _0x3e4198;
}
function loadSavedAppsFromStorage(_0x517b93, _0x30084c) {
  try {
    const _0x2ba1f0 = _0x517b93?.getItem?.(SAVED_APPS_STORAGE_KEY);
    const _0x184262 = _0x2ba1f0 ? JSON.parse(_0x2ba1f0) : [];
    if (!Array.isArray(_0x184262)) {
      return [];
    }
    return _0x184262.map(normalizeSavedAppRecord).filter(Boolean);
  } catch (_0x3419bf) {
    _0x30084c("[RH AI App] load saved apps failed:", _0x3419bf);
    return [];
  }
}
function saveSavedAppsToStorage(_0x4a375a, _0x3435ad = [], _0x4259fe) {
  try {
    const _0x115d04 = _0x3435ad.map(serializeSavedAppRecord);
    _0x4a375a?.setItem?.(SAVED_APPS_STORAGE_KEY, JSON.stringify(_0x115d04));
  } catch (_0x28e99a) {
    _0x4259fe("[RH AI App] save saved apps failed:", _0x28e99a);
  }
}
function createEmptyKindState() {
  return {
    input: "",
    appName: DEFAULT_AI_APP_NAME,
    appDescription: "",
    promptHelpTooltip: "",
    runningHubProfileId: "",
    savedAppId: "",
    componentDraftKey: "",
    componentDrafts: [],
    componentCandidates: [],
    currentBundle: null,
    errorMessage: ""
  };
}
function createInitialKindStates() {
  const _0x121840 = PANEL_KIND_KEYS.reduce((_0x32810f, _0x56d36b) => {
    _0x32810f[_0x56d36b] = createEmptyKindState();
    return _0x32810f;
  }, {});
  SOURCE_TYPE_KEYS.forEach(_0x343bc7 => {
    PANEL_KIND_KEYS.forEach(_0x423486 => {
      _0x121840[buildKindStateKey(_0x343bc7, _0x423486)] = createEmptyKindState();
    });
  });
  return _0x121840;
}
function serializeKindStateForStorage(_0x34ee54 = {}) {
  return {
    input: String(_0x34ee54.input || ""),
    appName: normalizeAppName(_0x34ee54.appName),
    appDescription: normalizeAppDescription(_0x34ee54.appDescription),
    promptHelpTooltip: normalizePromptHelpTooltip(_0x34ee54.promptHelpTooltip),
    runningHubProfileId: String(_0x34ee54.runningHubProfileId || "").trim() ? normalizeRunningHubModelApiProfileId(_0x34ee54.runningHubProfileId) : "",
    savedAppId: String(_0x34ee54.savedAppId || ""),
    componentDraftKey: String(_0x34ee54.componentDraftKey || ""),
    componentDrafts: cloneComponentDrafts(_0x34ee54.componentDrafts),
    componentCandidates: cloneComponentDrafts(_0x34ee54.componentCandidates),
    errorMessage: String(_0x34ee54.errorMessage || "")
  };
}
function normalizeStoredKindState(_0x394d0b = {}) {
  return {
    ...createEmptyKindState(),
    ...serializeKindStateForStorage(_0x394d0b),
    currentBundle: null
  };
}
function normalizeKindStates(_0x3b9fc4 = {}) {
  const _0x4bf3ad = createInitialKindStates();
  Object.entries(_0x3b9fc4 || {}).forEach(([_0x220ed8, _0x1c411e]) => {
    if (!_0x220ed8) {
      return;
    }
    _0x4bf3ad[_0x220ed8] = normalizeStoredKindState(_0x1c411e);
  });
  return _0x4bf3ad;
}
function loadPanelDraftFromStorage(_0x7523a1, _0x50f4e2) {
  try {
    const _0x54cfdf = _0x7523a1?.getItem?.(PANEL_DRAFT_STORAGE_KEY);
    const _0x489deb = _0x54cfdf ? JSON.parse(_0x54cfdf) : null;
    if (!_0x489deb || typeof _0x489deb !== "object") {
      return null;
    }
    return normalizePanelDraftPayload(_0x489deb);
  } catch (_0x20f4ef) {
    _0x50f4e2("[RH AI App] load panel draft failed:", _0x20f4ef);
    return null;
  }
}
function savePanelDraftToStorage(_0x205766, _0x4390cd, _0xa81f70) {
  try {
    const _0x324583 = serializePanelDraftForStorage(_0x4390cd);
    _0x205766?.setItem?.(PANEL_DRAFT_STORAGE_KEY, JSON.stringify(_0x324583));
  } catch (_0x39c0b4) {
    _0xa81f70("[RH AI App] save panel draft failed:", _0x39c0b4);
  }
}
function serializePanelDraftForStorage({
  sourceType = "",
  kind = "image",
  kindStates = {}
} = {}) {
  return {
    sourceType: normalizeSourceType(sourceType),
    kind: normalizeKind(kind),
    kindStates: Object.keys(kindStates || {}).reduce((_0x121ac3, _0x94f972) => {
      _0x121ac3[_0x94f972] = serializeKindStateForStorage(kindStates[_0x94f972]);
      return _0x121ac3;
    }, {})
  };
}
function normalizePanelDraftPayload(_0x39744b = {}) {
  if (!_0x39744b || typeof _0x39744b !== "object") {
    return null;
  }
  const _0x3e96df = _0x39744b.kindStates && typeof _0x39744b.kindStates === "object" ? _0x39744b.kindStates : {};
  return {
    sourceType: normalizeSourceType(_0x39744b.sourceType),
    kind: normalizeKind(_0x39744b.kind),
    kindStates: normalizeKindStates(_0x3e96df)
  };
}
function normalizeCustomAiAppStoragePayload(_0x5db8cf = {}) {
  const _0x32c7ca = Array.isArray(_0x5db8cf?.savedApps) ? _0x5db8cf.savedApps.map(normalizeSavedAppRecord).filter(Boolean) : [];
  return {
    ok: _0x5db8cf?.ok !== false,
    hasData: _0x5db8cf?.hasData === true,
    storageRoot: String(_0x5db8cf?.storageRoot || ""),
    savedApps: _0x32c7ca,
    panelDraft: normalizePanelDraftPayload(_0x5db8cf?.panelDraft)
  };
}
function buildCustomAiAppStoragePayload({
  savedApps = [],
  sourceType = "",
  kind = "image",
  kindStates = {}
} = {}) {
  return {
    savedApps: savedApps.map(serializeSavedAppRecord),
    panelDraft: serializePanelDraftForStorage({
      sourceType: sourceType,
      kind: kind,
      kindStates: kindStates
    })
  };
}
function getCustomAiAppStorageBridge(_0x45036d) {
  if (_0x45036d?.isAvailable?.() === true) {
    return _0x45036d;
  } else {
    return null;
  }
}
async function readCustomAiAppsFromFileStorage(_0x2b40a6) {
  const _0x31bc7c = getCustomAiAppStorageBridge(_0x2b40a6);
  if (!_0x31bc7c) {
    return null;
  }
  const _0x11a3e3 = await _0x31bc7c.read();
  return normalizeCustomAiAppStoragePayload(_0x11a3e3);
}
async function writeCustomAiAppsToFileStorage(_0x2f149e, _0xe4e7e3) {
  const _0x3b3a39 = getCustomAiAppStorageBridge(_0x2f149e);
  if (!_0x3b3a39) {
    return null;
  }
  return await _0x3b3a39.write(_0xe4e7e3);
}
export function createRhAiAppConfigRepository({
  storage = globalThis.window?.localStorage || globalThis.localStorage,
  externalBridge = desktopBridge.customAiApps,
  windowObject = globalThis.window || globalThis,
  getSnapshot = () => ({}),
  applyExternalSnapshot = () => {},
  onWarning = (..._0x612dc3) => console.warn(..._0x612dc3)
} = {}) {
  let _0x5acb06 = false;
  let _0xd32b63 = false;
  let _0x5439a2 = false;
  let _0xa721ae = 0;
  const _0x33f815 = () => {
    if (!_0xa721ae) {
      return;
    }
    windowObject?.clearTimeout?.(_0xa721ae);
    _0xa721ae = 0;
  };
  const _0x2dc578 = {
    loadLocalSeed() {
      const _0x1736d2 = loadPanelDraftFromStorage(storage, onWarning);
      const _0x571f93 = loadSavedAppsFromStorage(storage, onWarning);
      return {
        panelDraft: _0x1736d2,
        savedApps: _0x571f93,
        hasData: Boolean(_0x1736d2) || _0x571f93.length > 0
      };
    },
    saveSavedApps(_0x4d1569 = []) {
      saveSavedAppsToStorage(storage, _0x4d1569, onWarning);
      _0x2dc578.scheduleExternalPersist();
    },
    savePanelDraft(_0x5ddfe0 = {}) {
      savePanelDraftToStorage(storage, _0x5ddfe0, onWarning);
      _0x2dc578.scheduleExternalPersist();
    },
    createInitialKindStates: createInitialKindStates,
    createEmptyKindState: createEmptyKindState,
    getKindStateKey: buildKindStateKey,
    getLegacyKindStateKey: buildLegacyKindStateKey,
    buildSavedAppRecord(_0x5047e4 = {}, _0x33b77a = null) {
      const _0x3a8618 = new Date().toISOString();
      return serializeSavedAppRecord({
        ..._0x33b77a,
        ..._0x5047e4,
        id: String(_0x33b77a?.id || _0x5047e4?.id || "").trim() || createSavedAppId(),
        createdAt: _0x33b77a?.createdAt || _0x5047e4?.createdAt || _0x3a8618,
        updatedAt: _0x3a8618
      });
    },
    async hydrateExternalStorage({
      hasLocalSeed = false
    } = {}) {
      try {
        const _0x4f4bf0 = await readCustomAiAppsFromFileStorage(externalBridge);
        if (!_0x4f4bf0) {
          return null;
        }
        _0x5acb06 = true;
        if (_0x5439a2) {
          await _0x2dc578.flushExternalPersist();
          return _0x4f4bf0;
        }
        if (_0x4f4bf0.hasData) {
          _0xd32b63 = true;
          try {
            await applyExternalSnapshot(_0x4f4bf0);
          } finally {
            _0xd32b63 = false;
            _0x5439a2 = false;
          }
          return _0x4f4bf0;
        }
        if (hasLocalSeed) {
          await _0x2dc578.flushExternalPersist();
        }
        return _0x4f4bf0;
      } catch (_0x55df9e) {
        onWarning("[RH AI App] hydrate file storage failed:", _0x55df9e);
        return null;
      }
    },
    scheduleExternalPersist() {
      if (_0xd32b63 || !getCustomAiAppStorageBridge(externalBridge)) {
        return false;
      }
      if (!_0x5acb06) {
        _0x5439a2 = true;
        return false;
      }
      _0x5439a2 = false;
      _0x33f815();
      _0xa721ae = windowObject?.setTimeout?.(() => void _0x2dc578.flushExternalPersist(), CUSTOM_AI_APP_STORAGE_SAVE_DELAY_MS);
      return true;
    },
    async flushExternalPersist() {
      if (!getCustomAiAppStorageBridge(externalBridge)) {
        return null;
      }
      _0x33f815();
      const _0x844b7e = buildCustomAiAppStoragePayload(getSnapshot());
      try {
        const _0x441714 = await writeCustomAiAppsToFileStorage(externalBridge, _0x844b7e);
        _0x5439a2 = false;
        return _0x441714;
      } catch (_0x4c8763) {
        onWarning("[RH AI App] persist file storage failed:", _0x4c8763);
        return null;
      }
    },
    dispose() {
      _0x33f815();
    }
  };
  return Object.freeze(_0x2dc578);
}