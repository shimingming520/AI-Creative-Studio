function getPlainParams(_0x338893) {
  if (_0x338893 && typeof _0x338893 === "object" && !Array.isArray(_0x338893)) {
    return {
      ..._0x338893
    };
  } else {
    return {};
  }
}
function hasOwnParam(_0x324ae1, _0x1c0a94) {
  return Object.prototype.hasOwnProperty.call(_0x324ae1, _0x1c0a94);
}
function resolvePersistedVoiceParams(_0x497796, _0x385712) {
  const _0x5ed2a2 = hasOwnParam(_0x385712, "speakerId") || hasOwnParam(_0x385712, "voiceMode");
  const _0x34cf6e = String(_0x497796.speakerId ?? "").trim();
  const _0xaf4166 = _0x5ed2a2 ? String(_0x385712.speakerId ?? "").trim() : _0x34cf6e;
  const _0x3bb027 = _0x5ed2a2 ? String(_0x385712.voiceMode ?? (_0xaf4166 ? "custom" : "default")).trim() : String(_0x497796.voiceMode ?? (_0xaf4166 ? "custom" : "default")).trim();
  return {
    speakerId: _0xaf4166,
    voiceMode: _0x3bb027
  };
}
export function buildAudioWorkflowGenerationParams({
  schemaDefaults = {},
  savedParams = {},
  currentParams = {},
  extraParams = {},
  targetHasSpeakerId = false
} = {}) {
  const _0x3d226f = getPlainParams(savedParams);
  const _0x4698e8 = getPlainParams(currentParams);
  const _0xd75b9d = resolvePersistedVoiceParams(_0x3d226f, _0x4698e8);
  delete _0x3d226f.speakerId;
  delete _0x3d226f.voiceMode;
  const _0x7557e2 = {
    ...getPlainParams(schemaDefaults),
    ..._0x3d226f,
    ...getPlainParams(extraParams)
  };
  if (targetHasSpeakerId) {
    _0x7557e2.speakerId = _0xd75b9d.speakerId;
    _0x7557e2.voiceMode = _0xd75b9d.voiceMode;
  }
  return _0x7557e2;
}