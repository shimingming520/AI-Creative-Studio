/**
 * 语音工作室(voice studio)shared model & pure helpers.
 *
 * 对齐 ShuoCanvas 语音工作室编排:
 *   字幕识别(ASR 分段) → 翻译(保持分段一致) → 配音(音色克隆/音色设计)
 *   → 合成(保留原声或全部替换,按分段时间轴拼接)。
 *
 * 引擎复用 YUH 既有能力:whisper 转写(verbose_json 分段)、IndexTTS 克隆、
 * TTS 音色设计、ffmpeg 合成;本模块只包含纯函数与类型,不依赖 DOM / IPC。
 */

// ---------------------------------------------------------------------------
// 类型
// ---------------------------------------------------------------------------

export type VoiceMode = "none" | "clone" | "design";

/** 单个语音分段(字幕 + 翻译 + 配音状态)。 */
export type VoiceSegment = {
  id: string;
  index: number;
  /** 原音频时间轴(毫秒)。 */
  startMs: number;
  endMs: number;
  /** 原文(ASR 结果)。 */
  text: string;
  /** 翻译后文本(配音用)。 */
  translatedText: string;
  /** 配音策略:none=保留原声,clone=音色克隆,design=音色设计。 */
  voiceMode: VoiceMode;
  /** 音色克隆参考音频路径。 */
  refAudioPath: string | null;
  /** 音色设计描述(与 IndexTTS 无关,TTS 音色设计用)。 */
  designText: string;
  dubStatus: "idle" | "running" | "done" | "error";
  dubError: string | null;
  /** 配音结果音频路径。 */
  audioPath: string | null;
};

export type VoiceDraft = {
  /** 源音频路径(视频则先抽音频)。 */
  sourcePath: string;
  sourceName: string;
  providerId: string;
  /** 转写模型(whisper-1 等)。 */
  model: string;
  language: string;
  targetLang: string;
  segments: VoiceSegment[];
  /** 合成:keep-original 保留原声,dub-all 全部替换。 */
  mixMode: "keep-original" | "dub-all";
  gapMs: number;
};

/** 时间轴单元(合成预览/主进程拼接共用)。 */
export type ConcatSlot = {
  /** 相对合成音频起点的偏移(毫秒)。 */
  offsetMs: number;
  durationMs: number;
  kind: "dub" | "silence" | "original";
  /** dub 单元对应的配音音频路径。 */
  sourcePath: string | null;
};

// ---------------------------------------------------------------------------
// ASR 分段解析
// ---------------------------------------------------------------------------

const MIN_SEGMENT_MS = 150;

function makeSegment(index: number, startMs: number, endMs: number, text: string): VoiceSegment | null {
  const clean = String(text || "").trim();
  const safeStart = Math.max(0, Math.round(startMs));
  const safeEnd = Math.max(safeStart + MIN_SEGMENT_MS, Math.round(endMs));
  if (!clean) return null;
  return {
    id: `seg-${index + 1}`,
    index,
    startMs: safeStart,
    endMs: safeEnd,
    text: clean,
    translatedText: "",
    voiceMode: "none",
    refAudioPath: null,
    designText: "",
    dubStatus: "idle",
    dubError: null,
    audioPath: null,
  };
}

/** 解析 YUH 转写结果(whisper verbose_json 的 segments,秒为单位)。 */
export function segmentsFromWhisper(raw: unknown): VoiceSegment[] {
  const list = Array.isArray(raw)
    ? raw
    : raw && typeof raw === "object" && Array.isArray((raw as { segments?: unknown[] }).segments)
      ? (raw as { segments: unknown[] }).segments
      : [];
  const segments: VoiceSegment[] = [];
  for (const item of list) {
    if (!item || typeof item !== "object") continue;
    const record = item as Record<string, unknown>;
    const start = Number(record.start);
    const end = Number(record.end);
    const text = typeof record.text === "string" ? record.text : "";
    if (!Number.isFinite(start) || !Number.isFinite(end)) continue;
    const segment = makeSegment(segments.length, start * 1000, end * 1000, text);
    if (segment) segments.push(segment);
  }
  return segments;
}

const SRT_TIME_RE = /(\d{1,2}):(\d{1,2}):(\d{1,2}[.,]\d{1,3})/;

function parseTimestamp(raw: string): number | null {
  const match = SRT_TIME_RE.exec(raw);
  if (!match) return null;
  const hours = Number(match[1]) * 3600 * 1000;
  const minutes = Number(match[2]) * 60 * 1000;
  const rest = match[3]!.replace(",", ".");
  const seconds = Math.round(Number(rest) * 1000);
  return hours + minutes + seconds;
}

