import { describe, expect, it } from "vitest";
import {
  buildTimeline,
  buildTranslationSystemPrompt,
  buildTranslationUserPrompt,
  dubPlan,
  estimateSpeechDurationMs,
  formatMs,
  parseSrtToSegments,
  parseTranslationResult,
  parseVttToSegments,
  segmentsFromWhisper,
  splitTextToSegments,
  type VoiceSegment,
} from "../../src/shared/voice-studio";

function makeSegments(): VoiceSegment[] {
  return [
    {
      id: "seg-1",
      index: 0,
      startMs: 0,
      endMs: 2000,
      text: "你的桌面是不是也这样?",
      translatedText: "",
      voiceMode: "clone",
      refAudioPath: null,
      designText: "",
      dubStatus: "idle",
      dubError: null,
      audioPath: null,
    },
    {
      id: "seg-2",
      index: 1,
      startMs: 2500,
      endMs: 5000,
      text: "五分钟整理完就好了。",
      translatedText: "",
      voiceMode: "none",
      refAudioPath: null,
      designText: "",
      dubStatus: "idle",
      dubError: null,
      audioPath: null,
    },
  ];
}

describe("voice-studio / segmentsFromWhisper", () => {
  it("parses whisper segments and converts seconds to ms", () => {
    const segments = segmentsFromWhisper({
      segments: [
        { start: 0, end: 2.5, text: "你好" },
        { start: 2.5, end: 5, text: " 世界 " },
      ],
    });
    expect(segments).toHaveLength(2);
    expect(segments[0]).toMatchObject({ startMs: 0, endMs: 2500, text: "你好" });
    expect(segments[0]?.id).toBe("seg-1");
    expect(segments[1]?.index).toBe(1);
    expect(segments[1]?.text).toBe("世界");
  });

  it("accepts a raw array and drops empty/invalid segments", () => {
    const segments = segmentsFromWhisper([
      { start: 0, end: 1, text: "  " },
      { start: 0, end: 1, text: "有效" },
      { start: NaN, end: 2, text: "bad" },
      { text: "no-time" },
    ]);
    expect(segments).toHaveLength(1);
    expect(segments[0]?.text).toBe("有效");
  });

  it("returns [] for garbage", () => {
    expect(segmentsFromWhisper(null)).toEqual([]);
    expect(segmentsFromWhisper("text")).toEqual([]);
  });
});

describe("voice-studio / subtitle fallbacks", () => {
  const srt = [
    "1",
    "00:00:01,500 --> 00:00:04,000",
    "第一句台词",
    "",
    "2",
    "00:00:05,000 --> 00:00:07,500",
    "第二句台词",
  ].join("\n");
  it("parses SRT", () => {
    const segments = parseSrtToSegments(srt);
    expect(segments).toHaveLength(2);
    expect(segments[0]).toMatchObject({ startMs: 1500, endMs: 4000, text: "第一句台词" });
  });

  it("parses VTT", () => {
    const vtt = [
      "WEBVTT",
      "",
      "00:00:01.500 --> 00:00:04.000",
      "第一句",
      "",
      "00:00:05.000 --> 00:00:07.500",
      "第二句",
    ].join("\n");
    const segments = parseVttToSegments(vtt);
    expect(segments).toHaveLength(2);
    expect(segments[0]?.startMs).toBe(1500);
  });

  it("splitTextToSegments distributes the duration by char weight", () => {
    const segments = splitTextToSegments("第一句。第二句很长很长很长很长!", 6000);
    expect(segments).toHaveLength(2);
    const total = segments.reduce((sum, s) => sum + (s.endMs - s.startMs), 0);
    expect(total).toBeCloseTo(6000, -1);
    expect(segments[0]?.text).toBe("第一句。");
  });

  it("splitTextToSegments returns [] for empty text", () => {
    expect(splitTextToSegments("  ", 1000)).toEqual([]);
  });
});

