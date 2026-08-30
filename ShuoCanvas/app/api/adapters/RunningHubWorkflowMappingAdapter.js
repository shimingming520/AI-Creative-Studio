import { translateMinimaxH3EditorAssetMentions } from "./minimaxH3Prompt.js";
function hasOwnManifestValue(_0x174a05, _0x288b69) {
  return Object.prototype.hasOwnProperty.call(_0x174a05 || {}, _0x288b69);
}
function isPresentManifestValue(_0x297c92) {
  if (_0x297c92 === undefined || _0x297c92 === null) {
    return false;
  }
  if (typeof _0x297c92 === "string") {
    return _0x297c92.trim() !== "";
  }
  if (Array.isArray(_0x297c92)) {
    return _0x297c92.length > 0;
  }
  return true;
}
function getManifestPayloadPathValue(_0x5d8921 = {}, _0x4b9796 = "") {
  const _0x38b1e4 = String(_0x4b9796 || "").trim();
  if (!_0x38b1e4) {
    return undefined;
  }
  return _0x38b1e4.split(".").reduce((_0xb843a2, _0x1a3f28) => {
    if (_0xb843a2 === undefined || _0xb843a2 === null) {
      return undefined;
    }
    return _0xb843a2[_0x1a3f28];
  }, _0x5d8921);
}
function resolveManifestPayloadValue(_0x2b3e36, _0x5032e3 = [], _0xb4dcdd = undefined, {
  allowEmpty = false
} = {}) {
  const _0x197e41 = Array.isArray(_0x5032e3) ? _0x5032e3 : [_0x5032e3];
  for (const _0x6bbc64 of _0x197e41.filter(Boolean)) {
    const _0x1f391e = getManifestPayloadPathValue(_0x2b3e36, _0x6bbc64);
    if (allowEmpty && _0x1f391e !== undefined && _0x1f391e !== null) {
      return _0x1f391e;
    }
    if (isPresentManifestValue(_0x1f391e)) {
      return _0x1f391e;
    }
  }
  return _0xb4dcdd;
}
function normalizeManifestFieldList(_0x4231af, _0x5574bc = "") {
  const _0x481086 = _0x4231af?.fields !== undefined ? _0x4231af.fields : _0x4231af?.field;
  const _0x1e3b4 = Array.isArray(_0x481086) ? _0x481086 : [_0x481086 || _0x5574bc];
  return _0x1e3b4.map(_0x2262e3 => String(_0x2262e3 || "").trim()).filter(Boolean);
}
function manifestValuesEqual(_0x643fe0, _0x5c8808) {
  if (typeof _0x5c8808 === "boolean") {
    const _0x4b4009 = String(_0x643fe0 ?? "").trim().toLowerCase();
    return _0x643fe0 === _0x5c8808 || _0x4b4009 === String(_0x5c8808);
  }
  if (typeof _0x5c8808 === "number") {
    return Number(_0x643fe0) === _0x5c8808;
  }
  return String(_0x643fe0 ?? "").trim() === String(_0x5c8808 ?? "").trim();
}
function evaluateManifestWhenRule(_0x31b870, _0x2dd65b) {
  if (!_0x31b870 || typeof _0x31b870 !== "object") {
    return true;
  }
  const _0x2448cd = _0x31b870.field ? getManifestPayloadPathValue(_0x2dd65b, _0x31b870.field) : undefined;
  const _0x20d000 = isPresentManifestValue(_0x2448cd);
  if (hasOwnManifestValue(_0x31b870, "exists") && Boolean(_0x31b870.exists) !== _0x20d000) {
    return false;
  }
  if (_0x31b870.truthy === true && !Boolean(_0x2448cd)) {
    return false;
  }
  if (_0x31b870.falsy === true && Boolean(_0x2448cd)) {
    return false;
  }
  if (hasOwnManifestValue(_0x31b870, "equals") && !manifestValuesEqual(_0x2448cd, _0x31b870.equals)) {
    return false;
  }
  if (hasOwnManifestValue(_0x31b870, "notEquals") && manifestValuesEqual(_0x2448cd, _0x31b870.notEquals)) {
    return false;
  }
  if (Array.isArray(_0x31b870.in) && !_0x31b870.in.some(_0x2baf2b => manifestValuesEqual(_0x2448cd, _0x2baf2b))) {
    return false;
  }
  if (Array.isArray(_0x31b870.notIn) && _0x31b870.notIn.some(_0x4fb2b7 => manifestValuesEqual(_0x2448cd, _0x4fb2b7))) {
    return false;
  }
  return true;
}
function shouldUseManifestNodeMapping(_0x94468d, _0x2503a3) {
  const _0x3f174b = _0x94468d?.when;
  if (_0x3f174b === undefined || _0x3f174b === null) {
    return true;
  }
  if (Array.isArray(_0x3f174b)) {
    return _0x3f174b.every(_0x151847 => evaluateManifestWhenRule(_0x151847, _0x2503a3));
  }
  return evaluateManifestWhenRule(_0x3f174b, _0x2503a3);
}
function applyManifestNodeValueMap(_0x49a38e, _0x411681 = {}) {
  const _0x332683 = _0x411681.valueMap || _0x411681.values || {};
  const _0x27d878 = String(_0x49a38e ?? "").trim();
  if (_0x27d878 && _0x332683[_0x27d878] !== undefined) {
    return _0x332683[_0x27d878];
  }
  const _0x380b45 = _0x27d878.toLowerCase();
  if (_0x27d878 && _0x332683[_0x380b45] !== undefined) {
    return _0x332683[_0x380b45];
  }
  return _0x49a38e;
}
function normalizeManifestTransformSpec(_0x4e5dae) {
  if (!_0x4e5dae) {
    return {
      name: ""
    };
  }
  if (typeof _0x4e5dae === "string") {
    return {
      name: _0x4e5dae
    };
  }
  if (typeof _0x4e5dae === "object" && !Array.isArray(_0x4e5dae)) {
    return {
      ..._0x4e5dae,
      name: String(_0x4e5dae.name || "").trim()
    };
  }
  return {
    name: ""
  };
}
function clampManifestNumber(_0x408f37, _0x3cdf38) {
  let _0x15e89a = _0x408f37;
  if (Number.isFinite(Number(_0x3cdf38.min))) {
    _0x15e89a = Math.max(Number(_0x3cdf38.min), _0x15e89a);
  }
  if (Number.isFinite(Number(_0x3cdf38.max))) {
    _0x15e89a = Math.min(Number(_0x3cdf38.max), _0x15e89a);
  }
  return _0x15e89a;
}
function applyManifestNodeTransform(_0x22234c, _0x459b84 = {}, _0x3a586e = {}) {
  const _0x5a867b = normalizeManifestTransformSpec(_0x459b84.transform);
  const _0x1f06bd = _0x3a586e[_0x5a867b.name];
  if (typeof _0x1f06bd === "function") {
    return _0x1f06bd(_0x22234c, _0x5a867b, _0x459b84);
  }
  switch (_0x5a867b.name) {
    case "":
      return _0x22234c;
    case "trim":
      return String(_0x22234c ?? "").trim();
    case "string":
      return String(_0x22234c ?? "");
    case "minimaxH3AssetMentions":
      return translateMinimaxH3EditorAssetMentions(_0x22234c);
    case "boolean":
    case "booleanString":
      {
        const _0x48d760 = String(_0x22234c ?? "").trim().toLowerCase();
        if (_0x22234c === true || _0x48d760 === "true" || _0x48d760 === "1" || _0x48d760 === "yes" || _0x48d760 === "on") {
          return "true";
        } else {
          return "false";
        }
      }
    case "integer":
      {
        const _0x4b567f = Number(_0x22234c);
        const _0x3fa8d4 = Number(_0x5a867b.defaultValue ?? _0x459b84.defaultValue ?? 0);
        const _0x51e2b4 = Number.isFinite(_0x4b567f) ? Math.trunc(_0x4b567f) : Number.isFinite(_0x3fa8d4) ? Math.trunc(_0x3fa8d4) : 0;
        return clampManifestNumber(_0x51e2b4, _0x5a867b);
      }
    case "number":
      {
        const _0x26a582 = Number(_0x22234c);
        const _0x4b1727 = Number(_0x5a867b.defaultValue ?? _0x459b84.defaultValue ?? 0);
        const _0x4a163a = Number.isFinite(_0x26a582) ? _0x26a582 : Number.isFinite(_0x4b1727) ? _0x4b1727 : 0;
        return clampManifestNumber(_0x4a163a, _0x5a867b);
      }
    default:
      throw new Error("Unsupported RunningHub workflow transform: " + _0x5a867b.name);
  }
}
async function resolveRunningHubManifestNodeValue({
  item: _0x2a2865,
  payload: _0x2d9eee,
  finalPrompt: _0x2f1927,
  sourceResolvers = {}
}) {
  const _0x2e3093 = String(_0x2a2865?.source || "param").trim();
  if (_0x2e3093 === "constant") {
    if (hasOwnManifestValue(_0x2a2865, "value")) {
      return _0x2a2865.value;
    } else {
      return _0x2a2865.defaultValue;
    }
  }
  if (_0x2e3093 === "prompt") {
    const _0x559c43 = resolveManifestPayloadValue(_0x2d9eee, normalizeManifestFieldList(_0x2a2865), "");
    if (isPresentManifestValue(_0x559c43)) {
      return _0x559c43;
    } else {
      return _0x2f1927;
    }
  }
  if (_0x2e3093 === "param") {
    const _0x2e6bda = normalizeManifestFieldList(_0x2a2865);
    const _0xd548bc = resolveManifestPayloadValue(_0x2d9eee, _0x2e6bda, undefined, {
      allowEmpty: _0x2a2865?.allowEmpty === true
    });
    if (isPresentManifestValue(_0xd548bc) || _0x2a2865?.allowEmpty === true) {
      return _0xd548bc;
    }
    const _0x485fe1 = _0x2e6bda.filter(_0x2a4c3 => !_0x2a4c3.startsWith("generationParams.")).map(_0x138d78 => "generationParams." + _0x138d78);
    return resolveManifestPayloadValue(_0x2d9eee, _0x485fe1, undefined, {
      allowEmpty: _0x2a2865?.allowEmpty === true
    });
  }
  const _0x46baa9 = sourceResolvers[_0x2e3093];
  if (typeof _0x46baa9 === "function") {
    return _0x46baa9({
      item: _0x2a2865,
      payload: _0x2d9eee,
      finalPrompt: _0x2f1927
    });
  }
  throw new Error("Unsupported RunningHub workflow mapping source: " + _0x2e3093);
}
export function pushRunningHubManifestNode(_0x35c08b, _0x261309, _0x1c020c, _0x20119c = {}) {
  if (!_0x261309?.nodeId || !_0x261309?.fieldName) {
    return;
  }
  _0x35c08b.push({
    nodeId: String(_0x261309.nodeId),
    fieldName: String(_0x20119c.fieldName || _0x261309.fieldName),
    fieldValue: String(_0x1c020c),
    ...(_0x261309.description || _0x20119c.description ? {
      description: _0x20119c.description || _0x261309.description
    } : {})
  });
}
export function getRunningHubMappedValue(_0x15f248, _0x1fa16c, _0x5868ba = "") {
  const _0x5774c6 = String(_0x15f248 ?? "").trim();
  const _0x531413 = _0x1fa16c?.valueMap || {};
  if (_0x5774c6 && _0x531413[_0x5774c6] !== undefined) {
    return _0x531413[_0x5774c6];
  }
  if (_0x5774c6 && _0x531413[_0x5774c6.toLowerCase()] !== undefined) {
    return _0x531413[_0x5774c6.toLowerCase()];
  }
  return _0x1fa16c?.defaultValue ?? _0x5868ba;
}
export async function buildRunningHubNodeInfoListFromManifest({
  mapping: _0x234c26,
  payload = {},
  finalPrompt = "",
  sourceResolvers = {},
  transforms = {}
}) {
  const _0x4ee248 = Array.isArray(_0x234c26?.nodeInfoList) ? _0x234c26.nodeInfoList : [];
  if (_0x4ee248.length === 0) {
    return null;
  }
  const _0x468c83 = [];
  for (const _0x4e2c14 of _0x4ee248) {
    if (!_0x4e2c14?.nodeId || !_0x4e2c14?.fieldName) {
      continue;
    }
    if (!shouldUseManifestNodeMapping(_0x4e2c14, payload)) {
      continue;
    }
    const _0x8c8bcb = await resolveRunningHubManifestNodeValue({
      item: _0x4e2c14,
      payload: payload,
      finalPrompt: finalPrompt,
      sourceResolvers: sourceResolvers
    });
    const _0x5e1b62 = _0x4e2c14?.allowEmpty === true;
    const _0x1867c0 = _0x4e2c14?.includeEmpty === true || _0x5e1b62;
    const _0x2609d2 = hasOwnManifestValue(_0x4e2c14, "defaultValue");
    let _0x1f03dd = _0x8c8bcb;
    if (!isPresentManifestValue(_0x1f03dd) && _0x2609d2 && (!_0x5e1b62 || _0x1f03dd === undefined || _0x1f03dd === null)) {
      _0x1f03dd = _0x4e2c14.defaultValue;
    }
    if (!isPresentManifestValue(_0x1f03dd)) {
      if (_0x1867c0) {
        _0x1f03dd = "";
      } else if (_0x4e2c14.required) {
        throw new Error(_0x4e2c14.missingMessage || "Missing RunningHub workflow node input: " + _0x4e2c14.fieldName);
      } else {
        continue;
      }
    }
    _0x1f03dd = applyManifestNodeValueMap(_0x1f03dd, _0x4e2c14);
    _0x1f03dd = applyManifestNodeTransform(_0x1f03dd, _0x4e2c14, transforms);
    if (!isPresentManifestValue(_0x1f03dd) && _0x4e2c14.required && !_0x1867c0) {
      throw new Error(_0x4e2c14.missingMessage || "Missing RunningHub workflow node input: " + _0x4e2c14.fieldName);
    }
    if (!isPresentManifestValue(_0x1f03dd) && !_0x1867c0) {
      continue;
    }
    pushRunningHubManifestNode(_0x468c83, _0x4e2c14, _0x1f03dd);
  }
  return _0x468c83;
}