import a1166_0x2e75c8 from "../core/stores/appStore.js";
import { t } from "../i18n/index.js";
import { buildCanvasLocalAudioFields, buildCanvasLocalImageFields, buildCanvasLocalVideoFields, assertCanvasMediaPatchLocalOnly, normalizeCanvasLocalPath, toCanvasLocalUrl } from "../services/canvasMediaLocalService.js";
import { stopPreviewNodeLoading } from "./previewMode.js";
import { buildImageGenerationResultPatch } from "../components/aigenImage/imageGenerationResultRenderer.js";
import { buildImageDisplayRatioResizePatch, GENERATION_MANUAL_DISPLAY_SIZE_FIELD } from "../components/shared/generationDisplayPolicy.js";
import { buildLocalAudioGenerationResultPatch } from "../components/audio-node/audioGenerationResultRenderer.js";
import { buildVideoGenerationResultPatch } from "../components/video-node/videoGenerationResultRenderer.js";
import { getAutoMediaSizeByShortSide } from "../services/fileService.js";
function normalizeText(_0x288424) {
  return String(_0x288424 || "").trim();
}
function previewUploadResultText(_0x495ab8, _0x19a2b9 = {}) {
  return t("previewUploadResult." + _0x495ab8, _0x19a2b9);
}
function resolveRequiredLocalUrl(_0x4ea50a = {}, _0xb06f58 = previewUploadResultText("kind.media")) {
  const _0x471f97 = normalizeCanvasLocalPath(_0x4ea50a?.localPath || _0x4ea50a?.originalLocalPath || _0x4ea50a?.url || "");
  const _0x3123f6 = toCanvasLocalUrl(_0x471f97);
  if (!_0x3123f6) {
    throw new Error(previewUploadResultText("missingLocalPath", {
      kind: _0xb06f58
    }));
  }
  return {
    localPath: _0x471f97,
    localUrl: _0x3123f6
  };
}
function resolveFileName(_0x39c885 = {}, _0x36b7c7 = "") {
  return normalizeText(_0x39c885?.filename) || normalizeText(_0x39c885?.fileName) || normalizeText(_0x36b7c7);
}
function buildCommonSuccessPatch(_0x394566 = Date.now()) {
  return {
    generationStartTime: _0x394566,
    generationDuration: 0,
    rhStatusMessage: null,
    rhStatusCode: null
  };
}
function buildImageTaskResetPatch() {
  return {
    rhTaskId: "",
    rhTaskStatus: "idle",
    rhTaskStartedAt: 0,
    rhTaskRecovering: false,
    rhTaskUseOpenapiQuery: false,
    dreaminaSubmitId: "",
    dreaminaTaskStatus: "idle",
    dreaminaTaskPhase: "done",
    dreaminaTaskLabel: "",
    dreaminaTaskStartedAt: 0,
    dreaminaTaskLastCheckedAt: null,
    dreaminaTaskLastRaw: {},
    dreaminaTaskRecovering: false,
    asyncTaskProvider: "",
    asyncTaskKind: "image",
    asyncTaskId: "",
    asyncTaskStatus: "idle",
    asyncTaskStartedAt: 0,
    asyncTaskRecovering: false
  };
}
function normalizeImageNaturalSize(..._0x451a45) {
  for (const _0x15d5fe of _0x451a45) {
    const _0x1e761f = Math.round(Number(_0x15d5fe?.originalWidth ?? _0x15d5fe?.naturalWidth ?? _0x15d5fe?.imageWidth ?? _0x15d5fe?.width) || 0);
    const _0x37c433 = Math.round(Number(_0x15d5fe?.originalHeight ?? _0x15d5fe?.naturalHeight ?? _0x15d5fe?.imageHeight ?? _0x15d5fe?.height) || 0);
    if (_0x1e761f > 0 && _0x37c433 > 0) {
      return {
        width: _0x1e761f,
        height: _0x37c433
      };
    }
  }
  return null;
}
function buildImageNaturalSizeFields(_0x468d78) {
  if (!_0x468d78) {
    return {};
  }
  return {
    width: _0x468d78.width,
    height: _0x468d78.height,
    imageWidth: _0x468d78.width,
    imageHeight: _0x468d78.height,
    originalWidth: _0x468d78.width,
    originalHeight: _0x468d78.height,
    naturalWidth: _0x468d78.width,
    naturalHeight: _0x468d78.height
  };
}
function buildClearedImageNaturalSizeFields() {
  return {
    imageWidth: null,
    imageHeight: null,
    originalWidth: null,
    originalHeight: null,
    naturalWidth: null,
    naturalHeight: null,
    imgWidth: null,
    imgHeight: null,
    mediaWidth: null,
    mediaHeight: null
  };
}
function buildImageUploadMediaPatch(_0x5ed9ba, _0x40e9a6, _0x1882bc) {
  const _0x8330e0 = a1166_0x2e75c8.getState?.()?.nodes?.[_0x5ed9ba];
  const _0x539efc = String(_0x8330e0?.type || "");
  const _0x554603 = _0x539efc === "source-image";
  const _0x47043d = _0x539efc === "ai-image";
  const _0x1102e1 = normalizeImageNaturalSize(_0x1882bc, _0x40e9a6);
  if (!_0x1102e1) {
    return {
      imageItemPatch: {},
      nodePatch: {
        ...buildClearedImageNaturalSizeFields(),
        ...(_0x554603 ? {
          needsAutoResize: true
        } : {})
      }
    };
  }
  const _0x58241c = getAutoMediaSizeByShortSide(_0x1102e1.width, _0x1102e1.height);
  const _0x51cd12 = buildImageNaturalSizeFields(_0x1102e1);
  const _0x158c8b = {
    ..._0x51cd12
  };
  delete _0x158c8b.width;
  delete _0x158c8b.height;
  const _0x1ce814 = _0x47043d ? buildImageDisplayRatioResizePatch({
    nodeData: _0x8330e0,
    ratioValue: _0x1102e1.width + ":" + _0x1102e1.height
  }) : {};
  return {
    imageItemPatch: _0x51cd12,
    nodePatch: _0x554603 ? {
      ..._0x51cd12,
      width: _0x58241c.width,
      height: _0x58241c.height,
      needsAutoResize: false
    } : {
      ..._0x158c8b,
      ...(_0x47043d ? {
        [GENERATION_MANUAL_DISPLAY_SIZE_FIELD]: false,
        ..._0x1ce814
      } : {})
    }
  };
}
function buildVideoTaskResetPatch() {
  return {
    rhTaskId: "",
    rhTaskStatus: "idle",
    rhTaskStartedAt: 0,
    rhTaskRecovering: false,
    rhTaskUseOpenapiQuery: false,
    asyncTaskProvider: "",
    asyncTaskKind: "video",
    asyncTaskId: "",
    asyncTaskStatus: "idle",
    asyncTaskStartedAt: 0,
    asyncTaskRecovering: false,
    dreaminaSubmitId: "",
    dreaminaTaskStatus: "idle",
    dreaminaTaskPhase: "done",
    dreaminaTaskLabel: "",
    dreaminaTaskStartedAt: 0,
    dreaminaTaskLastCheckedAt: null,
    dreaminaTaskLastRaw: {},
    dreaminaTaskRecovering: false
  };
}
function buildAudioTaskResetPatch() {
  return {
    rhTaskId: "",
    rhTaskStatus: "idle",
    rhTaskStartedAt: 0,
    rhTaskRecovering: false,
    rhTaskUseOpenapiQuery: false
  };
}
export function applyUploadedPreviewImageResult({
  nodeId: _0xe97602,
  uploadRes: _0x305c1e,
  fileName = "",
  mediaNaturalSize = null
} = {}) {
  const _0x4ec232 = normalizeText(_0xe97602);
  if (!_0x4ec232) {
    throw new Error(previewUploadResultText("missingNodeId"));
  }
  resolveRequiredLocalUrl(_0x305c1e, previewUploadResultText("kind.image"));
  const _0x45d6f7 = Date.now();
  const _0xc743b4 = resolveFileName(_0x305c1e, fileName);
  const _0x1867fc = buildImageUploadMediaPatch(_0x4ec232, _0x305c1e, mediaNaturalSize);
  const _0x153ceb = {
    ...buildCanvasLocalImageFields({
      ..._0x305c1e,
      fileName: _0xc743b4
    }, {
      includeSrc: false
    }),
    ..._0x1867fc.imageItemPatch
  };
  assertCanvasMediaPatchLocalOnly(_0x153ceb);
  stopPreviewNodeLoading(_0x4ec232);
  const _0x2fdbab = {
    ...buildImageGenerationResultPatch({
      outputType: "image",
      items: [_0x153ceb]
    }, {
      duration: 0
    }),
    fileName: _0xc743b4,
    ..._0x1867fc.nodePatch,
    ...buildCommonSuccessPatch(_0x45d6f7),
    ...buildImageTaskResetPatch()
  };
  assertCanvasMediaPatchLocalOnly(_0x2fdbab);
  a1166_0x2e75c8.updateNodeData(_0x4ec232, _0x2fdbab);
}
export function applyUploadedPreviewVideoResult({
  nodeId: _0xa5a48e,
  uploadRes: _0x13447a,
  fileName = ""
} = {}) {
  const _0x478ec5 = normalizeText(_0xa5a48e);
  if (!_0x478ec5) {
    throw new Error(previewUploadResultText("missingNodeId"));
  }
  resolveRequiredLocalUrl(_0x13447a, previewUploadResultText("kind.video"));
  const _0x251bbc = Date.now();
  const _0x2a3aed = resolveFileName(_0x13447a, fileName);
  const _0x14cc28 = buildCanvasLocalVideoFields({
    ..._0x13447a,
    fileName: _0x2a3aed
  }, {
    includeCanonicalUrl: false,
    includeResultUrl: false
  });
  assertCanvasMediaPatchLocalOnly(_0x14cc28);
  stopPreviewNodeLoading(_0x478ec5);
  const _0x2d1bb3 = {
    ...buildVideoGenerationResultPatch({
      outputType: "video",
      items: [_0x14cc28]
    }, {
      duration: 0
    }),
    thumbId: _0x14cc28.thumbId,
    fileName: _0x2a3aed,
    videoMetaSrc: "",
    videoFps: null,
    videoFrameCount: null,
    videoDuration: null,
    videoWidth: null,
    videoHeight: null,
    ...buildCommonSuccessPatch(_0x251bbc),
    ...buildVideoTaskResetPatch()
  };
  assertCanvasMediaPatchLocalOnly(_0x2d1bb3);
  a1166_0x2e75c8.updateNodeData(_0x478ec5, _0x2d1bb3);
}
export function applyUploadedPreviewAudioResult({
  nodeId: _0x40716a,
  uploadRes: _0x4b4435,
  fileName = ""
} = {}) {
  const _0x113cd1 = normalizeText(_0x40716a);
  if (!_0x113cd1) {
    throw new Error(previewUploadResultText("missingNodeId"));
  }
  resolveRequiredLocalUrl(_0x4b4435, previewUploadResultText("kind.audio"));
  const _0x38bbef = Date.now();
  const _0x422b52 = resolveFileName(_0x4b4435, fileName);
  const _0xcfbdc4 = {
    ...buildLocalAudioGenerationResultPatch(buildCanvasLocalAudioFields({
      ..._0x4b4435,
      fileName: _0x422b52
    }, {
      includeCanonicalUrl: false,
      includeResultUrl: false
    }), {
      duration: 0
    }),
    fileName: _0x422b52,
    ...buildCommonSuccessPatch(_0x38bbef),
    ...buildAudioTaskResetPatch()
  };
  assertCanvasMediaPatchLocalOnly(_0xcfbdc4);
  stopPreviewNodeLoading(_0x113cd1);
  a1166_0x2e75c8.updateNodeData(_0x113cd1, _0xcfbdc4);
}