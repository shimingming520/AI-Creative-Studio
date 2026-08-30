const STORAGE_KEY = "aiCanvas.agentModelSettings.v1";
const DEFAULT_AGENT_MODEL_SETTINGS = Object.freeze({
  provider: "volcengine",
  model: "volcengine/doubao-seed-2-1-turbo-260628",
  providerProfileId: "",
  providerProfileIdByModel: Object.freeze({}),
  temperature: 0,
  executionMode: "manual"
});
function getWindowObject(_0x4bcbeb) {
  if (_0x4bcbeb) {
    return _0x4bcbeb;
  }
  if (typeof window !== "undefined") {
    return window;
  }
  return null;
}
function normalizeProviderProfileMemory(_0x390499) {
  if (!_0x390499 || typeof _0x390499 !== "object" || Array.isArray(_0x390499)) {
    return {};
  }
  return Object.fromEntries(Object.entries(_0x390499).map(([_0x5ef886, _0x14ea7c]) => [String(_0x5ef886 || "").trim(), String(_0x14ea7c || "").trim()]).filter(([_0x3aa288, _0x4cad14]) => _0x3aa288 && _0x4cad14));
}
function normalizeSettings(_0x27fe29 = {}) {
  const _0x59dd6b = String(_0x27fe29.executionMode || "").trim() === "auto" ? "auto" : "manual";
  const _0x23515d = String(_0x27fe29.provider || "").trim();
  const _0x1a16c9 = String(_0x27fe29.model || "").trim();
  const _0x26a689 = Boolean(_0x23515d && _0x1a16c9);
  return {
    provider: _0x26a689 ? _0x23515d : DEFAULT_AGENT_MODEL_SETTINGS.provider,
    model: _0x26a689 ? _0x1a16c9 : DEFAULT_AGENT_MODEL_SETTINGS.model,
    providerProfileId: String(_0x27fe29.providerProfileId || "").trim(),
    providerProfileIdByModel: normalizeProviderProfileMemory(_0x27fe29.providerProfileIdByModel),
    temperature: Number.isFinite(Number(_0x27fe29.temperature)) ? Math.max(0, Math.min(2, Number(_0x27fe29.temperature))) : DEFAULT_AGENT_MODEL_SETTINGS.temperature,
    executionMode: _0x59dd6b
  };
}
export function createAgentModelSettings({
  windowObject = undefined
} = {}) {
  const _0x58d104 = getWindowObject(windowObject);
  function _0x4c17b8() {
    try {
      const _0x32a847 = _0x58d104?.localStorage?.getItem?.(STORAGE_KEY);
      if (!_0x32a847) {
        return {
          ...DEFAULT_AGENT_MODEL_SETTINGS
        };
      }
      return normalizeSettings({
        ...DEFAULT_AGENT_MODEL_SETTINGS,
        ...JSON.parse(_0x32a847)
      });
    } catch {
      return {
        ...DEFAULT_AGENT_MODEL_SETTINGS
      };
    }
  }
  function _0x42f620(_0x36c0cf = {}) {
    const _0xf453cc = normalizeSettings({
      ..._0x4c17b8(),
      ..._0x36c0cf
    });
    try {
      _0x58d104?.localStorage?.setItem?.(STORAGE_KEY, JSON.stringify(_0xf453cc));
    } catch {}
    return _0xf453cc;
  }
  return {
    getSettings: _0x4c17b8,
    updateSettings: _0x42f620
  };
}
export { DEFAULT_AGENT_MODEL_SETTINGS };