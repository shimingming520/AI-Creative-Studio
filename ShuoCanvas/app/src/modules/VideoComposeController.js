import a1438_0x337768 from "../core/stores/appStore.js";
import { requester } from "../../api/requester.js";
import { t } from "../i18n/index.js";
import { canUseElectronMediaTask, enqueueElectronMediaTask } from "../../api/localMediaTaskApi.js";
import { generateId } from "../core/math.js";
import { commit } from "./history.js";
import { calcSafeSpawnPosNearNode } from "./nodeSpawn.js";
import { buildSourceAudioNodePayload, buildSourceMediaNodePayload, getAutoMediaSizeByShortSide } from "../services/fileService.js";
import { localPathToUrl, pickResultLocalPath } from "../utils/localMediaPath.js";
import { getOrderedMediaComposeIds, getSelectedMediaComposeKind } from "./mediaComposeSelection.js";
const MEDIA_COMPOSE_CONFIG = Object.freeze({
  video: Object.freeze({
    taskKind: "videoCompose",
    endpoint: "/api/v2/video/compose",
    textKey: "video",
    resultIdPrefix: "source-video-compose",
    sourceFields: Object.freeze(["localPath", "src", "videoUrl", "url", "resultUrl"])
  }),
  audio: Object.freeze({
    taskKind: "audioCompose",
    endpoint: "/api/v2/audio/compose",
    textKey: "audio",
    resultIdPrefix: "source-audio-compose",
    sourceFields: Object.freeze(["localPath", "audioUrl", "src", "url", "resultUrl"])
  })
});
function mediaComposeText(_0x480616, _0x2f69a4, _0xd47164 = {}) {
  return t("mediaProcessing.compose." + _0x480616.textKey + "." + _0x2f69a4, _0xd47164);
}
function audioVoiceComposeText(_0x427786, _0x48538a = {}) {
  return t("mediaProcessing.compose.audioVoice." + _0x427786, _0x48538a);
}
function resolveNodeSrc(_0x2b4efb, _0x369ea6) {
  const _0x4525e = Array.isArray(_0x369ea6?.sourceFields) ? _0x369ea6.sourceFields : [];
  for (const _0x1e97e4 of _0x4525e) {
    const _0x28996c = localPathToUrl(_0x2b4efb?.[_0x1e97e4]);
    if (_0x28996c) {
      return _0x28996c;
    }
  }
  return "";
}
function getResultNodeSize(_0x282864, _0x3fa63e) {
  if (_0x282864 === "audio") {
    return {
      width: Number(_0x3fa63e?.width || 0) || 320,
      height: Number(_0x3fa63e?.height || 0) || 140
    };
  }
  return getAutoMediaSizeByShortSide(_0x3fa63e?.width || 512, _0x3fa63e?.height || 288);
}
function buildComposedNodePayload(_0x342649, _0x33eef0, {
  id: _0x509b3e,
  x: _0x558c8e,
  y: _0x4112f8,
  width: _0x5cc763,
  height: _0x52138e,
  localPath: _0x519ac6,
  result = {}
}) {
  const _0x4d871 = localPathToUrl(_0x519ac6);
  if (_0x342649 === "audio") {
    return buildSourceAudioNodePayload({
      id: _0x509b3e,
      type: "source-audio",
      x: _0x558c8e,
      y: _0x4112f8,
      width: _0x5cc763,
      height: _0x52138e,
      name: mediaComposeText(_0x33eef0, "resultName"),
      src: _0x4d871,
      audioUrl: _0x4d871,
      localPath: _0x519ac6,
      needsAutoResize: false,
      fixedSize: true
    });
  }
  const _0x3540dd = String(result?.posterLocalPath || result?.thumbLocalPath || "").trim();
  const _0x187624 = String(result?.posterUrl || result?.thumbUrl || localPathToUrl(_0x3540dd)).trim();
  return buildSourceMediaNodePayload({
    id: _0x509b3e,
    type: "source-video",
    x: _0x558c8e,
    y: _0x4112f8,
    width: _0x5cc763,
    height: _0x52138e,
    name: mediaComposeText(_0x33eef0, "resultName"),
    src: _0x4d871,
    localPath: _0x519ac6,
    posterLocalPath: _0x3540dd,
    thumbLocalPath: String(result?.thumbLocalPath || _0x3540dd).trim(),
    posterUrl: _0x187624,
    thumbUrl: String(result?.thumbUrl || _0x187624).trim(),
    videoDuration: Number(result?.videoDuration || result?.duration || 0) || 0,
    videoWidth: Number(result?.videoWidth || result?.width || 0) || 0,
    videoHeight: Number(result?.videoHeight || result?.height || 0) || 0,
    videoFps: Number(result?.videoFps || result?.fps || 0) || 0,
    fps: Number(result?.fps || result?.videoFps || 0) || 0,
    needsAutoResize: false,
    fixedSize: true
  });
}
export function __buildComposedNodePayloadForTest(_0xf78f8c, _0x3b03d7 = {}) {
  const _0xd67ac8 = MEDIA_COMPOSE_CONFIG[_0xf78f8c];
  if (!_0xd67ac8) {
    throw new Error("Unsupported media compose kind: " + (_0xf78f8c || "unknown"));
  }
  return buildComposedNodePayload(_0xf78f8c, _0xd67ac8, _0x3b03d7);
}
function buildAudioVoiceComposedNodePayload(_0x65215e, {
  id: _0x1130df,
  x: _0x409b42,
  y: _0x2df2ff,
  width: _0x5cce1b,
  height: _0x255544,
  localPath: _0x514b18,
  result = {}
}) {
  const _0x3139ef = localPathToUrl(_0x514b18);
  if (_0x65215e === "audio") {
    return buildSourceAudioNodePayload({
      id: _0x1130df,
      type: "source-audio",
      x: _0x409b42,
      y: _0x2df2ff,
      width: _0x5cce1b,
      height: _0x255544,
      name: audioVoiceComposeText("audioResultName"),
      src: _0x3139ef,
      audioUrl: _0x3139ef,
      localPath: _0x514b18,
      needsAutoResize: false,
      fixedSize: true
    });
  }
  const _0x3882e0 = String(result?.posterLocalPath || result?.thumbLocalPath || "").trim();
  const _0x3264aa = String(result?.posterUrl || result?.thumbUrl || localPathToUrl(_0x3882e0)).trim();
  return buildSourceMediaNodePayload({
    id: _0x1130df,
    type: "source-video",
    x: _0x409b42,
    y: _0x2df2ff,
    width: _0x5cce1b,
    height: _0x255544,
    name: audioVoiceComposeText("videoResultName"),
    src: _0x3139ef,
    localPath: _0x514b18,
    posterLocalPath: _0x3882e0,
    thumbLocalPath: String(result?.thumbLocalPath || _0x3882e0).trim(),
    posterUrl: _0x3264aa,
    thumbUrl: String(result?.thumbUrl || _0x3264aa).trim(),
    videoDuration: Number(result?.videoDuration || result?.duration || 0) || 0,
    videoWidth: Number(result?.videoWidth || result?.width || 0) || 0,
    videoHeight: Number(result?.videoHeight || result?.height || 0) || 0,
    videoFps: Number(result?.videoFps || result?.fps || 0) || 0,
    fps: Number(result?.fps || result?.videoFps || 0) || 0,
    needsAutoResize: false,
    fixedSize: true
  });
}
async function runMediaComposeRequest(_0xf0683b, _0x4bf300) {
  if (canUseElectronMediaTask()) {
    return await enqueueElectronMediaTask({
      kind: _0xf0683b.taskKind,
      srcs: _0x4bf300,
      args: {
        srcs: _0x4bf300
      }
    }, {
      wait: true,
      timeout: 600000
    });
  }
  const _0x352386 = await requester({
    url: _0xf0683b.endpoint,
    method: "POST",
    provider: "local",
    timeout: 300000,
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      srcs: _0x4bf300
    }),
    allow404Null: true,
    returnMeta: true
  });
  if (_0x352386?.status === 404 || _0x352386?.data == null) {
    throw new Error(mediaComposeText(_0xf0683b, "missingApi"));
  }
  return _0x352386.data || {};
}
async function composeMediaSourcesNearNode({
  mediaKind = "",
  srcs = [],
  anchorNode = null,
  triggerEl = null
} = {}) {
  const _0x542bbe = MEDIA_COMPOSE_CONFIG[mediaKind];
  if (!_0x542bbe) {
    return null;
  }
  const _0x4de1e4 = (Array.isArray(srcs) ? srcs : []).map(_0x2d83df => String(_0x2d83df || "").trim()).filter(Boolean);
  if (_0x4de1e4.length < 2) {
    window.showToast?.(mediaComposeText(_0x542bbe, "invalidSource"), "error");
    return null;
  }
  if (triggerEl) {
    triggerEl.dataset.loading = "true";
    triggerEl.disabled = true;
  }
  window.showToast?.(mediaComposeText(_0x542bbe, "progress"), "info");
  try {
    const _0x41744e = await runMediaComposeRequest(_0x542bbe, _0x4de1e4);
    const _0x281f5a = pickResultLocalPath(_0x41744e);
    if (!_0x41744e.success || !_0x281f5a) {
      throw new Error(_0x41744e.error || _0x41744e.message || mediaComposeText(_0x542bbe, "fallback"));
    }
    const _0x4fde85 = a1438_0x337768.getState();
    const _0x37bf5c = _0x4fde85.nodes || {};
    const {
      width: _0x29b682,
      height: _0x135e3d
    } = getResultNodeSize(mediaKind, anchorNode);
    const _0x526183 = calcSafeSpawnPosNearNode(_0x37bf5c, anchorNode || {}, _0x29b682, _0x135e3d);
    const _0x4ada44 = generateId(_0x542bbe.resultIdPrefix);
    a1438_0x337768.addNode(buildComposedNodePayload(mediaKind, _0x542bbe, {
      id: _0x4ada44,
      x: _0x526183.x,
      y: _0x526183.y,
      width: _0x29b682,
      height: _0x135e3d,
      localPath: _0x281f5a,
      result: _0x41744e
    }));
    a1438_0x337768.setSelectedNodes([_0x4ada44]);
    commit();
    window._triggerLocalCacheSave?.();
    window.showToast?.(mediaComposeText(_0x542bbe, "success"), "success");
    return {
      nodeId: _0x4ada44,
      localPath: _0x281f5a,
      data: _0x41744e
    };
  } catch (_0x42ea93) {
    const _0x2064ee = _0x42ea93 instanceof Error ? _0x42ea93.message : String(_0x42ea93 || mediaComposeText(_0x542bbe, "fallback"));
    window.showToast?.(mediaComposeText(_0x542bbe, "failedWithMessage", {
      message: _0x2064ee
    }), "error");
    return null;
  } finally {
    if (triggerEl) {
      triggerEl.dataset.loading = "false";
      triggerEl.disabled = false;
    }
  }
}
async function composeSelectedMedia(_0xa43fa3, _0x3e013e, _0x5c140c) {
  const _0x4ec71a = MEDIA_COMPOSE_CONFIG[_0x5c140c];
  if (!_0x4ec71a) {
    return;
  }
  const _0x44af49 = a1438_0x337768.getState();
  const _0xd8446b = _0x44af49.nodes || {};
  const _0x4c6a0e = _0x44af49.selectionMeta || {};
  const _0x10ded9 = Array.isArray(_0xa43fa3) ? _0xa43fa3.slice() : [];
  if (getSelectedMediaComposeKind(_0xd8446b, _0x10ded9) !== _0x5c140c) {
    window.showToast?.(mediaComposeText(_0x4ec71a, "minSelection"), "info");
    return;
  }
  const _0x3ff407 = getOrderedMediaComposeIds(_0xd8446b, _0x10ded9, _0x4c6a0e);
  const _0x5483b6 = _0x3ff407.map(_0x5d2208 => resolveNodeSrc(_0xd8446b[_0x5d2208], _0x4ec71a)).filter(Boolean);
  if (_0x5483b6.length < 2) {
    window.showToast?.(mediaComposeText(_0x4ec71a, "invalidSource"), "error");
    return;
  }
  return composeMediaSourcesNearNode({
    mediaKind: _0x5c140c,
    srcs: _0x5483b6,
    anchorNode: _0xd8446b[_0x3ff407[0]],
    triggerEl: _0x3e013e
  });
}
export async function composeSelectedVideos(_0x1ba368, _0x1726e1) {
  return composeSelectedMedia(_0x1ba368, _0x1726e1, "video");
}
export async function composeSelectedAudios(_0x537218, _0x443b5e) {
  return composeSelectedMedia(_0x537218, _0x443b5e, "audio");
}
export async function composeAudioSourcesNearNode({
  srcs = [],
  anchorNode = null,
  triggerEl = null
} = {}) {
  return composeMediaSourcesNearNode({
    mediaKind: "audio",
    srcs: srcs,
    anchorNode: anchorNode,
    triggerEl: triggerEl
  });
}
export async function composeAudioVoiceTimelineNearNode({
  sourceKind = "video",
  src = "",
  clips = [],
  durationSec = 0,
  anchorNode = null,
  triggerEl = null
} = {}) {
  const _0x24731b = sourceKind === "audio" ? "audio" : "video";
  const _0x56e45a = String(src || "").trim();
  const _0x45222c = (Array.isArray(clips) ? clips : []).filter(_0x1bae92 => _0x1bae92?.src);
  if (!_0x56e45a || _0x45222c.length <= 0) {
    window.showToast?.(audioVoiceComposeText("invalidSource"), "error");
    return null;
  }
  if (!canUseElectronMediaTask()) {
    window.showToast?.(audioVoiceComposeText("missingTask"), "error");
    return null;
  }
  if (triggerEl) {
    triggerEl.dataset.loading = "true";
    triggerEl.disabled = true;
  }
  window.showToast?.(audioVoiceComposeText(_0x24731b === "video" ? "videoProgress" : "audioProgress"), "info");
  try {
    const _0x2ab6ac = await enqueueElectronMediaTask({
      kind: "audioVoiceCompose",
      src: _0x56e45a,
      args: {
        sourceKind: _0x24731b,
        durationSec: durationSec,
        clips: _0x45222c
      }
    }, {
      wait: true,
      timeout: 600000
    });
    const _0x380ee1 = pickResultLocalPath(_0x2ab6ac);
    if (!_0x2ab6ac?.success || !_0x380ee1) {
      throw new Error(_0x2ab6ac?.error || _0x2ab6ac?.message || audioVoiceComposeText("fallback"));
    }
    const _0x1a1e55 = a1438_0x337768.getState();
    const _0xc65869 = _0x1a1e55.nodes || {};
    const {
      width: _0x354d4f,
      height: _0x3caa36
    } = getResultNodeSize(_0x24731b, anchorNode);
    const _0x222f77 = calcSafeSpawnPosNearNode(_0xc65869, anchorNode || {}, _0x354d4f, _0x3caa36);
    const _0x2ff7b7 = generateId(_0x24731b === "audio" ? "source-audio-voice-compose" : "source-video-voice-compose");
    a1438_0x337768.addNode(buildAudioVoiceComposedNodePayload(_0x24731b, {
      id: _0x2ff7b7,
      x: _0x222f77.x,
      y: _0x222f77.y,
      width: _0x354d4f,
      height: _0x3caa36,
      localPath: _0x380ee1,
      result: _0x2ab6ac
    }));
    a1438_0x337768.setSelectedNodes([_0x2ff7b7]);
    commit();
    window._triggerLocalCacheSave?.();
    window.showToast?.(audioVoiceComposeText(_0x24731b === "video" ? "videoSuccess" : "audioSuccess"), "success");
    return {
      nodeId: _0x2ff7b7,
      localPath: _0x380ee1,
      data: _0x2ab6ac
    };
  } catch (_0x15d276) {
    const _0x5aed65 = _0x15d276 instanceof Error ? _0x15d276.message : String(_0x15d276 || audioVoiceComposeText("fallback"));
    window.showToast?.(audioVoiceComposeText("failedWithMessage", {
      message: _0x5aed65
    }), "error");
    return null;
  } finally {
    if (triggerEl) {
      triggerEl.dataset.loading = "false";
      triggerEl.disabled = false;
    }
  }
}