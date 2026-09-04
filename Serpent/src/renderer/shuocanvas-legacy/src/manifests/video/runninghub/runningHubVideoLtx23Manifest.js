import { RH_INSTANCE_FIELD, createRunningHubVideoExecutionManifest, createRunningHubVideoModelManifest } from "../../shared/runningHubVideoManifestShared.js";
export const RH_VIDEO_LTX23_MODEL_ID = "runninghub/2073900179945771009";
export const RH_VIDEO_LTX23_EXECUTION_ID = "runninghub.workflow.video-ltx23.v2";
const RH_LTX23_ASPECT_RATIO_OPTIONS = Object.freeze([Object.freeze({
  value: "自适应",
  label: "自适应"
}), Object.freeze({
  value: "9:16",
  label: "9:16"
}), Object.freeze({
  value: "16:9",
  label: "16:9"
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
  value: "5:4",
  label: "5:4"
}), Object.freeze({
  value: "4:5",
  label: "4:5"
}), Object.freeze({
  value: "2:1",
  label: "2:1"
}), Object.freeze({
  value: "1:2",
  label: "1:2"
})]);
export const RH_VIDEO_LTX23_HELP_TOOLTIP = ["LTX2.3 文/图生视频全功能用法", "不接图片时为文生视频；接入 [[red:图片参考]] 时为图生视频。", "接入 [[red:音频参考]] 时开启自定义音频，可搭配文生视频或图生视频。", "提示词描述画面内容、人物状态、镜头和动作，例如：女人说话，镜头缓慢推进。", "分辨率用于选择清晰度，比例用于选择横屏、竖屏或方形画面。"].join("\n");
export const rhVideoLtx23ModelManifest = createRunningHubVideoModelManifest({
  modelId: RH_VIDEO_LTX23_MODEL_ID,
  executionId: RH_VIDEO_LTX23_EXECUTION_ID,
  displayName: "LTX2.3 文/图生视频全功能",
  description: "支持文生视频、图生视频和可选音频参考的 RunningHub 工作流",
  help: Object.freeze({
    tooltip: RH_VIDEO_LTX23_HELP_TOOLTIP
  }),
  fixedAssetSlots: ["refImage", "audio"],
  inputSlots: {
    allowedKinds: ["text", "image", "audio"],
    minByKind: {
      image: 0,
      audio: 0
    },
    maxByKind: {
      image: 1,
      video: 0,
      audio: 1
    },
    displayAspectRatioSource: Object.freeze({
      kind: "image",
      slot: "refImage",
      fallbackIndex: 0
    }),
    fixedSlots: Object.freeze([Object.freeze({
      id: "refImage",
      kind: "image",
      label: "图片参考",
      required: false
    }), Object.freeze({
      id: "audio",
      kind: "audio",
      label: "音频参考",
      required: false
    })])
  },
  uiFields: [Object.freeze({
    id: "rhVideoResolution",
    type: "segmented",
    placement: "videoParams",
    displayRole: "resolution",
    label: "分辨率",
    defaultValue: 1280,
    showHighResolutionOptions: true,
    options: Object.freeze([Object.freeze({
      value: 1024,
      label: "1024"
    }), Object.freeze({
      value: 1280,
      label: "1280"
    }), Object.freeze({
      value: 1440,
      label: "1440"
    }), Object.freeze({
      value: 1600,
      label: "1600"
    }), Object.freeze({
      value: 1920,
      label: "1920"
    })])
  }), Object.freeze({
    id: "rhLtx23AspectRatio",
    type: "segmented",
    placement: "videoParams",
    displayRole: "aspectRatio",
    label: "比例",
    defaultValue: "自适应",
    options: RH_LTX23_ASPECT_RATIO_OPTIONS
  }), Object.freeze({
    id: "rhVideoSeconds",
    type: "stepper",
    placement: "videoParams",
    label: "秒数",
    defaultValue: 8,
    min: 1,
    max: 600
  }), Object.freeze({
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
    }), Object.freeze({
      value: 30,
      label: "30帧"
    })])
  }), RH_INSTANCE_FIELD]
});
export const rhVideoLtx23ExecutionManifest = createRunningHubVideoExecutionManifest({
  id: RH_VIDEO_LTX23_EXECUTION_ID,
  label: "LTX2.3 文/图生视频全功能",
  workflowId: "2073900179945771009",
  submitMode: "openapi-v2-ai-app",
  queryMode: "openapi-v2-query",
  extensions: Object.freeze({
    payloadResolver: "runninghubLtx23FullVideo"
  }),
  mapping: {
    imageNode: Object.freeze({
      nodeId: "400",
      fieldName: "image",
      description: "图片参考"
    }),
    audioNode: Object.freeze({
      nodeId: "332",
      fieldName: "audio",
      description: "音频参考"
    }),
    textToVideoNode: Object.freeze({
      nodeId: "302",
      fieldName: "value",
      description: "开启：文生视频 关闭：图生视频"
    }),
    customAudioNode: Object.freeze({
      nodeId: "387",
      fieldName: "value",
      description: "开启自定义音频"
    }),
    secondsNode: Object.freeze({
      nodeId: "366",
      fieldName: "value",
      defaultValue: 8,
      description: "生成秒数"
    }),
    widthNode: Object.freeze({
      nodeId: "403",
      fieldName: "value",
      description: "宽度"
    }),
    heightNode: Object.freeze({
      nodeId: "367",
      fieldName: "value",
      description: "高度"
    }),
    fpsNode: Object.freeze({
      nodeId: "369",
      fieldName: "value",
      defaultValue: 24,
      description: "帧率"
    }),
    promptNode: Object.freeze({
      nodeId: "303",
      fieldName: "value",
      description: "提示词"
    })
  }
});