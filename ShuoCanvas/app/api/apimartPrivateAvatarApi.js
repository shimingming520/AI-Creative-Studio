import { get as a45_0x3568f1, post as a45_0x8baf8c } from "./requester.js";
import { processInputImages } from "./imageUploadApi.js";
import { processInputVideos } from "./videoUploadApi.js";
import { processInputAudios } from "./audioUploadApi.js";
import { isApimartAssetUrl, normalizeApimartBaseUrl } from "./apimartUploadApi.js";
import { uploadModelApiMediaInputs } from "./mediaInputUploadRouter.js";
import { DEFAULT_APIMART_API_URL } from "../src/modules/providers.js";
const DEFAULT_APIMART_BASE_URL = DEFAULT_APIMART_API_URL;
const DEFAULT_PROJECT_NAME = "default";
const DEFAULT_GROUP_NAME = "aic-seedance2-private-avatar";
const MAX_PRIVATE_AVATAR_ASSET_NAME_LENGTH = 64;
const TERMINAL_SUCCESS_STATUSES = new Set(["completed", "complete", "succeeded", "success", "done"]);
const TERMINAL_FAILED_STATUSES = new Set(["failed", "failure", "error", "rejected"]);
function normalizeBaseUrl(_0x2f02b8) {
  return normalizeApimartBaseUrl(_0x2f02b8 || DEFAULT_APIMART_BASE_URL);
}
function normalizeApiKey(_0x589c66) {
  return String(_0x589c66 || "").trim().replace(/^Bearer\s+/i, "");
}
function sleep(_0x2ff116) {
  return new Promise(_0x5a623a => setTimeout(_0x5a623a, Math.max(0, _0x2ff116 || 0)));
}
function asPlainObject(_0x59d83e) {
  if (_0x59d83e && typeof _0x59d83e === "object" && !Array.isArray(_0x59d83e)) {
    return _0x59d83e;
  } else {
    return {};
  }
}
function normalizePrivateAvatarAssetType(_0x111416) {
  const _0x23719e = String(_0x111416 || "").trim().toLowerCase();
  if (_0x23719e === "video") {
    return "Video";
  }
  if (_0x23719e === "audio") {
    return "Audio";
  }
  return "Image";
}
function collectObjects(_0x355908, _0x4fd490 = []) {
  if (!_0x355908 || typeof _0x355908 !== "object") {
    return _0x4fd490;
  }
  if (Array.isArray(_0x355908)) {
    _0x355908.forEach(_0x208d35 => collectObjects(_0x208d35, _0x4fd490));
    return _0x4fd490;
  }
  _0x4fd490.push(_0x355908);
  for (const _0x3a00c6 of Object.values(_0x355908)) {
    if (_0x3a00c6 && typeof _0x3a00c6 === "object") {
      collectObjects(_0x3a00c6, _0x4fd490);
    }
  }
  return _0x4fd490;
}
function pickFirstString(_0x4d9b98) {
  for (const _0x49e14d of _0x4d9b98) {
    const _0x35d39c = String(_0x49e14d || "").trim();
    if (_0x35d39c) {
      return _0x35d39c;
    }
  }
  return "";
}
export function extractApimartPrivateAvatarAssetUrl(_0x179e27) {
  const _0x29d706 = asPlainObject(_0x179e27);
  const _0x14c216 = asPlainObject(_0x29d706.data);
  const _0x5291d6 = asPlainObject(_0x14c216.result || _0x29d706.result);
  const _0x4e2970 = pickFirstString([_0x5291d6.asset_url, _0x5291d6.assetUrl, _0x14c216.asset_url, _0x14c216.assetUrl, _0x29d706.asset_url, _0x29d706.assetUrl]);
  if (_0x4e2970) {
    return _0x4e2970;
  }
  const _0x4a9a8e = [_0x5291d6.usable_assets, _0x5291d6.usableAssets, _0x14c216.usable_assets, _0x14c216.usableAssets, _0x5291d6.assets, _0x14c216.assets, _0x29d706.usable_assets, _0x29d706.assets];
  for (const _0x434fc9 of _0x4a9a8e) {
    const _0x36b75a = collectObjects(_0x434fc9, []);
    for (const _0x2bb5bf of _0x36b75a) {
      const _0x40acd9 = String(_0x2bb5bf.status || "").trim().toLowerCase();
      const _0x3302a5 = pickFirstString([_0x2bb5bf.asset_url, _0x2bb5bf.assetUrl, _0x2bb5bf.url]);
      if (!_0x3302a5) {
        continue;
      }
      if (!_0x40acd9 || _0x40acd9 === "active" || _0x40acd9 === "passed" || _0x40acd9 === "success") {
        return _0x3302a5;
      }
    }
  }
  return "";
}
export function extractApimartPrivateAvatarTaskId(_0x29366a) {
  const _0x3f3609 = asPlainObject(_0x29366a);
  const _0x160a2b = asPlainObject(_0x3f3609.data);
  return pickFirstString([_0x160a2b.id, _0x160a2b.task_id, _0x160a2b.taskId, _0x3f3609.id, _0x3f3609.task_id, _0x3f3609.taskId]);
}
export function extractApimartPrivateAvatarTaskStatus(_0x5d96df) {
  const _0x1de5f0 = asPlainObject(_0x5d96df);
  const _0xb396e7 = asPlainObject(_0x1de5f0.data);
  return String(_0xb396e7.status || _0x1de5f0.status || "").trim().toLowerCase();
}
function extractApimartPrivateAvatarError(_0x4e03ee) {
  const _0x5eb2e1 = asPlainObject(_0x4e03ee);
  const _0x2965c4 = asPlainObject(_0x5eb2e1.data);
  const _0x3a6861 = asPlainObject(_0x5eb2e1.error || _0x2965c4.error);
  return pickFirstString([_0x3a6861.message, _0x3a6861.msg, _0x2965c4.message, _0x2965c4.msg, _0x5eb2e1.message, _0x5eb2e1.msg]);
}
function assertApimartApiCodeOk(_0x166be8, _0x59ef31) {
  const _0x128152 = Number(_0x166be8?.code);
  if (Number.isFinite(_0x128152) && _0x128152 !== 200 && _0x128152 !== 0) {
    throw new Error(extractApimartPrivateAvatarError(_0x166be8) || _0x59ef31);
  }
}
function buildPrivateAvatarPollUrl({
  baseUrl: _0x3d1d88,
  taskId: _0x5e9f4f
}) {
  return normalizeBaseUrl(_0x3d1d88) + "/v1/tasks/" + encodeURIComponent(_0x5e9f4f) + "?language=zh";
}
async function resolvePrivateAvatarInputUrl(_0x59ba94, _0x4bc530, _0x2d1d02, _0x5363a4 = {}) {
  const _0x3e2850 = String(_0x59ba94 || "").trim();
  if (!_0x3e2850) {
    throw new Error("人脸检测输入地址为空");
  }
  if (isApimartAssetUrl(_0x3e2850)) {
    throw new Error("该素材已经是 APIMart asset URL，无需再次人脸检测");
  }
  const _0x14e19a = _0x2d1d02 === "Video" ? "video" : _0x2d1d02 === "Audio" ? "audio" : "image";
  const _0x4ab3cd = _0x14e19a === "image" ? "apimart" : "runninghub";
  const _0x4bd5d3 = _0x14e19a === "image" ? _0x4bc530 : String(_0x5363a4.runningHubApiKey || "").trim();
  const _0x5a2b77 = _0x14e19a === "image" ? _0x5363a4.apiUrl : _0x5363a4.runningHubApiUrl;
  const _0x36e141 = await uploadModelApiMediaInputs(_0x14e19a, [_0x3e2850], {
    processInputImages: processInputImages,
    processInputVideos: processInputVideos,
    processInputAudios: processInputAudios
  }, {
    fallbackProvider: _0x4ab3cd,
    apiKey: _0x4bd5d3,
    apiUrl: _0x5a2b77,
    reusePublicUrls: false,
    strictUpload: true,
    uploadOptions: {
      compress: _0x14e19a === "image" ? _0x5363a4.compress !== false : false
    }
  });
  return String(_0x36e141?.[0] || "").trim();
}
function sanitizePrivateAvatarAssetName(_0xa8b231, _0x72ad58) {
  const _0x5e8d0e = _0x72ad58 === "Video" ? "video" : _0x72ad58 === "Audio" ? "audio" : "image";
  const _0x533c0f = String(_0xa8b231 || _0x5e8d0e).trim();
  return _0x533c0f.replace(/[\\/:*?"<>|]/g, "_").slice(0, MAX_PRIVATE_AVATAR_ASSET_NAME_LENGTH) || _0x5e8d0e;
}
function assertPrivateAvatarPublicUrl(_0x48dc43) {
  const _0x5b5fd1 = String(_0x48dc43 || "").trim();
  if (!/^https?:\/\//i.test(_0x5b5fd1)) {
    throw new Error("APIMart 人脸检测素材未获得公网 URL，已停止提交");
  }
  try {
    const _0x4297f4 = new URL(_0x5b5fd1).hostname.toLowerCase();
    if (_0x4297f4 === "localhost" || _0x4297f4 === "127.0.0.1" || _0x4297f4 === "::1" || _0x4297f4.endsWith(".local")) {
      throw new Error("APIMart 人脸检测素材仍是本地地址，已停止提交");
    }
  } catch (_0x5e237f) {
    if (_0x5e237f instanceof TypeError) {
      throw new Error("APIMart 人脸检测素材 URL 无效，已停止提交");
    }
    throw _0x5e237f;
  }
}
export async function pollApimartPrivateAvatarTask({
  apiKey: _0x4cb4f5,
  apiUrl: _0x1cc023,
  taskId: _0x2a3a87,
  pollIntervalMs = 2500,
  maxWaitMs = 120000,
  signal: _0x2354aa
} = {}) {
  const _0x50b466 = normalizeApiKey(_0x4cb4f5);
  if (!_0x50b466) {
    throw new Error("APIMART API Key 未配置");
  }
  const _0x3e9a7b = String(_0x2a3a87 || "").trim();
  if (!_0x3e9a7b) {
    throw new Error("APIMART 人脸检测任务 ID 为空");
  }
  const _0x306536 = Date.now();
  while (Date.now() - _0x306536 <= maxWaitMs) {
    if (_0x2354aa?.aborted) {
      throw new DOMException("Aborted", "AbortError");
    }
    const _0x526e5a = buildPrivateAvatarPollUrl({
      baseUrl: _0x1cc023,
      taskId: _0x3e9a7b
    });
    const _0x2e3f1f = await a45_0x3568f1("/api/v2/proxy/task?apiUrl=" + encodeURIComponent(_0x526e5a), {
      provider: "apimart",
      headers: {
        Authorization: "Bearer " + _0x50b466
      },
      timeout: 60000,
      signal: _0x2354aa
    });
    assertApimartApiCodeOk(_0x2e3f1f, "APIMART 人脸检测查询失败");
    const _0x200808 = extractApimartPrivateAvatarAssetUrl(_0x2e3f1f);
    const _0x36944d = extractApimartPrivateAvatarTaskStatus(_0x2e3f1f);
    if (_0x200808 && (TERMINAL_SUCCESS_STATUSES.has(_0x36944d) || TERMINAL_FAILED_STATUSES.has(_0x36944d))) {
      return {
        status: "passed",
        taskId: _0x3e9a7b,
        assetUrl: _0x200808,
        raw: _0x2e3f1f
      };
    }
    if (TERMINAL_FAILED_STATUSES.has(_0x36944d)) {
      throw new Error(extractApimartPrivateAvatarError(_0x2e3f1f) || "APIMART 人脸检测未通过");
    }
    if (TERMINAL_SUCCESS_STATUSES.has(_0x36944d)) {
      throw new Error("APIMART 人脸检测已完成但未返回可用 asset URL");
    }
    await sleep(pollIntervalMs);
  }
  throw new Error("APIMART 人脸检测超时，请稍后重试");
}
export async function submitApimartSeedance2PrivateAvatar({
  apiKey: _0x282d91,
  apiUrl: _0x2778b3,
  runningHubApiKey: _0x4907d3,
  runningHubApiUrl: _0x938b3b,
  url: _0x2ea8b6,
  name: _0x50e8d8,
  assetType = "Image",
  group: _0x428fce,
  groupId: _0x1b8310,
  projectName = DEFAULT_PROJECT_NAME,
  poll = true,
  pollIntervalMs: _0x267301,
  maxWaitMs: _0x4c867b,
  signal: _0x1b8705
} = {}) {
  const _0x44094c = normalizeApiKey(_0x282d91);
  if (!_0x44094c) {
    throw new Error("APIMART API Key 未配置");
  }
  const _0x1fea83 = normalizeBaseUrl(_0x2778b3);
  const _0x228218 = normalizePrivateAvatarAssetType(assetType);
  const _0x1b019c = await resolvePrivateAvatarInputUrl(_0x2ea8b6, _0x44094c, _0x228218, {
    apiUrl: _0x1fea83,
    runningHubApiKey: _0x4907d3,
    runningHubApiUrl: _0x938b3b
  });
  if (!_0x1b019c) {
    throw new Error("APIMART 人脸检测素材上传失败");
  }
  assertPrivateAvatarPublicUrl(_0x1b019c);
  const _0x224e30 = sanitizePrivateAvatarAssetName(_0x50e8d8, _0x228218);
  const _0x918ff4 = {
    project_name: projectName || DEFAULT_PROJECT_NAME,
    asset_type: _0x228218,
    assets: [{
      url: _0x1b019c,
      name: _0x224e30
    }]
  };
  const _0x2bdde3 = String(_0x1b8310 || "").trim();
  if (_0x2bdde3) {
    _0x918ff4.group_id = _0x2bdde3;
  } else {
    _0x918ff4.group = {
      name: String(_0x428fce?.name || DEFAULT_GROUP_NAME).trim() || DEFAULT_GROUP_NAME,
      description: String(_0x428fce?.description || "AI Canvas Seedance 2.0 private avatar assets").trim()
    };
  }
  const _0x466de5 = await a45_0x8baf8c("/api/v2/proxy/image", {
    apiUrl: _0x1fea83 + "/v1/seedance2/private-avatar",
    apiKey: _0x44094c,
    ..._0x918ff4
  }, {
    provider: "apimart",
    timeout: 120000,
    signal: _0x1b8705
  });
  assertApimartApiCodeOk(_0x466de5, "APIMART 人脸检测提交失败");
  const _0xd929b2 = extractApimartPrivateAvatarAssetUrl(_0x466de5);
  const _0x5558fb = extractApimartPrivateAvatarTaskId(_0x466de5);
  if (_0xd929b2) {
    return {
      status: "passed",
      taskId: _0x5558fb,
      assetUrl: _0xd929b2,
      sourceUrl: _0x1b019c,
      assetType: _0x228218,
      raw: _0x466de5
    };
  }
  if (!_0x5558fb) {
    throw new Error("APIMART 人脸检测提交失败：未返回任务 ID");
  }
  if (!poll) {
    return {
      status: extractApimartPrivateAvatarTaskStatus(_0x466de5) || "processing",
      taskId: _0x5558fb,
      sourceUrl: _0x1b019c,
      assetType: _0x228218,
      raw: _0x466de5
    };
  }
  const _0x11458b = await pollApimartPrivateAvatarTask({
    apiKey: _0x44094c,
    apiUrl: _0x1fea83,
    taskId: _0x5558fb,
    pollIntervalMs: _0x267301,
    maxWaitMs: _0x4c867b,
    signal: _0x1b8705
  });
  return {
    ..._0x11458b,
    sourceUrl: _0x1b019c,
    assetType: _0x228218
  };
}