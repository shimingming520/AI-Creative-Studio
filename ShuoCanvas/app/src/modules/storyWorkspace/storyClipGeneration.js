import { generateVideo, resumeAsyncVideoTask, resumeRunningHubVideoTask } from "../../../api/aiVideoApi.js";
import { cancelTask as a1354_0x59cc51, resumeTask as a1354_0x1da962, submitTask as a1354_0x190008 } from "../../core/generationTaskRuntime.js";
import { createGenerationResumePlan, createGenerationSubmitPlan } from "../../core/generationExecutionPlan.js";
import { getTaskMessage, resolveGenerationUiState } from "../../core/generationTaskUiState.js";
import { buildVideoGenerationResultPatch, normalizeVideoGenerationResult } from "../../components/video-node/videoGenerationResultRenderer.js";
import { resolveModelExecution, sanitizeModelUiSchemaParams } from "../../manifests/index.js";
import { getGenerationInputRatioMediaSize } from "../generationRatioSource.js";
import { applyVideoAdaptiveAspectRatio } from "../videoAspectRatioExecution.js";
import { getFixedInputSlotConfigFromManifest } from "../fixedInputAssetRefs.js";
const MEDIA_KINDS = Object.freeze(["image", "video", "audio"]);
const RECOVERABLE_VIDEO_TASK_STATUSES = new Set(["pending", "queued", "recovering", "running", "submitting"]);
function asObject(_0x483a5b) {
  if (_0x483a5b && typeof _0x483a5b === "object" && !Array.isArray(_0x483a5b)) {
    return _0x483a5b;
  } else {
    return {};
  }
}
function normalizeText(_0x17bd0b) {
  return String(_0x17bd0b || "").trim();
}
function resolveStoryClipVideoExecution(_0x4acdc7, _0x2d4b06 = "") {
  return resolveModelExecution(_0x4acdc7) || resolveModelExecution(_0x4acdc7, {
    providerHint: _0x2d4b06
  });
}
function resolveStoryClipTaskTargetId(_0x208d47 = {}, _0x155801 = {}) {
  return normalizeText(_0x208d47.targetId) || "story-clip:" + (normalizeText(_0x208d47.projectId) || "project") + ":" + (normalizeText(_0x208d47.episodeId) || "episode") + ":" + (normalizeText(_0x155801.id) || "clip");
}
export function getRecoverableStoryClipVideoTask(_0x1f8473 = {}) {
  const _0x2bf2b6 = asObject(_0x1f8473?.generation);
  const _0x3d685b = normalizeText(_0x2bf2b6.status).toLowerCase();
  const _0x1531b3 = normalizeText(_0x2bf2b6.taskId);
  const _0x5e02e5 = normalizeText(_0x2bf2b6.modelId || _0x1f8473?.modelId);
  if (!RECOVERABLE_VIDEO_TASK_STATUSES.has(_0x3d685b) || !_0x1531b3 || !_0x5e02e5) {
    return null;
  }
  const _0x30c834 = normalizeText(_0x2bf2b6.providerProfileId || _0x1f8473?.providerProfileId);
  return {
    status: _0x3d685b,
    taskId: _0x1531b3,
    modelId: _0x5e02e5,
    provider: normalizeText(_0x2bf2b6.provider || _0x1f8473?.provider),
    ...(_0x30c834 ? {
      providerProfileId: _0x30c834
    } : {}),
    executionId: normalizeText(_0x2bf2b6.executionId),
    startedAt: Number(_0x2bf2b6.startedAt || 0),
    ...(_0x2bf2b6.useOpenapiQuery === true ? {
      useOpenapiQuery: true
    } : {})
  };
}
async function resumeVideoGenerationTask(_0x53dddf, _0x58d001, _0x36c3a2 = {}) {
  const _0x58c4ab = resolveStoryClipVideoExecution(_0x58d001?.model, _0x58d001?.provider);
  const _0x3334f1 = _0x58c4ab?.modelManifest ? {
    ..._0x58d001,
    model: _0x58c4ab.modelManifest.modelId,
    provider: _0x58c4ab.modelManifest.provider
  } : _0x58d001;
  if (_0x58c4ab?.executionManifest?.adapterType === "workflow") {
    return resumeRunningHubVideoTask(_0x53dddf, _0x3334f1, _0x36c3a2);
  }
  return resumeAsyncVideoTask(_0x53dddf, _0x3334f1, _0x36c3a2);
}
function isAsyncStoryClipVideoExecution(_0x513a7a, _0x30ab78) {
  return _0x30ab78?.adapterType === "modelApi" && (_0x513a7a?.async === true || Boolean(_0x30ab78?.extensions?.taskPolling));
}
function normalizeInputItem(_0x5d48bf, _0x306c58, _0x2d1924) {
  const _0x38cd34 = typeof _0x5d48bf === "string" ? {
    url: _0x5d48bf
  } : asObject(_0x5d48bf);
  const _0x20ccd3 = normalizeText(_0x38cd34.url || _0x38cd34.localUrl || _0x38cd34.imageUrl || _0x38cd34.videoUrl || _0x38cd34.audioUrl || _0x38cd34.localPath);
  if (!_0x20ccd3) {
    throw new Error("片段视频的第 " + (_0x2d1924 + 1) + " 个" + _0x306c58 + "输入缺少可用地址");
  }
  return {
    ..._0x38cd34,
    kind: _0x306c58,
    url: _0x20ccd3,
    slotId: normalizeText(_0x38cd34.slotId || _0x38cd34.refSlot)
  };
}
function normalizeInputs(_0x4e15ed = {}) {
  const _0x16c2d2 = asObject(_0x4e15ed);
  return Object.fromEntries(MEDIA_KINDS.map(_0x2951d3 => {
    const _0xb80b26 = _0x2951d3 + "s";
    const _0x2fa3fc = _0x16c2d2[_0x2951d3] ?? _0x16c2d2[_0xb80b26] ?? [];
    const _0x36339a = Array.isArray(_0x2fa3fc) ? _0x2fa3fc : _0x2fa3fc ? [_0x2fa3fc] : [];
    return [_0x2951d3, _0x36339a.map((_0x333a14, _0x3ee591) => normalizeInputItem(_0x333a14, _0x2951d3, _0x3ee591))];
  }));
}
function mergePromptAssetInputRefs(_0x31011b = {}, _0x5221f1 = []) {
  const _0x1e4897 = normalizeInputs(_0x31011b);
  const _0x20cf2a = new Set(MEDIA_KINDS.flatMap(_0x555ee2 => _0x1e4897[_0x555ee2].map(_0x46018e => _0x555ee2 + ":" + normalizeText(_0x46018e.url))));
  (Array.isArray(_0x5221f1) ? _0x5221f1 : []).forEach((_0x105aaf, _0x835041) => {
    const _0x48fa89 = normalizeText(_0x105aaf?.type || _0x105aaf?.kind);
    if (!MEDIA_KINDS.includes(_0x48fa89)) {
      return;
    }
    const _0x13a8e2 = normalizeInputItem(_0x105aaf, _0x48fa89, _0x835041);
    const _0x443ee0 = _0x48fa89 + ":" + _0x13a8e2.url;
    if (_0x20cf2a.has(_0x443ee0)) {
      return;
    }
    _0x20cf2a.add(_0x443ee0);
    _0x1e4897[_0x48fa89].push({
      ..._0x13a8e2,
      slotId: normalizeText(_0x105aaf?.refSlot || _0x105aaf?.slotId)
    });
  });
  return _0x1e4897;
}
function resolveKindLimit(_0x2ffdd8, _0x5e88a5) {
  const _0x101b90 = Number(_0x2ffdd8?.maxByKind?.[_0x5e88a5]);
  if (Number.isFinite(_0x101b90)) {
    return Math.max(0, Math.trunc(_0x101b90));
  }
  const _0x3a40f6 = (_0x2ffdd8?.fixedSlots || []).filter(_0x230a72 => normalizeText(_0x230a72?.kind) === _0x5e88a5).length;
  if (_0x3a40f6 > 0) {
    return _0x3a40f6;
  } else {
    return Number.POSITIVE_INFINITY;
  }
}
function assignFixedSlots(_0x46bf9b, _0x170dfa, _0x177605, _0x4a4cf2 = {}) {
  const _0x103455 = Array.isArray(_0x170dfa?.fixedSlots) ? [..._0x170dfa.fixedSlots].sort((_0x47c054, _0x3aa815) => Number(_0x47c054?.displayOrder || 0) - Number(_0x3aa815?.displayOrder || 0)) : [];
  const _0x28e58f = _0x103455.some(_0x38c0be => _0x38c0be?.showWhen || _0x38c0be?.hideWhen);
  const _0x2da4be = _0x28e58f ? getFixedInputSlotConfigFromManifest(_0x4a4cf2, {
    manifest: _0x46bf9b
  }) : null;
  const _0x269497 = _0x28e58f ? new Set(_0x2da4be?.visibleSlots || []) : new Set(_0x103455.map(_0x2b844d => normalizeText(_0x2b844d?.id)).filter(Boolean));
  const _0x1e4199 = _0x103455.filter(_0x36e790 => _0x269497.has(normalizeText(_0x36e790?.id)));
  const _0x3620cb = new Map(_0x103455.map(_0x3226c7 => [normalizeText(_0x3226c7?.id), _0x3226c7]).filter(([_0x5dbb97]) => _0x5dbb97));
  const _0x2563e7 = new Map();
  for (const _0x5e4d59 of MEDIA_KINDS) {
    for (const _0x211bb6 of _0x177605[_0x5e4d59]) {
      if (!_0x211bb6.slotId) {
        continue;
      }
      const _0x29c965 = _0x3620cb.get(_0x211bb6.slotId);
      if (!_0x29c965) {
        throw new Error("视频模型未声明输入槽“" + _0x211bb6.slotId + "”");
      }
      if (normalizeText(_0x29c965.kind) !== _0x5e4d59) {
        throw new Error("输入槽“" + _0x211bb6.slotId + "”只接受 " + _0x29c965.kind + "，不能接收 " + _0x5e4d59);
      }
      if (_0x2563e7.has(_0x211bb6.slotId)) {
        throw new Error("输入槽“" + _0x211bb6.slotId + "”只能接入一个素材");
      }
      _0x2563e7.set(_0x211bb6.slotId, _0x211bb6);
    }
  }
  for (const _0x2db819 of MEDIA_KINDS) {
    const _0xf4cd44 = _0x1e4199.filter(_0x4f3e5c => normalizeText(_0x4f3e5c?.kind) === _0x2db819 && !_0x2563e7.has(normalizeText(_0x4f3e5c?.id)));
    for (const _0x5621ff of _0x177605[_0x2db819]) {
      if (_0x5621ff.slotId) {
        continue;
      }
      const _0x6eed02 = _0xf4cd44.shift();
      if (_0x6eed02) {
        _0x2563e7.set(normalizeText(_0x6eed02.id), _0x5621ff);
      }
    }
  }
  for (const _0xe8d689 of _0x1e4199) {
    const _0x32e9ca = normalizeText(_0xe8d689?.id);
    if (_0xe8d689?.required === true && _0x32e9ca && !_0x2563e7.has(_0x32e9ca)) {
      throw new Error("视频模型缺少必需输入：" + (normalizeText(_0xe8d689.label) || _0x32e9ca));
    }
  }
  for (const _0x75c347 of _0x170dfa?.exclusiveGroups || []) {
    const _0x1bc220 = Array.isArray(_0x75c347?.slots) ? _0x75c347.slots.map(normalizeText).filter(_0x1a8589 => _0x269497.has(_0x1a8589)) : [];
    if (_0x1bc220.length === 0) {
      continue;
    }
    const _0x3023ff = _0x1bc220.filter(_0x85381f => _0x2563e7.has(_0x85381f)).length;
    const _0x12fde6 = Number(_0x75c347?.min);
    const _0x11dc6a = Number(_0x75c347?.max);
    const _0x4a801b = normalizeText(_0x75c347?.label || _0x75c347?.id) || "互斥输入组";
    if (Number.isFinite(_0x12fde6) && _0x3023ff < _0x12fde6) {
      throw new Error(_0x4a801b + "至少需要 " + Math.max(0, Math.trunc(_0x12fde6)) + " 个输入");
    }
    if (Number.isFinite(_0x11dc6a) && _0x3023ff > _0x11dc6a) {
      throw new Error(_0x4a801b + "最多允许 " + Math.max(0, Math.trunc(_0x11dc6a)) + " 个输入");
    }
  }
  return _0x2563e7;
}
export function validateStoryClipVideoInputs(_0x50b010, _0x55de9a = {}, _0x45050f = {}) {
  const _0x52d613 = asObject(_0x50b010?.inputSlots);
  const _0x312798 = new Set((Array.isArray(_0x52d613.allowedKinds) ? _0x52d613.allowedKinds : []).map(normalizeText).filter(Boolean));
  const _0x3bc2f9 = normalizeInputs(_0x55de9a);
  for (const _0x31c2d6 of MEDIA_KINDS) {
    const _0x558d40 = _0x3bc2f9[_0x31c2d6].length;
    if (_0x558d40 > 0 && !_0x312798.has(_0x31c2d6)) {
      throw new Error("视频模型“" + (_0x50b010?.displayName || _0x50b010?.modelId) + "”不支持" + _0x31c2d6 + "输入");
    }
    const _0x4fcaf3 = resolveKindLimit(_0x52d613, _0x31c2d6);
    if (_0x558d40 > _0x4fcaf3) {
      if (_0x31c2d6 === "audio") {
        throw new Error("参考音频不能超过 " + _0x4fcaf3 + " 个，当前为 " + _0x558d40 + " 个");
      }
      throw new Error("视频模型“" + (_0x50b010?.displayName || _0x50b010?.modelId) + "”最多支持 " + _0x4fcaf3 + " 个" + _0x31c2d6 + "输入，当前为 " + _0x558d40 + " 个");
    }
    const _0x3724f = Number(_0x52d613?.minByKind?.[_0x31c2d6]);
    if (Number.isFinite(_0x3724f) && _0x558d40 < _0x3724f) {
      throw new Error("视频模型“" + (_0x50b010?.displayName || _0x50b010?.modelId) + "”至少需要 " + Math.max(0, Math.trunc(_0x3724f)) + " 个" + _0x31c2d6 + "输入");
    }
  }
  return {
    inputs: _0x3bc2f9,
    assignedSlots: assignFixedSlots(_0x50b010, _0x52d613, _0x3bc2f9, _0x45050f)
  };
}
function assignSlotPayloadFields(_0x5c14a5, _0x343c27) {
  const _0x3a26d1 = {};
  for (const [_0x2f9496, _0x48fdce] of _0x343c27.entries()) {
    _0x3a26d1[_0x2f9496] = _0x48fdce.url;
    _0x5c14a5[_0x2f9496] = _0x48fdce.url;
    if (!_0x2f9496.toLowerCase().endsWith("url")) {
      _0x5c14a5[_0x2f9496 + "Url"] = _0x48fdce.url;
    }
  }
  if (Object.keys(_0x3a26d1).length > 0) {
    _0x5c14a5.inputUrlsBySlot = _0x3a26d1;
  }
}
export function buildStoryClipVideoPayload({
  modelId: _0x16b174,
  provider = "",
  prompt = "",
  generationParams = {},
  inputs = {},
  assetInputRefs = [],
  installId = "",
  providerProfileId = ""
} = {}) {
  const _0x319436 = resolveStoryClipVideoExecution(_0x16b174, provider);
  if (!_0x319436?.modelManifest || !_0x319436?.executionManifest) {
    throw new Error("视频模型缺少 manifest 或 execution manifest：" + (normalizeText(_0x16b174) || "(empty)"));
  }
  const {
    modelManifest: _0x5b0d91,
    executionManifest: _0x2a452c
  } = _0x319436;
  if (_0x5b0d91.kind !== "video" || _0x2a452c.kind !== "video") {
    throw new Error("模型“" + _0x5b0d91.modelId + "”不是视频生成模型");
  }
  const _0x53c26a = sanitizeModelUiSchemaParams(_0x5b0d91.modelId, generationParams);
  const _0xa59cdf = validateStoryClipVideoInputs(_0x5b0d91, mergePromptAssetInputRefs(inputs, assetInputRefs), {
    generationParams: _0x53c26a
  });
  const _0x289b65 = _0xa59cdf.inputs.image.map(_0x33128c => _0x33128c.url);
  const _0x288a30 = _0xa59cdf.inputs.video.map(_0x25386a => _0x25386a.url);
  const _0x5896e1 = _0xa59cdf.inputs.audio.map(_0x7fcce2 => _0x7fcce2.url);
  const _0x23dbc0 = {
    ..._0x53c26a,
    prompt: String(prompt || ""),
    model: _0x5b0d91.modelId,
    provider: _0x5b0d91.provider,
    generationParams: {
      ..._0x53c26a
    },
    images: _0x289b65,
    videos: _0x288a30,
    audios: _0x5896e1,
    inputUrls: _0x289b65,
    inputImages: _0x289b65,
    inputVideos: _0x288a30,
    inputAudios: _0x5896e1
  };
  if (_0x289b65[0]) {
    _0x23dbc0.image = _0x289b65[0];
    _0x23dbc0.imageUrl = _0x289b65[0];
    _0x23dbc0.refImageUrl = _0x289b65[0];
  }
  if (_0x288a30[0]) {
    _0x23dbc0.videoUrl = _0x288a30[0];
  }
  if (_0x5896e1[0]) {
    _0x23dbc0.audioUrl = _0x5896e1[0];
  }
  if (normalizeText(installId)) {
    _0x23dbc0.installId = normalizeText(installId);
  }
  if (normalizeText(providerProfileId)) {
    _0x23dbc0.providerProfileId = normalizeText(providerProfileId);
  }
  assignSlotPayloadFields(_0x23dbc0, _0xa59cdf.assignedSlots);
  const _0x43f1e1 = getGenerationInputRatioMediaSize(_0xa59cdf.inputs, _0x5b0d91);
  applyVideoAdaptiveAspectRatio(_0x23dbc0, {
    nodeData: {
      generationParams: _0x53c26a
    },
    modelManifest: _0x5b0d91,
    provider: _0x5b0d91.provider,
    model: _0x5b0d91.modelId,
    sourceWidth: _0x43f1e1?.width || 0,
    sourceHeight: _0x43f1e1?.height || 0
  });
  return {
    payload: _0x23dbc0,
    modelManifest: _0x5b0d91,
    executionManifest: _0x2a452c
  };
}
function getResultKey(_0x35d9a0) {
  return normalizeText(_0x35d9a0?.localPath || _0x35d9a0?.videoUrl || _0x35d9a0?.displayLocalPath || _0x35d9a0?.thumbId || _0x35d9a0?.thumbUrl);
}
function appendVideoResults(_0x16e810 = [], _0xa327a1 = []) {
  const _0x11a110 = Array.isArray(_0x16e810) ? _0x16e810.map(_0x175e3b => ({
    ..._0x175e3b
  })) : [];
  const _0x41cca1 = new Set(_0x11a110.map(getResultKey).filter(Boolean));
  for (const _0x31c3c4 of _0xa327a1) {
    const _0x1b7fa2 = getResultKey(_0x31c3c4);
    if (_0x1b7fa2 && _0x41cca1.has(_0x1b7fa2)) {
      continue;
    }
    _0x11a110.push({
      ..._0x31c3c4
    });
    if (_0x1b7fa2) {
      _0x41cca1.add(_0x1b7fa2);
    }
  }
  return _0x11a110;
}
function mapRuntimeStatus(_0x48b526) {
  const _0x445bd4 = resolveGenerationUiState(_0x48b526);
  if (_0x445bd4 === "error") {
    return "failed";
  }
  if (_0x445bd4 === "submitting" || _0x445bd4 === "recovering") {
    return "running";
  }
  return _0x445bd4;
}
function isShallowRecordEqual(_0x530bc2 = {}, _0x72b27d = {}) {
  const _0x2b374b = Object.keys(_0x530bc2);
  const _0x4df947 = Object.keys(_0x72b27d);
  return _0x2b374b.length === _0x4df947.length && _0x2b374b.every(_0x5b248d => Object.is(_0x530bc2[_0x5b248d], _0x72b27d[_0x5b248d]));
}
export function createStoryClipTaskStoreAdapter({
  targetId: _0x4ade68,
  getClip: _0x813ea6,
  updateClip: _0x383625,
  initialTaskNode = {}
} = {}) {
  const _0x4a529a = normalizeText(_0x4ade68);
  if (!_0x4a529a) {
    throw new Error("story clip task store requires targetId");
  }
  if (typeof _0x813ea6 !== "function" || typeof _0x383625 !== "function") {
    throw new Error("story clip task store requires getClip() and updateClip()");
  }
  let _0x584e94 = {
    id: _0x4a529a,
    type: "story-clip-video-task",
    ...initialTaskNode
  };
  const _0x142875 = (_0x2c6e70 = {}) => {
    _0x584e94 = {
      ..._0x584e94,
      ..._0x2c6e70
    };
    const _0x22bd17 = asObject(_0x813ea6());
    const _0x2c49e9 = asObject(_0x22bd17.generation);
    const _0x24d340 = asObject(_0x22bd17.video);
    const _0xb71c1a = Array.isArray(_0x2c6e70.videos) ? normalizeVideoGenerationResult({
      videos: _0x2c6e70.videos
    }).items : [];
    const _0x10f824 = _0xb71c1a.length > 0 ? appendVideoResults(_0x24d340.results, _0xb71c1a) : Array.isArray(_0x24d340.results) ? _0x24d340.results : [];
    const _0x396cd8 = _0xb71c1a.length > 0 ? Math.max(0, _0x10f824.length - 1) : Number(_0x24d340.activeIndex || 0);
    const _0x2e86bb = {
      ..._0x2c49e9,
      status: mapRuntimeStatus(_0x584e94),
      taskId: normalizeText(_0x584e94.rhTaskId || _0x584e94.asyncTaskId || _0x584e94.taskId),
      provider: normalizeText(_0x584e94.taskProvider || _0x584e94.provider),
      providerProfileId: normalizeText(_0x584e94.providerProfileId),
      modelId: normalizeText(_0x584e94.taskModelId || _0x584e94.model),
      executionId: normalizeText(_0x584e94.taskExecutionId),
      useOpenapiQuery: _0x584e94.rhTaskUseOpenapiQuery === true,
      startedAt: Number(_0x584e94.generationStartTime || 0),
      duration: _0x584e94.generationDuration === null || _0x584e94.generationDuration === undefined ? null : Number(_0x584e94.generationDuration),
      error: mapRuntimeStatus(_0x584e94) === "failed" ? getTaskMessage(_0x584e94) : ""
    };
    const _0x46c734 = {
      ..._0x24d340,
      results: _0x10f824,
      activeIndex: _0x396cd8
    };
    if (isShallowRecordEqual(_0x2c49e9, _0x2e86bb) && isShallowRecordEqual(_0x24d340, _0x46c734)) {
      return false;
    }
    _0x383625({
      ..._0x22bd17,
      generation: _0x2e86bb,
      video: _0x46c734
    });
    return true;
  };
  return {
    getState: () => ({
      nodes: {
        [_0x4a529a]: _0x584e94
      }
    }),
    getStateRaw: () => ({
      nodes: {
        [_0x4a529a]: _0x584e94
      }
    }),
    updateNodeData(_0x3c47fa, _0x4ae064) {
      if (normalizeText(_0x3c47fa) !== _0x4a529a) {
        throw new Error("unknown story clip task target: " + _0x3c47fa);
      }
      _0x142875(_0x4ae064);
    },
    addNode(_0x39f746) {
      if (normalizeText(_0x39f746?.id) !== _0x4a529a) {
        throw new Error("invalid story clip task node: " + (_0x39f746?.id || ""));
      }
      _0x584e94 = {
        ..._0x584e94,
        ..._0x39f746
      };
    }
  };
}
export function createStoryClipGenerationController({
  getClip: _0x50400c,
  updateClip: _0x34cbd7,
  submitTask = a1354_0x190008,
  resumeTask = a1354_0x1da962,
  cancelTask = a1354_0x59cc51,
  runVideoGeneration = generateVideo,
  resumeVideoGeneration = resumeVideoGenerationTask
} = {}) {
  if (typeof _0x50400c !== "function" || typeof _0x34cbd7 !== "function") {
    throw new Error("story clip generation requires getClip() and updateClip()");
  }
  let _0x423c0b = null;
  async function _0x4b2157(_0x93fb9e = {}) {
    if (_0x423c0b) {
      throw new Error("当前片段已有视频生成任务正在运行");
    }
    const _0x524649 = asObject(_0x50400c());
    const _0x47f81b = resolveStoryClipTaskTargetId(_0x93fb9e, _0x524649);
    const _0x180424 = buildStoryClipVideoPayload({
      ..._0x93fb9e,
      prompt: _0x93fb9e.prompt ?? _0x524649.prompt
    });
    const _0x180bfb = createStoryClipTaskStoreAdapter({
      targetId: _0x47f81b,
      getClip: _0x50400c,
      updateClip: _0x34cbd7,
      initialTaskNode: {
        model: _0x180424.modelManifest.modelId,
        provider: _0x180424.modelManifest.provider,
        taskModelId: _0x180424.modelManifest.modelId,
        taskProvider: _0x180424.modelManifest.provider,
        taskExecutionId: _0x180424.executionManifest.id,
        adapterType: _0x180424.executionManifest.adapterType,
        providerProfileId: normalizeText(_0x180424.payload.providerProfileId)
      }
    });
    const _0x384ef9 = new AbortController();
    _0x423c0b = {
      targetId: _0x47f81b,
      store: _0x180bfb,
      abortController: _0x384ef9,
      modelManifest: _0x180424.modelManifest
    };
    const _0xf23440 = isAsyncStoryClipVideoExecution(_0x180424.modelManifest, _0x180424.executionManifest);
    let _0xd2ea46 = false;
    const _0x21aab8 = createGenerationSubmitPlan({
      kind: "video",
      sourceNodeId: _0x47f81b,
      targetNodeId: _0x47f81b,
      trigger: "story-workspace",
      taskType: "story-clip-video-generation",
      provider: _0x180424.modelManifest.provider,
      adapterType: _0x180424.executionManifest.adapterType,
      modelId: _0x180424.modelManifest.modelId,
      executionId: _0x180424.executionManifest.id,
      payload: _0x180424.payload,
      cancellable: _0x180424.modelManifest.cancellable === true,
      resumable: _0xf23440 || _0x180424.executionManifest.adapterType === "workflow",
      pauseOnAbort: "afterTaskId",
      async: _0xf23440,
      submit: (_0x3f1847, _0x35c9cc = {}) => runVideoGeneration(_0x3f1847, {
        signal: _0x35c9cc.signal,
        runningHubWorkflowQueueLease: _0x35c9cc.runningHubWorkflowQueueLease,
        onRunningHubWorkflowQueueChange: _0x35c9cc.onRunningHubWorkflowQueueChange,
        onTaskId: _0x6ebcfe => {
          _0x35c9cc.onTaskId?.(_0x6ebcfe);
          if (_0xd2ea46) {
            _0x35c9cc.updateTaskNode?.({
              rhTaskUseOpenapiQuery: true
            });
          }
        },
        onTaskMeta: ({
          taskId: _0x363ed4,
          useOpenapiQuery: _0x132465
        } = {}) => {
          _0xd2ea46 = _0x132465 === true;
          _0x35c9cc.onTaskId?.(_0x363ed4);
          _0x35c9cc.updateTaskNode?.({
            rhTaskUseOpenapiQuery: _0xd2ea46
          });
        }
      }),
      resultBuilder: (_0x1ce62f, _0x1e165c) => buildVideoGenerationResultPatch(normalizeVideoGenerationResult(_0x1ce62f), {
        startedAt: _0x1e165c.startedAt,
        duration: Date.now() - _0x1e165c.startedAt
      }),
      failureBuilder: _0x504c5d => ({
        jobError: normalizeText(_0x504c5d?.message) || "视频生成失败"
      })
    });
    try {
      const _0x5ce2c8 = await submitTask(_0x21aab8, {
        store: _0x180bfb,
        abortController: _0x384ef9
      });
      if (_0x5ce2c8?.status !== "pending" && _0x423c0b?.targetId === _0x47f81b) {
        _0x423c0b = null;
      }
      return _0x5ce2c8;
    } catch (_0x3f4994) {
      if (_0x423c0b?.targetId === _0x47f81b) {
        _0x423c0b = null;
      }
      throw _0x3f4994;
    }
  }
  async function _0x887907(_0x522dfb = {}) {
    if (_0x423c0b) {
      throw new Error("当前片段已有视频生成任务正在运行");
    }
    const _0x3bb49e = asObject(_0x50400c());
    const _0x4b871b = {
      ...(getRecoverableStoryClipVideoTask(_0x3bb49e) || {}),
      ...(_0x522dfb.taskId ? {
        taskId: normalizeText(_0x522dfb.taskId)
      } : {}),
      ...(_0x522dfb.modelId ? {
        modelId: normalizeText(_0x522dfb.modelId)
      } : {}),
      ...(_0x522dfb.provider ? {
        provider: normalizeText(_0x522dfb.provider)
      } : {}),
      ...(_0x522dfb.providerProfileId ? {
        providerProfileId: normalizeText(_0x522dfb.providerProfileId)
      } : {}),
      ...(_0x522dfb.executionId ? {
        executionId: normalizeText(_0x522dfb.executionId)
      } : {}),
      ...(_0x522dfb.startedAt ? {
        startedAt: Number(_0x522dfb.startedAt)
      } : {}),
      ...(_0x522dfb.useOpenapiQuery === true ? {
        useOpenapiQuery: true
      } : {})
    };
    if (!_0x4b871b.taskId) {
      throw new Error("片段视频任务缺少 taskId，无法恢复轮询");
    }
    if (!_0x4b871b.modelId) {
      throw new Error("片段视频任务缺少 modelId，无法恢复轮询");
    }
    const _0x25ef4e = resolveStoryClipVideoExecution(_0x4b871b.modelId, _0x4b871b.provider);
    if (!_0x25ef4e?.modelManifest || !_0x25ef4e?.executionManifest) {
      throw new Error("视频模型缺少 manifest 或 execution manifest：" + _0x4b871b.modelId);
    }
    const {
      modelManifest: _0x350d70,
      executionManifest: _0x4c7591
    } = _0x25ef4e;
    if (_0x350d70.kind !== "video" || _0x4c7591.kind !== "video") {
      throw new Error("模型“" + _0x350d70.modelId + "”不是视频生成模型");
    }
    const _0x5704ca = isAsyncStoryClipVideoExecution(_0x350d70, _0x4c7591);
    const _0x51bbaf = _0x4c7591.adapterType === "workflow";
    if (!_0x5704ca && !_0x51bbaf) {
      throw new Error("视频模型“" + _0x350d70.modelId + "”不支持恢复异步任务");
    }
    const _0x3bd1f3 = resolveStoryClipTaskTargetId(_0x522dfb, _0x3bb49e);
    const _0x4348d4 = Number(_0x4b871b.startedAt || Date.now());
    const _0x2c66d0 = {
      model: _0x350d70.modelId,
      provider: _0x350d70.provider,
      ...(_0x4b871b.providerProfileId ? {
        providerProfileId: _0x4b871b.providerProfileId
      } : {})
    };
    const _0x28d06a = createStoryClipTaskStoreAdapter({
      targetId: _0x3bd1f3,
      getClip: _0x50400c,
      updateClip: _0x34cbd7,
      initialTaskNode: {
        model: _0x350d70.modelId,
        provider: _0x350d70.provider,
        taskModelId: _0x350d70.modelId,
        taskProvider: _0x350d70.provider,
        taskExecutionId: _0x4c7591.id,
        adapterType: _0x4c7591.adapterType,
        providerProfileId: _0x4b871b.providerProfileId,
        generationStartTime: _0x4348d4,
        asyncTaskId: _0x4b871b.taskId,
        asyncTaskStatus: "running",
        asyncTaskStartedAt: _0x4348d4,
        asyncTaskProvider: _0x350d70.provider,
        asyncTaskKind: "video",
        taskResumable: true,
        rhTaskUseOpenapiQuery: _0x4b871b.useOpenapiQuery === true
      }
    });
    const _0x3aca09 = new AbortController();
    _0x423c0b = {
      targetId: _0x3bd1f3,
      store: _0x28d06a,
      abortController: _0x3aca09,
      modelManifest: _0x350d70
    };
    const _0x127719 = createGenerationResumePlan({
      kind: "video",
      sourceNodeId: _0x3bd1f3,
      targetNodeId: _0x3bd1f3,
      trigger: "story-workspace-recovery",
      taskType: "story-clip-video-generation",
      provider: _0x350d70.provider,
      adapterType: _0x4c7591.adapterType,
      modelId: _0x350d70.modelId,
      executionId: _0x4c7591.id,
      payload: _0x2c66d0,
      taskId: _0x4b871b.taskId,
      startedAt: _0x4348d4,
      cancellable: _0x350d70.cancellable === true,
      resumable: true,
      pauseOnAbort: true,
      async: _0x5704ca,
      poll: ({
        taskId: _0x36d5f6,
        payload: _0x57a59d,
        signal: _0xf6d81
      }) => resumeVideoGeneration(_0x36d5f6, _0x57a59d, {
        signal: _0xf6d81,
        useOpenapiQuery: _0x4b871b.useOpenapiQuery === true
      }),
      resultBuilder: (_0x5c5233, _0x2e5d3b) => buildVideoGenerationResultPatch(normalizeVideoGenerationResult(_0x5c5233), {
        startedAt: _0x2e5d3b.startedAt,
        duration: Date.now() - _0x2e5d3b.startedAt
      }),
      failureBuilder: _0x1d4092 => ({
        jobError: normalizeText(_0x1d4092?.message) || "视频任务恢复失败"
      })
    });
    try {
      const _0x3e1b28 = await resumeTask(_0x127719, {
        store: _0x28d06a,
        abortController: _0x3aca09,
        startedAt: _0x4348d4
      });
      if (_0x3e1b28?.status !== "pending" && _0x423c0b?.targetId === _0x3bd1f3) {
        _0x423c0b = null;
      }
      return _0x3e1b28;
    } catch (_0x37fd48) {
      if (_0x423c0b?.targetId === _0x3bd1f3) {
        _0x423c0b = null;
      }
      throw _0x37fd48;
    }
  }
  async function _0x1314f2() {
    if (!_0x423c0b) {
      return {
        ok: false,
        reason: "missing-target"
      };
    }
    const _0x34c592 = _0x423c0b;
    const _0x39bb4b = await cancelTask(_0x34c592.targetId, {
      store: _0x34c592.store,
      cancellable: _0x34c592.modelManifest?.cancellable === true,
      abortLocal: true
    });
    if (_0x39bb4b?.ok && _0x423c0b?.targetId === _0x34c592.targetId) {
      _0x423c0b = null;
    }
    return _0x39bb4b;
  }
  function _0x1d466a() {
    if (!_0x423c0b) {
      return {
        ok: false,
        reason: "missing-target"
      };
    }
    const _0x4505ac = _0x423c0b.targetId;
    _0x423c0b.abortController.abort();
    return {
      ok: true,
      status: "pausing",
      targetId: _0x4505ac
    };
  }
  return {
    generate: _0x4b2157,
    resume: _0x887907,
    cancel: _0x1314f2,
    pause: _0x1d466a,
    getActiveTargetId: () => _0x423c0b?.targetId || ""
  };
}