/**
 * 剧本工作室 → 替换工作室 联动(桥接)。
 *
 * 把分镜脚本 + 角色资产转换为替换工作室项目:
 *   - 角色(StoryCharacter,名/描述/形象参考图) → RsTargetCharacter:
 *     每个角色生成一个「形象」(appearance,imagePath = 参考图,prompt = 描述),
 *     name/description 直接沿用,便于替换工作室直接绑定;
 *   - 分镜镜头 → RsShot(sourceId=null,label=「第N镜」,imagePrompt/videoPrompt 沿用
 *     镜头提示词,voiceText 预填台词 → 声音克隆步骤可直接转写/配音);
 *   - 已生成结果(参考图/视频) → RsGeneratedItem,镜头卡片中可直接回看;
 *   - sceneLabel 分组 → RsScene;
 *   - 生成参数(provider/model/尺寸/比例/时长) → RsSettings。
 *
 * 更新语义:已存在同名项目时只合并角色资产(按名字匹配,保留绑定关系),
 * 不覆盖用户已做的素材设定/镜头/设置,避免破坏替换流程。
 * 全部为纯函数,不依赖 DOM / IPC。
 */
import {
  buildShotImagePrompt,
  buildShotVideoPrompt,
  finalizeGenerationPrompt,
  type StoryCharacter,
  type StoryboardShot,
} from "./storyboard-script";
import {
  createRsProject,
  rsId,
  RS_PROJECT_VERSION,
  type RsAppearance,
  type RsGeneratedItem,
  type RsProject,
  type RsScene,
  type RsShot,
  type RsTargetCharacter,
} from "./replacement-studio";

// ---------------------------------------------------------------------------
// 类型
// ---------------------------------------------------------------------------

/** 镜头 + 在剧本工作室里已生成的参考图/视频结果。 */
export type StoryboardSyncedShot = {
  shot: StoryboardShot;
  imageResults: { path: string; url?: string | null }[];
  videoResults: { path: string; url?: string | null }[];
};

/** 快照:剧本工作室 → 替换工作室的完整输入。 */
export type StoryboardSyncSnapshot = {
  title?: string;
  aspectRatio?: string;
  characters: StoryCharacter[];
  shots: StoryboardSyncedShot[];
  /** 生成参数(沿用剧本工作室当前选择)。 */
  providerId?: string;
  imageModel?: string;
  videoModel?: string;
  imageSize?: string;
  videoResolution?: string;
};

// ---------------------------------------------------------------------------
// 构建 / 合并
// ---------------------------------------------------------------------------

function syncedShotToRsShot(
  synced: StoryboardSyncedShot,
  index: number,
  snapshot: StoryboardSyncSnapshot,
  promptModel: string,
): RsShot {
  const { shot } = synced;
  const imagePrompt = buildShotImagePrompt(shot, snapshot.characters);
  const videoPrompt = finalizeGenerationPrompt(
    shot.prompt || buildShotVideoPrompt(shot),
    snapshot.characters,
  );
  const toRsItem = (
    item: { path: string; url?: string | null },
    kind: "image" | "video",
  ): RsGeneratedItem => ({
    id: rsId("gen"),
    outputPath: item.path,
    outputUrl: item.url || "",
    createdAt: new Date().toISOString(),
    prompt: kind === "image" ? imagePrompt : videoPrompt,
    model: promptModel,
    kind,
  });
  const scenePrefix = shot.sceneLabel ? `[${shot.sceneLabel}] ` : "";
  return {
    id: `sb-${shot.id}`,
    index: index + 1,
    label: `${scenePrefix}第${index + 1}镜`,
    sourceId: null,
    startSec: 0,
    endSec: shot.durationSec,
    durationSec: shot.durationSec,
    videoPath: synced.videoResults[0]?.path ?? null,
    keyframePath: synced.imageResults[0]?.path ?? null,
    keyframeTimeSec: 0,
    people: [],
    detectionStatus: "done",
    detectionError: null,
    imagePrompt,
    imageResults: synced.imageResults.map((item) => toRsItem(item, "image")),
    imageActiveIndex: 0,
    imageStatus: "idle",
    imageError: null,
    referenceImagePath: null,
    videoPrompt,
    videoResults: synced.videoResults.map((item) => toRsItem(item, "video")),
    videoActiveIndex: 0,
    videoStatus: "idle",
    videoError: null,
    reversed: false,
    voiceText: shot.dialogue || "",
    voiceAudioPath: null,
    voiceStatus: "idle",
    voiceError: null,
    selected: true,
  };
}

