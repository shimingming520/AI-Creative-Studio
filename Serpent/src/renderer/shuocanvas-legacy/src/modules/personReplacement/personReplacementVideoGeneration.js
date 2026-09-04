import { getRecoverablePersonReplacementGenerationTask, isPersonReplacementGenerationTaskActive, normalizePersonReplacementGenerationTaskIdentity } from "./personReplacementGenerationTaskIdentity.js";
const PERSON_REPLACEMENT_VIDEO_GENERATION_STATUSES = new Set(["idle", "queued", "submitting", "running", "succeeded", "failed"]);
function normalizeText(_0x26b89a) {
  return String(_0x26b89a ?? "").trim();
}
export function isPersonReplacementVideoGenerationActive(_0x5d04ba) {
  return isPersonReplacementGenerationTaskActive(_0x5d04ba);
}
export function normalizePersonReplacementVideoGenerationState(_0x4ae283 = {}, _0x5cddfe = "") {
  const _0x1be181 = _0x4ae283 && typeof _0x4ae283 === "object" && !Array.isArray(_0x4ae283) ? _0x4ae283 : {};
  const _0x5514c4 = normalizeText(_0x1be181.status).toLowerCase();
  const _0x45bee0 = normalizeText(_0x1be181.requestId);
  const _0x4bf3ab = normalizePersonReplacementGenerationTaskIdentity(_0x1be181);
  const _0x281322 = Number(_0x1be181.queueIndex);
  const _0x161015 = Number(_0x1be181.queueLength);
  return {
    status: PERSON_REPLACEMENT_VIDEO_GENERATION_STATUSES.has(_0x5514c4) ? _0x5514c4 : "idle",
    shotId: normalizeText(_0x1be181.shotId) || normalizeText(_0x5cddfe),
    error: normalizeText(_0x1be181.error),
    ...(_0x45bee0 ? {
      requestId: _0x45bee0
    } : {}),
    ..._0x4bf3ab,
    ...(Number.isFinite(_0x281322) ? {
      queueIndex: _0x281322
    } : {}),
    ...(Number.isFinite(_0x161015) && _0x161015 >= 0 ? {
      queueLength: _0x161015
    } : {})
  };
}
export function getRecoverablePersonReplacementVideoTask(_0x5d19ae = {}) {
  return getRecoverablePersonReplacementGenerationTask(normalizePersonReplacementVideoGenerationState(_0x5d19ae));
}
export function normalizePersonReplacementVideoGenerationsByShotId(_0x5f0dde = {}, _0x12cc5a = [], _0x4258be = {}) {
  const _0x2787b1 = new Set((Array.isArray(_0x12cc5a) ? _0x12cc5a : []).map(_0x2c9598 => normalizeText(_0x2c9598?.id)).filter(Boolean));
  const _0x9c149b = _0x5f0dde && typeof _0x5f0dde === "object" && !Array.isArray(_0x5f0dde) ? _0x5f0dde : {};
  const _0x51e0a8 = Object.fromEntries(Object.entries(_0x9c149b).flatMap(([_0x21026f, _0x466a61]) => {
    const _0x4f4b35 = normalizeText(_0x21026f);
    if (!_0x2787b1.has(_0x4f4b35)) {
      return [];
    }
    return [[_0x4f4b35, normalizePersonReplacementVideoGenerationState(_0x466a61, _0x4f4b35)]];
  }));
  const _0x4dd5f1 = normalizePersonReplacementVideoGenerationState(_0x4258be);
  if (_0x2787b1.has(_0x4dd5f1.shotId) && !_0x51e0a8[_0x4dd5f1.shotId]) {
    _0x51e0a8[_0x4dd5f1.shotId] = _0x4dd5f1;
  }
  return _0x51e0a8;
}
export function resolvePersonReplacementVideoGenerationState(_0x4ed14c = {}, _0xea41e3 = "") {
  const _0x13b97f = normalizeText(_0xea41e3);
  const _0x370178 = _0x4ed14c?.videoGenerationsByShotId?.[_0x13b97f];
  if (_0x370178 && typeof _0x370178 === "object") {
    return normalizePersonReplacementVideoGenerationState(_0x370178, _0x13b97f);
  }
  const _0x5a7077 = normalizePersonReplacementVideoGenerationState(_0x4ed14c?.videoGeneration);
  if (_0x5a7077.shotId === _0x13b97f) {
    return _0x5a7077;
  } else {
    return normalizePersonReplacementVideoGenerationState({}, _0x13b97f);
  }
}
export function updatePersonReplacementVideoGenerationState(_0x45fea1 = {}, _0x1d151d = {}) {
  const _0xb80add = normalizePersonReplacementVideoGenerationState(_0x1d151d);
  if (!_0xb80add.shotId) {
    return {
      ..._0x45fea1
    };
  }
  const _0x3ac2ef = {
    ...(_0x45fea1?.videoGenerationsByShotId && typeof _0x45fea1.videoGenerationsByShotId === "object" && !Array.isArray(_0x45fea1.videoGenerationsByShotId) ? _0x45fea1.videoGenerationsByShotId : {}),
    [_0xb80add.shotId]: _0xb80add
  };
  const _0xf50aa4 = normalizePersonReplacementVideoGenerationState(_0x45fea1?.videoGeneration);
  const _0x3dd1f0 = isPersonReplacementVideoGenerationActive(_0xf50aa4) && isPersonReplacementVideoGenerationActive(_0x3ac2ef[_0xf50aa4.shotId]) ? _0x3ac2ef[_0xf50aa4.shotId] : null;
  const _0x386699 = Object.values(_0x3ac2ef).find(isPersonReplacementVideoGenerationActive);
  const _0x54ca57 = isPersonReplacementVideoGenerationActive(_0xb80add) ? _0xb80add : _0x3dd1f0 || _0x386699 || (_0xb80add.status === "idle" ? normalizePersonReplacementVideoGenerationState() : _0xb80add);
  return {
    ..._0x45fea1,
    videoGeneration: _0x54ca57,
    videoGenerationsByShotId: _0x3ac2ef
  };
}
function createVideoGenerationUiRevision(_0x3a0c3b = {}, _0x36e03f = "") {
  const _0x2e9d0f = normalizeText(_0x36e03f);
  const _0x1af5ac = (Array.isArray(_0x3a0c3b?.shots) ? _0x3a0c3b.shots : []).find(_0x1f97fd => normalizeText(_0x1f97fd?.id) === _0x2e9d0f);
  return JSON.stringify({
    shotId: _0x2e9d0f,
    videoRef: normalizeText(_0x1af5ac?.videoRef),
    keyframeRef: normalizeText(_0x1af5ac?.keyframeRef),
    isReversed: _0x1af5ac?.isReversed === true,
    materializedIsReversed: _0x1af5ac?.materializedIsReversed === true,
    materializationStatus: normalizeText(_0x1af5ac?.materializationStatus),
    generationStatus: normalizeText(_0x1af5ac?.generationStatus),
    error: normalizeText(_0x1af5ac?.error),
    resultVideoRef: normalizeText(_0x1af5ac?.resultVideoRef),
    replacementVideo: _0x1af5ac?.replacementVideo || null,
    replacementVideoInputsBySlot: _0x1af5ac?.replacementVideoInputsBySlot || null,
    generation: resolvePersonReplacementVideoGenerationState(_0x3a0c3b?.workspace, _0x2e9d0f)
  });
}
function createVideoGenerationTimelineRevision(_0x2c15bc = {}) {
  return JSON.stringify((Array.isArray(_0x2c15bc?.shots) ? _0x2c15bc.shots : []).map(_0x2f3910 => createVideoGenerationUiRevision(_0x2c15bc, _0x2f3910?.id)));
}
export function resolvePersonReplacementVideoGenerationUiRefreshScope(_0x2bbde5 = {}, _0x244ec6 = {}) {
  const _0x17eba0 = normalizeText(_0x244ec6?.workspace?.selectedShotId);
  if (createVideoGenerationUiRevision(_0x2bbde5, _0x17eba0) !== createVideoGenerationUiRevision(_0x244ec6, _0x17eba0)) {
    return "selected-shot";
  }
  if (createVideoGenerationTimelineRevision(_0x2bbde5) !== createVideoGenerationTimelineRevision(_0x244ec6)) {
    return "timeline";
  } else {
    return "";
  }
}