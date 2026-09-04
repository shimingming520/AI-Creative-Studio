import { generateText } from "../../../api/aiTextApi.js";
import { listSceneAssets } from "../panoramaSceneNode/sceneAssetCatalog.js";
import { STORYBOARD_3D_SHOT_ANGLES, STORYBOARD_3D_SHOT_SIZES, createStoryboard3DProject, migrateStoryboard3DProject } from "./projectModel.js";
import { STORYBOARD_3D_AI_ASSET_CANDIDATE_LIMIT, selectRelevantStoryboard3DAssets } from "./assetCatalogSelection.js";
import { upsertStoryboard3DCameraKeyframe } from "./shotAnimation.js";
import { applyStoryboard3DDiningLayout, describeStoryboard3DAssetSpatialMetadata, normalizeStoryboard3DGeneratedLayout, resolveStoryboard3DAssetSpatialMetadata } from "./spatialLayout.js";
export const STORYBOARD_3D_PROMPT_MAX_CHARACTERS = 5000;
export const STORYBOARD_3D_GENERATION_SCHEMA_VERSION = 1;
const ENVIRONMENT_TYPES = new Set(["empty", "outdoor", "indoor", "studio"]);
const CHARACTER_GENDERS = new Set(["male", "female"]);
const ASSET_SIZES = new Set(["small", "medium", "large"]);
const ASSET_COLORS = new Set(["blue", "red", "green", "yellow", "purple"]);
const SHOT_SIZES = new Set(STORYBOARD_3D_SHOT_SIZES);
const SHOT_ANGLES = new Set(STORYBOARD_3D_SHOT_ANGLES);
const ASSET_CATALOG_TAG_LIMIT = 4;
const ASSET_CATALOG_TEXT_LIMIT = 80;
export const STORYBOARD_3D_GENERATION_SYSTEM_PROMPT = ["你是 3D 场景预演规划助手。", "你的任务是把用户的自然语言描述转换为一个可继续编辑的单场景 3D 预演方案。", "当请求附带参考图时，先观察图中的人物数量、主要物品、空间关系和摄像机视角，再用可用轻量资产搭建近似布局。", "参考图只用于粗略反推预演关系，不要追求精细建模、材质复刻或像素级还原。", "只使用提供的资产 familyId，不得编造资产、模型、贴图或文件 URL。", "空间坐标使用米；position、rotation、scale 都是长度为 3 的数字数组；rotation 使用弧度。", "可用资产附带标准空间尺寸、锚点和语义角色；优先依据这些数据规划间距和高度，不要猜测 Y 坐标。", "若是吃饭或聚餐场景，layout.kind 必须为 dining，participantCount 必须等于明确提及的用餐人数；每位人物需要对应座位。", "镜头需要完整给出 position、target 和 focalLength，并保证能看见主要主体。", "只返回严格 JSON，不要输出 Markdown、代码块、注释或额外说明。"].join("\n");
function normalizeText(_0x6cb65a) {
  return String(_0x6cb65a || "").trim();
}
function clampNumber(_0x4de95c, _0x501d5b, _0x1a0e35, _0x50cac0) {
  const _0x34b7c1 = Number(_0x4de95c);
  if (!Number.isFinite(_0x34b7c1)) {
    return _0x501d5b;
  }
  return Math.min(_0x50cac0, Math.max(_0x1a0e35, _0x34b7c1));
}
function normalizeVector3(_0x291554, _0x302b60, _0x337ee4, _0x167a5e) {
  const _0x31d9b1 = Array.isArray(_0x291554) ? _0x291554 : [];
  return _0x302b60.map((_0x269158, _0x1813de) => clampNumber(_0x31d9b1[_0x1813de], _0x269158, _0x337ee4[_0x1813de], _0x167a5e[_0x1813de]));
}
function getResultText(_0x2c7fd1) {
  if (typeof _0x2c7fd1 === "string") {
    return _0x2c7fd1;
  }
  return _0x2c7fd1?.text || _0x2c7fd1?.outputText || _0x2c7fd1?.content || "";
}
function parseStrictJson(_0x570d0e, _0x385c21) {
  if (_0x570d0e && typeof _0x570d0e === "object" && !Array.isArray(_0x570d0e)) {
    return _0x570d0e;
  }
  const _0x418132 = normalizeText(_0x570d0e);
  if (!_0x418132) {
    throw new Error(_0x385c21);
  }
  try {
    return JSON.parse(_0x418132);
  } catch {
    throw new Error("场景 Agent 未返回有效的 JSON。");
  }
}
export function getStoryboard3DGenerationAssetFamilies(_0x5ef110 = listSceneAssets()) {
  const _0x3b519f = new Map();
  (Array.isArray(_0x5ef110) ? _0x5ef110 : []).forEach(_0x49d271 => {
    const _0x3c4fee = normalizeText(_0x49d271?.familyId);
    if (!_0x3c4fee || _0x3b519f.has(_0x3c4fee)) {
      return;
    }
    _0x3b519f.set(_0x3c4fee, {
      familyId: _0x3c4fee,
      category: normalizeText(_0x49d271?.category),
      tags: [...new Set((_0x49d271?.tags || []).map(normalizeText).filter(_0x5c279c => _0x5c279c && !ASSET_SIZES.has(_0x5c279c) && !ASSET_COLORS.has(_0x5c279c)))].slice(0, ASSET_CATALOG_TAG_LIMIT).map(_0x544371 => _0x544371.slice(0, ASSET_CATALOG_TEXT_LIMIT)),
      spatial: resolveStoryboard3DAssetSpatialMetadata(_0x49d271)
    });
  });
  return [..._0x3b519f.values()];
}
export function buildStoryboard3DGenerationPrompt({
  prompt: _0xb31718,
  assetFamilies = getStoryboard3DGenerationAssetFamilies(),
  inputImageUrls = []
} = {}) {
  const _0x5e88c0 = normalizeText(_0xb31718).slice(0, STORYBOARD_3D_PROMPT_MAX_CHARACTERS);
  if (!_0x5e88c0) {
    throw new Error("请先描述要搭建的 3D 场景。");
  }
  const _0x48d738 = Array.isArray(inputImageUrls) ? inputImageUrls.filter(Boolean).length : 0;
  const _0x40846c = selectRelevantStoryboard3DAssets(assetFamilies, _0x5e88c0, {
    limit: STORYBOARD_3D_AI_ASSET_CANDIDATE_LIMIT
  });
  return JSON.stringify({
    task: "create_storyboard_3d_project",
    schemaVersion: STORYBOARD_3D_GENERATION_SCHEMA_VERSION,
    userPrompt: _0x5e88c0,
    referenceImageCount: _0x48d738,
    assetFamilyColumns: ["familyId", "category", "tags", "spatial"],
    availableAssetFamilies: _0x40846c.map(_0x144496 => [normalizeText(_0x144496?.familyId), normalizeText(_0x144496?.category).slice(0, ASSET_CATALOG_TEXT_LIMIT), (Array.isArray(_0x144496?.tags) ? _0x144496.tags : []).map(normalizeText).filter(Boolean).slice(0, ASSET_CATALOG_TAG_LIMIT).map(_0x4cdd9c => _0x4cdd9c.slice(0, ASSET_CATALOG_TEXT_LIMIT)).join(","), describeStoryboard3DAssetSpatialMetadata(_0x144496)]),
    requirements: ["只生成一个主场景和一个主镜头。", "优先选择能表达空间关系的 3 到 12 个物体，避免重复堆叠。", "若描述包含人物，可使用 kind=character；其他可见物体使用 kind=asset。", "人物必须保留描述中明确的人数；吃饭或聚餐时，每个人配一把椅子，围绕餐桌布置，并把 layout.kind 设为 dining。", "餐具和食物使用 tabletop-item 资产，并把 position.y 放在餐桌 supportY 之上。", "桌椅、人物和餐具的间距优先遵守 availableAssetFamilies 的 spatial 描述；不要让它们互相穿插。", "availableAssetFamilies 每行按 assetFamilyColumns 排列；asset 的 familyId 必须逐字使用其中第一列。", "size 只能是 small、medium、large；color 只能是 blue、red、green、yellow、purple。", "environmentType 只能是 empty、outdoor、indoor、studio。", ...(_0x48d738 > 0 ? ["参考图是场景布局依据：估计其中的人物数量、主要物品、前后左右关系与镜头方向。", "只需使用可用轻量资产建立大概空间关系，不要求精细外观或完全还原。"] : []), "shotSize 只能是 " + STORYBOARD_3D_SHOT_SIZES.join("、") + "。", "shotAngle 只能是 " + STORYBOARD_3D_SHOT_ANGLES.join("、") + "。"],
    outputSchema: {
      projectName: "项目名称",
      sceneName: "场景名称",
      environmentType: "empty | outdoor | indoor | studio",
      backgroundColor: "可选的 #RRGGBB",
      layout: {
        kind: "generic | dining",
        participantCount: 0
      },
      objects: [{
        kind: "asset | character",
        name: "物体名称",
        familyId: "asset 必填",
        gender: "character 使用 male | female",
        size: "small | medium | large",
        color: "blue | red | green | yellow | purple",
        position: [0, 0, 0],
        rotation: [0, 0, 0],
        scale: [1, 1, 1]
      }],
      shot: {
        name: "镜头名称",
        description: "镜头意图",
        shotSize: "MED",
        shotAngle: "eye",
        camera: {
          position: [5, 4, 7],
          target: [0, 1.2, 0],
          focalLength: 35
        }
      }
    }
  });
}
export function parseStoryboard3DGenerationResult(_0x29b96e, {
  assetFamilies = getStoryboard3DGenerationAssetFamilies()
} = {}) {
  const _0x1fe0db = parseStrictJson(getResultText(_0x29b96e), "场景 Agent 未返回可用的 3D 场景方案。");
  const _0xdcc778 = normalizeText(_0x1fe0db.projectName);
  const _0x5f3912 = normalizeText(_0x1fe0db.sceneName);
  if (!_0xdcc778) {
    throw new Error("场景 Agent 返回结果缺少项目名称。");
  }
  if (!_0x5f3912) {
    throw new Error("场景 Agent 返回结果缺少场景名称。");
  }
  const _0x4f6e41 = new Map(assetFamilies.map(_0x48b66d => [_0x48b66d.familyId, _0x48b66d]));
  const _0x1b25e = new Set(_0x4f6e41.keys());
  const _0x200dac = (Array.isArray(_0x1fe0db.objects) ? _0x1fe0db.objects : []).slice(0, 24).map((_0x52f44c, _0x3a4e65) => {
    const _0x13513e = _0x52f44c?.kind === "character" ? "character" : "asset";
    if (_0x13513e === "asset" && !_0x1b25e.has(normalizeText(_0x52f44c?.familyId))) {
      return null;
    }
    return {
      kind: _0x13513e,
      name: normalizeText(_0x52f44c?.name) || "物体 " + (_0x3a4e65 + 1),
      ...(_0x13513e === "asset" ? {
        familyId: normalizeText(_0x52f44c.familyId),
        size: ASSET_SIZES.has(_0x52f44c?.size) ? _0x52f44c.size : "medium",
        color: ASSET_COLORS.has(_0x52f44c?.color) ? _0x52f44c.color : "blue"
      } : {
        gender: CHARACTER_GENDERS.has(_0x52f44c?.gender) ? _0x52f44c.gender : "male"
      }),
      position: normalizeVector3(_0x52f44c?.position, [0, 0, 0], [-20, 0, -20], [20, 10, 20]),
      rotation: normalizeVector3(_0x52f44c?.rotation, [0, 0, 0], [-Math.PI * 2, -Math.PI * 2, -Math.PI * 2], [Math.PI * 2, Math.PI * 2, Math.PI * 2]),
      scale: normalizeVector3(_0x52f44c?.scale, [1, 1, 1], [0.25, 0.25, 0.25], [4, 4, 4])
    };
  }).filter(Boolean);
  const _0x5dcbc8 = normalizeStoryboard3DGeneratedLayout(_0x1fe0db.layout);
  const _0x223d4b = _0x200dac.some(_0x566d20 => _0x566d20.kind === "asset" && resolveStoryboard3DAssetSpatialMetadata(_0x4f6e41.get(_0x566d20.familyId)).roles.includes("table"));
  const _0x2303c6 = _0x200dac.filter(_0x4823b8 => _0x4823b8.kind === "character").length;
  const _0x3bd954 = _0x5dcbc8.kind === "dining" || _0x223d4b && _0x2303c6 >= 2 ? {
    kind: "dining",
    participantCount: Math.max(_0x5dcbc8.participantCount, _0x2303c6)
  } : _0x5dcbc8;
  const _0x527ee8 = _0x1fe0db.shot && typeof _0x1fe0db.shot === "object" ? _0x1fe0db.shot : {};
  const _0x128c3c = _0x527ee8.camera && typeof _0x527ee8.camera === "object" ? _0x527ee8.camera : {};
  return {
    schemaVersion: STORYBOARD_3D_GENERATION_SCHEMA_VERSION,
    projectName: _0xdcc778,
    sceneName: _0x5f3912,
    environmentType: ENVIRONMENT_TYPES.has(_0x1fe0db.environmentType) ? _0x1fe0db.environmentType : "empty",
    backgroundColor: /^#[0-9a-f]{6}$/i.test(normalizeText(_0x1fe0db.backgroundColor)) ? normalizeText(_0x1fe0db.backgroundColor) : "",
    layout: _0x3bd954,
    objects: _0x200dac,
    shot: {
      name: normalizeText(_0x527ee8.name) || "主镜头",
      description: normalizeText(_0x527ee8.description),
      shotSize: SHOT_SIZES.has(_0x527ee8.shotSize) ? _0x527ee8.shotSize : "MED",
      shotAngle: SHOT_ANGLES.has(_0x527ee8.shotAngle) ? _0x527ee8.shotAngle : "eye",
      camera: {
        position: normalizeVector3(_0x128c3c.position, [5, 4, 7], [-50, 0.1, -50], [50, 30, 50]),
        target: normalizeVector3(_0x128c3c.target, [0, 1.2, 0], [-20, 0, -20], [20, 20, 20]),
        focalLength: clampNumber(_0x128c3c.focalLength, 35, 18, 120)
      }
    }
  };
}
function resolveSceneAsset(_0x3b441c, _0x447df5) {
  return _0x3b441c.find(_0x498170 => _0x498170.familyId === _0x447df5.familyId && _0x498170.size === _0x447df5.size && _0x498170.colorKey === _0x447df5.color) || _0x3b441c.find(_0x5e0a2d => _0x5e0a2d.familyId === _0x447df5.familyId && _0x5e0a2d.size === "medium" && _0x5e0a2d.colorKey === "blue");
}
export function createStoryboard3DProjectFromGeneration(_0x1d24d3, {
  now = Date.now(),
  idFactory: _0x2b83a5,
  projectId: _0x45111b,
  assets = listSceneAssets()
} = {}) {
  const _0xb86d3a = createStoryboard3DProject({
    id: _0x45111b,
    name: _0x1d24d3?.projectName,
    sceneName: _0x1d24d3?.sceneName,
    shotName: _0x1d24d3?.shot?.name,
    environmentType: _0x1d24d3?.environmentType,
    now: now,
    idFactory: _0x2b83a5
  });
  const _0x12a33b = _0xb86d3a.scenes[0];
  if (_0x1d24d3?.backgroundColor) {
    _0x12a33b.environment.backgroundColor = _0x1d24d3.backgroundColor;
  }
  const _0x346db4 = (Array.isArray(_0x1d24d3?.objects) ? _0x1d24d3.objects : []).map(_0x5b82c1 => {
    const _0x55dd3f = {
      position: _0x5b82c1.position,
      rotation: _0x5b82c1.rotation,
      scale: _0x5b82c1.scale
    };
    if (_0x5b82c1.kind === "character") {
      return {
        type: "character",
        name: _0x5b82c1.name,
        bodyPresetId: _0x5b82c1.gender === "female" ? "adult-female" : "adult-male",
        transform: _0x55dd3f
      };
    }
    const _0x416228 = resolveSceneAsset(assets, _0x5b82c1);
    if (!_0x416228) {
      return null;
    }
    return {
      type: "prop",
      name: _0x5b82c1.name,
      assetId: _0x416228.id,
      transform: _0x55dd3f
    };
  }).filter(Boolean);
  const _0x2296ee = _0x1d24d3?.layout?.kind === "dining" ? applyStoryboard3DDiningLayout(_0x346db4, {
    assets: assets,
    participantCount: _0x1d24d3.layout.participantCount
  }) : {
    objects: _0x346db4
  };
  _0x12a33b.objects = _0x2296ee.objects;
  const _0x572ccf = _0x12a33b.shots[0];
  _0x572ccf.name = _0x1d24d3?.shot?.name || _0x572ccf.name;
  _0x572ccf.description = _0x1d24d3?.shot?.description || "";
  _0x572ccf.shotSize = _0x1d24d3?.shot?.shotSize || _0x572ccf.shotSize;
  _0x572ccf.shotAngle = _0x1d24d3?.shot?.shotAngle || _0x572ccf.shotAngle;
  _0x572ccf.camera = {
    ..._0x572ccf.camera,
    ..._0x1d24d3?.shot?.camera
  };
  _0x572ccf.animation = upsertStoryboard3DCameraKeyframe(_0x572ccf.animation, {
    time: 0,
    camera: _0x572ccf.camera
  });
  return migrateStoryboard3DProject(_0xb86d3a, {
    now: now,
    idFactory: _0x2b83a5,
    fallbackProject: _0xb86d3a
  });
}
function buildRepairPrompt(_0x2f3a17, _0x2b4192) {
  return JSON.stringify({
    task: "repair_invalid_storyboard_3d_project",
    originalRequest: JSON.parse(_0x2f3a17),
    rejectionReason: normalizeText(_0x2b4192?.message),
    instruction: "重新执行原任务，只返回符合原 outputSchema 的严格 JSON 对象。"
  });
}
export async function generateStoryboard3DProjectDraft({
  prompt: _0xf46c9,
  model = "",
  provider = "",
  request = generateText,
  onProgress = null,
  now = Date.now(),
  idFactory: _0x22b848,
  projectId: _0x2cadb7,
  assets = [],
  inputImageUrls = []
} = {}) {
  const _0x194062 = normalizeText(model);
  const _0x2f46dd = normalizeText(provider);
  if (!_0x194062 || !_0x2f46dd) {
    throw new Error("请先选择可用的文本模型。");
  }
  if (!Array.isArray(assets) || assets.length === 0) {
    throw new Error("尚未安装 3D 模型包，无法生成场景。");
  }
  const _0xc5f939 = selectRelevantStoryboard3DAssets(assets, _0xf46c9, {
    limit: STORYBOARD_3D_AI_ASSET_CANDIDATE_LIMIT
  });
  const _0x2c5f22 = getStoryboard3DGenerationAssetFamilies(_0xc5f939);
  if (_0x2c5f22.length === 0) {
    throw new Error("3D 模型包中没有可供场景 Agent 使用的素材。");
  }
  const _0xf8fe1e = Array.isArray(inputImageUrls) ? inputImageUrls.map(normalizeText).filter(Boolean).slice(0, 1) : [];
  const _0x3a4508 = buildStoryboard3DGenerationPrompt({
    prompt: _0xf46c9,
    assetFamilies: _0x2c5f22,
    inputImageUrls: _0xf8fe1e
  });
  const _0x46ff25 = {
    model: _0x194062,
    provider: _0x2f46dd,
    prompt: _0x3a4508,
    systemPrompt: STORYBOARD_3D_GENERATION_SYSTEM_PROMPT,
    temperature: 0.35,
    timeoutMs: 240000,
    ...(_0xf8fe1e.length > 0 ? {
      inputImageUrls: _0xf8fe1e
    } : {})
  };
  onProgress?.({
    stage: "planning",
    message: "正在规划场景、物体与镜头"
  });
  const _0xa25455 = await request(_0x46ff25);
  let _0x39f0d6;
  try {
    _0x39f0d6 = parseStoryboard3DGenerationResult(_0xa25455, {
      assetFamilies: _0x2c5f22
    });
  } catch (_0x44cd4a) {
    onProgress?.({
      stage: "repairing",
      message: "正在校正场景结构"
    });
    const _0x2d795f = await request({
      ..._0x46ff25,
      prompt: buildRepairPrompt(_0x3a4508, _0x44cd4a),
      temperature: 0.1
    });
    _0x39f0d6 = parseStoryboard3DGenerationResult(_0x2d795f, {
      assetFamilies: _0x2c5f22
    });
  }
  onProgress?.({
    stage: "building",
    message: "正在创建可编辑的 3D 项目"
  });
  return createStoryboard3DProjectFromGeneration(_0x39f0d6, {
    now: now,
    idFactory: _0x22b848,
    projectId: _0x2cadb7,
    assets: assets
  });
}