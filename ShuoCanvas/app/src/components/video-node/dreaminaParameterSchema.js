import { DREAMINA_VIDEO_ALLOWED_RATIOS, ensureDreaminaStyleVideoModelForTask, getDreaminaStyleVideoInputLimits, isDreaminaVideoRouteModeEnabled, normalizeDreaminaStyleVideoDuration, normalizeDreaminaStyleVideoResolution, normalizeDreaminaVideoAspectRatio, normalizeDreaminaVideoRouteMode, resolveDreaminaStyleVideoCounterpartModel, resolveDreaminaStyleVideoProvider, resolveDreaminaVideoTaskType, isDreaminaStyleVideoTaskModelSupported } from "../../modules/dreaminaVideoModelHelper.js";
import { buildGenerationModelSelectionDisplayPatch } from "../shared/generationDisplayPolicy.js";
import { getPlainGenerationParams } from "./runningHubVideoUiSchema.js";
export const DREAMINA_VIDEO_PARAM_FIELD_IDS = new Set(["dreaminaRouteMode", "aspectRatio", "resolution", "duration"]);
const DREAMINA_ROUTE_MODEL_MEMORY_FIELD = "dreaminaModelByRouteMode";
function hasOwnParam(_0x328024, _0x536e3d) {
  return Object.prototype.hasOwnProperty.call(_0x328024 || {}, _0x536e3d);
}
export function getDreaminaEffectiveNodeData(_0x3e4f28 = {}) {
  const _0x2f317e = _0x3e4f28 && typeof _0x3e4f28 === "object" ? _0x3e4f28 : {};
  const _0x99b925 = getPlainGenerationParams(_0x2f317e.generationParams);
  const _0x4c6c97 = {
    ..._0x2f317e
  };
  DREAMINA_VIDEO_PARAM_FIELD_IDS.forEach(_0x3a8e63 => {
    if (hasOwnParam(_0x99b925, _0x3a8e63)) {
      _0x4c6c97[_0x3a8e63] = _0x99b925[_0x3a8e63];
    }
  });
  const _0x446371 = normalizeDreaminaVideoRouteMode(_0x4c6c97.dreaminaRouteMode, _0x4c6c97.mode);
  if (_0x446371) {
    _0x4c6c97.dreaminaRouteMode = _0x446371;
  }
  if (hasOwnParam(_0x99b925, "resolution")) {
    _0x4c6c97.videoSize = _0x99b925.resolution;
  }
  const _0x1bff15 = {
    ..._0x99b925
  };
  if (!hasOwnParam(_0x1bff15, "dreaminaRouteMode") && _0x446371) {
    _0x1bff15.dreaminaRouteMode = _0x446371;
  }
  if (!hasOwnParam(_0x1bff15, "aspectRatio")) {
    _0x1bff15.aspectRatio = _0x4c6c97.aspectRatio || "自适应";
  }
  if (!hasOwnParam(_0x1bff15, "resolution")) {
    const _0x1eb3b1 = _0x4c6c97.resolution || _0x4c6c97.videoSize;
    if (_0x1eb3b1) {
      _0x1bff15.resolution = _0x1eb3b1;
    }
  }
  if (!hasOwnParam(_0x1bff15, "duration") && _0x4c6c97.duration !== undefined) {
    _0x1bff15.duration = _0x4c6c97.duration;
  }
  _0x4c6c97.generationParams = _0x1bff15;
  return _0x4c6c97;
}
export function buildDreaminaParamPatch(_0x1b1754 = {}, _0x23e1e5 = {}) {
  const _0x2e055d = getPlainGenerationParams(_0x1b1754?.generationParams);
  Object.entries(_0x23e1e5 || {}).forEach(([_0x1feb6a, _0x4e5455]) => {
    if (!DREAMINA_VIDEO_PARAM_FIELD_IDS.has(_0x1feb6a)) {
      return;
    }
    _0x2e055d[_0x1feb6a] = _0x4e5455;
  });
  const _0x45c1ec = {
    generationParams: _0x2e055d
  };
  const _0x3cfd35 = String(_0x1b1754?.model || "").trim();
  if (_0x3cfd35) {
    _0x45c1ec.generationParamsByModel = {
      ...getPlainGenerationParams(_0x1b1754?.generationParamsByModel),
      [_0x3cfd35]: _0x2e055d
    };
  }
  return _0x45c1ec;
}
function buildDreaminaModelParamSnapshot(_0x2b9edf = {}) {
  const _0x37ae47 = getDreaminaEffectiveNodeData(_0x2b9edf);
  const _0x31f74b = getPlainGenerationParams(_0x37ae47?.generationParams);
  const _0x5c706a = {
    ..._0x31f74b
  };
  DREAMINA_VIDEO_PARAM_FIELD_IDS.forEach(_0x5c7174 => {
    if (_0x5c706a[_0x5c7174] !== undefined) {
      return;
    }
    if (_0x37ae47?.[_0x5c7174] !== undefined) {
      _0x5c706a[_0x5c7174] = _0x37ae47[_0x5c7174];
    }
  });
  if (_0x5c706a.resolution === undefined && _0x37ae47?.videoSize !== undefined) {
    _0x5c706a.resolution = _0x37ae47.videoSize;
  }
  if (_0x5c706a[DREAMINA_ROUTE_MODEL_MEMORY_FIELD] === undefined && _0x37ae47?.[DREAMINA_ROUTE_MODEL_MEMORY_FIELD] !== undefined) {
    _0x5c706a[DREAMINA_ROUTE_MODEL_MEMORY_FIELD] = getPlainGenerationParams(_0x37ae47[DREAMINA_ROUTE_MODEL_MEMORY_FIELD]);
  }
  if (_0x5c706a.dreaminaRouteMode !== undefined) {
    _0x5c706a.dreaminaRouteMode = normalizeDreaminaVideoRouteMode(_0x5c706a.dreaminaRouteMode, _0x37ae47?.mode);
  }
  return _0x5c706a;
}
function getDreaminaRouteModelMemory(_0x22ef78 = {}) {
  const _0x28f407 = getPlainGenerationParams(_0x22ef78?.generationParams);
  const _0x2e59d5 = getPlainGenerationParams(_0x22ef78?.generationParamsByModel);
  const _0x1cd8fa = {};
  Object.values(_0x2e59d5).forEach(_0x11ed74 => {
    Object.assign(_0x1cd8fa, getPlainGenerationParams(_0x11ed74?.[DREAMINA_ROUTE_MODEL_MEMORY_FIELD]));
  });
  return {
    ..._0x1cd8fa,
    ...getPlainGenerationParams(_0x28f407[DREAMINA_ROUTE_MODEL_MEMORY_FIELD]),
    ...getPlainGenerationParams(_0x22ef78?.[DREAMINA_ROUTE_MODEL_MEMORY_FIELD])
  };
}
function getDreaminaRouteModelMemoryKey(_0x160fdc, _0x100207) {
  const _0x26afa1 = String(_0x160fdc || "dreamina").trim().toLowerCase();
  const _0x5ad6b3 = normalizeDreaminaVideoRouteMode(_0x100207);
  return _0x26afa1 + ":" + _0x5ad6b3;
}
function rememberDreaminaRouteModel(_0x9209f2, _0x44572f, _0x399932, _0x1fef18) {
  const _0x57b2e0 = _0x9209f2 && typeof _0x9209f2 === "object" ? _0x9209f2 : {};
  const _0xa72281 = String(_0x1fef18 || "").trim();
  if (!_0xa72281) {
    return _0x57b2e0;
  }
  _0x57b2e0[getDreaminaRouteModelMemoryKey(_0x44572f, _0x399932)] = _0xa72281;
  return _0x57b2e0;
}
function getRememberedDreaminaRouteModel(_0xd41725, _0x2005cb, _0x7bfb9d) {
  const _0x558e5c = _0xd41725?.[getDreaminaRouteModelMemoryKey(_0x2005cb, _0x7bfb9d)];
  return String(_0x558e5c || "").trim();
}
function ensureSupportedRouteModel(_0x5cf271, _0x24bb1e, _0x502c80) {
  const _0xd4be00 = String(_0x24bb1e || "").trim();
  if (!_0xd4be00) {
    return "";
  }
  if (!isDreaminaStyleVideoTaskModelSupported(_0x5cf271, _0xd4be00, _0x502c80)) {
    return "";
  }
  return ensureDreaminaStyleVideoModelForTask(_0x5cf271, _0xd4be00, _0x502c80);
}
function getSavedDreaminaProviderRouteModel(_0x37d167 = {}, {
  provider: _0x5708a1,
  routeMode: _0x105daf,
  taskType: _0x3006a4,
  fallbackModel: _0x58159c
} = {}) {
  const _0x13f7e0 = getPlainGenerationParams(_0x37d167?.generationParamsByModel);
  const _0x2a7ba5 = [];
  Object.entries(_0x13f7e0).forEach(([_0x5765f1, _0x59b69d]) => {
    const _0x141020 = String(_0x5765f1 || "").trim();
    if (!_0x141020) {
      return;
    }
    const _0x367999 = resolveDreaminaStyleVideoProvider(_0x141020, _0x5708a1);
    if (_0x367999 !== _0x5708a1) {
      return;
    }
    const _0x203ea3 = ensureSupportedRouteModel(_0x3006a4, _0x141020, _0x5708a1);
    if (!_0x203ea3) {
      return;
    }
    const _0x7442de = normalizeDreaminaVideoRouteMode(_0x59b69d?.dreaminaRouteMode, _0x37d167?.mode);
    if (_0x7442de !== _0x105daf) {
      return;
    }
    _0x2a7ba5.push(_0x203ea3);
  });
  if (!_0x2a7ba5.length) {
    return "";
  }
  const _0x102f09 = ensureSupportedRouteModel(_0x3006a4, _0x58159c, _0x5708a1);
  const _0x4422ba = _0x2a7ba5.slice().reverse().find(_0x42c155 => _0x42c155 !== _0x102f09);
  return _0x4422ba || _0x2a7ba5[_0x2a7ba5.length - 1] || "";
}
export function resolveDreaminaRememberedRouteModel(_0x168f42 = {}, {
  provider: _0x4b491a,
  routeMode: _0x375f3e,
  taskType: _0x4084dd,
  fallbackModel: _0x797a12
} = {}) {
  const _0x41aa39 = getDreaminaEffectiveNodeData(_0x168f42);
  const _0x10049c = resolveDreaminaStyleVideoProvider(_0x797a12, _0x4b491a || _0x41aa39?.provider);
  const _0x22b99b = normalizeDreaminaVideoRouteMode(_0x375f3e || _0x41aa39?.dreaminaRouteMode, _0x41aa39?.mode);
  const _0x53f6b7 = String(_0x4084dd || "").trim() || resolveDreaminaVideoTaskType({
    routeMode: _0x22b99b
  });
  const _0x22be33 = getRememberedDreaminaRouteModel(getDreaminaRouteModelMemory(_0x41aa39), _0x10049c, _0x22b99b);
  const _0x4bdfbb = ensureSupportedRouteModel(_0x53f6b7, _0x22be33, _0x10049c);
  if (_0x4bdfbb) {
    return _0x4bdfbb;
  }
  const _0x43f9f0 = String(_0x41aa39?.model || "").trim();
  const _0x309eb0 = resolveDreaminaStyleVideoProvider(_0x43f9f0, _0x41aa39?.provider);
  const _0x21d1ed = _0x309eb0 === _0x10049c ? ensureSupportedRouteModel(_0x53f6b7, _0x43f9f0, _0x10049c) : "";
  if (_0x21d1ed) {
    return _0x21d1ed;
  }
  const _0x13f52d = getSavedDreaminaProviderRouteModel(_0x41aa39, {
    provider: _0x10049c,
    routeMode: _0x22b99b,
    taskType: _0x53f6b7,
    fallbackModel: _0x797a12
  });
  if (_0x13f52d) {
    return _0x13f52d;
  }
  const _0x29891d = resolveDreaminaStyleVideoCounterpartModel(_0x43f9f0, _0x10049c, {
    taskType: _0x53f6b7
  });
  const _0x228f24 = ensureSupportedRouteModel(_0x53f6b7, _0x29891d, _0x10049c);
  if (_0x228f24) {
    return _0x228f24;
  }
  return ensureDreaminaStyleVideoModelForTask(_0x53f6b7, _0x797a12, _0x10049c);
}
export function buildDreaminaModelSelectionParamPatch(_0x14f1ae = {}, {
  model: _0x28f2d7,
  provider: _0xf2b91a,
  taskType: _0x12aeca,
  fallbackValues = {},
  restoreTargetParams = true,
  rememberCurrentModel = true
} = {}) {
  const _0x228660 = getDreaminaEffectiveNodeData(_0x14f1ae);
  const _0x7ed7d7 = String(_0x28f2d7 || "").trim();
  if (!_0x7ed7d7) {
    return {};
  }
  const _0x536eb6 = resolveDreaminaStyleVideoProvider(_0x7ed7d7, _0xf2b91a || _0x228660?.provider);
  const _0x8bcbd5 = getPlainGenerationParams(_0x228660?.generationParamsByModel);
  const _0x3ffd70 = String(_0x228660?.model || "").trim();
  const _0x42b2e4 = resolveDreaminaStyleVideoProvider(_0x3ffd70, _0x228660?.provider);
  const _0x1da788 = normalizeDreaminaVideoRouteMode(_0x228660?.dreaminaRouteMode, _0x228660?.mode);
  const _0xcb4e02 = getDreaminaRouteModelMemory(_0x228660);
  const _0x4cdda5 = getPlainGenerationParams(_0x8bcbd5[_0x7ed7d7]);
  Object.assign(_0xcb4e02, getPlainGenerationParams(_0x4cdda5[DREAMINA_ROUTE_MODEL_MEMORY_FIELD]));
  if (_0x3ffd70 && rememberCurrentModel) {
    rememberDreaminaRouteModel(_0xcb4e02, _0x42b2e4, _0x1da788, _0x3ffd70);
    _0x8bcbd5[_0x3ffd70] = {
      ...buildDreaminaModelParamSnapshot(_0x228660),
      [DREAMINA_ROUTE_MODEL_MEMORY_FIELD]: _0xcb4e02
    };
  }
  const _0x5c7dee = {
    ...buildDreaminaModelParamSnapshot(_0x228660),
    ...getPlainGenerationParams(fallbackValues)
  };
  const _0x5144c2 = restoreTargetParams ? _0x4cdda5 : {};
  const _0x4a9050 = normalizeDreaminaVideoRouteMode(_0x5c7dee.dreaminaRouteMode, _0x228660?.mode);
  const _0x1e15ab = String(_0x12aeca || "").trim();
  const _0x1d4fe0 = _0x1e15ab || resolveDreaminaVideoTaskType({
    routeMode: _0x4a9050
  });
  const _0xefed9 = {
    ..._0x5c7dee,
    ..._0x5144c2,
    dreaminaRouteMode: _0x4a9050
  };
  const _0x5ae61e = normalizeDreaminaVideoAspectRatio(_0xefed9.aspectRatio, {
    preserveAdaptive: true
  });
  const _0x5547ab = normalizeDreaminaStyleVideoResolution(_0x1d4fe0, _0x7ed7d7, _0xefed9.resolution, _0x536eb6);
  const _0x1fa1c5 = normalizeDreaminaStyleVideoDuration(_0x1d4fe0, _0x7ed7d7, _0xefed9.duration, _0x536eb6);
  const _0x1bf1e3 = {
    ..._0x5144c2,
    dreaminaRouteMode: _0x4a9050,
    aspectRatio: _0x5ae61e,
    duration: _0x1fa1c5,
    [DREAMINA_ROUTE_MODEL_MEMORY_FIELD]: _0xcb4e02
  };
  if (_0x5547ab) {
    _0x1bf1e3.resolution = _0x5547ab;
  }
  rememberDreaminaRouteModel(_0xcb4e02, _0x536eb6, _0x4a9050, _0x7ed7d7);
  _0x8bcbd5[_0x7ed7d7] = _0x1bf1e3;
  const _0x59ea5b = buildGenerationModelSelectionDisplayPatch({
    nodeData: _0x228660,
    fallbackNodeData: _0x228660,
    modelId: _0x7ed7d7,
    generationParams: _0x1bf1e3
  });
  return {
    ..._0x59ea5b,
    dreaminaRouteMode: _0x4a9050,
    [DREAMINA_ROUTE_MODEL_MEMORY_FIELD]: _0xcb4e02,
    generationParams: _0x1bf1e3,
    generationParamsByModel: _0x8bcbd5
  };
}
export function buildDreaminaStorePatchFromNormalization(_0x18c4ba = {}, _0x38a3eb = {}) {
  const _0x44d8c6 = getDreaminaEffectiveNodeData(_0x18c4ba);
  const _0x5d4d4b = {};
  const _0x34155a = {};
  Object.entries(_0x38a3eb || {}).forEach(([_0x58693c, _0x533426]) => {
    if (DREAMINA_VIDEO_PARAM_FIELD_IDS.has(_0x58693c)) {
      _0x34155a[_0x58693c] = _0x533426;
    } else {
      _0x5d4d4b[_0x58693c] = _0x533426;
    }
  });
  const _0x204b8a = Object.keys(_0x34155a).length ? buildDreaminaParamPatch({
    ..._0x44d8c6,
    ..._0x5d4d4b
  }, _0x34155a) : {};
  return {
    ..._0x5d4d4b,
    ..._0x204b8a
  };
}
export function buildDreaminaRouteModeUpdate({
  nextRouteMode: _0x3778dd,
  baseNodeData = {},
  incoming = [],
  nodes = {}
} = {}) {
  const _0x56e692 = normalizeDreaminaVideoRouteMode(_0x3778dd);
  const _0x15d381 = getDreaminaEffectiveNodeData(baseNodeData);
  if (!_0x56e692) {
    return {
      nodeData: _0x15d381,
      patch: {},
      edgeIdsToRemove: []
    };
  }
  if (!isDreaminaVideoRouteModeEnabled(_0x56e692)) {
    return {
      disabled: true,
      nodeData: _0x15d381,
      patch: {},
      edgeIdsToRemove: []
    };
  }
  const _0x2e5436 = _0x2f9380 => {
    const _0x381b52 = Number(_0x2f9380?.createdAt);
    if (Number.isFinite(_0x381b52) && _0x381b52 > 0) {
      return _0x381b52;
    }
    const _0x166d6a = String(_0x2f9380?.id || "");
    const _0x23e98f = _0x166d6a.match(/(\d{10,})/g);
    if (_0x23e98f && _0x23e98f.length) {
      return Number(_0x23e98f[_0x23e98f.length - 1]) || 0;
    } else {
      return 0;
    }
  };
  const _0x5a3e27 = [];
  const _0x4967a2 = [];
  const _0x46aeda = [];
  const _0xb9ad4d = [];
  for (const _0x41f7ef of incoming || []) {
    const _0x4bb663 = nodes?.[_0x41f7ef.sourceId];
    const _0x59b401 = String(_0x4bb663?.type || "").toLowerCase();
    if (_0x59b401.includes("image")) {
      _0x5a3e27.push(_0x41f7ef);
    } else if (_0x59b401.includes("video")) {
      _0x4967a2.push(_0x41f7ef);
    } else if (_0x59b401.includes("audio")) {
      _0x46aeda.push(_0x41f7ef);
    } else if (_0x56e692 === "frames2video") {
      _0xb9ad4d.push(_0x41f7ef.id);
    }
  }
  if (_0x56e692 === "frames2video") {
    _0x4967a2.forEach(_0x419000 => _0xb9ad4d.push(_0x419000.id));
    _0x46aeda.forEach(_0x13214b => _0xb9ad4d.push(_0x13214b.id));
    _0x5a3e27.sort((_0x19ca56, _0x89580a) => _0x2e5436(_0x19ca56) - _0x2e5436(_0x89580a));
    while (_0x5a3e27.length > 2) {
      const _0x593561 = _0x5a3e27.shift();
      if (_0x593561?.id) {
        _0xb9ad4d.push(_0x593561.id);
      }
    }
  } else if (_0x56e692 === "multimodal2video") {
    const _0x8c1bf5 = getDreaminaStyleVideoInputLimits(_0x15d381?.model, _0x15d381?.provider);
    _0x5a3e27.sort((_0x5ee7f8, _0x5517b5) => _0x2e5436(_0x5ee7f8) - _0x2e5436(_0x5517b5));
    _0x4967a2.sort((_0x15b413, _0x5b3507) => _0x2e5436(_0x15b413) - _0x2e5436(_0x5b3507));
    _0x46aeda.sort((_0x3a6029, _0x4f196c) => _0x2e5436(_0x3a6029) - _0x2e5436(_0x4f196c));
    while (_0x5a3e27.length > _0x8c1bf5.image) {
      const _0x20b4b1 = _0x5a3e27.shift();
      if (_0x20b4b1?.id) {
        _0xb9ad4d.push(_0x20b4b1.id);
      }
    }
    while (_0x4967a2.length > _0x8c1bf5.video) {
      const _0x1b55fc = _0x4967a2.shift();
      if (_0x1b55fc?.id) {
        _0xb9ad4d.push(_0x1b55fc.id);
      }
    }
    while (_0x46aeda.length > _0x8c1bf5.audio) {
      const _0x57a68b = _0x46aeda.shift();
      if (_0x57a68b?.id) {
        _0xb9ad4d.push(_0x57a68b.id);
      }
    }
  }
  const _0xed3565 = {
    imageCount: _0x5a3e27.length,
    videoCount: _0x4967a2.length,
    audioCount: _0x46aeda.length
  };
  const _0x2bc938 = resolveDreaminaVideoTaskType({
    routeMode: _0x56e692,
    imageCount: _0xed3565.imageCount,
    videoCount: _0xed3565.videoCount,
    audioCount: _0xed3565.audioCount
  });
  const _0x1e7384 = resolveDreaminaStyleVideoProvider(_0x15d381?.model, _0x15d381?.provider);
  const _0x53eec2 = {
    provider: _0x1e7384
  };
  const _0x512d20 = getPlainGenerationParams(_0x15d381?.generationParamsByModel);
  const _0x20c603 = getDreaminaRouteModelMemory(_0x15d381);
  const _0x356fa2 = normalizeDreaminaVideoRouteMode(_0x15d381?.dreaminaRouteMode, _0x15d381?.mode);
  const _0x5874a5 = String(_0x15d381?.model || "").trim();
  if (_0x5874a5) {
    rememberDreaminaRouteModel(_0x20c603, _0x1e7384, _0x356fa2, _0x5874a5);
    _0x512d20[_0x5874a5] = {
      ...buildDreaminaModelParamSnapshot(_0x15d381),
      [DREAMINA_ROUTE_MODEL_MEMORY_FIELD]: _0x20c603
    };
  }
  const _0x2f8b0c = getRememberedDreaminaRouteModel(_0x20c603, _0x1e7384, _0x56e692);
  const _0x363888 = _0x2f8b0c && isDreaminaStyleVideoTaskModelSupported(_0x2bc938, _0x2f8b0c, _0x1e7384) ? ensureDreaminaStyleVideoModelForTask(_0x2bc938, _0x2f8b0c, _0x1e7384) : "";
  const _0x4b2340 = _0x363888 || ensureDreaminaStyleVideoModelForTask(_0x2bc938, _0x15d381?.model, _0x1e7384);
  if (_0x4b2340) {
    _0x53eec2.model = _0x4b2340;
  }
  const _0xe29a9e = normalizeDreaminaStyleVideoResolution(_0x2bc938, _0x4b2340, _0x15d381?.resolution || _0x15d381?.videoSize, _0x1e7384);
  const _0x2450f7 = normalizeDreaminaStyleVideoDuration(_0x2bc938, _0x4b2340, _0x15d381?.duration, _0x1e7384);
  const _0x4d45fb = {
    dreaminaRouteMode: _0x56e692,
    duration: _0x2450f7
  };
  if (_0xe29a9e) {
    _0x4d45fb.resolution = _0xe29a9e;
  }
  const _0x48b261 = buildDreaminaModelSelectionParamPatch({
    ..._0x15d381,
    ..._0x53eec2,
    generationParamsByModel: _0x512d20,
    [DREAMINA_ROUTE_MODEL_MEMORY_FIELD]: _0x20c603
  }, {
    model: _0x4b2340,
    provider: _0x1e7384,
    taskType: _0x2bc938,
    fallbackValues: _0x4d45fb,
    rememberCurrentModel: false
  });
  const _0x52f1e3 = {
    ..._0x53eec2,
    ..._0x48b261
  };
  return {
    disabled: false,
    edgeIdsToRemove: _0xb9ad4d,
    nodeData: getDreaminaEffectiveNodeData({
      ..._0x15d381,
      ..._0x52f1e3
    }),
    patch: _0x52f1e3
  };
}
export function buildDreaminaParamSchemaFields({
  routeMode: _0x5af8e3,
  currentRatio: _0x38668f,
  currentResolution: _0x39d820,
  currentDuration: _0x1f9add,
  durationRange: _0x222021,
  resolutionOptions: _0x137b8b
} = {}) {
  const _0x11f12a = normalizeDreaminaVideoRouteMode(_0x5af8e3);
  const _0x2771bc = ["自适应", "1:1", "9:16", "16:9", "3:4", "4:3", "3:2", "2:3", "5:4", "4:5", "21:9"].map(_0x2220d1 => ({
    value: _0x2220d1,
    label: _0x2220d1,
    disabled: _0x2220d1 !== "自适应" && !DREAMINA_VIDEO_ALLOWED_RATIOS.includes(_0x2220d1)
  }));
  const _0x43fce2 = Array.isArray(_0x137b8b) ? _0x137b8b.filter(Boolean) : [];
  const _0x316880 = _0x43fce2.length ? _0x43fce2 : _0x39d820 ? [_0x39d820] : ["720p"];
  const _0x49fff2 = Array.isArray(_0x222021?.values) ? _0x222021.values.map(Number).filter(Number.isFinite) : [];
  const _0x37c0f5 = _0x222021?.optionLabels && typeof _0x222021.optionLabels === "object" && !Array.isArray(_0x222021.optionLabels) ? _0x222021.optionLabels : {};
  return {
    mode: {
      id: "dreaminaRouteMode",
      type: "segmented",
      label: "模式",
      defaultValue: _0x11f12a || "multimodal2video",
      variant: "pillMenu",
      options: [{
        value: "multimodal2video",
        label: "全能参考",
        selectedLabel: "全能参考"
      }, {
        value: "frames2video",
        label: "首尾帧",
        selectedLabel: "首尾帧"
      }]
    },
    resolution: {
      id: "resolution",
      type: "segmented",
      label: "分辨率",
      defaultValue: _0x39d820 || _0x316880[0] || "720p",
      options: _0x316880.map(_0x585430 => ({
        value: _0x585430,
        label: String(_0x585430).toLowerCase() === "4k" ? "4K" : _0x585430,
        disabled: _0x316880.length === 1
      }))
    },
    aspectRatio: {
      id: "aspectRatio",
      type: "segmented",
      label: "比例",
      defaultValue: _0x38668f || "自适应",
      options: _0x2771bc
    },
    duration: {
      id: "duration",
      type: "slider",
      label: "视频时长",
      defaultValue: Number(_0x1f9add) || Number(_0x222021?.min) || 5,
      min: Number(_0x222021?.min) || 4,
      max: Number(_0x222021?.max) || 15,
      step: Number(_0x222021?.step) || 1,
      variant: "durationPill",
      ...(_0x49fff2.length > 0 ? {
        options: _0x49fff2.map(_0x2c71e4 => {
          const _0xadaac1 = _0x37c0f5[String(_0x2c71e4)];
          const _0x1d431d = _0xadaac1 || _0x2c71e4 + "s";
          return {
            value: _0x2c71e4,
            label: _0x1d431d,
            displayLabel: _0x1d431d
          };
        })
      } : {})
    }
  };
}