import { getModelManifest, getModelsByKind } from "../../manifests/modelRegistry.js";
import { translateManifestText } from "../../i18n/manifestText.js";
const DEFAULT_MODEL_IDS = Object.freeze({
  text: "volcengine/doubao-seed-2-1-pro-260628",
  image: "apimart/seedream-5.0-pro",
  video: "apimart/doubao-seedance-2.0"
});
export const STORY_WORKSPACE_RUNNINGHUB_WORKFLOW_MODEL_IDS = Object.freeze(["runninghub/2084286867645755393"]);
const STORY_WORKSPACE_RUNNINGHUB_WORKFLOW_MODEL_ID_SET = new Set(STORY_WORKSPACE_RUNNINGHUB_WORKFLOW_MODEL_IDS);
const PROVIDER_LABELS = Object.freeze({
  agnes: "Agnes",
  apimart: "APIMart",
  dreamina: "即梦",
  grsai: "GRSAI",
  ppio: "PPIO",
  runninghub: "RunningHub",
  runninghubwf: "RunningHub 工作流",
  volcengine: "火山方舟",
  "volcengine-speech": "火山语音"
});
function resolveModelIcon(_0x2a7f5c = {}) {
  const _0x357b8e = String(_0x2a7f5c.icon || "").trim();
  if (/^(?:images\/|assets\/|https?:\/\/|data:)/i.test(_0x357b8e)) {
    return _0x357b8e;
  }
  if (_0x2a7f5c.provider === "runninghub" || _0x2a7f5c.provider === "runninghubwf") {
    return "images/RH.png";
  }
  if (_0x2a7f5c.provider === "volcengine") {
    return "images/volcengine.svg";
  }
  if (_0x2a7f5c.provider === "ppio") {
    return "images/ppio.png";
  }
  if (_0x2a7f5c.provider === "grsai") {
    return "images/grsai.png";
  }
  return "";
}
export function isStoryWorkspaceModelVisible(_0x3f171f, _0x83c049) {
  const _0x32f395 = typeof _0x83c049 === "string" ? getModelManifest(_0x83c049) : _0x83c049;
  if (!_0x32f395 || _0x32f395.kind !== _0x3f171f) {
    return false;
  }
  if (_0x3f171f === "video" && _0x32f395.provider === "runninghubwf" && _0x32f395.adapterType === "workflow") {
    return STORY_WORKSPACE_RUNNINGHUB_WORKFLOW_MODEL_ID_SET.has(_0x32f395.modelId);
  }
  return true;
}
export function getStoryWorkspaceModelOptions(_0x55455f) {
  return getModelsByKind(_0x55455f).filter(_0xe6bf4f => isStoryWorkspaceModelVisible(_0x55455f, _0xe6bf4f)).map(_0x198006 => ({
    modelId: _0x198006.modelId,
    kind: _0x198006.kind,
    provider: _0x198006.provider,
    providerLabel: PROVIDER_LABELS[_0x198006.provider] || _0x198006.provider,
    label: translateManifestText(_0x198006.displayName || _0x198006.modelId),
    description: translateManifestText(_0x198006.description || ""),
    icon: resolveModelIcon(_0x198006),
    vip: _0x198006.vip === true
  })).sort((_0x8e5196, _0x3a9530) => {
    const _0xb048fe = _0x8e5196.providerLabel.localeCompare(_0x3a9530.providerLabel, "zh-CN");
    return _0xb048fe || _0x8e5196.label.localeCompare(_0x3a9530.label, "zh-CN");
  });
}
export function isStoryVideoInputTextModel(_0x3bb882) {
  const _0x16b7a5 = typeof _0x3bb882 === "string" ? getModelManifest(_0x3bb882) : _0x3bb882;
  const _0x5422de = _0x16b7a5?.inputSlots;
  return Boolean(_0x16b7a5?.kind === "text" && Array.isArray(_0x5422de?.allowedKinds) && _0x5422de.allowedKinds.includes("video") && Number(_0x5422de?.maxByKind?.video) > 0);
}
export function getStoryVideoInputTextModelOptions() {
  return getStoryWorkspaceModelOptions("text").filter(_0x3d06a7 => isStoryVideoInputTextModel(_0x3d06a7.modelId));
}
export function resolveStoryVideoInputTextModelId(_0x4952bf = "") {
  const _0x2a472a = String(_0x4952bf || "").trim();
  if (_0x2a472a && isStoryVideoInputTextModel(_0x2a472a)) {
    return _0x2a472a;
  }
  return getStoryVideoInputTextModelOptions()[0]?.modelId || "";
}
export function resolveStoryWorkspaceModelId(_0x209084, _0x4a1cbb = "") {
  const _0x45a3e5 = String(_0x4a1cbb || "").trim();
  if (_0x45a3e5 && isStoryWorkspaceModelVisible(_0x209084, _0x45a3e5)) {
    return _0x45a3e5;
  }
  const _0x18a510 = DEFAULT_MODEL_IDS[_0x209084];
  if (_0x18a510 && isStoryWorkspaceModelVisible(_0x209084, _0x18a510)) {
    return _0x18a510;
  }
  return getStoryWorkspaceModelOptions(_0x209084)[0]?.modelId || "";
}
export function getStoryWorkspaceModelChoice(_0x8775d5, _0x20b435 = "") {
  const _0x358273 = resolveStoryWorkspaceModelId(_0x8775d5, _0x20b435);
  return getStoryWorkspaceModelOptions(_0x8775d5).find(_0x20b7ae => _0x20b7ae.modelId === _0x358273) || null;
}
export function getStoryWorkspaceProviderLabel(_0x1beca9) {
  const _0x1731a9 = String(_0x1beca9 || "").trim();
  return PROVIDER_LABELS[_0x1731a9] || _0x1731a9;
}