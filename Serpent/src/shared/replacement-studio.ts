/**
 * 替换工作室 (Replacement Studio) — v2 shared model & pure helpers.
 *
 * 对齐 ShuoCanvas personReplacement 工作流:
 *   素材设定 → 图像替换 → 视频替换 → 声音克隆 → 合成视频
 *  - 素材设定:导入视频/图片 → 智能裁剪(FFmpeg 场景检测)切分镜头 →
 *    逐镜头人物检测(视觉大模型) → 跨镜头身份聚类 → 目标角色绑定;
 *  - 图像替换:逐镜头多图引导生成(原图+字母位置标注图+目标形象参考图+场景图);
 *  - 视频替换:逐镜头以替换图/参考图生成替换视频;
 *  - 声音克隆:逐镜头台词(可转写)+ 目标音色 → IndexTTS 克隆;
 *  - 合成视频:镜头片段按顺序拼接 + 克隆音轨对齐混合 → 导出。
 *
 * 与原版的差异(本环境无 ShuoCanvas 本地服务):
 *  检测/聚类用通用视觉大模型近似 OSNET;智能裁剪用 FFmpeg 场景检测;
 *  视频生成走 YUH 云端视频通道;克隆/合成用 YUH IndexTTS+FFmpeg。
 */

// ---------------------------------------------------------------------------
// 基础类型
// ---------------------------------------------------------------------------

/** 归一化 bbox(0..1):x,y 为左上角,w,h 为宽高。 */
export type RsBbox = { x: number; y: number; w: number; h: number };

export type RsScope =
  | "full-person"
  | "face-hair"
  | "clothing"
  | "arm-hand"
  | "feet";

export const RS_SCOPE_LABELS: Record<RsScope, string> = {
  "full-person": "完整人物",
  "face-hair": "脸部与发型",
  clothing: "服装",
  "arm-hand": "手臂与手部",
  feet: "脚部",
};

export const RS_SCOPE_INSTRUCTIONS: Record<RsScope, string> = {
  "full-person":
    "完整替换：人脸、发型、身体、服装全部使用目标参考人物的特征，不保留原人物的任何特征；替换后的体型比例需与场景匹配。",
  "face-hair":
    "仅替换脸部与发型（保留原人物身体、服装与姿态）；脸部角度与光线需与原来一致。",
  clothing: "仅替换服装（保留面部与身体姿态）；服装颜色与材质使用目标参考人物的特征。",
  "arm-hand": "仅替换手臂与手部细节；其余部位保持不变。",
  feet: "仅替换脚部/鞋子；其余部位保持不变。",
};

export type RsSmartClipMode = "stable" | "balanced" | "sensitive";
export const RS_SMART_CLIP_MODES: { id: RsSmartClipMode; label: string; hint: string }[] = [
  { id: "balanced", label: "平衡", hint: "推荐：场景切换明显、镜头数量适中" },
  { id: "stable", label: "稳定", hint: "只切出明显的场景变化，镜头数量少" },
  { id: "sensitive", label: "敏感", hint: "动作/机位微变也切分，镜头数量多" },
];
export const RS_SMART_CLIP_THRESHOLDS: Record<RsSmartClipMode, number> = {
  stable: 0.32,
  balanced: 0.24,
  sensitive: 0.16,
};

export type RsSource = {
  id: string;
  path: string;
  name: string;
  kind: "video" | "image";
  durationSec: number | null;
  width: number;
  height: number;
  keyframePath: string | null;
  analysisStatus: "idle" | "running" | "done" | "error";
  analysisError: string | null;
};

export type RsOrientation =
  | "unknown"
  | "front"
  | "back"
  | "side"
  | "left_profile"
  | "right_profile";

export const RS_ORIENTATION_LABELS: Record<RsOrientation, string> = {
  unknown: "未知",
  front: "正面",
  back: "背面",
  side: "侧面",
  left_profile: "左侧脸",
  right_profile: "右侧脸",
};

