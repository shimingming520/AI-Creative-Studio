/**
 * 替换工作室 (Replacement Studio) — shared model & pure prompt helpers.
 *
 * 依据 ShuoCanvas「替换工作室」(personReplacement) 的核心语义移植:
 *  - 基础素材(图片或视频首帧)上框选人物(sourceCharacter);
 *  - 为目标人物(characters)维护参考形象(appearances);
 *  - 由「原图 + 位置标注图 + 目标形象参考图」多图引导进行人物替换生成;
 *  - 替换结果可一键图生视频(cloud video)与导出/加入资源库。
 *
 * 与 ShuoCanvas 的差异(当前版本):
 *  - 人物检测采用通用视觉大模型(经 YUH 的 chat 中转站),不再依赖本机
 *    OSNET 模型包;同时保留手动框选兜底。
 *  - 智能裁剪/声音克隆/合成导出依赖 ShuoCanvas 本地 /api/v2/* 服务,
 *    本版本只提供「单镜头(首帧/整图)」生成管线,后续可扩展。
 */

// ---------------------------------------------------------------------------
// 基础类型
// ---------------------------------------------------------------------------

/** 归一化 bbox(0..1): x,y 为左上角,w,h 为宽高。 */
export type RsBbox = { x: number; y: number; w: number; h: number };

/** 替换范围 — 对应 ShuoCanvas replacementScope 的常见取值。 */
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

export type RsBaseAsset = {
  kind: "image" | "video";
  /** 源文件绝对路径(图片或视频)。 */
  path: string;
  name: string;
  /** 用于框选/生成的关键帧图片绝对路径(图片=path,视频=抽取的首帧)。 */
  keyframePath: string;
  width: number;
  height: number;
  durationSec: number | null;
};

export type RsSourceCharacter = {
  id: string;
  /** 人物A/人物B… — 在标注图中以字母 A/B/C 呈现。 */
  label: string;
  bbox: RsBbox;
  method: "auto" | "manual";
  confidence: number | null;
  scope: RsScope;
  /** 未绑定 = null(生成时跳过并提示)。 */
  targetCharacterId: string | null;
  targetAppearanceId: string | null;
};

export type RsAppearance = {
  id: string;
  name: string;
  /** 参考形象图片绝对路径;null = 仅文字描述。 */
  imagePath: string | null;
  /** 该形象的补充描述(发型/服装/年龄等)。 */
  prompt: string;
};

export type RsTargetCharacter = {
  id: string;
  name: string;
  description: string;
  appearances: RsAppearance[];
};

export type RsGeneratedItem = {
  id: string;
  outputPath: string;
  outputUrl: string;
  createdAt: string;
  prompt: string;
  model: string;
  kind: "image" | "video";
  error?: string | null;
};

export type RsShotStatus = "idle" | "generating" | "done" | "error";

export type RsShot = {
  id: string;
  label: string;
  keyframePath: string;
  sourceVideoPath: string | null;
  imagePrompt: string;
  imageResults: RsGeneratedItem[];
  imageActiveIndex: number;
  imageStatus: RsShotStatus;
  imageError: string | null;
  videoPrompt: string;
  videoResults: RsGeneratedItem[];
  videoActiveIndex: number;
  videoStatus: RsShotStatus;
  videoError: string | null;
};

export type RsSettings = {
  /** 图片生成:中转站 provider。 */
  providerId: string;
  /** 图片生成模型(需要 image edit 能力)。 */
  imageModel: string;
  /** 图片尺寸,透传给云端接口(auto 由模型决定)。 */
  imageSize: string;
  /** 图片质量(auto/standard/high)。 */
  imageQuality: string;
  /** 视频生成模型(可选)。 */
  videoModel: string;
  /** 视频时长秒。 */
  videoDuration: number;
  /** 视频比例(16:9 / 9:16 / 1:1)。 */
  videoRatio: string;
  /** 人物检测:中转站 provider(可使用与生成不同的 provider)。 */
  detectProviderId: string;
  /** 人物检测:视觉模型(如 qwen-vl-max / gpt-4.1-mini / gemini-2.5-flash)。 */
  detectModel: string;
  /** 检测提示词。 */
  detectPrompt: string;
  /** 图像替换提示词模板:{label} {scope} {character} {appearance} {description} {shot}。 */
  imagePromptTemplate: string;
  /** 视频替换提示词模板。 */
  videoPromptTemplate: string;
};

export type RsHistoryEntry = {
  id: string;
  kind: "image" | "video";
  at: string;
  prompt: string;
  model: string;
  outputPath: string;
  shotId: string | null;
  error?: string | null;
};

export type RsProject = {
  version: number;
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  base: RsBaseAsset | null;
  sourceCharacters: RsSourceCharacter[];
  targetCharacters: RsTargetCharacter[];
  shots: RsShot[];
  settings: RsSettings;
  history: RsHistoryEntry[];
};

// ---------------------------------------------------------------------------
// 常量与默认值
// ---------------------------------------------------------------------------

export const RS_PROJECT_VERSION = 1;
export const RS_MAX_PEOPLE = 8;

export const RS_LETTERS = "ABCDEFGH" as const;

export const RS_DEFAULT_IMAGE_PROMPT_TEMPLATE = [
  "请对图片进行人物替换：【任务】保持原图的构图、镜头、姿势、光线、场景与背景完全不变，仅替换指定人物。",
  "【人物位置】原图中每个需要替换的人物都用彩色边框标注，框内标注了人物字母，人物字母与参考图的对应关系如下：{bindings}",
  "【替换要求】{scopeLines}",
  "【注意事项】不要改变标注框外的人物与场景；不要重绘整体画面；输出保持与原图相同的比例与构图。",
].join("\n");

