export const VIDEO_MUTED_FIELD = "videoMuted";
export function readVideoAudioDefaultEnabledFromStore(_0x27d6ec) {
  try {
    const _0x7b58b1 = typeof _0x27d6ec?.getStateRaw === "function" ? _0x27d6ec.getStateRaw() : _0x27d6ec?.getState?.();
    return _0x7b58b1?.ui?.videoAudioDefaultEnabled === true;
  } catch {
    return false;
  }
}
export function resolveVideoMutedPreference(_0x415743 = {}, _0x98e485 = {}) {
  if (_0x415743?.[VIDEO_MUTED_FIELD] === false) {
    return false;
  }
  if (_0x415743?.[VIDEO_MUTED_FIELD] === true) {
    return true;
  }
  if (_0x98e485?.videoAudioDefaultEnabled === true) {
    return false;
  } else {
    return true;
  }
}
export function buildVideoMutedPatch(_0x257b93 = {}, _0xdf8e25) {
  const _0x31a33a = !!_0xdf8e25;
  if (_0x257b93?.[VIDEO_MUTED_FIELD] === _0x31a33a) {
    return null;
  } else {
    return {
      [VIDEO_MUTED_FIELD]: _0x31a33a
    };
  }
}