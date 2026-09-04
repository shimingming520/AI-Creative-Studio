/**
 * 媒体工具(轻量工具坊)— YUH 宿主桥 (window.serpent.host.mt.*)。
 * 复用 YUH 主进程既有 utilities:* 能力(切片/拼接/批注保存)。
 */
import type { NormalizedRect } from "../../shared/media-tools";

export type MtFilePick = {
  name: string;
  path: string;
  url: string;
  size: number;
};

export type MtToolResult = {
  success: boolean;
  outputPaths: string[];
  message?: string;
};

export interface MtHostApi {
  isHosted(): boolean;
  pickImages(multiple?: boolean): Promise<MtFilePick[]>;
  thumbnail(path: string, width?: number): Promise<string | null>;
  workspace(): Promise<{ outputDir: string; configured: boolean }>;
  /** 宫格拆分:按 rows×cols 将图片切成块(输出到 outputDir);indexes 只导出选中单元。 */
  splitGrid(request: {
    file: string;
    rows: number;
    cols: number;
    format?: "png" | "jpg" | "webp";
    outputDir?: string;
    /** 单元格序号(0-based,row*cols+col);缺省导出全部。 */
    indexes?: number[];
  }): Promise<MtToolResult>;
  /** 拼图:两张图拼接(横排/竖排)。 */
  stitchGrid(request: {
    first: string;
    second: string;
    direction: "horizontal" | "vertical";
    cropSecond?: "auto" | "manual";
    cropRegion?: NormalizedRect;
    outputDir?: string;
  }): Promise<MtToolResult>;
  /** 多图拼图:2 图按 direction,3+ 自动近方形网格布局。 */
  collage(request: {
    files: string[];
    direction?: "horizontal" | "vertical";
    format?: "png" | "jpg" | "webp";
    outputDir?: string;
  }): Promise<MtToolResult>;
  /** 白板/批注导出保存(png)。 */
  saveAnnotation(request: {
    dataUrl: string;
    sourceName: string;
    outputDir?: string;
  }): Promise<MtToolResult>;
  showItem(path: string): Promise<unknown>;
}

type SerpentWindow = Window & {
  serpent?: { host?: Record<string, unknown> };
};

function hostRef(): Record<string, unknown> | null {
  const host = (window as SerpentWindow).serpent?.host;
  return host && typeof host.onOpenView === "function" ? host : null;
}

export function mtHostApi(): MtHostApi | null {
  const host = hostRef();
  if (!host) return null;
  const mt = host.mt as MtHostApi | undefined;
  return mt && typeof mt.isHosted === "function" ? mt : null;
}

export function isHosted(): boolean {
  const api = mtHostApi();
  return Boolean(api) && api!.isHosted();
}

export async function ensureMtHostApi(): Promise<MtHostApi> {
  const api = mtHostApi();
  if (!api || !api.isHosted()) {
    throw new Error("媒体工具需要在 YUH Studio 中运行（资源管理宿主模式）。");
  }
  return api;
}
