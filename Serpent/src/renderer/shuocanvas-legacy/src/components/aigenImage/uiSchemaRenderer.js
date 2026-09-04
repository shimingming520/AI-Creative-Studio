import { getModelManifest, normalizeUiSchemaFieldValue, sanitizeModelUiSchemaParams } from "../../manifests/index.js";
import { configureUiSchemaFieldAdapter, getUiSchemaFieldAdapterDefinition, resolveUiSchemaControlAdapter, resolveUiSchemaControlAdapterDefinition, resolveUiSchemaFieldAdapter, resolveUiSchemaFieldAdapterDefinition } from "./uiSchemaControlAdapters.js";
import { escapeHtmlAttr } from "./uiModuleModelHelpers.js";
import { resolveAudioVoiceCompositeState } from "./audioVoiceCompositeState.js";
import { t } from "../../i18n/index.js";
import { translateManifestText } from "../../i18n/manifestText.js";
import { openExternalLink } from "../../services/externalLinkService.js";
import { createUiSchemaBindingSession } from "./uiSchemaBindingSession.js";
import { renderRunningHubInstanceControl, syncRunningHubInstanceControl } from "./runningHubInstanceControl.js";
import { buildUiSchemaParamPatch as a338_0x2b9b64, createUiSchemaStateOwner, evaluateUiSchemaNumberExpression, filterVisibleUiSchemaFields, firstNonEmptyString, getNodeFieldValue, getOptionDisableRepairPatch, getRenderedOptionDisableWhen, getUiSchemaParamContext, optionDisableWhenMatches, uiSchemaConditionMatches } from "./uiSchemaStateOwner.js";
export { evaluateUiSchemaNumberExpression, sanitizeModelUiSchemaParams };
const SUPPORTED_CONTROL_TYPES = new Set(["segmented", "select", "slider", "stepper", "toggle", "text", "textarea", "image input", "video input", "audio input"]);
const ALLOWED_PLACEMENTS = new Set(["mode", "resolution", "advanced", "videoadvanced", "videoparams", "instance", "batch"]);
const RANDOM_SEED_DEFAULT_MIN = 0;
const RANDOM_SEED_DEFAULT_MAX = 2147483647;
const UI_SCHEMA_POPUP_EXIT_MS = 160;
function manifestText(_0x567e92) {
  return translateManifestText(_0x567e92);
}
function getDisplayLabelFromOption(_0x5be5d3, _0x548f3a = "") {
  return manifestText(_0x5be5d3?.displayLabel ?? _0x5be5d3?.selectedLabel ?? _0x5be5d3?.label ?? _0x548f3a);
}
function formatMetricLabel(_0x2ea568, _0x252fb6) {
  const _0x3a0f3d = manifestText(_0x2ea568);
  const _0x4f40d3 = String(_0x252fb6 ?? "");
  if (_0x3a0f3d === String(_0x2ea568)) {
    return "" + _0x3a0f3d + _0x4f40d3;
  } else {
    return _0x3a0f3d + " " + _0x4f40d3;
  }
}
function joinMetricLabels(_0x2d18cc) {
  return _0x2d18cc.filter(_0x5c0fe7 => Array.isArray(_0x5c0fe7) && _0x5c0fe7.length >= 2 && _0x5c0fe7[1] !== "").map(([_0x10ea62, _0x28fdb4]) => formatMetricLabel(_0x10ea62, _0x28fdb4)).join("·");
}
function getUiSchemaValueOptions(_0x2d0f6a) {
  return Array.from(_0x2d0f6a?.querySelectorAll?.("[data-ui-schema-value]") || []);
}
function findUiSchemaValueOption(_0x2cd7ea, _0x123976) {
  const _0x5a492d = String(_0x123976 ?? "");
  return getUiSchemaValueOptions(_0x2cd7ea).find(_0x274898 => String(_0x274898?.dataset?.uiSchemaValue ?? "") === _0x5a492d) || null;
}
function findFirstEnabledUiSchemaValueOption(_0x348dad) {
  return getUiSchemaValueOptions(_0x348dad).find(_0x3e89c6 => _0x3e89c6?.dataset?.uiSchemaDisabled !== "true") || null;
}
function normalizePlacement(_0x3ca548) {
  const _0x189c66 = String(_0x3ca548 || "").trim().toLowerCase();
  if (ALLOWED_PLACEMENTS.has(_0x189c66)) {
    return _0x189c66;
  } else {
    return "";
  }
}
function filterUiSchemaFields(_0x3b186a, {
  placement: _0x332708,
  excludeFieldIds: _0x15b073,
  ignorePlacementFilter = false
} = {}) {
  if (!Array.isArray(_0x3b186a)) {
    return [];
  }
  const _0x2128fb = String(_0x332708 ?? "").trim() !== "";
  const _0x1853c8 = normalizePlacement(_0x332708);
  const _0x1dfb03 = new Set((Array.isArray(_0x15b073) ? _0x15b073 : []).map(_0x313464 => String(_0x313464 || "").trim()));
  return _0x3b186a.filter(_0x41a6b2 => {
    const _0x41e2d6 = String(_0x41a6b2?.id || "").trim();
    if (_0x1dfb03.has(_0x41e2d6)) {
      return false;
    }
    if (_0x2128fb && !_0x1853c8 && !ignorePlacementFilter) {
      return false;
    }
    if (!_0x1853c8 || ignorePlacementFilter) {
      return true;
    }
    return normalizePlacement(_0x41a6b2?.placement) === _0x1853c8;
  });
}
function getUiSchemaFields(_0x812df, {
  placement: _0x6ef37f,
  excludeFieldIds: _0x323727
} = {}) {
  const _0x1480ed = getModelManifest(_0x812df);
  return filterUiSchemaFields(_0x1480ed?.uiSchema?.fields, {
    placement: _0x6ef37f,
    excludeFieldIds: _0x323727
  });
}
function assertSupportedField(_0x27129d) {
  const _0x4b866c = String(_0x27129d?.id || "").trim();
  const _0x14fd1d = normalizeControlType(_0x27129d?.type);
  if (!_0x4b866c) {
    throw new Error("[uiSchema] field id is required");
  }
  if (!SUPPORTED_CONTROL_TYPES.has(_0x14fd1d)) {
    throw new Error("[uiSchema] unsupported control type for " + _0x4b866c + ": " + _0x27129d?.type);
  }
  if (_0x27129d?.defaultValue === undefined) {
    throw new Error("[uiSchema] defaultValue is required for " + _0x4b866c);
  }
  if ((_0x14fd1d === "segmented" || _0x14fd1d === "select") && (!Array.isArray(_0x27129d?.options) || _0x27129d.options.length === 0)) {
    throw new Error("[uiSchema] options are required for " + _0x4b866c);
  }
}
function getFieldValue(_0x4444cf, _0x5f0120) {
  const _0x2d033d = String(_0x5f0120?.id || "").trim();
  if (!_0x2d033d) {
    return _0x5f0120?.defaultValue ?? "";
  }
  const _0x3882e9 = getUiSchemaParamContext(_0x4444cf);
  const _0x460e4f = _0x4444cf?.generationParams;
  if (_0x460e4f && typeof _0x460e4f === "object" && !Array.isArray(_0x460e4f) && _0x460e4f[_0x2d033d] !== undefined) {
    return normalizeUiSchemaFieldValue(_0x5f0120, _0x460e4f[_0x2d033d], {
      params: _0x3882e9
    });
  }
  if (_0x4444cf && typeof _0x4444cf === "object" && !Array.isArray(_0x4444cf) && _0x4444cf[_0x2d033d] !== undefined) {
    return normalizeUiSchemaFieldValue(_0x5f0120, _0x4444cf[_0x2d033d], {
      params: _0x3882e9
    });
  }
  return normalizeUiSchemaFieldValue(_0x5f0120, _0x5f0120?.defaultValue, {
    params: _0x3882e9
  });
}
function normalizeControlType(_0xc980ed) {
  return String(_0xc980ed || "").trim().toLowerCase();
}
function getRenderableOptions(_0x2a33c9) {
  const _0x118a6a = Array.isArray(_0x2a33c9?.options) ? _0x2a33c9.options : [];
  const _0x34f6c1 = Array.isArray(_0x2a33c9?.advancedOptions) && globalThis.window?.ADVANCED_MODE ? _0x2a33c9.advancedOptions : [];
  const _0x22e2ed = Array.isArray(_0x2a33c9?.developerOptions) && globalThis.window?.DEV_MODE === true ? _0x2a33c9.developerOptions : [];
  return [..._0x118a6a, ..._0x34f6c1, ..._0x22e2ed];
}
function getOptionHideWhen(_0x5a9956) {
  if (!_0x5a9956 || typeof _0x5a9956 !== "object" || Array.isArray(_0x5a9956)) {
    return null;
  }
  const _0x1f70c0 = _0x5a9956.hideWhen;
  if (_0x1f70c0 && (Array.isArray(_0x1f70c0) || typeof _0x1f70c0 === "object" && !Array.isArray(_0x1f70c0))) {
    return _0x1f70c0;
  } else {
    return null;
  }
}
function isOptionHidden(_0x193ea2, _0x444b51 = {}) {
  if (_0x193ea2?.hidden === true) {
    return true;
  }
  const _0x37997d = getOptionHideWhen(_0x193ea2);
  if (_0x37997d) {
    return uiSchemaConditionMatches(_0x37997d, _0x444b51);
  } else {
    return false;
  }
}
function getVisibleOptions(_0x52c819, _0x20c592 = {}) {
  return getRenderableOptions(_0x52c819).filter(_0x1369f3 => !isOptionHidden(_0x1369f3, _0x20c592));
}
function renderOptions(_0x1a4034, _0x45aad9, _0xab81a5 = {}) {
  const _0x39f260 = getVisibleOptions(_0x1a4034, _0xab81a5);
  return _0x39f260.map(_0x4a0744 => {
    const _0x8eeb08 = _0x4a0744 && typeof _0x4a0744 === "object" && !Array.isArray(_0x4a0744);
    const _0x18180c = String(_0x8eeb08 ? _0x4a0744.value ?? "" : _0x4a0744);
    const _0x572065 = manifestText(_0x8eeb08 ? _0x4a0744.label ?? _0x18180c : _0x18180c);
    const _0x3a0425 = manifestText(_0x8eeb08 ? _0x4a0744.tooltip || "" : "").trim();
    const _0x40ae5c = String(_0x45aad9 ?? "") === _0x18180c;
    const _0x3cb1c0 = isOptionDisabled(_0x1a4034, _0x4a0744, _0xab81a5);
    const _0x48035d = _0x3a0425 ? " title=\"" + escapeHtmlAttr(_0x3a0425) + "\" data-tooltip=\"" + escapeHtmlAttr(_0x3a0425) + "\"" : "";
    return "<button type=\"button\" class=\"img-rp-quality-item ui-schema-option " + (_0x40ae5c ? "active" : "") + " " + (_0x3cb1c0 ? "disabled" : "") + "\" data-ui-schema-value=\"" + escapeHtmlAttr(_0x18180c) + "\"" + _0x48035d + getOptionDisabledAttrs(_0x1a4034, _0x4a0744, {
      nodeData: _0xab81a5
    }) + ">" + escapeHtmlAttr(_0x572065) + "</button>";
  }).join("");
}
function renderControl(_0x261d27, _0x423a8e, _0x4cf3f9, _0x513bdc = {}) {
  const _0x48cf9b = {
    renderSegmentedControl: () => {
      if (_0x513bdc?.advanced) {
        return renderAdvancedSelectionControl(_0x261d27, _0x423a8e, _0x513bdc?.nodeData || {});
      }
      const _0x129067 = _0x513bdc?.advanced ? " rh-adv-seg rh-v5-fps-seg" : "";
      return "<div class=\"img-rp-quality-segmented ui-schema-segmented" + _0x129067 + "\">" + renderOptions(_0x261d27, _0x423a8e, _0x513bdc?.nodeData || {}) + "</div>";
    },
    renderSelectControl: () => renderSelect(_0x261d27, _0x423a8e, _0x513bdc?.nodeData || {}),
    renderRangeControl: () => renderRange(_0x261d27, _0x423a8e, _0x4cf3f9, _0x513bdc?.nodeData || {}),
    renderToggleControl: () => renderAdvancedSelectionControl(_0x261d27, _0x423a8e, _0x513bdc?.nodeData || {}),
    renderTextControl: () => renderTextInput(_0x261d27, _0x423a8e, _0x4cf3f9, _0x513bdc?.nodeData),
    renderAssetInputControl: () => renderAssetInput(_0x261d27, _0x4cf3f9)
  };
  const _0x159e6e = resolveUiSchemaControlAdapterDefinition(_0x4cf3f9);
  if (_0x159e6e && typeof _0x159e6e.render === "function") {
    return _0x159e6e.render({
      field: _0x261d27,
      value: _0x423a8e,
      type: _0x4cf3f9,
      nodeData: _0x513bdc?.nodeData || {},
      options: _0x513bdc,
      helpers: {
        renderAdvancedSelectionControl: renderAdvancedSelectionControl,
        renderAssetInput: renderAssetInput,
        renderRange: renderRange,
        renderSelect: renderSelect,
        renderTextInput: renderTextInput
      }
    });
  }
  return _0x48cf9b[_0x159e6e?.renderer || resolveUiSchemaControlAdapter(_0x4cf3f9)]();
}
function getOptionLabel(_0x401c53, _0xa37a86) {
  const _0x350e9f = getRenderableOptions(_0x401c53);
  const _0x5d4c6d = String(_0xa37a86 ?? "");
  const _0x530a63 = _0x350e9f.find(_0x43f1e6 => String(_0x43f1e6?.value ?? _0x43f1e6) === _0x5d4c6d);
  return getDisplayLabelFromOption(_0x530a63, _0x5d4c6d);
}
function getFieldById(_0x5dad5a, _0x2ad11f) {
  return (Array.isArray(_0x5dad5a) ? _0x5dad5a : []).find(_0x70aac8 => String(_0x70aac8?.id || "").trim() === _0x2ad11f);
}
function getFieldByDisplayRole(_0x18e6d9, _0x2abc1d) {
  const _0x1008ae = String(_0x2abc1d || "").trim();
  if (!_0x1008ae) {
    return null;
  }
  return (Array.isArray(_0x18e6d9) ? _0x18e6d9 : []).find(_0x40a58a => String(_0x40a58a?.displayRole || "").trim() === _0x1008ae);
}
function getOptionValue(_0x41a44f) {
  return String(_0x41a44f?.value ?? _0x41a44f);
}
function isFieldDisabled(_0x2fdad4) {
  return _0x2fdad4?.disabled === true || _0x2fdad4?.readOnly === true;
}
function isFieldDisabledByCondition(_0x335bb0, _0x1c9bba) {
  if (!_0x335bb0 || !_0x1c9bba) {
    return false;
  }
  const _0x59c883 = _0x335bb0?.disableWhen;
  if (!_0x59c883 || typeof _0x59c883 !== "object") {
    return false;
  }
  return optionDisableWhenMatches(_0x59c883, _0x1c9bba);
}
function isFieldDisabledByUiState(_0x6e1ef1, _0x2f20ca) {
  const _0x17a9cb = String(_0x6e1ef1?.id || "").trim();
  if (!_0x17a9cb || !_0x2f20ca) {
    return false;
  }
  const _0x36e578 = _0x2f20ca?.uiSchemaFieldState?.[_0x17a9cb];
  return _0x36e578 === true || _0x36e578?.disabled === true || _0x36e578?.readOnly === true;
}
function resolveFieldDisabled(_0x10e5ed, _0x4ad6d5) {
  if (!_0x10e5ed) {
    return false;
  }
  if (isFieldDisabled(_0x10e5ed)) {
    return true;
  }
  return isFieldDisabledByUiState(_0x10e5ed, _0x4ad6d5 || {}) || isFieldDisabledByCondition(_0x10e5ed, _0x4ad6d5 || {});
}
function getOptionDisableWhen(_0x27f4f0) {
  if (!_0x27f4f0 || typeof _0x27f4f0 !== "object" || Array.isArray(_0x27f4f0)) {
    return null;
  }
  const _0x176191 = _0x27f4f0.disableWhen || _0x27f4f0.disabledWhen;
  if (_0x176191 && (Array.isArray(_0x176191) || typeof _0x176191 === "object" && !Array.isArray(_0x176191))) {
    return _0x176191;
  } else {
    return null;
  }
}
function getOptionDisableWhenAttrs(_0x49c51f) {
  const _0x27f8c3 = getOptionDisableWhen(_0x49c51f);
  if (!_0x27f8c3) {
    return "";
  }
  if (Array.isArray(_0x27f8c3) || Array.isArray(_0x27f8c3.any) || Array.isArray(_0x27f8c3.all) || _0x27f8c3.not === true) {
    return " data-ui-schema-disable-when-json=\"" + escapeHtmlAttr(JSON.stringify(_0x27f8c3)) + "\"";
  }
  const _0x1a5fd2 = String(_0x27f8c3.field || _0x27f8c3.param || "").trim();
  const _0x42f0b6 = _0x27f8c3.values !== undefined ? _0x27f8c3.values : _0x27f8c3.value;
  const _0x364bd9 = Array.isArray(_0x42f0b6) ? _0x42f0b6 : [_0x42f0b6];
  if (!_0x1a5fd2 || _0x364bd9.length === 0) {
    return "";
  }
  return " data-ui-schema-disable-when-field=\"" + escapeHtmlAttr(_0x1a5fd2) + "\" data-ui-schema-disable-when-values=\"" + escapeHtmlAttr(_0x364bd9.join(",")) + "\"";
}
function getFieldDefaultAliasAttrs(_0x4e32d5) {
  const _0x4e05d2 = (Array.isArray(_0x4e32d5?.defaultValueAliases) ? _0x4e32d5.defaultValueAliases : []).map(_0x28a40e => String(_0x28a40e ?? "").trim()).filter(Boolean);
  if (_0x4e05d2.length) {
    return " data-ui-schema-default-aliases=\"" + escapeHtmlAttr(JSON.stringify(_0x4e05d2)) + "\"";
  } else {
    return "";
  }
}
function isOptionDisabled(_0x4265e2, _0x3651d5, _0x49b292 = {}) {
  const _0x46cbdb = getOptionDisableWhen(_0x3651d5);
  const _0x216e9d = optionDisableWhenMatches(_0x46cbdb, _0x49b292);
  const _0x15e628 = _0x216e9d ? getOptionDisableRepairPatch(_0x46cbdb, _0x49b292) : null;
  return resolveFieldDisabled(_0x4265e2, _0x49b292) || _0x3651d5 && typeof _0x3651d5 === "object" && !Array.isArray(_0x3651d5) && (_0x3651d5.disabled === true || _0x216e9d && !_0x15e628);
}
function getOptionDisabledAttrs(_0x3781f0, _0x57d47f, {
  button = true,
  nodeData = {}
} = {}) {
  const _0xe7835b = getOptionDisableWhenAttrs(_0x57d47f);
  const _0x36ad34 = isFieldDisabled(_0x3781f0) || _0x57d47f && typeof _0x57d47f === "object" && !Array.isArray(_0x57d47f) && _0x57d47f.disabled === true;
  const _0x4e9b07 = isOptionDisabled(_0x3781f0, _0x57d47f, nodeData);
  if (!_0x4e9b07) {
    return _0xe7835b;
  }
  const _0x34cffc = _0x36ad34 ? " data-ui-schema-static-disabled=\"true\"" : "";
  const _0x2d4cef = button ? " data-ui-schema-disabled=\"true\" disabled aria-disabled=\"true\"" : " data-ui-schema-disabled=\"true\" aria-disabled=\"true\"";
  return "" + _0xe7835b + _0x34cffc + _0x2d4cef;
}
function isAdaptiveRatioOption(_0x705bc9, _0x4df401) {
  const _0x34b058 = getOptionValue(_0x4df401).trim();
  const _0x3933a1 = String(_0x4df401?.label ?? _0x34b058).trim();
  const _0x33894c = _0x34b058.toLowerCase();
  const _0x30df77 = _0x3933a1.toLowerCase();
  return _0x33894c === "auto" || _0x33894c === "adaptive" || _0x33894c === "自适应" || _0x30df77 === "auto" || _0x30df77 === "adaptive" || _0x30df77 === "自适应" || _0x34b058 === String(_0x705bc9?.defaultValue ?? "") && _0x30df77 === "auto";
}
const BUILTIN_ADAPTIVE_RATIO_OPTION = Object.freeze({
  value: "自适应",
  label: "自适应"
});
function getRatioOptions(_0x20fd98, _0x5d55d6 = {}) {
  const _0x4b6b93 = getVisibleOptions(_0x20fd98, _0x5d55d6);
  if (_0x4b6b93.some(_0x32eea6 => isAdaptiveRatioOption(_0x20fd98, _0x32eea6))) {
    return _0x4b6b93;
  } else {
    return [BUILTIN_ADAPTIVE_RATIO_OPTION, ..._0x4b6b93];
  }
}
function getRatioOptionLabel(_0x3c3169, _0x1fb04e) {
  const _0x58fc30 = getRenderableOptions(_0x3c3169);
  const _0x1835bd = String(_0x1fb04e ?? "");
  const _0x184510 = _0x58fc30.find(_0x5f175c => getOptionValue(_0x5f175c) === _0x1835bd);
  if (_0x184510 && isAdaptiveRatioOption(_0x3c3169, _0x184510)) {
    return t("videoNode.parameterPanel.adaptive");
  }
  if (!_0x184510 && isAdaptiveRatioOption(_0x3c3169, _0x1835bd)) {
    return t("videoNode.parameterPanel.adaptive");
  }
  return getDisplayLabelFromOption(_0x184510, _0x1835bd);
}
function getRatioIconClass(_0x2cccf6) {
  const _0x470b2d = String(_0x2cccf6 || "").trim();
  const _0x116442 = {
    "1:1": "img-rp-sq",
    "9:16": "img-rp-tall",
    "16:9": "img-rp-wide",
    "3:4": "img-rp-p34",
    "4:3": "img-rp-l43",
    "1:4": "img-rp-p14",
    "4:1": "img-rp-l41",
    "1:8": "img-rp-p18",
    "8:1": "img-rp-l81",
    "3:2": "img-rp-l32",
    "2:3": "img-rp-p23",
    "5:4": "img-rp-l54",
    "4:5": "img-rp-p45",
    "21:9": "img-rp-ultra"
  };
  if (_0x116442[_0x470b2d]) {
    return _0x116442[_0x470b2d];
  }
  const _0x353241 = _0x470b2d.match(/^(\d+(?:\.\d+)?):(\d+(?:\.\d+)?)$/);
  if (!_0x353241) {
    return "img-rp-sq";
  }
  const _0x4c8f4d = Number(_0x353241[1]);
  const _0x3e2c31 = Number(_0x353241[2]);
  if (!Number.isFinite(_0x4c8f4d) || !Number.isFinite(_0x3e2c31) || _0x4c8f4d === _0x3e2c31) {
    return "img-rp-sq";
  }
  if (_0x4c8f4d > _0x3e2c31) {
    return "img-rp-wide";
  } else {
    return "img-rp-tall";
  }
}
function renderQualityButtons(_0x5422e9, _0x534935, _0xa038ff = {}) {
  assertSupportedField(_0x5422e9);
  const _0x519cf5 = _0x5422e9?.displayRole ? " data-ui-schema-display-role=\"" + escapeHtmlAttr(_0x5422e9.displayRole) + "\"" : "";
  const _0x1a5894 = String(_0x5422e9?.id || "").trim() === "imageSize" ? manifestText("画质") : manifestText(_0x5422e9?.label || "画质");
  const _0x160865 = manifestText(_0x5422e9?.description || _0x5422e9?.tooltip || "").trim();
  const _0x523cde = String(_0x5422e9?.variant || "").trim() === "sectionMenu" || _0x5422e9?.showInfoTip === true;
  const _0x468237 = _0x160865 && _0x523cde ? "<span class=\"rh-tip ui-schema-info-tip\" data-tooltip=\"" + escapeHtmlAttr(_0x160865) + "\">!</span>" : "";
  const _0x22da1e = getVisibleOptions(_0x5422e9, _0xa038ff);
  const _0x34e6ed = _0x22da1e.some(_0x28ecce => String(_0x28ecce?.groupLabel || _0x28ecce?.sectionLabel || "").trim());
  if (_0x34e6ed) {
    const _0xbb2997 = [];
    _0x22da1e.forEach(_0x357614 => {
      const _0x4b15d9 = manifestText(_0x357614?.groupLabel || _0x357614?.sectionLabel || _0x1a5894).trim();
      let _0x1c3cf6 = _0xbb2997.find(_0x1fa11b => _0x1fa11b.label === _0x4b15d9);
      if (!_0x1c3cf6) {
        _0x1c3cf6 = {
          label: _0x4b15d9,
          options: []
        };
        _0xbb2997.push(_0x1c3cf6);
      }
      _0x1c3cf6.options.push(_0x357614);
    });
    return "<div class=\"img-rp-quality-area\" data-ui-schema-field=\"" + escapeHtmlAttr(_0x5422e9.id) + "\" data-ui-schema-type=\"segmented\" data-ui-schema-default=\"" + escapeHtmlAttr(_0x5422e9?.defaultValue ?? "") + "\"" + _0x519cf5 + ">\n      " + _0xbb2997.map(_0x3ba112 => "<div class=\"img-rp-section-label\">" + escapeHtmlAttr(_0x3ba112.label) + (_0x3ba112.label === _0x1a5894 ? _0x468237 : "") + "</div>\n            <div class=\"img-rp-quality-segmented\">\n              " + _0x3ba112.options.map(_0xe2119f => {
      const _0x17cfcf = getOptionValue(_0xe2119f);
      const _0x55ba0a = manifestText(_0xe2119f?.label ?? _0x17cfcf);
      const _0x37bfd5 = getDisplayLabelFromOption(_0xe2119f, _0x55ba0a);
      const _0x3f9409 = String(_0x534935 ?? "") === _0x17cfcf;
      const _0x45a0c1 = isOptionDisabled(_0x5422e9, _0xe2119f, _0xa038ff);
      return "<button type=\"button\" class=\"img-rp-quality-item ui-schema-option " + (_0x3f9409 ? "active" : "") + " " + (_0x45a0c1 ? "disabled" : "") + "\" data-ui-schema-value=\"" + escapeHtmlAttr(_0x17cfcf) + "\" data-ui-schema-option-label=\"" + escapeHtmlAttr(_0x37bfd5) + "\"" + getOptionDisabledAttrs(_0x5422e9, _0xe2119f, {
        nodeData: _0xa038ff
      }) + ">" + escapeHtmlAttr(_0x55ba0a) + "</button>";
    }).join("") + "\n            </div>").join("") + "\n    </div>";
  }
  return "<div class=\"img-rp-quality-area\" data-ui-schema-field=\"" + escapeHtmlAttr(_0x5422e9.id) + "\" data-ui-schema-type=\"segmented\" data-ui-schema-default=\"" + escapeHtmlAttr(_0x5422e9?.defaultValue ?? "") + "\"" + _0x519cf5 + ">\n    <div class=\"img-rp-section-label\">" + escapeHtmlAttr(_0x1a5894) + _0x468237 + "</div>\n    <div class=\"img-rp-quality-segmented\">\n      " + _0x22da1e.map(_0x244981 => {
    const _0x876582 = getOptionValue(_0x244981);
    const _0x252348 = manifestText(_0x244981?.label ?? _0x876582);
    const _0x417666 = getDisplayLabelFromOption(_0x244981, _0x252348);
    const _0x4704fe = String(_0x534935 ?? "") === _0x876582;
    const _0x4ed6d9 = isOptionDisabled(_0x5422e9, _0x244981, _0xa038ff);
    return "<button type=\"button\" class=\"img-rp-quality-item ui-schema-option " + (_0x4704fe ? "active" : "") + " " + (_0x4ed6d9 ? "disabled" : "") + "\" data-ui-schema-value=\"" + escapeHtmlAttr(_0x876582) + "\" data-ui-schema-option-label=\"" + escapeHtmlAttr(_0x417666) + "\"" + getOptionDisabledAttrs(_0x5422e9, _0x244981, {
      nodeData: _0xa038ff
    }) + ">" + escapeHtmlAttr(_0x252348) + "</button>";
  }).join("") + "\n    </div>\n  </div>";
}
function renderSectionMenuField(_0x3c6799, _0x4a817a) {
  const _0x424419 = String(_0x3c6799?.id || "").trim();
  const _0x3c164b = getFieldValue(_0x4a817a, _0x3c6799);
  const _0x5849b2 = getOptionLabel(_0x3c6799, _0x3c164b);
  const _0xb7cfcf = resolveFieldDisabled(_0x3c6799, _0x4a817a) ? " disabled aria-disabled=\"true\" data-ui-schema-disabled=\"true\"" : "";
  return "<div class=\"ui-schema-field ui-schema-section-menu\" data-ui-schema-field=\"" + escapeHtmlAttr(_0x424419) + "\" data-ui-schema-type=\"segmented\" data-ui-schema-default=\"" + escapeHtmlAttr(_0x3c6799?.defaultValue ?? "") + "\">\n    <button type=\"button\" class=\"img-pill-btn ui-schema-menu-trigger\" data-ui-schema-menu-trigger=\"" + escapeHtmlAttr(_0x424419) + "\"" + _0xb7cfcf + ">\n      <span class=\"ui-schema-pill-label\">" + escapeHtmlAttr(_0x5849b2) + "</span>\n    </button>\n    <div class=\"img-ratio-popup ui-schema-popup ui-schema-section-menu-popup\" style=\"display:none;\">\n      " + renderQualityButtons(_0x3c6799, _0x3c164b, _0x4a817a) + "\n    </div>\n  </div>";
}
function renderRatioButtons(_0x3a50a3, _0x36905f, _0x265dd8 = {}) {
  assertSupportedField(_0x3a50a3);
  const _0x5832b6 = _0x3a50a3?.displayRole ? " data-ui-schema-display-role=\"" + escapeHtmlAttr(_0x3a50a3.displayRole) + "\"" : "";
  const _0x10be4d = getRatioOptions(_0x3a50a3, _0x265dd8);
  const _0xd7c916 = _0x10be4d.find(_0x474aca => isAdaptiveRatioOption(_0x3a50a3, _0x474aca));
  const _0xa8a3dc = _0x10be4d.filter(_0x318675 => !isAdaptiveRatioOption(_0x3a50a3, _0x318675));
  const _0x4ab6eb = String(_0x36905f ?? "");
  const _0x2ec35d = _0xd7c916 ? getOptionValue(_0xd7c916) : "";
  const _0x1d17a2 = _0xd7c916 ? getDisplayLabelFromOption(_0xd7c916, _0x2ec35d) : "";
  const _0x226b6c = _0xd7c916 && String(_0x4ab6eb) === String(_0x2ec35d);
  const _0x537f6c = _0xd7c916 ? "<button type=\"button\" class=\"img-rp-large-adaptive ui-schema-option " + (_0x226b6c ? "active" : "") + " " + (isOptionDisabled(_0x3a50a3, _0xd7c916, _0x265dd8) ? "disabled" : "") + "\" data-label=\"自适应\" data-ui-schema-value=\"" + escapeHtmlAttr(_0x2ec35d) + "\" data-ui-schema-option-label=\"" + escapeHtmlAttr(_0x1d17a2) + "\"" + getOptionDisabledAttrs(_0x3a50a3, _0xd7c916, {
    nodeData: _0x265dd8
  }) + ">\n        <svg width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"2\"/><path d=\"M3 9h18\"/><path d=\"M9 21V9\"/></svg>\n        <span>" + escapeHtmlAttr(t("videoNode.parameterPanel.adaptive")) + "</span>\n      </button>" : "";
  const _0xa3d8b7 = _0xd7c916 ? "img-rp-ratio-split has-adaptive" : "img-rp-ratio-split";
  return "<div class=\"img-rp-ratio-area\" data-ui-schema-field=\"" + escapeHtmlAttr(_0x3a50a3.id) + "\" data-ui-schema-type=\"segmented\" data-ui-schema-default=\"" + escapeHtmlAttr(_0x3a50a3?.defaultValue ?? "") + "\"" + _0x5832b6 + ">\n    <div class=\"img-rp-section-label\">" + escapeHtmlAttr(manifestText("比例")) + "</div>\n    <div class=\"" + _0xa3d8b7 + "\">\n      " + (_0xd7c916 ? "<div class=\"img-rp-ratio-left\">" + _0x537f6c + "</div>" : "") + "\n      <div class=\"img-rp-ratio-right\">\n        " + _0xa8a3dc.map(_0x44579e => {
    const _0x5e707f = getOptionValue(_0x44579e);
    const _0x5a57f8 = manifestText(_0x44579e?.label ?? _0x5e707f);
    const _0xcfbaaa = getDisplayLabelFromOption(_0x44579e, _0x5a57f8);
    const _0x42117c = _0x4ab6eb === _0x5e707f;
    const _0x554dad = isOptionDisabled(_0x3a50a3, _0x44579e, _0x265dd8);
    return "<button type=\"button\" class=\"img-rp-ratio-item ui-schema-option " + (_0x42117c ? "active" : "") + " " + (_0x554dad ? "disabled" : "") + "\" data-label=\"" + escapeHtmlAttr(_0x5e707f) + "\" data-ui-schema-value=\"" + escapeHtmlAttr(_0x5e707f) + "\" data-ui-schema-option-label=\"" + escapeHtmlAttr(_0xcfbaaa) + "\"" + getOptionDisabledAttrs(_0x3a50a3, _0x44579e, {
      nodeData: _0x265dd8
    }) + "><span class=\"img-rp-icon " + getRatioIconClass(_0x5e707f) + "\"></span><span>" + escapeHtmlAttr(_0x5a57f8) + "</span></button>";
  }).join("") + "\n      </div>\n    </div>\n  </div>";
}
function renderQualityRatioField(_0x35f8d2, _0x4de2e3, _0x152949) {
  const _0x54f286 = (Array.isArray(_0x35f8d2) ? _0x35f8d2 : [_0x35f8d2]).filter(Boolean);
  _0x54f286.forEach(assertSupportedField);
  assertSupportedField(_0x4de2e3);
  const _0x2edddb = getFieldValue(_0x152949, _0x4de2e3);
  const _0x36b726 = _0x54f286.map(_0x35124e => getOptionLabel(_0x35124e, getFieldValue(_0x152949, _0x35124e)));
  const _0x1d3307 = getRatioOptionLabel(_0x4de2e3, _0x2edddb);
  const _0x21138d = String(_0x54f286[0]?.qualityRatioLabelOrder || _0x54f286[0]?.compositeLabelOrder || "").trim();
  const _0x16e8fe = _0x36b726.length > 1 ? [..._0x36b726, _0x1d3307].join(" · ") : _0x21138d === "fieldFirst" ? (_0x36b726[0] || "") + " · " + _0x1d3307 : _0x1d3307 + " · " + (_0x36b726[0] || "");
  const _0x1d04d4 = _0x21138d ? " data-ui-schema-label-order=\"" + escapeHtmlAttr(_0x21138d) + "\"" : "";
  return "<div class=\"ui-schema-quality-ratio-pill\" data-ui-schema-composite-field=\"qualityRatio\"" + _0x1d04d4 + ">\n    <button type=\"button\" class=\"img-pill-btn ui-schema-menu-trigger\" data-ui-schema-menu-trigger=\"qualityRatio\">\n      <svg width=\"12\" height=\"12\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"2\"/><path d=\"M3 9h18\"/><path d=\"M9 21V9\"/></svg>\n      <span class=\"ui-schema-pill-label ui-schema-quality-ratio-label\">" + escapeHtmlAttr(_0x16e8fe) + "</span>\n    </button>\n    <div class=\"img-ratio-popup ui-schema-popup ui-schema-quality-ratio-popup\" style=\"display:none;\">\n      " + _0x54f286.map(_0x19ecd6 => renderQualityButtons(_0x19ecd6, getFieldValue(_0x152949, _0x19ecd6), _0x152949)).join("") + "\n      " + renderRatioButtons(_0x4de2e3, _0x2edddb, _0x152949) + "\n    </div>\n  </div>";
}
function renderAspectRatioPillField(_0x3a2dca, _0x48e03f) {
  assertSupportedField(_0x3a2dca);
  const _0x5a3bf5 = String(_0x3a2dca?.id || "").trim();
  const _0x31c89e = getFieldValue(_0x48e03f, _0x3a2dca);
  const _0x3064d8 = getRatioOptionLabel(_0x3a2dca, _0x31c89e);
  const _0x4965c0 = resolveFieldDisabled(_0x3a2dca, _0x48e03f) ? " disabled aria-disabled=\"true\" data-ui-schema-disabled=\"true\"" : "";
  return "<div class=\"ui-schema-aspect-ratio-pill\" data-ui-schema-field=\"" + escapeHtmlAttr(_0x5a3bf5) + "\" data-ui-schema-type=\"segmented\" data-ui-schema-default=\"" + escapeHtmlAttr(_0x3a2dca?.defaultValue ?? "") + "\">\n    <button type=\"button\" class=\"img-pill-btn ui-schema-menu-trigger\" data-ui-schema-menu-trigger=\"" + escapeHtmlAttr(_0x5a3bf5) + "\"" + _0x4965c0 + ">\n      <svg width=\"12\" height=\"12\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"2\"/><path d=\"M3 9h18\"/><path d=\"M9 21V9\"/></svg>\n      <span class=\"ui-schema-pill-label ui-schema-aspect-ratio-label\">" + escapeHtmlAttr(_0x3064d8) + "</span>\n    </button>\n    <div class=\"img-ratio-popup ui-schema-popup ui-schema-aspect-ratio-popup\" style=\"display:none;\">\n      " + renderRatioButtons(_0x3a2dca, _0x31c89e, _0x48e03f) + "\n    </div>\n  </div>";
}
function getVoiceCompositeModeField(_0x3a6e78 = {}, _0x38f9ec = {}) {
  return firstNonEmptyString(_0x3a6e78?.modeField, _0x38f9ec?.modeField, _0x3a6e78?.voiceModeField, _0x38f9ec?.voiceModeField, "voiceMode");
}
function getVoiceCompositeDefaultModeValue(_0x24cc23 = {}, _0x3163b0 = {}) {
  return firstNonEmptyString(_0x24cc23?.modeValue, _0x24cc23?.defaultModeValue, _0x3163b0?.defaultModeValue, "default");
}
function getVoiceCompositeCustomModeValue(_0x463627 = {}, _0x10b99d = {}) {
  return firstNonEmptyString(_0x10b99d?.modeValue, _0x10b99d?.filledModeValue, _0x10b99d?.customModeValue, _0x463627?.customModeValue, "custom");
}
function renderVoiceQualityRatioField(_0x327332, _0x5df374) {
  const _0xefe43a = (Array.isArray(_0x327332) ? _0x327332 : []).filter(Boolean);
  if (_0xefe43a.length < 2) {
    return "";
  }
  const _0x2c77a2 = _0xefe43a[0];
  const _0x2c3481 = _0xefe43a[1];
  assertSupportedField(_0x2c77a2);
  assertSupportedField(_0x2c3481);
  const _0x10112a = getVoiceCompositeModeField(_0x2c77a2, _0x2c3481);
  const _0x4c20ee = getVoiceCompositeDefaultModeValue(_0x2c77a2, _0x2c3481);
  const _0x313913 = getVoiceCompositeCustomModeValue(_0x2c77a2, _0x2c3481);
  const _0xec7b65 = getFieldValue(_0x5df374, _0x2c77a2);
  const _0x5432e3 = String(getFieldValue(_0x5df374, _0x2c3481) || "").trim();
  const _0x1e49fc = _0x10112a ? String(getNodeFieldValue(_0x5df374, _0x10112a, "") || "").trim() : "";
  const _0x481262 = getOptionLabel(_0x2c77a2, _0xec7b65);
  const _0x449b71 = resolveAudioVoiceCompositeState({
    voiceTypeValue: _0xec7b65,
    voiceTypeLabel: _0x481262,
    speakerIdValue: _0x5432e3,
    voiceModeValue: _0x1e49fc,
    defaultModeValue: _0x4c20ee,
    customModeValue: _0x313913
  });
  const _0x5e8be2 = _0x449b71.speakerIdValue;
  const _0x2b8455 = _0x449b71.triggerLabel;
  const _0x29c62e = _0x449b71.customAreaClassName;
  const _0x3b2d56 = _0x449b71.defaultAreaClassName;
  const _0x5cafd7 = manifestText(_0x2c3481?.label || "自定义音色ID");
  const _0x363814 = String(_0x2c3481?.placeholder || "留空使用预设音色").trim();
  const _0x4922be = String(_0x2c3481?.helpUrl || "").trim();
  const _0xeb8ba6 = _0x4922be ? "<span class=\"rh-tip ui-schema-info-tip\" data-tooltip=\"" + escapeHtmlAttr(_0x2c3481?.description || "填写后覆盖预设音色，默认音色将不可选。点击旁边链接可跳转音色库获取完整音色ID。") + "\">!</span><a href=\"#\" class=\"ui-schema-help-link img-rp-voice-help-link\" data-ui-schema-field-help-url=\"" + escapeHtmlAttr(_0x4922be) + "\" title=\"打开火山音色库\" onclick=\"return false;\"><svg width=\"12\" height=\"12\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><path d=\"M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6\"/><polyline points=\"15 3 21 3 21 9\"/><line x1=\"10\" y1=\"14\" x2=\"21\" y2=\"3\"/></svg></a>" : "";
  const _0x179382 = "<div class=\"img-rp-quality-area img-rp-voice-custom-area" + _0x29c62e + "\" data-ui-schema-field=\"" + escapeHtmlAttr(_0x2c3481.id) + "\" data-ui-schema-type=\"text\" data-ui-schema-default=\"" + escapeHtmlAttr(_0x2c3481?.defaultValue ?? "") + "\">\n      <div class=\"img-rp-section-label\">" + escapeHtmlAttr(_0x5cafd7) + _0xeb8ba6 + "</div>\n      <div class=\"img-rp-voice-input-wrap\">\n        <input type=\"text\" class=\"img-rp-voice-input\" data-ui-schema-input=\"" + escapeHtmlAttr(_0x2c3481.id) + "\" data-ui-schema-field=\"" + escapeHtmlAttr(_0x2c3481.id) + "\" data-ui-schema-value=\"" + escapeHtmlAttr(_0x5e8be2) + "\" placeholder=\"" + escapeHtmlAttr(_0x363814) + "\" value=\"" + escapeHtmlAttr(_0x5e8be2) + "\" />\n      </div>\n    </div>";
  const _0x495fac = manifestText(_0x2c77a2?.label || "默认音色");
  const _0x53070d = getVisibleOptions(_0x2c77a2, _0x5df374);
  const _0x1d67b6 = _0x53070d.map(_0x3c0931 => {
    const _0x2e9daa = getOptionValue(_0x3c0931);
    const _0x50e356 = manifestText(_0x3c0931?.label ?? _0x2e9daa);
    const _0x5ba746 = String(_0xec7b65 ?? "") === String(_0x2e9daa);
    return "<button type=\"button\" class=\"img-rp-ratio-item ui-schema-option " + (_0x5ba746 ? "active" : "") + "\" data-label=\"" + escapeHtmlAttr(_0x2e9daa) + "\" data-ui-schema-value=\"" + escapeHtmlAttr(_0x2e9daa) + "\"><span>" + escapeHtmlAttr(_0x50e356) + "</span></button>";
  }).join("");
  const _0x3f3300 = "<div class=\"img-rp-ratio-area img-rp-voice-default-area" + _0x3b2d56 + "\" data-ui-schema-field=\"" + escapeHtmlAttr(_0x2c77a2.id) + "\" data-ui-schema-type=\"segmented\" data-ui-schema-default=\"" + escapeHtmlAttr(_0x2c77a2?.defaultValue ?? "") + "\">\n      <div class=\"img-rp-section-label\">" + escapeHtmlAttr(_0x495fac) + "</div>\n      <div class=\"img-rp-ratio-split\">\n        <div class=\"img-rp-ratio-right\">\n          " + _0x1d67b6 + "\n        </div>\n      </div>\n    </div>";
  return "<div class=\"ui-schema-voice-quality-ratio-pill\" data-ui-schema-composite-field=\"voiceQualityRatio\" data-ui-schema-primary-field=\"" + escapeHtmlAttr(_0x2c77a2.id) + "\" data-ui-schema-secondary-field=\"" + escapeHtmlAttr(_0x2c3481.id) + "\" data-ui-schema-mode-field=\"" + escapeHtmlAttr(_0x10112a) + "\" data-ui-schema-default-mode-value=\"" + escapeHtmlAttr(_0x4c20ee) + "\" data-ui-schema-custom-mode-value=\"" + escapeHtmlAttr(_0x313913) + "\">\n    <button type=\"button\" class=\"img-pill-btn ui-schema-menu-trigger\" data-ui-schema-menu-trigger=\"voiceQualityRatio\">\n      <svg width=\"12\" height=\"12\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><path d=\"M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3Z\"/><path d=\"M19 10v2a7 7 0 0 1-14 0v-2\"/><line x1=\"12\" y1=\"19\" x2=\"12\" y2=\"23\"/><line x1=\"8\" y1=\"23\" x2=\"16\" y2=\"23\"/></svg>\n      <span class=\"ui-schema-pill-label ui-schema-voice-quality-ratio-label\">" + escapeHtmlAttr(_0x2b8455) + "</span>\n    </button>\n    <div class=\"img-ratio-popup ui-schema-popup ui-schema-voice-quality-ratio-popup\" style=\"display:none;\">\n      " + _0x179382 + "\n      " + _0x3f3300 + "\n    </div>\n  </div>";
}
function renderSectionPairField(_0x59dac1, _0x2d31c3) {
  const _0x5eb61f = (Array.isArray(_0x59dac1) ? _0x59dac1 : []).filter(Boolean);
  _0x5eb61f.forEach(assertSupportedField);
  const _0x29ca50 = _0x5eb61f.map(_0x23e795 => getOptionLabel(_0x23e795, getFieldValue(_0x2d31c3, _0x23e795))).join(" · ");
  const _0x4029b8 = _0x5eb61f.map(_0x1bc8a9 => String(_0x1bc8a9?.id || "").trim()).filter(Boolean);
  const _0x36d726 = _0x4029b8[0] || "";
  const _0x39f73d = _0x4029b8[1] || "";
  return "<div class=\"ui-schema-section-pair-pill\" data-ui-schema-composite-field=\"sectionPair\" data-ui-schema-primary-field=\"" + escapeHtmlAttr(_0x36d726) + "\" data-ui-schema-secondary-field=\"" + escapeHtmlAttr(_0x39f73d) + "\">\n    <button type=\"button\" class=\"img-pill-btn ui-schema-menu-trigger\" data-ui-schema-menu-trigger=\"sectionPair\">\n      <span class=\"ui-schema-pill-label ui-schema-section-pair-label\">" + escapeHtmlAttr(_0x29ca50) + "</span>\n    </button>\n    <div class=\"img-ratio-popup ui-schema-popup ui-schema-section-pair-popup\" style=\"display:none;\">\n      " + _0x5eb61f.map(_0x4903b6 => renderQualityButtons(_0x4903b6, getFieldValue(_0x2d31c3, _0x4903b6), _0x2d31c3)).join("") + "\n    </div>\n  </div>";
}
function renderVideoResolutionField(_0x15a391, _0x5d4eb6) {
  const _0x1ec8e6 = getFieldById(_0x15a391, "rhVideoResolution") || getFieldById(_0x15a391, "videoResolution");
  if (!_0x1ec8e6) {
    return "";
  }
  assertSupportedField(_0x1ec8e6);
  const _0x588d10 = getFieldById(_0x15a391, "rhVideoFps");
  const _0x14f0af = getFieldById(_0x15a391, "rhVideoFrames");
  if (_0x588d10) {
    assertSupportedField(_0x588d10);
  }
  if (_0x14f0af) {
    assertSupportedField(_0x14f0af);
  }
  const _0x5a3ea2 = getFieldValue(_0x5d4eb6, _0x1ec8e6);
  const _0x1b566f = _0x588d10 ? getFieldValue(_0x5d4eb6, _0x588d10) : "";
  const _0x19d95e = _0x14f0af ? getFieldValue(_0x5d4eb6, _0x14f0af) : "";
  const _0x1d35a8 = Number(_0x19d95e) === 0 ? t("aigenImage.uiSchema.fullLength") : String(_0x19d95e || "");
  const _0xbe7b2 = _0x588d10 && _0x14f0af ? joinMetricLabels([["帧数", _0x1d35a8], ["帧率", _0x1b566f], ["分辨率", _0x5a3ea2]]) : formatMetricLabel("分辨率", _0x5a3ea2);
  return "<div class=\"ui-schema-video-resolution-pill\" data-ui-schema-composite-field=\"videoResolution\">\n    <button type=\"button\" class=\"img-pill-btn ui-schema-menu-trigger\" data-ui-schema-menu-trigger=\"videoResolution\">\n      <span class=\"ui-schema-pill-label ui-schema-video-resolution-label\">" + escapeHtmlAttr(_0xbe7b2) + "</span>\n    </button>\n    <div class=\"img-ratio-popup ui-schema-popup ui-schema-video-resolution-popup\" style=\"display:none;\">\n      " + renderQualityButtons({
    ..._0x1ec8e6,
    label: "分辨率"
  }, _0x5a3ea2, _0x5d4eb6) + "\n      " + (_0x588d10 ? "<div class=\"rh-v5-meta-panel\"><div class=\"rh-vram-adv-row\"><div class=\"rh-vram-adv-label\"><span>" + escapeHtmlAttr(manifestText("帧率")) + "</span></div><div class=\"img-rp-quality-segmented rh-adv-seg rh-v5-fps-seg\" data-ui-schema-field=\"" + escapeHtmlAttr(_0x588d10.id) + "\" data-ui-schema-type=\"segmented\" data-ui-schema-default=\"" + escapeHtmlAttr(_0x588d10.defaultValue ?? "") + "\">" + renderOptions(_0x588d10, _0x1b566f, _0x5d4eb6) + "</div></div></div>" : "") + "\n    </div>\n  </div>";
}
function normalizeNumberValue(_0x886dc7, _0x1e567a, {
  min = -Infinity,
  max = Infinity
} = {}) {
  const _0x48ed2a = Number(_0x886dc7);
  const _0x517e8d = Number.isFinite(_0x48ed2a) ? Math.trunc(_0x48ed2a) : _0x1e567a;
  return Math.max(min, Math.min(max, _0x517e8d));
}
function renderRhVideoParamsIcon() {
  return "<svg width=\"12\" height=\"12\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" style=\"flex-shrink:0;\"><rect x=\"3\" y=\"6\" width=\"18\" height=\"14\" rx=\"2\"/><path d=\"M7 6V4\"/><path d=\"M12 6V4\"/><path d=\"M17 6V4\"/><path d=\"M8 10h1\"/><path d=\"M8 14h1\"/><path d=\"M8 18h1\"/><path d=\"M15 12l4 2-4 2z\"/></svg>";
}
function getRhVideoParamsKind(_0x1af423) {
  if (getFieldById(_0x1af423, "rhVideoSeconds")) {
    return "seconds";
  }
  if (getFieldById(_0x1af423, "rhVideoFrames")) {
    return "frames";
  }
  return "resolution";
}
function buildRhVideoParamsLabel(_0x30d880, _0x753c80) {
  const _0xabc3fb = getFieldById(_0x30d880, "rhVideoResolution");
  const _0x5bb2ce = getFieldById(_0x30d880, "rhVideoFps");
  const _0x8ef3cc = getFieldById(_0x30d880, "rhVideoFrames");
  const _0x355dad = getFieldById(_0x30d880, "rhVideoSeconds");
  const _0xc1f79 = _0xabc3fb ? normalizeNumberValue(getFieldValue(_0x753c80, _0xabc3fb), Number(_0xabc3fb.defaultValue ?? 832), {
    min: 832
  }) : 832;
  if (_0x355dad) {
    const _0x3d9d15 = _0x5bb2ce ? normalizeNumberValue(getFieldValue(_0x753c80, _0x5bb2ce), Number(_0x5bb2ce.defaultValue ?? 24)) : 24;
    const _0x59d0a3 = normalizeNumberValue(getFieldValue(_0x753c80, _0x355dad), Number(_0x355dad.defaultValue ?? 5), {
      min: Number(_0x355dad.min ?? 1),
      max: Number(_0x355dad.max ?? 600)
    });
    return joinMetricLabels([["秒数", _0x59d0a3], ["帧率", _0x3d9d15], ["分辨率", _0xc1f79]]);
  }
  if (_0x8ef3cc) {
    const _0x45779d = normalizeNumberValue(getFieldValue(_0x753c80, _0x8ef3cc), Number(_0x8ef3cc.defaultValue ?? 77), {
      min: Number(_0x8ef3cc.min ?? 0),
      max: Number(_0x8ef3cc.max ?? 999999)
    });
    const _0x3d7a9f = _0x45779d === 0 ? t("aigenImage.uiSchema.fullLength") : String(_0x45779d);
    if (!_0x5bb2ce) {
      return joinMetricLabels([["帧数", _0x3d7a9f], ["分辨率", _0xc1f79]]);
    }
    const _0x5f2f51 = normalizeNumberValue(getFieldValue(_0x753c80, _0x5bb2ce), Number(_0x5bb2ce.defaultValue ?? 24));
    return joinMetricLabels([["帧数", _0x3d7a9f], ["帧率", _0x5f2f51], ["分辨率", _0xc1f79]]);
  }
  return formatMetricLabel("分辨率", _0xc1f79);
}
function getRhVideoParamsAspectRatioField(_0x30db6e) {
  return getFieldById(_0x30db6e, "rhBerniniAspectRatio") || getFieldById(_0x30db6e, "aspectRatio") || getFieldByDisplayRole(_0x30db6e, "aspectRatio");
}
function getRhVideoFpsOptions(_0x45991c, _0x5bb472 = {}) {
  if (Array.isArray(_0x5bb472?.rhVideoFpsOptions) && _0x5bb472.rhVideoFpsOptions.length) {
    return _0x5bb472.rhVideoFpsOptions.map(_0x16f973 => Number(_0x16f973)).filter(Number.isFinite).map(_0x2c9f22 => Object.freeze({
      value: _0x2c9f22,
      label: _0x2c9f22 + "帧"
    }));
  }
  return getRenderableOptions(_0x45991c);
}
function renderRhVideoParamsResolutionField(_0x3eff7d, _0x4d7975, {
  buttonClass: _0xd846c1
}) {
  assertSupportedField(_0x3eff7d);
  const _0x4c37a7 = normalizeNumberValue(getFieldValue(_0x4d7975, _0x3eff7d), Number(_0x3eff7d.defaultValue ?? 832), {
    min: 832
  });
  return "<div class=\"img-rp-quality-area\" data-ui-schema-field=\"" + escapeHtmlAttr(_0x3eff7d.id) + "\" data-ui-schema-type=\"segmented\" data-ui-schema-value-type=\"number\" data-ui-schema-default=\"" + escapeHtmlAttr(_0x3eff7d?.defaultValue ?? "") + "\">\n                  <div class=\"img-rp-section-label\">" + escapeHtmlAttr(manifestText("分辨率")) + "<span class=\"rh-tip\" data-tooltip=\"" + escapeHtmlAttr(manifestText(_0x3eff7d?.description || _0x3eff7d?.tooltip || "分辨率越高细节越清晰、边缘更稳定。\n同时显存占用与生成耗时会明显增加。")) + "\">!</span></div>\n                  <div class=\"img-rp-quality-segmented rh-video-resolution-seg\">\n                    " + (Array.isArray(_0x3eff7d?.options) ? _0x3eff7d.options : []).map(_0xf32c34 => {
    const _0x161eb4 = Number(getOptionValue(_0xf32c34));
    const _0x107496 = Number(_0x4c37a7) === Number(_0x161eb4);
    const _0x42d334 = _0x3eff7d?.showHighResolutionOptions === true || Number(_0x161eb4) <= 1440 ? "" : " dev-mode-only";
    return "<button type=\"button\" class=\"img-rp-quality-item" + _0x42d334 + " " + (_0x107496 ? "active" : "") + " " + _0xd846c1 + " ui-schema-option\" data-value=\"" + escapeHtmlAttr(_0x161eb4) + "\" data-ui-schema-value=\"" + escapeHtmlAttr(_0x161eb4) + "\">" + escapeHtmlAttr(_0x161eb4) + "</button>";
  }).join("") + "\n                  </div>\n                </div>";
}
function renderRhVideoParamsFpsRow(_0x5dcae9, _0x280bd9, _0x305cab = {}) {
  assertSupportedField(_0x5dcae9);
  const _0x5d7221 = normalizeNumberValue(getFieldValue(_0x280bd9, _0x5dcae9), Number(_0x5dcae9.defaultValue ?? 24));
  const _0x49d65c = _0x305cab?.buttonClass || "rh-v5-fps-btn";
  const _0x586407 = _0x305cab?.hidden ? " hidden" : "";
  return "<div class=\"rh-vram-adv-row\"" + _0x586407 + ">\n                    <div class=\"rh-vram-adv-label\">\n                      <span>" + escapeHtmlAttr(manifestText("帧率")) + "</span>\n                      <span class=\"rh-tip\" data-tooltip=\"" + escapeHtmlAttr(manifestText("帧率越高运动更顺滑、动作更连贯。\n但生成更慢、成本更高。\n常用 24 帧；想更快或更省可选 16 帧。")) + "\">!</span>\n                    </div>\n                    <div class=\"img-rp-quality-segmented rh-adv-seg rh-v5-fps-seg\" data-ui-schema-field=\"" + escapeHtmlAttr(_0x5dcae9.id) + "\" data-ui-schema-type=\"segmented\" data-ui-schema-value-type=\"number\" data-ui-schema-default=\"" + escapeHtmlAttr(_0x5dcae9?.defaultValue ?? "") + "\">\n                      " + getRhVideoFpsOptions(_0x5dcae9, _0x305cab).map(_0x15fc9a => {
    const _0x543390 = Number(getOptionValue(_0x15fc9a));
    const _0x5eb861 = manifestText(_0x15fc9a?.label ?? _0x543390 + "帧");
    return "<button type=\"button\" class=\"img-rp-quality-item " + _0x49d65c + " " + (Number(_0x5d7221) === Number(_0x543390) ? "active" : "") + " ui-schema-option\" data-value=\"" + escapeHtmlAttr(_0x543390) + "\" data-ui-schema-value=\"" + escapeHtmlAttr(_0x543390) + "\">" + escapeHtmlAttr(_0x5eb861) + "</button>";
  }).join("") + "\n                    </div>\n                  </div>";
}
function renderRhVideoParamsStepperRow(_0x14f88e, _0x3c6e61, _0x1b4f55 = {}) {
  assertSupportedField(_0x14f88e);
  const _0x5a8330 = String(_0x14f88e?.id || "").trim();
  const _0x45922a = _0x5a8330 === "rhVideoFrames";
  const _0x2c3bbf = Number(_0x14f88e?.min ?? (_0x45922a ? 0 : 1));
  const _0x3e03df = Number(_0x14f88e?.max ?? (_0x45922a ? 999999 : 600));
  const _0x2f3d84 = Number(_0x14f88e?.defaultValue ?? (_0x45922a ? 77 : 5));
  const _0xb2c51a = normalizeNumberValue(getFieldValue(_0x3c6e61, _0x14f88e), _0x2f3d84, {
    min: _0x2c3bbf,
    max: _0x3e03df
  });
  const _0x3feed6 = Number(_0x3c6e61?.rhVideoSourceFrameCount || 0);
  const _0x2625be = _0x45922a ? "rh-v5-frames-stepper" : "rh-ltx-seconds-stepper";
  const _0x4b25a1 = manifestText(_0x45922a ? "生成时长（帧数）" : "生成秒数");
  const _0x5bcd3f = manifestText(_0x45922a ? "帧数决定生成片段的长度：数值越大视频越长、耗时越高。\n填 0 表示按源视频全长处理（适合整段替换）。" : "秒数决定生成视频的时长：数值越大视频越长、耗时与成本越高。");
  const _0x23b9c0 = _0x45922a && _0xb2c51a === 0 ? t("aigenImage.uiSchema.fullLength") : String(_0xb2c51a);
  return "<div class=\"rh-vram-adv-row ui-schema-rh-video-stepper\" data-ui-schema-field=\"" + escapeHtmlAttr(_0x5a8330) + "\" data-ui-schema-type=\"stepper\" data-ui-schema-value-type=\"number\" data-ui-schema-default=\"" + escapeHtmlAttr(_0x14f88e?.defaultValue ?? "") + "\" data-ui-schema-min=\"" + escapeHtmlAttr(_0x2c3bbf) + "\" data-ui-schema-max=\"" + escapeHtmlAttr(_0x3e03df) + "\" data-ui-schema-step=\"" + escapeHtmlAttr(_0x14f88e?.step ?? 1) + "\">\n                    <div class=\"rh-vram-adv-label\">\n                      <span>" + _0x4b25a1 + "</span>\n                      <span class=\"rh-tip\" data-tooltip=\"" + _0x5bcd3f + "\">!</span>\n                    </div>\n                    <div class=\"rh-stepper " + _0x2625be + "\">\n                      " + (_0x45922a ? "<div class=\"rh-v5-source-framecount\" aria-label=\"" + escapeHtmlAttr(manifestText("源视频总帧数")) + "\">" + (_0x3feed6 ? String(_0x3feed6) : "—") + "</div>" : "") + "\n                      <div class=\"rh-stepper-value\" role=\"spinbutton\" aria-label=\"" + escapeHtmlAttr(manifestText(_0x45922a ? "生成帧数" : "生成秒数")) + "\" aria-valuenow=\"" + escapeHtmlAttr(_0xb2c51a) + "\" tabindex=\"0\">" + escapeHtmlAttr(_0x23b9c0) + "</div>\n                    </div>\n                  </div>";
}
function renderRhVideoParamsPlacementFields(_0x28327f, _0x24143a, _0x227d69 = {}) {
  const _0x184055 = getFieldById(_0x28327f, "rhVideoResolution");
  if (!_0x184055) {
    return _0x28327f.map(_0x30e514 => renderField(_0x30e514, _0x24143a, _0x227d69)).join("");
  }
  const _0x2e23a3 = getFieldById(_0x28327f, "rhVideoFps");
  const _0x498fc1 = getFieldById(_0x28327f, "rhVideoFrames");
  const _0x40bdac = getFieldById(_0x28327f, "rhVideoSeconds");
  const _0xa6420 = getRhVideoParamsAspectRatioField(_0x28327f);
  const _0x23b4dc = getRhVideoParamsKind(_0x28327f);
  const _0x310c5e = _0x23b4dc === "seconds";
  const _0xda1301 = Boolean(_0x498fc1 && !_0x2e23a3);
  const _0x537593 = _0x310c5e ? "rh-ltx-res-btn" : "rh-v5-res-btn";
  const _0x4fee4a = _0x310c5e ? "rh-ltx-fps-btn" : "rh-v5-fps-btn";
  const _0x57651f = buildRhVideoParamsLabel(_0x28327f, _0x24143a);
  const _0x4d9d94 = _0x310c5e ? "rh-ltx-meta-panel" : "rh-v5-meta-panel";
  const _0x44d999 = _0x310c5e ? "" + (_0x2e23a3 ? renderRhVideoParamsFpsRow(_0x2e23a3, _0x24143a, {
    ..._0x227d69,
    buttonClass: _0x4fee4a
  }) : "") + (_0x40bdac ? renderRhVideoParamsStepperRow(_0x40bdac, _0x24143a, _0x227d69) : "") : "" + (_0x2e23a3 ? renderRhVideoParamsFpsRow(_0x2e23a3, _0x24143a, {
    ..._0x227d69,
    buttonClass: _0x4fee4a
  }) : "") + (_0xda1301 && _0x227d69?.preserveHiddenFpsRow ? "" : "") + (_0x498fc1 ? renderRhVideoParamsStepperRow(_0x498fc1, _0x24143a, _0x227d69) : "");
  const _0x167b7f = new Set(["rhVideoResolution", "rhVideoFps", "rhVideoFrames", "rhVideoSeconds"]);
  const _0x695f67 = String(_0xa6420?.id || "").trim();
  if (_0x695f67) {
    _0x167b7f.add(_0x695f67);
  }
  const _0x2a4306 = _0x28327f.filter(_0x39d6d8 => !_0x167b7f.has(String(_0x39d6d8?.id || "").trim()));
  const _0x541a89 = _0xda1301 && _0x227d69?.preserveHiddenFpsRow ? renderRhVideoParamsFpsRow({
    id: "rhVideoFps",
    type: "segmented",
    label: "帧率",
    defaultValue: 24,
    options: Object.freeze([Object.freeze({
      value: 16,
      label: "16帧"
    }), Object.freeze({
      value: 24,
      label: "24帧"
    })])
  }, {
    generationParams: {
      rhVideoFps: 24
    }
  }, {
    ..._0x227d69,
    buttonClass: _0x4fee4a,
    hidden: true
  }) : "";
  const _0x29592c = "<div class=\"img-ratio-wrap ui-schema-rh-video-params\" style=\"position:relative;\" data-ui-schema-composite-field=\"rhVideoParams\">\n              <button type=\"button\" class=\"img-pill-btn img-ratio-btn ui-schema-menu-trigger\" data-ui-schema-menu-trigger=\"rhVideoParams\">\n                <span class=\"img-ratio-icon-slot\">" + renderRhVideoParamsIcon() + "</span>\n                <span class=\"img-ratio-label\">" + escapeHtmlAttr(_0x57651f) + "</span>\n              </button>\n              <div class=\"img-ratio-popup ui-schema-popup\" style=\"display:none;\">\n                " + renderRhVideoParamsResolutionField(_0x184055, _0x24143a, {
    buttonClass: _0x537593
  }) + "\n                <div class=\"" + _0x4d9d94 + "\" style=\"display:flex;flex-direction:column;gap:10px;\">\n                  " + _0x541a89 + _0x44d999 + "\n                </div>\n                " + (_0xa6420 ? renderRatioButtons(_0xa6420, getFieldValue(_0x24143a, _0xa6420), _0x24143a) : "") + "\n              </div>\n            </div>";
  return [..._0x2a4306.map(_0x145579 => renderField(_0x145579, _0x24143a, _0x227d69)), _0x29592c].join("");
}
function renderFloatingMenuItems(_0x4d98e1, _0x37756a, _0x6c7ad2 = {}) {
  const _0x367b5e = getVisibleOptions(_0x4d98e1, _0x6c7ad2);
  return _0x367b5e.map(_0x1857bc => {
    const _0x1b4156 = String(_0x1857bc?.value ?? _0x1857bc);
    const _0x4776b8 = manifestText(_0x1857bc?.label ?? _0x1b4156);
    const _0xc2f532 = getDisplayLabelFromOption(_0x1857bc, _0x4776b8);
    const _0x224f29 = manifestText(_0x1857bc?.tooltip || "").trim();
    const _0x14a858 = manifestText(_0x1857bc?.subtitle || _0x1857bc?.description || "").trim();
    const _0x2b2801 = String(_0x37756a ?? "") === _0x1b4156;
    const _0x13d230 = isOptionDisabled(_0x4d98e1, _0x1857bc, _0x6c7ad2);
    const _0x179877 = _0x224f29 ? " title=\"" + escapeHtmlAttr(_0x224f29) + "\" data-tooltip=\"" + escapeHtmlAttr(_0x224f29) + "\"" : "";
    const _0x1184bf = _0x224f29 ? "<span class=\"rh-tip ui-schema-info-tip\" data-tooltip=\"" + escapeHtmlAttr(_0x224f29) + "\">!</span>" : "";
    const _0x1d16dc = _0x14a858 ? "<div class=\"fmi-content\"><div class=\"fmi-title\">" + escapeHtmlAttr(_0x4776b8) + "</div><div class=\"fmi-sub\">" + escapeHtmlAttr(_0x14a858) + "</div></div>" : "<span class=\"floating-menu-label\">" + escapeHtmlAttr(_0x4776b8) + "</span>";
    return "<button type=\"button\" role=\"option\" aria-selected=\"" + (_0x2b2801 ? "true" : "false") + "\" class=\"floating-menu-item " + (_0x2b2801 ? "active" : "") + " " + (_0x13d230 ? "disabled" : "") + " " + (_0x14a858 ? "has-subtitle" : "") + "\" data-ui-schema-value=\"" + escapeHtmlAttr(_0x1b4156) + "\" data-ui-schema-option-label=\"" + escapeHtmlAttr(_0xc2f532) + "\"" + _0x179877 + getOptionDisabledAttrs(_0x4d98e1, _0x1857bc, {
      nodeData: _0x6c7ad2
    }) + ">" + _0x1d16dc + _0x1184bf + "</button>";
  }).join("");
}
function renderDropdownControl(_0x4f4f1e, _0x17b7dc, _0x40e9a2, _0x351acd = {}) {
  const _0x5b5fb2 = String(_0x4f4f1e?.id || "").trim();
  const _0x3535a3 = getOptionLabel(_0x4f4f1e, _0x17b7dc);
  const _0x2601ce = _0x351acd?.advanced ? " ui-schema-advanced-dropdown" : "";
  const _0x301709 = String(_0x351acd?.titleHtml || "");
  const _0x13f944 = _0x351acd?.advanced ? "<svg class=\"ui-schema-dropdown-chevron\" width=\"12\" height=\"12\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" aria-hidden=\"true\"><polyline points=\"6 9 12 15 18 9\"></polyline></svg>" : "";
  const _0x3da56d = resolveFieldDisabled(_0x4f4f1e, _0x40e9a2) ? " disabled aria-disabled=\"true\" data-ui-schema-disabled=\"true\"" : "";
  return "<div class=\"ui-schema-pill-menu" + _0x2601ce + "\" data-ui-schema-dropdown>\n    <button type=\"button\" class=\"img-pill-btn ui-schema-menu-trigger\" data-ui-schema-menu-trigger=\"" + escapeHtmlAttr(_0x5b5fb2) + "\" aria-haspopup=\"listbox\" aria-expanded=\"false\"" + _0x3da56d + ">\n      <span class=\"ui-schema-pill-label\">" + escapeHtmlAttr(_0x3535a3) + "</span>\n      " + _0x13f944 + "\n    </button>\n    <div class=\"floating-menu ui-schema-floating-menu\" role=\"listbox\" aria-hidden=\"true\">\n      " + _0x301709 + "\n      " + renderFloatingMenuItems(_0x4f4f1e, _0x17b7dc, _0x40e9a2) + "\n    </div>\n  </div>";
}
function renderPillMenuField(_0x69662c, _0x4b0a8b) {
  const _0x3bb81d = String(_0x69662c?.id || "").trim();
  const _0x156bbc = getFieldValue(_0x4b0a8b, _0x69662c);
  const _0xfca17c = normalizeControlType(_0x69662c?.type);
  const _0xab8426 = manifestText(_0x69662c?.menuTitle || "").trim();
  const _0x52007a = _0xab8426 || (_0x69662c?.showMenuTitle === true ? manifestText(_0x69662c?.label || "").trim() : "");
  const _0x565b5a = _0x69662c?.menuTooltipByValue;
  const _0x552975 = String(_0x69662c?.menuTooltipField || "").trim();
  const _0x37f72d = _0x552975 ? String(getNodeFieldValue(_0x4b0a8b, _0x552975, "") || "").trim() : "";
  const _0x4eb043 = _0x565b5a && typeof _0x565b5a === "object" && !Array.isArray(_0x565b5a) ? _0x565b5a[_0x37f72d] : "";
  const _0x1440f1 = manifestText(_0x4eb043 || _0x69662c?.menuTooltip || _0x69662c?.menuDescription || _0x69662c?.tooltip || "").trim();
  const _0x2fb2de = _0x1440f1 ? "<span class=\"rh-tip ui-schema-info-tip\" data-tooltip=\"" + escapeHtmlAttr(_0x1440f1) + "\">!</span>" : "";
  const _0x28cb85 = _0x52007a ? "<div class=\"floating-menu-title ui-schema-floating-menu-title\">" + escapeHtmlAttr(_0x52007a) + _0x2fb2de + "</div>" : "";
  return "<div class=\"ui-schema-field\" data-ui-schema-field=\"" + escapeHtmlAttr(_0x3bb81d) + "\" data-ui-schema-type=\"" + escapeHtmlAttr(_0xfca17c) + "\" data-ui-schema-default=\"" + escapeHtmlAttr(_0x69662c?.defaultValue ?? "") + "\">\n    " + renderDropdownControl(_0x69662c, _0x156bbc, _0x4b0a8b, {
    titleHtml: _0x28cb85
  }) + "\n  </div>";
}
function renderResolutionPillField(_0x59e9cd, _0x1ea11e) {
  const _0x552673 = String(_0x59e9cd?.id || "").trim();
  const _0x2b33e1 = getFieldValue(_0x1ea11e, _0x59e9cd);
  const _0x4a0885 = getVisibleOptions(_0x59e9cd, _0x1ea11e);
  const _0xc9831 = _0x4a0885.map(_0x2d7a1a => Number(_0x2d7a1a?.value ?? _0x2d7a1a)).filter(Number.isFinite);
  const _0x2aca30 = Number.isFinite(Number(_0x2b33e1)) ? Number(_0x2b33e1) : Number(_0x59e9cd?.defaultValue ?? _0xc9831[0] ?? 0);
  const _0x3c0d46 = Math.max(0, _0xc9831.indexOf(_0x2aca30));
  const _0x5c7a0a = Math.max(0, _0xc9831.length - 1);
  const _0x1efecb = manifestText(_0x59e9cd?.label || "Resolution");
  const _0x574d1f = manifestText(_0x59e9cd?.description || _0x59e9cd?.tooltip || "").trim();
  const _0x233d2b = _0x574d1f && _0x59e9cd?.showInfoTip === true ? "<span class=\"rh-tip ui-schema-info-tip\" data-tooltip=\"" + escapeHtmlAttr(_0x574d1f) + "\">!</span>" : "";
  const _0x2a42c8 = resolveFieldDisabled(_0x59e9cd, _0x1ea11e) ? " disabled aria-disabled=\"true\" data-ui-schema-disabled=\"true\"" : "";
  return "<div class=\"ui-schema-field ui-schema-resolution-pill\" data-ui-schema-field=\"" + escapeHtmlAttr(_0x552673) + "\" data-ui-schema-adapter=\"field.resolutionPill.slider\" data-ui-schema-type=\"slider\" data-ui-schema-default=\"" + escapeHtmlAttr(_0x59e9cd?.defaultValue ?? "") + "\" data-ui-schema-range-values=\"" + escapeHtmlAttr(_0xc9831.join(",")) + "\">\n    <button type=\"button\" class=\"img-pill-btn ui-schema-menu-trigger\" data-ui-schema-menu-trigger=\"" + escapeHtmlAttr(_0x552673) + "\"" + _0x2a42c8 + ">\n      <span class=\"ui-schema-pill-label ui-schema-resolution-label\">\n        <span class=\"ui-schema-resolution-title\">" + escapeHtmlAttr(_0x1efecb) + "</span>\n        <span class=\"ui-schema-resolution-value\">" + escapeHtmlAttr(_0x2aca30) + "</span>\n      </span>\n    </button>\n    <div class=\"rh-res-popup ui-schema-popup\" style=\"display:none;\">\n      <div class=\"rh-res-title\">" + escapeHtmlAttr(_0x1efecb) + _0x233d2b + "</div>\n      <input type=\"range\" class=\"rh-res-slider ui-schema-range-index\" data-ui-schema-input=\"" + escapeHtmlAttr(_0x552673) + "\" min=\"0\" max=\"" + escapeHtmlAttr(_0x5c7a0a) + "\" step=\"1\" value=\"" + escapeHtmlAttr(_0x3c0d46) + "\">\n      <div class=\"rh-res-ticks\">" + _0xc9831.map(_0xe8dd19 => "<span>" + escapeHtmlAttr(_0xe8dd19) + "</span>").join("") + "</div>\n    </div>\n  </div>";
}
function findRangeValueIndex(_0x22b72c, _0x3e964e) {
  const _0x4b36a5 = Number(_0x3e964e);
  if (!Number.isFinite(_0x4b36a5) || !Array.isArray(_0x22b72c)) {
    return -1;
  }
  return _0x22b72c.findIndex(_0x25fca7 => Math.abs(Number(_0x25fca7) - _0x4b36a5) < 0.000001);
}
function parseRangeValuesFromFieldEl(_0x5bc5cb) {
  const _0x2991c8 = String(_0x5bc5cb?.dataset?.uiSchemaRangeValues || "").trim();
  if (!_0x2991c8) {
    return [];
  }
  return _0x2991c8.split(",").map(_0x3ad581 => Number(_0x3ad581)).filter(Number.isFinite);
}
function parseRangeLabelsFromFieldEl(_0x3a9d4d) {
  const _0xb448fd = String(_0x3a9d4d?.dataset?.uiSchemaRangeLabels || "").trim();
  if (!_0xb448fd) {
    return [];
  }
  try {
    const _0x48bd11 = JSON.parse(_0xb448fd);
    if (Array.isArray(_0x48bd11)) {
      return _0x48bd11.map(_0x22bbaa => String(_0x22bbaa));
    } else {
      return [];
    }
  } catch {
    return [];
  }
}
function getRangeValueDisplayLabel(_0xeba7f3, _0x1e46ed, _0xb1cbfa = "") {
  const _0xd0a6f4 = parseRangeLabelsFromFieldEl(_0xeba7f3);
  if (_0xd0a6f4.length === 0) {
    return _0xb1cbfa || String(_0x1e46ed ?? "");
  }
  const _0x559f23 = parseRangeValuesFromFieldEl(_0xeba7f3);
  const _0x4d5e6a = findRangeValueIndex(_0x559f23, _0x1e46ed);
  if (_0x4d5e6a >= 0 && _0xd0a6f4[_0x4d5e6a]) {
    return _0xd0a6f4[_0x4d5e6a];
  } else {
    return _0xb1cbfa || String(_0x1e46ed ?? "");
  }
}
function getDurationOptionEntries(_0x401702, _0x2a59f9 = {}) {
  return getVisibleOptions(_0x401702, _0x2a59f9).map(_0x354873 => {
    const _0x49dd65 = _0x354873 && typeof _0x354873 === "object" && !Array.isArray(_0x354873);
    const _0x347c3c = Number(_0x49dd65 ? _0x354873.value : _0x354873);
    if (!Number.isFinite(_0x347c3c)) {
      return null;
    }
    const _0x4e3015 = String(_0x49dd65 ? getDisplayLabelFromOption(_0x354873, _0x347c3c + "S") : _0x347c3c + "S");
    return {
      value: _0x347c3c,
      label: _0x4e3015
    };
  }).filter(Boolean);
}
function renderDurationPillField(_0x377dae, _0x28dcbc) {
  const _0x6baec9 = String(_0x377dae?.id || "").trim();
  const _0xa0df35 = getFieldValue(_0x28dcbc, _0x377dae);
  const _0x4e3aaa = getDurationOptionEntries(_0x377dae, _0x28dcbc);
  const _0x36d1c9 = _0x4e3aaa.map(_0x3f9e6e => _0x3f9e6e.value);
  const _0x14e18a = _0x36d1c9.length > 0;
  const _0x466e07 = Number(_0x377dae?.min ?? 1);
  const _0x4da0d0 = Number(_0x377dae?.max ?? 15);
  const _0x12b9d8 = Number(_0x377dae?.step ?? 1);
  const _0x437189 = Number.isFinite(Number(_0xa0df35)) ? Number(_0xa0df35) : Number(_0x377dae?.defaultValue ?? _0x466e07);
  const _0x18fc09 = Math.max(0, findRangeValueIndex(_0x36d1c9, _0x437189));
  const _0x5a92c2 = _0x14e18a ? 0 : _0x466e07;
  const _0x386a95 = _0x14e18a ? Math.max(0, _0x36d1c9.length - 1) : _0x4da0d0;
  const _0x2989b0 = _0x14e18a ? 1 : _0x12b9d8;
  const _0x5d38e1 = _0x14e18a ? _0x18fc09 : _0x437189;
  const _0x17cee4 = _0x14e18a && _0x4e3aaa[_0x18fc09]?.label ? _0x4e3aaa[_0x18fc09].label : _0x437189 + "S";
  const _0x39a3d0 = _0x14e18a ? _0x4e3aaa[0]?.label : _0x466e07 + "S";
  const _0x233ee3 = _0x14e18a ? _0x4e3aaa[_0x4e3aaa.length - 1]?.label : _0x4da0d0 + "S";
  const _0x3ded3d = _0x14e18a ? " data-ui-schema-range-values=\"" + escapeHtmlAttr(_0x36d1c9.join(",")) + "\"" : "";
  const _0x3d168b = _0x14e18a ? " data-ui-schema-range-labels=\"" + escapeHtmlAttr(JSON.stringify(_0x4e3aaa.map(_0x5dabbb => _0x5dabbb.label))) + "\"" : "";
  const _0x6aa8e0 = resolveFieldDisabled(_0x377dae, _0x28dcbc) ? " disabled aria-disabled=\"true\" data-ui-schema-disabled=\"true\"" : "";
  return "<div class=\"ui-schema-field ui-schema-duration-pill\" data-ui-schema-field=\"" + escapeHtmlAttr(_0x6baec9) + "\" data-ui-schema-adapter=\"field.durationPill.slider\" data-ui-schema-type=\"slider\" data-ui-schema-default=\"" + escapeHtmlAttr(_0x377dae?.defaultValue ?? "") + "\"" + _0x3ded3d + _0x3d168b + ">\n    <button type=\"button\" class=\"img-pill-btn ui-schema-menu-trigger\" data-ui-schema-menu-trigger=\"" + escapeHtmlAttr(_0x6baec9) + "\"" + _0x6aa8e0 + ">\n      <span class=\"ui-schema-pill-label ui-schema-duration-label\">" + escapeHtmlAttr(_0x17cee4) + "</span>\n    </button>\n    <div class=\"floating-menu ui-schema-popup ui-schema-duration-pop\">\n      <div class=\"ui-schema-duration-title\">" + escapeHtmlAttr(manifestText(_0x377dae?.label || "视频时长")) + "</div>\n      <input type=\"range\" class=\"ui-schema-range ui-schema-duration-slider\" data-ui-schema-input=\"" + escapeHtmlAttr(_0x6baec9) + "\" min=\"" + escapeHtmlAttr(_0x5a92c2) + "\" max=\"" + escapeHtmlAttr(_0x386a95) + "\" step=\"" + escapeHtmlAttr(_0x2989b0) + "\" value=\"" + escapeHtmlAttr(_0x5d38e1) + "\">\n      <div class=\"ui-schema-duration-bounds\">\n        <span>" + escapeHtmlAttr(_0x39a3d0) + "</span>\n        <span>" + escapeHtmlAttr(_0x233ee3) + "</span>\n      </div>\n    </div>\n  </div>";
}
function renderInstanceToggleField(_0xfdcc71, _0x49a870) {
  return renderRunningHubInstanceControl(_0xfdcc71, _0x49a870, {
    escapeHtmlAttr: escapeHtmlAttr,
    getFieldValue: getFieldValue,
    isOptionHidden: isOptionHidden,
    manifestText: manifestText,
    renderDropdownControl: renderDropdownControl
  });
}
const syncInstanceToggleField = syncRunningHubInstanceControl;
function syncStepperField(_0x55a57d, _0x4db83a) {
  if (!_0x55a57d?.classList?.contains("ui-schema-rh-video-stepper")) {
    return;
  }
  const _0x1efe1f = Number(_0x55a57d.dataset.uiSchemaDefault ?? 0);
  const _0xb4409a = _0x55a57d.dataset.uiSchemaMin;
  const _0x40554b = _0x55a57d.dataset.uiSchemaMax;
  const _0x46dd1c = normalizeNumberValue(_0x4db83a, Number.isFinite(_0x1efe1f) ? _0x1efe1f : 0, {
    min: _0xb4409a === undefined ? -Infinity : Number(_0xb4409a),
    max: _0x40554b === undefined ? Infinity : Number(_0x40554b)
  });
  const _0x302cc3 = _0x55a57d.querySelector(".rh-stepper-value");
  if (!_0x302cc3) {
    return;
  }
  const _0x32ac68 = String(_0x55a57d.dataset.uiSchemaField || "").trim();
  _0x302cc3.textContent = _0x32ac68 === "rhVideoFrames" && _0x46dd1c === 0 ? t("aigenImage.uiSchema.fullLength") : String(_0x46dd1c);
  _0x302cc3.setAttribute("aria-valuenow", String(_0x46dd1c));
}
function renderSelect(_0x5cae17, _0x4f8e6a, _0x428f10 = {}) {
  const _0x3331e5 = getVisibleOptions(_0x5cae17, _0x428f10);
  return "<select class=\"ui-schema-select\" data-ui-schema-input=\"" + escapeHtmlAttr(_0x5cae17.id) + "\">\n    " + _0x3331e5.map(_0x20c859 => {
    const _0x5436e5 = String(_0x20c859?.value ?? "");
    const _0x1e4f70 = String(_0x4f8e6a ?? "") === _0x5436e5 ? " selected" : "";
    return "<option value=\"" + escapeHtmlAttr(_0x5436e5) + "\"" + _0x1e4f70 + ">" + escapeHtmlAttr(_0x20c859?.label ?? _0x5436e5) + "</option>";
  }).join("") + "\n  </select>";
}
function renderRange(_0x13ffef, _0x3fd49a, _0xd7ad3c, _0x29f70e = {}) {
  const _0x5aa28b = getVisibleOptions(_0x13ffef, _0x29f70e);
  const _0x469401 = _0x5aa28b.map(_0x520d91 => Number(_0x520d91?.value ?? _0x520d91)).filter(Number.isFinite);
  const _0x3a0644 = Number(_0x13ffef?.defaultValue ?? _0x469401[0] ?? 0);
  const _0x443a14 = Number.isFinite(Number(_0x3fd49a)) ? Number(_0x3fd49a) : _0x3a0644;
  if (_0xd7ad3c === "stepper") {
    const _0x439c66 = _0x13ffef?.ariaLabel ? manifestText(_0x13ffef.ariaLabel) : t("aigenImage.uiSchema.numericValueAria", {
      label: manifestText(_0x13ffef?.label || _0x13ffef.id)
    });
    return "<div class=\"rh-stepper\" data-key=\"" + escapeHtmlAttr(_0x13ffef.id) + "\">\n      <div class=\"rh-stepper-value\" role=\"spinbutton\" aria-label=\"" + escapeHtmlAttr(_0x439c66) + "\" aria-valuenow=\"" + escapeHtmlAttr(_0x443a14) + "\" tabindex=\"0\">" + escapeHtmlAttr(_0x443a14) + "</div>\n    </div>";
  }
  const _0xe854e9 = Number(_0x13ffef?.min ?? _0x469401[0] ?? 0);
  const _0x1b0ac4 = Number(_0x13ffef?.max ?? _0x469401[_0x469401.length - 1] ?? _0xe854e9);
  const _0x6d41cf = Number(_0x13ffef?.step ?? 1);
  return "<div class=\"ui-schema-range-line\">\n    <input class=\"ui-schema-range\" data-ui-schema-input=\"" + escapeHtmlAttr(_0x13ffef.id) + "\" type=\"range\" min=\"" + escapeHtmlAttr(_0xe854e9) + "\" max=\"" + escapeHtmlAttr(_0x1b0ac4) + "\" step=\"" + escapeHtmlAttr(_0x6d41cf) + "\" value=\"" + escapeHtmlAttr(_0x443a14) + "\">\n    <span class=\"ui-schema-value\">" + escapeHtmlAttr(_0x443a14) + "</span>\n  </div>";
}
function renderStepperAttrs(_0x596ad2, _0x134068) {
  if (_0x134068 !== "stepper") {
    return "";
  }
  const _0x536347 = [];
  const _0x3f6da1 = String(_0x596ad2?.valueType || _0x596ad2?.numberMode || "").trim().toLowerCase();
  if (_0x596ad2?.min !== undefined && _0x596ad2?.min !== null) {
    _0x536347.push(" data-ui-schema-min=\"" + escapeHtmlAttr(_0x596ad2.min) + "\"");
  }
  if (_0x596ad2?.max !== undefined && _0x596ad2?.max !== null) {
    _0x536347.push(" data-ui-schema-max=\"" + escapeHtmlAttr(_0x596ad2.max) + "\"");
  }
  _0x536347.push(" data-ui-schema-step=\"" + escapeHtmlAttr(_0x596ad2?.step ?? 1) + "\"");
  if (_0x3f6da1 === "float" || _0x3f6da1 === "decimal") {
    _0x536347.push(" data-ui-schema-number-mode=\"float\"");
  }
  return _0x536347.join("");
}
function renderTextInput(_0x1b252c, _0x5b52cf, _0x40bbf3, _0x3bf30c) {
  const _0x10d254 = _0x3bf30c ? resolveFieldDisabled(_0x1b252c, _0x3bf30c) : isFieldDisabled(_0x1b252c);
  const _0x1425e8 = _0x10d254 ? " disabled" : "";
  if (_0x40bbf3 === "textarea") {
    return "<textarea class=\"ui-schema-textarea\" data-ui-schema-input=\"" + escapeHtmlAttr(_0x1b252c.id) + "\"" + _0x1425e8 + ">" + escapeHtmlAttr(_0x5b52cf) + "</textarea>";
  }
  return "<input class=\"ui-schema-text\" data-ui-schema-input=\"" + escapeHtmlAttr(_0x1b252c.id) + "\" type=\"text\" value=\"" + escapeHtmlAttr(_0x5b52cf) + "\"" + _0x1425e8 + ">";
}
function renderAssetInput(_0x39db22, _0xac0da2) {
  const _0x5d83b1 = _0xac0da2 === "video input" ? t("aigenImage.uiSchema.assetInput.video") : _0xac0da2 === "audio input" ? t("aigenImage.uiSchema.assetInput.audio") : t("aigenImage.uiSchema.assetInput.image");
  return "<button type=\"button\" class=\"img-rp-quality-item ui-schema-asset-input\" data-ui-schema-input=\"" + escapeHtmlAttr(_0x39db22.id) + "\" data-ui-schema-asset-kind=\"" + escapeHtmlAttr(_0xac0da2.split(" ")[0]) + "\">" + _0x5d83b1 + "</button>";
}
function renderAdvancedRowField(_0xb37c6d, _0x20dbd1) {
  assertSupportedField(_0xb37c6d);
  const _0x378d21 = String(_0xb37c6d?.id || "").trim();
  const _0xcf20aa = normalizeControlType(_0xb37c6d?.type);
  const _0x5c66d6 = String(_0xb37c6d?.variant || "").trim().toLowerCase();
  if (_0x5c66d6 === "randomseedrow") {
    return renderRandomSeedRowField(_0xb37c6d, _0x20dbd1);
  }
  const _0x6e231b = getFieldValue(_0x20dbd1, _0xb37c6d);
  const _0x4806c2 = manifestText(_0xb37c6d?.label || _0x378d21);
  const _0x57ae13 = manifestText(_0xb37c6d?.description || _0xb37c6d?.tooltip || "").trim();
  const _0x1bb50b = _0x57ae13 ? "<span class=\"rh-tip ui-schema-info-tip\" data-tooltip=\"" + escapeHtmlAttr(_0x57ae13) + "\">!</span>" : "";
  const _0xcb851c = String(_0xb37c6d?.helpUrl || "").trim();
  const _0x3f3849 = _0xcb851c ? "<a href=\"#\" class=\"ui-schema-help-link\" data-ui-schema-field-help-url=\"" + escapeHtmlAttr(_0xcb851c) + "\" title=\"打开相关页面\" onclick=\"return false;\"><svg width=\"12\" height=\"12\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><path d=\"M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6\"/><polyline points=\"15 3 21 3 21 9\"/><line x1=\"10\" y1=\"14\" x2=\"21\" y2=\"3\"/></svg></a>" : "";
  const _0x339b45 = typeof _0xb37c6d?.defaultValue === "boolean" ? " data-ui-schema-value-type=\"boolean\"" : _0xcf20aa === "stepper" ? " data-ui-schema-value-type=\"number\"" : "";
  const _0x34f24d = _0xcf20aa === "stepper" ? " ui-schema-rh-video-stepper" : "";
  const _0xcc6de4 = resolveFieldDisabled(_0xb37c6d, _0x20dbd1) ? " is-rh-disabled" : "";
  let _0x47c0d2;
  if (_0xcf20aa === "select" || _0x5c66d6 === "pillmenu" && _0xcf20aa === "segmented") {
    _0x47c0d2 = renderDropdownControl(_0xb37c6d, _0x6e231b, _0x20dbd1, {
      advanced: true
    });
  } else {
    _0x47c0d2 = renderControl(_0xb37c6d, _0x6e231b, _0xcf20aa, {
      advanced: true,
      nodeData: _0x20dbd1
    });
  }
  return "<div class=\"ui-schema-field rh-vram-adv-row" + _0x34f24d + _0xcc6de4 + "\" data-ui-schema-field=\"" + escapeHtmlAttr(_0x378d21) + "\" data-ui-schema-type=\"" + escapeHtmlAttr(_0xcf20aa) + "\" data-ui-schema-default=\"" + escapeHtmlAttr(_0xb37c6d?.defaultValue ?? "") + "\"" + getFieldDefaultAliasAttrs(_0xb37c6d) + _0x339b45 + renderStepperAttrs(_0xb37c6d, _0xcf20aa) + ">\n    <div class=\"rh-vram-adv-label\">\n      <span class=\"rh-adv-title ui-schema-field-label\">" + escapeHtmlAttr(_0x4806c2) + "</span>\n      " + _0x1bb50b + "\n      " + _0x3f3849 + "\n    </div>\n    <div class=\"rh-adv-control-line\">" + _0x47c0d2 + "</div>\n  </div>";
}
function getRandomSeedAttrs(_0x1c779d) {
  const _0x17438c = Number.isFinite(Number(_0x1c779d?.randomSeedMin)) ? Math.trunc(Number(_0x1c779d.randomSeedMin)) : RANDOM_SEED_DEFAULT_MIN;
  const _0x525567 = Number.isFinite(Number(_0x1c779d?.randomSeedMax)) ? Math.trunc(Number(_0x1c779d.randomSeedMax)) : RANDOM_SEED_DEFAULT_MAX;
  const _0x58bd47 = Math.min(_0x17438c, _0x525567);
  const _0x56d9cc = Math.max(_0x17438c, _0x525567);
  const _0x50eaf2 = String(_0x1c779d?.randomSeedModeField || "").trim();
  const _0x4ff291 = String(_0x1c779d?.randomSeedDefaultMode || "fixed").trim() || "fixed";
  const _0x51d371 = _0x50eaf2 ? " data-ui-schema-random-seed-mode-field=\"" + escapeHtmlAttr(_0x50eaf2) + "\" data-ui-schema-random-seed-mode-default=\"" + escapeHtmlAttr(_0x4ff291) + "\"" : "";
  return " data-ui-schema-random-seed-min=\"" + escapeHtmlAttr(_0x58bd47) + "\" data-ui-schema-random-seed-max=\"" + escapeHtmlAttr(_0x56d9cc) + "\"" + _0x51d371;
}
function normalizeRandomSeedMode(_0x15839c, _0x10ad1f = "fixed") {
  const _0x5c76eb = String(_0x15839c ?? _0x10ad1f).trim().toLowerCase();
  if (_0x5c76eb === "random") {
    return "random";
  } else {
    return "fixed";
  }
}
function getRandomSeedModeFromNodeData(_0x16ffe8, _0x4b7f6c) {
  const _0x3313e4 = String(_0x4b7f6c?.randomSeedModeField || "").trim();
  return normalizeRandomSeedMode(_0x3313e4 ? getNodeFieldValue(_0x16ffe8, _0x3313e4, _0x4b7f6c?.randomSeedDefaultMode || "fixed") : "fixed", _0x4b7f6c?.randomSeedDefaultMode || "fixed");
}
function renderRandomSeedModeButtons(_0x525c26, _0x209faf, _0x126c88) {
  const _0x287b95 = String(_0x525c26?.randomSeedModeField || "").trim();
  const _0x30c84c = t("aigenImage.uiSchema.random");
  const _0x3fcdc4 = t("aigenImage.uiSchema.fixed");
  if (!_0x287b95) {
    return "<button type=\"button\" class=\"img-rp-quality-item ui-schema-random-seed-btn\" data-ui-schema-random-seed=\"true\" aria-label=\"" + escapeHtmlAttr(t("aigenImage.uiSchema.randomAria", {
      label: _0x126c88
    })) + "\">" + escapeHtmlAttr(_0x30c84c) + "</button>";
  }
  const _0x456c3 = [{
    value: "random",
    label: _0x30c84c
  }, {
    value: "fixed",
    label: _0x3fcdc4
  }];
  return _0x456c3.map(_0x4e6f56 => "<button type=\"button\" class=\"img-rp-quality-item ui-schema-random-seed-mode-btn " + (_0x209faf === _0x4e6f56.value ? "active" : "") + "\" data-ui-schema-random-seed-mode=\"" + escapeHtmlAttr(_0x4e6f56.value) + "\" data-ui-schema-random-seed-mode-field=\"" + escapeHtmlAttr(_0x287b95) + "\" aria-label=\"" + escapeHtmlAttr("" + _0x126c88 + _0x4e6f56.label) + "\">" + escapeHtmlAttr(_0x4e6f56.label) + "</button>").join("");
}
function syncRandomSeedField(_0x411413, _0x32ffda = {}) {
  if (!_0x411413?.classList?.contains?.("ui-schema-random-seed-row")) {
    return;
  }
  const _0x51b3d2 = String(_0x411413.dataset.uiSchemaRandomSeedModeField || "").trim();
  if (!_0x51b3d2) {
    return;
  }
  const _0x564b73 = normalizeRandomSeedMode(getNodeFieldValue(_0x32ffda, _0x51b3d2, _0x411413.dataset.uiSchemaRandomSeedModeDefault || "fixed"), _0x411413.dataset.uiSchemaRandomSeedModeDefault || "fixed");
  _0x411413.querySelectorAll("[data-ui-schema-random-seed-mode]").forEach(_0x279be8 => {
    _0x279be8.classList.toggle("active", String(_0x279be8.dataset.uiSchemaRandomSeedMode || "") === _0x564b73);
  });
}
function syncDurationPillField(_0x56717b, _0xb89602) {
  if (!_0x56717b?.classList?.contains("ui-schema-duration-pill")) {
    return;
  }
  const _0x2b7b1a = _0x56717b.querySelector(".ui-schema-duration-label");
  if (!_0x2b7b1a) {
    return;
  }
  _0x2b7b1a.textContent = getRangeValueDisplayLabel(_0x56717b, _0xb89602, _0xb89602 + "S");
}
function syncResolutionPillField(_0x3a6b24, _0x5f4ed3) {
  if (!_0x3a6b24?.classList?.contains("ui-schema-resolution-pill")) {
    return;
  }
  const _0x1a1b1f = _0x3a6b24.querySelector(".ui-schema-pill-label");
  const _0x4786c4 = _0x1a1b1f?.querySelector(".ui-schema-resolution-value");
  if (_0x4786c4) {
    _0x4786c4.textContent = String(_0x5f4ed3);
    return;
  }
  const _0x51f4f0 = _0x3a6b24.querySelector(".rh-res-title")?.textContent || "Resolution";
  if (_0x1a1b1f) {
    _0x1a1b1f.textContent = _0x51f4f0 + " " + _0x5f4ed3;
  }
}
function renderRandomSeedRowField(_0x1d15c5, _0x5c74d9) {
  assertSupportedField(_0x1d15c5);
  const _0x3f49d8 = String(_0x1d15c5?.id || "").trim();
  const _0x30805a = normalizeControlType(_0x1d15c5?.type);
  const _0x9d50ef = getFieldValue(_0x5c74d9, _0x1d15c5);
  const _0x5ca3d3 = getRandomSeedModeFromNodeData(_0x5c74d9, _0x1d15c5);
  const _0xf61151 = manifestText(_0x1d15c5?.label || _0x3f49d8);
  const _0x24277d = manifestText(_0x1d15c5?.description || _0x1d15c5?.tooltip || "").trim();
  const _0x47e063 = _0x24277d ? "<span class=\"rh-tip ui-schema-info-tip\" data-tooltip=\"" + escapeHtmlAttr(_0x24277d) + "\">!</span>" : "";
  const _0xae0d00 = _0x30805a === "stepper" ? " data-ui-schema-value-type=\"number\"" : "";
  const _0x592c00 = _0x30805a === "stepper" ? " ui-schema-rh-video-stepper" : "";
  const _0x352a02 = String(_0x1d15c5?.randomSeedModeField || "").trim() ? " ui-schema-random-seed-row-has-mode" : "";
  return "<div class=\"ui-schema-field rh-vram-adv-row ui-schema-random-seed-row" + _0x352a02 + _0x592c00 + "\" data-ui-schema-field=\"" + escapeHtmlAttr(_0x3f49d8) + "\" data-ui-schema-adapter=\"field.randomSeedRow\" data-ui-schema-type=\"" + escapeHtmlAttr(_0x30805a) + "\" data-ui-schema-default=\"" + escapeHtmlAttr(_0x1d15c5?.defaultValue ?? "") + "\"" + getFieldDefaultAliasAttrs(_0x1d15c5) + _0xae0d00 + renderStepperAttrs(_0x1d15c5, _0x30805a) + getRandomSeedAttrs(_0x1d15c5) + ">\n    <div class=\"rh-vram-adv-label\">\n      <span class=\"rh-adv-title ui-schema-field-label\">" + escapeHtmlAttr(_0xf61151) + "</span>\n      " + _0x47e063 + "\n    </div>\n    <div class=\"rh-adv-control-line\">\n      " + renderRandomSeedModeButtons(_0x1d15c5, _0x5ca3d3, _0xf61151) + "\n      " + renderControl(_0x1d15c5, _0x9d50ef, _0x30805a, {
    advanced: true,
    nodeData: _0x5c74d9
  }) + "\n    </div>\n  </div>";
}
function normalizeRhV54SinglePreset(_0x582e9d, _0x2e761b = "efficiency") {
  const _0x584966 = String(_0x582e9d ?? "").trim();
  if (_0x584966 === "efficiency" || _0x584966 === "stable" || _0x584966 === "quality") {
    return _0x584966;
  } else {
    return _0x2e761b;
  }
}
function normalizeRhV54SpecialMode(_0x1cf0fc) {
  const _0x29bf1f = String(_0x1cf0fc ?? "").trim();
  if (_0x29bf1f === "longVideoOverlay" || _0x29bf1f === "cameraMove") {
    return _0x29bf1f;
  } else {
    return "";
  }
}
function normalizeRhV54MaskExpand(_0x45e22e, _0xbeabf = 25) {
  const _0x21e2a4 = Number(_0x45e22e);
  if (Number.isFinite(_0x21e2a4)) {
    return Math.max(-9999, Math.min(9999, Math.trunc(_0x21e2a4)));
  } else {
    return _0xbeabf;
  }
}
function getStepPrecision(_0x4851ef) {
  const _0x342957 = String(_0x4851ef ?? "");
  const _0x4eedfc = _0x342957.includes(".") ? _0x342957.split(".")[1] : "";
  return Math.min(Math.max(_0x4eedfc.length, 0), 8);
}
function normalizeRhV54BreastJiggle(_0x479489, {
  min = 0,
  max = 1,
  step = 0.05,
  fallback = 0
} = {}) {
  const _0x41971b = Number(_0x479489);
  const _0x34132b = Number(fallback);
  const _0x1350d5 = Number(min);
  const _0x245ba7 = Number(max);
  const _0x520c7e = Number(step);
  const _0x581876 = Number.isFinite(_0x1350d5) ? _0x1350d5 : 0;
  const _0x380120 = Number.isFinite(_0x245ba7) ? _0x245ba7 : 1;
  const _0x4bce55 = Number.isFinite(_0x34132b) ? _0x34132b : _0x581876;
  const _0x491177 = Math.max(Math.min(_0x581876, _0x380120), Math.min(Math.max(_0x581876, _0x380120), Number.isFinite(_0x41971b) ? _0x41971b : _0x4bce55));
  if (!Number.isFinite(_0x520c7e) || _0x520c7e <= 0) {
    return _0x491177;
  }
  const _0x3dfdb1 = _0x581876 + Math.round((_0x491177 - _0x581876) / _0x520c7e) * _0x520c7e;
  return Math.max(Math.min(_0x581876, _0x380120), Math.min(Math.max(_0x581876, _0x380120), _0x3dfdb1));
}
function formatRhV54BreastJiggle(_0x5526ca, _0x2a4274 = {}) {
  const _0x371fea = normalizeRhV54BreastJiggle(_0x5526ca, _0x2a4274);
  return String(Number(_0x371fea.toFixed(getStepPrecision(_0x2a4274.step ?? 0.05))));
}
function getRhV54BreastJiggleRangeFromFieldEl(_0x54e102) {
  const _0x514883 = Number(_0x54e102?.dataset?.uiSchemaMin ?? 0);
  const _0x39b112 = Number(_0x54e102?.dataset?.uiSchemaMax ?? 1);
  const _0x22eae3 = Number(_0x54e102?.dataset?.uiSchemaStep ?? 0.05);
  const _0x290a55 = Number(_0x54e102?.dataset?.uiSchemaDefault ?? _0x514883);
  return {
    min: _0x514883,
    max: _0x39b112,
    step: _0x22eae3,
    fallback: _0x290a55
  };
}
function renderRhV54FieldLabel(_0xc63aef) {
  const _0x2c3e0d = String(_0xc63aef?.id || "").trim();
  const _0x259ea1 = manifestText(_0xc63aef?.label || _0x2c3e0d);
  const _0x3dcac5 = manifestText(_0xc63aef?.description || _0xc63aef?.tooltip || "").trim();
  const _0x570cea = _0x3dcac5 ? "<span class=\"rh-tip ui-schema-info-tip\" data-tooltip=\"" + escapeHtmlAttr(_0x3dcac5) + "\">!</span>" : "";
  return "<div class=\"rh-vram-adv-label\"><span>" + escapeHtmlAttr(_0x259ea1) + "</span>" + _0x570cea + "</div>";
}
function renderRhV54SegmentButton({
  key: _0x5f4573,
  value: _0x54e731,
  label: _0xf1c1ca,
  active: _0x5ebdd0,
  disabled = false,
  attrs = ""
}) {
  const _0x443ac0 = attrs || (disabled ? " disabled aria-disabled=\"true\" data-ui-schema-disabled=\"true\"" : "");
  const _0x5e330f = ["img-rp-quality-item", "rh-adv-seg-btn", _0x5ebdd0 ? "active" : "", disabled ? "disabled" : ""].filter(Boolean).join(" ");
  return "<button type=\"button\" class=\"" + _0x5e330f + "\" data-key=\"" + escapeHtmlAttr(_0x5f4573) + "\" data-value=\"" + escapeHtmlAttr(_0x54e731) + "\" data-ui-schema-value=\"" + escapeHtmlAttr(_0x54e731) + "\"" + _0x443ac0 + ">" + escapeHtmlAttr(_0xf1c1ca) + "</button>";
}
function renderAdvancedSelectionControl(_0x578f3d, _0x1994c7, _0x3bafb7 = {}) {
  const _0x3203d3 = String(_0x578f3d?.id || "").trim();
  const _0x4c3f1b = normalizeControlType(_0x578f3d?.type);
  const _0x537580 = [Object.freeze({
    value: true,
    label: t("aigenImage.uiSchema.yes")
  }), Object.freeze({
    value: false,
    label: t("aigenImage.uiSchema.no")
  })];
  const _0x8347b7 = _0x4c3f1b === "toggle" && !Array.isArray(_0x578f3d?.options) ? _0x537580 : getVisibleOptions(_0x578f3d, _0x3bafb7);
  const _0x1674b8 = _0x8347b7.length ? _0x8347b7 : _0x537580;
  return "<div class=\"img-rp-quality-segmented rh-adv-seg\">\n      " + _0x1674b8.map(_0x2e5001 => {
    const _0x14a613 = getOptionValue(_0x2e5001);
    const _0xa03333 = manifestText(_0x2e5001?.label ?? _0x14a613);
    const _0x2fdc7e = String(_0x1994c7 ?? "") === _0x14a613;
    const _0xa2ea2e = isOptionDisabled(_0x578f3d, _0x2e5001, _0x3bafb7);
    return renderRhV54SegmentButton({
      key: _0x3203d3,
      value: _0x14a613,
      label: _0xa03333,
      active: _0x2fdc7e,
      disabled: _0xa2ea2e,
      attrs: getOptionDisabledAttrs(_0x578f3d, _0x2e5001, {
        nodeData: _0x3bafb7
      })
    });
  }).join("") + "\n    </div>";
}
function renderRhV54ControlModeField(_0x367c8f, _0x1cef32) {
  assertSupportedField(_0x367c8f);
  const _0x44f405 = String(_0x367c8f?.id || "").trim();
  const _0x5a717d = String(getNodeFieldValue(_0x1cef32, "rhControlMode", "single") || "single");
  const _0x490f67 = normalizeRhV54SinglePreset(getNodeFieldValue(_0x1cef32, "rhSingleControlPreset", _0x367c8f?.defaultValue), String(_0x367c8f?.defaultValue || "efficiency"));
  const _0x5061da = _0x5a717d === "multi" ? "multi" : _0x490f67;
  return "<div class=\"ui-schema-field rh-vram-adv-row ui-schema-rh-v54-control-mode\" data-ui-schema-field=\"" + escapeHtmlAttr(_0x44f405) + "\" data-ui-schema-type=\"segmented\" data-ui-schema-default=\"" + escapeHtmlAttr(_0x367c8f?.defaultValue ?? "") + "\">\n    " + renderRhV54FieldLabel(_0x367c8f) + "\n    <div class=\"rh-adv-control-line\">\n      <div class=\"rh-adv-single-group " + (_0x5a717d !== "multi" ? "active" : "") + "\">\n        <span class=\"rh-adv-single-title\">" + escapeHtmlAttr(t("aigenImage.uiSchema.singleControl")) + "</span>\n        <span class=\"rh-adv-single-colon\" aria-hidden=\"true\">" + escapeHtmlAttr(t("aigenImage.uiSchema.controlColon")) + "</span>\n        <div class=\"img-rp-quality-segmented rh-adv-seg rh-adv-control-seg\">\n          " + renderRhV54SegmentButton({
    key: "rhSingleControlPreset",
    value: "efficiency",
    label: t("aigenImage.uiSchema.efficiency"),
    active: _0x5061da === "efficiency"
  }) + "\n          " + renderRhV54SegmentButton({
    key: "rhSingleControlPreset",
    value: "stable",
    label: t("aigenImage.uiSchema.stable"),
    active: _0x5061da === "stable"
  }) + "\n        </div>\n      </div>\n      <span class=\"rh-adv-control-split\" aria-hidden=\"true\"></span>\n      <div class=\"rh-adv-multi-group " + (_0x5a717d === "multi" ? "active" : "") + "\">\n        " + renderRhV54SegmentButton({
    key: "rhControlMode",
    value: "multi",
    label: t("aigenImage.uiSchema.multiControl"),
    active: _0x5061da === "multi"
  }) + "\n      </div>\n    </div>\n  </div>";
}
function renderRhV54BooleanRowField(_0x5f05d5, _0x429a4f) {
  assertSupportedField(_0x5f05d5);
  const _0x3b2c06 = String(_0x5f05d5?.id || "").trim();
  const _0x26cadb = _0x5f05d5?.disableWhenSpecialMode === "cameraMove" && normalizeRhV54SpecialMode(getNodeFieldValue(_0x429a4f, "rhSpecialMode", "")) === "cameraMove";
  const _0x4ee2ae = _0x3b2c06 === "rhSubtractSubject" && _0x429a4f?.rhV54HasMaskVideo === true;
  const _0x572da3 = _0x4ee2ae ? false : getNodeFieldValue(_0x429a4f, _0x3b2c06, _0x5f05d5?.defaultValue) === true;
  return "<div class=\"ui-schema-field rh-vram-adv-row ui-schema-rh-v54-boolean-row " + (_0x26cadb || _0x4ee2ae ? "is-rh-disabled" : "") + "\" data-ui-schema-field=\"" + escapeHtmlAttr(_0x3b2c06) + "\" data-ui-schema-type=\"segmented\" data-ui-schema-value-type=\"boolean\" data-ui-schema-default=\"" + escapeHtmlAttr(_0x5f05d5?.defaultValue ?? "") + "\"" + (_0x5f05d5?.disableWhenSpecialMode ? " data-rh-v54-disable-on-special=\"" + escapeHtmlAttr(_0x5f05d5.disableWhenSpecialMode) + "\"" : "") + (_0x4ee2ae ? " data-rh-v54-disable-on-mask-video=\"true\"" : "") + ">\n    " + renderRhV54FieldLabel(_0x5f05d5) + "\n    <div class=\"img-rp-quality-segmented rh-adv-seg\">\n      " + renderRhV54SegmentButton({
    key: _0x3b2c06,
    value: "true",
    label: t("aigenImage.uiSchema.yes"),
    active: _0x572da3
  }) + "\n      " + renderRhV54SegmentButton({
    key: _0x3b2c06,
    value: "false",
    label: t("aigenImage.uiSchema.no"),
    active: !_0x572da3
  }) + "\n    </div>\n  </div>";
}
function renderRhV54MaskExpandField(_0x4dee32, _0x34a88e) {
  assertSupportedField(_0x4dee32);
  const _0x54d23b = String(_0x4dee32?.id || "").trim();
  const _0x5d75b1 = getNodeFieldValue(_0x34a88e, _0x54d23b, _0x4dee32?.defaultValue ?? 25);
  const _0x3536f7 = normalizeRhV54MaskExpand(_0x5d75b1, Number(_0x4dee32?.defaultValue ?? 25));
  const _0x2356ad = _0x4dee32?.ariaLabel ? manifestText(_0x4dee32.ariaLabel) : t("aigenImage.uiSchema.numericValueAria", {
    label: manifestText(_0x4dee32?.label || _0x54d23b)
  });
  const _0x41ddd5 = _0x4dee32?.disableWhenSpecialMode === "cameraMove" && normalizeRhV54SpecialMode(getNodeFieldValue(_0x34a88e, "rhSpecialMode", "")) === "cameraMove";
  return "<div class=\"ui-schema-field rh-vram-adv-row ui-schema-rh-v54-mask-expand " + (_0x41ddd5 ? "is-rh-disabled" : "") + "\" data-ui-schema-field=\"" + escapeHtmlAttr(_0x54d23b) + "\" data-ui-schema-type=\"stepper\" data-ui-schema-value-type=\"number\" data-ui-schema-default=\"" + escapeHtmlAttr(_0x4dee32?.defaultValue ?? "") + "\" data-ui-schema-min=\"" + escapeHtmlAttr(_0x4dee32?.min ?? -9999) + "\" data-ui-schema-max=\"" + escapeHtmlAttr(_0x4dee32?.max ?? 9999) + "\" data-ui-schema-step=\"" + escapeHtmlAttr(_0x4dee32?.step ?? 1) + "\"" + (_0x4dee32?.disableWhenSpecialMode ? " data-rh-v54-disable-on-special=\"" + escapeHtmlAttr(_0x4dee32.disableWhenSpecialMode) + "\"" : "") + ">\n    " + renderRhV54FieldLabel(_0x4dee32) + "\n    <div class=\"rh-stepper\" data-key=\"" + escapeHtmlAttr(_0x54d23b) + "\">\n      <div class=\"rh-stepper-value\" role=\"spinbutton\" aria-label=\"" + escapeHtmlAttr(_0x2356ad) + "\" aria-valuenow=\"" + escapeHtmlAttr(_0x3536f7) + "\" tabindex=\"0\">" + escapeHtmlAttr(_0x3536f7) + "</div>\n    </div>\n  </div>";
}
function renderRhV54SpecialModeField(_0x1acd2b, _0x13a458) {
  assertSupportedField(_0x1acd2b);
  const _0x270122 = String(_0x1acd2b?.id || "").trim();
  const _0x2dc882 = normalizeRhV54SpecialMode(getNodeFieldValue(_0x13a458, _0x270122, ""));
  const _0xb83a0b = getRenderableOptions(_0x1acd2b).filter(_0x2cb7ab => _0x2cb7ab?.hidden !== true);
  return "<div class=\"ui-schema-field rh-vram-adv-row ui-schema-rh-v54-special-mode\" data-ui-schema-field=\"" + escapeHtmlAttr(_0x270122) + "\" data-ui-schema-type=\"segmented\" data-ui-schema-default=\"" + escapeHtmlAttr(_0x1acd2b?.defaultValue ?? "") + "\">\n    " + renderRhV54FieldLabel(_0x1acd2b) + "\n    <div class=\"img-rp-quality-segmented rh-adv-seg\">\n      " + _0xb83a0b.map(_0x1c8986 => {
    const _0x362fa7 = getOptionValue(_0x1c8986);
    return renderRhV54SegmentButton({
      key: _0x270122,
      value: _0x362fa7,
      label: manifestText(_0x1c8986?.label ?? _0x362fa7),
      active: _0x2dc882 === _0x362fa7
    });
  }).join("") + "\n    </div>\n  </div>";
}
function renderRhV54BreastJiggleField(_0x428043, _0x2b5d01) {
  assertSupportedField(_0x428043);
  const _0x39ed14 = String(_0x428043?.id || "").trim();
  const _0x358b79 = Number(_0x428043?.min ?? 0);
  const _0x454f7d = Number(_0x428043?.max ?? 1);
  const _0x24e5f0 = Number(_0x428043?.step ?? 0.05);
  const _0x2430f9 = Number(_0x428043?.defaultValue ?? _0x358b79);
  const _0x86a3f1 = formatRhV54BreastJiggle(getNodeFieldValue(_0x2b5d01, _0x39ed14, _0x428043?.defaultValue ?? 0), {
    min: _0x358b79,
    max: _0x454f7d,
    step: _0x24e5f0,
    fallback: _0x2430f9
  });
  return "<div class=\"ui-schema-field rh-vram-adv-row rh-breast-jiggle-row ui-schema-rh-v54-breast-jiggle\" data-ui-schema-field=\"" + escapeHtmlAttr(_0x39ed14) + "\" data-ui-schema-type=\"slider\" data-ui-schema-default=\"" + escapeHtmlAttr(_0x428043?.defaultValue ?? "") + "\" data-ui-schema-min=\"" + escapeHtmlAttr(_0x358b79) + "\" data-ui-schema-max=\"" + escapeHtmlAttr(_0x454f7d) + "\" data-ui-schema-step=\"" + escapeHtmlAttr(_0x24e5f0) + "\">\n    " + renderRhV54FieldLabel(_0x428043) + "\n    <div class=\"rh-breast-jiggle-control\">\n      <input type=\"range\" class=\"rh-breast-jiggle-slider\" data-ui-schema-input=\"" + escapeHtmlAttr(_0x39ed14) + "\" min=\"" + escapeHtmlAttr(_0x358b79) + "\" max=\"" + escapeHtmlAttr(_0x454f7d) + "\" step=\"" + escapeHtmlAttr(_0x24e5f0) + "\" value=\"" + escapeHtmlAttr(_0x86a3f1) + "\" aria-label=\"" + escapeHtmlAttr(manifestText(_0x428043?.ariaLabel || _0x428043?.label || _0x39ed14)) + "\">\n      <span class=\"rh-breast-jiggle-value\">" + escapeHtmlAttr(_0x86a3f1) + "</span>\n    </div>\n  </div>";
}
function formatRhAiAppFooterParamLabel(_0xbfc76, _0x509fd1) {
  const _0x9a8b9f = String(_0xbfc76?.dataset?.uiSchemaFooterLabel || _0xbfc76?.dataset?.uiSchemaField || "参数").trim();
  const _0x4522dc = String(_0xbfc76?.dataset?.uiSchemaType || "").trim();
  const _0x31e288 = formatRhAiAppFooterParamValue(_0x4522dc, _0x509fd1);
  if (_0x31e288) {
    return _0x9a8b9f + " · " + _0x31e288;
  } else {
    return _0x9a8b9f;
  }
}
function isRhAiAppFooterToggleOn(_0x24acec) {
  if (_0x24acec === true) {
    return true;
  }
  if (_0x24acec === false) {
    return false;
  }
  const _0x145e20 = String(_0x24acec ?? "").trim().toLowerCase();
  return ["true", "1", "yes", "on"].includes(_0x145e20);
}
function syncRhAiAppFooterParamField(_0x1e9896, _0x41c231) {
  if (!_0x1e9896?.classList?.contains("ui-schema-rh-aiapp-footer-param")) {
    return;
  }
  const _0x24fea8 = _0x1e9896.querySelector("[data-ui-schema-rh-aiapp-footer-toggle]");
  if (_0x24fea8) {
    const _0x569e39 = isRhAiAppFooterToggleOn(_0x41c231);
    _0x24fea8.dataset.uiSchemaValue = _0x569e39 ? "false" : "true";
    _0x24fea8.setAttribute("aria-pressed", String(_0x569e39));
    const _0x398ebc = _0x24fea8.querySelector(".ui-schema-rh-aiapp-footer-value");
    if (_0x398ebc) {
      _0x398ebc.textContent = formatRhAiAppFooterParamValue("toggle", _0x569e39);
    }
    const _0x8c429b = _0x24fea8.querySelector(".ui-schema-pill-label");
    if (_0x8c429b) {
      _0x8c429b.textContent = String(_0x1e9896?.dataset?.uiSchemaFooterLabel || _0x1e9896?.dataset?.uiSchemaField || "参数").trim();
    }
    return;
  }
  const _0x40adc1 = _0x1e9896.querySelector(".ui-schema-pill-label");
  if (!_0x40adc1) {
    return;
  }
  _0x40adc1.textContent = formatRhAiAppFooterParamLabel(_0x1e9896, _0x41c231);
}
function formatRhAiAppFooterParamValue(_0x231bd2, _0x42bb46) {
  if (_0x231bd2 === "toggle") {
    if (isRhAiAppFooterToggleOn(_0x42bb46)) {
      return "是";
    } else {
      return "否";
    }
  }
  return String(_0x42bb46 ?? "").trim();
}
function renderRhAiAppFooterDirectNumberField({
  field: _0x462c8b,
  id: _0x263677,
  type: _0x95455,
  value: _0x487d11,
  label: _0x2aca8b,
  defaultValue: _0x12e83b,
  valueTypeAttr: _0x1d5fbe,
  nodeData: _0x284ecd
}) {
  const _0x55f2f1 = String(_0x462c8b?.valueType || _0x462c8b?.numberMode || "").trim().toLowerCase();
  const _0xbdca4a = _0x55f2f1 === "float" || _0x55f2f1 === "decimal" ? "decimal" : "numeric";
  const _0x19e891 = [];
  if (_0x462c8b?.min !== undefined && _0x462c8b?.min !== null) {
    _0x19e891.push(" min=\"" + escapeHtmlAttr(_0x462c8b.min) + "\"");
  }
  if (_0x462c8b?.max !== undefined && _0x462c8b?.max !== null) {
    _0x19e891.push(" max=\"" + escapeHtmlAttr(_0x462c8b.max) + "\"");
  }
  _0x19e891.push(" step=\"" + escapeHtmlAttr(_0x462c8b?.step ?? (_0xbdca4a === "decimal" ? "any" : 1)) + "\"");
  const _0x4ec086 = resolveFieldDisabled(_0x462c8b, _0x284ecd) ? " disabled aria-disabled=\"true\" data-ui-schema-disabled=\"true\"" : "";
  return "<div class=\"ui-schema-field ui-schema-rh-aiapp-footer-param ui-schema-rh-aiapp-footer-param--input\" data-ui-schema-field=\"" + escapeHtmlAttr(_0x263677) + "\" data-ui-schema-type=\"" + escapeHtmlAttr(_0x95455) + "\" data-ui-schema-default=\"" + escapeHtmlAttr(_0x12e83b) + "\" data-ui-schema-footer-label=\"" + escapeHtmlAttr(_0x2aca8b) + "\"" + _0x1d5fbe + renderStepperAttrs(_0x462c8b, _0x95455) + ">\n    <label class=\"ui-schema-rh-aiapp-footer-inline\">\n      <span class=\"ui-schema-rh-aiapp-footer-inline-label\">" + escapeHtmlAttr(_0x2aca8b) + "</span>\n      <span class=\"ui-schema-rh-aiapp-footer-inline-separator\">·</span>\n      <input class=\"ui-schema-rh-aiapp-footer-input\" data-ui-schema-input=\"" + escapeHtmlAttr(_0x263677) + "\" type=\"number\" inputmode=\"" + escapeHtmlAttr(_0xbdca4a) + "\" value=\"" + escapeHtmlAttr(_0x487d11) + "\" aria-label=\"" + escapeHtmlAttr(_0x2aca8b) + "\"" + _0x19e891.join("") + _0x4ec086 + ">\n    </label>\n  </div>";
}
function renderRhAiAppFooterToggleField({
  field: _0x28a579,
  id: _0x57f754,
  type: _0x25d12f,
  value: _0x3cce33,
  label: _0x26c999,
  defaultValue: _0x298662,
  valueTypeAttr: _0x442e11,
  nodeData: _0x4ce6c0
}) {
  const _0x25d121 = isRhAiAppFooterToggleOn(_0x3cce33);
  const _0x128cfa = resolveFieldDisabled(_0x28a579, _0x4ce6c0) ? " disabled aria-disabled=\"true\" data-ui-schema-disabled=\"true\"" : "";
  const _0x3af1f5 = formatRhAiAppFooterParamValue(_0x25d12f, _0x25d121);
  return "<div class=\"ui-schema-field ui-schema-rh-aiapp-footer-param ui-schema-rh-aiapp-footer-param--toggle\" data-ui-schema-field=\"" + escapeHtmlAttr(_0x57f754) + "\" data-ui-schema-type=\"" + escapeHtmlAttr(_0x25d12f) + "\" data-ui-schema-default=\"" + escapeHtmlAttr(_0x298662) + "\" data-ui-schema-footer-label=\"" + escapeHtmlAttr(_0x26c999) + "\"" + _0x442e11 + ">\n    <button type=\"button\" class=\"img-pill-btn ui-schema-rh-aiapp-footer-toggle\" data-ui-schema-rh-aiapp-footer-toggle=\"true\" data-ui-schema-value=\"" + escapeHtmlAttr(_0x25d121 ? "false" : "true") + "\" aria-pressed=\"" + escapeHtmlAttr(_0x25d121) + "\"" + _0x128cfa + ">\n      <span class=\"ui-schema-pill-label\">" + escapeHtmlAttr(_0x26c999) + "</span>\n      <span class=\"ui-schema-rh-aiapp-footer-separator\" aria-hidden=\"true\">·</span>\n      <span class=\"ui-schema-rh-aiapp-footer-value\">" + escapeHtmlAttr(_0x3af1f5) + "</span>\n    </button>\n  </div>";
}
function renderRhAiAppFooterParamField(_0x41560a, _0x4b56ad) {
  assertSupportedField(_0x41560a);
  const _0x11397e = String(_0x41560a?.id || "").trim();
  const _0x3e8ad5 = normalizeControlType(_0x41560a?.type);
  const _0x13fca4 = getFieldValue(_0x4b56ad, _0x41560a);
  const _0x3f96a3 = manifestText(_0x41560a?.label || _0x11397e);
  const _0x39f5f2 = _0x41560a?.defaultValue ?? "";
  const _0x52a221 = typeof _0x41560a?.defaultValue === "boolean" ? " data-ui-schema-value-type=\"boolean\"" : _0x3e8ad5 === "stepper" ? " data-ui-schema-value-type=\"number\"" : "";
  const _0x449a1d = _0x3e8ad5 === "stepper" ? " ui-schema-rh-video-stepper" : "";
  if (_0x3e8ad5 === "stepper") {
    return renderRhAiAppFooterDirectNumberField({
      field: _0x41560a,
      id: _0x11397e,
      type: _0x3e8ad5,
      value: _0x13fca4,
      label: _0x3f96a3,
      defaultValue: _0x39f5f2,
      valueTypeAttr: _0x52a221,
      nodeData: _0x4b56ad
    });
  }
  if (_0x3e8ad5 === "toggle") {
    return renderRhAiAppFooterToggleField({
      field: _0x41560a,
      id: _0x11397e,
      type: _0x3e8ad5,
      value: _0x13fca4,
      label: _0x3f96a3,
      defaultValue: _0x39f5f2,
      valueTypeAttr: _0x52a221,
      nodeData: _0x4b56ad
    });
  }
  const _0x67cf07 = renderControl(_0x41560a, _0x13fca4, _0x3e8ad5, {
    nodeData: _0x4b56ad,
    advanced: true
  });
  const _0x1326ea = formatRhAiAppFooterParamValue(_0x3e8ad5, _0x13fca4);
  const _0x8b1517 = _0x1326ea ? _0x3f96a3 + " · " + _0x1326ea : _0x3f96a3;
  return "<div class=\"ui-schema-field ui-schema-pill-menu ui-schema-rh-aiapp-footer-param" + _0x449a1d + "\" data-ui-schema-field=\"" + escapeHtmlAttr(_0x11397e) + "\" data-ui-schema-type=\"" + escapeHtmlAttr(_0x3e8ad5) + "\" data-ui-schema-default=\"" + escapeHtmlAttr(_0x39f5f2) + "\" data-ui-schema-footer-label=\"" + escapeHtmlAttr(_0x3f96a3) + "\"" + _0x52a221 + renderStepperAttrs(_0x41560a, _0x3e8ad5) + ">\n    <button type=\"button\" class=\"img-pill-btn ui-schema-menu-trigger\" data-ui-schema-menu-trigger=\"" + escapeHtmlAttr(_0x11397e) + "\">\n      <span class=\"ui-schema-pill-label\">" + escapeHtmlAttr(_0x8b1517) + "</span>\n    </button>\n    <div class=\"floating-menu ui-schema-floating-menu ui-schema-rh-aiapp-footer-menu\">\n      <div class=\"ui-schema-floating-menu-title\">" + escapeHtmlAttr(_0x3f96a3) + "</div>\n      <div class=\"ui-schema-rh-aiapp-footer-control\">" + _0x67cf07 + "</div>\n    </div>\n  </div>";
}
function renderField(_0x3e4cd2, _0x43c124, _0x4908f6 = {}) {
  assertSupportedField(_0x3e4cd2);
  const _0x1eb90f = String(_0x3e4cd2?.id || "").trim();
  const _0x2dfccc = normalizeControlType(_0x3e4cd2?.type);
  const _0x141f96 = _0x3e4cd2?.variant || _0x4908f6?.variant;
  if (String(_0x141f96 || "").trim() === "rhAiAppFooterParam") {
    return renderRhAiAppFooterParamField(_0x3e4cd2, _0x43c124);
  }
  const _0x237c24 = {
    renderRhV54ControlModeField: renderRhV54ControlModeField,
    renderRhV54BooleanRowField: renderRhV54BooleanRowField,
    renderRhV54MaskExpandField: renderRhV54MaskExpandField,
    renderRhV54SpecialModeField: renderRhV54SpecialModeField,
    renderRhV54BreastJiggleField: renderRhV54BreastJiggleField,
    renderAdvancedRowField: renderAdvancedRowField,
    renderRandomSeedRowField: renderRandomSeedRowField,
    renderPillMenuField: renderPillMenuField,
    renderAspectRatioPillField: renderAspectRatioPillField,
    renderVoiceQualityRatioField: renderVoiceQualityRatioField,
    renderSectionMenuField: renderSectionMenuField,
    renderResolutionPillField: renderResolutionPillField,
    renderDurationPillField: renderDurationPillField,
    renderInstanceToggleField: renderInstanceToggleField
  };
  const _0x55b927 = resolveUiSchemaFieldAdapterDefinition(_0x3e4cd2, {
    type: _0x2dfccc,
    variant: _0x141f96
  });
  if (_0x55b927 && typeof _0x55b927.render === "function") {
    return _0x55b927.render({
      field: _0x3e4cd2,
      nodeData: _0x43c124,
      options: _0x4908f6,
      type: _0x2dfccc,
      variant: _0x141f96,
      helpers: {
        renderControl: renderControl
      }
    });
  }
  const _0x4c73c9 = _0x55b927?.renderer || resolveUiSchemaFieldAdapter(_0x3e4cd2, {
    type: _0x2dfccc,
    variant: _0x141f96
  });
  if (_0x4c73c9 && typeof _0x237c24[_0x4c73c9] === "function") {
    return _0x237c24[_0x4c73c9](_0x3e4cd2, _0x43c124, _0x4908f6);
  }
  const _0x18aac3 = getFieldValue(_0x43c124, _0x3e4cd2);
  const _0x391f45 = manifestText(_0x3e4cd2?.label || _0x1eb90f);
  const _0x2d09ae = _0x3e4cd2?.defaultValue ?? "";
  let _0x21c890;
  if (_0x141f96 === "pillmenu" && (_0x2dfccc === "segmented" || _0x2dfccc === "select")) {
    _0x21c890 = renderDropdownControl(_0x3e4cd2, _0x18aac3, _0x43c124);
  } else {
    _0x21c890 = renderControl(_0x3e4cd2, _0x18aac3, _0x2dfccc, {
      nodeData: _0x43c124
    });
  }
  const _0x125af1 = _0x2dfccc === "stepper" ? " ui-schema-rh-video-stepper" : "";
  const _0x3be4da = _0x2dfccc === "stepper" ? " data-ui-schema-value-type=\"number\"" : "";
  return "<div class=\"ui-schema-field" + _0x125af1 + "\" data-ui-schema-field=\"" + escapeHtmlAttr(_0x1eb90f) + "\" data-ui-schema-type=\"" + escapeHtmlAttr(_0x2dfccc) + "\" data-ui-schema-default=\"" + escapeHtmlAttr(_0x2d09ae) + "\"" + _0x3be4da + renderStepperAttrs(_0x3e4cd2, _0x2dfccc) + ">\n    <div class=\"rh-adv-title ui-schema-field-label\">" + escapeHtmlAttr(_0x391f45) + "</div>\n    <div class=\"ui-schema-field-control\">" + _0x21c890 + "</div>\n  </div>";
}
function isStandaloneResolutionField(_0x194c00) {
  if (_0x194c00?.standaloneInResolution === true) {
    return true;
  }
  return String(_0x194c00?.resolutionComposite || "").trim().toLowerCase() === "standalone";
}
function renderResolutionPlacementFields(_0x55dba9, _0x525a5e, _0x1087be = {}) {
  const _0x29e2a7 = getFieldById(_0x55dba9, "rhVideoResolution") || getFieldById(_0x55dba9, "videoResolution");
  const _0xdfa57b = String(_0x29e2a7?.resolutionComposite || "").trim() === "qualityRatio";
  if (_0x29e2a7 && !_0xdfa57b) {
    const _0xc7b7f1 = new Set(["rhVideoResolution", "videoResolution", "rhVideoFps", "rhVideoFrames"]);
    const _0x5832f7 = _0x55dba9.filter(_0x5b221c => !_0xc7b7f1.has(String(_0x5b221c?.id || "").trim()));
    return [renderVideoResolutionField(_0x55dba9, _0x525a5e), ..._0x5832f7.map(_0x4b4f51 => renderField(_0x4b4f51, _0x525a5e, _0x1087be))].join("");
  }
  const _0x681ce5 = new Set(["imageSize", "resolution", "videoSize", "videoResolution", "quality"]);
  const _0x47ca88 = _0x55dba9.filter(_0x4973d9 => {
    if (isStandaloneResolutionField(_0x4973d9)) {
      return false;
    }
    const _0x55789c = String(_0x4973d9?.id || "").trim();
    const _0x46b5ef = String(_0x4973d9?.displayRole || "").trim();
    return _0x46b5ef === "resolution" || _0x681ce5.has(_0x55789c);
  });
  const _0x536d47 = _0x47ca88[0] || null;
  const _0x192ceb = getFieldById(_0x55dba9, "aspectRatio") || getFieldByDisplayRole(_0x55dba9, "aspectRatio");
  if (_0x536d47 && _0x192ceb) {
    const _0x28b86d = new Set([..._0x47ca88, _0x192ceb].map(_0x44e2b4 => String(_0x44e2b4?.id || "").trim()));
    let _0x49928b = false;
    return _0x55dba9.map(_0x337bad => {
      const _0x62db88 = String(_0x337bad?.id || "").trim();
      if (!_0x28b86d.has(_0x62db88)) {
        return renderField(_0x337bad, _0x525a5e, _0x1087be);
      }
      if (_0x49928b) {
        return "";
      }
      _0x49928b = true;
      return renderQualityRatioField(_0x47ca88, _0x192ceb, _0x525a5e);
    }).join("");
  }
  return _0x55dba9.map(_0x425c7a => renderField(_0x425c7a, _0x525a5e, _0x1087be)).join("");
}
function renderModePlacementFields(_0xebc2be, _0x1c7da5, _0x493628 = {}) {
  const _0x13efc3 = _0xebc2be.find(_0x453bff => String(_0x453bff?.variant || "").trim() === "voiceQualityRatio");
  if (_0x13efc3) {
    const _0x4386da = String(_0x13efc3?.compositeWith || "").trim();
    const _0x4835db = _0x4386da ? _0xebc2be.find(_0x3f59af => String(_0x3f59af?.id || "").trim() === _0x4386da) : null;
    if (_0x4835db) {
      const _0x2216e4 = new Set([_0x13efc3.id, _0x4835db.id]);
      const _0x222418 = _0xebc2be.filter(_0x5cf7be => !_0x2216e4.has(String(_0x5cf7be?.id || "").trim()));
      return [renderVoiceQualityRatioField([_0x13efc3, _0x4835db], _0x1c7da5), ..._0x222418.map(_0x1ee132 => renderField(_0x1ee132, _0x1c7da5, _0x493628))].join("");
    }
  }
  const _0x5376e9 = _0xebc2be.filter(_0x3ef557 => String(_0x3ef557?.variant || "").trim() === "sectionMenu");
  if (_0x5376e9.length >= 2) {
    const _0x577e92 = new Set(_0x5376e9.map(_0x4998f7 => String(_0x4998f7?.id || "").trim()));
    const _0x68adfd = _0xebc2be.filter(_0x31f87f => !_0x577e92.has(String(_0x31f87f?.id || "").trim()));
    return [renderSectionPairField(_0x5376e9, _0x1c7da5), ..._0x68adfd.map(_0x35fa90 => renderField(_0x35fa90, _0x1c7da5, _0x493628))].join("");
  }
  return _0xebc2be.map(_0x15b60e => renderField(_0x15b60e, _0x1c7da5, _0x493628)).join("");
}
export function hasModelUiSchema(_0x3c1308, _0xe2a5b7 = {}) {
  const _0x301545 = getUiSchemaFields(_0x3c1308, _0xe2a5b7);
  _0x301545.forEach(assertSupportedField);
  return _0x301545.length > 0;
}
export function hasVisibleModelUiSchema(_0xef17c5, _0x38218a = {}, _0x1d9f6e = {}) {
  const _0x2fd03d = getUiSchemaFields(_0xef17c5, _0x1d9f6e);
  _0x2fd03d.forEach(assertSupportedField);
  return filterVisibleUiSchemaFields(_0x2fd03d, _0x38218a).length > 0;
}
function renderUiSchemaControls(_0x49ab07, _0x33e20b = {}, _0x2864fb = {}) {
  const _0x2b8bc7 = filterVisibleUiSchemaFields(filterUiSchemaFields(_0x49ab07, _0x2864fb), _0x33e20b);
  if (!_0x2b8bc7.length) {
    return "";
  }
  const _0x24db04 = normalizePlacement(_0x2864fb?.placement);
  const _0x322b30 = _0x24db04 === "resolution" ? renderResolutionPlacementFields(_0x2b8bc7, _0x33e20b, _0x2864fb) : _0x24db04 === "mode" ? renderModePlacementFields(_0x2b8bc7, _0x33e20b, _0x2864fb) : _0x24db04 === "advanced" ? _0x2b8bc7.map(_0x27b542 => renderField(_0x27b542, _0x33e20b, {
    ..._0x2864fb,
    variant: _0x27b542?.variant || _0x2864fb?.variant || "advancedRow"
  })).join("") : _0x24db04 === "videoparams" ? renderRhVideoParamsPlacementFields(_0x2b8bc7, _0x33e20b, _0x2864fb) : _0x2b8bc7.map(_0x38bf20 => renderField(_0x38bf20, _0x33e20b, _0x2864fb)).join("");
  if (!_0x322b30) {
    return "";
  }
  if (_0x2864fb?.unwrap === true) {
    return _0x322b30;
  }
  const _0x2f340a = _0x24db04 ? " data-ui-schema-placement=\"" + escapeHtmlAttr(_0x24db04) + "\"" : "";
  const _0x21c3e0 = _0x2864fb?.modelId ? " data-ui-schema-model=\"" + escapeHtmlAttr(_0x2864fb.modelId) + "\"" : "";
  const _0x76eb2d = _0x2864fb?.sourceId ? " data-ui-schema-source=\"" + escapeHtmlAttr(_0x2864fb.sourceId) + "\"" : "";
  return "<div class=\"ui-schema-renderer\"" + _0x21c3e0 + _0x76eb2d + _0x2f340a + ">" + _0x322b30 + "</div>";
}
export function renderModelUiSchemaControls(_0x191d86, _0x2c6334 = {}, _0x34debe = {}) {
  const _0x5c0502 = getUiSchemaFields(_0x191d86, _0x34debe);
  return renderUiSchemaControls(_0x5c0502, _0x2c6334, {
    ..._0x34debe,
    modelId: _0x191d86
  });
}
export function renderUiSchemaFields(_0x41f8c7, _0x460929 = {}, _0x405c96 = {}) {
  return renderUiSchemaControls(_0x41f8c7, _0x460929, {
    ..._0x405c96,
    ignorePlacementFilter: true
  });
}
export function buildUiSchemaParamPatch(_0x108e62 = {}, _0x5b5892 = "", _0x29695b = "") {
  return a338_0x2b9b64(_0x108e62, _0x5b5892, _0x29695b);
}
export function buildModelUiSchemaDefaultParams(_0x5cb997) {
  const _0x218c4c = getUiSchemaFields(_0x5cb997);
  _0x218c4c.forEach(assertSupportedField);
  return sanitizeModelUiSchemaParams(_0x5cb997);
}
function handleRandomSeedRowBindEvent({
  event: _0x2b7a13,
  eventName: _0x4a6a44,
  fieldEl: _0x569532,
  helpers = {}
} = {}) {
  if (_0x4a6a44 !== "click" || !_0x569532) {
    return false;
  }
  const _0x4905f6 = helpers.commitValue;
  if (typeof _0x4905f6 !== "function") {
    return false;
  }
  const _0x25bcc1 = typeof helpers.setRhVideoStepperValueEl === "function" ? helpers.setRhVideoStepperValueEl : () => {};
  const _0x5c49d2 = typeof helpers.generateRandomSeedForField === "function" ? helpers.generateRandomSeedForField : () => "";
  const _0x3b8b5c = _0x2b7a13?.target?.closest?.("[data-ui-schema-random-seed-mode]");
  if (_0x3b8b5c && _0x569532.contains(_0x3b8b5c)) {
    _0x2b7a13.preventDefault?.();
    _0x2b7a13.stopPropagation?.();
    const _0x51d312 = String(_0x3b8b5c.dataset.uiSchemaRandomSeedModeField || _0x569532.dataset?.uiSchemaRandomSeedModeField || "").trim();
    const _0x314c49 = normalizeRandomSeedMode(_0x3b8b5c.dataset.uiSchemaRandomSeedMode, "fixed");
    if (!_0x51d312) {
      return true;
    }
    _0x4905f6(_0x51d312, _0x314c49);
    if (_0x314c49 === "random") {
      const _0x5dd25a = String(_0x569532.dataset.uiSchemaField || "").trim();
      const _0x48a11b = _0x5c49d2(_0x569532);
      if (_0x569532.classList?.contains("ui-schema-rh-video-stepper")) {
        _0x25bcc1(_0x569532, _0x48a11b);
      }
      const _0xe4aeb7 = _0x569532.querySelector("[data-ui-schema-input]");
      if (_0xe4aeb7) {
        _0xe4aeb7.value = _0x48a11b;
      }
      if (_0x5dd25a) {
        _0x4905f6(_0x5dd25a, _0x48a11b);
      }
    }
    return true;
  }
  const _0x4aa685 = _0x2b7a13?.target?.closest?.("[data-ui-schema-random-seed]");
  if (_0x4aa685 && _0x569532.contains(_0x4aa685)) {
    _0x2b7a13.preventDefault?.();
    _0x2b7a13.stopPropagation?.();
    const _0x1669c7 = String(_0x569532?.dataset?.uiSchemaField || "").trim();
    if (!_0x1669c7) {
      return true;
    }
    const _0x29d3fd = _0x5c49d2(_0x569532);
    if (_0x569532.classList?.contains("ui-schema-rh-video-stepper")) {
      _0x25bcc1(_0x569532, _0x29d3fd);
    }
    const _0x211e1b = _0x569532.querySelector("[data-ui-schema-input]");
    if (_0x211e1b) {
      _0x211e1b.value = _0x29d3fd;
    }
    _0x4905f6(_0x1669c7, _0x29d3fd);
    return true;
  }
  return false;
}
configureUiSchemaFieldAdapter("field.randomSeedRow", {
  render: ({
    field: _0xb2e595,
    nodeData: _0x23c0e7
  }) => renderRandomSeedRowField(_0xb2e595, _0x23c0e7),
  sync: ({
    fieldEl: _0x20d852,
    nodeData: _0x2acf8b
  }) => syncRandomSeedField(_0x20d852, _0x2acf8b),
  bind: handleRandomSeedRowBindEvent,
  normalize: ({
    field: _0x1d56ec,
    value: _0x44ab49,
    helpers = {}
  }) => {
    const _0x56a01c = typeof helpers.normalizeUiSchemaFieldValue === "function" ? helpers.normalizeUiSchemaFieldValue : normalizeUiSchemaFieldValue;
    return _0x56a01c(_0x1d56ec, _0x44ab49);
  }
});
configureUiSchemaFieldAdapter("field.durationPill.slider", {
  render: ({
    field: _0x477b66,
    nodeData: _0x591126
  }) => renderDurationPillField(_0x477b66, _0x591126),
  sync: ({
    fieldEl: _0x498254,
    nodeData: _0x2ec2da,
    helpers = {}
  }) => {
    const _0x36ab6f = String(_0x498254?.dataset?.uiSchemaField || "").trim();
    if (!_0x36ab6f) {
      return;
    }
    const _0x4bf53b = typeof helpers.getNodeFieldValue === "function" ? helpers.getNodeFieldValue(_0x2ec2da, _0x36ab6f, _0x498254.dataset.uiSchemaDefault) : _0x2ec2da?.[_0x36ab6f];
    syncDurationPillField(_0x498254, _0x4bf53b);
  }
});
configureUiSchemaFieldAdapter("field.resolutionPill.slider", {
  render: ({
    field: _0x433bcd,
    nodeData: _0x23c43f
  }) => renderResolutionPillField(_0x433bcd, _0x23c43f),
  sync: ({
    fieldEl: _0x518146,
    nodeData: _0x197dac,
    helpers = {}
  }) => {
    const _0x2cae19 = String(_0x518146?.dataset?.uiSchemaField || "").trim();
    if (!_0x2cae19) {
      return;
    }
    const _0x60cc99 = typeof helpers.getNodeFieldValue === "function" ? helpers.getNodeFieldValue(_0x197dac, _0x2cae19, _0x518146.dataset.uiSchemaDefault) : _0x197dac?.[_0x2cae19];
    syncResolutionPillField(_0x518146, _0x60cc99);
  }
});
function bindUiSchemaControls(_0x97557d, {
  getNodeData: _0xcb5678,
  commitFieldValue: _0x1586c1
} = {}) {
  return createUiSchemaBindingSession(_0x97557d, {
    getNodeData: _0xcb5678,
    commitFieldValue: _0x1586c1
  }, {
    RANDOM_SEED_DEFAULT_MAX: RANDOM_SEED_DEFAULT_MAX,
    RANDOM_SEED_DEFAULT_MIN: RANDOM_SEED_DEFAULT_MIN,
    UI_SCHEMA_POPUP_EXIT_MS: UI_SCHEMA_POPUP_EXIT_MS,
    evaluateUiSchemaNumberExpression: evaluateUiSchemaNumberExpression,
    formatRhV54BreastJiggle: formatRhV54BreastJiggle,
    getNodeFieldValue: getNodeFieldValue,
    getOptionDisableRepairPatch: getOptionDisableRepairPatch,
    getRangeValueDisplayLabel: getRangeValueDisplayLabel,
    getRenderedOptionDisableWhen: getRenderedOptionDisableWhen,
    getRhV54BreastJiggleRangeFromFieldEl: getRhV54BreastJiggleRangeFromFieldEl,
    getUiSchemaFieldAdapterDefinition: getUiSchemaFieldAdapterDefinition,
    normalizeRhV54MaskExpand: normalizeRhV54MaskExpand,
    openExternalLink: openExternalLink,
    parseRangeValuesFromFieldEl: parseRangeValuesFromFieldEl,
    syncInstanceToggleField: syncInstanceToggleField,
    syncModelUiSchemaControls: syncModelUiSchemaControls,
    syncRhAiAppFooterParamField: syncRhAiAppFooterParamField,
    t: t
  });
}
export function bindModelUiSchemaControls(_0xe9717c, {
  nodeId: _0x582fba,
  nodeData: _0x3cef80,
  store: _0x36dd7b,
  buildPatch: _0x233b89,
  decorateNodeData: _0x3267d2,
  afterCommit: _0xf53fa3
} = {}) {
  if (!_0xe9717c || !_0x36dd7b || !_0x582fba) {
    return () => {};
  }
  const _0x4670b4 = () => {
    const _0xc3af68 = _0x36dd7b.getState?.().nodes?.[_0x582fba] || _0x3cef80 || {};
    if (typeof _0x3267d2 === "function") {
      return _0x3267d2(_0xc3af68);
    } else {
      return _0xc3af68;
    }
  };
  return bindUiSchemaControls(_0xe9717c, {
    getNodeData: _0x4670b4,
    commitFieldValue: (_0x413a95, _0x13a9a7, _0x31e3f6) => {
      const _0x120448 = buildUiSchemaParamPatch(_0x31e3f6, _0x413a95, _0x13a9a7);
      const _0x1cd02a = typeof _0x233b89 === "function" ? _0x233b89(_0x31e3f6, _0x413a95, _0x13a9a7, _0x120448) : {};
      const _0x25e01e = {
        ..._0x120448,
        ...(_0x1cd02a && typeof _0x1cd02a === "object" ? _0x1cd02a : {})
      };
      _0x36dd7b.updateNodeData(_0x582fba, _0x25e01e);
      const _0x1521f4 = {
        ..._0x31e3f6,
        ..._0x25e01e
      };
      const _0x20ae61 = typeof _0x3267d2 === "function" ? _0x3267d2(_0x1521f4) : _0x1521f4;
      _0xf53fa3?.(_0x413a95, _0x13a9a7, _0x20ae61, {
        latest: _0x31e3f6,
        patch: _0x25e01e
      });
      return _0x20ae61;
    }
  });
}
export function bindUiSchemaFieldControls(_0x3716cd, {
  getNodeData: _0x3ec52e,
  commitFieldValue: _0x269b7a
} = {}) {
  return bindUiSchemaControls(_0x3716cd, {
    getNodeData: _0x3ec52e,
    commitFieldValue: _0x269b7a
  });
}
const uiSchemaStateOwner = createUiSchemaStateOwner({
  getUiSchemaValueOptions: getUiSchemaValueOptions,
  findUiSchemaValueOption: findUiSchemaValueOption,
  findFirstEnabledUiSchemaValueOption: findFirstEnabledUiSchemaValueOption,
  syncInstanceToggleField: syncInstanceToggleField,
  syncStepperField: syncStepperField,
  syncRhAiAppFooterParamField: syncRhAiAppFooterParamField,
  parseRangeValuesFromFieldEl: parseRangeValuesFromFieldEl,
  findRangeValueIndex: findRangeValueIndex,
  normalizeRhV54SpecialMode: normalizeRhV54SpecialMode,
  normalizeRhV54SinglePreset: normalizeRhV54SinglePreset,
  normalizeRhV54MaskExpand: normalizeRhV54MaskExpand,
  formatRhV54BreastJiggle: formatRhV54BreastJiggle,
  getRhV54BreastJiggleRangeFromFieldEl: getRhV54BreastJiggleRangeFromFieldEl,
  normalizeNumberValue: normalizeNumberValue,
  formatMetricLabel: formatMetricLabel,
  joinMetricLabels: joinMetricLabels
});
export function syncModelUiSchemaControls(_0x17270f, _0x57495b = {}) {
  return uiSchemaStateOwner.syncModelUiSchemaControls(_0x17270f, _0x57495b);
}