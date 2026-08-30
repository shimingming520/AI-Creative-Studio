"use strict";
const electron = require("electron");
const api = {
  backend: {
    status: () => electron.ipcRenderer.invoke("backend:status"),
    start: () => electron.ipcRenderer.invoke("backend:start"),
    restart: () => electron.ipcRenderer.invoke("backend:restart"),
    unloadGpu: () =>
      electron.ipcRenderer
        .invoke("backend:unload-gpu")
        .then(() => ({ ok: true })),
    onStatus: (callback) => {
      const listener = (_event, status) => callback(status);
      electron.ipcRenderer.on("backend:status-changed", listener);
      return () =>
        electron.ipcRenderer.removeListener("backend:status-changed", listener);
    },
    onLog: (callback) => {
      const listener = (_event, line) => callback(line);
      electron.ipcRenderer.on("backend:log", listener);
      return () => electron.ipcRenderer.removeListener("backend:log", listener);
    },
  },
  visionReverse: {
    status: () => electron.ipcRenderer.invoke("vision-reverse:status"),
    saveSettings: (input) =>
      electron.ipcRenderer.invoke("vision-reverse:save-settings", input),
    loadTemplates: () =>
      electron.ipcRenderer.invoke("vision-reverse:load-templates"),
    saveTemplates: (input) =>
      electron.ipcRenderer.invoke("vision-reverse:save-templates", input),
    start: (input) =>
      electron.ipcRenderer.invoke("vision-reverse:start", input),
    stop: () => electron.ipcRenderer.invoke("vision-reverse:stop"),
    run: (request) =>
      electron.ipcRenderer.invoke("vision-reverse:run", request),
    saveCaption: (request) =>
      electron.ipcRenderer.invoke("vision-reverse:save-caption", request),
    cancel: (requestId) =>
      electron.ipcRenderer.invoke("vision-reverse:cancel", requestId),
    searchModels: (query, source) =>
      electron.ipcRenderer.invoke(
        "vision-reverse:search-models",
        query,
        source,
      ),
    listModelFiles: (repoId, source) =>
      electron.ipcRenderer.invoke(
        "vision-reverse:list-model-files",
        repoId,
        source,
      ),
    downloadModel: (request) =>
      electron.ipcRenderer.invoke("vision-reverse:download-model", request),
    cancelDownload: (downloadId) =>
      electron.ipcRenderer.invoke("vision-reverse:cancel-download", downloadId),
    onDownloadProgress: (callback) => {
      const listener = (_event, progress) => callback(progress);
      electron.ipcRenderer.on("vision-reverse:download-progress", listener);
      return () =>
        electron.ipcRenderer.removeListener(
          "vision-reverse:download-progress",
          listener,
        );
    },
    onLog: (callback) => {
      const listener = (_event, line) => callback(line);
      electron.ipcRenderer.on("vision-reverse:log", listener);
      return () => {
        electron.ipcRenderer.removeListener("vision-reverse:log", listener);
      };
    },
  },
  textWorkbench: {
    pickFiles: () => electron.ipcRenderer.invoke("text-workbench:pick-files"),
    exportWord: (request) =>
      electron.ipcRenderer.invoke("text-workbench:export-word", request),
    localProofread: (prompt) =>
      electron.ipcRenderer.invoke("text-workbench:local-proofread", prompt),
  },
  files: {
    pick: (kind) => electron.ipcRenderer.invoke("files:pick", kind),
    resolve: (paths) => electron.ipcRenderer.invoke("files:resolve", paths),
    thumbnail: (filePath, width) =>
      electron.ipcRenderer.invoke("files:thumbnail", filePath, width),
    getPathForFile: (file) => electron.webUtils.getPathForFile(file),
    copyImage: (filePath) =>
      electron.ipcRenderer.invoke("files:copy-image", filePath),
    copyImages: (filePaths) =>
      electron.ipcRenderer.invoke("files:copy-images", filePaths),
    readClipboardImage: () =>
      electron.ipcRenderer.invoke("files:read-clipboard-image"),
    readClipboardFiles: () =>
      electron.ipcRenderer.invoke("files:read-clipboard-files"),
    readClipboardAll: () =>
      electron.ipcRenderer.invoke("files:read-clipboard-all"),
    readAsDataUrl: (filePath) =>
      electron.ipcRenderer.invoke("files:read-as-data-url", filePath),
    copyToDirectory: (paths, outputDir) =>
      electron.ipcRenderer.invoke("files:copy-to-directory", paths, outputDir),
    trash: (paths) => electron.ipcRenderer.invoke("files:trash", paths),
    /** 扫描音频库目录：一级子文件夹名即分类（BGM/SFX…），返回分类与文件列表 */
    listAudioLibrary: (rootDir) =>
      electron.ipcRenderer.invoke("files:list-audio-library", rootDir),
    /** 把一组文件打包复制到桌面新文件夹并打开资源管理器定位 */
    downloadToDesktop: (files, folderName) =>
      electron.ipcRenderer.invoke(
        "files:download-to-desktop",
        files,
        folderName,
      ),
  },
  workspace: {
    get: () => electron.ipcRenderer.invoke("workspace:get"),
    save: (input) => electron.ipcRenderer.invoke("workspace:save", input),
    pickDirectory: (kind, currentPath) =>
      electron.ipcRenderer.invoke(
        "workspace:pick-directory",
        kind,
        currentPath,
      ),
  },
  storage: {
    scanOutputs: () => electron.ipcRenderer.invoke("storage:scan-outputs"),
    trashOutputs: (selection) =>
      electron.ipcRenderer.invoke("storage:trash-outputs", selection),
    listCanvasProjects: () =>
      electron.ipcRenderer.invoke("storage:list-canvas-projects"),
    listCanvasBackups: () =>
      electron.ipcRenderer.invoke("storage:list-canvas-backups"),
    restoreCanvasBackup: (fileName) =>
      electron.ipcRenderer.invoke("storage:restore-canvas-backup", fileName),
  },
  appLifecycle: {
    getCloseBehavior: () =>
      electron.ipcRenderer.invoke("app-lifecycle:get-close-behavior"),
    setCloseBehavior: (behavior) =>
      electron.ipcRenderer.invoke("app-lifecycle:set-close-behavior", behavior),
  },
  tasks: {
    create: (request) => electron.ipcRenderer.invoke("tasks:create", request),
    createImage: (request) =>
      electron.ipcRenderer.invoke("tasks:create-image", request),
    list: () => electron.ipcRenderer.invoke("tasks:list"),
    interrupt: () => electron.ipcRenderer.invoke("tasks:interrupt"),
    cancel: (taskId) => electron.ipcRenderer.invoke("tasks:cancel", taskId),
    prepareMode: (mode) =>
      electron.ipcRenderer.invoke("tasks:prepare-mode", mode),
    onUpdate: (callback) => {
      const listener = (_event, task) => callback(task);
      electron.ipcRenderer.on("tasks:update", listener);
      return () =>
        electron.ipcRenderer.removeListener("tasks:update", listener);
    },
  },
  providers: {
    list: () => electron.ipcRenderer.invoke("providers:list"),
    save: (input) => electron.ipcRenderer.invoke("providers:save", input),
    remove: (id) => electron.ipcRenderer.invoke("providers:remove", id),
    models: (id) => electron.ipcRenderer.invoke("providers:models", id),
  },
  vectorizerAi: {
    getSettings: () =>
      electron.ipcRenderer.invoke("vectorizer-ai:get-settings"),
    saveSettings: (input) =>
      electron.ipcRenderer.invoke("vectorizer-ai:save-settings", input),
    testConnection: () =>
      electron.ipcRenderer.invoke("vectorizer-ai:test-connection"),
    getCredit: () => electron.ipcRenderer.invoke("vectorizer-ai:get-credit"),
    recharge: (request) =>
      electron.ipcRenderer.invoke("vectorizer-ai:recharge", request),
    cancel: (requestId) =>
      electron.ipcRenderer.invoke("vectorizer-ai:cancel", requestId),
    vectorize: (request) =>
      electron.ipcRenderer.invoke("vectorizer-ai:vectorize", request),
  },
  cloudImages: {
    generate: (request) =>
      electron.ipcRenderer.invoke("cloud-images:generate", request),
  },
  cloudAudios: {
    generate: (request) =>
      electron.ipcRenderer.invoke("cloud-audios:generate", request),
    transcribe: (request) =>
      electron.ipcRenderer.invoke("cloud-audios:transcribe", request),
  },
  cloudVideos: {
    generate: (request) =>
      electron.ipcRenderer.invoke("cloud-videos:generate", request),
  },
  runninghub: {
    run: (request) => electron.ipcRenderer.invoke("runninghub:run", request),
    cancel: (requestId) =>
      electron.ipcRenderer.invoke("runninghub:cancel", requestId),
  },
  localComfy: {
    run: (request) => electron.ipcRenderer.invoke("local-comfy:run", request),
    cancel: (requestId) =>
      electron.ipcRenderer.invoke("local-comfy:cancel", requestId),
  },
  tts: {
    status: () => electron.ipcRenderer.invoke("tts:status"),
    start: () => electron.ipcRenderer.invoke("tts:start"),
    stop: () => electron.ipcRenderer.invoke("tts:stop"),
    unload: () => electron.ipcRenderer.invoke("tts:unload"),
    voiceDesign: (request) =>
      electron.ipcRenderer.invoke("tts:voice_design", request),
    onLog: (callback) => {
      const listener = (_event, line) => callback(line);
      electron.ipcRenderer.on("tts:log", listener);
      return () => electron.ipcRenderer.removeListener("tts:log", listener);
    },
  },
  indexTts: {
    status: () => electron.ipcRenderer.invoke("indextts:status"),
    start: () => electron.ipcRenderer.invoke("indextts:start"),
    stop: () => electron.ipcRenderer.invoke("indextts:stop"),
    unload: () => electron.ipcRenderer.invoke("indextts:unload"),
    clone: (request) => electron.ipcRenderer.invoke("indextts:clone", request),
    onLog: (callback) => {
      const listener = (_event, line) => callback(line);
      electron.ipcRenderer.on("indextts:log", listener);
      return () =>
        electron.ipcRenderer.removeListener("indextts:log", listener);
    },
  },
  chat: {
    send: (request) => electron.ipcRenderer.invoke("chat:send", request),
    loadSessions: () => electron.ipcRenderer.invoke("chat:load-sessions"),
    saveSession: (session) =>
      electron.ipcRenderer.invoke("chat:save-session", session),
    deleteSession: (id) =>
      electron.ipcRenderer.invoke("chat:delete-session", id),
    savePath: () => electron.ipcRenderer.invoke("chat:save-path"),
  },
  utilities: {
    pickImages: (multiple = true) =>
      electron.ipcRenderer.invoke("utilities:pick-images", multiple),
    pickFiles: () => electron.ipcRenderer.invoke("utilities:pick-files"),
    pickVideo: () => electron.ipcRenderer.invoke("utilities:pick-video"),
    pickDirectory: (currentPath) =>
      electron.ipcRenderer.invoke("utilities:pick-directory", currentPath),
    pickImagesFromDirectory: (currentPath) =>
      electron.ipcRenderer.invoke(
        "utilities:pick-images-from-directory",
        currentPath,
      ),
    pickVideosFromDirectory: (currentPath) =>
      electron.ipcRenderer.invoke(
        "utilities:pick-videos-from-directory",
        currentPath,
      ),
    convert: (request) =>
      electron.ipcRenderer.invoke("utilities:convert", request),
    rename: (request) =>
      electron.ipcRenderer.invoke("utilities:rename", request),
    similarityRename: (request) =>
      electron.ipcRenderer.invoke("utilities:similarity-rename", request),
    txtBatch: (request) =>
      electron.ipcRenderer.invoke("utilities:txt-batch", request),
    split: (request) => electron.ipcRenderer.invoke("utilities:split", request),
    slice: (request) => electron.ipcRenderer.invoke("utilities:slice", request),
    stitch: (request) =>
      electron.ipcRenderer.invoke("utilities:stitch", request),
    mosaic: (request) =>
      electron.ipcRenderer.invoke("utilities:mosaic", request),
    manualMosaic: (request) =>
      electron.ipcRenderer.invoke("utilities:manual-mosaic", request),
    motion: (request) =>
      electron.ipcRenderer.invoke("utilities:motion", request),
    canvasCrop: (request) =>
      electron.ipcRenderer.invoke("utilities:canvas-crop", request),
    canvasAnnotation: (request) =>
      electron.ipcRenderer.invoke("utilities:canvas-annotation", request),
    canvasThumbnail: (request) =>
      electron.ipcRenderer.invoke("utilities:canvas-thumbnail", request),
    upscale: (request) =>
      electron.ipcRenderer.invoke("utilities:upscale", request),
    extractAudio: (request) =>
      electron.ipcRenderer.invoke("utilities:extract-audio", request),
    trimAudio: (request) =>
      electron.ipcRenderer.invoke("utilities:trim-audio", request),
    mergeVideos: (request) =>
      electron.ipcRenderer.invoke("utilities:merge-videos", request),
    extractVideoFrame: (request) =>
      electron.ipcRenderer.invoke("utilities:extract-frame", request),
    vectorize: (request) =>
      electron.ipcRenderer.invoke("utilities:vectorize", request),
    motionPresets: () =>
      electron.ipcRenderer.invoke("utilities:motion-presets"),
  },
  editor: {
    videoMeta: (path) => electron.ipcRenderer.invoke("editor:video-meta", path),
    thumbnails: (request) =>
      electron.ipcRenderer.invoke("editor:thumbnails", request),
    render: (request) => electron.ipcRenderer.invoke("editor:render", request),
    onRenderProgress: (callback) => {
      const listener = (_event, progress) => callback(progress);
      electron.ipcRenderer.on("editor:render-progress", listener);
      return () =>
        electron.ipcRenderer.removeListener("editor:render-progress", listener);
    },
  },
  system: {
    usage: () => electron.ipcRenderer.invoke("system:usage"),
    toggleDevTools: () => electron.ipcRenderer.invoke("system:toggle-devtools"),
    appIcon: (theme) => electron.ipcRenderer.invoke("system:app-icon", theme),
  },
  window: {
    setTheme: (theme) => electron.ipcRenderer.invoke("window:set-theme", theme),
  },
  shell: {
    openPath: (path) => electron.ipcRenderer.invoke("shell:open-path", path),
    showItem: (path) => electron.ipcRenderer.invoke("shell:show-item", path),
    saveItem: (path) => electron.ipcRenderer.invoke("shell:save-item", path),
  },
  canvas: {
    loadProjects: () => electron.ipcRenderer.invoke("canvas:load-projects"),
    saveProjects: (projects) =>
      electron.ipcRenderer.invoke("canvas:save-projects", projects),
    loadDramaSession: () =>
      electron.ipcRenderer.invoke("canvas:load-drama-session"),
    loadDramaSessionV2: () =>
      electron.ipcRenderer.invoke("canvas:load-drama-session-v2"),
    saveDramaSession: (session) =>
      electron.ipcRenderer.invoke("canvas:save-drama-session", session),
    saveDramaSessionCas: (request) =>
      electron.ipcRenderer.invoke("canvas:save-drama-session-cas", request),
    exportWorkflow: (name, data) =>
      electron.ipcRenderer.invoke("canvas:export-workflow", name, data),
    importWorkflow: () => electron.ipcRenderer.invoke("canvas:import-workflow"),
    exportWorkflowZip: (name, data) =>
      electron.ipcRenderer.invoke("canvas:export-workflow-zip", name, data),
    importWorkflowZip: () =>
      electron.ipcRenderer.invoke("canvas:import-workflow-zip"),
    importSkill: () => electron.ipcRenderer.invoke("canvas:import-skill"),
    saveClipboardImage: (request) =>
      electron.ipcRenderer.invoke("canvas:save-clipboard-image", request),
    saveDesignSource: (request) =>
      electron.ipcRenderer.invoke("canvas:save-design-source", request),
    exportDesignAsset: (request) =>
      electron.ipcRenderer.invoke("canvas:export-design-asset", request),
    imageTool: (request) =>
      electron.ipcRenderer.invoke("canvas:image-tool", request),
  },
  sharing: {
    isWebMode: () => false,
    start: (port) => electron.ipcRenderer.invoke("sharing:start", port),
    stop: () => electron.ipcRenderer.invoke("sharing:stop"),
    status: () => electron.ipcRenderer.invoke("sharing:status"),
    broadcastCanvas: (project) =>
      electron.ipcRenderer.invoke("sharing:broadcast-canvas", project),
    // 桌面端删除共享画布走整包保存（canvas:save-projects）自动移除；此方法供类型兼容，Web 端由 web-bridge 实现真正删除
    deleteSharedCanvas: (_projectId) => Promise.resolve(false),
    onRemoteUpdate: (cb) => {
      const handler = (_event, project) => cb(project);
      electron.ipcRenderer.on("canvas:remote-update", handler);
      return () =>
        electron.ipcRenderer.removeListener("canvas:remote-update", handler);
    },
    onCanvasSync: (_cb) => () => void 0,
  },
  autostart: {
    get: () => electron.ipcRenderer.invoke("autostart:get"),
    set: (data) => electron.ipcRenderer.invoke("autostart:set", data),
  },
};
electron.contextBridge.exposeInMainWorld("h3", api);
