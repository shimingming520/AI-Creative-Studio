import { getRunningHubModelApiProfileIds } from "../../../modules/runningHubProviderProfiles.js";
import { AGNES_MODEL_API_PROFILE_IDS } from "../../../modules/agnesProviderProfiles.js";
function createTextModelApiManifest({
  modelId: _0x1aeaed,
  executionId: _0x2d9e8d,
  displayName: _0x5cc1d9,
  aliases = null,
  provider = "runninghub",
  icon = "images/RH.png",
  description = "RunningHub image-to-text model API",
  inputSlots = null,
  extensions = null
}) {
  const _0xdb2505 = {
    schemaVersion: "1.0",
    modelId: _0x1aeaed,
    ...(Array.isArray(aliases) ? {
      aliases: aliases
    } : {}),
    provider: provider,
    kind: "text",
    adapterType: "modelApi",
    executionId: _0x2d9e8d,
    displayName: _0x5cc1d9,
    icon: icon,
    description: description,
    inputSlots: Object.freeze(inputSlots || {
      allowedKinds: Object.freeze(["image", "text"]),
      minByKind: Object.freeze({
        image: 1
      }),
      maxByKind: Object.freeze({
        image: 8,
        video: 0,
        audio: 0
      })
    }),
    uiSchema: Object.freeze({
      fields: Object.freeze([])
    }),
    async: true,
    cancellable: false,
    outputType: "text"
  };
  if (extensions && typeof extensions === "object") {
    _0xdb2505.extensions = Object.freeze(extensions);
  }
  return Object.freeze(_0xdb2505);
}
function createRunningHubTextModelApiManifest(_0x37ec80) {
  return Object.freeze({
    schemaVersion: "1.0",
    modelId: _0x37ec80.modelId,
    provider: "runninghub",
    kind: "text",
    adapterType: "modelApi",
    executionId: _0x37ec80.executionId,
    displayName: _0x37ec80.displayName,
    icon: "images/RH.png",
    description: "RunningHub image-to-text model API",
    inputSlots: Object.freeze({
      allowedKinds: Object.freeze(["image", "text"]),
      minByKind: Object.freeze({
        image: 1
      }),
      maxByKind: Object.freeze({
        image: 8,
        video: 0,
        audio: 0
      })
    }),
    uiSchema: Object.freeze({
      fields: Object.freeze([])
    }),
    ...(_0x37ec80.extensions && typeof _0x37ec80.extensions === "object" ? {
      extensions: Object.freeze(_0x37ec80.extensions)
    } : {}),
    async: true,
    cancellable: false,
    outputType: "text"
  });
}
function createTextExecutionManifest({
  id: _0x350eb6,
  model: _0x130c07,
  provider = "runninghub",
  endpoint = "/openapi/v2",
  endpointMode = "image-to-text",
  bodyMapping = null,
  responseMapping = null,
  result = null,
  extensions = null
}) {
  return Object.freeze({
    schemaVersion: "1.0",
    id: _0x350eb6,
    provider: provider,
    kind: "text",
    adapterType: "modelApi",
    endpoint: endpoint,
    endpointMode: endpointMode,
    method: "POST",
    model: _0x130c07,
    ...(extensions && typeof extensions === "object" ? {
      extensions: Object.freeze(extensions)
    } : {}),
    headers: Object.freeze({
      "Content-Type": "application/json"
    }),
    bodyMapping: Object.freeze(bodyMapping || {
      promptField: "prompt",
      inputImageField: "imageUrl"
    }),
    responseMapping: Object.freeze(responseMapping || {
      taskIdPath: "taskId",
      resultPaths: Object.freeze(["results[].text", "text", "output"])
    }),
    result: Object.freeze(result || {
      taskIdPath: "taskId",
      textFields: Object.freeze(["text", "output", "content"])
    })
  });
}
const RUNNINGHUB_IMAGE_TO_TEXT_MODELS = Object.freeze([Object.freeze({
  modelId: "runninghub-model/rhart-text-g-3-flash-preview-cv/image-to-text",
  executionId: "runninghub.model-api.rhart-text-g-3-flash-cv.v1",
  displayName: "RunningHub G-3 Flash CV",
  model: "rhart-text-g-3-flash-preview-cv/image-to-text"
}), Object.freeze({
  modelId: "runninghub-model/rhart-text-g-3-pro-preview-cv/image-to-text",
  executionId: "runninghub.model-api.rhart-text-g-3-pro-cv.v1",
  displayName: "RunningHub G-3 Pro CV",
  model: "rhart-text-g-3-pro-preview-cv/image-to-text"
})]);
const CHAT_COMPLETION_TEXT_INPUT_SLOTS = Object.freeze({
  allowedKinds: Object.freeze(["text", "image"]),
  minByKind: Object.freeze({
    text: 0,
    image: 0
  }),
  maxByKind: Object.freeze({
    image: 8,
    video: 0,
    audio: 0
  })
});
const CHAT_COMPLETION_TEXT_IMAGE_VIDEO_INPUT_SLOTS = Object.freeze({
  allowedKinds: Object.freeze(["text", "image", "video"]),
  minByKind: Object.freeze({
    text: 0,
    image: 0,
    video: 0
  }),
  maxByKind: Object.freeze({
    image: 8,
    video: 3,
    audio: 0
  })
});
const CHAT_COMPLETION_TEXT_IMAGE_SINGLE_VIDEO_INPUT_SLOTS = Object.freeze({
  allowedKinds: Object.freeze(["text", "image", "video"]),
  minByKind: Object.freeze({
    text: 0,
    image: 0,
    video: 0
  }),
  maxByKind: Object.freeze({
    image: 8,
    video: 1,
    audio: 0
  })
});
const CHAT_COMPLETION_TEXT_IMAGE_VIDEO_AUDIO_INPUT_SLOTS = Object.freeze({
  allowedKinds: Object.freeze(["text", "image", "video", "audio"]),
  minByKind: Object.freeze({
    text: 0,
    image: 0,
    video: 0,
    audio: 0
  }),
  maxByKind: Object.freeze({
    image: 8,
    video: 3,
    audio: 3
  })
});
const CHAT_COMPLETION_TEXT_ONLY_INPUT_SLOTS = Object.freeze({
  allowedKinds: Object.freeze(["text"]),
  minByKind: Object.freeze({
    text: 0
  }),
  maxByKind: Object.freeze({
    image: 0,
    video: 0,
    audio: 0
  })
});
function resolveRunningHubTextMenuTitle(_0x4cba1c) {
  const _0x5766e1 = String(_0x4cba1c || "").trim();
  return _0x5766e1.split("/").filter(Boolean).at(-1) || _0x5766e1;
}
const RUNNINGHUB_LLM_TEXT_MODELS = Object.freeze([Object.freeze({
  modelId: "qwen/qwen3.6-plus",
  executionId: "runninghub.model-api.text.qwen3-6-plus.v1",
  displayName: "Qwen3.6 Plus",
  model: "qwen/qwen3.6-plus",
  title: "qwen3.6-plus",
  subtitle: "阿里旗舰模型，支持长上下文与文本推理",
  icon: "qwen",
  inputSlots: CHAT_COMPLETION_TEXT_INPUT_SLOTS,
  order: 30
}), Object.freeze({
  modelId: "qwen/qwen3-vl-235b-a22b-instruct",
  executionId: "runninghub.model-api.text.qwen3-vl-235b-a22b-instruct.v1",
  displayName: "Qwen3-VL 235B A22B Instruct",
  model: "qwen/qwen3-vl-235b-a22b-instruct",
  title: "qwen3-vl-235b-a22b-instruct",
  subtitle: "视觉语言模型，适合图片识别与图文理解",
  icon: "qwen",
  inputSlots: CHAT_COMPLETION_TEXT_INPUT_SLOTS,
  order: 40
}), Object.freeze({
  modelId: "deepseek/deepseek-v4-flash",
  executionId: "runninghub.model-api.text.deepseek-v4-flash.v1",
  displayName: "DeepSeek V4 Flash",
  model: "deepseek/deepseek-v4-flash",
  title: "deepseek-v4-flash",
  subtitle: "DeepSeek V4 快速版，适合高频文本任务",
  icon: "deepseek",
  order: 50,
  structuredOutputMode: "json_object"
}), Object.freeze({
  modelId: "deepseek/deepseek-v4-pro",
  executionId: "runninghub.model-api.text.deepseek-v4-pro.v1",
  displayName: "DeepSeek V4 Pro",
  model: "deepseek/deepseek-v4-pro",
  title: "deepseek-v4-pro",
  subtitle: "DeepSeek V4 专业版，适合复杂推理与代码任务",
  icon: "deepseek",
  order: 60,
  structuredOutputMode: "json_object"
}), Object.freeze({
  modelId: "bytedance/doubao-seed-2.0-lite",
  executionId: "runninghub.model-api.text.doubao-seed-2-lite.v1",
  displayName: "Doubao Seed 2.0 Lite",
  model: "bytedance/doubao-seed-2.0-lite",
  title: "doubao-seed-2.0-lite",
  subtitle: "豆包 Seed 2.0 轻量版，适合低成本文本任务",
  icon: "runninghub",
  inputSlots: CHAT_COMPLETION_TEXT_INPUT_SLOTS,
  order: 70
}), Object.freeze({
  modelId: "bytedance/doubao-seed-2.0-pro",
  executionId: "runninghub.model-api.text.doubao-seed-2-pro.v1",
  displayName: "Doubao Seed 2.0 Pro",
  model: "bytedance/doubao-seed-2.0-pro",
  title: "doubao-seed-2.0-pro",
  subtitle: "豆包 Seed 2.0 旗舰版，适合复杂推理和文本生成",
  icon: "runninghub",
  inputSlots: CHAT_COMPLETION_TEXT_INPUT_SLOTS,
  order: 80
}), Object.freeze({
  modelId: "glm-5.2",
  executionId: "runninghub.model-api.text.glm-5-2.v1",
  displayName: "GLM-5.2",
  model: "glm-5.2",
  title: "glm-5.2",
  subtitle: "RunningHub GLM 文本生成模型",
  icon: "runninghub",
  order: 90
}), Object.freeze({
  modelId: "qwen/qwen3.7-max",
  executionId: "runninghub.model-api.text.qwen3-7-max.v1",
  displayName: "Qwen3.7 Max",
  model: "qwen/qwen3.7-max",
  title: "qwen/qwen3.7-max",
  subtitle: "RunningHub Qwen3.7 Max 文本生成模型",
  icon: "qwen",
  order: 100
}), Object.freeze({
  modelId: "qwen/qwen3.7-plus",
  executionId: "runninghub.model-api.text.qwen3-7-plus.v1",
  displayName: "Qwen3.7 Plus",
  model: "qwen/qwen3.7-plus",
  title: "qwen/qwen3.7-plus",
  subtitle: "RunningHub Qwen3.7 Plus 文本生成模型",
  icon: "qwen",
  inputSlots: CHAT_COMPLETION_TEXT_INPUT_SLOTS,
  order: 110
}), Object.freeze({
  modelId: "bytedance/doubao-seed-2.1-pro",
  executionId: "runninghub.model-api.text.doubao-seed-2-1-pro.v1",
  displayName: "Doubao Seed 2.1 Pro",
  model: "bytedance/doubao-seed-2.1-pro",
  title: "bytedance/doubao-seed-2.1-pro",
  subtitle: "RunningHub Doubao Seed 2.1 Pro 文本生成模型",
  icon: "runninghub",
  inputSlots: CHAT_COMPLETION_TEXT_INPUT_SLOTS,
  order: 120
}), Object.freeze({
  modelId: "bytedance/doubao-seed-2.1-turbo",
  executionId: "runninghub.model-api.text.doubao-seed-2-1-turbo.v1",
  displayName: "Doubao Seed 2.1 Turbo",
  model: "bytedance/doubao-seed-2.1-turbo",
  title: "bytedance/doubao-seed-2.1-turbo",
  subtitle: "RunningHub Doubao Seed 2.1 Turbo 文本生成模型",
  icon: "runninghub",
  inputSlots: CHAT_COMPLETION_TEXT_INPUT_SLOTS,
  order: 130
}), Object.freeze({
  modelId: "google/gemini-3.1-flash-lite-preview",
  executionId: "runninghub.model-api.text.gemini-3-1-flash-lite-preview.v1",
  displayName: "Gemini 3.1 Flash Lite Preview",
  model: "google/gemini-3.1-flash-lite-preview",
  subtitle: "RunningHub Gemini 3.1 Flash Lite Preview 文本生成模型",
  icon: "gemini",
  inputSlots: CHAT_COMPLETION_TEXT_IMAGE_SINGLE_VIDEO_INPUT_SLOTS,
  videoInput: true,
  order: 140
}), Object.freeze({
  modelId: "google/gemini-3.5-flash",
  executionId: "runninghub.model-api.text.gemini-3-5-flash.v1",
  displayName: "Gemini 3.5 Flash",
  model: "google/gemini-3.5-flash",
  subtitle: "RunningHub Gemini 3.5 Flash 文本生成模型",
  icon: "gemini",
  inputSlots: CHAT_COMPLETION_TEXT_IMAGE_SINGLE_VIDEO_INPUT_SLOTS,
  videoInput: true,
  order: 150
}), Object.freeze({
  modelId: "openai/gpt-5.6-sol",
  executionId: "runninghub.model-api.text.gpt-5-6-sol.v1",
  displayName: "GPT-5.6 Sol",
  model: "openai/gpt-5.6-sol",
  subtitle: "RunningHub GPT-5.6 Sol 文本生成模型",
  icon: "oa",
  order: 160
}), Object.freeze({
  modelId: "openai/gpt-5.6-terra",
  executionId: "runninghub.model-api.text.gpt-5-6-terra.v1",
  displayName: "GPT-5.6 Terra",
  model: "openai/gpt-5.6-terra",
  subtitle: "RunningHub GPT-5.6 Terra 文本生成模型",
  icon: "oa",
  order: 170
}), Object.freeze({
  modelId: "openai/gpt-5.5",
  executionId: "runninghub.model-api.text.gpt-5-5.v1",
  displayName: "GPT-5.5",
  model: "openai/gpt-5.5",
  subtitle: "RunningHub GPT-5.5 文本生成模型",
  icon: "oa",
  order: 180
}), Object.freeze({
  modelId: "openai/gpt-5.5-pro",
  executionId: "runninghub.model-api.text.gpt-5-5-pro.v1",
  displayName: "GPT-5.5 Pro",
  model: "openai/gpt-5.5-pro",
  subtitle: "RunningHub GPT-5.5 Pro 文本生成模型",
  icon: "oa",
  order: 190
}), Object.freeze({
  modelId: "anthropic/claude-fable-5",
  executionId: "runninghub.model-api.text.claude-fable-5.v1",
  displayName: "Claude Fable 5",
  model: "anthropic/claude-fable-5",
  subtitle: "RunningHub Claude Fable 5 文本生成模型",
  icon: "runninghub",
  order: 200
}), Object.freeze({
  modelId: "openai/gpt-5.4-pro",
  executionId: "runninghub.model-api.text.gpt-5-4-pro.v1",
  displayName: "GPT-5.4 Pro",
  model: "openai/gpt-5.4-pro",
  subtitle: "RunningHub GPT-5.4 Pro 文本生成模型",
  icon: "oa",
  order: 210
}), Object.freeze({
  modelId: "anthropic/claude-opus-4.8",
  executionId: "runninghub.model-api.text.claude-opus-4-8.v1",
  displayName: "Claude Opus 4.8",
  model: "anthropic/claude-opus-4.8",
  subtitle: "RunningHub Claude Opus 4.8 文本生成模型",
  icon: "runninghub",
  order: 220
}), Object.freeze({
  modelId: "anthropic/claude-opus-4.7",
  executionId: "runninghub.model-api.text.claude-opus-4-7.v1",
  displayName: "Claude Opus 4.7",
  model: "anthropic/claude-opus-4.7",
  subtitle: "RunningHub Claude Opus 4.7 文本生成模型",
  icon: "runninghub",
  order: 230
})]);
const VOLCENGINE_TEXT_MODELS = Object.freeze([Object.freeze({
  modelId: "volcengine/doubao-seed-2-1-pro-260628",
  executionId: "volcengine.model-api.text.doubao-seed-2-1-pro-260628.v1",
  displayName: "Doubao Seed 2.1 Pro",
  model: "doubao-seed-2-1-pro-260628",
  title: "Doubao Seed 2.1 Pro",
  subtitle: "火山方舟 Doubao Seed 2.1 Pro，面向复杂文本生成、深度推理与多模态理解",
  icon: "volcengine",
  order: 10
}), Object.freeze({
  modelId: "volcengine/doubao-seed-2-1-turbo-260628",
  executionId: "volcengine.model-api.text.doubao-seed-2-1-turbo-260628.v1",
  displayName: "Doubao Seed 2.1 Turbo",
  model: "doubao-seed-2-1-turbo-260628",
  title: "Doubao Seed 2.1 Turbo",
  subtitle: "火山方舟 Doubao Seed 2.1 Turbo，平衡效果、成本与响应速度",
  icon: "volcengine",
  order: 20
}), Object.freeze({
  modelId: "volcengine/doubao-seed-evolving",
  executionId: "volcengine.model-api.text.doubao-seed-evolving.v1",
  displayName: "Doubao Seed Evolving",
  model: "doubao-seed-evolving",
  title: "Doubao Seed Evolving",
  subtitle: "火山方舟 Doubao Seed Evolving，Seed 系列持续进化模型",
  icon: "volcengine",
  order: 30
}), Object.freeze({
  modelId: "volcengine/doubao-seed-2-0-pro-260215",
  executionId: "volcengine.model-api.text.doubao-seed-2-0-pro-260215.v1",
  displayName: "Doubao Seed 2.0 Pro",
  model: "doubao-seed-2-0-pro-260215",
  title: "Doubao Seed 2.0 Pro",
  subtitle: "火山方舟 Doubao Seed 2.0 Pro，适合复杂文本生成与推理",
  icon: "volcengine",
  order: 40
}), Object.freeze({
  modelId: "volcengine/doubao-seed-2-0-mini-260428",
  executionId: "volcengine.model-api.text.doubao-seed-2-0-mini-260428.v1",
  displayName: "Doubao Seed 2.0 Mini",
  model: "doubao-seed-2-0-mini-260428",
  title: "Doubao Seed 2.0 Mini",
  subtitle: "火山方舟 Doubao Seed 2.0 Mini，平衡效果与响应速度",
  icon: "volcengine",
  inputSlots: CHAT_COMPLETION_TEXT_IMAGE_VIDEO_AUDIO_INPUT_SLOTS,
  order: 50
}), Object.freeze({
  modelId: "volcengine/doubao-seed-2-0-lite-260428",
  executionId: "volcengine.model-api.text.doubao-seed-2-0-lite-260428.v1",
  displayName: "Doubao Seed 2.0 Lite",
  model: "doubao-seed-2-0-lite-260428",
  title: "Doubao Seed 2.0 Lite",
  subtitle: "火山方舟 Doubao Seed 2.0 Lite，适合高频文本任务",
  icon: "volcengine",
  inputSlots: CHAT_COMPLETION_TEXT_IMAGE_VIDEO_AUDIO_INPUT_SLOTS,
  order: 60
})]);
const AGNES_TEXT_MODELS = Object.freeze([Object.freeze({
  modelId: "agnes/agnes-2.0-flash",
  executionId: "agnes.model-api.text.agnes-2-flash.v1",
  displayName: "Agnes 2.0 Flash",
  model: "agnes-2.0-flash",
  title: "Agnes 2.0 Flash",
  subtitle: "Agnes AI fast text generation model",
  icon: "agnes",
  order: 10
}), Object.freeze({
  modelId: "agnes/agnes-2.5-flash",
  executionId: "agnes.model-api.text.agnes-2-5-flash.v1",
  displayName: "Agnes 2.5 Flash",
  model: "agnes-2.5-flash",
  title: "Agnes 2.5 Flash",
  subtitle: "Agnes AI text generation model",
  icon: "agnes",
  order: 20
}), Object.freeze({
  modelId: "agnes/agnes-2.5-pro-alpha",
  executionId: "agnes.model-api.text.agnes-2-5-pro-alpha.v1",
  displayName: "Agnes 2.5 Pro Alpha",
  model: "agnes-2.5-pro-alpha",
  title: "Agnes 2.5 Pro Alpha",
  subtitle: "Agnes AI advanced reasoning model",
  icon: "agnes",
  order: 30
}), Object.freeze({
  modelId: "agnes/agnes-2.5-pro",
  executionId: "agnes.model-api.text.agnes-2-5-pro.v1",
  displayName: "Agnes 2.5 Pro",
  model: "agnes-2.5-pro",
  title: "Agnes 2.5 Pro",
  subtitle: "Agnes AI production reasoning model",
  icon: "agnes",
  order: 40
})]);
const CHAT_COMPLETION_TEXT_RESPONSE_MAPPING = Object.freeze({
  resultPaths: Object.freeze(["choices[].message.content", "choices[].delta.content", "choices[].message.reasoning_content", "choices[].delta.reasoning_content", "data.choices[].message.content", "data.choices[].delta.content", "data.choices[].message.reasoning_content", "data.choices[].delta.reasoning_content", "text", "output"])
});
const VOLCENGINE_RESPONSES_TEXT_RESPONSE_MAPPING = Object.freeze({
  resultPaths: Object.freeze(["output_text", "data.output_text", "output[].content[].text", "output[].content[].content", "data.output[].content[].text", "data.output[].content[].content", "text", "output"])
});
const APIMART_TEXT_RESULT = Object.freeze({
  textFields: Object.freeze(["choices[].message.content", "choices[].message.reasoning_content", "text", "output"])
});
const APIMART_TEXT_EXECUTION_EXTENSIONS = Object.freeze({
  chatCompletionInputPolicy: "image-only"
});
const VOLCENGINE_TEXT_EXECUTION_EXTENSIONS = Object.freeze({
  chatCompletionInputPolicy: "image-video",
  thinkingControlMode: "thinking",
  volcengineFiles: Object.freeze({
    videoFps: 0.3
  })
});
const VOLCENGINE_TEXT_AUDIO_INPUT_EXECUTION_EXTENSIONS = Object.freeze({
  chatCompletionInputPolicy: "image-video-audio",
  thinkingControlMode: "thinking",
  volcengineFiles: Object.freeze({
    videoFps: 0.3
  })
});
const AGNES_TEXT_EXECUTION_EXTENSIONS = Object.freeze({
  chatCompletionInputPolicy: "image-only"
});
const RUNNINGHUB_LLM_TEXT_EXECUTION_EXTENSIONS = Object.freeze({
  endpointResolver: "runninghubLlmChatEndpoint",
  chatCompletionInputPolicy: "image-only",
  reasoningEffortMode: "openai"
});
const APIMART_GEMINI_NATIVE_VIDEO_EXTENSION = Object.freeze({
  endpointTemplate: "/v1beta/models/{model}:generateContent",
  imageUploadProvider: "apimart",
  videoUploadProvider: "runninghub",
  mediaPolicy: "image-video"
});
const APIMART_GEMINI_DISABLE_THINKING_CONTROL = Object.freeze({
  disabledBudget: 0,
  includeThoughts: false
});
const APIMART_GEMINI_REQUIRED_THINKING_CONTROL = Object.freeze({
  disabledUnsupported: true
});
function buildApimartTextExecutionExtensions(_0x2a23ff) {
  return Object.freeze({
    ...APIMART_TEXT_EXECUTION_EXTENSIONS,
    ...(_0x2a23ff.reasoningEffortMode ? {
      reasoningEffortMode: _0x2a23ff.reasoningEffortMode
    } : {}),
    ...(_0x2a23ff.thinkingControlMode ? {
      thinkingControlMode: _0x2a23ff.thinkingControlMode
    } : {}),
    ...(_0x2a23ff.structuredOutputMode ? {
      structuredOutputMode: _0x2a23ff.structuredOutputMode
    } : {}),
    ...(_0x2a23ff.videoInput ? {
      geminiNativeVideo: Object.freeze({
        ...APIMART_GEMINI_NATIVE_VIDEO_EXTENSION,
        thinkingControl: _0x2a23ff.geminiNativeThinkingControl || APIMART_GEMINI_DISABLE_THINKING_CONTROL
      })
    } : {})
  });
}
const GRSAI_TEXT_MODELS = Object.freeze([Object.freeze({
  modelId: "gpt-5.6-sol",
  executionId: "grsai.model-api.text.gpt-5-6-sol.v1",
  displayName: "gpt-5.6-sol",
  model: "gpt-5.6-sol",
  subtitle: "GRSAI chat completion model API",
  icon: "grsai",
  order: 10
}), Object.freeze({
  modelId: "gpt-5.4",
  executionId: "grsai.model-api.text.gpt-5-4.v1",
  displayName: "gpt-5.4",
  model: "gpt-5.4",
  subtitle: "GRSAI chat completion model API",
  icon: "grsai",
  order: 20
}), Object.freeze({
  modelId: "gpt-5.6-terra",
  executionId: "grsai.model-api.text.gpt-5-6-terra.v1",
  displayName: "gpt-5.6-terra",
  model: "gpt-5.6-terra",
  subtitle: "GRSAI chat completion model API",
  icon: "grsai",
  order: 30
}), Object.freeze({
  modelId: "gpt-5.5",
  executionId: "grsai.model-api.text.gpt-5-5.v1",
  displayName: "gpt-5.5",
  model: "gpt-5.5",
  subtitle: "GRSAI chat completion model API",
  icon: "grsai",
  order: 40
}), Object.freeze({
  modelId: "gemini-3-flash",
  executionId: "grsai.model-api.text.gemini-3-flash.v1",
  displayName: "gemini-3-flash",
  model: "gemini-3-flash",
  subtitle: "GRSAI Gemini 视频理解模型",
  icon: "grsai",
  inputSlots: CHAT_COMPLETION_TEXT_IMAGE_SINGLE_VIDEO_INPUT_SLOTS,
  videoInput: true,
  order: 50
}), Object.freeze({
  modelId: "gemini-3.1-pro",
  executionId: "grsai.model-api.text.gemini-3-1-pro.v1",
  displayName: "gemini-3.1-pro",
  model: "gemini-3.1-pro",
  subtitle: "Gemini 3.1 多模态理解与推理模型",
  icon: "grsai",
  order: 60
}), Object.freeze({
  modelId: "gemini-3-pro",
  executionId: "grsai.model-api.text.gemini-3-pro.v1",
  displayName: "gemini-3-pro",
  model: "gemini-3-pro",
  subtitle: "Gemini 3.0 多模态理解与推理模型",
  icon: "grsai",
  order: 70
}), Object.freeze({
  modelId: "gemini-3.1-flash-lite",
  executionId: "grsai.model-api.text.gemini-3-1-flash-lite.v1",
  displayName: "gemini-3.1-flash-lite",
  model: "gemini-3.1-flash-lite",
  subtitle: "Gemini 3.1 轻量多模态模型",
  icon: "grsai",
  order: 80
}), Object.freeze({
  modelId: "gemini-3.5-flash",
  executionId: "grsai.model-api.text.gemini-3-5-flash.v1",
  displayName: "gemini-3.5-flash",
  model: "gemini-3.5-flash",
  subtitle: "Gemini 多模态理解与推理模型",
  icon: "grsai",
  order: 90
}), Object.freeze({
  modelId: "gemini-2.5-flash",
  executionId: "grsai.model-api.text.gemini-2-5-flash.v1",
  displayName: "gemini-2.5-flash",
  model: "gemini-2.5-flash",
  subtitle: "Gemini 2.5 多模态理解模型",
  icon: "grsai",
  order: 100
}), Object.freeze({
  modelId: "gemini-2.5-pro",
  executionId: "grsai.model-api.text.gemini-2-5-pro.v1",
  displayName: "gemini-2.5-pro",
  model: "gemini-2.5-pro",
  subtitle: "Gemini 2.5 多模态理解与推理模型",
  icon: "grsai",
  order: 110
})]);
const PPIO_TEXT_MODELS = Object.freeze([Object.freeze({
  modelId: "minimax/minimax-m2.5-highspeed",
  executionId: "ppio.model-api.text.minimax-m2-5-highspeed.v1",
  displayName: "MiniMax M2.5-highspeed",
  model: "minimax/minimax-m2.5-highspeed",
  title: "minimax-m2.5-highspeed",
  subtitle: "更低延迟、更高性价比的领先模型",
  icon: "ppio",
  order: 10
}), Object.freeze({
  modelId: "qwen/qwen3.5-397b-a17b",
  executionId: "ppio.model-api.text.qwen3-5-397b-a17b.v1",
  displayName: "Qwen3.5-397B-A17B",
  model: "qwen/qwen3.5-397b-a17b",
  title: "qwen3.5-397b",
  subtitle: "阿里最强开源模型Qwen2.5",
  icon: "qwen",
  order: 20
}), Object.freeze({
  modelId: "deepseek/deepseek-v3.2",
  executionId: "ppio.model-api.text.deepseek-v3-2.v1",
  displayName: "DeepSeek-V3.2",
  model: "deepseek/deepseek-v3.2",
  title: "deepseek-v3",
  subtitle: "面向未来的新一代大模型",
  icon: "deepseek",
  order: 30
}), Object.freeze({
  modelId: "moonshotai/kimi-k2.5",
  executionId: "ppio.model-api.text.kimi-k2-5.v1",
  displayName: "Kimi K2.5",
  model: "moonshotai/kimi-k2.5",
  title: "kimi-k2.5",
  subtitle: "月之暗面最新版，超长上下文",
  icon: "moonshot",
  order: 40
})]);
const APIMART_TEXT_MODELS = Object.freeze([Object.freeze({
  modelId: "apimart/kimi-k2-instruct",
  executionId: "apimart.model-api.text.kimi-k2-instruct.v1",
  displayName: "Kimi K2 Instruct",
  model: "kimi-k2-instruct",
  subtitle: "APIMart text model",
  order: 10
}), Object.freeze({
  modelId: "apimart/deepseek-v4-pro",
  executionId: "apimart.model-api.text.deepseek-v4-pro.v1",
  displayName: "DeepSeek V4 Pro",
  model: "deepseek-v4-pro",
  subtitle: "APIMart text model",
  order: 20,
  structuredOutputMode: "json_object",
  thinkingControlMode: "thinking"
}), Object.freeze({
  modelId: "apimart/deepseek-v4-flash",
  executionId: "apimart.model-api.text.deepseek-v4-flash.v1",
  displayName: "DeepSeek V4 Flash",
  model: "deepseek-v4-flash",
  subtitle: "APIMart text model",
  order: 30,
  structuredOutputMode: "json_object",
  thinkingControlMode: "thinking"
}), Object.freeze({
  modelId: "apimart/gpt-5.5",
  executionId: "apimart.model-api.text.gpt-5-5.v1",
  displayName: "GPT-5.5",
  model: "gpt-5.5",
  subtitle: "OpenAI-compatible text model",
  order: 40,
  reasoningEffortMode: "openai"
}), Object.freeze({
  modelId: "apimart/gpt-5.6-luna",
  executionId: "apimart.model-api.text.gpt-5-6-luna.v1",
  displayName: "GPT-5.6 Luna",
  model: "gpt-5.6-luna",
  title: "gpt-5.6-luna",
  subtitle: "APIMart text model",
  order: 41,
  reasoningEffortMode: "openai"
}), Object.freeze({
  modelId: "apimart/gpt-5.6-terra",
  executionId: "apimart.model-api.text.gpt-5-6-terra.v1",
  displayName: "GPT-5.6 Terra",
  model: "gpt-5.6-terra",
  title: "gpt-5.6-terra",
  subtitle: "APIMart text model",
  order: 42,
  reasoningEffortMode: "openai"
}), Object.freeze({
  modelId: "apimart/gpt-5.6-sol",
  executionId: "apimart.model-api.text.gpt-5-6-sol.v1",
  displayName: "GPT-5.6 Sol",
  model: "gpt-5.6-sol",
  title: "gpt-5.6-sol",
  subtitle: "APIMart text model",
  order: 43,
  reasoningEffortMode: "openai"
}), Object.freeze({
  modelId: "apimart/claude-sonnet-5",
  executionId: "apimart.model-api.text.claude-sonnet-5.v1",
  displayName: "Claude Sonnet 5",
  model: "claude-sonnet-5",
  title: "claude-sonnet-5",
  subtitle: "APIMart text model",
  order: 44
}), Object.freeze({
  modelId: "apimart/claude-fable-5",
  executionId: "apimart.model-api.text.claude-fable-5.v1",
  displayName: "Claude Fable 5",
  model: "claude-fable-5",
  title: "claude-fable-5",
  subtitle: "APIMart text model",
  order: 45
}), Object.freeze({
  modelId: "apimart/gpt-5.4-mini",
  executionId: "apimart.model-api.text.gpt-5-4-mini.v1",
  displayName: "GPT-5.4 Mini",
  model: "gpt-5.4-mini",
  subtitle: "OpenAI-compatible text model",
  order: 50,
  reasoningEffortMode: "openai"
}), Object.freeze({
  modelId: "apimart/gpt-5.4",
  executionId: "apimart.model-api.text.gpt-5-4.v1",
  displayName: "GPT-5.4",
  model: "gpt-5.4-apimart",
  title: "gpt-5.4",
  subtitle: "极致逻辑与推理性能，OpenAI 巅峰之作",
  order: 55,
  reasoningEffortMode: "openai"
}), Object.freeze({
  modelId: "apimart/gemini-3.1-pro-preview",
  executionId: "apimart.model-api.text.gemini-3-1-pro-preview.v1",
  displayName: "Gemini 3.1 Pro Preview",
  model: "gemini-3.1-pro-preview",
  title: "gemini-3.1-pro-preview",
  subtitle: "旗舰级多模态模型，支持超长文本与深度分析",
  icon: "gemini",
  videoInput: true,
  order: 69
}), Object.freeze({
  modelId: "apimart/gemini-3-flash-preview-nothinking",
  executionId: "apimart.model-api.text.gemini-3-flash-nothinking.v1",
  displayName: "Gemini 3 Flash",
  model: "gemini-3-flash-preview-nothinking",
  title: "gemini-3-flash-preview-nothinking",
  subtitle: "闪电级响应速度，适用于高频率对话与实时任务",
  icon: "gemini",
  videoInput: true,
  order: 63
}), Object.freeze({
  modelId: "apimart/gemini-3.5-flash",
  executionId: "apimart.model-api.text.gemini-3-5-flash.v1",
  displayName: "Gemini 3.5 Flash",
  model: "gemini-3.5-flash",
  title: "gemini-3.5-flash",
  subtitle: "APIMart Gemini flash text model",
  icon: "gemini",
  videoInput: true,
  order: 71
}), Object.freeze({
  modelId: "apimart/gemini-2.5-flash",
  executionId: "apimart.model-api.text.gemini-2-5-flash.v1",
  displayName: "Gemini 2.5 Flash",
  model: "gemini-2.5-flash",
  subtitle: "APIMart Gemini 原生视频理解模型",
  icon: "gemini",
  videoInput: true,
  order: 56
}), Object.freeze({
  modelId: "apimart/gemini-2.5-flash-lite",
  executionId: "apimart.model-api.text.gemini-2-5-flash-lite.v1",
  displayName: "Gemini 2.5 Flash Lite",
  model: "gemini-2.5-flash-lite",
  subtitle: "APIMart Gemini 原生视频理解模型",
  icon: "gemini",
  videoInput: true,
  order: 57
}), Object.freeze({
  modelId: "apimart/gemini-2.5-flash-nothinking",
  executionId: "apimart.model-api.text.gemini-2-5-flash-nothinking.v1",
  displayName: "Gemini 2.5 Flash No Thinking",
  model: "gemini-2.5-flash-nothinking",
  subtitle: "APIMart Gemini 原生视频理解模型",
  icon: "gemini",
  videoInput: true,
  order: 58
}), Object.freeze({
  modelId: "apimart/gemini-2.5-flash-thinking",
  executionId: "apimart.model-api.text.gemini-2-5-flash-thinking.v1",
  displayName: "Gemini 2.5 Flash Thinking",
  model: "gemini-2.5-flash-thinking",
  subtitle: "APIMart Gemini 原生视频理解模型",
  icon: "gemini",
  videoInput: true,
  order: 59
}), Object.freeze({
  modelId: "apimart/gemini-2.5-pro",
  executionId: "apimart.model-api.text.gemini-2-5-pro.v1",
  displayName: "Gemini 2.5 Pro",
  model: "gemini-2.5-pro",
  subtitle: "APIMart Gemini 原生视频理解模型",
  icon: "gemini",
  videoInput: true,
  geminiNativeThinkingControl: APIMART_GEMINI_REQUIRED_THINKING_CONTROL,
  order: 60
}), Object.freeze({
  modelId: "apimart/gemini-2.5-pro-nothinking",
  executionId: "apimart.model-api.text.gemini-2-5-pro-nothinking.v1",
  displayName: "Gemini 2.5 Pro No Thinking",
  model: "gemini-2.5-pro-nothinking",
  subtitle: "APIMart Gemini 原生视频理解模型",
  icon: "gemini",
  videoInput: true,
  geminiNativeThinkingControl: APIMART_GEMINI_REQUIRED_THINKING_CONTROL,
  order: 61
}), Object.freeze({
  modelId: "apimart/gemini-2.5-pro-thinking",
  executionId: "apimart.model-api.text.gemini-2-5-pro-thinking.v1",
  displayName: "Gemini 2.5 Pro Thinking",
  model: "gemini-2.5-pro-thinking",
  subtitle: "APIMart Gemini 原生视频理解模型",
  icon: "gemini",
  videoInput: true,
  geminiNativeThinkingControl: APIMART_GEMINI_REQUIRED_THINKING_CONTROL,
  order: 62
}), Object.freeze({
  modelId: "apimart/gemini-3-flash-preview",
  executionId: "apimart.model-api.text.gemini-3-flash-preview.v1",
  displayName: "Gemini 3 Flash Preview",
  model: "gemini-3-flash-preview",
  subtitle: "APIMart Gemini 原生视频理解模型",
  icon: "gemini",
  videoInput: true,
  order: 64
}), Object.freeze({
  modelId: "apimart/gemini-3-flash-preview-thinking",
  executionId: "apimart.model-api.text.gemini-3-flash-preview-thinking.v1",
  displayName: "Gemini 3 Flash Preview Thinking",
  model: "gemini-3-flash-preview-thinking",
  subtitle: "APIMart Gemini 原生视频理解模型",
  icon: "gemini",
  videoInput: true,
  order: 65
}), Object.freeze({
  modelId: "apimart/gemini-3-pro-preview",
  executionId: "apimart.model-api.text.gemini-3-pro-preview.v1",
  displayName: "Gemini 3 Pro Preview",
  model: "gemini-3-pro-preview",
  subtitle: "APIMart Gemini 原生视频理解模型",
  icon: "gemini",
  videoInput: true,
  order: 66
}), Object.freeze({
  modelId: "apimart/gemini-3-pro-preview-thinking",
  executionId: "apimart.model-api.text.gemini-3-pro-preview-thinking.v1",
  displayName: "Gemini 3 Pro Preview Thinking",
  model: "gemini-3-pro-preview-thinking",
  subtitle: "APIMart Gemini 原生视频理解模型",
  icon: "gemini",
  videoInput: true,
  order: 67
}), Object.freeze({
  modelId: "apimart/gemini-3.1-pro-preview-thinking",
  executionId: "apimart.model-api.text.gemini-3-1-pro-preview-thinking.v1",
  displayName: "Gemini 3.1 Pro Preview Thinking",
  model: "gemini-3.1-pro-preview-thinking",
  subtitle: "APIMart Gemini 原生视频理解模型",
  icon: "gemini",
  videoInput: true,
  order: 70
}), Object.freeze({
  modelId: "apimart/gemini-3.5-flash-lite",
  executionId: "apimart.model-api.text.gemini-3-5-flash-lite.v1",
  displayName: "Gemini 3.5 Flash Lite",
  model: "gemini-3.5-flash-lite",
  subtitle: "APIMart Gemini 原生视频理解模型",
  icon: "gemini",
  videoInput: true,
  order: 72
}), Object.freeze({
  modelId: "apimart/gemini-3.6-flash",
  executionId: "apimart.model-api.text.gemini-3-6-flash.v1",
  displayName: "Gemini 3.6 Flash",
  model: "gemini-3.6-flash",
  subtitle: "APIMart Gemini 原生视频理解模型",
  icon: "gemini",
  videoInput: true,
  order: 73
}), Object.freeze({
  modelId: "apimart/glm-5.1",
  executionId: "apimart.model-api.text.glm-5-1.v1",
  displayName: "GLM-5.1",
  model: "glm-5.1",
  subtitle: "APIMart text model",
  order: 80
})]);
export const vendorTextModelApiModelManifests = Object.freeze([...RUNNINGHUB_IMAGE_TO_TEXT_MODELS.map(_0x5ae7da => createRunningHubTextModelApiManifest({
  modelId: _0x5ae7da.modelId,
  executionId: _0x5ae7da.executionId,
  displayName: _0x5ae7da.displayName,
  extensions: Object.freeze({
    providerProfiles: getRunningHubModelApiProfileIds(_0x5ae7da.modelId)
  })
})), ...RUNNINGHUB_LLM_TEXT_MODELS.map(_0x5cd284 => createTextModelApiManifest({
  modelId: _0x5cd284.modelId,
  executionId: _0x5cd284.executionId,
  displayName: resolveRunningHubTextMenuTitle(_0x5cd284.model),
  provider: "runninghub",
  icon: "images/RH.png",
  description: "RunningHub LLM chat completion model API",
  inputSlots: _0x5cd284.inputSlots || CHAT_COMPLETION_TEXT_ONLY_INPUT_SLOTS,
  extensions: Object.freeze({
    providerProfiles: getRunningHubModelApiProfileIds(_0x5cd284.modelId),
    textMenu: Object.freeze({
      group: "runninghub",
      order: _0x5cd284.order,
      title: resolveRunningHubTextMenuTitle(_0x5cd284.model),
      subtitle: _0x5cd284.subtitle,
      icon: _0x5cd284.icon
    })
  })
})), ...VOLCENGINE_TEXT_MODELS.map(_0x2fd272 => createTextModelApiManifest({
  modelId: _0x2fd272.modelId,
  executionId: _0x2fd272.executionId,
  displayName: _0x2fd272.displayName,
  aliases: Object.freeze([_0x2fd272.model]),
  provider: "volcengine",
  icon: "images/volcengine.svg",
  description: "Volcengine Ark chat completion model API",
  inputSlots: _0x2fd272.inputSlots || CHAT_COMPLETION_TEXT_IMAGE_VIDEO_INPUT_SLOTS,
  extensions: Object.freeze({
    textMenu: Object.freeze({
      group: "volcengine",
      order: _0x2fd272.order,
      title: _0x2fd272.title || _0x2fd272.displayName,
      subtitle: _0x2fd272.subtitle,
      icon: _0x2fd272.icon
    })
  })
})), ...GRSAI_TEXT_MODELS.map(_0x2268ad => createTextModelApiManifest({
  modelId: _0x2268ad.modelId,
  executionId: _0x2268ad.executionId,
  displayName: _0x2268ad.displayName,
  provider: "grsai",
  icon: "images/grsai.png",
  description: "GRSAI chat completion model API",
  inputSlots: _0x2268ad.inputSlots || CHAT_COMPLETION_TEXT_INPUT_SLOTS,
  extensions: Object.freeze({
    textMenu: Object.freeze({
      group: "grsai",
      order: _0x2268ad.order,
      title: _0x2268ad.title || _0x2268ad.displayName,
      subtitle: _0x2268ad.subtitle,
      icon: _0x2268ad.icon
    })
  })
})), ...PPIO_TEXT_MODELS.map(_0x1ea9ec => createTextModelApiManifest({
  modelId: _0x1ea9ec.modelId,
  executionId: _0x1ea9ec.executionId,
  displayName: _0x1ea9ec.displayName,
  provider: "ppio",
  icon: "images/ppio.png",
  description: "PPIO chat completion model API",
  inputSlots: CHAT_COMPLETION_TEXT_INPUT_SLOTS,
  extensions: Object.freeze({
    textMenu: Object.freeze({
      group: "ppio",
      order: _0x1ea9ec.order,
      title: _0x1ea9ec.title || _0x1ea9ec.displayName,
      subtitle: _0x1ea9ec.subtitle,
      icon: _0x1ea9ec.icon
    })
  })
})), ...APIMART_TEXT_MODELS.map(_0x3f1ba3 => createTextModelApiManifest({
  modelId: _0x3f1ba3.modelId,
  executionId: _0x3f1ba3.executionId,
  displayName: _0x3f1ba3.displayName,
  aliases: _0x3f1ba3.aliases,
  provider: "apimart",
  icon: "AM",
  description: "APIMart chat completion model API",
  inputSlots: _0x3f1ba3.videoInput ? CHAT_COMPLETION_TEXT_IMAGE_SINGLE_VIDEO_INPUT_SLOTS : CHAT_COMPLETION_TEXT_INPUT_SLOTS,
  extensions: Object.freeze({
    textMenu: Object.freeze({
      group: "apimart",
      order: _0x3f1ba3.order,
      title: _0x3f1ba3.title || _0x3f1ba3.displayName,
      subtitle: _0x3f1ba3.subtitle,
      ...(_0x3f1ba3.icon ? {
        icon: _0x3f1ba3.icon
      } : {})
    })
  })
})), ...AGNES_TEXT_MODELS.map(_0x542f47 => createTextModelApiManifest({
  modelId: _0x542f47.modelId,
  executionId: _0x542f47.executionId,
  displayName: _0x542f47.displayName,
  provider: "agnes",
  icon: "AG",
  description: "Agnes AI chat completion model API",
  inputSlots: CHAT_COMPLETION_TEXT_INPUT_SLOTS,
  extensions: Object.freeze({
    providerProfiles: AGNES_MODEL_API_PROFILE_IDS,
    textMenu: Object.freeze({
      group: "agnes",
      order: _0x542f47.order,
      title: _0x542f47.title || _0x542f47.displayName,
      subtitle: _0x542f47.subtitle,
      icon: _0x542f47.icon,
      ...(_0x542f47.badge ? {
        badge: _0x542f47.badge
      } : {})
    })
  })
}))]);
export const vendorTextModelApiExecutionManifests = Object.freeze([...RUNNINGHUB_IMAGE_TO_TEXT_MODELS.map(_0x21c4d1 => createTextExecutionManifest({
  id: _0x21c4d1.executionId,
  model: _0x21c4d1.model
})), ...RUNNINGHUB_LLM_TEXT_MODELS.map(_0x2c0be1 => createTextExecutionManifest({
  id: _0x2c0be1.executionId,
  provider: "runninghub",
  model: _0x2c0be1.model,
  endpoint: "/v1/chat/completions",
  endpointMode: "chat-completion",
  bodyMapping: Object.freeze({
    modelField: "model",
    messagesField: "messages"
  }),
  responseMapping: CHAT_COMPLETION_TEXT_RESPONSE_MAPPING,
  result: APIMART_TEXT_RESULT,
  extensions: Object.freeze({
    ...RUNNINGHUB_LLM_TEXT_EXECUTION_EXTENSIONS,
    ...(_0x2c0be1.videoInput ? {
      chatCompletionInputPolicy: "image-video"
    } : {}),
    ...(_0x2c0be1.structuredOutputMode ? {
      structuredOutputMode: _0x2c0be1.structuredOutputMode
    } : {})
  })
})), ...VOLCENGINE_TEXT_MODELS.map(_0x2ad2ce => createTextExecutionManifest({
  id: _0x2ad2ce.executionId,
  provider: "volcengine",
  model: _0x2ad2ce.model,
  endpoint: "/responses",
  endpointMode: "responses",
  bodyMapping: Object.freeze({
    modelField: "model",
    inputField: "input"
  }),
  responseMapping: VOLCENGINE_RESPONSES_TEXT_RESPONSE_MAPPING,
  result: APIMART_TEXT_RESULT,
  extensions: _0x2ad2ce.inputSlots ? VOLCENGINE_TEXT_AUDIO_INPUT_EXECUTION_EXTENSIONS : VOLCENGINE_TEXT_EXECUTION_EXTENSIONS
})), ...GRSAI_TEXT_MODELS.map(_0x421039 => createTextExecutionManifest({
  id: _0x421039.executionId,
  provider: "grsai",
  model: _0x421039.model,
  endpoint: "/v1",
  endpointMode: "chat-completion",
  bodyMapping: Object.freeze({
    modelField: "model",
    messagesField: "messages"
  }),
  responseMapping: CHAT_COMPLETION_TEXT_RESPONSE_MAPPING,
  result: APIMART_TEXT_RESULT,
  ...(_0x421039.videoInput ? {
    extensions: Object.freeze({
      chatCompletionInputPolicy: "image-video"
    })
  } : {})
})), ...PPIO_TEXT_MODELS.map(_0x4e867c => createTextExecutionManifest({
  id: _0x4e867c.executionId,
  provider: "ppio",
  model: _0x4e867c.model,
  endpoint: "/openai/v1",
  endpointMode: "chat-completion",
  bodyMapping: Object.freeze({
    modelField: "model",
    messagesField: "messages"
  }),
  responseMapping: CHAT_COMPLETION_TEXT_RESPONSE_MAPPING,
  result: APIMART_TEXT_RESULT
})), ...APIMART_TEXT_MODELS.map(_0x3e1f92 => createTextExecutionManifest({
  id: _0x3e1f92.executionId,
  provider: "apimart",
  model: _0x3e1f92.model,
  endpoint: "/v1/chat/completions",
  endpointMode: "chat-completion",
  bodyMapping: Object.freeze({
    modelField: "model",
    messagesField: "messages"
  }),
  responseMapping: CHAT_COMPLETION_TEXT_RESPONSE_MAPPING,
  result: APIMART_TEXT_RESULT,
  extensions: buildApimartTextExecutionExtensions(_0x3e1f92)
})), ...AGNES_TEXT_MODELS.map(_0x18b7df => createTextExecutionManifest({
  id: _0x18b7df.executionId,
  provider: "agnes",
  model: _0x18b7df.model,
  endpoint: "/v1/chat/completions",
  endpointMode: "chat-completion",
  bodyMapping: Object.freeze({
    modelField: "model",
    messagesField: "messages"
  }),
  responseMapping: CHAT_COMPLETION_TEXT_RESPONSE_MAPPING,
  result: APIMART_TEXT_RESULT,
  extensions: AGNES_TEXT_EXECUTION_EXTENSIONS
}))]);