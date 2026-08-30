import { getModelManifest, normalizeUiSchemaFieldValue, resolveModelExecution, sanitizeModelUiSchemaParams } from "../../manifests/index.js";
import { getUiSchemaFieldAdapterDefinition, resolveUiSchemaFieldAdapterDefinition } from "./uiSchemaControlAdapters.js";
import { resolveAudioVoiceCompositeState } from "./audioVoiceCompositeState.js";
import { t } from "../../i18n/index.js";
export function getNodeFieldValue(_0x17bbcc, _0x2e7292, _0x3ffb2a = "") {
  const _0x283e5f = String(_0x2e7292 || "").trim();
  if (!_0x283e5f) {
    return _0x3ffb2a;
  }
  const _0x352cb7 = _0x17bbcc?.generationParams;
  if (_0x352cb7 && typeof _0x352cb7 === "object" && !Array.isArray(_0x352cb7) && _0x352cb7[_0x283e5f] !== undefined) {
    return _0x352cb7[_0x283e5f];
  }
  if (_0x17bbcc && typeof _0x17bbcc === "object" && !Array.isArray(_0x17bbcc) && _0x17bbcc[_0x283e5f] !== undefined) {
    return _0x17bbcc[_0x283e5f];
  }
  return _0x3ffb2a;
}
function getPlainGenerationParams(_0x256956) {
  if (_0x256956 && typeof _0x256956 === "object" && !Array.isArray(_0x256956)) {
    return {
      ..._0x256956
    };
  } else {
    return {};
  }
}
export function getUiSchemaParamContext(_0x8f927e = {}) {
  const _0xdd4a48 = getPlainGenerationParams(_0x8f927e?.generationParams);
  const _0x162dce = _0x8f927e && typeof _0x8f927e === "object" && !Array.isArray(_0x8f927e) ? _0x8f927e : {};
  return {
    ..._0x162dce,
    ..._0xdd4a48
  };
}
export function firstNonEmptyString(..._0x1dfce2) {
  for (const _0x5b4495 of _0x1dfce2) {
    const _0x1bab80 = String(_0x5b4495 ?? "").trim();
    if (_0x1bab80) {
      return _0x1bab80;
    }
  }
  return "";
}
function normalizeControlType(_0x5bfd13) {
  return String(_0x5bfd13 || "").trim().toLowerCase();
}
function normalizeCompareValue(_0x4e7a78) {
  return String(_0x4e7a78 ?? "").trim().toLowerCase();
}
export function getRenderedOptionDisableWhen(_0x3e92f1) {
  const _0x174e53 = String(_0x3e92f1?.dataset?.uiSchemaDisableWhenJson || "").trim();
  if (_0x174e53) {
    try {
      const _0x3d01d8 = JSON.parse(_0x174e53);
      if (_0x3d01d8 && typeof _0x3d01d8 === "object") {
        return _0x3d01d8;
      } else {
        return null;
      }
    } catch {
      return null;
    }
  }
  const _0x400a0e = String(_0x3e92f1?.dataset?.uiSchemaDisableWhenField || "").trim();
  const _0x13f4f3 = String(_0x3e92f1?.dataset?.uiSchemaDisableWhenValues || "").split(",").map(_0xdcaf78 => _0xdcaf78.trim()).filter(Boolean);
  if (_0x400a0e && _0x13f4f3.length > 0) {
    return {
      field: _0x400a0e,
      values: _0x13f4f3
    };
  } else {
    return null;
  }
}
export function optionDisableWhenMatches(_0x1c7ecf, _0x59a716 = {}) {
  if (Array.isArray(_0x1c7ecf)) {
    return _0x1c7ecf.some(_0x2efca4 => optionDisableWhenMatches(_0x2efca4, _0x59a716));
  }
  if (!_0x1c7ecf || typeof _0x1c7ecf !== "object") {
    return false;
  }
  if (Array.isArray(_0x1c7ecf.any)) {
    return _0x1c7ecf.any.some(_0x515144 => optionDisableWhenMatches(_0x515144, _0x59a716));
  }
  if (Array.isArray(_0x1c7ecf.all)) {
    return _0x1c7ecf.all.every(_0x1aad59 => optionDisableWhenMatches(_0x1aad59, _0x59a716));
  }
  const _0x5c5b50 = String(_0x1c7ecf?.field || _0x1c7ecf?.param || "").trim();
  if (!_0x5c5b50) {
    return false;
  }
  const _0x230750 = _0x1c7ecf.values !== undefined ? _0x1c7ecf.values : _0x1c7ecf.value;
  const _0x28d77f = Array.isArray(_0x230750) ? _0x230750 : [_0x230750];
  const _0x38fde5 = _0x28d77f.map(normalizeCompareValue);
  const _0x4d9c89 = _0x38fde5.includes(normalizeCompareValue(getNodeFieldValue(_0x59a716, _0x5c5b50, "")));
  if (_0x1c7ecf.not) {
    return !_0x4d9c89;
  } else {
    return _0x4d9c89;
  }
}
function mergeUiSchemaRepairPatches(_0x54ab56 = {}, _0x44a083 = {}) {
  const _0x48c0bc = {
    ..._0x54ab56
  };
  for (const [_0x235f50, _0x4e0719] of Object.entries(_0x44a083)) {
    if (Object.prototype.hasOwnProperty.call(_0x48c0bc, _0x235f50) && normalizeCompareValue(_0x48c0bc[_0x235f50]) !== normalizeCompareValue(_0x4e0719)) {
      return null;
    }
    _0x48c0bc[_0x235f50] = _0x4e0719;
  }
  return _0x48c0bc;
}
function resolveMatchingOptionDisableRepair(_0x1d79ea, _0x763f07 = {}) {
  if (Array.isArray(_0x1d79ea) || Array.isArray(_0x1d79ea?.any)) {
    const _0x1019d5 = Array.isArray(_0x1d79ea) ? _0x1d79ea : _0x1d79ea.any;
    let _0x4fc380 = {};
    for (const _0xc993d7 of _0x1019d5) {
      if (!optionDisableWhenMatches(_0xc993d7, _0x763f07)) {
        continue;
      }
      const _0x3390cb = resolveMatchingOptionDisableRepair(_0xc993d7, _0x763f07);
      if (!_0x3390cb) {
        return null;
      }
      _0x4fc380 = mergeUiSchemaRepairPatches(_0x4fc380, _0x3390cb);
      if (!_0x4fc380) {
        return null;
      }
    }
    if (Object.keys(_0x4fc380).length > 0) {
      return _0x4fc380;
    } else {
      return null;
    }
  }
  if (Array.isArray(_0x1d79ea?.all)) {
    for (const _0x5643fb of _0x1d79ea.all) {
      if (!optionDisableWhenMatches(_0x5643fb, _0x763f07)) {
        continue;
      }
      const _0x495467 = resolveMatchingOptionDisableRepair(_0x5643fb, _0x763f07);
      if (_0x495467 && Object.keys(_0x495467).length > 0) {
        return _0x495467;
      }
    }
    return null;
  }
  if (!_0x1d79ea || typeof _0x1d79ea !== "object" || _0x1d79ea.not !== true) {
    return null;
  }
  const _0x12cb69 = String(_0x1d79ea.field || _0x1d79ea.param || "").trim();
  const _0x50161b = _0x1d79ea.values !== undefined ? _0x1d79ea.values : _0x1d79ea.value;
  const _0x580852 = Array.isArray(_0x50161b) ? _0x50161b : [_0x50161b];
  if (!_0x12cb69 || _0x580852.length === 0) {
    return null;
  }
  const _0x3ee005 = getNodeFieldValue(_0x763f07, _0x12cb69, "");
  const _0x28e9e2 = _0x580852.find(_0xcfacd3 => normalizeCompareValue(_0xcfacd3) !== normalizeCompareValue(_0x3ee005));
  if (_0x28e9e2 === undefined) {
    return null;
  } else {
    return {
      [_0x12cb69]: _0x28e9e2
    };
  }
}
export function getOptionDisableRepairPatch(_0xaf0be3, _0x5c0e5f = {}) {
  if (!optionDisableWhenMatches(_0xaf0be3, _0x5c0e5f)) {
    return null;
  }
  return resolveMatchingOptionDisableRepair(_0xaf0be3, _0x5c0e5f);
}
export function uiSchemaConditionMatches(_0xb7d63b, _0x5accb0 = {}) {
  if (Array.isArray(_0xb7d63b)) {
    return _0xb7d63b.some(_0x241098 => uiSchemaConditionMatches(_0x241098, _0x5accb0));
  }
  if (!_0xb7d63b || typeof _0xb7d63b !== "object") {
    return false;
  }
  if (Array.isArray(_0xb7d63b.any)) {
    return _0xb7d63b.any.some(_0xb72aa6 => uiSchemaConditionMatches(_0xb72aa6, _0x5accb0));
  }
  if (Array.isArray(_0xb7d63b.all)) {
    return _0xb7d63b.all.every(_0x5c8116 => uiSchemaConditionMatches(_0x5c8116, _0x5accb0));
  }
  const _0x990cae = String(_0xb7d63b?.field || _0xb7d63b?.param || "").trim();
  if (!_0x990cae) {
    return false;
  }
  const _0x3680f5 = _0xb7d63b.values !== undefined ? _0xb7d63b.values : _0xb7d63b.value;
  const _0xfe04d9 = Array.isArray(_0x3680f5) ? _0x3680f5 : [_0x3680f5];
  const _0x1c902b = _0xfe04d9.map(normalizeCompareValue);
  return _0x1c902b.includes(normalizeCompareValue(getNodeFieldValue(_0x5accb0, _0x990cae, "")));
}
export function filterVisibleUiSchemaFields(_0x5c74ce = [], _0x36a416 = {}) {
  return (Array.isArray(_0x5c74ce) ? _0x5c74ce : []).filter(_0x4fd5e7 => {
    if (_0x4fd5e7?.showWhen && !uiSchemaConditionMatches(_0x4fd5e7.showWhen, _0x36a416)) {
      return false;
    }
    if (_0x4fd5e7?.hideWhen && uiSchemaConditionMatches(_0x4fd5e7.hideWhen, _0x36a416)) {
      return false;
    }
    return true;
  });
}
function getUiSchemaModelIdForNode(_0x218654 = {}) {
  const _0x46d8eb = String(_0x218654?.model || "").trim();
  if (!_0x46d8eb) {
    return "";
  }
  if (getModelManifest(_0x46d8eb)) {
    return _0x46d8eb;
  }
  const _0x461ea9 = resolveModelExecution(_0x46d8eb, {
    providerHint: _0x218654?.provider
  }) || resolveModelExecution(_0x46d8eb);
  return String(_0x461ea9?.canonicalModelId || _0x461ea9?.modelManifest?.modelId || _0x46d8eb).trim();
}
function getUiSchemaFieldModePatch(_0x12b352 = {}, _0x1f2e1f = "") {
  const _0x4b5ffa = firstNonEmptyString(_0x12b352?.modeField, _0x12b352?.voiceModeField);
  if (!_0x4b5ffa) {
    return null;
  }
  const _0x5e345c = firstNonEmptyString(_0x12b352?.modeValue);
  if (_0x5e345c) {
    return {
      field: _0x4b5ffa,
      value: _0x5e345c
    };
  }
  const _0x130d52 = firstNonEmptyString(_0x12b352?.filledModeValue, _0x12b352?.customModeValue);
  const _0x266e68 = firstNonEmptyString(_0x12b352?.emptyModeValue, _0x12b352?.defaultModeValue);
  if (!_0x130d52 && !_0x266e68) {
    return null;
  }
  const _0x24cd1a = String(_0x1f2e1f ?? "").trim() !== "";
  return {
    field: _0x4b5ffa,
    value: _0x24cd1a ? _0x130d52 : _0x266e68
  };
}
export function buildUiSchemaParamPatch(_0x4aa478 = {}, _0x2cec64 = "", _0x2591e4 = "") {
  const _0x1b3c91 = String(_0x2cec64 || "").trim();
  if (!_0x1b3c91) {
    return {};
  }
  const _0x307f6a = getUiSchemaModelIdForNode(_0x4aa478);
  const _0x1f2832 = getModelManifest(_0x307f6a);
  const _0x199150 = Array.isArray(_0x1f2832?.uiSchema?.fields) ? _0x1f2832.uiSchema.fields.find(_0x3add14 => String(_0x3add14?.id || "").trim() === _0x1b3c91) : null;
  const _0x400a08 = _0x199150 ? resolveUiSchemaFieldAdapterDefinition(_0x199150, {
    type: normalizeControlType(_0x199150?.type),
    variant: _0x199150?.variant
  }) : null;
  const _0x568b74 = {
    ...getUiSchemaParamContext(_0x4aa478),
    [_0x1b3c91]: _0x2591e4
  };
  const _0x16e2d7 = (_0x199eb1, _0x553c25, _0x20405d = {}) => normalizeUiSchemaFieldValue(_0x199eb1, _0x553c25, {
    ..._0x20405d,
    params: _0x20405d?.params || _0x568b74
  });
  const _0x4e915a = _0x400a08 && typeof _0x400a08.normalize === "function" ? _0x400a08.normalize({
    field: _0x199150,
    value: _0x2591e4,
    nodeData: _0x4aa478,
    phase: "commit",
    helpers: {
      normalizeUiSchemaFieldValue: _0x16e2d7
    }
  }) : _0x199150 ? _0x16e2d7(_0x199150, _0x2591e4) : _0x2591e4;
  const _0xdcf194 = getPlainGenerationParams(_0x4aa478.generationParams);
  _0xdcf194[_0x1b3c91] = _0x4e915a;
  const _0x20d723 = _0x199150 ? getUiSchemaFieldModePatch(_0x199150, _0x4e915a) : null;
  if (_0x20d723?.field) {
    _0xdcf194[_0x20d723.field] = _0x20d723.value;
  }
  const _0x11efe6 = sanitizeModelUiSchemaParams(_0x307f6a || _0x4aa478?.model, _0xdcf194, {
    includeDefaults: false
  });
  for (const _0x5aec74 of Object.keys(_0xdcf194)) {
    if (!(_0x5aec74 in _0x11efe6)) {
      _0x11efe6[_0x5aec74] = _0xdcf194[_0x5aec74];
    }
  }
  const _0x44f9bb = {
    generationParams: _0x11efe6
  };
  const _0x1da042 = String(_0x4aa478?.model || "").trim();
  if (_0x1da042) {
    _0x44f9bb.generationParamsByModel = {
      ...getPlainGenerationParams(_0x4aa478.generationParamsByModel),
      [_0x1da042]: _0x11efe6
    };
  }
  return _0x44f9bb;
}
export function evaluateUiSchemaNumberExpression(_0xb00727) {
  if (typeof _0xb00727 === "number") {
    if (Number.isFinite(_0xb00727)) {
      return _0xb00727;
    } else {
      return NaN;
    }
  }
  const _0xb86a13 = String(_0xb00727 ?? "").trim();
  if (!_0xb86a13) {
    return NaN;
  }
  let _0x36591d = 0;
  const _0x21b5cf = () => {
    while (/\s/.test(_0xb86a13[_0x36591d] || "")) {
      _0x36591d += 1;
    }
  };
  const _0x3d18b6 = () => {
    _0x21b5cf();
    const _0x5e7d8b = _0x36591d;
    let _0x467ffd = false;
    while (/\d/.test(_0xb86a13[_0x36591d] || "")) {
      _0x467ffd = true;
      _0x36591d += 1;
    }
    if (_0xb86a13[_0x36591d] === ".") {
      _0x36591d += 1;
      while (/\d/.test(_0xb86a13[_0x36591d] || "")) {
        _0x467ffd = true;
        _0x36591d += 1;
      }
    }
    if (!_0x467ffd) {
      return NaN;
    }
    return Number(_0xb86a13.slice(_0x5e7d8b, _0x36591d));
  };
  const _0x1a58bd = () => {
    _0x21b5cf();
    const _0x56e979 = _0xb86a13[_0x36591d];
    if (_0x56e979 === "+" || _0x56e979 === "-") {
      _0x36591d += 1;
      const _0x5c2cee = _0x1a58bd();
      if (_0x56e979 === "-") {
        return -_0x5c2cee;
      } else {
        return _0x5c2cee;
      }
    }
    if (_0xb86a13[_0x36591d] === "(") {
      _0x36591d += 1;
      const _0x2d4e3b = _0x351792();
      _0x21b5cf();
      if (_0xb86a13[_0x36591d] !== ")") {
        return NaN;
      }
      _0x36591d += 1;
      return _0x2d4e3b;
    }
    return _0x3d18b6();
  };
  const _0x2ff2bf = () => {
    let _0x450b0a = _0x1a58bd();
    while (true) {
      _0x21b5cf();
      const _0x47965e = _0xb86a13[_0x36591d];
      if (_0x47965e !== "*" && _0x47965e !== "/") {
        return _0x450b0a;
      }
      _0x36591d += 1;
      const _0xa6b3d1 = _0x1a58bd();
      if (!Number.isFinite(_0x450b0a) || !Number.isFinite(_0xa6b3d1)) {
        return NaN;
      }
      if (_0x47965e === "/" && _0xa6b3d1 === 0) {
        return NaN;
      }
      _0x450b0a = _0x47965e === "*" ? _0x450b0a * _0xa6b3d1 : _0x450b0a / _0xa6b3d1;
    }
  };
  function _0x351792() {
    let _0x2f7674 = _0x2ff2bf();
    while (true) {
      _0x21b5cf();
      const _0xf23588 = _0xb86a13[_0x36591d];
      if (_0xf23588 !== "+" && _0xf23588 !== "-") {
        return _0x2f7674;
      }
      _0x36591d += 1;
      const _0x35a489 = _0x2ff2bf();
      if (!Number.isFinite(_0x2f7674) || !Number.isFinite(_0x35a489)) {
        return NaN;
      }
      _0x2f7674 = _0xf23588 === "+" ? _0x2f7674 + _0x35a489 : _0x2f7674 - _0x35a489;
    }
  }
  const _0x48cc72 = _0x351792();
  _0x21b5cf();
  if (_0x36591d === _0xb86a13.length && Number.isFinite(_0x48cc72)) {
    return _0x48cc72;
  } else {
    return NaN;
  }
}
export function createUiSchemaStateOwner({
  getUiSchemaValueOptions: _0x296820,
  findUiSchemaValueOption: _0x2accb3,
  findFirstEnabledUiSchemaValueOption: _0x3b200a,
  syncInstanceToggleField: _0x408354,
  syncStepperField: _0x5c35ea,
  syncRhAiAppFooterParamField: _0xbd1c15,
  parseRangeValuesFromFieldEl: _0x17911c,
  findRangeValueIndex: _0x301261,
  normalizeRhV54SpecialMode: _0xca8305,
  normalizeRhV54SinglePreset: _0x252d72,
  normalizeRhV54MaskExpand: _0x3dd280,
  formatRhV54BreastJiggle: _0x5dee02,
  getRhV54BreastJiggleRangeFromFieldEl: _0x41224b,
  normalizeNumberValue: _0x3d6bf0,
  formatMetricLabel: _0x435bdd,
  joinMetricLabels: _0x44ecfc
} = {}) {
  function _0x5cb669(_0xb8011d) {
    const _0x12dcb2 = String(_0xb8011d?.dataset?.uiSchemaAdapter || "").trim();
    if (_0x12dcb2) {
      return _0x12dcb2;
    }
    if (_0xb8011d?.classList?.contains?.("ui-schema-duration-pill")) {
      return "field.durationPill.slider";
    }
    if (_0xb8011d?.classList?.contains?.("ui-schema-resolution-pill")) {
      return "field.resolutionPill.slider";
    }
    return "";
  }
  function _0x4028fa(_0x5cfff9, _0x283f1a = {}) {
    const _0x587d94 = _0x5cb669(_0x5cfff9);
    if (!_0x587d94) {
      return;
    }
    const _0x39957f = getUiSchemaFieldAdapterDefinition(_0x587d94);
    if (!_0x39957f || typeof _0x39957f.sync !== "function") {
      return;
    }
    _0x39957f.sync({
      fieldEl: _0x5cfff9,
      nodeData: _0x283f1a,
      helpers: {
        getNodeFieldValue: getNodeFieldValue
      }
    });
  }
  function _0x29b991(_0x4ea54f, _0x2d2512 = {}) {
    _0x4ea54f.querySelectorAll("[data-ui-schema-disable-when-field], [data-ui-schema-disable-when-json]").forEach(_0x19891c => {
      const _0x4393a9 = getRenderedOptionDisableWhen(_0x19891c);
      const _0x4d7bb2 = optionDisableWhenMatches(_0x4393a9, _0x2d2512);
      const _0x5ccd2e = _0x4d7bb2 ? getOptionDisableRepairPatch(_0x4393a9, _0x2d2512) : null;
      const _0x52ae36 = _0x4d7bb2 && !_0x5ccd2e;
      const _0x3dcc4c = _0x19891c.dataset.uiSchemaStaticDisabled === "true" || _0x19891c.hasAttribute("data-ui-schema-static-disabled");
      const _0x38b4d6 = Boolean(_0x3dcc4c || _0x52ae36);
      _0x19891c.classList?.toggle("disabled", _0x38b4d6);
      if (_0x38b4d6) {
        _0x19891c.dataset.uiSchemaDisabled = "true";
        _0x19891c.setAttribute("aria-disabled", "true");
        if ("disabled" in _0x19891c) {
          _0x19891c.disabled = true;
        }
      } else {
        delete _0x19891c.dataset.uiSchemaDisabled;
        _0x19891c.removeAttribute("data-ui-schema-disabled");
        _0x19891c.removeAttribute("aria-disabled");
        if ("disabled" in _0x19891c) {
          _0x19891c.disabled = false;
        }
      }
    });
  }
  function _0xbe2b73(_0x11e815, _0x58b434 = {}) {
    const _0x56a34e = String(_0x11e815?.dataset?.uiSchemaField || "").trim();
    const _0x31676d = String(_0x11e815?.dataset?.rhV54DisableOnSpecial || "").trim();
    const _0x31b7b6 = _0x31676d && _0xca8305(getNodeFieldValue(_0x58b434, "rhSpecialMode", "")) === _0x31676d;
    const _0x17b91e = _0x56a34e === "rhSubtractSubject" && _0x58b434?.rhV54HasMaskVideo === true;
    if (_0x31676d || _0x17b91e) {
      _0x11e815.classList.toggle("is-rh-disabled", Boolean(_0x31b7b6 || _0x17b91e));
    }
    if (_0x11e815.classList?.contains("ui-schema-rh-v54-control-mode")) {
      const _0x382668 = String(getNodeFieldValue(_0x58b434, "rhControlMode", "single") || "single");
      const _0x380c30 = _0x252d72(getNodeFieldValue(_0x58b434, "rhSingleControlPreset", "efficiency"));
      _0x11e815.querySelectorAll("[data-key=\"rhSingleControlPreset\"]").forEach(_0x411f64 => _0x411f64.classList.toggle("active", _0x382668 !== "multi" && _0x411f64.dataset.value === _0x380c30));
      _0x11e815.querySelectorAll("[data-key=\"rhControlMode\"]").forEach(_0x48861a => _0x48861a.classList.toggle("active", _0x382668 === "multi" && _0x48861a.dataset.value === "multi"));
      _0x11e815.querySelector(".rh-adv-single-group")?.classList.toggle("active", _0x382668 !== "multi");
      _0x11e815.querySelector(".rh-adv-multi-group")?.classList.toggle("active", _0x382668 === "multi");
    }
    if (_0x11e815.classList?.contains("ui-schema-rh-v54-mask-expand")) {
      const _0x4c24bc = _0x3dd280(getNodeFieldValue(_0x58b434, "rhMaskExpand", _0x11e815.dataset.uiSchemaDefault || 25), Number(_0x11e815.dataset.uiSchemaDefault || 25));
      const _0x271d6d = _0x11e815.querySelector(".rh-stepper-value");
      if (_0x271d6d) {
        _0x271d6d.textContent = String(_0x4c24bc);
        _0x271d6d.setAttribute("aria-valuenow", String(_0x4c24bc));
      }
    }
    if (_0x11e815.classList?.contains("ui-schema-rh-v54-breast-jiggle")) {
      const _0x40d6e5 = _0x5dee02(getNodeFieldValue(_0x58b434, _0x56a34e, _0x11e815.dataset.uiSchemaDefault || 0), _0x41224b(_0x11e815));
      const _0x5efeac = _0x11e815.querySelector(".rh-breast-jiggle-slider");
      if (_0x5efeac) {
        _0x5efeac.value = _0x40d6e5;
      }
      const _0x527e52 = _0x11e815.querySelector(".rh-breast-jiggle-value");
      if (_0x527e52) {
        _0x527e52.textContent = _0x40d6e5;
      }
    }
  }
  function _0x857a9c(_0xfe85a2, _0x22871b = {}) {
    const _0x1e8c55 = String(_0xfe85a2?.dataset?.uiSchemaField || "").trim();
    if (!_0x1e8c55) {
      return "";
    }
    const _0x294092 = getNodeFieldValue(_0x22871b, _0x1e8c55, _0xfe85a2?.dataset?.uiSchemaDefault ?? "");
    const _0x5a9427 = _0x2accb3(_0xfe85a2, _0x294092);
    if (_0x5a9427?.dataset?.uiSchemaDisabled !== "true") {
      return _0x294092;
    }
    const _0x5907e1 = _0xfe85a2?.dataset?.uiSchemaDefault ?? "";
    const _0x73abfb = _0x2accb3(_0xfe85a2, _0x5907e1);
    if (_0x73abfb?.dataset?.uiSchemaDisabled !== "true") {
      return _0x5907e1;
    }
    const _0x2738e5 = _0x3b200a(_0xfe85a2);
    return _0x2738e5?.dataset?.uiSchemaValue ?? _0x294092;
  }
  function _0x4e3fef(_0x2627a3, _0x3ab029, {
    adaptive = false
  } = {}) {
    const _0x17e5d4 = _0x2accb3(_0x2627a3, _0x3ab029);
    const _0x14a0d0 = String(_0x17e5d4?.dataset?.uiSchemaOptionLabel || _0x17e5d4?.textContent || _0x3ab029 || "").trim();
    const _0x428c87 = _0x14a0d0.toLowerCase();
    const _0x55ec05 = String(_0x3ab029 || "").trim().toLowerCase();
    if (adaptive && (_0x428c87 === "auto" || _0x428c87 === "adaptive" || _0x428c87 === "自适应" || _0x55ec05 === "auto" || _0x55ec05 === "adaptive" || _0x55ec05 === "自适应")) {
      return "自适应";
    }
    return _0x14a0d0;
  }
  function _0xbfb374(_0x5f4fef, _0x12a045 = {}) {
    const _0x6902d4 = _0x5f4fef?.querySelector?.("[data-ui-schema-field=\"aspectRatio\"]") || _0x5f4fef?.querySelector?.("[data-ui-schema-display-role=\"aspectRatio\"]");
    const _0x169266 = _0x5f4fef?.querySelector?.("[data-ui-schema-field=\"imageSize\"]") || _0x5f4fef?.querySelector?.("[data-ui-schema-field=\"resolution\"]") || _0x5f4fef?.querySelector?.("[data-ui-schema-field=\"videoSize\"]") || _0x5f4fef?.querySelector?.("[data-ui-schema-field=\"quality\"]") || _0x5f4fef?.querySelector?.("[data-ui-schema-display-role=\"resolution\"]");
    const _0x165ff8 = Array.from(_0x5f4fef?.querySelectorAll?.("[data-ui-schema-field]") || []).filter(_0x312320 => _0x312320 !== _0x6902d4);
    if (_0x165ff8.length === 0 && _0x169266) {
      _0x165ff8.push(_0x169266);
    }
    const _0x498a6b = _0x5f4fef?.querySelector?.(".ui-schema-quality-ratio-label");
    if (!_0x165ff8.length || !_0x6902d4 || !_0x498a6b) {
      return;
    }
    const _0x458664 = _0x857a9c(_0x6902d4, _0x12a045);
    const _0x11a602 = _0x165ff8.map(_0x10b990 => _0x4e3fef(_0x10b990, _0x857a9c(_0x10b990, _0x12a045)));
    const _0x2fca44 = _0x4e3fef(_0x6902d4, _0x458664, {
      adaptive: true
    });
    _0x498a6b.textContent = _0x11a602.length > 1 ? [..._0x11a602, _0x2fca44].join(" · ") : String(_0x5f4fef?.dataset?.uiSchemaLabelOrder || "").trim() === "fieldFirst" ? (_0x11a602[0] || "") + " · " + _0x2fca44 : _0x2fca44 + " · " + (_0x11a602[0] || "");
  }
  function _0x5bca19(_0x3b835d, _0x15e482 = {}) {
    const _0x2882a1 = Array.from(_0x3b835d?.querySelectorAll?.("[data-ui-schema-field]") || []);
    const _0x5bbd5a = _0x3b835d?.querySelector?.(".ui-schema-section-pair-label");
    if (_0x2882a1.length < 2 || !_0x5bbd5a) {
      return;
    }
    const _0x4cbde4 = _0x2882a1.map(_0x103ed5 => _0x4e3fef(_0x103ed5, _0x857a9c(_0x103ed5, _0x15e482))).filter(Boolean);
    if (_0x4cbde4.length >= 2) {
      _0x5bbd5a.textContent = _0x4cbde4.join(" · ");
    }
  }
  function _0x1ff4cb(_0x1bc933, _0x561e94 = {}) {
    const _0x595c80 = _0x1bc933?.querySelector?.("[data-ui-schema-field=\"rhVideoResolution\"]") || _0x1bc933?.querySelector?.("[data-ui-schema-field=\"videoResolution\"]");
    const _0x2beb10 = _0x1bc933?.querySelector?.(".ui-schema-video-resolution-label");
    if (!_0x595c80 || !_0x2beb10) {
      return;
    }
    const _0x35beaf = _0x1bc933.querySelector("[data-ui-schema-field=\"rhVideoFps\"]");
    const _0x4e545c = _0x1bc933.querySelector("[data-ui-schema-field=\"rhVideoFrames\"]");
    const _0x30a71a = _0x857a9c(_0x595c80, _0x561e94);
    if (!_0x35beaf || !_0x4e545c) {
      _0x2beb10.textContent = _0x435bdd("分辨率", _0x30a71a);
      return;
    }
    const _0x3894ec = _0x857a9c(_0x35beaf, _0x561e94);
    const _0x437c6e = _0x857a9c(_0x4e545c, _0x561e94);
    const _0x194597 = Number(_0x437c6e) === 0 ? t("aigenImage.uiSchema.fullLength") : String(_0x437c6e || "");
    _0x2beb10.textContent = _0x44ecfc([["帧数", _0x194597], ["帧率", _0x3894ec], ["分辨率", _0x30a71a]]);
  }
  function _0x2bf770(_0x1b160e, _0x1b1618 = {}) {
    const _0x23c661 = _0x1b160e?.querySelector?.(".img-ratio-label");
    const _0x16b7f3 = Array.from(_0x1b160e?.querySelectorAll?.("[data-ui-schema-field]") || []).map(_0x16984d => ({
      id: _0x16984d.dataset.uiSchemaField,
      defaultValue: _0x16984d.dataset.uiSchemaDefault,
      min: _0x16984d.dataset.uiSchemaMin,
      max: _0x16984d.dataset.uiSchemaMax
    }));
    const _0x12d7a2 = _0x454533 => _0x16b7f3.find(_0x4129a7 => _0x4129a7.id === _0x454533);
    const _0x528d21 = _0x12d7a2("rhVideoResolution");
    const _0x4da9cb = _0x12d7a2("rhVideoFps");
    const _0x374f19 = _0x12d7a2("rhVideoFrames");
    const _0x1b0843 = _0x12d7a2("rhVideoSeconds");
    const _0x43b5ad = (_0x3509fb, _0x158939, _0x1717af = {}) => _0x3d6bf0(getNodeFieldValue(_0x1b1618, _0x3509fb?.id, _0x3509fb?.defaultValue ?? _0x158939), Number(_0x158939), _0x1717af);
    const _0x7d7205 = _0x528d21 ? _0x43b5ad(_0x528d21, _0x528d21.defaultValue || 832, {
      min: 832
    }) : 832;
    if (_0x23c661 && _0x1b0843) {
      const _0x299b5d = _0x4da9cb ? _0x43b5ad(_0x4da9cb, _0x4da9cb.defaultValue || 24) : 24;
      const _0x3ca0c5 = _0x43b5ad(_0x1b0843, _0x1b0843.defaultValue || 5, {
        min: Number(_0x1b0843.min || 1),
        max: Number(_0x1b0843.max || 600)
      });
      _0x23c661.textContent = _0x44ecfc([["秒数", _0x3ca0c5], ["帧率", _0x299b5d], ["分辨率", _0x7d7205]]);
    } else if (_0x23c661 && _0x374f19) {
      const _0x5f0494 = _0x43b5ad(_0x374f19, _0x374f19.defaultValue || 77, {
        min: Number(_0x374f19.min || 0),
        max: Number(_0x374f19.max || 999999)
      });
      const _0xff7cee = _0x5f0494 === 0 ? t("aigenImage.uiSchema.fullLength") : String(_0x5f0494);
      if (_0x4da9cb) {
        const _0x5f1351 = _0x43b5ad(_0x4da9cb, _0x4da9cb.defaultValue || 24);
        _0x23c661.textContent = _0x44ecfc([["帧数", _0xff7cee], ["帧率", _0x5f1351], ["分辨率", _0x7d7205]]);
      } else {
        _0x23c661.textContent = _0x44ecfc([["帧数", _0xff7cee], ["分辨率", _0x7d7205]]);
      }
    } else if (_0x23c661) {
      _0x23c661.textContent = _0x435bdd("分辨率", _0x7d7205);
    }
    const _0x9d691a = _0x1b160e?.querySelector?.("[data-ui-schema-field=\"rhVideoFrames\"] .rh-stepper-value");
    if (_0x374f19 && _0x9d691a) {
      const _0x4bc2f0 = _0x43b5ad(_0x374f19, _0x374f19.defaultValue || 77, {
        min: Number(_0x374f19.min || 0),
        max: Number(_0x374f19.max || 999999)
      });
      _0x9d691a.textContent = _0x4bc2f0 === 0 ? t("aigenImage.uiSchema.fullLength") : String(_0x4bc2f0);
      _0x9d691a.setAttribute("aria-valuenow", String(_0x4bc2f0));
    }
    const _0x3bfc2f = _0x1b160e?.querySelector?.("[data-ui-schema-field=\"rhVideoSeconds\"] .rh-stepper-value");
    if (_0x1b0843 && _0x3bfc2f) {
      const _0x275a00 = _0x43b5ad(_0x1b0843, _0x1b0843.defaultValue || 5, {
        min: Number(_0x1b0843.min || 1),
        max: Number(_0x1b0843.max || 600)
      });
      _0x3bfc2f.textContent = String(_0x275a00);
      _0x3bfc2f.setAttribute("aria-valuenow", String(_0x275a00));
    }
    const _0x3b1962 = _0x1b160e?.querySelector?.(".rh-v5-source-framecount");
    if (_0x3b1962) {
      const _0x5cfed2 = Number(_0x1b1618?.rhVideoSourceFrameCount || 0);
      _0x3b1962.textContent = _0x5cfed2 ? String(_0x5cfed2) : "—";
    }
  }
  function _0x23263f(_0x491fbe, _0x1c737f = {}) {
    const _0x3c7748 = String(_0x491fbe?.dataset?.uiSchemaPrimaryField || "voiceType").trim();
    const _0xff1083 = String(_0x491fbe?.dataset?.uiSchemaSecondaryField || "speakerId").trim();
    const _0x247f76 = String(_0x491fbe?.dataset?.uiSchemaModeField || "voiceMode").trim();
    const _0x3f7483 = String(_0x491fbe?.dataset?.uiSchemaDefaultModeValue || "default").trim();
    const _0x314da4 = String(_0x491fbe?.dataset?.uiSchemaCustomModeValue || "custom").trim();
    const _0x4be653 = _0x491fbe?.querySelector?.(".img-rp-voice-default-area");
    const _0xac46dd = _0x491fbe?.querySelector?.(".img-rp-voice-custom-area");
    const _0x4894fa = _0x491fbe?.querySelector?.(".ui-schema-voice-quality-ratio-label");
    if (!_0x4be653 || !_0xac46dd || !_0x4894fa) {
      return;
    }
    const _0x2859a2 = _0x4be653.dataset.uiSchemaDefault ? getNodeFieldValue(_0x1c737f, _0x3c7748) ?? _0x4be653.dataset.uiSchemaDefault : getNodeFieldValue(_0x1c737f, _0x3c7748);
    const _0xfacdeb = String(getNodeFieldValue(_0x1c737f, _0xff1083) || "").trim();
    const _0x24ac90 = String(getNodeFieldValue(_0x1c737f, _0x247f76, "") || "").trim();
    const _0xa519d4 = _0x4be653.dataset.uiSchemaDefault ? _0x4e3fef(_0x4be653, _0x2859a2) ?? "" : "";
    const _0x529d74 = resolveAudioVoiceCompositeState({
      voiceTypeValue: _0x2859a2,
      voiceTypeLabel: _0xa519d4 || _0x3f7483,
      speakerIdValue: _0xfacdeb,
      voiceModeValue: _0x24ac90,
      defaultModeValue: _0x3f7483,
      customModeValue: _0x314da4
    });
    _0x4be653.classList.toggle("is-disabled", _0x529d74.defaultAreaDisabled);
    _0xac46dd.classList.toggle("is-disabled", _0x529d74.customAreaDisabled);
    _0x4894fa.textContent = _0x529d74.triggerLabel;
  }
  function _0x239ce6(_0x2050f1, _0x53dbbb = {}) {
    _0x2050f1.querySelectorAll("[data-ui-schema-composite-field=\"qualityRatio\"]").forEach(_0x372fe5 => _0xbfb374(_0x372fe5, _0x53dbbb));
    _0x2050f1.querySelectorAll("[data-ui-schema-composite-field=\"sectionPair\"]").forEach(_0x27a56f => _0x5bca19(_0x27a56f, _0x53dbbb));
    _0x2050f1.querySelectorAll("[data-ui-schema-composite-field=\"videoResolution\"]").forEach(_0x59fc07 => _0x1ff4cb(_0x59fc07, _0x53dbbb));
    _0x2050f1.querySelectorAll("[data-ui-schema-composite-field=\"rhVideoParams\"]").forEach(_0x4171ed => _0x2bf770(_0x4171ed, _0x53dbbb));
    _0x2050f1.querySelectorAll("[data-ui-schema-composite-field=\"voiceQualityRatio\"]").forEach(_0x3a1b2e => _0x23263f(_0x3a1b2e, _0x53dbbb));
  }
  function _0x1f21eb(_0x5074f6, _0x42e7a7 = {}) {
    if (!_0x5074f6) {
      return;
    }
    _0x29b991(_0x5074f6, _0x42e7a7);
    _0x5074f6.querySelectorAll("[data-ui-schema-field]").forEach(_0x241f0b => {
      const _0x30293c = String(_0x241f0b.dataset.uiSchemaField || "").trim();
      if (!_0x30293c) {
        return;
      }
      let _0x237267 = getNodeFieldValue(_0x42e7a7, _0x30293c, _0x241f0b.dataset.uiSchemaDefault);
      const _0x54cee3 = String(_0x241f0b.dataset.uiSchemaDefaultAliases || "").trim();
      if (_0x54cee3) {
        try {
          const _0x367046 = JSON.parse(_0x54cee3).map(_0x289285 => String(_0x289285 ?? "").trim().toLowerCase()).filter(Boolean);
          if (_0x367046.includes(String(_0x237267 ?? "").trim().toLowerCase())) {
            _0x237267 = _0x241f0b.dataset.uiSchemaDefault;
          }
        } catch {}
      }
      const _0x11a52b = _0x2accb3(_0x241f0b, _0x237267);
      if (_0x11a52b?.dataset?.uiSchemaDisabled === "true") {
        const _0x8c702c = _0x241f0b.dataset.uiSchemaDefault;
        const _0x283887 = _0x2accb3(_0x241f0b, _0x8c702c);
        const _0x36aa8c = _0x283887?.dataset?.uiSchemaDisabled === "true" ? _0x3b200a(_0x241f0b) : _0x283887;
        if (_0x36aa8c?.dataset?.uiSchemaValue !== undefined) {
          _0x237267 = _0x36aa8c.dataset.uiSchemaValue;
        }
      }
      _0x296820(_0x241f0b).forEach(_0x4aa8ff => {
        _0x4aa8ff.classList.toggle("active", String(_0x4aa8ff.dataset.uiSchemaValue) === String(_0x237267));
      });
      const _0x2e2702 = _0x2accb3(_0x241f0b, _0x237267);
      const _0x20b54b = _0x241f0b.querySelector(".ui-schema-pill-label");
      if (_0x20b54b && _0x2e2702?.dataset?.uiSchemaOptionLabel) {
        _0x20b54b.textContent = _0x2e2702.dataset.uiSchemaOptionLabel;
      }
      _0x408354(_0x241f0b, _0x237267);
      _0x5c35ea(_0x241f0b, _0x237267);
      _0xbd1c15(_0x241f0b, _0x237267);
      const _0x4aee9f = _0x241f0b.querySelector("[data-ui-schema-input]");
      const _0x48ce38 = typeof document !== "undefined" ? document.activeElement : null;
      if (_0x4aee9f && _0x237267 !== undefined && _0x48ce38 !== _0x4aee9f) {
        const _0x378cae = String(_0x241f0b.dataset.uiSchemaType || "").trim().toLowerCase();
        const _0x258789 = _0x378cae === "text" || _0x378cae === "textarea" || String(_0x4aee9f.tagName || "").trim().toLowerCase() === "textarea" || String(_0x4aee9f.type || "").trim().toLowerCase() === "text";
        if (!_0x258789) {
          const _0x42441f = _0x17911c(_0x241f0b);
          const _0xfacdb2 = _0x301261(_0x42441f, _0x237267);
          _0x4aee9f.value = _0x42441f?.length ? String(Math.max(0, _0xfacdb2)) : String(_0x237267);
        }
        const _0x210068 = _0x241f0b.querySelector(".ui-schema-value");
        if (_0x210068) {
          _0x210068.textContent = String(_0x237267);
        }
      }
      _0xbe2b73(_0x241f0b, _0x42e7a7);
      _0x4028fa(_0x241f0b, _0x42e7a7);
    });
    _0x239ce6(_0x5074f6, _0x42e7a7);
  }
  return Object.freeze({
    syncModelUiSchemaControls: _0x1f21eb
  });
}