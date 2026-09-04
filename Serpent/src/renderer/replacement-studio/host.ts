/**
 * 替换工作室 — YUH 宿主桥 (window.serpent.host)。
 * 在 hosted 模式下由 Serpent preload 暴露;独立运行 Serpent 时不可用。
 */
import type { RsProject } from "../../shared/replacement-studio";

export type RsFilePick = {
  name: string;
  path: string;
  url: string;
  size: number;
};

export type RsProviderInfo = {
  id: string;
  name: string;
  baseUrl: string;
  enabled: boolean;
  hasApiKey: boolean;
  apiKeyMasked?: string;
  local?: boolean;
  defaultModels?: string[];
};

export type RsWorkspaceInfo = {
  modelsDir?: string;
  outputDir: string;
  comfyuiDir?: string;
  configured: boolean;
  remoteBackendUrl?: string;
  useRemoteBackend?: boolean;
};

export type RsImageGenerateRequest = {
  providerId: string;
  model: string;
  prompt: string;
  size?: string;
  quality?: string;
  imageProtocol?: string;
  vectorArt?: boolean;
  references: { kind: "image"; path: string }[];
  /** 工作台项目归档子目录(相对输出根)，如「替换工作室/<项目id>」。 */
  projectSubdir?: string;
};

export type RsImageGenerateResult = {
  id: string;
  model: string;
  providerId: string;
  prompt: string;
  outputPath: string;
  outputUrl: string;
  revisedPrompt?: string;
  createdAt: string;
};

export type RsVideoGenerateRequest = {
  providerId: string;
  model: string;
  prompt: string;
  duration: number;
  ratio?: string;
  resolution?: string;
  references: { kind: "image" | "video" | "audio"; path: string }[];
  /** 工作台项目归档子目录(相对输出根)，如「替换工作室/<项目id>」。 */
  projectSubdir?: string;
};

export type RsVideoGenerateResult = {
  id: string;
  model: string;
  providerId: string;
  prompt: string;
  outputPath: string;
  outputUrl: string;
  createdAt: string;
};

export interface RsHostApi {
  isHosted(): boolean;
  onOpenView(callback: (viewId: string) => void): () => void;
  hide(): Promise<boolean>;

  /** 在 Electron 沙箱渲染器中解析用户选择的 File 对应的本地绝对路径。 */
  getPathForFile(file: unknown): string;

  // --- 项目持久化(YUH userData/serpent/replacement-studio) ---
  projectsLoad(): Promise<{ projects: RsProject[] }>;
  projectSave(project: RsProject): Promise<{ ok: boolean; error?: string }>;
  projectDelete(id: string): Promise<{ ok: boolean; error?: string }>;
  /** 确保本项目资源目录存在(输出根/替换工作室/<项目id>)。 */
  ensureWorkbenchProjectDir(
    subdir: string,
  ): Promise<{ ok: boolean; dir?: string; error?: string }>;

  // --- 文件 ---
  pickImages(multiple?: boolean): Promise<RsFilePick[]>;
  pickVideo(): Promise<RsFilePick[]>;
  pickFiles(): Promise<RsFilePick[]>;
  thumbnail(path: string, width?: number): Promise<string | null>;
  readImage(path: string): Promise<string>;
  saveDataImage(request: { dataUrl: string; name: string }): Promise<{ path: string }>;
  extractFrame(request: {
    file: string;
    outputDir: string;
    position?: "first" | "last";
  }): Promise<unknown>;

  // --- AI ---
  detectPeople(request: {
    providerId: string;
    model: string;
    prompt: string;
    imagePath: string;
  }): Promise<{ text: string }>;
  generateImage(request: RsImageGenerateRequest): Promise<RsImageGenerateResult>;
  generateVideo(request: RsVideoGenerateRequest): Promise<RsVideoGenerateResult>;

  // --- 配置 ---
  listProviders(): Promise<RsProviderInfo[]>;
  listModels(providerId: string): Promise<{ models: string[]; error?: string }>;
  workspace(): Promise<RsWorkspaceInfo>;

  // --- 系统 ---
  showItem(path: string): Promise<unknown>;
  openPath(path: string): Promise<unknown>;

  // --- v2:视频分析/合成链路 ---
  probe(request: {
    file: string;
  }): Promise<{ durationSec: number | null; width: number; height: number; isVideo: boolean }>;
  smartClip(request: {
    file: string;
    threshold?: number;
    minDuration?: number;
  }): Promise<{
    durationSec: number;
    shots: { startSec: number; endSec: number; durationSec: number; keyframeTimeSec: number }[];
  }>;
  extractFrameAt(request: { file: string; timeSec: number; outputDir?: string }): Promise<{ path: string }>;
  materializeShot(request: {
    file: string;
    startSec: number;
    durationSec: number;
    outputDir?: string;
    reverse?: boolean;
  }): Promise<{ path: string; durationSec: number }>;
  extractShotAudio(request: {
    file: string;
    startSec: number;
    durationSec: number;
    outputDir?: string;
  }): Promise<{ path: string; durationSec: number }>;
  transcribe(request: {
    audioPath: string;
    providerId: string;
    model?: string;
    language?: string;
  }): Promise<{ text: string; outputPath?: string | null }>;
  cloneVoice(request: {
    text: string;
    refAudioPath: string;
    lang?: string;
    outputDir?: string;
  }): Promise<{ outputPath: string }>;
  saveFileDialog(request: {
    title?: string;
    defaultName?: string;
    filters?: { name: string; extensions: string[] }[];
  }): Promise<string>;
  compose(request: {
    shots: { videoPath: string; durationSec: number; audioPath?: string | null }[];
    outputPath: string;
  }): Promise<{ outputPath: string }>;
}

type SerpentWindow = Window & {
  serpent?: { host?: RsHostApi; library?: unknown };
};

export function rsHostApi(): RsHostApi | null {
  const api = (window as SerpentWindow).serpent?.host;
  return api && typeof api.onOpenView === "function" ? api : null;
}

export function isHosted(): boolean {
  const api = rsHostApi();
  return Boolean(api) && api!.isHosted();
}

export async function ensureHostApi(): Promise<RsHostApi> {
  const api = rsHostApi();
  if (!api || !api.isHosted()) {
    throw new Error("替换工作室需要在 YUH Studio 中运行（资源管理宿主模式）。");
  }
  return api;
}

/** 从主进程错误对象里提取可读消息。 */
export function errorText(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  if (error && typeof error === "object") {
    const record = error as Record<string, unknown>;
    for (const key of ["message", "error", "reason", "text"]) {
      const value = record[key];
      if (typeof value === "string" && value.trim()) return value;
    }
  }
  return String(error ?? "未知错误");
}
