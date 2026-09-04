import { APIMART_VIDEO_MODELS } from "./apimartVideoModelApiManifests.js";
import { MINIMAX_VIDEO_MODELS } from "./minimaxVideoModelApiManifests.js";
import { RUNNINGHUB_HAILUO_H3_VIDEO_MODELS } from "./runningHubHailuoH3VideoModelApiManifests.js";
import { RUNNINGHUB_VIDEO_MODELS } from "./runningHubVideoModelApiManifests.js";
import { VOLCENGINE_VIDEO_MODELS } from "./volcengineVideoModelApiManifests.js";
import { AGNES_VIDEO_MODELS } from "./agnesVideoModelApiManifests.js";
import { getRunningHubModelApiProfileIds } from "../../../modules/runningHubProviderProfiles.js";
import { APIMART_VIDEO_RESPONSE_MAPPING, APIMART_VIDEO_TASK_POLLING, SEEDANCE_VIDEO_RATIO_POLICY, VIDEO_SIZE_RATIO_POLICY, createVideoExecutionManifest, createVideoModelApiManifest } from "./vendorVideoModelApiShared.js";
const VENDOR_VIDEO_MODELS = Object.freeze([...APIMART_VIDEO_MODELS, ...MINIMAX_VIDEO_MODELS, ...RUNNINGHUB_HAILUO_H3_VIDEO_MODELS, ...RUNNINGHUB_VIDEO_MODELS, ...VOLCENGINE_VIDEO_MODELS, ...AGNES_VIDEO_MODELS]);
function isSeedanceVideoManifest(_0x3e19c8) {
  return _0x3e19c8?.endpointMode === "seedance-video-generation" || _0x3e19c8?.executionExtensions?.bodyResolver === "volcengineSeedance2Video";
}
function getVideoManifestRatioPolicy(_0x42e6f1) {
  if (_0x42e6f1?.ratioPolicy) {
    return _0x42e6f1.ratioPolicy;
  }
  if (isSeedanceVideoManifest(_0x42e6f1)) {
    return SEEDANCE_VIDEO_RATIO_POLICY;
  } else {
    return VIDEO_SIZE_RATIO_POLICY;
  }
}
export const vendorVideoModelApiModelManifests = Object.freeze(VENDOR_VIDEO_MODELS.map(_0x468936 => createVideoModelApiManifest({
  modelId: _0x468936.modelId,
  executionId: _0x468936.executionId,
  displayName: _0x468936.displayName,
  provider: _0x468936.provider || "apimart",
  vip: _0x468936.vip === true,
  aliases: _0x468936.aliases,
  icon: _0x468936.icon || "AM",
  description: _0x468936.description,
  fields: _0x468936.fields,
  inputSlots: _0x468936.inputSlots,
  prompt: _0x468936.prompt,
  help: _0x468936.help,
  footerPlacementOrder: _0x468936.footerPlacementOrder,
  extensions: Object.freeze({
    ...(_0x468936.extensions || {}),
    ...(_0x468936.provider === "runninghub" ? {
      providerProfiles: getRunningHubModelApiProfileIds(_0x468936.modelId)
    } : {}),
    ratioPolicy: getVideoManifestRatioPolicy(_0x468936)
  }),
  ratioPolicy: getVideoManifestRatioPolicy(_0x468936)
})));
export const vendorVideoModelApiExecutionManifests = Object.freeze(VENDOR_VIDEO_MODELS.map(_0x3a7123 => createVideoExecutionManifest({
  id: _0x3a7123.executionId,
  model: _0x3a7123.model,
  provider: _0x3a7123.provider || "apimart",
  endpoint: _0x3a7123.endpoint || "/v1/videos/generations",
  endpointMode: _0x3a7123.endpointMode,
  extensions: _0x3a7123.executionExtensions,
  bodyMapping: _0x3a7123.bodyMapping,
  modeModels: _0x3a7123.modeModels,
  responseMapping: _0x3a7123.responseMapping || APIMART_VIDEO_RESPONSE_MAPPING,
  taskPolling: Object.prototype.hasOwnProperty.call(_0x3a7123, "taskPolling") ? _0x3a7123.taskPolling : APIMART_VIDEO_TASK_POLLING,
  resultTaskIdPath: _0x3a7123.resultTaskIdPath || "task_id"
})));