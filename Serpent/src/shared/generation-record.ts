/**
 * 生成记录 (Generation Record) — provenance metadata for generated assets.
 *
 * The host app (YUH Studio) records what produced each output file —
 * prompt / workflow / generation parameters / model / duration — keyed by the
 * absolute output path. Serpent main keeps the latest map (pushed by the host
 * via setHostedGenerationRecords) and serves per-asset records to the
 * renderer, which resolves the asset's source path in the Worker and looks
 * the record up by path. No filesystem path ever crosses into the renderer.
 */

export type GenerationRecord = {
  /** Host-side task id that produced this output. */
  taskId?: string | null;
  /** Media kind: image / video / audio / 3d / workflow / … */
  kind?: string | null;
  /**
   * Host-side task type (任务类型): the specific generation mode, e.g.
   * audio 六大类型 — voice / voiceDesign / music / sfx / vocalSplit / asr,
   * image — txt2img / img2img / edit, video — text / firstlast / img2video /
   * reference / videoEdit. Stable id, resolved for display via taskTypeLabel.
   */
  taskType?: string | null;
  /** Human-readable label for taskType (host-localized, e.g. 音效生成). */
  taskTypeLabel?: string | null;
  /** Generation prompt(s). */
  prompt?: string | null;
  /** Custom workflow name (ComfyUI 工作流). */
  workflow?: string | null;
  /** Model / engine label (e.g. Krea2, MiniMax H3 FL2VA, cloud provider model). */
  model?: string | null;
  /** Structured generation parameters (seed/steps/cfg/尺寸/时长/…). */
  params?: Record<string, string | number | boolean | null> | null;
  /** Wall-clock generation time in ms (createdAt → completedAt). */
  durationMs?: number | null;
  /** ISO timestamp when the generation started. */
  createdAt?: string | null;
  /** ISO timestamp when the generation finished. */
  completedAt?: string | null;
  /** Where it ran: 本地引擎 / cloud provider name / … */
  engine?: string | null;
};

/** A single record entry maps an absolute output path to its record. */
export function generationRecordForPath(
  records: Record<string, GenerationRecord>,
  absolutePath: string | null | undefined,
): GenerationRecord | null {
  if (!absolutePath) return null;
  // Path identity is normalized exactly like the worker's linked-folder paths
  // (Windows is case-insensitive); the host keys records with path.resolve().
  const key = absolutePath.replace(/[\\/]+$/u, "");
  return records[key] ?? null;
}

/**
 * Known task-type ids → labels. Mirrors the host catalogue (YUH Studio):
 * audio 六大类型 + image/video modes. Only used as a fallback when the host
 * does not send taskTypeLabel.
 */
export const GENERATION_TASK_TYPE_LABELS: Record<string, string> = {
  voice: "语音生成",
  voiceDesign: "音色设计",
  music: "音乐生成",
  sfx: "音效生成",
  vocalSplit: "人声分离",
  asr: "语音转文本",
  txt2img: "文生图",
  img2img: "图生图",
  edit: "图编辑",
  text: "文生视频",
  firstlast: "首尾帧",
  img2video: "图生视频",
  reference: "全能参考",
  videoEdit: "视频编辑",
};

/** Resolve a task type id to a display label (host label → known map → raw id). */
export function generationTaskTypeLabel(record: {
  taskType?: string | null;
  taskTypeLabel?: string | null;
}): string | null {
  if (!record.taskType && !record.taskTypeLabel) return null;
  return (
    record.taskTypeLabel ||
    (record.taskType
      ? GENERATION_TASK_TYPE_LABELS[record.taskType] || record.taskType
      : null)
  );
}
