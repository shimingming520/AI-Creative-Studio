import { RUNNINGHUB_DEVELOPER_INSTANCE_OPTIONS, RUNNINGHUB_INSTANCE_OPTIONS } from "../../modules/runningHubInstanceTypes.js";
function freezeField(_0x4b4027) {
  return Object.freeze(_0x4b4027);
}
export function createRunningHubAudioModelManifest({
  modelId: _0x2c36da,
  executionId: _0x3a4f2e,
  displayName: _0x5b8fa4,
  description: _0x333630,
  inputSlots: _0x1eac88,
  uiFields: _0x55556f,
  help: _0x1911fa,
  uiPlacement: _0x426a07,
  extensions: _0x5c618e,
  vip = false,
  subscriptionAliases = []
}) {
  return Object.freeze({
    schemaVersion: "1.0",
    modelId: _0x2c36da,
    provider: "runninghubwf",
    kind: "audio",
    adapterType: "workflow",
    executionId: _0x3a4f2e,
    displayName: _0x5b8fa4,
    icon: "images/RH.png",
    description: _0x333630,
    ...(_0x5c618e ? {
      extensions: _0x5c618e
    } : {}),
    help: Object.freeze(_0x1911fa || {}),
    uiPlacement: Object.freeze(_0x426a07 || ["modelMenu"]),
    vip: vip,
    subscriptionAliases: Object.freeze(subscriptionAliases),
    capabilities: Object.freeze({
      inputKinds: Object.freeze(_0x1eac88.allowedKinds || []),
      outputType: "audio",
      fixedAssetSlots: Object.freeze((_0x1eac88.fixedSlots || []).map(_0x6d2d8 => _0x6d2d8.id))
    }),
    inputSlots: Object.freeze({
      allowedKinds: Object.freeze(_0x1eac88.allowedKinds || []),
      minByKind: Object.freeze(_0x1eac88.minByKind || {}),
      maxByKind: Object.freeze(_0x1eac88.maxByKind || {}),
      fixedSlots: Object.freeze(_0x1eac88.fixedSlots || [])
    }),
    uiSchema: Object.freeze({
      fields: Object.freeze((_0x55556f || []).map(freezeField))
    }),
    async: true,
    cancellable: true,
    outputType: "audio"
  });
}
export function createRunningHubAudioExecutionManifest({
  id: _0x381a28,
  label: _0x34aa99,
  workflowId: _0x12ca5b,
  preset: _0x470610,
  mapping = {},
  extensions = {}
}) {
  return Object.freeze({
    schemaVersion: "1.0",
    id: _0x381a28,
    provider: "runninghubwf",
    kind: "audio",
    adapterType: "workflow",
    label: _0x34aa99,
    workflowId: _0x12ca5b,
    appId: _0x12ca5b,
    submitMode: "openapi-v2-ai-app",
    queryMode: "openapi-v2-query",
    instanceType: Object.freeze({
      field: "rhInstanceType",
      defaultValue: "default"
    }),
    mapping: Object.freeze({
      preset: _0x470610,
      ...mapping
    }),
    extensions: Object.freeze(extensions || {}),
    result: Object.freeze({
      taskIdPath: "taskId",
      audioPaths: Object.freeze(["results[].audioUrl", "results[].url", "audioUrl"])
    })
  });
}
export const RH_AUDIO_INSTANCE_FIELD = Object.freeze({
  id: "rhInstanceType",
  type: "segmented",
  placement: "instance",
  label: "显存",
  defaultValue: "default",
  options: RUNNINGHUB_INSTANCE_OPTIONS,
  developerOptions: RUNNINGHUB_DEVELOPER_INSTANCE_OPTIONS
});