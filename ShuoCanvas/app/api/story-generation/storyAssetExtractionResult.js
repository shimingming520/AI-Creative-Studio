import { parseStrictJson } from "../utils/strictJson.js";
import { normalizeStringArray, normalizeText } from "../utils/storyGenerationValues.js";
import { sanitizeStoryAssetPublicDescriptionText, sanitizeStoryAssetPublicPromptText } from "../utils/storyAssetPublicText.js";
import { STORY_ASSET_COMPACT_RESPONSE_SCHEMA_VERSION, createStoryAssetPromptContracts } from "./storyAssetExtractionRequest.js";
import { getResultText } from "./storyTextRequest.js";
export const STORY_ASSET_EXTRACTION_SCHEMA_VERSION = 2;
export const STORY_ASSET_EXTRACTION_KINDS = Object.freeze(["character", "scene", "prop"]);
const STORY_ASSET_PUBLIC_PROMPT_MAX_CHARACTERS = 1200;
const STORY_ASSET_SOURCE_CHAPTER_MAX_ITEMS = 100;
const STORY_CHARACTER_VOICE_DESCRIPTION_FIELDS = Object.freeze(["年龄", "性别", "身份", "口音", "情绪底色", "声线", "语速", "说话方式", "音色特征"]);
export function normalizeStoryAssetReference(_0x273918, _0x2601db) {
  return normalizeText(_0x273918).replace(/\s+/g, "-") || _0x2601db;
}
function assertStoryCharacterVoiceDescription(_0x3eff4f, _0x21d2e6 = "角色") {
  const _0x1a0b16 = normalizeText(_0x3eff4f);
  const _0x10997b = STORY_CHARACTER_VOICE_DESCRIPTION_FIELDS.filter(_0x346298 => !new RegExp(_0x346298 + "\\s*[：:]", "u").test(_0x1a0b16));
  if (_0x10997b.length) {
    throw new Error("Agent 返回的人物“" + (normalizeText(_0x21d2e6) || "角色") + "”声音设定缺少：" + _0x10997b.join("、") + "。");
  }
  return _0x1a0b16;
}
function assertConciseStoryAssetName(_0x43230e, _0x380ac5) {
  const _0x5dfc94 = _0x380ac5 === "character" ? 12 : 20;
  if ([..._0x43230e].length > _0x5dfc94 || /[，,。；;\n]/u.test(_0x43230e) || /^(?:角色名|人物名|姓名|名称)\s*[:：]/u.test(_0x43230e)) {
    const _0x12dbc6 = _0x380ac5 === "character" ? "角色" : _0x380ac5 === "prop" ? "道具" : "场景";
    throw new Error(_0x12dbc6 + "名称必须是姓名或简短身份名，不能包含人物说明：" + _0x43230e);
  }
}
function assertStoryCharacterRole(_0x47e87b) {
  if (!["主角", "配角", "反派", "路人"].includes(normalizeText(_0x47e87b))) {
    throw new Error("角色 role 只能是主角、配角、反派或路人，人物说明必须写入 description。");
  }
}
export function createStoryAssetExtractionResponseSchema(_0x1e4d1a = STORY_ASSET_EXTRACTION_KINDS) {
  const _0x2d42d6 = normalizeStringArray(_0x1e4d1a).filter(_0x53cd7c => STORY_ASSET_EXTRACTION_KINDS.includes(_0x53cd7c));
  const _0x2fb6f6 = _0x2d42d6.length ? _0x2d42d6 : [...STORY_ASSET_EXTRACTION_KINDS];
  const _0x27f178 = {
    type: "array",
    maxItems: STORY_ASSET_SOURCE_CHAPTER_MAX_ITEMS,
    items: {
      type: "string"
    }
  };
  return {
    type: "object",
    additionalProperties: false,
    required: ["assets"],
    properties: {
      assets: {
        type: "array",
        minItems: 0,
        maxItems: 128,
        items: {
          type: "object",
          additionalProperties: false,
          required: ["ref", "kind", "name", "role", "description", "voiceDescription", "occurrences", "sourceChapterIds", "appearances"],
          properties: {
            ref: {
              type: "string",
              maxLength: 64
            },
            kind: {
              type: "string",
              enum: _0x2fb6f6
            },
            name: {
              type: "string",
              maxLength: _0x2fb6f6.length === 1 && _0x2fb6f6[0] === "character" ? 12 : 20
            },
            role: {
              type: "string",
              maxLength: 16
            },
            description: {
              type: "string",
              maxLength: 320
            },
            voiceDescription: {
              type: "string",
              maxLength: 240
            },
            occurrences: {
              type: "string",
              maxLength: 160
            },
            sourceChapterIds: _0x27f178,
            appearances: {
              type: "array",
              minItems: 1,
              maxItems: _0x2fb6f6.length === 1 && _0x2fb6f6[0] === "character" ? 4 : 1,
              items: {
                type: "object",
                additionalProperties: false,
                required: ["ref", "name", "description", "occurrences", "sourceChapterIds", "prompt"],
                properties: {
                  ref: {
                    type: "string",
                    maxLength: 64
                  },
                  name: {
                    type: "string",
                    maxLength: 32
                  },
                  description: {
                    type: "string",
                    maxLength: 320
                  },
                  occurrences: {
                    type: "string",
                    maxLength: 160
                  },
                  sourceChapterIds: _0x27f178,
                  prompt: {
                    type: "string",
                    maxLength: STORY_ASSET_PUBLIC_PROMPT_MAX_CHARACTERS
                  }
                }
              }
            }
          }
        }
      }
    }
  };
}
export function createStoryAssetCompactExtractionResponseSchema(_0x14ad7b = STORY_ASSET_EXTRACTION_KINDS, _0x3c71a3 = []) {
  const _0x5ee8e5 = normalizeStringArray(_0x14ad7b).filter(_0x3364b6 => STORY_ASSET_EXTRACTION_KINDS.includes(_0x3364b6));
  const _0x4b05f4 = _0x5ee8e5.length === 1 ? _0x5ee8e5[0] : "";
  const _0xaac0a2 = normalizeStringArray(_0x3c71a3);
  const _0x28db20 = _0xaac0a2.length;
  return {
    type: "object",
    additionalProperties: false,
    required: ["assets"],
    properties: {
      assets: {
        type: "array",
        minItems: _0x28db20,
        maxItems: _0x28db20,
        items: {
          type: "object",
          additionalProperties: false,
          required: ["clientKey", "include", "description", "visualPrompt", "voiceDescription"],
          properties: {
            clientKey: {
              type: "string",
              maxLength: 12,
              ...(_0xaac0a2.length ? {
                enum: _0xaac0a2
              } : {})
            },
            include: {
              type: "boolean"
            },
            description: {
              type: "string",
              maxLength: 120
            },
            visualPrompt: {
              type: "string",
              maxLength: _0x4b05f4 === "character" ? 360 : _0x4b05f4 === "scene" ? 320 : 280
            },
            voiceDescription: {
              type: "string",
              maxLength: _0x4b05f4 === "character" ? 180 : 0
            }
          }
        }
      }
    }
  };
}
function normalizeStoryAssetExtractionKind(_0x5f4976, _0x1c9cc0 = "") {
  const _0x59c0a7 = normalizeText(_0x5f4976).toLowerCase();
  const _0x33fed2 = {
    character: "character",
    characters: "character",
    person: "character",
    people: "character",
    role: "character",
    角色: "character",
    人物: "character",
    scene: "scene",
    scenes: "scene",
    setting: "scene",
    settings: "scene",
    location: "scene",
    locations: "scene",
    场景: "scene",
    地点: "scene",
    prop: "prop",
    props: "prop",
    item: "prop",
    items: "prop",
    object: "prop",
    objects: "prop",
    道具: "prop",
    物品: "prop"
  };
  return _0x33fed2[_0x59c0a7] || normalizeText(_0x1c9cc0);
}
function getStoryAssetExtractionRawAssets(_0x4c491e, _0x46896c = STORY_ASSET_EXTRACTION_KINDS) {
  if (Array.isArray(_0x4c491e)) {
    return _0x4c491e;
  }
  if (!_0x4c491e || typeof _0x4c491e !== "object") {
    return [];
  }
  const _0x4c354b = normalizeStringArray(_0x46896c).filter(_0x15656b => STORY_ASSET_EXTRACTION_KINDS.includes(_0x15656b));
  const _0x53f85d = _0x4c354b.length === 1 ? _0x4c354b[0] : "";
  const _0x9ed5d9 = {
    character: ["characters", "characterAssets", "roles", "人物", "角色", "角色资产"],
    scene: ["scenes", "sceneAssets", "settings", "locations", "场景", "场景资产"],
    prop: ["props", "propAssets", "items", "objects", "道具", "道具资产"]
  };
  const _0x36edee = [_0x4c491e, _0x4c491e.result, _0x4c491e.data].filter(_0x15461e => _0x15461e && typeof _0x15461e === "object" && !Array.isArray(_0x15461e));
  const _0x4c0848 = _0x36edee.map(_0x5a5e96 => _0x5a5e96.assets);
  const _0x5a1281 = _0x4c0848.find(_0x2007e5 => Array.isArray(_0x2007e5) && _0x2007e5.length);
  if (_0x5a1281) {
    return _0x5a1281;
  }
  const _0xcc64ab = [..._0x36edee, ..._0x36edee.map(_0x52910f => _0x52910f.assets)].filter(_0x3a09c1 => _0x3a09c1 && typeof _0x3a09c1 === "object" && !Array.isArray(_0x3a09c1));
  const _0x467398 = [];
  const _0x310f3a = _0x53f85d ? [_0x53f85d] : _0x4c354b;
  for (const _0x5891c1 of _0x310f3a) {
    let _0x2020e2 = null;
    for (const _0x218091 of _0xcc64ab) {
      _0x2020e2 = _0x9ed5d9[_0x5891c1].map(_0x181ffe => _0x218091[_0x181ffe]).find(_0x2b7c25 => Array.isArray(_0x2b7c25) && _0x2b7c25.length);
      if (_0x2020e2) {
        break;
      }
    }
    if (!_0x2020e2) {
      continue;
    }
    _0x467398.push(..._0x2020e2.map(_0x1e52ab => _0x1e52ab && typeof _0x1e52ab === "object" && !Array.isArray(_0x1e52ab) ? {
      ..._0x1e52ab,
      kind: _0x1e52ab.kind || _0x5891c1
    } : _0x1e52ab));
  }
  if (_0x467398.length) {
    return _0x467398;
  }
  const _0x583dde = [];
  for (const _0x383cc2 of _0x36edee) {
    if (_0x53f85d) {
      for (const _0x4f34bc of _0x9ed5d9[_0x53f85d]) {
        _0x583dde.push(_0x383cc2[_0x4f34bc]);
      }
    }
    _0x583dde.push(_0x383cc2.assets);
  }
  return _0x583dde.find(_0x4b1399 => Array.isArray(_0x4b1399) && _0x4b1399.length) || _0x583dde.find(Array.isArray) || [];
}
export function parseStoryAssetExtractionResult(_0x222e88, {
  chapterIds = [],
  allowedKinds = STORY_ASSET_EXTRACTION_KINDS,
  allowEmptyResult = false
} = {}) {
  const _0x43bc90 = parseStrictJson(getResultText(_0x222e88), "Agent 未返回资产提取结果。");
  const _0x5d8ada = new Set(normalizeStringArray(chapterIds));
  const _0x538ace = normalizeStringArray(allowedKinds).filter(_0x5dbc95 => STORY_ASSET_EXTRACTION_KINDS.includes(_0x5dbc95));
  const _0x493b5d = new Set(_0x538ace);
  const _0x2dd62d = _0x538ace.length === 1 ? _0x538ace[0] : "";
  const _0x106679 = getStoryAssetExtractionRawAssets(_0x43bc90, _0x538ace);
  const _0x49546d = Array.isArray(_0x106679) ? _0x106679.map((_0x330892, _0x3f983a) => {
    const _0x30dabc = normalizeStoryAssetExtractionKind(_0x330892?.kind, _0x2dd62d);
    const _0x470fd0 = normalizeText(_0x330892?.name || _0x330892?.characterName || _0x330892?.sceneName || _0x330892?.propName || _0x330892?.名称 || _0x330892?.角色名 || _0x330892?.场景名 || _0x330892?.道具名);
    if (!_0x470fd0 || !STORY_ASSET_EXTRACTION_KINDS.includes(_0x30dabc)) {
      return null;
    }
    if (_0x493b5d.size && !_0x493b5d.has(_0x30dabc)) {
      throw new Error("Agent 在本轮返回了未请求的资产类型“" + _0x30dabc + "”。");
    }
    assertConciseStoryAssetName(_0x470fd0, _0x30dabc);
    if (_0x30dabc === "character") {
      assertStoryCharacterRole(_0x330892?.role);
    }
    const _0x3d3aba = _0x30dabc === "character" ? assertStoryCharacterVoiceDescription(_0x330892?.voiceDescription, _0x470fd0) : "";
    const _0x505c10 = normalizeStoryAssetReference(_0x330892?.ref, "asset-" + (_0x3f983a + 1));
    const _0x50fa65 = normalizeStringArray(_0x330892?.sourceChapterIds);
    if (_0x5d8ada.size) {
      const _0x37e50c = _0x50fa65.filter(_0x3b9180 => !_0x5d8ada.has(_0x3b9180));
      if (_0x37e50c.length) {
        throw new Error("资产“" + _0x470fd0 + "”引用了不存在的章节：" + _0x37e50c.join("、") + "。");
      }
    }
    const _0x1b4b35 = Array.isArray(_0x330892?.appearances) ? _0x330892.appearances : [];
    if (!_0x1b4b35.length) {
      throw new Error("资产“" + _0x470fd0 + "”缺少形象和图片提示词。");
    }
    const _0x44294a = _0x30dabc === "prop" && _0x1b4b35.length > 1 ? [{
      ref: _0x505c10 + "-base",
      name: "基础形象",
      description: normalizeStringArray(_0x1b4b35.map(_0x116cfa => {
        const _0xc97222 = normalizeText(_0x116cfa?.name);
        const _0x3a7936 = normalizeText(_0x116cfa?.description);
        if (_0xc97222 && _0x3a7936) {
          return _0xc97222 + "：" + _0x3a7936;
        }
        return _0x3a7936 || _0xc97222;
      })).join("；"),
      occurrences: normalizeStringArray(_0x1b4b35.map(_0x98153c => normalizeText(_0x98153c?.occurrences))).join("、") || _0x330892?.occurrences,
      sourceChapterIds: normalizeStringArray(_0x1b4b35.flatMap(_0x41efc0 => Array.isArray(_0x41efc0?.sourceChapterIds) ? _0x41efc0.sourceChapterIds : [])).length ? normalizeStringArray(_0x1b4b35.flatMap(_0x18be54 => _0x18be54.sourceChapterIds)) : _0x50fa65,
      prompt: _0x1b4b35.map(_0x4fe15a => normalizeText(_0x4fe15a?.prompt)).find(Boolean)
    }] : _0x1b4b35;
    const _0x2b2f29 = _0x44294a.map((_0x1ca8cf, _0x412494) => {
      const _0x3fd6c9 = normalizeText(_0x1ca8cf?.name);
      if (!_0x3fd6c9) {
        throw new Error("资产“" + _0x470fd0 + "”的第 " + (_0x412494 + 1) + " 个形象缺少具体形象名称。");
      }
      return {
        ref: normalizeStoryAssetReference(_0x1ca8cf?.ref, _0x505c10 + "-appearance-" + (_0x412494 + 1)),
        name: _0x3fd6c9,
        description: sanitizeStoryAssetPublicDescriptionText(_0x1ca8cf?.description),
        occurrences: sanitizeStoryAssetPublicDescriptionText(_0x1ca8cf?.occurrences || _0x330892?.occurrences),
        sourceChapterIds: normalizeStringArray(_0x1ca8cf?.sourceChapterIds?.length ? _0x1ca8cf.sourceChapterIds : _0x50fa65),
        prompt: sanitizeStoryAssetPublicPromptText(_0x1ca8cf?.prompt)
      };
    });
    if (_0x2b2f29.some(_0x38622c => !_0x38622c.prompt)) {
      throw new Error("资产“" + _0x470fd0 + "”存在缺少图片提示词的形象。");
    }
    for (const _0x5b6ea0 of _0x2b2f29) {
      if (!_0x5d8ada.size) {
        continue;
      }
      const _0x41aceb = _0x5b6ea0.sourceChapterIds.filter(_0x15bb62 => !_0x5d8ada.has(_0x15bb62));
      if (_0x41aceb.length) {
        throw new Error("资产“" + _0x470fd0 + "”的形象引用了不存在的章节：" + _0x41aceb.join("、") + "。");
      }
    }
    return {
      ref: _0x505c10,
      kind: _0x30dabc,
      name: _0x470fd0,
      role: normalizeText(_0x330892?.role),
      description: sanitizeStoryAssetPublicDescriptionText(_0x330892?.description),
      voiceDescription: sanitizeStoryAssetPublicDescriptionText(_0x3d3aba),
      occurrences: sanitizeStoryAssetPublicDescriptionText(_0x330892?.occurrences),
      sourceChapterIds: _0x50fa65,
      appearances: _0x2b2f29
    };
  }).filter(Boolean) : [];
  const _0x39c92f = Boolean(allowEmptyResult) || _0x538ace.length === 1 && _0x538ace[0] === "prop";
  if (!_0x49546d.length && !_0x39c92f) {
    const _0x257455 = _0x43bc90 && typeof _0x43bc90 === "object" && !Array.isArray(_0x43bc90) ? Object.keys(_0x43bc90).slice(0, 12) : [];
    const _0x394065 = _0x538ace.length === 1 ? {
      character: "角色",
      scene: "场景",
      prop: "道具"
    }[_0x538ace[0]] || "资产" : "角色或场景";
    const _0x5c36ee = new Error("Agent 返回结果没有可用的" + _0x394065 + "资产。");
    _0x5c36ee.raw = {
      allowedKinds: _0x538ace,
      topLevelKeys: _0x257455,
      returnedAssetCount: _0x106679.length
    };
    throw _0x5c36ee;
  }
  const _0x279398 = _0x49546d.map(_0x19c067 => _0x19c067.ref);
  if (new Set(_0x279398).size !== _0x279398.length) {
    throw new Error("Agent 返回了重复的资产引用。");
  }
  return {
    schemaVersion: STORY_ASSET_EXTRACTION_SCHEMA_VERSION,
    assets: _0x49546d
  };
}
function createStoryAssetCompactOccurrence(_0x1b3bc5 = []) {
  const _0x153f1b = normalizeStringArray(_0x1b3bc5).map(_0x42c5c4 => {
    const _0x5ad474 = normalizeText(_0x42c5c4).match(/(\d+)\s*$/u)?.[1];
    return _0x5ad474 || normalizeText(_0x42c5c4).replace(/^episode[-_\s]*/iu, "").replace(/^chapter[-_\s]*/iu, "");
  }).filter(Boolean);
  return "第" + (_0x153f1b.join("、") || "相关") + "集";
}
export function parseStoryAssetCompactExtractionResult(_0x2a5154, {
  assetKinds = STORY_ASSET_EXTRACTION_KINDS,
  chapterIds = [],
  requiredAssetNamesByKind = null,
  requiredAssetsByKind = null,
  candidateAssetsByKind = null,
  contractSnapshot = null
} = {}) {
  const _0x33861a = parseStrictJson(getResultText(_0x2a5154), "Agent 未返回紧凑资产结果。");
  const _0x704750 = Array.isArray(_0x33861a?.assets) ? _0x33861a.assets : [];
  const _0x47a6fa = contractSnapshot && typeof contractSnapshot === "object" && Number(contractSnapshot.responseSchemaVersion) === STORY_ASSET_COMPACT_RESPONSE_SCHEMA_VERSION ? {
    requiredAssets: Array.isArray(contractSnapshot.requiredAssets) ? contractSnapshot.requiredAssets : [],
    candidateAssets: Array.isArray(contractSnapshot.candidateAssets) ? contractSnapshot.candidateAssets : []
  } : createStoryAssetPromptContracts(assetKinds, requiredAssetNamesByKind, candidateAssetsByKind, requiredAssetsByKind, {
    includeClientKeys: true
  }).payload;
  const _0x82f950 = Array.isArray(_0x47a6fa.requiredAssets) ? _0x47a6fa.requiredAssets : [];
  const _0x5d5206 = Array.isArray(_0x47a6fa.candidateAssets) ? _0x47a6fa.candidateAssets : [];
  const _0xb8b1f0 = [..._0x82f950, ..._0x5d5206];
  const _0x416f50 = new Map(_0xb8b1f0.map(_0x234dd4 => [normalizeText(_0x234dd4?.clientKey), _0x234dd4]));
  if (_0x416f50.size !== _0xb8b1f0.length || [..._0x416f50.keys()].some(_0x5a2fa8 => !_0x5a2fa8)) {
    throw new Error("客户端紧凑资产合同包含空或重复 clientKey。");
  }
  const _0x42e48e = new Set(_0x82f950.map(_0x54ef0f => normalizeText(_0x54ef0f?.clientKey)));
  const _0x2e75ec = new Map();
  _0x704750.forEach((_0xb17086, _0x4d35ea) => {
    const _0x1de090 = normalizeText(_0xb17086?.clientKey);
    if (!_0x416f50.has(_0x1de090)) {
      throw new Error("Agent 紧凑结果返回了未知 clientKey：" + (_0x1de090 || "第" + (_0x4d35ea + 1) + "行") + "。");
    }
    if (_0x2e75ec.has(_0x1de090)) {
      throw new Error("Agent 紧凑结果重复返回 clientKey：" + _0x1de090 + "。");
    }
    if (typeof _0xb17086?.include !== "boolean") {
      throw new Error("Agent 紧凑结果中的 " + _0x1de090 + " 缺少明确 include 裁决。");
    }
    if (_0x42e48e.has(_0x1de090) && _0xb17086.include === false) {
      throw new Error("Agent 紧凑结果试图排除必需资产 " + _0x1de090 + "；必需资产不能排除。");
    }
    _0x2e75ec.set(_0x1de090, _0xb17086);
  });
  const _0x37adaf = _0xb8b1f0.filter(_0x17101a => !_0x2e75ec.has(_0x17101a.clientKey)).map(_0x477133 => _0x477133.clientKey);
  if (_0x37adaf.length) {
    throw new Error("Agent 紧凑结果缺少合同裁决：" + _0x37adaf.slice(0, 8).join("、") + "。");
  }
  if (_0x704750.length !== _0xb8b1f0.length) {
    throw new Error("Agent 紧凑结果必须返回 " + _0xb8b1f0.length + " 条合同裁决，实际返回 " + _0x704750.length + " 条。");
  }
  const _0x4117ec = new Set();
  const _0x5a3a64 = _0xb8b1f0.map(_0x9ae5d4 => {
    const _0x4e1e8a = _0x2e75ec.get(_0x9ae5d4.clientKey);
    const _0x4b376d = normalizeStoryAssetExtractionKind(_0x9ae5d4.kind);
    const _0x50bdce = normalizeText(_0x9ae5d4.name);
    const _0x266ff = _0x4b376d + ":" + _0x50bdce.normalize("NFKC").toLowerCase();
    if (!_0x4b376d || !_0x50bdce) {
      throw new Error("客户端紧凑资产合同 " + _0x9ae5d4.clientKey + " 缺少 kind 或 name。");
    }
    const _0x175c11 = _0x4e1e8a.include === true;
    const _0x2a09f3 = sanitizeStoryAssetPublicDescriptionText(_0x4e1e8a.description);
    const _0x4b2ae0 = sanitizeStoryAssetPublicPromptText(_0x4e1e8a.visualPrompt);
    const _0x296b9a = sanitizeStoryAssetPublicDescriptionText(_0x4e1e8a.voiceDescription);
    if (_0x175c11 && !_0x2a09f3) {
      throw new Error("Agent 紧凑结果中的“" + _0x50bdce + "”缺少最终 description。");
    }
    if (_0x175c11 && !_0x4b2ae0) {
      throw new Error("Agent 紧凑结果中的“" + _0x50bdce + "”缺少最终 visualPrompt。");
    }
    const _0x46200c = _0x175c11 && _0x4b376d === "character" ? assertStoryCharacterVoiceDescription(_0x296b9a, _0x50bdce) : "";
    if (_0x175c11 && _0x4b376d !== "character" && _0x296b9a) {
      throw new Error("Agent 紧凑结果中的非角色资产“" + _0x50bdce + "”不得返回 voiceDescription。");
    }
    return {
      clientKey: _0x9ae5d4.clientKey,
      kind: _0x4b376d,
      name: _0x50bdce,
      required: _0x42e48e.has(_0x9ae5d4.clientKey),
      include: _0x175c11,
      description: _0x2a09f3,
      visualPrompt: _0x4b2ae0,
      voiceDescription: _0x46200c,
      sourceSceneRefs: normalizeStringArray(_0x9ae5d4.sourceSceneRefs),
      sourceChapterIds: normalizeStringArray(_0x9ae5d4.sourceChapterIds)
    };
  });
  const _0x55a6e3 = _0xb8b1f0.flatMap(_0x456870 => {
    const _0x44cbd9 = _0x5a3a64.find(_0x565548 => _0x565548.clientKey === _0x456870.clientKey);
    if (!_0x44cbd9?.include) {
      return [];
    }
    const {
      kind: _0xfcb247,
      name: _0x32920f,
      description: _0x470a5c,
      visualPrompt: _0x3f9abc,
      voiceDescription: _0x2b832e
    } = _0x44cbd9;
    const _0x55b950 = _0xfcb247 + ":" + _0x32920f.normalize("NFKC").toLowerCase();
    if (_0x4117ec.has(_0x55b950)) {
      throw new Error("Agent 紧凑结果返回了重复资产名称“" + _0x32920f + "”。");
    }
    _0x4117ec.add(_0x55b950);
    const _0x3c57be = normalizeStringArray(_0x456870.sourceChapterIds).filter(_0x218ff7 => !chapterIds.length || chapterIds.includes(_0x218ff7));
    const _0x4d9071 = createStoryAssetCompactOccurrence(_0x3c57be);
    const _0x4e752f = normalizeStoryAssetReference(_0x456870.clientKey, _0xfcb247 + "-asset");
    const _0xbeb772 = _0xfcb247 === "character" ? "日常形象" : _0xfcb247 === "scene" ? "标准环境" : "标准状态";
    return [{
      ref: _0x4e752f,
      kind: _0xfcb247,
      name: _0x32920f,
      role: _0xfcb247 === "character" ? ["主角", "配角", "反派", "路人"].includes(normalizeText(_0x456870.role)) ? normalizeText(_0x456870.role) : "配角" : _0xfcb247 === "scene" ? "剧情场景" : "关键道具",
      description: _0x470a5c,
      voiceDescription: _0x2b832e,
      occurrences: _0x4d9071,
      sourceChapterIds: _0x3c57be,
      sourceSceneRefs: normalizeStringArray(_0x456870.sourceSceneRefs),
      appearances: [{
        ref: _0x4e752f + "-base",
        name: _0xbeb772,
        description: _0x470a5c,
        occurrences: _0x4d9071,
        sourceChapterIds: _0x3c57be,
        prompt: _0x3f9abc
      }]
    }];
  });
  return {
    schemaVersion: STORY_ASSET_EXTRACTION_SCHEMA_VERSION,
    responseSchemaVersion: STORY_ASSET_COMPACT_RESPONSE_SCHEMA_VERSION,
    assets: _0x55a6e3,
    decisions: _0x5a3a64
  };
}