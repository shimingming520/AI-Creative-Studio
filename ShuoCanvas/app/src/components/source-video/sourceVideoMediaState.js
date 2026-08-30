import { resolveCanvasVideoPosterUrl } from "../../services/canvasMediaLocalService.js";
import { pickResultLocalPath, urlToLocalPath } from "../../utils/localMediaPath.js";
export function resolveSourceVideoPosterSrc(_0x479f85 = {}) {
  return resolveCanvasVideoPosterUrl(_0x479f85);
}
export function resolveSourceVideoMediaTaskSrc(_0x3f5329 = {}) {
  const _0x34ecc3 = Array.isArray(_0x3f5329?.videos) ? _0x3f5329.videos : [];
  const _0x26ee2e = Math.max(0, Number(_0x3f5329?.mainVideoIndex) || 0);
  const _0x492120 = _0x34ecc3[_0x26ee2e] || _0x34ecc3[0] || null;
  const _0xd9355f = [_0x3f5329?.originalLocalPath, _0x3f5329?.localPath, _0x3f5329?.displayLocalPath, _0x3f5329?.videoLocalPath, _0x3f5329?.videoUrl, _0x3f5329?.src, _0x3f5329?.url, _0x3f5329?.resultUrl, _0x3f5329?.sourceUrl, _0x492120?.originalLocalPath, _0x492120?.localPath, _0x492120?.displayLocalPath, _0x492120?.videoUrl, _0x492120?.src, _0x492120?.url, _0x492120?.resultUrl];
  for (const _0x7ca16e of _0xd9355f) {
    const _0x1651c7 = urlToLocalPath(_0x7ca16e) || pickResultLocalPath(_0x7ca16e);
    if (_0x1651c7) {
      return _0x1651c7;
    }
  }
  return "";
}