export type RsPerson = {
  id: string;
  /** 镜头内字母 A/B/C…(标注图与提示词使用)。 */
  letter: string;
  label: string;
  bbox: RsBbox;
  description: string;
  confidence: number | null;
  method: "auto" | "manual";
  /** 朝向(可手动指定;提示词中用于约束替换后姿态)。 */
  orientation: RsOrientation;
  /** 跨镜头身份 id(聚类后);null = 未聚类。 */
  sourceCharacterId: string | null;
};

export type RsShotStatus = "idle" | "generating" | "done" | "error";

export type RsImageModelParams = {
  size: string;
  quality: string;
};

export type RsShot = {
  id: string;
  index: number;
  label: string;
  sourceId: string | null;
  startSec: number;
  endSec: number;
  durationSec: number;
  /** 素材化后的片段视频路径(合成用),null 表示未裁剪。 */
  videoPath: string | null;
  /** 关键帧图片路径(检测/替换起点)。 */
  keyframePath: string | null;
  keyframeTimeSec: number;
  people: RsPerson[];
  detectionStatus: "idle" | "running" | "done" | "error";
  detectionError: string | null;

  imagePrompt: string;
  imageResults: RsGeneratedItem[];
  imageActiveIndex: number;
  imageStatus: RsShotStatus;
  imageError: string | null;
  /** 迭代参考:上次生成结果,作为下一轮的参考图。 */
  referenceImagePath: string | null;

  videoPrompt: string;
  videoResults: RsGeneratedItem[];
  videoActiveIndex: number;
  videoStatus: RsShotStatus;
  videoError: string | null;

  /** 倒放标记(切口剪辑器):素材化/合成时应用 reverse。 */
  reversed: boolean;

  voiceText: string;
  voiceAudioPath: string | null;
  voiceStatus: RsShotStatus;
  voiceError: string | null;

  /** 时间线选择状态(合成排列)。 */
  selected: boolean;
};

export type RsGeneratedItem = {
  id: string;
  outputPath: string;
  outputUrl: string;
  createdAt: string;
  prompt: string;
  model: string;
  kind: "image" | "video" | "audio";
  error?: string | null;
};

/** 跨镜头身份(检测聚类结果)。 */
export type RsSourceCharacter = {
  id: string;
  letter: string;
  label: string;
  /** 该身份出现过的人物框 id 列表。 */
  personIds: string[];
  /** 典型外貌描述(聚类代表)。 */
  description: string;
  scope: RsScope;
  targetCharacterId: string | null;
  targetAppearanceId: string | null;
};

export type RsAppearance = {
  id: string;
  name: string;
  imagePath: string | null;
  prompt: string;
};

export type RsTargetCharacter = {
  id: string;
  name: string;
  role: string;
  description: string;
  appearances: RsAppearance[];
  /** 绑定该角色的身份字母(人物标记 chips)。 */
  boundLetters: string[];
};

export type RsScene = {
  id: string;
  name: string;
  description: string;
  imagePath: string | null;
};

export type RsAudioAsset = {
  id: string;
  name: string;
  path: string;
  durationSec: number | null;
  /** 绑定目标角色(作为其音色参考)或 null。 */
  targetCharacterId: string | null;
};

export type RsSettings = {
  smartClipMode: RsSmartClipMode;
  detectProviderId: string;
  detectModel: string;
  detectPrompt: string;
  providerId: string;
  imageModel: string;
  imageSize: string;
  imageQuality: string;
  videoModel: string;
  videoDuration: number;
  videoRatio: string;
  videoResolution: string;
  withSceneRef: boolean;
  imagePromptTemplate: string;
  videoPromptTemplate: string;
  voiceTextTemplate: string;
  voiceLang: string;
  composeAudioEnabled: boolean;
};

export type RsStepKey = "material" | "image" | "video" | "voice" | "compose";

export type RsProject = {
  version: number;
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  step: RsStepKey;
  sources: RsSource[];
  shots: RsShot[];
  sourceCharacters: RsSourceCharacter[];
  characters: RsTargetCharacter[];
  scenes: RsScene[];
  audios: RsAudioAsset[];
  settings: RsSettings;
  history: RsHistoryEntry[];
  /** 工作区 UI 态(选中镜头等),持久化便于恢复。 */
  workspace: {
    selectedShotId: string | null;
  };
  compose: {
    finalVideoPath: string | null;
    finalAudioPath: string | null;
    status: "idle" | "running" | "done" | "error";
    error: string | null;
    composedShotIds: string[];
  };
};

