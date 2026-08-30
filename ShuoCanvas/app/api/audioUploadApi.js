import { buildApiUrl } from "./apiBase.js";
import { post as a50_0x37bd2d, get as a50_0x34876 } from "./requester.js";
import { isCustomProviderAssetUploadProvider, isReusableCustomProviderAssetUrl, uploadToCustomProviderAsset } from "./customProviderAssetUploadApi.js";
import { createRunningHubMediaUploadApiKeyMissingError } from "./mediaUploadErrors.js";
import { isConfiguredObjectStorageEnabled, isConfiguredObjectStoragePublicUrl, OBJECT_STORAGE_UPLOAD_PROVIDER, uploadPublicMediaToConfiguredObjectStorage } from "./objectStorageApi.js";
import { getRunningHubUploadErrorMessage, getRunningHubUploadUrl, hasRunningHubUploadFailureCode } from "./runningHubUploadResponse.js";
export async function uploadAudioToRunningHub(_0xa1fa97, _0x3290dd, _0x133565 = {}) {
  if (isConfiguredObjectStorageEnabled()) {
    return await uploadPublicMediaToConfiguredObjectStorage("audio", _0xa1fa97, _0x133565);
  }
  if (!_0x3290dd) {
    throw createRunningHubMediaUploadApiKeyMissingError("audio");
  }
  if (!_0xa1fa97) {
    throw new Error("音频文件不能为空");
  }
  const _0x669796 = String(_0x133565.apiUrl || "https://www.runninghub.cn").trim().replace(/\/+$/, "");
  const _0x521eea = _0x669796 + "/openapi/v2/media/upload/binary";
  const _0x58f404 = buildApiUrl("/api/v2/proxy/upload?apiUrl=" + encodeURIComponent(_0x521eea));
  const _0x53ee41 = new FormData();
  const _0x425269 = _0xa1fa97.name || _0x133565.filename || "audio.mp3";
  _0x53ee41.append("file", _0xa1fa97, _0x425269);
  const _0x48fa58 = await a50_0x37bd2d(_0x58f404, _0x53ee41, {
    headers: {
      Authorization: "Bearer " + _0x3290dd
    },
    provider: "runninghub",
    buildUrl: false
  });
  if (hasRunningHubUploadFailureCode(_0x48fa58)) {
    throw new Error("RunningHUB 音频上传失败: " + getRunningHubUploadErrorMessage(_0x48fa58));
  }
  const _0x44884e = getRunningHubUploadUrl(_0x48fa58);
  if (!_0x44884e) {
    throw new Error("RunningHUB 返回的音频URL为空");
  }
  return _0x44884e;
}
const HTTP_URL_RE = /^https?:\/\//i;
const INLINE_MEDIA_URL_RE = /^(?:blob|data):/i;
function isHttpUrl(_0x1858a6) {
  return HTTP_URL_RE.test(String(_0x1858a6 || ""));
}
function isProviderAssetIdentifier(_0x557260) {
  return /^asset:\/\//i.test(String(_0x557260 || "").trim());
}
function isLocalAudioPath(_0x4a7361) {
  const _0x45328b = String(_0x4a7361 || "").trim();
  return !!_0x45328b && !isHttpUrl(_0x45328b) && !INLINE_MEDIA_URL_RE.test(_0x45328b);
}
function encodeLocalPathSegment(_0x5df37d) {
  if (!_0x5df37d) {
    return "";
  }
  try {
    return encodeURIComponent(decodeURIComponent(_0x5df37d));
  } catch {
    return encodeURIComponent(_0x5df37d);
  }
}
function splitLocalPathQuery(_0x3896fe) {
  const _0x1a90ab = _0x3896fe.indexOf("?");
  if (_0x1a90ab < 0) {
    return {
      pathname: _0x3896fe,
      suffix: ""
    };
  }
  return {
    pathname: _0x3896fe.slice(0, _0x1a90ab),
    suffix: _0x3896fe.slice(_0x1a90ab)
  };
}
function buildInputAudioFetchUrl(_0x510cdc) {
  const _0x2fefca = String(_0x510cdc || "").trim();
  if (!isLocalAudioPath(_0x2fefca)) {
    return _0x2fefca;
  }
  const {
    pathname: _0x2f8ec7,
    suffix: _0x4929d0
  } = splitLocalPathQuery(_0x2fefca);
  const _0x4b310a = _0x2f8ec7.startsWith("/") ? _0x2f8ec7 : "/" + _0x2f8ec7;
  const _0x2e4918 = _0x4b310a.split("/").map((_0x10cf6a, _0x5c92ca) => _0x5c92ca === 0 ? "" : encodeLocalPathSegment(_0x10cf6a)).join("/");
  return buildApiUrl("" + _0x2e4918 + _0x4929d0);
}
function getErrorStatus(_0x5a2fe4) {
  const _0x494bde = _0x5a2fe4?.status ?? _0x5a2fe4?.statusCode ?? _0x5a2fe4?.httpStatus;
  const _0x1d2210 = Number(_0x494bde);
  if (Number.isFinite(_0x1d2210)) {
    return _0x1d2210;
  } else {
    return 0;
  }
}
function isNotFoundAudioFetchError(_0x525ff7) {
  const _0xdd442d = String(_0x525ff7?.message || _0x525ff7 || "");
  return getErrorStatus(_0x525ff7) === 404 || /\b404\b/.test(_0xdd442d) || /File not found/i.test(_0xdd442d);
}
function wrapInputAudioFetchError(_0x5266dc, _0x5a4ed2, _0x41677e, _0x28f536) {
  if (!isLocalAudioPath(_0x41677e) || !isNotFoundAudioFetchError(_0x5266dc)) {
    return _0x5266dc;
  }
  const _0x5c0f92 = new Error("第 " + (_0x5a4ed2 + 1) + " 个参考音频本地文件不存在或无法访问，请重新选择或重新上传该音频：" + _0x41677e);
  _0x5c0f92.name = "InputAudioFetchError";
  _0x5c0f92.status = 404;
  _0x5c0f92.fetchUrl = _0x28f536;
  _0x5c0f92.cause = _0x5266dc;
  return _0x5c0f92;
}
async function fetchInputAudioBlob(_0xe30065, _0x46e640) {
  const _0xb470f8 = buildInputAudioFetchUrl(_0xe30065);
  try {
    return await a50_0x34876(_0xb470f8, {
      provider: "remote",
      buildUrl: false,
      responseType: "blob"
    });
  } catch (_0x230d86) {
    throw wrapInputAudioFetchError(_0x230d86, _0x46e640, _0xe30065, _0xb470f8);
  }
}
function guessAudioExtension(_0x4045d0, _0x71588 = "mp3") {
  try {
    const _0x5910ac = String(_0x4045d0 || "");
    const _0x3ca988 = new URL(isHttpUrl(_0x5910ac) ? _0x5910ac : buildInputAudioFetchUrl(_0x5910ac), "https://local.invalid");
    const _0xef4ff = String(_0x3ca988.pathname || "").split("/").pop() || "";
    const _0x5577a3 = _0xef4ff.includes(".") ? _0xef4ff.split(".").pop().toLowerCase() : "";
    if (/^(mp3|wav|m4a|aac|ogg|flac|webm|mp4)$/.test(_0x5577a3)) {
      return _0x5577a3;
    }
  } catch {}
  return _0x71588;
}
function isReusableRunningHubMediaUrl(_0x20a96e, _0x584c40 = "") {
  try {
    const _0x394e8b = new URL(String(_0x20a96e || "").trim()).hostname;
    const _0x45210c = new URL(String(_0x584c40 || "https://www.runninghub.cn").trim()).hostname;
    return _0x394e8b === _0x45210c;
  } catch {
    return false;
  }
}
async function processInputAudiosOrdered(_0x3dbf53, _0x2bbb14, _0x22f329 = {}) {
  if (!_0x3dbf53 || _0x3dbf53.length === 0) {
    return [];
  }
  const _0x2af767 = String(_0x22f329.provider || "runninghub").trim().toLowerCase();
  const _0x17670f = _0x22f329.forceProviderUpload === true;
  const _0x290646 = isConfiguredObjectStorageEnabled() && !_0x17670f;
  const _0x17a3a9 = _0x22f329.strictUpload === true;
  const _0x4d5ccd = Number(_0x22f329.maxBytes);
  const _0x93a64f = Number.isFinite(_0x4d5ccd) && _0x4d5ccd > 0;
  const _0x1e6317 = new Array(_0x3dbf53.length).fill("");
  for (let _0xf4b258 = 0; _0xf4b258 < _0x3dbf53.length; _0xf4b258++) {
    const _0x52e461 = String(_0x3dbf53[_0xf4b258] || "").trim();
    if (!_0x52e461) {
      continue;
    }
    try {
      if (isProviderAssetIdentifier(_0x52e461)) {
        _0x1e6317[_0xf4b258] = _0x52e461;
        continue;
      }
      if (!_0x17670f && isConfiguredObjectStoragePublicUrl(_0x52e461)) {
        _0x1e6317[_0xf4b258] = _0x52e461;
        continue;
      }
      if (!_0x290646 && _0x2af767 === "apimart") {
        throw new Error("APIMART 不提供音频上传，请使用 RunningHub 上传或启用对象存储");
      }
      if (!_0x290646 && isCustomProviderAssetUploadProvider(_0x2af767) && isReusableCustomProviderAssetUrl(_0x52e461, _0x22f329.apiUrl)) {
        _0x1e6317[_0xf4b258] = _0x52e461;
        continue;
      }
      if (!_0x290646 && _0x2af767 === "runninghub" && isReusableRunningHubMediaUrl(_0x52e461, _0x22f329.apiUrl)) {
        _0x1e6317[_0xf4b258] = _0x52e461;
        continue;
      }
      const _0x2f5ec3 = await fetchInputAudioBlob(_0x52e461, _0xf4b258);
      if (_0x93a64f && Number(_0x2f5ec3?.size || 0) > _0x4d5ccd) {
        const _0x4d4abe = Math.round(_0x4d5ccd / 1024 / 1024);
        throw new Error(_0x22f329.maxBytesMessage || "音频文件不能超过 " + _0x4d4abe + "MB，请压缩后再上传");
      }
      const _0x464873 = guessAudioExtension(_0x52e461);
      const _0x523d2c = _0x290646 || _0x2af767 === OBJECT_STORAGE_UPLOAD_PROVIDER ? await uploadPublicMediaToConfiguredObjectStorage("audio", _0x2f5ec3, {
        ..._0x22f329,
        fileName: _0x22f329.filename || "audio." + _0x464873
      }) : isCustomProviderAssetUploadProvider(_0x2af767) ? await uploadToCustomProviderAsset(_0x2f5ec3, _0x2bbb14, {
        ..._0x22f329,
        filename: _0x22f329.filename || "audio." + _0x464873
      }) : await uploadAudioToRunningHub(_0x2f5ec3, _0x2bbb14, {
        ..._0x22f329,
        filename: _0x22f329.filename || "audio." + _0x464873
      });
      _0x1e6317[_0xf4b258] = _0x523d2c;
    } catch (_0x592652) {
      if (_0x17a3a9) {
        throw _0x592652;
      }
    }
  }
  return _0x1e6317;
}
export async function processInputAudios(_0x493aca, _0x3bda2e, _0x172ac9 = {}) {
  const _0x56a763 = await processInputAudiosOrdered(_0x493aca, _0x3bda2e, _0x172ac9);
  return _0x56a763.filter(Boolean);
}
export async function processInputAudiosPreserveOrder(_0x2398d9, _0xbcc218, _0x4f5073 = {}) {
  return await processInputAudiosOrdered(_0x2398d9, _0xbcc218, _0x4f5073);
}