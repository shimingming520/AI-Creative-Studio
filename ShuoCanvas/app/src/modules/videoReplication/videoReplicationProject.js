export const VIDEO_REPLICATION_PROJECT_SCHEMA_VERSION = 1;
const ACTIVE_STATUSES = new Set(["uploading", "cutting", "prompting", "analyzing"]);
const ACTIVE_GENERATION_STATUSES = new Set(["pending", "queued", "recovering", "running", "submitting"]);
function normalizeText(_0xc944e4, _0x5cf9b3 = "") {
  const _0xe28f84 = String(_0xc944e4 ?? "").trim();
  return _0xe28f84 || _0x5cf9b3;
}
function normalizeTimestamp(_0x44ea00) {
  const _0x223eea = Number(_0x44ea00);
  if (Number.isFinite(_0x223eea) && _0x223eea > 0) {
    return _0x223eea;
  }
  const _0x3aa88a = Date.parse(_0x44ea00 || "");
  if (Number.isFinite(_0x3aa88a)) {
    return _0x3aa88a;
  } else {
    return 0;
  }
}
function normalizeMediaDimension(_0x2457f2) {
  const _0x3a0092 = Number(_0x2457f2);
  if (Number.isFinite(_0x3a0092) && _0x3a0092 > 0) {
    return Math.round(_0x3a0092);
  } else {
    return 0;
  }
}
function normalizeStatus(_0x2fb721, _0x4bb7f9 = "pending") {
  return normalizeText(_0x2fb721, _0x4bb7f9).toLowerCase();
}
function normalizeClip(_0x309556 = {}, _0x10e1f4 = 0) {
  const _0xa32106 = Math.max(0, Number(_0x309556.startTimeSec) || 0);
  const _0x65cc0d = Math.max(_0xa32106, Number(_0x309556.endTimeSec) || _0xa32106);
  return {
    id: normalizeText(_0x309556.id, "clip-" + (_0x10e1f4 + 1)),
    index: Math.max(0, Math.trunc(Number(_0x309556.index) || _0x10e1f4)),
    title: normalizeText(_0x309556.title, "片段 " + (_0x10e1f4 + 1)),
    startTimeSec: _0xa32106,
    endTimeSec: _0x65cc0d,
    durationSec: Math.max(0, Number(_0x309556.durationSec) || _0x65cc0d - _0xa32106),
    sourceVideoRef: normalizeText(_0x309556.sourceVideoRef),
    videoRef: normalizeText(_0x309556.videoRef),
    videoWidth: normalizeMediaDimension(_0x309556.videoWidth || _0x309556.naturalWidth || _0x309556.width),
    videoHeight: normalizeMediaDimension(_0x309556.videoHeight || _0x309556.naturalHeight || _0x309556.height),
    promptStatus: normalizeStatus(_0x309556.promptStatus),
    promptError: normalizeText(_0x309556.promptError),
    analysis: _0x309556.analysis && typeof _0x309556.analysis === "object" ? {
      ..._0x309556.analysis
    } : {},
    generationPrompt: normalizeText(_0x309556.generationPrompt),
    generationPromptEdited: _0x309556.generationPromptEdited === true,
    generation: _0x309556.generation && typeof _0x309556.generation === "object" ? {
      ..._0x309556.generation
    } : {
      status: "idle",
      results: []
    },
    video: {
      ...(_0x309556.video && typeof _0x309556.video === "object" ? _0x309556.video : {}),
      results: Array.isArray(_0x309556.video?.results) ? _0x309556.video.results.map(_0xdaa75f => ({
        ..._0xdaa75f
      })) : [],
      activeIndex: Math.max(0, Math.trunc(Number(_0x309556.video?.activeIndex) || 0))
    }
  };
}
function normalizeCharacter(_0x3eb1ad = {}, _0x56e6ce = 0) {
  return {
    id: normalizeText(_0x3eb1ad.id, "character-" + (_0x56e6ce + 1)),
    name: normalizeText(_0x3eb1ad.name, "人物 " + (_0x56e6ce + 1)),
    kind: "character",
    description: normalizeText(_0x3eb1ad.description),
    imageRef: normalizeText(_0x3eb1ad.imageRef || _0x3eb1ad.imageUrl || _0x3eb1ad.url || _0x3eb1ad.localPath),
    imageWidth: normalizeMediaDimension(_0x3eb1ad.imageWidth || _0x3eb1ad.naturalWidth || _0x3eb1ad.width),
    imageHeight: normalizeMediaDimension(_0x3eb1ad.imageHeight || _0x3eb1ad.naturalHeight || _0x3eb1ad.height)
  };
}
function normalizeProjectAsset(_0x12a90d = {}, _0x46b55f = 0, _0x1c7c81 = "scene") {
  const _0x3188bd = _0x1c7c81 === "prop" ? "道具" : "场景";
  return {
    id: normalizeText(_0x12a90d.id, _0x1c7c81 + "-" + (_0x46b55f + 1)),
    name: normalizeText(_0x12a90d.name, _0x3188bd + " " + (_0x46b55f + 1)),
    kind: _0x1c7c81,
    description: normalizeText(_0x12a90d.description),
    imageRef: normalizeText(_0x12a90d.imageRef || _0x12a90d.imageUrl || _0x12a90d.url || _0x12a90d.localPath)
  };
}
function normalizeWorkspace(_0x54366d = {}, _0xdeb60f = []) {
  const _0x5dfdb0 = Number(_0x54366d.step) === 2 ? 2 : 1;
  const _0x2a8c2a = normalizeText(_0x54366d.selectedEpisodeId, _0xdeb60f[0]?.id || "");
  const _0x49b7e0 = _0xdeb60f.find(_0x1111b3 => _0x1111b3.id === _0x2a8c2a) || _0xdeb60f[0] || null;
  return {
    step: _0x5dfdb0,
    assetTab: ["character", "scene", "prop", "library"].includes(normalizeText(_0x54366d.assetTab)) ? normalizeText(_0x54366d.assetTab) : "character",
    selectedAssetId: normalizeText(_0x54366d.selectedAssetId),
    selectedEpisodeId: normalizeText(_0x49b7e0?.id, _0xdeb60f[0]?.id || ""),
    selectedClipId: normalizeText(_0x54366d.selectedClipId, _0x49b7e0?.clips?.[0]?.id || ""),
    episodeAssetTab: ["assets", "frames", "library"].includes(normalizeText(_0x54366d.episodeAssetTab)) ? normalizeText(_0x54366d.episodeAssetTab) : "assets"
  };
}
function normalizeEpisode(_0x70855c = {}, _0x3df35e = 0) {
  return {
    id: normalizeText(_0x70855c.id, "episode-" + (_0x3df35e + 1)),
    number: Math.max(1, Math.trunc(Number(_0x70855c.number) || _0x3df35e + 1)),
    title: normalizeText(_0x70855c.title, "第 " + (_0x3df35e + 1) + " 集"),
    fileName: normalizeText(_0x70855c.fileName),
    sourceVideoRef: normalizeText(_0x70855c.sourceVideoRef),
    durationSec: Math.max(0, Number(_0x70855c.durationSec) || 0),
    clipLimitSeconds: [15, 30].includes(Number(_0x70855c.clipLimitSeconds)) ? Number(_0x70855c.clipLimitSeconds) : 15,
    status: normalizeStatus(_0x70855c.status),
    progress: Math.max(0, Math.min(100, Number(_0x70855c.progress) || 0)),
    error: normalizeText(_0x70855c.error),
    clips: (Array.isArray(_0x70855c.clips) ? _0x70855c.clips : []).map(normalizeClip)
  };
}
export function normalizeVideoReplicationProject(_0x396f58 = {}) {
  const _0x158f39 = normalizeTimestamp(_0x396f58.createdAt) || Date.now();
  const _0x226890 = (Array.isArray(_0x396f58.episodes) ? _0x396f58.episodes : []).map(normalizeEpisode);
  const _0x2abecc = normalizeWorkspace(_0x396f58.workspace, _0x226890);
  return {
    schemaVersion: VIDEO_REPLICATION_PROJECT_SCHEMA_VERSION,
    id: normalizeText(_0x396f58.id, "video-replication-project"),
    title: normalizeText(_0x396f58.title, "未命名复刻项目"),
    status: normalizeStatus(_0x396f58.status, "draft"),
    settings: {
      clipLimitSeconds: [15, 30].includes(Number(_0x396f58.settings?.clipLimitSeconds)) ? Number(_0x396f58.settings.clipLimitSeconds) : 15,
      useSourceVideoReference: _0x396f58.settings?.useSourceVideoReference !== false,
      promptModelId: normalizeText(_0x396f58.settings?.promptModelId, "google/gemini-3.1-flash-lite-preview"),
      textProvider: normalizeText(_0x396f58.settings?.textProvider),
      textProviderProfileId: normalizeText(_0x396f58.settings?.textProviderProfileId),
      videoModelId: normalizeText(_0x396f58.settings?.videoModelId, "apimart/doubao-seedance-2.0"),
      videoProvider: normalizeText(_0x396f58.settings?.videoProvider),
      videoProviderProfileId: normalizeText(_0x396f58.settings?.videoProviderProfileId),
      generationParams: _0x396f58.settings?.generationParams && typeof _0x396f58.settings.generationParams === "object" ? {
        ..._0x396f58.settings.generationParams
      } : {},
      generationParamsByModel: _0x396f58.settings?.generationParamsByModel && typeof _0x396f58.settings.generationParamsByModel === "object" ? {
        ..._0x396f58.settings.generationParamsByModel
      } : {},
      resolution: normalizeText(_0x396f58.settings?.resolution, "720p"),
      aspectRatio: normalizeText(_0x396f58.settings?.aspectRatio, "adaptive")
    },
    characters: (Array.isArray(_0x396f58.characters) ? _0x396f58.characters : []).map(normalizeCharacter).filter(_0x471141 => _0x471141.imageRef),
    scenes: (Array.isArray(_0x396f58.scenes) ? _0x396f58.scenes : []).map((_0x2cb8c9, _0x27e049) => normalizeProjectAsset(_0x2cb8c9, _0x27e049, "scene")).filter(_0x51112a => _0x51112a.imageRef),
    props: (Array.isArray(_0x396f58.props) ? _0x396f58.props : []).map((_0xdbeff9, _0x2692e2) => normalizeProjectAsset(_0xdbeff9, _0x2692e2, "prop")).filter(_0x1f3330 => _0x1f3330.imageRef),
    episodes: _0x226890,
    workspace: _0x2abecc,
    selectedEpisodeId: _0x2abecc.selectedEpisodeId,
    createdAt: _0x158f39,
    updatedAt: normalizeTimestamp(_0x396f58.updatedAt) || _0x158f39,
    archivedAt: normalizeTimestamp(_0x396f58.archivedAt)
  };
}
export function normalizeVideoReplicationProjectLibrary(_0x49718a = {}) {
  const _0x212fbd = (Array.isArray(_0x49718a?.projects) ? _0x49718a.projects : []).map(normalizeVideoReplicationProject).filter(_0x5c4554 => _0x5c4554.id);
  return {
    schemaVersion: VIDEO_REPLICATION_PROJECT_SCHEMA_VERSION,
    currentProjectId: normalizeText(_0x49718a?.currentProjectId),
    projects: _0x212fbd
  };
}
export function upsertVideoReplicationProject(_0x4168e4, _0x2fc5e4) {
  const _0xb85ae8 = normalizeVideoReplicationProjectLibrary(_0x4168e4);
  const _0x3f6417 = normalizeVideoReplicationProject(_0x2fc5e4);
  const _0x1ef193 = _0xb85ae8.projects.filter(_0x3616e1 => _0x3616e1.id !== _0x3f6417.id);
  return {
    ..._0xb85ae8,
    currentProjectId: _0x3f6417.id,
    projects: [_0x3f6417, ..._0x1ef193]
  };
}
export function settleInterruptedVideoReplicationProjects(_0x3911a0 = {}) {
  const _0xdc1c20 = normalizeVideoReplicationProjectLibrary(_0x3911a0);
  let _0xd79946 = false;
  const _0x1017a3 = _0xdc1c20.projects.map(_0x52feef => {
    const _0x11da0b = _0x52feef.episodes.map(_0x4f0c17 => {
      const _0x49c655 = ACTIVE_STATUSES.has(_0x4f0c17.status);
      let _0x2e35d2 = _0x49c655;
      const _0x1b4e45 = _0x4f0c17.clips.map(_0x8fccdb => {
        const _0x1f23d4 = _0x8fccdb.promptStatus === "prompting";
        const _0x4a7ace = ACTIVE_GENERATION_STATUSES.has(normalizeStatus(_0x8fccdb.generation?.status));
        if (!_0x1f23d4 && !_0x4a7ace) {
          return _0x8fccdb;
        }
        _0x2e35d2 = true;
        return {
          ..._0x8fccdb,
          ...(_0x1f23d4 ? {
            promptStatus: "failed",
            promptError: "提示词反推任务已中断"
          } : {}),
          ...(_0x4a7ace ? {
            generation: {
              ..._0x8fccdb.generation,
              status: "failed",
              error: "视频生成任务已中断"
            }
          } : {})
        };
      });
      if (!_0x2e35d2) {
        return _0x4f0c17;
      }
      _0xd79946 = true;
      return {
        ..._0x4f0c17,
        status: _0x49c655 ? "failed" : _0x4f0c17.status,
        error: _0x49c655 ? "上次解析在应用退出时中断，请重新创建解析任务。" : _0x4f0c17.error,
        clips: _0x1b4e45
      };
    });
    if (ACTIVE_STATUSES.has(_0x52feef.status)) {
      _0xd79946 = true;
    }
    return {
      ..._0x52feef,
      status: ACTIVE_STATUSES.has(_0x52feef.status) ? "partial" : _0x52feef.status,
      episodes: _0x11da0b
    };
  });
  return {
    changed: _0xd79946,
    library: {
      ..._0xdc1c20,
      projects: _0x1017a3
    }
  };
}
export function getVideoReplicationProjectTaskSummary(_0x30f508 = {}) {
  const _0x94bc0 = Array.isArray(_0x30f508.episodes) ? _0x30f508.episodes : [];
  const _0x17c541 = _0x94bc0.filter(_0x399c35 => ACTIVE_STATUSES.has(normalizeStatus(_0x399c35.status))).length;
  const _0x4322fe = _0x94bc0.filter(_0x1623d1 => normalizeStatus(_0x1623d1.status) === "failed").length;
  return {
    activeCount: _0x17c541,
    failedCount: _0x4322fe,
    label: _0x17c541 ? "解析中 · " + _0x17c541 + " 集" : _0x4322fe ? _0x4322fe + " 集解析失败" : _0x30f508.status === "ready" ? "可生成" : "制作中"
  };
}