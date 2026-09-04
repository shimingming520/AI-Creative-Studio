declare module "../shuocanvas-legacy/src/modules/storyWorkspace/storyWorkspace.js" {
  export function initStoryWorkspace(options?: {
    documentObject?: Document;
    windowObject?: Window & Record<string, unknown>;
    requestWorkspaceMode?: (mode: string) => boolean;
    [key: string]: unknown;
  }): {
    activate?: (options?: { previousMode?: string }) => unknown;
    deactivate?: () => unknown;
    destroy?: () => void;
  } | null;
}
