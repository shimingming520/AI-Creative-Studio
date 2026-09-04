export const STORY_MAX_SPOKEN_UNITS_PER_SECOND = 4;
function normalizeText(_0x45ea60) {
  return String(_0x45ea60 || "").trim();
}
function getSpeakerParts(_0xf62ccb = "") {
  const _0xeb5c62 = String(_0xf62ccb || "").match(/^([^：:\n]{1,20}[：:]\s*)([\s\S]*)$/u);
  return {
    prefix: _0xeb5c62?.[1] || "",
    body: _0xeb5c62?.[2] ?? String(_0xf62ccb || "")
  };
}
export function countStorySpokenUnits(_0x1afb37 = "") {
  const _0x5b8ea8 = String(_0x1afb37 || "").split(/\r?\n/u).map(_0x1a212c => getSpeakerParts(_0x1a212c).body).join("\n").replace(/[“”"'‘’。，、！？!?；;：:\s…—-]/gu, "");
  const _0x43549b = (_0x5b8ea8.match(/[\p{Script=Han}]/gu) || []).length;
  const _0x1297c6 = (_0x5b8ea8.match(/[A-Za-z0-9]+/g) || []).length;
  return _0x43549b + _0x1297c6;
}
function splitAtAuthoredPauses(_0x4b2836 = "") {
  const _0x35ecdc = [...String(_0x4b2836 || "")];
  const _0x3bce0e = [];
  let _0x1b066d = "";
  for (let _0x394374 = 0; _0x394374 < _0x35ecdc.length; _0x394374 += 1) {
    const _0xc3f099 = _0x35ecdc[_0x394374];
    _0x1b066d += _0xc3f099;
    const _0x9ec4dd = /[。！？!?；;，,]/u.test(_0xc3f099) || _0xc3f099 === "…" && _0x35ecdc[_0x394374 + 1] !== "…" || _0xc3f099 === "—" && _0x35ecdc[_0x394374 + 1] !== "—";
    if (_0x9ec4dd && _0x1b066d.trim()) {
      _0x3bce0e.push(_0x1b066d);
      _0x1b066d = "";
    }
  }
  if (_0x1b066d.trim()) {
    _0x3bce0e.push(_0x1b066d);
  }
  if (_0x3bce0e.length) {
    return _0x3bce0e;
  } else {
    return [String(_0x4b2836 || "")];
  }
}
function hardSplitSpokenPart(_0x351d35, _0x546e00) {
  const _0x7c7ba7 = [];
  let _0x2da24a = "";
  for (const _0x4db59a of [...String(_0x351d35 || "")]) {
    const _0x2d84be = "" + _0x2da24a + _0x4db59a;
    if (_0x2da24a && countStorySpokenUnits(_0x2d84be) > _0x546e00) {
      _0x7c7ba7.push(_0x2da24a);
      _0x2da24a = _0x4db59a;
    } else {
      _0x2da24a = _0x2d84be;
    }
  }
  if (_0x2da24a) {
    _0x7c7ba7.push(_0x2da24a);
  }
  return _0x7c7ba7;
}
function splitSpokenLine(_0x16b5b7, _0x3b5683) {
  const {
    prefix: _0x7463f,
    body: _0x22b21a
  } = getSpeakerParts(_0x16b5b7);
  const _0xb124e3 = splitAtAuthoredPauses(_0x22b21a).flatMap(_0x144d59 => countStorySpokenUnits(_0x144d59) > _0x3b5683 ? hardSplitSpokenPart(_0x144d59, _0x3b5683) : [_0x144d59]);
  const _0x18ce48 = [];
  let _0x392acc = "";
  _0xb124e3.forEach(_0x356f92 => {
    const _0x5d2b6c = "" + _0x392acc + _0x356f92;
    if (_0x392acc && countStorySpokenUnits(_0x5d2b6c) > _0x3b5683) {
      _0x18ce48.push(_0x392acc);
      _0x392acc = _0x356f92;
    } else {
      _0x392acc = _0x5d2b6c;
    }
  });
  if (_0x392acc) {
    _0x18ce48.push(_0x392acc);
  }
  return _0x18ce48.map(_0x11461a => "" + _0x7463f + _0x11461a);
}
function splitSpokenText(_0x246b1a, _0x4fea1b) {
  return String(_0x246b1a || "").split(/\r?\n/u).map(_0x4f74bf => _0x4f74bf.trim()).filter(Boolean).flatMap(_0x51213c => splitSpokenLine(_0x51213c, _0x4fea1b));
}
function splitImpossibleSpokenShot(_0x195951 = {}, {
  maxClipDurationSeconds: _0x1ae854,
  maxSpokenUnitsPerSecond: _0x1b1da0
}) {
  const _0x2392e3 = Math.max(0, Number(_0x195951?.durationSec) || 0);
  const _0x378a02 = ["dialogue", "voiceover"].filter(_0x5b9634 => normalizeText(_0x195951?.[_0x5b9634]));
  if (_0x378a02.length !== 1 || !_0x2392e3) {
    return [_0x195951];
  }
  const _0x67f001 = _0x378a02[0];
  const _0x1fdd88 = countStorySpokenUnits(_0x195951[_0x67f001]);
  if (_0x1fdd88 < 8 || _0x1fdd88 / _0x2392e3 <= _0x1b1da0) {
    return [_0x195951];
  }
  const _0x2d7994 = Math.max(1, Math.floor(_0x1ae854 * _0x1b1da0));
  const _0x282417 = splitSpokenText(_0x195951[_0x67f001], _0x2d7994).filter(normalizeText);
  if (!_0x282417.length) {
    return [_0x195951];
  }
  return _0x282417.map(_0x3acc3d => ({
    ..._0x195951,
    durationSec: Math.max(1, Math.ceil(countStorySpokenUnits(_0x3acc3d) / _0x1b1da0)),
    [_0x67f001]: _0x3acc3d
  }));
}
function finalizeClipShots(_0x250569 = []) {
  let _0xa44252 = 0;
  return _0x250569.map(_0x52b559 => {
    const _0x279c87 = Math.max(0, Number(_0x52b559?.durationSec) || 0);
    const _0x18f5f0 = Object.hasOwn(_0x52b559 || {}, "startSec") || Object.hasOwn(_0x52b559 || {}, "endSec");
    const _0x2c30c4 = _0x18f5f0 ? {
      ..._0x52b559,
      startSec: _0xa44252,
      endSec: _0xa44252 + _0x279c87
    } : _0x52b559;
    _0xa44252 += _0x279c87;
    return _0x2c30c4;
  });
}
function buildTimedClip(_0x55d556, _0x4dab21, _0x368fde) {
  const _0x5b6ab6 = finalizeClipShots(_0x4dab21);
  const _0x4b5731 = _0x5b6ab6.reduce((_0x4a1846, _0x5ac8f0) => _0x4a1846 + Math.max(0, Number(_0x5ac8f0?.durationSec) || 0), 0);
  const _0x398628 = _0x5b6ab6.flatMap(_0x3b6733 => [normalizeText(_0x3b6733?.visual), normalizeText(_0x3b6733?.dialogue), normalizeText(_0x3b6733?.voiceover)]).filter(Boolean).join("；");
  return {
    ..._0x55d556,
    ref: _0x368fde,
    script: _0x398628 || _0x55d556.script,
    shots: _0x5b6ab6,
    durationSec: _0x4b5731,
    ...(Object.hasOwn(_0x55d556 || {}, "contentDurationSec") ? {
      contentDurationSec: _0x4b5731
    } : {}),
    assetRefs: [...new Set(_0x5b6ab6.flatMap(_0x33d7d1 => _0x33d7d1?.assetRefs || []))]
  };
}
export function normalizeStoryEpisodeSpokenTiming(_0x1b6d54 = [], {
  maxClipDurationSeconds = 15,
  maxSpokenUnitsPerSecond = STORY_MAX_SPOKEN_UNITS_PER_SECOND
} = {}) {
  const _0x3945a7 = Math.max(1, Number(maxClipDurationSeconds) || 15);
  const _0x31a4f2 = Math.max(0.1, Number(maxSpokenUnitsPerSecond) || STORY_MAX_SPOKEN_UNITS_PER_SECOND);
  return (Array.isArray(_0x1b6d54) ? _0x1b6d54 : []).flatMap((_0x47b3d5, _0x85d604) => {
    const _0x4267c1 = Array.isArray(_0x47b3d5?.shots) ? _0x47b3d5.shots : [];
    const _0x201f98 = _0x4267c1.flatMap(_0x276aeb => splitImpossibleSpokenShot(_0x276aeb, {
      maxClipDurationSeconds: _0x3945a7,
      maxSpokenUnitsPerSecond: _0x31a4f2
    }));
    const _0x57b131 = _0x201f98.length !== _0x4267c1.length || _0x201f98.some((_0x218bb7, _0x585815) => _0x218bb7 !== _0x4267c1[_0x585815]);
    if (!_0x57b131) {
      return [_0x47b3d5];
    }
    const _0x2aa6a1 = [];
    let _0x229806 = [];
    let _0x26ff21 = 0;
    _0x201f98.forEach(_0x233159 => {
      const _0x3d5eec = Math.max(0, Number(_0x233159?.durationSec) || 0);
      if (_0x229806.length && _0x26ff21 + _0x3d5eec > _0x3945a7) {
        _0x2aa6a1.push(_0x229806);
        _0x229806 = [];
        _0x26ff21 = 0;
      }
      _0x229806.push(_0x233159);
      _0x26ff21 += _0x3d5eec;
    });
    if (_0x229806.length) {
      _0x2aa6a1.push(_0x229806);
    }
    const _0x1ef813 = normalizeText(_0x47b3d5?.ref) || "clip-" + (_0x85d604 + 1);
    return _0x2aa6a1.map((_0x318de4, _0x10f3da) => buildTimedClip(_0x47b3d5, _0x318de4, _0x2aa6a1.length === 1 ? _0x1ef813 : _0x1ef813 + "-timing-" + (_0x10f3da + 1)));
  });
}