export const VIDEO_REPLICATION_PROMPT_MODEL_ID = "google/gemini-3.1-flash-lite-preview";
function normalizeText(_0x167d2f, _0x5aac90 = "") {
  const _0x358bc9 = String(_0x167d2f ?? "").trim();
  return _0x358bc9 || _0x5aac90;
}
function extractJsonObject(_0x49569d) {
  const _0x3131df = normalizeText(_0x49569d?.text ?? _0x49569d);
  if (!_0x3131df) {
    return null;
  }
  const _0xc07e12 = _0x3131df.match(/```(?:json)?\s*([\s\S]*?)```/iu)?.[1] || _0x3131df;
  const _0x456fa4 = _0xc07e12.indexOf("{");
  const _0x2db2d4 = _0xc07e12.lastIndexOf("}");
  if (_0x456fa4 < 0 || _0x2db2d4 <= _0x456fa4) {
    return null;
  }
  try {
    return JSON.parse(_0xc07e12.slice(_0x456fa4, _0x2db2d4 + 1));
  } catch {
    return null;
  }
}
export function createVideoReplicationPromptStructuredOutput() {
  return {
    name: "video_replication_clip_analysis",
    strict: true,
    fallback: "prompt",
    schema: {
      type: "object",
      additionalProperties: false,
      required: ["title", "synopsis", "fullScript", "seedancePrompt", "camera", "sound", "segments"],
      properties: {
        title: {
          type: "string",
          minLength: 1
        },
        synopsis: {
          type: "string",
          minLength: 1
        },
        fullScript: {
          type: "string",
          minLength: 1
        },
        seedancePrompt: {
          type: "string",
          minLength: 1
        },
        camera: {
          type: "string"
        },
        sound: {
          type: "string"
        },
        segments: {
          type: "array",
          minItems: 1,
          items: {
            type: "object",
            additionalProperties: false,
            required: ["title", "startSec", "endSec", "script", "prompt", "visual", "camera", "dialogue", "sound"],
            properties: {
              title: {
                type: "string",
                minLength: 1
              },
              startSec: {
                type: "number",
                minimum: 0
              },
              endSec: {
                type: "number",
                exclusiveMinimum: 0
              },
              script: {
                type: "string"
              },
              prompt: {
                type: "string",
                minLength: 1
              },
              visual: {
                type: "string"
              },
              camera: {
                type: "string"
              },
              dialogue: {
                type: "string"
              },
              sound: {
                type: "string"
              }
            }
          }
        }
      }
    }
  };
}
export function buildVideoReplicationPromptAnalysisPrompt({
  durationSec = 0,
  targetLocale = "zh-CN",
  targetLocaleLabel = "中国 · 中文",
  visualStyle = ""
} = {}) {
  const _0x47ad01 = Math.max(1, Number(durationSec) || 15);
  const _0x5c318e = normalizeText(visualStyle, "保持原视频的画面媒介与质感");
  return ["你是专业短剧导演、分镜分析师和 Seedance 2.0 提示词工程师。", "请逐帧理解输入视频片段，提取可复刻的剧情节拍、主体关系、动作顺序、场景、景别、运镜、光影、台词和声音。", "不要保留或猜测原人物真实身份、姓名、明星信息或可识别的真实脸部特征；保留角色在故事中的身份、关系、年龄层、性格、服装功能和连续性，人物外观改为目标地区的虚构角色。", "目标地区与语种：" + normalizeText(targetLocaleLabel, targetLocale) + "（" + normalizeText(targetLocale) + "）。所有标题、梗概、完整剧本、台词与提示词必须使用该目标语种；台词保持原意、信息量、说话顺序和戏剧功能，不新增或删改剧情。", "目标创作风格：" + _0x5c318e + "。这是复刻故事与视频生成的正式创作约束，不是只加在 seedancePrompt 开头的风格前缀。", "在不改变原视频剧情事实、因果、动作节拍、镜头顺序与台词含义的前提下，把该风格贯穿 synopsis、fullScript 和 segments.script 的叙事语气、场景表达、情绪节奏与动作呈现，并贯穿各级视频提示词的主体、环境、光影和镜头描述。若所选风格只描述视觉媒介，则只调整适用的表现方式，不要据此编造新剧情。", "只本地化人物外观、环境文化细节、文字语言和视觉媒介；保留原故事中角色的功能身份、关系、目标、冲突与结局。", "目标生成时长约 " + _0x47ad01.toFixed(2) + " 秒，提示词复杂度必须与时长匹配。", _0x47ad01 > 8 ? "seedancePrompt 必须使用清晰的分时段描述，每段时间连续且覆盖完整时长。" : "seedancePrompt 按发生顺序描述动作，不要塞入无法在当前时长完成的额外剧情。", "seedancePrompt 必须包含：主体与场景、动作编排、景别与运镜、情绪、光影风格、台词（如有）、背景音乐与关键音效；通过具体内容体现目标风格，不要仅在开头复述风格名称。", "seedancePrompt 中不要写 @视频、@图片等素材引用；引用语句由系统根据生成路线统一添加。", "fullScript 必须按原视频时间顺序写成可用于后续角色/场景/道具提取的完整分集剧本；保留每句对白的角色归属，听不清处用语义等价的最小补全，不要编造新情节。", "segments 按可独立生成的视频片段划分并覆盖完整时间轴；每段写明 startSec/endSec、局部剧本、画面、运镜、对白、声音及可直接生成的 prompt。", "准确复刻结构与节奏，但不要逐字照抄画面内受版权保护的长文本。", "只返回指定 JSON 对象，不要附加解释。"].join("\n");
}
export function parseVideoReplicationPromptAnalysisResult(_0x31b8f7, {
  durationSec = 0
} = {}) {
  const _0x57a8de = extractJsonObject(_0x31b8f7);
  const _0x49c082 = normalizeText(_0x31b8f7?.text ?? _0x31b8f7);
  const _0x1c8146 = normalizeText(_0x57a8de?.seedancePrompt, _0x57a8de ? "" : _0x49c082);
  if (!_0x1c8146) {
    throw new Error("视频理解模型未返回可用的 Seedance 提示词");
  }
  return {
    title: normalizeText(_0x57a8de?.title, "未命名片段"),
    synopsis: normalizeText(_0x57a8de?.synopsis, _0x1c8146.slice(0, 120)),
    fullScript: normalizeText(_0x57a8de?.fullScript, _0x57a8de?.synopsis || _0x1c8146),
    seedancePrompt: _0x1c8146,
    camera: normalizeText(_0x57a8de?.camera),
    sound: normalizeText(_0x57a8de?.sound),
    segments: Array.isArray(_0x57a8de?.segments) ? _0x57a8de.segments.map(_0x3e5132 => ({
      title: normalizeText(_0x3e5132?.title),
      startSec: Math.max(0, Number(_0x3e5132?.startSec) || 0),
      endSec: Math.max(0, Number(_0x3e5132?.endSec) || 0),
      script: normalizeText(_0x3e5132?.script),
      prompt: normalizeText(_0x3e5132?.prompt),
      visual: normalizeText(_0x3e5132?.visual),
      camera: normalizeText(_0x3e5132?.camera),
      dialogue: normalizeText(_0x3e5132?.dialogue),
      sound: normalizeText(_0x3e5132?.sound)
    })).filter(_0x4548a3 => _0x4548a3.prompt || _0x4548a3.script) : [],
    durationSec: Math.max(0, Number(durationSec) || 0)
  };
}
export function buildVideoReplicationGenerationPrompt({
  analysis = {},
  useSourceVideoReference = true,
  characterCount = 0
} = {}) {
  const _0x115003 = normalizeText(analysis?.seedancePrompt);
  if (!_0x115003) {
    return "";
  }
  const _0x40baab = Math.max(0, Math.min(9, Math.trunc(Number(characterCount) || 0)));
  const _0x218421 = _0x40baab > 0 ? "人物外观按出场顺序严格参考 " + Array.from({
    length: _0x40baab
  }, (_0x25ef8e, _0x1f79ed) => "@图片" + (_0x1f79ed + 1)).join("、") + "，分别对应主体A、主体B等角色；保持脸部、发型与服装一致。" : "";
  return [useSourceVideoReference ? "参考 @视频1 的剧情节奏、动作编排、景别变化、运镜和声音结构。" : "", useSourceVideoReference ? "不要保留原视频人物身份与外貌，人物形象以指定的人设图为准。" : "", _0x218421, _0x115003].filter(Boolean).join("\n");
}