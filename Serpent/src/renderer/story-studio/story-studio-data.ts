/**
 * 剧本工作室 · Story Studio — 数据模型与目录(definitions / catalogs)。
 *
 * 对齐 ShuoCanvas app/src/modules/storyWorkspace 的「剧本/素材/分集」工作台：
 *  - storyWorkspace.js  主控(步骤、页面、项目会话)
 *  - storyHomePresentation.js  首页(hero / tabs / composer / model bar / projects)
 *  - storyStyleCatalog.js  风格库(categories / presets)
 *  - storyProjectPlanning.js  剧本规划(promptMode / episodeCount / aspectRatio / scriptMode)
 *
 * 本文件只含「纯数据 + 纯函数」，不依赖宿主；宿主调用集中在 StoryStudioWorkspace。
 */

// ---- 步骤 ----
export type StoryStepId = 1 | 2 | 3;

export const STORY_STEPS: ReadonlyArray<{ id: StoryStepId; label: string }> = [
  { id: 1, label: "剧情大纲" },
  { id: 2, label: "素材设定" },
  { id: 3, label: "分集视频" },
];

/** sourceMode 不同时第 1 步标签的替换文案(对齐 storyWorkspaceChromeProjection.js)。 */
export function resolveStepOneLabel(sourceMode: string): string {
  if (sourceMode === "upload-original") return "原始剧本";
  if (sourceMode === "video-replication") return "视频解析";
  return "剧情大纲";
}

export type StorySourceMode =
  | "generate"
  | "upload"
  | "replication"
  | "upload-original"
  | "upload-rewrite"
  | "video-replication";

// ---- 首页 tab ----
export type StoryHomeTab = "upload" | "generate" | "replication";

export const STORY_HOME_TABS: ReadonlyArray<{ id: StoryHomeTab; label: string }> = [
  { id: "upload", label: "上传剧本" },
  { id: "generate", label: "剧本创作" },
  { id: "replication", label: "复刻视频" },
];

// ---- 画幅 ----
export const STORY_ASPECT_RATIO_OPTIONS: ReadonlyArray<{ value: string; label: string; selectedLabel?: string }> = [
  { value: "16:9", label: "16:9", selectedLabel: "16:9 横版" },
  { value: "9:16", label: "9:16", selectedLabel: "9:16 竖版" },
  { value: "1:1", label: "1:1", selectedLabel: "1:1 方形" },
  { value: "4:3", label: "4:3", selectedLabel: "4:3 经典" },
  { value: "21:9", label: "21:9", selectedLabel: "21:9 影院" },
  { value: "3:4", label: "3:4", selectedLabel: "3:4" },
  { value: "2:3", label: "2:3", selectedLabel: "2:3" },
];

// ---- 单片段提示词模式 ----
export type StoryPromptMode = "timeline" | "seedance25" | "minimax-h3" | "wan30";

export const STORY_PROMPT_MODE_OPTIONS: ReadonlyArray<{ value: StoryPromptMode; label: string; enabled: boolean }> = [
  { value: "timeline", label: "Seedance 2.0", enabled: true },
  { value: "seedance25", label: "Seedance 2.5", enabled: true },
  { value: "wan30", label: "Wan 3.0", enabled: true },
  { value: "minimax-h3", label: "MiniMax H3", enabled: true },
];

export function storyPromptModeLabel(mode: string): string {
  const found = STORY_PROMPT_MODE_OPTIONS.find((m) => m.value === mode);
  return (found && found.label) || mode || "Seedance 2.0";
}

// ---- 目标分集数 ----
export const STORY_EPISODE_COUNT_MAX = 20;
export const STORY_PUBLIC_EPISODE_COUNT_OPTIONS: ReadonlyArray<number> = [1, 2, 3, 4, 6, 8, 10];

export function normalizeStoryEpisodeCount(value: unknown): number {
  const n = Number(value);
  if (Number.isFinite(n) && n >= 1) return Math.min(STORY_EPISODE_COUNT_MAX, Math.trunc(n));
  return 3;
}

// ---- 剧情 / 解说 脚本模式 ----
export type StoryScriptMode = "plot" | "narration";

export function storyScriptModeLabel(mode: string, of: "current" | "other" = "current"): string {
  const normalized = mode === "narration" ? "narration" : "plot";
  if (of === "current") return normalized === "narration" ? "解说模式" : "剧情模式";
  return normalized === "narration" ? "剧情模式" : "解说模式";
}

// ---- 风格库 ----
export type StoryStyleCategoryId = "all" | "live" | "2d" | "3d";

