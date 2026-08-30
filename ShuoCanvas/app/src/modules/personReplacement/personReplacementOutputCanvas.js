import { normalizeImageGenerationResult } from "../../components/aigenImage/imageGenerationResultRenderer.js";
import { normalizeVideoGenerationResult } from "../../components/video-node/videoGenerationResultRenderer.js";
import { localPathToUrl, normalizeLocalPath } from "../../utils/localMediaPath.js";
import { getAutoMediaSizeByShortSide } from "../../services/fileService.js";
import { resolveOutputMediaSize } from "../../services/mediaRatioService.js";
import { buildPersonReplacementPromptPackage } from "./personReplacementPromptCompiler.js";
import { calculateGroupNodeBounds } from "../groupNodeLayout.js";
const NODE_GAP = 72;
const SECTION_GAP = 180;
const STAGE_GAP = 320;
const ASSET_COLUMNS = 5;
const STAGE_GROUP_COLORS = Object.freeze({
  assets: "var(--indigo)",
  image: "var(--green)",
  video: "var(--gold)",
  voice: "var(--purple)",
  composite: "var(--cyan)"
});
export const PERSON_REPLACEMENT_CANVAS_SCOPES = Object.freeze({
  CLIPS: "clips",
  PROJECT: "project"
});
export const PERSON_REPLACEMENT_CANVAS_LAYOUT_VERSION = 9;
export const PERSON_REPLACEMENT_CANVAS_NODE_SIZES = Object.freeze({
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
    width: 288,
    height: 288
  }),
  "ai-image": Object.freeze({
    width: 288,
    height: 288
  }),
  "source-video": Object.freeze({
    width: 512,
    height: 288
  }),
  "ai-video": Object.freeze({
    width: 512,
    height: 288
  }),
  "source-audio": Object.freeze({
    width: 420,
    height: 180
  }),
  "ai-audio": Object.freeze({
    width: 420,
    height: 180
  })
});
function asObject(_0x4abb9a) {
  if (_0x4abb9a && typeof _0x4abb9a === "object" && !Array.isArray(_0x4abb9a)) {
    return _0x4abb9a;
  } else {
    return {};
  }
}
function normalizeText(_0x40cc23) {
  return String(_0x40cc23 || "").trim();
}
function normalizePromptDisplayText(_0x3a2910) {
  return String(_0x3a2910 || "").replace(/<br\b[^>]*\/?>/gi, "\n").replace(/<\/(?:div|p|section|article|blockquote|li)>/gi, "\n").replace(/<li\b[^>]*>/gi, "- ").replace(/<[^>]+>/g, "").replace(/&nbsp;|&#160;/gi, " ").replace(/&lt;/gi, "<").replace(/&gt;/gi, ">").replace(/&quot;/gi, "\"").replace(/&#39;|&apos;/gi, "'").replace(/&amp;/gi, "&").replace(/\n{3,}/g, "\n\n").trim();
}
function normalizeList(_0x10fe11) {
  if (Array.isArray(_0x10fe11)) {
    return _0x10fe11.filter(Boolean);
  } else {
    return [];
  }
}
function normalizeScope(_0x1cecd9) {
  if (_0x1cecd9 === PERSON_REPLACEMENT_CANVAS_SCOPES.PROJECT) {
    return PERSON_REPLACEMENT_CANVAS_SCOPES.PROJECT;
  } else {
    return PERSON_REPLACEMENT_CANVAS_SCOPES.CLIPS;
  }
}
function normalizeWorkspaceStep(_0x4f2eb0 = {}) {
  const _0x16e162 = Math.trunc(Number(_0x4f2eb0.workspace?.step) || Number(_0x4f2eb0.step) || 1);
  return Math.max(1, Math.min(5, _0x16e162));
}
function getWorkspaceStepName(_0x41ea61) {
  return ["", "素材设定", "图像替换", "视频替换", "声音克隆", "合成视频"][Math.max(1, Math.min(5, Math.trunc(Number(_0x41ea61) || 1)))];
}
function formatSequence(_0x53c604) {
  return String(_0x53c604 + 1).padStart(2, "0");
}
function createPlanEntry(_0x1595b8, _0x4bb716, _0x95b638, {
  width = 0,
  height = 0,
  parentKey = "",
  inputKeys = []
} = {}) {
  const _0x383fec = normalizeText(_0x4bb716?.type);
  const _0x1564fc = PERSON_REPLACEMENT_CANVAS_NODE_SIZES[_0x383fec];
  const _0x13102e = Number(width) || _0x1564fc?.width;
  const _0x32107b = Number(height) || _0x1564fc?.height;
  if (!_0x383fec || !_0x13102e || !_0x32107b) {
    throw new Error("不支持的人物替换画布节点类型：" + (_0x383fec || "unknown"));
  }
  return {
    key: _0x1595b8,
    type: _0x383fec,
    data: _0x4bb716,
    width: _0x13102e,
    height: _0x32107b,
    position: {
      x: Number(_0x95b638?.x) || 0,
      y: Number(_0x95b638?.y) || 0
    },
    ...(normalizeText(parentKey) ? {
      parentKey: normalizeText(parentKey)
    } : {}),
    ...(normalizeList(inputKeys).length ? {
      inputKeys: normalizeList(inputKeys).map(normalizeText).filter(Boolean)
    } : {})
  };
}
function buildMediaLocation(_0x5772fa) {
  const _0x54155e = normalizeText(_0x5772fa);
  const _0x201907 = normalizeLocalPath(_0x54155e);
  return {
    localPath: _0x201907,
    url: localPathToUrl(_0x201907) || _0x54155e
  };
}
function buildBinding(_0x3c2fac, _0xc20005 = {}) {
  return {
    projectId: normalizeText(_0x3c2fac?.id),
    ...asObject(_0xc20005)
  };
}
const PERSON_REPLACEMENT_LOCATION_GUIDE_SUBDIR = "person-replacement-guides";
function buildInlineSvgSignature(_0x23a563) {
  const _0x195ce4 = normalizeText(_0x23a563);
  let _0x29e0d5 = 2166136261;
  for (let _0x5071a3 = 0; _0x5071a3 < _0x195ce4.length; _0x5071a3 += 1) {
    _0x29e0d5 ^= _0x195ce4.charCodeAt(_0x5071a3);
    _0x29e0d5 = Math.imul(_0x29e0d5, 16777619);
  }
  return "svg-" + (_0x29e0d5 >>> 0).toString(16).padStart(8, "0");
}
function buildInlineSvgBlob(_0x2239a1) {
  const _0x3bd653 = normalizeText(_0x2239a1);
  const _0x15cc3a = _0x3bd653.indexOf(",");
  const _0x3fd372 = _0x15cc3a >= 0 ? _0x3bd653.slice(0, _0x15cc3a) : "";
  const _0x2b66eb = _0x15cc3a >= 0 ? _0x3bd653.slice(_0x15cc3a + 1) : "";
  if (!/^data:image\/svg\+xml(?:;|$)/i.test(_0x3fd372) || !_0x2b66eb) {
    throw new Error("人物定位图不是有效的 SVG 数据");
  }
  const _0x53260d = globalThis.Blob;
  if (typeof _0x53260d !== "function") {
    throw new Error("当前环境无法保存人物定位图");
  }
  if (/;base64(?:;|$)/i.test(_0x3fd372)) {
    const _0x563fc2 = globalThis.atob;
    if (typeof _0x563fc2 !== "function") {
      throw new Error("当前环境无法解码人物定位图");
    }
    const _0x107f56 = _0x563fc2(_0x2b66eb);
    const _0x229c5f = new Uint8Array(_0x107f56.length);
    for (let _0x38ef78 = 0; _0x38ef78 < _0x107f56.length; _0x38ef78 += 1) {
      _0x229c5f[_0x38ef78] = _0x107f56.charCodeAt(_0x38ef78);
    }
    return new _0x53260d([_0x229c5f], {
      type: "image/svg+xml"
    });
  }
  try {
    return new _0x53260d([decodeURIComponent(_0x2b66eb)], {
      type: "image/svg+xml"
    });
  } catch {
    throw new Error("人物定位图 SVG 数据无法解码");
  }
}
function normalizeSavedLocationGuideRef(_0x572986 = {}) {
  return normalizeLocalPath(_0x572986?.originalLocalPath || _0x572986?.localPath || _0x572986?.path || _0x572986?.url || "");
}
function applyPersistedLocationGuide(_0x42ec26, _0x470e42, _0xeb2e2d, _0xfcdabf) {
  const _0x40abd6 = asObject(_0x42ec26?.data);
  const _0x4ecd1e = {
    ...asObject(_0x40abd6.personReplacementBinding),
    locationGuideSignature: _0xfcdabf
  };
  _0x42ec26.data = {
    ..._0x40abd6,
    ...buildPersonReplacementImageCanvasNodeData({
      project: _0x470e42,
      imageRef: _0xeb2e2d,
      name: _0x40abd6.name,
      type: _0x40abd6.type || _0x42ec26.type,
      prompt: _0x40abd6.prompt,
      binding: _0x4ecd1e
    }),
    imageWidth: _0x40abd6.imageWidth,
    imageHeight: _0x40abd6.imageHeight
  };
}
async function materializePersonReplacementLocationGuides({
  plan = [],
  project = {},
  adapter: _0x593923,
  canReuseCanvas = false,
  previousNodes = {},
  canvasId = "",
  saveOutputBlob = null
} = {}) {
  for (const _0x4bb558 of normalizeList(plan)) {
    const _0x5d46d1 = asObject(_0x4bb558?.data?.personReplacementBinding);
    if (_0x5d46d1.kind !== "person-location-guide") {
      continue;
    }
    const _0x57754f = normalizeText(_0x4bb558?.data?.imageUrl || _0x4bb558?.data?.images?.[0]?.imageUrl);
    if (!/^data:image\/svg\+xml(?:;|,)/i.test(_0x57754f)) {
      continue;
    }
    const _0x4efbdd = buildInlineSvgSignature(_0x57754f);
    let _0x4c77cb = "";
    const _0x40d24b = normalizeText(previousNodes[_0x4bb558.key]);
    if (canReuseCanvas && _0x40d24b && typeof _0x593923?.getNode === "function" && (await _0x593923.nodeExists(_0x40d24b, canvasId))) {
      const _0x5c30b5 = await _0x593923.getNode(_0x40d24b, canvasId);
      if (normalizeText(_0x5c30b5?.personReplacementBinding?.locationGuideSignature) === _0x4efbdd) {
        _0x4c77cb = normalizeLocalPath(_0x5c30b5?.originalLocalPath || _0x5c30b5?.localPath || _0x5c30b5?.displayLocalPath || _0x5c30b5?.images?.[0]?.originalLocalPath || _0x5c30b5?.images?.[0]?.localPath || "");
      }
    }
    if (!_0x4c77cb) {
      if (typeof saveOutputBlob !== "function") {
        throw new Error("人物定位图本地保存服务不可用");
      }
      const _0x4ab1f2 = await saveOutputBlob(buildInlineSvgBlob(_0x57754f), {
        ext: "svg",
        subDir: PERSON_REPLACEMENT_LOCATION_GUIDE_SUBDIR,
        kind: "image"
      });
      _0x4c77cb = normalizeSavedLocationGuideRef(_0x4ab1f2);
      if (!_0x4c77cb) {
        throw new Error("人物定位图保存后未返回本地路径");
      }
    }
    applyPersistedLocationGuide(_0x4bb558, project, _0x4c77cb, _0x4efbdd);
  }
}
function buildPersonReplacementVideoCanvasNodeData({
  project = {},
  videoRef = "",
  name = "",
  type = "ai-video",
  prompt = "",
  binding = {},
  model = "",
  provider = "",
  providerProfileId = "",
  providerProfileIdByModel = {},
  generationParams = {},
  allowEmpty = false
} = {}) {
  const _0x530823 = buildMediaLocation(videoRef);
  const _0x27ca26 = _0x530823.url ? normalizeVideoGenerationResult({
    videos: [{
      localPath: _0x530823.localPath,
      videoUrl: _0x530823.url
    }]
  }).items[0] : null;
  if (!_0x27ca26?.videoUrl && !allowEmpty) {
    throw new Error((normalizeText(name) || "视频") + "缺少可加入画布的媒体地址");
  }
  const _0x41490d = _0x27ca26 ? [_0x27ca26] : [];
  return {
    type: type,
    name: normalizeText(name) || "人物替换视频",
    prompt: normalizeText(prompt),
    videos: _0x41490d,
    mainVideoIndex: 0,
    isVideosExpanded: false,
    videoUrl: normalizeText(_0x27ca26?.videoUrl),
    localPath: normalizeText(_0x27ca26?.localPath),
    displayLocalPath: normalizeText(_0x27ca26?.displayLocalPath),
    posterLocalPath: normalizeText(_0x27ca26?.posterLocalPath),
    thumbId: normalizeText(_0x27ca26?.thumbId),
    thumbUrl: normalizeText(_0x27ca26?.thumbUrl),
    ...(normalizeText(model) ? {
      model: normalizeText(model)
    } : {}),
    ...(normalizeText(provider) ? {
      provider: normalizeText(provider)
    } : {}),
    ...(normalizeText(providerProfileId) ? {
      providerProfileId: normalizeText(providerProfileId)
    } : {}),
    ...(Object.keys(asObject(providerProfileIdByModel)).length ? {
      providerProfileIdByModel: {
        ...asObject(providerProfileIdByModel)
      }
    } : {}),
    ...(Object.keys(asObject(generationParams)).length ? {
      generationParams: {
        ...asObject(generationParams)
      }
    } : {}),
    personReplacementBinding: buildBinding(project, binding)
  };
}
function buildPersonReplacementImageCanvasNodeData({
  project = {},
  imageRef = "",
  name = "",
  type = "ai-image",
  prompt = "",
  binding = {},
  model = "",
  provider = "",
  providerProfileId = "",
  providerProfileIdByModel = {},
  generationParams = {},
  allowEmpty = false
} = {}) {
  const _0x63ae37 = buildMediaLocation(imageRef);
  const _0x49005c = _0x63ae37.url ? normalizeImageGenerationResult({
    images: [{
      localPath: _0x63ae37.localPath,
      imageUrl: _0x63ae37.url,
      sourceUrl: _0x63ae37.url
    }]
  }).items[0] : null;
  if (!_0x49005c?.imageUrl && !allowEmpty) {
    throw new Error((normalizeText(name) || "图片") + "缺少可加入画布的媒体地址");
  }
  const _0x194ece = _0x49005c ? [_0x49005c] : [];
  return {
    type: type,
    name: normalizeText(name) || "人物替换图片",
    prompt: normalizeText(prompt),
    images: _0x194ece,
    mainImageIndex: 0,
    isImagesExpanded: false,
    imageUrl: normalizeText(_0x49005c?.imageUrl),
    sourceUrl: normalizeText(_0x49005c?.sourceUrl),
    thumbUrl: normalizeText(_0x49005c?.thumbUrl),
    localPath: normalizeText(_0x49005c?.localPath),
    originalLocalPath: normalizeText(_0x49005c?.originalLocalPath),
    displayLocalPath: normalizeText(_0x49005c?.displayLocalPath),
    thumbLocalPath: normalizeText(_0x49005c?.thumbLocalPath),
    sourceId: normalizeText(_0x49005c?.sourceId),
    thumbId: normalizeText(_0x49005c?.thumbId),
    ...(normalizeText(model) ? {
      model: normalizeText(model)
    } : {}),
    ...(normalizeText(provider) ? {
      provider: normalizeText(provider)
    } : {}),
    ...(normalizeText(providerProfileId) ? {
      providerProfileId: normalizeText(providerProfileId)
    } : {}),
    ...(Object.keys(asObject(providerProfileIdByModel)).length ? {
      providerProfileIdByModel: {
        ...asObject(providerProfileIdByModel)
      }
    } : {}),
    ...(Object.keys(asObject(generationParams)).length ? {
      generationParams: {
        ...asObject(generationParams)
      }
    } : {}),
    personReplacementBinding: buildBinding(project, binding)
  };
}
function resolveShotImageCanvasGeometry(_0x5a5b0c = {}) {
  const _0x30c1f5 = PERSON_REPLACEMENT_CANVAS_NODE_SIZES["ai-image"];
  const _0x30db90 = Math.max(0, Number(_0x5a5b0c?.frame?.width) || 0);
  const _0x2c4b2c = Math.max(0, Number(_0x5a5b0c?.frame?.height) || 0);
  if (!(_0x30db90 > 0) || !(_0x2c4b2c > 0)) {
    return {
      width: _0x30c1f5.width,
      height: _0x30c1f5.height,
      imageWidth: 0,
      imageHeight: 0
    };
  }
  return {
    ...getAutoMediaSizeByShortSide(_0x30db90, _0x2c4b2c),
    imageWidth: _0x30db90,
    imageHeight: _0x2c4b2c
  };
}
function applyImageCanvasGeometry(_0x46c940, _0x323d05, {
  source = false
} = {}) {
  const _0x5d8fd6 = Math.max(0, Number(_0x323d05?.imageWidth) || 0);
  const _0x2eb245 = Math.max(0, Number(_0x323d05?.imageHeight) || 0);
  return {
    ..._0x46c940,
    width: Math.max(1, Number(_0x323d05?.width) || 1),
    height: Math.max(1, Number(_0x323d05?.height) || 1),
    ...(_0x5d8fd6 > 0 && _0x2eb245 > 0 ? {
      imageWidth: _0x5d8fd6,
      imageHeight: _0x2eb245
    } : {}),
    ...(source ? {
      needsAutoResize: false
    } : {})
  };
}
function resolveShotVideoCanvasGeometry(_0x46cb1c = {}) {
  const _0x4656dc = PERSON_REPLACEMENT_CANVAS_NODE_SIZES["ai-video"];
  const _0x43d0d7 = Math.max(0, Number(_0x46cb1c?.frame?.width) || 0);
  const _0x5188c2 = Math.max(0, Number(_0x46cb1c?.frame?.height) || 0);
  if (!(_0x43d0d7 > 0) || !(_0x5188c2 > 0)) {
    return {
      width: _0x4656dc.width,
      height: _0x4656dc.height,
      videoWidth: 0,
      videoHeight: 0
    };
  }
  return {
    ...getAutoMediaSizeByShortSide(_0x43d0d7, _0x5188c2),
    videoWidth: _0x43d0d7,
    videoHeight: _0x5188c2
  };
}
function applyVideoCanvasGeometry(_0x40a15c, _0x3fcaf0) {
  const _0x316bda = Math.max(0, Number(_0x3fcaf0?.videoWidth) || 0);
  const _0x1d96eb = Math.max(0, Number(_0x3fcaf0?.videoHeight) || 0);
  const _0x47d027 = Math.max(1, Number(_0x3fcaf0?.width) || 1);
  const _0x376e3c = Math.max(1, Number(_0x3fcaf0?.height) || 1);
  const _0x319565 = _0x316bda > 0 && _0x1d96eb > 0;
  return {
    ..._0x40a15c,
    width: _0x47d027,
    height: _0x376e3c,
    ...(_0x319565 ? {
      naturalWidth: _0x316bda,
      naturalHeight: _0x1d96eb,
      videoWidth: _0x316bda,
      videoHeight: _0x1d96eb,
      selectedVideoWidth: _0x316bda,
      selectedVideoHeight: _0x1d96eb,
      needsAutoResize: false,
      videos: normalizeList(_0x40a15c?.videos).map(_0x142445 => ({
        ..._0x142445,
        videoWidth: _0x316bda,
        videoHeight: _0x1d96eb
      }))
    } : {})
  };
}
function resolveAppearanceImageCanvasGeometry(_0xdfd129 = {}) {
  const _0x4d9110 = PERSON_REPLACEMENT_CANVAS_NODE_SIZES["ai-image"];
  const _0x2e1931 = Math.max(0, Number(_0xdfd129?.imageWidth || _0xdfd129?.naturalWidth || _0xdfd129?.originalWidth || _0xdfd129?.width) || 0);
  const _0x4e50c8 = Math.max(0, Number(_0xdfd129?.imageHeight || _0xdfd129?.naturalHeight || _0xdfd129?.originalHeight || _0xdfd129?.height) || 0);
  if (!(_0x2e1931 > 0) || !(_0x4e50c8 > 0)) {
    return {
      width: _0x4d9110.width,
      height: _0x4d9110.height,
      imageWidth: 0,
      imageHeight: 0
    };
  }
  return {
    ...getAutoMediaSizeByShortSide(_0x2e1931, _0x4e50c8),
    imageWidth: _0x2e1931,
    imageHeight: _0x4e50c8
  };
}
async function resolveProjectAppearanceImageSizes(_0x17d226 = {}) {
  const _0x324d1c = await Promise.all(normalizeList(_0x17d226.characters).map(async _0x49a8a9 => {
    const _0x128073 = await Promise.all(normalizeList(_0x49a8a9?.appearances).map(async _0x47a044 => {
      const _0x35c7d9 = resolveAppearanceImageCanvasGeometry(_0x47a044);
      if (_0x35c7d9.imageWidth > 0 && _0x35c7d9.imageHeight > 0) {
        return _0x47a044;
      }
      const _0x141c4c = normalizeText(_0x47a044?.imageUrl || _0x47a044?.imageRef || _0x47a044?.url);
      if (!_0x141c4c) {
        return _0x47a044;
      }
      const _0x400fb3 = buildMediaLocation(_0x141c4c);
      const _0x2ee0a1 = await resolveOutputMediaSize({
        localPath: _0x400fb3.localPath,
        imageUrl: _0x400fb3.url
      });
      if (_0x2ee0a1) {
        return {
          ..._0x47a044,
          imageWidth: _0x2ee0a1.width,
          imageHeight: _0x2ee0a1.height
        };
      } else {
        return _0x47a044;
      }
    }));
    return {
      ..._0x49a8a9,
      appearances: _0x128073
    };
  }));
  return {
    ..._0x17d226,
    characters: _0x324d1c
  };
}
async function resolveProjectShotImageSizes(_0x55573e = {}) {
  const _0xc5d044 = await Promise.all(normalizeList(_0x55573e.shots).map(async _0x2bacd2 => {
    const _0x47439d = resolveShotImageCanvasGeometry(_0x2bacd2);
    if (_0x47439d.imageWidth > 0 && _0x47439d.imageHeight > 0) {
      return _0x2bacd2;
    }
    const _0x487ecf = [...new Set([normalizeText(_0x2bacd2?.keyframeRef), normalizeText(_0x2bacd2?.replacementImageRef)].filter(Boolean))];
    if (!_0x487ecf.length) {
      return _0x2bacd2;
    }
    const _0xdeb789 = (await Promise.all(_0x487ecf.map(async _0x26d485 => {
      const _0x1fd458 = buildMediaLocation(_0x26d485);
      return resolveOutputMediaSize({
        localPath: _0x1fd458.localPath,
        imageUrl: _0x1fd458.url
      });
    }))).find(Boolean);
    if (_0xdeb789) {
      return {
        ..._0x2bacd2,
        frame: {
          ...asObject(_0x2bacd2?.frame),
          width: _0xdeb789.width,
          height: _0xdeb789.height
        }
      };
    } else {
      return _0x2bacd2;
    }
  }));
  return {
    ..._0x55573e,
    shots: _0xc5d044
  };
}
function buildPersonReplacementSourceAudioNodeData({
  project = {},
  audioRef = "",
  name = "",
  binding = {}
} = {}) {
  const _0x17a1c1 = buildMediaLocation(audioRef);
  if (!_0x17a1c1.url) {
    throw new Error((normalizeText(name) || "音频") + "缺少可加入画布的媒体地址");
  }
  return {
    type: "source-audio",
    name: normalizeText(name) || "原音频片段",
    fileName: normalizeText(name) || "原音频片段",
    audioUrl: _0x17a1c1.url,
    localPath: _0x17a1c1.localPath,
    personReplacementBinding: buildBinding(project, binding)
  };
}
function buildPersonReplacementAudioCanvasNodeData({
  project = {},
  audioRef = "",
  name = "",
  prompt = "",
  model = "",
  binding = {},
  allowEmpty = false
} = {}) {
  const _0xc70132 = buildMediaLocation(audioRef);
  if (!_0xc70132.url && !allowEmpty) {
    throw new Error((normalizeText(name) || "音频") + "缺少可加入画布的媒体地址");
  }
  const _0x32f30a = _0xc70132.url ? [{
    audioUrl: _0xc70132.url,
    src: _0xc70132.url,
    localPath: _0xc70132.localPath
  }] : [];
  return {
    type: "ai-audio",
    name: normalizeText(name) || "替换音频",
    prompt: normalizeText(prompt),
    audios: _0x32f30a,
    mainAudioIndex: 0,
    audioUrl: _0xc70132.url,
    localPath: _0xc70132.localPath,
    ...(normalizeText(model) ? {
      model: normalizeText(model),
      audioWorkflowKey: normalizeText(model)
    } : {}),
    personReplacementBinding: buildBinding(project, binding)
  };
}
function buildStageAnnotationNodeData({
  project = {},
  stage = "",
  title = "",
  content = "",
  isProjectAnchor = false
} = {}) {
  const _0x406b6a = PERSON_REPLACEMENT_CANVAS_SCOPES.PROJECT;
  return {
    type: "comment-note",
    name: normalizeText(title),
    content: normalizeText(content),
    style: {
      fontSize: 40,
      textColor: "white",
      backgroundColor: "transparent"
    },
    personReplacementBinding: buildBinding(project, {
      kind: isProjectAnchor ? "project-overview" : "stage-annotation",
      stage: normalizeText(stage),
      canvasScope: _0x406b6a
    })
  };
}
function getCharacterAppearanceRecords(_0xca1721 = {}) {
  const _0x50be0b = [];
  normalizeList(_0xca1721.characters).forEach((_0x14ebdf, _0x4c8b1a) => {
    const _0x23a9d2 = normalizeText(_0x14ebdf?.id) || "character-" + (_0x4c8b1a + 1);
    const _0x306c9e = normalizeList(_0x14ebdf?.appearances);
    const _0x29a898 = normalizeList(_0x14ebdf?.imageRefs).map((_0x1a7589, _0x363b69) => ({
      id: "image-" + (_0x363b69 + 1),
      name: _0x363b69 === 0 ? "基础形象" : "形象 " + (_0x363b69 + 1),
      imageUrl: _0x1a7589,
      prompt: _0x14ebdf?.description
    }));
    const _0xb6cc1d = _0x306c9e.length ? _0x306c9e : _0x29a898.length ? _0x29a898 : [{
      id: "base",
      name: "基础形象",
      imageUrl: "",
      prompt: _0x14ebdf?.description
    }];
    _0xb6cc1d.forEach((_0x3099a1, _0x4bb06c) => {
      const _0x55e8b2 = normalizeText(_0x3099a1?.id) || "appearance-" + (_0x4bb06c + 1);
      _0x50be0b.push({
        key: "asset:" + _0x23a9d2 + ":" + _0x55e8b2,
        characterId: _0x23a9d2,
        appearanceId: _0x55e8b2,
        characterName: normalizeText(_0x14ebdf?.name) || "目标人物" + (_0x4c8b1a + 1),
        appearanceName: normalizeText(_0x3099a1?.name),
        imageRef: normalizeText(_0x3099a1?.imageUrl || _0x3099a1?.imageRef || _0x3099a1?.url),
        prompt: normalizeText(_0x3099a1?.prompt || _0x14ebdf?.description),
        imageWidth: Math.max(0, Number(_0x3099a1?.imageWidth || _0x3099a1?.naturalWidth || _0x3099a1?.originalWidth || _0x3099a1?.width) || 0),
        imageHeight: Math.max(0, Number(_0x3099a1?.imageHeight || _0x3099a1?.naturalHeight || _0x3099a1?.originalHeight || _0x3099a1?.height) || 0)
      });
    });
  });
  return _0x50be0b;
}
function appendAssetStage(_0x6edd5b, _0x59b5e9, _0x48e327, _0x349feb) {
  const _0x13f72a = PERSON_REPLACEMENT_CANVAS_NODE_SIZES["comment-note"];
  const _0x1dd97c = [];
  for (let _0x312da2 = 0; _0x312da2 < _0x349feb.length; _0x312da2 += ASSET_COLUMNS) {
    const _0xfd2a91 = _0x349feb.slice(_0x312da2, _0x312da2 + ASSET_COLUMNS);
    const _0x860493 = _0xfd2a91.map(_0x29b30f => ({
      appearance: _0x29b30f,
      geometry: resolveAppearanceImageCanvasGeometry(_0x29b30f)
    }));
    _0x1dd97c.push({
      items: _0x860493,
      width: _0x860493.reduce((_0x6eb2e0, _0x59f352, _0x2bdb87) => _0x6eb2e0 + _0x59f352.geometry.width + (_0x2bdb87 > 0 ? NODE_GAP : 0), 0),
      height: Math.max(..._0x860493.map(_0x2da4aa => _0x2da4aa.geometry.height))
    });
  }
  _0x6edd5b.push(createPlanEntry("stage:assets:annotation", buildStageAnnotationNodeData({
    project: _0x59b5e9,
    stage: "assets",
    title: "阶段 1 · 人物素材",
    content: "人物素材及形象参考图。",
    isProjectAnchor: true
  }), {
    x: 0,
    y: _0x48e327
  }));
  const _0x4826d7 = _0x48e327 + _0x13f72a.height + NODE_GAP;
  let _0x99e341 = 0;
  _0x1dd97c.forEach(_0x513c15 => {
    let _0x21d1a4 = 0;
    _0x513c15.items.forEach(({
      appearance: _0x5cb50c,
      geometry: _0x146729
    }) => {
      _0x6edd5b.push(createPlanEntry(_0x5cb50c.key, applyImageCanvasGeometry(buildPersonReplacementImageCanvasNodeData({
        project: _0x59b5e9,
        imageRef: _0x5cb50c.imageRef,
        name: [_0x5cb50c.characterName, _0x5cb50c.appearanceName].filter(Boolean).join(" · "),
        prompt: _0x5cb50c.prompt,
        model: _0x59b5e9.settings?.characterImageModelId,
        provider: _0x59b5e9.settings?.characterImageProvider,
        providerProfileId: _0x59b5e9.settings?.characterImageProviderProfileId,
        providerProfileIdByModel: _0x59b5e9.settings?.characterImageProviderProfileIdByModel,
        generationParams: _0x59b5e9.settings?.characterImageGenerationParams,
        allowEmpty: true,
        binding: {
          characterId: _0x5cb50c.characterId,
          appearanceId: _0x5cb50c.appearanceId,
          kind: "character-image",
          canvasScope: PERSON_REPLACEMENT_CANVAS_SCOPES.PROJECT
        }
      }), _0x146729), {
        x: _0x21d1a4,
        y: _0x4826d7 + _0x99e341
      }, {
        width: _0x146729.width,
        height: _0x146729.height
      }));
      _0x21d1a4 += _0x146729.width + NODE_GAP;
    });
    _0x99e341 += _0x513c15.height + NODE_GAP;
  });
  if (_0x1dd97c.length) {
    return _0x4826d7 + _0x99e341 - NODE_GAP;
  } else {
    return _0x48e327 + _0x13f72a.height;
  }
}
function buildShotPromptPackage(_0x5b6070, _0x5ace04) {
  return buildPersonReplacementPromptPackage({
    project: _0x5b6070,
    shot: _0x5ace04
  });
}
function buildDisplayedImagePrompt(_0x3d3779, _0x16d42b) {
  const _0x53d475 = normalizePromptDisplayText(_0x3d3779?.imagePrompt);
  const _0x4e808e = normalizeText(_0x16d42b?.prompt);
  const _0x58c9f4 = normalizeText(_0x16d42b?.bindingPrompt);
  if (!_0x53d475) {
    return _0x4e808e;
  }
  if (!_0x58c9f4 || _0x53d475 === _0x4e808e || _0x53d475.includes(_0x58c9f4)) {
    return _0x53d475;
  }
  return _0x53d475 + "\n\n" + _0x58c9f4;
}
function resolveAssetKeyForReference(_0x6c2039, _0x560a0b) {
  const _0x399f0c = normalizeText(_0x6c2039?.targetCharacterId);
  const _0x42d7d0 = normalizeText(_0x6c2039?.targetAppearanceId);
  const _0xf49ec4 = _0x560a0b.find(_0x14883d => _0x14883d.characterId === _0x399f0c && (!_0x42d7d0 || _0x14883d.appearanceId === _0x42d7d0));
  if (_0xf49ec4) {
    return _0xf49ec4.key;
  }
  const _0x5d94e5 = normalizeText(_0x6c2039?.ref);
  return _0x560a0b.find(_0x1c2978 => _0x1c2978.imageRef === _0x5d94e5)?.key || "";
}
function appendImageReplacementStage(_0x482569, _0x1fe889, _0x1ce4cf, _0x178e14) {
  const _0x5b3d25 = PERSON_REPLACEMENT_CANVAS_NODE_SIZES["comment-note"];
  const _0x4c47de = PERSON_REPLACEMENT_CANVAS_NODE_SIZES["source-text"];
  _0x482569.push(createPlanEntry("stage:image:annotation", buildStageAnnotationNodeData({
    project: _0x1fe889,
    stage: "image",
    title: "阶段 2 · 图像替换",
    content: "关键帧、人物定位图、人物素材和提示词共同连到替换结果图。"
  }), {
    x: 0,
    y: _0x1ce4cf
  }));
  let _0x2aef15 = _0x1ce4cf + _0x5b3d25.height + NODE_GAP;
  normalizeList(_0x1fe889.shots).forEach((_0x5e2c5b, _0x13c0ef) => {
    const _0x2f186a = normalizeText(_0x5e2c5b?.id) || "shot-" + (_0x13c0ef + 1);
    const _0x31c435 = formatSequence(_0x13c0ef);
    const _0x482641 = buildShotPromptPackage(_0x1fe889, _0x5e2c5b);
    const _0x38f6b2 = [];
    let _0x21344d = 0;
    const _0x1216e4 = resolveShotImageCanvasGeometry(_0x5e2c5b);
    const _0x4cdf03 = normalizeText(_0x5e2c5b?.keyframeRef);
    if (_0x4cdf03) {
      const _0x5e04d2 = "shot:" + _0x2f186a + ":keyframe";
      _0x482569.push(createPlanEntry(_0x5e04d2, applyImageCanvasGeometry(buildPersonReplacementImageCanvasNodeData({
        project: _0x1fe889,
        imageRef: _0x4cdf03,
        name: "镜头片段" + _0x31c435 + " · 关键帧",
        type: "source-image",
        binding: {
          shotId: _0x2f186a,
          kind: "source-keyframe",
          canvasScope: PERSON_REPLACEMENT_CANVAS_SCOPES.PROJECT
        }
      }), _0x1216e4, {
        source: true
      }), {
        x: _0x21344d,
        y: _0x2aef15
      }, {
        width: _0x1216e4.width,
        height: _0x1216e4.height
      }));
      _0x38f6b2.push(_0x5e04d2);
      _0x21344d += _0x1216e4.width + NODE_GAP;
    }
    normalizeList(_0x482641.referenceImages).filter(_0x3224e0 => _0x3224e0?.role === "target-character").forEach(_0x4673d7 => {
      const _0xf0f84c = resolveAssetKeyForReference(_0x4673d7, _0x178e14);
      if (_0xf0f84c && !_0x38f6b2.includes(_0xf0f84c)) {
        _0x38f6b2.push(_0xf0f84c);
      }
    });
    const _0x391587 = normalizeList(_0x482641.referenceImages).find(_0x2f5588 => _0x2f5588?.role === "person-location-guide");
    if (normalizeText(_0x391587?.ref)) {
      const _0x470dec = "shot:" + _0x2f186a + ":location-guide";
      _0x482569.push(createPlanEntry(_0x470dec, applyImageCanvasGeometry(buildPersonReplacementImageCanvasNodeData({
        project: _0x1fe889,
        imageRef: _0x391587.ref,
        name: "镜头片段" + _0x31c435 + " · 人物定位图",
        type: "source-image",
        binding: {
          shotId: _0x2f186a,
          kind: "person-location-guide",
          canvasScope: PERSON_REPLACEMENT_CANVAS_SCOPES.PROJECT
        }
      }), _0x1216e4, {
        source: true
      }), {
        x: _0x21344d,
        y: _0x2aef15
      }, {
        width: _0x1216e4.width,
        height: _0x1216e4.height
      }));
      _0x38f6b2.push(_0x470dec);
      _0x21344d += _0x1216e4.width + NODE_GAP;
    }
    const _0x571878 = buildDisplayedImagePrompt(_0x5e2c5b, _0x482641);
    const _0x20301a = "shot:" + _0x2f186a + ":prompt";
    _0x482569.push(createPlanEntry(_0x20301a, {
      type: "source-text",
      name: "镜头片段" + _0x31c435 + " · 图像替换提示词",
      content: _0x571878,
      personReplacementBinding: buildBinding(_0x1fe889, {
        shotId: _0x2f186a,
        kind: "image-prompt",
        canvasScope: PERSON_REPLACEMENT_CANVAS_SCOPES.PROJECT
      })
    }, {
      x: _0x21344d,
      y: _0x2aef15
    }));
    _0x38f6b2.push(_0x20301a);
    _0x21344d += _0x4c47de.width + NODE_GAP;
    _0x482569.push(createPlanEntry("shot:" + _0x2f186a + ":replacement-image", applyImageCanvasGeometry(buildPersonReplacementImageCanvasNodeData({
      project: _0x1fe889,
      imageRef: _0x5e2c5b?.replacementImageRef,
      name: "镜头片段" + _0x31c435 + " · 替换结果图",
      prompt: "",
      model: _0x1fe889.settings?.replacementImageModelId,
      provider: _0x1fe889.settings?.replacementImageProvider,
      providerProfileId: _0x1fe889.settings?.replacementImageProviderProfileId,
      providerProfileIdByModel: _0x1fe889.settings?.replacementImageProviderProfileIdByModel,
      generationParams: _0x1fe889.settings?.replacementImageGenerationParams,
      allowEmpty: true,
      binding: {
        shotId: _0x2f186a,
        kind: "replacement-image",
        canvasScope: PERSON_REPLACEMENT_CANVAS_SCOPES.PROJECT
      }
    }), _0x1216e4), {
      x: _0x21344d,
      y: _0x2aef15
    }, {
      width: _0x1216e4.width,
      height: _0x1216e4.height,
      inputKeys: _0x38f6b2
    }));
    _0x2aef15 += Math.max(_0x1216e4.height, _0x4c47de.height) + SECTION_GAP;
  });
  return Math.max(_0x1ce4cf + _0x5b3d25.height, _0x2aef15 - SECTION_GAP);
}
function appendVideoReplacementStage(_0x552661, _0x41b5e5, _0x110f0f) {
  const _0x593a4a = PERSON_REPLACEMENT_CANVAS_NODE_SIZES["comment-note"];
  _0x552661.push(createPlanEntry("stage:video:annotation", buildStageAnnotationNodeData({
    project: _0x41b5e5,
    stage: "video",
    title: "阶段 3 · 视频替换",
    content: "原视频片段与替换结果图共同连到替换视频。"
  }), {
    x: 0,
    y: _0x110f0f
  }));
  let _0x52131a = _0x110f0f + _0x593a4a.height + NODE_GAP;
  normalizeList(_0x41b5e5.shots).forEach((_0x372bcc, _0x50b48c) => {
    const _0x13c594 = normalizeText(_0x372bcc?.id) || "shot-" + (_0x50b48c + 1);
    const _0x326464 = formatSequence(_0x50b48c);
    const _0x8b4821 = [];
    let _0x5b4f13 = 0;
    const _0x47b990 = resolveShotVideoCanvasGeometry(_0x372bcc);
    const _0x582e6e = normalizeText(_0x372bcc?.videoRef || _0x372bcc?.sourceVideoRef);
    if (_0x582e6e) {
      const _0xd08e6a = "shot:" + _0x13c594 + ":original-video";
      _0x552661.push(createPlanEntry(_0xd08e6a, applyVideoCanvasGeometry(buildPersonReplacementVideoCanvasNodeData({
        project: _0x41b5e5,
        videoRef: _0x582e6e,
        name: "镜头片段" + _0x326464 + " · 原视频",
        type: "source-video",
        binding: {
          shotId: _0x13c594,
          kind: "original-video",
          canvasScope: PERSON_REPLACEMENT_CANVAS_SCOPES.PROJECT
        }
      }), _0x47b990), {
        x: _0x5b4f13,
        y: _0x52131a
      }, {
        width: _0x47b990.width,
        height: _0x47b990.height
      }));
      _0x8b4821.push(_0xd08e6a);
      _0x5b4f13 += _0x47b990.width + NODE_GAP;
    }
    const _0x6fdefa = "shot:" + _0x13c594 + ":replacement-image";
    _0x8b4821.push(_0x6fdefa);
    _0x552661.push(createPlanEntry("shot:" + _0x13c594 + ":replacement-video", applyVideoCanvasGeometry(buildPersonReplacementVideoCanvasNodeData({
      project: _0x41b5e5,
      videoRef: _0x372bcc?.resultVideoRef,
      name: "镜头片段" + _0x326464 + " · 替换视频",
      prompt: _0x372bcc?.videoPrompt,
      model: _0x41b5e5.settings?.replacementModelId,
      providerProfileId: _0x41b5e5.settings?.replacementVideoProviderProfileId,
      providerProfileIdByModel: _0x41b5e5.settings?.replacementVideoProviderProfileIdByModel,
      generationParams: _0x41b5e5.settings?.replacementVideoGenerationParams,
      allowEmpty: true,
      binding: {
        shotId: _0x13c594,
        kind: "replacement-video",
        canvasScope: PERSON_REPLACEMENT_CANVAS_SCOPES.PROJECT
      }
    }), _0x47b990), {
      x: _0x5b4f13,
      y: _0x52131a
    }, {
      width: _0x47b990.width,
      height: _0x47b990.height,
      inputKeys: _0x8b4821
    }));
    _0x52131a += _0x47b990.height + SECTION_GAP;
  });
  return Math.max(_0x110f0f + _0x593a4a.height, _0x52131a - SECTION_GAP);
}
function getVoiceSegments(_0xfb9efe = {}) {
  const _0x66fd34 = [];
  Object.entries(asObject(_0xfb9efe.audio?.voiceStudioState)).forEach(([_0x55f6dd, _0x1ce0ca]) => {
    normalizeList(_0x1ce0ca?.audioVoiceAnalysis?.segments).forEach((_0x5b3bad, _0x45dd1e) => {
      _0x66fd34.push({
        ...asObject(_0x5b3bad),
        sourceId: normalizeText(_0x55f6dd) || "source",
        segmentId: normalizeText(_0x5b3bad?.id) || "segment-" + (_0x45dd1e + 1)
      });
    });
  });
  return _0x66fd34;
}
function appendVoiceReplacementStage(_0x380584, _0xfad128, _0x30d063) {
  const _0x1f859c = PERSON_REPLACEMENT_CANVAS_NODE_SIZES["comment-note"];
  const _0x991ee8 = PERSON_REPLACEMENT_CANVAS_NODE_SIZES["ai-audio"];
  _0x380584.push(createPlanEntry("stage:voice:annotation", buildStageAnnotationNodeData({
    project: _0xfad128,
    stage: "voice",
    title: "阶段 4 · 声音克隆",
    content: "使用源音频时，源音频连到替换音频；使用参考音频时，原音频与参考音频共同连到替换音频。总合成音频独立展示。"
  }), {
    x: 0,
    y: _0x30d063
  }));
  const _0x35b986 = _0x30d063 + _0x1f859c.height + NODE_GAP;
  let _0x53bb10 = _0x35b986;
  let _0x369f7a = _0x30d063 + _0x1f859c.height;
  let _0x1f8c85 = 0;
  getVoiceSegments(_0xfad128).forEach((_0x549017, _0x39c80d) => {
    const _0x4d433c = normalizeText(_0x549017.sourceId);
    const _0x122c4f = normalizeText(_0x549017.segmentId);
    const _0x423aeb = formatSequence(_0x39c80d);
    const _0x8d8a66 = [];
    let _0x4e7bc0 = 0;
    const _0x1ca270 = normalizeText(_0x549017.sourceAudioLocalPath || _0x549017.sourceAudioUrl);
    if (_0x1ca270) {
      const _0x3d8e70 = "voice:" + _0x4d433c + ":" + _0x122c4f + ":source-audio";
      _0x380584.push(createPlanEntry(_0x3d8e70, buildPersonReplacementSourceAudioNodeData({
        project: _0xfad128,
        audioRef: _0x1ca270,
        name: "声音片段" + _0x423aeb + " · 原音频片段",
        binding: {
          sourceId: _0x4d433c,
          segmentId: _0x122c4f,
          kind: "source-audio-segment",
          canvasScope: PERSON_REPLACEMENT_CANVAS_SCOPES.PROJECT
        }
      }), {
        x: _0x4e7bc0,
        y: _0x53bb10
      }));
      _0x8d8a66.push(_0x3d8e70);
      _0x4e7bc0 += _0x991ee8.width + NODE_GAP;
    }
    const _0x323d5e = normalizeText(_0x549017.voiceRefAudioLocalPath || _0x549017.voiceRefAudioUrl);
    if (_0x323d5e) {
      const _0x17ff6e = "voice:" + _0x4d433c + ":" + _0x122c4f + ":reference-audio";
      _0x380584.push(createPlanEntry(_0x17ff6e, buildPersonReplacementSourceAudioNodeData({
        project: _0xfad128,
        audioRef: _0x323d5e,
        name: normalizeText(_0x549017.voiceRefName) || "声音片段" + _0x423aeb + " · 参考音频",
        binding: {
          sourceId: _0x4d433c,
          segmentId: _0x122c4f,
          kind: "reference-audio",
          canvasScope: PERSON_REPLACEMENT_CANVAS_SCOPES.PROJECT
        }
      }), {
        x: _0x4e7bc0,
        y: _0x53bb10
      }));
      _0x8d8a66.push(_0x17ff6e);
      _0x4e7bc0 += _0x991ee8.width + NODE_GAP;
    }
    const _0x32c850 = "voice:" + _0x4d433c + ":" + _0x122c4f + ":replacement-audio";
    _0x380584.push(createPlanEntry(_0x32c850, buildPersonReplacementAudioCanvasNodeData({
      project: _0xfad128,
      audioRef: _0x549017.convertedAudioLocalPath || _0x549017.convertedAudioUrl,
      name: "声音片段" + _0x423aeb + " · 替换音频",
      prompt: _0x549017.targetText || _0x549017.sourceText,
      model: _0x549017.voiceModelId,
      allowEmpty: true,
      binding: {
        sourceId: _0x4d433c,
        segmentId: _0x122c4f,
        kind: "replacement-audio-segment",
        canvasScope: PERSON_REPLACEMENT_CANVAS_SCOPES.PROJECT
      }
    }), {
      x: _0x4e7bc0,
      y: _0x53bb10
    }, {
      inputKeys: _0x8d8a66
    }));
    _0x1f8c85 = Math.max(_0x1f8c85, _0x4e7bc0 + _0x991ee8.width);
    _0x369f7a = Math.max(_0x369f7a, _0x53bb10 + _0x991ee8.height);
    _0x53bb10 += _0x991ee8.height + SECTION_GAP;
  });
  const _0x1464fb = normalizeText(_0xfad128.audio?.replacementAudioRef);
  if (_0x1464fb) {
    const _0x34f707 = _0x1f8c85 ? _0x1f8c85 + NODE_GAP : 0;
    _0x380584.push(createPlanEntry("voice:timeline", buildPersonReplacementSourceAudioNodeData({
      project: _0xfad128,
      audioRef: _0x1464fb,
      name: "替换音频 · 总合成音频",
      binding: {
        kind: "replacement-audio-timeline",
        canvasScope: PERSON_REPLACEMENT_CANVAS_SCOPES.PROJECT
      }
    }), {
      x: _0x34f707,
      y: _0x35b986
    }));
    _0x369f7a = Math.max(_0x369f7a, _0x35b986 + _0x991ee8.height);
  }
  return _0x369f7a;
}
function appendCompositeStage(_0x1747be, _0x27c641, _0x2c7b1d) {
  const _0x2aeabd = PERSON_REPLACEMENT_CANVAS_NODE_SIZES["comment-note"];
  const _0x23bc28 = PERSON_REPLACEMENT_CANVAS_NODE_SIZES["source-video"];
  _0x1747be.push(createPlanEntry("stage:composite:annotation", buildStageAnnotationNodeData({
    project: _0x27c641,
    stage: "composite",
    title: "阶段 5 · 最终合成对比",
    content: "原视频与最终替换视频用于效果对比。"
  }), {
    x: 0,
    y: _0x2c7b1d
  }));
  const _0x944b83 = _0x2c7b1d + _0x2aeabd.height + NODE_GAP;
  let _0x32386d = 0;
  const _0x25e586 = normalizeList(_0x27c641.sources);
  const _0x1dfb73 = _0x25e586.findIndex(_0x228978 => normalizeText(_0x228978?.videoRef));
  if (_0x1dfb73 >= 0) {
    const _0x1c9dbe = _0x25e586[_0x1dfb73];
    const _0x37795a = normalizeText(_0x1c9dbe.videoRef);
    const _0x533e3d = normalizeText(_0x1c9dbe?.id) || "source-" + (_0x1dfb73 + 1);
    _0x1747be.push(createPlanEntry("project:source:" + _0x533e3d + ":comparison-video", buildPersonReplacementVideoCanvasNodeData({
      project: _0x27c641,
      videoRef: _0x37795a,
      name: "原视频 · 对比",
      type: "source-video",
      binding: {
        sourceId: _0x533e3d,
        kind: "comparison-source-video",
        canvasScope: PERSON_REPLACEMENT_CANVAS_SCOPES.PROJECT
      }
    }), {
      x: _0x32386d * (_0x23bc28.width + NODE_GAP),
      y: _0x944b83
    }));
    _0x32386d += 1;
  }
  const _0x4efbb6 = normalizeText(_0x27c641.output?.finalVideoRef || _0x27c641.output?.visualMasterRef);
  if (_0x4efbb6) {
    _0x1747be.push(createPlanEntry("project:composite-output", buildPersonReplacementVideoCanvasNodeData({
      project: _0x27c641,
      videoRef: _0x4efbb6,
      name: (normalizeText(_0x27c641.title) || "人物替换项目") + " · 最终替换视频",
      type: "source-video",
      binding: {
        kind: "composite-output",
        canvasScope: PERSON_REPLACEMENT_CANVAS_SCOPES.PROJECT
      }
    }), {
      x: _0x32386d * (_0x23bc28.width + NODE_GAP),
      y: _0x944b83
    }));
  }
  return _0x944b83 + _0x23bc28.height;
}
export function buildPersonReplacementOutputCanvasNodeData({
  project = {},
  videoRef = ""
} = {}) {
  return buildPersonReplacementVideoCanvasNodeData({
    project: project,
    videoRef: videoRef,
    name: (normalizeText(project.title) || "人物替换项目") + " · 合成视频",
    type: "source-video",
    binding: {
      kind: "composite-output",
      canvasScope: PERSON_REPLACEMENT_CANVAS_SCOPES.PROJECT
    }
  });
}
function buildReplacementClipPlan(_0x33c926, _0x592cfd) {
  const _0x3620fa = [];
  let _0x2b4c28 = 0;
  normalizeList(_0x33c926.shots).forEach((_0x10c36e, _0x4cbcd5) => {
    const _0x17bea3 = normalizeText(_0x10c36e?.resultVideoRef);
    if (!_0x17bea3) {
      return;
    }
    const _0x193be3 = normalizeText(_0x10c36e?.id) || "shot-" + (_0x4cbcd5 + 1);
    const _0x2082cf = resolveShotVideoCanvasGeometry(_0x10c36e);
    _0x3620fa.push(createPlanEntry("shot:" + _0x193be3 + ":replacement-video", applyVideoCanvasGeometry(buildPersonReplacementVideoCanvasNodeData({
      project: _0x33c926,
      videoRef: _0x17bea3,
      name: "镜头片段" + formatSequence(_0x4cbcd5) + " · 替换视频",
      binding: {
        shotId: _0x193be3,
        kind: "replacement-video",
        canvasScope: _0x592cfd
      }
    }), _0x2082cf), {
      x: _0x2b4c28,
      y: 0
    }, {
      width: _0x2082cf.width,
      height: _0x2082cf.height
    }));
    _0x2b4c28 += _0x2082cf.width + NODE_GAP;
  });
  return _0x3620fa;
}
function getPlanBounds(_0x2f189e) {
  const _0x58e4a7 = normalizeList(_0x2f189e);
  if (!_0x58e4a7.length) {
    return {
      left: 0,
      top: 0,
      right: 0,
      bottom: 0,
      width: 0,
      height: 0
    };
  }
  const _0x2d2235 = Math.min(..._0x58e4a7.map(_0x49db42 => _0x49db42.position.x));
  const _0x37694e = Math.min(..._0x58e4a7.map(_0x3d83c1 => _0x3d83c1.position.y));
  const _0x3cac5e = Math.max(..._0x58e4a7.map(_0x30f05e => _0x30f05e.position.x + _0x30f05e.width));
  const _0x126ba7 = Math.max(..._0x58e4a7.map(_0x47474e => _0x47474e.position.y + _0x47474e.height));
  return {
    left: _0x2d2235,
    top: _0x37694e,
    right: _0x3cac5e,
    bottom: _0x126ba7,
    width: _0x3cac5e - _0x2d2235,
    height: _0x126ba7 - _0x37694e
  };
}
function wrapStageEntriesInGroup({
  entries: _0x4c8e8a,
  project: _0x45080b,
  stage: _0x1a8fb7,
  name: _0x499449,
  canvasScope = PERSON_REPLACEMENT_CANVAS_SCOPES.PROJECT
} = {}) {
  const _0x16295d = normalizeList(_0x4c8e8a).filter(_0x184b18 => _0x184b18.type !== "group");
  if (!_0x16295d.length) {
    return [];
  }
  const _0x5eda92 = "stage:" + normalizeText(_0x1a8fb7) + ":group";
  const _0x2f9618 = calculateGroupNodeBounds(_0x16295d.map(_0x3af527 => ({
    x: _0x3af527.position.x,
    y: _0x3af527.position.y,
    width: _0x3af527.width,
    height: _0x3af527.height
  })));
  const _0x569afa = createPlanEntry(_0x5eda92, {
    type: "group",
    name: normalizeText(_0x499449),
    color: STAGE_GROUP_COLORS[normalizeText(_0x1a8fb7)] || "var(--indigo)",
    width: _0x2f9618.width,
    height: _0x2f9618.height,
    personReplacementBinding: buildBinding(_0x45080b, {
      kind: "stage-group",
      stage: normalizeText(_0x1a8fb7),
      canvasScope: canvasScope
    })
  }, {
    x: _0x2f9618.x,
    y: _0x2f9618.y
  }, {
    width: _0x2f9618.width,
    height: _0x2f9618.height
  });
  return [_0x569afa, ..._0x16295d.map(_0x553ae4 => ({
    ..._0x553ae4,
    parentKey: _0x5eda92
  }))];
}
function appendHorizontalStage(_0x3597ed, _0x472769, _0x461348) {
  const _0x5caf87 = getPlanBounds(_0x472769);
  const _0xcb5b0e = _0x461348 - _0x5caf87.left;
  const _0x44c852 = -_0x5caf87.top;
  _0x3597ed.push(..._0x472769.map(_0x5f09a0 => ({
    ..._0x5f09a0,
    position: {
      x: _0x5f09a0.position.x + _0xcb5b0e,
      y: _0x5f09a0.position.y + _0x44c852
    }
  })));
  return _0x461348 + _0x5caf87.width + STAGE_GAP;
}
function buildProjectCanvasPlan(_0x4ff0f5) {
  const _0x4134b1 = [];
  const _0x5e66f0 = getCharacterAppearanceRecords(_0x4ff0f5);
  const _0x1fa6b6 = normalizeWorkspaceStep(_0x4ff0f5);
  let _0x3b74bb = 0;
  const _0x2d91f1 = ({
    stage: _0x59cd3f,
    name: _0x2a0c4a,
    buildStage: _0xfb0a34
  }) => {
    const _0x1c8026 = [];
    _0xfb0a34(_0x1c8026);
    const _0x311556 = wrapStageEntriesInGroup({
      entries: _0x1c8026,
      project: _0x4ff0f5,
      stage: _0x59cd3f,
      name: _0x2a0c4a
    });
    _0x3b74bb = appendHorizontalStage(_0x4134b1, _0x311556, _0x3b74bb);
  };
  _0x2d91f1({
    stage: "assets",
    name: "阶段 1 · 素材设定",
    buildStage: _0x497b5b => {
      appendAssetStage(_0x497b5b, _0x4ff0f5, 0, _0x5e66f0);
    }
  });
  if (_0x1fa6b6 >= 2) {
    _0x2d91f1({
      stage: "image",
      name: "阶段 2 · 图像替换",
      buildStage: _0x1183c7 => {
        appendImageReplacementStage(_0x1183c7, _0x4ff0f5, 0, _0x5e66f0);
      }
    });
  }
  if (_0x1fa6b6 >= 3) {
    _0x2d91f1({
      stage: "video",
      name: "阶段 3 · 视频替换",
      buildStage: _0x145671 => {
        appendVideoReplacementStage(_0x145671, _0x4ff0f5, 0);
      }
    });
  }
  if (_0x1fa6b6 >= 4) {
    _0x2d91f1({
      stage: "voice",
      name: "阶段 4 · 声音克隆",
      buildStage: _0x470bea => {
        appendVoiceReplacementStage(_0x470bea, _0x4ff0f5, 0);
      }
    });
  }
  if (_0x1fa6b6 >= 5) {
    _0x2d91f1({
      stage: "composite",
      name: "阶段 5 · 合成视频",
      buildStage: _0x37c2d0 => {
        appendCompositeStage(_0x37c2d0, _0x4ff0f5, 0);
      }
    });
  }
  return _0x4134b1;
}
function clonePlanEntryForScope(_0x217c04, _0xd6833b, _0x2dd165) {
  const _0x3e81e1 = asObject(_0x217c04.data?.personReplacementBinding);
  const _0x4c63aa = normalizeList(_0x217c04.inputKeys).map(normalizeText).filter(_0x2aa70d => _0x2dd165.has(_0x2aa70d));
  const _0x59782e = normalizeText(_0x217c04.parentKey);
  const _0x3038a4 = {
    ..._0x217c04,
    data: {
      ..._0x217c04.data,
      personReplacementBinding: {
        ..._0x3e81e1,
        canvasScope: _0xd6833b
      }
    }
  };
  delete _0x3038a4.inputKeys;
  delete _0x3038a4.parentKey;
  if (_0x4c63aa.length) {
    _0x3038a4.inputKeys = _0x4c63aa;
  }
  if (_0x59782e && _0x2dd165.has(_0x59782e)) {
    _0x3038a4.parentKey = _0x59782e;
  }
  return _0x3038a4;
}
function normalizePlanOrigin(_0x56ab6e) {
  const _0x5c5be7 = Math.min(..._0x56ab6e.map(_0x2a02a4 => Number(_0x2a02a4.position?.x) || 0));
  const _0x3ca682 = Math.min(..._0x56ab6e.map(_0x42fb8b => Number(_0x42fb8b.position?.y) || 0));
  return _0x56ab6e.map(_0x2c779f => ({
    ..._0x2c779f,
    position: {
      x: (Number(_0x2c779f.position?.x) || 0) - _0x5c5be7,
      y: (Number(_0x2c779f.position?.y) || 0) - _0x3ca682
    }
  }));
}
function reflowCurrentVideoPlan(_0x3770b9, _0x291c1f) {
  const _0x442526 = _0x3770b9.find(_0x3d4b82 => _0x3d4b82.key === "stage:video:annotation");
  const _0x56eafb = new Map(_0x3770b9.map(_0x39238f => [_0x39238f.key, _0x39238f]));
  let _0x3c0114 = PERSON_REPLACEMENT_CANVAS_NODE_SIZES["comment-note"].height + NODE_GAP;
  const _0x25ebf8 = _0x442526 ? [{
    ..._0x442526,
    position: {
      x: 0,
      y: 0
    },
    parentKey: ""
  }] : [];
  normalizeList(_0x291c1f.shots).forEach((_0x1667f4, _0x15a4ca) => {
    const _0x5f476e = normalizeText(_0x1667f4?.id) || "shot-" + (_0x15a4ca + 1);
    const _0x46978c = _0x56eafb.get("shot:" + _0x5f476e + ":original-video");
    const _0x573be3 = _0x56eafb.get("shot:" + _0x5f476e + ":replacement-image");
    const _0x4b8859 = _0x56eafb.get("shot:" + _0x5f476e + ":replacement-video");
    let _0x16e64f = 0;
    let _0x54f7bc = Math.max(Number(_0x573be3?.height) || 0, Number(_0x46978c?.height) || 0, Number(_0x4b8859?.height) || 0, PERSON_REPLACEMENT_CANVAS_NODE_SIZES["ai-video"].height);
    if (_0x573be3) {
      _0x25ebf8.push({
        ..._0x573be3,
        position: {
          x: _0x16e64f,
          y: _0x3c0114
        },
        parentKey: ""
      });
      _0x16e64f += _0x573be3.width + NODE_GAP;
      _0x54f7bc = Math.max(_0x54f7bc, _0x573be3.height);
    }
    if (_0x46978c) {
      _0x25ebf8.push({
        ..._0x46978c,
        position: {
          x: _0x16e64f,
          y: _0x3c0114
        },
        parentKey: ""
      });
      _0x16e64f += _0x46978c.width + NODE_GAP;
    }
    if (_0x4b8859) {
      _0x25ebf8.push({
        ..._0x4b8859,
        position: {
          x: _0x16e64f,
          y: _0x3c0114
        },
        parentKey: ""
      });
    }
    _0x3c0114 += _0x54f7bc + SECTION_GAP;
  });
  return normalizePlanOrigin(wrapStageEntriesInGroup({
    entries: _0x25ebf8,
    project: _0x291c1f,
    stage: "video",
    name: "阶段 3 · 视频替换",
    canvasScope: PERSON_REPLACEMENT_CANVAS_SCOPES.CLIPS
  }));
}
function buildCurrentInterfacePlan(_0x25f674) {
  const _0x5228b8 = normalizeWorkspaceStep(_0x25f674);
  const _0x3569e4 = buildProjectCanvasPlan(_0x25f674);
  const _0x2d6a15 = _0x13062b => {
    if (_0x5228b8 === 1) {
      return _0x13062b.key.startsWith("stage:assets:") || _0x13062b.key.startsWith("asset:");
    }
    if (_0x5228b8 === 2) {
      return _0x13062b.key.startsWith("stage:assets:") || _0x13062b.key.startsWith("asset:") || _0x13062b.key.startsWith("stage:image:") || /^shot:[^:]+:(?:keyframe|location-guide|prompt|replacement-image)$/.test(_0x13062b.key);
    }
    if (_0x5228b8 === 3) {
      return _0x13062b.key.startsWith("stage:video:") || /^shot:[^:]+:(?:replacement-image|original-video|replacement-video)$/.test(_0x13062b.key);
    }
    if (_0x5228b8 === 4) {
      return _0x13062b.key.startsWith("stage:voice:") || _0x13062b.key.startsWith("voice:");
    }
    return false;
  };
  const _0x324515 = _0x3569e4.filter(_0x2d6a15);
  const _0x43c941 = new Set(_0x324515.map(_0x54c268 => _0x54c268.key));
  const _0x2a089b = _0x324515.map(_0x5bb4a3 => clonePlanEntryForScope(_0x5bb4a3, PERSON_REPLACEMENT_CANVAS_SCOPES.CLIPS, _0x43c941));
  if (_0x5228b8 === 3) {
    return reflowCurrentVideoPlan(_0x2a089b, _0x25f674);
  } else {
    return normalizePlanOrigin(_0x2a089b);
  }
}
export function buildPersonReplacementCanvasPlan({
  project = {},
  scope = PERSON_REPLACEMENT_CANVAS_SCOPES.CLIPS
} = {}) {
  const _0x353547 = normalizeScope(scope);
  if (_0x353547 === PERSON_REPLACEMENT_CANVAS_SCOPES.CLIPS) {
    if (normalizeWorkspaceStep(project) < 5) {
      return buildCurrentInterfacePlan(project);
    } else {
      return buildReplacementClipPlan(project, _0x353547);
    }
  }
  return buildProjectCanvasPlan(project);
}
function buildPlanLayout(_0xcbdddf = []) {
  return Object.fromEntries(normalizeList(_0xcbdddf).map(_0x130a4e => [_0x130a4e.key, {
    x: Number(_0x130a4e.position?.x) || 0,
    y: Number(_0x130a4e.position?.y) || 0,
    width: Number(_0x130a4e.width) || 0,
    height: Number(_0x130a4e.height) || 0
  }]));
}
function hasSameGeometry(_0x58b8e9 = {}, _0x18a945 = {}) {
  return Number(_0x58b8e9.x) === Number(_0x18a945.x) && Number(_0x58b8e9.y) === Number(_0x18a945.y) && Number(_0x58b8e9.width) === Number(_0x18a945.width) && Number(_0x58b8e9.height) === Number(_0x18a945.height);
}
async function shouldReflowManagedNodes({
  plan = [],
  planLayout = {},
  previousBinding = {},
  adapter: _0x205eeb,
  canvasId = ""
} = {}) {
  const _0x54eeb3 = asObject(previousBinding.nodes);
  const _0x1249d5 = plan.map(_0x12df79 => _0x12df79.key);
  const _0x52fce6 = Object.keys(_0x54eeb3);
  if (_0x1249d5.length !== _0x52fce6.length || _0x1249d5.some(_0x111cc5 => !normalizeText(_0x54eeb3[_0x111cc5])) || _0x52fce6.some(_0x126abb => !(_0x126abb in planLayout))) {
    return true;
  }
  const _0x1e436c = asObject(previousBinding.layout);
  if (Object.keys(_0x1e436c).length) {
    return _0x1249d5.some(_0x5d8893 => !hasSameGeometry(asObject(_0x1e436c[_0x5d8893]), asObject(planLayout[_0x5d8893])));
  }
  if (typeof _0x205eeb?.getNode !== "function") {
    return false;
  }
  for (const _0x561c54 of plan) {
    const _0x2b3f0f = normalizeText(_0x54eeb3[_0x561c54.key]);
    if (!_0x2b3f0f || !(await _0x205eeb.nodeExists(_0x2b3f0f, canvasId))) {
      return true;
    }
    const _0x3b5ac2 = await _0x205eeb.getNode(_0x2b3f0f, canvasId);
    if (Number(_0x3b5ac2?.width) !== Number(_0x561c54.width) || Number(_0x3b5ac2?.height) !== Number(_0x561c54.height)) {
      return true;
    }
  }
  return true;
}
async function rollbackCanvasMutation({
  adapter: _0x1cfc83,
  canvasId = "",
  reused = false,
  mutationSnapshot: _0x9bdaf9
} = {}) {
  if (!reused && typeof _0x1cfc83?.deleteCanvas === "function") {
    try {
      const _0x153183 = await _0x1cfc83.deleteCanvas(canvasId, {
        skipDirtyConfirm: true
      });
      if (_0x153183 !== false) {
        return true;
      }
    } catch {}
  }
  if (typeof _0x1cfc83?.restoreMutationSnapshot === "function" && _0x9bdaf9) {
    try {
      return (await _0x1cfc83.restoreMutationSnapshot(_0x9bdaf9, {
        canvasId: canvasId
      })) !== false;
    } catch {}
  }
  return false;
}
export async function syncPersonReplacementCanvas({
  project = {},
  scope = PERSON_REPLACEMENT_CANVAS_SCOPES.CLIPS,
  adapter: _0xab9278,
  saveOutputBlob = null
} = {}) {
  const _0x4afa40 = ["canvasExists", "switchCanvas", "createCanvas", "nodeExists", "createNode", "updateNode"];
  if (_0x4afa40.some(_0x28dbf8 => typeof _0xab9278?.[_0x28dbf8] !== "function")) {
    throw new Error("人物替换画布适配器不完整");
  }
  const _0xb5d624 = normalizeScope(scope);
  const _0x4a71db = normalizeWorkspaceStep(project);
  const _0x212ae8 = _0xb5d624 === PERSON_REPLACEMENT_CANVAS_SCOPES.PROJECT || _0x4a71db <= 2;
  const _0x1b24e0 = _0xb5d624 === PERSON_REPLACEMENT_CANVAS_SCOPES.PROJECT || _0x4a71db === 2 || _0x4a71db === 3;
  const [_0x209235, _0x591003] = await Promise.all([_0x212ae8 ? resolveProjectAppearanceImageSizes(project) : project, _0x1b24e0 ? resolveProjectShotImageSizes(project) : project]);
  const _0x133390 = {
    ...project,
    characters: _0x209235.characters,
    shots: _0x591003.shots
  };
  const _0x4fb7e9 = buildPersonReplacementCanvasPlan({
    project: _0x133390,
    scope: _0xb5d624
  });
  if (!_0x4fb7e9.length) {
    throw new Error("当前项目还没有可同步到画布的内容。");
  }
  if (_0x4fb7e9.some(_0x419856 => _0x419856.parentKey) && typeof _0xab9278?.setNodeParent !== "function") {
    throw new Error("人物替换画布适配器缺少节点分组能力");
  }
  if (_0x4fb7e9.some(_0x49323c => normalizeList(_0x49323c.inputKeys).length) && typeof _0xab9278?.connectNodes !== "function") {
    throw new Error("人物替换画布适配器缺少节点连线能力");
  }
  const _0x2bf7c4 = normalizeText(project.title) || "人物替换项目";
  const _0x10b25f = _0xb5d624 === PERSON_REPLACEMENT_CANVAS_SCOPES.CLIPS && _0x4a71db < 5 ? _0x2bf7c4 + " · " + getWorkspaceStepName(_0x4a71db) : _0x2bf7c4;
  const _0x2bc387 = asObject(project.output?.canvasBinding);
  const _0x444d28 = normalizeText(_0x2bc387.canvasId);
  const _0x4b3773 = normalizeText(_0x2bc387.scope) === _0xb5d624;
  const _0x31c1fb = _0xb5d624 !== PERSON_REPLACEMENT_CANVAS_SCOPES.CLIPS || Math.trunc(Number(_0x2bc387.workspaceStep) || 0) === _0x4a71db;
  const _0x3bb43f = Math.trunc(Number(_0x2bc387.layoutVersion) || 0) === PERSON_REPLACEMENT_CANVAS_LAYOUT_VERSION;
  const _0x9d81f4 = Boolean(_0x444d28 && _0x4b3773 && _0x31c1fb && _0x3bb43f && (await _0xab9278.canvasExists(_0x444d28)));
  let _0x76b3c6 = "";
  if (_0x9d81f4) {
    const _0x1b3908 = await _0xab9278.switchCanvas(_0x444d28);
    if (_0x1b3908 === false) {
      throw new Error("无法切换到已绑定的人物替换画布：" + _0x444d28);
    }
    _0x76b3c6 = _0x444d28;
  } else {
    _0x76b3c6 = normalizeText(await _0xab9278.createCanvas(_0x10b25f));
  }
  if (!_0x76b3c6) {
    throw new Error("新建人物替换画布后未获得活动画布 ID");
  }
  const _0x566c92 = asObject(_0x2bc387.nodes);
  const _0x43d527 = buildPlanLayout(_0x4fb7e9);
  const _0xdfbe49 = _0x9d81f4 ? await shouldReflowManagedNodes({
    plan: _0x4fb7e9,
    planLayout: _0x43d527,
    previousBinding: _0x2bc387,
    adapter: _0xab9278,
    canvasId: _0x76b3c6
  }) : false;
  const _0x41b20d = {};
  const _0x187af7 = [];
  let _0x14bf70 = 0;
  let _0x552681 = 0;
  let _0x315c3f = 0;
  const _0x57dd65 = "person-replacement:" + (normalizeText(project.id) || _0x76b3c6);
  const _0xdfb218 = await _0xab9278.createMutationSnapshot?.({
    canvasId: _0x76b3c6
  });
  try {
    await materializePersonReplacementLocationGuides({
      plan: _0x4fb7e9,
      project: _0x133390,
      adapter: _0xab9278,
      canReuseCanvas: _0x9d81f4,
      previousNodes: _0x566c92,
      canvasId: _0x76b3c6,
      saveOutputBlob: saveOutputBlob
    });
    if (_0x9d81f4) {
      const _0x32b3f5 = [];
      for (const [_0x472a05, _0x5b7b0a] of Object.entries(_0x566c92)) {
        if (_0x472a05 in _0x43d527) {
          continue;
        }
        const _0xdfe347 = normalizeText(_0x5b7b0a);
        if (_0xdfe347 && (await _0xab9278.nodeExists(_0xdfe347, _0x76b3c6))) {
          _0x32b3f5.push(_0xdfe347);
        }
      }
      if (_0x32b3f5.length) {
        if (typeof _0xab9278.deleteNodes !== "function") {
          throw new Error("人物替换画布适配器缺少托管节点清理能力");
        }
        const _0x56d082 = await _0xab9278.deleteNodes([...new Set(_0x32b3f5)], {
          canvasId: _0x76b3c6
        });
        if (_0x56d082 === false) {
          throw new Error("清理已失效的人物替换画布节点失败");
        }
        _0x315c3f = new Set(_0x32b3f5).size;
      }
    }
    for (const _0x44eb1e of _0x4fb7e9) {
      const _0x30e03a = normalizeText(_0x566c92[_0x44eb1e.key]);
      const _0x368327 = Boolean(_0x9d81f4 && _0x30e03a && (await _0xab9278.nodeExists(_0x30e03a, _0x76b3c6)));
      const _0x35599c = _0x368327 ? await _0xab9278.updateNode(_0x30e03a, _0x44eb1e.data, {
        canvasId: _0x76b3c6,
        key: _0x44eb1e.key,
        type: _0x44eb1e.type,
        width: _0x44eb1e.width,
        height: _0x44eb1e.height,
        ...(_0xdfbe49 ? {
          position: _0x44eb1e.position
        } : {})
      }) : await _0xab9278.createNode(_0x44eb1e.data, {
        canvasId: _0x76b3c6,
        key: _0x44eb1e.key,
        type: _0x44eb1e.type,
        width: _0x44eb1e.width,
        height: _0x44eb1e.height,
        position: _0x44eb1e.position,
        sequenceKey: _0x57dd65,
        parentNodeId: normalizeText(_0x41b20d[_0x44eb1e.parentKey])
      });
      if (_0x368327) {
        _0x552681 += 1;
      } else {
        _0x14bf70 += 1;
      }
      const _0x345249 = normalizeText(_0x35599c?.id || (_0x368327 ? _0x30e03a : ""));
      if (!_0x345249) {
        throw new Error("同步人物替换画布节点失败：" + (_0x44eb1e.data.name || _0x44eb1e.key));
      }
      _0x41b20d[_0x44eb1e.key] = _0x345249;
      _0x187af7.push({
        ..._0x44eb1e,
        nodeId: _0x345249,
        node: _0x35599c
      });
    }
    for (const _0x121612 of _0x4fb7e9) {
      if (!_0x121612.parentKey) {
        continue;
      }
      const _0x4ed50b = normalizeText(_0x41b20d[_0x121612.key]);
      const _0x4a555b = normalizeText(_0x41b20d[_0x121612.parentKey]);
      if (!_0x4ed50b || !_0x4a555b) {
        throw new Error("人物替换画布分组缺少节点：" + _0x121612.key);
      }
      const _0x3807e2 = await _0xab9278.setNodeParent(_0x4ed50b, _0x4a555b, {
        canvasId: _0x76b3c6
      });
      if (_0x3807e2 === false) {
        throw new Error("人物替换画布节点分组失败：" + _0x121612.key);
      }
    }
    for (const _0x4d3065 of _0x4fb7e9) {
      const _0x458f9c = normalizeText(_0x41b20d[_0x4d3065.key]);
      for (const _0x2b2930 of normalizeList(_0x4d3065.inputKeys)) {
        const _0x51e570 = normalizeText(_0x41b20d[_0x2b2930]);
        if (!_0x51e570 || !_0x458f9c) {
          throw new Error("人物替换画布连线缺少节点：" + _0x2b2930 + " → " + _0x4d3065.key);
        }
        const _0x2fe648 = await _0xab9278.connectNodes(_0x51e570, _0x458f9c, {
          canvasId: _0x76b3c6,
          sourceKey: _0x2b2930,
          targetKey: _0x4d3065.key
        });
        if (_0x2fe648 === false) {
          throw new Error("人物替换画布节点连线失败：" + _0x2b2930 + " → " + _0x4d3065.key);
        }
      }
    }
    await _0xab9278.renameCanvas?.(_0x76b3c6, _0x10b25f);
    _0xab9278.commit?.();
    if (typeof _0xab9278.focusNodes === "function") {
      await _0xab9278.focusNodes(_0x187af7.map(_0x3540cf => _0x3540cf.nodeId), {
        padding: 80,
        durationMs: 0,
        maxZoom: 0.2
      });
    }
  } catch (_0x173634) {
    await rollbackCanvasMutation({
      adapter: _0xab9278,
      canvasId: _0x76b3c6,
      reused: _0x9d81f4,
      mutationSnapshot: _0xdfb218
    });
    throw _0x173634;
  }
  const _0x2e78c0 = {
    canvasId: _0x76b3c6,
    scope: _0xb5d624,
    workspaceStep: _0x4a71db,
    layoutVersion: PERSON_REPLACEMENT_CANVAS_LAYOUT_VERSION,
    nodes: _0x41b20d,
    layout: _0x43d527
  };
  return {
    canvasId: _0x76b3c6,
    canvasName: _0x10b25f,
    scope: _0xb5d624,
    nodes: _0x187af7,
    reused: _0x9d81f4,
    reflowed: _0xdfbe49,
    createdCount: _0x14bf70,
    updatedCount: _0x552681,
    deletedCount: _0x315c3f,
    binding: _0x2e78c0,
    canvasBinding: _0x2e78c0
  };
}