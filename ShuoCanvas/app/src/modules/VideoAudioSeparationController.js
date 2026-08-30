import { separateVideoAudio } from "../../api/videoAudioSeparationApi.js";
import { findAvailablePosition, generateId } from "../core/math.js";
import { t } from "../i18n/index.js";
import a1434_0x37d081 from "../core/stores/appStore.js";
import { resolveCanvasVideoLocalPath, resolveCanvasVideoPosterUrl } from "../services/canvasMediaLocalService.js";
import { buildSourceAudioNodePayload, buildSourceMediaNodePayload, getAutoMediaSizeByShortSide, getNodeDefaultSize } from "../services/fileService.js";
import { localPathToUrl, normalizeLocalPath, pickResultLocalPath } from "../utils/localMediaPath.js";
import { buildGenerationStartPatch } from "../core/generationTaskLifecycle.js";
import { buildLocalAudioGenerationResultPatch } from "../components/audio-node/audioGenerationResultRenderer.js";
import { buildVideoGenerationFailurePatch, buildVideoGenerationResultPatch } from "../components/video-node/videoGenerationResultRenderer.js";
import { commit } from "./history.js";
import { getNodeSpawnPrefs } from "./nodeSpawn.js";
import { addToolbarPendingResultNodes, persistToolbarResultNodes, updateToolbarResultNodes } from "./toolbarPendingResultNodes.js";
let _separateVideoAudioImpl = separateVideoAudio;
function videoAudioSeparationText(_0x37b766, _0x167333 = {}) {
  return t("mediaProcessing.videoAudioSeparation." + _0x37b766, _0x167333);
}
function _getState() {
  if (typeof a1434_0x37d081.getStateRaw === "function") {
    return a1434_0x37d081.getStateRaw();
  } else {
    return a1434_0x37d081.getState();
  }
}
function _getNode(_0x43ddea) {
  return _getState().nodes?.[_0x43ddea] || null;
}
function _isVideoNodeType(_0x2cdd5f) {
  const _0x1c0e3f = String(_0x2cdd5f || "").trim().toLowerCase();
  return _0x1c0e3f === "source-video" || _0x1c0e3f === "ai-video" || _0x1c0e3f === "video";
}
function _cleanLocalPath(_0x3e21ad) {
  return normalizeLocalPath(_0x3e21ad);
}
function _resolveSourcePath(_0x4d8843) {
  return _cleanLocalPath(resolveCanvasVideoLocalPath(_0x4d8843));
}
function _getResultLocalPath(_0x4b227b) {
  return pickResultLocalPath(_0x4b227b);
}
function _fileNameFromPath(_0x10e96e) {
  const _0xce1038 = _cleanLocalPath(_0x10e96e);
  if (!_0xce1038) {
    return "";
  }
  const _0x1186b8 = _0xce1038.split("/");
  return String(_0x1186b8[_0x1186b8.length - 1] || "").trim();
}
function _getSpawnLayout(_0x5855e2) {
  const {
    spacing: _0x5e0afb,
    direction: _0x1ab318,
    avoidOverlap: _0xce3aea
  } = getNodeSpawnPrefs();
  const _0x545313 = _0x1ab318 === "down" ? "down" : "right";
  const _0x571218 = Math.max(24, Math.min(80, Math.round(Number(_0x5e0afb || 0) / 2)));
  const _0x497fdc = getAutoMediaSizeByShortSide(Number(_0x5855e2?.width) || 512, Number(_0x5855e2?.height) || 288);
  const _0x4dd2a0 = getNodeDefaultSize("source-audio");
  const _0x393dc5 = Number(_0x5855e2?.x) || 0;
  const _0x1f8ce5 = Number(_0x5855e2?.y) || 0;
  const _0x16fec1 = Number(_0x5855e2?.width) || 512;
  const _0x2e8d5c = Number(_0x5855e2?.height) || 288;
  let _0x3e7432 = _0x545313 === "right" ? _0x393dc5 + _0x16fec1 + _0x5e0afb : _0x393dc5 + Math.round((_0x16fec1 - Math.max(_0x497fdc.width, _0x4dd2a0.width)) / 2);
  let _0x44318e = _0x545313 === "down" ? _0x1f8ce5 + _0x2e8d5c + _0x5e0afb : _0x1f8ce5 + Math.round((_0x2e8d5c - Math.max(_0x497fdc.height, _0x4dd2a0.height)) / 2);
  const _0x583764 = _0x545313 === "right" ? _0x497fdc.width + _0x4dd2a0.width + _0x571218 : Math.max(_0x497fdc.width, _0x4dd2a0.width);
  const _0x4f787d = _0x545313 === "down" ? _0x497fdc.height + _0x4dd2a0.height + _0x571218 : Math.max(_0x497fdc.height, _0x4dd2a0.height);
  if (_0xce3aea) {
    const _0x15af65 = findAvailablePosition(_getState().nodes || {}, _0x3e7432, _0x44318e, _0x583764, _0x4f787d, _0x5e0afb, _0x545313);
    _0x3e7432 = _0x15af65.x;
    _0x44318e = _0x15af65.y;
  }
  return {
    video: {
      x: _0x3e7432,
      y: _0x44318e,
      width: _0x497fdc.width,
      height: _0x497fdc.height
    },
    audio: _0x545313 === "right" ? {
      x: _0x3e7432 + _0x497fdc.width + _0x571218,
      y: _0x44318e + Math.round((_0x497fdc.height - _0x4dd2a0.height) / 2),
      width: _0x4dd2a0.width,
      height: _0x4dd2a0.height
    } : {
      x: _0x3e7432 + Math.round((_0x497fdc.width - _0x4dd2a0.width) / 2),
      y: _0x44318e + _0x497fdc.height + _0x571218,
      width: _0x4dd2a0.width,
      height: _0x4dd2a0.height
    }
  };
}
function _createPendingResultNodes(_0x359455, {
  startedAt = Date.now()
} = {}) {
  const _0x1bab13 = _getSpawnLayout(_0x359455);
  const _0x2be548 = String(_0x359455?.name || "").trim() || videoAudioSeparationText("videoFallback");
  const _0x3b7b78 = generateId("source-video-separate-av");
  const _0x112ce7 = generateId("source-audio-separate-av");
  const _0x1f7604 = buildSourceMediaNodePayload({
    id: _0x3b7b78,
    type: "source-video",
    x: _0x1bab13.video.x,
    y: _0x1bab13.video.y,
    width: _0x1bab13.video.width,
    height: _0x1bab13.video.height,
    name: videoAudioSeparationText("videoNodeName", {
      name: _0x2be548
    }),
    src: "",
    posterUrl: resolveCanvasVideoPosterUrl(_0x359455),
    outputText: videoAudioSeparationText("progress"),
    ...buildGenerationStartPatch({
      startedAt: startedAt
    }),
    needsAutoResize: false,
    fixedSize: true
  });
  const _0x2bc59a = buildSourceAudioNodePayload({
    id: _0x112ce7,
    x: _0x1bab13.audio.x,
    y: _0x1bab13.audio.y,
    width: _0x1bab13.audio.width,
    height: _0x1bab13.audio.height,
    name: videoAudioSeparationText("audioNodeName", {
      name: _0x2be548
    }),
    src: "",
    outputText: videoAudioSeparationText("progress"),
    ...buildGenerationStartPatch({
      startedAt: startedAt
    }),
    needsAutoResize: false,
    fixedSize: true
  });
  addToolbarPendingResultNodes({
    nodes: [_0x1f7604, _0x2bc59a]
  });
  return {
    videoId: _0x3b7b78,
    audioId: _0x112ce7
  };
}
function _buildSuccessPatches(_0x4f26a0, _0x3e38e2, {
  startedAt = 0
} = {}) {
  const _0x5f2052 = _getResultLocalPath(_0x3e38e2?.video);
  const _0x568c20 = _getResultLocalPath(_0x3e38e2?.audio);
  if (!_0x5f2052 || !_0x568c20) {
    throw new Error(videoAudioSeparationText("incompleteResult"));
  }
  const _0x513a3f = String(_0x4f26a0?.name || "").trim() || videoAudioSeparationText("videoFallback");
  const _0x19a72a = _0x3e38e2?.video?.filename || _fileNameFromPath(_0x5f2052);
  const _0x18bcaa = _0x3e38e2?.audio?.filename || _fileNameFromPath(_0x568c20);
  const _0x49b273 = buildVideoGenerationResultPatch({
    localPath: _0x5f2052,
    videoUrl: _0x3e38e2?.video?.url,
    fileName: _0x19a72a
  }, {
    startedAt: startedAt
  }) || {};
  const _0x55b033 = buildLocalAudioGenerationResultPatch({
    localPath: _0x568c20,
    audioUrl: _0x3e38e2?.audio?.url,
    fileName: _0x18bcaa
  }, {
    startedAt: startedAt
  }) || {};
  return {
    videoPatch: {
      name: videoAudioSeparationText("videoNodeName", {
        name: _0x513a3f
      }),
      ..._0x49b273,
      src: localPathToUrl(_0x49b273.localPath) || _0x49b273.videoUrl || "",
      fileName: _0x19a72a,
      needsAutoResize: false,
      fixedSize: true
    },
    audioPatch: {
      name: videoAudioSeparationText("audioNodeName", {
        name: _0x513a3f
      }),
      ..._0x55b033,
      fileName: _0x18bcaa
    }
  };
}
function _applyFailureResult({
  videoId: _0x33eb73,
  audioId: _0x3b6530,
  startedAt = 0,
  message = ""
} = {}) {
  const _0xeef69a = String(message || videoAudioSeparationText("fallback")).trim() || videoAudioSeparationText("fallback");
  updateToolbarResultNodes([{
    nodeId: _0x33eb73,
    patch: buildVideoGenerationFailurePatch({
      error: _0xeef69a,
      startedAt: startedAt
    }) || {}
  }, {
    nodeId: _0x3b6530,
    patch: buildLocalAudioGenerationResultPatch({
      error: _0xeef69a
    }, {
      startedAt: startedAt
    }) || {}
  }]);
  persistToolbarResultNodes();
}
export async function runVideoAudioSeparationFromNode(_0x137815) {
  const _0x5b805a = _getNode(_0x137815);
  if (!_0x5b805a || !_isVideoNodeType(_0x5b805a.type)) {
    window.showToast?.(videoAudioSeparationText("unsupportedNode"), "warn");
    return null;
  }
  if (_0x5b805a.isGenerating) {
    window.showToast?.(videoAudioSeparationText("busy"), "info");
    return null;
  }
  const _0xcfc308 = _resolveSourcePath(_0x5b805a);
  if (!_0xcfc308) {
    window.showToast?.(videoAudioSeparationText("notLocalFile"), "warn");
    return null;
  }
  window.showToast?.(videoAudioSeparationText("progress"), "info");
  const _0x14bcc6 = Date.now();
  const {
    videoId: _0x5c18c8,
    audioId: _0x337b1c
  } = _createPendingResultNodes(_0x5b805a, {
    startedAt: _0x14bcc6
  });
  try {
    const _0x59598b = await _separateVideoAudioImpl({
      src: _0xcfc308
    });
    const {
      videoPatch: _0x326af2,
      audioPatch: _0x677684
    } = _buildSuccessPatches(_0x5b805a, _0x59598b, {
      startedAt: _0x14bcc6
    });
    updateToolbarResultNodes([{
      nodeId: _0x5c18c8,
      patch: _0x326af2
    }, {
      nodeId: _0x337b1c,
      patch: _0x677684
    }]);
    commit();
    persistToolbarResultNodes();
    window.showToast?.(videoAudioSeparationText("success"), "success");
    return {
      videoId: _0x5c18c8,
      audioId: _0x337b1c
    };
  } catch (_0xa02aa9) {
    const _0x107d82 = _0xa02aa9 instanceof Error ? _0xa02aa9.message : String(_0xa02aa9 || videoAudioSeparationText("fallback"));
    _applyFailureResult({
      videoId: _0x5c18c8,
      audioId: _0x337b1c,
      startedAt: _0x14bcc6,
      message: _0x107d82
    });
    commit();
    window.showToast?.(videoAudioSeparationText("failedWithMessage", {
      message: _0x107d82
    }), "error");
    return null;
  }
}
export function __setVideoAudioSeparationDepsForTest({
  separateVideoAudioImpl: _0x34ec6e
} = {}) {
  _separateVideoAudioImpl = typeof _0x34ec6e === "function" ? _0x34ec6e : separateVideoAudio;
}
export function __resetVideoAudioSeparationDepsForTest() {
  _separateVideoAudioImpl = separateVideoAudio;
}