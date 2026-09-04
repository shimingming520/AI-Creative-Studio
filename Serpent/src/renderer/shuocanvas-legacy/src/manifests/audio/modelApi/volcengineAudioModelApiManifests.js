import { VOLCENGINE_FORMAT_FIELD, VOLCENGINE_PITCH_FIELD, VOLCENGINE_SAMPLE_RATE_FIELD, VOLCENGINE_SPEAKER_ID_FIELD, VOLCENGINE_SPEED_FIELD, VOLCENGINE_VOICE_TYPE_FIELD, VOLCENGINE_VOLUME_FIELD, createAudioModelApiExecutionManifest, createAudioModelApiManifest } from "./sharedAudioModelApiFields.js";
export const VOLCENGINE_TTS_MODEL_ID = "volcengine-speech/tts";
export const VOLCENGINE_TTS_EXECUTION_ID = "volcengine-speech.model-api.tts.v3";
export const VOLCENGINE_DOUBAO_AUDIO_GENERATION_MODEL_ID = "volcengine/doubao-seed-audio-1-0";
export const VOLCENGINE_DOUBAO_AUDIO_GENERATION_EXECUTION_ID = "volcengine-speech.model-api.doubao-audio-generation.v1";
const VOLCENGINE_TTS_HELP = ["doubao-seed-tts-2.0（豆包语音合成，自动适配官方/自定义音色）用法：", "  1. 输入要朗读的文本内容", "  2. 在按钮旁选择目标音色（灿灿/云舟/清新女声/高冷御姐）", "  3. 高级设置可调节语速、音量、音调、格式、采样率、自定义音色ID", "  4. 点击生成按钮", "", "语速/音量：0=正常，正数加速/加音，负数减速/减音", "自定义音色：_uranus_bigtts 走 TTS 2.0；_mars_bigtts 走 TTS 1.0；控制台自定义/音色设计音色ID走 ICL 2.0", "完整音色列表：https://www.volcengine.com/docs/6561/1257544"].join("\n");
export const volcengineSpeechTtsModelManifest = createAudioModelApiManifest({
  modelId: VOLCENGINE_TTS_MODEL_ID,
  executionId: VOLCENGINE_TTS_EXECUTION_ID,
  provider: "volcengine-speech",
  displayName: "doubao-seed-tts-2.0",
  icon: "images/volcengine.svg",
  description: "豆包语音合成，可使用预设音色、官方 _uranus/_mars 音色或火山自定义/音色设计音色",
  aliases: Object.freeze(["volcengine-speech/doubao-seed-tts-2-0", "doubao-seed-tts-2-0", "seed-tts-2.0"]),
  help: Object.freeze({
    tooltip: VOLCENGINE_TTS_HELP
  }),
  extensions: Object.freeze({
    audioMenu: Object.freeze({
      group: "volcengineSpeech",
      order: 10
    }),
    credentialAuthorization: Object.freeze({
      capability: "tts"
    })
  }),
  inputSlots: Object.freeze({
    allowedKinds: Object.freeze(["text"]),
    minByKind: Object.freeze({
      text: 1
    }),
    maxByKind: Object.freeze({
      image: 0,
      video: 0,
      audio: 0
    })
  }),
  fields: [VOLCENGINE_VOICE_TYPE_FIELD, VOLCENGINE_SPEAKER_ID_FIELD, VOLCENGINE_SPEED_FIELD, VOLCENGINE_VOLUME_FIELD, VOLCENGINE_PITCH_FIELD, VOLCENGINE_FORMAT_FIELD, VOLCENGINE_SAMPLE_RATE_FIELD]
});
const VOLCENGINE_DOUBAO_AUDIO_GENERATION_HELP = ["doubao-seed-audio-1.0（Audio 1.0）用法：", "  1. 输入合成文本，也可以描述想要的音色、情绪、风格、节奏或环境声", "  2. 可连接 1-3 段参考音频用于克隆/参考声音特征", "  3. 提示词可手写 @音频1、@音频2 精确指定参考；未手写时会自动引用已连接音频", "  4. 高级设置可调节语调、语速、音量和输出格式", "", "需要火山语音 Audio 1.0 API 白名单/权限；体验中心可用不代表当前 X-Api-Key 已有接口权限。", "提示词最长 3000 字；单次最长约 120 秒音频。"].join("\n");
const VOLCENGINE_DOUBAO_AUDIO_PITCH_FIELD = Object.freeze({
  id: "pitch",
  type: "slider",
  placement: "advanced",
  label: "语调",
  defaultValue: 0,
  min: -12,
  max: 12,
  step: 1,
  displayValueTemplate: "{value}"
});
const VOLCENGINE_DOUBAO_AUDIO_SPEED_FIELD = Object.freeze({
  id: "speechRate",
  type: "slider",
  placement: "advanced",
  label: "语速",
  defaultValue: 0,
  min: -50,
  max: 100,
  step: 1,
  displayValueTemplate: "{value}"
});
const VOLCENGINE_DOUBAO_AUDIO_VOLUME_FIELD = Object.freeze({
  id: "loudnessRate",
  type: "slider",
  placement: "advanced",
  label: "音量",
  defaultValue: 0,
  min: -50,
  max: 100,
  step: 1,
  displayValueTemplate: "{value}"
});
const VOLCENGINE_DOUBAO_AUDIO_FORMAT_FIELD = Object.freeze({
  id: "format",
  type: "segmented",
  placement: "advanced",
  label: "格式",
  defaultValue: "mp3",
  options: Object.freeze([Object.freeze({
    value: "wav",
    label: "WAV",
    selectedLabel: "WAV"
  }), Object.freeze({
    value: "mp3",
    label: "MP3",
    selectedLabel: "MP3"
  }), Object.freeze({
    value: "m4a",
    label: "M4A",
    selectedLabel: "M4A"
  })])
});
const VOLCENGINE_DOUBAO_AUDIO_FIXED_INPUT_SLOTS = Object.freeze([Object.freeze({
  id: "audio1",
  kind: "audio",
  label: "参考音频1",
  required: false
}), Object.freeze({
  id: "audio2",
  kind: "audio",
  label: "参考音频2",
  required: false
}), Object.freeze({
  id: "audio3",
  kind: "audio",
  label: "参考音频3",
  required: false
})]);
export const volcengineDoubaoAudioGenerationModelManifest = createAudioModelApiManifest({
  modelId: VOLCENGINE_DOUBAO_AUDIO_GENERATION_MODEL_ID,
  executionId: VOLCENGINE_DOUBAO_AUDIO_GENERATION_EXECUTION_ID,
  provider: "volcengine-speech",
  displayName: "doubao-seed-audio-1.0",
  icon: "images/volcengine.svg",
  description: "doubao-seed-audio-1.0，可用文本和参考音频生成/克隆语音",
  aliases: Object.freeze(["volcengine-speech/doubao-seed-audio-1-0", "doubao-seed-audio-1-0", "seed-audio-1.0"]),
  prompt: Object.freeze({
    emptyPolicy: "block",
    minLength: 1,
    maxLength: 3000,
    placeholder: "输入效果提示词和合成文本，支持上传并 @ 参考音频，自由参考音色、情感、风格、节奏等。例如：请参考 @音频1 的音色，参考 @音频2 的声音风格，说：“今天的天气很好，我们一起出去走走吧。” 单次最长可生成约 2 分钟音频，若文本较长，语速可能会相应加快。"
  }),
  help: Object.freeze({
    tooltip: VOLCENGINE_DOUBAO_AUDIO_GENERATION_HELP
  }),
  extensions: Object.freeze({
    audioMenu: Object.freeze({
      group: "volcengineSpeech",
      order: 20
    }),
    credentialAuthorization: Object.freeze({
      capability: "audioGeneration"
    })
  }),
  inputSlots: Object.freeze({
    allowedKinds: Object.freeze(["text", "audio"]),
    minByKind: Object.freeze({
      text: 1
    }),
    maxByKind: Object.freeze({
      image: 0,
      video: 0,
      audio: 3
    }),
    fixedSlots: VOLCENGINE_DOUBAO_AUDIO_FIXED_INPUT_SLOTS
  }),
  fields: [VOLCENGINE_DOUBAO_AUDIO_PITCH_FIELD, VOLCENGINE_DOUBAO_AUDIO_SPEED_FIELD, VOLCENGINE_DOUBAO_AUDIO_VOLUME_FIELD, VOLCENGINE_DOUBAO_AUDIO_FORMAT_FIELD]
});
export const volcengineSpeechTtsExecutionManifest = createAudioModelApiExecutionManifest({
  id: VOLCENGINE_TTS_EXECUTION_ID,
  provider: "volcengine-speech",
  model: "seed-tts-2.0",
  endpoint: "https://openspeech.bytedance.com/api/v3/tts/unidirectional",
  method: "POST",
  extensions: Object.freeze({
    resourceId: "seed-tts-2.0"
  })
});
export const volcengineDoubaoAudioGenerationExecutionManifest = createAudioModelApiExecutionManifest({
  id: VOLCENGINE_DOUBAO_AUDIO_GENERATION_EXECUTION_ID,
  provider: "volcengine-speech",
  model: "seed-audio-1.0",
  endpoint: "https://openspeech.bytedance.com/api/v3/tts/create",
  method: "POST",
  responseMapping: Object.freeze({
    resultPaths: Object.freeze(["url", "data.url", "audio_url"]),
    base64AudioField: "audio"
  }),
  extensions: Object.freeze({
    bodyResolver: "volcengineDoubaoAudioGeneration",
    proxyMode: "task",
    apiKeyHeader: "X-Api-Key",
    requestIdHeader: "X-Api-Request-Id"
  })
});
export const volcengineAudioModelApiModelManifests = Object.freeze([volcengineSpeechTtsModelManifest, volcengineDoubaoAudioGenerationModelManifest]);
export const volcengineAudioModelApiExecutionManifests = Object.freeze([volcengineSpeechTtsExecutionManifest, volcengineDoubaoAudioGenerationExecutionManifest]);