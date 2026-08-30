import { mkdirSync } from "node:fs";
import a261_0x37ac2d from "node:path";
export function buildVideoReverseFfmpegArgs({
  sourceAbs: _0x18482f,
  outAbs: _0x23e35c,
  hasAudio = false
} = {}) {
  if (!_0x18482f || !_0x23e35c) {
    throw new Error("Invalid video reverse source");
  }
  const _0x86e48b = ["[0:v]reverse,setpts=PTS-STARTPTS,format=yuv420p[v]"];
  if (hasAudio) {
    _0x86e48b.push("[0:a]areverse,asetpts=PTS-STARTPTS[a]");
  }
  const _0x53595d = ["-y", "-i", _0x18482f, "-filter_complex", _0x86e48b.join(";"), "-map", "[v]"];
  if (hasAudio) {
    _0x53595d.push("-map", "[a]");
  } else {
    _0x53595d.push("-an");
  }
  _0x53595d.push("-c:v", "libx264", "-pix_fmt", "yuv420p", "-profile:v", "high", "-preset", "fast");
  if (hasAudio) {
    _0x53595d.push("-c:a", "aac");
  }
  _0x53595d.push("-movflags", "+faststart", _0x23e35c);
  return _0x53595d;
}
export function createVideoReverseMediaTaskHandler({
  createOutputFilename: _0x38fade,
  ffprobeHasAudio: _0x3aaaeb,
  ffprobeVideoMeta: _0x451cd3,
  getOutputDir: _0x53584,
  getRuntimeToolOrFallback: _0x40d658,
  runFfmpegTask: _0x35c5c0,
  resolveMediaTaskSource: _0x1ebc53,
  toOutputLocalPath: _0x2ee807
}) {
  return async (_0x4fdf9d, _0x113745) => {
    const _0x467b59 = _0x1ebc53(_0x4fdf9d.payload.src);
    const _0x16de3c = await _0x451cd3(_0x113745, _0x4fdf9d, _0x467b59);
    if (!_0x16de3c.width || !_0x16de3c.height) {
      throw new Error("Source video has no video stream");
    }
    const _0x20a329 = await _0x3aaaeb(_0x113745, _0x4fdf9d, _0x467b59);
    const _0x342c8c = a261_0x37ac2d.join(_0x53584(), "ReverseVideo");
    mkdirSync(_0x342c8c, {
      recursive: true
    });
    const _0x306050 = _0x38fade("reverse", "mp4");
    const _0x4a4c85 = a261_0x37ac2d.join(_0x342c8c, _0x306050);
    const _0x56acdd = _0x2ee807("ReverseVideo", _0x306050);
    const _0x57ff68 = buildVideoReverseFfmpegArgs({
      sourceAbs: _0x467b59,
      outAbs: _0x4a4c85,
      hasAudio: _0x20a329
    });
    const _0x24fb73 = typeof _0x35c5c0 === "function" ? _0x35c5c0 : (_0x3fd29b, _0x481c8a, _0x355036, _0x4e29b9) => _0x481c8a.runProcess(_0x3fd29b, _0x40d658("ffmpeg"), _0x355036, _0x4e29b9);
    await _0x24fb73(_0x4fdf9d, _0x113745, _0x57ff68, {
      durationSec: _0x16de3c.duration || 0,
      progressMessage: "Reversing video"
    });
    return {
      success: true,
      filename: _0x306050,
      path: _0x56acdd,
      localPath: _0x56acdd,
      url: "/" + _0x56acdd,
      videoDuration: _0x16de3c.duration || 0,
      fps: _0x16de3c.fps || 0,
      videoWidth: _0x16de3c.width,
      videoHeight: _0x16de3c.height
    };
  };
}