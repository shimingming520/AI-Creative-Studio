import { getModelManifest } from "../../manifests/index.js";
export function getAudioWorkflowSlots(_0x3b5c15 = "") {
  const _0x56b5b0 = getModelManifest(_0x3b5c15);
  const _0x5e731c = _0x56b5b0?.inputSlots;
  const _0x3357df = _0x5e731c?.fixedSlots;
  const _0x1d36b8 = Number(_0x5e731c?.maxByKind?.audio);
  if (Number.isFinite(_0x1d36b8) && _0x1d36b8 <= 0) {
    return [];
  }
  if (Array.isArray(_0x3357df) && _0x3357df.length > 0) {
    return _0x3357df.map(_0x316ccd => ({
      slot: String(_0x316ccd?.id || "").trim(),
      kind: String(_0x316ccd?.kind || "").trim(),
      label: _0x316ccd?.label || _0x316ccd?.id || "音频参考",
      required: _0x316ccd?.required === true
    })).filter(_0x12c259 => _0x12c259.slot && (!_0x12c259.kind || _0x12c259.kind === "audio"));
  }
  return [{
    slot: "audioRef",
    kind: "audio",
    label: "音频参考",
    required: true
  }];
}
export function getAudioWorkflowInputLimit(_0x283f06 = "") {
  return getAudioWorkflowSlots(_0x283f06).length || 1;
}
export function normalizeAudioWorkflowRefSlots(_0x5189cc = [], _0x25801d = "") {
  const _0xd4e082 = Array.isArray(_0x5189cc) ? _0x5189cc : [];
  const _0x4fcdd7 = getAudioWorkflowSlots(_0x25801d).map(_0x2e7879 => _0x2e7879.slot);
  if (_0x4fcdd7.length === 0) {
    return _0xd4e082;
  }
  const _0x16ce29 = new Set();
  return _0xd4e082.map(_0x24f6b1 => {
    const _0x2c20fe = String(_0x24f6b1?.refSlot || "").trim();
    if (_0x2c20fe && _0x4fcdd7.includes(_0x2c20fe) && !_0x16ce29.has(_0x2c20fe)) {
      _0x16ce29.add(_0x2c20fe);
      return {
        ..._0x24f6b1,
        refSlot: _0x2c20fe
      };
    }
    const _0x3a10d2 = _0x4fcdd7.find(_0x57df67 => !_0x16ce29.has(_0x57df67)) || "";
    if (!_0x3a10d2) {
      return {
        ..._0x24f6b1,
        refSlot: _0x4fcdd7.includes(_0x2c20fe) ? _0x2c20fe : ""
      };
    }
    _0x16ce29.add(_0x3a10d2);
    return {
      ..._0x24f6b1,
      refSlot: _0x3a10d2
    };
  });
}
export function doesAudioWorkflowSupportMultipleAudioInputs(_0x10b566 = "") {
  return getAudioWorkflowSlots(_0x10b566).length >= 2;
}