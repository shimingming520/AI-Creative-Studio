import { ASPECT_RATIO_FIELD } from "../../manifests/image/modelApi/sharedImageModelApiFields.js";
import { normalizeRunningHubModelApiProfileId } from "../runningHubProviderProfiles.js";
import { normalizeStoryWorkspaceAssetData } from "./storyAssetAppearances.js";
import { invalidateStoryEpisodeScriptsFrom } from "./storyPlanningData.js";
import { parseUploadedStoryScript } from "./storyScriptImport.js";
export { STORY_PROMPT_MODE_OPTIONS, getStoryPromptModeLabel, normalizeStoryPromptMode } from "./storyPromptModes.js";
import { normalizeStoryPromptMode } from "./storyPromptModes.js";
import { STORY_STYLE_CUSTOM_ID, resolveStoryStyleSelection } from "./storyStyleCatalog.js";
import { createDemoStoryWorkspaceData } from "./storyWorkspaceData.js";
export const STORY_SCRIPT_MAX_CHARACTERS = 100000;
export const STORY_IDEA_MAX_CHARACTERS = 5000;
export const STORY_CUSTOM_STYLE_MAX_CHARACTERS = 500;
export const STORY_EPISODE_COUNT_MIN = 1;
export const STORY_EPISODE_COUNT_MAX = 100;
export const STORY_PUBLIC_EPISODE_COUNT_OPTIONS = Object.freeze([3, 5, 10, 20]);
export const STORY_DEVELOPER_EPISODE_COUNT_OPTIONS = Object.freeze([30, 50]);
export const STORY_EPISODE_COUNT_OPTIONS = Object.freeze([...STORY_PUBLIC_EPISODE_COUNT_OPTIONS, ...STORY_DEVELOPER_EPISODE_COUNT_OPTIONS]);
export const STORY_SCENE_MAX_SECONDS_OPTIONS = Object.freeze([15, 30]);
export const STORY_ASPECT_RATIO_OPTIONS = Object.freeze(ASPECT_RATIO_FIELD.options.map(_0x24834d => Object.freeze({
  ..._0x24834d
})));
function normalizeText(_0x289cb1) {
  return String(_0x289cb1 || "").trim();
}
export function normalizeStoryEpisodeCount(_0x223319) {
  const _0x3291d9 = Math.trunc(Number(_0x223319));
  if (Number.isFinite(_0x3291d9) && _0x3291d9 >= STORY_EPISODE_COUNT_MIN && _0x3291d9 <= STORY_EPISODE_COUNT_MAX) {
    return _0x3291d9;
  } else {
    return STORY_PUBLIC_EPISODE_COUNT_OPTIONS[0];
  }
}
export function normalizeStorySceneMaxSeconds(_0x54b983) {
  const _0x4e7bee = Math.trunc(Number(_0x54b983));
  if (STORY_SCENE_MAX_SECONDS_OPTIONS.includes(_0x4e7bee)) {
    return _0x4e7bee;
  } else {
    return 15;
  }
}
export function normalizeStoryProjectPlanning(_0x4588d2 = {}, {
  allowDeveloperPromptModes = false
} = {}) {
  const _0x5688d3 = _0x4588d2?.planning && typeof _0x4588d2.planning === "object" ? _0x4588d2.planning : {};
  return {
    episodeCount: normalizeStoryEpisodeCount(_0x5688d3.episodeCount),
    sceneMaxSeconds: normalizeStorySceneMaxSeconds(_0x5688d3.sceneMaxSeconds),
    promptMode: normalizeStoryPromptMode(_0x5688d3.promptMode, {
      allowDeveloperModes: allowDeveloperPromptModes
    })
  };
}
export function normalizeStoryAspectRatio(_0x3a918b) {
  const _0x3004de = normalizeText(_0x3a918b);
  if (STORY_ASPECT_RATIO_OPTIONS.some(_0x459435 => _0x459435.value === _0x3004de)) {
    return _0x3004de;
  } else {
    return "16:9";
  }
}
export const STORY_HOME_GENERATION_PROMPTS = Object.freeze({
  upload: "按原稿结构导入上传剧本，不扩写、不重新分集，直接提取角色、场景与道具。",
  generate: "根据用户提供的一段故事设定，扩写为人物动机完整、冲突清晰、可继续拆分分集的故事剧情。",
  rewrite: "根据用户的改写要求重构参考剧本，生成新的故事蓝图、世界设定与分集规划。"
});
export function normalizeStoryScriptMode(_0x21c066) {
  if (normalizeText(_0x21c066) === "narration") {
    return "narration";
  } else {
    return "plot";
  }
}
export function getNextStoryScriptMode(_0x3accae) {
  if (normalizeStoryScriptMode(_0x3accae) === "narration") {
    return "plot";
  } else {
    return "narration";
  }
}
export function getStoryScriptModeHint(_0x17322b) {
  if (normalizeStoryScriptMode(_0x17322b) === "narration") {
    return "以第三人称旁白推进，保留少量关键对白，适合单人口播与快速画面切换。";
  } else {
    return "以人物行动和对白推进，生成标准剧情短剧。";
  }
}
export function resolveStoryTextProviderProfileId(_0x2f7ebb, _0x417953 = "") {
  if (normalizeText(_0x2f7ebb).toLowerCase() === "runninghub") {
    return normalizeRunningHubModelApiProfileId(_0x417953);
  } else {
    return "";
  }
}
export function buildStoryHomeGenerationRequest({
  mode = "upload",
  scriptMode = "plot",
  modelId = "",
  provider = "",
  providerProfileId = "",
  scriptFileName = "",
  scriptText = "",
  idea = "",
  rewriteInstruction = "",
  aspectRatio = "16:9",
  styleId = STORY_STYLE_CUSTOM_ID,
  stylePrompt = "",
  videoStyle = "",
  episodeCount = 3,
  sceneMaxSeconds = 15,
  promptMode = "seedance-2.0",
  allowDeveloperPromptModes = false
} = {}) {
  const _0x9f27e6 = mode === "generate" || mode === "rewrite" ? mode : "upload";
  const _0x2b6075 = normalizeText(idea).slice(0, STORY_IDEA_MAX_CHARACTERS);
  const _0x19e439 = normalizeText(rewriteInstruction).slice(0, STORY_IDEA_MAX_CHARACTERS);
  const _0x5b315e = normalizeText(scriptFileName);
  const _0x33132a = String(scriptText || "").slice(0, STORY_SCRIPT_MAX_CHARACTERS);
  if (_0x9f27e6 === "upload" && !_0x5b315e) {
    return {
      ok: false,
      error: "请先上传剧本或粘贴文本。"
    };
  }
  if (_0x9f27e6 === "upload" && !normalizeText(_0x33132a)) {
    return {
      ok: false,
      error: "当前文件尚未解析出可用文本，请使用 TXT、DOCX、文本型 PDF 或粘贴文本。"
    };
  }
  if (_0x9f27e6 === "generate" && !_0x2b6075) {
    return {
      ok: false,
      error: "请先写下一段故事设定。"
    };
  }
  if (_0x9f27e6 === "rewrite" && !_0x5b315e) {
    return {
      ok: false,
      error: "请先上传参考剧本。"
    };
  }
  if (_0x9f27e6 === "rewrite" && !normalizeText(_0x33132a)) {
    return {
      ok: false,
      error: "当前参考剧本尚未解析出可用文本，请使用 TXT、DOCX 或文本型 PDF。"
    };
  }
  if (_0x9f27e6 === "rewrite" && !_0x19e439) {
    return {
      ok: false,
      error: "请先填写改写要求。"
    };
  }
  const _0x8b27bb = resolveStoryStyleSelection({
    styleId: styleId,
    stylePrompt: stylePrompt,
    videoStyle: videoStyle
  });
  const _0x4b75b = normalizeText(provider);
  const _0x548d43 = resolveStoryTextProviderProfileId(_0x4b75b, providerProfileId);
  return {
    ok: true,
    mode: _0x9f27e6,
    scriptMode: _0x9f27e6 !== "upload" ? normalizeStoryScriptMode(scriptMode) : "plot",
    prompt: STORY_HOME_GENERATION_PROMPTS[_0x9f27e6],
    modelId: normalizeText(modelId),
    provider: _0x4b75b,
    ...(_0x548d43 ? {
      providerProfileId: _0x548d43
    } : {}),
    scriptFileName: _0x9f27e6 !== "generate" ? _0x5b315e : "",
    sourceText: _0x9f27e6 !== "generate" ? _0x33132a : "",
    idea: _0x9f27e6 === "generate" ? _0x2b6075 : "",
    rewriteInstruction: _0x9f27e6 === "rewrite" ? _0x19e439 : "",
    aspectRatio: normalizeStoryAspectRatio(aspectRatio),
    styleId: _0x8b27bb.styleId,
    visualStyle: _0x8b27bb.stylePrompt.slice(0, STORY_CUSTOM_STYLE_MAX_CHARACTERS),
    ...(_0x9f27e6 !== "upload" ? {
      episodeCount: normalizeStoryEpisodeCount(episodeCount)
    } : {}),
    sceneMaxSeconds: normalizeStorySceneMaxSeconds(sceneMaxSeconds),
    promptMode: normalizeStoryPromptMode(promptMode, {
      allowDeveloperModes: allowDeveloperPromptModes
    }),
    maxScriptCharacters: STORY_SCRIPT_MAX_CHARACTERS
  };
}
export function buildStorySummaryRegenerationRequest(_0x1182d0 = {}, {
  modelId = "",
  provider = "",
  providerProfileId = "",
  allowDeveloperPromptModes = false
} = {}) {
  const _0x1b047e = String(_0x1182d0?.sourceDocument?.text || "");
  const _0x4d5d0b = normalizeText(_0x1182d0?.originalCreative);
  const _0x54b741 = normalizeText(_0x1182d0?.rewriteInstruction);
  const _0x9b5515 = _0x1182d0?.sourceMode === "upload-rewrite" ? "rewrite" : normalizeText(_0x1b047e) ? "upload" : "generate";
  if (_0x9b5515 === "generate" && !_0x4d5d0b) {
    return {
      ok: false,
      error: "当前项目没有可用于重新生成的原始创意。"
    };
  }
  if (_0x9b5515 === "rewrite" && !_0x54b741) {
    return {
      ok: false,
      error: "当前项目没有可用于重新生成的改写要求。"
    };
  }
  const _0x920991 = resolveStoryStyleSelection({
    styleId: _0x1182d0?.videoStyleId,
    stylePrompt: _0x1182d0?.videoStylePrompt,
    videoStyle: _0x1182d0?.videoStyle
  });
  const _0x4ac034 = normalizeStoryProjectPlanning(_0x1182d0, {
    allowDeveloperPromptModes: allowDeveloperPromptModes
  });
  const _0x30885e = normalizeText(provider);
  const _0x51bddc = resolveStoryTextProviderProfileId(_0x30885e, providerProfileId);
  return {
    ok: true,
    mode: _0x9b5515,
    scriptMode: normalizeStoryScriptMode(_0x1182d0?.scriptMode),
    idea: _0x9b5515 === "generate" ? _0x4d5d0b : "",
    sourceText: _0x9b5515 !== "generate" ? _0x1b047e : "",
    fileName: _0x9b5515 !== "generate" ? normalizeText(_0x1182d0?.sourceDocument?.fileName) : "",
    rewriteInstruction: _0x9b5515 === "rewrite" ? _0x54b741 : "",
    model: normalizeText(modelId),
    provider: _0x30885e,
    ...(_0x51bddc ? {
      providerProfileId: _0x51bddc
    } : {}),
    aspectRatio: normalizeStoryAspectRatio(_0x1182d0?.aspectRatio),
    visualStyle: _0x920991.stylePrompt,
    planning: {
      episodeCount: _0x4ac034.episodeCount,
      sceneMaxSeconds: _0x4ac034.sceneMaxSeconds,
      promptMode: _0x4ac034.promptMode
    }
  };
}
export function resolveGeneratedProjectTitle({
  currentTitle = "",
  generatedTitle = "",
  userEdited = false
} = {}) {
  const _0x3ff9bf = normalizeText(currentTitle);
  const _0x235631 = normalizeText(generatedTitle);
  if (userEdited && _0x3ff9bf) {
    return _0x3ff9bf;
  }
  return _0x235631 || _0x3ff9bf || "未命名故事";
}
export function normalizeGeneratedStoryContract(_0x4789bf = {}) {
  const _0x1b79bd = _0x4789bf && typeof _0x4789bf === "object" && !Array.isArray(_0x4789bf) ? _0x4789bf : {};
  return {
    protagonistGoal: normalizeText(_0x1b79bd.protagonistGoal),
    centralConflict: normalizeText(_0x1b79bd.centralConflict),
    stakes: normalizeText(_0x1b79bd.stakes),
    progressionDriver: normalizeText(_0x1b79bd.progressionDriver),
    constraints: normalizeText(_0x1b79bd.constraints),
    climax: normalizeText(_0x1b79bd.climax),
    ending: normalizeText(_0x1b79bd.ending)
  };
}
function normalizeGeneratedStoryPlotBeats(_0x5af755 = []) {
  return (Array.isArray(_0x5af755) ? _0x5af755 : []).map((_0x5ad929, _0x3fe10a) => ({
    ref: normalizeText(_0x5ad929?.ref) || "plot-beat-" + (_0x3fe10a + 1),
    stage: normalizeText(_0x5ad929?.stage),
    event: normalizeText(_0x5ad929?.event),
    consequence: normalizeText(_0x5ad929?.consequence)
  })).filter(_0x531ac5 => _0x531ac5.stage || _0x531ac5.event || _0x531ac5.consequence);
}
export function normalizeGeneratedStoryContinuityFacts(_0x531fe8 = []) {
  return [...new Set((Array.isArray(_0x531fe8) ? _0x531fe8 : []).map(normalizeText).filter(Boolean))];
}
export function applyGeneratedStoryResult(_0x1bc1c3, _0xcc74b5 = {}, _0x54e491 = {}) {
  const _0x47f78f = _0x1bc1c3 && typeof _0x1bc1c3 === "object" ? _0x1bc1c3 : createDemoStoryWorkspaceData();
  const _0xc57741 = Array.isArray(_0xcc74b5.chapters) ? _0xcc74b5.chapters.map((_0x2ed50c, _0x429f1f) => ({
    id: normalizeText(_0x2ed50c?.id) || "chapter-" + (_0x429f1f + 1),
    title: normalizeText(_0x2ed50c?.title) || "第 " + (_0x429f1f + 1) + " 章",
    content: normalizeText(_0x2ed50c?.content)
  })).filter(_0x7abd80 => _0x7abd80.content) : [];
  const _0x4a01f5 = _0xc57741.map(_0x289491 => _0x289491.title + "\n" + _0x289491.content).join("\n\n");
  return {
    ..._0x47f78f,
    project: {
      ...(_0x47f78f.project || {}),
      title: resolveGeneratedProjectTitle({
        currentTitle: _0x47f78f.project?.title,
        generatedTitle: _0xcc74b5.title,
        userEdited: _0x54e491.projectTitleEdited === true
      }),
      storyType: normalizeText(_0xcc74b5.storyType),
      targetAudience: normalizeText(_0xcc74b5.targetAudience),
      summary: normalizeText(_0xcc74b5.storySummary),
      background: normalizeText(_0xcc74b5.storyBackground),
      setting: normalizeText(_0xcc74b5.storySetting),
      coreHook: normalizeText(_0xcc74b5.coreHook),
      logline: normalizeText(_0xcc74b5.logline),
      storyContract: _0xcc74b5.storyContract ? normalizeGeneratedStoryContract(_0xcc74b5.storyContract) : normalizeGeneratedStoryContract(_0x47f78f.project?.storyContract),
      plotBeats: Array.isArray(_0xcc74b5.plotBeats) ? normalizeGeneratedStoryPlotBeats(_0xcc74b5.plotBeats) : normalizeGeneratedStoryPlotBeats(_0x47f78f.project?.plotBeats),
      continuityFacts: Array.isArray(_0xcc74b5.continuityFacts) ? normalizeGeneratedStoryContinuityFacts(_0xcc74b5.continuityFacts) : normalizeGeneratedStoryContinuityFacts(_0x47f78f.project?.continuityFacts),
      summaryRevision: Math.max(0, Math.trunc(Number(_0x47f78f.project?.summaryRevision) || 0)) + 1,
      characters: Array.isArray(_0xcc74b5.characters) ? _0xcc74b5.characters.map(_0x59547f => ({
        ..._0x59547f
      })) : [],
      sourceChapters: _0xc57741.map(_0x191448 => ({
        ..._0x191448
      })),
      chapters: _0xc57741,
      plotScript: _0x4a01f5,
      narrationScript: _0x4a01f5
    }
  };
}
export function invalidateStoryPlanningDownstream(_0x56216f = {}, {
  clearEpisodeOutlines = false,
  episodeScriptStartIndex = 0
} = {}) {
  const _0x519dd0 = _0x56216f && typeof _0x56216f === "object" ? _0x56216f : {};
  const _0x18a14b = {
    ..._0x519dd0
  };
  delete _0x18a14b.assetExtractionDraft;
  delete _0x18a14b.experimentalAssetExtractionDraft;
  const _0x2aaf9b = _0x519dd0.project && typeof _0x519dd0.project === "object" ? _0x519dd0.project : {};
  const _0x2be47f = Array.isArray(_0x2aaf9b.sourceChapters) && _0x2aaf9b.sourceChapters.length ? _0x2aaf9b.sourceChapters : !_0x2aaf9b.compiledScript && Array.isArray(_0x2aaf9b.chapters) ? _0x2aaf9b.chapters : [];
  return {
    ..._0x18a14b,
    project: {
      ..._0x2aaf9b,
      ...(clearEpisodeOutlines ? {
        outlineStatus: "pending",
        outlineSourceSummaryRevision: 0,
        storyFacts: []
      } : {}),
      sourceChapters: _0x2be47f.map(_0x216a04 => ({
        ..._0x216a04
      })),
      chapters: [],
      plotScript: "",
      narrationScript: "",
      compiledScript: null
    },
    assets: [],
    episodes: clearEpisodeOutlines ? [] : invalidateStoryEpisodeScriptsFrom(_0x519dd0.episodes, episodeScriptStartIndex)
  };
}
export function markStorySummaryDownstreamStale(_0x39bac0 = {}) {
  if (!_0x39bac0?.project || typeof _0x39bac0.project !== "object") {
    return false;
  }
  const _0x427ee8 = _0x39bac0.project;
  _0x427ee8.summaryRevision = Math.max(0, Math.trunc(Number(_0x427ee8.summaryRevision) || 0)) + 1;
  const _0x14fa61 = Array.isArray(_0x39bac0.episodes) && _0x39bac0.episodes.length > 0 || Array.isArray(_0x39bac0.assets) && _0x39bac0.assets.length > 0 || normalizeText(_0x427ee8.outlineStatus) === "completed";
  if (_0x14fa61 && _0x427ee8.outlineStatus !== "generating") {
    _0x427ee8.outlineStatus = "stale";
    return true;
  }
  return false;
}
export function createGeneratedStoryProjectData(_0x1f5b05 = {}, {
  projectId = "story-" + Date.now(),
  request = {},
  allowDeveloperPromptModes = false
} = {}) {
  const _0x3a0dbe = resolveStoryStyleSelection({
    styleId: request.styleId,
    stylePrompt: request.visualStyle
  });
  const _0x59738a = normalizeStoryWorkspaceAssetData(createDemoStoryWorkspaceData());
  _0x59738a.project = {
    ..._0x59738a.project,
    id: normalizeText(projectId) || "story-" + Date.now(),
    title: "未命名故事",
    scriptMode: normalizeStoryScriptMode(request.scriptMode),
    storyType: "",
    targetAudience: "",
    summary: "",
    background: "",
    setting: "",
    coreHook: "",
    logline: "",
    storyContract: normalizeGeneratedStoryContract(),
    plotBeats: [],
    continuityFacts: [],
    summaryRevision: 0,
    outlineSourceSummaryRevision: 0,
    characters: [],
    sourceChapters: [],
    chapters: [],
    plotScript: "",
    narrationScript: "",
    aspectRatio: normalizeStoryAspectRatio(request.aspectRatio),
    videoStyleId: _0x3a0dbe.styleId,
    videoStylePrompt: _0x3a0dbe.stylePrompt,
    customVideoStylePrompt: _0x3a0dbe.isCustom ? _0x3a0dbe.stylePrompt : "",
    videoStyle: _0x3a0dbe.label || _0x3a0dbe.stylePrompt,
    planning: {
      episodeCount: normalizeStoryEpisodeCount(request.episodeCount),
      sceneMaxSeconds: normalizeStorySceneMaxSeconds(request.sceneMaxSeconds),
      promptMode: normalizeStoryPromptMode(request.promptMode, {
        allowDeveloperModes: allowDeveloperPromptModes
      })
    },
    ...(request.mode === "rewrite" ? {
      sourceMode: "upload-rewrite"
    } : {}),
    sourceDocument: request.mode === "upload" || request.mode === "rewrite" ? {
      fileName: normalizeText(request.scriptFileName),
      text: String(request.sourceText || ""),
      characterCount: String(request.sourceText || "").length
    } : null,
    originalCreative: request.mode === "upload" || request.mode === "rewrite" ? String(request.sourceText || "") : String(request.idea || ""),
    rewriteInstruction: request.mode === "rewrite" ? normalizeText(request.rewriteInstruction) : "",
    summaryStatus: "pending",
    outlineStatus: "pending",
    compiledScript: null
  };
  _0x59738a.assets = [];
  _0x59738a.episodes = [];
  return normalizeStoryWorkspaceAssetData(applyGeneratedStoryResult(_0x59738a, _0x1f5b05, {
    projectTitleEdited: false
  }));
}
export function createUploadedStoryProjectData({
  projectId = "story-" + Date.now(),
  request = {},
  allowDeveloperPromptModes = false
} = {}) {
  const _0x322b37 = parseUploadedStoryScript({
    sourceText: request.sourceText,
    fileName: request.scriptFileName
  });
  const _0x347fbc = createGeneratedStoryProjectData({}, {
    projectId: projectId,
    request: request,
    allowDeveloperPromptModes: allowDeveloperPromptModes
  });
  _0x347fbc.project = {
    ..._0x347fbc.project,
    title: _0x322b37.title,
    sourceMode: "upload-original",
    summaryStatus: "skipped",
    outlineStatus: "completed",
    sourceChapters: _0x322b37.chapters.map(_0x3c545a => ({
      ..._0x3c545a
    })),
    chapters: _0x322b37.chapters,
    plotScript: _0x322b37.sourceText,
    narrationScript: _0x322b37.sourceText,
    compiledScript: {
      revision: 1,
      episodeIds: _0x322b37.episodes.map(_0x20ff4b => _0x20ff4b.id),
      fullText: _0x322b37.episodes.map(_0x44603f => _0x44603f.script.fullText).join("\n\n"),
      confirmedAt: Date.now()
    }
  };
  _0x347fbc.episodes = _0x322b37.episodes;
  return normalizeStoryWorkspaceAssetData(_0x347fbc);
}