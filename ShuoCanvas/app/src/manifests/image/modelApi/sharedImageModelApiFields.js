export const IMAGE_SIZE_FIELD = Object.freeze({
  id: "imageSize",
  type: "segmented",
  placement: "resolution",
  label: "Quality",
  defaultValue: "2K",
  options: Object.freeze([Object.freeze({
    value: "1K",
    label: "1K"
  }), Object.freeze({
    value: "2K",
    label: "2K"
  }), Object.freeze({
    value: "3K",
    label: "3K"
  }), Object.freeze({
    value: "4K",
    label: "4K"
  })])
});
export const APIMART_SEEDREAM_IMAGE_SIZE_FIELD = Object.freeze({
  ...IMAGE_SIZE_FIELD,
  options: Object.freeze([Object.freeze({
    value: "2K",
    label: "2K"
  }), Object.freeze({
    value: "3K",
    label: "3K"
  })])
});
export const APIMART_SEEDREAM_4_IMAGE_SIZE_FIELD = Object.freeze({
  ...IMAGE_SIZE_FIELD,
  options: Object.freeze([Object.freeze({
    value: "1K",
    label: "1K"
  }), Object.freeze({
    value: "2K",
    label: "2K"
  }), Object.freeze({
    value: "4K",
    label: "4K"
  })])
});
export const APIMART_SEEDREAM_4_5_IMAGE_SIZE_FIELD = Object.freeze({
  ...IMAGE_SIZE_FIELD,
  options: Object.freeze([Object.freeze({
    value: "2K",
    label: "2K"
  }), Object.freeze({
    value: "4K",
    label: "4K"
  })])
});
export const APIMART_SEEDREAM_5_LITE_IMAGE_SIZE_FIELD = APIMART_SEEDREAM_IMAGE_SIZE_FIELD;
export const APIMART_SEEDREAM_5_PRO_IMAGE_SIZE_FIELD = Object.freeze({
  ...IMAGE_SIZE_FIELD,
  defaultValue: "2K",
  options: Object.freeze([Object.freeze({
    value: "1K",
    label: "1K"
  }), Object.freeze({
    value: "2K",
    label: "2K"
  })])
});
export const GPT_IMAGE_2_IMAGE_SIZE_FIELD = Object.freeze({
  ...IMAGE_SIZE_FIELD,
  options: Object.freeze([Object.freeze({
    value: "1K",
    label: "1K"
  }), Object.freeze({
    value: "2K",
    label: "2K"
  }), Object.freeze({
    value: "4K",
    label: "4K"
  })])
});
export const APIMART_NANO_BANANA_2_MODE_FIELD = Object.freeze({
  id: "mode",
  type: "segmented",
  placement: "mode",
  label: "Mode",
  defaultValue: "standard",
  options: Object.freeze([Object.freeze({
    value: "standard",
    label: "标准版",
    selectedLabel: "标准版"
  }), Object.freeze({
    value: "official",
    label: "官方版",
    selectedLabel: "官方版"
  })])
});
export const APIMART_NANO_BANANA_2_IMAGE_SIZE_FIELD = Object.freeze({
  ...IMAGE_SIZE_FIELD,
  options: Object.freeze([Object.freeze({
    value: "1K",
    label: "1K"
  }), Object.freeze({
    value: "2K",
    label: "2K"
  }), Object.freeze({
    value: "4K",
    label: "4K"
  })])
});
export const APIMART_NANO_BANANA_PRO_MODE_FIELD = APIMART_NANO_BANANA_2_MODE_FIELD;
export const APIMART_NANO_BANANA_PRO_IMAGE_SIZE_FIELD = APIMART_NANO_BANANA_2_IMAGE_SIZE_FIELD;
export const APIMART_NANO_BANANA_MODE_FIELD = APIMART_NANO_BANANA_2_MODE_FIELD;
export const APIMART_NANO_BANANA_IMAGE_SIZE_FIELD = Object.freeze({
  ...IMAGE_SIZE_FIELD,
  defaultValue: "1K",
  options: Object.freeze([Object.freeze({
    value: "1K",
    label: "1K"
  })])
});
export const APIMART_GPT_IMAGE_2_MODE_FIELD = APIMART_NANO_BANANA_2_MODE_FIELD;
export const APIMART_GPT_IMAGE_2_IMAGE_SIZE_FIELD = Object.freeze({
  ...GPT_IMAGE_2_IMAGE_SIZE_FIELD,
  defaultValue: "1K"
});
const APIMART_GPT_IMAGE_2_QUALITY_DESCRIPTION = "quality\n图片质量\nlow - 快速省钱，轮廓够用\nmedium - 平衡\nhigh - 最高精度（4K + high 耗时 >120s）";
export const APIMART_GPT_IMAGE_2_QUALITY_FIELD = Object.freeze({
  id: "quality",
  type: "segmented",
  placement: "resolution",
  variant: "pillMenu",
  standaloneInResolution: true,
  label: "质量",
  defaultValue: "medium",
  showWhen: Object.freeze({
    field: "mode",
    value: "official"
  }),
  showMenuTitle: true,
  showInfoTip: true,
  menuTooltip: APIMART_GPT_IMAGE_2_QUALITY_DESCRIPTION,
  description: APIMART_GPT_IMAGE_2_QUALITY_DESCRIPTION,
  options: Object.freeze([Object.freeze({
    value: "low",
    label: "低"
  }), Object.freeze({
    value: "medium",
    label: "中"
  }), Object.freeze({
    value: "high",
    label: "高"
  })])
});
export const APIMART_QWEN_IMAGE_MODE_FIELD = Object.freeze({
  id: "mode",
  type: "segmented",
  placement: "mode",
  label: "Mode",
  defaultValue: "standard",
  options: Object.freeze([Object.freeze({
    value: "standard",
    label: "标准版",
    selectedLabel: "标准版"
  }), Object.freeze({
    value: "pro",
    label: "Pro版",
    selectedLabel: "Pro版"
  })])
});
export const APIMART_QWEN_IMAGE_SIZE_FIELD = Object.freeze({
  ...IMAGE_SIZE_FIELD,
  defaultValue: "1K",
  options: Object.freeze([Object.freeze({
    value: "1K",
    label: "1K"
  }), Object.freeze({
    value: "2K",
    label: "2K"
  })])
});
export const APIMART_QWEN_IMAGE_RATIO_FIELD = Object.freeze({
  id: "aspectRatio",
  type: "segmented",
  placement: "resolution",
  label: "Ratio",
  defaultValue: "自适应",
  options: Object.freeze([Object.freeze({
    value: "自适应",
    label: "Auto",
    selectedLabel: "自适应"
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
  })])
});
export const APIMART_Z_IMAGE_TURBO_IMAGE_SIZE_FIELD = APIMART_QWEN_IMAGE_SIZE_FIELD;
export const APIMART_Z_IMAGE_TURBO_RATIO_FIELD = APIMART_QWEN_IMAGE_RATIO_FIELD;
export const APIMART_Z_IMAGE_TURBO_PROMPT_EXTEND_FIELD = Object.freeze({
  id: "prompt_extend",
  type: "toggle",
  placement: "advanced",
  label: "智能改写提示词",
  description: "开启后，AI 会自动优化提示词，生成效果更好，费用会有所增加。",
  defaultValue: false
});
export const APIMART_WAN_IMAGE_MODE_FIELD = Object.freeze({
  id: "mode",
  type: "segmented",
  placement: "mode",
  label: "Mode",
  defaultValue: "standard",
  options: Object.freeze([Object.freeze({
    value: "standard",
    label: "标准版",
    selectedLabel: "标准版"
  }), Object.freeze({
    value: "pro",
    label: "专业版",
    selectedLabel: "专业版"
  })])
});
const APIMART_WAN_4K_DISABLE = Object.freeze({
  any: Object.freeze([Object.freeze({
    field: "mode",
    values: Object.freeze(["standard"])
  }), Object.freeze({
    field: "hasInputImages",
    values: Object.freeze([true])
  })])
});
export const APIMART_WAN_IMAGE_SIZE_FIELD = Object.freeze({
  ...IMAGE_SIZE_FIELD,
  defaultValue: "2K",
  options: Object.freeze([Object.freeze({
    value: "1K",
    label: "1K"
  }), Object.freeze({
    value: "2K",
    label: "2K"
  }), Object.freeze({
    value: "4K",
    label: "4K",
    disableWhen: APIMART_WAN_4K_DISABLE,
    tooltip: "4K only supports pro text-to-image"
  })])
});
export const APIMART_WAN_IMAGE_RATIO_FIELD = APIMART_QWEN_IMAGE_RATIO_FIELD;
export const APIMART_WAN_THINKING_MODE_FIELD = Object.freeze({
  id: "thinking_mode",
  type: "toggle",
  placement: "advanced",
  label: "思考模式",
  description: "开启后模型增强推理能力，提升画面质量，但耗时增加。",
  defaultValue: true
});
export const APIMART_GPT_IMAGE_2_RATIO_FIELD = Object.freeze({
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
    value: "3:2",
    label: "3:2"
  }), Object.freeze({
    value: "2:3",
    label: "2:3"
  }), Object.freeze({
    value: "4:3",
    label: "4:3"
  }), Object.freeze({
    value: "3:4",
    label: "3:4"
  }), Object.freeze({
    value: "5:4",
    label: "5:4"
  }), Object.freeze({
    value: "4:5",
    label: "4:5"
  }), Object.freeze({
    value: "16:9",
    label: "16:9"
  }), Object.freeze({
    value: "9:16",
    label: "9:16"
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
  }), Object.freeze({
    value: "3:1",
    label: "3:1"
  }), Object.freeze({
    value: "1:3",
    label: "1:3"
  })])
});
export const APIMART_NANO_BANANA_2_GOOGLE_SEARCH_FIELD = Object.freeze({
  id: "google_search",
  type: "toggle",
  placement: "advanced",
  label: "Google 文字搜索",
  description: "启用 Google 文字搜索增强，适合需要真实信息的场景。",
  defaultValue: false
});
export const APIMART_NANO_BANANA_2_GOOGLE_IMAGE_SEARCH_FIELD = Object.freeze({
  id: "google_image_search",
  type: "toggle",
  placement: "advanced",
  label: "Google 图片搜索",
  description: "启用 Google 图片搜索增强，需要同时开启 Google 文字搜索。",
  defaultValue: false
});
export const GRSAI_GPT_IMAGE_2_MODE_FIELD = Object.freeze({
  id: "mode",
  type: "segmented",
  placement: "mode",
  label: "Mode",
  defaultValue: "normal",
  options: Object.freeze([Object.freeze({
    value: "normal",
    label: "常规",
    selectedLabel: "常规"
  }), Object.freeze({
    value: "vip",
    label: "VIP",
    selectedLabel: "VIP"
  })])
});
export const GRSAI_GPT_IMAGE_2_IMAGE_SIZE_FIELD = Object.freeze({
  ...GPT_IMAGE_2_IMAGE_SIZE_FIELD,
  defaultValue: "1K",
  options: Object.freeze([Object.freeze({
    value: "1K",
    label: "1K"
  }), Object.freeze({
    value: "2K",
    label: "2K",
    disableWhen: Object.freeze({
      field: "mode",
      values: ["normal"]
    }),
    tooltip: "VIP"
  }), Object.freeze({
    value: "4K",
    label: "4K",
    disableWhen: Object.freeze({
      field: "mode",
      values: ["normal"]
    }),
    tooltip: "VIP"
  })])
});
export const GRSAI_NANO_BANANA_IMAGE_SIZE_FIELD = Object.freeze({
  ...IMAGE_SIZE_FIELD,
  options: Object.freeze([Object.freeze({
    value: "1K",
    label: "1K"
  }), Object.freeze({
    value: "2K",
    label: "2K"
  }), Object.freeze({
    value: "4K",
    label: "4K",
    disabled: true,
    tooltip: "1K/2K only"
  })])
});
export const GRSAI_NANO_BANANA_1K_IMAGE_SIZE_FIELD = Object.freeze({
  ...IMAGE_SIZE_FIELD,
  defaultValue: "1K",
  options: Object.freeze([Object.freeze({
    value: "1K",
    label: "1K"
  }), Object.freeze({
    value: "2K",
    label: "2K",
    disabled: true,
    tooltip: "1K only"
  }), Object.freeze({
    value: "4K",
    label: "4K",
    disabled: true,
    tooltip: "1K only"
  })])
});
export const GRSAI_NANO_BANANA_2K_IMAGE_SIZE_FIELD = Object.freeze({
  ...IMAGE_SIZE_FIELD,
  defaultValue: "2K",
  options: Object.freeze([Object.freeze({
    value: "1K",
    label: "1K",
    disabled: true,
    tooltip: "2K only"
  }), Object.freeze({
    value: "2K",
    label: "2K"
  }), Object.freeze({
    value: "4K",
    label: "4K",
    disabled: true,
    tooltip: "2K only"
  })])
});
export const GRSAI_NANO_BANANA_2_IMAGE_SIZE_FIELD = Object.freeze({
  ...IMAGE_SIZE_FIELD,
  options: Object.freeze([Object.freeze({
    value: "1K",
    label: "1K"
  }), Object.freeze({
    value: "2K",
    label: "2K"
  }), Object.freeze({
    value: "4K",
    label: "4K"
  })])
});
export const GRSAI_NANO_BANANA_PRO_IMAGE_SIZE_FIELD = Object.freeze({
  ...IMAGE_SIZE_FIELD,
  options: Object.freeze([Object.freeze({
    value: "1K",
    label: "1K"
  }), Object.freeze({
    value: "2K",
    label: "2K",
    disableWhen: Object.freeze({
      field: "mode",
      values: ["cl"]
    }),
    tooltip: "CL supports 1K only"
  }), Object.freeze({
    value: "4K",
    label: "4K",
    disableWhen: Object.freeze({
      field: "mode",
      values: ["cl"]
    }),
    tooltip: "CL supports 1K only"
  })])
});
export const GRSAI_NANO_BANANA_4K_IMAGE_SIZE_FIELD = Object.freeze({
  ...IMAGE_SIZE_FIELD,
  defaultValue: "4K",
  options: Object.freeze([Object.freeze({
    value: "1K",
    label: "1K",
    disabled: true,
    tooltip: "4K only"
  }), Object.freeze({
    value: "2K",
    label: "2K",
    disabled: true,
    tooltip: "4K only"
  }), Object.freeze({
    value: "4K",
    label: "4K"
  })])
});
export const RUNNINGHUB_GPT_IMAGE_2_OFFICIAL_IMAGE_SIZE_FIELD = Object.freeze({
  ...IMAGE_SIZE_FIELD,
  options: Object.freeze([Object.freeze({
    value: "1K",
    label: "1K"
  }), Object.freeze({
    value: "2K",
    label: "2K"
  }), Object.freeze({
    value: "4K",
    label: "4K"
  })])
});
export const ASPECT_RATIO_FIELD = Object.freeze({
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
    value: "9:16",
    label: "9:16"
  }), Object.freeze({
    value: "16:9",
    label: "16:9"
  }), Object.freeze({
    value: "3:4",
    label: "3:4"
  }), Object.freeze({
    value: "4:3",
    label: "4:3"
  }), Object.freeze({
    value: "3:2",
    label: "3:2"
  }), Object.freeze({
    value: "2:3",
    label: "2:3"
  }), Object.freeze({
    value: "5:4",
    label: "5:4"
  }), Object.freeze({
    value: "4:5",
    label: "4:5"
  }), Object.freeze({
    value: "21:9",
    label: "21:9"
  })])
});
export const APIMART_SEEDREAM_RATIO_FIELD = Object.freeze({
  ...ASPECT_RATIO_FIELD,
  defaultValue: "auto",
  options: Object.freeze([Object.freeze({
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
    value: "21:9",
    label: "21:9"
  }), Object.freeze({
    value: "9:21",
    label: "9:21"
  }), Object.freeze({
    value: "auto",
    label: "Auto",
    selectedLabel: "自适应"
  })])
});
export const APIMART_SEEDREAM_5_LITE_RATIO_FIELD = Object.freeze({
  ...APIMART_SEEDREAM_RATIO_FIELD,
  options: Object.freeze(APIMART_SEEDREAM_RATIO_FIELD.options.filter(_0x29334f => String(_0x29334f?.value ?? _0x29334f) !== "9:21"))
});
export const NANO_BANANA_2_RATIO_FIELD = Object.freeze({
  ...ASPECT_RATIO_FIELD,
  options: Object.freeze([...ASPECT_RATIO_FIELD.options, Object.freeze({
    value: "1:4",
    label: "1:4"
  }), Object.freeze({
    value: "4:1",
    label: "4:1"
  }), Object.freeze({
    value: "1:8",
    label: "1:8"
  }), Object.freeze({
    value: "8:1",
    label: "8:1"
  })])
});
export const GRSAI_NANO_BANANA_RATIO_FIELD = Object.freeze({
  ...ASPECT_RATIO_FIELD,
  defaultValue: "auto",
  options: Object.freeze([Object.freeze({
    value: "auto",
    label: "Auto",
    selectedLabel: "自适应"
  }), Object.freeze({
    value: "1:1",
    label: "1:1"
  }), Object.freeze({
    value: "16:9",
    label: "16:9"
  }), Object.freeze({
    value: "9:16",
    label: "9:16"
  }), Object.freeze({
    value: "4:3",
    label: "4:3"
  }), Object.freeze({
    value: "3:4",
    label: "3:4"
  }), Object.freeze({
    value: "3:2",
    label: "3:2"
  }), Object.freeze({
    value: "2:3",
    label: "2:3"
  }), Object.freeze({
    value: "5:4",
    label: "5:4"
  }), Object.freeze({
    value: "4:5",
    label: "4:5"
  }), Object.freeze({
    value: "21:9",
    label: "21:9"
  })])
});
export const GRSAI_NANO_BANANA_2_RATIO_FIELD = Object.freeze({
  ...GRSAI_NANO_BANANA_RATIO_FIELD,
  options: Object.freeze([...GRSAI_NANO_BANANA_RATIO_FIELD.options, Object.freeze({
    value: "1:4",
    label: "1:4"
  }), Object.freeze({
    value: "4:1",
    label: "4:1"
  }), Object.freeze({
    value: "1:8",
    label: "1:8"
  }), Object.freeze({
    value: "8:1",
    label: "8:1"
  })])
});
export const GPT_IMAGE_2_RATIO_FIELD = Object.freeze({
  ...ASPECT_RATIO_FIELD,
  options: Object.freeze([Object.freeze({
    value: "自适应",
    label: "Auto"
  }), Object.freeze({
    value: "1:1",
    label: "1:1"
  }), Object.freeze({
    value: "3:2",
    label: "3:2"
  }), Object.freeze({
    value: "2:3",
    label: "2:3"
  }), Object.freeze({
    value: "4:3",
    label: "4:3"
  }), Object.freeze({
    value: "3:4",
    label: "3:4"
  }), Object.freeze({
    value: "5:4",
    label: "5:4"
  }), Object.freeze({
    value: "4:5",
    label: "4:5"
  }), Object.freeze({
    value: "16:9",
    label: "16:9"
  }), Object.freeze({
    value: "9:16",
    label: "9:16"
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
export const GRSAI_GPT_IMAGE_2_RATIO_FIELD = Object.freeze({
  ...ASPECT_RATIO_FIELD,
  defaultValue: "auto",
  options: Object.freeze([Object.freeze({
    value: "auto",
    label: "Auto",
    selectedLabel: "自适应"
  }), Object.freeze({
    value: "1:1",
    label: "1:1"
  }), Object.freeze({
    value: "16:9",
    label: "16:9"
  }), Object.freeze({
    value: "9:16",
    label: "9:16"
  }), Object.freeze({
    value: "4:3",
    label: "4:3"
  }), Object.freeze({
    value: "3:4",
    label: "3:4"
  }), Object.freeze({
    value: "3:2",
    label: "3:2"
  }), Object.freeze({
    value: "2:3",
    label: "2:3"
  }), Object.freeze({
    value: "5:4",
    label: "5:4"
  }), Object.freeze({
    value: "4:5",
    label: "4:5"
  }), Object.freeze({
    value: "21:9",
    label: "21:9"
  }), Object.freeze({
    value: "9:21",
    label: "9:21"
  }), Object.freeze({
    value: "1:3",
    label: "1:3"
  }), Object.freeze({
    value: "3:1",
    label: "3:1"
  }), Object.freeze({
    value: "2:1",
    label: "2:1"
  }), Object.freeze({
    value: "1:2",
    label: "1:2"
  })])
});
export const MODE_NORMAL_FIELD = Object.freeze({
  id: "mode",
  type: "segmented",
  placement: "mode",
  label: "Mode",
  defaultValue: "normal",
  options: Object.freeze([Object.freeze({
    value: "normal",
    label: "常规"
  })])
});
export const MODE_NORMAL_FAST_FIELD = Object.freeze({
  ...MODE_NORMAL_FIELD,
  options: Object.freeze([Object.freeze({
    value: "normal",
    label: "正常"
  }), Object.freeze({
    value: "fast",
    label: "快速"
  })])
});
export const MODE_NORMAL_CL_FIELD = Object.freeze({
  ...MODE_NORMAL_FIELD,
  options: Object.freeze([Object.freeze({
    value: "normal",
    label: "常规"
  }), Object.freeze({
    value: "cl",
    label: "CL"
  })])
});
export const MODE_CL_FIELD = Object.freeze({
  ...MODE_NORMAL_FIELD,
  defaultValue: "cl",
  options: Object.freeze([Object.freeze({
    value: "cl",
    label: "CL"
  })])
});
export const MODE_VIP_FIELD = Object.freeze({
  ...MODE_NORMAL_FIELD,
  defaultValue: "vip",
  options: Object.freeze([Object.freeze({
    value: "vip",
    label: "VIP"
  })])
});
export const MODE_NORMAL_VT_CL_VIP_FIELD = Object.freeze({
  ...MODE_NORMAL_FIELD,
  options: Object.freeze([Object.freeze({
    value: "normal",
    label: "常规"
  }), Object.freeze({
    value: "vt",
    label: "VT"
  }), Object.freeze({
    value: "cl",
    label: "CL"
  }), Object.freeze({
    value: "vip",
    label: "VIP"
  })])
});
export const RUNNINGHUB_MODEL_ROUTE_FIELD = Object.freeze({
  id: "rhModelRoute",
  type: "segmented",
  placement: "mode",
  label: "Route",
  defaultValue: "low",
  options: Object.freeze([Object.freeze({
    value: "low",
    label: "低价版",
    selectedLabel: "低价版"
  }), Object.freeze({
    value: "official",
    label: "官方版",
    selectedLabel: "官方版"
  })])
});
export const BATCH_SIZE_FIELD = Object.freeze({
  id: "batchSize",
  type: "segmented",
  placement: "batch",
  label: "Batch",
  defaultValue: 1,
  options: Object.freeze([Object.freeze({
    value: 1,
    label: "1x",
    selectedLabel: "1x"
  }), Object.freeze({
    value: 2,
    label: "2x",
    selectedLabel: "2x"
  }), Object.freeze({
    value: 4,
    label: "4x",
    selectedLabel: "4x"
  })])
});
export const APIMART_QWEN_IMAGE_BATCH_SIZE_FIELD = Object.freeze({
  ...BATCH_SIZE_FIELD,
  options: Object.freeze([Object.freeze({
    value: 1,
    label: "1x",
    selectedLabel: "1x"
  }), Object.freeze({
    value: 2,
    label: "2x",
    selectedLabel: "2x"
  }), Object.freeze({
    value: 4,
    label: "4x",
    selectedLabel: "4x"
  }), Object.freeze({
    value: 6,
    label: "6x",
    selectedLabel: "6x"
  })])
});
export function withDefaultValue(_0x49ba88, _0x2d8328) {
  return Object.freeze({
    ..._0x49ba88,
    defaultValue: _0x2d8328
  });
}
function freezeFields(_0x10bfb2) {
  return Object.freeze(_0x10bfb2.map(_0x3db143 => Object.freeze(_0x3db143)));
}
const DEFAULT_IMAGE_MODEL_API_INPUT_SLOTS = Object.freeze({
  allowedKinds: Object.freeze(["text", "image"]),
  minByKind: Object.freeze({
    image: 0
  }),
  maxByKind: Object.freeze({
    image: 8,
    video: 0,
    audio: 0
  })
});
export const IMAGE_MODEL_API_10_IMAGE_INPUT_SLOTS = Object.freeze({
  allowedKinds: Object.freeze(["text", "image"]),
  minByKind: Object.freeze({
    image: 0
  }),
  maxByKind: Object.freeze({
    image: 10,
    video: 0,
    audio: 0
  })
});
export const IMAGE_MODEL_API_14_IMAGE_INPUT_SLOTS = Object.freeze({
  allowedKinds: Object.freeze(["text", "image"]),
  minByKind: Object.freeze({
    image: 0
  }),
  maxByKind: Object.freeze({
    image: 14,
    video: 0,
    audio: 0
  })
});
export const IMAGE_MODEL_API_16_IMAGE_INPUT_SLOTS = Object.freeze({
  allowedKinds: Object.freeze(["text", "image"]),
  minByKind: Object.freeze({
    image: 0
  }),
  maxByKind: Object.freeze({
    image: 16,
    video: 0,
    audio: 0
  })
});
const DEFAULT_RATIO_POLICY_BY_PROVIDER = Object.freeze({
  agnes: Object.freeze({
    capability: "size"
  }),
  apimart: Object.freeze({
    capability: "size"
  }),
  grsai: Object.freeze({
    capability: "aspectRatio"
  }),
  ppio: Object.freeze({
    capability: "size"
  }),
  runninghub: Object.freeze({
    capability: "aspectRatio"
  }),
  volcengine: Object.freeze({
    capability: "dimensions"
  })
});
function normalizeProviderId(_0x57151a) {
  return String(_0x57151a || "").trim().toLowerCase();
}
function freezeRatioPolicyValue(_0x4a3112) {
  if (Array.isArray(_0x4a3112)) {
    return Object.freeze([..._0x4a3112]);
  }
  if (_0x4a3112 && typeof _0x4a3112 === "object") {
    return Object.freeze(Object.fromEntries(Object.entries(_0x4a3112).map(([_0x428c12, _0x55a6f9]) => [_0x428c12, freezeRatioPolicyValue(_0x55a6f9)])));
  }
  return _0x4a3112;
}
function freezeRatioPolicy(_0x34efc6) {
  if (!_0x34efc6 || typeof _0x34efc6 !== "object") {
    return null;
  }
  return Object.freeze(Object.fromEntries(Object.entries(_0x34efc6).map(([_0x253247, _0x286bb6]) => [_0x253247, freezeRatioPolicyValue(_0x286bb6)])));
}
function mergeRatioPolicyExtension(_0x7eca1f, _0x4dcb89, _0x1b58a4) {
  const _0x519387 = _0x7eca1f && typeof _0x7eca1f === "object" ? {
    ..._0x7eca1f
  } : {};
  const _0x17f24b = _0x1b58a4 || _0x519387.ratioPolicy || DEFAULT_RATIO_POLICY_BY_PROVIDER[normalizeProviderId(_0x4dcb89)] || null;
  if (_0x17f24b) {
    _0x519387.ratioPolicy = freezeRatioPolicy(_0x17f24b);
  }
  if (Object.keys(_0x519387).length > 0) {
    return Object.freeze(_0x519387);
  } else {
    return null;
  }
}
function freezeInputSlots(_0x30e64e = DEFAULT_IMAGE_MODEL_API_INPUT_SLOTS) {
  const _0x43369b = _0x30e64e || DEFAULT_IMAGE_MODEL_API_INPUT_SLOTS;
  const _0x4889b6 = Array.isArray(_0x43369b.fixedSlots) ? {
    fixedSlots: Object.freeze(_0x43369b.fixedSlots.map(_0x58a086 => Object.freeze({
      ...(_0x58a086 || {})
    })))
  } : {};
  return Object.freeze({
    allowedKinds: Object.freeze([...(_0x43369b.allowedKinds || [])]),
    minByKind: Object.freeze({
      ...(_0x43369b.minByKind || {})
    }),
    maxByKind: Object.freeze({
      ...(_0x43369b.maxByKind || {})
    }),
    ..._0x4889b6
  });
}
export function createImageModelApiManifest({
  modelId: _0x1c3b62,
  executionId: _0x22b1ab,
  provider: _0x447691,
  displayName: _0x164aa2,
  icon: _0x46b135,
  description: _0x3bc90d,
  fields: _0x38b663,
  extensions: _0xa88b34,
  ratioPolicy: _0x2e31d2,
  inputSlots: _0xaf0a25,
  nanoBanana: _0x854279,
  prompt: _0xcc4ad9,
  vip = false
}) {
  const _0x42c64b = _0x854279 ? Object.freeze({
    ...(_0xa88b34 || {}),
    nanoBanana: Object.freeze({
      ..._0x854279
    })
  }) : _0xa88b34;
  const _0x28e815 = mergeRatioPolicyExtension(_0x42c64b, _0x447691, _0x2e31d2);
  return Object.freeze({
    schemaVersion: "1.0",
    modelId: _0x1c3b62,
    provider: _0x447691,
    kind: "image",
    adapterType: "modelApi",
    executionId: _0x22b1ab,
    displayName: _0x164aa2,
    icon: _0x46b135,
    description: _0x3bc90d,
    ...(_0xcc4ad9 ? {
      prompt: Object.freeze({
        ..._0xcc4ad9
      })
    } : {}),
    ...(_0x28e815 ? {
      extensions: _0x28e815
    } : {}),
    inputSlots: freezeInputSlots(_0xaf0a25),
    uiSchema: Object.freeze({
      fields: freezeFields(_0x38b663)
    }),
    ...(vip === true ? {
      vip: true
    } : {}),
    async: true,
    cancellable: false,
    outputType: "image"
  });
}
export function createModelApiExecutionManifest({
  id: _0x137de8,
  provider: _0x2db7dd,
  model: _0x1dd3a6,
  endpoint: _0x5cca5c,
  endpointMode: _0xd01f3,
  bodyMapping: _0x443a4e,
  responseMapping: _0x378613,
  extensions: _0x2c859b,
  taskPolling: _0x2c9fc9,
  modeModels: _0x54e843,
  imageSizeModels: _0x47043c,
  routeModels: _0x2715cf
}) {
  const _0x35c08d = Object.freeze(["data.result.images[].url", "result.images[].url", "results[].url", "results[].imageUrl", "url"]);
  const _0x5de283 = _0x2c9fc9 && typeof _0x2c9fc9 === "object" ? Object.freeze({
    ..._0x2c9fc9
  }) : null;
  const _0x17a605 = _0x2c859b || _0x5de283 ? Object.freeze({
    ...(_0x2c859b || {}),
    ...(_0x5de283 ? {
      taskPolling: _0x5de283
    } : {})
  }) : null;
  return Object.freeze({
    schemaVersion: "1.0",
    id: _0x137de8,
    provider: _0x2db7dd,
    kind: "image",
    adapterType: "modelApi",
    endpoint: _0x5cca5c,
    ...(_0xd01f3 ? {
      endpointMode: _0xd01f3
    } : {}),
    method: "POST",
    model: _0x1dd3a6,
    ...(_0x54e843 ? {
      modeModels: Object.freeze(_0x54e843)
    } : {}),
    ...(_0x47043c ? {
      imageSizeModels: Object.freeze(_0x47043c)
    } : {}),
    ...(_0x2715cf ? {
      routeModels: Object.freeze(_0x2715cf)
    } : {}),
    ...(_0x17a605 ? {
      extensions: _0x17a605
    } : {}),
    headers: Object.freeze({
      "Content-Type": "application/json"
    }),
    bodyMapping: Object.freeze(_0x443a4e || []),
    responseMapping: Object.freeze({
      taskIdPath: "taskId",
      statusPath: "status",
      errorPath: "error",
      ...(_0x378613 || {}),
      resultPaths: Object.freeze(_0x378613?.resultPaths || _0x35c08d)
    }),
    result: Object.freeze({
      taskIdPath: "taskId",
      urlFields: Object.freeze(["url", "imageUrl"])
    })
  });
}