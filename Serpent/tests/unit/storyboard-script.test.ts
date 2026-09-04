import { describe, expect, it } from "vitest";
import {
  buildCharacterContextLine,
  buildShotImagePrompt,
  buildStoryboardSystemPrompt,
  buildStoryboardUserPrompt,
  finalizeGenerationPrompt,
  normalizeCharacterAssets,
  parseStoryScript,
  scriptToPlainText,
  splitStoryText,
  STORYBOARD_DEFAULT_SHOT_SEC,
  STORYBOARD_SHOT_MAX_SEC,
  type StoryboardScript,
} from "../../src/shared/storyboard-script";

describe("storyboard-script / parseStoryScript", () => {
  it("parses a plain JSON object with shots", () => {
    const raw = JSON.stringify({
      title: "整理书桌",
      summary: "从凌乱到治愈",
      style: "清新生活方式",
      aspectRatio: "9:16",
      shots: [
        {
          size: "extreme-close",
          cameraMove: "static",
          description: "凌乱书桌特写,阳光洒在散落的文具上",
          dialogue: "你的桌面是不是也这样?",
          durationSec: 3,
        },
        {
          sceneLabel: "场景2",
          size: "full",
          cameraMove: "orbit-slow",
          description: "人物坐下开始学习,表情放松",
          sfx: "轻微的咖啡杯碰撞声",
          durationSec: 12,
        },
      ],
    });
    const { script, error } = parseStoryScript(raw);
    expect(error).toBeUndefined();
    expect(script).not.toBeNull();
    expect(script!.shots).toHaveLength(2);
    expect(script!.title).toBe("整理书桌");
    expect(script!.shots[0]?.id).toBe("shot-1");
    expect(script!.shots[0]?.prompt).toContain("【特写】");
    expect(script!.shots[0]?.prompt).toContain("台词:「");
    expect(script!.shots[1]?.prompt).toContain("【环绕慢摇】");
    expect(script!.shots[1]?.prompt).toContain("音效:");
  });

  it("parses fenced JSON with surrounding prose", () => {
    const raw = [
      "分镜脚本如下:",
      "```json",
      `{"shots":[{"size":"close","cameraMove":"handheld","description":"人物皱眉看着桌面","durationSec":4}]}`,
      "```",
      "共1镜。",
    ].join("\n");
    const { script } = parseStoryScript(raw);
    expect(script?.shots).toHaveLength(1);
  });

  it("falls back to the first { ... last } slice", () => {
    const raw = `说明文字 {"shots":[{"size":"wide","cameraMove":"static","description":"清空桌面","durationSec":5}]} 结束`;
    const { script } = parseStoryScript(raw);
    expect(script?.shots).toHaveLength(1);
  });

  it("clamps durations and applies defaults", () => {
    const raw = JSON.stringify({
      shots: [
        { size: "wide", cameraMove: "static", description: "a", durationSec: 99 },
        { size: "wide", cameraMove: "static", description: "b", durationSec: 0 },
        { size: "wide", cameraMove: "static", description: "c" },
      ],
    });
    const { script } = parseStoryScript(raw);
    expect(script?.shots[0]?.durationSec).toBe(STORYBOARD_SHOT_MAX_SEC);
    expect(script?.shots[1]?.durationSec).toBe(1);
    expect(script?.shots[2]?.durationSec).toBe(STORYBOARD_DEFAULT_SHOT_SEC);
  });

  it("falls back unknown size/cameraMove to medium/static", () => {
    const raw = JSON.stringify({
      shots: [{ size: "giga-zoom", cameraMove: "warp", description: "x", durationSec: 5 }],
    });
    const { script } = parseStoryScript(raw);
    expect(script?.shots[0]?.size).toBe("medium");
    expect(script?.shots[0]?.cameraMove).toBe("static");
  });

  it("drops shots without description and rejects empty shot lists", () => {
    const raw = JSON.stringify({ shots: [{ size: "wide", durationSec: 5 }, {}] });
    const { script, error } = parseStoryScript(raw);
    expect(script).toBeNull();
    expect(error).toContain("shots");
  });

  it("returns an error for garbage", () => {
    const { script, error } = parseStoryScript("没有分镜");
    expect(script).toBeNull();
    expect(error).toContain("解析");
  });
});

