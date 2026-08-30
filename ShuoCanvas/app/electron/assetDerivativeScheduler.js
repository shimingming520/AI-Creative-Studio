function requireFunction(_0x482dff, _0x99dfe0) {
  if (typeof _0x482dff !== "function") {
    throw new TypeError(_0x99dfe0 + " must be a function");
  }
  return _0x482dff;
}
export function createAssetDerivativeScheduler({
  readAssetRecord: _0x4f6151,
  getQueue: _0x20e4ca,
  updateAssetRecord: _0x4ae587,
  sendAssetUpdated: _0x18b20b,
  createTaskId: _0x5e1cd3
} = {}) {
  const _0x8cb041 = requireFunction(_0x4f6151, "readAssetRecord");
  const _0xe8e573 = requireFunction(_0x20e4ca, "getQueue");
  const _0x556be4 = requireFunction(_0x4ae587, "updateAssetRecord");
  const _0xd348b9 = requireFunction(_0x18b20b, "sendAssetUpdated");
  const _0x466016 = requireFunction(_0x5e1cd3, "createTaskId");
  return function _0x437c4c(_0x341b20) {
    if (!_0x341b20?.assetId) {
      return undefined;
    }
    const _0x191c71 = _0x8cb041(_0x341b20.assetId) || _0x341b20;
    if (_0x191c71.status === "ready") {
      return undefined;
    }
    if (_0x191c71.kind !== "video" && _0x191c71.kind !== "audio") {
      return undefined;
    }
    const _0x303262 = _0x191c71.kind === "video" ? "videoPoster" : "audioWaveform";
    const _0x559279 = _0xe8e573();
    if (_0x191c71.mediaTaskId && _0x191c71.mediaTaskKind === _0x303262) {
      const _0x4577a1 = _0x559279.get(_0x191c71.mediaTaskId);
      if (_0x4577a1 && (_0x4577a1.status === "waiting" || _0x4577a1.status === "processing")) {
        return _0x4577a1;
      }
    }
    const _0x3bae0f = _0x466016(_0x303262, _0x191c71);
    const _0x323af9 = _0x556be4(_0x191c71.assetId, {
      status: "processing",
      error: "",
      mediaTaskId: _0x3bae0f,
      mediaTaskKind: _0x303262,
      mediaTaskStatus: "waiting",
      mediaTaskProgress: 0,
      mediaTaskError: ""
    });
    _0xd348b9(_0x323af9);
    try {
      return _0x559279.enqueue({
        kind: _0x303262,
        taskId: _0x3bae0f,
        assetId: _0x191c71.assetId,
        src: _0x191c71.originalLocalPath,
        originalLocalPath: _0x191c71.originalLocalPath
      });
    } catch (_0x4cd507) {
      const _0x1f1c64 = String(_0x4cd507?.message || _0x4cd507);
      const _0xd63c70 = _0x556be4(_0x191c71.assetId, {
        status: "partial",
        error: _0x1f1c64,
        mediaTaskStatus: "failed",
        mediaTaskError: _0x1f1c64
      }, {
        expectedMediaTaskId: _0x3bae0f
      });
      _0xd348b9(_0xd63c70);
      throw _0x4cd507;
    }
  };
}