export type RsHistoryEntry = {
  id: string;
  kind: "image" | "video" | "audio";
  at: string;
  prompt: string;
  model: string;
  outputPath: string;
  shotId: string | null;
  error?: string | null;
};

// ---------------------------------------------------------------------------
// 常量与默认值
// ---------------------------------------------------------------------------

export const RS_PROJECT_VERSION = 2;
export const RS_MAX_PEOPLE = 8;
export const RS_LETTERS = "ABCDEFGH" as const;

export const RS_DEFAULT_IMAGE_PROMPT_TEMPLATE = [
  "请对图片进行人物替换：【任务】保持原图的构图、镜头、姿势、光线、场景与背景完全不变，仅替换指定人物。",
  "【人物位置】原图中每个需要替换的人物都用彩色边框标注，框内标注了人物字母，字母与描述的对应关系如下：{bindings}",
  "【替换要求】{scopeLines}",
  "【注意事项】不要改变标注框外的人物与场景；不要重绘整体画面；输出保持与原图相同的比例与构图。",
].join("\n");

export const RS_DEFAULT_VIDEO_PROMPT_TEMPLATE =
  "保持源视频/参考画面的动作、镜头和构图，使用参考图片中的人物形象替换对应人物，人物身份保持一致。";

export const RS_DEFAULT_VOICE_TEXT_TEMPLATE =
  "这是{shot}的台词（可在声音克隆步骤编辑）：与画面一致的对白，保持原本语气与情绪。";

export const RS_DEFAULT_DETECT_PROMPT = [
  "你是一个图像分析助手。请找出图片中所有人物。",
  "对每个人物输出一个 JSON 对象：{\"label\":\"人物A\",\"bbox\":[x,y,w,h],\"description\":\"外貌简述\"}。",
  "规则：1) label 按人物从大到小、从左到右依次编号（人物A、人物B…），跨图片保持一致；",
  "2) bbox 使用归一化坐标（0~1），依次为 [左上x, 左上y, 宽, 高]，需完整包住该人物；",
  "3) description 用 8~20 字简述该人物的显著特征（性别、年龄感、发型、服装颜色款式、体型），用于跨镜头识别同一人；",
  "4) 若只露出半身/背影，也按可见部分标注；",
  "5) 只输出 JSON 数组，不要输出其他文字。",
].join("\n");

export function defaultRsSettings(): RsSettings {
  return {
    smartClipMode: "balanced",
    detectProviderId: "",
    detectModel: "",
    detectPrompt: RS_DEFAULT_DETECT_PROMPT,
    providerId: "",
    imageModel: "",
    imageSize: "auto",
    imageQuality: "auto",
    videoModel: "",
    videoDuration: 5,
    videoRatio: "16:9",
    videoResolution: "auto",
    withSceneRef: false,
    imagePromptTemplate: RS_DEFAULT_IMAGE_PROMPT_TEMPLATE,
    videoPromptTemplate: RS_DEFAULT_VIDEO_PROMPT_TEMPLATE,
    voiceTextTemplate: RS_DEFAULT_VOICE_TEXT_TEMPLATE,
    voiceLang: "zh",
    composeAudioEnabled: true,
  };
}

