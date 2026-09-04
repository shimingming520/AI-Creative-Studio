import { buildGenerationSingleResultPatch, firstNonEmptyString, getFirstGenerationResultError, normalizeGenerationResultItems } from "../../core/generationResultRenderer.js";
import { buildCanvasLocalAudioFields } from "../../services/canvasMediaLocalService.js";
import { normalizeLocalPath, pickResultLocalPath } from "../../utils/localMediaPath.js";
import { pickAudioDurationSec } from "../../services/audioMetadataService.js";
import { t } from "../../i18n/index.js";
function audioGenerationResultText(_0x3d631a, _0x2fa225 = {}) {
  return t("audioGenerationResult." + _0x3d631a, _0x2fa225);
}
function asObject(_0x1d71ed) {
  if (_0x1d71ed && typeof _0x1d71ed === "object" && !Array.isArray(_0x1d71ed)) {
    return _0x1d71ed;
  } else {
    return null;
  }
}
function isLikelyImageUrl(_0x1058cb) {
  const _0x5292ac = String(_0x1058cb || "").trim();
  if (!_0x5292ac) {
    return false;
  }
  if (/^data:image\//i.test(_0x5292ac)) {
    return true;
  }
  return /\.(png|jpe?g|webp|gif|bmp|svg|avif)(\?|#|$)/i.test(_0x5292ac);
}
function normalizeAudioGenerationResultItem(_0x11bd0f) {
  const _0x439f54 = asObject(_0x11bd0f);
  if (!_0x439f54) {
    throw new Error("[audioGenerationResult] item must be an object");
  }
  const _0x47386b = firstNonEmptyString(_0x439f54.audioUrl, _0x439f54.url, _0x439f54.src, _0x439f54.resultUrl);
  const _0x2f7643 = {
    ..._0x439f54,
    outputType: "audio",
    audioUrl: isLikelyImageUrl(_0x47386b) ? "" : _0x47386b,
    localPath: "",
    metadata: _0x439f54.metadata && typeof _0x439f54.metadata === "object" ? {
      ..._0x439f54.metadata
    } : {}
  };
  const _0x21af90 = firstNonEmptyString(_0x439f54.localPath, pickResultLocalPath(_0x439f54));
  if (!isLikelyImageUrl(_0x21af90)) {
    _0x2f7643.localPath = _0x21af90;
  }
  const _0x4250a2 = pickAudioDurationSec(_0x439f54.audioDuration, _0x439f54.duration, _0x439f54.metadata?.audioDuration, _0x439f54.metadata?.duration);
  if (_0x4250a2 > 0) {
    _0x2f7643.audioDuration = _0x4250a2;
  }
  const _0x37f39d = firstNonEmptyString(_0x439f54.error);
  if (_0x37f39d) {
    _0x2f7643.error = _0x37f39d;
  }
  return _0x2f7643;
}
export function normalizeAudioGenerationResult(_0x8f2d8) {
  const _0x3d00ee = normalizeGenerationResultItems(_0x8f2d8, {
    collectionField: "audios",
    singleItemFields: ["audioUrl", "url", "src", "resultUrl", "localPath"]
  });
  if (_0x3d00ee.length === 0) {
    return {
      outputType: "audio",
      items: []
    };
  }
  return {
    outputType: "audio",
    items: _0x3d00ee.map(_0x16028d => normalizeAudioGenerationResultItem(_0x16028d)).filter(_0x177723 => firstNonEmptyString(_0x177723?.error) || firstNonEmptyString(_0x177723?.audioUrl, _0x177723?.localPath))
  };
}
export function getAudioGenerationResultError(_0x4d04cb) {
  return getFirstGenerationResultError(_0x4d04cb?.outputType === "audio" && Array.isArray(_0x4d04cb.items) ? _0x4d04cb.items : _0x4d04cb, {
    collectionField: "audios",
    singleItemFields: ["audioUrl", "url", "src", "resultUrl", "localPath"]
  });
}
export function getSuccessfulAudioGenerationItems(_0x59f110) {
  const _0xc73d89 = _0x59f110?.outputType === "audio" && Array.isArray(_0x59f110.items) ? _0x59f110 : normalizeAudioGenerationResult(_0x59f110);
  return _0xc73d89.items.filter(_0x8798a4 => _0x8798a4 && !_0x8798a4.error);
}
function buildAudioItemPatch(_0x4e0824) {
  const _0x22fc13 = {
    audioUrl: _0x4e0824.audioUrl,
    src: _0x4e0824.src,
    localPath: _0x4e0824.localPath
  };
  for (const _0x11536e of ["waveformLocalPath", "assetId", "derivativeStatus", "fileName", "audioDuration"]) {
    if (_0x4e0824[_0x11536e] !== undefined) {
      _0x22fc13[_0x11536e] = _0x4e0824[_0x11536e];
    }
  }
  return _0x22fc13;
}
async function resolvePersistedAudioItem(_0x5270e9, _0x24ec16) {
  const _0x529dc1 = firstNonEmptyString(_0x5270e9?.audioUrl);
  let _0x3bb68d = firstNonEmptyString(_0x5270e9?.localPath);
  let _0x4e94f8 = null;
  if (!_0x3bb68d && _0x529dc1) {
    if (typeof _0x24ec16 !== "function") {
      throw new Error(audioGenerationResultText("localSaveFailed"));
    }
    _0x4e94f8 = await _0x24ec16(_0x529dc1);
    _0x3bb68d = normalizeLocalPath(_0x4e94f8?.localPath || "");
  }
  const _0x1e94a3 = buildCanvasLocalAudioFields({
    ..._0x5270e9,
    ...(_0x4e94f8 && typeof _0x4e94f8 === "object" ? _0x4e94f8 : {}),
    localPath: _0x3bb68d,
    audioUrl: _0x529dc1
  });
  if (!_0x1e94a3.audioUrl || !_0x1e94a3.localPath) {
    throw new Error(audioGenerationResultText("localSaveFailed"));
  }
  return {
    ..._0x5270e9,
    ...(_0x4e94f8 && typeof _0x4e94f8 === "object" ? _0x4e94f8 : {}),
    ..._0x1e94a3,
    audioDuration: pickAudioDurationSec(_0x5270e9?.audioDuration, _0x5270e9?.duration, _0x4e94f8?.audioDuration, _0x4e94f8?.duration) || undefined
  };
}
function resolveLocalAudioItem(_0x2895e6) {
  if (firstNonEmptyString(_0x2895e6?.error)) {
    return _0x2895e6;
  }
  const _0x286b05 = buildCanvasLocalAudioFields(_0x2895e6);
  if (!_0x286b05.audioUrl || !_0x286b05.localPath) {
    throw new Error(audioGenerationResultText("missingLocalAudioPath"));
  }
  return {
    ..._0x2895e6,
    ..._0x286b05
  };
}
function buildAudioPatchFromItem(_0x54ccf7, {
  startedAt = 0,
  duration = null
} = {}) {
  return buildGenerationSingleResultPatch({
    outputType: "audio",
    items: [_0x54ccf7]
  }, {
    startedAt: startedAt,
    duration: duration,
    buildItemPatch: buildAudioItemPatch,
    extraPatch: {
      rhStatusMessage: null,
      rhStatusCode: null
    }
  });
}
export function buildLocalAudioGenerationResultPatch(_0x46278d, {
  startedAt = 0,
  duration = null
} = {}) {
  const _0x11421b = _0x46278d?.outputType === "audio" && Array.isArray(_0x46278d.items) ? _0x46278d : normalizeAudioGenerationResult(_0x46278d);
  if (_0x11421b.items.length === 0) {
    return null;
  }
  return buildAudioPatchFromItem(resolveLocalAudioItem(_0x11421b.items[0]), {
    startedAt: startedAt,
    duration: duration
  });
}
export async function buildAudioGenerationResultPatch(_0xb75b7e, {
  startedAt = 0,
  duration = null,
  persistAudioOutput: _0x3a7b04
} = {}) {
  const _0x50f7f8 = _0xb75b7e?.outputType === "audio" && Array.isArray(_0xb75b7e.items) ? _0xb75b7e : normalizeAudioGenerationResult(_0xb75b7e);
  if (_0x50f7f8.items.length === 0) {
    return null;
  }
  const _0xd6f483 = _0x50f7f8.items[0];
  if (firstNonEmptyString(_0xd6f483?.error)) {
    return buildAudioPatchFromItem(_0xd6f483, {
      startedAt: startedAt,
      duration: duration
    });
  }
  const _0x3bd93a = _0x50f7f8.items.filter(_0x4c0270 => _0x4c0270 && !firstNonEmptyString(_0x4c0270?.error));
  const _0x58e36e = [];
  for (const _0x57c790 of _0x3bd93a) {
    _0x58e36e.push(await resolvePersistedAudioItem(_0x57c790, _0x3a7b04));
  }
  if (_0x58e36e.length === 0) {
    return null;
  }
  const _0x42d4d8 = buildAudioPatchFromItem(_0x58e36e[0], {
    startedAt: startedAt,
    duration: duration
  });
  if (_0x58e36e.length > 1) {
    _0x42d4d8.audios = _0x58e36e.map(_0x4ae4e8 => buildAudioItemPatch(_0x4ae4e8));
    _0x42d4d8.mainAudioIndex = 0;
    _0x42d4d8.isAudiosExpanded = false;
  }
  return _0x42d4d8;
}