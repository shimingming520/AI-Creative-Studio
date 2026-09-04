/**
 * 剧本工作室 · 阶段1 — YUH 宿主桥 (window.serpent.host.sw.*)。
 * 在 hosted 模式下由 Serpent preload 暴露;独立运行 Serpent 时不可用。
 */
import { errorText } from "../replacement-studio/host";

export type SwProviderInfo = {
  id: string;
  name: string;
  baseUrl: string;
  enabled: boolean;
  hasApiKey: boolean;
  apiKeyMasked?: string;
  local?: boolean;
  defaultModels?: string[];
};

export type SwFilePick = {
  name: string;
  path: string;
  url: string;
  size: number;
};

export type SwGenerateRequest = {
  providerId: string;
  model: string;
  /** 系统提示词(由 shared/storyboard-script 构建)。 */
  system: string;
  /** 用户提示词(由 shared/storyboard-script 构建)。 */
  user: string;
};

export type SwGenerateResult = {
  text: string;
  model: string;
  providerId: string;
};

export type SwImageGenerateRequest = {
  providerId: string;
  model: string;
  prompt: string;
  size?: string;
  quality?: string;
  imageProtocol?: string;
  vectorArt?: boolean;
  references: { kind: "image"; path: string }[];
  /** 工作台项目归档子目录(相对输出根)，如「剧本工作室/<标题>」。 */
  projectSubdir?: string;
};

export type SwImageGenerateResult = {
  id: string;
  model: string;
  providerId: string;
  prompt: string;
  outputPath: string;
  outputUrl: string;
  revisedPrompt?: string;
  createdAt: string;
};

export type SwVideoGenerateRequest = {
  providerId: string;
  model: string;
  prompt: string;
  duration: number;
  ratio?: string;
  resolution?: string;
  references: { kind: "image" | "video" | "audio"; path: string }[];
  /** 工作台项目归档子目录(相对输出根)，如「剧本工作室/<标题>」。 */
  projectSubdir?: string;
};

export type SwVideoGenerateResult = {
  id: string;
  model: string;
  providerId: string;
  prompt: string;
  outputPath: string;
  outputUrl: string;
  createdAt: string;
};

export interface SwHostApi {
  isHosted(): boolean;
  listProviders(): Promise<SwProviderInfo[]>;
  listModels(providerId: string): Promise<{ models: string[]; error?: string }>;
  /** 调 YUH 中转站 chat 完成,返回原始文本(分镜 JSON 由前端解析)。 */
  generateScript(request: SwGenerateRequest): Promise<SwGenerateResult>;
  /** 写入输出目录下的 .txt 分镜表(UTF-8)。 */
  saveText(request: { name: string; content: string }): Promise<{ path: string }>;
  workspace(): Promise<{ outputDir: string; configured: boolean; remoteBackendUrl?: string }>;
  pickImages(multiple?: boolean): Promise<SwFilePick[]>;
  /** 参考图/镜头图片生成(云端图片通道)。 */
  generateImage(request: SwImageGenerateRequest): Promise<SwImageGenerateResult>;
  /** 镜头视频生成(云端视频通道)。 */
  generateVideo(request: SwVideoGenerateRequest): Promise<SwVideoGenerateResult>;
  thumbnail(path: string, width?: number): Promise<string | null>;
  showItem(path: string): Promise<unknown>;

  /** 确保本项目资源目录存在(输出根/剧本工作室/<项目id>),打开工作室即可建目录。 */
  ensureWorkbenchProjectDir(
    subdir: string,
  ): Promise<{ ok: boolean; dir?: string; error?: string }>;

  // --- 替换工作室联动 ---
  /** 读取替换工作室项目列表(用于按标题匹配后更新)。 */
  loadReplacementProjects(): Promise<{ projects: unknown[] } | unknown[] >;
  /** 保存替换工作室项目(rs:project-save)。 */
  saveReplacementProject(project: unknown): Promise<{ ok: boolean; error?: string }>;
  /** 切到替换工作室视图(YUH 侧完成显示 + openView 通知)。 */
  openReplacementStudio(): Promise<boolean>;
}