describe("storyboard-script / prompt builders", () => {
  it("system prompt mentions duration cap and JSON-only output", () => {
    const prompt = buildStoryboardSystemPrompt();
    expect(prompt).toContain(`${STORYBOARD_SHOT_MAX_SEC} 秒`);
    expect(prompt).toContain("只输出一个 JSON 对象");
  });

  it("user prompt carries story, style and shot count", () => {
    const prompt = buildStoryboardUserPrompt({
      story: "小明第一次下厨。",
      style: "清新生活方式",
      shotCount: 8,
      aspectRatio: "9:16",
    });
    expect(prompt).toContain("小明第一次下厨。");
    expect(prompt).toContain("清新生活方式");
    expect(prompt).toContain("9:16");
    expect(prompt).toContain("8");
  });
});

describe("storyboard-script / scriptToPlainText", () => {
  it("renders a readable shot table", () => {
    const script: StoryboardScript = {
      title: "测试",
      shots: [
        {
          id: "shot-1",
          index: 0,
          size: "close",
          cameraMove: "push-slow",
          description: "门口",
          dialogue: "你好",
          sfx: "门铃",
          durationSec: 4,
          prompt: "【近景】【慢速推轨】门口 台词:「你好」",
        },
      ],
    };
    const text = scriptToPlainText(script);
    expect(text).toContain("# 测试");
    expect(text).toContain("1. 【近景】");
    expect(text).toContain("台词:「你好」");
    expect(text).toContain("提示词:");
  });
});

describe("storyboard-script / splitStoryText", () => {
  it("keeps short text whole", () => {
    expect(splitStoryText("短文案", 100)).toEqual(["短文案"]);
  });

  it("splits on sentence boundaries within maxChars", () => {
    const text = "第一句。第二句!第三句?".repeat(20);
    const chunks = splitStoryText(text, 200);
    expect(chunks.length).toBeGreaterThan(1);
    expect(chunks.every((chunk) => chunk.length <= 200)).toBe(true);
    expect(chunks.join("")).toBe(text);
  });

  it("returns [] for empty input", () => {
    expect(splitStoryText("  ")).toEqual([]);
  });
});

describe("storyboard-script / character assets", () => {
  it("normalizes characters and drops empty entries", () => {
    const normalized = normalizeCharacterAssets([
      { id: "c1", name: "小明", description: "年轻男性,白T恤", referencePath: "a.png" },
      { id: "c2", name: "  ", description: "  " },
      { description: "只有描述" },
      "not-an-object",
    ]);
    expect(normalized).toHaveLength(2);
    expect(normalized[0]).toMatchObject({ name: "小明", referencePath: "a.png" });
    expect(normalized[1]?.name).toBe("");
    expect(normalized[1]?.id).toBeTruthy();
  });

  it("ignores non-array input", () => {
    expect(normalizeCharacterAssets(null)).toEqual([]);
    expect(normalizeCharacterAssets({})).toEqual([]);
  });

  it("builds a context line from characters", () => {
    const line = buildCharacterContextLine([
      { id: "a", name: "小明", description: "年轻男性,白T恤" },
      { id: "b", name: "师傅", description: "灰发老者,西装" },
    ]);
    expect(line).toBe("小明（年轻男性,白T恤）；师傅（灰发老者,西装）");
  });

  it("finalizeGenerationPrompt appends role context once", () => {
    const characters = [
      { id: "a", name: "小明", description: "年轻男性" },
    ];
    expect(finalizeGenerationPrompt("画面A", characters)).toBe(
      "画面A 角色:小明（年轻男性）",
    );
    // 已含角色标记时不重复追加。
    expect(finalizeGenerationPrompt("画面A 角色:自定义", characters)).toBe(
      "画面A 角色:自定义",
    );
    expect(finalizeGenerationPrompt("画面A", [])).toBe("画面A");
  });

  it("buildShotImagePrompt includes shot size/motion and role context", () => {
    const shot = {
      id: "shot-1",
      index: 0,
      size: "close" as const,
      cameraMove: "static" as const,
      description: "书桌特写",
      durationSec: 4,
      prompt: "",
    };
    const prompt = buildShotImagePrompt(shot, [
      { id: "a", name: "小明", description: "年轻男性" },
    ]);
    expect(prompt).toContain("【近景】");
    expect(prompt).toContain("书桌特写");
    expect(prompt).toContain("角色:小明（年轻男性）");
  });
});
