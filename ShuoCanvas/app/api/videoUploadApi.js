import { buildApiUrl } from "./apiBase.js";
import { post as a192_0x452fc1, get as a192_0x43d9ee } from "./requester.js";
import { isCustomProviderAssetUploadProvider, isReusableCustomProviderAssetUrl, uploadToCustomProviderAsset } from "./customProviderAssetUploadApi.js";
import { createRunningHubMediaUploadApiKeyMissingError } from "./mediaUploadErrors.js";
import { isConfiguredObjectStorageEnabled, isConfiguredObjectStoragePublicUrl, OBJECT_STORAGE_UPLOAD_PROVIDER, uploadPublicMediaToConfiguredObjectStorage } from "./objectStorageApi.js";
import { getRunningHubUploadErrorMessage, getRunningHubUploadUrl, hasRunningHubUploadFailureCode } from "./runningHubUploadResponse.js";
const DEFAULT_INPUT_VIDEO_FETCH_TIMEOUT_MS = 120000;
const DEFAULT_RUNNINGHUB_VIDEO_UPLOAD_TIMEOUT_MS = 120000;
const DEFAULT_VIDEO_UPLOAD_RETRIES = 1;
const DEFAULT_VIDEO_UPLOAD_RETRY_DELAY_MS = 500;
const HTTP_URL_RE = /^https?:\/\//i;
const INLINE_MEDIA_URL_RE = /^(?:blob|data):/i;
const LOCAL_VIRTUAL_MEDIA_PATH_RE = /^\/?(?:output|data\/(?:uploads|assets))\//i;
const RETRYABLE_RUNNINGHUB_UPLOAD_CODES = new Set([500, 808, 1000, 1005, 1010, 1011, 1012, 1013, 1504]);
function sleep(_0x33a07a) {
  const _0x1d49f4 = Number(_0x33a07a);
  if (_0x1d49f4 > 0) {
    return new Promise(_0x3cf2d5 => setTimeout(_0x3cf2d5, _0x1d49f4));
  } else {
    return Promise.resolve();
  }
}
function normalizeRetryCount(_0xe61f9f, _0x551738 = DEFAULT_VIDEO_UPLOAD_RETRIES) {
  const _0x333cd8 = Number(_0xe61f9f);
  if (Number.isFinite(_0x333cd8) && _0x333cd8 >= 0) {
    return Math.min(5, Math.trunc(_0x333cd8));
  } else {
    return _0x551738;
  }
}
function normalizeTimeoutMs(_0x36f596, _0x25f3eb) {
  const _0x54da01 = Number(_0x36f596);
  if (Number.isFinite(_0x54da01) && _0x54da01 > 0) {
    return Math.trunc(_0x54da01);
  } else {
    return _0x25f3eb;
  }
}
function normalizeDelayMs(_0x3e2ad5, _0x507f98 = DEFAULT_VIDEO_UPLOAD_RETRY_DELAY_MS) {
  const _0x43fdae = Number(_0x3e2ad5);
  if (Number.isFinite(_0x43fdae) && _0x43fdae >= 0) {
    return Math.trunc(_0x43fdae);
  } else {
    return _0x507f98;
  }
}
function isHttpUrl(_0x5650b5) {
  return HTTP_URL_RE.test(String(_0x5650b5 || ""));
}
function isInlineMediaUrl(_0x32c14e) {
  return INLINE_MEDIA_URL_RE.test(String(_0x32c14e || ""));
}
function isProviderAssetIdentifier(_0x11fb31) {
  return /^asset:\/\//i.test(String(_0x11fb31 || "").trim());
}
function isLocalVideoPath(_0x3eeded) {
  const _0x165577 = String(_0x3eeded || "").trim();
  return !!_0x165577 && !isHttpUrl(_0x165577) && !isInlineMediaUrl(_0x165577);
}
function isLocalVirtualMediaPath(_0x16379b) {
  return LOCAL_VIRTUAL_MEDIA_PATH_RE.test(String(_0x16379b || "").trim());
}
function encodeLocalPathSegment(_0x23e1ca) {
  if (!_0x23e1ca) {
    return "";
  }
  try {
    return encodeURIComponent(decodeURIComponent(_0x23e1ca));
  } catch {
    return encodeURIComponent(_0x23e1ca);
  }
}
function splitLocalPathQuery(_0x5d37a4) {
  const _0x731478 = _0x5d37a4.indexOf("?");
  if (_0x731478 < 0) {
    return {
      pathname: _0x5d37a4,
      suffix: ""
    };
  }
  return {
    pathname: _0x5d37a4.slice(0, _0x731478),
    suffix: _0x5d37a4.slice(_0x731478)
  };
}
function buildInputVideoFetchUrl(_0x4c3d32) {
  const _0x58c2d5 = String(_0x4c3d32 || "").trim();
  if (!isLocalVideoPath(_0x58c2d5)) {
    return _0x58c2d5;
  }
  const {
    pathname: _0x1ec871,
    suffix: _0x304a49
  } = splitLocalPathQuery(_0x58c2d5);
  const _0x5bbb8a = _0x1ec871.startsWith("/") ? _0x1ec871 : "/" + _0x1ec871;
  const _0x1e18b8 = _0x5bbb8a.split("/").map((_0x2865cc, _0x2ab083) => _0x2ab083 === 0 ? "" : encodeLocalPathSegment(_0x2865cc)).join("/");
  return buildApiUrl("" + _0x1e18b8 + _0x304a49);
}
function getErrorStatus(_0x5d525d) {
  const _0x70017b = _0x5d525d?.status ?? _0x5d525d?.statusCode ?? _0x5d525d?.httpStatus;
  const _0x34c6ad = Number(_0x70017b);
  if (Number.isFinite(_0x34c6ad)) {
    return _0x34c6ad;
  } else {
    return 0;
  }
}
function isNotFoundVideoFetchError(_0x40803c) {
  const _0x927d10 = String(_0x40803c?.message || _0x40803c || "");
  return getErrorStatus(_0x40803c) === 404 || /\b404\b/.test(_0x927d10) || /File not found/i.test(_0x927d10);
}
function wrapInputVideoFetchError(_0x1bf04d, _0x71528a, _0x15eb11, _0x38795e) {
  if (!isLocalVideoPath(_0x15eb11) || !isNotFoundVideoFetchError(_0x1bf04d)) {
    return _0x1bf04d;
  }
  const _0x28289b = new Error("第 " + (_0x71528a + 1) + " 个源视频本地文件不存在或无法访问，请重新选择或重新上传该视频：" + _0x15eb11);
  _0x28289b.name = "InputVideoFetchError";
  _0x28289b.status = 404;
  _0x28289b.fetchUrl = _0x38795e;
  _0x28289b.cause = _0x1bf04d;
  return _0x28289b;
}
async function fetchInputVideoBlob(_0x373f61, _0x344988, _0x592ef6 = {}) {
  const _0x392642 = buildInputVideoFetchUrl(_0x373f61);
  try {
    return await a192_0x43d9ee(_0x392642, {
      provider: "remote",
      buildUrl: false,
      responseType: "blob",
      timeout: normalizeTimeoutMs(_0x592ef6.fetchTimeoutMs, DEFAULT_INPUT_VIDEO_FETCH_TIMEOUT_MS),
      retries: normalizeRetryCount(_0x592ef6.fetchRetries),
      retryDelay: normalizeDelayMs(_0x592ef6.retryDelayMs)
    });
  } catch (_0x3fa3b8) {
    throw wrapInputVideoFetchError(_0x3fa3b8, _0x344988, _0x373f61, _0x392642);
  }
}
function guessVideoExtension(_0x90378, _0x479dcd = "mp4") {
  try {
    const _0x35f501 = String(_0x90378 || "");
    const _0x4281a5 = new URL(isHttpUrl(_0x35f501) || isInlineMediaUrl(_0x35f501) ? _0x35f501 : buildInputVideoFetchUrl(_0x35f501), "https://local.invalid");
    const _0x520791 = String(_0x4281a5.pathname || "").split("/").pop() || "";
    const _0x2aa303 = _0x520791.includes(".") ? _0x520791.split(".").pop().toLowerCase() : "";
    if (/^(mp4|mov|m4v|webm|avi|mkv)$/.test(_0x2aa303)) {
      return _0x2aa303;
    }
  } catch {}
  return _0x479dcd;
}
function isRetryableRunningHubUploadResponse(_0x180db9 = {}) {
  const _0x4060bd = Number(_0x180db9?.code);
  return Number.isFinite(_0x4060bd) && RETRYABLE_RUNNINGHUB_UPLOAD_CODES.has(_0x4060bd);
}
function isRetryableUploadError(_0x10c479) {
  if (_0x10c479?.retryable === true) {
    return true;
  }
  const _0x1c87dc = getErrorStatus(_0x10c479);
  return _0x1c87dc === 429 || _0x1c87dc >= 500;
}
async function postVideoToRunningHub(_0x3bc952, _0x449eb0, _0x3abc9c = {}) {
  const _0x5f0031 = String(_0x3abc9c.apiUrl || "https://www.runninghub.cn").trim().replace(/\/+$/, "");
  const _0xacfe01 = _0x5f0031 + "/openapi/v2/media/upload/binary";
  const _0x35f372 = buildApiUrl("/api/v2/proxy/upload?apiUrl=" + encodeURIComponent(_0xacfe01));
  const _0x57abc2 = new FormData();
  const _0x1f5c77 = _0x3abc9c.filename || _0x3bc952.name || "video.mp4";
  _0x57abc2.append("file", _0x3bc952, _0x1f5c77);
  return await a192_0x452fc1(_0x35f372, _0x57abc2, {
    headers: {
      Authorization: "Bearer " + _0x449eb0
    },
    provider: "runninghub",
    buildUrl: false,
    timeout: normalizeTimeoutMs(_0x3abc9c.uploadTimeoutMs, DEFAULT_RUNNINGHUB_VIDEO_UPLOAD_TIMEOUT_MS),
    retries: normalizeRetryCount(_0x3abc9c.transportRetries, 0),
    retryDelay: normalizeDelayMs(_0x3abc9c.retryDelayMs)
  });
}
async function postLocalVideoToRunningHub(_0x5d5d52, _0x550152, _0x5597ea = {}) {
  const _0x333ffc = String(_0x5597ea.apiUrl || "https://www.runninghub.cn").trim().replace(/\/+$/, "");
  const _0x5ac9c0 = _0x333ffc + "/openapi/v2/media/upload/binary";
  const _0x24df58 = buildApiUrl("/api/v2/proxy/upload-local-media?apiUrl=" + encodeURIComponent(_0x5ac9c0));
  const _0x324e9a = {
    localPath: _0x5d5d52,
    filename: _0x5597ea.filename || "video.mp4",
    mediaKind: "video",
    multipartField: "file"
  };
  const _0x581447 = Number(_0x5597ea.maxBytes);
  if (Number.isFinite(_0x581447) && _0x581447 > 0) {
    _0x324e9a.maxBytes = Math.trunc(_0x581447);
  }
  return await a192_0x452fc1(_0x24df58, _0x324e9a, {
    headers: {
      Authorization: "Bearer " + _0x550152,
      "Content-Type": "application/json"
    },
    provider: "runninghub",
    buildUrl: false,
    timeout: normalizeTimeoutMs(_0x5597ea.uploadTimeoutMs, DEFAULT_RUNNINGHUB_VIDEO_UPLOAD_TIMEOUT_MS),
    retries: normalizeRetryCount(_0x5597ea.transportRetries, 0),
    retryDelay: normalizeDelayMs(_0x5597ea.retryDelayMs)
  });
}
async function completeRunningHubVideoUpload(_0x4da1fc, _0x1da168 = {}) {
  const _0x315c8d = normalizeRetryCount(_0x1da168.uploadRetries);
  const _0x163234 = normalizeDelayMs(_0x1da168.retryDelayMs);
  for (let _0x223953 = 0;; _0x223953++) {
    let _0x40dd5c;
    try {
      _0x40dd5c = await _0x4da1fc();
    } catch (_0x4410be) {
      if (_0x223953 < _0x315c8d && isRetryableUploadError(_0x4410be)) {
        await sleep(_0x163234 * (_0x223953 + 1));
        continue;
      }
      throw _0x4410be;
    }
    if (hasRunningHubUploadFailureCode(_0x40dd5c)) {
      const _0x298497 = new Error("RunningHUB 视频上传失败: " + getRunningHubUploadErrorMessage(_0x40dd5c));
      _0x298497.code = _0x40dd5c.code;
      _0x298497.provider = "runninghub";
      _0x298497.retryable = isRetryableRunningHubUploadResponse(_0x40dd5c);
      if (_0x223953 < _0x315c8d && _0x298497.retryable) {
        await sleep(_0x163234 * (_0x223953 + 1));
        continue;
      }
      throw _0x298497;
    }
    const _0x4e517e = getRunningHubUploadUrl(_0x40dd5c);
    if (!_0x4e517e) {
      if (_0x223953 < _0x315c8d) {
        await sleep(_0x163234 * (_0x223953 + 1));
        continue;
      }
      throw new Error("RunningHUB 返回的视频URL为空");
    }
    return _0x4e517e;
  }
}
export async function uploadVideoToRunningHub(_0x2dd8c5, _0x42e2ca, _0xc1c8a8 = {}) {
  if (isConfiguredObjectStorageEnabled()) {
    return await uploadPublicMediaToConfiguredObjectStorage("video", _0x2dd8c5, _0xc1c8a8);
  }
  if (!_0x42e2ca) {
    throw createRunningHubMediaUploadApiKeyMissingError("video");
  }
  if (!_0x2dd8c5) {
    throw new Error("视频文件不能为空");
  }
  return await completeRunningHubVideoUpload(() => postVideoToRunningHub(_0x2dd8c5, _0x42e2ca, _0xc1c8a8), _0xc1c8a8);
}
async function uploadLocalVideoToRunningHub(_0x5a5762, _0x244ee1, _0x45d4fb = {}) {
  if (!_0x244ee1) {
    throw createRunningHubMediaUploadApiKeyMissingError("video");
  }
  if (!_0x5a5762) {
    throw new Error("本地视频路径不能为空");
  }
  return await completeRunningHubVideoUpload(() => postLocalVideoToRunningHub(_0x5a5762, _0x244ee1, _0x45d4fb), _0x45d4fb);
}
async function processInputVideosOrdered(_0x21efa2, _0x395500, _0x2ed9d3 = {}) {
  if (!_0x21efa2 || _0x21efa2.length === 0) {
    return [];
  }
  const _0x185e9a = String(_0x2ed9d3.provider || "runninghub").trim() || "runninghub";
  const _0x1baef3 = _0x2ed9d3.forceProviderUpload === true;
  const _0x1a1163 = isConfiguredObjectStorageEnabled() && !_0x1baef3;
  const _0x3d7b3f = _0x2ed9d3.strictUpload === true;
  const _0x75103f = Number(_0x2ed9d3.maxBytes);
  const _0x45cd59 = Number.isFinite(_0x75103f) && _0x75103f > 0;
  const _0x10d15d = new Array(_0x21efa2.length).fill("");
  for (let _0xaac42e = 0; _0xaac42e < _0x21efa2.length; _0xaac42e++) {
    const _0x4388f9 = String(_0x21efa2[_0xaac42e] || "").trim();
    if (!_0x4388f9) {
      continue;
    }
    try {
      if (isProviderAssetIdentifier(_0x4388f9)) {
        _0x10d15d[_0xaac42e] = _0x4388f9;
        continue;
      }
      if (!_0x1baef3 && isConfiguredObjectStoragePublicUrl(_0x4388f9)) {
        _0x10d15d[_0xaac42e] = _0x4388f9;
        continue;
      }
      if (!_0x1a1163 && _0x185e9a === "apimart") {
        throw new Error("APIMART 不提供视频上传，请使用 RunningHub 上传或启用对象存储");
      }
      if (!_0x1a1163 && _0x185e9a === "runninghub" && isReusableRunningHubMediaUrl(_0x4388f9, _0x2ed9d3.apiUrl)) {
        _0x10d15d[_0xaac42e] = _0x4388f9;
        continue;
      }
      if (!_0x1a1163 && isCustomProviderAssetUploadProvider(_0x185e9a) && isReusableCustomProviderAssetUrl(_0x4388f9, _0x2ed9d3.apiUrl)) {
        _0x10d15d[_0xaac42e] = _0x4388f9;
        continue;
      }
      if (!_0x1a1163 && _0x185e9a === "runninghub" && isLocalVirtualMediaPath(_0x4388f9)) {
        const _0xd78b94 = guessVideoExtension(_0x4388f9);
        try {
          _0x10d15d[_0xaac42e] = await uploadLocalVideoToRunningHub(_0x4388f9, _0x395500, {
            ..._0x2ed9d3,
            filename: _0x2ed9d3.filename || "video." + _0xd78b94
          });
        } catch (_0x4e664a) {
          if (_0x45cd59 && getErrorStatus(_0x4e664a) === 413) {
            const _0x1b1a59 = Math.round(_0x75103f / 1024 / 1024);
            throw new Error(_0x2ed9d3.maxBytesMessage || "视频文件不能超过 " + _0x1b1a59 + "MB，请压缩或裁剪后再上传", {
              cause: _0x4e664a
            });
          }
          throw wrapInputVideoFetchError(_0x4e664a, _0xaac42e, _0x4388f9, _0x4388f9);
        }
        continue;
      }
      const _0x48e089 = await fetchInputVideoBlob(_0x4388f9, _0xaac42e, _0x2ed9d3);
      if (_0x45cd59 && Number(_0x48e089?.size || 0) > _0x75103f) {
        const _0x549453 = Math.round(_0x75103f / 1024 / 1024);
        throw new Error(_0x2ed9d3.maxBytesMessage || "视频文件不能超过 " + _0x549453 + "MB，请压缩或裁剪后再上传");
      }
      const _0x5d67e6 = guessVideoExtension(_0x4388f9);
      const _0x4b48d1 = _0x1a1163 || _0x185e9a === OBJECT_STORAGE_UPLOAD_PROVIDER ? await uploadPublicMediaToConfiguredObjectStorage("video", _0x48e089, {
        ..._0x2ed9d3,
        fileName: _0x2ed9d3.filename || "video." + _0x5d67e6
      }) : isCustomProviderAssetUploadProvider(_0x185e9a) ? await uploadToCustomProviderAsset(_0x48e089, _0x395500, {
        ..._0x2ed9d3,
        filename: _0x2ed9d3.filename || "video." + _0x5d67e6
      }) : await uploadVideoToRunningHub(_0x48e089, _0x395500, {
        ..._0x2ed9d3,
        filename: _0x2ed9d3.filename || "video." + _0x5d67e6
      });
      _0x10d15d[_0xaac42e] = _0x4b48d1;
    } catch (_0x20f70a) {
      if (_0x3d7b3f) {
        throw _0x20f70a;
      }
    }
  }
  return _0x10d15d;
}
function isReusableRunningHubMediaUrl(_0x235c7b, _0xe529ca = "") {
  try {
    const _0x12e53 = new URL(String(_0x235c7b || "").trim()).hostname;
    const _0x3ac4ab = new URL(String(_0xe529ca || "https://www.runninghub.cn").trim()).hostname;
    return _0x12e53 === _0x3ac4ab;
  } catch {
    return false;
  }
}
export async function processInputVideos(_0x521575, _0x2191cd, _0x147243 = {}) {
  const _0x4dc841 = await processInputVideosOrdered(_0x521575, _0x2191cd, {
    ..._0x147243,
    strictUpload: _0x147243.strictUpload !== false
  });
  return _0x4dc841.filter(Boolean);
}
export async function processInputVideosPreserveOrder(_0x1f03ad, _0x36ef78, _0x378425 = {}) {
  return await processInputVideosOrdered(_0x1f03ad, _0x36ef78, _0x378425);
}