type SerpentWindow = Window & {
  serpent?: { host?: Record<string, unknown> };
};

function hostRef(): Record<string, unknown> | null {
  const host = (window as SerpentWindow).serpent?.host;
  return host && typeof host.onOpenView === "function" ? host : null;
}

export function swHostApi(): SwHostApi | null {
  const host = hostRef();
  if (!host) return null;
  const sw = host.sw as SwHostApi | undefined;
  const incomplete = {
    ...(sw ?? ({} as SwHostApi)),
    // isHosted 位于宿主桥顶层而非 host.sw；必须显式转发，否则
    // swHostApi() 会把已嵌入 YUH 的 Serpent 误判为独立运行。
    isHosted: host.isHosted as () => boolean,
    // 供应商与模型目录由宿主桥顶层提供；统一转发到剧本工作室 API，
    // 这样动态中转站目录同步不会因 sw 子桥未声明目录方法而变成空列表。
    listProviders: (host.listProviders as () => Promise<SwProviderInfo[]>)?.bind(host),
    listModels: (providerId: string) =>
      (host.listModels as (id: string) => Promise<{ models: string[]; error?: string }>)?.call(host, providerId) ??
      Promise.resolve({ models: [] }),
    // 与替换工作室共用的底层通道(host 顶层方法),按 SwHostApi 契约补齐。
    pickImages: (multiple?: boolean) =>
      (host.pickImages as (m?: boolean) => Promise<SwFilePick[]>)?.(multiple),
    generateImage: (request: SwImageGenerateRequest) =>
      (host.generateImage as (r: SwImageGenerateRequest) => Promise<SwImageGenerateResult>)?.(request),
    generateVideo: (request: SwVideoGenerateRequest) =>
      (host.generateVideo as (r: SwVideoGenerateRequest) => Promise<SwVideoGenerateResult>)?.(request),
    thumbnail: (path: string, width?: number) =>
      (host.thumbnail as (p: string, w?: number) => Promise<string | null>)?.(path, width),
    showItem: (path: string) =>
      (host.showItem as (p: string) => Promise<unknown>)?.(path),
    ensureWorkbenchProjectDir: (subdir: string) =>
      (host.ensureWorkbenchProjectDir as (s: string) => Promise<{ ok: boolean; dir?: string; error?: string }>)?.(subdir) ??
      Promise.resolve({ ok: false, error: "项目目录通道不可用" }),
    loadReplacementProjects: () =>
      (host.projectsLoad as () => Promise<unknown>)?.() ?? Promise.resolve([]),
    saveReplacementProject: (project: unknown) =>
      (host.projectSave as (p: unknown) => Promise<{ ok: boolean; error?: string }>)?.(project) ??
      Promise.resolve({ ok: false, error: "项目保存通道不可用" }),
    openReplacementStudio: () =>
      (host.openReplacementStudio as () => Promise<boolean>)?.() ?? Promise.resolve(false),
  };
  return typeof incomplete.isHosted === "function" ? (incomplete as SwHostApi) : null;
}

export function isHosted(): boolean {
  const api = swHostApi();
  return Boolean(api) && api!.isHosted();
}

/**
 * 获取宿主桥。YUH 嵌入 Serpent 时 preload 注入 window.serpent.host
 * 可能晚于 React 首次渲染，因此这里必须等待桥接完成，不能把竞态误报为
 * “独立运行”并让工作室退出。
 */
export async function ensureSwHostApi(timeoutMs = 15_000): Promise<SwHostApi> {
  const startedAt = Date.now();
  while (Date.now() - startedAt <= timeoutMs) {
    const api = swHostApi();
    if (api && api.isHosted()) return api;
    await new Promise<void>((resolve) => window.setTimeout(resolve, 50));
  }
  throw new Error("剧本工作室宿主桥未就绪，请确认 YUH Studio 正在运行后重试。");
}

export { errorText };
