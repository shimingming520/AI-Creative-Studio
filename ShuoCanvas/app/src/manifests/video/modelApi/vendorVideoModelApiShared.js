export const VIDEO_DURATION_FIELD = Object.freeze({
  id: "duration",
  type: "slider",
  placement: "mode",
  variant: "durationPill",
  label: "视频时长",
  defaultValue: 5,
  min: 4,
  max: 15,
  step: 1
});
export const VIDEO_RESOLUTION_FIELD = Object.freeze({
  id: "resolution",
  type: "segmented",
  placement: "resolution",
  label: "视频分辨率",
  defaultValue: "720P",
  options: Object.freeze([Object.freeze({
    value: "720P",
    label: "720P"
  }), Object.freeze({
    value: "1080P",
    label: "1080P"
  })])
});
export const APIMART_VIDEO_ADAPTIVE_RATIO_VALUE = "自适应";
export const APIMART_VIDEO_ADAPTIVE_RATIO_OPTION = Object.freeze({
  value: APIMART_VIDEO_ADAPTIVE_RATIO_VALUE,
  label: APIMART_VIDEO_ADAPTIVE_RATIO_VALUE
});
export const VIDEO_RATIO_FIELD = Object.freeze({
  id: "aspectRatio",
  displayRole: "aspectRatio",
  type: "segmented",
  placement: "resolution",
  variant: "ratioPill",
  label: "比例",
  defaultValue: APIMART_VIDEO_ADAPTIVE_RATIO_VALUE,
  options: Object.freeze([APIMART_VIDEO_ADAPTIVE_RATIO_OPTION, Object.freeze({
    value: "16:9",
    label: "16:9"
  }), Object.freeze({
    value: "9:16",
    label: "9:16"
  }), Object.freeze({
    value: "1:1",
    label: "1:1"
  }), Object.freeze({
    value: "4:3",
    label: "4:3"
  }), Object.freeze({
    value: "3:4",
    label: "3:4"
  })])
});
export const APIMART_VIDEO_FOOTER_PLACEMENT_ORDER = Object.freeze(["mode", "resolution"]);
export const VIDEO_MODE_FIELD = Object.freeze({
  id: "mode",
  type: "segmented",
  placement: "mode",
  variant: "pillMenu",
  label: "模式选择",
  defaultValue: "std",
  options: Object.freeze([Object.freeze({
    value: "std",
    label: "标准"
  }), Object.freeze({
    value: "pro",
    label: "专业"
  })])
});
export const VIDEO_AUDIO_FIELD = Object.freeze({
  id: "audio",
  type: "toggle",
  placement: "advanced",
  variant: "advancedRow",
  label: "生成音频",
  defaultValue: false
});
export const VIDEO_WATERMARK_FIELD = Object.freeze({
  id: "watermark",
  type: "toggle",
  placement: "advanced",
  variant: "advancedRow",
  label: "添加水印",
  defaultValue: false
});
export const VIDEO_WATERMARK_CN_FIELD = Object.freeze({
  ...VIDEO_WATERMARK_FIELD,
  label: "添加水印"
});
export const VIDEO_SEED_FIELD = Object.freeze({
  id: "seed",
  type: "text",
  placement: "advanced",
  variant: "randomSeedRow",
  label: "随机种子",
  defaultValue: "image",
  randomSeedMin: 0,
  randomSeedMax: 2147483647
});
export const VIDEO_NEGATIVE_PROMPT_FIELD = Object.freeze({
  id: "negative_prompt",
  type: "textarea",
  placement: "advanced",
  variant: "advancedRow",
  label: "负向提示词",
  defaultValue: "none"
});
export const VIDEO_PROMPT_EXTEND_FIELD = Object.freeze({
  id: "prompt_extend",
  type: "toggle",
  placement: "advanced",
  variant: "advancedRow",
  label: "提示词扩写",
  defaultValue: true
});
export const VIDEO_PROMPT_OPTIMIZER_FIELD = Object.freeze({
  id: "prompt_optimizer",
  type: "toggle",
  placement: "advanced",
  variant: "advancedRow",
  label: "自动优化提示词",
  defaultValue: true
});
export const VIDEO_FAST_PRETREATMENT_FIELD = Object.freeze({
  id: "fast_pretreatment",
  type: "toggle",
  placement: "advanced",
  variant: "advancedRow",
  label: "快速预处理",
  defaultValue: false
});
export const VIDEO_ENABLE_GIF_FIELD = Object.freeze({
  id: "enable_gif",
  type: "toggle",
  placement: "advanced",
  variant: "advancedRow",
  label: "启用 GIF 输出格式",
  defaultValue: false
});
export const VIDEO_AUDIO_SETTING_FIELD = Object.freeze({
  id: "audio_setting",
  type: "segmented",
  placement: "advanced",
  variant: "advancedRow",
  label: "音频设置",
  defaultValue: "auto",
  options: Object.freeze([Object.freeze({
    value: "auto",
    label: "自动生成"
  }), Object.freeze({
    value: "origin",
    label: "保留原音"
  })])
});
export const VIDEO_SHOT_TYPE_FIELD = Object.freeze({
  id: "shot_type",
  type: "segmented",
  placement: "advanced",
  variant: "advancedRow",
  label: "镜头类型",
  defaultValue: "single",
  options: Object.freeze([Object.freeze({
    value: "single",
    label: "单镜头"
  }), Object.freeze({
    value: "multi",
    label: "多镜头"
  })])
});
export const KLING_V3_AUDIO_FIELD = Object.freeze({
  ...VIDEO_AUDIO_FIELD,
  label: "生成有声视频"
});
export const KLING_V3_NEGATIVE_PROMPT_FIELD = Object.freeze({
  ...VIDEO_NEGATIVE_PROMPT_FIELD,
  defaultValue: "模糊, 低画质, 变形",
  defaultValueAliases: Object.freeze(["none"])
});
export const KLING_V3_MODE_FIELD = Object.freeze({
  id: "resolution",
  type: "segmented",
  placement: "resolution",
  variant: "sectionMenu",
  label: "视频分辨率",
  defaultValue: "std",
  options: Object.freeze([Object.freeze({
    value: "std",
    label: "720P"
  }), Object.freeze({
    value: "pro",
    label: "1080P"
  }), Object.freeze({
    value: "4k",
    label: "4K"
  })])
});
export const KLING_O1_QUALITY_FIELD = Object.freeze({
  ...KLING_V3_MODE_FIELD,
  options: Object.freeze([Object.freeze({
    value: "std",
    label: "720P"
  }), Object.freeze({
    value: "pro",
    label: "1080P"
  })])
});
export const KLING_O1_KEEP_ORIGINAL_SOUND_FIELD = Object.freeze({
  id: "keep_original_sound",
  type: "toggle",
  placement: "advanced",
  variant: "advancedRow",
  label: "保留原声",
  description: "仅接入编辑视频或特征参考视频时生效。",
  defaultValue: false
});
export const KLING_V3_MULTI_SHOT_PLACEHOLDER_FIELD = Object.freeze({
  id: "multi_shot",
  type: "toggle",
  placement: "advanced",
  variant: "advancedRow",
  label: "多镜头分镜模式",
  description: "暂未开放，后续接入分镜参数后启用。",
  defaultValue: false,
  disabled: true
});
export const VEO3_MODEL_FIELD = Object.freeze({
  id: "mode",
  type: "segmented",
  placement: "mode",
  variant: "sectionMenu",
  label: "模型选择",
  description: "veo3.1-fast - 快速生成模型，适用于快速预览和迭代\nveo3.1-quality - 高质量生成模型，适用于最终制作",
  defaultValue: "fast",
  options: Object.freeze([Object.freeze({
    value: "fast",
    label: "fast"
  }), Object.freeze({
    value: "quality",
    label: "quality"
  })])
});
export const VEO3_GENERATION_TYPE_FIELD = Object.freeze({
  id: "generation_type",
  type: "segmented",
  placement: "mode",
  variant: "sectionMenu",
  label: "模式选择",
  description: "首尾帧：使用首帧/尾帧素材生成视频。\n参考图：使用参考图素材生成视频。\nveo3.1-quality 模型不支持参考图模式。",
  defaultValue: "frame",
  options: Object.freeze([Object.freeze({
    value: "frame",
    label: "首尾帧"
  }), Object.freeze({
    value: "reference",
    label: "参考图",
    disableWhen: {
      field: "mode",
      value: "quality"
    }
  })])
});
export const VEO3_FRAME_HELP_TOOLTIP = ["VEO3 首尾帧模式", "[[red:不放图]]：就是文生视频，只按提示词生成。", "[[red:放 1 张图]]：就是普通图生视频，把这张图当作视频起点。", "[[red:放 2 张图]]：第一张是开头，第二张是结尾，VEO3 补中间变化。", "提示词例子：女孩从照片里的姿势慢慢转身看向镜头，阳光穿过窗帘，头发轻轻飘动，电影感，慢动作。"].join("\n");
export const VEO3_REFERENCE_HELP_TOOLTIP = ["VEO3 参考图模式", "[[red:不放参考图]]：就是文生视频，只按提示词生成。", "[[red:放 1-3 张参考图]]：参考人物、主体、风格或场景，不会固定成开头和结尾。", "重点写清 [[red:想生成什么动作和镜头]]；quality 档不支持参考图。", "提示词例子：参考图中的机器人在未来街道上奔跑，镜头低角度跟拍，背景灯牌快速掠过，速度感强。"].join("\n");
export const VEO3_FRAME_PROMPT_PLACEHOLDER = "描述首帧到尾帧的变化。例如：首帧中的女孩慢慢转身看向镜头，尾帧定格在微笑特写，阳光穿过窗帘，电影感，慢动作。";
export const VEO3_REFERENCE_PROMPT_PLACEHOLDER = "描述参考图主体的动作和镜头。例如：参考图中的机器人在未来街道上奔跑，低角度跟拍，背景灯牌快速掠过，速度感强。";
export const VEO3_FIXED_DURATION_FIELD = Object.freeze({
  id: "duration",
  type: "segmented",
  placement: "mode",
  variant: "pillMenu",
  label: "视频时长",
  defaultValue: 8,
  readOnly: true,
  options: Object.freeze([Object.freeze({
    value: 8,
    label: "8s"
  })])
});
export const VEO3_ENABLE_GIF_FIELD = Object.freeze({
  ...VIDEO_ENABLE_GIF_FIELD,
  label: "启用 GIF 输出格式"
});
export const RUNNINGHUB_VEO3_CHANNEL_FIELD = Object.freeze({
  id: "rh_veo3_channel",
  type: "segmented",
  placement: "mode",
  variant: "sectionMenu",
  label: "渠道版本",
  description: "官方稳定版更稳；低价渠道版成本更低但可能不稳定。",
  defaultValue: "lowCost",
  options: Object.freeze([Object.freeze({
    value: "lowCost",
    label: "低价版"
  }), Object.freeze({
    value: "official",
    label: "官方版"
  })])
});
export const RUNNINGHUB_VEO3_MODEL_FIELD = Object.freeze({
  id: "mode",
  type: "segmented",
  placement: "mode",
  variant: "sectionMenu",
  label: "模型选择",
  defaultValue: "fast",
  options: Object.freeze([Object.freeze({
    value: "fast",
    label: "Fast 版"
  }), Object.freeze({
    value: "pro",
    label: "Pro 版"
  }), Object.freeze({
    value: "lite",
    label: "Lite 版",
    disableWhen: Object.freeze({
      field: "rh_veo3_channel",
      value: "lowCost"
    })
  })])
});
export const RUNNINGHUB_VEO3_GENERATION_TYPE_FIELD = Object.freeze({
  id: "generation_type",
  type: "segmented",
  placement: "mode",
  variant: "sectionMenu",
  label: "模式选择",
  description: "首尾帧：支持文生、图生、首尾帧。\n参考图：官方 Fast / Pro 支持 1-3 张参考图。\n视频续写：官方 Fast / Pro 支持 1 个原视频。",
  defaultValue: "frame",
  options: Object.freeze([Object.freeze({
    value: "frame",
    label: "首尾帧"
  }), Object.freeze({
    value: "reference",
    label: "参考图",
    disableWhen: Object.freeze({
      any: Object.freeze([Object.freeze({
        field: "rh_veo3_channel",
        value: "lowCost"
      }), Object.freeze({
        field: "mode",
        value: "lite"
      })])
    })
  }), Object.freeze({
    value: "extend",
    label: "视频续写",
    disableWhen: Object.freeze({
      any: Object.freeze([Object.freeze({
        field: "rh_veo3_channel",
        value: "lowCost"
      }), Object.freeze({
        field: "mode",
        value: "lite"
      })])
    })
  })])
});
export const RUNNINGHUB_VEO3_DURATION_FIELD = Object.freeze({
  ...createFooterDurationSliderOptionsField({
    values: [4, 6, 8],
    defaultValue: 8,
    label: "视频时长（秒）"
  }),
  hideWhen: Object.freeze({
    field: "generation_type",
    value: "extend"
  })
});
export const RUNNINGHUB_VEO3_GENERATE_AUDIO_FIELD = Object.freeze({
  id: "generateAudio",
  type: "toggle",
  placement: "advanced",
  variant: "advancedRow",
  label: "生成音频",
  defaultValue: false,
  hideWhen: Object.freeze({
    any: Object.freeze([Object.freeze({
      field: "rh_veo3_channel",
      value: "lowCost"
    }), Object.freeze({
      field: "generation_type",
      value: "extend"
    })])
  })
});
export const RUNNINGHUB_VEO3_FIXED_INPUT_SLOTS = Object.freeze([Object.freeze({
  id: "firstFrame",
  kind: "image",
  label: "首帧图",
  description: "图生视频起始帧；低价版或官方 Lite 可接尾帧。",
  hideWhen: Object.freeze({
    field: "generation_type",
    values: Object.freeze(["reference", "extend"])
  })
}), Object.freeze({
  id: "lastFrame",
  kind: "image",
  label: "尾帧图",
  description: "首尾帧生视频结束帧。",
  hideWhen: Object.freeze({
    field: "generation_type",
    values: Object.freeze(["reference", "extend"])
  })
}), Object.freeze({
  id: "referenceImage",
  kind: "image",
  label: "参考图",
  description: "官方 Fast / Pro 参考生视频，支持 1-3 张参考图。",
  showWhen: Object.freeze({
    field: "generation_type",
    value: "reference"
  })
}), Object.freeze({
  id: "extendVideo",
  kind: "video",
  label: "续写视频",
  description: "官方 Fast / Pro 视频续写使用的原视频。",
  showWhen: Object.freeze({
    field: "generation_type",
    value: "extend"
  })
})]);
export const RUNNINGHUB_VEO3_FRAME_PROMPT_PLACEHOLDER = "描述画面内容、动作和镜头；接首尾帧时写清从首帧到尾帧的变化。";
export const RUNNINGHUB_VEO3_REFERENCE_PROMPT_PLACEHOLDER = "描述参考图主体的动作、场景和镜头；可用 1-3 张参考图保持人物、主体或风格。";
export const RUNNINGHUB_VEO3_EXTEND_PROMPT_PLACEHOLDER = "视频续写按官方接口提交原视频和分辨率，不提交提示词。";
export const RUNNINGHUB_VEO3_FRAME_HELP_TOOLTIP = ["RunningHub Veo3", "[[red:不放图]]：文生视频。", "[[red:放 1 张图]]：图生视频，把图片作为视频起点。", "[[red:放 2 张图]]：低价 Fast / Pro 或官方 Lite 走首尾帧接口。", "官方 Fast / Pro 暂按文生、图生、参考图接入；官方首尾帧请选 Lite。"].join("\n");
export const RUNNINGHUB_VEO3_REFERENCE_HELP_TOOLTIP = ["RunningHub Veo3 参考图模式", "[[red:官方 Fast / Pro]]：支持 1-3 张参考图。", "[[red:低价版和 Lite]]：官方文档未提供参考图接口，已在 UI 中禁用。", "适合角色一致性、主体参考和风格延续。"].join("\n");
export const RUNNINGHUB_VEO3_EXTEND_HELP_TOOLTIP = ["RunningHub Veo3 视频续写", "[[red:官方 Fast / Pro]]：支持 1 个原视频。", "[[red:低价版和 Lite]]：官方文档未提供 video-extend 接口，已在 UI 中禁用。", "请求只提交 video 和 resolution。"].join("\n");
export const VIDU_Q3_GENERATION_MODE_FIELD = Object.freeze({
  id: "vidu_q3_generation_mode",
  type: "segmented",
  placement: "mode",
  variant: "sectionMenu",
  label: "模式选择",
  defaultValue: "video",
  options: Object.freeze([Object.freeze({
    value: "video",
    label: "视频生成"
  }), Object.freeze({
    value: "reference",
    label: "参考生视频"
  })])
});
export const VIDU_Q3_MODEL_FIELD = Object.freeze({
  id: "mode",
  type: "segmented",
  placement: "mode",
  variant: "sectionMenu",
  label: "模型选择",
  defaultValue: "viduq3-turbo",
  description: "视频生成：viduq3-turbo / viduq3-pro。\n参考生视频：viduq3 / viduq3-mix。",
  options: Object.freeze([Object.freeze({
    value: "viduq3-turbo",
    label: "Turbo 版",
    disableWhen: Object.freeze({
      field: "vidu_q3_generation_mode",
      value: "reference"
    })
  }), Object.freeze({
    value: "viduq3-pro",
    label: "Pro 版",
    disableWhen: Object.freeze({
      field: "vidu_q3_generation_mode",
      value: "reference"
    })
  }), Object.freeze({
    value: "viduq3",
    label: "标准版",
    disableWhen: Object.freeze({
      field: "vidu_q3_generation_mode",
      value: "video"
    })
  }), Object.freeze({
    value: "viduq3-mix",
    label: "Mix 版",
    disableWhen: Object.freeze({
      field: "vidu_q3_generation_mode",
      value: "video"
    })
  })])
});
export const VIDU_Q3_AUDIO_FIELD = Object.freeze({
  ...VIDEO_AUDIO_FIELD,
  defaultValue: true,
  hideWhen: Object.freeze({
    field: "vidu_q3_generation_mode",
    value: "reference"
  })
});
export const VIDU_Q3_HELP_TOOLTIP = ["Vidu Q3 视频生成", "[[red:视频生成]]：Turbo / Pro，支持文生、图生、首尾帧，最多 2 张图；传图时比例由图片决定。", "[[red:参考生视频]]：Standard / Mix，必须接入 1-7 张参考图，适合角色一致性和风格延续。"].join("\n");
export const GROK_IMAGINE_QUALITY_FIELD = Object.freeze({
  id: "quality",
  type: "segmented",
  placement: "resolution",
  variant: "pillMenu",
  label: "视频质量",
  defaultValue: "480p",
  options: Object.freeze([Object.freeze({
    value: "480p",
    label: "480p"
  }), Object.freeze({
    value: "720p",
    label: "720p"
  })])
});
export const GROK_IMAGINE_PROMPT_PLACEHOLDER = "描述视频内容、动作和镜头；接入参考图时会按参考图生成动态视频。";
export const GROK_IMAGINE_HELP_TOOLTIP = ["Grok Imagine 1.5", "[[red:不放图]]：文生视频，只按提示词生成。", "[[red:放 1-7 张图]]：图生视频，参考图需为公网可访问 URL。", "时长支持 6-30 秒，质量支持 480p / 720p。"].join("\n");
export const GEMINI_OMNI_FLASH_PROMPT_PLACEHOLDER = "描述视频内容、动作、环境和镜头；可接入 1 张或 3 张参考图。";
export const GEMINI_OMNI_FLASH_HELP_TOOLTIP = ["Gemini Omni Flash Ext", "[[red:不放图]]：文生视频，只按提示词生成。", "[[red:放 1 张图]]：单图生视频，把图片作为视觉参考。", "[[red:放 3 张图]]：参考图融合；不支持 2 张图首尾帧模式。", "时长支持 4 / 6 / 8 / 10 秒，分辨率支持 720p / 1080p / 4K。"].join("\n");
export const GEMINI_OMNI_FLASH_PREVIEW_PROMPT_PLACEHOLDER = "描述视频内容、动作、风格或编辑指令；可混合接入图片或 1 段参考视频。";
export const GEMINI_OMNI_FLASH_PREVIEW_HELP_TOOLTIP = ["Gemini Omni Flash", "[[red:不放图]]：文生视频，只按提示词生成。", "[[red:放图片]]：最多 16 张参考图，支持多主体或风格参考。", "[[red:放视频]]：最多 1 段参考 / 待编辑视频，官方建议 3 秒以内。", "输出为 720p / 24fps，支持 16:9 / 9:16。"].join("\n");
export const GEMINI_OMNI_FLASH_EXTEND_TASK_FIELD = Object.freeze({
  id: "extend_from_task_id",
  type: "text",
  placement: "advanced",
  variant: "advancedRow",
  label: "续写任务 ID",
  defaultValue: "",
  allowEmpty: true,
  description: "可选；填写上一次生成返回的 task_id，用于基于上个任务继续生成。"
});
export const HAILUO_02_PROMPT_EXAMPLE = "[推进]一只猫咪在花园中奔跑，镜头缓缓推进特写";
export const HAILUO_02_HELP_TOOLTIP = ["Hailuo-02 适用场景", "[[red:不放图]]：文生视频，适合快速把一句场景描述变成短视频。", "[[red:放 1 张首帧]]：图生视频，把这张图当开头，适合人物转身、表情变化、镜头推进。", "[[red:放 2 张首尾帧]]：控制开头和结尾，适合白天到夜晚、近景到远景这类明确转场。", "[[red:1080p 只做 5 秒]]；想做 10 秒就用 512p 或 768p。", "提示词例子：画面从白天逐渐过渡到夜晚，天空颜色慢慢变深，城市灯光依次亮起，镜头缓慢推进。"].join("\n");
export const HAILUO_23_PROMPT_EXAMPLE = "[推进]一只猫咪在花园中奔跑，镜头缓缓推进特写";
export const HAILUO_23_HELP_TOOLTIP = ["Hailuo 2.3 适用场景", "[[red:标准版不放图]]：文生视频，适合快速把一句场景描述变成短视频。", "[[red:标准版放 1 张首帧]]：图生视频，把这张图当开头，适合人物转身、表情变化、镜头推进。", "[[red:Fast 版必须放 1 张首帧]]：更快生成，适合已有首帧的快速预览。", "[[red:1080p 只做 6 秒]]；想做 10 秒就用 768p。", "提示词例子：画面中的猫咪向镜头奔跑，镜头缓缓推进，草地和阳光有电影感。"].join("\n");
export const HAILUO_23_MODEL_FIELD = Object.freeze({
  id: "mode",
  type: "segmented",
  placement: "mode",
  variant: "sectionMenu",
  label: "模型选择",
  description: "标准版支持文生和图生视频。\nFast 版必须接入首帧图片，生成更快。",
  defaultValue: "standard",
  options: Object.freeze([Object.freeze({
    value: "standard",
    label: "标准版"
  }), Object.freeze({
    value: "fast",
    label: "Fast 版"
  })])
});
export const RUNNINGHUB_HAILUO_02_PROMPT_PLACEHOLDER = "描述视频内容和镜头变化。例如：[推进]一只猫咪在花园中奔跑，镜头缓缓推进特写。";
export const RUNNINGHUB_HAILUO_02_HELP_TOOLTIP = ["RunningHub Hailuo 02", "[[red:标准版不放图]]：文生视频，支持 6 秒或 10 秒。", "[[red:标准版放 1 张首帧]]：图生视频，把图片作为视频起点。", "[[red:标准版放 2 张首尾帧]]：控制开头和结尾。", "[[red:Pro 版]]：文生或首帧图生，1080P 质量，接口不接尾帧。", "[[red:Fast 版]]：必须接 1 张首帧图，适合快速预览。"].join("\n");
export const RUNNINGHUB_HAILUO_02_QUALITY_FIELD = Object.freeze({
  id: "rh_hailuo_02_quality",
  type: "segmented",
  placement: "resolution",
  variant: "sectionMenu",
  label: "视频质量",
  description: "标准版支持文生、图生和首尾帧；Pro 版支持文生/首帧图生；Fast 版必须接首帧。",
  defaultValue: "standard",
  options: Object.freeze([Object.freeze({
    value: "standard",
    label: "标准版",
    selectedLabel: "标准 768P"
  }), Object.freeze({
    value: "pro",
    label: "Pro 版",
    selectedLabel: "Pro 1080P"
  }), Object.freeze({
    value: "fast",
    label: "Fast 版",
    selectedLabel: "Fast 768P",
    tooltip: "Fast 版仅支持图生视频，必须接入首帧。"
  })])
});
export const RUNNINGHUB_HAILUO_02_DURATION_FIELD = Object.freeze({
  ...createFooterDurationSliderOptionsField({
    values: [6, 10],
    defaultValue: 6,
    label: "视频时长（秒）"
  }),
  hideWhen: Object.freeze({
    field: "rh_hailuo_02_quality",
    value: "pro"
  })
});
export const RUNNINGHUB_HAILUO_02_ENABLE_PROMPT_EXPANSION_FIELD = Object.freeze({
  id: "enablePromptExpansion",
  type: "toggle",
  placement: "advanced",
  variant: "advancedRow",
  label: "提示词扩写",
  defaultValue: true
});
export const RUNNINGHUB_HAILUO_02_FIXED_INPUT_SLOTS = Object.freeze([Object.freeze({
  id: "firstFrame",
  kind: "image",
  label: "首帧",
  description: "图生视频起始帧；Fast 版必填。"
}), Object.freeze({
  id: "lastFrame",
  kind: "image",
  label: "尾帧",
  description: "仅标准版首尾帧可用。",
  hideWhen: Object.freeze({
    field: "rh_hailuo_02_quality",
    values: Object.freeze(["pro", "fast"])
  })
})]);
export const RUNNINGHUB_HAILUO_23_PROMPT_PLACEHOLDER = "描述视频内容和镜头变化。例如：[推进]画面中的猫咪向镜头奔跑，镜头缓缓推进，草地和阳光有电影感。";
export const RUNNINGHUB_HAILUO_23_HELP_TOOLTIP = ["RunningHub Hailuo 2.3", "[[red:标准版不放图]]：文生视频，支持 6 秒或 10 秒。", "[[red:标准版放 1 张首帧]]：图生视频，把图片作为视频起点。", "[[red:Pro 版]]：文生或首帧图生，1080P 质量，固定 5 秒，不传 duration。", "[[red:Fast 版]]：必须接 1 张首帧图，768P，支持 6 秒或 10 秒。", "[[red:Fast Pro 版]]：必须接 1 张首帧图，1080P，固定 6 秒。"].join("\n");
export const RUNNINGHUB_HAILUO_23_QUALITY_FIELD = Object.freeze({
  id: "rh_hailuo_23_quality",
  type: "segmented",
  placement: "resolution",
  variant: "sectionMenu",
  label: "视频质量",
  description: "标准版支持文生/图生；Pro 文生/图生固定 5 秒；Fast/Fast Pro 必须接首帧。",
  defaultValue: "standard",
  options: Object.freeze([Object.freeze({
    value: "standard",
    label: "标准版",
    selectedLabel: "标准 768P"
  }), Object.freeze({
    value: "pro",
    label: "Pro 版",
    selectedLabel: "Pro 1080P"
  }), Object.freeze({
    value: "fast",
    label: "Fast 版",
    selectedLabel: "Fast 768P",
    tooltip: "Fast 版仅支持图生视频，必须接入首帧。"
  }), Object.freeze({
    value: "fastPro",
    label: "Fast Pro",
    selectedLabel: "Fast Pro 1080P",
    tooltip: "Fast Pro 版仅支持图生视频，固定 6 秒。"
  })])
});
export const RUNNINGHUB_HAILUO_23_DURATION_FIELD = Object.freeze({
  ...createFooterDurationSliderOptionsField({
    values: [6, 10],
    defaultValue: 6,
    label: "视频时长（秒）"
  }),
  hideWhen: Object.freeze({
    field: "rh_hailuo_23_quality",
    values: Object.freeze(["pro", "fastPro"])
  })
});
export const RUNNINGHUB_HAILUO_23_FIXED_INPUT_SLOTS = Object.freeze([Object.freeze({
  id: "firstFrame",
  kind: "image",
  label: "首帧",
  description: "图生视频起始帧；Fast / Fast Pro 必填。"
})]);
export const HAPPYHORSE_TEXT_HELP_TOOLTIP = ["HappyHorse 1.0 文生视频", "[[red:没入参时]]：只写提示词，就是文生视频。", "适合直接生成新画面、动作和镜头。", "提示词例子：一只白色小狗在草地上奔跑，镜头低角度跟拍，阳光明亮，慢动作。"].join("\n");
export const HAPPYHORSE_IMAGE_HELP_TOOLTIP = ["HappyHorse 1.0 图生视频", "[[red:接 1 张图]]：把这张图当视频起点，让画面动起来。", "[[red:没入参时]]：仍然是文生视频，只按提示词生成。", "适合人物转身、表情变化、镜头推进这类从一张图开始的变化。", "提示词例子：画面中的女孩慢慢转身看向镜头，发丝被风吹动，背景轻微虚化。"].join("\n");
export const HAPPYHORSE_REFERENCE_HELP_TOOLTIP = ["HappyHorse 1.0 参考图生视频", "[[red:接 1-9 张参考图]]：参考人物、主体、风格或场景，生成全新画面。", "[[red:没入参时]]：仍然是文生视频，只按提示词生成。", "适合统一角色或风格，多张图可以给更多外观参考。", "提示词例子：参考图中的角色在未来城市中行走，镜头从侧面缓慢环绕，灯光有电影感。"].join("\n");
export const HAPPYHORSE_EDIT_HELP_TOOLTIP = ["HappyHorse 1.0 视频编辑", "[[red:接 1 个视频]]：在原视频基础上改画面或动作，可再接最多 5 张参考图。", "[[red:没入参时]]：仍然是文生视频，只按提示词生成。", "适合改风格、换场景、增强画面，或让原视频更贴近参考图。", "提示词例子：把原视频改成夜晚赛博朋克街道风格，保留人物动作，增加霓虹灯和雨水反光。"].join("\n");
export const HAPPYHORSE_HELP_TOOLTIP = HAPPYHORSE_TEXT_HELP_TOOLTIP;
export const HAPPYHORSE_11_TEXT_HELP_TOOLTIP = ["HappyHorse 1.1 文生视频", "[[red:没入参时]]：只写提示词，就是文生视频。", "适合直接生成新画面、动作和镜头。", "提示词例子：一只白色小狗在草地上奔跑，镜头低角度跟拍，阳光明亮，慢动作。"].join("\n");
export const HAPPYHORSE_11_IMAGE_HELP_TOOLTIP = ["HappyHorse 1.1 图生视频", "[[red:接 1 张图]]：把这张图当视频起点，让画面动起来。", "[[red:没入参时]]：仍然是文生视频，只按提示词生成。", "适合人物转身、表情变化、镜头推进这类从一张图开始的变化。", "提示词例子：画面中的女孩慢慢转身看向镜头，发丝被风吹动，背景轻微虚化。"].join("\n");
export const HAPPYHORSE_11_REFERENCE_HELP_TOOLTIP = ["HappyHorse 1.1 参考图生视频", "[[red:接 1-9 张参考图]]：参考人物、主体、风格或场景，生成全新画面。", "[[red:没入参时]]：仍然是文生视频，只按提示词生成。", "适合统一角色或风格，多张图可以给更多外观参考。", "提示词例子：参考图中的角色在未来城市中行走，镜头从侧面缓慢环绕，灯光有电影感。"].join("\n");
export const HAPPYHORSE_11_HELP_TOOLTIP = HAPPYHORSE_11_TEXT_HELP_TOOLTIP;
export const HAPPYHORSE_TEXT_PROMPT_PLACEHOLDER = "描述要生成的视频内容。例如：夕阳下的海边公路，慢镜头推进，电影感画面。";
export const HAPPYHORSE_IMAGE_PROMPT_PLACEHOLDER = "描述首帧图要如何动起来。例如：让图片中的场景动起来，镜头缓慢推近，主体轻微转身，电影感。";
export const HAPPYHORSE_REFERENCE_PROMPT_PLACEHOLDER = "描述参考图之间的主体、场景和动作关系。例如：@图片1 中的主角在 @图片2 的场景中奔跑，随后拿起 @图片3 中的道具，保持3D卡通风格，动作流畅。";
export const HAPPYHORSE_EDIT_PROMPT_PLACEHOLDER = "描述如何改写源视频，可用参考图补充风格。例如：把视频中的角色换成卡通风格，保留原有动作和节奏。";
export const HAPPYHORSE_MODE_FIELD = Object.freeze({
  id: "happyhorse_mode",
  type: "segmented",
  placement: "mode",
  variant: "sectionMenu",
  label: "模式选择",
  description: HAPPYHORSE_HELP_TOOLTIP,
  defaultValue: "image",
  options: Object.freeze([Object.freeze({
    value: "auto",
    label: "模式选择",
    displayLabel: "模式选择",
    hidden: true
  }), Object.freeze({
    value: "image",
    label: "图生视频"
  }), Object.freeze({
    value: "reference",
    label: "参考图生视频"
  }), Object.freeze({
    value: "edit",
    label: "视频编辑"
  })])
});
export const HAPPYHORSE_11_MODE_FIELD = Object.freeze({
  ...HAPPYHORSE_MODE_FIELD,
  description: HAPPYHORSE_11_HELP_TOOLTIP,
  options: Object.freeze([Object.freeze({
    value: "auto",
    label: "模式选择",
    displayLabel: "模式选择",
    hidden: true
  }), Object.freeze({
    value: "image",
    label: "图生视频"
  }), Object.freeze({
    value: "reference",
    label: "参考图生视频"
  })])
});
export const HAPPYHORSE_AUDIO_SETTING_FIELD = Object.freeze({
  ...VIDEO_AUDIO_SETTING_FIELD,
  label: "音频设置",
  tooltip: "仅视频编辑模式生效：自动生成音频或保留原视频音轨。",
  options: Object.freeze([Object.freeze({
    value: "auto",
    label: "自动生成音频"
  }), Object.freeze({
    value: "origin",
    label: "保留原视频音轨"
  })])
});
export const HAPPYHORSE_WATERMARK_FIELD = Object.freeze({
  ...VIDEO_WATERMARK_FIELD,
  label: "添加水印"
});
export const HAPPYHORSE_SEED_FIELD = Object.freeze({
  ...VIDEO_SEED_FIELD,
  label: "随机种子"
});
export function createHappyHorseFixedSlot({
  id: _0x5948c4,
  kind: _0x6f539f,
  label: _0x1bcf07,
  mode: _0x35c78d,
  description: _0x48b75d
}) {
  return Object.freeze({
    id: _0x5948c4,
    kind: _0x6f539f,
    label: _0x1bcf07,
    description: _0x48b75d,
    showWhen: Object.freeze({
      field: "happyhorse_mode",
      value: _0x35c78d
    })
  });
}
export const HAPPYHORSE_FIXED_INPUT_SLOTS = Object.freeze([createHappyHorseFixedSlot({
  id: "firstFrame",
  kind: "image",
  label: "参考图",
  mode: "image",
  description: "图生视频使用的参考图"
}), createHappyHorseFixedSlot({
  id: "referenceImage",
  kind: "image",
  label: "参考图",
  mode: "reference",
  description: "参考图生视频的参考图片"
}), createHappyHorseFixedSlot({
  id: "editVideo",
  kind: "video",
  label: "参考视频",
  mode: "edit",
  description: "视频编辑使用的参考视频"
}), createHappyHorseFixedSlot({
  id: "editRefImage",
  kind: "image",
  label: "参考图",
  mode: "edit",
  description: "视频编辑可选参考图"
})]);
export const HAPPYHORSE_11_FIXED_INPUT_SLOTS = Object.freeze([createHappyHorseFixedSlot({
  id: "firstFrame",
  kind: "image",
  label: "参考图",
  mode: "image",
  description: "图生视频使用的参考图"
}), createHappyHorseFixedSlot({
  id: "referenceImage",
  kind: "image",
  label: "参考图",
  mode: "reference",
  description: "参考图生视频的参考图片"
})]);
export const RUNNINGHUB_SEEDANCE_2_MODEL_FIELD = Object.freeze({
  id: "rh_seedance_2_model",
  type: "segmented",
  placement: "mode",
  variant: "sectionMenu",
  label: "模型选择",
  defaultValue: "fast",
  options: Object.freeze([Object.freeze({
    value: "fast",
    label: "Fast 版"
  }), Object.freeze({
    value: "standard",
    label: "标准版"
  })])
});
export const RUNNINGHUB_SEEDANCE_2_MODE_FIELD = Object.freeze({
  id: "rh_seedance_2_mode",
  type: "segmented",
  placement: "mode",
  variant: "sectionMenu",
  label: "模式选择",
  defaultValue: "multimodal2video",
  options: Object.freeze([Object.freeze({
    value: "text2video",
    label: "文生视频"
  }), Object.freeze({
    value: "image2video",
    label: "图生视频"
  }), Object.freeze({
    value: "frames2video",
    label: "首尾帧"
  }), Object.freeze({
    value: "multimodal2video",
    label: "全能参考"
  })])
});
export const VOLCENGINE_SEEDANCE_2_MODE_FIELD = Object.freeze({
  id: "volcengine_seedance_2_mode",
  type: "segmented",
  placement: "mode",
  variant: "pillMenu",
  label: "模式",
  defaultValue: "multimodal2video",
  options: Object.freeze([Object.freeze({
    value: "multimodal2video",
    label: "全能参考",
    selectedLabel: "全能参考"
  }), Object.freeze({
    value: "frames2video",
    label: "首尾帧",
    selectedLabel: "首尾帧"
  })])
});
export const RUNNINGHUB_SEEDANCE_2_RESOLUTION_FIELD = Object.freeze({
  id: "resolution",
  displayRole: "resolution",
  type: "segmented",
  placement: "resolution",
  variant: "pillMenu",
  qualityRatioLabelOrder: "fieldFirst",
  label: "分辨率",
  defaultValue: "720p",
  options: Object.freeze([Object.freeze({
    value: "480p",
    label: "480p",
    groupLabel: "原生输出分辨率"
  }), Object.freeze({
    value: "720p",
    label: "720p",
    groupLabel: "原生输出分辨率"
  }), Object.freeze({
    value: "native1080p",
    label: "native1080p",
    groupLabel: "原生输出分辨率"
  }), Object.freeze({
    value: "1080p",
    label: "1080p",
    groupLabel: "超分辨率"
  }), Object.freeze({
    value: "2k",
    label: "2k",
    groupLabel: "超分辨率"
  }), Object.freeze({
    value: "4k",
    label: "4k",
    groupLabel: "超分辨率"
  })])
});
export const RUNNINGHUB_SEEDANCE_2_GENERATE_AUDIO_FIELD = Object.freeze({
  id: "generateAudio",
  type: "toggle",
  placement: "advanced",
  variant: "advancedRow",
  label: "生成音频",
  defaultValue: true
});
export const RUNNINGHUB_SEEDANCE_2_WEB_SEARCH_FIELD = Object.freeze({
  id: "webSearch",
  type: "toggle",
  placement: "advanced",
  variant: "advancedRow",
  label: "联网搜索",
  defaultValue: false,
  showWhen: Object.freeze({
    field: "rh_seedance_2_mode",
    value: "text2video"
  })
});
export const RUNNINGHUB_SEEDANCE_2_REAL_PERSON_FIELD = Object.freeze({
  id: "realPersonMode",
  type: "toggle",
  placement: "advanced",
  variant: "advancedRow",
  label: "真人模式",
  defaultValue: false
});
export function createVolcengineSeedance2ResolutionField({
  include1080p = true,
  include4k = false
} = {}) {
  const _0x137617 = [Object.freeze({
    value: "480p",
    label: "480p"
  }), Object.freeze({
    value: "720p",
    label: "720p"
  })];
  if (include1080p) {
    _0x137617.push(Object.freeze({
      value: "1080p",
      label: "1080p"
    }));
  }
  if (include4k) {
    _0x137617.push(Object.freeze({
      value: "4k",
      label: "4k"
    }));
  }
  return Object.freeze({
    id: "resolution",
    displayRole: "resolution",
    type: "segmented",
    placement: "resolution",
    variant: "pillMenu",
    qualityRatioLabelOrder: "fieldFirst",
    label: "分辨率",
    defaultValue: "720p",
    options: Object.freeze(_0x137617)
  });
}
export const VOLCENGINE_SEEDANCE_2_RATIO_FIELD = Object.freeze({
  id: "aspectRatio",
  displayRole: "aspectRatio",
  type: "segmented",
  placement: "resolution",
  variant: "ratioPill",
  label: "比例",
  defaultValue: "adaptive",
  options: Object.freeze([Object.freeze({
    value: "adaptive",
    label: "自适应"
  }), Object.freeze({
    value: "16:9",
    label: "16:9"
  }), Object.freeze({
    value: "9:16",
    label: "9:16"
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
    value: "21:9",
    label: "21:9"
  })])
});
export const VOLCENGINE_SEEDANCE_2_GENERATE_AUDIO_FIELD = Object.freeze({
  ...RUNNINGHUB_SEEDANCE_2_GENERATE_AUDIO_FIELD,
  defaultValue: true
});
export const VOLCENGINE_SEEDANCE_2_WEB_SEARCH_FIELD = Object.freeze({
  id: "webSearch",
  type: "toggle",
  placement: "advanced",
  variant: "advancedRow",
  label: "联网搜索",
  defaultValue: false
});
export const VOLCENGINE_SEEDANCE_2_PRIORITY_FIELD = Object.freeze({
  id: "priority",
  type: "slider",
  placement: "advanced",
  variant: "advancedRow",
  label: "任务优先级",
  defaultValue: 0,
  min: 0,
  max: 9,
  step: 1
});
export const VOLCENGINE_SEEDANCE_2_SEED_FIELD = Object.freeze({
  ...VIDEO_SEED_FIELD,
  defaultValue: "random"
});
export function createRunningHubSeedance2FixedSlot({
  id: _0x286774,
  kind: _0x2f1d89,
  label: _0x11f9db,
  mode: _0x3bfee8,
  modes: _0x312bbc,
  description: _0x235804,
  displayOrder: _0x1dc755
}) {
  const _0x5bf4ea = Object.freeze((Array.isArray(_0x312bbc) ? _0x312bbc : [_0x3bfee8]).map(_0x555fe3 => String(_0x555fe3 || "").trim()).filter(Boolean));
  const _0x486922 = _0x5bf4ea.length > 1 ? Object.freeze({
    field: "rh_seedance_2_mode",
    values: _0x5bf4ea
  }) : Object.freeze({
    field: "rh_seedance_2_mode",
    value: _0x5bf4ea[0] || ""
  });
  return Object.freeze({
    id: _0x286774,
    kind: _0x2f1d89,
    label: _0x11f9db,
    description: _0x235804,
    displayOrder: _0x1dc755,
    showWhen: _0x486922
  });
}
export const RUNNINGHUB_SEEDANCE_2_FIXED_INPUT_SLOTS = Object.freeze([createRunningHubSeedance2FixedSlot({
  id: "firstFrame",
  kind: "image",
  label: "首帧",
  modes: ["image2video", "frames2video"],
  displayOrder: 10,
  description: "图生或首尾帧生成的起始图片"
}), createRunningHubSeedance2FixedSlot({
  id: "lastFrame",
  kind: "image",
  label: "尾帧",
  mode: "frames2video",
  displayOrder: 20,
  description: "首尾帧生成的结束图片"
}), createRunningHubSeedance2FixedSlot({
  id: "referenceVideo",
  kind: "video",
  label: "参考视频",
  mode: "multimodal2video",
  displayOrder: 30,
  description: "全能参考模式的参考视频"
}), createRunningHubSeedance2FixedSlot({
  id: "referenceImage",
  kind: "image",
  label: "参考图",
  mode: "multimodal2video",
  displayOrder: 40,
  description: "全能参考模式的参考图片"
}), createRunningHubSeedance2FixedSlot({
  id: "referenceAudio",
  kind: "audio",
  label: "参考音频",
  mode: "multimodal2video",
  displayOrder: 50,
  description: "可选，需搭配参考图片或参考视频"
})]);
export const RUNNINGHUB_SEEDANCE_2_TEXT_PROMPT_PLACEHOLDER = "描述要生成的视频内容、动作、镜头和风格。";
export const RUNNINGHUB_SEEDANCE_2_IMAGE_PROMPT_PLACEHOLDER = "描述参考图中主体如何运动，以及镜头和画面变化。";
export const RUNNINGHUB_SEEDANCE_2_FRAMES_PROMPT_PLACEHOLDER = "描述首帧到尾帧的过渡动作、节奏和镜头关系。";
export const RUNNINGHUB_SEEDANCE_2_REFERENCE_PROMPT_PLACEHOLDER = "用 @图片1、@视频1 指代参考素材，描述主体、动作、声音和镜头关系。";
export const RUNNINGHUB_SEEDANCE_2_HELP_TOOLTIP = ["RunningHub Seedance 2.0", "模型选择：Fast 版 / 标准版。", "模式：文生视频 / 图生视频 / 首尾帧 / 全能参考。", "分辨率：480p、720p、native1080p 为原生输出；1080p、2k、4k 为基于 720p 原生生成后超分放大。", "图生需 1 张图；首尾帧需 2 张图；全能参考最多 9 图、3 视频、3 音频。"].join("\n");
export const VOLCENGINE_SEEDANCE_2_HELP_TOOLTIP = ["火山方舟 Seedance 2.0", "模式：全能参考 / 首尾帧。", "无入参时只使用提示词；首尾帧模式接 1 张图时按首帧输入处理。", "分辨率：Fast 版支持 480p、720p；标准版支持 480p、720p、1080p。", "全能参考最多 9 图、3 视频、3 音频；音频需搭配图片或视频。"].join("\n");
export const APIMART_SEEDANCE_2_MINI_HELP_TOOLTIP = ["APIMart Seedance 2.0 Mini", "建议：中文提示词不超过500字，英文提示词不超过1000词。", "字数过多易导致信息分散，模型可能忽略细节、仅关注重点，进而造成视频缺失部分元素。"].join("\n");
export const WAN27_HELP_TOOLTIP = ["Wan2.7 模式说明", "图生视频：可接首帧、尾帧和音频；没入参时就是文生视频。", "视频续写：接 1 个续写视频；没入参时就是文生视频。", "参考生视频：接参考图或参考视频；音频需搭配参考图。", "视频编辑：接原视频，可再接参考视频。"].join("\n");
export const WAN27_IMAGE_HELP_TOOLTIP = ["Wan2.7 图生视频", "[[red:没入参时]]：只写提示词，就是文生视频。", "[[red:接 1 张首帧]]：从这张图开始生成视频。", "[[red:接首帧 + 尾帧]]：第一张是开头，第二张是结尾，中间变化由模型补。", "[[red:接音频]]：可作为背景或驱动音频，2-30 秒且不超过 15MB。", "提示词例子：一只猫咪在草地上追逐蝴蝶，阳光明媚，镜头慢慢推进，慢动作。"].join("\n");
export const WAN27_VIDEO_HELP_TOOLTIP = ["Wan2.7 视频续写", "[[red:接 1 个续写视频]]：在原视频后继续往下生成。", "[[red:没入参时]]：只写提示词，就是文生视频。", "[[red:视频超过 10 秒]]：生成前会拦截。", "提示词例子：延续原视频里的镜头，人物继续向前走，镜头跟随，动作自然衔接。"].join("\n");
export const WAN27_REFERENCE_HELP_TOOLTIP = ["Wan2.7 参考生视频", "[[red:接参考图或参考视频]]：参考主体、动作、风格或场景，生成新视频。", "[[red:音频需搭配参考图]]：作为角色声音参考使用。", "提示词里可以用图 1、视频 1 指代对应入参。", "提示词例子：图 1 中的人物来到视频 1 的街道场景中，环顾四周，镜头从侧面缓慢跟拍。"].join("\n");
export const WAN27_EDIT_HELP_TOOLTIP = ["Wan2.7 视频编辑", "[[red:接 1 个原视频]]：在原视频基础上改画面、换背景或改风格。", "[[red:参考视频可选]]：用来补充目标动作或风格参考。", "[[red:原视频 2-10 秒]]：超过会在生成前拦截。", "提示词例子：将原视频背景替换为雪山场景，保留人物动作，整体变成电影感冷色调。"].join("\n");
export const WAN27_IMAGE_PROMPT_PLACEHOLDER = "不接素材时描述文生视频；接首帧/尾帧时描述动作、运镜和过渡。例如：人物缓缓站起身，向镜头走来；或镜头从海边缓慢移向山顶。";
export const WAN27_VIDEO_PROMPT_PLACEHOLDER = "描述原视频要如何续写。例如：继续向前走，镜头跟随，保持原视频里的动作节奏和画面风格。";
export const WAN27_REFERENCE_PROMPT_PLACEHOLDER = "用 @图片1、@图片2、@视频1 指代参考素材。例如：@图片1 中的人物来到 @图片2 的场景中，学习 @图片3 的动作，保持角色一致。";
export const WAN27_EDIT_PROMPT_PLACEHOLDER = "描述要对原视频做什么编辑，可用参考图补充风格。例如：将背景替换为雪山场景，保留人物动作和镜头节奏。";
export const KLING_V3_HELP_TOOLTIP = ["Kling V3 视频生成", "[[red:不放图]]：只写提示词，就是文生视频。", "[[red:接 1 张首帧]]：从这张图开始生成视频。", "[[red:接首帧 + 尾帧]]：第一张是开头，第二张是结尾，中间变化由模型补。", "[[red:生成有声视频]]：在高级设置打开音频，让模型同时生成声音。", "标准 / 专业 / 4K 可在参数区选择；多镜头分镜模式暂未开放。", "提示词例子：女孩从照片里的姿势慢慢转身看向镜头，镜头缓慢推进，阳光穿过窗帘，电影感。"].join("\n");
export const KLING_V3_PROMPT_PLACEHOLDER = "不接素材时描述文生视频；接首帧/尾帧时描述 @图片1 到 @图片2 的变化。例如：@图片1 中的猫咪缓缓向前走，最后过渡到 @图片2 的画面，电影质感。";
export const KLING_V3_OMNI_IMAGE_HELP_TOOLTIP = ["Kling V3 Omni 图生视频", "[[red:没入参时]]：只写提示词，就是文生视频。", "[[red:接 1 张首帧]]：从这张图开始生成视频。", "[[red:接首帧 + 尾帧]]：第一张是开头，第二张是结尾，中间变化由模型补。", "[[red:生成有声视频]]：在高级设置打开音频，让模型同时生成声音。", "提示词例子：画面中的女孩慢慢转身看向镜头，镜头缓慢推进，窗外阳光穿过窗帘，电影感。"].join("\n");
export const KLING_V3_OMNI_REFERENCE_HELP_TOOLTIP = ["Kling V3 Omni 参考生视频", "[[red:接参考图或参考视频]]：参考主体、动作、风格或场景生成新视频。", "参考视频会作为特征参考；有参考视频时不会发送生成有声视频参数。", "提示词例子：参考图中的角色走进参考视频的街道场景，镜头从侧面缓慢跟拍，灯光有电影感。"].join("\n");
export const KLING_V3_OMNI_EDIT_HELP_TOOLTIP = ["Kling V3 Omni 视频编辑", "[[red:接 1 个原视频]]：在原视频基础上改画面、换风格或调整内容。", "[[red:不能同时接首尾帧]]：视频编辑模式只使用原视频作为基础输入。", "提示词例子：将原视频改成夜晚赛博朋克街道风格，保留人物动作，增加霓虹灯和雨水反光。"].join("\n");
export const KLING_V3_OMNI_HELP_TOOLTIP = KLING_V3_OMNI_IMAGE_HELP_TOOLTIP;
export const KLING_V3_OMNI_IMAGE_PROMPT_PLACEHOLDER = "不接素材时描述文生视频；接首帧/尾帧时可用 @图片1 / @图片2 指代。例如：让 @图片1 中的人物向镜头挥手，随后过渡到 @图片2 的街景。";
export const KLING_V3_OMNI_REFERENCE_PROMPT_PLACEHOLDER = "用 @图片1、@视频1 指代参考素材。例如：参考 @图片1 的角色外观和 @视频1 的镜头风格，生成夜晚街道行走视频。";
export const KLING_V3_OMNI_EDIT_PROMPT_PLACEHOLDER = "描述如何编辑原视频，可接参考图补充风格。例如：将原视频改成夜晚赛博朋克街道风格，保留人物动作和镜头节奏。";
export const KLING_V3_OMNI_MODE_FIELD = Object.freeze({
  id: "kling_v3_omni_mode",
  type: "segmented",
  placement: "mode",
  variant: "sectionMenu",
  label: "模式选择",
  description: "图生视频：首尾帧或文生视频。\n参考生视频：参考图或参考视频。\n视频编辑：基于原视频编辑。",
  defaultValue: "image",
  options: Object.freeze([Object.freeze({
    value: "image",
    label: "图生视频"
  }), Object.freeze({
    value: "reference",
    label: "参考生视频"
  }), Object.freeze({
    value: "edit",
    label: "视频编辑"
  })])
});
export function createKlingV3OmniFixedSlot({
  id: _0x4c9df2,
  kind: _0x171712,
  label: _0x5c7d3d,
  mode: _0x24c9a7,
  description: _0x4170ea,
  displayOrder: _0x8aab7
}) {
  return Object.freeze({
    id: _0x4c9df2,
    kind: _0x171712,
    label: _0x5c7d3d,
    description: _0x4170ea,
    displayOrder: _0x8aab7,
    showWhen: Object.freeze({
      field: "kling_v3_omni_mode",
      value: _0x24c9a7
    })
  });
}
export const KLING_V3_OMNI_FIXED_INPUT_SLOTS = Object.freeze([createKlingV3OmniFixedSlot({
  id: "firstFrame",
  kind: "image",
  label: "首帧",
  mode: "image",
  displayOrder: 10,
  description: "图生视频使用的首帧图片"
}), createKlingV3OmniFixedSlot({
  id: "lastFrame",
  kind: "image",
  label: "尾帧",
  mode: "image",
  displayOrder: 20,
  description: "可选，图生视频使用的尾帧图片"
}), createKlingV3OmniFixedSlot({
  id: "referenceImage",
  kind: "image",
  label: "参考图",
  mode: "reference",
  displayOrder: 30,
  description: "参考生视频使用的参考图片"
}), createKlingV3OmniFixedSlot({
  id: "referenceVideo",
  kind: "video",
  label: "参考视频",
  mode: "reference",
  displayOrder: 40,
  description: "参考生视频使用的特征参考视频"
}), createKlingV3OmniFixedSlot({
  id: "editVideo",
  kind: "video",
  label: "原视频",
  mode: "edit",
  displayOrder: 50,
  description: "视频编辑使用的原视频"
})]);
export const KLING_O1_HELP_TOOLTIP = ["Kling Video O1 视频生成", "[[red:@图片引用]]：O1 会把 @图片1 / @图片2 解析为 <<<image_1>>> / <<<image_2>>>，用于在提示词中精确引用图片。", "[[red:参考图片]]：最多 2 张；如果同时接特征参考视频，只使用第 1 张参考图片。", "[[red:编辑视频 / 特征参考视频]]：两个视频槽互斥，只能接其中一个；视频需 3-10 秒。", "提示词例子：让@图片1中的人物向镜头挥手，随后走向@图片2中的街景，镜头缓慢推进。"].join("\n");
export const KLING_O1_PROMPT_PLACEHOLDER = "描述视频内容，按 @ 引用参考图片。例如：让 @图片1 中的人物向镜头挥手，随后走向 @图片2 中的街景；接编辑视频时描述要改什么画面或风格。";
export const KLING_O1_FIXED_INPUT_SLOTS = Object.freeze([Object.freeze({
  id: "editVideo",
  kind: "video",
  label: "编辑视频",
  description: "待编辑的原视频，需 3-10 秒；与特征参考视频互斥。",
  displayOrder: 10
}), Object.freeze({
  id: "featureReferenceVideo",
  kind: "video",
  label: "特征参考视频",
  description: "作为特征参考的视频，需 3-10 秒；与编辑视频互斥。",
  displayOrder: 20
}), Object.freeze({
  id: "referenceImage",
  kind: "image",
  label: "参考图片",
  description: "O1 提示词里可用 @图片1 / @图片2 引用，提交时会转换为 <<<image_N>>>。",
  displayOrder: 30
})]);
export const KLING_O1_VIDEO_EXCLUSIVE_GROUPS = Object.freeze([Object.freeze({
  id: "klingO1VideoInput",
  slots: Object.freeze(["editVideo", "featureReferenceVideo"]),
  max: 1
})]);
export const RUNNINGHUB_KLING_O1_GENERATION_MODE_FIELD = Object.freeze({
  id: "rh_kling_o1_generation_mode",
  type: "segmented",
  placement: "mode",
  variant: "sectionMenu",
  label: "模式选择",
  description: "视频生成：支持文生、图生、首尾帧。\n参考生视频：接 1-7 张参考图和 1 个参考视频。",
  defaultValue: "frame",
  options: Object.freeze([Object.freeze({
    value: "frame",
    label: "视频生成"
  }), Object.freeze({
    value: "reference",
    label: "参考生视频"
  }), Object.freeze({
    value: "edit",
    label: "视频编辑"
  })])
});
export const RUNNINGHUB_KLING_O1_RATIO_FIELD = Object.freeze({
  ...VIDEO_RATIO_FIELD,
  defaultValue: APIMART_VIDEO_ADAPTIVE_RATIO_VALUE,
  options: Object.freeze([APIMART_VIDEO_ADAPTIVE_RATIO_OPTION, Object.freeze({
    value: "16:9",
    label: "16:9"
  }), Object.freeze({
    value: "9:16",
    label: "9:16"
  }), Object.freeze({
    value: "1:1",
    label: "1:1"
  })])
});
export const RUNNINGHUB_KLING_O1_KEEP_ORIGINAL_SOUND_FIELD = Object.freeze({
  ...KLING_O1_KEEP_ORIGINAL_SOUND_FIELD,
  showWhen: Object.freeze({
    field: "rh_kling_o1_generation_mode",
    values: Object.freeze(["reference", "edit"])
  })
});
export const RUNNINGHUB_KLING_O1_FRAME_HELP_TOOLTIP = ["RunningHub Kling O1 视频生成", "[[red:不接图]]：走文生视频接口。", "[[red:接 1 张首帧]]：走图生视频接口，把这张图作为视频起点。", "[[red:接首帧 + 尾帧]]：走首尾帧接口，中间变化由 O1 补齐。", "提示词例子：@图片1 中的人物慢慢转身，最后过渡到 @图片2 的夜晚街景，电影感，镜头缓慢推进。"].join("\n");
export const RUNNINGHUB_KLING_O1_REFERENCE_HELP_TOOLTIP = ["RunningHub Kling O1 参考生视频", "[[red:必须接 1-7 张参考图 + 1 个参考视频]]：参考图用于主体/风格，参考视频用于动作或镜头特征。", "[[red:保留原声]]：开启后提交 keepOriginalSound。", "提示词例子：参考 @图片1 的角色外观和 @视频1 的动作节奏，生成夜晚街道行走镜头。"].join("\n");
export const RUNNINGHUB_KLING_O1_EDIT_HELP_TOOLTIP = ["RunningHub Kling O1 视频编辑", "[[red:接 1 个原视频]]：走官方 edit-video 接口。", "[[red:保留原声]]：开启后提交 keepOriginalSound。", "提示词里直接描述要修改的画面、元素或风格。"].join("\n");
export const RUNNINGHUB_KLING_O1_HELP_TOOLTIP = RUNNINGHUB_KLING_O1_FRAME_HELP_TOOLTIP;
export const RUNNINGHUB_KLING_O1_FRAME_PROMPT_PLACEHOLDER = "不接素材时描述文生视频；接首帧/尾帧时可用 @图片1 / @图片2 指代。例如：让 @图片1 中的人物向镜头挥手，随后过渡到 @图片2 的街景。";
export const RUNNINGHUB_KLING_O1_REFERENCE_PROMPT_PLACEHOLDER = "描述参考图和参考视频要生成的新画面。例如：参考 @图片1 的角色外观和 @视频1 的动作节奏，生成夜晚街道行走镜头。";
export const RUNNINGHUB_KLING_O1_EDIT_PROMPT_PLACEHOLDER = "描述要对原视频做的编辑。例如：移除背景路人，将晴天改为电影感雨夜，并保持人物动作连贯。";
export function createRunningHubKlingO1FixedSlot({
  id: _0x41d6e8,
  kind: _0x147253,
  label: _0x2c9628,
  mode: _0x3996ad,
  description: _0x2e9c44,
  displayOrder: _0x366461
}) {
  const _0x5dd03f = _0x3996ad === "reference" || _0x3996ad === "edit" ? {
    showWhen: Object.freeze({
      field: "rh_kling_o1_generation_mode",
      value: _0x3996ad
    })
  } : {
    hideWhen: Object.freeze({
      field: "rh_kling_o1_generation_mode",
      values: Object.freeze(["reference", "edit"])
    })
  };
  return Object.freeze({
    id: _0x41d6e8,
    kind: _0x147253,
    label: _0x2c9628,
    description: _0x2e9c44,
    displayOrder: _0x366461,
    ..._0x5dd03f
  });
}
export const RUNNINGHUB_KLING_O1_FIXED_INPUT_SLOTS = Object.freeze([createRunningHubKlingO1FixedSlot({
  id: "firstFrame",
  kind: "image",
  label: "首帧",
  mode: "frame",
  displayOrder: 10,
  description: "图生视频或首尾帧使用的起始图片"
}), createRunningHubKlingO1FixedSlot({
  id: "lastFrame",
  kind: "image",
  label: "尾帧",
  mode: "frame",
  displayOrder: 20,
  description: "可选，首尾帧使用的结束图片"
}), createRunningHubKlingO1FixedSlot({
  id: "editVideo",
  kind: "video",
  label: "编辑视频",
  mode: "edit",
  displayOrder: 30,
  description: "官方 edit-video 使用的原视频"
}), createRunningHubKlingO1FixedSlot({
  id: "referenceVideo",
  kind: "video",
  label: "参考视频",
  mode: "reference",
  displayOrder: 40,
  description: "参考生视频必填，作为动作或镜头特征参考"
}), createRunningHubKlingO1FixedSlot({
  id: "referenceImage",
  kind: "image",
  label: "参考图",
  mode: "reference",
  displayOrder: 50,
  description: "参考生视频使用，支持 1-7 张参考图"
})]);
export const RUNNINGHUB_KLING_O3_MODEL_FIELD = Object.freeze({
  ...KLING_V3_MODE_FIELD,
  id: "resolution",
  placement: "resolution",
  label: "质量",
  description: "720P=std，1080P=pro，4K=4K 版。",
  defaultValue: "std"
});
export const RUNNINGHUB_KLING_O3_MODE_FIELD = Object.freeze({
  ...KLING_V3_OMNI_MODE_FIELD,
  description: "视频生成：支持文生、图生、首尾帧。\n参考生视频：接 1-7 张参考图，可选 1 个参考视频。\n视频编辑：基于原视频编辑，std/pro 可用。"
});
export const RUNNINGHUB_KLING_O3_RATIO_FIELD = Object.freeze({
  ...createAspectRatioField({
    options: ["16:9", "9:16", "1:1"]
  }),
  hideWhen: Object.freeze({
    field: "kling_v3_omni_mode",
    value: "edit"
  })
});
export const RUNNINGHUB_KLING_O3_DURATION_FIELD = Object.freeze({
  ...createFooterDurationField({
    defaultValue: 5,
    min: 3,
    max: 15
  }),
  hideWhen: Object.freeze({
    field: "kling_v3_omni_mode",
    value: "edit"
  })
});
export const RUNNINGHUB_KLING_O3_AUDIO_FIELD = Object.freeze({
  ...KLING_V3_AUDIO_FIELD,
  hideWhen: Object.freeze({
    field: "kling_v3_omni_mode",
    value: "edit"
  })
});
export const RUNNINGHUB_KLING_O3_KEEP_ORIGINAL_SOUND_FIELD = Object.freeze({
  ...KLING_O1_KEEP_ORIGINAL_SOUND_FIELD,
  showWhen: Object.freeze({
    field: "kling_v3_omni_mode",
    values: Object.freeze(["reference", "edit"])
  })
});
export const RUNNINGHUB_KLING_O3_SHOT_TYPE_FIELD = Object.freeze({
  id: "shotType",
  type: "segmented",
  placement: "advanced",
  variant: "advancedRow",
  label: "镜头类型",
  defaultValue: "customize",
  options: Object.freeze([Object.freeze({
    value: "customize",
    label: "自定义"
  }), Object.freeze({
    value: "intelligence",
    label: "智能"
  })]),
  hideWhen: Object.freeze({
    field: "kling_v3_omni_mode",
    value: "edit"
  })
});
export const RUNNINGHUB_KLING_O3_FRAME_HELP_TOOLTIP = ["RunningHub Kling O3 视频生成", "[[red:不接图]]：走文生视频接口。", "[[red:接 1 张首帧]]：走图生视频接口。", "[[red:接首帧 + 尾帧]]：std/pro 走首尾帧图生视频；4K 文档只公开首帧字段，暂只使用首帧。", "标准版 / 专业版 / 4K 可在模型选择里切换。"].join("\n");
export const RUNNINGHUB_KLING_O3_REFERENCE_HELP_TOOLTIP = ["RunningHub Kling O3 参考生视频", "[[red:接 1-7 张参考图]]：用于保持主体、风格或场景一致。", "[[red:可选参考视频]]：有参考视频时最多使用 4 张参考图。", "[[red:保留原声]]：开启后提交 keepOriginalSound。"].join("\n");
export const RUNNINGHUB_KLING_O3_EDIT_HELP_TOOLTIP = ["RunningHub Kling O3 视频编辑", "[[red:接 1 个原视频]]：基于原视频按提示词编辑画面。", "[[red:可选参考图]]：用于补充目标风格、主体或局部参考。", "[[red:4K 不支持编辑]]：请选择标准版或专业版。"].join("\n");
export const RUNNINGHUB_KLING_O3_HELP_TOOLTIP = RUNNINGHUB_KLING_O3_FRAME_HELP_TOOLTIP;
export const RUNNINGHUB_KLING_O3_FRAME_PROMPT_PLACEHOLDER = "不接素材时描述文生视频；接首帧/尾帧时可用 @图片1 / @图片2 指代。例如：让 @图片1 中的人物向镜头挥手，随后过渡到 @图片2 的街景。";
export const RUNNINGHUB_KLING_O3_REFERENCE_PROMPT_PLACEHOLDER = "描述参考图或参考视频要生成的新画面。例如：参考 @图片1 的角色外观和 @视频1 的动作节奏，生成夜晚街道行走镜头。";
export const RUNNINGHUB_KLING_O3_EDIT_PROMPT_PLACEHOLDER = "描述要对原视频做什么编辑，可接参考图补充风格。例如：将原视频改成夜晚赛博朋克街道风格，保留人物动作和镜头节奏。";
export function createRunningHubKlingO3FixedSlot({
  id: _0x3046fc,
  kind: _0x45e773,
  label: _0x3edf2e,
  mode: _0xe828b,
  description: _0x5cb9f3,
  displayOrder: _0x504693,
  hideWhen = null
}) {
  return Object.freeze({
    id: _0x3046fc,
    kind: _0x45e773,
    label: _0x3edf2e,
    description: _0x5cb9f3,
    displayOrder: _0x504693,
    showWhen: Object.freeze({
      field: "kling_v3_omni_mode",
      value: _0xe828b
    }),
    ...(hideWhen ? {
      hideWhen: Object.freeze(hideWhen)
    } : {})
  });
}
export const RUNNINGHUB_KLING_O3_FIXED_INPUT_SLOTS = Object.freeze([createRunningHubKlingO3FixedSlot({
  id: "firstFrame",
  kind: "image",
  label: "首帧",
  mode: "image",
  displayOrder: 10,
  description: "图生视频使用的起始图片"
}), createRunningHubKlingO3FixedSlot({
  id: "lastFrame",
  kind: "image",
  label: "尾帧",
  mode: "image",
  displayOrder: 20,
  description: "可选，std/pro 首尾帧使用的结束图片",
  hideWhen: {
    field: "resolution",
    value: "4k"
  }
}), createRunningHubKlingO3FixedSlot({
  id: "referenceVideo",
  kind: "video",
  label: "参考视频",
  mode: "reference",
  displayOrder: 30,
  description: "参考生视频可选，作为动作或镜头特征参考"
}), createRunningHubKlingO3FixedSlot({
  id: "referenceImage",
  kind: "image",
  label: "参考图",
  mode: "reference",
  displayOrder: 40,
  description: "参考生视频使用，支持 1-7 张参考图"
}), createRunningHubKlingO3FixedSlot({
  id: "editVideo",
  kind: "video",
  label: "原视频",
  mode: "edit",
  displayOrder: 50,
  description: "视频编辑必填，作为待编辑原视频"
}), createRunningHubKlingO3FixedSlot({
  id: "editRefImage",
  kind: "image",
  label: "参考图",
  mode: "edit",
  displayOrder: 60,
  description: "视频编辑可选，用于补充风格或主体参考"
})]);
export const RUNNINGHUB_KLING_V3_PROMPT_PLACEHOLDER = "不接素材时描述文生视频；接首帧或首尾帧时描述动作、运镜和过渡。4K 图生当前只使用首帧。";
export const RUNNINGHUB_KLING_V3_HELP_TOOLTIP = ["RunningHub Kling V3.0", "[[red:不接图]]：走文生视频接口。", "[[red:接 1 张首帧]]：走图生视频接口。", "[[red:接首帧 + 尾帧]]：std/pro 走首尾帧图生视频；4K 文档只公开 imageUrl，暂只使用首帧。", "版本选择对应 RunningHub 的 std / pro / 4K endpoint。"].join("\n");
export const RUNNINGHUB_KLING_V3_MODEL_FIELD = Object.freeze({
  ...KLING_V3_MODE_FIELD,
  label: "模型选择",
  description: "std=720P，pro=1080P，4K=Kling V3.0 4K。"
});
export const RUNNINGHUB_KLING_V3_RATIO_FIELD = Object.freeze({
  ...createAspectRatioField({
    options: ["16:9", "9:16", "1:1"]
  })
});
export const RUNNINGHUB_KLING_V3_CFG_SCALE_FIELD = Object.freeze({
  id: "cfgScale",
  type: "slider",
  placement: "advanced",
  variant: "advancedRow",
  label: "CFG 引导系数",
  description: "RunningHub Kling V3.0 支持 0-1，默认 0.5。",
  defaultValue: 0.5,
  min: 0,
  max: 1,
  step: 0.1
});
export const RUNNINGHUB_KLING_V3_SHOT_TYPE_FIELD = Object.freeze({
  id: "shotType",
  type: "segmented",
  placement: "advanced",
  variant: "advancedRow",
  label: "镜头类型",
  defaultValue: "customize",
  options: Object.freeze([Object.freeze({
    value: "customize",
    label: "自定义"
  }), Object.freeze({
    value: "intelligence",
    label: "智能"
  })])
});
export const RUNNINGHUB_KLING_V3_FIXED_INPUT_SLOTS = Object.freeze([Object.freeze({
  id: "firstFrame",
  kind: "image",
  label: "首帧",
  description: "图生视频使用的起始图片。",
  displayOrder: 10
}), Object.freeze({
  id: "lastFrame",
  kind: "image",
  label: "尾帧",
  description: "std/pro 可选，4K 当前文档未公开尾帧字段。",
  displayOrder: 20,
  hideWhen: Object.freeze({
    field: "resolution",
    value: "4k"
  })
})]);
export const WAN27_MODE_FIELD = Object.freeze({
  id: "wan27_mode",
  type: "segmented",
  placement: "mode",
  variant: "sectionMenu",
  label: "模式选择",
  description: WAN27_HELP_TOOLTIP,
  defaultValue: "image",
  options: Object.freeze([Object.freeze({
    value: "image",
    label: "图生视频"
  }), Object.freeze({
    value: "video",
    label: "视频续写"
  }), Object.freeze({
    value: "reference",
    label: "参考生视频"
  }), Object.freeze({
    value: "edit",
    label: "视频编辑"
  })])
});
export const WAN27_PROMPT_EXTEND_FIELD = Object.freeze({
  ...VIDEO_PROMPT_EXTEND_FIELD,
  label: "prompt 智能改写"
});
export const WAN27_NEGATIVE_PROMPT_FIELD = Object.freeze({
  ...VIDEO_NEGATIVE_PROMPT_FIELD,
  label: "反向提示词",
  defaultValue: "模糊、变形、低质量"
});
export const VIDU_Q3_VIDEO_PROMPT_PLACEHOLDER = "不接图时描述文生视频；接 @图片1 是首帧，接 @图片1 + @图片2 是首尾帧。例如：@图片1 中的人物缓缓转身微笑，最后过渡到 @图片2 的构图。";
export const VIDU_Q3_REFERENCE_PROMPT_PLACEHOLDER = "描述参考图的动作和镜头，外观由参考图决定。可用 @图片1、@图片2 指代素材。例如：@图片1 和 @图片2 中的角色在湖边相拥，镜头缓慢环绕。";
export function createWan27FixedSlot({
  id: _0x134190,
  kind: _0x1cd130,
  label: _0x4b918e,
  mode: _0x31f5cc,
  description: _0x25892a,
  displayOrder: _0x12f857,
  showWhen: _0x23301d
}) {
  const _0x530cc2 = Array.isArray(_0x31f5cc) ? _0x31f5cc.map(_0x39f8ca => String(_0x39f8ca || "").trim()).filter(Boolean) : [String(_0x31f5cc || "").trim()].filter(Boolean);
  const _0x1a1bda = [];
  _0x1a1bda.push(_0x530cc2.length > 1 ? Object.freeze({
    field: "wan27_mode",
    values: Object.freeze(_0x530cc2)
  }) : Object.freeze({
    field: "wan27_mode",
    value: _0x530cc2[0] || ""
  }));
  const _0x56cbed = _0x23301d || (_0x1a1bda.length > 1 ? Object.freeze({
    all: Object.freeze(_0x1a1bda)
  }) : _0x1a1bda[0]);
  return Object.freeze({
    id: _0x134190,
    kind: _0x1cd130,
    label: _0x4b918e,
    description: _0x25892a,
    displayOrder: _0x12f857,
    showWhen: _0x56cbed
  });
}
export const WAN27_FIXED_INPUT_SLOTS = Object.freeze([createWan27FixedSlot({
  id: "firstFrame",
  kind: "image",
  label: "首帧",
  mode: "image",
  displayOrder: 10,
  description: "图生视频使用的首帧图片"
}), createWan27FixedSlot({
  id: "lastFrame",
  kind: "image",
  label: "尾帧",
  mode: "image",
  displayOrder: 20,
  description: "可选，图生视频使用的尾帧图片"
}), createWan27FixedSlot({
  id: "audio",
  kind: "audio",
  label: "音频",
  mode: "image",
  displayOrder: 70,
  description: "可选，2-30 秒且不超过 15MB"
}), createWan27FixedSlot({
  id: "sourceVideo",
  kind: "video",
  label: "续写视频",
  mode: "video",
  displayOrder: 30,
  description: "视频续写使用，不能超过 10 秒"
}), createWan27FixedSlot({
  id: "referenceImage",
  kind: "image",
  label: "参考图",
  mode: "reference",
  displayOrder: 40,
  description: "参考生视频使用的参考图片"
}), createWan27FixedSlot({
  id: "referenceVideo",
  kind: "video",
  label: "参考视频",
  mode: Object.freeze(["reference", "edit"]),
  displayOrder: 60,
  description: "参考生视频使用的参考视频"
}), createWan27FixedSlot({
  id: "originalVideo",
  kind: "video",
  label: "原视频",
  mode: "edit",
  displayOrder: 50,
  description: "视频编辑使用的原视频，需为 2-10 秒"
}), createWan27FixedSlot({
  id: "referenceAudio",
  kind: "audio",
  label: "音频",
  mode: "reference",
  displayOrder: 70,
  description: "可选，参考生视频使用的音色音频，2-30 秒且不超过 15MB"
})]);
export const RUNNINGHUB_WAN27_FIXED_INPUT_SLOTS = Object.freeze([createWan27FixedSlot({
  id: "firstFrame",
  kind: "image",
  label: "首帧",
  mode: "image",
  displayOrder: 10,
  description: "图生视频使用的首帧图片"
}), createWan27FixedSlot({
  id: "lastFrame",
  kind: "image",
  label: "尾帧",
  mode: "image",
  displayOrder: 20,
  description: "可选，图生视频使用的尾帧图片"
}), createWan27FixedSlot({
  id: "audio",
  kind: "audio",
  label: "音频",
  mode: Object.freeze(["image", "video"]),
  displayOrder: 70,
  description: "可选，文生、图生或视频续写使用的音频"
}), createWan27FixedSlot({
  id: "sourceVideo",
  kind: "video",
  label: "续写视频",
  mode: "video",
  displayOrder: 30,
  description: "视频续写使用，不能超过 10 秒"
}), createWan27FixedSlot({
  id: "referenceImage",
  kind: "image",
  label: "参考图",
  mode: "reference",
  displayOrder: 40,
  description: "参考生视频使用的参考图片"
}), createWan27FixedSlot({
  id: "referenceVideo",
  kind: "video",
  label: "参考视频",
  mode: "reference",
  displayOrder: 50,
  description: "参考生视频使用的参考视频"
}), createWan27FixedSlot({
  id: "originalVideo",
  kind: "video",
  label: "原视频",
  mode: "edit",
  displayOrder: 50,
  description: "视频编辑使用的原视频，需为 2-10 秒"
}), createWan27FixedSlot({
  id: "editRefImage",
  kind: "image",
  label: "参考图",
  mode: "edit",
  displayOrder: 60,
  description: "视频编辑可选参考图，最多 3 张"
})]);
export function freezeOption(_0x5846b2) {
  if (_0x5846b2 && typeof _0x5846b2 === "object" && !Array.isArray(_0x5846b2)) {
    return Object.freeze({
      ..._0x5846b2
    });
  }
  return Object.freeze({
    value: _0x5846b2,
    label: String(_0x5846b2)
  });
}
export function isAdaptiveRatioOptionValue(_0x2d8314) {
  const _0x56392d = String(_0x2d8314 ?? "").trim();
  const _0x1f55cf = _0x56392d.toLowerCase();
  return _0x56392d === APIMART_VIDEO_ADAPTIVE_RATIO_VALUE || _0x1f55cf === "auto" || _0x1f55cf === "adaptive" || _0x1f55cf === "default";
}
export function withAdaptiveRatioOption(_0x6399f8 = []) {
  const _0x1e085b = Array.isArray(_0x6399f8) ? _0x6399f8 : [];
  const _0x201046 = _0x1e085b.some(_0x2798e2 => isAdaptiveRatioOptionValue(_0x2798e2?.value ?? _0x2798e2));
  if (_0x201046) {
    return _0x1e085b;
  } else {
    return [APIMART_VIDEO_ADAPTIVE_RATIO_OPTION, ..._0x1e085b];
  }
}
export function createSegmentedField({
  id: _0x489fb5,
  label: _0x2becf6,
  defaultValue: _0xcdcec7,
  options: _0x5566e3,
  placement = "mode",
  variant = "pillMenu"
}) {
  return Object.freeze({
    id: _0x489fb5,
    type: "segmented",
    placement: placement,
    variant: variant,
    label: _0x2becf6,
    defaultValue: _0xcdcec7,
    options: Object.freeze(_0x5566e3.map(freezeOption))
  });
}
export function createDurationField({
  defaultValue = 5,
  min = 4,
  max = 15,
  label = VIDEO_DURATION_FIELD.label
} = {}) {
  return Object.freeze({
    ...VIDEO_DURATION_FIELD,
    label: label,
    defaultValue: defaultValue,
    min: min,
    max: max
  });
}
export function createDurationSliderOptionsField({
  values: _0x3ec17b,
  defaultValue = _0x3ec17b?.[0],
  label = VIDEO_DURATION_FIELD.label,
  optionOverridesByValue = null
} = {}) {
  const _0x106fe8 = (Array.isArray(_0x3ec17b) ? _0x3ec17b : []).map(_0x357637 => Number(_0x357637)).filter(Number.isFinite);
  const _0x23d5b6 = _0x106fe8[0] ?? Number(defaultValue) ?? 1;
  const _0x4a66e3 = _0x106fe8[_0x106fe8.length - 1] ?? _0x23d5b6;
  return Object.freeze({
    ...VIDEO_DURATION_FIELD,
    label: label,
    defaultValue: defaultValue,
    min: _0x23d5b6,
    max: _0x4a66e3,
    step: 1,
    options: Object.freeze(_0x106fe8.map(_0x312614 => Object.freeze({
      value: _0x312614,
      label: _0x312614 + "s",
      displayLabel: _0x312614 + "S",
      ...(optionOverridesByValue?.[_0x312614] || {})
    })))
  });
}
export function createDurationOptionsField(_0x4f3bcf, _0x1fa01b = _0x4f3bcf[0]) {
  return createSegmentedField({
    id: "duration",
    label: VIDEO_DURATION_FIELD.label,
    defaultValue: _0x1fa01b,
    options: _0x4f3bcf.map(_0xa5e1 => ({
      value: _0xa5e1,
      label: _0xa5e1 + "s",
      displayLabel: _0xa5e1 + "S"
    }))
  });
}
export function withResolutionPlacement(_0x4fd2b4) {
  return Object.freeze({
    ..._0x4fd2b4,
    placement: "resolution"
  });
}
export function createFooterDurationField(_0x56d853 = {}) {
  return withResolutionPlacement(createDurationField(_0x56d853));
}
export function createFooterDurationSliderOptionsField(_0x939faa = {}) {
  return withResolutionPlacement(createDurationSliderOptionsField(_0x939faa));
}
export function createResolutionField({
  label = VIDEO_RESOLUTION_FIELD.label,
  defaultValue = "720P",
  options = ["720P", "1080P"]
} = {}) {
  return Object.freeze({
    ...VIDEO_RESOLUTION_FIELD,
    label: label,
    defaultValue: defaultValue,
    options: Object.freeze(options.map(freezeOption))
  });
}
export function createAspectRatioField({
  label = VIDEO_RATIO_FIELD.label,
  defaultValue = APIMART_VIDEO_ADAPTIVE_RATIO_VALUE,
  options = ["16:9", "9:16", "1:1", "4:3", "3:4"]
} = {}) {
  return Object.freeze({
    ...VIDEO_RATIO_FIELD,
    label: label,
    defaultValue: defaultValue,
    options: Object.freeze(withAdaptiveRatioOption(options).map(freezeOption))
  });
}
export function createVideoMenuExtension(_0x5b404e, _0x1a64fd = "") {
  return Object.freeze({
    videoMenu: Object.freeze({
      role: "apimartModel",
      order: _0x5b404e,
      subtitle: _0x1a64fd
    })
  });
}
function freezeVideoInputPolicyCondition(_0x464212) {
  if (Array.isArray(_0x464212)) {
    return Object.freeze(_0x464212.map(freezeVideoInputPolicyCondition));
  }
  if (!_0x464212 || typeof _0x464212 !== "object") {
    return _0x464212;
  }
  return Object.freeze({
    ..._0x464212,
    ...(Array.isArray(_0x464212.any) ? {
      any: freezeVideoInputPolicyCondition(_0x464212.any)
    } : {}),
    ...(Array.isArray(_0x464212.all) ? {
      all: freezeVideoInputPolicyCondition(_0x464212.all)
    } : {}),
    ...(Array.isArray(_0x464212.values) ? {
      values: Object.freeze([..._0x464212.values])
    } : {})
  });
}
export function createVideoInputSlots({
  image = 9,
  video = 3,
  audio = 3,
  minImage = 0,
  fixedSlots = null,
  exclusiveGroups = null,
  cycleFixedInputWhenFull = false,
  preserveHiddenInputsByKind = false,
  preserveHiddenInputsByKindFields = null,
  maxTotalDurationSecondsByKind = null,
  mediaConstraintsByKind = null,
  policyVariants = null
} = {}) {
  const _0x452ffc = ["text"];
  const _0x258562 = {};
  if (image > 0) {
    _0x452ffc.push("image");
    _0x258562.image = image;
  }
  if (video > 0) {
    _0x452ffc.push("video");
    _0x258562.video = video;
  }
  if (audio > 0) {
    _0x452ffc.push("audio");
    _0x258562.audio = audio;
  }
  const _0x44d8fa = {
    allowedKinds: Object.freeze(_0x452ffc),
    minByKind: Object.freeze({
      text: 0,
      ...(minImage > 0 ? {
        image: minImage
      } : {})
    }),
    maxByKind: Object.freeze(_0x258562)
  };
  if (Array.isArray(fixedSlots) && fixedSlots.length > 0) {
    _0x44d8fa.fixedSlots = Object.freeze(fixedSlots.map(_0x53cb39 => Object.freeze({
      ..._0x53cb39
    })));
  }
  if (Array.isArray(exclusiveGroups) && exclusiveGroups.length > 0) {
    _0x44d8fa.exclusiveGroups = Object.freeze(exclusiveGroups.map(_0x333e0e => Object.freeze({
      ..._0x333e0e,
      slots: Object.freeze((Array.isArray(_0x333e0e?.slots) ? _0x333e0e.slots : []).map(_0x52db75 => String(_0x52db75 || "").trim()).filter(Boolean))
    })));
  }
  if (cycleFixedInputWhenFull === true) {
    _0x44d8fa.cycleFixedInputWhenFull = true;
  }
  if (preserveHiddenInputsByKind === true) {
    _0x44d8fa.preserveHiddenInputsByKind = true;
    const _0x2711d2 = Array.from(new Set((Array.isArray(preserveHiddenInputsByKindFields) ? preserveHiddenInputsByKindFields : []).map(_0x43011b => String(_0x43011b || "").trim()).filter(Boolean)));
    if (_0x2711d2.length > 0) {
      _0x44d8fa.preserveHiddenInputsByKindFields = Object.freeze(_0x2711d2);
    }
  }
  if (maxTotalDurationSecondsByKind && typeof maxTotalDurationSecondsByKind === "object" && !Array.isArray(maxTotalDurationSecondsByKind)) {
    _0x44d8fa.maxTotalDurationSecondsByKind = Object.freeze({
      ...maxTotalDurationSecondsByKind
    });
  }
  if (mediaConstraintsByKind && typeof mediaConstraintsByKind === "object" && !Array.isArray(mediaConstraintsByKind)) {
    _0x44d8fa.mediaConstraintsByKind = Object.freeze(Object.fromEntries(Object.entries(mediaConstraintsByKind).map(([_0x4d2c36, _0x5328fb]) => [_0x4d2c36, Object.freeze({
      ..._0x5328fb,
      ...(Array.isArray(_0x5328fb?.allowedExtensions) ? {
        allowedExtensions: Object.freeze([..._0x5328fb.allowedExtensions])
      } : {})
    })])));
  }
  if (Array.isArray(policyVariants) && policyVariants.length > 0) {
    _0x44d8fa.policyVariants = Object.freeze(policyVariants.map(_0x2132c2 => Object.freeze({
      ..._0x2132c2,
      when: freezeVideoInputPolicyCondition(_0x2132c2?.when),
      allowedKinds: Object.freeze([...(_0x2132c2?.allowedKinds || [])]),
      maxByKind: Object.freeze({
        ...(_0x2132c2?.maxByKind || {})
      })
    })));
  }
  return Object.freeze(_0x44d8fa);
}
export const VIDEO_SIZE_RATIO_POLICY = Object.freeze({
  capability: "size"
});
export const SEEDANCE_VIDEO_RATIO_POLICY = Object.freeze({
  capability: "size",
  ratios: Object.freeze(["1:1", "3:4", "16:9", "4:3", "9:16", "21:9"])
});
export const VOLCENGINE_SEEDANCE_VIDEO_RATIO_POLICY = Object.freeze({
  ...SEEDANCE_VIDEO_RATIO_POLICY,
  preserveAdaptive: true
});
export function freezeBodyMapping(_0x270382) {
  return Object.freeze(_0x270382.map(_0x1eae7b => Object.freeze({
    ..._0x1eae7b,
    ...(Array.isArray(_0x1eae7b.field) ? {
      field: Object.freeze(_0x1eae7b.field)
    } : {})
  })));
}
export const APIMART_VIDEO_BASE_BODY_MAPPING = Object.freeze([Object.freeze({
  path: "model",
  from: "model"
}), Object.freeze({
  path: "prompt",
  from: "prompt"
})]);
export function createApimartVideoBodyMapping(_0x4d4dc = []) {
  return freezeBodyMapping([...APIMART_VIDEO_BASE_BODY_MAPPING, ..._0x4d4dc]);
}
export const APIMART_VIDEO_LEGACY_BODY_MAPPING = Object.freeze([Object.freeze({
  path: "model",
  from: "model"
}), Object.freeze({
  path: "prompt",
  from: "prompt"
}), Object.freeze({
  path: "size",
  from: "param",
  field: Object.freeze(["generationParams.aspectRatio", "aspectRatio", "size"]),
  defaultValue: APIMART_VIDEO_ADAPTIVE_RATIO_VALUE,
  transform: "apimartVideoRatio",
  omitWhenEmpty: true
}), Object.freeze({
  path: "quality",
  from: "param",
  field: "videoSize",
  defaultValue: "standard"
}), Object.freeze({
  path: "duration",
  from: "param",
  field: "duration",
  omitWhenEmpty: true
}), Object.freeze({
  path: "resolution",
  from: "param",
  field: "resolution",
  omitWhenEmpty: true
}), Object.freeze({
  path: "image_urls",
  from: "inputImages",
  omitWhenEmpty: true
}), Object.freeze({
  path: "video_url",
  from: "inputVideos",
  transform: "first",
  omitWhenEmpty: true
})]);
export const APIMART_VIDEO_ASPECT_RATIO_ENTRY = Object.freeze({
  path: "aspect_ratio",
  from: "param",
  field: Object.freeze(["generationParams.aspectRatio", "aspectRatio", "aspect_ratio"]),
  defaultValue: APIMART_VIDEO_ADAPTIVE_RATIO_VALUE,
  transform: "apimartVideoRatio",
  omitWhenEmpty: true
});
export const APIMART_VIDEO_SIZE_ENTRY = Object.freeze({
  path: "size",
  from: "param",
  field: Object.freeze(["generationParams.aspectRatio", "aspectRatio", "size"]),
  defaultValue: APIMART_VIDEO_ADAPTIVE_RATIO_VALUE,
  transform: "apimartVideoRatio",
  omitWhenEmpty: true
});
export const APIMART_VIDEO_DURATION_ENTRY = Object.freeze({
  path: "duration",
  from: "param",
  field: Object.freeze(["generationParams.duration", "duration"]),
  omitWhenEmpty: true
});
export const APIMART_VIDEO_RESOLUTION_UPPER_ENTRY = Object.freeze({
  path: "resolution",
  from: "param",
  field: Object.freeze(["generationParams.resolution", "resolution"]),
  defaultValue: "720P",
  transform: "apimartVideoResolutionUpper"
});
export const APIMART_VIDEO_RESOLUTION_UPPER_1080_ENTRY = Object.freeze({
  ...APIMART_VIDEO_RESOLUTION_UPPER_ENTRY,
  defaultValue: "1080P"
});
export const APIMART_VIDEO_RESOLUTION_LOWER_ENTRY = Object.freeze({
  path: "resolution",
  from: "param",
  field: Object.freeze(["generationParams.resolution", "resolution"]),
  defaultValue: "720p",
  transform: "apimartVideoResolutionLower"
});
export const APIMART_VIDEO_RESOLUTION_VEO3_ENTRY = Object.freeze({
  path: "resolution",
  from: "param",
  field: Object.freeze(["generationParams.resolution", "resolution"]),
  defaultValue: "720p",
  transform: "apimartVeo3VideoResolution"
});
export const APIMART_VIDEO_RESOLUTION_4K_ENTRY = Object.freeze({
  ...APIMART_VIDEO_RESOLUTION_VEO3_ENTRY
});
export const APIMART_VIDEO_RESOLUTION_VIDU_ENTRY = Object.freeze({
  path: "resolution",
  from: "param",
  field: Object.freeze(["generationParams.resolution", "resolution"]),
  defaultValue: "720p",
  transform: "apimartViduVideoResolution"
});
export const APIMART_VIDEO_IMAGE_URLS_ENTRY = Object.freeze({
  path: "image_urls",
  from: "inputImages",
  omitWhenEmpty: true
});
export const APIMART_VIDEO_VEO3_IMAGE_URLS_ENTRY = Object.freeze({
  path: "image_urls",
  from: "inputImages",
  omitWhenEmpty: true
});
export const APIMART_VIDEO_AUDIO_URL_ENTRY = Object.freeze({
  path: "audio_url",
  from: "inputAudios",
  transform: "first",
  omitWhenEmpty: true
});
export const APIMART_VIDEO_NEGATIVE_PROMPT_ENTRY = Object.freeze({
  path: "negative_prompt",
  from: "param",
  field: Object.freeze(["generationParams.negative_prompt", "negative_prompt"]),
  transform: "apimartOptionalText",
  omitWhenEmpty: true
});
export const APIMART_VIDEO_SEED_ENTRY = Object.freeze({
  path: "seed",
  from: "param",
  field: Object.freeze(["generationParams.seed", "seed"]),
  transform: "apimartOptionalInteger",
  omitWhenEmpty: true
});
export const APIMART_VIDEO_AUDIO_ENTRY = Object.freeze({
  path: "audio",
  from: "param",
  field: Object.freeze(["generationParams.audio", "audio"]),
  defaultValue: false,
  transform: "booleanParam"
});
export const APIMART_VIDEO_KEEP_ORIGINAL_SOUND_ENTRY = Object.freeze({
  path: "keep_original_sound",
  from: "param",
  field: Object.freeze(["generationParams.keep_original_sound", "keep_original_sound"]),
  defaultValue: false,
  transform: "booleanParam"
});
export const APIMART_VIDEO_AUDIO_TRUE_ENTRY = Object.freeze({
  ...APIMART_VIDEO_AUDIO_ENTRY,
  defaultValue: true
});
export const APIMART_VIDEO_WATERMARK_ENTRY = Object.freeze({
  path: "watermark",
  from: "param",
  field: Object.freeze(["generationParams.watermark", "watermark"]),
  defaultValue: false,
  transform: "booleanParam"
});
export const APIMART_VIDEO_PROMPT_EXTEND_ENTRY = Object.freeze({
  path: "prompt_extend",
  from: "param",
  field: Object.freeze(["generationParams.prompt_extend", "prompt_extend"]),
  defaultValue: true,
  transform: "booleanParam"
});
export const APIMART_VIDEO_ENABLE_GIF_ENTRY = Object.freeze({
  path: "enable_gif",
  from: "param",
  field: Object.freeze(["generationParams.enable_gif", "enable_gif"]),
  defaultValue: false,
  transform: "booleanParam"
});
export const APIMART_VIDEO_PROMPT_OPTIMIZER_ENTRY = Object.freeze({
  path: "prompt_optimizer",
  from: "param",
  field: Object.freeze(["generationParams.prompt_optimizer", "prompt_optimizer"]),
  defaultValue: true,
  transform: "booleanParam"
});
export const APIMART_VIDEO_FAST_PRETREATMENT_ENTRY = Object.freeze({
  path: "fast_pretreatment",
  from: "param",
  field: Object.freeze(["generationParams.fast_pretreatment", "fast_pretreatment"]),
  defaultValue: false,
  transform: "booleanParam"
});
export const APIMART_VIDEO_GENERATION_TYPE_ENTRY = Object.freeze({
  path: "generation_type",
  from: "param",
  field: Object.freeze(["generationParams.generation_type", "generation_type"]),
  defaultValue: "frame",
  omitWhenEmpty: true
});
export const APIMART_VIDEO_SHOT_TYPE_ENTRY = Object.freeze({
  path: "shot_type",
  from: "param",
  field: Object.freeze(["generationParams.shot_type", "shot_type"]),
  defaultValue: "single"
});
export const APIMART_VIDEO_VEO3_BODY_MAPPING = createApimartVideoBodyMapping([APIMART_VIDEO_ASPECT_RATIO_ENTRY, APIMART_VIDEO_GENERATION_TYPE_ENTRY, APIMART_VIDEO_DURATION_ENTRY, APIMART_VIDEO_RESOLUTION_VEO3_ENTRY, APIMART_VIDEO_VEO3_IMAGE_URLS_ENTRY, APIMART_VIDEO_ENABLE_GIF_ENTRY]);
export const APIMART_VIDEO_HAILUO_02_BODY_MAPPING = createApimartVideoBodyMapping([Object.freeze({
  path: "resolution",
  from: "param",
  field: Object.freeze(["generationParams.resolution", "resolution"]),
  defaultValue: "768p",
  transform: "apimartHailuoVideoResolution"
}), Object.freeze({
  path: "duration",
  from: "param",
  field: Object.freeze(["generationParams.duration", "duration"]),
  defaultValue: 5,
  transform: "apimartHailuoVideoDuration"
}), Object.freeze({
  path: "first_frame_image",
  from: "inputImages",
  transform: "first",
  omitWhenEmpty: true
}), Object.freeze({
  path: "last_frame_image",
  from: "inputImages",
  transform: "second",
  omitWhenEmpty: true
}), APIMART_VIDEO_PROMPT_OPTIMIZER_ENTRY, APIMART_VIDEO_FAST_PRETREATMENT_ENTRY, APIMART_VIDEO_WATERMARK_ENTRY]);
export const APIMART_VIDEO_HAILUO_23_BODY_MAPPING = createApimartVideoBodyMapping([Object.freeze({
  path: "resolution",
  from: "param",
  field: Object.freeze(["generationParams.resolution", "resolution"]),
  defaultValue: "768p",
  transform: "apimartHailuo23VideoResolution"
}), Object.freeze({
  path: "duration",
  from: "param",
  field: Object.freeze(["generationParams.duration", "duration"]),
  defaultValue: 6,
  transform: "apimartHailuo23VideoDuration"
}), Object.freeze({
  path: "first_frame_image",
  from: "inputImages",
  transform: "first",
  omitWhenEmpty: true
}), APIMART_VIDEO_PROMPT_OPTIMIZER_ENTRY, APIMART_VIDEO_FAST_PRETREATMENT_ENTRY, APIMART_VIDEO_WATERMARK_ENTRY]);
export const APIMART_VIDEO_HAPPYHORSE_BODY_MAPPING = createApimartVideoBodyMapping([APIMART_VIDEO_SIZE_ENTRY, APIMART_VIDEO_DURATION_ENTRY, APIMART_VIDEO_RESOLUTION_UPPER_1080_ENTRY, APIMART_VIDEO_WATERMARK_ENTRY, APIMART_VIDEO_SEED_ENTRY]);
export const RUNNINGHUB_VIDEO_HAPPYHORSE_BODY_MAPPING = freezeBodyMapping([Object.freeze({
  path: "prompt",
  from: "prompt"
}), Object.freeze({
  path: "happyhorse_mode",
  from: "param",
  field: Object.freeze(["generationParams.happyhorse_mode", "happyhorse_mode"]),
  defaultValue: "auto"
}), Object.freeze({
  path: "resolution",
  from: "param",
  field: Object.freeze(["generationParams.resolution", "resolution"]),
  defaultValue: "1080P",
  transform: "runninghubHappyHorseResolution"
}), Object.freeze({
  path: "duration",
  from: "param",
  field: Object.freeze(["generationParams.duration", "duration"]),
  defaultValue: 5,
  transform: "runninghubHappyHorseDuration"
}), Object.freeze({
  path: "aspectRatio",
  from: "param",
  field: Object.freeze(["generationParams.aspectRatio", "aspectRatio"]),
  defaultValue: APIMART_VIDEO_ADAPTIVE_RATIO_VALUE,
  transform: "runninghubHappyHorseAspectRatio",
  omitWhenEmpty: true
}), Object.freeze({
  path: "audioSetting",
  from: "param",
  field: Object.freeze(["generationParams.audio_setting", "generationParams.audioSetting", "audio_setting", "audioSetting"]),
  defaultValue: "auto",
  transform: "runninghubHappyHorseAudioSetting",
  omitWhenEmpty: true
}), Object.freeze({
  path: "seed",
  from: "param",
  field: Object.freeze(["generationParams.seed", "seed"]),
  transform: "apimartOptionalInteger",
  omitWhenEmpty: true
})]);
export const RUNNINGHUB_VIDEO_SEEDANCE_2_BODY_MAPPING = freezeBodyMapping([Object.freeze({
  path: "prompt",
  from: "prompt"
}), Object.freeze({
  path: "rh_seedance_2_model",
  from: "param",
  field: Object.freeze(["generationParams.rh_seedance_2_model", "rh_seedance_2_model"]),
  defaultValue: "fast"
}), Object.freeze({
  path: "rh_seedance_2_mode",
  from: "param",
  field: Object.freeze(["generationParams.rh_seedance_2_mode", "rh_seedance_2_mode"]),
  defaultValue: "text2video"
}), Object.freeze({
  path: "resolution",
  from: "param",
  field: Object.freeze(["generationParams.resolution", "resolution"]),
  defaultValue: "720p",
  transform: "runninghubSeedance2Resolution"
}), Object.freeze({
  path: "duration",
  from: "param",
  field: Object.freeze(["generationParams.duration", "duration"]),
  defaultValue: 5,
  transform: "runninghubSeedance2Duration"
}), Object.freeze({
  path: "ratio",
  from: "param",
  field: Object.freeze(["generationParams.aspectRatio", "aspectRatio", "ratio"]),
  defaultValue: APIMART_VIDEO_ADAPTIVE_RATIO_VALUE,
  transform: "runninghubSeedance2Ratio"
}), Object.freeze({
  path: "generateAudio",
  from: "param",
  field: Object.freeze(["generationParams.generateAudio", "generateAudio"]),
  defaultValue: true,
  transform: "booleanParam"
}), Object.freeze({
  path: "webSearch",
  from: "param",
  field: Object.freeze(["generationParams.webSearch", "webSearch"]),
  defaultValue: false,
  transform: "booleanParam"
}), Object.freeze({
  path: "realPersonMode",
  from: "param",
  field: Object.freeze(["generationParams.realPersonMode", "realPersonMode"]),
  defaultValue: false,
  transform: "booleanParam"
}), Object.freeze({
  path: "conversionSlots",
  from: "constant",
  value: Object.freeze(["all"])
}), Object.freeze({
  path: "returnLastFrame",
  from: "param",
  field: Object.freeze(["generationParams.returnLastFrame", "returnLastFrame"]),
  defaultValue: false,
  transform: "booleanParam"
}), Object.freeze({
  path: "seed",
  from: "param",
  field: Object.freeze(["generationParams.seed", "seed"]),
  transform: "apimartOptionalInteger",
  omitWhenEmpty: true
})]);
export const APIMART_VIDEO_WAN27_BODY_MAPPING = createApimartVideoBodyMapping([APIMART_VIDEO_SIZE_ENTRY, APIMART_VIDEO_DURATION_ENTRY, APIMART_VIDEO_RESOLUTION_UPPER_1080_ENTRY, APIMART_VIDEO_IMAGE_URLS_ENTRY, APIMART_VIDEO_NEGATIVE_PROMPT_ENTRY, Object.freeze({
  path: "video_urls",
  from: "inputVideos",
  omitWhenEmpty: true
}), APIMART_VIDEO_AUDIO_URL_ENTRY, APIMART_VIDEO_PROMPT_EXTEND_ENTRY, APIMART_VIDEO_WATERMARK_ENTRY, APIMART_VIDEO_SEED_ENTRY]);
export const APIMART_VIDEO_KLING_4K_BODY_MAPPING = createApimartVideoBodyMapping([Object.freeze({
  path: "mode",
  from: "param",
  field: Object.freeze(["generationParams.mode", "mode"]),
  defaultValue: "std",
  transform: "apimartKlingVideoMode4k"
}), APIMART_VIDEO_DURATION_ENTRY, APIMART_VIDEO_ASPECT_RATIO_ENTRY, APIMART_VIDEO_IMAGE_URLS_ENTRY, APIMART_VIDEO_AUDIO_ENTRY, APIMART_VIDEO_WATERMARK_ENTRY, APIMART_VIDEO_NEGATIVE_PROMPT_ENTRY]);
export const APIMART_VIDEO_KLING_V3_BODY_MAPPING = createApimartVideoBodyMapping([Object.freeze({
  path: "mode",
  from: "param",
  field: Object.freeze(["generationParams.resolution", "resolution"]),
  defaultValue: "std",
  transform: "apimartKlingVideoMode4k"
}), APIMART_VIDEO_DURATION_ENTRY, APIMART_VIDEO_ASPECT_RATIO_ENTRY, APIMART_VIDEO_IMAGE_URLS_ENTRY, APIMART_VIDEO_AUDIO_ENTRY, APIMART_VIDEO_WATERMARK_ENTRY, APIMART_VIDEO_NEGATIVE_PROMPT_ENTRY]);
export const APIMART_VIDEO_KLING_O1_BODY_MAPPING = createApimartVideoBodyMapping([Object.freeze({
  path: "mode",
  from: "param",
  field: Object.freeze(["generationParams.resolution", "resolution"]),
  defaultValue: "std",
  transform: "apimartKlingVideoMode"
}), APIMART_VIDEO_DURATION_ENTRY, APIMART_VIDEO_ASPECT_RATIO_ENTRY, APIMART_VIDEO_IMAGE_URLS_ENTRY, APIMART_VIDEO_KEEP_ORIGINAL_SOUND_ENTRY]);
export const RUNNINGHUB_VIDEO_KLING_O1_BODY_MAPPING = freezeBodyMapping([Object.freeze({
  path: "prompt",
  from: "prompt"
}), Object.freeze({
  path: "rh_kling_o1_generation_mode",
  from: "param",
  field: Object.freeze(["generationParams.rh_kling_o1_generation_mode", "rh_kling_o1_generation_mode"]),
  defaultValue: "frame"
}), Object.freeze({
  path: "mode",
  from: "param",
  field: Object.freeze(["generationParams.resolution", "resolution"]),
  defaultValue: "std",
  transform: "runninghubKlingVideoMode"
}), Object.freeze({
  path: "aspectRatio",
  from: "param",
  field: Object.freeze(["generationParams.aspectRatio", "aspectRatio"]),
  defaultValue: "9:16",
  transform: "runninghubKlingO1AspectRatio"
}), Object.freeze({
  path: "duration",
  from: "param",
  field: Object.freeze(["generationParams.duration", "duration"]),
  defaultValue: 5,
  transform: "runninghubKlingO1Duration"
}), Object.freeze({
  path: "keepOriginalSound",
  from: "param",
  field: Object.freeze(["generationParams.keepOriginalSound", "generationParams.keep_original_sound", "keepOriginalSound", "keep_original_sound"]),
  defaultValue: false,
  transform: "booleanParam"
})]);
export const RUNNINGHUB_VIDEO_KLING_O3_BODY_MAPPING = freezeBodyMapping([Object.freeze({
  path: "prompt",
  from: "prompt"
}), Object.freeze({
  path: "kling_v3_omni_mode",
  from: "param",
  field: Object.freeze(["generationParams.kling_v3_omni_mode", "kling_v3_omni_mode"]),
  defaultValue: "image"
}), Object.freeze({
  path: "rh_kling_o3_model",
  from: "param",
  field: Object.freeze(["generationParams.resolution", "resolution"]),
  defaultValue: "std",
  transform: "runninghubKlingO3Model"
}), Object.freeze({
  path: "aspectRatio",
  from: "param",
  field: Object.freeze(["generationParams.aspectRatio", "aspectRatio"]),
  defaultValue: APIMART_VIDEO_ADAPTIVE_RATIO_VALUE,
  transform: "runninghubKlingO3AspectRatio",
  omitWhenEmpty: true
}), Object.freeze({
  path: "duration",
  from: "param",
  field: Object.freeze(["generationParams.duration", "duration"]),
  defaultValue: 5,
  transform: "runninghubKlingO3Duration"
}), Object.freeze({
  path: "sound",
  from: "param",
  field: Object.freeze(["generationParams.audio", "generationParams.sound", "audio", "sound"]),
  defaultValue: false,
  transform: "booleanParam"
}), Object.freeze({
  path: "keepOriginalSound",
  from: "param",
  field: Object.freeze(["generationParams.keepOriginalSound", "generationParams.keep_original_sound", "keepOriginalSound", "keep_original_sound"]),
  defaultValue: false,
  transform: "booleanParam"
}), Object.freeze({
  path: "multiShot",
  from: "param",
  field: Object.freeze(["generationParams.multiShot", "generationParams.multi_shot", "multiShot", "multi_shot"]),
  defaultValue: false,
  transform: "booleanParam"
}), Object.freeze({
  path: "shotType",
  from: "param",
  field: Object.freeze(["generationParams.shotType", "shotType"]),
  defaultValue: "customize",
  transform: "runninghubKlingO3ShotType"
})]);
export const RUNNINGHUB_VIDEO_KLING_V3_BODY_MAPPING = freezeBodyMapping([Object.freeze({
  path: "prompt",
  from: "prompt"
}), Object.freeze({
  path: "rh_kling_v3_model",
  from: "param",
  field: Object.freeze(["generationParams.resolution", "resolution"]),
  defaultValue: "std",
  transform: "runninghubKlingV3Model"
}), Object.freeze({
  path: "aspectRatio",
  from: "param",
  field: Object.freeze(["generationParams.aspectRatio", "aspectRatio"]),
  defaultValue: APIMART_VIDEO_ADAPTIVE_RATIO_VALUE,
  transform: "runninghubKlingV3AspectRatio",
  omitWhenEmpty: true
}), Object.freeze({
  path: "duration",
  from: "param",
  field: Object.freeze(["generationParams.duration", "duration"]),
  defaultValue: 5,
  transform: "runninghubKlingV3Duration"
}), Object.freeze({
  path: "cfgScale",
  from: "param",
  field: Object.freeze(["generationParams.cfgScale", "cfgScale"]),
  defaultValue: 0.5,
  transform: "runninghubKlingV3CfgScale"
}), Object.freeze({
  path: "sound",
  from: "param",
  field: Object.freeze(["generationParams.audio", "generationParams.sound", "audio", "sound"]),
  defaultValue: false,
  transform: "booleanParam"
}), Object.freeze({
  path: "multiShot",
  from: "param",
  field: Object.freeze(["generationParams.multiShot", "generationParams.multi_shot", "multiShot", "multi_shot"]),
  defaultValue: false,
  transform: "booleanParam"
}), Object.freeze({
  path: "shotType",
  from: "param",
  field: Object.freeze(["generationParams.shotType", "shotType"]),
  defaultValue: "customize",
  transform: "runninghubKlingV3ShotType"
}), Object.freeze({
  path: "negativePrompt",
  from: "param",
  field: Object.freeze(["generationParams.negative_prompt", "generationParams.negativePrompt", "negative_prompt", "negativePrompt"]),
  transform: "apimartOptionalText",
  omitWhenEmpty: true
})]);
export const RUNNINGHUB_VIDEO_VEO3_BODY_MAPPING = freezeBodyMapping([Object.freeze({
  path: "prompt",
  from: "prompt"
}), Object.freeze({
  path: "rh_veo3_channel",
  from: "param",
  field: Object.freeze(["generationParams.rh_veo3_channel", "rh_veo3_channel"]),
  defaultValue: "lowCost"
}), Object.freeze({
  path: "mode",
  from: "param",
  field: Object.freeze(["generationParams.mode", "mode"]),
  defaultValue: "fast"
}), Object.freeze({
  path: "generation_type",
  from: "param",
  field: Object.freeze(["generationParams.generation_type", "generation_type"]),
  defaultValue: "frame"
}), Object.freeze({
  path: "resolution",
  from: "param",
  field: Object.freeze(["generationParams.resolution", "resolution"]),
  defaultValue: "720p",
  transform: "runninghubVeo3Resolution"
}), Object.freeze({
  path: "aspectRatio",
  from: "param",
  field: Object.freeze(["generationParams.aspectRatio", "aspectRatio"]),
  defaultValue: APIMART_VIDEO_ADAPTIVE_RATIO_VALUE,
  transform: "runninghubVeo3AspectRatio",
  omitWhenEmpty: true
}), Object.freeze({
  path: "duration",
  from: "param",
  field: Object.freeze(["generationParams.duration", "duration"]),
  defaultValue: 8,
  transform: "runninghubVeo3Duration"
}), Object.freeze({
  path: "generateAudio",
  from: "param",
  field: Object.freeze(["generationParams.generateAudio", "generationParams.generate_audio", "generateAudio", "generate_audio"]),
  defaultValue: false,
  transform: "booleanParam"
})]);
export const RUNNINGHUB_VIDEO_WAN27_BODY_MAPPING = freezeBodyMapping([Object.freeze({
  path: "prompt",
  from: "prompt"
}), Object.freeze({
  path: "wan27_mode",
  from: "param",
  field: Object.freeze(["generationParams.wan27_mode", "wan27_mode"]),
  defaultValue: "image"
}), Object.freeze({
  path: "resolution",
  from: "param",
  field: Object.freeze(["generationParams.resolution", "resolution"]),
  defaultValue: "720P",
  transform: "runninghubWan27Resolution"
}), Object.freeze({
  path: "aspectRatio",
  from: "param",
  field: Object.freeze(["generationParams.aspectRatio", "aspectRatio"]),
  defaultValue: APIMART_VIDEO_ADAPTIVE_RATIO_VALUE,
  transform: "runninghubWan27AspectRatio",
  omitWhenEmpty: true
}), Object.freeze({
  path: "duration",
  from: "param",
  field: Object.freeze(["generationParams.duration", "duration"]),
  defaultValue: 5,
  transform: "runninghubWan27Duration"
}), Object.freeze({
  path: "promptExtend",
  from: "param",
  field: Object.freeze(["generationParams.prompt_extend", "generationParams.promptExtend", "prompt_extend", "promptExtend"]),
  defaultValue: true,
  transform: "booleanParam"
}), Object.freeze({
  path: "negativePrompt",
  from: "param",
  field: Object.freeze(["generationParams.negative_prompt", "generationParams.negativePrompt", "negative_prompt", "negativePrompt"]),
  transform: "apimartOptionalText",
  omitWhenEmpty: true
}), Object.freeze({
  path: "audioUrl",
  from: "inputAudios",
  transform: "first",
  omitWhenEmpty: true
})]);
export const RUNNINGHUB_VIDEO_HAILUO_02_BODY_MAPPING = freezeBodyMapping([Object.freeze({
  path: "prompt",
  from: "prompt"
}), Object.freeze({
  path: "rh_hailuo_02_quality",
  from: "param",
  field: Object.freeze(["generationParams.rh_hailuo_02_quality", "rh_hailuo_02_quality"]),
  defaultValue: "standard"
}), Object.freeze({
  path: "duration",
  from: "param",
  field: Object.freeze(["generationParams.duration", "duration"]),
  defaultValue: 6,
  transform: "runninghubHailuo02Duration"
}), Object.freeze({
  path: "enablePromptExpansion",
  from: "param",
  field: Object.freeze(["generationParams.enablePromptExpansion", "generationParams.enable_prompt_expansion", "enablePromptExpansion", "enable_prompt_expansion"]),
  defaultValue: true,
  transform: "booleanParam"
})]);
export const RUNNINGHUB_VIDEO_HAILUO_23_BODY_MAPPING = freezeBodyMapping([Object.freeze({
  path: "prompt",
  from: "prompt"
}), Object.freeze({
  path: "rh_hailuo_23_quality",
  from: "param",
  field: Object.freeze(["generationParams.rh_hailuo_23_quality", "rh_hailuo_23_quality"]),
  defaultValue: "standard"
}), Object.freeze({
  path: "duration",
  from: "param",
  field: Object.freeze(["generationParams.duration", "duration"]),
  defaultValue: 6,
  transform: "runninghubHailuo23Duration"
}), Object.freeze({
  path: "enablePromptExpansion",
  from: "param",
  field: Object.freeze(["generationParams.enablePromptExpansion", "generationParams.enable_prompt_expansion", "enablePromptExpansion", "enable_prompt_expansion"]),
  defaultValue: true,
  transform: "booleanParam"
})]);
export const APIMART_VIDEO_VIDU_BODY_MAPPING = createApimartVideoBodyMapping([Object.freeze({
  ...APIMART_VIDEO_DURATION_ENTRY,
  defaultValue: 5,
  transform: "apimartViduVideoDuration"
}), APIMART_VIDEO_RESOLUTION_VIDU_ENTRY, APIMART_VIDEO_ASPECT_RATIO_ENTRY, APIMART_VIDEO_IMAGE_URLS_ENTRY, APIMART_VIDEO_AUDIO_TRUE_ENTRY, APIMART_VIDEO_SEED_ENTRY]);
export const APIMART_VIDEO_GROK_IMAGINE_BODY_MAPPING = createApimartVideoBodyMapping([APIMART_VIDEO_SIZE_ENTRY, Object.freeze({
  ...APIMART_VIDEO_DURATION_ENTRY,
  defaultValue: 6,
  transform: Object.freeze({
    name: "integerRange",
    min: 6,
    max: 30,
    fallback: 6
  })
}), Object.freeze({
  path: "quality",
  from: "param",
  field: Object.freeze(["generationParams.quality", "quality"]),
  defaultValue: "480p"
}), APIMART_VIDEO_IMAGE_URLS_ENTRY]);
export const APIMART_VIDEO_OMNI_FLASH_BODY_MAPPING = createApimartVideoBodyMapping([Object.freeze({
  ...APIMART_VIDEO_DURATION_ENTRY,
  defaultValue: 6
}), APIMART_VIDEO_RESOLUTION_4K_ENTRY, APIMART_VIDEO_ASPECT_RATIO_ENTRY, Object.freeze({
  ...APIMART_VIDEO_IMAGE_URLS_ENTRY,
  transform: Object.freeze({
    name: "imageCountOptions",
    allowedCounts: Object.freeze([1, 3]),
    label: "Gemini Omni Flash Ext"
  })
}), Object.freeze({
  path: "video_urls",
  from: "inputVideos",
  omitWhenEmpty: true
})]);
export const APIMART_VIDEO_GEMINI_OMNI_FLASH_PREVIEW_BODY_MAPPING = createApimartVideoBodyMapping([APIMART_VIDEO_ASPECT_RATIO_ENTRY, Object.freeze({
  path: "resolution",
  from: "constant",
  value: "720p"
}), APIMART_VIDEO_IMAGE_URLS_ENTRY, Object.freeze({
  path: "video_urls",
  from: "inputVideos",
  omitWhenEmpty: true
}), Object.freeze({
  path: "extend_from_task_id",
  from: "param",
  field: Object.freeze(["generationParams.extend_from_task_id", "extend_from_task_id"]),
  defaultValue: "",
  transform: "apimartOptionalText",
  omitWhenEmpty: true
})]);
export const VOLCENGINE_VIDEO_SEEDANCE_2_BODY_MAPPING = freezeBodyMapping([Object.freeze({
  path: "prompt",
  from: "prompt"
}), Object.freeze({
  path: "volcengine_seedance_2_mode",
  from: "param",
  field: Object.freeze(["generationParams.volcengine_seedance_2_mode", "volcengine_seedance_2_mode"]),
  defaultValue: "multimodal2video"
}), Object.freeze({
  path: "resolution",
  from: "param",
  field: Object.freeze(["generationParams.resolution", "resolution"]),
  defaultValue: "720p"
}), Object.freeze({
  path: "ratio",
  from: "param",
  field: Object.freeze(["generationParams.aspectRatio", "aspectRatio", "ratio"]),
  defaultValue: "adaptive"
}), Object.freeze({
  path: "duration",
  from: "param",
  field: Object.freeze(["generationParams.duration", "duration"]),
  defaultValue: 5
}), Object.freeze({
  path: "generate_audio",
  from: "param",
  field: Object.freeze(["generationParams.generateAudio", "generationParams.generate_audio", "generateAudio", "generate_audio"]),
  defaultValue: true,
  transform: "booleanParam"
}), Object.freeze({
  path: "watermark",
  from: "param",
  field: Object.freeze(["generationParams.watermark", "watermark"]),
  defaultValue: false,
  transform: "booleanParam"
}), Object.freeze({
  path: "webSearch",
  from: "param",
  field: Object.freeze(["generationParams.webSearch", "webSearch"]),
  defaultValue: false,
  transform: "booleanParam"
}), Object.freeze({
  path: "priority",
  from: "param",
  field: Object.freeze(["generationParams.priority", "priority"]),
  omitWhenEmpty: true
})]);
export const APIMART_VIDEO_RESPONSE_MAPPING = Object.freeze({
  taskIdPath: Object.freeze(["data[].task_id", "task_id", "taskId"]),
  statusPath: "status",
  errorPath: "error",
  resultPaths: Object.freeze(["result.videos[].url", "data.result.videos[].url", "results[].videoUrl", "results[].url", "url"])
});
export const RUNNINGHUB_VIDEO_RESPONSE_MAPPING = Object.freeze({
  taskIdPath: Object.freeze(["taskId", "data.taskId", "data[].taskId"]),
  statusPath: "status",
  errorPath: "errorMessage",
  resultPaths: Object.freeze(["results[].url", "results[].videoUrl", "data.results[].url", "url"])
});
export const VOLCENGINE_VIDEO_RESPONSE_MAPPING = Object.freeze({
  taskIdPath: Object.freeze(["id", "data.id"]),
  statusPath: "status",
  errorPath: "error.message",
  resultPaths: Object.freeze(["content.video_url", "content.videoUrl", "data.content.video_url", "data.content.videoUrl"])
});
export const APIMART_VIDEO_TASK_POLLING = Object.freeze({
  mode: "task-proxy",
  method: "GET",
  urlTemplate: "{baseUrl}/v1/tasks/{taskId}?language=zh",
  headersMode: "bearer"
});
export const VOLCENGINE_VIDEO_TASK_POLLING = Object.freeze({
  mode: "task-proxy",
  method: "GET",
  urlTemplate: "{baseUrl}/contents/generations/tasks/{taskId}",
  headersMode: "bearer"
});
export const APIMART_SEEDANCE_VIDEO_RESOLVERS = Object.freeze({
  bodyResolver: "apimartSeedanceVideo"
});
export const APIMART_OMNI_FLASH_VIDEO_RESOLVERS = Object.freeze({
  bodyResolver: "apimartOmniFlashVideo"
});
export const VOLCENGINE_SEEDANCE_VIDEO_RESOLVERS = Object.freeze({
  bodyResolver: "volcengineSeedance2Video"
});
export const APIMART_SEEDANCE_2_0_VIDEO_POLICY = Object.freeze({
  ratioField: "size",
  defaultResolution: "720p",
  allowedResolutions: Object.freeze(["480p", "720p", "1080p", "4k"]),
  supportsVideoReferences: true,
  supportsAudioReferences: true,
  maxRoleImageCount: 2,
  maxImageCount: 9,
  maxVideoReferenceCount: 3,
  maxAudioReferenceCount: 3,
  privateAvatarAssets: Object.freeze({
    enabled: true,
    provider: "apimart",
    capability: "seedance2PrivateAvatar",
    models: Object.freeze(["doubao-seedance-2.0", "doubao-seedance-2.0-fast"])
  })
});
export const VOLCENGINE_SEEDANCE_IMAGE_INPUT_UPLOAD_POLICY = Object.freeze({
  provider: "freeImageHost",
  inputKinds: Object.freeze(["image"]),
  applyInputQualityProfile: true,
  strictUpload: true
});
export const VOLCENGINE_SEEDANCE_VIDEO_INPUT_UPLOAD_POLICY = Object.freeze({
  provider: "runninghub",
  inputKinds: Object.freeze(["video"]),
  strictUpload: true
});
export const VOLCENGINE_SEEDANCE_AUDIO_INPUT_UPLOAD_POLICY = Object.freeze({
  provider: "runninghub",
  inputKinds: Object.freeze(["audio"]),
  strictUpload: true
});
export const VOLCENGINE_SEEDANCE_2_0_VIDEO_POLICY = Object.freeze({
  defaultRatio: "adaptive",
  defaultResolution: "720p",
  maxImageCount: 9,
  maxVideoReferenceCount: 3,
  maxAudioReferenceCount: 3,
  minDuration: 4,
  maxDuration: 15
});
export const APIMART_SEEDANCE_1_5_VIDEO_POLICY = Object.freeze({
  ratioField: "aspect_ratio",
  defaultResolution: "720p",
  supportsVideoReferences: false,
  supportsAudioReferences: false,
  maxRoleImageCount: 2,
  maxImageCount: 2,
  supportsGenerateAudioParam: true,
  supportsCameraFixedParam: true
});
export const APIMART_SEEDANCE_1_0_FAST_VIDEO_POLICY = Object.freeze({
  ratioField: "aspect_ratio",
  defaultResolution: "1080p",
  supportsVideoReferences: false,
  supportsAudioReferences: false,
  maxRoleImageCount: 1,
  maxImageCount: 1,
  roleImageLimitError: "Seedance 1.0 Pro Fast does not support last-frame input"
});
export const APIMART_SEEDANCE_1_0_QUALITY_VIDEO_POLICY = Object.freeze({
  ratioField: "aspect_ratio",
  defaultResolution: "1080p",
  supportsVideoReferences: false,
  supportsAudioReferences: false,
  maxRoleImageCount: 2,
  maxImageCount: 1
});
export function createSeedanceVideoExecutionExtensions(_0x7e7c34) {
  return Object.freeze({
    ...APIMART_SEEDANCE_VIDEO_RESOLVERS,
    inputResolutionMode: "resolverOwned",
    seedanceVideo: _0x7e7c34
  });
}
export function createVolcengineSeedanceVideoExecutionExtensions(_0x4fa864) {
  return Object.freeze({
    ...VOLCENGINE_SEEDANCE_VIDEO_RESOLVERS,
    videoFamily: "seedance2",
    seedanceVideo: _0x4fa864,
    imageInputUpload: VOLCENGINE_SEEDANCE_IMAGE_INPUT_UPLOAD_POLICY,
    videoInputUpload: VOLCENGINE_SEEDANCE_VIDEO_INPUT_UPLOAD_POLICY,
    audioInputUpload: VOLCENGINE_SEEDANCE_AUDIO_INPUT_UPLOAD_POLICY
  });
}
export const APIMART_SEEDANCE_DEFAULT_TASK_TYPES = Object.freeze(["text2video", "image2video", "frames2video", "multimodal2video"]);
export const APIMART_SEEDANCE_NO_FAST_FRAMES_TASK_TYPES = Object.freeze(["text2video", "image2video", "multimodal2video"]);
export const APIMART_SEEDANCE_STANDARD_RESOLUTION_BY_TASK = Object.freeze({
  text2video: Object.freeze(["480p", "720p", "1080p"]),
  image2video: Object.freeze(["480p", "720p", "1080p"]),
  frames2video: Object.freeze(["480p", "720p", "1080p"]),
  multimodal2video: Object.freeze(["480p", "720p", "1080p"])
});
export const APIMART_SEEDANCE_2_0_RESOLUTION_BY_TASK = Object.freeze({
  text2video: Object.freeze(["480p", "720p", "1080p", "4k"]),
  image2video: Object.freeze(["480p", "720p", "1080p", "4k"]),
  frames2video: Object.freeze(["480p", "720p", "1080p", "4k"]),
  multimodal2video: Object.freeze(["480p", "720p", "1080p", "4k"])
});
export const APIMART_SEEDANCE_FAST_RESOLUTION_BY_TASK = Object.freeze({
  text2video: Object.freeze(["480p", "720p"]),
  image2video: Object.freeze(["480p", "720p"]),
  frames2video: Object.freeze(["480p", "720p"]),
  multimodal2video: Object.freeze(["480p", "720p"])
});
export const APIMART_SEEDANCE_DEFAULT_DURATION_BY_TASK = Object.freeze({
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
export const APIMART_SEEDANCE_1_5_DURATION_BY_TASK = Object.freeze({
  text2video: Object.freeze({
    min: 4,
    max: 12,
    step: 1
  }),
  image2video: Object.freeze({
    min: 4,
    max: 12,
    step: 1
  }),
  frames2video: Object.freeze({
    min: 4,
    max: 12,
    step: 1
  }),
  multimodal2video: Object.freeze({
    min: 4,
    max: 12,
    step: 1
  })
});
export const APIMART_SEEDANCE_1_0_DURATION_BY_TASK = Object.freeze({
  text2video: Object.freeze({
    min: 2,
    max: 12,
    step: 1
  }),
  image2video: Object.freeze({
    min: 2,
    max: 12,
    step: 1
  }),
  frames2video: Object.freeze({
    min: 2,
    max: 12,
    step: 1
  }),
  multimodal2video: Object.freeze({
    min: 2,
    max: 12,
    step: 1
  })
});
export const APIMART_SEEDANCE_RATIO_FIELD = createAspectRatioField({
  options: ["16:9", "9:16", "1:1", "4:3", "3:4", "21:9"]
});
export const APIMART_SEEDANCE_FAST_FIELDS = Object.freeze([createResolutionField({
  defaultValue: "720p",
  options: ["480p", "720p"]
}), APIMART_SEEDANCE_RATIO_FIELD, createFooterDurationField()]);
export const APIMART_SEEDANCE_STANDARD_FIELDS = Object.freeze([createResolutionField({
  defaultValue: "720p",
  options: ["480p", "720p", "1080p"]
}), APIMART_SEEDANCE_RATIO_FIELD, createFooterDurationField()]);
export const APIMART_SEEDANCE_2_0_FIELDS = Object.freeze([createResolutionField({
  defaultValue: "720p",
  options: ["480p", "720p", "1080p", "4k"]
}), APIMART_SEEDANCE_RATIO_FIELD, createFooterDurationField()]);
export function freezeFields(_0x581da2) {
  return Object.freeze(_0x581da2.map(_0x3d0cca => Object.freeze(_0x3d0cca)));
}
export function createVideoModelApiManifest({
  modelId: _0x3d6e98,
  executionId: _0x329498,
  displayName: _0x1dcd86,
  provider = "apimart",
  vip = false,
  aliases = null,
  icon = "AM",
  description = null,
  extensions = null,
  fields = [VIDEO_RESOLUTION_FIELD, VIDEO_RATIO_FIELD, createFooterDurationField()],
  inputSlots = createVideoInputSlots(),
  ratioPolicy = VIDEO_SIZE_RATIO_POLICY,
  prompt = null,
  help = null,
  footerPlacementOrder = APIMART_VIDEO_FOOTER_PLACEMENT_ORDER
}) {
  const _0x5c5511 = Array.isArray(footerPlacementOrder) ? footerPlacementOrder.map(_0x4589c1 => String(_0x4589c1 || "").trim()).filter(Boolean) : [];
  const _0x28fa4f = {
    schemaVersion: "1.0",
    modelId: _0x3d6e98,
    ...(Array.isArray(aliases) ? {
      aliases: aliases
    } : {}),
    provider: provider,
    kind: "video",
    adapterType: "modelApi",
    executionId: _0x329498,
    displayName: _0x1dcd86,
    ...(vip === true ? {
      vip: true
    } : {}),
    icon: icon,
    description: description || (provider === "apimart" ? "APIMart video model API" : _0x1dcd86 + " video model API"),
    inputSlots: inputSlots,
    uiSchema: Object.freeze({
      fields: freezeFields(fields),
      ...(_0x5c5511.length ? {
        footerPlacementOrder: Object.freeze(_0x5c5511)
      } : {})
    }),
    ...(prompt && typeof prompt === "object" ? {
      prompt: Object.freeze(prompt)
    } : {}),
    ...(help && typeof help === "object" ? {
      help: Object.freeze(help)
    } : {}),
    async: true,
    cancellable: false,
    outputType: "video",
    extensions: Object.freeze({
      ratioPolicy: ratioPolicy
    })
  };
  if (extensions && typeof extensions === "object") {
    _0x28fa4f.extensions = Object.freeze({
      ratioPolicy: ratioPolicy,
      ...extensions
    });
  }
  return Object.freeze(_0x28fa4f);
}
export function createVideoExecutionManifest({
  id: _0x1e1e51,
  model: _0x4e1cd1,
  provider = "apimart",
  endpoint = "/v1/videos/generations",
  endpointMode = "video-generation",
  extensions = null,
  bodyMapping = APIMART_VIDEO_LEGACY_BODY_MAPPING,
  modeModels = null,
  responseMapping = APIMART_VIDEO_RESPONSE_MAPPING,
  taskPolling = APIMART_VIDEO_TASK_POLLING,
  resultTaskIdPath = "task_id",
  resultUrlFields = Object.freeze(["videoUrl", "video_url", "url"])
}) {
  const _0x4c3c42 = Object.freeze({
    ...(taskPolling ? {
      taskPolling: taskPolling
    } : {}),
    ...(extensions && typeof extensions === "object" ? extensions : {})
  });
  return Object.freeze({
    schemaVersion: "1.0",
    id: _0x1e1e51,
    provider: provider,
    kind: "video",
    adapterType: "modelApi",
    endpoint: endpoint,
    endpointMode: endpointMode,
    method: "POST",
    model: _0x4e1cd1,
    ...(modeModels ? {
      modeModels: Object.freeze(modeModels)
    } : {}),
    extensions: _0x4c3c42,
    headers: Object.freeze({
      "Content-Type": "application/json"
    }),
    bodyMapping: bodyMapping,
    responseMapping: responseMapping,
    result: Object.freeze({
      taskIdPath: resultTaskIdPath,
      urlFields: Object.freeze(resultUrlFields)
    })
  });
}