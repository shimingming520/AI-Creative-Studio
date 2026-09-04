import { describe, expect, it } from "vitest";
import {
  buildMuxArgs,
  muxInputIssue,
  recommendOutputName,
} from "../../src/shared/pipeline";

describe("pipeline / buildMuxArgs", () => {
  it("builds video×audio mux args with apad + copy + aac + -t video length", () => {
    const args = buildMuxArgs({
      videoPath: "C:\\out\\video.mp4",
      audioPath: "C:\\out\\voice.wav",
      outputPath: "C:\\out\\成片.mp4",
      videoDurationSec: 3,
    });
    expect(args).toContain("-y");
    expect(args).toContain("C:\\out\\video.mp4");
    expect(args).toContain("C:\\out\\voice.wav");
    expect(args).toContain("[1:a]apad[aout]");
    expect(args).toContain("-c:v");
    expect(args).toContain("copy");
    expect(args).toContain("-c:a");
    expect(args).toContain("aac");
    expect(args).toContain("-t");
    expect(args).toContain("3");
    expect(args).not.toContain("-shortest");
  });

  it("honors syncToVideo=false to keep the original audio length", () => {
    const args = buildMuxArgs({
      videoPath: "v.mp4",
      audioPath: "a.wav",
      outputPath: "o.mp4",
      syncToVideo: false,
    });
    expect(args).not.toContain("[1:a]apad[aout]");
    expect(args).toContain("-map");
  });

  it("requires videoDurationSec in syncToVideo mode", () => {
    expect(() =>
      buildMuxArgs({ videoPath: "v.mp4", audioPath: "a.wav", outputPath: "o.mp4" }),
    ).toThrow(/videoDurationSec/);
  });

  it("throws when a required path is missing", () => {
    expect(() =>
      buildMuxArgs({ videoPath: "", audioPath: "a.wav", outputPath: "o.mp4", videoDurationSec: 3 }),
    ).toThrow(/videoPath/);
  });
});

describe("pipeline / muxInputIssue", () => {
  it("flags missing paths", () => {
    expect(muxInputIssue({ videoPath: "", audioPath: "a.wav" })).toMatch(/视频/);
  });
  it("flags identical video and audio", () => {
    expect(muxInputIssue({ videoPath: "x.mp4", audioPath: "x.mp4" })).toMatch(/同一个/);
  });
  it("returns null for valid input", () => {
    expect(muxInputIssue({ videoPath: "v.mp4", audioPath: "a.wav" })).toBeNull();
  });
});

describe("pipeline / recommendOutputName", () => {
  it("produces a timestamped mp4 name", () => {
    const name = recommendOutputName("成片");
    expect(name).toMatch(/^成片-\d{8}-\d{6}\.mp4$/);
  });
});
