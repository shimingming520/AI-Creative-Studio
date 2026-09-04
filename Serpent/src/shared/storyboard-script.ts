/**
 * 剧本工作室 · 阶段1 — 分镜脚本生成 shared model & pure helpers.
 *
 * 对齐 ShuoCanvas 分镜脚本节点/剧本工作室的提示词设计:
 *   - 镜头用专业电影术语(景别 + 运镜指令),动作拆分到关键帧类特写;
 *   - 台词用「」标注且不允许擅自删改;关键动作后备注音效;
 *   - 单个镜头的视频提示词时长 ≤ STORYBOARD_SHOT_MAX_SEC(与生成模型上限对齐)。
 *
 * 本模块只包含纯函数与类型,不依赖 DOM / YUH IPC,便于单元测试;
 * 提示词模板做成可复用的纯字符串工厂,后期接入生成链路(sw:generate-script)。
 */

// ---------------------------------------------------------------------------
// 类型
// ---------------------------------------------------------------------------

/** 景别(镜头规模)。 */
export type ShotSize =
  | "extreme-wide" // 超广角
  | "wide" // 远景
  | "full" // 全景
  | "medium" // 中景
  | "close" // 近景
  | "extreme-close"; // 特写

export const SHOT_SIZES: { id: ShotSize; label: string }[] = [
  { id: "extreme-wide", label: "超广角" },
  { id: "wide", label: "远景" },
  { id: "full", label: "全景" },
  { id: "medium", label: "中景" },
  { id: "close", label: "近景" },
  { id: "extreme-close", label: "特写" },
];

export const SHOT_SIZE_LABELS: Record<ShotSize, string> = Object.fromEntries(
  SHOT_SIZES.map((item) => [item.id, item.label]),
) as Record<ShotSize, string>;

/** 运镜方式(镜头运动指令)。 */
export type CameraMove =
  | "static" // 固定
  | "push-slow" // 慢速推轨
  | "orbit-slow" // 环绕慢摇
  | "handheld" // 动态手持
  | "follow" // 跟随
  | "crane" // 升降
  | "pan-tilt" // 摇移
  | "whip"; // 甩镜

export const CAMERA_MOVES: { id: CameraMove; label: string }[] = [
  { id: "static", label: "固定" },
  { id: "push-slow", label: "慢速推轨" },
  { id: "orbit-slow", label: "环绕慢摇" },
  { id: "handheld", label: "动态手持" },
  { id: "follow", label: "跟随" },
  { id: "crane", label: "升降" },
  { id: "pan-tilt", label: "摇移" },
  { id: "whip", label: "甩镜" },
];

export const CAMERA_MOVE_LABELS: Record<CameraMove, string> = Object.fromEntries(
  CAMERA_MOVES.map((item) => [item.id, item.label]),
) as Record<CameraMove, string>;

/** 单个镜头提示词时长上限(秒)。对齐主流视频生成模型的 15s 上限。 */
export const STORYBOARD_SHOT_MAX_SEC = 15;
/** 分镜默认时长(秒)。 */
export const STORYBOARD_DEFAULT_SHOT_SEC = 5;

/** 生成入口:用户的文案/想法 + 风格参数。 */
export type StoryboardInput = {
  /** 故事/文案正文(唯一信息源)。 */
  story: string;
  /** 风格描述(可选,如「清新生活方式、小红书感」)。 */
  style?: string;
  /** 期望分镜数量(提示词建议值,模型可微调)。 */
  shotCount?: number;
  /** 目标画幅(建议值,如 16:9 / 9:16)。 */
  aspectRatio?: string;
  /** 语言(默认 zh)。 */
  language?: string;
};

/** 分镜脚本节点输出结果。 */
export type StoryboardScript = {
  title?: string;
  summary?: string;
  style?: string;
  aspectRatio?: string;
  shots: StoryboardShot[];
};

/** 单个分镜(镜头)。 */
export type StoryboardShot = {
  id: string;
  index: number;
  /** 场景/幕标题(可选,多场景时用于分组)。 */
  sceneLabel?: string;
  size: ShotSize;
  cameraMove: CameraMove;
  /** 画面描述(视觉关键词密集,混合场景/角色/光影/特效)。 */
  description: string;
  /** 台词(「」标注,不允许擅自删改原文)。 */
  dialogue?: string;
  /** 音效提示(关键动作后)。 */
  sfx?: string;
  /** 建议时长(秒),应 ≤ STORYBOARD_SHOT_MAX_SEC。 */
  durationSec: number;
  /** 生成视频用的最终提示词(由 buildShotVideoPrompt 合成,可编辑)。 */
  prompt: string;
};

