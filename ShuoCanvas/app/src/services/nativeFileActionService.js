import { normalizeLocalPath } from "../utils/localMediaPath.js";
import { desktopBridge } from "./desktopBridge.js";
function resolvePrimaryImageItem(_0x10b910) {
  if (String(_0x10b910?.type || "") !== "ai-image") {
    return null;
  }
  const _0x5d811d = Array.isArray(_0x10b910?.images) ? _0x10b910.images : [];
  if (_0x5d811d.length === 0) {
    return null;
  }
  const _0x150b36 = Number(_0x10b910?.mainImageIndex);
  const _0x71cb4c = Number.isFinite(_0x150b36) ? Math.max(0, Math.trunc(_0x150b36)) : 0;
  return _0x5d811d[Math.min(_0x71cb4c, _0x5d811d.length - 1)] || null;
}
export function resolveNodeLocalPathForNativeAction(_0x5de21a) {
  const _0x2f9b73 = resolvePrimaryImageItem(_0x5de21a) || _0x5de21a;
  const _0x163f27 = [_0x2f9b73?.originalLocalPath, _0x2f9b73?.localPath, _0x2f9b73?.displayLocalPath, _0x2f9b73?.posterLocalPath, _0x2f9b73?.waveformLocalPath, _0x2f9b73?.src, _0x2f9b73?.imageUrl, _0x2f9b73?.videoUrl, _0x2f9b73?.audioUrl, _0x2f9b73?.url, _0x2f9b73?.resultUrl];
  return _0x163f27.map(_0x55dab3 => normalizeLocalPath(_0x55dab3)).find(Boolean) || "";
}
export function canShowItemInFolder(_0x2be4c9) {
  return !!_0x2be4c9 && desktopBridge.shell.canShowItemInFolder();
}
export function canOpenKnownFolder(_0x3c7975) {
  return !!_0x3c7975 && desktopBridge.shell.canOpenKnownFolder();
}
export async function showItemInFolder(_0x3acb93) {
  if (!canShowItemInFolder(_0x3acb93)) {
    throw new Error("showItemInFolder unavailable");
  }
  return desktopBridge.shell.showItemInFolder({
    localPath: _0x3acb93
  });
}
export async function openKnownFolder(_0x4da98c) {
  if (!canOpenKnownFolder(_0x4da98c)) {
    throw new Error("openKnownFolder unavailable");
  }
  return desktopBridge.shell.openKnownFolder({
    kind: _0x4da98c
  });
}