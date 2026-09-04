const CLI_TEXT_INPUT_SLOTS = Object.freeze({
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
const EMPTY_TEXT_UI_SCHEMA = Object.freeze({
  fields: Object.freeze([])
});
const CLI_TEXT_RESULT = Object.freeze({
  textFields: Object.freeze(["text"])
});
function createCliTextModelManifest({
  modelId: _0x323b2e,
  executionId: _0x2d22c4,
  provider: _0x52bfea,
  displayName: _0x5b120d,
  icon: _0x3821ea,
  title: _0x34961e,
  subtitle: _0x489b1d,
  order: _0xb1561
}) {
  return Object.freeze({
    schemaVersion: "1.0",
    modelId: _0x323b2e,
    provider: _0x52bfea,
    kind: "text",
    adapterType: "localRuntime",
    executionId: _0x2d22c4,
    displayName: _0x5b120d,
    icon: _0x3821ea,
    description: _0x489b1d,
    inputSlots: CLI_TEXT_INPUT_SLOTS,
    uiSchema: EMPTY_TEXT_UI_SCHEMA,
    async: false,
    cancellable: false,
    outputType: "text",
    extensions: Object.freeze({
      textMenu: Object.freeze({
        group: _0x52bfea,
        order: _0xb1561,
        title: _0x34961e,
        subtitle: _0x489b1d,
        icon: "oa"
      })
    })
  });
}
function createCliTextExecutionManifest({
  id: _0x3f971d,
  provider: _0x3fdd90,
  cliProvider: _0x1c2e9c
}) {
  return Object.freeze({
    schemaVersion: "1.0",
    id: _0x3f971d,
    provider: _0x3fdd90,
    kind: "text",
    adapterType: "localRuntime",
    runtime: "cliText",
    result: CLI_TEXT_RESULT,
    extensions: Object.freeze({
      cliProvider: _0x1c2e9c
    })
  });
}
export const CODEX_CLI_TEXT_MODEL_ID = "codex-cli/default";
export const CODEX_CLI_TEXT_EXECUTION_ID = "codex-cli.local-runtime.text.default.v1";
export const cliTextModelManifests = Object.freeze([createCliTextModelManifest({
  modelId: CODEX_CLI_TEXT_MODEL_ID,
  executionId: CODEX_CLI_TEXT_EXECUTION_ID,
  provider: "codex-cli",
  displayName: "OpenAI CLI",
  icon: "OA",
  title: "OpenAI CLI",
  subtitle: "使用本机 ChatGPT/Codex 账号额度生成文本",
  order: 10
})]);
export const cliTextExecutionManifests = Object.freeze([createCliTextExecutionManifest({
  id: CODEX_CLI_TEXT_EXECUTION_ID,
  provider: "codex-cli",
  cliProvider: "codex"
})]);