import { ensureConfig, getProviderConfig } from "./configApi.js";
import { processInputAudios, processInputAudiosPreserveOrder } from "./audioUploadApi.js";
import { cancelRunningHubTask } from "./runninghubTaskApi.js";
import { requester } from "./requester.js";
import { runTaskSingleFlight } from "./taskSingleFlight.js";
import { parseError } from "./errors/index.js";
import * as a35_0x24c424 from "./adapters/ComfyUiAdapter.js";
import { uploadInputToComfyUi } from "./comfyUiUploadApi.js";
import { buildAudioRequestFromManifest } from "./adapters/ModelApiManifestNormalizer.js";
import { resolveMappedResponseValues } from "./adapters/modelApiMappingEngine.js";
import { buildRunningHubNodeInfoListFromManifest } from "./adapters/RunningHubWorkflowMappingAdapter.js";
import { isRunningHubWorkflowQueueTarget, resolveRunningHubWorkflowQueueConfig, runWithRunningHubWorkflowQueue } from "./runningHubWorkflowQueue.js";
import { hasRunningHubWorkflowPollingTimedOut, resolveRunningHubWorkflowPollingPolicy } from "./runningHubWorkflowPollingPolicy.js";
import { resolveRunningHubTaskLifecycleStatus } from "./runninghubTaskLifecycle.js";
import { formatRunningHubFailureMessage } from "./errors/parsers/RunningHubErrorParser.js";
import { RH_AUDIO_ADVANCED_VOICE_CLONE_MODEL_ID, RH_AUDIO_SEPARATION_MODEL_ID as a35_0x1179fe, VOLCENGINE_TTS_MODEL_ID, resolveModelExecution, sanitizeModelUiSchemaParams } from "../src/manifests/index.js";
import { buildRunningHubModelApiUrl, getRunningHubProviderProfileId, isRunningHubInternationalOnlyModel, resolveRunningHubModelApiProfileId, resolveRunningHubModelApiBaseUrl } from "../src/modules/runningHubProviderProfiles.js";
import { normalizeRunningHubInstanceType } from "../src/modules/runningHubInstanceTypes.js";
const POLL_INTERVAL_MS = 2000;
const POLL_TIMEOUT_MS = 1800000;
const POLL_MAX_COUNT = Math.ceil(POLL_TIMEOUT_MS / POLL_INTERVAL_MS);
const AUDIO_MODEL_API_REQUEST_TIMEOUT_MS = 300000;
const RUNNINGHUB_AUDIO_QUEUE_LIMIT_RETRY_DELAYS_MS = Object.freeze([1500, 3000, 5000]);
const VOLCENGINE_TTS_BASE_URL = "https://openspeech.bytedance.com/api/v3/tts/unidirectional";
const VOLCENGINE_TTS_RESOURCE_ID = "seed-tts-2.0";
const VOLCENGINE_TTS_V1_RESOURCE_ID = "seed-tts-1.0";
const VOLCENGINE_ICL_RESOURCE_ID = "seed-icl-2.0";
function isVolcengineSpeechModel(_0x7c1e5c) {
  const _0x13696b = String(_0x7c1e5c || "").trim();
  return _0x13696b === VOLCENGINE_TTS_MODEL_ID;
}
function generateReqId() {
  return "aic_" + Date.now() + "_" + Math.random().toString(36).slice(2, 10);
}
export async function cancelRunningHubAudioTask(_0x2248dd = {}) {
  return cancelRunningHubTask(_0x2248dd);
}
function getAudioSeparationExecutionManifest() {
  const _0x414f6e = resolveModelExecution(a35_0x1179fe)?.executionManifest;
  if (!_0x414f6e) {
    throw new Error("RunningHub audio workflow manifest missing: " + a35_0x1179fe);
  }
  return _0x414f6e;
}
function getAudioSeparationResultNodeIds() {
  const _0x2904cf = getAudioSeparationExecutionManifest()?.mapping?.resultNodes || {};
  const _0x21dfa9 = String(_0x2904cf.vocals || "").trim();
  const _0x34ce26 = String(_0x2904cf.background || "").trim();
  if (!_0x21dfa9 || !_0x34ce26) {
    throw new Error("RunningHub audio workflow manifest missing result nodes: " + a35_0x1179fe);
  }
  return {
    vocals: _0x21dfa9,
    background: _0x34ce26
  };
}
function sleep(_0x4674dc, _0x377d31 = null) {
  if (_0x377d31?.aborted) {
    return Promise.reject(new Error("CANCELLED"));
  }
  return new Promise((_0xc5fc45, _0x237f28) => {
    let _0x2274c9 = null;
    const _0x411d88 = () => {
      if (_0x377d31?.removeEventListener) {
        _0x377d31.removeEventListener("abort", _0xc33618);
      }
    };
    const _0xc33618 = () => {
      if (_0x2274c9 !== null) {
        clearTimeout(_0x2274c9);
      }
      _0x411d88();
      _0x237f28(new Error("CANCELLED"));
    };
    if (_0x377d31?.addEventListener) {
      _0x377d31.addEventListener("abort", _0xc33618, {
        once: true
      });
    }
    _0x2274c9 = setTimeout(() => {
      _0x411d88();
      _0xc5fc45();
    }, _0x4674dc);
  });
}
function getRunningHubWorkflowProfileId(_0x469a9c = {}) {
  const _0x1f1023 = getRunningHubProviderProfileId(_0x469a9c);
  const _0x5ae686 = resolveModelExecution(_0x469a9c?.model)?.modelManifest?.modelId || _0x469a9c?.model;
  if (!_0x1f1023 && !isRunningHubInternationalOnlyModel(_0x5ae686)) {
    return "";
  }
  return resolveRunningHubModelApiProfileId(_0x5ae686, _0x1f1023);
}
function resolveRunningHubAudioWorkflowAppId(_0x34ef74, _0x169945 = "") {
  const _0x59573f = _0x34ef74?.extensions?.providerProfileBindings?.[String(_0x169945 || "").trim()];
  return String(_0x59573f?.appId || _0x59573f?.workflowId || _0x34ef74?.appId || _0x34ef74?.workflowId || "").trim();
}
function getVolcengineOfficialTtsResourceId(_0x4a54f1) {
  const _0x3c8c9b = String(_0x4a54f1 || "").trim();
  if (/_uranus_bigtts$/i.test(_0x3c8c9b)) {
    return VOLCENGINE_TTS_RESOURCE_ID;
  }
  if (/_mars_bigtts$/i.test(_0x3c8c9b)) {
    return VOLCENGINE_TTS_V1_RESOURCE_ID;
  }
  return "";
}
function isVolcengineIclSpeakerId(_0x4db917) {
  const _0x1f42c2 = String(_0x4db917 || "").trim();
  if (!_0x1f42c2) {
    return false;
  }
  if (/^(ICL_|S_)/i.test(_0x1f42c2)) {
    return true;
  }
  return !getVolcengineOfficialTtsResourceId(_0x1f42c2);
}
function normalizeTextList(_0x2bf1ce) {
  if (!Array.isArray(_0x2bf1ce)) {
    return [];
  }
  return _0x2bf1ce.map(_0x21f2e9 => String(_0x21f2e9 || "").trim()).filter(Boolean);
}
function normalizeRetryDelays(_0x11615a, _0x270e64 = RUNNINGHUB_AUDIO_QUEUE_LIMIT_RETRY_DELAYS_MS) {
  const _0xaef8b1 = Array.isArray(_0x11615a) ? _0x11615a : _0x270e64;
  return _0xaef8b1.map(_0x472fa4 => Math.max(0, Math.trunc(Number(_0x472fa4) || 0))).filter(_0x57bd45 => Number.isFinite(_0x57bd45));
}
function normalizeRefList(_0xe4f7c9) {
  if (!Array.isArray(_0xe4f7c9)) {
    return [];
  }
  return _0xe4f7c9.map(_0x34ce7f => {
    if (!_0x34ce7f || typeof _0x34ce7f !== "object") {
      return null;
    }
    const _0x3164fd = String(_0x34ce7f.url || "").trim();
    if (!_0x3164fd) {
      return null;
    }
    return {
      edgeId: _0x34ce7f.edgeId ? String(_0x34ce7f.edgeId) : "",
      sourceId: _0x34ce7f.sourceId ? String(_0x34ce7f.sourceId) : "",
      sourceType: _0x34ce7f.sourceType ? String(_0x34ce7f.sourceType) : "",
      refSlot: _0x34ce7f.refSlot ? String(_0x34ce7f.refSlot) : "",
      url: _0x3164fd
    };
  }).filter(Boolean);
}
function parseResponseData(_0x503811) {
  if (!_0x503811) {
    return {};
  }
  if (typeof _0x503811 === "object") {
    return _0x503811;
  }
  const _0xd5ebfb = String(_0x503811 || "").trim();
  if (!_0xd5ebfb) {
    return {};
  }
  try {
    return JSON.parse(_0xd5ebfb);
  } catch {}
  const _0x1f1044 = _0xd5ebfb.split("\n").filter(_0x11ff1f => _0x11ff1f.trim().startsWith("data:"));
  if (_0x1f1044.length > 0) {
    const _0x26258d = _0x1f1044[_0x1f1044.length - 1].replace(/^data:\s*/, "");
    try {
      return JSON.parse(_0x26258d);
    } catch {}
  }
  throw new Error("无法解析 RunningHub 音频接口响应");
}
function extractRunningHubTaskIdFromRawText(_0x1ca018) {
  const _0x446de4 = String(_0x1ca018 || "");
  if (!_0x446de4) {
    return "";
  }
  const _0x441af8 = [/"task_id"\s*:\s*"?([a-zA-Z0-9._:-]+)"?/i, /"taskId"\s*:\s*"?([a-zA-Z0-9._:-]+)"?/i, /"taskid"\s*:\s*"?([a-zA-Z0-9._:-]+)"?/i, /"prompt_id"\s*:\s*"?([a-zA-Z0-9._:-]+)"?/i, /\btask[_-]?id\b\s*[:=]\s*["']?([a-zA-Z0-9._:-]+)["']?/i];
  for (const _0x7fbdf of _0x441af8) {
    const _0x238093 = _0x446de4.match(_0x7fbdf);
    const _0x3a11e3 = String(_0x238093?.[1] || "").replace(/,/g, "").trim();
    if (_0x3a11e3) {
      return _0x3a11e3;
    }
  }
  return "";
}
function getTaskId(_0x176637, _0x4e4e37 = "") {
  const _0x31a79c = extractRunningHubTaskIdFromRawText(_0x4e4e37);
  if (_0x31a79c) {
    return _0x31a79c;
  }
  const _0x5942d4 = Array.isArray(_0x176637?.data) ? _0x176637.data[0] : _0x176637?.data && typeof _0x176637.data === "object" ? _0x176637.data : null;
  const _0x1747d9 = Array.isArray(_0x176637?.results) ? _0x176637.results[0] : _0x176637?.results && typeof _0x176637.results === "object" ? _0x176637.results : null;
  const _0x26e16f = _0x176637?.result && typeof _0x176637.result === "object" ? _0x176637.result : null;
  const _0x152bf5 = _0x176637?.output && typeof _0x176637.output === "object" ? _0x176637.output : null;
  const _0x1c4418 = _0x176637?.response && typeof _0x176637.response === "object" ? _0x176637.response : null;
  const _0x46e331 = [_0x176637?.taskId, _0x176637?.task_id, _0x176637?.prompt_id, _0x176637?.id, _0x176637?.data?.taskId, _0x176637?.data?.task_id, _0x176637?.data?.prompt_id, _0x176637?.data?.id, _0x5942d4?.taskId, _0x5942d4?.task_id, _0x5942d4?.prompt_id, _0x5942d4?.id, _0x26e16f?.taskId, _0x26e16f?.task_id, _0x26e16f?.prompt_id, _0x26e16f?.id, _0x152bf5?.taskId, _0x152bf5?.task_id, _0x152bf5?.prompt_id, _0x152bf5?.id, _0x1c4418?.taskId, _0x1c4418?.task_id, _0x1c4418?.prompt_id, _0x1c4418?.id, _0x1747d9?.taskId, _0x1747d9?.task_id, _0x1747d9?.prompt_id, _0x1747d9?.id];
  for (const _0x395a87 of _0x46e331) {
    const _0x504fee = String(_0x395a87 || "").trim();
    if (_0x504fee) {
      return _0x504fee;
    }
  }
  return "";
}
function getApiErrorMessage(_0x5049a8, _0x486db9 = "音频生成失败") {
  return formatRunningHubFailureMessage(_0x5049a8, _0x5049a8?.message || _0x5049a8?.error || _0x5049a8?.msg || _0x5049a8?.data?.message || _0x5049a8?.data?.error || _0x486db9);
}
function collectResponseText(_0x4fa28d, _0x527683 = []) {
  if (_0x4fa28d === null || _0x4fa28d === undefined) {
    return _0x527683;
  }
  if (typeof _0x4fa28d === "string" || typeof _0x4fa28d === "number" || typeof _0x4fa28d === "boolean") {
    const _0x56939a = String(_0x4fa28d || "").trim();
    if (_0x56939a) {
      _0x527683.push(_0x56939a);
    }
    return _0x527683;
  }
  if (Array.isArray(_0x4fa28d)) {
    _0x4fa28d.forEach(_0x457c1e => collectResponseText(_0x457c1e, _0x527683));
    return _0x527683;
  }
  if (typeof _0x4fa28d === "object") {
    ["message", "msg", "error", "errorMessage", "detail", "summary", "suggestion", "code", "errorCode", "status"].forEach(_0x55f7ca => {
      if (Object.prototype.hasOwnProperty.call(_0x4fa28d, _0x55f7ca)) {
        collectResponseText(_0x4fa28d[_0x55f7ca], _0x527683);
      }
    });
  }
  return _0x527683;
}
function getRunningHubAudioCreateResponseText(_0x2a1402) {
  return collectResponseText(_0x2a1402).join(" | ");
}
function isRunningHubAudioQueueLimitResponse(_0x3b18c9) {
  const _0x438e1c = getRunningHubAudioCreateResponseText(_0x3b18c9);
  if (!_0x438e1c) {
    return false;
  }
  const _0x115a96 = _0x438e1c.toLowerCase();
  return /api\s*queue\s*limit|queue\s*limit|retry\s*later|rate\s*limit|too\s*many|concurren/.test(_0x115a96) || /并发.*(上限|上线|达到|超限|限制)|上限.*并发|降低并发|稍后重试|请求频率/.test(_0x438e1c);
}
function buildRunningHubAudioCreateError(_0x100cdf) {
  const _0xfa768b = Number(_0x100cdf?.code);
  if (Number.isFinite(_0xfa768b) && _0xfa768b !== 0) {
    return new Error(getApiErrorMessage(_0x100cdf, "音频任务创建失败"));
  }
  const _0x36260e = String(_0x100cdf?.status || "").toUpperCase();
  if (_0x36260e === "FAILED") {
    const _0x510852 = String(_0x100cdf?.errorMessage || _0x100cdf?.msg || _0x100cdf?.message || "音频任务创建失败");
    return new Error(_0x510852);
  }
  const _0x3d0c5e = String(_0x100cdf?.errorCode || "").trim();
  if (_0x3d0c5e) {
    const _0x3ebf75 = String(_0x100cdf?.errorMessage || _0x100cdf?.msg || "音频任务创建失败 (" + _0x3d0c5e + ")");
    return new Error(_0x3ebf75);
  }
  return null;
}
async function requestRunningHubAudioCreateTask(_0x8ac955, _0x15a0b9, _0x5a702d = {}) {
  const _0x1a2de3 = normalizeRetryDelays(_0x5a702d?.queueLimitRetryDelaysMs);
  for (let _0x91508d = 0;; _0x91508d += 1) {
    const _0x133dd6 = await requester({
      url: _0x8ac955.url,
      method: "POST",
      provider: _0x15a0b9,
      timeout: 120000,
      signal: _0x5a702d?.signal,
      headers: _0x8ac955.headers || {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(_0x8ac955.body),
      responseType: "auto"
    });
    const _0x443aa9 = parseResponseData(_0x133dd6);
    const _0x5d136c = buildRunningHubAudioCreateError(_0x443aa9);
    if (!_0x5d136c) {
      return {
        createRaw: _0x133dd6,
        createData: _0x443aa9
      };
    }
    if (isRunningHubAudioQueueLimitResponse(_0x443aa9) && _0x91508d < _0x1a2de3.length && !_0x5a702d?.signal?.aborted) {
      await sleep(_0x1a2de3[_0x91508d], _0x5a702d?.signal);
      continue;
    }
    throw _0x5d136c;
  }
}
function isLikelyAudioUrl(_0x56d32d) {
  const _0x4c72ac = String(_0x56d32d || "").trim();
  if (!_0x4c72ac) {
    return false;
  }
  if (!/^https?:\/\//i.test(_0x4c72ac) && !_0x4c72ac.startsWith("/")) {
    return false;
  }
  return /\.(wav|mp3|m4a|flac|aac|ogg|opus|wma|amr|aif|aiff|caf|webm)(\?|#|$)/i.test(_0x4c72ac);
}
function isLikelyImageUrl(_0x46225c) {
  const _0x31f1a6 = String(_0x46225c || "").trim();
  if (!_0x31f1a6) {
    return false;
  }
  if (/^data:image\//i.test(_0x31f1a6)) {
    return true;
  }
  if (!/^https?:\/\//i.test(_0x31f1a6) && !_0x31f1a6.startsWith("/")) {
    return false;
  }
  return /\.(png|jpe?g|webp|gif|bmp|svg|avif)(\?|#|$)/i.test(_0x31f1a6);
}
function extractAudioResultEntries(_0x1b0a73) {
  const _0x243b9e = [];
  const _0x17a392 = new WeakSet();
  const _0xf679a = ["audioUrl", "audio_url", "url", "fileUrl", "download_url", "output", "mediaUrl"];
  const _0x19e5c6 = (_0x5610b, _0x3b9a07 = "") => {
    if (_0x5610b == null) {
      return;
    }
    if (Array.isArray(_0x5610b)) {
      _0x5610b.forEach(_0x965a4a => _0x19e5c6(_0x965a4a, _0x3b9a07));
      return;
    }
    if (typeof _0x5610b === "object") {
      _0x4275a9(_0x5610b, _0x3b9a07);
      return;
    }
    const _0x5da804 = String(_0x5610b || "").trim();
    if (!_0x5da804) {
      return;
    }
    _0x243b9e.push({
      nodeId: String(_0x3b9a07 || "").trim(),
      audioUrl: _0x5da804
    });
  };
  const _0x4275a9 = (_0x88fd31, _0x33fc86 = "") => {
    if (_0x88fd31 == null) {
      return;
    }
    if (Array.isArray(_0x88fd31)) {
      _0x88fd31.forEach(_0x22b625 => _0x4275a9(_0x22b625, _0x33fc86));
      return;
    }
    if (typeof _0x88fd31 !== "object") {
      return;
    }
    if (_0x17a392.has(_0x88fd31)) {
      return;
    }
    _0x17a392.add(_0x88fd31);
    const _0x37f073 = String(_0x88fd31.nodeId || _0x88fd31.node_id || _0x33fc86 || "").trim();
    _0xf679a.forEach(_0x3f4918 => {
      if (Object.prototype.hasOwnProperty.call(_0x88fd31, _0x3f4918)) {
        _0x19e5c6(_0x88fd31[_0x3f4918], _0x37f073);
      }
    });
    Object.entries(_0x88fd31).forEach(([_0x1142ac, _0x1a0811]) => {
      if (_0x1142ac === "nodeId" || _0x1142ac === "node_id" || _0xf679a.includes(_0x1142ac)) {
        return;
      }
      if (_0x1a0811 && typeof _0x1a0811 === "object") {
        _0x4275a9(_0x1a0811, _0x37f073);
      }
    });
  };
  _0x4275a9(_0x1b0a73);
  const _0x38256f = [];
  const _0x2c1c1c = new Set();
  for (const _0x336f11 of _0x243b9e) {
    const _0x117618 = String(_0x336f11?.nodeId || "").trim();
    const _0x4daf4b = String(_0x336f11?.audioUrl || "").trim();
    if (!_0x4daf4b) {
      continue;
    }
    const _0x40cbd1 = _0x117618 + "::" + _0x4daf4b;
    if (_0x2c1c1c.has(_0x40cbd1)) {
      continue;
    }
    _0x2c1c1c.add(_0x40cbd1);
    _0x38256f.push({
      nodeId: _0x117618,
      audioUrl: _0x4daf4b
    });
  }
  const _0x4b9327 = _0x38256f.filter(_0x3a11fd => !isLikelyImageUrl(_0x3a11fd.audioUrl));
  const _0xdc0fc0 = _0x4b9327.filter(_0x1ec797 => isLikelyAudioUrl(_0x1ec797.audioUrl));
  if (_0xdc0fc0.length) {
    return _0xdc0fc0;
  } else {
    return _0x4b9327;
  }
}
function extractAudioUrls(_0x4a3597) {
  return extractAudioResultEntries(_0x4a3597).map(_0x4a5636 => _0x4a5636.audioUrl);
}
function extractMappedAudioResultEntries(_0x24e7de, _0x18dbb4 = null) {
  const _0x2ee8c9 = _0x18dbb4?.resultPaths || _0x18dbb4?.paths || [];
  const _0x4135ba = resolveMappedResponseValues(_0x24e7de, _0x2ee8c9).map(_0x2cd2e0 => String(_0x2cd2e0 || "").trim()).filter(Boolean);
  if (_0x4135ba.length === 0) {
    return extractAudioResultEntries(_0x24e7de);
  }
  return _0x4135ba.map(_0x19e855 => ({
    nodeId: "",
    audioUrl: _0x19e855
  }));
}
function normalizeAudioTaskResult(_0x20e16b, _0x573b2d, _0x148739 = 1) {
  const _0x329930 = Array.isArray(_0x20e16b) ? _0x20e16b.map(_0x398664 => {
    if (_0x398664 && typeof _0x398664 === "object") {
      return {
        nodeId: String(_0x398664.nodeId || _0x398664.node_id || "").trim(),
        audioUrl: String(_0x398664.audioUrl || _0x398664.url || "").trim()
      };
    }
    return {
      nodeId: "",
      audioUrl: String(_0x398664 || "").trim()
    };
  }).filter(_0x53c79d => !!_0x53c79d.audioUrl && !isLikelyImageUrl(_0x53c79d.audioUrl)) : [];
  if (_0x329930.length < Math.max(1, Number(_0x148739) || 1)) {
    throw new Error(String(_0x573b2d || "任务已完成，但未提取到音频地址"));
  }
  const _0x89e518 = _0x329930.map(_0x4d04b3 => ({
    audioUrl: _0x4d04b3.audioUrl,
    ...(_0x4d04b3.nodeId ? {
      nodeId: _0x4d04b3.nodeId
    } : {})
  }));
  return {
    audioUrl: _0x329930[0].audioUrl,
    isBatch: _0x329930.length > 1,
    audios: _0x89e518
  };
}
function normalizeAudioSeparationTaskResult(_0x5d97d5, _0x3fe44e) {
  const _0x3e1cff = getAudioSeparationResultNodeIds();
  const _0x4b3282 = Array.isArray(_0x5d97d5) ? _0x5d97d5.map(_0x4a2563 => ({
    nodeId: String(_0x4a2563?.nodeId || "").trim(),
    audioUrl: String(_0x4a2563?.audioUrl || "").trim()
  })).filter(_0x1059b7 => !!_0x1059b7.audioUrl) : [];
  const _0x59e782 = _0x4b3282.some(_0x1eba05 => _0x1eba05.nodeId === _0x3e1cff.vocals || _0x1eba05.nodeId === _0x3e1cff.background);
  let _0x54e0cb = _0x4b3282;
  if (_0x59e782) {
    const _0x9a6dc3 = _0x4b3282.find(_0x4b4518 => _0x4b4518.nodeId === _0x3e1cff.vocals) || null;
    const _0x15a93b = _0x4b3282.find(_0x2c1889 => _0x2c1889.nodeId === _0x3e1cff.background) || null;
    if (!_0x9a6dc3 || !_0x15a93b) {
      throw new Error(String(_0x3fe44e || "任务已完成，但未提取到人声和背景声音频地址"));
    }
    _0x54e0cb = [{
      ..._0x9a6dc3,
      role: "vocals"
    }, {
      ..._0x15a93b,
      role: "background"
    }];
  } else {
    _0x54e0cb = _0x4b3282.slice(0, 2).map((_0x19fbfc, _0x45e567) => ({
      ..._0x19fbfc,
      role: _0x45e567 === 0 ? "vocals" : "background"
    }));
  }
  if (_0x54e0cb.length < 2) {
    throw new Error(String(_0x3fe44e || "任务已完成，但未提取到人声和背景声音频地址"));
  }
  return {
    audioUrl: _0x54e0cb[0].audioUrl,
    isBatch: true,
    vocalsAudioUrl: _0x54e0cb[0].audioUrl,
    backgroundAudioUrl: _0x54e0cb[1].audioUrl,
    audios: _0x54e0cb.map(_0x2d6b54 => ({
      audioUrl: _0x2d6b54.audioUrl,
      nodeId: _0x2d6b54.nodeId,
      role: _0x2d6b54.role
    }))
  };
}
function normalizeAdvancedVoiceClonePrompt(_0x150ccd) {
  return String(_0x150ccd || "").trim().replace(/(^|\s+)@?音频1\s*[:：]?\s*/g, "$1[speaker_1]: ").replace(/(^|\s+)@?音频2\s*[:：]?\s*/g, "$1[speaker_2]: ").replace(/\s+(\[speaker_[12]\]:)/g, "\n$1").trim();
}
function getMappingNode(_0x7f142c, _0x27973b, _0x4ce70c) {
  const _0x1660e4 = _0x7f142c?.[_0x27973b];
  const _0x479243 = String(_0x1660e4?.nodeId || "").trim();
  const _0x573ecd = String(_0x1660e4?.fieldName || "").trim();
  if (!_0x479243 || !_0x573ecd) {
    throw new Error("音频工作流 manifest 缺少 " + _0x4ce70c + " 节点映射");
  }
  return {
    nodeId: _0x479243,
    fieldName: _0x573ecd
  };
}
function createNodeInfo(_0x4f6075, _0x2e0473, _0x10b2d5 = "") {
  return {
    nodeId: _0x4f6075.nodeId,
    fieldName: _0x4f6075.fieldName,
    fieldValue: _0x2e0473,
    ...(_0x10b2d5 ? {
      description: _0x10b2d5
    } : {})
  };
}
function resolveAudioWorkflowInputValue(_0x506f28 = [], _0x3abe84 = {}) {
  const _0x2b0066 = String(_0x3abe84.slot || _0x3abe84.refSlot || "").trim();
  if (_0x2b0066) {
    return (Array.isArray(_0x506f28) ? _0x506f28 : []).find(_0xb22954 => String(_0xb22954?.refSlot || "").trim() === _0x2b0066)?.url || "";
  }
  const _0x212ded = Math.max(0, Math.trunc(Number(_0x3abe84.index) || 0));
  return String((Array.isArray(_0x506f28) ? _0x506f28 : [])[_0x212ded]?.url || "");
}
async function buildGenericAudioWorkflowNodeInfoList(_0x32135a = {}, _0x415302 = [], _0xad3e8f = "", _0x2f1c44 = {}) {
  return buildRunningHubNodeInfoListFromManifest({
    mapping: _0x32135a,
    payload: _0x2f1c44,
    finalPrompt: _0xad3e8f,
    sourceResolvers: {
      audioInput: ({
        item: _0x5dd162
      }) => resolveAudioWorkflowInputValue(_0x415302, _0x5dd162)
    }
  });
}
const KNOWN_AUDIO_REF_SLOTS = new Set(["audioRef", "audioTarget", "audio1", "audio2", "audio", "sourceAudio", "referenceAudio"]);
function normalizeAudioItemsBySlotOrder(_0x505a9a = [], _0x476061 = [], {
  remapKnownForeignSlots = true
} = {}) {
  const _0x1f0354 = (Array.isArray(_0x476061) ? _0x476061 : []).map(_0x45dc18 => String(_0x45dc18 || "").trim()).filter(Boolean);
  if (_0x1f0354.length === 0) {
    return _0x505a9a;
  }
  const _0x470106 = new Set();
  return (Array.isArray(_0x505a9a) ? _0x505a9a : []).map(_0x50509b => {
    const _0x1c5867 = String(_0x50509b?.refSlot || "").trim();
    if (_0x1c5867 && _0x1f0354.includes(_0x1c5867) && !_0x470106.has(_0x1c5867)) {
      _0x470106.add(_0x1c5867);
      return {
        ..._0x50509b,
        refSlot: _0x1c5867
      };
    }
    if (_0x1c5867 && remapKnownForeignSlots !== true && KNOWN_AUDIO_REF_SLOTS.has(_0x1c5867)) {
      return {
        ..._0x50509b,
        refSlot: _0x1c5867
      };
    }
    const _0x4d1a01 = _0x1f0354.find(_0x3cb0d7 => !_0x470106.has(_0x3cb0d7)) || "";
    if (!_0x4d1a01) {
      return {
        ..._0x50509b,
        refSlot: _0x1f0354.includes(_0x1c5867) ? _0x1c5867 : ""
      };
    }
    _0x470106.add(_0x4d1a01);
    return {
      ..._0x50509b,
      refSlot: _0x4d1a01
    };
  });
}
async function buildNodeInfoList(_0x4df460, _0x4812ae, _0x4624d5, _0x3e6301 = {}) {
  const _0x26a7e4 = _0x4df460?.mapping || {};
  const _0x670e66 = String(_0x26a7e4?.preset || "").trim();
  if (_0x670e66 === "rh-audio-indextts2-clone") {
    const _0x575cd8 = normalizeAudioItemsBySlotOrder(_0x4812ae, ["audioRef", "audio2"], {
      remapKnownForeignSlots: false
    });
    const _0x522b2f = new Map(_0x575cd8.map(_0x4b165c => [String(_0x4b165c.refSlot || ""), _0x4b165c]));
    const _0x42503a = _0x522b2f.get("audioRef") || null;
    const _0x92f85b = _0x522b2f.get("audio2") || null;
    if (!_0x42503a?.url) {
      throw new Error("音色克隆V1需要参考音色");
    }
    const _0x1f6205 = !!_0x92f85b?.url;
    if (!_0x1f6205 && !_0x4624d5) {
      throw new Error("音色克隆V1需要提示词内容");
    }
    const _0x2065b3 = getMappingNode(_0x26a7e4, "refAudioNode", "参考音色");
    const _0x4b9b10 = getMappingNode(_0x26a7e4, "audio2Node", "音频2");
    const _0x678a30 = getMappingNode(_0x26a7e4, "promptNode", "提示词");
    const _0x396844 = getMappingNode(_0x26a7e4, "indexNode", "模型选择");
    const _0x467428 = [createNodeInfo(_0x2065b3, _0x42503a.url, "克隆声音")];
    if (_0x1f6205) {
      _0x467428.push(createNodeInfo(_0x4b9b10, _0x92f85b.url, "音频2"));
    }
    const _0x582911 = _0x1f6205 ? _0x4624d5 ? "1" : "2" : "0";
    _0x467428.push(createNodeInfo(_0x678a30, _0x4624d5, "提示词"), createNodeInfo(_0x396844, _0x582911, "模型选择"));
    return _0x467428;
  }
  if (_0x670e66 === "rh-audio-voice-convert") {
    const _0x278921 = normalizeAudioItemsBySlotOrder(_0x4812ae, ["audioRef", "audioTarget"]);
    const _0x2a8823 = new Map(_0x278921.map(_0x594cfa => [String(_0x594cfa.refSlot || ""), _0x594cfa]));
    const _0x2ef40e = _0x2a8823.get("audioRef") || null;
    const _0x551d59 = _0x2a8823.get("audioTarget") || null;
    if (!_0x2ef40e?.url || !_0x551d59?.url) {
      throw new Error("音色转换需要声线参考和语气参考");
    }
    const _0xdf72e8 = getMappingNode(_0x26a7e4, "refAudioNode", "声线参考");
    const _0x56278f = getMappingNode(_0x26a7e4, "targetAudioNode", "语气参考");
    return [createNodeInfo(_0xdf72e8, _0x2ef40e.url), createNodeInfo(_0x56278f, _0x551d59.url)];
  }
  if (_0x670e66 === "rh-audio-advanced-voice-clone") {
    const _0x226d4e = normalizeAudioItemsBySlotOrder(_0x4812ae, ["audio1", "audio2"]);
    const _0x2aa01f = new Map(_0x226d4e.map(_0x1d7b4d => [String(_0x1d7b4d.refSlot || ""), _0x1d7b4d]));
    const _0x29b50c = _0x2aa01f.get("audio1") || null;
    const _0x511935 = _0x2aa01f.get("audio2") || null;
    if (!_0x4624d5) {
      throw new Error("进阶声音克隆需要提示词内容");
    }
    const _0x10ef2f = getMappingNode(_0x26a7e4, "audio1Node", "音频1");
    const _0x288b24 = getMappingNode(_0x26a7e4, "audio2Node", "音频2");
    const _0x55b126 = getMappingNode(_0x26a7e4, "promptNode", "提示词");
    const _0x42a388 = getMappingNode(_0x26a7e4, "indexNode", "音频数量");
    const _0x4c215f = [];
    if (_0x29b50c?.url) {
      _0x4c215f.push(createNodeInfo(_0x10ef2f, _0x29b50c.url, "audio"));
    }
    if (_0x511935?.url) {
      _0x4c215f.push(createNodeInfo(_0x288b24, _0x511935.url, "audio"));
    }
    _0x4c215f.push(createNodeInfo(_0x55b126, normalizeAdvancedVoiceClonePrompt(_0x4624d5), "prompt"), createNodeInfo(_0x42a388, String([_0x29b50c?.url, _0x511935?.url].filter(Boolean).length), "index"));
    return _0x4c215f;
  }
  const _0x44e958 = await buildGenericAudioWorkflowNodeInfoList(_0x26a7e4, _0x4812ae, _0x4624d5, _0x3e6301);
  if (_0x44e958) {
    return _0x44e958;
  }
  throw new Error("未选择可用的音频工作流");
}
export async function buildGenerateAudioRequest(_0x41e287) {
  await ensureConfig();
  const _0x342f56 = String(_0x41e287?.audioWorkflowKey || "").trim();
  const _0x28d695 = resolveModelExecution(_0x342f56);
  if (!_0x28d695) {
    throw new Error("未选择可用的音频模型");
  }
  const _0x2cd886 = String(_0x28d695.modelManifest?.provider || _0x41e287?.provider || "runninghubwf").trim();
  const _0x1f9310 = normalizeTextList(_0x41e287?.textInputs);
  const _0x3ce5a7 = String(_0x41e287?.prompt || "").trim();
  const _0x2b1411 = _0x3ce5a7 || _0x1f9310.join("\n").trim();
  const _0x3d3568 = normalizeRefList(_0x41e287?.audioRefs);
  const _0x3bbcf4 = normalizeRefList(_0x41e287?.videoRefs);
  const _0xafc609 = String(_0x41e287?.installId || "").trim();
  const _0x1d02bd = _0x41e287?.generationParams || {};
  if (_0x2cd886 === "volcengine-speech" && _0x28d695?.modelManifest?.modelId === "volcengine-speech/tts") {
    return buildVolcengineSpeechRequest({
      payload: _0x41e287,
      resolved: _0x28d695,
      workflowKey: _0x342f56,
      prompt: _0x2b1411,
      textInputs: _0x1f9310,
      audioRefs: _0x3d3568,
      videoRefs: _0x3bbcf4,
      installId: _0xafc609,
      generationParams: _0x1d02bd
    });
  }
  if (_0x2cd886 === "runninghub" && _0x28d695?.executionManifest?.adapterType === "modelApi") {
    return buildRunningHubAudioModelApiRequest({
      payload: _0x41e287,
      resolved: _0x28d695,
      workflowKey: _0x342f56,
      prompt: _0x2b1411,
      textInputs: _0x1f9310,
      audioRefs: _0x3d3568,
      videoRefs: _0x3bbcf4,
      installId: _0xafc609,
      generationParams: _0x1d02bd
    });
  }
  if (_0x28d695?.executionManifest?.adapterType === "modelApi") {
    const _0x1b0eb4 = await buildAudioRequestFromManifest({
      ..._0x41e287,
      model: _0x342f56,
      audioWorkflowKey: _0x342f56
    }, _0x2b1411, {
      getProviderConfig: getProviderConfig,
      processInputAudios: processInputAudios
    }, {
      expectedProvider: _0x28d695?.modelManifest?.provider || _0x2cd886
    });
    if (_0x1b0eb4) {
      return {
        ..._0x1b0eb4,
        meta: {
          ...(_0x1b0eb4.meta || {}),
          audioWorkflowKey: _0x342f56,
          audioWorkflowLabel: String(_0x41e287?.audioWorkflowLabel || "").trim(),
          nodeId: String(_0x41e287?.nodeId || "").trim(),
          installId: _0xafc609,
          prompt: _0x2b1411,
          textInputs: _0x1f9310,
          audioRefs: _0x3d3568,
          videoRefs: _0x3bbcf4
        }
      };
    }
    throw new Error((_0x28d695?.modelManifest?.provider || _0x2cd886) + " audio model API manifest missing: " + _0x342f56);
  }
  if (_0x2cd886 === "comfyui" && _0x28d695?.executionManifest?.adapterType === "workflow") {
    const _0x236e29 = await a35_0x24c424.buildAudioRequest({
      ..._0x41e287,
      model: _0x342f56
    }, _0x2b1411, {
      getProviderConfig: getProviderConfig,
      uploadInputToComfyUi: uploadInputToComfyUi
    });
    return {
      ..._0x236e29,
      meta: {
        provider: "comfyui",
        adapterType: "workflow",
        audioWorkflowKey: _0x342f56,
        audioWorkflowLabel: String(_0x41e287?.audioWorkflowLabel || "").trim(),
        model: _0x28d695.modelManifest.modelId,
        executionId: _0x28d695.executionManifest.id,
        nodeId: String(_0x41e287?.nodeId || "").trim(),
        installId: _0xafc609,
        isComfyUiAudio: true,
        prompt: _0x2b1411,
        textInputs: _0x1f9310,
        audioRefs: _0x3d3568,
        videoRefs: _0x3bbcf4
      }
    };
  }
  const _0x34df5a = getRunningHubWorkflowProfileId(_0x41e287);
  const _0x668ad6 = getProviderConfig(_0x34df5a || "runninghubwf");
  const _0xec4526 = String(_0x34df5a || _0x668ad6?.providerProfileId || "").trim();
  const _0xcd1272 = resolveRunningHubAudioWorkflowAppId(_0x28d695?.executionManifest, _0xec4526);
  if (!_0xcd1272) {
    throw new Error("未选择可用的音频工作流");
  }
  const _0x2d8fcc = String(_0x41e287?.apiKey || _0x668ad6?.apiKey || "").trim();
  const _0x33eb0b = resolveRunningHubModelApiBaseUrl(_0xec4526);
  if (!_0x2d8fcc) {
    throw new Error("RunningHub API Key 未配置");
  }
  const _0x37aad5 = normalizeRunningHubInstanceType(_0x41e287?.rhInstanceType);
  const _0x43a488 = await processInputAudiosPreserveOrder(_0x3d3568.map(_0x21f957 => _0x21f957.url), _0x2d8fcc, {
    strictUpload: true,
    apiUrl: _0x33eb0b
  });
  const _0x26a371 = _0x3d3568.map((_0x3c871f, _0x7a2c5f) => ({
    ..._0x3c871f,
    url: String(_0x43a488[_0x7a2c5f] || "").trim()
  })).filter(_0x150c2a => !!_0x150c2a.url);
  const _0x1e55db = await buildNodeInfoList(_0x28d695.executionManifest, _0x26a371, _0x2b1411, _0x41e287);
  return {
    url: "/api/v2/proxy/image",
    headers: {
      "Content-Type": "application/json",
      ...(_0xafc609 ? {
        "X-AIC-Install-Id": _0xafc609
      } : {})
    },
    body: {
      apiUrl: _0x33eb0b + "/openapi/v2/run/ai-app/" + _0xcd1272,
      apiKey: _0x2d8fcc,
      nodeInfoList: _0x1e55db,
      instanceType: _0x37aad5,
      usePersonalQueue: "false"
    },
    meta: {
      provider: _0x2cd886,
      ...(_0xec4526 ? {
        providerProfileId: _0xec4526,
        rhProviderProfileId: _0xec4526
      } : {}),
      apiUrl: _0x33eb0b,
      audioWorkflowKey: _0x342f56,
      audioWorkflowLabel: String(_0x41e287?.audioWorkflowLabel || "").trim(),
      model: _0x342f56 === RH_AUDIO_ADVANCED_VOICE_CLONE_MODEL_ID ? _0x28d695.modelManifest.modelId : _0x342f56,
      executionId: _0x28d695.executionManifest.id,
      nodeId: String(_0x41e287?.nodeId || "").trim(),
      installId: _0xafc609,
      rhInstanceType: _0x37aad5,
      prompt: _0x2b1411,
      textInputs: _0x1f9310,
      audioRefs: _0x3d3568,
      videoRefs: _0x3bbcf4
    }
  };
}
async function buildVolcengineSpeechRequest({
  payload: _0xafbc54,
  resolved: _0x549fb1,
  workflowKey: _0x5da9a3,
  prompt: _0x4613e4,
  textInputs: _0x1e2fb1,
  audioRefs: _0x137d97,
  videoRefs: _0x249ce1,
  installId: _0x1031b7,
  generationParams: _0x3e5c31
}) {
  const _0x23b089 = getProviderConfig("volcengine-speech");
  const _0x26e42d = String(_0xafbc54?.apiKey || _0x23b089?.apiKey || "").trim();
  if (!_0x26e42d) {
    throw new Error("火山语音 API Key 未配置，请在设置 > API Key > 火山语音中配置");
  }
  const _0x114d4a = _0x3e5c31 || {};
  const _0x1421a1 = String(_0x114d4a.format || "mp3").trim() === "ogg" ? "ogg_opus" : String(_0x114d4a.format || "mp3").trim();
  const _0x47be49 = Number(_0x114d4a.speechRate);
  const _0x4e16fd = Number(_0x114d4a.loudnessRate);
  const _0x4920f6 = Number(_0x114d4a.pitch);
  const _0x2dc1f6 = Number(_0x114d4a.sampleRate || 24000);
  const _0x3f4bb0 = String(_0x114d4a.speakerId || "").trim();
  const _0x261e0d = _0x3f4bb0 && _0x3f4bb0 !== "-" ? _0x3f4bb0 : "";
  const _0x357b85 = "zh_female_vv_uranus_bigtts";
  const _0xefe91a = String(_0x114d4a.voiceType || _0x357b85).trim();
  const _0x337f97 = String(_0x114d4a.voiceMode || "").trim();
  const _0x165912 = _0x337f97 === "custom" ? _0x261e0d || _0xefe91a : _0x337f97 === "default" ? _0xefe91a : _0x261e0d || _0xefe91a;
  const _0x3b04e3 = _0x337f97 === "custom" || !_0x337f97 && !!_0x261e0d;
  const _0x501e86 = getVolcengineOfficialTtsResourceId(_0x165912);
  const _0x21413c = _0x3b04e3 && isVolcengineIclSpeakerId(_0x165912);
  const _0xa02cc9 = _0x21413c ? VOLCENGINE_ICL_RESOURCE_ID : _0x501e86 || VOLCENGINE_TTS_RESOURCE_ID;
  if (!_0x4613e4 || !String(_0x4613e4).trim()) {
    throw new Error("请输入要合成的文本内容");
  }
  if (!_0x165912) {
    throw new Error("请选择音色或在高级设置中填入自定义音色ID");
  }
  const _0x4457c7 = String(_0x4613e4).trim();
  const _0x26888f = {
    format: _0x1421a1,
    sample_rate: [8000, 16000, 22050, 24000, 32000, 44100, 48000].includes(_0x2dc1f6) ? _0x2dc1f6 : 24000,
    speech_rate: Number.isFinite(_0x47be49) && _0x47be49 >= -50 && _0x47be49 <= 100 ? Math.round(_0x47be49) : 0,
    loudness_rate: Number.isFinite(_0x4e16fd) && _0x4e16fd >= -50 && _0x4e16fd <= 100 ? Math.round(_0x4e16fd) : 0
  };
  if (_0x1421a1 === "mp3") {
    _0x26888f.bit_rate = 160000;
  }
  const _0x4a5bd3 = {
    disable_markdown_filter: false,
    disable_emoji_filter: false
  };
  if (Number.isFinite(_0x4920f6) && _0x4920f6 !== 0 && _0x4920f6 >= -12 && _0x4920f6 <= 12) {
    _0x4a5bd3.post_process = {
      pitch: Math.round(_0x4920f6)
    };
  }
  const _0x4a764c = {
    text: _0x4457c7,
    speaker: _0x165912,
    audio_params: _0x26888f,
    additions: JSON.stringify(_0x4a5bd3)
  };
  if (_0x21413c) {
    _0x4a764c.model = "seed-tts-2.0-standard";
  }
  const _0x196153 = {
    req_params: _0x4a764c
  };
  const _0x3d1242 = generateReqId();
  return {
    url: "/api/v2/proxy/task?apiUrl=" + encodeURIComponent(VOLCENGINE_TTS_BASE_URL),
    headers: {
      "Content-Type": "application/json",
      "X-Api-Key": _0x26e42d,
      "X-Api-Resource-Id": _0xa02cc9,
      "X-Api-Request-Id": _0x3d1242
    },
    body: JSON.stringify(_0x196153),
    meta: {
      provider: "volcengine-speech",
      audioWorkflowKey: _0x5da9a3,
      audioWorkflowLabel: String(_0xafbc54?.audioWorkflowLabel || "").trim(),
      model: _0x549fb1.modelManifest.modelId,
      executionId: _0x549fb1.executionManifest.id,
      nodeId: String(_0xafbc54?.nodeId || "").trim(),
      installId: _0x1031b7,
      isVolcengineSpeech: true,
      audioFormat: _0x1421a1,
      prompt: _0x4613e4,
      textInputs: _0x1e2fb1,
      audioRefs: _0x137d97,
      videoRefs: _0x249ce1,
      apiKey: _0x26e42d,
      speakerId: _0x165912
    }
  };
}
async function buildRunningHubAudioModelApiRequest({
  payload: _0x13f229,
  resolved: _0x314454,
  workflowKey: _0x54db01,
  prompt: _0x2314e2,
  textInputs: _0x557051,
  audioRefs: _0x40cb23,
  videoRefs: _0x3122bb,
  installId: _0x525045,
  generationParams: _0x4b03ce
}) {
  const _0x2d03e9 = resolveRunningHubModelApiProfileId(_0x314454?.modelManifest?.modelId || _0x54db01, getRunningHubProviderProfileId(_0x13f229));
  const _0x30956b = getProviderConfig(_0x2d03e9);
  const _0x400062 = String(_0x30956b?.modelApiKey || _0x13f229?.apiKey || _0x30956b?.apiKey || "").trim();
  if (!_0x400062) {
    throw new Error("RunningHub API Key 未配置，请在设置 > API Key > RunningHub中配置");
  }
  const _0x2155d5 = String(_0x314454?.modelManifest?.modelType || _0x314454?.executionManifest?.extensions?.modelType || "").trim();
  const _0x29865b = String(_0x314454?.executionManifest?.model || "").trim();
  if (!_0x29865b) {
    throw new Error("RunningHub音频模型endpoint未配置");
  }
  const _0x6f518d = _0x4b03ce && typeof _0x4b03ce === "object" && !Array.isArray(_0x4b03ce) ? _0x4b03ce : {};
  const _0x387d85 = {
    ..._0x6f518d,
    ...sanitizeModelUiSchemaParams(_0x54db01, _0x6f518d, {
      includeDefaults: true
    })
  };
  const _0x5da33e = buildRunningHubModelApiUrl(_0x2d03e9, "/openapi/v2/" + _0x29865b);
  let _0x1c4944 = "";
  if (_0x40cb23.length > 0) {
    const _0x1490bd = String(_0x40cb23[0]?.url || "").trim();
    if (_0x1490bd) {
      const _0x5b8ad7 = await processInputAudiosPreserveOrder([_0x1490bd], _0x400062, {
        strictUpload: true,
        apiUrl: resolveRunningHubModelApiBaseUrl(_0x2d03e9),
        providerProfileId: _0x2d03e9
      });
      _0x1c4944 = String(_0x5b8ad7?.[0] || "").trim();
    }
  }
  let _0xc7ad42 = {};
  if (_0x2155d5 === "suno-single") {
    const _0x455ed4 = _0x387d85?.make_instrumental === true || _0x387d85?.make_instrumental === "true";
    const _0x55452d = String(_0x387d85?.title || "").trim();
    _0xc7ad42 = {
      description: _0x2314e2 || "",
      ...(_0x55452d && _0x55452d !== "-" ? {
        title: _0x55452d
      } : {}),
      make_instrumental: _0x455ed4 ? "true" : "false"
    };
  } else if (_0x2155d5 === "suno-custom") {
    const _0x555287 = String(_0x387d85?.tags || "pop").trim() || "pop";
    const _0x490737 = String(_0x387d85?.title || "").trim();
    const _0x5b9362 = !_0x490737 || _0x490737 === "-" ? "Untitled" : _0x490737;
    _0xc7ad42 = {
      prompt: _0x2314e2 || "",
      tags: _0x555287,
      title: _0x5b9362
    };
  } else if (_0x2155d5 === "minimax-tts") {
    _0xc7ad42 = {
      text: _0x2314e2 || "",
      voice_id: String(_0x387d85?.voice_id || "Wise_Woman").trim(),
      speed: Number(_0x387d85?.speed) || 1,
      volume: Number(_0x387d85?.volume) || 1,
      pitch: Number.isInteger(Number(_0x387d85?.pitch)) ? Number(_0x387d85.pitch) : 0,
      emotion: String(_0x387d85?.emotion || "happy").trim(),
      enable_base64_output: false,
      english_normalization: false,
      ...(Array.isArray(_0x387d85?.pronunciation_dict) && _0x387d85.pronunciation_dict.length > 0 ? {
        pronunciation_dict: _0x387d85.pronunciation_dict
      } : {})
    };
  } else if (_0x2155d5 === "minimax-music-instrumental") {
    _0xc7ad42 = {
      prompt: _0x2314e2 || "",
      is_instrumental: true,
      sampleRate: String(_0x387d85?.sampleRate || "44100").trim(),
      bitrate: String(_0x387d85?.bitrate || "256000").trim(),
      format: String(_0x387d85?.format || "mp3").trim()
    };
  } else if (_0x2155d5 === "minimax-music") {
    const _0x2bc34d = String(_0x387d85?.prompt || "").trim();
    const _0x3b622d = _0x2bc34d && _0x2bc34d !== "-" ? _0x2bc34d : _0x2314e2 || "";
    const _0x1b8eba = _0x387d85?.lyricsOptimizer === true || _0x387d85?.lyricsOptimizer === "true";
    _0xc7ad42 = {
      lyrics: _0x2314e2 || "",
      prompt: _0x3b622d,
      is_instrumental: false,
      lyricsOptimizer: _0x1b8eba,
      sampleRate: String(_0x387d85?.sampleRate || "44100").trim(),
      bitrate: String(_0x387d85?.bitrate || "256000").trim(),
      format: String(_0x387d85?.format || "mp3").trim()
    };
  } else {
    _0xc7ad42 = {
      prompt: _0x2314e2 || "",
      ...(_0x1c4944 ? {
        audioUrl: _0x1c4944
      } : {}),
      ..._0x387d85
    };
  }
  return {
    url: "/api/v2/proxy/image",
    headers: {
      "Content-Type": "application/json",
      ...(_0x525045 ? {
        "X-AIC-Install-Id": _0x525045
      } : {})
    },
    body: {
      apiUrl: _0x5da33e,
      apiKey: _0x400062,
      ..._0xc7ad42
    },
    meta: {
      provider: "runninghub",
      providerProfileId: _0x2d03e9,
      rhProviderProfileId: _0x2d03e9,
      audioWorkflowKey: _0x54db01,
      audioWorkflowLabel: String(_0x13f229?.audioWorkflowLabel || "").trim(),
      model: _0x314454.modelManifest.modelId,
      executionId: _0x314454.executionManifest.id,
      nodeId: String(_0x13f229?.nodeId || "").trim(),
      installId: _0x525045,
      isRunningHubAudioModelApi: true,
      modelType: _0x2155d5,
      prompt: _0x2314e2,
      textInputs: _0x557051,
      audioRefs: _0x40cb23,
      videoRefs: _0x3122bb
    }
  };
}
export async function buildAudioSeparationRequest(_0x41e9df = {}) {
  await ensureConfig();
  const _0x562d53 = a35_0x1179fe;
  const _0x3a896f = getAudioSeparationExecutionManifest();
  const _0x457f95 = _0x3a896f?.mapping?.sourceAudioNode;
  const _0x2cce7d = getRunningHubWorkflowProfileId(_0x41e9df);
  const _0x20da88 = getProviderConfig(_0x2cce7d || "runninghubwf");
  const _0x5305b5 = String(_0x2cce7d || _0x20da88?.providerProfileId || "").trim();
  const _0x326a5d = resolveRunningHubAudioWorkflowAppId(_0x3a896f, _0x5305b5);
  if (!_0x326a5d || !_0x457f95?.nodeId || !_0x457f95?.fieldName) {
    throw new Error("RunningHub audio workflow manifest missing: " + _0x562d53);
  }
  const _0x19d68d = resolveRunningHubModelApiBaseUrl(_0x5305b5);
  const _0x4a62c6 = String(_0x41e9df?.apiKey || _0x20da88?.apiKey || "").trim();
  if (!_0x4a62c6) {
    throw new Error("RunningHub API Key 未配置");
  }
  const _0x58b163 = String(_0x41e9df?.audioUrl || _0x41e9df?.src || _0x41e9df?.url || "").trim();
  if (!_0x58b163) {
    throw new Error("人声分离需要可用音频");
  }
  let _0x4bb8ad;
  try {
    _0x4bb8ad = await processInputAudiosPreserveOrder([_0x58b163], _0x4a62c6, {
      apiUrl: _0x19d68d,
      strictUpload: true
    });
  } catch (_0x506d52) {
    const _0x1b0be8 = String(_0x506d52?.getUserMessage?.() || _0x506d52?.message || _0x506d52 || "").trim();
    throw new Error("人声分离素材上传失败：" + (_0x1b0be8 || "未知上传错误"), {
      cause: _0x506d52
    });
  }
  const _0x5c2f02 = String(_0x4bb8ad?.[0] || "").trim();
  if (!_0x5c2f02) {
    throw new Error("人声分离素材上传失败：上传服务未返回文件地址");
  }
  const _0x23463c = normalizeRunningHubInstanceType(_0x41e9df?.rhInstanceType);
  return {
    url: "/api/v2/proxy/image",
    headers: {
      "Content-Type": "application/json"
    },
    body: {
      apiUrl: _0x19d68d + "/openapi/v2/run/ai-app/" + _0x326a5d,
      apiKey: _0x4a62c6,
      nodeInfoList: [{
        nodeId: _0x457f95.nodeId,
        fieldName: _0x457f95.fieldName,
        fieldValue: _0x5c2f02,
        description: "audio"
      }],
      instanceType: _0x23463c,
      usePersonalQueue: "false"
    },
    meta: {
      provider: "runninghubwf",
      providerProfileId: _0x5305b5,
      rhProviderProfileId: _0x5305b5,
      apiUrl: _0x19d68d,
      model: _0x562d53,
      executionId: _0x3a896f.id,
      adapterTrace: {
        source: "manifest",
        executionId: _0x3a896f.id,
        modelId: _0x562d53
      },
      nodeId: String(_0x41e9df?.nodeId || "").trim(),
      rhInstanceType: _0x23463c,
      sourceAudioUrl: _0x58b163,
      uploadedAudioUrl: _0x5c2f02
    }
  };
}
async function pollRunningHubAudioTask(_0x428b1b, _0x33a301, _0x4e8512 = {}) {
  if (_0x4e8512?.signal?.aborted) {
    throw new Error("CANCELLED");
  }
  const _0x2cae06 = _0x4e8512?.isRunningHubWorkflow === true ? resolveRunningHubWorkflowPollingPolicy(_0x4e8512) : null;
  const _0x392b82 = _0x2cae06?.pollIntervalMs ?? POLL_INTERVAL_MS;
  const _0x404a7a = _0x2cae06?.pollTimeoutMs ?? null;
  const _0x2df0f7 = _0x2cae06?.maxPolls ?? POLL_MAX_COUNT;
  const _0x5da18b = Date.now();
  for (let _0x2e6b7f = 0; _0x2e6b7f < _0x2df0f7; _0x2e6b7f++) {
    if (_0x404a7a !== null && hasRunningHubWorkflowPollingTimedOut(_0x5da18b, _0x404a7a)) {
      break;
    }
    if (_0x4e8512?.signal?.aborted) {
      throw new Error("CANCELLED");
    }
    if (_0x2e6b7f > 0 || _0x4e8512?.pollImmediately !== true) {
      await sleep(_0x392b82, _0x4e8512?.signal);
    }
    if (_0x4e8512?.signal?.aborted) {
      throw new Error("CANCELLED");
    }
    if (_0x404a7a !== null && hasRunningHubWorkflowPollingTimedOut(_0x5da18b, _0x404a7a)) {
      break;
    }
    const _0x2d561c = await requester({
      url: "/api/v2/proxy/image",
      method: "POST",
      provider: "runninghubwf",
      timeout: 30000,
      signal: _0x4e8512?.signal,
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        apiUrl: String(_0x4e8512?.apiUrl || "https://www.runninghub.cn").trim().replace(/\/+$/, "") + "/openapi/v2/query",
        apiKey: _0x33a301,
        taskId: _0x428b1b
      }),
      responseType: "auto"
    });
    const _0x36fe1d = parseResponseData(_0x2d561c);
    const _0x4b6616 = Number(_0x36fe1d?.code);
    if (Number.isFinite(_0x4b6616)) {
      if (_0x4b6616 === 804 || _0x4b6616 === 813) {
        continue;
      }
      if (_0x4b6616 !== 0) {
        throw new Error(getApiErrorMessage(_0x36fe1d, "音频任务轮询失败"));
      }
    }
    const _0x30a6bf = _0x36fe1d?.data && typeof _0x36fe1d.data === "object" ? _0x36fe1d.data : _0x36fe1d;
    const _0xabd447 = resolveRunningHubTaskLifecycleStatus(_0x36fe1d);
    if (_0xabd447 === "success") {
      if (extractAudioUrls(_0x30a6bf).length === 0) {
        continue;
      }
      return _0x30a6bf;
    }
    if (_0xabd447 === "cancelled") {
      throw new Error("CANCELLED");
    }
    if (_0xabd447 === "error") {
      throw new Error(getApiErrorMessage(_0x30a6bf, "音频任务执行失败"));
    }
  }
  throw new Error("音频任务超时，请稍后重试");
}
export async function resumeAudioSeparationTask(_0xdb0ab6, _0x2ff004 = {}, _0x330791 = {}) {
  await ensureConfig();
  const _0x5255bf = getRunningHubWorkflowProfileId(_0x2ff004);
  const _0x5641b6 = getProviderConfig(_0x5255bf || "runninghubwf");
  const _0x1d1490 = String(_0x5255bf || _0x5641b6?.providerProfileId || "").trim();
  const _0x21006e = resolveRunningHubModelApiBaseUrl(_0x1d1490);
  const _0x29729b = String(_0x2ff004?.apiKey || _0x5641b6?.apiKey || "").trim();
  if (!_0x29729b) {
    throw new Error("RunningHub API Key 未配置");
  }
  const _0x2b5a4d = String(_0xdb0ab6 || "").trim();
  if (!_0x2b5a4d) {
    throw new Error("缺少 RunningHub 音频任务ID");
  }
  return runTaskSingleFlight({
    provider: _0x1d1490 || "runninghubwf",
    kind: "audio-separation",
    taskId: _0x2b5a4d
  }, async () => {
    const _0x5e3c98 = await pollRunningHubAudioTask(_0x2b5a4d, _0x29729b, {
      ..._0x330791,
      apiUrl: _0x21006e,
      isRunningHubWorkflow: true
    });
    return {
      taskId: _0x2b5a4d,
      ...normalizeAudioSeparationTaskResult(extractAudioResultEntries(_0x5e3c98), "任务已完成，但未提取到人声和背景声音频地址")
    };
  });
}
export async function resumeRunningHubAudioTask(_0x2074f0, _0x596c7a = {}, _0x3fa665 = {}) {
  await ensureConfig();
  const _0x3673c2 = String(_0x596c7a?.provider || "runninghubwf").trim();
  const _0x3f9a0f = _0x3673c2 === "runninghub";
  const _0x44ba42 = getRunningHubWorkflowProfileId(_0x596c7a);
  const _0x2f3cf8 = _0x44ba42 || (_0x3f9a0f ? "runninghub" : "");
  const _0x28ebd8 = getProviderConfig(_0x3f9a0f ? _0x2f3cf8 : _0x2f3cf8 || "runninghubwf");
  const _0xf9de52 = String(_0x2f3cf8 || _0x28ebd8?.providerProfileId || "").trim();
  const _0xc819a4 = String(_0x3f9a0f ? _0x28ebd8?.modelApiKey || _0x596c7a?.apiKey || _0x28ebd8?.apiKey || "" : _0x596c7a?.apiKey || _0x28ebd8?.apiKey || "").trim();
  if (!_0xc819a4) {
    throw new Error("RunningHub API Key 未配置");
  }
  const _0x5aaea0 = String(_0x2074f0 || "").trim();
  if (!_0x5aaea0) {
    throw new Error("缺少 RunningHub 音频任务ID");
  }
  return runTaskSingleFlight({
    provider: _0xf9de52 || _0x3673c2,
    kind: "audio",
    taskId: _0x5aaea0
  }, async () => {
    const _0x2e672a = await pollRunningHubAudioTask(_0x5aaea0, _0xc819a4, {
      ..._0x3fa665,
      apiUrl: resolveRunningHubModelApiBaseUrl(_0xf9de52),
      isRunningHubWorkflow: !_0x3f9a0f
    });
    return {
      taskId: _0x5aaea0,
      ...normalizeAudioTaskResult(extractAudioResultEntries(_0x2e672a), "任务已完成，但未提取到音频地址")
    };
  });
}
export async function runAudioSeparation(_0x1b80ab = {}, _0x43699f = {}) {
  const _0x151ddb = await buildAudioSeparationRequest(_0x1b80ab);
  const _0x3a308 = await requester({
    url: _0x151ddb.url,
    method: "POST",
    provider: "runninghubwf",
    timeout: 120000,
    signal: _0x43699f?.signal,
    headers: _0x151ddb.headers || {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(_0x151ddb.body),
    responseType: "auto"
  });
  const _0xcbeaa2 = parseResponseData(_0x3a308);
  const _0x7b9f82 = Number(_0xcbeaa2?.code);
  if (Number.isFinite(_0x7b9f82) && _0x7b9f82 !== 0) {
    throw new Error(getApiErrorMessage(_0xcbeaa2, "音频任务创建失败"));
  }
  const _0xddb92d = getTaskId(_0xcbeaa2);
  if (!_0xddb92d) {
    return normalizeAudioSeparationTaskResult(extractAudioResultEntries(_0xcbeaa2), "音频任务创建成功但未返回人声和背景声音频地址");
  }
  _0x43699f?.onTaskMeta?.({
    taskId: String(_0xddb92d),
    useOpenapiQuery: true,
    apiKey: String(_0x151ddb?.body?.apiKey || "").trim(),
    providerProfileId: String(_0x151ddb?.meta?.providerProfileId || "").trim(),
    apiUrl: String(_0x151ddb?.meta?.apiUrl || "").trim()
  });
  _0x43699f?.onTaskId?.(String(_0xddb92d));
  const _0xc6dcba = await pollRunningHubAudioTask(_0xddb92d, _0x151ddb.body.apiKey, {
    ..._0x43699f,
    apiUrl: _0x151ddb?.meta?.apiUrl,
    isRunningHubWorkflow: true
  });
  return {
    taskId: _0xddb92d,
    ...normalizeAudioSeparationTaskResult(extractAudioResultEntries(_0xc6dcba), "任务已完成，但未提取到人声和背景声音频地址")
  };
}
async function pollComfyUiAudioTask(_0x4574df, _0x26f792, _0x12cc28 = {}) {
  const _0x3bef21 = String(_0x4574df || "").trim();
  const _0x270e8e = String(_0x26f792?.body?.baseUrl || "").trim();
  for (let _0x423a4e = 0; _0x423a4e < POLL_MAX_COUNT; _0x423a4e += 1) {
    if (_0x12cc28?.signal?.aborted) {
      throw new Error("CANCELLED");
    }
    await sleep(POLL_INTERVAL_MS, _0x12cc28?.signal);
    if (_0x12cc28?.signal?.aborted) {
      throw new Error("CANCELLED");
    }
    const _0x3d4b41 = new URLSearchParams({
      promptId: _0x3bef21,
      ...(_0x270e8e ? {
        baseUrl: _0x270e8e
      } : {}),
      ...(_0x26f792?.body?.allowCloudBaseUrl ? {
        allowCloudBaseUrl: "1"
      } : {})
    });
    const _0x221150 = await requester({
      url: "/api/v2/comfyui/history?" + _0x3d4b41.toString(),
      method: "GET",
      provider: "comfyui",
      timeout: 30000,
      signal: _0x12cc28?.signal
    });
    const _0x2dacc6 = typeof _0x26f792?.resultExtractor === "function" ? _0x26f792.resultExtractor(_0x221150) : _0x221150;
    if (extractAudioResultEntries(_0x2dacc6).length > 0) {
      return _0x2dacc6;
    }
    const _0x3363b6 = String(_0x2dacc6?.status || "").trim().toUpperCase();
    if (["FAILED", "FAIL", "ERROR", "CANCELLED", "CANCELED"].includes(_0x3363b6)) {
      const _0x38a500 = parseError("comfyui", _0x2dacc6, 200);
      if (_0x38a500) {
        throw _0x38a500;
      }
      throw new Error(String(_0x2dacc6?.error || _0x2dacc6?.message || "ComfyUI 音频任务执行失败"));
    }
  }
  throw new Error("ComfyUI 音频任务超时");
}
async function generateComfyUiAudio(_0x27577b, _0x16da09 = {}) {
  const _0x5eefc9 = await requester({
    url: _0x27577b.url,
    method: "POST",
    provider: "comfyui",
    timeout: 120000,
    signal: _0x16da09?.signal,
    headers: _0x27577b.headers || {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(_0x27577b.body),
    responseType: "auto"
  });
  const _0x2d28a5 = parseResponseData(_0x5eefc9);
  const _0x15dee6 = typeof _0x5eefc9 === "string" ? _0x5eefc9 : JSON.stringify(_0x2d28a5 || {});
  const _0x2d3dda = getTaskId(_0x2d28a5, _0x15dee6);
  if (!_0x2d3dda) {
    const _0x396109 = parseError("comfyui", _0x2d28a5, 200);
    if (_0x396109) {
      throw _0x396109;
    }
    return normalizeAudioTaskResult(extractAudioResultEntries(_0x2d28a5), "ComfyUI 音频任务创建成功但未返回 prompt_id");
  }
  _0x16da09?.onTaskMeta?.({
    taskId: String(_0x2d3dda),
    provider: "comfyui",
    kind: "audio"
  });
  _0x16da09?.onTaskId?.(String(_0x2d3dda));
  const _0x168e39 = await pollComfyUiAudioTask(_0x2d3dda, _0x27577b, _0x16da09);
  return {
    taskId: _0x2d3dda,
    ...normalizeAudioTaskResult(extractAudioResultEntries(_0x168e39), "任务已完成，但未提取到音频地址")
  };
}
export async function generateAudio(_0x2b1358, _0x54cd3e = {}) {
  const _0x196263 = await buildGenerateAudioRequest(_0x2b1358);
  if (_0x196263.meta?.isVolcengineSpeech) {
    return generateVolcengineSpeech(_0x196263, _0x54cd3e);
  }
  if (_0x196263.meta?.isComfyUiAudio) {
    return generateComfyUiAudio(_0x196263, _0x54cd3e);
  }
  const _0x3d7914 = _0x196263.meta?.provider || "runninghubwf";
  if (_0x196263.meta?.isManifestAudioModelApi && _0x3d7914 !== "runninghub") {
    const _0x1c785c = await requester({
      url: _0x196263.url,
      method: "POST",
      provider: _0x3d7914,
      timeout: AUDIO_MODEL_API_REQUEST_TIMEOUT_MS,
      signal: _0x54cd3e?.signal,
      headers: _0x196263.headers || {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(_0x196263.body),
      responseType: "auto"
    });
    const _0x507722 = parseResponseData(_0x1c785c);
    return normalizeAudioTaskResult(extractMappedAudioResultEntries(_0x507722, _0x196263.responseMapping), "音频生成成功但未提取到音频地址");
  }
  const _0x136613 = async (_0x496a1f = null) => {
    const _0x19eff5 = _0x496a1f ? {
      ..._0x54cd3e,
      runningHubWorkflowQueueLease: _0x496a1f
    } : _0x54cd3e;
    const {
      createRaw: _0x2ace7d,
      createData: _0x318500
    } = await requestRunningHubAudioCreateTask(_0x196263, _0x3d7914, _0x19eff5);
    const _0x557697 = typeof _0x2ace7d === "string" ? _0x2ace7d : JSON.stringify(_0x318500 || {});
    const _0x27efda = getTaskId(_0x318500, _0x557697);
    if (!_0x27efda) {
      console.warn("[aiAudioApi] Task submission returned no taskId. Response keys:", Object.keys(_0x318500 || {}), "data:", JSON.stringify(_0x318500 || {}).slice(0, 500));
      return normalizeAudioTaskResult(extractAudioResultEntries(_0x318500), "音频任务创建成功但未返回 taskId");
    }
    _0x19eff5?.onTaskMeta?.({
      taskId: String(_0x27efda),
      useOpenapiQuery: true,
      apiKey: String(_0x196263?.body?.apiKey || "").trim(),
      providerProfileId: String(_0x196263?.meta?.providerProfileId || "").trim(),
      rhProviderProfileId: String(_0x196263?.meta?.rhProviderProfileId || _0x196263?.meta?.providerProfileId || "").trim()
    });
    _0x19eff5?.onTaskId?.(String(_0x27efda));
    const _0x59a8bb = await pollRunningHubAudioTask(_0x27efda, _0x196263.body.apiKey, {
      ..._0x19eff5,
      apiUrl: _0x19eff5?.apiUrl || _0x196263.meta?.apiUrl,
      isRunningHubWorkflow: _0x3d7914 === "runninghubwf"
    });
    return {
      taskId: _0x27efda,
      ...normalizeAudioTaskResult(extractAudioResultEntries(_0x59a8bb), "任务已完成，但未提取到音频地址")
    };
  };
  if (isRunningHubWorkflowQueueTarget({
    providerId: _0x3d7914,
    adapterType: _0x196263.meta?.adapterType || _0x2b1358?.adapterType,
    payload: {
      ..._0x2b1358,
      apiKey: _0x196263?.body?.apiKey,
      provider: _0x3d7914,
      providerProfileId: _0x196263?.meta?.providerProfileId || _0x2b1358?.providerProfileId,
      rhProviderProfileId: _0x196263?.meta?.rhProviderProfileId || _0x2b1358?.rhProviderProfileId
    }
  })) {
    const _0x3a628f = resolveRunningHubWorkflowQueueConfig({
      payload: {
        ..._0x2b1358,
        apiKey: _0x196263?.body?.apiKey,
        providerProfileId: _0x196263?.meta?.providerProfileId || _0x2b1358?.providerProfileId,
        rhProviderProfileId: _0x196263?.meta?.rhProviderProfileId || _0x2b1358?.rhProviderProfileId
      },
      concurrency: _0x54cd3e?.runningHubWorkflowConcurrency
    });
    return runWithRunningHubWorkflowQueue({
      ..._0x3a628f,
      signal: _0x54cd3e?.signal,
      lease: _0x54cd3e?.runningHubWorkflowQueueLease,
      onQueueChange: _0x54cd3e?.onRunningHubWorkflowQueueChange,
      autoProbeConcurrency: _0x54cd3e?.autoProbeConcurrency,
      concurrencyProbe: _0x54cd3e?.runningHubWorkflowConcurrencyProbe
    }, _0x136613);
  }
  return _0x136613(_0x54cd3e?.runningHubWorkflowQueueLease || null);
}
function extractFromJsonObject(_0x50d376) {
  const _0x24af75 = {
    dataChunk: "",
    errorCode: 0,
    errorMsg: ""
  };
  if (!_0x50d376 || typeof _0x50d376 !== "object") {
    return _0x24af75;
  }
  if (typeof _0x50d376.data === "string" && _0x50d376.data.trim()) {
    _0x24af75.dataChunk = _0x50d376.data.trim();
    return _0x24af75;
  }
  const _0x4e1017 = Number(_0x50d376?.code);
  const _0x310316 = String(_0x50d376?.message || "").trim();
  if (Number.isFinite(_0x4e1017) && _0x4e1017 !== 0 && _0x4e1017 !== 20000000) {
    _0x24af75.errorCode = _0x4e1017;
    _0x24af75.errorMsg = _0x310316 || "未知错误";
  }
  return _0x24af75;
}
function base64ToBytes(_0x518732) {
  const _0xc5d455 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  const _0x30bc74 = String(_0x518732 || "").replace(/[^A-Za-z0-9+/=]/g, "");
  if (!_0x30bc74) {
    return new Uint8Array(0);
  }
  const _0x32da0f = [];
  let _0x3d28fd = 0;
  while (_0x3d28fd < _0x30bc74.length) {
    const _0x43f403 = _0x30bc74[_0x3d28fd++];
    const _0x46ea4b = _0x43f403 === "=" ? 64 : _0xc5d455.indexOf(_0x43f403);
    const _0x596d64 = _0x30bc74[_0x3d28fd++];
    const _0xb4dab5 = _0x596d64 === "=" ? 64 : _0xc5d455.indexOf(_0x596d64);
    const _0x4677ae = _0x30bc74[_0x3d28fd++];
    const _0x4a9065 = _0x4677ae === "=" ? 64 : _0xc5d455.indexOf(_0x4677ae);
    const _0x2da580 = _0x30bc74[_0x3d28fd++];
    const _0x1efbdc = _0x2da580 === "=" ? 64 : _0xc5d455.indexOf(_0x2da580);
    _0x32da0f.push(_0x46ea4b << 2 | _0xb4dab5 >> 4);
    if (_0x4a9065 !== 64) {
      _0x32da0f.push((_0xb4dab5 & 15) << 4 | _0x4a9065 >> 2);
    }
    if (_0x1efbdc !== 64) {
      _0x32da0f.push((_0x4a9065 & 3) << 6 | _0x1efbdc);
    }
  }
  return new Uint8Array(_0x32da0f);
}
function parseVolcengineTtsResponseText(_0x191320) {
  const _0x530097 = String(_0x191320 || "").trim();
  if (!_0x530097) {
    throw new Error("火山语音返回空响应");
  }
  console.log("[VolcengineTTS] 原始响应前300字符:", _0x530097.slice(0, 300));
  const _0x1f615c = [];
  let _0x1b0cea = "";
  let _0x11d58d = 0;
  try {
    let _0x1f3dc2 = JSON.parse(_0x530097);
    const {
      dataChunk: _0x525451,
      errorCode: _0x4d8c7e,
      errorMsg: _0x5c96c3
    } = extractFromJsonObject(_0x1f3dc2);
    let _0x53ef44 = _0x525451;
    let _0x13288b = _0x4d8c7e;
    let _0x31e249 = _0x5c96c3;
    if (_0x53ef44 && _0x53ef44.startsWith("{")) {
      try {
        const _0x301bb9 = JSON.parse(_0x53ef44);
        const _0x5eec41 = extractFromJsonObject(_0x301bb9);
        if (_0x5eec41.dataChunk) {
          _0x53ef44 = _0x5eec41.dataChunk;
          if (_0x5eec41.errorCode && !_0x13288b) {
            _0x13288b = _0x5eec41.errorCode;
            _0x31e249 = _0x5eec41.errorMsg;
          }
        }
      } catch {}
    }
    if (_0x53ef44) {
      _0x1f615c.push(_0x53ef44);
    }
    if (_0x13288b) {
      _0x11d58d = _0x13288b;
      _0x1b0cea = _0x31e249;
    }
    if (_0x1f615c.length > 0 || _0x11d58d !== 0) {
      return {
        chunks: _0x1f615c,
        errorCode: _0x1f615c.length > 0 ? 0 : _0x11d58d,
        errorMsg: _0x1b0cea
      };
    }
  } catch {}
  const _0x50fef5 = _0x530097.split(/\r?\n/);
  for (const _0x56ba62 of _0x50fef5) {
    const _0x47033e = _0x56ba62.trim();
    if (!_0x47033e) {
      continue;
    }
    let _0x24aea0 = _0x47033e;
    if (_0x24aea0.startsWith("data:")) {
      _0x24aea0 = _0x24aea0.slice(5).trim();
    }
    if (!_0x24aea0 || _0x24aea0 === "[DONE]") {
      continue;
    }
    try {
      const _0x3049db = JSON.parse(_0x24aea0);
      const {
        dataChunk: _0x3a4d58,
        errorCode: _0x1d1d27,
        errorMsg: _0x35a5ab
      } = extractFromJsonObject(_0x3049db);
      if (_0x3a4d58) {
        _0x1f615c.push(_0x3a4d58);
      }
      if (_0x1d1d27 && !_0x11d58d) {
        _0x11d58d = _0x1d1d27;
        _0x1b0cea = _0x35a5ab;
      }
    } catch {
      console.warn("[VolcengineTTS] 跳过无法解析的响应行:", _0x24aea0.slice(0, 100));
    }
  }
  if (_0x1f615c.length === 0 && !_0x11d58d) {
    const _0x2b4cc6 = [];
    let _0x61f26c = 0;
    let _0x4badbc = -1;
    let _0x312309 = false;
    let _0x544250 = false;
    for (let _0x280951 = 0; _0x280951 < _0x530097.length; _0x280951++) {
      const _0x509d57 = _0x530097[_0x280951];
      if (_0x544250) {
        _0x544250 = false;
        continue;
      }
      if (_0x509d57 === "\\") {
        _0x544250 = true;
        continue;
      }
      if (_0x509d57 === "\"") {
        _0x312309 = !_0x312309;
        continue;
      }
      if (_0x312309) {
        continue;
      }
      if (_0x509d57 === "{") {
        if (_0x61f26c === 0) {
          _0x4badbc = _0x280951;
        }
        _0x61f26c++;
      } else if (_0x509d57 === "}") {
        _0x61f26c--;
        if (_0x61f26c === 0 && _0x4badbc !== -1) {
          _0x2b4cc6.push(_0x530097.slice(_0x4badbc, _0x280951 + 1));
          _0x4badbc = -1;
        }
      }
    }
    for (const _0x3f3ee3 of _0x2b4cc6) {
      try {
        const _0x3c97ca = JSON.parse(_0x3f3ee3);
        const {
          dataChunk: _0x547b42,
          errorCode: _0x38cdec,
          errorMsg: _0xa7c43e
        } = extractFromJsonObject(_0x3c97ca);
        if (_0x547b42) {
          _0x1f615c.push(_0x547b42);
        }
        if (_0x38cdec && !_0x11d58d) {
          _0x11d58d = _0x38cdec;
          _0x1b0cea = _0xa7c43e;
        }
      } catch {}
    }
  }
  return {
    chunks: _0x1f615c,
    errorCode: _0x1f615c.length > 0 ? 0 : _0x11d58d,
    errorMsg: _0x1b0cea
  };
}
async function generateVolcengineSpeech(_0x273e23, _0x434bba = {}) {
  const _0x4f4519 = _0x273e23.meta || {};
  const _0x223749 = String(_0x4f4519.audioFormat || "mp3").trim();
  const _0x5328b9 = await requester({
    url: _0x273e23.url,
    method: "POST",
    provider: "volcengine-speech",
    timeout: 90000,
    signal: _0x434bba?.signal,
    headers: _0x273e23.headers || {
      "Content-Type": "application/json"
    },
    body: _0x273e23.body,
    responseType: "text"
  });
  const {
    chunks: _0x5a8e55,
    errorCode: _0x2aa76a,
    errorMsg: _0x561788
  } = parseVolcengineTtsResponseText(_0x5328b9);
  if (_0x2aa76a !== 0) {
    throw new Error("火山语音TTS错误(code=" + _0x2aa76a + "): " + (_0x561788 || "未知错误"));
  }
  if (_0x5a8e55.length === 0) {
    console.error("[VolcengineTTS] 未从响应中提取到音频数据，原始响应:", String(_0x5328b9 || "").slice(0, 500));
    throw new Error("火山语音未返回音频数据，请检查API Key和参数是否正确");
  }
  let _0x3b464f = _0x5a8e55.join("");
  console.log("[VolcengineTTS] 解析到", _0x5a8e55.length, "个音频chunk，拼接后base64长度:", _0x3b464f.length);
  if (!_0x3b464f) {
    throw new Error("火山语音未返回音频数据");
  }
  const _0x7ac5c3 = _0x223749 === "ogg_opus" ? "ogg" : _0x223749;
  const _0x5a3f6d = _0x3b464f.replace(/[^A-Za-z0-9+/=]/g, "");
  if (!_0x5a3f6d) {
    throw new Error("火山语音未返回有效的音频数据");
  }
  let _0x1a9bc5;
  try {
    const _0x1a9cf7 = atob(_0x5a3f6d);
    _0x1a9bc5 = new Uint8Array(_0x1a9cf7.length);
    for (let _0x59815f = 0; _0x59815f < _0x1a9cf7.length; _0x59815f++) {
      _0x1a9bc5[_0x59815f] = _0x1a9cf7.charCodeAt(_0x59815f);
    }
  } catch (_0x20c647) {
    console.warn("[VolcengineTTS] atob 解码失败，使用手动 base64 解码器");
    _0x1a9bc5 = base64ToBytes(_0x5a3f6d);
  }
  console.log("[VolcengineTTS] base64解码为二进制成功，字节数:", _0x1a9bc5.length);
  const _0x124066 = typeof location !== "undefined" && location.protocol === "file:" ? "http://127.0.0.1:8777" : "";
  const _0x4e9045 = _0x124066 + "/api/v2/save_output?ext=" + encodeURIComponent(_0x7ac5c3) + "&kind=audio";
  const _0x47f8f2 = await fetch(_0x4e9045, {
    method: "POST",
    headers: {
      "Content-Type": "application/octet-stream"
    },
    body: new Blob([_0x1a9bc5], {
      type: "audio/" + _0x7ac5c3
    })
  });
  if (!_0x47f8f2.ok) {
    throw new Error("保存失败: HTTP " + _0x47f8f2.status);
  }
  const _0x22e17d = await _0x47f8f2.json();
  const _0x2572c9 = String(_0x22e17d?.localPath || _0x22e17d?.path || _0x22e17d?.originalLocalPath || "").trim();
  if (_0x2572c9) {
    const _0x10d8cd = "/" + _0x2572c9.replace(/^\/+/, "");
    console.log("[VolcengineTTS] 保存成功:", _0x2572c9);
    return {
      taskId: "",
      audioUrl: _0x10d8cd,
      localPath: _0x2572c9,
      isBatch: false,
      audios: [{
        audioUrl: _0x10d8cd,
        localPath: _0x2572c9
      }]
    };
  }
  throw new Error("服务端保存失败：未返回本地路径");
}
