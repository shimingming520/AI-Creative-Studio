import { mkdirSync } from "node:fs";
import a258_0x227271 from "node:path";
function toNumber(_0x10895d, _0x4e1cea = 0) {
  const _0xca4106 = Number(_0x10895d);
  if (Number.isFinite(_0xca4106)) {
    return _0xca4106;
  } else {
    return _0x4e1cea;
  }
}
function normalizeNonNegative(_0x1e8120, _0x9dcd21 = 0) {
  return Math.max(0, toNumber(_0x1e8120, _0x9dcd21));
}
function normalizeRequestedFps(_0x417040) {
  const _0x5ae813 = Math.round(Number(_0x417040) || 0);
  if ([16, 24, 30].includes(_0x5ae813)) {
    return _0x5ae813;
  } else {
    return 0;
  }
}
function normalizeOutputSize(_0x4dfa51, _0x511a2a = 0) {
  const _0xdaf25e = Math.round(Number(_0x4dfa51) || 0);
  if (_0xdaf25e > 0) {
    return _0xdaf25e;
  } else {
    return _0x511a2a;
  }
}
function normalizeFilterFps(_0x3ad6ad, _0x4bedd8 = 30) {
  const _0x3e3e03 = Math.round(Number(_0x3ad6ad) || 0);
  if (_0x3e3e03 > 0) {
    return _0x3e3e03;
  } else {
    return Math.max(1, Math.round(Number(_0x4bedd8) || 30));
  }
}
function readRange(_0x5d5f10 = {}, _0x201a9d = {}, _0x17e03f = "") {
  const _0x307895 = _0x17e03f ? _0x17e03f + "Start" : "start";
  const _0x2eeea1 = _0x17e03f ? _0x17e03f + "End" : "end";
  const _0x24afb5 = normalizeNonNegative(_0x201a9d[_0x307895] ?? _0x5d5f10[_0x307895] ?? _0x201a9d.start ?? _0x5d5f10.start, 0);
  const _0x40771e = normalizeNonNegative(_0x201a9d[_0x2eeea1] ?? _0x5d5f10[_0x2eeea1] ?? _0x201a9d.end ?? _0x5d5f10.end, 0);
  if (!(_0x40771e > _0x24afb5)) {
    return null;
  }
  return {
    start: _0x24afb5,
    end: _0x40771e,
    duration: _0x40771e - _0x24afb5
  };
}
function normalizeMediaClipExportClips(_0x23cbf7 = []) {
  if (!Array.isArray(_0x23cbf7)) {
    return [];
  }
  return _0x23cbf7.map(_0x144394 => {
    if (!_0x144394 || typeof _0x144394 !== "object") {
      return null;
    }
    const _0x59876b = String(_0x144394.src ?? _0x144394.sourceKey ?? _0x144394.localPath ?? _0x144394.path ?? _0x144394.abs ?? "").trim();
    if (!_0x59876b) {
      return null;
    }
    const _0xc6f928 = readRange(_0x144394) || readRange({
      start: _0x144394.startSec,
      end: _0x144394.endSec
    });
    if (!_0xc6f928) {
      return null;
    }
    return {
      src: _0x59876b,
      abs: _0x144394.abs ? String(_0x144394.abs) : "",
      kind: String(_0x144394.kind || "").trim() === "image" ? "image" : "video",
      hasAudio: _0x144394.hasAudio === true,
      start: _0xc6f928.start,
      end: _0xc6f928.end,
      duration: _0xc6f928.duration
    };
  }).filter(Boolean);
}
function normalizeMediaClipExportAudioClips(_0x501217 = []) {
  if (!Array.isArray(_0x501217)) {
    return [];
  }
  return _0x501217.map(_0xed7423 => {
    if (!_0xed7423 || typeof _0xed7423 !== "object") {
      return null;
    }
    if (_0xed7423.muted === true || _0xed7423.disabled === true) {
      return null;
    }
    const _0x1ac382 = String(_0xed7423.src ?? _0xed7423.sourceKey ?? _0xed7423.localPath ?? _0xed7423.path ?? _0xed7423.abs ?? "").trim();
    if (!_0x1ac382) {
      return null;
    }
    const _0x67ee4e = readRange(_0xed7423) || readRange({
      start: _0xed7423.startSec,
      end: _0xed7423.endSec
    });
    if (!_0x67ee4e) {
      return null;
    }
    const _0x22ec8a = normalizeNonNegative(_0xed7423.timelineStart ?? _0xed7423.timelineStartSec, 0);
    const _0x1e89bc = normalizeNonNegative(_0xed7423.timelineEnd ?? _0xed7423.timelineEndSec, _0x22ec8a + _0x67ee4e.duration);
    return {
      src: _0x1ac382,
      abs: _0xed7423.abs ? String(_0xed7423.abs) : "",
      start: _0x67ee4e.start,
      end: _0x67ee4e.end,
      duration: _0x67ee4e.duration,
      timelineStart: _0x22ec8a,
      timelineEnd: Math.max(_0x22ec8a, _0x1e89bc)
    };
  }).filter(Boolean);
}
function buildMediaClipAudioMixFilterParts(_0x9a4840 = [], _0x44577d = 0, _0x41b23b = 0, _0x3a671c = {}) {
  const _0x5d519e = normalizeMediaClipExportAudioClips(_0x9a4840);
  if (!_0x5d519e.length) {
    return [];
  }
  const _0x14ba73 = String(_0x3a671c.itemPrefix || "a");
  const _0x547f96 = String(_0x3a671c.outputLabel || "a");
  const _0x184ccd = normalizeNonNegative(_0x41b23b, 0);
  const _0x3199dd = _0x5d519e.map((_0x12de6d, _0x2c21f4) => {
    const _0x1f1612 = _0x44577d + _0x2c21f4;
    const _0x3d9fa2 = Math.max(0, Math.round(_0x12de6d.timelineStart * 1000));
    return "[" + _0x1f1612 + ":a]aformat=sample_rates=44100:channel_layouts=stereo,asetpts=PTS-STARTPTS,adelay=" + _0x3d9fa2 + "|" + _0x3d9fa2 + "[" + _0x14ba73 + _0x2c21f4 + "]";
  });
  const _0x246fe2 = _0x5d519e.map((_0x499a69, _0xdb90fc) => "[" + _0x14ba73 + _0xdb90fc + "]").join("");
  const _0x11ee7c = _0x5d519e.length === 1 ? "[" + _0x14ba73 + "0]apad" : _0x246fe2 + "amix=inputs=" + _0x5d519e.length + ":duration=longest:normalize=0,apad";
  _0x3199dd.push(_0x11ee7c + ",atrim=0:" + _0x184ccd + "[" + _0x547f96 + "]");
  return _0x3199dd;
}
function buildMediaClipSourceAudioConcatFilterParts(_0x18db8c = [], _0x24b3d3 = "va") {
  const _0x3cf4f1 = normalizeMediaClipExportClips(_0x18db8c);
  const _0x9da4e7 = _0x3cf4f1.some(_0x5564f => _0x5564f.kind === "video" && _0x5564f.hasAudio === true);
  if (!_0x9da4e7) {
    return [];
  }
  const _0x56f6a2 = _0x3cf4f1.map((_0x20ce6b, _0x319b3e) => {
    const _0x2d4c60 = normalizeNonNegative(_0x20ce6b.duration, 0);
    const _0x281767 = "vsa" + _0x319b3e;
    if (_0x20ce6b.kind === "video" && _0x20ce6b.hasAudio === true) {
      return "[" + _0x319b3e + ":a]atrim=start=" + _0x20ce6b.start + ":end=" + _0x20ce6b.end + ",asetpts=PTS-STARTPTS,aformat=sample_rates=44100:channel_layouts=stereo[" + _0x281767 + "]";
    }
    return "anullsrc=channel_layout=stereo:sample_rate=44100,atrim=0:" + _0x2d4c60 + ",asetpts=PTS-STARTPTS[" + _0x281767 + "]";
  });
  const _0x1f5534 = _0x3cf4f1.map((_0x3f336f, _0x51bc96) => "[vsa" + _0x51bc96 + "]").join("");
  _0x56f6a2.push(_0x1f5534 + "concat=n=" + _0x3cf4f1.length + ":v=0:a=1[" + _0x24b3d3 + "]");
  return _0x56f6a2;
}
function buildMediaClipFinalAudioMixFilterParts(_0x28bc25 = [], _0x4af925 = 0, _0x1da057 = "a") {
  const _0x4bef06 = Array.isArray(_0x28bc25) ? _0x28bc25.map(_0x289fe7 => String(_0x289fe7 || "").trim()).filter(Boolean) : [];
  if (!_0x4bef06.length) {
    return [];
  }
  const _0x4f1e59 = normalizeNonNegative(_0x4af925, 0);
  const _0x42787a = _0x4bef06.join("");
  const _0x45e4f1 = _0x4bef06.length === 1 ? _0x4bef06[0] + "apad" : _0x42787a + "amix=inputs=" + _0x4bef06.length + ":duration=longest:normalize=0,apad";
  return [_0x45e4f1 + ",atrim=0:" + _0x4f1e59 + "[" + _0x1da057 + "]"];
}
function buildMediaClipExportConcatFfmpegArgs({
  clips = [],
  audioClips = [],
  audioAbs = "",
  audioStart = 0,
  audioEnd = 0,
  fps = 0,
  outputWidth = 0,
  outputHeight = 0,
  outAbs: _0x8cc0c7
} = {}) {
  const _0x5ba4a5 = normalizeMediaClipExportClips(clips);
  if (!_0x5ba4a5.length || !_0x8cc0c7) {
    throw new Error("Invalid video clip range");
  }
  const _0x1ceee1 = normalizeOutputSize(outputWidth);
  const _0x5293bf = normalizeOutputSize(outputHeight);
  if (!_0x1ceee1 || !_0x5293bf) {
    throw new Error("Invalid video output size");
  }
  const _0x385049 = normalizeMediaClipExportAudioClips(audioClips);
  const _0x5e7d3f = _0x385049.length > 0;
  const _0x48b999 = !_0x5e7d3f && !!audioAbs;
  const _0x4a0a7a = _0x48b999 ? readRange({
    start: audioStart,
    end: audioEnd
  }) : null;
  if (_0x48b999 && !_0x4a0a7a) {
    throw new Error("Invalid audio clip range");
  }
  const _0xcf1f18 = ["-y"];
  _0x5ba4a5.forEach(_0x5226a4 => {
    if (_0x5226a4.kind === "image") {
      _0xcf1f18.push("-loop", "1", "-t", String(_0x5226a4.duration), "-i", _0x5226a4.abs || _0x5226a4.src);
      return;
    }
    _0xcf1f18.push("-i", _0x5226a4.abs || _0x5226a4.src);
  });
  _0x385049.forEach(_0x3d8d30 => {
    _0xcf1f18.push("-ss", String(_0x3d8d30.start), "-t", String(_0x3d8d30.duration), "-i", _0x3d8d30.abs || _0x3d8d30.src);
  });
  if (_0x48b999) {
    _0xcf1f18.push("-ss", String(_0x4a0a7a.start), "-t", String(_0x4a0a7a.duration), "-i", audioAbs);
  }
  const _0x2732c3 = normalizeFilterFps(fps);
  const _0x3aef27 = _0x5ba4a5.map((_0x487541, _0x5938ef) => {
    const _0x230813 = _0x487541.kind === "image" ? "[" + _0x5938ef + ":v]" : "[" + _0x5938ef + ":v]trim=start=" + _0x487541.start + ":end=" + _0x487541.end + ",setpts=PTS-STARTPTS,";
    return _0x230813 + "scale=" + _0x1ceee1 + ":" + _0x5293bf + ":force_original_aspect_ratio=decrease,pad=" + _0x1ceee1 + ":" + _0x5293bf + ":(ow-iw)/2:(oh-ih)/2:black,setsar=1,fps=" + _0x2732c3 + ",format=yuv420p,setpts=PTS-STARTPTS[v" + _0x5938ef + "]";
  });
  _0x3aef27.push(_0x5ba4a5.map((_0x1553dd, _0x23b940) => "[v" + _0x23b940 + "]").join("") + "concat=n=" + _0x5ba4a5.length + ":v=1:a=0[v]");
  const _0x3d6c97 = _0x5ba4a5.reduce((_0x444c83, _0xbdffda) => _0x444c83 + _0xbdffda.duration, 0);
  const _0x4347ae = [];
  let _0x5b7384 = false;
  const _0x432d28 = buildMediaClipSourceAudioConcatFilterParts(_0x5ba4a5, "va");
  if (_0x432d28.length) {
    _0x3aef27.push(..._0x432d28);
    _0x4347ae.push("[va]");
  }
  if (_0x48b999) {
    if (_0x4347ae.length) {
      _0x3aef27.push("[" + _0x5ba4a5.length + ":a]aformat=sample_rates=44100:channel_layouts=stereo,asetpts=PTS-STARTPTS,apad,atrim=0:" + _0x3d6c97 + "[ea]");
      _0x4347ae.push("[ea]");
    } else {
      _0x3aef27.push("[" + _0x5ba4a5.length + ":a]aformat=sample_rates=44100:channel_layouts=stereo,asetpts=PTS-STARTPTS,apad[a]");
      _0x5b7384 = true;
    }
  } else if (_0x5e7d3f) {
    if (_0x4347ae.length) {
      _0x3aef27.push(...buildMediaClipAudioMixFilterParts(_0x385049, _0x5ba4a5.length, _0x3d6c97, {
        itemPrefix: "ta",
        outputLabel: "ta"
      }));
      _0x4347ae.push("[ta]");
    } else {
      _0x3aef27.push(...buildMediaClipAudioMixFilterParts(_0x385049, _0x5ba4a5.length, _0x3d6c97));
      _0x5b7384 = true;
    }
  }
  if (_0x4347ae.length) {
    _0x3aef27.push(...buildMediaClipFinalAudioMixFilterParts(_0x4347ae, _0x3d6c97, "a"));
    _0x5b7384 = true;
  }
  _0xcf1f18.push("-filter_complex", _0x3aef27.join(";"), "-map", "[v]");
  if (_0x5b7384) {
    _0xcf1f18.push("-map", "[a]", "-t", String(_0x3d6c97));
  }
  _0xcf1f18.push("-c:v", "libx264", "-pix_fmt", "yuv420p", "-profile:v", "high", "-preset", "fast", "-c:a", "aac", "-movflags", "+faststart", _0x8cc0c7);
  return _0xcf1f18;
}
export function buildMediaClipExportFfmpegArgs({
  videoAbs: _0x101419,
  clips = null,
  audioClips = [],
  audioAbs = "",
  videoStart = 0,
  videoEnd = 0,
  audioStart = 0,
  audioEnd = 0,
  sourceHasAudio = false,
  fps = 0,
  outputWidth = 0,
  outputHeight = 0,
  outAbs: _0x9ba1f3
} = {}) {
  if (Array.isArray(clips) && clips.length) {
    return buildMediaClipExportConcatFfmpegArgs({
      clips: clips,
      audioClips: audioClips,
      audioAbs: audioAbs,
      audioStart: audioStart,
      audioEnd: audioEnd,
      fps: fps,
      outputWidth: outputWidth,
      outputHeight: outputHeight,
      outAbs: _0x9ba1f3
    });
  }
  const _0x3a456a = readRange({
    start: videoStart,
    end: videoEnd
  });
  if (!_0x101419 || !_0x9ba1f3 || !_0x3a456a) {
    throw new Error("Invalid video clip range");
  }
  const _0x5aba83 = normalizeMediaClipExportAudioClips(audioClips);
  const _0xd75015 = _0x5aba83.length > 0;
  const _0x1fbcbc = !_0xd75015 && !!audioAbs;
  const _0x346570 = _0x1fbcbc ? readRange({
    start: audioStart,
    end: audioEnd
  }) : null;
  if (_0x1fbcbc && !_0x346570) {
    throw new Error("Invalid audio clip range");
  }
  const _0x1a8446 = ["-y", "-ss", String(_0x3a456a.start), "-t", String(_0x3a456a.duration), "-i", _0x101419];
  _0x5aba83.forEach(_0x5918f7 => {
    _0x1a8446.push("-ss", String(_0x5918f7.start), "-t", String(_0x5918f7.duration), "-i", _0x5918f7.abs || _0x5918f7.src);
  });
  if (_0xd75015) {
    const _0x234ca1 = [];
    if (sourceHasAudio === true) {
      const _0x4af359 = [];
      _0x234ca1.push("[0:a]aformat=sample_rates=44100:channel_layouts=stereo,atrim=0:" + _0x3a456a.duration + ",asetpts=PTS-STARTPTS[va]");
      _0x4af359.push("[va]");
      _0x234ca1.push(...buildMediaClipAudioMixFilterParts(_0x5aba83, 1, _0x3a456a.duration, {
        itemPrefix: "ta",
        outputLabel: "ta"
      }));
      _0x4af359.push("[ta]");
      _0x234ca1.push(...buildMediaClipFinalAudioMixFilterParts(_0x4af359, _0x3a456a.duration, "a"));
    } else {
      _0x234ca1.push(...buildMediaClipAudioMixFilterParts(_0x5aba83, 1, _0x3a456a.duration));
    }
    _0x1a8446.push("-filter_complex", _0x234ca1.join(";"), "-map", "0:v:0", "-map", "[a]", "-t", String(_0x3a456a.duration));
  } else if (_0x1fbcbc) {
    _0x1a8446.push("-ss", String(_0x346570.start), "-t", String(_0x346570.duration), "-i", audioAbs);
    const _0x34f091 = [];
    if (sourceHasAudio === true) {
      const _0xb4d773 = [];
      _0x34f091.push("[0:a]aformat=sample_rates=44100:channel_layouts=stereo,atrim=0:" + _0x3a456a.duration + ",asetpts=PTS-STARTPTS[va]");
      _0xb4d773.push("[va]");
      _0x34f091.push("[1:a]aformat=sample_rates=44100:channel_layouts=stereo,asetpts=PTS-STARTPTS,apad,atrim=0:" + _0x3a456a.duration + "[ea]");
      _0xb4d773.push("[ea]");
      _0x34f091.push(...buildMediaClipFinalAudioMixFilterParts(_0xb4d773, _0x3a456a.duration, "a"));
    } else {
      _0x34f091.push("[1:a]aformat=sample_rates=44100:channel_layouts=stereo,asetpts=PTS-STARTPTS,apad[a]");
    }
    _0x1a8446.push("-filter_complex", _0x34f091.join(";"), "-map", "0:v:0", "-map", "[a]", "-t", String(_0x3a456a.duration));
  } else {
    _0x1a8446.push("-map", "0:v:0", "-map", "0:a?");
  }
  _0x1a8446.push("-c:v", "libx264", "-pix_fmt", "yuv420p", "-profile:v", "high", "-preset", "fast", "-c:a", "aac");
  const _0x14419c = normalizeRequestedFps(fps);
  if (_0x14419c) {
    _0x1a8446.push("-vf", "fps=" + _0x14419c, "-r", String(_0x14419c));
  }
  _0x1a8446.push("-movflags", "+faststart", _0x9ba1f3);
  return _0x1a8446;
}
export function createMediaClipExportTaskHandler({
  createOutputFilename: _0x376ea7,
  ffprobeHasAudio: _0x69366c,
  ffprobeVideoMeta: _0x4ab7c1,
  getOutputDir: _0x38b5af,
  getRuntimeToolOrFallback: _0x5cdf63,
  runFfmpegTask: _0x2346d0,
  resolveMediaTaskSource: _0x5a181a,
  toOutputLocalPath: _0x20201c
}) {
  return async (_0x2d582d, _0xd37e68) => {
    const _0x9b3619 = _0x2d582d.payload || {};
    const _0x3a0a83 = _0x9b3619.args || {};
    const _0x477387 = normalizeMediaClipExportClips(_0x3a0a83.clips || _0x9b3619.clips);
    const _0xd2eed1 = normalizeMediaClipExportAudioClips(_0x3a0a83.audioClips || _0x9b3619.audioClips);
    const _0x124ca6 = _0xd2eed1.length ? "" : String(_0x3a0a83.audioSrc ?? _0x9b3619.audioSrc ?? "").trim();
    const _0x274cd1 = _0x124ca6 ? _0x5a181a(_0x124ca6) : "";
    const _0x48c9ec = _0x274cd1 ? readRange(_0x9b3619, _0x3a0a83, "audio") : null;
    if (_0x274cd1 && !_0x48c9ec) {
      throw new Error("Invalid audio clip range");
    }
    async function _0x2490b1(_0x184f08, _0x283d89 = null) {
      if (!_0x184f08 || _0x283d89?.kind === "image" || typeof _0x69366c !== "function") {
        return false;
      }
      return _0x69366c(_0xd37e68, _0x2d582d, _0x184f08);
    }
    let _0x2787d1 = "";
    let _0x45fe01 = null;
    let _0x5d8623 = [];
    let _0x354ff7 = false;
    if (_0x477387.length) {
      _0x5d8623 = await Promise.all(_0x477387.map(async _0x22b60c => {
        const _0x47656b = _0x5a181a(_0x22b60c.src);
        return {
          ..._0x22b60c,
          abs: _0x47656b,
          hasAudio: await _0x2490b1(_0x47656b, _0x22b60c)
        };
      }));
    } else {
      _0x2787d1 = _0x5a181a(_0x9b3619.src || _0x9b3619.videoSrc);
      _0x45fe01 = readRange(_0x9b3619, _0x3a0a83, "video");
      if (!_0x45fe01) {
        throw new Error("Invalid video clip range");
      }
      _0x354ff7 = await _0x2490b1(_0x2787d1);
    }
    const _0xc0da48 = _0xd2eed1.map(_0x512f8f => ({
      ..._0x512f8f,
      abs: _0x5a181a(_0x512f8f.src)
    }));
    const _0x17c32a = _0x5d8623.find(_0xf18dc => _0xf18dc.kind === "video")?.abs || _0x5d8623[0]?.abs || _0x2787d1;
    const _0x32ba81 = await _0x4ab7c1(_0xd37e68, _0x2d582d, _0x17c32a);
    if (!_0x32ba81.width || !_0x32ba81.height) {
      throw new Error("Source video has no video stream");
    }
    const _0x5810eb = a258_0x227271.join(_0x38b5af(), "ClipVideo");
    mkdirSync(_0x5810eb, {
      recursive: true
    });
    const _0x1c4115 = _0x376ea7("clip", "mp4");
    const _0x204529 = a258_0x227271.join(_0x5810eb, _0x1c4115);
    const _0x13faa8 = _0x20201c("ClipVideo", _0x1c4115);
    const _0x3a8ecd = normalizeRequestedFps(_0x3a0a83.fps ?? _0x9b3619.fps);
    const _0x228d01 = buildMediaClipExportFfmpegArgs({
      videoAbs: _0x2787d1,
      clips: _0x5d8623,
      audioClips: _0xc0da48,
      audioAbs: _0x274cd1,
      videoStart: _0x45fe01?.start || 0,
      videoEnd: _0x45fe01?.end || 0,
      audioStart: _0x48c9ec?.start || 0,
      audioEnd: _0x48c9ec?.end || 0,
      sourceHasAudio: _0x354ff7,
      fps: _0x5d8623.length ? _0x3a8ecd || _0x32ba81.fps || 30 : _0x3a8ecd,
      outputWidth: _0x32ba81.width,
      outputHeight: _0x32ba81.height,
      outAbs: _0x204529
    });
    const _0x1b56d7 = _0x5d8623.length ? _0x5d8623.reduce((_0x28fc27, _0x432763) => _0x28fc27 + _0x432763.duration, 0) : _0x45fe01.duration;
    const _0x582306 = typeof _0x2346d0 === "function" ? _0x2346d0 : (_0x1494fd, _0x16e93b, _0x1f8520, _0x3bc33d) => _0x16e93b.runProcess(_0x1494fd, _0x5cdf63("ffmpeg"), _0x1f8520, _0x3bc33d);
    await _0x582306(_0x2d582d, _0xd37e68, _0x228d01, {
      durationSec: _0x1b56d7,
      progressMessage: "Exporting clip"
    });
    return {
      success: true,
      filename: _0x1c4115,
      path: _0x13faa8,
      localPath: _0x13faa8,
      url: "/" + _0x13faa8,
      videoDuration: _0x1b56d7,
      fps: _0x3a8ecd || _0x32ba81.fps || 0,
      videoWidth: _0x32ba81.width,
      videoHeight: _0x32ba81.height
    };
  };
}