import { buildCanvasLocalImageFields } from "../services/canvasMediaLocalService.js";
import { localPathToUrl, normalizeLocalPath } from "../utils/localMediaPath.js";
import { saveRemoteImageLocally } from "./project.js";
function isRemoteLikeUrl(_0x4dbb71) {
  const _0x462ef6 = String(_0x4dbb71 || "").trim();
  return /^https?:\/\//i.test(_0x462ef6) || _0x462ef6.startsWith("blob:") || _0x462ef6.startsWith("data:");
}
export function buildToolbarImageFields({
  localPath = "",
  resultUrl = "",
  thumbUrl = "",
  includeSrc = false
}) {
  const _0x3b16e2 = {
    localPath: localPath,
    imageUrl: resultUrl,
    sourceUrl: resultUrl,
    thumbUrl: thumbUrl
  };
  if (includeSrc) {
    _0x3b16e2.src = thumbUrl || resultUrl;
  }
  return buildCanvasLocalImageFields(_0x3b16e2, {
    includeSrc: includeSrc
  });
}
export async function saveRemoteImageResultLocally(_0xa3c335, _0x4ea6b1 = {}) {
  const _0x3601ea = _0x4ea6b1.projectId || "default_v2_project";
  const _0x2d65c9 = await saveRemoteImageLocally(_0xa3c335, _0x3601ea, _0x4ea6b1);
  const _0x572b60 = isRemoteLikeUrl(_0x2d65c9) ? "" : normalizeLocalPath(_0x2d65c9);
  const _0xa6a149 = localPathToUrl(_0x572b60) || String(_0x2d65c9 || "").trim() || _0xa3c335;
  return {
    localPath: _0x572b60,
    thumbUrl: _0xa6a149,
    fields: buildToolbarImageFields({
      localPath: _0x572b60,
      resultUrl: _0xa3c335,
      thumbUrl: _0xa6a149,
      includeSrc: _0x4ea6b1.includeSrc
    })
  };
}
export async function saveOutputImageResult(_0x45b6cb, _0x45b33b = {}) {
  const _0x50a787 = _0x45b33b.resumedImage || null;
  if (_0x50a787) {
    const _0x252ca1 = buildCanvasLocalImageFields(_0x50a787, {
      includeSrc: _0x45b33b.includeSrc ?? true
    });
    const _0x1fbbb0 = String(_0x252ca1.localPath || "").trim();
    const _0x14c5ac = String(_0x252ca1.thumbUrl || _0x252ca1.imageUrl || _0x252ca1.src || "").trim();
    return {
      localPath: _0x1fbbb0,
      thumbUrl: _0x14c5ac,
      fields: _0x252ca1
    };
  }
  const {
    resumedImage: _0x51e505,
    includeSrc: _0x4e8f0d,
    ..._0x86bef5
  } = _0x45b33b;
  return await saveRemoteImageResultLocally(_0x45b6cb, {
    ..._0x86bef5,
    ext: _0x45b33b.ext || "png",
    includeSrc: _0x4e8f0d ?? true,
    dedupeKey: _0x45b33b.dedupeKey || (_0x45b33b.taskKey ? _0x45b33b.taskKey + ":" + _0x45b6cb : undefined)
  });
}