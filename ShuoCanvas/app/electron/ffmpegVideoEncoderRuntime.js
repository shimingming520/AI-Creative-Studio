const SOFTWARE_H264_ENCODER_PROFILE = Object.freeze({
  id: "software",
  codec: "libx264",
  hardware: false
});
const PLATFORM_H264_ENCODER_PROFILES = Object.freeze({
  win32: Object.freeze([Object.freeze({
    id: "nvidia-nvenc",
    codec: "h264_nvenc",
    hardware: true
  }), Object.freeze({
    id: "amd-amf",
    codec: "h264_amf",
    hardware: true
  }), Object.freeze({
    id: "intel-qsv",
    codec: "h264_qsv",
    hardware: true
  })]),
  darwin: Object.freeze([Object.freeze({
    id: "apple-videotoolbox",
    codec: "h264_videotoolbox",
    hardware: true
  })])
});
const SOFTWARE_ONLY_VIDEO_OPTIONS = new Set(["-crf", "-pix_fmt", "-preset", "-profile:v"]);
const DEFAULT_PROBE_TIMEOUT_MS = 15000;
function clampInteger(_0x306224, _0x34c49b, _0x217954, _0x346e4a) {
  const _0x49aa01 = Math.round(Number(_0x306224));
  if (!Number.isFinite(_0x49aa01)) {
    return _0x346e4a;
  }
  return Math.max(_0x34c49b, Math.min(_0x217954, _0x49aa01));
}
function normalizeSoftwarePreset(_0x3de49b) {
  const _0x34494c = String(_0x3de49b || "").trim().toLowerCase();
  return _0x34494c || "fast";
}
function normalizeCrf(_0xb0188) {
  return clampInteger(_0xb0188, 0, 51, 23);
}
function readOptionValue(_0x2d98c0, _0x1cb8fb, _0x36a06c = "") {
  for (let _0x1abcf2 = _0x2d98c0.length - 2; _0x1abcf2 >= 0; _0x1abcf2 -= 1) {
    if (_0x2d98c0[_0x1abcf2] === _0x1cb8fb) {
      return String(_0x2d98c0[_0x1abcf2 + 1] ?? _0x36a06c);
    }
  }
  return _0x36a06c;
}
function hasEncoder(_0x4ff97e, _0x10ea93) {
  const _0x352103 = String(_0x10ea93 || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return !!_0x352103 && new RegExp("(?:^|\\s)" + _0x352103 + "(?:\\s|$)", "m").test(String(_0x4ff97e || ""));
}
function getPlatformProfiles(_0x4bb4d8) {
  return PLATFORM_H264_ENCODER_PROFILES[String(_0x4bb4d8 || "").trim()] || [];
}
function mapNvencPreset(_0x5b8299) {
  switch (normalizeSoftwarePreset(_0x5b8299)) {
    case "ultrafast":
    case "superfast":
    case "veryfast":
      return "p3";
    case "slow":
    case "slower":
      return "p5";
    case "veryslow":
      return "p6";
    default:
      return "p4";
  }
}
function mapQsvPreset(_0x580ab3) {
  const _0x29c627 = normalizeSoftwarePreset(_0x580ab3);
  if (["veryfast", "faster", "fast", "medium", "slow", "slower", "veryslow"].includes(_0x29c627)) {
    return _0x29c627;
  }
  return "fast";
}
function mapVideoToolboxQuality(_0x384834) {
  return clampInteger(100 - normalizeCrf(_0x384834) * 1.5, 1, 100, 65);
}
export function buildHardwareH264EncoderArgs(_0x1dd18d, {
  softwarePreset = "fast",
  crf = 23
} = {}) {
  const _0x24da0a = String(_0x1dd18d?.codec || "");
  const _0x4dd0c5 = normalizeCrf(crf);
  if (_0x24da0a === "h264_nvenc") {
    return ["-c:v", _0x24da0a, "-pix_fmt", "yuv420p", "-profile:v", "high", "-preset", mapNvencPreset(softwarePreset), "-tune", "hq", "-rc", "vbr", "-cq", String(_0x4dd0c5), "-b:v", "0"];
  }
  if (_0x24da0a === "h264_amf") {
    return ["-c:v", _0x24da0a, "-pix_fmt", "yuv420p", "-profile:v", "high", "-quality", /^(?:ultrafast|superfast|veryfast|fast)$/.test(normalizeSoftwarePreset(softwarePreset)) ? "speed" : "balanced", "-rc", "cqp", "-qp_i", String(_0x4dd0c5), "-qp_p", String(_0x4dd0c5), "-qp_b", String(_0x4dd0c5)];
  }
  if (_0x24da0a === "h264_qsv") {
    return ["-c:v", _0x24da0a, "-pix_fmt", "nv12", "-profile:v", "high", "-preset", mapQsvPreset(softwarePreset), "-global_quality", String(_0x4dd0c5)];
  }
  if (_0x24da0a === "h264_videotoolbox") {
    return ["-c:v", _0x24da0a, "-pix_fmt", "yuv420p", "-profile:v", "high", "-q:v", String(mapVideoToolboxQuality(_0x4dd0c5)), "-prio_speed", /^(?:ultrafast|superfast|veryfast|fast)$/.test(normalizeSoftwarePreset(softwarePreset)) ? "1" : "0"];
  }
  return ["-c:v", SOFTWARE_H264_ENCODER_PROFILE.codec];
}
export function usesSoftwareH264Encoder(_0x1ab19e = []) {
  return _0x1ab19e.some((_0x5d2d5e, _0x394b74) => _0x5d2d5e === "-c:v" && _0x1ab19e[_0x394b74 + 1] === SOFTWARE_H264_ENCODER_PROFILE.codec);
}
export function applyHardwareH264EncoderProfile(_0x391d2a = [], _0x13b910 = {}) {
  const _0x55ac87 = Array.isArray(_0x391d2a) ? [..._0x391d2a] : [];
  if (!_0x13b910?.hardware || !usesSoftwareH264Encoder(_0x55ac87)) {
    return _0x55ac87;
  }
  const _0x1f6a9a = readOptionValue(_0x55ac87, "-preset", "fast");
  const _0x356813 = readOptionValue(_0x55ac87, "-crf", "23");
  const _0x2b78fc = buildHardwareH264EncoderArgs(_0x13b910, {
    softwarePreset: _0x1f6a9a,
    crf: _0x356813
  });
  const _0x580394 = [];
  for (let _0x54a1e8 = 0; _0x54a1e8 < _0x55ac87.length; _0x54a1e8 += 1) {
    const _0x5f6e0 = _0x55ac87[_0x54a1e8];
    if (_0x5f6e0 === "-c:v" && _0x55ac87[_0x54a1e8 + 1] === SOFTWARE_H264_ENCODER_PROFILE.codec) {
      _0x580394.push(..._0x2b78fc);
      _0x54a1e8 += 1;
      continue;
    }
    if (SOFTWARE_ONLY_VIDEO_OPTIONS.has(_0x5f6e0)) {
      _0x54a1e8 += 1;
      continue;
    }
    _0x580394.push(_0x5f6e0);
  }
  return _0x580394;
}
function buildEncoderProbeArgs(_0xfa03e1) {
  return ["-hide_banner", "-loglevel", "error", "-f", "lavfi", "-i", "color=c=black:s=256x256:r=1", "-frames:v", "1", ...buildHardwareH264EncoderArgs(_0xfa03e1, {
    softwarePreset: "fast",
    crf: 23
  }), "-f", "null", "-"];
}
export async function probeFfmpegH264Encoder({
  ffmpegPath: _0x5f5597,
  platform = process.platform,
  runCapture: _0x2f5d64,
  cwd = process.cwd(),
  timeoutMs = DEFAULT_PROBE_TIMEOUT_MS
} = {}) {
  if (!_0x5f5597 || typeof _0x2f5d64 !== "function") {
    return SOFTWARE_H264_ENCODER_PROFILE;
  }
  let _0x539d61 = "";
  try {
    const _0x4c88f8 = await _0x2f5d64(_0x5f5597, ["-hide_banner", "-encoders"], {
      cwd: cwd,
      timeoutMs: timeoutMs
    });
    _0x539d61 = Buffer.isBuffer(_0x4c88f8) ? _0x4c88f8.toString("utf8") : String(_0x4c88f8 || "");
  } catch {
    return SOFTWARE_H264_ENCODER_PROFILE;
  }
  for (const _0x354090 of getPlatformProfiles(platform)) {
    if (!hasEncoder(_0x539d61, _0x354090.codec)) {
      continue;
    }
    try {
      await _0x2f5d64(_0x5f5597, buildEncoderProbeArgs(_0x354090), {
        cwd: cwd,
        timeoutMs: timeoutMs
      });
      return _0x354090;
    } catch {}
  }
  return SOFTWARE_H264_ENCODER_PROFILE;
}
function shouldSkipSoftwareFallback(_0x271b3f) {
  return _0x271b3f?.name === "MediaTaskCancelledError" || _0x271b3f?.name === "MediaTaskProcessTimeoutError" || _0x271b3f?.code === "MEDIA_TASK_PROCESS_TIMEOUT";
}
export function createFfmpegVideoEncoderRuntime({
  ffmpegPath: _0x48b9f0,
  platform = process.platform,
  runCapture: _0x483376,
  cwd = process.cwd(),
  logger = console
} = {}) {
  let _0x34c30d = null;
  let _0x232a37 = null;
  const _0xf2476e = _0x4ccf9a => {
    _0x34c30d = _0x4ccf9a || SOFTWARE_H264_ENCODER_PROFILE;
    return _0x34c30d;
  };
  const _0x1e6831 = async () => {
    if (_0x34c30d) {
      return _0x34c30d;
    }
    if (!_0x232a37) {
      _0x232a37 = probeFfmpegH264Encoder({
        ffmpegPath: _0x48b9f0,
        platform: platform,
        runCapture: _0x483376,
        cwd: cwd
      }).then(_0xbcc454 => {
        const _0x410313 = _0xf2476e(_0xbcc454);
        logger?.info?.("[ffmpeg] H.264 encoder selected: " + _0x410313.id + " (" + _0x410313.codec + ")");
        return _0x410313;
      });
    }
    return _0x232a37;
  };
  return {
    getProfile: _0x1e6831,
    getCachedProfile() {
      return _0x34c30d;
    },
    warmup() {
      return _0x1e6831();
    },
    async runTask(_0x147803, _0xde980a, _0x2a2a8e = [], _0x871335 = {}) {
      if (!_0xde980a || typeof _0xde980a.runProcess !== "function") {
        throw new Error("Missing media task process runner");
      }
      const _0x68b2f0 = Array.isArray(_0x2a2a8e) ? [..._0x2a2a8e] : [];
      if (!usesSoftwareH264Encoder(_0x68b2f0)) {
        return _0xde980a.runProcess(_0x147803, _0x48b9f0, _0x68b2f0, _0x871335);
      }
      const _0xef913a = await _0x1e6831();
      if (!_0xef913a.hardware) {
        return _0xde980a.runProcess(_0x147803, _0x48b9f0, _0x68b2f0, _0x871335);
      }
      const _0x8c4ac3 = applyHardwareH264EncoderProfile(_0x68b2f0, _0xef913a);
      try {
        return await _0xde980a.runProcess(_0x147803, _0x48b9f0, _0x8c4ac3, _0x871335);
      } catch (_0x2d7d68) {
        if (shouldSkipSoftwareFallback(_0x2d7d68)) {
          throw _0x2d7d68;
        }
        _0xf2476e(SOFTWARE_H264_ENCODER_PROFILE);
        _0x232a37 = Promise.resolve(SOFTWARE_H264_ENCODER_PROFILE);
        logger?.warn?.("[ffmpeg] " + _0xef913a.codec + " failed; falling back to libx264 for this session.");
        _0xde980a.emitProgress?.(_0x147803, _0x147803?.progress || 0, "Hardware encoder unavailable; retrying with CPU");
        _0xde980a.throwIfCancelled?.(_0x147803);
        return _0xde980a.runProcess(_0x147803, _0x48b9f0, _0x68b2f0, _0x871335);
      }
    }
  };
}
let configuredRuntime = null;
export function configureFfmpegVideoEncoderRuntime(_0x2d5702 = {}) {
  configuredRuntime = createFfmpegVideoEncoderRuntime(_0x2d5702);
  configuredRuntime.warmup();
  return configuredRuntime;
}
export function runFfmpegVideoTask(_0x207f2e, _0x96b333, _0x231880 = [], _0x301ce0 = {}) {
  if (!configuredRuntime) {
    throw new Error("FFmpeg video encoder runtime is not configured");
  }
  return configuredRuntime.runTask(_0x207f2e, _0x96b333, _0x231880, _0x301ce0);
}
export { SOFTWARE_H264_ENCODER_PROFILE };