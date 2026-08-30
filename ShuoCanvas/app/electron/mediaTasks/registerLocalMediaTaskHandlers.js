import { createHash } from "node:crypto";
import { existsSync, mkdirSync, statSync, writeFileSync } from "node:fs";
import a259_0x23362c from "node:path";
import { finalizeVideoPlaybackProxyMigrationResult } from "../videoPlaybackProxy.js";
const VIDEO_POSTER_TIMEOUT_MS = 60000;
const AUDIO_WAVEFORM_TIMEOUT_MS = 1800000;
function runVideoTranscode(_0xce5f10, _0x3120b6, _0x229843, _0x3583af, _0x5c928a = {}) {
  if (typeof _0xce5f10.runFfmpegTask === "function") {
    return _0xce5f10.runFfmpegTask(_0x3120b6, _0x229843, _0x3583af, _0x5c928a);
  }
  return _0x229843.runProcess(_0x3120b6, _0xce5f10.getRuntimeToolOrFallback("ffmpeg"), _0x3583af, _0x5c928a);
}
function createVideoPosterHandler(_0x581ec0) {
  return async (_0x334904, _0x1967ba) => {
    const _0x58501 = _0x334904.payload.originalLocalPath || _0x334904.payload.src;
    const _0x31b4ea = _0x581ec0.resolveMediaTaskSource(_0x58501);
    const _0x5b0b93 = String(_0x334904.payload.assetId || "").trim() || createHash("sha1").update(_0x58501).digest("hex");
    const _0x182811 = a259_0x23362c.join(_0x581ec0.getAssetsDir(), "derived", "video");
    mkdirSync(_0x182811, {
      recursive: true
    });
    const _0x12d9bc = a259_0x23362c.join(_0x182811, _0x5b0b93 + ".poster.jpg");
    const _0x3d83eb = _0x581ec0.toAssetLocalPath("derived", "video", _0x5b0b93 + ".poster.jpg");
    const _0x4c35a8 = finalizeVideoPlaybackProxyMigrationResult(await _0x581ec0.ensureAssetVideoPlaybackProxy(_0x334904, _0x1967ba, _0x31b4ea, _0x5b0b93), {
      sourceLocalPath: _0x58501,
      targetVersion: _0x334904.payload.videoProxyTargetVersion
    });
    if (!existsSync(_0x12d9bc)) {
      await _0x1967ba.runProcess(_0x334904, _0x581ec0.getRuntimeToolOrFallback("ffmpeg"), ["-y", "-ss", "0.1", "-i", _0x31b4ea, "-frames:v", "1", "-vf", "scale=640:-2", _0x12d9bc], {
        timeoutMs: VIDEO_POSTER_TIMEOUT_MS
      });
    }
    const _0x494b0e = {
      ..._0x4c35a8,
      posterLocalPath: _0x3d83eb,
      thumbLocalPath: _0x3d83eb,
      posterUrl: "/" + _0x3d83eb,
      thumbUrl: "/" + _0x3d83eb
    };
    if (_0x334904.payload.assetId) {
      const _0x3a582a = _0x581ec0.updateAssetRecord(_0x334904.payload.assetId, {
        ..._0x494b0e,
        status: "ready",
        error: "",
        mediaTaskId: _0x334904.id,
        mediaTaskKind: _0x334904.kind,
        mediaTaskStatus: "complete",
        mediaTaskProgress: 1,
        mediaTaskError: ""
      }, {
        expectedMediaTaskId: _0x334904.id
      });
      _0x581ec0.sendAssetUpdated(_0x3a582a);
    }
    return _0x494b0e;
  };
}
function createAudioWaveformHandler(_0x28ee13) {
  return async (_0x5dcdab, _0x489525) => {
    const _0x329c40 = _0x5dcdab.payload.originalLocalPath || _0x5dcdab.payload.src;
    const _0x2b0ac3 = _0x28ee13.resolveMediaTaskSource(_0x329c40);
    const _0x202e9e = String(_0x5dcdab.payload.assetId || "").trim() || createHash("sha1").update(_0x329c40).digest("hex");
    const _0xd9dd6 = a259_0x23362c.join(_0x28ee13.getAssetsDir(), "derived", "audio");
    mkdirSync(_0xd9dd6, {
      recursive: true
    });
    const _0x58f9fa = a259_0x23362c.join(_0xd9dd6, _0x202e9e + ".waveform.json");
    const _0x109e53 = _0x28ee13.toAssetLocalPath("derived", "audio", _0x202e9e + ".waveform.json");
    if (!existsSync(_0x58f9fa)) {
      const _0x115f12 = await _0x489525.runProcess(_0x5dcdab, _0x28ee13.getRuntimeToolOrFallback("ffmpeg"), ["-v", "error", "-i", _0x2b0ac3, "-ac", "1", "-ar", "8000", "-f", "f32le", "pipe:1"], {
        timeoutMs: AUDIO_WAVEFORM_TIMEOUT_MS
      });
      writeFileSync(_0x58f9fa, JSON.stringify(_0x28ee13.buildWaveformJsonFromFloat32(_0x115f12.stdout)) + "\n", "utf8");
    }
    const _0x442997 = {
      waveformLocalPath: _0x109e53,
      waveformUrl: "/" + _0x109e53
    };
    if (_0x5dcdab.payload.assetId) {
      const _0x32f558 = _0x28ee13.updateAssetRecord(_0x5dcdab.payload.assetId, {
        ..._0x442997,
        status: "ready",
        error: "",
        mediaTaskId: _0x5dcdab.id,
        mediaTaskKind: _0x5dcdab.kind,
        mediaTaskStatus: "complete",
        mediaTaskProgress: 1,
        mediaTaskError: ""
      }, {
        expectedMediaTaskId: _0x5dcdab.id
      });
      _0x28ee13.sendAssetUpdated(_0x32f558);
    }
    return _0x442997;
  };
}
function createVideoFirstFrameHandler(_0x8e2d4) {
  return async (_0x19e113, _0x5d070d) => {
    const _0x546655 = String(_0x19e113.payload.src || "").trim();
    const _0x1153ad = _0x8e2d4.resolveMediaTaskSource(_0x546655);
    const _0x54d687 = statSync(_0x1153ad);
    const _0x246cdd = _0x546655.replace(/^\/+/, "") + "|" + _0x54d687.mtimeMs + "|" + _0x54d687.size;
    const _0x240d30 = createHash("sha1").update(_0x246cdd).digest("hex").slice(0, 12);
    const _0x4a2274 = a259_0x23362c.join(_0x8e2d4.getOutputDir(), "VideoThumbs");
    mkdirSync(_0x4a2274, {
      recursive: true
    });
    const _0x125d40 = "vthumb_" + _0x240d30 + ".jpg";
    const _0x12a6f2 = a259_0x23362c.join(_0x4a2274, _0x125d40);
    const _0x21670c = _0x8e2d4.toOutputLocalPath("VideoThumbs", _0x125d40);
    if (!existsSync(_0x12a6f2)) {
      await _0x5d070d.runProcess(_0x19e113, _0x8e2d4.getRuntimeToolOrFallback("ffmpeg"), ["-y", "-ss", "0", "-i", _0x1153ad, "-frames:v", "1", "-vf", "scale=240:-2", "-q:v", "8", "-an", _0x12a6f2]);
    }
    return {
      success: true,
      localPath: _0x21670c,
      path: _0x21670c,
      url: "/" + _0x21670c
    };
  };
}
function readCutRange(_0x1b33e8) {
  const _0x436fba = Math.max(0, Number(_0x1b33e8.payload.args?.start ?? _0x1b33e8.payload.start ?? 0) || 0);
  const _0x15cccd = Math.max(0, Number(_0x1b33e8.payload.args?.end ?? _0x1b33e8.payload.end ?? 0) || 0);
  return {
    start: _0x436fba,
    end: _0x15cccd
  };
}
function createVideoCutHandler(_0x57ba48) {
  return async (_0x18ca1b, _0x29126a) => {
    const _0x33f283 = _0x57ba48.resolveMediaTaskSource(_0x18ca1b.payload.src);
    const {
      start: _0x50bca8,
      end: _0x1e8d53
    } = readCutRange(_0x18ca1b);
    if (!(_0x1e8d53 > _0x50bca8)) {
      throw new Error("Invalid video cut range");
    }
    const _0x12454f = Math.round(Number(_0x18ca1b.payload.args?.fps ?? _0x18ca1b.payload.fps ?? _0x18ca1b.payload.frameRate));
    const _0x2baffd = [16, 24, 30].includes(_0x12454f) ? _0x12454f : 0;
    const _0x518757 = a259_0x23362c.join(_0x57ba48.getOutputDir(), "CutVideo");
    mkdirSync(_0x518757, {
      recursive: true
    });
    const _0x4917fb = _0x57ba48.createOutputFilename("cut", "mp4");
    const _0x54d554 = a259_0x23362c.join(_0x518757, _0x4917fb);
    const _0x4eb235 = _0x57ba48.toOutputLocalPath("CutVideo", _0x4917fb);
    await runVideoTranscode(_0x57ba48, _0x18ca1b, _0x29126a, ["-y", "-ss", String(_0x50bca8), "-i", _0x33f283, "-t", String(_0x1e8d53 - _0x50bca8), "-c:v", "libx264", "-pix_fmt", "yuv420p", "-profile:v", "high", "-preset", "fast", "-c:a", "aac", ...(_0x2baffd ? ["-r", String(_0x2baffd)] : []), "-movflags", "+faststart", _0x54d554], {
      durationSec: _0x1e8d53 - _0x50bca8,
      progressMessage: "Cutting video"
    });
    return {
      success: true,
      filename: _0x4917fb,
      path: _0x4eb235,
      localPath: _0x4eb235,
      url: "/" + _0x4eb235
    };
  };
}
function createAudioCutHandler(_0x213796) {
  return async (_0x23dd8f, _0x331508) => {
    const _0x3aca7b = _0x213796.resolveMediaTaskSource(_0x23dd8f.payload.src);
    const {
      start: _0x47e9af,
      end: _0x3a58f3
    } = readCutRange(_0x23dd8f);
    if (!(_0x3a58f3 > _0x47e9af)) {
      throw new Error("Invalid audio cut range");
    }
    const _0x10cccd = a259_0x23362c.join(_0x213796.getOutputDir(), "CutAudio");
    mkdirSync(_0x10cccd, {
      recursive: true
    });
    const _0x135225 = _0x213796.createOutputFilename("cut", "mp3");
    const _0x41faa8 = a259_0x23362c.join(_0x10cccd, _0x135225);
    const _0x3471ce = _0x213796.toOutputLocalPath("CutAudio", _0x135225);
    await _0x331508.runProcess(_0x23dd8f, _0x213796.getRuntimeToolOrFallback("ffmpeg"), ["-y", "-i", _0x3aca7b, "-ss", String(_0x47e9af), "-t", String(_0x3a58f3 - _0x47e9af), "-vn", "-c:a", "libmp3lame", "-b:a", "192k", _0x41faa8], {
      durationSec: _0x3a58f3 - _0x47e9af,
      progressMessage: "Cutting audio"
    });
    return {
      success: true,
      filename: _0x135225,
      path: _0x3471ce,
      localPath: _0x3471ce,
      url: "/" + _0x3471ce
    };
  };
}
function createVideoAudioSeparateHandler(_0x14b8b9) {
  return async (_0x566658, _0x81738d) => {
    const _0x4f9a00 = _0x14b8b9.resolveMediaTaskSource(_0x566658.payload.src);
    const _0x6c43bf = await _0x14b8b9.ffprobeVideoMeta(_0x81738d, _0x566658, _0x4f9a00);
    if (!_0x6c43bf.width || !_0x6c43bf.height) {
      throw new Error("Source video has no video stream");
    }
    if (!(await _0x14b8b9.ffprobeHasAudio(_0x81738d, _0x566658, _0x4f9a00))) {
      throw new Error("Source video has no audio stream");
    }
    const _0x1ad519 = a259_0x23362c.join(_0x14b8b9.getOutputDir(), "SeparateVideo");
    const _0x1cd20c = a259_0x23362c.join(_0x14b8b9.getOutputDir(), "SeparateAudio");
    mkdirSync(_0x1ad519, {
      recursive: true
    });
    mkdirSync(_0x1cd20c, {
      recursive: true
    });
    const _0x154010 = _0x14b8b9.createOutputFilename("video", "mp4");
    const _0x1309e3 = _0x14b8b9.createOutputFilename("audio", "mp3");
    const _0x41abd1 = a259_0x23362c.join(_0x1ad519, _0x154010);
    const _0x2df769 = a259_0x23362c.join(_0x1cd20c, _0x1309e3);
    await _0x81738d.runProcess(_0x566658, _0x14b8b9.getRuntimeToolOrFallback("ffmpeg"), ["-y", "-i", _0x4f9a00, "-map", "0:v:0", "-an", "-c:v", "copy", _0x41abd1], {
      durationSec: _0x6c43bf.duration || 0,
      initialProgress: 0.05,
      progressMessage: "Extracting video"
    });
    _0x81738d.emitProgress(_0x566658, 0.55, "Extracting audio");
    await _0x81738d.runProcess(_0x566658, _0x14b8b9.getRuntimeToolOrFallback("ffmpeg"), ["-y", "-i", _0x4f9a00, "-map", "0:a:0", "-vn", "-c:a", "libmp3lame", "-b:a", "192k", _0x2df769], {
      durationSec: _0x6c43bf.duration || 0,
      initialProgress: 0.55,
      progressMessage: "Extracting audio"
    });
    const _0x594c23 = _0x14b8b9.toOutputLocalPath("SeparateVideo", _0x154010);
    const _0x404310 = _0x14b8b9.toOutputLocalPath("SeparateAudio", _0x1309e3);
    return {
      success: true,
      video: {
        filename: _0x154010,
        path: _0x594c23,
        localPath: _0x594c23,
        url: "/" + _0x594c23
      },
      audio: {
        filename: _0x1309e3,
        path: _0x404310,
        localPath: _0x404310,
        url: "/" + _0x404310
      }
    };
  };
}
function createVideoComposeHandler(_0x373492) {
  return async (_0x7bc6d0, _0x482c64) => {
    const _0x48a4d1 = Array.isArray(_0x7bc6d0.payload.srcs) ? _0x7bc6d0.payload.srcs : Array.isArray(_0x7bc6d0.payload.args?.srcs) ? _0x7bc6d0.payload.args.srcs : [];
    const _0x2da5b3 = _0x48a4d1.map(_0x53d6a0 => _0x373492.resolveMediaTaskSource(_0x53d6a0));
    const _0x5f46bb = _0x7bc6d0.payload.args?.includeAudio !== false;
    if (_0x2da5b3.length < 1 || _0x2da5b3.length < 2 && _0x5f46bb) {
      throw new Error("Invalid video compose sources");
    }
    const _0x48119f = await _0x373492.ffprobeVideoMeta(_0x482c64, _0x7bc6d0, _0x2da5b3[0]);
    if (!_0x48119f.width || !_0x48119f.height) {
      throw new Error("FFprobe failed: missing width/height");
    }
    const _0x1c70d3 = _0x5f46bb ? await Promise.all(_0x2da5b3.map(_0x406c0c => _0x373492.ffprobeHasAudio(_0x482c64, _0x7bc6d0, _0x406c0c))) : [];
    const _0x502812 = _0x5f46bb && _0x1c70d3.every(Boolean);
    const _0x3a51d7 = a259_0x23362c.join(_0x373492.getOutputDir(), "ComposeVideo");
    mkdirSync(_0x3a51d7, {
      recursive: true
    });
    const _0xc3deae = _0x373492.createOutputFilename("compose", "mp4");
    const _0x253694 = a259_0x23362c.join(_0x3a51d7, _0xc3deae);
    const _0x3de8c3 = _0x373492.toOutputLocalPath("ComposeVideo", _0xc3deae);
    const _0x3079e0 = Math.max(1, Math.round(_0x48119f.fps || 30));
    const _0x596b90 = [];
    _0x2da5b3.forEach((_0x35dca3, _0x4f3e3b) => {
      _0x596b90.push("[" + _0x4f3e3b + ":v]scale=" + _0x48119f.width + ":" + _0x48119f.height + ":force_original_aspect_ratio=decrease,pad=" + _0x48119f.width + ":" + _0x48119f.height + ":(ow-iw)/2:(oh-ih)/2,setsar=1,fps=" + _0x3079e0 + ",format=yuv420p,setpts=PTS-STARTPTS[v" + _0x4f3e3b + "]");
      if (_0x502812) {
        _0x596b90.push("[" + _0x4f3e3b + ":a]aformat=sample_rates=44100:channel_layouts=stereo,asetpts=PTS-STARTPTS[a" + _0x4f3e3b + "]");
      }
    });
    if (_0x502812) {
      _0x596b90.push(_0x2da5b3.map((_0x1ad246, _0x32bc22) => "[v" + _0x32bc22 + "][a" + _0x32bc22 + "]").join("") + "concat=n=" + _0x2da5b3.length + ":v=1:a=1[v][a]");
    } else {
      _0x596b90.push(_0x2da5b3.map((_0x47b2aa, _0x5add0b) => "[v" + _0x5add0b + "]").join("") + "concat=n=" + _0x2da5b3.length + ":v=1:a=0[v]");
    }
    const _0x475033 = ["-y"];
    _0x2da5b3.forEach(_0x57d92b => _0x475033.push("-i", _0x57d92b));
    _0x475033.push("-filter_complex", _0x596b90.join(";"), "-map", "[v]");
    if (_0x502812) {
      _0x475033.push("-map", "[a]");
    }
    _0x475033.push("-c:v", "libx264", "-preset", "fast", ...(_0x502812 ? ["-c:a", "aac"] : []), "-movflags", "+faststart", _0x253694);
    await runVideoTranscode(_0x373492, _0x7bc6d0, _0x482c64, _0x475033, {
      durationSec: Number(_0x7bc6d0.payload.args?.duration || 0) || _0x48119f.duration || 0,
      progressMessage: "Composing video"
    });
    return {
      success: true,
      filename: _0xc3deae,
      path: _0x3de8c3,
      localPath: _0x3de8c3,
      url: "/" + _0x3de8c3
    };
  };
}
function createVideoAudioMuxHandler(_0x120a45) {
  return async (_0x42a7c8, _0x91ca17) => {
    const _0x57f0d9 = _0x42a7c8.payload || {};
    const _0x25956a = _0x57f0d9.args || {};
    const _0x49bcfa = _0x120a45.resolveMediaTaskSource(_0x57f0d9.src || _0x25956a.src);
    const _0x3b7e09 = _0x120a45.resolveMediaTaskSource(_0x25956a.audioSrc || _0x57f0d9.audioSrc);
    const _0x3c4505 = await _0x120a45.ffprobeVideoMeta(_0x91ca17, _0x42a7c8, _0x49bcfa);
    if (!_0x3c4505.width || !_0x3c4505.height) {
      throw new Error("Source video has no video stream");
    }
    if (!(await _0x120a45.ffprobeHasAudio(_0x91ca17, _0x42a7c8, _0x3b7e09))) {
      throw new Error("Source audio has no audio stream");
    }
    const _0x4a3428 = a259_0x23362c.join(_0x120a45.getOutputDir(), "MuxVideo");
    mkdirSync(_0x4a3428, {
      recursive: true
    });
    const _0x57b7f3 = _0x120a45.createOutputFilename("mux", "mp4");
    const _0x79ce9f = a259_0x23362c.join(_0x4a3428, _0x57b7f3);
    const _0x38c12c = _0x120a45.toOutputLocalPath("MuxVideo", _0x57b7f3);
    const _0x2f1781 = Math.max(0, Number(_0x3c4505.duration) || 0);
    const _0x2a4f1f = ["-y", "-i", _0x49bcfa, "-i", _0x3b7e09, "-map", "0:v:0", "-map", "1:a:0", "-c:v", "copy", "-c:a", "aac", "-af", "apad", ...(_0x2f1781 > 0 ? ["-t", String(_0x2f1781)] : ["-shortest"]), "-movflags", "+faststart", _0x79ce9f];
    await _0x91ca17.runProcess(_0x42a7c8, _0x120a45.getRuntimeToolOrFallback("ffmpeg"), _0x2a4f1f, {
      durationSec: _0x2f1781,
      progressMessage: "Muxing video audio"
    });
    return {
      success: true,
      filename: _0x57b7f3,
      path: _0x38c12c,
      localPath: _0x38c12c,
      url: "/" + _0x38c12c
    };
  };
}
export function registerLocalMediaTaskHandlers(_0x24252a, _0x25cb52 = {}) {
  if (!_0x24252a || typeof _0x24252a.setHandler !== "function") {
    return;
  }
  _0x24252a.setHandler("videoPoster", createVideoPosterHandler(_0x25cb52));
  _0x24252a.setHandler("audioWaveform", createAudioWaveformHandler(_0x25cb52));
  _0x24252a.setHandler("videoFirstFrame", createVideoFirstFrameHandler(_0x25cb52));
  _0x24252a.setHandler("videoCut", createVideoCutHandler(_0x25cb52));
  _0x24252a.setHandler("audioCut", createAudioCutHandler(_0x25cb52));
  _0x24252a.setHandler("videoAudioSeparate", createVideoAudioSeparateHandler(_0x25cb52));
  _0x24252a.setHandler("videoCompose", createVideoComposeHandler(_0x25cb52));
  _0x24252a.setHandler("videoAudioMux", createVideoAudioMuxHandler(_0x25cb52));
}