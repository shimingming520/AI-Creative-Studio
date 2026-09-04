import { APIMART_NANO_BANANA_2_GOOGLE_IMAGE_SEARCH_FIELD, APIMART_NANO_BANANA_2_GOOGLE_SEARCH_FIELD, APIMART_GPT_IMAGE_2_IMAGE_SIZE_FIELD, APIMART_GPT_IMAGE_2_MODE_FIELD, APIMART_GPT_IMAGE_2_QUALITY_FIELD, APIMART_GPT_IMAGE_2_RATIO_FIELD, APIMART_NANO_BANANA_2_IMAGE_SIZE_FIELD, APIMART_NANO_BANANA_2_MODE_FIELD, APIMART_NANO_BANANA_IMAGE_SIZE_FIELD, APIMART_NANO_BANANA_MODE_FIELD, APIMART_NANO_BANANA_PRO_IMAGE_SIZE_FIELD, APIMART_NANO_BANANA_PRO_MODE_FIELD, APIMART_QWEN_IMAGE_BATCH_SIZE_FIELD, APIMART_QWEN_IMAGE_MODE_FIELD, APIMART_QWEN_IMAGE_RATIO_FIELD, APIMART_QWEN_IMAGE_SIZE_FIELD, APIMART_SEEDREAM_4_5_IMAGE_SIZE_FIELD, APIMART_SEEDREAM_4_IMAGE_SIZE_FIELD, APIMART_SEEDREAM_5_LITE_IMAGE_SIZE_FIELD, APIMART_SEEDREAM_5_PRO_IMAGE_SIZE_FIELD, APIMART_SEEDREAM_5_LITE_RATIO_FIELD, APIMART_SEEDREAM_RATIO_FIELD, APIMART_WAN_IMAGE_MODE_FIELD, APIMART_WAN_IMAGE_RATIO_FIELD, APIMART_WAN_IMAGE_SIZE_FIELD, APIMART_WAN_THINKING_MODE_FIELD, APIMART_Z_IMAGE_TURBO_IMAGE_SIZE_FIELD, APIMART_Z_IMAGE_TURBO_PROMPT_EXTEND_FIELD, APIMART_Z_IMAGE_TURBO_RATIO_FIELD, ASPECT_RATIO_FIELD, BATCH_SIZE_FIELD, IMAGE_MODEL_API_10_IMAGE_INPUT_SLOTS, IMAGE_MODEL_API_14_IMAGE_INPUT_SLOTS, IMAGE_MODEL_API_16_IMAGE_INPUT_SLOTS, NANO_BANANA_2_RATIO_FIELD, createImageModelApiManifest, createModelApiExecutionManifest } from "./sharedImageModelApiFields.js";
export const APIMART_NANO_BANANA_2_MODEL_ID = "apimart/nano-banana-2";
export const APIMART_NANO_BANANA_2_EXECUTION_ID = "apimart.model-api.nano-banana-2.v1";
export const APIMART_GEMINI_3_1_FLASH_LITE_IMAGE_MODEL_ID = "apimart/gemini-3.1-flash-lite-image";
export const APIMART_GEMINI_3_1_FLASH_LITE_IMAGE_EXECUTION_ID = "apimart.model-api.gemini-3-1-flash-lite-image.v1";
export const APIMART_NANO_BANANA_PRO_MODEL_ID = "apimart/nano-banana-pro";
export const APIMART_NANO_BANANA_PRO_EXECUTION_ID = "apimart.model-api.nano-banana-pro.v1";
export const APIMART_NANO_BANANA_MODEL_ID = "apimart/nano-banana-dot";
export const APIMART_NANO_BANANA_EXECUTION_ID = "apimart.model-api.nano-banana-dot.v1";
export const APIMART_GPT_IMAGE_2_MODEL_ID = "apimart/gpt-image-2";
export const APIMART_GPT_IMAGE_2_EXECUTION_ID = "apimart.model-api.gpt-image-2.v1";
export const APIMART_QWEN_IMAGE_MODEL_ID = "apimart/qwen-image-2.0";
export const APIMART_QWEN_IMAGE_EXECUTION_ID = "apimart.model-api.qwen-image-2.v1";
export const APIMART_QWEN_IMAGE_3_MODEL_ID = "apimart/qwen-image-3.0";
export const APIMART_QWEN_IMAGE_3_EXECUTION_ID = "apimart.model-api.qwen-image-3.v1";
export const APIMART_Z_IMAGE_TURBO_MODEL_ID = "apimart/z-image-turbo";
export const APIMART_Z_IMAGE_TURBO_EXECUTION_ID = "apimart.model-api.z-image-turbo.v1";
export const APIMART_WAN_IMAGE_MODEL_ID = "apimart/wan2.7-image";
export const APIMART_WAN_IMAGE_EXECUTION_ID = "apimart.model-api.wan2-7-image.v1";
export const APIMART_SEEDREAM_4_MODEL_ID = "apimart/seedream-4.0";
export const APIMART_SEEDREAM_4_EXECUTION_ID = "apimart.model-api.seedream-4.v1";
export const APIMART_SEEDREAM_4_5_MODEL_ID = "apimart/seedream-4.5";
export const APIMART_SEEDREAM_4_5_EXECUTION_ID = "apimart.model-api.seedream-4-5.v1";
export const APIMART_SEEDREAM_5_LITE_MODEL_ID = "apimart/seedream-5.0-lite";
export const APIMART_SEEDREAM_5_LITE_EXECUTION_ID = "apimart.model-api.seedream-5-lite.v1";
export const APIMART_SEEDREAM_5_PRO_MODEL_ID = "apimart/seedream-5.0-pro";
export const APIMART_SEEDREAM_5_PRO_EXECUTION_ID = "apimart.model-api.seedream-5-pro.v1";
export const APIMART_MIDJOURNEY_MODEL_ID = "apimart/midjourney";
export const APIMART_MIDJOURNEY_EXECUTION_ID = "apimart.model-api.midjourney.v1";
export const APIMART_GROK_IMAGINE_1_5_MODEL_ID = "apimart/grok-imagine-1.5-image";
export const APIMART_GROK_IMAGINE_1_5_EXECUTION_ID = "apimart.model-api.grok-imagine-1-5-image.v1";
export const APIMART_GROK_IMAGE_2_MODEL_ID = "apimart/grok-image-2";
export const APIMART_GROK_IMAGE_2_EXECUTION_ID = "apimart.model-api.grok-image-2.v1";
const APIMART_IMAGE_FUNCTION_FAMILIES = Object.freeze({
  NANOBANANA: "nanobanana",
  NANOBANANA_2: "nanobanana-2",
  NANOBANANA_PRO: "nanobanana-pro",
  GPT_IMAGE_2: "gpt-image-2"
});
function createImageMenuExtension(_0x5dd5c1, _0x21c7e0 = null) {
  return Object.freeze({
    imageMenu: Object.freeze(_0x5dd5c1),
    ...(_0x21c7e0 ? {
      imageFunctionMenu: Object.freeze(_0x21c7e0)
    } : {})
  });
}
const GPT_IMAGE_2_PROMPT = Object.freeze({
  placeholder: "例：马斯克在抖音直播的截图 人气爆棚 很多网友送礼物 ，比例9比16"
});
const APIMART_IMAGE_RESPONSE_MAPPING = Object.freeze({
  taskIdPath: Object.freeze(["data[].task_id", "task_id", "taskId"]),
  statusPath: "status",
  errorPath: "error",
  resultPaths: Object.freeze(["data.result.images[].url", "result.images[].url", "data[].url", "results[].url", "results[].imageUrl", "url"])
});
const APIMART_IMAGE_TASK_POLLING = Object.freeze({
  mode: "task-proxy",
  method: "GET",
  urlTemplate: "{baseUrl}/v1/tasks/{taskId}?language=zh",
  headersMode: "bearer"
});
const APIMART_MIDJOURNEY_RESPONSE_MAPPING = Object.freeze({
  taskIdPath: Object.freeze(["data[].task_id", "task_id", "taskId"]),
  statusPath: "status",
  errorPath: "error",
  resultPaths: Object.freeze(["image_urls[]", "grid_image_url", "image_url", "data.image_urls[]", "data.image_url", "data.grid_image_url", "data.result.images[].url", "result.images[].url", "data[].url", "results[].url", "results[].imageUrl", "url"])
});
const APIMART_MIDJOURNEY_TASK_POLLING = Object.freeze({
  mode: "task-proxy",
  method: "GET",
  urlTemplate: "{baseUrl}/v1/midjourney/{taskId}",
  headersMode: "bearer"
});
const APIMART_GENERATION_MODE_FIELDS = Object.freeze(["generationParams.mode", "mode"]);
const APIMART_GENERATION_IMAGE_SIZE_FIELDS = Object.freeze(["generationParams.imageSize", "imageSize"]);
const APIMART_GENERATION_RATIO_FIELDS = Object.freeze(["generationParams.aspectRatio", "resolvedRatioLabel", "aspectRatio"]);
const APIMART_GENERATION_QUALITY_FIELDS = Object.freeze(["generationParams.quality", "quality"]);
const APIMART_RATIO_PILL_FIELD = Object.freeze({
  ...NANO_BANANA_2_RATIO_FIELD,
  variant: "ratioPill"
});
const APIMART_QWEN_IMAGE_3_INPUT_SLOTS = Object.freeze({
  allowedKinds: Object.freeze(["text", "image"]),
  minByKind: Object.freeze({
    image: 0
  }),
  maxByKind: Object.freeze({
    image: 3,
    video: 0,
    audio: 0
  })
});
const APIMART_QWEN_IMAGE_3_PROMPT_EXTEND_FIELD = Object.freeze({
  id: "prompt_extend",
  type: "toggle",
  placement: "advanced",
  label: "智能改写提示词",
  description: "开启后可选择直接改写或智能体增强；图生图仅支持直接改写。",
  defaultValue: false
});
const APIMART_QWEN_IMAGE_3_PROMPT_EXTEND_MODE_FIELD = Object.freeze({
  id: "prompt_extend_mode",
  type: "segmented",
  placement: "advanced",
  variant: "advancedRow",
  label: "改写模式",
  defaultValue: "direct",
  showWhen: Object.freeze({
    field: "prompt_extend",
    value: true
  }),
  options: Object.freeze([Object.freeze({
    value: "direct",
    label: "直接改写"
  }), Object.freeze({
    value: "agent",
    label: "智能体",
    tooltip: "仅支持文生图"
  })])
});
const APIMART_QWEN_IMAGE_3_NEGATIVE_PROMPT_FIELD = Object.freeze({
  id: "negativePrompt",
  type: "textarea",
  placement: "advanced",
  variant: "advancedRow",
  label: "负向提示词",
  defaultValue: ""
});
const APIMART_GROK_IMAGINE_INPUT_SLOTS = Object.freeze({
  allowedKinds: Object.freeze(["text", "image"]),
  minByKind: Object.freeze({
    image: 0
  }),
  maxByKind: Object.freeze({
    image: 1,
    video: 0,
    audio: 0
  })
});
const APIMART_GROK_IMAGE_2_INPUT_SLOTS = Object.freeze({
  allowedKinds: Object.freeze(["text"]),
  minByKind: Object.freeze({
    image: 0
  }),
  maxByKind: Object.freeze({
    image: 0,
    video: 0,
    audio: 0
  })
});
const APIMART_GROK_IMAGE_2_RATIO_FIELD = Object.freeze({
  ...ASPECT_RATIO_FIELD,
  variant: "ratioPill",
  defaultValue: "1:1",
  options: Object.freeze(["1:1", "2:3", "3:2", "3:4", "4:3", "9:16", "16:9"].map(_0x3595d8 => Object.freeze({
    value: _0x3595d8,
    label: _0x3595d8
  })))
});
const APIMART_GROK_IMAGE_2_BATCH_SIZE_FIELD = Object.freeze({
  ...BATCH_SIZE_FIELD,
  options: Object.freeze(Array.from({
    length: 12
  }, (_0x423a2f, _0x1f5ba3) => _0x1f5ba3 + 1).map(_0x15bc72 => Object.freeze({
    value: _0x15bc72,
    label: _0x15bc72 + "x",
    selectedLabel: _0x15bc72 + "x"
  })))
});
const APIMART_MIDJOURNEY_MODEL_FIELD = Object.freeze({
  id: "mjModel",
  type: "segmented",
  placement: "mode",
  variant: "pillMenu",
  label: "模型选择",
  menuTitle: "Midjourney",
  menuTooltip: "选择 APIMart Midjourney 的版本。V8 更新，V7 更稳，V6/V5 用于兼容旧风格，Niji 偏二次元和插画。",
  defaultValue: "v8.2",
  options: Object.freeze([Object.freeze({
    value: "v8.2",
    label: "V8.2",
    description: "最新版，优先用于通用生图和高质量出图。"
  }), Object.freeze({
    value: "v8.1",
    label: "V8.1",
    description: "新版 V8 系，适合稳定的写实、电影感和产品图。"
  }), Object.freeze({
    value: "v7",
    label: "V7",
    description: "通用度高，提示词跟随和风格稳定性较平衡。"
  }), Object.freeze({
    value: "v6.1",
    label: "V6.1",
    description: "兼容 V6 系参数和老项目风格，适合复现旧版效果。"
  }), Object.freeze({
    value: "v5.2",
    label: "V5.2",
    description: "旧版审美，风格化强，用于兼容 V5.2 效果。"
  }), Object.freeze({
    value: "v5.1",
    label: "V5.1",
    description: "更早 V5 效果，适合回收老项目或特定风格。"
  }), Object.freeze({
    value: "niji7",
    label: "Niji 7",
    description: "新版 Niji，偏动漫、插画、人设和二次元风格。"
  }), Object.freeze({
    value: "niji6",
    label: "Niji 6",
    description: "旧版 Niji，用于兼容已有二次元风格。"
  })])
});
const APIMART_MIDJOURNEY_SPEED_FIELD = Object.freeze({
  id: "speed",
  type: "segmented",
  placement: "mode",
  variant: "pillMenu",
  label: "速度",
  menuTitle: "速度模式",
  menuTooltip: "选择 APIMart MJ 任务的队列速度。Relax 省额度但慢，Fast 平衡，Turbo 最快但更耗额度。",
  defaultValue: "relax",
  options: Object.freeze([Object.freeze({
    value: "relax",
    label: "Relax",
    description: "放松队列，成本优先，适合非急件生成。"
  }), Object.freeze({
    value: "fast",
    label: "Fast",
    description: "常规快速模式，速度和成本平衡。"
  }), Object.freeze({
    value: "turbo",
    label: "Turbo",
    description: "最快模式，适合急需预览或快速迭代。"
  })])
});
const APIMART_MIDJOURNEY_RATIO_FIELD = Object.freeze({
  id: "aspectRatio",
  type: "segmented",
  placement: "resolution",
  label: "Ratio",
  defaultValue: "自适应",
  options: Object.freeze([Object.freeze({
    value: "自适应",
    label: "Auto"
  }), Object.freeze({
    value: "1:1",
    label: "1:1"
  }), Object.freeze({
    value: "4:3",
    label: "4:3"
  }), Object.freeze({
    value: "3:4",
    label: "3:4"
  }), Object.freeze({
    value: "16:9",
    label: "16:9"
  }), Object.freeze({
    value: "9:16",
    label: "9:16"
  }), Object.freeze({
    value: "3:2",
    label: "3:2"
  }), Object.freeze({
    value: "2:3",
    label: "2:3"
  }), Object.freeze({
    value: "2:1",
    label: "2:1"
  }), Object.freeze({
    value: "1:2",
    label: "1:2"
  }), Object.freeze({
    value: "21:9",
    label: "21:9"
  }), Object.freeze({
    value: "9:21",
    label: "9:21"
  })])
});
const APIMART_MIDJOURNEY_QUALITY_FIELD = Object.freeze({
  id: "quality",
  type: "segmented",
  placement: "resolution",
  label: "质量",
  defaultValue: "1",
  showInfoTip: true,
  description: "Midjourney --q 质量参数，控制渲染投入，不等于图片尺寸放大。",
  options: Object.freeze([Object.freeze({
    value: "0.25",
    label: "0.25"
  }), Object.freeze({
    value: "0.5",
    label: "0.5"
  }), Object.freeze({
    value: "1",
    label: "1"
  }), Object.freeze({
    value: "2",
    label: "2"
  })])
});
function createApimartMidjourneyNumberField({
  id: _0x38f217,
  label: _0x44bcb8,
  defaultValue: _0x5ecd1b,
  min: _0x123ae9,
  max: _0x3da9f3,
  step = 1,
  description: _0x13446a,
  showWhen: _0x4caace
}) {
  return Object.freeze({
    id: _0x38f217,
    type: "slider",
    placement: "advanced",
    variant: "advancedRow",
    label: _0x44bcb8,
    defaultValue: _0x5ecd1b,
    min: _0x123ae9,
    max: _0x3da9f3,
    step: step,
    ...(_0x13446a ? {
      description: _0x13446a
    } : {}),
    ...(_0x4caace ? {
      showWhen: Object.freeze(_0x4caace)
    } : {})
  });
}
function createApimartMidjourneyToggleField({
  id: _0x25d42e,
  label: _0x1eec04,
  defaultValue = false,
  description: _0x54e2ee,
  showWhen: _0x377e1a
}) {
  return Object.freeze({
    id: _0x25d42e,
    type: "segmented",
    placement: "advanced",
    variant: "rhV54BooleanRow",
    label: _0x1eec04,
    defaultValue: defaultValue,
    ...(_0x54e2ee ? {
      description: _0x54e2ee
    } : {}),
    ...(_0x377e1a ? {
      showWhen: Object.freeze(_0x377e1a)
    } : {}),
    options: Object.freeze([Object.freeze({
      value: true,
      label: "是"
    }), Object.freeze({
      value: false,
      label: "否"
    })])
  });
}
const APIMART_MIDJOURNEY_HD_SHOW_WHEN = Object.freeze({
  field: "mjModel",
  values: Object.freeze(["v8.2", "v8.1"])
});
const APIMART_MIDJOURNEY_DRAFT_SHOW_WHEN = Object.freeze({
  field: "mjModel",
  values: Object.freeze(["v8.2", "v8.1", "v7"])
});
const APIMART_MIDJOURNEY_STOP_SHOW_WHEN = Object.freeze({
  field: "mjModel",
  values: Object.freeze(["v6.1", "v5.2", "v5.1", "niji6"])
});
const APIMART_MIDJOURNEY_SEED_FIELD = Object.freeze({
  id: "seed",
  type: "text",
  placement: "advanced",
  variant: "advancedRow",
  label: "种子",
  defaultValue: "",
  description: "Midjourney --seed，留空则由平台自动生成。"
});
const APIMART_MIDJOURNEY_NEGATIVE_PROMPT_FIELD = Object.freeze({
  id: "negativePrompt",
  type: "textarea",
  placement: "advanced",
  variant: "advancedRow",
  label: "负面提示词",
  defaultValue: "",
  description: "Midjourney --no，用于排除不想要的元素。"
});
const APIMART_MIDJOURNEY_EXTRA_FIELD = Object.freeze({
  id: "extra",
  type: "text",
  placement: "advanced",
  variant: "advancedRow",
  label: "额外参数",
  defaultValue: "",
  description: "透传其他 Midjourney --xxx 参数，会追加到提示词。"
});
const APIMART_MIDJOURNEY_CHAOS_FIELD = createApimartMidjourneyNumberField({
  id: "chaos",
  label: "混乱度",
  defaultValue: 0,
  min: 0,
  max: 100,
  step: 5
});
const APIMART_MIDJOURNEY_STYLIZE_FIELD = createApimartMidjourneyNumberField({
  id: "stylize",
  label: "风格化",
  defaultValue: 100,
  min: 0,
  max: 1000,
  step: 50
});
const APIMART_MIDJOURNEY_WEIRD_FIELD = createApimartMidjourneyNumberField({
  id: "weird",
  label: "怪异度",
  defaultValue: 0,
  min: 0,
  max: 3000,
  step: 50
});
const APIMART_MIDJOURNEY_IW_FIELD = createApimartMidjourneyNumberField({
  id: "iw",
  label: "主图权重",
  defaultValue: 1,
  min: 0,
  max: 3,
  step: 0.1,
  description: "有主输入图时生效。"
});
const APIMART_MIDJOURNEY_CW_FIELD = createApimartMidjourneyNumberField({
  id: "cw",
  label: "角色权重",
  defaultValue: 100,
  min: 0,
  max: 100,
  step: 5,
  description: "有角色参考图时生效。"
});
const APIMART_MIDJOURNEY_SW_FIELD = createApimartMidjourneyNumberField({
  id: "sw",
  label: "风格权重",
  defaultValue: 100,
  min: 0,
  max: 1000,
  step: 50,
  description: "有风格参考图时生效。"
});
const APIMART_MIDJOURNEY_DW_FIELD = createApimartMidjourneyNumberField({
  id: "dw",
  label: "深度权重",
  defaultValue: 100,
  min: 0,
  max: 100,
  step: 5,
  description: "有深度参考图时生效。"
});
const APIMART_MIDJOURNEY_STOP_FIELD = createApimartMidjourneyNumberField({
  id: "stop",
  label: "提前停止",
  defaultValue: 100,
  min: 10,
  max: 100,
  step: 5,
  showWhen: APIMART_MIDJOURNEY_STOP_SHOW_WHEN
});
const APIMART_MIDJOURNEY_TILE_FIELD = createApimartMidjourneyToggleField({
  id: "tile",
  label: "平铺",
  description: "生成可无缝衔接的重复图案。"
});
const APIMART_MIDJOURNEY_RAW_FIELD = createApimartMidjourneyToggleField({
  id: "raw",
  label: "Raw 模式"
});
const APIMART_MIDJOURNEY_DRAFT_FIELD = createApimartMidjourneyToggleField({
  id: "draft",
  label: "Draft",
  showWhen: APIMART_MIDJOURNEY_DRAFT_SHOW_WHEN
});
const APIMART_MIDJOURNEY_HD_FIELD = createApimartMidjourneyToggleField({
  id: "hd",
  label: "HD",
  showWhen: APIMART_MIDJOURNEY_HD_SHOW_WHEN
});
const APIMART_MIDJOURNEY_INPUT_SLOTS = Object.freeze({
  allowedKinds: Object.freeze(["text", "image"]),
  minByKind: Object.freeze({
    image: 0
  }),
  maxByKind: Object.freeze({
    image: 4,
    video: 0,
    audio: 0
  }),
  fixedSlots: Object.freeze([Object.freeze({
    id: "imageUrl",
    kind: "image",
    label: "主输入图",
    required: false,
    description: "可选，作为 image_urls 传给 Midjourney。"
  }), Object.freeze({
    id: "cref",
    kind: "image",
    label: "角色参考图",
    required: false,
    description: "可选，作为 cref 传给 Midjourney。"
  }), Object.freeze({
    id: "sref",
    kind: "image",
    label: "风格参考图",
    required: false,
    description: "可选，作为 sref 传给 Midjourney。"
  }), Object.freeze({
    id: "dref",
    kind: "image",
    label: "深度参考图",
    required: false,
    description: "可选，作为 dref 传给 Midjourney。"
  })])
});
const APIMART_SEEDREAM_4_POLICY = Object.freeze({
  allowedResolutions: Object.freeze(["1K", "2K", "4K"]),
  maxBatchSize: 15,
  textToImageBatchSize: 1,
  preserveAdaptiveInputRatio: true
});
const APIMART_SEEDREAM_4_5_POLICY = Object.freeze({
  allowedResolutions: Object.freeze(["2K", "4K"]),
  maxBatchSize: 15,
  textToImageBatchSize: 1,
  preserveAdaptiveInputRatio: true
});
const APIMART_SEEDREAM_5_LITE_POLICY = Object.freeze({
  allowedResolutions: Object.freeze(["2K", "3K"]),
  maxBatchSize: 4,
  preserveAdaptiveInputRatio: true
});
const APIMART_SEEDREAM_5_PRO_POLICY = Object.freeze({
  allowedResolutions: Object.freeze(["1K", "2K"]),
  preserveAdaptiveInputRatio: true
});
const APIMART_IMAGE_BODY_MAPPING = Object.freeze([Object.freeze({
  path: "model",
  from: "model"
}), Object.freeze({
  path: "prompt",
  from: "prompt"
}), Object.freeze({
  path: "n",
  from: "constant",
  value: 1
}), Object.freeze({
  path: "resolution",
  from: "param",
  field: "imageSize",
  defaultValue: "2K"
}), Object.freeze({
  path: "size",
  from: "param",
  field: Object.freeze(["resolvedRatioLabel", "aspectRatio"]),
  transform: "providerRatioSize",
  omitWhenEmpty: true
}), Object.freeze({
  path: "image_urls",
  from: "inputImages",
  omitWhenEmpty: true
})]);
const APIMART_GPT_IMAGE_2_BODY_MAPPING = Object.freeze([Object.freeze({
  path: "model",
  from: "model"
}), Object.freeze({
  path: "prompt",
  from: "prompt"
}), Object.freeze({
  path: "n",
  from: "constant",
  value: 1
}), Object.freeze({
  path: "resolution",
  from: "param",
  field: APIMART_GENERATION_IMAGE_SIZE_FIELDS,
  defaultValue: "1K",
  transform: "apimartGptImage2Resolution"
}), Object.freeze({
  path: "size",
  from: "param",
  field: APIMART_GENERATION_RATIO_FIELDS,
  transform: "providerRatioSize",
  omitWhenEmpty: true
}), Object.freeze({
  path: "quality",
  from: "param",
  field: APIMART_GENERATION_QUALITY_FIELDS,
  defaultValue: "medium",
  when: Object.freeze({
    field: APIMART_GENERATION_MODE_FIELDS,
    equals: "official"
  })
}), Object.freeze({
  path: "image_urls",
  from: "inputImages",
  omitWhenEmpty: true
})]);
const APIMART_QWEN_IMAGE_BODY_MAPPING = Object.freeze([Object.freeze({
  path: "model",
  from: "model"
}), Object.freeze({
  path: "prompt",
  from: "prompt"
}), Object.freeze({
  path: "n",
  from: "param",
  field: "batchSize",
  defaultValue: 1,
  transform: "apimartQwenImageCount"
}), Object.freeze({
  path: "resolution",
  from: "param",
  field: "imageSize",
  defaultValue: "1K",
  transform: "apimartQwenImageResolution"
}), Object.freeze({
  path: "size",
  from: "param",
  field: Object.freeze(["resolvedRatioLabel", "aspectRatio"]),
  defaultValue: "1:1",
  transform: "providerRatioSize"
}), Object.freeze({
  path: "image_urls",
  from: "inputImages",
  omitWhenEmpty: true
})]);
const APIMART_QWEN_IMAGE_3_BODY_MAPPING = Object.freeze([...APIMART_QWEN_IMAGE_BODY_MAPPING, Object.freeze({
  path: "negative_prompt",
  from: "param",
  field: Object.freeze(["generationParams.negativePrompt", "negativePrompt", "negative_prompt"]),
  transform: "apimartOptionalText",
  omitWhenEmpty: true
}), Object.freeze({
  path: "prompt_extend",
  from: "param",
  field: Object.freeze(["generationParams.prompt_extend", "prompt_extend"]),
  defaultValue: false,
  transform: "booleanParam"
}), Object.freeze({
  path: "prompt_extend_mode",
  from: "param",
  field: Object.freeze(["generationParams.prompt_extend_mode", "prompt_extend_mode"]),
  defaultValue: "direct",
  when: Object.freeze({
    field: Object.freeze(["generationParams.prompt_extend", "prompt_extend"]),
    equals: true
  })
})]);
const APIMART_Z_IMAGE_TURBO_BODY_MAPPING = Object.freeze([Object.freeze({
  path: "model",
  from: "model"
}), Object.freeze({
  path: "prompt",
  from: "prompt"
}), Object.freeze({
  path: "resolution",
  from: "param",
  field: "imageSize",
  defaultValue: "1K",
  transform: "apimartQwenImageResolution"
}), Object.freeze({
  path: "size",
  from: "param",
  field: Object.freeze(["resolvedRatioLabel", "aspectRatio"]),
  defaultValue: "1:1",
  transform: "providerRatioSize"
}), Object.freeze({
  path: "prompt_extend",
  from: "param",
  field: "prompt_extend",
  defaultValue: false,
  transform: "booleanParam"
})]);
const APIMART_WAN_IMAGE_BODY_MAPPING = Object.freeze([Object.freeze({
  path: "model",
  from: "model"
}), Object.freeze({
  path: "prompt",
  from: "prompt"
}), Object.freeze({
  path: "n",
  from: "param",
  field: "batchSize",
  defaultValue: 1,
  transform: "apimartImageCount"
}), Object.freeze({
  path: "resolution",
  from: "param",
  field: "imageSize",
  defaultValue: "2K",
  transform: "apimartWanImageResolution"
}), Object.freeze({
  path: "size",
  from: "param",
  field: Object.freeze(["resolvedRatioLabel", "aspectRatio"]),
  defaultValue: "1:1",
  transform: "providerRatioSize"
}), Object.freeze({
  path: "image_urls",
  from: "inputImages",
  omitWhenEmpty: true
}), Object.freeze({
  path: "thinking_mode",
  from: "param",
  field: "thinking_mode",
  defaultValue: true,
  transform: "booleanParam"
})]);
const APIMART_NANO_BANANA_2_BODY_MAPPING = Object.freeze([...APIMART_IMAGE_BODY_MAPPING.map(_0xa5b08d => _0xa5b08d.path === "resolution" ? Object.freeze({
  ..._0xa5b08d,
  transform: "apimartNanoBanana2Resolution"
}) : _0xa5b08d), Object.freeze({
  path: "google_search",
  from: "param",
  field: "google_search",
  defaultValue: false,
  transform: "apimartGoogleSearch"
}), Object.freeze({
  path: "google_image_search",
  from: "param",
  field: "google_image_search",
  defaultValue: false,
  transform: "apimartGoogleImageSearch"
})]);
const APIMART_NANO_BANANA_PRO_BODY_MAPPING = Object.freeze([...APIMART_IMAGE_BODY_MAPPING.map(_0x559596 => _0x559596.path === "resolution" ? Object.freeze({
  ..._0x559596,
  transform: "apimartNanoBanana2Resolution"
}) : _0x559596)]);
const APIMART_NANO_BANANA_BODY_MAPPING = Object.freeze([...APIMART_IMAGE_BODY_MAPPING.map(_0x59da61 => _0x59da61.path === "resolution" ? Object.freeze({
  path: "resolution",
  from: "constant",
  value: "1K"
}) : _0x59da61)]);
const APIMART_GEMINI_3_1_FLASH_LITE_BODY_MAPPING = Object.freeze([...APIMART_IMAGE_BODY_MAPPING.map(_0x1f6817 => _0x1f6817.path === "resolution" ? Object.freeze({
  path: "resolution",
  from: "constant",
  value: "1K"
}) : _0x1f6817)]);
const APIMART_GROK_IMAGINE_BODY_MAPPING = Object.freeze([Object.freeze({
  path: "model",
  from: "model"
}), Object.freeze({
  path: "prompt",
  from: "prompt"
}), Object.freeze({
  path: "n",
  from: "constant",
  value: 1
}), Object.freeze({
  path: "size",
  from: "param",
  field: APIMART_GENERATION_RATIO_FIELDS,
  transform: "providerRatioSize",
  omitWhenEmpty: true
}), Object.freeze({
  path: "image_urls",
  from: "inputImages",
  omitWhenEmpty: true
})]);
const APIMART_GROK_IMAGE_2_BODY_MAPPING = Object.freeze([Object.freeze({
  path: "model",
  from: "model"
}), Object.freeze({
  path: "prompt",
  from: "prompt"
}), Object.freeze({
  path: "n",
  from: "param",
  field: "batchSize",
  defaultValue: 1,
  transform: Object.freeze({
    name: "integerRange",
    min: 1,
    max: 12,
    fallback: 1
  })
}), Object.freeze({
  path: "size",
  from: "param",
  field: APIMART_GENERATION_RATIO_FIELDS,
  defaultValue: "1:1",
  transform: "providerRatioSize"
}), Object.freeze({
  path: "resolution",
  from: "constant",
  value: "quality"
}), Object.freeze({
  path: "response_format",
  from: "constant",
  value: "url"
})]);
const APIMART_GROK_IMAGE_2_RESPONSE_MAPPING = Object.freeze({
  ...APIMART_IMAGE_RESPONSE_MAPPING,
  taskIdPath: Object.freeze(["data.id", ...APIMART_IMAGE_RESPONSE_MAPPING.taskIdPath])
});
const APIMART_SEEDREAM_BODY_MAPPING = Object.freeze([Object.freeze({
  path: "model",
  from: "model"
}), Object.freeze({
  path: "prompt",
  from: "prompt"
}), Object.freeze({
  path: "n",
  from: "constant",
  value: 1
}), Object.freeze({
  path: "resolution",
  from: "param",
  field: "imageSize",
  defaultValue: "2K",
  transform: "apimartSeedreamResolution"
}), Object.freeze({
  path: "size",
  from: "param",
  field: Object.freeze(["resolvedRatioLabel", "aspectRatio"]),
  transform: "providerRatioSize",
  omitWhenEmpty: true
}), Object.freeze({
  path: "image_urls",
  from: "inputImages",
  omitWhenEmpty: true
})]);
const APIMART_MIDJOURNEY_BODY_MAPPING = Object.freeze([Object.freeze({
  path: "prompt",
  from: "prompt"
}), Object.freeze({
  path: "size",
  from: "param",
  field: APIMART_GENERATION_RATIO_FIELDS,
  transform: "providerRatioSize",
  omitWhenEmpty: true
}), Object.freeze({
  path: "speed",
  from: "param",
  field: "speed",
  defaultValue: "relax"
}), Object.freeze({
  path: "quality",
  from: "param",
  field: "quality",
  defaultValue: "1"
}), Object.freeze({
  path: "seed",
  from: "param",
  field: "seed",
  transform: "apimartOptionalInteger",
  omitWhenEmpty: true
}), Object.freeze({
  path: "negative_prompt",
  from: "param",
  field: "negativePrompt",
  transform: "apimartOptionalText",
  omitWhenEmpty: true
}), Object.freeze({
  path: "stylize",
  from: "param",
  field: "stylize"
}), Object.freeze({
  path: "chaos",
  from: "param",
  field: "chaos"
}), Object.freeze({
  path: "weird",
  from: "param",
  field: "weird"
}), Object.freeze({
  path: "iw",
  from: "param",
  field: "iw"
}), Object.freeze({
  path: "cw",
  from: "param",
  field: "cw"
}), Object.freeze({
  path: "sw",
  from: "param",
  field: "sw"
}), Object.freeze({
  path: "dw",
  from: "param",
  field: "dw"
}), Object.freeze({
  path: "stop",
  from: "param",
  field: "stop",
  omitWhenEmpty: true
}), Object.freeze({
  path: "tile",
  from: "param",
  field: "tile",
  defaultValue: false,
  transform: "booleanParam"
}), Object.freeze({
  path: "raw",
  from: "param",
  field: "raw",
  defaultValue: false,
  transform: "booleanParam"
}), Object.freeze({
  path: "draft",
  from: "param",
  field: "draft",
  defaultValue: false,
  transform: "booleanParam"
}), Object.freeze({
  path: "hd",
  from: "param",
  field: "hd",
  defaultValue: false,
  transform: "booleanParam"
}), Object.freeze({
  path: "extra",
  from: "param",
  field: "extra",
  transform: "apimartOptionalText",
  omitWhenEmpty: true
})]);
export const apimartImageModelApiModelManifests = Object.freeze([createImageModelApiManifest({
  modelId: APIMART_NANO_BANANA_2_MODEL_ID,
  executionId: APIMART_NANO_BANANA_2_EXECUTION_ID,
  provider: "apimart",
  displayName: "Nano banana 2",
  icon: "images/gemini.svg",
  description: "APIMart image model API",
  inputSlots: IMAGE_MODEL_API_14_IMAGE_INPUT_SLOTS,
  fields: [APIMART_NANO_BANANA_2_MODE_FIELD, APIMART_NANO_BANANA_2_IMAGE_SIZE_FIELD, NANO_BANANA_2_RATIO_FIELD, APIMART_NANO_BANANA_2_GOOGLE_SEARCH_FIELD, APIMART_NANO_BANANA_2_GOOGLE_IMAGE_SEARCH_FIELD, BATCH_SIZE_FIELD],
  extensions: createImageMenuExtension({
    group: "apimart",
    order: 10,
    title: "Nano banana 2",
    subtitle: "新一代架构，兼顾细节与平衡",
    iconAlt: "gemini",
    gap: 10
  }, {
    family: APIMART_IMAGE_FUNCTION_FAMILIES.NANOBANANA_2
  })
}), createImageModelApiManifest({
  modelId: APIMART_GEMINI_3_1_FLASH_LITE_IMAGE_MODEL_ID,
  executionId: APIMART_GEMINI_3_1_FLASH_LITE_IMAGE_EXECUTION_ID,
  provider: "apimart",
  displayName: "Nano Banana Lite",
  icon: "images/gemini.svg",
  description: "APIMart Nano Banana Lite image model API",
  inputSlots: IMAGE_MODEL_API_14_IMAGE_INPUT_SLOTS,
  fields: [APIMART_NANO_BANANA_IMAGE_SIZE_FIELD, ASPECT_RATIO_FIELD, BATCH_SIZE_FIELD],
  extensions: createImageMenuExtension({
    group: "apimart",
    order: 15,
    title: "Nano Banana Lite",
    subtitle: "轻量版图像生成，固定 1K 输出",
    iconAlt: "gemini",
    gap: 9
  })
}), createImageModelApiManifest({
  modelId: APIMART_NANO_BANANA_PRO_MODEL_ID,
  executionId: APIMART_NANO_BANANA_PRO_EXECUTION_ID,
  provider: "apimart",
  displayName: "Nano banana pro",
  icon: "images/gemini.svg",
  description: "APIMart image model API",
  inputSlots: IMAGE_MODEL_API_14_IMAGE_INPUT_SLOTS,
  fields: [APIMART_NANO_BANANA_PRO_MODE_FIELD, APIMART_NANO_BANANA_PRO_IMAGE_SIZE_FIELD, ASPECT_RATIO_FIELD, BATCH_SIZE_FIELD],
  extensions: createImageMenuExtension({
    group: "apimart",
    order: 20,
    title: "Nano banana pro",
    subtitle: "专业级画质，光影渲染深度优化",
    iconAlt: "gemini",
    gap: 9
  }, {
    family: APIMART_IMAGE_FUNCTION_FAMILIES.NANOBANANA_PRO
  })
}), createImageModelApiManifest({
  modelId: APIMART_NANO_BANANA_MODEL_ID,
  executionId: APIMART_NANO_BANANA_EXECUTION_ID,
  provider: "apimart",
  displayName: "Nano banana",
  icon: "images/gemini.svg",
  description: "APIMart image model API",
  inputSlots: IMAGE_MODEL_API_14_IMAGE_INPUT_SLOTS,
  fields: [APIMART_NANO_BANANA_MODE_FIELD, APIMART_NANO_BANANA_IMAGE_SIZE_FIELD, ASPECT_RATIO_FIELD, BATCH_SIZE_FIELD],
  extensions: createImageMenuExtension({
    group: "apimart",
    order: 30,
    title: "Nano banana",
    subtitle: "极速版，支持独特创意风格呈现",
    iconAlt: "gemini",
    gap: 10
  }, {
    family: APIMART_IMAGE_FUNCTION_FAMILIES.NANOBANANA
  })
}), createImageModelApiManifest({
  modelId: APIMART_GPT_IMAGE_2_MODEL_ID,
  executionId: APIMART_GPT_IMAGE_2_EXECUTION_ID,
  provider: "apimart",
  displayName: "GPT image 2",
  icon: "AM",
  description: "APIMart image model API",
  prompt: GPT_IMAGE_2_PROMPT,
  inputSlots: IMAGE_MODEL_API_16_IMAGE_INPUT_SLOTS,
  fields: [APIMART_GPT_IMAGE_2_MODE_FIELD, APIMART_GPT_IMAGE_2_QUALITY_FIELD, APIMART_GPT_IMAGE_2_IMAGE_SIZE_FIELD, APIMART_GPT_IMAGE_2_RATIO_FIELD, BATCH_SIZE_FIELD],
  ratioPolicy: Object.freeze({
    capability: "size"
  }),
  extensions: createImageMenuExtension({
    group: "apimart",
    order: 40,
    title: "GPT image 2",
    subtitle: "OpenAI 图像生成模型，支持文生图与图生图",
    iconKind: "apimartBadge",
    gap: 10
  }, {
    family: APIMART_IMAGE_FUNCTION_FAMILIES.GPT_IMAGE_2
  })
}), createImageModelApiManifest({
  modelId: APIMART_QWEN_IMAGE_MODEL_ID,
  executionId: APIMART_QWEN_IMAGE_EXECUTION_ID,
  provider: "apimart",
  displayName: "Qwen image 2.0",
  icon: "AM",
  description: "APIMart Qwen image generation API",
  fields: [APIMART_QWEN_IMAGE_MODE_FIELD, APIMART_QWEN_IMAGE_SIZE_FIELD, APIMART_QWEN_IMAGE_RATIO_FIELD, APIMART_QWEN_IMAGE_BATCH_SIZE_FIELD],
  extensions: createImageMenuExtension({
    group: "apimart",
    order: 45,
    title: "Qwen image 2.0",
    subtitle: "Qwen 图像生成，支持 1K/2K 与最多 6 张",
    iconKind: "apimartBadge",
    gap: 10
  })
}), createImageModelApiManifest({
  modelId: APIMART_QWEN_IMAGE_3_MODEL_ID,
  executionId: APIMART_QWEN_IMAGE_3_EXECUTION_ID,
  provider: "apimart",
  displayName: "Qwen Image 3.0",
  icon: "AM",
  description: "APIMart Qwen Image 3.0 generation and editing API",
  inputSlots: APIMART_QWEN_IMAGE_3_INPUT_SLOTS,
  fields: [APIMART_QWEN_IMAGE_MODE_FIELD, APIMART_QWEN_IMAGE_SIZE_FIELD, APIMART_QWEN_IMAGE_RATIO_FIELD, APIMART_QWEN_IMAGE_3_PROMPT_EXTEND_FIELD, APIMART_QWEN_IMAGE_3_PROMPT_EXTEND_MODE_FIELD, APIMART_QWEN_IMAGE_3_NEGATIVE_PROMPT_FIELD, APIMART_QWEN_IMAGE_BATCH_SIZE_FIELD],
  extensions: createImageMenuExtension({
    group: "apimart",
    order: 46,
    title: "Qwen Image 3.0",
    subtitle: "标准 / Pro，支持 1K/2K、最多 3 张参考图与 6 张输出",
    iconKind: "apimartBadge",
    gap: 10
  })
}), createImageModelApiManifest({
  modelId: APIMART_Z_IMAGE_TURBO_MODEL_ID,
  executionId: APIMART_Z_IMAGE_TURBO_EXECUTION_ID,
  provider: "apimart",
  displayName: "Z-Image-Turbo",
  icon: "AM",
  description: "APIMart Z-Image-Turbo image generation API",
  inputSlots: Object.freeze({
    allowedKinds: Object.freeze(["text"]),
    minByKind: Object.freeze({
      image: 0
    }),
    maxByKind: Object.freeze({
      image: 0,
      video: 0,
      audio: 0
    })
  }),
  fields: [APIMART_Z_IMAGE_TURBO_IMAGE_SIZE_FIELD, APIMART_Z_IMAGE_TURBO_RATIO_FIELD, APIMART_Z_IMAGE_TURBO_PROMPT_EXTEND_FIELD, BATCH_SIZE_FIELD],
  extensions: createImageMenuExtension({
    group: "apimart",
    order: 47,
    title: "Z-Image-Turbo",
    subtitle: "轻量快速生图，支持 1K/2K 和智能改写",
    iconKind: "apimartBadge",
    gap: 10
  })
}), createImageModelApiManifest({
  modelId: APIMART_WAN_IMAGE_MODEL_ID,
  executionId: APIMART_WAN_IMAGE_EXECUTION_ID,
  provider: "apimart",
  displayName: "Wan 2.7",
  icon: "AM",
  description: "APIMart wan2.7 image generation and editing API",
  inputSlots: Object.freeze({
    allowedKinds: Object.freeze(["text", "image"]),
    minByKind: Object.freeze({
      image: 0
    }),
    maxByKind: Object.freeze({
      image: 9,
      video: 0,
      audio: 0
    })
  }),
  fields: [APIMART_WAN_IMAGE_MODE_FIELD, APIMART_WAN_IMAGE_SIZE_FIELD, APIMART_WAN_IMAGE_RATIO_FIELD, APIMART_WAN_THINKING_MODE_FIELD, BATCH_SIZE_FIELD],
  extensions: createImageMenuExtension({
    group: "apimart",
    order: 48,
    title: "Wan 2.7",
    subtitle: "支持文生图、图像编辑和多图参考",
    iconKind: "apimartBadge",
    gap: 10
  })
}), createImageModelApiManifest({
  modelId: APIMART_SEEDREAM_4_MODEL_ID,
  executionId: APIMART_SEEDREAM_4_EXECUTION_ID,
  provider: "apimart",
  displayName: "Seedream 4.0",
  icon: "images/jimeng.png",
  description: "APIMart Seedream image model API",
  fields: [APIMART_SEEDREAM_4_IMAGE_SIZE_FIELD, APIMART_SEEDREAM_RATIO_FIELD, BATCH_SIZE_FIELD],
  extensions: createImageMenuExtension({
    group: "apimart",
    order: 50,
    title: "Seedream 4.0",
    subtitle: "灵活图像功能，支持高分辨率",
    iconAlt: "jimeng",
    gap: 10
  })
}), createImageModelApiManifest({
  modelId: APIMART_SEEDREAM_4_5_MODEL_ID,
  executionId: APIMART_SEEDREAM_4_5_EXECUTION_ID,
  provider: "apimart",
  displayName: "Seedream 4.5",
  icon: "images/jimeng.png",
  description: "APIMart Seedream image model API",
  fields: [APIMART_SEEDREAM_4_5_IMAGE_SIZE_FIELD, APIMART_SEEDREAM_RATIO_FIELD, BATCH_SIZE_FIELD],
  extensions: createImageMenuExtension({
    group: "apimart",
    order: 60,
    title: "Seedream 4.5",
    subtitle: "性能均衡的多模式图像生成",
    iconAlt: "jimeng",
    gap: 9
  })
}), createImageModelApiManifest({
  modelId: APIMART_SEEDREAM_5_LITE_MODEL_ID,
  executionId: APIMART_SEEDREAM_5_LITE_EXECUTION_ID,
  provider: "apimart",
  displayName: "Seedream 5.0",
  icon: "images/jimeng.png",
  description: "APIMart Seedream image model API",
  fields: [APIMART_SEEDREAM_5_LITE_IMAGE_SIZE_FIELD, APIMART_SEEDREAM_5_LITE_RATIO_FIELD, BATCH_SIZE_FIELD],
  extensions: createImageMenuExtension({
    group: "apimart",
    order: 70,
    title: "Seedream 5.0",
    subtitle: "轻量高效生图，支持 2K/3K 输出",
    iconAlt: "jimeng",
    gap: 9
  })
}), createImageModelApiManifest({
  modelId: APIMART_SEEDREAM_5_PRO_MODEL_ID,
  executionId: APIMART_SEEDREAM_5_PRO_EXECUTION_ID,
  provider: "apimart",
  displayName: "Seedream 5.0 Pro",
  icon: "images/jimeng.png",
  description: "APIMart Seedream image model API",
  inputSlots: IMAGE_MODEL_API_10_IMAGE_INPUT_SLOTS,
  fields: [APIMART_SEEDREAM_5_PRO_IMAGE_SIZE_FIELD, APIMART_SEEDREAM_5_LITE_RATIO_FIELD, BATCH_SIZE_FIELD],
  extensions: createImageMenuExtension({
    group: "apimart",
    order: 72,
    title: "Seedream 5.0 Pro",
    subtitle: "专业高质量生图，支持 1K/2K 输出",
    iconAlt: "jimeng",
    gap: 9
  })
}), createImageModelApiManifest({
  modelId: APIMART_GROK_IMAGE_2_MODEL_ID,
  executionId: APIMART_GROK_IMAGE_2_EXECUTION_ID,
  provider: "apimart",
  displayName: "Grok Image 2",
  icon: "AM",
  description: "APIMart Grok Imagine 2.0 Ext text-to-image API",
  inputSlots: APIMART_GROK_IMAGE_2_INPUT_SLOTS,
  fields: [APIMART_GROK_IMAGE_2_RATIO_FIELD, APIMART_GROK_IMAGE_2_BATCH_SIZE_FIELD],
  extensions: createImageMenuExtension({
    group: "apimart",
    order: 74,
    title: "Grok Image 2",
    subtitle: "Grok Imagine 2.0 Ext 文生图",
    iconKind: "apimartBadge",
    gap: 10
  })
}), createImageModelApiManifest({
  modelId: APIMART_GROK_IMAGINE_1_5_MODEL_ID,
  executionId: APIMART_GROK_IMAGINE_1_5_EXECUTION_ID,
  provider: "apimart",
  displayName: "Grok Imagine 1.5",
  icon: "AM",
  description: "APIMart Grok Imagine 1.5 image generation and edit API",
  inputSlots: APIMART_GROK_IMAGINE_INPUT_SLOTS,
  fields: [APIMART_RATIO_PILL_FIELD, BATCH_SIZE_FIELD],
  extensions: createImageMenuExtension({
    group: "apimart",
    order: 75,
    title: "Grok Imagine 1.5",
    subtitle: "文生图 / 单图编辑，无参考图时自动文生",
    iconKind: "apimartBadge",
    gap: 10
  })
}), createImageModelApiManifest({
  modelId: APIMART_MIDJOURNEY_MODEL_ID,
  executionId: APIMART_MIDJOURNEY_EXECUTION_ID,
  provider: "apimart",
  displayName: "Midjourney",
  icon: "AM",
  description: "APIMart Midjourney image generation API",
  inputSlots: APIMART_MIDJOURNEY_INPUT_SLOTS,
  fields: [APIMART_MIDJOURNEY_MODEL_FIELD, APIMART_MIDJOURNEY_SPEED_FIELD, APIMART_MIDJOURNEY_QUALITY_FIELD, APIMART_MIDJOURNEY_RATIO_FIELD, APIMART_MIDJOURNEY_SEED_FIELD, APIMART_MIDJOURNEY_NEGATIVE_PROMPT_FIELD, APIMART_MIDJOURNEY_CHAOS_FIELD, APIMART_MIDJOURNEY_STYLIZE_FIELD, APIMART_MIDJOURNEY_WEIRD_FIELD, APIMART_MIDJOURNEY_IW_FIELD, APIMART_MIDJOURNEY_CW_FIELD, APIMART_MIDJOURNEY_SW_FIELD, APIMART_MIDJOURNEY_DW_FIELD, APIMART_MIDJOURNEY_STOP_FIELD, APIMART_MIDJOURNEY_TILE_FIELD, APIMART_MIDJOURNEY_RAW_FIELD, APIMART_MIDJOURNEY_DRAFT_FIELD, APIMART_MIDJOURNEY_HD_FIELD, APIMART_MIDJOURNEY_EXTRA_FIELD],
  extensions: createImageMenuExtension({
    group: "apimart",
    order: 80,
    title: "Midjourney",
    subtitle: "Midjourney V8.2/V8.1/V7/V6.1/Niji 图像生成",
    iconKind: "apimartBadge",
    gap: 10
  })
})]);
export const apimartImageModelApiExecutionManifests = Object.freeze([createModelApiExecutionManifest({
  id: APIMART_NANO_BANANA_2_EXECUTION_ID,
  provider: "apimart",
  model: "gemini-3.1-flash-image-preview",
  endpoint: "/v1/images/generations",
  bodyMapping: APIMART_NANO_BANANA_2_BODY_MAPPING,
  responseMapping: APIMART_IMAGE_RESPONSE_MAPPING,
  taskPolling: APIMART_IMAGE_TASK_POLLING,
  modeModels: Object.freeze({
    standard: "gemini-3.1-flash-image-preview",
    official: "gemini-3.1-flash-image-preview-official"
  })
}), createModelApiExecutionManifest({
  id: APIMART_GEMINI_3_1_FLASH_LITE_IMAGE_EXECUTION_ID,
  provider: "apimart",
  model: "gemini-3.1-flash-lite-image",
  endpoint: "/v1/images/generations",
  bodyMapping: APIMART_GEMINI_3_1_FLASH_LITE_BODY_MAPPING,
  responseMapping: APIMART_IMAGE_RESPONSE_MAPPING,
  taskPolling: APIMART_IMAGE_TASK_POLLING
}), createModelApiExecutionManifest({
  id: APIMART_NANO_BANANA_PRO_EXECUTION_ID,
  provider: "apimart",
  model: "gemini-3-pro-image-preview",
  endpoint: "/v1/images/generations",
  bodyMapping: APIMART_NANO_BANANA_PRO_BODY_MAPPING,
  responseMapping: APIMART_IMAGE_RESPONSE_MAPPING,
  taskPolling: APIMART_IMAGE_TASK_POLLING,
  modeModels: Object.freeze({
    standard: "gemini-3-pro-image-preview",
    official: "gemini-3-pro-image-preview-official"
  })
}), createModelApiExecutionManifest({
  id: APIMART_NANO_BANANA_EXECUTION_ID,
  provider: "apimart",
  model: "gemini-2.5-flash-image-preview",
  endpoint: "/v1/images/generations",
  bodyMapping: APIMART_NANO_BANANA_BODY_MAPPING,
  responseMapping: APIMART_IMAGE_RESPONSE_MAPPING,
  taskPolling: APIMART_IMAGE_TASK_POLLING,
  modeModels: Object.freeze({
    standard: "gemini-2.5-flash-image-preview",
    official: "gemini-2.5-flash-image-preview-official"
  })
}), createModelApiExecutionManifest({
  id: APIMART_GPT_IMAGE_2_EXECUTION_ID,
  provider: "apimart",
  model: "gpt-image-2",
  endpoint: "/v1/images/generations",
  bodyMapping: APIMART_GPT_IMAGE_2_BODY_MAPPING,
  responseMapping: APIMART_IMAGE_RESPONSE_MAPPING,
  taskPolling: APIMART_IMAGE_TASK_POLLING,
  extensions: Object.freeze({
    bodyResolver: "apimartGptImage2Image"
  }),
  modeModels: Object.freeze({
    standard: "gpt-image-2",
    official: "gpt-image-2-official"
  })
}), createModelApiExecutionManifest({
  id: APIMART_QWEN_IMAGE_EXECUTION_ID,
  provider: "apimart",
  model: "qwen-image-2.0",
  endpoint: "/v1/images/generations",
  bodyMapping: APIMART_QWEN_IMAGE_BODY_MAPPING,
  responseMapping: APIMART_IMAGE_RESPONSE_MAPPING,
  taskPolling: APIMART_IMAGE_TASK_POLLING,
  extensions: Object.freeze({
    batchSubmitMode: "providerN",
    maxBatchSize: 6
  }),
  modeModels: Object.freeze({
    standard: "qwen-image-2.0",
    pro: "qwen-image-2.0-pro"
  })
}), createModelApiExecutionManifest({
  id: APIMART_QWEN_IMAGE_3_EXECUTION_ID,
  provider: "apimart",
  model: "qwen-image-3.0",
  endpoint: "/v1/images/generations",
  bodyMapping: APIMART_QWEN_IMAGE_3_BODY_MAPPING,
  responseMapping: APIMART_IMAGE_RESPONSE_MAPPING,
  taskPolling: APIMART_IMAGE_TASK_POLLING,
  extensions: Object.freeze({
    batchSubmitMode: "providerN",
    maxBatchSize: 6
  }),
  modeModels: Object.freeze({
    standard: "qwen-image-3.0",
    pro: "qwen-image-3.0-pro"
  })
}), createModelApiExecutionManifest({
  id: APIMART_Z_IMAGE_TURBO_EXECUTION_ID,
  provider: "apimart",
  model: "z-image-turbo",
  endpoint: "/v1/images/generations",
  bodyMapping: APIMART_Z_IMAGE_TURBO_BODY_MAPPING,
  responseMapping: APIMART_IMAGE_RESPONSE_MAPPING,
  taskPolling: APIMART_IMAGE_TASK_POLLING
}), createModelApiExecutionManifest({
  id: APIMART_WAN_IMAGE_EXECUTION_ID,
  provider: "apimart",
  model: "wan2.7-image",
  endpoint: "/v1/images/generations",
  bodyMapping: APIMART_WAN_IMAGE_BODY_MAPPING,
  responseMapping: APIMART_IMAGE_RESPONSE_MAPPING,
  taskPolling: APIMART_IMAGE_TASK_POLLING,
  extensions: Object.freeze({
    batchSubmitMode: "providerN",
    maxBatchSize: 4
  }),
  modeModels: Object.freeze({
    standard: "wan2.7-image",
    pro: "wan2.7-image-pro"
  })
}), createModelApiExecutionManifest({
  id: APIMART_SEEDREAM_4_EXECUTION_ID,
  provider: "apimart",
  model: "doubao-seedream-4.0",
  endpoint: "/v1/images/generations",
  bodyMapping: APIMART_SEEDREAM_BODY_MAPPING,
  responseMapping: APIMART_IMAGE_RESPONSE_MAPPING,
  taskPolling: APIMART_IMAGE_TASK_POLLING,
  extensions: Object.freeze({
    apimartSeedream: APIMART_SEEDREAM_4_POLICY
  })
}), createModelApiExecutionManifest({
  id: APIMART_SEEDREAM_4_5_EXECUTION_ID,
  provider: "apimart",
  model: "doubao-seedream-4.5",
  endpoint: "/v1/images/generations",
  bodyMapping: APIMART_SEEDREAM_BODY_MAPPING,
  responseMapping: APIMART_IMAGE_RESPONSE_MAPPING,
  taskPolling: APIMART_IMAGE_TASK_POLLING,
  extensions: Object.freeze({
    apimartSeedream: APIMART_SEEDREAM_4_5_POLICY
  })
}), createModelApiExecutionManifest({
  id: APIMART_SEEDREAM_5_LITE_EXECUTION_ID,
  provider: "apimart",
  model: "doubao-seedream-5.0-lite",
  endpoint: "/v1/images/generations",
  bodyMapping: APIMART_SEEDREAM_BODY_MAPPING,
  responseMapping: APIMART_IMAGE_RESPONSE_MAPPING,
  taskPolling: APIMART_IMAGE_TASK_POLLING,
  extensions: Object.freeze({
    apimartSeedream: APIMART_SEEDREAM_5_LITE_POLICY
  })
}), createModelApiExecutionManifest({
  id: APIMART_SEEDREAM_5_PRO_EXECUTION_ID,
  provider: "apimart",
  model: "doubao-seedream-5-0-pro",
  endpoint: "/v1/images/generations",
  bodyMapping: APIMART_SEEDREAM_BODY_MAPPING,
  responseMapping: APIMART_IMAGE_RESPONSE_MAPPING,
  taskPolling: APIMART_IMAGE_TASK_POLLING,
  extensions: Object.freeze({
    apimartSeedream: APIMART_SEEDREAM_5_PRO_POLICY
  })
}), createModelApiExecutionManifest({
  id: APIMART_GROK_IMAGE_2_EXECUTION_ID,
  provider: "apimart",
  model: "grok-imagine-2.0-ext",
  endpoint: "/v1/images/generations",
  bodyMapping: APIMART_GROK_IMAGE_2_BODY_MAPPING,
  responseMapping: APIMART_GROK_IMAGE_2_RESPONSE_MAPPING,
  taskPolling: APIMART_IMAGE_TASK_POLLING,
  extensions: Object.freeze({
    batchSubmitMode: "providerN",
    maxBatchSize: 12
  })
}), createModelApiExecutionManifest({
  id: APIMART_GROK_IMAGINE_1_5_EXECUTION_ID,
  provider: "apimart",
  model: "grok-imagine-1.5-apimart",
  endpoint: "/v1/images/generations",
  bodyMapping: APIMART_GROK_IMAGINE_BODY_MAPPING,
  responseMapping: APIMART_IMAGE_RESPONSE_MAPPING,
  taskPolling: APIMART_IMAGE_TASK_POLLING,
  extensions: Object.freeze({
    bodyResolver: "apimartGrokImagineImage",
    endpointResolver: "apimartGrokImagineImageEndpoint"
  })
}), createModelApiExecutionManifest({
  id: APIMART_MIDJOURNEY_EXECUTION_ID,
  provider: "apimart",
  model: "midjourney",
  endpoint: "/v1/midjourney/generations",
  bodyMapping: APIMART_MIDJOURNEY_BODY_MAPPING,
  responseMapping: APIMART_MIDJOURNEY_RESPONSE_MAPPING,
  taskPolling: APIMART_MIDJOURNEY_TASK_POLLING,
  extensions: Object.freeze({
    bodyResolver: "apimartMidjourneyImage"
  })
})]);