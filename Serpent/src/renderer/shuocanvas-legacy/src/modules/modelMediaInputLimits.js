const MEDIA_KINDS = Object.freeze(["image", "video", "audio"]);
export const SEEDANCE2_INPUT_MAX_BY_KIND = Object.freeze({
  image: 9,
  video: 3,
  audio: 3
});
export const SEEDANCE25_INPUT_MAX_BY_KIND = Object.freeze({
  image: 30,
  video: 10,
  audio: 10
});
export const SEEDANCE2_MAX_TOTAL_DURATION_SECONDS_BY_KIND = Object.freeze({
  video: 15.09,
  audio: 15
});
export const SEEDANCE25_MAX_TOTAL_DURATION_SECONDS_BY_KIND = Object.freeze({
  video: 30,
  audio: 30
});
function normalizeUrl(_0x5ca066) {
  return String(_0x5ca066 || "").trim();
}
function normalizeDurationSeconds(..._0x597e38) {
  for (const _0x5758b8 of _0x597e38) {
    const _0xde7451 = Number(_0x5758b8);
    if (Number.isFinite(_0xde7451) && _0xde7451 > 0) {
      return _0xde7451;
    }
  }
  return 0;
}
function normalizeSizeBytes(..._0x2b3ecb) {
  for (const _0xdd326a of _0x2b3ecb) {
    const _0x39c40b = Number(_0xdd326a);
    if (Number.isFinite(_0x39c40b) && _0x39c40b > 0) {
      return _0x39c40b;
    }
  }
  return 0;
}
function collectUniqueUrls(_0x1420f5 = []) {
  return Array.from(new Set((Array.isArray(_0x1420f5) ? _0x1420f5 : []).map(normalizeUrl).filter(Boolean)));
}
function collectMediaStats(_0x107ccf = [], _0x16357b = []) {
  const _0x1997f6 = new Map(collectUniqueUrls(_0x107ccf).map(_0x384100 => [_0x384100, {
    url: _0x384100,
    duration: 0,
    sizeBytes: 0
  }]));
  for (const _0x2d4ca3 of Array.isArray(_0x16357b) ? _0x16357b : []) {
    const _0x153032 = normalizeUrl(_0x2d4ca3?.url);
    if (!_0x153032) {
      continue;
    }
    const _0x14e90a = normalizeDurationSeconds(_0x2d4ca3?.duration, _0x2d4ca3?.durationSeconds, _0x2d4ca3?.videoDuration, _0x2d4ca3?.audioDuration);
    const _0x4522b2 = normalizeSizeBytes(_0x2d4ca3?.sizeBytes, _0x2d4ca3?.fileSize, _0x2d4ca3?.byteSize);
    const _0x2bb186 = _0x1997f6.get(_0x153032) || {
      url: _0x153032,
      duration: 0,
      sizeBytes: 0
    };
    _0x1997f6.set(_0x153032, {
      url: _0x153032,
      duration: Math.max(_0x2bb186.duration, _0x14e90a),
      sizeBytes: Math.max(_0x2bb186.sizeBytes, _0x4522b2)
    });
  }
  const _0x1b7973 = Array.from(_0x1997f6.values()).map(Object.freeze);
  return Object.freeze({
    count: _0x1b7973.length,
    totalDurationSeconds: _0x1b7973.reduce((_0x2ccd08, _0x5a2b6f) => _0x2ccd08 + _0x5a2b6f.duration, 0),
    entries: Object.freeze(_0x1b7973)
  });
}
function readPositiveLimit(_0x1cdd51, _0x547d9f) {
  const _0x4204ad = Number(_0x1cdd51?.[_0x547d9f]);
  if (Number.isFinite(_0x4204ad) && _0x4204ad > 0) {
    return _0x4204ad;
  } else {
    return null;
  }
}
function getMediaExtension(_0x5d0441) {
  const _0x510c46 = normalizeUrl(_0x5d0441);
  if (!_0x510c46 || _0x510c46.startsWith("data:")) {
    return "";
  }
  const _0x5b3fd4 = [_0x510c46.split(/[?#]/, 1)[0]];
  try {
    const _0x124bb9 = new URL(_0x510c46, "https://local.invalid");
    for (const _0x92d77 of _0x124bb9.searchParams.values()) {
      _0x5b3fd4.push(_0x92d77);
    }
  } catch {}
  for (const _0x300baf of _0x5b3fd4) {
    let _0x33da01 = String(_0x300baf || "");
    try {
      _0x33da01 = decodeURIComponent(_0x33da01);
    } catch {}
    const _0x5371f2 = _0x33da01.toLowerCase().match(/\.([a-z0-9]+)(?:$|[?#])/);
    if (_0x5371f2?.[1]) {
      return _0x5371f2[1];
    }
  }
  return "";
}
function capitalizeKind(_0x28e0df) {
  return "" + _0x28e0df[0].toUpperCase() + _0x28e0df.slice(1);
}
export function validateModelMediaInputLimits({
  inputSlots = null,
  images = [],
  videos = [],
  audios = [],
  imageEntries = [],
  videoEntries = [],
  audioEntries = []
} = {}) {
  const _0x267425 = {
    image: collectMediaStats(images, imageEntries),
    video: collectMediaStats(videos, videoEntries),
    audio: collectMediaStats(audios, audioEntries)
  };
  const _0x2b0589 = inputSlots?.maxByKind;
  for (const _0x1e1073 of MEDIA_KINDS) {
    const _0x1ba4a0 = readPositiveLimit(_0x2b0589, _0x1e1073);
    const _0x314c42 = _0x267425[_0x1e1073].count;
    if (_0x1ba4a0 !== null && _0x314c42 > _0x1ba4a0) {
      return Object.freeze({
        ok: false,
        code: "max" + _0x1e1073[0].toUpperCase() + _0x1e1073.slice(1) + "s",
        kind: _0x1e1073,
        max: _0x1ba4a0,
        actual: _0x314c42
      });
    }
  }
  const _0x259864 = inputSlots?.mediaConstraintsByKind || {};
  for (const _0x2907f1 of MEDIA_KINDS) {
    const _0x5e104b = _0x259864?.[_0x2907f1];
    if (!_0x5e104b || typeof _0x5e104b !== "object") {
      continue;
    }
    const _0x5de6b8 = new Set((Array.isArray(_0x5e104b.allowedExtensions) ? _0x5e104b.allowedExtensions : []).map(_0x1acc00 => String(_0x1acc00 || "").trim().toLowerCase().replace(/^\./, "")).filter(Boolean));
    const _0x3a9917 = Number(_0x5e104b.minDurationSeconds);
    const _0x27ffaa = Number(_0x5e104b.maxDurationSeconds);
    const _0x219a4a = Number(_0x5e104b.maxBytes);
    for (const _0x4ddaf6 of _0x267425[_0x2907f1].entries) {
      if (Number.isFinite(_0x3a9917) && _0x3a9917 > 0 && _0x4ddaf6.duration > 0 && _0x4ddaf6.duration < _0x3a9917) {
        return Object.freeze({
          ok: false,
          code: "min" + capitalizeKind(_0x2907f1) + "Seconds",
          kind: _0x2907f1,
          min: _0x3a9917,
          actual: _0x4ddaf6.duration,
          url: _0x4ddaf6.url
        });
      }
      if (Number.isFinite(_0x27ffaa) && _0x27ffaa > 0 && _0x4ddaf6.duration > _0x27ffaa) {
        return Object.freeze({
          ok: false,
          code: "max" + capitalizeKind(_0x2907f1) + "Seconds",
          kind: _0x2907f1,
          max: _0x27ffaa,
          actual: _0x4ddaf6.duration,
          url: _0x4ddaf6.url
        });
      }
      const _0x36d785 = getMediaExtension(_0x4ddaf6.url);
      if (_0x5de6b8.size > 0 && _0x36d785 && !_0x5de6b8.has(_0x36d785)) {
        return Object.freeze({
          ok: false,
          code: "invalid" + capitalizeKind(_0x2907f1) + "Extension",
          kind: _0x2907f1,
          actual: _0x36d785,
          allowed: Array.from(_0x5de6b8).join(", "),
          url: _0x4ddaf6.url
        });
      }
      if (Number.isFinite(_0x219a4a) && _0x219a4a > 0 && _0x4ddaf6.sizeBytes > _0x219a4a) {
        return Object.freeze({
          ok: false,
          code: "max" + capitalizeKind(_0x2907f1) + "Megabytes",
          kind: _0x2907f1,
          max: _0x219a4a / 1048576,
          actual: _0x4ddaf6.sizeBytes / 1048576,
          url: _0x4ddaf6.url
        });
      }
    }
  }
  const _0x29afed = inputSlots?.maxTotalDurationSecondsByKind;
  for (const _0x55b463 of ["video", "audio"]) {
    const _0x517721 = readPositiveLimit(_0x29afed, _0x55b463);
    const _0x14d157 = _0x267425[_0x55b463].totalDurationSeconds;
    if (_0x517721 !== null && _0x14d157 > _0x517721) {
      return Object.freeze({
        ok: false,
        code: "maxTotal" + _0x55b463[0].toUpperCase() + _0x55b463.slice(1) + "Seconds",
        kind: _0x55b463,
        max: _0x517721,
        actual: _0x14d157
      });
    }
  }
  return Object.freeze({
    ok: true,
    statsByKind: Object.freeze(_0x267425)
  });
}