function characterToRsCharacter(character: StoryCharacter): RsTargetCharacter {
  const appearance: RsAppearance = {
    id: rsId("appa"),
    name: "形象",
    imagePath: character.referencePath || null,
    prompt: character.description,
  };
  return {
    id: `sb-char-${character.id}`,
    name: character.name || "角色",
    role: "",
    description: character.description,
    appearances: character.referencePath ? [appearance] : [],
    boundLetters: [],
  };
}

/** 用快照构建一个新的替换工作室项目(不修改传入对象)。 */
export function buildReplacementProject(
  snapshot: StoryboardSyncSnapshot,
): RsProject {
  const title =
    (snapshot.title || "").trim() ||
    `剧本项目-${new Date().toISOString().slice(0, 10)}`;
  const project = createRsProject(title);
  const promptModel = snapshot.videoModel || snapshot.imageModel || "";
  project.shots = snapshot.shots.map((synced, index) =>
    syncedShotToRsShot(synced, index, snapshot, promptModel),
  );
  project.characters = snapshot.characters.map(characterToRsCharacter);
  const sceneMap = new Map<string, RsScene>();
  for (const synced of snapshot.shots) {
    const label = synced.shot.sceneLabel?.trim();
    if (!label) continue;
    if (!sceneMap.has(label)) {
      sceneMap.set(label, { id: rsId("scene"), name: label, description: "", imagePath: null });
    }
  }
  project.scenes = [...sceneMap.values()];
  project.settings = {
    ...project.settings,
    providerId: snapshot.providerId || "",
    imageModel: snapshot.imageModel || "",
    imageSize: snapshot.imageSize || "auto",
    videoModel: snapshot.videoModel || "",
    videoDuration: snapshot.shots[0]?.shot.durationSec || 5,
    videoRatio: snapshot.aspectRatio || "16:9",
    videoResolution: snapshot.videoResolution || "auto",
  };
  project.version = RS_PROJECT_VERSION;
  return project;
}

/** 按项目标题查找(忽略大小写与首尾空格);未找到返回 null。 */
export function findProjectByTitle(
  projects: RsProject[],
  title: string,
): RsProject | null {
  const target = String(title || "").trim().toLowerCase();
  if (!target) return null;
  for (const project of projects) {
    if (String(project.title || "").trim().toLowerCase() === target) return project;
  }
  return null;
}

/**
 * 把角色资产合并进已有替换项目(按名字匹配):
 *   - 已存在同名角色:保留 id/boundLetters(绑定关系不丢),更新
 *     description 与形象图(referencePath 非空时更新形象);
 *   - 新角色:追加;
 *   - 不修改 shots/sources/settings 等用户已做的工作。
 */
export function syncCharactersIntoProject(
  project: RsProject,
  characters: StoryCharacter[],
): RsProject {
  const existingByName = new Map(
    project.characters.map(
      (character) => [String(character.name || "").trim().toLowerCase(), character] as const,
    ),
  );
  const merged: RsTargetCharacter[] = [];
  const seen = new Set<string>();
  for (const character of characters) {
    const key = String(character.name || "").trim().toLowerCase();
    seen.add(key);
    const existing = existingByName.get(key);
    if (existing) {
      const appearances = existing.appearances.length
        ? existing.appearances
        : character.referencePath
          ? [{
              id: rsId("appa"),
              name: "形象",
              imagePath: character.referencePath,
              prompt: character.description,
            }]
          : [];
      merged.push({
        ...existing,
        name: character.name || existing.name,
        description: character.description || existing.description,
        appearances:
          character.referencePath && appearances.length
            ? appearances.map((appearance, index) =>
                index === 0 ? { ...appearance, imagePath: character.referencePath!, prompt: character.description } : appearance,
              )
            : appearances,
      });
    } else {
      merged.push(characterToRsCharacter(character));
    }
  }
  // 保留未出现在本次快照里的既有角色(用户自己加过的)。
  for (const existing of project.characters) {
    const key = String(existing.name || "").trim().toLowerCase();
    if (!seen.has(key)) merged.push(existing);
  }
  return {
    ...project,
    characters: merged,
    updatedAt: new Date().toISOString(),
  };
}