/** SRT → 分段(字幕文件兜底)。 */
export function parseSrtToSegments(srt: string): VoiceSegment[] {
  const blocks = String(srt || "").split(/\r?\n\r?\n/);
  const segments: VoiceSegment[] = [];
  for (const block of blocks) {
    const lines = block.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
    const timeLine = lines.find((line) => SRT_TIME_RE.test(line));
    if (!timeLine) continue;
    const [startRaw, endRaw] = timeLine.split("-->");
    const startMs = parseTimestamp(startRaw || "");
    const endMs = parseTimestamp(endRaw || "");
    if (startMs === null || endMs === null) continue;
    const textLines = lines.filter((line) => line !== timeLine && !/^\d+$/.test(line));
    const segment = makeSegment(segments.length, startMs, endMs, textLines.join(" "));
    if (segment) segments.push(segment);
  }
  return segments;
}

/** VTT → 分段。 */
export function parseVttToSegments(vtt: string): VoiceSegment[] {
  const lines = String(vtt || "").split(/\r?\n/).map((line) => line.trim());
  const segments: VoiceSegment[] = [];
  let current: { startMs: number; endMs: number; texts: string[] } | null = null;
  const flush = () => {
    if (!current) return;
    const segment = makeSegment(segments.length, current.startMs, current.endMs, current.texts.join(" "));
    if (segment) segments.push(segment);
    current = null;
  };
  for (const line of lines) {
    if (!line) {
      flush();
      continue;
    }
    const timeMatch = /^(\S+)\s+-->\s+(\S+)/.exec(line);
    if (timeMatch) {
      flush();
      const startMs = parseTimestamp(timeMatch[1]!);
      const endMs = parseTimestamp(timeMatch[2]!);
      if (startMs !== null && endMs !== null) {
        current = { startMs, endMs, texts: [] };
      }
      continue;
    }
    if (current && !/^WEBVTT/.test(line) && !/^NOTE/.test(line)) {
      current.texts.push(line);
    }
  }
  flush();
  return segments;
}

/**
 * 无时间轴转写文本 → 按句拆分并均摊时长估算分段(ASR 未返回 segments 时兜底)。
 * 按字符数权重分配 durationMs。
 */
export function splitTextToSegments(text: string, durationMs: number): VoiceSegment[] {
  const sentences = String(text || "")
    .replace(/\r\n/g, "\n")
    .split(/(?<=[。！？!?；;\n])/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);
  if (sentences.length === 0) return [];
  const totalChars = sentences.reduce((sum, sentence) => sum + sentence.length, 0) || 1;
  const segments: VoiceSegment[] = [];
  let offset = 0;
  for (const sentence of sentences) {
    const duration = Math.max(MIN_SEGMENT_MS, Math.round((sentence.length / totalChars) * durationMs));
    const segment = makeSegment(segments.length, offset, offset + duration, sentence);
    if (segment) segments.push(segment);
    offset += duration;
  }
  return segments;
}

