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

    // ShuoCanvas 工作室复用 Serpent 的主题状态；两个主题入口只保留一个
    // 真正的数据源，避免主界面切换后工作室仍停留在另一套深色主题。
    const root = document.documentElement;
    const syncTheme = () => {
      const light = root.getAttribute("data-theme") === "light" || root.classList.contains("is-canvas-theme-light");
      mount.classList.toggle("theme-light", light);
      mount.classList.toggle("canvas-theme-light", light);
      mount.classList.toggle("theme-dark", !light);
      mount.classList.toggle("canvas-theme-dark", !light);
    };
    syncTheme();
    const themeObserver = new MutationObserver(syncTheme);
    themeObserver.observe(root, { attributes: true, attributeFilter: ["data-theme", "class"] });

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
          // gpt-image-2 与 gpt-image-1.5 不是兼容别名；中转站可能只为
          // gpt-image-2 配置了可用通道。绝不能为了“匹配模型清单”把请求
          // 静默改成 gpt-image-1.5，否则会得到 No available channel 503。
          if (/^gpt[-_ ]?image[-_ ]?2$/i.test(stripped)) candidates.push("gpt-image-2");
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
        if (prefixed) return prefixed;
        // 部分 OpenAI 兼容中转站的 /v1/models 目录与实际图片路由不同步，
        // 但用户已经验证 POST /images/generations 的 gpt-image-2 可用。
        // 对自定义中转保留该明确模型 ID，避免目录里错误的旧别名劫持请求。
        const requested = stripInternalModelPrefix(model);
        if (kind === "image" && String(provider?.id || "").startsWith("custom-")
          && /^gpt[-_ ]?image[-_ ]?2$/i.test(requested)) {
          return "gpt-image-2";
        }
        return "";
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
        // 原始应用调用 detectPeople(imageRef, options)，而宿主 IPC 接收结构化请求。
        // 自动框选依赖视觉模型；配置缺失或返回格式异常时必须抛错，不能静默变成“0 人”，
        // 否则用户会误以为自动检测已完成，后续生成又没有可替换区域。
        detectPeople: host ? async (imageRef: any) => {
          const imagePath = nativeMediaPath(imageRef);
          if (!imagePath) throw new Error("人物检测缺少关键帧路径");
          const providers = (await host.listProviders())
            .filter((item: any) => item?.enabled && item?.hasApiKey)
            .sort((a: any, b: any) => Number(String(b?.id || "").startsWith("custom-")) - Number(String(a?.id || "").startsWith("custom-")));
          if (!providers.length) throw new Error("未找到已启用且已配置 API Key 的视觉模型，请先配置检测中转站");
          // 不再把模型硬编码为 `vision`。许多兼容中转站只接受自身真实模型 ID，
          // 例如 deepseek-v4-flash-vision-exp；先从每个中转站的模型清单中选择
          // 带 vision/vl/multimodal 特征的模型，再回退到 defaultModels。
          let provider: any = null;
          let model = "";
          for (const candidate of providers) {
            let models: string[] = [];
            try {
              const discovered = await host.listModels(candidate.id);
              models = Array.isArray(discovered?.models) ? discovered.models.map((item: any) => String(item || "").trim()).filter(Boolean) : [];
            } catch { /* 继续尝试下一个中转站 */ }
            // 模型清单通常会同时包含 deepseek-v4-flash（文本）和
            // deepseek-v4-flash-vision-exp（视觉）。不能用 find() 直接取
            // 第一个匹配项，否则清单顺序会让文本模型抢先被选中，接口虽
            // 返回 200，图片内容却可能被忽略，最终表现为没有人物框。
            const visionModel = models
              .filter((item) => /(vision|vl|multimodal|deepseek.*flash)/i.test(item))
              .sort((a, b) => {
                const score = (value: string) => {
                  const modelName = value.toLowerCase();
                  if (/vision|multimodal|(^|[-_])vl([-. _]|$)/i.test(modelName)) return 3;
                  if (/deepseek.*flash/i.test(modelName)) return 1;
                  return 2;
                };
                return score(b) - score(a);
              })[0];
            if (visionModel) { provider = candidate; model = visionModel; break; }
            const fallbackModel = Array.isArray(candidate.defaultModels) ? candidate.defaultModels.find((item: any) => /(vision|vl|multimodal|deepseek)/i.test(String(item))) : "";
            if (fallbackModel) { provider = candidate; model = String(fallbackModel); break; }
          }
          if (!provider) throw new Error("已配置中转站，但未发现可用于图片识别的视觉模型（模型名应包含 vision、VL 或 multimodal）");
          const response = await host.detectPeople({
            providerId: provider.id,
            model,
            prompt: "识别图片中所有人物，只输出 JSON 数组。每项格式为 {\"label\":\"人物A\",\"bbox\":[x,y,w,h],\"description\":\"外貌简述\"}；bbox 使用 0~1 归一化坐标，顺序为左上角 x、左上角 y、宽、高；没有人物返回空数组。",
            imagePath,
          });
          const text = String(response?.text || "");
          const match = text.match(/\[[\s\S]*\]/);
          if (!match) throw new Error("视觉模型未返回有效的人物 bbox JSON");
          const people = JSON.parse(match[0]);
          if (!Array.isArray(people)) throw new Error("人物检测结果不是数组");
          // 视觉模型通常返回 bbox 数组 [x,y,w,h]，而原始 ShuoCanvas
          // 渲染器读取的是 {x,y,width,height}；不转换会导致坐标全变成 0，
          // 表现为“识别成功但界面没有框”。
          const normalizedPeople = people
            .map((item: any) => {
              const raw = item?.bbox ?? item?.box;
              const values = Array.isArray(raw)
                ? raw.slice(0, 4).map(Number)
                : [raw?.x, raw?.y, raw?.w ?? raw?.width, raw?.h ?? raw?.height].map(Number);
              if (values.some((value: number) => !Number.isFinite(value))) return null;
              const x = Math.max(0, Math.min(1, values[0]));
              const y = Math.max(0, Math.min(1, values[1]));
              const width = Math.max(0, Math.min(1 - x, Math.abs(values[2])));
              const height = Math.max(0, Math.min(1 - y, Math.abs(values[3])));
              if (width < 0.01 || height < 0.01) return null;
              return {
                ...item,
                bbox: { x, y, width, height },
              };
            })
            .filter(Boolean);
          return { people: normalizedPeople, frame: { path: imagePath } };
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
