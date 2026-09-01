import { describe, expect, it } from "vitest";
import {
  GENERATED_ASSET_KINDS,
  GENERATED_IMAGE_EXTENSIONS,
  GENERATED_VIDEO_EXTENSIONS,
  GENERATED_AUDIO_EXTENSIONS,
  GENERATED_MODEL_EXTENSIONS,
  GENERATED_DOCUMENT_EXTENSIONS,
  GENERATED_KNOWN_EXTENSIONS,
  generatedKindFilterClauses,
  type GeneratedAssetKind,
} from "../../src/shared/generated-assets";
import {
  MAX_CATEGORICAL_FILTER_VALUES,
  filterClauseSchema,
} from "../../src/shared/asset-types";
import {
  FORMAT_TEXT_TOKEN,
  expandFormatFilterTokens,
} from "../../src/shared/text-media";

function asFilter(entry: unknown) {
  return entry as {
    field: string;
    values: string[];
    exclude: boolean;
  };
}

describe("generated-assets", () => {
  it("defines every media kind", () => {
    expect(GENERATED_ASSET_KINDS).toEqual([
      "all",
      "image",
      "video",
      "audio",
      "model",
      "document",
      "other",
    ]);
  });

  it("all yields no filter clauses (linked-folder scope is the filter)", () => {
    expect(generatedKindFilterClauses("all")).toEqual([]);
  });

  it("include kinds produce a format include clause", () => {
    for (const kind of [
      "image",
      "video",
      "audio",
      "model",
      "document",
    ] as const) {
      const clauses = generatedKindFilterClauses(kind);
      expect(clauses).toHaveLength(1);
      const clause = asFilter(clauses[0]);
      expect(clause.field).toBe("format");
      expect(clause.exclude).toBe(false);
      expect(clause.values.length).toBeGreaterThan(0);
    }
  });
  it("image filter carries png/jpg/webp plus generator outputs", () => {
    const clause = asFilter(generatedKindFilterClauses("image")[0]);
    expect(clause.values).toContain("png");
    expect(clause.values).toContain("jpeg");
    expect(clause.values).toContain("webp");
    expect(clause.values).toContain("avif");
    expect(clause.values).toContain("jxl");
  });

  it("video filter carries mp4/webm plus m2ts/ts", () => {
    const clause = asFilter(generatedKindFilterClauses("video")[0]);
    expect(clause.values).toContain("mp4");
    expect(clause.values).toContain("webm");
    expect(clause.values).toContain("ts");
    expect(clause.values).toContain("m2ts");
  });

  it("audio filter carries mp3/wav/flac plus wma", () => {
    const clause = asFilter(generatedKindFilterClauses("audio")[0]);
    expect(clause.values).toContain("mp3");
    expect(clause.values).toContain("wav");
    expect(clause.values).toContain("flac");
    expect(clause.values).toContain("wma");
  });

  it("model filter carries glb/obj/fbx plus ply/usdz", () => {
    const clause = asFilter(generatedKindFilterClauses("model")[0]);
    expect(clause.values).toContain("glb");
    expect(clause.values).toContain("obj");
    expect(clause.values).toContain("fbx");
    expect(clause.values).toContain("ply");
    expect(clause.values).toContain("usdz");
  });

  it("document filter carries the text token plus pdf/docx/srt", () => {
    const clause = asFilter(generatedKindFilterClauses("document")[0]);
    // Document kinds use the unified `text` token (expanded by the Worker).
    expect(clause.values).toContain(FORMAT_TEXT_TOKEN);
    expect(clause.values).toContain("pdf");
    expect(clause.values).toContain("docx");
    expect(clause.values).toContain("srt");
    // Token expansion must cover the full text vocabulary.
    const expanded = expandFormatFilterTokens(clause.values);
    expect(expanded).toContain("txt");
    expect(expanded).toContain("json");
    expect(expanded).toContain("pdf");
    expect(expanded).toContain("docx");
    expect(expanded).toContain("srt");
  });

  it("every kind's clauses stay within the protocol value cap and parse", () => {
    for (const kind of GENERATED_ASSET_KINDS) {
      const clauses = generatedKindFilterClauses(kind);
      for (const clause of clauses) {
        if ("values" in clause) {
          expect(clause.values.length).toBeLessThanOrEqual(
            MAX_CATEGORICAL_FILTER_VALUES,
          );
        }
        const parsed = filterClauseSchema.safeParse(clause);
        expect(parsed.success, `clause rejected for ${kind}`).toBe(true);
      }
    }
  });

  it("other excludes every known extension (chunked)", () => {
    const clauses = generatedKindFilterClauses("other");
    expect(clauses.length).toBeGreaterThan(1);
    const excluded = new Set<string>();
    for (const entry of clauses) {
      const clause = asFilter(entry);
      expect(clause.field).toBe("format");
      expect(clause.exclude).toBe(true);
      for (const value of clause.values) excluded.add(value);
    }
    const knownSet = new Set(
      GENERATED_KNOWN_EXTENSIONS.map((ext) => ext.replace(/^\./, "")),
    );
    expect(excluded.size).toBeGreaterThanOrEqual(knownSet.size);
    for (const extension of knownSet) {
      // Every registered extension must be excluded (token normalized: no dot).
      expect(excluded).toContain(extension);
    }
  });

  it("normalizes and de-duplicates extension tokens", () => {
    const image = asFilter(
      generatedKindFilterClauses("image" as GeneratedAssetKind)[0],
    );
    expect(new Set(image.values).size).toBe(image.values.length);
    expect(image.values.every((value) => !value.startsWith("."))).toBe(true);
  });

  it("extension sets are defined with leading-dot entries", () => {
    const all = [
      ...GENERATED_IMAGE_EXTENSIONS,
      ...GENERATED_VIDEO_EXTENSIONS,
      ...GENERATED_AUDIO_EXTENSIONS,
      ...GENERATED_MODEL_EXTENSIONS,
      ...GENERATED_DOCUMENT_EXTENSIONS,
    ];
    expect(all.every((ext) => ext.startsWith("."))).toBe(true);
    expect(new Set(all).size).toBeGreaterThan(0);
  });
});
