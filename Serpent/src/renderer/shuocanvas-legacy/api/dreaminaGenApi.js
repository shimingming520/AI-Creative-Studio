import { requester } from "./requester.js";
import { runTaskSingleFlight } from "./taskSingleFlight.js";
import { ensureDreaminaVideoModelForTask, getDreaminaVideoModelVersion, normalizeDreaminaVideoDuration, normalizeDreaminaVideoAspectRatio, normalizeDreaminaVideoModel, normalizeDreaminaVideoResolution, normalizeDreaminaVideoRouteMode, resolveDreaminaVideoTaskType, validateDreaminaVideoRouteSelection } from "../src/modules/dreaminaVideoModelHelper.js";
import { localPathToUrl, normalizeLocalPath } from "../src/utils/localMediaPath.js";
const DREAMINA_SUBMIT_TIMEOUT = 45000;
const DREAMINA_QUERY_TIMEOUT = 60000;
const DREAMINA_POLL_INTERVAL = 2000;
const DREAMINA_MAX_WAIT = 600000;
const DREAMINA_QUERY_RETRIES = 2;
const DREAMINA_QUERY_RETRY_DELAY = 350;
const DREAMINA_MAX_TRANSIENT_ERRORS = 12;
export const DREAMINA_POLL_TIMEOUT_CODE = "DREAMINA_POLL_TIMEOUT";
const DREAMINA_QUEUE_HINTS = ["queue", "queued", "waiting", "wait", "pending"];
const DREAMINA_TRANSIENT_ERROR_HINTS = ["timeout", "time out", "timed out", "超时", "网络", "network", "connect", "connection", "socket", "econn", "enotfound", "eai_again", "temporary", "temporarily", "暂时", "稍后", "busy", "service unavailable", "rate limit", "too many requests", "429", "500", "502", "503", "504"];
function toStatus(_0xb6408d) {
  const _0x1f8b52 = String(_0xb6408d || "").trim().toLowerCase();
  if (["success", "succeeded", "done", "finish", "finished"].includes(_0x1f8b52)) {
    return "success";
  }
  if (["fail", "failed", "error"].includes(_0x1f8b52)) {
    return "failed";
  }
  if (["cancelled", "canceled"].includes(_0x1f8b52)) {
    return "cancelled";
  }
  return "pending";
}
function collectPayloadObjects(..._0x3f8d79) {
  const _0x2ac282 = [];
  const _0x38604d = new Set();
  const _0x4c409e = (_0x588f1a, _0x48a9af = 0) => {
    if (!_0x588f1a || _0x48a9af > 5) {
      return;
    }
    if (Array.isArray(_0x588f1a)) {
      _0x588f1a.forEach(_0x1697f8 => _0x4c409e(_0x1697f8, _0x48a9af + 1));
      return;
    }
    if (typeof _0x588f1a !== "object") {
      return;
    }
    if (_0x38604d.has(_0x588f1a)) {
      return;
    }
    _0x38604d.add(_0x588f1a);
    _0x2ac282.push(_0x588f1a);
    ["data", "result", "queryResult", "listTask", "task", "tasks"].forEach(_0x41aaeb => _0x4c409e(_0x588f1a[_0x41aaeb], _0x48a9af + 1));
  };
  _0x3f8d79.forEach(_0x234072 => _0x4c409e(_0x234072, 0));
  return _0x2ac282;
}
function firstPayloadString(_0x1db608, _0x154733) {
  for (const _0x3aa04a of _0x1db608) {
    for (const _0x4529c9 of _0x154733) {
      const _0x50a102 = String(_0x3aa04a?.[_0x4529c9] || "").trim();
      if (_0x50a102) {
        return _0x50a102;
      }
    }
  }
  return "";
}
function extractDreaminaRawStatus(_0x3c27e0, _0x47f001) {
  const _0x21533c = collectPayloadObjects(_0x3c27e0, _0x47f001).map(_0x322b5d => firstPayloadString([_0x322b5d], ["status", "gen_status", "genStatus"]).toLowerCase()).filter(Boolean);
  if (_0x21533c.some(_0x26b2a1 => ["fail", "failed", "error"].includes(_0x26b2a1))) {
    return "failed";
  }
  if (_0x21533c.some(_0x7723df => ["success", "succeeded", "done", "finish", "finished"].includes(_0x7723df))) {
    return "success";
  }
  return "";
}
function extractDreaminaRawFailReason(_0xe0d8e7, _0x1e774a) {
  return firstPayloadString(collectPayloadObjects(_0xe0d8e7, _0x1e774a), ["failReason", "fail_reason", "failureReason", "failure_reason"]);
}
function extractDreaminaRawErrorMessage(_0x71e497, _0x5cee3f) {
  return firstPayloadString(collectPayloadObjects(_0x71e497, _0x5cee3f), ["error", "errorMessage", "message", "msg"]);
}
function isDreaminaTerminalFailureMessage(_0x18826c) {
  const _0x20d581 = String(_0x18826c || "").trim().toLowerCase();
  if (!_0x20d581) {
    return false;
  }
  return ["失败", "审核未通过", "内容安全", "安全审核", "违规", "敏感", "不符合", "拦截", "风控", "failed", "failure", "error", "review failed", "content safety", "content filter", "violation", "sensitive", "flagged", "blocked", "not allowed"].some(_0x10d2a2 => _0x20d581.includes(_0x10d2a2));
}
function normalizeResolutionType(_0x460434) {
  const _0x24a43c = String(_0x460434 || "").trim();
  if (!_0x24a43c) {
    return "";
  }
  return _0x24a43c.toLowerCase();
}
function normalizeDreaminaGenerateNum(_0x36738b = {}) {
  const _0x3ba45f = _0x36738b?.generateNum ?? _0x36738b?.generate_num ?? _0x36738b?.batchSize ?? 1;
  const _0x1f2665 = Number.parseInt(_0x3ba45f, 10);
  if (!Number.isFinite(_0x1f2665)) {
    return 1;
  }
  return Math.max(1, Math.min(10, _0x1f2665));
}
function toTrimmedArray(_0x26f8a9) {
  if (!Array.isArray(_0x26f8a9)) {
    return [];
  }
  const _0x44bbb0 = [];
  _0x26f8a9.forEach(_0x16df98 => {
    const _0x1b7b32 = String(_0x16df98 || "").trim();
    if (_0x1b7b32) {
      _0x44bbb0.push(_0x1b7b32);
    }
  });
  return _0x44bbb0;
}
function basenameFromPath(_0x353071) {
  const _0x19a99f = String(_0x353071 || "").trim().replace(/\\/g, "/");
  if (!_0x19a99f) {
    return "";
  }
  return _0x19a99f.split("/").filter(Boolean).pop() || "";
}
export function normalizeDreaminaErrorMessage(_0x3b3284) {
  const _0x4fd309 = String(_0x3b3284 || "").trim();
  if (!_0x4fd309) {
    return "";
  }
  const _0xeefc8d = _0x4fd309.toLowerCase();
  if (_0xeefc8d.includes("do request:") && (_0xeefc8d.includes("context deadline exceeded") || _0xeefc8d.includes("client.timeout") || _0xeefc8d.includes("awaiting headers"))) {
    return "即梦官方生成接口响应超时，本次没有拿到任务ID。网页可用不代表 CLI 生成接口稳定，请稍后重试；如果连续出现，请切换网络/代理或重新登录即梦后再试。";
  }
  let _0x14d7f5 = _0x4fd309.match(/upload resource\s+"([^"]+)"\s*:\s*upload (video|audio)\s*:\s*duration\s+([0-9.]+)\s+seconds\s+is\s+out\s+of\s+allowed\s+range\s+\[\s*([0-9.]+)\s*,\s*([0-9.]+)\s*\]/i);
  if (!_0x14d7f5) {
    _0x14d7f5 = _0x4fd309.match(/upload (video|audio)\s*:\s*duration\s+([0-9.]+)\s+seconds\s+is\s+out\s+of\s+allowed\s+range\s+\[\s*([0-9.]+)\s*,\s*([0-9.]+)\s*\]/i);
    _0x14d7f5 &&= ["", "", ..._0x14d7f5.slice(1)];
  }
  if (_0x14d7f5) {
    const [, _0x396597, _0x2918aa, _0xadbb00, _0x283278, _0xbcd4a4] = _0x14d7f5;
    const _0x2f08a9 = String(_0x2918aa || "").toLowerCase() === "audio";
    const _0x77c7d3 = basenameFromPath(_0x396597);
    const _0x5df308 = _0x2f08a9 ? "源音频" : "源视频";
    const _0x58b2cc = _0x77c7d3 ? "“" + _0x77c7d3 + "”" : _0x5df308;
    const _0x511616 = _0x2f08a9 ? "请将音频裁剪到 " + _0xbcd4a4 + " 秒以内后再上传。" : "请将视频裁剪到 " + _0xbcd4a4 + " 秒以内，建议裁到 14.9 秒后再上传。";
    return "上传" + _0x5df308 + "失败：" + _0x58b2cc + "时长 " + _0xadbb00 + " 秒，超出即梦允许范围（" + _0x283278 + "-" + _0xbcd4a4 + " 秒）。" + _0x511616;
  }
  return _0x4fd309;
}
function normalizeDreaminaThrownError(_0x3c5256) {
  if (_0x3c5256 && typeof _0x3c5256 === "object") {
    const _0x3a200a = normalizeDreaminaErrorMessage(_0x3c5256.message);
    if (_0x3a200a) {
      _0x3c5256.message = _0x3a200a;
    }
  }
  return _0x3c5256;
}
function normalizeModelVersion(_0x5b58b3) {
  const _0x2d10b1 = String(_0x5b58b3?.modelVersion || "").trim();
  if (_0x2d10b1) {
    return _0x2d10b1;
  }
  const _0x416509 = String(_0x5b58b3?.model || "").trim();
  if (!_0x416509.startsWith("dreamina/")) {
    return "";
  }
  const _0x1818ca = _0x416509.slice("dreamina/".length).trim();
  if (_0x1818ca === "text2image" || _0x1818ca === "image2image" || _0x1818ca === "text2video" || _0x1818ca === "image2video") {
    return "";
  }
  return _0x1818ca;
}
function normalizeDreaminaRatio(_0x6d1207, _0x4ab375) {
  const _0x31cf22 = String(_0x6d1207?.aspectRatio || "").trim();
  if (!_0x31cf22) {
    return "";
  }
  if (_0x31cf22 === "自适应" || _0x31cf22 === "auto") {
    if (_0x4ab375) {
      return "";
    } else {
      return "1:1";
    }
  }
  return _0x31cf22;
}
function toLocalPath(_0x3b46a0) {
  return normalizeLocalPath(_0x3b46a0);
}
function toLocalUrl(_0x3e61c5) {
  return localPathToUrl(_0x3e61c5);
}
function normalizeOutputsArray(_0x5eec67) {
  const _0x1700b2 = [];
  const _0xe4dfc0 = new Set();
  const _0x3a656f = new Set(["data", "result", "results", "output", "outputs", "raw", "queryResult", "image", "images", "image_list", "imageList", "image_infos", "imageInfos", "video", "videos", "video_list", "videoList", "video_infos", "videoInfos", "media", "medias", "media_list", "mediaList", "file", "files", "file_list", "fileList", "resource", "resources", "download", "downloads", "content", "contents"]);
  const _0xecad7f = ["url", "uri", "download_url", "downloadUrl", "file_url", "fileUrl", "media_url", "mediaUrl", "image_url", "imageUrl", "origin_image_url", "originImageUrl", "original_image_url", "originalImageUrl", "result_image_url", "resultImageUrl", "video_url", "videoUrl", "cover_url", "coverUrl", "src"];
  const _0x58e551 = ["local_path", "localPath", "path", "file_path", "filePath", "download_path", "downloadPath", "local_uri", "localUri"];
  const _0x4b3902 = (_0x5a16ea, _0x216c5a) => {
    for (const _0x4fc703 of _0x216c5a) {
      const _0x140d24 = String(_0x5a16ea?.[_0x4fc703] || "").trim();
      if (_0x140d24) {
        return _0x140d24;
      }
    }
    return "";
  };
  const _0x4aacb4 = _0x430728 => {
    if (!_0x430728 || typeof _0x430728 !== "object") {
      return;
    }
    const _0x45870e = _0x4b3902(_0x430728, _0xecad7f);
    const _0x163ddc = _0x4b3902(_0x430728, _0x58e551);
    const _0x1a4a26 = String(_0x430728?.mimeType || _0x430728?.mime_type || "").trim();
    if (!_0x45870e && !_0x163ddc) {
      return;
    }
    const _0x119659 = [_0x45870e, _0x163ddc, _0x1a4a26].join("|");
    if (_0xe4dfc0.has(_0x119659)) {
      return;
    }
    _0xe4dfc0.add(_0x119659);
    _0x1700b2.push(_0x430728);
  };
  const _0x4f207c = _0x3fb436 => {
    const _0x534091 = String(_0x3fb436 || "").trim();
    const _0x3294b0 = _0x534091.toLowerCase();
    if (_0x3294b0.includes("input") || _0x3294b0.includes("reference") || _0x3294b0.includes("prompt")) {
      return false;
    }
    return _0x3a656f.has(_0x534091) || _0x3294b0.includes("output") || _0x3294b0.includes("result") || _0x3294b0.includes("image") || _0x3294b0.includes("video") || _0x3294b0.includes("media") || _0x3294b0.includes("file") || _0x3294b0.includes("url") || _0x3294b0.includes("uri");
  };
  const _0x430d2c = (_0x2d1079, _0x1888d8 = 0) => {
    if (!_0x2d1079 || _0x1888d8 > 8) {
      return;
    }
    if (typeof _0x2d1079 === "string") {
      const _0x617ea7 = _0x2d1079.trim();
      if (/^https?:\/\//i.test(_0x617ea7)) {
        _0x4aacb4({
          url: _0x617ea7
        });
      }
      return;
    }
    if (Array.isArray(_0x2d1079)) {
      _0x2d1079.forEach(_0x4a7d7e => _0x430d2c(_0x4a7d7e, _0x1888d8 + 1));
      return;
    }
    if (typeof _0x2d1079 !== "object") {
      return;
    }
    _0x4aacb4({
      url: _0x4b3902(_0x2d1079, _0xecad7f),
      localPath: _0x4b3902(_0x2d1079, _0x58e551),
      mimeType: String(_0x2d1079?.mimeType || _0x2d1079?.mime_type || "").trim()
    });
    Object.entries(_0x2d1079).forEach(([_0x52e4d8, _0xccdaa6]) => {
      if (_0x4f207c(_0x52e4d8)) {
        _0x430d2c(_0xccdaa6, _0x1888d8 + 1);
      }
    });
  };
  _0x430d2c(_0x5eec67);
  return _0x1700b2.map(_0x210b68 => {
    const _0x4f5a07 = toLocalPath(_0x210b68?.localPath);
    return {
      url: String(_0x210b68?.url || "").trim(),
      localPath: _0x4f5a07,
      localUrl: toLocalUrl(_0x4f5a07),
      mimeType: String(_0x210b68?.mimeType || "").trim()
    };
  }).filter(_0x307c8e => _0x307c8e.url || _0x307c8e.localPath);
}
function hasDreaminaUsableOutputs(_0x22ed53) {
  return normalizeOutputsArray(_0x22ed53).length > 0;
}
function normalizeQueueMetric(_0x59741d) {
  const _0x55b3de = Number(_0x59741d);
  if (!Number.isFinite(_0x55b3de) || _0x55b3de < 0) {
    return null;
  }
  return Math.trunc(_0x55b3de);
}
function normalizeQueueStatus(_0xba9fda) {
  return String(_0xba9fda || "").trim().toLowerCase();
}
function isDreaminaQueuedState(_0x5a6fec, _0xfa59c6) {
  if (_0x5a6fec !== "pending") {
    return false;
  }
  if (!_0xfa59c6) {
    return false;
  }
  return DREAMINA_QUEUE_HINTS.some(_0x543857 => _0xfa59c6.includes(_0x543857));
}
function phaseToLabel(_0x243532, _0x3e5695 = "") {
  if (_0x243532 === "queued") {
    return "排队中";
  }
  if (_0x243532 === "generating") {
    return "生成中";
  }
  if (_0x243532 === "syncing") {
    return "正在同步结果";
  }
  if (_0x243532 === "done") {
    return "已完成";
  }
  if (_0x243532 === "failed") {
    return String(_0x3e5695 || "").trim() || "查询失败";
  }
  return "处理中";
}
function sleep(_0xda2c86) {
  return new Promise(_0x359cf6 => setTimeout(_0x359cf6, _0xda2c86));
}
function includesTransientHint(_0x2faa28) {
  const _0x1a800b = String(_0x2faa28 || "").trim().toLowerCase();
  if (!_0x1a800b) {
    return false;
  }
  return DREAMINA_TRANSIENT_ERROR_HINTS.some(_0xf04055 => _0x1a800b.includes(_0xf04055));
}
function isTransientDreaminaError(_0x14ad5d) {
  if (_0x14ad5d?.dreaminaReturnedError === true) {
    return false;
  }
  const _0x58d810 = String(_0x14ad5d?.code || "").trim().toUpperCase();
  const _0x508563 = String(_0x14ad5d?.type || "").trim().toUpperCase();
  const _0x7a236e = Number(_0x14ad5d?.status);
  if (_0x58d810 === "TIMEOUT" || _0x58d810 === "ETIMEDOUT" || _0x58d810 === "ECONNRESET" || _0x58d810 === "ECONNREFUSED" || _0x58d810 === "ENOTFOUND" || _0x58d810 === "EAI_AGAIN") {
    return true;
  }
  if (_0x508563 === "TIMEOUT" || _0x508563 === "NETWORK_ERROR" || _0x508563 === "DNS_ERROR" || _0x508563 === "RATE_LIMIT" || _0x508563 === "SERVER_ERROR" || _0x508563 === "SERVICE_UNAVAILABLE") {
    return true;
  }
  if (_0x7a236e === 429 || _0x7a236e >= 500) {
    return true;
  }
  return includesTransientHint(_0x14ad5d?.message || _0x14ad5d);
}
export function normalizeDreaminaTaskSnapshot(_0x2d320e, _0x444969 = {}) {
  const _0x2dd5b2 = String(_0x444969?.submitId || _0x2d320e?.submitId || _0x2d320e?.raw?.submitId || "").trim();
  const _0x91e806 = normalizeOutputsArray(_0x2d320e);
  const _0x81f2fa = toStatus(_0x2d320e?.status);
  const _0xf27ba3 = _0x2d320e?.raw && typeof _0x2d320e.raw === "object" && !Array.isArray(_0x2d320e.raw) ? _0x2d320e.raw : {};
  const _0x4aa8ac = extractDreaminaRawStatus(_0x2d320e, _0xf27ba3);
  const _0x29dc99 = normalizeQueueStatus(_0xf27ba3.queue_status || _0xf27ba3.queueStatus || _0x2d320e?.queueStatus);
  const _0x4510f0 = normalizeQueueMetric(_0xf27ba3.queue_idx ?? _0xf27ba3.queueIndex ?? _0x2d320e?.queueIndex);
  const _0xe2a0cf = normalizeQueueMetric(_0xf27ba3.queue_length ?? _0xf27ba3.queueLength ?? _0x2d320e?.queueLength);
  const _0x2a816b = extractDreaminaRawFailReason(_0x2d320e, _0xf27ba3);
  const _0x4ec733 = extractDreaminaRawErrorMessage(_0x2d320e, _0xf27ba3);
  const _0x326ea5 = _0x4aa8ac === "failed" || _0x81f2fa === "failed";
  const _0x5ed33f = _0x326ea5 || isDreaminaTerminalFailureMessage(_0x4ec733) ? _0x4ec733 : "";
  const _0x37613e = _0x2a816b || _0x5ed33f;
  const _0x3233df = _0x326ea5 || _0x37613e ? "failed" : _0x4aa8ac || _0x81f2fa;
  let _0x35b550 = "generating";
  if (_0x3233df === "failed") {
    _0x35b550 = "failed";
  } else if (_0x3233df === "cancelled") {
    _0x35b550 = "cancelled";
  } else if (_0x3233df === "success") {
    _0x35b550 = _0x91e806.length > 0 ? "done" : "syncing";
  } else if (isDreaminaQueuedState(_0x3233df, _0x29dc99)) {
    _0x35b550 = "queued";
  }
  const _0x2c1e8f = _0x3233df === "failed" ? "failed" : _0x3233df === "cancelled" ? "cancelled" : _0x3233df === "success" && _0x91e806.length > 0 ? "success" : "pending";
  return {
    submitId: _0x2dd5b2,
    status: _0x2c1e8f,
    phase: _0x35b550,
    label: phaseToLabel(_0x35b550, _0x37613e),
    queueStatus: _0x29dc99,
    queueIndex: _0x4510f0,
    queueLength: _0xe2a0cf,
    outputs: _0x91e806,
    failReason: _0x37613e,
    raw: _0xf27ba3,
    isTerminal: _0x35b550 === "done" || _0x35b550 === "failed" || _0x35b550 === "cancelled",
    hasOutputs: _0x91e806.length > 0,
    lastCheckedAt: Date.now()
  };
}
function postJson(_0x1ab721, _0x2a9aa0) {
  return requester({
    url: _0x1ab721,
    method: "POST",
    provider: "dreamina",
    timeout: DREAMINA_SUBMIT_TIMEOUT,
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(_0x2a9aa0 || {})
  });
}
export async function submitDreaminaText2Image(_0x145169) {
  return postJson("/api/v2/dreamina/text2image", _0x145169);
}
export async function submitDreaminaImage2Image(_0x1ab6e6) {
  return postJson("/api/v2/dreamina/image2image", _0x1ab6e6);
}
export async function submitDreaminaImageUpscale(_0x170380) {
  return postJson("/api/v2/dreamina/image_upscale", _0x170380);
}
export async function submitDreaminaText2Video(_0x19d0ef) {
  return postJson("/api/v2/dreamina/text2video", _0x19d0ef);
}
export async function submitDreaminaImage2Video(_0x238b85) {
  return postJson("/api/v2/dreamina/image2video", _0x238b85);
}
export async function submitDreaminaFrames2Video(_0x1f6711) {
  return postJson("/api/v2/dreamina/frames2video", _0x1f6711);
}
export async function submitDreaminaMultiframe2Video(_0x452d3e) {
  return postJson("/api/v2/dreamina/multiframe2video", _0x452d3e);
}
export async function submitDreaminaMultimodal2Video(_0x518641) {
  return postJson("/api/v2/dreamina/multimodal2video", _0x518641);
}
export async function cancelDreaminaVideoQueueTask(_0x5f1621) {
  const _0x5a8556 = String(_0x5f1621 || "").trim();
  if (!_0x5a8556) {
    throw new Error("submitId 不能为空");
  }
  const _0x38fd7d = await postJson("/api/v2/dreamina/video_queue/cancel", {
    submitId: _0x5a8556
  });
  if (_0x38fd7d?.success === false) {
    throw new Error(_0x38fd7d?.message || "取消即梦视频队列任务失败");
  }
  return _0x38fd7d || {};
}
export async function queryDreaminaResult(_0x35d857, _0x3aa7ff = {}) {
  const _0x3e93e2 = String(_0x35d857 || "").trim();
  if (!_0x3e93e2) {
    throw new Error("submitId 不能为空");
  }
  const _0x4c522c = _0x3aa7ff?.autoDownload !== false;
  const _0x467b46 = new URLSearchParams({
    submitId: _0x3e93e2,
    autoDownload: _0x4c522c ? "1" : "0"
  });
  const _0x14dba1 = await requester({
    url: "/api/v2/dreamina/query_result?" + _0x467b46.toString(),
    method: "GET",
    provider: "dreamina",
    signal: _0x3aa7ff?.signal,
    timeout: DREAMINA_QUERY_TIMEOUT,
    retries: Number.isFinite(Number(_0x3aa7ff?.retries)) ? Math.max(0, Math.trunc(Number(_0x3aa7ff.retries))) : DREAMINA_QUERY_RETRIES,
    retryDelay: Number.isFinite(Number(_0x3aa7ff?.retryDelay)) ? Math.max(0, Math.trunc(Number(_0x3aa7ff.retryDelay))) : DREAMINA_QUERY_RETRY_DELAY
  });
  if (_0x14dba1?.success === false) {
    const _0x1dfb73 = new Error(normalizeDreaminaErrorMessage(_0x14dba1?.message) || "即梦任务查询失败");
    _0x1dfb73.code = "DREAMINA_RETURNED_ERROR";
    _0x1dfb73.dreaminaReturnedError = true;
    throw _0x1dfb73;
  }
  return _0x14dba1 || {};
}
async function pollDreaminaUntilDoneOnce(_0x315765, _0x5d0ff7 = {}) {
  const _0x560f51 = Number(_0x5d0ff7?.maxWaitMs || DREAMINA_MAX_WAIT);
  const _0x123c72 = Number(_0x5d0ff7?.intervalMs || DREAMINA_POLL_INTERVAL);
  const _0x112498 = Number.isFinite(Number(_0x5d0ff7?.maxTransientErrors)) ? Math.max(0, Math.trunc(Number(_0x5d0ff7.maxTransientErrors))) : DREAMINA_MAX_TRANSIENT_ERRORS;
  const _0x452632 = Date.now();
  let _0x2ca508 = null;
  let _0x4d1279 = 0;
  while (Date.now() - _0x452632 < _0x560f51) {
    if (_0x5d0ff7?.signal?.aborted) {
      throw new Error("CANCELLED");
    }
    let _0x1cd7b8 = null;
    try {
      _0x2ca508 = await queryDreaminaResult(_0x315765, {
        autoDownload: true
      });
      _0x1cd7b8 = normalizeDreaminaTaskSnapshot(_0x2ca508, {
        submitId: _0x315765
      });
    } catch (_0x306a67) {
      if (_0x5d0ff7?.signal?.aborted || _0x306a67?.name === "AbortError" || _0x306a67?.message === "CANCELLED") {
        throw _0x306a67;
      }
      if (isTransientDreaminaError(_0x306a67)) {
        _0x4d1279 += 1;
        if (_0x4d1279 > _0x112498) {
          const _0x48479a = new Error("即梦任务查询连续异常（" + _0x4d1279 + " 次），请稍后重试");
          _0x48479a.code = "DREAMINA_QUERY_TRANSIENT_EXHAUSTED";
          _0x48479a.submitId = String(_0x315765 || "").trim();
          _0x48479a.cause = _0x306a67;
          throw _0x48479a;
        }
        await sleep(_0x123c72);
        continue;
      }
      throw _0x306a67;
    }
    _0x4d1279 = 0;
    if (typeof _0x5d0ff7?.onProgress === "function") {
      await _0x5d0ff7.onProgress(_0x1cd7b8);
    }
    const _0x67854e = toStatus(_0x1cd7b8?.status);
    if (_0x67854e === "cancelled") {
      throw new Error("CANCELLED");
    }
    if (_0x67854e === "failed") {
      return _0x2ca508;
    }
    if (_0x67854e === "success" && hasDreaminaUsableOutputs(_0x2ca508)) {
      return _0x2ca508;
    }
    await sleep(_0x123c72);
  }
  try {
    const _0x3967a7 = await queryDreaminaResult(_0x315765, {
      autoDownload: true
    });
    const _0x502830 = normalizeDreaminaTaskSnapshot(_0x3967a7, {
      submitId: _0x315765
    });
    if (typeof _0x5d0ff7?.onProgress === "function") {
      await _0x5d0ff7.onProgress(_0x502830);
    }
    const _0x434a82 = toStatus(_0x502830?.status);
    if (_0x434a82 === "cancelled") {
      throw new Error("CANCELLED");
    }
    if (_0x434a82 === "failed") {
      return _0x3967a7;
    }
    if (_0x434a82 === "success" && hasDreaminaUsableOutputs(_0x3967a7)) {
      return _0x3967a7;
    }
    _0x2ca508 = _0x3967a7;
  } catch (_0xeb6400) {
    throw _0xeb6400;
  }
  const _0x3b803d = Number.isFinite(_0x560f51) && _0x560f51 > 0 ? Math.max(1, Math.ceil(_0x560f51 / 60000)) : 0;
  const _0x2bf13b = new Error(_0x3b803d > 0 ? "即梦任务处理超时（已等待约 " + _0x3b803d + " 分钟）" : "即梦任务处理超时，请稍后重试");
  _0x2bf13b.code = DREAMINA_POLL_TIMEOUT_CODE;
  _0x2bf13b.submitId = String(_0x315765 || "").trim();
  throw _0x2bf13b;
}
export async function pollDreaminaUntilDone(_0x53abfe, _0x7d1086 = {}) {
  const _0x11b061 = String(_0x53abfe || "").trim();
  const _0xbac374 = String(_0x7d1086?.taskKind || _0x7d1086?.kind || "task").trim() || "task";
  return runTaskSingleFlight({
    provider: "dreamina",
    kind: _0xbac374,
    submitId: _0x11b061
  }, () => pollDreaminaUntilDoneOnce(_0x11b061, _0x7d1086));
}
function getDreaminaImageUpscaleInputImage(_0x58e088 = {}) {
  const _0x19c51b = String(_0x58e088?.inputUrlsBySlot?.image || "").trim();
  if (_0x19c51b) {
    return _0x19c51b;
  }
  const _0x54127a = String(_0x58e088?.image || _0x58e088?.imageUrl || _0x58e088?.inputImage || "").trim();
  if (_0x54127a) {
    return _0x54127a;
  }
  const _0x58e31a = Array.isArray(_0x58e088?.inputUrls) ? _0x58e088.inputUrls : [];
  return String(_0x58e31a.find(_0x29b50c => String(_0x29b50c || "").trim()) || "").trim();
}
function normalizeDreaminaImageUpscaleResolution(_0x5a08b7 = {}) {
  const _0x19eb19 = normalizeResolutionType(_0x5a08b7?.resolutionType ?? _0x5a08b7?.resolution_type ?? _0x5a08b7?.imageSize);
  if (_0x19eb19 === "4k" || _0x19eb19 === "8k") {
    return _0x19eb19;
  }
  return "2k";
}
export function buildDreaminaImageUpscaleSubmitPayload(_0x1042f1 = {}) {
  const _0x25931c = getDreaminaImageUpscaleInputImage(_0x1042f1);
  if (!_0x25931c) {
    throw new Error("即梦图片超清/放大需要 1 张输入图片");
  }
  return {
    image: _0x25931c,
    resolutionType: normalizeDreaminaImageUpscaleResolution(_0x1042f1)
  };
}
export async function runDreaminaImageUpscaleGeneration(_0x4d8840, _0x7ed57 = {}) {
  const _0x4ffdb4 = await submitDreaminaImageUpscale(buildDreaminaImageUpscaleSubmitPayload(_0x4d8840));
  if (_0x4ffdb4?.success === false) {
    throw new Error(normalizeDreaminaErrorMessage(_0x4ffdb4?.message) || "即梦图片超清/放大任务提交失败");
  }
  const _0x58d239 = String(_0x4ffdb4?.submitId || "").trim();
  if (!_0x58d239) {
    throw new Error("即梦图片超清/放大任务提交失败：未返回 submitId");
  }
  _0x7ed57?.onTaskMeta?.({
    taskId: _0x58d239,
    submitId: _0x58d239,
    provider: "dreamina",
    kind: "image"
  });
  _0x7ed57?.onTaskId?.(_0x58d239);
  const _0x2b8a43 = await pollDreaminaUntilDone(_0x58d239, {
    ..._0x7ed57,
    taskKind: "image"
  });
  const _0x409a60 = normalizeDreaminaTaskSnapshot(_0x2b8a43, {
    submitId: _0x58d239
  });
  if (_0x409a60?.phase === "failed") {
    throw new Error(normalizeDreaminaErrorMessage(_0x409a60?.failReason) || "即梦图片超清/放大失败");
  }
  const _0x4e46fd = Array.isArray(_0x409a60?.outputs) ? _0x409a60.outputs : [];
  if (!_0x4e46fd.length) {
    throw new Error("即梦图片超清/放大完成，但没有可用输出");
  }
  return _0x4e46fd.map(_0x3d5e8c => {
    const _0x480668 = _0x3d5e8c.localUrl || _0x3d5e8c.url;
    return {
      sourceId: null,
      thumbId: null,
      sourceUrl: _0x3d5e8c.url || _0x480668,
      thumbUrl: _0x480668,
      imageUrl: _0x480668,
      localPath: _0x3d5e8c.localPath || ""
    };
  });
}
export async function runDreaminaImageGeneration(_0x41f000, _0x3cd14d = {}) {
  const _0x27eb64 = String(_0x41f000?.prompt || "").trim();
  const _0x8e96eb = Array.isArray(_0x41f000?.inputUrls) ? _0x41f000.inputUrls.filter(Boolean) : [];
  const _0x65502d = _0x8e96eb.length > 0;
  const _0x39b6d9 = normalizeDreaminaRatio(_0x41f000, _0x65502d);
  const _0xde18f = normalizeResolutionType(_0x41f000?.imageSize);
  const _0x2772a3 = normalizeModelVersion(_0x41f000);
  const _0x106394 = normalizeDreaminaGenerateNum(_0x41f000);
  const _0x32f7c3 = {
    prompt: _0x27eb64
  };
  if (_0x39b6d9) {
    _0x32f7c3.ratio = _0x39b6d9;
  }
  if (_0xde18f) {
    _0x32f7c3.resolutionType = _0xde18f;
  }
  if (_0x2772a3) {
    _0x32f7c3.modelVersion = _0x2772a3;
  }
  if (_0x106394 > 1) {
    _0x32f7c3.generateNum = _0x106394;
  }
  let _0x3c5037 = null;
  if (_0x8e96eb.length > 0) {
    _0x3c5037 = await submitDreaminaImage2Image({
      images: _0x8e96eb,
      ..._0x32f7c3
    });
  } else {
    _0x3c5037 = await submitDreaminaText2Image({
      ..._0x32f7c3
    });
  }
  if (_0x3c5037?.success === false) {
    throw new Error(normalizeDreaminaErrorMessage(_0x3c5037?.message) || "即梦图片任务提交失败");
  }
  const _0x18be90 = String(_0x3c5037?.submitId || "").trim();
  if (!_0x18be90) {
    throw new Error("即梦图片任务提交失败：未返回 submitId");
  }
  _0x3cd14d?.onTaskMeta?.({
    taskId: _0x18be90,
    submitId: _0x18be90,
    provider: "dreamina",
    kind: "image"
  });
  _0x3cd14d?.onTaskId?.(_0x18be90);
  const _0x5ef0db = await pollDreaminaUntilDone(_0x18be90, {
    ..._0x3cd14d,
    taskKind: "image"
  });
  const _0x5caab3 = normalizeDreaminaTaskSnapshot(_0x5ef0db, {
    submitId: _0x18be90
  });
  if (_0x5caab3?.phase === "failed") {
    throw new Error(normalizeDreaminaErrorMessage(_0x5caab3?.failReason) || "即梦图片生成失败");
  }
  const _0x18fb22 = Array.isArray(_0x5caab3?.outputs) ? _0x5caab3.outputs : [];
  if (!_0x18fb22.length) {
    throw new Error("即梦图片生成完成，但没有可用输出");
  }
  return _0x18fb22.map(_0x2950d9 => {
    const _0x1be13d = _0x2950d9.localUrl || _0x2950d9.url;
    return {
      sourceId: null,
      thumbId: null,
      sourceUrl: _0x2950d9.url || _0x1be13d,
      thumbUrl: _0x1be13d,
      imageUrl: _0x1be13d,
      localPath: _0x2950d9.localPath || ""
    };
  });
}
export function buildDreaminaVideoSubmitRequest(_0x3e9c88 = {}) {
  const _0x2a5959 = toTrimmedArray(Array.isArray(_0x3e9c88?.images) && _0x3e9c88.images.length ? _0x3e9c88.images : _0x3e9c88?.inputUrls);
  const _0x34b98a = toTrimmedArray(_0x3e9c88?.videos);
  const _0x1c18d0 = toTrimmedArray(_0x3e9c88?.audios);
  const _0x15c1d9 = normalizeDreaminaVideoRouteMode(_0x3e9c88?.dreaminaRouteMode, _0x3e9c88?.mode);
  const _0x116667 = String(_0x3e9c88?.dreaminaTaskType || "").trim() || resolveDreaminaVideoTaskType({
    routeMode: _0x15c1d9,
    imageCount: _0x2a5959.length,
    videoCount: _0x34b98a.length,
    audioCount: _0x1c18d0.length
  });
  const _0x5841f4 = validateDreaminaVideoRouteSelection({
    routeMode: _0x15c1d9,
    taskType: _0x116667,
    imageCount: _0x2a5959.length,
    videoCount: _0x34b98a.length,
    audioCount: _0x1c18d0.length
  });
  if (_0x5841f4) {
    throw new Error(_0x5841f4);
  }
  const _0x4500ae = String(_0x3e9c88?.prompt || "").trim();
  const _0x3324f8 = String(_0x3e9c88?.model || "").trim();
  const _0x30e9c4 = normalizeDreaminaVideoModel(_0x3324f8, _0x3e9c88?.provider);
  if (_0x3324f8 && _0x3324f8 !== "dreamina/text2video" && !getDreaminaVideoModelVersion(_0x30e9c4, "dreamina")) {
    throw new Error("即梦 CLI 不支持视频模型：" + _0x3324f8);
  }
  const _0x35e218 = ensureDreaminaVideoModelForTask(_0x116667, _0x30e9c4, "dreamina") || _0x30e9c4;
  const _0x1ff232 = getDreaminaVideoModelVersion(_0x35e218, "dreamina") || String(_0x3e9c88?.modelVersion || "").trim() || normalizeModelVersion(_0x3e9c88);
  const _0x1ec259 = String(_0x3e9c88?.installId || "").trim();
  const _0x70590e = normalizeDreaminaVideoResolution(_0x116667, _0x35e218, _0x3e9c88?.videoResolution || _0x3e9c88?.videoSize || _0x3e9c88?.resolution, "dreamina");
  const _0x5d966e = normalizeDreaminaVideoAspectRatio(_0x3e9c88?.aspectRatio);
  const _0x559359 = normalizeDreaminaVideoDuration(_0x116667, _0x35e218, _0x3e9c88?.duration, "dreamina");
  if (_0x116667 === "text2video") {
    if (!_0x4500ae) {
      throw new Error("文生视频需要填写提示词");
    }
    return {
      taskType: _0x116667,
      url: "/api/v2/dreamina/text2video",
      body: {
        prompt: _0x4500ae,
        duration: _0x559359,
        ratio: _0x5d966e,
        videoResolution: _0x70590e,
        ...(_0x1ec259 ? {
          installId: _0x1ec259
        } : {}),
        ...(_0x1ff232 ? {
          modelVersion: _0x1ff232
        } : {})
      }
    };
  }
  if (_0x116667 === "image2video") {
    const _0x59e254 = String(_0x3e9c88?.image || _0x2a5959[0] || "").trim();
    if (!_0x4500ae) {
      throw new Error("首帧生视频需要填写提示词");
    }
    if (!_0x59e254) {
      throw new Error("首帧生视频至少需要 1 张图片");
    }
    return {
      taskType: _0x116667,
      url: "/api/v2/dreamina/image2video",
      body: {
        image: _0x59e254,
        prompt: _0x4500ae,
        duration: _0x559359,
        videoResolution: _0x70590e,
        ...(_0x1ec259 ? {
          installId: _0x1ec259
        } : {}),
        ...(_0x1ff232 ? {
          modelVersion: _0x1ff232
        } : {})
      }
    };
  }
  if (_0x116667 === "frames2video") {
    const _0x1d81fa = String(_0x3e9c88?.first || _0x2a5959[0] || "").trim();
    const _0x218489 = String(_0x3e9c88?.last || _0x2a5959[1] || "").trim();
    if (!_0x4500ae) {
      throw new Error("首尾帧模式需要填写提示词");
    }
    if (!_0x1d81fa || !_0x218489) {
      throw new Error("首尾帧模式至少需要 2 张图片");
    }
    return {
      taskType: _0x116667,
      url: "/api/v2/dreamina/frames2video",
      body: {
        first: _0x1d81fa,
        last: _0x218489,
        prompt: _0x4500ae,
        duration: _0x559359,
        videoResolution: _0x70590e,
        ...(_0x1ec259 ? {
          installId: _0x1ec259
        } : {}),
        ...(_0x1ff232 ? {
          modelVersion: _0x1ff232
        } : {})
      }
    };
  }
  if (_0x116667 === "multiframe2video") {
    const _0x20c295 = _0x2a5959.slice(0, 20);
    if (_0x20c295.length < 2) {
      throw new Error("多帧叙事至少需要 2 张图片");
    }
    const _0x61e7fb = Array.isArray(_0x3e9c88?.transitionPrompts) ? _0x3e9c88.transitionPrompts.map(_0x1a9960 => String(_0x1a9960 || "").trim()) : [];
    const _0x4e87ac = Array.isArray(_0x3e9c88?.transitionDurations) ? _0x3e9c88.transitionDurations : [];
    const _0x2c0a20 = Math.max(0, _0x20c295.length - 1);
    const _0x5f07f8 = [];
    const _0x4e619e = [];
    for (let _0x5e79c7 = 0; _0x5e79c7 < _0x2c0a20; _0x5e79c7 += 1) {
      _0x5f07f8.push(String(_0x61e7fb[_0x5e79c7] || "").trim() || _0x4500ae);
      const _0x1fb6a5 = Number(_0x4e87ac[_0x5e79c7]);
      _0x4e619e.push(Number.isFinite(_0x1fb6a5) && _0x1fb6a5 > 0 ? Math.max(1, Math.trunc(_0x1fb6a5)) : 3);
    }
    const _0x2baf31 = {
      images: _0x20c295
    };
    if (_0x1ec259) {
      _0x2baf31.installId = _0x1ec259;
    }
    if (_0x20c295.length === 2) {
      if (!_0x5f07f8[0] && !_0x4500ae) {
        throw new Error("两张图的多帧叙事需要提示词");
      }
      _0x2baf31.prompt = _0x5f07f8[0] || _0x4500ae;
      _0x2baf31.duration = _0x4e619e[0] || _0x559359 || 3;
    } else {
      if (!_0x5f07f8.every(_0x676c0e => String(_0x676c0e || "").trim())) {
        throw new Error("多帧叙事的每段 transition prompt 都不能为空");
      }
      _0x2baf31.transitionPrompts = _0x5f07f8;
      _0x2baf31.transitionDurations = _0x4e619e;
    }
    return {
      taskType: _0x116667,
      url: "/api/v2/dreamina/multiframe2video",
      body: _0x2baf31
    };
  }
  if (_0x116667 === "multimodal2video") {
    if (!_0x2a5959.length && !_0x34b98a.length) {
      throw new Error("全能参考至少需要 1 个图片或视频参考");
    }
    return {
      taskType: _0x116667,
      url: "/api/v2/dreamina/multimodal2video",
      body: {
        images: _0x2a5959,
        videos: _0x34b98a,
        audios: _0x1c18d0,
        prompt: _0x4500ae,
        duration: _0x559359,
        ratio: _0x5d966e,
        videoResolution: _0x70590e,
        ...(_0x1ec259 ? {
          installId: _0x1ec259
        } : {}),
        ...(_0x1ff232 ? {
          modelVersion: _0x1ff232
        } : {})
      }
    };
  }
  throw new Error("未识别的即梦视频任务类型");
}
export async function runDreaminaVideoGeneration(_0xa9f3ef, _0x2dccd9 = {}) {
  const _0x5088fc = buildDreaminaVideoSubmitRequest(_0xa9f3ef || {});
  let _0x14ce95 = null;
  try {
    if (_0x5088fc.url === "/api/v2/dreamina/text2video") {
      _0x14ce95 = await submitDreaminaText2Video(_0x5088fc.body);
    } else if (_0x5088fc.url === "/api/v2/dreamina/image2video") {
      _0x14ce95 = await submitDreaminaImage2Video(_0x5088fc.body);
    } else if (_0x5088fc.url === "/api/v2/dreamina/frames2video") {
      _0x14ce95 = await submitDreaminaFrames2Video(_0x5088fc.body);
    } else if (_0x5088fc.url === "/api/v2/dreamina/multiframe2video") {
      _0x14ce95 = await submitDreaminaMultiframe2Video(_0x5088fc.body);
    } else if (_0x5088fc.url === "/api/v2/dreamina/multimodal2video") {
      _0x14ce95 = await submitDreaminaMultimodal2Video(_0x5088fc.body);
    } else {
      throw new Error("未知的即梦视频请求路由");
    }
  } catch (_0x3cabfc) {
    throw normalizeDreaminaThrownError(_0x3cabfc);
  }
  if (_0x14ce95?.success === false) {
    const _0x271846 = new Error(normalizeDreaminaErrorMessage(_0x14ce95?.message) || "即梦视频任务提交失败");
    if (_0x14ce95?.code != null) {
      _0x271846.code = String(_0x14ce95.code || "");
    }
    if (_0x14ce95?.requiredModelId != null) {
      _0x271846.requiredModelId = String(_0x14ce95.requiredModelId || "").trim();
    }
    if (_0x14ce95?.subscriptionStatus != null) {
      _0x271846.subscriptionStatus = String(_0x14ce95.subscriptionStatus || "").trim();
    }
    if (_0x14ce95?.reasonCode != null) {
      _0x271846.reasonCode = String(_0x14ce95.reasonCode || "").trim();
    }
    _0x271846.contactText = String(_0x14ce95?.contactText || "").trim();
    _0x271846.contactUrl = String(_0x14ce95?.contactUrl || "").trim();
    throw _0x271846;
  }
  const _0x4e91fe = String(_0x14ce95?.submitId || "").trim();
  if (!_0x4e91fe) {
    throw new Error("即梦视频任务提交失败：未返回 submitId");
  }
  _0x2dccd9?.onTaskMeta?.({
    taskId: _0x4e91fe,
    submitId: _0x4e91fe,
    provider: "dreamina",
    kind: "video"
  });
  _0x2dccd9?.onTaskId?.(_0x4e91fe);
  const _0x374a24 = await pollDreaminaUntilDone(_0x4e91fe, {
    ..._0x2dccd9,
    taskKind: "video"
  });
  const _0x5cc095 = normalizeDreaminaTaskSnapshot(_0x374a24, {
    submitId: _0x4e91fe
  });
  if (_0x5cc095?.phase === "failed") {
    throw new Error(normalizeDreaminaErrorMessage(_0x5cc095?.failReason) || "即梦视频生成失败");
  }
  const _0x1d0e46 = Array.isArray(_0x5cc095?.outputs) ? _0x5cc095.outputs : [];
  if (!_0x1d0e46.length) {
    throw new Error("即梦视频生成完成，但没有可用输出");
  }
  const _0x5256a8 = _0x1d0e46.map(_0x97c608 => ({
    videoUrl: _0x97c608.localUrl || _0x97c608.url,
    localPath: _0x97c608.localPath || ""
  }));
  return {
    isBatch: _0x5256a8.length > 1,
    videos: _0x5256a8,
    videoUrl: _0x5256a8[0]?.videoUrl || "",
    localPath: _0x5256a8[0]?.localPath || ""
  };
}