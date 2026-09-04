import { generateText } from "./aiTextApi.js";
import { parseStrictJson } from "./utils/strictJson.js";
import { getStorySceneIdentityKey, normalizeStorySceneHeadingIdentity, storySceneIdentitiesOverlap } from "./utils/storySceneIdentity.js";
import { sanitizeStoryAssetPublicPromptText, stripStoryAssetInternalEvidenceMetadata } from "./utils/storyAssetPublicText.js";
import { STORY_ASSET_EXTRACTION_SCHEMA_VERSION, parseStoryAssetExtractionResult } from "./storyGenerationApi.js";
import { createStoryAssetCandidateLedger } from "./storyAssetCandidateLedger.js";
import { createStoryAssetEvidenceDossiers } from "./storyAssetEvidenceDossier.js";
import { createStoryAssetActionPropCandidates } from "./story-generation/storyAssetRequirementEvidence.js";
import { STORY_ASSET_FOCUSED_MAX_OUTPUT_TOKENS } from "./story-generation/storyAssetHybridBudget.js";
export const STORY_ASSET_BATCHED_EXTRACTION_SCHEMA_VERSION = 7;
export const STORY_ASSET_INVENTORY_PROMPT_TARGET_CHARACTERS = 20000;
export const STORY_ASSET_INVENTORY_REPAIR_REQUEST_LIMIT = 1;
export const STORY_ASSET_INVENTORY_MAX_SOURCE_SCENES = 50;
export const STORY_ASSET_KIND_BATCH_MAX_SOURCE_SCENES = 30;
export const STORY_ASSET_AUTOMATIC_CALL_LIMIT = 3;
export const STORY_ASSET_BATCH_REQUEST_LIMIT = 16;
export const STORY_ASSET_EXPERIMENTAL_REQUEST_TIMEOUT_MS = 180000;
export const STORY_ASSET_SOURCE_WINDOW_TARGET_CHARACTERS = 50000;
export const STORY_ASSET_DETAIL_TARGET_OUTPUT_CHARACTERS = 16000;
export const STORY_ASSET_DETAIL_MAX_OUTPUT_CHARACTERS = 22000;
export const STORY_ASSET_DETAIL_MAX_ASSETS_PER_BATCH = 12;
export const STORY_ASSET_DETAIL_PROMPT_TARGET_CHARACTERS = 18000;
export const STORY_ASSET_EXPERIMENTAL_KINDS = Object.freeze(["character", "scene", "prop"]);
const STORY_ASSET_DETAIL_SOURCE_BODY_MAX_CHARACTERS = 1200;
const STORY_ASSET_DETAIL_SOURCE_SCENE_MAX_COUNT = 15;
const STORY_ASSET_INVENTORY_SYSTEM_PROMPT = ["你是专业的影视资产清单规划 Agent。", "客户端已经确定具名角色和逐场原始场景候选；你只补充角色与场景的显著形象状态、跨标题场景归并和关键道具。", "场景标题若用“/”“／”等并列多个地点，必须返回去掉时间和内外景前缀后的单一物理空间资产，禁止原样复制复合标题。", "当前只规划轻量差异清单和来源映射，不生成声音设定、图片提示词或长篇视觉描述。", "同一物理空间出现不同年代、完好与损毁、普通与异变、干燥与积水等明显视觉差异时，必须保留为同一个场景资产并拆成多个 appearances；每个 appearance 明确映射对应 sourceSceneRefs。", "角色只有显著换装、年龄变化、受伤或形态变化时才拆 appearances；普通表情和情绪变化不拆形象。", "场景的显著年代或物理状态差异必须拆 appearances；普通镜头角度、短暂人物活动或不改变空间视觉基准的氛围变化不拆。道具只能规划一个 appearance。", "sceneAudits 必须逐场核验角色候选并列出 characterNames，同时列出关键道具 keyPropNames；没有时返回空数组，名称必须与 assets 中名称完全一致。", "只依据输入场次，不续写剧情，不创建分集或分镜。", "只返回严格 JSON，不要输出 Markdown、注释或说明。"].join("\n");
const STORY_ASSET_INVENTORY_REPAIR_SYSTEM_PROMPT = ["你是影视资产清单修复 Agent。", "只处理输入 coverageIssues 指出的缺失、重复或来源映射错误，不重新规划未报错资产。", "upserts 返回需要新增或完整替换的轻量资产；removeAssetRefs 只返回确实需要删除的旧资产 ref。", "不得生成声音设定、图片提示词或长篇视觉描述。", "只返回严格 JSON，不要输出 Markdown、注释或说明。"].join("\n");
const STORY_ASSET_DETAIL_SYSTEM_PROMPT = ["你是专业的影视资产设定 Agent。", "当前只细化输入 assetPlans，不新增、删除、合并或重排资产与形象。", "每个资产都提供独立 evidenceDossiers；scriptFacts 只能记录原文证据或已确认项目设定直接支持的事实，不得把推测写成剧情事实。", "visualDesign 用于记录生成形象所需但原文没有明确提供的视觉补全；补全必须符合身份、时代、世界观和视觉风格，并且不得与 scriptFacts 冲突。", "description 必须明确分成“剧本事实”和“视觉补全”两部分，禁止用视觉补全反向改写人物身份、关系、道具归属或剧情状态。", "角色必须提供可长期复用的九项声音设定：年龄、性别、身份、口音、情绪底色、声线、语速、说话方式、音色特征。", "角色图片提示词只用于独立人设图：具体描述脸部、发型、体态、服装、鞋履和必要穿戴细节，采用自然站立的正面全身人物设定图，不写剧情道具、动作表演、地点、家具、其他人物或剧情场面。", "最终 prompt 只能写需要呈现的正向视觉内容，不得复述任何规则、限制、处理流程、模型说明或其他元说明措辞。", "场景图片提示词必须描述空间布局、结构材质、前中后景、关键陈设、光源色温、时间天气、色彩、视角和景别，并默认无人。", "道具图片提示词必须描述用途、轮廓、尺寸、材质工艺、颜色纹样、磨损和关键结构，采用产品设定构图并默认无人手持。", "多形象角色必须在每个形象中完整复述稳定的脸部、发型和体态特征，只改变剧情明确要求的外观差异。", "只依据输入 sourceScenes 细化，不续写剧情，不创建分集或分镜。", "只返回严格 JSON，不要输出 Markdown、注释或说明。"].join("\n");
function normalizeText(_0xc7bb33) {
  if (typeof _0xc7bb33 === "string") {
    return _0xc7bb33.trim();
  } else {
    return "";
  }
}
function normalizeStringArray(_0x20dd63) {
  return [...new Set((Array.isArray(_0x20dd63) ? _0x20dd63 : []).map(normalizeText).filter(Boolean))];
}
function normalizeReference(_0x4cc922, _0x5cb8ce = "") {
  return normalizeText(_0x4cc922).replace(/\s+/g, "-") || _0x5cb8ce;
}
function getResultText(_0x390787) {
  if (typeof _0x390787 === "string") {
    return _0x390787;
  }
  return _0x390787?.text || _0x390787?.outputText || _0x390787?.content || _0x390787 || "";
}
async function requestStrictAgentResult({
  request: _0x1549f0,
  requestPayload: _0x418ce9,
  parse: _0x2e676a,
  outputContract: _0x1d1bc6,
  maxAttempts = 2
}) {
  let _0xb5ad78 = await _0x1549f0(_0x418ce9);
  for (let _0x3a57bf = 1; _0x3a57bf <= maxAttempts; _0x3a57bf += 1) {
    try {
      return _0x2e676a(_0xb5ad78);
    } catch (_0xbd965a) {
      if (_0x3a57bf >= maxAttempts) {
        throw _0xbd965a;
      }
      _0xb5ad78 = await _0x1549f0({
        ..._0x418ce9,
        temperature: 0.1,
        prompt: JSON.stringify({
          task: "repair_invalid_agent_response",
          originalRequest: JSON.parse(_0x418ce9.prompt),
          rejectionReason: normalizeText(_0xbd965a?.message || _0xbd965a),
          rejectedResponse: normalizeText(getResultText(_0xb5ad78)),
          instruction: "重新执行原任务，只返回符合要求的严格 JSON 对象。",
          outputContract: _0x1d1bc6
        })
      });
    }
  }
  throw new Error("Agent 返回结果校验失败。");
}
function normalizeStoryContext(_0x445f03 = {}) {
  const _0x126a88 = Array.isArray(_0x445f03?.chapters) ? _0x445f03.chapters.map((_0xc40041, _0x565751) => ({
    id: normalizeText(_0xc40041?.id) || "chapter-" + (_0x565751 + 1),
    title: normalizeText(_0xc40041?.title)
  })) : [];
  const _0x36c633 = {
    title: normalizeText(_0x445f03?.title),
    storyType: normalizeText(_0x445f03?.storyType),
    summary: normalizeText(_0x445f03?.summary || _0x445f03?.storySummary),
    background: normalizeText(_0x445f03?.background || _0x445f03?.storyBackground),
    setting: normalizeText(_0x445f03?.setting || _0x445f03?.storySetting),
    logline: normalizeText(_0x445f03?.logline),
    continuityFacts: normalizeStringArray([...(Array.isArray(_0x445f03?.continuityFacts) ? _0x445f03.continuityFacts : []), ...(Array.isArray(_0x445f03?.storyFacts) ? _0x445f03.storyFacts : [])]).slice(0, 20),
    characters: (Array.isArray(_0x445f03?.characters) ? _0x445f03.characters : []).map(_0x200f2f => ({
      ref: normalizeText(_0x200f2f?.ref),
      name: normalizeText(_0x200f2f?.name),
      roleType: normalizeText(_0x200f2f?.roleType || _0x200f2f?.role),
      fixedTraits: normalizeText(_0x200f2f?.fixedTraits),
      profile: normalizeText(_0x200f2f?.profile)
    })).filter(_0x8fde6c => _0x8fde6c.name).slice(0, 12),
    scriptMode: normalizeText(_0x445f03?.scriptMode) || "plot",
    aspectRatio: normalizeText(_0x445f03?.aspectRatio) || "16:9",
    visualStyle: normalizeText(_0x445f03?.videoStylePrompt || _0x445f03?.visualStyle || _0x445f03?.videoStyle),
    chapterIds: _0x126a88.map(_0xe2c180 => _0xe2c180.id)
  };
  if (!_0x36c633.title || !_0x36c633.chapterIds.length) {
    throw new Error("请先完成并确认全部分集剧本。");
  }
  return _0x36c633;
}
function normalizeSourceCharacters(_0x54d092) {
  return normalizeStringArray(_0x54d092).filter(_0x561857 => !/^(?:旁白|画外音|VO|OS)$/iu.test(_0x561857));
}
const STORY_SOURCE_NON_CHARACTER_LABELS = new Set(["旁白", "画外音", "vo", "v.o", "v.o.", "os", "o.s", "o.s.", "时间", "时长", "地点", "目的地", "状态", "场景", "内景", "外景", "镜头", "画面", "动作", "音效", "音乐", "字幕", "备注", "出场人物", "登场人物", "出场角色", "人物", "角色", "台词", "环境", "转场"]);
const STORY_SOURCE_DIALOGUE_ACTION_SUFFIX_PATTERN = /(?:快速)?(?:检索|搜索|查找|查看|翻阅|操作|记录|回应|回答|追问|补充|继续|解释)$/u;
const STORY_SOURCE_NONVISUAL_SPEAKER_PATTERN = /^(?:系统广播|机械广播|电子广播|电子合成音|录音笔|电话|手机|广播|扩音器|扬声器|喇叭|电视|收音机|新闻主播|电视主播|电台主播)$/u;
const STORY_SOURCE_ANONYMOUS_GROUP_PATTERN = /^(?:[零一二两三四五六七八九十百\d]+|数|多|几)(?:名|位|个)(?:[\p{Script=Han}]{1,8})$/u;
function normalizeSourceCharacterName(_0x3c9f59) {
  const _0x17652d = normalizeText(_0x3c9f59).replace(/^[【\[]|[】\]]$/gu, "").replace(/[（(][^（）()\r\n]{0,30}[）)]\s*$/u, "").replace(/^(?:演员|饰演)\s*[:：]\s*/u, "").trim();
  if (!_0x17652d || [..._0x17652d].length > 12) {
    return "";
  }
  if (STORY_SOURCE_NON_CHARACTER_LABELS.has(_0x17652d.toLowerCase())) {
    return "";
  }
  if (STORY_SOURCE_NONVISUAL_SPEAKER_PATTERN.test(_0x17652d)) {
    return "";
  }
  if (/(?:旁白|画外音|字幕|音效|音乐)$/u.test(_0x17652d)) {
    return "";
  }
  if (/^(?:第?\d+[场幕镜]|场次|章节|日|夜|白天|黑夜)$/u.test(_0x17652d)) {
    return "";
  }
  if (/^(?:然后|随后|接着|紧接着|这时|此时)(?:他|她|它)?/u.test(_0x17652d)) {
    return "";
  }
  if (/^(?:若干|数名|多名)|(?:若干|数人|多人|等人)$/u.test(_0x17652d)) {
    return "";
  }
  if (STORY_SOURCE_ANONYMOUS_GROUP_PATTERN.test(_0x17652d)) {
    return "";
  }
  if (!/^[\p{Script=Han}A-Za-z0-9·•._-]+$/u.test(_0x17652d)) {
    return "";
  }
  return _0x17652d;
}
function normalizeDeterministicStoryCharacterCandidate(_0x3eb195) {
  const _0x52b2bd = normalizeSourceCharacterName(_0x3eb195).replace(/(?:及|与)(?:其)?(?:弟子|随从|众人|同伴)$/u, "");
  const _0x503416 = [..._0x52b2bd].length;
  if (!_0x52b2bd || _0x503416 < 2 || _0x503416 > 8) {
    return "";
  }
  if (/^无(?:相应)?实体$/u.test(_0x52b2bd)) {
    return "";
  }
  if (/^第[一二三四五六七八九十百千万\d]+(?:道|次|个|名|位|集|章|场|幕|镜)$/u.test(_0x52b2bd)) {
    return "";
  }
  if (/^(?:他|她|它|他们|她们|它们|众人|人群|观众|子殿下)$/u.test(_0x52b2bd)) {
    return "";
  }
  if (/(?:若干|数人|多人|[一二三四五六七八九十\d]+人)$/u.test(_0x52b2bd)) {
    return "";
  }
  if (STORY_SOURCE_ANONYMOUS_GROUP_PATTERN.test(_0x52b2bd)) {
    return "";
  }
  if (/^(?:只想|该是|才能|如果|因为|为了|已经|这个|那个)/u.test(_0x52b2bd)) {
    return "";
  }
  if (/(?:说话|曲子|意赅|怎样的奇女子)$/u.test(_0x52b2bd)) {
    return "";
  }
  return _0x52b2bd;
}
function getDeterministicStoryCharacterCandidates(_0x359576 = {}) {
  return normalizeStringArray(normalizeStringArray(_0x359576?.characters).map(normalizeDeterministicStoryCharacterCandidate));
}
function getStoryAssetNameAliases(_0x5c2489) {
  const _0x5cfb33 = normalizeText(_0x5c2489);
  if (!_0x5cfb33) {
    return [];
  }
  const _0x19229d = [..._0x5cfb33.matchAll(/[（(]([^（）()\r\n]+)[）)]/gu)].map(_0x47ca3e => normalizeText(_0x47ca3e[1]));
  const _0x44e5f5 = normalizeText(_0x5cfb33.replace(/[（(][^（）()\r\n]+[）)]/gu, ""));
  return normalizeStringArray([_0x5cfb33, _0x44e5f5, ..._0x19229d].flatMap(_0x5542cf => [_0x5542cf, normalizeSourceCharacterName(_0x5542cf)]));
}
function storyCharacterNamesOverlap(_0x1d76fb, _0x448145) {
  const _0x40cb1d = new Set(getStoryAssetNameAliases(_0x448145).map(_0x197591 => _0x197591.toLowerCase()));
  return getStoryAssetNameAliases(_0x1d76fb).some(_0x295c2e => _0x40cb1d.has(_0x295c2e.toLowerCase()));
}
function storyCharacterNamesStronglyOverlap(_0x19de9b, _0x59d563) {
  if (storyCharacterNamesOverlap(_0x19de9b, _0x59d563)) {
    return true;
  }
  const _0x3286fb = normalizeDeterministicStoryCharacterCandidate(_0x19de9b).toLowerCase();
  const _0x215bc6 = normalizeDeterministicStoryCharacterCandidate(_0x59d563).toLowerCase();
  if (!_0x3286fb || !_0x215bc6) {
    return false;
  }
  if (/[a-z0-9]/u.test(_0x3286fb) || /[a-z0-9]/u.test(_0x215bc6)) {
    return false;
  }
  const [_0x18716b, _0x21088b] = _0x3286fb.length <= _0x215bc6.length ? [_0x3286fb, _0x215bc6] : [_0x215bc6, _0x3286fb];
  return [..._0x18716b].length >= 2 && [..._0x21088b].length - [..._0x18716b].length <= 3 && _0x21088b.includes(_0x18716b);
}
function addDeterministicStoryCharacterCandidate(_0x2ef47f, _0x5e9d2f, _0x5cf972) {
  const _0x50ef72 = [..._0x2ef47f.entries()].find(([_0x1a0f07, _0xd380c9]) => storyCharacterNamesStronglyOverlap(_0x1a0f07, _0x5e9d2f) || (_0xd380c9?.aliases || []).some(_0xa44834 => storyCharacterNamesStronglyOverlap(_0xa44834, _0x5e9d2f)));
  if (_0x50ef72) {
    const [_0x41ca3e, _0x11c5b9] = _0x50ef72;
    _0x11c5b9.sourceSceneRefs.push(_0x5cf972);
    _0x11c5b9.aliases = normalizeStringArray([..._0x11c5b9.aliases, _0x5e9d2f]);
    _0x2ef47f.set(_0x41ca3e, _0x11c5b9);
    return;
  }
  _0x2ef47f.set(_0x5e9d2f, {
    aliases: [_0x5e9d2f],
    sourceSceneRefs: [_0x5cf972]
  });
}
function createDeterministicStoryCharacterCandidateMap(_0x13f3da = []) {
  const _0x476b58 = new Map();
  _0x13f3da.forEach(_0x520b95 => {
    getDeterministicStoryCharacterCandidates(_0x520b95).forEach(_0x23dffd => {
      addDeterministicStoryCharacterCandidate(_0x476b58, _0x23dffd, _0x520b95.ref);
    });
  });
  return _0x476b58;
}
function resolveDeterministicStoryCharacterCanonicalName(_0x108615, _0x114060) {
  const _0x2b3a87 = normalizeDeterministicStoryCharacterCandidate(_0x108615);
  if (!_0x2b3a87) {
    return "";
  }
  const _0xfdf0d0 = [..._0x114060.entries()].find(([_0x578d91, _0x77bfea]) => storyCharacterNamesStronglyOverlap(_0x578d91, _0x2b3a87) || (_0x77bfea?.aliases || []).some(_0x3d3f37 => storyCharacterNamesStronglyOverlap(_0x3d3f37, _0x2b3a87)));
  return _0xfdf0d0?.[0] || _0x2b3a87;
}
const STORY_CHARACTER_TRAILING_ACTION_PATTERN = /^(?:(?:正|又|还|便|只|连忙|忙)?(?:附耳|噘着嘴|不死心|安抚|劝说|劝道|说道|问道|答道|喊道|笑道|哭道|皱眉|点头|摇头|转身|抬手|挥手|走向|看向|望着|盯着|站起|坐下|推开|握住|拿起|放下|冷笑|苦笑|大喊).*)$/u;
function getStoryAssetLocalCharacterCanonicalNames(_0x3b903c = []) {
  return normalizeStringArray(_0x3b903c.flatMap(_0x11946f => [...normalizeStringArray(_0x11946f?.localEntityCandidates?.character), ...(Array.isArray(_0x11946f?.localEntityEvidence) ? _0x11946f.localEntityEvidence.filter(_0x135818 => _0x135818?.kind === "character").map(_0x3e86e3 => _0x3e86e3?.text) : [])]).map(normalizeDeterministicStoryCharacterCandidate).filter(Boolean));
}
function resolveStoryAssetCharacterCanonicalName(_0x5bcd0d, _0xe6b894, _0x104a6b = []) {
  const _0x708d0a = normalizeDeterministicStoryCharacterCandidate(_0x5bcd0d);
  if (!_0x708d0a) {
    return "";
  }
  const _0x1a627b = _0x104a6b.filter(_0x48be39 => _0x48be39 !== _0x708d0a && _0x708d0a.startsWith(_0x48be39) && STORY_CHARACTER_TRAILING_ACTION_PATTERN.test(_0x708d0a.slice(_0x48be39.length))).sort((_0x20ac0e, _0x2343c3) => [..._0x2343c3].length - [..._0x20ac0e].length)[0];
  return _0x1a627b || resolveDeterministicStoryCharacterCanonicalName(_0x708d0a, _0xe6b894);
}
function resolveStoryProjectCharacterCanonicalName(_0x4774de, _0x1188b3 = []) {
  return _0x1188b3.find(_0x169cc8 => storyCharacterNamesOverlap(_0x169cc8, _0x4774de)) || "";
}
function extractStorySourceCastNames(_0x5ec82a = "") {
  const _0x5e58b0 = [];
  const _0xa22de8 = normalizeText(_0x5ec82a);
  const _0x1e8364 = /(?:出场人物|登场人物|出场角色)\s*[:：]\s*([^\r\n]+)/gu;
  let _0x109fe4 = _0x1e8364.exec(_0xa22de8);
  while (_0x109fe4) {
    const _0x29f281 = _0x109fe4[1].replace(/[（(][^（）()\r\n]{0,30}[）)]/gu, "").split(/\s{2,}|[；;。]/u)[0];
    _0x29f281.split(/[、,，/／|]/u).forEach(_0x2ee571 => {
      const _0x3916bb = normalizeSourceCharacterName(_0x2ee571);
      if (_0x3916bb) {
        _0x5e58b0.push(_0x3916bb);
      }
    });
    _0x109fe4 = _0x1e8364.exec(_0xa22de8);
  }
  return normalizeStringArray(_0x5e58b0);
}
function isLikelyStorySourceDialogueSpeaker(_0x58c238, _0x1a8c79 = []) {
  if (!_0x58c238) {
    return false;
  }
  if (_0x1a8c79.includes(_0x58c238)) {
    return true;
  }
  if (_0x1a8c79.some(_0x84e293 => _0x58c238.startsWith(_0x84e293))) {
    return false;
  }
  if ([..._0x58c238].length > 6) {
    return false;
  }
  if (/^(?:他|她|它|他们|她们|它们|众人|人群|观众|评论区|弹幕)/u.test(_0x58c238)) {
    return false;
  }
  if (/^(?:然后|随后|接着|紧接着|这时|此时)(?:他|她|它)?/u.test(_0x58c238)) {
    return false;
  }
  if (/(?:若干|数人|多人|等人)$/u.test(_0x58c238)) {
    return false;
  }
  return !/(?:面无表情|面不改色|一把|抓住|咳着|喊出声|已经|炸了|冷笑|苦笑|说道|问道|答道|开口|皱眉|点头|摇头|转身|抬手|挥手|走向|看向|望着|盯着|站起|坐下|推开|握住|拿起|放下)$/u.test(_0x58c238);
}
function normalizeStorySourceDialogueSpeaker(_0x547bc0) {
  const _0xf42ed7 = normalizeSourceCharacterName(_0x547bc0).replace(STORY_SOURCE_DIALOGUE_ACTION_SUFFIX_PATTERN, "").trim();
  if (!_0xf42ed7 || STORY_SOURCE_NONVISUAL_SPEAKER_PATTERN.test(_0xf42ed7)) {
    return "";
  }
  return _0xf42ed7;
}
function isDeclaredStorySourceSpeakerAlias(_0x15567b, _0x30c050 = []) {
  const _0x31c5e1 = normalizeText(_0x15567b);
  if (!_0x31c5e1) {
    return false;
  }
  return _0x30c050.some(_0x8839a6 => storyCharacterNamesOverlap(_0x8839a6, _0x31c5e1) || [..._0x31c5e1].length >= 2 && normalizeText(_0x8839a6).endsWith(_0x31c5e1));
}
function extractStorySourceDialogueSpeakers(_0x188d3e = "", _0x48a212 = []) {
  const _0x305ba2 = [];
  normalizeText(_0x188d3e).split(/\r?\n/u).forEach(_0x1d6b7a => {
    const _0x3e4f47 = _0x1d6b7a.match(/^[\s>*#-]*(?:【)?([\p{Script=Han}A-Za-z0-9·•._-]{1,12})(?:】)?(?:[（(][^（）()\r\n]{0,30}[）)])?(?:\*\*)?\s*[:：]/u);
    const _0x80d32c = normalizeStorySourceDialogueSpeaker(_0x3e4f47?.[1]);
    if (isLikelyStorySourceDialogueSpeaker(_0x80d32c, _0x48a212) && !isDeclaredStorySourceSpeakerAlias(_0x80d32c, _0x48a212)) {
      _0x305ba2.push(_0x80d32c);
    }
  });
  return normalizeStringArray(_0x305ba2);
}
export function extractStorySourceCharacterNames({
  characters = [],
  body = ""
} = {}) {
  const _0x2f1384 = normalizeSourceCharacters([...normalizeStringArray(characters).map(normalizeSourceCharacterName).filter(Boolean), ...extractStorySourceCastNames(body)]);
  return normalizeSourceCharacters([..._0x2f1384, ...extractStorySourceDialogueSpeakers(body, _0x2f1384)]);
}
export function normalizeStoryAssetExtractionSources(_0x4a0c17 = []) {
  const _0x26aabd = [];
  (Array.isArray(_0x4a0c17) ? _0x4a0c17 : []).forEach((_0x6381a5, _0x337ac3) => {
    const _0x5d01e3 = normalizeReference(_0x6381a5?.id || _0x6381a5?.ref || _0x6381a5?.planningRef, "episode-" + (_0x337ac3 + 1));
    const _0x2e881e = Math.max(1, Math.trunc(Number(_0x6381a5?.number) || _0x337ac3 + 1));
    (Array.isArray(_0x6381a5?.script?.scenes) ? _0x6381a5.script.scenes : []).forEach((_0x701f25, _0x13e4d0) => {
      const _0x54a351 = normalizeText(_0x701f25?.heading);
      const _0x464d94 = normalizeText(_0x701f25?.body);
      if (!_0x54a351 || !_0x464d94) {
        return;
      }
      const _0x4ef05a = normalizeReference(_0x701f25?.ref, _0x5d01e3 + "-scene-" + (_0x13e4d0 + 1));
      const _0x1d2281 = extractStorySourceCharacterNames({
        characters: _0x701f25?.characters,
        body: _0x464d94
      });
      _0x26aabd.push({
        episodeRef: _0x5d01e3,
        episodeNumber: _0x2e881e,
        localRef: _0x4ef05a,
        heading: _0x54a351,
        assetHeading: _0x54a351,
        source: normalizeText(_0x701f25?.source),
        isSourceWindow: false,
        characters: _0x1d2281,
        body: _0x464d94
      });
    });
  });
  const _0x4407ab = _0x26aabd.reduce((_0x52edd3, _0x2b10e5) => {
    _0x52edd3.set(_0x2b10e5.localRef, (_0x52edd3.get(_0x2b10e5.localRef) || 0) + 1);
    return _0x52edd3;
  }, new Map());
  const _0x4837e5 = _0x26aabd.map(_0x2a015a => ({
    ref: _0x4407ab.get(_0x2a015a.localRef) > 1 ? _0x2a015a.episodeRef + ":" + _0x2a015a.localRef : _0x2a015a.localRef,
    episodeRef: _0x2a015a.episodeRef,
    episodeNumber: _0x2a015a.episodeNumber,
    heading: _0x2a015a.heading,
    assetHeading: _0x2a015a.assetHeading || _0x2a015a.heading,
    source: _0x2a015a.source,
    isSourceWindow: Boolean(_0x2a015a.isSourceWindow),
    characters: _0x2a015a.characters,
    body: _0x2a015a.body
  }));
  if (!_0x4837e5.length) {
    throw new Error("资产提取没有找到可用的分集场次正文。");
  }
  return _0x4837e5;
}
export function createStoryAssetKindSourceBatches(_0xe120d9 = [], {
  maxSourceScenes = STORY_ASSET_KIND_BATCH_MAX_SOURCE_SCENES
} = {}) {
  const _0xe1515d = Math.max(1, Math.trunc(Number(maxSourceScenes) || 0));
  const _0x590ae4 = [];
  (Array.isArray(_0xe120d9) ? _0xe120d9 : []).forEach(_0x1fe36c => {
    const _0x418b7c = normalizeText(_0x1fe36c?.episodeRef) || "unknown-episode";
    const _0x243591 = _0x590ae4.at(-1);
    if (!_0x243591 || _0x243591.episodeRef !== _0x418b7c) {
      _0x590ae4.push({
        episodeRef: _0x418b7c,
        scenes: [_0x1fe36c]
      });
      return;
    }
    _0x243591.scenes.push(_0x1fe36c);
  });
  const _0x5a6f33 = [];
  let _0x3cf839 = [];
  const _0x1a1378 = () => {
    if (!_0x3cf839.length) {
      return;
    }
    _0x5a6f33.push(_0x3cf839);
    _0x3cf839 = [];
  };
  _0x590ae4.forEach(({
    scenes: _0x4a5c5f
  }) => {
    if (_0x4a5c5f.length > _0xe1515d) {
      _0x1a1378();
      for (let _0x3525b6 = 0; _0x3525b6 < _0x4a5c5f.length; _0x3525b6 += _0xe1515d) {
        _0x5a6f33.push(_0x4a5c5f.slice(_0x3525b6, _0x3525b6 + _0xe1515d));
      }
      return;
    }
    if (_0x3cf839.length && _0x3cf839.length + _0x4a5c5f.length > _0xe1515d) {
      _0x1a1378();
    }
    _0x3cf839.push(..._0x4a5c5f);
  });
  _0x1a1378();
  return _0x5a6f33;
}
function buildOccurrences(_0x4a1e12 = []) {
  const _0xbdb104 = normalizeStringArray(_0x4a1e12);
  if (!_0xbdb104.length) {
    return "当前项目";
  }
  const _0x5b99c3 = _0xbdb104.map(_0x17f38e => {
    const _0x2cafcc = /(?:^|[-_])episode-(\d+)$/iu.exec(_0x17f38e);
    if (_0x2cafcc) {
      return String(Math.max(1, Number(_0x2cafcc[1]) || 1));
    } else {
      return "";
    }
  });
  if (_0x5b99c3.every(Boolean)) {
    const _0x19e83d = [...new Set(_0x5b99c3.map(Number))].sort((_0x244f48, _0x116904) => _0x244f48 - _0x116904);
    return "第 " + _0x19e83d.join("、") + " 集";
  }
  return _0xbdb104.map((_0x58b5ea, _0x44cdf6) => _0x5b99c3[_0x44cdf6] ? "第 " + _0x5b99c3[_0x44cdf6] + " 集" : _0x58b5ea).join("、");
}
function deriveSourceEpisodeRefs(_0x1e1e40, _0x1c20a8) {
  return normalizeStringArray(_0x1e1e40.map(_0x7a2d77 => _0x1c20a8.get(_0x7a2d77)?.episodeRef));
}
function normalizeStoryAssetFinalCharacterRole(_0x29040f = "") {
  const _0x23b604 = normalizeText(_0x29040f);
  if (/主角|男主|女主|主人公/u.test(_0x23b604)) {
    return "主角";
  }
  if (/反派|反面|敌对|敌人|宿敌|对手/u.test(_0x23b604)) {
    return "反派";
  }
  if (/路人|群众|群演|背景人物|无名角色/u.test(_0x23b604)) {
    return "路人";
  }
  return "配角";
}
function normalizeInventoryAssets(_0x1252cc, {
  sourceScenes = [],
  allowEmpty = false
} = {}) {
  const _0x36cc53 = new Map(sourceScenes.map(_0x53868b => [_0x53868b.ref, _0x53868b]));
  const _0x4a35a9 = new Set(_0x36cc53.keys());
  const _0x4d9fe9 = (Array.isArray(_0x1252cc) ? _0x1252cc : []).map((_0x430ab5, _0x237d93) => {
    const _0x33e3ad = normalizeText(_0x430ab5?.kind);
    const _0x4340fb = normalizeText(_0x430ab5?.name);
    const _0x1a3bff = normalizeReference(_0x430ab5?.ref, "asset-" + (_0x237d93 + 1));
    if (!_0x4340fb || !["character", "scene", "prop"].includes(_0x33e3ad)) {
      return null;
    }
    const _0x363d2a = _0x33e3ad === "character" ? normalizeStoryAssetFinalCharacterRole(_0x430ab5?.role) : normalizeText(_0x430ab5?.role);
    let _0x12899e = normalizeStringArray(_0x430ab5?.sourceSceneRefs).filter(_0x4a7544 => _0x4a35a9.has(_0x4a7544));
    if (!_0x12899e.length) {
      _0x12899e = inferStoryAssetSourceSceneRefs(_0x33e3ad, _0x4340fb, sourceScenes);
    }
    if (!_0x12899e.length) {
      return null;
    }
    const _0x42e530 = deriveSourceEpisodeRefs(_0x12899e, _0x36cc53);
    const _0x2c8806 = Array.isArray(_0x430ab5?.appearances) && _0x430ab5.appearances.length ? _0x430ab5.appearances : [{
      ref: _0x1a3bff + "-base",
      name: "基础形象",
      description: "",
      sourceSceneRefs: _0x12899e
    }];
    const _0x1b7090 = _0x33e3ad === "prop" && _0x2c8806.length > 1 ? [{
      ref: _0x1a3bff + "-base",
      name: "基础形象",
      description: normalizeStringArray(_0x2c8806.map(_0x4d6546 => {
        const _0x148e65 = normalizeText(_0x4d6546?.name);
        const _0x231cdb = normalizeText(_0x4d6546?.description);
        if (_0x148e65 && _0x231cdb) {
          return _0x148e65 + "：" + _0x231cdb;
        }
        return _0x231cdb || _0x148e65;
      })).join("；"),
      sourceSceneRefs: _0x12899e
    }] : _0x2c8806;
    const _0x8c98f1 = _0x1b7090.map((_0x366d3b, _0x138d0a) => {
      const _0x389e64 = normalizeStringArray(_0x366d3b?.sourceSceneRefs?.length ? _0x366d3b.sourceSceneRefs : _0x1b7090.length === 1 ? _0x12899e : []).filter(_0x5d2887 => _0x12899e.includes(_0x5d2887));
      return {
        ref: normalizeReference(_0x366d3b?.ref, _0x1a3bff + "-appearance-" + (_0x138d0a + 1)),
        name: normalizeText(_0x366d3b?.name) || (_0x138d0a === 0 ? "基础形象" : "形象 " + (_0x138d0a + 1)),
        description: normalizeText(_0x366d3b?.description),
        occurrences: buildOccurrences(deriveSourceEpisodeRefs(_0x389e64, _0x36cc53)),
        sourceEpisodeRefs: deriveSourceEpisodeRefs(_0x389e64, _0x36cc53),
        sourceSceneRefs: _0x389e64
      };
    });
    const _0x598404 = _0x8c98f1.map(_0x235e7b => _0x235e7b.ref);
    if (new Set(_0x598404).size !== _0x598404.length) {
      throw new Error("资产“" + _0x4340fb + "”规划了重复的形象 ref。");
    }
    return {
      ref: _0x1a3bff,
      kind: _0x33e3ad,
      name: _0x4340fb,
      role: _0x363d2a,
      description: normalizeText(_0x430ab5?.description),
      occurrences: normalizeText(_0x430ab5?.occurrences) || buildOccurrences(_0x42e530),
      sourceEpisodeRefs: _0x42e530,
      sourceSceneRefs: _0x12899e,
      appearances: _0x8c98f1
    };
  }).filter(Boolean);
  if (!_0x4d9fe9.length && !allowEmpty) {
    throw new Error("Agent 未返回可用的轻量资产清单。");
  }
  const _0x41579a = new Set();
  _0x4d9fe9.forEach((_0x2ee2b8, _0x420477) => {
    _0x2ee2b8.ref = createUniqueStoryAssetInventoryRef(_0x2ee2b8.ref, _0x41579a, "asset-" + (_0x420477 + 1));
    const _0x40dc7a = new Set();
    _0x2ee2b8.appearances.forEach((_0xdba145, _0x54484c) => {
      _0xdba145.ref = createUniqueStoryAssetAppearanceRef(_0xdba145.ref, _0x40dc7a, _0x2ee2b8.ref + "-appearance-" + (_0x54484c + 1));
    });
  });
  return _0x4d9fe9;
}
export function buildStoryAssetInventoryPrompt({
  project = {},
  episodes = [],
  sourceScenes = null
} = {}) {
  const _0x46d146 = normalizeStoryContext(project);
  const _0x1b90a7 = Array.isArray(sourceScenes) ? sourceScenes : normalizeStoryAssetExtractionSources(episodes);
  if (!_0x1b90a7.length) {
    throw new Error("资产清单规划缺少可用的场次正文。");
  }
  const _0x4aaa53 = createDeterministicStoryCharacterCandidateMap(_0x1b90a7);
  const _0x1df695 = _0x1b90a7.map(_0x3b09e3 => ({
    ref: _0x3b09e3.ref,
    heading: _0x3b09e3.heading,
    ...(_0x3b09e3.isSourceWindow ? {
      assetHeading: _0x3b09e3.assetHeading || _0x3b09e3.heading,
      isSourceWindow: true
    } : {}),
    ...(_0x3b09e3.characters.length ? {
      characters: _0x3b09e3.characters
    } : {}),
    body: _0x3b09e3.body
  }));
  return JSON.stringify({
    task: "plan_story_asset_inventory",
    schemaVersion: STORY_ASSET_BATCHED_EXTRACTION_SCHEMA_VERSION,
    storyContext: _0x46d146,
    deterministicCandidates: {
      characters: [..._0x4aaa53.entries()].map(([_0x44c947, _0x184d41]) => ({
        name: _0x44c947,
        sourceSceneRefs: normalizeStringArray(_0x184d41.sourceSceneRefs)
      }))
    },
    sourceScenes: _0x1df695,
    requirements: ["本轮只输出必要补充：角色或场景的显著形象状态、需要跨标题合并的场景组、关键道具；没有补充时 assets 返回空数组。", "不要逐项复述只有基础形象的角色或普通单场场景；客户端会从 deterministicCandidates.characters 和 sourceScenes 本地补齐。", "sourceScenes[].isSourceWindow 为 true 时，它只是同一场正文的传输片段；按 assetHeading 视为同一场景，不得为每个片段新建场景资产。", "assets 只包含 kind、name、role、sourceSceneRefs、appearances；角色或场景存在显著形象变化时 appearances 返回形象项（只含 name、description、sourceSceneRefs），其余返回空数组。ref、出现集数、声音和图片 prompt 全部由客户端或后续步骤处理。", "storyContext.characters[].fixedTraits 与 continuityFacts 是已确认约束；不得改写人物身份、身体限制、关系或物品归属。", "需要归并的 scene 资产必须完整列出它覆盖的 sourceScenes[].ref；同一物理空间即使视觉状态不同也归入同一 scene 资产，通过 appearances 区分状态。", "sourceScenes[].heading 若用“/”“／”等并列多个地点，必须至少返回一个明确覆盖该 sourceSceneRef 的原子 scene 资产；scene.name 只能是单一物理空间名称，禁止复制复合标题。", "只有存在显著换装、年龄、受伤或形态变化时才返回同名 character 资产及 appearances。", "sceneAudits 必须完整覆盖全部 sourceScenes；characterNames 逐场核验 sourceScenes[].characters，只保留原文中确实出现且需要角色资产的具名人物或明确身份角色；不得保留“无相应实体”、句子片段或动作描述。", "sceneAudits[].keyPropNames 只列需要跨镜头保持视觉一致的剧情关键道具，且名称与 prop 资产完全一致。", "同一物理空间在不同年代、完好/损毁、正常/异变、干燥/积水等明显视觉状态下必须拆成多个 scene appearances；普通镜头角度、短暂人物活动或不改变空间视觉基准的氛围变化不拆。", "prop 的 appearances 必须返回空数组，客户端会创建唯一基础形象；scene 有显著状态差异时必须返回多个 appearances。", "每个资产、角色 appearance 和场景 appearance 的 sourceSceneRefs 只能逐字引用 sourceScenes[].ref；sourceEpisodeRefs 由客户端根据场次确定，无需输出。"]
  });
}
export function createStoryAssetInventorySourceBatches({
  project = {},
  episodes = [],
  sourceScenes = null,
  maxPromptCharacters = STORY_ASSET_INVENTORY_PROMPT_TARGET_CHARACTERS,
  maxSourceScenes = STORY_ASSET_INVENTORY_MAX_SOURCE_SCENES
} = {}) {
  const _0x2ce8ca = Array.isArray(sourceScenes) ? sourceScenes : normalizeStoryAssetExtractionSources(episodes);
  const _0x3e361a = Math.max(4000, Math.trunc(Number(maxPromptCharacters) || 0));
  const _0x30d150 = Math.max(1, Math.trunc(Number(maxSourceScenes) || 0));
  const _0x2f98b7 = [];
  let _0x4dbf3d = [];
  _0x2ce8ca.forEach(_0x51ab83 => {
    const _0x172614 = [..._0x4dbf3d, _0x51ab83];
    const _0x103ba1 = buildStoryAssetInventoryPrompt({
      project: project,
      sourceScenes: _0x172614
    }).length;
    if (_0x4dbf3d.length && (_0x4dbf3d.length >= _0x30d150 || _0x103ba1 > _0x3e361a)) {
      _0x2f98b7.push(_0x4dbf3d);
      _0x4dbf3d = [_0x51ab83];
      return;
    }
    _0x4dbf3d = _0x172614;
  });
  if (_0x4dbf3d.length) {
    _0x2f98b7.push(_0x4dbf3d);
  }
  const _0x1bd32b = _0x2f98b7.find(_0x5c6d86 => buildStoryAssetInventoryPrompt({
    project: project,
    sourceScenes: _0x5c6d86
  }).length > _0x3e361a);
  if (_0x1bd32b) {
    const _0x59fe92 = _0x1bd32b[0];
    throw new Error("单个场次“" + (_0x59fe92?.heading || _0x59fe92?.ref || "未命名场次") + "”正文过长，请先拆分该场次。");
  }
  return _0x2f98b7;
}
export function parseStoryAssetInventoryResult(_0x4c8926, {
  sourceScenes = []
} = {}) {
  const _0x4fc6f = parseStrictJson(getResultText(_0x4c8926), "Agent 未返回轻量资产清单。");
  const _0x104e72 = normalizeInventoryAssets(_0x4fc6f?.assets, {
    sourceScenes: sourceScenes,
    allowEmpty: true
  });
  const _0x35b712 = new Set(sourceScenes.map(_0x417189 => _0x417189.ref));
  const _0x44eea1 = (Array.isArray(_0x4fc6f?.sceneAudits) ? _0x4fc6f.sceneAudits : []).map(_0x4a14ee => ({
    sourceSceneRef: normalizeText(_0x4a14ee?.sourceSceneRef || _0x4a14ee?.sceneRef || _0x4a14ee?.ref),
    characterNames: normalizeStringArray(_0x4a14ee?.characterNames),
    keyPropNames: normalizeStringArray(_0x4a14ee?.keyPropNames)
  }));
  const _0x50dbff = _0x44eea1.map(_0x419d8d => _0x419d8d.sourceSceneRef);
  const _0x344788 = _0x50dbff.find(_0x23061d => !_0x35b712.has(_0x23061d));
  if (_0x344788) {
    throw new Error("场次审计引用了不存在的场次：" + _0x344788 + "。");
  }
  if (new Set(_0x50dbff).size !== _0x50dbff.length) {
    throw new Error("场次审计包含重复的 sourceSceneRef。");
  }
  const _0x36ac2a = new Map(_0x44eea1.map(_0x2a5f8f => [_0x2a5f8f.sourceSceneRef, _0x2a5f8f]));
  const _0x297e89 = sourceScenes.map(_0xaa8576 => ({
    sourceSceneRef: _0xaa8576.ref,
    characterNames: normalizeStringArray([...(_0x36ac2a.get(_0xaa8576.ref)?.characterNames || []), ..._0x104e72.filter(_0x38eef4 => _0x38eef4.kind === "character" && _0x38eef4.sourceSceneRefs.includes(_0xaa8576.ref)).map(_0x27a1b4 => _0x27a1b4.name)]),
    keyPropNames: normalizeStringArray([...(_0x36ac2a.get(_0xaa8576.ref)?.keyPropNames || []), ..._0x104e72.filter(_0x4f051a => _0x4f051a.kind === "prop" && _0x4f051a.sourceSceneRefs.includes(_0xaa8576.ref)).map(_0x294bb2 => _0x294bb2.name)])
  }));
  return {
    schemaVersion: STORY_ASSET_BATCHED_EXTRACTION_SCHEMA_VERSION,
    assets: _0x104e72,
    sceneAudits: _0x297e89
  };
}
function getStoryAssetInventoryIdentity(_0x8824b3 = {}) {
  return normalizeText(_0x8824b3?.kind) + ":" + normalizeText(_0x8824b3?.name).toLowerCase();
}
function resolveMergedStoryCharacterRole(_0x18ba00 = "", _0x2bab26 = "") {
  const _0x2c3c93 = [normalizeStoryAssetFinalCharacterRole(_0x18ba00), normalizeStoryAssetFinalCharacterRole(_0x2bab26)];
  if (_0x2c3c93.includes("主角")) {
    return "主角";
  }
  if (_0x2c3c93.includes("反派")) {
    return "反派";
  }
  if (_0x2c3c93.includes("配角")) {
    return "配角";
  }
  return "路人";
}
function createUniqueStoryAssetInventoryRef(_0x170c9b, _0x1397e8, _0x24abd7) {
  const _0x5defd1 = normalizeReference(_0x170c9b, _0x24abd7);
  let _0x25dc93 = _0x5defd1;
  let _0x557c07 = 2;
  while (_0x1397e8.has(_0x25dc93)) {
    _0x25dc93 = _0x5defd1 + "-" + _0x557c07;
    _0x557c07 += 1;
  }
  _0x1397e8.add(_0x25dc93);
  return _0x25dc93;
}
function createUniqueStoryAssetAppearanceRef(_0x1e368c, _0x5400e0, _0x2748ad) {
  const _0x43b2bb = normalizeReference(_0x1e368c, _0x2748ad);
  if (!_0x5400e0.has(_0x43b2bb)) {
    _0x5400e0.add(_0x43b2bb);
    return _0x43b2bb;
  }
  return createUniqueStoryAssetInventoryRef(_0x2748ad, _0x5400e0, _0x2748ad);
}
function mergeStoryAssetInventoryAppearance(_0x3cb861, _0x59b214) {
  _0x3cb861.description = _0x3cb861.description || _0x59b214.description;
  _0x3cb861.sourceSceneRefs = normalizeStringArray([..._0x3cb861.sourceSceneRefs, ..._0x59b214.sourceSceneRefs]);
  return _0x3cb861;
}
export function mergeStoryAssetInventoryResults(_0x1e6b55 = [], {
  sourceScenes = []
} = {}) {
  const _0x233e0c = [];
  const _0x261d55 = new Map();
  const _0x5624f7 = new Map();
  (Array.isArray(_0x1e6b55) ? _0x1e6b55 : []).forEach(_0x326ddf => {
    (Array.isArray(_0x326ddf?.assets) ? _0x326ddf.assets : []).forEach(_0x3f045d => {
      const _0x4f916c = getStoryAssetInventoryIdentity(_0x3f045d);
      const _0x593103 = _0x261d55.get(_0x4f916c);
      if (!_0x593103) {
        const _0x48ab67 = {
          ..._0x3f045d,
          sourceSceneRefs: [..._0x3f045d.sourceSceneRefs],
          appearances: _0x3f045d.appearances.map(_0x189718 => ({
            ..._0x189718,
            sourceSceneRefs: [..._0x189718.sourceSceneRefs]
          }))
        };
        _0x261d55.set(_0x4f916c, _0x48ab67);
        _0x233e0c.push(_0x48ab67);
        return;
      }
      _0x593103.description = _0x593103.description || _0x3f045d.description;
      _0x593103.sourceSceneRefs = normalizeStringArray([..._0x593103.sourceSceneRefs, ..._0x3f045d.sourceSceneRefs]);
      if (_0x593103.kind === "character") {
        _0x593103.role = resolveMergedStoryCharacterRole(_0x593103.role, _0x3f045d.role);
      } else if (_0x593103.kind === "prop") {
        const _0x4f9c3a = _0x593103.appearances[0];
        _0x3f045d.appearances.forEach(_0x2f3e34 => {
          mergeStoryAssetInventoryAppearance(_0x4f9c3a, _0x2f3e34);
        });
        return;
      }
      _0x3f045d.appearances.forEach(_0x5861f6 => {
        const _0x1da06c = normalizeText(_0x5861f6.name).toLowerCase();
        const _0x6459fe = _0x593103.appearances.find(_0x45c12a => normalizeText(_0x45c12a.name).toLowerCase() === _0x1da06c);
        if (_0x6459fe) {
          mergeStoryAssetInventoryAppearance(_0x6459fe, _0x5861f6);
        } else {
          _0x593103.appearances.push({
            ..._0x5861f6,
            sourceSceneRefs: [..._0x5861f6.sourceSceneRefs]
          });
        }
      });
    });
    (Array.isArray(_0x326ddf?.sceneAudits) ? _0x326ddf.sceneAudits : []).forEach(_0x42f7cb => {
      const _0x315b2e = normalizeText(_0x42f7cb?.sourceSceneRef);
      if (!_0x315b2e) {
        return;
      }
      const _0x141215 = _0x5624f7.get(_0x315b2e) || {
        sourceSceneRef: _0x315b2e,
        characterNames: [],
        keyPropNames: []
      };
      _0x141215.characterNames = normalizeStringArray([..._0x141215.characterNames, ...normalizeStringArray(_0x42f7cb?.characterNames)]);
      _0x141215.keyPropNames = normalizeStringArray([..._0x141215.keyPropNames, ...normalizeStringArray(_0x42f7cb?.keyPropNames)]);
      _0x5624f7.set(_0x315b2e, _0x141215);
    });
  });
  const _0x38e4a6 = new Set();
  const _0xff3a65 = new Set();
  _0x233e0c.forEach((_0x5b676c, _0x681665) => {
    _0x5b676c.ref = createUniqueStoryAssetInventoryRef(_0x5b676c.ref, _0x38e4a6, "asset-" + (_0x681665 + 1));
    _0x5b676c.appearances = _0x5b676c.appearances.map((_0x52164c, _0x96bc79) => ({
      ..._0x52164c,
      ref: createUniqueStoryAssetAppearanceRef(_0x52164c.ref, _0xff3a65, _0x5b676c.ref + "-appearance-" + (_0x96bc79 + 1))
    }));
  });
  return parseStoryAssetInventoryResult({
    assets: _0x233e0c,
    sceneAudits: [..._0x5624f7.values()]
  }, {
    sourceScenes: sourceScenes
  });
}
function pushCoverageIssue(_0x5169d6, _0x2ccb92) {
  const _0x17d8c5 = JSON.stringify(_0x2ccb92);
  if (!_0x5169d6.some(_0x4c83ab => JSON.stringify(_0x4c83ab) === _0x17d8c5)) {
    _0x5169d6.push(_0x2ccb92);
  }
}
export function inspectStoryAssetInventoryCoverage(_0x1d1f8f = {}, _0x5d70c2 = []) {
  const _0x4f3c14 = Array.isArray(_0x1d1f8f?.assets) ? _0x1d1f8f.assets : [];
  const _0x49f138 = new Map((Array.isArray(_0x1d1f8f?.sceneAudits) ? _0x1d1f8f.sceneAudits : []).map(_0x5da072 => [_0x5da072.sourceSceneRef, _0x5da072]));
  const _0x9061ad = [];
  _0x5d70c2.forEach(_0x227935 => {
    const _0x2fbeeb = _0x4f3c14.filter(_0x46d80f => _0x46d80f.kind === "scene" && _0x46d80f.sourceSceneRefs.includes(_0x227935.ref));
    const _0x3dcb0d = /[/／|｜]/u.test(normalizeText(_0x227935?.assetHeading || _0x227935?.heading));
    if (!_0x2fbeeb.length || !_0x3dcb0d && _0x2fbeeb.length > 1) {
      pushCoverageIssue(_0x9061ad, {
        type: _0x2fbeeb.length ? "duplicate-scene-assets" : "missing-scene-asset",
        sourceSceneRef: _0x227935.ref,
        expectedName: _0x227935.heading,
        assetRefs: _0x2fbeeb.map(_0x266581 => _0x266581.ref)
      });
    }
    (_0x49f138.get(_0x227935.ref)?.keyPropNames || []).forEach(_0x1f2f37 => {
      const _0x2b9ca3 = _0x4f3c14.filter(_0x10400b => _0x10400b.kind === "prop" && _0x10400b.name === _0x1f2f37 && _0x10400b.sourceSceneRefs.includes(_0x227935.ref));
      if (_0x2b9ca3.length !== 1) {
        pushCoverageIssue(_0x9061ad, {
          type: _0x2b9ca3.length ? "duplicate-key-props" : "missing-key-prop",
          sourceSceneRef: _0x227935.ref,
          expectedName: _0x1f2f37,
          assetRefs: _0x2b9ca3.map(_0x41096b => _0x41096b.ref)
        });
      }
    });
    (_0x49f138.get(_0x227935.ref)?.characterNames || []).forEach(_0x56630a => {
      const _0x430c1b = _0x4f3c14.filter(_0x435746 => _0x435746.kind === "character" && storyCharacterNamesOverlap(_0x435746.name, _0x56630a) && _0x435746.sourceSceneRefs.includes(_0x227935.ref));
      if (_0x430c1b.length !== 1) {
        pushCoverageIssue(_0x9061ad, {
          type: _0x430c1b.length ? "duplicate-scene-characters" : "missing-scene-character",
          sourceSceneRef: _0x227935.ref,
          expectedName: _0x56630a,
          assetRefs: _0x430c1b.map(_0x1d4f06 => _0x1d4f06.ref)
        });
      }
    });
  });
  _0x4f3c14.forEach(_0x43e70c => {
    _0x43e70c.sourceSceneRefs.forEach(_0x511aa2 => {
      const _0x45f765 = _0x43e70c.appearances.filter(_0x482885 => _0x482885.sourceSceneRefs.includes(_0x511aa2)).map(_0x582aa7 => _0x582aa7.ref);
      if (!_0x45f765.length) {
        pushCoverageIssue(_0x9061ad, {
          type: "missing-appearance-mapping",
          sourceSceneRef: _0x511aa2,
          expectedName: _0x43e70c.name,
          assetRefs: [_0x43e70c.ref],
          appearanceRefs: _0x45f765
        });
      }
    });
  });
  return _0x9061ad;
}
export function buildStoryAssetInventoryRepairPrompt({
  inventory = {},
  sourceScenes = [],
  coverageIssues = []
} = {}) {
  const _0x5593c1 = new Set(coverageIssues.map(_0x1a9e2b => _0x1a9e2b.sourceSceneRef));
  const _0x527777 = new Set(coverageIssues.flatMap(_0x15e342 => _0x15e342.assetRefs || []));
  const _0x2d53ff = sourceScenes.filter(_0x41d17e => _0x5593c1.has(_0x41d17e.ref));
  const _0x386d2e = (inventory.assets || []).filter(_0x4fd54b => _0x527777.has(_0x4fd54b.ref) || _0x4fd54b.sourceSceneRefs.some(_0x4c613c => _0x5593c1.has(_0x4c613c)));
  return JSON.stringify({
    task: "repair_story_asset_inventory_coverage",
    schemaVersion: STORY_ASSET_BATCHED_EXTRACTION_SCHEMA_VERSION,
    coverageIssues: coverageIssues,
    sourceScenes: _0x2d53ff,
    currentAssets: _0x386d2e,
    requirements: ["只修复 coverageIssues；未在 currentAssets 中出现且未被问题点名的资产不得改动。", "缺失项用 upserts 新增；来源映射错误用同 ref 的完整资产覆盖；确需删除的重复资产写入 removeAssetRefs。", "仍然只返回轻量资产，不生成 voiceDescription 或图片 prompt。"],
    outputSchema: {
      upserts: [{
        ref: "新增或需要替换的资产 ref",
        kind: "character、scene 或 prop",
        name: "资产名称",
        role: "角色为主角、配角、反派或路人",
        description: "简短用途说明",
        sourceSceneRefs: ["sourceScenes[].ref"],
        appearances: [{
          ref: "形象 ref",
          name: "形象状态",
          description: "状态差异",
          sourceSceneRefs: ["sourceScenes[].ref"]
        }]
      }],
      removeAssetRefs: ["需要删除的 currentAssets[].ref"]
    }
  });
}
function createStoryAssetInventoryRepairBatches({
  inventory = {},
  sourceScenes = [],
  coverageIssues = [],
  maxPromptCharacters = STORY_ASSET_INVENTORY_PROMPT_TARGET_CHARACTERS
} = {}) {
  const _0x1df822 = Math.max(4000, Math.trunc(Number(maxPromptCharacters) || 0));
  const _0x24f0e1 = [];
  let _0xa45f75 = [];
  coverageIssues.forEach(_0x132893 => {
    const _0x5942bb = [..._0xa45f75, _0x132893];
    const _0x282ab4 = buildStoryAssetInventoryRepairPrompt({
      inventory: inventory,
      sourceScenes: sourceScenes,
      coverageIssues: _0x5942bb
    }).length;
    if (_0xa45f75.length && _0x282ab4 > _0x1df822) {
      _0x24f0e1.push(_0xa45f75);
      _0xa45f75 = [_0x132893];
      return;
    }
    _0xa45f75 = _0x5942bb;
  });
  if (_0xa45f75.length) {
    _0x24f0e1.push(_0xa45f75);
  }
  return _0x24f0e1;
}
function parseStoryAssetInventoryRepairResult(_0x4d6e46, {
  sourceScenes = [],
  inventory = {}
} = {}) {
  const _0x5c5849 = parseStrictJson(getResultText(_0x4d6e46), "Agent 未返回资产清单修复结果。");
  const _0x59b46b = normalizeInventoryAssets(_0x5c5849?.upserts, {
    sourceScenes: sourceScenes,
    allowEmpty: true
  });
  const _0x458fcc = new Set((inventory.assets || []).map(_0x3401ac => _0x3401ac.ref));
  const _0x964c43 = normalizeStringArray(_0x5c5849?.removeAssetRefs);
  const _0x1d0567 = _0x964c43.find(_0x537ae7 => !_0x458fcc.has(_0x537ae7));
  if (_0x1d0567) {
    throw new Error("资产清单修复尝试删除不存在的资产：" + _0x1d0567 + "。");
  }
  if (!_0x59b46b.length && !_0x964c43.length) {
    throw new Error("资产清单修复没有返回任何改动。");
  }
  return {
    upserts: _0x59b46b,
    removeAssetRefs: _0x964c43
  };
}
function applyStoryAssetInventoryRepair(_0x2a5aeb, _0x3692ac) {
  const _0x53ff6e = new Set(_0x3692ac.removeAssetRefs || []);
  const _0x599376 = new Map((_0x3692ac.upserts || []).map(_0x408e20 => [_0x408e20.ref, _0x408e20]));
  const _0x1dce87 = (_0x2a5aeb.assets || []).filter(_0x4c6929 => !_0x53ff6e.has(_0x4c6929.ref)).map(_0x50ca90 => _0x599376.get(_0x50ca90.ref) || _0x50ca90);
  const _0x53fa75 = new Set(_0x1dce87.map(_0x5b47c4 => _0x5b47c4.ref));
  (_0x3692ac.upserts || []).forEach(_0x31a8a4 => {
    if (!_0x53fa75.has(_0x31a8a4.ref)) {
      _0x1dce87.push(_0x31a8a4);
      _0x53fa75.add(_0x31a8a4.ref);
    }
  });
  return {
    ..._0x2a5aeb,
    assets: _0x1dce87
  };
}
export function createStoryAssetExtractionBatches(_0x1c3524 = [], {
  targetOutputCharacters = STORY_ASSET_DETAIL_TARGET_OUTPUT_CHARACTERS,
  maxOutputCharacters = STORY_ASSET_DETAIL_MAX_OUTPUT_CHARACTERS,
  maxAssetsPerBatch = STORY_ASSET_DETAIL_MAX_ASSETS_PER_BATCH,
  estimateByKind = {}
} = {}) {
  const _0x37335b = Array.isArray(_0x1c3524) ? _0x1c3524 : [];
  if (!_0x37335b.length) {
    return [];
  }
  const _0x55415e = Math.max(4000, Math.trunc(Number(targetOutputCharacters) || 0));
  const _0x30c6aa = Math.max(_0x55415e, Math.trunc(Number(maxOutputCharacters) || 0));
  const _0x5b004f = Math.max(1, Math.trunc(Number(maxAssetsPerBatch) || 0));
  const _0x453b59 = {
    character: 2200,
    scene: 1200,
    prop: 1200
  };
  const _0x463b68 = (_0x3a91ef = {}) => {
    const _0x472817 = normalizeText(_0x3a91ef?.kind);
    const _0xe7ef26 = Math.max(600, Math.trunc(Number(estimateByKind?.[_0x472817]) || _0x453b59[_0x472817] || 1400));
    const _0x1ae28c = Math.max(1, Array.isArray(_0x3a91ef?.appearances) ? _0x3a91ef.appearances.length : 1);
    return Math.min(_0x30c6aa, _0xe7ef26 + Math.max(0, _0x1ae28c - 1) * 1100);
  };
  const _0x52686c = [];
  let _0x33939c = [];
  let _0x5e5a9f = 0;
  _0x37335b.forEach(_0x44bd19 => {
    const _0x36d855 = _0x463b68(_0x44bd19);
    if (_0x33939c.length && (_0x33939c.length >= _0x5b004f || _0x5e5a9f + _0x36d855 > _0x55415e)) {
      _0x52686c.push(_0x33939c);
      _0x33939c = [];
      _0x5e5a9f = 0;
    }
    _0x33939c.push(_0x44bd19);
    _0x5e5a9f += _0x36d855;
    if (_0x5e5a9f >= _0x30c6aa) {
      _0x52686c.push(_0x33939c);
      _0x33939c = [];
      _0x5e5a9f = 0;
    }
  });
  if (_0x33939c.length) {
    _0x52686c.push(_0x33939c);
  }
  return _0x52686c;
}
function compactStoryAssetDetailSourceBody(_0xb5c429 = "") {
  const _0x8523a5 = normalizeText(_0xb5c429);
  if ([..._0x8523a5].length <= STORY_ASSET_DETAIL_SOURCE_BODY_MAX_CHARACTERS) {
    return _0x8523a5;
  }
  const _0x534d32 = "\n……\n";
  const _0x38a4af = Math.max(1, STORY_ASSET_DETAIL_SOURCE_BODY_MAX_CHARACTERS - [..._0x534d32].length);
  const _0x2c5627 = Math.floor(_0x38a4af * 0.7);
  const _0xde8d63 = _0x38a4af - _0x2c5627;
  return "" + [..._0x8523a5].slice(0, _0x2c5627).join("") + _0x534d32 + [..._0x8523a5].slice(-_0xde8d63).join("");
}
function selectStoryAssetDetailSourceScenes(_0x55568c = [], _0x1bc198 = []) {
  const _0x43b546 = new Set();
  const _0x1f1c81 = _0xe88c53 => {
    const _0xc58b91 = normalizeText(_0xe88c53);
    if (!_0xc58b91 || _0x43b546.size >= STORY_ASSET_DETAIL_SOURCE_SCENE_MAX_COUNT) {
      return;
    }
    _0x43b546.add(_0xc58b91);
  };
  _0x55568c.forEach(_0x31223e => _0x1f1c81(_0x31223e.sourceSceneRefs[0]));
  _0x55568c.forEach(_0x9ada1b => {
    _0x9ada1b.appearances.forEach(_0x34f6d3 => _0x1f1c81(_0x34f6d3.sourceSceneRefs[0]));
  });
  _0x55568c.forEach(_0x25ec52 => _0x1f1c81(_0x25ec52.sourceSceneRefs.at(-1)));
  return _0x1bc198.filter(_0x84c0ae => _0x43b546.has(_0x84c0ae.ref)).map(_0x3440f1 => ({
    ..._0x3440f1,
    body: compactStoryAssetDetailSourceBody(_0x3440f1.body)
  }));
}
export function buildStoryAssetDetailBatchPrompt({
  project = {},
  sourceScenes = [],
  batches = [],
  batchIndex = 0,
  aspectRatio = "",
  visualStyle = ""
} = {}) {
  const _0x43a934 = normalizeStoryContext(project);
  const _0x42b623 = Array.isArray(batches?.[batchIndex]) ? batches[batchIndex] : [];
  if (!_0x42b623.length) {
    throw new Error("资产提取缺少当前细化批次。");
  }
  const _0x426d95 = _0x42b623.map(_0x5e4d00 => ({
    ref: _0x5e4d00.ref,
    kind: _0x5e4d00.kind,
    name: _0x5e4d00.name,
    role: _0x5e4d00.role,
    appearances: _0x5e4d00.appearances.map(_0x1449f1 => ({
      ref: _0x1449f1.ref,
      name: _0x1449f1.name
    }))
  }));
  const _0x3a4e43 = createStoryAssetEvidenceDossiers(_0x42b623, sourceScenes, {
    includeSourceMappings: false
  });
  const _0x22653b = normalizeText(visualStyle) || _0x43a934.visualStyle;
  return JSON.stringify({
    task: "detail_story_asset_batch",
    schemaVersion: STORY_ASSET_BATCHED_EXTRACTION_SCHEMA_VERSION,
    batch: {
      index: batchIndex + 1,
      total: batches.length
    },
    storyContext: {
      title: _0x43a934.title,
      storyType: _0x43a934.storyType,
      summary: _0x43a934.summary,
      background: _0x43a934.background,
      setting: _0x43a934.setting,
      continuityFacts: _0x43a934.continuityFacts,
      characters: _0x43a934.characters
    },
    visualDirection: {
      aspectRatio: normalizeText(aspectRatio) || _0x43a934.aspectRatio,
      style: _0x22653b
    },
    assetPlans: _0x426d95,
    evidenceDossiers: _0x3a4e43,
    requirements: ["严格按 assetPlans 顺序返回同 ref 的全部资产，不得新增、删除、合并或重排。", "严格按每个 assetPlans[].appearances 顺序返回同 ref 的全部形象，不得改变来源映射。", "storyContext.characters[].fixedTraits 与 continuityFacts 优先于自由视觉设计，任何资产设定都不得与其冲突。", "逐项阅读与 assetPlans[].ref 对应的 evidenceDossiers[].evidence；不需要也不得索取完整剧本。", "scriptFacts 只写证据明确支持的身份、外观、关系、归属、空间结构或状态；证据没写的内容不得放入 scriptFacts。", "为了形成可直接生成的完整形象，可以在 visualDesign 中合理补足年龄外观、五官、发型、服装细节、配色、材质或空间视觉细节。", "description 必须由“剧本事实：...”和“视觉补全：...”组成；没有明确事实或无需补全时对应部分写“未明确”或“无需补全”。", "角色填写九项 voiceDescription；场景和道具留空。", "每个 appearance.prompt 必须信息充分、可直接用于图片生成。", "角色 prompt 必须聚焦脸部、发型、体态、服装、鞋履和必要穿戴细节，采用自然站立的正面全身独立人设图，不写剧情道具、动作表演或场景环境。", "最终 prompt 只写正向视觉内容，不复述任何规则、限制、处理流程、模型说明或其他元说明措辞。", "场景 prompt 默认无人；道具 prompt 默认无人手持。", _0x22653b ? "每个 appearance.prompt 必须逐字以 visualDirection.style 的完整内容开头。" : "图片提示词保持统一视觉方向。"],
    outputSchema: {
      assets: [{
        ref: "逐字使用 assetPlans[].ref",
        scriptFacts: "仅由原文证据和已确认项目设定直接支持的事实",
        visualDesign: "为生成完整视觉资产而增加、且不与事实冲突的设计补全",
        voiceDescription: "仅角色填写九项声音设定",
        appearances: [{
          ref: "逐字使用 assetPlans[].appearances[].ref",
          scriptFacts: "该形象由证据直接支持的事实或状态差异",
          visualDesign: "该形象为生成图片增加的视觉设计",
          prompt: "可直接用于图片生成的中文提示词"
        }]
      }]
    }
  });
}
export function createStoryAssetDetailPromptBatches(_0x4bcf03 = [], {
  project = {},
  sourceScenes = [],
  aspectRatio = "",
  visualStyle = "",
  estimateByKind = {},
  maxPromptCharacters = STORY_ASSET_DETAIL_PROMPT_TARGET_CHARACTERS
} = {}) {
  const _0x4d2d20 = Math.max(8000, Math.trunc(Number(maxPromptCharacters) || 0));
  const _0x8d1ce7 = createStoryAssetExtractionBatches(_0x4bcf03, {
    estimateByKind: estimateByKind
  });
  const _0x1c3a25 = [];
  _0x8d1ce7.forEach(_0x516556 => {
    let _0x1413b2 = [];
    _0x516556.forEach(_0x5e0cc0 => {
      const _0x4b2293 = [..._0x1413b2, _0x5e0cc0];
      const _0x55f070 = buildStoryAssetDetailBatchPrompt({
        project: project,
        sourceScenes: sourceScenes,
        batches: [_0x4b2293],
        batchIndex: 0,
        aspectRatio: aspectRatio,
        visualStyle: visualStyle
      }).length;
      if (_0x1413b2.length && _0x55f070 > _0x4d2d20) {
        _0x1c3a25.push(_0x1413b2);
        _0x1413b2 = [_0x5e0cc0];
        const _0x4c1203 = buildStoryAssetDetailBatchPrompt({
          project: project,
          sourceScenes: sourceScenes,
          batches: [_0x1413b2],
          batchIndex: 0,
          aspectRatio: aspectRatio,
          visualStyle: visualStyle
        }).length;
        if (_0x4c1203 > _0x4d2d20) {
          throw new Error("资产“" + _0x5e0cc0.name + "”的证据档案达到 " + _0x4c1203 + " 字，超过单批 " + _0x4d2d20 + " 字上限。");
        }
        return;
      }
      if (_0x55f070 > _0x4d2d20) {
        throw new Error("资产“" + _0x5e0cc0.name + "”的证据档案达到 " + _0x55f070 + " 字，超过单批 " + _0x4d2d20 + " 字上限。");
      }
      _0x1413b2 = _0x4b2293;
    });
    if (_0x1413b2.length) {
      _0x1c3a25.push(_0x1413b2);
    }
  });
  return _0x1c3a25;
}
const STORY_ASSET_VOICE_DESCRIPTION_FIELDS = Object.freeze(["年龄", "性别", "身份", "口音", "情绪底色", "声线", "语速", "说话方式", "音色特征"]);
function normalizeStoryAssetNaturalVoiceDescription(_0x23470a) {
  const _0x3e6a09 = _0x23470a && typeof _0x23470a === "object" && !Array.isArray(_0x23470a) ? _0x23470a : null;
  const _0x36e787 = normalizeText(_0x23470a);
  if (!_0x36e787 && !_0x3e6a09) {
    return "";
  }
  try {
    const _0x2055bb = _0x3e6a09 || JSON.parse(_0x36e787);
    if (_0x2055bb && typeof _0x2055bb === "object" && !Array.isArray(_0x2055bb)) {
      const _0x3ec6fa = {
        年龄: normalizeText(_0x2055bb.年龄 || _0x2055bb.age),
        性别: normalizeText(_0x2055bb.性别 || _0x2055bb.gender),
        身份: normalizeText(_0x2055bb.身份 || _0x2055bb.identity),
        口音: normalizeText(_0x2055bb.口音 || _0x2055bb.accent),
        情绪底色: normalizeText(_0x2055bb.情绪底色 || _0x2055bb.emotionalBase || _0x2055bb.emotionalTone),
        声线: normalizeText(_0x2055bb.声线 || _0x2055bb.voiceTexture || _0x2055bb.voiceType || _0x2055bb.voice),
        语速: normalizeText(_0x2055bb.语速 || _0x2055bb.voiceSpeed || _0x2055bb.speed),
        说话方式: normalizeText(_0x2055bb.说话方式 || _0x2055bb.speechPattern || _0x2055bb.speechManner || _0x2055bb.speakingStyle),
        音色特征: normalizeText(_0x2055bb.音色特征 || _0x2055bb.timbre || _0x2055bb.toneColor)
      };
      if (STORY_ASSET_VOICE_DESCRIPTION_FIELDS.every(_0x3e7a62 => _0x3ec6fa[_0x3e7a62])) {
        return STORY_ASSET_VOICE_DESCRIPTION_FIELDS.map(_0x2e436b => _0x2e436b + "：" + _0x3ec6fa[_0x2e436b]).join("；");
      }
    }
  } catch {}
  if (!_0x36e787) {
    return "";
  }
  if (STORY_ASSET_VOICE_DESCRIPTION_FIELDS.every(_0x1c3023 => new RegExp(_0x1c3023 + "\\s*[：:]", "u").test(_0x36e787))) {
    return _0x36e787;
  }
  const _0x771f01 = _0x420fe7 => normalizeText(_0x36e787.match(new RegExp(_0x420fe7 + "(?:为|是|偏|呈|如|习惯|[:：])?([^，,；;。]+)", "u"))?.[1]);
  const _0x3d63a6 = normalizeText(_0x36e787.match(/(?:^|[，,；;])(?:约)?(幼年|少年|青年|中年|中老年|老年)/u)?.[1]);
  const _0xf11335 = normalizeText(_0x36e787.match(/(?:约)?([零〇一二两三四五六七八九十百\d]{1,4}岁|[二三四五六七八九]十(?:出头|上下))/u)?.[1]);
  const _0x4ab1dd = /女性|女声/u.test(_0x36e787) ? "女" : /男性|男声/u.test(_0x36e787) ? "男" : "";
  const _0x9f6dbf = _0x36e787.split(/[，,；;。]+/u).map(normalizeText).filter(Boolean);
  const _0x226c9e = _0x36e787.split(/[；;]+/u).map(normalizeText).filter(Boolean);
  if (_0x226c9e.length === STORY_ASSET_VOICE_DESCRIPTION_FIELDS.length && (_0x3d63a6 || _0xf11335) && _0x4ab1dd && /口音/u.test(_0x226c9e[3]) && /声线/u.test(_0x226c9e[5]) && /语速/u.test(_0x226c9e[6]) && /说话/u.test(_0x226c9e[7]) && /音色/u.test(_0x226c9e[8])) {
    const _0x30a005 = (_0x3f64e3, _0x5193a9) => normalizeText(_0x3f64e3.replace(new RegExp("^" + _0x5193a9 + "\\s*(?:约|为|是|偏|呈|[:：])?\\s*", "u"), ""));
    const _0x52ae3d = {
      年龄: normalizeStringArray([_0x3d63a6, _0xf11335]).join("，"),
      性别: _0x4ab1dd,
      身份: _0x30a005(_0x226c9e[2], "身份"),
      口音: _0x30a005(_0x226c9e[3], "口音"),
      情绪底色: _0x30a005(_0x226c9e[4], "情绪底色"),
      声线: _0x30a005(_0x226c9e[5], "声线"),
      语速: _0x30a005(_0x226c9e[6], "语速"),
      说话方式: _0x30a005(_0x226c9e[7], "说话方式"),
      音色特征: _0x30a005(_0x226c9e[8], "音色(?:特征)?")
    };
    if (STORY_ASSET_VOICE_DESCRIPTION_FIELDS.every(_0x34cb42 => _0x52ae3d[_0x34cb42])) {
      return STORY_ASSET_VOICE_DESCRIPTION_FIELDS.map(_0x18fd4f => _0x18fd4f + "：" + _0x52ae3d[_0x18fd4f]).join("；");
    }
  }
  const _0x16afad = _0x9f6dbf.find((_0x319186, _0x4b154e) => _0x4b154e > 0 && !/(?:幼年|少年|青年|中年|中老年|老年|男性|女性|男声|女声)/u.test(_0x319186) && !/(?:[零〇一二两三四五六七八九十百\d]{1,4}岁|[二三四五六七八九]十(?:出头|上下))/u.test(_0x319186) && !/^(?:身份|口音|情绪底色|声线|语速|说话方式|音色)/u.test(_0x319186));
  const _0x5e9eb4 = {
    年龄: normalizeStringArray([_0x3d63a6, _0xf11335]).join("，"),
    性别: _0x4ab1dd,
    身份: _0x771f01("身份") || _0x16afad,
    口音: _0x771f01("口音"),
    情绪底色: _0x771f01("情绪底色"),
    声线: _0x771f01("声线"),
    语速: _0x771f01("语速"),
    说话方式: _0x771f01("说话方式"),
    音色特征: _0x771f01("音色(?:特征)?")
  };
  if (STORY_ASSET_VOICE_DESCRIPTION_FIELDS.some(_0x107993 => !_0x5e9eb4[_0x107993])) {
    return _0x36e787;
  }
  return STORY_ASSET_VOICE_DESCRIPTION_FIELDS.map(_0x3667e1 => _0x3667e1 + "：" + _0x5e9eb4[_0x3667e1]).join("；");
}
function parseStoryAssetDetailBatchResult(_0x3846c0, {
  assetPlans = [],
  chapterIds = [],
  visualStyle = ""
} = {}) {
  const _0x4ba2c3 = parseStrictJson(getResultText(_0x3846c0), "Agent 未返回资产细化结果。");
  const _0x4d37f2 = Array.isArray(_0x4ba2c3?.assets) ? _0x4ba2c3.assets : [];
  const _0x1c9bdd = new Map(_0x4d37f2.map(_0x33c116 => [normalizeReference(_0x33c116?.ref), _0x33c116]));
  if (_0x4d37f2.length !== assetPlans.length || _0x1c9bdd.size !== assetPlans.length) {
    throw new Error("资产细化结果必须与当前批次资产数量完全一致。");
  }
  const _0xc59c5b = assetPlans.map(_0x354339 => {
    const _0x5d64be = _0x1c9bdd.get(_0x354339.ref);
    if (!_0x5d64be) {
      throw new Error("资产细化结果缺少“" + _0x354339.ref + "”。");
    }
    const _0x234b6b = Array.isArray(_0x5d64be?.appearances) ? _0x5d64be.appearances : [];
    const _0x313582 = new Map(_0x234b6b.map(_0x5b83d3 => [normalizeReference(_0x5b83d3?.ref), _0x5b83d3]));
    if (_0x234b6b.length !== _0x354339.appearances.length || _0x313582.size !== _0x354339.appearances.length) {
      throw new Error("资产“" + _0x354339.name + "”的形象数量与轻量清单不一致。");
    }
    return {
      ..._0x5d64be,
      ref: _0x354339.ref,
      kind: _0x354339.kind,
      name: _0x354339.name,
      role: _0x354339.role,
      voiceDescription: _0x354339.kind === "character" ? normalizeStoryAssetNaturalVoiceDescription(_0x5d64be?.voiceDescription) : "",
      description: formatStoryAssetFactAndDesignDescription(_0x5d64be, _0x354339.description),
      occurrences: normalizeText(_0x5d64be?.occurrences) || _0x354339.occurrences,
      sourceChapterIds: _0x354339.sourceEpisodeRefs,
      appearances: _0x354339.appearances.map(_0x579b28 => {
        const _0x53410d = _0x313582.get(_0x579b28.ref);
        if (!_0x53410d) {
          throw new Error("资产“" + _0x354339.name + "”缺少形象“" + _0x579b28.ref + "”。");
        }
        const _0x1f4f97 = normalizeText(_0x53410d?.prompt);
        return {
          ..._0x53410d,
          ref: _0x579b28.ref,
          name: normalizeText(_0x53410d?.name) || _0x579b28.name,
          description: formatStoryAssetFactAndDesignDescription(_0x53410d, _0x579b28.description),
          occurrences: normalizeText(_0x53410d?.occurrences) || _0x579b28.occurrences,
          prompt: _0x1f4f97,
          sourceChapterIds: _0x579b28.sourceEpisodeRefs
        };
      })
    };
  });
  const _0x52c463 = parseStoryAssetExtractionResult({
    assets: _0xc59c5b
  }, {
    chapterIds: chapterIds
  });
  return _0x52c463.assets.map((_0x165db5, _0x1d254a) => {
    const _0xd290a4 = assetPlans[_0x1d254a];
    const _0xa6c23f = _0x1c9bdd.get(_0xd290a4.ref) || {};
    const _0x4e080a = new Map((Array.isArray(_0xa6c23f?.appearances) ? _0xa6c23f.appearances : []).map(_0x423249 => [normalizeReference(_0x423249?.ref), _0x423249]));
    const _0xf609e5 = _0x165db5.appearances.map((_0x4dcdd3, _0x29d014) => {
      const _0x4e5cdf = _0xd290a4.appearances[_0x29d014];
      const _0x1bb913 = _0x4e080a.get(_0x4e5cdf.ref) || {};
      return {
        ..._0x4dcdd3,
        scriptFacts: normalizeText(_0x1bb913?.scriptFacts),
        visualDesign: normalizeText(_0x1bb913?.visualDesign),
        designStatus: "ai-facts-plus-visual-completion",
        prompt: ensureStoryAssetVisualStyle(_0x4dcdd3.prompt, visualStyle),
        sourceEpisodeRefs: _0x4e5cdf.sourceEpisodeRefs,
        sourceSceneRefs: _0x4e5cdf.sourceSceneRefs
      };
    });
    return {
      ..._0x165db5,
      scriptFacts: normalizeText(_0xa6c23f?.scriptFacts),
      visualDesign: normalizeText(_0xa6c23f?.visualDesign),
      designStatus: "ai-facts-plus-visual-completion",
      prompt: _0xf609e5[0]?.prompt || normalizeText(_0x165db5?.prompt),
      sourceEpisodeRefs: _0xd290a4.sourceEpisodeRefs,
      sourceSceneRefs: _0xd290a4.sourceSceneRefs,
      appearances: _0xf609e5
    };
  });
}
function formatStoryAssetFactAndDesignDescription(_0x206315 = {}, _0x4db02f = "") {
  const _0x5cbc0e = stripStoryAssetInternalEvidenceMetadata(_0x206315?.scriptFacts);
  const _0x13c1df = stripStoryAssetInternalEvidenceMetadata(_0x206315?.visualDesign);
  const _0x11bfb5 = [_0x5cbc0e ? "剧本事实：" + _0x5cbc0e : "", _0x13c1df ? "视觉补全：" + _0x13c1df : ""].filter(Boolean);
  return _0x11bfb5.join("\n") || stripStoryAssetInternalEvidenceMetadata(_0x206315?.description) || stripStoryAssetInternalEvidenceMetadata(_0x4db02f);
}
function createCoverageError(_0x221566) {
  const _0x5f205a = _0x221566.slice(0, 3).map(_0x3573f4 => _0x3573f4.type + ":" + _0x3573f4.sourceSceneRef + (_0x3573f4.expectedName ? ":" + _0x3573f4.expectedName : "")).join("；");
  const _0x4f7d95 = new Error("实验资产清单覆盖校验未通过：" + _0x5f205a + "。");
  _0x4f7d95.validationDetails = {
    issues: _0x221566
  };
  return _0x4f7d95;
}
const STORY_ASSET_EXTRACTION_DRAFT_STRATEGY = "kind-compact-v7";
const STORY_ASSET_EVIDENCE_BATCHED_DRAFT_STRATEGY = "evidence-batched-api-v2";
function createStoryAssetStructuredOutput(_0x1bca0a, _0x56c6e4) {
  return {
    name: _0x1bca0a,
    schema: _0x56c6e4,
    strict: true,
    fallback: "none"
  };
}
function createStoryAssetKindStructuredOutput(_0x3284f4) {
  const _0x1f98a7 = normalizeStoryAssetKind(_0x3284f4);
  const _0x10ee47 = {
    name: {
      type: "string"
    }
  };
  const _0x164e4f = ["name"];
  if (_0x1f98a7 === "character") {
    _0x10ee47.role = {
      type: "string",
      enum: ["主角", "配角", "反派", "路人"]
    };
    _0x164e4f.push("role");
  }
  if (_0x1f98a7 === "scene") {
    _0x10ee47.sourceSceneRefs = {
      type: "array",
      minItems: 2,
      items: {
        type: "string"
      }
    };
    _0x164e4f.push("sourceSceneRefs");
  }
  return createStoryAssetStructuredOutput("story_asset_" + _0x1f98a7 + "_compact_v7", {
    type: "object",
    additionalProperties: false,
    required: ["assets"],
    properties: {
      assets: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          required: _0x164e4f,
          properties: _0x10ee47
        }
      }
    }
  });
}
function createStoryAssetInventoryStructuredOutput() {
  const _0xd6475d = {
    type: "object",
    additionalProperties: false,
    required: ["name", "sourceSceneRefs"],
    properties: {
      name: {
        type: "string"
      },
      sourceSceneRefs: {
        type: "array",
        items: {
          type: "string"
        }
      }
    }
  };
  return createStoryAssetStructuredOutput("story_asset_inventory_v5", {
    type: "object",
    additionalProperties: false,
    required: ["assets", "sceneAudits"],
    properties: {
      assets: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          required: ["kind", "name", "role", "sourceSceneRefs", "appearances"],
          properties: {
            kind: {
              type: "string",
              enum: STORY_ASSET_EXPERIMENTAL_KINDS
            },
            name: {
              type: "string"
            },
            role: {
              type: "string"
            },
            sourceSceneRefs: {
              type: "array",
              items: {
                type: "string"
              }
            },
            appearances: {
              type: "array",
              items: _0xd6475d
            }
          }
        }
      },
      sceneAudits: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          required: ["sourceSceneRef", "characterNames", "keyPropNames"],
          properties: {
            sourceSceneRef: {
              type: "string"
            },
            characterNames: {
              type: "array",
              items: {
                type: "string"
              }
            },
            keyPropNames: {
              type: "array",
              items: {
                type: "string"
              }
            }
          }
        }
      }
    }
  });
}
function createStoryAssetInventoryRepairStructuredOutput() {
  return createStoryAssetStructuredOutput("story_asset_inventory_repair_v5", {
    type: "object",
    additionalProperties: false,
    required: ["upserts", "removeAssetRefs"],
    properties: {
      upserts: createStoryAssetInventoryStructuredOutput().schema.properties.assets,
      removeAssetRefs: {
        type: "array",
        items: {
          type: "string"
        }
      }
    }
  });
}
function createStoryAssetDetailStructuredOutput(_0x1870ee = 0, _0x194586 = []) {
  const _0x569793 = Array.isArray(_0x194586) ? _0x194586 : [];
  const _0x2f16da = normalizeStringArray(_0x569793.map(_0x58fb85 => _0x58fb85?.ref));
  const _0x71e553 = normalizeStringArray(_0x569793.flatMap(_0x1b9ef4 => Array.isArray(_0x1b9ef4?.appearances) ? _0x1b9ef4.appearances.map(_0xf2b7b5 => _0xf2b7b5?.ref) : []));
  return createStoryAssetStructuredOutput("story_asset_detail_v5_" + (_0x1870ee + 1), {
    type: "object",
    additionalProperties: false,
    required: ["assets"],
    properties: {
      assets: {
        type: "array",
        ...(_0x2f16da.length ? {
          minItems: _0x2f16da.length,
          maxItems: _0x2f16da.length
        } : {}),
        items: {
          type: "object",
          additionalProperties: false,
          required: ["ref", "scriptFacts", "visualDesign", "voiceDescription", "appearances"],
          properties: {
            ref: _0x2f16da.length ? {
              type: "string",
              enum: _0x2f16da
            } : {
              type: "string"
            },
            scriptFacts: {
              type: "string"
            },
            visualDesign: {
              type: "string"
            },
            voiceDescription: {
              type: "string"
            },
            appearances: {
              type: "array",
              minItems: 1,
              items: {
                type: "object",
                additionalProperties: false,
                required: ["ref", "scriptFacts", "visualDesign", "prompt"],
                properties: {
                  ref: _0x71e553.length ? {
                    type: "string",
                    enum: _0x71e553
                  } : {
                    type: "string"
                  },
                  scriptFacts: {
                    type: "string"
                  },
                  visualDesign: {
                    type: "string"
                  },
                  prompt: {
                    type: "string"
                  }
                }
              }
            }
          }
        }
      }
    }
  });
}
function extractBalancedStoryAssetObjects(_0x24f9c9, _0x1bad9e = "assets") {
  const _0x46dac7 = normalizeText(getResultText(_0x24f9c9));
  const _0x6e5e3e = _0x46dac7.search(new RegExp("(?:\"" + _0x1bad9e + "\"|'" + _0x1bad9e + "')\\s*:", "u"));
  if (_0x6e5e3e < 0) {
    return [];
  }
  const _0x3cd293 = _0x46dac7.indexOf("[", _0x6e5e3e);
  if (_0x3cd293 < 0) {
    return [];
  }
  const _0x2ee6a8 = [];
  let _0x23e336 = -1;
  let _0x10fd56 = 0;
  let _0x560fc5 = false;
  let _0x45b496 = false;
  for (let _0x2a36c3 = _0x3cd293 + 1; _0x2a36c3 < _0x46dac7.length; _0x2a36c3 += 1) {
    const _0x80c094 = _0x46dac7[_0x2a36c3];
    if (_0x560fc5) {
      if (_0x45b496) {
        _0x45b496 = false;
      } else if (_0x80c094 === "\\") {
        _0x45b496 = true;
      } else if (_0x80c094 === "\"") {
        _0x560fc5 = false;
      }
      continue;
    }
    if (_0x80c094 === "\"") {
      _0x560fc5 = true;
      continue;
    }
    if (_0x80c094 === "{") {
      if (_0x10fd56 === 0) {
        _0x23e336 = _0x2a36c3;
      }
      _0x10fd56 += 1;
      continue;
    }
    if (_0x80c094 === "}" && _0x10fd56 > 0) {
      _0x10fd56 -= 1;
      if (_0x10fd56 === 0 && _0x23e336 >= 0) {
        try {
          _0x2ee6a8.push(JSON.parse(_0x46dac7.slice(_0x23e336, _0x2a36c3 + 1)));
        } catch {}
        _0x23e336 = -1;
      }
    }
    if (_0x80c094 === "]" && _0x10fd56 === 0) {
      break;
    }
  }
  return _0x2ee6a8;
}
function salvageStoryAssetInventoryResult(_0x489d17, {
  sourceScenes = []
} = {}) {
  const _0x190a9f = extractBalancedStoryAssetObjects(_0x489d17, "assets");
  const _0x27a9b4 = _0x190a9f.flatMap(_0x557bb4 => {
    try {
      return normalizeInventoryAssets([_0x557bb4], {
        sourceScenes: sourceScenes,
        allowEmpty: true
      });
    } catch {
      return [];
    }
  });
  if (!_0x27a9b4.length) {
    return null;
  }
  const _0x5113ce = new Set();
  _0x27a9b4.forEach((_0x1e8f40, _0x55c027) => {
    _0x1e8f40.ref = createUniqueStoryAssetInventoryRef(_0x1e8f40.ref, _0x5113ce, "asset-" + (_0x55c027 + 1));
  });
  return {
    schemaVersion: STORY_ASSET_BATCHED_EXTRACTION_SCHEMA_VERSION,
    assets: _0x27a9b4,
    sceneAudits: sourceScenes.map(_0x388060 => ({
      sourceSceneRef: _0x388060.ref,
      characterNames: normalizeStringArray(_0x27a9b4.filter(_0x5858cb => _0x5858cb.kind === "character" && _0x5858cb.sourceSceneRefs.includes(_0x388060.ref)).map(_0x58a665 => _0x58a665.name)),
      keyPropNames: normalizeStringArray(_0x27a9b4.filter(_0x4ac849 => _0x4ac849.kind === "prop" && _0x4ac849.sourceSceneRefs.includes(_0x388060.ref)).map(_0x2bbbae => _0x2bbbae.name))
    })),
    salvaged: true
  };
}
function parseStoryAssetInventoryResultWithSalvage(_0x494882, _0x3865a5 = {}) {
  try {
    return parseStoryAssetInventoryResult(_0x494882, _0x3865a5);
  } catch (_0x548a5d) {
    const _0x5e9195 = salvageStoryAssetInventoryResult(_0x494882, _0x3865a5);
    if (_0x5e9195) {
      return _0x5e9195;
    }
    throw _0x548a5d;
  }
}
function salvageStoryAssetDetailBatchResult(_0x313621, {
  assetPlans = [],
  chapterIds = [],
  visualStyle = ""
} = {}) {
  const _0x76fcc1 = new Map(extractBalancedStoryAssetObjects(_0x313621, "assets").map(_0x505fcc => [normalizeReference(_0x505fcc?.ref), _0x505fcc]));
  const _0x3ea315 = [];
  assetPlans.forEach(_0x56f969 => {
    const _0x255d91 = _0x76fcc1.get(_0x56f969.ref);
    if (!_0x255d91) {
      return;
    }
    try {
      _0x3ea315.push(...parseStoryAssetDetailBatchResult({
        assets: [_0x255d91]
      }, {
        assetPlans: [_0x56f969],
        chapterIds: chapterIds,
        visualStyle: visualStyle
      }));
    } catch {}
  });
  return _0x3ea315;
}
export function splitDeterministicStorySceneAssetNames(_0x1b48c9 = "") {
  const _0x48ec0e = /(?:客厅|厨房|走廊|卧室|书房|餐厅|浴室|卫生间|阳台|玄关)$/u;
  const _0x53c57b = normalizeText(_0x1b48c9).split(/[/／|｜]+/u).map(_0x15212b => normalizeStorySceneHeadingIdentity(_0x15212b)).filter(Boolean);
  const _0x1e263c = _0x53c57b[0] || "";
  const _0x283faa = _0x1e263c.replace(_0x48ec0e, "");
  const _0x365fad = [];
  _0x53c57b.map((_0x576abb, _0x10e67b) => _0x10e67b > 0 && _0x283faa && [..._0x576abb].length <= 4 && _0x48ec0e.test(_0x576abb) ? "" + _0x283faa + _0x576abb : _0x576abb).forEach(_0x83bd8d => {
    const _0x782b36 = getStorySceneIdentityKey(_0x83bd8d);
    if (_0x782b36 && !_0x365fad.some(_0xc80f58 => getStorySceneIdentityKey(_0xc80f58) === _0x782b36)) {
      _0x365fad.push(_0x83bd8d);
    }
  });
  return _0x365fad;
}
function createDeterministicStoryAssetInventory({
  project = {},
  sourceScenes = []
} = {}) {
  const _0x3b26af = (Array.isArray(project?.characters) ? project.characters : []).filter(_0x2603c4 => normalizeText(_0x2603c4?.name));
  const _0x408c3b = new Map();
  sourceScenes.forEach(_0xccef0c => {
    splitDeterministicStorySceneAssetNames(_0xccef0c.assetHeading || _0xccef0c.heading).forEach(_0x515944 => {
      const _0x42d560 = getStorySceneIdentityKey(_0x515944);
      const _0x4f3f85 = _0x408c3b.get(_0x42d560) || {
        name: _0x515944,
        sourceSceneRefs: []
      };
      _0x4f3f85.sourceSceneRefs.push(_0xccef0c.ref);
      _0x408c3b.set(_0x42d560, _0x4f3f85);
    });
  });
  const _0x35b6ee = [];
  _0x3b26af.forEach((_0x43aab3, _0x171651) => {
    const _0x512579 = normalizeText(_0x43aab3.name);
    const _0x2953f7 = getStoryAssetNameAliases(_0x512579);
    const _0xc9a2b1 = sourceScenes.filter(_0x51eb15 => _0x51eb15.characters.some(_0x5a0deb => storyCharacterNamesOverlap(_0x512579, _0x5a0deb)) || _0x2953f7.some(_0x134742 => _0x51eb15.body.includes(_0x134742))).map(_0x3e33e5 => _0x3e33e5.ref);
    if (!_0xc9a2b1.length) {
      return;
    }
    const _0x5eee4b = "local-character-" + (_0x171651 + 1);
    _0x35b6ee.push({
      ref: _0x5eee4b,
      kind: "character",
      name: _0x512579,
      role: resolveStoryCharacterRole(_0x43aab3?.roleType || _0x43aab3?.role),
      description: normalizeText(_0x43aab3?.profile || _0x43aab3?.fixedTraits),
      sourceSceneRefs: normalizeStringArray(_0xc9a2b1),
      appearances: [{
        ref: _0x5eee4b + "-base",
        name: "基础形象",
        description: normalizeText(_0x43aab3?.fixedTraits),
        sourceSceneRefs: normalizeStringArray(_0xc9a2b1)
      }]
    });
  });
  const _0x217f5a = createDeterministicStoryCharacterCandidateMap(sourceScenes);
  [..._0x217f5a.entries()].forEach(([_0x5f935d, _0x2283ad], _0x2f0ff2) => {
    const _0x3d0b05 = "local-source-character-" + (_0x2f0ff2 + 1);
    const _0x3e1574 = normalizeStringArray(_0x2283ad.sourceSceneRefs);
    _0x35b6ee.push({
      ref: _0x3d0b05,
      kind: "character",
      name: _0x5f935d,
      role: "配角",
      description: "",
      sourceSceneRefs: _0x3e1574,
      appearances: [{
        ref: _0x3d0b05 + "-base",
        name: "基础形象",
        description: "",
        sourceSceneRefs: _0x3e1574
      }]
    });
  });
  [..._0x408c3b.values()].forEach((_0x1849d0, _0x1c7fbf) => {
    const _0x11a175 = "local-scene-" + (_0x1c7fbf + 1);
    _0x35b6ee.push({
      ref: _0x11a175,
      kind: "scene",
      name: _0x1849d0.name,
      role: "剧情场景",
      description: "",
      sourceSceneRefs: normalizeStringArray(_0x1849d0.sourceSceneRefs),
      appearances: [{
        ref: _0x11a175 + "-base",
        name: "基础形象",
        description: "",
        sourceSceneRefs: normalizeStringArray(_0x1849d0.sourceSceneRefs)
      }]
    });
  });
  createStoryAssetActionPropCandidates(sourceScenes).forEach((_0x26856f, _0xfd0150) => {
    const _0x209139 = "local-action-prop-" + (_0xfd0150 + 1);
    _0x35b6ee.push({
      ref: _0x209139,
      kind: "prop",
      name: _0x26856f.name,
      role: "关键道具",
      description: "",
      sourceSceneRefs: normalizeStringArray(_0x26856f.sourceSceneRefs),
      appearances: [{
        ref: _0x209139 + "-base",
        name: "基础形象",
        description: "",
        sourceSceneRefs: normalizeStringArray(_0x26856f.sourceSceneRefs)
      }]
    });
  });
  return parseStoryAssetInventoryResult({
    assets: _0x35b6ee,
    sceneAudits: sourceScenes.map(_0x369287 => ({
      sourceSceneRef: _0x369287.ref,
      characterNames: [],
      keyPropNames: []
    }))
  }, {
    sourceScenes: sourceScenes
  });
}
function getStorySceneAssignmentScore(_0x3cb1f3, _0x13e5d6, _0x1e39da) {
  const _0x22dd61 = getStorySceneIdentityKey(_0x3cb1f3?.name);
  const _0x466dcf = getStorySceneIdentityKey(_0x13e5d6?.assetHeading || _0x13e5d6?.heading);
  const _0x4db47b = normalizeStringArray([...(_0x13e5d6?.localEntityCandidates?.scene || []), ...(_0x13e5d6?.localEntityEvidence || []).filter(_0x1322f6 => _0x1322f6?.kind === "scene").map(_0x1e2ad6 => _0x1e2ad6?.text)]);
  let _0x3f1194 = 0;
  if (_0x22dd61 && _0x22dd61 === _0x466dcf) {
    _0x3f1194 += 10000;
  }
  if (_0x4db47b.some(_0x5a985a => getStorySceneIdentityKey(_0x5a985a) === _0x22dd61)) {
    _0x3f1194 += 1000;
  }
  if (_0x22dd61 && _0x466dcf && storySceneIdentitiesOverlap(_0x22dd61, _0x466dcf)) {
    _0x3f1194 += 100;
  }
  _0x3f1194 -= Math.max(0, normalizeStringArray(_0x3cb1f3?.sourceSceneRefs).length - 1);
  return {
    score: _0x3f1194,
    assetIndex: _0x1e39da
  };
}
function getReusableStorySceneIdentityKey(_0x5f46e1) {
  return normalizeStorySceneHeadingIdentity(_0x5f46e1).replace(/[（(](?:稍后|封锁|断电|电力|后半夜|窗边|紧接|紧随|细雨|雨天)[^）)]*[）)]\s*$/u, "").replace(/宴会大厅/gu, "宴会厅").replace(/集团(?:总部|大楼|大厦)/gu, "集团").replace(/市区上空/gu, "市上空").toLowerCase().replace(/[^\p{L}\p{N}]+/gu, "");
}
function reconcileStorySceneAssetAssignments(_0x1e1a68 = [], _0x2e5333 = [], _0x324a7e = []) {
  const _0x26967e = _0x1e1a68.filter(_0x2b4a55 => _0x2b4a55?.kind === "scene");
  const _0x25f074 = new Map();
  _0x324a7e.forEach(_0x8ac764 => {
    const _0x318d28 = _0x26967e.map((_0x5501f1, _0x2c92df) => ({
      asset: _0x5501f1,
      assetIndex: _0x2c92df
    })).filter(({
      asset: _0x169a80
    }) => normalizeStringArray(_0x169a80?.sourceSceneRefs).includes(_0x8ac764.ref)).map(({
      asset: _0x2c2a15,
      assetIndex: _0x2d0300
    }) => ({
      asset: _0x2c2a15,
      ...getStorySceneAssignmentScore(_0x2c2a15, _0x8ac764, _0x2d0300)
    })).sort((_0x4ad496, _0x130058) => _0x130058.score - _0x4ad496.score || _0x4ad496.assetIndex - _0x130058.assetIndex);
    if (!_0x318d28.length) {
      return;
    }
    const _0x4025c7 = /[/／|｜]/u.test(normalizeText(_0x8ac764?.assetHeading || _0x8ac764?.heading));
    const _0x551250 = _0x4025c7 ? _0x318d28.map(_0x645da2 => _0x645da2.asset).filter(_0x32cf26 => !/[/／|｜]/u.test(normalizeText(_0x32cf26?.name))) : [_0x318d28[0].asset];
    if (_0x551250.length) {
      _0x25f074.set(_0x8ac764.ref, new Set(_0x551250));
    }
  });
  _0x324a7e.forEach(_0x58b75a => {
    if (_0x25f074.has(_0x58b75a.ref)) {
      return;
    }
    const _0x1ea732 = _0x2e5333.filter(_0x4e3cee => _0x4e3cee?.kind === "scene" && normalizeStringArray(_0x4e3cee?.sourceSceneRefs).includes(_0x58b75a.ref));
    if (!_0x1ea732.length) {
      return;
    }
    const _0x4ac6ba = /[/／|｜]/u.test(normalizeText(_0x58b75a?.assetHeading || _0x58b75a?.heading));
    const _0x2612c4 = _0x4ac6ba ? _0x1ea732.filter(_0x37a833 => !/[/／|｜]/u.test(normalizeText(_0x37a833?.name))) : _0x1ea732.slice(0, 1);
    const _0x378264 = new Set();
    _0x2612c4.forEach(_0x5692dd => {
      let _0x5cfad0 = _0x26967e.find(_0x559282 => normalizeText(_0x559282?.name).toLowerCase() === normalizeText(_0x5692dd.name).toLowerCase());
      if (!_0x5cfad0) {
        _0x5cfad0 = {
          ..._0x5692dd,
          sourceSceneRefs: [],
          appearances: _0x5692dd.appearances.slice(0, 1).map(_0x34d808 => ({
            ..._0x34d808,
            sourceSceneRefs: []
          }))
        };
        _0x1e1a68.push(_0x5cfad0);
        _0x26967e.push(_0x5cfad0);
      }
      _0x378264.add(_0x5cfad0);
    });
    if (_0x378264.size) {
      _0x25f074.set(_0x58b75a.ref, _0x378264);
    }
  });
  _0x26967e.forEach(_0x151153 => {
    const _0x40c7a6 = _0x324a7e.filter(_0x212397 => _0x25f074.get(_0x212397.ref)?.has(_0x151153)).map(_0x5492cd => _0x5492cd.ref);
    _0x151153.sourceSceneRefs = normalizeStringArray(_0x40c7a6);
    const _0x3bfba4 = _0x151153.appearances[0] || {
      ref: _0x151153.ref + "-base",
      name: "基础形象",
      description: "",
      sourceSceneRefs: []
    };
    _0x151153.appearances = (_0x151153.appearances.length ? _0x151153.appearances : [_0x3bfba4]).map(_0x4c7c54 => ({
      ..._0x4c7c54,
      sourceSceneRefs: normalizeStringArray(_0x4c7c54?.sourceSceneRefs).filter(_0x22cc2e => _0x151153.sourceSceneRefs.includes(_0x22cc2e))
    }));
    _0x151153.sourceSceneRefs.forEach(_0x58c5dc => {
      if (_0x151153.appearances.some(_0x41dcae => _0x41dcae.sourceSceneRefs.includes(_0x58c5dc))) {
        return;
      }
      _0x151153.appearances[0].sourceSceneRefs.push(_0x58c5dc);
    });
  });
  return _0x1e1a68;
}
export function reconcileStoryAssetInventory(_0x3d59ee = {}, {
  project = {},
  sourceScenes = []
} = {}) {
  const _0x5b80cf = createDeterministicStoryAssetInventory({
    project: project,
    sourceScenes: sourceScenes
  });
  const _0xccb3cf = createDeterministicStoryCharacterCandidateMap(sourceScenes);
  const _0x236d12 = getStoryAssetLocalCharacterCanonicalNames(sourceScenes);
  const _0x547490 = normalizeStringArray((Array.isArray(project?.characters) ? project.characters : []).map(_0x567782 => _0x567782?.name));
  _0x5b80cf.assets = mergeStoryAssetInventoryResults([{
    assets: _0x5b80cf.assets.map(_0x2e657a => _0x2e657a?.kind === "character" ? {
      ..._0x2e657a,
      name: resolveStoryProjectCharacterCanonicalName(_0x2e657a.name, _0x547490) || resolveStoryAssetCharacterCanonicalName(_0x2e657a.name, _0xccb3cf, _0x236d12)
    } : _0x2e657a),
    sceneAudits: []
  }], {
    sourceScenes: sourceScenes
  }).assets;
  const _0x3404aa = new Set(_0x5b80cf.assets.filter(_0x3f9680 => normalizeText(_0x3f9680?.ref).startsWith("local-source-character-")).map(_0x37d9a2 => normalizeText(_0x37d9a2?.name).toLowerCase()));
  const _0x412041 = new Set(_0x5b80cf.assets.filter(_0x4978c4 => normalizeText(_0x4978c4?.ref).startsWith("local-action-prop-")).map(_0x180140 => normalizeText(_0x180140?.name).toLowerCase()));
  const _0x4f36e1 = (cloneStoryAssetExtractionValue(_0x3d59ee?.assets) || []).filter(_0x2341a6 => {
    const _0x2d261f = normalizeText(_0x2341a6?.ref);
    const _0x61aaed = normalizeText(_0x2341a6?.name).toLowerCase();
    if (_0x2d261f.startsWith("local-source-character-")) {
      return _0x3404aa.has(_0x61aaed);
    }
    if (_0x2d261f.startsWith("local-action-prop-")) {
      return _0x412041.has(_0x61aaed);
    }
    return true;
  }).flatMap(_0x1cdbd2 => {
    if (_0x1cdbd2?.kind === "scene") {
      const _0x535502 = getReusableStorySceneIdentityKey(_0x1cdbd2?.name);
      const _0x388382 = normalizeStringArray(_0x1cdbd2?.sourceSceneRefs);
      const _0x5ada14 = _0x40a3b7 => _0x535502 && _0x535502 === getReusableStorySceneIdentityKey(_0x40a3b7?.assetHeading || _0x40a3b7?.heading);
      const _0xfa5ba5 = sourceScenes.find(_0x423793 => _0x388382.includes(_0x423793.ref) && _0x5ada14(_0x423793)) || sourceScenes.find(_0x5ada14);
      if (!_0xfa5ba5) {
        return [_0x1cdbd2];
      }
      const _0x5c5d16 = new Set(sourceScenes.filter(_0x5ada14).map(_0x849ae1 => _0x849ae1.ref));
      const _0xb600c7 = _0x388382.filter(_0x1696cc => _0x5c5d16.has(_0x1696cc));
      return [{
        ..._0x1cdbd2,
        name: normalizeText(_0xfa5ba5.assetHeading || _0xfa5ba5.heading),
        sourceSceneRefs: _0xb600c7,
        appearances: _0x1cdbd2.appearances.map(_0x15ea08 => ({
          ..._0x15ea08,
          sourceSceneRefs: normalizeStringArray(_0x15ea08?.sourceSceneRefs).filter(_0x25fd17 => _0x5c5d16.has(_0x25fd17))
        }))
      }];
    }
    if (_0x1cdbd2?.kind !== "character") {
      return [_0x1cdbd2];
    }
    const _0x300afc = normalizeDeterministicStoryCharacterCandidate(_0x1cdbd2?.name);
    if (!_0x300afc) {
      return [];
    }
    const _0x4e706e = resolveStoryProjectCharacterCanonicalName(_0x300afc, _0x547490) || resolveStoryAssetCharacterCanonicalName(_0x300afc, _0xccb3cf, _0x236d12);
    if (!_0x4e706e) {
      return [];
    }
    const _0x28888e = [..._0xccb3cf.keys()].some(_0x5edc4b => storyCharacterNamesStronglyOverlap(_0x5edc4b, _0x4e706e));
    if (normalizeText(_0x1cdbd2?.ref).startsWith("local-source-character-") && !_0x28888e) {
      return [];
    }
    return [{
      ..._0x1cdbd2,
      name: _0x4e706e
    }];
  });
  const _0x5f1fb0 = mergeStoryAssetInventoryResults([{
    assets: _0x4f36e1,
    sceneAudits: []
  }], {
    sourceScenes: sourceScenes
  }).assets;
  const _0x2e6cb5 = createStoryAssetCandidateLedger({
    sourceScenes: sourceScenes,
    authoritativeAssets: _0x5b80cf.assets,
    inventoryAssets: _0x5f1fb0,
    sceneAudits: _0x3d59ee?.sceneAudits
  });
  const _0x46f9f6 = [];
  _0x5f1fb0.forEach(_0x1da529 => {
    const _0x496dd7 = _0x2e6cb5.reviewAsset(_0x1da529, {
      origin: "inventory-asset"
    });
    if (_0x496dd7.status !== "promoted") {
      return;
    }
    if (_0x1da529?.kind !== "character") {
      _0x46f9f6.push(_0x1da529);
      return;
    }
    const _0x59b9e8 = normalizeText(_0x1da529?.name);
    if (!_0x59b9e8) {
      return;
    }
    const _0x25e860 = _0x46f9f6.find(_0x8cb817 => _0x8cb817.kind === "character" && storyCharacterNamesStronglyOverlap(_0x8cb817.name, _0x59b9e8));
    if (!_0x25e860) {
      _0x46f9f6.push(_0x1da529);
      return;
    }
    _0x25e860.role = resolveMergedStoryCharacterRole(_0x25e860.role, _0x1da529.role);
    _0x25e860.description = _0x25e860.description || _0x1da529.description;
    _0x25e860.sourceSceneRefs = normalizeStringArray([..._0x25e860.sourceSceneRefs, ..._0x1da529.sourceSceneRefs]);
    _0x1da529.appearances.forEach(_0x14d9e6 => {
      const _0x7941b0 = _0x25e860.appearances.find(_0x345a6a => normalizeText(_0x345a6a.name).toLowerCase() === normalizeText(_0x14d9e6.name).toLowerCase());
      if (_0x7941b0) {
        mergeStoryAssetInventoryAppearance(_0x7941b0, _0x14d9e6);
      } else {
        _0x25e860.appearances.push(_0x14d9e6);
      }
    });
  });
  const _0x373163 = new Map((Array.isArray(_0x3d59ee?.sceneAudits) ? _0x3d59ee.sceneAudits : []).map(_0x2680d0 => [_0x2680d0.sourceSceneRef, {
    ..._0x2680d0,
    characterNames: normalizeStringArray((_0x2680d0?.characterNames || []).map(_0xd6f123 => resolveStoryProjectCharacterCanonicalName(_0xd6f123, _0x547490) || resolveStoryAssetCharacterCanonicalName(_0xd6f123, _0xccb3cf, _0x236d12)).filter(_0x22c99b => ["absorbed", "promoted"].includes(_0x2e6cb5.reviewAsset({
      kind: "character",
      name: _0x22c99b,
      sourceSceneRefs: [_0x2680d0?.sourceSceneRef]
    }, {
      origin: "inventory-audit"
    }).status)))
  }]));
  const _0x5317a4 = (_0x12fcc0, _0x4f81d2) => _0x46f9f6.find(_0x25e54e => _0x25e54e.kind === _0x12fcc0 && (_0x12fcc0 === "character" ? storyCharacterNamesStronglyOverlap(_0x25e54e.name, _0x4f81d2) : normalizeText(_0x25e54e.name).toLowerCase() === normalizeText(_0x4f81d2).toLowerCase()));
  _0x5b80cf.assets.filter(_0x3888e4 => _0x3888e4.kind === "character").forEach(_0x53f7c7 => {
    const _0x1e5c1a = _0x5317a4("character", _0x53f7c7.name);
    if (!_0x1e5c1a) {
      _0x46f9f6.push(_0x53f7c7);
      return;
    }
    _0x1e5c1a.sourceSceneRefs = normalizeStringArray([..._0x1e5c1a.sourceSceneRefs, ..._0x53f7c7.sourceSceneRefs]);
    const _0x3605b9 = _0x1e5c1a.appearances[0] || _0x53f7c7.appearances[0];
    _0x3605b9.sourceSceneRefs = normalizeStringArray([..._0x3605b9.sourceSceneRefs, ..._0x53f7c7.sourceSceneRefs.filter(_0x565a9a => !_0x1e5c1a.appearances.some(_0xbe9551 => _0xbe9551.sourceSceneRefs.includes(_0x565a9a)))]);
    if (!_0x1e5c1a.appearances.length) {
      _0x1e5c1a.appearances = [_0x3605b9];
    }
  });
  _0x5b80cf.assets.filter(_0x5b8d5e => _0x5b8d5e.kind === "prop").forEach(_0x2c9c9c => {
    const _0x302ed4 = _0x5317a4("prop", _0x2c9c9c.name);
    if (!_0x302ed4) {
      _0x46f9f6.push(_0x2c9c9c);
      return;
    }
    _0x302ed4.sourceSceneRefs = normalizeStringArray([..._0x302ed4.sourceSceneRefs, ..._0x2c9c9c.sourceSceneRefs]);
    const _0x571635 = _0x302ed4.appearances[0] || _0x2c9c9c.appearances[0];
    _0x571635.sourceSceneRefs = normalizeStringArray([..._0x571635.sourceSceneRefs, ..._0x2c9c9c.sourceSceneRefs]);
    if (!_0x302ed4.appearances.length) {
      _0x302ed4.appearances = [_0x571635];
    }
  });
  const _0x59940d = (_0x553542, _0x45da40, _0xd09e5a) => {
    if (!_0x45da40 || !_0xd09e5a) {
      return;
    }
    const _0x3478c4 = _0x2e6cb5.reviewAsset({
      kind: _0x553542,
      name: _0x45da40,
      sourceSceneRefs: [_0xd09e5a]
    }, {
      origin: "inventory-audit"
    });
    if (!["absorbed", "promoted"].includes(_0x3478c4.status)) {
      return;
    }
    let _0x3c03df = _0x5317a4(_0x553542, _0x45da40);
    if (!_0x3c03df && _0x3478c4.status === "promoted") {
      const _0x1678c3 = "evidence-" + _0x553542 + "-" + (_0x46f9f6.length + 1);
      _0x3c03df = {
        ref: _0x1678c3,
        kind: _0x553542,
        name: normalizeText(_0x45da40),
        role: _0x553542 === "character" ? "配角" : "关键道具",
        description: "",
        sourceSceneRefs: [],
        appearances: [{
          ref: _0x1678c3 + "-base",
          name: "基础形象",
          description: "",
          sourceSceneRefs: []
        }]
      };
      _0x46f9f6.push(_0x3c03df);
    }
    if (!_0x3c03df) {
      return;
    }
    _0x3c03df.sourceSceneRefs = normalizeStringArray([..._0x3c03df.sourceSceneRefs, _0xd09e5a]);
    const _0x2ea2c7 = _0x3c03df.appearances.find(_0x439fe1 => _0x439fe1.sourceSceneRefs.includes(_0xd09e5a));
    if (!_0x2ea2c7 && _0x3c03df.appearances[0]) {
      _0x3c03df.appearances[0].sourceSceneRefs = normalizeStringArray([..._0x3c03df.appearances[0].sourceSceneRefs, _0xd09e5a]);
    }
  };
  _0x373163.forEach((_0x8d8aca, _0x4c7157) => {
    normalizeStringArray(_0x8d8aca?.characterNames).forEach(_0x34fce7 => {
      _0x59940d("character", _0x34fce7, _0x4c7157);
    });
    normalizeStringArray(_0x8d8aca?.keyPropNames).forEach(_0xe664e7 => {
      _0x59940d("prop", _0xe664e7, _0x4c7157);
    });
  });
  reconcileStorySceneAssetAssignments(_0x46f9f6, _0x5b80cf.assets, sourceScenes);
  const _0x57c2d8 = _0x46f9f6.filter(_0x52a2d6 => _0x52a2d6.sourceSceneRefs.length);
  _0x57c2d8.forEach(_0x82fd5e => {
    _0x82fd5e.sourceSceneRefs.forEach(_0x26f028 => {
      const _0x4b05c6 = _0x82fd5e.appearances.filter(_0x41ed3b => _0x41ed3b.sourceSceneRefs.includes(_0x26f028));
      if (!_0x4b05c6.length) {
        _0x82fd5e.appearances[0].sourceSceneRefs.push(_0x26f028);
      }
      if (_0x82fd5e.kind !== "scene") {
        _0x4b05c6.slice(1).forEach(_0x5e42cb => {
          _0x5e42cb.sourceSceneRefs = _0x5e42cb.sourceSceneRefs.filter(_0x1532fb => _0x1532fb !== _0x26f028);
        });
      }
    });
    _0x82fd5e.appearances.forEach(_0x16c72b => {
      _0x16c72b.sourceSceneRefs = normalizeStringArray(_0x16c72b.sourceSceneRefs);
    });
  });
  const _0x153a26 = new Set();
  const _0xf563a5 = new Set();
  _0x57c2d8.forEach((_0x2311e6, _0x5e0d19) => {
    _0x2311e6.ref = createUniqueStoryAssetInventoryRef(_0x2311e6.ref, _0x153a26, "asset-" + (_0x5e0d19 + 1));
    _0x2311e6.appearances.forEach((_0xb4c3b2, _0x423157) => {
      _0xb4c3b2.ref = createUniqueStoryAssetAppearanceRef(_0xb4c3b2.ref, _0xf563a5, _0x2311e6.ref + "-appearance-" + (_0x423157 + 1));
    });
  });
  const _0x176bfa = new Set(_0x57c2d8.filter(_0x1d4536 => _0x1d4536.kind === "prop").map(_0x529b40 => _0x529b40.name));
  const _0xb5d97a = parseStoryAssetInventoryResult({
    assets: _0x57c2d8,
    sceneAudits: sourceScenes.map(_0x36e421 => ({
      sourceSceneRef: _0x36e421.ref,
      characterNames: normalizeStringArray(_0x57c2d8.filter(_0x31bf3d => _0x31bf3d.kind === "character" && _0x31bf3d.sourceSceneRefs.includes(_0x36e421.ref)).map(_0x34f4da => _0x34f4da.name)),
      keyPropNames: normalizeStringArray([...(_0x373163.get(_0x36e421.ref)?.keyPropNames || []).filter(_0x33c21a => _0x176bfa.has(_0x33c21a)), ..._0x57c2d8.filter(_0x37734b => _0x37734b.kind === "prop" && _0x37734b.sourceSceneRefs.includes(_0x36e421.ref)).map(_0x1153ad => _0x1153ad.name)])
    }))
  }, {
    sourceScenes: sourceScenes
  });
  return {
    ..._0xb5d97a,
    candidateLedger: _0x2e6cb5.snapshot()
  };
}
const STORY_ASSET_KIND_LABELS = Object.freeze({
  character: "角色",
  scene: "场景",
  prop: "道具"
});
function normalizeStoryAssetKind(_0x2a6a09) {
  const _0x2e7ef3 = normalizeText(_0x2a6a09);
  if (!STORY_ASSET_EXPERIMENTAL_KINDS.includes(_0x2e7ef3)) {
    throw new Error("资产提取不支持类型“" + (_0x2e7ef3 || "未指定") + "”。");
  }
  return _0x2e7ef3;
}
function buildStoryAssetKindSystemPrompt(_0x1e5069) {
  const _0x63a9ff = normalizeStoryAssetKind(_0x1e5069);
  const _0x5deab8 = STORY_ASSET_KIND_LABELS[_0x63a9ff];
  const _0x5ef9f4 = _0x63a9ff === "character" ? "每项只能包含 name 和 role" : _0x63a9ff === "scene" ? "每项只能包含 name 和 sourceSceneRefs" : "每项只能包含 name";
  return ["你是专业的影视" + _0x5deab8 + "资产提取 Agent。", _0x63a9ff === "scene" ? "本次只返回需要合并的重复场景组；只出现一次的唯一场景禁止返回。" : "本次只提取全部" + _0x5deab8 + "，禁止返回其他类型的资产。", ...(_0x63a9ff === "scene" ? ["必须从第一场到最后一场完整扫描全部重复关系，所有重复组都要返回，不得遗漏。"] : []), "输入包含完整分集剧本，只把它作为识别与视觉设定依据，不续写剧情，不生成分镜。", "输出必须极短：" + _0x5ef9f4 + "。", "禁止返回 description、提示词、形象列表、声音、出现范围、章节、解释、Markdown 或契约外字段。", "只返回一个 JSON 对象，顶层只能包含 assets 数组。"].join("\n");
}
function buildStoryAssetKindOutputSchema(_0x154822) {
  if (_0x154822 === "character") {
    return {
      assets: [{
        name: "角色姓名或不超过 6 个汉字的身份短称",
        role: "主角、配角、反派或路人"
      }]
    };
  }
  return {
    assets: [{
      name: _0x154822 === "scene" ? "场景名称及必要的视觉状态" : "关键道具名称",
      ...(_0x154822 === "scene" ? {
        sourceSceneRefs: ["sourceScenes[].ref"]
      } : {})
    }]
  };
}
function buildStoryAssetKindRequirements(_0x5e66c5, _0x3804fe = "") {
  const _0x1f9b64 = _0x5e66c5 === "character" ? "name 和 role" : _0x5e66c5 === "scene" ? "name 和 sourceSceneRefs" : "name";
  const _0x4179f9 = ["本轮必须阅读全部 sourceScenes，但 assets 中只能返回 assetKind 指定的一种资产。", "storyContext.characters[].fixedTraits 与 continuityFacts 是已确认约束，不得为了视觉效果改写。", "每项只能返回 " + _0x1f9b64 + "；其余信息全部由客户端补齐。", "不要为了满足数量而虚构资产；确实没有该类资产时返回 {\"assets\":[]}。"];
  if (_0x5e66c5 === "character") {
    _0x4179f9.push("提取需要保持人物外观一致的真实角色；动作短语、台词引导语、评论区、记者群等泛称不得当作具名角色。", "role 只能是主角、配角、反派或路人。", "每项只返回 name 和 role；禁止返回人物描述。");
  } else if (_0x5e66c5 === "scene") {
    _0x4179f9.push("assets 只列重复场景合并组；每组必须包含至少两个 sourceScenes[].ref，唯一场景由客户端本地补齐。", "先只扫描 sceneHeadingIndex 完成地点聚类，再结合 sourceScenes 正文消歧；必须穷尽全部重复组，不能只合并字面完全相同的标题。", "同一物理空间因简称、所属人或机构前缀、日夜、稍后、紧接、后半夜、窗边、天气、镜头位置、封锁或断电等标题变体应合并。", "同义空间词和组织简称也视为同一地点，例如宴会厅/宴会大厅、总部/集团大楼/大厦、都市报社/滨海都市报、临时避难室/避难室。", "人物住所的泛称与具体房间名在正文确认相同时应合并，例如旧楼/老楼单间/租处；空间状态后缀也不能制造新场景，例如废墟旁广场/广场。", "标题写同地点、原地、旁边或仅写状态时，必须结合相邻 sourceScenes 和正文解析其真实地点后归入对应重复组。", "不同房间、入口与室内、地面与天台、物理空间与意识/梦境/回忆空间、完好建筑与结构性废墟不得合并。", "同一个 sourceScenes[].ref 最多出现在一个重复组中；sourceSceneRefs 只能引用真实 ref。", "name 使用去掉时间、转场和镜头位置修饰后的稳定场景名称，并且必须能与组内每个标题的地点身份对应。");
  } else {
    _0x4179f9.push("只提取跨镜头需要保持视觉一致的剧情关键道具，不提取普通背景杂物、一次性食物或无叙事作用的小物件。", "每项只返回 name；禁止返回道具描述。");
  }
  return _0x4179f9;
}
export function buildStoryAssetKindExtractionPrompt({
  project = {},
  episodes = [],
  sourceScenes = null,
  kind = "character",
  batchIndex = 0,
  batchCount = 1,
  aspectRatio = "",
  visualStyle = ""
} = {}) {
  const _0x359f17 = normalizeStoryAssetKind(kind);
  const _0x5074f5 = normalizeStoryContext(project);
  const _0x78a1bc = Array.isArray(sourceScenes) ? sourceScenes : normalizeStoryAssetExtractionSources(episodes);
  if (!_0x78a1bc.length) {
    throw new Error("资产提取缺少可用的场次正文。");
  }
  const _0xc44adc = _0x78a1bc.map(_0x2a69a7 => ({
    ref: _0x2a69a7.ref,
    heading: _0x2a69a7.heading,
    characters: _0x2a69a7.characters,
    body: _0x2a69a7.body
  }));
  const _0x1dcae9 = _0x359f17 === "scene" ? _0x78a1bc.map((_0x187e82, _0x52b06e) => ({
    ref: _0x187e82.ref,
    heading: _0x187e82.heading,
    ...(_0x52b06e > 0 ? {
      previousRef: _0x78a1bc[_0x52b06e - 1].ref,
      previousHeading: _0x78a1bc[_0x52b06e - 1].heading
    } : {})
  })) : undefined;
  return JSON.stringify({
    task: "extract_story_assets_by_kind",
    schemaVersion: STORY_ASSET_BATCHED_EXTRACTION_SCHEMA_VERSION,
    assetKind: _0x359f17,
    storyContext: {
      title: _0x5074f5.title,
      summary: _0x5074f5.summary,
      setting: _0x5074f5.setting,
      continuityFacts: _0x5074f5.continuityFacts,
      ...(_0x359f17 === "character" ? {
        characters: _0x5074f5.characters
      } : {})
    },
    ...(_0x1dcae9 ? {
      sceneHeadingIndex: _0x1dcae9
    } : {}),
    sourceScenes: _0xc44adc,
    requirements: buildStoryAssetKindRequirements(_0x359f17)
  });
}
function inferStoryAssetSourceSceneRefs(_0x4b0132, _0x3eaae5, _0xe2856e = []) {
  const _0x4803f3 = normalizeText(_0x3eaae5);
  if (!_0x4803f3) {
    return [];
  }
  const _0x21bb4e = _0x4803f3.split(/[_＿|｜·•]/u)[0].trim();
  const _0x18d293 = getStoryAssetNameAliases(_0x4803f3);
  return _0xe2856e.filter(_0x1f3357 => {
    if (_0x4b0132 === "character") {
      return _0x1f3357.characters.some(_0xceff7 => storyCharacterNamesOverlap(_0xceff7, _0x4803f3)) || _0x18d293.some(_0x8a90f2 => _0x1f3357.body.includes(_0x8a90f2));
    }
    if (_0x4b0132 === "scene") {
      return _0x1f3357.heading.includes(_0x4803f3) || _0x21bb4e.length >= 2 && _0x1f3357.heading.includes(_0x21bb4e);
    }
    return _0x1f3357.body.includes(_0x4803f3);
  }).map(_0x39b644 => _0x39b644.ref);
}
function resolveStoryAssetSourceChapterIds({
  sourceSceneRefs = [],
  sourceEpisodeRefs = [],
  sourceScenes = [],
  chapterIds = []
} = {}) {
  const _0x32268c = new Set(normalizeStringArray(chapterIds));
  const _0xf491bc = new Map(sourceScenes.map(_0x42be80 => [_0x42be80.ref, _0x42be80]));
  const _0x106092 = new Map();
  sourceScenes.forEach(_0x4b9939 => {
    if (_0x106092.has(_0x4b9939.episodeRef)) {
      return;
    }
    const _0x24f479 = _0x32268c.has(_0x4b9939.episodeRef) ? _0x4b9939.episodeRef : normalizeText(chapterIds[Math.max(0, _0x4b9939.episodeNumber - 1)]);
    if (_0x24f479) {
      _0x106092.set(_0x4b9939.episodeRef, _0x24f479);
    }
  });
  const _0x394dd3 = normalizeStringArray([...sourceEpisodeRefs, ...sourceSceneRefs.map(_0x16d964 => _0xf491bc.get(_0x16d964)?.episodeRef)]);
  return normalizeStringArray(_0x394dd3.map(_0x5d41f4 => _0x106092.get(_0x5d41f4) || (_0x32268c.has(_0x5d41f4) ? _0x5d41f4 : "")));
}
function ensureStoryAssetVisualStyle(_0x19bd68, _0x2ddd00 = "") {
  const _0x5a9d7d = sanitizeStoryAssetPublicPromptText(_0x19bd68);
  const _0x493dde = sanitizeStoryAssetPublicPromptText(_0x2ddd00);
  if (!_0x493dde || _0x5a9d7d.startsWith(_0x493dde)) {
    return _0x5a9d7d;
  }
  return _0x493dde + "\n" + _0x5a9d7d;
}
function resolveStoryCharacterRole(_0x23c3c6) {
  return normalizeStoryAssetFinalCharacterRole(_0x23c3c6);
}
function getStoryAssetKindRawAssets(_0x1acc33, _0x4ebdc5) {
  const _0x367bf1 = getResultText(_0x1acc33);
  if (Array.isArray(_0x367bf1)) {
    return _0x367bf1;
  }
  const _0x48012b = parseStrictJson(_0x367bf1, "Agent 未返回" + STORY_ASSET_KIND_LABELS[_0x4ebdc5] + "提取结果。");
  if (Array.isArray(_0x48012b)) {
    return _0x48012b;
  }
  const _0x4b73f6 = _0x4ebdc5 === "character" ? [_0x48012b?.characters, _0x48012b?.assets] : _0x4ebdc5 === "scene" ? [_0x48012b?.scenes, _0x48012b?.assets] : [_0x48012b?.props, _0x48012b?.assets];
  const _0x529f6d = _0x4b73f6.find(Array.isArray);
  if (!_0x529f6d) {
    throw new Error("Agent 返回的" + STORY_ASSET_KIND_LABELS[_0x4ebdc5] + "结果缺少 assets 数组。");
  }
  return _0x529f6d;
}
function mergeStoryAssetKindResultAssets(_0x141cbf = []) {
  const _0x5727b2 = [];
  const _0x42ca19 = new Map();
  _0x141cbf.forEach(_0xd88b9b => {
    const _0x13874d = normalizeText(_0xd88b9b?.name).toLowerCase();
    if (!_0x13874d) {
      return;
    }
    const _0x5b46d6 = _0x42ca19.get(_0x13874d);
    if (!_0x5b46d6) {
      _0x42ca19.set(_0x13874d, _0xd88b9b);
      _0x5727b2.push(_0xd88b9b);
      return;
    }
    _0x5b46d6.description ||= _0xd88b9b.description;
    _0x5b46d6.voiceDescription ||= _0xd88b9b.voiceDescription;
    _0x5b46d6.occurrences ||= _0xd88b9b.occurrences;
    _0x5b46d6.sourceEpisodeRefs = normalizeStringArray([..._0x5b46d6.sourceEpisodeRefs, ..._0xd88b9b.sourceEpisodeRefs]);
    _0x5b46d6.sourceSceneRefs = normalizeStringArray([..._0x5b46d6.sourceSceneRefs, ..._0xd88b9b.sourceSceneRefs]);
    const _0x59924b = new Map(_0x5b46d6.appearances.map(_0x362b9c => [normalizeText(_0x362b9c.name).toLowerCase(), _0x362b9c]));
    _0xd88b9b.appearances.forEach(_0x101302 => {
      const _0x4ce4ea = normalizeText(_0x101302.name).toLowerCase();
      const _0x46244f = _0x59924b.get(_0x4ce4ea);
      if (!_0x46244f) {
        _0x5b46d6.appearances.push(_0x101302);
        _0x59924b.set(_0x4ce4ea, _0x101302);
        return;
      }
      _0x46244f.description ||= _0x101302.description;
      _0x46244f.prompt ||= _0x101302.prompt;
      _0x46244f.occurrences ||= _0x101302.occurrences;
      _0x46244f.sourceEpisodeRefs = normalizeStringArray([..._0x46244f.sourceEpisodeRefs, ..._0x101302.sourceEpisodeRefs]);
      _0x46244f.sourceSceneRefs = normalizeStringArray([..._0x46244f.sourceSceneRefs, ..._0x101302.sourceSceneRefs]);
      _0x46244f.sourceChapterIds = normalizeStringArray([..._0x46244f.sourceChapterIds, ..._0x101302.sourceChapterIds]);
    });
    _0x5b46d6.sourceChapterIds = normalizeStringArray([..._0x5b46d6.sourceChapterIds, ..._0xd88b9b.sourceChapterIds]);
  });
  return _0x5727b2;
}
function normalizeStorySceneAssetsForCoverage(_0x5de160 = [], {
  sourceScenes = [],
  chapterIds = [],
  visualStyle = ""
} = {}) {
  if (!sourceScenes.length) {
    return _0x5de160;
  }
  const _0x253f3f = new Map(sourceScenes.map((_0x14eef1, _0x4b6b3a) => [_0x14eef1.ref, _0x4b6b3a]));
  const _0x3d7791 = /^(?:(?:同地点|同一地点|同一处|原地|此处|该处|这里|旁边)(?:\s|$|[（(])|.+(?:旁|附近|周围)$)/u;
  const _0x917578 = (_0xc826ed, _0x288474) => {
    const _0x5b9992 = getReusableStorySceneIdentityKey(_0xc826ed);
    const _0x42a5fd = getReusableStorySceneIdentityKey(_0x288474);
    return Boolean(_0x5b9992 && _0x5b9992 === _0x42a5fd);
  };
  const _0x18c2c3 = (_0x4020dc, _0x24121b) => {
    if (storySceneIdentitiesOverlap(_0x4020dc?.name, _0x24121b?.heading)) {
      return true;
    }
    const _0x13e843 = normalizeStorySceneHeadingIdentity(_0x24121b?.heading);
    if (!_0x3d7791.test(_0x13e843)) {
      return false;
    }
    const _0xbf81ed = _0x253f3f.get(_0x24121b.ref);
    const _0x5b043a = _0xbf81ed > 0 ? sourceScenes[_0xbf81ed - 1]?.ref : "";
    return Boolean(_0x5b043a && normalizeStringArray(_0x4020dc?.sourceSceneRefs).includes(_0x5b043a));
  };
  const _0x41fd19 = new Map();
  const _0x3c4a70 = [];
  sourceScenes.forEach(_0x2fcb92 => {
    const _0x4cd357 = _0x5de160.map((_0x430653, _0x59e055) => ({
      asset: _0x430653,
      assetIndex: _0x59e055,
      explicitlyBound: normalizeStringArray(_0x430653?.sourceSceneRefs).includes(_0x2fcb92.ref),
      hasExplicitBindings: normalizeStringArray(_0x430653?.sourceSceneRefs).length > 0
    })).filter(({
      asset: _0x50d0eb,
      explicitlyBound: _0x179a56,
      hasExplicitBindings: _0x231577
    }) => (!_0x231577 || _0x179a56) && (_0x179a56 ? _0x18c2c3(_0x50d0eb, _0x2fcb92) : storySceneIdentitiesOverlap(_0x50d0eb?.name, _0x2fcb92?.heading))).sort((_0x306d04, _0x108666) => Number(_0x108666.explicitlyBound) - Number(_0x306d04.explicitlyBound) || normalizeStringArray(_0x306d04.asset?.sourceSceneRefs).length - normalizeStringArray(_0x108666.asset?.sourceSceneRefs).length);
    const _0x19b347 = _0x4cd357[0];
    if (!_0x19b347) {
      _0x3c4a70.push(_0x2fcb92);
      return;
    }
    const _0x5afe90 = _0x41fd19.get(_0x19b347.assetIndex) || [];
    _0x5afe90.push(_0x2fcb92);
    _0x41fd19.set(_0x19b347.assetIndex, _0x5afe90);
  });
  const _0x5944cc = [..._0x41fd19.entries()].map(([_0x241eb7, _0x4a124e]) => {
    const _0x321cde = _0x5de160[_0x241eb7];
    const _0x1aae93 = _0x4a124e.map(_0xdb6b23 => _0xdb6b23.ref);
    const _0x48be15 = deriveSourceEpisodeRefs(_0x1aae93, new Map(sourceScenes.map(_0x5b0f29 => [_0x5b0f29.ref, _0x5b0f29])));
    const _0x2a9274 = resolveStoryAssetSourceChapterIds({
      sourceSceneRefs: _0x1aae93,
      sourceEpisodeRefs: _0x48be15,
      sourceScenes: sourceScenes,
      chapterIds: chapterIds
    });
    const _0x51e57e = (Array.isArray(_0x321cde?.appearances) ? _0x321cde.appearances : []).map(_0x465b20 => ({
      ..._0x465b20,
      occurrences: buildOccurrences(_0x48be15),
      sourceChapterIds: _0x2a9274,
      sourceEpisodeRefs: _0x48be15,
      sourceSceneRefs: _0x1aae93
    }));
    return {
      ..._0x321cde,
      occurrences: buildOccurrences(_0x48be15),
      sourceChapterIds: _0x2a9274,
      sourceEpisodeRefs: _0x48be15,
      sourceSceneRefs: _0x1aae93,
      appearances: _0x51e57e
    };
  });
  _0x3c4a70.forEach((_0x1f2143, _0x2dbd5c) => {
    const _0x4ec963 = _0x5944cc.find(_0x13ccc7 => _0x917578(_0x13ccc7?.name, _0x1f2143?.heading));
    if (_0x4ec963) {
      _0x4ec963.sourceSceneRefs = normalizeStringArray([..._0x4ec963.sourceSceneRefs, _0x1f2143.ref]);
      _0x4ec963.sourceEpisodeRefs = deriveSourceEpisodeRefs(_0x4ec963.sourceSceneRefs, new Map(sourceScenes.map(_0x3592af => [_0x3592af.ref, _0x3592af])));
      _0x4ec963.sourceChapterIds = resolveStoryAssetSourceChapterIds({
        sourceSceneRefs: _0x4ec963.sourceSceneRefs,
        sourceEpisodeRefs: _0x4ec963.sourceEpisodeRefs,
        sourceScenes: sourceScenes,
        chapterIds: chapterIds
      });
      _0x4ec963.occurrences = buildOccurrences(_0x4ec963.sourceEpisodeRefs);
      const _0x1fef36 = _0x4ec963.appearances[0];
      if (_0x1fef36) {
        _0x1fef36.sourceSceneRefs = [..._0x4ec963.sourceSceneRefs];
        _0x1fef36.sourceEpisodeRefs = [..._0x4ec963.sourceEpisodeRefs];
        _0x1fef36.sourceChapterIds = [..._0x4ec963.sourceChapterIds];
        _0x1fef36.occurrences = _0x4ec963.occurrences;
      }
      return;
    }
    const _0x5dde50 = normalizeStorySceneHeadingIdentity(_0x1f2143?.heading) || "场景 " + (_0x2dbd5c + 1);
    const _0x26d6f9 = [_0x1f2143.ref];
    const _0x198418 = deriveSourceEpisodeRefs(_0x26d6f9, new Map(sourceScenes.map(_0x34c95a => [_0x34c95a.ref, _0x34c95a])));
    const _0x5846f7 = resolveStoryAssetSourceChapterIds({
      sourceSceneRefs: _0x26d6f9,
      sourceEpisodeRefs: _0x198418,
      sourceScenes: sourceScenes,
      chapterIds: chapterIds
    });
    const _0x2d8553 = [normalizeText(_0x1f2143?.heading), stripStoryAssetInternalEvidenceMetadata(_0x1f2143?.body).slice(0, 180)].filter(Boolean).join("；");
    const _0x23c87f = normalizeReference("", "scene-coverage-" + (_0x5944cc.length + _0x2dbd5c + 1));
    const _0x3edb87 = ensureStoryAssetVisualStyle(_0x5dde50 + "，" + (_0x2d8553 || "依据原文建立的剧情空间") + "，影视场景设定图，默认无人", visualStyle);
    _0x5944cc.push({
      ref: _0x23c87f,
      kind: "scene",
      name: _0x5dde50,
      role: "剧情场景",
      description: _0x2d8553,
      voiceDescription: "",
      occurrences: buildOccurrences(_0x198418),
      sourceChapterIds: _0x5846f7,
      sourceEpisodeRefs: _0x198418,
      sourceSceneRefs: _0x26d6f9,
      appearances: [{
        ref: _0x23c87f + "-appearance-1",
        name: "基础形象",
        description: _0x2d8553,
        occurrences: buildOccurrences(_0x198418),
        sourceChapterIds: _0x5846f7,
        sourceEpisodeRefs: _0x198418,
        sourceSceneRefs: _0x26d6f9,
        prompt: _0x3edb87
      }]
    });
  });
  return _0x5944cc;
}
export function parseStoryAssetKindExtractionResult(_0x1894a7, {
  kind = "character",
  sourceScenes = [],
  chapterIds = [],
  visualStyle = ""
} = {}) {
  const _0x18a292 = normalizeStoryAssetKind(kind);
  const _0x177f36 = new Set(sourceScenes.map(_0xa4b6a4 => _0xa4b6a4.ref));
  const _0x2dd6e3 = new Set(sourceScenes.map(_0x553cfd => _0x553cfd.episodeRef));
  const _0x4e2cf7 = getStoryAssetKindRawAssets(_0x1894a7, _0x18a292);
  const _0x4e11a9 = _0x4e2cf7.map((_0x4fcb7c, _0x163607) => {
    if (!_0x4fcb7c || typeof _0x4fcb7c !== "object" || Array.isArray(_0x4fcb7c)) {
      return null;
    }
    const _0x446afd = normalizeText(_0x4fcb7c.name);
    if (!_0x446afd) {
      return null;
    }
    let _0x3b4795 = normalizeStringArray(_0x4fcb7c.sourceSceneRefs || _0x4fcb7c.sceneRefs).filter(_0x5de3f0 => _0x177f36.has(_0x5de3f0));
    if (!_0x3b4795.length) {
      _0x3b4795 = inferStoryAssetSourceSceneRefs(_0x18a292, _0x446afd, sourceScenes);
    }
    const _0x28fd70 = normalizeStringArray([...deriveSourceEpisodeRefs(_0x3b4795, new Map(sourceScenes.map(_0x21008a => [_0x21008a.ref, _0x21008a]))), ...normalizeStringArray(_0x4fcb7c.sourceEpisodeRefs || _0x4fcb7c.sourceChapterIds).filter(_0x17fc21 => _0x2dd6e3.has(_0x17fc21))]);
    const _0x4451d0 = resolveStoryAssetSourceChapterIds({
      sourceSceneRefs: _0x3b4795,
      sourceEpisodeRefs: _0x28fd70,
      sourceScenes: sourceScenes,
      chapterIds: chapterIds
    });
    const _0x3526fb = normalizeReference(_0x4fcb7c.ref, _0x18a292 + "-" + (_0x163607 + 1));
    const _0x57d5b9 = normalizeText(_0x4fcb7c.prompt || _0x4fcb7c.description || _0x446afd + "视觉设定");
    const _0x4c5efd = _0x18a292 === "character" && Array.isArray(_0x4fcb7c.appearances) && _0x4fcb7c.appearances.length ? _0x4fcb7c.appearances : [{
      name: "基础形象",
      description: _0x4fcb7c.description,
      occurrences: _0x4fcb7c.occurrences,
      sourceSceneRefs: _0x3b4795,
      prompt: _0x4fcb7c.prompt || _0x4fcb7c.appearances?.[0]?.prompt
    }];
    const _0x41960f = _0x4c5efd.map((_0x12e23b, _0x536ddd) => {
      const _0x2f0864 = normalizeStringArray(_0x12e23b?.sourceSceneRefs || _0x12e23b?.sceneRefs).filter(_0x3b599c => _0x177f36.has(_0x3b599c));
      const _0x293d15 = _0x2f0864.length ? _0x2f0864 : _0x3b4795;
      const _0x48142d = deriveSourceEpisodeRefs(_0x293d15, new Map(sourceScenes.map(_0x57f087 => [_0x57f087.ref, _0x57f087])));
      const _0x35654f = resolveStoryAssetSourceChapterIds({
        sourceSceneRefs: _0x293d15,
        sourceEpisodeRefs: _0x48142d,
        sourceScenes: sourceScenes,
        chapterIds: chapterIds
      });
      return {
        ref: normalizeReference(_0x12e23b?.ref, _0x3526fb + "-appearance-" + (_0x536ddd + 1)),
        name: normalizeText(_0x12e23b?.name) || (_0x536ddd === 0 ? "基础形象" : "形象 " + (_0x536ddd + 1)),
        description: normalizeText(_0x12e23b?.description || _0x4fcb7c.description),
        occurrences: normalizeText(_0x12e23b?.occurrences || _0x4fcb7c.occurrences) || buildOccurrences(_0x48142d),
        sourceChapterIds: _0x35654f,
        sourceEpisodeRefs: _0x48142d,
        sourceSceneRefs: _0x293d15,
        prompt: ensureStoryAssetVisualStyle(_0x12e23b?.prompt || _0x57d5b9, visualStyle)
      };
    });
    return {
      ref: _0x3526fb,
      kind: _0x18a292,
      name: _0x446afd,
      role: _0x18a292 === "character" ? resolveStoryCharacterRole(_0x4fcb7c.role) : normalizeText(_0x4fcb7c.role) || (_0x18a292 === "scene" ? "剧情场景" : "关键道具"),
      description: normalizeText(_0x4fcb7c.description),
      voiceDescription: _0x18a292 === "character" ? normalizeText(_0x4fcb7c.voiceDescription) : "",
      occurrences: normalizeText(_0x4fcb7c.occurrences) || buildOccurrences(_0x28fd70),
      sourceChapterIds: _0x4451d0,
      sourceEpisodeRefs: _0x28fd70,
      sourceSceneRefs: _0x3b4795,
      appearances: _0x41960f
    };
  }).filter(Boolean);
  const _0x2ee38a = mergeStoryAssetKindResultAssets(_0x4e11a9);
  const _0x1f98c3 = _0x18a292 === "scene" ? normalizeStorySceneAssetsForCoverage(_0x2ee38a, {
    sourceScenes: sourceScenes,
    chapterIds: chapterIds,
    visualStyle: visualStyle
  }) : _0x2ee38a;
  const _0x25fc35 = new Set();
  const _0x1d2f14 = new Set();
  _0x1f98c3.forEach((_0x5efb2c, _0x52592a) => {
    _0x5efb2c.ref = createUniqueStoryAssetInventoryRef(_0x5efb2c.ref, _0x25fc35, _0x18a292 + "-" + (_0x52592a + 1));
    _0x5efb2c.appearances = _0x5efb2c.appearances.map((_0x2412c3, _0x5324e7) => ({
      ..._0x2412c3,
      ref: createUniqueStoryAssetAppearanceRef(_0x2412c3.ref, _0x1d2f14, _0x5efb2c.ref + "-appearance-" + (_0x5324e7 + 1))
    }));
  });
  return {
    schemaVersion: STORY_ASSET_BATCHED_EXTRACTION_SCHEMA_VERSION,
    kind: _0x18a292,
    assets: _0x1f98c3
  };
}
function cloneStoryAssetExtractionValue(_0x408196) {
  if (!_0x408196 || typeof _0x408196 !== "object") {
    return null;
  }
  try {
    return JSON.parse(JSON.stringify(_0x408196));
  } catch {
    return null;
  }
}
function hashStoryAssetExtractionValue(_0x1413fc) {
  const _0x483e16 = JSON.stringify(_0x1413fc);
  let _0x6f6b37 = 2166136261;
  for (let _0x2fa49b = 0; _0x2fa49b < _0x483e16.length; _0x2fa49b += 1) {
    _0x6f6b37 ^= _0x483e16.charCodeAt(_0x2fa49b);
    _0x6f6b37 = Math.imul(_0x6f6b37, 16777619);
  }
  return STORY_ASSET_BATCHED_EXTRACTION_SCHEMA_VERSION + "-" + (_0x6f6b37 >>> 0).toString(16).padStart(8, "0") + "-" + _0x483e16.length;
}
function createStoryAssetExtractionFingerprint({
  storyContext = {},
  sourceScenes = [],
  model = "",
  provider = "",
  providerProfileId = "",
  aspectRatio = "",
  visualStyle = "",
  extractionStrategy = STORY_ASSET_EXTRACTION_DRAFT_STRATEGY
} = {}) {
  return hashStoryAssetExtractionValue({
    title: storyContext.title,
    scriptMode: storyContext.scriptMode,
    continuityFacts: storyContext.continuityFacts,
    characters: storyContext.characters,
    sourceScenes: sourceScenes,
    model: normalizeText(model),
    provider: normalizeText(provider),
    providerProfileId: normalizeText(providerProfileId),
    aspectRatio: normalizeText(aspectRatio) || storyContext.aspectRatio,
    visualStyle: normalizeText(visualStyle) || storyContext.visualStyle,
    extractionStrategy: extractionStrategy,
    extractionKinds: STORY_ASSET_EXPERIMENTAL_KINDS
  });
}
function createStoryAssetExtractionContentFingerprint({
  storyContext = {},
  sourceScenes = [],
  aspectRatio = "",
  visualStyle = "",
  extractionStrategy = STORY_ASSET_EXTRACTION_DRAFT_STRATEGY
} = {}) {
  return hashStoryAssetExtractionValue({
    title: storyContext.title,
    scriptMode: storyContext.scriptMode,
    continuityFacts: storyContext.continuityFacts,
    characters: storyContext.characters,
    sourceScenes: sourceScenes,
    aspectRatio: normalizeText(aspectRatio) || storyContext.aspectRatio,
    visualStyle: normalizeText(visualStyle) || storyContext.visualStyle,
    extractionStrategy: extractionStrategy,
    extractionKinds: STORY_ASSET_EXPERIMENTAL_KINDS
  });
}
async function saveStoryAssetExtractionCheckpoint(_0x5c5617, _0x4364de) {
  const _0xb2f4f5 = {
    ..._0x5c5617,
    updatedAt: Date.now()
  };
  if (typeof _0x4364de === "function") {
    await _0x4364de(cloneStoryAssetExtractionValue(_0xb2f4f5));
  }
  return _0xb2f4f5;
}
function classifyStoryAssetKindError(_0x4fa9b1) {
  const _0x41c73e = normalizeText(_0x4fa9b1?.message || _0x4fa9b1);
  const _0x5e6498 = normalizeText(_0x4fa9b1?.type || _0x4fa9b1?.code).toUpperCase();
  if (_0x5e6498 === "AUTH_ERROR" || Number(_0x4fa9b1?.status) === 401 || /API\s*Key.*(?:无效|过期|未配置|错误)|认证失败|unauthori[sz]ed|invalid\s+api\s+key/iu.test(_0x41c73e)) {
    return {
      type: "auth",
      message: _0x41c73e
    };
  }
  if (_0x5e6498 === "RATE_LIMIT" || Number(_0x4fa9b1?.status || _0x4fa9b1?.statusCode) === 429 || /rate\s*limit|too\s*many\s*requests|限流|请求过于频繁/iu.test(_0x41c73e)) {
    return {
      type: "rate-limit",
      message: _0x41c73e
    };
  }
  if (_0x5e6498 === "TIMEOUT" || /超时|timeout|timed\s*out/iu.test(_0x41c73e)) {
    return {
      type: "timeout",
      message: _0x41c73e
    };
  }
  if (_0x5e6498 === "DNS_ERROR" || _0x5e6498 === "ENOTFOUND" || _0x5e6498 === "EAI_AGAIN" || /dns|name\s+resolution|getaddrinfo|域名解析/iu.test(_0x41c73e)) {
    return {
      type: "dns-error",
      message: _0x41c73e
    };
  }
  if (_0x5e6498 === "NETWORK_ERROR" || /fetch\s+failed|failed\s+to\s+fetch|network\s+(?:error|failure)|网络(?:错误|异常|失败)/iu.test(_0x41c73e)) {
    return {
      type: "network-error",
      message: _0x41c73e
    };
  }
  if (["ECONNRESET", "ECONNABORTED", "UND_ERR_SOCKET"].includes(normalizeText(_0x4fa9b1?.code).toUpperCase()) || /connection\s*(?:reset|closed|aborted)|socket\s*hang\s*up|连接(?:被)?重置|连接中断/iu.test(_0x41c73e)) {
    return {
      type: "connection-reset",
      message: _0x41c73e
    };
  }
  if (_0x5e6498 === "OUTPUT_LENGTH" || /max(?:imum)?\s*(?:output\s*)?tokens|finish[_\s-]*reason.{0,12}length|输出.{0,8}(?:截断|过长)|内容过长/iu.test(_0x41c73e)) {
    return {
      type: "length",
      message: _0x41c73e
    };
  }
  if (_0x5e6498 === "CALL_LIMIT") {
    return {
      type: "call-limit",
      message: _0x41c73e
    };
  }
  if (_0x5e6498 === "VALIDATION" || _0x4fa9b1?.validationDetails || /Agent 返回的.+(?:声音设定|图片提示词).*(?:缺少|不能为空)|形象数量与轻量清单不一致/iu.test(_0x41c73e)) {
    return {
      type: "validation",
      message: _0x41c73e
    };
  }
  if (/资产细化结果必须与当前批次资产数量完全一致|缺少\s*\d+\s*个资产结果/u.test(_0x41c73e)) {
    return {
      type: "incomplete-output",
      message: _0x41c73e
    };
  }
  if (/有效的\s*JSON|JSON|缺少\s*assets\s*数组|返回格式/iu.test(_0x41c73e)) {
    return {
      type: "invalid-json",
      message: _0x41c73e
    };
  }
  return {
    type: "request",
    message: _0x41c73e
  };
}
function isStoryAssetConfirmedUnchargedRejection(_0x215d76) {
  const _0x36ab01 = Number(_0x215d76?.status ?? _0x215d76?.statusCode);
  return [400, 401, 403, 404, 409, 422, 429].includes(_0x36ab01);
}
function getStoryAssetKindErrorLabel(_0x79ab0b = "", _0x1e7d11 = "") {
  if (_0x79ab0b === "auth" || classifyStoryAssetKindError({
    type: _0x79ab0b,
    message: _0x1e7d11
  }).type === "auth") {
    return "API Key 无效或已过期";
  }
  if (_0x79ab0b === "timeout") {
    return "请求超时";
  }
  if (_0x79ab0b === "rate-limit") {
    return "请求限流";
  }
  if (_0x79ab0b === "length") {
    return "输出被截断";
  }
  if (_0x79ab0b === "call-limit") {
    return "达到自动调用上限";
  }
  if (_0x79ab0b === "validation") {
    return "结果校验失败";
  }
  if (_0x79ab0b === "incomplete-output") {
    return "输出缺少部分资产";
  }
  if (_0x79ab0b === "invalid-json") {
    return "返回格式不合格";
  }
  return "请求失败";
}
function getStoryAssetResponseFinishReason(_0x1cc230) {
  return normalizeText(_0x1cc230?.finishReason || _0x1cc230?.finish_reason || _0x1cc230?.choices?.[0]?.finish_reason || _0x1cc230?.data?.choices?.[0]?.finish_reason);
}
function isStoryAssetResponseTruncated(_0x45a051) {
  const _0x113d78 = typeof _0x45a051 === "string" ? normalizeText(_0x45a051).toLowerCase() : getStoryAssetResponseFinishReason(_0x45a051).toLowerCase();
  return ["length", "max_tokens", "max_output_tokens"].includes(_0x113d78);
}
function createStoryAssetPipelineError(_0x531a0e = []) {
  const _0x5538a0 = _0x531a0e.slice(0, 5).map(_0x3d09e7 => {
    const _0x213150 = _0x3d09e7.stage === "kind" ? STORY_ASSET_KIND_LABELS[_0x3d09e7.kind] || "资产" : _0x3d09e7.stage === "repair" ? "归并校验" : _0x3d09e7.stage === "detail" ? "提示词细化" : "清单";
    const _0x377e65 = normalizeText(_0x3d09e7.batchLabel || _0x3d09e7.batchId);
    return "" + _0x213150 + (_0x377e65 ? " " + _0x377e65 : "") + "（" + getStoryAssetKindErrorLabel(_0x3d09e7.errorType, _0x3d09e7.errorMessage) + "）";
  }).join("、");
  const _0x144c4c = new Error("资产提取未完成：" + (_0x5538a0 || "存在未完成工作项") + "。已完成结果已保存，再次点击只处理未完成项。");
  _0x144c4c.assetExtractionFailures = _0x531a0e;
  return _0x144c4c;
}
function createStoryAssetPipelineContinuation(_0x10e6bc, _0x5570c2, _0x10626d = {}) {
  const _0x595dc2 = new Error(_0x5570c2);
  _0x595dc2.type = "ASSET_EXTRACTION_CONTINUE_REQUIRED";
  _0x595dc2.isContinuation = true;
  _0x595dc2.remaining = cloneStoryAssetExtractionValue(_0x10626d);
  _0x595dc2.assetExtractionDraft = cloneStoryAssetExtractionValue(_0x10e6bc);
  return _0x595dc2;
}
function createStoryAssetBatchContractKey(_0x4a4adb, _0x1ae904 = []) {
  const _0x15d18c = JSON.stringify({
    stage: normalizeText(_0x4a4adb),
    identities: normalizeStringArray(_0x1ae904)
  });
  let _0x547449 = 2166136261;
  for (let _0x4bc64e = 0; _0x4bc64e < _0x15d18c.length; _0x4bc64e += 1) {
    _0x547449 ^= _0x15d18c.charCodeAt(_0x4bc64e);
    _0x547449 = Math.imul(_0x547449, 16777619);
  }
  return (normalizeText(_0x4a4adb) || "batch") + "-" + (_0x547449 >>> 0).toString(16).padStart(8, "0");
}
function createStoryAssetPipelineKindStates(_0x2771d1 = [], _0x3ee804 = [], _0x16cd41 = [], {
  inventoryRunning = false
} = {}) {
  const _0x19daf6 = new Set(_0x3ee804.map(_0x5067d7 => _0x5067d7.ref));
  return Object.fromEntries(STORY_ASSET_EXPERIMENTAL_KINDS.map(_0x369602 => {
    const _0x3a0e4e = _0x2771d1.filter(_0x8a4dda => _0x8a4dda.kind === _0x369602);
    const _0x34a81b = _0x3a0e4e.filter(_0x4f17c6 => _0x19daf6.has(_0x4f17c6.ref)).length;
    const _0x49aa1a = _0x16cd41.filter(_0x3b171f => !_0x3b171f.kind || _0x3b171f.kind === _0x369602);
    let _0x492c3f = "pending";
    if (inventoryRunning) {
      _0x492c3f = "running";
    } else if (_0x3a0e4e.length && _0x34a81b === _0x3a0e4e.length) {
      _0x492c3f = "succeeded";
    } else if (_0x49aa1a.length) {
      _0x492c3f = "failed";
    } else if (_0x34a81b || _0x3a0e4e.length) {
      _0x492c3f = "running";
    }
    const _0x5b98ad = _0x49aa1a[0];
    return [_0x369602, {
      kind: _0x369602,
      status: _0x492c3f,
      attempt: 0,
      assetCount: _0x34a81b,
      totalAssetCount: _0x3a0e4e.length,
      errorType: _0x5b98ad?.errorType || "",
      errorMessage: _0x5b98ad?.errorMessage || "",
      startedAt: 0,
      finishedAt: _0x492c3f === "succeeded" || _0x492c3f === "failed" ? Date.now() : 0
    }];
  }));
}
function restoreStoryAssetPipelineDraft(_0x34a728, {
  sourceFingerprint = "",
  sourceContentFingerprint = "",
  extractionStrategy = STORY_ASSET_EXTRACTION_DRAFT_STRATEGY
} = {}) {
  const _0x40c6a5 = cloneStoryAssetExtractionValue(_0x34a728);
  if (!_0x40c6a5 || _0x40c6a5.strategy !== extractionStrategy || _0x40c6a5.schemaVersion !== STORY_ASSET_BATCHED_EXTRACTION_SCHEMA_VERSION) {
    return null;
  }
  const _0x2b1173 = normalizeText(_0x40c6a5.sourceFingerprint) === sourceFingerprint;
  const _0x35f578 = Boolean(normalizeText(_0x40c6a5.sourceContentFingerprint) && normalizeText(_0x40c6a5.sourceContentFingerprint) === sourceContentFingerprint);
  if (_0x2b1173 || _0x35f578) {
    return _0x40c6a5;
  } else {
    return null;
  }
}
function splitStoryAssetWorkItems(_0x1f814d = []) {
  const _0x2f48d0 = Math.max(1, Math.ceil(_0x1f814d.length / 2));
  return [_0x1f814d.slice(0, _0x2f48d0), _0x1f814d.slice(_0x2f48d0)].filter(_0x233dc8 => _0x233dc8.length);
}
function updateStoryAssetOutputEstimates(_0x1204c5 = {}, _0x4730e4 = []) {
  const _0x128024 = {
    ..._0x1204c5
  };
  STORY_ASSET_EXPERIMENTAL_KINDS.forEach(_0x104fb5 => {
    const _0x3c8705 = _0x4730e4.filter(_0x2cad9d => _0x2cad9d.kind === _0x104fb5);
    if (!_0x3c8705.length) {
      return;
    }
    const _0x4c679f = Math.ceil(_0x3c8705.reduce((_0xac2a5c, _0x35ad6e) => _0xac2a5c + JSON.stringify(_0x35ad6e).length, 0) / _0x3c8705.length);
    const _0x302e68 = Math.max(600, Number(_0x128024[_0x104fb5]) || (_0x104fb5 === "character" ? 2200 : 1200));
    _0x128024[_0x104fb5] = Math.max(600, Math.ceil(_0x302e68 * 0.65 + _0x4c679f * 0.35));
  });
  return _0x128024;
}
function reportStoryAssetDiagnostics(_0x476e32, _0x4f2c80, _0x25a5cc = {}) {
  try {
    const _0xda6e69 = typeof _0x476e32?.info === "function" ? _0x476e32.info(_0x4f2c80, _0x25a5cc) : _0x476e32?.logEvent?.({
      type: "story_asset." + normalizeText(_0x4f2c80).replace(/^story-asset-?/iu, "").replace(/[^a-z0-9]+/giu, "_"),
      level: _0x25a5cc?.status === "failed" ? "error" : "info",
      source: "renderer",
      message: normalizeText(_0x4f2c80) || "Story asset extraction event",
      context: _0x25a5cc
    });
    if (_0xda6e69 && typeof _0xda6e69.then === "function") {
      Promise.resolve(_0xda6e69).catch(() => undefined);
    }
  } catch {}
}
function buildStoryAssetBaselinePrompt(_0x38399e = {}, _0xd33fa2 = {}, _0x5eb79d = "") {
  const _0xf4c035 = normalizeText(_0x38399e.kind);
  const _0x5f44d7 = normalizeStringArray([_0x38399e.name, _0x38399e.scriptFacts || _0x38399e.description, _0x38399e.visualDesign, _0xd33fa2.name && _0xd33fa2.name !== "基础形象" ? _0xd33fa2.name : "", _0xd33fa2.scriptFacts || _0xd33fa2.description, _0xd33fa2.visualDesign].map(sanitizeStoryAssetPublicPromptText)).join("，");
  const _0x28761b = _0xf4c035 === "character" ? "正面全身独立人物设定图，中性站姿，无剧情动作、无手持或背负道具，完整展示服装、发型、五官与体态" : _0xf4c035 === "scene" ? "环境概念设定图，默认无人，完整展示空间布局、时间状态、光线与关键环境结构" : "单体道具设定图，默认无人手持，完整展示轮廓、材质、结构与剧情要求的状态";
  return ensureStoryAssetVisualStyle([_0x5f44d7, _0x28761b].filter(Boolean).join("，"), _0x5eb79d);
}
function createStoryAssetBaselineVisualDesign(_0x4a1588 = {}) {
  const _0x424922 = normalizeText(_0x4a1588?.name) || "该资产";
  const _0x419018 = normalizeText(_0x4a1588?.kind);
  if (_0x419018 === "character") {
    return _0x424922 + "的外观符合" + (normalizeText(_0x4a1588?.role) || "剧情角色") + "身份与项目时代背景，形成稳定、可复用的人物设定";
  }
  if (_0x419018 === "scene") {
    return _0x424922 + "的空间布局、结构材质、时间光线与剧本场景标题及项目世界观保持一致";
  }
  return _0x424922 + "的轮廓、材质、尺寸与关键结构符合剧本用途，形成清晰可辨的单体道具设定";
}
function sanitizeStoryAssetPublicAsset(_0x400918 = {}, {
  visualStyle = ""
} = {}) {
  const _0x26f239 = normalizeText(_0x400918?.designStatus) === "baseline";
  const _0x39ae8a = stripStoryAssetInternalEvidenceMetadata(_0x400918?.scriptFacts || _0x400918?.description);
  const _0x3e3763 = stripStoryAssetInternalEvidenceMetadata(_0x400918?.visualDesign) || (_0x26f239 ? createStoryAssetBaselineVisualDesign(_0x400918) : "");
  const _0x436aa9 = formatStoryAssetFactAndDesignDescription({
    scriptFacts: _0x39ae8a,
    visualDesign: _0x3e3763,
    description: _0x400918?.description
  });
  const _0x415f91 = (Array.isArray(_0x400918?.appearances) ? _0x400918.appearances : []).map(_0x528da9 => {
    const _0x5f5d17 = _0x26f239 || normalizeText(_0x528da9?.designStatus) === "baseline";
    const _0x25fb36 = stripStoryAssetInternalEvidenceMetadata(_0x528da9?.scriptFacts || _0x528da9?.description || _0x39ae8a);
    const _0x317562 = stripStoryAssetInternalEvidenceMetadata(_0x528da9?.visualDesign) || (_0x5f5d17 ? _0x3e3763 : "");
    const _0x2591db = formatStoryAssetFactAndDesignDescription({
      scriptFacts: _0x25fb36,
      visualDesign: _0x317562,
      description: _0x528da9?.description
    });
    const _0x1a4431 = {
      ..._0x528da9,
      description: _0x2591db,
      scriptFacts: _0x25fb36,
      visualDesign: _0x317562
    };
    return {
      ..._0x1a4431,
      prompt: _0x5f5d17 ? buildStoryAssetBaselinePrompt({
        ..._0x400918,
        description: _0x436aa9,
        scriptFacts: _0x39ae8a,
        visualDesign: _0x3e3763
      }, _0x1a4431, visualStyle) : ensureStoryAssetVisualStyle(_0x528da9?.prompt, visualStyle)
    };
  });
  return {
    ..._0x400918,
    description: _0x436aa9,
    scriptFacts: _0x39ae8a,
    visualDesign: _0x3e3763,
    appearances: _0x415f91,
    prompt: _0x415f91[0]?.prompt || ensureStoryAssetVisualStyle(_0x400918?.prompt, visualStyle)
  };
}
export function finalizeStoryAssetInventoryAssets({
  inventory = {},
  sourceScenes = [],
  chapterIds = [],
  visualStyle = ""
} = {}) {
  return (Array.isArray(inventory?.assets) ? inventory.assets : []).map(_0x31dd04 => {
    const _0x5b99f6 = resolveStoryAssetSourceChapterIds({
      sourceSceneRefs: _0x31dd04.sourceSceneRefs,
      sourceEpisodeRefs: _0x31dd04.sourceEpisodeRefs,
      sourceScenes: sourceScenes,
      chapterIds: chapterIds
    });
    const _0x3437b5 = (Array.isArray(_0x31dd04.appearances) ? _0x31dd04.appearances : []).map(_0x267c11 => {
      const _0x5c0dd4 = resolveStoryAssetSourceChapterIds({
        sourceSceneRefs: _0x267c11.sourceSceneRefs,
        sourceEpisodeRefs: _0x267c11.sourceEpisodeRefs,
        sourceScenes: sourceScenes,
        chapterIds: chapterIds
      });
      return {
        ..._0x267c11,
        sourceChapterIds: _0x5c0dd4,
        prompt: buildStoryAssetBaselinePrompt(_0x31dd04, _0x267c11, visualStyle),
        designStatus: "baseline"
      };
    });
    return {
      ..._0x31dd04,
      role: _0x31dd04.kind === "character" ? normalizeStoryAssetFinalCharacterRole(_0x31dd04.role) : _0x31dd04.role,
      voiceDescription: "",
      sourceChapterIds: _0x5b99f6,
      prompt: _0x3437b5[0]?.prompt || "",
      appearances: _0x3437b5,
      designStatus: "baseline"
    };
  });
}
function createStoryAssetDetailPlans({
  inventory = {},
  sourceScenes = [],
  chapterIds = []
} = {}) {
  return finalizeStoryAssetInventoryAssets({
    inventory: inventory,
    sourceScenes: sourceScenes,
    chapterIds: chapterIds
  }).map(_0xa4ade3 => ({
    ref: _0xa4ade3.ref,
    kind: _0xa4ade3.kind,
    name: _0xa4ade3.name,
    role: _0xa4ade3.role,
    description: _0xa4ade3.description,
    occurrences: normalizeStringArray(_0xa4ade3.sourceChapterIds).length ? buildOccurrences(_0xa4ade3.sourceChapterIds) : normalizeText(_0xa4ade3.occurrences),
    sourceSceneRefs: normalizeStringArray(_0xa4ade3.sourceSceneRefs),
    sourceEpisodeRefs: normalizeStringArray(_0xa4ade3.sourceChapterIds),
    appearances: (Array.isArray(_0xa4ade3.appearances) ? _0xa4ade3.appearances : []).map(_0x16c484 => ({
      ref: _0x16c484.ref,
      name: _0x16c484.name,
      description: _0x16c484.description,
      occurrences: normalizeStringArray(_0x16c484.sourceChapterIds).length ? buildOccurrences(_0x16c484.sourceChapterIds) : normalizeText(_0x16c484.occurrences),
      sourceSceneRefs: normalizeStringArray(_0x16c484.sourceSceneRefs),
      sourceEpisodeRefs: normalizeStringArray(_0x16c484.sourceChapterIds)
    }))
  }));
}
function createStoryAssetBaselineDetailAssets(_0x32240a = [], {
  sourceScenes = [],
  visualStyle = ""
} = {}) {
  const _0x2ff003 = new Map(sourceScenes.map(_0xb084b2 => [_0xb084b2.ref, _0xb084b2]));
  return _0x32240a.map(_0x470406 => {
    const _0x5198bd = normalizeStringArray(_0x470406.sourceSceneRefs.map(_0x2ae481 => _0x2ff003.get(_0x2ae481)).filter(Boolean).slice(0, 2).map(_0x5721d0 => [normalizeText(_0x5721d0.heading), stripStoryAssetInternalEvidenceMetadata(_0x5721d0.body).slice(0, 160)].filter(Boolean).join("："))).join("；");
    const _0xaca3ee = stripStoryAssetInternalEvidenceMetadata(_0x470406.description) || _0x5198bd || _0x470406.name + "在剧本相关场次中出现。";
    const _0x2174c5 = createStoryAssetBaselineVisualDesign(_0x470406);
    const _0x5a8397 = formatStoryAssetFactAndDesignDescription({
      scriptFacts: _0xaca3ee,
      visualDesign: _0x2174c5
    });
    const _0x2d0241 = _0x470406.appearances.map(_0x154679 => ({
      ref: _0x154679.ref,
      name: _0x154679.name,
      description: normalizeText(_0x154679.description) || _0x5a8397,
      occurrences: buildOccurrences(_0x154679.sourceEpisodeRefs),
      prompt: buildStoryAssetBaselinePrompt({
        ..._0x470406,
        description: _0x5a8397,
        scriptFacts: _0xaca3ee,
        visualDesign: _0x2174c5
      }, {
        ..._0x154679,
        scriptFacts: stripStoryAssetInternalEvidenceMetadata(_0x154679.description) || _0xaca3ee,
        visualDesign: _0x2174c5
      }, visualStyle),
      sourceChapterIds: _0x154679.sourceEpisodeRefs,
      sourceEpisodeRefs: _0x154679.sourceEpisodeRefs,
      sourceSceneRefs: _0x154679.sourceSceneRefs,
      scriptFacts: _0xaca3ee,
      visualDesign: _0x2174c5,
      designStatus: "baseline"
    }));
    return {
      ref: _0x470406.ref,
      kind: _0x470406.kind,
      name: _0x470406.name,
      role: _0x470406.role,
      description: _0x5a8397,
      voiceDescription: _0x470406.kind === "character" ? ["年龄：未明确", "性别：未明确", "身份：" + (_0x470406.role || "剧情角色"), "口音：标准普通话", "情绪底色：中性克制", "声线：自然清晰", "语速：中等", "说话方式：符合角色身份", "音色特征：自然稳定"].join("；") : "",
      occurrences: buildOccurrences(_0x470406.sourceEpisodeRefs),
      prompt: _0x2d0241[0]?.prompt || "",
      sourceChapterIds: _0x470406.sourceEpisodeRefs,
      sourceEpisodeRefs: _0x470406.sourceEpisodeRefs,
      sourceSceneRefs: _0x470406.sourceSceneRefs,
      appearances: _0x2d0241,
      scriptFacts: _0xaca3ee,
      visualDesign: _0x2174c5,
      designStatus: "baseline"
    };
  });
}
export async function extractStoryAssetsEvidenceBatched({
  project = {},
  episodes = [],
  sourceScenes: _0x2b27fb = null,
  authoritativeSourceScenes: _0x300093 = null,
  model = "",
  provider = "",
  providerProfileId = "",
  aspectRatio = "",
  visualStyle = "",
  request = generateText,
  onProgress = null,
  onCheckpoint = null,
  resumeDraft = null,
  diagnostics = null,
  requestLimit = STORY_ASSET_AUTOMATIC_CALL_LIMIT,
  allowLocalBaselineFallback = true,
  paidRerunAuthorization = null
} = {}) {
  const _0x511978 = normalizeText(model);
  const _0x43929f = normalizeText(provider);
  const _0x2c6173 = normalizeText(providerProfileId);
  if (!_0x511978 || !_0x43929f) {
    throw new Error("请先选择可用的文本模型。");
  }
  const _0xc84ee2 = normalizeStoryContext(project);
  const _0x32db27 = Array.isArray(_0x2b27fb) && _0x2b27fb.length ? cloneStoryAssetExtractionValue(_0x2b27fb) : normalizeStoryAssetExtractionSources(episodes);
  const _0x1d9dd8 = new Map((Array.isArray(_0x300093) ? _0x300093 : []).map(_0x3cce77 => [_0x3cce77?.ref, _0x3cce77]));
  const _0x45a380 = _0x32db27.map(_0x1f4119 => {
    const _0x2d4bbf = _0x1d9dd8.get(_0x1f4119?.ref);
    if (!_0x2d4bbf) {
      return _0x1f4119;
    }
    return {
      ..._0x1f4119,
      characters: cloneStoryAssetExtractionValue(_0x2d4bbf.characters || [])
    };
  });
  const _0x5db17a = normalizeText(visualStyle) || _0xc84ee2.visualStyle;
  const _0x1cefef = createStoryAssetExtractionFingerprint({
    storyContext: _0xc84ee2,
    sourceScenes: _0x32db27,
    model: _0x511978,
    provider: _0x43929f,
    providerProfileId: _0x2c6173,
    aspectRatio: aspectRatio,
    visualStyle: _0x5db17a,
    extractionStrategy: STORY_ASSET_EVIDENCE_BATCHED_DRAFT_STRATEGY
  });
  const _0x58abbb = createStoryAssetExtractionContentFingerprint({
    storyContext: _0xc84ee2,
    sourceScenes: _0x32db27,
    aspectRatio: aspectRatio,
    visualStyle: _0x5db17a,
    extractionStrategy: STORY_ASSET_EVIDENCE_BATCHED_DRAFT_STRATEGY
  });
  const _0x3e163e = cloneStoryAssetExtractionValue(resumeDraft);
  const _0x22f29c = restoreStoryAssetPipelineDraft(resumeDraft, {
    sourceFingerprint: _0x1cefef,
    sourceContentFingerprint: _0x58abbb,
    extractionStrategy: STORY_ASSET_EVIDENCE_BATCHED_DRAFT_STRATEGY
  });
  const _0x4eac22 = _0x3e163e?.batchSubmissionRecords && typeof _0x3e163e.batchSubmissionRecords === "object" ? _0x3e163e.batchSubmissionRecords : {};
  const _0x2e86e6 = !_0x22f29c && _0x3e163e?.strategy === STORY_ASSET_EVIDENCE_BATCHED_DRAFT_STRATEGY ? Object.entries(_0x4eac22).flatMap(([_0x321e0a, _0x495ad1]) => {
    const _0x4e20d1 = normalizeText(_0x495ad1?.status);
    const _0xa043ab = _0x4e20d1 !== "rejected-confirmed" && (Math.max(0, Math.trunc(Number(_0x495ad1?.requestCount) || 0)) > 0 || Object.hasOwn(_0x495ad1 || {}, "rawResponse") || ["submitted", "ambiguous", "blocked-ambiguous-submission", "response-received", "blocked-paid-response", "blocked-incompatible", "validated"].includes(_0x4e20d1));
    if (_0xa043ab) {
      return [_0x321e0a];
    } else {
      return [];
    }
  }) : [];
  const _0x5eedad = _0x2e86e6.length > 0;
  const _0x167e79 = Math.min(STORY_ASSET_BATCH_REQUEST_LIMIT, Math.max(1, Math.trunc(Number(requestLimit) || 0)));
  let _0xa16dc2 = 0;
  let _0x409f2c = false;
  let _0x19f3ba = "";
  const _0x55ce33 = (_0x3bcd46 = {}) => ({
    strategy: STORY_ASSET_EVIDENCE_BATCHED_DRAFT_STRATEGY,
    schemaVersion: STORY_ASSET_BATCHED_EXTRACTION_SCHEMA_VERSION,
    sourceFingerprint: _0x1cefef,
    sourceContentFingerprint: _0x58abbb,
    status: "pending",
    phase: "inventory",
    inventoryBatches: [],
    inventory: null,
    completedAssets: [],
    detailBatches: [],
    batchSubmissionRecords: {},
    paidBatchHistory: {},
    outputEstimates: {
      character: 2200,
      scene: 1200,
      prop: 1200
    },
    failures: [],
    totalRequestCount: 0,
    ...(_0x3bcd46 && typeof _0x3bcd46 === "object" ? {
      paidBatchHistory: _0x3bcd46
    } : {})
  });
  let _0x303ca1 = _0x22f29c || (_0x5eedad ? _0x3e163e : _0x55ce33());
  _0x303ca1.strategy = STORY_ASSET_EVIDENCE_BATCHED_DRAFT_STRATEGY;
  if (!_0x5eedad) {
    _0x303ca1.schemaVersion = STORY_ASSET_BATCHED_EXTRACTION_SCHEMA_VERSION;
    _0x303ca1.sourceFingerprint = _0x1cefef;
    _0x303ca1.sourceContentFingerprint = _0x58abbb;
  }
  _0x303ca1.failures = [];
  _0x303ca1.runRequestCount = 0;
  _0x303ca1.requestLimit = _0x167e79;
  _0x303ca1.batchSubmissionRecords = _0x303ca1.batchSubmissionRecords && typeof _0x303ca1.batchSubmissionRecords === "object" ? _0x303ca1.batchSubmissionRecords : {};
  _0x303ca1.paidBatchHistory = _0x303ca1.paidBatchHistory && typeof _0x303ca1.paidBatchHistory === "object" ? _0x303ca1.paidBatchHistory : {};
  const _0x116dfd = async ({
    message = "",
    stage = _0x303ca1.phase
  } = {}) => {
    const _0x43c2a9 = Array.isArray(_0x303ca1.inventory?.assets) ? _0x303ca1.inventory.assets : [];
    const _0x5b62e5 = Array.isArray(_0x303ca1.completedAssets) ? _0x303ca1.completedAssets : [];
    const _0x4ee45e = stage === "inventory" || stage === "repair";
    _0x303ca1.kindStates = createStoryAssetPipelineKindStates(_0x43c2a9, _0x5b62e5, _0x303ca1.failures, {
      inventoryRunning: stage === "inventory" && _0x303ca1.status === "in-progress"
    });
    _0x303ca1.progress = {
      stage: stage,
      current: _0x4ee45e ? new Set((_0x303ca1.inventoryBatches || []).filter(_0x1c49bd => _0x1c49bd.status === "succeeded").flatMap(_0x1a2f97 => _0x1a2f97.sourceSceneRefs || [])).size : _0x5b62e5.length,
      total: _0x4ee45e ? _0x45a380.length : _0x43c2a9.length,
      message: message,
      requestCount: _0xa16dc2,
      callLimit: _0x167e79
    };
    _0x303ca1 = await saveStoryAssetExtractionCheckpoint(_0x303ca1, onCheckpoint);
    onProgress?.({
      stage: stage === "repair" ? "repairing-asset-inventory" : stage === "detail" ? "detailing-story-assets" : "extracting-asset-inventory",
      current: _0x303ca1.progress.current,
      total: _0x303ca1.progress.total,
      message: message
    });
  };
  const _0x3d6d47 = _0x87b156 => {
    if (paidRerunAuthorization?.confirmed !== true) {
      return false;
    }
    const _0x97aac4 = Array.isArray(paidRerunAuthorization?.authorizedBatchIds) ? paidRerunAuthorization.authorizedBatchIds : [];
    return _0x97aac4.includes(_0x87b156);
  };
  const _0x112259 = (_0x505dc5, _0x317241) => {
    const _0x2d07c9 = _0x303ca1.batchSubmissionRecords[_0x505dc5];
    if (!_0x2d07c9) {
      return;
    }
    const _0x4bb911 = Array.isArray(_0x303ca1.paidBatchHistory[_0x505dc5]) ? _0x303ca1.paidBatchHistory[_0x505dc5] : [];
    _0x4bb911.push({
      ...cloneStoryAssetExtractionValue(_0x2d07c9),
      archivedAt: Date.now(),
      archiveReason: _0x317241
    });
    _0x303ca1.paidBatchHistory[_0x505dc5] = _0x4bb911;
    delete _0x303ca1.batchSubmissionRecords[_0x505dc5];
  };
  const _0x3d6910 = (_0x1836a1, _0x5ea180, _0x3ea3ae, _0x14db77) => {
    const _0x5530d3 = new Error(_0x14db77);
    _0x5530d3.type = _0x1836a1;
    _0x5530d3.batchKey = _0x5ea180;
    _0x5530d3.batchId = _0x3ea3ae?.batchId || "";
    _0x5530d3.assetExtractionDraft = cloneStoryAssetExtractionValue(_0x303ca1);
    return _0x5530d3;
  };
  if (_0x5eedad) {
    const _0x4ff346 = _0x2e86e6.every(_0x9d1444 => _0x3d6d47(_0x9d1444));
    if (!_0x4ff346) {
      _0x2e86e6.forEach(_0x5475be => {
        const _0x27d073 = _0x303ca1.batchSubmissionRecords[_0x5475be];
        if (!_0x27d073) {
          return;
        }
        if (_0x27d073.status !== "blocked-incompatible") {
          _0x27d073.incompatiblePreviousStatus = _0x27d073.status;
        }
        _0x27d073.status = "blocked-incompatible";
        _0x27d073.errorType = "contract-incompatible";
        _0x27d073.errorMessage = "已付费批次的来源或草稿版本与当前请求不兼容。";
        _0x27d073.blockedAt = Date.now();
      });
      _0x303ca1.status = "blocked";
      await _0x116dfd({
        stage: _0x303ca1.phase,
        message: "已付费批次与当前剧本来源或草稿版本不兼容；未自动重新请求"
      });
      const [_0x488b92] = _0x2e86e6;
      const _0x400bda = _0x303ca1.batchSubmissionRecords[_0x488b92] || {};
      const _0x4b9627 = _0x3d6910("ASSET_CONTRACT_INCOMPATIBLE", _0x488b92, _0x400bda, "已付费批次与当前剧本来源或草稿版本不兼容；需要逐批明确授权后才能重新请求。");
      _0x4b9627.blockedBatchIds = [..._0x2e86e6];
      throw _0x4b9627;
    }
    const _0x30cfbb = Math.max(0, Math.trunc(Number(_0x303ca1.totalRequestCount) || 0));
    _0x2e86e6.forEach(_0x5c1a82 => {
      _0x112259(_0x5c1a82, "authorized-source-or-schema-change-rerun");
    });
    const _0x35b3e3 = cloneStoryAssetExtractionValue(_0x303ca1.paidBatchHistory) || {};
    _0x303ca1 = _0x55ce33(_0x35b3e3);
    _0x303ca1.totalRequestCount = _0x30cfbb;
    _0x303ca1.runRequestCount = 0;
    _0x303ca1.requestLimit = _0x167e79;
    await _0x116dfd({
      stage: "inventory",
      message: "旧付费批次已归档，正在按当前剧本重新提取"
    });
  }
  const _0x4cad1d = async (_0x26fbd2, _0xb7779b = {}) => {
    const _0x2f54de = normalizeText(_0xb7779b?.batchKey) || createStoryAssetBatchContractKey(_0xb7779b?.stage, _0xb7779b?.contractIdentities || [_0xb7779b?.batchId]);
    const _0x40e76e = _0x303ca1.batchSubmissionRecords[_0x2f54de];
    if (_0x40e76e && ["submitted", "ambiguous"].includes(_0x40e76e.status)) {
      if (_0x3d6d47(_0x2f54de)) {
        _0x112259(_0x2f54de, "authorized-ambiguous-submission-rerun");
      } else {
        _0x40e76e.status = "blocked-ambiguous-submission";
        _0x303ca1.status = "blocked";
        await _0x116dfd({
          stage: _0xb7779b?.stage,
          message: (_0xb7779b?.batchId || _0x2f54de) + "提交状态不明确；未自动重新请求"
        });
        throw _0x3d6910("ASSET_SUBMISSION_AMBIGUOUS", _0x2f54de, _0xb7779b, (_0xb7779b?.batchId || _0x2f54de) + "请求已提交但无法确认是否计费；需要明确授权后才能重新请求。");
      }
    } else if (_0x40e76e && _0x40e76e.status === "blocked-ambiguous-submission") {
      if (_0x3d6d47(_0x2f54de)) {
        _0x112259(_0x2f54de, "authorized-ambiguous-submission-rerun");
      } else {
        _0x303ca1.status = "blocked";
        await _0x116dfd({
          stage: _0xb7779b?.stage,
          message: (_0xb7779b?.batchId || _0x2f54de) + "提交状态不明确；未自动重新请求"
        });
        throw _0x3d6910("ASSET_SUBMISSION_AMBIGUOUS", _0x2f54de, _0xb7779b, (_0xb7779b?.batchId || _0x2f54de) + "请求已提交但无法确认是否计费；需要明确授权后才能重新请求。");
      }
    } else if (_0x40e76e && ["response-received", "blocked-paid-response", "blocked-incompatible", "validated"].includes(_0x40e76e.status)) {
      if (_0x3d6d47(_0x2f54de)) {
        _0x112259(_0x2f54de, _0x40e76e.status === "blocked-incompatible" ? "authorized-incompatible-paid-response-rerun" : "authorized-invalid-paid-response-rerun");
      } else if (_0x40e76e.status === "blocked-incompatible") {
        _0x303ca1.status = "blocked";
        throw _0x3d6910("ASSET_CONTRACT_INCOMPATIBLE", _0x2f54de, _0xb7779b, (_0xb7779b?.batchId || _0x2f54de) + "的已付费结果与当前合同不兼容；未自动重新请求。");
      } else if (normalizeText(_0x40e76e.rawResponse)) {
        return _0x40e76e.rawResponse;
      } else {
        _0x40e76e.status = "blocked-paid-response";
        throw _0x3d6910("ASSET_PAID_RESULT_BLOCKED", _0x2f54de, _0xb7779b, (_0xb7779b?.batchId || _0x2f54de) + "已付费但返回为空；未自动重新请求。");
      }
    }
    if (_0xa16dc2 >= _0x167e79) {
      throw Object.assign(new Error("已达到本轮 " + _0x167e79 + " 次分批请求上限。已完成结果已保存，系统将自动继续。"), {
        type: "CALL_LIMIT"
      });
    }
    _0xa16dc2 += 1;
    _0x303ca1.runRequestCount = _0xa16dc2;
    _0x303ca1.totalRequestCount = Math.max(0, Number(_0x303ca1.totalRequestCount) || 0) + 1;
    const _0x372773 = Date.now();
    _0x303ca1.batchSubmissionRecords[_0x2f54de] = {
      batchKey: _0x2f54de,
      batchId: normalizeText(_0xb7779b?.batchId),
      stage: normalizeText(_0xb7779b?.stage),
      kinds: normalizeStringArray(_0xb7779b?.kinds),
      status: "submitted",
      requestCount: Math.max(0, Math.trunc(Number(_0x303ca1.batchSubmissionRecords[_0x2f54de]?.requestCount) || 0)) + 1,
      submittedAt: _0x372773,
      contractSnapshot: cloneStoryAssetExtractionValue(_0x26fbd2),
      rawResponse: ""
    };
    await _0x116dfd({
      stage: _0xb7779b?.stage,
      message: (_0xb7779b?.batchId || _0x2f54de) + "已提交，等待付费结果"
    });
    reportStoryAssetDiagnostics(diagnostics, "story-asset-request", {
      ..._0xb7779b,
      status: "started",
      requestCount: _0xa16dc2,
      callLimit: _0x167e79,
      promptCharacters: normalizeText(_0x26fbd2.prompt).length
    });
    let _0x30b415;
    try {
      _0x30b415 = await request(_0x26fbd2);
    } catch (_0x2edf06) {
      const _0x4d732c = classifyStoryAssetKindError(_0x2edf06);
      const _0x23e981 = !isStoryAssetConfirmedUnchargedRejection(_0x2edf06);
      _0x303ca1.batchSubmissionRecords[_0x2f54de] = {
        ..._0x303ca1.batchSubmissionRecords[_0x2f54de],
        status: _0x23e981 ? "blocked-ambiguous-submission" : "rejected-confirmed",
        failedAt: Date.now(),
        errorType: _0x4d732c.type,
        errorMessage: _0x4d732c.message
      };
      if (_0x23e981) {
        _0x303ca1.status = "blocked";
      }
      await _0x116dfd({
        stage: _0xb7779b?.stage,
        message: _0x23e981 ? (_0xb7779b?.batchId || _0x2f54de) + "提交状态不明确；未自动重新请求" : (_0xb7779b?.batchId || _0x2f54de) + "请求失败；已保存状态"
      });
      reportStoryAssetDiagnostics(diagnostics, "story-asset-request", {
        ..._0xb7779b,
        status: "failed",
        requestCount: _0xa16dc2,
        elapsedMs: Math.max(0, Date.now() - _0x372773),
        errorType: _0x4d732c.type,
        errorMessage: _0x4d732c.message
      });
      if (_0x23e981) {
        throw _0x3d6910("ASSET_SUBMISSION_AMBIGUOUS", _0x2f54de, _0xb7779b, (_0xb7779b?.batchId || _0x2f54de) + "请求已提交但无法确认是否计费；需要明确授权后才能重新请求。");
      }
      throw _0x2edf06;
    }
    const _0x442101 = normalizeText(getResultText(_0x30b415));
    const _0x131410 = getStoryAssetResponseFinishReason(_0x30b415).toLowerCase();
    _0x303ca1.batchSubmissionRecords[_0x2f54de] = {
      ..._0x303ca1.batchSubmissionRecords[_0x2f54de],
      status: _0x442101 ? "response-received" : "blocked-paid-response",
      responseReceivedAt: Date.now(),
      rawResponse: _0x442101,
      ...(_0x131410 ? {
        finishReason: _0x131410
      } : {}),
      ...(_0x442101 ? {} : {
        blockedAt: Date.now(),
        errorType: "empty-paid-response",
        errorMessage: "付费请求返回空内容。"
      })
    };
    if (!_0x442101) {
      _0x303ca1.status = "blocked";
      await _0x116dfd({
        stage: _0xb7779b?.stage,
        message: (_0xb7779b?.batchId || _0x2f54de) + "付费请求返回空内容；已阻断且未自动重试"
      });
      reportStoryAssetDiagnostics(diagnostics, "story-asset-request", {
        ..._0xb7779b,
        status: "failed",
        requestCount: _0xa16dc2,
        elapsedMs: Math.max(0, Date.now() - _0x372773),
        errorType: "empty-paid-response",
        errorMessage: "付费请求返回空内容。"
      });
      throw _0x3d6910("ASSET_PAID_RESULT_BLOCKED", _0x2f54de, _0xb7779b, (_0xb7779b?.batchId || _0x2f54de) + "已付费但返回为空；需要明确授权后才能重新请求。");
    }
    await _0x116dfd({
      stage: _0xb7779b?.stage,
      message: (_0xb7779b?.batchId || _0x2f54de) + "已返回，正在校验付费结果"
    });
    reportStoryAssetDiagnostics(diagnostics, "story-asset-request", {
      ..._0xb7779b,
      status: "succeeded",
      requestCount: _0xa16dc2,
      elapsedMs: Math.max(0, Date.now() - _0x372773),
      responseCharacters: _0x442101.length
    });
    return _0x30b415;
  };
  const _0x35cc9d = _0x1dc188 => {
    if (!_0x303ca1.batchSubmissionRecords[_0x1dc188]) {
      return;
    }
    _0x303ca1.batchSubmissionRecords[_0x1dc188] = {
      ..._0x303ca1.batchSubmissionRecords[_0x1dc188],
      status: "validated",
      validatedAt: Date.now()
    };
  };
  const _0x5e079b = async (_0x3a7515, _0x326e9a, _0x2f0a10) => {
    const _0x177e1e = _0x303ca1.batchSubmissionRecords[_0x3a7515];
    if (!_0x177e1e || !normalizeText(_0x177e1e.rawResponse)) {
      throw _0x2f0a10;
    }
    _0x177e1e.status = "blocked-paid-response";
    _0x177e1e.errorType = classifyStoryAssetKindError(_0x2f0a10).type;
    _0x177e1e.errorMessage = normalizeText(_0x2f0a10?.message || _0x2f0a10);
    const _0x3b4069 = normalizeText(_0x2f0a10?.finishReason || _0x177e1e.finishReason).toLowerCase();
    if (_0x3b4069) {
      _0x177e1e.finishReason = _0x3b4069;
    }
    _0x177e1e.blockedAt = Date.now();
    _0x303ca1.status = "blocked";
    await _0x116dfd({
      stage: _0x326e9a?.stage,
      message: (_0x326e9a?.batchId || _0x3a7515) + "付费返回未通过合同校验；原始返回已保留，未自动重新请求"
    });
    throw _0x3d6910("ASSET_PAID_RESULT_BLOCKED", _0x3a7515, _0x326e9a, (_0x326e9a?.batchId || _0x3a7515) + "付费返回未通过合同校验；需要明确授权后才能重新请求。");
  };
  const _0x5a2ab8 = async ({
    stage: _0x4dc90e,
    message: _0x5b04a9,
    remaining: _0x29d08f
  }) => {
    _0x303ca1.status = "partial";
    await _0x116dfd({
      stage: _0x4dc90e,
      message: _0x5b04a9
    });
    throw createStoryAssetPipelineContinuation(_0x303ca1, _0x5b04a9, _0x29d08f);
  };
  const _0x2922d9 = async (_0x2e275a, _0x2463f7) => {
    if (!allowLocalBaselineFallback) {
      const _0x22dcf0 = normalizeText(_0x2463f7) || "资产清单 API 请求不可用";
      _0x303ca1.failures.push({
        stage: "inventory",
        batchId: _0x2e275a.id,
        batchLabel: _0x2e275a.id + "（" + _0x2e275a.sourceScenes.length + " 场）",
        errorType: "incomplete-ai-inventory",
        errorMessage: _0x22dcf0,
        sourceSceneRefs: _0x2e275a.sourceScenes.map(_0x3603be => _0x3603be.ref)
      });
      _0x303ca1.status = "failed";
      await _0x116dfd({
        stage: "inventory",
        message: _0x2e275a.id + "未获得完整 API 清单；已停止且不会使用本地候选冒充正式资产"
      });
      throw createStoryAssetPipelineError(_0x303ca1.failures);
    }
    const _0x744d40 = createDeterministicStoryAssetInventory({
      project: project,
      sourceScenes: _0x2e275a.sourceScenes
    });
    _0x303ca1.inventoryBatches.push({
      id: _0x2e275a.id,
      status: "succeeded",
      sourceSceneRefs: _0x2e275a.sourceScenes.map(_0x4bd44c => _0x4bd44c.ref),
      salvaged: false,
      localFallback: true,
      fallbackReason: normalizeText(_0x2463f7) || "清单请求不可用，已使用本地确定性清单",
      inventory: _0x744d40
    });
    await _0x116dfd({
      stage: "inventory",
      message: _0x2e275a.id + "（" + _0x2e275a.sourceScenes.length + " 场）已使用本地确定性清单；后续不会为清单自动重试"
    });
  };
  const _0x42845a = (Array.isArray(_0x303ca1.inventoryBatches) ? _0x303ca1.inventoryBatches : []).filter(_0x8ab4fb => _0x8ab4fb?.status === "succeeded" && Array.isArray(_0x8ab4fb.sourceSceneRefs) && _0x8ab4fb.inventory);
  const _0x362b9a = new Set(_0x42845a.flatMap(_0x9eb7ce => _0x9eb7ce.sourceSceneRefs));
  const _0x5eaf65 = _0x45a380.filter(_0x5900ef => !_0x362b9a.has(_0x5900ef.ref));
  if (_0x5eaf65.length) {
    _0x303ca1.phase = "inventory";
    _0x303ca1.status = "in-progress";
    _0x303ca1.inventoryBatches = _0x42845a;
    await _0x116dfd({
      stage: "inventory",
      message: "正在建立轻量资产清单（已覆盖 " + _0x362b9a.size + "/" + _0x45a380.length + " 场）"
    });
    let _0x2265c7 = [];
    try {
      _0x2265c7 = createStoryAssetInventorySourceBatches({
        project: project,
        sourceScenes: _0x5eaf65
      }).map((_0x558017, _0x554f58) => ({
        id: "inventory-" + (_0x554f58 + 1),
        sourceScenes: _0x558017
      }));
    } catch (_0x23697f) {
      _0x2265c7 = [{
        id: "inventory-local-fallback",
        sourceScenes: _0x5eaf65,
        localFallbackReason: normalizeText(_0x23697f?.message) || "清单输入超过安全窗口"
      }];
    }
    while (_0x2265c7.length) {
      const _0x4c6085 = _0x2265c7.shift();
      const _0x199d66 = _0x4c6085.id + "（" + _0x4c6085.sourceScenes.length + " 场）";
      const _0x3aa9d1 = createStoryAssetBatchContractKey("inventory", _0x4c6085.sourceScenes.map(_0x159207 => _0x159207.ref));
      const _0x16e87c = {
        stage: "inventory",
        batchId: _0x4c6085.id,
        batchKey: _0x3aa9d1,
        kinds: STORY_ASSET_EXPERIMENTAL_KINDS,
        contractIdentities: _0x4c6085.sourceScenes.map(_0x4f627f => _0x4f627f.ref),
        sourceSceneCount: _0x4c6085.sourceScenes.length
      };
      if (!allowLocalBaselineFallback && !_0x409f2c && !_0x4c6085.localFallbackReason && _0xa16dc2 >= _0x167e79) {
        await _0x5a2ab8({
          stage: "inventory",
          message: "本轮已完成 " + _0xa16dc2 + "/" + _0x167e79 + " 次分批调用；仍有清单批次待处理，系统将自动继续",
          remaining: {
            phase: "inventory",
            sourceSceneCount: _0x4c6085.sourceScenes.length + _0x2265c7.reduce((_0x17f2dc, _0x4184b0) => _0x17f2dc + _0x4184b0.sourceScenes.length, 0)
          }
        });
      }
      if (_0x409f2c || _0x4c6085.localFallbackReason || _0xa16dc2 >= _0x167e79) {
        await _0x2922d9(_0x4c6085, _0x4c6085.localFallbackReason || _0x19f3ba || "已达到本轮 " + _0x167e79 + " 次请求上限");
        continue;
      }
      let _0x22ec6c = null;
      try {
        const _0x3979c4 = await _0x4cad1d({
          model: _0x511978,
          provider: _0x43929f,
          ...(_0x2c6173 ? {
            providerProfileId: _0x2c6173
          } : {}),
          prompt: buildStoryAssetInventoryPrompt({
            project: project,
            sourceScenes: _0x4c6085.sourceScenes
          }),
          systemPrompt: STORY_ASSET_INVENTORY_SYSTEM_PROMPT,
          structuredOutput: createStoryAssetInventoryStructuredOutput(),
          temperature: 0.1,
          timeoutMs: STORY_ASSET_EXPERIMENTAL_REQUEST_TIMEOUT_MS,
          maxOutputTokens: STORY_ASSET_FOCUSED_MAX_OUTPUT_TOKENS,
          allowOversizedPrompt: true
        }, _0x16e87c);
        try {
          const _0x50ec08 = normalizeText(getStoryAssetResponseFinishReason(_0x3979c4) || _0x303ca1.batchSubmissionRecords[_0x3aa9d1]?.finishReason).toLowerCase();
          if (isStoryAssetResponseTruncated(_0x50ec08)) {
            throw Object.assign(new Error(_0x199d66 + "输出被截断。"), {
              type: "OUTPUT_LENGTH",
              finishReason: _0x50ec08
            });
          }
          _0x22ec6c = allowLocalBaselineFallback ? parseStoryAssetInventoryResultWithSalvage(_0x3979c4, {
            sourceScenes: _0x4c6085.sourceScenes
          }) : parseStoryAssetInventoryResult(_0x3979c4, {
            sourceScenes: JSON.parse(_0x303ca1.batchSubmissionRecords[_0x3aa9d1]?.contractSnapshot?.prompt || "{}").sourceScenes || _0x4c6085.sourceScenes
          });
        } catch (_0x403b5b) {
          await _0x5e079b(_0x3aa9d1, _0x16e87c, _0x403b5b);
        }
      } catch (_0x449084) {
        if (["ASSET_SUBMISSION_AMBIGUOUS", "ASSET_PAID_RESULT_BLOCKED", "ASSET_EXTRACTION_CONTINUE_REQUIRED"].includes(_0x449084?.type)) {
          throw _0x449084;
        }
        const _0x2c9ed4 = classifyStoryAssetKindError(_0x449084);
        _0x409f2c = true;
        _0x19f3ba = getStoryAssetKindErrorLabel(_0x2c9ed4.type, _0x2c9ed4.message) + "，已熔断后续请求";
        await _0x2922d9(_0x4c6085, _0x19f3ba);
        continue;
      }
      _0x303ca1.inventoryBatches.push({
        id: _0x4c6085.id,
        status: "succeeded",
        sourceSceneRefs: _0x4c6085.sourceScenes.map(_0x2e662e => _0x2e662e.ref),
        salvaged: Boolean(_0x22ec6c.salvaged),
        inventory: _0x22ec6c
      });
      _0x35cc9d(_0x3aa9d1);
      await _0x116dfd({
        stage: "inventory",
        message: _0x199d66 + "完成；本轮已调用 " + _0xa16dc2 + "/" + _0x167e79 + " 次"
      });
    }
    const _0x2e8ab2 = new Set(_0x303ca1.inventoryBatches.flatMap(_0x3a755d => _0x3a755d.sourceSceneRefs || []));
    const _0xc28f0c = _0x45a380.map(_0x10a8c5 => _0x10a8c5.ref).filter(_0x407996 => !_0x2e8ab2.has(_0x407996));
    if (_0xc28f0c.length) {
      const _0x5d6f7c = new Set(_0xc28f0c);
      await _0x2922d9({
        id: "inventory-missing-local-fallback",
        sourceScenes: _0x45a380.filter(_0x5d3846 => _0x5d6f7c.has(_0x5d3846.ref))
      }, "清单覆盖缺失，已使用本地确定性清单补齐");
    }
  }
  if (!_0x303ca1.inventory) {
    const _0x4bc551 = mergeStoryAssetInventoryResults(_0x303ca1.inventoryBatches.map(_0x553938 => _0x553938.inventory), {
      sourceScenes: _0x45a380
    });
    _0x303ca1.inventory = _0x4bc551;
  }
  _0x303ca1.inventory = reconcileStoryAssetInventory(_0x303ca1.inventory, {
    project: project,
    sourceScenes: _0x45a380
  });
  if (!allowLocalBaselineFallback) {
    const _0x8f9211 = (_0x303ca1.inventory?.assets || []).filter(_0x330842 => _0x330842?.kind === "scene" && /[/／|｜]/u.test(normalizeText(_0x330842?.name)));
    if (_0x8f9211.length) {
      _0x303ca1.failures.push({
        stage: "inventory",
        batchId: "inventory-scene-quality-gate",
        batchLabel: "场景原子化校验",
        errorType: "composite-scene-assets",
        errorMessage: "仍有 " + _0x8f9211.length + " 个复合场景名",
        assetRefs: _0x8f9211.map(_0x5c23f0 => _0x5c23f0.ref)
      });
      _0x303ca1.status = "failed";
      await _0x116dfd({
        stage: "inventory",
        message: "场景清单仍包含 " + _0x8f9211.length + " 个复合地点；已停止且不会把复合标题写入正式资产"
      });
      throw createStoryAssetPipelineError(_0x303ca1.failures);
    }
  }
  reportStoryAssetDiagnostics(diagnostics, "story-asset-candidate-ledger", {
    status: "completed",
    ...(_0x303ca1.inventory?.candidateLedger?.summary || {})
  });
  const _0x388588 = inspectStoryAssetInventoryCoverage(_0x303ca1.inventory, _0x45a380);
  if (_0x388588.length) {
    _0x303ca1.inventory.coverageWarnings = cloneStoryAssetExtractionValue(_0x388588);
    reportStoryAssetDiagnostics(diagnostics, "story-asset-coverage-warning", {
      status: "fallback",
      issueCount: _0x388588.length,
      issueTypes: normalizeStringArray(_0x388588.map(_0x5d8ccf => _0x5d8ccf.type))
    });
  } else {
    delete _0x303ca1.inventory.coverageWarnings;
  }
  const _0x2aaa3e = createStoryAssetDetailPlans({
    inventory: _0x303ca1.inventory,
    sourceScenes: _0x45a380,
    chapterIds: _0xc84ee2.chapterIds
  });
  const _0x2da84f = new Map(_0x2aaa3e.map(_0xfe870a => [_0xfe870a.ref, _0xfe870a]));
  _0x303ca1.completedAssets = (Array.isArray(_0x303ca1.completedAssets) ? _0x303ca1.completedAssets : []).filter(_0x53a140 => _0x2da84f.has(_0x53a140?.ref) && (allowLocalBaselineFallback || normalizeText(_0x53a140?.designStatus) !== "baseline")).map(_0x528acb => {
    const _0x4f4088 = _0x2da84f.get(_0x528acb.ref);
    const _0x2f4345 = new Map(_0x4f4088.appearances.map(_0x158121 => [_0x158121.ref, _0x158121]));
    const _0x548140 = (Array.isArray(_0x528acb?.appearances) ? _0x528acb.appearances : []).filter(_0x195d1d => _0x2f4345.has(_0x195d1d?.ref)).map(_0x288816 => {
      const _0x195ec2 = _0x2f4345.get(_0x288816.ref);
      return {
        ..._0x288816,
        name: _0x195ec2.name,
        occurrences: _0x195ec2.occurrences,
        sourceChapterIds: _0x195ec2.sourceEpisodeRefs,
        sourceEpisodeRefs: _0x195ec2.sourceEpisodeRefs,
        sourceSceneRefs: _0x195ec2.sourceSceneRefs
      };
    });
    return {
      ..._0x528acb,
      kind: _0x4f4088.kind,
      name: _0x4f4088.name,
      role: _0x4f4088.role,
      occurrences: _0x4f4088.occurrences,
      prompt: _0x548140[0]?.prompt || _0x528acb.prompt || "",
      sourceChapterIds: _0x4f4088.sourceEpisodeRefs,
      sourceEpisodeRefs: _0x4f4088.sourceEpisodeRefs,
      sourceSceneRefs: _0x4f4088.sourceSceneRefs,
      appearances: _0x548140
    };
  });
  _0x303ca1.detailBatches = Array.isArray(_0x303ca1.detailBatches) ? _0x303ca1.detailBatches : [];
  const _0x81b73c = new Set(_0x303ca1.detailBatches.map(_0x64c086 => normalizeText(_0x64c086?.submissionBatchKey)).filter(Boolean));
  Object.entries(_0x303ca1.batchSubmissionRecords).forEach(([_0x2587b1, _0x2dac3a]) => {
    if (normalizeText(_0x2dac3a?.stage) !== "detail" || !normalizeText(_0x2dac3a?.rawResponse) || _0x81b73c.has(_0x2587b1)) {
      return;
    }
    let _0x3a84f2 = [];
    try {
      const _0x5de4c4 = JSON.parse(_0x2dac3a?.contractSnapshot?.prompt || "{}");
      _0x3a84f2 = Array.isArray(_0x5de4c4?.assetPlans) ? _0x5de4c4.assetPlans : [];
    } catch {
      return;
    }
    const _0xfead09 = _0x3a84f2.map(_0x20fbd6 => _0x2da84f.get(normalizeText(_0x20fbd6?.ref))).filter(Boolean);
    const _0x400e0f = _0x3a84f2.map(_0x24d7ee => normalizeText(_0x24d7ee?.ref)).filter(_0x417e72 => _0x417e72 && !_0x2da84f.has(_0x417e72));
    if (!_0xfead09.length || !_0x400e0f.length) {
      return;
    }
    const _0x1baffe = salvageStoryAssetDetailBatchResult(_0x2dac3a.rawResponse, {
      assetPlans: _0xfead09,
      chapterIds: _0xc84ee2.chapterIds,
      visualStyle: _0x5db17a
    });
    const _0x3f863a = new Set(_0x1baffe.map(_0x38a9bc => _0x38a9bc.ref));
    if (!_0xfead09.every(_0x4c4dd1 => _0x3f863a.has(_0x4c4dd1.ref))) {
      return;
    }
    _0x303ca1.completedAssets = [..._0x303ca1.completedAssets.filter(_0x3432a9 => !_0x3f863a.has(_0x3432a9.ref)), ..._0x1baffe];
    _0x303ca1.detailBatches.push({
      id: normalizeText(_0x2dac3a?.batchId) || "detail-recovered-" + (_0x303ca1.detailBatches.length + 1),
      status: "succeeded",
      assetRefs: _0xfead09.map(_0x32e8c6 => _0x32e8c6.ref),
      completedAssetRefs: _0x1baffe.map(_0x1a2ebf => _0x1a2ebf.ref),
      fallbackAssetRefs: [],
      recoveredFromSavedResponse: true,
      submissionBatchKey: _0x2587b1,
      reconciledRemovedAssetRefs: _0x400e0f
    });
    _0x303ca1.batchSubmissionRecords[_0x2587b1] = {
      ..._0x2dac3a,
      status: "validated",
      validatedAt: Date.now(),
      recoveredFromSavedResponse: true,
      reconciledRemovedAssetRefs: _0x400e0f
    };
    _0x81b73c.add(_0x2587b1);
  });
  _0x303ca1.detailBatches.forEach(_0xae3de8 => {
    const _0x28fdc7 = normalizeText(_0xae3de8?.rawResponse);
    if (!_0x28fdc7 || _0xae3de8?.status === "succeeded") {
      return;
    }
    const _0x37dbce = normalizeStringArray(_0xae3de8?.assetRefs).map(_0x28c099 => _0x2da84f.get(_0x28c099)).filter(Boolean);
    if (!_0x37dbce.length) {
      return;
    }
    const _0xd3a094 = salvageStoryAssetDetailBatchResult(_0x28fdc7, {
      assetPlans: _0x37dbce,
      chapterIds: _0xc84ee2.chapterIds,
      visualStyle: _0x5db17a
    });
    const _0x564995 = new Set(_0xd3a094.map(_0x4acc1c => _0x4acc1c.ref));
    const _0x5147a3 = allowLocalBaselineFallback ? createStoryAssetBaselineDetailAssets(_0x37dbce.filter(_0x485c44 => !_0x564995.has(_0x485c44.ref)), {
      sourceScenes: _0x45a380,
      visualStyle: _0x5db17a
    }) : [];
    const _0x22ecca = [..._0xd3a094, ..._0x5147a3];
    if (!_0x22ecca.length) {
      return;
    }
    const _0x2b63d8 = new Set(_0x22ecca.map(_0xd879ff => _0xd879ff.ref));
    _0x303ca1.completedAssets = [..._0x303ca1.completedAssets.filter(_0xd4e72b => !_0x2b63d8.has(_0xd4e72b.ref)), ..._0x22ecca];
    _0xae3de8.completedAssetRefs = normalizeStringArray([...(_0xae3de8.completedAssetRefs || []), ..._0x2b63d8]);
    _0xae3de8.fallbackAssetRefs = normalizeStringArray([...(_0xae3de8.fallbackAssetRefs || []), ..._0x5147a3.map(_0x15454e => _0x15454e.ref)]);
    _0xae3de8.status = _0x37dbce.every(_0x3b90a3 => _0x2b63d8.has(_0x3b90a3.ref)) ? "succeeded" : "partial";
    _0xae3de8.recoveredFromSavedResponse = true;
    if (_0xae3de8.status === "succeeded") {
      delete _0xae3de8.rawResponse;
    }
  });
  const _0x5bce74 = new Set(_0x303ca1.completedAssets.map(_0x46df91 => _0x46df91.ref));
  const _0x220637 = _0x2aaa3e.filter(_0x156a7c => !_0x5bce74.has(_0x156a7c.ref));
  let _0x5a9c89 = [];
  let _0x2476ed = null;
  try {
    _0x5a9c89 = createStoryAssetDetailPromptBatches(_0x220637, {
      project: project,
      sourceScenes: _0x45a380,
      aspectRatio: aspectRatio,
      visualStyle: _0x5db17a,
      estimateByKind: _0x303ca1.outputEstimates
    });
  } catch (_0x524477) {
    _0x2476ed = _0x524477;
  }
  const _0x4e4436 = _0x303ca1.detailBatches.length;
  const _0x199391 = async ({
    batchPlans: _0x2196d0,
    batchId: _0x445c4b,
    fallbackReason: _0x42771c,
    message: _0x544e2b
  }) => {
    if (!allowLocalBaselineFallback) {
      const _0x13cefa = normalizeText(_0x42771c) || "资产视觉细化 API 请求不可用";
      _0x303ca1.detailBatches.push({
        id: _0x445c4b,
        status: "failed",
        assetRefs: _0x2196d0.map(_0x27034f => _0x27034f.ref),
        completedAssetRefs: [],
        fallbackAssetRefs: [],
        errorMessage: _0x13cefa
      });
      _0x303ca1.failures.push({
        stage: "detail",
        batchId: _0x445c4b,
        batchLabel: _0x445c4b + "（" + _0x2196d0.length + " 个资产）",
        errorType: "incomplete-ai-detail",
        errorMessage: _0x13cefa,
        assetRefs: _0x2196d0.map(_0x2dd880 => _0x2dd880.ref)
      });
      _0x303ca1.status = _0x303ca1.completedAssets.length ? "partial" : "failed";
      await _0x116dfd({
        stage: "detail",
        message: _0x544e2b + "；已停止且不会生成本地假提示词"
      });
      throw createStoryAssetPipelineError(_0x303ca1.failures);
    }
    const _0x217c66 = createStoryAssetBaselineDetailAssets(_0x2196d0, {
      sourceScenes: _0x45a380,
      visualStyle: _0x5db17a
    });
    const _0x339f85 = new Set(_0x217c66.map(_0x4a81b3 => _0x4a81b3.ref));
    _0x303ca1.completedAssets = [..._0x303ca1.completedAssets.filter(_0x486384 => !_0x339f85.has(_0x486384.ref)), ..._0x217c66];
    _0x303ca1.detailBatches.push({
      id: _0x445c4b,
      status: "succeeded",
      assetRefs: _0x2196d0.map(_0x3d909a => _0x3d909a.ref),
      completedAssetRefs: _0x217c66.map(_0x39fe1f => _0x39fe1f.ref),
      fallbackAssetRefs: _0x217c66.map(_0x19a7f8 => _0x19a7f8.ref),
      fallbackReason: _0x42771c,
      circuitBreakerFallback: true
    });
    await _0x116dfd({
      stage: "detail",
      message: _0x544e2b
    });
  };
  if (_0x220637.length) {
    _0x303ca1.phase = "detail";
    _0x303ca1.status = "in-progress";
    await _0x116dfd({
      stage: "detail",
      message: "正在按资产证据生成描述与图片提示词（已完成 " + _0x5bce74.size + "/" + _0x2aaa3e.length + " 个）"
    });
  }
  if (_0x220637.length && _0x2476ed) {
    await _0x199391({
      batchPlans: _0x220637,
      batchId: "detail-" + (_0x4e4436 + 1),
      fallbackReason: normalizeText(_0x2476ed?.message) || "资产证据超过安全窗口",
      message: "资产证据超过安全窗口，已在本地生成 " + _0x220637.length + " 个基础设定，不会扩大请求"
    });
  }
  for (let _0x35983e = 0; _0x35983e < _0x5a9c89.length; _0x35983e += 1) {
    const _0xa9d10f = _0x5a9c89[_0x35983e];
    const _0x2afcc1 = "detail-" + (_0x4e4436 + _0x35983e + 1);
    const _0x124170 = _0x2afcc1 + "（" + _0xa9d10f.length + " 个资产）";
    const _0x217d6e = createStoryAssetBatchContractKey("detail", _0xa9d10f.map(_0x42668e => _0x42668e.kind + ":" + _0x42668e.ref + ":" + _0x42668e.name));
    const _0x2e16bc = {
      stage: "detail",
      batchId: _0x2afcc1,
      batchKey: _0x217d6e,
      kinds: normalizeStringArray(_0xa9d10f.map(_0x2d14e2 => _0x2d14e2.kind)),
      contractIdentities: _0xa9d10f.map(_0x23a1d2 => _0x23a1d2.kind + ":" + _0x23a1d2.ref + ":" + _0x23a1d2.name),
      assetCount: _0xa9d10f.length,
      sourceSceneCount: selectStoryAssetDetailSourceScenes(_0xa9d10f, _0x45a380).length
    };
    if (!allowLocalBaselineFallback && !_0x409f2c && _0xa16dc2 >= _0x167e79) {
      await _0x5a2ab8({
        stage: "detail",
        message: "本轮已完成 " + _0xa16dc2 + "/" + _0x167e79 + " 次分批调用；仍有提示词批次待处理，系统将自动继续",
        remaining: {
          phase: "detail",
          assetCount: _0x5a9c89.slice(_0x35983e).reduce((_0x30521a, _0x3305ef) => _0x30521a + _0x3305ef.length, 0),
          batchCount: _0x5a9c89.length - _0x35983e
        }
      });
    }
    if (_0x409f2c) {
      await _0x199391({
        batchPlans: _0xa9d10f,
        batchId: _0x2afcc1,
        fallbackReason: _0x19f3ba || "前序请求失败，熔断后未继续调用 API",
        message: _0x124170 + "已跳过 API，使用本地基础设定补齐；已完成 " + (_0x303ca1.completedAssets.length + _0xa9d10f.length) + "/" + _0x2aaa3e.length + " 个资产"
      });
      continue;
    }
    let _0x39853a = null;
    try {
      _0x39853a = await _0x4cad1d({
        model: _0x511978,
        provider: _0x43929f,
        ...(_0x2c6173 ? {
          providerProfileId: _0x2c6173
        } : {}),
        prompt: buildStoryAssetDetailBatchPrompt({
          project: project,
          sourceScenes: _0x45a380,
          batches: _0x5a9c89,
          batchIndex: _0x35983e,
          aspectRatio: aspectRatio,
          visualStyle: _0x5db17a
        }),
        systemPrompt: STORY_ASSET_DETAIL_SYSTEM_PROMPT,
        structuredOutput: createStoryAssetDetailStructuredOutput(_0x35983e, _0xa9d10f),
        thinking: {
          type: "disabled"
        },
        temperature: 0.2,
        timeoutMs: STORY_ASSET_EXPERIMENTAL_REQUEST_TIMEOUT_MS,
        maxOutputTokens: STORY_ASSET_FOCUSED_MAX_OUTPUT_TOKENS
      }, _0x2e16bc);
      const _0x266155 = normalizeText(getStoryAssetResponseFinishReason(_0x39853a) || _0x303ca1.batchSubmissionRecords[_0x217d6e]?.finishReason).toLowerCase();
      let _0x2a8a66 = [];
      let _0x287a21 = null;
      if (!allowLocalBaselineFallback) {
        try {
          if (isStoryAssetResponseTruncated(_0x266155)) {
            throw Object.assign(new Error(_0x124170 + "输出被截断。"), {
              type: "OUTPUT_LENGTH",
              finishReason: _0x266155
            });
          }
          const _0x1e5f97 = JSON.parse(_0x303ca1.batchSubmissionRecords[_0x217d6e]?.contractSnapshot?.prompt || "{}");
          _0x2a8a66 = parseStoryAssetDetailBatchResult(_0x39853a, {
            assetPlans: Array.isArray(_0x1e5f97?.assetPlans) ? _0x1e5f97.assetPlans : _0xa9d10f,
            chapterIds: _0xc84ee2.chapterIds,
            visualStyle: _0x5db17a
          });
        } catch (_0x1271de) {
          await _0x5e079b(_0x217d6e, _0x2e16bc, _0x1271de);
        }
      } else {
        try {
          if (isStoryAssetResponseTruncated(_0x266155)) {
            throw Object.assign(new Error(_0x124170 + "输出被截断。"), {
              type: "OUTPUT_LENGTH",
              finishReason: _0x266155
            });
          }
          _0x2a8a66 = parseStoryAssetDetailBatchResult(_0x39853a, {
            assetPlans: _0xa9d10f,
            chapterIds: _0xc84ee2.chapterIds,
            visualStyle: _0x5db17a
          });
        } catch (_0x3e954a) {
          _0x287a21 = _0x3e954a;
          _0x2a8a66 = salvageStoryAssetDetailBatchResult(_0x39853a, {
            assetPlans: _0xa9d10f,
            chapterIds: _0xc84ee2.chapterIds,
            visualStyle: _0x5db17a
          });
        }
      }
      const _0x16219f = _0x2a8a66;
      const _0x1ed43d = new Set(_0x2a8a66.map(_0x25bc0d => _0x25bc0d.ref));
      const _0x1dda28 = allowLocalBaselineFallback ? createStoryAssetBaselineDetailAssets(_0xa9d10f.filter(_0x425d4e => !_0x1ed43d.has(_0x425d4e.ref)), {
        sourceScenes: _0x45a380,
        visualStyle: _0x5db17a
      }) : [];
      const _0x315407 = Boolean(_0x287a21 || _0x1dda28.length);
      _0x2a8a66 = [..._0x2a8a66, ..._0x1dda28];
      if (_0x2a8a66.length) {
        const _0x2f8d59 = new Set(_0x2a8a66.map(_0x27e4a => _0x27e4a.ref));
        _0x303ca1.completedAssets = [..._0x303ca1.completedAssets.filter(_0x4aa4d => !_0x2f8d59.has(_0x4aa4d.ref)), ..._0x2a8a66];
        _0x303ca1.outputEstimates = updateStoryAssetOutputEstimates(_0x303ca1.outputEstimates, _0x16219f);
      }
      const _0x319714 = new Set(_0x2a8a66.map(_0x1594ce => _0x1594ce.ref));
      const _0xb01650 = _0xa9d10f.filter(_0x311fd3 => !_0x319714.has(_0x311fd3.ref));
      const _0x3d92d5 = _0xb01650.length > 0;
      _0x303ca1.detailBatches.push({
        id: _0x2afcc1,
        status: _0x315407 || _0xb01650.length ? "partial" : "succeeded",
        assetRefs: _0xa9d10f.map(_0x504b34 => _0x504b34.ref),
        completedAssetRefs: _0x2a8a66.map(_0x2ae5ce => _0x2ae5ce.ref),
        fallbackAssetRefs: _0x1dda28.map(_0x122fc8 => _0x122fc8.ref),
        ...(_0x1dda28.length ? {
          fallbackReason: normalizeText(_0x287a21?.message) || "AI 响应缺少 " + _0x1dda28.length + " 个资产"
        } : {}),
        ...(_0x3d92d5 || _0x315407 ? {
          rawResponse: normalizeText(getResultText(_0x39853a)),
          finishReason: _0x266155
        } : {})
      });
      _0x35cc9d(_0x217d6e);
      if (_0x315407) {
        _0x409f2c = true;
        _0x19f3ba = (normalizeText(_0x287a21?.message) || "AI 响应缺少 " + _0x1dda28.length + " 个资产") + "，已熔断后续细化请求";
      }
      if (_0x315407 && !allowLocalBaselineFallback) {
        throw _0x287a21 || new Error(_0x124170 + "缺少 " + (_0xa9d10f.length - _0x16219f.length) + " 个完整 API 资产结果。");
      }
      if (_0xb01650.length) {
        throw _0x287a21 || new Error(_0x124170 + "缺少 " + _0xb01650.length + " 个资产结果。");
      }
      await _0x116dfd({
        stage: "detail",
        message: _0x315407 ? _0x124170 + "响应不完整，已本地补齐并熔断后续 API；已完成 " + _0x303ca1.completedAssets.length + "/" + _0x2aaa3e.length + " 个资产" : _0x124170 + "完成；已完成 " + _0x303ca1.completedAssets.length + "/" + _0x2aaa3e.length + " 个资产，本轮已调用 " + _0xa16dc2 + "/" + _0x167e79 + " 次"
      });
    } catch (_0x415d9e) {
      if (["ASSET_SUBMISSION_AMBIGUOUS", "ASSET_PAID_RESULT_BLOCKED", "ASSET_EXTRACTION_CONTINUE_REQUIRED"].includes(_0x415d9e?.type)) {
        throw _0x415d9e;
      }
      const _0x2e361e = classifyStoryAssetKindError(_0x415d9e);
      if (_0x39853a === null) {
        _0x409f2c = true;
        const _0x574e0f = getStoryAssetKindErrorLabel(_0x2e361e.type, _0x2e361e.message);
        _0x19f3ba = _0x574e0f + "，已熔断后续细化请求";
        await _0x199391({
          batchPlans: _0xa9d10f,
          batchId: _0x2afcc1,
          fallbackReason: _0x19f3ba,
          message: "" + _0x124170 + _0x574e0f + "；本批改用本地基础设定，后续批次不再调用 API"
        });
        continue;
      }
      _0x303ca1.failures.push({
        stage: "detail",
        batchId: _0x2afcc1,
        batchLabel: _0x124170,
        errorType: _0x2e361e.type,
        errorMessage: _0x2e361e.message,
        assetRefs: _0xa9d10f.map(_0x5ead7f => _0x5ead7f.ref)
      });
      _0x303ca1.status = _0x303ca1.completedAssets.length ? "partial" : "failed";
      await _0x116dfd({
        stage: "detail",
        message: "" + _0x124170 + getStoryAssetKindErrorLabel(_0x2e361e.type, _0x2e361e.message) + "；已保存本批可解析结果，未自动重试"
      });
      throw createStoryAssetPipelineError(_0x303ca1.failures);
    }
  }
  if (!allowLocalBaselineFallback) {
    const _0x193759 = new Set(_0x303ca1.completedAssets.filter(_0x18849d => normalizeText(_0x18849d?.designStatus) !== "baseline").map(_0x407d85 => _0x407d85.ref));
    const _0x1853fc = _0x2aaa3e.filter(_0x11bbe5 => !_0x193759.has(_0x11bbe5.ref));
    if (_0x1853fc.length) {
      _0x303ca1.failures.push({
        stage: "detail",
        batchId: "detail-quality-gate",
        batchLabel: "API 视觉细化完整性校验",
        errorType: "incomplete-ai-detail",
        errorMessage: "仍有 " + _0x1853fc.length + " 个资产没有完整 API 视觉结果",
        assetRefs: _0x1853fc.map(_0x25edfe => _0x25edfe.ref)
      });
      _0x303ca1.status = _0x303ca1.completedAssets.length ? "partial" : "failed";
      await _0x116dfd({
        stage: "detail",
        message: "仍有 " + _0x1853fc.length + " 个资产没有完整 API 视觉结果；已停止且不会写入本地假提示词"
      });
      throw createStoryAssetPipelineError(_0x303ca1.failures);
    }
  }
  _0x303ca1.completedAssets.sort((_0x15e86c, _0x263abe) => _0x2aaa3e.findIndex(_0x3ee8af => _0x3ee8af.ref === _0x15e86c.ref) - _0x2aaa3e.findIndex(_0xb8157b => _0xb8157b.ref === _0x263abe.ref));
  _0x303ca1.completedAssets = _0x303ca1.completedAssets.map(_0x1228bc => sanitizeStoryAssetPublicAsset(_0x1228bc, {
    visualStyle: _0x5db17a
  }));
  _0x303ca1.phase = "detail";
  _0x303ca1.status = "completed";
  _0x303ca1.failures = [];
  await _0x116dfd({
    stage: "detail",
    message: "资产提取完成：" + _0x303ca1.completedAssets.length + " 个资产，本轮分批调用 " + _0xa16dc2 + " 次；每个请求仅执行一次"
  });
  return {
    schemaVersion: STORY_ASSET_EXTRACTION_SCHEMA_VERSION,
    extractionStrategy: "evidence-batched-api",
    assets: _0x303ca1.completedAssets,
    candidateLedger: cloneStoryAssetExtractionValue(_0x303ca1.inventory?.candidateLedger)
  };
}
export async function extractStoryAssetsExperimental({
  project = {},
  episodes = [],
  model = "",
  provider = "",
  providerProfileId = "",
  aspectRatio = "",
  visualStyle = "",
  request = generateText,
  onProgress = null,
  onCheckpoint = null,
  resumeDraft = null,
  diagnostics = null
} = {}) {
  const _0x4d9611 = normalizeText(model);
  const _0x4cf1bc = normalizeText(provider);
  const _0xc8dffe = normalizeText(providerProfileId);
  if (!_0x4d9611 || !_0x4cf1bc) {
    throw new Error("请先选择可用的文本模型。");
  }
  const _0x1e2c59 = normalizeStoryContext(project);
  const _0x4aa780 = normalizeStoryAssetExtractionSources(episodes);
  const _0x3634e7 = normalizeText(visualStyle) || _0x1e2c59.visualStyle;
  const _0x5be00f = createStoryAssetExtractionFingerprint({
    storyContext: _0x1e2c59,
    sourceScenes: _0x4aa780,
    model: _0x4d9611,
    provider: _0x4cf1bc,
    providerProfileId: _0xc8dffe,
    aspectRatio: aspectRatio,
    visualStyle: _0x3634e7
  });
  const _0x4073b0 = createStoryAssetExtractionContentFingerprint({
    storyContext: _0x1e2c59,
    sourceScenes: _0x4aa780,
    aspectRatio: aspectRatio,
    visualStyle: _0x3634e7
  });
  const _0x20dd24 = restoreStoryAssetPipelineDraft(resumeDraft, {
    sourceFingerprint: _0x5be00f,
    sourceContentFingerprint: _0x4073b0
  });
  const _0x3d6635 = Object.fromEntries(STORY_ASSET_EXPERIMENTAL_KINDS.map(_0x58f430 => [_0x58f430, {
    kind: _0x58f430,
    status: "pending",
    attempt: 0,
    assetCount: 0,
    errorType: "",
    errorMessage: "",
    startedAt: 0,
    finishedAt: 0
  }]));
  let _0x3774dd = _0x20dd24 || {
    strategy: STORY_ASSET_EXTRACTION_DRAFT_STRATEGY,
    schemaVersion: STORY_ASSET_BATCHED_EXTRACTION_SCHEMA_VERSION,
    sourceFingerprint: _0x5be00f,
    sourceContentFingerprint: _0x4073b0,
    status: "pending",
    phase: "kind",
    assetsByKind: Object.fromEntries(STORY_ASSET_EXPERIMENTAL_KINDS.map(_0x310acf => [_0x310acf, []])),
    kindStates: _0x3d6635,
    completedKinds: [],
    completedAssets: [],
    failures: [],
    totalRequestCount: 0
  };
  _0x3774dd.strategy = STORY_ASSET_EXTRACTION_DRAFT_STRATEGY;
  _0x3774dd.schemaVersion = STORY_ASSET_BATCHED_EXTRACTION_SCHEMA_VERSION;
  _0x3774dd.sourceFingerprint = _0x5be00f;
  _0x3774dd.sourceContentFingerprint = _0x4073b0;
  _0x3774dd.phase = "kind";
  _0x3774dd.assetsByKind = _0x3774dd.assetsByKind && typeof _0x3774dd.assetsByKind === "object" ? _0x3774dd.assetsByKind : {};
  _0x3774dd.kindStates = _0x3774dd.kindStates && typeof _0x3774dd.kindStates === "object" ? _0x3774dd.kindStates : {};
  STORY_ASSET_EXPERIMENTAL_KINDS.forEach(_0x45ed92 => {
    if (!Array.isArray(_0x3774dd.assetsByKind[_0x45ed92])) {
      _0x3774dd.assetsByKind[_0x45ed92] = [];
    }
    _0x3774dd.kindStates[_0x45ed92] = {
      ..._0x3d6635[_0x45ed92],
      ...(_0x3774dd.kindStates[_0x45ed92] || {}),
      kind: _0x45ed92
    };
  });
  _0x3774dd.completedKinds = STORY_ASSET_EXPERIMENTAL_KINDS.filter(_0x4fdc7c => _0x3774dd.kindStates[_0x4fdc7c]?.status === "succeeded");
  _0x3774dd.failures = [];
  _0x3774dd.runRequestCount = 0;
  let _0x139071 = 0;
  const _0x196144 = async (_0x115ba0 = "") => {
    _0x3774dd.completedKinds = STORY_ASSET_EXPERIMENTAL_KINDS.filter(_0x4f92bb => _0x3774dd.kindStates[_0x4f92bb]?.status === "succeeded");
    if (_0x3774dd.status !== "completed") {
      _0x3774dd.completedAssets = STORY_ASSET_EXPERIMENTAL_KINDS.flatMap(_0x5bd663 => _0x3774dd.assetsByKind[_0x5bd663] || []);
    }
    _0x3774dd.progress = {
      stage: "kind",
      current: _0x3774dd.completedKinds.length,
      total: STORY_ASSET_EXPERIMENTAL_KINDS.length,
      message: _0x115ba0,
      requestCount: _0x139071
    };
    _0x3774dd = await saveStoryAssetExtractionCheckpoint(_0x3774dd, onCheckpoint);
    onProgress?.({
      stage: "extracting-asset-kinds",
      current: _0x3774dd.progress.current,
      total: _0x3774dd.progress.total,
      message: _0x115ba0
    });
  };
  const _0x2a3808 = async _0x239212 => {
    _0x139071 += 1;
    _0x3774dd.runRequestCount = _0x139071;
    _0x3774dd.totalRequestCount = Math.max(0, Number(_0x3774dd.totalRequestCount) || 0) + 1;
    const _0x406759 = buildStoryAssetKindExtractionPrompt({
      project: project,
      sourceScenes: _0x4aa780,
      kind: _0x239212,
      aspectRatio: aspectRatio,
      visualStyle: _0x3634e7
    });
    const _0x16afb7 = Date.now();
    reportStoryAssetDiagnostics(diagnostics, "story-asset-request", {
      stage: "kind",
      kind: _0x239212,
      status: "started",
      requestCount: _0x139071,
      promptCharacters: _0x406759.length,
      sourceSceneCount: _0x4aa780.length
    });
    try {
      const _0x253526 = await request({
        model: _0x4d9611,
        provider: _0x4cf1bc,
        ...(_0xc8dffe ? {
          providerProfileId: _0xc8dffe
        } : {}),
        prompt: _0x406759,
        systemPrompt: buildStoryAssetKindSystemPrompt(_0x239212),
        structuredOutput: createStoryAssetKindStructuredOutput(_0x239212),
        thinking: {
          type: "disabled"
        },
        temperature: 0.1,
        timeoutMs: STORY_ASSET_EXPERIMENTAL_REQUEST_TIMEOUT_MS,
        maxOutputTokens: STORY_ASSET_FOCUSED_MAX_OUTPUT_TOKENS,
        allowOversizedPrompt: true
      });
      const _0x5f25c4 = getStoryAssetResponseFinishReason(_0x253526).toLowerCase();
      if (isStoryAssetResponseTruncated(_0x5f25c4)) {
        throw Object.assign(new Error(STORY_ASSET_KIND_LABELS[_0x239212] + "输出被截断。"), {
          type: "OUTPUT_LENGTH",
          finishReason: _0x5f25c4
        });
      }
      reportStoryAssetDiagnostics(diagnostics, "story-asset-request", {
        stage: "kind",
        kind: _0x239212,
        status: "succeeded",
        requestCount: _0x139071,
        elapsedMs: Math.max(0, Date.now() - _0x16afb7),
        responseCharacters: normalizeText(getResultText(_0x253526)).length
      });
      return _0x253526;
    } catch (_0x4d275a) {
      const _0x5bb67c = classifyStoryAssetKindError(_0x4d275a);
      reportStoryAssetDiagnostics(diagnostics, "story-asset-request", {
        stage: "kind",
        kind: _0x239212,
        status: "failed",
        requestCount: _0x139071,
        elapsedMs: Math.max(0, Date.now() - _0x16afb7),
        errorType: _0x5bb67c.type,
        errorMessage: _0x5bb67c.message
      });
      throw _0x4d275a;
    }
  };
  _0x3774dd.status = "in-progress";
  await _0x196144("正在按输出域提取资产（已完成 " + _0x3774dd.completedKinds.length + "/" + STORY_ASSET_EXPERIMENTAL_KINDS.length + "）");
  for (const _0x1152f6 of STORY_ASSET_EXPERIMENTAL_KINDS) {
    if (_0x3774dd.kindStates[_0x1152f6]?.status === "succeeded") {
      continue;
    }
    const _0x5052e3 = Date.now();
    _0x3774dd.kindStates[_0x1152f6] = {
      ..._0x3774dd.kindStates[_0x1152f6],
      kind: _0x1152f6,
      status: "running",
      attempt: Math.max(0, Math.trunc(Number(_0x3774dd.kindStates[_0x1152f6]?.attempt) || 0)) + 1,
      assetCount: 0,
      errorType: "",
      errorMessage: "",
      startedAt: _0x5052e3,
      finishedAt: 0
    };
    await _0x196144("正在提取" + STORY_ASSET_KIND_LABELS[_0x1152f6] + "；完整剧本输入保持不变");
    try {
      const _0xea502e = await _0x2a3808(_0x1152f6);
      const _0x317c86 = parseStoryAssetKindExtractionResult(_0xea502e, {
        kind: _0x1152f6,
        sourceScenes: _0x4aa780,
        chapterIds: _0x1e2c59.chapterIds,
        visualStyle: _0x3634e7
      });
      _0x3774dd.assetsByKind[_0x1152f6] = _0x317c86.assets;
      _0x3774dd.kindStates[_0x1152f6] = {
        ..._0x3774dd.kindStates[_0x1152f6],
        status: "succeeded",
        assetCount: _0x317c86.assets.length,
        errorType: "",
        errorMessage: "",
        finishedAt: Date.now()
      };
      await _0x196144(STORY_ASSET_KIND_LABELS[_0x1152f6] + "完成：" + _0x317c86.assets.length + " 个");
    } catch (_0x52e53c) {
      const _0x296ae5 = classifyStoryAssetKindError(_0x52e53c);
      _0x3774dd.kindStates[_0x1152f6] = {
        ..._0x3774dd.kindStates[_0x1152f6],
        status: "failed",
        assetCount: 0,
        errorType: _0x296ae5.type,
        errorMessage: _0x296ae5.message,
        finishedAt: Date.now()
      };
      _0x3774dd.failures = [{
        stage: "kind",
        kind: _0x1152f6,
        errorType: _0x296ae5.type,
        errorMessage: _0x296ae5.message
      }];
      _0x3774dd.status = _0x3774dd.completedKinds.length ? "partial" : "failed";
      await _0x196144("" + STORY_ASSET_KIND_LABELS[_0x1152f6] + getStoryAssetKindErrorLabel(_0x296ae5.type, _0x296ae5.message) + "；未自动重试");
      throw createStoryAssetPipelineError(_0x3774dd.failures);
    }
  }
  const _0x580aaf = normalizeStringArray(_0x4aa780.flatMap(_0x510e64 => _0x510e64.characters || []));
  const _0x5de282 = STORY_ASSET_EXPERIMENTAL_KINDS.flatMap(_0xe1d0f => _0x3774dd.assetsByKind[_0xe1d0f] || []).map(_0x2b56d1 => {
    const _0xb81baf = normalizeStringArray(_0x2b56d1?.sourceSceneRefs);
    const _0x750d01 = _0xb81baf.length ? _0xb81baf : inferStoryAssetSourceSceneRefs(_0x2b56d1?.kind, _0x2b56d1?.name, _0x4aa780);
    return {
      ..._0x2b56d1,
      sourceSceneRefs: _0x750d01
    };
  }).filter(_0x18638d => normalizeStringArray(_0x18638d?.sourceSceneRefs).length > 0 && (_0x18638d?.kind !== "prop" || !_0x580aaf.some(_0x110309 => storyCharacterNamesOverlap(_0x18638d?.name, _0x110309))));
  const _0x19b243 = reconcileStoryAssetInventory(parseStoryAssetInventoryResult({
    assets: _0x5de282.map(_0x54dd33 => ({
      ref: _0x54dd33.ref,
      kind: _0x54dd33.kind,
      name: _0x54dd33.name,
      role: _0x54dd33.role,
      description: _0x54dd33.description,
      sourceSceneRefs: _0x54dd33.sourceSceneRefs,
      appearances: (_0x54dd33.appearances || []).map(_0x5e98bb => ({
        ref: _0x5e98bb.ref,
        name: _0x5e98bb.name,
        description: _0x5e98bb.description,
        sourceSceneRefs: _0x5e98bb.sourceSceneRefs
      }))
    })),
    sceneAudits: _0x4aa780.map(_0x15454f => ({
      sourceSceneRef: _0x15454f.ref,
      keyPropNames: _0x5de282.filter(_0x5c4e2f => _0x5c4e2f.kind === "prop" && _0x5c4e2f.sourceSceneRefs.includes(_0x15454f.ref)).map(_0x185a36 => _0x185a36.name)
    }))
  }, {
    sourceScenes: _0x4aa780
  }), {
    project: project,
    sourceScenes: _0x4aa780
  });
  const _0xbd284a = inspectStoryAssetInventoryCoverage(_0x19b243, _0x4aa780);
  if (_0xbd284a.length) {
    throw createCoverageError(_0xbd284a);
  }
  _0x3774dd.inventory = _0x19b243;
  _0x3774dd.completedAssets = finalizeStoryAssetInventoryAssets({
    inventory: _0x19b243,
    sourceScenes: _0x4aa780,
    chapterIds: _0x1e2c59.chapterIds,
    visualStyle: _0x3634e7
  });
  _0x3774dd.status = "completed";
  _0x3774dd.failures = [];
  await _0x196144("资产提取完成：" + _0x3774dd.completedAssets.length + " 个资产；模型只返回精简清单，基础提示词已在本地生成");
  return {
    schemaVersion: STORY_ASSET_EXTRACTION_SCHEMA_VERSION,
    extractionStrategy: "kind-compact",
    assets: _0x3774dd.completedAssets
  };
}