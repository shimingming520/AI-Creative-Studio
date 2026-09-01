import { describe, expect, it } from "vitest";
import {
  buildRsImagePrompt,
  buildRsVideoPrompt,
  clusterPeople,
  createRsProject,
  parseDetectedPeople,
  RS_CLUSTER_THRESHOLD,
  RS_MAX_PEOPLE,
  type RsBindingLine,
} from "../../src/shared/replacement-studio";

describe("replacement-studio / parseDetectedPeople", () => {
  it("parses a plain JSON array with descriptions", () => {
    const raw = JSON.stringify([
      { label: "人物A", bbox: [0.1, 0.2, 0.3, 0.5], confidence: 0.91, description: "年轻女性，黑长发，红裙" },
      { label: "人物B", bbox: [0.5, 0.1, 0.2, 0.4], description: "中年男性，西装" },
    ]);
    const people = parseDetectedPeople(raw);
    expect(people).toHaveLength(2);
    expect(people[0]).toMatchObject({ bbox: { x: 0.1, y: 0.2, w: 0.3, h: 0.5 } });
    expect(people[0]?.confidence).toBeCloseTo(0.91, 2);
    expect(people[1]?.labelHint).toBe("人物B");
    expect(people[0]?.description).toContain("黑长发");
  });

  it("parses fenced JSON with surrounding prose", () => {
    const raw = [
      "检测结果如下：",
      "```json",
      `[{"bbox":[0,0,0.25,0.6],"label":"人物A","description":"戴帽子的瘦高男子"}]`,
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

  it("returns [] for garbage", () => {
    expect(parseDetectedPeople("没有检测到人物")).toEqual([]);
    expect(parseDetectedPeople("[{bad json]")).toEqual([]);
  });
});

describe("replacement-studio / clusterPeople", () => {
  it("clusters the same person across shots by description similarity", () => {
    const clusters = clusterPeople([
      { shotId: "s1", personId: "p1", letter: "A", description: "年轻女性，黑色长发，红色连衣裙", bbox: { x: 0.2, y: 0.3, w: 0.3, h: 0.5 } },
      { shotId: "s2", personId: "p2", letter: "A", description: "年轻女性 黑色长发 红色连衣裙", bbox: { x: 0.21, y: 0.29, w: 0.31, h: 0.5 } },
      { shotId: "s1", personId: "p3", letter: "B", description: "白发老者，灰色中山装", bbox: { x: 0.6, y: 0.2, w: 0.25, h: 0.5 } },
    ]);
    expect(clusters).toHaveLength(2);
    const woman = clusters.find((c) => c.letter === "A")!;
    expect(woman.personIds.sort()).toEqual(["p1", "p2"]);
    expect(woman.personIdsByShot["s2"]).toEqual(["p2"]);
    expect(clusters.find((c) => c.letter === "B")?.personIds).toEqual(["p3"]);
  });

  it("uses the threshold to keep distinct people apart", () => {
    expect(RS_CLUSTER_THRESHOLD).toBeGreaterThan(0);
    const clusters = clusterPeople([
      { shotId: "s1", personId: "p1", letter: "A", description: "白衣女子 长卷发", bbox: { x: 0, y: 0, w: 0.2, h: 0.5 } },
      { shotId: "s1", personId: "p2", letter: "B", description: "黑衣男子 短发", bbox: { x: 0.4, y: 0, w: 0.2, h: 0.5 } },
    ]);
    expect(clusters).toHaveLength(2);
  });

  it("skips people without description", () => {
    const clusters = clusterPeople([
      { shotId: "s1", personId: "p1", letter: "A", description: "", bbox: { x: 0, y: 0, w: 0.2, h: 0.5 } },
    ]);
    expect(clusters).toHaveLength(0);
  });
});

describe("replacement-studio / prompt builders", () => {
  const bindings: RsBindingLine[] = [
    {
      letter: "A",
      label: "人物A",
      description: "黑长发女性",
      imageIndex: 3,
      scope: "full-person",
      characterName: "艾米",
      appearanceName: "正脸",
      appearancePrompt: "金色长发",
    },
    {
      letter: "B",
      label: "人物B",
      description: "西装男性",
      imageIndex: null,
      scope: "face-hair",
      characterName: "杰森",
      appearanceName: null,
      appearancePrompt: "",
    },
  ];

  it("builds an image prompt with bindings + scope lines + scene ref", () => {
    const prompt = buildRsImagePrompt({
      template: "{shot}：{bindings}\n{scopeLines}",
      shotLabel: "镜头 01",
      bindings,
      sceneRef: { name: "办公室", imageIndex: 4 },
    });
    expect(prompt).toContain("镜头 01");
    expect(prompt).toContain("A号人物（人物A）→ 参考图3（艾米 / 正脸）");
    expect(prompt).toContain("B号人物（人物B）→ 文字描述");
    expect(prompt).toContain("替换范围：完整人物");
    expect(prompt).toContain("仅替换脸部与发型");
    expect(prompt).toContain("场景参考");
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

  it("createRsProject produces a valid v2 draft", () => {
    const project = createRsProject("测试项目");
    expect(project.title).toBe("测试项目");
    expect(project.step).toBe("material");
    expect(project.sources).toHaveLength(0);
    expect(project.shots).toHaveLength(0);
    expect(project.sourceCharacters.length).toBeLessThanOrEqual(RS_MAX_PEOPLE);
  });
});
