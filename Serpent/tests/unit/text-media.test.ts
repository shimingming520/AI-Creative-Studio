import { expect, test } from "vitest";

import {
  countTextLines,
  expandFormatFilterTokens,
  FORMAT_TEXT_TOKEN,
  isTextFileName,
  normalizeFormatFilterTokens,
  textCardPreviewSnippet,
  textMimeForExtension,
} from "../../src/shared/text-media";

test("isTextFileName recognizes common text/code extensions", () => {
  expect(isTextFileName("notes.TXT")).toBe(true);
  expect(isTextFileName("readme.md")).toBe(true);
  expect(isTextFileName("data.json")).toBe(true);
  expect(isTextFileName("sheet.csv")).toBe(true);
  expect(isTextFileName("schema.xml")).toBe(true);
  expect(isTextFileName("App.vue")).toBe(true);
  expect(isTextFileName("photo.png")).toBe(false);
  expect(isTextFileName("clip.mp3")).toBe(false);
});

test("textMimeForExtension and countTextLines", () => {
  expect(textMimeForExtension(".md")).toBe("text/markdown");
  expect(textMimeForExtension(".json")).toBe("application/json");
  expect(textMimeForExtension(".png")).toBeNull();
  expect(countTextLines("")).toBe(1);
  expect(countTextLines("a")).toBe(1);
  expect(countTextLines("a\nb")).toBe(2);
  expect(countTextLines("a\nb\n")).toBe(3);
  expect(countTextLines("a\r\nb\rc")).toBe(3);
  expect(countTextLines("a\rb")).toBe(2);
});

test("textCardPreviewSnippet truncates long content", () => {
  const long = "abc".repeat(200);
  const snippet = textCardPreviewSnippet(long, 10);
  expect(snippet.endsWith("…")).toBe(true);
  expect(snippet.length).toBeLessThanOrEqual(11);
  expect(textCardPreviewSnippet("short")).toBe("short");
});

test("expandFormatFilterTokens expands the unified text token", () => {
  const expanded = expandFormatFilterTokens([FORMAT_TEXT_TOKEN, "png"]);
  expect(expanded).toContain("txt");
  expect(expanded).toContain("md");
  expect(expanded).toContain("json");
  expect(expanded).toContain("xml");
  expect(expanded).toContain("png");
  expect(expanded).not.toContain("text");
  expect(expandFormatFilterTokens(["PNG", ".JPG"])).toEqual(["png", "jpg"]);
});

test("normalizeFormatFilterTokens keeps the text token unexpanded", () => {
  const normalized = normalizeFormatFilterTokens([
    FORMAT_TEXT_TOKEN,
    ".PNG",
    "jpg",
    " text ",
  ]);
  expect(normalized).toEqual(["text", "png", "jpg"]);
  // Normalizing must not enumerate TEXT_EXTENSIONS (the Worker expands the
  // token at query build time; renderer-side expansion would exceed the
  // categorical filter clause value cap).
  expect(normalized).not.toContain("txt");
});
