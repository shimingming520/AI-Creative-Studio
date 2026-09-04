/**
 * 剧本工作室 · Story Studio — Phase 1(首页 + 项目外壳)。
 *
 * 对齐 ShuoCanvas「剧本工作室」(storyWorkspace) 的:
 *   - 首页: home page(hero / tabs / composer body / model bar / projects 列表)
 *   - 项目工作区: toolbar(返回 / 步骤导航 1 剧情大纲 2 素材设定 3 分集视频 / 分集切换)
 *                + footer(上一步 / 下一步)
 *
 * 宿主能力复用 storyboard-script/host.ts(window.serpent.host.sw.*);
 * 数据模型/目录见 story-studio-data.ts(localStorage 持久化)。
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ensureSwHostApi, type SwHostApi, type SwProviderInfo, errorText } from "../storyboard-script/host";
import {
  buildReplacementProject,
  findProjectByTitle,
  syncCharactersIntoProject,
  type StoryboardSyncSnapshot,
  type StoryboardSyncedShot,
} from "../../shared/storyboard-replacement";
import type { StoryCharacter, StoryboardShot } from "../../shared/storyboard-script";
import type { RsProject } from "../../shared/replacement-studio";
import {
  STORY_ASPECT_RATIO_OPTIONS,
  STORY_HOME_TABS,
  STORY_PROMPT_MODE_OPTIONS,
  STORY_PROJECT_SORT_OPTIONS,
  STORY_PUBLIC_EPISODE_COUNT_OPTIONS,
  STORY_REPLICATION_LOCALES,
  STORY_STYLE_CUSTOM_ID,
  STORY_STEPS,
  buildStoryAssetExtractionPrompt,
  createEmptyStoryProject,
  fallbackStoryAssets,
  getStoryProjectHomeEntries,
  loadStoryHome,
  loadStoryProjects,
  parseStoryAssetsFromJson,
  resolveStepOneLabel,
  resolveStoryStyleSelection,
  saveStoryHome,
  saveStoryProjects,
  splitScriptIntoEpisodes,
  splitTextIntoClips,
  storyPromptModeLabel,
  storyProjectTypeLabel,
  storyScriptModeLabel,
  type StoryAsset,
  type StoryClip,
  type StoryHomeState,
  type StoryHomeTab,
  type StoryProject,
  type StoryStepId,
} from "./story-studio-data";
import { StoryStylePicker } from "./StoryStylePicker";
import { TextModelSelector } from "./TextModelSelector";
import "./story-studio.css";

type WorkspaceView = { kind: "home" } | { kind: "project"; projectId: string } | { kind: "episode"; projectId: string; episodeId: string };

type PickerOption = { value: string; label: string; disabled?: boolean };

function StoryPicker({
  label,
  value,
  options,
  onSelect,
  icon,
  format,
}: {
  label: string;
  value: string;
  options: PickerOption[];
  onSelect: (value: string) => void;
  icon?: string;
  format?: (value: string) => string;
}) {
  const [open, setOpen] = useState(false);
  const shown = format ? format(value) : (options.find((o) => o.value === value)?.label ?? value);
  return (
    <div className="story-home-param-picker">
      <button
        type="button"
        className="story-home-param-trigger story-menu-trigger"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        {icon && <span className="story-home-param-icon" aria-hidden="true">{icon}</span>}
        <span data-story-planning-trigger-label>{shown}</span>
        <span className="story-home-param-chevron" aria-hidden="true">▾</span>
      </button>
      {open && (
        <div className="story-home-param-popover story-ratio-popover" role="listbox" aria-label={label}>
          <strong>{label}</strong>
          <div className="story-ratio-options">
            {options.map((o) => (
              <button
                type="button"
                key={o.value}
                className={
                  "story-ratio-option" +
                  (o.value === value ? " is-selected" : "") +
                  (o.disabled ? " is-disabled" : "")
                }
                role="option"
                aria-selected={o.value === value}
                disabled={o.disabled}
                onClick={() => {
                  if (o.disabled) return;
                  onSelect(o.value);
                  setOpen(false);
                }}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function StoryStudioWorkspace({
  onExit,
  onActiveWorkbenchProject,
}: {
  onExit: () => void;
  onActiveWorkbenchProject?: (project: { studio: string; slug: string; projectId: string; title: string }) => void;
}) {
  const [host, setHost] = useState<SwHostApi | null>(null);
  const [hostReady, setHostReady] = useState(false);
  const [providers, setProviders] = useState<SwProviderInfo[]>([]);
  const [models, setModels] = useState<string[]>([]);
  const [modelsByProvider, setModelsByProvider] = useState<Record<string, string[]>>({});
  const [providerId, setProviderId] = useState("");

  const [projects, setProjects] = useState<StoryProject[]>(loadStoryProjects);
  const [home, setHome] = useState<StoryHomeState>(loadStoryHome);
  const [view, setView] = useState<WorkspaceView>({ kind: "home" });
  const [step, setStep] = useState<StoryStepId>(1);
  const [generating, setGenerating] = useState(false);
  const [busyMessage, setBusyMessage] = useState("");
  const [error, setError] = useState("");
  const [menus, setMenus] = useState<Record<string, boolean>>({});
  const [operation, setOperation] = useState<null | "extract-assets" | "plan-episode-outlines" | "build-clips">(null);
  const [assetImageBusy, setAssetImageBusy] = useState<Record<string, boolean>>({});
  const [batchAssetBusy, setBatchAssetBusy] = useState(false);
  const [batchVideoBusy, setBatchVideoBusy] = useState(false);
  const [assetTab, setAssetTab] = useState<"character" | "scene" | "prop" | "library">("character");
  const [expandedEpisodeId, setExpandedEpisodeId] = useState<string | null>(null);
  const [clipBusy, setClipBusy] = useState<Record<string, boolean>>({});
  const hostRef = useRef<SwHostApi | null>(null);

  // ---- 宿主初始化 ----
  useEffect(() => {
    let cancelled = false;
    ensureSwHostApi()
      .then((api) => {
        if (cancelled) return;
        hostRef.current = api;
        setHost(api);
        setHostReady(true);
        return api.listProviders();
      })
      .then((list) => {
        if (cancelled) return;
        const enabled = (Array.isArray(list) ? list : []).filter((p) => p.enabled && p.hasApiKey);
        setProviders(enabled);
        setProviderId((prev) => prev || enabled[0]?.id || "");
      })
      .catch((reason) => {
        if (!cancelled) setError(errorText(reason));
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // ---- 中转站模型 ----
  useEffect(() => {
    let cancelled = false;
    const load = providerId && host ? host.listModels(providerId) : Promise.resolve({ models: [] });
    load
      .then((result) => {
        if (cancelled) return;
        const list = Array.isArray(result?.models) ? result.models : [];
        // 保留已选模型(跨中转站切换时若仍有效则不变),否则重置为该中转站首个模型。
        setModels((prev) => (prev[0] && list.includes(prev[0]) ? prev : list));
      })
      .catch(() => {
        if (!cancelled) setModels([]);
      });
    return () => {
      cancelled = true;
    };
  }, [providerId, host]);

  // ---- 全部中转站模型(供模型选择器分组展示) ----
  useEffect(() => {
    if (!host || providers.length === 0) return;
    let cancelled = false;
    Promise.all(
      providers.map(async (p) => {
        try {
          const r = await host.listModels(p.id);
          return [p.id, Array.isArray(r?.models) ? r.models : []] as const;
        } catch {
          return [p.id, [] as string[]] as const;
        }
      }),
    ).then((entries) => {
      if (cancelled) return;
      setModelsByProvider(Object.fromEntries(entries));
    });
    return () => {
      cancelled = true;
    };
  }, [host, providers]);

  // ---- 当前项目(工作区视图) ----
  const currentProject = useMemo<StoryProject | null>(() => {
    if (view.kind === "home") return null;
    return projects.find((p) => p.id === view.projectId) ?? null;
  }, [view, projects]);

  // 打开剧本项目即建立本项目资源目录,资源管理「工作台资源」才能立刻显示。
  useEffect(() => {
    const api = hostRef.current;
    if (!api || !currentProject) return;
    void api.ensureWorkbenchProjectDir(`剧本工作室/${currentProject.id}`).catch(() => void 0);
  }, [currentProject]);

  // ---- 上报工作台项目(资源管理定位) ----
  useEffect(() => {
    if (view.kind === "home" || !currentProject) return;
    onActiveWorkbenchProject?.({
      studio: "剧本工作室",
      slug: "storyboard-script",
      projectId: currentProject.id,
      title: currentProject.title || "剧本项目",
    });
  }, [view, currentProject, onActiveWorkbenchProject]);

  // ---- 持久化 ----
  const persistProjects = useCallback((next: StoryProject[]) => {
    setProjects(next);
    saveStoryProjects(next);
  }, []);

  const patchHome = useCallback((patch: Partial<StoryHomeState>) => {
    setHome((prev) => {
      const next = { ...prev, ...patch };
      saveStoryHome(next);
      return next;
    });
  }, []);

  const patchProject = useCallback(
    (projectId: string, patch: Partial<StoryProject>) => {
      persistProjects(
        projects.map((p) => (p.id === projectId ? { ...p, ...patch, updatedAt: Date.now() } : p)),
      );
    },
    [projects, persistProjects],
  );

  /** 打开项目 → 工作区;如提供指定步骤则定位到该步骤。 */
  const openProject = useCallback((project: StoryProject, toStep?: StoryStepId) => {
    setView({ kind: "project", projectId: project.id });
    setStep(toStep ?? 1);
    setError("");
  }, []);

  // ---- 首页生成 / 导入 / 复刻 ----
  const buildScriptPrompt = useCallback(() => {
    const style = resolveStoryStyleSelection({
      videoStyleId: home.videoStyleId,
      videoStylePrompt: home.videoStylePrompt,
      videoStyle: home.videoStylePrompt,
      customVideoStylePrompt: home.customVideoStylePrompt,
    });
    const styleLine = style.label && style.label !== "自定义风格提示词" ? `\n统一视觉风格：${style.label}。` : "";
    return [
      "你是专业短剧编剧。请根据下面的故事设定，输出一份可直接用于 AI 视频制作的完整分集剧本。",
      `目标分集数：${home.episodeCount} 集。`,
      `画面比例：${home.aspectRatio}。`,
      `提示词模式：${storyPromptModeLabel(home.promptMode)}。`,
      styleLine,
      "",
      "输出格式：为每一集给出「剧情大纲 / 主要场景 / 主要角色 / 分镜要点」。用中文。",
      "",
      `故事设定：${home.idea.trim() || "（未填写，请创作一个 3 集短剧）"}`,
    ].join("\n");
  }, [home]);

  const handleGenerateStory = useCallback(async () => {
    const api = hostRef.current;
    if (!api || !providerId) {
      setError("请先配置可用的中转站与文案模型。");
      return;
    }
    const model = models[0] || "";
    if (!model) {
      setError("当前中转站没有可用的文案模型。");
      return;
    }
    setGenerating(true);
    setBusyMessage(home.homeTab === "replication" ? "正在分析视频…" : "正在创建剧情…");
    setError("");
    try {
      let scriptText = "";
      if (home.homeTab === "upload") {
        scriptText = home.uploadInputMode === "paste" ? home.scriptText : `（将按原稿导入：${home.scriptFileName || "剧本文件"}）`;
      } else if (home.homeTab === "replication") {
        scriptText = `（复刻视频项目：${home.aspectRatio}，语种 ${home.replicationTargetLocale}）`;
      } else {
        const result = await api.generateScript({
          providerId,
          model,
          system: "你是专业短剧编剧，输出完整中文分集剧本。",
          user: buildScriptPrompt(),
        });
        scriptText = result.text;
      }
      const sourceMode =
        home.homeTab === "replication"
          ? "video-replication"
          : home.homeTab === "upload"
            ? "upload-original"
            : "generate";
      const project = createEmptyStoryProject({
        title: home.homeTab === "upload" ? home.scriptFileName || "导入的剧本" : generateTitleFromScript(scriptText),
        sourceMode,
        idea: home.idea,
        scriptText,
        scriptFileName: home.scriptFileName,
        aspectRatio: home.aspectRatio,
        videoStyleId: home.videoStyleId,
        videoStylePrompt: home.videoStylePrompt,
        customVideoStylePrompt: home.customVideoStylePrompt,
        promptMode: home.promptMode,
        episodeCount: home.episodeCount,
        scriptMode: home.scriptMode,
        replicationTargetLocale: home.replicationTargetLocale,
        summary: extractSummary(scriptText),
      });
      persistProjects([project, ...projects]);
      setBusyMessage("");
      openProject(project, 1);
      return project;
    } catch (reason) {
      setError(errorText(reason));
      setBusyMessage("");
      return null;
    } finally {
      setGenerating(false);
    }
  }, [host, providerId, models, home, buildScriptPrompt, projects, persistProjects, openProject]);

  const createEmptyProject = useCallback(() => {
    const project = createEmptyStoryProject({
      title: "未命名剧本项目",
      sourceMode: home.homeTab === "upload" ? "upload-original" : "generate",
      aspectRatio: home.aspectRatio,
      promptMode: home.promptMode,
      episodeCount: home.episodeCount,
      scriptMode: home.scriptMode,
    });
    persistProjects([project, ...projects]);
    openProject(project, 1);
  }, [home, projects, persistProjects, openProject]);

  // ---- 项目工具 ----
  const renameProject = useCallback(
    (projectId: string) => {
      const p = projects.find((x) => x.id === projectId);
      if (!p) return;
      const next = window.prompt("重命名项目", p.title);
      if (next != null && next.trim()) patchProject(projectId, { title: next.trim() });
    },
    [projects, patchProject],
  );

  const duplicateProject = useCallback(
    (projectId: string) => {
      const p = projects.find((x) => x.id === projectId);
      if (!p) return;
      const copy = createEmptyStoryProject({ ...p, id: undefined, title: `${p.title} 副本`, createdAt: Date.now(), updatedAt: Date.now(), archivedAt: 0 });
      persistProjects([copy, ...projects]);
    },
    [projects, persistProjects],
  );

  const handleStepBack = useCallback(() => {
    if (step > 1) setStep((s) => (s - 1) as StoryStepId);
    else setView({ kind: "home" });
  }, [step]);

  // ---- Phase 2: 步骤门控 + 逐步生成 ----

  /** 是否可进入某一步骤(对齐 isStoryWorkspaceStepNavigationDisabled 的“前置数据”思路)。 */
  const isStepDisabled = useCallback(
    (sid: StoryStepId): boolean => {
      if (!currentProject) return true;
      if (sid <= 1) return false;
      if (sid === 2) return (currentProject.assets?.length ?? 0) === 0;
      // sid === 3:至少有一集分集正文(分集结构已建立)。
      const hasEpisodeText = (currentProject.episodes ?? []).some((e) => (e.scriptText || "").trim());
      if (sid === 3) return !hasEpisodeText;
      return true;
    },
    [currentProject],
  );

  const stepBlockMessage = useCallback(
    (sid: StoryStepId): string => {
      if (!currentProject || sid <= 1) return "";
      if (sid === 2 && (currentProject.assets?.length ?? 0) === 0) return "请先在第一步完成素材提取(点击「下一步」)。";
      if (sid === 3 && !(currentProject.episodes ?? []).some((e) => (e.scriptText || "").trim())) return "请先完成分集大纲生成(点击「下一步」)。";
      return "";
    },
    [currentProject],
  );

  /** 第 1 步 → 第 2 步: 提取角色/场景/道具。 */
  const extractAssets = useCallback(async () => {
    const api = hostRef.current;
    if (!api || !currentProject) return;
    if ((currentProject.assets?.length ?? 0) > 0) return; // 已提取,直接进入。
    setOperation("extract-assets");
    setBusyMessage("正在提取角色、场景、道具…");
    setError("");
    try {
      const prompt = buildStoryAssetExtractionPrompt(currentProject.scriptText);
      const model = models[0] || "";
      let assets: StoryAsset[] = [];
      if (providerId && model) {
        const result = await api.generateScript({
          providerId,
          model,
          system: prompt.system,
          user: prompt.user,
        });
        assets = parseStoryAssetsFromJson(result.text);
      }
      if (assets.length === 0) assets = fallbackStoryAssets();
      patchProject(currentProject.id, { assets });
    } catch (reason) {
      setError(errorText(reason));
      patchProject(currentProject.id, { assets: fallbackStoryAssets() });
    } finally {
      setOperation(null);
      setBusyMessage("");
    }
  }, [currentProject, providerId, models, patchProject]);

  /** 第 2 步 → 第 3 步: 依集数把完整剧本拆成分集大纲(每集 scriptText)。 */
  const planEpisodes = useCallback(() => {
    if (!currentProject) return;
    if ((currentProject.episodes ?? []).some((e) => (e.scriptText || "").trim())) return;
    const episodes = splitScriptIntoEpisodes(currentProject.scriptText, currentProject.episodeCount);
    patchProject(currentProject.id, { episodes });
  }, [currentProject, patchProject]);

  /** 第 3 步: 为每个分集建立分镜片段结构。 */
  const buildClips = useCallback(async () => {
    if (!currentProject) return;
    setOperation("build-clips");
    setBusyMessage("正在生成分镜片段…");
    setError("");
    try {
      const episodes = (currentProject.episodes ?? []).map((ep) => {
        if ((ep.clips?.length ?? 0) > 0) return ep;
        return { ...ep, clips: splitTextIntoClips(ep.scriptText) };
      });
      patchProject(currentProject.id, { episodes });
    } catch (reason) {
      setError(errorText(reason));
    } finally {
      setOperation(null);
      setBusyMessage("");
    }
  }, [currentProject, patchProject]);

  /** 素材设定: 为某个素材生成形象参考图(写回其 appearances)。 */
  /** 项目内所有素材的形象参考图路径,作为 references 注入到图/视频生成。 */
  const referencesForProject = useCallback(() => {
    const paths: string[] = [];
    for (const asset of currentProject?.assets ?? []) {
      for (const appearance of asset.appearances ?? []) {
        if (appearance.path) paths.push(appearance.path);
      }
    }
    return paths.map((path) => ({ kind: "image" as const, path }));
  }, [currentProject]);

  const generateAssetImage = useCallback(
    async (assetId: string) => {
      const api = hostRef.current;
      if (!api || !currentProject) return;
      const asset = currentProject.assets.find((a) => a.id === assetId);
      if (!asset) return;
      const model = models[1] || models[0] || "";
      if (!model) {
        setError("当前中转站没有可用的图像模型。");
        return;
      }
      setAssetImageBusy((prev) => ({ ...prev, [assetId]: true }));
      setError("");
      try {
        const result = await api.generateImage({
          providerId,
          model,
          prompt: `${asset.name}，${asset.description || "人物/场景形象"}`,
          size: "512x512",
          references: asset.appearances
            .filter((x) => x.path)
            .map((x) => ({ kind: "image" as const, path: x.path! })),
          projectSubdir: `剧本工作室/${currentProject.id}`,
        });
        const appearance = { id: `ap-${Date.now()}-${Math.round(Math.random() * 1e4)}`, path: result.outputPath, url: result.outputUrl };
        patchProject(currentProject.id, {
          assets: currentProject.assets.map((a) =>
            a.id === assetId ? { ...a, appearances: [...a.appearances, appearance] } : a,
          ),
        });
      } catch (reason) {
        setError(errorText(reason));
      } finally {
        setAssetImageBusy((prev) => ({ ...prev, [assetId]: false }));
      }
    },
    [currentProject, providerId, models, patchProject],
  );

  const patchClip = useCallback(
    (episodeId: string, clipId: string, patch: Partial<StoryClip>) => {
      if (!currentProject) return;
      const episodes = (currentProject.episodes ?? []).map((ep) =>
        ep.id === episodeId
          ? { ...ep, clips: (ep.clips ?? []).map((c) => (c.id === clipId ? { ...c, ...patch } : c)) }
          : ep,
      );
      patchProject(currentProject.id, { episodes });
    },
    [currentProject, patchProject],
  );

  const generateClipVideo = useCallback(
    async (episodeId: string, clipId: string) => {
      const api = hostRef.current;
      if (!api || !currentProject) return;
      const clip = (currentProject.episodes ?? []).find((ep) => ep.id === episodeId)?.clips?.find((c) => c.id === clipId);
      if (!clip) return;
      const model = currentProject.videoModel || models[1] || models[0] || "";
      if (!model) {
        setError("当前中转站没有可用的视频模型。");
        return;
      }
      setClipBusy((prev) => ({ ...prev, [clipId]: true }));
      setError("");
      try {
        patchClip(episodeId, clipId, { status: "running" });
        const result = await api.generateVideo({
          providerId,
          model,
          prompt: clip.description || clip.dialogue || `${clip.number} 号镜头`,
          duration: clip.durationSec,
          ratio: currentProject.aspectRatio,
          resolution: currentProject.videoResolution || "720p",
          references: referencesForProject(),
          projectSubdir: `剧本工作室/${currentProject.id}`,
        });
        patchClip(episodeId, clipId, { status: "done", videoPath: result.outputPath });
      } catch (reason) {
        patchClip(episodeId, clipId, { status: "error" });
        setError(errorText(reason));
      } finally {
        setClipBusy((prev) => ({ ...prev, [clipId]: false }));
      }
    },
    [currentProject, providerId, models, patchClip, referencesForProject],
  );

  /** 从文件选择器为素材选一张参考图(素材库接入:资源管理/本地图片)。 */
  const pickAssetReference = useCallback(
    async (assetId: string) => {
      const api = hostRef.current;
      if (!api || !currentProject) return;
      const asset = currentProject.assets.find((a) => a.id === assetId);
      if (!asset) return;
      try {
        const picked = await api.pickImages(false);
        if (picked && picked.length > 0) {
          const appearance = { id: `ap-${Date.now()}-${Math.round(Math.random() * 1e4)}`, path: picked[0]!.path, url: picked[0]!.url };
          patchProject(currentProject.id, {
            assets: currentProject.assets.map((a) =>
              a.id === assetId ? { ...a, appearances: [...a.appearances, appearance] } : a,
            ),
          });
        }
      } catch (reason) {
        setError(errorText(reason));
      }
    },
    [currentProject, patchProject],
  );

  /** 批量生成本分类所有素材的形象参考图。 */
  const batchGenerateAssets = useCallback(
    async (kind: StoryAsset["kind"]) => {
      if (!currentProject || batchAssetBusy) return;
      const targets = (currentProject.assets ?? []).filter((a) => a.kind === kind);
      if (targets.length === 0) {
        setError("该分类下还没有素材。");
        return;
      }
      setBatchAssetBusy(true);
      setError("");
      try {
        for (const asset of targets) {
          await generateAssetImage(asset.id);
        }
      } finally {
        setBatchAssetBusy(false);
      }
    },
    [currentProject, batchAssetBusy, generateAssetImage],
  );

  /** 素材库:从文件选择器导入一张图片,作为本分类新素材。 */
  const importAssetFromLibrary = useCallback(
    async (kind: StoryAsset["kind"]) => {
      const api = hostRef.current;
      if (!api || !currentProject) return;
      try {
        const picked = await api.pickImages(false);
        if (!picked || picked.length === 0) return;
        const asset: StoryAsset = {
          id: `sb-${Date.now()}-${Math.round(Math.random() * 1e5)}`,
          kind,
          name: (picked[0]!.name || `${kind}-素材`).replace(/\.[^.]+$/u, ""),
          description: "",
          appearances: [{ id: `ap-${Date.now()}-${Math.round(Math.random() * 1e4)}`, path: picked[0]!.path, url: picked[0]!.url }],
        };
        patchProject(currentProject.id, { assets: [...(currentProject.assets ?? []), asset] });
      } catch (reason) {
        setError(errorText(reason));
      }
    },
    [currentProject, patchProject],
  );

  /** 批量生成所有分集全部镜头的视频。 */
  const batchGenerateAllVideos = useCallback(async () => {
    if (!currentProject || batchVideoBusy) return;
    const all = collectStoryClips(currentProject);
    if (all.length === 0) {
      setError("还没有可生成的分镜片段，请先在「分集视频」建立分镜。");
      return;
    }
    setBatchVideoBusy(true);
    setError("");
    try {
      for (const { episodeId, clip } of all) {
        await generateClipVideo(episodeId, clip.id);
      }
    } finally {
      setBatchVideoBusy(false);
    }
  }, [currentProject, batchVideoBusy, generateClipVideo]);

  /** 导出分镜表(逐集逐镜)为 .txt。 */
  const exportStoryboard = useCallback(async () => {
    const api = hostRef.current;
    if (!api || !currentProject) return;
    setBusyMessage("正在导出分镜表…");
    setError("");
    try {
      const name = `${currentProject.title || "分镜表"}-${new Date().toISOString().slice(0, 10)}.txt`;
      const result = await api.saveText({
        name,
        content: storyboardToText(currentProject),
        projectSubdir: `剧本工作室/${currentProject.id}`,
      });
      setBusyMessage(`已导出：${result.path}`);
    } catch (reason) {
      setError(errorText(reason));
      setBusyMessage("");
    }
  }, [currentProject]);

  /** 加入画布: 剧本 → 替换工作室项目(复用桥接,后续可在画布编排/合成)。 */
  const syncToCanvas = useCallback(async () => {
    const api = hostRef.current;
    if (!api || !currentProject) return;
    setBusyMessage("正在同步到画布/替换工作室…");
    setError("");
    try {
      const snapshot = buildStorySyncSnapshot(currentProject, providerId);
      const loaded = await api.loadReplacementProjects();
      const rawProjects = Array.isArray(loaded)
        ? loaded
        : Array.isArray((loaded as { projects?: unknown[] })?.projects)
          ? (loaded as { projects: unknown[] }).projects
          : [];
      const projects = rawProjects as RsProject[];
      const existing = findProjectByTitle(projects, snapshot.title || "");
      const saved = existing
        ? await api.saveReplacementProject(syncCharactersIntoProject(existing, snapshot.characters))
        : await api.saveReplacementProject(buildReplacementProject(snapshot));
      if (!saved.ok) throw new Error(saved.error || "保存替换项目失败");
      const opened = await api.openReplacementStudio();
      setBusyMessage(opened ? "已同步到替换工作室。" : "项目已同步，请在侧栏「替换工作室」查看。");
    } catch (reason) {
      setError(errorText(reason));
      setBusyMessage("");
    }
  }, [currentProject, providerId]);

  const handleStepNext = useCallback(async () => {
    if (!currentProject || operation) return;
    if (step === 1) {
      await extractAssets();
      setStep(2);
    } else if (step === 2) {
      planEpisodes();
      setStep(3);
    } else {
      await buildClips();
      setStep(3);
    }
  }, [currentProject, step, operation, extractAssets, planEpisodes, buildClips]);

  // ---- 渲染:工具条(对齐 chrome projection/presentation) ----
  const renderProjectToolbar = useCallback(() => {
    if (!currentProject) return null;
    const steps = STORY_STEPS.map((s) => ({
      id: s.id,
      label: s.id === 1 ? resolveStepOneLabel(currentProject.sourceMode) : s.label,
      active: step === s.id,
      disabled: isStepDisabled(s.id),
    }));
    const blockMessage = stepBlockMessage(step);
    const epOptions = (currentProject.episodes || [])
      .filter((e) => (e.clips?.length ?? 0) > 0)
      .map((e) => ({ id: e.id, name: e.name || `第 ${e.number} 集`, clipCount: e.clips?.length ?? 0 }));
    return (
      <header className="story-project-toolbar">
        <button type="button" className="story-toolbar-back" onClick={() => setView({ kind: "home" })}>
          <span className="story-toolbar-back-icon" aria-hidden="true" />
          <span>剧本项目</span>
        </button>
        <nav className="story-step-navigation" data-active-step={step} aria-label="剧本制作步骤">
          {steps.map((s) => (
            <button
              type="button"
              key={s.id}
              className={"story-step" + (s.active ? " is-active" : "")}
              data-story-step={s.id}
              aria-current={s.active ? "step" : "false"}
              disabled={s.disabled}
              onClick={() => {
                if (!s.disabled) setStep(s.id);
              }}
            >
              <span>{s.id}</span>
              {s.label}
            </button>
          ))}
        </nav>
        {blockMessage && <span className="story-error" style={{ fontSize: 12 }}>{blockMessage}</span>}
        <div className="story-episode-toolbar-side">
          <div className="story-episode-switcher">
            <button type="button" className="story-episode-toolbar-current" aria-haspopup={epOptions.length ? "menu" : undefined}>
              <span>{step === 3 && (currentProject.episodes?.length ?? 0) ? "分集详情" : "分集视频"}</span>
              {epOptions.length > 0 && <span className="story-episode-switcher-chevron" aria-hidden="true">▾</span>}
            </button>
            {epOptions.length > 0 && (
              <div className="story-episode-switcher-menu" role="menu" aria-label="切换已生成分集">
                {epOptions.map((e) => (
                  <button type="button" key={e.id} className="story-episode-switcher-option" role="menuitem">
                    <span>{e.name}</span>
                    <small>已生成 {e.clipCount} 个分镜片段</small>
                  </button>
                ))}
              </div>
            )}
          </div>
          <button type="button" className="story-workbench-action-button" onClick={() => void syncToCanvas()}>
            <span>加入画布</span>
            <span className="story-canvas-sync-chevron" aria-hidden="true">▾</span>
          </button>
          <button type="button" className="story-workbench-action-button" onClick={() => void exportStoryboard()}>
            <span>导出</span>
            <span aria-hidden="true">▾</span>
          </button>
        </div>
      </header>
    );
  }, [currentProject, step, onExit, isStepDisabled, stepBlockMessage, syncToCanvas, exportStoryboard]);

  // ---- 渲染:页面主体 ----
  const renderProjectBody = useCallback(() => {
    if (!currentProject) return null;
    if (step === 1) {
      return (
        <div className="story-body">
          <h2 className="story-section-title">{resolveStepOneLabel(currentProject.sourceMode)}</h2>
          <p className="story-section-hint">从完整剧本生成剧情大纲与分集结构。</p>
          <div className="story-panel">
            <span className="story-field-label">完整剧本</span>
            <textarea
              className="story-textarea"
              value={currentProject.scriptText}
              placeholder="生成的剧本将显示在这里…"
              onChange={(e) => patchProject(currentProject.id, { scriptText: e.target.value })}
            />
            <p className="story-hint">可在此编辑剧本；生成素材与分镜时会沿用这里的正文与角色/场景。</p>
          </div>
        </div>
      );
    }
    if (step === 2) {
      const tabs: Array<{ key: "character" | "scene" | "prop" | "library"; label: string }> = [
        { key: "character", label: "角色" },
        { key: "scene", label: "场景" },
        { key: "prop", label: "道具" },
        { key: "library", label: "素材库" },
      ];
      const assetKind = assetTab === "library" ? null : (assetTab as StoryAsset["kind"]);
      const assets = (currentProject.assets || []).filter((a) => (assetKind ? a.kind === assetKind : true));
      const kindLabel = tabs.find((t) => t.key === assetTab)?.label || "";
      return (
        <div className="story-body">
          <h2 className="story-section-title">素材设定</h2>
          <p className="story-section-hint">设定角色、场景、道具及其形象参考图，生成时自动注入提示词与 references。</p>
          <div className="story-panel">
            <div className="story-asset-tabs">
              {tabs.map((t) => (
                <button
                  type="button"
                  key={t.key}
                  className={"story-asset-tab" + (assetTab === t.key ? " is-active" : "")}
                  onClick={() => setAssetTab(t.key)}
                >
                  {t.label}
                </button>
              ))}
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
              {assetKind && (
                <>
                  <button
                    type="button"
                    className="story-primary-button"
                    style={{ fontSize: 12, padding: "7px 12px" }}
                    disabled={batchAssetBusy || assets.length === 0}
                    onClick={() => void batchGenerateAssets(assetKind)}
                  >
                    {batchAssetBusy ? "批量生成中…" : `批量生成${kindLabel}形象`}
                  </button>
                  <button
                    type="button"
                    className="story-secondary-button"
                    style={{ fontSize: 12, padding: "7px 12px" }}
                    onClick={() => void importAssetFromLibrary(assetKind)}
                  >
                    + 从文件导入{kindLabel}
                  </button>
                </>
              )}
              <span className="story-hint" style={{ alignSelf: "center" }}>
                {assetTab === "library" ? "全部素材（角色/场景/道具）" : `共 ${assets.length} 个${kindLabel}`}
              </span>
            </div>
            <div className="story-asset-grid">
              {assets.length === 0 ? (
                <div className="story-empty">
                  {assetTab === "library" ? "素材库为空，请先从文件导入或切换到角色/场景/道具。" : `还没有${kindLabel}素材，点击「从文件导入${kindLabel}」添加。`}
                </div>
              ) : (
                assets.map((a) => (
                  <article className="story-asset-card" key={a.id}>
                    <div className="story-asset-card-thumb">
                      {a.appearances[0]?.url ? (
                        <img src={a.appearances[0].url} alt={a.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      ) : (
                        a.name
                      )}
                    </div>
                    <strong>{a.name}</strong>
                    <small>{a.description || "无描述"}</small>
                    <small style={{ color: "var(--story-text-2)", fontSize: 11 }}>{a.appearances.length} 张形象参考图</small>
                    <div className="story-asset-card-actions" style={{ padding: "0 10px", display: "flex", gap: 6, flexWrap: "wrap" }}>
                      <button
                        type="button"
                        className="story-secondary-button"
                        style={{ fontSize: 12, padding: "6px 10px" }}
                        disabled={Boolean(assetImageBusy[a.id])}
                        onClick={() => void generateAssetImage(a.id)}
                      >
                        {assetImageBusy[a.id] ? "生成中…" : "生成形象"}
                      </button>
                      <button
                        type="button"
                        className="story-secondary-button"
                        style={{ fontSize: 12, padding: "6px 10px" }}
                        onClick={() => void pickAssetReference(a.id)}
                      >
                        选择参考图
                      </button>
                    </div>
                  </article>
                ))
              )}
            </div>
          </div>
        </div>
      );
    }
    // step 3
    const episodes = currentProject.episodes || [];
    return (
      <div className="story-body">
        <h2 className="story-section-title">分集视频</h2>
        <p className="story-section-hint">按集生成分镜片段与视频。</p>
        <div className="story-panel" style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 10 }}>
          <label className="story-field-label">视频模型</label>
          <select
            className="story-select"
            style={{ width: 220 }}
            value={currentProject.videoModel || models[1] || models[0] || ""}
            onChange={(ev) => patchProject(currentProject.id, { videoModel: ev.target.value })}
          >
            {models.length === 0 && <option value="">(无可用模型)</option>}
            {models.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
          <label className="story-field-label">质量</label>
          <select
            className="story-select"
            style={{ width: 120 }}
            value={currentProject.videoResolution || "720p"}
            onChange={(ev) => patchProject(currentProject.id, { videoResolution: ev.target.value })}
          >
            <option value="480p">480p</option>
            <option value="720p">720p</option>
            <option value="1080p">1080p</option>
          </select>
          <button
            type="button"
            className="story-primary-button"
            style={{ fontSize: 12, padding: "7px 12px" }}
            disabled={batchVideoBusy}
            onClick={() => void batchGenerateAllVideos()}
          >
            {batchVideoBusy ? "批量生成中…" : "批量生成全部视频"}
          </button>
        </div>
        {episodes.length === 0 ? (
          <div className="story-empty">还没有分集。请先点击「下一步」生成分集大纲。</div>
        ) : (
          <div className="story-episode-grid">
            {episodes.map((e) => {
              const expanded = expandedEpisodeId === e.id;
              const clips = e.clips || [];
              return (
                <article className="story-episode-card" key={e.id}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <strong>{e.name || `第 ${e.number} 集`}</strong>
                    <button
                      type="button"
                      className="story-secondary-button"
                      style={{ fontSize: 12, padding: "5px 9px" }}
                      onClick={() => setExpandedEpisodeId(expanded ? null : e.id)}
                    >
                      {expanded ? "收起" : "展开分镜"}
                    </button>
                  </div>
                  <small>{clips.length} 个分镜片段 · {e.scriptText.length} 字正文</small>
                  {expanded && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 6 }}>
                      {clips.length === 0 && (
                        <div className="story-empty" style={{ padding: 20 }}>
                          本集还没有分镜片段。
                          <button type="button" className="story-secondary-button" onClick={() => void buildClips()}>
                            生成分镜片段
                          </button>
                        </div>
                      )}
                      {clips.map((c) => (
                        <div key={c.id} style={{ border: "1px solid var(--story-border)", borderRadius: 9, padding: 10, display: "flex", flexDirection: "column", gap: 6 }}>
                          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                            <span style={{ color: "var(--story-text-2)", fontSize: 12 }}>#{c.number}</span>
                            <input
                              className="story-text-input"
                              style={{ flex: 1, padding: "6px 8px" }}
                              value={c.durationSec}
                              type="number"
                              min={1}
                              max={15}
                              onChange={(ev) => patchClip(e.id, c.id, { durationSec: Math.max(1, Math.min(15, Number(ev.target.value) || 5)) })}
                            />
                            <span style={{ color: "var(--story-text-2)", fontSize: 12 }}>秒</span>
                            <span className="story-project-status">{clipStatusLabel(c.status)}</span>
                          </div>
                          <textarea
                            className="story-textarea"
                            style={{ minHeight: 48, fontSize: 12 }}
                            value={c.description}
                            onChange={(ev) => patchClip(e.id, c.id, { description: ev.target.value })}
                          />
                          <div style={{ display: "flex", gap: 6 }}>
                            <button
                              type="button"
                              className="story-secondary-button"
                              style={{ fontSize: 12, padding: "6px 10px" }}
                              disabled={Boolean(clipBusy[c.id]) || c.status === "running"}
                              onClick={() => void generateClipVideo(e.id, c.id)}
                            >
                              {clipBusy[c.id] || c.status === "running" ? "生成中…" : "生成镜头视频"}
                            </button>
                            {c.videoPath && (
                              <button type="button" className="story-secondary-button" style={{ fontSize: 12, padding: "6px 10px" }} onClick={() => void hostRef.current?.showItem(c.videoPath!)}>
                                打开视频
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </div>
    );
  }, [
    currentProject,
    step,
    patchProject,
    patchClip,
    assetTab,
    setAssetTab,
    expandedEpisodeId,
    setExpandedEpisodeId,
    generateAssetImage,
    assetImageBusy,
    generateClipVideo,
    clipBusy,
    buildClips,
    batchGenerateAssets,
    pickAssetReference,
    importAssetFromLibrary,
    batchAssetBusy,
    batchGenerateAllVideos,
    batchVideoBusy,
    models,
  ]);

  // ---- 渲染:首页 ----
  const renderHome = useCallback(() => {
    const entries = getStoryProjectHomeEntries(projects, {
      query: home.projectSearchQuery,
      sortOrder: home.projectSortOrder,
      showArchived: home.showArchivedProjects,
    });
    const styleSel = resolveStoryStyleSelection({
      videoStyleId: home.videoStyleId,
      videoStylePrompt: home.videoStylePrompt,
      videoStyle: home.videoStylePrompt,
      customVideoStylePrompt: home.customVideoStylePrompt,
    });
    return (
      <div className="story-home-page">
        <section className="story-home-hero">
          <span className="story-eyebrow">Story Studio · 剧本工作室</span>
          <h1>从一个想法到完整的AI视频</h1>
        </section>

        <section className={"story-home-composer" + (generating ? " is-generating" : "")} aria-busy={generating}>
          <div className="story-home-tabs" data-story-home-tabs data-active-tab={home.homeTab} role="tablist">
            {STORY_HOME_TABS.map((t) => (
              <button
                type="button"
                key={t.id}
                className={"story-home-tab" + (home.homeTab === t.id ? " is-active" : "")}
                data-story-home-tab={t.id}
                role="tab"
                aria-selected={home.homeTab === t.id}
                onClick={() => patchHome({ homeTab: t.id })}
              >
                <span className="story-home-tab-icon" aria-hidden="true">{storyHomeTabIcon(t.id)}</span>
                <span className="story-home-tab-content">{t.label}</span>
              </button>
            ))}
          </div>

          <div className="story-home-composer-body">
            {renderComposerBody()}
          </div>

          <div className="story-home-model-bar">
            <div className="story-home-model-controls">
              <TextModelSelector
                providers={providers}
                modelsByProvider={modelsByProvider}
                providerId={providerId}
                model={models[0] || ""}
                onSelect={(pid, mdl) => {
                  setProviderId(pid);
                  setModels((prev) => [mdl, ...prev.filter((m) => m !== mdl)]);
                }}
              />
              <StoryPicker
                label="画面比例"
                value={home.aspectRatio}
                options={STORY_ASPECT_RATIO_OPTIONS.map((o) => ({ value: o.value, label: o.selectedLabel || o.label }))}
                onSelect={(v) => patchHome({ aspectRatio: v })}
                icon="▭"
              />
              <StoryPicker
                label="单片段提示词模式"
                value={home.promptMode}
                options={STORY_PROMPT_MODE_OPTIONS.map((o) => ({ value: o.value, label: o.label, disabled: !o.enabled }))}
                onSelect={(v) => patchHome({ promptMode: v as StoryHomeState["promptMode"] })}
                icon="✦"
                format={(v) => storyPromptModeLabel(v)}
              />
              {home.homeTab === "generate" && (
                <StoryPicker
                  label="目标分集数"
                  value={String(home.episodeCount)}
                  options={STORY_PUBLIC_EPISODE_COUNT_OPTIONS.map((n) => ({ value: String(n), label: `${n}集` }))}
                  onSelect={(v) => patchHome({ episodeCount: Number(v) })}
                  icon="≡"
                />
              )}
              {home.homeTab !== "generate" && (
                <StoryPicker
                  label="语种与地区"
                  value={home.replicationTargetLocale}
                  options={STORY_REPLICATION_LOCALES.map((o) => ({ value: o.value, label: o.shortLabel }))}
                  onSelect={(v) => patchHome({ replicationTargetLocale: v })}
                  icon="文"
                />
              )}
              {home.homeTab === "generate" && (
                <StoryStylePicker
                  value={styleSel.styleId}
                  customPrompt={home.customVideoStylePrompt || home.videoStylePrompt}
                  onSelect={(styleId, stylePrompt) =>
                    patchHome({
                      videoStyleId: styleId,
                      videoStylePrompt: stylePrompt,
                      customVideoStylePrompt: styleId === STORY_STYLE_CUSTOM_ID ? stylePrompt : "",
                    })
                  }
                />
              )}
            </div>
            <button
              type="button"
              className="story-primary-button story-home-generate"
              data-story-action="generate-story"
              disabled={generating}
              aria-busy={generating}
              onClick={() => void handleGenerateStory()}
            >
              <span>{generating ? (home.homeTab === "replication" ? "分析中…" : "生成中…") : generateButtonLabel()}</span>
              {!generating && <span className="story-generate-arrow" aria-hidden="true">→</span>}
            </button>
          </div>

          {generating && (
            <div className="story-home-generation-loading" role="status" aria-live="polite">
              <div className="storyboard-script-loading-spinner" />
              <div className="storyboard-script-loading-label">{busyMessage || "正在创建剧情"}</div>
              <div className="storyboard-script-loading-bar">
                <div className="storyboard-script-loading-bar-fill" />
              </div>
            </div>
          )}
        </section>

        <section className="story-projects-section">
          <div className="story-section-heading">
            <div>
              <h2>{home.showArchivedProjects ? "已归档项目" : "我的剧本项目"}</h2>
            </div>
            <div className="story-project-list-controls">
              <label className="story-project-search">
                <span aria-hidden="true">⌕</span>
                <input
                  type="search"
                  placeholder="搜索项目名称"
                  aria-label="搜索剧本项目"
                  value={home.projectSearchQuery}
                  onChange={(e) => patchHome({ projectSearchQuery: e.target.value })}
                />
              </label>
              <StoryPicker
                label="项目排序"
                value={home.projectSortOrder}
                options={STORY_PROJECT_SORT_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
                onSelect={(v) => patchHome({ projectSortOrder: v })}
              />
              <button
                type="button"
                className={"story-project-archive-toggle" + (home.showArchivedProjects ? " is-active" : "")}
                aria-pressed={home.showArchivedProjects}
                onClick={() => patchHome({ showArchivedProjects: !home.showArchivedProjects })}
              >
                {home.showArchivedProjects ? "返回项目" : "归档项目"}
              </button>
            </div>
          </div>

          {projects.length === 0 ? (
            <div className="story-project-empty">
              <strong>还没有剧本项目</strong>
              <span>创建项目后，它会保存在当前用户项目数据中。</span>
              <button type="button" className="story-primary-button story-project-empty-action" onClick={createEmptyProject}>
                创建第一个项目
              </button>
            </div>
          ) : entries.length === 0 ? (
            <div className="story-project-filter-empty">
              <strong>{home.showArchivedProjects ? "没有匹配的归档项目" : "没有匹配的剧本项目"}</strong>
              <span>可以尝试其他搜索词，或清空搜索条件。</span>
            </div>
          ) : (
            <div className="story-project-grid">
              {entries.map((p) => (
                <article
                  className={"story-project-card" + (p.archivedAt > 0 ? " is-archived" : "")}
                  key={p.id}
                  onClick={() => openProject(p, 1)}
                >
                  <div className="story-project-cover story-media-empty">
                    {p.archivedAt > 0 ? "" : <span className="story-project-empty-label">{storyProjectTypeLabel(p)}</span>}
                    <div className="story-project-menu-wrap" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        className="story-project-menu-trigger"
                        aria-label={`${p.title} 项目操作`}
                        aria-haspopup="menu"
                        onClick={() => setMenus((m) => ({ ...m, [p.id]: !m[p.id] }))}
                      >
                        •••
                      </button>
                      {menus[p.id] && (
                        <div className="story-project-menu" role="menu">
                          <button type="button" role="menuitem" onClick={() => renameProject(p.id)}>重命名</button>
                          <button type="button" role="menuitem" onClick={() => duplicateProject(p.id)}>复制项目</button>
                          <button type="button" role="menuitem" onClick={() => patchProject(p.id, { archivedAt: p.archivedAt > 0 ? 0 : Date.now() })}>
                            {p.archivedAt > 0 ? "取消归档" : "归档项目"}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="story-project-type">{storyProjectTypeLabel(p)}</div>
                  <div className="story-project-card-copy">
                    <strong>{p.title || "未命名项目"}</strong>
                    <div className="story-project-card-meta">
                      <small>
                        {p.episodes?.length ?? 0} 集 · {(p.assets?.length ?? 0)} 素材
                      </small>
                      <span className="story-project-status">{formatRelativeTime(p.updatedAt)}</span>
                    </div>
                  </div>
                </article>
              ))}
              {!home.showArchivedProjects && (
                <button type="button" className="story-project-create-tile" onClick={createEmptyProject} aria-label="新建剧本项目">
                  <span aria-hidden="true">+</span>
                  <strong>新建剧本项目</strong>
                </button>
              )}
            </div>
          )}
        </section>

        {error && <p className="story-error">{error}</p>}
      </div>
    );
  }, [
    projects,
    home,
    generating,
    models,
    modelsByProvider,
    providers,
    modelProviders(providers),
    providerId,
    styleSelHome(home.videoStyleId, home.videoStylePrompt),
    openProject,
    createEmptyProject,
    handleGenerateStory,
    renameProject,
    duplicateProject,
    patchProject,
    patchHome,
    error,
    busyMessage,
    setMenus,
  ]);

  function renderComposerBody() {
    if (home.homeTab === "generate") {
      return (
        <div className="story-home-composer-panel story-home-input-wrap story-home-story-input story-home-creation-input">
          <div className="story-home-creation-copy">
            <label className="story-field-label" htmlFor="storyIdeaInput">输入故事设定</label>
            <textarea
              id="storyIdeaInput"
              data-story-idea-input
              value={home.idea}
              placeholder="输入你想创作的剧本内容，或上传参考剧本进行改编……"
              onChange={(e) => patchHome({ idea: e.target.value })}
            />
            <div className="story-home-input-meta">
              <p>{storyScriptModeLabel(home.scriptMode, "current")} · {storyPromptModeLabel(home.promptMode)} · {home.episodeCount} 集 · {home.aspectRatio}</p>
              <span>{(home.idea || "").length} / 1000</span>
            </div>
          </div>
        </div>
      );
    }
    if (home.homeTab === "replication") {
      return (
        <div className="story-home-composer-panel story-replication-upload">
          <div className="story-replication-upload-empty">
            <strong>上传需要复刻的视频</strong>
            <p>支持多选 MP4、MOV、AVI；每条视频不超过 50MB。</p>
          </div>
          <div className="story-upload-actions">
            <button type="button" className="story-secondary-button" onClick={() => setError("复刻视频功能将在后续阶段接入。")}>
              上传视频
            </button>
          </div>
        </div>
      );
    }
    // upload tab
    if (home.uploadInputMode === "paste") {
      return (
        <div className="story-home-composer-panel story-home-input-wrap story-home-story-input story-home-paste-input">
          <label className="story-field-label" htmlFor="storyPasteInput">粘贴剧本文本</label>
          <textarea
            id="storyPasteInput"
            data-story-paste-input
            value={home.scriptText}
            placeholder="在这里粘贴完整剧本……"
            onChange={(e) => patchHome({ scriptText: e.target.value })}
          />
          <div className="story-home-input-meta">
            <p>支持最多 60000 字，将按原稿导入，不扩写、不重新分集。</p>
            <span>{(home.scriptText || "").length} / 60000</span>
          </div>
          <div className="story-upload-actions">
            <button type="button" className="story-secondary-button" onClick={() => patchHome({ uploadInputMode: "file" })}>
              上传剧本
            </button>
            <button type="button" className="story-secondary-button is-active" aria-pressed="true">
              粘贴文本
            </button>
          </div>
        </div>
      );
    }
    return (
      <div className="story-home-composer-panel story-upload-drop">
        <strong>{home.scriptFileName || "上传剧本文件"}</strong>
        <p>{home.scriptFileName ? "剧本已就绪，将按原稿结构导入并直接提取素材。" : "支持 TXT、DOCX、文本型 PDF，文本内容不超过 60000 字。"}</p>
        <div className="story-upload-actions">
          <button type="button" className="story-secondary-button" onClick={() => setError("请在桌面端使用文件选择器上传剧本文件（后续阶段接入）。")}>
            上传剧本
          </button>
          <button type="button" className="story-secondary-button" aria-pressed="false" onClick={() => patchHome({ uploadInputMode: "paste" })}>
            粘贴文本
          </button>
        </div>
      </div>
    );
  }

  function generateButtonLabel() {
    if (home.homeTab === "replication") return "开始分析";
    if (home.homeTab === "upload") return "导入剧本";
    return "生成剧本";
  }

  return (
    <div className="story-studio" role="dialog" aria-label="剧本工作室">
      {view.kind === "home" ? (
        renderHome()
      ) : (
        <div className="story-project-page">
          {renderProjectToolbar()}
          {renderProjectBody()}
          <footer className="story-page-footer">
            <div>
              <strong>{stepTitle()}</strong>
              <small>{stepHint()}</small>
            </div>
            <div className="story-page-footer-actions">
              <button type="button" className="story-secondary-button" onClick={handleStepBack}>
                上一步
              </button>
              <button type="button" className="story-next-button" onClick={() => void handleStepNext()} disabled={Boolean(operation)}>
                <span>{stepNextLabel()}</span>
                {!operation && <span className="story-next-arrow" aria-hidden="true">→</span>}
              </button>
            </div>
          </footer>
        </div>
      )}
    </div>
  );

  function stepTitle() {
    if (operation === "extract-assets") return "正在提取角色、场景和道具…";
    if (operation === "plan-episode-outlines") return "正在生成分集大纲…";
    if (operation === "build-clips") return "正在生成分镜片段…";
    if (step === 1) return resolveStepOneLabel(currentProject?.sourceMode || "generate");
    if (step === 2) return "素材设定";
    return "分集视频";
  }
  function stepHint() {
    if (operation) return "请稍候…";
    if (step === 1) return "点击「下一步」提取角色、场景与道具";
    if (step === 2) return "点击「下一步」生成分集大纲并进入分集视频";
    return "为每个分集生成分镜片段与视频";
  }
  function stepNextLabel() {
    if (operation === "extract-assets") return "提取素材…";
    if (operation === "plan-episode-outlines") return "生成分集大纲…";
    if (operation === "build-clips") return "生成分镜片段…";
    return step === 3 ? "生成分集" : "下一步";
  }
}

function generateTitleFromScript(script: string): string {
  const firstLine = script.split("\n").map((l) => l.trim()).find(Boolean) || "";
  return firstLine.slice(0, 20) || "剧本项目";
}

function extractSummary(script: string): string {
  return script.trim().slice(0, 160);
}

function formatRelativeTime(ts: number): string {
  if (!ts) return "刚刚";
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60000);
  if (m < 1) return "刚刚";
  if (m < 60) return `${m} 分钟前`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} 小时前`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d} 天前`;
  return new Date(ts).toLocaleDateString("zh-CN", { month: "numeric", day: "numeric" });
}

/** 首页 tab 图标(对齐 renderStoryHomeTabIcon)。 */
function storyHomeTabIcon(tab: string): string {
  if (tab === "upload") {
    return '<svg viewBox="0 0 24 24" fill="none"><path d="M12 15V4M7.5 8.5 12 4l4.5 4.5"/><path d="M4 14.5v3.75A1.75 1.75 0 0 0 5.75 20h12.5A1.75 1.75 0 0 0 20 18.25V14.5"/></svg>';
  }
  if (tab === "replication") {
    return '<svg viewBox="0 0 24 24" fill="none"><rect x="3.5" y="5" width="13" height="14" rx="2"/><path d="m16.5 9 4-2v10l-4-2z"/><path d="m8.5 9 4 3-4 3z"/></svg>';
  }
  return '<svg viewBox="0 0 24 24" fill="none"><path d="m11.5 3 .9 3.1a4.7 4.7 0 0 0 3.2 3.2l3.1.9-3.1.9a4.7 4.7 0 0 0-3.2 3.2l-.9 3.1-.9-3.1a4.7 4.7 0 0 0-3.2-3.2l-3.1-.9 3.1-.9a4.7 4.7 0 0 0 3.2-3.2z"/><path d="m18.5 15.5.35 1.15a2.2 2.2 0 0 0 1.5 1.5l1.15.35-1.15.35a2.2 2.2 0 0 0-1.5 1.5l-.35 1.15-.35-1.15a2.2 2.2 0 0 0-1.5-1.5l-1.15-.35 1.15-.35a2.2 2.2 0 0 0 1.5-1.5z"/></svg>';
}

function clipStatusLabel(status: string): string {
  switch (status) {
    case "running":
      return "生成中";
    case "done":
      return "已生成";
    case "error":
      return "生成失败";
    default:
      return "未生成";
  }
}

/** 把 StoryStudio 项目映射为故事板→替换工作室的快照(桥接输入)。 */
function buildStorySyncSnapshot(project: StoryProject, providerId: string): StoryboardSyncSnapshot {
  const characters: StoryCharacter[] = (project.assets || [])
    .filter((a) => a.kind === "character")
    .map((a) => ({
      id: a.id,
      name: a.name,
      description: a.description,
      referencePath: a.appearances[0]?.path || undefined,
    }));
  const shots: StoryboardSyncedShot[] = [];
  for (const ep of project.episodes || []) {
    for (const clip of ep.clips || []) {
      const shot: StoryboardShot = {
        id: clip.id,
        index: clip.number,
        size: "medium",
        cameraMove: "static",
        description: clip.description || "",
        dialogue: clip.dialogue || undefined,
        sfx: clip.sfx || undefined,
        durationSec: clip.durationSec,
        prompt: clip.description || "",
      };
      shots.push({
        shot,
        imageResults: [],
        videoResults: clip.videoPath ? [{ path: clip.videoPath }] : [],
      });
    }
  }
  return {
    title: project.title,
    aspectRatio: project.aspectRatio,
    characters,
    shots,
    providerId,
    imageModel: "",
    videoModel: project.videoModel,
    imageSize: "512x512",
    videoResolution: project.videoResolution,
  };
}

function collectStoryClips(project: StoryProject): Array<{ episodeId: string; clip: StoryClip }> {
  const out: Array<{ episodeId: string; clip: StoryClip }> = [];
  for (const ep of project.episodes || []) {
    for (const clip of ep.clips || []) out.push({ episodeId: ep.id, clip });
  }
  return out;
}

function storyboardToText(project: StoryProject): string {
  const lines: string[] = [];
  lines.push(`# ${project.title || "剧本分镜表"}`);
  lines.push(`画幅：${project.aspectRatio}   分集数：${(project.episodes || []).length}`);
  lines.push("");
  for (const [i, ep] of (project.episodes || []).entries()) {
    lines.push(`## 第 ${i + 1} 集 ${ep.name || ""}`);
    if (ep.scriptText) lines.push(ep.scriptText);
    for (const clip of ep.clips || []) {
      const parts = [`- ${clip.number}. (${clip.durationSec}s) ${clip.description || ""}`];
      if (clip.dialogue) parts.push(`「${clip.dialogue}」`);
      if (clip.sfx) parts.push(`【${clip.sfx}】`);
      if (clip.videoPath) parts.push("[视频已生成]");
      lines.push(parts.join(""));
    }
    lines.push("");
  }
  return lines.join("\n");
}

// 帮助树摇/类型收窄:提供稳定的 hooks 依赖。
function modelProviders(providers: SwProviderInfo[]) {
  return providers.map((p) => p.id).join(",");
}
function styleSelHome(styleId: string, stylePrompt: string) {
  return `${styleId}:${stylePrompt}`;
}
