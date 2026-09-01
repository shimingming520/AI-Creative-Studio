import { describe, expect, it } from "vitest";
import {
  buildRsImagePrompt,
  buildRsVideoPrompt,
  createRsProject,
  parseDetectedPeople,
  RS_MAX_PEOPLE,
  type RsBindingLine,
} from "../../src/shared/replacement-studio";

describe("replacement-studio / parseDetectedPeople", () => {
  it("parses a plain JSON array", () => {
    const raw = JSON.stringify([
      { label: "人物A", bbox: [0.1, 0.2, 0.3, 0.5], confidence: 0.91 },
      { label: "人物B", bbox: [0.5, 0.1, 0.2, 0.4] },
    ]);
    const people = parseDetectedPeople(raw);
    expect(people).toHaveLength(2);
    expect(people[0]).toMatchObject({ bbox: { x: 0.1, y: 0.2, w: 0.3, h: 0.5 } });
    expect(people[0]?.confidence).toBeCloseTo(0.91, 2);
    expect(people[1]?.labelHint).toBe("人物B");
  });

  it("parses fenced JSON with surrounding prose", () => {
    const raw = [
      "检测结果如下：",
      "```json",
      `[{"bbox":[0,0,0.25,0.6],"label":"人物A"}]`,
      "```",
      "共1人。",
    ].join("\n");
    expect(parseDetectedPeople(raw)).toHaveLength(1);
  });

  it("drops invalid / zero boxes and clamps coordinates", () => {
    const raw = JSON.stringify([
      { bbox: [0, 0, 0, 0] },
      { bbox: [-0.1, 1.2, 0.5, 0.5] },
      { bbox: [0.8, 0.8, 0.5, 0.5] },
      { note: "not a person" },
    ]);
    const people = parseDetectedPeople(raw);
    expect(people).toHaveLength(2);
    expect(people[1]?.bbox.x).toBeLessThanOrEqual(0.5);
  });

  it("tolerates object-shaped boxes", () => {
    const raw = JSON.stringify([{ box: { x: 0.2, y: 0.3, width: 0.4, height: 0.2 } }]);
    expect(parseDetectedPeople(raw)[0]?.bbox.h).toBeCloseTo(0.2, 4);
  });

  it("returns [] for garbage", () => {
    expect(parseDetectedPeople("没有检测到人物")).toEqual([]);
    expect(parseDetectedPeople("[{bad json]")).toEqual([]);
  });
});

describe("replacement-studio / prompt builders", () => {
  const bindings: RsBindingLine[] = [
    {
      letter: "A",
      label: "人物A",
      imageIndex: 3,
      scope: "full-person",
      characterName: "艾米",
      appearanceName: "正脸",
      appearancePrompt: "金色长发",
    },
    {
      letter: "B",
      label: "人物B",
      imageIndex: null,
      scope: "face-hair",
      characterName: "杰森",
      appearanceName: null,
      appearancePrompt: "",
    },
  ];

  it("builds an image prompt with bindings + scope lines", () => {
    const prompt = buildRsImagePrompt({
      template: "{shot}：{bindings}\n{scopeLines}",
      shotLabel: "镜头 01",
      bindings,
    });
    expect(prompt).toContain("镜头 01");
    expect(prompt).toContain("A号人物（人物A）→ 参考图3（艾米 / 正脸）");
    expect(prompt).toContain("B号人物（人物B）→ 文字描述");
    expect(prompt).toContain("替换范围：完整人物");
    expect(prompt).toContain("仅替换脸部与发型");
    expect(prompt).toContain("金色长发");
  });

  it("replaces unknown template placeholders gracefully", () => {
    const prompt = buildRsImagePrompt({
      template: "{shot} {bindings} {scopeLines} {unknown}",
      shotLabel: "S",
      bindings: [],
    });
    expect(prompt).toContain("{unknown}");
    expect(prompt).toContain("提示中未分配目标人物");
  });

  it("builds a video prompt", () => {
    const prompt = buildRsVideoPrompt({
      template: "保持动作，{bindings}替换。",
      shotLabel: "镜头 01",
      bindings,
    });
    expect(prompt).toContain("人物A→艾米(正脸)");
    expect(prompt).toContain("人物B→杰森");
  });

  it("createRsProject produces a valid draft", () => {
    const project = createRsProject("测试项目");
    expect(project.title).toBe("测试项目");
    expect(project.base).toBeNull();
    expect(project.shots).toHaveLength(0);
    expect(project.sourceCharacters.length).toBeLessThanOrEqual(RS_MAX_PEOPLE);
  });
});
