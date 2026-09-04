import { logDiagnosticEvent } from "../src/services/diagnosticsService.js";
import { desktopBridge } from "../src/services/desktopBridge.js";
import { normalizeLocalPath } from "../src/utils/localMediaPath.js";
import { requester } from "./requester.js";
const TERMINAL_STATUSES = new Set(["complete", "failed", "cancelled"]);
const DIAGNOSTIC_SRC_TAIL_LENGTH = 96;
const SOURCE_REQUIRED_KINDS = new Set(["audioCut", "audioWaveform", "audioVoiceAnalyze", "audioVoiceCompose", "videoAudioSeparate", "videoAudioMux", "videoCut", "mediaClipExport", "videoFirstFrame", "videoPoster", "videoReverse"]);
const MULTI_SOURCE_KINDS = new Set(["videoCompose", "audioCompose"]);
function toMessage(_0x1d99bd, _0xc694dc = "Media task failed") {
  if (typeof _0x1d99bd === "string") {
    return _0x1d99bd;
  }
  if (_0x1d99bd?.message) {
    return String(_0x1d99bd.message);
  }
  return String(_0x1d99bd || _0xc694dc);
}
function normalizeDiagnosticSrc(_0x2d8140) {
  const _0x594fe5 = String(_0x2d8140 || "").trim();
  return _0x594fe5;
}
function digestDiagnosticSrc(_0x5d62c3) {
  const _0x3b7b34 = normalizeDiagnosticSrc(_0x5d62c3);
  if (!_0x3b7b34) {
    return "";
  }
  let _0x48b0b5 = 2166136261;
  for (let _0x1cd153 = 0; _0x1cd153 < _0x3b7b34.length; _0x1cd153 += 1) {
    _0x48b0b5 ^= _0x3b7b34.charCodeAt(_0x1cd153);
    _0x48b0b5 = Math.imul(_0x48b0b5, 16777619) >>> 0;
  }
  return _0x48b0b5.toString(16).padStart(8, "0");
}
function summarizeDiagnosticSrc(_0x2f5a27) {
  const _0x57a1b7 = normalizeDiagnosticSrc(_0x2f5a27);
  const _0x52e07b = _0x57a1b7.replace(/\\/g, "/");
  const _0x491cf4 = _0x52e07b.split("/").filter(Boolean);
  const _0x1e68d7 = _0x491cf4.length > 2 ? _0x491cf4.slice(-2).join("/") : _0x491cf4.join("/") || _0x52e07b;
  return {
    srcDigest: digestDiagnosticSrc(_0x57a1b7),
    srcTail: _0x1e68d7 ? _0x1e68d7.slice(-DIAGNOSTIC_SRC_TAIL_LENGTH) : "",
    srcLength: _0x57a1b7.length
  };
}
function firstDefined(..._0x45918c) {
  for (const _0x3a8134 of _0x45918c) {
    if (_0x3a8134 !== undefined && _0x3a8134 !== null) {
      return _0x3a8134;
    }
  }
  return "";
}
function normalizePayloadSrcs(_0x57ae13 = {}) {
  if (Array.isArray(_0x57ae13?.srcs)) {
    return _0x57ae13.srcs;
  } else if (Array.isArray(_0x57ae13?.args?.srcs)) {
    return _0x57ae13.args.srcs;
  } else {
    return [];
  }
}
function normalizePayloadAudioClipSources(_0x29f1a4 = {}) {
  const _0x1b3827 = Array.isArray(_0x29f1a4?.args?.audioClips) ? _0x29f1a4.args.audioClips : Array.isArray(_0x29f1a4?.audioClips) ? _0x29f1a4.audioClips : [];
  return _0x1b3827.map(_0xac7b03 => firstDefined(_0xac7b03?.src, _0xac7b03?.sourceKey, _0xac7b03?.localPath, _0xac7b03?.path));
}
function normalizePayloadAudioVoiceClipSources(_0x11ef6e = {}) {
  const _0xd3f87a = Array.isArray(_0x11ef6e?.args?.clips) ? _0x11ef6e.args.clips : Array.isArray(_0x11ef6e?.clips) ? _0x11ef6e.clips : [];
  return _0xd3f87a.map(_0x45f1ed => firstDefined(_0x45f1ed?.src, _0x45f1ed?.localPath, _0x45f1ed?.path, _0x45f1ed?.audioUrl));
}
function normalizeVirtualMediaSource(_0x5551b5) {
  return normalizeLocalPath(_0x5551b5);
}
function isValidMediaTaskSource(_0x268882) {
  return !!normalizeVirtualMediaSource(_0x268882);
}
function getPayloadSources(_0x18fff4 = {}, _0x4ff87b = undefined) {
  const _0x65b891 = normalizePayloadSrcs(_0x18fff4);
  const _0x3c7a56 = _0x4ff87b !== undefined ? _0x4ff87b : firstDefined(_0x18fff4?.src, _0x18fff4?.originalLocalPath, _0x18fff4?.localPath, _0x65b891[0]);
  return {
    ...summarizeDiagnosticSrc(_0x3c7a56),
    srcsCount: _0x65b891.length
  };
}
function validateMediaTaskSources(_0x483163 = {}) {
  const _0x350605 = String(_0x483163?.kind || "").trim();
  const _0x1e52cb = normalizePayloadSrcs(_0x483163);
  const _0x5c4ca7 = MULTI_SOURCE_KINDS.has(_0x350605) || _0x1e52cb.length > 0;
  if (_0x5c4ca7) {
    const _0x4ad03c = _0x350605 === "videoCompose" && _0x483163?.args?.includeAudio === false ? 1 : MULTI_SOURCE_KINDS.has(_0x350605) ? 2 : 1;
    if (_0x1e52cb.length < _0x4ad03c) {
      return {
        index: 0,
        value: "",
        reason: "missing"
      };
    }
    for (let _0xb2e8b0 = 0; _0xb2e8b0 < _0x1e52cb.length; _0xb2e8b0 += 1) {
      if (!isValidMediaTaskSource(_0x1e52cb[_0xb2e8b0])) {
        return {
          index: _0xb2e8b0,
          value: _0x1e52cb[_0xb2e8b0],
          reason: "invalid"
        };
      }
    }
    return null;
  }
  const _0x27e4ec = firstDefined(_0x483163?.src, _0x483163?.originalLocalPath, _0x483163?.localPath);
  const _0x5c9da0 = _0x483163?.src !== undefined || _0x483163?.originalLocalPath !== undefined || _0x483163?.localPath !== undefined;
  if (!SOURCE_REQUIRED_KINDS.has(_0x350605) && !_0x5c9da0) {
    return null;
  }
  if (!isValidMediaTaskSource(_0x27e4ec)) {
    return {
      index: 0,
      value: _0x27e4ec,
      reason: normalizeDiagnosticSrc(_0x27e4ec) ? "invalid" : "missing"
    };
  }
  if (_0x350605 === "mediaClipExport") {
    const _0x267f37 = firstDefined(_0x483163?.args?.audioSrc, _0x483163?.audioSrc);
    const _0x59e180 = _0x483163?.args?.audioSrc !== undefined || _0x483163?.audioSrc !== undefined;
    if (_0x59e180 && !isValidMediaTaskSource(_0x267f37)) {
      return {
        index: 1,
        value: _0x267f37,
        reason: normalizeDiagnosticSrc(_0x267f37) ? "invalid" : "missing"
      };
    }
    const _0x4e4357 = normalizePayloadAudioClipSources(_0x483163);
    for (let _0x411e24 = 0; _0x411e24 < _0x4e4357.length; _0x411e24 += 1) {
      if (!isValidMediaTaskSource(_0x4e4357[_0x411e24])) {
        return {
          index: _0x411e24 + 1,
          value: _0x4e4357[_0x411e24],
          reason: normalizeDiagnosticSrc(_0x4e4357[_0x411e24]) ? "invalid" : "missing"
        };
      }
    }
  }
  if (_0x350605 === "videoAudioMux") {
    const _0xef80fd = firstDefined(_0x483163?.args?.audioSrc, _0x483163?.audioSrc);
    if (!isValidMediaTaskSource(_0xef80fd)) {
      return {
        index: 1,
        value: _0xef80fd,
        reason: normalizeDiagnosticSrc(_0xef80fd) ? "invalid" : "missing"
      };
    }
  }
  if (_0x350605 === "audioVoiceCompose") {
    const _0xe694e = normalizePayloadAudioVoiceClipSources(_0x483163);
    if (_0xe694e.length <= 0) {
      return {
        index: 1,
        value: "",
        reason: "missing"
      };
    }
    for (let _0x24ec04 = 0; _0x24ec04 < _0xe694e.length; _0x24ec04 += 1) {
      if (!isValidMediaTaskSource(_0xe694e[_0x24ec04])) {
        return {
          index: _0x24ec04 + 1,
          value: _0xe694e[_0x24ec04],
          reason: normalizeDiagnosticSrc(_0xe694e[_0x24ec04]) ? "invalid" : "missing"
        };
      }
    }
  }
  return null;
}
function buildDiagnosticContext(_0x24f2c7 = {}, _0x31247a = {}) {
  const _0x47b4df = getPayloadSources(_0x24f2c7, _0x31247a.sourceValue);
  const _0x3f9607 = {
    taskId: String(_0x31247a.taskId || _0x24f2c7?.taskId || ""),
    kind: String(_0x31247a.kind || _0x24f2c7?.kind || ""),
    nodeId: String(_0x31247a.nodeId || _0x24f2c7?.nodeId || ""),
    assetId: String(_0x31247a.assetId || _0x24f2c7?.assetId || ""),
    srcDigest: _0x47b4df.srcDigest,
    srcTail: _0x47b4df.srcTail,
    srcLength: _0x47b4df.srcLength,
    srcsCount: _0x47b4df.srcsCount,
    status: String(_0x31247a.status || ""),
    error: toMessage(_0x31247a.error || "")
  };
  const _0x471fa2 = Number(_0x31247a.invalidSourceIndex);
  if (Number.isFinite(_0x471fa2)) {
    _0x3f9607.invalidSourceIndex = _0x471fa2;
  }
  return _0x3f9607;
}
function logMediaTaskFailure(_0x284a28, _0x281f41 = {}, _0x258452 = {}) {
  logDiagnosticEvent({
    type: _0x284a28,
    level: "error",
    source: "renderer",
    message: toMessage(_0x258452.error || _0x258452.status || _0x284a28),
    context: buildDiagnosticContext(_0x281f41, _0x258452)
  });
}
function getMediaTaskBridge() {
  if (desktopBridge.mediaTask.isAvailable()) {
    return desktopBridge.mediaTask;
  } else {
    return null;
  }
}
export function canUseElectronMediaTask() {
  return !!getMediaTaskBridge();
}
export function waitForElectronMediaTask(_0x23a2c8, {
  timeout = 0,
  diagnosticPayload = {}
} = {}) {
  const _0x556cd3 = getMediaTaskBridge();
  const _0x54d51d = String(_0x23a2c8 || "").trim();
  if (!_0x556cd3 || !_0x54d51d) {
    const _0x17ba5c = new Error("Electron media task API unavailable");
    logMediaTaskFailure("media_task.wait_failed", diagnosticPayload, {
      taskId: _0x54d51d,
      status: !_0x556cd3 ? "bridge_unavailable" : "missing_task_id",
      error: _0x17ba5c
    });
    return Promise.reject(_0x17ba5c);
  }
  return new Promise((_0x501f3d, _0x59c3c9) => {
    let _0x54de96 = false;
    let _0x2954f5 = null;
    const _0x1674e5 = _0x556cd3.onUpdate(_0x2f23a3 => {
      if (String(_0x2f23a3?.taskId || "") !== _0x54d51d) {
        return;
      }
      const _0x1b6bdb = String(_0x2f23a3?.status || "");
      if (!TERMINAL_STATUSES.has(_0x1b6bdb)) {
        return;
      }
      if (_0x54de96) {
        return;
      }
      _0x54de96 = true;
      _0x1674e5?.();
      if (_0x2954f5) {
        clearTimeout(_0x2954f5);
      }
      if (_0x1b6bdb === "complete") {
        _0x501f3d(_0x2f23a3?.result || {});
      } else if (_0x1b6bdb === "cancelled") {
        const _0x5c8ce2 = new Error("Media task cancelled");
        logMediaTaskFailure("media_task.wait_failed", diagnosticPayload, {
          ..._0x2f23a3,
          taskId: _0x54d51d,
          status: _0x1b6bdb,
          error: _0x5c8ce2
        });
        _0x59c3c9(_0x5c8ce2);
      } else {
        const _0x26f817 = new Error(_0x2f23a3?.error || "Media task failed");
        logMediaTaskFailure("media_task.wait_failed", diagnosticPayload, {
          ..._0x2f23a3,
          taskId: _0x54d51d,
          status: _0x1b6bdb,
          error: _0x26f817
        });
        _0x59c3c9(_0x26f817);
      }
    });
    if (timeout > 0) {
      _0x2954f5 = setTimeout(() => {
        if (_0x54de96) {
          return;
        }
        _0x54de96 = true;
        _0x1674e5?.();
        const _0x4a94ac = new Error("Media task timeout");
        logMediaTaskFailure("media_task.wait_failed", diagnosticPayload, {
          taskId: _0x54d51d,
          status: "timeout",
          error: _0x4a94ac
        });
        _0x59c3c9(_0x4a94ac);
      }, timeout);
    }
  });
}
export async function enqueueElectronMediaTask(_0x15fb23 = {}, _0x1e4508 = {}) {
  const _0xb539d5 = getMediaTaskBridge();
  if (!_0xb539d5) {
    return null;
  }
  const _0x21a1b9 = validateMediaTaskSources(_0x15fb23);
  if (_0x21a1b9) {
    const _0x39f96b = new Error(_0x21a1b9.reason === "missing" ? "Missing media source path" : "Invalid media source path");
    logMediaTaskFailure("media_task.enqueue_invalid_source", _0x15fb23, {
      status: "invalid_source",
      error: _0x39f96b,
      invalidSourceIndex: _0x21a1b9.index,
      sourceValue: _0x21a1b9.value
    });
    throw _0x39f96b;
  }
  let _0x502de8;
  try {
    _0x502de8 = await _0xb539d5.enqueue(_0x15fb23);
  } catch (_0x4eb576) {
    logMediaTaskFailure("media_task.enqueue_failed", _0x15fb23, {
      status: "enqueue_failed",
      error: _0x4eb576
    });
    throw _0x4eb576;
  }
  if (_0x1e4508.wait === true) {
    const _0x135955 = _0x502de8?.taskId || _0x15fb23?.taskId || "";
    return await waitForElectronMediaTask(_0x135955, {
      ..._0x1e4508,
      diagnosticPayload: {
        ..._0x15fb23,
        taskId: _0x135955
      }
    });
  }
  return _0x502de8;
}
export async function cancelElectronMediaTask(_0x336783) {
  const _0x2f5e9e = getMediaTaskBridge();
  if (!_0x2f5e9e) {
    return {
      ok: false,
      error: "Electron media task API unavailable"
    };
  }
  return await _0x2f5e9e.cancel({
    taskId: _0x336783
  });
}
export async function listElectronMediaTasks(_0x217a8c = {}) {
  const _0x55dbc1 = getMediaTaskBridge();
  if (!_0x55dbc1) {
    return {
      tasks: []
    };
  }
  return await _0x55dbc1.list(_0x217a8c);
}
function buildBackendBodyFromElectronPayload(_0x4ddf31 = {}) {
  const _0x328989 = String(_0x4ddf31?.kind || "").trim();
  const _0x2f8fc3 = _0x4ddf31?.args || {};
  if (_0x328989 === "audioCut") {
    return {
      src: _0x4ddf31.src,
      start: _0x2f8fc3.start ?? _0x4ddf31.start,
      end: _0x2f8fc3.end ?? _0x4ddf31.end
    };
  }
  return {
    src: _0x4ddf31.src,
    start: _0x2f8fc3.videoStart ?? _0x2f8fc3.start ?? _0x4ddf31.videoStart ?? _0x4ddf31.start,
    end: _0x2f8fc3.videoEnd ?? _0x2f8fc3.end ?? _0x4ddf31.videoEnd ?? _0x4ddf31.end,
    audioSrc: _0x2f8fc3.audioSrc ?? _0x4ddf31.audioSrc,
    audioStart: _0x2f8fc3.audioStart ?? _0x4ddf31.audioStart,
    audioEnd: _0x2f8fc3.audioEnd ?? _0x4ddf31.audioEnd,
    fps: _0x2f8fc3.fps ?? _0x4ddf31.fps
  };
}
export async function runLocalMediaClipExport(_0x31bb17 = {}, _0x15d6e8 = {}) {
  const _0x23f704 = _0x31bb17?.electronPayload || _0x31bb17;
  const _0xe0ced2 = _0x31bb17?.outputType === "audio" || _0x23f704?.kind === "audioCut" ? "audio" : "video";
  const _0x4102e3 = Number(_0x15d6e8.timeout || 0) || 600000;
  if (canUseElectronMediaTask()) {
    return await enqueueElectronMediaTask(_0x23f704, {
      wait: true,
      timeout: _0x4102e3
    });
  }
  const _0x44cc6e = _0x31bb17?.backendBody || buildBackendBodyFromElectronPayload(_0x23f704);
  const _0x50173e = await requester({
    url: _0xe0ced2 === "audio" ? "/api/v2/audio/cut" : "/api/v2/video/clip_export",
    method: "POST",
    provider: "local",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(_0x44cc6e),
    timeout: _0x4102e3,
    allow404Null: true,
    returnMeta: true
  });
  if (!_0x50173e?.data) {
    throw new Error("Local media clip export API unavailable");
  }
  return _0x50173e.data;
}