import { mkdirSync } from "node:fs";
import a256_0x4dfe36 from "node:path";
function toNumber(_0x389631, _0x3e22e6 = 0) {
  const _0x19781e = Number(_0x389631);
  if (Number.isFinite(_0x19781e)) {
    return _0x19781e;
  } else {
    return _0x3e22e6;
  }
}
function normalizeNonNegative(_0x4648b9, _0x4106fe = 0) {
  return Math.max(0, toNumber(_0x4648b9, _0x4106fe));
}
function normalizeSourceKind(_0x5defb9 = "") {
  if (String(_0x5defb9 || "").trim() === "audio") {
    return "audio";
  } else {
    return "video";
  }
}
function normalizeOutputKind(_0x40265d = "", _0x204096 = "video") {
  if (String(_0x40265d || "").trim() === "audio") {
    return "audio";
  }
  return normalizeSourceKind(_0x204096);
}
function normalizeExplicitClipDurationMs(_0x206c0b = {}) {
  return Math.max(0, Math.round(Number(_0x206c0b.durationMs) || 0)) || Math.max(0, Math.round(Number(_0x206c0b.durationSec) * 1000 || 0));
}
function normalizeAudioVoiceClips(_0x3579d8 = []) {
  if (!Array.isArray(_0x3579d8)) {
    return [];
  }
  return _0x3579d8.map(_0x24c00d => {
    if (!_0x24c00d || typeof _0x24c00d !== "object") {
      return null;
    }
    const _0x231df0 = String(_0x24c00d.src ?? _0x24c00d.localPath ?? _0x24c00d.path ?? _0x24c00d.audioUrl ?? "").trim();
    if (!_0x231df0) {
      return null;
    }
    const _0x4fa6c6 = Math.max(0, Math.round(Number(_0x24c00d.startMs ?? _0x24c00d.timelineStartMs ?? 0) || 0));
    const _0x48ae57 = Math.max(_0x4fa6c6, Math.round(Number(_0x24c00d.endMs ?? _0x24c00d.timelineEndMs ?? _0x4fa6c6) || _0x4fa6c6));
    const _0x50c9c4 = normalizeExplicitClipDurationMs(_0x24c00d);
    const _0x537483 = _0x48ae57 > _0x4fa6c6 ? _0x48ae57 - _0x4fa6c6 : 0;
    const _0x12c9f3 = _0x50c9c4 || _0x537483;
    if (_0x12c9f3 <= 0) {
      return null;
    }
    return {
      src: _0x231df0,
      startSec: _0x4fa6c6 / 1000,
      durationSec: _0x12c9f3 / 1000,
      hasExplicitDuration: _0x50c9c4 > 0
    };
  }).filter(Boolean);
}
async function readFfprobeJson(_0x549a6a, _0x76a161, _0x4d4c3a, _0x192549) {
  const _0x55ce11 = await _0x549a6a.runProcess(_0x76a161, _0x4d4c3a("ffprobe"), _0x192549);
  const _0x2e525b = _0x55ce11.stdout.toString("utf8").trim();
  if (_0x2e525b) {
    return JSON.parse(_0x2e525b);
  } else {
    return {};
  }
}
async function ffprobeMediaDuration(_0x426465, _0x4f08de, _0x13261e, _0x4be5ff) {
  try {
    const _0x47beb4 = await readFfprobeJson(_0x426465, _0x4f08de, _0x13261e, ["-v", "error", "-show_entries", "format=duration", "-of", "json", _0x4be5ff]);
    return Number(_0x47beb4?.format?.duration || 0) || 0;
  } catch {
    return 0;
  }
}
async function resolveAudioVoiceClipDurations(_0x253c39, _0x1a0fb3, _0x180f3c, _0x86b266, _0x28f588) {
  const _0xca41d2 = [];
  for (let _0x19716b = 0; _0x19716b < _0x253c39.length; _0x19716b += 1) {
    const _0x1d848e = _0x253c39[_0x19716b];
    if (_0x1d848e.hasExplicitDuration) {
      _0xca41d2.push(_0x1d848e);
      continue;
    }
    const _0x85b51c = await ffprobeMediaDuration(_0x180f3c, _0x86b266, _0x28f588, _0x1a0fb3[_0x19716b]);
    _0xca41d2.push(_0x85b51c > 0 ? {
      ..._0x1d848e,
      durationSec: _0x85b51c
    } : _0x1d848e);
  }
  return _0xca41d2;
}
function buildTimelineAudioFilterParts(_0x39f3db = [], _0x4e208e = 0, _0x3641d2 = 0) {
  const _0x1692c2 = _0x39f3db.map((_0x290647, _0x22ad6a) => {
    const _0x1d9dc5 = _0x4e208e + _0x22ad6a;
    const _0x22544e = Math.max(0, Math.round(_0x290647.startSec * 1000));
    return "[" + _0x1d9dc5 + ":a]aformat=sample_rates=44100:channel_layouts=stereo,atrim=0:" + _0x290647.durationSec + ",asetpts=PTS-STARTPTS,adelay=" + _0x22544e + "|" + _0x22544e + "[av" + _0x22ad6a + "]";
  });
  const _0x326018 = _0x39f3db.map((_0x5a3d6f, _0x463be0) => "[av" + _0x463be0 + "]").join("");
  const _0x3bcaf7 = _0x39f3db.length === 1 ? "[av0]apad" : _0x326018 + "amix=inputs=" + _0x39f3db.length + ":duration=longest:normalize=0,apad";
  _0x1692c2.push(_0x3bcaf7 + ",atrim=0:" + _0x3641d2 + "[a]");
  return _0x1692c2;
}
function buildAudioVoiceComposeFfmpegArgs({
  sourceKind = "video",
  outputKind = "",
  sourceAbs = "",
  clipAbs = [],
  clips = [],
  durationSec = 0,
  outAbs = ""
} = {}) {
  if (!outAbs || !durationSec || clips.length <= 0) {
    throw new Error("Invalid audio voice compose payload");
  }
  const _0x36073d = normalizeSourceKind(sourceKind);
  const _0x2f8365 = normalizeOutputKind(outputKind, _0x36073d);
  const _0x5182de = _0x36073d === "video" && _0x2f8365 === "video";
  const _0x238c48 = ["-y"];
  if (_0x5182de) {
    _0x238c48.push("-i", sourceAbs);
  }
  clipAbs.forEach(_0x48702a => _0x238c48.push("-i", _0x48702a));
  _0x238c48.push("-filter_complex", buildTimelineAudioFilterParts(clips, _0x5182de ? 1 : 0, durationSec).join(";"));
  if (_0x5182de) {
    _0x238c48.push("-map", "0:v:0", "-map", "[a]", "-t", String(durationSec), "-c:v", "libx264", "-pix_fmt", "yuv420p", "-profile:v", "high", "-preset", "fast", "-c:a", "aac", "-movflags", "+faststart", outAbs);
    return _0x238c48;
  }
  _0x238c48.push("-map", "[a]", "-t", String(durationSec), "-vn", "-c:a", _0x36073d === "video" ? "aac" : "libmp3lame", "-b:a", "192k", outAbs);
  return _0x238c48;
}
async function createAudioVoiceVideoPosterFields({
  queue: _0x3d5256,
  task: _0x3e3e85,
  getOutputDir: _0x5409f0,
  getRuntimeToolOrFallback: _0x3ac1c8,
  createOutputFilename: _0xbc3b76,
  toOutputLocalPath: _0x21ebcf,
  outAbs: _0x1272b7
}) {
  const _0x2d71f6 = a256_0x4dfe36.join(_0x5409f0(), "VideoThumbs");
  mkdirSync(_0x2d71f6, {
    recursive: true
  });
  const _0x170e86 = _0xbc3b76("voice_compose_poster", "jpg");
  const _0x96689 = a256_0x4dfe36.join(_0x2d71f6, _0x170e86);
  const _0x7d7ee1 = _0x21ebcf("VideoThumbs", _0x170e86);
  await _0x3d5256.runProcess(_0x3e3e85, _0x3ac1c8("ffmpeg"), ["-y", "-ss", "0", "-i", _0x1272b7, "-frames:v", "1", "-vf", "scale=240:-2", "-q:v", "8", "-an", _0x96689], {
    progressMessage: "Creating voice video poster"
  });
  return {
    posterLocalPath: _0x7d7ee1,
    thumbLocalPath: _0x7d7ee1,
    posterUrl: "/" + _0x7d7ee1,
    thumbUrl: "/" + _0x7d7ee1
  };
}
export function createAudioVoiceComposeMediaTaskHandler({
  createOutputFilename: _0x420e74,
  ffprobeVideoMeta: _0x513711,
  getOutputDir: _0x2de0a9,
  getRuntimeToolOrFallback: _0x5c8c62,
  runFfmpegTask: _0x27dfd2,
  resolveMediaTaskSource: _0x36d786,
  toOutputLocalPath: _0x17d261
}) {
  return async (_0x505168, _0x234407) => {
    const _0x11322f = _0x505168.payload || {};
    const _0xdbabc8 = _0x11322f.args || {};
    const _0x3c3169 = normalizeSourceKind(_0xdbabc8.sourceKind ?? _0x11322f.sourceKind);
    const _0x54cd30 = normalizeOutputKind(_0xdbabc8.outputKind ?? _0x11322f.outputKind, _0x3c3169);
    const _0x478d12 = _0x36d786(_0x11322f.src || _0xdbabc8.src);
    const _0x57d3c6 = normalizeAudioVoiceClips(_0xdbabc8.clips || _0x11322f.clips);
    if (_0x57d3c6.length <= 0) {
      throw new Error("Invalid audio voice compose clips");
    }
    const _0x4ddc44 = _0x57d3c6.map(_0xa83088 => _0x36d786(_0xa83088.src));
    const _0x231d2f = await resolveAudioVoiceClipDurations(_0x57d3c6, _0x4ddc44, _0x234407, _0x505168, _0x5c8c62);
    const _0x5c8c3c = Math.max(..._0x231d2f.map(_0x4062cc => _0x4062cc.startSec + _0x4062cc.durationSec), 0);
    const _0x16fde6 = _0x3c3169 === "video" ? await _0x513711(_0x234407, _0x505168, _0x478d12) : null;
    if (_0x3c3169 === "video" && (!_0x16fde6?.width || !_0x16fde6?.height)) {
      throw new Error("Source video has no video stream");
    }
    const _0x5e943b = _0x3c3169 === "video" ? Number(_0x16fde6?.duration || 0) || 0 : await ffprobeMediaDuration(_0x234407, _0x505168, _0x5c8c62, _0x478d12);
    const _0x5b4a36 = normalizeNonNegative(_0xdbabc8.durationSec ?? _0x11322f.durationSec, 0) || normalizeNonNegative((_0xdbabc8.durationMs ?? _0x11322f.durationMs) / 1000, 0) || _0x5e943b || _0x5c8c3c;
    if (!(_0x5b4a36 > 0)) {
      throw new Error("Invalid audio voice compose duration");
    }
    const _0x437c2b = _0x54cd30 === "video";
    const _0x23ce2d = _0x437c2b ? "AudioVoiceVideo" : "AudioVoiceAudio";
    const _0x580e1d = a256_0x4dfe36.join(_0x2de0a9(), _0x23ce2d);
    mkdirSync(_0x580e1d, {
      recursive: true
    });
    const _0x3c37f6 = _0x437c2b ? "mp4" : _0x3c3169 === "video" ? "m4a" : "mp3";
    const _0x4185f9 = _0x420e74("voice_compose", _0x3c37f6);
    const _0x39a30d = a256_0x4dfe36.join(_0x580e1d, _0x4185f9);
    const _0x4ddcd1 = _0x17d261(_0x23ce2d, _0x4185f9);
    const _0x1e084c = buildAudioVoiceComposeFfmpegArgs({
      sourceKind: _0x3c3169,
      outputKind: _0x54cd30,
      sourceAbs: _0x478d12,
      clipAbs: _0x4ddc44,
      clips: _0x231d2f,
      durationSec: _0x5b4a36,
      outAbs: _0x39a30d
    });
    const _0x1dad72 = typeof _0x27dfd2 === "function" ? _0x27dfd2 : (_0x274408, _0x19cfbe, _0x4e2f11, _0x2d6d4a) => _0x19cfbe.runProcess(_0x274408, _0x5c8c62("ffmpeg"), _0x4e2f11, _0x2d6d4a);
    await _0x1dad72(_0x505168, _0x234407, _0x1e084c, {
      durationSec: _0x5b4a36,
      progressMessage: _0x437c2b ? "Composing voice video" : "Composing voice audio"
    });
    const _0x30d136 = _0x437c2b ? await createAudioVoiceVideoPosterFields({
      queue: _0x234407,
      task: _0x505168,
      getOutputDir: _0x2de0a9,
      getRuntimeToolOrFallback: _0x5c8c62,
      createOutputFilename: _0x420e74,
      toOutputLocalPath: _0x17d261,
      outAbs: _0x39a30d
    }).catch(() => ({})) : {};
    return {
      success: true,
      filename: _0x4185f9,
      path: _0x4ddcd1,
      localPath: _0x4ddcd1,
      url: "/" + _0x4ddcd1,
      audioDuration: _0x5b4a36,
      ...(_0x437c2b ? {
        videoDuration: _0x5b4a36,
        videoWidth: _0x16fde6?.width || 0,
        videoHeight: _0x16fde6?.height || 0,
        fps: _0x16fde6?.fps || 0,
        ..._0x30d136
      } : {})
    };
  };
}