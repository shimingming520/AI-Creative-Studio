import { generateText } from "../aiTextApi.js";
import { parseStrictJson } from "../utils/strictJson.js";
import { invokeStoryGenerationRequest } from "./storyInvocationEvidence.js";
import { buildStoryTextProviderProfilePayload, getResultText } from "./storyTextRequest.js";
import { STORY_MAX_SPOKEN_UNITS_PER_SECOND, normalizeStoryEpisodeSpokenTiming } from "./storyEpisodeSpokenTiming.js";
export const STORY_EPISODE_SPLIT_QUALITY_SCHEMA_VERSION = 3;
export const STORY_EPISODE_SPLIT_QUALITY_BATCH_SIZE = 10;
const MAX_SOURCE_CHARACTERS = 36000;
const MAX_OUTPUT_TOKENS = 12000;
const REQUEST_TIMEOUT_MS = 480000;
const MAX_SPOKEN_UNITS_PER_SECOND = STORY_MAX_SPOKEN_UNITS_PER_SECOND;
const BLOCKING_LOCAL_SIGNAL_CODES = new Set(["duration_sum_mismatch", "dialogue_timing_suspicious"]);
const REVIEW_SYSTEM_PROMPT = ["你是短剧分镜成片前的独立审片员。你的任务是发现具体片段的问题，不是重新规划整集。", "片段数量和整集总时长没有固定正确值，绝不能因为片段多、片段少、整集长或整集短而判失败。", "时长必须按当前剧本内容判断：对白能否自然说完、动作是否能完成、情绪停顿和镜头调度是否有足够时间。", "只根据给出的原剧本、候选片段和邻接关系判定；没有明确问题就通过。只返回严格 JSON。"].join("\n");
function normalizeText(_0x1c9c17) {
  return String(_0x1c9c17 || "").trim();
}
function cloneJson(_0x10c593) {
  if (_0x10c593 == null) {
    return _0x10c593;
  }
  return JSON.parse(JSON.stringify(_0x10c593));
}
function stableSerialize(_0x4da275) {
  if (Array.isArray(_0x4da275)) {
    return "[" + _0x4da275.map(stableSerialize).join(",") + "]";
  }
  if (_0x4da275 && typeof _0x4da275 === "object") {
    return "{" + Object.keys(_0x4da275).sort().map(_0x4e3e3d => JSON.stringify(_0x4e3e3d) + ":" + stableSerialize(_0x4da275[_0x4e3e3d])).join(",") + "}";
  }
  return JSON.stringify(_0x4da275 ?? null);
}
function fingerprint(_0x3273d1) {
  const _0x3ddcbf = stableSerialize(_0x3273d1);
  let _0x156819 = 2166136261;
  for (let _0x52e99f = 0; _0x52e99f < _0x3ddcbf.length; _0x52e99f += 1) {
    _0x156819 ^= _0x3ddcbf.charCodeAt(_0x52e99f);
    _0x156819 = Math.imul(_0x156819, 16777619);
  }
  return "fnv1a-" + (_0x156819 >>> 0).toString(16).padStart(8, "0");
}
function getEpisodeRef(_0x1ce13b = {}, _0x49c9dc = {}) {
  return normalizeText(_0x49c9dc?.episodeRef || _0x1ce13b?.ref || _0x1ce13b?.planningRef || _0x1ce13b?.id) || "episode-1";
}
function getEpisodeSource(_0x42c129 = {}) {
  const _0x5b171f = normalizeText(_0x42c129?.script?.fullText);
  if (_0x5b171f) {
    return _0x5b171f.slice(0, MAX_SOURCE_CHARACTERS);
  }
  return (Array.isArray(_0x42c129?.script?.scenes) ? _0x42c129.script.scenes : []).map(_0x35a75a => [_0x35a75a?.heading, _0x35a75a?.body].map(normalizeText).filter(Boolean).join("\n")).filter(Boolean).join("\n\n").slice(0, MAX_SOURCE_CHARACTERS);
}
function getSpokenText(_0x16714 = {}) {
  return [_0x16714?.dialogue, _0x16714?.voiceover].map(normalizeText).filter(Boolean).join(" ");
}
function countCjkAndWords(_0x3ee504) {
  const _0x1f16ed = normalizeText(_0x3ee504).replace(/^[^：:\n]{1,20}[：:]/u, "").replace(/[“”"'‘’。，、！？!?；;：:\s…—-]/gu, "");
  const _0x591111 = (_0x1f16ed.match(/[\p{Script=Han}]/gu) || []).length;
  const _0x3edeaf = (_0x1f16ed.match(/[A-Za-z0-9]+/g) || []).length;
  return _0x591111 + _0x3edeaf;
}
export function inspectStoryEpisodeSplitLocalSignals({
  clips = []
} = {}) {
  const _0x31ba7a = [];
  (Array.isArray(clips) ? clips : []).forEach(_0x61ce62 => {
    const _0x3fe54c = normalizeText(_0x61ce62?.ref);
    const _0x5b78e1 = Array.isArray(_0x61ce62?.shots) ? _0x61ce62.shots : [];
    const _0x670b1 = _0x5b78e1.reduce((_0x23c5d4, _0x1ab642) => _0x23c5d4 + Math.max(0, Number(_0x1ab642?.durationSec) || 0), 0);
    const _0x37599b = Math.max(0, Number(_0x61ce62?.durationSec) || 0);
    if (Math.abs(_0x670b1 - _0x37599b) > 0.11) {
      _0x31ba7a.push({
        clipRef: _0x3fe54c,
        code: "duration_sum_mismatch",
        message: "片段时长 " + _0x37599b + " 秒与镜头合计 " + Number(_0x670b1.toFixed(1)) + " 秒不一致"
      });
    }
    _0x5b78e1.forEach((_0x2c306a, _0x54fdce) => {
      const _0x127099 = getSpokenText(_0x2c306a);
      const _0x20d34c = countCjkAndWords(_0x127099);
      const _0x4cc5fa = Math.max(0, Number(_0x2c306a?.durationSec) || 0);
      const _0x437379 = _0x4cc5fa ? _0x20d34c / _0x4cc5fa : 0;
      if (_0x20d34c >= 8 && _0x437379 > MAX_SPOKEN_UNITS_PER_SECOND) {
        _0x31ba7a.push({
          clipRef: _0x3fe54c,
          shotIndex: _0x54fdce,
          code: "dialogue_timing_suspicious",
          message: "镜头 " + (_0x54fdce + 1) + " 约 " + Number(_0x437379.toFixed(1)) + " 字/词每秒，需结合语气与表演复核"
        });
      }
    });
  });
  return _0x31ba7a;
}
function getBlockingStoryEpisodeSplitLocalSignals(_0x2a782f = []) {
  return (Array.isArray(_0x2a782f) ? _0x2a782f : []).filter(_0x2cbdf3 => BLOCKING_LOCAL_SIGNAL_CODES.has(normalizeText(_0x2cbdf3?.code)));
}
function getStoryEpisodeSplitLocalRepairInstruction(_0x558b0e = {}) {
  if (_0x558b0e?.code === "dialogue_timing_suspicious") {
    return "拆成足够多个连续片段或镜头，为完整对白保留自然说话时间；禁止删改对白或依靠高速口播。";
  } else {
    return "修正片段与镜头的时长分项，使片段总时长等于全部镜头时长之和。";
  }
}
function applyBlockingLocalSignalsToAssessments(_0x2f76a5 = [], _0x148f12 = []) {
  const _0xd132d1 = new Map();
  getBlockingStoryEpisodeSplitLocalSignals(_0x148f12).forEach(_0x20e988 => {
    const _0x2aadd2 = normalizeText(_0x20e988?.clipRef);
    if (!_0x2aadd2) {
      return;
    }
    const _0x20fe8a = _0xd132d1.get(_0x2aadd2) || [];
    _0x20fe8a.push(_0x20e988);
    _0xd132d1.set(_0x2aadd2, _0x20fe8a);
  });
  return _0x2f76a5.map(_0xfc08ee => {
    const _0x3fb945 = _0xd132d1.get(normalizeText(_0xfc08ee?.clipRef)) || [];
    if (!_0x3fb945.length) {
      return _0xfc08ee;
    }
    const _0x3b8f8d = Array.isArray(_0xfc08ee?.issues) ? [..._0xfc08ee.issues] : [];
    _0x3fb945.forEach(_0x16509c => {
      const _0x461e93 = normalizeText(_0x16509c?.message);
      if (_0x3b8f8d.some(_0x26a810 => _0x26a810?.code === _0x16509c.code && _0x26a810?.reason === _0x461e93)) {
        return;
      }
      _0x3b8f8d.push({
        code: normalizeText(_0x16509c?.code),
        reason: _0x461e93,
        repairInstruction: getStoryEpisodeSplitLocalRepairInstruction(_0x16509c)
      });
    });
    return {
      ..._0xfc08ee,
      verdict: "repair",
      issues: _0x3b8f8d
    };
  });
}
function assertStoryEpisodeSplitLocalTiming(_0xb02dcc = []) {
  const _0x2a29de = getBlockingStoryEpisodeSplitLocalSignals(inspectStoryEpisodeSplitLocalSignals({
    clips: _0xb02dcc
  }));
  if (!_0x2a29de.length) {
    return _0xb02dcc;
  }
  throw new Error(_0x2a29de.map(_0x4f7528 => normalizeText(_0x4f7528?.message)).filter(Boolean).join("；"));
}
function getStoryEpisodeSplitSpokenTimingBudget(_0x57851f = {}, _0x2bd1df = 0) {
  const _0x3bdcd6 = (Array.isArray(_0x57851f?.shots) ? _0x57851f.shots : []).reduce((_0x52f190, _0x52b09c) => _0x52f190 + countCjkAndWords([normalizeText(_0x52b09c?.dialogue), normalizeText(_0x52b09c?.voiceover)].filter(Boolean).join("\n")), 0);
  if (!_0x3bdcd6) {
    return null;
  }
  const _0x8d933b = Math.ceil(_0x3bdcd6 / MAX_SPOKEN_UNITS_PER_SECOND * 10) / 10;
  return {
    spokenUnits: _0x3bdcd6,
    maxSpokenUnitsPerSecond: MAX_SPOKEN_UNITS_PER_SECOND,
    minimumSpokenDurationSeconds: _0x8d933b,
    minimumClipCountForSpokenContent: _0x2bd1df ? Math.max(1, Math.ceil(_0x8d933b / _0x2bd1df)) : 1
  };
}
function compactClip(_0x907445 = {}) {
  return {
    ref: normalizeText(_0x907445.ref),
    script: normalizeText(_0x907445.script),
    durationSec: Number(_0x907445.durationSec) || 0,
    shots: (Array.isArray(_0x907445.shots) ? _0x907445.shots : []).map((_0x21fde2, _0x3f6f31) => ({
      index: _0x3f6f31 + 1,
      durationSec: Number(_0x21fde2?.durationSec) || 0,
      assetUsages: Array.isArray(_0x21fde2?.assetUsages) ? _0x21fde2.assetUsages : [],
      assetRefs: Array.isArray(_0x21fde2?.assetRefs) ? _0x21fde2.assetRefs : [],
      visual: normalizeText(_0x21fde2?.visual),
      camera: normalizeText(_0x21fde2?.camera),
      dialogue: normalizeText(_0x21fde2?.dialogue),
      voiceover: normalizeText(_0x21fde2?.voiceover),
      audio: normalizeText(_0x21fde2?.audio)
    }))
  };
}
function compactAssets(_0xe1b5e8 = [], _0x23f31a = [], _0x18c6d6 = "") {
  const _0x14eeb5 = new Set(_0x23f31a.flatMap(_0x946161 => Array.isArray(_0x946161?.assetRefs) ? _0x946161.assetRefs : []));
  const _0x34a38f = normalizeText(_0x18c6d6);
  return (Array.isArray(_0xe1b5e8) ? _0xe1b5e8 : []).filter(_0x1a023f => _0x14eeb5.has(normalizeText(_0x1a023f?.ref)) || _0x34a38f.includes(normalizeText(_0x1a023f?.ref)) || _0x34a38f.includes(normalizeText(_0x1a023f?.name))).map(_0x42f5f2 => ({
    ref: normalizeText(_0x42f5f2?.ref),
    name: normalizeText(_0x42f5f2?.name),
    kind: normalizeText(_0x42f5f2?.kind),
    description: normalizeText(_0x42f5f2?.description),
    occurrences: normalizeText(_0x42f5f2?.occurrences),
    sourceChapterIds: (Array.isArray(_0x42f5f2?.sourceChapterIds) ? _0x42f5f2.sourceChapterIds : []).map(normalizeText).filter(Boolean),
    appearances: (Array.isArray(_0x42f5f2?.appearances) ? _0x42f5f2.appearances : []).map(_0xe25651 => ({
      ref: normalizeText(_0xe25651?.ref),
      name: normalizeText(_0xe25651?.name),
      description: normalizeText(_0xe25651?.description),
      occurrences: normalizeText(_0xe25651?.occurrences),
      sourceChapterIds: (Array.isArray(_0xe25651?.sourceChapterIds) ? _0xe25651.sourceChapterIds : []).map(normalizeText).filter(Boolean)
    }))
  }));
}
function createBatches(_0x532139, _0x5cfc38) {
  const _0x4ec6f3 = [];
  for (let _0x41e1a6 = 0; _0x41e1a6 < _0x532139.length; _0x41e1a6 += _0x5cfc38) {
    const _0x1e3b6d = _0x532139.slice(_0x41e1a6, _0x41e1a6 + _0x5cfc38);
    _0x4ec6f3.push({
      ref: "quality-batch-" + (_0x4ec6f3.length + 1),
      startIndex: _0x41e1a6,
      clipRefs: _0x1e3b6d.map(_0x3bae9e => _0x3bae9e.ref)
    });
  }
  return _0x4ec6f3;
}
function normalizeAssessment(_0x2cf56e, _0x51e0d4) {
  const _0x5759f0 = (Array.isArray(_0x2cf56e?.issues) ? _0x2cf56e.issues : []).map(_0x2e4d86 => ({
    code: normalizeText(_0x2e4d86?.code) || "other",
    reason: normalizeText(_0x2e4d86?.reason),
    repairInstruction: normalizeText(_0x2e4d86?.repairInstruction)
  })).filter(_0x2a8566 => _0x2a8566.reason || _0x2a8566.repairInstruction);
  const _0x4643b8 = _0x2cf56e?.verdict === "repair" && _0x5759f0.length ? "repair" : "pass";
  return {
    clipRef: _0x51e0d4,
    verdict: _0x4643b8,
    issues: _0x4643b8 === "repair" ? _0x5759f0 : []
  };
}
function parseReviewResponse(_0x2be240, {
  episodeRef: _0x3363da,
  batchRef: _0x3ddacd,
  clipRefs: _0x234370
}) {
  const _0xa323e1 = parseStrictJson(getResultText(_0x2be240), "审片 Agent 未返回有效 JSON。");
  if (normalizeText(_0xa323e1?.episodeRef) !== _0x3363da) {
    throw new Error("审片结果与当前分集不一致。");
  }
  if (normalizeText(_0xa323e1?.batchRef) !== _0x3ddacd) {
    throw new Error("审片结果与当前批次不一致。");
  }
  const _0xb6e205 = new Map((Array.isArray(_0xa323e1?.assessments) ? _0xa323e1.assessments : []).map(_0x6d7c57 => [normalizeText(_0x6d7c57?.clipRef), _0x6d7c57]));
  const _0x5cddbd = [..._0xb6e205.keys()].find(_0x4f22a8 => !_0x234370.includes(_0x4f22a8));
  if (_0x5cddbd) {
    throw new Error("审片结果包含当前批次之外的片段 " + _0x5cddbd + "。");
  }
  return _0x234370.map(_0x23aaa2 => {
    if (!_0xb6e205.has(_0x23aaa2)) {
      throw new Error("审片结果遗漏片段 " + _0x23aaa2 + "。");
    }
    return normalizeAssessment(_0xb6e205.get(_0x23aaa2), _0x23aaa2);
  });
}
function buildReviewPrompt({
  episodeRef: _0x3150f6,
  episode: _0x4229f1,
  batchRef: _0x48155d,
  clips: _0x4157d2,
  neighboringClips: _0x1921bb,
  assets: _0x117e6a,
  localSignals: _0x3f2261,
  phase: _0x1bc1be,
  constraints: _0x119e9b
}) {
  const _0x44a5c6 = Math.max(0, Number(_0x119e9b?.sceneMaxSeconds) || 0);
  return JSON.stringify({
    task: "review_story_episode_split_quality",
    schemaVersion: STORY_EPISODE_SPLIT_QUALITY_SCHEMA_VERSION,
    phase: _0x1bc1be,
    episodeRef: _0x3150f6,
    batchRef: _0x48155d,
    episode: {
      title: normalizeText(_0x4229f1?.title),
      synopsis: normalizeText(_0x4229f1?.synopsis),
      sourceScript: getEpisodeSource(_0x4229f1)
    },
    clips: _0x4157d2.map(compactClip),
    neighboringClips: _0x1921bb.map(compactClip),
    assets: compactAssets(_0x117e6a, [..._0x4157d2, ..._0x1921bb]),
    localSignals: _0x3f2261,
    productionLimits: {
      maxClipDurationSeconds: _0x44a5c6
    },
    criteria: ["逐项核对原剧本信息是否遗漏、重复、乱序或被改写成相反含义。", "对白必须与原文一致；按人物语气、停顿和表演判断镜头时间是否足够，不使用固定字数公式直接定罪。", "动作、情绪反应和运镜必须能在各镜头 durationSec 内自然完成；一个镜头需要 15 秒时，15 秒就是正确的。", "检查相邻片段的地点、人物状态、道具、动作起止和视线是否连续。", "检查画面、摄影、声音和资产引用是否与当前剧情一致且可执行。", "人物资产只应绑定画面中实际可见的角色；仅在对白、语音、电话、名单、记录、照片文字或他人口述中被提及的人物，不得作为出镜人物资产绑定。", "人物已在前一片段或前一镜头明确离场时，后续镜头不得继续绑定其人物资产，除非原剧本明确让其重新入镜。", "选择 appearanceRef 时必须核对形象的 description、occurrences 与 sourceChapterIds，尤其区分回忆、当前时间、受伤和换装状态。", _0x44a5c6 ? "单个片段不得超过 " + _0x44a5c6 + " 秒；需要更多时间时，修复建议必须要求拆成多个连续片段，禁止建议把单片段延长到上限之外。" : "如果当前任务没有单片段时长上限，按剧情实际需要判断。", "禁止以片段数量或整集总时长作为问题；只点名有明确证据的片段。"],
    outputContract: "episodeRef,batchRef,assessments[{clipRef,verdict:'pass'|'repair',issues[{code,reason,repairInstruction}]}]；每个输入片段恰好返回一次"
  });
}
function getNeighboringClips(_0x8a5937, _0x5b323f, _0x225611, _0x18aa0c = new Map()) {
  const _0x46e1ea = (_0x22f0cb, _0x5717fd) => {
    if (!_0x22f0cb) {
      return null;
    }
    const _0x45b26a = _0x18aa0c.get(normalizeText(_0x22f0cb.ref));
    if (!Array.isArray(_0x45b26a) || !_0x45b26a.length) {
      return _0x22f0cb;
    }
    if (_0x5717fd === "left") {
      return _0x45b26a.at(-1);
    } else {
      return _0x45b26a[0];
    }
  };
  return [_0x46e1ea(_0x5b323f > 0 ? _0x8a5937[_0x5b323f - 1] : null, "left"), _0x46e1ea(_0x5b323f + _0x225611 < _0x8a5937.length ? _0x8a5937[_0x5b323f + _0x225611] : null, "right")].filter(Boolean);
}
function buildRepairPrompt({
  episodeRef: _0x418617,
  episode: _0xbbb7b4,
  failedClips: _0x39a7bb,
  assessments: _0x3f9393,
  neighbors: _0x59ecd3,
  assets: _0x16e305,
  constraints: _0x5b37a0,
  repairRound = 1,
  previousErrorsByRef = {},
  previousClipsByRef = {}
}) {
  const _0x5dcb08 = new Map(_0x3f9393.map(_0x2d06cc => [_0x2d06cc.clipRef, _0x2d06cc]));
  const _0x46cf93 = Math.max(0, Number(_0x5b37a0?.sceneMaxSeconds) || 0);
  const _0xb8cacd = Object.values(previousClipsByRef || {}).flatMap(_0x9db289 => Array.isArray(_0x9db289) ? _0x9db289 : []);
  return JSON.stringify({
    task: "repair_story_episode_split_quality",
    schemaVersion: STORY_EPISODE_SPLIT_QUALITY_SCHEMA_VERSION,
    episodeRef: _0x418617,
    repairRound: repairRound,
    episode: {
      title: normalizeText(_0xbbb7b4?.title),
      sourceScript: getEpisodeSource(_0xbbb7b4)
    },
    failedClips: _0x39a7bb.map(_0x733f86 => {
      const _0x1c3c15 = getStoryEpisodeSplitSpokenTimingBudget(_0x733f86, _0x46cf93);
      return {
        sourceClipRef: _0x733f86.ref,
        issues: _0x5dcb08.get(_0x733f86.ref)?.issues || [],
        ...(_0x1c3c15 ? {
          timingBudget: _0x1c3c15
        } : {}),
        ...(normalizeText(previousErrorsByRef?.[_0x733f86.ref]) ? {
          previousAttemptError: normalizeText(previousErrorsByRef[_0x733f86.ref])
        } : {}),
        ...(Array.isArray(previousClipsByRef?.[_0x733f86.ref]) ? {
          previousAttemptClips: previousClipsByRef[_0x733f86.ref].map(compactClip)
        } : {}),
        clip: compactClip(_0x733f86)
      };
    }),
    readOnlyNeighboringClips: _0x59ecd3.map(compactClip),
    assets: compactAssets(_0x16e305, [..._0x39a7bb, ..._0xb8cacd, ..._0x59ecd3], JSON.stringify(_0x3f9393)),
    productionLimits: {
      maxClipDurationSeconds: _0x46cf93,
      maxSpokenUnitsPerSecond: MAX_SPOKEN_UNITS_PER_SECOND
    },
    instruction: ["只修复 failedClips，禁止返回或改写已经通过的片段。", "修复依据是原剧本与审片问题；时长按对白、动作、情绪和镜头实际需要重新分配。", "完整保留原片段中仍然有效的 assetUsages 与 appearanceRef；新增人物时必须从 assets.appearances 选择其具体形象。", "只给画面中实际可见的人物绑定人物资产；仅通过语音、电话、名单、记录、文字或他人口述被提及，或已经明确离场的人物，必须移除其人物资产引用。", "必须根据 assets.appearances 的 description、occurrences 与 sourceChapterIds 选择符合当前时间线和状态的 appearanceRef，禁止猜测不存在的形象 ID。", "一个失败片段可重写为一个或多个片段；若拆分，使用 sourceClipRef-part-1、sourceClipRef-part-2 等唯一 ref。", repairRound > 1 ? "这是定点重试。必须先解决 failedClips.previousAttemptError 指出的上一轮校验或复审错误，禁止原样重复上一轮结果。" : "这是第一轮定点修复。", _0x46cf93 ? "每个修复后片段不得超过 " + _0x46cf93 + " 秒；内容需要更长时间时必须拆分，禁止用超限延长解决。" : "当前任务未设置单片段时长上限。", "对白与旁白必须满足每个镜头不超过 " + MAX_SPOKEN_UNITS_PER_SECOND + " 字/词每秒。failedClips.timingBudget 是只计算说话内容得到的最低时间与最低片段数；动作、停顿和反应还应在此基础上增加时间。", "保留原对白文字、剧情顺序和资产真实性。只返回严格 JSON。"],
    outputContract: "episodeRef,repairs[{sourceClipRef,clips[{ref,script,creativeIntent,transition,shots[{durationSec,assetUsages,assetRefs,visual,camera,dialogue,voiceover,audio}],durationSec,assetRefs}]}]"
  });
}
function parseRepairResponse(_0x34aa44, {
  episodeRef: _0x46b9b4,
  failedClipRefs: _0x4b5492
}) {
  const _0x5287c1 = parseStrictJson(getResultText(_0x34aa44), "修复 Agent 未返回有效 JSON。");
  if (normalizeText(_0x5287c1?.episodeRef) !== _0x46b9b4) {
    throw new Error("修复结果与当前分集不一致。");
  }
  const _0x159234 = new Map();
  (Array.isArray(_0x5287c1?.repairs) ? _0x5287c1.repairs : []).forEach(_0x5ec5ba => {
    const _0x581241 = normalizeText(_0x5ec5ba?.sourceClipRef);
    if (!_0x4b5492.includes(_0x581241) || _0x159234.has(_0x581241)) {
      return;
    }
    _0x159234.set(_0x581241, Array.isArray(_0x5ec5ba?.clips) ? _0x5ec5ba.clips : []);
  });
  return _0x159234;
}
function normalizeResumeDraft(_0x596dc3, {
  episodeRef: _0x272fce,
  candidateFingerprint: _0x14d832,
  batches: _0x4235ce
}) {
  if (!_0x596dc3 || Number(_0x596dc3.schemaVersion) !== STORY_EPISODE_SPLIT_QUALITY_SCHEMA_VERSION || normalizeText(_0x596dc3.episodeRef) !== _0x272fce || normalizeText(_0x596dc3.candidateFingerprint) !== _0x14d832) {
    return null;
  }
  const _0x5afc1e = new Map((Array.isArray(_0x596dc3.batches) ? _0x596dc3.batches : []).map(_0x528a10 => [_0x528a10.ref, _0x528a10]));
  return {
    ...cloneJson(_0x596dc3),
    batches: _0x4235ce.map(_0x336282 => ({
      ..._0x336282,
      ...(cloneJson(_0x5afc1e.get(_0x336282.ref)) || {})
    }))
  };
}
function createDraft({
  episodeRef: _0x5d9177,
  candidateFingerprint: _0x4af039,
  batches: _0x2f71f5
}) {
  const _0x22ece8 = Date.now();
  return {
    schemaVersion: STORY_EPISODE_SPLIT_QUALITY_SCHEMA_VERSION,
    episodeRef: _0x5d9177,
    candidateFingerprint: _0x4af039,
    status: "reviewing",
    batches: _0x2f71f5.map(_0x25b160 => ({
      ..._0x25b160,
      status: "pending"
    })),
    requestCount: 0,
    unresolvedClipRefs: [],
    completedClips: null,
    createdAt: _0x22ece8,
    updatedAt: _0x22ece8
  };
}
function createQualityReviewSummary(_0x4f382e = {}) {
  const _0x3a6646 = Array.isArray(_0x4f382e.unresolvedClipRefs) ? _0x4f382e.unresolvedClipRefs : [];
  const _0x1a21f7 = new Set(_0x3a6646);
  const _0x481f57 = (Array.isArray(_0x4f382e.batches) ? _0x4f382e.batches : []).flatMap(_0x20e369 => (Array.isArray(_0x20e369?.clipRefs) ? _0x20e369.clipRefs : []).filter(_0x3e65e0 => _0x1a21f7.has(_0x3e65e0)).map(_0xc0f4e4 => ({
    clipRef: _0xc0f4e4,
    issues: cloneJson((Array.isArray(_0x20e369?.assessments) ? _0x20e369.assessments : []).find(_0x31ce03 => _0x31ce03?.clipRef === _0xc0f4e4)?.issues || []),
    error: normalizeText(_0x20e369?.repairErrors?.[_0xc0f4e4] || _0x20e369?.repairError || _0x20e369?.error)
  })));
  return {
    status: _0x3a6646.length ? "completed_with_unresolved" : "passed",
    requestCount: Math.max(0, Number(_0x4f382e.requestCount) || 0),
    unresolvedClipRefs: cloneJson(_0x3a6646),
    unresolvedItems: _0x481f57
  };
}
export async function reviewStoryEpisodeSplitQuality({
  project = {},
  episode = {},
  result = {},
  assets = [],
  constraints = {},
  model = "",
  provider = "",
  providerProfileId = "",
  request = generateText,
  validateClips = ({
    clips: _0xca2689
  }) => _0xca2689,
  onProgress = null,
  onCheckpoint = null,
  onInvocation = null,
  resumeDraft = null,
  batchSize = STORY_EPISODE_SPLIT_QUALITY_BATCH_SIZE
} = {}) {
  const _0x18e43c = Array.isArray(result?.clips) ? result.clips : [];
  if (!_0x18e43c.length) {
    throw new Error("没有可审片的分镜片段。");
  }
  const _0x593f9 = new Map(_0x18e43c.map((_0x37ad7f, _0x5b7e93) => [normalizeText(_0x37ad7f?.ref), _0x5b7e93]));
  const _0x31cdb6 = _0x3a5f3a => [..._0x3a5f3a].sort((_0x39eea3, _0x47b71a) => (_0x593f9.get(_0x39eea3) ?? Number.MAX_SAFE_INTEGER) - (_0x593f9.get(_0x47b71a) ?? Number.MAX_SAFE_INTEGER));
  const _0x423e63 = getEpisodeRef(episode, result);
  const _0x2dc78f = Math.max(1, Math.min(20, Math.trunc(Number(batchSize) || 10)));
  const _0x20f367 = createBatches(_0x18e43c, _0x2dc78f);
  const _0x380620 = fingerprint({
    episodeRef: _0x423e63,
    clips: _0x18e43c
  });
  let _0x8d8b30 = normalizeResumeDraft(resumeDraft, {
    episodeRef: _0x423e63,
    candidateFingerprint: _0x380620,
    batches: _0x20f367
  }) || createDraft({
    episodeRef: _0x423e63,
    candidateFingerprint: _0x380620,
    batches: _0x20f367
  });
  if (_0x8d8b30.status === "completed" && Array.isArray(_0x8d8b30.completedClips)) {
    return {
      ...result,
      clips: cloneJson(_0x8d8b30.completedClips),
      qualityReview: createQualityReviewSummary(_0x8d8b30)
    };
  }
  const _0x135dcc = new Map();
  _0x8d8b30.batches.forEach(_0x4a3f6a => {
    Object.entries(_0x4a3f6a?.replacements || {}).forEach(([_0x1f058d, _0x220ddf]) => {
      _0x135dcc.set(_0x1f058d, cloneJson(_0x220ddf));
    });
  });
  const _0x4b03fd = new Set(_0x8d8b30.unresolvedClipRefs || []);
  let _0x2154a1 = Math.max(0, Number(_0x8d8b30.requestCount) || 0);
  const _0x1e3be5 = async () => {
    _0x8d8b30.updatedAt = Date.now();
    _0x8d8b30.requestCount = _0x2154a1;
    _0x8d8b30.unresolvedClipRefs = _0x31cdb6(_0x4b03fd);
    await onCheckpoint?.(cloneJson(_0x8d8b30));
  };
  const _0x5b0522 = async (_0x3c444c, _0x3f9901) => {
    _0x2154a1 += 1;
    return invokeStoryGenerationRequest({
      request: request,
      requestPayload: {
        model: normalizeText(model),
        provider: normalizeText(provider),
        ...buildStoryTextProviderProfilePayload(providerProfileId),
        ..._0x3c444c,
        thinking: {
          type: "disabled"
        },
        temperature: 0.1,
        maxOutputTokens: MAX_OUTPUT_TOKENS,
        timeoutMs: REQUEST_TIMEOUT_MS
      },
      stepId: _0x3f9901,
      attempt: _0x2154a1,
      onInvocation: onInvocation,
      serializeResponse: getResultText
    });
  };
  for (let _0x2bb770 = 0; _0x2bb770 < _0x8d8b30.batches.length; _0x2bb770 += 1) {
    const _0x360807 = _0x8d8b30.batches[_0x2bb770];
    if (_0x360807.status === "completed") {
      continue;
    }
    const _0x148964 = _0x18e43c.slice(_0x360807.startIndex, _0x360807.startIndex + _0x360807.clipRefs.length);
    const _0x171b02 = getNeighboringClips(_0x18e43c, _0x360807.startIndex, _0x148964.length, _0x135dcc);
    const _0x2bc6f9 = inspectStoryEpisodeSplitLocalSignals({
      clips: _0x148964
    });
    onProgress?.({
      stage: "reviewing-episode-split-quality",
      current: _0x2bb770 + 1,
      total: _0x8d8b30.batches.length,
      message: "正在审片 " + (_0x2bb770 + 1) + "/" + _0x8d8b30.batches.length + "，检查剧情、时长与连续性"
    });
    let _0x1aa3d1 = _0x360807.status === "reviewed" && Array.isArray(_0x360807.assessments) ? _0x360807.assessments : null;
    try {
      if (!_0x1aa3d1) {
        const _0x222e4c = await _0x5b0522({
          prompt: buildReviewPrompt({
            episodeRef: _0x423e63,
            episode: episode,
            batchRef: _0x360807.ref,
            clips: _0x148964,
            neighboringClips: _0x171b02,
            assets: assets,
            localSignals: _0x2bc6f9,
            phase: "initial-review",
            constraints: constraints
          }),
          systemPrompt: REVIEW_SYSTEM_PROMPT
        }, "quality-review:" + _0x360807.ref);
        _0x1aa3d1 = applyBlockingLocalSignalsToAssessments(parseReviewResponse(_0x222e4c, {
          episodeRef: _0x423e63,
          batchRef: _0x360807.ref,
          clipRefs: _0x360807.clipRefs
        }), _0x2bc6f9);
        _0x360807.assessments = _0x1aa3d1;
        _0x360807.status = "reviewed";
        await _0x1e3be5();
      }
    } catch (_0x16f842) {
      _0x360807.status = "completed";
      _0x360807.error = normalizeText(_0x16f842?.message || _0x16f842);
      _0x360807.clipRefs.forEach(_0x4ddaa6 => _0x4b03fd.add(_0x4ddaa6));
      await _0x1e3be5();
      continue;
    }
    const _0x4fae26 = _0x1aa3d1.filter(_0x249af9 => _0x249af9.verdict === "repair").map(_0x4babd3 => _0x4babd3.clipRef);
    if (!_0x4fae26.length) {
      _0x360807.status = "completed";
      _0x360807.replacements = {};
      await _0x1e3be5();
      continue;
    }
    const _0x57edba = _0x148964.filter(_0x38244e => _0x4fae26.includes(_0x38244e.ref));
    onProgress?.({
      stage: "repairing-episode-split-quality",
      current: _0x2bb770 + 1,
      total: _0x8d8b30.batches.length,
      message: "正在定点修复 " + _0x57edba.length + " 个未通过片段"
    });
    try {
      const _0x5685b8 = await _0x5b0522({
        prompt: buildRepairPrompt({
          episodeRef: _0x423e63,
          episode: episode,
          failedClips: _0x57edba,
          assessments: _0x1aa3d1,
          neighbors: _0x171b02,
          assets: assets,
          constraints: constraints
        }),
        systemPrompt: "你是分镜定点修复师。只处理被点名的失败片段，绝不改写已通过片段。只返回严格 JSON。"
      }, "quality-repair:" + _0x360807.ref);
      const _0x3f7c6d = parseRepairResponse(_0x5685b8, {
        episodeRef: _0x423e63,
        failedClipRefs: _0x4fae26
      });
      const _0x5e691d = new Map();
      const _0x523755 = {};
      const _0x375e6b = {};
      const _0x23fcc5 = async (_0x1af6d9, _0x4ea185) => {
        for (const _0x242d93 of _0x4ea185) {
          try {
            const _0x373f52 = _0x1af6d9.get(_0x242d93);
            if (!Array.isArray(_0x373f52) || !_0x373f52.length) {
              throw new Error("修复结果遗漏片段 " + _0x242d93 + "。");
            }
            _0x375e6b[_0x242d93] = cloneJson(_0x373f52);
            const _0x38f34f = await validateClips({
              episodeRef: _0x423e63,
              sourceClipRef: _0x242d93,
              clips: _0x373f52,
              project: project,
              episode: episode,
              assets: assets,
              constraints: constraints
            });
            if (!Array.isArray(_0x38f34f) || !_0x38f34f.length) {
              throw new Error("片段 " + _0x242d93 + " 的修复结果未通过本地结构校验。");
            }
            assertStoryEpisodeSplitLocalTiming(_0x38f34f);
            _0x5e691d.set(_0x242d93, _0x38f34f);
            delete _0x523755[_0x242d93];
            _0x4b03fd.delete(_0x242d93);
          } catch (_0x35297f) {
            _0x523755[_0x242d93] = normalizeText(_0x35297f?.message || _0x35297f);
            _0x4b03fd.add(_0x242d93);
          }
        }
      };
      const _0x5462dc = {};
      const _0x294065 = [];
      let _0x1f3a24 = [..._0x4fae26];
      let _0x40251a = _0x3f7c6d;
      let _0x5c4c5f = "initial";
      const _0x191e51 = 3;
      for (let _0x2d528a = 1; _0x2d528a <= _0x191e51 && _0x1f3a24.length; _0x2d528a += 1) {
        if (_0x2d528a > 1) {
          const _0x438cb2 = _0x57edba.filter(_0x73f4a7 => _0x1f3a24.includes(_0x73f4a7.ref));
          try {
            const _0x129074 = await _0x5b0522({
              prompt: buildRepairPrompt({
                episodeRef: _0x423e63,
                episode: episode,
                failedClips: _0x438cb2,
                assessments: _0x1aa3d1,
                neighbors: _0x171b02,
                assets: assets,
                constraints: constraints,
                repairRound: _0x2d528a,
                previousErrorsByRef: _0x523755,
                previousClipsByRef: _0x375e6b
              }),
              systemPrompt: "你是分镜定点修复师。根据上一轮精确错误只重修被点名的失败片段，绝不改写已通过片段。只返回严格 JSON。"
            }, "quality-repair:" + _0x360807.ref + ":round-" + _0x2d528a + ":" + _0x5c4c5f);
            _0x40251a = parseRepairResponse(_0x129074, {
              episodeRef: _0x423e63,
              failedClipRefs: _0x1f3a24
            });
          } catch (_0x5db02a) {
            const _0x29c566 = normalizeText(_0x5db02a?.message || _0x5db02a);
            _0x1f3a24.forEach(_0x2721ef => {
              _0x523755[_0x2721ef] = _0x29c566;
              _0x4b03fd.add(_0x2721ef);
            });
            break;
          }
        }
        _0x1f3a24.forEach(_0x45ac7c => _0x5e691d.delete(_0x45ac7c));
        await _0x23fcc5(_0x40251a, _0x1f3a24);
        const _0xef2fcb = _0x1f3a24.filter(_0x51788e => !_0x5e691d.has(_0x51788e));
        const _0x36fe97 = _0x1f3a24.filter(_0x45ac64 => _0x5e691d.has(_0x45ac64));
        const _0x3b07fc = [..._0xef2fcb];
        let _0x4c48c9 = false;
        if (_0x36fe97.length) {
          const _0x4c14be = _0x36fe97.flatMap(_0x4c2037 => _0x5e691d.get(_0x4c2037) || []);
          const _0x5d11b2 = _0x360807.ref + "-repair-recheck" + (_0x2d528a > 1 ? "-" + _0x2d528a : "");
          try {
            const _0x1c7019 = await _0x5b0522({
              prompt: buildReviewPrompt({
                episodeRef: _0x423e63,
                episode: episode,
                batchRef: _0x5d11b2,
                clips: _0x4c14be,
                neighboringClips: [..._0x171b02, ..._0x148964.filter(_0x291198 => !_0x4fae26.includes(_0x291198.ref))],
                assets: assets,
                localSignals: inspectStoryEpisodeSplitLocalSignals({
                  clips: _0x4c14be
                }),
                phase: "repair-recheck",
                constraints: constraints
              }),
              systemPrompt: REVIEW_SYSTEM_PROMPT
            }, "quality-recheck:" + _0x360807.ref + (_0x2d528a > 1 ? ":round-" + _0x2d528a : ""));
            const _0x4f5ae2 = applyBlockingLocalSignalsToAssessments(parseReviewResponse(_0x1c7019, {
              episodeRef: _0x423e63,
              batchRef: _0x5d11b2,
              clipRefs: _0x4c14be.map(_0x3842b5 => _0x3842b5.ref)
            }), inspectStoryEpisodeSplitLocalSignals({
              clips: _0x4c14be
            }));
            _0x294065.push(cloneJson(_0x4f5ae2));
            if (_0x2d528a === 1) {
              _0x360807.recheck = cloneJson(_0x4f5ae2);
            }
            const _0x3fd960 = new Map(_0x4f5ae2.map(_0x211873 => [_0x211873.clipRef, _0x211873]));
            _0x36fe97.forEach(_0x56f768 => {
              const _0x1a8de3 = _0x5e691d.get(_0x56f768) || [];
              _0x375e6b[_0x56f768] = cloneJson(_0x1a8de3);
              const _0x363297 = _0x1a8de3.map(_0x12cf84 => _0x3fd960.get(normalizeText(_0x12cf84?.ref))).filter(_0x34e379 => _0x34e379?.verdict === "repair");
              if (_0x363297.length) {
                _0x523755[_0x56f768] = _0x363297.flatMap(_0x16f83a => _0x16f83a.issues).map(_0x2e797d => _0x2e797d.reason || _0x2e797d.repairInstruction).filter(Boolean).join("；") || "定点修复结果复审仍未通过。";
                _0x4b03fd.add(_0x56f768);
                _0x3b07fc.push(_0x56f768);
                _0x4c48c9 = true;
                return;
              }
              _0x5462dc[_0x56f768] = cloneJson(_0x1a8de3);
              _0x135dcc.set(_0x56f768, cloneJson(_0x1a8de3));
              delete _0x523755[_0x56f768];
              _0x4b03fd.delete(_0x56f768);
            });
          } catch (_0x6ee2e) {
            const _0x19dbe2 = normalizeText(_0x6ee2e?.message || _0x6ee2e);
            _0x36fe97.forEach(_0x35dfcb => {
              _0x523755[_0x35dfcb] = _0x19dbe2;
              _0x4b03fd.add(_0x35dfcb);
              _0x3b07fc.push(_0x35dfcb);
            });
            _0x4c48c9 = true;
          }
        }
        _0x1f3a24 = [...new Set(_0x3b07fc)];
        _0x5c4c5f = _0xef2fcb.length && _0x4c48c9 ? "mixed" : _0xef2fcb.length ? "validation" : "recheck";
      }
      if (_0x294065.length > 1) {
        _0x360807.recheckRounds = _0x294065;
      }
      _0x360807.replacements = _0x5462dc;
      _0x360807.repairErrors = _0x523755;
      _0x360807.status = "completed";
      await _0x1e3be5();
    } catch (_0x37765e) {
      _0x360807.status = "completed";
      _0x360807.repairError = normalizeText(_0x37765e?.message || _0x37765e);
      _0x4fae26.forEach(_0x30873a => _0x4b03fd.add(_0x30873a));
      await _0x1e3be5();
    }
  }
  let _0x266ace = _0x18e43c.flatMap(_0x2400ec => _0x135dcc.has(_0x2400ec.ref) ? _0x135dcc.get(_0x2400ec.ref) : [_0x2400ec]);
  const _0x126a75 = _0x266ace.map(_0x17675f => normalizeText(_0x17675f?.ref));
  if (_0x126a75.some(_0x338f18 => !_0x338f18) || new Set(_0x126a75).size !== _0x126a75.length) {
    throw new Error("审片修复后出现空片段引用或重复片段引用，未提交修复结果。");
  }
  let _0x29bef7 = getBlockingStoryEpisodeSplitLocalSignals(inspectStoryEpisodeSplitLocalSignals({
    clips: _0x266ace
  }));
  if (_0x29bef7.length) {
    const _0x478473 = normalizeStoryEpisodeSpokenTiming(_0x266ace, {
      maxClipDurationSeconds: Math.max(0, Number(constraints?.sceneMaxSeconds) || 0),
      maxSpokenUnitsPerSecond: MAX_SPOKEN_UNITS_PER_SECOND
    });
    const _0x9463bd = getBlockingStoryEpisodeSplitLocalSignals(inspectStoryEpisodeSplitLocalSignals({
      clips: _0x478473
    }));
    if (!_0x9463bd.length) {
      _0x266ace = _0x478473;
      _0x29bef7 = [];
      _0x4b03fd.clear();
    }
  }
  if (_0x29bef7.length) {
    const _0x1b80a = new Set(_0x29bef7.map(_0xd7ff33 => normalizeText(_0xd7ff33?.clipRef)).filter(Boolean));
    _0x1b80a.forEach(_0x47ed55 => _0x4b03fd.add(_0x47ed55));
    _0x8d8b30.status = "failed_retryable";
    _0x8d8b30.completedClips = null;
    _0x8d8b30.batches = _0x8d8b30.batches.map(_0x3cf432 => (Array.isArray(_0x3cf432?.clipRefs) ? _0x3cf432.clipRefs : []).some(_0x44a1c0 => _0x1b80a.has(_0x44a1c0)) ? {
      ..._0x3cf432,
      status: "pending"
    } : _0x3cf432);
    await _0x1e3be5();
    throw new Error("片段 " + [..._0x1b80a].join("、") + " 的对白或镜头时长仍无法自然说完，未提交分镜结果。");
  }
  _0x8d8b30.status = "completed";
  _0x8d8b30.completedClips = cloneJson(_0x266ace);
  await _0x1e3be5();
  return {
    ...result,
    clips: _0x266ace,
    totalDurationSeconds: _0x266ace.reduce((_0x426688, _0x43c706) => _0x426688 + Math.max(0, Number(_0x43c706?.durationSec) || 0), 0),
    qualityReview: createQualityReviewSummary(_0x8d8b30)
  };
}