export const STORY_STYLE_CATEGORIES: ReadonlyArray<{ id: StoryStyleCategoryId; label: string }> = [
  { id: "all", label: "全部" },
  { id: "live", label: "真人" },
  { id: "2d", label: "2D" },
  { id: "3d", label: "3D" },
];

export interface StoryStylePreset {
  id: string;
  label: string;
  category: "live" | "2d" | "3d";
  prompt: string;
  thumbnail?: string;
}

/** 与 ShuoCanvas storyStyleCatalog.js 保持一致的预设(取常用子集,可续补)。 */
export const STORY_STYLE_PRESETS: ReadonlyArray<StoryStylePreset> = [
  { id: "retro-atomic-punk", label: "复古科幻原子朋克", category: "live", prompt: "复古科幻原子朋克", thumbnail: "images/story-styles/retro-atomic-punk.webp" },
  { id: "palace-intrigue-cool", label: "宫斗权谋冷峻风格", category: "live", prompt: "宫斗权谋冷峻风格", thumbnail: "images/story-styles/palace-intrigue-cool.webp" },
  { id: "domestic-suspense-cool", label: "国产悬疑冷调", category: "live", prompt: "国产悬疑冷调", thumbnail: "images/story-styles/domestic-suspense-cool.webp" },
  { id: "ancient-romance-soft-light", label: "古偶唯美柔光", category: "live", prompt: "古偶唯美柔光", thumbnail: "images/story-styles/ancient-romance-soft-light.webp" },
  { id: "japanese-youth-film", label: "日式青春胶片", category: "live", prompt: "日式青春胶片", thumbnail: "images/story-styles/japanese-youth-film.webp" },
  { id: "korean-urban-soft-light", label: "韩剧都市柔光", category: "live", prompt: "韩剧都市柔光", thumbnail: "images/story-styles/korean-urban-soft-light.webp" },
  { id: "domestic-urban-realism", label: "国产都市写实", category: "live", prompt: "国产都市写实", thumbnail: "images/story-styles/domestic-urban-realism.webp" },
  { id: "wuxia-realistic-cinematography", label: "武侠江湖写实摄影风格", category: "live", prompt: "武侠江湖写实摄影风格", thumbnail: "images/story-styles/wuxia-realistic-cinematography.webp" },
  { id: "retro-narrative-film", label: "复古叙事电影风格", category: "live", prompt: "复古叙事电影风格", thumbnail: "images/story-styles/retro-narrative-film.webp" },
  { id: "neon-cyber-cinema", label: "霓虹赛博电影风格", category: "live", prompt: "霓虹赛博电影风格", thumbnail: "images/story-styles/neon-cyber-cinema.webp" },
  { id: "horror-film", label: "恐怖电影风格", category: "live", prompt: "恐怖电影风格", thumbnail: "images/story-styles/horror-film.webp" },
  { id: "high-quality-animation-render", label: "高品质动画渲染风格", category: "3d", prompt: "高品质动画渲染风格", thumbnail: "images/story-styles/high-quality-animation-render.webp" },
  { id: "stylized-3d-render", label: "3D风格化渲染", category: "3d", prompt: "3D风格化渲染", thumbnail: "images/story-styles/stylized-3d-render.webp" },
  { id: "blue-orange-cinema", label: "蓝橙色调影视风格", category: "live", prompt: "蓝橙色调影视风格", thumbnail: "images/story-styles/blue-orange-cinema.webp" },
];

export const STORY_STYLE_CUSTOM_ID = "custom";

export interface StoryStyleSelection {
  styleId: string;
  stylePrompt: string;
  label: string;
  thumbnail: string;
  isCustom: boolean;
}

export function resolveStoryStyleSelection(project: {
  videoStyleId?: string;
  videoStylePrompt?: string;
  videoStyle?: string;
  customVideoStylePrompt?: string;
}): StoryStyleSelection {
  const preset = STORY_STYLE_PRESETS.find((p) => p.id === String(project.videoStyleId || "").trim());
  if (preset) {
    return {
      styleId: preset.id,
      stylePrompt: preset.prompt,
      label: preset.label,
      thumbnail: preset.thumbnail || "",
      isCustom: false,
    };
  }
  const prompt = String(project.videoStylePrompt || project.videoStyle || "").trim();
  return {
    styleId: STORY_STYLE_CUSTOM_ID,
    stylePrompt: prompt,
    label: prompt || "自定义风格提示词",
    thumbnail: "",
    isCustom: true,
  };
}