// ---------------------------------------------------------------------------
// 提示词模板(可复用的纯字符串工厂)
// ---------------------------------------------------------------------------

/** 分镜脚本生成的系统提示词(与 ShuoCanvas 分镜脚本原则一致)。 */
export function buildStoryboardSystemPrompt(): string {
  return [
    "## 核心任务",
    "你是一个专业的 AI 分镜脚本生成器。基于用户提供的文本信息,生成「视频提示词」的分镜脚本,分割后的上下分镜必须十分丝滑地连贯。",
    "",
    "## 视频提示词原则",
    "",
    "### 视觉关键词密集度",
    "- 为最大化 AI 模型对画面的控制力,必须使用大量具体的、高辨识度的视觉描述词汇;",
    "- 场景、角色、光影、特效必须混合使用(例如:「幽蓝色的霓虹线路」「血红色的赛博月亮」「凌厉的金色电光」)。",
    "",
    "### 运镜的专业化和指令化",
    "- 采用专业电影术语而非简单描述;",
    "- 每个镜头必须标注【景别】(超广角/远景/全景/中景/近景/特写)与【运镜】(固定/慢速推轨/环绕慢摇/动态手持/跟随/升降/摇移/甩镜)。",
    "",
    "### 动作的分解与强调",
    "- 复杂动作不能一笔带过,必须分解成关键帧与关键特写;",
    "- 关键动作使用【爆发式跃出】(远景)接【腰部极限扭转】(近景),再接【接触的瞬间】(慢动作特写)。",
    "",
    "### 人物台词",
    "- 原文中的对话内容不允许擅自删改,要以输入文案作为唯一信息来源,忠实转化为分镜;",
    "- 对话必须用「」标示出来。",
    "",
    "### 时长与节奏",
    "- 为每个镜头设定合理时长以控制节奏:短时间用于高冲击特写,长时间用于场景铺垫或关键动作;",
    `- 单个镜头的时长不能超过 ${STORYBOARD_SHOT_MAX_SEC} 秒。`,
    "",
    "### 听觉元素",
    "- 在关键动作后备注音效提示,如「尖锐的破空声与低沉的能量轰鸣」。",
    "",
    "## 输出格式",
    "- 只输出一个 JSON 对象,不要输出其它说明文字,不要使用代码块围栏;",
    '- JSON 结构:{"title": "...", "summary": "一句话梗概", "style": "沿用输入风格", "aspectRatio": "输入画幅", "shots": [{"sceneLabel": "场景/幕标题(多场景时填写)", "size": "景别枚举", "cameraMove": "运镜枚举", "description": "画面描述", "dialogue": "台词(无则省略)", "sfx": "音效(无则省略)", "durationSec": 数字}]}',
    "- size 枚举:extreme-wide/wide/full/medium/close/extreme-close;",
    "- cameraMove 枚举:static/push-slow/orbit-slow/handheld/follow/crane/pan-tilt/whip。",
  ].join("\n");
}

/** 分镜脚本生成的用户提示词(携带输入信息)。 */
export function buildStoryboardUserPrompt(input: StoryboardInput): string {
  const lines: string[] = ["# 输入信息", ""];
  if (input.style && input.style.trim()) lines.push(`**风格:** ${input.style.trim()}`);
  if (input.aspectRatio && input.aspectRatio.trim())
    lines.push(`**画幅:** ${input.aspectRatio.trim()}`);
  if (input.shotCount && input.shotCount > 0)
    lines.push(`**期望分镜数量:** ${input.shotCount}`);
  if (input.story && input.story.trim())
    lines.push(`**故事情节:** ${input.story.trim()}`);
  lines.push(
    "",
    "请按系统提示词的要求生成完整 JSON 分镜脚本。",
  );
  return lines.join("\n");
}

/** 单个镜头 → 生成视频用的最终提示词(景别 + 运镜指令 + 画面 + 台词 + 音效)。 */
export function buildShotVideoPrompt(shot: StoryboardShot): string {
  const parts: string[] = [];
  parts.push(`【${SHOT_SIZE_LABELS[shot.size] || shot.size}】`);
  parts.push(`【${CAMERA_MOVE_LABELS[shot.cameraMove] || shot.cameraMove}】`);
  if (shot.description && shot.description.trim()) parts.push(shot.description.trim());
  if (shot.dialogue && shot.dialogue.trim()) parts.push(`台词:「${shot.dialogue.trim()}」`);
  if (shot.sfx && shot.sfx.trim()) parts.push(`音效:${shot.sfx.trim()}`);
  return parts.join(" ");
}

// ---------------------------------------------------------------------------
// 解析 / 规范化
// ---------------------------------------------------------------------------

