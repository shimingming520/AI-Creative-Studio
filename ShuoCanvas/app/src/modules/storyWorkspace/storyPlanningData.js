import { isStoryContinuousTimelinePromptMode, isStoryMinimaxH3PromptMode, isStorySeedance25PromptMode, isStoryWan30PromptMode, normalizeStoryPromptMode } from "./storyPromptModes.js";
import { buildStoryMinimaxH3Prompt } from "./storyMinimaxH3Prompt.js";
const MEDIA_FIELDS = Object.freeze(["baseAppearanceId", "voiceReference", "voiceReferenceHistory", "imageUrl", "generatedImage", "videoUrl", "resultUrl", "taskId", "task", "result", "outputs", "video", "generation", "inputs", "videoGenerationDurationSec", "canvasBinding", "canvasId"]);
export const STORY_CHARACTER_ASSET_PROMPT_PREFIX = "生成水平正视全身立绘，纯灰色背景";
function normalizeText(_0x3d92c2) {
  return String(_0x3d92c2 || "").trim();
}
function stripStoryCharacterAssetPromptPrefix(_0x41ce5f = "") {
  const _0x1d956f = normalizeText(_0x41ce5f);
  if (!_0x1d956f.startsWith(STORY_CHARACTER_ASSET_PROMPT_PREFIX)) {
    return _0x1d956f;
  }
  return _0x1d956f.slice(STORY_CHARACTER_ASSET_PROMPT_PREFIX.length).replace(/^[\s,，。；;:：|/-]+/u, "").trim();
}
function ensureStoryCharacterAssetPromptPrefix(_0x555bbf = "") {
  const _0x69bbf9 = stripStoryCharacterAssetPromptPrefix(_0x555bbf);
  if (_0x69bbf9) {
    return STORY_CHARACTER_ASSET_PROMPT_PREFIX + "\n" + _0x69bbf9;
  } else {
    return "";
  }
}
function applyStoryCharacterAssetPromptPrefix(_0x5dc251 = {}) {
  if (_0x5dc251?.kind !== "character") {
    return _0x5dc251;
  }
  const _0x352604 = Array.isArray(_0x5dc251.appearances) ? _0x5dc251.appearances.map(_0x316745 => ({
    ..._0x316745,
    prompt: ensureStoryCharacterAssetPromptPrefix(_0x316745?.prompt)
  })) : [];
  return {
    ..._0x5dc251,
    appearances: _0x352604,
    prompt: _0x352604[0]?.prompt || ensureStoryCharacterAssetPromptPrefix(_0x5dc251?.prompt)
  };
}
function removeStoryCharacterAssetPromptPrefix(_0x492517 = {}) {
  if (_0x492517?.kind !== "character") {
    return _0x492517;
  }
  return {
    ..._0x492517,
    prompt: stripStoryCharacterAssetPromptPrefix(_0x492517?.prompt),
    appearances: Array.isArray(_0x492517.appearances) ? _0x492517.appearances.map(_0x2ab18e => ({
      ..._0x2ab18e,
      prompt: stripStoryCharacterAssetPromptPrefix(_0x2ab18e?.prompt)
    })) : _0x492517.appearances
  };
}
export function normalizeStoryAssetDisplayName(_0x1748a8, _0x12af3b, _0x4ac7fe) {
  const _0x4e8fbc = _0x12af3b === "scene" ? "场景 " + (_0x4ac7fe + 1) : _0x12af3b === "prop" ? "道具 " + (_0x4ac7fe + 1) : "角色 " + (_0x4ac7fe + 1);
  const _0x3c01d7 = normalizeText(_0x1748a8).replace(/^(?:角色名|人物名|姓名|名称)\s*[:：]\s*/u, "").replace(/^[“”"'‘’]+|[“”"'‘’]+$/gu, "");
  const _0x4069b9 = _0x3c01d7.split(/[，,。；;\n]/u)[0]?.trim() || "";
  if (!_0x4069b9) {
    return _0x4e8fbc;
  }
  const _0x57ee14 = _0x12af3b === "character" ? 12 : 20;
  return [..._0x4069b9].slice(0, _0x57ee14).join("");
}
export function normalizeStoryCharacterRole(_0x413182, _0x4bd650 = "") {
  const _0x2a26d3 = normalizeText(_0x413182);
  const _0x44fde5 = normalizeText(_0x4bd650);
  if (/反派|敌对|反面人物|幕后黑手|宿敌|仇敌|反派首领/u.test(_0x2a26d3)) {
    return "反派";
  }
  if (/主角|男主|女主|主人公/u.test(_0x2a26d3)) {
    return "主角";
  }
  if (/^(?:路人|群众|群演|背景人物|无名角色)(?:$|[甲乙丙丁\d\s，,：:])/u.test(_0x2a26d3)) {
    return "路人";
  }
  if (/^(?:路人|群众|群演|背景人物|无名角色)(?:$|[甲乙丙丁\d\s])/u.test(_0x44fde5) || /^(?:追兵|守卫|弟子)[甲乙丙丁\d]+$/u.test(_0x44fde5)) {
    return "路人";
  }
  if (/反派|敌对|反面人物|幕后黑手|宿敌|仇敌/u.test(_0x44fde5)) {
    return "反派";
  }
  return "配角";
}
export function ensureStoryVisualStylePrefix(_0x59df3b, _0x4d3ac4 = "") {
  const _0x3001e7 = normalizeText(_0x59df3b);
  const _0x400f0f = normalizeText(_0x4d3ac4);
  if (!_0x400f0f) {
    return _0x3001e7;
  }
  if (!_0x3001e7 || _0x3001e7.startsWith(_0x400f0f)) {
    return _0x3001e7 || _0x400f0f;
  }
  return _0x400f0f + "\n" + _0x3001e7;
}
function replaceStoryVisualStylePrefix(_0x3b89b9, {
  previousStyle = "",
  visualStyle = ""
} = {}) {
  const _0x1ca20b = normalizeText(previousStyle);
  let _0x35b4a4 = normalizeText(_0x3b89b9);
  if (_0x1ca20b && _0x35b4a4.startsWith(_0x1ca20b)) {
    _0x35b4a4 = _0x35b4a4.slice(_0x1ca20b.length).replace(/^[\s,，。；;:：|/-]+/, "").trim();
  }
  return ensureStoryVisualStylePrefix(_0x35b4a4, visualStyle);
}
function normalizeTextArray(_0x313dd9) {
  if (Array.isArray(_0x313dd9)) {
    return [...new Set(_0x313dd9.map(normalizeText).filter(Boolean))];
  } else {
    return [];
  }
}
function normalizePositiveNumber(_0x48698d) {
  const _0x375192 = Number(_0x48698d);
  if (Number.isFinite(_0x375192) && _0x375192 > 0) {
    return _0x375192;
  } else {
    return 0;
  }
}
export function normalizeDurationSeconds(_0x62ae25) {
  const _0x3bc9f6 = normalizePositiveNumber(_0x62ae25);
  if (_0x3bc9f6) {
    return _0x3bc9f6;
  }
  const _0x4ec502 = Number.parseFloat(normalizeText(_0x62ae25));
  if (Number.isFinite(_0x4ec502) && _0x4ec502 > 0) {
    return _0x4ec502;
  } else {
    return 0;
  }
}
function stableHash(_0x5d0ef5) {
  const _0x3d6539 = String(_0x5d0ef5 || "");
  let _0x92af83 = 2166136261;
  for (let _0xa34961 = 0; _0xa34961 < _0x3d6539.length; _0xa34961 += 1) {
    _0x92af83 ^= _0x3d6539.charCodeAt(_0xa34961);
    _0x92af83 = Math.imul(_0x92af83, 16777619);
  }
  return (_0x92af83 >>> 0).toString(36);
}
function normalizeIdPart(_0x5f2cde) {
  return normalizeText(_0x5f2cde).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40);
}
export function createStableStoryPlanningId(_0x197b12, ..._0x1c90d4) {
  const _0x18c97d = normalizeIdPart(_0x197b12) || "story";
  const _0x313104 = _0x1c90d4.map(normalizeText).filter(Boolean).join("|") || _0x18c97d;
  const _0x20e445 = normalizeIdPart(_0x1c90d4.find(_0xf01ae6 => normalizeIdPart(_0xf01ae6)) || "");
  return [_0x18c97d, _0x20e445, stableHash(_0x313104)].filter(Boolean).join("-");
}
export function formatStoryClockDuration(_0x16e48b) {
  const _0x15e3a7 = Math.max(0, Math.round(Number(_0x16e48b) || 0));
  const _0x4d1717 = Math.floor(_0x15e3a7 / 3600);
  const _0x2cf836 = Math.floor(_0x15e3a7 % 3600 / 60);
  const _0x203b32 = _0x15e3a7 % 60;
  const _0x50ee68 = String(_0x2cf836).padStart(2, "0");
  const _0x4f70db = String(_0x203b32).padStart(2, "0");
  if (_0x4d1717 > 0) {
    return String(_0x4d1717).padStart(2, "0") + ":" + _0x50ee68 + ":" + _0x4f70db;
  } else {
    return _0x50ee68 + ":" + _0x4f70db;
  }
}
export function formatStoryClipDuration(_0x4dcf9c) {
  const _0x423eb9 = Math.max(0, Number(_0x4dcf9c) || 0);
  return _0x423eb9.toFixed(1) + "s";
}
function formatGeneratedStoryClipTitle(_0xe301a4 = 0) {
  return "片段" + String(_0xe301a4 + 1).padStart(2, "0");
}
function normalizeStoryAssetUsages(_0x47da5a, _0x39f135 = []) {
  const _0xff80a5 = Array.isArray(_0x47da5a) ? _0x47da5a : normalizeTextArray(_0x39f135).map(_0x5b8d92 => ({
    assetRef: _0x5b8d92
  }));
  const _0x1e9969 = new Set();
  const _0x1e05af = [];
  _0xff80a5.forEach(_0x2ccf07 => {
    if (!_0x2ccf07 || typeof _0x2ccf07 !== "object" || Array.isArray(_0x2ccf07)) {
      return;
    }
    const _0x53536f = normalizeText(_0x2ccf07.assetRef);
    const _0x3cc83d = normalizeText(_0x2ccf07.appearanceRef);
    if (!_0x53536f) {
      return;
    }
    const _0x302e75 = _0x53536f + "\0" + _0x3cc83d;
    if (_0x1e9969.has(_0x302e75)) {
      return;
    }
    _0x1e9969.add(_0x302e75);
    _0x1e05af.push({
      assetRef: _0x53536f,
      appearanceRef: _0x3cc83d
    });
  });
  return _0x1e05af;
}
function deriveStoryAssetRefs(_0x1541a9 = []) {
  return normalizeTextArray(_0x1541a9.map(_0x27ff78 => _0x27ff78?.assetRef));
}
function normalizeStoryEpisodeShot(_0x3eff42 = {}) {
  const _0xbf1345 = normalizeStoryAssetUsages(_0x3eff42?.assetUsages, _0x3eff42?.assetRefs);
  return {
    durationSec: normalizeDurationSeconds(_0x3eff42?.durationSec || _0x3eff42?.durationSeconds),
    ...(Object.prototype.hasOwnProperty.call(_0x3eff42, "startSec") ? {
      startSec: Number(_0x3eff42.startSec)
    } : {}),
    ...(Object.prototype.hasOwnProperty.call(_0x3eff42, "endSec") ? {
      endSec: Number(_0x3eff42.endSec)
    } : {}),
    time: normalizeText(_0x3eff42?.time),
    assetUsages: _0xbf1345,
    assetRefs: deriveStoryAssetRefs(_0xbf1345),
    visual: normalizeText(_0x3eff42?.visual),
    camera: normalizeText(_0x3eff42?.camera),
    transitionFromPrevious: normalizeText(_0x3eff42?.transitionFromPrevious),
    dialogue: normalizeText(_0x3eff42?.dialogue),
    voiceover: normalizeText(_0x3eff42?.voiceover),
    audio: normalizeText(_0x3eff42?.audio)
  };
}
function normalizeStoryMinimaxH3ClipShots(_0x16297d = [], _0x4213e2 = "") {
  if (!isStoryMinimaxH3PromptMode(_0x4213e2) || !_0x16297d.length) {
    return _0x16297d;
  }
  const _0x236a13 = Number(_0x16297d.reduce((_0x52b87f, _0x34bb06) => _0x52b87f + _0x34bb06.durationSec, 0).toFixed(3));
  if (_0x236a13 <= 0 || _0x236a13 > 15 || Number.isInteger(_0x236a13) && _0x236a13 >= 4) {
    return _0x16297d;
  }
  const _0x3b1065 = Math.max(4, Math.ceil(_0x236a13));
  if (_0x3b1065 > 15) {
    return _0x16297d;
  }
  const _0x17457d = _0x16297d.length - 1;
  const _0x4808de = _0x16297d.slice(0, _0x17457d).reduce((_0x3e6365, _0x12126a) => _0x3e6365 + _0x12126a.durationSec, 0);
  return _0x16297d.map((_0x2474e0, _0x5a6385) => _0x5a6385 === _0x17457d ? {
    ..._0x2474e0,
    durationSec: Number((_0x3b1065 - _0x4808de).toFixed(3))
  } : _0x2474e0);
}
function ensurePromptSentence(_0x12be68) {
  const _0x1c0b8e = normalizeText(_0x12be68);
  if (!_0x1c0b8e || /[。！？!?；;：:]$/u.test(_0x1c0b8e)) {
    return _0x1c0b8e;
  }
  return _0x1c0b8e + "。";
}
function addStrictLookupEntry(_0x46fb19, _0x3062d5, _0xc6a94c) {
  const _0x35d4af = normalizeText(_0x3062d5);
  if (!_0x35d4af) {
    return;
  }
  if (_0x46fb19.has(_0x35d4af) && _0x46fb19.get(_0x35d4af) !== _0xc6a94c) {
    _0x46fb19.set(_0x35d4af, null);
    return;
  }
  _0x46fb19.set(_0x35d4af, _0xc6a94c);
}
function buildStoryAssetUsageLookup(_0x3dae9a = []) {
  const _0x1c6344 = new Map();
  (Array.isArray(_0x3dae9a) ? _0x3dae9a : []).forEach(_0x295d56 => {
    addStrictLookupEntry(_0x1c6344, getPlanningRef(_0x295d56), _0x295d56);
    addStrictLookupEntry(_0x1c6344, _0x295d56?.id, _0x295d56);
  });
  return _0x1c6344;
}
function resolveStoryAssetUsage(_0x51fcf2, _0x142593) {
  const _0x33d9a2 = normalizeText(_0x51fcf2?.assetRef);
  const _0x26574c = normalizeText(_0x51fcf2?.appearanceRef);
  const _0x27c505 = _0x142593.get(_0x33d9a2) || null;
  if (!_0x27c505) {
    return {
      assetRef: _0x33d9a2,
      appearanceRef: _0x26574c,
      asset: null,
      appearance: null
    };
  }
  const _0x30d088 = Array.isArray(_0x27c505?.appearances) ? _0x27c505.appearances : [];
  const _0x36b71b = new Map();
  _0x30d088.forEach(_0x46e2f9 => {
    addStrictLookupEntry(_0x36b71b, getPlanningRef(_0x46e2f9), _0x46e2f9);
    addStrictLookupEntry(_0x36b71b, _0x46e2f9?.id, _0x46e2f9);
  });
  const _0x595dcf = _0x26574c || normalizeText(_0x27c505?.baseAppearanceId);
  const _0x40098 = _0x595dcf ? _0x36b71b.get(_0x595dcf) || null : _0x30d088[0] || null;
  return {
    assetRef: _0x33d9a2,
    appearanceRef: _0x595dcf,
    asset: _0x27c505,
    appearance: _0x40098
  };
}
function buildStoryShotAssetReferenceText(_0x4af742 = [], _0x22b616 = [], {
  kinds = ["scene", "character", "prop", "unknown"],
  mentionKinds = kinds
} = {}) {
  const _0xa05b8d = buildStoryAssetUsageLookup(_0x22b616);
  const _0x18d8f7 = new Set(kinds);
  const _0xb7ffaa = new Set(mentionKinds);
  const _0x4b2f8e = {
    scene: [],
    character: [],
    prop: [],
    unknown: []
  };
  const _0xd2ae5 = [];
  normalizeStoryAssetUsages(_0x4af742).forEach(_0x503214 => {
    const {
      assetRef: _0x53da3c,
      appearanceRef: _0x4248b1,
      asset: _0x326de4,
      appearance: _0x4ffcc0
    } = resolveStoryAssetUsage(_0x503214, _0xa05b8d);
    if (!_0x326de4) {
      if (_0x18d8f7.has("unknown") && _0x53da3c && !_0x4b2f8e.unknown.includes(_0x53da3c)) {
        _0x4b2f8e.unknown.push(_0x53da3c);
      }
      return;
    }
    const _0x556d3b = normalizeText(_0x326de4?.name) || _0x53da3c;
    const _0x47cf39 = ["scene", "character", "prop"].includes(_0x326de4?.kind) ? _0x326de4.kind : "unknown";
    if (!_0x18d8f7.has(_0x47cf39)) {
      return;
    }
    if (_0x4248b1 && !_0x4ffcc0) {
      const _0x2a15a8 = _0x556d3b + " · " + _0x4248b1;
      if (!_0xd2ae5.includes(_0x2a15a8)) {
        _0xd2ae5.push(_0x2a15a8);
      }
      return;
    }
    if (!_0xb7ffaa.has(_0x47cf39)) {
      return;
    }
    const _0x45ec70 = normalizeText(_0x4ffcc0?.name);
    const _0x289613 = "@" + _0x556d3b + (_0x45ec70 ? " · " + _0x45ec70 : "");
    if (!_0x4b2f8e[_0x47cf39].includes(_0x289613)) {
      _0x4b2f8e[_0x47cf39].push(_0x289613);
    }
  });
  return [_0x4b2f8e.scene.length ? "场景图片：" + _0x4b2f8e.scene.join("、") : "", _0x4b2f8e.character.length ? "人物形象：" + _0x4b2f8e.character.join("、") : "", _0x4b2f8e.prop.length ? "道具参考：" + _0x4b2f8e.prop.join("、") : "", _0xd2ae5.length ? "未解析形象：" + _0xd2ae5.join("、") : "", _0x4b2f8e.unknown.length ? "未解析素材：" + _0x4b2f8e.unknown.join("、") : ""].filter(Boolean).map(ensurePromptSentence).join(" ");
}
const STORY_SUBJECT_FEATURE_NOISE_PATTERN = /(?:角色设定|人物设定|设定图|全身立绘|半身立绘|角色立绘|纯色背景|灰色背景|白色背景|画幅|镜头|构图|景深|光线|光影|色调|风格|写实|电影|高清|画质|分辨率|4k|8k|16\s*[:：]\s*9|9\s*[:：]\s*16|24fps|单人角色|独立人物|正视立绘|侧视立绘|标准站姿)/iu;
const STORY_SCENE_TIME_PATTERN = /(?:深夜|夜晚|夜间|午夜|清晨|黎明|早晨|上午|中午|午后|下午|黄昏|傍晚|日间|白日|白天)/u;
function stripStoryPromptPrefix(_0x174347 = "", _0x10fe3d = "") {
  const _0x222af5 = normalizeText(_0x174347);
  const _0x178d07 = normalizeText(_0x10fe3d);
  if (!_0x178d07 || !_0x222af5.startsWith(_0x178d07)) {
    return _0x222af5;
  }
  return _0x222af5.slice(_0x178d07.length).replace(/^[\s,，。；;:：|/-]+/u, "").trim();
}
function getStoryCharacterSubjectFeatures(_0x5a8e14, _0x36ece8, _0x56eb70 = "") {
  const _0x50900f = [_0x36ece8?.prompt, _0x36ece8?.description, _0x5a8e14?.prompt, _0x5a8e14?.description];
  for (const _0x62f82c of _0x50900f) {
    const _0x207413 = stripStoryPromptPrefix(stripStoryCharacterAssetPromptPrefix(_0x62f82c), _0x56eb70);
    const _0x3515cf = [...new Set(_0x207413.split(/[，,。；;\n]+/u).map(normalizeText).filter(_0x1d6661 => _0x1d6661 && !STORY_SUBJECT_FEATURE_NOISE_PATTERN.test(_0x1d6661)))].slice(0, 3);
    if (_0x3515cf.length) {
      return _0x3515cf;
    }
  }
  return [];
}
function buildStoryClipCharacterSubjectDefinitions(_0x5ca5ea = [], _0x44dc42 = [], _0x46d64c = "") {
  const _0x5b4ebc = buildStoryAssetUsageLookup(_0x44dc42);
  const _0x5be4ba = new Set();
  const _0x9c36df = [];
  const _0x2a8874 = [];
  normalizeStoryAssetUsages((Array.isArray(_0x5ca5ea) ? _0x5ca5ea : []).flatMap(_0x4a98cb => _0x4a98cb?.assetUsages || [])).forEach(_0x17cdf5 => {
    const {
      assetRef: _0xbfca77,
      appearanceRef: _0x35ba55,
      asset: _0x5b2531,
      appearance: _0x23069d
    } = resolveStoryAssetUsage(_0x17cdf5, _0x5b4ebc);
    if (_0x5b2531?.kind !== "character") {
      return;
    }
    if (_0x5be4ba.has(_0xbfca77)) {
      return;
    }
    _0x5be4ba.add(_0xbfca77);
    const _0x224236 = normalizeText(_0x5b2531?.name) || _0xbfca77;
    if (!_0x224236) {
      return;
    }
    if (_0x35ba55 && !_0x23069d) {
      _0x2a8874.push(_0x224236 + " · " + _0x35ba55);
      return;
    }
    const _0x1e0d99 = normalizeText(_0x23069d?.name);
    const _0x5c92b1 = "@" + _0x224236 + (_0x1e0d99 ? " · " + _0x1e0d99 : "");
    const _0x4d66cb = getStoryCharacterSubjectFeatures(_0x5b2531, _0x23069d, _0x46d64c);
    _0x9c36df.push(_0x4d66cb.length ? "将<" + _0x5c92b1 + ">中的" + _0x4d66cb.join("、") + "定义为<" + _0x224236 + ">。" : "将<" + _0x5c92b1 + ">定义为<" + _0x224236 + ">。");
  });
  return [..._0x9c36df, _0x2a8874.length ? "未解析形象：" + _0x2a8874.join("、") + "。" : ""].filter(Boolean).join("\n");
}
function extractStorySceneTimeLabel(_0x1c8d2e = "") {
  return normalizeText(_0x1c8d2e).match(STORY_SCENE_TIME_PATTERN)?.[0] || "";
}
function resolveStoryClipSceneTimeLabel(_0x3357c9 = [], _0x45ba5f = []) {
  const _0x36be4b = buildStoryAssetUsageLookup(_0x45ba5f);
  const _0x15588b = normalizeStoryAssetUsages((Array.isArray(_0x3357c9) ? _0x3357c9 : []).flatMap(_0x5d45cd => _0x5d45cd?.assetUsages || []));
  for (const _0x9cb89c of _0x15588b) {
    const {
      asset: _0x42315c,
      appearance: _0x24483d
    } = resolveStoryAssetUsage(_0x9cb89c, _0x36be4b);
    if (_0x42315c?.kind !== "scene") {
      continue;
    }
    const _0x51faf5 = [_0x24483d?.name, _0x24483d?.description, _0x24483d?.prompt, _0x42315c?.name, _0x42315c?.description, _0x42315c?.prompt];
    for (const _0x49ce9e of _0x51faf5) {
      const _0x542e56 = extractStorySceneTimeLabel(_0x49ce9e);
      if (_0x542e56) {
        return _0x542e56;
      }
    }
  }
  return "";
}
function stripStoryDialogueOuterQuotes(_0x420908 = "") {
  let _0x5c0474 = normalizeText(_0x420908);
  const _0x14389b = [["“", "”"], ["\"", "\""]];
  _0x14389b.forEach(([_0x2bd5ad, _0x239a33]) => {
    if (_0x5c0474.startsWith(_0x2bd5ad) && _0x5c0474.endsWith(_0x239a33)) {
      _0x5c0474 = _0x5c0474.slice(_0x2bd5ad.length, -_0x239a33.length).trim();
    }
  });
  return _0x5c0474;
}
function getStoryDialogueSpeakerLabels(_0x590310 = "") {
  const _0x547393 = normalizeText(_0x590310);
  if (!_0x547393) {
    return [];
  }
  const _0x587962 = /(^|[\n。！？!?；;][”"]?)\s*([^：:\n。！？!?；;“”"]{1,24})[：:]\s*/gu;
  const _0x515d21 = [..._0x547393.matchAll(_0x587962)];
  if (!_0x515d21.length || normalizeText(_0x547393.slice(0, _0x515d21[0].index))) {
    return [];
  }
  return _0x515d21.map(_0x57b4c9 => normalizeText(_0x57b4c9[2])).filter(Boolean);
}
function resolveStoryDialogueSpeakerCandidate(_0x5d9abd = "", _0x24fafd = [], _0x35eba8 = []) {
  const _0x3e69c0 = normalizeText(_0x5d9abd);
  if (!_0x3e69c0) {
    return null;
  }
  const _0x59bcd1 = buildStoryAssetUsageLookup(_0x35eba8);
  const _0x14efc1 = normalizeStoryAssetUsages(_0x24fafd).map(_0x683d3 => {
    const _0x2546c8 = resolveStoryAssetUsage(_0x683d3, _0x59bcd1);
    const _0x120720 = normalizeText(_0x2546c8.asset?.name);
    if (_0x2546c8.asset?.kind !== "character" || !_0x120720) {
      return null;
    }
    let _0x257fc1 = 0;
    let _0x265542 = "";
    if (_0x3e69c0 === _0x120720) {
      _0x257fc1 = 3;
    } else if (_0x3e69c0.startsWith(_0x120720)) {
      _0x257fc1 = 2;
      _0x265542 = _0x3e69c0.slice(_0x120720.length);
    } else if (_0x3e69c0.length >= 2 && _0x120720.endsWith(_0x3e69c0)) {
      _0x257fc1 = 1;
    }
    if (_0x257fc1) {
      return {
        ..._0x2546c8,
        assetName: _0x120720,
        score: _0x257fc1,
        suffix: _0x265542
      };
    } else {
      return null;
    }
  }).filter(Boolean).sort((_0x1a4855, _0x4a28c0) => _0x4a28c0.score - _0x1a4855.score);
  if (!_0x14efc1.length || _0x14efc1[1] && _0x14efc1[1].score === _0x14efc1[0].score) {
    return null;
  }
  return _0x14efc1[0];
}
function resolveStoryDialogueSpeakerMention(_0x110218 = "", _0x81b4b7 = [], _0x5d1105 = []) {
  const _0x36c84c = normalizeText(_0x110218);
  if (!_0x36c84c) {
    return "";
  }
  const _0x33be94 = resolveStoryDialogueSpeakerCandidate(_0x36c84c, _0x81b4b7, _0x5d1105);
  if (!_0x33be94) {
    return _0x36c84c;
  }
  const _0x5cf57c = normalizeText(_0x33be94.appearance?.name);
  const _0x416b91 = "@" + _0x33be94.assetName + (_0x5cf57c ? " · " + _0x5cf57c : "");
  return "" + _0x416b91 + _0x33be94.suffix;
}
function formatStoryClipDialogue(_0x2c5a76 = "", {
  assetUsages = [],
  assets = []
} = {}) {
  const _0x488726 = normalizeText(_0x2c5a76);
  if (!_0x488726) {
    return "";
  }
  const _0x12912f = /(^|[\n。！？!?；;][”"]?)\s*([^：:\n。！？!?；;“”"]{1,24})[：:]\s*/gu;
  const _0x42e560 = [..._0x488726.matchAll(_0x12912f)];
  if (!_0x42e560.length || normalizeText(_0x488726.slice(0, _0x42e560[0].index))) {
    return "“" + stripStoryDialogueOuterQuotes(_0x488726) + "”";
  }
  return _0x42e560.map((_0x4f8199, _0x9e4272) => {
    const _0x2c3a60 = _0x42e560[_0x9e4272 + 1];
    const _0x524434 = Number(_0x4f8199.index || 0) + _0x4f8199[0].length;
    const _0x1fbc9a = _0x2c3a60 ? Number(_0x2c3a60.index || 0) + String(_0x2c3a60[1] || "").length : _0x488726.length;
    const _0x34ca7f = resolveStoryDialogueSpeakerMention(_0x4f8199[2], assetUsages, assets);
    const _0x499fc9 = stripStoryDialogueOuterQuotes(_0x488726.slice(_0x524434, _0x1fbc9a));
    return _0x34ca7f + "：“" + _0x499fc9 + "”";
  }).filter(Boolean).join("\n");
}
export function getStoryClipDialogueSpeakerAssetIds(_0x19fd57 = {}, _0x73ea33 = []) {
  const _0x326b3b = [];
  const _0x19c5d6 = new Set();
  const _0x5dfa59 = Array.isArray(_0x19fd57?.shots) ? _0x19fd57.shots.map(normalizeStoryEpisodeShot) : [];
  _0x5dfa59.forEach(_0x16b335 => {
    getStoryDialogueSpeakerLabels(_0x16b335.dialogue).forEach(_0xa42b9c => {
      const _0x586435 = resolveStoryDialogueSpeakerCandidate(_0xa42b9c, _0x16b335.assetUsages, _0x73ea33);
      const _0x52f72c = normalizeText(_0x586435?.asset?.id);
      if (!_0x52f72c || _0x19c5d6.has(_0x52f72c)) {
        return;
      }
      _0x19c5d6.add(_0x52f72c);
      _0x326b3b.push(_0x52f72c);
    });
  });
  return _0x326b3b;
}
function normalizeStoryDialogueVoiceDescription(_0x49418f = "") {
  return [...normalizeText(_0x49418f).replace(/\s+/gu, " ")].slice(0, 600).join("");
}
function buildStoryClipDialogueVoiceGuidanceLines(_0x258e64 = {}, _0x35ce1a = []) {
  const _0x53b7c6 = [];
  const _0x32ff85 = new Set();
  getStoryDialogueSpeakerLabels(_0x258e64.dialogue).forEach(_0x89a0f4 => {
    const _0x111dab = resolveStoryDialogueSpeakerCandidate(_0x89a0f4, _0x258e64.assetUsages, _0x35ce1a);
    const _0x573406 = normalizeText(_0x111dab?.assetName) || _0x89a0f4;
    const _0x4e1bbf = normalizeText(_0x111dab?.asset?.id) || _0x573406;
    if (!_0x573406 || _0x32ff85.has(_0x4e1bbf)) {
      return;
    }
    _0x32ff85.add(_0x4e1bbf);
    _0x53b7c6.push({
      name: _0x573406,
      asset: _0x111dab?.asset || null
    });
  });
  if (!_0x53b7c6.length) {
    return [];
  }
  const _0x34825a = buildStoryAssetUsageLookup(_0x35ce1a);
  const _0x54a66d = [];
  const _0x1e3752 = new Set();
  normalizeStoryAssetUsages(_0x258e64.assetUsages).forEach(_0x13b115 => {
    const {
      asset: _0x3035ad
    } = resolveStoryAssetUsage(_0x13b115, _0x34825a);
    const _0x42cf19 = normalizeText(_0x3035ad?.id);
    const _0x537bf1 = normalizeText(_0x3035ad?.name);
    const _0x2d4b80 = _0x42cf19 || _0x537bf1;
    if (_0x3035ad?.kind !== "character" || !_0x537bf1 || _0x1e3752.has(_0x2d4b80)) {
      return;
    }
    _0x1e3752.add(_0x2d4b80);
    _0x54a66d.push({
      key: _0x2d4b80,
      name: _0x537bf1
    });
  });
  const _0x4458e6 = new Set(_0x53b7c6.map(({
    asset: _0x38d76e,
    name: _0x3d89e2
  }) => normalizeText(_0x38d76e?.id) || _0x3d89e2));
  const _0x1fa5a5 = _0x54a66d.filter(({
    key: _0x584e62
  }) => !_0x4458e6.has(_0x584e62)).map(({
    name: _0x410b2f
  }) => _0x410b2f);
  const _0x1e413d = _0x53b7c6.flatMap(({
    name: _0x340c22,
    asset: _0x4f48cb
  }) => {
    const _0x13c83f = normalizeStoryDialogueVoiceDescription(_0x4f48cb?.voiceDescription);
    if (_0x13c83f) {
      return ["声音设定（" + _0x340c22 + "）：" + ensurePromptSentence(_0x13c83f)];
    } else {
      return [];
    }
  });
  const _0x1d04f4 = _0x53b7c6.length === 1 ? "发声与口型约束：本分镜仅" + _0x53b7c6[0].name + "发声并同步口型；" + (_0x1fa5a5.length ? _0x1fa5a5.join("、") + "及" : "") + "其他画面角色保持静默，不张嘴、不做说话口型。" : "发声与口型约束：本分镜对白按标注顺序轮流发声；每句仅当前标注的说话人发声并同步口型；其余角色保持静默，不张嘴、不做说话口型。";
  return [..._0x1e413d, _0x1d04f4];
}
function buildStoryClipDialoguePromptBlock(_0x48ba07 = "", {
  assetUsages = [],
  assets = [],
  includeDialogueVoiceGuidance = false
} = {}) {
  const _0xbd77be = formatStoryClipDialogue(_0x48ba07, includeDialogueVoiceGuidance ? {
    assetUsages: assetUsages,
    assets: assets
  } : {});
  if (!_0xbd77be) {
    return "";
  }
  const _0x191dac = [];
  if (includeDialogueVoiceGuidance) {
    _0x191dac.push(...buildStoryClipDialogueVoiceGuidanceLines({
      dialogue: _0x48ba07,
      assetUsages: assetUsages
    }, assets));
  }
  _0x191dac.push("对白：" + _0xbd77be);
  return _0x191dac.join("\n");
}
export function applyStoryClipDialogueVoiceGuidance(_0x3546b9 = "", _0x22de39 = {}, _0x12d243 = []) {
  const _0x37c960 = String(_0x3546b9 || "");
  if (!_0x37c960 || !Array.isArray(_0x22de39?.shots)) {
    return _0x37c960;
  }
  const _0xd562ed = _0x37c960.split("\n").filter(_0x2c5c17 => !/^(?:声音设定（.+?）|发声与口型约束)：/u.test(_0x2c5c17.trim())).join("\n");
  const _0x4dd4c7 = _0x22de39.shots.map(normalizeStoryEpisodeShot).flatMap(_0x16e4c1 => {
    if (!normalizeText(_0x16e4c1.dialogue)) {
      return [];
    }
    const _0x724d6c = buildStoryClipDialogueVoiceGuidanceLines(_0x16e4c1, _0x12d243);
    if (_0x724d6c.length) {
      return [_0x724d6c];
    } else {
      return [];
    }
  });
  const _0x5eabd0 = _0xd562ed.split("\n");
  const _0x202c82 = _0x5eabd0.filter(_0x5a6545 => /^\s*对白：/u.test(_0x5a6545)).length;
  if (_0x202c82 !== _0x4dd4c7.length) {
    return _0x37c960;
  }
  let _0x2b373e = 0;
  return _0x5eabd0.flatMap(_0xb84d0f => {
    if (!/^\s*对白：/u.test(_0xb84d0f)) {
      return [_0xb84d0f];
    }
    const _0x554d93 = _0x4dd4c7[_0x2b373e];
    _0x2b373e += 1;
    return [..._0x554d93, _0xb84d0f];
  }).join("\n");
}
export function syncStoryEpisodeClipDialogueMentions(_0x462ffc = {}, _0x544e67 = [], {
  includeDialogueVoiceGuidance = false
} = {}) {
  const _0x539fd0 = String(_0x462ffc?.prompt || "");
  if (!_0x539fd0 || !Array.isArray(_0x462ffc?.shots)) {
    return _0x462ffc;
  }
  let _0x271b1d = _0x539fd0;
  const _0x3dc301 = _0x462ffc.shots.map(normalizeStoryEpisodeShot);
  _0x3dc301.forEach(_0x35fb5a => {
    const _0x16ca0f = normalizeText(_0x35fb5a.dialogue);
    if (!_0x16ca0f) {
      return;
    }
    const _0x1cfe6e = formatStoryClipDialogue(_0x16ca0f);
    const _0x96bcad = formatStoryClipDialogue(_0x16ca0f, {
      assetUsages: _0x35fb5a.assetUsages,
      assets: _0x544e67
    });
    if (!_0x1cfe6e) {
      return;
    }
    const _0x2190d5 = "对白：" + _0x1cfe6e;
    const _0x44001f = "对白：" + _0x96bcad;
    if (_0x271b1d.includes(_0x44001f)) {
      return;
    } else if (_0x271b1d.includes(_0x2190d5)) {
      _0x271b1d = _0x271b1d.replace(_0x2190d5, _0x44001f);
    }
  });
  if (includeDialogueVoiceGuidance) {
    _0x271b1d = applyStoryClipDialogueVoiceGuidance(_0x271b1d, _0x462ffc, _0x544e67);
  }
  if (_0x271b1d === _0x539fd0) {
    return _0x462ffc;
  } else {
    return {
      ..._0x462ffc,
      prompt: _0x271b1d
    };
  }
}
function buildStoryClipSceneSettingText(_0x36085c = [], _0x535c9a = []) {
  const _0xde444e = resolveStoryClipSceneTimeLabel(_0x36085c, _0x535c9a);
  const _0x516506 = buildStoryShotAssetReferenceText(_0x36085c.flatMap(_0x1d3e23 => _0x1d3e23?.assetUsages || []), _0x535c9a, {
    kinds: ["scene"]
  }).replace(/^场景图片：/u, "");
  const _0x3c705a = [_0x516506, _0xde444e ? ensurePromptSentence("时间：" + _0xde444e) : ""].filter(Boolean).join(" ");
  if (_0x516506) {
    return "本片段场景设定在：" + _0x3c705a;
  } else {
    return "";
  }
}
function buildStoryClipPropSettingText(_0x275647 = [], _0x1d48c4 = []) {
  const _0xdaec8c = buildStoryShotAssetReferenceText(_0x275647.flatMap(_0x40a841 => _0x40a841?.assetUsages || []), _0x1d48c4, {
    kinds: ["prop", "unknown"]
  });
  if (_0xdaec8c) {
    return "本片段道具设定：" + _0xdaec8c;
  } else {
    return "";
  }
}
function buildStoryClipSeedance25ReferenceBindings(_0xa2841e = [], _0x336b2f = []) {
  const _0x4665aa = buildStoryAssetUsageLookup(_0x336b2f);
  const _0x38447b = [];
  const _0x374634 = [];
  normalizeStoryAssetUsages((Array.isArray(_0xa2841e) ? _0xa2841e : []).flatMap(_0x14fb04 => _0x14fb04?.assetUsages || [])).forEach(_0x284a78 => {
    const {
      assetRef: _0x43f12d,
      appearanceRef: _0x249311,
      asset: _0x1c1607,
      appearance: _0x2b81ea
    } = resolveStoryAssetUsage(_0x284a78, _0x4665aa);
    if (!_0x1c1607) {
      if (_0x43f12d) {
        _0x374634.push(_0x43f12d);
      }
      return;
    }
    const _0x1f1663 = normalizeText(_0x1c1607?.name) || _0x43f12d;
    if (!_0x1f1663) {
      return;
    }
    if (_0x249311 && !_0x2b81ea) {
      _0x374634.push(_0x1f1663 + " · " + _0x249311);
      return;
    }
    const _0x49917f = normalizeText(_0x2b81ea?.name);
    const _0x3cf8ae = "@" + _0x1f1663 + (_0x49917f ? " · " + _0x49917f : "");
    if (_0x1c1607?.kind === "character") {
      _0x38447b.push(_0x3cf8ae + "：定义为" + _0x1f1663 + "，仅参考身份、五官、发型、体型与服装；不采用图中背景、表情、动作或构图。");
    } else if (_0x1c1607?.kind === "scene") {
      _0x38447b.push(_0x3cf8ae + "：作为本片段场景，仅参考空间布局、材质、固定地标、出入口与光线；不采用图中人物或前景。");
    } else if (_0x1c1607?.kind === "prop") {
      _0x38447b.push(_0x3cf8ae + "：作为本片段道具，仅参考外观、结构、材质与开场状态；不采用图中背景或构图。");
    }
  });
  return [_0x38447b.length ? "参考素材绑定：\n" + [...new Set(_0x38447b)].join("\n") : "", _0x374634.length ? "未解析素材：" + [...new Set(_0x374634)].join("、") + "。" : ""].filter(Boolean).join("\n");
}
function buildStoryClipWan30ReferenceBindings(_0x57e328 = [], _0x45768b = []) {
  const _0x5a82f7 = buildStoryAssetUsageLookup(_0x45768b);
  const _0x2e0253 = [];
  const _0x23500d = [];
  normalizeStoryAssetUsages((Array.isArray(_0x57e328) ? _0x57e328 : []).flatMap(_0x1fdb5a => _0x1fdb5a?.assetUsages || [])).forEach(_0x5119e9 => {
    const {
      assetRef: _0x51874b,
      appearanceRef: _0x403cbb,
      asset: _0x67ca49,
      appearance: _0x5b7c87
    } = resolveStoryAssetUsage(_0x5119e9, _0x5a82f7);
    if (!_0x67ca49) {
      if (_0x51874b) {
        _0x23500d.push(_0x51874b);
      }
      return;
    }
    const _0x41f138 = normalizeText(_0x67ca49?.name) || _0x51874b;
    if (!_0x41f138) {
      return;
    }
    if (_0x403cbb && !_0x5b7c87) {
      _0x23500d.push(_0x41f138 + " · " + _0x403cbb);
      return;
    }
    const _0x3ea1fc = normalizeText(_0x5b7c87?.name);
    const _0x350a27 = "@" + _0x41f138 + (_0x3ea1fc ? " · " + _0x3ea1fc : "");
    if (_0x67ca49?.kind === "character") {
      _0x2e0253.push(_0x350a27 + "：定义为" + _0x41f138 + "，图像锁定身份、五官、发型、体型与服装；如包含声音素材，则作为" + _0x41f138 + "的声线与说话方式参考。");
    } else if (_0x67ca49?.kind === "scene") {
      _0x2e0253.push(_0x350a27 + "：定义为本片段场景，锁定空间布局、固定地标、出入口与光线方向。");
    } else if (_0x67ca49?.kind === "prop") {
      _0x2e0253.push(_0x350a27 + "：定义为" + _0x41f138 + "，锁定外观与开场状态。");
    }
  });
  return [_0x2e0253.length ? "参考素材绑定：\n" + [...new Set(_0x2e0253)].join("\n") : "", _0x23500d.length ? "未解析素材：" + [...new Set(_0x23500d)].join("、") + "。" : ""].filter(Boolean).join("\n");
}
function replaceStoryClipBoundMentionsWithNames(_0x16697b = "", _0xb01ffd = [], _0x3c98da = []) {
  let _0x492693 = normalizeText(_0x16697b);
  if (!_0x492693) {
    return "";
  }
  const _0x4f4b95 = buildStoryAssetUsageLookup(_0x3c98da);
  const _0x14cd5e = normalizeStoryAssetUsages(_0xb01ffd).flatMap(_0x5be9ea => {
    const {
      assetRef: _0x4829f1,
      asset: _0x58c0fc,
      appearance: _0x541d23
    } = resolveStoryAssetUsage(_0x5be9ea, _0x4f4b95);
    const _0x314d2d = normalizeText(_0x58c0fc?.name) || _0x4829f1;
    if (!_0x314d2d) {
      return [];
    }
    const _0x3e3a0d = normalizeText(_0x541d23?.name);
    return [_0x3e3a0d ? "@" + _0x314d2d + " · " + _0x3e3a0d : "", "@" + _0x314d2d].filter(Boolean).map(_0x51dd8a => ({
      mention: _0x51dd8a,
      assetName: _0x314d2d
    }));
  }).sort((_0x38915c, _0x18c312) => _0x18c312.mention.length - _0x38915c.mention.length);
  _0x14cd5e.forEach(({
    mention: _0x599b34,
    assetName: _0x26dd08
  }) => {
    _0x492693 = _0x492693.split(_0x599b34).join(_0x26dd08);
  });
  return _0x492693;
}
function formatStoryContinuousTimelineRange(_0x4ba106 = {}, _0xef93e1 = 0, _0x335615 = 0, _0x4da71b = "视频模型") {
  const _0x2d7471 = Number(_0x4ba106?.startSec);
  const _0x1fb395 = Number(_0x4ba106?.endSec);
  const _0x38c608 = Number(_0x4ba106?.durationSec);
  if (!Number.isInteger(_0x2d7471) || !Number.isInteger(_0x1fb395) || _0x2d7471 !== _0x335615 || _0x1fb395 <= _0x2d7471 || _0x1fb395 - _0x2d7471 !== _0x38c608 || _0x1fb395 > 30) {
    throw new Error(_0x4da71b + " 的分镜 " + (_0xef93e1 + 1) + " 缺少模型返回的连续整数时间区间。");
  }
  return _0x2d7471 + "-" + _0x1fb395 + "秒";
}
function splitStoryClipOpeningPosition(_0x36bbec = "") {
  const _0xc4545d = normalizeText(_0x36bbec);
  if (!_0xc4545d.startsWith("人物站位：")) {
    return {
      position: "",
      visual: _0xc4545d
    };
  }
  const _0x9149ac = _0xc4545d.search(/[。！？\n]/u);
  if (_0x9149ac < 0) {
    return {
      position: _0xc4545d,
      visual: _0xc4545d
    };
  }
  const _0x53ea9b = _0xc4545d.slice(0, _0x9149ac + 1).trim();
  const _0x4cee8a = _0xc4545d.slice(_0x9149ac + 1).trim();
  return {
    position: _0x53ea9b,
    visual: _0x4cee8a || _0xc4545d
  };
}
export function buildStoryEpisodeClipPrompt({
  clip = {},
  assets = [],
  visualStyle = "",
  promptMode = clip?.promptMode,
  includeDialogueVoiceGuidance = false
} = {}) {
  const _0x3952a9 = normalizeStoryPromptMode(promptMode, {
    allowDeveloperModes: true
  });
  const _0x93d7aa = isStorySeedance25PromptMode(_0x3952a9);
  const _0x3e07f9 = isStoryWan30PromptMode(_0x3952a9);
  const _0x60360e = isStoryMinimaxH3PromptMode(_0x3952a9);
  const _0x533329 = isStoryContinuousTimelinePromptMode(_0x3952a9);
  const _0x23e3f4 = Array.isArray(clip?.shots) ? clip.shots.map(normalizeStoryEpisodeShot).filter(_0x29cf44 => _0x29cf44.durationSec > 0) : [];
  if (!_0x23e3f4.length) {
    return ensureStoryVisualStylePrefix(clip?.prompt, visualStyle);
  }
  const _0x16e248 = Number(_0x23e3f4.reduce((_0x4de837, _0x84e66b) => _0x4de837 + _0x84e66b.durationSec, 0).toFixed(3));
  if (_0x60360e && (!Number.isInteger(_0x16e248) || _0x16e248 < 4 || _0x16e248 > 15)) {
    throw new Error("MiniMax H3 的单个片段总时长必须是 4 至 15 秒的整数。");
  }
  if (_0x60360e) {
    return buildStoryMinimaxH3Prompt({
      clip: clip,
      shots: _0x23e3f4,
      assets: assets
    });
  }
  const _0x17d0aa = clip?.directorContinuityTest === true;
  const _0x5bd6b8 = clip?.continuityHandoff && typeof clip.continuityHandoff === "object" ? clip.continuityHandoff : {};
  const _0x289d60 = Boolean(normalizeText(_0x5bd6b8.previousExitState));
  const _0x2dea1d = normalizeText(clip?.creativeIntent) === "准确呈现当前剧情动作与情绪变化。" ? "" : normalizeText(clip?.creativeIntent);
  const _0x4be8c9 = normalizeText(clip?.transition) === "镜头按动作与视线连续衔接。" ? "" : normalizeText(clip?.transition);
  const _0x142490 = [normalizeText(visualStyle), _0x533329 ? _0x3e07f9 ? buildStoryClipWan30ReferenceBindings(_0x23e3f4, assets) : buildStoryClipSeedance25ReferenceBindings(_0x23e3f4, assets) : buildStoryClipCharacterSubjectDefinitions(_0x23e3f4, assets, visualStyle), _0x533329 ? "" : buildStoryClipSceneSettingText(_0x23e3f4, assets), _0x533329 ? "" : buildStoryClipPropSettingText(_0x23e3f4, assets), _0x3e07f9 ? "视频目标：生成 " + (Number(_0x23e3f4.at(-1)?.endSec) || 0) + " 秒" + (_0x23e3f4.length === 1 ? "单镜头一镜到底" : "多镜头连续叙事") + "视频；严格按下方时间轴执行。" : "", _0x93d7aa || _0x17d0aa ? "场景空间连续性参考锚点：同一连续时空内，除非剧情通过可见事件明确改变，场景参考图中的建筑、家具、出入口、固定地标和光线方向的相对关系保持连续；镜头变化只改变观察方式，不得整体镜像或重排世界空间布局。" : "", _0x93d7aa || _0x17d0aa ? "人物空间连续性：人物站位优先用场景固定地标或主体相对关系描述，画面左/右只作当前机位补充；位置、朝向、视线与动作方向、左右手持物和动作落点按时间轴连续变化，换位或持物变化必须通过可观察动作完成，不得瞬移或无动作位置重置；不得在无人移动时对调人物相对场景地标的世界位置，仅由机位变化产生的屏幕左右变化不算换位。除非剧情通过可见事件明确改变，人物面部、发型和服装沿用已选参考形象。" : "", _0x17d0aa ? "镜头执行：严格按每镜的衔接说明判断切镜或连续长镜；不要把所有分镜自动合并为一镜到底，也不要机械套用固定角度、固定正反打或固定镜头数量。" : "", _0x289d60 ? ["连续场景技术切片：本段不是独立开场，必须从上一片段的结束状态直接续演；不得重置人物位置、朝向、动作进度、道具、车辆、设备或场景。", "上一片段结束状态为" + ensurePromptSentence(_0x5bd6b8.previousExitState), normalizeText(_0x5bd6b8.currentEntryState) ? "本段开场状态为" + ensurePromptSentence(_0x5bd6b8.currentEntryState) : "", _0x17d0aa && normalizeText(_0x5bd6b8.previousEndCamera) ? "上一片段结束镜头为" + ensurePromptSentence(_0x5bd6b8.previousEndCamera) : "", _0x17d0aa ? "本段开场镜头为" + ensurePromptSentence(_0x5bd6b8.currentOpeningCamera || _0x23e3f4[0]?.camera) : "", "只有当前分镜明确表现出移动、操作、状态变化、换场或时间跳跃时，才允许改变交接状态。"].filter(Boolean).join(" ") : "", _0x2dea1d ? (_0x533329 ? "核心故事" : "这一幕想要呈现的感觉") + "：" + ensurePromptSentence(_0x2dea1d) : "", _0x4be8c9 ? "分镜过渡：" + ensurePromptSentence(_0x4be8c9) : ""].filter(Boolean);
  const _0x5fd34d = _0x23e3f4.flatMap(_0xf481b3 => _0xf481b3.assetUsages || []);
  let _0x2f582b = 0;
  _0x23e3f4.forEach((_0x29182a, _0x3025ac) => {
    const _0x19db74 = replaceStoryClipBoundMentionsWithNames(_0x29182a.camera, _0x5fd34d, assets);
    const _0x449909 = replaceStoryClipBoundMentionsWithNames(_0x29182a.visual, _0x5fd34d, assets);
    const _0x517024 = _0x3025ac === 0 && !_0x93d7aa ? splitStoryClipOpeningPosition(_0x449909) : {
      position: "",
      visual: _0x449909
    };
    const _0x262ef3 = _0x517024.visual;
    const _0x41256b = replaceStoryClipBoundMentionsWithNames(_0x29182a.dialogue, _0x5fd34d, assets);
    const _0x325ece = replaceStoryClipBoundMentionsWithNames(_0x29182a.voiceover, _0x5fd34d, assets);
    const _0x678d8f = replaceStoryClipBoundMentionsWithNames(_0x29182a.audio, _0x5fd34d, assets);
    const _0x308f11 = normalizeText(_0x29182a.transitionFromPrevious);
    if (_0x517024.position) {
      _0x142490.push(_0x517024.position);
    }
    const _0x11ab1f = [_0x19db74 ? ensurePromptSentence(_0x19db74) : "", _0x262ef3 ? ensurePromptSentence(_0x262ef3) : ""].filter(Boolean).join(" ");
    if (_0x17d0aa && _0x308f11) {
      _0x142490.push((_0x3025ac === 0 ? "开场衔接" : "镜头衔接") + "：" + ensurePromptSentence(_0x308f11));
    }
    if (_0x533329) {
      const _0x391f3f = formatStoryContinuousTimelineRange(_0x29182a, _0x3025ac, _0x2f582b, _0x3e07f9 ? "Wan 3.0" : "Seedance 2.5");
      _0x2f582b = Number(_0x29182a.endSec);
      _0x142490.push(_0x3e07f9 ? "镜头" + (_0x3025ac + 1) + " [" + _0x391f3f + "]：" + _0x11ab1f : _0x391f3f + "：" + _0x11ab1f);
    } else {
      _0x142490.push("分镜" + (_0x3025ac + 1) + " ⏱ " + formatStoryClipDuration(_0x29182a.durationSec) + "：" + _0x11ab1f);
    }
    if (_0x41256b) {
      _0x142490.push(buildStoryClipDialoguePromptBlock(_0x41256b, {
        assetUsages: _0x29182a.assetUsages,
        assets: assets,
        includeDialogueVoiceGuidance: includeDialogueVoiceGuidance
      }));
    }
    if (_0x325ece) {
      _0x142490.push("画外音：" + ensurePromptSentence(_0x325ece));
    }
    if (_0x678d8f) {
      _0x142490.push("音效：" + ensurePromptSentence(_0x678d8f));
    }
  });
  if (_0x93d7aa) {
    _0x142490.push("全局要求：角色、场景与道具严格沿用开头绑定；人物位置、朝向、持物和状态连续变化；对白口型与说话人一致，不新增人物、道具、字幕或水印。");
  } else if (_0x3e07f9) {
    _0x142490.push("全局要求：角色、场景与道具严格沿用开头绑定；保持人物位置、朝向、持物、服装、情绪和场景方向连续；多人对白始终使用唯一角色名，不用他或她代替说话人；对白口型、动作与说话人一致；不新增人物、道具、对白、旁白、字幕、标识或水印。");
  }
  return _0x142490.join("\n");
}
function hasMeaningfulMediaValue(_0x2ee802) {
  if (Array.isArray(_0x2ee802)) {
    return _0x2ee802.length > 0;
  }
  if (_0x2ee802 && typeof _0x2ee802 === "object") {
    return Object.keys(_0x2ee802).length > 0;
  }
  return normalizeText(_0x2ee802) !== "";
}
function preserveMediaFields(_0x1297be, _0x22698e, _0x3b17cf) {
  if (!_0x3b17cf || !_0x22698e || typeof _0x22698e !== "object") {
    return _0x1297be;
  }
  const _0x102127 = {
    ..._0x1297be
  };
  for (const _0x439810 of MEDIA_FIELDS) {
    if (hasMeaningfulMediaValue(_0x22698e[_0x439810])) {
      _0x102127[_0x439810] = _0x22698e[_0x439810];
    }
  }
  return _0x102127;
}
function buildStoryEpisodeClipGenerationSignature(_0x220c54 = {}) {
  const _0x457b1f = (Array.isArray(_0x220c54?.shots) ? _0x220c54.shots : []).map(_0x33f88b => ({
    durationSec: normalizeDurationSeconds(_0x33f88b?.durationSec || _0x33f88b?.durationSeconds),
    startSec: Number.isFinite(Number(_0x33f88b?.startSec)) ? Number(_0x33f88b.startSec) : null,
    endSec: Number.isFinite(Number(_0x33f88b?.endSec)) ? Number(_0x33f88b.endSec) : null,
    time: normalizeText(_0x33f88b?.time),
    visual: normalizeText(_0x33f88b?.visual),
    camera: normalizeText(_0x33f88b?.camera),
    dialogue: normalizeText(_0x33f88b?.dialogue),
    voiceover: normalizeText(_0x33f88b?.voiceover),
    audio: normalizeText(_0x33f88b?.audio),
    assetRefs: normalizeTextArray(_0x33f88b?.assetRefs),
    assetUsages: normalizeStoryAssetUsages(_0x33f88b?.assetUsages).map(_0x1fafc0 => ({
      assetRef: normalizeText(_0x1fafc0?.assetRef),
      appearanceRef: normalizeText(_0x1fafc0?.appearanceRef)
    }))
  }));
  return JSON.stringify({
    promptMode: normalizeStoryPromptMode(_0x220c54?.promptMode, {
      allowDeveloperModes: true
    }),
    durationSec: normalizeDurationSeconds(_0x220c54?.durationSec || _0x220c54?.durationSeconds || _0x220c54?.duration),
    script: normalizeText(_0x220c54?.script),
    creativeIntent: normalizeText(_0x220c54?.creativeIntent),
    transition: normalizeText(_0x220c54?.transition),
    prompt: normalizeText(_0x220c54?.prompt),
    shots: _0x457b1f
  });
}
function canPreserveStoryEpisodeClipMedia(_0x511c4b, _0x53eaf1, _0x23bbbd) {
  if (!_0x23bbbd || !_0x53eaf1 || typeof _0x53eaf1 !== "object") {
    return false;
  }
  return buildStoryEpisodeClipGenerationSignature(_0x511c4b) === buildStoryEpisodeClipGenerationSignature(_0x53eaf1);
}
function getPlanningRef(_0x5467a9 = {}, _0x1313a0 = "") {
  return normalizeText(_0x5467a9.planningRef || _0x5467a9.ref || _0x1313a0);
}
function getAssetIdentity(_0x2944a8 = {}) {
  const _0x2da645 = ["scene", "prop"].includes(_0x2944a8.kind) ? _0x2944a8.kind : "character";
  return _0x2da645 + ":" + normalizeText(_0x2944a8.name).toLowerCase();
}
function findMatchingAsset(_0x382d05, _0x5c6efa, _0x151651) {
  const _0x32c7b7 = getPlanningRef(_0x5c6efa);
  const _0x3c5304 = normalizeText(_0x5c6efa?.id);
  const _0x64ba7a = getAssetIdentity(_0x5c6efa);
  return _0x382d05.find(_0x35c33d => _0x3c5304 && normalizeText(_0x35c33d?.id) === _0x3c5304 || _0x32c7b7 && getPlanningRef(_0x35c33d) === _0x32c7b7 || normalizeText(_0x35c33d?.id) === "story-asset-" + (_0x151651 + 1) && !normalizeText(_0x35c33d?.name) || getAssetIdentity(_0x35c33d) === _0x64ba7a) || null;
}
function findMatchingAppearance(_0x302b00, _0x5d5325) {
  const _0x170766 = getPlanningRef(_0x5d5325);
  const _0x3a6e12 = normalizeText(_0x5d5325?.name).toLowerCase();
  return _0x302b00.find(_0x53e07b => _0x170766 && getPlanningRef(_0x53e07b) === _0x170766 || _0x3a6e12 && normalizeText(_0x53e07b?.name).toLowerCase() === _0x3a6e12) || null;
}
function normalizeStoryPlanningAppearance(_0x294d32 = {}, {
  assetId: _0x206b19,
  assetRef: _0x2f7991,
  assetOccurrences: _0x3d7d9a,
  fallbackPrompt: _0x3c284b,
  index: _0x4810d0,
  existingAppearance: _0x453af1,
  preserveMedia: _0x192c97,
  visualStyle: _0x4bba3a
} = {}) {
  const _0x5be4ec = getPlanningRef(_0x294d32, _0x2f7991 + "-appearance-" + (_0x4810d0 + 1));
  const _0x231f7b = normalizeText(_0x453af1?.id) || createStableStoryPlanningId("appearance", _0x206b19, _0x5be4ec, _0x294d32?.name, String(_0x4810d0 + 1));
  const _0x4e4c8d = {
    ..._0x294d32,
    id: _0x231f7b,
    planningRef: _0x5be4ec,
    name: normalizeText(_0x294d32?.name) || (_0x4810d0 === 0 ? "基础形象" : "形象 " + (_0x4810d0 + 1)),
    description: normalizeText(_0x294d32?.description),
    occurrences: normalizeText(_0x294d32?.occurrences || _0x3d7d9a) || "当前项目",
    sourceChapterIds: normalizeTextArray(_0x294d32?.sourceChapterIds),
    prompt: ensureStoryVisualStylePrefix(_0x294d32?.prompt || _0x3c284b, _0x4bba3a),
    imageUrl: normalizeText(_0x294d32?.imageUrl),
    error: normalizeText(_0x294d32?.error)
  };
  return preserveMediaFields(_0x4e4c8d, _0x453af1, _0x192c97);
}
export function normalizeStoryPlanningAsset(_0x4fb5df = {}, _0x5e2e40 = 0, {
  existingAsset = null,
  preserveMedia = true,
  visualStyle = ""
} = {}) {
  const _0x328e19 = ["scene", "prop"].includes(_0x4fb5df?.kind) ? _0x4fb5df.kind : "character";
  const _0x3c20e3 = normalizeStoryAssetDisplayName(_0x4fb5df?.name, _0x328e19, _0x5e2e40);
  const _0x3ac45d = getPlanningRef(_0x4fb5df, "asset-" + (_0x5e2e40 + 1));
  const _0x371258 = normalizeText(existingAsset?.id) || createStableStoryPlanningId(_0x328e19, _0x3ac45d, _0x3c20e3, String(_0x5e2e40 + 1));
  const _0x3f1505 = Array.isArray(_0x4fb5df?.appearances) && _0x4fb5df.appearances.length ? _0x4fb5df.appearances : [{
    planningRef: _0x3ac45d + "-base",
    name: "基础形象",
    occurrences: _0x4fb5df?.occurrences,
    sourceChapterIds: _0x4fb5df?.sourceChapterIds,
    prompt: _0x4fb5df?.prompt || _0x4fb5df?.description,
    imageUrl: _0x4fb5df?.imageUrl
  }];
  const _0x1baa53 = Array.isArray(existingAsset?.appearances) ? existingAsset.appearances : [];
  const _0x4eeced = _0x3f1505.map((_0x1302ff, _0x3d0355) => {
    const _0x2ba7a7 = findMatchingAppearance(_0x1baa53, _0x1302ff);
    return normalizeStoryPlanningAppearance(_0x1302ff, {
      assetId: _0x371258,
      assetRef: _0x3ac45d,
      assetOccurrences: _0x4fb5df?.occurrences,
      fallbackPrompt: _0x3d0355 === 0 ? _0x4fb5df?.prompt || _0x4fb5df?.description : "",
      index: _0x3d0355,
      existingAppearance: _0x2ba7a7,
      preserveMedia: preserveMedia,
      visualStyle: visualStyle
    });
  });
  const _0x1649bb = {
    ..._0x4fb5df,
    id: _0x371258,
    planningRef: _0x3ac45d,
    kind: _0x328e19,
    name: _0x3c20e3,
    role: _0x328e19 === "character" ? normalizeStoryCharacterRole(_0x4fb5df?.role, _0x3c20e3) : normalizeText(_0x4fb5df?.role),
    description: normalizeText(_0x4fb5df?.description),
    voiceDescription: _0x328e19 === "character" ? normalizeText(_0x4fb5df?.voiceDescription) : "",
    occurrences: normalizeText(_0x4fb5df?.occurrences) || "当前项目",
    sourceChapterIds: normalizeTextArray(_0x4fb5df?.sourceChapterIds),
    prompt: normalizeText(_0x4eeced[0]?.prompt || _0x4fb5df?.prompt),
    imageUrl: normalizeText(_0x4fb5df?.imageUrl),
    appearances: _0x4eeced
  };
  const _0x4780df = preserveMediaFields(_0x1649bb, existingAsset, preserveMedia);
  const _0x39331e = normalizeText(_0x4780df.baseAppearanceId);
  const _0x49c127 = _0x4eeced.find(_0x2c691b => _0x2c691b.id === _0x39331e) || _0x4eeced[0];
  _0x4780df.baseAppearanceId = _0x328e19 === "character" && _0x4eeced.length > 1 ? _0x49c127?.id || "" : "";
  return _0x4780df;
}
export function clearStoryPlanningForRebuild(_0x18a305 = {}) {
  const _0x29c34c = _0x18a305 && typeof _0x18a305 === "object" && !Array.isArray(_0x18a305) ? _0x18a305 : {};
  return {
    ..._0x29c34c,
    assets: [],
    episodes: (Array.isArray(_0x29c34c.episodes) ? _0x29c34c.episodes : []).map(_0x2464ed => {
      const _0x2cdf90 = normalizeDurationSeconds(_0x2464ed?.estimatedDurationSeconds);
      return {
        ..._0x2464ed,
        assetRefs: [],
        assetIds: [],
        characterCount: 0,
        sceneCount: 0,
        propCount: 0,
        coverUrl: "",
        clips: [],
        clipCount: 0,
        durationSec: _0x2cdf90,
        duration: _0x2cdf90 ? formatStoryClockDuration(_0x2cdf90) : "--:--",
        status: "待拆分"
      };
    })
  };
}
export function mergeStoryPlanningAssets(_0x4686ad = [], _0x428bc6 = [], {
  preserveMedia = true,
  visualStyle = ""
} = {}) {
  const _0x16ebba = Array.isArray(_0x4686ad) ? _0x4686ad : [];
  const _0x5108b0 = Array.isArray(_0x428bc6) ? _0x428bc6 : [];
  return _0x5108b0.map((_0x353476, _0x53c71c) => {
    const _0x1bfb06 = removeStoryCharacterAssetPromptPrefix(_0x353476);
    return applyStoryCharacterAssetPromptPrefix(normalizeStoryPlanningAsset(_0x1bfb06, _0x53c71c, {
      existingAsset: findMatchingAsset(_0x16ebba, _0x353476, _0x53c71c),
      preserveMedia: preserveMedia,
      visualStyle: visualStyle
    }));
  });
}
export function syncStoryPlanningVisualStyle(_0x50995e = {}, {
  previousStyle = "",
  visualStyle = ""
} = {}) {
  if (!_0x50995e || typeof _0x50995e !== "object" || Array.isArray(_0x50995e)) {
    return _0x50995e;
  }
  const _0x3b562f = Array.isArray(_0x50995e.assets) ? _0x50995e.assets.map(_0x2f4777 => {
    const _0x4a3f67 = _0x55a481 => {
      const _0x240a97 = _0x2f4777?.kind === "character" && normalizeText(_0x55a481).startsWith(STORY_CHARACTER_ASSET_PROMPT_PREFIX);
      const _0xdb112 = _0x240a97 ? stripStoryCharacterAssetPromptPrefix(_0x55a481) : _0x55a481;
      const _0x452bb3 = replaceStoryVisualStylePrefix(_0xdb112, {
        previousStyle: previousStyle,
        visualStyle: visualStyle
      });
      if (_0x240a97) {
        return ensureStoryCharacterAssetPromptPrefix(_0x452bb3);
      } else {
        return _0x452bb3;
      }
    };
    const _0x22ef73 = Array.isArray(_0x2f4777?.appearances) ? _0x2f4777.appearances.map(_0x2dd0bb => ({
      ..._0x2dd0bb,
      prompt: _0x4a3f67(_0x2dd0bb?.prompt)
    })) : [];
    return {
      ..._0x2f4777,
      appearances: _0x22ef73,
      prompt: _0x22ef73[0]?.prompt || _0x4a3f67(_0x2f4777?.prompt)
    };
  }) : [];
  const _0x10a369 = Array.isArray(_0x50995e.episodes) ? _0x50995e.episodes.map(_0x1d4d8a => ({
    ..._0x1d4d8a,
    clips: Array.isArray(_0x1d4d8a?.clips) ? _0x1d4d8a.clips.map(_0x1996b6 => ({
      ..._0x1996b6,
      prompt: replaceStoryVisualStylePrefix(_0x1996b6?.prompt, {
        previousStyle: previousStyle,
        visualStyle: visualStyle
      })
    })) : []
  })) : [];
  return {
    ..._0x50995e,
    assets: _0x3b562f,
    episodes: _0x10a369
  };
}
function buildAssetLookup(_0x20ff6c = []) {
  const _0xdde113 = new Map();
  for (const _0x1e1ce4 of Array.isArray(_0x20ff6c) ? _0x20ff6c : []) {
    const _0x36cb7b = normalizeText(_0x1e1ce4?.id);
    const _0x55c719 = getPlanningRef(_0x1e1ce4);
    if (_0x36cb7b) {
      _0xdde113.set(_0x36cb7b, _0x1e1ce4);
    }
    if (_0x55c719) {
      _0xdde113.set(_0x55c719, _0x1e1ce4);
    }
  }
  return _0xdde113;
}
function resolveAssetIds(_0x4c4e05, _0x4cdb68) {
  return normalizeTextArray(_0x4c4e05).map(_0x1c26be => normalizeText(_0x4cdb68.get(_0x1c26be)?.id || _0x1c26be)).filter(Boolean);
}
function countEpisodeAssets(_0x57dfc7, _0x23a64f, _0x1766f8) {
  return _0x57dfc7.filter(_0x469fd6 => _0x23a64f.get(_0x469fd6)?.kind === _0x1766f8).length;
}
function collectStoryEpisodeAssetRefs(_0x35374d = {}) {
  const _0x3c7cda = [...(Array.isArray(_0x35374d?.assetIds) ? _0x35374d.assetIds : []), ...(Array.isArray(_0x35374d?.assetRefs) ? _0x35374d.assetRefs : [])];
  for (const _0xab2855 of Array.isArray(_0x35374d?.clips) ? _0x35374d.clips : []) {
    _0x3c7cda.push(...(Array.isArray(_0xab2855?.assetIds) ? _0xab2855.assetIds : []), ...(Array.isArray(_0xab2855?.assetRefs) ? _0xab2855.assetRefs : []), ...(Array.isArray(_0xab2855?.assetUsages) ? _0xab2855.assetUsages.map(_0x5e7273 => _0x5e7273?.assetRef) : []));
    for (const _0x53eb9b of Array.isArray(_0xab2855?.shots) ? _0xab2855.shots : []) {
      _0x3c7cda.push(...(Array.isArray(_0x53eb9b?.assetRefs) ? _0x53eb9b.assetRefs : []), ...(Array.isArray(_0x53eb9b?.assetUsages) ? _0x53eb9b.assetUsages.map(_0x49d007 => _0x49d007?.assetRef) : []));
    }
  }
  return normalizeTextArray(_0x3c7cda);
}
export function deriveStoryEpisodeAssetSummary(_0x13d760 = {}, _0x3d4f79 = []) {
  const _0x1d8a4e = buildAssetLookup(_0x3d4f79);
  const _0x8a8d7f = normalizeTextArray(resolveAssetIds(collectStoryEpisodeAssetRefs(_0x13d760), _0x1d8a4e));
  const _0x125ce0 = _0x8a8d7f.map(_0x568bc0 => _0x1d8a4e.get(_0x568bc0)).filter((_0x117e2a, _0x5866db, _0x56ed50) => _0x117e2a && ["character", "scene", "prop"].includes(_0x117e2a.kind) && _0x56ed50.indexOf(_0x117e2a) === _0x5866db);
  return {
    assetRefs: normalizeTextArray(_0x8a8d7f.map(_0x11e0c3 => {
      const _0x20257a = _0x1d8a4e.get(_0x11e0c3);
      if (_0x20257a) {
        return getPlanningRef(_0x20257a, _0x11e0c3);
      } else {
        return _0x11e0c3;
      }
    })),
    assetIds: _0x8a8d7f,
    assets: _0x125ce0,
    characterCount: _0x125ce0.filter(_0x428895 => _0x428895.kind === "character").length,
    sceneCount: _0x125ce0.filter(_0x3dd850 => _0x3dd850.kind === "scene").length,
    propCount: _0x125ce0.filter(_0x5d2248 => _0x5d2248.kind === "prop").length
  };
}
function findMatchingEpisode(_0x52d3f3, _0x2a1482, _0x598d0c) {
  const _0xc41a48 = normalizeText(_0x2a1482?.id);
  const _0x5f5cfb = getPlanningRef(_0x2a1482);
  const _0x3d833a = Math.max(1, Math.trunc(Number(_0x2a1482?.number) || _0x598d0c + 1));
  return _0x52d3f3.find((_0x9077e8, _0x116b23) => _0xc41a48 && normalizeText(_0x9077e8?.id) === _0xc41a48 || _0x5f5cfb && getPlanningRef(_0x9077e8) === _0x5f5cfb || Math.max(1, Math.trunc(Number(_0x9077e8?.number) || _0x116b23 + 1)) === _0x3d833a) || null;
}
function normalizeExistingClips(_0x88c99d = []) {
  if (Array.isArray(_0x88c99d)) {
    return _0x88c99d.map(_0x2edb26 => ({
      ..._0x2edb26
    }));
  } else {
    return [];
  }
}
function hasStoryClipVideoResult(_0x5adbba = {}) {
  if (normalizeText(_0x5adbba?.result?.videoUrl || _0x5adbba?.videoUrl || _0x5adbba?.resultUrl)) {
    return true;
  }
  const _0x1c8287 = Array.isArray(_0x5adbba?.video?.results) ? _0x5adbba.video.results : [];
  return _0x1c8287.some(_0x57509c => _0x57509c && !normalizeText(_0x57509c.error) && normalizeText(_0x57509c.videoUrl || _0x57509c.url || _0x57509c.displayUrl || _0x57509c.localPath || _0x57509c.displayLocalPath));
}
export function deriveStoryEpisodeStatus(_0xb66ab = []) {
  const _0x259d16 = Array.isArray(_0xb66ab) ? _0xb66ab : [];
  if (!_0x259d16.length) {
    return "待拆分";
  }
  const _0x47d521 = _0x259d16.map(_0x5c468e => normalizeText(_0x5c468e?.generation?.status || _0x5c468e?.result?.status).toLowerCase());
  if (_0x259d16.every((_0x407c7c, _0x3bfc07) => ["succeeded", "success", "completed", "done"].includes(_0x47d521[_0x3bfc07]) || hasStoryClipVideoResult(_0x407c7c))) {
    return "已完成";
  }
  if (_0x47d521.some(_0x5db66d => ["running", "pending", "queued", "submitting", "recovering"].includes(_0x5db66d))) {
    return "生成中";
  }
  if (_0x47d521.some(_0x2ca92c => ["failed", "error"].includes(_0x2ca92c))) {
    return "失败";
  }
  return "待生成";
}
export function normalizeStoryEpisodePlan(_0x160c05 = {}, _0x369383 = 0, {
  assets = [],
  existingEpisode = null,
  preserveMedia = true
} = {}) {
  const _0x89f6b2 = Math.max(1, Math.trunc(Number(_0x160c05?.number) || _0x369383 + 1));
  const _0x15771e = getPlanningRef(_0x160c05, "episode-" + _0x89f6b2);
  const _0x3bdd88 = normalizeText(existingEpisode?.id) || "episode-" + _0x89f6b2;
  const _0x533e0f = buildAssetLookup(assets);
  const _0x54c25e = normalizeTextArray(_0x160c05?.assetRefs || _0x160c05?.assetIds);
  const _0x5c78d7 = resolveAssetIds(_0x54c25e, _0x533e0f);
  const _0x1aa0c8 = normalizeDurationSeconds(_0x160c05?.estimatedDurationSeconds || _0x160c05?.durationSec);
  const _0x2f2bd7 = preserveMedia ? normalizeExistingClips(existingEpisode?.clips) : [];
  const _0x529a27 = Array.isArray(_0x160c05?.clips) && _0x160c05.clips.length ? normalizeExistingClips(_0x160c05.clips) : _0x2f2bd7;
  const _0x5da87e = _0x529a27.reduce((_0x60e391, _0x4b5a6a) => _0x60e391 + normalizeDurationSeconds(_0x4b5a6a?.durationSec || _0x4b5a6a?.durationSeconds || _0x4b5a6a?.duration), 0);
  const _0x4f220b = _0x5da87e || _0x1aa0c8;
  const _0x204186 = {
    ..._0x160c05,
    id: _0x3bdd88,
    planningRef: _0x15771e,
    number: _0x89f6b2,
    title: normalizeText(_0x160c05?.title) || "第 " + _0x89f6b2 + " 集",
    synopsis: normalizeText(_0x160c05?.synopsis || _0x160c05?.content),
    sourceChapterIds: normalizeTextArray(_0x160c05?.sourceChapterIds),
    assetRefs: _0x54c25e,
    assetIds: _0x5c78d7,
    characterCount: countEpisodeAssets(_0x5c78d7, _0x533e0f, "character"),
    sceneCount: countEpisodeAssets(_0x5c78d7, _0x533e0f, "scene"),
    propCount: countEpisodeAssets(_0x5c78d7, _0x533e0f, "prop"),
    estimatedDurationSeconds: _0x1aa0c8,
    durationSec: _0x4f220b,
    duration: _0x4f220b ? formatStoryClockDuration(_0x4f220b) : "--:--",
    coverUrl: normalizeText(_0x160c05?.coverUrl),
    clips: _0x529a27,
    clipCount: _0x529a27.length,
    status: deriveStoryEpisodeStatus(_0x529a27)
  };
  return preserveMediaFields(_0x204186, existingEpisode, preserveMedia);
}
export function mergeStoryEpisodePlans(_0x39be86 = [], _0x280ba8 = [], {
  assets = [],
  preserveMedia = true
} = {}) {
  const _0x4b39c6 = Array.isArray(_0x39be86) ? _0x39be86 : [];
  const _0x42a0a2 = Array.isArray(_0x280ba8) ? _0x280ba8 : [];
  return _0x42a0a2.map((_0x252806, _0x5b2aba) => normalizeStoryEpisodePlan(_0x252806, _0x5b2aba, {
    assets: assets,
    existingEpisode: findMatchingEpisode(_0x4b39c6, _0x252806, _0x5b2aba),
    preserveMedia: preserveMedia
  }));
}
export function isStoryEpisodeScriptComplete(_0x453b07 = {}) {
  return normalizeText(_0x453b07?.script?.fullText) !== "" && Array.isArray(_0x453b07?.script?.scenes) && _0x453b07.script.scenes.length > 0;
}
export function getNextStoryEpisodeScriptIndex(_0x3a6546 = []) {
  const _0x11f623 = Array.isArray(_0x3a6546) ? _0x3a6546 : [];
  const _0x5c6f89 = _0x11f623.findIndex(_0x8e165 => !isStoryEpisodeScriptComplete(_0x8e165));
  if (_0x5c6f89 < 0) {
    return _0x11f623.length;
  } else {
    return _0x5c6f89;
  }
}
export function canGenerateStoryEpisodeScript(_0x4e3de8 = [], _0x163543 = 0) {
  const _0x498cda = Array.isArray(_0x4e3de8) ? _0x4e3de8 : [];
  const _0x1814ee = Math.trunc(Number(_0x163543));
  return _0x1814ee >= 0 && _0x1814ee < _0x498cda.length && getNextStoryEpisodeScriptIndex(_0x498cda) === _0x1814ee;
}
export function saveStoryEpisodeScriptDraft(_0x351419 = {}, _0x3f0948 = null) {
  if (!_0x3f0948 || typeof _0x3f0948 !== "object" || Array.isArray(_0x3f0948)) {
    return _0x351419;
  }
  return {
    ..._0x351419,
    scriptStatus: "error",
    scriptDraft: JSON.parse(JSON.stringify(_0x3f0948))
  };
}
export function mergeStoryEpisodeScript(_0x4da473 = {}, _0x4eaf11 = {}) {
  const {
    scriptDraft: _0xbb080b,
    ..._0xc1ba02
  } = _0x4da473;
  const _0x313b26 = Array.isArray(_0x4eaf11?.scenes) ? _0x4eaf11.scenes.map(_0x4db96f => ({
    ref: normalizeText(_0x4db96f?.ref),
    heading: normalizeText(_0x4db96f?.heading),
    characters: normalizeTextArray(_0x4db96f?.characters),
    body: normalizeText(_0x4db96f?.body)
  })).filter(_0x10814a => _0x10814a.heading && _0x10814a.body) : [];
  const _0x3b3c7c = normalizeText(_0x4eaf11?.fullText);
  if (!_0x313b26.length || !_0x3b3c7c) {
    throw new Error("完整分集剧本缺少场次或正文。");
  }
  const _0x50f736 = normalizeTextArray([...normalizeTextArray(_0x4da473?.continuityFacts), ...normalizeTextArray(_0x4eaf11?.continuityFacts)]);
  const _0x282bff = _0x4eaf11?.endingState && typeof _0x4eaf11.endingState === "object" ? {
    characters: normalizeTextArray(_0x4eaf11.endingState.characters),
    props: normalizeTextArray(_0x4eaf11.endingState.props),
    unresolvedThreads: normalizeTextArray(_0x4eaf11.endingState.unresolvedThreads)
  } : _0x4da473?.endingState;
  return {
    ..._0xc1ba02,
    title: normalizeText(_0x4eaf11?.title) || normalizeText(_0x4da473?.title),
    continuityFacts: _0x50f736,
    endingState: _0x282bff,
    scriptStatus: "completed",
    script: {
      schemaVersion: Number(_0x4eaf11?.schemaVersion) || 1,
      episodeRef: normalizeText(_0x4eaf11?.episodeRef) || getPlanningRef(_0x4da473),
      scenes: _0x313b26,
      fullText: _0x3b3c7c,
      ...(_0x4eaf11?.timingReview && typeof _0x4eaf11.timingReview === "object" ? {
        timingReview: JSON.parse(JSON.stringify(_0x4eaf11.timingReview))
      } : {}),
      generatedAt: Date.now()
    }
  };
}
export function compileStoryEpisodeScripts(_0x5c66c0 = []) {
  const _0x35e7e3 = Array.isArray(_0x5c66c0) ? _0x5c66c0 : [];
  const _0x145014 = _0x35e7e3.filter(isStoryEpisodeScriptComplete);
  const _0x43408f = _0x145014.map((_0x31b190, _0x5d1e7d) => ({
    id: normalizeText(_0x31b190?.id) || "episode-" + (_0x5d1e7d + 1),
    title: "第 " + Math.max(1, Math.trunc(Number(_0x31b190?.number) || _0x5d1e7d + 1)) + " 集：" + (normalizeText(_0x31b190?.title) || "第 " + (_0x5d1e7d + 1) + " 集"),
    content: normalizeText(_0x31b190?.script?.fullText)
  }));
  return {
    completedCount: _0x145014.length,
    totalCount: _0x35e7e3.length,
    complete: _0x35e7e3.length > 0 && _0x145014.length === _0x35e7e3.length,
    chapters: _0x43408f,
    fullText: _0x43408f.map(_0x20ad7f => _0x20ad7f.content).join("\n\n")
  };
}
export function invalidateStoryEpisodeScriptsFrom(_0x58d3c2 = [], _0xdd8979 = 0) {
  const _0x4bfeec = Array.isArray(_0x58d3c2) ? _0x58d3c2 : [];
  const _0x49b0d3 = Math.max(0, Math.trunc(Number(_0xdd8979) || 0));
  return _0x4bfeec.map((_0x18e9e2, _0x4abe0c) => {
    if (_0x4abe0c < _0x49b0d3) {
      return _0x18e9e2;
    }
    const {
      scriptDraft: _0x1c9801,
      ..._0x1dd585
    } = _0x18e9e2;
    return {
      ..._0x1dd585,
      scriptStatus: "pending",
      script: null,
      clips: [],
      clipCount: 0,
      status: "待生成剧本"
    };
  });
}
export function getStoryEpisodeScriptBatchTargets(_0x3f5317 = [], _0x15bab6 = []) {
  const _0x9e5330 = Array.isArray(_0x3f5317) ? _0x3f5317 : [];
  const _0x1bd45b = getNextStoryEpisodeScriptIndex(_0x9e5330);
  if (_0x1bd45b >= _0x9e5330.length) {
    return [];
  }
  const _0x583585 = new Set(normalizeTextArray(_0x15bab6));
  if (!_0x583585.size) {
    return _0x9e5330.slice(_0x1bd45b);
  }
  const _0x419610 = [];
  for (let _0x29dc82 = _0x1bd45b; _0x29dc82 < _0x9e5330.length; _0x29dc82 += 1) {
    const _0x57b270 = _0x9e5330[_0x29dc82];
    if (!_0x583585.has(normalizeText(_0x57b270?.id))) {
      break;
    }
    _0x419610.push(_0x57b270);
  }
  return _0x419610;
}
function findMatchingClip(_0x32186c, _0x36411a, _0x335c11, _0x2b43c4 = new Set()) {
  const _0x46a8b3 = normalizeText(_0x36411a?.id);
  const _0x3dad72 = getPlanningRef(_0x36411a);
  const _0x1c3f18 = Math.max(1, Math.trunc(Number(_0x36411a?.number) || _0x335c11 + 1));
  return _0x32186c.find((_0x3862f1, _0x2a8a99) => !_0x2b43c4.has(_0x3862f1) && (_0x46a8b3 && normalizeText(_0x3862f1?.id) === _0x46a8b3 || _0x3dad72 && getPlanningRef(_0x3862f1) === _0x3dad72 || Math.max(1, Math.trunc(Number(_0x3862f1?.number) || _0x2a8a99 + 1)) === _0x1c3f18)) || null;
}
export function ensureUniqueStoryEpisodeClipIds(_0x379e6e = {}) {
  const _0x2cf8bb = Array.isArray(_0x379e6e?.clips) ? _0x379e6e.clips : [];
  const _0x2bcab6 = normalizeText(_0x379e6e?.id) || "episode-1";
  const _0x43b6a6 = new Set();
  let _0x2cb161 = false;
  const _0xa9715b = _0x2cf8bb.map((_0xa2217e, _0x41c3b4) => {
    const _0x2c458d = normalizeText(_0xa2217e?.id);
    if (_0x2c458d && !_0x43b6a6.has(_0x2c458d)) {
      _0x43b6a6.add(_0x2c458d);
      return _0xa2217e;
    }
    const _0x579a8f = _0x2bcab6 + "-clip-" + (_0x41c3b4 + 1);
    let _0x46cc97 = _0x579a8f;
    let _0x474282 = 2;
    while (_0x43b6a6.has(_0x46cc97)) {
      _0x46cc97 = _0x579a8f + "-" + _0x474282;
      _0x474282 += 1;
    }
    _0x43b6a6.add(_0x46cc97);
    _0x2cb161 = true;
    const _0x3c4ef0 = {
      ..._0xa2217e,
      id: _0x46cc97
    };
    if (_0x2c458d) {
      for (const _0x17c7dc of MEDIA_FIELDS) {
        delete _0x3c4ef0[_0x17c7dc];
      }
    }
    return _0x3c4ef0;
  });
  if (_0x2cb161) {
    return {
      ..._0x379e6e,
      clips: _0xa9715b
    };
  } else {
    return _0x379e6e;
  }
}
function resolveStoryClipContinuitySceneKey(_0x142739 = {}, _0x11188a = new Map()) {
  const _0x5ef532 = normalizeText(_0x142739?.continuitySceneKey || _0x142739?.sourceSceneRef);
  if (_0x5ef532) {
    return _0x5ef532;
  }
  const _0x2f8ec3 = normalizeStoryAssetUsages((Array.isArray(_0x142739?.shots) ? _0x142739.shots : []).flatMap(_0x2b702b => _0x2b702b?.assetUsages || []));
  const _0x40bd71 = [...new Set(_0x2f8ec3.flatMap(_0x9facea => {
    const {
      assetRef: _0x6d0cda,
      appearanceRef: _0x94e959,
      asset: _0x7f34c1
    } = resolveStoryAssetUsage(_0x9facea, _0x11188a);
    if (_0x7f34c1?.kind !== "scene") {
      return [];
    }
    return [getPlanningRef(_0x7f34c1, _0x6d0cda) + "|" + _0x94e959];
  }))];
  if (_0x40bd71.length === 1) {
    return _0x40bd71[0];
  } else {
    return "";
  }
}
function addStoryEpisodeClipContinuityHandoffs(_0xac505f = [], _0x348c80 = []) {
  const _0x3b96b8 = Array.isArray(_0xac505f) ? _0xac505f : [];
  const _0x13f5c3 = buildStoryAssetUsageLookup(_0x348c80);
  const _0x4e49dd = _0x3b96b8.map(_0x21d61a => resolveStoryClipContinuitySceneKey(_0x21d61a, _0x13f5c3));
  return _0x3b96b8.map((_0x47b760, _0x55bc1e) => {
    const _0x58b4d4 = _0x55bc1e > 0 ? _0x3b96b8[_0x55bc1e - 1] : null;
    const _0x3ff889 = Boolean(_0x58b4d4 && _0x4e49dd[_0x55bc1e] && _0x4e49dd[_0x55bc1e] === _0x4e49dd[_0x55bc1e - 1]);
    if (!_0x3ff889) {
      if (!_0x47b760?.continuityHandoff) {
        return _0x47b760;
      }
      const _0x417661 = {
        ..._0x47b760
      };
      delete _0x417661.continuityHandoff;
      return _0x417661;
    }
    const _0x3f55a4 = Array.isArray(_0x58b4d4?.shots) ? _0x58b4d4.shots.at(-1) : null;
    const _0x438411 = Array.isArray(_0x47b760?.shots) ? _0x47b760.shots[0] : null;
    return {
      ..._0x47b760,
      continuityHandoff: {
        previousExitState: normalizeText(_0x3f55a4?.visual),
        previousEndCamera: normalizeText(_0x3f55a4?.camera),
        currentEntryState: normalizeText(_0x438411?.visual),
        currentOpeningCamera: normalizeText(_0x438411?.camera),
        transitionFromPrevious: normalizeText(_0x438411?.transitionFromPrevious)
      }
    };
  });
}
export function normalizeStoryEpisodeClip(_0x1a9b63 = {}, _0x27f97a = 0, {
  episodeId = "episode-1",
  assets = [],
  existingClip = null,
  preserveMedia = true,
  visualStyle = "",
  promptMode = _0x1a9b63?.promptMode,
  includeDialogueVoiceGuidance = false
} = {}) {
  const _0x952ab1 = normalizeStoryPromptMode(promptMode, {
    allowDeveloperModes: true
  });
  const _0x78f82e = Math.max(1, Math.trunc(Number(_0x1a9b63?.number) || _0x27f97a + 1));
  const _0x527cdc = getPlanningRef(_0x1a9b63, "clip-" + _0x78f82e);
  const _0x5c2c3d = normalizeText(existingClip?.id) || episodeId + "-clip-" + _0x78f82e;
  const _0x358b40 = Array.isArray(_0x1a9b63?.shots) ? _0x1a9b63.shots.map(normalizeStoryEpisodeShot).filter(_0xb8820 => _0xb8820.durationSec > 0) : [];
  const _0x38320e = normalizeStoryMinimaxH3ClipShots(_0x358b40, _0x952ab1);
  const _0x1cd5e2 = _0x38320e.length ? _0x38320e.reduce((_0xd5b24c, _0x3a3361) => _0xd5b24c + _0x3a3361.durationSec, 0) : normalizeDurationSeconds(_0x1a9b63?.durationSec || _0x1a9b63?.durationSeconds || _0x1a9b63?.duration);
  const _0x19c73e = buildAssetLookup(assets);
  const _0x33447d = _0x38320e.length ? normalizeStoryAssetUsages(_0x38320e.flatMap(_0x567c34 => _0x567c34.assetUsages)) : normalizeStoryAssetUsages(_0x1a9b63?.assetUsages, _0x1a9b63?.assetRefs || _0x1a9b63?.assetIds);
  const _0x19bba4 = deriveStoryAssetRefs(_0x33447d);
  const _0x3160f2 = normalizeText(_0x1a9b63?.creativeIntent);
  const _0x4e231a = normalizeText(_0x1a9b63?.transition);
  const _0x51c779 = {
    ..._0x1a9b63,
    id: _0x5c2c3d,
    planningRef: _0x527cdc,
    number: _0x78f82e,
    title: normalizeText(_0x1a9b63?.title) || "片段 " + _0x78f82e,
    script: normalizeText(_0x1a9b63?.script),
    promptMode: _0x952ab1,
    creativeIntent: _0x3160f2,
    transition: _0x4e231a,
    shots: _0x38320e,
    prompt: buildStoryEpisodeClipPrompt({
      clip: {
        ..._0x1a9b63,
        creativeIntent: _0x3160f2,
        transition: _0x4e231a,
        shots: _0x38320e
      },
      assets: assets,
      visualStyle: visualStyle,
      promptMode: _0x952ab1,
      includeDialogueVoiceGuidance: includeDialogueVoiceGuidance
    }),
    durationSec: _0x1cd5e2,
    duration: formatStoryClipDuration(_0x1cd5e2),
    assetUsages: _0x33447d,
    assetRefs: _0x19bba4,
    assetIds: resolveAssetIds(_0x19bba4, _0x19c73e),
    result: _0x1a9b63?.result && typeof _0x1a9b63.result === "object" ? {
      ..._0x1a9b63.result
    } : {
      status: "idle",
      taskId: "",
      videoUrl: "",
      error: ""
    }
  };
  return preserveMediaFields(_0x51c779, existingClip, canPreserveStoryEpisodeClipMedia(_0x51c779, existingClip, preserveMedia));
}
export function insertStoryEpisodeClip(_0xa5f264 = {}, _0x248178 = "", {
  durationSec: _0x31b8c0 = 5,
  promptMode = _0xa5f264?.promptMode
} = {}) {
  const _0x36f238 = Array.isArray(_0xa5f264?.clips) ? _0xa5f264.clips : [];
  const _0xcd3f8b = _0x36f238.findIndex(_0x31027c => normalizeText(_0x31027c?.id) === normalizeText(_0x248178));
  if (_0xcd3f8b < 0) {
    return null;
  }
  const _0x558df2 = normalizeText(_0xa5f264?.id) || "episode-1";
  const _0x473a02 = new Set(_0x36f238.map(_0x4cba6d => normalizeText(_0x4cba6d?.id)).filter(Boolean));
  let _0x25e198 = _0x36f238.length + 1;
  let _0x38acb4 = _0x558df2 + "-clip-manual-" + _0x25e198;
  while (_0x473a02.has(_0x38acb4)) {
    _0x25e198 += 1;
    _0x38acb4 = _0x558df2 + "-clip-manual-" + _0x25e198;
  }
  const _0x3b92bb = normalizeDurationSeconds(_0x31b8c0) || 5;
  const _0x235155 = {
    id: _0x38acb4,
    planningRef: "manual-clip-" + _0x25e198,
    number: _0xcd3f8b + 2,
    title: "新片段",
    script: "",
    promptMode: normalizeText(promptMode) ? normalizeStoryPromptMode(promptMode, {
      allowDeveloperModes: true
    }) : "",
    creativeIntent: "",
    transition: "",
    shots: [],
    prompt: "",
    durationSec: _0x3b92bb,
    duration: formatStoryClipDuration(_0x3b92bb),
    assetUsages: [],
    assetRefs: [],
    assetIds: [],
    result: {
      status: "idle",
      taskId: "",
      videoUrl: "",
      error: ""
    }
  };
  const _0x3b241a = [..._0x36f238.slice(0, _0xcd3f8b + 1), _0x235155, ..._0x36f238.slice(_0xcd3f8b + 1)].map((_0x5c9518, _0x4e07b4) => ({
    ..._0x5c9518,
    number: _0x4e07b4 + 1
  }));
  const _0x5cc924 = _0x3b241a.reduce((_0x1a8aa4, _0x1ea0d3) => _0x1a8aa4 + normalizeDurationSeconds(_0x1ea0d3?.durationSec || _0x1ea0d3?.durationSeconds || _0x1ea0d3?.duration), 0);
  return {
    episode: {
      ..._0xa5f264,
      clips: _0x3b241a,
      clipCount: _0x3b241a.length,
      durationSec: _0x5cc924,
      duration: formatStoryClockDuration(_0x5cc924),
      status: deriveStoryEpisodeStatus(_0x3b241a)
    },
    clip: _0x3b241a[_0xcd3f8b + 1]
  };
}
export function removeStoryEpisodeClip(_0x389f0a = {}, _0x402c16 = "") {
  const _0x2bcba3 = Array.isArray(_0x389f0a?.clips) ? _0x389f0a.clips : [];
  const _0x248d43 = _0x2bcba3.findIndex(_0x36ab2a => normalizeText(_0x36ab2a?.id) === normalizeText(_0x402c16));
  if (_0x248d43 < 0) {
    return null;
  }
  const _0x47787a = _0x2bcba3[_0x248d43];
  const _0x1d7287 = _0x2bcba3.filter((_0x17b159, _0x3be138) => _0x3be138 !== _0x248d43).map((_0x977016, _0x132617) => ({
    ..._0x977016,
    number: _0x132617 + 1
  }));
  const _0x4c55a9 = _0x1d7287.reduce((_0xfa877b, _0x409dee) => _0xfa877b + normalizeDurationSeconds(_0x409dee?.durationSec || _0x409dee?.durationSeconds || _0x409dee?.duration), 0);
  return {
    episode: {
      ..._0x389f0a,
      clips: _0x1d7287,
      clipCount: _0x1d7287.length,
      durationSec: _0x4c55a9,
      duration: formatStoryClockDuration(_0x4c55a9),
      status: deriveStoryEpisodeStatus(_0x1d7287)
    },
    removedClip: _0x47787a,
    nextClip: _0x1d7287[Math.min(_0x248d43, _0x1d7287.length - 1)] || null
  };
}
export function mergeStoryEpisodeSplit(_0x5c3c32 = {}, _0x3c7000 = {}, {
  assets = [],
  preserveMedia = true,
  visualStyle = "",
  promptMode = _0x5c3c32?.promptMode || "seedance-2.0",
  videoModelId = "",
  includeContinuityHandoffs = false,
  includeDialogueVoiceGuidance = false
} = {}) {
  const _0x3f4266 = normalizeStoryPromptMode(promptMode, {
    allowDeveloperModes: true
  });
  const _0x29d0bb = Array.isArray(_0x5c3c32?.clips) ? _0x5c3c32.clips : [];
  const _0x580340 = Array.isArray(_0x3c7000?.clips) ? _0x3c7000.clips : [];
  const _0x4bb8c6 = includeContinuityHandoffs ? addStoryEpisodeClipContinuityHandoffs(_0x580340, assets) : _0x580340;
  const _0x4fa47f = normalizeText(_0x5c3c32?.id) || "episode-1";
  const _0xc3159b = new Set();
  const _0x4a1dc2 = _0x4bb8c6.map((_0x3ff751, _0x88262b) => {
    const _0x2c5d2f = findMatchingClip(_0x29d0bb, _0x3ff751, _0x88262b, _0xc3159b);
    if (_0x2c5d2f) {
      _0xc3159b.add(_0x2c5d2f);
    }
    return normalizeStoryEpisodeClip({
      ..._0x3ff751,
      title: formatGeneratedStoryClipTitle(_0x88262b)
    }, _0x88262b, {
      episodeId: _0x4fa47f,
      assets: assets,
      existingClip: _0x2c5d2f,
      preserveMedia: preserveMedia,
      visualStyle: visualStyle,
      promptMode: _0x3f4266,
      includeDialogueVoiceGuidance: includeDialogueVoiceGuidance
    });
  });
  const _0x51128d = ensureUniqueStoryEpisodeClipIds({
    id: _0x4fa47f,
    clips: _0x4a1dc2
  }).clips;
  const _0x362bb6 = _0x51128d.reduce((_0x3485df, _0x30b762) => _0x3485df + _0x30b762.durationSec, 0);
  const _0x3ffc06 = deriveStoryEpisodeAssetSummary({
    ..._0x5c3c32,
    clips: _0x51128d
  }, assets);
  const _0x4577ce = {
    ..._0x5c3c32,
    promptMode: _0x3f4266,
    ...(normalizeText(videoModelId) ? {
      videoModelId: normalizeText(videoModelId)
    } : {}),
    assetRefs: _0x3ffc06.assetRefs,
    assetIds: _0x3ffc06.assetIds,
    characterCount: _0x3ffc06.characterCount,
    sceneCount: _0x3ffc06.sceneCount,
    propCount: _0x3ffc06.propCount,
    clips: _0x51128d,
    clipCount: _0x51128d.length,
    durationSec: _0x362bb6,
    duration: formatStoryClockDuration(_0x362bb6),
    status: deriveStoryEpisodeStatus(_0x51128d),
    ...(typeof _0x3c7000?.rawResponse === "string" ? {
      splitRawResponse: _0x3c7000.rawResponse
    } : {})
  };
  return preserveMediaFields(_0x4577ce, _0x5c3c32, preserveMedia);
}
function isStoryEpisodeSplitTransportErrorEnvelope(_0x12afff) {
  const _0x1a1634 = normalizeText(_0x12afff);
  if (!_0x1a1634) {
    return false;
  }
  let _0x13eeea;
  try {
    _0x13eeea = JSON.parse(_0x1a1634);
  } catch {
    return false;
  }
  if (!_0x13eeea || typeof _0x13eeea !== "object" || Array.isArray(_0x13eeea)) {
    return false;
  }
  const _0xbe1e5f = Object.keys(_0x13eeea);
  const _0x28dae5 = new Set(["error", "code", "message", "status", "statusCode", "details"]);
  return Object.prototype.hasOwnProperty.call(_0x13eeea, "error") && _0xbe1e5f.length > 0 && _0xbe1e5f.every(_0x1cf12d => _0x28dae5.has(_0x1cf12d));
}
export function discardStaleStoryEpisodeSplitTransportDraft(_0x30c279 = {}) {
  const _0x4e00ac = Array.isArray(_0x30c279?.clips) ? _0x30c279.clips : [];
  const _0x1d08f2 = _0x30c279?.splitDraft;
  if (!_0x4e00ac.length || !_0x1d08f2 || typeof _0x1d08f2 !== "object" || Array.isArray(_0x1d08f2)) {
    return _0x30c279;
  }
  const _0x4d31aa = Array.isArray(_0x1d08f2.clips) && _0x1d08f2.clips.length > 0 || Array.isArray(_0x1d08f2.items) && _0x1d08f2.items.some(_0x58e3db => Array.isArray(_0x58e3db?.clips) && _0x58e3db.clips.length > 0 || Array.isArray(_0x58e3db?.rawClips) && _0x58e3db.rawClips.length > 0);
  if (_0x4d31aa || !isStoryEpisodeSplitTransportErrorEnvelope(_0x1d08f2.rawResponse)) {
    return _0x30c279;
  }
  const {
    splitDraft: _0x22d5f2,
    ..._0x43e152
  } = _0x30c279;
  return _0x43e152;
}