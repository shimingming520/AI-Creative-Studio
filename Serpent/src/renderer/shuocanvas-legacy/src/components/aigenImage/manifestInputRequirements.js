const INPUT_KINDS = new Set(["text", "image", "video", "audio"]);
function normalizeKind(_0x57d907 = "") {
  const _0x4d5b23 = String(_0x57d907 || "").trim();
  if (INPUT_KINDS.has(_0x4d5b23)) {
    return _0x4d5b23;
  } else {
    return "";
  }
}
function normalizeSlotId(_0x1f876a = "") {
  return String(_0x1f876a || "").trim();
}
function toPositiveInteger(_0x1d077f) {
  const _0x43c61f = Number(_0x1d077f);
  if (!Number.isFinite(_0x43c61f) || _0x43c61f <= 0) {
    return 0;
  }
  return Math.trunc(_0x43c61f);
}
function getVisibleFixedSlots(_0x1dca44 = null) {
  const _0x26e101 = new Set((Array.isArray(_0x1dca44?.visibleSlots) ? _0x1dca44.visibleSlots : []).map(normalizeSlotId).filter(Boolean));
  return (Array.isArray(_0x1dca44?.fixedSlots) ? _0x1dca44.fixedSlots : []).map(_0x431678 => ({
    ..._0x431678,
    id: normalizeSlotId(_0x431678?.id),
    kind: normalizeKind(_0x431678?.kind)
  })).filter(_0x363ffb => _0x363ffb.id && _0x363ffb.kind && _0x26e101.has(_0x363ffb.id));
}
export function countManifestInputRecords(_0x551f07 = []) {
  return (Array.isArray(_0x551f07) ? _0x551f07 : []).reduce((_0x18467e, _0x511f20) => {
    const _0x47549e = normalizeKind(_0x511f20?.kind);
    if (!_0x47549e) {
      return _0x18467e;
    }
    _0x18467e[_0x47549e] = (_0x18467e[_0x47549e] || 0) + 1;
    return _0x18467e;
  }, {
    text: 0,
    image: 0,
    video: 0,
    audio: 0
  });
}
export function buildFixedSlotOccupancy({
  fixedInputConfig = null,
  inputRecords = []
} = {}) {
  const _0x45ce51 = getVisibleFixedSlots(fixedInputConfig);
  if (_0x45ce51.length === 0) {
    return {};
  }
  const _0x4c0934 = new Map(_0x45ce51.map(_0x1f3fdf => [_0x1f3fdf.id, _0x1f3fdf]));
  const _0x204ba3 = _0x45ce51.reduce((_0x1df0e2, _0x3aca6c) => {
    if (!_0x1df0e2.has(_0x3aca6c.kind)) {
      _0x1df0e2.set(_0x3aca6c.kind, []);
    }
    _0x1df0e2.get(_0x3aca6c.kind).push(_0x3aca6c.id);
    return _0x1df0e2;
  }, new Map());
  const _0x16e808 = (Array.isArray(inputRecords) ? inputRecords : []).map((_0x55fbc1, _0x135304) => ({
    index: _0x135304,
    kind: normalizeKind(_0x55fbc1?.kind),
    refSlot: normalizeSlotId(_0x55fbc1?.refSlot)
  })).filter(_0xda912b => _0xda912b.kind);
  const _0x5d7a41 = {};
  const _0x5baaa4 = new Set();
  _0x16e808.forEach(_0x5964fc => {
    if (!_0x5964fc.refSlot || _0x5baaa4.has(_0x5964fc.index)) {
      return;
    }
    const _0xaaf28e = _0x4c0934.get(_0x5964fc.refSlot);
    if (!_0xaaf28e || _0xaaf28e.kind !== _0x5964fc.kind || _0x5d7a41[_0xaaf28e.id]) {
      return;
    }
    _0x5d7a41[_0xaaf28e.id] = true;
    _0x5baaa4.add(_0x5964fc.index);
  });
  _0x16e808.forEach(_0x14f7a2 => {
    if (_0x5baaa4.has(_0x14f7a2.index)) {
      return;
    }
    const _0x46b077 = (_0x204ba3.get(_0x14f7a2.kind) || []).find(_0x557a1d => !_0x5d7a41[_0x557a1d]);
    if (!_0x46b077) {
      return;
    }
    _0x5d7a41[_0x46b077] = true;
    _0x5baaa4.add(_0x14f7a2.index);
  });
  return _0x5d7a41;
}
export function getMissingManifestInputRequirement({
  inputSlots = null,
  fixedInputConfig = null,
  inputCounts = null,
  occupiedFixedSlots = null
} = {}) {
  const _0x19cb05 = inputCounts && typeof inputCounts === "object" ? inputCounts : {
    text: 0,
    image: 0,
    video: 0,
    audio: 0
  };
  const _0x42050a = occupiedFixedSlots && typeof occupiedFixedSlots === "object" ? occupiedFixedSlots : {};
  const _0x4c7891 = getVisibleFixedSlots(fixedInputConfig).find(_0x11eb93 => _0x11eb93.required === true && _0x42050a[_0x11eb93.id] !== true);
  if (_0x4c7891) {
    return {
      kind: _0x4c7891.kind,
      slotId: _0x4c7891.id,
      required: 1,
      actual: 0,
      source: "fixedSlot"
    };
  }
  const _0x3d915e = inputSlots?.minByKind && typeof inputSlots.minByKind === "object" ? inputSlots.minByKind : {};
  for (const [_0x17685c, _0x15602c] of Object.entries(_0x3d915e)) {
    const _0x26d3dc = normalizeKind(_0x17685c);
    const _0x33754f = toPositiveInteger(_0x15602c);
    if (!_0x26d3dc || _0x33754f <= 0) {
      continue;
    }
    const _0x1e085d = Math.max(0, Number(_0x19cb05[_0x26d3dc]) || 0);
    if (_0x1e085d < _0x33754f) {
      return {
        kind: _0x26d3dc,
        slotId: "",
        required: _0x33754f,
        actual: _0x1e085d,
        source: "minByKind"
      };
    }
  }
  return null;
}