/**
 * 语音工作室 — YUH 宿主桥 (window.serpent.host.vs.*)。
 * 复用 YUH 既有能力:whisper 转写(verbose_json 分段)、IndexTTS 克隆、
 * TTS 音色设计、ffmpeg 合成抽音;翻译走中转站 chat。
 */
export type VsProviderInfo = {
  id: string;
  name: string;
  baseUrl: string;
  enabled: boolean;
  hasApiKey: boolean;
  apiKeyMasked?: string;
  local?: boolean;
  defaultModels?: string[];
};

export type VsFilePick = {
  name: string;
  path: string;
  url: string;
  size: number;
};

export type VsEngineStatus = {
  tts: Record<string, unknown> | null;
  indextts: Record<string, unknown> | null;
};

export type VsTranscribeResult = {
  text: string;
  format: string;
  outputPath: string;
  segments?: { start: number; end: number; text: string }[];
};

export type VsDubbedSegmentInput = {
  id: string;
  startMs: number;
  endMs: number;
  audioPath: string;
};

export interface VsHostApi {
  isHosted(): boolean;
  listProviders(): Promise<VsProviderInfo[]>;
  listModels(providerId: string): Promise<{ models: string[]; error?: string }>;
  pickFiles(): Promise<VsFilePick[]>;
  pickVideo(): Promise<VsFilePick[]>;
  /** 引擎状态(IndexTTS / TTS 是否可用、模型是否加载)。 */
  engines(): Promise<VsEngineStatus>;
  /** 视频 → 音频(wav)。 */
  extractAudio(request: { file: string; outputDir?: string }): Promise<{ path: string }>;
  /** 转写(whisper verbose_json,返回分段)。 */
  transcribe(request: {
    file: string;
    providerId: string;
    model?: string;
    language?: string;
  }): Promise<VsTranscribeResult>;
  /** IndexTTS 音色克隆。 */
  cloneVoice(request: {
    text: string;
    refAudioPath: string;
    lang?: string;
    outputDir?: string;
  }): Promise<{ outputPath: string }>;
  /** TTS 音色设计(按描述生成音色)。 */
  designVoice(request: {
    text: string;
    design: string;
    lang?: string;
    outputDir?: string;
  }): Promise<{ outputPath: string }>;
  /** 翻译(中转站 chat)。 */
  translate(request: {
    providerId: string;
    model: string;
    system: string;
    user: string;
  }): Promise<{ text: string }>;
  /** 合成:基础轨 + 配音覆盖(amix + adelay)。 */
  concatAudio(request: {
    segments: VsDubbedSegmentInput[];
    basePath: string | null;
    mixMode: "keep-original" | "dub-all";
    totalMs: number;
    outputDir?: string;
  }): Promise<{ outputPath: string; durationMs: number }>;
  /** 成片导出:视频 × 音频 → 最终 mp4(音轨替换/补齐)。 */
  muxVideo(request: {
    videoPath: string;
    audioPath: string;
    outputDir?: string;
    syncToVideo?: boolean;
    videoCodec?: string;
    audioBitrate?: string;
  }): Promise<{ outputPath: string }>;
  /** 读取文件为 dataURL(音频预览)。 */
  readFile(path: string): Promise<string>;
  showItem(path: string): Promise<unknown>;
}

type SerpentWindow = Window & {
  serpent?: { host?: Record<string, unknown> };
};

function hostRef(): Record<string, unknown> | null {
  const host = (window as SerpentWindow).serpent?.host;
  return host && typeof host.onOpenView === "function" ? host : null;
}

export function vsHostApi(): VsHostApi | null {
  const host = hostRef();
  if (!host) return null;
  const vs = host.vs as Partial<VsHostApi> | undefined;
  if (!vs || typeof vs.isHosted !== "function") return null;
  return {
    ...(vs as VsHostApi),
    // 与替换工作室共用的底层通道。
    listProviders: (host.listProviders as VsHostApi["listProviders"])?.bind(host) ??
      vs.listProviders!,
    pickFiles: (host.pickFiles as VsHostApi["pickFiles"])?.bind(host) ?? vs.pickFiles!,
    pickVideo: (host.pickVideo as VsHostApi["pickVideo"])?.bind(host) ?? vs.pickVideo!,
    readFile: (path: string) =>
      (host.readImage as (p: string) => Promise<string>)?.call(host, path) ??
      Promise.resolve(""),
    showItem: (path: string) =>
      (host.showItem as (p: string) => Promise<unknown>)?.call(host, path) ??
      Promise.resolve(false),
    muxVideo: (request) => {
      const pp = host.pp as { muxVideo?: (r: unknown) => Promise<{ outputPath: string }> } | undefined;
      if (!pp?.muxVideo) {
        return Promise.reject(new Error("成片导出通道不可用(缺少 pp:mux-video)"));
      }
      return pp.muxVideo(request);
    },
  };
}

export async function ensureVsHostApi(): Promise<VsHostApi> {
  const api = vsHostApi();
  if (!api || !api.isHosted()) {
    throw new Error("语音工作室需要在 YUH Studio 中运行（资源管理宿主模式）。");
  }
  return api;
}
