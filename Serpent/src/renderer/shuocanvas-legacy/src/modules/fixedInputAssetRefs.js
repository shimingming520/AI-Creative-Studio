import { getAssetInputRefsFromPromptAndNode } from "./promptAssetInputRefs.js";
import { getModelManifest, resolveModelExecution } from "../manifests/index.js";
const FIXED_ASSET_INPUT_KINDS = new Set(["image", "video", "audio"]);
export const RH_V54_ASSET_SLOT_ORDER = Object.freeze({
  video: Object.freeze(["sourceVideo", "videoMask"]),
  image: Object.freeze(["refImage", "firstFrame"])
});
export const RH_BASIC_ASSET_SLOT_ORDER = Object.freeze({
  video: Object.freeze(["sourceVideo"]),
  image: Object.freeze(["refImage"])
});
export const RH_LTX_ASSET_SLOT_ORDER = Object.freeze({
  image: Object.freeze(["refImage"]),
  audio: Object.freeze(["audio"])
});
export const RH_LIPSYNC_ASSET_SLOT_ORDER = Object.freeze({
  video: Object.freeze(["sourceVideo"]),
  image: Object.freeze(["refImage"]),
  audio: Object.freeze(["audio"])
});
export const RH_LIPSYNC_VISUAL_EXCLUSIVE_GROUPS = Object.freeze([Object.freeze({
  id: "lipsyncVisualInput",
  slots: Object.freeze(["sourceVideo", "refImage"]),
  min: 1,
  max: 1
})]);
export function getRhV54VisibleSlots({
  hideExtraSlots = false
} = {}) {
  if (hideExtraSlots) {
    return ["sourceVideo", "refImage"];
  } else {
    return ["sourceVideo", "refImage", "firstFrame", "videoMask"];
  }
}
function normalizeFixedSlotId(_0x391ef5) {
  const _0x1f27f1 = String(_0x391ef5 || "").trim();
  if (_0x1f27f1 === "maskVideo") {
    return "videoMask";
  }
  return _0x1f27f1;
}
export function normalizeFixedInputExclusiveGroups(_0x205208 = [], _0x5029bc = null) {
  const _0x44c256 = Array.isArray(_0x5029bc) && _0x5029bc.length ? new Set(_0x5029bc.map(_0xc3c7b3 => normalizeFixedSlotId(_0xc3c7b3))) : null;
  return (Array.isArray(_0x205208) ? _0x205208 : []).map((_0x76788, _0x1a22d0) => {
    const _0x21bedc = Array.isArray(_0x76788?.slots) ? _0x76788.slots : Array.isArray(_0x76788) ? _0x76788 : [];
    const _0x37fdf7 = Array.from(new Set(_0x21bedc.map(_0x500aed => normalizeFixedSlotId(_0x500aed)).filter(_0x493927 => _0x493927 && (!_0x44c256 || _0x44c256.has(_0x493927)))));
    if (_0x37fdf7.length < 2) {
      return null;
    }
    return {
      id: String(_0x76788?.id || "exclusive:" + _0x1a22d0).trim() || "exclusive:" + _0x1a22d0,
      slots: _0x37fdf7,
      min: Number.isFinite(Number(_0x76788?.min)) ? Number(_0x76788.min) : 0,
      max: Number.isFinite(Number(_0x76788?.max)) ? Number(_0x76788.max) : 1,
      required: _0x76788?.required === true
    };
  }).filter(Boolean);
}
export function getExclusiveSlotsForFixedSlot(_0x3fbab7 = [], _0x3a6f2b = "") {
  const _0x1cf650 = normalizeFixedSlotId(_0x3a6f2b);
  if (!_0x1cf650) {
    return [];
  }
  const _0x5792b6 = normalizeFixedInputExclusiveGroups(_0x3fbab7);
  const _0x3597ac = _0x5792b6.find(_0x35ad75 => _0x35ad75.slots.includes(_0x1cf650));
  if (_0x3597ac) {
    return _0x3597ac.slots.slice();
  } else {
    return [_0x1cf650];
  }
}
function resolveManifestForFixedInputNode(_0x1c4cc0 = {}) {
  const _0xc124f1 = [_0x1c4cc0?.audioWorkflowKey, _0x1c4cc0?.workflowKey, _0x1c4cc0?.model].map(_0x5a0552 => String(_0x5a0552 || "").trim()).filter(Boolean);
  for (const _0x1c04d0 of _0xc124f1) {
    const _0x262c75 = getModelManifest(_0x1c04d0) || resolveModelExecution(_0x1c04d0, {
      providerHint: _0x1c4cc0?.provider
    })?.modelManifest || resolveModelExecution(_0x1c04d0)?.modelManifest;
    if (_0x262c75) {
      return _0x262c75;
    }
  }
  return null;
}
function getNodeFieldValue(_0x23ff11 = {}, _0x174153 = "") {
  const _0x1fb91f = String(_0x174153 || "").trim();
  if (!_0x1fb91f) {
    return undefined;
  }
  const _0x175aeb = _0x23ff11?.generationParams && typeof _0x23ff11.generationParams === "object" ? _0x23ff11.generationParams : {};
  if (Object.prototype.hasOwnProperty.call(_0x175aeb, _0x1fb91f)) {
    return _0x175aeb[_0x1fb91f];
  }
  if (Object.prototype.hasOwnProperty.call(_0x23ff11 || {}, _0x1fb91f)) {
    return _0x23ff11[_0x1fb91f];
  }
  const _0x4ee067 = _0x1fb91f.split(".").filter(Boolean);
  if (_0x4ee067.length <= 1) {
    return undefined;
  }
  let _0x4ea058 = _0x23ff11;
  for (const _0x1a0b19 of _0x4ee067) {
    if (!_0x4ea058 || typeof _0x4ea058 !== "object") {
      return undefined;
    }
    _0x4ea058 = _0x4ea058[_0x1a0b19];
  }
  return _0x4ea058;
}
function fixedSlotConditionMatches(_0x21d880, _0x27b24d = {}) {
  if (Array.isArray(_0x21d880)) {
    return _0x21d880.some(_0x3f7338 => fixedSlotConditionMatches(_0x3f7338, _0x27b24d));
  }
  if (!_0x21d880 || typeof _0x21d880 !== "object") {
    return false;
  }
  if (Array.isArray(_0x21d880.any)) {
    return _0x21d880.any.some(_0x4c2304 => fixedSlotConditionMatches(_0x4c2304, _0x27b24d));
  }
  if (Array.isArray(_0x21d880.all)) {
    return _0x21d880.all.every(_0x4e231b => fixedSlotConditionMatches(_0x4e231b, _0x27b24d));
  }
  const _0x140616 = String(_0x21d880.field || "").trim();
  if (!_0x140616) {
    return false;
  }
  const _0x47cc79 = getNodeFieldValue(_0x27b24d, _0x140616);
  const _0x2fddc1 = Array.isArray(_0x21d880.values) ? _0x21d880.values : Object.prototype.hasOwnProperty.call(_0x21d880, "value") ? [_0x21d880.value] : [];
  if (_0x2fddc1.length === 0) {
    return Boolean(_0x47cc79);
  }
  return _0x2fddc1.some(_0xf1b664 => _0x47cc79 === _0xf1b664 || String(_0x47cc79 ?? "") === String(_0xf1b664 ?? ""));
}
function getConditionFieldIds(_0x1a1f61, _0x37bc34 = new Set()) {
  if (Array.isArray(_0x1a1f61)) {
    _0x1a1f61.forEach(_0x176439 => getConditionFieldIds(_0x176439, _0x37bc34));
    return _0x37bc34;
  }
  if (!_0x1a1f61 || typeof _0x1a1f61 !== "object") {
    return _0x37bc34;
  }
  if (Array.isArray(_0x1a1f61.any)) {
    _0x1a1f61.any.forEach(_0x7b05ec => getConditionFieldIds(_0x7b05ec, _0x37bc34));
  }
  if (Array.isArray(_0x1a1f61.all)) {
    _0x1a1f61.all.forEach(_0x2096bf => getConditionFieldIds(_0x2096bf, _0x37bc34));
  }
  const _0x1887ac = String(_0x1a1f61.field || "").trim();
  if (_0x1887ac) {
    _0x37bc34.add(_0x1887ac);
  }
  return _0x37bc34;
}
function getHiddenFixedSlotReasonFields(_0x33c7e6, _0x210f94 = {}, _0x221bcc = null, {
  useRhVisibilityFlags = false
} = {}) {
  const _0x58d82f = new Set();
  if (useRhVisibilityFlags && _0x210f94?.rhSpecialMode === "cameraMove") {
    if (_0x33c7e6 === "firstFrame" || _0x33c7e6 === "videoMask") {
      _0x58d82f.add("rhSpecialMode");
    }
  }
  if (useRhVisibilityFlags && _0x210f94?.rhSubtractSubject === true) {
    if (_0x33c7e6 === "firstFrame" || _0x33c7e6 === "videoMask") {
      _0x58d82f.add("rhSubtractSubject");
    }
  }
  if (_0x221bcc?.showWhen && !fixedSlotConditionMatches(_0x221bcc.showWhen, _0x210f94)) {
    getConditionFieldIds(_0x221bcc.showWhen, _0x58d82f);
  }
  if (_0x221bcc?.hideWhen && fixedSlotConditionMatches(_0x221bcc.hideWhen, _0x210f94)) {
    getConditionFieldIds(_0x221bcc.hideWhen, _0x58d82f);
  }
  return Array.from(_0x58d82f);
}
export function getFixedInputSlotConfigFromManifest(_0x463a15 = {}, {
  manifest = null,
  includeHiddenSlots = false
} = {}) {
  const _0x4d9256 = manifest || resolveManifestForFixedInputNode(_0x463a15);
  const _0x3b58fc = _0x4d9256?.inputSlots?.fixedSlots;
  if (!Array.isArray(_0x3b58fc) || _0x3b58fc.length === 0) {
    return null;
  }
  const _0x15504e = {};
  const _0x197b96 = {};
  const _0x187fed = {};
  const _0x254a0b = {};
  const _0xe80626 = [];
  let _0x55c4cf = false;
  const _0x1b663a = new Set(_0x3b58fc.map(_0x381714 => normalizeFixedSlotId(_0x381714?.id)).filter(Boolean));
  const _0x27107f = _0x1b663a.has("sourceVideo") && _0x1b663a.has("refImage") && _0x1b663a.has("videoMask");
  _0x3b58fc.forEach((_0x18fe33, _0x2b2a9a) => {
    const _0x1823ce = normalizeFixedSlotId(_0x18fe33?.id);
    const _0x1e60c6 = String(_0x18fe33?.kind || "").trim();
    if (!_0x1823ce || !FIXED_ASSET_INPUT_KINDS.has(_0x1e60c6)) {
      return;
    }
    if (_0x18fe33?.showWhen || _0x18fe33?.hideWhen) {
      _0x55c4cf = true;
    }
    if (!Array.isArray(_0x15504e[_0x1e60c6])) {
      _0x15504e[_0x1e60c6] = [];
    }
    _0x15504e[_0x1e60c6].push(_0x1823ce);
    _0x197b96[_0x1823ce] = _0x1e60c6;
    const _0x32104f = Number(_0x18fe33?.displayOrder);
    _0x187fed[_0x1823ce] = {
      ..._0x18fe33,
      id: _0x1823ce,
      kind: _0x1e60c6,
      displayOrder: Number.isFinite(_0x32104f) ? _0x32104f : _0x2b2a9a
    };
    const _0x59f978 = getHiddenFixedSlotReasonFields(_0x1823ce, _0x463a15, _0x18fe33, {
      useRhVisibilityFlags: _0x27107f
    });
    if (_0x59f978.length > 0) {
      _0x254a0b[_0x1823ce] = _0x59f978;
    }
    if (includeHiddenSlots || _0x59f978.length === 0) {
      _0xe80626.push(_0x1823ce);
    }
  });
  if (_0xe80626.length === 0) {
    return null;
  }
  const _0x4e1905 = (_0x26c15a, _0x58d24d) => Number(_0x187fed[_0x26c15a]?.displayOrder ?? 0) - Number(_0x187fed[_0x58d24d]?.displayOrder ?? 0);
  _0xe80626.sort(_0x4e1905);
  Object.keys(_0x15504e).forEach(_0x34bb3c => {
    _0x15504e[_0x34bb3c].sort(_0x4e1905);
  });
  const _0x4a2afc = normalizeFixedInputExclusiveGroups(_0x4d9256?.inputSlots?.exclusiveGroups, _0xe80626);
  return {
    manifest: _0x4d9256,
    inputSurfaceHidden: shouldHideFixedInputSlots(_0x4d9256, _0x463a15),
    fixedSlots: Object.values(_0x187fed),
    slotById: _0x187fed,
    slotKindById: _0x197b96,
    hiddenReasonFieldsBySlot: _0x254a0b,
    slotOrderByType: _0x15504e,
    visibleSlots: _0xe80626,
    visibilityLayoutKey: _0x55c4cf ? _0xe80626.join("|") : "",
    exclusiveGroups: _0x4a2afc
  };
}
export function shouldHideFixedInputSlots(_0x1db45a = null, _0x144798 = {}) {
  if (_0x1db45a?.inputSurfaceHidden === true) {
    return true;
  }
  const _0x45ae3f = _0x1db45a?.manifest || _0x1db45a;
  const _0x12e21d = _0x45ae3f?.extensions?.videoInputSurface;
  if (_0x12e21d?.hideFixedInputSlots === true) {
    return true;
  }
  return fixedSlotConditionMatches(_0x12e21d?.hideFixedInputSlotsWhen, _0x144798);
}
function getSlotsFromOrder(_0xed0916 = {}) {
  return Array.from(new Set(Object.values(_0xed0916).flat().map(_0x5d8ee2 => String(_0x5d8ee2 || "")).filter(Boolean)));
}
function normalizeOccupiedSlots(_0x58dd98 = null) {
  const _0x5d654a = (_0x38c17a = []) => new Set(_0x38c17a.map(_0x334bc0 => normalizeFixedSlotId(_0x334bc0)).filter(Boolean));
  if (_0x58dd98 instanceof Set) {
    return _0x5d654a(Array.from(_0x58dd98));
  }
  if (Array.isArray(_0x58dd98)) {
    return _0x5d654a(_0x58dd98);
  }
  if (_0x58dd98 && typeof _0x58dd98 === "object") {
    return _0x5d654a(Object.entries(_0x58dd98).filter(([, _0x44f4b9]) => !!_0x44f4b9).map(([_0x61a553]) => _0x61a553));
  }
  return new Set();
}
export function createFixedSlotOccupancyTracker({
  exclusiveGroups = [],
  occupiedSlots = null
} = {}) {
  const _0xf01be1 = new Set(normalizeOccupiedSlots(occupiedSlots));
  const _0x25c3fd = normalizeFixedInputExclusiveGroups(exclusiveGroups);
  const _0x1c9c86 = new Map();
  _0x25c3fd.forEach(_0x3e56d9 => {
    _0x3e56d9.slots.forEach(_0xe3b860 => {
      _0x1c9c86.set(_0xe3b860, _0x3e56d9);
    });
  });
  const _0xfdb7f5 = new Set();
  _0xf01be1.forEach(_0x2e8b0b => {
    const _0x42749c = _0x1c9c86.get(_0x2e8b0b);
    if (_0x42749c) {
      _0xfdb7f5.add(_0x42749c.id);
    }
  });
  return {
    isSlotAvailable(_0x4ce5dc) {
      const _0x59fbc8 = normalizeFixedSlotId(_0x4ce5dc);
      if (!_0x59fbc8 || _0xf01be1.has(_0x59fbc8)) {
        return false;
      }
      const _0x56fc8e = _0x1c9c86.get(_0x59fbc8);
      return !_0x56fc8e || !_0xfdb7f5.has(_0x56fc8e.id);
    },
    occupySlot(_0x35cee3) {
      const _0x23fdc3 = normalizeFixedSlotId(_0x35cee3);
      if (!_0x23fdc3) {
        return;
      }
      _0xf01be1.add(_0x23fdc3);
      const _0x114b9f = _0x1c9c86.get(_0x23fdc3);
      if (_0x114b9f) {
        _0xfdb7f5.add(_0x114b9f.id);
      }
    },
    getExclusiveSlots(_0x397b72) {
      const _0x54e52e = normalizeFixedSlotId(_0x397b72);
      const _0x59d04e = _0x1c9c86.get(_0x54e52e);
      if (_0x59d04e) {
        return _0x59d04e.slots.slice();
      } else if (_0x54e52e) {
        return [_0x54e52e];
      } else {
        return [];
      }
    }
  };
}
function getFixedInputSlotKind(_0x256ef6 = {}, _0x56de2f = "") {
  const _0x4a1d28 = normalizeFixedSlotId(_0x56de2f);
  if (!_0x4a1d28) {
    return "";
  }
  const _0x374a0c = String(_0x256ef6?.slotKindById?.[_0x4a1d28] || "").trim();
  if (_0x374a0c) {
    return _0x374a0c;
  }
  const _0x3075e9 = _0x256ef6?.slotOrderByType && typeof _0x256ef6.slotOrderByType === "object" ? _0x256ef6.slotOrderByType : {};
  for (const [_0x4737ab, _0x3ac9f9] of Object.entries(_0x3075e9)) {
    if ((Array.isArray(_0x3ac9f9) ? _0x3ac9f9 : []).includes(_0x4a1d28)) {
      return String(_0x4737ab || "").trim();
    }
  }
  return "";
}
function isKnownFixedInputSlot(_0x4855dd = {}, _0x256ff5 = "") {
  const _0x2c8972 = normalizeFixedSlotId(_0x256ff5);
  if (!_0x2c8972) {
    return false;
  }
  if (_0x4855dd?.slotById?.[_0x2c8972]) {
    return true;
  }
  return !!getFixedInputSlotKind(_0x4855dd, _0x2c8972);
}
function sourceHasMaskImage(_0x5cb8b9 = null) {
  const _0x45bf52 = _0x5cb8b9?.nodeData && typeof _0x5cb8b9.nodeData === "object" ? _0x5cb8b9.nodeData : _0x5cb8b9;
  return !!String(_0x45bf52?.mask || _0x45bf52?.maskImageDataUrl || _0x45bf52?.maskImageUrl || _0x45bf52?.maskUrl || _0x45bf52?.maskLocalPath || "").trim();
}
export function fixedInputSlotAcceptsSource(_0x10bbb0 = {}, _0x91554b = "", _0x23fb03 = null) {
  const _0x5e1c6e = normalizeFixedSlotId(_0x91554b);
  if (!_0x5e1c6e) {
    return false;
  }
  const _0x32a5c9 = _0x10bbb0?.slotById?.[_0x5e1c6e] || {};
  if (_0x32a5c9?.requiresMask === true) {
    if (_0x23fb03) {
      return sourceHasMaskImage(_0x23fb03);
    } else {
      return false;
    }
  }
  return true;
}
export function resolveFixedInputSlotForRef({
  fixedInputConfig = null,
  refSlot = "",
  kind = "",
  occupiedSlots = null,
  sourceNode = null,
  source = null
} = {}) {
  const _0x699ddd = fixedInputConfig || {};
  const _0x4887d7 = String(kind || "").trim();
  const _0x15fe55 = sourceNode || source || null;
  if (!_0x4887d7 || _0x4887d7 === "text") {
    return {
      slot: "",
      reason: "unsupported"
    };
  }
  const _0x5bd709 = new Set(Array.isArray(_0x699ddd.visibleSlots) && _0x699ddd.visibleSlots.length ? _0x699ddd.visibleSlots.map(_0x5291c5 => normalizeFixedSlotId(_0x5291c5)).filter(Boolean) : getSlotsFromOrder(_0x699ddd.slotOrderByType).map(_0x27dda2 => normalizeFixedSlotId(_0x27dda2)));
  if (_0x5bd709.size === 0) {
    return {
      slot: "",
      reason: "noVisibleSlots"
    };
  }
  const _0x37b35c = createFixedSlotOccupancyTracker({
    exclusiveGroups: _0x699ddd.exclusiveGroups,
    occupiedSlots: occupiedSlots
  });
  const _0x1cc2fb = normalizeFixedSlotId(refSlot);
  if (_0x1cc2fb && _0x5bd709.has(_0x1cc2fb)) {
    const _0x915a69 = getFixedInputSlotKind(_0x699ddd, _0x1cc2fb);
    if (_0x915a69 !== _0x4887d7) {
      return {
        slot: "",
        reason: "kindMismatch",
        explicitSlot: _0x1cc2fb
      };
    }
    if (!fixedInputSlotAcceptsSource(_0x699ddd, _0x1cc2fb, _0x15fe55)) {
      return {
        slot: "",
        reason: "slotConstraint",
        explicitSlot: _0x1cc2fb
      };
    }
    if (!_0x37b35c.isSlotAvailable(_0x1cc2fb)) {
      return {
        slot: "",
        reason: "occupied",
        explicitSlot: _0x1cc2fb
      };
    }
    return {
      slot: _0x1cc2fb,
      reason: "explicit",
      explicitSlot: _0x1cc2fb
    };
  }
  if (_0x1cc2fb && isKnownFixedInputSlot(_0x699ddd, _0x1cc2fb)) {
    const _0x43e3a9 = getFixedInputSlotKind(_0x699ddd, _0x1cc2fb);
    const _0x49d069 = Array.isArray(_0x699ddd?.manifest?.inputSlots?.preserveHiddenInputsByKindFields) ? _0x699ddd.manifest.inputSlots.preserveHiddenInputsByKindFields : [];
    const _0x55e600 = new Set(_0x49d069.map(_0x544d43 => String(_0x544d43 || "").trim()).filter(Boolean));
    const _0x501f15 = Array.isArray(_0x699ddd?.hiddenReasonFieldsBySlot?.[_0x1cc2fb]) ? _0x699ddd.hiddenReasonFieldsBySlot[_0x1cc2fb] : [];
    const _0x3d7096 = _0x55e600.size === 0 || _0x501f15.length > 0 && _0x501f15.every(_0x20ed5f => _0x55e600.has(String(_0x20ed5f || "").trim()));
    const _0xfe9654 = (Array.isArray(_0x699ddd.slotOrderByType?.[_0x4887d7]) ? _0x699ddd.slotOrderByType[_0x4887d7] : []).some(_0x2fdca7 => _0x5bd709.has(normalizeFixedSlotId(_0x2fdca7)) && fixedInputSlotAcceptsSource(_0x699ddd, _0x2fdca7, _0x15fe55));
    const _0x1cfa77 = _0x699ddd?.manifest?.inputSlots?.preserveHiddenInputsByKind === true && _0x43e3a9 === _0x4887d7 && _0x3d7096 && _0xfe9654;
    if (!_0x1cfa77) {
      return {
        slot: "",
        reason: "hidden",
        explicitSlot: _0x1cc2fb,
        hidden: true,
        knownSlot: true
      };
    }
  }
  const _0x399241 = Array.isArray(_0x699ddd.slotOrderByType?.[_0x4887d7]) ? _0x699ddd.slotOrderByType[_0x4887d7].map(_0x1cf717 => normalizeFixedSlotId(_0x1cf717)) : [];
  const _0xd2acaa = _0x399241.find(_0x4159ab => _0x5bd709.has(_0x4159ab) && _0x37b35c.isSlotAvailable(_0x4159ab) && fixedInputSlotAcceptsSource(_0x699ddd, _0x4159ab, _0x15fe55)) || "";
  return {
    slot: _0xd2acaa,
    reason: _0xd2acaa ? _0x1cc2fb ? "stale" : "auto" : "overflow",
    explicitSlot: _0x1cc2fb
  };
}
export function buildFixedInputAssetSlotMapFromRefs(_0x5a639f = [], {
  slotOrderByType = {},
  visibleSlots = null,
  occupiedSlots = null,
  exclusiveGroups = [],
  slotById = {}
} = {}) {
  const _0xae1b87 = new Set(Array.isArray(visibleSlots) && visibleSlots.length ? visibleSlots.map(String) : getSlotsFromOrder(slotOrderByType));
  const _0x3a62aa = normalizeOccupiedSlots(occupiedSlots);
  const _0x1f77d7 = {};
  _0xae1b87.forEach(_0x490679 => {
    _0x1f77d7[_0x490679] = null;
  });
  (Array.isArray(_0x5a639f) ? _0x5a639f : []).forEach(_0xe450e6 => {
    const _0x11d88e = String(_0xe450e6?.type || "").trim();
    const _0x3aad09 = new Set(_0x3a62aa);
    Object.entries(_0x1f77d7).forEach(([_0x9ced03, _0x5900e9]) => {
      if (_0x5900e9) {
        _0x3aad09.add(_0x9ced03);
      }
    });
    const _0xc1dded = resolveFixedInputSlotForRef({
      fixedInputConfig: {
        slotOrderByType: slotOrderByType,
        visibleSlots: Array.from(_0xae1b87),
        exclusiveGroups: exclusiveGroups,
        slotById: slotById
      },
      refSlot: _0xe450e6?.refSlot,
      kind: _0x11d88e,
      occupiedSlots: _0x3aad09,
      sourceNode: _0xe450e6?.nodeData || _0xe450e6
    });
    const _0x376c58 = _0xc1dded.slot;
    if (!_0x376c58) {
      return;
    }
    _0x1f77d7[_0x376c58] = {
      ..._0xe450e6,
      refSlot: _0x376c58,
      virtual: true
    };
  });
  return _0x1f77d7;
}
export function buildFixedInputAssetSlotMap(_0x1e6c90 = null, {
  slotOrderByType = {},
  visibleSlots = null,
  occupiedSlots = null,
  exclusiveGroups = [],
  slotById = {},
  nodeData = null
} = {}) {
  const _0x5317a8 = getAssetInputRefsFromPromptAndNode(_0x1e6c90, {
    nodeData: nodeData,
    allowedTypes: Object.keys(slotOrderByType)
  });
  return buildFixedInputAssetSlotMapFromRefs(_0x5317a8, {
    slotOrderByType: slotOrderByType,
    visibleSlots: visibleSlots,
    occupiedSlots: occupiedSlots,
    exclusiveGroups: exclusiveGroups,
    slotById: slotById
  });
}
export function buildRhV54AssetSlotMapFromRefs(_0x1ff629 = [], {
  hideExtraSlots = false,
  occupiedSlots = null
} = {}) {
  return buildFixedInputAssetSlotMapFromRefs(_0x1ff629, {
    slotOrderByType: RH_V54_ASSET_SLOT_ORDER,
    visibleSlots: getRhV54VisibleSlots({
      hideExtraSlots: hideExtraSlots
    }),
    occupiedSlots: occupiedSlots
  });
}
export function buildRhV54AssetSlotMap(_0x5980ca = null, {
  hideExtraSlots = false,
  occupiedSlots = null,
  nodeData = null
} = {}) {
  return buildFixedInputAssetSlotMap(_0x5980ca, {
    slotOrderByType: RH_V54_ASSET_SLOT_ORDER,
    visibleSlots: getRhV54VisibleSlots({
      hideExtraSlots: hideExtraSlots
    }),
    occupiedSlots: occupiedSlots,
    nodeData: nodeData
  });
}
export function buildRhBasicAssetSlotMap(_0x58ff00 = null, _0x57583f = {}) {
  return buildFixedInputAssetSlotMap(_0x58ff00, {
    slotOrderByType: RH_BASIC_ASSET_SLOT_ORDER,
    visibleSlots: ["sourceVideo", "refImage"],
    occupiedSlots: _0x57583f.occupiedSlots,
    nodeData: _0x57583f.nodeData
  });
}
export function buildRhLtxAssetSlotMap(_0x1c759b = null, _0x2464c8 = {}) {
  return buildFixedInputAssetSlotMap(_0x1c759b, {
    slotOrderByType: RH_LTX_ASSET_SLOT_ORDER,
    visibleSlots: ["refImage", "audio"],
    occupiedSlots: _0x2464c8.occupiedSlots,
    nodeData: _0x2464c8.nodeData
  });
}
export function buildRhLipSyncAssetSlotMap(_0x2734e8 = null, _0x4b3fa0 = {}) {
  return buildFixedInputAssetSlotMap(_0x2734e8, {
    slotOrderByType: RH_LIPSYNC_ASSET_SLOT_ORDER,
    visibleSlots: ["sourceVideo", "refImage", "audio"],
    occupiedSlots: _0x4b3fa0.occupiedSlots,
    exclusiveGroups: RH_LIPSYNC_VISUAL_EXCLUSIVE_GROUPS,
    nodeData: _0x4b3fa0.nodeData
  });
}