const SHOT_SIZE_SET = new Set<string>(SHOT_SIZES.map((item) => item.id));
const CAMERA_MOVE_SET = new Set<string>(CAMERA_MOVES.map((item) => item.id));

function clampDuration(value: unknown): number {
  const num = Math.round(Number(value));
  if (!Number.isFinite(num)) return STORYBOARD_DEFAULT_SHOT_SEC;
  return Math.min(STORYBOARD_SHOT_MAX_SEC, Math.max(1, num));
}

function asString(value: unknown): string | undefined {
  if (typeof value === "string") {
    const text = value.trim();
    return text ? text : undefined;
  }
  if (typeof value === "number") return String(value);
  return undefined;
}

/** 从 LLM 原始输出(可能带代码块围栏/前后赘述)中提取 JSON 对象。 */
export function extractJsonObject(raw: string): unknown | null {
  if (!raw) return null;
  const text = String(raw).trim();
  // 1) 优先取 ```json ... ``` 围栏块。
  const fenced = /```(?:json)?\s*([\s\S]*?)```/i.exec(text);
  const candidate = fenced && fenced[1] ? fenced[1] : text;
  // 2) 尝试直接解析。
  try {
    return JSON.parse(candidate.trim());
  } catch {
    // 3) 退而求其次:找第一个 { 到最后一个 } 的区间。
    const start = candidate.indexOf("{");
    const end = candidate.lastIndexOf("}");
    if (start >= 0 && end > start) {
      try {
        return JSON.parse(candidate.slice(start, end + 1));
      } catch {
        return null;
      }
    }
    return null;
  }
}

/** 规范化单个镜头;非法镜头返回 null。 */
export function normalizeStoryboardShot(raw: unknown, index: number): StoryboardShot | null {
  if (!raw || typeof raw !== "object") return null;
  const record = raw as Record<string, unknown>;
  const description = asString(record.description);
  if (!description) return null;
  const sizeRaw = asString(record.size) || "";
  const cameraRaw = asString(record.cameraMove) || "static";
  const size: ShotSize = SHOT_SIZE_SET.has(sizeRaw) ? (sizeRaw as ShotSize) : "medium";
  const cameraMove: CameraMove = CAMERA_MOVE_SET.has(cameraRaw)
    ? (cameraRaw as CameraMove)
    : "static";
  const shot: StoryboardShot = {
    id: `shot-${index + 1}`,
    index,
    size,
    cameraMove,
    description,
    durationSec: clampDuration(record.durationSec),
    prompt: "",
  };
  const sceneLabel = asString(record.sceneLabel);
  if (sceneLabel) shot.sceneLabel = sceneLabel;
  const dialogue = asString(record.dialogue);
  if (dialogue) shot.dialogue = dialogue;
  const sfx = asString(record.sfx);
  if (sfx) shot.sfx = sfx;
  shot.prompt = buildShotVideoPrompt(shot);
  return shot;
}

/** 规范化完整分镜脚本;shots 为空返回 null。 */
export function normalizeStoryScript(raw: unknown): StoryboardScript | null {
  if (!raw || typeof raw !== "object") return null;
  const record = raw as Record<string, unknown>;
  const shotsRaw = Array.isArray(record.shots) ? record.shots : [];
  const shots: StoryboardShot[] = [];
  for (const [offset, item] of shotsRaw.entries()) {
    const shot = normalizeStoryboardShot(item, offset);
    if (shot) shots.push(shot);
  }
  if (shots.length === 0) return null;
  const script: StoryboardScript = { shots };
  const title = asString(record.title);
  if (title) script.title = title;
  const summary = asString(record.summary);
  if (summary) script.summary = summary;
  const style = asString(record.style);
  if (style) script.style = style;
  const aspectRatio = asString(record.aspectRatio);
  if (aspectRatio) script.aspectRatio = aspectRatio;
  return script;
}

/** LLM 输出 → 分镜脚本;失败返回 null + 错误信息。 */
export function parseStoryScript(
  raw: string,
): { script: StoryboardScript | null; error?: string } {
  const json = extractJsonObject(raw);
  if (json === null) {
    return {
      script: null,
      error: "无法从模型输出中解析出分镜 JSON,请重试或更换模型。",
    };
  }
  const script = normalizeStoryScript(json);
  if (script === null) {
    return {
      script: null,
      error: "模型输出缺少有效镜头列表(shots 为空或镜头描述缺失)。",
    };
  }
  return { script };
}

// ---------------------------------------------------------------------------
// 角色资产(阶段2:资产设定)
// ---------------------------------------------------------------------------

