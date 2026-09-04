import { reverseVideo } from "../../api/videoReverseApi.js";
import { generateId } from "../core/math.js";
import a1461_0x4c9962 from "../core/stores/appStore.js";
import { t } from "../i18n/index.js";
import { buildCanvasLocalVideoFields, resolveCanvasVideoLocalPath, resolveCanvasVideoPosterUrl } from "../services/canvasMediaLocalService.js";
import { buildSourceMediaNodePayload, getAutoMediaSizeByShortSide } from "../services/fileService.js";
import { localPathToUrl, normalizeLocalPath, pickResultLocalPath } from "../utils/localMediaPath.js";
import { buildGenerationStartPatch } from "../core/generationTaskLifecycle.js";
import { buildVideoGenerationFailurePatch, buildVideoGenerationResultPatch } from "../components/video-node/videoGenerationResultRenderer.js";
import { commit } from "./history.js";
import { calcSafeSpawnPosNearNode } from "./nodeSpawn.js";
import { addToolbarPendingResultNodes, persistToolbarResultNodes, updateToolbarResultNode } from "./toolbarPendingResultNodes.js";
let _reverseVideoImpl = reverseVideo;
function videoReverseText(_0x3ab8d6, _0x55aedc = {}) {
  return t("videoReverse." + _0x3ab8d6, _0x55aedc);
}
function _getState() {
  if (typeof a1461_0x4c9962.getStateRaw === "function") {
    return a1461_0x4c9962.getStateRaw();
  } else {
    return a1461_0x4c9962.getState();
  }
}
function _getNode(_0x2cb195) {
  return _getState().nodes?.[_0x2cb195] || null;
}
function _isVideoNodeType(_0x47b3ef) {
  const _0x5ead0c = String(_0x47b3ef || "").trim().toLowerCase();
  return _0x5ead0c === "source-video" || _0x5ead0c === "ai-video" || _0x5ead0c === "video";
}
function _cleanLocalPath(_0x1ce7eb) {
  return normalizeLocalPath(_0x1ce7eb);
}
function _pickMainVideoItem(_0x2188d0) {
  const _0x421d14 = Array.isArray(_0x2188d0?.videos) ? _0x2188d0.videos : [];
  const _0x54bab2 = Number.isFinite(Number(_0x2188d0?.mainVideoIndex)) ? Math.max(0, Math.trunc(Number(_0x2188d0.mainVideoIndex))) : 0;
  return _0x421d14[_0x54bab2] || _0x421d14[0] || null;
}
function _resolveSourcePath(_0x5994da) {
  const _0x319348 = _pickMainVideoItem(_0x5994da);
  return _cleanLocalPath(resolveCanvasVideoLocalPath(_0x319348) || resolveCanvasVideoLocalPath(_0x5994da));
}
function _getResultLocalPath(_0x4946ce) {
  return pickResultLocalPath(_0x4946ce);
}
function _fileNameFromPath(_0x156218) {
  const _0x305b1d = _cleanLocalPath(_0x156218);
  if (!_0x305b1d) {
    return "";
  }
  const _0x532615 = _0x305b1d.split("/");
  return String(_0x532615[_0x532615.length - 1] || "").trim();
}
function _getResultNodeLayout(_0x1b1a2a, _0x2ce891 = {}) {
  const _0x4b9250 = Number(_0x1b1a2a?.width) || Number(_0x2ce891?.videoWidth) || 512;
  const _0x9a5e75 = Number(_0x1b1a2a?.height) || Number(_0x2ce891?.videoHeight) || 288;
  const {
    width: _0x22bda2,
    height: _0x56e44a
  } = getAutoMediaSizeByShortSide(_0x4b9250, _0x9a5e75);
  const {
    x: _0x941912,
    y: _0x3cecbc
  } = calcSafeSpawnPosNearNode(_getState().nodes || {}, _0x1b1a2a, _0x22bda2, _0x56e44a);
  return {
    x: _0x941912,
    y: _0x3cecbc,
    width: _0x22bda2,
    height: _0x56e44a
  };
}
function _createPendingResultNode(_0x1c5b25, {
  startedAt = Date.now()
} = {}) {
  const _0x48ef73 = _getResultNodeLayout(_0x1c5b25);
  const _0x5f4a2 = String(_0x1c5b25?.name || "").trim() || videoReverseText("fallback.video");
  const _0x508497 = generateId("source-video-reverse");
  const _0x5a9d04 = buildSourceMediaNodePayload({
    id: _0x508497,
    type: "source-video",
    x: _0x48ef73.x,
    y: _0x48ef73.y,
    width: _0x48ef73.width,
    height: _0x48ef73.height,
    name: videoReverseText("output.nodeName", {
      name: _0x5f4a2
    }),
    src: "",
    posterUrl: resolveCanvasVideoPosterUrl(_0x1c5b25),
    outputText: videoReverseText("toasts.running"),
    ...buildGenerationStartPatch({
      startedAt: startedAt
    }),
    needsAutoResize: false,
    fixedSize: true
  });
  addToolbarPendingResultNodes({
    nodes: [_0x5a9d04]
  });
  return _0x508497;
}
function _buildResultPatch(_0x483b26, _0x3b617e, {
  startedAt = 0
} = {}) {
  const _0x18bc47 = _getResultLocalPath(_0x3b617e);
  if (!_0x18bc47) {
    throw new Error(videoReverseText("errors.incompleteResult"));
  }
  const _0x102b53 = String(_0x483b26?.name || "").trim() || videoReverseText("fallback.video");
  const _0x34b4c9 = _0x3b617e?.filename || _fileNameFromPath(_0x18bc47);
  const _0x1bc4bf = buildCanvasLocalVideoFields({
    localPath: _0x18bc47,
    videoUrl: _0x3b617e?.url,
    fileName: _0x34b4c9,
    videoWidth: Number(_0x3b617e?.videoWidth || 0) || 0,
    videoHeight: Number(_0x3b617e?.videoHeight || 0) || 0,
    videoDuration: Number(_0x3b617e?.videoDuration || 0) || 0,
    videoFps: Number(_0x3b617e?.fps || 0) || 0
  });
  const _0x325fb3 = buildVideoGenerationResultPatch({
    localPath: _0x18bc47,
    videoUrl: _0x3b617e?.url,
    fileName: _0x34b4c9,
    videoWidth: Number(_0x3b617e?.videoWidth || 0) || 0,
    videoHeight: Number(_0x3b617e?.videoHeight || 0) || 0,
    videoDuration: Number(_0x3b617e?.videoDuration || 0) || 0,
    fps: Number(_0x3b617e?.fps || 0) || 0
  }, {
    startedAt: startedAt
  }) || {};
  return {
    name: videoReverseText("output.nodeName", {
      name: _0x102b53
    }),
    ..._0x325fb3,
    ..._0x1bc4bf,
    src: localPathToUrl(_0x18bc47) || _0x3b617e?.url || "",
    fileName: _0x34b4c9,
    videoWidth: Number(_0x3b617e?.videoWidth || 0) || 0,
    videoHeight: Number(_0x3b617e?.videoHeight || 0) || 0,
    videoDuration: Number(_0x3b617e?.videoDuration || 0) || 0,
    videoFps: Number(_0x3b617e?.fps || 0) || 0,
    needsAutoResize: false,
    fixedSize: true
  };
}
function _applyFailureResult(_0x57d51e, {
  startedAt = 0,
  message = ""
} = {}) {
  updateToolbarResultNode(_0x57d51e, buildVideoGenerationFailurePatch({
    error: message || videoReverseText("toasts.failed"),
    startedAt: startedAt
  }) || {});
  persistToolbarResultNodes();
}
function _flushResultNode(_0x318381) {
  const _0x2fe907 = String(_0x318381 || "").trim();
  if (!_0x2fe907) {
    return false;
  }
  try {
    return globalThis.window?.v2Renderer?.flushNode?.(_0x2fe907) === true;
  } catch {
    return false;
  }
}
export async function runVideoReverseFromNode(_0x4ab6b6) {
  const _0x393f02 = _getNode(_0x4ab6b6);
  if (!_0x393f02 || !_isVideoNodeType(_0x393f02.type)) {
    window.showToast?.(videoReverseText("toasts.unsupportedNode"), "warn");
    return null;
  }
  if (_0x393f02.isGenerating) {
    window.showToast?.(videoReverseText("toasts.videoBusy"), "info");
    return null;
  }
  const _0x10523e = _resolveSourcePath(_0x393f02);
  if (!_0x10523e) {
    window.showToast?.(videoReverseText("toasts.notLocalFile"), "warn");
    return null;
  }
  window.showToast?.(videoReverseText("toasts.running"), "info");
  const _0x2f093c = Date.now();
  const _0xde0fea = _createPendingResultNode(_0x393f02, {
    startedAt: _0x2f093c
  });
  try {
    const _0x30413f = await _reverseVideoImpl({
      src: _0x10523e,
      nodeId: _0x393f02.id
    });
    updateToolbarResultNode(_0xde0fea, _buildResultPatch(_0x393f02, _0x30413f, {
      startedAt: _0x2f093c
    }));
    _flushResultNode(_0xde0fea);
    commit();
    persistToolbarResultNodes();
    window.showToast?.(videoReverseText("toasts.completed"), "success");
    return {
      videoId: _0xde0fea
    };
  } catch (_0x4a2fa4) {
    const _0x41c260 = _0x4a2fa4 instanceof Error ? _0x4a2fa4.message : String(_0x4a2fa4 || videoReverseText("toasts.failed"));
    _applyFailureResult(_0xde0fea, {
      startedAt: _0x2f093c,
      message: _0x41c260
    });
    commit();
    window.showToast?.(videoReverseText("toasts.failedWithError", {
      error: _0x41c260
    }), "error");
    return null;
  }
}
export function __setVideoReverseDepsForTest({
  reverseVideoImpl: _0x49dc96
} = {}) {
  _reverseVideoImpl = typeof _0x49dc96 === "function" ? _0x49dc96 : reverseVideo;
}
export function __resetVideoReverseDepsForTest() {
  _reverseVideoImpl = reverseVideo;
}