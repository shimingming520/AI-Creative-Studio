import { translateMinimaxH3EditorAssetMentions } from "../minimaxH3Prompt.js";
const HAILUO_H3_DEFAULT_RATIO = "自适应";
const HAILUO_H3_DEFAULT_QUALITY = "economy";
function getPlainObject(_0x595f70) {
  if (_0x595f70 && typeof _0x595f70 === "object" && !Array.isArray(_0x595f70)) {
    return _0x595f70;
  } else {
    return {};
  }
}
function getPayloadParam(_0x4fe76a, _0x2b4e14, _0x506889) {
  const _0x7eb6a9 = getPlainObject(_0x4fe76a?.generationParams);
  if (Object.prototype.hasOwnProperty.call(_0x7eb6a9, _0x2b4e14)) {
    return _0x7eb6a9[_0x2b4e14];
  }
  if (Object.prototype.hasOwnProperty.call(_0x4fe76a || {}, _0x2b4e14)) {
    return _0x4fe76a[_0x2b4e14];
  }
  return _0x506889;
}
function normalizeMediaUrls(_0x5e815d) {
  const _0x36ddf2 = [];
  (Array.isArray(_0x5e815d) ? _0x5e815d : []).forEach(_0x5ee3f1 => {
    const _0x35a78b = String(_0x5ee3f1 || "").trim();
    if (_0x35a78b && !_0x36ddf2.includes(_0x35a78b)) {
      _0x36ddf2.push(_0x35a78b);
    }
  });
  return _0x36ddf2;
}
function isAdaptiveRatio(_0x152fa4) {
  const _0x29a831 = String(_0x152fa4 || "").trim();
  const _0x2b843f = _0x29a831.toLowerCase();
  return _0x29a831 === "自适应" || _0x2b843f === "auto" || _0x2b843f === "adaptive" || _0x2b843f === "default";
}
function parseAspectRatio(_0x5d50b4, _0x41a892 = HAILUO_H3_DEFAULT_RATIO) {
  const _0x164f4b = String(_0x5d50b4 || _0x41a892).trim();
  const [_0x79d228, _0x3e91b2] = _0x164f4b.split(":");
  const _0x49fcd6 = Number(_0x79d228);
  const _0x4815ad = Number(_0x3e91b2);
  if (_0x49fcd6 > 0 && _0x4815ad > 0) {
    return {
      widthRatio: _0x49fcd6,
      heightRatio: _0x4815ad
    };
  }
  if (_0x164f4b !== _0x41a892) {
    return parseAspectRatio(_0x41a892, HAILUO_H3_DEFAULT_RATIO);
  }
  return {
    widthRatio: 16,
    heightRatio: 9
  };
}
function roundToMultiple(_0x45184a, _0x4fea94) {
  const _0x206581 = Number(_0x4fea94);
  const _0x300eb8 = Number.isFinite(_0x206581) && _0x206581 > 0 ? _0x206581 : 32;
  return Math.max(_0x300eb8, Math.round(Number(_0x45184a || 0) / _0x300eb8) * _0x300eb8);
}
function resolveAspectRatio(_0x2d0c24, _0x275495) {
  const _0x3734ed = getPayloadParam(_0x2d0c24, "aspectRatio", _0x275495.defaultAspectRatio || HAILUO_H3_DEFAULT_RATIO);
  if (!isAdaptiveRatio(_0x3734ed)) {
    return _0x3734ed;
  }
  return _0x2d0c24?.resolvedRatioLabel || _0x2d0c24?.generationParams?.resolvedRatioLabel || _0x275495.defaultAspectRatio || HAILUO_H3_DEFAULT_RATIO;
}
export function resolveRunningHubHailuoH3OmniDimensions(_0x4eea8a = {}, _0x59c964 = {}) {
  const _0xdfa6c7 = String(getPayloadParam(_0x4eea8a, "rhHailuoH3Quality", _0x59c964.defaultQuality || HAILUO_H3_DEFAULT_QUALITY)).trim();
  const _0x4c7e03 = getPlainObject(_0x59c964.qualityLongEdges);
  const _0x2a47e5 = Number(_0x4c7e03[_0x59c964.defaultQuality || HAILUO_H3_DEFAULT_QUALITY]) || 960;
  const _0x5bd5ea = Number(_0x4c7e03[_0xdfa6c7]) || _0x2a47e5;
  const {
    widthRatio: _0x1371c5,
    heightRatio: _0x5d08c2
  } = parseAspectRatio(resolveAspectRatio(_0x4eea8a, _0x59c964), _0x59c964.defaultAspectRatio || HAILUO_H3_DEFAULT_RATIO);
  const _0x35c841 = Number(_0x59c964.dimensionMultiple) || 32;
  if (_0x1371c5 === _0x5d08c2) {
    return {
      width: _0x5bd5ea,
      height: _0x5bd5ea
    };
  }
  if (_0x1371c5 > _0x5d08c2) {
    return {
      width: _0x5bd5ea,
      height: roundToMultiple(_0x5bd5ea * _0x5d08c2 / _0x1371c5, _0x35c841)
    };
  }
  return {
    width: roundToMultiple(_0x5bd5ea * _0x1371c5 / _0x5d08c2, _0x35c841),
    height: _0x5bd5ea
  };
}
function resolveSeconds(_0x54c1eb, _0x4388a3) {
  const _0x430dc4 = Number(getPayloadParam(_0x54c1eb, "duration", _0x4388a3.secondsNode?.defaultValue ?? 5));
  const _0x1849bd = Number(_0x4388a3.secondsNode?.defaultValue) || 5;
  const _0x2b931d = Number(_0x4388a3.secondsNode?.min) || 3;
  const _0x3615e8 = Number(_0x4388a3.secondsNode?.max) || 15;
  const _0x4c278e = Number.isFinite(_0x430dc4) ? _0x430dc4 : _0x1849bd;
  return Math.round(Math.max(_0x2b931d, Math.min(_0x3615e8, _0x4c278e)));
}
function getFrameSources(_0x260677 = {}) {
  const _0x4b8c6a = getPlainObject(_0x260677.inputUrlsBySlot);
  const _0x477cbc = normalizeMediaUrls(_0x260677.inputImages);
  const _0x5dc8d6 = String(_0x4b8c6a.firstFrame || _0x260677.firstFrameUrl || "").trim();
  const _0x176245 = String(_0x4b8c6a.lastFrame || _0x260677.lastFrameUrl || _0x260677.lastFrame || "").trim();
  const _0xee1c50 = Boolean(_0x5dc8d6 || _0x176245);
  return {
    firstFrame: _0x5dc8d6 || (!_0xee1c50 ? _0x477cbc[0] || "" : ""),
    lastFrame: _0x176245 || (!_0xee1c50 ? _0x477cbc[1] || "" : "")
  };
}
function assertReferenceInputCounts({
  images: _0xea0960,
  videos: _0x1ce838,
  audios: _0x4597b8
}) {
  if (_0xea0960.length > 9) {
    throw new Error("海螺H3 全能参考模式最多支持 9 张图片");
  }
  if (_0x1ce838.length > 3) {
    throw new Error("海螺H3 全能参考模式最多支持 3 个视频");
  }
  if (_0x4597b8.length > 3) {
    throw new Error("海螺H3 全能参考模式最多支持 3 个音频");
  }
  if (_0xea0960.length + _0x1ce838.length + _0x4597b8.length === 0) {
    throw new Error("海螺H3 全能参考模式至少需要一张图片、一个视频或一段音频");
  }
}
function assertLoaderCapacity(_0x5a0fa9, _0x2099ab, _0x58a246) {
  const _0x372d70 = Array.isArray(_0x5a0fa9) ? _0x5a0fa9.filter(_0x40762f => _0x40762f?.nodeId && _0x40762f?.fieldName).length : 0;
  if (_0x372d70 < _0x2099ab) {
    throw new Error("海螺H3 工作流" + _0x58a246 + "加载节点映射不完整");
  }
}
function resolveReferenceModeValue(_0x2b3370, _0x2642f5) {
  const _0x2f58a6 = getPlainObject(_0x2642f5.modeNode);
  const _0x195692 = String(_0x2f58a6.referenceModelField || "").trim();
  const _0x2bf05f = String(_0x2f58a6.referenceModelDefaultValue || "ref2").trim();
  const _0x4dadff = _0x195692 ? String(getPayloadParam(_0x2b3370, _0x195692, _0x2bf05f)).trim() : _0x2bf05f;
  const _0x383f5f = getPlainObject(_0x2f58a6.referenceValueMap);
  return _0x383f5f[_0x4dadff] ?? _0x2f58a6.referenceValue ?? "2";
}
function appendNullReferenceBindings(_0x15b33f, _0x4ed772, _0x1bf364, _0x3c642d, _0x36cc46, _0x2b1bbb) {
  for (let _0x5530b5 = _0x36cc46; _0x5530b5 < _0x2b1bbb; _0x5530b5 += 1) {
    _0x15b33f(_0x4ed772, {
      nodeId: _0x1bf364?.nodeId,
      fieldName: "" + (_0x3c642d || "") + _0x5530b5
    }, null);
  }
}
async function appendFrameInputs({
  mapping: _0x582f20,
  payload: _0xe458c5,
  apiKey: _0x305e1f,
  ctx: _0xaf1cb7,
  helpers: _0xc474e1,
  nodeInfoList: _0x25a18e
}) {
  const {
    firstFrame: _0x695896,
    lastFrame: _0x4232ec
  } = getFrameSources(_0xe458c5);
  const _0x44daef = [{
    slot: "firstFrame",
    url: _0x695896,
    loaderNode: _0x582f20.imageLoaderNodes?.[0]
  }, {
    slot: "lastFrame",
    url: _0x4232ec,
    loaderNode: _0x582f20.imageLoaderNodes?.[1]
  }].filter(_0x2294eb => _0x2294eb.url);
  _0x44daef.forEach(_0x3f0426 => {
    if (!_0x3f0426.loaderNode?.nodeId || !_0x3f0426.loaderNode?.fieldName) {
      throw new Error("海螺H3 工作流图片加载节点映射不完整");
    }
  });
  const _0x10dcde = await _0xc474e1.uploadRunningHubMediaInputs("image", _0x44daef.map(_0x87e321 => _0x87e321.url), _0xe458c5, _0x305e1f, _0xaf1cb7, {
    uploadFailedMessage: "首尾帧图片上传失败"
  });
  _0x44daef.forEach((_0x85dbb2, _0xe54ea5) => {
    _0xc474e1.pushManifestNode(_0x25a18e, _0x85dbb2.loaderNode, _0x10dcde[_0xe54ea5]);
  });
  if (_0x695896 && !_0x4232ec) {
    _0xc474e1.pushManifestNode(_0x25a18e, {
      nodeId: _0x582f20.firstLastFrameNode?.nodeId,
      fieldName: _0x582f20.firstLastFrameNode?.lastFieldName
    }, null);
  } else if (!_0x695896 && _0x4232ec) {
    _0xc474e1.pushManifestNode(_0x25a18e, {
      nodeId: _0x582f20.firstLastFrameNode?.nodeId,
      fieldName: _0x582f20.firstLastFrameNode?.firstFieldName
    }, null);
  }
  if (_0x44daef.length > 0) {
    return _0x582f20.modeNode?.frameValue ?? "1";
  } else {
    return _0x582f20.modeNode?.textValue ?? "0";
  }
}
async function appendReferenceInputs({
  mapping: _0x32c221,
  payload: _0x561c0b,
  apiKey: _0x150218,
  ctx: _0x17556a,
  helpers: _0x24166f,
  nodeInfoList: _0x120755
}) {
  const _0x1f4f59 = normalizeMediaUrls(_0x561c0b.inputImages);
  const _0x3e849f = normalizeMediaUrls(_0x561c0b.inputVideos);
  const _0x13f373 = normalizeMediaUrls(_0x561c0b.inputAudios);
  assertReferenceInputCounts({
    images: _0x1f4f59,
    videos: _0x3e849f,
    audios: _0x13f373
  });
  assertLoaderCapacity(_0x32c221.imageLoaderNodes, _0x1f4f59.length, "图片");
  assertLoaderCapacity(_0x32c221.videoLoaderNodes, _0x3e849f.length, "视频");
  assertLoaderCapacity(_0x32c221.audioLoaderNodes, _0x13f373.length, "音频");
  const [_0x2469ab, _0x26dab8, _0x17f2ae] = await Promise.all([_0x24166f.uploadRunningHubMediaInputs("image", _0x1f4f59, _0x561c0b, _0x150218, _0x17556a, {
    uploadFailedMessage: "全能参考图片上传失败"
  }), _0x24166f.uploadRunningHubMediaInputs("video", _0x3e849f, _0x561c0b, _0x150218, _0x17556a, {
    uploadFailedMessage: "全能参考视频上传失败"
  }), _0x24166f.uploadRunningHubMediaInputs("audio", _0x13f373, _0x561c0b, _0x150218, _0x17556a, {
    uploadFailedMessage: "全能参考音频上传失败"
  })]);
  const _0x100ab7 = _0x32c221.referenceNode || {};
  _0x2469ab.forEach((_0x378357, _0x49e6c2) => {
    const _0x5ea9b1 = _0x32c221.imageLoaderNodes?.[_0x49e6c2];
    _0x24166f.pushManifestNode(_0x120755, _0x5ea9b1, _0x378357);
  });
  _0x26dab8.forEach((_0x1ca63f, _0x5c0d06) => {
    const _0x436827 = _0x32c221.videoLoaderNodes?.[_0x5c0d06];
    _0x24166f.pushManifestNode(_0x120755, _0x436827, _0x1ca63f);
  });
  _0x17f2ae.forEach((_0x9af2e0, _0x289888) => {
    const _0x4c0497 = _0x32c221.audioLoaderNodes?.[_0x289888];
    _0x24166f.pushManifestNode(_0x120755, _0x4c0497, _0x9af2e0);
  });
  appendNullReferenceBindings(_0x24166f.pushManifestNode, _0x120755, _0x100ab7, _0x100ab7.imageFieldPrefix, _0x2469ab.length, _0x32c221.imageLoaderNodes?.length || 0);
  appendNullReferenceBindings(_0x24166f.pushManifestNode, _0x120755, _0x100ab7, _0x100ab7.videoFieldPrefix, _0x26dab8.length, _0x32c221.videoLoaderNodes?.length || 0);
  appendNullReferenceBindings(_0x24166f.pushManifestNode, _0x120755, _0x100ab7, _0x100ab7.videoAudioFieldPrefix, _0x26dab8.length, _0x32c221.videoLoaderNodes?.length || 0);
  appendNullReferenceBindings(_0x24166f.pushManifestNode, _0x120755, _0x100ab7, _0x100ab7.audioFieldPrefix, _0x17f2ae.length, _0x32c221.audioLoaderNodes?.length || 0);
  return resolveReferenceModeValue(_0x561c0b, _0x32c221);
}
export async function resolveRunningHubHailuoH3OmniPayload({
  executionManifest: _0x6fced8,
  payload: _0x1e0d0b,
  finalPrompt: _0x547fc2,
  apiKey: _0x19663f,
  ctx: _0x37748f,
  helpers: _0x4c8db8
}) {
  const _0x2e4d72 = _0x6fced8.mapping || {};
  const _0x5b1ef0 = [];
  const _0xc2c7e5 = String(getPayloadParam(_0x1e0d0b, "rh_hailuo_h3_mode", "frames")).trim();
  const _0x5618e1 = _0xc2c7e5 === "reference" ? await appendReferenceInputs({
    mapping: _0x2e4d72,
    payload: _0x1e0d0b,
    apiKey: _0x19663f,
    ctx: _0x37748f,
    helpers: _0x4c8db8,
    nodeInfoList: _0x5b1ef0
  }) : await appendFrameInputs({
    mapping: _0x2e4d72,
    payload: _0x1e0d0b,
    apiKey: _0x19663f,
    ctx: _0x37748f,
    helpers: _0x4c8db8,
    nodeInfoList: _0x5b1ef0
  });
  const _0x5d0f8a = resolveRunningHubHailuoH3OmniDimensions(_0x1e0d0b, _0x2e4d72);
  _0x4c8db8.pushManifestNode(_0x5b1ef0, _0x2e4d72.promptNode, translateMinimaxH3EditorAssetMentions(_0x547fc2));
  _0x4c8db8.pushManifestNode(_0x5b1ef0, _0x2e4d72.modeNode, _0x5618e1);
  const _0x318953 = getPlainObject(_0x1e0d0b?.generationParams);
  _0x4c8db8.pushManifestNode(_0x5b1ef0, _0x2e4d72.accelerationNode, _0x4c8db8.getMappedValue(_0x318953[_0x2e4d72.accelerationNode?.field], _0x2e4d72.accelerationNode));
  _0x4c8db8.pushManifestNode(_0x5b1ef0, _0x2e4d72.secondsNode, resolveSeconds(_0x1e0d0b, _0x2e4d72));
  _0x4c8db8.pushManifestNode(_0x5b1ef0, _0x2e4d72.widthNode, _0x5d0f8a.width);
  _0x4c8db8.pushManifestNode(_0x5b1ef0, _0x2e4d72.heightNode, _0x5d0f8a.height);
  return _0x4c8db8.buildTaskCreateVideoWorkflowRequest({
    executionManifest: _0x6fced8,
    payload: _0x1e0d0b,
    apiKey: _0x19663f,
    nodeInfoList: _0x5b1ef0
  });
}