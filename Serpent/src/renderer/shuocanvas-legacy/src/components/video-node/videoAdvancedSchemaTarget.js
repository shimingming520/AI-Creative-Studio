import { normalizeProviderId, resolveModelExecution } from "../../manifests/index.js";
import { isCustomAiAppManifest, resolveCustomAiAppNodeManifest } from "../shared/rhAiAppNodeBehavior.js";
import { hasRunningHubVideoWorkflowUiPlacement } from "./runningHubVideoUiSchema.js";
function resolveExecution(_0x6cd5a4, _0x8631af) {
  return resolveModelExecution(_0x6cd5a4, {
    providerHint: _0x8631af
  }) || resolveModelExecution(_0x6cd5a4) || null;
}
function isRunningHubVideoWorkflowExecution(_0xa01dff) {
  return normalizeProviderId(_0xa01dff?.modelManifest?.provider) === "runninghubwf" && _0xa01dff?.modelManifest?.adapterType === "workflow" && _0xa01dff?.executionManifest?.adapterType === "workflow";
}
function hasModelUiSchemaPlacement(_0x3b003d, _0x59fc72) {
  const _0x4d72ae = String(_0x59fc72 || "").trim().toLowerCase();
  if (!_0x4d72ae) {
    return false;
  }
  const _0x4191df = Array.isArray(_0x3b003d?.uiSchema?.fields) ? _0x3b003d.uiSchema.fields : [];
  return _0x4191df.some(_0x38c787 => {
    return String(_0x38c787?.placement || "").trim().toLowerCase() === _0x4d72ae;
  });
}
export function isRunningHubVideoWorkflowModel(_0x508164, _0x19d4c3) {
  return isRunningHubVideoWorkflowExecution(resolveExecution(_0x508164, _0x19d4c3));
}
export function resolveVideoAdvancedSchemaTarget(_0x1cd3eb = {}, {
  fallbackNodeData = {},
  buildRunningHubNodeData: _0x704b06
} = {}) {
  const _0x20cb2b = _0x1cd3eb || {};
  const _0x19c8ad = fallbackNodeData || {};
  const _0x22f9e2 = String(_0x20cb2b?.model || _0x19c8ad?.model || "").trim();
  if (!_0x22f9e2) {
    return null;
  }
  const _0x188b26 = _0x20cb2b?.provider || _0x19c8ad?.provider;
  const _0x353ced = resolveExecution(_0x22f9e2, _0x188b26);
  const _0x456bf6 = resolveCustomAiAppNodeManifest({
    ..._0x19c8ad,
    ..._0x20cb2b,
    model: _0x22f9e2,
    provider: _0x188b26
  });
  if (isCustomAiAppManifest(_0x456bf6 || _0x353ced?.modelManifest)) {
    const _0x19c388 = _0x456bf6 || _0x353ced?.modelManifest;
    if (hasModelUiSchemaPlacement(_0x19c388, "advanced")) {
      return {
        modelId: _0x22f9e2,
        nodeData: _0x704b06?.(_0x20cb2b) || _0x20cb2b,
        placement: "advanced"
      };
    } else {
      return null;
    }
  }
  if (isRunningHubVideoWorkflowExecution(_0x353ced)) {
    if (_0x353ced?.modelManifest?.extensions?.rhAiApp) {
      if (hasRunningHubVideoWorkflowUiPlacement(_0x22f9e2, "advanced")) {
        return {
          modelId: _0x22f9e2,
          nodeData: _0x704b06?.(_0x20cb2b) || _0x20cb2b,
          placement: "advanced"
        };
      } else {
        return null;
      }
    }
    if (hasRunningHubVideoWorkflowUiPlacement(_0x22f9e2, "videoAdvanced")) {
      return {
        modelId: _0x22f9e2,
        nodeData: _0x704b06?.(_0x20cb2b) || _0x20cb2b,
        placement: "videoAdvanced"
      };
    } else {
      return null;
    }
  }
  if (_0x353ced?.modelManifest?.adapterType !== "modelApi" || _0x353ced?.modelManifest?.kind !== "video") {
    return null;
  }
  const _0x32ff64 = String(_0x353ced?.canonicalModelId || _0x353ced?.modelManifest?.modelId || _0x22f9e2).trim();
  if (_0x32ff64) {
    return {
      modelId: _0x32ff64,
      nodeData: _0x20cb2b,
      placement: "advanced"
    };
  } else {
    return null;
  }
}