/** 毫秒 → mm:ss(.S) 展示。 */
export function formatMs(ms: number): string {
  const totalSec = Math.max(0, Math.round(ms) / 1000);
  const minutes = Math.floor(totalSec / 60);
  const seconds = Math.floor(totalSec % 60);
  const tenth = Math.floor((totalSec * 10) % 10);
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${pad(minutes)}:${pad(seconds)}.${tenth}`;
}

// ---------------------------------------------------------------------------
// 翻译
// ---------------------------------------------------------------------------

/** 翻译系统提示词(对齐 ShuoCanvas audioVoiceTranslation 的约束)。 */
export function buildTranslationSystemPrompt(): string {
  return [
    "你是专业的影视配音翻译。把语音分段翻译成目标语言,用于后续配音。",
    "约束:",
    "- 保留每个分段 id,不得合并/拆分/省略/重排;",
    "- 保持人名、代词、语气与术语一致(整列表共享上下文);",
    "- 译文要自然、适合口语配音,篇幅尽量贴近原分段时间;",
    "- 只输出 JSON 对象,不要输出其它文字;",
    "- JSON 结构:{\"translations\":[{\"id\":\"分段id\",\"text\":\"译文\"}]}",
  ].join("\n");
}

/** 翻译用户提示词(携带全部分段)。 */
export function buildTranslationUserPrompt(segments: VoiceSegment[], targetLang: string): string {
  const list = segments.map((segment) => ({
    id: segment.id,
    startMs: segment.startMs,
    endMs: segment.endMs,
    text: segment.text,
  }));
  return [
    `目标语言:${targetLang || "中文"}`,
    "请翻译以下语音分段:",
    JSON.stringify(list),
  ].join("\n");
}

/** 解析翻译结果(JSON 对象/数组;失败返回 null)。 */
export function parseTranslationResult(raw: string): Record<string, string> | null {
  const text = String(raw || "").trim();
  if (!text) return null;
  const candidates: string[] = [];
  const fenced = /```(?:json)?\s*([\s\S]*?)```/i.exec(text);
  if (fenced?.[1]) candidates.push(fenced[1]);
  candidates.push(text);
  const extract = (candidate: string) => {
    const parsedList = (value: unknown): { id: string; text: string }[] | null => {
      if (!Array.isArray(value)) return null;
      const out: { id: string; text: string }[] = [];
      for (const item of value) {
        if (!item || typeof item !== "object") continue;
        const record = item as Record<string, unknown>;
        const id =
          typeof record.id === "string"
            ? record.id
            : String(record.segmentId ?? record.index ?? "");
        const valueText =
          typeof record.text === "string"
            ? record.text
            : typeof record.translation === "string"
              ? record.translation
              : "";
        if (id && valueText.trim()) out.push({ id, text: valueText.trim() });
      }
      return out.length ? out : null;
    };
    const tryParse = (slice: string) => {
      try {
        const parsed = JSON.parse(slice);
        const list = Array.isArray(parsed)
          ? parsedList(parsed)
          : parsedList((parsed as { translations?: unknown[] })?.translations);
        if (list) {
          const byId: Record<string, string> = {};
          for (const item of list) byId[item.id] = item.text;
          return Object.keys(byId).length ? byId : null;
        }
      } catch {
        return null;
      }
      return null;
    };
    const direct = tryParse(candidate.trim());
    if (direct) return direct;
    const startBracket = candidate.indexOf("[");
    const endBracket = candidate.lastIndexOf("]");
    if (startBracket >= 0 && endBracket > startBracket) {
      const asArray = tryParse(candidate.slice(startBracket, endBracket + 1));
      if (asArray) return asArray;
    }
    const startBrace = candidate.indexOf("{");
    const endBrace = candidate.lastIndexOf("}");
    if (startBrace >= 0 && endBrace > startBrace) {
      return tryParse(candidate.slice(startBrace, endBrace + 1));
    }
    return null;
  };
  for (const candidate of candidates) {
    const result = extract(candidate);
    if (result) return result;
  }
  return null;
}

// ---------------------------------------------------------------------------
// 配音计划 / 时间轴
// ---------------------------------------------------------------------------

/** 需要配音的分段(voiceMode != none 且已产音频或待生成)。 */
export function dubPlan(segments: VoiceSegment[]): VoiceSegment[] {
  return segments.filter((segment) => segment.voiceMode !== "none");
}

/** 估算音频时长(中文 4 字/秒 ≈ 250ms/字)。 */
export function estimateSpeechDurationMs(text: string): number {
  const chars = Array.from(String(text || "").trim()).length;
  return Math.max(300, Math.round(chars * 250));
}

/**
 * 合成时间轴(纯计算,供渲染层预览与主进程拼接共用):
 *   基础轨(keep-original = 原音频 / dub-all = 静音)覆盖全长,
 *   各配音段按 startMs 覆盖在基础轨之上(与 ffmpeg amix + adelay 一致)。
 * dub-all 时基础轨末尾按 gapMs 补充静音。
 */
export function buildTimeline(
  segments: VoiceSegment[],
  options: { mixMode: "keep-original" | "dub-all"; gapMs: number; totalMs: number },
): ConcatSlot[] {
  const { mixMode, gapMs, totalMs } = options;
  const dubs = segments
    .filter((segment) => segment.voiceMode !== "none" && segment.audioPath)
    .sort((a, b) => a.startMs - b.startMs);
  if (dubs.length === 0) return [];
  const lastEndMs = dubs[dubs.length - 1]!.endMs;
  const baseDurationMs =
    mixMode === "keep-original" ? Math.max(totalMs, lastEndMs) : lastEndMs + gapMs;
  const slots: ConcatSlot[] = [
    {
      offsetMs: 0,
      durationMs: baseDurationMs,
      kind: mixMode === "keep-original" ? "original" : "silence",
      sourcePath: null,
    },
  ];
  for (const segment of dubs) {
    slots.push({
      offsetMs: segment.startMs,
      durationMs: segment.endMs - segment.startMs,
      kind: "dub",
      sourcePath: segment.audioPath,
    });
  }
  return slots;
}
