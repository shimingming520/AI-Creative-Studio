/**
 * 生成资产 (Generated Assets) — the fixed sidebar section that mirrors the
 * app's generation output directory through the linked folder whose root is
 * that directory.
 *
 * Everything here is shared between renderer (nav rows, filter construction)
 * and worker-adjacent code; no filesystem knowledge lives in this module.
 *
 * Media kinds are expressed as `format` FilterClauses over the same extension
 * vocabulary the rest of Serpent uses (media-formats / audio-media /
 * text-media), plus AI-generator outputs (avif/jxl/heic/heif, flv/ts …, wma,
 * ply/usdz and document/text exports) that commonly appear in generation
 * output folders.
 */

import type { FilterClause } from "./asset-types";
import { MAX_CATEGORICAL_FILTER_VALUES } from "./asset-types";
import {
  IMAGE_EXTENSIONS,
  VIDEO_EXTENSIONS,
  MODEL_EXTENSIONS,
  DOCUMENT_EXTENSIONS,
} from "./media-formats";
import { AUDIO_EXTENSIONS } from "./audio-media";
import { FORMAT_TEXT_TOKEN, TEXT_EXTENSIONS } from "./text-media";

export const GENERATED_ASSET_KINDS = [
  "all",
  "image",
  "video",
  "audio",
  "model",
  "document",
  "other",
] as const;

export type GeneratedAssetKind = (typeof GENERATED_ASSET_KINDS)[number];

/** Kind names that carry a real include format filter. */
const FILTERED_KINDS = new Set<GeneratedAssetKind>([
  "image",
  "video",
  "audio",
  "model",
  "document",
]);

/** AI generator image outputs not covered by the core image registry. */
const EXTRA_IMAGE_EXTENSIONS = [".avif", ".jxl", ".heic", ".heif"] as const;
/** AI generator video outputs not covered by the core video registry. */
const EXTRA_VIDEO_EXTENSIONS = [
  ".flv",
  ".ts",
  ".m2ts",
  ".3gp",
  ".mpg",
  ".mpeg",
] as const;
/** AI generator audio outputs not covered by the core audio registry. */
const EXTRA_AUDIO_EXTENSIONS = [".wma"] as const;
/** AI 3D generator outputs (ComfyUI mesh nodes, TripoSR/SV3D etc.). */
const EXTRA_MODEL_EXTENSIONS = [".ply", ".usdz", ".dae", ".3ds"] as const;
/**
 * Document / text outputs from generation workflows: PDF/document exports,
 * prompts/metadata sidecars, subtitles, captions.
 */
const EXTRA_DOCUMENT_EXTENSIONS = [
  ".docx",
  ".doc",
  ".pptx",
  ".xlsx",
  ".srt",
  ".vtt",
  ".lrc",
] as const;

export const GENERATED_IMAGE_EXTENSIONS = [
  ...IMAGE_EXTENSIONS,
  ...EXTRA_IMAGE_EXTENSIONS,
] as const;

export const GENERATED_VIDEO_EXTENSIONS = [
  ...VIDEO_EXTENSIONS,
  ...EXTRA_VIDEO_EXTENSIONS,
] as const;

export const GENERATED_AUDIO_EXTENSIONS = [
  ...AUDIO_EXTENSIONS,
  ...EXTRA_AUDIO_EXTENSIONS,
] as const;

export const GENERATED_MODEL_EXTENSIONS = [
  ...MODEL_EXTENSIONS,
  ...EXTRA_MODEL_EXTENSIONS,
] as const;

export const GENERATED_DOCUMENT_EXTENSIONS = [
  ...DOCUMENT_EXTENSIONS,
  ...TEXT_EXTENSIONS,
  ...EXTRA_DOCUMENT_EXTENSIONS,
] as const;

/** All known extensions (every category), for the "其他" exclusion. */
export const GENERATED_KNOWN_EXTENSIONS = [
  ...GENERATED_IMAGE_EXTENSIONS,
  ...GENERATED_VIDEO_EXTENSIONS,
  ...GENERATED_AUDIO_EXTENSIONS,
  ...GENERATED_MODEL_EXTENSIONS,
  ...GENERATED_DOCUMENT_EXTENSIONS,
] as const;

function bareExtensions(
  extensions: readonly string[],
  seen: Set<string>,
): string[] {
  const out: string[] = [];
  for (const extension of extensions) {
    const token = extension.replace(/^\./, "").toLowerCase();
    if (!token || seen.has(token)) continue;
    seen.add(token);
    out.push(token);
  }
  return out;
}

/** Split a token list so every clause stays within the protocol value cap. */
function chunkValues(values: readonly string[], max: number): string[][] {
  const chunks: string[][] = [];
  for (let i = 0; i < values.length; i += max) {
    chunks.push(values.slice(i, i + max));
  }
  return chunks;
}

/**
 * Format-filter clauses backing one generated-asset kind.
 * - all    → [] (the linked-folder scope alone is the filter)
 * - image / video / audio / model → include clause per kind
 * - document → include clause: registered document formats + the unified
 *   `text` token (the Worker expands `text` to every TEXT_EXTENSIONS entry)
 * - other  → exclude clauses over every known extension, chunked so each
 *   clause stays within MAX_CATEGORICAL_FILTER_VALUES (separate clauses are
 *   ANDed, so chunked exclusions keep "the remainder" semantics)
 */
export function generatedKindFilterClauses(
  kind: GeneratedAssetKind,
): FilterClause[] {
  if (kind === "all") return [];
  if (kind === "document") {
    const nonTextDocumentTokens = bareExtensions(
      [...DOCUMENT_EXTENSIONS, ...EXTRA_DOCUMENT_EXTENSIONS],
      new Set(),
    );
    return [
      {
        field: "format",
        values: [FORMAT_TEXT_TOKEN, ...nonTextDocumentTokens],
        exclude: false,
      },
    ];
  }
  if (!FILTERED_KINDS.has(kind)) {
    // "other": keep everything that is not a known generated type. The known
    // extension registry is much larger than the per-clause value cap, so
    // the exclusion is split into multiple clauses (each ≤ the cap). The
    // Worker ANDs filter clauses, and NOT(A) AND NOT(B) == NOT(A ∪ B).
    const known = bareExtensions(GENERATED_KNOWN_EXTENSIONS, new Set());
    return chunkValues(known, MAX_CATEGORICAL_FILTER_VALUES).map((values) => ({
      field: "format",
      values,
      exclude: true,
    }));
  }
  const extensions =
    kind === "image"
      ? GENERATED_IMAGE_EXTENSIONS
      : kind === "video"
        ? GENERATED_VIDEO_EXTENSIONS
        : kind === "audio"
          ? GENERATED_AUDIO_EXTENSIONS
          : kind === "model"
            ? GENERATED_MODEL_EXTENSIONS
            : GENERATED_DOCUMENT_EXTENSIONS;
  return [
    {
      field: "format",
      values: bareExtensions(extensions, new Set()),
      exclude: false,
    },
  ];
}
