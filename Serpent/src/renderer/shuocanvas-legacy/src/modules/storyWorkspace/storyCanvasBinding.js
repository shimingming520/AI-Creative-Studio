function normalizeText(_0x12e0e6) {
  return String(_0x12e0e6 || "").trim();
}
function getStableKeyPart(_0x2bb3fe, _0x1272af) {
  return normalizeText(_0x2bb3fe) || _0x1272af;
}
export function buildStoryLinkedCanvasName(_0x36e35c = {}, _0x5ecf4d = {}) {
  const _0x54f36 = normalizeText(_0x36e35c.title) || "剧本项目";
  const _0xa1e489 = Math.max(0, Math.trunc(Number(_0x5ecf4d?.number) || 0));
  if (_0xa1e489 > 0) {
    return _0x54f36 + " · 第 " + _0xa1e489 + " 集";
  } else {
    return _0x54f36;
  }
}
export function buildStoryClipCanvasBindingKey({
  episode = {},
  clip = {},
  episodeIndex = 0,
  clipIndex = 0
} = {}) {
  const _0x27a556 = getStableKeyPart(episode.id || episode.planningRef, "episode-" + (Math.max(0, Number(episodeIndex) || 0) + 1));
  const _0xde0dd = getStableKeyPart(clip.id || clip.planningRef, "clip-" + (Math.max(0, Number(clipIndex) || 0) + 1));
  return "episode:" + _0x27a556 + ":clip:" + _0xde0dd;
}