// ---- 复刻视频语种 ----
export const STORY_REPLICATION_LOCALES: ReadonlyArray<{ value: string; label: string; shortLabel: string }> = [
  { value: "zh-CN", label: "中国 · 中文", shortLabel: "中国 · 中文" },
  { value: "ja-JP", label: "日本 · 日语", shortLabel: "日本 · 日语" },
  { value: "ko-KR", label: "韩国 · 韩语", shortLabel: "韩国 · 韩语" },
  { value: "en-US", label: "美国 · 英语", shortLabel: "美国 · 英语" },
];

// ---- 字符上限 ----
export const STORY_IDEA_MAX_CHARACTERS = 1000;
export const STORY_SCRIPT_MAX_CHARACTERS = 60000;
export const STORY_CUSTOM_STYLE_MAX_CHARACTERS = 200;

// ---- 项目实体 ----
export interface StoryAssetAppearance {
  id: string;
  /** 参考图/生成图本地路径。 */
  path?: string;
  url?: string;
}

export interface StoryAsset {
  id: string;
  kind: "character" | "scene" | "prop";
  name: string;
  description: string;
  appearances: StoryAssetAppearance[];
}

export interface StoryClip {
  id: string;
  number: number;
  description: string;
  dialogue: string;
  sfx: string;
  durationSec: number;
  imagePath?: string;
  videoPath?: string;
  status: "idle" | "running" | "done" | "error";
}

export interface StoryEpisode {
  id: string;
  number: number;
  name: string;
  scriptText: string;
  clips: StoryClip[];
}

export interface StoryProject {
  id: string;
  title: string;
  sourceMode: StorySourceMode;
  createdAt: number;
  updatedAt: number;
  archivedAt: number;
  idea: string;
  scriptText: string;
  scriptFileName: string;
  aspectRatio: string;
  videoStyleId: string;
  videoStylePrompt: string;
  customVideoStylePrompt: string;
  promptMode: StoryPromptMode;
  episodeCount: number;
  scriptMode: StoryScriptMode;
  replicationTargetLocale: string;
  videoModel: string;
  videoResolution: string;
  summary: string;
  sceneText: string;
  assets: StoryAsset[];
  episodes: StoryEpisode[];
}

