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

  // --- 项目持久化(YUH userData/serpent/replacement-studio) ---
  projectsLoad(): Promise<{ projects: RsProject[] }>;
  projectSave(project: RsProject): Promise<{ ok: boolean; error?: string }>;
  projectDelete(id: string): Promise<{ ok: boolean; error?: string }>;

  // --- 文件 ---
  pickImages(multiple?: boolean): Promise<RsFilePick[]>;
  pickVideo(): Promise<RsFilePick[]>;
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
