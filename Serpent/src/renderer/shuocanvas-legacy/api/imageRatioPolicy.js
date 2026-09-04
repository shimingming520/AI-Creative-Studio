import { NANO_BANANA_FAMILIES, getNanoBananaAllowedRatioOptions, isNanoBananaFamily, resolveNanoBananaSelectionFromModel } from "../src/modules/nanoBananaModeRules.js";
import { resolveModelExecution } from "../src/manifests/index.js";
const DEFAULT_RATIO_LABEL = "1:1";
const DEFAULT_RATIO_OPTIONS = Object.freeze([Object.freeze({
  label: "1:1",
  w: 1,
  h: 1,
  value: 1
}), Object.freeze({
  label: "9:16",
  w: 9,
  h: 16,
  value: 9 / 16
}), Object.freeze({
  label: "16:9",
  w: 16,
  h: 9,
  value: 16 / 9
}), Object.freeze({
  label: "3:4",
  w: 3,
  h: 4,
  value: 3 / 4
}), Object.freeze({
  label: "4:3",
  w: 4,
  h: 3,
  value: 4 / 3
}), Object.freeze({
  label: "3:2",
  w: 3,
  h: 2,
  value: 3 / 2
}), Object.freeze({
  label: "2:3",
  w: 2,
  h: 3,
  value: 2 / 3
}), Object.freeze({
  label: "5:4",
  w: 5,
  h: 4,
  value: 5 / 4
}), Object.freeze({
  label: "4:5",
  w: 4,
  h: 5,
  value: 4 / 5
}), Object.freeze({
  label: "21:9",
  w: 21,
  h: 9,
  value: 21 / 9
})]);
const DREAMINA_RATIO_OPTIONS = Object.freeze(DEFAULT_RATIO_OPTIONS.filter(_0x3d54b7 => _0x3d54b7.label !== "5:4" && _0x3d54b7.label !== "4:5"));
const DIMENSION_QUALITY_PIXEL_MAP = Object.freeze({
  "1K": 1048576,
  "2K": 4194304,
  "3K": 6553600,
  "4K": 8294400
});
const DIMENSION_DEFAULT_QUALITY = "2K";
const DIMENSION_ALIGN = 8;
const DIMENSION_MIN = 512;
const DIMENSION_MAX = 8192;
function isFinitePositive(_0x597645) {
  const _0x177fde = Number(_0x597645);
  return Number.isFinite(_0x177fde) && _0x177fde > 0;
}
function normalizeImageSizeLabel(_0x55737d) {
  return String(_0x55737d || "").trim().toUpperCase();
}
function resolveManifestRatioContext(_0x27416a, _0x1a82be) {
  try {
    return resolveModelExecution(_0x1a82be, {
      providerHint: _0x27416a
    }) || null;
  } catch {
    return null;
  }
}
function getManifestRatioPolicy(_0x3afe36, _0x5c1cf5) {
  const _0x573e0f = resolveManifestRatioContext(_0x3afe36, _0x5c1cf5);
  const _0x6bd953 = _0x573e0f?.modelManifest?.extensions?.ratioPolicy || _0x573e0f?.executionManifest?.extensions?.ratioPolicy || null;
  if (_0x6bd953 && typeof _0x6bd953 === "object") {
    return {
      policy: _0x6bd953,
      resolved: _0x573e0f
    };
  } else {
    return {
      policy: null,
      resolved: _0x573e0f
    };
  }
}
function normalizeCompareValue(_0x48386b) {
  return String(_0x48386b ?? "").trim().toLowerCase();
}
function getNodeFieldValue(_0x47aebc, _0x24f321, _0x1f07be = "") {
  if (!_0x47aebc || typeof _0x47aebc !== "object") {
    return _0x1f07be;
  }
  return _0x47aebc[_0x24f321] ?? _0x47aebc?.generationParams?.[_0x24f321] ?? _0x1f07be;
}
function getOptionDisableWhen(_0x4ae9c5) {
  if (!_0x4ae9c5 || typeof _0x4ae9c5 !== "object" || Array.isArray(_0x4ae9c5)) {
    return null;
  }
  const _0x5578ed = _0x4ae9c5.disableWhen || _0x4ae9c5.disabledWhen;
  if (_0x5578ed && (Array.isArray(_0x5578ed) || typeof _0x5578ed === "object" && !Array.isArray(_0x5578ed))) {
    return _0x5578ed;
  } else {
    return null;
  }
}
function optionDisableWhenMatches(_0x1a008c, _0x290ceb = {}) {
  if (Array.isArray(_0x1a008c)) {
    return _0x1a008c.some(_0x5acb46 => optionDisableWhenMatches(_0x5acb46, _0x290ceb));
  }
  if (!_0x1a008c || typeof _0x1a008c !== "object") {
    return false;
  }
  if (Array.isArray(_0x1a008c.any)) {
    return _0x1a008c.any.some(_0x2f15a9 => optionDisableWhenMatches(_0x2f15a9, _0x290ceb));
  }
  if (Array.isArray(_0x1a008c.all)) {
    return _0x1a008c.all.every(_0x409860 => optionDisableWhenMatches(_0x409860, _0x290ceb));
  }
  const _0x23fe33 = String(_0x1a008c?.field || _0x1a008c?.param || "").trim();
  if (!_0x23fe33) {
    return false;
  }
  const _0x5c21f4 = _0x1a008c.values !== undefined ? _0x1a008c.values : _0x1a008c.value;
  const _0x22d94e = Array.isArray(_0x5c21f4) ? _0x5c21f4 : [_0x5c21f4];
  const _0x559354 = _0x22d94e.map(normalizeCompareValue);
  return _0x559354.includes(normalizeCompareValue(getNodeFieldValue(_0x290ceb, _0x23fe33, "")));
}
function isOptionDisabled(_0x4ad064, _0x36e0f8 = {}) {
  return _0x4ad064 && typeof _0x4ad064 === "object" && !Array.isArray(_0x4ad064) && (_0x4ad064.disabled === true || optionDisableWhenMatches(getOptionDisableWhen(_0x4ad064), _0x36e0f8));
}
function findUiSchemaField(_0x3393e4, _0x44001c) {
  return (Array.isArray(_0x3393e4?.uiSchema?.fields) ? _0x3393e4.uiSchema.fields : []).find(_0x5185d0 => {
    const _0x20b5ba = String(_0x5185d0?.id || "").trim();
    const _0x21e9f1 = String(_0x5185d0?.displayRole || "").trim();
    return _0x20b5ba === _0x44001c || _0x21e9f1 === _0x44001c;
  });
}
function toRatioOption(_0x1cb5f8) {
  const _0x1451bb = parseRatioLabel(_0x1cb5f8);
  if (!_0x1451bb) {
    return null;
  }
  return Object.freeze({
    label: _0x1451bb.label,
    w: _0x1451bb.w,
    h: _0x1451bb.h,
    value: _0x1451bb.w / _0x1451bb.h
  });
}
function labelsToRatioOptions(_0x444db8) {
  return Object.freeze((Array.isArray(_0x444db8) ? _0x444db8 : []).map(_0x1aa38a => toRatioOption(_0x1aa38a)).filter(Boolean));
}
function getPolicyRatiosForImageSize(_0x44d1b7, _0x3cf964) {
  const _0x3dee25 = normalizeImageSizeLabel(_0x3cf964);
  const _0x2b77eb = _0x44d1b7?.ratiosByImageSize;
  if (_0x3dee25 && _0x2b77eb && typeof _0x2b77eb === "object" && _0x2b77eb[_0x3dee25]) {
    return labelsToRatioOptions(_0x2b77eb[_0x3dee25]);
  }
  if (Array.isArray(_0x44d1b7?.ratios)) {
    return labelsToRatioOptions(_0x44d1b7.ratios);
  }
  return null;
}
function getUiSchemaRatioOptions(_0x2aa53d, _0x1d3662) {
  const _0x2aed28 = findUiSchemaField(_0x2aa53d?.modelManifest, "aspectRatio");
  const _0x19589b = Array.isArray(_0x2aed28?.options) ? _0x2aed28.options : [];
  if (_0x19589b.length === 0) {
    return null;
  }
  const _0x52d7d9 = {
    imageSize: normalizeImageSizeLabel(_0x1d3662)
  };
  const _0x1e0077 = _0x19589b.filter(_0x15754d => !isOptionDisabled(_0x15754d, _0x52d7d9)).map(_0x2ca4f0 => String(_0x2ca4f0?.value ?? _0x2ca4f0).trim()).filter(_0x1fbd90 => _0x1fbd90 && !isAdaptiveRatioLabel(_0x1fbd90)).map(_0x298835 => toRatioOption(_0x298835)).filter(Boolean);
  if (_0x1e0077.length > 0) {
    return Object.freeze(_0x1e0077);
  } else {
    return null;
  }
}
function getManifestAllowedRatios(_0x2ea789, _0x59b7d8, _0x28db51) {
  const {
    policy: _0x44ad26,
    resolved: _0x156df0
  } = getManifestRatioPolicy(_0x2ea789, _0x59b7d8);
  if (!_0x156df0?.modelManifest) {
    return null;
  }
  const _0x46381e = getPolicyRatiosForImageSize(_0x44ad26, _0x28db51);
  if (_0x46381e?.length > 0) {
    return _0x46381e;
  }
  return getUiSchemaRatioOptions(_0x156df0, _0x28db51);
}
function getManifestRatioCapability(_0x3acbc6, _0x2a2bea) {
  const {
    policy: _0x381965,
    resolved: _0x56e44e
  } = getManifestRatioPolicy(_0x3acbc6, _0x2a2bea);
  const _0x5979a0 = String(_0x381965?.capability || "").trim();
  if (_0x5979a0) {
    return _0x5979a0;
  }
  if (!_0x56e44e?.modelManifest) {
    return "";
  }
  if (_0x56e44e.modelManifest.adapterType === "workflow") {
    return "none";
  }
  if (findUiSchemaField(_0x56e44e.modelManifest, "aspectRatio")) {
    return "aspectRatio";
  }
  return "";
}
function getRatioFallbackStrategy(_0x495953, _0x4e4b6f, _0x640e35) {
  const {
    policy: _0x2ffebf
  } = getManifestRatioPolicy(_0x495953, _0x4e4b6f);
  const _0x310c22 = normalizeImageSizeLabel(_0x640e35);
  if (_0x310c22 && _0x2ffebf?.fallbackStrategyByImageSize && typeof _0x2ffebf.fallbackStrategyByImageSize === "object") {
    return String(_0x2ffebf.fallbackStrategyByImageSize[_0x310c22] || "").trim();
  }
  return String(_0x2ffebf?.fallbackStrategy || "").trim();
}
export function isAdaptiveRatioLabel(_0x32f2ba) {
  const _0x24b0be = String(_0x32f2ba || "").trim();
  const _0x49c8e6 = _0x24b0be.toLowerCase();
  return !_0x24b0be || _0x49c8e6 === "auto" || _0x49c8e6 === "default" || _0x49c8e6 === "adaptive" || _0x24b0be === "自适应" || _0x24b0be === "默认";
}
export function normalizeRatioLabelText(_0x3176bb) {
  return String(_0x3176bb || "").trim().replace(/[：∶﹕]/g, ":").replace(/\s+/g, "");
}
export function parseRatioLabel(_0x325502) {
  const _0x6df2c1 = normalizeRatioLabelText(_0x325502);
  if (!_0x6df2c1.includes(":")) {
    return null;
  }
  const [_0x139c65, _0x202f55] = _0x6df2c1.split(":");
  const _0x1eaf22 = Number.parseFloat(_0x139c65);
  const _0x3fd3ba = Number.parseFloat(_0x202f55);
  if (!(_0x1eaf22 > 0) || !(_0x3fd3ba > 0)) {
    return null;
  }
  return {
    w: _0x1eaf22,
    h: _0x3fd3ba,
    label: _0x1eaf22 + ":" + _0x3fd3ba
  };
}
function getRatioOptionValue(_0x27e55d) {
  if (!_0x27e55d || typeof _0x27e55d !== "object") {
    return null;
  }
  const _0x394895 = Number(_0x27e55d.value);
  if (Number.isFinite(_0x394895) && _0x394895 > 0) {
    return _0x394895;
  }
  const _0x1d99d1 = Number(_0x27e55d.w);
  const _0x39f4c2 = Number(_0x27e55d.h);
  if (Number.isFinite(_0x1d99d1) && _0x1d99d1 > 0 && Number.isFinite(_0x39f4c2) && _0x39f4c2 > 0) {
    return _0x1d99d1 / _0x39f4c2;
  }
  const _0x346d2b = parseRatioLabel(_0x27e55d.label);
  if (_0x346d2b) {
    return _0x346d2b.w / _0x346d2b.h;
  }
  return null;
}
export function pickClosestRatio(_0x1f4181, _0x10964b, _0x34af26 = DEFAULT_RATIO_OPTIONS) {
  const _0x37e246 = Array.isArray(_0x34af26) && _0x34af26.length > 0 ? _0x34af26 : DEFAULT_RATIO_OPTIONS;
  const _0x3dbd13 = typeof _0x1f4181 === "string" ? parseRatioLabel(_0x1f4181) : null;
  let _0x1f86f5 = 1;
  if (_0x3dbd13) {
    _0x1f86f5 = _0x3dbd13.w / _0x3dbd13.h;
  } else {
    const _0x33132a = Number(_0x1f4181);
    const _0x3acb70 = Number(_0x10964b);
    if (isFinitePositive(_0x33132a) && isFinitePositive(_0x3acb70)) {
      _0x1f86f5 = _0x33132a / _0x3acb70;
    }
  }
  let _0x5d3e41 = _0x37e246[0];
  let _0x29a4c9 = getRatioOptionValue(_0x5d3e41) || 1;
  let _0x475720 = Math.abs(_0x1f86f5 - _0x29a4c9);
  for (let _0x1d15da = 1; _0x1d15da < _0x37e246.length; _0x1d15da += 1) {
    const _0x13bbf3 = _0x37e246[_0x1d15da];
    const _0x677c28 = getRatioOptionValue(_0x13bbf3);
    if (!(_0x677c28 > 0)) {
      continue;
    }
    const _0x2d5607 = Math.abs(_0x1f86f5 - _0x677c28);
    if (_0x2d5607 < _0x475720) {
      _0x475720 = _0x2d5607;
      _0x5d3e41 = _0x13bbf3;
      _0x29a4c9 = _0x677c28;
    }
  }
  return _0x5d3e41.label;
}
function pickClosestDirectionalRatio(_0x4a26ae, _0x1d89eb, _0x240794 = DEFAULT_RATIO_OPTIONS) {
  const _0x453236 = Array.isArray(_0x240794) && _0x240794.length > 0 ? _0x240794 : DEFAULT_RATIO_OPTIONS;
  const _0x53c3ad = typeof _0x4a26ae === "string" ? parseRatioLabel(_0x4a26ae) : null;
  let _0x4ac4f5 = 1;
  if (_0x53c3ad) {
    _0x4ac4f5 = _0x53c3ad.w / _0x53c3ad.h;
  } else {
    const _0x32ec6a = Number(_0x4a26ae);
    const _0x2f8672 = Number(_0x1d89eb);
    if (isFinitePositive(_0x32ec6a) && isFinitePositive(_0x2f8672)) {
      _0x4ac4f5 = _0x32ec6a / _0x2f8672;
    }
  }
  if (Math.abs(_0x4ac4f5 - 1) < 0.000001) {
    const _0x1c635b = _0x453236.find(_0x26f787 => _0x26f787.label === "16:9");
    if (_0x1c635b) {
      return _0x1c635b.label;
    }
  }
  const _0x3d666b = _0x453236.filter(_0x95067 => {
    const _0x1a7f01 = getRatioOptionValue(_0x95067);
    if (!(_0x1a7f01 > 0)) {
      return false;
    }
    if (_0x4ac4f5 > 1) {
      return _0x1a7f01 > 1;
    } else {
      return _0x1a7f01 < 1;
    }
  });
  return pickClosestRatio(_0x4a26ae, _0x1d89eb, _0x3d666b.length > 0 ? _0x3d666b : _0x453236);
}
export function pickClosestRatioForProviderModel({
  provider: _0xe462e1,
  model: _0x33abe6,
  ratioLabel: _0x4bf67c,
  width: _0x5db345,
  height: _0x2ca299,
  imageSize: _0x5c36f9
} = {}) {
  const _0x1096ed = getAllowedRatiosForProviderModel(_0xe462e1, _0x33abe6, _0x5c36f9);
  const _0x5b8fe9 = isFinitePositive(_0x5db345) && isFinitePositive(_0x2ca299);
  const _0x9dc8f7 = _0x5b8fe9 ? Number(_0x5db345) : _0x4bf67c || DEFAULT_RATIO_LABEL;
  const _0x1002ff = _0x5b8fe9 ? Number(_0x2ca299) : undefined;
  if (getRatioFallbackStrategy(_0xe462e1, _0x33abe6, _0x5c36f9) === "directional") {
    return pickClosestDirectionalRatio(_0x9dc8f7, _0x1002ff, _0x1096ed);
  }
  return pickClosestRatio(_0x9dc8f7, _0x1002ff, _0x1096ed);
}
export function resolveAdaptiveSourceSize({
  inputWidth: _0x1745d2,
  inputHeight: _0x31b128
} = {}) {
  if (isFinitePositive(_0x1745d2) && isFinitePositive(_0x31b128)) {
    return {
      width: Number(_0x1745d2),
      height: Number(_0x31b128),
      source: "input-media"
    };
  }
  return {
    width: 1,
    height: 1,
    source: "fallback"
  };
}
export function getAllowedRatiosForProviderModel(_0x44b871, _0x508217, _0x13972c = "") {
  const _0x4baaea = getManifestAllowedRatios(_0x44b871, _0x508217, _0x13972c);
  if (_0x4baaea?.length > 0) {
    return _0x4baaea;
  }
  const _0x17e93e = String(_0x44b871 || "").trim().toLowerCase();
  const _0x3ac46f = String(_0x508217 || "").trim().toLowerCase();
  const _0x4d27b5 = _0x17e93e === "grsai";
  const _0x1dcb03 = resolveNanoBananaSelectionFromModel(_0x3ac46f);
  if (_0x4d27b5 && _0x1dcb03 && isNanoBananaFamily(_0x1dcb03.family) && _0x1dcb03.family !== NANO_BANANA_FAMILIES.GPT_IMAGE_2) {
    return getNanoBananaAllowedRatioOptions(_0x1dcb03.family);
  }
  if (_0x17e93e === "runninghub" && _0x1dcb03 && isNanoBananaFamily(_0x1dcb03.family)) {
    return getNanoBananaAllowedRatioOptions(_0x1dcb03.family);
  }
  if (_0x17e93e === "dreamina") {
    return DREAMINA_RATIO_OPTIONS;
  }
  return DEFAULT_RATIO_OPTIONS;
}
export function getRatioCapability(_0x48a4b9, _0x438e8b) {
  const _0x415160 = getManifestRatioCapability(_0x48a4b9, _0x438e8b);
  if (_0x415160) {
    return _0x415160;
  }
  const _0x48c7a3 = String(_0x48a4b9 || "").trim().toLowerCase();
  if (_0x48c7a3 === "runninghubwf") {
    return "none";
  }
  if (_0x48c7a3 === "runninghub" || _0x48c7a3 === "grsai") {
    return "aspectRatio";
  }
  if (_0x48c7a3 === "ppio" || _0x48c7a3 === "apimart") {
    return "size";
  }
  if (_0x48c7a3 === "dreamina") {
    return "aspectRatio";
  }
  return "aspectRatio";
}
function alignAndClampDimension(_0xfe2d5b) {
  const _0x854942 = Math.round(Number(_0xfe2d5b || 0) / DIMENSION_ALIGN) * DIMENSION_ALIGN;
  return Math.max(DIMENSION_MIN, Math.min(DIMENSION_MAX, _0x854942));
}
function calculateDimensionsByQualityAndRatio(_0xc409df, _0x5bbbe8) {
  const _0x1a2fa3 = String(_0xc409df || "").trim().toUpperCase();
  const _0x5a5f9b = DIMENSION_QUALITY_PIXEL_MAP[_0x1a2fa3] || DIMENSION_QUALITY_PIXEL_MAP[DIMENSION_DEFAULT_QUALITY];
  const _0x3b7dcd = parseRatioLabel(_0x5bbbe8) || {
    w: 1,
    h: 1
  };
  const _0x5af60d = _0x3b7dcd.w / _0x3b7dcd.h;
  const _0x4e4cff = Math.sqrt(_0x5a5f9b / _0x5af60d);
  const _0x343593 = _0x4e4cff * _0x5af60d;
  return {
    width: alignAndClampDimension(_0x343593),
    height: alignAndClampDimension(_0x4e4cff)
  };
}
export function resolveProviderRatioPayload({
  provider: _0x3b9aa2,
  model: _0x41833c,
  ratioLabel: _0x19a9f7,
  imageSize: _0xcaa194,
  suppressAspectRatio = false
} = {}) {
  const _0x43467a = getRatioCapability(_0x3b9aa2, _0x41833c);
  const _0x153035 = pickClosestRatioForProviderModel({
    provider: _0x3b9aa2,
    model: _0x41833c,
    ratioLabel: _0x19a9f7 || DEFAULT_RATIO_LABEL,
    imageSize: _0xcaa194
  });
  if (_0x43467a === "none" || suppressAspectRatio === true) {
    return {
      ratioCapability: _0x43467a,
      resolvedRatioLabel: _0x153035,
      params: {},
      suppressAspectRatio: true,
      notice: _0x43467a === "none" ? "Model does not support ratio params; falling back to model default." : ""
    };
  }
  if (_0x43467a === "aspectRatio") {
    return {
      ratioCapability: _0x43467a,
      resolvedRatioLabel: _0x153035,
      params: {
        aspectRatio: _0x153035
      },
      suppressAspectRatio: false,
      notice: ""
    };
  }
  if (_0x43467a === "size") {
    return {
      ratioCapability: _0x43467a,
      resolvedRatioLabel: _0x153035,
      params: {
        size: _0x153035
      },
      suppressAspectRatio: false,
      notice: ""
    };
  }
  if (_0x43467a === "dimensions") {
    const _0x1154e5 = calculateDimensionsByQualityAndRatio(_0xcaa194, _0x153035);
    return {
      ratioCapability: _0x43467a,
      resolvedRatioLabel: _0x153035,
      params: _0x1154e5,
      suppressAspectRatio: false,
      notice: ""
    };
  }
  return {
    ratioCapability: "none",
    resolvedRatioLabel: _0x153035,
    params: {},
    suppressAspectRatio: true,
    notice: "Unsupported ratio capability; skipping ratio params."
  };
}
export const IMAGE_RATIO_OPTIONS = DEFAULT_RATIO_OPTIONS;
export const IMAGE_RATIO_DEFAULT_LABEL = DEFAULT_RATIO_LABEL;