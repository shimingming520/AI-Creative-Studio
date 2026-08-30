export interface BackendStatus {
  state?: string;
  status?: string;
  message?: string;
  [key: string]: unknown;
}

export interface SystemUsage {
  cpuPercent?: number;
  memoryPercent?: number;
  gpuPercent?: number;
  memoryUsedGb?: number;
  memoryTotalGb?: number;
  gpuName?: string;
  driverVersion?: string;
  vramUsedMb?: number;
  vramTotalMb?: number;
  vramPercent?: number;
  [key: string]: unknown;
}

export interface WorkspaceSettings {
  modelsDir?: string;
  outputDir?: string;
  comfyuiDir?: string;
  [key: string]: unknown;
}

export interface H3Api {
  backend: {
    status: () => Promise<BackendStatus>;
    start: () => Promise<unknown>;
    unloadGpu: () => Promise<unknown>;
    onStatus: (callback: (status: BackendStatus) => void) => () => void;
    onLog: (callback: (line: string) => void) => () => void;
  };
  system: {
    usage: () => Promise<SystemUsage>;
  };
  workspace: {
    get: () => Promise<WorkspaceSettings>;
  };
}
