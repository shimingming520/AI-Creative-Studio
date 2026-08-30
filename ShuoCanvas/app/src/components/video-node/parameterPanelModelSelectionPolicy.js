import { getModelManifest, resolveModelExecution } from "../../manifests/index.js";
import { getTargetInputPolicy, manifestInputPolicyReferencesField, resolveEffectiveInputKind } from "../../modules/modelInputPolicy.js";
import { isHappyHorseModelApiVideo, isWan27ModelApiVideo } from "../../modules/modelApiVideoResolverPolicy.js";
import { buildModelProviderProfileSelectionPatch } from "../../modules/modelProviderProfileSelection.js";
import { buildModelUiSchemaDefaultParams, sanitizeModelUiSchemaParams } from "../aigenImage/uiSchemaRenderer.js";
import { buildGenerationModelSelectionDisplayPatch } from "../shared/generationDisplayPolicy.js";
import { isRunningHubAiAppManifest, resolveCustomAiAppNodeManifest } from "../shared/rhAiAppNodeBehavior.js";
import { getPlainGenerationParams } from "./runningHubVideoUiSchema.js";
const APIMART_KLING_V3_OMNI_MODEL_ID = "apimart/kling-v3-omni";
const RH_WORKFLOW_DISPLAY_FIELD_IDS = new Set(["rhVideoResolution", "rhVideoFps", "rhVideoFrames", "rhVideoSeconds"]);
const RH_WORKFLOW_BOOLEAN_FIELD_IDS = new Set(["rhBlendIntoScene", "rhSubtractSubject", "rhMaskRect", "rhEnableMask"]);
const LEGACY_INPUT_POLICY_FIELD_IDS = new Set(["happyhorse_mode", "wan27_mode", "kling_v3_omni_mode"]);
function normalizeRhV54SingleControlPreset(_0x3f3a8b) {
  const _0x40acc7 = String(_0x3f3a8b ?? "").trim();
  if (_0x40acc7 === "efficiency" || _0x40acc7 === "stable" || _0x40acc7 === "quality") {
    return _0x40acc7;
  } else {
    return "efficiency";
  }
}
function normalizeRhV54SpecialModeValue(_0x4a82d1) {
  const _0x201bde = String(_0x4a82d1 ?? "").trim();
  if (_0x201bde === "longVideoOverlay" || _0x201bde === "cameraMove") {
    return _0x201bde;
  } else {
    return null;
  }
}
function normalizeRhV54MaskExpandValue(_0x1a17de) {
  const _0x106d1f = Number(_0x1a17de);
  if (Number.isFinite(_0x106d1f)) {
    return Math.max(-9999, Math.min(9999, Math.trunc(_0x106d1f)));
  } else {
    return 25;
  }
}
function normalizeRhV54BreastJiggleValue(_0x277072) {
  const _0x1f7293 = Number(_0x277072);
  if (!Number.isFinite(_0x1f7293)) {
    return 0;
  }
  return Math.max(0, Math.min(1, Math.round(_0x1f7293 * 20) / 20));
}
function isApimartPanelModel(_0x1b0288 = {}, _0x20e3d7 = "") {
  const _0x4d9716 = String(_0x1b0288?.provider || "").trim().toLowerCase();
  const _0x32c9b9 = String(_0x1b0288?.model || "").trim();
  const _0x150ca5 = resolveModelExecution(_0x32c9b9, {
    providerHint: _0x4d9716
  }) || resolveModelExecution(_0x32c9b9);
  const _0x30f4e2 = String(_0x150ca5?.canonicalModelId || _0x150ca5?.modelManifest?.modelId || _0x32c9b9).trim();
  const _0x15c816 = String(_0x150ca5?.modelManifest?.provider || _0x4d9716).trim().toLowerCase();
  return _0x30f4e2 === _0x20e3d7 && (!_0x15c816 || _0x15c816 === "apimart");
}
export function isHappyHorsePanelModel(_0x3635a9 = {}) {
  return isHappyHorseModelApiVideo(_0x3635a9?.model, _0x3635a9?.provider);
}
export function isWan27PanelModel(_0x27dab2 = {}) {
  return isWan27ModelApiVideo(_0x27dab2?.model, _0x27dab2?.provider);
}
export function isKlingV3OmniPanelModel(_0x24806a = {}) {
  return isApimartPanelModel(_0x24806a, APIMART_KLING_V3_OMNI_MODEL_ID);
}
export function getPanelModelManifest(_0x51e319 = {}) {
  const _0x238f9e = resolveCustomAiAppNodeManifest(_0x51e319);
  const _0xcb6ed4 = String(_0x51e319?.model || "").trim();
  if (_0x238f9e || !_0xcb6ed4) {
    return _0x238f9e;
  }
  const _0x49145d = resolveModelExecution(_0xcb6ed4, {
    providerHint: _0x51e319?.provider
  }) || resolveModelExecution(_0xcb6ed4);
  return _0x49145d?.modelManifest || getModelManifest(_0xcb6ed4) || null;
}
export function isRhAiAppPanelModel(_0x409669 = {}) {
  return isRunningHubAiAppManifest(getPanelModelManifest(_0x409669));
}
function normalizeHappyHorsePanelMode(_0x5f33ed) {
  const _0x5c5a58 = String(_0x5f33ed || "").trim().toLowerCase();
  if (_0x5c5a58 === "image" || _0x5c5a58 === "reference" || _0x5c5a58 === "edit") {
    return _0x5c5a58;
  } else {
    return "auto";
  }
}
function normalizeWan27PanelMode(_0x2ba7ed) {
  const _0x5ed6ec = String(_0x2ba7ed || "").trim().toLowerCase();
  if (_0x5ed6ec === "video" || _0x5ed6ec === "reference" || _0x5ed6ec === "edit") {
    return _0x5ed6ec;
  } else {
    return "image";
  }
}
function normalizeKlingV3OmniPanelMode(_0x51b2cf) {
  const _0x482907 = String(_0x51b2cf || "").trim().toLowerCase();
  if (_0x482907 === "reference" || _0x482907 === "edit") {
    return _0x482907;
  } else {
    return "image";
  }
}
function getPanelInputKind(_0x3dbc66, _0x16a194) {
  const _0x555e0d = resolveEffectiveInputKind(_0x3dbc66, _0x16a194);
  if (_0x555e0d) {
    return _0x555e0d;
  }
  const _0x4af2a2 = String(_0x3dbc66?.type || "").toLowerCase();
  if (_0x4af2a2.includes("video")) {
    return "video";
  }
  if (_0x4af2a2.includes("image")) {
    return "image";
  }
  if (_0x4af2a2.includes("audio")) {
    return "audio";
  }
  if (_0x4af2a2.includes("text")) {
    return "text";
  }
  return "";
}
export function getManifestInputPolicyEdgeIdsToRemove({
  latest = {},
  fieldId = "",
  value: _0x423e18,
  inEdges = [],
  nodes = {}
} = {}) {
  const _0x43130a = getPanelModelManifest(latest);
  if (!LEGACY_INPUT_POLICY_FIELD_IDS.has(String(fieldId || "").trim()) && !manifestInputPolicyReferencesField(_0x43130a?.inputSlots, fieldId)) {
    return null;
  }
  const _0x34b078 = {
    ...latest,
    generationParams: {
      ...getPlainGenerationParams(latest?.generationParams),
      [fieldId]: _0x423e18
    }
  };
  const _0x1631b5 = getTargetInputPolicy(_0x34b078);
  const _0x309d2f = new Set(Array.isArray(_0x1631b5?.allowedKinds) ? _0x1631b5.allowedKinds : []);
  const _0x367dda = {};
  const _0x6c1c92 = [];
  for (const _0x4d0363 of Array.isArray(inEdges) ? inEdges : []) {
    const _0x25fc5b = getPanelInputKind(nodes?.[_0x4d0363?.sourceId], _0x4d0363);
    if (!_0x25fc5b) {
      continue;
    }
    const _0x4936e5 = Number(_0x1631b5?.maxByKind?.[_0x25fc5b]);
    const _0x14316f = Number.isFinite(_0x4936e5) && _0x4936e5 >= 0 ? _0x4936e5 : Infinity;
    const _0x330fe2 = _0x367dda[_0x25fc5b] || 0;
    if (!_0x309d2f.has(_0x25fc5b) || _0x330fe2 >= _0x14316f) {
      if (_0x4d0363?.id) {
        _0x6c1c92.push(_0x4d0363.id);
      }
      continue;
    }
    _0x367dda[_0x25fc5b] = _0x330fe2 + 1;
  }
  return _0x6c1c92;
}
export function getHappyHorseModeEdgeIdsToRemove({
  nextMode: _0x36af43,
  inEdges = [],
  nodes = {}
} = {}) {
  const _0xe7f618 = normalizeHappyHorsePanelMode(_0x36af43);
  const _0xd4177a = [];
  let _0xd32154 = 0;
  let _0x4bb199 = 0;
  for (const _0x4a4e9c of Array.isArray(inEdges) ? inEdges : []) {
    const _0x1db5d7 = nodes?.[_0x4a4e9c?.sourceId];
    const _0x48966c = getPanelInputKind(_0x1db5d7, _0x4a4e9c);
    if (_0x48966c === "video") {
      if (_0xe7f618 === "edit" && _0x4bb199 < 1) {
        _0x4bb199 += 1;
      } else if (_0x4a4e9c?.id) {
        _0xd4177a.push(_0x4a4e9c.id);
      }
      continue;
    }
    if (_0x48966c === "image") {
      if (_0xe7f618 === "image") {
        if (_0xd32154 < 1) {
          _0xd32154 += 1;
        } else if (_0x4a4e9c?.id) {
          _0xd4177a.push(_0x4a4e9c.id);
        }
      } else if (_0xe7f618 === "edit") {
        if (_0xd32154 < 5) {
          _0xd32154 += 1;
        } else if (_0x4a4e9c?.id) {
          _0xd4177a.push(_0x4a4e9c.id);
        }
      } else if (_0xe7f618 === "reference") {
        if (_0xd32154 < 9) {
          _0xd32154 += 1;
        } else if (_0x4a4e9c?.id) {
          _0xd4177a.push(_0x4a4e9c.id);
        }
      }
      continue;
    }
    if (_0x48966c === "audio" && _0x4a4e9c?.id) {
      _0xd4177a.push(_0x4a4e9c.id);
    }
  }
  return _0xd4177a;
}
export function getWan27ModeEdgeIdsToRemove({
  nextMode: _0x5b965f,
  inEdges = [],
  nodes = {}
} = {}) {
  const _0x209a21 = normalizeWan27PanelMode(_0x5b965f);
  const _0x40491f = [];
  let _0x139943 = 0;
  let _0x27ff92 = 0;
  let _0x1f678a = 0;
  for (const _0x3a381e of Array.isArray(inEdges) ? inEdges : []) {
    const _0x5f189d = nodes?.[_0x3a381e?.sourceId];
    const _0x376db0 = getPanelInputKind(_0x5f189d, _0x3a381e);
    if (_0x376db0 === "image") {
      if (_0x209a21 === "image" && _0x139943 < 2) {
        _0x139943 += 1;
      } else if (_0x209a21 === "reference" && _0x139943 < 1) {
        _0x139943 += 1;
      } else if (_0x3a381e?.id) {
        _0x40491f.push(_0x3a381e.id);
      }
      continue;
    }
    if (_0x376db0 === "video") {
      if (_0x209a21 === "video" && _0x27ff92 < 1) {
        _0x27ff92 += 1;
      } else if (_0x209a21 === "reference" && _0x27ff92 < 1) {
        _0x27ff92 += 1;
      } else if (_0x209a21 === "edit" && _0x27ff92 < 2) {
        _0x27ff92 += 1;
      } else if (_0x3a381e?.id) {
        _0x40491f.push(_0x3a381e.id);
      }
      continue;
    }
    if (_0x376db0 === "audio") {
      if ((_0x209a21 === "image" || _0x209a21 === "reference") && _0x1f678a < 1) {
        _0x1f678a += 1;
      } else if (_0x3a381e?.id) {
        _0x40491f.push(_0x3a381e.id);
      }
    }
  }
  return _0x40491f;
}
export function getKlingV3OmniModeEdgeIdsToRemove({
  nextMode: _0x536cd5,
  inEdges = [],
  nodes = {}
} = {}) {
  const _0x2486f7 = normalizeKlingV3OmniPanelMode(_0x536cd5);
  const _0x214cc0 = [];
  let _0x34dab = 0;
  let _0x56ffe4 = 0;
  for (const _0x2f652f of Array.isArray(inEdges) ? inEdges : []) {
    const _0x167f7f = nodes?.[_0x2f652f?.sourceId];
    const _0x515a87 = getPanelInputKind(_0x167f7f, _0x2f652f);
    if (_0x515a87 === "image") {
      if (_0x2486f7 === "image" && _0x34dab < 2) {
        _0x34dab += 1;
      } else if (_0x2486f7 === "reference" && _0x34dab < 1) {
        _0x34dab += 1;
      } else if (_0x2f652f?.id) {
        _0x214cc0.push(_0x2f652f.id);
      }
      continue;
    }
    if (_0x515a87 === "video") {
      if ((_0x2486f7 === "reference" || _0x2486f7 === "edit") && _0x56ffe4 < 1) {
        _0x56ffe4 += 1;
      } else if (_0x2f652f?.id) {
        _0x214cc0.push(_0x2f652f.id);
      }
      continue;
    }
    if (_0x515a87 === "audio" && _0x2f652f?.id) {
      _0x214cc0.push(_0x2f652f.id);
    }
  }
  return _0x214cc0;
}
function buildSchemaParamsPatch(_0x48db99, _0x45608e, _0x8acc9a = {}) {
  const _0x78acb7 = {
    ...getPlainGenerationParams(_0x48db99?.generationParams),
    ...getPlainGenerationParams(_0x8acc9a?.generationParams),
    ...(_0x45608e && typeof _0x45608e === "object" ? _0x45608e : {})
  };
  const _0x34e7b1 = {
    generationParams: _0x78acb7
  };
  const _0x443b4f = String(_0x48db99?.model || "").trim();
  if (_0x443b4f) {
    _0x34e7b1.generationParamsByModel = {
      ...getPlainGenerationParams(_0x48db99?.generationParamsByModel),
      [_0x443b4f]: _0x78acb7
    };
  }
  return _0x34e7b1;
}
function getUiSchemaFieldIds(_0x32e49a) {
  const _0x244c0e = getModelManifest(_0x32e49a);
  return new Set((Array.isArray(_0x244c0e?.uiSchema?.fields) ? _0x244c0e.uiSchema.fields : []).map(_0x199838 => String(_0x199838?.id || "").trim()).filter(Boolean));
}
function sanitizeVideoModelApiParams(_0x474de9, _0x3b62fe = {}, _0x577c29 = {}) {
  const _0x4b0611 = getPlainGenerationParams(_0x3b62fe);
  try {
    return sanitizeModelUiSchemaParams(_0x474de9, _0x4b0611, _0x577c29);
  } catch {
    return _0x4b0611;
  }
}
export function buildVideoModelApiModelSelectionPatch(_0x82917d = {}, _0x278810 = "", _0x323db1 = null, _0x28b51d = {}) {
  const _0x463e6e = String(_0x278810 || "").trim();
  if (!_0x463e6e) {
    return {};
  }
  const _0xe917f0 = String(_0x82917d?.model || "").trim();
  const _0x3c63a1 = getPlainGenerationParams(_0x82917d?.generationParamsByModel);
  if (_0xe917f0) {
    _0x3c63a1[_0xe917f0] = sanitizeVideoModelApiParams(_0xe917f0, _0x82917d?.generationParams, {
      includeDefaults: false
    });
  }
  const _0x4a25a9 = getUiSchemaFieldIds(_0x463e6e);
  const _0x1dc6d6 = buildModelUiSchemaDefaultParams(_0x463e6e);
  const _0x59977c = getPlainGenerationParams(_0x3c63a1[_0x463e6e]);
  const _0x23f5a4 = Object.prototype.hasOwnProperty.call(_0x28b51d, "generationParams");
  const _0x2222fe = _0x23f5a4 ? getPlainGenerationParams(_0x28b51d.generationParams) : {};
  const _0x25d5ca = {};
  Object.entries(_0x28b51d || {}).forEach(([_0x378191, _0x52451f]) => {
    if (_0x4a25a9.has(_0x378191)) {
      _0x25d5ca[_0x378191] = _0x52451f;
    }
  });
  const _0x2bbb21 = {
    ..._0x1dc6d6,
    ..._0x59977c,
    ..._0x2222fe,
    ..._0x25d5ca
  };
  const _0x3ada90 = Object.fromEntries(Object.entries(_0x2bbb21).filter(([_0x1543a4]) => _0x4a25a9.has(_0x1543a4)));
  const _0x75ac7e = sanitizeVideoModelApiParams(_0x463e6e, _0x3ada90, {
    includeDefaults: true
  });
  const _0xaf07d8 = buildGenerationModelSelectionDisplayPatch({
    nodeData: _0x82917d,
    fallbackNodeData: _0x82917d,
    modelId: _0x463e6e,
    generationParams: _0x75ac7e
  });
  const {
    generationParams: _0x31ea8e,
    ..._0x461ac2
  } = _0x28b51d || {};
  const _0x1e0165 = {
    ..._0x461ac2
  };
  _0x4a25a9.forEach(_0x126329 => {
    delete _0x1e0165[_0x126329];
  });
  const _0x899cd2 = buildModelProviderProfileSelectionPatch(_0x82917d, _0x463e6e, _0x28b51d?.providerProfileId);
  return {
    ..._0x1e0165,
    ..._0x899cd2,
    model: _0x463e6e,
    provider: _0x323db1,
    generationParams: _0x75ac7e,
    generationParamsByModel: _0x3c63a1,
    ..._0xaf07d8
  };
}
export function buildRhWorkflowFieldPatch(_0x2ff6f0, _0x394c48, _0x4b2149, _0x4c1df4 = {}) {
  const _0x24aa94 = String(_0x394c48 || "").trim();
  if (RH_WORKFLOW_DISPLAY_FIELD_IDS.has(_0x24aa94)) {
    return {
      [_0x24aa94]: _0x4b2149
    };
  }
  if (_0x24aa94 === "rhSingleControlPreset" || _0x24aa94 === "rhControlMode") {
    const _0x254b73 = String(_0x4b2149 || "").trim();
    const _0x531227 = _0x254b73 === "multi" ? {
      rhControlMode: "multi",
      rhSingleControlPreset: null
    } : {
      rhControlMode: "single",
      rhSingleControlPreset: normalizeRhV54SingleControlPreset(_0x254b73)
    };
    return {
      ...buildSchemaParamsPatch(_0x2ff6f0, _0x531227, _0x4c1df4),
      ..._0x531227
    };
  }
  if (RH_WORKFLOW_BOOLEAN_FIELD_IDS.has(_0x24aa94)) {
    const _0x56c65c = _0x4b2149 === true || String(_0x4b2149) === "true";
    const _0x12afcc = {
      [_0x24aa94]: _0x56c65c
    };
    return {
      ...buildSchemaParamsPatch(_0x2ff6f0, _0x12afcc, _0x4c1df4),
      ..._0x12afcc
    };
  }
  if (_0x24aa94 === "rhSpecialMode") {
    const _0x2be308 = getPlainGenerationParams(_0x2ff6f0?.generationParams);
    const _0x4ccb2d = normalizeRhV54SpecialModeValue(_0x2be308.rhSpecialMode !== undefined ? _0x2be308.rhSpecialMode : _0x2ff6f0?.rhSpecialMode);
    const _0xd645cf = normalizeRhV54SpecialModeValue(_0x4b2149);
    const _0x5bffac = _0x4ccb2d === _0xd645cf ? null : _0xd645cf;
    const _0x7f0e2a = {
      rhSpecialMode: _0x5bffac
    };
    return {
      ...buildSchemaParamsPatch(_0x2ff6f0, _0x7f0e2a, _0x4c1df4),
      ..._0x7f0e2a
    };
  }
  if (_0x24aa94 === "rhMaskExpand") {
    const _0x13e746 = normalizeRhV54MaskExpandValue(_0x4b2149);
    const _0x26f8a5 = {
      rhMaskExpand: _0x13e746
    };
    return {
      ...buildSchemaParamsPatch(_0x2ff6f0, _0x26f8a5, _0x4c1df4),
      rhMaskExpand: _0x13e746,
      rhMaskExpandTouched: true
    };
  }
  if (_0x24aa94 === "rhBreastJiggle") {
    const _0x334cbd = normalizeRhV54BreastJiggleValue(_0x4b2149);
    const _0x25d986 = {
      rhBreastJiggle: _0x334cbd
    };
    return {
      ...buildSchemaParamsPatch(_0x2ff6f0, _0x25d986, _0x4c1df4),
      rhBreastJiggle: _0x334cbd
    };
  }
  return {};
}