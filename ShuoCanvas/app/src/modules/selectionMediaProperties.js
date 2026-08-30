import { fetchVideoMetaFromServer } from "../../api/videoMetaApi.js";
import { onLocaleChange, t } from "../i18n/index.js";
import { normalizeLocalPath } from "../utils/localMediaPath.js";
import { normalizeNodeType } from "./nodeMeta.js";
import { resolveNodeDisplayedMediaMetrics } from "./nodeMediaMetrics.js";
import { resolveSourceVideoMediaTaskSrc } from "../components/source-video/sourceVideoMediaState.js";
import { scheduleSourceVideoIdleTask } from "../components/source-video/sourceVideoRuntime.js";
const VIDEO_META_RETRY_DELAY_MS = 30000;
const IMAGE_NODE_TYPES = new Set(["source-image", "ai-image"]);
const VIDEO_NODE_TYPES = new Set(["source-video", "ai-video"]);
const AUDIO_NODE_TYPES = new Set(["source-audio", "ai-audio"]);
const TEXT_EDITOR_SELECTOR = ".prompt-textarea, .source-text-content";
function toPositiveNumber(_0x43f789) {
  const _0x218e17 = Number(_0x43f789);
  if (Number.isFinite(_0x218e17) && _0x218e17 > 0) {
    return _0x218e17;
  } else {
    return 0;
  }
}
function pickPositiveNumber(..._0x3032e1) {
  for (const _0x5cd4ff of _0x3032e1) {
    const _0x2f5c98 = toPositiveNumber(_0x5cd4ff);
    if (_0x2f5c98 > 0) {
      return _0x2f5c98;
    }
  }
  return 0;
}
function normalizeMetaSourceIdentity(_0x36c134) {
  return normalizeLocalPath(_0x36c134) || String(_0x36c134 || "").trim();
}
function pickMainItem(_0x5a215b, _0x8a9e55) {
  if (!Array.isArray(_0x5a215b) || _0x5a215b.length === 0) {
    return null;
  }
  const _0x2a9b93 = Number(_0x8a9e55);
  const _0x1e6184 = Number.isFinite(_0x2a9b93) ? Math.max(0, Math.trunc(_0x2a9b93)) : 0;
  return _0x5a215b[_0x1e6184] || _0x5a215b[0] || null;
}
function resolveNodeName(_0x40af98, _0x28f3cd) {
  return String(_0x40af98?.name || _0x40af98?.fileName || _0x28f3cd?.name || _0x28f3cd?.fileName || "").trim();
}
function buildImageModel(_0x3223ed) {
  const _0xdad676 = {
    ..._0x3223ed,
    type: normalizeNodeType(_0x3223ed?.type)
  };
  const _0x262001 = pickMainItem(_0xdad676.images, _0xdad676.mainImageIndex) || _0xdad676;
  const _0x2df3f5 = resolveNodeDisplayedMediaMetrics(_0xdad676).image;
  const _0x2125b4 = pickPositiveNumber(_0x262001?.originalWidth, _0x262001?.imageWidth, _0x2df3f5?.w, _0xdad676.originalWidth, _0xdad676.imageWidth, _0xdad676.naturalWidth);
  const _0x2d6f85 = pickPositiveNumber(_0x262001?.originalHeight, _0x262001?.imageHeight, _0x2df3f5?.h, _0xdad676.originalHeight, _0xdad676.imageHeight, _0xdad676.naturalHeight);
  return {
    nodeId: String(_0xdad676.id || ""),
    kind: "image",
    name: resolveNodeName(_0xdad676, _0x262001),
    width: _0x2125b4,
    height: _0x2d6f85,
    duration: 0,
    fps: 0,
    frameCount: 0,
    frameCountApproximate: false,
    metaSource: "",
    needsVideoProbe: false
  };
}
function buildVideoModel(_0x558451) {
  const _0x11f659 = {
    ..._0x558451,
    type: normalizeNodeType(_0x558451?.type)
  };
  const _0xd71cba = pickMainItem(_0x11f659.videos, _0x11f659.mainVideoIndex) || _0x11f659;
  const _0x508bee = resolveSourceVideoMediaTaskSrc(_0x11f659);
  const _0x58d8b0 = normalizeMetaSourceIdentity(_0x508bee);
  const _0x101578 = normalizeMetaSourceIdentity(_0x11f659.videoMetaSrc);
  const _0x141179 = !_0x101578 || !_0x58d8b0 || _0x101578 === _0x58d8b0;
  const _0x29a5fb = resolveNodeDisplayedMediaMetrics(_0x11f659).video;
  const _0x53757c = pickPositiveNumber(_0xd71cba?.videoWidth, _0xd71cba?.originalWidth, _0xd71cba?.width, _0x29a5fb?.w, _0x141179 ? _0x11f659.videoWidth : 0, _0x11f659.naturalWidth);
  const _0xa946c9 = pickPositiveNumber(_0xd71cba?.videoHeight, _0xd71cba?.originalHeight, _0xd71cba?.height, _0x29a5fb?.h, _0x141179 ? _0x11f659.videoHeight : 0, _0x11f659.naturalHeight);
  const _0xe8bacd = pickPositiveNumber(_0xd71cba?.videoDuration, _0xd71cba?.duration, _0x141179 ? _0x11f659.videoDuration : 0, _0x11f659.duration);
  const _0x2a4a20 = pickPositiveNumber(_0xd71cba?.videoFps, _0xd71cba?.fps, _0x141179 ? _0x11f659.videoFps : 0, _0x11f659.fps, _0x11f659.frameRate);
  const _0x9289e2 = pickPositiveNumber(_0xd71cba?.videoFrameCount, _0xd71cba?.frameCount, _0x141179 ? _0x11f659.videoFrameCount : 0, _0x11f659.frameCount);
  const _0x1e2d02 = _0x9289e2 <= 0 && _0xe8bacd > 0 && _0x2a4a20 > 0 ? Math.max(1, Math.round(_0xe8bacd * _0x2a4a20)) : 0;
  return {
    nodeId: String(_0x11f659.id || ""),
    kind: "video",
    name: resolveNodeName(_0x11f659, _0xd71cba),
    width: _0x53757c,
    height: _0xa946c9,
    duration: _0xe8bacd,
    fps: _0x2a4a20,
    frameCount: _0x9289e2 || _0x1e2d02,
    frameCountApproximate: _0x9289e2 <= 0 && _0x1e2d02 > 0,
    metaSource: _0x508bee,
    needsVideoProbe: !!_0x508bee && (_0x53757c <= 0 || _0xa946c9 <= 0 || _0xe8bacd <= 0 || _0x2a4a20 <= 0 || _0x9289e2 <= 0)
  };
}
function buildAudioModel(_0x1789fc) {
  const _0x5b3b32 = {
    ..._0x1789fc,
    type: normalizeNodeType(_0x1789fc?.type)
  };
  const _0x1ce459 = pickMainItem(_0x5b3b32.audios, _0x5b3b32.mainAudioIndex) || _0x5b3b32;
  const _0xcbf8b0 = pickPositiveNumber(_0x1ce459?.audioDuration, _0x1ce459?.duration, _0x5b3b32.audioDuration, _0x5b3b32.duration);
  return {
    nodeId: String(_0x5b3b32.id || ""),
    kind: "audio",
    name: resolveNodeName(_0x5b3b32, _0x1ce459),
    width: 0,
    height: 0,
    duration: _0xcbf8b0,
    fps: 0,
    frameCount: 0,
    frameCountApproximate: false,
    metaSource: "",
    needsVideoProbe: false
  };
}
function buildTextEditingModel(_0x38b24f, _0x55d248) {
  return {
    nodeId: String(_0x38b24f?.id || ""),
    kind: "text",
    name: resolveNodeName(_0x38b24f),
    width: 0,
    height: 0,
    duration: 0,
    fps: 0,
    frameCount: 0,
    frameCountApproximate: false,
    characterCount: _0x55d248,
    metaSource: "",
    needsVideoProbe: false
  };
}
export function buildSelectionMediaPropertiesModel(_0x4f16e0) {
  const _0xf839d9 = normalizeNodeType(_0x4f16e0?.type);
  if (IMAGE_NODE_TYPES.has(_0xf839d9)) {
    return buildImageModel(_0x4f16e0);
  }
  if (VIDEO_NODE_TYPES.has(_0xf839d9)) {
    return buildVideoModel(_0x4f16e0);
  }
  if (AUDIO_NODE_TYPES.has(_0xf839d9)) {
    return buildAudioModel(_0x4f16e0);
  }
  return null;
}
export function selectSelectionMediaPropertiesModel(_0xbb6985 = {}) {
  const _0x400cff = Array.isArray(_0xbb6985.selectedNodeIds) ? _0xbb6985.selectedNodeIds : [];
  if (_0x400cff.length !== 1) {
    return null;
  }
  const _0x4286ff = _0xbb6985.nodes?.[_0x400cff[0]];
  return buildSelectionMediaPropertiesModel(_0x4286ff);
}
function isSupportedTextEditor(_0x2b7214) {
  if (!_0x2b7214?.matches?.(TEXT_EDITOR_SELECTOR)) {
    return false;
  }
  if (!_0x2b7214.matches(".source-text-content")) {
    return true;
  }
  return _0x2b7214.isContentEditable === true || _0x2b7214.getAttribute?.("contenteditable") === "true";
}
function readEditorText(_0x18af41) {
  if (typeof _0x18af41?.value === "string") {
    return _0x18af41.value;
  }
  if (typeof _0x18af41?.innerText === "string") {
    return _0x18af41.innerText;
  }
  return String(_0x18af41?.textContent || "");
}
export function selectActiveTextEditingProperties(_0xdaab7d = {}, _0x38040d = globalThis.document) {
  const _0x3d9186 = _0x38040d?.activeElement;
  if (!isSupportedTextEditor(_0x3d9186)) {
    return null;
  }
  const _0x1cfeb2 = _0x3d9186.closest?.("[data-node-id]");
  const _0x3dfb64 = String(_0x1cfeb2?.dataset?.nodeId || _0x1cfeb2?.getAttribute?.("data-node-id") || "").trim();
  if (!_0x3dfb64 || !_0xdaab7d.nodes?.[_0x3dfb64]) {
    return null;
  }
  return {
    nodeId: _0x3dfb64,
    characterCount: readEditorText(_0x3d9186).length
  };
}
export function selectSelectionPropertiesDisplayModel(_0x495fa1 = {}, _0x58d70f = globalThis.document) {
  const _0x2d14d2 = selectActiveTextEditingProperties(_0x495fa1, _0x58d70f);
  if (!_0x2d14d2) {
    return selectSelectionMediaPropertiesModel(_0x495fa1);
  }
  const _0x7d4df1 = _0x495fa1.nodes?.[_0x2d14d2.nodeId];
  const _0x27dd3f = buildSelectionMediaPropertiesModel(_0x7d4df1) || buildTextEditingModel(_0x7d4df1, _0x2d14d2.characterCount);
  return {
    ..._0x27dd3f,
    characterCount: _0x2d14d2.characterCount
  };
}
function formatDecimal(_0x12eba9, _0x51af19 = 2) {
  const _0x46764e = toPositiveNumber(_0x12eba9);
  if (_0x46764e <= 0) {
    return "";
  }
  return new Intl.NumberFormat(undefined, {
    maximumFractionDigits: _0x51af19
  }).format(_0x46764e);
}
function formatDimension(_0x2e0b5c, _0x83fd3) {
  const _0x39051b = Math.round(toPositiveNumber(_0x2e0b5c));
  const _0x1ce060 = Math.round(toPositiveNumber(_0x83fd3));
  if (_0x39051b <= 0 || _0x1ce060 <= 0) {
    return "—";
  }
  return _0x39051b + " × " + _0x1ce060;
}
function formatDuration(_0x7fc9b0) {
  const _0x5c13db = formatDecimal(_0x7fc9b0);
  if (_0x5c13db) {
    return t("selectionMediaProperties.values.seconds", {
      value: _0x5c13db
    });
  } else {
    return "—";
  }
}
function formatFps(_0x16e610) {
  const _0x235c2a = formatDecimal(_0x16e610);
  if (_0x235c2a) {
    return _0x235c2a + " fps";
  } else {
    return "—";
  }
}
function formatFrameCount(_0xadf90c, _0x5756c0) {
  const _0x376f68 = Math.round(toPositiveNumber(_0xadf90c));
  if (_0x376f68 <= 0) {
    return "—";
  }
  return t(_0x5756c0 ? "selectionMediaProperties.values.framesApproximate" : "selectionMediaProperties.values.frames", {
    value: new Intl.NumberFormat().format(_0x376f68)
  });
}
function formatCharacterCount(_0x366413) {
  const _0x5c388d = Number(_0x366413);
  const _0x59b8ba = Number.isFinite(_0x5c388d) ? Math.max(0, Math.trunc(_0x5c388d)) : 0;
  return new Intl.NumberFormat().format(_0x59b8ba);
}
function setText(_0x5ab68b, _0x44e686, _0x465f4f) {
  const _0x2911e7 = _0x5ab68b?.querySelector?.(_0x44e686);
  if (_0x2911e7 && _0x2911e7.textContent !== _0x465f4f) {
    _0x2911e7.textContent = _0x465f4f;
  }
}
function setRowVisible(_0x1c9099, _0x361121, _0x292916) {
  const _0x2ad291 = _0x1c9099?.querySelector?.("[data-selection-media-row=\"" + _0x361121 + "\"]");
  if (_0x2ad291) {
    _0x2ad291.hidden = _0x292916 !== true;
  }
}
export function renderSelectionMediaProperties(_0x5a70cd, _0x646251) {
  if (!_0x5a70cd) {
    return;
  }
  if (!_0x646251) {
    _0x5a70cd.hidden = true;
    _0x5a70cd.removeAttribute?.("data-media-kind");
    return;
  }
  _0x5a70cd.hidden = false;
  _0x5a70cd.setAttribute?.("data-media-kind", _0x646251.kind);
  setText(_0x5a70cd, "[data-selection-media-kind]", t("selectionMediaProperties." + _0x646251.kind));
  setText(_0x5a70cd, "[data-selection-media-name]", _0x646251.name || t("selectionMediaProperties." + _0x646251.kind));
  setText(_0x5a70cd, "[data-selection-media-value=\"dimensions\"]", formatDimension(_0x646251.width, _0x646251.height));
  const _0x58402f = _0x646251.kind === "image" || _0x646251.kind === "video";
  const _0x467618 = _0x646251.kind === "video";
  const _0xe6c802 = _0x467618 || _0x646251.kind === "audio";
  const _0x13904c = Number.isFinite(_0x646251.characterCount);
  setRowVisible(_0x5a70cd, "dimensions", _0x58402f);
  setRowVisible(_0x5a70cd, "duration", _0xe6c802);
  setRowVisible(_0x5a70cd, "fps", _0x467618);
  setRowVisible(_0x5a70cd, "frames", _0x467618);
  setRowVisible(_0x5a70cd, "characters", _0x13904c);
  if (_0xe6c802) {
    setText(_0x5a70cd, "[data-selection-media-value=\"duration\"]", formatDuration(_0x646251.duration));
  }
  if (_0x467618) {
    setText(_0x5a70cd, "[data-selection-media-value=\"fps\"]", formatFps(_0x646251.fps));
    setText(_0x5a70cd, "[data-selection-media-value=\"frames\"]", formatFrameCount(_0x646251.frameCount, _0x646251.frameCountApproximate === true));
  }
  if (_0x13904c) {
    setText(_0x5a70cd, "[data-selection-media-value=\"characters\"]", formatCharacterCount(_0x646251.characterCount));
  }
}
function buildVideoMetaPatch(_0x3c27e6, _0x2670c4) {
  const _0x204189 = {
    videoMetaSrc: _0x2670c4
  };
  const _0x2e33b1 = toPositiveNumber(_0x3c27e6?.fps);
  const _0x43abe7 = toPositiveNumber(_0x3c27e6?.frameCount);
  const _0x5a560d = toPositiveNumber(_0x3c27e6?.duration);
  const _0x495271 = toPositiveNumber(_0x3c27e6?.width);
  const _0x39ce09 = toPositiveNumber(_0x3c27e6?.height);
  if (_0x2e33b1 > 0) {
    _0x204189.videoFps = _0x2e33b1;
  }
  if (_0x43abe7 > 0) {
    _0x204189.videoFrameCount = Math.round(_0x43abe7);
  }
  if (_0x5a560d > 0) {
    _0x204189.videoDuration = _0x5a560d;
  }
  if (_0x495271 > 0) {
    _0x204189.videoWidth = Math.round(_0x495271);
  }
  if (_0x39ce09 > 0) {
    _0x204189.videoHeight = Math.round(_0x39ce09);
  }
  return _0x204189;
}
export function initSelectionMediaProperties({
  graphStore: _0x52a5ce,
  uiStore: _0x17f807,
  element: _0x295363,
  fetchVideoMeta = fetchVideoMetaFromServer,
  scheduleIdleTask = scheduleSourceVideoIdleTask,
  now = () => Date.now(),
  documentObject = globalThis.document
} = {}) {
  if (!_0x52a5ce?.subscribeSelector || !_0x17f807?.subscribeSelector || !_0x295363) {
    return () => {};
  }
  let _0x5198f2 = _0x17f807.getState?.()?.ui?.showSelectionMediaProperties !== false;
  let _0x3da710 = selectSelectionMediaPropertiesModel(_0x52a5ce.getStateRaw?.() || _0x52a5ce.getState?.());
  let _0x112b44 = null;
  let _0x50824f = "";
  let _0x5d7ca7 = false;
  let _0x3261db = false;
  const _0x47263f = new Map();
  const _0x5a9179 = () => {
    _0x112b44?.();
    _0x112b44 = null;
    _0x50824f = "";
  };
  const _0x3b0001 = _0x2fdb1d => {
    const _0x4dbb81 = String(_0x2fdb1d?.metaSource || "").trim();
    if (!_0x5198f2 || _0x2fdb1d?.kind !== "video" || _0x2fdb1d?.needsVideoProbe !== true || !_0x4dbb81) {
      _0x5a9179();
      return;
    }
    const _0x229265 = _0x47263f.get(_0x4dbb81);
    if (_0x229265?.status === "success") {
      if (_0x229265.patch && !_0x229265.appliedNodeIds?.has(_0x2fdb1d.nodeId)) {
        _0x229265.appliedNodeIds.add(_0x2fdb1d.nodeId);
        _0x52a5ce.updateNodeData?.(_0x2fdb1d.nodeId, _0x229265.patch);
      }
      return;
    }
    if (_0x229265?.status === "pending" || _0x229265?.status === "failed" && now() - Number(_0x229265.failedAt || 0) < VIDEO_META_RETRY_DELAY_MS) {
      return;
    }
    if (_0x50824f === _0x4dbb81) {
      return;
    }
    _0x5a9179();
    _0x50824f = _0x4dbb81;
    _0x112b44 = scheduleIdleTask(async () => {
      _0x112b44 = null;
      _0x50824f = "";
      if (_0x5d7ca7) {
        return;
      }
      const _0x40fb8b = selectSelectionMediaPropertiesModel(_0x52a5ce.getStateRaw?.() || _0x52a5ce.getState?.());
      if (!_0x5198f2 || _0x40fb8b?.nodeId !== _0x2fdb1d.nodeId || _0x40fb8b?.metaSource !== _0x4dbb81 || _0x40fb8b?.needsVideoProbe !== true) {
        return;
      }
      _0x47263f.set(_0x4dbb81, {
        status: "pending"
      });
      try {
        const _0x1971e3 = await fetchVideoMeta(_0x4dbb81);
        if (_0x5d7ca7) {
          return;
        }
        if (!_0x1971e3 || _0x1971e3.success !== true) {
          throw new Error("video metadata unavailable");
        }
        const _0x41bdea = buildVideoMetaPatch(_0x1971e3, _0x4dbb81);
        _0x47263f.set(_0x4dbb81, {
          status: "success",
          patch: _0x41bdea,
          appliedNodeIds: new Set([_0x2fdb1d.nodeId])
        });
        const _0x838557 = selectSelectionMediaPropertiesModel(_0x52a5ce.getStateRaw?.() || _0x52a5ce.getState?.());
        if (_0x838557?.nodeId === _0x2fdb1d.nodeId && _0x838557?.metaSource === _0x4dbb81) {
          _0x52a5ce.updateNodeData?.(_0x2fdb1d.nodeId, _0x41bdea);
        }
      } catch {
        if (_0x5d7ca7) {
          return;
        }
        _0x47263f.set(_0x4dbb81, {
          status: "failed",
          failedAt: now()
        });
      }
    });
  };
  const _0x270a33 = () => {
    const _0x36685a = selectSelectionPropertiesDisplayModel(_0x52a5ce.getStateRaw?.() || _0x52a5ce.getState?.(), documentObject);
    renderSelectionMediaProperties(_0x295363, _0x5198f2 ? _0x36685a || _0x3da710 : null);
    _0x3b0001(_0x5198f2 ? _0x36685a || _0x3da710 : null);
  };
  const _0x2ee8cf = () => {
    if (_0x3261db || _0x5d7ca7) {
      return;
    }
    _0x3261db = true;
    const _0x48d301 = () => {
      _0x3261db = false;
      if (!_0x5d7ca7) {
        _0x270a33();
      }
    };
    if (typeof queueMicrotask === "function") {
      queueMicrotask(_0x48d301);
    } else {
      Promise.resolve().then(_0x48d301);
    }
  };
  const _0x626858 = _0x1310f4 => {
    if (isSupportedTextEditor(_0x1310f4?.target) || isSupportedTextEditor(_0x1310f4?.relatedTarget)) {
      _0x2ee8cf();
    }
  };
  const _0x2ccb20 = _0x57837c => {
    if (isSupportedTextEditor(_0x57837c?.target)) {
      _0x270a33();
    }
  };
  const _0x16e2c1 = _0x52a5ce.subscribeSelector(selectSelectionMediaPropertiesModel, _0x4dba0d => {
    _0x3da710 = _0x4dba0d;
    _0x270a33();
  });
  const _0x2b8882 = _0x17f807.subscribeSelector(_0x11341e => _0x11341e.ui?.showSelectionMediaProperties !== false, _0x262bb5 => {
    _0x5198f2 = _0x262bb5 !== false;
    _0x270a33();
  });
  const _0x1f1a81 = onLocaleChange(_0x270a33);
  documentObject?.addEventListener?.("focusin", _0x626858, true);
  documentObject?.addEventListener?.("focusout", _0x626858, true);
  documentObject?.addEventListener?.("input", _0x2ccb20, true);
  return () => {
    _0x5d7ca7 = true;
    _0x5a9179();
    _0x16e2c1?.();
    _0x2b8882?.();
    _0x1f1a81?.();
    documentObject?.removeEventListener?.("focusin", _0x626858, true);
    documentObject?.removeEventListener?.("focusout", _0x626858, true);
    documentObject?.removeEventListener?.("input", _0x2ccb20, true);
  };
}