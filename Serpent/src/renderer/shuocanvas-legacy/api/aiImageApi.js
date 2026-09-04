import { saveImage } from "../src/modules/storage.js";
import { compressImage } from "../src/modules/imageUtils.js";
import * as a37_0x568ba2 from "./adapters/RunningHubAdapter.js";
import * as a37_0x1f225a from "./adapters/ComfyUiAdapter.js";
import { buildImageRequestFromManifest, resolveManifestTaskPolling } from "./adapters/ModelApiManifestNormalizer.js";
import { resolveMappedImageResponseValues, resolveMappedResponseValue } from "./adapters/modelApiMappingEngine.js";
import { ensureConfig, getProviderConfig } from "./configApi.js";
import { applyCameraAngleToPrompt } from "./cameraPromptApi.js";
import { processInputImages, processInputImagesPreserveOrder } from "./imageUploadApi.js";
import { uploadInputToComfyUi } from "./comfyUiUploadApi.js";
import { normalizeApimartBaseUrl } from "./apimartUploadApi.js";
import { uploadInputsToVolcengineFiles } from "./volcengineFileApi.js";
import { cancelRunningHubTask } from "./runninghubTaskApi.js";
import { runDreaminaImageGeneration, runDreaminaImageUpscaleGeneration, buildDreaminaImageUpscaleSubmitPayload, pollDreaminaUntilDone, normalizeDreaminaTaskSnapshot } from "./dreaminaGenApi.js";
import { buildOpenAiCliImageSubmitRequest, runOpenAiCliImageGeneration } from "./openAiCliImageGenApi.js";
import { localPathToUrl, normalizeLocalPath, pickResultLocalPath } from "../src/utils/localMediaPath.js";
import { isModelApiModel, resolveModelExecution, resolveModelProvider } from "../src/manifests/index.js";
import { requester } from "./requester.js";
import { runTaskSingleFlight } from "./taskSingleFlight.js";
import { buildRunningHubModelApiUrl, getRunningHubTaskProviderProfileId, normalizeRunningHubModelApiProfileId, resolveRunningHubModelApiProfileId } from "../src/modules/runningHubProviderProfiles.js";
import { isRunningHubWorkflowQueueTarget, resolveRunningHubWorkflowQueueConfig, runWithRunningHubWorkflowQueue } from "./runningHubWorkflowQueue.js";
import { hasRunningHubWorkflowPollingTimedOut, resolveRunningHubWorkflowPollingPolicy } from "./runningHubWorkflowPollingPolicy.js";
import { ApiError, ErrorType, parseError, parseTaskError, parseNetworkError } from "./errors/index.js";
const GENERATION_TIMEOUT = 600000;
const MAX_MANIFEST_GENERATION_TIMEOUT = 3600000;
export async function cancelRunningHubImageTask(_0x4e7ad1 = {}) {
  return cancelRunningHubTask(_0x4e7ad1);
}
const GENERATION_RETRIES = 0;
const GENERATION_RETRY_DELAY = 1000;
const APIMART_MIDJOURNEY_MODEL_ID = "apimart/midjourney";
const APIMART_MIDJOURNEY_UPSCALE_RESPONSE_MAPPING = Object.freeze({
  taskIdPath: Object.freeze(["data[].task_id", "task_id", "taskId"]),
  statusPath: "status",
  errorPath: "error",
  resultPaths: Object.freeze(["image_urls[]", "image_url", "grid_image_url", "data.image_urls[]", "data.image_url", "data.grid_image_url", "data.result.images[].url", "result.images[].url", "data[].url", "results[].url", "results[].imageUrl", "url"])
});
function resolveGenerationRequestTimeout(_0x2aa5bf) {
  const _0x12b752 = Number(_0x2aa5bf?.requestTimeoutMs);
  if (!Number.isFinite(_0x12b752) || _0x12b752 <= 0) {
    return GENERATION_TIMEOUT;
  }
  return Math.min(MAX_MANIFEST_GENERATION_TIMEOUT, Math.max(30000, Math.trunc(_0x12b752)));
}
function buildApimartMidjourneyTaskPolling(_0x5cc8c4 = "") {
  const _0x25a6b4 = normalizeApimartBaseUrl(_0x5cc8c4);
  return {
    mode: "task-proxy",
    method: "GET",
    urlTemplate: _0x25a6b4 + "/v1/midjourney/{taskId}",
    headersMode: "bearer"
  };
}
function getProviderId(_0x2d2907) {
  return resolveModelProvider(_0x2d2907?.model, _0x2d2907?.provider);
}
function resolveModelApiExecutionForPayload(_0x367bf2, _0x49cec3) {
  const _0xca30cf = String(_0x49cec3 || "").trim().toLowerCase();
  const _0x47b7d1 = String(_0x367bf2?.model || "").trim();
  if (!_0x47b7d1) {
    return null;
  }
  const _0x51f57b = resolveModelExecution(_0x47b7d1, {
    providerHint: _0xca30cf
  });
  const _0x1f59d6 = _0x51f57b?.executionManifest;
  if (!_0x1f59d6 || _0x1f59d6.adapterType !== "modelApi" || _0x1f59d6.kind !== "image") {
    return null;
  }
  return _0x1f59d6;
}
function resolveImageTaskRuntimeOptions(_0x301d30 = {}, _0x65240a = "", _0x2eec0b = {}) {
  const _0x40889d = String(_0x301d30?.model || "").trim();
  if (!_0x40889d) {
    return _0x2eec0b || {};
  }
  const _0x3e21d1 = String(_0x65240a || getProviderId(_0x301d30) || "").trim().toLowerCase();
  const _0x3dfb03 = resolveModelExecution(_0x40889d, {
    providerHint: _0x3e21d1
  });
  const _0x53d97d = _0x3dfb03?.executionManifest;
  if (!_0x53d97d || _0x53d97d.adapterType !== "modelApi" || _0x53d97d.kind !== "image") {
    return _0x2eec0b || {};
  }
  const _0x29f802 = String(_0x53d97d.provider || _0x3e21d1).trim().toLowerCase();
  const _0x43427b = getProviderConfig(_0x29f802);
  const _0x4fa632 = resolveManifestTaskPolling(_0x29f802, _0x43427b, _0x53d97d, {
    modelManifest: _0x3dfb03?.modelManifest || null
  });
  return {
    ...(_0x2eec0b || {}),
    ...(!_0x2eec0b?.responseMapping && _0x53d97d.responseMapping ? {
      responseMapping: _0x53d97d.responseMapping
    } : {}),
    ...(!_0x2eec0b?.taskPolling && _0x4fa632 ? {
      taskPolling: _0x4fa632
    } : {})
  };
}
function shouldSubmitProviderBatchOnce(_0x279f9c, _0x592fb7, _0x7037e0) {
  if (!(Number.parseInt(_0x7037e0, 10) > 1)) {
    return false;
  }
  const _0x156a8d = resolveModelApiExecutionForPayload(_0x279f9c, _0x592fb7);
  const _0x942c6a = _0x156a8d?.extensions?.batchSubmitMode;
  if (_0x942c6a === "providerN") {
    return true;
  }
  if (!_0x942c6a || typeof _0x942c6a !== "object" || Array.isArray(_0x942c6a)) {
    return false;
  }
  if (String(_0x942c6a.type || "").trim() !== "providerN") {
    return false;
  }
  if (_0x942c6a.requiresInputImages === true) {
    const _0x17d98d = [_0x279f9c?.inputUrls, _0x279f9c?.image_urls, _0x279f9c?.imageUrls, _0x279f9c?.images];
    const _0x74b3e8 = _0x17d98d.some(_0x4847c0 => Array.isArray(_0x4847c0) ? _0x4847c0.some(_0x568a0c => String(_0x568a0c || "").trim()) : String(_0x4847c0 || "").trim());
    if (!_0x74b3e8) {
      return false;
    }
  }
  const _0x9fb90e = String(_0x942c6a.field || "").trim();
  if (!_0x9fb90e) {
    return true;
  }
  const _0x3b8461 = Array.isArray(_0x942c6a.values) ? _0x942c6a.values : [_0x942c6a.value];
  const _0x23aa06 = _0x3b8461.map(_0x5d3e17 => String(_0x5d3e17 ?? "").trim().toLowerCase()).filter(Boolean);
  if (_0x23aa06.length === 0) {
    return true;
  }
  const _0x501b14 = String(_0x279f9c?.[_0x9fb90e] ?? "").trim().toLowerCase();
  return _0x23aa06.includes(_0x501b14);
}
function resolveImageGenerationBatchSize(_0x12e692, _0x312795) {
  const _0x2caf2e = parseInt(_0x12e692?.batchSize, 10) || 1;
  const _0x37b7d8 = resolveModelApiExecutionForPayload(_0x12e692, _0x312795);
  const _0x6a8750 = Number.parseInt(_0x37b7d8?.extensions?.fixedBatchSize, 10);
  if (Number.isFinite(_0x6a8750) && _0x6a8750 >= 1) {
    return _0x6a8750;
  }
  const _0x23df68 = Number.parseInt(_0x37b7d8?.extensions?.maxBatchSize, 10);
  if (Number.isFinite(_0x23df68) && _0x23df68 >= 1) {
    return Math.min(_0x2caf2e, _0x23df68);
  }
  return _0x2caf2e;
}
function createImageBatchAttemptContext(_0x241895) {
  const _0x12c40b = Number.parseInt(_0x241895, 10);
  if (!Number.isFinite(_0x12c40b) || _0x12c40b <= 1) {
    return null;
  }
  return {
    __aicBatchSize: _0x12c40b,
    __aicBatchSeedNonce: Math.floor(Math.random() * 1000000000)
  };
}
function buildImageBatchAttemptPayload(_0x56e635, _0x23cdf4, _0x29dbd6) {
  if (!_0x23cdf4) {
    return _0x56e635;
  }
  return {
    ..._0x56e635,
    ..._0x23cdf4,
    __aicBatchIndex: _0x29dbd6
  };
}
function normalizeDreaminaImageGenerateNum(_0x94b937 = {}) {
  const _0x1cecfb = _0x94b937?.generateNum ?? _0x94b937?.generate_num ?? _0x94b937?.batchSize ?? 1;
  const _0x552f99 = Number.parseInt(_0x1cecfb, 10);
  if (!Number.isFinite(_0x552f99)) {
    return 1;
  }
  return Math.max(1, Math.min(10, _0x552f99));
}
function isRunningHubOpenApiV2AiApp(_0x1a7258) {
  const _0x1ec49d = String(_0x1a7258?.model || "");
  const _0x5f2700 = resolveModelExecution(_0x1ec49d)?.executionManifest;
  if (_0x5f2700?.adapterType === "workflow" && _0x5f2700?.submitMode === "openapi-v2-ai-app" && _0x5f2700?.queryMode === "openapi-v2-query") {
    return true;
  }
  return false;
}
function getDreaminaModelVersion(_0x2fadde, _0x3970b7 = null) {
  const _0x22fedc = String(_0x3970b7?.extensions?.dreaminaImage?.modelVersion || "").trim();
  if (_0x22fedc) {
    return _0x22fedc;
  }
  const _0x467822 = String(_0x2fadde?.modelVersion || "").trim();
  if (_0x467822) {
    return _0x467822;
  }
  const _0x114b67 = String(_0x2fadde?.model || "").trim();
  if (resolveModelProvider(_0x114b67, _0x2fadde?.provider) !== "dreamina") {
    return "";
  }
  const _0x1547cc = (_0x114b67.split("/")[1] || "").trim();
  if (/^(4\.0|4\.1|4\.5|5\.0)$/.test(_0x1547cc)) {
    return _0x1547cc;
  } else {
    return "";
  }
}
function getDreaminaAspectRatio(_0x1b9199, _0xb414f8) {
  const _0x5f2658 = String(_0x1b9199?.resolvedRatioLabel || "").trim();
  if (_0x5f2658) {
    return _0x5f2658;
  }
  const _0x40a935 = String(_0x1b9199?.aspectRatio || "").trim();
  if (!_0x40a935) {
    return "";
  }
  if (_0x40a935 === "自适应" || _0x40a935 === "auto") {
    if (_0xb414f8) {
      return "";
    } else {
      return "1:1";
    }
  }
  return _0x40a935;
}
function buildDreaminaImageSubmitRequest(_0x484f4d, _0x91b3ec, _0x54ba01 = null) {
  const _0x53cef1 = Array.isArray(_0x484f4d.inputUrls) ? _0x484f4d.inputUrls.filter(Boolean) : [];
  const _0x573fd8 = _0x53cef1.length > 0;
  const _0x5543d2 = getDreaminaModelVersion(_0x484f4d, _0x54ba01);
  const _0x347f25 = getDreaminaAspectRatio(_0x484f4d, _0x573fd8);
  const _0x405687 = String(_0x484f4d.imageSize || "").trim().toLowerCase();
  const _0x323c2a = normalizeDreaminaImageGenerateNum(_0x484f4d);
  const _0x1e6d0c = {
    prompt: _0x91b3ec
  };
  if (_0x347f25) {
    _0x1e6d0c.ratio = _0x347f25;
  }
  if (_0x405687) {
    _0x1e6d0c.resolutionType = _0x405687;
  }
  if (_0x5543d2) {
    _0x1e6d0c.modelVersion = _0x5543d2;
  }
  if (_0x323c2a > 1) {
    _0x1e6d0c.generateNum = _0x323c2a;
  }
  if (_0x53cef1.length > 0) {
    return {
      url: "/api/v2/dreamina/image2image",
      headers: {
        "Content-Type": "application/json"
      },
      body: {
        ..._0x1e6d0c,
        images: _0x53cef1
      }
    };
  }
  return {
    url: "/api/v2/dreamina/text2image",
    headers: {
      "Content-Type": "application/json"
    },
    body: _0x1e6d0c
  };
}
function buildDreaminaImageUpscaleSubmitRequest(_0x498329) {
  return {
    url: "/api/v2/dreamina/image_upscale",
    headers: {
      "Content-Type": "application/json"
    },
    body: buildDreaminaImageUpscaleSubmitPayload(_0x498329)
  };
}
const LOCAL_IMAGE_RUNTIME_HANDLERS = Object.freeze({
  dreaminaImage: Object.freeze({
    buildSubmitRequest: ({
      payload: _0x4eb979,
      finalPrompt: _0x26b4f1,
      executionManifest: _0x153ed4
    }) => buildDreaminaImageSubmitRequest(_0x4eb979, _0x26b4f1, _0x153ed4),
    run: ({
      payload: _0x423acf,
      options: _0x44d5ac,
      batchSize: _0x195116,
      executionManifest: _0x420ec4
    }) => {
      const _0x423719 = normalizeDreaminaImageGenerateNum({
        ..._0x423acf,
        batchSize: _0x195116
      });
      const _0x2a07de = getDreaminaModelVersion(_0x423acf, _0x420ec4);
      return runDreaminaImageGeneration({
        ..._0x423acf,
        ...(_0x2a07de ? {
          modelVersion: _0x2a07de
        } : {}),
        generateNum: _0x423719
      }, _0x44d5ac);
    }
  }),
  dreaminaImageUpscale: Object.freeze({
    buildSubmitRequest: ({
      payload: _0x3a96af
    }) => buildDreaminaImageUpscaleSubmitRequest(_0x3a96af),
    run: ({
      payload: _0x40a183,
      options: _0xe06a98
    }) => runDreaminaImageUpscaleGeneration(_0x40a183, _0xe06a98)
  }),
  openAiCliImage: Object.freeze({
    buildSubmitRequest: ({
      payload: _0x11c84e,
      finalPrompt: _0x2c4350,
      executionManifest: _0x3eb1d2
    }) => buildOpenAiCliImageSubmitRequest(_0x11c84e, _0x2c4350, _0x3eb1d2),
    run: ({
      payload: _0x54f791,
      executionManifest: _0x4bd200
    }) => runOpenAiCliImageGeneration(_0x54f791, _0x4bd200)
  })
});
function getLocalImageRuntimeHandler(_0xc7c395) {
  if (_0xc7c395?.adapterType !== "localRuntime") {
    return null;
  }
  const _0x3c97e9 = String(_0xc7c395?.runtime || "").trim();
  return LOCAL_IMAGE_RUNTIME_HANDLERS[_0x3c97e9] || null;
}
function getImageExecution(_0xe17ea8, _0x28ed57) {
  return resolveModelExecution(_0xe17ea8?.model, {
    providerHint: _0x28ed57
  });
}
function createMissingImageManifestError(_0x23b1c0, _0x1e2048) {
  const _0x1aaf91 = String(_0x23b1c0?.model || "").trim() || "(empty)";
  const _0x33738d = String(_0x1e2048 || "").trim().toLowerCase();
  if (_0x33738d === "runninghubwf") {
    return new Error("RunningHub workflow manifest missing: " + _0x1aaf91 + "; RunningHUB request requires a manifest");
  }
  if (_0x33738d === "runninghub") {
    return new Error("RunningHub model API manifest missing: " + _0x1aaf91);
  }
  const _0x4b76e9 = {
    agnes: "Agnes AI",
    apimart: "APIMart",
    grsai: "GRSAI",
    ppio: "PPIO",
    volcengine: "Volcengine"
  };
  const _0x12023e = _0x4b76e9[_0x33738d];
  if (_0x12023e) {
    return new Error(_0x12023e + " image model API manifest missing: " + _0x1aaf91);
  }
  return new Error("Image model API manifest missing: " + _0x1aaf91);
}
function collectDeepMediaUrls(_0x761040, _0xd7c3eb = 0, _0x4ba50e = new WeakSet()) {
  if (_0x761040 === undefined || _0x761040 === null || _0xd7c3eb > 8) {
    return [];
  }
  if (typeof _0x761040 === "string") {
    const _0x559765 = _0x761040.trim();
    if (/^https?:\/\//i.test(_0x559765)) {
      return [_0x559765];
    } else {
      return [];
    }
  }
  if (Array.isArray(_0x761040)) {
    return _0x761040.flatMap(_0x374ca2 => collectDeepMediaUrls(_0x374ca2, _0xd7c3eb + 1, _0x4ba50e));
  }
  if (typeof _0x761040 !== "object") {
    return [];
  }
  if (_0x4ba50e.has(_0x761040)) {
    return [];
  }
  _0x4ba50e.add(_0x761040);
  const _0xceff66 = ["url", "imageUrl", "image_url", "fileUrl", "file_url", "downloadUrl", "download_url"];
  const _0x539d82 = [];
  for (const _0x3d465c of _0xceff66) {
    _0x539d82.push(...collectDeepMediaUrls(_0x761040[_0x3d465c], _0xd7c3eb + 1, _0x4ba50e));
  }
  const _0x5c8724 = ["results", "result", "images", "image", "outputs", "output", "data"];
  for (const _0x30ab04 of _0x5c8724) {
    _0x539d82.push(...collectDeepMediaUrls(_0x761040[_0x30ab04], _0xd7c3eb + 1, _0x4ba50e));
  }
  return Array.from(new Set(_0x539d82.filter(Boolean)));
}
function extractImageUrls(_0x2bd4ca, _0x40c6cf = null) {
  const _0x2e0c02 = resolveMappedImageResponseValues(_0x2bd4ca, _0x40c6cf);
  if (_0x2e0c02.length > 0) {
    return _0x2e0c02;
  }
  const _0x31e5a3 = [];
  if (_0x2bd4ca.data?.result?.images && Array.isArray(_0x2bd4ca.data.result.images)) {
    _0x31e5a3.push(..._0x2bd4ca.data.result.images.map(_0xf3749e => Array.isArray(_0xf3749e.url) ? _0xf3749e.url[0] : _0xf3749e.url));
  } else if (_0x2bd4ca.result?.images && Array.isArray(_0x2bd4ca.result.images)) {
    _0x31e5a3.push(..._0x2bd4ca.result.images.map(_0x2b668b => Array.isArray(_0x2b668b.url) ? _0x2b668b.url[0] : _0x2b668b.url));
  } else if (_0x2bd4ca.status === "succeeded" && _0x2bd4ca.results) {
    _0x31e5a3.push(..._0x2bd4ca.results.map(_0x5d77fa => _0x5d77fa.url));
  } else if (_0x2bd4ca.data?.[0]?.url) {
    _0x31e5a3.push(..._0x2bd4ca.data.map(_0x203a3e => _0x203a3e.url));
  } else if (_0x2bd4ca.data?.[0]?.fileUrl) {
    _0x31e5a3.push(..._0x2bd4ca.data.map(_0x123a50 => _0x123a50.fileUrl));
  } else if (_0x2bd4ca.data?.results) {
    _0x31e5a3.push(..._0x2bd4ca.data.results.map(_0xdccc34 => _0xdccc34.url));
  } else if (_0x2bd4ca.data?.[0]?.image) {
    _0x31e5a3.push(..._0x2bd4ca.data.map(_0x30e2ad => _0x30e2ad.image));
  } else if (Array.isArray(_0x2bd4ca.images)) {
    _0x31e5a3.push(..._0x2bd4ca.images.map(_0x36fe65 => typeof _0x36fe65 === "string" ? _0x36fe65 : _0x36fe65.url || _0x36fe65.image_url));
  } else if (Array.isArray(_0x2bd4ca.image_urls)) {
    _0x31e5a3.push(..._0x2bd4ca.image_urls.map(_0x376d93 => typeof _0x376d93 === "string" ? _0x376d93 : _0x376d93.url));
  } else if (Array.isArray(_0x2bd4ca.results)) {
    _0x31e5a3.push(..._0x2bd4ca.results.map(_0x1405cc => _0x1405cc.url || _0x1405cc.imageUrl || _0x1405cc.image_url || _0x1405cc.image));
  } else if (_0x2bd4ca.url || _0x2bd4ca.image_url || _0x2bd4ca.fileUrl || _0x2bd4ca.file_url || _0x2bd4ca.image) {
    _0x31e5a3.push(_0x2bd4ca.url || _0x2bd4ca.image_url || _0x2bd4ca.fileUrl || _0x2bd4ca.file_url || _0x2bd4ca.image);
  }
  if (_0x31e5a3.length === 0) {
    _0x31e5a3.push(...collectDeepMediaUrls(_0x2bd4ca));
  }
  return Array.from(new Set(_0x31e5a3.filter(Boolean)));
}
function firstNonEmptyText(..._0x577d81) {
  for (const _0x2574f2 of _0x577d81) {
    let _0x209764 = "";
    if (_0x2574f2 && typeof _0x2574f2 === "object") {
      _0x209764 = firstNonEmptyText(_0x2574f2.message, _0x2574f2.errorMessage, _0x2574f2.error_message, _0x2574f2.reason, _0x2574f2.detail, _0x2574f2.details, _0x2574f2.msg) || (() => {
        try {
          return JSON.stringify(_0x2574f2);
        } catch {
          return "";
        }
      })();
    } else {
      _0x209764 = String(_0x2574f2 || "").trim();
    }
    if (_0x209764) {
      return _0x209764;
    }
  }
  return "";
}
function pickImageUrlFromResultItem(_0x2fe387) {
  if (typeof _0x2fe387 === "string") {
    const _0x342d4d = _0x2fe387.trim();
    if (/^(?:https?:\/\/|data:image\/)/i.test(_0x342d4d)) {
      return _0x342d4d;
    } else {
      return "";
    }
  }
  if (!_0x2fe387 || typeof _0x2fe387 !== "object") {
    return "";
  }
  for (const _0x1b5e2b of ["b64_json", "b64Json", "base64", "base64_data", "base64Data", "image_base64", "imageBase64"]) {
    const _0x3ad5c8 = Array.isArray(_0x2fe387[_0x1b5e2b]) ? _0x2fe387[_0x1b5e2b][0] : _0x2fe387[_0x1b5e2b];
    const _0x2fb8e8 = String(_0x3ad5c8 || "").trim();
    if (/^data:image\/[a-z0-9.+-]{1,64};base64,/i.test(_0x2fb8e8)) {
      return _0x2fb8e8;
    }
    if (_0x2fb8e8 && /^[a-z0-9+/=_-]+$/i.test(_0x2fb8e8.replace(/\s+/g, ""))) {
      const _0x2df66d = String(_0x2fe387.mime_type || _0x2fe387.mimeType || _0x2fe387.content_type || _0x2fe387.contentType || "image/png").trim().toLowerCase();
      const _0x3ad9e6 = /^image\/[a-z0-9.+-]{1,64}$/.test(_0x2df66d) ? _0x2df66d : "image/png";
      return "data:" + _0x3ad9e6 + ";base64," + _0x2fb8e8.replace(/\s+/g, "");
    }
  }
  for (const _0x1ae07f of ["url", "imageUrl", "image_url", "fileUrl", "file_url", "downloadUrl", "download_url", "image"]) {
    const _0x310385 = _0x2fe387[_0x1ae07f];
    const _0x5751bf = Array.isArray(_0x310385) ? _0x310385[0] : _0x310385;
    const _0x5cfc49 = String(_0x5751bf || "").trim();
    if (/^https?:\/\//i.test(_0x5cfc49)) {
      return _0x5cfc49;
    }
  }
  return collectDeepMediaUrls(_0x2fe387)[0] || "";
}
function pickImageResultError(_0x79884b) {
  if (!_0x79884b || typeof _0x79884b !== "object") {
    return "";
  }
  const _0x5d66eb = firstNonEmptyText(_0x79884b.error, _0x79884b.errorMessage, _0x79884b.message, _0x79884b.failure_reason, _0x79884b.failReason, _0x79884b.reason, _0x79884b.statusReason, _0x79884b?.data?.error, _0x79884b?.data?.errorMessage, _0x79884b?.data?.message, _0x79884b?.data?.failure_reason);
  if (_0x5d66eb) {
    return _0x5d66eb;
  }
  const _0x36ccc8 = String(_0x79884b.status || _0x79884b.taskStatus || _0x79884b.task_status || _0x79884b.state || "").trim().toLowerCase();
  if (["failed", "fail", "error", "rejected", "blocked", "filtered", "content_filtered", "content-filtered", "sensitive", "violation"].includes(_0x36ccc8)) {
    return "生成失败";
  }
  return "";
}
function getArrayAtPath(_0x3bd4d9, _0x57c910) {
  const _0x16d96b = String(_0x57c910 || "").split(".").filter(Boolean).reduce((_0x137dd9, _0x156c48) => {
    if (_0x137dd9 === undefined || _0x137dd9 === null) {
      return undefined;
    }
    return _0x137dd9[_0x156c48];
  }, _0x3bd4d9);
  if (Array.isArray(_0x16d96b)) {
    return _0x16d96b;
  } else {
    return null;
  }
}
function collectImageResultRecordArrays(_0x13ebdd) {
  const _0x53943c = [];
  const _0x7a430c = _0x100351 => {
    if (!Array.isArray(_0x100351) || _0x53943c.includes(_0x100351)) {
      return;
    }
    _0x53943c.push(_0x100351);
  };
  for (const _0x74197a of ["data.result.images", "result.images", "results", "data.results", "data", "images", "image_urls", "outputs", "output.images", "output.results"]) {
    _0x7a430c(getArrayAtPath(_0x13ebdd, _0x74197a));
  }
  return _0x53943c;
}
function normalizeImageResultRecordItem(_0xef0cf6) {
  const _0x4a16ee = pickImageUrlFromResultItem(_0xef0cf6);
  const _0x19193e = _0x4a16ee ? "" : pickImageResultError(_0xef0cf6);
  if (!_0x4a16ee && !_0x19193e) {
    return null;
  }
  return {
    sourceUrl: _0x4a16ee,
    error: _0x19193e,
    fullData: _0xef0cf6 && typeof _0xef0cf6 === "object" ? _0xef0cf6 : undefined
  };
}
function cloneRecordMetadata(_0x5379b1) {
  if (_0x5379b1?.metadata && typeof _0x5379b1.metadata === "object") {
    return {
      ..._0x5379b1.metadata
    };
  } else {
    return {};
  }
}
function firstApimartMidjourneySourceValue(..._0x1ca135) {
  for (const _0x45b581 of _0x1ca135) {
    if (_0x45b581 === true || _0x45b581 === false) {
      return _0x45b581;
    }
    const _0x5cd092 = String(_0x45b581 ?? "").trim();
    if (_0x5cd092) {
      return _0x5cd092;
    }
  }
  return "";
}
function normalizeApimartMidjourneySourceBoolean(_0x47e0b2) {
  if (_0x47e0b2 === true || _0x47e0b2 === false) {
    return _0x47e0b2;
  }
  const _0x7643ab = String(_0x47e0b2 ?? "").trim().toLowerCase();
  if (!_0x7643ab) {
    return false;
  }
  return _0x7643ab === "true" || _0x7643ab === "1" || _0x7643ab === "yes";
}
function resolveApimartMidjourneySourceMetadata(_0x1202e0 = {}) {
  const _0x25fe90 = _0x1202e0?.generationParams && typeof _0x1202e0.generationParams === "object" && !Array.isArray(_0x1202e0.generationParams) ? _0x1202e0.generationParams : {};
  const _0x4a9720 = String(firstApimartMidjourneySourceValue(_0x1202e0?.mjModel, _0x1202e0?.midjourneyModel, _0x1202e0?.version, _0x25fe90.mjModel, _0x25fe90.midjourneyModel, _0x25fe90.version)).trim();
  const _0x18b9b4 = String(firstApimartMidjourneySourceValue(_0x1202e0?.speed, _0x25fe90.speed)).trim().toLowerCase();
  const _0x47061f = String(firstApimartMidjourneySourceValue(_0x1202e0?.prompt, _0x25fe90.prompt)).trim();
  const _0x36c449 = String(firstApimartMidjourneySourceValue(_0x1202e0?.action, _0x1202e0?.mjAction, _0x25fe90.action, _0x25fe90.mjAction)).trim().toUpperCase();
  const _0x18bf61 = firstApimartMidjourneySourceValue(_0x1202e0?.hd, _0x1202e0?.isHd, _0x25fe90.hd, _0x25fe90.isHd);
  const _0x18dbed = {
    ...(_0x4a9720 ? {
      mjModel: _0x4a9720
    } : {}),
    ...(_0x18b9b4 === "relax" || _0x18b9b4 === "fast" || _0x18b9b4 === "turbo" ? {
      speed: _0x18b9b4
    } : {}),
    ...(_0x47061f ? {
      prompt: _0x47061f
    } : {}),
    ...(_0x36c449 ? {
      action: _0x36c449
    } : {})
  };
  if (_0x18bf61 !== "") {
    _0x18dbed.hd = normalizeApimartMidjourneySourceBoolean(_0x18bf61);
  }
  return _0x18dbed;
}
function isApimartMidjourneyResponseMapping(_0x5e9b9e = null) {
  const _0x29281a = Array.isArray(_0x5e9b9e?.resultPaths) ? _0x5e9b9e.resultPaths : [];
  return _0x29281a.includes("image_urls[]") && _0x29281a.includes("grid_image_url");
}
function normalizeApimartMidjourneyButtons(_0x31f466) {
  if (!Array.isArray(_0x31f466)) {
    return [];
  }
  return _0x31f466.map(_0x18a424 => {
    if (!_0x18a424 || typeof _0x18a424 !== "object") {
      return null;
    }
    const _0x4b1c26 = String(_0x18a424.customId || _0x18a424.custom_id || _0x18a424.customID || _0x18a424.id || "").trim();
    const _0x1e4131 = String(_0x18a424.label || _0x18a424.name || _0x18a424.text || _0x18a424.emoji || "").trim();
    const _0x300fe0 = {
      ...(_0x4b1c26 ? {
        customId: _0x4b1c26
      } : {}),
      ...(_0x1e4131 ? {
        label: _0x1e4131
      } : {})
    };
    if (Object.keys(_0x300fe0).length > 0) {
      return _0x300fe0;
    } else {
      return null;
    }
  }).filter(Boolean);
}
function extractApimartMidjourneyImageRecords(_0x500e07, _0x53ef16 = null, _0x4f4a26 = {}) {
  if (!isApimartMidjourneyResponseMapping(_0x53ef16)) {
    return [];
  }
  const _0xf8c51f = _0x500e07?.data && typeof _0x500e07.data === "object" && !Array.isArray(_0x500e07.data) ? {
    ..._0x500e07,
    ..._0x500e07.data
  } : _0x500e07;
  const _0x9345be = Array.isArray(_0xf8c51f?.image_urls) && _0xf8c51f.image_urls.length > 0 ? _0xf8c51f.image_urls : String(_0xf8c51f?.image_url || "").trim() ? [_0xf8c51f.image_url] : [];
  if (_0x9345be.length === 0) {
    return [];
  }
  const _0x495cdd = String(resolveApimartTaskIdStrict(_0xf8c51f) || resolveAsyncImageTaskId(_0xf8c51f, _0x53ef16) || _0xf8c51f?.id || "").trim();
  const _0x17bdc4 = String(_0xf8c51f?.grid_image_url || "").trim();
  const _0x205a6f = String(_0xf8c51f?.action || "").trim();
  const _0x31445a = normalizeApimartMidjourneyButtons(_0xf8c51f?.buttons);
  const _0x561f68 = resolveApimartMidjourneySourceMetadata(_0x4f4a26);
  const _0x59cd16 = _0x205a6f || _0x561f68.action || "";
  return _0x9345be.map((_0x331bae, _0x2be4a6) => {
    const _0x58d6a1 = String(_0x331bae || "").trim();
    if (!_0x58d6a1) {
      return null;
    }
    return {
      sourceUrl: _0x58d6a1,
      error: "",
      metadata: {
        provider: "apimart",
        model: APIMART_MIDJOURNEY_MODEL_ID,
        apimartMidjourney: {
          taskId: _0x495cdd,
          index: _0x2be4a6 + 1,
          ..._0x561f68,
          ...(_0x17bdc4 ? {
            gridImageUrl: _0x17bdc4
          } : {}),
          ...(_0x59cd16 ? {
            action: _0x59cd16
          } : {}),
          ...(_0x31445a.length > 0 ? {
            buttons: _0x31445a
          } : {})
        }
      }
    };
  }).filter(Boolean);
}
function extractImageResultRecords(_0x924cde, _0x3048ff = null, _0x5e7322 = {}) {
  const _0x211eac = extractApimartMidjourneyImageRecords(_0x924cde, _0x3048ff, _0x5e7322?.apimartMidjourneySource);
  if (_0x211eac.length > 0) {
    return _0x211eac;
  }
  for (const _0x5c6e12 of collectImageResultRecordArrays(_0x924cde)) {
    const _0x212123 = _0x5c6e12.map(_0xe17ba1 => normalizeImageResultRecordItem(_0xe17ba1)).filter(Boolean);
    if (_0x212123.length > 0) {
      return _0x212123;
    }
  }
  const _0x4083a0 = resolveMappedImageResponseValues(_0x924cde, _0x3048ff);
  if (_0x4083a0.length > 0) {
    return _0x4083a0.map(_0x482402 => ({
      sourceUrl: _0x482402,
      error: ""
    }));
  }
  return extractImageUrls(_0x924cde, _0x3048ff).map(_0x2f65d0 => ({
    sourceUrl: _0x2f65d0,
    error: ""
  }));
}
function hasImageResultOutput(_0x6bf3ea, _0x452dd4 = null) {
  return extractImageResultRecords(_0x6bf3ea, _0x452dd4).some(_0x293b81 => String(_0x293b81?.sourceUrl || "").trim());
}
export async function buildGenerateImageRequest(_0x165f86) {
  await ensureConfig();
  const _0x14b073 = applyCameraAngleToPrompt(_0x165f86.prompt, _0x165f86.cameraAngle);
  const _0x3ad428 = getProviderId(_0x165f86 || {});
  const _0x16df91 = getImageExecution(_0x165f86, _0x3ad428);
  const _0x2517a7 = _0x16df91?.executionManifest;
  const _0x3bb336 = _0x16df91?.modelManifest;
  const _0x587f71 = getLocalImageRuntimeHandler(_0x2517a7);
  if (_0x587f71) {
    return _0x587f71.buildSubmitRequest({
      payload: _0x165f86,
      finalPrompt: _0x14b073,
      executionManifest: _0x2517a7
    });
  }
  const _0x2df402 = {
    getProviderConfig: getProviderConfig,
    processInputImages: processInputImages,
    processInputImagesPreserveOrder: processInputImagesPreserveOrder,
    loadInputImageBlob: _0x445fa8 => requester({
      url: _0x445fa8,
      method: "GET",
      provider: "remote",
      buildUrl: false,
      responseType: "blob"
    }),
    uploadInputToComfyUi: uploadInputToComfyUi,
    uploadInputsToVolcengineFiles: uploadInputsToVolcengineFiles
  };
  if (_0x2517a7?.adapterType === "modelApi") {
    const _0x675349 = await buildImageRequestFromManifest(_0x165f86, _0x14b073, _0x2df402, {
      expectedProvider: _0x3bb336?.provider || _0x3ad428
    });
    if (_0x675349) {
      return _0x675349;
    }
    throw new Error((_0x3bb336?.provider || _0x3ad428) + " image model API manifest missing: " + _0x165f86.model);
  }
  if (_0x2517a7?.adapterType === "workflow") {
    if (_0x3bb336?.provider === "comfyui" || _0x3ad428 === "comfyui") {
      return a37_0x1f225a.buildImageRequest(_0x165f86, _0x14b073, _0x2df402);
    }
    return a37_0x568ba2.buildImageRequest(_0x165f86, _0x14b073, _0x2df402);
  }
  throw createMissingImageManifestError(_0x165f86, _0x3ad428);
}
function parseResponseData(_0x22d032) {
  const _0x18edd8 = _0x22d032.trim().replace(/^data:\s*/, "");
  try {
    return JSON.parse(_0x18edd8);
  } catch {
    const _0x32bb99 = extractSseJsonSnapshots(_0x22d032);
    if (_0x32bb99.length > 0) {
      for (const _0x564223 of _0x32bb99) {
        if (resolveAsyncImageTaskId(_0x564223)) {
          return _0x564223;
        }
      }
      return _0x32bb99[_0x32bb99.length - 1];
    }
    throw new ApiError({
      type: "PARSE_ERROR",
      message: "无法解析服务端响应",
      retryable: false
    });
  }
}
function extractSseJsonSnapshots(_0xc96fcc) {
  const _0x44d4b4 = String(_0xc96fcc || "").split("\n").filter(_0x22aa5d => _0x22aa5d.trim().startsWith("data:"));
  if (_0x44d4b4.length === 0) {
    return [];
  }
  const _0x1f4e64 = [];
  for (const _0x2c209a of _0x44d4b4) {
    const _0x40355f = String(_0x2c209a || "").trim().replace(/^data:\s*/, "").trim();
    if (!_0x40355f || _0x40355f === "[DONE]") {
      continue;
    }
    try {
      _0x1f4e64.push(JSON.parse(_0x40355f));
    } catch {}
  }
  return _0x1f4e64;
}
function resolveDirectOutputSnapshotFromRawText(_0x160857) {
  const _0x33de41 = extractSseJsonSnapshots(_0x160857);
  for (let _0xe81e04 = _0x33de41.length - 1; _0xe81e04 >= 0; _0xe81e04 -= 1) {
    const _0x4f30c9 = _0x33de41[_0xe81e04];
    if (hasImageResultOutput(_0x4f30c9)) {
      return _0x4f30c9;
    }
  }
  return null;
}
function extractTaskIdFromRawText(_0x3976ef) {
  const _0x38b3ae = String(_0x3976ef || "");
  if (!_0x38b3ae) {
    return "";
  }
  const _0x12a2eb = [/"task_id"\s*:\s*"?([a-zA-Z0-9._:-]+)"?/i, /"taskId"\s*:\s*"?([a-zA-Z0-9._:-]+)"?/i, /"taskid"\s*:\s*"?([a-zA-Z0-9._:-]+)"?/i, /"submit_id"\s*:\s*"?([a-zA-Z0-9._:-]+)"?/i, /"submitId"\s*:\s*"?([a-zA-Z0-9._:-]+)"?/i, /"job_id"\s*:\s*"?([a-zA-Z0-9._:-]+)"?/i, /"jobId"\s*:\s*"?([a-zA-Z0-9._:-]+)"?/i, /"request_id"\s*:\s*"?([a-zA-Z0-9._:-]+)"?/i, /"requestId"\s*:\s*"?([a-zA-Z0-9._:-]+)"?/i, /"task"\s*:\s*"?([a-zA-Z0-9._:-]{8,})"?/i, /"job"\s*:\s*"?([a-zA-Z0-9._:-]{8,})"?/i, /"request"\s*:\s*"?([a-zA-Z0-9._:-]{8,})"?/i, /"submit"\s*:\s*"?([a-zA-Z0-9._:-]{8,})"?/i, /"id"\s*:\s*"([^"]+)"/i, /\btask[_-]?id\b\s*[:=]\s*["']?([a-zA-Z0-9._:-]+)["']?/i, /\bsubmit[_-]?id\b\s*[:=]\s*["']?([a-zA-Z0-9._:-]+)["']?/i, /\bjob[_-]?id\b\s*[:=]\s*["']?([a-zA-Z0-9._:-]+)["']?/i, /\brequest[_-]?id\b\s*[:=]\s*["']?([a-zA-Z0-9._:-]+)["']?/i, /(?:\?|&)(?:task_id|taskId|taskid|job_id|request_id)=([a-zA-Z0-9._:-]+)/i, /\bid\b\s*[:=]\s*["']?([a-zA-Z0-9._:-]{8,})["']?/i];
  for (const _0x2bf51a of _0x12a2eb) {
    const _0x24a543 = _0x38b3ae.match(_0x2bf51a);
    const _0x211085 = String(_0x24a543?.[1] || "").trim();
    if (_0x211085) {
      return _0x211085;
    }
  }
  return "";
}
function extractRunningHubTaskIdFromRawText(_0x3ab6ac) {
  const _0x33d629 = String(_0x3ab6ac || "");
  if (!_0x33d629) {
    return "";
  }
  const _0x39003b = [/"task_id"\s*:\s*"?([a-zA-Z0-9._:-]+)"?/i, /"taskId"\s*:\s*"?([a-zA-Z0-9._:-]+)"?/i, /"taskid"\s*:\s*"?([a-zA-Z0-9._:-]+)"?/i, /\btask[_-]?id\b\s*[:=]\s*["']?([a-zA-Z0-9._:-]+)["']?/i, /(?:\?|&)(?:task_id|taskId|taskid)=([a-zA-Z0-9._:-]+)/i];
  for (const _0x4157a8 of _0x39003b) {
    const _0x2d9bc0 = _0x33d629.match(_0x4157a8);
    const _0x11b6d6 = String(_0x2d9bc0?.[1] || "").replace(/,/g, "").trim();
    if (_0x11b6d6) {
      return _0x11b6d6;
    }
  }
  return "";
}
function extractTaskIdFromResponseHeaders(_0x327e0a) {
  if (!_0x327e0a || typeof _0x327e0a.get !== "function") {
    return "";
  }
  const _0x5ea1dd = ["x-task-id", "x-taskid", "x-request-id", "x-requestid", "x-job-id", "x-jobid", "task-id", "taskid", "request-id", "requestid", "job-id", "jobid"];
  for (const _0x1aa338 of _0x5ea1dd) {
    const _0x583aa1 = String(_0x327e0a.get(_0x1aa338) || "").trim();
    if (_0x583aa1) {
      return _0x583aa1;
    }
  }
  if (typeof _0x327e0a.forEach === "function") {
    let _0x5e1c27 = "";
    _0x327e0a.forEach((_0x5276e6, _0x2fbeb7) => {
      if (_0x5e1c27) {
        return;
      }
      const _0x16c612 = String(_0x2fbeb7 || "").trim().toLowerCase();
      const _0x3ba110 = String(_0x5276e6 || "").trim();
      if (!_0x3ba110) {
        return;
      }
      if (_0x16c612.includes("task") && _0x16c612.includes("id") || _0x16c612.includes("job") && _0x16c612.includes("id") || _0x16c612.includes("request") && _0x16c612.includes("id") || _0x16c612.includes("submit") && _0x16c612.includes("id")) {
        _0x5e1c27 = _0x3ba110;
      }
    });
    if (_0x5e1c27) {
      return _0x5e1c27;
    }
  }
  return "";
}
function normalizeTaskIdValue(_0x79f518) {
  return String(_0x79f518 ?? "").replace(/,/g, "").trim();
}
function resolveRunningHubTaskId(_0x2737d3, _0x5e3e3c, _0x4a374e) {
  const _0x4d1100 = extractRunningHubTaskIdFromRawText(_0x5e3e3c);
  if (_0x4d1100) {
    return _0x4d1100;
  }
  const _0x49d19c = Array.isArray(_0x2737d3?.data) ? _0x2737d3.data[0] : _0x2737d3?.data && typeof _0x2737d3.data === "object" ? _0x2737d3.data : null;
  const _0x20d60e = Array.isArray(_0x2737d3?.results) ? _0x2737d3.results[0] : _0x2737d3?.results && typeof _0x2737d3.results === "object" ? _0x2737d3.results : null;
  const _0x27727f = _0x2737d3?.result && typeof _0x2737d3.result === "object" ? _0x2737d3.result : null;
  const _0x4ee57e = _0x2737d3?.output && typeof _0x2737d3.output === "object" ? _0x2737d3.output : null;
  const _0x193a7a = _0x2737d3?.response && typeof _0x2737d3.response === "object" ? _0x2737d3.response : null;
  const _0x335de9 = [_0x2737d3?.taskId, _0x2737d3?.task_id, _0x2737d3?.data?.taskId, _0x2737d3?.data?.task_id, _0x49d19c?.taskId, _0x49d19c?.task_id, _0x27727f?.taskId, _0x27727f?.task_id, _0x4ee57e?.taskId, _0x4ee57e?.task_id, _0x193a7a?.taskId, _0x193a7a?.task_id, _0x20d60e?.taskId, _0x20d60e?.task_id];
  for (const _0x425f21 of _0x335de9) {
    const _0x10a3e8 = normalizeTaskIdValue(_0x425f21);
    if (_0x10a3e8) {
      return _0x10a3e8;
    }
  }
  return normalizeTaskIdValue(extractTaskIdFromResponseHeaders(_0x4a374e));
}
function looksLikeTaskToken(_0x19e27d) {
  const _0x16fdc5 = String(_0x19e27d ?? "").trim();
  if (!_0x16fdc5) {
    return false;
  }
  if (_0x16fdc5.length < 8) {
    return false;
  }
  const _0x4415e2 = _0x16fdc5.toLowerCase();
  if (_0x4415e2 === "pending" || _0x4415e2 === "running" || _0x4415e2 === "success" || _0x4415e2 === "failed" || _0x4415e2 === "queued" || _0x4415e2 === "submitted") {
    return false;
  }
  return /^[a-zA-Z0-9._:-]+$/.test(_0x16fdc5);
}
function resolveAsyncImageTaskIdLoose(_0x4b8776) {
  if (!_0x4b8776 || typeof _0x4b8776 !== "object") {
    return "";
  }
  const _0x2ef098 = [_0x4b8776?.data, _0x4b8776?.task, _0x4b8776?.job, _0x4b8776?.request, _0x4b8776?.submit, _0x4b8776?.payload?.task, _0x4b8776?.payload?.task_id, _0x4b8776?.payload?.taskId];
  for (const _0xbed7e3 of _0x2ef098) {
    if (typeof _0xbed7e3 === "string" || typeof _0xbed7e3 === "number") {
      const _0x3ce5b5 = String(_0xbed7e3).trim();
      if (looksLikeTaskToken(_0x3ce5b5)) {
        return _0x3ce5b5;
      }
    }
  }
  const _0x2d0a7b = findFirstDeepValueByKeyPattern(_0x4b8776, /^(task|job|request|submit|task_?id|job_?id|request_?id|submit_?id)$/i);
  if (looksLikeTaskToken(_0x2d0a7b)) {
    return _0x2d0a7b;
  }
  return "";
}
function findFirstDeepValueByKeyPattern(_0x5a2d57, _0x49d826, _0x5d0bc2 = 8) {
  if (!_0x5a2d57 || typeof _0x5a2d57 !== "object") {
    return "";
  }
  const _0x342e33 = new WeakSet();
  const _0x2ef574 = [{
    value: _0x5a2d57,
    depth: 0
  }];
  while (_0x2ef574.length > 0) {
    const {
      value: _0x121306,
      depth: _0x24d308
    } = _0x2ef574.shift();
    if (!_0x121306 || typeof _0x121306 !== "object") {
      continue;
    }
    if (_0x342e33.has(_0x121306)) {
      continue;
    }
    _0x342e33.add(_0x121306);
    if (_0x24d308 > _0x5d0bc2) {
      continue;
    }
    const _0x2b92b5 = Array.isArray(_0x121306) ? _0x121306.map((_0x3c3dcf, _0x4510aa) => [String(_0x4510aa), _0x3c3dcf]) : Object.entries(_0x121306);
    for (const [_0x1403a9, _0x2a1fe1] of _0x2b92b5) {
      const _0x522dfb = String(_0x1403a9 || "").trim().toLowerCase();
      if (_0x49d826.test(_0x522dfb)) {
        const _0x9c185f = String(_0x2a1fe1 ?? "").trim();
        if (_0x9c185f) {
          return _0x9c185f;
        }
      }
      if (_0x2a1fe1 && typeof _0x2a1fe1 === "object") {
        _0x2ef574.push({
          value: _0x2a1fe1,
          depth: _0x24d308 + 1
        });
      }
    }
  }
  return "";
}
function extractTaskStatusFromRawText(_0x2b7edd) {
  const _0x3547bf = String(_0x2b7edd || "");
  if (!_0x3547bf) {
    return "";
  }
  const _0x3a0b5e = [/"status"\s*:\s*"([^"]+)"/i, /"taskStatus"\s*:\s*"([^"]+)"/i, /"task_status"\s*:\s*"([^"]+)"/i, /"phase"\s*:\s*"([^"]+)"/i, /"state"\s*:\s*"([^"]+)"/i, /\bstatus\b\s*[:=]\s*["']?([a-zA-Z_]+)["']?/i, /\bphase\b\s*[:=]\s*["']?([a-zA-Z_]+)["']?/i, /\bstate\b\s*[:=]\s*["']?([a-zA-Z_]+)["']?/i];
  for (const _0x3c4119 of _0x3a0b5e) {
    const _0x427b20 = _0x3547bf.match(_0x3c4119);
    const _0x4cb2ec = String(_0x427b20?.[1] || "").trim();
    if (_0x4cb2ec) {
      return _0x4cb2ec.toLowerCase();
    }
  }
  return "";
}
function resolveAsyncImageTaskId(_0x21f196, _0x266943 = null) {
  const _0x31d9af = resolveMappedResponseValue(_0x21f196, _0x266943?.taskIdPath);
  if (_0x31d9af) {
    return _0x31d9af;
  }
  const _0x29b2b1 = Array.isArray(_0x21f196?.data) ? _0x21f196.data[0] : _0x21f196?.data && typeof _0x21f196.data === "object" ? _0x21f196.data : null;
  const _0x295b04 = Array.isArray(_0x21f196?.results) ? _0x21f196.results[0] : _0x21f196?.results && typeof _0x21f196.results === "object" ? _0x21f196.results : null;
  const _0xfc201d = _0x21f196?.result && typeof _0x21f196.result === "object" ? _0x21f196.result : null;
  const _0x395aea = _0x21f196?.output && typeof _0x21f196.output === "object" ? _0x21f196.output : null;
  const _0x4e981c = _0x21f196?.response && typeof _0x21f196.response === "object" ? _0x21f196.response : null;
  const _0x5e90f3 = _0x29b2b1?.task_id || _0x29b2b1?.taskId || _0x29b2b1?.id || _0xfc201d?.task_id || _0xfc201d?.taskId || _0xfc201d?.id || _0x395aea?.task_id || _0x395aea?.taskId || _0x395aea?.id || _0x4e981c?.task_id || _0x4e981c?.taskId || _0x4e981c?.id || _0x21f196?.task_id || _0x21f196?.taskId || _0x21f196?.data?.task_id || _0x21f196?.data?.taskId || _0x21f196?.data?.id || _0x21f196?.id || _0x295b04?.task_id || _0x295b04?.taskId || _0x295b04?.id || findFirstDeepValueByKeyPattern(_0x21f196, /^(task_?id|taskid|request_?id|requestid)$/i) || findFirstDeepValueByKeyPattern(_0x21f196, /^id$/i) || "";
  return String(_0x5e90f3 || "").trim();
}
function resolveApimartTaskIdStrict(_0x3433bc) {
  const _0x13d48e = Array.isArray(_0x3433bc?.data) ? _0x3433bc.data[0] : _0x3433bc?.data && typeof _0x3433bc.data === "object" ? _0x3433bc.data : null;
  const _0xc3bfed = Array.isArray(_0x3433bc?.results) ? _0x3433bc.results[0] : _0x3433bc?.results && typeof _0x3433bc.results === "object" ? _0x3433bc.results : null;
  const _0x494efb = _0x3433bc?.result && typeof _0x3433bc.result === "object" ? _0x3433bc.result : null;
  const _0x96f887 = _0x3433bc?.output && typeof _0x3433bc.output === "object" ? _0x3433bc.output : null;
  const _0x3dd2f6 = _0x3433bc?.response && typeof _0x3433bc.response === "object" ? _0x3433bc.response : null;
  const _0x14d998 = _0x13d48e?.task_id || _0x13d48e?.taskId || _0x494efb?.task_id || _0x494efb?.taskId || _0x96f887?.task_id || _0x96f887?.taskId || _0x3dd2f6?.task_id || _0x3dd2f6?.taskId || _0x3433bc?.task_id || _0x3433bc?.taskId || _0x3433bc?.data?.task_id || _0x3433bc?.data?.taskId || _0xc3bfed?.task_id || _0xc3bfed?.taskId || findFirstDeepValueByKeyPattern(_0x3433bc, /^(task_?id|taskid)$/i) || "";
  return String(_0x14d998 || "").trim();
}
function collectApimartFallbackTaskIdCandidates(_0x5b5c87) {
  const _0x4b82bb = [];
  const _0x4a7a06 = _0x58b905 => {
    const _0x3f0d1c = String(_0x58b905 || "").trim();
    if (!_0x3f0d1c || _0x4b82bb.includes(_0x3f0d1c)) {
      return;
    }
    _0x4b82bb.push(_0x3f0d1c);
  };
  const _0x179fc0 = Array.isArray(_0x5b5c87?.data) ? _0x5b5c87.data[0] : _0x5b5c87?.data && typeof _0x5b5c87.data === "object" ? _0x5b5c87.data : null;
  const _0x5cf5d6 = Array.isArray(_0x5b5c87?.results) ? _0x5b5c87.results[0] : _0x5b5c87?.results && typeof _0x5b5c87.results === "object" ? _0x5b5c87.results : null;
  const _0xca56bf = _0x5b5c87?.result && typeof _0x5b5c87.result === "object" ? _0x5b5c87.result : null;
  const _0xb13518 = _0x5b5c87?.output && typeof _0x5b5c87.output === "object" ? _0x5b5c87.output : null;
  const _0x3a0ae9 = _0x5b5c87?.response && typeof _0x5b5c87.response === "object" ? _0x5b5c87.response : null;
  _0x4a7a06(_0x179fc0?.id);
  _0x4a7a06(_0xca56bf?.id);
  _0x4a7a06(_0xb13518?.id);
  _0x4a7a06(_0x3a0ae9?.id);
  _0x4a7a06(_0x5cf5d6?.id);
  _0x4a7a06(_0x5b5c87?.data?.id);
  _0x4a7a06(_0x5b5c87?.id);
  return _0x4b82bb;
}
function extractApimartTaskIdFromRawText(_0x110f24) {
  const _0x10fb48 = String(_0x110f24 || "");
  if (!_0x10fb48) {
    return "";
  }
  const _0x284abb = [/"task_id"\s*:\s*"?([a-zA-Z0-9._:-]+)"?/i, /"taskId"\s*:\s*"?([a-zA-Z0-9._:-]+)"?/i, /"taskid"\s*:\s*"?([a-zA-Z0-9._:-]+)"?/i, /\btask[_-]?id\b\s*[:=]\s*["']?([a-zA-Z0-9._:-]+)["']?/i, /(?:\?|&)task_id=([a-zA-Z0-9._:-]+)/i];
  for (const _0x3c4796 of _0x284abb) {
    const _0x5af858 = _0x10fb48.match(_0x3c4796);
    const _0x52bb8e = String(_0x5af858?.[1] || "").trim();
    if (_0x52bb8e) {
      return _0x52bb8e;
    }
  }
  return "";
}
function buildApimartTaskStatusUrl(_0x28aa8e, _0xf0e3ab = null, _0x71ec24 = "") {
  const _0x25f8f8 = String(_0x28aa8e || "").trim();
  const _0x1ef15b = buildManifestPollCandidate(_0x25f8f8, _0xf0e3ab);
  if (_0x1ef15b?.url) {
    return _0x1ef15b.url;
  }
  const _0x21a470 = normalizeApimartBaseUrl(_0x71ec24);
  return _0x21a470 + "/v1/tasks/" + encodeURIComponent(_0x25f8f8) + "?language=zh";
}
async function probeApimartTaskIdCandidate(_0x25c625, _0x132778, _0x3b8f77 = {}) {
  const _0x201917 = String(_0x25c625 || "").trim();
  if (!_0x201917) {
    return "";
  }
  const _0x18ef38 = getProviderConfig("apimart");
  const _0x1ccc25 = String(_0x132778?.apiKey || _0x18ef38?.apiKey || "").trim();
  if (!_0x1ccc25) {
    return "";
  }
  try {
    const _0x19187d = await requester({
      url: "/api/v2/proxy/task?apiUrl=" + encodeURIComponent(buildApimartTaskStatusUrl(_0x201917, _0x3b8f77?.taskPolling, _0x18ef38?.apiUrl)),
      method: "GET",
      headers: {
        Authorization: "Bearer " + _0x1ccc25
      },
      provider: "apimart",
      timeout: 30000,
      signal: _0x3b8f77?.signal
    });
    const _0x316b94 = normalizeTaskSnapshotPayload(_0x19187d);
    const _0x3b5a70 = _0x316b94 && typeof _0x316b94 === "object" && _0x316b94.data && typeof _0x316b94.data === "object" && !Array.isArray(_0x316b94.data);
    const _0x30fa84 = _0x3b5a70 ? {
      ..._0x316b94,
      ..._0x316b94.data
    } : normalizeTaskSnapshotPayload(_0x19187d?.data || _0x19187d);
    const _0x25cbee = parseTaskError("apimart", _0x30fa84);
    if (_0x25cbee) {
      return "";
    }
    return _0x201917;
  } catch {
    return "";
  }
}
async function resolveApimartTaskIdByProbe(_0x5c1eba, _0x1f43e7, _0x56eed9 = {}) {
  const _0xc83f02 = collectApimartFallbackTaskIdCandidates(_0x5c1eba);
  for (const _0x53b68d of _0xc83f02) {
    const _0xc6d86e = await probeApimartTaskIdCandidate(_0x53b68d, _0x1f43e7, _0x56eed9);
    if (_0xc6d86e) {
      return _0xc6d86e;
    }
  }
  return "";
}
function resolveAsyncImageTaskStatus(_0x431a3d) {
  const _0x3e7223 = Array.isArray(_0x431a3d?.data) ? _0x431a3d.data[0] : _0x431a3d?.data && typeof _0x431a3d.data === "object" ? _0x431a3d.data : null;
  const _0x119a47 = Array.isArray(_0x431a3d?.results) ? _0x431a3d.results[0] : _0x431a3d?.results && typeof _0x431a3d.results === "object" ? _0x431a3d.results : null;
  const _0x4fd494 = _0x431a3d?.result && typeof _0x431a3d.result === "object" ? _0x431a3d.result : null;
  const _0x20a788 = _0x431a3d?.output && typeof _0x431a3d.output === "object" ? _0x431a3d.output : null;
  const _0x58e4fc = _0x431a3d?.response && typeof _0x431a3d.response === "object" ? _0x431a3d.response : null;
  return String(_0x3e7223?.status || _0x431a3d?.status || _0x431a3d?.taskStatus || _0x431a3d?.task_status || _0x431a3d?.data?.status || _0x4fd494?.status || _0x4fd494?.taskStatus || _0x4fd494?.task_status || _0x20a788?.status || _0x20a788?.taskStatus || _0x20a788?.task_status || _0x58e4fc?.status || _0x58e4fc?.taskStatus || _0x58e4fc?.task_status || _0x119a47?.status || _0x431a3d?.state || _0x431a3d?.phase || findFirstDeepValueByKeyPattern(_0x431a3d, /^(task_?status|taskstatus|status|state|phase)$/i) || "").trim().toLowerCase();
}
function normalizeTaskSnapshotPayload(_0x3cb4b9) {
  if (_0x3cb4b9 && typeof _0x3cb4b9 === "object") {
    return _0x3cb4b9;
  }
  const _0x42e620 = String(_0x3cb4b9 || "").trim();
  if (!_0x42e620) {
    return {};
  }
  try {
    return parseResponseData(_0x42e620);
  } catch {
    try {
      return JSON.parse(_0x42e620);
    } catch {
      return {
        rawText: _0x42e620
      };
    }
  }
}
function isAsyncTaskTerminalStatus(_0x4f4a6d) {
  const _0x1d3c2c = String(_0x4f4a6d || "").trim().toLowerCase();
  return ["success", "succeeded", "completed", "complete", "finished", "finish", "done", "failed", "failure", "fail", "error", "cancelled", "canceled", "idle"].includes(_0x1d3c2c);
}
function isAsyncTaskPendingStatus(_0x5845e9) {
  const _0x155d91 = String(_0x5845e9 || "").trim().toLowerCase();
  return ["submitted", "pending", "queued", "waiting", "running", "processing", "querying", "in_progress"].includes(_0x155d91);
}
function isAsyncTaskFailureStatus(_0x23a889) {
  const _0x301349 = String(_0x23a889 || "").trim().toLowerCase();
  return ["failed", "failure", "fail", "error", "cancelled", "canceled", "idle"].includes(_0x301349);
}
function supportsAsyncImageTaskPolling(_0x3d9d07, _0x1c163c = {}) {
  const _0x26c875 = String(_0x3d9d07 || "").trim().toLowerCase();
  if (_0x26c875 === "comfyui") {
    return true;
  }
  if (["apimart", "ppio", "grsai"].includes(_0x26c875)) {
    return true;
  }
  const _0x125468 = _0x1c163c?.taskPolling;
  return !!_0x125468 && typeof _0x125468 === "object" && (!!String(_0x125468.urlTemplate || "").trim() || String(_0x125468.mode || "").trim() === "comfyui-history");
}
function buildManifestPollCandidate(_0x48ea0e, _0x239f67) {
  if (!_0x239f67 || typeof _0x239f67 !== "object") {
    return null;
  }
  const _0x2fb036 = String(_0x239f67.urlTemplate || "").trim();
  if (!_0x2fb036) {
    return null;
  }
  return {
    method: String(_0x239f67.method || "GET").trim().toUpperCase() || "GET",
    mode: String(_0x239f67.mode || "task-proxy").trim() || "task-proxy",
    url: _0x2fb036.replace("{taskId}", encodeURIComponent(_0x48ea0e))
  };
}
function isComfyUiHistoryPolling(_0x595daf = {}) {
  return String(_0x595daf?.mode || "").trim() === "comfyui-history";
}
async function pollComfyUiImageTask(_0x18d56b, _0x5b0b86 = {}) {
  const _0x281478 = String(_0x18d56b || "").trim();
  const _0x27a5c7 = _0x5b0b86?.taskPolling || {};
  const _0x2a8be8 = String(_0x27a5c7.baseUrl || "").trim();
  for (let _0x23085f = 0; _0x23085f < 450; _0x23085f++) {
    if (_0x5b0b86?.signal?.aborted) {
      throw new Error("CANCELLED");
    }
    await new Promise(_0x457a10 => setTimeout(_0x457a10, 2000));
    if (_0x5b0b86?.signal?.aborted) {
      throw new Error("CANCELLED");
    }
    const _0x4df9d0 = new URLSearchParams({
      promptId: _0x281478,
      ...(_0x2a8be8 ? {
        baseUrl: _0x2a8be8
      } : {}),
      ...(_0x27a5c7.allowCloudBaseUrl ? {
        allowCloudBaseUrl: "1"
      } : {})
    });
    const _0x56b27b = await requester({
      url: "/api/v2/comfyui/history?" + _0x4df9d0.toString(),
      method: "GET",
      provider: "comfyui",
      timeout: 30000,
      signal: _0x5b0b86?.signal
    });
    const _0x5851e6 = typeof _0x5b0b86?.resultExtractor === "function" ? _0x5b0b86.resultExtractor(_0x56b27b) : _0x56b27b;
    const _0x563b6b = hasImageResultOutput(_0x5851e6, _0x5b0b86?.responseMapping);
    if (_0x563b6b) {
      return _0x5851e6;
    }
    const _0x15a2b1 = resolveAsyncImageTaskStatus(_0x5851e6);
    if (isAsyncTaskFailureStatus(_0x15a2b1)) {
      throw ApiError.taskFailed("comfyui", String(_0x5851e6?.error || _0x5851e6?.message || "ComfyUI 任务执行失败"));
    }
  }
  throw ApiError.taskTimeout("comfyui");
}
async function pollAsyncImageTask(_0x336bc2, _0x2d6c48, _0x219ecc, _0x41b94b = {}) {
  const _0x3c9350 = String(_0x336bc2 || "").trim();
  if (!_0x3c9350) {
    throw new Error("缺少异步图片任务 ID");
  }
  const _0x111b07 = String(_0x219ecc || "").trim().toLowerCase();
  if (_0x111b07 === "comfyui" || isComfyUiHistoryPolling(_0x41b94b?.taskPolling)) {
    return pollComfyUiImageTask(_0x3c9350, _0x41b94b);
  }
  const _0xa89b6 = getProviderConfig(_0x111b07);
  const _0x5006df = String(_0x2d6c48?.apiKey || _0xa89b6?.apiKey || "").trim();
  if (!_0x5006df) {
    throw ApiError.authError(_0x111b07, null, "API Key 未配置（厂商：" + _0x111b07 + "），无法轮询任务");
  }
  const _0x5d1a9d = _0x41b94b?.pollIntervalMs === undefined ? _0x41b94b?.taskPolling?.pollIntervalMs : _0x41b94b.pollIntervalMs;
  const _0x27102a = _0x5d1a9d === undefined ? 2000 : Math.max(0, Number(_0x5d1a9d) || 0);
  const _0x4726bc = Math.max(1, Number(_0x41b94b?.maxPolls) || 450);
  const _0x370ef5 = _0x41b94b?.softTimeout === true;
  for (let _0x4b098f = 0; _0x4b098f < _0x4726bc; _0x4b098f++) {
    if (_0x41b94b?.signal?.aborted) {
      throw new Error("CANCELLED");
    }
    if (_0x27102a > 0) {
      await new Promise(_0x5f08b4 => setTimeout(_0x5f08b4, _0x27102a));
    }
    if (_0x41b94b?.signal?.aborted) {
      throw new Error("CANCELLED");
    }
    const _0x16a71e = String(_0xa89b6?.apiUrl || "").replace(/\/+$/, "");
    const _0x1f6cb9 = buildManifestPollCandidate(_0x3c9350, _0x41b94b?.taskPolling);
    const _0x9b2532 = _0x111b07 === "apimart" ? [{
      method: "GET",
      mode: "task-proxy",
      url: buildApimartTaskStatusUrl(_0x3c9350, null, _0xa89b6?.apiUrl)
    }] : _0x111b07 === "ppio" ? [{
      method: "GET",
      mode: "task-proxy",
      url: _0x16a71e + "/v1/tasks/" + _0x3c9350
    }] : [];
    const _0x2da29b = _0x1f6cb9 ? [_0x1f6cb9] : _0x9b2532;
    if (_0x2da29b.length === 0) {
      throw new Error("异步图片任务查询配置缺失（厂商：" + _0x111b07 + "）");
    }
    try {
      let _0x9af732 = null;
      let _0x3a8756 = null;
      for (const _0x8c3727 of _0x2da29b) {
        try {
          if (_0x8c3727.mode === "image-proxy") {
            _0x9af732 = await requester({
              url: "/api/v2/proxy/image",
              method: "POST",
              provider: _0x111b07,
              timeout: 30000,
              signal: _0x41b94b?.signal,
              headers: {
                "Content-Type": "application/json"
              },
              body: JSON.stringify({
                apiUrl: _0x8c3727.url,
                apiKey: _0x5006df,
                ...(_0x8c3727.body || {})
              })
            });
          } else {
            _0x9af732 = await requester({
              url: "/api/v2/proxy/task?apiUrl=" + encodeURIComponent(_0x8c3727.url),
              method: "GET",
              headers: {
                Authorization: "Bearer " + _0x5006df
              },
              provider: _0x111b07,
              timeout: 30000,
              signal: _0x41b94b?.signal
            });
          }
          _0x3a8756 = null;
          break;
        } catch (_0x3140da) {
          _0x3a8756 = _0x3140da;
          if (_0x3140da instanceof ApiError) {
            if (_0x3140da.type === ErrorType.AUTH_ERROR || _0x3140da.type === ErrorType.FORBIDDEN || _0x3140da.type === ErrorType.INSUFFICIENT_BALANCE || _0x3140da.type === ErrorType.MODEL_UNAVAILABLE) {
              throw _0x3140da;
            }
            if (_0x3140da.type === ErrorType.INVALID_PARAMS) {
              throw _0x3140da;
            }
          }
        }
      }
      if (!_0x9af732) {
        if (_0x3a8756 instanceof ApiError) {
          throw _0x3a8756;
        }
        continue;
      }
      const _0x10304b = normalizeTaskSnapshotPayload(_0x9af732);
      const _0x10f278 = _0x10304b && typeof _0x10304b === "object" && _0x10304b.data && typeof _0x10304b.data === "object" && !Array.isArray(_0x10304b.data);
      const _0x416cfb = _0x10f278 ? {
        ..._0x10304b,
        ..._0x10304b.data
      } : normalizeTaskSnapshotPayload(_0x9af732.data || _0x9af732);
      const _0x2ad2f1 = hasImageResultOutput(_0x416cfb, _0x41b94b?.responseMapping);
      if (_0x2ad2f1) {
        return _0x416cfb;
      }
      const _0x1a2c8c = parseTaskError(_0x111b07, _0x416cfb);
      if (_0x1a2c8c) {
        throw _0x1a2c8c;
      }
      const _0x45cce8 = resolveAsyncImageTaskStatus(_0x416cfb);
      if (["completed", "succeeded", "success"].includes(_0x45cce8)) {
        return _0x416cfb;
      }
      if (isAsyncTaskPendingStatus(_0x45cce8)) {
        continue;
      }
      if (isAsyncTaskTerminalStatus(_0x45cce8)) {
        const _0x3b03b4 = String(_0x416cfb?.rawText || "");
        throw ApiError.taskFailed(_0x111b07, String(_0x416cfb?.error || _0x416cfb?.errorMessage || _0x416cfb?.message || extractTaskStatusFromRawText(_0x3b03b4) || "任务状态异常"));
      }
    } catch (_0x55a0ca) {
      if (_0x55a0ca instanceof ApiError) {
        if (_0x55a0ca.type === ErrorType.TASK_FAILED || _0x55a0ca.type === ErrorType.CONTENT_FILTERED || _0x55a0ca.type === ErrorType.TASK_TIMEOUT || _0x55a0ca.type === ErrorType.AUTH_ERROR || _0x55a0ca.type === ErrorType.FORBIDDEN || _0x55a0ca.type === ErrorType.INVALID_PARAMS || _0x55a0ca.type === ErrorType.INSUFFICIENT_BALANCE) {
          throw _0x55a0ca;
        }
      }
    }
  }
  if (_0x370ef5) {
    return {
      pending: true,
      taskId: _0x3c9350,
      provider: _0x111b07,
      message: "任务仍在处理中，可稍后恢复"
    };
  }
  throw ApiError.taskTimeout(_0x111b07);
}
function resolveRunningHubImageTaskProviderKey(_0x3a5398, _0x3ce602 = {}) {
  if (_0x3a5398 === "runninghubwf") {
    const _0x93061e = getRunningHubTaskProviderProfileId(_0x3ce602);
    if (_0x93061e) {
      return normalizeRunningHubModelApiProfileId(_0x93061e);
    }
  }
  if (_0x3a5398 === "runninghub" && isModelApiModel(_0x3ce602?.model, "runninghub")) {
    return resolveRunningHubModelApiProfileId(resolveModelExecution(_0x3ce602?.model, {
      providerHint: "runninghub"
    })?.modelManifest?.modelId || _0x3ce602?.model, getRunningHubTaskProviderProfileId(_0x3ce602));
  }
  return _0x3a5398;
}
function buildRunningHubImageTaskKey(_0x391baa, _0x48728c, _0x137333) {
  return resolveRunningHubImageTaskProviderKey(_0x391baa, _0x48728c) + ":image:" + _0x137333;
}
async function pollRunningHubTask(_0x5b2a7b, _0x16bf64, _0x29d67a, _0x31c0ce) {
  const _0x4a940f = isModelApiModel(_0x16bf64.model, "runninghub");
  const _0x3b5027 = _0x29d67a === "runninghubwf" && !_0x4a940f;
  const _0x284bdc = _0x31c0ce?.useOpenapiQuery === true || _0x4a940f || isRunningHubOpenApiV2AiApp(_0x16bf64);
  const _0x329683 = _0x3b5027 ? resolveRunningHubWorkflowPollingPolicy(_0x31c0ce) : null;
  const _0x589808 = _0x329683 ? _0x329683.pollIntervalMs : _0x31c0ce?.pollIntervalMs === undefined ? 2000 : Math.max(0, Number(_0x31c0ce.pollIntervalMs) || 0);
  const _0x5a1ded = _0x329683?.pollTimeoutMs || null;
  const _0x1c1284 = _0x329683 ? _0x329683.maxPolls : Math.max(1, Number(_0x31c0ce?.maxPolls) || 450);
  const _0x14431d = _0x31c0ce?.softTimeout === true;
  const _0x14c434 = Date.now();
  const _0x2dabc6 = getRunningHubTaskProviderProfileId(_0x16bf64);
  const _0x43250a = _0x4a940f ? null : getProviderConfig(_0x2dabc6 || "runninghubwf");
  const _0x1049f2 = _0x4a940f ? resolveRunningHubModelApiProfileId(resolveModelExecution(_0x16bf64?.model, {
    providerHint: "runninghub"
  })?.modelManifest?.modelId || _0x16bf64?.model, _0x2dabc6) : normalizeRunningHubModelApiProfileId(_0x2dabc6 || _0x43250a?.providerProfileId);
  const _0x4e676e = _0x4a940f ? getProviderConfig(_0x1049f2) : _0x43250a;
  const _0x3724f4 = _0x4a940f ? _0x4e676e.modelApiKey || _0x16bf64.apiKey : _0x4e676e.apiKey || _0x16bf64.apiKey;
  for (let _0x124844 = 0; _0x124844 < _0x1c1284; _0x124844++) {
    if (_0x5a1ded !== null && hasRunningHubWorkflowPollingTimedOut(_0x14c434, _0x5a1ded)) {
      break;
    }
    if (_0x31c0ce?.signal?.aborted) {
      throw new Error("CANCELLED");
    }
    if (_0x589808 > 0) {
      await new Promise(_0x5b3d2b => setTimeout(_0x5b3d2b, _0x589808));
    }
    if (_0x31c0ce?.signal?.aborted) {
      throw new Error("CANCELLED");
    }
    if (_0x5a1ded !== null && hasRunningHubWorkflowPollingTimedOut(_0x14c434, _0x5a1ded)) {
      break;
    }
    try {
      const _0x1e52a3 = await requester({
        url: _0x284bdc ? "/api/v2/proxy/image" : "/api/v2/runninghubwf/query",
        method: "POST",
        provider: _0x29d67a,
        timeout: 30000,
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(_0x284bdc ? {
          apiUrl: buildRunningHubModelApiUrl(_0x1049f2, "/openapi/v2/query"),
          apiKey: _0x3724f4,
          taskId: _0x5b2a7b
        } : {
          apiKey: _0x3724f4,
          taskId: _0x5b2a7b
        })
      });
      const _0x5b648e = typeof _0x1e52a3?.code === "number" ? _0x1e52a3.code : null;
      if (_0x5b648e === 804 || _0x5b648e === 813) {
        continue;
      }
      if (_0x5b648e !== null && _0x5b648e !== 0) {
        throw parseError(_0x29d67a, _0x1e52a3, 200);
      }
      if (_0x284bdc && hasImageResultOutput(_0x1e52a3, _0x31c0ce?.responseMapping)) {
        return _0x1e52a3;
      }
      if (_0x5b648e === 0 && Array.isArray(_0x1e52a3.data)) {
        const _0x1115e8 = _0x1e52a3.data.filter(_0x4289fd => _0x4289fd && typeof _0x4289fd === "object");
        if (_0x1115e8.length === 0) {
          continue;
        }
        const _0x3e7d9e = _0x1115e8.some(_0x4cf4b5 => hasImageResultOutput(_0x4cf4b5, _0x31c0ce?.responseMapping));
        if (_0x3e7d9e) {
          return _0x1e52a3;
        }
        for (const _0x3cf53a of _0x1115e8) {
          const _0x1b59dd = parseTaskError(_0x29d67a, _0x3cf53a);
          if (_0x1b59dd) {
            throw _0x1b59dd;
          }
        }
        const _0xd398e7 = _0x1115e8.map(_0x5a58ea => String(_0x5a58ea?.status || _0x5a58ea?.taskStatus || _0x5a58ea?.task_status || "").trim().toUpperCase()).filter(Boolean);
        const _0x35ef4e = _0x1115e8.find(_0x180a2f => ["FAILED", "FAIL", "ERROR", "CANCELLED", "CANCELED"].includes(String(_0x180a2f?.status || _0x180a2f?.taskStatus || _0x180a2f?.task_status || "").trim().toUpperCase()));
        if (_0x35ef4e) {
          throw ApiError.taskFailed(_0x29d67a, String(_0x35ef4e?.errorMessage || _0x35ef4e?.error || _0x35ef4e?.message || "任务执行失败"));
        }
        if (_0xd398e7.some(_0x5c3202 => ["COMPLETED", "SUCCEEDED", "SUCCESS"].includes(_0x5c3202))) {
          continue;
        }
        if (_0xd398e7.some(_0x48ee13 => ["RUNNING", "PENDING", "QUEUED", "SUBMITTED", "PROCESSING"].includes(_0x48ee13))) {
          continue;
        }
      }
      const _0x5cf1d5 = _0x1e52a3.data && Object.keys(_0x1e52a3.data).length > 0 ? _0x1e52a3.data : _0x1e52a3;
      const _0x1b7fef = hasImageResultOutput(_0x5cf1d5, _0x31c0ce?.responseMapping);
      if (_0x1b7fef) {
        return _0x5cf1d5;
      }
      const _0x3b1b6b = parseTaskError(_0x29d67a, _0x5cf1d5);
      if (_0x3b1b6b) {
        throw _0x3b1b6b;
      }
      const _0x18e93b = (_0x5cf1d5.status || "").toUpperCase();
      if (["FAILED", "FAIL", "ERROR", "CANCELLED", "CANCELED"].includes(_0x18e93b)) {
        throw ApiError.taskFailed(_0x29d67a, String(_0x5cf1d5?.errorMessage || _0x5cf1d5?.error || _0x5cf1d5?.message || "任务执行失败"));
      }
      if (["COMPLETED", "SUCCEEDED", "SUCCESS"].includes(_0x18e93b)) {
        if (!hasImageResultOutput(_0x5cf1d5, _0x31c0ce?.responseMapping)) {
          continue;
        }
        return _0x5cf1d5;
      }
      if (["RUNNING", "PENDING", "QUEUED", "SUBMITTED", "PROCESSING"].includes(_0x18e93b)) {
        continue;
      }
    } catch (_0x233dba) {
      if (_0x233dba instanceof ApiError) {
        if (_0x233dba.type === ErrorType.TIMEOUT) {
          continue;
        }
        if (_0x233dba.type === ErrorType.TASK_FAILED || _0x233dba.type === ErrorType.TASK_TIMEOUT || _0x233dba.type === ErrorType.AUTH_ERROR || _0x233dba.type === ErrorType.FORBIDDEN || _0x233dba.type === ErrorType.INVALID_PARAMS || _0x233dba.type === ErrorType.CONTENT_FILTERED || _0x233dba.type === ErrorType.INSUFFICIENT_BALANCE || _0x233dba.provider === "runninghub" && _0x233dba.code !== null && _0x233dba.code !== undefined) {
          throw _0x233dba;
        }
      }
    }
  }
  if (_0x14431d) {
    return {
      pending: true,
      taskId: String(_0x5b2a7b || "").trim(),
      status: "running",
      message: "任务仍在 RunningHub 生成中"
    };
  }
  throw ApiError.taskTimeout(_0x29d67a);
}
async function doGenerateOnce(_0x36a607, _0xafe42c, _0x5489dd) {
  const _0x572b9c = await buildGenerateImageRequest(_0x36a607);
  const _0x20b024 = resolveGenerationRequestTimeout(_0x572b9c);
  const _0x1246d9 = String(_0x572b9c?.providerProfileId || _0x572b9c?.rhProviderProfileId || _0x36a607?.providerProfileId || _0x36a607?.rhProviderProfileId || "").trim();
  const _0x4de4bf = _0xafe42c === "runninghubwf" && _0x1246d9 ? {
    ..._0x36a607,
    providerProfileId: _0x1246d9,
    rhProviderProfileId: _0x1246d9
  } : _0x36a607;
  const _0x5d6159 = _0x572b9c?.responseMapping || null;
  const _0xb43247 = String(_0x36a607?.model || "").trim() === APIMART_MIDJOURNEY_MODEL_ID ? resolveApimartMidjourneySourceMetadata(_0x36a607) : {};
  const _0x5ddd21 = {
    ...(_0x5489dd || {}),
    ...(_0x5d6159 ? {
      responseMapping: _0x5d6159
    } : {}),
    ...(_0x572b9c?.taskPolling ? {
      taskPolling: _0x572b9c.taskPolling
    } : {}),
    ...(typeof _0x572b9c?.resultExtractor === "function" ? {
      resultExtractor: _0x572b9c.resultExtractor
    } : {}),
    ...(Object.keys(_0xb43247).length > 0 ? {
      apimartMidjourneySource: _0xb43247
    } : {})
  };
  const _0x1407dc = _0xafe42c === "runninghubwf" || _0xafe42c === "runninghub";
  const _0x485b73 = String(_0x572b9c?.body?.apiUrl || "");
  const _0x5d3ab1 = _0x5489dd?.useOpenapiQuery === true || _0x572b9c?.useOpenapiQuery === true || _0xafe42c === "runninghubwf" && _0x572b9c?.url === "/api/v2/proxy/image" && (typeof _0x572b9c?.pollUrlBuilder === "function" || _0x485b73.includes("/openapi/v2/run/ai-app/")) || isModelApiModel(_0x36a607?.model, _0xafe42c) || isRunningHubOpenApiV2AiApp(_0x36a607);
  const _0x5f2fc5 = !!_0x5489dd?.signal && _0xafe42c !== "runninghubwf";
  const _0x4ad1aa = String(_0x36a607?.installId || globalThis.window?.__aicInstallId || globalThis.__aicInstallId || "").trim();
  const _0x41b45e = {
    ...(_0x572b9c.headers || {
      "Content-Type": "application/json"
    }),
    ...(_0x4ad1aa ? {
      "X-AIC-Install-Id": _0x4ad1aa
    } : {})
  };
  const _0x1e3172 = _0x572b9c.body;
  const _0x394e99 = typeof FormData !== "undefined" && _0x1e3172 instanceof FormData;
  let _0x58fd84;
  let _0x44a6e7 = null;
  try {
    const _0x24a1b4 = await requester({
      url: _0x572b9c.url,
      method: "POST",
      provider: _0xafe42c,
      timeout: _0x20b024,
      retries: GENERATION_RETRIES,
      retryDelay: GENERATION_RETRY_DELAY,
      signal: _0x5f2fc5 ? _0x5489dd?.signal : undefined,
      headers: _0x41b45e,
      body: _0x394e99 ? _0x1e3172 : JSON.stringify(_0x1e3172),
      responseType: "text",
      returnMeta: true
    });
    _0x58fd84 = String(_0x24a1b4?.data ?? "");
    _0x44a6e7 = _0x24a1b4?.headers || null;
  } catch (_0x170f10) {
    if (_0x170f10 instanceof ApiError) {
      throw _0x170f10;
    }
    throw parseNetworkError(_0xafe42c, _0x170f10, _0x20b024);
  }
  let _0x5968ac = {};
  let _0x363796 = null;
  try {
    _0x5968ac = parseResponseData(_0x58fd84);
  } catch (_0x34d943) {
    _0x363796 = _0x34d943;
    _0x5968ac = {};
  }
  if (_0xafe42c === "runninghubwf") {
    const _0x40c809 = typeof _0x5968ac?.code === "number" ? _0x5968ac.code : null;
    if (_0x40c809 !== null && _0x40c809 !== 0) {
      throw parseError(_0xafe42c, _0x5968ac, 200);
    }
    const _0x48dc6b = resolveRunningHubTaskId(_0x5968ac, _0x58fd84, _0x44a6e7);
    if (_0x48dc6b) {
      const _0x276d6d = buildRunningHubImageTaskKey(_0xafe42c, _0x4de4bf, _0x48dc6b);
      _0x5489dd?.onTaskMeta?.({
        taskId: _0x48dc6b,
        useOpenapiQuery: _0x5d3ab1,
        ...(_0x1246d9 ? {
          providerProfileId: _0x1246d9,
          rhProviderProfileId: _0x1246d9
        } : {})
      });
      _0x5489dd?.onTaskId?.(_0x48dc6b);
      const _0x5b917e = await pollRunningHubTask(_0x48dc6b, _0x4de4bf, _0xafe42c, {
        ..._0x5ddd21,
        useOpenapiQuery: _0x5d3ab1
      });
      return processTaskResult(_0x5b917e, _0xafe42c, {
        ..._0x5ddd21,
        taskKey: _0x276d6d
      });
    }
  }
  let _0x5bda04 = _0xafe42c === "apimart" ? resolveApimartTaskIdStrict(_0x5968ac) : resolveAsyncImageTaskId(_0x5968ac, _0x5d6159);
  let _0x2da58b = resolveAsyncImageTaskStatus(_0x5968ac);
  if (!_0x5bda04 && _0xafe42c !== "apimart") {
    _0x5bda04 = resolveAsyncImageTaskIdLoose(_0x5968ac);
  }
  if (!_0x5bda04) {
    _0x5bda04 = _0xafe42c === "apimart" ? extractApimartTaskIdFromRawText(_0x58fd84) : extractTaskIdFromRawText(_0x58fd84);
  }
  if (_0x5bda04 && _0xafe42c === "apimart") {
    const _0x98212f = await probeApimartTaskIdCandidate(_0x5bda04, _0x36a607, _0x5ddd21);
    if (!_0x98212f) {
      _0x5bda04 = "";
    }
  }
  if (!_0x5bda04 && _0xafe42c === "apimart") {
    _0x5bda04 = await resolveApimartTaskIdByProbe(_0x5968ac, _0x36a607, _0x5ddd21);
  }
  if (!_0x5bda04 && _0xafe42c !== "apimart") {
    _0x5bda04 = extractTaskIdFromResponseHeaders(_0x44a6e7);
  }
  if (!_0x2da58b) {
    _0x2da58b = extractTaskStatusFromRawText(_0x58fd84);
  }
  const _0x39a8cc = extractImageUrls(_0x5968ac, _0x5d6159).length > 0;
  if (_0x39a8cc && (_0xafe42c === "grsai" || _0xafe42c === "volcengine") && !isAsyncTaskFailureStatus(_0x2da58b)) {
    return processTaskResult(_0x5968ac, _0xafe42c, _0x5ddd21);
  }
  if (!_0x39a8cc && _0xafe42c === "grsai") {
    const _0x1d2f09 = resolveDirectOutputSnapshotFromRawText(_0x58fd84);
    if (_0x1d2f09) {
      return processTaskResult(_0x1d2f09, _0xafe42c, _0x5ddd21);
    }
  }
  if (_0x5bda04 && !supportsAsyncImageTaskPolling(_0xafe42c, _0x5ddd21)) {
    _0x5bda04 = "";
  }
  if (!_0x1407dc && _0x5bda04 && !isAsyncTaskFailureStatus(_0x2da58b)) {
    _0x5489dd?.onTaskMeta?.({
      taskId: _0x5bda04,
      provider: _0xafe42c,
      kind: "image"
    });
    _0x5489dd?.onTaskId?.(_0x5bda04);
    if (_0x39a8cc && ["success", "succeeded", "completed", "complete", "done"].includes(String(_0x2da58b || "").toLowerCase())) {
      return processTaskResult(_0x5968ac, _0xafe42c, _0x5ddd21);
    }
    const _0x3fe7b1 = await pollAsyncImageTask(_0x5bda04, _0x36a607, _0xafe42c, _0x5ddd21);
    return processTaskResult(_0x3fe7b1, _0xafe42c, _0x5ddd21);
  }
  if (!_0x1407dc && (_0xafe42c === "ppio" || _0xafe42c === "grsai") && (!_0x5bda04 || isAsyncTaskPendingStatus(_0x2da58b))) {
    const _0x5f3ed9 = String(_0x58fd84 || "").slice(0, 400);
    let _0x5f8fe = {};
    if (_0x44a6e7 && typeof _0x44a6e7.forEach === "function") {
      const _0x54fc86 = {};
      _0x44a6e7.forEach((_0x1e10e8, _0x18370f) => {
        const _0x121cea = String(_0x18370f || "").toLowerCase();
        if (_0x121cea.includes("task") || _0x121cea.includes("job") || _0x121cea.includes("request") || _0x121cea.includes("submit")) {
          _0x54fc86[_0x18370f] = String(_0x1e10e8 || "");
        }
      });
      _0x5f8fe = _0x54fc86;
    }
    console.warn("[aiImageApi] async submit missing taskId", {
      providerId: _0xafe42c,
      asyncTaskStatus: _0x2da58b,
      previewText: _0x5f3ed9,
      headerSnapshot: _0x5f8fe,
      parsedKeys: _0x5968ac && typeof _0x5968ac === "object" && !Array.isArray(_0x5968ac) ? Object.keys(_0x5968ac).slice(0, 20) : []
    });
  }
  if (_0x363796 && !_0x1407dc) {
    throw _0x363796;
  }
  const _0x1e2134 = String(_0x5968ac.status || _0x5968ac?.data?.status || "").toUpperCase();
  const _0x370c09 = resolveRunningHubTaskId(_0x5968ac, _0x58fd84, _0x44a6e7);
  if (_0x1407dc && _0x370c09 && (!_0x1e2134 || ["RUNNING", "PENDING", "QUEUED", "SUBMITTED"].includes(_0x1e2134))) {
    const _0x476cf6 = _0x370c09;
    const _0x5aa7e5 = buildRunningHubImageTaskKey(_0xafe42c, _0x36a607, _0x476cf6);
    _0x5489dd?.onTaskMeta?.({
      taskId: _0x476cf6,
      useOpenapiQuery: _0x5d3ab1
    });
    _0x5489dd?.onTaskId?.(_0x476cf6);
    const _0xdb87f2 = await pollRunningHubTask(_0x476cf6, _0x36a607, _0xafe42c, {
      ..._0x5ddd21,
      useOpenapiQuery: _0x5d3ab1
    });
    return processTaskResult(_0xdb87f2, _0xafe42c, {
      ..._0x5ddd21,
      taskKey: _0x5aa7e5
    });
  }
  return processTaskResult(_0x5968ac, _0xafe42c, _0x5ddd21);
}
export async function resumeDreaminaImageTask(_0x26dc50, _0x1031d0 = {}, _0x221647 = {}) {
  const _0x38757c = getProviderId(_0x1031d0 || {});
  if (_0x38757c !== "dreamina") {
    throw new Error("仅支持恢复 Dreamina 图片任务");
  }
  const _0x1275c7 = String(_0x26dc50 || "").trim();
  if (!_0x1275c7) {
    throw new Error("缺少 Dreamina 提交ID，无法恢复");
  }
  const _0x4a1170 = await pollDreaminaUntilDone(_0x1275c7, {
    ..._0x221647,
    taskKind: "image"
  });
  const _0xe0da3 = normalizeDreaminaTaskSnapshot(_0x4a1170, {
    submitId: _0x1275c7
  });
  if (_0xe0da3?.phase === "failed") {
    throw new Error(_0xe0da3.failReason || "即梦图片任务恢复失败");
  }
  const _0x2e8936 = Array.isArray(_0xe0da3?.outputs) ? _0xe0da3.outputs : [];
  if (_0x2e8936.length === 0) {
    throw new Error("即梦图片任务恢复失败：无可用输出");
  }
  const _0x3ac373 = _0x2e8936.map(_0x326758 => {
    const _0x19fc8b = _0x326758.localUrl || _0x326758.url;
    return {
      sourceId: null,
      thumbId: null,
      sourceUrl: _0x326758.url || _0x19fc8b,
      thumbUrl: _0x19fc8b,
      imageUrl: _0x19fc8b,
      localPath: _0x326758.localPath || ""
    };
  });
  if (_0x3ac373.length === 1) {
    return _0x3ac373[0];
  } else {
    return {
      isBatch: true,
      images: _0x3ac373
    };
  }
}
function normalizeApimartMidjourneyUpscaleSpeed(_0x13b4d6) {
  const _0x5255b8 = String(_0x13b4d6 || "").trim().toLowerCase();
  if (["relax", "fast", "turbo"].includes(_0x5255b8)) {
    return _0x5255b8;
  } else {
    return "fast";
  }
}
function normalizeApimartMidjourneyUpscaleIndex(_0x3b1f7c) {
  const _0x1dd6ed = Number.parseInt(_0x3b1f7c, 10);
  if (!Number.isFinite(_0x1dd6ed)) {
    return 0;
  }
  if (_0x1dd6ed >= 1 && _0x1dd6ed <= 4) {
    return _0x1dd6ed;
  } else {
    return 0;
  }
}
function normalizeApimartMidjourneyVariationMode(_0x2cf529) {
  const _0x32517f = String(_0x2cf529 || "").trim().toLowerCase();
  if (["weak", "low", "low-variation"].includes(_0x32517f)) {
    return "weak";
  }
  if (["strong", "high", "high-variation"].includes(_0x32517f)) {
    return "strong";
  }
  return "medium";
}
function normalizeApimartMidjourneyVersion(_0x30eacf) {
  return String(_0x30eacf || "").trim().toLowerCase().replace(/^v/, "");
}
function isApimartMidjourneyRemixVersion(_0xe1d2e4) {
  const _0x3c17f0 = normalizeApimartMidjourneyVersion(_0xe1d2e4);
  return _0x3c17f0 === "8.2" || _0x3c17f0 === "8.1";
}
function getApimartMidjourneyVariationEndpoint(_0x343ef8, _0x46e0cb = "") {
  if (isApimartMidjourneyRemixVersion(_0x46e0cb)) {
    if (normalizeApimartMidjourneyVariationMode(_0x343ef8) === "strong") {
      return "remix-strong";
    } else {
      return "remix-subtle";
    }
  }
  switch (normalizeApimartMidjourneyVariationMode(_0x343ef8)) {
    case "weak":
      return "low-variation";
    case "strong":
      return "high-variation";
    default:
      return "variation";
  }
}
export async function submitApimartMidjourneyUpscaleRequest(_0x19ae5f = {}) {
  await ensureConfig();
  const _0x33d17a = getProviderConfig("apimart");
  const _0x55f0ec = String(_0x19ae5f?.apiKey || _0x33d17a?.apiKey || "").trim();
  if (!_0x55f0ec) {
    throw ApiError.authError("apimart", null, "APIMart API Key 未配置，无法发起 Midjourney 二次操作");
  }
  const _0x2a4f74 = String(_0x19ae5f?.taskId || _0x19ae5f?.parentTaskId || _0x19ae5f?.mjTaskId || "").trim();
  if (!_0x2a4f74) {
    throw new Error("缺少 APIMart Midjourney task_id");
  }
  const _0x3e90dc = String(_0x19ae5f?.customId || _0x19ae5f?.custom_id || "").trim();
  const _0x1d550f = normalizeApimartMidjourneyUpscaleIndex(_0x19ae5f?.index);
  if (!_0x3e90dc && !_0x1d550f) {
    throw new Error("APIMart Midjourney upscale 需要 index 或 custom_id");
  }
  const _0x758774 = normalizeApimartBaseUrl(_0x33d17a?.apiUrl);
  const _0x7c76c5 = {
    apiUrl: _0x758774 + "/v1/midjourney/generations/upscale",
    apiKey: _0x55f0ec,
    task_id: _0x2a4f74,
    ...(_0x3e90dc ? {
      custom_id: _0x3e90dc
    } : {
      index: _0x1d550f
    }),
    ...(_0x3e90dc && String(_0x19ae5f?.prompt || "").trim() ? {
      prompt: String(_0x19ae5f.prompt || "").trim()
    } : {}),
    ...(_0x3e90dc ? {} : {
      speed: normalizeApimartMidjourneyUpscaleSpeed(_0x19ae5f?.speed)
    })
  };
  const _0x1ac69d = await requester({
    url: "/api/v2/proxy/image",
    method: "POST",
    provider: "apimart",
    timeout: GENERATION_TIMEOUT,
    retries: GENERATION_RETRIES,
    retryDelay: GENERATION_RETRY_DELAY,
    signal: _0x19ae5f?.signal,
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(_0x7c76c5),
    responseType: "text"
  });
  const _0x47bbcf = typeof _0x1ac69d === "string" ? parseResponseData(_0x1ac69d) : _0x1ac69d || {};
  const _0x170920 = parseError("apimart", _0x47bbcf, 200);
  if (_0x170920) {
    throw _0x170920;
  }
  const _0x202db5 = String(resolveApimartTaskIdStrict(_0x47bbcf) || resolveAsyncImageTaskId(_0x47bbcf, APIMART_MIDJOURNEY_UPSCALE_RESPONSE_MAPPING) || extractApimartTaskIdFromRawText(String(_0x1ac69d || "")) || "").trim();
  if (!_0x202db5) {
    throw new Error("APIMart Midjourney upscale 未返回 task_id");
  }
  return {
    taskId: _0x202db5,
    parentTaskId: _0x2a4f74,
    ...(_0x3e90dc ? {
      customId: _0x3e90dc
    } : {
      index: _0x1d550f
    })
  };
}
export async function submitApimartMidjourneyVariationRequest(_0x376e21 = {}) {
  await ensureConfig();
  const _0x482cdb = getProviderConfig("apimart");
  const _0x4c88d6 = String(_0x376e21?.apiKey || _0x482cdb?.apiKey || "").trim();
  if (!_0x4c88d6) {
    throw ApiError.authError("apimart", null, "APIMart API Key 未配置，无法发起 Midjourney 变体操作");
  }
  const _0x2ba9fb = String(_0x376e21?.taskId || _0x376e21?.parentTaskId || _0x376e21?.mjTaskId || "").trim();
  if (!_0x2ba9fb) {
    throw new Error("缺少 APIMart Midjourney task_id");
  }
  const _0x5255e3 = String(_0x376e21?.customId || _0x376e21?.custom_id || "").trim();
  const _0x4bbb60 = normalizeApimartMidjourneyUpscaleIndex(_0x376e21?.index);
  if (!_0x5255e3 && !_0x4bbb60) {
    throw new Error("APIMart Midjourney variation 需要 index 或 custom_id");
  }
  const _0xdcbff9 = normalizeApimartMidjourneyVariationMode(_0x376e21?.variationMode || _0x376e21?.mode || _0x376e21?.strength);
  const _0x4f1546 = String(_0x376e21?.mjModel || _0x376e21?.midjourneyModel || _0x376e21?.model || _0x376e21?.version || "").trim();
  const _0x478951 = isApimartMidjourneyRemixVersion(_0x4f1546);
  if (_0x478951 && !_0x4bbb60) {
    throw new Error("APIMart Midjourney remix 需要 index");
  }
  const _0x47c118 = normalizeApimartBaseUrl(_0x482cdb?.apiUrl);
  const _0x15ed34 = {
    apiUrl: _0x47c118 + "/v1/midjourney/generations/" + getApimartMidjourneyVariationEndpoint(_0xdcbff9, _0x4f1546),
    apiKey: _0x4c88d6,
    task_id: _0x2ba9fb,
    speed: normalizeApimartMidjourneyUpscaleSpeed(_0x376e21?.speed),
    ...(_0x478951 ? {
      index: _0x4bbb60
    } : _0x5255e3 ? {
      custom_id: _0x5255e3
    } : {
      index: _0x4bbb60
    })
  };
  const _0x1aeebb = await requester({
    url: "/api/v2/proxy/image",
    method: "POST",
    provider: "apimart",
    timeout: GENERATION_TIMEOUT,
    retries: GENERATION_RETRIES,
    retryDelay: GENERATION_RETRY_DELAY,
    signal: _0x376e21?.signal,
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(_0x15ed34),
    responseType: "text"
  });
  const _0x17a220 = typeof _0x1aeebb === "string" ? parseResponseData(_0x1aeebb) : _0x1aeebb || {};
  const _0x1d2f9f = parseError("apimart", _0x17a220, 200);
  if (_0x1d2f9f) {
    throw _0x1d2f9f;
  }
  const _0xa58a3b = String(resolveApimartTaskIdStrict(_0x17a220) || resolveAsyncImageTaskId(_0x17a220, APIMART_MIDJOURNEY_UPSCALE_RESPONSE_MAPPING) || extractApimartTaskIdFromRawText(String(_0x1aeebb || "")) || "").trim();
  if (!_0xa58a3b) {
    throw new Error("APIMart Midjourney variation 未返回 task_id");
  }
  return {
    taskId: _0xa58a3b,
    parentTaskId: _0x2ba9fb,
    variationMode: _0xdcbff9,
    ...(_0x4f1546 ? {
      mjModel: _0x4f1546
    } : {}),
    ...(_0x478951 ? {
      index: _0x4bbb60
    } : _0x5255e3 ? {
      customId: _0x5255e3
    } : {
      index: _0x4bbb60
    })
  };
}
export async function resumeApimartMidjourneyUpscaleTask(_0x465815, _0x1e464a = {}, _0x125c63 = {}) {
  await ensureConfig();
  const _0x1116d9 = String(_0x465815 || "").trim();
  if (!_0x1116d9) {
    throw new Error("缺少 APIMart Midjourney 任务ID，无法恢复");
  }
  const _0x257ac3 = getProviderConfig("apimart");
  const _0xc558f2 = {
    ...(_0x1e464a && typeof _0x1e464a === "object" ? _0x1e464a : {}),
    provider: "apimart",
    model: APIMART_MIDJOURNEY_MODEL_ID
  };
  const _0x33242c = {
    ..._0x125c63,
    responseMapping: _0x125c63?.responseMapping || APIMART_MIDJOURNEY_UPSCALE_RESPONSE_MAPPING,
    taskPolling: _0x125c63?.taskPolling || buildApimartMidjourneyTaskPolling(_0x257ac3?.apiUrl)
  };
  return runTaskSingleFlight({
    provider: "apimart",
    kind: "image",
    taskId: _0x1116d9
  }, async () => {
    const _0x1cd138 = await pollAsyncImageTask(_0x1116d9, _0xc558f2, "apimart", _0x33242c);
    if (_0x1cd138?.pending) {
      return _0x1cd138;
    }
    const _0x21e26c = await processTaskResult(_0x1cd138, "apimart", {
      taskKey: "apimart:image:" + _0x1116d9,
      responseMapping: _0x33242c.responseMapping,
      ...(_0x33242c.apimartMidjourneySource ? {
        apimartMidjourneySource: _0x33242c.apimartMidjourneySource
      } : {})
    });
    if (_0x21e26c.length === 1 && _0x21e26c[0]?.error) {
      throw new Error(_0x21e26c[0].error || "Midjourney 二次操作恢复失败");
    }
    if (_0x21e26c.length === 1) {
      return _0x21e26c[0];
    } else {
      return {
        isBatch: true,
        images: _0x21e26c
      };
    }
  });
}
export async function resumeAsyncImageTask(_0x5baca7, _0x266ade = {}, _0x3110e9 = {}) {
  await ensureConfig();
  const _0x230281 = getProviderId(_0x266ade || {});
  if (_0x230281 === "runninghubwf" || _0x230281 === "runninghub" || _0x230281 === "dreamina") {
    throw new Error("仅支持恢复 APIMart/PPIO/GRSAI 等异步图片任务");
  }
  const _0x181d4e = String(_0x5baca7 || "").trim();
  if (!_0x181d4e) {
    throw new Error("缺少异步图片任务ID，无法恢复");
  }
  return runTaskSingleFlight({
    provider: _0x230281,
    kind: "image",
    taskId: _0x181d4e
  }, async () => {
    const _0x39700f = resolveImageTaskRuntimeOptions(_0x266ade || {}, _0x230281, _0x3110e9);
    const _0x20b8cc = await pollAsyncImageTask(_0x181d4e, _0x266ade || {}, _0x230281, _0x39700f);
    const _0x362ed8 = await processTaskResult(_0x20b8cc, _0x230281, {
      taskKey: _0x230281 + ":image:" + _0x181d4e,
      ...(_0x39700f?.responseMapping ? {
        responseMapping: _0x39700f.responseMapping
      } : {})
    });
    if (_0x362ed8.length === 1 && _0x362ed8[0]?.error) {
      throw new Error(_0x362ed8[0].error || "图片任务恢复失败");
    }
    if (_0x362ed8.length === 1) {
      return _0x362ed8[0];
    } else {
      return {
        isBatch: true,
        images: _0x362ed8
      };
    }
  });
}
export async function resumeRunningHubImageTask(_0xe20077, _0x405bb0, _0x2ed531 = {}) {
  const _0x3d4bb3 = getProviderId(_0x405bb0 || {});
  if (_0x3d4bb3 !== "runninghubwf" && _0x3d4bb3 !== "runninghub") {
    throw new Error("仅支持恢复 RunningHub 图片任务");
  }
  const _0x5aa83b = String(_0xe20077 || "").trim();
  if (!_0x5aa83b) {
    throw new Error("缺少 RunningHub 任务ID，无法恢复");
  }
  if (!String(_0x405bb0?.apiKey || "").trim()) {
    await ensureConfig();
  }
  const _0x33b435 = _0x2ed531?.useOpenapiQuery === true || isModelApiModel(_0x405bb0?.model, _0x3d4bb3) || isRunningHubOpenApiV2AiApp(_0x405bb0);
  const _0x3c9f5f = resolveRunningHubImageTaskProviderKey(_0x3d4bb3, _0x405bb0);
  return runTaskSingleFlight({
    provider: _0x3c9f5f,
    kind: "image",
    taskId: _0x5aa83b
  }, async () => {
    const _0x2f2348 = await pollRunningHubTask(_0x5aa83b, _0x405bb0 || {}, _0x3d4bb3, {
      ..._0x2ed531,
      useOpenapiQuery: _0x33b435
    });
    if (_0x2f2348?.pending) {
      return _0x2f2348;
    }
    const _0x42d667 = await processTaskResult(_0x2f2348, _0x3d4bb3, {
      taskKey: _0x3c9f5f + ":image:" + _0x5aa83b
    });
    if (_0x42d667.length === 1 && _0x42d667[0]?.error) {
      throw new Error(_0x42d667[0].error || "图片任务恢复失败");
    }
    if (_0x42d667.length === 1) {
      return _0x42d667[0];
    } else {
      return {
        isBatch: true,
        images: _0x42d667
      };
    }
  });
}
async function processTaskResult(_0x2a9a52, _0x3df636, _0x4d451e = {}) {
  const _0x44d8e0 = extractImageResultRecords(_0x2a9a52, _0x4d451e?.responseMapping, _0x4d451e);
  const _0x5455ea = _0x44d8e0.some(_0x5bdc3b => String(_0x5bdc3b?.sourceUrl || "").trim());
  const _0x8322a0 = _0x44d8e0.some(_0x42eaa1 => String(_0x42eaa1?.error || "").trim());
  if (!_0x5455ea) {
    if (_0x8322a0) {
      return await processImageResultRecords(_0x44d8e0, _0x4d451e);
    }
    const _0x4dbbb2 = parseError(_0x3df636, _0x2a9a52, 200);
    if (_0x4dbbb2) {
      return [{
        error: _0x4dbbb2.getUserMessage(),
        fullData: _0x2a9a52
      }];
    }
    const _0x3849c5 = parseTaskError(_0x3df636, _0x2a9a52);
    if (_0x3849c5) {
      return [{
        error: _0x3849c5.getUserMessage(),
        fullData: _0x2a9a52
      }];
    }
    const _0x315a1c = _0x2a9a52.error || _0x2a9a52.errorMessage || _0x2a9a52.message || _0x2a9a52.failure_reason;
    if (_0x315a1c) {
      return [{
        error: _0x315a1c,
        fullData: _0x2a9a52
      }];
    }
    throw new ApiError({
      type: "PARSE_ERROR",
      provider: _0x3df636,
      message: "无法从服务器响应中提取图片地址",
      raw: _0x2a9a52,
      retryable: false
    });
  }
  return await processImageResultRecords(_0x44d8e0, _0x4d451e);
}
async function processImages(_0x46ff20, _0x45f57c = {}) {
  return await processImageResultRecords((Array.isArray(_0x46ff20) ? _0x46ff20 : []).map(_0x4935c3 => ({
    sourceUrl: _0x4935c3,
    error: ""
  })), _0x45f57c);
}
const IMAGE_LOCAL_SAVE_FAILURE_MESSAGE = "图片已返回，但保存到本地失败";
function getReadableErrorMessage(_0xd2eb43) {
  if (!_0xd2eb43) {
    return "";
  }
  if (typeof _0xd2eb43.getUserMessage === "function") {
    try {
      const _0x394249 = String(_0xd2eb43.getUserMessage() || "").trim();
      if (_0x394249) {
        return _0x394249;
      }
    } catch {}
  }
  if (typeof _0xd2eb43 === "string") {
    return _0xd2eb43.trim();
  }
  const _0x52df85 = _0xd2eb43?.message || _0xd2eb43?.errorMessage || _0xd2eb43?.error_message || _0xd2eb43?.reason || _0xd2eb43?.detail || _0xd2eb43?.details || _0xd2eb43?.error;
  if (_0x52df85 !== undefined && _0x52df85 !== null && _0x52df85 !== _0xd2eb43) {
    const _0x207a19 = getReadableErrorMessage(_0x52df85);
    if (_0x207a19) {
      return _0x207a19;
    }
  }
  try {
    return JSON.stringify(_0xd2eb43);
  } catch {
    return String(_0xd2eb43 || "").trim();
  }
}
function formatLocalSaveFailureMessage(_0x423f2c) {
  const _0x47e402 = getReadableErrorMessage(_0x423f2c);
  if (!_0x47e402) {
    return IMAGE_LOCAL_SAVE_FAILURE_MESSAGE;
  }
  if (_0x47e402.includes("保存到本地失败")) {
    return _0x47e402;
  }
  return IMAGE_LOCAL_SAVE_FAILURE_MESSAGE + "：" + _0x47e402;
}
async function processImageResultRecords(_0x1824c0, _0x219e10 = {}) {
  const _0x5a0a54 = [];
  const _0xbc7aad = window.currentProjectId || "default_v2_project";
  for (const _0x256b2a of Array.isArray(_0x1824c0) ? _0x1824c0 : []) {
    const _0x4a93d7 = String(_0x256b2a?.sourceUrl || "").trim();
    const _0x30e72f = String(_0x256b2a?.error || "").trim();
    const _0x1743f1 = cloneRecordMetadata(_0x256b2a);
    const _0x578356 = Object.keys(_0x1743f1).length > 0 ? {
      metadata: _0x1743f1
    } : {};
    if (!_0x4a93d7) {
      if (_0x30e72f) {
        _0x5a0a54.push({
          sourceUrl: "",
          thumbUrl: "",
          imageUrl: "",
          localPath: "",
          error: _0x30e72f,
          ..._0x578356,
          ...(_0x256b2a?.fullData !== undefined ? {
            fullData: _0x256b2a.fullData
          } : {})
        });
      }
      continue;
    }
    try {
      const {
        saveRemoteImageLocallyDetailed: _0x24984c
      } = await import("../src/modules/project.js");
      const _0x7eafa4 = await _0x24984c(_0x4a93d7, _0xbc7aad, {
        taskKey: _0x219e10?.taskKey,
        dedupeKey: _0x219e10?.taskKey ? _0x219e10.taskKey + ":" + _0x4a93d7 : undefined
      });
      const _0x1795cf = pickResultLocalPath(_0x7eafa4);
      const _0xf872e0 = String(_0x7eafa4?.localUrl || "").trim() || localPathToUrl(_0x1795cf);
      _0x5a0a54.push({
        sourceId: null,
        thumbId: null,
        sourceUrl: _0x4a93d7,
        thumbUrl: String(_0x7eafa4?.thumbUrl || "").trim() || String(_0x7eafa4?.displayUrl || "").trim() || _0xf872e0,
        imageUrl: String(_0x7eafa4?.displayUrl || "").trim() || _0xf872e0,
        localPath: _0x1795cf,
        originalLocalPath: normalizeLocalPath(_0x7eafa4?.originalLocalPath || _0x7eafa4?.localPath),
        displayLocalPath: normalizeLocalPath(_0x7eafa4?.displayLocalPath),
        thumbLocalPath: normalizeLocalPath(_0x7eafa4?.thumbLocalPath),
        originalWidth: Number(_0x7eafa4?.originalWidth || 0) || undefined,
        originalHeight: Number(_0x7eafa4?.originalHeight || 0) || undefined,
        ..._0x578356
      });
    } catch (_0x48a217) {
      const _0x15dc95 = formatLocalSaveFailureMessage(_0x48a217);
      const _0x4a7061 = /^https?:\/\//i.test(_0x4a93d7) ? _0x4a93d7 : "";
      if (_0x4a7061) {
        _0x5a0a54.push({
          sourceUrl: _0x4a93d7,
          thumbUrl: _0x4a93d7,
          imageUrl: _0x4a93d7,
          localPath: "",
          remoteFallbackUrl: _0x4a7061,
          localSaveError: _0x15dc95,
          ..._0x578356
        });
      } else {
        _0x5a0a54.push({
          sourceUrl: _0x4a93d7,
          thumbUrl: "",
          imageUrl: "",
          localPath: "",
          error: _0x15dc95,
          ..._0x578356
        });
      }
    }
  }
  return _0x5a0a54;
}
async function generateImageUnqueued(_0x2f8026, _0xeeabac) {
  const _0x3225a6 = getProviderId(_0x2f8026);
  const _0x26eb6c = getImageExecution(_0x2f8026, _0x3225a6)?.executionManifest;
  const _0x5b44d8 = resolveImageGenerationBatchSize(_0x2f8026, _0x3225a6);
  const _0x243667 = shouldSubmitProviderBatchOnce(_0x2f8026, _0x3225a6, _0x5b44d8);
  const _0x2980a4 = getLocalImageRuntimeHandler(_0x26eb6c);
  if (_0x2980a4) {
    const _0x176510 = await _0x2980a4.run({
      payload: _0x2f8026,
      options: _0xeeabac,
      batchSize: _0x5b44d8,
      executionManifest: _0x26eb6c
    });
    if (_0x176510.length === 1) {
      return _0x176510[0];
    } else {
      return {
        isBatch: true,
        images: _0x176510
      };
    }
  }
  if (_0x5b44d8 <= 1 || _0x243667) {
    try {
      const _0x25aa1c = await doGenerateOnce(_0x2f8026, _0x3225a6, _0xeeabac);
      const _0x2440c1 = Array.isArray(_0x25aa1c) ? _0x25aa1c : [_0x25aa1c];
      if (_0x2440c1.length === 1 && _0x2440c1[0].error) {
        throw new Error(_0x2440c1[0].error);
      }
      if (_0x2440c1.length === 1) {
        return _0x2440c1[0];
      } else {
        return {
          isBatch: true,
          images: _0x2440c1
        };
      }
    } catch (_0x493496) {
      if (_0x493496 instanceof ApiError) {
        throw new Error(_0x493496.getUserMessage());
      }
      throw _0x493496;
    }
  }
  const _0x423381 = [];
  const _0x46d6e = createImageBatchAttemptContext(_0x5b44d8);
  for (let _0x464e75 = 0; _0x464e75 < _0x5b44d8; _0x464e75++) {
    try {
      const _0x8a1904 = await doGenerateOnce(buildImageBatchAttemptPayload(_0x2f8026, _0x46d6e, _0x464e75), _0x3225a6, _0xeeabac);
      _0x423381.push(..._0x8a1904);
    } catch (_0x422557) {
      if (_0x422557 instanceof ApiError) {
        _0x423381.push({
          error: _0x422557.getUserMessage(),
          status: "failed",
          retryable: _0x422557.retryable
        });
      } else {
        _0x423381.push({
          error: _0x422557.message || "未知错误",
          status: "failed",
          retryable: false
        });
      }
    }
  }
  if (_0x423381.length === 0) {
    throw new Error("批量生成全部失败");
  }
  if (_0x423381.length === 1) {
    return _0x423381[0];
  }
  return {
    isBatch: true,
    images: _0x423381
  };
}
export async function generateImage(_0x23983f, _0x292b8e = {}) {
  const _0x111fd9 = getProviderId(_0x23983f);
  const _0x1e53e9 = getImageExecution(_0x23983f, _0x111fd9)?.executionManifest;
  if (isRunningHubWorkflowQueueTarget({
    providerId: _0x111fd9,
    adapterType: _0x1e53e9?.adapterType,
    executionManifest: _0x1e53e9,
    payload: _0x23983f
  })) {
    await ensureConfig();
    const _0x301b39 = resolveRunningHubWorkflowQueueConfig({
      payload: _0x23983f,
      concurrency: _0x292b8e?.runningHubWorkflowConcurrency
    });
    return runWithRunningHubWorkflowQueue({
      ..._0x301b39,
      signal: _0x292b8e?.signal,
      lease: _0x292b8e?.runningHubWorkflowQueueLease,
      onQueueChange: _0x292b8e?.onRunningHubWorkflowQueueChange,
      autoProbeConcurrency: _0x292b8e?.autoProbeConcurrency,
      concurrencyProbe: _0x292b8e?.runningHubWorkflowConcurrencyProbe
    }, _0x301eb1 => generateImageUnqueued(_0x23983f, {
      ..._0x292b8e,
      runningHubWorkflowQueueLease: _0x301eb1
    }));
  }
  return generateImageUnqueued(_0x23983f, _0x292b8e);
}