describe("voice-studio / formatMs", () => {
  it("formats milliseconds as mm:ss.t", () => {
    expect(formatMs(0)).toBe("00:00.0");
    expect(formatMs(125000)).toBe("02:05.0");
    expect(formatMs(65200)).toBe("01:05.2");
  });
});

describe("voice-studio / translation", () => {
  it("builds prompts that carry all segments and JSON-only output", () => {
    const system = buildTranslationSystemPrompt();
    const user = buildTranslationUserPrompt(makeSegments(), "英文");
    expect(system).toContain("只输出 JSON");
    expect(user).toContain("目标语言:英文");
    expect(user).toContain("seg-1");
    expect(user).toContain("你的桌面是不是也这样?");
  });

  it("parses translation JSON with fenced markdown", () => {
    const raw = [
      "翻译如下:",
      "```json",
      '{"translations":[{"id":"seg-1","text":"Is your desk like this too?"}]}',
      "```",
    ].join("\n");
    const byId = parseTranslationResult(raw);
    expect(byId?.["seg-1"]).toBe("Is your desk like this too?");
  });

  it("parses flat arrays and returns null for garbage", () => {
    const flat = parseTranslationResult('[{"id":"seg-2","text":"ok"}]');
    expect(flat?.["seg-2"]).toBe("ok");
    expect(parseTranslationResult("没有翻译")).toBeNull();
    expect(parseTranslationResult("")).toBeNull();
  });
});

describe("voice-studio / dub plan & timeline", () => {
  it("dubPlan returns only segments needing dubbing", () => {
    const segments = makeSegments();
    segments[0]!.audioPath = "C:\\out\\seg-1.wav";
    const plan = dubPlan(segments);
    expect(plan).toHaveLength(1);
    expect(plan[0]?.id).toBe("seg-1");
  });

  it("estimateSpeechDurationMs scales with text length", () => {
    expect(estimateSpeechDurationMs("你好")).toBe(500);
    expect(estimateSpeechDurationMs("")).toBe(300);
  });

  it("buildTimeline lays a base track with dubs overlaid at their offsets", () => {
    const segments = makeSegments();
    segments[0]!.voiceMode = "clone";
    segments[0]!.audioPath = "a.wav";
    segments[1]!.voiceMode = "design";
    segments[1]!.audioPath = "b.wav";
    const slots = buildTimeline(segments, {
      mixMode: "keep-original",
      gapMs: 0,
      totalMs: 6000,
    });
    // 基础轨 = 原音频全长,配音段按 startMs 覆盖。
    expect(slots[0]).toMatchObject({ offsetMs: 0, kind: "original", durationMs: 6000 });
    expect(slots[1]).toMatchObject({ offsetMs: 0, kind: "dub", durationMs: 2000 });
    expect(slots[2]).toMatchObject({ offsetMs: 2500, kind: "dub", durationMs: 2500 });
  });

  it("buildTimeline dub-all uses silence base padded with gap", () => {
    const segments = makeSegments();
    segments[0]!.voiceMode = "clone";
    segments[0]!.audioPath = "a.wav";
    segments[1]!.voiceMode = "clone";
    segments[1]!.audioPath = "b.wav";
    const slots = buildTimeline(segments, {
      mixMode: "dub-all",
      gapMs: 100,
      totalMs: 6000,
    });
    expect(slots[0]).toMatchObject({ offsetMs: 0, kind: "silence", durationMs: 5100 });
    expect(slots[1]).toMatchObject({ offsetMs: 0, kind: "dub", durationMs: 2000 });
    expect(slots[2]).toMatchObject({ offsetMs: 2500, kind: "dub", durationMs: 2500 });
  });

  it("buildTimeline returns [] when nothing is dubbed", () => {
    expect(buildTimeline(makeSegments(), { mixMode: "dub-all", gapMs: 0, totalMs: 5000 })).toEqual([]);
  });
});
