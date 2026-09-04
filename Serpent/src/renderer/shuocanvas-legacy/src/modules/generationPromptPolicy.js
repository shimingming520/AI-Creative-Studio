import { normalizeProviderId, resolveModelExecution } from "../manifests/index.js";
export const PROMPT_EMPTY_POLICIES = Object.freeze({
  BLOCK: "block",
  ALLOW_WITH_INPUT: "allowWithInput",
  ALLOW: "allow"
});
export const PROMPT_EMPTY_POLICY_VALUES = Object.freeze(Object.values(PROMPT_EMPTY_POLICIES));
const DEFAULT_PROMPT_MIN_LENGTH = 1;
function isPlainObject(_0x87c78b) {
  return !!_0x87c78b && typeof _0x87c78b === "object" && !Array.isArray(_0x87c78b);
}
function normalizePromptEmptyPolicy(_0x3d4349) {
  const _0xb4e683 = String(_0x3d4349 || "").trim();
  if (PROMPT_EMPTY_POLICY_VALUES.includes(_0xb4e683)) {
    return _0xb4e683;
  } else {
    return "";
  }
}
function normalizePromptMinLength(_0x12c282) {
  if (_0x12c282 === undefined || _0x12c282 === null || _0x12c282 === "") {
    return DEFAULT_PROMPT_MIN_LENGTH;
  }
  const _0x41901a = Number(_0x12c282);
  if (Number.isInteger(_0x41901a) && _0x41901a >= 0) {
    return _0x41901a;
  } else {
    return DEFAULT_PROMPT_MIN_LENGTH;
  }
}
function resolveDefaultEmptyPolicy({
  modelManifest: _0x4f2ba1,
  executionManifest: _0x1460df,
  provider: _0x584ab2
}) {
  const _0x3cb56c = String(_0x4f2ba1?.adapterType || _0x1460df?.adapterType || "").trim();
  const _0x12b8e7 = [_0x584ab2, _0x4f2ba1?.provider, _0x1460df?.provider].map(normalizeProviderId);
  if (_0x3cb56c === "workflow" && _0x12b8e7.includes("runninghubwf")) {
    return PROMPT_EMPTY_POLICIES.ALLOW;
  }
  return PROMPT_EMPTY_POLICIES.BLOCK;
}
export function resolveGenerationPromptPolicy({
  model = "",
  provider = "",
  modelManifest = null,
  executionManifest = null
} = {}) {
  const _0x35a58e = modelManifest && executionManifest ? {
    modelManifest: modelManifest,
    executionManifest: executionManifest
  } : resolveModelExecution(model, {
    providerHint: provider
  }) || resolveModelExecution(model);
  const _0x5bd23b = modelManifest || _0x35a58e?.modelManifest || null;
  const _0x511de6 = executionManifest || _0x35a58e?.executionManifest || null;
  const _0x451a79 = isPlainObject(_0x5bd23b?.prompt) ? _0x5bd23b.prompt : {};
  const _0x2ec647 = normalizePromptEmptyPolicy(_0x451a79.emptyPolicy);
  const _0x113adb = _0x2ec647 || resolveDefaultEmptyPolicy({
    modelManifest: _0x5bd23b,
    executionManifest: _0x511de6,
    provider: provider
  });
  return {
    emptyPolicy: _0x113adb,
    minLength: normalizePromptMinLength(_0x451a79.minLength),
    modelManifest: _0x5bd23b,
    executionManifest: _0x511de6,
    source: _0x2ec647 ? "manifest" : "default"
  };
}
export function countPromptCharacters(_0x2de23a = "") {
  const _0x12a57b = String(_0x2de23a || "").trim();
  let _0x1cd4b0 = _0x12a57b.length;
  for (let _0x2fcf5c = 0; _0x2fcf5c < _0x12a57b.length - 1; _0x2fcf5c += 1) {
    const _0x3a583c = _0x12a57b.charCodeAt(_0x2fcf5c);
    if (_0x3a583c < 55296 || _0x3a583c > 56319) {
      continue;
    }
    const _0x54c5bc = _0x12a57b.charCodeAt(_0x2fcf5c + 1);
    if (_0x54c5bc < 56320 || _0x54c5bc > 57343) {
      continue;
    }
    _0x1cd4b0 -= 1;
    _0x2fcf5c += 1;
  }
  return _0x1cd4b0;
}
export function evaluateGenerationPromptBoundary({
  model = "",
  provider = "",
  promptText = "",
  hasInput = false,
  modelManifest = null,
  executionManifest = null
} = {}) {
  const _0x21e713 = resolveGenerationPromptPolicy({
    model: model,
    provider: provider,
    modelManifest: modelManifest,
    executionManifest: executionManifest
  });
  const _0x476541 = countPromptCharacters(promptText);
  if (_0x476541 >= _0x21e713.minLength) {
    return {
      ok: true,
      reason: "",
      promptLength: _0x476541,
      ..._0x21e713
    };
  }
  if (_0x476541 > 0) {
    return {
      ok: false,
      reason: "promptTooShort",
      promptLength: _0x476541,
      ..._0x21e713
    };
  }
  if (_0x21e713.emptyPolicy === PROMPT_EMPTY_POLICIES.ALLOW) {
    return {
      ok: true,
      reason: "",
      promptLength: _0x476541,
      ..._0x21e713
    };
  }
  if (_0x21e713.emptyPolicy === PROMPT_EMPTY_POLICIES.ALLOW_WITH_INPUT && hasInput === true) {
    return {
      ok: true,
      reason: "",
      promptLength: _0x476541,
      ..._0x21e713
    };
  }
  return {
    ok: false,
    reason: _0x21e713.emptyPolicy === PROMPT_EMPTY_POLICIES.ALLOW_WITH_INPUT ? "promptOrInputRequired" : "promptRequired",
    promptLength: _0x476541,
    ..._0x21e713
  };
}