import { buildStoryBackgroundTaskId, getStoryBackgroundTasks } from "./storyBackgroundTasks.js";
import { canGenerateStoryEpisodeScript, getNextStoryEpisodeScriptIndex, mergeStoryEpisodeScript, saveStoryEpisodeScriptDraft } from "./storyPlanningData.js";
import { invalidateStoryPlanningDownstream } from "./storyProjectPlanning.js";
const RUN_KIND = "story-episode-script-run";
const RUN_VERSION = 1;
const STAGE_VERSION = "1";
const PROMPT_VERSION = "episode-script/v2";
const SCHEMA_VERSION = "story-episode-script/v2";
const MAX_INVOCATIONS = 8;
const MAX_RAW_RESPONSE_CHARACTERS = 120000;
const SCRIPT_RESPONSE_STEPS = new Set(["generation", "repair", "content-revision"]);
const OPTIONAL_POST_GENERATION_STEPS = new Set(["timing-review", "timing-recheck", "content-revision"]);
let runSequence = 0;
function normalizeText(_0x2a5b61) {
  return String(_0x2a5b61 || "").trim();
}
function cloneJson(_0x24dfc7) {
  if (_0x24dfc7 == null) {
    return _0x24dfc7;
  }
  return JSON.parse(JSON.stringify(_0x24dfc7));
}
function stableSerialize(_0x17e9e6) {
  if (Array.isArray(_0x17e9e6)) {
    return "[" + _0x17e9e6.map(stableSerialize).join(",") + "]";
  }
  if (_0x17e9e6 && typeof _0x17e9e6 === "object") {
    return "{" + Object.keys(_0x17e9e6).sort().map(_0x455ff6 => JSON.stringify(_0x455ff6) + ":" + stableSerialize(_0x17e9e6[_0x455ff6])).join(",") + "}";
  }
  return JSON.stringify(_0x17e9e6 ?? null);
}
function fingerprintValue(_0x4e3a05) {
  const _0x472e16 = stableSerialize(_0x4e3a05);
  let _0x7901ea = 2166136261;
  for (let _0x590ae6 = 0; _0x590ae6 < _0x472e16.length; _0x590ae6 += 1) {
    _0x7901ea ^= _0x472e16.charCodeAt(_0x590ae6);
    _0x7901ea = Math.imul(_0x7901ea, 16777619);
  }
  return "fnv1a-" + (_0x7901ea >>> 0).toString(16).padStart(8, "0");
}
function getEpisodeRef(_0x72d24c = {}, _0x5a9c4b = 0) {
  return normalizeText(_0x72d24c.ref || _0x72d24c.planningRef || _0x72d24c.id) || "episode-" + (_0x5a9c4b + 1);
}
function getRunInput({
  project = {},
  episode = {},
  episodeIndex = 0,
  previousEpisode = null,
  nextEpisode = null,
  execution = {},
  regeneration = false
} = {}) {
  return {
    projectId: normalizeText(project.id),
    summaryRevision: Math.max(0, Math.trunc(Number(project.summaryRevision) || 0)),
    outlineRevision: Math.max(0, Math.trunc(Number(project.outlineSourceSummaryRevision) || 0)),
    scriptMode: normalizeText(project.scriptMode) || "plot",
    episodeIndex: Math.max(0, Math.trunc(Number(episodeIndex) || 0)),
    episodeRef: getEpisodeRef(episode, episodeIndex),
    episodeFingerprint: fingerprintValue({
      title: episode.title,
      synopsis: episode.synopsis,
      hook: episode.hook,
      continuityFacts: episode.continuityFacts,
      endingState: episode.endingState,
      existingScript: regeneration ? episode.script?.fullText : ""
    }),
    previousEpisodeFingerprint: fingerprintValue({
      ref: getEpisodeRef(previousEpisode || {}, Math.max(0, episodeIndex - 1)),
      script: previousEpisode?.script?.fullText,
      endingState: previousEpisode?.endingState
    }),
    nextEpisodeFingerprint: fingerprintValue({
      ref: getEpisodeRef(nextEpisode || {}, episodeIndex + 1),
      synopsis: nextEpisode?.synopsis,
      hook: nextEpisode?.hook
    }),
    regeneration: regeneration === true,
    execution: {
      modelId: normalizeText(execution.modelId),
      provider: normalizeText(execution.provider),
      providerProfileId: normalizeText(execution.providerProfileId)
    },
    stageVersion: STAGE_VERSION,
    promptVersion: PROMPT_VERSION,
    schemaVersion: SCHEMA_VERSION
  };
}
function normalizeInvocation(_0x2e72d1 = {}) {
  return {
    id: normalizeText(_0x2e72d1.id),
    stepId: normalizeText(_0x2e72d1.stepId),
    attempt: Math.max(1, Math.trunc(Number(_0x2e72d1.attempt) || 1)),
    state: normalizeText(_0x2e72d1.state),
    requestFingerprint: normalizeText(_0x2e72d1.requestFingerprint),
    rawResponse: String(_0x2e72d1.rawResponse || "").slice(0, MAX_RAW_RESPONSE_CHARACTERS),
    error: normalizeText(_0x2e72d1.error),
    preparedAt: Math.max(0, Number(_0x2e72d1.preparedAt || 0)),
    completedAt: Math.max(0, Number(_0x2e72d1.completedAt || 0)),
    retryAuthorizedAt: Math.max(0, Number(_0x2e72d1.retryAuthorizedAt || 0))
  };
}
export function normalizeStoryEpisodeScriptRun(_0x53bfc5) {
  if (!_0x53bfc5 || typeof _0x53bfc5 !== "object" || Array.isArray(_0x53bfc5) || _0x53bfc5.kind !== RUN_KIND || Number(_0x53bfc5.version) !== RUN_VERSION) {
    return null;
  }
  return {
    kind: RUN_KIND,
    version: RUN_VERSION,
    id: normalizeText(_0x53bfc5.id),
    status: normalizeText(_0x53bfc5.status) || "running",
    inputFingerprint: normalizeText(_0x53bfc5.inputFingerprint),
    input: cloneJson(_0x53bfc5.input || {}),
    checkpoint: cloneJson(_0x53bfc5.checkpoint || null),
    invocations: (Array.isArray(_0x53bfc5.invocations) ? _0x53bfc5.invocations : []).map(normalizeInvocation).filter(_0x4729f0 => _0x4729f0.id && _0x4729f0.stepId).slice(-MAX_INVOCATIONS),
    candidateArtifact: cloneJson(_0x53bfc5.candidateArtifact || null),
    errorCode: normalizeText(_0x53bfc5.errorCode),
    error: normalizeText(_0x53bfc5.error),
    createdAt: Math.max(0, Number(_0x53bfc5.createdAt || 0)) || Date.now(),
    updatedAt: Math.max(0, Number(_0x53bfc5.updatedAt || 0)) || Date.now()
  };
}
function createRun(_0x54b462 = {}) {
  const _0x1673e7 = getRunInput(_0x54b462);
  const _0x1cfd0c = Date.now();
  runSequence += 1;
  return {
    kind: RUN_KIND,
    version: RUN_VERSION,
    id: "episode-script:" + (_0x1673e7.projectId || "project") + ":" + _0x1673e7.episodeRef + ":" + _0x1cfd0c + ":" + runSequence,
    status: "running",
    inputFingerprint: fingerprintValue(_0x1673e7),
    input: _0x1673e7,
    checkpoint: null,
    invocations: [],
    candidateArtifact: null,
    errorCode: "",
    error: "",
    createdAt: _0x1cfd0c,
    updatedAt: _0x1cfd0c
  };
}
function canResumeRun(_0x38ad64, _0x577b11 = {}) {
  const _0xf83d9 = normalizeStoryEpisodeScriptRun(_0x38ad64);
  if (!_0xf83d9 || !["running", "failed_retryable", "ready_to_commit"].includes(_0xf83d9.status)) {
    return false;
  }
  const _0xf2133f = _0xf83d9.status === "failed_retryable" && _0xf83d9.errorCode === "MODEL_CREDENTIAL_MISSING" && _0xf83d9.invocations.length === 0 && !_0xf83d9.checkpoint && !_0xf83d9.candidateArtifact;
  if (_0xf2133f) {
    return false;
  }
  return _0xf83d9.inputFingerprint === fingerprintValue(getRunInput({
    ..._0x577b11,
    execution: _0xf83d9.input.execution
  }));
}
function runRequiresPaidRetry(_0x1c7bd5) {
  const _0x48e9a6 = normalizeStoryEpisodeScriptRun(_0x1c7bd5);
  if (!_0x48e9a6) {
    return false;
  }
  const _0x169701 = _0x48e9a6.invocations.filter(_0x5d91c8 => ["prepared", "outcome-unknown"].includes(_0x5d91c8.state) && !_0x5d91c8.retryAuthorizedAt);
  if (!_0x169701.length) {
    return false;
  }
  const _0x55a5a9 = _0x48e9a6.invocations.some(_0x28f3d7 => SCRIPT_RESPONSE_STEPS.has(_0x28f3d7.stepId) && _0x28f3d7.state === "completed" && _0x28f3d7.rawResponse);
  return !_0x55a5a9 || _0x169701.some(_0x5be9cc => !OPTIONAL_POST_GENERATION_STEPS.has(_0x5be9cc.stepId));
}
function authorizePaidRetry(_0x340084) {
  const _0x5c4f50 = normalizeStoryEpisodeScriptRun(_0x340084);
  if (!_0x5c4f50) {
    return null;
  }
  const _0x5bf5bc = Date.now();
  _0x5c4f50.invocations = _0x5c4f50.invocations.map(_0x1b1864 => ["prepared", "outcome-unknown"].includes(_0x1b1864.state) && !_0x1b1864.retryAuthorizedAt ? {
    ..._0x1b1864,
    retryAuthorizedAt: _0x5bf5bc
  } : _0x1b1864);
  _0x5c4f50.updatedAt = _0x5bf5bc;
  return _0x5c4f50;
}
function createRunPayload(_0x271f22) {
  return {
    kind: RUN_KIND,
    run: cloneJson(normalizeStoryEpisodeScriptRun(_0x271f22))
  };
}
function getRunFromTask(_0x48d9ab = {}) {
  if (_0x48d9ab?.resumePayload?.kind === RUN_KIND) {
    return normalizeStoryEpisodeScriptRun(_0x48d9ab.resumePayload.run);
  } else {
    return null;
  }
}
function completeRun(_0x302ea0) {
  const _0x415dce = normalizeStoryEpisodeScriptRun(_0x302ea0);
  if (_0x415dce) {
    return {
      ..._0x415dce,
      status: "succeeded",
      candidateArtifact: null,
      checkpoint: null,
      errorCode: "",
      error: "",
      updatedAt: Date.now()
    };
  } else {
    return null;
  }
}
function mergeRepairDrafts(_0x493aa8, _0x491b5a) {
  const _0x4a4135 = _0x491b5a?.scriptDraft && typeof _0x491b5a.scriptDraft === "object" ? cloneJson(_0x491b5a.scriptDraft) : null;
  const _0x17d56e = _0x493aa8.checkpoint?.repairDraft && typeof _0x493aa8.checkpoint.repairDraft === "object" ? cloneJson(_0x493aa8.checkpoint.repairDraft) : null;
  const _0x1f7e3e = [...(Array.isArray(_0x4a4135?.rawResponses) ? _0x4a4135.rawResponses : []), ...(Array.isArray(_0x17d56e?.rawResponses) ? _0x17d56e.rawResponses : []), ..._0x493aa8.invocations.filter(_0xef4ede => _0xef4ede.state === "completed" && _0xef4ede.rawResponse).map(_0x35e05b => ({
    attempt: _0x35e05b.attempt,
    phase: _0x35e05b.stepId,
    text: _0x35e05b.rawResponse
  }))];
  const _0x31c9c0 = [...new Map(_0x1f7e3e.map(_0x1a8f60 => [Math.max(1, Math.trunc(Number(_0x1a8f60?.attempt) || 1)) + ":" + String(_0x1a8f60?.text || ""), _0x1a8f60])).values()];
  const _0x2f845c = _0x493aa8.invocations.some(_0x216cfb => SCRIPT_RESPONSE_STEPS.has(_0x216cfb.stepId) && _0x216cfb.state === "completed" && _0x216cfb.rawResponse);
  const _0x838f1b = _0x493aa8.invocations.some(_0x276db0 => OPTIONAL_POST_GENERATION_STEPS.has(_0x276db0.stepId) && ["prepared", "outcome-unknown"].includes(_0x276db0.state) && !_0x276db0.retryAuthorizedAt);
  const _0x21bd07 = _0x2f845c && _0x838f1b;
  if (!_0x31c9c0.length) {
    return _0x17d56e || _0x4a4135;
  }
  return {
    ...(_0x4a4135 || {}),
    ...(_0x17d56e || {}),
    status: "failed",
    episodeRef: _0x493aa8.input.episodeRef,
    attempts: Math.max(1, ..._0x31c9c0.map(_0x2d9424 => Math.trunc(Number(_0x2d9424?.attempt) || 0))),
    rawResponses: _0x31c9c0,
    ...(_0x21bd07 ? {
      skipPostGenerationReview: true
    } : {})
  };
}
function getErrorCode(_0xaf22f5) {
  return normalizeText(_0xaf22f5?.code) || "STORY_EPISODE_SCRIPT_FAILED";
}
export function createStoryEpisodeScriptApplication({
  generateEpisodeScript: _0x5ba159
} = {}) {
  if (typeof _0x5ba159 !== "function") {
    throw new TypeError("generateEpisodeScript must be a function");
  }
  async function _0x4170d9(_0x32b789 = {}) {
    const _0x582c76 = normalizeStoryEpisodeScriptRun(_0x32b789.resumeRun);
    const _0xe1b217 = canResumeRun(_0x582c76, _0x32b789);
    if (_0xe1b217 && _0x582c76.status === "ready_to_commit" && _0x582c76.candidateArtifact) {
      return {
        result: cloneJson(_0x582c76.candidateArtifact),
        run: cloneJson(_0x582c76),
        resumed: true
      };
    }
    let _0x5e4d62 = _0xe1b217 ? _0x582c76 : createRun(_0x32b789);
    _0x5e4d62.status = "running";
    _0x5e4d62.errorCode = "";
    _0x5e4d62.error = "";
    _0x5e4d62.updatedAt = Date.now();
    await _0x32b789.onRunChange?.(cloneJson(_0x5e4d62));
    try {
      const _0x510b93 = await _0x5ba159({
        project: _0x32b789.project,
        episode: _0x32b789.episode,
        previousEpisode: _0x32b789.previousEpisode,
        nextEpisode: _0x32b789.nextEpisode,
        model: _0x5e4d62.input.execution.modelId,
        provider: _0x5e4d62.input.execution.provider,
        providerProfileId: _0x5e4d62.input.execution.providerProfileId,
        repairDraft: mergeRepairDrafts(_0x5e4d62, _0x32b789.episode),
        onProgress: _0x32b789.onProgress,
        onInvocation: async (_0x360696 = {}) => {
          const _0x4d3c87 = Date.now();
          if (_0x360696.state === "prepared") {
            _0x5e4d62.invocations.push(normalizeInvocation({
              id: _0x5e4d62.id + ":" + _0x360696.stepId + ":" + _0x360696.attempt + ":" + (_0x5e4d62.invocations.length + 1),
              stepId: _0x360696.stepId,
              attempt: _0x360696.attempt,
              state: "prepared",
              requestFingerprint: fingerprintValue({
                model: _0x360696.requestPayload?.model,
                provider: _0x360696.requestPayload?.provider,
                prompt: _0x360696.requestPayload?.prompt
              }),
              preparedAt: _0x4d3c87
            }));
          } else {
            const _0x2ff81b = [..._0x5e4d62.invocations].reverse().find(_0x1c33dd => _0x1c33dd.stepId === normalizeText(_0x360696.stepId) && _0x1c33dd.attempt === Math.max(1, Math.trunc(Number(_0x360696.attempt) || 1)) && _0x1c33dd.state === "prepared");
            if (_0x2ff81b) {
              _0x2ff81b.state = normalizeText(_0x360696.state);
              _0x2ff81b.rawResponse = String(_0x360696.rawResponse || "").slice(0, MAX_RAW_RESPONSE_CHARACTERS);
              _0x2ff81b.error = normalizeText(_0x360696.error);
              _0x2ff81b.completedAt = _0x4d3c87;
            }
          }
          _0x5e4d62.invocations = _0x5e4d62.invocations.slice(-MAX_INVOCATIONS);
          _0x5e4d62.updatedAt = _0x4d3c87;
          await _0x32b789.onRunChange?.(cloneJson(_0x5e4d62));
        }
      });
      _0x5e4d62.status = "ready_to_commit";
      _0x5e4d62.candidateArtifact = cloneJson(_0x510b93);
      _0x5e4d62.checkpoint = null;
      _0x5e4d62.updatedAt = Date.now();
      await _0x32b789.onRunChange?.(cloneJson(_0x5e4d62));
      return {
        result: _0x510b93,
        run: cloneJson(_0x5e4d62),
        resumed: _0xe1b217
      };
    } catch (_0x5e7f8d) {
      const _0x192a22 = _0x5e7f8d?.partialResult && typeof _0x5e7f8d.partialResult === "object" && !Array.isArray(_0x5e7f8d.partialResult) ? cloneJson(_0x5e7f8d.partialResult) : null;
      _0x5e4d62.status = "failed_retryable";
      _0x5e4d62.checkpoint = _0x192a22 ? {
        repairDraft: _0x192a22
      } : _0x5e4d62.checkpoint;
      _0x5e4d62.errorCode = getErrorCode(_0x5e7f8d);
      _0x5e4d62.error = normalizeText(_0x5e7f8d?.message || _0x5e7f8d);
      _0x5e4d62.updatedAt = Date.now();
      await _0x32b789.onRunChange?.(cloneJson(_0x5e4d62));
      _0x5e7f8d.storyEpisodeScriptRun = cloneJson(_0x5e4d62);
      throw _0x5e7f8d;
    }
  }
  return Object.freeze({
    execute: _0x4170d9
  });
}
export function createStoryEpisodeScriptWorkspaceController({
  state: _0xf96ebd,
  generateEpisodeScript: _0x162b93,
  host = {}
} = {}) {
  const _0x55c3db = typeof _0x162b93 === "function" ? createStoryEpisodeScriptApplication({
    generateEpisodeScript: _0x162b93
  }) : null;
  async function _0x180d4a(_0x2715ad, _0xc35353 = host.createProjectTaskToken(), {
    batch = null,
    regeneration = false
  } = {}) {
    const _0xd3273f = _0xc35353.data;
    if (!host.isProjectTaskLive(_0xc35353)) {
      return null;
    }
    if (_0xd3273f?.project?.sourceMode === "upload-original") {
      throw new Error("上传剧本保持原稿，不支持 AI 扩写分集正文。");
    }
    if (!_0x55c3db) {
      throw new Error("完整分集剧本 Agent 尚未初始化。");
    }
    const _0x11c1a8 = _0xd3273f.episodes.findIndex(_0x1d5578 => _0x1d5578.id === _0x2715ad.id);
    if (_0x11c1a8 < 0 || !regeneration && !canGenerateStoryEpisodeScript(_0xd3273f.episodes, _0x11c1a8)) {
      throw new Error("必须按顺序生成剧本；当前应先生成第 " + (getNextStoryEpisodeScriptIndex(_0xd3273f.episodes) + 1) + " 集。");
    }
    const _0xd901ba = host.getPlanningContext(_0xd3273f, _0xc35353);
    const _0xa6978b = _0x11c1a8 > 0 ? _0xd3273f.episodes[_0x11c1a8 - 1] : null;
    const _0x5b9a2 = _0xd3273f.episodes[_0x11c1a8 + 1] || null;
    const _0x2b14b8 = {
      modelId: _0xd901ba.model,
      provider: _0xd901ba.provider,
      providerProfileId: _0xd901ba.providerProfileId
    };
    const _0xd4a253 = buildStoryBackgroundTaskId("episode-script", {
      episodeId: _0x2715ad.id
    });
    const _0x53f93a = getStoryBackgroundTasks(_0xd3273f).find(_0x25cd0a => _0x25cd0a.id === _0xd4a253);
    let _0x21385e = getRunFromTask(_0x53f93a);
    const _0x2e35cd = {
      project: _0xd901ba.project,
      episode: _0x2715ad,
      episodeIndex: _0x11c1a8,
      previousEpisode: _0xa6978b,
      nextEpisode: _0x5b9a2,
      execution: _0x2b14b8,
      regeneration: regeneration
    };
    const _0x321c85 = canResumeRun(_0x21385e, _0x2e35cd);
    if (_0x321c85 && runRequiresPaidRetry(_0x21385e)) {
      const _0x3ac15f = await host.requestChoice({
        overlayId: "story-episode-script-paid-retry-" + _0x2715ad.id,
        title: "第 " + (_0x11c1a8 + 1) + " 集正文生成结果未知",
        message: "上次正文生成或正文修复请求可能已经提交并计费，但没有收到确定结果。只有你确认后才会再次请求正文。",
        fallbackValue: null,
        choices: [{
          label: "暂不重试",
          value: null,
          autofocus: true
        }, {
          label: "确认重新请求正文",
          value: "retry",
          primary: true
        }]
      });
      if (_0x3ac15f !== "retry") {
        throw new Error("已停止重复请求本集剧本。");
      }
      _0x21385e = authorizePaidRetry(_0x21385e);
    }
    const _0x1f205f = async _0x4b9d9b => {
      const _0x492e91 = {
        type: "episode-script",
        scope: {
          episodeId: _0x2715ad.id
        },
        label: "生成第 " + (_0x11c1a8 + 1) + " 集完整剧本",
        status: _0x4b9d9b.status === "failed_retryable" ? "failed" : "running",
        resumable: true,
        modelId: _0x4b9d9b.input.execution.modelId,
        provider: _0x4b9d9b.input.execution.provider,
        message: _0x4b9d9b.error || _0xf96ebd.episodeScriptGenerationStatus,
        error: _0x4b9d9b.error,
        resumePayload: createRunPayload(_0x4b9d9b),
        batch: batch
      };
      const _0x4448cd = getStoryBackgroundTasks(_0xd3273f).find(_0x46d67d => _0x46d67d.id === _0xd4a253);
      if (_0x4448cd) {
        host.updateBackgroundTask(_0xc35353, _0xd4a253, _0x492e91);
      } else {
        host.startBackgroundTask(_0xc35353, {
          id: _0xd4a253,
          ..._0x492e91
        });
      }
      const _0x21d87e = await host.persistNow();
      if (host.persistenceRequired() && !_0x21d87e) {
        throw new Error("分集剧本运行记录保存失败，已停止模型请求。");
      }
    };
    try {
      const _0x2dbdba = await _0x55c3db.execute({
        ..._0x2e35cd,
        resumeRun: _0x321c85 ? _0x21385e : null,
        onRunChange: _0x1f205f,
        onProgress: ({
          message: _0xf417ac
        } = {}) => {
          if (!host.isProjectTaskLive(_0xc35353)) {
            return;
          }
          const _0x40cf8d = normalizeText(_0xf417ac) || "正在生成第 " + (_0x11c1a8 + 1) + " 集完整剧本";
          host.updateBackgroundTask(_0xc35353, _0xd4a253, {
            status: "running",
            message: _0x40cf8d
          });
          if (host.isProjectTaskCurrent(_0xc35353)) {
            _0xf96ebd.episodeScriptGenerationStatus = _0x40cf8d;
            host.renderPlanningProgress();
          }
        }
      });
      if (!host.isProjectTaskLive(_0xc35353)) {
        return null;
      }
      let _0x57f85c = _0xd3273f;
      if (regeneration) {
        _0x57f85c = invalidateStoryPlanningDownstream(_0xd3273f, {
          episodeScriptStartIndex: _0x11c1a8
        });
        _0x57f85c.episodes[_0x11c1a8] = mergeStoryEpisodeScript(_0x57f85c.episodes[_0x11c1a8], _0x2dbdba.result);
        _0xc35353.data = _0x57f85c;
        host.registerProjectData(_0xc35353);
        if (host.isProjectTaskCurrent(_0xc35353)) {
          _0xf96ebd.data = _0x57f85c;
          host.resetDownstreamUi({
            selectedEpisodeId: _0x2715ad.id
          });
        }
      } else {
        _0x57f85c.episodes[_0x11c1a8] = mergeStoryEpisodeScript(_0x2715ad, _0x2dbdba.result);
      }
      const _0x4e446a = host.syncCompiledScripts(_0x57f85c);
      host.finishBackgroundTask(_0xc35353, _0xd4a253, {
        status: "succeeded",
        message: "第 " + (_0x11c1a8 + 1) + " 集完整剧本已生成",
        resumable: false,
        resumePayload: createRunPayload(completeRun(_0x2dbdba.run))
      });
      host.schedulePersistence({
        immediate: true
      });
      await host.persistNow();
      return {
        episode: _0x57f85c.episodes[_0x11c1a8],
        compiled: _0x4e446a
      };
    } catch (_0x2343df) {
      if (host.isProjectTaskLive(_0xc35353)) {
        const _0x25cb9c = _0x2343df?.partialResult && typeof _0x2343df.partialResult === "object" && !Array.isArray(_0x2343df.partialResult) ? cloneJson(_0x2343df.partialResult) : null;
        if (_0x25cb9c) {
          _0xd3273f.episodes[_0x11c1a8] = saveStoryEpisodeScriptDraft(_0xd3273f.episodes[_0x11c1a8], _0x25cb9c);
          host.schedulePersistence({
            immediate: true
          });
        }
        host.finishBackgroundTask(_0xc35353, _0xd4a253, {
          status: "failed",
          message: _0x25cb9c ? "第 " + (_0x11c1a8 + 1) + " 集返回已保存，可继续修复" : "第 " + (_0x11c1a8 + 1) + " 集剧本生成失败",
          error: _0x2343df?.message || "完整分集剧本生成失败。",
          resumable: true,
          ...(_0x2343df?.storyEpisodeScriptRun ? {
            resumePayload: createRunPayload(_0x2343df.storyEpisodeScriptRun)
          } : {})
        });
      }
      throw _0x2343df;
    }
  }
  return Object.freeze({
    request: _0x180d4a
  });
}