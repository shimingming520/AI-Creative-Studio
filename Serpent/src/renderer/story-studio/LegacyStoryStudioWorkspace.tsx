import { useEffect, useRef, useState } from "react";

import "./legacy-story-studio.css";
import { ensureSwHostApi } from "../storyboard-script/host";
import { syncHostedProviderModelCatalog } from "../shuocanvas-legacy/src/modules/hostedProviderModelCatalog.js";
import { STORY_PROJECTS_STORAGE_KEY } from "./story-studio-data";

const STORY_WORKSPACE_LOCAL_CACHE_KEY = "story-workspace:session-cache:v1";

type LegacyStoryStudioWorkspaceProps = {
  onExit: () => void;
  onActiveWorkbenchProject?: (project: {
    studio: string;
    slug: string;
    projectId: string;
    title: string;
  }) => void;
};

/**
 * ShuoCanvas 原版剧本工作室适配层。
 *
 * 原版工作区是 DOM controller（而不是 React 组件），因此只负责提供
 * 它需要的 #v2-wrap 挂载点、生命周期和最小宿主回调，所有流程、布局、
 * 主题、按钮及交互均由原版 storyWorkspace.js 自己渲染。
 */
export function LegacyStoryStudioWorkspace({
  onExit,
}: LegacyStoryStudioWorkspaceProps) {
  const exitRef = useRef(onExit);
  exitRef.current = onExit;
  const [retryAttempt, setRetryAttempt] = useState(0);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let disposed = false;
    let api: { activate?: (options?: { previousMode?: string }) => unknown; destroy?: () => void } | null = null;
    setLoadError(null);

    const mount = async () => {
      const root = document.getElementById("v2-wrap");
      if (!root || disposed) return;
      const host = await ensureSwHostApi();
      // 动态注册当前自定义中转站的文本/图片/视频模型，必须在原版
      // 工作区初始化前完成，否则模型菜单只会看到内置清单。
      await syncHostedProviderModelCatalog(host);
      const storyApi = await import("../shuocanvas-legacy/api/storyGenerationApi.js") as any;
      // 供应商列表属于可选的模型选择能力。宿主首次启动、设置未完成或
      // 中转站暂时不可用时，这里可能抛错；不能因此退出整个剧本工作室，
      // 否则用户点击入口后会被静默退回资源管理界面。
      const providerResult =
        typeof host.listProviders === "function"
          ? await host.listProviders().catch(() => [])
          : [];
      const providers = (Array.isArray(providerResult) ? providerResult : []).filter(
        (item) => item.enabled !== false && item.hasApiKey,
      );
      const modelCache = new Map<string, Promise<string[]>>();
      const modelsFor = (providerId: string) => {
        let pending = modelCache.get(providerId);
        if (!pending) {
          // 宿主接口既可能返回字符串，也可能返回 { id, name } 对象。统一
          // 为字符串，避免“模型列表已获取但菜单/绑定按字符串调用失败”。
          pending = host.listModels(providerId).then((result) => {
            const rawModels = Array.isArray(result)
              ? result
              : (Array.isArray(result?.models) ? result.models : []);
            return rawModels
              .map((item) => typeof item === "string" ? item : item?.id || item?.name)
              .map((item) => String(item || "").trim())
              .filter(Boolean);
          }).catch(() => []);
          modelCache.set(providerId, pending);
        }
        return pending;
      };
      const resolveBinding = async (modelHint: unknown, providerHint: unknown) => {
        const modelText = String(modelHint || "").trim();
        const providerText = String(providerHint || "").trim();
        const ordered = [
          ...providers.filter((item) => item.id === providerText),
          ...providers.filter((item) => item.id !== providerText),
        ];
        for (const provider of ordered) {
          const models = await modelsFor(provider.id);
          const exact = models.find((item) => item.toLowerCase() === modelText.toLowerCase());
          if (exact) return { provider: provider.id, model: exact };
          const stripped = modelText.includes("/") ? modelText.slice(modelText.indexOf("/") + 1) : modelText;
          const loose = models.find((item) => item.toLowerCase() === stripped.toLowerCase());
          if (loose) return { provider: provider.id, model: loose };
        }
        const fallback = ordered[0];
        if (!fallback) throw new Error("请先在 YUH Studio 设置中配置并启用文本模型 API");
        const fallbackModels = await modelsFor(fallback.id);
        const selected = fallbackModels[0] || modelText;
        if (!selected) throw new Error("当前中转站没有可用的文本模型");
        return { provider: fallback.id, model: selected };
      };
      const requestText = async (payload: any) => {
        const binding = await resolveBinding(payload?.model, payload?.provider);
        return host.generateScript({
          providerId: binding.provider,
          model: binding.model,
          system: payload?.systemPrompt || payload?.system || "你是专业的短剧编剧。",
          user: payload?.prompt || payload?.user || "",
        });
      };
      const syncWorkbenchProjectIndex = async (snapshot: any) => {
        const projects = Array.isArray(snapshot?.projects)
          ? snapshot.projects
          : snapshot?.currentData?.project
            ? [{ data: snapshot.currentData }]
            : [];
        const entries = projects
          .map((item: any) => item?.data?.project || item?.project || item?.data)
          .filter((project: any) => project?.id)
          .map((project: any) => ({ id: String(project.id), title: String(project.title || "剧本项目") }));
        if (!entries.length) return;
        try {
          window.localStorage.setItem(STORY_PROJECTS_STORAGE_KEY, JSON.stringify(entries));
          window.dispatchEvent(new Event("story-projects-changed"));
        } catch {
          // 资源树索引失败不影响工作区存档。
        }
        // 项目存档和资源目录是两个独立持久化通道。恢复工作区时也要
        // 补建目录，避免“剧本工作室有项目但资源管理没有项目文件夹”。
        await Promise.all(entries.map((project) =>
          host.ensureWorkbenchProjectDir(`剧本工作室/${project.id}`).catch(() => ({ ok: false })),
        ));
      };
      const generateStory = (request: any) => storyApi.generateStoryDraft({ ...request, request: requestText });
      const generateEpisodeScript = (request: any) => storyApi.generateStoryEpisodeScript({ ...request, request: requestText });
      const extractAssets = (request: any) => storyApi.extractStoryAssets({ ...request, request: requestText });
      const planEpisodes = (request: any) => storyApi.planStoryEpisodes({ ...request, request: requestText });
      const splitEpisode = (request: any) => storyApi.splitStoryEpisode({ ...request, request: requestText });
      const module = await import(
        // @ts-ignore legacy JavaScript module has no generated declaration
        "../shuocanvas-legacy/src/modules/storyWorkspace/storyWorkspace.js"
      );
      if (disposed) return;
      api = module.initStoryWorkspace({
        generateStory,
        generateEpisodeScript,
        extractAssets,
        planEpisodes,
        splitEpisode: splitEpisode,
        // 工作区切换会销毁并重新挂载该适配层；接入宿主存档后，项目、
        // 当前步骤及剧本摘要生成结果可以跨视图恢复，而不会回到创建页。
        loadWorkspace: async () => {
          // 宿主磁盘存档是长期数据源；本地缓存仅作为 IPC 写入窗口或宿主
          // 暂时不可用时的兜底，避免旧缓存覆盖较新的磁盘存档。
          try {
            const persisted = await host.loadWorkspace();
            if (persisted && typeof persisted === "object") {
              await syncWorkbenchProjectIndex(persisted);
              return persisted;
            }
          } catch {
            // 继续尝试本地即时缓存。
          }
          try {
            const cached = window.localStorage.getItem(STORY_WORKSPACE_LOCAL_CACHE_KEY);
            if (cached) {
              const parsed = JSON.parse(cached);
              if (parsed?.schemaVersion === 1 && parsed?.currentData?.project) {
                await syncWorkbenchProjectIndex(parsed);
                return parsed;
              }
            }
          } catch {
            // 继续尝试宿主磁盘存档。
          }
          return host.loadWorkspace();
        },
        saveWorkspace: async (snapshot: unknown) => {
          const rawSnapshot = snapshot as any;
          const persistedProjects = Array.isArray(rawSnapshot?.projects)
            ? rawSnapshot.projects
            : rawSnapshot?.currentData?.project
              ? [{ data: rawSnapshot.currentData }]
              : [];
          const projectEntries = persistedProjects
            .map((item: any) => item?.data?.project || item?.project || item?.data)
            .filter((project: any) => project?.id)
            .map((project: any) => ({
              id: String(project.id),
              title: String(project.title || "剧本项目"),
            }));
          try {
            window.localStorage.setItem(STORY_PROJECTS_STORAGE_KEY, JSON.stringify(projectEntries));
          } catch {
            // 工作区磁盘存档仍会继续保存。
          }
          await Promise.all(projectEntries.map((project) =>
            host.ensureWorkbenchProjectDir(`剧本工作室/${project.id}`).catch(() => ({ ok: false })),
          ));
          try {
            window.localStorage.setItem(STORY_WORKSPACE_LOCAL_CACHE_KEY, JSON.stringify(snapshot));
          } catch {
            // 宿主磁盘存档仍会继续保存。
          }
          const result = await host.saveWorkspace(snapshot);
          // 主进程磁盘存档成功后再刷新工作台资源树，避免事件先于
          // workspace.json 写入而读到旧项目列表，造成资源管理滞后。
          window.dispatchEvent(new Event("story-projects-changed"));
          return result;
        },
        requestWorkspaceMode: (mode: string) => {
          if (mode !== "story") exitRef.current();
          return true;
        },
        ensureProjectDirectory: (projectId: string) =>
          host.ensureWorkbenchProjectDir(`剧本工作室/${projectId}`),
      });
      api?.activate?.({ previousMode: "canvas" });
    };

    void mount().catch((error) => {
      console.error("[storyWorkspace] 原版工作区挂载失败", error);
      // 挂载失败不能自动退出到资源管理界面，否则用户会误以为入口打开了
      // 错误的工作区。保留当前视图并提供明确的重试入口。
      if (!disposed) {
        setLoadError(error instanceof Error ? error.message : String(error));
      }
    });

    return () => {
      disposed = true;
      api?.destroy?.();
    };
  }, [retryAttempt]);

  return (
    <section
      className="legacy-story-studio-overlay"
      data-studio-view="storyboard-script"
      aria-label="剧本工作室"
    >
      <div id="v2-wrap" className="legacy-story-studio-mount" />
      {loadError && (
        <div className="legacy-story-studio-error" role="alert">
          <p>剧本工作室暂时无法连接宿主服务。</p>
          <p className="legacy-story-studio-error-detail">{loadError}</p>
          <button
            type="button"
            onClick={() => {
              setLoadError(null);
              setRetryAttempt((value) => value + 1);
            }}
          >
            重试
          </button>
        </div>
      )}
    </section>
  );
}
