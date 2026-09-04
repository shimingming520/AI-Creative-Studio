function normalizeText(_0x1ab6f2) {
  return String(_0x1ab6f2 || "").trim();
}
function normalizeStringArray(_0x485a8f) {
  return [...new Set((Array.isArray(_0x485a8f) ? _0x485a8f : []).map(_0x34df39 => normalizeText(_0x34df39)).filter(Boolean))];
}
function normalizeReference(_0x25c6db, _0x267a9f = "") {
  return normalizeText(_0x25c6db) || normalizeText(_0x267a9f);
}
export function canRepairStoryEpisodeSplitPartialDraft(_0x35da16 = {}) {
  const _0xc52ad9 = Array.isArray(_0x35da16?.items) ? _0x35da16.items : [];
  return _0xc52ad9.some(_0x121d90 => _0x121d90?.status === "valid") && _0xc52ad9.some(_0x27da77 => _0x27da77?.status !== "valid");
}
function collectRepairAssetRefs(_0x149d49 = []) {
  const _0x147c41 = new Set();
  _0x149d49.forEach(_0x548fc1 => {
    (Array.isArray(_0x548fc1?.rawClips) ? _0x548fc1.rawClips : []).forEach(_0x5777a0 => {
      (Array.isArray(_0x5777a0?.shots) ? _0x5777a0.shots : []).forEach(_0x4a2779 => {
        normalizeStringArray(_0x4a2779?.assetRefs).forEach(_0xbdcbf6 => _0x147c41.add(_0xbdcbf6));
        (Array.isArray(_0x4a2779?.assetUsages) ? _0x4a2779.assetUsages : []).forEach(_0x5bbffb => {
          const _0x2bede1 = normalizeReference(_0x5bbffb?.assetRef);
          if (_0x2bede1) {
            _0x147c41.add(_0x2bede1);
          }
        });
      });
    });
  });
  return _0x147c41;
}
export function buildStoryEpisodeSplitPartialRepairPrompt({
  draft = {},
  episode = {},
  assets = [],
  constraints = {},
  schemaVersion = 1,
  clipMaxSeconds = 15,
  timingGuidance = "",
  dialogueSpeakerGuidance = "",
  groupingGuidance = "",
  timelineRequirements = [],
  continuousTimeline = false
} = {}) {
  const _0x186530 = (Array.isArray(draft?.items) ? draft.items : []).filter(_0x52711f => _0x52711f?.status !== "valid");
  const _0x201f23 = collectRepairAssetRefs(_0x186530);
  const _0x1f65d6 = (Array.isArray(assets) ? assets : []).filter(_0x12694f => _0x201f23.has(normalizeReference(_0x12694f?.ref)) || Array.isArray(_0x12694f?.appearances) && _0x12694f.appearances.some(_0x378021 => _0x201f23.has(normalizeReference(_0x378021?.ref))));
  return JSON.stringify({
    task: "repair_story_episode_split_clips",
    schemaVersion: schemaVersion,
    episode: {
      ref: normalizeReference(draft?.episodeRef),
      title: normalizeText(episode?.title),
      synopsis: normalizeText(episode?.synopsis)
    },
    constraints: constraints,
    assets: _0x1f65d6.length ? _0x1f65d6 : assets,
    failedClips: _0x186530.map(_0x36119d => ({
      sourceIndex: _0x36119d.sourceIndex,
      sourceClipRef: _0x36119d.sourceClipRef,
      rejectionReason: normalizeText(_0x36119d?.error?.message),
      ...(_0x36119d?.error?.validationDetails ? {
        validationDetails: _0x36119d.error.validationDetails
      } : {}),
      rejectedClips: _0x36119d.rawClips
    })),
    instruction: ["只修复 failedClips，不要重新生成整集，也不要改写已经通过校验的片段。", "每个 clip 都会独立提交给视频模型，模型看不到其他 clip；每个 clip 必须自包含地点、角色状态、动作起点、情绪和本片段内的镜头衔接。", "每个 clip 必须绑定一个且只能一个 scene 场景资产，至少一个 shot.assetUsages 必须引用其 assetRef 和 appearanceRef；换场时拆成新的 clip。", normalizeText(timingGuidance) + "修复后的分镜总时长在视频模型的 " + clipMaxSeconds + " 秒能力内。", normalizeText(dialogueSpeakerGuidance), normalizeText(groupingGuidance), ...(Array.isArray(timelineRequirements) ? timelineRequirements : []), "超限时依据完整动作节拍、对白轮次或情绪转折选择语义拆分点；允许重写分镜结构，并将一个失败片段重写成多个独立片段。", "禁止按时长均分、按 shots 数量对半切、直接复制失败文案，或遗漏、重复原剧情信息。", "不要返回 title；客户端会按最终顺序统一命名为“片段01”“片段02”等。", "每个 repairs 项必须逐字返回对应 sourceClipRef；只返回严格 JSON 对象。"].filter(Boolean).join("\n"),
    outputContract: continuousTimeline ? "episodeRef and repairs[{sourceClipRef,clips[{ref,script,creativeIntent,transition,shots[]{durationSec,startSec,endSec,assetUsages,visual,camera,dialogue,voiceover,audio}}]}]" : "episodeRef and repairs[{sourceClipRef,clips[{ref,script,creativeIntent,transition,shots[]{durationSec,assetUsages,visual,camera,dialogue,voiceover,audio}}]}]"
  });
}
export function applyStoryEpisodeSplitPartialRepairs(_0x45cc7f, _0x6c8d08 = {}, {
  parseReplacementClips: _0x2e63c2,
  serializeValidationError: _0x1ef088
} = {}) {
  const _0x11e742 = normalizeReference(_0x45cc7f?.episodeRef, _0x6c8d08?.episodeRef);
  if (_0x11e742 !== _0x6c8d08?.episodeRef) {
    throw new Error("Agent 返回的局部修复结果与当前分集不一致。");
  }
  const _0x3bceda = new Map();
  (Array.isArray(_0x45cc7f?.repairs) ? _0x45cc7f.repairs : []).forEach(_0x2d730a => {
    const _0x4d7d77 = normalizeReference(_0x2d730a?.sourceClipRef);
    if (_0x4d7d77 && !_0x3bceda.has(_0x4d7d77)) {
      _0x3bceda.set(_0x4d7d77, _0x2d730a);
    }
  });
  const _0xd861ca = (Array.isArray(_0x6c8d08?.items) ? _0x6c8d08.items : []).map(_0x2d9bc3 => {
    if (_0x2d9bc3?.status === "valid") {
      return _0x2d9bc3;
    }
    const _0x466817 = _0x3bceda.get(_0x2d9bc3.sourceClipRef);
    if (!_0x466817) {
      return {
        ..._0x2d9bc3,
        error: {
          message: "Agent 未返回失败片段“" + _0x2d9bc3.sourceClipRef + "”的修复结果。"
        }
      };
    }
    const _0x16ad5d = Array.isArray(_0x466817?.clips) ? _0x466817.clips : [];
    try {
      return {
        status: "valid",
        sourceIndex: _0x2d9bc3.sourceIndex,
        sourceClipRef: _0x2d9bc3.sourceClipRef,
        clips: _0x2e63c2(_0x16ad5d)
      };
    } catch (_0x25ccb8) {
      return {
        ..._0x2d9bc3,
        rawClips: _0x16ad5d,
        error: typeof _0x1ef088 === "function" ? _0x1ef088(_0x25ccb8, _0x2d9bc3) : {
          message: normalizeText(_0x25ccb8?.message || _0x25ccb8)
        }
      };
    }
  });
  const _0x432cf8 = new Set();
  const _0x2ff51d = _0xd861ca.map(_0x5e12d3 => {
    if (_0x5e12d3?.status !== "valid") {
      return _0x5e12d3;
    }
    const _0x2d1901 = (_0x5e12d3.clips || []).map(_0x2feff4 => _0x2feff4.ref).find(_0x5c7a54 => _0x432cf8.has(_0x5c7a54));
    if (_0x2d1901) {
      return {
        status: "invalid",
        sourceIndex: _0x5e12d3.sourceIndex,
        sourceClipRef: _0x5e12d3.sourceClipRef,
        rawClips: _0x5e12d3.clips,
        error: {
          message: "Agent 返回了重复的片段引用“" + _0x2d1901 + "”。"
        }
      };
    }
    (_0x5e12d3.clips || []).forEach(_0x26c376 => _0x432cf8.add(_0x26c376.ref));
    return _0x5e12d3;
  });
  return {
    ..._0x6c8d08,
    items: _0x2ff51d,
    attempts: Math.max(1, Math.trunc(Number(_0x6c8d08?.attempts) || 1)) + 1
  };
}
export function appendStoryEpisodeSplitPartialRepairFailure(_0x3e7d1f = {}, _0x13b7ba) {
  const _0x25e4ac = normalizeText(_0x13b7ba?.message || _0x13b7ba) || "局部修复返回无法解析。";
  return {
    ..._0x3e7d1f,
    items: (Array.isArray(_0x3e7d1f?.items) ? _0x3e7d1f.items : []).map(_0x1cca6d => _0x1cca6d?.status === "valid" ? _0x1cca6d : {
      ..._0x1cca6d,
      error: {
        ..._0x1cca6d?.error,
        message: (normalizeText(_0x1cca6d?.error?.message) || "片段仍需修复。") + "；局部修复失败：" + _0x25e4ac
      }
    }),
    attempts: Math.max(1, Math.trunc(Number(_0x3e7d1f?.attempts) || 1)) + 1
  };
}