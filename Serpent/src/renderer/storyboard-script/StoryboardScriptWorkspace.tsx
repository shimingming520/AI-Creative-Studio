/**
 * 剧本工作室 — 分镜脚本生成 + 资产设定 + 分镜批量生成(阶段2)。
 *
 * 流程:
 *   1) 文案 → 中转站 chat 生成分镜脚本(镜头表 + 视频提示词);
 *   2) 角色资产设定:名字/描述/形象参考图(生成时注入提示词 + references);
 *   3) 逐镜/批量生成参考图(云生图)与镜头视频(云生视频),
 *      结果落盘输出目录,资源管理「生成资产」自动可见。
 *
 * 后续阶段(Track A 迭代):镜头生成后与替换工作室联动(人物替换/声音克隆)。
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  buildShotImagePrompt,
  buildShotVideoPrompt,
  buildStoryboardSystemPrompt,
  buildStoryboardUserPrompt,
  finalizeGenerationPrompt,
  normalizeCharacterAssets,
  parseStoryScript,
  scriptToPlainText,
  type StoryboardInput,
  type StoryboardScript,
  type StoryboardShot,
  type StoryCharacter,
} from "../../shared/storyboard-script";
import {
  buildReplacementProject,
  findProjectByTitle,
  syncCharactersIntoProject,
  type StoryboardSyncSnapshot,
} from "../../shared/storyboard-replacement";
import type { RsProject } from "../../shared/replacement-studio";
import {
  ensureSwHostApi,
  errorText,
  type SwHostApi,
  type SwProviderInfo,
} from "./host";
import "./storyboard-script.css";

const DRAFT_KEY = "sw:draft:v1";

type GenStatus = "idle" | "running" | "done" | "error";

type GenItem = {
  path: string;
  url?: string | null;
};

type GenState = {
  status: GenStatus;
  items: GenItem[];
  error?: string;
};

type GenMap = Record<string, { image: GenState; video: GenState }>;

const IDLE_GEN: GenState = { status: "idle", items: [] };

type DraftState = {
  /** 稳定项目 id：剧本工作室以「草稿=一个项目」为单位，用于分级与资源归档目录。 */
  projectId: string;
  projectTitle: string;
  story: string;
  style: string;
  shotCount: number;
  aspectRatio: string;
  providerId: string;
  model: string;
  imageModel: string;
  videoModel: string;
  imageSize: string;
  videoResolution: string;
  characters: StoryCharacter[];
};

const DEFAULT_DRAFT: DraftState = {
  projectId: "",
  projectTitle: "",
  story: "",
  style: "",
  shotCount: 8,
  aspectRatio: "16:9",
  providerId: "",
  model: "",
  imageModel: "",
  videoModel: "",
  imageSize: "1280x720",
  videoResolution: "720p",
  characters: [],
};

