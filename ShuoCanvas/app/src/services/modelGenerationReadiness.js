import { ensureConfig, getProviderConfig, isApiConfigLoaded } from "../../api/configApi.js";
import { fetchCliProviderStatuses, getCachedCliProviderStatus } from "../../api/cliProviderApi.js";
import { fetchDreaminaCliStatusFromServer, getCachedDreaminaCliStatus } from "../../api/dreaminaCliApi.js";
import { normalizeProviderId, resolveModelExecution, resolveModelProvider } from "../manifests/index.js";
import { PROVIDERS_META } from "../modules/providers.js";
import { normalizeModelProviderProfileId } from "../modules/modelProviderProfileSelection.js";
import { resolveRunningHubModelApiProfileId } from "../modules/runningHubProviderProfiles.js";
import { autoVerifyProviderConnection, getProviderConnectionFailureDetail } from "./providerConnectionAutoVerification.js";
const CREDENTIAL_FREE_PROVIDERS = new Set(["aicanvas", "claude-cli"]);
const KNOWN_CONFIGURABLE_PROVIDERS = new Set(Object.keys(PROVIDERS_META || {}));
const CLI_STATUS_REQUESTS = new Map();
function normalizeAdapterType(_0x34e71d) {
  const _0x38f074 = String(_0x34e71d || "").trim().toLowerCase();
  if (["modelapi", "model-api", "model_api"].includes(_0x38f074)) {
    return "modelApi";
  }
  if (["localruntime", "local-runtime", "local_runtime"].includes(_0x38f074)) {
    return "localRuntime";
  }
  if (_0x38f074 === "workflow") {
    return "workflow";
  } else {
    return "";
  }
}
function normalizeProfileId(_0xbcca4d) {
  return String(_0xbcca4d || "").trim().toLowerCase();
}
function getResolvedManifestContext(_0x4e1099 = {}) {
  const _0x19bc20 = String(_0x4e1099.modelId || _0x4e1099.model || "").trim();
  const _0x34d039 = String(_0x4e1099.provider || "").trim();
  const _0x2e93f7 = _0x4e1099.modelManifest && _0x4e1099.executionManifest ? {
    modelManifest: _0x4e1099.modelManifest,
    executionManifest: _0x4e1099.executionManifest
  } : resolveModelExecution(_0x19bc20, {
    providerHint: _0x34d039
  }) || resolveModelExecution(_0x19bc20);
  return {
    modelId: _0x19bc20,
    modelManifest: _0x2e93f7?.modelManifest || _0x4e1099.modelManifest || null,
    executionManifest: _0x2e93f7?.executionManifest || _0x4e1099.executionManifest || null
  };
}
function resolveProviderId(_0x7418a7, _0x450d2b) {
  return normalizeProviderId(_0x450d2b.modelManifest?.provider || _0x450d2b.executionManifest?.provider || _0x7418a7.provider || resolveModelProvider(_0x450d2b.modelId));
}
function resolveConfigProviderId({
  providerId: _0x57ac63,
  adapterType: _0x4ade37,
  providerProfileId: _0x53dea3
}) {
  const _0x4c27fc = normalizeProfileId(_0x53dea3);
  if (_0x4c27fc && KNOWN_CONFIGURABLE_PROVIDERS.has(_0x4c27fc)) {
    return _0x4c27fc;
  }
  if (_0x57ac63 === "runninghub" && (_0x4c27fc === "runninghub" || _0x4c27fc === "runninghub-international")) {
    return _0x4c27fc;
  }
  if (_0x57ac63 === "runninghub-international") {
    return "runninghub-international";
  }
  if (_0x57ac63 === "runninghubwf") {
    if (["runninghub", "runninghub-international"].includes(_0x4c27fc)) {
      return _0x4c27fc;
    } else {
      return "runninghub";
    }
  }
  if (_0x4ade37 === "workflow" && _0x57ac63 === "runninghub") {
    return _0x4c27fc || "runninghub";
  }
  return _0x57ac63;
}
function getCustomProviderDisplayName(_0x498f79, _0x347a4e) {
  return String(_0x498f79?.extensions?.customProvider?.displayName || PROVIDERS_META[_0x347a4e]?.label || _0x347a4e || "当前模型服务").trim();
}
function resolveCliProviderId(_0x42e939, _0x249fce) {
  const _0x2e4ed2 = normalizeProviderId(_0x249fce.executionManifest?.extensions?.cliProvider);
  if (_0x2e4ed2) {
    return _0x2e4ed2;
  }
  if (_0x42e939 === "dreamina") {
    return "dreamina";
  }
  if (["openai-cli", "codex-cli"].includes(_0x42e939)) {
    return "codex";
  }
  return "";
}
function getCliLoginFieldIds(_0xa47d75) {
  if (_0xa47d75 === "dreamina") {
    return ["btnDreaminaAuth", "dreaminaSettingsCard"];
  }
  if (_0xa47d75 === "codex") {
    return ["btnCodexCliLogin", "codexCliSettingsCard"];
  }
  return [];
}
function getCliProviderLabel(_0x4edbe7, _0x5791b7) {
  if (_0x4edbe7 === "dreamina") {
    return "即梦 CLI";
  }
  if (_0x4edbe7 === "codex") {
    return "OpenAI CLI";
  }
  return _0x5791b7;
}
function getCredentialFieldIds({
  providerId: _0x5e2b85,
  configProviderId: _0x461e74,
  credentialField: _0xd8d953
}) {
  if (_0x5e2b85 === "comfyui") {
    return ["providerUrl-comfyui", "providerUrl-comfyui-cloud"];
  }
  if (_0x5e2b85 === "runninghub" || _0x5e2b85 === "runninghubwf") {
    if (_0xd8d953 === "modelApiKey") {
      return ["providerKey-" + _0x461e74 + "-model", "providerKey-" + _0x461e74];
    } else {
      return ["providerKey-" + _0x461e74, "providerKey-" + _0x461e74 + "-model"];
    }
  }
  if (/^custom_[a-z0-9_-]+$/i.test(_0x5e2b85)) {
    return ["customProviderApiKey"];
  }
  return ["providerKey-" + (_0x461e74 || _0x5e2b85)];
}
function getModelAuthorizationCapability(_0x465a0e = {}) {
  return String(_0x465a0e.modelManifest?.extensions?.credentialAuthorization?.capability || "").trim();
}
export function resolveModelCredentialRequirement(_0xae10da = {}) {
  const _0x553b21 = getResolvedManifestContext(_0xae10da);
  const _0x22b7b9 = resolveProviderId(_0xae10da, _0x553b21);
  const _0x575053 = normalizeAdapterType(_0xae10da.adapterType || _0x553b21.executionManifest?.adapterType || _0x553b21.modelManifest?.adapterType);
  const _0x24dd73 = Boolean(_0x553b21.modelManifest || _0x553b21.executionManifest);
  const _0x5a5a84 = normalizeProfileId(_0xae10da.providerProfileId || _0xae10da.rhProviderProfileId || _0xae10da.payload?.providerProfileId || _0xae10da.payload?.rhProviderProfileId);
  const _0x2b0122 = _0x5a5a84 || (_0x22b7b9 === "runninghubwf" && _0x575053 === "workflow" ? normalizeProfileId(getProviderConfig("runninghubwf")?.providerProfileId) : "");
  const _0xf63059 = normalizeModelProviderProfileId(_0x553b21.modelManifest || _0x553b21.modelId, _0x2b0122);
  const _0x46dd06 = _0xf63059 || (_0x22b7b9 === "runninghub" && _0x575053 === "modelApi" ? resolveRunningHubModelApiProfileId(_0x553b21.modelManifest?.modelId || _0x553b21.modelId, _0x2b0122) : _0x24dd73 ? "" : _0x2b0122);
  const _0x46ec85 = resolveConfigProviderId({
    providerId: _0x22b7b9,
    adapterType: _0x575053,
    providerProfileId: _0x46dd06
  });
  const _0x279a4e = getCustomProviderDisplayName(_0x553b21.modelManifest, _0x46ec85 || _0x22b7b9);
  const _0x3ac52f = resolveCliProviderId(_0x22b7b9, _0x553b21);
  if (_0xae10da.credentialRequired === false || !_0x22b7b9) {
    return {
      required: false,
      adapterType: _0x575053,
      providerId: _0x22b7b9,
      configProviderId: _0x46ec85,
      providerLabel: _0x279a4e,
      modelId: _0x553b21.modelId,
      credentialField: "",
      fieldIds: []
    };
  }
  if (_0x3ac52f) {
    return {
      required: true,
      requirementType: "cliLogin",
      adapterType: _0x575053,
      providerId: _0x22b7b9,
      configProviderId: "",
      providerLabel: getCliProviderLabel(_0x3ac52f, _0x279a4e),
      cliProviderId: _0x3ac52f,
      modelId: _0x553b21.modelId,
      credentialField: "cliLogin",
      keyType: "cliLogin",
      fieldIds: getCliLoginFieldIds(_0x3ac52f)
    };
  }
  if (_0x575053 === "localRuntime" || CREDENTIAL_FREE_PROVIDERS.has(_0x22b7b9)) {
    return {
      required: false,
      adapterType: _0x575053,
      providerId: _0x22b7b9,
      configProviderId: _0x46ec85,
      providerLabel: _0x279a4e,
      modelId: _0x553b21.modelId,
      credentialField: "",
      fieldIds: []
    };
  }
  const _0x29d79d = /^custom_[a-z0-9_-]+$/i.test(_0x22b7b9);
  if (!_0x24dd73 && !_0x29d79d && !KNOWN_CONFIGURABLE_PROVIDERS.has(_0x22b7b9)) {
    return {
      required: false,
      adapterType: _0x575053,
      providerId: _0x22b7b9,
      configProviderId: _0x46ec85,
      providerLabel: _0x279a4e,
      modelId: _0x553b21.modelId,
      credentialField: "",
      fieldIds: []
    };
  }
  const _0x434103 = _0x22b7b9 === "comfyui" ? "apiUrl" : ["runninghub", "runninghub-international"].includes(_0x22b7b9) && _0x575053 === "modelApi" ? "modelApiKey" : "apiKey";
  const _0x4a537a = _0x434103 === "modelApiKey" ? "modelApi" : _0x434103 === "apiKey" ? _0x575053 : "endpoint";
  const _0x3f2244 = getModelAuthorizationCapability(_0x553b21);
  return {
    required: true,
    ...(_0x3f2244 ? {
      requirementType: "modelAuthorization",
      authorizationCapability: _0x3f2244
    } : {}),
    adapterType: _0x575053,
    providerId: _0x22b7b9,
    configProviderId: _0x46ec85,
    providerLabel: _0x279a4e,
    providerProfileId: _0x46dd06,
    modelId: _0x553b21.modelId,
    credentialField: _0x434103,
    keyType: _0x4a537a,
    verificationRequired: !_0x29d79d && KNOWN_CONFIGURABLE_PROVIDERS.has(_0x46ec85 || _0x22b7b9),
    fieldIds: getCredentialFieldIds({
      providerId: _0x22b7b9,
      configProviderId: _0x46ec85,
      credentialField: _0x434103
    })
  };
}
function readCredentialValue(_0x1caaa4, _0x5b3ce7 = {}) {
  const _0x389cd1 = _0x5b3ce7.payload || {};
  const _0x3eedd3 = _0x5b3ce7.providerConfig || {};
  if (_0x1caaa4.credentialField === "apiUrl") {
    return String(_0x3eedd3.apiUrl || _0x3eedd3.cloudApiUrl || _0x389cd1.apiUrl || _0x389cd1.baseUrl || "").trim();
  }
  if (_0x1caaa4.credentialField === "modelApiKey") {
    return String(_0x3eedd3.modelApiKey || _0x389cd1.modelApiKey || _0x389cd1.apiKey || "").trim();
  }
  return String(_0x3eedd3.apiKey || _0x389cd1.apiKey || "").trim();
}
function buildMissingCredentialMessage(_0x50a057) {
  if (_0x50a057.credentialField === "cliLogin") {
    return "请先登录 " + _0x50a057.providerLabel;
  }
  if (_0x50a057.credentialField === "apiUrl") {
    return "请先配置 " + _0x50a057.providerLabel + " 服务地址";
  }
  if (_0x50a057.credentialField === "modelApiKey") {
    return "请先配置 " + _0x50a057.providerLabel + " 模型 API Key";
  }
  return "请先配置 " + _0x50a057.providerLabel + " API Key";
}
function getProviderConnectionStatus(_0x2ff25e = {}) {
  return String(_0x2ff25e?.connectionVerification?.status || "").trim().toLowerCase();
}
function isProviderConnectionVerified(_0x5bae22 = {}) {
  return getProviderConnectionStatus(_0x5bae22) === "passed";
}
function getProviderConnectionCapability(_0xf50acd = {}) {
  if (!["runninghub", "runninghub-international"].includes(normalizeProfileId(_0xf50acd.configProviderId))) {
    return "";
  }
  if (_0xf50acd.credentialField === "modelApiKey") {
    return "modelApi";
  } else if (_0xf50acd.credentialField === "apiKey") {
    return "workflow";
  } else {
    return "";
  }
}
function getProviderConnectionCapabilityStatus(_0xbbfeb6, _0x249a6e = {}) {
  return String(_0x249a6e?.connectionVerification?.capabilities?.[_0xbbfeb6]?.status || "").trim().toLowerCase();
}
function isProviderConnectionCapabilityVerified(_0x31e2ae, _0x22efcc = {}) {
  return getProviderConnectionCapabilityStatus(_0x31e2ae, _0x22efcc) === "passed";
}
function buildUnverifiedConnectionMessage(_0x49e025, _0x53b58c = "") {
  const _0x141fc7 = _0x53b58c === "workflow" ? "工作流 API Key" : _0x53b58c === "modelApi" ? "模型 API Key" : "API 连接";
  return "请先验证 " + _0x49e025.providerLabel + " " + _0x141fc7;
}
function isModelAuthorizationVerified(_0x4a19d8, _0x5182c5 = {}) {
  const _0x122733 = String(_0x4a19d8?.authorizationCapability || "").trim();
  if (!_0x122733) {
    return false;
  }
  return String(_0x5182c5?.connectionVerification?.capabilities?.[_0x122733]?.status || "").trim().toLowerCase() === "passed";
}
function getModelAuthorizationStatus(_0x3c4607, _0x4b184e = {}) {
  const _0x2b1d3f = String(_0x3c4607?.authorizationCapability || "").trim();
  if (_0x2b1d3f) {
    return getProviderConnectionCapabilityStatus(_0x2b1d3f, _0x4b184e);
  } else {
    return "";
  }
}
export function evaluateModelGenerationReadiness(_0x4c82dd = {}) {
  const _0x48cc6a = _0x4c82dd.requirement || resolveModelCredentialRequirement(_0x4c82dd);
  if (!_0x48cc6a.required) {
    return {
      ready: true,
      status: "ready",
      reason: "credential-not-required",
      ..._0x48cc6a,
      message: ""
    };
  }
  if (_0x48cc6a.credentialField === "cliLogin") {
    const _0x48da84 = _0x4c82dd.cliStatus;
    if (!_0x48da84 || typeof _0x48da84 !== "object" || Array.isArray(_0x48da84)) {
      return {
        ready: false,
        status: "loading",
        reason: "cli-status-loading",
        ..._0x48cc6a,
        message: ""
      };
    }
    if (_0x48da84.loggedIn === true) {
      return {
        ready: true,
        status: "ready",
        reason: "cli-login-present",
        ..._0x48cc6a,
        message: ""
      };
    }
    return {
      ready: false,
      status: "missing",
      reason: "cli-login-missing",
      ..._0x48cc6a,
      message: buildMissingCredentialMessage(_0x48cc6a)
    };
  }
  if (_0x4c82dd.configLoaded === false && !_0x4c82dd.providerConfig && !_0x4c82dd.payload) {
    return {
      ready: false,
      status: "loading",
      reason: "config-loading",
      ..._0x48cc6a,
      message: ""
    };
  }
  const _0x2b3822 = readCredentialValue(_0x48cc6a, _0x4c82dd);
  if (_0x2b3822) {
    const _0x1cc4f6 = _0x4c82dd.providerConfig && typeof _0x4c82dd.providerConfig === "object" && !Array.isArray(_0x4c82dd.providerConfig);
    const _0x4f32f1 = _0x1cc4f6 ? Boolean(readCredentialValue(_0x48cc6a, {
      providerConfig: _0x4c82dd.providerConfig,
      payload: {}
    })) : false;
    if (_0x48cc6a.requirementType === "modelAuthorization") {
      if (_0x1cc4f6 && isModelAuthorizationVerified(_0x48cc6a, _0x4c82dd.providerConfig)) {
        return {
          ready: true,
          status: "ready",
          reason: "model-authorization-verified",
          ..._0x48cc6a,
          message: ""
        };
      }
      if (!_0x4f32f1) {
        return {
          ready: true,
          status: "ready",
          reason: "credential-present",
          ..._0x48cc6a,
          message: ""
        };
      }
      if (getModelAuthorizationStatus(_0x48cc6a, _0x4c82dd.providerConfig) === "failed") {
        return {
          ready: false,
          status: "missing",
          reason: "model-authorization-missing",
          ..._0x48cc6a,
          message: "请在设置中重新测试 " + _0x48cc6a.providerLabel + "，确认当前模型服务已开通"
        };
      }
      return {
        ready: true,
        status: "unverified",
        reason: "model-authorization-unverified",
        ..._0x48cc6a,
        message: _0x48cc6a.providerLabel + " 将在首次生成时自动验证"
      };
    }
    const _0x2b6632 = getProviderConnectionCapability(_0x48cc6a);
    if (_0x48cc6a.verificationRequired && _0x1cc4f6 && _0x4f32f1) {
      const _0x58c63d = _0x2b6632 ? isProviderConnectionCapabilityVerified(_0x2b6632, _0x4c82dd.providerConfig) : isProviderConnectionVerified(_0x4c82dd.providerConfig);
      if (!_0x58c63d) {
        const _0x3a4442 = _0x2b6632 ? getProviderConnectionCapabilityStatus(_0x2b6632, _0x4c82dd.providerConfig) : getProviderConnectionStatus(_0x4c82dd.providerConfig);
        if (_0x3a4442 === "failed") {
          return {
            ready: false,
            status: "missing",
            reason: "connection-validation-failed",
            ..._0x48cc6a,
            message: _0x48cc6a.providerLabel + " API 验证失败，请检查 Key 后重试"
          };
        }
        return {
          ready: true,
          status: "unverified",
          reason: _0x2b6632 ? "connection-capability-unverified" : "connection-unverified",
          ..._0x48cc6a,
          message: buildUnverifiedConnectionMessage(_0x48cc6a, _0x2b6632) + "；首次生成时将自动验证"
        };
      }
    }
    return {
      ready: true,
      status: "ready",
      reason: _0x48cc6a.verificationRequired && _0x1cc4f6 ? _0x2b6632 ? "connection-capability-verified" : "connection-verified" : "credential-present",
      ..._0x48cc6a,
      message: ""
    };
  }
  return {
    ready: false,
    status: "missing",
    reason: "credential-missing",
    ..._0x48cc6a,
    message: buildMissingCredentialMessage(_0x48cc6a)
  };
}
export function getModelGenerationReadiness(_0x29ef1a = {}) {
  const _0x287b0f = resolveModelCredentialRequirement(_0x29ef1a);
  if (_0x287b0f.credentialField === "cliLogin") {
    const _0x27aace = _0x287b0f.cliProviderId === "dreamina" ? getCachedDreaminaCliStatus() : getCachedCliProviderStatus(_0x287b0f.cliProviderId);
    return evaluateModelGenerationReadiness({
      ..._0x29ef1a,
      requirement: _0x287b0f,
      cliStatus: _0x27aace
    });
  }
  const _0x51e628 = isApiConfigLoaded();
  const _0xdca806 = _0x51e628 ? getProviderConfig(_0x287b0f.configProviderId || _0x287b0f.providerId) : null;
  return evaluateModelGenerationReadiness({
    ..._0x29ef1a,
    requirement: _0x287b0f,
    configLoaded: _0x51e628,
    providerConfig: _0xdca806
  });
}
async function ensureCliProviderStatus(_0x8b9857) {
  const _0x529104 = _0x8b9857 === "dreamina" ? getCachedDreaminaCliStatus() : getCachedCliProviderStatus(_0x8b9857);
  if (_0x529104) {
    return _0x529104;
  }
  if (CLI_STATUS_REQUESTS.has(_0x8b9857)) {
    return CLI_STATUS_REQUESTS.get(_0x8b9857);
  }
  const _0x1c2100 = _0x8b9857 === "dreamina" ? fetchDreaminaCliStatusFromServer({
    refresh: true
  }) : fetchCliProviderStatuses().then(() => getCachedCliProviderStatus(_0x8b9857));
  CLI_STATUS_REQUESTS.set(_0x8b9857, _0x1c2100);
  try {
    return await _0x1c2100;
  } finally {
    CLI_STATUS_REQUESTS.delete(_0x8b9857);
  }
}
export async function ensureModelGenerationReadiness(_0x41e9e7 = {}) {
  const _0x3b33b8 = resolveModelCredentialRequirement(_0x41e9e7);
  if (_0x3b33b8.credentialField === "cliLogin") {
    await ensureCliProviderStatus(_0x3b33b8.cliProviderId);
    return getModelGenerationReadiness(_0x41e9e7);
  }
  await ensureConfig();
  const _0x562327 = getModelGenerationReadiness(_0x41e9e7);
  if (_0x41e9e7.autoVerify !== true || _0x562327.status !== "unverified") {
    return _0x562327;
  }
  let _0x27a936;
  try {
    _0x27a936 = await autoVerifyProviderConnection(_0x3b33b8);
  } catch (_0x1ddc15) {
    _0x27a936 = {
      ok: false,
      error: _0x1ddc15?.message || "API 连接验证失败"
    };
  }
  const _0x457690 = getModelGenerationReadiness(_0x41e9e7);
  if (_0x457690.ready && _0x457690.status !== "unverified") {
    return _0x457690;
  }
  return {
    ..._0x457690,
    ready: false,
    status: "missing",
    reason: "connection-validation-failed",
    message: _0x3b33b8.providerLabel + " 自动验证未通过：" + getProviderConnectionFailureDetail(_0x27a936),
    validationResult: _0x27a936
  };
}
export function createMissingModelCredentialError(_0x197ee4) {
  const _0x5641f1 = _0x197ee4?.status === "missing" ? _0x197ee4 : evaluateModelGenerationReadiness(_0x197ee4 || {});
  const _0x5f2617 = new Error(_0x5641f1.message || "当前模型缺少可用的 API Key");
  _0x5f2617.name = "ModelCredentialMissingError";
  _0x5f2617.code = "MODEL_CREDENTIAL_MISSING";
  _0x5f2617.provider = _0x5641f1.providerId;
  _0x5f2617.providerId = _0x5641f1.configProviderId || _0x5641f1.providerId;
  _0x5f2617.keyType = _0x5641f1.keyType;
  _0x5f2617.adapterType = _0x5641f1.adapterType;
  _0x5f2617.model = _0x5641f1.modelId;
  _0x5f2617.fieldIds = _0x5641f1.fieldIds;
  return _0x5f2617;
}