export const RS_DEFAULT_VIDEO_PROMPT_TEMPLATE =
  "保持源视频/参考画面的动作、镜头和构图，使用参考图片中的人物形象替换对应人物，人物身份保持一致。";

export const RS_DEFAULT_DETECT_PROMPT = [
  "你是一个图像分析助手。请找出图片中所有人物。",
  "对每个人物输出一个 JSON 对象：{\"label\":\"人物A\",\"bbox\":[x,y,w,h]}。",
  "规则：1) label 按人物从大到小、从左到右依次编号（人物A、人物B…）；",
  "2) bbox 使用归一化坐标（0~1），依次为 [左上x, 左上y, 宽, 高]，需完整包住该人物；",
  "3) 若只露出半身/背影，也按可见部分标注；",
  "4) 只输出 JSON 数组，不要输出其他文字。",
].join("\n");

export function defaultRsSettings(): RsSettings {
  return {
    providerId: "",
    imageModel: "",
    imageSize: "auto",
    imageQuality: "auto",
    videoModel: "",
    videoDuration: 5,
    videoRatio: "16:9",
    detectProviderId: "",
    detectModel: "",
    detectPrompt: RS_DEFAULT_DETECT_PROMPT,
    imagePromptTemplate: RS_DEFAULT_IMAGE_PROMPT_TEMPLATE,
    videoPromptTemplate: RS_DEFAULT_VIDEO_PROMPT_TEMPLATE,
  };
}

let idCounter = 0;
export function rsId(prefix: string): string {
  idCounter += 1;
  return `${prefix}-${Date.now().toString(36)}-${idCounter.toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function charLabel(index: number): string {
  return `人物${RS_LETTERS[index % RS_LETTERS.length] ?? "A"}`;
}

export function createRsProject(title: string): RsProject {
  const now = new Date().toISOString();
  return {
    version: RS_PROJECT_VERSION,
    id: rsId("rs"),
    title: title.trim() || "未命名替换项目",
    createdAt: now,
    updatedAt: now,
    base: null,
    sourceCharacters: [],
    targetCharacters: [],
    shots: [],
    settings: defaultRsSettings(),
    history: [],
  };
}

// ---------------------------------------------------------------------------
// 提示词与参考图构造(纯函数,便于测试)
// ---------------------------------------------------------------------------

export type RsBindingLine = {
  /** 人物字母,如 A。 */
  letter: string;
  label: string;
  /** 参考图序号(从 3 开始,1=原图,2=标注图),0 表示无参考图。 */
  imageIndex: number | null;
  scope: RsScope;
  characterName: string;
  appearanceName: string | null;
  appearancePrompt: string;
};

/** 替换模板 — {bindings} 由当前项目的人物绑定生成。 */
export function buildRsImagePrompt(opts: {
  template: string;
  shotLabel: string | null;
  bindings: RsBindingLine[];
  imagePromptFallback?: string;
}): string {
  const { template, bindings } = opts;
  const bindingLines = bindings.map((b) => {
    const ref =
      b.imageIndex !== null ? `参考图${b.imageIndex}（${b.characterName}${b.appearanceName ? ` / ${b.appearanceName}` : ""}）` : "文字描述";
    const extra = b.appearancePrompt.trim() ? `，形象描述：${b.appearancePrompt.trim()}` : "";
    return `${b.letter}号人物（${b.label}）→ ${ref}；替换范围：${RS_SCOPE_LABELS[b.scope]}${extra}`;
  });
  const scopeLines = bindings
    .map((b) => `${b.letter}号人物：${RS_SCOPE_INSTRUCTIONS[b.scope]}`)
    .join("\n");
  const prompt = template
    .replaceAll("{shot}", opts.shotLabel ?? "本镜头")
    .replaceAll("{bindings}", bindingLines.join("；") || "提示中未分配目标人物")
    .replaceAll("{scopeLines}", scopeLines || "完整替换全部指定人物。");
  return prompt.trim() || opts.imagePromptFallback || "替换图中标注人物为目标参考形象，保持构图不变。";
}

export function buildRsVideoPrompt(opts: {
  template: string;
  shotLabel: string | null;
  bindings: RsBindingLine[];
}): string {
  const { template, bindings } = opts;
  let prompt = template
    .replaceAll("{shot}", opts.shotLabel ?? "本镜头")
    .replaceAll(
      "{bindings}",
      bindings
        .map((b) => `人物${b.letter}→${b.characterName}${b.appearanceName ? `(${b.appearanceName})` : ""}`)
        .join("、") || "全部已绑定人物",
    );
  if (!prompt.trim()) prompt = RS_DEFAULT_VIDEO_PROMPT_TEMPLATE;
  return prompt;
}

/**
 * 把检测模型输出解析为 bbox 列表。
 * 兼容 ```json fenced、前后缀说明、纯文本 JSON 数组等常见输出。
 */
export function parseDetectedPeople(raw: string): {
  bbox: RsBbox;
  confidence: number | null;
  labelHint: string | null;
}[] {
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
    const normalized: { bbox: RsBbox; confidence: number | null; labelHint: string | null }[] = [];
    if (Array.isArray(list)) {
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
        const x = clamp01(x0), y = clamp01(y0);
        const w = clamp01(Math.abs(w0)), h = clamp01(Math.abs(h0));
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
        normalized.push({
          bbox: { x: clamp01(x + w <= 1 ? x : 1 - w), y: clamp01(y + h <= 1 ? y : 1 - h), w, h },
          confidence,
          labelHint,
        });
      }
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
