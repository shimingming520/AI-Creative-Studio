import a1440_0x49489d from "../core/stores/appStore.js";
import { buildSourceMediaNodePayload, getAutoMediaSizeByShortSide } from "../services/fileService.js";
import { buildVideoFrameCaptureNodeName, captureVideoFrameSnapshot, DEFAULT_VIDEO_FRAME_CAPTURE_FPS, getVideoFrameSource, isVideoFrameReady, resolveVideoFrameCaptureIndex, startVideoFrameSnapshotPersistence, waitForVideoFrame } from "../components/videoFrameCapture.js";
import { saveOutputBlob } from "./project.js";
import { calcSafeSpawnPosNearNode } from "./nodeSpawn.js";
import { t } from "../i18n/index.js";
export { resolveVideoFrameCaptureIndex } from "../components/videoFrameCapture.js";
function frameExtractionText(_0x4ecc23, _0x411f18 = {}) {
  return t("videoFrameExtraction." + _0x4ecc23, _0x411f18);
}
function getToast(_0x10d320) {
  if (typeof _0x10d320 === "function") {
    return _0x10d320;
  }
  return globalThis.window?.showToast;
}
export async function extractCurrentVideoFrameToImageNode({
  videoEl: _0x5f0bd4,
  anchorNodeId: _0x707be5,
  fallbackDurationSec = 0,
  fileNamePrefix = "source_video_frame",
  onMissingMetadata: _0x43654e,
  logPrefix = "[VideoFrameExtraction]",
  showToast: _0x418d8e
} = {}) {
  const _0x368d1d = getToast(_0x418d8e);
  const _0xdcc2fa = _0x5f0bd4;
  if (!_0xdcc2fa || !getVideoFrameSource(_0xdcc2fa)) {
    _0x368d1d?.(frameExtractionText("videoNotLoaded"), "info");
    return {
      ok: false,
      reason: "video-not-loaded"
    };
  }
  if (!isVideoFrameReady(_0xdcc2fa)) {
    const _0x4ebc69 = await waitForVideoFrame(_0xdcc2fa);
    if (!_0x4ebc69) {
      _0x368d1d?.(frameExtractionText("videoNotLoaded"), "info");
      return {
        ok: false,
        reason: "frame-not-ready"
      };
    }
  }
  const _0x244d28 = Number(_0xdcc2fa.videoWidth) || 0;
  const _0x347a1c = Number(_0xdcc2fa.videoHeight) || 0;
  if (!_0x244d28 || !_0x347a1c) {
    return {
      ok: false,
      reason: "missing-size"
    };
  }
  let _0x5a1dd1 = null;
  try {
    _0x5a1dd1 = await captureVideoFrameSnapshot(_0xdcc2fa, {
      fileNamePrefix: fileNamePrefix
    });
  } catch (_0x102472) {
    console.warn(logPrefix + " capture frame failed:", _0x102472);
    _0x368d1d?.(frameExtractionText("captureUnsupported"), "error");
    return {
      ok: false,
      reason: "capture-failed",
      error: _0x102472
    };
  }
  if (!_0x5a1dd1?.blob) {
    return {
      ok: false,
      reason: "missing-blob"
    };
  }
  const _0x53f650 = String(_0x707be5 || "").trim();
  const _0xd71df9 = a1440_0x49489d.getState().nodes || {};
  const _0x13f1cb = _0xd71df9[_0x53f650];
  if (!_0x13f1cb) {
    return {
      ok: false,
      reason: "missing-anchor-node"
    };
  }
  const {
    frameIndex: _0x4dac98,
    nextSnapSeq: _0x1998e6,
    usedSequence: _0x2d45c9
  } = resolveVideoFrameCaptureIndex(_0x13f1cb, {
    currentTimeSec: Number(_0xdcc2fa.currentTime) || 0,
    fallbackDurationSec: fallbackDurationSec,
    fallbackFrameRate: DEFAULT_VIDEO_FRAME_CAPTURE_FPS
  });
  const _0x1517c2 = Number.isFinite(Number(_0x13f1cb.videoFps)) && Number(_0x13f1cb.videoFps) > 0 || Number.isFinite(Number(_0x13f1cb.videoFrameCount)) && Number(_0x13f1cb.videoFrameCount) > 0 && (Number.isFinite(Number(_0x13f1cb.videoDuration)) && Number(_0x13f1cb.videoDuration) > 0 || Number.isFinite(Number(fallbackDurationSec)) && Number(fallbackDurationSec) > 0);
  if (_0x1998e6) {
    a1440_0x49489d.updateNodeData(_0x53f650, {
      snapSeq: _0x1998e6
    });
  }
  if (!_0x1517c2) {
    if (typeof _0x43654e === "function") {
      _0x43654e(_0x13f1cb);
    }
  }
  const _0x5c9b58 = getAutoMediaSizeByShortSide(_0x244d28, _0x347a1c);
  const _0xb4e773 = calcSafeSpawnPosNearNode(a1440_0x49489d.getState().nodes, _0x13f1cb, _0x5c9b58.width, _0x5c9b58.height);
  const _0x96672b = "src-img-" + Date.now();
  const _0x282d33 = frameExtractionText("capturedFrameName", {
    frameIndex: _0x4dac98
  });
  const _0x4be52b = buildVideoFrameCaptureNodeName(_0x13f1cb, {
    frameIndex: _0x4dac98,
    fallbackName: _0x282d33,
    formatSourceFrameName: _0x2c231c => frameExtractionText("capturedFrameNameWithSource", _0x2c231c)
  });
  const {
    savePromise: _0x528c57
  } = startVideoFrameSnapshotPersistence(_0x5a1dd1, saveOutputBlob, {
    onPreview: ({
      previewUrl: _0x277481
    }) => {
      a1440_0x49489d.addNode(buildSourceMediaNodePayload({
        id: _0x96672b,
        type: "source-image",
        name: _0x4be52b,
        capturePreviewUrl: _0x277481,
        captureSavePending: true,
        captureSaveError: null,
        originalWidth: _0x5a1dd1.originalWidth,
        originalHeight: _0x5a1dd1.originalHeight,
        fileName: _0x5a1dd1.fileName,
        x: _0xb4e773.x,
        y: _0xb4e773.y,
        width: _0x5c9b58.width,
        height: _0x5c9b58.height,
        needsAutoResize: false
      }));
    }
  });
  _0x528c57.then(_0x4bac63 => {
    if (!a1440_0x49489d.getStateRaw().nodes?.[_0x96672b]) {
      return;
    }
    a1440_0x49489d.updateNodeData(_0x96672b, {
      src: _0x4bac63.src,
      localPath: _0x4bac63.localPath,
      originalLocalPath: _0x4bac63.originalLocalPath,
      displayLocalPath: _0x4bac63.displayLocalPath,
      thumbLocalPath: _0x4bac63.thumbLocalPath,
      originalWidth: _0x4bac63.originalWidth,
      originalHeight: _0x4bac63.originalHeight,
      fileName: _0x4bac63.fileName,
      captureSavePending: false,
      captureSaveError: null
    });
  }).catch(_0x266df6 => {
    const _0x4113be = String(_0x266df6?.message || frameExtractionText("localSaveFailed"));
    console.warn(logPrefix + " save captured frame failed:", _0x266df6);
    if (a1440_0x49489d.getStateRaw().nodes?.[_0x96672b]) {
      a1440_0x49489d.updateNodeData(_0x96672b, {
        captureSavePending: false,
        captureSaveError: _0x4113be
      });
    }
    _0x368d1d?.(frameExtractionText("shownButSaveFailed"), "warning");
  });
  return {
    ok: true,
    nodeId: _0x96672b,
    frameIndex: _0x4dac98,
    usedSequence: _0x2d45c9
  };
}