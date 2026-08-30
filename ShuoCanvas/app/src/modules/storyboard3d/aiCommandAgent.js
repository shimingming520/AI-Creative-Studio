import { generateText } from "../../../api/aiTextApi.js";
import { STORYBOARD_3D_AI_ASSET_CANDIDATE_LIMIT, selectRelevantStoryboard3DAssets } from "./assetCatalogSelection.js";
import { describeStoryboard3DAssetSpatialMetadata, resolveStoryboard3DAssetSpatialMetadata } from "./spatialLayout.js";
export const STORYBOARD_3D_AI_COMMAND_TOOLS = Object.freeze(["createScene", "getSceneLayout", "addProp", "addCharacter", "addLight", "updateObject", "deleteObject", "setCharacterAction", "setHandPose", "adjustCamera", "checkComposition", "addShot", "updateShot", "listShots"]);
const TOOL_SET = new Set(STORYBOARD_3D_AI_COMMAND_TOOLS);
const READ_ONLY_TOOL_SET = new Set(["getSceneLayout", "checkComposition", "listShots"]);
export const STORYBOARD_3D_AI_COMMAND_SYSTEM_PROMPT = ["你是 3D 场景预演编辑 Agent。", "只能返回受控 JSON 命令，不得返回 JavaScript、HTML、Markdown 或解释文字。", "只能使用 outputSchema 中列出的 tool。", "引用已有对象时必须使用上下文里真实存在的 sceneId、objectId、shotId。", "availableAssets.rows 每行按 availableAssets.columns 排列；添加道具时，assetId 必须逐字使用第一列的真实 id。", "不要搜索、猜测或编造资产 ID；availableAssets 已经是完整可用清单。", "position、rotation、scale、target 都是长度为 3 的有限数字数组，rotation 使用弧度。", "availableAssets 的 spatial 列描述资产尺寸、锚点和语义角色；摆放时必须据此避免悬空、穿插或错误高度。", "不要直接操作 Three.js；所有修改必须表示为命令。", "同一次用户请求的全部修改使用同一个 transactionId，失败时由执行器整体回滚。"].join("\n");
function normalizeText(_0x2b8449) {
  return String(_0x2b8449 || "").trim();
}
function resultText(_0x7bba1a) {
  if (typeof _0x7bba1a === "string") {
    return _0x7bba1a;
  }
  return _0x7bba1a?.text || _0x7bba1a?.outputText || _0x7bba1a?.content || "";
}
function finiteNumber(_0x301ae6, _0x4fe8bb, {
  min = -100000,
  max = 100000
} = {}) {
  const _0x2d20d4 = Number(_0x301ae6);
  if (!Number.isFinite(_0x2d20d4) || _0x2d20d4 < min || _0x2d20d4 > max) {
    throw new TypeError(_0x4fe8bb + " must be a finite number between " + min + " and " + max + ".");
  }
  return _0x2d20d4;
}
function vector3(_0x31a112, _0x10fb15, _0x501513 = null) {
  if (_0x31a112 == null && _0x501513) {
    return [..._0x501513];
  }
  if (!Array.isArray(_0x31a112) || _0x31a112.length !== 3) {
    throw new TypeError(_0x10fb15 + " must contain exactly three numbers.");
  }
  return _0x31a112.map((_0x20d639, _0x193eac) => finiteNumber(_0x20d639, _0x10fb15 + "[" + _0x193eac + "]"));
}
function requiredId(_0x43a3ab, _0x199653) {
  const _0x14dd76 = normalizeText(_0x43a3ab);
  if (!_0x14dd76) {
    throw new TypeError(_0x199653 + " is required.");
  }
  return _0x14dd76;
}
function optionalText(_0x12e4bf, _0x3e0540 = 500) {
  return normalizeText(_0x12e4bf).slice(0, _0x3e0540);
}
function normalizeTransformArgs(_0x3d6308, {
  partial = false
} = {}) {
  const _0x247556 = {};
  if (!partial || _0x3d6308.position != null) {
    _0x247556.position = vector3(_0x3d6308.position, "args.position", [0, 0, 0]);
  }
  if (!partial || _0x3d6308.rotation != null) {
    _0x247556.rotation = vector3(_0x3d6308.rotation, "args.rotation", [0, 0, 0]);
  }
  if (!partial || _0x3d6308.scale != null) {
    _0x247556.scale = vector3(_0x3d6308.scale, "args.scale", [1, 1, 1]).map((_0x210a34, _0x2d22f6) => finiteNumber(_0x210a34, "args.scale[" + _0x2d22f6 + "]", {
      min: 0.001,
      max: 1000
    }));
  }
  return _0x247556;
}
function normalizeCommandArgs(_0x226e5c, _0x2a50b3 = {}) {
  const _0x352a7d = _0x2a50b3 && typeof _0x2a50b3 === "object" && !Array.isArray(_0x2a50b3) ? _0x2a50b3 : {};
  switch (_0x226e5c) {
    case "createScene":
      return {
        name: optionalText(_0x352a7d.name, 120) || "新场景"
      };
    case "getSceneLayout":
    case "listShots":
    case "checkComposition":
      return {};
    case "addProp":
      return {
        assetId: requiredId(_0x352a7d.assetId, "args.assetId"),
        name: optionalText(_0x352a7d.name, 120),
        ...normalizeTransformArgs(_0x352a7d)
      };
    case "addCharacter":
      return {
        assetId: requiredId(_0x352a7d.assetId, "args.assetId"),
        name: optionalText(_0x352a7d.name, 120),
        bodyPreset: optionalText(_0x352a7d.bodyPreset, 80),
        actionId: optionalText(_0x352a7d.actionId, 120),
        ...normalizeTransformArgs(_0x352a7d)
      };
    case "addLight":
      return {
        lightType: ["directional", "point", "spot", "ambient"].includes(_0x352a7d.lightType) ? _0x352a7d.lightType : "directional",
        intensity: finiteNumber(_0x352a7d.intensity ?? 1, "args.intensity", {
          min: 0,
          max: 100
        }),
        color: optionalText(_0x352a7d.color, 32),
        position: vector3(_0x352a7d.position, "args.position", [3, 5, 3]),
        target: vector3(_0x352a7d.target, "args.target", [0, 0, 0])
      };
    case "updateObject":
      return {
        objectId: requiredId(_0x352a7d.objectId, "args.objectId"),
        name: optionalText(_0x352a7d.name, 120),
        visible: typeof _0x352a7d.visible === "boolean" ? _0x352a7d.visible : undefined,
        locked: typeof _0x352a7d.locked === "boolean" ? _0x352a7d.locked : undefined,
        ...normalizeTransformArgs(_0x352a7d, {
          partial: true
        })
      };
    case "deleteObject":
      return {
        objectId: requiredId(_0x352a7d.objectId, "args.objectId")
      };
    case "setCharacterAction":
      return {
        objectId: requiredId(_0x352a7d.objectId, "args.objectId"),
        actionId: requiredId(_0x352a7d.actionId, "args.actionId")
      };
    case "setHandPose":
      return {
        objectId: requiredId(_0x352a7d.objectId, "args.objectId"),
        hand: _0x352a7d.hand === "right" ? "right" : "left",
        poseId: requiredId(_0x352a7d.poseId, "args.poseId")
      };
    case "adjustCamera":
      return {
        position: vector3(_0x352a7d.position, "args.position", [0, 1.6, 5]),
        target: vector3(_0x352a7d.target, "args.target", [0, 1, 0]),
        focalLength: finiteNumber(_0x352a7d.focalLength ?? 50, "args.focalLength", {
          min: 8,
          max: 300
        })
      };
    case "addShot":
      return {
        name: optionalText(_0x352a7d.name, 120) || "新镜头",
        description: optionalText(_0x352a7d.description, 1000)
      };
    case "updateShot":
      return {
        shotId: requiredId(_0x352a7d.shotId, "args.shotId"),
        name: optionalText(_0x352a7d.name, 120),
        description: optionalText(_0x352a7d.description, 1000),
        focalLength: _0x352a7d.focalLength == null ? undefined : finiteNumber(_0x352a7d.focalLength, "args.focalLength", {
          min: 8,
          max: 300
        })
      };
    default:
      throw new TypeError("Unsupported storyboard AI tool: " + _0x226e5c);
  }
}
export function validateStoryboard3DAICommandPlan(_0x1ad60d, {
  sceneIds = [],
  maximumCommands = 50
} = {}) {
  if (!_0x1ad60d || typeof _0x1ad60d !== "object" || Array.isArray(_0x1ad60d)) {
    throw new TypeError("AI command plan must be an object.");
  }
  const _0x4fa43d = requiredId(_0x1ad60d.transactionId, "transactionId");
  const _0x1c5464 = Array.isArray(_0x1ad60d.commands) ? _0x1ad60d.commands : [];
  if (_0x1c5464.length === 0 || _0x1c5464.length > maximumCommands) {
    throw new RangeError("commands must contain between 1 and " + maximumCommands + " items.");
  }
  const _0x10673a = new Set(sceneIds.map(normalizeText).filter(Boolean));
  const _0x5af4ad = _0x1c5464.map((_0x193f7d, _0x134dea) => {
    if (!_0x193f7d || typeof _0x193f7d !== "object" || Array.isArray(_0x193f7d)) {
      throw new TypeError("commands[" + _0x134dea + "] must be an object.");
    }
    const _0x34f2ac = normalizeText(_0x193f7d.tool);
    if (!TOOL_SET.has(_0x34f2ac)) {
      throw new TypeError("commands[" + _0x134dea + "].tool is not allowed.");
    }
    const _0x2e5656 = normalizeText(_0x193f7d.sceneId);
    if (_0x34f2ac !== "createScene") {
      if (!_0x2e5656) {
        throw new TypeError("commands[" + _0x134dea + "].sceneId is required.");
      }
      if (_0x10673a.size > 0 && !_0x10673a.has(_0x2e5656)) {
        throw new TypeError("commands[" + _0x134dea + "].sceneId does not exist.");
      }
    }
    return {
      commandId: normalizeText(_0x193f7d.commandId) || _0x4fa43d + ":" + (_0x134dea + 1),
      transactionId: _0x4fa43d,
      tool: _0x34f2ac,
      sceneId: _0x2e5656,
      source: "ai",
      args: normalizeCommandArgs(_0x34f2ac, _0x193f7d.args)
    };
  });
  return {
    transactionId: _0x4fa43d,
    summary: optionalText(_0x1ad60d.summary, 1000),
    commands: _0x5af4ad,
    readOnly: _0x5af4ad.every(_0x5f1c1c => READ_ONLY_TOOL_SET.has(_0x5f1c1c.tool))
  };
}
function buildProjectContext(_0x421bc4, _0x45fcc3 = []) {
  const _0x4a6fd9 = Array.isArray(_0x421bc4?.scenes) ? _0x421bc4.scenes : [];
  const _0x228915 = new Map((Array.isArray(_0x45fcc3) ? _0x45fcc3 : []).filter(_0x5302b2 => _0x5302b2?.id).map(_0x244ead => [_0x244ead.id, _0x244ead]));
  return {
    projectId: normalizeText(_0x421bc4?.id),
    projectName: normalizeText(_0x421bc4?.name),
    activeSceneId: normalizeText(_0x421bc4?.activeSceneId),
    scenes: _0x4a6fd9.map(_0x2738cc => ({
      sceneId: normalizeText(_0x2738cc?.id),
      name: normalizeText(_0x2738cc?.name),
      objects: (Array.isArray(_0x2738cc?.objects) ? _0x2738cc.objects : []).map(_0x25f234 => ({
        objectId: normalizeText(_0x25f234?.id),
        type: normalizeText(_0x25f234?.type),
        name: normalizeText(_0x25f234?.name),
        assetId: normalizeText(_0x25f234?.assetId),
        bodyPresetId: normalizeText(_0x25f234?.bodyPresetId),
        spatial: resolveStoryboard3DAssetSpatialMetadata(_0x25f234?.type === "character" ? {
          id: _0x25f234?.bodyPresetId,
          category: "character"
        } : _0x228915.get(_0x25f234?.assetId)),
        transform: _0x25f234?.transform
      })),
      shots: (Array.isArray(_0x2738cc?.shots) ? _0x2738cc.shots : []).map(_0x1755ab => ({
        shotId: normalizeText(_0x1755ab?.id),
        name: normalizeText(_0x1755ab?.name),
        description: normalizeText(_0x1755ab?.description),
        camera: _0x1755ab?.camera
      }))
    }))
  };
}
function buildAvailableAssetContext(_0x4e80ec = []) {
  const _0x204efb = (Array.isArray(_0x4e80ec) ? _0x4e80ec : []).filter(_0x85f895 => ["builtin", "pack"].includes(_0x85f895?.source?.kind)).map(_0x5b3321 => [normalizeText(_0x5b3321?.id), normalizeText(_0x5b3321?.name).slice(0, 80), normalizeText(_0x5b3321?.category).slice(0, 80), (Array.isArray(_0x5b3321?.tags) ? _0x5b3321.tags : []).map(normalizeText).filter(Boolean).slice(0, 4).map(_0x8bbd0a => _0x8bbd0a.slice(0, 80)).join(","), describeStoryboard3DAssetSpatialMetadata(_0x5b3321)]).filter(_0x455794 => _0x455794[0]);
  return {
    columns: ["id", "name", "category", "tags", "spatial"],
    rows: _0x204efb
  };
}
export function buildStoryboard3DAICommandPrompt({
  instruction: _0x261f90,
  project: _0x373feb,
  assets = []
} = {}) {
  const _0x4f7d19 = normalizeText(_0x261f90).slice(0, 5000);
  if (!_0x4f7d19) {
    throw new Error("请输入要执行的 3D 场景指令。");
  }
  const _0xaa26e9 = (Array.isArray(assets) ? assets : []).filter(_0x123a5c => ["builtin", "pack"].includes(_0x123a5c?.source?.kind));
  return JSON.stringify({
    task: "plan_storyboard_3d_commands",
    instruction: _0x4f7d19,
    context: buildProjectContext(_0x373feb, _0xaa26e9),
    availableAssets: buildAvailableAssetContext(selectRelevantStoryboard3DAssets(_0xaa26e9, _0x4f7d19, {
      limit: STORYBOARD_3D_AI_ASSET_CANDIDATE_LIMIT
    })),
    allowedTools: STORYBOARD_3D_AI_COMMAND_TOOLS,
    outputSchema: {
      transactionId: "非空字符串",
      summary: "执行摘要",
      commands: [{
        commandId: "可选；事务内唯一",
        tool: "allowedTools 中的一项",
        sceneId: "真实场景 ID；仅 createScene 可为空",
        args: "与 tool 对应的参数对象"
      }]
    }
  });
}
function parseCommandPlanResult(_0x4af519) {
  const _0x526d32 = normalizeText(resultText(_0x4af519));
  if (!_0x526d32) {
    throw new Error("3D Agent 未返回命令计划。");
  }
  try {
    return JSON.parse(_0x526d32);
  } catch {
    throw new Error("3D Agent 未返回有效的严格 JSON。");
  }
}
export async function generateStoryboard3DAICommandPlan({
  instruction: _0x57520e,
  project: _0x9ecf84,
  model: _0x547f85,
  provider: _0x40a7b0,
  request = generateText,
  assetLibrary: _0x491177,
  onProgress: _0x382d70
} = {}) {
  const _0x5e483e = requiredId(_0x547f85, "model");
  const _0x1bd49e = requiredId(_0x40a7b0, "provider");
  const _0x45b168 = buildStoryboard3DAICommandPrompt({
    instruction: _0x57520e,
    project: _0x9ecf84,
    assets: _0x491177?.list?.({
      limit: 1600
    }) || []
  });
  const _0x421c58 = (_0x9ecf84?.scenes || []).map(_0x5170e8 => _0x5170e8?.id).filter(Boolean);
  const _0x2ae640 = {
    model: _0x5e483e,
    provider: _0x1bd49e,
    prompt: _0x45b168,
    systemPrompt: STORYBOARD_3D_AI_COMMAND_SYSTEM_PROMPT,
    temperature: 0.15,
    timeoutMs: 240000
  };
  _0x382d70?.({
    stage: "planning",
    message: "正在规划受控场景命令"
  });
  const _0x4602e2 = await request(_0x2ae640);
  try {
    return validateStoryboard3DAICommandPlan(parseCommandPlanResult(_0x4602e2), {
      sceneIds: _0x421c58
    });
  } catch (_0x439b05) {
    _0x382d70?.({
      stage: "repairing",
      message: "正在校正命令参数"
    });
    const _0x445472 = await request({
      ..._0x2ae640,
      prompt: JSON.stringify({
        originalTask: JSON.parse(_0x45b168),
        rejectionReason: _0x439b05?.message || String(_0x439b05),
        instruction: "重新执行原任务，只返回符合 outputSchema 的严格 JSON。"
      }),
      temperature: 0.05
    });
    return validateStoryboard3DAICommandPlan(parseCommandPlanResult(_0x445472), {
      sceneIds: _0x421c58
    });
  }
}
export async function executeStoryboard3DAICommandPlan(_0x2fafeb, {
  executeTransaction: _0x3fbc4f
} = {}) {
  if (typeof _0x3fbc4f !== "function") {
    throw new TypeError("executeTransaction must be provided.");
  }
  const _0x15f838 = validateStoryboard3DAICommandPlan(_0x2fafeb);
  const _0x1566cf = await _0x3fbc4f(_0x15f838.commands, {
    transactionId: _0x15f838.transactionId,
    source: "ai"
  });
  return {
    ..._0x15f838,
    execution: _0x1566cf
  };
}