export function createEmptyStoryProject(partial: Partial<StoryProject>): StoryProject {
  const now = Date.now();
  return {
    id: partial.id || `sw-${now.toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
    title: partial.title || "",
    sourceMode: partial.sourceMode || "generate",
    createdAt: partial.createdAt || now,
    updatedAt: partial.updatedAt || now,
    archivedAt: partial.archivedAt || 0,
    idea: partial.idea || "",
    scriptText: partial.scriptText || "",
    scriptFileName: partial.scriptFileName || "",
    aspectRatio: partial.aspectRatio || "16:9",
    videoStyleId: partial.videoStyleId || "",
    videoStylePrompt: partial.videoStylePrompt || "",
    customVideoStylePrompt: partial.customVideoStylePrompt || "",
    promptMode: partial.promptMode || "timeline",
    episodeCount: normalizeStoryEpisodeCount(partial.episodeCount),
    scriptMode: partial.scriptMode || "plot",
    replicationTargetLocale: partial.replicationTargetLocale || "zh-CN",
    videoModel: partial.videoModel || "",
    videoResolution: partial.videoResolution || "720p",
    summary: partial.summary || "",
    sceneText: partial.sceneText || "",
    assets: partial.assets || [],
    episodes: partial.episodes || [],
  };
}

// ---- 分集切分与素材提取(纯函数) ----

/** 依字数/段落把完整剧本均匀切成 count 集,每集 scriptText 非空,用于「分集视频」分集结构。 */
export function splitScriptIntoEpisodes(script: string, count: number): StoryEpisode[] {
  const n = Math.max(1, Math.min(Math.trunc(count) || 3, STORY_EPISODE_COUNT_MAX));
  const text = String(script || "").trim();
  const base = { clips: [] as StoryClip[] };
  if (!text) {
    return Array.from({ length: n }, (_, i) => ({
      id: `ep-${Date.now()}-${i}`,
      number: i + 1,
      name: `第 ${i + 1} 集`,
      scriptText: "",
      clips: [],
    }));
  }
  // 优先按空行(段落)切;不足则按字符均分。
  const paragraphs = text.split(/\n{2,}/u).filter((p) => p.trim().length > 0);
  if (paragraphs.length >= n) {
    const per = Math.ceil(paragraphs.length / n);
    const chunks: string[] = [];
    for (let i = 0; i < n; i += 1) {
      const part = paragraphs.slice(i * per, (i + 1) * per).join("\n\n");
      chunks.push(part);
    }
    return chunks.map((part, i) => ({ id: `ep-${Date.now()}-${i}`, number: i + 1, name: `第 ${i + 1} 集`, scriptText: part, clips: [] }));
  }
  // 字符均分。
  const per = Math.ceil(text.length / n);
  const chunks: string[] = [];
  for (let i = 0; i < n; i += 1) {
    chunks.push(text.slice(i * per, (i + 1) * per));
  }
  return chunks.map((part, i) => ({ id: `ep-${Date.now()}-${i}`, number: i + 1, name: `第 ${i + 1} 集`, scriptText: part, clips: [] }));
}

export const STORY_ASSET_KINDS: ReadonlyArray<StoryAsset["kind"]> = ["character", "scene", "prop"];

/** 让文案模型提取角色/场景/道具的系统 + 用户提示词。 */
export function buildStoryAssetExtractionPrompt(script: string): { system: string; user: string } {
  return {
    system:
      "你是剧本素材分析助手。从剧本中提取关键【角色】、【场景】、【道具】，输出一个 JSON 数组。每项必须形如 {\"kind\":\"character|scene|prop\",\"name\":\"名称\",\"description\":\"一句话形象/空间/外观描述\"}。只输出 JSON，不要多余文字、不要 Markdown 代码块。",
    user: `下面是完整剧本，请提取其中主要的角色、场景与道具。\n\n${script || "（无正文，仅输出一个空数组 []）"}`,
  };
}

/** 从文案模型返回文本中尽量解析出 StoryAsset 数组;解析失败返回空数组。 */
export function parseStoryAssetsFromJson(raw: string): StoryAsset[] {
  const text = String(raw || "").trim();
  if (!text) return [];
  // 去掉可能包裹的 markdown 代码块。
  const cleaned = text
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();
  let payload: unknown = null;
  // 尝试找第一个 [ 或 { 并作为 JSON 起点向后取完整片段。
  const start = Math.min(
    ...[cleaned.indexOf("["), cleaned.indexOf("{")].filter((i) => i >= 0),
  );
  if (Number.isFinite(start)) {
    const candidate = cleaned.slice(start);
    try {
      payload = JSON.parse(candidate);
    } catch {
      // 可能以 { ... } 为单个对象包数组,尝试整体解析。
      try {
        payload = JSON.parse(cleaned);
      } catch {
        payload = null;
      }
    }
  }
  const list = Array.isArray(payload) ? payload : payload && typeof payload === "object" ? [payload] : [];
  const out: StoryAsset[] = [];
  for (const item of list) {
    const kind = String(item?.kind || "").trim();
    const name = String(item?.name || "").trim();
    if (!name || !STORY_ASSET_KINDS.includes(kind as StoryAsset["kind"])) continue;
    out.push({
      id: `sb-${Date.now()}-${out.length}-${Math.round(Math.random() * 1e5)}`,
      kind: kind as StoryAsset["kind"],
      name,
      description: String(item?.description || "").trim(),
      appearances: [],
    });
  }
  return out;
}

/** 当提取失败时的兜底素材(保证 Step 2 能看到入口)。 */
export function fallbackStoryAssets(): StoryAsset[] {
  return [
    { id: `sb-${Date.now()}-a`, kind: "character", name: "主角", description: "剧本首要人物", appearances: [] },
    { id: `sb-${Date.now()}-b`, kind: "scene", name: "主场景", description: "故事主要发生地", appearances: [] },
  ];
}

/** 把一集剧本粗分为若干个分镜片段(供「分集视频」片段结构使用)。 */
export function splitTextIntoClips(text: string): StoryClip[] {
  const trimmed = String(text || "").trim();
  if (!trimmed) return [];
  const paragraphs = trimmed.split(/\n{2,}/u).filter((p) => p.trim());
  const lines = paragraphs.length > 0 ? paragraphs : trimmed.split(/\n/u).filter((l) => l.trim());
  lines.push(trimmed.slice(-1) === "\n" ? "" : trimmed);
  const unique = [...new Set(lines.map((l) => l.trim()).filter(Boolean))];
  const count = Math.max(1, Math.min(unique.length || 1, 12));
  const per = Math.ceil(unique.length / count);
  const clips: StoryClip[] = [];
  for (let i = 0; i < count; i += 1) {
    const part = unique.slice(i * per, (i + 1) * per).join("\n").trim();
    clips.push({
      id: `cl-${Date.now()}-${i}`,
      number: i + 1,
      description: part,
      dialogue: "",
      sfx: "",
      durationSec: 5,
      status: "idle",
    });
  }
  return clips;
}


export const STORY_PROJECTS_STORAGE_KEY = "story-studio:projects:v1";
const STORY_HOME_KEY = "story-studio:home:v1";

export function newStoryProjectId(): string {
  return `sw-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function loadStoryProjects(): StoryProject[] {
  try {
    const raw = localStorage.getItem(STORY_PROJECTS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.map((p) => createEmptyStoryProject(p)) : [];
  } catch {
    return [];
  }
}

export function saveStoryProjects(projects: StoryProject[]): boolean {
  try {
    localStorage.setItem(STORY_PROJECTS_STORAGE_KEY, JSON.stringify(projects));
    return true;
  } catch {
    return false;
  }
}

export interface StoryHomeState {
  homeTab: StoryHomeTab;
  uploadInputMode: "file" | "paste";
  idea: string;
  scriptText: string;
  scriptFileName: string;
  scriptMode: StoryScriptMode;
  promptMode: StoryPromptMode;
  episodeCount: number;
  aspectRatio: string;
  replicationTargetLocale: string;
  videoStyleId: string;
  videoStylePrompt: string;
  customVideoStylePrompt: string;
  projectSortOrder: string;
  projectSearchQuery: string;
  showArchivedProjects: boolean;
}

export const DEFAULT_STORY_HOME: StoryHomeState = {
  homeTab: "generate",
  uploadInputMode: "file",
  idea: "",
  scriptText: "",
  scriptFileName: "",
  scriptMode: "plot",
  promptMode: "timeline",
  episodeCount: 3,
  aspectRatio: "16:9",
  replicationTargetLocale: "zh-CN",
  videoStyleId: "",
  videoStylePrompt: "",
  customVideoStylePrompt: "",
  projectSortOrder: "updated-desc",
  projectSearchQuery: "",
  showArchivedProjects: false,
};

export function loadStoryHome(): StoryHomeState {
  try {
    const raw = localStorage.getItem(STORY_HOME_KEY);
    if (!raw) return DEFAULT_STORY_HOME;
    return { ...DEFAULT_STORY_HOME, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_STORY_HOME;
  }
}

export function saveStoryHome(state: StoryHomeState): void {
  try {
    localStorage.setItem(STORY_HOME_KEY, JSON.stringify(state));
  } catch {
    // ignore quota errors
  }
}

// ---- 项目列表查询/排序(对齐 workspaceProjectHome.js) ----
export function getStoryProjectHomeEntries(
  projects: StoryProject[],
  { query = "", sortOrder = "updated-desc", showArchived = false } = {},
): StoryProject[] {
  const q = String(query || "").trim().toLocaleLowerCase("zh-CN");
  const archived = Boolean(showArchived);
  const filtered = (Array.isArray(projects) ? projects : [])
    .filter((p) => Boolean(Number(p.archivedAt || 0)) === archived)
    .filter((p) => {
      if (!q) return true;
      const title = String(p.title || "").toLocaleLowerCase("zh-CN");
      return title.includes(q);
    });
  const index = new Map(filtered.map((p, i) => [p.id, i]));
  return [...filtered].sort((a, b) => {
    if (sortOrder === "title-asc") {
      return String(a.title).localeCompare(String(b.title), "zh-CN") || ((index.get(a.id) ?? 0) - (index.get(b.id) ?? 0));
    }
    if (sortOrder === "created-asc") {
      return (Number(a.createdAt) || 0) - (Number(b.createdAt) || 0) || ((index.get(a.id) ?? 0) - (index.get(b.id) ?? 0));
    }
    return (Number(b.updatedAt) || 0) - (Number(a.updatedAt) || 0) || ((index.get(a.id) ?? 0) - (index.get(b.id) ?? 0));
  });
}

export const STORY_PROJECT_SORT_OPTIONS: ReadonlyArray<{ value: string; label: string }> = [
  { value: "updated-desc", label: "最近更新" },
  { value: "created-asc", label: "最早创建" },
  { value: "title-asc", label: "按名称" },
];

export function storyProjectTypeLabel(project: StoryProject): string {
  switch (project.sourceMode) {
    case "upload-original":
      return "个人剧本";
    case "upload-rewrite":
      return "AI改写";
    case "video-replication":
      return "复刻视频";
    default:
      return "剧本创作";
  }
}

export function escapeHtml(value: string): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
