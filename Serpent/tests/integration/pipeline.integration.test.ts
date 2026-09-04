import { afterAll, describe, expect, it } from "vitest";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { buildMuxArgs } from "../../src/shared/pipeline";

/**
 * 成片流水线酸检:真实 ffmpeg 生成测试视频 + 测试音频,
 * 再按 buildMuxArgs 的规格 mux 成最终 mp4(有音频→补齐/替换→视频长)。
 * 需要 ffmpeg 在 PATH 上(Windows 环境已在 PATH)。
 */

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "pp-smoke-"));
const video = path.join(tmp, "src.mp4");
const audio = path.join(tmp, "voice.wav");
const out = path.join(tmp, "成片.mp4");
const ffmpeg = "ffmpeg"; // PATH 上的可执行文件

function run(args: string[]) {
  execFileSync(ffmpeg, args, { stdio: "ignore" });
}

afterAll(() => {
  try {
    fs.rmSync(tmp, { recursive: true, force: true });
  } catch {
    // 忽略清理错误
  }
});

describe("pipeline integration (real ffmpeg mux)", () => {
  it("muxes a 3s video and a 2s audio into a final mp4", () => {
    run([
      "-y",
      "-f",
      "lavfi",
      "-t",
      "3",
      "-i",
      "testsrc=size=320x240:rate=24",
      "-c:v",
      "libx264",
      "-pix_fmt",
      "yuv420p",
      video,
    ]);
    run([
      "-y",
      "-f",
      "lavfi",
      "-t",
      "2",
      "-i",
      "sine=frequency=440:sample_rate=44100",
      "-c:a",
      "pcm_s16le",
      audio,
    ]);
    expect(fs.existsSync(video)).toBe(true);
    expect(fs.existsSync(audio)).toBe(true);

    run(
      buildMuxArgs({
        videoPath: video,
        audioPath: audio,
        outputPath: out,
        videoDurationSec: 3,
      }),
    );

    expect(fs.existsSync(out)).toBe(true);
    expect(fs.statSync(out).size).toBeGreaterThan(0);
    expect(out).toMatch(/成片\.mp4$/);
  });
});
