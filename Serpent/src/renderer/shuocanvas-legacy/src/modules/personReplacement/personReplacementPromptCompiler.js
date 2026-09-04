import { formatPersonReplacementScopeLabel, formatPersonReplacementPersonLabel, getPersonReplacementCharacterBaseImageRef, normalizePersonReplacementScope, normalizePersonReplacementProject, normalizePersonReplacementShot, resolvePersonReplacementImageSourceRef } from "./personReplacementProject.js";
import { PERSON_REPLACEMENT_ORIENTATION_ENABLED } from "./personReplacementCapabilities.js";
import { buildPersonReplacementLocationGuide } from "./personReplacementLocationGuide.js";
function normalizeText(_0x5c2bf7) {
  return String(_0x5c2bf7 ?? "").trim();
}
function comparePeopleByPosition(_0x4f63b5, _0x1a436a) {
  const _0x2a1354 = {
    left: 0,
    center: 1,
    right: 2,
    unknown: 3
  };
  const _0x245cb4 = _0x4f63b5.locator?.bbox;
  const _0x4946a7 = _0x1a436a.locator?.bbox;
  const _0x451d5e = _0x245cb4 ? _0x245cb4.x + _0x245cb4.width / 2 : Number.POSITIVE_INFINITY;
  const _0x263a56 = _0x4946a7 ? _0x4946a7.x + _0x4946a7.width / 2 : Number.POSITIVE_INFINITY;
  if (_0x451d5e !== _0x263a56) {
    return _0x451d5e - _0x263a56;
  }
  const _0x5b2805 = (_0x2a1354[_0x4f63b5.locator?.horizontal] ?? 3) - (_0x2a1354[_0x1a436a.locator?.horizontal] ?? 3);
  if (_0x5b2805) {
    return _0x5b2805;
  }
  return _0x4f63b5.id.localeCompare(_0x1a436a.id, "zh-CN");
}
function normalizeCompilerInput(_0x2524dd = {}) {
  const _0x2d93bd = normalizePersonReplacementProject(_0x2524dd.project || {
    characters: _0x2524dd.characters || _0x2524dd.targetCharacters,
    mappings: _0x2524dd.mappings
  });
  const _0x9e4de9 = normalizePersonReplacementShot(_0x2524dd.shot || {}, 0);
  return {
    project: _0x2d93bd,
    shot: _0x9e4de9
  };
}
function getTargetCharacterId(_0x57efec, _0x38990f) {
  const _0x3eb925 = normalizeText(_0x57efec.targetCharacterId);
  if (_0x3eb925) {
    return _0x3eb925;
  }
  if (_0x57efec.projectMappingDisabled === true) {
    return "";
  }
  return _0x38990f.get(normalizeText(_0x57efec.sourceCharacterId)) || "";
}
function getTargetAppearanceImageRef(_0x20f9de, _0x41d54e = "") {
  const _0x4c0d5d = Array.isArray(_0x20f9de?.appearances) ? _0x20f9de.appearances : [];
  const _0x42fba8 = _0x4c0d5d.find(_0x21f5f9 => normalizeText(_0x21f5f9?.id) === normalizeText(_0x41d54e));
  return normalizeText(_0x42fba8?.imageUrl) || getPersonReplacementCharacterBaseImageRef(_0x20f9de);
}
function resolveSceneReference(_0x3bff96, _0x2aafd5) {
  const _0x1e7563 = normalizeText(_0x2aafd5.sceneReference?.sceneId);
  if (!_0x1e7563) {
    return null;
  }
  const _0x3f4b89 = _0x3bff96.scenes.find(_0x28afb3 => _0x28afb3.id === _0x1e7563);
  if (!_0x3f4b89) {
    return {
      sceneId: _0x1e7563,
      scene: null,
      imageRef: ""
    };
  }
  return {
    sceneId: _0x1e7563,
    scene: _0x3f4b89,
    appearanceId: normalizeText(_0x2aafd5.sceneReference?.appearanceId),
    imageRef: getTargetAppearanceImageRef(_0x3f4b89, _0x2aafd5.sceneReference?.appearanceId)
  };
}
function getPersonBoundingBox(_0x390595 = {}) {
  return _0x390595.locator?.bbox || _0x390595.bbox || null;
}
function formatPercent(_0x580989) {
  return Math.round((Number(_0x580989) || 0) * 100) + "%";
}
function getHorizontalLocationLabel(_0x5d3500 = {}) {
  const _0x5df91b = (Number(_0x5d3500.x) || 0) + (Number(_0x5d3500.width) || 0) / 2;
  if (_0x5df91b < 0.34) {
    return "画面左侧";
  }
  if (_0x5df91b > 0.66) {
    return "画面右侧";
  }
  return "画面中间";
}
function buildLocationLine(_0x20166b, _0x2093b3) {
  return _0x20166b + "：图像1中" + getHorizontalLocationLabel(_0x2093b3) + "，定位区域 x=" + formatPercent(_0x2093b3.x) + "、y=" + formatPercent(_0x2093b3.y) + "、宽=" + formatPercent(_0x2093b3.width) + "、高=" + formatPercent(_0x2093b3.height);
}
function buildCustomPersonLabelClause(_0x50726f, _0x57d538) {
  const _0x704a91 = normalizeText(_0x50726f?.label);
  if (_0x704a91 && _0x704a91 !== _0x57d538) {
    return "；" + _0x57d538 + "的自定义名称是“" + _0x704a91 + "”";
  } else {
    return "";
  }
}
function buildReplacementScopeInstruction({
  sourceLabel = "图像1中的主体",
  referenceLabel = "目标参考图",
  replacementScope: _0x5df541
} = {}) {
  const _0x449ee6 = normalizePersonReplacementScope(_0x5df541);
  const _0xce427c = formatPersonReplacementScopeLabel(_0x449ee6);
  const _0x273898 = sourceLabel + "（" + _0xce427c + "）";
  const _0x34dd9c = {
    "full-person": _0x273898 + "：将完整人物替换为" + referenceLabel + "中的人物，脸部、五官、发型、体型和服装全部使用" + referenceLabel + "中的人物特征，不保留图像1原人物的身份与外观特征。",
    "visible-part": _0x273898 + "：将当前可见部分替换为" + referenceLabel + "中的对应部分。",
    clothing: _0x273898 + "：将衣服替换为" + referenceLabel + "中的衣服。",
    "arm-hand": _0x273898 + "：将手臂和手部替换为" + referenceLabel + "中的手臂和手部。",
    "face-hair": _0x273898 + "：将脸部和头发替换为" + referenceLabel + "中的脸部和头发。",
    feet: _0x273898 + "：将脚部替换为" + referenceLabel + "中的脚部。"
  };
  return {
    scope: _0x449ee6,
    scopeLabel: _0xce427c,
    instruction: _0x34dd9c[_0x449ee6]
  };
}
function buildGuidedReplacementLine({
  sourceLabel = "图像1中的主体",
  referenceLabel = "目标参考图",
  replacementScope: _0x59aebe
} = {}) {
  const _0x5a38f7 = normalizePersonReplacementScope(_0x59aebe);
  const _0x5176ce = {
    "full-person": "完整人物替换，脸部、五官、发型、体型和服装全部使用" + referenceLabel + "中的人物特征，不保留图像1原人物特征。",
    "visible-part": "仅替换当前可见部分。",
    clothing: "仅替换衣服。",
    "arm-hand": "仅替换手臂和手部。",
    "face-hair": "仅替换脸部和头发。",
    feet: "仅替换脚部。"
  };
  return sourceLabel + " → " + referenceLabel + "；" + _0x5176ce[_0x5a38f7];
}
export function isPersonReplacementSceneOnlyPromptPackage(_0x57dfc7 = {}) {
  const _0x3a96e1 = Array.isArray(_0x57dfc7?.mappedPersonIds) ? _0x57dfc7.mappedPersonIds : [];
  return Number(_0x57dfc7?.sceneReferenceSlot) > 0 && _0x3a96e1.length === 0;
}
export function buildPersonReplacementPromptPackage(_0x3dd25e = {}) {
  const {
    project: _0x2e87bd,
    shot: _0x2f5ae7
  } = normalizeCompilerInput(_0x3dd25e);
  const _0x530e24 = new Map(_0x2e87bd.mappings.map(_0x25a186 => [_0x25a186.sourceCharacterId, _0x25a186.targetCharacterId]));
  const _0x4704fc = new Map(_0x2e87bd.characters.map(_0xac8d58 => [_0xac8d58.id, _0xac8d58]));
  const _0x4dbb1e = _0x2f5ae7.people.filter(_0x587ca6 => !getPersonBoundingBox(_0x587ca6)).map(_0xd0ae54 => _0xd0ae54.id);
  const _0x3caa7d = _0x2f5ae7.people.filter(_0x1abbd3 => getPersonBoundingBox(_0x1abbd3)).sort(comparePeopleByPosition);
  const _0x2ee58b = PERSON_REPLACEMENT_ORIENTATION_ENABLED ? _0x3caa7d.filter(_0x5747b2 => normalizeText(_0x5747b2.orientation) === "unknown").map(_0x594465 => _0x594465.id) : [];
  const _0x121491 = [];
  const _0x1700c6 = resolvePersonReplacementImageSourceRef(_0x2f5ae7);
  if (_0x1700c6) {
    _0x121491.push({
      slot: 1,
      label: "图像1",
      ref: _0x1700c6,
      role: "source-keyframe"
    });
  }
  const _0x14e61e = new Map();
  const _0x3ed202 = [];
  const _0x1c7cdb = [];
  const _0x70496a = [];
  const _0x37b198 = [];
  const _0x2a6ba8 = [];
  const _0x1488a4 = [];
  const _0x470753 = [];
  const _0xcc246 = [];
  const _0x1baa9d = [];
  const _0x5d524d = [];
  _0x3caa7d.forEach((_0x564288, _0x401e4e) => {
    const _0x35c746 = getTargetCharacterId(_0x564288, _0x530e24);
    if (!_0x35c746) {
      _0xcc246.push(_0x564288.id);
      return;
    }
    const _0x3128e6 = _0x4704fc.get(_0x35c746);
    const _0x20f1b6 = _0x3128e6?.name || _0x35c746;
    if (!_0x3128e6) {
      _0x1baa9d.push("未找到目标角色：" + _0x35c746);
      _0xcc246.push(_0x564288.id);
      return;
    }
    const _0x3b9520 = getTargetAppearanceImageRef(_0x3128e6, _0x564288.targetAppearanceId);
    if (!_0x3b9520) {
      _0x1baa9d.push("目标角色缺少参考图：" + _0x20f1b6);
      _0xcc246.push(_0x564288.id);
      return;
    }
    const _0x2a6e54 = _0x35c746 + ":" + normalizeText(_0x564288.targetAppearanceId);
    if (!_0x14e61e.has(_0x2a6e54)) {
      if (_0x14e61e.size >= 8) {
        _0x5d524d.push(_0x564288.id);
        return;
      }
      const _0x529b29 = _0x121491.length + 1;
      const _0x7e83b5 = {
        slot: _0x529b29,
        label: "图" + _0x529b29,
        ref: _0x3b9520,
        role: "target-character",
        targetCharacterId: _0x35c746,
        targetAppearanceId: normalizeText(_0x564288.targetAppearanceId)
      };
      _0x14e61e.set(_0x2a6e54, _0x7e83b5);
      _0x121491.push(_0x7e83b5);
    }
    const _0x48a996 = _0x14e61e.get(_0x2a6e54);
    const _0xf0bb2 = formatPersonReplacementPersonLabel(_0x401e4e);
    const _0x37f94e = getPersonBoundingBox(_0x564288);
    const _0x202025 = buildReplacementScopeInstruction({
      sourceLabel: _0xf0bb2,
      referenceLabel: _0x48a996.label,
      replacementScope: _0x564288.replacementScope
    });
    _0x3ed202.push(_0xf0bb2 + " → " + _0x48a996.label + "；修改范围：" + _0x202025.scopeLabel + buildCustomPersonLabelClause(_0x564288, _0xf0bb2));
    _0x1c7cdb.push(_0x202025.instruction);
    _0x70496a.push(buildGuidedReplacementLine({
      sourceLabel: _0xf0bb2,
      referenceLabel: _0x48a996.label,
      replacementScope: _0x564288.replacementScope
    }));
    _0x37b198.push({
      person: _0x564288,
      reference: _0x48a996,
      scopeRequirement: _0x202025
    });
    _0x2a6ba8.push(buildLocationLine(_0xf0bb2, _0x37f94e));
    _0x1488a4.push({
      label: _0xf0bb2.replace("人物", ""),
      bbox: _0x37f94e
    });
    _0x470753.push(_0x564288.id);
  });
  if (_0x5d524d.length) {
    _0x1baa9d.push("单次最多替换 8 个目标人物");
  }
  let _0x319340 = 0;
  if (_0x1488a4.length >= 1) {
    const _0x32421b = buildPersonReplacementLocationGuide({
      frame: _0x2f5ae7.frame,
      people: _0x1488a4
    });
    _0x319340 = _0x121491.length + 1;
    _0x121491.push({
      slot: _0x319340,
      label: "图" + _0x319340,
      ref: _0x32421b.dataUrl,
      role: "person-location-guide"
    });
  }
  const _0x1e6c8c = resolveSceneReference(_0x2e87bd, _0x2f5ae7);
  let _0x52c8c0 = 0;
  if (_0x1e6c8c?.scene && _0x1e6c8c.imageRef) {
    _0x52c8c0 = _0x121491.length + 1;
    _0x121491.push({
      slot: _0x52c8c0,
      label: "图" + _0x52c8c0,
      ref: _0x1e6c8c.imageRef,
      role: "target-scene",
      targetSceneId: _0x1e6c8c.sceneId,
      targetSceneAppearanceId: _0x1e6c8c.appearanceId
    });
  } else if (_0x1e6c8c?.sceneId) {
    _0x1baa9d.push(_0x1e6c8c.scene ? "场景缺少参考图：" + _0x1e6c8c.scene.name : "未找到场景：" + _0x1e6c8c.sceneId);
  }
  const _0x58a2b2 = _0x52c8c0 ? "图" + _0x52c8c0 + "是场景参考图；参考这个场景的环境、建筑陈设、材质、光线和色调来重构背景，但不得引用其中的人物。" : "";
  const _0x535c1a = _0x3caa7d.length === 1 && _0x470753.length === 1 && !_0x319340 ? _0x121491.find(_0x5d938b => _0x5d938b.role === "target-character") : null;
  const _0x479a1a = _0x535c1a && _0x37b198[0] ? buildReplacementScopeInstruction({
    referenceLabel: _0x535c1a.label,
    replacementScope: _0x37b198[0].person.replacementScope
  }) : null;
  const _0x15a317 = _0x535c1a ? [_0x52c8c0 ? "图像1是待修改的原图，" + _0x535c1a.label + "是目标人物参考图，图" + _0x52c8c0 + "是目标场景参考图。" : "图像1是待修改的原图，" + _0x535c1a.label + "是目标人物参考图。", "修改范围：" + _0x479a1a.scopeLabel + "。", _0x479a1a.instruction, _0x535c1a.label + "只提供所选范围的身份与外观，不得复制其构图、动作、背景、身体可见范围或其他人物。", "保持图像1中主体的位置、动作、姿态、朝向、视线、表情、原裁切和遮挡关系不变；不得补全画外或被遮挡的身体。", _0x52c8c0 ? "保持图像1的镜头、景别和画面比例不变，仅将背景场景替换为图" + _0x52c8c0 + "中的场景；不得引用场景参考图中的人物。" : "保持图像1的背景、镜头、景别、光线、色调和画面比例不变。"].join("\n") : _0x3ed202.length ? [_0x52c8c0 ? "图像1是人物位置、构图、姿态和动作基准；图" + _0x52c8c0 + "只作为场景参考。" : "图像1是唯一的场景、构图、姿态和动作基准。", _0x58a2b2, "人物定位：\n" + _0x2a6ba8.map(_0x5aa996 => "- " + _0x5aa996).join("\n"), "对应关系：\n" + _0x3ed202.map(_0x4d1816 => "- " + _0x4d1816).join("\n"), "逐人物修改范围：\n" + _0x1c7cdb.map(_0x21cbe4 => "- " + _0x21cbe4).join("\n"), _0x319340 ? "图" + _0x319340 + "是人物定位引导图，字母框与图像1中的人物位置一一对应；框只表示人物归属，不是要填满的生成区域，禁止在结果中输出框、字母、网格或颜色标记。" : "", "通用约束：", "1. 图像1始终是人物位置、构图、姿态、动作、原裁切、可见范围和遮挡关系的唯一基准。", "2. 目标人物参考图只提供各自所选范围的身份与外观，不得复制参考图的构图、动作、背景、身体可见范围或其他人物。", "3. 只修改每个人物明确选中的范围；未选中的脸发、身体、衣服和肢体保持图像1，不得补全画外或被遮挡部分。", "4. 严格按人物字母逐一对应，不得交换人物、混合不同目标的特征，也不得新增、删除、复制或补画完整人物。", _0x52c8c0 ? "5. 保持图像1的镜头、景别、画面比例以及全部人物位置和遮挡关系不变；仅将背景场景改为参考图" + _0x52c8c0 + "中的场景。" : "5. 保持图像1的背景、镜头、景别、光线、色调和画面比例不变。"].filter(Boolean).join("\n") : _0x52c8c0 ? ["图像1是人物位置、构图、姿态和动作基准；图" + _0x52c8c0 + "只作为场景参考。", _0x58a2b2, "保持图像1中的人物、镜头和画面比例不变，仅将背景场景改为参考图" + _0x52c8c0 + "中的场景。"].join("\n") : "图像1是唯一的场景、构图、姿态和动作基准；保持背景、镜头、光线和画面比例不变。";
  const _0x37b35f = _0x535c1a && _0x37b198[0] ? buildGuidedReplacementLine({
    referenceLabel: _0x535c1a.label,
    replacementScope: _0x37b198[0].person.replacementScope
  }) : "";
  const _0x1f68e9 = _0x535c1a ? [_0x52c8c0 ? "图像1是待修改的原图，" + _0x535c1a.label + "是人物参考图，图" + _0x52c8c0 + "是场景参考图。" : "图像1是待修改的原图，" + _0x535c1a.label + "是人物参考图。", "绑定关系：" + _0x37b35f, _0x52c8c0 ? "背景场景 → 图" + _0x52c8c0 + "；使用图" + _0x52c8c0 + "中的场景。" : "", "以图像1为构图、位置和可见范围基准；在以上绑定关系和修改范围内执行用户要求。"].filter(Boolean).join("\n") : _0x70496a.length ? [_0x52c8c0 ? "图像1是待修改的原图，图" + _0x52c8c0 + "是场景参考图。" : "图像1是待修改的原图。", "人物定位：\n" + _0x2a6ba8.map(_0x485a8d => "- " + _0x485a8d).join("\n"), "绑定关系：\n" + _0x70496a.map(_0x4cc50d => "- " + _0x4cc50d).join("\n"), _0x319340 ? "图" + _0x319340 + "只用于定位人物字母；不得输出框、字母、网格或颜色标记。" : "", _0x52c8c0 ? "背景场景 → 图" + _0x52c8c0 + "；使用图" + _0x52c8c0 + "中的场景。" : "", "严格保持人物与参考图的绑定关系，不得交换或混合；以图像1为构图、位置和可见范围基准，在以上绑定关系和修改范围内执行用户要求。"].filter(Boolean).join("\n") : _0x52c8c0 ? ["图像1是待修改的原图，图" + _0x52c8c0 + "是场景参考图。", "背景场景 → 图" + _0x52c8c0 + "；使用图" + _0x52c8c0 + "中的场景。", "以图像1为构图、位置和可见范围基准，在以上绑定关系内执行用户要求。"].join("\n") : "图像1是待修改的原图；以图像1为构图、位置和可见范围基准执行用户要求。";
  const _0x5828b9 = _0x15a317;
  return {
    prompt: _0x5828b9,
    bindingPrompt: _0x15a317,
    guidedBindingPrompt: _0x1f68e9,
    referenceImages: _0x121491,
    mappedPersonIds: _0x470753,
    unmappedPersonIds: _0xcc246,
    missingLocatorPersonIds: _0x4dbb1e,
    unresolvedOrientationPersonIds: _0x2ee58b,
    overflowPersonIds: _0x5d524d,
    locationGuideSlot: _0x319340,
    sceneReferenceSlot: _0x52c8c0,
    warnings: _0x1baa9d
  };
}
export function compilePersonReplacementPrompt(_0xe52e60 = {}) {
  return buildPersonReplacementPromptPackage(_0xe52e60).prompt;
}