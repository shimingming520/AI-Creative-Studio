import a1436_0x3e8327 from "../core/stores/appStore.js";
import { findAvailablePosition, generateId } from "../core/math.js";
import { commit } from "./history.js";
import { calcSafeSpawnPosNearNode, calcSpawnStartFromAnchor, getNodeSpawnPrefs } from "./nodeSpawn.js";
import { requester } from "../../api/requester.js";
import { canUseElectronMediaTask, enqueueElectronMediaTask } from "../../api/localMediaTaskApi.js";
import { fetchVideoMetaFromServer } from "../../api/videoMetaApi.js";
import { fetchVideoFirstFrameThumbFromServer } from "../../api/videoThumbApi.js";
import { buildSourceMediaNodePayload, getAutoMediaSizeByShortSide } from "../services/fileService.js";
import { resolveCanvasVideoPosterUrl, resolveCanvasVideoUrl } from "../services/canvasMediaLocalService.js";
import { SMART_CLIP_DEFAULT_FPS, SMART_CLIP_DEFAULT_SEGMENTS, SMART_CLIP_FPS_OPTIONS, SMART_CLIP_MAX_SEGMENTS, SMART_CLIP_MIN_SEGMENTS, SMART_CLIP_OUTPUT_MODE_KEYFRAMES, SMART_CLIP_OUTPUT_MODE_SEGMENTS, normalizeSmartClipFps, normalizeSmartClipMaxSegments, normalizeSmartClipOutputMode, normalizeSmartClipRunOptions, runSmartClipJob } from "../services/smartClipJobService.js";
import { localPathToUrl, pickResultLocalPath } from "../utils/localMediaPath.js";
import { attachDesktopMediaPlaybackSource } from "../services/desktopMediaBlobSource.js";
import { extractCurrentVideoFrameToImageNode } from "./videoFrameExtraction.js";
import { t } from "../i18n/index.js";
import { captureVideoFrameSnapshot, saveVideoFrameSnapshot, waitForVideoFrame } from "../components/videoFrameCapture.js";
import { playVideoWithRecovery } from "../components/video-node/mediaPlaybackRecovery.js";
import { saveOutputBlob } from "./project.js";
import { renderVideoClipThumbnails } from "./videoClipThumbnailRenderer.js";
import { mirrorMediaClipRange, renderMediaClipReverseIcon, resolveMediaClipReverseControlState } from "../components/media-clip/mediaClipReverseControl.js";
export function normalizeVideoCutResultLocalPath(_0x5ebe6f) {
  return pickResultLocalPath(_0x5ebe6f);
}
export function shouldVideoClipSelectionPointerUpSeek(_0x5627fd = "", _0x59e3a0 = false) {
  return String(_0x5627fd || "") === "move" && _0x59e3a0 !== true;
}
const SMART_CLIP_IMAGE_EXT_RE = /\.(?:png|jpe?g|webp|bmp|gif)(?:[?#]|$)/i;
const VIDEO_CLIP_SEEK_EPSILON_SEC = 0.035;
const VIDEO_CLIP_PLAY_SEEK_TIMEOUT_MS = 900;
export const SMART_CLIP_KEYFRAME_DEFAULT_OPTIONS = Object.freeze({
  mode: "stable",
  maxSegments: SMART_CLIP_DEFAULT_SEGMENTS,
  fps: SMART_CLIP_DEFAULT_FPS,
  outputMode: SMART_CLIP_OUTPUT_MODE_KEYFRAMES
});
function videoClipText(_0x48d964, _0xf47020 = {}) {
  return t("videoClip." + _0x48d964, _0xf47020);
}
function escapeClipHelperHtml(_0x1d9a6b) {
  return String(_0x1d9a6b ?? "").replace(/[&<>"']/g, _0x347605 => {
    if (_0x347605 === "&") {
      return "&amp;";
    }
    if (_0x347605 === "<") {
      return "&lt;";
    }
    if (_0x347605 === ">") {
      return "&gt;";
    }
    if (_0x347605 === "\"") {
      return "&quot;";
    }
    return "&#39;";
  });
}
function clipHelperLabel(_0x1d20ee, _0x19a6b2 = {}) {
  return escapeClipHelperHtml(videoClipText(_0x1d20ee, _0x19a6b2));
}
export { normalizeSmartClipFps, normalizeSmartClipMaxSegments, normalizeSmartClipOutputMode };
export function isSmartClipImageResult(_0x26847a, _0xc9aede = pickResultLocalPath(_0x26847a)) {
  const _0x10029b = String(_0x26847a?.outputType || _0x26847a?.type || "").trim().toLowerCase();
  const _0x192e7e = String(_0x26847a?.mimeType || _0x26847a?.contentType || "").trim().toLowerCase();
  return _0x10029b === "image" || _0x192e7e.startsWith("image/") || SMART_CLIP_IMAGE_EXT_RE.test(String(_0xc9aede || _0x26847a?.url || _0x26847a?.path || ""));
}
function resolveSmartClipResultUrl(_0x453f6e, _0x3998c7) {
  return localPathToUrl(_0x3998c7) || String(_0x453f6e?.url || _0x453f6e?.src || _0x453f6e?.imageUrl || "").trim();
}
function getWindowTimer(_0x53d36e) {
  const _0x1df251 = globalThis.window?.[_0x53d36e] || globalThis[_0x53d36e];
  if (typeof _0x1df251 === "function") {
    return _0x1df251.bind(globalThis.window || globalThis);
  } else {
    return null;
  }
}
function waitForSmartClipVideoEvent(_0x538820, _0x3e172f, _0x42750f = 10000) {
  const _0xea3c4a = getWindowTimer("setTimeout");
  const _0x5505a8 = getWindowTimer("clearTimeout");
  if (!_0x538820 || typeof _0xea3c4a !== "function") {
    return Promise.resolve(false);
  }
  return new Promise(_0xa453b8 => {
    let _0x13c649 = false;
    let _0x3443d6 = null;
    const _0x2306a0 = () => {
      for (const _0x49998f of _0x3e172f) {
        _0x538820.removeEventListener?.(_0x49998f, _0x365aef);
      }
      _0x538820.removeEventListener?.("error", _0x2a480e);
      _0x538820.removeEventListener?.("abort", _0x2a480e);
      if (_0x3443d6 && typeof _0x5505a8 === "function") {
        _0x5505a8(_0x3443d6);
      }
    };
    const _0x49a649 = _0x3459a6 => {
      if (_0x13c649) {
        return;
      }
      _0x13c649 = true;
      _0x2306a0();
      _0xa453b8(_0x3459a6 === true);
    };
    const _0x365aef = () => _0x49a649(true);
    const _0x2a480e = () => _0x49a649(false);
    for (const _0xce5592 of _0x3e172f) {
      _0x538820.addEventListener?.(_0xce5592, _0x365aef, {
        once: true
      });
    }
    _0x538820.addEventListener?.("error", _0x2a480e, {
      once: true
    });
    _0x538820.addEventListener?.("abort", _0x2a480e, {
      once: true
    });
    _0x3443d6 = _0xea3c4a(() => _0x49a649(false), _0x42750f);
  });
}
async function captureSmartClipVideoFirstFrame(_0x909095, _0x1bcb05) {
  const _0x7d525d = globalThis.document;
  if (!_0x7d525d || !_0x909095) {
    throw new Error("missing video url");
  }
  const _0x526519 = _0x7d525d.createElement("video");
  _0x526519.muted = true;
  _0x526519.playsInline = true;
  _0x526519.preload = "auto";
  _0x526519.crossOrigin = "anonymous";
  _0x526519.style.position = "fixed";
  _0x526519.style.left = "-10000px";
  _0x526519.style.top = "-10000px";
  _0x526519.style.width = "1px";
  _0x526519.style.height = "1px";
  _0x526519.style.opacity = "0";
  _0x7d525d.body?.appendChild(_0x526519);
  try {
    _0x526519.src = _0x909095;
    try {
      _0x526519.load?.();
    } catch {}
    const _0x1b202b = await waitForVideoFrame(_0x526519, {
      timeoutMs: 10000
    });
    if (!_0x1b202b) {
      throw new Error("video frame is not ready");
    }
    if (Number(_0x526519.currentTime || 0) > 0.001) {
      _0x526519.currentTime = 0;
      await waitForSmartClipVideoEvent(_0x526519, ["seeked", "timeupdate"], 5000);
    }
    return await captureVideoFrameSnapshot(_0x526519, {
      fileNamePrefix: _0x1bcb05
    });
  } finally {
    try {
      _0x526519.pause?.();
      _0x526519.removeAttribute?.("src");
      _0x526519.load?.();
    } catch {}
    _0x526519.remove?.();
  }
}
async function extractSmartClipVideoResultFirstFrame(_0x32d20f, _0x207213, _0x2af36e) {
  const _0x4d2be3 = resolveSmartClipResultUrl(_0x32d20f, _0x207213);
  if (!_0x4d2be3) {
    throw new Error("missing video segment url");
  }
  const _0xce0653 = await captureSmartClipVideoFirstFrame(_0x4d2be3, "smart_clip_keyframe_" + (_0x2af36e + 1));
  return saveVideoFrameSnapshot(_0xce0653, saveOutputBlob);
}
function emitSmartClipProgress(_0x39a79e, _0x26fd9d) {
  if (typeof _0x39a79e !== "function") {
    return;
  }
  try {
    _0x39a79e(_0x26fd9d);
  } catch {}
}
function getSmartClipStageText(_0x1d525e) {
  if (_0x1d525e === "detect") {
    return videoClipText("smartClip.stages.detect");
  }
  if (_0x1d525e === "cut") {
    return videoClipText("smartClip.stages.cut");
  }
  if (_0x1d525e === "frame") {
    return videoClipText("smartClip.stages.frame");
  }
  return videoClipText("smartClip.stages.processing");
}
function buildSmartClipProgressPayload(_0x56e1d3 = {}) {
  const _0x4ee9c = Math.max(0, Math.min(1, Number(_0x56e1d3.progress || 0)));
  const _0x4a7563 = Math.round(_0x4ee9c * 100);
  const _0x314aa9 = Number(_0x56e1d3.doneCount || 0);
  const _0x1142e5 = Number(_0x56e1d3.total || 0);
  const _0xd1d9d8 = String(_0x56e1d3.stage || "");
  const _0x2111d4 = getSmartClipStageText(_0xd1d9d8);
  return {
    stage: _0xd1d9d8,
    stageText: _0x2111d4,
    progress: _0x4ee9c,
    pct: _0x4a7563,
    doneCount: _0x314aa9,
    total: _0x1142e5,
    text: _0x1142e5 > 0 ? videoClipText("smartClip.progressWithTotal", {
      stage: _0x2111d4,
      done: _0x314aa9,
      total: _0x1142e5,
      pct: _0x4a7563
    }) : videoClipText("smartClip.progressPercent", {
      stage: _0x2111d4,
      pct: _0x4a7563
    })
  };
}
function pickPositiveNumber(..._0x4db888) {
  for (const _0x3ed1ac of _0x4db888) {
    const _0x53ffc5 = Number(_0x3ed1ac);
    if (Number.isFinite(_0x53ffc5) && _0x53ffc5 > 0) {
      return _0x53ffc5;
    }
  }
  return 0;
}
function normalizeVideoClipReverseControl(_0x1ad594) {
  if (!_0x1ad594 || typeof _0x1ad594.onChange !== "function") {
    return null;
  }
  const _0x4ea944 = _0x1ad594.isReversed === true;
  return {
    isReversed: _0x4ea944,
    materializedIsReversed: typeof _0x1ad594.materializedIsReversed === "boolean" ? _0x1ad594.materializedIsReversed : _0x4ea944,
    pending: false,
    onChange: _0x1ad594.onChange
  };
}
function pickSelectedVideoItem(_0x568f2e) {
  const _0x108d3a = Array.isArray(_0x568f2e?.videos) ? _0x568f2e.videos : [];
  if (!_0x108d3a.length) {
    return null;
  }
  const _0x363764 = Number(_0x568f2e?.mainVideoIndex);
  const _0x22de06 = Number.isFinite(_0x363764) ? Math.max(0, Math.trunc(_0x363764)) : 0;
  return _0x108d3a[Math.min(_0x22de06, _0x108d3a.length - 1)] || _0x108d3a[0] || null;
}
const DIRECT_VIDEO_SOURCE_RE = /^(?:https?:|blob:|data:)/i;
const BLOCKED_VIDEO_SOURCE_RE = /^(?:file|javascript):/i;
function normalizeDirectVideoSource(_0x1ffb13) {
  const _0x4d743b = String(_0x1ffb13 || "").trim();
  if (!_0x4d743b || BLOCKED_VIDEO_SOURCE_RE.test(_0x4d743b)) {
    return "";
  }
  const _0x17b4d9 = localPathToUrl(_0x4d743b);
  if (_0x17b4d9) {
    return _0x17b4d9;
  }
  if (_0x4d743b.startsWith("/") && !_0x4d743b.startsWith("//")) {
    return _0x4d743b;
  }
  if (DIRECT_VIDEO_SOURCE_RE.test(_0x4d743b)) {
    return _0x4d743b;
  } else {
    return "";
  }
}
export function resolveVideoClipSourceUrl(_0x598bb1) {
  if (!_0x598bb1) {
    return "";
  }
  const _0x39e273 = pickSelectedVideoItem(_0x598bb1);
  const _0x4a9029 = _0x39e273 ? [_0x39e273, _0x598bb1] : [_0x598bb1];
  for (const _0x6a9309 of _0x4a9029) {
    const _0x3fe803 = resolveCanvasVideoUrl(_0x6a9309);
    if (_0x3fe803) {
      return _0x3fe803;
    }
    for (const _0x2cb265 of ["src", "videoUrl", "url", "resultUrl", "sourceUrl"]) {
      const _0x43b2e2 = normalizeDirectVideoSource(_0x6a9309?.[_0x2cb265]);
      if (_0x43b2e2) {
        return _0x43b2e2;
      }
    }
  }
  return "";
}
export function buildVideoCutNodeMeta(_0x130d67, _0x1a1c1e, _0x4f76fc, _0x4d30f) {
  const _0x38e00e = Number(_0x1a1c1e);
  const _0x25b66b = Number(_0x4f76fc);
  const _0x1ba5e3 = Number.isFinite(_0x38e00e) && Number.isFinite(_0x25b66b) && _0x25b66b > _0x38e00e ? _0x25b66b - _0x38e00e : 0;
  const _0x389127 = pickSelectedVideoItem(_0x130d67);
  const _0x56d310 = pickPositiveNumber(_0x389127?.videoDuration, _0x389127?.duration, _0x130d67?.videoDuration, _0x130d67?.duration);
  const _0x47f366 = pickPositiveNumber(_0x389127?.videoFrameCount, _0x389127?.frameCount, _0x130d67?.videoFrameCount, _0x130d67?.frameCount);
  const _0x3ea408 = pickPositiveNumber(_0x4d30f, _0x389127?.videoFps, _0x389127?.fps, _0x130d67?.videoFps, _0x130d67?.fps) || (_0x47f366 > 0 && _0x56d310 > 0 ? _0x47f366 / _0x56d310 : 0);
  const _0x398a99 = pickPositiveNumber(_0x389127?.videoWidth, _0x389127?.width, _0x130d67?.videoWidth, _0x130d67?.selectedVideoWidth);
  const _0xba383b = pickPositiveNumber(_0x389127?.videoHeight, _0x389127?.height, _0x130d67?.videoHeight, _0x130d67?.selectedVideoHeight);
  const _0x451595 = {};
  if (_0x1ba5e3 > 0) {
    _0x451595.videoDuration = _0x1ba5e3;
  }
  if (_0x3ea408 > 0) {
    _0x451595.videoFps = _0x3ea408;
  }
  if (_0x1ba5e3 > 0 && _0x3ea408 > 0) {
    _0x451595.videoFrameCount = Math.max(1, Math.round(_0x1ba5e3 * _0x3ea408));
  }
  if (_0x398a99 > 0) {
    _0x451595.videoWidth = Math.round(_0x398a99);
  }
  if (_0xba383b > 0) {
    _0x451595.videoHeight = Math.round(_0xba383b);
  }
  return _0x451595;
}
export function buildVideoCutNodePlaybackFields(_0x5d5244) {
  const _0x4a053c = pickResultLocalPath({
    localPath: _0x5d5244
  });
  const _0x1d3406 = localPathToUrl(_0x4a053c);
  return {
    src: _0x1d3406,
    videoUrl: _0x1d3406,
    localPath: _0x4a053c,
    originalLocalPath: _0x4a053c,
    videoThumbSrc: _0x1d3406
  };
}
function applyVideoCutThumbResultToNode(_0x1f111b, _0x1d63a7, _0x2fe933 = {}) {
  const _0x4bd750 = String(_0x1f111b || "").trim();
  const _0x16344a = String(_0x1d63a7 || "").trim();
  if (!_0x4bd750 || !_0x16344a) {
    return;
  }
  const _0x515fe8 = String(_0x2fe933.thumbUrl || _0x2fe933.url || "").trim();
  const _0xa21e42 = pickResultLocalPath(_0x2fe933);
  if (!_0x515fe8 && !_0xa21e42) {
    return;
  }
  const _0x2c205c = a1436_0x3e8327.getState().nodes?.[_0x4bd750];
  if (!_0x2c205c) {
    return;
  }
  const _0x4d06ed = resolveCanvasVideoUrl(_0x2c205c);
  if (_0x4d06ed && _0x4d06ed !== _0x16344a) {
    return;
  }
  const _0x3eea5f = {
    videoThumbSrc: _0x16344a,
    videoThumbUnavailableSource: ""
  };
  if (_0x515fe8 && !String(_0x2c205c.thumbUrl || "").trim()) {
    _0x3eea5f.thumbUrl = _0x515fe8;
  }
  if (_0xa21e42 && !String(_0x2c205c.posterLocalPath || "").trim()) {
    _0x3eea5f.posterLocalPath = _0xa21e42;
  }
  a1436_0x3e8327.updateNodeData(_0x4bd750, _0x3eea5f);
}
function ensureVideoCutNodeThumb(_0x422269, _0x486588) {
  const _0x1fd386 = localPathToUrl(_0x486588);
  if (!_0x1fd386) {
    return;
  }
  fetchVideoFirstFrameThumbFromServer(_0x1fd386).then(_0x112f8c => applyVideoCutThumbResultToNode(_0x422269, _0x1fd386, _0x112f8c)).catch(() => {});
}
export async function runSmartClipFromVideoNode({
  nodeId: _0x58aec9,
  options: _0xaddc4d,
  onProgress: _0x5b83df,
  shouldContinue: _0x35c160
} = {}) {
  const _0x5bc93c = normalizeSmartClipRunOptions(_0xaddc4d);
  const _0x243480 = String(_0x58aec9 || "").trim();
  const _0x5c10ab = a1436_0x3e8327.getState().nodes;
  const _0x54d731 = _0x5c10ab[_0x243480];
  if (!_0x54d731) {
    throw new Error(videoClipText("errors.videoNodeMissing"));
  }
  const _0x533e6b = localPathToUrl(_0x54d731.localPath) || _0x54d731.src || _0x54d731.videoUrl || _0x54d731.resultUrl || "";
  if (!_0x533e6b) {
    throw new Error(videoClipText("errors.invalidSource"));
  }
  emitSmartClipProgress(_0x5b83df, {
    stage: "prepare",
    stageText: videoClipText("smartClip.stages.prepare"),
    text: videoClipText("smartClip.preparing"),
    outputMode: _0x5bc93c.outputMode
  });
  let _0x5d0fa1;
  try {
    _0x5d0fa1 = await runSmartClipJob({
      src: _0x533e6b,
      options: _0x5bc93c,
      shouldContinue: _0x35c160,
      onProgress: _0x1b3e8e => {
        emitSmartClipProgress(_0x5b83df, {
          ...buildSmartClipProgressPayload(_0x1b3e8e),
          outputMode: _0x5bc93c.outputMode
        });
      }
    });
  } catch (_0x5bc750) {
    if (_0x5bc750?.code === "endpoint_unavailable") {
      throw new Error(videoClipText("errors.smartClipEndpointMissing"));
    }
    if (_0x5bc750?.code === "missing_job_id") {
      throw new Error(videoClipText("errors.startMissingJobId"));
    }
    if (_0x5bc750?.code === "cancelled") {
      throw new Error(videoClipText("errors.exitedClipMode"));
    }
    throw _0x5bc750;
  }
  {
    const _0x457856 = _0x5d0fa1.job || {};
    const _0x1ba874 = _0x5d0fa1.segments;
    if (!_0x1ba874.length) {
      return {
        ok: false,
        reason: "no-segments",
        nodeIds: [],
        outputMode: _0x5bc93c.outputMode
      };
    }
    const _0x452004 = a1436_0x3e8327.getState().nodes[_0x243480];
    if (!_0x452004) {
      throw new Error(videoClipText("errors.sourceNodeMissing"));
    }
    const _0x3c4116 = normalizeSmartClipOutputMode(_0x457856.outputMode || _0x5bc93c.outputMode);
    const _0x114541 = _0x3c4116 === SMART_CLIP_OUTPUT_MODE_KEYFRAMES;
    const _0x5c9ae7 = getAutoMediaSizeByShortSide(_0x452004.width || 512, _0x452004.height || 288);
    const {
      spacing: _0x31e0c5,
      direction: _0x565163,
      avoidOverlap: _0x1ac517
    } = getNodeSpawnPrefs();
    const {
      startX: _0xd92f9b,
      startY: _0x27a76d
    } = calcSpawnStartFromAnchor(_0x452004, _0x31e0c5, _0x565163);
    const _0x514ff4 = [];
    const _0x2f2a28 = {
      ...(a1436_0x3e8327.getState().nodes || {})
    };
    for (let _0xc4cc99 = 0; _0xc4cc99 < _0x1ba874.length; _0xc4cc99++) {
      const _0x17b4ba = _0x1ba874[_0xc4cc99] || {};
      const _0x1916d4 = pickResultLocalPath(_0x17b4ba);
      if (!_0x1916d4) {
        continue;
      }
      let _0x29bd8c = _0x17b4ba;
      let _0x130ef9 = _0x1916d4;
      if (_0x114541 && !isSmartClipImageResult(_0x17b4ba, _0x1916d4)) {
        emitSmartClipProgress(_0x5b83df, {
          stage: "frame",
          stageText: videoClipText("smartClip.stages.frame"),
          progress: _0x1ba874.length > 0 ? _0xc4cc99 / _0x1ba874.length : 0,
          pct: _0x1ba874.length > 0 ? Math.round(_0xc4cc99 / _0x1ba874.length * 100) : 0,
          doneCount: _0xc4cc99,
          total: _0x1ba874.length,
          text: videoClipText("smartClip.extractingFrame", {
            current: _0xc4cc99 + 1,
            total: _0x1ba874.length
          }),
          outputMode: _0x3c4116
        });
        try {
          _0x29bd8c = await extractSmartClipVideoResultFirstFrame(_0x17b4ba, _0x1916d4, _0xc4cc99);
          _0x130ef9 = pickResultLocalPath(_0x29bd8c);
        } catch (_0x32c8b7) {
          console.warn("[VideoClipController] smart clip keyframe fallback failed:", _0x32c8b7);
          continue;
        }
        if (!_0x130ef9) {
          continue;
        }
      }
      const _0x2ca598 = normalizeSmartClipFps(_0x17b4ba.fps || _0x5bc93c.fps);
      const _0x2d2428 = Number(_0x17b4ba.duration) > 0 ? Number(_0x17b4ba.duration) : 0;
      const _0x550e9e = pickPositiveNumber(_0x29bd8c.width, _0x29bd8c.imageWidth, _0x29bd8c.originalWidth, _0x452004.videoWidth, _0x452004.selectedVideoWidth, _0x452004.originalWidth, _0x452004.width, 512);
      const _0x1ef604 = pickPositiveNumber(_0x29bd8c.height, _0x29bd8c.imageHeight, _0x29bd8c.originalHeight, _0x452004.videoHeight, _0x452004.selectedVideoHeight, _0x452004.originalHeight, _0x452004.height, 288);
      const _0x21c42d = _0x114541 ? getAutoMediaSizeByShortSide(_0x550e9e, _0x1ef604) : _0x5c9ae7;
      const _0x5f1a44 = _0x1ac517 ? findAvailablePosition(_0x2f2a28, _0xd92f9b, _0x27a76d, _0x21c42d.width, _0x21c42d.height, _0x31e0c5, _0x565163) : {
        x: _0xd92f9b,
        y: _0x27a76d
      };
      const _0x4ff995 = generateId(_0x114541 ? "source-image-smart-frame" : "source-video-scene");
      const _0x1b86a3 = _0x114541 ? null : buildVideoCutNodePlaybackFields(_0x130ef9);
      const _0x31cf4e = _0x114541 ? buildSourceMediaNodePayload({
        id: _0x4ff995,
        type: "source-image",
        x: _0x5f1a44.x,
        y: _0x5f1a44.y,
        width: _0x21c42d.width,
        height: _0x21c42d.height,
        name: videoClipText("smartClip.keyframeNodeName", {
          index: _0xc4cc99 + 1
        }),
        src: localPathToUrl(_0x130ef9),
        localPath: _0x130ef9,
        originalLocalPath: _0x29bd8c.originalLocalPath || _0x130ef9,
        displayLocalPath: _0x29bd8c.displayLocalPath || "",
        thumbLocalPath: _0x29bd8c.thumbLocalPath || "",
        fileName: _0x29bd8c.fileName || _0x17b4ba.fileName || "",
        naturalWidth: _0x550e9e,
        naturalHeight: _0x1ef604,
        originalWidth: _0x550e9e,
        originalHeight: _0x1ef604,
        needsAutoResize: false,
        fixedSize: true
      }) : buildSourceMediaNodePayload({
        id: _0x4ff995,
        type: "source-video",
        x: _0x5f1a44.x,
        y: _0x5f1a44.y,
        width: _0x21c42d.width,
        height: _0x21c42d.height,
        name: videoClipText("smartClip.segmentNodeName", {
          index: _0xc4cc99 + 1
        }),
        ..._0x1b86a3,
        videoDuration: _0x2d2428 || undefined,
        videoFps: _0x2ca598,
        videoFrameCount: _0x2d2428 > 0 ? Math.max(1, Math.round(_0x2d2428 * _0x2ca598)) : undefined,
        needsAutoResize: false,
        fixedSize: true
      });
      a1436_0x3e8327.addNode(_0x31cf4e);
      _0x2f2a28[_0x4ff995] = _0x31cf4e;
      _0x514ff4.push(_0x4ff995);
      if (!_0x114541) {
        ensureVideoCutNodeThumb(_0x4ff995, _0x130ef9);
      }
    }
    if (!_0x514ff4.length) {
      return {
        ok: false,
        reason: _0x114541 ? "no-keyframes" : "no-results",
        nodeIds: [],
        outputMode: _0x3c4116
      };
    }
    a1436_0x3e8327.setSelectedNodes(_0x514ff4);
    commit();
    window._triggerLocalCacheSave?.();
    return {
      ok: true,
      nodeIds: _0x514ff4,
      outputMode: _0x3c4116
    };
  }
}
export function runSmartClipKeyframeExtractionFromVideoNode({
  nodeId: _0xf08af3,
  options: _0x12bd72,
  onProgress: _0xc206cf,
  shouldContinue: _0x35c74c
} = {}) {
  return runSmartClipFromVideoNode({
    nodeId: _0xf08af3,
    options: {
      ...SMART_CLIP_KEYFRAME_DEFAULT_OPTIONS,
      ...(_0x12bd72 && typeof _0x12bd72 === "object" ? _0x12bd72 : {}),
      outputMode: SMART_CLIP_OUTPUT_MODE_KEYFRAMES
    },
    onProgress: _0xc206cf,
    shouldContinue: _0x35c74c
  });
}
const VideoClipController = {
  active: false,
  nodeId: null,
  anchorNodeId: null,
  wrapperEl: null,
  barEl: null,
  trackEl: null,
  selectionEl: null,
  leftHandleEl: null,
  rightHandleEl: null,
  playheadEl: null,
  labelEl: null,
  cancelBtnEl: null,
  reverseBtnEl: null,
  confirmBtnEl: null,
  thumbEls: null,
  videoEl: null,
  durationSec: 0,
  startSec: 0,
  endSec: 0,
  _dragMode: null,
  _dragOffsetPx: 0,
  _onKeyDown: null,
  _onDocClick: null,
  _onLoadedMeta: null,
  _onDurationChange: null,
  _onPointerMove: null,
  _onPointerUp: null,
  _smartClipFps: SMART_CLIP_DEFAULT_FPS,
  _smartClipMaxSegmentDrag: null,
  _onSmartClipMaxSegmentDragMove: null,
  _onSmartClipMaxSegmentDragUp: null,
  _suppressSmartClipMaxSegmentClick: false,
  _retryRaf: 0,
  _retryCount: 0,
  _thumbToken: 0,
  _sourceToken: 0,
  _reverseRequestToken: 0,
  _clipSessionToken: 0,
  _playheadRaf: 0,
  _rangeLoopSeekPending: false,
  _rangePlaybackSeq: 0,
  _pendingPlaybackStartSec: null,
  _hiddenEls: null,
  _sourceOptions: null,
  _reverseControl: null,
  init(_0x33f19e) {
    if (!_0x33f19e) {
      return;
    }
    if (this.active) {
      this.exit({
        silent: true
      });
    }
    this._sourceOptions = null;
    this._reverseControl = null;
    const _0x26714f = a1436_0x3e8327.getState().nodes[_0x33f19e];
    if (!_0x26714f) {
      return;
    }
    this._clipSessionToken++;
    this.active = true;
    this.nodeId = _0x33f19e;
    this.anchorNodeId = _0x33f19e;
    this._rangeLoopSeekPending = false;
    this._rangePlaybackSeq += 1;
    this._pendingPlaybackStartSec = null;
    a1436_0x3e8327.setVideoClipState({
      active: true,
      nodeId: _0x33f19e
    });
    this._retryCount = 0;
    this._mountWhenReady();
  },
  initForSource(_0xefa321 = {}) {
    const _0x2edd38 = _0xefa321.wrapperEl;
    const _0x4f8171 = localPathToUrl(_0xefa321.sourceLocalPath) || String(_0xefa321.sourceUrl || "").trim();
    if (!_0x2edd38 || !_0x4f8171) {
      window.showToast?.(videoClipText("errors.invalidSource"), "warn");
      return false;
    }
    if (this.active) {
      this.exit({
        silent: true
      });
    }
    this._clipSessionToken++;
    this.active = true;
    this.videoEl = _0xefa321.videoEl || null;
    this.nodeId = String(_0xefa321.anchorId || _0xefa321.nodeId || "video-source-clip");
    this.anchorNodeId = this.nodeId;
    this.wrapperEl = _0x2edd38;
    this.durationSec = 0;
    this.startSec = Math.max(0, Number(_0xefa321.initialStartSec) || 0);
    this.endSec = Math.max(this.startSec, Number(_0xefa321.initialEndSec) || this.startSec);
    this._rangeLoopSeekPending = false;
    this._rangePlaybackSeq += 1;
    this._pendingPlaybackStartSec = null;
    this._retryCount = 0;
    this._sourceOptions = {
      ..._0xefa321,
      sourceUrl: _0x4f8171,
      dimMode: _0xefa321.dimMode === true
    };
    this._reverseControl = normalizeVideoClipReverseControl(_0xefa321.reverseControl);
    this._applyFrozenUI(true);
    this._applyDimMode(this._sourceOptions.dimMode);
    this._createUI();
    this._bindEvents();
    this._syncDurationAndDefaults();
    this._render();
    return true;
  },
  _applyDimMode(_0x5dff68) {
    const _0x3f7f41 = document.getElementById("v2-wrap");
    if (_0x3f7f41) {
      if (_0x5dff68) {
        _0x3f7f41.classList.add("is-video-clip-mode");
      } else {
        _0x3f7f41.classList.remove("is-video-clip-mode");
      }
    }
    if (this.wrapperEl) {
      if (_0x5dff68) {
        this.wrapperEl.classList.add("is-video-clip-target");
      } else {
        this.wrapperEl.classList.remove("is-video-clip-target");
      }
    }
  },
  _applyFrozenUI(_0x24d79c) {
    if (!this.wrapperEl) {
      return;
    }
    const _0x45ad97 = "is-video-clipping";
    if (_0x24d79c) {
      this.wrapperEl.classList.add(_0x45ad97);
    } else {
      this.wrapperEl.classList.remove(_0x45ad97);
    }
    this._applyFrozenOverlaysHidden(_0x24d79c);
  },
  _applyFrozenOverlaysHidden(_0x32eca1) {
    if (!this.wrapperEl) {
      return;
    }
    if (_0x32eca1) {
      if (Array.isArray(this._hiddenEls) && this._hiddenEls.length) {
        return;
      }
      const _0x1be020 = [".video-controls", ".video-mute-btn", ".node-upload-hint", ".video-center-indicator", ".gen-video-center-indicator", ".multi-toggle-btn"];
      const _0x59c154 = [];
      _0x1be020.forEach(_0x308282 => {
        this.wrapperEl.querySelectorAll(_0x308282).forEach(_0x49f824 => {
          _0x59c154.push({
            el: _0x49f824,
            prevDisplay: _0x49f824.style.display
          });
          _0x49f824.style.display = "none";
        });
      });
      this._hiddenEls = _0x59c154;
      return;
    }
    const _0x209745 = Array.isArray(this._hiddenEls) ? this._hiddenEls : [];
    this._hiddenEls = null;
    _0x209745.forEach(({
      el: _0x593119,
      prevDisplay: _0x3a9f51
    }) => {
      if (!_0x593119 || !_0x593119.isConnected) {
        return;
      }
      _0x593119.style.display = _0x3a9f51 || "";
    });
  },
  _mountWhenReady() {
    const _0x1b0cc0 = this.nodeId;
    const _0x9deac6 = () => {
      if (!this.active || this.nodeId !== _0x1b0cc0) {
        return;
      }
      const _0x390f17 = document.getElementById(_0x1b0cc0);
      if (!_0x390f17) {
        this._retryCount++;
        if (this._retryCount > 10) {
          this.exit({
            silent: true
          });
          return;
        }
        this._retryRaf = requestAnimationFrame(_0x9deac6);
        return;
      }
      this.wrapperEl = _0x390f17;
      this._applyFrozenUI(true);
      this._applyDimMode(true);
      this._createUI();
      this._bindEvents();
      this._syncDurationAndDefaults();
      this._render();
    };
    this._retryRaf = requestAnimationFrame(_0x9deac6);
  },
  _createUI() {
    if (!this.wrapperEl) {
      return;
    }
    this.wrapperEl.querySelectorAll(".v2-video-clipbar").forEach(_0x21a0cb => _0x21a0cb.remove());
    const _0x4e7cb9 = document.createElement("div");
    _0x4e7cb9.className = "v2-video-clipbar";
    if (this._sourceOptions) {
      _0x4e7cb9.classList.add("v2-video-source-clipbar");
    }
    _0x4e7cb9.addEventListener("pointerdown", _0x16e76f => _0x16e76f.stopPropagation());
    _0x4e7cb9.addEventListener("click", _0x52a17b => _0x52a17b.stopPropagation());
    _0x4e7cb9.addEventListener("dblclick", _0x4e2025 => {
      _0x4e2025.preventDefault();
      _0x4e2025.stopPropagation();
    });
    const _0x424d7a = document.createElement("button");
    _0x424d7a.type = "button";
    _0x424d7a.className = "v2-video-clipbtn cancel";
    _0x424d7a.title = videoClipText("controls.cancel");
    {
      const _0xd2e608 = "http://www.w3.org/2000/svg";
      const _0x19423b = document.createElementNS(_0xd2e608, "svg");
      _0x19423b.setAttribute("width", "20");
      _0x19423b.setAttribute("height", "20");
      _0x19423b.setAttribute("viewBox", "0 0 24 24");
      _0x19423b.setAttribute("fill", "none");
      _0x19423b.setAttribute("stroke", "currentColor");
      _0x19423b.setAttribute("stroke-width", "2");
      const _0x1ca681 = document.createElementNS(_0xd2e608, "path");
      _0x1ca681.setAttribute("d", "M18 6L6 18");
      const _0x360ef2 = document.createElementNS(_0xd2e608, "path");
      _0x360ef2.setAttribute("d", "M6 6l12 12");
      _0x19423b.appendChild(_0x1ca681);
      _0x19423b.appendChild(_0x360ef2);
      _0x424d7a.appendChild(_0x19423b);
    }
    const _0x1fffa1 = document.createElement("button");
    _0x1fffa1.type = "button";
    _0x1fffa1.className = "v2-video-clipbtn confirm";
    _0x1fffa1.title = videoClipText("controls.done");
    {
      const _0xcf48a1 = "http://www.w3.org/2000/svg";
      const _0x3e1b6a = document.createElementNS(_0xcf48a1, "svg");
      _0x3e1b6a.setAttribute("width", "24");
      _0x3e1b6a.setAttribute("height", "24");
      _0x3e1b6a.setAttribute("viewBox", "0 0 24 24");
      _0x3e1b6a.setAttribute("fill", "none");
      _0x3e1b6a.setAttribute("stroke", "currentColor");
      _0x3e1b6a.setAttribute("stroke-width", "2.5");
      const _0x3f9089 = document.createElementNS(_0xcf48a1, "polyline");
      _0x3f9089.setAttribute("points", "20 6 9 17 4 12");
      _0x3e1b6a.appendChild(_0x3f9089);
      _0x1fffa1.appendChild(_0x3e1b6a);
    }
    let _0x4c34e6 = null;
    if (this._reverseControl) {
      _0x4c34e6 = document.createElement("button");
      _0x4c34e6.type = "button";
      _0x4c34e6.className = "v2-video-clipbtn reverse";
      _0x4c34e6.innerHTML = renderMediaClipReverseIcon({
        className: "v2-video-clip-reverse-icon"
      });
    }
    const _0x59d638 = document.createElement("div");
    _0x59d638.className = "v2-video-cliprow";
    const _0x2f471f = document.createElement("div");
    _0x2f471f.className = "v2-video-cliptrack";
    const _0x4a1020 = document.createElement("div");
    _0x4a1020.className = "v2-video-clipticks";
    const _0x27fd95 = document.createElement("div");
    _0x27fd95.className = "v2-video-clipthumbs";
    const _0x36c039 = [];
    for (let _0x515cd2 = 0; _0x515cd2 < 10; _0x515cd2++) {
      const _0x5bf3a9 = document.createElement("div");
      _0x5bf3a9.className = "v2-video-clipthumb";
      _0x27fd95.appendChild(_0x5bf3a9);
      _0x36c039.push(_0x5bf3a9);
    }
    const _0x3ebf0c = document.createElement("div");
    _0x3ebf0c.className = "v2-video-cliprange";
    const _0x3df1a5 = document.createElement("div");
    _0x3df1a5.className = "v2-video-clipselection";
    const _0x1a0b82 = document.createElement("div");
    _0x1a0b82.className = "v2-video-clipplayhead";
    const _0x545ede = document.createElement("div");
    _0x545ede.className = "v2-video-cliphandle left";
    _0x545ede.dataset.handle = "left";
    const _0x574843 = document.createElement("div");
    _0x574843.className = "v2-video-cliphandle right";
    _0x574843.dataset.handle = "right";
    const _0x5a2333 = document.createElement("div");
    _0x5a2333.className = "v2-video-cliplabel";
    _0x5a2333.textContent = "0.00s";
    const _0x5642bd = document.createElement("div");
    _0x5642bd.className = "v2-video-cliphelper-row";
    const _0x204a14 = document.createElement("div");
    _0x204a14.className = "v2-video-cliphelper-left";
    const _0x3d576a = [{
      html: "<span class=\"v2-video-cliphelperkbd\">Esc</span><span>" + clipHelperLabel("helper.cancel") + "</span>\n               <span style=\"display:flex;align-items:center;margin-left:4px;\">\n                 <svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><rect x=\"2\" y=\"4\" width=\"20\" height=\"16\" rx=\"2\" ry=\"2\"></rect><path d=\"M6 8h.001\"></path><path d=\"M10 8h.001\"></path><path d=\"M14 8h.001\"></path><path d=\"M18 8h.001\"></path><path d=\"M8 12h.001\"></path><path d=\"M12 12h.001\"></path><path d=\"M16 12h.001\"></path><path d=\"M7 16h10\"></path></svg>\n               </span>"
    }, {
      html: "<span class=\"v2-video-cliphelperkbd\">Space</span><span>" + clipHelperLabel("helper.rangePlayPause") + "</span>"
    }, {
      html: "<span class=\"v2-video-cliphelperkbd\">←</span> <span class=\"v2-video-cliphelperkbd\">→</span> <span>" + clipHelperLabel("helper.moveSelectionByFrame") + "</span>"
    }, {
      html: "<span class=\"v2-video-cliphelperkbd\">Shift</span> + <span class=\"v2-video-cliphelperkbd\">←</span>/<span class=\"v2-video-cliphelperkbd\">→</span> <span>" + clipHelperLabel("helper.moveSelectionByLargeStep", {
        frames: 10
      }) + "</span>"
    }, {
      html: "<span class=\"v2-video-cliphelperkbd\">I</span>/<span class=\"v2-video-cliphelperkbd\">O</span> <span>" + clipHelperLabel("helper.setInOut") + "</span>"
    }, {
      html: "<span class=\"v2-video-cliphelperkbd\">Ctrl</span> + <span class=\"v2-video-cliphelperkbd\">←</span>/<span class=\"v2-video-cliphelperkbd\">→</span> <span>" + clipHelperLabel("helper.fineTuneInPoint", {
        frames: 1
      }) + "</span>"
    }, {
      html: "<span class=\"v2-video-cliphelperkbd\">Alt</span> + <span class=\"v2-video-cliphelperkbd\">←</span>/<span class=\"v2-video-cliphelperkbd\">→</span> <span>" + clipHelperLabel("helper.fineTuneOutPoint", {
        frames: 1
      }) + "</span>"
    }, {
      html: "<span class=\"v2-video-cliphelperkbd\">" + clipHelperLabel("helper.wheelKey") + "</span><span>" + clipHelperLabel("helper.wheelMove") + "</span>"
    }, {
      html: "<span class=\"v2-video-cliphelperkbd\">" + clipHelperLabel("helper.clickKey") + "</span><span>" + clipHelperLabel("helper.jumpPlayhead") + "</span>"
    }, {
      html: "<span class=\"v2-video-cliphelperkbd\">" + clipHelperLabel("helper.doubleClickRangeKey") + "</span><span>" + clipHelperLabel("helper.resetDefaultRange", {
        seconds: 3
      }) + "</span>"
    }];
    this._msgEls = _0x3d576a.map((_0x38f37, _0x26b03a) => {
      const _0x1a4d93 = document.createElement("div");
      _0x1a4d93.className = "v2-video-cliphelper-msg";
      if (_0x26b03a !== 0) {
        _0x1a4d93.classList.add("hide-down");
      }
      _0x1a4d93.innerHTML = _0x38f37.html;
      _0x204a14.appendChild(_0x1a4d93);
      return _0x1a4d93;
    });
    let _0x3497d9 = 0;
    this._msgInterval = setInterval(() => {
      if (!this.active || !this._msgEls) {
        return;
      }
      const _0x19cc53 = this._msgEls[_0x3497d9];
      _0x3497d9 = (_0x3497d9 + 1) % this._msgEls.length;
      const _0x4ef8a6 = this._msgEls[_0x3497d9];
      _0x19cc53.classList.remove("hide-down");
      _0x19cc53.classList.add("hide-up");
      _0x4ef8a6.classList.remove("hide-up");
      _0x4ef8a6.classList.remove("hide-down");
      setTimeout(() => {
        if (_0x19cc53 && _0x19cc53.classList.contains("hide-up")) {
          _0x19cc53.classList.remove("hide-up");
          _0x19cc53.classList.add("hide-down");
        }
      }, 300);
    }, 4000);
    this._smartClipMode = this._smartClipMode || "stable";
    this._smartClipMaxSegments = normalizeSmartClipMaxSegments(this._smartClipMaxSegments);
    this._smartClipFps = normalizeSmartClipFps(this._smartClipFps);
    this._smartClipOutputMode = normalizeSmartClipOutputMode(this._smartClipOutputMode);
    const _0x1367db = document.createElement("div");
    _0x1367db.className = "v2-video-clip-actions";
    const _0x4421ef = document.createElement("div");
    _0x4421ef.className = "v2-video-clip-smartwrap";
    const _0x139359 = document.createElement("button");
    _0x139359.className = "v2-video-clip-smartbtn";
    const _0x48c776 = "<svg width=\"14\" height=\"14\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z\"></path><polyline points=\"3.27 6.96 12 12.01 20.73 6.96\"></polyline><line x1=\"12\" y1=\"22.08\" x2=\"12\" y2=\"12\"></line></svg>";
    const _0x69ea04 = "<svg width=\"14\" height=\"14\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><g style=\"animation:spin 1s linear infinite;transform-origin:50% 50%;transform-box:fill-box;\"><path d=\"M21 12a9 9 0 1 1-6.219-8.56\"/></g></svg>";
    const _0x26d460 = () => escapeClipHelperHtml(videoClipText("smartPanel.smartClipButton"));
    _0x139359.innerHTML = _0x48c776 + " " + _0x26d460();
    const _0x2cf399 = document.createElement("button");
    _0x2cf399.type = "button";
    _0x2cf399.className = "v2-video-clip-smartbtn v2-video-clip-framebtn";
    _0x2cf399.title = videoClipText("smartPanel.extractFrame");
    _0x2cf399.setAttribute("aria-label", videoClipText("smartPanel.extractFrame"));
    const _0x27c112 = "<svg width=\"14\" height=\"14\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z\"></path><circle cx=\"12\" cy=\"13\" r=\"4\"></circle></svg>";
    _0x2cf399.innerHTML = _0x27c112;
    const _0x305f0b = document.createElement("div");
    _0x305f0b.className = "v2-video-clip-smartpanel";
    const _0x254a41 = document.createElement("div");
    _0x254a41.className = "v2-video-clip-smartpanel-title";
    _0x254a41.textContent = videoClipText("smartPanel.title");
    const _0x20ce4e = document.createElement("div");
    _0x20ce4e.className = "v2-video-clip-smartpanel-row";
    const _0x44c1be = document.createElement("div");
    _0x44c1be.className = "v2-video-clip-smartpanel-label";
    _0x44c1be.textContent = videoClipText("smartPanel.output");
    const _0x1e70ce = document.createElement("span");
    _0x1e70ce.className = "rh-tip";
    _0x1e70ce.setAttribute("data-tooltip", videoClipText("smartPanel.outputTip"));
    _0x1e70ce.textContent = "!";
    _0x44c1be.appendChild(_0x1e70ce);
    const _0x3893e1 = document.createElement("div");
    _0x3893e1.className = "v2-video-clip-modegroup v2-video-clip-outputgroup";
    const _0x3a0541 = document.createElement("button");
    _0x3a0541.type = "button";
    _0x3a0541.className = "v2-video-clip-modebtn";
    _0x3a0541.dataset.outputMode = SMART_CLIP_OUTPUT_MODE_SEGMENTS;
    _0x3a0541.textContent = videoClipText("smartPanel.outputSegments");
    const _0x5dbd04 = document.createElement("button");
    _0x5dbd04.type = "button";
    _0x5dbd04.className = "v2-video-clip-modebtn";
    _0x5dbd04.dataset.outputMode = SMART_CLIP_OUTPUT_MODE_KEYFRAMES;
    _0x5dbd04.textContent = videoClipText("smartPanel.outputKeyframes");
    _0x3893e1.appendChild(_0x3a0541);
    _0x3893e1.appendChild(_0x5dbd04);
    _0x20ce4e.appendChild(_0x44c1be);
    _0x20ce4e.appendChild(_0x3893e1);
    const _0x51462f = document.createElement("div");
    _0x51462f.className = "v2-video-clip-smartpanel-row";
    const _0x4c070c = document.createElement("div");
    _0x4c070c.className = "v2-video-clip-smartpanel-label";
    _0x4c070c.textContent = videoClipText("smartPanel.mode");
    const _0x37893a = document.createElement("span");
    _0x37893a.className = "rh-tip";
    _0x37893a.setAttribute("data-tooltip", videoClipText("smartPanel.modeTip"));
    _0x37893a.textContent = "!";
    _0x4c070c.appendChild(_0x37893a);
    const _0x2b37f4 = document.createElement("div");
    _0x2b37f4.className = "v2-video-clip-modegroup";
    const _0x2bd15f = document.createElement("button");
    _0x2bd15f.type = "button";
    _0x2bd15f.className = "v2-video-clip-modebtn";
    _0x2bd15f.dataset.mode = "stable";
    _0x2bd15f.textContent = videoClipText("smartPanel.modeStable");
    const _0x31f256 = document.createElement("button");
    _0x31f256.type = "button";
    _0x31f256.className = "v2-video-clip-modebtn";
    _0x31f256.dataset.mode = "balanced";
    _0x31f256.textContent = videoClipText("smartPanel.modeBalanced");
    const _0x417ae8 = document.createElement("button");
    _0x417ae8.type = "button";
    _0x417ae8.className = "v2-video-clip-modebtn";
    _0x417ae8.dataset.mode = "sensitive";
    _0x417ae8.textContent = videoClipText("smartPanel.modeSensitive");
    _0x2b37f4.appendChild(_0x2bd15f);
    _0x2b37f4.appendChild(_0x31f256);
    _0x2b37f4.appendChild(_0x417ae8);
    _0x51462f.appendChild(_0x4c070c);
    _0x51462f.appendChild(_0x2b37f4);
    const _0x4db66c = document.createElement("div");
    _0x4db66c.className = "v2-video-clip-smartpanel-row";
    const _0x265dfd = document.createElement("div");
    _0x265dfd.className = "v2-video-clip-smartpanel-label";
    _0x265dfd.textContent = videoClipText("smartPanel.fps");
    const _0x360866 = document.createElement("span");
    _0x360866.className = "rh-tip";
    _0x360866.setAttribute("data-tooltip", videoClipText("smartPanel.fpsTip"));
    _0x360866.textContent = "!";
    _0x265dfd.appendChild(_0x360866);
    const _0x3ded21 = document.createElement("div");
    _0x3ded21.className = "v2-video-clip-modegroup v2-video-clip-fpsgroup";
    const _0x273b50 = SMART_CLIP_FPS_OPTIONS.map(_0x1236a6 => {
      const _0x2986a0 = document.createElement("button");
      _0x2986a0.type = "button";
      _0x2986a0.className = "v2-video-clip-modebtn v2-video-clip-fpsbtn";
      _0x2986a0.dataset.fps = String(_0x1236a6);
      _0x2986a0.textContent = videoClipText("smartPanel.fpsValue", {
        fps: _0x1236a6
      });
      _0x3ded21.appendChild(_0x2986a0);
      return _0x2986a0;
    });
    _0x4db66c.appendChild(_0x265dfd);
    _0x4db66c.appendChild(_0x3ded21);
    const _0x4989c7 = document.createElement("div");
    _0x4989c7.className = "v2-video-clip-smartpanel-row";
    const _0x39eba3 = document.createElement("div");
    _0x39eba3.className = "v2-video-clip-smartpanel-label";
    _0x39eba3.textContent = videoClipText("smartPanel.maxSegments");
    const _0x51cdf2 = document.createElement("span");
    _0x51cdf2.className = "rh-tip";
    _0x51cdf2.setAttribute("data-tooltip", videoClipText("smartPanel.maxSegmentsTip", {
      max: SMART_CLIP_MAX_SEGMENTS
    }));
    _0x51cdf2.textContent = "!";
    _0x39eba3.appendChild(_0x51cdf2);
    const _0x4d0c1d = document.createElement("div");
    _0x4d0c1d.className = "v2-video-clip-maxsegwrap";
    const _0x273ce5 = document.createElement("div");
    _0x273ce5.className = "rh-stepper-value v2-video-clip-maxseg";
    _0x273ce5.setAttribute("role", "spinbutton");
    _0x273ce5.setAttribute("aria-label", videoClipText("smartPanel.maxSegmentsAria"));
    _0x273ce5.setAttribute("aria-valuemin", String(SMART_CLIP_MIN_SEGMENTS));
    _0x273ce5.setAttribute("aria-valuemax", String(SMART_CLIP_MAX_SEGMENTS));
    _0x273ce5.tabIndex = 0;
    const _0x5f4ce5 = document.createElement("span");
    _0x5f4ce5.className = "v2-video-clip-maxseg-suffix";
    _0x5f4ce5.textContent = videoClipText("smartPanel.segmentUnit");
    _0x4d0c1d.appendChild(_0x273ce5);
    _0x4d0c1d.appendChild(_0x5f4ce5);
    _0x4989c7.appendChild(_0x39eba3);
    _0x4989c7.appendChild(_0x4d0c1d);
    const _0x63a37b = document.createElement("div");
    _0x63a37b.className = "v2-video-clip-smartpanel-hint";
    _0x63a37b.textContent = videoClipText("smartPanel.hintDefault");
    const _0x5d37e7 = document.createElement("div");
    _0x5d37e7.className = "v2-video-clip-smartpanel-actions";
    const _0x2d1046 = document.createElement("button");
    _0x2d1046.type = "button";
    _0x2d1046.className = "v2-video-clip-panelbtn";
    _0x2d1046.textContent = videoClipText("controls.cancel");
    const _0x53f487 = document.createElement("button");
    _0x53f487.type = "button";
    _0x53f487.className = "v2-video-clip-panelbtn primary";
    _0x53f487.textContent = videoClipText("controls.start");
    _0x5d37e7.appendChild(_0x2d1046);
    _0x5d37e7.appendChild(_0x53f487);
    _0x305f0b.appendChild(_0x254a41);
    _0x305f0b.appendChild(_0x20ce4e);
    _0x305f0b.appendChild(_0x51462f);
    _0x305f0b.appendChild(_0x4db66c);
    _0x305f0b.appendChild(_0x4989c7);
    _0x305f0b.appendChild(_0x63a37b);
    _0x305f0b.appendChild(_0x5d37e7);
    const _0x5c81d8 = [_0x3a0541, _0x5dbd04];
    const _0x165814 = () => {
      const _0x32008f = normalizeSmartClipOutputMode(this._smartClipOutputMode);
      this._smartClipOutputMode = _0x32008f;
      _0x5c81d8.forEach(_0x28f0de => {
        _0x28f0de.classList.toggle("is-active", _0x28f0de.dataset.outputMode === _0x32008f);
      });
      const _0x9c2e3d = _0x32008f === SMART_CLIP_OUTPUT_MODE_KEYFRAMES;
      _0x4db66c.classList.toggle("is-disabled", _0x9c2e3d);
      _0x273b50.forEach(_0x31f167 => {
        _0x31f167.disabled = _0x9c2e3d;
        _0x31f167.setAttribute("aria-disabled", _0x9c2e3d ? "true" : "false");
      });
      _0x63a37b.textContent = _0x9c2e3d ? videoClipText("smartPanel.hintKeyframes") : videoClipText("smartPanel.hintDefault");
      const _0x53689f = this._smartClipMode || "stable";
      [_0x2bd15f, _0x31f256, _0x417ae8].forEach(_0x38eba2 => {
        if (!_0x38eba2) {
          return;
        }
        if (_0x38eba2.dataset.mode === _0x53689f) {
          _0x38eba2.classList.add("is-active");
        } else {
          _0x38eba2.classList.remove("is-active");
        }
      });
      const _0x30e7aa = normalizeSmartClipFps(this._smartClipFps);
      this._smartClipFps = _0x30e7aa;
      _0x273b50.forEach(_0x2058b4 => {
        _0x2058b4.classList.toggle("is-active", Number(_0x2058b4.dataset.fps) === _0x30e7aa);
      });
      const _0x5d407a = normalizeSmartClipMaxSegments(this._smartClipMaxSegments);
      this._smartClipMaxSegments = _0x5d407a;
      _0x273ce5.textContent = String(_0x5d407a);
      _0x273ce5.setAttribute("aria-valuenow", String(_0x5d407a));
    };
    _0x165814();
    const _0x58adda = () => {
      if (!this._smartClipMaxSegmentDrag) {
        return;
      }
      this._smartClipMaxSegmentDrag.el?.classList?.remove("is-dragging");
      this._smartClipMaxSegmentDrag.doc?.removeEventListener?.("mousemove", this._onSmartClipMaxSegmentDragMove);
      this._smartClipMaxSegmentDrag.doc?.removeEventListener?.("mouseup", this._onSmartClipMaxSegmentDragUp);
      this._smartClipMaxSegmentDrag = null;
    };
    const _0x1d279c = _0x42a800 => {
      this._smartClipMaxSegments = normalizeSmartClipMaxSegments(_0x42a800);
      _0x165814();
    };
    const _0xccae33 = () => {
      if (!_0x273ce5?.isConnected) {
        return;
      }
      const _0x584cf4 = normalizeSmartClipMaxSegments(this._smartClipMaxSegments);
      const _0x26b0e7 = document.createElement("input");
      _0x26b0e7.className = "rh-stepper-input v2-video-clip-maxseg-input";
      _0x26b0e7.type = "number";
      _0x26b0e7.min = String(SMART_CLIP_MIN_SEGMENTS);
      _0x26b0e7.max = String(SMART_CLIP_MAX_SEGMENTS);
      _0x26b0e7.step = "1";
      _0x26b0e7.value = String(_0x584cf4);
      let _0xbcaada = false;
      const _0x32e320 = _0xc47578 => {
        if (_0xbcaada) {
          return;
        }
        _0xbcaada = true;
        _0x1d279c(_0xc47578 ? _0x26b0e7.value : _0x584cf4);
        _0x26b0e7.replaceWith(_0x273ce5);
        _0x165814();
      };
      _0x26b0e7.addEventListener("click", _0x5da2aa => _0x5da2aa.stopPropagation());
      _0x26b0e7.addEventListener("mousedown", _0x484181 => _0x484181.stopPropagation());
      _0x26b0e7.addEventListener("keydown", _0x946ae6 => {
        _0x946ae6.stopPropagation();
        if (_0x946ae6.key === "Enter") {
          _0x32e320(true);
        }
        if (_0x946ae6.key === "Escape") {
          _0x32e320(false);
        }
      });
      _0x26b0e7.addEventListener("blur", () => _0x32e320(true));
      _0x273ce5.replaceWith(_0x26b0e7);
      _0x26b0e7.focus();
      _0x26b0e7.select();
    };
    this._onSmartClipMaxSegmentDragMove = _0x1e2449 => {
      const _0x454b4b = this._smartClipMaxSegmentDrag;
      if (!_0x454b4b) {
        return;
      }
      const _0x3bbe82 = _0x1e2449.clientX - _0x454b4b.x;
      const _0xfd24b7 = Math.trunc(_0x3bbe82 / 6);
      const _0x2edc59 = normalizeSmartClipMaxSegments(_0x454b4b.base + _0xfd24b7);
      if (_0x2edc59 !== _0x454b4b.last) {
        _0x454b4b.moved = true;
        _0x454b4b.last = _0x2edc59;
        _0x1d279c(_0x2edc59);
      }
    };
    this._onSmartClipMaxSegmentDragUp = () => {
      const _0x52d730 = this._smartClipMaxSegmentDrag;
      if (!_0x52d730) {
        return;
      }
      _0x58adda();
      if (_0x52d730.moved) {
        this._suppressSmartClipMaxSegmentClick = true;
        _0x1d279c(_0x52d730.last);
      }
    };
    const _0x56ba37 = () => {
      _0x305f0b.classList.remove("is-open");
      if (this._onSmartClipDocDown) {
        document.removeEventListener("pointerdown", this._onSmartClipDocDown, true);
        this._onSmartClipDocDown = null;
      }
    };
    const _0x1f0583 = () => {
      if (_0x139359.dataset.loading === "true") {
        return;
      }
      _0x165814();
      _0x305f0b.classList.add("is-open");
      if (!this._onSmartClipDocDown) {
        this._onSmartClipDocDown = _0x4fc4f9 => {
          if (!this.active) {
            return;
          }
          const _0x1cef22 = _0x4fc4f9?.target;
          if (!_0x1cef22) {
            return;
          }
          if (_0x4421ef.contains(_0x1cef22)) {
            return;
          }
          _0x56ba37();
        };
        document.addEventListener("pointerdown", this._onSmartClipDocDown, true);
      }
    };
    const _0x3b829c = () => {
      if (_0x305f0b.classList.contains("is-open")) {
        _0x56ba37();
      } else {
        _0x1f0583();
      }
    };
    const _0x51b38b = _0x5c859e => {
      this._smartClipMode = _0x5c859e;
      _0x165814();
    };
    const _0x133ca6 = _0x6cf6cb => {
      this._smartClipOutputMode = normalizeSmartClipOutputMode(_0x6cf6cb);
      _0x165814();
    };
    const _0x50a649 = _0x3193d2 => {
      this._smartClipFps = normalizeSmartClipFps(_0x3193d2);
      _0x165814();
    };
    _0x5c81d8.forEach(_0x35ea2a => {
      _0x35ea2a.onclick = _0x236665 => {
        _0x236665.stopPropagation();
        _0x133ca6(_0x35ea2a.dataset.outputMode);
      };
    });
    [_0x2bd15f, _0x31f256, _0x417ae8].forEach(_0xcbda0e => {
      _0xcbda0e.onclick = _0x4c3a98 => {
        _0x4c3a98.stopPropagation();
        _0x51b38b(_0xcbda0e.dataset.mode || "stable");
      };
    });
    _0x273b50.forEach(_0x2ec931 => {
      _0x2ec931.onclick = _0x5c672e => {
        _0x5c672e.stopPropagation();
        _0x50a649(_0x2ec931.dataset.fps);
      };
    });
    _0x273ce5.onmousedown = _0x45e26b => {
      if (_0x45e26b.button !== 0) {
        return;
      }
      _0x45e26b.preventDefault();
      _0x45e26b.stopPropagation();
      const _0x4e042e = document;
      const _0x31f9aa = normalizeSmartClipMaxSegments(this._smartClipMaxSegments);
      _0x58adda();
      this._smartClipMaxSegmentDrag = {
        x: _0x45e26b.clientX,
        base: _0x31f9aa,
        last: _0x31f9aa,
        moved: false,
        el: _0x273ce5,
        doc: _0x4e042e
      };
      _0x273ce5.classList.add("is-dragging");
      _0x4e042e.addEventListener("mousemove", this._onSmartClipMaxSegmentDragMove);
      _0x4e042e.addEventListener("mouseup", this._onSmartClipMaxSegmentDragUp);
    };
    _0x273ce5.onclick = _0x3dbe73 => {
      _0x3dbe73.stopPropagation();
      if (this._suppressSmartClipMaxSegmentClick) {
        this._suppressSmartClipMaxSegmentClick = false;
        return;
      }
      _0xccae33();
    };
    _0x273ce5.onkeydown = _0xa6d78e => {
      _0xa6d78e.stopPropagation();
      if (_0xa6d78e.key === "Enter" || _0xa6d78e.key === " ") {
        _0xa6d78e.preventDefault();
        _0xccae33();
        return;
      }
      if (_0xa6d78e.key === "ArrowRight" || _0xa6d78e.key === "ArrowUp") {
        _0xa6d78e.preventDefault();
        _0x1d279c(Number(this._smartClipMaxSegments) + 1);
        return;
      }
      if (_0xa6d78e.key === "ArrowLeft" || _0xa6d78e.key === "ArrowDown") {
        _0xa6d78e.preventDefault();
        _0x1d279c(Number(this._smartClipMaxSegments) - 1);
      }
    };
    _0x2d1046.onclick = _0x40e4c2 => {
      _0x40e4c2.stopPropagation();
      _0x56ba37();
    };
    const _0x27961a = async ({
      mode: _0x187fd8,
      maxSegments: _0x34d98d,
      fps: _0xbd359d,
      outputMode: _0xe6b1e0
    }) => {
      const _0x39143a = normalizeSmartClipOutputMode(_0xe6b1e0);
      const _0x75b23 = _0x39143a === SMART_CLIP_OUTPUT_MODE_KEYFRAMES;
      _0x139359.dataset.loading = "true";
      _0x139359.disabled = true;
      _0x139359.innerHTML = _0x69ea04 + " " + escapeClipHelperHtml(videoClipText("smartClip.preparing"));
      window.showToast?.(_0x75b23 ? videoClipText("smartClip.startedKeyframes") : videoClipText("smartClip.startedSegments"), "info");
      try {
        const _0x3fdba3 = await runSmartClipFromVideoNode({
          nodeId: this.anchorNodeId,
          options: {
            mode: _0x187fd8,
            maxSegments: _0x34d98d,
            fps: _0xbd359d,
            outputMode: _0x39143a
          },
          shouldContinue: () => this.active,
          onProgress: _0x2ac0a9 => {
            if (!_0x139359?.isConnected || !_0x2ac0a9?.text) {
              return;
            }
            _0x139359.innerHTML = _0x69ea04 + " " + _0x2ac0a9.text;
          }
        });
        if (!_0x3fdba3?.ok) {
          window.showToast?.(_0x3fdba3?.reason === "no-segments" ? videoClipText("smartClip.noSegments") : _0x75b23 ? videoClipText("smartClip.noKeyframes") : videoClipText("smartClip.noResults"), _0x3fdba3?.reason === "no-segments" ? "info" : "error");
          return;
        }
        window.showToast?.(_0x75b23 ? videoClipText("smartClip.completeKeyframes", {
          count: _0x3fdba3.nodeIds.length
        }) : videoClipText("smartClip.completeSegments", {
          count: _0x3fdba3.nodeIds.length
        }), "success");
        this.exit({
          silent: true
        });
      } catch (_0x4ac6e4) {
        const _0x475b9e = _0x4ac6e4 instanceof Error ? _0x4ac6e4.message : String(_0x4ac6e4 || videoClipText("errors.smartClipFailed"));
        window.showToast?.(videoClipText("smartClip.failedWithError", {
          error: _0x475b9e
        }), "error");
      } finally {
        _0x56ba37();
        if (_0x139359 && _0x139359.isConnected) {
          _0x139359.dataset.loading = "false";
          _0x139359.disabled = false;
          _0x139359.innerHTML = _0x48c776 + " " + _0x26d460();
        }
      }
    };
    _0x53f487.onclick = async _0x422886 => {
      _0x422886.stopPropagation();
      _0x56ba37();
      const _0x4e501d = this._smartClipMode || "stable";
      const _0x1e5332 = normalizeSmartClipMaxSegments(this._smartClipMaxSegments);
      const _0x1964a7 = normalizeSmartClipFps(this._smartClipFps);
      const _0x54e042 = normalizeSmartClipOutputMode(this._smartClipOutputMode);
      await _0x27961a({
        mode: _0x4e501d,
        maxSegments: _0x1e5332,
        fps: _0x1964a7,
        outputMode: _0x54e042
      });
    };
    _0x139359.onclick = _0x353ed1 => {
      _0x353ed1.stopPropagation();
      _0x3b829c();
    };
    _0x2cf399.onclick = async _0x4a4bfd => {
      _0x4a4bfd.stopPropagation();
      _0x56ba37();
      if (_0x2cf399.dataset.loading === "true") {
        return;
      }
      _0x2cf399.dataset.loading = "true";
      _0x2cf399.disabled = true;
      _0x2cf399.innerHTML = _0x69ea04;
      try {
        const _0x3650db = this.videoEl || this._getVideoEl();
        await extractCurrentVideoFrameToImageNode({
          videoEl: _0x3650db,
          anchorNodeId: this.anchorNodeId,
          fallbackDurationSec: this._readDurationSec(_0x3650db) || this.durationSec,
          logPrefix: "[VideoClipController]"
        });
      } finally {
        if (_0x2cf399 && _0x2cf399.isConnected) {
          _0x2cf399.dataset.loading = "false";
          _0x2cf399.disabled = false;
          _0x2cf399.innerHTML = _0x27c112;
        }
      }
    };
    _0x4421ef.appendChild(_0x139359);
    _0x4421ef.appendChild(_0x305f0b);
    _0x1367db.appendChild(_0x4421ef);
    _0x1367db.appendChild(_0x2cf399);
    _0x5642bd.appendChild(_0x204a14);
    if (!this._sourceOptions) {
      _0x5642bd.appendChild(_0x1367db);
    }
    _0x3ebf0c.appendChild(_0x3df1a5);
    _0x3ebf0c.appendChild(_0x545ede);
    _0x3ebf0c.appendChild(_0x574843);
    _0x2f471f.appendChild(_0x27fd95);
    _0x2f471f.appendChild(_0x3ebf0c);
    _0x2f471f.appendChild(_0x1a0b82);
    _0x2f471f.appendChild(_0x4a1020);
    _0x2f471f.appendChild(_0x5a2333);
    _0x59d638.appendChild(_0x424d7a);
    _0x59d638.appendChild(_0x2f471f);
    if (_0x4c34e6) {
      _0x59d638.appendChild(_0x4c34e6);
    }
    _0x59d638.appendChild(_0x1fffa1);
    _0x4e7cb9.appendChild(_0x59d638);
    _0x4e7cb9.appendChild(_0x5642bd);
    this.wrapperEl.appendChild(_0x4e7cb9);
    this.barEl = _0x4e7cb9;
    this.cancelBtnEl = _0x424d7a;
    this.reverseBtnEl = _0x4c34e6;
    this.confirmBtnEl = _0x1fffa1;
    this.trackEl = _0x2f471f;
    this.selectionEl = _0x3df1a5;
    this.leftHandleEl = _0x545ede;
    this.rightHandleEl = _0x574843;
    this.playheadEl = _0x1a0b82;
    this.labelEl = _0x5a2333;
    this.thumbEls = _0x36c039;
  },
  _isSourceReverseEditLocked() {
    const _0x178e04 = this._reverseControl;
    return Boolean(_0x178e04 && (_0x178e04.pending === true || _0x178e04.isReversed !== _0x178e04.materializedIsReversed));
  },
  _renderSourceReverseControl() {
    const _0x12b941 = this._reverseControl;
    const _0x539807 = this.reverseBtnEl;
    const _0x3f383a = this._isSourceReverseEditLocked();
    if (this.barEl) {
      this.barEl.classList.toggle("is-reverse-locked", _0x3f383a);
      this.barEl.setAttribute("aria-busy", String(_0x12b941?.pending === true));
    }
    if (this.trackEl) {
      this.trackEl.setAttribute("aria-disabled", String(_0x3f383a));
    }
    if (!_0x12b941 || !_0x539807) {
      return;
    }
    const _0x18610d = resolveMediaClipReverseControlState(_0x12b941);
    const _0x58c6a2 = this.confirmBtnEl?.dataset?.loading === "true";
    _0x539807.classList.toggle("is-active", _0x18610d.isReversed);
    _0x539807.classList.toggle("is-loading", _0x18610d.pending);
    _0x539807.disabled = _0x18610d.pending || _0x58c6a2;
    _0x539807.dataset.tooltip = _0x18610d.label;
    _0x539807.title = _0x18610d.label;
    _0x539807.setAttribute("aria-label", _0x18610d.label);
    _0x539807.setAttribute("aria-pressed", _0x18610d.ariaPressed);
    _0x539807.setAttribute("aria-busy", _0x18610d.ariaBusy);
  },
  async _replaceSourceAfterReverse(_0x5e0863 = {}) {
    const _0x53707f = this._sourceOptions;
    if (!_0x53707f) {
      throw new Error("当前裁剪视频源已失效");
    }
    const _0x480c7f = String(_0x5e0863.sourceLocalPath || "").trim();
    const _0x851162 = localPathToUrl(_0x480c7f) || String(_0x5e0863.sourceUrl || "").trim();
    if (!_0x851162) {
      throw new Error("倒放完成后未返回可用的视频源");
    }
    const _0x221335 = Number(this.durationSec) || 0;
    const _0x3d8802 = {
      startSec: this.startSec,
      endSec: this.endSec
    };
    const _0x3f2d33 = mirrorMediaClipRange({
      startSec: this.startSec,
      endSec: this.endSec,
      durationSec: _0x221335
    });
    this.startSec = _0x3f2d33.startSec;
    this.endSec = _0x3f2d33.endSec;
    if (this.videoEl) {
      if (this._onLoadedMeta) {
        this.videoEl.removeEventListener("loadedmetadata", this._onLoadedMeta);
      }
      if (this._onDurationChange) {
        this.videoEl.removeEventListener("durationchange", this._onDurationChange);
      }
    }
    this._onLoadedMeta = null;
    this._onDurationChange = null;
    this._sourceOptions = {
      ..._0x53707f,
      sourceLocalPath: _0x480c7f,
      sourceUrl: _0x851162,
      durationSec: _0x221335,
      ...(_0x5e0863.posterUrl ? {
        posterUrl: String(_0x5e0863.posterUrl).trim()
      } : {}),
      sourceData: {
        ...(_0x53707f.sourceData || {}),
        localPath: _0x480c7f,
        videoDuration: _0x221335
      }
    };
    try {
      await this._syncDurationAndDefaults();
    } catch (_0x1c39c3) {
      this._sourceOptions = _0x53707f;
      this.startSec = _0x3d8802.startSec;
      this.endSec = _0x3d8802.endSec;
      if (this.active) {
        try {
          await this._syncDurationAndDefaults();
        } catch (_0x3f037a) {}
      }
      throw _0x1c39c3;
    }
    if (!this.active) {
      return false;
    }
    const _0x5838e7 = this.videoEl || this._getVideoEl();
    if (_0x5838e7) {
      try {
        _0x5838e7.currentTime = this.startSec;
      } catch (_0x25b048) {}
    }
    this._render();
    return true;
  },
  async _toggleSourceReverse() {
    const _0x3d7871 = this._reverseControl;
    if (!this.active || !_0x3d7871 || _0x3d7871.pending === true || this.confirmBtnEl?.dataset?.loading === "true") {
      return false;
    }
    const _0x446096 = ++this._reverseRequestToken;
    const _0x27e585 = {
      isReversed: _0x3d7871.isReversed,
      materializedIsReversed: _0x3d7871.materializedIsReversed
    };
    const _0x438ee4 = !_0x3d7871.isReversed;
    let _0x28da8f = false;
    this._pauseRangePlaybackForRangeEdit();
    _0x3d7871.isReversed = _0x438ee4;
    _0x3d7871.pending = true;
    this._render();
    try {
      const _0xaafa11 = await _0x3d7871.onChange(_0x438ee4);
      if (!this.active || _0x446096 !== this._reverseRequestToken || _0x3d7871 !== this._reverseControl) {
        return false;
      }
      _0x28da8f = true;
      const _0x357b53 = typeof _0xaafa11?.isReversed === "boolean" ? _0xaafa11.isReversed : _0x438ee4;
      const _0x5956f7 = typeof _0xaafa11?.materializedIsReversed === "boolean" ? _0xaafa11.materializedIsReversed : _0xaafa11?.ok === false ? _0x27e585.materializedIsReversed : _0x357b53;
      _0x3d7871.isReversed = _0x357b53;
      if (_0xaafa11?.ok === false) {
        _0x3d7871.materializedIsReversed = _0x27e585.materializedIsReversed;
        if (!_0xaafa11?.suppressToast && _0xaafa11?.error) {
          window.showToast?.(String(_0xaafa11.error), "error");
        }
        return false;
      }
      if (_0x357b53 !== _0x5956f7) {
        _0x3d7871.materializedIsReversed = _0x5956f7;
        return false;
      }
      if (_0x5956f7 !== _0x27e585.materializedIsReversed) {
        await this._replaceSourceAfterReverse(_0xaafa11);
      }
      _0x3d7871.materializedIsReversed = _0x5956f7;
      return true;
    } catch (_0x442e6a) {
      if (this.active && _0x446096 === this._reverseRequestToken && _0x3d7871 === this._reverseControl) {
        if (!_0x28da8f) {
          _0x3d7871.isReversed = _0x27e585.isReversed;
        }
        _0x3d7871.materializedIsReversed = _0x27e585.materializedIsReversed;
        window.showToast?.(_0x442e6a?.message || "视频倒放失败，请重试。", "error");
      }
      return false;
    } finally {
      if (this.active && _0x446096 === this._reverseRequestToken && _0x3d7871 === this._reverseControl) {
        _0x3d7871.pending = false;
        this._render();
      }
    }
  },
  _bindEvents() {
    if (!this.barEl) {
      return;
    }
    this.cancelBtnEl?.addEventListener("click", _0x4224f5 => {
      _0x4224f5.stopPropagation();
      this.exit();
    });
    this.confirmBtnEl?.addEventListener("click", _0xdfac18 => {
      _0xdfac18.stopPropagation();
      this._confirm();
    });
    this.reverseBtnEl?.addEventListener("click", _0x3d1637 => {
      _0x3d1637.stopPropagation();
      this._toggleSourceReverse();
    });
    const _0x1248fa = _0x41766e => {
      if (!this.trackEl || !this.active || this._dragMode || this._isSourceReverseEditLocked()) {
        return;
      }
      const _0x40855e = _0x41766e.clientX;
      const _0x441886 = this.selectionEl.getBoundingClientRect();
      const _0x3e09ff = 20;
      const _0x5d738e = Math.abs(_0x40855e - _0x441886.left) < _0x3e09ff;
      const _0xb8ac47 = Math.abs(_0x40855e - _0x441886.right) < _0x3e09ff;
      if (_0x5d738e) {
        this.leftHandleEl.classList.add("hover-active");
        this.rightHandleEl.classList.remove("hover-active");
        this.selectionEl.style.cursor = "var(--resize-ew-cursor)";
      } else if (_0xb8ac47) {
        this.rightHandleEl.classList.add("hover-active");
        this.leftHandleEl.classList.remove("hover-active");
        this.selectionEl.style.cursor = "var(--resize-ew-cursor)";
      } else {
        this.leftHandleEl.classList.remove("hover-active");
        this.rightHandleEl.classList.remove("hover-active");
        this.selectionEl.style.cursor = "var(--grab-cursor)";
      }
    };
    this.trackEl?.addEventListener("pointermove", _0x1248fa);
    const _0x594258 = 30;
    const _0x124a1c = _0x498eff => Number(_0x498eff || 1) / _0x594258 * 1;
    const _0x326523 = () => {
      const _0x4e3eae = this.durationSec;
      if (!Number.isFinite(_0x4e3eae) || _0x4e3eae <= 0) {
        return 0.1;
      }
      return Math.min(0.1, _0x4e3eae);
    };
    const _0x119261 = (_0x3d14d5, _0x5e21ae, _0x30fc5b) => Math.max(_0x5e21ae, Math.min(_0x30fc5b, _0x3d14d5));
    const _0x278232 = _0x50872d => {
      if (!this.trackEl || !this.active) {
        return;
      }
      const _0xa1afc8 = this.durationSec;
      if (!Number.isFinite(_0xa1afc8) || _0xa1afc8 <= 0) {
        return;
      }
      const _0x53f239 = this.videoEl || this._getVideoEl();
      if (!_0x53f239) {
        return;
      }
      const _0x461067 = this.trackEl.getBoundingClientRect();
      if (!_0x461067.width) {
        return;
      }
      const _0x5b0c5c = _0x50872d - _0x461067.left;
      const _0x32d47a = _0x119261(_0x5b0c5c / _0x461067.width, 0, 1);
      const _0x2de8c3 = _0x32d47a * _0xa1afc8;
      const _0x3cf8a9 = Math.max(0, _0xa1afc8 - 0.001);
      const _0x48a064 = _0x119261(_0x2de8c3, 0, _0x3cf8a9);
      this._pauseRangePlaybackForRangeEdit(_0x53f239);
      this._pendingPlaybackStartSec = _0x48a064;
      try {
        _0x53f239.currentTime = _0x48a064;
      } catch (_0x213d06) {}
      this._renderPlayhead();
    };
    const _0x1e89c2 = () => {
      const _0x1d6ab8 = this.videoEl || this._getVideoEl();
      if (!_0x1d6ab8) {
        return;
      }
      if (!_0x1d6ab8.paused) {
        return;
      }
      const _0x5d3e77 = Number(_0x1d6ab8.currentTime) || 0;
      if (_0x5d3e77 >= this.startSec && _0x5d3e77 <= this.endSec) {
        return;
      }
      try {
        _0x1d6ab8.currentTime = this.startSec;
      } catch (_0x9697ee) {}
    };
    const _0x59e942 = (_0x47b362, _0x370b93) => {
      const _0x39b5e4 = this.durationSec;
      if (!Number.isFinite(_0x39b5e4) || _0x39b5e4 <= 0) {
        return;
      }
      const _0x2f8eb5 = this._pauseRangePlaybackForRangeEdit();
      const _0x3f9f0c = _0x124a1c(_0x370b93) * (_0x47b362 >= 0 ? 1 : -1);
      const _0x24ba4e = _0x326523();
      const _0x49a1b5 = Math.max(_0x24ba4e, this.endSec - this.startSec);
      let _0x2aef39 = this.startSec + _0x3f9f0c;
      let _0x25f1a9 = this.endSec + _0x3f9f0c;
      if (_0x2aef39 < 0) {
        _0x2aef39 = 0;
        _0x25f1a9 = _0x49a1b5;
      }
      if (_0x25f1a9 > _0x39b5e4) {
        _0x25f1a9 = _0x39b5e4;
        _0x2aef39 = Math.max(0, _0x39b5e4 - _0x49a1b5);
      }
      this.startSec = _0x2aef39;
      this.endSec = _0x25f1a9;
      if (_0x2f8eb5) {
        try {
          _0x2f8eb5.currentTime = _0x2aef39;
        } catch (_0x1d2ec6) {}
      } else {
        _0x1e89c2();
      }
      this._render();
    };
    const _0x4e592b = _0x3190bc => {
      const _0x4800fc = this.durationSec;
      if (!Number.isFinite(_0x4800fc) || _0x4800fc <= 0) {
        return;
      }
      const _0x7a4a3a = this._pauseRangePlaybackForRangeEdit();
      const _0x38c2da = _0x124a1c(1) * (_0x3190bc >= 0 ? 1 : -1);
      const _0x284874 = _0x326523();
      const _0x544f89 = Math.max(0, this.endSec - _0x284874);
      this.startSec = _0x119261(this.startSec + _0x38c2da, 0, _0x544f89);
      if (_0x7a4a3a) {
        try {
          _0x7a4a3a.currentTime = this.startSec;
        } catch (_0x4a0a5f) {}
      }
      this._render();
    };
    const _0x376471 = _0xf0d657 => {
      const _0x4e4f99 = this.durationSec;
      if (!Number.isFinite(_0x4e4f99) || _0x4e4f99 <= 0) {
        return;
      }
      const _0x289458 = this._pauseRangePlaybackForRangeEdit();
      const _0x484847 = _0x124a1c(1) * (_0xf0d657 >= 0 ? 1 : -1);
      const _0x18150b = _0x326523();
      const _0x5e4dc2 = Math.min(_0x4e4f99, this.startSec + _0x18150b);
      this.endSec = _0x119261(this.endSec + _0x484847, _0x5e4dc2, _0x4e4f99);
      if (_0x289458) {
        try {
          _0x289458.currentTime = this.endSec;
        } catch (_0x3168ee) {}
      }
      this._render();
    };
    const _0x1931fd = _0x50375e => {
      const _0x48e3d2 = this.durationSec;
      if (!Number.isFinite(_0x48e3d2) || _0x48e3d2 <= 0) {
        return;
      }
      const _0x1c4668 = this.videoEl || this._getVideoEl();
      if (!_0x1c4668) {
        return;
      }
      this._pauseRangePlaybackForRangeEdit(_0x1c4668);
      let _0x118f27 = Number(_0x1c4668.currentTime) || 0;
      _0x118f27 = _0x119261(_0x118f27, 0, _0x48e3d2);
      const _0x56329d = _0x326523();
      if (_0x50375e === "in") {
        const _0x1c3723 = Math.max(0, this.endSec - _0x56329d);
        this.startSec = _0x119261(_0x118f27, 0, _0x1c3723);
      } else {
        const _0x3cfb33 = Math.min(_0x48e3d2, this.startSec + _0x56329d);
        this.endSec = _0x119261(_0x118f27, _0x3cfb33, _0x48e3d2);
      }
      this._render();
    };
    const _0x38fd83 = _0x5526a1 => {
      if (!this.trackEl || !this.active || this._isSourceReverseEditLocked()) {
        return;
      }
      const _0x403dfa = _0x5526a1.target.closest(".v2-video-cliphandle");
      const _0x1c0588 = !!_0x5526a1.target.closest(".v2-video-clipselection");
      const _0x52feaf = this.trackEl.getBoundingClientRect();
      if (!_0x52feaf.width) {
        return;
      }
      const _0x3cfa85 = _0x5526a1.clientX;
      const _0x5abe62 = this.selectionEl.getBoundingClientRect();
      const _0x192a78 = 20;
      const _0x2c2069 = Math.abs(_0x3cfa85 - _0x5abe62.left) < _0x192a78;
      const _0x86f294 = Math.abs(_0x3cfa85 - _0x5abe62.right) < _0x192a78;
      if (_0x2c2069 || _0x403dfa && _0x403dfa.dataset.handle === "left") {
        this._dragMode = "left";
        this.leftHandleEl.classList.add("hover-active");
      } else if (_0x86f294 || _0x403dfa && _0x403dfa.dataset.handle === "right") {
        this._dragMode = "right";
        this.rightHandleEl.classList.add("hover-active");
      } else if (_0x1c0588) {
        this._dragMode = "move";
      } else {
        this._dragMode = "scrub";
      }
      if (this._dragMode === "move") {
        const _0x4552c3 = this.selectionEl.getBoundingClientRect();
        this._dragOffsetPx = _0x5526a1.clientX - _0x4552c3.left;
      } else {
        this._dragOffsetPx = 0;
      }
      _0x5526a1.preventDefault();
      _0x5526a1.stopPropagation();
      const _0x5645a9 = Number(_0x5526a1.clientX || 0);
      let _0x4bcb46 = false;
      if (this._dragMode === "scrub") {
        _0x278232(_0x5526a1.clientX);
      } else if (this._dragMode !== "move") {
        this._handleDragAtClientX(_0x5526a1.clientX);
      }
      this._onPointerMove = _0x96e27d => {
        if (!this.active || !this.trackEl) {
          return;
        }
        _0x96e27d.preventDefault();
        _0x96e27d.stopPropagation();
        const _0x2d085c = Number(_0x96e27d.clientX || 0);
        if (this._dragMode === "scrub") {
          _0x278232(_0x2d085c);
          return;
        }
        if (this._dragMode === "move") {
          if (!_0x4bcb46 && Math.abs(_0x2d085c - _0x5645a9) <= 2) {
            return;
          }
          _0x4bcb46 = true;
        }
        this._handleDragAtClientX(_0x2d085c);
      };
      this._onPointerUp = _0x327903 => {
        if (!this.active) {
          return;
        }
        _0x327903.preventDefault();
        _0x327903.stopPropagation();
        const _0x5e3bee = this._dragMode;
        const _0x167e2b = shouldVideoClipSelectionPointerUpSeek(_0x5e3bee, _0x4bcb46);
        const _0x4cb57b = Number.isFinite(Number(_0x327903.clientX)) ? Number(_0x327903.clientX) : _0x5645a9;
        window.removeEventListener("pointermove", this._onPointerMove, true);
        window.removeEventListener("pointerup", this._onPointerUp, true);
        this._dragMode = null;
        this._dragOffsetPx = 0;
        this.leftHandleEl?.classList.remove("hover-active");
        this.rightHandleEl?.classList.remove("hover-active");
        this._onPointerMove = null;
        this._onPointerUp = null;
        if (_0x167e2b) {
          _0x278232(_0x4cb57b);
        }
      };
      window.addEventListener("pointermove", this._onPointerMove, true);
      window.addEventListener("pointerup", this._onPointerUp, true);
    };
    this.trackEl?.addEventListener("pointerdown", _0x38fd83);
    this.trackEl?.addEventListener("wheel", _0xf8dfc2 => {
      if (!this.active || this._isSourceReverseEditLocked()) {
        return;
      }
      _0xf8dfc2.preventDefault();
      _0xf8dfc2.stopPropagation();
      const _0x445c51 = Number(_0xf8dfc2.deltaX) || 0;
      const _0x547bbe = Number(_0xf8dfc2.deltaY) || 0;
      const _0x5f4e50 = Math.abs(_0x445c51) > Math.abs(_0x547bbe) ? _0x445c51 : _0x547bbe;
      if (!_0x5f4e50) {
        return;
      }
      const _0x31e6de = _0x5f4e50 > 0 ? 1 : -1;
      if (_0xf8dfc2.ctrlKey || _0xf8dfc2.metaKey) {
        _0x4e592b(_0x31e6de);
      } else if (_0xf8dfc2.altKey) {
        _0x376471(_0x31e6de);
      } else {
        const _0x1136ad = _0xf8dfc2.shiftKey ? 10 : 1;
        _0x59e942(_0x31e6de, _0x1136ad);
      }
    }, {
      passive: false
    });
    this.selectionEl?.addEventListener("dblclick", _0x3822b5 => {
      if (!this.active || this._isSourceReverseEditLocked()) {
        return;
      }
      _0x3822b5.preventDefault();
      _0x3822b5.stopPropagation();
      const _0x3085f2 = this.durationSec;
      if (!_0x3085f2 || !Number.isFinite(_0x3085f2) || _0x3085f2 <= 0) {
        return;
      }
      const _0xe02c88 = this.selectionEl.getBoundingClientRect();
      const _0x38b014 = _0x3822b5.clientX;
      const _0x44d107 = 24;
      if (_0x38b014 - _0xe02c88.left < _0x44d107 || _0xe02c88.right - _0x38b014 < _0x44d107) {
        return;
      }
      const _0x164927 = Math.min(3, _0x3085f2);
      const _0x3666b3 = (this.startSec + this.endSec) / 2;
      const _0x343fb = Math.max(0, Math.min(_0x3085f2 - _0x164927, _0x3666b3 - _0x164927 / 2));
      const _0x5dc374 = this._pauseRangePlaybackForRangeEdit();
      this.startSec = _0x343fb;
      this.endSec = _0x343fb + _0x164927;
      if (_0x5dc374 && _0x5dc374.paused) {
        _0x5dc374.currentTime = this.startSec;
      }
      this._render();
    });
    this._onKeyDown = _0x9e6844 => {
      if (!this.active) {
        return;
      }
      if (_0x9e6844.key === "Escape") {
        _0x9e6844.preventDefault();
        this.exit();
        return;
      }
      if (this._isSourceReverseEditLocked()) {
        return;
      }
      if (_0x9e6844.key === " " || _0x9e6844.code === "Space") {
        this._handlePlaybackShortcutKey(_0x9e6844);
        return;
      }
      if (_0x9e6844.key === "i" || _0x9e6844.key === "I") {
        _0x9e6844.preventDefault();
        _0x1931fd("in");
        return;
      }
      if (_0x9e6844.key === "o" || _0x9e6844.key === "O") {
        _0x9e6844.preventDefault();
        _0x1931fd("out");
        return;
      }
      if (_0x9e6844.key === "ArrowLeft" || _0x9e6844.key === "ArrowRight") {
        _0x9e6844.preventDefault();
        const _0x23688d = _0x9e6844.key === "ArrowRight" ? 1 : -1;
        if (_0x9e6844.ctrlKey || _0x9e6844.metaKey) {
          _0x4e592b(_0x23688d);
          return;
        }
        if (_0x9e6844.altKey) {
          _0x376471(_0x23688d);
          return;
        }
        const _0x478ae7 = _0x9e6844.shiftKey ? 10 : 1;
        _0x59e942(_0x23688d, _0x478ae7);
      }
    };
    window.addEventListener("keydown", this._onKeyDown, true);
    if (this._onDocClick) {
      document.removeEventListener("pointerdown", this._onDocClick, true);
      this._onDocClick = null;
    }
    this._onDocClick = _0xb4b273 => {
      if (!this.active || !this.barEl) {
        return;
      }
      if (this.barEl.contains(_0xb4b273.target)) {
        return;
      }
      this.exit({
        silent: true,
        reason: "dismiss"
      });
    };
    document.addEventListener("pointerdown", this._onDocClick, true);
  },
  _getVideoEl() {
    if (!this.wrapperEl) {
      return null;
    }
    if (this._sourceOptions && this.videoEl && this.videoEl.isConnected && this.wrapperEl.contains?.(this.videoEl)) {
      return this.videoEl;
    }
    const _0x5cb5f6 = Array.from(this.wrapperEl.querySelectorAll("video"));
    let _0x938516 = null;
    let _0x3806bc = null;
    for (const _0x5c0d8f of _0x5cb5f6) {
      if (!_0x5c0d8f) {
        continue;
      }
      const _0x497a66 = window.getComputedStyle(_0x5c0d8f);
      if (_0x497a66.display === "none" || _0x497a66.visibility === "hidden") {
        continue;
      }
      const _0x2eac13 = Number(_0x497a66.opacity);
      if (Number.isFinite(_0x2eac13) && _0x2eac13 <= 0) {
        continue;
      }
      const _0x27d17b = _0x5c0d8f.getBoundingClientRect();
      if (!_0x27d17b.width || !_0x27d17b.height) {
        continue;
      }
      if (!_0x938516) {
        _0x938516 = _0x5c0d8f;
      }
      const _0x4a6aef = String(_0x5c0d8f.currentSrc || _0x5c0d8f.getAttribute("src") || "").trim();
      if (_0x4a6aef) {
        _0x3806bc = _0x5c0d8f;
        break;
      }
    }
    this.videoEl = _0x3806bc || _0x938516 || null;
    return this.videoEl;
  },
  _getVideoElementSource(_0x18084b) {
    return String(_0x18084b?.getAttribute?.("src") || _0x18084b?.currentSrc || _0x18084b?.src || "").trim();
  },
  _setClipMediaKeepAlive(_0x4c7a64, _0x54e93b) {
    if (!_0x4c7a64?.dataset) {
      return;
    }
    if (_0x54e93b) {
      _0x4c7a64.dataset.desktopMediaKeepAlive = "video-clip";
      return;
    }
    if (_0x4c7a64.dataset.desktopMediaKeepAlive === "video-clip") {
      delete _0x4c7a64.dataset.desktopMediaKeepAlive;
    }
  },
  _readDurationSec(_0x1184e8) {
    if (!_0x1184e8) {
      return 0;
    }
    const _0x353b47 = Number(_0x1184e8.duration);
    if (Number.isFinite(_0x353b47) && _0x353b47 > 0) {
      return _0x353b47;
    }
    const _0x4a161b = _0x1184e8.seekable;
    if (_0x4a161b && _0x4a161b.length) {
      const _0x281c0c = Number(_0x4a161b.end(_0x4a161b.length - 1));
      if (Number.isFinite(_0x281c0c) && _0x281c0c > 0) {
        return _0x281c0c;
      }
    }
    return 0;
  },
  _resolveKnownDurationSec(_0xc064a4) {
    const _0x1f9d54 = pickSelectedVideoItem(_0xc064a4);
    const _0x1b1edf = pickPositiveNumber(_0x1f9d54?.videoDuration, _0x1f9d54?.duration, _0xc064a4?.videoDuration, _0xc064a4?.duration);
    if (_0x1b1edf > 0) {
      return _0x1b1edf;
    }
    const _0x3c888d = pickPositiveNumber(_0x1f9d54?.videoFrameCount, _0x1f9d54?.frameCount, _0xc064a4?.videoFrameCount, _0xc064a4?.frameCount);
    const _0x3ee1ca = pickPositiveNumber(_0x1f9d54?.videoFps, _0x1f9d54?.fps, _0xc064a4?.videoFps, _0xc064a4?.fps);
    if (_0x3c888d > 0 && _0x3ee1ca > 0) {
      return _0x3c888d / _0x3ee1ca;
    } else {
      return 0;
    }
  },
  _resolveActiveVideoData() {
    if (!this._sourceOptions) {
      return a1436_0x3e8327.getState().nodes?.[this.nodeId] || null;
    }
    const _0x51e8c7 = this._sourceOptions.sourceData && typeof this._sourceOptions.sourceData === "object" ? this._sourceOptions.sourceData : {};
    return {
      ..._0x51e8c7,
      src: this._sourceOptions.sourceUrl,
      videoUrl: this._sourceOptions.sourceUrl,
      localPath: String(this._sourceOptions.sourceLocalPath || _0x51e8c7.localPath || ""),
      videoDuration: pickPositiveNumber(this._sourceOptions.durationSec, _0x51e8c7.videoDuration, _0x51e8c7.duration),
      videoWidth: pickPositiveNumber(this._sourceOptions.videoWidth, _0x51e8c7.videoWidth, _0x51e8c7.width),
      videoHeight: pickPositiveNumber(this._sourceOptions.videoHeight, _0x51e8c7.videoHeight, _0x51e8c7.height),
      thumbUrl: String(this._sourceOptions.posterUrl || _0x51e8c7.thumbUrl || _0x51e8c7.posterUrl || "")
    };
  },
  _resolveActiveVideoSrc() {
    if (this._sourceOptions) {
      return localPathToUrl(this._sourceOptions.sourceLocalPath) || String(this._sourceOptions.sourceUrl || "").trim();
    }
    return this._resolveVideoSrcFromNode(this._resolveActiveVideoData());
  },
  _applyDurationSec(_0xbbd775) {
    const _0x1e4d62 = Number(_0xbbd775);
    if (!Number.isFinite(_0x1e4d62) || _0x1e4d62 <= 0) {
      return false;
    }
    this.durationSec = _0x1e4d62;
    if (!(this.endSec > this.startSec)) {
      const _0x57915e = Math.min(3, _0x1e4d62);
      const _0x4401f5 = Math.max(0, (_0x1e4d62 - _0x57915e) / 2);
      this.startSec = _0x4401f5;
      this.endSec = _0x4401f5 + _0x57915e;
      return true;
    }
    this.startSec = Math.max(0, Math.min(this.startSec, _0x1e4d62));
    this.endSec = Math.max(0, Math.min(this.endSec, _0x1e4d62));
    if (this.endSec <= this.startSec) {
      const _0x519ac6 = Math.min(3, _0x1e4d62);
      this.startSec = 0;
      this.endSec = _0x519ac6;
    }
    return true;
  },
  async _applyVideoMetaDurationFallback(_0x31d5af, _0x566596) {
    const _0x326e3b = String(_0x31d5af || "").trim();
    if (!_0x326e3b) {
      return;
    }
    try {
      const _0x5a6c75 = await fetchVideoMetaFromServer(_0x326e3b);
      if (!this.active || _0x566596 !== this._sourceToken) {
        return;
      }
      const _0x31a426 = _0x5a6c75 && typeof _0x5a6c75 === "object" && _0x5a6c75.data ? _0x5a6c75.data : _0x5a6c75;
      const _0x576f91 = pickPositiveNumber(_0x31a426?.duration, _0x31a426?.videoDuration, _0x31a426?.format?.duration, _0x31a426?.stream?.duration);
      if (this._applyDurationSec(_0x576f91)) {
        this._render();
        this._startPlayheadLoop();
      }
    } catch (_0x139962) {}
  },
  async _syncDurationAndDefaults() {
    const _0x431682 = this._resolveActiveVideoData();
    const _0x2332ba = this._resolveActiveVideoSrc();
    const _0x5f22e8 = String(_0x2332ba || "").trim();
    const _0x57e8ed = ++this._sourceToken;
    this.videoEl = this._getVideoEl();
    if (this._applyDurationSec(this._resolveKnownDurationSec(_0x431682))) {
      this._render();
    }
    if (this.videoEl) {
      const _0x3c708f = this.videoEl;
      const _0x48fd0c = this._sourceOptions;
      const _0x381b1e = () => this.active && _0x57e8ed === this._sourceToken && this.videoEl === _0x3c708f && this._sourceOptions === _0x48fd0c;
      const _0x19c752 = String(this.videoEl.dataset?.videoClipSourceUrl || "").trim();
      this._setClipMediaKeepAlive(this.videoEl, true);
      try {
        this.videoEl.pause();
      } catch (_0x5a49e0) {}
      try {
        this.videoEl.loop = false;
      } catch (_0xc3f925) {}
      if (_0x5f22e8 && _0x19c752 !== _0x5f22e8) {
        await attachDesktopMediaPlaybackSource(this.videoEl, _0x5f22e8, {
          shouldAssign: _0x381b1e
        });
        if (!_0x381b1e()) {
          return;
        }
        if (!this._getVideoElementSource(this.videoEl)) {
          this.videoEl.preload = "metadata";
          this.videoEl.src = _0x5f22e8;
          try {
            this.videoEl.load?.();
          } catch (_0xc58465) {}
        }
        if (this.videoEl.dataset) {
          this.videoEl.dataset.videoClipSourceUrl = _0x5f22e8;
        }
      }
    }
    const _0x2af1d9 = this._readDurationSec(this.videoEl);
    if (this._applyDurationSec(_0x2af1d9)) {
      this._render();
    } else if (!(this.durationSec > 0) && _0x5f22e8) {
      this._applyVideoMetaDurationFallback(_0x5f22e8, _0x57e8ed);
    }
    if (this.videoEl) {
      this._onLoadedMeta = () => {
        if (!this.active) {
          return;
        }
        const _0x236e47 = this._readDurationSec(this.videoEl);
        this._applyDurationSec(_0x236e47, this.videoEl);
        this._render();
      };
      this._onDurationChange = () => {
        if (!this.active) {
          return;
        }
        const _0x41d9d9 = this._readDurationSec(this.videoEl);
        this._applyDurationSec(_0x41d9d9, this.videoEl);
        this._render();
      };
      this.videoEl.addEventListener("loadedmetadata", this._onLoadedMeta, {
        once: true
      });
      this.videoEl.addEventListener("durationchange", this._onDurationChange);
    }
    this._renderThumbs();
    this._startPlayheadLoop();
  },
  _startPlayheadLoop() {
    if (this._playheadRaf) {
      cancelAnimationFrame(this._playheadRaf);
    }
    const _0xd62f0a = () => {
      if (!this.active) {
        return;
      }
      this._renderPlayhead();
      this._playheadRaf = requestAnimationFrame(_0xd62f0a);
    };
    this._playheadRaf = requestAnimationFrame(_0xd62f0a);
  },
  _renderPlayhead() {
    if (!this.playheadEl || !this.trackEl) {
      return;
    }
    const _0x26fdbd = this.durationSec;
    if (!Number.isFinite(_0x26fdbd) || _0x26fdbd <= 0) {
      this.playheadEl.style.display = "none";
      return;
    }
    const _0x1471d7 = this.videoEl || this._getVideoEl();
    if (!_0x1471d7) {
      this.playheadEl.style.display = "none";
      return;
    }
    let _0x2b08aa = Number(_0x1471d7.currentTime) || 0;
    const _0x2a6058 = Number(this._pendingPlaybackStartSec);
    if (_0x1471d7.paused && _0x1471d7.seeking && this._pendingPlaybackStartSec !== null && Number.isFinite(_0x2a6058)) {
      _0x2b08aa = _0x2a6058;
    }
    if (_0x2b08aa < this.startSec || _0x2b08aa > this.endSec) {
      if (!_0x1471d7.paused && !_0x1471d7.seeking && this._rangeLoopSeekPending !== true) {
        this._rangeLoopSeekPending = true;
        try {
          _0x1471d7.currentTime = this.startSec;
        } catch (_0x208bdf) {}
        _0x2b08aa = this.startSec;
      }
    } else if (!_0x1471d7.seeking) {
      this._rangeLoopSeekPending = false;
    }
    const _0x8998d9 = Math.max(0, Math.min(1, _0x2b08aa / _0x26fdbd));
    this.playheadEl.style.display = "block";
    this.playheadEl.style.left = _0x8998d9 * 100 + "%";
  },
  _handlePlaybackShortcutKey(_0x24f259) {
    if (!this.active || this._isSourceReverseEditLocked()) {
      return false;
    }
    if (_0x24f259?.key !== " " && _0x24f259?.code !== "Space") {
      return false;
    }
    _0x24f259.preventDefault?.();
    _0x24f259.stopPropagation?.();
    if (!_0x24f259.repeat) {
      this._togglePlayRange();
    }
    return true;
  },
  _pauseRangePlaybackForRangeEdit(_0x2b4042 = this.videoEl || this._getVideoEl()) {
    this._rangePlaybackSeq += 1;
    this._rangeLoopSeekPending = false;
    this._pendingPlaybackStartSec = null;
    if (!_0x2b4042) {
      return null;
    }
    try {
      if (!_0x2b4042.paused) {
        _0x2b4042.pause();
      }
    } catch (_0x1decdc) {}
    return _0x2b4042;
  },
  async _togglePlayRange() {
    if (this._isSourceReverseEditLocked()) {
      return false;
    }
    const _0xfc55e0 = ++this._rangePlaybackSeq;
    const _0x6a2505 = this._getVideoEl();
    if (!_0x6a2505) {
      return false;
    }
    await this._ensureVideoPlaybackSource(_0x6a2505);
    if (!this.active || _0xfc55e0 !== this._rangePlaybackSeq) {
      return false;
    }
    let _0x19cc66 = Number(this.durationSec);
    if (!Number.isFinite(_0x19cc66) || _0x19cc66 <= 0) {
      _0x19cc66 = this._readDurationSec(_0x6a2505);
      if (!Number.isFinite(_0x19cc66) || _0x19cc66 <= 0) {
        return false;
      }
      if (this._applyDurationSec(_0x19cc66)) {
        this._render();
      }
    }
    try {
      if (!_0x6a2505.paused) {
        _0x6a2505.pause();
        this._pendingPlaybackStartSec = null;
        this._renderPlayhead();
        return true;
      }
    } catch (_0xc31489) {}
    const _0x2e872a = Math.max(0, Math.min(this.startSec, _0x19cc66));
    const _0x10d951 = Math.max(_0x2e872a, Math.min(this.endSec, _0x19cc66));
    if (!(_0x10d951 > _0x2e872a)) {
      return false;
    }
    const _0x2c5f33 = Number(_0x6a2505.currentTime) || 0;
    const _0x3f6c2f = this._pendingPlaybackStartSec;
    const _0x5e51fa = Number(_0x3f6c2f);
    const _0x55fc78 = _0x3f6c2f !== null && _0x3f6c2f !== undefined && Number.isFinite(_0x5e51fa) && _0x5e51fa >= _0x2e872a && _0x5e51fa < _0x10d951;
    const _0x3680ea = _0x55fc78 ? _0x5e51fa : _0x2e872a;
    if (_0x55fc78 || _0x2c5f33 < _0x2e872a || _0x2c5f33 >= _0x10d951) {
      await this._seekVideoForRangePlayback(_0x6a2505, _0x3680ea);
    }
    if (!this.active || _0xfc55e0 !== this._rangePlaybackSeq) {
      return false;
    }
    if (this._pendingPlaybackStartSec === _0x3f6c2f) {
      this._pendingPlaybackStartSec = null;
    }
    const _0x244abe = await playVideoWithRecovery(_0x6a2505, {
      label: "video-clip:" + (this.nodeId || "unknown") + ":range",
      ensureSrc: () => this._ensureVideoPlaybackSource(_0x6a2505),
      minBufferAhead: 0.5,
      readyTimeoutMs: 500,
      recoveryDebounceMs: 150,
      recoveryCooldownMs: 500,
      shouldRecover: _0xce4ebf => this.active === true && this.videoEl === _0xce4ebf && _0xce4ebf?.isConnected !== false && !_0xce4ebf?.paused,
      shouldContinue: () => this.active === true && _0xfc55e0 === this._rangePlaybackSeq && this.videoEl === _0x6a2505
    });
    if (_0x244abe) {
      this._rangeLoopSeekPending = false;
      this._renderPlayhead();
    }
    return _0x244abe;
  },
  async _ensureVideoPlaybackSource(_0x1bdc94 = this.videoEl) {
    if (!_0x1bdc94) {
      return false;
    }
    if (this._getVideoElementSource(_0x1bdc94)) {
      if (_0x1bdc94.preload !== "auto") {
        _0x1bdc94.preload = "auto";
      }
      return true;
    }
    const _0xd4ee55 = String(this._resolveActiveVideoSrc() || "").trim();
    if (!_0xd4ee55) {
      return false;
    }
    await attachDesktopMediaPlaybackSource(_0x1bdc94, _0xd4ee55, {
      preload: "auto"
    });
    if (_0x1bdc94.dataset) {
      _0x1bdc94.dataset.videoClipSourceUrl = _0xd4ee55;
    }
    return !!this._getVideoElementSource(_0x1bdc94);
  },
  async _seekVideoForRangePlayback(_0x2ac375, _0x578032) {
    if (!_0x2ac375) {
      return false;
    }
    const _0x3a7978 = Math.max(0, Number(_0x578032) || 0);
    const _0x407d89 = Number(_0x2ac375.currentTime || 0);
    if (Math.abs(_0x407d89 - _0x3a7978) <= VIDEO_CLIP_SEEK_EPSILON_SEC && Number(_0x2ac375.readyState || 0) >= 2 && !_0x2ac375.seeking) {
      return true;
    }
    this._rangeLoopSeekPending = true;
    try {
      _0x2ac375.currentTime = _0x3a7978;
    } catch (_0x573afb) {}
    await this._waitForRangePlaybackSeek(_0x2ac375);
    this._rangeLoopSeekPending = false;
    return true;
  },
  _waitForRangePlaybackSeek(_0x5cec56) {
    if (!_0x5cec56 || Number(_0x5cec56.readyState || 0) >= 2 && !_0x5cec56.seeking) {
      return Promise.resolve(true);
    }
    return new Promise(_0x4e84eb => {
      let _0x5068b5 = false;
      const _0x1e7d36 = ["seeked", "canplay", "canplaythrough", "loadeddata", "timeupdate"];
      const _0x44b7e5 = () => {
        if (_0x5068b5) {
          return;
        }
        _0x5068b5 = true;
        clearTimeout(_0x560a87);
        _0x1e7d36.forEach(_0x5407ee => _0x5cec56.removeEventListener?.(_0x5407ee, _0x285731));
        _0x5cec56.removeEventListener?.("error", _0x285731);
        _0x5cec56.removeEventListener?.("abort", _0x285731);
        _0x4e84eb(true);
      };
      const _0x285731 = () => {
        if (Number(_0x5cec56.readyState || 0) >= 2 || !_0x5cec56.seeking) {
          _0x44b7e5();
        }
      };
      const _0x560a87 = setTimeout(_0x44b7e5, VIDEO_CLIP_PLAY_SEEK_TIMEOUT_MS);
      _0x1e7d36.forEach(_0x17ff0b => _0x5cec56.addEventListener?.(_0x17ff0b, _0x285731));
      _0x5cec56.addEventListener?.("error", _0x285731);
      _0x5cec56.addEventListener?.("abort", _0x285731);
    });
  },
  _resolveVideoSrcFromNode(_0x1270fe) {
    return resolveVideoClipSourceUrl(_0x1270fe);
  },
  async _renderThumbs() {
    const _0x3625df = ++this._thumbToken;
    const _0x154e27 = Array.isArray(this.thumbEls) ? this.thumbEls : [];
    if (!_0x154e27.length) {
      return;
    }
    const _0x149e5a = this._resolveActiveVideoData();
    const _0x3b209c = this._resolveActiveVideoSrc();
    const _0x2db2dc = resolveCanvasVideoPosterUrl(_0x149e5a);
    const _0x452db5 = await renderVideoClipThumbnails({
      src: _0x3b209c,
      posterUrl: _0x2db2dc,
      thumbs: _0x154e27,
      isCurrent: () => this.active && this._thumbToken === _0x3625df
    });
    if (!this.active || this._thumbToken !== _0x3625df) {
      return;
    }
    if (this.trackEl?.dataset) {
      this.trackEl.dataset.thumbnailState = _0x452db5.source;
    }
    if (_0x452db5.errors.length >= 2 && (_0x452db5.source === "poster" || _0x452db5.source === "empty")) {
      console.warn("[VideoClipController] timeline thumbnail extraction fell back:", _0x452db5.errors.map(_0x5e315d => _0x5e315d.message));
    }
  },
  _handleDragAtClientX(_0x5cb991) {
    if (!this.trackEl || !this.active || this._isSourceReverseEditLocked()) {
      return;
    }
    const _0x2881f5 = this.durationSec;
    if (!_0x2881f5 || !Number.isFinite(_0x2881f5) || _0x2881f5 <= 0) {
      this._render();
      return;
    }
    const _0x1518ee = this.trackEl.getBoundingClientRect();
    if (!_0x1518ee.width) {
      return;
    }
    const _0x137098 = _0x5cb991 - _0x1518ee.left;
    const _0x386aa2 = Math.max(0, Math.min(1, _0x137098 / _0x1518ee.width));
    const _0x4ae0d3 = _0x386aa2 * _0x2881f5;
    const _0x17479b = Math.min(0.1, _0x2881f5);
    const _0xcaaf82 = Math.max(_0x17479b, this.endSec - this.startSec);
    const _0x5e367e = this._dragMode === "left" || this._dragMode === "right" || this._dragMode === "move" || this._dragMode === "set" ? this._pauseRangePlaybackForRangeEdit() : null;
    if (this._dragMode === "left") {
      const _0x1e1a2d = Math.max(0, Math.min(_0x4ae0d3, this.endSec - _0x17479b));
      this.startSec = _0x1e1a2d;
      if (_0x5e367e) {
        try {
          _0x5e367e.currentTime = _0x1e1a2d;
        } catch (_0x51ed63) {}
      }
    } else if (this._dragMode === "right") {
      const _0x500cca = Math.max(this.startSec + _0x17479b, Math.min(_0x2881f5, _0x4ae0d3));
      this.endSec = _0x500cca;
    } else if (this._dragMode === "move") {
      const _0x160433 = this.selectionEl.getBoundingClientRect().left - _0x1518ee.left;
      const _0x4d7730 = _0x5cb991 - _0x1518ee.left - this._dragOffsetPx;
      const _0x2516ff = _0x4d7730 - _0x160433;
      const _0x4ffae4 = _0x2516ff / _0x1518ee.width * _0x2881f5;
      const _0x230773 = Math.max(0, Math.min(_0x2881f5 - _0xcaaf82, this.startSec + _0x4ffae4));
      this.startSec = _0x230773;
      this.endSec = _0x230773 + _0xcaaf82;
      if (_0x5e367e) {
        try {
          _0x5e367e.currentTime = _0x230773;
        } catch (_0x47673b) {}
      }
    } else if (this._dragMode === "set") {
      const _0x56399e = Math.min(3, _0x2881f5);
      const _0x403081 = Math.max(0, Math.min(_0x2881f5 - _0x56399e, _0x4ae0d3 - _0x56399e / 2));
      this.startSec = _0x403081;
      this.endSec = _0x403081 + _0x56399e;
    }
    this._render();
  },
  _render() {
    this._renderSourceReverseControl();
    if (!this.active || !this.trackEl || !this.selectionEl || !this.leftHandleEl || !this.rightHandleEl) {
      return;
    }
    const _0x51aa3a = this.durationSec;
    const _0x555907 = Number.isFinite(_0x51aa3a) && _0x51aa3a > 0;
    const _0x162a81 = _0x555907 ? Math.max(0, Math.min(this.startSec, _0x51aa3a)) : 0;
    const _0x366fc5 = _0x555907 ? Math.max(0, Math.min(this.endSec, _0x51aa3a)) : 0;
    const _0x22a10e = Math.max(0, _0x366fc5 - _0x162a81);
    if (_0x555907) {
      const _0xa6bb62 = _0x162a81 / _0x51aa3a * 100;
      const _0x4c41f4 = _0x22a10e / _0x51aa3a * 100;
      this.selectionEl.style.left = _0xa6bb62 + "%";
      this.selectionEl.style.width = _0x4c41f4 + "%";
      this.leftHandleEl.style.left = _0xa6bb62 + "%";
      this.rightHandleEl.style.left = _0xa6bb62 + _0x4c41f4 + "%";
      if (this.labelEl) {
        this.labelEl.textContent = _0x22a10e.toFixed(2) + "s";
        this.labelEl.style.left = _0xa6bb62 + _0x4c41f4 / 2 + "%";
      }
    } else {
      this.selectionEl.style.left = "0%";
      this.selectionEl.style.width = "0%";
      this.leftHandleEl.style.left = "0%";
      this.rightHandleEl.style.left = "0%";
      if (this.labelEl) {
        this.labelEl.textContent = videoClipText("controls.loading");
        this.labelEl.style.left = "50%";
      }
    }
    this._renderPlayhead();
    if (this.confirmBtnEl) {
      const _0x4cd318 = _0x555907 && _0x22a10e >= 0.1 && !this._isSourceReverseEditLocked();
      this.confirmBtnEl.disabled = !_0x4cd318;
      this.confirmBtnEl.dataset.disabled = _0x4cd318 ? "false" : "true";
      if (this.confirmBtnEl.dataset.loading !== "true") {
        this.confirmBtnEl.innerHTML = "<svg width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.5\"><polyline points=\"20 6 9 17 4 12\"></polyline></svg>";
      }
    }
  },
  async _confirm() {
    if (!this.confirmBtnEl) {
      return;
    }
    const _0x5e44bd = this.confirmBtnEl;
    if (_0x5e44bd.dataset.disabled === "true") {
      return;
    }
    if (this._isSourceReverseEditLocked()) {
      return;
    }
    const _0x4c8a86 = this._clipSessionToken;
    const _0x196b5d = this._sourceOptions;
    const _0x108747 = a1436_0x3e8327.getState().nodes;
    const _0x37cc62 = _0x196b5d ? this._resolveActiveVideoData() : _0x108747[this.anchorNodeId];
    if (!_0x37cc62) {
      this.exit({
        silent: true
      });
      return;
    }
    const _0x5124ad = this.durationSec;
    if (!_0x5124ad || !Number.isFinite(_0x5124ad) || _0x5124ad <= 0) {
      return;
    }
    const _0x3b54ef = Math.max(0, Math.min(this.startSec, _0x5124ad));
    const _0xdc7c53 = Math.max(0, Math.min(this.endSec, _0x5124ad));
    if (!(_0xdc7c53 > _0x3b54ef)) {
      return;
    }
    const _0x53cbd5 = _0x196b5d ? this._resolveActiveVideoSrc() : localPathToUrl(_0x37cc62.localPath) || _0x37cc62.src || _0x37cc62.videoUrl || _0x37cc62.resultUrl || "";
    if (!_0x53cbd5) {
      return;
    }
    _0x5e44bd.dataset.disabled = "true";
    _0x5e44bd.dataset.loading = "true";
    _0x5e44bd.innerHTML = "<svg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><g style=\"animation:spin 1s linear infinite;transform-origin:50% 50%;transform-box:fill-box;\"><path d=\"M21 12a9 9 0 1 1-6.219-8.56\"/></g></svg>";
    window.showToast?.(videoClipText("cut.processing"), "info");
    this._renderSourceReverseControl();
    try {
      let _0x75fee3 = null;
      if (canUseElectronMediaTask()) {
        _0x75fee3 = await enqueueElectronMediaTask({
          kind: "videoCut",
          nodeId: this.anchorNodeId,
          src: _0x53cbd5,
          args: {
            start: _0x3b54ef,
            end: _0xdc7c53
          }
        }, {
          wait: true,
          timeout: 300000
        });
      } else {
        const _0x1d9b4d = await requester({
          url: "/api/v2/video/cut",
          method: "POST",
          provider: "local",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            src: _0x53cbd5,
            start: _0x3b54ef,
            end: _0xdc7c53
          }),
          allow404Null: true,
          returnMeta: true
        });
        if (_0x1d9b4d?.status === 404 || _0x1d9b4d?.data == null) {
          throw new Error(videoClipText("errors.cutEndpointMissing"));
        }
        _0x75fee3 = _0x1d9b4d.data || {};
      }
      if (_0x4c8a86 !== this._clipSessionToken || _0x196b5d !== this._sourceOptions) {
        return;
      }
      const _0x13b0c6 = _0x75fee3?.result && typeof _0x75fee3.result === "object" ? _0x75fee3.result : _0x75fee3;
      const _0x3eca02 = normalizeVideoCutResultLocalPath(_0x75fee3);
      if (!_0x3eca02 || _0x75fee3?.success === false || _0x13b0c6?.success === false) {
        throw new Error(_0x13b0c6?.error || _0x75fee3?.error || _0x75fee3?.message || videoClipText("errors.cutFailed"));
      }
      if (_0x196b5d) {
        if (typeof _0x196b5d.onConfirm === "function") {
          await _0x196b5d.onConfirm({
            startSec: _0x3b54ef,
            endSec: _0xdc7c53,
            durationSec: _0xdc7c53 - _0x3b54ef,
            sourceUrl: _0x53cbd5,
            sourceLocalPath: String(_0x196b5d.sourceLocalPath || ""),
            cutLocalPath: _0x3eca02,
            videoUrl: localPathToUrl(_0x3eca02),
            ...(this._reverseControl ? {
              isReversed: this._reverseControl.isReversed,
              materializedIsReversed: this._reverseControl.materializedIsReversed
            } : {}),
            fps: pickPositiveNumber(_0x13b0c6?.fps, _0x75fee3?.fps),
            data: _0x75fee3,
            result: _0x13b0c6
          });
        }
        if (_0x4c8a86 !== this._clipSessionToken || _0x196b5d !== this._sourceOptions) {
          return;
        }
        window.showToast?.(videoClipText("cut.success"), "success");
        this.exit({
          silent: true,
          reason: "confirm"
        });
        return;
      }
      const {
        width: _0x577390,
        height: _0x1b1732
      } = getAutoMediaSizeByShortSide(_0x37cc62.width || 512, _0x37cc62.height || 288);
      const _0x153aa5 = calcSafeSpawnPosNearNode(a1436_0x3e8327.getState().nodes, _0x37cc62, _0x577390, _0x1b1732);
      const _0xc98ae = generateId("source-video-cut");
      const _0x163c5e = pickPositiveNumber(_0x13b0c6?.fps, _0x75fee3?.fps);
      const _0x3859a2 = buildVideoCutNodeMeta(_0x37cc62, _0x3b54ef, _0xdc7c53, _0x163c5e);
      const _0x1add90 = buildVideoCutNodePlaybackFields(_0x3eca02);
      a1436_0x3e8327.addNode(buildSourceMediaNodePayload({
        id: _0xc98ae,
        type: "source-video",
        x: _0x153aa5.x,
        y: _0x153aa5.y,
        width: _0x577390,
        height: _0x1b1732,
        name: videoClipText("cut.newNodeName", {
          name: _0x37cc62.name || videoClipText("cut.videoFallback")
        }),
        ..._0x1add90,
        ..._0x3859a2,
        needsAutoResize: false,
        fixedSize: true
      }));
      a1436_0x3e8327.setSelectedNodes([_0xc98ae]);
      commit();
      ensureVideoCutNodeThumb(_0xc98ae, _0x3eca02);
      window._triggerLocalCacheSave?.();
      window.showToast?.(videoClipText("cut.success"), "success");
      this.exit({
        silent: true,
        reason: "confirm"
      });
    } catch (_0x37810d) {
      if (_0x4c8a86 !== this._clipSessionToken || _0x196b5d !== this._sourceOptions) {
        return;
      }
      const _0x4de58e = _0x37810d instanceof Error ? _0x37810d.message : String(_0x37810d || videoClipText("errors.cutFailed"));
      window.showToast?.(videoClipText("cut.failedWithError", {
        error: _0x4de58e
      }), "error");
      _0x5e44bd.dataset.loading = "false";
      this._render();
      _0x5e44bd.dataset.loading = "false";
    }
    _0x5e44bd.dataset.loading = "false";
  },
  exit({
    silent = false,
    reason = ""
  } = {}) {
    if (!this.active) {
      return;
    }
    const _0x59aead = this._sourceOptions;
    const _0x31c4e9 = this._reverseControl ? {
      isReversed: this._reverseControl.isReversed,
      materializedIsReversed: this._reverseControl.materializedIsReversed
    } : null;
    const _0x28d028 = String(reason || (silent ? "silent" : "cancel"));
    this.active = false;
    this._thumbToken++;
    this._sourceToken++;
    this._reverseRequestToken++;
    this._clipSessionToken++;
    this._rangeLoopSeekPending = false;
    this._rangePlaybackSeq += 1;
    this._pendingPlaybackStartSec = null;
    a1436_0x3e8327.setVideoClipState({
      active: false,
      nodeId: null
    });
    if (this._playheadRaf) {
      cancelAnimationFrame(this._playheadRaf);
    }
    this._playheadRaf = 0;
    if (this._retryRaf) {
      cancelAnimationFrame(this._retryRaf);
    }
    this._retryRaf = 0;
    if (this.videoEl) {
      this._setClipMediaKeepAlive(this.videoEl, false);
      if (this._onLoadedMeta) {
        this.videoEl.removeEventListener("loadedmetadata", this._onLoadedMeta);
      }
      if (this._onDurationChange) {
        this.videoEl.removeEventListener("durationchange", this._onDurationChange);
      }
    }
    if (this._onKeyDown) {
      window.removeEventListener("keydown", this._onKeyDown, true);
      this._onKeyDown = null;
    }
    if (this._onSmartClipDocDown) {
      document.removeEventListener("pointerdown", this._onSmartClipDocDown, true);
      this._onSmartClipDocDown = null;
    }
    if (this._smartClipMaxSegmentDrag) {
      this._smartClipMaxSegmentDrag.el?.classList?.remove("is-dragging");
      this._smartClipMaxSegmentDrag.doc?.removeEventListener?.("mousemove", this._onSmartClipMaxSegmentDragMove);
      this._smartClipMaxSegmentDrag.doc?.removeEventListener?.("mouseup", this._onSmartClipMaxSegmentDragUp);
      this._smartClipMaxSegmentDrag = null;
    }
    this._onSmartClipMaxSegmentDragMove = null;
    this._onSmartClipMaxSegmentDragUp = null;
    this._suppressSmartClipMaxSegmentClick = false;
    if (this._onPointerMove) {
      window.removeEventListener("pointermove", this._onPointerMove, true);
    }
    if (this._onPointerUp) {
      window.removeEventListener("pointerup", this._onPointerUp, true);
    }
    this._onLoadedMeta = null;
    this._onDurationChange = null;
    this._onPointerMove = null;
    this._onPointerUp = null;
    this._dragMode = null;
    this._dragOffsetPx = 0;
    if (this._onDocClick) {
      document.removeEventListener("pointerdown", this._onDocClick, true);
      this._onDocClick = null;
    }
    this.durationSec = 0;
    this.startSec = 0;
    this.endSec = 0;
    this.nodeId = null;
    this.anchorNodeId = null;
    this._sourceOptions = null;
    this._reverseControl = null;
    this.videoEl = null;
    this.trackEl = null;
    this.selectionEl = null;
    this.leftHandleEl = null;
    this.rightHandleEl = null;
    this.playheadEl = null;
    this.labelEl = null;
    this.cancelBtnEl = null;
    this.reverseBtnEl = null;
    this.confirmBtnEl = null;
    this.thumbEls = null;
    if (this._msgInterval) {
      clearInterval(this._msgInterval);
      this._msgInterval = null;
    }
    this._msgEls = null;
    this._applyFrozenUI(false);
    this._applyDimMode(false);
    if (this.barEl) {
      this.barEl.remove();
    }
    this.barEl = null;
    this.wrapperEl = null;
    if (!silent) {
      window.showToast?.(videoClipText("cut.cancelled"), "info");
    }
    try {
      _0x59aead?.onExit?.({
        reason: _0x28d028,
        ..._0x31c4e9
      });
    } catch (_0x179365) {}
  }
};
export default VideoClipController;