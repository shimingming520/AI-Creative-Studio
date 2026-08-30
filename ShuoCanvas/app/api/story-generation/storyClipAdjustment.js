import { getStoryPromptModeLabel, isStoryMinimaxH3PromptMode, isStorySeedance25PromptMode, isStoryWan30PromptMode, normalizeStoryMinimaxH3OfficialTags, normalizeStoryPromptMode } from "../../src/modules/storyWorkspace/storyPromptModes.js";
import { getStoryClipPromptModeRewriteRequirements } from "./storyPromptModeRules.js";
export const STORY_CLIP_ADJUSTMENT_SCHEMA_VERSION = 3;
export const STORY_CLIP_ADJUSTMENT_SYSTEM_PROMPT = ["你是一名专业的短剧分镜提示词编辑。", "你的任务是按照用户说明，只调整指定的视频提示词内容，不扩写整集、不创建新片段，也不生成视频。", "保持当前卡片中的人物、场景、道具、剧情事件、对白、画外音和上下文连续；按照用户说明调整镜头组织、节奏与时间，并细化当前情境能够自然呈现的表演。", "候选提示词采用可直接交给视频生成模型执行的画面描述。根据当前镜头选择有表达价值的环境层次、人物位置与朝向、动作过程、姿态或手势、面部表情与视线、道具互动、光影变化和动作落点。", "镜头语言根据剧情、动作和情绪选择观众的观察方式，可写对当前镜头有意义的景别、机位与角度、构图、运镜、焦点和落点。静止或运动都可以；中景、平视、固定镜头在适合当前叙事时也是有效选择。", "用户要求保持的资产引用必须逐字保留；不得为了缩短单镜时长而删除、概括或新增当前卡片的剧情内容。", "如请求包含 targetPromptMode，必须严格执行其中对应的目标提示词结构；不同模式的镜头时间语法不可混用。", "scope 为 selection 时，只返回选中文字的替换文本；scope 为 prompt 或 clip 时，返回完整的候选视频提示词。", "不要输出 HTML、Markdown、代码块、解释、修改说明或多个方案。MiniMax H3 官方格式要求的 <Subject N>、<Picture N>、<Video N>、<Audio N>、<d>、<scenetrans>、<cutoff> 是提示词文本标签，不是 HTML。", "除目标提示词模式必要的英文字段名和官方结构标签外，candidateText 的叙述、对白、画外音、歌词和画面文字全部直接输出简体中文。返回 JSON 前先自行检查并把草稿中的英文正文改写为中文，不要把英文正文交给客户端处理。只返回严格 JSON 对象，且只能包含 candidateText、candidateDurationSeconds 两个字段；无需调整总时长时 candidateDurationSeconds 可以省略。"].join("\n");
export function createStoryClipAdjustmentApi({
  generateText: _0x5c59e8,
  parseStrictJson: _0x2935a4,
  normalizeText: _0xd71335,
  normalizePositiveNumber: _0x9d6bec,
  getResultText: _0x4295fd,
  assertPlanningModel: _0x1d745c,
  buildStoryTextProviderProfilePayload: _0x260d46,
  requestStrictResult: _0x1f6836,
  requestTimeoutMs: _0x5669f5
} = {}) {
  function _0x1642ce(_0xef3254) {
    if (["selection", "prompt", "clip"].includes(_0xef3254)) {
      return _0xef3254;
    } else {
      return "prompt";
    }
  }
  function _0x47e9ca(_0x2151e8) {
    return [...new Set((Array.isArray(_0x2151e8) ? _0x2151e8 : []).map(_0xd71335).filter(Boolean))].slice(0, 50);
  }
  function _0x4c5adf(_0x363826 = {}) {
    const _0x5b7144 = _0x363826 && typeof _0x363826 === "object" && !Array.isArray(_0x363826) ? _0x363826 : {};
    return {
      projectTitle: _0xd71335(_0x5b7144.projectTitle),
      storySummary: _0xd71335(_0x5b7144.storySummary),
      episodeNumber: Math.max(1, Math.trunc(Number(_0x5b7144.episodeNumber) || 1)),
      episodeTitle: _0xd71335(_0x5b7144.episodeTitle),
      episodeSynopsis: _0xd71335(_0x5b7144.episodeSynopsis),
      clipTitle: _0xd71335(_0x5b7144.clipTitle),
      clipScript: _0xd71335(_0x5b7144.clipScript),
      creativeIntent: _0xd71335(_0x5b7144.creativeIntent),
      transition: _0xd71335(_0x5b7144.transition)
    };
  }
  function _0x2bbddc({
    scope = "prompt",
    instruction = "",
    currentPrompt = "",
    selectedText = "",
    preserveAssetRefs = true,
    preserveDuration = true,
    lockedAssetTokens = [],
    lockedDurationTokens = [],
    duration = "",
    maxDurationSeconds = 0,
    context = {},
    sourcePromptMode = "",
    targetPromptMode = ""
  } = {}) {
    const _0x346c33 = _0x1642ce(scope);
    const _0x2ec843 = _0x9d6bec(maxDurationSeconds);
    const _0x43d388 = preserveDuration !== true && _0x346c33 !== "selection" && _0x2ec843 > 0;
    const _0x28915d = Boolean(_0xd71335(targetPromptMode));
    const _0x1a1f43 = normalizeStoryPromptMode(sourcePromptMode, {
      allowDeveloperModes: true
    });
    const _0x392d63 = normalizeStoryPromptMode(targetPromptMode, {
      allowDeveloperModes: true
    });
    const _0x15c641 = _0x28915d ? getStoryClipPromptModeRewriteRequirements(_0x392d63, {
      hasAssetRefs: _0x47e9ca(lockedAssetTokens).length > 0
    }) : [];
    return JSON.stringify({
      task: "adjust_story_clip_prompt",
      schemaVersion: STORY_CLIP_ADJUSTMENT_SCHEMA_VERSION,
      scope: _0x346c33,
      instruction: _0xd71335(instruction),
      currentPrompt: _0xd71335(currentPrompt),
      ...(_0x346c33 === "selection" ? {
        selectedText: _0xd71335(selectedText)
      } : {}),
      locked: {
        preserveAssetRefs: preserveAssetRefs === true,
        preserveDuration: preserveDuration === true,
        assetTokens: preserveAssetRefs === true ? _0x47e9ca(lockedAssetTokens) : [],
        durationTokens: preserveDuration === true ? _0x47e9ca(lockedDurationTokens) : [],
        clipDuration: preserveDuration === true ? _0xd71335(duration) : ""
      },
      timing: {
        sourceDuration: _0xd71335(duration),
        maxDurationSeconds: _0x2ec843,
        allowReallocation: _0x43d388,
        minimumShotDurationSeconds: 0.5,
        durationStepSeconds: 0.5
      },
      ...(_0x28915d ? {
        promptMode: {
          source: _0x1a1f43,
          sourceLabel: getStoryPromptModeLabel(_0x1a1f43),
          target: _0x392d63,
          targetLabel: getStoryPromptModeLabel(_0x392d63),
          converting: _0x1a1f43 !== _0x392d63
        }
      } : {}),
      context: _0x4c5adf(context),
      requirements: [_0x346c33 === "selection" ? "candidateText 只返回选中文字的替换内容，不要返回完整提示词。" : "candidateText 返回调整后的完整视频提示词。", "严格执行 instruction，不改变未要求修改的剧情事实。", _0x346c33 === "selection" ? "在 selectedText 范围内补充 instruction 要求的可观察表演，选区外内容保持原样。" : "当 instruction 要求增强画面、电影感或情绪表现时，把原叙述转译成摄像机实际拍到的连续画面，并根据当前镜头选择有表达价值的环境、人物位置、动作过程、表情视线、道具、光影以及镜头观察方式。", _0x346c33 === "selection" ? "替换内容的信息密度与原镜头时长自然匹配。" : "镜头语言与动作节拍、情绪落点和对应时长自然匹配；静止或运动镜头都按当前表达需要选择。", preserveAssetRefs === true ? _0x43d388 ? "assetTokens 中的每个引用必须在最终候选中逐字保留，不能改名或删除；因重新拆分镜头，可以在不同镜头中按需要重复引用同一资产。" : "assetTokens 中的每个引用必须在最终候选中逐字保留，不能改名、删除或重复添加。" : "可以按用户说明调整资产引用。", ..._0x15c641, preserveDuration === true ? "保持 clipDuration 和 durationTokens，不增加超过当前时长的动作、对白或镜头节拍。" : _0x43d388 ? _0x28915d ? "根据 targetPromptMode 的时间语法重新组织完整提示词；候选总时长不得超过 " + _0x2ec843 + " 秒，candidateDurationSeconds 必须与目标模式的时间结构一致。完整保留 currentPrompt 的人物、场景、道具、剧情事件、动作、对白与声音内容。" : "根据 instruction 决定是否重新拆分镜头和分配时间；instruction 未要求改变节奏时，候选总时长应尽量接近 sourceDuration。完整保留 currentPrompt 的人物、场景、道具、剧情事件、动作、对白与声音内容。每个镜头使用“⏱ 数字s”标记，单镜至少 0.5 秒并按 0.5 秒递增；总时长不得超过 " + _0x2ec843 + " 秒。candidateDurationSeconds 必须等于所有镜头时间标记之和。" : "可以按用户说明调整时间表达，但不得删减当前卡片内容。", _0x43d388 ? "只返回 JSON：{\"candidateText\":\"...\",\"candidateDurationSeconds\":15}。" : "只返回 JSON：{\"candidateText\":\"...\"}。"]
    });
  }
  function _0x5a3474(_0x54b69d) {
    const _0x426dbe = String(_0x54b69d ?? "").match(/\d+(?:\.\d+)?/);
    const _0xf2458 = Number(_0x426dbe?.[0]);
    if (Number.isFinite(_0xf2458) && _0xf2458 > 0) {
      return Number(_0xf2458.toFixed(1));
    } else {
      return 0;
    }
  }
  function _0x15553a(_0x7ecafa) {
    const _0xfe73fd = [];
    const _0x54e312 = /⏱\s*(\d+(?:\.\d+)?)\s*(?:s|秒)/gi;
    let _0x38a9db = null;
    while (_0x38a9db = _0x54e312.exec(String(_0x7ecafa || ""))) {
      const _0x115428 = Number(_0x38a9db[1]);
      if (Number.isFinite(_0x115428) && _0x115428 > 0) {
        _0xfe73fd.push(_0x115428);
      }
    }
    return _0xfe73fd;
  }
  function _0x5dee4a(_0x104edd, {
    allowMinimaxH3Tags = false
  } = {}) {
    const _0x25f4e0 = [];
    const _0x3fa6dc = _0x4ab710 => {
      const _0x3ba42f = "story-h3-tag-" + _0x25f4e0.length + "";
      _0x25f4e0.push({
        token: _0x3ba42f,
        tag: _0x4ab710
      });
      return _0x3ba42f;
    };
    let _0x16c2f1 = String(_0x104edd || "");
    if (allowMinimaxH3Tags) {
      _0x16c2f1 = _0x16c2f1.replace(/<\/?d>|<(?:scenetrans|cutoff)>|<(?:Subject|Picture|Video|Audio)\s+\d+>/giu, _0x3fa6dc);
    }
    _0x16c2f1 = _0x16c2f1.replace(/<!--[\s\S]*?-->/gu, "").replace(/<\s*(script|style|iframe|object|embed|svg|math|template|noscript)\b[^>]*>[\s\S]*?<\s*\/\s*\1\s*>/giu, "").replace(/<\s*\/?\s*(?:script|style|iframe|object|embed|svg|math|template|noscript)\b[^>]*>/giu, "").replace(/<\s*\/?\s*[a-z][^>]*>/giu, "");
    return _0x25f4e0.reduce((_0x59be65, {
      token: _0x14dd16,
      tag: _0x43a1eb
    }) => _0x59be65.split(_0x14dd16).join(_0x43a1eb), _0x16c2f1).trim();
  }
  function _0x41d2a(_0x1b046a, _0x148960, _0x4c3036, _0x53138b = "") {
    const _0x4492b2 = _0x9d6bec(_0x4c3036);
    if (!_0x148960) {
      throw new Error("AI 没有返回候选片段总时长。");
    }
    if (_0x4492b2 > 0 && _0x148960 > _0x4492b2 + 0.001) {
      throw new Error("候选片段总时长不能超过 " + _0x4492b2 + " 秒。");
    }
    const _0x27c522 = normalizeStoryPromptMode(_0x53138b, {
      allowDeveloperModes: true
    });
    if (isStorySeedance25PromptMode(_0x27c522) || isStoryWan30PromptMode(_0x27c522)) {
      const _0x501120 = [...String(_0x1b046a || "").matchAll(/(?:\[)?(\d+(?:\.\d+)?)\s*-\s*(\d+(?:\.\d+)?)秒(?:\])?/gu)].map(_0xbd653c => ({
        start: Number(_0xbd653c[1]),
        end: Number(_0xbd653c[2])
      }));
      if (!_0x501120.length) {
        throw new Error("候选提示词没有连续时间区间。");
      }
      let _0x110d14 = 0;
      _0x501120.forEach(({
        start: _0x584b7d,
        end: _0x53b886
      }) => {
        if (_0x584b7d !== _0x110d14 || _0x53b886 <= _0x584b7d) {
          throw new Error("候选提示词的时间区间不连续。");
        }
        _0x110d14 = _0x53b886;
      });
      if (Math.abs(_0x110d14 - _0x148960) > 0.001) {
        throw new Error("candidateDurationSeconds 必须等于最后一个时间区间的终点。");
      }
      return;
    }
    if (isStoryMinimaxH3PromptMode(_0x27c522)) {
      if (!Number.isInteger(_0x148960) || _0x148960 < 4 || _0x148960 > 15) {
        throw new Error("MiniMax H3 候选片段总时长必须为 4 至 15 秒的整数。");
      }
      if (!/(?:integrated_multimodal_description|detailed_description):/u.test(_0x1b046a)) {
        throw new Error("MiniMax H3 候选提示词缺少官方镜头描述段落。");
      }
      if (/⏱/u.test(_0x1b046a)) {
        throw new Error("MiniMax H3 候选提示词不能包含 ⏱ 时长标签。");
      }
      const _0x3e6be0 = [...String(_0x1b046a || "").matchAll(/\[Shot\s+\d+\]\s+At\s+(\d{2}):(\d{2}(?:\.\d{3})?)/gu)].map(_0xd2c574 => Number(_0xd2c574[1]) * 60 + Number(_0xd2c574[2]));
      if (_0x3e6be0.some((_0x151e7a, _0x4e99df) => _0x151e7a <= 0 || _0x151e7a >= _0x148960 || _0x4e99df > 0 && _0x151e7a <= _0x3e6be0[_0x4e99df - 1])) {
        throw new Error("MiniMax H3 候选提示词的切镜时间无效。");
      }
      return;
    }
    const _0x91efd0 = _0x15553a(_0x1b046a);
    if (!_0x91efd0.length) {
      throw new Error("候选提示词没有为每个镜头分配时间标记。");
    }
    const _0x1584bd = _0x91efd0.find(_0x196974 => _0x196974 < 0.5 || Math.abs(_0x196974 * 2 - Math.round(_0x196974 * 2)) > 0.001);
    if (_0x1584bd !== undefined) {
      throw new Error("候选镜头时长必须至少为 0.5 秒，并按 0.5 秒递增。");
    }
    const _0x5d839d = Number(_0x91efd0.reduce((_0x2cf04a, _0x4acd23) => _0x2cf04a + _0x4acd23, 0).toFixed(1));
    if (Math.abs(_0x5d839d - _0x148960) > 0.001) {
      throw new Error("candidateDurationSeconds 必须等于所有镜头时间标记之和。");
    }
  }
  function _0x3a1beb(_0x4d6103, {
    requireDuration = false,
    maxDurationSeconds = 0,
    promptMode = ""
  } = {}) {
    const _0x43996e = _0x2935a4(_0x4295fd(_0x4d6103), "AI 没有返回候选提示词。");
    let _0xd27f81 = _0xd71335(_0x43996e.candidateText);
    if (!_0xd27f81) {
      throw new Error("AI 返回的候选提示词为空。");
    }
    const _0x4112da = normalizeStoryPromptMode(promptMode, {
      allowDeveloperModes: true
    });
    const _0x5b0ee7 = isStoryMinimaxH3PromptMode(_0x4112da);
    if (_0x5b0ee7) {
      _0xd27f81 = normalizeStoryMinimaxH3OfficialTags(_0xd27f81);
    }
    _0xd27f81 = _0x5dee4a(_0xd27f81, {
      allowMinimaxH3Tags: _0x5b0ee7
    });
    if (!_0xd27f81) {
      throw new Error("AI 返回的候选提示词为空。");
    }
    const _0x23964e = _0x5a3474(_0x43996e.candidateDurationSeconds);
    if (requireDuration) {
      _0x41d2a(_0xd27f81, _0x23964e, maxDurationSeconds, promptMode);
    }
    return {
      candidateText: _0xd27f81,
      candidateDurationSeconds: _0x23964e
    };
  }
  function _0x41fdf1(_0x53690d, _0x25c00b) {
    return String(_0x53690d || "").split(_0x25c00b).length - 1;
  }
  function _0x1eb289(_0xd2d6b4, _0x47e781, _0x1691f0, _0x2e5c30, {
    allowCountChange = false
  } = {}) {
    const _0x479d93 = _0x47e9ca(_0x1691f0).filter(_0x5f3ea0 => allowCountChange ? _0x41fdf1(_0xd2d6b4, _0x5f3ea0) < 1 : _0x41fdf1(_0xd2d6b4, _0x5f3ea0) !== _0x41fdf1(_0x47e781, _0x5f3ea0));
    if (_0x479d93.length) {
      throw new Error(allowCountChange ? "候选内容缺少" + _0x2e5c30 + "：" + _0x479d93.join("、") : "候选内容没有原样保留" + _0x2e5c30 + "：" + _0x479d93.join("、"));
    }
  }
  async function _0x5b586c({
    scope = "prompt",
    instruction = "",
    currentPrompt = "",
    selection = null,
    preserveAssetRefs = true,
    preserveDuration = true,
    lockedAssetTokens = [],
    lockedDurationTokens = [],
    duration = "",
    maxDurationSeconds = 0,
    context = {},
    sourcePromptMode = "",
    targetPromptMode = "",
    model = "",
    provider = "",
    providerProfileId = "",
    request = _0x5c59e8,
    onProgress = null
  } = {}) {
    _0x1d745c(model, provider);
    const _0x38414c = _0x1642ce(scope);
    const _0x5f092c = _0xd71335(instruction);
    const _0x15bb00 = normalizeStoryPromptMode(sourcePromptMode, {
      allowDeveloperModes: true
    });
    const _0x4ab632 = Boolean(_0xd71335(targetPromptMode));
    const _0x793923 = normalizeStoryPromptMode(targetPromptMode, {
      allowDeveloperModes: true
    });
    const _0x535bdc = _0xd71335(currentPrompt);
    const _0x25a1ec = _0x9d6bec(maxDurationSeconds);
    const _0x92e16 = preserveDuration !== true && _0x38414c !== "selection" && _0x25a1ec > 0;
    const _0x3d355c = _0x5a3474(duration);
    if (!_0x5f092c && !_0x4ab632) {
      throw new Error("请先填写希望 AI 如何调整，或选择提示词模式。");
    }
    if (!_0x535bdc) {
      throw new Error("当前片段还没有可调整的视频提示词。");
    }
    let _0xdcd02c = "";
    let _0x47bd92 = 0;
    let _0x5e0b66 = 0;
    if (_0x38414c === "selection") {
      _0x47bd92 = Math.max(0, Math.trunc(Number(selection?.start) || 0));
      _0x5e0b66 = Math.max(_0x47bd92, Math.trunc(Number(selection?.end) || 0));
      _0xdcd02c = _0xd71335(selection?.text || _0x535bdc.slice(_0x47bd92, _0x5e0b66));
      if (!_0xdcd02c || _0x535bdc.slice(_0x47bd92, _0x5e0b66) !== _0xdcd02c) {
        throw new Error("选中文字已经变化，请重新选择后再调整。");
      }
    }
    const _0xa626d3 = _0x2bbddc({
      scope: _0x38414c,
      instruction: _0x5f092c,
      currentPrompt: _0x535bdc,
      selectedText: _0xdcd02c,
      preserveAssetRefs: preserveAssetRefs,
      preserveDuration: preserveDuration,
      lockedAssetTokens: lockedAssetTokens,
      lockedDurationTokens: lockedDurationTokens,
      duration: duration,
      maxDurationSeconds: _0x25a1ec,
      context: context,
      sourcePromptMode: _0x15bb00,
      targetPromptMode: _0x4ab632 ? _0x793923 : ""
    });
    onProgress?.({
      stage: "adjusting-story-clip",
      current: 1,
      total: 1,
      message: "正在生成候选版本"
    });
    return await _0x1f6836({
      request: request,
      requestPayload: {
        model: _0xd71335(model),
        provider: _0xd71335(provider),
        ..._0x260d46(providerProfileId),
        prompt: _0xa626d3,
        systemPrompt: STORY_CLIP_ADJUSTMENT_SYSTEM_PROMPT,
        temperature: 0.45,
        timeoutMs: _0x5669f5
      },
      parse: _0xae40e8 => {
        const _0x9c47c3 = _0x3a1beb(_0xae40e8, {
          requireDuration: _0x92e16,
          maxDurationSeconds: _0x25a1ec,
          promptMode: _0x4ab632 ? _0x793923 : ""
        });
        const _0x3dec00 = _0x38414c === "selection" ? _0xd71335("" + _0x535bdc.slice(0, _0x47bd92) + _0x9c47c3.candidateText + _0x535bdc.slice(_0x5e0b66)) : _0x9c47c3.candidateText;
        if (preserveAssetRefs === true) {
          _0x1eb289(_0x3dec00, _0x535bdc, lockedAssetTokens, "资产引用", {
            allowCountChange: _0x92e16
          });
        }
        if (preserveDuration === true) {
          _0x1eb289(_0x3dec00, _0x535bdc, lockedDurationTokens, "时间标记");
        }
        return {
          schemaVersion: STORY_CLIP_ADJUSTMENT_SCHEMA_VERSION,
          scope: _0x38414c,
          candidateText: _0x3dec00,
          candidateDurationSeconds: _0x92e16 ? _0x9c47c3.candidateDurationSeconds : _0x3d355c || _0x9c47c3.candidateDurationSeconds,
          replacementText: _0x38414c === "selection" ? _0x9c47c3.candidateText : "",
          sourcePromptMode: _0x15bb00,
          targetPromptMode: _0x4ab632 ? _0x793923 : _0x15bb00
        };
      },
      outputContract: _0x92e16 ? _0x4ab632 ? "candidateText and candidateDurationSeconds; strictly use " + _0x793923 + " prompt structure; keep all source content and asset tokens; timing is within maxDurationSeconds" : "candidateText and candidateDurationSeconds; keep all source content and asset tokens; each shot uses a 0.5-second-step timing token; timing sum is within maxDurationSeconds" : "candidateText string; preserve every locked asset and duration token",
      repairInstruction: _0x92e16 ? _0x4ab632 ? "只修复候选提示词，使其严格符合 " + _0x793923 + " 的目标结构、资产引用与时间语法；完整保留当前卡片剧情信息，candidateDurationSeconds 不超过上限；不要解释。" : "只修复候选提示词的格式、资产引用与镜头时间分配；完整保留当前卡片内容，确保每镜至少 0.5 秒、按 0.5 秒递增，时间标记总和等于 candidateDurationSeconds 且不超过上限；不要解释。" : "只修复候选提示词的格式与锁定内容；不要解释。",
      retryTemperature: 0.2
    });
  }
  return {
    adjustStoryClipPrompt: _0x5b586c,
    buildStoryClipAdjustmentPrompt: _0x2bbddc,
    parseStoryClipAdjustmentResult: _0x3a1beb
  };
}