/** 生成一个稳定的剧本项目 id（sw-<time36>-<rand>）。 */
function newStoryProjectId(): string {
  return `sw-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

const IMAGE_SIZES = ["1024x1024", "1280x720", "720x1280", "1536x1024", "1024x1536"];
const VIDEO_RESOLUTIONS = ["480p", "720p", "1080p"];

function genForShot(genMap: GenMap, shotId: string): { image: GenState; video: GenState } {
  return genMap[shotId] ?? { image: IDLE_GEN, video: IDLE_GEN };
}

function loadDraft(): DraftState {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return DEFAULT_DRAFT;
    const parsed = JSON.parse(raw) as Partial<DraftState>;
    const draft: DraftState = {
      ...DEFAULT_DRAFT,
      ...parsed,
      projectId: parsed.projectId || newStoryProjectId(),
      projectTitle: parsed.projectTitle || "",
      story: parsed.story ?? "",
      characters: normalizeCharacterAssets(parsed.characters),
    };
    // 补齐稳定项目 id 后回写,保证后续访问同一目录。
    if (!parsed.projectId) localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    return draft;
  } catch {
    return DEFAULT_DRAFT;
  }
}

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    const ok = document.execCommand("copy");
    textarea.remove();
    return ok;
  }
}

export function StoryboardScriptWorkspace({
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
  const [draft, setDraft] = useState<DraftState>(loadDraft);
  const [providers, setProviders] = useState<SwProviderInfo[]>([]);
  const [models, setModels] = useState<string[]>([]);
  const [generating, setGenerating] = useState(false);
  const [script, setScript] = useState<StoryboardScript | null>(null);
  const [rawJson, setRawJson] = useState("");
  const [showJson, setShowJson] = useState(false);
  const [busyMessage, setBusyMessage] = useState("");
  const [error, setError] = useState("");
  const [hostReady, setHostReady] = useState(false);
  const [genMap, setGenMap] = useState<GenMap>({});
  const [thumbs, setThumbs] = useState<Record<string, string | null>>({});
  const [batchBusy, setBatchBusy] = useState<"image" | "video" | null>(null);
  const [batchProgress, setBatchProgress] = useState<{ done: number; total: number } | null>(
    null,
  );
  const [syncing, setSyncing] = useState(false);
  const hostRef = useRef<SwHostApi | null>(null);
  const draftTimer = useRef<number | null>(null);

  // 宿主初始化 + 中转站列表。
  useEffect(() => {
    let cancelled = false;
    ensureSwHostApi()
      .then((host) => {
        if (cancelled) return;
        hostRef.current = host;
        setHostReady(true);
        return host.listProviders();
      })
      .then((list) => {
        if (cancelled) return;
        const enabled = (Array.isArray(list) ? list : []).filter(
          (provider) => provider.enabled && provider.hasApiKey,
        );
        setProviders(enabled);
        setDraft((prev) => ({
          ...prev,
          providerId: prev.providerId || enabled[0]?.id || "",
        }));
      })
      .catch((reason) => {
        if (!cancelled) setError(errorText(reason));
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // 草稿持久化(防抖)。
  const persistDraft = useCallback((next: DraftState) => {
    if (draftTimer.current !== null) window.clearTimeout(draftTimer.current);
    draftTimer.current = window.setTimeout(() => {
      try {
        localStorage.setItem(DRAFT_KEY, JSON.stringify(next));
      } catch {
        // 忽略配额错误
      }
    }, 300);
  }, []);

  const patchDraft = useCallback(
    (patch: Partial<DraftState>) => {
      setDraft((prev) => {
        const next = { ...prev, ...patch };
        persistDraft(next);
        return next;
      });
    },
    [persistDraft],
  );

  // 切换中转站时刷新模型列表。
  useEffect(() => {
    let cancelled = false;
    const providerId = draft.providerId;
    const load = providerId
      ? hostRef.current?.listModels(providerId) ?? Promise.resolve({ models: [] })
      : Promise.resolve({ models: [] });
    load
      .then((result) => {
        if (cancelled) return;
        const list = Array.isArray(result?.models) ? result.models : [];
        setModels(list);
        setDraft((prev) => ({
          ...prev,
          model: prev.model && list.includes(prev.model) ? prev.model : list[0] || "",
          imageModel:
            prev.imageModel && list.includes(prev.imageModel)
              ? prev.imageModel
              : prev.model || list[0] || "",
          videoModel:
            prev.videoModel && list.includes(prev.videoModel)
              ? prev.videoModel
              : prev.model || list[0] || "",
        }));
      })
      .catch(() => {
        if (!cancelled) setModels([]);
      });
    return () => {
      cancelled = true;
    };
  }, [draft.providerId]);

  // 上报当前正在编辑的剧本项目, 供「资源管理」侧栏自动定位到该项目资源。
  const storyboardProjectTitle = useMemo(() => {
    const story = (draft.story || "").trim();
    const titled = (draft.projectTitle || "").trim();
    return titled || (story ? `${story.slice(0, 20)}${story.length > 20 ? "…" : ""}` : "剧本项目");
  }, [draft.projectTitle, draft.story]);
  useEffect(() => {
    if (draft.projectId) {
      onActiveWorkbenchProject?.({
        studio: "剧本工作室",
        slug: "storyboard-script",
        projectId: draft.projectId,
        title: storyboardProjectTitle,
      });
    }
  }, [draft.projectId, storyboardProjectTitle, onActiveWorkbenchProject]);

  // 打开剧本工作台即建立本项目资源目录,资源管理「工作台资源」才能立刻显示。
  useEffect(() => {
    const host = hostRef.current;
    if (!host || !draft.projectId) return;
    void host
      .ensureWorkbenchProjectDir(`剧本工作室/${draft.projectId}`)
      .catch(() => void 0);
  }, [hostReady, draft.projectId]);

  // 结果缩略图(懒加载)。
  const allResultPaths = useMemo(() => {
    const paths: string[] = [];
    for (const gen of Object.values(genMap)) {
      for (const item of [...gen.image.items, ...gen.video.items]) paths.push(item.path);
    }
    return paths;
  }, [genMap]);

  useEffect(() => {
    for (const path of allResultPaths) {
      if (path in thumbs) continue;
      hostRef.current
        ?.thumbnail(path, 320)
        .then((url) => setThumbs((prev) => ({ ...prev, [path]: url ?? null })))
        .catch(() => setThumbs((prev) => ({ ...prev, [path]: null })));
    }
  }, [allResultPaths, thumbs]);

  const canGenerate = useMemo(
    () =>
      !generating &&
      hostReady &&
      Boolean(draft.story.trim()) &&
      Boolean(draft.providerId) &&
      Boolean(draft.model),
    [generating, hostReady, draft.story, draft.providerId, draft.model],
  );

  const generate = useCallback(async () => {
    const host = hostRef.current;
    if (!host || !canGenerate) return;
    setGenerating(true);
    setBusyMessage("正在生成分镜脚本…");
    setError("");
    try {
      const input: StoryboardInput = {
        story: draft.story,
        style: draft.style.trim() || undefined,
        shotCount: draft.shotCount,
        aspectRatio: draft.aspectRatio,
      };
      const result = await host.generateScript({
        providerId: draft.providerId,
        model: draft.model,
        system: buildStoryboardSystemPrompt(),
        user: buildStoryboardUserPrompt(input),
      });
      const { script: parsed, error: parseError } = parseStoryScript(result.text);
      if (parseError) throw new Error(parseError);
      setRawJson(result.text);
      setScript(parsed);
      setShowJson(false);
      setGenMap({});
      setBusyMessage("");
    } catch (reason) {
      setError(errorText(reason));
      setBusyMessage("");
    } finally {
      setGenerating(false);
    }
  }, [canGenerate, draft]);

  // ---- 角色资产 ----
  const [charName, setCharName] = useState("");
  const [charDescription, setCharDescription] = useState("");
  const [charReferencePath, setCharReferencePath] = useState("");

  const addCharacter = useCallback(async () => {
    if (!charName.trim() && !charDescription.trim()) return;
    const character: StoryCharacter = {
      id: `char-${Date.now()}-${Math.round(Math.random() * 1e6)}`,
      name: charName.trim(),
      description: charDescription.trim(),
      referencePath: charReferencePath || undefined,
    };
    patchDraft({ characters: [...draft.characters, character] });
    setCharName("");
    setCharDescription("");
    setCharReferencePath("");
  }, [charName, charDescription, charReferencePath, draft.characters, patchDraft]);

  const removeCharacter = useCallback(
    (id: string) => {
      patchDraft({ characters: draft.characters.filter((c) => c.id !== id) });
    },
    [draft.characters, patchDraft],
  );

  const pickCharacterReference = useCallback(async () => {
    try {
      const picked = await hostRef.current?.pickImages(false);
      if (picked?.length) setCharReferencePath(picked[0]!.path);
    } catch (reason) {
      setError(errorText(reason));
    }
  }, []);

  // ---- 分镜生成 ----
  const updateGen = useCallback(
    (shotId: string, kind: "image" | "video", patch: Partial<GenState>) => {
      setGenMap((prev) => {
        const current = genForShot(prev, shotId);
        return {
          ...prev,
          [shotId]: {
            image: current.image,
            video: current.video,
            ...(kind === "image"
              ? { image: { ...current.image, ...patch } }
              : { video: { ...current.video, ...patch } }),
          },
        };
      });
    },
    [],
  );

  const appendGenItem = useCallback(
    (shotId: string, kind: "image" | "video", item: GenItem) => {
      setGenMap((prev) => {
        const current = genForShot(prev, shotId);
        const nextState = {
          ...(kind === "image" ? current.image : current.video),
          status: "done" as const,
          items: [...(kind === "image" ? current.image.items : current.video.items), item],
        };
        return {
          ...prev,
          [shotId]: {
            image: kind === "image" ? nextState : current.image,
            video: kind === "image" ? current.video : nextState,
          },
        };
      });
    },
    [],
  );

  const referencesFor = useCallback(() => {
    const paths = draft.characters
      .map((character) => character.referencePath)
      .filter((path): path is string => Boolean(path));
    return paths.map((path) => ({ kind: "image" as const, path }));
  }, [draft.characters]);

  const generateShot = useCallback(
    async (shot: StoryboardShot, kind: "image" | "video") => {
      const host = hostRef.current;
      if (!host || !draft.providerId) return;
      // 工作台项目归档：剧本项目以稳定 id 作为目录(单草稿=一个项目)。
      const storyboardSubdir = draft.projectId
        ? `剧本工作室/${String(draft.projectId).replace(/[^\w-]/g, "_")}`
        : undefined;
      updateGen(shot.id, kind, { status: "running", error: undefined });
      try {
        if (kind === "image") {
          const prompt = buildShotImagePrompt(shot, draft.characters);
          const result = await host.generateImage({
            providerId: draft.providerId,
            model: draft.imageModel || draft.model,
            prompt,
            size: draft.imageSize,
            references: referencesFor(),
            // 工作台项目归档：剧本项目生成图写入输出根/剧本工作室/<标题>/。
            projectSubdir: storyboardSubdir,
          });
          appendGenItem(shot.id, kind, { path: result.outputPath, url: result.outputUrl });
        } else {
          const prompt = finalizeGenerationPrompt(
            shot.prompt || buildShotVideoPrompt(shot),
            draft.characters,
          );
          const result = await host.generateVideo({
            providerId: draft.providerId,
            model: draft.videoModel || draft.model,
            prompt,
            duration: shot.durationSec,
            ratio: draft.aspectRatio,
            resolution: draft.videoResolution,
            references: referencesFor(),
            // 工作台项目归档：剧本项目生成视频写入输出根/剧本工作室/<标题>/。
            projectSubdir: storyboardSubdir,
          });
          appendGenItem(shot.id, kind, { path: result.outputPath, url: result.outputUrl });
        }
      } catch (reason) {
        updateGen(shot.id, kind, { status: "error", error: errorText(reason) });
      }
    },
    [draft, updateGen, appendGenItem, referencesFor],
  );

  const runBatch = useCallback(
    async (kind: "image" | "video") => {
      if (!script || batchBusy) return;
      setBatchBusy(kind);
      setBatchProgress({ done: 0, total: script.shots.length });
      setError("");
      try {
        for (const [index, shot] of script.shots.entries()) {
          await generateShot(shot, kind);
          setBatchProgress({ done: index + 1, total: script.shots.length });
        }
      } finally {
        setBatchBusy(null);
        setBatchProgress(null);
      }
    },
    [script, batchBusy, generateShot],
  );

  const patchShot = useCallback((index: number, patch: Partial<StoryboardShot>) => {
    setScript((prev) => {
      if (!prev) return prev;
      const shots = prev.shots.map((shot, i) =>
        i === index ? { ...shot, ...patch } : shot,
      );
      return { ...prev, shots };
    });
  }, []);

  const recomputePrompt = useCallback((index: number) => {
    setScript((prev) => {
      if (!prev) return prev;
      const shots = prev.shots.map((shot, i) =>
        i === index ? { ...shot, prompt: buildShotVideoPrompt(shot) } : shot,
      );
      return { ...prev, shots };
    });
  }, []);

  const copyAll = useCallback(async () => {
    if (!script) return;
    const ok = await copyText(scriptToPlainText(script));
    setError(ok ? "" : "复制失败,请手动选择文本复制。");
  }, [script]);

  const exportText = useCallback(async () => {
    const host = hostRef.current;
    if (!host || !script) return;
    setBusyMessage("正在导出分镜表…");
    setError("");
    try {
      const name = `${script.title?.trim() || "分镜脚本"}-${new Date()
        .toISOString()
        .slice(0, 10)}.txt`;
      const result = await host.saveText({ name, content: scriptToPlainText(script) });
      setBusyMessage(`已导出:${result.path}`);
    } catch (reason) {
      setError(errorText(reason));
      setBusyMessage("");
    }
  }, [script]);

  const openResult = useCallback(
    async (path: string) => {
      try {
        await hostRef.current?.showItem(path);
      } catch (reason) {
        setError(errorText(reason));
      }
    },
    [],
  );

  // ---- 替换工作室联动 ----
  const syncToReplacementStudio = useCallback(async () => {
    const host = hostRef.current;
    if (!host || !script) return;
    setSyncing(true);
    setBusyMessage("正在同步到替换工作室…");
    setError("");
    try {
      const title =
        script.title?.trim() || `剧本项目-${new Date().toISOString().slice(0, 10)}`;
      const snapshot: StoryboardSyncSnapshot = {
        title,
        aspectRatio: draft.aspectRatio,
        characters: draft.characters,
        shots: script.shots.map((shot) => {
          const gen = genForShot(genMap, shot.id);
          return { shot, imageResults: gen.image.items, videoResults: gen.video.items };
        }),
        providerId: draft.providerId,
        imageModel: draft.imageModel,
        videoModel: draft.videoModel,
        imageSize: draft.imageSize,
        videoResolution: draft.videoResolution,
      };
      const loaded = await host.loadReplacementProjects();
      const rawProjects = Array.isArray(loaded)
        ? loaded
        : Array.isArray((loaded as { projects?: unknown[] })?.projects)
          ? (loaded as { projects: unknown[] }).projects
          : [];
      const projects = rawProjects as RsProject[];
      const existing = findProjectByTitle(projects, title);
      const saved = existing
        ? await host.saveReplacementProject(
            syncCharactersIntoProject(existing, draft.characters),
          )
        : await host.saveReplacementProject(buildReplacementProject(snapshot));
      if (!saved.ok) throw new Error(saved.error || "保存替换项目失败");
      setBusyMessage(
        existing
          ? `已更新替换项目「${title}」的角色资产,正在打开替换工作室…`
          : `已创建替换项目「${title}」(分镜 ${script.shots.length} 镜 · 角色 ${draft.characters.length} 个),正在打开替换工作室…`,
      );
      const opened = await host.openReplacementStudio();
      if (!opened) {
        setError("项目已保存,但未能打开替换工作室,请点击侧栏「替换工作室」查看。");
      }
    } catch (reason) {
      setError(errorText(reason));
      setBusyMessage("");
    } finally {
      setSyncing(false);
    }
  }, [script, draft, genMap]);

  return (
    <div className="sw-workspace" role="dialog" aria-label="剧本工作室">
      <header className="sw-header">
        <div className="sw-title">
          <h1>剧本工作室</h1>
          <span className="sw-subtitle">文案 → 分镜脚本 → 角色资产 → 分镜批量生成</span>
        </div>
        <div className="sw-actions">
          <button
            type="button"
            className="sw-btn sw-btn-primary"
            onClick={() => void syncToReplacementStudio()}
            disabled={!script || syncing || Boolean(batchBusy)}
            title="把分镜镜头、角色资产与生成结果同步到替换工作室(同名项目更新角色资产)"
          >
            {syncing ? "同步中…" : "发送到替换工作室"}
          </button>
          <button
            type="button"
            className="sw-btn"
            onClick={() => void runBatch("image")}
            disabled={!script || Boolean(batchBusy)}
          >
            全部生成参考图
          </button>
          <button
            type="button"
            className="sw-btn"
            onClick={() => void runBatch("video")}
            disabled={!script || Boolean(batchBusy)}
          >
            全部生成视频
          </button>
          <button type="button" className="sw-btn" onClick={copyAll} disabled={!script}>
            复制分镜表
          </button>
          <button type="button" className="sw-btn" onClick={exportText} disabled={!script}>
            导出 TXT
          </button>
          <button
            type="button"
            className="sw-btn"
            onClick={() => setShowJson((v) => !v)}
            disabled={!script}
          >
            {showJson ? "查看分镜表" : "查看 JSON"}
          </button>
          <button type="button" className="sw-btn sw-btn-quiet" onClick={onExit}>
            返回资源库
          </button>
        </div>
      </header>

      <section className="sw-input-panel">
        <textarea
          className="sw-story-input"
          value={draft.story}
          placeholder={"粘贴你的故事/文案(对白请保留原文,生成时会原样转入台词)…"}
          onChange={(event) => patchDraft({ story: event.target.value })}
        />
        <div className="sw-input-row">
          <label>
            风格
            <input
              type="text"
              value={draft.style}
              placeholder="如:清新生活方式、小红书感、赛博朋克"
              onChange={(event) => patchDraft({ style: event.target.value })}
            />
          </label>
          <label>
            画幅
            <select
              value={draft.aspectRatio}
              onChange={(event) => patchDraft({ aspectRatio: event.target.value })}
            >
              <option value="16:9">16:9</option>
              <option value="9:16">9:16</option>
              <option value="1:1">1:1</option>
              <option value="4:3">4:3</option>
              <option value="21:9">21:9</option>
            </select>
          </label>
          <label>
            镜头数
            <input
              type="number"
              min={1}
              max={30}
              value={draft.shotCount}
              onChange={(event) =>
                patchDraft({ shotCount: Math.max(1, Number(event.target.value) || 1) })
              }
            />
          </label>
          <label>
            中转站
            <select
              value={draft.providerId}
              onChange={(event) => patchDraft({ providerId: event.target.value })}
            >
              {providers.length === 0 && <option value="">(无可用的中转站)</option>}
              {providers.map((provider) => (
                <option key={provider.id} value={provider.id}>
                  {provider.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            文案模型
            <select
              value={draft.model}
              onChange={(event) => patchDraft({ model: event.target.value })}
            >
              {models.length === 0 && <option value="">(无可用模型)</option>}
              {models.map((model) => (
                <option key={model} value={model}>
                  {model}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            className="sw-btn sw-btn-primary"
            onClick={generate}
            disabled={!canGenerate}
          >
            {generating ? "生成中…" : "生成分镜脚本"}
          </button>
        </div>
        <div className="sw-input-row">
          <label>
            图像模型
            <select
              value={draft.imageModel}
              onChange={(event) => patchDraft({ imageModel: event.target.value })}
            >
              {models.map((model) => (
                <option key={model} value={model}>
                  {model}
                </option>
              ))}
            </select>
          </label>
          <label>
            图像尺寸
            <select
              value={draft.imageSize}
              onChange={(event) => patchDraft({ imageSize: event.target.value })}
            >
              {IMAGE_SIZES.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </label>
          <label>
            视频模型
            <select
              value={draft.videoModel}
              onChange={(event) => patchDraft({ videoModel: event.target.value })}
            >
              {models.map((model) => (
                <option key={model} value={model}>
                  {model}
                </option>
              ))}
            </select>
          </label>
          <label>
            视频质量
            <select
              value={draft.videoResolution}
              onChange={(event) => patchDraft({ videoResolution: event.target.value })}
            >
              {VIDEO_RESOLUTIONS.map((resolution) => (
                <option key={resolution} value={resolution}>
                  {resolution}
                </option>
              ))}
            </select>
          </label>
          {batchProgress && (
            <span className="sw-busy">
              批量生成 {batchProgress.done}/{batchProgress.total}
            </span>
          )}
        </div>
        {busyMessage && <p className="sw-busy">{busyMessage}</p>}
        {error && <p className="sw-error">{error}</p>}
      </section>

      <section className="sw-chars">
        <div className="sw-chars-head">
          <h2>角色资产</h2>
          <span className="sw-hint">生成时自动注入「角色:…」上下文,带参考图则作为 references 一并传入</span>
        </div>
        <div className="sw-chars-list">
          {draft.characters.map((character) => (
            <div className="sw-char-card" key={character.id}>
              <span className="sw-char-name">{character.name || "未命名"}</span>
              <span className="sw-char-desc">{character.description || "无描述"}</span>
              {character.referencePath && (
                <span className="sw-char-ref">图:{character.referencePath.split(/[\\/]/).pop()}</span>
              )}
              <button
                type="button"
                className="sw-btn sw-btn-quiet"
                onClick={() => removeCharacter(character.id)}
              >
                删除
              </button>
            </div>
          ))}
        </div>
        <div className="sw-chars-add">
          <input
            type="text"
            value={charName}
            placeholder="角色名(如:小明)"
            onChange={(event) => setCharName(event.target.value)}
          />
          <input
            type="text"
            value={charDescription}
            placeholder="角色描述(如:年轻男性,白T恤,黑色短发)"
            onChange={(event) => setCharDescription(event.target.value)}
          />
          <span className="sw-char-ref">{charReferencePath ? "已选参考图" : ""}</span>
          <button type="button" className="sw-btn" onClick={() => void pickCharacterReference()}>
            {charReferencePath ? "更换参考图" : "选择参考图"}
          </button>
          <button type="button" className="sw-btn sw-btn-primary" onClick={addCharacter}>
            添加角色
          </button>
        </div>
      </section>

      {showJson ? (
        <section className="sw-json-panel">
          <pre>{rawJson}</pre>
        </section>
      ) : (
        script && (
          <section className="sw-shots">
            {script.title && <h2>{script.title}</h2>}
            {script.summary && <p className="sw-summary">{script.summary}</p>}
            {script.shots.map((shot, index) => {
              const gen = genForShot(genMap, shot.id);
              return (
                <article className="sw-shot" key={shot.id}>
                  <div className="sw-shot-head">
                    <span className="sw-shot-index">{index + 1}</span>
                    <span className="sw-shot-meta">
                      {shot.sceneLabel ? `[${shot.sceneLabel}] ` : ""}
                      {shot.durationSec}s
                    </span>
                    <button
                      type="button"
                      className="sw-btn sw-btn-quiet"
                      onClick={() => recomputePrompt(index)}
                      title="按当前字段重新组装视频提示词"
                    >
                      重新组装提示词
                    </button>
                  </div>
                  <div className="sw-shot-fields">
                    <label>
                      景别
                      <select
                        value={shot.size}
                        onChange={(event) =>
                          patchShot(index, {
                            size: event.target.value as StoryboardShot["size"],
                          })
                        }
                      >
                        <option value="extreme-wide">超广角</option>
                        <option value="wide">远景</option>
                        <option value="full">全景</option>
                        <option value="medium">中景</option>
                        <option value="close">近景</option>
                        <option value="extreme-close">特写</option>
                      </select>
                    </label>
                    <label>
                      运镜
                      <select
                        value={shot.cameraMove}
                        onChange={(event) =>
                          patchShot(index, {
                            cameraMove: event.target.value as StoryboardShot["cameraMove"],
                          })
                        }
                      >
                        <option value="static">固定</option>
                        <option value="push-slow">慢速推轨</option>
                        <option value="orbit-slow">环绕慢摇</option>
                        <option value="handheld">动态手持</option>
                        <option value="follow">跟随</option>
                        <option value="crane">升降</option>
                        <option value="pan-tilt">摇移</option>
                        <option value="whip">甩镜</option>
                      </select>
                    </label>
                    <label>
                      时长(秒)
                      <input
                        type="number"
                        min={1}
                        max={15}
                        value={shot.durationSec}
                        onChange={(event) =>
                          patchShot(index, {
                            durationSec: Math.max(
                              1,
                              Math.min(15, Number(event.target.value) || 5),
                            ),
                          })
                        }
                      />
                    </label>
                  </div>
                  <textarea
                    className="sw-description"
                    value={shot.description}
                    onChange={(event) => patchShot(index, { description: event.target.value })}
                  />
                  {typeof shot.dialogue === "string" && (
                    <input
                      className="sw-dialogue"
                      value={shot.dialogue ?? ""}
                      placeholder="台词"
                      onChange={(event) => patchShot(index, { dialogue: event.target.value })}
                    />
                  )}
                  {typeof shot.sfx === "string" && (
                    <input
                      className="sw-sfx"
                      value={shot.sfx ?? ""}
                      placeholder="音效"
                      onChange={(event) => patchShot(index, { sfx: event.target.value })}
                    />
                  )}
                  <textarea
                    className="sw-prompt"
                    value={shot.prompt}
                    onChange={(event) => patchShot(index, { prompt: event.target.value })}
                  />
                  <div className="sw-gen-row">
                    <button
                      type="button"
                      className="sw-btn"
                      onClick={() => void generateShot(shot, "image")}
                      disabled={Boolean(batchBusy) || gen.image.status === "running"}
                    >
                      {gen.image.status === "running" ? "生成中…" : "生成参考图"}
                    </button>
                    <button
                      type="button"
                      className="sw-btn"
                      onClick={() => void generateShot(shot, "video")}
                      disabled={Boolean(batchBusy) || gen.video.status === "running"}
                    >
                      {gen.video.status === "running" ? "生成中…" : "生成镜头视频"}
                    </button>
                    {gen.image.status === "error" && (
                      <span className="sw-error">{gen.image.error}</span>
                    )}
                    {gen.video.status === "error" && (
                      <span className="sw-error">{gen.video.error}</span>
                    )}
                  </div>
                  {(gen.image.items.length > 0 || gen.video.items.length > 0) && (
                    <div className="sw-results">
                      {gen.image.items.map((item, itemIndex) => (
                        <button
                          type="button"
                          key={`img-${itemIndex}-${item.path}`}
                          className="sw-result"
                          title={item.path}
                          onClick={() => void openResult(item.path)}
                        >
                          {thumbs[item.path] ? (
                            <img src={thumbs[item.path]!} alt="" />
                          ) : (
                            <span className="sw-result-empty">图</span>
                          )}
                          <span className="sw-result-kind">参考图</span>
                        </button>
                      ))}
                      {gen.video.items.map((item, itemIndex) => (
                        <button
                          type="button"
                          key={`vid-${itemIndex}-${item.path}`}
                          className="sw-result"
                          title={item.path}
                          onClick={() => void openResult(item.path)}
                        >
                          {thumbs[item.path] ? (
                            <img src={thumbs[item.path]!} alt="" />
                          ) : (
                            <span className="sw-result-empty">视频</span>
                          )}
                          <span className="sw-result-kind">视频</span>
                        </button>
                      ))}
                    </div>
                  )}
                </article>
              );
            })}
          </section>
        )
      )}
    </div>
  );
}
