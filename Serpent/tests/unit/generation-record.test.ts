import { describe, expect, it } from "vitest";
import {
  generationRecordForPath,
  generationTaskTypeLabel,
  type GenerationRecord,
} from "../../src/shared/generation-record";

const record: GenerationRecord = {
  taskId: "t1",
  kind: "image",
  taskType: "txt2img",
  taskTypeLabel: "文生图",
  prompt: "a cat",
  workflow: "workflow.json",
  model: "Krea2",
  params: { seed: 42, width: 1024 },
  durationMs: 12345,
  createdAt: "2026-08-31T00:00:00.000Z",
  completedAt: "2026-08-31T00:00:12.345Z",
  engine: "本地引擎",
};

function keyed() {
  return { "F:\\out\\cat.png": record };
}

describe("generation-record", () => {
  it("finds a record by exact path", () => {
    expect(generationRecordForPath(keyed(), "F:\\out\\cat.png")).toBe(record);
  });

  it("matches trailing separators", () => {
    expect(generationRecordForPath(keyed(), "F:\\out\\cat.png\\")).toBe(record);
  });

  it("returns null for missing paths / records", () => {
    expect(generationRecordForPath(keyed(), "F:\\out\\dog.png")).toBeNull();
    expect(generationRecordForPath({}, "F:\\out\\cat.png")).toBeNull();
    expect(generationRecordForPath(keyed(), null)).toBeNull();
    expect(generationRecordForPath(keyed(), undefined)).toBeNull();
  });

  it("carries the full provenance fields", () => {
    const found = generationRecordForPath(keyed(), "F:\\out\\cat.png");
    expect(found?.prompt).toBe("a cat");
    expect(found?.workflow).toBe("workflow.json");
    expect(found?.model).toBe("Krea2");
    expect(found?.params?.seed).toBe(42);
    expect(found?.durationMs).toBe(12345);
    expect(found?.taskType).toBe("txt2img");
    expect(found?.taskTypeLabel).toBe("文生图");
  });

  describe("generationTaskTypeLabel", () => {
    it("prefers the host-sent label", () => {
      expect(generationTaskTypeLabel({ taskType: "sfx", taskTypeLabel: "音效生成" })).toBe(
        "音效生成",
      );
    });

    it("falls back to the known id map", () => {
      expect(generationTaskTypeLabel({ taskType: "voiceDesign" })).toBe("音色设计");
      expect(generationTaskTypeLabel({ taskType: "firstlast" })).toBe("首尾帧");
      expect(generationTaskTypeLabel({ taskType: "img2img" })).toBe("图生图");
    });

    it("falls back to the raw id for unknown types", () => {
      expect(generationTaskTypeLabel({ taskType: "custom-something" })).toBe(
        "custom-something",
      );
    });

    it("returns null when no task type is present", () => {
      expect(generationTaskTypeLabel({})).toBeNull();
      expect(generationTaskTypeLabel({ taskType: null, taskTypeLabel: null })).toBeNull();
    });
  });
});
