import { buildStoryBackgroundTaskId, finishStoryBackgroundTask, getStoryBackgroundTasks, getStoryBackgroundTaskSummary, interruptStoryBackgroundTasks, startStoryBackgroundTask } from "./storyBackgroundTasks.js";
import { getRecoverableStoryClipVideoTask } from "./storyClipGeneration.js";
import { settleInterruptedStoryVideoReplication } from "./storyVideoReplication.js";
function normalizeText(_0x1dc8a5) {
  return String(_0x1dc8a5 || "").trim();
}
export function getStoryAssetAppearanceGenerationKey(_0x4cfb67, _0x32f685) {
  const _0x323c8e = normalizeText(_0x4cfb67);
  const _0x5926bc = normalizeText(_0x32f685);
  if (!_0x323c8e || !_0x5926bc) {
    return "";
  }
  return _0x323c8e + ":" + _0x5926bc;
}
function normalizeStoryTaskBatchIds(_0x35f2f0) {
  return [...new Set((Array.isArray(_0x35f2f0) ? _0x35f2f0 : []).map(_0x167a78 => normalizeText(_0x167a78)).filter(Boolean))];
}
const STORY_ACTIVE_CLIP_VIDEO_STATUSES = new Set(["pending", "queued", "recovering", "running", "submitting"]);
function getStoryBackgroundTaskClip(_0x3087c4 = {}, _0x594736 = {}) {
  const _0x4e3b2a = normalizeText(_0x594736?.scope?.episodeId);
  const _0x4fe82d = normalizeText(_0x594736?.scope?.clipId);
  if (!_0x4fe82d) {
    return null;
  }
  const _0xebfffb = Array.isArray(_0x3087c4?.episodes) ? _0x3087c4.episodes : [];
  const _0x1310db = _0x4e3b2a ? _0xebfffb.find(_0x50e7d0 => normalizeText(_0x50e7d0?.id) === _0x4e3b2a) : null;
  const _0x13e1db = _0x1310db ? Array.isArray(_0x1310db.clips) ? _0x1310db.clips : [] : _0xebfffb.flatMap(_0xd61c06 => Array.isArray(_0xd61c06?.clips) ? _0xd61c06.clips : []);
  return _0x13e1db.find(_0x22baa => normalizeText(_0x22baa?.id) === _0x4fe82d) || null;
}
function isStoryClipVideoBackgroundTaskCurrent(_0x271749 = {}, _0x291ae5 = {}) {
  const _0x43ef45 = getStoryBackgroundTaskClip(_0x271749, _0x291ae5);
  if (!_0x43ef45) {
    return true;
  }
  return STORY_ACTIVE_CLIP_VIDEO_STATUSES.has(normalizeText(_0x43ef45?.generation?.status).toLowerCase());
}
export function reconcileStoryClipVideoBackgroundTasks(_0x213fa7 = {}) {
  let _0x3c0127 = 0;
  const _0x54aa35 = getStoryBackgroundTaskSummary(_0x213fa7).activeTasks;
  for (const _0xd4016e of _0x54aa35) {
    if (_0xd4016e.type !== "clip-video") {
      continue;
    }
    const _0x36f37c = getStoryBackgroundTaskClip(_0x213fa7, _0xd4016e);
    const _0x4217e2 = normalizeText(_0x36f37c?.generation?.status).toLowerCase();
    if (_0x36f37c && STORY_ACTIVE_CLIP_VIDEO_STATUSES.has(_0x4217e2)) {
      continue;
    }
    const _0x3e974e = ["success", "succeeded", "completed", "done"].includes(_0x4217e2) ? {
      status: "succeeded",
      message: "片段视频生成完成"
    } : ["failed", "error"].includes(_0x4217e2) ? {
      status: "failed",
      message: "片段视频生成失败",
      error: normalizeText(_0x36f37c?.generation?.error) || "片段视频生成失败。"
    } : ["cancelled", "canceled"].includes(_0x4217e2) ? {
      status: "cancelled",
      message: "片段视频任务已取消"
    } : {
      status: "interrupted",
      message: "片段视频任务状态已失效"
    };
    if (finishStoryBackgroundTask(_0x213fa7, _0xd4016e.id, _0x3e974e)) {
      _0x3c0127 += 1;
    }
  }
  return _0x3c0127;
}
export function reconcilePersistedStoryProjectTasks(_0x785346 = {}) {
  if (!_0x785346?.project) {
    return false;
  }
  let _0x57ff0d = interruptStoryBackgroundTasks(_0x785346, {
    message: "应用上次关闭时任务尚未完成，请重新发起不可恢复的任务。"
  });
  _0x57ff0d += reconcileStoryClipVideoBackgroundTasks(_0x785346);
  _0x57ff0d += settleInterruptedStoryVideoReplication(_0x785346);
  const _0x4f6b9a = new Set(getStoryBackgroundTaskSummary(_0x785346).activeTasks.map(_0x3f0256 => _0x3f0256.type));
  if (_0x785346.project.summaryStatus === "generating" && !_0x4f6b9a.has("story-summary")) {
    _0x785346.project.summaryStatus = normalizeText(_0x785346.project.summary) ? "completed" : "error";
    _0x57ff0d += 1;
  }
  if (_0x785346.project.outlineStatus === "generating" && !_0x4f6b9a.has("episode-planning")) {
    _0x785346.project.outlineStatus = Array.isArray(_0x785346.episodes) && _0x785346.episodes.length ? "completed" : "error";
    _0x57ff0d += 1;
  }
  for (const _0x1087ca of _0x785346.episodes || []) {
    for (const _0x3dbfea of _0x1087ca?.clips || []) {
      const _0x5a8e8e = getRecoverableStoryClipVideoTask(_0x3dbfea);
      if (!_0x5a8e8e) {
        continue;
      }
      const _0x32e2e4 = buildStoryBackgroundTaskId("clip-video", {
        episodeId: _0x1087ca.id,
        clipId: _0x3dbfea.id
      });
      const _0x234098 = getStoryBackgroundTasks(_0x785346).find(_0x36199f => _0x36199f.id === _0x32e2e4);
      if (_0x234098?.resumable && _0x234098.remoteTaskId === _0x5a8e8e.taskId) {
        continue;
      }
      startStoryBackgroundTask(_0x785346, {
        id: _0x32e2e4,
        type: "clip-video",
        scope: {
          episodeId: _0x1087ca.id,
          clipId: _0x3dbfea.id
        },
        label: "生成片段视频",
        message: "正在恢复视频生成任务",
        status: "recovering",
        resumable: true,
        remoteTaskId: _0x5a8e8e.taskId,
        modelId: _0x5a8e8e.modelId,
        provider: _0x5a8e8e.provider,
        executionId: _0x5a8e8e.executionId,
        startedAt: _0x5a8e8e.startedAt
      });
      _0x57ff0d += 1;
    }
  }
  return _0x57ff0d > 0;
}
export function deriveStoryProjectTaskState(_0x1265c9 = {}) {
  const _0x338c41 = getStoryBackgroundTaskSummary(_0x1265c9).activeTasks;
  const _0x5416b6 = _0x56f0c0 => _0x338c41.find(_0x240a0e => _0x240a0e.type === _0x56f0c0);
  const _0x140b51 = _0x657fa5 => _0x338c41.map(_0xc1d521 => _0xc1d521.batch).find(_0x1e8964 => _0x1e8964?.type === _0x657fa5);
  const _0x1ad34f = {
    isGeneratingStory: false,
    generationStatus: "",
    storyPlanningOperation: "",
    storyPlanningStatus: "",
    generatingEpisodeScriptId: "",
    isBatchGeneratingScripts: false,
    episodeScriptBatchId: "",
    episodeScriptBatchCancelRequested: false,
    scriptGenerationFocusMode: false,
    episodeScriptGenerationStatus: "",
    splittingEpisodeIds: [],
    episodeBatchSplitOperation: "",
    episodeBatchSplitStatus: "",
    episodeBatchSplitId: "",
    episodeBatchSplitCancelRequested: false,
    generatingClipId: "",
    generatingClipIds: [],
    clipBatchGenerationByEpisode: {},
    generatingAppearanceKeys: [],
    generatingVoiceAssetIds: [],
    isBatchGenerating: false,
    batchGeneratingAssetIds: [],
    batchGeneratingAppearanceKeys: [],
    batchGeneratingVoiceAssetIds: [],
    assetBatchId: "",
    assetBatchCancelRequested: false,
    batchGenerationLabel: ""
  };
  const _0xc04a16 = _0x5416b6("story-summary");
  if (_0xc04a16) {
    _0x1ad34f.isGeneratingStory = true;
    _0x1ad34f.generationStatus = _0xc04a16.message || _0xc04a16.label || "正在生成剧本摘要";
  }
  const _0x38265f = _0x338c41.find(_0x5d6ff3 => normalizeText(_0x5d6ff3?.type).startsWith("asset-extraction"));
  const _0x75970a = _0x38265f || _0x5416b6("episode-planning");
  if (_0x75970a) {
    _0x1ad34f.storyPlanningOperation = _0x38265f ? normalizeText(_0x38265f.type).replace(/^asset-extraction/u, "extracting-assets") : "planning-episode-outlines";
    _0x1ad34f.storyPlanningStatus = _0x75970a.message || _0x75970a.label || "正在生成";
  }
  const _0x428461 = _0x338c41.filter(_0x1d279b => _0x1d279b.type === "episode-script");
  const _0xefff0d = _0x140b51("episode-scripts");
  if (_0x428461.length) {
    _0x1ad34f.scriptGenerationFocusMode = true;
    _0x1ad34f.generatingEpisodeScriptId = normalizeText(_0x428461[0]?.scope?.episodeId);
    _0x1ad34f.isBatchGeneratingScripts = Boolean(_0xefff0d) || _0x428461.length > 1;
    _0x1ad34f.episodeScriptBatchId = normalizeText(_0xefff0d?.id);
    _0x1ad34f.episodeScriptBatchCancelRequested = _0xefff0d?.cancelRequested === true;
    _0x1ad34f.episodeScriptGenerationStatus = _0xefff0d?.label || _0x428461[0]?.message || "正在生成分集剧本";
    _0x1ad34f.storyPlanningOperation = _0x1ad34f.isBatchGeneratingScripts ? "writing-episode-scripts" : "writing-episode-script";
    _0x1ad34f.storyPlanningStatus = _0x1ad34f.episodeScriptGenerationStatus;
  }
  const _0x45f4d5 = _0x338c41.filter(_0x3f21dc => _0x3f21dc.type === "episode-split" || _0x3f21dc.type === "episode-split-experimental");
  const _0x4404f7 = _0x140b51("episode-splits");
  _0x1ad34f.splittingEpisodeIds = _0x4404f7 ? normalizeStoryTaskBatchIds(_0x4404f7.pendingEpisodeIds?.length ? _0x4404f7.pendingEpisodeIds : _0x4404f7.targetEpisodeIds) : normalizeStoryTaskBatchIds(_0x45f4d5.map(_0x2859a3 => _0x2859a3.scope?.episodeId));
  if (_0x4404f7) {
    _0x1ad34f.episodeBatchSplitOperation = normalizeText(_0x4404f7.operation) || "splitting-all";
    _0x1ad34f.episodeBatchSplitStatus = normalizeText(_0x4404f7.label) || "正在批量拆分";
    _0x1ad34f.episodeBatchSplitId = normalizeText(_0x4404f7.id);
    _0x1ad34f.episodeBatchSplitCancelRequested = _0x4404f7.cancelRequested === true;
  }
  _0x1ad34f.generatingAppearanceKeys = normalizeStoryTaskBatchIds(_0x338c41.filter(_0x2b1f4a => ["asset-image", "asset-image-upload"].includes(_0x2b1f4a.type)).map(_0x3dbcda => getStoryAssetAppearanceGenerationKey(_0x3dbcda.scope?.assetId, _0x3dbcda.scope?.appearanceId)));
  _0x1ad34f.generatingVoiceAssetIds = normalizeStoryTaskBatchIds(_0x338c41.filter(_0x418aa8 => ["asset-voice", "asset-voice-upload"].includes(_0x418aa8.type)).map(_0x2503fc => _0x2503fc.scope?.assetId));
  const _0x53690b = _0x140b51("asset-generation");
  if (_0x53690b) {
    _0x1ad34f.isBatchGenerating = true;
    _0x1ad34f.assetBatchId = normalizeText(_0x53690b.id);
    _0x1ad34f.assetBatchCancelRequested = _0x53690b.cancelRequested === true;
    _0x1ad34f.batchGeneratingAssetIds = normalizeStoryTaskBatchIds(_0x53690b.pendingAssetIds);
    _0x1ad34f.batchGeneratingAppearanceKeys = normalizeStoryTaskBatchIds(_0x53690b.pendingAppearanceKeys);
    _0x1ad34f.batchGeneratingVoiceAssetIds = normalizeStoryTaskBatchIds(_0x53690b.pendingVoiceAssetIds);
    _0x1ad34f.batchGenerationLabel = normalizeText(_0x53690b.label) || "批量生成中";
  }
  const _0xe38f0a = _0x338c41.filter(_0x473854 => _0x473854.type === "clip-video" && isStoryClipVideoBackgroundTaskCurrent(_0x1265c9, _0x473854));
  _0x1ad34f.generatingClipIds = normalizeStoryTaskBatchIds(_0xe38f0a.map(_0x4c3731 => _0x4c3731.scope?.clipId));
  _0x1ad34f.generatingClipId = _0x1ad34f.generatingClipIds[0] || "";
  const _0x18b71d = new Map();
  _0xe38f0a.forEach(_0xb2ed47 => {
    if (_0xb2ed47.batch?.type !== "clip-videos" || _0x18b71d.has(_0xb2ed47.batch.id)) {
      return;
    }
    _0x18b71d.set(_0xb2ed47.batch.id, _0xb2ed47.batch);
  });
  _0x18b71d.forEach(_0xeca4d3 => {
    const _0x3f2cfc = normalizeText(_0xeca4d3.episodeId);
    if (!_0x3f2cfc) {
      return;
    }
    _0x1ad34f.clipBatchGenerationByEpisode[_0x3f2cfc] = {
      label: normalizeText(_0xeca4d3.label) || "批量生成中",
      batchId: normalizeText(_0xeca4d3.id),
      cancelRequested: _0xeca4d3.cancelRequested === true
    };
  });
  return _0x1ad34f;
}