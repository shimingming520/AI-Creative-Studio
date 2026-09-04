import { useEffect, useRef } from "react";
import { createReplacementStudioApplication } from "./OriginalReplacementBridge";
import { ensureHostApi } from "./host";
import { syncHostedProviderModelCatalog } from "../shuocanvas-legacy/src/modules/hostedProviderModelCatalog.js";
import "../shuocanvas-legacy/style.css";
import "../shuocanvas-legacy/styles/agent.css";
import "./original-replacement-host.css";

/**
 * 原始 ShuoCanvas 替换工作室挂载层。
 * React 只负责侧边栏生命周期，工作室内部完全由原始 DOM/状态机渲染。
 */
export function OriginalReplacementWorkspace({
  onExit,
  onActiveWorkbenchProject,
}: {
  onExit: () => void;
  onActiveWorkbenchProject?: (project: {
    studio: string;
    slug: string;
    projectId: string;
    title: string;
  }) => void;
}) {
  const hostRef = useRef<HTMLElement | null>(null);
  const appRef = useRef<any>(null);
  const onExitRef = useRef(onExit);
  const onActiveWorkbenchProjectRef = useRef(onActiveWorkbenchProject);
  onExitRef.current = onExit;
  onActiveWorkbenchProjectRef.current = onActiveWorkbenchProject;

  const nativeMediaPath = (value: any): string => {
    const candidate = typeof value === "string"
      ? value
      : value?.path || value?.localPath || value?.displayLocalPath || value?.file || value?.url || "";
    const text = String(candidate || "").trim();
    if (/^[a-zA-Z]:[\\/]/.test(text) || text.startsWith("\\\\")) return text;
    if (/^file:\/\//i.test(text)) {
      try {
        const pathname = decodeURIComponent(new URL(text).pathname).replace(/^\/+/, "");
        return /^[a-zA-Z]:\//.test(pathname) ? pathname.replace(/\//g, "\\") : pathname;
      } catch {}
    }
    return text;
  };

  useEffect(() => {
    let disposed = false;
    let projectTimer: number | null = null;
    let providerRefreshTimer: number | null = null;
    let providerChangeListener: (() => void) | null = null;
    let providerRefreshInFlight = false;
    let providerSignature = "";
    const hostNode = hostRef.current;
    if (!hostNode) return;
    const mount = document.createElement("div");
    mount.id = "v2-wrap";
    mount.className = "original-replacement-mount theme-dark canvas-theme-dark";
    hostNode.appendChild(mount);

    // ShuoCanvas 的替换工作室始终使用深色主题。YUH 主界面允许跟随系统，
    // 在 Windows 浅色模式下会把 html[data-theme] 设为 light，导致整个
    // 原始工作室变成白色；这里在工作室生命周期内锁定深色，并在宿主主题
    // effect 后再次写回，退出时恢复原值。
    const root = document.documentElement;
    const body = document.body;
    const previousRootTheme = root.getAttribute("data-theme");
    const previousRootColorScheme = root.style.colorScheme;
    const previousBodyTheme = body?.getAttribute("data-theme");
    const forceDarkTheme = () => {
      if (root.getAttribute("data-theme") !== "dark") root.setAttribute("data-theme", "dark");
      root.style.colorScheme = "dark";
      if (body && body.getAttribute("data-theme") !== "dark") body.setAttribute("data-theme", "dark");
      mount.classList.add("theme-dark", "canvas-theme-dark");
      mount.classList.remove("theme-light", "canvas-theme-light");
    };
    forceDarkTheme();
    const themeObserver = new MutationObserver(forceDarkTheme);
    themeObserver.observe(root, { attributes: true, attributeFilter: ["data-theme", "class"] });
    themeObserver.observe(mount, { attributes: true, attributeFilter: ["class", "data-theme"] });

    void (async () => {
      const host = await ensureHostApi().catch(() => null);
      if (disposed) return;
      // 先把 YUH 设置中可用的自定义中转模型注入原始 ShuoCanvas manifest，
      // 再创建工作室，这样原始同步菜单会直接显示动态供应商分组。
      try {
        await syncHostedProviderModelCatalog(host);
      } catch {
        // 模型发现失败不应阻断工作室启动；原有固定供应商仍可正常显示。
      }
      if (host) {
        const readProviderSignature = async () => {
          try {
            const providers = await host.listProviders();
            return (Array.isArray(providers) ? providers : [])
              .map((provider: any) => [
                String(provider?.id || ""),
                String(provider?.name || ""),
                String(provider?.baseUrl || ""),
                String(provider?.enabled !== false),
                String(provider?.hasApiKey === true),
              ].join("\u001f"))
              .sort()
              .join("\u001e");
          } catch {
            return "";
          }
        };
        providerSignature = await readProviderSignature();
        const refreshProviderCatalog = async () => {
          if (disposed || providerRefreshInFlight) return;
          providerRefreshInFlight = true;
          try {
            const nextSignature = await readProviderSignature();
            if (!nextSignature || nextSignature === providerSignature) return;
            providerSignature = nextSignature;
            await syncHostedProviderModelCatalog(host);
            if (!disposed) appRef.current?.refresh?.();
          } catch {
            // 配置刷新失败不应破坏当前已打开的工作室。
          } finally {
            providerRefreshInFlight = false;
          }
        };
        providerChangeListener = () => { void refreshProviderCatalog(); };
        window.addEventListener("yuh:providers-changed", providerChangeListener);
        // 设置页与替换工作室可能位于不同 Electron 窗口，DOM 事件不会跨窗口传播；
        // 轻量轮询配置签名，确保保存中转站后当前已打开的菜单也能及时更新。
        providerRefreshTimer = window.setInterval(() => { void refreshProviderCatalog(); }, 1500);
      }

      // 原始 ShuoCanvas 的模型清单使用「供应商/模型」内部标识（例如
      // `apimart/gpt-image-2`），而 YUH 主程序使用用户在设置中保存的
      // provider id（例如 `custom-1788317229101`）。两者不能直接作为
      // IPC 参数混用，否则主进程会按 `apimart` 查找配置并报“中转站配置不存在”。
      // 这里集中做一次 hosted 适配：按当前 YUH 配置解析真实 provider，
      // 将内部模型前缀去掉，并把 data URL 参考图落盘为主进程可读取的文件。
      let providerCatalogPromise: Promise<any[]> | null = null;
      const providerModelsCache = new Map<string, Promise<string[]>>();
      const configuredProviders = async (): Promise<any[]> => {
        if (!providerCatalogPromise) {
          providerCatalogPromise = (host?.listProviders?.() ?? Promise.resolve([]))
            .then((list: any) => Array.isArray(list) ? list : [])
            .catch(() => []);
        }
        return providerCatalogPromise ?? [];
      };
      const providerModels = async (providerId: string): Promise<string[]> => {
        const id = String(providerId || "").trim();
        if (!id || !host?.listModels) return [];
        let pending = providerModelsCache.get(id);
        if (!pending) {
          pending = host.listModels(id)
            .then((result: any) => Array.isArray(result?.models) ? result.models.map((item: any) => String(item || "").trim()).filter(Boolean) : [])
            .catch(() => []);
          providerModelsCache.set(id, pending);
        }
        return pending;
      };
      const stripInternalModelPrefix = (model: unknown): string => {
        const raw = String(model || "").trim();
        if (!raw) return "";
        const slash = raw.indexOf("/");
        return slash > 0 ? raw.slice(slash + 1).trim() : raw;
      };
      type HostedModelKind = "image" | "video";
      type HostedModelBinding = { provider: any; model: string } | null;
      const modelLooksLike = (model: string, kind: HostedModelKind): boolean => {
        const value = model.toLowerCase();
        return kind === "image"
          ? /(image|banana|gemini.*flash|seedream|qwen-image|flux|recraft|dall)/i.test(value)
          : /(video|wan|seedance|kling|veo|hailuo|vidu|sora|ltx|grok)/i.test(value);
      };
      const modelCandidates = (model: unknown, kind: HostedModelKind): string[] => {
        const raw = String(model || "").trim();
        const stripped = stripInternalModelPrefix(raw);
        const candidates = [raw, stripped];
        if (kind === "image") {
          if (/gpt[-_ ]?image[-_ ]?2/i.test(stripped)) candidates.push("gpt-image-2", "gpt-image-1.5");
          if (/nano[-_ ]?banana/i.test(stripped)) candidates.push("nano-banana-2", "nano-banana-pro", "nano-banana-fast");
          if (/seedream/i.test(stripped)) candidates.push(stripped.replace(/^[^/]+\//, ""));
        } else {
          if (/wan|runninghub|scail|animate|bernini|hailuo|video/i.test(raw)) {
            candidates.push("wan2.7-videoedit", "wan2.7-video", "wan3.0-video", "wan2.7");
          }
          if (/seedance/i.test(stripped)) candidates.push("seedance-2.0-fast", "seedance-2.0", "seedance-2.0-mini");
        }
        return [...new Set(candidates.map((item) => String(item || "").trim()).filter(Boolean))];
      };
      const findHostedModel = async (provider: any, model: unknown, kind: HostedModelKind): Promise<string> => {
        const models = await providerModels(String(provider?.id || ""));
        const candidates = modelCandidates(model, kind).map((item) => item.toLowerCase());
        const exact = models.find((item) => candidates.includes(item.toLowerCase()));
        if (exact) return exact;
        // 中转站有时会返回带供应商前缀的模型 ID，做一次去前缀匹配。
        const prefixed = models.find((item) => candidates.includes(stripInternalModelPrefix(item).toLowerCase()));
        return prefixed || "";
      };
      const resolveHostedBinding = async (providerHint: unknown, model: unknown, kind: HostedModelKind): Promise<HostedModelBinding> => {
        const providers = (await configuredProviders()).filter((item) => item?.enabled !== false && item?.hasApiKey);
        const hint = String(providerHint || "").trim();
        if (!providers.length) throw new Error("请先在 YUH Studio「设置 → 中转站」中配置并启用 API Key");
        const exact = providers.find((item) => String(item?.id || "") === hint);
        const candidates = exact ? [exact, ...providers.filter((item) => item !== exact)] : providers;
        for (const provider of candidates) {
          const matched = await findHostedModel(provider, model, kind);
          if (matched) return { provider, model: matched };
        }
        return null;
      };
      const configuredModelBinding = async (kind: HostedModelKind, preferred: unknown): Promise<HostedModelBinding> => {
        const providers = (await configuredProviders()).filter((item) => item?.enabled !== false && item?.hasApiKey);
        const ordered = [...providers].sort((a, b) => Number(String(b?.id || "").startsWith("custom-")) - Number(String(a?.id || "").startsWith("custom-")));
        for (const provider of ordered) {
          const matched = await findHostedModel(provider, preferred, kind);
          if (matched) return { provider, model: matched };
        }
        return null;
      };
      const internalImageModelFor = (model: string): string => {
        const value = model.toLowerCase();
        if (/gpt[-_ ]?image[-_ ]?2/.test(value)) return "apimart/gpt-image-2";
        if (/nano[-_ ]?banana[-_ ]?2/.test(value)) return "apimart/nano-banana-2";
        if (/nano[-_ ]?banana[-_ ]?pro/.test(value)) return "apimart/nano-banana-pro";
        if (/nano[-_ ]?banana/.test(value)) return "apimart/nano-banana-dot";
        if (/seedream[-_ ]?4\.5|seedream[-_ ]?4-5/.test(value)) return "apimart/seedream-4.5";
        if (/seedream[-_ ]?4/.test(value)) return "apimart/seedream-4.0";
        return "apimart/gpt-image-2";
      };
      const internalVideoModelFor = (model: string): string => {
        const value = model.toLowerCase();
        if (/wan2\.7/.test(value)) return "apimart/wan2.7";
        if (/seedance[-_ ]?2\.0[-_ ]?mini/.test(value)) return "apimart/doubao-seedance-2.0-mini";
        if (/seedance[-_ ]?2\.0[-_ ]?(fast|turbo)/.test(value)) return "apimart/doubao-seedance-2.0-fast";
        if (/seedance[-_ ]?2\.0/.test(value)) return "apimart/doubao-seedance-2.0";
        if (/wan3\.0/.test(value)) return "apimart/wan2.7";
        return "apimart/wan2.7";
      };
      const hostedDefaults = await Promise.all([
        configuredModelBinding("image", "gpt-image-2"),
        configuredModelBinding("video", "wan2.7-videoedit"),
      ]);
      const imageBinding = hostedDefaults[0];
      const videoBinding = hostedDefaults[1];
      const hostedModelId = (binding: HostedModelBinding, kind: HostedModelKind): string => {
        const providerId = String(binding?.provider?.id || "").trim();
        const model = String(binding?.model || "").trim();
        if (providerId.startsWith("custom-") && model) return `${providerId}/${model}`;
        return kind === "image" ? internalImageModelFor(model || "gpt-image-2") : internalVideoModelFor(model || "wan2.7");
      };
      const initialSettings = {
        characterImageModelId: hostedModelId(imageBinding, "image"),
        characterImageProvider: String(imageBinding?.provider?.id || "apimart"),
        replacementImageModelId: hostedModelId(imageBinding, "image"),
        replacementImageProvider: String(imageBinding?.provider?.id || "apimart"),
        replacementModelId: hostedModelId(videoBinding, "video"),
      };
      const normalizeHostedProjectModels = (project: any) => {
        if (!project || typeof project !== "object") return project;
        const settings = { ...(project.settings || {}) };
        const imageModel = String(settings.replacementImageModelId || "").trim();
        const characterModel = String(settings.characterImageModelId || "").trim();
        const videoModel = String(settings.replacementModelId || "").trim();
        // 旧项目可能保存了 RunningHub 工作流模型；仅当该模型在当前中转站
        // 中确实不存在时才切换，避免覆盖用户已选的兼容模型。
        if (!imageModel || imageModel.startsWith("runninghub") || imageModel.startsWith("runninghub-model")) {
          settings.replacementImageModelId = initialSettings.replacementImageModelId;
          settings.replacementImageProvider = initialSettings.replacementImageProvider;
        }
        if (!characterModel || characterModel.startsWith("runninghub") || characterModel.startsWith("runninghub-model")) {
          settings.characterImageModelId = initialSettings.characterImageModelId;
          settings.characterImageProvider = initialSettings.characterImageProvider;
        }
        if (!videoModel || videoModel.startsWith("runninghub") || videoModel.startsWith("runninghub-model")) {
          settings.replacementModelId = initialSettings.replacementModelId;
        }
        return { ...project, settings };
      };
      const loadHostedWorkspace = host ? async () => {
        const loaded = await host.projectsLoad();
        return {
          ...loaded,
          projects: Array.isArray(loaded?.projects) ? loaded.projects.map(normalizeHostedProjectModels) : [],
        };
      } : undefined;
      const resolveHostedProvider = async (providerHint: unknown, model: unknown, kind: HostedModelKind = "image"): Promise<{ id: string; model: string }> => {
        const providers = (await configuredProviders()).filter((item) => item?.enabled !== false && item?.hasApiKey);
        const hint = String(providerHint || "").trim();
        const rawModel = String(model || "").trim();
        if (!providers.length) throw new Error("请先在 YUH Studio「设置 → 中转站」中配置并启用 API Key");
        const binding = await resolveHostedBinding(hint, rawModel, kind);
        if (binding) return { id: String(binding.provider.id), model: binding.model };
        const fallback = providers.find((item) => String(item?.id || "").startsWith("custom-")) || providers[0];
        const stripped = stripInternalModelPrefix(rawModel);
        if (!modelLooksLike(stripped, kind)) throw new Error(`当前已配置中转站没有可用的${kind === "image" ? "图片" : "视频"}模型：${rawModel || "未选择"}`);
        // 只在模型发现接口暂时不可用时保留上游名称；模型发现成功但没有
        // 匹配项时必须报错，避免把 RunningHub 工作流 ID 发给兼容接口。
        const discovered = await providerModels(String(fallback.id));
        if (discovered.length) throw new Error(`当前已配置中转站不支持模型「${stripped}」，请在模型设置中选择可用模型`);
        return { id: String(fallback.id), model: stripped || rawModel };
      };
      const toReferencePath = async (value: unknown, index: number): Promise<string> => {
        const raw = String(value || "").trim();
        if (!raw) return "";
        if (/^data:image\//i.test(raw)) {
          const saved = await host!.saveDataImage({ dataUrl: raw, name: `replacement-reference-${index + 1}.png` });
          return nativeMediaPath(saved);
        }
        const path = nativeMediaPath(raw);
        if (/^https?:\/\//i.test(path)) {
          throw new Error("参考图必须是本地文件；请先将素材导入替换工作室");
        }
        return path;
      };
      const adaptHostedImageRequest = async (request: any) => {
        const resolved = await resolveHostedProvider(request?.providerId || request?.provider, request?.model, "image");
        const inputUrls = Array.isArray(request?.references)
          ? request.references.map((item: any) => item?.path)
          : (Array.isArray(request?.inputUrls) ? request.inputUrls : []);
        const references = (await Promise.all(inputUrls.map((item: unknown, index: number) => toReferencePath(item, index)))).filter(Boolean)
          .map((path) => ({ kind: "image" as const, path }));
        const params = request?.generationParams && typeof request.generationParams === "object" ? request.generationParams : {};
        const ratio = String(request?.aspectRatio || params.aspectRatio || "").trim();
        const ratioSize: Record<string, string> = {
          "1:1": "1024x1024",
          "3:2": "1536x1024",
          "2:3": "1024x1536",
          "4:3": "1536x1024",
          "3:4": "1024x1536",
          "16:9": "1536x864",
          "9:16": "864x1536",
        };
        return {
          providerId: resolved.id,
          model: resolved.model,
          prompt: String(request?.prompt || "").trim(),
          size: request?.size || ratioSize[ratio] || undefined,
          quality: request?.quality || params.quality || undefined,
          imageProtocol: request?.imageProtocol || undefined,
          vectorArt: request?.vectorArt === true,
          references,
          projectSubdir: request?.projectSubdir || undefined,
        };
      };
      const adaptHostedVideoRequest = async (request: any) => {
        const resolved = await resolveHostedProvider(request?.providerId || request?.provider, request?.model, "video");
        const params = request?.generationParams && typeof request.generationParams === "object" ? request.generationParams : {};
        const refs: { kind: "image" | "video" | "audio"; path: string }[] = [];
        const imageUrls = Array.isArray(request?.inputUrls) ? request.inputUrls : [];
        for (let index = 0; index < imageUrls.length; index += 1) {
          const path = await toReferencePath(imageUrls[index], index);
          if (path) refs.push({ kind: "image", path });
        }
        const videoRef = request?.videoUrl || request?.videoPath;
        if (videoRef) {
          const path = await toReferencePath(videoRef, refs.length);
          if (path) refs.push({ kind: "video", path });
        }
        return {
          providerId: resolved.id,
          model: resolved.model,
          prompt: String(request?.prompt || "").trim(),
          duration: Math.max(1, Number(request?.duration || params.duration || params.seconds) || 5),
          ratio: String(request?.ratio || params.aspectRatio || params.ratio || "16:9"),
          resolution: String(request?.resolution || params.resolution || "").trim() || undefined,
          references: refs,
          projectSubdir: request?.projectSubdir || undefined,
        };
      };
      const normalizeHostedImageResult = (result: any) => result && typeof result === "object" ? {
        ...result,
        localPath: result.localPath || result.outputPath || "",
        imageUrl: result.imageUrl || result.outputUrl || result.outputPath || "",
        url: result.url || result.outputUrl || result.outputPath || "",
        sourceUrl: result.sourceUrl || result.outputUrl || result.outputPath || "",
      } : result;
      const normalizeHostedVideoResult = (result: any) => result && typeof result === "object" ? {
        ...result,
        localPath: result.localPath || result.outputPath || "",
        videoUrl: result.videoUrl || result.outputUrl || result.outputPath || "",
        url: result.url || result.outputUrl || result.outputPath || "",
      } : result;
      const app = createReplacementStudioApplication({
        documentObject: document,
        windowObject: window,
        mountTarget: mount,
        uploadFile: async (file: any) => {
          // Chromium/Electron 沙箱下 File.path 通常不可用，必须通过 preload
          // 的 webUtils.getPathForFile() 解析真实磁盘路径；否则后续 ffmpeg
          // probe/抽帧只能拿到文件名或 blob URL，表现为上传后没有反应。
          const nativePath = String(
            file?.path || host?.getPathForFile?.(file) || "",
          ).trim();
          const displayUrl = nativePath
            ? `file://${nativePath.replaceAll("\\", "/")}`
            : file
              ? URL.createObjectURL(file)
              : "";
          // 上传阶段同步读取视频元数据，避免项目先以 duration=0 保存，
          // 后续界面和重开项目都无法显示真实时长/尺寸。
          let metadata: any = {};
          if (nativePath && host?.probe) {
            try {
              metadata = await host.probe({ file: nativePath });
            } catch {
              metadata = {};
            }
          }
          return {
            path: nativePath,
            displayLocalPath: nativePath,
            displayUrl,
            videoUrl: displayUrl,
            durationSec: Number(metadata?.durationSec) || 0,
            width: Number(metadata?.width) || 0,
            height: Number(metadata?.height) || 0,
            originalName: file?.name || "素材",
            name: file?.name || "素材",
          };
        },
        loadWorkspace: loadHostedWorkspace,
        saveWorkspace: host ? async (workspace: any) => { await host.projectSave(workspace); } : undefined,
        initialSettings,
        generateCharacterImage: host ? async (request: any) => normalizeHostedImageResult(await host.generateImage(await adaptHostedImageRequest(request))) : undefined,
        generateReplacementImage: host ? async (request: any) => normalizeHostedImageResult(await host.generateImage(await adaptHostedImageRequest(request))) : undefined,
        generateReplacementVideo: host ? async (request: any) => normalizeHostedVideoResult(await host.generateVideo(await adaptHostedVideoRequest(request))) : undefined,
        // ShuoCanvas 的智能裁切服务默认走 HTTP requester；YUH hosted 模式
        // 必须把它适配到本地 IPC，并把每个镜头的关键帧真实落盘。IPC 只接收
        // 普通对象，绝不能把 AbortSignal、回调函数等原始请求对象直接传入。
        runSmartClip: host ? async (request: any) => {
          const file = nativeMediaPath(request?.source || request?.file || request?.path);
          if (!file) throw new Error("缺少视频文件路径");
          if (request?.signal?.aborted) throw new Error("Smart clip cancelled");
          const options = request?.options || {};
          const clipped = await host.smartClip({
            file,
            threshold: options.mode === "sensitive" ? 0.14 : options.mode === "balanced" ? 0.2 : 0.28,
            minDuration: 0.8,
          });
          if (request?.signal?.aborted) throw new Error("Smart clip cancelled");
          const detectedShots = Array.isArray(clipped?.shots) ? clipped.shots : [];
          const sourceDuration = Number(clipped?.durationSec) || 0;
          const shots = options.preserveWholeVideo === true && sourceDuration > 0
            ? [{ startSec: 0, endSec: sourceDuration, durationSec: sourceDuration, keyframeTimeSec: 0 }]
            : detectedShots;
          if (!shots.length) throw new Error("视频未检测到可用片段");
          const shotBundles = [];
          for (let index = 0; index < shots.length; index += 1) {
            if (request?.signal?.aborted) throw new Error("Smart clip cancelled");
            const shot: any = shots[index] || {};
            const keyframeTimeSec = Number(shot.keyframeTimeSec) || Number(shot.startSec) || 0;
            const frame = await host.extractFrameAt({ file, timeSec: keyframeTimeSec });
            const keyframeRef = nativeMediaPath(frame);
            if (!keyframeRef) throw new Error("抽取关键帧失败");
            shotBundles.push({
              id: `shot-${String(index + 1).padStart(3, "0")}`,
              index: index + 1,
              start: Number(shot.startSec) || 0,
              end: Number(shot.endSec) || Number(shot.startSec) || 0,
              duration: Number(shot.durationSec) || 0,
              fps: Number(options.fps) || 24,
              keyframeIndex: index,
              keyframeTimeSec,
              clipRef: "",
              keyframeRef,
              personDetection: null,
              errors: [],
            });
            request?.onProgress?.({ phase: "keyframes", progress: (index + 1) / shots.length });
          }
          return {
            ok: true,
            status: "ready",
            sourceRef: file,
            shotBundles,
            stages: { keyframes: { status: "complete", count: shotBundles.length, error: null } },
          };
        } : undefined,
        fetchVideoMeta: host ? async (request: any) => host.probe({ file: nativeMediaPath(request) }) : undefined,
        fetchFirstFrame: host ? async (request: any) => host.extractFrameAt({ file: nativeMediaPath(request), timeSec: 0 }) : undefined,
        // 原始应用调用 detectPeople(imageRef, options)，而宿主 IPC 接收结构化
        // 请求；没有配置视觉模型时返回空人物列表，仍可完成视频素材处理。
        detectPeople: host ? async (imageRef: any) => {
          const imagePath = nativeMediaPath(imageRef);
          try {
            const providers = await host.listProviders();
            const provider = (providers || []).find((item: any) => item?.enabled && item?.hasApiKey);
            if (!provider) return { people: [], frame: { path: imagePath } };
            const response = await host.detectPeople({
              providerId: provider.id,
              model: provider.defaultModels?.[0] || "vision",
              prompt: "返回图片中人物列表及 bbox，使用 JSON 数组格式；没有人物则返回空数组。",
              imagePath,
            });
            const text = String(response?.text || "");
            const match = text.match(/\[[\s\S]*\]/);
            const people = match ? JSON.parse(match[0]) : [];
            return { people: Array.isArray(people) ? people : [], frame: { path: imagePath } };
          } catch {
            return { people: [], frame: { path: imagePath } };
          }
        } : undefined,
        enqueueMediaTask: host ? async (request: any) => {
          const kind = String(request?.kind || "");
          const args = request?.args || {};
          const file = nativeMediaPath(request?.src || request?.file);
          if (kind === "mediaClipExport") {
            const startSec = Math.max(0, Number(args.videoStart ?? args.start ?? request.start) || 0);
            const endSec = Number(args.videoEnd ?? args.end ?? request.end);
            const durationSec = Math.max(0.3, (endSec > startSec ? endSec - startSec : Number(request.durationSec) || 1));
            const result = await host.materializeShot({ file, startSec, durationSec });
            return { ...result, localPath: result?.path, path: result?.path };
          }
          if (kind === "videoReverse") {
            const result = await host.materializeShot({ file, startSec: 0, durationSec: Number(request.durationSec) || 1, reverse: true });
            return { ...result, localPath: result?.path, path: result?.path };
          }
          if (kind === "videoFirstFrame") {
            const result = await host.extractFrameAt({ file, timeSec: 0 });
            return { ...result, localPath: result?.path, path: result?.path };
          }
          if (kind === "videoAudioSeparate") {
            const result = await host.extractShotAudio({ file, startSec: 0, durationSec: Number(request.durationSec) || 1 });
            return { ...result, localPath: result?.path, path: result?.path };
          }
          if (kind === "videoCompose" || kind === "audioCompose") {
            return host.compose({ shots: Array.isArray(request?.shots) ? request.shots : [], outputPath: String(request.outputPath || "") });
          }
          throw new Error(`暂不支持的媒体任务: ${kind || "unknown"}`);
        } : undefined,
        saveMedia: host ? async (request: any) => host.saveFileDialog(request) : undefined,
        onRequestClose: () => onExitRef.current(),
        showToast: (message: string) => {
          window.dispatchEvent(new CustomEvent("serpent-toast", { detail: { message } }));
        },
      });
      appRef.current = app;
      app.open();
      // 直接保留 ShuoCanvas 原始 delegated click + hidden input 流程。
      // uploadFile 通过 webUtils.getPathForFile() 解析 Electron File 的真实路径，
      // 因此不需要在挂载层重复拦截“选择视频”并再打开一套宿主选择器。
      // 原始 ShuoCanvas 工作室没有 React 回调协议；通过轻量轮询读取其公开
      // getProject()，让 YUH 资源管理可以随当前项目自动定位。
      if (onActiveWorkbenchProjectRef.current) {
        let lastKey = "";
        const reportProject = () => {
          const project = app.getProject?.();
          if (!project?.id) return;
          const title = String(project.title || "人物替换项目");
          const key = `${project.id}:${title}`;
          if (key === lastKey) return;
          lastKey = key;
          onActiveWorkbenchProjectRef.current?.({
            studio: "替换工作室",
            slug: "replacement-studio",
            projectId: String(project.id),
            title,
          });
        };
        reportProject();
        projectTimer = window.setInterval(reportProject, 500);
      }
    })();

    return () => {
      disposed = true;
      themeObserver.disconnect();
      if (previousRootTheme == null) root.removeAttribute("data-theme");
      else root.setAttribute("data-theme", previousRootTheme);
      root.style.colorScheme = previousRootColorScheme;
      if (body) {
        if (previousBodyTheme == null) body.removeAttribute("data-theme");
        else body.setAttribute("data-theme", previousBodyTheme);
      }
      if (projectTimer != null) window.clearInterval(projectTimer);
      if (providerRefreshTimer != null) window.clearInterval(providerRefreshTimer);
      if (providerChangeListener) window.removeEventListener("yuh:providers-changed", providerChangeListener);
      try { appRef.current?.destroy?.(); } catch { /* 原始工作室销毁应保持幂等 */ }
      appRef.current = null;
      mount.remove();
    };
  }, []);

  return <div ref={hostRef as any} className="original-replacement-host" data-original-replacement-studio="true" />;
}
