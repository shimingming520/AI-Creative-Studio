import { normalizeInputList } from "./sharedResolverUtils.js";
import { isPublicHttpMediaUrl, uploadModelApiMediaInputs } from "../../mediaInputUploadRouter.js";
import { isConfiguredObjectStorageEnabled } from "../../objectStorageApi.js";
import { convertImageBlobToDataUrl } from "../../../src/services/imagePngConversionService.js";
function isReusableAgnesImageInput(_0x2b7046) {
  const _0x5987ec = String(_0x2b7046 || "").trim();
  return /^data:image\/[a-z0-9.+-]+;base64,/i.test(_0x5987ec) || /^https:\/\//i.test(_0x5987ec) && isPublicHttpMediaUrl(_0x5987ec);
}
async function resolveAgnesImageInputs(_0x5d9582, _0x3b54bf = {}) {
  const _0x46be99 = normalizeInputList(_0x5d9582);
  if (_0x46be99.length === 0) {
    return [];
  }
  if (isConfiguredObjectStorageEnabled()) {
    return uploadModelApiMediaInputs("image", _0x46be99, _0x3b54bf, {
      strictUpload: true
    });
  }
  const _0x19dd5c = [];
  for (const _0x2a43e9 of _0x46be99) {
    if (isReusableAgnesImageInput(_0x2a43e9)) {
      _0x19dd5c.push(_0x2a43e9);
      continue;
    }
    if (typeof _0x3b54bf.loadInputImageBlob !== "function") {
      throw new Error("Agnes 图生图无法读取本地参考图");
    }
    const _0xf26bd2 = await _0x3b54bf.loadInputImageBlob(_0x2a43e9);
    const _0x3e80a2 = await convertImageBlobToDataUrl(_0xf26bd2, _0x2a43e9);
    if (!_0x3e80a2) {
      throw new Error("Agnes 图生图无法读取本地参考图");
    }
    _0x19dd5c.push(_0x3e80a2);
  }
  return _0x19dd5c;
}
export async function agnesImage({
  currentBody: _0xeaa09,
  ctx: _0x34983a
}) {
  const _0x2fb33a = {
    ..._0xeaa09
  };
  const _0x23851b = await resolveAgnesImageInputs(_0x2fb33a.extra_body?.image, _0x34983a);
  const _0x4a5341 = _0x2fb33a.extra_body && typeof _0x2fb33a.extra_body === "object" && !Array.isArray(_0x2fb33a.extra_body) ? {
    ..._0x2fb33a.extra_body
  } : {};
  delete _0x2fb33a.tags;
  _0x4a5341.response_format = _0x23851b.length > 0 ? "b64_json" : "url";
  if (_0x23851b.length > 0) {
    _0x4a5341.image = _0x23851b;
  } else {
    delete _0x4a5341.image;
  }
  if (Object.keys(_0x4a5341).length > 0) {
    _0x2fb33a.extra_body = _0x4a5341;
  } else {
    delete _0x2fb33a.extra_body;
  }
  return _0x2fb33a;
}
function normalizeAgnesVideoFrameCount(_0xc2f2b5) {
  const _0x5b6fde = Number(_0xc2f2b5);
  if (!Number.isFinite(_0x5b6fde)) {
    return _0xc2f2b5;
  }
  const _0x123bde = 49;
  const _0x19cb1f = 441;
  const _0x7eb14d = Math.min(Math.max(_0x123bde, Math.trunc(_0x5b6fde)), _0x19cb1f);
  const _0x49f711 = Math.round((_0x7eb14d - 1) / 8) * 8 + 1;
  return Math.min(_0x19cb1f, Math.max(_0x123bde, _0x49f711));
}
function normalizeAgnesVideoFrameRate(_0x3fe412) {
  const _0x46ea89 = Number(_0x3fe412);
  if (!Number.isFinite(_0x46ea89)) {
    return _0x3fe412;
  }
  const _0x50c46e = Math.min(Math.max(1, Math.trunc(_0x46ea89)), 60);
  return _0x50c46e;
}
export function agnesVideo({
  currentBody: _0x11c330
}) {
  const _0x237550 = {
    ..._0x11c330
  };
  delete _0x237550.agnes_video_mode;
  if (_0x237550.num_frames !== undefined) {
    _0x237550.num_frames = normalizeAgnesVideoFrameCount(_0x237550.num_frames);
  }
  if (_0x237550.frame_rate !== undefined) {
    _0x237550.frame_rate = normalizeAgnesVideoFrameRate(_0x237550.frame_rate);
  }
  const _0xb262db = normalizeInputList(_0x237550.extra_body?.image);
  const _0x4058a4 = _0xb262db.slice(0, 2);
  if (_0x4058a4.length === 0) {
    delete _0x237550.image;
    delete _0x237550.extra_body;
    return _0x237550;
  }
  if (_0x4058a4.length === 1) {
    _0x237550.image = _0x4058a4[0];
    delete _0x237550.extra_body;
    return _0x237550;
  }
  _0x237550.extra_body = {
    image: _0x4058a4,
    mode: "keyframes"
  };
  delete _0x237550.image;
  return _0x237550;
}