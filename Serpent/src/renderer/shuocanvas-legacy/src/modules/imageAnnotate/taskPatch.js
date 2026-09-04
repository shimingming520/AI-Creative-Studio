import { normalizeProviderId, resolveModelExecution } from "../../manifests/index.js";
export { buildImageGenerationAsyncTaskPatch as buildAsyncTaskPatch, buildImageGenerationDreaminaTaskPatch as buildDreaminaTaskPatch, buildImageGenerationRunningHubTaskPatch as buildRunningHubTaskPatch } from "../../core/generationTaskProtocolState.js";
function resolveTaskModelExecution(_0xfb91d9, _0x3c093e) {
  const _0x24dd1e = normalizeProviderId(_0x3c093e);
  return resolveModelExecution(_0xfb91d9, {
    providerHint: _0x24dd1e
  }) || resolveModelExecution(_0xfb91d9);
}
function resolveTaskProviderIds(_0x34d6ba, _0x103b84) {
  const _0x1908dc = resolveTaskModelExecution(_0x34d6ba, _0x103b84);
  return [normalizeProviderId(_0x103b84), normalizeProviderId(_0x1908dc?.modelManifest?.provider), normalizeProviderId(_0x1908dc?.executionManifest?.provider)].filter(Boolean);
}
export const isRunningHubTaskModel = (_0x43d593, _0x371455) => {
  const _0x92606 = resolveTaskProviderIds(_0x43d593, _0x371455);
  return _0x92606.includes("runninghub") || _0x92606.includes("runninghubwf");
};
export const isRunningHubModelApiTaskModel = (_0xd0f9a5, _0x932ecd) => {
  const _0x1727db = resolveTaskModelExecution(_0xd0f9a5, _0x932ecd);
  const _0x2b8b93 = resolveTaskProviderIds(_0xd0f9a5, _0x932ecd);
  return _0x2b8b93.includes("runninghub") && _0x1727db?.modelManifest?.adapterType === "modelApi" && _0x1727db?.executionManifest?.adapterType === "modelApi";
};
export const isDreaminaTaskModel = (_0x57cda7, _0xede801) => {
  return resolveTaskProviderIds(_0x57cda7, _0xede801).includes("dreamina");
};
export const persistRunningHubResumeCache = () => {
  try {
    window._triggerLocalCacheSave?.();
  } catch {}
};