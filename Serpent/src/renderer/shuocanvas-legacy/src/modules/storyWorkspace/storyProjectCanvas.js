import { normalizeImageGenerationResult } from "../../components/aigenImage/imageGenerationResultRenderer.js";
import { normalizeAudioGenerationResult } from "../../components/audio-node/audioGenerationResultRenderer.js";
import { normalizeVideoGenerationResult } from "../../components/video-node/videoGenerationResultRenderer.js";
import { findAvailablePosition } from "../../core/math.js";
import { createDefaultStoryboardScriptState } from "../../core/storyboardScriptFactory.js";
import { getAutoMediaSizeByShortSide } from "../../services/fileService.js";
import { resolveOutputMediaSize } from "../../services/mediaRatioService.js";
import { localPathToUrl, normalizeLocalPath } from "../../utils/localMediaPath.js";
import { calculateGroupNodeBounds } from "../groupNodeLayout.js";
import { getNodeSpawnPrefs } from "../nodeSpawn.js";
import { buildStoryClipCanvasBindingKey, buildStoryLinkedCanvasName } from "./storyCanvasBinding.js";
import { buildStoryClipCanvasNodeData } from "./storyEpisodeCanvas.js";
import { normalizeStoryClipInputs } from "./storyClipInputSlots.js";
import { resolveStoryClipPromptAssetRefs } from "./storyClipMentions.js";
const NODE_GAP = 72;
const ASSET_COLUMNS = 5;
const ASSET_CATEGORY_GAP = 180;
const ASSET_CATEGORY_NOTE_HEIGHT = 180;
const ASSET_CATEGORY_MIN_WIDTH = 720;
const STAGE_GAP = 320;
const STAGE_GROUP_COLORS = Object.freeze({
  project: "var(--indigo)",
  assets: "var(--green)",
  episode: Object.freeze(["var(--gold)", "var(--purple)", "var(--cyan)"])
});
export const STORY_PROJECT_CANVAS_LAYOUT_VERSION = 4;
export const STORY_PROJECT_CANVAS_NODE_SIZES = Object.freeze({
  "comment-note": Object.freeze({
    width: 1400,
    height: 288
  }),
  group: Object.freeze({
    width: 512,
    height: 368
  }),
  "source-text": Object.freeze({
    width: 720,
    height: 480
  }),
  "source-image": Object.freeze({
    width: 512,
    height: 288
  }),
  "source-video": Object.freeze({
    width: 512,
    height: 288
  }),
  "source-audio": Object.freeze({
    width: 420,
    height: 180
  }),
  "ai-image": Object.freeze({
    width: 288,
    height: 288
  }),
  "storyboard-script": Object.freeze({
    width: 1024,
    height: 576
  }),
  "ai-video": Object.freeze({
    width: 512,
    height: 288
  })
});
function asObject(_0x3c816b) {
  if (_0x3c816b && typeof _0x3c816b === "object" && !Array.isArray(_0x3c816b)) {
    return _0x3c816b;
  } else {
    return {};
  }
}
function normalizeText(_0x126117) {
  return String(_0x126117 || "").trim();
}
function normalizeIndex(_0x684fd1, _0x59f8bd) {
  const _0x460f81 = Number(_0x684fd1);
  if (!Number.isFinite(_0x460f81) || _0x59f8bd <= 0) {
    return 0;
  }
  return Math.max(0, Math.min(_0x59f8bd - 1, Math.trunc(_0x460f81)));
}
function normalizeList(_0x2ebd17) {
  if (Array.isArray(_0x2ebd17)) {
    return _0x2ebd17.filter(Boolean);
  } else {
    return [];
  }
}
function withoutNodeType(_0xdbd56a) {
  const _0x257c96 = {
    ...asObject(_0xdbd56a)
  };
  delete _0x257c96.type;
  return _0x257c96;
}
function pushLabeledLine(_0x1b5040, _0x1ce2ff, _0xe60b74) {
  const _0x13b466 = normalizeText(_0xe60b74);
  if (_0x13b466) {
    _0x1b5040.push(_0x1ce2ff + "：" + _0x13b466);
  }
}
function getEpisodeLabel(_0x492b88 = {}) {
  const _0x558c00 = Math.max(0, Math.trunc(Number(_0x492b88.number) || 0));
  return [_0x558c00 > 0 ? "第 " + _0x558c00 + " 集" : "分集", normalizeText(_0x492b88.title)].filter(Boolean).join(" · ");
}
function getStableKeyPart(_0x297a51, _0x3a89b5) {
  return normalizeText(_0x297a51) || _0x3a89b5;
}
function getAssetKindLabel(_0x448b4e) {
  if (_0x448b4e === "scene") {
    return "场景";
  }
  if (_0x448b4e === "prop") {
    return "道具";
  }
  return "角色";
}
function getPositiveMediaDimension(..._0x37ef59) {
  for (const _0x1060ae of _0x37ef59) {
    const _0x51f2eb = Number(_0x1060ae);
    if (Number.isFinite(_0x51f2eb) && _0x51f2eb > 0) {
      return _0x51f2eb;
    }
  }
  return 0;
}
function resolveStoryAssetCanvasGeometry({
  asset = {},
  appearance = {},
  activeImage = {}
} = {}) {
  const _0x501fa4 = STORY_PROJECT_CANVAS_NODE_SIZES["ai-image"];
  const _0x449d44 = asObject(appearance.generatedImage);
  const _0x44affe = asObject(asset.generatedImage);
  const _0x50284d = getPositiveMediaDimension(appearance.imageWidth, appearance.naturalWidth, appearance.originalWidth, appearance.width, activeImage.imageWidth, activeImage.naturalWidth, activeImage.originalWidth, activeImage.width, _0x449d44.imageWidth, _0x449d44.naturalWidth, _0x449d44.originalWidth, _0x449d44.width, asset.imageWidth, asset.naturalWidth, asset.originalWidth, asset.width, _0x44affe.imageWidth, _0x44affe.naturalWidth, _0x44affe.originalWidth, _0x44affe.width);
  const _0x5e8d4b = getPositiveMediaDimension(appearance.imageHeight, appearance.naturalHeight, appearance.originalHeight, appearance.height, activeImage.imageHeight, activeImage.naturalHeight, activeImage.originalHeight, activeImage.height, _0x449d44.imageHeight, _0x449d44.naturalHeight, _0x449d44.originalHeight, _0x449d44.height, asset.imageHeight, asset.naturalHeight, asset.originalHeight, asset.height, _0x44affe.imageHeight, _0x44affe.naturalHeight, _0x44affe.originalHeight, _0x44affe.height);
  if (!(_0x50284d > 0) || !(_0x5e8d4b > 0)) {
    return {
      width: _0x501fa4.width,
      height: _0x501fa4.height,
      imageWidth: 0,
      imageHeight: 0
    };
  }
  return {
    ...getAutoMediaSizeByShortSide(_0x50284d, _0x5e8d4b),
    imageWidth: _0x50284d,
    imageHeight: _0x5e8d4b
  };
}
async function resolveStoryAssetImageRecordSize(_0x449441 = {}) {
  const _0x1a94d9 = resolveStoryAssetCanvasGeometry({
    asset: _0x449441,
    appearance: _0x449441,
    activeImage: asObject(_0x449441.generatedImage)
  });
  if (_0x1a94d9.imageWidth > 0 && _0x1a94d9.imageHeight > 0) {
    return _0x449441;
  }
  const _0x219565 = asObject(_0x449441.generatedImage);
  const _0x121717 = await resolveOutputMediaSize({
    localPath: normalizeText(_0x219565.localPath || _0x219565.originalLocalPath || _0x449441.localPath),
    imageUrl: normalizeText(_0x449441.imageUrl || _0x219565.imageUrl || _0x219565.url),
    sourceUrl: normalizeText(_0x219565.sourceUrl),
    thumbUrl: normalizeText(_0x219565.thumbUrl)
  });
  if (_0x121717) {
    return {
      ..._0x449441,
      imageWidth: _0x121717.width,
      imageHeight: _0x121717.height
    };
  } else {
    return _0x449441;
  }
}
async function resolveStoryProjectAssetImageSizes(_0x5a2acd = []) {
  return Promise.all(normalizeList(_0x5a2acd).map(async _0x2e99a3 => {
    const _0x761417 = normalizeList(_0x2e99a3.appearances);
    if (!_0x761417.length) {
      return resolveStoryAssetImageRecordSize(_0x2e99a3);
    }
    return {
      ..._0x2e99a3,
      appearances: await Promise.all(_0x761417.map(_0x326600 => resolveStoryAssetImageRecordSize(_0x326600)))
    };
  }));
}
function createPlanEntry(_0x485965, _0x11564b, _0x4bf1e1, _0x68bdf7 = {}) {
  const _0x4bd2c3 = normalizeText(_0x11564b?.type);
  const _0xdc578 = STORY_PROJECT_CANVAS_NODE_SIZES[_0x4bd2c3];
  if (!_0x4bd2c3 || !_0xdc578) {
    throw new Error("不支持的项目画布节点类型：" + (_0x4bd2c3 || "unknown"));
  }
  const _0x302e5b = Math.max(1, Number(_0x68bdf7.width) || _0xdc578.width);
  const _0x14c41a = Math.max(1, Number(_0x68bdf7.height) || _0xdc578.height);
  const _0x2e5f39 = normalizeList(_0x68bdf7.inputConnections).map(_0x37e183 => {
    if (typeof _0x37e183 === "string") {
      return {
        key: normalizeText(_0x37e183),
        preferredRefSlot: ""
      };
    }
    return {
      key: normalizeText(_0x37e183?.key),
      preferredRefSlot: normalizeText(_0x37e183?.preferredRefSlot)
    };
  }).filter(_0xc5c46f => _0xc5c46f.key);
  return {
    key: _0x485965,
    type: _0x4bd2c3,
    data: _0x11564b,
    width: _0x302e5b,
    height: _0x14c41a,
    position: {
      x: Number(_0x4bf1e1?.x) || 0,
      y: Number(_0x4bf1e1?.y) || 0
    },
    ...(normalizeText(_0x68bdf7.parentKey) ? {
      parentKey: normalizeText(_0x68bdf7.parentKey)
    } : {}),
    ...(normalizeList(_0x68bdf7.inputKeys).length ? {
      inputKeys: normalizeList(_0x68bdf7.inputKeys).map(normalizeText).filter(Boolean)
    } : {}),
    ...(_0x2e5f39.length ? {
      inputConnections: _0x2e5f39
    } : {})
  };
}
export function buildStoryProjectCanvasName(_0x28a082 = {}, _0x5833ad = {}) {
  return buildStoryLinkedCanvasName(_0x28a082, _0x5833ad);
}
export function buildStoryProjectOverviewNodeData({
  project = {}
} = {}) {
  const _0x7f44cd = [];
  pushLabeledLine(_0x7f44cd, "项目名称", buildStoryProjectCanvasName(project));
  pushLabeledLine(_0x7f44cd, "类型", project.storyType);
  pushLabeledLine(_0x7f44cd, "目标受众", project.targetAudience);
  pushLabeledLine(_0x7f44cd, "一句话故事", project.logline);
  pushLabeledLine(_0x7f44cd, "故事摘要", project.summary);
  pushLabeledLine(_0x7f44cd, "故事背景", project.background);
  pushLabeledLine(_0x7f44cd, "世界设定", project.setting);
  pushLabeledLine(_0x7f44cd, "核心钩子", project.coreHook);
  return {
    type: "source-text",
    name: buildStoryProjectCanvasName(project) + " · 项目设定",
    content: _0x7f44cd.join("\n\n"),
    storyWorkspaceBinding: {
      projectId: normalizeText(project.id),
      kind: "project-overview"
    }
  };
}
export function buildStoryProjectCopyNodeData({
  project = {}
} = {}) {
  const _0x369e64 = [];
  const _0x1e7433 = normalizeText(project.originalCreative || project.sourceDocument?.text);
  if (_0x1e7433) {
    _0x369e64.push("原始创意\n" + _0x1e7433);
  }
  const _0x2ccc18 = normalizeText(project.plotScript);
  if (_0x2ccc18 && _0x2ccc18 !== _0x1e7433) {
    _0x369e64.push("完整文案\n" + _0x2ccc18);
  }
  const _0xfa9677 = normalizeText(project.narrationScript);
  if (_0xfa9677 && _0xfa9677 !== _0x2ccc18 && _0xfa9677 !== _0x1e7433) {
    _0x369e64.push("旁白文案\n" + _0xfa9677);
  }
  return {
    type: "source-text",
    name: buildStoryProjectCanvasName(project) + " · 完整文案",
    content: _0x369e64.join("\n\n---\n\n"),
    storyWorkspaceBinding: {
      projectId: normalizeText(project.id),
      kind: "project-copy"
    }
  };
}
export function buildStoryAssetCanvasNodeData({
  project = {},
  asset = {},
  appearance = {},
  modelId = "",
  provider = "",
  generationParams = {}
} = {}) {
  const _0x2f9d97 = asObject(appearance.generatedImage);
  const _0x575703 = normalizeText(appearance.imageUrl || _0x2f9d97.imageUrl || _0x2f9d97.url || _0x2f9d97.sourceUrl || asset.imageUrl);
  const _0x39b7ee = Object.keys(_0x2f9d97).length > 0 ? [{
    ..._0x2f9d97,
    imageUrl: _0x575703 || _0x2f9d97.imageUrl
  }] : _0x575703 ? [{
    url: _0x575703,
    imageUrl: _0x575703,
    sourceUrl: _0x575703,
    thumbUrl: _0x575703
  }] : [];
  const _0x4c6f45 = normalizeImageGenerationResult({
    images: _0x39b7ee
  }).items;
  const _0xed3b70 = normalizeIndex(appearance.activeIndex, _0x4c6f45.length);
  const _0x41c538 = _0x4c6f45[_0xed3b70] || {};
  const _0x157b26 = resolveStoryAssetCanvasGeometry({
    asset: asset,
    appearance: appearance,
    activeImage: _0x41c538
  });
  const _0xd46135 = normalizeText(appearance.name);
  const _0x7b39e8 = !_0xd46135 || _0xd46135 === "基础形象";
  return {
    type: "ai-image",
    name: [getAssetKindLabel(asset.kind), normalizeText(asset.name), _0x7b39e8 ? "" : _0xd46135].filter(Boolean).join(" · "),
    prompt: normalizeText(appearance.prompt || asset.prompt || appearance.description || asset.description),
    model: normalizeText(appearance.modelId || appearance.generation?.modelId || modelId),
    provider: normalizeText(appearance.provider || appearance.generation?.provider || provider),
    generationParams: {
      ...asObject(generationParams),
      ...asObject(appearance.generationParams)
    },
    images: _0x4c6f45,
    mainImageIndex: _0xed3b70,
    isImagesExpanded: false,
    imageUrl: normalizeText(_0x41c538.imageUrl || _0x41c538.url || _0x575703),
    sourceUrl: normalizeText(_0x41c538.sourceUrl),
    thumbUrl: normalizeText(_0x41c538.thumbUrl),
    localPath: normalizeText(_0x41c538.localPath),
    originalLocalPath: normalizeText(_0x41c538.originalLocalPath),
    displayLocalPath: normalizeText(_0x41c538.displayLocalPath),
    thumbLocalPath: normalizeText(_0x41c538.thumbLocalPath),
    sourceId: normalizeText(_0x41c538.sourceId),
    thumbId: normalizeText(_0x41c538.thumbId),
    width: _0x157b26.width,
    height: _0x157b26.height,
    ...(_0x157b26.imageWidth > 0 && _0x157b26.imageHeight > 0 ? {
      imageWidth: _0x157b26.imageWidth,
      imageHeight: _0x157b26.imageHeight
    } : {}),
    storyWorkspaceBinding: {
      projectId: normalizeText(project.id),
      kind: "asset-image",
      assetId: normalizeText(asset.id),
      appearanceId: normalizeText(appearance.id),
      assetKind: normalizeText(asset.kind) || "character"
    }
  };
}
export function buildStoryEpisodeCopyNodeData({
  project = {},
  episode = {}
} = {}) {
  const _0x4f06ee = [];
  pushLabeledLine(_0x4f06ee, "分集", getEpisodeLabel(episode));
  pushLabeledLine(_0x4f06ee, "本集梗概", episode.synopsis);
  pushLabeledLine(_0x4f06ee, "本集钩子", episode.hook || episode.coreHook);
  const _0x52d8f0 = normalizeText(typeof episode.script === "string" ? episode.script : episode.script?.fullText);
  if (_0x52d8f0) {
    _0x4f06ee.push("完整剧本\n" + _0x52d8f0);
  }
  return {
    type: "source-text",
    name: getEpisodeLabel(episode) + " · 分集文案",
    content: _0x4f06ee.join("\n\n"),
    storyWorkspaceBinding: {
      projectId: normalizeText(project.id),
      episodeId: normalizeText(episode.id),
      kind: "episode-copy"
    }
  };
}
function buildAssetLookup(_0xdd4ec = []) {
  const _0x18f4c3 = new Map();
  normalizeList(_0xdd4ec).forEach(_0xe801a7 => {
    [_0xe801a7.id, _0xe801a7.planningRef].map(normalizeText).filter(Boolean).forEach(_0x2adc0c => {
      _0x18f4c3.set(_0x2adc0c, _0xe801a7);
    });
  });
  return _0x18f4c3;
}
function describeShotAssets(_0x31fb89, _0x11c88b) {
  const _0x250ac0 = {
    character: [],
    scene: [],
    prop: [],
    all: []
  };
  normalizeList(_0x31fb89).forEach(_0x34e4c2 => {
    const _0x25ad47 = normalizeText(_0x34e4c2?.assetRef);
    const _0x4b0305 = _0x11c88b.get(_0x25ad47);
    if (!_0x4b0305) {
      return;
    }
    const _0x1bbc7f = normalizeText(_0x4b0305.name) || _0x25ad47;
    const _0x2b56e9 = normalizeText(_0x34e4c2?.appearanceRef);
    const _0x46a846 = normalizeList(_0x4b0305.appearances).find(_0x35a92 => normalizeText(_0x35a92?.id) === _0x2b56e9 || normalizeText(_0x35a92?.planningRef) === _0x2b56e9);
    const _0xef9ad3 = _0x46a846 && normalizeText(_0x46a846.name) !== "基础形象" ? _0x1bbc7f + " · " + normalizeText(_0x46a846.name) : _0x1bbc7f;
    const _0x4b96c6 = ["character", "scene", "prop"].includes(_0x4b0305.kind) ? _0x4b0305.kind : "character";
    if (!_0x250ac0[_0x4b96c6].includes(_0xef9ad3)) {
      _0x250ac0[_0x4b96c6].push(_0xef9ad3);
    }
    if (!_0x250ac0.all.includes(_0xef9ad3)) {
      _0x250ac0.all.push(_0xef9ad3);
    }
  });
  return _0x250ac0;
}
export function buildStoryEpisodeStoryboardNodeData({
  project = {},
  episode = {},
  assets = []
} = {}) {
  const _0x2b5c87 = buildAssetLookup(assets);
  const _0x3f3c55 = [];
  normalizeList(episode.clips).forEach((_0x12f282, _0x1b6e87) => {
    normalizeList(_0x12f282.shots).forEach((_0x3a2be7, _0x43d5f0) => {
      const _0x25edb2 = describeShotAssets(_0x3a2be7.assetUsages, _0x2b5c87);
      const _0xfc8a9e = Number(_0x3a2be7.durationSec || _0x3a2be7.durationSeconds);
      _0x3f3c55.push({
        镜号: Math.max(1, Math.trunc(Number(_0x12f282.number) || _0x1b6e87 + 1)) + "-" + (_0x43d5f0 + 1),
        时长: normalizeText(_0x3a2be7.time) || (Number.isFinite(_0xfc8a9e) && _0xfc8a9e > 0 ? _0xfc8a9e + "s" : ""),
        场景: _0x25edb2.scene.join("、"),
        画面描述: normalizeText(_0x3a2be7.visual),
        角色: _0x25edb2.character.join("、"),
        角色描述: _0x25edb2.character.join("、"),
        角色动作: normalizeText(_0x3a2be7.action),
        情绪: normalizeText(_0x3a2be7.emotion || _0x12f282.creativeIntent),
        参考: _0x25edb2.all.join("、"),
        图片提示词: normalizeText(_0x3a2be7.imagePrompt),
        视频提示词: normalizeText(_0x3a2be7.videoPrompt || _0x12f282.prompt),
        对白: [normalizeText(_0x3a2be7.dialogue), normalizeText(_0x3a2be7.voiceover)].filter(Boolean).join("\n"),
        音效: normalizeText(_0x3a2be7.audio)
      });
    });
  });
  const _0x133f6b = getEpisodeLabel(episode) + " · 分镜表";
  return {
    type: "storyboard-script",
    name: _0x133f6b,
    storyboardScript: createDefaultStoryboardScriptState({
      title: _0x133f6b,
      mediaMode: "video",
      rows: _0x3f3c55
    }),
    storyWorkspaceBinding: {
      projectId: normalizeText(project.id),
      episodeId: normalizeText(episode.id),
      kind: "episode-storyboard"
    }
  };
}
function buildStoryStageAnnotationNodeData({
  project = {},
  episode = null,
  stage = "",
  title = "",
  content = ""
} = {}) {
  return {
    type: "comment-note",
    name: normalizeText(title),
    content: normalizeText(content),
    style: {
      fontSize: 40,
      textColor: "white",
      backgroundColor: "transparent"
    },
    storyWorkspaceBinding: {
      projectId: normalizeText(project.id),
      episodeId: normalizeText(episode?.id),
      kind: "stage-annotation",
      stage: normalizeText(stage),
      canvasScope: "project"
    }
  };
}
function normalizeStoryAssetKind(_0x239e1f) {
  const _0xfbe5b0 = normalizeText(_0x239e1f);
  if (["character", "scene", "prop"].includes(_0xfbe5b0)) {
    return _0xfbe5b0;
  } else {
    return "character";
  }
}
function buildStoryClipInputMediaLocation(_0x2a7869 = {}) {
  const _0x356efa = normalizeText(_0x2a7869?.url || _0x2a7869?.localUrl || _0x2a7869?.imageUrl || _0x2a7869?.videoUrl || _0x2a7869?.audioUrl || _0x2a7869?.localPath);
  const _0x592522 = normalizeLocalPath(_0x356efa);
  return {
    localPath: _0x592522,
    url: localPathToUrl(_0x592522) || _0x356efa
  };
}
function buildStoryClipInputCanvasNodeData({
  project = {},
  episode = {},
  clip = {},
  input = {},
  kind = "image",
  inputIndex = 0
} = {}) {
  const _0x43b173 = buildStoryClipInputMediaLocation(input);
  if (!_0x43b173.url) {
    return null;
  }
  const _0x629272 = getEpisodeLabel(episode);
  const _0x45473a = Math.max(1, Math.trunc(Number(clip.number) || 1));
  const _0x59daf3 = {
    image: "图片入参",
    video: "视频入参",
    audio: "音频入参"
  }[kind] || "媒体入参";
  const _0x207920 = normalizeText(input.name) || _0x629272 + " · 片段 " + _0x45473a + " · " + _0x59daf3 + " " + (inputIndex + 1);
  const _0x1bb288 = {
    projectId: normalizeText(project.id),
    episodeId: normalizeText(episode.id),
    clipId: normalizeText(clip.id),
    kind: "clip-input",
    inputKind: kind,
    slotId: normalizeText(input.slotId),
    canvasScope: "project"
  };
  if (kind === "video") {
    const _0x3ced84 = normalizeVideoGenerationResult({
      videos: [{
        localPath: _0x43b173.localPath,
        videoUrl: _0x43b173.url
      }]
    }).items[0];
    return {
      type: "source-video",
      name: _0x207920,
      videos: _0x3ced84 ? [_0x3ced84] : [],
      mainVideoIndex: 0,
      videoUrl: normalizeText(_0x3ced84?.videoUrl || _0x43b173.url),
      localPath: normalizeText(_0x3ced84?.localPath || _0x43b173.localPath),
      storyWorkspaceBinding: _0x1bb288
    };
  }
  if (kind === "audio") {
    const _0x599953 = normalizeAudioGenerationResult({
      audios: [{
        localPath: _0x43b173.localPath,
        audioUrl: _0x43b173.url
      }]
    }).items[0];
    return {
      type: "source-audio",
      name: _0x207920,
      fileName: _0x207920,
      audios: _0x599953 ? [_0x599953] : [],
      mainAudioIndex: 0,
      audioUrl: normalizeText(_0x599953?.audioUrl || _0x43b173.url),
      localPath: normalizeText(_0x599953?.localPath || _0x43b173.localPath),
      storyWorkspaceBinding: _0x1bb288
    };
  }
  const _0xc6b980 = normalizeImageGenerationResult({
    images: [{
      localPath: _0x43b173.localPath,
      imageUrl: _0x43b173.url,
      sourceUrl: _0x43b173.url
    }]
  }).items[0];
  return {
    type: "source-image",
    name: _0x207920,
    images: _0xc6b980 ? [_0xc6b980] : [],
    mainImageIndex: 0,
    imageUrl: normalizeText(_0xc6b980?.imageUrl || _0x43b173.url),
    sourceUrl: normalizeText(_0xc6b980?.sourceUrl || _0x43b173.url),
    localPath: normalizeText(_0xc6b980?.localPath || _0x43b173.localPath),
    storyWorkspaceBinding: _0x1bb288
  };
}
function findStoryAssetCanvasRecord(_0x547567 = [], _0x5ac27a = {}) {
  const _0x18637 = normalizeText(_0x5ac27a.storyAssetId || _0x5ac27a.sourceStoryAssetId || _0x5ac27a.assetRef || _0x5ac27a.assetId);
  const _0x6e3973 = normalizeText(_0x5ac27a.appearanceId || _0x5ac27a.appearanceRef || _0x5ac27a.storyAppearanceId);
  const _0x4719b9 = buildStoryClipInputMediaLocation(_0x5ac27a).url;
  const _0x20e23e = normalizeList(_0x547567).filter(_0x232d1c => !_0x18637 || normalizeList(_0x232d1c.assetRefs).includes(_0x18637));
  const _0x5d4932 = _0x20e23e.find(_0x28f815 => _0x6e3973 && normalizeList(_0x28f815.appearanceRefs).includes(_0x6e3973));
  if (_0x5d4932) {
    return _0x5d4932;
  }
  if (_0x4719b9) {
    const _0x957537 = normalizeList(_0x547567).find(_0x316688 => normalizeList(_0x316688.imageRefs).includes(_0x4719b9));
    if (_0x957537) {
      return _0x957537;
    }
  }
  if (_0x18637) {
    return _0x20e23e[0] || null;
  } else {
    return null;
  }
}
function buildStoryClipCanvasInputPlan({
  project = {},
  episode = {},
  clip = {},
  assets = [],
  assetRecords = [],
  clipKey = ""
} = {}) {
  const _0x2e789d = new Map();
  const _0x7554b4 = (_0x25a40e, _0x427e6c = "") => {
    const _0xdb5e16 = normalizeText(_0x25a40e);
    if (!_0xdb5e16) {
      return;
    }
    const _0x3919c3 = normalizeText(_0x427e6c);
    const _0x388d52 = _0x2e789d.get(_0xdb5e16);
    if (!_0x388d52 || !_0x388d52.preferredRefSlot && _0x3919c3) {
      _0x2e789d.set(_0xdb5e16, {
        key: _0xdb5e16,
        preferredRefSlot: _0x3919c3
      });
    }
  };
  const _0x1f34cf = (_0x71d6da, _0x107bc1 = "") => {
    const _0x580d74 = findStoryAssetCanvasRecord(assetRecords, _0x71d6da);
    if (_0x580d74?.key) {
      _0x7554b4(_0x580d74.key, _0x107bc1);
    }
    return _0x580d74;
  };
  [...normalizeList(clip.assetUsages), ...normalizeList(clip.shots).flatMap(_0x393b3b => normalizeList(_0x393b3b?.assetUsages))].forEach(_0x2fbcee => _0x1f34cf(_0x2fbcee));
  normalizeList(clip.assetIds).forEach(_0x99785b => {
    _0x1f34cf({
      assetId: _0x99785b
    });
  });
  resolveStoryClipPromptAssetRefs(clip.prompt, {
    assets: assets,
    episode: episode
  }).forEach(_0x4e9831 => _0x1f34cf(_0x4e9831));
  const _0x3a3649 = [];
  const _0x146206 = normalizeStoryClipInputs(clip.inputs);
  ["image", "video", "audio"].forEach(_0x5ad403 => {
    normalizeList(_0x146206[_0x5ad403]).forEach((_0x2f76d0, _0x4cf7ed) => {
      const _0x60924a = normalizeText(_0x2f76d0.slotId);
      const _0x416418 = _0x1f34cf(_0x2f76d0, _0x60924a);
      if (_0x416418) {
        return;
      }
      const _0x4874ad = buildStoryClipInputCanvasNodeData({
        project: project,
        episode: episode,
        clip: clip,
        input: _0x2f76d0,
        kind: _0x5ad403,
        inputIndex: _0x4cf7ed
      });
      if (!_0x4874ad) {
        return;
      }
      const _0x227c18 = encodeURIComponent(_0x60924a || _0x5ad403 + "-" + (_0x4cf7ed + 1));
      const _0x4907ce = clipKey + ":input:" + _0x5ad403 + ":" + _0x227c18;
      _0x3a3649.push({
        key: _0x4907ce,
        data: _0x4874ad,
        width: STORY_PROJECT_CANVAS_NODE_SIZES[_0x4874ad.type].width,
        height: STORY_PROJECT_CANVAS_NODE_SIZES[_0x4874ad.type].height
      });
      _0x7554b4(_0x4907ce, _0x60924a);
    });
  });
  return {
    inputEntries: _0x3a3649,
    inputConnections: [..._0x2e789d.values()]
  };
}
function getPlanBounds(_0x4898af = []) {
  const _0x4bc2e2 = normalizeList(_0x4898af);
  if (!_0x4bc2e2.length) {
    return {
      left: 0,
      top: 0,
      right: 0,
      bottom: 0,
      width: 0,
      height: 0
    };
  }
  const _0x50e7e4 = Math.min(..._0x4bc2e2.map(_0x5bc772 => _0x5bc772.position.x));
  const _0x2f218b = Math.min(..._0x4bc2e2.map(_0x70342a => _0x70342a.position.y));
  const _0x3192e1 = Math.max(..._0x4bc2e2.map(_0xcedd44 => _0xcedd44.position.x + _0xcedd44.width));
  const _0x445152 = Math.max(..._0x4bc2e2.map(_0x461647 => _0x461647.position.y + _0x461647.height));
  return {
    left: _0x50e7e4,
    top: _0x2f218b,
    right: _0x3192e1,
    bottom: _0x445152,
    width: _0x3192e1 - _0x50e7e4,
    height: _0x445152 - _0x2f218b
  };
}
function wrapStoryStageEntriesInGroup({
  entries = [],
  project = {},
  episode = null,
  key = "",
  stage = "",
  name = "",
  color = "var(--indigo)"
} = {}) {
  const _0x5e340b = normalizeList(entries).filter(_0x6fd0a8 => _0x6fd0a8.type !== "group");
  if (!_0x5e340b.length) {
    return [];
  }
  const _0x52878b = calculateGroupNodeBounds(_0x5e340b.map(_0x296c35 => ({
    x: _0x296c35.position.x,
    y: _0x296c35.position.y,
    width: _0x296c35.width,
    height: _0x296c35.height
  })));
  const _0x289115 = normalizeText(key);
  const _0x5265f1 = createPlanEntry(_0x289115, {
    type: "group",
    name: normalizeText(name),
    color: color,
    width: _0x52878b.width,
    height: _0x52878b.height,
    storyWorkspaceBinding: {
      projectId: normalizeText(project.id),
      episodeId: normalizeText(episode?.id),
      kind: "stage-group",
      stage: normalizeText(stage),
      canvasScope: "project"
    }
  }, {
    x: _0x52878b.x,
    y: _0x52878b.y
  }, {
    width: _0x52878b.width,
    height: _0x52878b.height
  });
  return [_0x5265f1, ..._0x5e340b.map(_0x24bf32 => ({
    ..._0x24bf32,
    parentKey: _0x289115
  }))];
}
function appendHorizontalStoryStage(_0x391a9c, _0x942b92, _0x218692) {
  const _0x3dac9c = getPlanBounds(_0x942b92);
  const _0x32a716 = _0x218692 - _0x3dac9c.left;
  const _0x37695c = -_0x3dac9c.top;
  _0x391a9c.push(..._0x942b92.map(_0x2086ca => ({
    ..._0x2086ca,
    position: {
      x: _0x2086ca.position.x + _0x32a716,
      y: _0x2086ca.position.y + _0x37695c
    }
  })));
  return _0x218692 + _0x3dac9c.width + STAGE_GAP;
}
function appendVerticalStoryStage(_0x7cb046, _0x25129a, _0x303252, _0x2ee08e) {
  const _0xcfe163 = getPlanBounds(_0x25129a);
  const _0x134f46 = _0x303252 - _0xcfe163.left;
  const _0x1a1aaa = _0x2ee08e - _0xcfe163.top;
  _0x7cb046.push(..._0x25129a.map(_0x4ce91e => ({
    ..._0x4ce91e,
    position: {
      x: _0x4ce91e.position.x + _0x134f46,
      y: _0x4ce91e.position.y + _0x1a1aaa
    }
  })));
  return _0x2ee08e + _0xcfe163.height + STAGE_GAP;
}
export function buildStoryProjectCanvasPlan({
  project = {},
  assets = [],
  episodes = [],
  imageModelId = "",
  imageProvider = "",
  imageGenerationParams = {},
  videoModelId = "",
  videoProvider = "",
  videoGenerationParams = {}
} = {}) {
  const _0x289c54 = [];
  const _0x1a715a = STORY_PROJECT_CANVAS_NODE_SIZES["comment-note"];
  const _0x2dc14a = STORY_PROJECT_CANVAS_NODE_SIZES["source-text"];
  const _0x40c859 = STORY_PROJECT_CANVAS_NODE_SIZES["ai-video"];
  let _0x425076 = 0;
  const _0x4b8201 = [];
  const _0x940cc0 = _0x1a715a.height + NODE_GAP;
  _0x4b8201.push(createPlanEntry("stage:project:annotation", buildStoryStageAnnotationNodeData({
    project: project,
    stage: "project",
    title: "阶段 1 · 项目设定",
    content: "项目摘要、世界设定与完整文案。"
  }), {
    x: 0,
    y: 0
  }));
  _0x4b8201.push(createPlanEntry("project:overview", buildStoryProjectOverviewNodeData({
    project: project
  }), {
    x: 0,
    y: _0x940cc0
  }));
  const _0x3983cd = buildStoryProjectCopyNodeData({
    project: project
  });
  if (normalizeText(_0x3983cd.content)) {
    _0x4b8201.push(createPlanEntry("project:copy", _0x3983cd, {
      x: _0x2dc14a.width + NODE_GAP,
      y: _0x940cc0
    }));
  }
  _0x425076 = appendHorizontalStoryStage(_0x289c54, wrapStoryStageEntriesInGroup({
    entries: _0x4b8201,
    project: project,
    key: "stage:project:group",
    stage: "project",
    name: "阶段 1 · 项目设定",
    color: STAGE_GROUP_COLORS.project
  }), _0x425076);
  const _0x5298a3 = [];
  const _0x4b045f = [];
  normalizeList(assets).forEach((_0x299e1d, _0x2b0853) => {
    const _0xebb4d9 = normalizeList(_0x299e1d.appearances);
    const _0x519a29 = _0xebb4d9.length > 0 ? _0xebb4d9 : [{
      id: getStableKeyPart(_0x299e1d.id || _0x299e1d.planningRef, "asset-" + (_0x2b0853 + 1)) + "-base",
      name: "基础形象",
      prompt: _0x299e1d.prompt,
      imageUrl: _0x299e1d.imageUrl,
      generatedImage: _0x299e1d.generatedImage
    }];
    _0x519a29.forEach((_0x22adec, _0x3ec66d) => {
      const _0xafd086 = getStableKeyPart(_0x299e1d.id || _0x299e1d.planningRef, "asset-" + (_0x2b0853 + 1));
      const _0x156653 = getStableKeyPart(_0x22adec.id || _0x22adec.planningRef, "appearance-" + (_0x3ec66d + 1));
      const _0x40e429 = buildStoryAssetCanvasNodeData({
        project: project,
        asset: _0x299e1d,
        appearance: _0x22adec,
        modelId: imageModelId,
        provider: imageProvider,
        generationParams: imageGenerationParams
      });
      const _0x49348e = Math.max(1, Number(_0x40e429.width) || STORY_PROJECT_CANVAS_NODE_SIZES["ai-image"].width);
      const _0x33f785 = Math.max(1, Number(_0x40e429.height) || STORY_PROJECT_CANVAS_NODE_SIZES["ai-image"].height);
      _0x4b045f.push({
        key: "asset:" + _0xafd086 + ":" + _0x156653,
        data: _0x40e429,
        width: _0x49348e,
        height: _0x33f785,
        kind: normalizeStoryAssetKind(_0x299e1d.kind),
        assetRefs: [_0x299e1d.id, _0x299e1d.planningRef].map(normalizeText).filter(Boolean),
        appearanceRefs: [_0x22adec.id, _0x22adec.planningRef].map(normalizeText).filter(Boolean),
        imageRefs: [_0x22adec.imageUrl, _0x22adec.localPath, _0x40e429.imageUrl, _0x40e429.localPath, _0x40e429.sourceUrl, _0x40e429.images?.[0]?.imageUrl, _0x40e429.images?.[0]?.localPath].map(_0x30e144 => buildStoryClipInputMediaLocation({
          url: _0x30e144
        }).url).filter(Boolean)
      });
    });
  });
  const _0x159a94 = [{
    kind: "character",
    title: "角色素材",
    content: "人物角色及其形象。"
  }, {
    kind: "scene",
    title: "场景素材",
    content: "场景环境及其视觉参考。"
  }, {
    kind: "prop",
    title: "道具素材",
    content: "道具及其视觉参考。"
  }];
  const _0x2e9d78 = _0x1a715a.height + NODE_GAP;
  let _0x582d24 = _0x2e9d78;
  let _0x296432 = _0x1a715a.width;
  _0x159a94.forEach(_0x37c0c6 => {
    const _0x3bfd86 = _0x4b045f.filter(_0x477aea => _0x477aea.kind === _0x37c0c6.kind);
    const _0x34997c = [];
    for (let _0x1f1ca7 = 0; _0x1f1ca7 < _0x3bfd86.length; _0x1f1ca7 += ASSET_COLUMNS) {
      const _0x10a9b5 = _0x3bfd86.slice(_0x1f1ca7, _0x1f1ca7 + ASSET_COLUMNS);
      _0x34997c.push({
        items: _0x10a9b5,
        width: _0x10a9b5.reduce((_0x348e8e, _0x2163f9, _0x2bda8e) => _0x348e8e + _0x2163f9.width + (_0x2bda8e > 0 ? NODE_GAP : 0), 0),
        height: Math.max(..._0x10a9b5.map(_0x291ff6 => _0x291ff6.height))
      });
    }
    const _0x42f9ee = Math.max(ASSET_CATEGORY_MIN_WIDTH, ..._0x34997c.map(_0x17824b => _0x17824b.width));
    _0x296432 = Math.max(_0x296432, _0x42f9ee);
    _0x5298a3.push(createPlanEntry("stage:assets:" + _0x37c0c6.kind + ":annotation", buildStoryStageAnnotationNodeData({
      project: project,
      stage: "assets-" + _0x37c0c6.kind,
      title: _0x37c0c6.title,
      content: _0x37c0c6.content
    }), {
      x: 0,
      y: _0x582d24
    }, {
      width: _0x42f9ee,
      height: ASSET_CATEGORY_NOTE_HEIGHT
    }));
    let _0x1f488a = _0x582d24 + ASSET_CATEGORY_NOTE_HEIGHT + NODE_GAP;
    _0x34997c.forEach(_0x5bd2de => {
      let _0x5a623c = 0;
      _0x5bd2de.items.forEach(_0x31bddc => {
        _0x5298a3.push(createPlanEntry(_0x31bddc.key, _0x31bddc.data, {
          x: _0x5a623c,
          y: _0x1f488a
        }, {
          width: _0x31bddc.width,
          height: _0x31bddc.height
        }));
        _0x5a623c += _0x31bddc.width + NODE_GAP;
      });
      _0x1f488a += _0x5bd2de.height + NODE_GAP;
    });
    const _0x353aff = _0x34997c.length ? _0x1f488a - NODE_GAP : _0x582d24 + ASSET_CATEGORY_NOTE_HEIGHT;
    _0x582d24 = _0x353aff + ASSET_CATEGORY_GAP;
  });
  _0x5298a3.unshift(createPlanEntry("stage:assets:annotation", buildStoryStageAnnotationNodeData({
    project: project,
    stage: "assets",
    title: "阶段 2 · 素材设定",
    content: "角色、场景和道具素材。"
  }), {
    x: 0,
    y: 0
  }, {
    width: _0x296432,
    height: _0x1a715a.height
  }));
  _0x425076 = appendHorizontalStoryStage(_0x289c54, wrapStoryStageEntriesInGroup({
    entries: _0x5298a3,
    project: project,
    key: "stage:assets:group",
    stage: "assets",
    name: "阶段 2 · 素材设定",
    color: STAGE_GROUP_COLORS.assets
  }), _0x425076);
  const _0x13f59e = _0x425076;
  let _0x4f1c56 = 0;
  normalizeList(episodes).slice(0, 1).forEach((_0x454c60, _0x30f653) => {
    const _0x56500a = [];
    const _0x1af77d = getStableKeyPart(_0x454c60.id || _0x454c60.planningRef, "episode-" + (_0x30f653 + 1));
    const _0x2ce519 = [createPlanEntry("episode:" + _0x1af77d + ":copy", buildStoryEpisodeCopyNodeData({
      project: project,
      episode: _0x454c60
    }), {
      x: 0,
      y: 0
    })];
    const _0x4439aa = normalizeList(_0x454c60.clips).map((_0x16cf2d, _0x5ae98d) => {
      const _0x3b460e = buildStoryClipCanvasBindingKey({
        episode: _0x454c60,
        clip: _0x16cf2d,
        episodeIndex: _0x30f653,
        clipIndex: _0x5ae98d
      });
      const _0x5cea30 = buildStoryClipCanvasInputPlan({
        project: project,
        episode: _0x454c60,
        clip: _0x16cf2d,
        assets: assets,
        assetRecords: _0x4b045f,
        clipKey: _0x3b460e
      });
      const _0x57fae6 = _0x5cea30.inputEntries.reduce((_0x28f258, _0x26ef21, _0x540a88) => _0x28f258 + _0x26ef21.width + (_0x540a88 > 0 ? NODE_GAP : 0), 0);
      const _0x173399 = buildStoryClipCanvasNodeData({
        project: project,
        episode: _0x454c60,
        clip: _0x16cf2d,
        modelId: videoModelId,
        provider: videoProvider,
        generationParams: videoGenerationParams
      });
      _0x173399.storyWorkspaceBinding = {
        ...asObject(_0x173399.storyWorkspaceBinding),
        kind: "clip-video",
        canvasScope: "project"
      };
      return {
        clipKey: _0x3b460e,
        clipData: _0x173399,
        inputPlan: _0x5cea30,
        inputLaneWidth: _0x57fae6
      };
    });
    const _0x4e4e8e = Math.max(0, ..._0x4439aa.map(_0x18f9ac => _0x18f9ac.inputLaneWidth));
    const _0x45468e = _0x4e4e8e > 0 ? _0x4e4e8e + NODE_GAP : 0;
    let _0x1cf858 = _0x2dc14a.height + NODE_GAP;
    _0x4439aa.forEach(({
      clipKey: _0x5351b5,
      clipData: _0x42a05f,
      inputPlan: _0xfd6793
    }) => {
      let _0xf80e29 = 0;
      _0xfd6793.inputEntries.forEach(_0x3c1787 => {
        _0x2ce519.push(createPlanEntry(_0x3c1787.key, _0x3c1787.data, {
          x: _0xf80e29,
          y: _0x1cf858
        }, {
          width: _0x3c1787.width,
          height: _0x3c1787.height
        }));
        _0xf80e29 += _0x3c1787.width + NODE_GAP;
      });
      _0x2ce519.push(createPlanEntry(_0x5351b5, _0x42a05f, {
        x: _0x45468e,
        y: _0x1cf858
      }, {
        inputConnections: _0xfd6793.inputConnections
      }));
      const _0x4a0d9e = Math.max(_0x40c859.height, ..._0xfd6793.inputEntries.map(_0x1509f6 => _0x1509f6.height));
      _0x1cf858 += _0x4a0d9e + NODE_GAP;
    });
    const _0x41813b = Math.max(_0x2dc14a.width, _0x4e4e8e, _0x45468e + _0x40c859.width);
    _0x56500a.push(createPlanEntry("episode:" + _0x1af77d + ":annotation", buildStoryStageAnnotationNodeData({
      project: project,
      episode: _0x454c60,
      stage: "episode-" + (_0x30f653 + 1),
      title: getEpisodeLabel(_0x454c60) + " · 分集制作",
      content: "本集文案和视频片段。"
    }), {
      x: 0,
      y: 0
    }, {
      width: Math.max(_0x1a715a.width, _0x41813b),
      height: _0x1a715a.height
    }));
    const _0x2d077b = _0x1a715a.height + NODE_GAP;
    _0x56500a.push(..._0x2ce519.map(_0x460cfc => ({
      ..._0x460cfc,
      position: {
        x: _0x460cfc.position.x,
        y: _0x460cfc.position.y + _0x2d077b
      }
    })));
    _0x4f1c56 = appendVerticalStoryStage(_0x289c54, wrapStoryStageEntriesInGroup({
      entries: _0x56500a,
      project: project,
      episode: _0x454c60,
      key: "episode:" + _0x1af77d + ":group",
      stage: "episode-" + (_0x30f653 + 1),
      name: getEpisodeLabel(_0x454c60),
      color: STAGE_GROUP_COLORS.episode[_0x30f653 % STAGE_GROUP_COLORS.episode.length]
    }), _0x13f59e, _0x4f1c56);
  });
  return _0x289c54;
}
function buildStoryProjectPlanLayout(_0x5b5969 = []) {
  return Object.fromEntries(normalizeList(_0x5b5969).map(_0x509236 => [_0x509236.key, {
    x: Number(_0x509236.position?.x) || 0,
    y: Number(_0x509236.position?.y) || 0,
    width: Number(_0x509236.width) || 0,
    height: Number(_0x509236.height) || 0,
    parentKey: normalizeText(_0x509236.parentKey)
  }]));
}
function storyProjectLayoutsMatch(_0x18aebe = {}, _0x141d70 = {}) {
  const _0x4401fb = asObject(_0x18aebe);
  const _0x24eaf8 = asObject(_0x141d70);
  const _0x13937e = Object.keys(_0x4401fb).sort();
  const _0x572dea = Object.keys(_0x24eaf8).sort();
  if (_0x13937e.length !== _0x572dea.length || _0x13937e.some((_0x32e42a, _0x13ec36) => _0x32e42a !== _0x572dea[_0x13ec36])) {
    return false;
  }
  return _0x572dea.every(_0x28fb4b => {
    const _0x58f49d = asObject(_0x4401fb[_0x28fb4b]);
    const _0x5d6e0f = asObject(_0x24eaf8[_0x28fb4b]);
    return Number(_0x58f49d.x) === Number(_0x5d6e0f.x) && Number(_0x58f49d.y) === Number(_0x5d6e0f.y) && Number(_0x58f49d.width) === Number(_0x5d6e0f.width) && Number(_0x58f49d.height) === Number(_0x5d6e0f.height) && normalizeText(_0x58f49d.parentKey) === normalizeText(_0x5d6e0f.parentKey);
  });
}
function shouldReflowStoryProjectCanvas(_0x26ce94, _0x1bf426) {
  return Math.trunc(Number(_0x26ce94?.layoutVersion) || 0) !== STORY_PROJECT_CANVAS_LAYOUT_VERSION || !storyProjectLayoutsMatch(_0x26ce94?.layout, _0x1bf426);
}
async function rollbackStoryProjectCanvasMutation({
  adapter: _0x392a2e,
  canvasId = "",
  reused = false,
  mutationSnapshot: _0x5dfbb6
} = {}) {
  if (!reused && typeof _0x392a2e?.deleteCanvas === "function") {
    try {
      if ((await _0x392a2e.deleteCanvas(canvasId, {
        skipDirtyConfirm: true
      })) !== false) {
        return true;
      }
    } catch {}
  }
  if (_0x5dfbb6 && typeof _0x392a2e?.restoreMutationSnapshot === "function") {
    try {
      return (await _0x392a2e.restoreMutationSnapshot(_0x5dfbb6, {
        canvasId: canvasId
      })) !== false;
    } catch {}
  }
  return false;
}
export async function syncStoryProjectCanvas({
  project = {},
  assets = [],
  episodes = [],
  imageModelId = "",
  imageProvider = "",
  imageGenerationParams = {},
  videoModelId = "",
  videoProvider = "",
  videoGenerationParams = {},
  adapter: _0x457045
} = {}) {
  const _0x5657fa = ["canvasExists", "switchCanvas", "createCanvas", "renameCanvas", "nodeExists", "createNode", "updateNode"];
  if (_0x5657fa.some(_0x1843b4 => typeof _0x457045?.[_0x1843b4] !== "function")) {
    throw new Error("syncStoryProjectCanvas requires a complete canvas adapter");
  }
  const _0x4f2297 = buildStoryProjectCanvasName(project, normalizeList(episodes)[0]);
  const _0x518a2c = await resolveStoryProjectAssetImageSizes(assets);
  const _0x29851a = buildStoryProjectCanvasPlan({
    project: project,
    assets: _0x518a2c,
    episodes: episodes,
    imageModelId: imageModelId,
    imageProvider: imageProvider,
    imageGenerationParams: imageGenerationParams,
    videoModelId: videoModelId,
    videoProvider: videoProvider,
    videoGenerationParams: videoGenerationParams
  });
  if (_0x29851a.some(_0x223c85 => _0x223c85.parentKey) && typeof _0x457045.setNodeParent !== "function") {
    throw new Error("剧本项目画布适配器缺少节点分组能力");
  }
  if (_0x29851a.some(_0x35ae30 => normalizeList(_0x35ae30.inputConnections).length) && typeof _0x457045.connectNodes !== "function") {
    throw new Error("剧本项目画布适配器缺少节点连线能力");
  }
  const _0x27e45a = asObject(project.canvasBinding);
  const _0x2456b3 = normalizeText(_0x27e45a.canvasId);
  const _0x1cab0d = Boolean(_0x2456b3 && (await _0x457045.canvasExists(_0x2456b3)));
  let _0x314aee = "";
  if (_0x1cab0d) {
    const _0x467714 = await _0x457045.switchCanvas(_0x2456b3);
    if (_0x467714 === false) {
      throw new Error("无法切换到已绑定的项目画布：" + _0x2456b3);
    }
    _0x314aee = _0x2456b3;
  } else {
    _0x314aee = normalizeText(await _0x457045.createCanvas(_0x4f2297));
    if (!_0x314aee) {
      throw new Error("新建项目画布后未获得活动画布 ID");
    }
  }
  const _0xa9cbff = asObject(_0x27e45a.nodes);
  const _0x41edc8 = buildStoryProjectPlanLayout(_0x29851a);
  const _0x1d964f = _0x1cab0d ? shouldReflowStoryProjectCanvas(_0x27e45a, _0x41edc8) : false;
  const _0x1f0a28 = {};
  const _0x4d6994 = [];
  let _0x1f6530 = 0;
  let _0x5d3281 = 0;
  let _0x3836c4 = 0;
  const _0x2a7351 = "story-project:" + (normalizeText(project.id) || _0x314aee);
  const _0x5c2b5a = await _0x457045.createMutationSnapshot?.({
    canvasId: _0x314aee
  });
  try {
    if (_0x1cab0d) {
      const _0x51a225 = [];
      for (const [_0x59e957, _0x341144] of Object.entries(_0xa9cbff)) {
        if (_0x59e957 in _0x41edc8) {
          continue;
        }
        const _0x2a1397 = normalizeText(_0x341144);
        if (_0x2a1397 && (await _0x457045.nodeExists(_0x2a1397, _0x314aee))) {
          _0x51a225.push(_0x2a1397);
        }
      }
      if (_0x51a225.length) {
        if (typeof _0x457045.deleteNodes !== "function") {
          throw new Error("剧本项目画布适配器缺少旧节点清理能力");
        }
        const _0x5c17eb = [...new Set(_0x51a225)];
        if ((await _0x457045.deleteNodes(_0x5c17eb, {
          canvasId: _0x314aee
        })) === false) {
          throw new Error("清理已失效的剧本项目画布节点失败");
        }
        _0x3836c4 = _0x5c17eb.length;
      }
    }
    for (const _0x42410e of _0x29851a) {
      const _0x3018ef = normalizeText(_0xa9cbff[_0x42410e.key]);
      const _0x45484d = Boolean(_0x1cab0d && _0x3018ef && (await _0x457045.nodeExists(_0x3018ef, _0x314aee)));
      const _0x4cc513 = _0x45484d ? await _0x457045.updateNode(_0x3018ef, _0x42410e.data, {
        canvasId: _0x314aee,
        key: _0x42410e.key,
        type: _0x42410e.type,
        width: _0x42410e.width,
        height: _0x42410e.height,
        ...(_0x1d964f ? {
          position: _0x42410e.position
        } : {})
      }) : await _0x457045.createNode(_0x42410e.data, {
        canvasId: _0x314aee,
        key: _0x42410e.key,
        type: _0x42410e.type,
        width: _0x42410e.width,
        height: _0x42410e.height,
        position: _0x42410e.position,
        sequenceKey: _0x2a7351,
        parentNodeId: normalizeText(_0x1f0a28[_0x42410e.parentKey])
      });
      if (_0x45484d) {
        _0x5d3281 += 1;
      } else {
        _0x1f6530 += 1;
      }
      const _0x7b5fdc = normalizeText(_0x4cc513?.id || (_0x45484d ? _0x3018ef : ""));
      if (!_0x7b5fdc) {
        throw new Error("同步项目画布节点失败：" + (_0x42410e.data.name || _0x42410e.key));
      }
      _0x1f0a28[_0x42410e.key] = _0x7b5fdc;
      _0x4d6994.push({
        ..._0x42410e,
        nodeId: _0x7b5fdc,
        node: _0x4cc513
      });
    }
    for (const _0x307408 of _0x29851a) {
      if (!_0x307408.parentKey) {
        continue;
      }
      const _0x32aa21 = normalizeText(_0x1f0a28[_0x307408.key]);
      const _0x225f7a = normalizeText(_0x1f0a28[_0x307408.parentKey]);
      if (!_0x32aa21 || !_0x225f7a) {
        throw new Error("剧本项目画布分组缺少节点：" + _0x307408.key);
      }
      if ((await _0x457045.setNodeParent(_0x32aa21, _0x225f7a, {
        canvasId: _0x314aee
      })) === false) {
        throw new Error("剧本项目画布节点分组失败：" + _0x307408.key);
      }
    }
    for (const _0x2b7f3c of _0x29851a) {
      const _0x384644 = normalizeText(_0x1f0a28[_0x2b7f3c.key]);
      for (const _0x56a8fe of normalizeList(_0x2b7f3c.inputConnections)) {
        const _0x5694eb = normalizeText(_0x1f0a28[_0x56a8fe?.key]);
        if (!_0x5694eb || !_0x384644) {
          throw new Error("剧本项目画布连线缺少节点：" + _0x56a8fe?.key + " → " + _0x2b7f3c.key);
        }
        if ((await _0x457045.connectNodes(_0x5694eb, _0x384644, {
          canvasId: _0x314aee,
          preferredRefSlot: normalizeText(_0x56a8fe?.preferredRefSlot)
        })) === false) {
          throw new Error("剧本项目画布节点连线失败：" + _0x56a8fe?.key + " → " + _0x2b7f3c.key);
        }
      }
    }
    await _0x457045.renameCanvas?.(_0x314aee, _0x4f2297);
    _0x457045.commit?.();
    if (typeof _0x457045.focusNodes === "function") {
      await _0x457045.focusNodes(_0x4d6994.map(_0x41d2d0 => _0x41d2d0.nodeId), {
        padding: 80,
        durationMs: 0,
        maxZoom: 0.2
      });
    }
  } catch (_0x21c153) {
    await rollbackStoryProjectCanvasMutation({
      adapter: _0x457045,
      canvasId: _0x314aee,
      reused: _0x1cab0d,
      mutationSnapshot: _0x5c2b5a
    });
    throw _0x21c153;
  }
  const _0x1e8beb = {
    canvasId: _0x314aee,
    layoutVersion: STORY_PROJECT_CANVAS_LAYOUT_VERSION,
    nodes: _0x1f0a28,
    layout: _0x41edc8
  };
  return {
    canvasId: _0x314aee,
    canvasName: _0x4f2297,
    reused: _0x1cab0d,
    createdCount: _0x1f6530,
    updatedCount: _0x5d3281,
    deletedCount: _0x3836c4,
    reflowed: _0x1d964f,
    nodes: _0x4d6994,
    binding: _0x1e8beb,
    canvasBinding: _0x1e8beb
  };
}
export function createStoryProjectCanvasAdapter({
  canvasTabManager: _0x4ee446,
  createNodeAtCursor: _0x3a715e,
  getGraphState: _0x22e2e9,
  getGraphSnapshot = null,
  restoreGraphSnapshot = null,
  updateNodeData: _0x1a2fd2,
  moveNode: _0x342b93,
  deleteNodes: _0x457f24 = null,
  connectNodes: _0x1a8795 = null,
  groupNodes = null,
  focusNodes: _0x20fbe9 = null,
  commit = () => {}
} = {}) {
  if (typeof _0x4ee446?.addCanvas !== "function" || typeof _0x4ee446?.getActiveCanvasId !== "function" || typeof _0x3a715e !== "function" || typeof _0x22e2e9 !== "function" || typeof _0x1a2fd2 !== "function" || typeof _0x342b93 !== "function") {
    throw new Error("story project canvas adapter dependencies are incomplete");
  }
  const _0x48fbeb = _0x3c0bb3 => asObject(_0x22e2e9()?.nodes)[normalizeText(_0x3c0bb3)] || null;
  const _0x2fcac9 = _0xcd69e1 => {
    const _0x4cafde = normalizeText(_0xcd69e1);
    const _0x9e3280 = Object.values(asObject(_0x22e2e9()?.nodes));
    const _0x37700d = _0x9e3280.filter(_0x204ea8 => normalizeText(_0x204ea8?.storyWorkspaceBinding?.projectId) === _0x4cafde);
    const _0x23e8f1 = _0x37700d.find(_0x3eb848 => _0x3eb848?.storyWorkspaceBinding?.kind === "stage-group" && _0x3eb848?.storyWorkspaceBinding?.stage === "project") || _0x37700d.find(_0x470291 => _0x470291?.storyWorkspaceBinding?.kind === "stage-group") || _0x37700d.find(_0x539f5f => _0x539f5f?.storyWorkspaceBinding?.kind === "project-overview");
    if (_0x23e8f1) {
      return _0x23e8f1;
    }
    const _0x44e30c = _0x9e3280.filter(_0x287dd5 => normalizeText(_0x287dd5?.personReplacementBinding?.projectId) === _0x4cafde);
    return _0x44e30c.find(_0x591c9f => _0x591c9f?.personReplacementBinding?.kind === "stage-group" && _0x591c9f?.personReplacementBinding?.stage === "assets") || _0x44e30c.find(_0x293748 => _0x293748?.personReplacementBinding?.kind === "stage-group") || _0x44e30c.find(_0x29d4ad => _0x29d4ad?.personReplacementBinding?.kind === "project-overview") || _0x44e30c[0] || null;
  };
  return {
    canvasExists(_0x5352c6) {
      const _0x8d8d85 = normalizeText(_0x5352c6);
      if (!_0x8d8d85) {
        return false;
      }
      const _0x13b2d6 = _0x4ee446.getMultiDataSnapshot?.() || {};
      if (Array.isArray(_0x13b2d6.canvases)) {
        return _0x13b2d6.canvases.some(_0x2f76a5 => normalizeText(_0x2f76a5?.id) === _0x8d8d85);
      } else {
        return normalizeText(_0x4ee446.getActiveCanvasId()) === _0x8d8d85;
      }
    },
    async switchCanvas(_0x40305c) {
      const _0xa670a7 = normalizeText(_0x40305c);
      if (!_0xa670a7) {
        return false;
      }
      if (normalizeText(_0x4ee446.getActiveCanvasId()) === _0xa670a7) {
        return true;
      }
      if (typeof _0x4ee446.switchTo !== "function") {
        return false;
      }
      return (await _0x4ee446.switchTo(_0xa670a7)) !== false;
    },
    async createCanvas(_0x5872a5) {
      await _0x4ee446.addCanvas();
      const _0x561258 = normalizeText(_0x4ee446.getActiveCanvasId());
      if (!_0x561258) {
        throw new Error("新建项目画布后未获得活动画布 ID");
      }
      _0x4ee446.renameCanvas?.(_0x561258, _0x5872a5);
      return _0x561258;
    },
    renameCanvas(_0x153b66, _0x86202) {
      _0x4ee446.renameCanvas?.(_0x153b66, _0x86202);
    },
    nodeExists(_0xbad19b) {
      return Boolean(_0x48fbeb(_0xbad19b));
    },
    getNode(_0x15262d) {
      return _0x48fbeb(_0x15262d);
    },
    async createNode(_0x14bdb2, _0x4f1b11 = {}) {
      const _0xa13edd = normalizeText(_0x4f1b11.type || _0x14bdb2?.type);
      const _0x17347b = Number(_0x4f1b11.width) || STORY_PROJECT_CANVAS_NODE_SIZES[_0xa13edd]?.width;
      const _0x21cc1b = Number(_0x4f1b11.height) || STORY_PROJECT_CANVAS_NODE_SIZES[_0xa13edd]?.height;
      const _0x1f7e23 = _0x3a715e(_0xa13edd, _0x17347b, _0x21cc1b, _0x14bdb2?.name, {
        placement: "viewport-center-sequence",
        sequenceKey: _0x4f1b11.sequenceKey,
        skipCommit: true
      });
      if (!_0x1f7e23?.id) {
        throw new Error("创建项目画布节点失败：" + (_0x14bdb2?.name || _0xa13edd));
      }
      const _0xfa9080 = withoutNodeType(_0x14bdb2);
      _0x1a2fd2(_0x1f7e23.id, _0xfa9080);
      const _0x2112ee = _0x48fbeb(_0x1f7e23.id) || {
        ..._0x1f7e23,
        ..._0xfa9080
      };
      const _0x3bc4fc = normalizeText(_0x14bdb2?.storyWorkspaceBinding?.projectId || _0x14bdb2?.personReplacementBinding?.projectId);
      const _0x2e0930 = _0x2fcac9(_0x3bc4fc) || _0x2112ee;
      const _0x90562e = asObject(_0x4f1b11.position);
      const _0x3a1531 = Number(_0x2e0930.x || 0) + (Number(_0x90562e.x) || 0);
      const _0x405f64 = Number(_0x2e0930.y || 0) + (Number(_0x90562e.y) || 0);
      const _0xe64067 = getNodeSpawnPrefs();
      const _0x48b899 = new Set([normalizeText(_0x1f7e23.id), normalizeText(_0x4f1b11.parentNodeId)].filter(Boolean));
      const _0x2bcf24 = Object.fromEntries(Object.entries(asObject(_0x22e2e9()?.nodes)).filter(([_0x185ee3]) => !_0x48b899.has(normalizeText(_0x185ee3))));
      const _0x2799ee = _0xe64067.direction === "down" || _0xe64067.direction === "left" ? _0xe64067.direction : "right";
      const _0x4a87d9 = _0xe64067.avoidOverlap === false ? {
        x: _0x3a1531,
        y: _0x405f64
      } : findAvailablePosition(_0x2bcf24, _0x3a1531, _0x405f64, Number(_0x2112ee.width) || _0x17347b, Number(_0x2112ee.height) || _0x21cc1b, Math.max(0, Number(_0xe64067.spacing) || 0), _0x2799ee);
      const _0x1a68fe = _0x4a87d9.x - Number(_0x2112ee.x || 0);
      const _0x2519f5 = _0x4a87d9.y - Number(_0x2112ee.y || 0);
      if (_0x1a68fe || _0x2519f5) {
        _0x342b93(_0x1f7e23.id, _0x1a68fe, _0x2519f5);
      }
      return _0x48fbeb(_0x1f7e23.id) || {
        ..._0x2112ee,
        x: _0x4a87d9.x,
        y: _0x4a87d9.y
      };
    },
    async updateNode(_0x586458, _0x3778bf, _0x50cd32 = {}) {
      const _0xd6472e = normalizeText(_0x586458);
      if (!_0xd6472e) {
        return null;
      }
      const _0x1bfac0 = _0x48fbeb(_0xd6472e);
      const _0x44f99a = Number(_0x50cd32.width);
      const _0x39234f = Number(_0x50cd32.height);
      const _0x125d4e = {
        ...withoutNodeType(_0x3778bf),
        ...(_0x44f99a > 0 ? {
          width: _0x44f99a
        } : {}),
        ...(_0x39234f > 0 ? {
          height: _0x39234f
        } : {})
      };
      _0x1a2fd2(_0xd6472e, _0x125d4e);
      if (_0x50cd32.position && _0x1bfac0) {
        const _0x2a413a = normalizeText(_0x3778bf?.storyWorkspaceBinding?.projectId || _0x3778bf?.personReplacementBinding?.projectId || _0x1bfac0?.storyWorkspaceBinding?.projectId || _0x1bfac0?.personReplacementBinding?.projectId);
        const _0x508979 = _0x2fcac9(_0x2a413a) || _0x48fbeb(_0xd6472e);
        const _0x21931b = asObject(_0x50cd32.position);
        const _0x58ba2c = Number(_0x508979?.x || 0) + (Number(_0x21931b.x) || 0);
        const _0x3989cc = Number(_0x508979?.y || 0) + (Number(_0x21931b.y) || 0);
        const _0x360e9c = _0x48fbeb(_0xd6472e) || _0x1bfac0;
        const _0x31f4b7 = _0x58ba2c - Number(_0x360e9c?.x || 0);
        const _0x71586a = _0x3989cc - Number(_0x360e9c?.y || 0);
        if (_0x31f4b7 || _0x71586a) {
          _0x342b93(_0xd6472e, _0x31f4b7, _0x71586a);
        }
      }
      return _0x48fbeb(_0xd6472e) || {
        id: _0xd6472e,
        ..._0x125d4e
      };
    },
    deleteNodes(_0xfea730 = []) {
      if (typeof _0x457f24 !== "function") {
        return false;
      }
      const _0x55bfc3 = (Array.isArray(_0xfea730) ? _0xfea730 : []).map(normalizeText).filter(_0x427cd3 => _0x427cd3 && _0x48fbeb(_0x427cd3));
      if (!_0x55bfc3.length) {
        return true;
      }
      _0x457f24([...new Set(_0x55bfc3)]);
      return true;
    },
    createMutationSnapshot() {
      if (typeof getGraphSnapshot !== "function") {
        return null;
      }
      return getGraphSnapshot();
    },
    restoreMutationSnapshot(_0x1d8874) {
      if (!_0x1d8874 || typeof restoreGraphSnapshot !== "function") {
        return false;
      }
      return restoreGraphSnapshot(_0x1d8874) !== false;
    },
    async deleteCanvas(_0xf1bd67) {
      const _0x2a58f9 = normalizeText(_0xf1bd67);
      if (!_0x2a58f9 || typeof _0x4ee446?.deleteCanvas !== "function") {
        return false;
      }
      return (await _0x4ee446.deleteCanvas(_0x2a58f9, {
        skipDirtyConfirm: true
      })) !== false;
    },
    setNodeParent(_0x266179, _0x325f91) {
      const _0x4e20d0 = normalizeText(_0x266179);
      const _0x563a63 = normalizeText(_0x325f91);
      if (!_0x4e20d0 || !_0x563a63) {
        return false;
      }
      if (normalizeText(_0x48fbeb(_0x4e20d0)?.parentId) === _0x563a63) {
        return true;
      }
      if (typeof groupNodes !== "function") {
        return false;
      }
      const _0x20483f = groupNodes([_0x4e20d0], _0x563a63);
      return _0x20483f !== false;
    },
    connectNodes(_0x44bdc4, _0x119cb5, _0x1f1ac4 = {}) {
      const _0x56afbd = normalizeText(_0x44bdc4);
      const _0x151496 = normalizeText(_0x119cb5);
      if (!_0x56afbd || !_0x151496) {
        return false;
      }
      const _0x22c7c0 = _0x22e2e9()?.edges;
      const _0xb1f428 = Array.isArray(_0x22c7c0) ? _0x22c7c0 : Object.values(asObject(_0x22c7c0));
      const _0x4c7287 = _0xb1f428.some(_0x19df97 => normalizeText(_0x19df97?.sourceId) === _0x56afbd && normalizeText(_0x19df97?.targetId) === _0x151496);
      if (_0x4c7287) {
        return true;
      }
      if (typeof _0x1a8795 !== "function") {
        return false;
      }
      const _0x46153d = _0x1a8795({
        sourceId: _0x56afbd,
        targetId: _0x151496,
        preferredRefSlot: normalizeText(_0x1f1ac4.preferredRefSlot)
      });
      return _0x46153d !== false;
    },
    focusNodes(_0x4c5380, _0x4c1d71 = {}) {
      if (typeof _0x20fbe9 !== "function") {
        return false;
      }
      const _0x8343c3 = Array.isArray(_0x4c5380) ? _0x4c5380.map(normalizeText).filter(Boolean) : [];
      if (!_0x8343c3.length) {
        return false;
      }
      return _0x20fbe9(_0x8343c3, _0x4c1d71.padding, _0x4c1d71.durationMs, _0x4c1d71);
    },
    commit: commit
  };
}