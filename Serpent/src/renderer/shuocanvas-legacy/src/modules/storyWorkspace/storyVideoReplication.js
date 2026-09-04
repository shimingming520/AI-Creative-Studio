import { normalizeStoryWorkspaceAssetData } from "./storyAssetAppearances.js";
import { getStoryClipDialogueSpeakerAssetIds } from "./storyPlanningData.js";
import { parseUploadedStoryEpisodeScenes } from "./storyScriptImport.js";
import { localPathToUrl, pickResultLocalPath } from "../../utils/localMediaPath.js";
export const STORY_REPLICATION_MAX_VIDEO_BYTES = 52428800;
export const STORY_VIDEO_REPLICATION_UNIFIED_ASSET_MAX_SOURCE_CHARACTERS = 32000;
export const STORY_VIDEO_REPLICATION_UNIFIED_ASSET_MAX_OUTPUT_TOKENS = 16384;
export const STORY_REPLICATION_VIDEO_ACCEPT = ".mp4,.mov,.avi,video/mp4,video/quicktime,video/x-msvideo,video/avi,video/msvideo,video/vnd.avi";
export function isStoryVideoReplicationHomeAvailable({
  developerModeAvailable = false
} = {}) {
  return developerModeAvailable === true;
}
export function resolveStoryVideoReplicationHomeTab(_0x5bbf35 = {}, _0x3b329a = "upload") {
  const _0x28c257 = ["upload", "generate", "replication"].includes(_0x3b329a) ? _0x3b329a : "upload";
  if (_0x28c257 === "replication" && !isStoryVideoReplicationHomeAvailable(_0x5bbf35)) {
    return "upload";
  } else {
    return _0x28c257;
  }
}
export const STORY_REPLICATION_LOCALES = Object.freeze([Object.freeze({
  value: "zh-CN",
  label: "中国 · 中文",
  shortLabel: "中文"
}), Object.freeze({
  value: "ja-JP",
  label: "日本 · 日语",
  shortLabel: "日语"
}), Object.freeze({
  value: "ko-KR",
  label: "韩国 · 韩语",
  shortLabel: "韩语"
}), Object.freeze({
  value: "en-US",
  label: "美国 · 英语",
  shortLabel: "英语"
})]);
const SUPPORTED_VIDEO_EXTENSIONS = new Set(["mp4", "mov", "avi"]);
function normalizeText(_0x2a194a) {
  return String(_0x2a194a ?? "").trim();
}
export function resolveStoryVideoReplicationClipVoiceAssetIds(_0x4a8c1a = {}, _0x5394cc = {}) {
  if (_0x4a8c1a?.project?.sourceMode !== "video-replication") {
    return null;
  }
  return getStoryClipDialogueSpeakerAssetIds(_0x5394cc, _0x4a8c1a.assets);
}
function normalizePositiveNumber(_0x236b72) {
  const _0x736db = Number(_0x236b72);
  if (Number.isFinite(_0x736db) && _0x736db > 0) {
    return _0x736db;
  } else {
    return 0;
  }
}
function stripVideoExtension(_0x4733c5) {
  return normalizeText(_0x4733c5).replace(/^.*[\\/]/u, "").replace(/\.(?:mp4|mov|avi)$/iu, "").trim();
}
function getVideoExtension(_0x7500a2 = {}) {
  return normalizeText(_0x7500a2.name).split(".").pop()?.toLowerCase() || "";
}
function normalizeLocale(_0x1e7381) {
  const _0x4c127a = normalizeText(_0x1e7381);
  if (STORY_REPLICATION_LOCALES.some(_0x104d49 => _0x104d49.value === _0x4c127a)) {
    return _0x4c127a;
  } else {
    return STORY_REPLICATION_LOCALES[0].value;
  }
}
function createStableEpisodeId(_0x1160e0 = {}, _0x37aadf = 0, _0xfdbf68 = "story") {
  const _0x5e5873 = [_0xfdbf68, normalizeText(_0x1160e0.name), Number(_0x1160e0.size) || 0, Number(_0x1160e0.lastModified) || 0, _0x37aadf].join("|");
  let _0x1d50b1 = 2166136261;
  for (let _0x44602d = 0; _0x44602d < _0x5e5873.length; _0x44602d += 1) {
    _0x1d50b1 ^= _0x5e5873.charCodeAt(_0x44602d);
    _0x1d50b1 = Math.imul(_0x1d50b1, 16777619);
  }
  return "replication-episode-" + (_0x1d50b1 >>> 0).toString(36);
}
function normalizeAnalysisSegment(_0x1e9d82 = {}, _0x240384 = 0, _0x1df21c = 0) {
  const _0x58629f = Math.max(0, Number(_0x1e9d82.startSec) || 0);
  const _0x460002 = Number(_0x1e9d82.endSec);
  const _0x42af70 = Math.max(1, Number(_0x1e9d82.durationSec) || 0);
  const _0x18239f = Number.isFinite(_0x460002) && _0x460002 > _0x58629f ? _0x460002 : _0x58629f + _0x42af70;
  const _0x257a8a = _0x1df21c > 0 ? Math.min(Math.max(_0x58629f + 0.1, _0x18239f), _0x1df21c) : _0x18239f;
  return {
    title: normalizeText(_0x1e9d82.title) || "片段 " + String(_0x240384 + 1).padStart(2, "0"),
    startSec: _0x58629f,
    endSec: _0x257a8a,
    durationSec: Math.max(0.1, _0x257a8a - _0x58629f),
    script: normalizeText(_0x1e9d82.script || _0x1e9d82.dialogue || _0x1e9d82.visual),
    prompt: normalizeText(_0x1e9d82.prompt || _0x1e9d82.seedancePrompt),
    visual: normalizeText(_0x1e9d82.visual || _0x1e9d82.script),
    camera: normalizeText(_0x1e9d82.camera),
    dialogue: normalizeText(_0x1e9d82.dialogue),
    sound: normalizeText(_0x1e9d82.sound || _0x1e9d82.audio)
  };
}
export function getStoryReplicationLocale(_0x151a06) {
  const _0x46e1bf = normalizeLocale(_0x151a06);
  return STORY_REPLICATION_LOCALES.find(_0x3e3dd4 => _0x3e3dd4.value === _0x46e1bf) || STORY_REPLICATION_LOCALES[0];
}
export function resolveStoryReplicationUploadedVideo(_0x26b9d1 = {}) {
  const _0x250b53 = pickResultLocalPath(_0x26b9d1);
  const _0x566d98 = normalizeText(_0x250b53 ? localPathToUrl(_0x250b53) : _0x26b9d1?.displayUrl || _0x26b9d1?.url || _0x26b9d1?.originalUrl || _0x26b9d1?.videoUrl);
  if (!_0x566d98) {
    throw new Error("视频上传结果缺少可用地址。");
  }
  return {
    videoRef: _0x566d98,
    localPath: _0x250b53
  };
}
export function findStoryReplicationEpisode(_0x1294b6, _0x1244bb) {
  return (Array.isArray(_0x1294b6?.episodes) ? _0x1294b6.episodes : []).find(_0x112428 => normalizeText(_0x112428?.id) === normalizeText(_0x1244bb)) || null;
}
function buildStoryVideoReplicationEpisodeAssetEvidence(_0x271f1d = {}) {
  const _0x44a5a0 = _0x271f1d?.replication?.analysis || {};
  const _0x48e84d = [];
  const _0x464367 = normalizeText(_0x44a5a0.synopsis || _0x271f1d?.synopsis);
  const _0x4ef219 = normalizeText(_0x44a5a0.camera);
  const _0x262120 = normalizeText(_0x44a5a0.seedancePrompt);
  if (_0x464367) {
    _0x48e84d.push("剧情与空间概述：" + _0x464367);
  }
  if (_0x4ef219) {
    _0x48e84d.push("整体运镜：" + _0x4ef219);
  }
  if (_0x262120) {
    _0x48e84d.push("整体视觉提示：" + _0x262120);
  }
  const _0x55e87e = (Array.isArray(_0x44a5a0.segments) ? _0x44a5a0.segments : []).map((_0x9bd3c6, _0x5700a5) => {
    const _0x59615f = [];
    const _0x293014 = normalizeText(_0x9bd3c6?.visual);
    const _0xbe819c = normalizeText(_0x9bd3c6?.prompt);
    const _0x3f1cdf = normalizeText(_0x9bd3c6?.camera);
    if (_0x293014) {
      _0x59615f.push("画面：" + _0x293014);
    }
    if (_0xbe819c) {
      _0x59615f.push("视觉提示：" + _0xbe819c);
    }
    if (_0x3f1cdf) {
      _0x59615f.push("运镜：" + _0x3f1cdf);
    }
    if (!_0x59615f.length) {
      return "";
    }
    const _0x3eefe3 = normalizeText(_0x9bd3c6?.title);
    return ["片段 " + (_0x5700a5 + 1) + (_0x3eefe3 ? "「" + _0x3eefe3 + "」" : "") + "：", ..._0x59615f.map(_0x176202 => "- " + _0x176202)].join("\n");
  }).filter(Boolean);
  _0x48e84d.push(..._0x55e87e);
  if (!_0x48e84d.length) {
    return "";
  }
  return ["【视频解析视觉证据（仅用于角色、场景与道具识别，不是新增剧情）】", ..._0x48e84d].join("\n");
}
export function buildStoryVideoReplicationAssetExtractionProject(_0x145b59 = {}) {
  const _0x41b323 = _0x145b59?.project || {};
  if (_0x41b323.sourceMode !== "video-replication") {
    return _0x41b323;
  }
  const _0x4f9ee6 = Array.isArray(_0x145b59.episodes) ? _0x145b59.episodes : [];
  const _0xba7c7a = Array.isArray(_0x41b323.chapters) ? _0x41b323.chapters : [];
  const _0x36c3f6 = _0xba7c7a.length ? _0xba7c7a : _0x4f9ee6.filter(_0x34f934 => normalizeText(_0x34f934?.script?.fullText)).map((_0x990837, _0x21fbc0) => ({
    id: _0x990837.id,
    title: "第 " + (_0x990837.number || _0x21fbc0 + 1) + " 集：" + (_0x990837.title || "未命名分集"),
    content: _0x990837.script.fullText
  }));
  const _0x333649 = _0x36c3f6.map((_0x499ef4, _0x5ed9ec) => {
    const _0x45957a = _0x4f9ee6.find(_0x56c599 => normalizeText(_0x56c599?.id) === normalizeText(_0x499ef4?.id)) || _0x4f9ee6[_0x5ed9ec];
    const _0x86ec35 = normalizeText(_0x499ef4?.content || _0x45957a?.script?.fullText);
    const _0x5b878d = buildStoryVideoReplicationEpisodeAssetEvidence(_0x45957a);
    return {
      ..._0x499ef4,
      content: [_0x86ec35, _0x5b878d].filter(Boolean).join("\n\n")
    };
  });
  return {
    ..._0x41b323,
    chapters: _0x333649
  };
}
export function shouldUseStoryVideoReplicationUnifiedAssetLocalization(_0x5ef9bb = {}, {
  maxSourceCharacters = STORY_VIDEO_REPLICATION_UNIFIED_ASSET_MAX_SOURCE_CHARACTERS
} = {}) {
  if (_0x5ef9bb?.project?.sourceMode !== "video-replication") {
    return false;
  }
  if (_0x5ef9bb.assetExtractionDraft && typeof _0x5ef9bb.assetExtractionDraft === "object") {
    return false;
  }
  const _0x17d825 = buildStoryVideoReplicationAssetExtractionProject(_0x5ef9bb);
  const _0x224a84 = Array.isArray(_0x17d825.chapters) ? _0x17d825.chapters : [];
  const _0x25ebf2 = _0x224a84.reduce((_0xb52b07, _0x191fc7) => _0xb52b07 + String(_0x191fc7?.content || "").length, 0);
  const _0x5e0b5d = _0x25ebf2 || (Array.isArray(_0x5ef9bb.episodes) ? _0x5ef9bb.episodes : []).reduce((_0x2b8e9c, _0x8cbdd) => _0x2b8e9c + String(_0x8cbdd?.script?.fullText || "").length, 0);
  const _0x5a7854 = Math.max(1, Math.trunc(Number(maxSourceCharacters) || 0));
  return _0x5e0b5d > 0 && _0x5e0b5d <= _0x5a7854;
}
export function validateStoryReplicationVideoFile(_0x1b90aa = {}) {
  const _0x23e55e = normalizeText(_0x1b90aa.name);
  const _0xef8160 = getVideoExtension(_0x1b90aa);
  const _0x3ec494 = Math.max(0, Number(_0x1b90aa.size) || 0);
  if (!_0x23e55e) {
    return {
      ok: false,
      error: "视频文件缺少文件名。"
    };
  }
  if (!SUPPORTED_VIDEO_EXTENSIONS.has(_0xef8160)) {
    return {
      ok: false,
      error: "“" + _0x23e55e + "”格式不支持，仅支持 MP4、MOV、AVI。"
    };
  }
  if (_0x3ec494 > STORY_REPLICATION_MAX_VIDEO_BYTES) {
    return {
      ok: false,
      error: "“" + _0x23e55e + "”超过 50MB，请压缩后重新上传。"
    };
  }
  if (!_0x3ec494) {
    return {
      ok: false,
      error: "“" + _0x23e55e + "”是空文件。"
    };
  }
  return {
    ok: true,
    error: ""
  };
}
export function mergeStoryReplicationSourceFiles(_0x3dca94 = [], _0x1d2e44 = []) {
  const _0x222b28 = [];
  const _0x4d780e = new Set();
  [...(Array.isArray(_0x3dca94) ? _0x3dca94 : []), ...(Array.isArray(_0x1d2e44) ? _0x1d2e44 : [])].forEach(_0x5bcd50 => {
    if (!validateStoryReplicationVideoFile(_0x5bcd50).ok) {
      return;
    }
    const _0x170f06 = [_0x5bcd50.name, _0x5bcd50.size, _0x5bcd50.lastModified].join(":");
    if (_0x4d780e.has(_0x170f06)) {
      return;
    }
    _0x4d780e.add(_0x170f06);
    _0x222b28.push(_0x5bcd50);
  });
  return _0x222b28;
}
export function createStoryVideoReplicationProjectData({
  projectId = "story-" + Date.now(),
  files = [],
  modelId = "",
  provider = "",
  providerProfileId = "",
  targetLocale = "zh-CN",
  aspectRatio = "9:16",
  videoStyleId = "",
  videoStylePrompt = "",
  videoStyle = ""
} = {}) {
  const _0x2c9b04 = Array.isArray(files) ? files : [];
  if (!_0x2c9b04.length) {
    throw new Error("请先上传至少一条视频。");
  }
  for (const _0x39e6d8 of _0x2c9b04) {
    const _0x1a434f = validateStoryReplicationVideoFile(_0x39e6d8);
    if (!_0x1a434f.ok) {
      throw new Error(_0x1a434f.error);
    }
  }
  const _0x1a6f35 = getStoryReplicationLocale(targetLocale);
  const _0x17a1f4 = stripVideoExtension(_0x2c9b04[0]?.name) || "未命名复刻视频";
  const _0x4136be = _0x2c9b04.length > 1 ? _0x17a1f4 + " 等 " + _0x2c9b04.length + " 集" : _0x17a1f4;
  const _0x2858be = _0x2c9b04.map((_0x137113, _0x2ce0fb) => {
    const _0x50d5be = createStableEpisodeId(_0x137113, _0x2ce0fb, projectId);
    return {
      id: _0x50d5be,
      planningRef: _0x50d5be,
      number: _0x2ce0fb + 1,
      title: stripVideoExtension(_0x137113.name) || "第 " + (_0x2ce0fb + 1) + " 集",
      synopsis: "",
      hook: "",
      sourceChapterIds: [_0x50d5be],
      assetRefs: [],
      assetIds: [],
      scriptStatus: "pending",
      script: null,
      clips: [],
      clipCount: 0,
      characterCount: 0,
      sceneCount: 0,
      propCount: 0,
      durationSec: 0,
      duration: "--:--",
      coverUrl: "",
      status: "解析中",
      sourceVideo: {
        fileName: normalizeText(_0x137113.name),
        size: Math.max(0, Number(_0x137113.size) || 0),
        mimeType: normalizeText(_0x137113.type),
        videoRef: "",
        posterUrl: "",
        posterLocalPath: "",
        durationSec: 0
      },
      replication: {
        status: "queued",
        progress: 0,
        error: "",
        analysis: null
      }
    };
  });
  return normalizeStoryWorkspaceAssetData({
    project: {
      id: projectId,
      title: _0x4136be,
      sourceMode: "video-replication",
      scriptMode: "plot",
      storyType: "视频复刻",
      targetAudience: _0x1a6f35.label,
      videoStyleId: normalizeText(videoStyleId),
      videoStylePrompt: normalizeText(videoStylePrompt),
      customVideoStylePrompt: "",
      videoStyle: normalizeText(videoStyle || videoStylePrompt),
      aspectRatio: normalizeText(aspectRatio) || "9:16",
      planning: {
        episodeCount: _0x2858be.length,
        sceneMaxSeconds: 15,
        promptMode: "seedance-2.0"
      },
      sourceDocument: null,
      originalCreative: "",
      summary: "",
      chapters: [],
      plotScript: "",
      narrationScript: "",
      summaryStatus: "skipped",
      outlineStatus: "completed",
      compiledScript: null,
      replication: {
        targetLocale: _0x1a6f35.value,
        targetLabel: _0x1a6f35.label,
        modelId: normalizeText(modelId),
        provider: normalizeText(provider),
        providerProfileId: normalizeText(providerProfileId),
        assetLocalizationCompletedAt: 0,
        status: "analyzing",
        completedCount: 0,
        failedCount: 0,
        totalCount: _0x2858be.length
      },
      backgroundTasks: []
    },
    assets: [],
    episodes: _0x2858be,
    clipFrames: []
  });
}
export function isStoryVideoReplicationAssetLocalizationComplete(_0x516e2c = {}) {
  return _0x516e2c?.project?.sourceMode === "video-replication" && Number(_0x516e2c.project?.replication?.assetLocalizationCompletedAt) > 0 && Array.isArray(_0x516e2c.assets) && _0x516e2c.assets.some(_0x5118c5 => _0x5118c5?.kind === "scene");
}
export function markStoryVideoReplicationAssetLocalizationComplete(_0x4e6346 = {}, {
  completedAt = Date.now()
} = {}) {
  if (_0x4e6346?.project?.sourceMode !== "video-replication") {
    return false;
  }
  if (!Array.isArray(_0x4e6346.assets) || !_0x4e6346.assets.some(_0x31066a => _0x31066a?.kind === "scene")) {
    return false;
  }
  const _0xfb50a2 = Math.max(0, Math.trunc(Number(completedAt) || 0));
  if (!_0xfb50a2) {
    return false;
  }
  _0x4e6346.project.replication = {
    ...(_0x4e6346.project.replication || {}),
    assetLocalizationCompletedAt: _0xfb50a2
  };
  return true;
}
export function invalidateStoryVideoReplicationAssetLocalization(_0x39441f = {}) {
  if (_0x39441f?.project?.sourceMode !== "video-replication") {
    return false;
  }
  const _0x5c8828 = _0x39441f.project.replication;
  if (!_0x5c8828 || !_0x5c8828.assetLocalizationCompletedAt) {
    return false;
  }
  _0x39441f.project.replication = {
    ..._0x5c8828,
    assetLocalizationCompletedAt: 0
  };
  return true;
}
export function applyStoryVideoReplicationUpload(_0x196f61 = {}, {
  file = null,
  videoRef = "",
  durationSec = 0,
  posterUrl = "",
  posterLocalPath = ""
} = {}) {
  const _0x25cee9 = normalizePositiveNumber(durationSec);
  _0x196f61.sourceVideo = {
    ...(_0x196f61.sourceVideo || {}),
    ...(file ? {
      fileName: normalizeText(file.name) || _0x196f61.sourceVideo?.fileName,
      size: Math.max(0, Number(file.size) || 0),
      mimeType: normalizeText(file.type)
    } : {}),
    videoRef: normalizeText(videoRef),
    durationSec: _0x25cee9,
    posterUrl: normalizeText(posterUrl),
    posterLocalPath: normalizeText(posterLocalPath)
  };
  _0x196f61.coverUrl = normalizeText(posterUrl || _0x196f61.coverUrl);
  _0x196f61.durationSec = _0x25cee9;
  const _0x2248a0 = Math.round(_0x25cee9);
  _0x196f61.duration = _0x2248a0 ? String(Math.floor(_0x2248a0 / 60)).padStart(2, "0") + ":" + String(_0x2248a0 % 60).padStart(2, "0") : "--:--";
  _0x196f61.replication = {
    ...(_0x196f61.replication || {}),
    status: "analyzing",
    progress: 45,
    error: ""
  };
  _0x196f61.status = "解析中";
  return _0x196f61;
}
export function applyStoryVideoReplicationAnalysis(_0x2289df = {}, _0x5e29dc = {}) {
  const _0x11a37e = normalizePositiveNumber(_0x2289df.sourceVideo?.durationSec || _0x5e29dc.durationSec);
  const _0x5237c7 = Array.isArray(_0x5e29dc.segments) ? _0x5e29dc.segments : [];
  const _0x16e14b = _0x5237c7.map((_0x5b3a4b, _0x39be0f) => normalizeAnalysisSegment(_0x5b3a4b, _0x39be0f, _0x11a37e)).filter(_0x53a141 => _0x53a141.durationSec > 0 && (_0x53a141.script || _0x53a141.prompt));
  if (!_0x16e14b.length) {
    _0x16e14b.push(normalizeAnalysisSegment({
      title: normalizeText(_0x5e29dc.title) || _0x2289df.title,
      startSec: 0,
      endSec: _0x11a37e || 15,
      script: normalizeText(_0x5e29dc.fullScript || _0x5e29dc.synopsis),
      prompt: normalizeText(_0x5e29dc.seedancePrompt),
      camera: normalizeText(_0x5e29dc.camera),
      sound: normalizeText(_0x5e29dc.sound)
    }, 0, _0x11a37e));
  }
  const _0x30a9ea = normalizeText(_0x5e29dc.fullScript) || _0x16e14b.map(_0x1267cd => _0x1267cd.script).filter(Boolean).join("\n\n") || normalizeText(_0x5e29dc.synopsis || _0x5e29dc.seedancePrompt);
  if (!_0x30a9ea) {
    throw new Error("视频理解模型未返回可用的本地化剧本。");
  }
  const _0x37c390 = normalizeText(_0x5e29dc.title) || normalizeText(_0x2289df.title) || "未命名分集";
  const _0x3d3ff0 = parseUploadedStoryEpisodeScenes({
    fullText: _0x30a9ea,
    episodeRef: _0x2289df.id,
    fallbackHeading: _0x37c390
  });
  _0x2289df.title = _0x37c390;
  _0x2289df.synopsis = normalizeText(_0x5e29dc.synopsis) || _0x30a9ea.slice(0, 180);
  _0x2289df.scriptStatus = "completed";
  _0x2289df.script = {
    schemaVersion: 1,
    source: "video-replication",
    episodeRef: _0x2289df.id,
    scenes: _0x3d3ff0.length ? _0x3d3ff0 : [{
      ref: _0x2289df.id + "-scene-1",
      heading: _0x37c390,
      characters: [],
      body: _0x30a9ea,
      source: "video-replication"
    }],
    fullText: _0x30a9ea,
    generatedAt: Date.now()
  };
  _0x2289df.clips = [];
  _0x2289df.clipCount = 0;
  _0x2289df.status = "待拆分";
  _0x2289df.replication = {
    ...(_0x2289df.replication || {}),
    status: "ready",
    progress: 100,
    error: "",
    analysis: {
      title: _0x37c390,
      synopsis: _0x2289df.synopsis,
      camera: normalizeText(_0x5e29dc.camera),
      sound: normalizeText(_0x5e29dc.sound),
      seedancePrompt: normalizeText(_0x5e29dc.seedancePrompt),
      segmentCount: _0x16e14b.length,
      segments: _0x16e14b
    }
  };
  return _0x2289df;
}
export function failStoryVideoReplicationEpisode(_0x8f876c = {}, _0x2be992 = "") {
  const _0x3cd16c = normalizeText(_0x2be992) || "视频解析失败，请重试。";
  _0x8f876c.status = "解析失败";
  _0x8f876c.replication = {
    ...(_0x8f876c.replication || {}),
    status: "failed",
    progress: 0,
    error: _0x3cd16c
  };
  return _0x8f876c;
}
export function settleInterruptedStoryVideoReplication(_0x3785f5 = {}, {
  message = "上次视频解析已中断，请点击重试；已完成结果不会重新生成。"
} = {}) {
  if (_0x3785f5?.project?.sourceMode !== "video-replication") {
    return 0;
  }
  let _0x1d73d3 = 0;
  for (const _0x138e46 of _0x3785f5.episodes || []) {
    if (!["queued", "uploading", "analyzing"].includes(_0x138e46?.replication?.status)) {
      continue;
    }
    failStoryVideoReplicationEpisode(_0x138e46, message);
    _0x1d73d3 += 1;
  }
  if (_0x1d73d3) {
    syncStoryVideoReplicationProject(_0x3785f5);
  }
  return _0x1d73d3;
}
export function reorderStoryVideoReplicationEpisodes(_0x3ca95f = [], _0x5cbc04 = []) {
  const _0x4d4c6b = Array.isArray(_0x3ca95f) ? _0x3ca95f : [];
  const _0x2274fe = new Map(_0x4d4c6b.map(_0xe104d2 => [normalizeText(_0xe104d2?.id), _0xe104d2]));
  const _0x46fb2c = new Set();
  const _0x2a3887 = [];
  (Array.isArray(_0x5cbc04) ? _0x5cbc04 : []).forEach(_0xa23fce => {
    const _0x416f69 = normalizeText(_0xa23fce);
    const _0x14725d = _0x2274fe.get(_0x416f69);
    if (!_0x14725d || _0x46fb2c.has(_0x416f69)) {
      return;
    }
    _0x46fb2c.add(_0x416f69);
    _0x2a3887.push(_0x14725d);
  });
  _0x4d4c6b.forEach(_0x2ac22e => {
    const _0x5f5687 = normalizeText(_0x2ac22e?.id);
    if (!_0x5f5687 || _0x46fb2c.has(_0x5f5687)) {
      return;
    }
    _0x46fb2c.add(_0x5f5687);
    _0x2a3887.push(_0x2ac22e);
  });
  return _0x2a3887.map((_0x512674, _0xae02c8) => {
    _0x512674.number = _0xae02c8 + 1;
    return _0x512674;
  });
}
export function syncStoryVideoReplicationProject(_0x2a2ffa = {}) {
  const _0xd31c40 = Array.isArray(_0x2a2ffa.episodes) ? _0x2a2ffa.episodes : [];
  const _0x341f97 = _0xd31c40.filter(_0x42d7eb => _0x42d7eb?.replication?.status === "ready");
  const _0x562bec = _0xd31c40.filter(_0x5d9f39 => _0x5d9f39?.replication?.status === "failed");
  const _0x3e7339 = _0xd31c40.filter(_0x34dfba => ["queued", "uploading", "analyzing"].includes(_0x34dfba?.replication?.status));
  const _0x43129c = _0x341f97.map(_0x369285 => normalizeText(_0x369285?.script?.fullText)).filter(Boolean).join("\n\n");
  const _0x2db45e = _0x2a2ffa.project ||= {};
  _0x2db45e.replication = {
    ...(_0x2db45e.replication || {}),
    status: _0x3e7339.length ? "analyzing" : _0x562bec.length ? _0x341f97.length ? "partial" : "failed" : _0x341f97.length === _0xd31c40.length && _0xd31c40.length ? "ready" : "pending",
    completedCount: _0x341f97.length,
    failedCount: _0x562bec.length,
    totalCount: _0xd31c40.length
  };
  _0x2db45e.chapters = _0x341f97.map(_0x14af83 => ({
    id: _0x14af83.id,
    title: "第 " + _0x14af83.number + " 集：" + _0x14af83.title,
    content: _0x14af83.script.fullText
  }));
  _0x2db45e.plotScript = _0x43129c;
  _0x2db45e.narrationScript = _0x43129c;
  _0x2db45e.originalCreative = _0x43129c;
  _0x2db45e.summary = _0x341f97.map(_0x2b1dce => _0x2b1dce.synopsis).filter(Boolean).join("\n");
  const _0x13720d = _0xd31c40.map(_0xa0bc5e => _0xa0bc5e.id);
  const _0x239884 = _0x2db45e.compiledScript;
  const _0x54b065 = Boolean(_0x239884 && _0x239884.fullText === _0x43129c && JSON.stringify(_0x239884.episodeIds || []) === JSON.stringify(_0x13720d));
  _0x2db45e.compiledScript = _0x341f97.length === _0xd31c40.length && _0xd31c40.length ? {
    revision: 1,
    episodeIds: _0x13720d,
    fullText: _0x43129c,
    confirmedAt: _0x54b065 ? _0x239884.confirmedAt : Date.now()
  } : null;
  return _0x2a2ffa;
}
export function getStoryVideoReplicationSummary(_0x43d68c = {}) {
  syncStoryVideoReplicationProject(_0x43d68c);
  const _0x12a148 = _0x43d68c.project?.replication || {};
  return {
    status: _0x12a148.status || "pending",
    total: Math.max(0, Number(_0x12a148.totalCount) || 0),
    completed: Math.max(0, Number(_0x12a148.completedCount) || 0),
    failed: Math.max(0, Number(_0x12a148.failedCount) || 0),
    active: (_0x43d68c.episodes || []).filter(_0x4566ec => ["queued", "uploading", "analyzing"].includes(_0x4566ec?.replication?.status)).length
  };
}
export function getStoryVideoReplicationFooterState(_0x1ad6ee = {}, {
  localizing = false,
  planningStatus = ""
} = {}) {
  const _0x215ed9 = getStoryVideoReplicationSummary(_0x1ad6ee);
  const _0x5ee891 = _0x215ed9.active > 0;
  const _0xa37346 = _0x5ee891 || localizing;
  const _0x5e84eb = _0x215ed9.total > 0 && _0x215ed9.completed === _0x215ed9.total;
  if (localizing) {
    return {
      busy: _0xa37346,
      action: "localize-replication-assets",
      actionLabel: "资产本地化中",
      actionAttention: false,
      actionDisabled: true,
      title: normalizeText(planningStatus) || "正在本地化角色、场景与道具",
      hint: "视频解析结果已保留，本地化完成后会自动进入素材设定"
    };
  }
  return {
    busy: _0xa37346,
    action: _0x5e84eb ? "localize-replication-assets" : "retry-replication-analysis",
    actionLabel: _0x5ee891 ? "解析中" : _0x5e84eb ? "下一步：资产本地化" : "重试失败视频",
    actionAttention: _0x5e84eb,
    actionDisabled: _0x5ee891 || !_0x5e84eb && !_0x215ed9.failed,
    title: _0x5ee891 ? "正在整理提取素材，请稍后" : _0x5e84eb ? "视频解析完成" : _0x215ed9.failed ? "已完成 " + _0x215ed9.completed + "/" + _0x215ed9.total + " 条，" + _0x215ed9.failed + " 条解析失败" : "等待视频解析",
    hint: _0x5ee891 ? "已完成 " + _0x215ed9.completed + "/" + _0x215ed9.total + " 条，解析期间可调整卡片顺序" : _0x5e84eb ? "确认剧情和台词后，提取并本地化角色、场景与道具" : "解析失败的视频可重试，已完成结果不会重新生成"
  };
}