/** 角色/形象资产卡:名字 + 描述 + 可选形象参考图。 */
export type StoryCharacter = {
  id: string;
  name: string;
  description: string;
  /** 形象参考图路径(可选,生成时作为 references 传入)。 */
  referencePath?: string;
};

/** 规范化角色资产数组(丢弃空条目,钳制长度)。 */
export function normalizeCharacterAssets(raw: unknown): StoryCharacter[] {
  if (!Array.isArray(raw)) return [];
  const out: StoryCharacter[] = [];
  for (const item of raw.slice(0, 20)) {
    if (!item || typeof item !== "object") continue;
    const record = item as Record<string, unknown>;
    const name = typeof record.name === "string" ? record.name.trim() : "";
    const description =
      typeof record.description === "string" ? record.description.trim() : "";
    if (!name && !description) continue;
    out.push({
      id:
        typeof record.id === "string" && record.id
          ? record.id
          : `char-${out.length + 1}-${Date.now()}`,
      name,
      description,
      referencePath:
        typeof record.referencePath === "string" && record.referencePath
          ? record.referencePath
          : undefined,
    });
  }
  return out;
}

/** 角色设定一行文案(注入生成提示词)。 */
export function buildCharacterContextLine(characters: StoryCharacter[]): string {
  return characters
    .map((character) => {
      const head = character.name || "人物";
      return character.description ? `${head}（${character.description}）` : head;
    })
    .join("；");
}

/**
 * 生成提示词最终化:有角色资产时追加「角色:…」上下文行。
 * 若提示词已包含「角色:」标记(用户手动编辑过)则不重复追加。
 */
export function finalizeGenerationPrompt(
  prompt: string,
  characters: StoryCharacter[],
): string {
  if (!characters.length || !prompt) return prompt;
  if (prompt.includes("角色:")) return prompt;
  return `${prompt} 角色:${buildCharacterContextLine(characters)}`;
}

/** 镜头 → 参考图生成提示词(画面 + 角色,不含台词/音效时间信息)。 */
export function buildShotImagePrompt(
  shot: StoryboardShot,
  characters: StoryCharacter[] = [],
): string {
  const parts: string[] = [
    `【${SHOT_SIZE_LABELS[shot.size] || shot.size}】`,
    `【${CAMERA_MOVE_LABELS[shot.cameraMove] || shot.cameraMove}】`,
  ];
  if (shot.description && shot.description.trim()) parts.push(shot.description.trim());
  return finalizeGenerationPrompt(parts.join(" "), characters);
}

// ---------------------------------------------------------------------------
// 导出 / 拆分工具
// ---------------------------------------------------------------------------

/** 分镜脚本 → 纯文本分镜表(复制/导出用)。 */
export function scriptToPlainText(script: StoryboardScript): string {
  const lines: string[] = [];
  if (script.title) lines.push(`# ${script.title}`);
  if (script.summary) lines.push(script.summary);
  if (script.style) lines.push(`风格:${script.style}`);
  if (script.aspectRatio) lines.push(`画幅:${script.aspectRatio}`);
  lines.push("");
  for (const shot of script.shots) {
    const scene = shot.sceneLabel ? `[${shot.sceneLabel}] ` : "";
    lines.push(
      `${shot.index + 1}. ${scene}【${SHOT_SIZE_LABELS[shot.size] || shot.size}】【${
        CAMERA_MOVE_LABELS[shot.cameraMove] || shot.cameraMove
      }】${shot.durationSec}s`,
    );
    lines.push(`   画面:${shot.description}`);
    if (shot.dialogue) lines.push(`   台词:「${shot.dialogue}」`);
    if (shot.sfx) lines.push(`   音效:${shot.sfx}`);
    lines.push(`   提示词:${shot.prompt}`);
    lines.push("");
  }
  if (lines[lines.length - 1] === "") lines.pop();
  return lines.join("\n");
}

/**
 * 长文案拆分(供分镜批量/分段生成):
 * 优先在句号/问号/感叹号/换行处断开,尽力不超过 maxChars。
 */
export function splitStoryText(text: string, maxChars = 800): string[] {
  const normalized = String(text || "").replace(/\r\n/g, "\n").trim();
  if (!normalized) return [];
  if (normalized.length <= maxChars) return [normalized];
  const sentences = normalized.split(/(?<=[。！？!?]\s*|\n)/);
  const chunks: string[] = [];
  let current = "";
  for (const sentence of sentences) {
    if (!sentence) continue;
    if (current && current.length + sentence.length > maxChars) {
      chunks.push(current);
      current = sentence;
    } else {
      current += sentence;
    }
  }
  if (current) chunks.push(current);
  return chunks;
}
