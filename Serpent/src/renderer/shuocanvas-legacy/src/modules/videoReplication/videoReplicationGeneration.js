import { generateVideo } from "../../../api/aiVideoApi.js";
import { submitTask as a1454_0x42d5d6 } from "../../core/generationTaskRuntime.js";
import { createGenerationSubmitPlan } from "../../core/generationExecutionPlan.js";
import { getTaskMessage, resolveGenerationUiState } from "../../core/generationTaskUiState.js";
import { buildVideoGenerationResultPatch, normalizeVideoGenerationResult } from "../../components/video-node/videoGenerationResultRenderer.js";
import { resolveModelExecution, sanitizeModelUiSchemaParams } from "../../manifests/index.js";
import { localPathToUrl } from "../../utils/localMediaPath.js";
import { getGenerationMediaItemSize } from "../generationRatioSource.js";
import { applyVideoAdaptiveAspectRatio } from "../videoAspectRatioExecution.js";
export const VIDEO_REPLICATION_DEFAULT_VIDEO_MODEL_ID = "apimart/doubao-seedance-2.0";
export const VIDEO_REPLICATION_MAX_GENERATION_DURATION_SECONDS = 15;
export const VIDEO_REPLICATION_MAX_SOURCE_CLIP_DURATION_SECONDS = 15.09;
export const VIDEO_REPLICATION_MAX_CHARACTER_IMAGES = 9;
function asObject(_0x7dbc99) {
  if (_0x7dbc99 && typeof _0x7dbc99 === "object" && !Array.isArray(_0x7dbc99)) {
    return _0x7dbc99;
  } else {
    return {};
  }
}
function normalizeText(_0x41ee5a) {
  return String(_0x41ee5a ?? "").trim();
}
function normalizeMediaUrl(_0xf4702f) {
  const _0x3f5b94 = normalizeText(typeof _0xf4702f === "string" ? _0xf4702f : _0xf4702f?.imageRef || _0xf4702f?.videoRef || _0xf4702f?.url || _0xf4702f?.localPath);
  return localPathToUrl(_0x3f5b94) || _0x3f5b94;
}
function appendVideoResults(_0x511dcc = [], _0x4dcab1 = []) {
  const _0x34ca92 = Array.isArray(_0x511dcc) ? _0x511dcc.map(_0x397e75 => ({
    ..._0x397e75
  })) : [];
  const _0x1b7883 = new Set(_0x34ca92.map(_0x24c725 => normalizeText(_0x24c725?.localPath || _0x24c725?.videoUrl || _0x24c725?.url)).filter(Boolean));
  for (const _0x336a3e of _0x4dcab1) {
    const _0x4c6b0d = normalizeText(_0x336a3e?.localPath || _0x336a3e?.videoUrl || _0x336a3e?.url);
    if (_0x4c6b0d && _0x1b7883.has(_0x4c6b0d)) {
      continue;
    }
    _0x34ca92.push({
      ..._0x336a3e
    });
    if (_0x4c6b0d) {
      _0x1b7883.add(_0x4c6b0d);
    }
  }
  return _0x34ca92;
}
function mapRuntimeStatus(_0x3f3089) {
  const _0x32852f = resolveGenerationUiState(_0x3f3089);
  if (_0x32852f === "error") {
    return "failed";
  }
  if (_0x32852f === "submitting" || _0x32852f === "recovering") {
    return "running";
  }
  return _0x32852f;
}
function isAsyncVideoExecution(_0x2b4bda, _0x13dc4e) {
  return _0x13dc4e?.adapterType === "modelApi" && (_0x2b4bda?.async === true || Boolean(_0x13dc4e?.extensions?.taskPolling));
}
export function buildVideoReplicationVideoPayload({
  clip = {},
  characterImages = [],
  settings = {}
} = {}) {
  const _0x50646c = normalizeText(settings.videoModelId) || VIDEO_REPLICATION_DEFAULT_VIDEO_MODEL_ID;
  const _0x31dccc = resolveModelExecution(_0x50646c);
  if (!_0x31dccc?.modelManifest || !_0x31dccc?.executionManifest) {
    throw new Error("视频模型缺少 manifest：" + _0x50646c);
  }
  const _0x3871cc = (Array.isArray(characterImages) ? characterImages : []).map(normalizeMediaUrl).filter(Boolean);
  if (!_0x3871cc.length) {
    throw new Error("请先上传至少一张人物设定图");
  }
  if (_0x3871cc.length > VIDEO_REPLICATION_MAX_CHARACTER_IMAGES) {
    throw new Error("Seedance 2.0 最多支持 " + VIDEO_REPLICATION_MAX_CHARACTER_IMAGES + " 张人物设定图");
  }
  const _0x44e6eb = normalizeMediaUrl(clip.videoRef);
  const _0x2b9737 = settings.useSourceVideoReference !== false;
  if (_0x2b9737 && !_0x44e6eb) {
    throw new Error("当前片段缺少可用的视频参考");
  }
  const _0x5e9a34 = Math.max(0, Number(clip.durationSec) || 0);
  if (_0x5e9a34 > VIDEO_REPLICATION_MAX_SOURCE_CLIP_DURATION_SECONDS) {
    throw new Error("当前 Seedance 2.0 单次生成最多 15 秒；请在新建项目时选择 15 秒切分。");
  }
  const _0x4274dd = Math.max(4, Math.min(VIDEO_REPLICATION_MAX_GENERATION_DURATION_SECONDS, Math.round(_0x5e9a34 || 5)));
  const _0xcff3d0 = sanitizeModelUiSchemaParams(_0x50646c, {
    resolution: normalizeText(settings.resolution) || "720p",
    aspectRatio: normalizeText(settings.aspectRatio) || "adaptive",
    duration: _0x4274dd
  });
  const _0x330f49 = {
    ..._0xcff3d0,
    prompt: normalizeText(clip.generationPrompt),
    model: _0x31dccc.modelManifest.modelId,
    provider: _0x31dccc.modelManifest.provider,
    generationParams: {
      ..._0xcff3d0
    },
    duration: _0x4274dd,
    resolution: _0xcff3d0.resolution || "720p",
    aspectRatio: _0xcff3d0.aspectRatio || _0xcff3d0.size || "adaptive",
    images: _0x3871cc,
    inputUrls: _0x3871cc,
    videos: _0x2b9737 ? [_0x44e6eb] : []
  };
  if (_0x2b9737) {
    _0x330f49.videoUrl = _0x44e6eb;
  }
  const _0x4a63e0 = normalizeText(settings.videoProviderProfileId);
  if (_0x4a63e0) {
    _0x330f49.providerProfileId = _0x4a63e0;
  }
  const _0x46f911 = getGenerationMediaItemSize(_0x2b9737 ? clip : characterImages[0]);
  applyVideoAdaptiveAspectRatio(_0x330f49, {
    nodeData: {
      generationParams: _0xcff3d0
    },
    modelManifest: _0x31dccc.modelManifest,
    provider: _0x31dccc.modelManifest.provider,
    model: _0x31dccc.modelManifest.modelId,
    sourceWidth: _0x46f911?.width || 0,
    sourceHeight: _0x46f911?.height || 0
  });
  return {
    payload: _0x330f49,
    modelManifest: _0x31dccc.modelManifest,
    executionManifest: _0x31dccc.executionManifest
  };
}
export function createVideoReplicationTaskStore({
  targetId: _0x50b06b,
  getClip: _0x48400c,
  updateClip: _0x18f397,
  initialTaskNode = {}
} = {}) {
  const _0x3c0927 = normalizeText(_0x50b06b);
  if (!_0x3c0927) {
    throw new Error("复刻视频任务缺少 targetId");
  }
  if (typeof _0x48400c !== "function" || typeof _0x18f397 !== "function") {
    throw new Error("复刻视频任务缺少片段状态访问器");
  }
  let _0x3e8615 = {
    id: _0x3c0927,
    type: "video-replication-clip-task",
    ...initialTaskNode
  };
  const _0x1a6239 = (_0x3a0375 = {}) => {
    _0x3e8615 = {
      ..._0x3e8615,
      ..._0x3a0375
    };
    const _0x5cbbb3 = asObject(_0x48400c());
    const _0xc114ed = asObject(_0x5cbbb3.generation);
    const _0x57f34b = asObject(_0x5cbbb3.video);
    const _0x206e51 = Array.isArray(_0x3a0375.videos) ? normalizeVideoGenerationResult({
      videos: _0x3a0375.videos
    }).items : [];
    const _0x2d9937 = appendVideoResults(_0x57f34b.results, _0x206e51);
    const _0x4b5d80 = mapRuntimeStatus(_0x3e8615);
    _0x18f397({
      ..._0x5cbbb3,
      generation: {
        ..._0xc114ed,
        status: _0x4b5d80,
        taskId: normalizeText(_0x3e8615.rhTaskId || _0x3e8615.asyncTaskId || _0x3e8615.taskId),
        provider: normalizeText(_0x3e8615.taskProvider || _0x3e8615.provider),
        providerProfileId: normalizeText(_0x3e8615.providerProfileId),
        modelId: normalizeText(_0x3e8615.taskModelId || _0x3e8615.model),
        executionId: normalizeText(_0x3e8615.taskExecutionId),
        startedAt: Number(_0x3e8615.generationStartTime || 0),
        duration: _0x3e8615.generationDuration === null || _0x3e8615.generationDuration === undefined ? null : Number(_0x3e8615.generationDuration),
        error: _0x4b5d80 === "failed" ? getTaskMessage(_0x3e8615) : ""
      },
      video: {
        ..._0x57f34b,
        results: _0x2d9937,
        activeIndex: _0x206e51.length ? Math.max(0, _0x2d9937.length - 1) : Math.max(0, Number(_0x57f34b.activeIndex) || 0)
      }
    });
  };
  return {
    getState: () => ({
      nodes: {
        [_0x3c0927]: _0x3e8615
      }
    }),
    getStateRaw: () => ({
      nodes: {
        [_0x3c0927]: _0x3e8615
      }
    }),
    updateNodeData(_0x2e3df5, _0x5ada15) {
      if (normalizeText(_0x2e3df5) !== _0x3c0927) {
        throw new Error("未知复刻视频任务：" + _0x2e3df5);
      }
      _0x1a6239(_0x5ada15);
    },
    addNode(_0x4c9df9) {
      if (normalizeText(_0x4c9df9?.id) !== _0x3c0927) {
        throw new Error("无效复刻视频任务节点：" + (_0x4c9df9?.id || ""));
      }
      _0x3e8615 = {
        ..._0x3e8615,
        ..._0x4c9df9
      };
    }
  };
}
export async function generateVideoReplicationClip({
  projectId: _0x417cde,
  episodeId: _0x39f405,
  clipId: _0x5d5841,
  settings: _0x27d170,
  characterImages: _0x4e83b2,
  getClip: _0x404ca5,
  updateClip: _0x19dd72,
  abortController = new AbortController(),
  runVideoGeneration = generateVideo,
  submitTask = a1454_0x42d5d6
} = {}) {
  const _0x4ce72a = asObject(_0x404ca5?.());
  if (!_0x4ce72a.id) {
    throw new Error("找不到待生成的复刻片段");
  }
  const _0x386182 = ["video-replication", normalizeText(_0x417cde) || "project", normalizeText(_0x39f405) || "episode", normalizeText(_0x5d5841 || _0x4ce72a.id) || "clip"].join(":");
  const _0x837a55 = buildVideoReplicationVideoPayload({
    clip: _0x4ce72a,
    characterImages: _0x4e83b2,
    settings: _0x27d170
  });
  const _0x596f6d = createVideoReplicationTaskStore({
    targetId: _0x386182,
    getClip: _0x404ca5,
    updateClip: _0x19dd72,
    initialTaskNode: {
      model: _0x837a55.modelManifest.modelId,
      provider: _0x837a55.modelManifest.provider,
      taskModelId: _0x837a55.modelManifest.modelId,
      taskProvider: _0x837a55.modelManifest.provider,
      taskExecutionId: _0x837a55.executionManifest.id,
      adapterType: _0x837a55.executionManifest.adapterType,
      providerProfileId: normalizeText(_0x837a55.payload.providerProfileId)
    }
  });
  const _0x29cbf4 = isAsyncVideoExecution(_0x837a55.modelManifest, _0x837a55.executionManifest);
  const _0x1d9f57 = createGenerationSubmitPlan({
    kind: "video",
    sourceNodeId: _0x386182,
    targetNodeId: _0x386182,
    trigger: "video-replication-studio",
    taskType: "video-replication-clip-generation",
    provider: _0x837a55.modelManifest.provider,
    adapterType: _0x837a55.executionManifest.adapterType,
    modelId: _0x837a55.modelManifest.modelId,
    executionId: _0x837a55.executionManifest.id,
    payload: _0x837a55.payload,
    cancellable: _0x837a55.modelManifest.cancellable === true,
    resumable: _0x29cbf4 || _0x837a55.executionManifest.adapterType === "workflow",
    pauseOnAbort: "afterTaskId",
    async: _0x29cbf4,
    completionFeedback: false,
    submit: (_0x372a90, _0x2e12de = {}) => runVideoGeneration(_0x372a90, {
      signal: _0x2e12de.signal,
      runningHubWorkflowQueueLease: _0x2e12de.runningHubWorkflowQueueLease,
      onTaskId: _0x2e12de.onTaskId,
      onTaskMeta: ({
        taskId: _0xf3dd79
      } = {}) => _0x2e12de.onTaskId?.(_0xf3dd79)
    }),
    resultBuilder: (_0x589db4, _0x83c40c) => buildVideoGenerationResultPatch(normalizeVideoGenerationResult(_0x589db4), {
      startedAt: _0x83c40c.startedAt,
      duration: Date.now() - _0x83c40c.startedAt
    }),
    failureBuilder: _0x568f60 => ({
      jobError: normalizeText(_0x568f60?.message) || "复刻视频生成失败"
    })
  });
  return submitTask(_0x1d9f57, {
    store: _0x596f6d,
    abortController: abortController,
    projectId: normalizeText(_0x417cde)
  });
}