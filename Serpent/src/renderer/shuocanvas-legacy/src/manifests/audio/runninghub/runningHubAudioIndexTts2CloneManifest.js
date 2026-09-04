import { RH_AUDIO_INSTANCE_FIELD, createRunningHubAudioExecutionManifest, createRunningHubAudioModelManifest } from "../../shared/runningHubAudioManifestShared.js";
export const RH_AUDIO_INDEXTTS2_CLONE_MODEL_ID = "indextts2_clone";
export const RH_AUDIO_INDEXTTS2_CLONE_EXECUTION_ID = "runninghub.workflow.audio-indextts2-clone.v1";
export const RH_AUDIO_INDEXTTS2_CLONE_HELP_TOOLTIP = ["音色克隆V1用法", "输入提示词 + [[red:1段声线参考]]，生成[[red:同声线]]的新语音", "接入[[red:2段音频]]时可不填提示词：声线参考 + 语气参考", "声线参考建议使用[[red:清晰人声]]，环境噪声越少越好", "适合配音、旁白、角色语音；[[red:文本内容由提示词决定]]", "例：用声线参考说：欢迎来到今天的节目"].join("\n");
export const rhAudioIndexTts2CloneModelManifest = createRunningHubAudioModelManifest({
  modelId: RH_AUDIO_INDEXTTS2_CLONE_MODEL_ID,
  executionId: RH_AUDIO_INDEXTTS2_CLONE_EXECUTION_ID,
  displayName: "音色克隆V1",
  description: "参考音色克隆",
  extensions: Object.freeze({
    audioMenu: Object.freeze({
      group: "runninghubWorkflow",
      order: 10
    })
  }),
  help: Object.freeze({
    tooltip: RH_AUDIO_INDEXTTS2_CLONE_HELP_TOOLTIP
  }),
  inputSlots: {
    allowedKinds: ["text", "audio"],
    minByKind: {
      audio: 1
    },
    maxByKind: {
      image: 0,
      video: 0,
      audio: 2
    },
    fixedSlots: Object.freeze([Object.freeze({
      id: "audioRef",
      kind: "audio",
      label: "声线参考",
      required: true
    }), Object.freeze({
      id: "audio2",
      kind: "audio",
      label: "语气参考",
      required: false
    })])
  },
  uiFields: [RH_AUDIO_INSTANCE_FIELD]
});
export const rhAudioIndexTts2CloneExecutionManifest = createRunningHubAudioExecutionManifest({
  id: RH_AUDIO_INDEXTTS2_CLONE_EXECUTION_ID,
  label: "音色克隆V1",
  workflowId: "2067594933602705409",
  preset: "rh-audio-indextts2-clone",
  extensions: Object.freeze({
    providerProfileBindings: Object.freeze({
      "runninghub-international": Object.freeze({
        appId: "2086849441009971202"
      })
    })
  }),
  mapping: {
    refAudioNode: Object.freeze({
      nodeId: "56",
      fieldName: "audio"
    }),
    audio2Node: Object.freeze({
      nodeId: "63",
      fieldName: "audio"
    }),
    promptNode: Object.freeze({
      nodeId: "60",
      fieldName: "value"
    }),
    indexNode: Object.freeze({
      nodeId: "66",
      fieldName: "index"
    })
  }
});