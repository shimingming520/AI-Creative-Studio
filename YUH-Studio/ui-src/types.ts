export interface BackendStatus {
  state?: string;
  status?: string;
  message?: string;
  modelsDir?: string;
  comfyuiDir?: string;
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
  configured?: boolean;
  [key: string]: unknown;
}

export interface SerpentStatus {
  enabled?: boolean;
  servicesStarted?: boolean;
  rendererReady?: boolean;
  visible?: boolean;
  error?: string | null;
  [key: string]: unknown;
}

export interface WorkflowListItem {
  path: string;
  relName: string;
  mtimeMs: number;
  size: number;
  format?: "ui" | "api" | "unknown" | "invalid";
  nodeCount?: number;
  nodeTypes?: string[];
  error?: string;
}

export interface WorkflowLibrary {
  root: string;
  items: WorkflowListItem[];
}

export interface WorkflowSlotCandidate {
  nodeId: string;
  input: string;
  label: string;
}

export interface WorkflowModelSlot {
  nodeId: string;
  input: string;
  nodeClass: string;
  nodeTitle: string;
  value: string;
  folderGuess: string;
}

export interface WorkflowFileSlot {
  nodeId: string;
  input: string;
  nodeClass: string;
  nodeTitle: string;
  kind: string;
  value: string;
}

export interface WorkflowOutputNode {
  nodeId: string;
  classType: string;
  title: string;
  filenamePrefix: string;
}

export interface WorkflowInspect {
  path: string;
  format: string;
  nodeCount: number;
  skippedNodes: number;
  warnings: string[];
  nodeTypes: string[];
  slots: Record<string, WorkflowSlotCandidate[]>;
  slotValues: Record<string, string | number | boolean | undefined>;
  modelSlots: WorkflowModelSlot[];
  fileSlots: WorkflowFileSlot[];
  outputNodes: WorkflowOutputNode[];
}

export interface WorkflowValidationModel {
  nodeId: string;
  input: string;
  nodeTitle: string;
  value: string;
  found: boolean;
  folder: string;
  candidates: string[];
}

export interface WorkflowValidation {
  path: string;
  backendReachable: boolean;
  nodeIssues: { classType: string; message: string }[];
  modelSlots: WorkflowValidationModel[];
}

export interface WorkflowRunRequest {
  path: string;
  prompt?: string;
  width?: number;
  height?: number;
  length?: number;
  steps?: number;
  cfg?: number;
  fps?: number;
  seed?: number;
  randomizeSeed?: boolean;
  duration?: number;
  modelFiles?: Record<string, string>;
  files?: { path: string; kind?: string }[];
}

export interface TaskItem {
  id: string;
  kind?: string;
  status?: string;
  progress?: number;
  error?: string;
  outputUrl?: string;
  outputPaths?: string[];
  workflowName?: string;
  prompt?: string;
  createdAt?: string;
  updatedAt?: string;
  width?: number;
  height?: number;
  duration?: number;
  seed?: number;
  [key: string]: unknown;
}

export interface TaskListResponse {
  items: TaskItem[];
}

export interface H3Api {
  backend: {
    status: () => Promise<BackendStatus>;
    start: () => Promise<unknown>;
    restart: () => Promise<unknown>;
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
  serpent: {
    status: () => Promise<SerpentStatus>;
    toggle: () => Promise<unknown>;
    show: () => Promise<unknown>;
    hide: () => Promise<unknown>;
    reportLayout: (layout: { railWidth: number; bodyTop?: number }) => Promise<unknown>;
    onStatus: (callback: (state: SerpentStatus) => void) => () => void;
  };
  files: {
    pick: (kind: string) => Promise<{ path: string; name?: string; kind?: string; url?: string }[]>;
  };
  tasks: {
    list: () => Promise<TaskListResponse | TaskItem[]>;
    onUpdate: (callback: (task: TaskItem) => void) => () => void;
  };
  workflows: {
    list: () => Promise<WorkflowLibrary>;
    inspect: (filePath: string) => Promise<WorkflowInspect>;
    validate: (filePath: string) => Promise<WorkflowValidation>;
    run: (request: WorkflowRunRequest) => Promise<TaskItem>;
    cancel: (taskId: string) => Promise<boolean>;
  };
}