let idCounter = 0;
export function rsId(prefix: string): string {
  idCounter += 1;
  return `${prefix}-${Date.now().toString(36)}-${idCounter.toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function letterAt(index: number): string {
  return RS_LETTERS[index % RS_LETTERS.length] ?? "A";
}

export function labelForLetter(letter: string): string {
  return `人物${letter}`;
}

export function createRsProject(title: string): RsProject {
  const now = new Date().toISOString();
  return {
    version: RS_PROJECT_VERSION,
    id: rsId("rs"),
    title: title.trim() || "未命名替换项目",
    createdAt: now,
    updatedAt: now,
    step: "material",
    sources: [],
    shots: [],
    sourceCharacters: [],
    characters: [],
    scenes: [],
    audios: [],
    settings: defaultRsSettings(),
    history: [],
    workspace: { selectedShotId: null },
    compose: {
      finalVideoPath: null,
      finalAudioPath: null,
      status: "idle",
      error: null,
      composedShotIds: [],
    },
  };
}

// ---------------------------------------------------------------------------
// 检测解析(含外貌描述)
// ---------------------------------------------------------------------------

export type RsDetectedPerson = {
  bbox: RsBbox;
  confidence: number | null;
  labelHint: string | null;
  description: string;
};

/** 把检测模型输出解析为人物列表(兼容 fenced JSON/前后缀/对象框)。 */
export function parseDetectedPeople(raw: string): RsDetectedPerson[] {
  const text = String(raw || "");
  let candidate = text;
  const fenced = /```(?:json)?\s*([\s\S]*?)```/i.exec(text);
  if (fenced?.[1]) candidate = fenced[1];
  const arrayStart = candidate.indexOf("[");
  const arrayEnd = candidate.lastIndexOf("]");
  if (arrayStart >= 0 && arrayEnd > arrayStart) {
    candidate = candidate.slice(arrayStart, arrayEnd + 1);
  }
  try {
    const parsed = JSON.parse(candidate);
    const list = Array.isArray(parsed) ? parsed : parsed?.people;
    if (!Array.isArray(list)) return [];
    const normalized: RsDetectedPerson[] = [];
    for (const item of list) {
      if (!item || typeof item !== "object") continue;
      const box = item.bbox ?? item.box;
      let coords: number[] | null = null;
      if (Array.isArray(box) && box.length >= 4) coords = box.slice(0, 4).map(Number);
      else if (box && typeof box === "object") {
        coords = [
          Number((box as Record<string, unknown>).x),
          Number((box as Record<string, unknown>).y),
          Number((box as Record<string, unknown>).w ?? (box as Record<string, unknown>).width),
          Number((box as Record<string, unknown>).h ?? (box as Record<string, unknown>).height),
        ];
      }
      if (!coords || coords.some((v) => !Number.isFinite(v))) continue;
      const x0 = coords[0] ?? 0;
      const y0 = coords[1] ?? 0;
      const w0 = coords[2] ?? 0;
      const h0 = coords[3] ?? 0;
      if (x0 === 0 && y0 === 0 && w0 === 0 && h0 === 0) continue;
      const x = clamp01(x0);
      const y = clamp01(y0);
      const w = clamp01(Math.abs(w0));
      const h = clamp01(Math.abs(h0));
      if (w < 0.01 || h < 0.01) continue;
      const labelHint =
        typeof item.label === "string" && item.label.trim()
          ? item.label.trim()
          : typeof item.name === "string" && item.name.trim()
            ? item.name.trim()
            : null;
      const confidence =
        typeof item.confidence === "number" && Number.isFinite(item.confidence)
          ? clamp01(item.confidence)
          : null;
      const description =
        typeof item.description === "string" && item.description.trim()
          ? item.description.trim()
          : typeof item.desc === "string" && item.desc.trim()
            ? item.desc.trim()
            : "";
      normalized.push({
        bbox: { x: clamp01(x + w <= 1 ? x : 1 - w), y: clamp01(y + h <= 1 ? y : 1 - h), w, h },
        confidence,
        labelHint,
        description,
      });
    }
    return normalized;
  } catch {
    return [];
  }
}

function clamp01(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(1, value));
}

// ---------------------------------------------------------------------------
// 跨镜头身份聚类(以描述相似度近似 OSNET)
// ---------------------------------------------------------------------------

export type RsClusterInput = {
  shotId: string;
  personId: string;
  letter: string;
  description: string;
  bbox: RsBbox;
};

export type RsClusterOutput = {
  sourceCharacterId: string;
  letter: string;
  label: string;
  description: string;
  personIds: string[];
  personIdsByShot: Record<string, string[]>;
};

function tokens(text: string): Set<string> {
  const normalized = text
    .toLowerCase()
    .replace(/[\s，。、；：！？,.!?;:"'“”‘’()（）\[\]]+/g, " ")
    .trim();
  const set = new Set<string>();
  for (const token of normalized.split(/\s+/)) {
    if (token.length >= 1) set.add(token);
  }
  return set;
}

function similarity(left: string, right: string): number {
  const a = tokens(left);
  const b = tokens(right);
  if (a.size === 0 || b.size === 0) return 0;
  let common = 0;
  for (const token of a) if (b.has(token)) common += 1;
  const union = a.size + b.size - common;
  return union > 0 ? common / union : 0;
}

export const RS_CLUSTER_THRESHOLD = 0.34;

/** 把各镜头的人物描述聚类成身份(近似身份聚类),返回聚类结果。 */
export function clusterPeople(input: RsClusterInput[]): RsClusterOutput[] {
  const clusters: RsClusterOutput[] = [];
  for (const item of input) {
    if (!item.description.trim()) continue;
    let best: RsClusterOutput | null = null;
    let bestScore = 0;
    for (const cluster of clusters) {
      const score = similarity(item.description, cluster.description);
      if (score > bestScore) {
        bestScore = score;
        best = cluster;
      }
    }
    if (best && bestScore >= RS_CLUSTER_THRESHOLD) {
      best.personIds.push(item.personId);
      best.personIdsByShot[item.shotId] = [...(best.personIdsByShot[item.shotId] ?? []), item.personId];
      // 描述取更长的一方作为代表
      if (item.description.length > best.description.length) best.description = item.description;
    } else {
      const letter = letterAt(clusters.length);
      clusters.push({
        sourceCharacterId: `${"sc"}-${letter.toLowerCase()}`,
        letter,
        label: labelForLetter(letter),
        description: item.description,
        personIds: [item.personId],
        personIdsByShot: { [item.shotId]: [item.personId] },
      });
    }
  }
  return clusters;
}

// ---------------------------------------------------------------------------
// 提示词构造(逐镜头)
// ---------------------------------------------------------------------------

export type RsBindingLine = {
  /** 人物字母,如 A。 */
  letter: string;
  label: string;
  description: string;
  /** 朝向(未知时忽略)。 */
  orientation?: RsOrientation;
  /** 参考图序号(1=原图,2=标注图,3+=目标形象),null=仅文字描述。 */
  imageIndex: number | null;
  scope: RsScope;
  characterName: string;
  appearanceName: string | null;
  appearancePrompt: string;
};

/** 图像替换提示词(含绑定、替换范围、场景引用、迭代参考)。 */
export function buildRsImagePrompt(opts: {
  template: string;
  shotLabel: string | null;
  bindings: RsBindingLine[];
  sceneRef?: { name: string; imageIndex: number | null } | null;
  iterationRefLine?: string | null;
  fallback?: string;
}): string {
  const bindingLines = opts.bindings.map((b) => {
    const ref = b.imageIndex !== null
      ? `参考图${b.imageIndex}（${b.characterName}${b.appearanceName ? ` / ${b.appearanceName}` : ""}）`
      : "文字描述";
    const extra = b.description ? `，外貌描述：${b.description}` : "";
    return `${b.letter}号人物（${b.label}）→ ${ref}；替换范围：${RS_SCOPE_LABELS[b.scope]}${extra}`;
  });
  const scopeLines = opts.bindings
    .map((b) => `${b.letter}号人物：${RS_SCOPE_INSTRUCTIONS[b.scope]}`)
    .join("\n");
  const orientationLines = opts.bindings
    .filter((b) => b.orientation && b.orientation !== "unknown")
    .map((b) => `${b.letter}号人物朝向：${RS_ORIENTATION_LABELS[b.orientation!]}（替换后保持此朝向与姿态）`)
    .join("\n");
  const sceneLine = opts.sceneRef
    ? `【场景参考】场景应保持原图；如提供了场景参考图（参考图${opts.sceneRef.imageIndex ?? 0}），仅参考其布局与实景。`
    : "";
  const prompt = opts.template
    .replaceAll("{shot}", opts.shotLabel ?? "本镜头")
    .replaceAll("{bindings}", bindingLines.join("；") || "提示中未分配目标人物")
    .replaceAll("{scopeLines}", scopeLines || "完整替换全部指定人物。");
  const extraLines = [sceneLine, orientationLines, opts.iterationRefLine ?? ""]
    .filter(Boolean)
    .join("\n");
  return (prompt + (extraLines ? `\n${extraLines}` : "")).trim() || opts.fallback || "替换图中标注人物为目标参考形象，保持构图不变。";
}

export function buildRsVideoPrompt(opts: {
  template: string;
  shotLabel: string | null;
  bindings: RsBindingLine[];
}): string {
  const prompt = opts.template
    .replaceAll("{shot}", opts.shotLabel ?? "本镜头")
    .replaceAll(
      "{bindings}",
      opts.bindings
        .map((b) => `人物${b.letter}→${b.characterName}${b.appearanceName ? `(${b.appearanceName})` : ""}`)
        .join("、") || "全部已绑定人物",
    );
  return prompt.trim() || RS_DEFAULT_VIDEO_PROMPT_TEMPLATE;
}

export function buildRsVoiceText(opts: {
  template: string;
  shotLabel: string | null;
  fallbackText?: string | null;
}): string {
  const text = opts.template
    .replaceAll("{shot}", opts.shotLabel ?? "本镜头")
    .trim();
  return text || opts.fallbackText || "（请填写该镜头台词）";
}

// ---------------------------------------------------------------------------
// 进度与派生状态
// ---------------------------------------------------------------------------

export function shotReplacementDone(shot: RsShot): boolean {
  return shot.imageResults.length > 0 || shot.videoResults.length > 0;
}

export function shotBoundPeople(shot: RsShot, sourceCharacters: RsSourceCharacter[]): number {
  return shot.people.filter((p) => {
    const source = sourceCharacters.find((c) => c.id === p.sourceCharacterId);
    return Boolean(source?.targetCharacterId && source.targetAppearanceId);
  }).length;
}

export function projectStepGate(project: RsProject, step: RsStepKey): { ok: boolean; reason: string } {
  const hasSource = project.sources.length > 0;
  const hasShots = project.shots.length > 0;
  const hasDetection = project.shots.some((s) => s.people.length > 0);
  const hasBound = project.sourceCharacters.some((c) => c.targetCharacterId && c.targetAppearanceId);
  const hasImage = project.shots.some((s) => s.imageResults.length > 0);
  const hasVideo = project.shots.some((s) => s.videoResults.length > 0);
  const hasVoice = project.shots.some((s) => s.voiceAudioPath);
  switch (step) {
    case "material":
      return { ok: true, reason: "" };
    case "image":
      return hasShots && hasDetection && hasBound
        ? { ok: true, reason: "" }
        : { ok: false, reason: "请先完成「素材设定」：导入素材、智能裁剪切分镜头、检测并绑定人物" };
    case "video":
      return hasImage
        ? { ok: true, reason: "" }
        : { ok: false, reason: "请先在「图像替换」生成至少一张替换图" };
    case "voice":
      return hasSource
        ? { ok: true, reason: "" }
        : { ok: false, reason: "请先完成素材设定" };
    case "compose":
      return hasVideo || hasImage
        ? { ok: true, reason: "" }
        : { ok: false, reason: "请先生成替换图/替换视频" };
  }
}

export function projectProgress(project: RsProject): number {
  if (project.shots.length === 0) return 0;
  const done = project.shots.filter(shotReplacementDone).length;
  return Math.round((done / project.shots.length) * 100);
}

// ---------------------------------------------------------------------------
// 归一化/迁移(兼容 v1 残留项目:缺 sources/characters 等字段时补齐默认值)
// ---------------------------------------------------------------------------

/* eslint-disable @typescript-eslint/no-explicit-any */
export function normalizeRsProject(raw: any): RsProject | null {
  if (!raw || typeof raw !== "object" || !raw.id) return null;
  const base = createRsProject(String(raw.title || "未命名替换项目"));
  const v1Base = raw.base && typeof raw.base === "object" ? raw.base : null;
  const sources: RsSource[] = Array.isArray(raw.sources) && raw.sources.length > 0
    ? raw.sources
    : v1Base?.path
      ? [{
          id: rsId("src"),
          path: String(v1Base.path),
          name: String(v1Base.name || "基础素材"),
          kind: v1Base.kind === "video" ? "video" : "image",
          durationSec: typeof v1Base.durationSec === "number" ? v1Base.durationSec : null,
          width: Number(v1Base.width) || 0,
          height: Number(v1Base.height) || 0,
          keyframePath: String(v1Base.keyframePath || v1Base.path || ""),
          analysisStatus: "done",
          analysisError: null,
        }]
      : [];
  const shots: RsShot[] = (Array.isArray(raw.shots) ? raw.shots : []).map((shot: any, index: number) => {
    const keyframe = String(shot?.keyframePath || shot?.replacementImageRef || "");
    return {
      id: String(shot?.id || rsId("shot")),
      index: Number(shot?.index) || index + 1,
      label: String(shot?.label || shot?.name || `镜头${index + 1}`),
      sourceId: shot?.sourceId ? String(shot.sourceId) : (sources[0]?.id ?? null),
      startSec: Number(shot?.startSec ?? shot?.startTimeSec) || 0,
      endSec: Number(shot?.endSec ?? shot?.endTimeSec ?? 1) || 1,
      durationSec: Number(shot?.durationSec ?? shot?.endSec ?? 1) || 1,
      videoPath: shot?.videoPath ? String(shot.videoPath) : null,
      keyframePath: keyframe || null,
      keyframeTimeSec: Number(shot?.keyframeTimeSec) || 0,
      people: (Array.isArray(shot?.people) ? shot.people : []).map((person: any, pIndex: number) => ({
        id: String(person?.id || rsId("ps")),
        letter: String(person?.letter || letterAt(pIndex)),
        label: String(person?.label || `人物${letterAt(pIndex)}`),
        bbox: {
          x: clamp01(Number(person?.bbox?.x) || 0),
          y: clamp01(Number(person?.bbox?.y) || 0),
          w: clamp01(Number(person?.bbox?.width ?? person?.bbox?.w) || 0),
          h: clamp01(Number(person?.bbox?.height ?? person?.bbox?.h) || 0),
        },
        description: String(person?.description || ""),
        confidence: typeof person?.confidence === "number" ? person.confidence : null,
        method: person?.method === "manual" ? "manual" : "auto",
        orientation: orientationSet.has(person?.orientation) ? person.orientation : "unknown",
        sourceCharacterId: person?.sourceCharacterId ? String(person.sourceCharacterId) : null,
      })),
      detectionStatus: "done",
      detectionError: shot?.detectionError ? String(shot.detectionError) : null,
      imagePrompt: String(shot?.imagePrompt || ""),
      imageResults: Array.isArray(shot?.imageResults) ? shot.imageResults : [],
      imageActiveIndex: Number(shot?.imageActiveIndex) || 0,
      imageStatus: "idle",
      imageError: shot?.imageError ? String(shot.imageError) : null,
      referenceImagePath: shot?.referenceImagePath ? String(shot.referenceImagePath) : null,
      videoPrompt: String(shot?.videoPrompt || ""),
      videoResults: Array.isArray(shot?.videoResults) ? shot.videoResults : [],
      videoActiveIndex: Number(shot?.videoActiveIndex) || 0,
      videoStatus: "idle",
      videoError: shot?.videoError ? String(shot.videoError) : null,
      reversed: shot?.reversed === true,
      voiceText: String(shot?.voiceText || ""),
      voiceAudioPath: shot?.voiceAudioPath ? String(shot.voiceAudioPath) : null,
      voiceStatus: "idle",
      voiceError: shot?.voiceError ? String(shot.voiceError) : null,
      selected: true,
    };
  });
  const characters: RsTargetCharacter[] = (Array.isArray(raw.characters) ? raw.characters : (raw.targetCharacters ?? [])).map((c: any) => ({
    id: String(c?.id || rsId("char")),
    name: String(c?.name || "角色"),
    role: String(c?.role || ""),
    description: String(c?.description || ""),
    appearances: (Array.isArray(c?.appearances) ? c.appearances : []).map((a: any) => ({
      id: String(a?.id || rsId("appa")),
      name: String(a?.name || "形象"),
      imagePath: a?.imagePath ? String(a.imagePath) : null,
      prompt: String(a?.prompt || ""),
    })),
    boundLetters: Array.isArray(c?.boundLetters) ? c.boundLetters : [],
  }));
  const project: RsProject = {
    ...base,
    id: String(raw.id),
    title: String(raw.title || base.title),
    createdAt: String(raw.createdAt || base.createdAt),
    updatedAt: String(raw.updatedAt || base.updatedAt),
    step: base.step,
    sources,
    shots,
    sourceCharacters: (Array.isArray(raw.sourceCharacters) ? raw.sourceCharacters : []).map((c: any) => ({
      id: String(c?.id || rsId("sc")),
      letter: String(c?.letter || letterAt(0)),
      label: String(c?.label || `人物${c?.letter || "A"}`),
      personIds: Array.isArray(c?.personIds) ? c.personIds : [],
      description: String(c?.description || ""),
      scope: scopeSet.has(c?.scope) ? c.scope : "full-person",
      targetCharacterId: c?.targetCharacterId ? String(c.targetCharacterId) : null,
      targetAppearanceId: c?.targetAppearanceId ? String(c.targetAppearanceId) : null,
    })),
    characters,
    scenes: (Array.isArray(raw.scenes) ? raw.scenes : []).map((s: any) => ({
      id: String(s?.id || rsId("scene")),
      name: String(s?.name || "场景"),
      description: String(s?.description || ""),
      imagePath: s?.imagePath ? String(s.imagePath) : null,
    })),
    audios: (Array.isArray(raw.audios) ? raw.audios : []).map((a: any) => ({
      id: String(a?.id || rsId("aud")),
      name: String(a?.name || "音频"),
      path: String(a?.path || a?.audioPath || ""),
      durationSec: typeof a?.durationSec === "number" ? a.durationSec : null,
      targetCharacterId: a?.targetCharacterId ? String(a.targetCharacterId) : null,
    })),
    settings: { ...defaultRsSettings(), ...(raw.settings || {}) },
    history: Array.isArray(raw.history) ? raw.history : [],
    workspace: {
      selectedShotId: raw?.workspace?.selectedShotId
        ? String(raw.workspace.selectedShotId)
        : null,
    },
    compose: {
      finalVideoPath: raw?.compose?.finalVideoPath ? String(raw.compose.finalVideoPath) : null,
      finalAudioPath: raw?.compose?.finalAudioPath ? String(raw.compose.finalAudioPath) : null,
      status: "idle",
      error: raw?.compose?.error ? String(raw.compose.error) : null,
      composedShotIds: Array.isArray(raw?.compose?.composedShotIds) ? raw.compose.composedShotIds : [],
    },
  };
  return project;
}
/* eslint-enable @typescript-eslint/no-explicit-any */

const scopeSet = new Set<RsScope>([
  "full-person",
  "face-hair",
  "clothing",
  "arm-hand",
  "feet",
]);

const orientationSet = new Set<RsOrientation>([
  "unknown",
  "front",
  "back",
  "side",
  "left_profile",
  "right_profile",
]);

// ---------------------------------------------------------------------------
// 业务校验与迭代参考
// ---------------------------------------------------------------------------

/** 同一镜头内多个不同人物框绑定同一目标角色 → 生成前拦截提示。 */
export function findDuplicateBindings(
  project: RsProject,
  shot: RsShot,
): string[] {
  const seen = new Map<string, string>();
  const duplicates: string[] = [];
  for (const person of shot.people) {
    const cluster = project.sourceCharacters.find((c) => c.id === person.sourceCharacterId);
    if (!cluster?.targetCharacterId || !cluster.targetAppearanceId) continue;
    const existing = seen.get(cluster.targetCharacterId);
    if (existing) {
      if (!duplicates.includes(existing)) duplicates.push(existing);
    } else {
      seen.set(cluster.targetCharacterId, person.label);
    }
  }
  return duplicates;
}

/** 迭代参考说明行(如有参考图,附加到生成提示词末尾)。 */
export function iterationReferenceLine(index: number | null): string {
  return index !== null
    ? `【迭代参考】参考图${index} 是上一轮生成的替换结果，仅作为风格与身份的参考基准，不要截断或复制其背景瑕疵。`
    : "";
}
