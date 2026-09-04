import { RUNNINGHUB_DEVELOPER_INSTANCE_OPTIONS, RUNNINGHUB_INSTANCE_OPTIONS } from "../../modules/runningHubInstanceTypes.js";
function freezeField(_0x14b37c) {
  return Object.freeze(_0x14b37c);
}
function freezeSlotGroup(_0x27f46f) {
  return Object.freeze({
    ..._0x27f46f,
    slots: Object.freeze(_0x27f46f?.slots || [])
  });
}
function freezeDisplayAspectRatioSource(_0x46de11) {
  if (_0x46de11 && typeof _0x46de11 === "object" && !Array.isArray(_0x46de11)) {
    return Object.freeze({
      ..._0x46de11
    });
  } else {
    return undefined;
  }
}
function freezeInputPolicyCondition(_0x50cc77) {
  if (Array.isArray(_0x50cc77)) {
    return Object.freeze(_0x50cc77.map(freezeInputPolicyCondition));
  }
  if (!_0x50cc77 || typeof _0x50cc77 !== "object") {
    return _0x50cc77;
  }
  return Object.freeze({
    ..._0x50cc77,
    ...(Array.isArray(_0x50cc77.any) ? {
      any: freezeInputPolicyCondition(_0x50cc77.any)
    } : {}),
    ...(Array.isArray(_0x50cc77.all) ? {
      all: freezeInputPolicyCondition(_0x50cc77.all)
    } : {}),
    ...(Array.isArray(_0x50cc77.values) ? {
      values: Object.freeze([..._0x50cc77.values])
    } : {})
  });
}
function freezeInputPolicyVariant(_0x25f156 = {}) {
  return Object.freeze({
    ..._0x25f156,
    when: freezeInputPolicyCondition(_0x25f156.when),
    allowedKinds: Object.freeze([...(_0x25f156.allowedKinds || [])]),
    minByKind: Object.freeze({
      ...(_0x25f156.minByKind || {})
    }),
    maxByKind: Object.freeze({
      ...(_0x25f156.maxByKind || {})
    })
  });
}
function freezeMediaConstraintsByKind(_0x1553aa) {
  if (!_0x1553aa || typeof _0x1553aa !== "object" || Array.isArray(_0x1553aa)) {
    return undefined;
  }
  return Object.freeze(Object.fromEntries(Object.entries(_0x1553aa).map(([_0x9ddc76, _0x147e7f]) => [_0x9ddc76, Object.freeze({
    ...(_0x147e7f || {}),
    ...(Array.isArray(_0x147e7f?.allowedExtensions) ? {
      allowedExtensions: Object.freeze([..._0x147e7f.allowedExtensions])
    } : {})
  })])));
}
export function createRunningHubVideoModelManifest({
  modelId: _0x4f698b,
  executionId: _0x6c97b0,
  displayName: _0x532dba,
  description: _0x40d063,
  inputSlots: _0x1cf8ea,
  uiFields: _0x56125b,
  vip = false,
  fixedAssetSlots: _0x13661a,
  uiPlacement: _0x4f5bdb,
  prompt: _0x503f1e,
  help: _0x21e417,
  extensions: _0x280666,
  subscriptionAliases = []
}) {
  const _0x419b03 = freezeDisplayAspectRatioSource(_0x1cf8ea.displayAspectRatioSource);
  const _0x29326d = freezeMediaConstraintsByKind(_0x1cf8ea.mediaConstraintsByKind);
  return Object.freeze({
    schemaVersion: "1.0",
    modelId: _0x4f698b,
    provider: "runninghubwf",
    kind: "video",
    adapterType: "workflow",
    executionId: _0x6c97b0,
    displayName: _0x532dba,
    icon: "images/RH.png",
    description: _0x40d063,
    ...(_0x503f1e && typeof _0x503f1e === "object" ? {
      prompt: Object.freeze(_0x503f1e)
    } : {}),
    help: Object.freeze(_0x21e417 || {}),
    ...(_0x280666 ? {
      extensions: Object.freeze(_0x280666)
    } : {}),
    subscriptionAliases: Object.freeze(subscriptionAliases),
    vip: vip,
    ...(_0x4f5bdb ? {
      uiPlacement: Object.freeze(_0x4f5bdb)
    } : {}),
    capabilities: Object.freeze({
      inputKinds: Object.freeze(_0x1cf8ea.allowedKinds || []),
      outputType: "video",
      fixedAssetSlots: _0x13661a ? Object.freeze(_0x13661a) : undefined
    }),
    inputSlots: Object.freeze({
      allowedKinds: Object.freeze(_0x1cf8ea.allowedKinds || []),
      minByKind: Object.freeze(_0x1cf8ea.minByKind || {}),
      maxByKind: Object.freeze(_0x1cf8ea.maxByKind || {}),
      ...(_0x419b03 ? {
        displayAspectRatioSource: _0x419b03
      } : {}),
      ...(_0x1cf8ea.cycleFixedInputWhenFull === true ? {
        cycleFixedInputWhenFull: true
      } : {}),
      ...(_0x1cf8ea.maxTotalDurationSecondsByKind && typeof _0x1cf8ea.maxTotalDurationSecondsByKind === "object" && !Array.isArray(_0x1cf8ea.maxTotalDurationSecondsByKind) ? {
        maxTotalDurationSecondsByKind: Object.freeze({
          ..._0x1cf8ea.maxTotalDurationSecondsByKind
        })
      } : {}),
      ...(_0x29326d ? {
        mediaConstraintsByKind: _0x29326d
      } : {}),
      ...(Array.isArray(_0x1cf8ea.policyVariants) && _0x1cf8ea.policyVariants.length > 0 ? {
        policyVariants: Object.freeze(_0x1cf8ea.policyVariants.map(freezeInputPolicyVariant))
      } : {}),
      fixedSlots: Object.freeze(_0x1cf8ea.fixedSlots || []),
      exclusiveGroups: Object.freeze((_0x1cf8ea.exclusiveGroups || []).map(freezeSlotGroup))
    }),
    uiSchema: Object.freeze({
      fields: Object.freeze((_0x56125b || []).map(freezeField))
    }),
    async: true,
    cancellable: true,
    outputType: "video"
  });
}
export function createRunningHubVideoExecutionManifest({
  id: _0x4aa16b,
  label: _0x5f2217,
  workflowId: _0x2d04c1,
  submitMode: _0x2c4bd4,
  queryMode: _0x18f31e,
  mapping = {},
  preset: _0x181570,
  extensions = {}
}) {
  return Object.freeze({
    schemaVersion: "1.0",
    id: _0x4aa16b,
    provider: "runninghubwf",
    kind: "video",
    adapterType: "workflow",
    label: _0x5f2217,
    workflowId: _0x2d04c1,
    appId: _0x2d04c1,
    submitMode: _0x2c4bd4,
    queryMode: _0x18f31e,
    instanceType: Object.freeze({
      field: "rhInstanceType",
      defaultValue: "default"
    }),
    mapping: Object.freeze({
      ...(_0x181570 ? {
        preset: _0x181570
      } : {}),
      ...mapping
    }),
    extensions: Object.freeze(extensions || {}),
    result: Object.freeze({
      taskIdPath: "taskId",
      videoPaths: Object.freeze(["results[].videoUrl", "results[].url"])
    })
  });
}
export const RH_VIDEO_RESOLUTION_FIELD = Object.freeze({
  id: "rhVideoResolution",
  type: "slider",
  placement: "videoParams",
  label: "分辨率",
  defaultValue: 832,
  options: Object.freeze([832, 1024, 1280, 1440, 1600, 1760, 1920])
});
export const RH_VIDEO_FPS_FIELD = Object.freeze({
  id: "rhVideoFps",
  type: "segmented",
  placement: "videoParams",
  label: "帧率",
  defaultValue: 24,
  options: Object.freeze([Object.freeze({
    value: 16,
    label: "16帧"
  }), Object.freeze({
    value: 24,
    label: "24帧"
  })])
});
export const RH_VIDEO_FPS_30_FIELD = Object.freeze({
  ...RH_VIDEO_FPS_FIELD,
  options: Object.freeze([Object.freeze({
    value: 16,
    label: "16帧"
  }), Object.freeze({
    value: 24,
    label: "24帧"
  }), Object.freeze({
    value: 30,
    label: "30帧"
  })])
});
export const RH_INSTANCE_FIELD = Object.freeze({
  id: "rhInstanceType",
  type: "segmented",
  placement: "instance",
  label: "显存",
  defaultValue: "default",
  options: RUNNINGHUB_INSTANCE_OPTIONS,
  developerOptions: RUNNINGHUB_DEVELOPER_INSTANCE_OPTIONS
});