import { RH_AUDIO_INSTANCE_FIELD, createRunningHubAudioExecutionManifest, createRunningHubAudioModelManifest } from "../../shared/runningHubAudioManifestShared.js";
export const RH_AUDIO_VOICE_CONVERT_MODEL_ID = "voice_convert";
export const RH_AUDIO_VOICE_CONVERT_EXECUTION_ID = "runninghub.workflow.audio-voice-convert.v1";
export const RH_AUDIO_VOICE_CONVERT_HELP_TOOLTIP = ["音色转换用法", "接入 [[red:2段音频]]：声线参考 + 语气参考", "[[red:声线参考]]决定最终生成后听起来像谁", "[[red:语气参考]]提供原始语音内容、语速、语气、情绪和停顿", "适合用目标声线复刻另一段人声对白的说话方式"].join("\n");
export const rhAudioVoiceConvertModelManifest = createRunningHubAudioModelManifest({
  modelId: RH_AUDIO_VOICE_CONVERT_MODEL_ID,
  executionId: RH_AUDIO_VOICE_CONVERT_EXECUTION_ID,
  displayName: "音色转换",
  description: "男女声音互变",
  extensions: Object.freeze({
    audioMenu: Object.freeze({
      group: "runninghubWorkflow",
      order: 20
    })
  }),
  help: Object.freeze({
    tooltip: RH_AUDIO_VOICE_CONVERT_HELP_TOOLTIP
  }),
  inputSlots: {
    allowedKinds: ["audio"],
    minByKind: {
      audio: 2
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
      id: "audioTarget",
      kind: "audio",
      label: "语气参考",
      required: true
    })])
  },
  uiFields: [RH_AUDIO_INSTANCE_FIELD]
});
export const rhAudioVoiceConvertExecutionManifest = createRunningHubAudioExecutionManifest({
  id: RH_AUDIO_VOICE_CONVERT_EXECUTION_ID,
  label: "音色转换",
  workflowId: "2013613374315171841",
  preset: "rh-audio-voice-convert",
  mapping: {
    refAudioNode: Object.freeze({
      nodeId: "5",
      fieldName: "audio"
    }),
    targetAudioNode: Object.freeze({
      nodeId: "10",
      fieldName: "audio"
    })
  }
});