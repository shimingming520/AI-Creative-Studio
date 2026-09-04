import { describe, expect, it } from "vitest";
import {
  buildReplacementProject,
  findProjectByTitle,
  syncCharactersIntoProject,
  type StoryboardSyncSnapshot,
} from "../../src/shared/storyboard-replacement";
import { createRsProject } from "../../src/shared/replacement-studio";
import type { StoryCharacter } from "../../src/shared/storyboard-script";

function makeSnapshot(overrides: Partial<StoryboardSyncSnapshot> = {}): StoryboardSyncSnapshot {
  const characters: StoryCharacter[] = [
    { id: "c1", name: "小明", description: "年轻男性,白T恤", referencePath: "C:\\ref\\ming.png" },
    { id: "c2", name: "师傅", description: "灰发老者,西装" },
  ];
  const shots = [
    {
      shot: {
        id: "shot-1",
        index: 0,
        sceneLabel: "书房",
        size: "close" as const,
        cameraMove: "static" as const,
        description: "书桌特写",
        dialogue: "你的桌面是不是也这样?",
        durationSec: 4,
        prompt: "【近景】书桌特写 台词:「你的桌面是不是也这样?」",
      },
      imageResults: [{ path: "C:\\out\\frame-1.png", url: "file:///frame-1" }],
      videoResults: [],
    },
    {
      shot: {
        id: "shot-2",
        index: 1,
        sceneLabel: "书房",
        size: "full" as const,
        cameraMove: "orbit-slow" as const,
        description: "人物坐下学习",
        durationSec: 12,
        prompt: "【全景】【环绕慢摇】人物坐下学习",
      },
      imageResults: [],
      videoResults: [{ path: "C:\\out\\clip-2.mp4", url: "file:///clip-2" }],
    },
  ];
  return {
    title: "整理书桌",
    aspectRatio: "9:16",
    characters,
    shots,
    providerId: "prov-1",
    imageModel: "img-model",
    videoModel: "vid-model",
    imageSize: "720x1280",
    videoResolution: "720p",
    ...overrides,
  };
}

describe("storyboard-replacement / buildReplacementProject", () => {
  it("maps characters to target characters with appearances", () => {
    const project = buildReplacementProject(makeSnapshot());
    expect(project.characters).toHaveLength(2);
    const ming = project.characters.find((c) => c.name === "小明");
    expect(ming).toBeDefined();
    expect(ming!.appearances[0]?.imagePath).toBe("C:\\ref\\ming.png");
    expect(ming!.appearances[0]?.prompt).toBe("年轻男性,白T恤");
    // 无参考图的角色不生成形象。
    const master = project.characters.find((c) => c.name === "师傅");
    expect(master!.appearances).toHaveLength(0);
  });

  it("maps shots with prompts, voice text and generated results", () => {
    const project = buildReplacementProject(makeSnapshot());
    expect(project.shots).toHaveLength(2);
    const first = project.shots[0]!;
    expect(first.label).toContain("第1镜");
    expect(first.id).toBe("sb-shot-1");
    expect(first.sourceId).toBeNull();
    expect(first.durationSec).toBe(4);
    expect(first.voiceText).toBe("你的桌面是不是也这样?");
    expect(first.imagePrompt).toContain("书桌特写");
    expect(first.imagePrompt).toContain("角色:小明（年轻男性,白T恤）");
    expect(first.imageResults).toHaveLength(1);
    expect(first.imageResults[0]?.outputPath).toBe("C:\\out\\frame-1.png");
    expect(first.keyframePath).toBe("C:\\out\\frame-1.png");
    const second = project.shots[1]!;
    expect(second.videoResults).toHaveLength(1);
    expect(second.videoResults[0]?.kind).toBe("video");
    expect(second.videoPath).toBe("C:\\out\\clip-2.mp4");
  });

  it("groups scenes by sceneLabel", () => {
    const project = buildReplacementProject(makeSnapshot());
    expect(project.scenes).toHaveLength(1);
    expect(project.scenes[0]?.name).toBe("书房");
  });

  it("carries generation settings", () => {
    const project = buildReplacementProject(makeSnapshot());
    expect(project.settings.providerId).toBe("prov-1");
    expect(project.settings.imageModel).toBe("img-model");
    expect(project.settings.videoModel).toBe("vid-model");
    expect(project.settings.imageSize).toBe("720x1280");
    expect(project.settings.videoRatio).toBe("9:16");
    expect(project.settings.videoDuration).toBe(4);
  });

  it("uses a date-based fallback title", () => {
    const project = buildReplacementProject(makeSnapshot({ title: "" }));
    expect(project.title).toMatch(/^剧本项目-/);
  });
});

describe("storyboard-replacement / findProjectByTitle", () => {
  it("matches case-insensitively and trims", () => {
    const a = createRsProject("整理书桌");
    const b = createRsProject("其他项目");
    expect(findProjectByTitle([a, b], " 整理书桌 ")?.id).toBe(a.id);
    expect(findProjectByTitle([a, b], "整理书桌")).toBe(a);
    expect(findProjectByTitle([a, b], "不存在")).toBeNull();
    expect(findProjectByTitle([a, b], "")).toBeNull();
  });
});

describe("storyboard-replacement / syncCharactersIntoProject", () => {
  it("merges by name, preserves id and bound letters, updates appearance", () => {
    const project = createRsProject("整理书桌");
    project.characters = [
      {
        id: "existing-1",
        name: "小明",
        role: "",
        description: "旧描述",
        appearances: [
          { id: "appa-1", name: "形象", imagePath: "old.png", prompt: "旧描述" },
        ],
        boundLetters: ["A", "B"],
      },
    ];
    const merged = syncCharactersIntoProject(project, [
      { id: "c1", name: "小明", description: "新描述", referencePath: "new.png" },
      { id: "c2", name: "师傅", description: "灰发老者" },
    ]);
    const ming = merged.characters.find((c) => c.name === "小明")!;
    expect(ming.id).toBe("existing-1");
    expect(ming.boundLetters).toEqual(["A", "B"]);
    expect(ming.description).toBe("新描述");
    expect(ming.appearances[0]?.imagePath).toBe("new.png");
    expect(merged.characters.some((c) => c.name === "师傅")).toBe(true);
  });

  it("keeps existing characters not present in the snapshot", () => {
    const project = createRsProject("整理书桌");
    project.characters = [
      {
        id: "keep-me",
        name: "旁白",
        role: "",
        description: "",
        appearances: [],
        boundLetters: [],
      },
    ];
    const merged = syncCharactersIntoProject(project, []);
    expect(merged.characters).toHaveLength(1);
    expect(merged.characters[0]?.id).toBe("keep-me");
  });
});
