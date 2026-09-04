import { buildApiUrl } from "./apiBase.js";
import { get as a194_0x53e22e, post as a194_0x21968a } from "./requester.js";
const VOLCENGINE_DEFAULT_BASE_URL = "https://ark.cn-beijing.volces.com/api/v3";
const VOLCENGINE_FILE_POLL_INTERVAL_MS = 2000;
const VOLCENGINE_FILE_POLL_TIMEOUT_MS = 120000;
function normalizeBaseUrl(_0x5c2fff) {
  return String(_0x5c2fff || VOLCENGINE_DEFAULT_BASE_URL).trim().replace(/\/+$/, "");
}
function isVolcengineFileId(_0x40b4aa) {
  return /^file-[A-Za-z0-9_-]+/.test(String(_0x40b4aa || "").trim());
}
function extensionFromContentType(_0x2edf7f, _0x70adda = "bin") {
  const _0x1960f8 = String(_0x2edf7f || "").trim().toLowerCase();
  const _0x3036e4 = {
    "image/jpeg": "jpg",
    "image/jpg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/gif": "gif",
    "video/mp4": "mp4",
    "video/quicktime": "mov",
    "video/webm": "webm",
    "video/x-matroska": "mkv",
    "audio/mpeg": "mp3",
    "audio/mp3": "mp3",
    "audio/wav": "wav",
    "audio/x-wav": "wav",
    "audio/mp4": "m4a",
    "audio/aac": "aac",
    "audio/ogg": "ogg",
    "audio/flac": "flac",
    "audio/webm": "webm"
  };
  return _0x3036e4[_0x1960f8] || String(_0x70adda || "bin").replace(/^\./, "");
}
function guessFileName(_0x2d39d3, _0x1ae046, _0x2e4c30) {
  try {
    const _0xe463d = new URL(String(_0x2d39d3 || ""), "http://local.invalid");
    const _0xd55424 = _0xe463d.pathname.split("/").filter(Boolean).pop() || "";
    if (_0xd55424 && _0xd55424.includes(".")) {
      return _0xd55424;
    }
  } catch {}
  const _0x54411a = extensionFromContentType(_0x2e4c30, _0x1ae046 === "video" ? "mp4" : _0x1ae046 === "audio" ? "mp3" : "png");
  return "volcengine-input." + _0x54411a;
}
function resolveInputFetchUrl(_0x19c7df) {
  const _0x4e0ff4 = String(_0x19c7df || "").trim();
  if (!_0x4e0ff4) {
    return "";
  }
  if (/^(?:https?:|data:|blob:)/i.test(_0x4e0ff4)) {
    return _0x4e0ff4;
  }
  if (_0x4e0ff4.startsWith("/")) {
    return buildApiUrl(_0x4e0ff4);
  }
  return buildApiUrl("/" + _0x4e0ff4);
}
function normalizeFileObject(_0xcff6b8) {
  const _0x179feb = _0xcff6b8?.data && typeof _0xcff6b8.data === "object" ? _0xcff6b8.data : _0xcff6b8;
  if (_0x179feb && typeof _0x179feb === "object") {
    return _0x179feb;
  } else {
    return {};
  }
}
async function fetchInputBlob(_0x60637b) {
  const _0xafea8 = resolveInputFetchUrl(_0x60637b);
  if (!_0xafea8) {
    throw new Error("火山方舟上传文件地址为空");
  }
  return await a194_0x53e22e(_0xafea8, {
    provider: "remote",
    buildUrl: false,
    responseType: "blob",
    timeout: 300000
  });
}
export async function retrieveVolcengineFile(_0x360dbe, _0x35f8de, _0x3c59fb = {}) {
  const _0x30e088 = String(_0x360dbe || "").trim();
  if (!_0x30e088) {
    throw new Error("火山方舟文件 ID 为空");
  }
  if (!_0x35f8de) {
    throw new Error("火山方舟 API Key 未配置，无法检索文件");
  }
  const _0xed6904 = normalizeBaseUrl(_0x3c59fb.baseUrl) + "/files/" + encodeURIComponent(_0x30e088);
  const _0x1007b4 = await a194_0x53e22e("/api/v2/proxy/task?apiUrl=" + encodeURIComponent(_0xed6904), {
    headers: {
      Authorization: "Bearer " + _0x35f8de
    },
    provider: "volcengine",
    timeout: _0x3c59fb.timeout || 30000
  });
  return normalizeFileObject(_0x1007b4);
}
async function waitForVolcengineFileActive(_0x40dc25, _0x1562f7, _0x1bb296 = {}) {
  let _0x4901e7 = normalizeFileObject(_0x40dc25);
  const _0x251052 = String(_0x4901e7.id || "").trim();
  if (!_0x251052) {
    throw new Error("火山方舟文件上传未返回 file id");
  }
  const _0x414c2e = Date.now();
  while (true) {
    const _0x114a10 = String(_0x4901e7.status || "").trim().toLowerCase();
    if (!_0x114a10 || _0x114a10 === "active") {
      return _0x4901e7;
    }
    if (_0x114a10 === "failed") {
      const _0x36069e = _0x4901e7.error?.message || _0x4901e7.message || "火山方舟文件处理失败";
      throw new Error(_0x36069e);
    }
    if (Date.now() - _0x414c2e > (_0x1bb296.timeout || VOLCENGINE_FILE_POLL_TIMEOUT_MS)) {
      throw new Error("火山方舟文件处理超时，请稍后重试");
    }
    await new Promise(_0xe51724 => setTimeout(_0xe51724, _0x1bb296.interval || VOLCENGINE_FILE_POLL_INTERVAL_MS));
    _0x4901e7 = await retrieveVolcengineFile(_0x251052, _0x1562f7, _0x1bb296);
  }
}
export async function uploadBlobToVolcengineFile(_0x20b161, _0x21a50a, _0x387589 = {}) {
  if (!_0x20b161) {
    throw new Error("火山方舟上传文件不能为空");
  }
  if (!_0x21a50a) {
    throw new Error("火山方舟 API Key 未配置，无法上传文件");
  }
  const _0x92f712 = String(_0x387589.kind || "").trim().toLowerCase();
  const _0x199baf = String(_0x20b161.type || _0x387589.contentType || "").trim();
  const _0x15fc47 = _0x387589.filename || guessFileName(_0x387589.sourceUrl, _0x92f712, _0x199baf || _0x387589.contentType);
  const _0x140bbe = normalizeBaseUrl(_0x387589.baseUrl) + "/files";
  const _0x121892 = new FormData();
  _0x121892.append("purpose", "user_data");
  _0x121892.append("file", _0x20b161, _0x15fc47);
  if (_0x92f712 === "video") {
    _0x121892.append("preprocess_configs[video][fps]", String(_0x387589.videoFps ?? 0.3));
    if (_0x387589.model) {
      _0x121892.append("preprocess_configs[video][model]", String(_0x387589.model));
    }
  }
  const _0xcd3930 = await a194_0x21968a("/api/v2/proxy/upload?apiUrl=" + encodeURIComponent(_0x140bbe), _0x121892, {
    headers: {
      Authorization: "Bearer " + _0x21a50a
    },
    provider: "volcengine",
    timeout: _0x387589.uploadTimeout || 300000
  });
  return await waitForVolcengineFileActive(_0xcd3930, _0x21a50a, _0x387589);
}
export async function uploadInputToVolcengineFile(_0x283cb8, _0x4c93e5, _0x51fd73 = {}) {
  const _0x3b04e6 = String(_0x283cb8 || "").trim();
  if (!_0x3b04e6) {
    return "";
  }
  if (isVolcengineFileId(_0x3b04e6)) {
    return _0x3b04e6;
  }
  const _0x42d128 = await fetchInputBlob(_0x3b04e6);
  const _0x5b6241 = await uploadBlobToVolcengineFile(_0x42d128, _0x4c93e5, {
    ..._0x51fd73,
    sourceUrl: _0x3b04e6
  });
  const _0x208ddd = String(_0x5b6241.id || "").trim();
  if (!_0x208ddd) {
    throw new Error("火山方舟文件上传未返回 file id");
  }
  return _0x208ddd;
}
export async function uploadInputsToVolcengineFiles(_0x5afd2a, _0x5838ea, _0x1a8a55 = {}) {
  const _0x159414 = Array.isArray(_0x5afd2a) ? _0x5afd2a.map(_0x5a5dfc => String(_0x5a5dfc || "").trim()).filter(Boolean) : [];
  const _0x18ad10 = new Array(_0x159414.length).fill("");
  for (let _0xdba878 = 0; _0xdba878 < _0x159414.length; _0xdba878 += 1) {
    _0x18ad10[_0xdba878] = await uploadInputToVolcengineFile(_0x159414[_0xdba878], _0x5838ea, _0x1a8a55);
  }
  return _0x18ad10;
}