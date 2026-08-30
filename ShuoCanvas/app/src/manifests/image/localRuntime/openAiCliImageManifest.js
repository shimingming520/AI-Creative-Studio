const OPENAI_CLI_IMAGE_INPUT_SLOTS = Object.freeze({
  allowedKinds: Object.freeze(["text", "image"]),
  minByKind: Object.freeze({
    text: 0
  }),
  maxByKind: Object.freeze({
    image: 1,
    video: 0,
    audio: 0
  })
});
const OPENAI_CLI_IMAGE_UI_SCHEMA = Object.freeze({
  fields: Object.freeze([])
});
const OPENAI_CLI_IMAGE_RESULT = Object.freeze({
  urlFields: Object.freeze(["imageUrl", "url"])
});
export const OPENAI_CLI_IMAGE_MODEL_ID = "openai-cli/image-generation";
export const OPENAI_CLI_IMAGE_EXECUTION_ID = "openai-cli.local-runtime.image-generation.v1";
export const openAiCliImageModelManifests = Object.freeze([Object.freeze({
  schemaVersion: "1.0",
  modelId: OPENAI_CLI_IMAGE_MODEL_ID,
  provider: "openai-cli",
  kind: "image",
  adapterType: "localRuntime",
  executionId: OPENAI_CLI_IMAGE_EXECUTION_ID,
  displayName: "OpenAI 图像生成",
  description: "使用本机已登录的 OpenAI CLI，通过 Codex 图像生成能力创建图片",
  inputSlots: OPENAI_CLI_IMAGE_INPUT_SLOTS,
  uiSchema: OPENAI_CLI_IMAGE_UI_SCHEMA,
  async: false,
  cancellable: false,
  outputType: "image",
  extensions: Object.freeze({
    imageMenu: Object.freeze({
      group: "openai-cli",
      order: 10,
      title: "OpenAI 图像生成",
      subtitle: "本机 OpenAI CLI · 使用 Codex 可用额度 · 文生图/单图参考",
      iconKind: "openAiBadge"
    })
  })
})]);
export const openAiCliImageExecutionManifests = Object.freeze([Object.freeze({
  schemaVersion: "1.0",
  id: OPENAI_CLI_IMAGE_EXECUTION_ID,
  provider: "openai-cli",
  kind: "image",
  adapterType: "localRuntime",
  runtime: "openAiCliImage",
  result: OPENAI_CLI_IMAGE_RESULT,
  extensions: Object.freeze({
    cliProvider: "codex"
  })
})]);