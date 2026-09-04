import { SEEDANCE2_INPUT_MAX_BY_KIND, SEEDANCE2_MAX_TOTAL_DURATION_SECONDS_BY_KIND, SEEDANCE25_INPUT_MAX_BY_KIND, SEEDANCE25_MAX_TOTAL_DURATION_SECONDS_BY_KIND } from "../../../modules/modelMediaInputLimits.js";
const DREAMINA_DEFAULT_VIDEO_EXECUTION_ID = "dreamina.local-runtime.video.seedance-2-0-fast.v1";
export const DREAMINA_VIDEO_VIP_GATE_ID = "dreamina/video_vip";
const VIDEO_ROUTE_MODE_FIELD = Object.freeze({
  id: "dreaminaRouteMode",
  type: "segmented",
  placement: "mode",
  label: "Mode",
  defaultValue: "multimodal2video",
  options: Object.freeze([Object.freeze({
    value: "multimodal2video",
    label: "全能参考"
  }), Object.freeze({
    value: "frames2video",
    label: "首尾帧"
  })])
});
const VIDEO_RESOLUTION_FIELD = Object.freeze({
  id: "resolution",
  type: "segmented",
  placement: "resolution",
  label: "Resolution",
  defaultValue: "720p",
  options: Object.freeze([Object.freeze({
    value: "480p",
    label: "480p"
  }), Object.freeze({
    value: "720p",
    label: "720p"
  }), Object.freeze({
    value: "1080p",
    label: "1080p"
  }), Object.freeze({
    value: "4k",
    label: "4K"
  })])
});
const VIDEO_RATIO_FIELD = Object.freeze({
  id: "aspectRatio",
  displayRole: "aspectRatio",
  type: "segmented",
  placement: "resolution",
  label: "Ratio",
  defaultValue: "自适应",
  options: Object.freeze([Object.freeze({
    value: "自适应",
    label: "自适应"
  }), Object.freeze({
    value: "1:1",
    label: "1:1"
  }), Object.freeze({
    value: "3:4",
    label: "3:4"
  }), Object.freeze({
    value: "16:9",
    label: "16:9"
  }), Object.freeze({
    value: "4:3",
    label: "4:3"
  }), Object.freeze({
    value: "9:16",
    label: "9:16"
  }), Object.freeze({
    value: "21:9",
    label: "21:9"
  })])
});
const VIDEO_DURATION_FIELD = Object.freeze({
  id: "duration",
  type: "slider",
  placement: "duration",
  label: "Duration",
  defaultValue: 5,
  min: 4,
  max: 15,
  step: 1
});
const DREAMINA_VIDEO_UI_SCHEMA = Object.freeze({
  fields: Object.freeze([VIDEO_ROUTE_MODE_FIELD, VIDEO_RESOLUTION_FIELD, VIDEO_RATIO_FIELD, VIDEO_DURATION_FIELD])
});
const DREAMINA_VIDEO_INPUT_SLOTS = Object.freeze({
  allowedKinds: Object.freeze(["text", "image", "video", "audio"]),
  minByKind: Object.freeze({
    text: 0
  }),
  maxByKind: SEEDANCE2_INPUT_MAX_BY_KIND
});
const DREAMINA_SEEDANCE2_VIDEO_INPUT_SLOTS = Object.freeze({
  ...DREAMINA_VIDEO_INPUT_SLOTS,
  maxTotalDurationSecondsByKind: SEEDANCE2_MAX_TOTAL_DURATION_SECONDS_BY_KIND
});
const DREAMINA_SEEDANCE25_VIDEO_INPUT_SLOTS = Object.freeze({
  ...DREAMINA_VIDEO_INPUT_SLOTS,
  maxByKind: SEEDANCE25_INPUT_MAX_BY_KIND,
  maxTotalDurationSecondsByKind: SEEDANCE25_MAX_TOTAL_DURATION_SECONDS_BY_KIND
});
const DREAMINA_SEEDANCE_TASK_TYPES = Object.freeze(["text2video", "image2video", "frames2video", "multimodal2video"]);
const DREAMINA_SEEDANCE_RESOLUTION_BY_TASK = Object.freeze({
  text2video: Object.freeze(["720p"]),
  image2video: Object.freeze(["720p"]),
  frames2video: Object.freeze(["720p"]),
  multimodal2video: Object.freeze(["720p"])
});
const DREAMINA_SEEDANCE_VIP_RESOLUTION_BY_TASK = Object.freeze({
  text2video: Object.freeze(["720p", "1080p", "4k"]),
  image2video: Object.freeze(["720p", "1080p", "4k"]),
  frames2video: Object.freeze(["720p", "1080p", "4k"]),
  multimodal2video: Object.freeze(["720p", "1080p", "4k"])
});
const DREAMINA_SEEDANCE25_RESOLUTION_BY_TASK = Object.freeze({
  text2video: Object.freeze(["480p", "720p", "1080p"]),
  image2video: Object.freeze(["480p", "720p", "1080p"]),
  frames2video: Object.freeze(["480p", "720p", "1080p"]),
  multimodal2video: Object.freeze(["480p", "720p", "1080p"])
});
const DREAMINA_DEFAULT_DURATION_BY_TASK = Object.freeze({
  text2video: Object.freeze({
    min: 4,
    max: 15,
    step: 1
  }),
  image2video: Object.freeze({
    min: 4,
    max: 15,
    step: 1
  }),
  frames2video: Object.freeze({
    min: 4,
    max: 15,
    step: 1
  }),
  multimodal2video: Object.freeze({
    min: 4,
    max: 15,
    step: 1
  })
});
const DREAMINA_SEEDANCE25_DURATION_BY_TASK = Object.freeze({
  text2video: Object.freeze({
    min: 4,
    max: 30,
    step: 1
  }),
  image2video: Object.freeze({
    min: 4,
    max: 30,
    step: 1
  }),
  frames2video: Object.freeze({
    min: 4,
    max: 30,
    step: 1
  }),
  multimodal2video: Object.freeze({
    min: 4,
    max: 30,
    step: 1
  })
});
const DREAMINA_VIDEO_MODEL_MENU_ENTRIES = Object.freeze([Object.freeze({
  modelId: "dreamina/seedance2.0fast_vip",
  executionId: "dreamina.local-runtime.video.seedance-2-0-fast-vip.v1",
  modelVersion: "seedance2.0fast_vip",
  displayName: "Seedance 2.0 Fast VIP",
  counterpartKey: "seedance2-fast",
  order: 10,
  title: "Seedance 2.0 Fast VIP",
  subtitle: "高速高阶版，支持全能参考与首尾帧链路",
  taskTypes: DREAMINA_SEEDANCE_TASK_TYPES,
  resolutionOptionsByTaskType: DREAMINA_SEEDANCE_RESOLUTION_BY_TASK,
  durationRangeByTaskType: DREAMINA_DEFAULT_DURATION_BY_TASK,
  vip: true
}), Object.freeze({
  modelId: "dreamina/seedance2.0_vip",
  executionId: "dreamina.local-runtime.video.seedance-2-0-vip.v1",
  modelVersion: "seedance2.0_vip",
  displayName: "Seedance 2.0 VIP",
  counterpartKey: "seedance2-standard",
  order: 20,
  title: "Seedance 2.0 VIP",
  subtitle: "质量优先，支持 4K 全能参考与首尾帧链路",
  taskTypes: DREAMINA_SEEDANCE_TASK_TYPES,
  resolutionOptionsByTaskType: DREAMINA_SEEDANCE_VIP_RESOLUTION_BY_TASK,
  durationRangeByTaskType: DREAMINA_DEFAULT_DURATION_BY_TASK,
  vip: true
}), Object.freeze({
  modelId: "dreamina/seedance2.0fast",
  executionId: DREAMINA_DEFAULT_VIDEO_EXECUTION_ID,
  modelVersion: "seedance2.0fast",
  displayName: "Seedance 2.0 Fast",
  counterpartKey: "seedance2-fast",
  order: 30,
  title: "Seedance 2.0 Fast",
  subtitle: "默认推荐，支持文生、图生、首尾帧、全能参考",
  taskTypes: DREAMINA_SEEDANCE_TASK_TYPES,
  aliases: Object.freeze(["seedance-2.0-fast"]),
  defaultForTaskTypes: DREAMINA_SEEDANCE_TASK_TYPES,
  resolutionOptionsByTaskType: DREAMINA_SEEDANCE_RESOLUTION_BY_TASK,
  durationRangeByTaskType: DREAMINA_DEFAULT_DURATION_BY_TASK
}), Object.freeze({
  modelId: "dreamina/seedance2.0",
  executionId: "dreamina.local-runtime.video.seedance-2-0.v1",
  modelVersion: "seedance2.0",
  displayName: "Seedance 2.0",
  counterpartKey: "seedance2-standard",
  order: 40,
  title: "Seedance 2.0",
  subtitle: "质量更稳，支持文生、图生、首尾帧、全能参考",
  taskTypes: DREAMINA_SEEDANCE_TASK_TYPES,
  aliases: Object.freeze(["seedance-2.0"]),
  resolutionOptionsByTaskType: DREAMINA_SEEDANCE_RESOLUTION_BY_TASK,
  durationRangeByTaskType: DREAMINA_DEFAULT_DURATION_BY_TASK
}), Object.freeze({
  modelId: "dreamina/seedance2.0mini",
  executionId: "dreamina.local-runtime.video.seedance-2-0-mini.v1",
  modelVersion: "seedance2.0mini",
  displayName: "Seedance 2.0 Mini",
  counterpartKey: "seedance2-mini",
  order: 45,
  title: "Seedance 2.0 Mini",
  subtitle: "Mini 版，参数同 Seedance 2.0",
  taskTypes: DREAMINA_SEEDANCE_TASK_TYPES,
  aliases: Object.freeze(["seedance-2.0-mini"]),
  resolutionOptionsByTaskType: DREAMINA_SEEDANCE_RESOLUTION_BY_TASK,
  durationRangeByTaskType: DREAMINA_DEFAULT_DURATION_BY_TASK
}), Object.freeze({
  modelId: "dreamina/seedance2.5",
  executionId: "dreamina.local-runtime.video.seedance-2-5.v1",
  modelVersion: "seedance2.5",
  displayName: "Seedance 2.5",
  counterpartKey: "seedance2.5-standard",
  order: 47,
  title: "Seedance 2.5",
  subtitle: "Supports text/image/frames/multimodal video with 480p/720p/1080p and 4-30s output.",
  taskTypes: DREAMINA_SEEDANCE_TASK_TYPES,
  aliases: Object.freeze(["seedance-2.5"]),
  resolutionOptionsByTaskType: DREAMINA_SEEDANCE25_RESOLUTION_BY_TASK,
  durationRangeByTaskType: DREAMINA_SEEDANCE25_DURATION_BY_TASK,
  inputSlots: DREAMINA_SEEDANCE25_VIDEO_INPUT_SLOTS
})]);
function createDreaminaVideoUiSchema(_0xaa046a = {}) {
  const _0x432880 = Array.from(new Set(Object.values(_0xaa046a.resolutionOptionsByTaskType || {}).flatMap(_0x46e900 => Array.isArray(_0x46e900) ? _0x46e900 : [])));
  if (_0x432880.length === 0) {
    return DREAMINA_VIDEO_UI_SCHEMA;
  }
  const _0x590f50 = new Set(_0x432880);
  const _0x5e582f = VIDEO_RESOLUTION_FIELD.options.filter(_0x1e3569 => _0x590f50.has(_0x1e3569.value));
  if (_0x5e582f.length === 0) {
    return DREAMINA_VIDEO_UI_SCHEMA;
  }
  const _0x1612b3 = Object.freeze({
    ...VIDEO_RESOLUTION_FIELD,
    defaultValue: _0x590f50.has(VIDEO_RESOLUTION_FIELD.defaultValue) ? VIDEO_RESOLUTION_FIELD.defaultValue : _0x5e582f[0].value,
    options: Object.freeze(_0x5e582f)
  });
  return Object.freeze({
    fields: Object.freeze(DREAMINA_VIDEO_UI_SCHEMA.fields.map(_0x3d448c => _0x3d448c.id === "resolution" ? _0x1612b3 : _0x3d448c))
  });
}
function createDreaminaVideoModelManifest(_0x5263b4) {
  return Object.freeze({
    schemaVersion: "1.0",
    modelId: _0x5263b4.modelId,
    ...(Array.isArray(_0x5263b4.aliases) ? {
      aliases: _0x5263b4.aliases
    } : {}),
    provider: "dreamina",
    kind: "video",
    adapterType: "localRuntime",
    executionId: _0x5263b4.executionId,
    displayName: _0x5263b4.displayName,
    icon: "images/jimeng.png",
    inputSlots: _0x5263b4.inputSlots || (String(_0x5263b4.counterpartKey || "").startsWith("seedance2-") ? DREAMINA_SEEDANCE2_VIDEO_INPUT_SLOTS : DREAMINA_VIDEO_INPUT_SLOTS),
    uiSchema: createDreaminaVideoUiSchema(_0x5263b4),
    vip: _0x5263b4.vip === true,
    async: true,
    cancellable: true,
    outputType: "video",
    extensions: Object.freeze({
      ratioPolicy: Object.freeze({
        capability: "aspectRatio"
      }),
      dreaminaStyleVideo: Object.freeze({
        order: _0x5263b4.order,
        title: _0x5263b4.title,
        subtitle: _0x5263b4.subtitle,
        subtitleByTaskType: _0x5263b4.subtitleByTaskType || Object.freeze({}),
        counterpartKey: _0x5263b4.counterpartKey || "",
        taskTypes: _0x5263b4.taskTypes,
        defaultForTaskTypes: _0x5263b4.defaultForTaskTypes || Object.freeze([]),
        resolutionOptionsByTaskType: _0x5263b4.resolutionOptionsByTaskType || Object.freeze({}),
        durationRangeByTaskType: _0x5263b4.durationRangeByTaskType || Object.freeze({})
      })
    })
  });
}
export const dreaminaOfficialVideoModelManifest = Object.freeze({
  schemaVersion: "1.0",
  modelId: "dreamina/text2video",
  provider: "dreamina",
  kind: "video",
  adapterType: "localRuntime",
  executionId: DREAMINA_DEFAULT_VIDEO_EXECUTION_ID,
  displayName: "即梦官方（需高级会员）",
  icon: "images/jimeng.png",
  inputSlots: DREAMINA_VIDEO_INPUT_SLOTS,
  uiSchema: DREAMINA_VIDEO_UI_SCHEMA,
  vip: true,
  async: true,
  cancellable: true,
  outputType: "video",
  extensions: Object.freeze({
    ratioPolicy: Object.freeze({
      capability: "aspectRatio"
    }),
    videoMenu: Object.freeze({
      role: "dreaminaOfficial",
      order: 10,
      label: "即梦官方（需高级会员）",
      subtitle: "无图文生视频，单图图生视频",
      iconAlt: "dreamina"
    })
  })
});
export const dreaminaVideoModelManifests = Object.freeze([dreaminaOfficialVideoModelManifest, ...DREAMINA_VIDEO_MODEL_MENU_ENTRIES.map(createDreaminaVideoModelManifest)]);
function createDreaminaVideoExecutionManifest(_0x37c5b9) {
  return Object.freeze({
    schemaVersion: "1.0",
    id: _0x37c5b9.executionId,
    provider: "dreamina",
    kind: "video",
    adapterType: "localRuntime",
    runtime: "dreaminaVideo",
    extensions: Object.freeze({
      dreaminaVideo: Object.freeze({
        modelVersion: _0x37c5b9.modelVersion
      })
    }),
    result: Object.freeze({
      urlFields: Object.freeze(["url", "videoUrl"])
    })
  });
}
export const dreaminaVideoExecutionManifests = Object.freeze([...DREAMINA_VIDEO_MODEL_MENU_ENTRIES.map(createDreaminaVideoExecutionManifest)]);
export const dreaminaVideoExecutionManifest = dreaminaVideoExecutionManifests.find(_0x2e5a5a => _0x2e5a5a.id === DREAMINA_DEFAULT_VIDEO_EXECUTION_ID);