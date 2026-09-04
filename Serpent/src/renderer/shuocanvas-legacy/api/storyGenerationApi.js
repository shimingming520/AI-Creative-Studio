import { generateText } from "./aiTextApi.js";
import { extractCompleteJsonArrayItems, extractJsonStringProperty, parseStrictJson } from "./utils/strictJson.js";
import { normalizePositiveNumber, normalizeStringArray, normalizeText } from "./utils/storyGenerationValues.js";
import { normalizeStorySceneHeadingIdentity, storySceneIdentitiesOverlap } from "./utils/storySceneIdentity.js";
import { enqueueStoryEpisodeExperimentalRequest } from "./storyEpisodeExperimentalRequestQueue.js";
import { enqueueStoryEpisodeRequest } from "./storyEpisodeRequestQueue.js";
import { STORY_CLIP_ADJUSTMENT_SCHEMA_VERSION, STORY_CLIP_ADJUSTMENT_SYSTEM_PROMPT, createStoryClipAdjustmentApi } from "./story-generation/storyClipAdjustment.js";
import { createParallelStoryAssetExtractor } from "./story-generation/storyAssetParallelExtraction.js";
import { createStoryAssetPromptContracts, createStoryAssetExtractionStructuredOutput } from "./story-generation/storyAssetExtractionRequest.js";
import { STORY_ASSET_EXTRACTION_KINDS, STORY_ASSET_EXTRACTION_SCHEMA_VERSION, createStoryAssetCompactExtractionResponseSchema, createStoryAssetExtractionResponseSchema, normalizeStoryAssetReference as a173_0x3e308f, parseStoryAssetCompactExtractionResult, parseStoryAssetExtractionResult } from "./story-generation/storyAssetExtractionResult.js";
import { createStoryEpisodeOutlinePlanningApi } from "./story-generation/storyEpisodeOutlinePlanning.js";
import { createStoryInvocationLifecycle, invokeStoryGenerationRequest } from "./story-generation/storyInvocationEvidence.js";
import { repairStoryEpisodeScriptMissingBodyTerminators } from "./story-generation/storyEpisodeScriptResponseRecovery.js";
import { STORY_EPISODE_SCRIPT_CONTENT_REVISION_SYSTEM_PROMPT, STORY_EPISODE_SCRIPT_REPAIR_SYSTEM_PROMPT, STORY_EPISODE_SCRIPT_SYSTEM_PROMPT, createStoryEpisodeScriptPromptApi } from "./story-generation/storyEpisodeScriptPrompt.js";
import { assertStoryEpisodeSplitTiming, createStoryEpisodeScriptRuntimeGuidance, ensureStoryEpisodeScriptTiming, preserveStoryEpisodeScriptWithoutTimingReview, requestStoryEpisodeScriptTimingReview, resolveStoryEpisodeSplitTimingBudget } from "./story-generation/storyEpisodeScriptTiming.js";
import { STORY_MAX_SPOKEN_UNITS_PER_SECOND, countStorySpokenUnits } from "./story-generation/storyEpisodeSpokenTiming.js";
import { appendStoryEpisodeSplitPartialRepairFailure, applyStoryEpisodeSplitPartialRepairs, buildStoryEpisodeSplitPartialRepairPrompt, canRepairStoryEpisodeSplitPartialDraft } from "./story-generation/storyEpisodeSplitPartialRepair.js";
import { assertPlanningModel, buildStoryTextProviderProfilePayload, getResultText, requestStrictResult } from "./story-generation/storyTextRequest.js";
import { STORY_SUMMARY_MAX_PLOT_BEATS, STORY_SUMMARY_SCHEMA_VERSION, STORY_SUMMARY_SYSTEM_PROMPT, createStorySummaryBlueprint } from "./story-generation/storySummaryBlueprint.js";
import { createStorySummaryGenerationApi } from "./story-generation/storySummaryGeneration.js";
import { isStoryContinuousTimelinePromptMode, isStoryMinimaxH3PromptMode } from "../src/modules/storyWorkspace/storyPromptModes.js";
import { createStoryEpisodeSplitCompactSceneCatalog, createStoryEpisodeSplitPromptSceneCatalog } from "./story-generation/storyEpisodeScenePromptCatalog.js";
import { appendStoryEpisodePromptModeSystemPrompt, getStoryEpisodeTimelinePlanningRequirements, isStoryEpisodeTimelineGuidance, resolveStoryPromptModeClipMaxSeconds } from "./story-generation/storyPromptModeRules.js";
export { STORY_CLIP_ADJUSTMENT_SCHEMA_VERSION, STORY_CLIP_ADJUSTMENT_SYSTEM_PROMPT, STORY_ASSET_EXTRACTION_KINDS, STORY_ASSET_EXTRACTION_SCHEMA_VERSION, STORY_SUMMARY_SCHEMA_VERSION, STORY_SUMMARY_SYSTEM_PROMPT, parseStoryAssetExtractionResult };
export const STORY_GENERATION_SCHEMA_VERSION = 2;
export const STORY_PLANNING_SCHEMA_VERSION = 1;
export const STORY_EPISODE_SPLIT_SCHEMA_VERSION = 3;
export const STORY_EPISODE_BATCHED_SPLIT_SCHEMA_VERSION = 3;
export const STORY_EPISODE_OUTLINE_SCHEMA_VERSION = 2;
export const STORY_EPISODE_SCRIPT_SCHEMA_VERSION = 2;
export const STORY_SCRIPT_MODE_PLOT = "plot";
export const STORY_SCRIPT_MODE_NARRATION = "narration";
export const STORY_SOURCE_CHUNK_CHARACTERS = 24000;
export const STORY_CHAPTER_MIN_CHARACTERS = 1500;
export const STORY_CHAPTER_MAX_CHARACTERS = 3000;
export const STORY_TEXT_REQUEST_TIMEOUT_MS = 600000;
export const STORY_TEXT_MAX_OUTPUT_TOKENS = 16384;
export const STORY_EPISODE_SPLIT_MAX_OUTPUT_TOKENS = 32768;
export const STORY_EPISODE_SPLIT_REQUEST_TIMEOUT_MS = 480000;
export const STORY_EPISODE_COUNT_OPTIONS = Object.freeze([3, 5, 10, 20, 30, 50]);
export const STORY_EPISODE_COUNT_MAX = 100;
export const STORY_SCENE_MAX_SECONDS_OPTIONS = Object.freeze([15, 30]);
const STORY_EPISODE_DEV_RESPONSE_HISTORY_LIMIT = 6;
const STORY_EPISODE_OUTLINE_BATCH_SIZE = 4;
const STORY_CONTINUITY_MAX_CHARACTER_STATES = 12;
const STORY_CONTINUITY_MAX_PROP_STATES = 10;
const STORY_CONTINUITY_MAX_UNRESOLVED_THREADS = 8;
const STORY_CONTINUITY_MAX_FACTS = 12;
const STORY_EPISODE_EXPERIMENTAL_MAX_PLANS_PER_BATCH = 8;
const STORY_EPISODE_EXPERIMENTAL_BATCH_TARGET_DURATION_SECONDS = 75;
const STORY_EPISODE_EXPERIMENTAL_FALLBACK_PLAN_DURATION_SECONDS = 15;
const STORY_EPISODE_EXPERIMENTAL_MAX_SHOTS_PER_CLIP = 0;
const STORY_EPISODE_EXPERIMENTAL_PREFERRED_SHOTS_PER_CLIP = 4;
const STORY_EPISODE_EXPERIMENTAL_MAX_FINAL_SHOTS_PER_CLIP = 5;
const STORY_EPISODE_EXPERIMENTAL_SOURCE_BEAT_TARGET_CHARACTERS = 420;
const STORY_EPISODE_SPLIT_TEMPERATURE = 0.2;
const STORY_EPISODE_EXPERIMENTAL_SOURCE_BEAT_MAX_CHARACTERS = 620;
const STORY_EPISODE_EXPERIMENTAL_MAX_CONCURRENT_BATCHES = 3;
const STORY_EPISODE_EXPERIMENTAL_MIN_CLIP_DURATION_SECONDS = 4;
export const STORY_GENERATION_SYSTEM_PROMPT = ["你是一名专业的短剧故事策划与剧本编辑。", "你的任务仅是创建或整理故事剧情，不生成分镜、镜头提示词、角色绘图提示词、场景绘图提示词或分集方案。", "故事必须具备清晰的主角目标、人物动机、主要阻力、因果推进、关键转折、高潮和结局。", "不要使用空泛评价代替剧情，不要写创作说明，不要向用户提问。", "所有输出使用简体中文。", "只返回一个严格 JSON 对象；不要输出 Markdown、代码块、前后说明、注释或尾随逗号。", "JSON 必须且只能包含 title、storyType、storySummary、storyBackground、storySetting、logline、chapters 七个字段。", "storySummary 是可独立阅读的故事梗概，概括主角、目标、核心冲突、主要转折和结局。", "storyBackground 说明故事发生的时代、地点、社会环境和初始处境。", "storySetting 说明世界规则、核心机制、人物必须遵守的限制和关键设定。", "logline 用一句话概括主角、目标、阻力和故事钩子。", "chapters 是章节数组，每章必须包含 title 和 content；title 是小说式主标题，content 使用自然段连续叙事。", "每章 content 必须为 " + STORY_CHAPTER_MIN_CHARACTERS + " 至 " + STORY_CHAPTER_MAX_CHARACTERS + " 个汉字，不能用提纲、重复句或无意义内容凑字数。", "所有章节合在一起必须完整覆盖故事的起因、发展、转折、高潮和结局，不能只输出片段或章节提纲。"].join("\n");
const STORY_SOURCE_DIGEST_SYSTEM_PROMPT = ["你是长篇剧本信息整理助手。", "只提取原文事实，不续写、不评价、不改变人物关系和事件结果。", "每个分段摘要的 JSON 总内容控制在 1500 个汉字以内。", "只返回严格 JSON，不要输出 Markdown 或其他说明。", "JSON 必须包含 characters、settings、events、continuity、endingState。"].join("\n");
const STORY_ASSET_EXTRACTION_SYSTEM_PROMPT = ["你是专业的影视资产策划 Agent。", "你的任务是从已经确认的故事中提取需要保持视觉一致的角色、场景和关键道具资产。", "只依据输入故事提取，不续写剧情，不创建分集或分镜。", "角色的显著外观变化应拆成 appearances；普通情绪变化不要创建新形象。", "同一物理空间在不同年代、完好/损毁、正常/异变、干燥/积水等会明显改变参考画面的状态下，必须保留为同一个场景资产并拆成多个 appearances；普通镜头角度、短暂人物活动或不改变空间视觉基准的情绪氛围不拆形象。", "多形象角色的第一个 appearance 视为基础形象；每个 appearance name 都必须填写能区分视觉状态的通用具体名称，例如“日常装束”“正式装束”，禁止使用空值或笼统的“基础形象”。其他形象必须完整复述基础形象中的稳定身份特征，只改变剧情明确要求的服饰、年龄、伤势或状态。", "角色 name 只能填写原文姓名；原文没有姓名时使用不超过 6 个汉字的简短身份名，禁止写身份说明、剧情经历或逗号分隔的描述。", "原文中明确列入出场人物、登场人物或出场角色名单的每一个独立称谓，以及拥有对白、独立动作或被单独指代的每一个角色，都必须逐项返回；不同姓名、称谓或编号的角色不得合并。原文以群体身份出场且需要画面表现时，也必须返回对应的群体角色资产。", "角色 role 只能是“主角”“配角”“反派”“路人”之一：故事核心主人公标记为主角，推动剧情但不与主角长期对立的重要人物标记为配角，主要阻碍或敌对人物标记为反派，纯背景人物标记为路人。", "每个角色必须提供 voiceDescription 声音设定，并严格按“年龄、性别、身份、口音、情绪底色、声线、语速、说话方式、音色特征”九项描述；声音设定用于后续生成稳定一致的人物声音，不得写环境音、配乐或镜头音效。", "原文未明确的声音维度可依据角色身份、地域、年龄和性格合理设计，但不得改写或违背输入中已经明确的人物设定。", "角色提示词必须具体描述年龄与地域特征、脸型、眉眼、瞳色、鼻形、唇形、肤色与肤质、发型发色、身材体态、服装分层与材质、鞋履和必要穿戴细节，并使用正面全身人物设定图构图；禁止只写性别、年龄和服装等概括词。", "角色提示词只用于生成独立人设图，不是人物剧照：聚焦脸部、发型、体态、服装、鞋履和必要穿戴细节，采用自然站立的正面全身人物设定图构图，不写剧情道具、动作表演、地点、家具、其他人物或剧情场面。", "最终 prompt 只能写需要呈现的正向视觉内容，不得复述任何规则、限制、处理流程、模型说明或其他元说明措辞。", "每个场景资产只能表示一个可独立复用的物理空间；原文场景标题用“/”“／”等并列多个地点时，必须拆成多个原子场景资产，禁止把复合场景标题原样当作资产名称。", "场景提示词必须具体描述时代地点、空间用途、整体布局、前中后景、建筑或室内结构、表面材质、关键陈设、光源方向与色温、时间天气、色彩关系、镜头视角和景别，且默认无人；禁止只写地点与氛围。", "道具提示词必须具体描述用途、造型轮廓、尺寸比例、材质工艺、主辅颜色、纹样标识、磨损状态、关键结构和便于复用的产品设定构图，默认无人物手持。", "输入提供视觉风格时，每个 appearance prompt 必须逐字以完整视觉风格开头，后接资产描述；不得省略、改写或移动到提示词中部。", "所有引用的章节 ID 必须来自输入 chapters。", "所有输出使用简体中文，只返回严格 JSON，不要输出 Markdown、注释或说明。", "绝对不要复述、复制或改写输入剧本，也不要返回任务说明、输入参数或输出格式说明。", "返回 JSON 的顶层必须且只能包含 assets 字段；第一个字符必须是 {，最后一个字符必须是 }。"].join("\n");
const STORY_EPISODE_PLANNING_SYSTEM_PROMPT = ["你是专业的短剧分集策划 Agent。", "你的任务是把已经确认的故事规划成若干连续分集，不生成镜头或视频提示词。", "每集必须有清晰的推进、冲突或信息增量，并在自然节奏点结束。", "episodeCount 是目标分集数，不要求机械地精确凑满；应优先接近目标，通常保持在目标数的 90% 到 100%，且不得超过目标数。", "只有故事容量确实不足时才可低于建议范围；不得因输出篇幅、模型省略或提前收束剧情而大幅减少集数。", "sceneMaxSeconds 是后续单个视频片段的时长上限，不是整集时长。", "每集时长只能根据本集必要剧情、对白、动作、反应和自然停顿估算；不得套用固定集长，也不得为了接近某个秒数增加或删除剧情。", "assetRefs 必须逐字使用输入资产 ref，不得编造不存在的资产引用。", "所有输出使用简体中文，只返回严格 JSON，不要输出 Markdown、注释或说明。"].join("\n");
const STORY_EPISODE_SPLIT_ADAPTIVE_TIMING_GUIDANCE = "时长按当前人物把对白和表演自然完成所需来判断。口播字数只是参考之一，同时结合人物性格、语速、情绪、句式、呼吸、动作、停顿和反应；同样字数可以说得快，也可以说得慢，表情、动作与反应也可以同步发生。每个 shot.d 直接给出足以让该镜头 q 与 o 自然说完并完成必要动作和反应的时长；当前片段容纳不下时，在自然叙事位置续到下一 clip。不得依靠不自然的高速口播塞入对白，也不要按固定字数或固定每秒字数计算。";
const STORY_EPISODE_SPLIT_GROUPING_GUIDANCE = "clip 表示一次可独立生成的连续叙事片段，shots 表示该片段内部按观看节奏切换的镜头。先确定 clip 的连续表演过程，再在每个 clip 内设计 shots；不要先逐个设计 shot 再把每个 shot 分别包装成 clip。相邻内容仍处于同一场景与时段，并共同完成一段连续动作、同一轮对话及其表情或反应时，把它们组织为同一 clip 的连续 shots。说话人、景别、机位、视角、构图、运镜、表情或反应镜头的变化属于 shot 层级，不会单独决定片段边界。进入新的场景或时空、动作与情绪自然转入新的叙事阶段，或继续组织将超过用户设置的单片最大时长时，再自然进入下一 clip；片段与镜头数量按正文实际结构自然决定。";
const STORY_EPISODE_SPLIT_CONTINUITY_CHAIN_GUIDANCE = "单片时长上限只是生成能力造成的技术切片边界，不是剧情重新开场。相邻内容仍在同一 sourceSceneRef 和连续时空时，后一片段必须从前一片段结束的可观察状态继续：继承人物位置、朝向、动作进度、情绪、视线、手持道具、车辆或设备状态及空间方向；不得让人物返回更早位置、重复已经完成的动作、复原已经改变的道具或重新建立场景，除非原文明确写出返回、重复、复原、换场或时间跳跃。";
const STORY_EPISODE_SPLIT_PLOT_MODE_GUIDANCE = "scriptMode 为 plot（剧情模式）时，剧本中未标注说话人的普通动作和环境叙述用于设计画面 v，不作为可听见的解说。只有原剧本明确标注为旁白、画外音、VO 或 O.S. 的文字才放入 o；没有这种明确标注时 o 为空字符串。";
const STORY_EPISODE_SPLIT_NARRATION_MODE_GUIDANCE = "scriptMode 为 narration（解说模式）时，所有“旁白：”文本逐字放入对应 shot.o；shot.q 只保留原剧本已经存在的关键人物对白。";
const STORY_EPISODE_SPLIT_DIALOGUE_SPEAKER_GUIDANCE = "q 中每段人物对白都必须明确保留原文说话人，使用“说话人姓名：对白原文”的格式；不得只写台词正文，也不得因画面中只有一个人物而省略姓名。没有人物对白时 q 为空字符串。";
const STORY_EPISODE_SPLIT_VISUAL_GUIDANCE = "shot.visual 是可直接交给 AI 视频模型执行的正向画面提示词，不是剧情摘要、文学描述或创作说明。把原文转译成摄像机实际可见、可连续生成的画面；每一个 shot.visual 都必须明确当前可见主体、人物位置与朝向、正在发生的具体动作或状态变化、表情与视线、必要的环境层次、道具互动、光影变化以及动作落点。环境、心理、背景和情绪信息只要有叙事价值，就必须转换为原文能够支持的可观察行为或画面变化；禁止只写“他很害怕”“气氛紧张”“她意识到危险”“内心挣扎”等抽象结论。对白或旁白镜头也必须有与语义同步的可见表演、听者反应或环境事件，不能只让人物站着说话或只复述台词。";
const STORY_EPISODE_SPLIT_CAMERA_GUIDANCE = "镜头语言根据当前剧情、动作和情绪选择观众的观察方式，可交代对本镜头有意义的景别、机位与角度、构图、运镜、焦点和落点。静止或运动镜头都可以；中景、平视、固定镜头在适合当前叙事时也是有效选择。";
const STORY_EPISODE_SPLIT_SYSTEM_PROMPT = ["把输入正文按原顺序直接整理为采用可执行视频描述方式的短剧视频片段，不分析、不续写。", "只返回一个完整、闭合的 JSON 对象；不要输出 Markdown、代码块、解释、注释或任何前后缀。", "格式只能是 {\"clips\":[{\"s\":\"场景代码\",\"shots\":[{\"d\":镜头秒数,\"v\":\"连续可观察画面\",\"c\":\"景别、机位与运镜\",\"q\":\"完整对白或空字符串\",\"o\":\"完整旁白或空字符串\",\"a\":\"必要音效或空字符串\"},{\"d\":后续镜头秒数,\"v\":\"后续连续可观察画面\",\"c\":\"后续景别、机位与运镜\",\"q\":\"完整对白或空字符串\",\"o\":\"完整旁白或空字符串\",\"a\":\"必要音效或空字符串\"}]}]}。示意中的两个 shot 只展示同一 clip 内的层级关系，实际数量按当前片段内容自然确定；不得增加其他键。", "clips 中每一项是一个最终视频片段；s 必须逐字使用输入 scenes 中的 code，不得填写场景名称或编造代码。", "人物对白按原文顺序放入 q，旁白按原文顺序放入 o，都必须逐字完整保留；说出口或画外叙述的文字不得放入 v。", "严格读取输入 scriptMode，并按剧情模式或解说模式分别处理普通动作叙述与明确画外音。", STORY_EPISODE_SPLIT_DIALOGUE_SPEAKER_GUIDANCE, STORY_EPISODE_SPLIT_ADAPTIVE_TIMING_GUIDANCE, STORY_EPISODE_SPLIT_GROUPING_GUIDANCE, STORY_EPISODE_SPLIT_VISUAL_GUIDANCE, STORY_EPISODE_SPLIT_CAMERA_GUIDANCE, "有对白时让人物表情、视线、姿态和动作与台词同步，听者反应按当前表演节拍自然安排；a 记录对画面有帮助的环境声、动作声和表演声。q、o、a 没有内容时返回空字符串。", "每镜内容与 d 保持自然匹配；保持原剧情事实和资产，不额外扩写事件、人物、能力、道具或结果，也不输出表头、序号、@、人物外貌或结构标签。", "忽略“（本集完）”“（全剧终）”“待续”等编辑标记；只有原文明示为屏幕字幕的文字才表现字幕。"].join("\n");
const STORY_EPISODES_SPLIT_SYSTEM_PROMPT = ["按输入剧本原顺序拆分分镜，不分析、不续写。", "严格读取输入 scriptMode，并按剧情模式或解说模式分别处理普通动作叙述与明确画外音。", STORY_EPISODE_SPLIT_DIALOGUE_SPEAKER_GUIDANCE, STORY_EPISODE_SPLIT_ADAPTIVE_TIMING_GUIDANCE, STORY_EPISODE_SPLIT_GROUPING_GUIDANCE, STORY_EPISODE_SPLIT_VISUAL_GUIDANCE, STORY_EPISODE_SPLIT_CAMERA_GUIDANCE, "只返回一个完整 JSON 对象。"].join("\n");
const getStoryEpisodeSplitRequestSystemPrompt = ({
  compactPrompt = false,
  promptMode = "seedance-2.0"
} = {}) => appendStoryEpisodePromptModeSystemPrompt(compactPrompt ? STORY_EPISODES_SPLIT_SYSTEM_PROMPT : STORY_EPISODE_SPLIT_SYSTEM_PROMPT, promptMode, {
  announceTimelineContract: true
});
const STORY_EPISODES_SPLIT_VALIDATION_SYSTEM_PROMPT = "只检查并修复已有分镜结果的 JSON 格式和字段包装。不得增删、改写或重新生成分镜内容。只返回修复后的完整 JSON。";
const STORY_EPISODE_SPLIT_CAMERA_PRESETS = Object.freeze(["中景，平视机位，固定镜头。", "近景，平视机位，固定镜头。", "特写，平视机位，固定镜头。", "全景，平视机位，固定镜头。", "中景，镜头缓慢推进。", "近景，镜头缓慢推进。", "中景，侧向跟拍。", "低角度仰拍，固定镜头。", "高角度俯拍，固定镜头。", "过肩中景，固定镜头。", "手部或道具特写，固定镜头。", "环境远景，镜头缓慢横移。"]);
const STORY_EPISODE_BATCHED_BLUEPRINT_SYSTEM_PROMPT = ["你是专业的短剧分镜总规划 Agent。", "你的任务是先为一整集建立连续片段蓝图，不写具体分镜、镜头语言或最终视频提示词。", "必须按原剧本顺序完整覆盖全部 sourceBeats；每个 sourceBeatRef 必须且只能出现一次，每个 clipPlan 代表一个之后会独立生成的视频片段。", "每个 clipPlan 只能覆盖同一个 sourceSceneRef 中连续的 sourceBeatRefs，换场必须新建 clipPlan。", "sourceBeat 用于跟踪原文覆盖，不直接决定片段边界；一个 clipPlan 可以承载多个相互关联的动作、对白和反应。", STORY_EPISODE_SPLIT_GROUPING_GUIDANCE, STORY_EPISODE_SPLIT_ADAPTIVE_TIMING_GUIDANCE, STORY_EPISODE_SPLIT_CONTINUITY_CHAIN_GUIDANCE, "entryState 与 exitState 必须明确记录人物位置、动作状态、情绪、视线、关键道具和空间方向，供后续分批生成保持连续。", "同一 sourceSceneRef 的相邻 clipPlan 必须形成状态链：后一项 entryState 逐项继承前一项 exitState，再从该状态推进当前 beat；禁止把每个 clipPlan 当成独立开场。", "beat、entryState、exitState 各只写一句必要信息，不复述原文，不输出镜头细节。", "不得新增输入中不存在的人物、对白、资产、事件、规则或结局。", "只返回严格 JSON，不要输出 Markdown、注释、说明或具体 shots。"].join("\n");
const STORY_EPISODE_BATCHED_EXPANSION_SYSTEM_PROMPT = ["你是专业的短剧分镜脚本 Agent。", "你当前只展开输入 batch.clipPlans，不重新规划整集；必须按给定顺序为每个计划准确返回一个同 ref 的 clip。", "返回的 clip 只是按 clipPlan 分开的中间展开容器，不直接提交给视频模型；客户端会把同场景的原子分镜按动作切点重组为最终视频段。", "每个 clip 只能绑定 clipPlan 指定的一个场景资产；至少一个 shot.assetUsages 必须引用该场景的 assetRef 和 appearanceRef。", "输出供客户端重组的原子分镜流，而不是最终视频段；正文中的完整对白或旁白发言单元在一个 shot.dialogue 或 shot.voiceover 中逐字保留。", STORY_EPISODE_SPLIT_DIALOGUE_SPEAKER_GUIDANCE, STORY_EPISODE_SPLIT_ADAPTIVE_TIMING_GUIDANCE, STORY_EPISODE_SPLIT_CONTINUITY_CHAIN_GUIDANCE, "只有正文已经明确写出说话人停顿、动作介入、他人插话或新的独立引号发言时，才能建立新的发言分镜；不得依据逗号、字数、时长偏好或镜头数量自行给正文断句。", "如实规划每个 shot 的 durationSec；实验分批不限制单个 clip 的总时长，不得为了凑时长压缩对白、动作或表演停顿。", "每个 shot 可返回 cutAfter：完整发言结束后可用 preferred 或 allowed；完整发言尚未结束时必须为 forbidden。客户端只会在完整发言之间结合场景边界和时长上限完成最终分组。", STORY_EPISODE_SPLIT_CAMERA_GUIDANCE, "每个分镜中，画面实际出现的已登记角色必须来自 clipPlan.characterAssetRefs，并逐个把具体 appearanceRef 写入 shot.assetRefs；资产没有形象时才写 assetRef。角色只在 visual 首次出现时使用 assets[].name，后续优先使用他/她/该角色；存在指代歧义时使用普通姓名。dialogue 的说话人标签始终使用普通姓名，任何文本字段都不要输出 @。", "只返回生成当前分镜必需的紧凑字段；script、creativeIntent、transition 和 time 由客户端依据蓝图本地补全。" + STORY_EPISODE_SPLIT_VISUAL_GUIDANCE + " camera 聚焦当前分镜的观察方式。", "shot.audio 只写必要的环境声、动作音效和可听见的表演声；允许呼吸、喘息、啜泣、衣物摩擦等与当前动作直接相关的声音。禁止固定人物音色设定、对白内容复述和脱离剧情的配乐分析；没有必要音效时返回空字符串。", "不得使用‘上一片段’‘下一片段’等外部上下文表达；连续状态要直接改写为当前 clip 内可观察的起始状态。", "不得新增输入中不存在的人物、对白、资产、事件、规则或结局。", "所有输出使用简体中文，只返回严格 JSON，不要输出 Markdown、注释或说明。"].join("\n");
const STORY_EPISODE_DIRECTOR_CONTINUITY_BLUEPRINT_SYSTEM_PROMPT = [STORY_EPISODE_BATCHED_BLUEPRINT_SYSTEM_PROMPT, "当前是开发测试专用的导演连续性提示词实验。", "除人物空间状态外，为每个 clipPlan 返回 openingShotIntent 与 closingShotIntent，用来表达镜头的叙事关注点和与相邻计划的画面关系；具体观察方式由剧情和表演决定。", "场景图片是固定空间锚点，人物位置必须使用可观察地标描述；镜头变化不得镜像或重构场景。"].join("\n");
const STORY_EPISODE_DIRECTOR_CONTINUITY_EXPANSION_SYSTEM_PROMPT = [STORY_EPISODE_BATCHED_EXPANSION_SYSTEM_PROMPT, "当前是开发测试专用的导演连续性提示词实验。", "由你根据剧情和表演自主设计镜头数量、角度、构图、运镜和剪辑方式。", "每个 shot 必须返回 transitionFromPrevious，说明切镜、动作匹配、视线匹配、反应镜头、道具插入或连续长镜等衔接选择及叙事原因。", "避免无动机地连续重复同一主体、景别、机位和构图；也不要把普通争吵默认处理成双人纯侧面一镜到底。"].join("\n");
const getStoryEpisodeExperimentalExpansionSystemPrompt = ({
  promptExperiment = false,
  promptMode = "seedance-2.0"
} = {}) => appendStoryEpisodePromptModeSystemPrompt(promptExperiment ? STORY_EPISODE_DIRECTOR_CONTINUITY_EXPANSION_SYSTEM_PROMPT : STORY_EPISODE_BATCHED_EXPANSION_SYSTEM_PROMPT, promptMode);
function createStoryEpisodeSplitAssetUsageResponseSchema() {
  return {
    type: "object",
    additionalProperties: false,
    required: ["assetRef", "appearanceRef"],
    properties: {
      assetRef: {
        type: "string"
      },
      appearanceRef: {
        type: "string"
      }
    }
  };
}
function createStoryEpisodeSplitShotResponseSchema({
  maxDurationSeconds = 0,
  requiredFields = null,
  compactExperimental = false,
  includeDirectorContinuity = false,
  includeTimeline = false
} = {}) {
  const _0xf57cc5 = normalizePositiveNumber(maxDurationSeconds);
  const _0x132909 = Array.isArray(requiredFields) ? requiredFields : ["durationSec", "assetUsages", "visual", "camera", "dialogue", "voiceover", "audio"];
  return {
    type: "object",
    additionalProperties: false,
    required: _0x132909,
    properties: {
      durationSec: {
        type: "number",
        minimum: 0.1,
        ...(_0xf57cc5 ? {
          maximum: _0xf57cc5
        } : {})
      },
      ...(includeTimeline ? {
        startSec: {
          type: "integer",
          minimum: 0
        },
        endSec: {
          type: "integer",
          minimum: 1
        }
      } : {}),
      ...(compactExperimental ? {
        assetRefs: {
          type: "array",
          items: {
            type: "string"
          }
        }
      } : {
        assetUsages: {
          type: "array",
          items: createStoryEpisodeSplitAssetUsageResponseSchema()
        }
      }),
      visual: {
        type: "string"
      },
      camera: {
        type: "string"
      },
      dialogue: {
        type: "string"
      },
      voiceover: {
        type: "string"
      },
      audio: {
        type: "string"
      },
      ...(includeDirectorContinuity ? {
        transitionFromPrevious: {
          type: "string"
        }
      } : {}),
      cutAfter: {
        type: "string",
        enum: ["preferred", "allowed", "forbidden"]
      }
    }
  };
}
function createStoryEpisodeSplitClipResponseSchema({
  maxDurationSeconds = 0,
  minimumShotsPerClip = 2,
  maximumShotsPerClip = 5,
  requiredClipFields = null,
  requiredShotFields = null,
  compactExperimental = false,
  includeDirectorContinuity = false,
  includeTimeline = false
} = {}) {
  const _0x1e0498 = Math.max(1, Math.trunc(Number(minimumShotsPerClip) || 1));
  const _0x5754f8 = Math.max(0, Math.trunc(Number(maximumShotsPerClip) || 0));
  return {
    type: "object",
    additionalProperties: false,
    required: Array.isArray(requiredClipFields) ? requiredClipFields : compactExperimental ? ["ref", "shots"] : ["ref", "script", "creativeIntent", "transition", "shots"],
    properties: {
      ref: {
        type: "string"
      },
      ...(!compactExperimental ? {
        script: {
          type: "string"
        },
        creativeIntent: {
          type: "string"
        },
        transition: {
          type: "string"
        }
      } : {}),
      shots: {
        type: "array",
        minItems: _0x1e0498,
        ...(_0x5754f8 ? {
          maxItems: _0x5754f8
        } : {}),
        items: createStoryEpisodeSplitShotResponseSchema({
          maxDurationSeconds: maxDurationSeconds,
          requiredFields: requiredShotFields,
          compactExperimental: compactExperimental,
          includeDirectorContinuity: includeDirectorContinuity,
          includeTimeline: includeTimeline
        })
      }
    }
  };
}
export function buildStoryEpisodeSplitBlueprintResponseSchema({
  sceneMaxSeconds = STORY_SCENE_MAX_SECONDS_OPTIONS[1],
  enforceMaxDuration = true,
  includeSceneAssetRef = true,
  includeDirectorContinuity = false
} = {}) {
  const _0x368039 = normalizeStoryPlanningConstraints({
    sceneMaxSeconds: sceneMaxSeconds
  }).sceneMaxSeconds;
  return {
    type: "object",
    additionalProperties: false,
    required: ["episodeRef", "clipPlans"],
    properties: {
      episodeRef: {
        type: "string"
      },
      clipPlans: {
        type: "array",
        minItems: 1,
        items: {
          type: "object",
          additionalProperties: false,
          required: ["sourceBeatRefs", "beat", ...(includeSceneAssetRef ? ["sceneAssetRef"] : []), "sceneAppearanceRef", "entryState", "exitState", ...(includeDirectorContinuity ? ["openingShotIntent", "closingShotIntent"] : []), "characterAssetRefs", "propAssetRefs", "targetDurationSec"],
          properties: {
            sourceBeatRefs: {
              type: "array",
              minItems: 1,
              items: {
                type: "string"
              }
            },
            beat: {
              type: "string"
            },
            ...(includeSceneAssetRef ? {
              sceneAssetRef: {
                type: "string"
              }
            } : {}),
            sceneAppearanceRef: {
              type: "string"
            },
            entryState: {
              type: "string"
            },
            exitState: {
              type: "string"
            },
            ...(includeDirectorContinuity ? {
              openingShotIntent: {
                type: "string"
              },
              closingShotIntent: {
                type: "string"
              }
            } : {}),
            characterAssetRefs: {
              type: "array",
              items: {
                type: "string"
              }
            },
            propAssetRefs: {
              type: "array",
              items: {
                type: "string"
              }
            },
            targetDurationSec: {
              type: "number",
              minimum: 0.1,
              ...(enforceMaxDuration ? {
                maximum: _0x368039
              } : {})
            }
          }
        }
      }
    }
  };
}
export function buildStoryEpisodeSplitBatchResponseSchema({
  clipCount = 1,
  maxDurationSeconds = 0,
  minimumShotsPerClip = 2,
  maximumShotsPerClip = 5,
  requiredClipFields = null,
  requiredShotFields = null,
  compactExperimental = false,
  includeDirectorContinuity = false,
  includeTimeline = false
} = {}) {
  const _0x4944d5 = Math.max(1, Math.trunc(Number(clipCount) || 1));
  return {
    type: "object",
    additionalProperties: false,
    required: ["episodeRef", "clips"],
    properties: {
      episodeRef: {
        type: "string"
      },
      clips: {
        type: "array",
        minItems: _0x4944d5,
        maxItems: _0x4944d5,
        items: createStoryEpisodeSplitClipResponseSchema({
          maxDurationSeconds: maxDurationSeconds,
          minimumShotsPerClip: minimumShotsPerClip,
          maximumShotsPerClip: maximumShotsPerClip,
          requiredClipFields: requiredClipFields,
          requiredShotFields: requiredShotFields,
          compactExperimental: compactExperimental,
          includeDirectorContinuity: includeDirectorContinuity,
          includeTimeline: includeTimeline
        })
      }
    }
  };
}
export function buildStoryEpisodeSplitSingleResponseSchema() {
  return {
    type: "object",
    additionalProperties: false,
    required: ["clips"],
    properties: {
      clips: {
        type: "array",
        minItems: 1,
        items: {
          type: "object",
          additionalProperties: false,
          required: ["s", "shots"],
          properties: {
            s: {
              type: "string"
            },
            shots: {
              type: "array",
              minItems: 1,
              items: {
                type: "object",
                additionalProperties: false,
                required: ["v"],
                properties: {
                  d: {
                    type: "number",
                    minimum: 0.1
                  },
                  r: {
                    type: "array",
                    items: {
                      type: "string"
                    }
                  },
                  v: {
                    type: "string"
                  },
                  c: {
                    type: "integer",
                    minimum: 0,
                    maximum: STORY_EPISODE_SPLIT_CAMERA_PRESETS.length - 1
                  },
                  q: {
                    type: "string"
                  },
                  o: {
                    type: "string"
                  },
                  a: {
                    type: "string"
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
function createStoryEpisodeExperimentalStructuredOutput(_0x461b81, _0x4f50cb) {
  return {
    name: _0x461b81,
    schema: _0x4f50cb,
    strict: true,
    fallback: "prompt"
  };
}
export function normalizeStoryScriptMode(_0xf47412) {
  if (normalizeText(_0xf47412) === STORY_SCRIPT_MODE_NARRATION) {
    return STORY_SCRIPT_MODE_NARRATION;
  } else {
    return STORY_SCRIPT_MODE_PLOT;
  }
}
function normalizeStoryContinuityFacts(_0xac9ba1) {
  return normalizeStringArray(_0xac9ba1).slice(0, STORY_CONTINUITY_MAX_FACTS);
}
function normalizeStoryContinuityState(_0x57057c = {}) {
  const _0xb0c1cc = _0x57057c && typeof _0x57057c === "object" && !Array.isArray(_0x57057c) ? _0x57057c : {};
  return {
    characters: normalizeStringArray(_0xb0c1cc.characters || _0xb0c1cc.characterStates).slice(0, STORY_CONTINUITY_MAX_CHARACTER_STATES),
    props: normalizeStringArray(_0xb0c1cc.props || _0xb0c1cc.propStates || _0xb0c1cc.items).slice(0, STORY_CONTINUITY_MAX_PROP_STATES),
    unresolvedThreads: normalizeStringArray(_0xb0c1cc.unresolvedThreads || _0xb0c1cc.threads || _0xb0c1cc.openThreads).slice(0, STORY_CONTINUITY_MAX_UNRESOLVED_THREADS)
  };
}
function hasStoryContinuityState(_0x2e4121 = {}) {
  const _0x1bb781 = normalizeStoryContinuityState(_0x2e4121);
  return _0x1bb781.characters.length > 0 || _0x1bb781.props.length > 0 || _0x1bb781.unresolvedThreads.length > 0;
}
function normalizeStoryProjectInput(_0x507dac = {}) {
  const _0x137134 = Array.isArray(_0x507dac?.chapters) ? _0x507dac.chapters.map((_0x2caeec, _0x336b47) => ({
    id: normalizeText(_0x2caeec?.id) || "chapter-" + (_0x336b47 + 1),
    title: normalizeText(_0x2caeec?.title),
    content: normalizeText(_0x2caeec?.content)
  })).filter(_0x2363c5 => _0x2363c5.title || _0x2363c5.content) : [];
  return {
    title: normalizeText(_0x507dac?.title),
    storyType: normalizeText(_0x507dac?.storyType),
    summary: normalizeText(_0x507dac?.summary || _0x507dac?.storySummary),
    background: normalizeText(_0x507dac?.background || _0x507dac?.storyBackground),
    setting: normalizeText(_0x507dac?.setting || _0x507dac?.storySetting),
    logline: normalizeText(_0x507dac?.logline),
    scriptMode: normalizeStoryScriptMode(_0x507dac?.scriptMode),
    aspectRatio: normalizeText(_0x507dac?.aspectRatio) || "16:9",
    visualStyle: normalizeText(_0x507dac?.videoStylePrompt || _0x507dac?.visualStyle || _0x507dac?.videoStyle),
    promptMode: normalizeText(_0x507dac?.planning?.promptMode).toLowerCase() || "seedance-2.0",
    chapters: _0x137134,
    planning: normalizeStoryPlanningConstraints(_0x507dac?.planning)
  };
}
function assertStoryProjectInput(_0x4c1be7) {
  if (!_0x4c1be7.title || !_0x4c1be7.chapters.length) {
    throw new Error("请先完成故事大纲和章节内容。");
  }
}
export function normalizeStoryPlanningConstraints({
  episodeCount = STORY_EPISODE_COUNT_OPTIONS[0],
  sceneMaxSeconds = STORY_SCENE_MAX_SECONDS_OPTIONS[1]
} = {}) {
  const _0x2caa33 = Number(episodeCount);
  const _0x3a4181 = Number(sceneMaxSeconds);
  return {
    episodeCount: Number.isInteger(_0x2caa33) && _0x2caa33 >= 1 && _0x2caa33 <= STORY_EPISODE_COUNT_MAX ? _0x2caa33 : STORY_EPISODE_COUNT_OPTIONS[0],
    sceneMaxSeconds: STORY_SCENE_MAX_SECONDS_OPTIONS.includes(_0x3a4181) ? _0x3a4181 : STORY_SCENE_MAX_SECONDS_OPTIONS[1]
  };
}
export function validateStoryPlanningConstraints(_0x46f82e = {}) {
  const _0x457f5a = _0x46f82e && typeof _0x46f82e === "object" && !Array.isArray(_0x46f82e) ? _0x46f82e : {};
  if (Object.prototype.hasOwnProperty.call(_0x457f5a, "episodeCount") && (!Number.isInteger(Number(_0x457f5a.episodeCount)) || Number(_0x457f5a.episodeCount) < 1 || Number(_0x457f5a.episodeCount) > STORY_EPISODE_COUNT_MAX)) {
    throw new Error("分集数量必须是 1-" + STORY_EPISODE_COUNT_MAX + " 的整数。");
  }
  if (Object.prototype.hasOwnProperty.call(_0x457f5a, "sceneMaxSeconds") && !STORY_SCENE_MAX_SECONDS_OPTIONS.includes(Number(_0x457f5a.sceneMaxSeconds))) {
    throw new Error("单片段时长上限必须是 " + STORY_SCENE_MAX_SECONDS_OPTIONS.join("、") + " 秒之一。");
  }
  return normalizeStoryPlanningConstraints(_0x457f5a);
}
function resolveStoryPlanningConstraints(_0x5de770 = {}, _0x431025 = {}) {
  const _0x199f1c = _0x431025 && typeof _0x431025 === "object" && (Object.prototype.hasOwnProperty.call(_0x431025, "episodeCount") || Object.prototype.hasOwnProperty.call(_0x431025, "sceneMaxSeconds"));
  return validateStoryPlanningConstraints(_0x199f1c ? _0x431025 : _0x5de770?.planning);
}
function resolveStoryPromptMode(_0x3e50e7 = {}, _0xeeef03 = {}) {
  const _0x5d09f9 = normalizeText(_0xeeef03?.promptMode).toLowerCase();
  return _0x5d09f9 || normalizeText(_0x3e50e7?.planning?.promptMode).toLowerCase() || "seedance-2.0";
}
function normalizeStoryMode(_0x53ad98) {
  if (_0x53ad98 === "upload") {
    return "upload";
  } else {
    return "generate";
  }
}
function stringifyStoryEpisodeDevResponse(_0x1288a1) {
  if (typeof _0x1288a1 === "string") {
    return _0x1288a1;
  }
  try {
    return JSON.stringify(_0x1288a1);
  } catch {
    return String(_0x1288a1 || "");
  }
}
export function captureStoryEpisodeScriptDevResponse({
  response: _0x4eac34,
  attempt = 1,
  episodeRef = "",
  episodeNumber = 1,
  model = "",
  provider = "",
  windowObject = globalThis.window,
  consoleObject = globalThis.console,
  capturedAt = new Date().toISOString()
} = {}) {
  if (windowObject?.AI_CANVAS_IS_DEV_BUILD !== true) {
    return null;
  }
  const _0x436499 = {
    capturedAt: normalizeText(capturedAt),
    attempt: Math.max(1, Math.trunc(Number(attempt) || 1)),
    episodeRef: normalizeText(episodeRef),
    episodeNumber: Math.max(1, Math.trunc(Number(episodeNumber) || 1)),
    model: normalizeText(model),
    provider: normalizeText(provider),
    responseText: stringifyStoryEpisodeDevResponse(getResultText(_0x4eac34))
  };
  const _0x53b398 = Array.isArray(windowObject.__AIC_DEV_EPISODE_SCRIPT_RESPONSES__) ? windowObject.__AIC_DEV_EPISODE_SCRIPT_RESPONSES__ : [];
  windowObject.__AIC_DEV_EPISODE_SCRIPT_RESPONSES__ = [..._0x53b398, _0x436499].slice(-STORY_EPISODE_DEV_RESPONSE_HISTORY_LIMIT);
  consoleObject?.info?.("[storyWorkspace][episode-script][dev-response]", _0x436499);
  return _0x436499;
}
function countStoryChapterCharacters(_0x7f3a56) {
  return Array.from(normalizeText(_0x7f3a56).replace(/\s/g, "")).length;
}
export function parseStoryGenerationResult(_0x1dfc10, {
  minChapters = 1,
  minChapterCharacters = 0,
  maxChapterCharacters = Number.POSITIVE_INFINITY
} = {}) {
  const _0x254d5e = parseStrictJson(getResultText(_0x1dfc10), "Agent 未返回剧情内容。");
  const _0xa561b5 = normalizeText(_0x254d5e.title);
  const _0x4331c6 = normalizeText(_0x254d5e.storyType);
  const _0x5c64bd = normalizeText(_0x254d5e.storySummary);
  const _0xa7c534 = normalizeText(_0x254d5e.storyBackground);
  const _0x469735 = normalizeText(_0x254d5e.storySetting);
  const _0x2b0969 = normalizeText(_0x254d5e.logline);
  const _0x3801b0 = Array.isArray(_0x254d5e.chapters) ? _0x254d5e.chapters.map(_0x24d4ab => ({
    title: normalizeText(_0x24d4ab?.title),
    content: normalizeText(_0x24d4ab?.content)
  })).filter(_0x906f61 => _0x906f61.title && _0x906f61.content) : [];
  if (!_0xa561b5) {
    throw new Error("Agent 返回结果缺少故事标题。");
  }
  if (!_0x4331c6) {
    throw new Error("Agent 返回结果缺少故事类型。");
  }
  if (!_0x5c64bd) {
    throw new Error("Agent 返回结果缺少故事梗概。");
  }
  if (!_0xa7c534) {
    throw new Error("Agent 返回结果缺少故事背景。");
  }
  if (!_0x469735) {
    throw new Error("Agent 返回结果缺少故事设定。");
  }
  if (!_0x2b0969) {
    throw new Error("Agent 返回结果缺少一句话故事。");
  }
  const _0x46b9ea = Math.max(1, Math.trunc(Number(minChapters) || 1));
  if (_0x3801b0.length < _0x46b9ea) {
    throw new Error("Agent 返回的有效章节不足 " + _0x46b9ea + " 章。");
  }
  const _0x3b8a9d = Math.max(0, Math.trunc(Number(minChapterCharacters) || 0));
  const _0x46c0d0 = Number(maxChapterCharacters);
  const _0x1006d0 = Number.isFinite(_0x46c0d0) ? Math.max(_0x3b8a9d, Math.trunc(_0x46c0d0)) : Number.POSITIVE_INFINITY;
  for (const _0x25fbf7 of _0x3801b0) {
    const _0x45914d = countStoryChapterCharacters(_0x25fbf7.content);
    if (_0x45914d < _0x3b8a9d) {
      throw new Error("Agent 返回的章节“" + _0x25fbf7.title + "”正文不足 " + _0x3b8a9d + " 个字（当前 " + _0x45914d + " 个字）。");
    }
    if (_0x45914d > _0x1006d0) {
      throw new Error("Agent 返回的章节“" + _0x25fbf7.title + "”正文超过 " + _0x1006d0 + " 个字（当前 " + _0x45914d + " 个字）。");
    }
  }
  return {
    schemaVersion: STORY_GENERATION_SCHEMA_VERSION,
    title: _0xa561b5,
    storyType: _0x4331c6,
    storySummary: _0x5c64bd,
    storyBackground: _0xa7c534,
    storySetting: _0x469735,
    logline: _0x2b0969,
    chapters: _0x3801b0
  };
}
export function splitStorySourceText(_0x35e6e1, _0x2cb2ad = STORY_SOURCE_CHUNK_CHARACTERS) {
  const _0x232004 = normalizeText(_0x35e6e1);
  const _0x1ab05e = Math.max(2000, Math.trunc(Number(_0x2cb2ad) || 0));
  if (!_0x232004) {
    return [];
  }
  if (_0x232004.length <= _0x1ab05e) {
    return [_0x232004];
  }
  const _0x3c70d1 = [];
  let _0x7ead97 = 0;
  while (_0x7ead97 < _0x232004.length) {
    let _0x416af0 = Math.min(_0x232004.length, _0x7ead97 + _0x1ab05e);
    if (_0x416af0 < _0x232004.length) {
      const _0x2846c6 = _0x232004.lastIndexOf("\n", _0x416af0);
      if (_0x2846c6 > _0x7ead97 + Math.floor(_0x1ab05e * 0.55)) {
        _0x416af0 = _0x2846c6;
      }
    }
    _0x3c70d1.push(_0x232004.slice(_0x7ead97, _0x416af0).trim());
    _0x7ead97 = _0x416af0;
    while (_0x232004[_0x7ead97] === "\n" || _0x232004[_0x7ead97] === "\r") {
      _0x7ead97 += 1;
    }
  }
  return _0x3c70d1.filter(Boolean);
}
export function buildStoryGenerationPrompt({
  mode = "generate",
  idea = "",
  sourceText = "",
  fileName = "",
  sourceDigests = [],
  aspectRatio = "16:9",
  visualStyle = "",
  planning = {}
} = {}) {
  const _0x19952a = normalizeStoryMode(mode);
  const _0x344b19 = normalizeText(idea);
  const _0x31e562 = normalizeText(sourceText);
  const _0x5493a6 = Array.isArray(sourceDigests) ? sourceDigests : [];
  const _0x4c3146 = validateStoryPlanningConstraints(planning);
  if (_0x19952a === "generate" && !_0x344b19) {
    throw new Error("请先输入故事设定。");
  }
  if (_0x19952a === "upload" && !_0x31e562 && _0x5493a6.length === 0) {
    throw new Error("没有可供整理的剧本文本。");
  }
  const _0x2af9ff = _0x19952a === "upload" ? "在不改变原文人物姓名、人物关系、关键事件和结局的前提下，整理因果逻辑、补足必要衔接并统一表达；原文未明确的信息应保守处理，不得擅自重写核心剧情。" : "根据用户提供的故事设定扩写为完整剧情；可以补充必要人物与事件，但所有新增内容必须服务于主角目标和核心冲突。";
  return JSON.stringify({
    task: "create_story",
    schemaVersion: STORY_GENERATION_SCHEMA_VERSION,
    mode: _0x19952a,
    modeInstruction: _0x2af9ff,
    visualDirection: {
      aspectRatio: normalizeText(aspectRatio) || "16:9",
      style: normalizeText(visualStyle),
      instruction: "视觉方向仅用于让人物、场景与叙事氛围保持一致，不要输出绘图提示词或创作说明。"
    },
    pacingConstraints: {
      ..._0x4c3146,
      instruction: "episodeCount 和 sceneMaxSeconds 均为上限，仅用于控制故事容量和节奏；当前任务仍只输出完整故事，不输出分集或分镜。"
    },
    writingRequirements: ["故事梗概建议 250 至 500 个汉字，必须包含结局，不能只写悬念。", "每章正文必须为 " + STORY_CHAPTER_MIN_CHARACTERS + " 至 " + STORY_CHAPTER_MAX_CHARACTERS + " 个汉字，每章都要有清晰主标题；不能用提纲、重复句或无意义内容凑字数。", "开篇尽快建立人物、处境和触发事件。", "中段通过行动与代价升级冲突，避免只有设定介绍。", "高潮必须由前文因果推动，结局回应主角目标并完成主要人物弧光。", "不要生成分镜编号、镜头语言、绘图提示词、资产清单或分集标题。", _0x19952a === "generate" ? "AI 写故事模式必须生成至少 3 章，每章都要有独立主标题和完整正文。" : "上传文案模式不固定章节数量，由原文结构与叙事节奏决定应拆成多少章，不得为了凑数强行拆章。"],
    input: _0x19952a === "upload" ? {
      fileName: normalizeText(fileName),
      sourceText: _0x31e562,
      sourceDigests: _0x5493a6
    } : {
      idea: _0x344b19
    },
    outputSchema: {
      title: "故事标题，字符串",
      storyType: "故事类型，字符串，例如悬疑、都市奇幻、科幻",
      storySummary: "故事梗概，字符串",
      storyBackground: "故事背景，字符串",
      storySetting: "故事设定，字符串",
      logline: "一句话故事，字符串",
      chapters: [{
        title: "章节主标题",
        content: "章节正文"
      }]
    }
  });
}
function buildStorySourceDigestPrompt(_0x109d74, _0x525901, _0x1e9f61) {
  return JSON.stringify({
    task: "digest_story_source_chunk",
    chunk: {
      index: _0x525901 + 1,
      total: _0x1e9f61,
      text: _0x109d74
    },
    requirements: ["按原文记录本段出现的人物、身份、关系与动机。", "按发生顺序记录关键事件、选择、结果和伏笔。", "记录场景、时间及与前后文衔接所需的信息。", "不得续写，不得修改原文事实。"],
    outputSchema: {
      characters: ["人物及关系"],
      settings: ["时间与场景"],
      events: ["按顺序排列的事件"],
      continuity: "未解决冲突、伏笔及承接信息",
      endingState: "本段结束时人物与事件状态"
    }
  });
}
function parseStorySourceDigest(_0x42b29b) {
  const _0x519144 = parseStrictJson(getResultText(_0x42b29b), "Agent 未返回剧本分段摘要。");
  return {
    characters: Array.isArray(_0x519144.characters) ? _0x519144.characters.map(normalizeText).filter(Boolean) : [],
    settings: Array.isArray(_0x519144.settings) ? _0x519144.settings.map(normalizeText).filter(Boolean) : [],
    events: Array.isArray(_0x519144.events) ? _0x519144.events.map(normalizeText).filter(Boolean) : [],
    continuity: normalizeText(_0x519144.continuity),
    endingState: normalizeText(_0x519144.endingState)
  };
}
export async function generateStoryDraft({
  mode = "generate",
  idea = "",
  sourceText = "",
  fileName = "",
  model = "",
  provider = "",
  providerProfileId = "",
  aspectRatio = "16:9",
  visualStyle = "",
  planning = {},
  request = generateText,
  onProgress = null
} = {}) {
  const _0x17ca15 = normalizeStoryMode(mode);
  const _0x14b0ba = normalizeText(model);
  const _0xf078c9 = normalizeText(provider);
  if (!_0x14b0ba || !_0xf078c9) {
    throw new Error("请先选择可用的文本模型。");
  }
  let _0x4bc955 = [];
  let _0x44d33a = normalizeText(sourceText);
  if (_0x17ca15 === "upload" && _0x44d33a.length > STORY_SOURCE_CHUNK_CHARACTERS) {
    const _0x51c487 = splitStorySourceText(_0x44d33a);
    for (let _0x32c333 = 0; _0x32c333 < _0x51c487.length; _0x32c333 += 1) {
      onProgress?.({
        stage: "digesting",
        current: _0x32c333 + 1,
        total: _0x51c487.length,
        message: "正在整理剧本 " + (_0x32c333 + 1) + "/" + _0x51c487.length
      });
      const _0x15af3a = buildStorySourceDigestPrompt(_0x51c487[_0x32c333], _0x32c333, _0x51c487.length);
      const _0x5f1d1e = await requestStrictResult({
        request: request,
        requestPayload: {
          model: _0x14b0ba,
          provider: _0xf078c9,
          ...buildStoryTextProviderProfilePayload(providerProfileId),
          prompt: _0x15af3a,
          systemPrompt: STORY_SOURCE_DIGEST_SYSTEM_PROMPT,
          temperature: 0.1,
          timeoutMs: STORY_TEXT_REQUEST_TIMEOUT_MS,
          maxOutputTokens: STORY_TEXT_MAX_OUTPUT_TOKENS
        },
        parse: parseStorySourceDigest,
        outputContract: "characters/settings/events arrays and continuity/endingState strings"
      });
      _0x4bc955.push({
        part: _0x32c333 + 1,
        ..._0x5f1d1e
      });
    }
    _0x44d33a = "";
  }
  onProgress?.({
    stage: "writing",
    current: 1,
    total: 1,
    message: _0x17ca15 === "upload" ? "正在整理故事内容" : "正在创建完整剧情"
  });
  const _0xc2ce9e = buildStoryGenerationPrompt({
    mode: _0x17ca15,
    idea: idea,
    sourceText: _0x44d33a,
    fileName: fileName,
    sourceDigests: _0x4bc955,
    aspectRatio: aspectRatio,
    visualStyle: visualStyle,
    planning: planning
  });
  return await requestStrictResult({
    request: request,
    requestPayload: {
      model: _0x14b0ba,
      provider: _0xf078c9,
      ...buildStoryTextProviderProfilePayload(providerProfileId),
      prompt: _0xc2ce9e,
      systemPrompt: STORY_GENERATION_SYSTEM_PROMPT,
      temperature: _0x17ca15 === "upload" ? 0.35 : 0.7,
      timeoutMs: STORY_TEXT_REQUEST_TIMEOUT_MS,
      maxOutputTokens: STORY_TEXT_MAX_OUTPUT_TOKENS
    },
    parse: _0x23c1b0 => parseStoryGenerationResult(_0x23c1b0, {
      minChapters: _0x17ca15 === "generate" ? 3 : 1,
      minChapterCharacters: STORY_CHAPTER_MIN_CHARACTERS,
      maxChapterCharacters: STORY_CHAPTER_MAX_CHARACTERS
    }),
    outputContract: _0x17ca15 === "generate" ? "title/storyType/storySummary/storyBackground/storySetting/logline strings and at least 3 chapters[{title,content}], with each content containing " + STORY_CHAPTER_MIN_CHARACTERS + "-" + STORY_CHAPTER_MAX_CHARACTERS + " characters" : "title/storyType/storySummary/storyBackground/storySetting/logline strings and agent-determined chapters[{title,content}], with each content containing " + STORY_CHAPTER_MIN_CHARACTERS + "-" + STORY_CHAPTER_MAX_CHARACTERS + " characters"
  });
}
const storySummaryBlueprint = createStorySummaryBlueprint({
  normalizeStoryScriptMode: normalizeStoryScriptMode,
  validateStoryPlanningConstraints: validateStoryPlanningConstraints,
  continuityMaxFacts: STORY_CONTINUITY_MAX_FACTS
});
const {
  normalizeStoryContract,
  normalizeStoryPlotBeat,
  normalizeStorySummaryCharacter
} = storySummaryBlueprint;
export const buildStorySummaryPrompt = storySummaryBlueprint.buildStorySummaryPrompt;
export const parseStorySummaryResult = storySummaryBlueprint.parseStorySummaryResult;
const storySummaryGenerationApi = createStorySummaryGenerationApi({
  generateText: generateText,
  assertPlanningModel: assertPlanningModel,
  normalizeText: normalizeText,
  splitStorySourceText: splitStorySourceText,
  sourceChunkCharacters: STORY_SOURCE_CHUNK_CHARACTERS,
  buildStorySourceDigestPrompt: buildStorySourceDigestPrompt,
  parseStorySourceDigest: parseStorySourceDigest,
  sourceDigestSystemPrompt: STORY_SOURCE_DIGEST_SYSTEM_PROMPT,
  summarySystemPrompt: STORY_SUMMARY_SYSTEM_PROMPT,
  textRequestTimeoutMs: STORY_TEXT_REQUEST_TIMEOUT_MS,
  textMaxOutputTokens: STORY_TEXT_MAX_OUTPUT_TOKENS,
  buildStoryTextProviderProfilePayload: buildStoryTextProviderProfilePayload,
  requestStrictResult: requestStrictResult,
  createStoryInvocationLifecycle: createStoryInvocationLifecycle,
  getResultText: getResultText,
  storySummaryBlueprint: storySummaryBlueprint,
  defaultScriptMode: STORY_SCRIPT_MODE_PLOT
});
export const generateStorySummary = storySummaryGenerationApi.generateStorySummary;
const storyEpisodeScriptPromptApi = createStoryEpisodeScriptPromptApi({
  normalizeText: normalizeText,
  normalizeStringArray: normalizeStringArray,
  normalizePositiveNumber: normalizePositiveNumber,
  normalizeStoryScriptMode: normalizeStoryScriptMode,
  normalizeStorySummaryCharacter: normalizeStorySummaryCharacter,
  normalizeStoryContinuityFacts: normalizeStoryContinuityFacts,
  normalizeStoryContinuityState: normalizeStoryContinuityState,
  createStoryEpisodeScriptRuntimeGuidance: createStoryEpisodeScriptRuntimeGuidance,
  schemaVersion: STORY_EPISODE_SCRIPT_SCHEMA_VERSION,
  narrationMode: STORY_SCRIPT_MODE_NARRATION
});
export const buildStoryEpisodeScriptPrompt = storyEpisodeScriptPromptApi.buildPrompt;
const buildStoryEpisodeScriptContentRevisionPrompt = storyEpisodeScriptPromptApi.buildContentRevisionPrompt;
const storyClipAdjustmentApi = createStoryClipAdjustmentApi({
  generateText: generateText,
  parseStrictJson: parseStrictJson,
  normalizeText: normalizeText,
  normalizePositiveNumber: normalizePositiveNumber,
  getResultText: getResultText,
  assertPlanningModel: assertPlanningModel,
  buildStoryTextProviderProfilePayload: buildStoryTextProviderProfilePayload,
  requestStrictResult: requestStrictResult,
  requestTimeoutMs: STORY_TEXT_REQUEST_TIMEOUT_MS
});
export const adjustStoryClipPrompt = storyClipAdjustmentApi.adjustStoryClipPrompt;
export const buildStoryClipAdjustmentPrompt = storyClipAdjustmentApi.buildStoryClipAdjustmentPrompt;
export const parseStoryClipAdjustmentResult = storyClipAdjustmentApi.parseStoryClipAdjustmentResult;
const storyEpisodeOutlinePlanningApi = createStoryEpisodeOutlinePlanningApi({
  generateText: generateText,
  parseStrictJson: parseStrictJson,
  normalizeText: normalizeText,
  normalizeStringArray: normalizeStringArray,
  normalizeStoryContinuityFacts: normalizeStoryContinuityFacts,
  normalizeStoryContinuityState: normalizeStoryContinuityState,
  hasStoryContinuityState: hasStoryContinuityState,
  normalizePositiveNumber: normalizePositiveNumber,
  normalizeStorySummaryCharacter: normalizeStorySummaryCharacter,
  normalizeStoryContract: normalizeStoryContract,
  normalizeStoryPlotBeat: normalizeStoryPlotBeat,
  normalizeStoryScriptMode: normalizeStoryScriptMode,
  normalizeStoryPlanningConstraints: normalizeStoryPlanningConstraints,
  resolveStoryPlanningConstraints: resolveStoryPlanningConstraints,
  getResultText: getResultText,
  assertPlanningModel: assertPlanningModel,
  buildStoryTextProviderProfilePayload: buildStoryTextProviderProfilePayload,
  requestStrictResult: requestStrictResult,
  STORY_EPISODE_OUTLINE_SCHEMA_VERSION: STORY_EPISODE_OUTLINE_SCHEMA_VERSION,
  STORY_SCRIPT_MODE_NARRATION: STORY_SCRIPT_MODE_NARRATION,
  STORY_EPISODE_OUTLINE_BATCH_SIZE: STORY_EPISODE_OUTLINE_BATCH_SIZE,
  STORY_SUMMARY_MAX_PLOT_BEATS: STORY_SUMMARY_MAX_PLOT_BEATS,
  STORY_CONTINUITY_MAX_FACTS: STORY_CONTINUITY_MAX_FACTS,
  STORY_CONTINUITY_MAX_CHARACTER_STATES: STORY_CONTINUITY_MAX_CHARACTER_STATES,
  STORY_CONTINUITY_MAX_PROP_STATES: STORY_CONTINUITY_MAX_PROP_STATES,
  STORY_CONTINUITY_MAX_UNRESOLVED_THREADS: STORY_CONTINUITY_MAX_UNRESOLVED_THREADS,
  STORY_TEXT_REQUEST_TIMEOUT_MS: STORY_TEXT_REQUEST_TIMEOUT_MS,
  STORY_TEXT_MAX_OUTPUT_TOKENS: STORY_TEXT_MAX_OUTPUT_TOKENS
});
const {
  buildStoryNarrativeSummary
} = storyEpisodeOutlinePlanningApi;
export const buildStoryEpisodeOutlinePrompt = storyEpisodeOutlinePlanningApi.buildStoryEpisodeOutlinePrompt;
export const parseStoryEpisodeOutlineSkeletonResult = storyEpisodeOutlinePlanningApi.parseStoryEpisodeOutlineSkeletonResult;
export const createStoryEpisodeOutlineBatches = storyEpisodeOutlinePlanningApi.createStoryEpisodeOutlineBatches;
export const buildStoryEpisodeOutlineBatchPrompt = storyEpisodeOutlinePlanningApi.buildStoryEpisodeOutlineBatchPrompt;
export const parseStoryEpisodeOutlineBatchResult = storyEpisodeOutlinePlanningApi.parseStoryEpisodeOutlineBatchResult;
export const parseStoryEpisodeOutlineResult = storyEpisodeOutlinePlanningApi.parseStoryEpisodeOutlineResult;
export const planStoryEpisodeOutlines = storyEpisodeOutlinePlanningApi.planStoryEpisodeOutlines;
function formatEpisodeSceneText(_0x8f73c7, _0x5d1602, _0x56c793) {
  const _0x21c77f = _0x8f73c7.characters.length ? "\n出场人物：" + _0x8f73c7.characters.join("、") : "";
  return "### 场" + _0x5d1602 + "-" + (_0x56c793 + 1) + "\n" + _0x8f73c7.heading + _0x21c77f + "\n" + _0x8f73c7.body;
}
function normalizeStoryEpisodeScriptDialogueContent(_0x327911 = "") {
  const _0x1196fc = normalizeText(_0x327911);
  if (!_0x1196fc) {
    return _0x1196fc;
  }
  const _0x5d0662 = _0x1196fc.match(/^((?:(?:（[^）]*）|\([^)]*\))\s*)+)([\s\S]+)$/u);
  const _0x2c8cba = normalizeText(_0x5d0662?.[1]);
  const _0x4d3c21 = normalizeText(_0x5d0662?.[2] || _0x1196fc);
  if (!_0x4d3c21) {
    return _0x1196fc;
  }
  const _0x50c71f = _0x4d3c21.match(/^(?:“([\s\S]*)”|「([\s\S]*)」|『([\s\S]*)』|"([\s\S]*)")$/u);
  if (_0x50c71f) {
    const _0x2bd12a = normalizeText(_0x50c71f[1] || _0x50c71f[2] || _0x50c71f[3] || _0x50c71f[4]);
    return _0x2c8cba + "“" + _0x2bd12a + "”";
  }
  if (/[“”「」『』"]/u.test(_0x4d3c21)) {
    return _0x1196fc;
  }
  return _0x2c8cba + "“" + _0x4d3c21 + "”";
}
function normalizeStoryEpisodeScriptSceneBody(_0x2f111a = "", _0x144db8 = []) {
  const _0x4fc552 = new Set(normalizeStringArray(_0x144db8));
  const _0x54b9cf = new Set(["旁白", "画外音", "音效", "屏幕字幕", "字幕", "时间", "地点", "场景"]);
  return String(_0x2f111a || "").split(/\r?\n/u).flatMap(_0xe73e9b => {
    const _0x38b435 = _0xe73e9b.trim();
    if (!_0x38b435) {
      return [""];
    }
    if (isStoryEpisodeEditorialMarker(_0x38b435)) {
      return [];
    }
    const _0x576095 = _0x38b435.match(/^([^：:\n]{1,40})[：:]\s*(.+)$/u);
    const _0xaddc7b = normalizeText(_0x576095?.[1]);
    if (!_0x576095 || !_0x4fc552.has(_0xaddc7b) || _0x54b9cf.has(_0xaddc7b)) {
      return [_0x38b435];
    }
    const _0x10ef33 = normalizeStoryEpisodeScriptDialogueContent(_0x576095[2]);
    return [_0xaddc7b + "：" + _0x10ef33];
  }).join("\n").replace(/\n{2,}/gu, "\n").trim();
}
function normalizeStoryEpisodeScriptCharacters(_0x377fa0) {
  if (Array.isArray(_0x377fa0)) {
    return normalizeStringArray(_0x377fa0);
  }
  return normalizeStringArray(normalizeText(_0x377fa0).split(/[、，,;/|]+/u).map(_0xf29711 => _0xf29711.trim()));
}
function normalizeStoryEpisodeScriptBodyValue(_0x1fdfa7) {
  if (Array.isArray(_0x1fdfa7)) {
    return _0x1fdfa7.map(_0x205997 => normalizeText(_0x205997)).filter(Boolean).join("\n");
  }
  if (_0x1fdfa7 && typeof _0x1fdfa7 === "object") {
    return normalizeText(_0x1fdfa7.text || _0x1fdfa7.content || _0x1fdfa7.body);
  }
  return normalizeText(_0x1fdfa7);
}
function getStoryEpisodeScriptSceneEntries(_0x2e480f = {}) {
  const _0x1f26cc = _0x2e480f && typeof _0x2e480f === "object" && !Array.isArray(_0x2e480f) ? _0x2e480f : {};
  const _0x4573f0 = [_0x1f26cc.scenes, _0x1f26cc.sceneList, _0x1f26cc.scene_list, _0x1f26cc.scriptScenes, _0x1f26cc.script_scenes];
  return _0x4573f0.find(Array.isArray) || [];
}
function findStoryEpisodeScriptPayload(_0x4aa1ed) {
  const _0x565cb8 = [_0x4aa1ed];
  const _0x350d85 = new Set();
  let _0x6f847d = null;
  while (_0x565cb8.length) {
    const _0x1e4e9d = _0x565cb8.shift();
    if (Array.isArray(_0x1e4e9d)) {
      return {
        scenes: _0x1e4e9d
      };
    }
    if (!_0x1e4e9d || typeof _0x1e4e9d !== "object" || _0x350d85.has(_0x1e4e9d)) {
      continue;
    }
    _0x350d85.add(_0x1e4e9d);
    _0x6f847d ||= _0x1e4e9d;
    if (getStoryEpisodeScriptSceneEntries(_0x1e4e9d).length) {
      return _0x1e4e9d;
    }
    ["result", "data", "output", "response", "episode", "script"].forEach(_0xdcdb3f => {
      const _0xa4a332 = _0x1e4e9d[_0xdcdb3f];
      if (_0xa4a332 && typeof _0xa4a332 === "object") {
        _0x565cb8.push(_0xa4a332);
      }
    });
  }
  return _0x6f847d || {};
}
function extractStoryEpisodeScriptStringProperty(_0xe15b7b, _0x4fd8f5 = []) {
  for (const _0x16a628 of _0x4fd8f5) {
    const _0x31f0ef = extractJsonStringProperty(_0xe15b7b, _0x16a628);
    if (_0x31f0ef) {
      return _0x31f0ef;
    }
  }
  return "";
}
function isStoryEpisodeScriptArrayClosed(_0x10b5ce, _0x4279ea) {
  const _0x477335 = getResultText(_0x10b5ce);
  if (typeof _0x477335 !== "string" || !_0x477335 || !_0x4279ea) {
    return false;
  }
  const _0x345466 = "\"" + _0x4279ea + "\"";
  const _0x369a42 = _0x477335.indexOf(_0x345466);
  if (_0x369a42 < 0) {
    return false;
  }
  const _0x281327 = _0x477335.indexOf(":", _0x369a42 + _0x345466.length);
  const _0x165050 = _0x281327 >= 0 ? _0x477335.indexOf("[", _0x281327 + 1) : -1;
  if (_0x165050 < 0) {
    return false;
  }
  let _0x1721cd = 0;
  let _0xc83700 = false;
  let _0x1a7eec = false;
  for (let _0x5e4c37 = _0x165050; _0x5e4c37 < _0x477335.length; _0x5e4c37 += 1) {
    const _0x1e59f7 = _0x477335[_0x5e4c37];
    if (_0xc83700) {
      if (_0x1a7eec) {
        _0x1a7eec = false;
      } else if (_0x1e59f7 === "\\") {
        _0x1a7eec = true;
      } else if (_0x1e59f7 === "\"") {
        _0xc83700 = false;
      }
      continue;
    }
    if (_0x1e59f7 === "\"") {
      _0xc83700 = true;
      continue;
    }
    if (_0x1e59f7 === "[") {
      _0x1721cd += 1;
    } else if (_0x1e59f7 === "]") {
      _0x1721cd -= 1;
      if (_0x1721cd === 0) {
        return true;
      }
    }
  }
  return false;
}
function parseStoryEpisodeScriptPayload(_0x5a2e8e) {
  const _0x14b36f = getResultText(_0x5a2e8e);
  const _0x44bf00 = repairStoryEpisodeScriptMissingBodyTerminators(_0x14b36f);
  const _0x49d01b = _0x44bf00.repairedCount ? _0x44bf00.text : _0x14b36f;
  let _0x400bed = null;
  let _0x1e6298 = null;
  const _0x1ab098 = _0x44bf00.repairedCount;
  try {
    _0x400bed = parseStrictJson(_0x49d01b, "Agent 未返回完整分集剧本。");
  } catch (_0x54e543) {
    _0x1e6298 = _0x54e543;
  }
  let _0x5616a9 = findStoryEpisodeScriptPayload(_0x400bed);
  let _0x1ee0f7 = getStoryEpisodeScriptSceneEntries(_0x5616a9);
  let _0x441da9 = false;
  let _0x5e7d3f = false;
  if (!_0x1ee0f7.length) {
    for (const _0x312926 of ["scenes", "sceneList", "scene_list", "scriptScenes", "script_scenes"]) {
      const _0xb8390c = extractCompleteJsonArrayItems(_0x49d01b, _0x312926);
      if (!_0xb8390c.length) {
        continue;
      }
      _0x1ee0f7 = _0xb8390c;
      _0x5e7d3f = isStoryEpisodeScriptArrayClosed(_0x49d01b, _0x312926);
      _0x441da9 = !_0x5e7d3f;
      break;
    }
  }
  if (!_0x1ee0f7.length && _0x1e6298) {
    throw _0x1e6298;
  }
  return {
    data: {
      ...(_0x5616a9 && typeof _0x5616a9 === "object" && !Array.isArray(_0x5616a9) ? _0x5616a9 : {}),
      episodeRef: normalizeText(_0x5616a9?.episodeRef || _0x5616a9?.episodeId || _0x5616a9?.episode_id || extractStoryEpisodeScriptStringProperty(_0x49d01b, ["episodeRef", "episodeId", "episode_id"])),
      title: normalizeText(_0x5616a9?.title || _0x5616a9?.episodeTitle || _0x5616a9?.episode_title || extractStoryEpisodeScriptStringProperty(_0x49d01b, ["title", "episodeTitle", "episode_title"])),
      scenes: _0x1ee0f7
    },
    recovery: _0x1ab098 && _0x400bed ? {
      mode: "missing-scene-body-string-terminators",
      incompleteJson: false,
      repairedBodyTerminators: _0x1ab098
    } : _0x441da9 || _0x5e7d3f ? {
      mode: _0x441da9 ? "complete-scenes-from-incomplete-json" : "complete-scenes-from-invalid-json-shell",
      incompleteJson: _0x441da9
    } : null
  };
}
export function parseStoryEpisodeScriptResult(_0xaa4c22, {
  episodeRef = "episode-1",
  episodeNumber = 1,
  episodeTitle = "",
  requireEndingState = false,
  fallbackContinuityFacts = [],
  fallbackEndingState = null
} = {}) {
  const {
    data: _0x9bc4c8,
    recovery: _0x36be6d
  } = parseStoryEpisodeScriptPayload(_0xaa4c22);
  const _0x2c6d9b = normalizeText(_0x9bc4c8.episodeRef || _0x9bc4c8.episodeId || _0x9bc4c8.episode_id) || normalizeText(episodeRef) || "episode-1";
  if (normalizeText(episodeRef) && _0x2c6d9b !== normalizeText(episodeRef)) {
    throw new Error("Agent 返回的分集引用与请求不一致。");
  }
  const _0x6523c6 = normalizeText(_0x9bc4c8.title || _0x9bc4c8.episodeTitle || _0x9bc4c8.episode_title) || normalizeText(episodeTitle) || "第 " + episodeNumber + " 集";
  const _0x5bf37a = getStoryEpisodeScriptSceneEntries(_0x9bc4c8);
  const _0x3e8e8b = _0x5bf37a.length ? _0x5bf37a.map((_0x1156ce, _0x4838fa) => {
    const _0x3ac45f = normalizeStoryEpisodeScriptCharacters(_0x1156ce?.characters || _0x1156ce?.characterNames || _0x1156ce?.character_names || _0x1156ce?.cast || _0x1156ce?.roles);
    return {
      ref: normalizeText(_0x1156ce?.ref || _0x1156ce?.sceneRef || _0x1156ce?.scene_ref || _0x1156ce?.id) || _0x2c6d9b + "-scene-" + (_0x4838fa + 1),
      heading: normalizeText(_0x1156ce?.heading || _0x1156ce?.sceneHeading || _0x1156ce?.scene_heading || _0x1156ce?.location || _0x1156ce?.title),
      characters: _0x3ac45f,
      body: normalizeStoryEpisodeScriptSceneBody(normalizeStoryEpisodeScriptBodyValue(_0x1156ce?.body || _0x1156ce?.content || _0x1156ce?.script || _0x1156ce?.text), _0x3ac45f)
    };
  }).filter(_0x36b969 => _0x36b969.heading && _0x36b969.body) : [];
  if (!_0x3e8e8b.length) {
    throw new Error("Agent 返回结果没有可用场次。");
  }
  const _0xd4292e = Math.max(1, Math.trunc(Number(episodeNumber) || 1));
  const _0x337278 = ["## 第" + _0xd4292e + "集：" + _0x6523c6, ..._0x3e8e8b.map((_0x7cefde, _0x1230a7) => formatEpisodeSceneText(_0x7cefde, _0xd4292e, _0x1230a7))].join("\n");
  const _0x652155 = normalizeStoryContinuityFacts(_0x9bc4c8.continuityFacts || _0x9bc4c8.facts || _0x9bc4c8.continuity_facts);
  const _0x42bbf4 = _0x652155.length ? _0x652155 : normalizeStoryContinuityFacts(fallbackContinuityFacts);
  const _0x40f7a0 = normalizeStoryContinuityState(_0x9bc4c8.endingState || _0x9bc4c8.finalState || _0x9bc4c8.continuityState || _0x9bc4c8.ending_state);
  const _0xe26c80 = hasStoryContinuityState(_0x40f7a0) ? _0x40f7a0 : normalizeStoryContinuityState(fallbackEndingState);
  if (requireEndingState && !hasStoryContinuityState(_0xe26c80)) {
    throw new Error("Agent 返回的完整分集剧本缺少有效结束状态。");
  }
  return {
    schemaVersion: STORY_EPISODE_SCRIPT_SCHEMA_VERSION,
    episodeRef: _0x2c6d9b,
    title: _0x6523c6,
    scenes: _0x3e8e8b,
    fullText: _0x337278,
    continuityFacts: _0x42bbf4,
    endingState: _0xe26c80,
    ...(_0x36be6d ? {
      recovery: _0x36be6d
    } : {})
  };
}
function getStoryEpisodeScriptFinishReason(_0x1aafdd) {
  return normalizeText(_0x1aafdd?.finishReason || _0x1aafdd?.finish_reason || _0x1aafdd?.choices?.[0]?.finish_reason || _0x1aafdd?.data?.choices?.[0]?.finish_reason).toLowerCase();
}
function serializeStoryEpisodeScriptResponse(_0x4b7de0) {
  const _0x3b8f2c = getResultText(_0x4b7de0);
  if (typeof _0x3b8f2c === "string") {
    return _0x3b8f2c;
  } else {
    return stringifyStoryEpisodeDevResponse(_0x3b8f2c);
  }
}
function normalizeStoryEpisodeScriptRawResponses(_0xa5cc43 = null) {
  const _0x599e4f = Array.isArray(_0xa5cc43?.rawResponses) ? _0xa5cc43.rawResponses : normalizeText(_0xa5cc43?.rawResponse) ? [{
    attempt: _0xa5cc43?.attempts,
    phase: "generation",
    finishReason: _0xa5cc43?.finishReason,
    text: _0xa5cc43.rawResponse
  }] : [];
  return _0x599e4f.map((_0x49ee37, _0x53e1b) => ({
    attempt: Math.max(1, Math.trunc(Number(_0x49ee37?.attempt) || _0x53e1b + 1)),
    phase: normalizeText(_0x49ee37?.phase) || (_0x53e1b ? "repair" : "generation"),
    finishReason: normalizeText(_0x49ee37?.finishReason).toLowerCase(),
    text: typeof _0x49ee37?.text === "string" ? _0x49ee37.text : stringifyStoryEpisodeDevResponse(_0x49ee37?.text)
  }));
}
function createStoryEpisodeScriptRawResponseRecord(_0x344ead, {
  attempt = 1,
  phase = "generation"
} = {}) {
  return {
    attempt: Math.max(1, Math.trunc(Number(attempt) || 1)),
    phase: normalizeText(phase) || "generation",
    finishReason: getStoryEpisodeScriptFinishReason(_0x344ead),
    text: serializeStoryEpisodeScriptResponse(_0x344ead)
  };
}
function selectStoryEpisodeScriptRepairSource(_0x3e6eba = []) {
  return _0x3e6eba.reduce((_0xc7faf5, _0x16786e) => {
    if (!normalizeText(_0x16786e?.text)) {
      return _0xc7faf5;
    }
    if (!_0xc7faf5 || String(_0x16786e.text).length >= String(_0xc7faf5.text).length) {
      return _0x16786e;
    }
    return _0xc7faf5;
  }, null);
}
function buildStoryEpisodeScriptRepairPrompt({
  episode = {},
  episodeRef = "episode-1",
  episodeNumber = 1,
  rejectedResponse = "",
  finishReason = "",
  error = null
} = {}) {
  const _0x375da7 = normalizeStoryContinuityState(episode?.endingState);
  return JSON.stringify({
    task: "repair_story_episode_script_response",
    episode: {
      ref: normalizeText(episodeRef) || "episode-" + episodeNumber,
      number: Math.max(1, Math.trunc(Number(episodeNumber) || 1)),
      title: normalizeText(episode?.title),
      synopsis: normalizeText(episode?.synopsis),
      hook: normalizeText(episode?.hook),
      continuityFacts: normalizeStoryContinuityFacts(episode?.continuityFacts),
      requiredEndingState: _0x375da7
    },
    issue: {
      reason: normalizeText(error?.message || error) || "上一次返回无法完整解析",
      finishReason: normalizeText(finishReason)
    },
    rejectedResponse: String(rejectedResponse || ""),
    instructions: ["优先做最小修改，完整保留 rejectedResponse 中已经存在的场次正文、动作和对白。", "如果只是 JSON 语法或字段名错误，只修复语法和字段名，不改写剧情。", "如果返回在中途截断，只从截断位置继续，补完当前场次、本集钩子、continuityFacts 和 endingState。", "返回内容包含 episodeRef、title、scenes、continuityFacts、endingState 即可；不要添加解释。"]
  });
}
function tryParseStoryEpisodeScriptResponse(_0x5e7ff9, _0x25555f) {
  try {
    return {
      result: parseStoryEpisodeScriptResult(_0x5e7ff9, _0x25555f),
      error: null
    };
  } catch (_0x5cc13d) {
    return {
      result: null,
      error: _0x5cc13d
    };
  }
}
function isCompleteStoryEpisodeScriptResponse(_0x5a2851) {
  return Boolean(_0x5a2851 && Array.isArray(_0x5a2851.scenes) && _0x5a2851.scenes.length && normalizeText(_0x5a2851.fullText) && _0x5a2851.recovery?.incompleteJson !== true);
}
function chooseBestStoryEpisodeScriptResult(_0x7384ac = []) {
  return _0x7384ac.filter(_0x10b062 => _0x10b062 && Array.isArray(_0x10b062.scenes) && _0x10b062.scenes.length).sort((_0x562ec4, _0x5b2973) => Number(_0x5b2973.scenes.length || 0) - Number(_0x562ec4.scenes.length || 0) || normalizeText(_0x5b2973.fullText).length - normalizeText(_0x562ec4.fullText).length)[0] || null;
}
function createStoryEpisodeScriptPartialError({
  episodeRef = "episode-1",
  rawResponses = [],
  attempts = 1,
  parseResults = [],
  cause = null
} = {}) {
  const _0x17143f = normalizeText(cause?.message || cause) || "返回无法完整解析";
  const _0x37f1dc = {
    schemaVersion: STORY_EPISODE_SCRIPT_SCHEMA_VERSION,
    status: "failed",
    episodeRef: normalizeText(episodeRef) || "episode-1",
    attempts: Math.max(1, Math.trunc(Number(attempts) || 1), ...rawResponses.map(_0x40653b => Math.trunc(Number(_0x40653b?.attempt) || 0))),
    rawResponses: rawResponses.map(_0x430225 => ({
      ..._0x430225
    })),
    bestEffort: chooseBestStoryEpisodeScriptResult(parseResults),
    lastError: {
      message: _0x17143f,
      code: normalizeText(cause?.code),
      type: normalizeText(cause?.type || cause?.name) || "Error"
    }
  };
  const _0x6c4eff = new Error("完整分集剧本返回仍不完整，已保存本次返回；再次点击时会优先修复，不会重新生成整集。" + (_0x17143f ? " " + _0x17143f : ""));
  _0x6c4eff.name = "StoryEpisodeScriptPartialError";
  _0x6c4eff.code = "STORY_EPISODE_SCRIPT_PARTIAL";
  _0x6c4eff.partialResult = _0x37f1dc;
  return _0x6c4eff;
}
export async function generateStoryEpisodeScript({
  project = {},
  episode = {},
  previousEpisode = null,
  nextEpisode = null,
  model = "",
  provider = "",
  providerProfileId = "",
  request = generateText,
  onProgress = null,
  repairDraft = null,
  onInvocation = null
} = {}) {
  assertPlanningModel(model, provider);
  const _0xd9567b = Math.max(1, Math.trunc(Number(episode?.number) || 1));
  const _0x1b4ab0 = normalizeText(episode?.ref || episode?.planningRef || episode?.id) || "episode-" + _0xd9567b;
  const _0x5ae04a = buildStoryEpisodeScriptPrompt({
    project: project,
    episode: episode,
    previousEpisode: previousEpisode,
    nextEpisode: nextEpisode
  });
  const _0x397140 = {
    model: normalizeText(model),
    provider: normalizeText(provider),
    ...buildStoryTextProviderProfilePayload(providerProfileId),
    prompt: _0x5ae04a,
    systemPrompt: STORY_EPISODE_SCRIPT_SYSTEM_PROMPT,
    temperature: normalizeStoryScriptMode(project?.scriptMode) === STORY_SCRIPT_MODE_NARRATION ? 0.35 : 0.45,
    timeoutMs: STORY_TEXT_REQUEST_TIMEOUT_MS,
    maxOutputTokens: STORY_TEXT_MAX_OUTPUT_TOKENS
  };
  const _0xb858b2 = {
    episodeRef: _0x1b4ab0,
    episodeNumber: _0xd9567b,
    episodeTitle: episode?.title,
    requireEndingState: true,
    fallbackContinuityFacts: episode?.continuityFacts,
    fallbackEndingState: episode?.endingState
  };
  const _0x494c0a = normalizeStoryEpisodeScriptRawResponses(repairDraft);
  const _0x3d5fb4 = Math.max(Math.trunc(Number(repairDraft?.attempts) || 0), ..._0x494c0a.map(_0x240fcb => Math.trunc(Number(_0x240fcb?.attempt) || 0)));
  const _0x4436f1 = [];
  let _0x5e5c63 = 0;
  let _0x3f8184 = 0;
  const _0x4e5a14 = () => _0x3d5fb4 + ++_0x3f8184;
  const _0x5598fa = async (_0x476917, _0x1f9e4e) => {
    const _0x53a757 = _0x4e5a14();
    const _0x5cf490 = await invokeStoryGenerationRequest({
      request: request,
      requestPayload: _0x476917,
      stepId: _0x1f9e4e,
      attempt: _0x53a757,
      onInvocation: onInvocation,
      serializeResponse: serializeStoryEpisodeScriptResponse
    });
    _0x5e5c63 += 1;
    captureStoryEpisodeScriptDevResponse({
      response: _0x5cf490,
      attempt: _0x53a757,
      episodeRef: _0x1b4ab0,
      episodeNumber: _0xd9567b,
      model: model,
      provider: provider
    });
    _0x494c0a.push(createStoryEpisodeScriptRawResponseRecord(_0x5cf490, {
      attempt: _0x53a757,
      phase: _0x1f9e4e
    }));
    return _0x5cf490;
  };
  const _0x1a2d67 = _0x1f75e5 => ensureStoryEpisodeScriptTiming({
    scriptResult: _0x1f75e5,
    episode: episode,
    review: (_0xb952d3, _0x313f9f, _0x52c223) => requestStoryEpisodeScriptTimingReview({
      request: request,
      requestPayload: _0x397140,
      episode: episode,
      script: _0xb952d3,
      onInvocation: onInvocation,
      attempt: _0x4e5a14(),
      phase: _0x313f9f,
      priorReview: _0x52c223
    })
  });
  const _0x36bf27 = JSON.parse(_0x5ae04a);
  const _0x42ae3c = async _0x5ef3fd => {
    const _0x26faf1 = await _0x1a2d67(_0x5ef3fd);
    if (normalizeText(_0x26faf1?.timingReview?.verdict) !== "needs_revision") {
      return _0x26faf1;
    }
    onProgress?.({
      stage: "revising-episode-script-content",
      current: _0xd9567b,
      total: _0xd9567b,
      message: "第 " + _0xd9567b + " 集内容审查未通过，正在按分集大纲和连续性自动精简修订"
    });
    const _0x28a31c = {
      ..._0x397140,
      prompt: buildStoryEpisodeScriptContentRevisionPrompt({
        grounding: _0x36bf27,
        script: _0x26faf1,
        timingReview: _0x26faf1.timingReview
      }),
      systemPrompt: STORY_EPISODE_SCRIPT_CONTENT_REVISION_SYSTEM_PROMPT,
      temperature: 0.2
    };
    try {
      const _0x25aea3 = await _0x5598fa(_0x28a31c, "content-revision");
      const _0x186899 = tryParseStoryEpisodeScriptResponse(_0x25aea3, _0xb858b2);
      if (_0x186899.result) {
        _0x4436f1.push(_0x186899.result);
      }
      if (!isCompleteStoryEpisodeScriptResponse(_0x186899.result)) {
        return preserveStoryEpisodeScriptWithoutTimingReview(_0x26faf1, episode, _0x186899.error || new Error("内容修订返回不完整。"));
      }
      const _0x5ad15a = await _0x1a2d67(_0x186899.result);
      if (normalizeText(_0x5ad15a?.timingReview?.verdict) === "needs_revision") {
        return preserveStoryEpisodeScriptWithoutTimingReview(_0x26faf1, episode, new Error("自动内容修订后仍未通过：" + (normalizeText(_0x5ad15a?.timingReview?.reason) || "存在重复内容")));
      }
      return _0x5ad15a;
    } catch (_0x2889b0) {
      return preserveStoryEpisodeScriptWithoutTimingReview(_0x26faf1, episode, _0x2889b0);
    }
  };
  const _0x2477b7 = repairDraft?.skipPostGenerationReview === true;
  const _0x30ff1b = async ({
    rejectedResponse: _0x43f3a8,
    finishReason = "",
    cause = null
  } = {}) => {
    onProgress?.({
      stage: "repairing-episode-script",
      current: _0xd9567b,
      total: _0xd9567b,
      message: "第 " + _0xd9567b + " 集返回格式异常，正在修复已有正文"
    });
    const _0x53f10d = {
      ..._0x397140,
      prompt: buildStoryEpisodeScriptRepairPrompt({
        episode: episode,
        episodeRef: _0x1b4ab0,
        episodeNumber: _0xd9567b,
        rejectedResponse: _0x43f3a8,
        finishReason: finishReason,
        error: cause
      }),
      systemPrompt: STORY_EPISODE_SCRIPT_REPAIR_SYSTEM_PROMPT,
      temperature: 0.15
    };
    let _0x219ced;
    try {
      _0x219ced = await _0x5598fa(_0x53f10d, "repair");
    } catch (_0x46a117) {
      throw createStoryEpisodeScriptPartialError({
        episodeRef: _0x1b4ab0,
        rawResponses: _0x494c0a,
        attempts: _0x3d5fb4 + _0x5e5c63 + 1,
        parseResults: _0x4436f1,
        cause: _0x46a117
      });
    }
    const _0x414ee4 = tryParseStoryEpisodeScriptResponse(_0x219ced, _0xb858b2);
    if (_0x414ee4.result) {
      _0x4436f1.push(_0x414ee4.result);
    }
    if (isCompleteStoryEpisodeScriptResponse(_0x414ee4.result)) {
      return _0x42ae3c(_0x414ee4.result);
    }
    throw createStoryEpisodeScriptPartialError({
      episodeRef: _0x1b4ab0,
      rawResponses: _0x494c0a,
      attempts: _0x3d5fb4 + _0x5e5c63,
      parseResults: _0x4436f1,
      cause: _0x414ee4.error || new Error("修复返回仍然被截断。")
    });
  };
  for (const _0x352842 of [..._0x494c0a].reverse()) {
    if (!_0x352842?.text) {
      continue;
    }
    const _0x5e79dc = tryParseStoryEpisodeScriptResponse(_0x352842.text, _0xb858b2);
    if (_0x5e79dc.result) {
      _0x4436f1.push(_0x5e79dc.result);
    }
    if (isCompleteStoryEpisodeScriptResponse(_0x5e79dc.result)) {
      if (_0x2477b7) {
        return preserveStoryEpisodeScriptWithoutTimingReview(_0x5e79dc.result, episode, new Error("上次正文生成后的时长审查被中断。"));
      } else {
        return _0x42ae3c(_0x5e79dc.result);
      }
    }
  }
  const _0x44bbee = selectStoryEpisodeScriptRepairSource(_0x494c0a);
  if (_0x44bbee?.text) {
    const _0x212214 = tryParseStoryEpisodeScriptResponse(_0x44bbee.text, _0xb858b2);
    return _0x30ff1b({
      rejectedResponse: _0x44bbee.text,
      finishReason: _0x44bbee.finishReason,
      cause: _0x212214.error || new Error("上次返回在完整剧本结束前被截断。")
    });
  }
  onProgress?.({
    stage: "writing-episode-script",
    current: _0xd9567b,
    total: _0xd9567b,
    message: "正在生成第 " + _0xd9567b + " 集完整剧本"
  });
  const _0x584244 = await _0x5598fa(_0x397140, "generation");
  const _0x329870 = tryParseStoryEpisodeScriptResponse(_0x584244, _0xb858b2);
  if (_0x329870.result) {
    _0x4436f1.push(_0x329870.result);
  }
  if (isCompleteStoryEpisodeScriptResponse(_0x329870.result)) {
    return _0x42ae3c(_0x329870.result);
  }
  return _0x30ff1b({
    rejectedResponse: serializeStoryEpisodeScriptResponse(_0x584244),
    finishReason: getStoryEpisodeScriptFinishReason(_0x584244),
    cause: _0x329870.error || new Error("首次返回在完整剧本结束前被截断。")
  });
}
function normalizePlanningAssetSummary(_0x139114 = {}, _0x245c4c = 0) {
  const _0xf10133 = ["scene", "prop"].includes(_0x139114.kind) ? _0x139114.kind : "character";
  const _0x136bad = Array.isArray(_0x139114?.appearances) ? _0x139114.appearances : [];
  const _0x238f08 = _0x136bad.map(_0x465afe => ({
    ref: a173_0x3e308f(_0x465afe?.planningRef || _0x465afe?.ref || _0x465afe?.id, ""),
    name: normalizeText(_0x465afe?.name),
    description: normalizeText(_0x465afe?.description),
    prompt: normalizeText(_0x465afe?.prompt),
    sourceEpisodeRefs: normalizeStringArray(_0x465afe?.sourceEpisodeRefs),
    sourceSceneRefs: normalizeStringArray(_0x465afe?.sourceSceneRefs)
  })).filter(_0x529131 => _0x529131.ref && (_0x529131.name || _0x529131.prompt));
  const _0x26cf2a = normalizeText(_0x139114?.baseAppearanceRef);
  const _0x31836a = normalizeText(_0x139114?.baseAppearanceId);
  const _0x21a3ae = _0x26cf2a || _0x31836a;
  const _0x430e69 = _0x21a3ae ? _0x136bad.find(_0x88f7f8 => [_0x88f7f8?.id, _0x88f7f8?.ref, _0x88f7f8?.planningRef].some(_0x4c4272 => normalizeText(_0x4c4272) === _0x21a3ae)) : null;
  const _0x5cc7ad = a173_0x3e308f(_0x430e69?.planningRef || _0x430e69?.ref || _0x430e69?.id, _0x238f08.length === 1 ? _0x238f08[0].ref : "");
  return {
    ref: a173_0x3e308f(_0x139114.ref || _0x139114.planningRef || _0x139114.id, "asset-" + (_0x245c4c + 1)),
    kind: _0xf10133,
    name: normalizeText(_0x139114.name),
    role: normalizeText(_0x139114.role),
    description: normalizeText(_0x139114.description),
    baseAppearanceRef: _0x5cc7ad,
    sourceEpisodeRefs: normalizeStringArray(_0x139114?.sourceEpisodeRefs),
    sourceSceneRefs: normalizeStringArray(_0x139114?.sourceSceneRefs),
    appearances: _0x238f08
  };
}
function compactStoryEpisodePromptAsset(_0x51a9c8 = {}, {
  includeVisualDetails = false,
  includeBindings = false
} = {}) {
  const _0x56337e = normalizeText(_0x51a9c8?.kind);
  const _0x1b57b7 = includeVisualDetails && _0x56337e !== "character";
  const _0x1de1bf = (Array.isArray(_0x51a9c8?.appearances) ? _0x51a9c8.appearances : []).map(_0x532730 => ({
    ref: normalizeText(_0x532730?.ref),
    name: normalizeText(_0x532730?.name),
    ...(includeBindings && normalizeStringArray(_0x532730?.sourceEpisodeRefs).length ? {
      sourceEpisodeRefs: normalizeStringArray(_0x532730.sourceEpisodeRefs)
    } : {}),
    ...(includeBindings && normalizeStringArray(_0x532730?.sourceSceneRefs).length ? {
      sourceSceneRefs: normalizeStringArray(_0x532730.sourceSceneRefs)
    } : {}),
    ...(_0x1b57b7 && normalizeText(_0x532730?.description) ? {
      description: normalizeText(_0x532730.description)
    } : {}),
    ...(_0x1b57b7 && normalizeText(_0x532730?.prompt) ? {
      prompt: normalizeText(_0x532730.prompt)
    } : {})
  }));
  return {
    ref: normalizeText(_0x51a9c8?.ref),
    kind: _0x56337e,
    name: normalizeText(_0x51a9c8?.name),
    ...(includeBindings && normalizeText(_0x51a9c8?.baseAppearanceRef) ? {
      baseAppearanceRef: normalizeText(_0x51a9c8.baseAppearanceRef)
    } : {}),
    ...(includeBindings && normalizeStringArray(_0x51a9c8?.sourceEpisodeRefs).length ? {
      sourceEpisodeRefs: normalizeStringArray(_0x51a9c8.sourceEpisodeRefs)
    } : {}),
    ...(includeBindings && normalizeStringArray(_0x51a9c8?.sourceSceneRefs).length ? {
      sourceSceneRefs: normalizeStringArray(_0x51a9c8.sourceSceneRefs)
    } : {}),
    ...(_0x1b57b7 && normalizeText(_0x51a9c8?.description) ? {
      description: normalizeText(_0x51a9c8.description)
    } : {}),
    appearances: _0x1de1bf
  };
}
function createStoryEpisodeSplitCompactAssetCatalog(_0x4650a2 = []) {
  const _0x223e51 = [];
  (Array.isArray(_0x4650a2) ? _0x4650a2 : []).forEach(_0x4541f3 => {
    const _0x4ebdbd = Array.isArray(_0x4541f3?.appearances) ? _0x4541f3.appearances.filter(_0x24d9ff => normalizeText(_0x24d9ff?.ref)) : [];
    const _0x249886 = _0x4ebdbd.length ? [..._0x4ebdbd].sort((_0x54bc34, _0x173b53) => {
      const _0x42d73b = normalizeText(_0x4541f3?.baseAppearanceRef);
      return Number(normalizeText(_0x173b53?.ref) === _0x42d73b) - Number(normalizeText(_0x54bc34?.ref) === _0x42d73b);
    }) : [null];
    _0x249886.forEach(_0x5609d0 => {
      const _0x15c441 = "a" + (_0x223e51.length + 1);
      const _0x5e6656 = normalizeText(_0x5609d0?.name);
      _0x223e51.push({
        code: _0x15c441,
        kind: normalizeText(_0x4541f3?.kind),
        name: [normalizeText(_0x4541f3?.name), _0x5e6656].filter(Boolean).join("·"),
        assetName: normalizeText(_0x4541f3?.name),
        ref: normalizeText(_0x5609d0?.ref) || normalizeText(_0x4541f3?.ref),
        assetRef: normalizeText(_0x4541f3?.ref)
      });
    });
  });
  return _0x223e51;
}
function createStoryEpisodeSplitCompactDialogueCatalog(_0x2583d9 = {}, _0x288c64 = []) {
  let _0xb1d445 = [];
  try {
    _0xb1d445 = normalizeStoryEpisodeSplitSourceBeats(_0x2583d9).flatMap(_0x5e3432 => Array.isArray(_0x5e3432?.dialogueUnits) ? _0x5e3432.dialogueUnits : []);
  } catch {
    _0xb1d445 = extractStoryEpisodeDialogueUnits(_0x2583d9?.script?.fullText || _0x2583d9?.fullScript || _0x2583d9?.scriptText || _0x2583d9?.synopsis || _0x2583d9?.content, getStoryEpisodeReferenceAliases(_0x2583d9)[0] || "episode-1");
  }
  const _0x88a7c = createStoryEpisodeSplitCompactAssetCatalog(_0x288c64).filter(_0x184521 => _0x184521.kind === "character");
  return _0xb1d445.map((_0x454b32, _0xae2a9) => {
    const _0x3a12f9 = normalizeText(_0x454b32?.speaker);
    const _0x486945 = _0x3a12f9 ? _0x88a7c.filter(_0x1fdcc0 => getStoryEpisodeSplitAssetNameAliases(_0x1fdcc0.assetName).some(_0x262715 => _0x262715 === _0x3a12f9)) : [];
    return {
      code: "q" + (_0xae2a9 + 1),
      ...(_0x3a12f9 ? {
        speaker: _0x3a12f9
      } : {}),
      ...(_0x486945.length === 1 ? {
        speakerAssetCode: _0x486945[0].code
      } : {}),
      text: normalizeText(_0x454b32?.text)
    };
  }).filter(_0x2d0032 => _0x2d0032.text);
}
function decodeStoryEpisodeSplitCompactDialogue(_0x2f719f, {
  dialogueByCode = new Map(),
  assetByCode = new Map()
} = {}) {
  const _0x52de4c = normalizeText(_0x2f719f);
  if (!_0x52de4c) {
    return {
      text: "",
      assetCode: ""
    };
  }
  const [_0x2bd125, _0x107cfa = ""] = _0x52de4c.split("@").map(normalizeText);
  const _0x4c5af7 = dialogueByCode.get(_0x2bd125);
  if (!_0x4c5af7) {
    return {
      text: _0x52de4c,
      assetCode: ""
    };
  }
  const _0x2a0914 = assetByCode.get(_0x107cfa);
  const _0x1b4bdb = _0x2a0914?.kind === "character" ? _0x107cfa : "";
  const _0x26d697 = _0x1b4bdb || normalizeText(_0x4c5af7?.speakerAssetCode);
  const _0x123719 = assetByCode.get(_0x26d697);
  const _0x27aa05 = normalizeText(_0x123719?.assetName) || normalizeText(_0x4c5af7?.speaker) || "人物";
  return {
    text: _0x27aa05 + "：“" + _0x4c5af7.text + "”",
    assetCode: _0x26d697
  };
}
function expandStoryEpisodeSplitCompactData(_0x2d9794 = {}, {
  episodeRef = "",
  episode = {},
  assets = []
} = {}) {
  if (!_0x2d9794 || typeof _0x2d9794 !== "object" || !Array.isArray(_0x2d9794.clips)) {
    return _0x2d9794;
  }
  const _0xa5c896 = createStoryEpisodeSplitCompactAssetCatalog(assets);
  const _0x191a31 = createStoryEpisodeSplitCompactSceneCatalog(assets);
  const _0x435a23 = new Map([..._0xa5c896, ..._0x191a31].map(_0x32306e => [_0x32306e.code, _0x32306e]));
  const _0x53e011 = _0xa5c896.filter((_0x292dc4, _0x10bff6) => _0xa5c896.findIndex(_0x4f4546 => _0x4f4546.assetRef === _0x292dc4.assetRef) === _0x10bff6);
  const _0x39a0ad = createStoryEpisodeSplitCompactDialogueCatalog(episode, assets);
  const _0x36fa43 = new Map(_0x39a0ad.map(_0x597e51 => [_0x597e51.code, _0x597e51]));
  return {
    ..._0x2d9794,
    episodeRef: normalizeText(_0x2d9794.episodeRef) || episodeRef,
    clips: _0x2d9794.clips.map((_0x23a60c, _0x2c2afd) => ({
      ..._0x23a60c,
      ref: normalizeText(_0x23a60c?.ref) || "clip-" + (_0x2c2afd + 1),
      shots: (Array.isArray(_0x23a60c?.shots) ? _0x23a60c.shots : []).map(_0x115a42 => {
        if (!_0x115a42 || typeof _0x115a42 !== "object" || Array.isArray(_0x115a42)) {
          return _0x115a42;
        }
        const _0x29ff11 = ["d", "r", "v", "c", "q", "o", "a"].some(_0x260441 => Object.prototype.hasOwnProperty.call(_0x115a42, _0x260441));
        if (!_0x29ff11) {
          return _0x115a42;
        }
        const _0x4e6567 = Math.trunc(Number(_0x115a42.c));
        const _0xb479be = Number.isInteger(_0x4e6567) && STORY_EPISODE_SPLIT_CAMERA_PRESETS[_0x4e6567] ? STORY_EPISODE_SPLIT_CAMERA_PRESETS[_0x4e6567] : normalizeText(_0x115a42.c) || STORY_EPISODE_SPLIT_CAMERA_PRESETS[0];
        const _0x30fb32 = decodeStoryEpisodeSplitCompactDialogue(_0x115a42.q, {
          dialogueByCode: _0x36fa43,
          assetByCode: _0x435a23
        });
        const _0xfaf9e8 = normalizeText(_0x115a42.v);
        const _0x3faf9b = _0x53e011.filter(_0x45f133 => getStoryEpisodeSplitAssetNameAliases(_0x45f133.assetName).some(_0x120664 => _0x120664 && _0xfaf9e8.includes(_0x120664))).map(_0x1e3070 => _0x1e3070.code);
        const _0x4fb1a8 = normalizeStringArray([_0x30fb32.assetCode, ..._0x3faf9b, ...normalizeStringArray(_0x115a42.r), normalizeText(_0x23a60c?.s)]).map(_0x3a62e1 => _0x435a23.get(_0x3a62e1)).filter(Boolean);
        const _0x2e7c0a = [...new Map(_0x4fb1a8.map(_0x31206e => [_0x31206e.assetRef + ":" + _0x31206e.ref, {
          assetRef: _0x31206e.assetRef,
          appearanceRef: _0x31206e.ref === _0x31206e.assetRef ? "" : _0x31206e.ref
        }])).values()];
        return {
          durationSec: _0x115a42.d,
          ...(Object.prototype.hasOwnProperty.call(_0x115a42, "startSec") ? {
            startSec: _0x115a42.startSec
          } : {}),
          ...(Object.prototype.hasOwnProperty.call(_0x115a42, "endSec") ? {
            endSec: _0x115a42.endSec
          } : {}),
          assetUsages: _0x2e7c0a,
          visual: _0xfaf9e8,
          camera: _0xb479be,
          dialogue: _0x30fb32.text,
          voiceover: normalizeText(_0x115a42.o),
          audio: normalizeText(_0x115a42.a)
        };
      })
    }))
  };
}
function isStoryEpisodeEditorialMarker(_0x5b7e30 = "") {
  return /^(?:[（(]\s*)?(?:本集完|本章完|全剧终|未完待续|待续|完)(?:\s*[）)])?[。.!！]?$/iu.test(normalizeText(_0x5b7e30));
}
function sanitizeStoryEpisodeSplitSourceText(_0x4e1028 = "") {
  return String(_0x4e1028 || "").split(/\r?\n/u).filter(_0x191006 => !isStoryEpisodeEditorialMarker(_0x191006)).join("\n").trim();
}
function getStoryEpisodeSplitSourceSceneMetadata(_0x4f5998 = {}) {
  return (Array.isArray(_0x4f5998?.script?.scenes) ? _0x4f5998.script.scenes : []).map(_0x1d8916 => ({
    heading: normalizeText(_0x1d8916?.heading),
    characters: normalizeStringArray(_0x1d8916?.characters)
  })).filter(_0x951ec1 => _0x951ec1.heading || _0x951ec1.characters.length);
}
function isStoryEpisodeSplitSourceMetadataLine(_0x31bf2d = "", _0x301659 = {}) {
  const _0x137f84 = normalizeText(_0x31bf2d);
  if (!_0x137f84) {
    return false;
  }
  const _0x560866 = new Set(getStoryEpisodeSplitSourceSceneMetadata(_0x301659).map(_0x49dccd => _0x49dccd.heading).filter(Boolean));
  return _0x560866.has(_0x137f84) || /^#{1,6}\s*(?:第?\s*\d+\s*集|场(?:景)?\s*\d)/u.test(_0x137f84) || /^(?:出场人物|人物列表|时间|地点|场景)[：:]/u.test(_0x137f84);
}
function sanitizeStoryEpisodeSplitPromptText(_0x35e214 = "", _0x2a2c4e = {}) {
  return sanitizeStoryEpisodeSplitSourceText(_0x35e214).split(/\r?\n/u).filter(_0x164531 => !isStoryEpisodeSplitSourceMetadataLine(_0x164531, _0x2a2c4e)).join("\n").trim();
}
function filterStoryEpisodeBlueprintEpisodeBindings(_0x417c04 = [], _0x5d7386 = []) {
  const _0x475c2f = new Set(normalizeStringArray(_0x5d7386));
  return normalizeStringArray(_0x417c04).filter(_0x1777df => _0x475c2f.has(_0x1777df));
}
function filterStoryEpisodeBlueprintSceneBindings(_0x306638 = [], _0x24a5e5 = [], {
  episodeRefs = []
} = {}) {
  const _0x37038e = normalizeStringArray(_0x24a5e5);
  return normalizeStringArray(_0x306638).filter(_0xc7235a => _0x37038e.some(_0x3566be => storyEpisodeSourceSceneRefsMatch(_0xc7235a, _0x3566be, episodeRefs)));
}
function compactStoryEpisodeBlueprintAsset(_0x2fb35e = {}, {
  episodeRefs = [],
  sourceSceneRefs = []
} = {}) {
  const _0x312096 = compactStoryEpisodePromptAsset(_0x2fb35e);
  const _0x4c6c1c = (_0x3cddf3 = {}) => {
    const _0x1fabeb = normalizeStringArray(_0x3cddf3?.sourceEpisodeRefs);
    const _0x1364a4 = filterStoryEpisodeBlueprintEpisodeBindings(_0x1fabeb, episodeRefs);
    const _0x2d896d = _0x1fabeb.length && !_0x1364a4.length ? [] : filterStoryEpisodeBlueprintSceneBindings(_0x3cddf3?.sourceSceneRefs, sourceSceneRefs, {
      episodeRefs: episodeRefs
    });
    return {
      ...(_0x1364a4.length ? {
        sourceEpisodeRefs: _0x1364a4
      } : {}),
      ...(_0x2d896d.length ? {
        sourceSceneRefs: _0x2d896d
      } : {})
    };
  };
  const _0x3c78d6 = new Map((Array.isArray(_0x2fb35e?.appearances) ? _0x2fb35e.appearances : []).map(_0x1a387f => [normalizeText(_0x1a387f?.ref), _0x1a387f]));
  return {
    ..._0x312096,
    ...(normalizeText(_0x2fb35e?.baseAppearanceRef) ? {
      baseAppearanceRef: normalizeText(_0x2fb35e.baseAppearanceRef)
    } : {}),
    ..._0x4c6c1c(_0x2fb35e),
    appearances: _0x312096.appearances.map(_0x50a6c7 => ({
      ..._0x50a6c7,
      ..._0x4c6c1c(_0x3c78d6.get(_0x50a6c7.ref))
    }))
  };
}
function buildStoryEpisodeSplitAssetCatalog(_0x200748 = [], _0x1bf3c5 = []) {
  const _0x5aa1b1 = new Map();
  const _0xfcc1b3 = new Map();
  for (const _0x3d4fbd of Array.isArray(_0x200748) ? _0x200748 : []) {
    const _0x25360f = a173_0x3e308f(_0x3d4fbd?.ref, "");
    if (!_0x25360f) {
      continue;
    }
    const _0x1f403b = [];
    for (const _0x1454b2 of Array.isArray(_0x3d4fbd?.appearances) ? _0x3d4fbd.appearances : []) {
      const _0x966394 = a173_0x3e308f(_0x1454b2?.ref, "");
      if (!_0x966394) {
        continue;
      }
      _0x1f403b.push(_0x966394);
      const _0x351baf = _0xfcc1b3.get(_0x966394) || new Set();
      _0x351baf.add(_0x25360f);
      _0xfcc1b3.set(_0x966394, _0x351baf);
    }
    const _0x5cd3d0 = ["scene", "prop"].includes(_0x3d4fbd?.kind) ? _0x3d4fbd.kind : "character";
    const _0x13f2de = _0x1f403b.includes(_0x25360f + "-appearance-1") ? _0x25360f + "-appearance-1" : "";
    _0x5aa1b1.set(_0x25360f, {
      assetRef: _0x25360f,
      kind: _0x5cd3d0,
      name: normalizeText(_0x3d4fbd?.name),
      appearanceRefs: _0x1f403b,
      defaultAppearanceRef: a173_0x3e308f(_0x3d4fbd?.baseAppearanceRef, "") || _0x13f2de || (_0x1f403b.length === 1 ? _0x1f403b[0] : "")
    });
  }
  for (const _0x37b9a5 of normalizeStringArray(_0x1bf3c5)) {
    if (!_0x5aa1b1.has(_0x37b9a5)) {
      _0x5aa1b1.set(_0x37b9a5, {
        assetRef: _0x37b9a5,
        kind: "unknown",
        name: "",
        appearanceRefs: [],
        defaultAppearanceRef: ""
      });
    }
  }
  return {
    assetByRef: _0x5aa1b1,
    appearanceOwnerRefsByRef: _0xfcc1b3
  };
}
function getStoryEpisodeSplitAssetNameAliases(_0x235963 = "") {
  const _0x19eee0 = normalizeText(_0x235963);
  if (!_0x19eee0) {
    return [];
  }
  const _0x3e6e8e = new Set([_0x19eee0]);
  const _0x47bc32 = normalizeText(_0x19eee0.split(/[（(]/u, 1)[0]);
  if (_0x47bc32) {
    _0x3e6e8e.add(_0x47bc32);
  }
  const _0x43cfd5 = [..._0x19eee0.matchAll(/[（(]([^）)]+)[）)]/gu)].map(_0x365f46 => normalizeText(_0x365f46[1])).filter(Boolean);
  _0x43cfd5.forEach(_0x420c43 => _0x3e6e8e.add(_0x420c43));
  const _0x2ce1fe = _0x19eee0.replace(/^(?:实习生|调查记者|记者|刑警|警官|警察|房东|高中生|师父|掌门|宗主|老板|总编|编辑)/u, "");
  if (_0x2ce1fe) {
    _0x3e6e8e.add(_0x2ce1fe);
  }
  return [..._0x3e6e8e];
}
function resolveStoryEpisodeSplitLegacyAppearanceOwner(_0x2262e2, _0x413d12, _0x3a6a32, _0x598cc4 = {}) {
  const _0x225af5 = [...(_0x413d12 || [])];
  if (_0x225af5.length <= 1) {
    return _0x225af5[0] || "";
  }
  const _0x57c6be = [_0x598cc4?.visual, _0x598cc4?.camera, _0x598cc4?.dialogue, _0x598cc4?.voiceover].map(normalizeText).filter(Boolean).join(" ");
  const _0x1ec056 = _0x225af5.filter(_0x253b26 => {
    const _0x215e57 = _0x3a6a32.assetByRef.get(_0x253b26)?.name;
    return getStoryEpisodeSplitAssetNameAliases(_0x215e57).some(_0x28fc24 => _0x28fc24 && _0x57c6be.includes(_0x28fc24));
  });
  if (_0x1ec056.length === 1) {
    return _0x1ec056[0];
  }
  const _0x1088c9 = _0x225af5.filter(_0x33ad92 => _0x2262e2.startsWith(_0x33ad92 + "-appearance-"));
  if (_0x1088c9.length === 1) {
    return _0x1088c9[0];
  } else {
    return "";
  }
}
function resolveStoryEpisodeSplitUnknownLegacyAppearance(_0x4868ee, _0x2f5d86, _0x56824e = {}) {
  const _0x3b050d = [..._0x2f5d86.assetByRef.values()];
  const _0xd62991 = _0x3b050d.filter(_0x4426df => _0x4868ee.startsWith(_0x4426df.assetRef + "-appearance-"));
  if (_0xd62991.length === 1) {
    return _0xd62991[0];
  }
  const _0x3d743b = [_0x56824e?.visual, _0x56824e?.camera, _0x56824e?.dialogue, _0x56824e?.voiceover].map(normalizeText).filter(Boolean).join(" ");
  const _0x491082 = _0x3b050d.filter(_0x359704 => getStoryEpisodeSplitAssetNameAliases(_0x359704.name).some(_0x25ca12 => _0x25ca12 && _0x3d743b.includes(_0x25ca12)));
  if (_0x491082.length === 1) {
    return _0x491082[0];
  } else {
    return null;
  }
}
function assertKnownReferences(_0x10176b, _0x3f4f5f, _0x35e033) {
  const _0x1a15ce = _0x10176b.filter(_0x5eeb00 => !_0x3f4f5f.has(_0x5eeb00));
  if (_0x1a15ce.length) {
    throw new Error(_0x35e033 + "引用了不存在的资产：" + _0x1a15ce.join("、") + "。");
  }
}
function normalizeStoryEpisodeSplitAssetUsage(_0x5c6223 = {}, _0x516d85, _0x1b2489) {
  const _0x23e985 = a173_0x3e308f(_0x5c6223?.assetRef, "");
  let _0x301b21 = a173_0x3e308f(_0x5c6223?.appearanceRef, "");
  if (!_0x23e985) {
    throw new Error(_0x1b2489 + "缺少 assetRef。");
  }
  const _0x56ba0c = _0x516d85.assetByRef.get(_0x23e985);
  if (!_0x56ba0c) {
    throw new Error(_0x1b2489 + "引用了不存在的资产：" + _0x23e985 + "。");
  }
  if (_0x301b21 === _0x23e985 && !_0x56ba0c.appearanceRefs.includes(_0x301b21)) {
    _0x301b21 = _0x56ba0c.defaultAppearanceRef;
  }
  if (_0x301b21) {
    const _0xa9cb91 = _0x516d85.appearanceOwnerRefsByRef.get(_0x301b21);
    if (!_0xa9cb91?.size) {
      throw new Error(_0x1b2489 + "引用了不存在的形象：" + _0x301b21 + "。");
    }
    if (!_0x56ba0c.appearanceRefs.includes(_0x301b21)) {
      throw new Error(_0x1b2489 + "的形象“" + _0x301b21 + "”不属于资产“" + _0x23e985 + "”。");
    }
  } else if (_0x56ba0c.defaultAppearanceRef) {
    _0x301b21 = _0x56ba0c.defaultAppearanceRef;
  } else if (_0x56ba0c.appearanceRefs.length) {
    throw new Error(_0x1b2489 + "必须为资产“" + _0x23e985 + "”选择一个具体形象。");
  }
  return {
    assetRef: _0x23e985,
    appearanceRef: _0x301b21
  };
}
export function buildStoryAssetExtractionPrompt({
  project = {},
  aspectRatio = "",
  visualStyle = "",
  assetKinds = STORY_ASSET_EXTRACTION_KINDS,
  requiredAssetNamesByKind = null,
  candidateAssetsByKind = null,
  requiredAssetsByKind = null,
  compactOutput = false
} = {}) {
  const _0x5b4a66 = resolveStoryPlanningConstraints(project);
  const _0x27e1f7 = normalizeStoryProjectInput(project);
  _0x27e1f7.planning = _0x5b4a66;
  assertStoryProjectInput(_0x27e1f7);
  const _0x26f0b6 = normalizeText(visualStyle) || _0x27e1f7.visualStyle;
  const _0xfd37ca = normalizeStringArray(assetKinds).filter(_0x37fcc6 => STORY_ASSET_EXTRACTION_KINDS.includes(_0x37fcc6));
  if (!_0xfd37ca.length) {
    throw new Error("资产提取至少需要指定角色、场景或道具中的一种。");
  }
  const _0x29679c = {
    character: "角色",
    scene: "场景",
    prop: "道具"
  };
  const _0x12777f = createStoryAssetPromptContracts(_0xfd37ca, requiredAssetNamesByKind, candidateAssetsByKind, requiredAssetsByKind, {
    includeClientKeys: compactOutput
  });
  const _0x2e9940 = {
    task: compactOutput ? "complete_story_asset_visual_design_by_client_key" : _0xfd37ca.length === 1 ? "extract_story_assets_by_kind" : "extract_story_assets",
    schemaVersion: STORY_ASSET_EXTRACTION_SCHEMA_VERSION,
    assetKinds: _0xfd37ca,
    project: {
      title: _0x27e1f7.title,
      chapters: _0x27e1f7.chapters
    },
    visualDirection: {
      aspectRatio: normalizeText(aspectRatio) || _0x27e1f7.aspectRatio || "16:9",
      style: _0x26f0b6
    },
    ..._0x12777f.payload,
    requirements: ["本次只返回 " + _0xfd37ca.map(_0x475549 => _0x29679c[_0x475549]).join("、") + "资产，禁止返回其他 kind。", ..._0x12777f.requirements, ...(compactOutput ? ["这是紧凑视觉裁决模式：requiredAssets 与 candidateAssets 中的每一个 clientKey 都必须恰好返回一行，顺序不限，禁止省略、重复或编造 clientKey。", "requiredAssets 必须 include=true；candidateAssets 必须逐项明确返回 include=true 或 include=false。即使 include=false，也必须保留 description、visualPrompt、voiceDescription 三个字符串字段，可返回空字符串。", "include=true 时，description 是可直接展示的最终资产简介，visualPrompt 是可直接提交图片模型的最终正向提示词；客户端不会补写、扩写或套用模板。", "角色必须在 voiceDescription 中完整填写年龄、性别、身份、口音、情绪底色、声线、语速、说话方式、音色特征九项；场景和道具的 voiceDescription 必须为空字符串。", "禁止返回或改写 name、ref、来源、集数或 appearance 等客户端权威字段。不要复述剧情、证据、检索过程或规则。"] : ["提取后续画面中需要保持视觉一致的全部角色、场景和关键道具；普通背景杂物不单独提取为道具。", "必须通读 project.chapters 中提供的剧本证据后自行识别资产；不得依赖输入之外的预置角色、题材词表或候选清单，也不得因为角色戏份少、没有姓名、属于群体身份或只在单场出现而省略证据中实际出场且需要画面表现的角色。", "提取角色时，原文出场人物、登场人物或出场角色名单中的每一个独立称谓，以及有对白、独立动作或单独指代的角色都必须逐项返回；不得合并不同姓名、称谓或编号，群体身份需要画面表现时也必须返回群体角色资产。", "所有身份、外观、关系、物品归属和连续性事实都以所提供的剧本证据为准；不得为了视觉效果改写原文事实。", "ref 使用简短且在本次响应内唯一的英文或数字标识；它只是本次规划引用，不是持久 ID。", "sourceChapterIds 只能引用 project.chapters 中存在的 id。", "角色 name 只能是姓名或简短身份名：优先使用原文姓名；没有姓名时给出不超过 6 个汉字的身份短称，不得写人物介绍。", "角色 role 只能是主角、配角、反派或路人，必须依据人物在完整故事中的实际叙事作用分类；任何身份、关系、经历和叙事说明都写入 description。", "每个角色必须提供 voiceDescription，并按固定标签完整填写：年龄、性别、身份、口音、情绪底色、声线、语速、说话方式、音色特征；场景和道具的 voiceDescription 留空。", "每项资产至少提供一个信息充分、可直接用于图片生成的 appearance prompt，不得用‘符合设定’‘电影感人物’等空泛表述代替可见细节。", "角色 prompt 必须写清脸型、五官、肤色肤质、发型发色、身材体态、服装材质层次、鞋履和必要穿戴细节，并采用正面全身人物设定图构图。", "角色 prompt 只生成人设图，不生成人物剧照：聚焦脸部、发型、体态、服装、鞋履和必要穿戴细节，采用自然站立的正面全身人物设定图构图，不写剧情道具、动作表演、地点、家具、其他人物或剧情场面。", "最终 prompt 只能写需要呈现的正向视觉内容，不得复述任何规则、限制、处理流程、模型说明或其他元说明措辞。", "每个场景资产只能对应一个可独立复用的物理空间；遇到用“/”“／”等并列多个地点的复合场景标题，必须拆成多个原子场景资产，禁止直接复制复合标题作为资产名。", "场景 prompt 必须写清空间布局、结构材质、前中后景、关键陈设、光源与色温、时间天气、色彩、镜头视角及景别，并默认无人。", "道具 prompt 必须写清用途、轮廓、尺寸比例、材质工艺、颜色纹样、磨损、关键结构及产品设定构图，并默认无人手持。", "每个 appearance 都必须提供具体形象名称；角色首个形象也要按服装、身份或时期命名，禁止留空或使用笼统的‘基础形象’。角色显著换装、年龄变化或受伤状态可拆成多个 appearances；其他形象必须重复稳定的脸部、发型和体态特征，只修改剧情差异。同一物理空间在不同年代、完好/损毁、正常/异变、干燥/积水等显著状态下必须拆成多个场景 appearances；道具仍只保留一个形象。", _0x26f0b6 ? "每个 appearance prompt 必须逐字以 visualDirection.style 的完整内容开头，再续写资产描述；不得省略、改写或重复此前缀。" : "提示词遵循项目视觉方向，但不要把画面比例写进角色身份描述。"])],
    outputSchema: compactOutput ? {
      assets: [{
        clientKey: "输入中原样提供的短键",
        include: true,
        description: "可直接公开展示的最终资产简介；未采纳候选可为空字符串",
        visualPrompt: "可直接提交图片模型的最终正向提示词；未采纳候选可为空字符串",
        voiceDescription: "仅角色按九项完整填写；场景、道具和未采纳候选为空字符串"
      }]
    } : {
      assets: [{
        ref: "本次规划中的唯一引用",
        kind: _0xfd37ca.join("、"),
        name: "角色姓名或简短身份名；场景或道具名称",
        role: "角色只能是主角、配角、反派或路人；场景和道具使用简短叙事作用",
        description: "故事内身份或空间说明",
        voiceDescription: "仅角色填写。固定格式：年龄：…；性别：…；身份：…；口音：…；情绪底色：…；声线：…；语速：…；说话方式：…；音色特征：…",
        occurrences: "人类可读的出现范围",
        sourceChapterIds: ["chapter id"],
        appearances: [{
          ref: "资产内唯一形象引用",
          name: "必填的具体形象名称；按服装、身份或时期命名，禁止使用笼统的基础形象",
          description: "该形象与基础状态的差异",
          occurrences: "人类可读的出现范围",
          sourceChapterIds: ["chapter id"],
          prompt: "以完整视觉风格开头、可直接用于图片生成的中文提示词；角色采用自然站立的正面全身独立人设图，画面只呈现单个人物"
        }]
      }]
    }
  };
  return ["请执行影视资产提取，并直接返回最终 JSON 结果。", "不要复述、复制或改写输入剧本；不要返回任务说明、输入参数、规则或输出格式说明。", "本次仅提取：" + _0xfd37ca.map(_0x49dd12 => _0x29679c[_0x49dd12]).join("、") + "。", "返回 JSON 的顶层必须且只能包含 assets 字段。", "下面的 JSON 仅是待分析的输入数据，禁止在答案中复述：", "<story_input_json>", JSON.stringify(_0x2e9940), "</story_input_json>", "现在直接输出 {\"assets\":[...]}，不要输出输入内容。"].join("\n");
}
const STORY_ASSET_FORMAT_REPAIR_SYSTEM_PROMPT = ["你是严格的 JSON 结果修复器。", "只修复输入结果的 JSON 语法、字段名称、字段类型和必填字段，不重新分析剧本。", "不得返回原始请求、任务说明、校验说明或 Markdown。", "不得删除原结果中已经存在的资产；不得编造原结果无法支持的新人物、场景、道具或剧情事实。", "只返回一个顶层仅包含 assets 字段的严格 JSON 对象。"].join("\n");
function getStoryAssetExtractionFinishReason(_0x50f33d) {
  return normalizeText(_0x50f33d?.finishReason || _0x50f33d?.finish_reason || _0x50f33d?.choices?.[0]?.finish_reason || _0x50f33d?.data?.choices?.[0]?.finish_reason).toLowerCase();
}
function isStoryAssetExtractionInputEcho(_0x55f51c, _0x2795b0) {
  const _0x6e46da = normalizeText(getResultText(_0x55f51c));
  const _0x44df82 = normalizeText(_0x2795b0);
  if (!_0x6e46da || !_0x44df82) {
    return false;
  }
  if (_0x6e46da === _0x44df82) {
    return true;
  }
  const _0x38090e = _0x44df82.slice(0, 240);
  if (_0x38090e.length >= 120 && _0x6e46da.startsWith(_0x38090e)) {
    return true;
  }
  return _0x6e46da.includes("<story_input_json>") || /"task"\s*:\s*"extract_story_assets(?:_by_kind)?"/u.test(_0x6e46da) && /"project"\s*:/u.test(_0x6e46da) && /"outputSchema"\s*:/u.test(_0x6e46da);
}
function classifyStoryAssetExtractionRecovery(_0x6a53e0, _0x43194b, _0x506eb0) {
  const _0x1777eb = getStoryAssetExtractionFinishReason(_0x6a53e0);
  if (_0x1777eb === "length" || _0x1777eb === "max_tokens" || _0x1777eb === "max_output_tokens") {
    return {
      mode: "rerun",
      reason: "length"
    };
  }
  if (isStoryAssetExtractionInputEcho(_0x6a53e0, _0x506eb0)) {
    return {
      mode: "rerun",
      reason: "echo"
    };
  }
  const _0x3708ce = normalizeText(getResultText(_0x6a53e0));
  if (!_0x3708ce) {
    return {
      mode: "rerun",
      reason: "empty"
    };
  }
  if (/没有可用的(?:角色|场景|角色或场景)资产/u.test(normalizeText(_0x43194b?.message || _0x43194b)) && Math.max(0, Math.trunc(Number(_0x43194b?.raw?.returnedAssetCount) || 0)) === 0) {
    return {
      mode: "rerun",
      reason: "missing-assets"
    };
  }
  return {
    mode: "format-repair",
    reason: "invalid-structure"
  };
}
function buildStoryAssetExtractionFormatRepairPrompt({
  response: _0x12e4e1,
  error: _0x35d62a,
  assetKinds = STORY_ASSET_EXTRACTION_KINDS,
  chapterIds = [],
  outputContract = ""
} = {}) {
  return ["仅修复下面这份已返回结果的 JSON 格式和字段结构。", "不要重新分析剧本，不要复述原始请求，不要添加原结果中不存在的资产。", "允许的 kind：" + (normalizeStringArray(assetKinds).join("、") || STORY_ASSET_EXTRACTION_KINDS.join("、")) + "。", "允许的 sourceChapterIds：" + (normalizeStringArray(chapterIds).join("、") || "仅使用原结果已有值") + "。", "本地校验错误：" + (normalizeText(_0x35d62a?.message || _0x35d62a) || "返回格式不合格"), "目标结构：" + normalizeText(outputContract), "<rejected_response>", normalizeText(getResultText(_0x12e4e1)), "</rejected_response>", "输出前自行检查：顶层只能有 assets，JSON 必须闭合，所有必填字段必须存在。", "现在只返回修复后的 JSON。"].join("\n");
}
function buildStoryAssetExtractionRerunPrompt(_0x3875b8, _0x26b59b) {
  const _0x14def9 = _0x26b59b === "length" ? "上一次输出被截断，缺失内容无法通过格式修复恢复。" : _0x26b59b === "echo" ? "上一次错误地复述了输入，没有生成资产结果。" : "上一次没有返回可用的资产内容。";
  return [_0x14def9, "请重新执行当前这一类资产提取；这是唯一一次自动重试。", "输出前自行检查：不要复述输入，顶层只能有 assets，JSON 必须完整闭合。", _0x3875b8].join("\n");
}
async function requestStoryAssetExtractionResult({
  request: _0x482309,
  requestPayload: _0x4624d6,
  parse: _0x3521b8,
  outputContract: _0x467691,
  assetKinds: _0x4d974a,
  chapterIds: _0x144681,
  onProgress: _0x2ce332,
  automaticRecovery = false
}) {
  const _0x3fb35a = await _0x482309(_0x4624d6);
  try {
    return _0x3521b8(_0x3fb35a);
  } catch (_0x32ae8e) {
    if (!automaticRecovery) {
      throw _0x32ae8e;
    }
    const _0x331eb5 = classifyStoryAssetExtractionRecovery(_0x3fb35a, _0x32ae8e, _0x4624d6.prompt);
    const _0x2c13af = {
      character: "角色",
      scene: "场景",
      prop: "道具"
    };
    const _0x4afdd7 = normalizeStringArray(_0x4d974a).map(_0x3f60c9 => _0x2c13af[_0x3f60c9] || _0x3f60c9).join("、") || "资产";
    const _0x53ca94 = _0x331eb5.mode === "format-repair";
    _0x2ce332?.({
      stage: _0x53ca94 ? "repairing-assets" : "retrying-assets",
      current: 1,
      total: 1,
      message: _0x53ca94 ? _0x4afdd7 + "返回格式不合格，正在自动纠错（1/1）" : _0x4afdd7 + "返回内容不完整，正在仅重试当前类别（1/1）"
    });
    const _0x1fcf8f = _0x53ca94 ? {
      ..._0x4624d6,
      prompt: buildStoryAssetExtractionFormatRepairPrompt({
        response: _0x3fb35a,
        error: _0x32ae8e,
        assetKinds: _0x4d974a,
        chapterIds: _0x144681,
        outputContract: _0x467691
      }),
      systemPrompt: STORY_ASSET_FORMAT_REPAIR_SYSTEM_PROMPT,
      temperature: 0
    } : {
      ..._0x4624d6,
      prompt: buildStoryAssetExtractionRerunPrompt(_0x4624d6.prompt, _0x331eb5.reason),
      temperature: 0.1
    };
    const _0x2a2b76 = await _0x482309(_0x1fcf8f);
    try {
      return _0x3521b8(_0x2a2b76);
    } catch (_0xd38e4c) {
      const _0x916de = classifyStoryAssetExtractionRecovery(_0x2a2b76, _0xd38e4c, _0x1fcf8f.prompt);
      if (_0x916de.reason === "length") {
        const _0x3b9f9c = new Error("自动纠错后输出仍被截断。");
        _0x3b9f9c.type = "OUTPUT_LENGTH";
        _0x3b9f9c.cause = _0xd38e4c;
        throw _0x3b9f9c;
      }
      if (_0x916de.reason === "echo") {
        const _0x40c15d = new Error("自动纠错后模型仍在复述输入。");
        _0x40c15d.type = "INPUT_ECHO";
        _0x40c15d.cause = _0xd38e4c;
        throw _0x40c15d;
      }
      _0xd38e4c.automaticRecovery = {
        attempted: true,
        mode: _0x331eb5.mode,
        reason: _0x331eb5.reason
      };
      throw _0xd38e4c;
    }
  }
}
export async function extractStoryAssets({
  project = {},
  model = "",
  provider = "",
  providerProfileId = "",
  aspectRatio = "",
  visualStyle = "",
  assetKinds = STORY_ASSET_EXTRACTION_KINDS,
  requiredAssetNamesByKind = null,
  candidateAssetsByKind = null,
  requiredAssetsByKind = null,
  compactOutput = false,
  maxOutputTokens = 0,
  allowOversizedPrompt = false,
  automaticRecovery = false,
  structuredOutputFallback = "none",
  request = generateText,
  onProgress = null
} = {}) {
  assertPlanningModel(model, provider);
  const _0x27c815 = resolveStoryPlanningConstraints(project);
  const _0xb93246 = normalizeStoryProjectInput(project);
  _0xb93246.planning = _0x27c815;
  assertStoryProjectInput(_0xb93246);
  onProgress?.({
    stage: "extracting-assets",
    current: 1,
    total: 1,
    message: "正在提取角色、场景与道具"
  });
  const _0x166ec7 = buildStoryAssetExtractionPrompt({
    project: project,
    aspectRatio: aspectRatio,
    visualStyle: visualStyle,
    assetKinds: assetKinds,
    requiredAssetNamesByKind: requiredAssetNamesByKind,
    candidateAssetsByKind: candidateAssetsByKind,
    requiredAssetsByKind: requiredAssetsByKind,
    compactOutput: compactOutput
  });
  const _0x1c53d7 = _0xb93246.chapters.map(_0x37e0a9 => _0x37e0a9.id);
  const _0x31a548 = normalizeStringArray(assetKinds).filter(_0x2a4f94 => STORY_ASSET_EXTRACTION_KINDS.includes(_0x2a4f94));
  const _0xbd705b = _0x31a548.length === 1 && Array.isArray(requiredAssetNamesByKind?.[_0x31a548[0]]) && requiredAssetNamesByKind[_0x31a548[0]].length === 0;
  const _0x1975aa = compactOutput ? "assets[{clientKey,include,description,visualPrompt,voiceDescription}]" : "assets[{ref,kind(character|scene|prop),name,role(character: 主角|配角|反派|路人),description,voiceDescription(character: labeled 年龄/性别/身份/口音/情绪底色/声线/语速/说话方式/音色特征),occurrences,sourceChapterIds,appearances[{ref,name(required specific visual state),description,occurrences,sourceChapterIds,prompt}]}]";
  const _0x4554c3 = compactOutput ? createStoryAssetPromptContracts(assetKinds, requiredAssetNamesByKind, candidateAssetsByKind, requiredAssetsByKind, {
    includeClientKeys: true
  }).payload : {};
  const _0x523f2d = [...(_0x4554c3.requiredAssets || []), ...(_0x4554c3.candidateAssets || [])].map(_0x4e2743 => _0x4e2743.clientKey);
  return await requestStoryAssetExtractionResult({
    request: request,
    requestPayload: {
      model: normalizeText(model),
      provider: normalizeText(provider),
      ...buildStoryTextProviderProfilePayload(providerProfileId),
      prompt: _0x166ec7,
      systemPrompt: STORY_ASSET_EXTRACTION_SYSTEM_PROMPT,
      structuredOutput: createStoryAssetExtractionStructuredOutput({
        assetKinds: assetKinds,
        schema: compactOutput ? createStoryAssetCompactExtractionResponseSchema(assetKinds, _0x523f2d) : createStoryAssetExtractionResponseSchema(assetKinds),
        fallback: structuredOutputFallback,
        mode: compactOutput ? "compact" : "detailed"
      }),
      thinking: {
        type: "disabled"
      },
      temperature: 0.2,
      timeoutMs: STORY_TEXT_REQUEST_TIMEOUT_MS,
      ...(Math.trunc(Number(maxOutputTokens) || 0) > 0 ? {
        maxOutputTokens: Math.trunc(Number(maxOutputTokens))
      } : {}),
      ...(allowOversizedPrompt ? {
        allowOversizedPrompt: true
      } : {})
    },
    parse: _0x51412d => compactOutput ? parseStoryAssetCompactExtractionResult(_0x51412d, {
      assetKinds: assetKinds,
      chapterIds: _0x1c53d7,
      requiredAssetNamesByKind: requiredAssetNamesByKind,
      requiredAssetsByKind: requiredAssetsByKind,
      candidateAssetsByKind: candidateAssetsByKind,
      visualStyle: normalizeText(visualStyle) || _0xb93246.visualStyle
    }) : parseStoryAssetExtractionResult(_0x51412d, {
      chapterIds: _0x1c53d7,
      allowedKinds: assetKinds,
      allowEmptyResult: _0xbd705b
    }),
    outputContract: _0x1975aa,
    assetKinds: assetKinds,
    chapterIds: _0x1c53d7,
    onProgress: onProgress,
    automaticRecovery: automaticRecovery
  });
}
export const extractStoryAssetsParallel = createParallelStoryAssetExtractor({
  schemaVersion: STORY_ASSET_EXTRACTION_SCHEMA_VERSION,
  assetKinds: STORY_ASSET_EXTRACTION_KINDS,
  generateText: generateText,
  normalizeText: normalizeText,
  getResultText: getResultText,
  normalizeStoryProjectInput: normalizeStoryProjectInput,
  normalizeAssetReference: a173_0x3e308f,
  parseStoryAssetExtractionResult: parseStoryAssetExtractionResult,
  parseStoryAssetCompactExtractionResult: parseStoryAssetCompactExtractionResult,
  extractStoryAssets: extractStoryAssets
});
export function buildStoryEpisodePlanningPrompt({
  project = {},
  assets = [],
  constraints = {}
} = {}) {
  const _0x42af44 = normalizeStoryProjectInput(project);
  assertStoryProjectInput(_0x42af44);
  const _0x51edbc = Array.isArray(assets) ? assets.map(normalizePlanningAssetSummary).filter(_0x2f424b => _0x2f424b.name) : [];
  // 资产设定在分集大纲之后执行；空资产列表是合法的初始状态。
  const _0x33ef57 = resolveStoryPlanningConstraints(project, constraints);
  const _0x23ac95 = _0x33ef57.episodeCount;
  const _0x4866dc = Math.max(1, Math.ceil(_0x23ac95 * 0.9));
  return JSON.stringify({
    task: "plan_story_episodes",
    schemaVersion: STORY_PLANNING_SCHEMA_VERSION,
    project: _0x42af44,
    assets: _0x51edbc,
    constraints: _0x33ef57,
    requirements: ["目标规划约 " + _0x23ac95 + " 集，建议保持在 " + _0x4866dc + "-" + _0x23ac95 + " 集；不要求机械凑满，但不得超过 " + _0x23ac95 + " 集。", "先在内部完成全剧集数与主要剧情节点的分配，再输出分集；不得为了缩短输出而压缩中段或提前收束结局。", "只有故事容量确实不足时才可少于 " + _0x4866dc + " 集；模型输出限制不能作为大幅缩减集数的理由。", "后续每个视频片段的时长上限是 " + _0x33ef57.sceneMaxSeconds + " 秒；这不是整集时长限制。", "每集预计时长只能按该集必要剧情的自然表演时间估算；不设固定最低或最高集长，不得为接近某个秒数注水或删减必要剧情。", "覆盖完整故事起因、发展、高潮和结局，不遗漏结局。", "每集 sourceChapterIds 和 assetRefs 必须引用输入中真实存在的值。", "只规划分集，不生成 clips、分镜、镜头语言或视频提示词。"],
    outputSchema: {
      episodes: [{
        ref: "本次规划中的唯一引用",
        title: "分集标题",
        synopsis: "本集完整剧情摘要",
        sourceChapterIds: ["chapter id"],
        assetRefs: ["asset ref"],
        estimatedDurationSeconds: "可选；按本集必要剧情、对白、动作、反应和停顿自然估算的正数，不套固定集长"
      }]
    }
  });
}
export function parseStoryEpisodePlanningResult(_0xcf33d, {
  constraints = {},
  chapterIds = [],
  assetRefs = []
} = {}) {
  const _0x1827d3 = normalizeStoryPlanningConstraints(constraints);
  const _0x4267fd = parseStrictJson(getResultText(_0xcf33d), "Agent 未返回分集规划结果。");
  const _0x33db3f = new Set(normalizeStringArray(chapterIds));
  const _0x586b9a = new Set(normalizeStringArray(assetRefs));
  const _0x5efc2a = Array.isArray(_0x4267fd.episodes) ? _0x4267fd.episodes.map((_0x1b06b4, _0x3f37ed) => {
    const _0x3b0fb4 = normalizeText(_0x1b06b4?.title);
    const _0x5a5760 = normalizeText(_0x1b06b4?.synopsis);
    if (!_0x3b0fb4 || !_0x5a5760) {
      return null;
    }
    const _0x293f2f = normalizeStringArray(_0x1b06b4?.sourceChapterIds);
    const _0x333b8f = normalizeStringArray(_0x1b06b4?.assetRefs);
    if (_0x33db3f.size) {
      const _0x2a4d8b = _0x293f2f.filter(_0x35d23c => !_0x33db3f.has(_0x35d23c));
      if (_0x2a4d8b.length) {
        throw new Error("分集“" + _0x3b0fb4 + "”引用了不存在的章节：" + _0x2a4d8b.join("、") + "。");
      }
    }
    if (_0x586b9a.size) {
      assertKnownReferences(_0x333b8f, _0x586b9a, "分集“" + _0x3b0fb4 + "”");
    }
    const _0x5146b8 = normalizePositiveNumber(_0x1b06b4?.estimatedDurationSeconds || _0x1b06b4?.durationSeconds);
    return {
      ref: a173_0x3e308f(_0x1b06b4?.ref, "episode-" + (_0x3f37ed + 1)),
      title: _0x3b0fb4,
      synopsis: _0x5a5760,
      sourceChapterIds: _0x293f2f,
      assetRefs: _0x333b8f,
      ...(_0x5146b8 ? {
        estimatedDurationSeconds: _0x5146b8
      } : {})
    };
  }).filter(Boolean) : [];
  if (!_0x5efc2a.length) {
    throw new Error("Agent 返回结果没有可用分集。");
  }
  if (_0x5efc2a.length > _0x1827d3.episodeCount) {
    throw new Error("Agent 返回了 " + _0x5efc2a.length + " 集，超过 " + _0x1827d3.episodeCount + " 集上限。");
  }
  const _0x111755 = _0x5efc2a.map(_0x159e00 => _0x159e00.ref);
  if (new Set(_0x111755).size !== _0x111755.length) {
    throw new Error("Agent 返回了重复的分集引用。");
  }
  return {
    schemaVersion: STORY_PLANNING_SCHEMA_VERSION,
    constraints: _0x1827d3,
    episodes: _0x5efc2a
  };
}
export async function planStoryEpisodes({
  project = {},
  assets = [],
  constraints = {},
  model = "",
  provider = "",
  providerProfileId = "",
  request = generateText,
  onProgress = null
} = {}) {
  assertPlanningModel(model, provider);
  const _0x16e04a = normalizeStoryProjectInput(project);
  assertStoryProjectInput(_0x16e04a);
  const _0x40e1e5 = Array.isArray(assets) ? assets.map(normalizePlanningAssetSummary).filter(_0x2eadd1 => _0x2eadd1.name) : [];
  // 资产设定在分集大纲之后执行；空资产列表是合法的初始状态。
  const _0xdd7886 = resolveStoryPlanningConstraints(project, constraints);
  onProgress?.({
    stage: "planning-episodes",
    current: 1,
    total: 1,
    message: "正在规划分集"
  });
  const _0xfd8ec3 = buildStoryEpisodePlanningPrompt({
    project: _0x16e04a,
    assets: _0x40e1e5,
    constraints: _0xdd7886
  });
  return await requestStrictResult({
    request: request,
    requestPayload: {
      model: normalizeText(model),
      provider: normalizeText(provider),
      ...buildStoryTextProviderProfilePayload(providerProfileId),
      prompt: _0xfd8ec3,
      systemPrompt: STORY_EPISODE_PLANNING_SYSTEM_PROMPT,
      temperature: 0.35,
      timeoutMs: STORY_TEXT_REQUEST_TIMEOUT_MS,
      maxOutputTokens: STORY_TEXT_MAX_OUTPUT_TOKENS
    },
    parse: _0x5e4b1f => parseStoryEpisodePlanningResult(_0x5e4b1f, {
      constraints: _0xdd7886,
      chapterIds: _0x16e04a.chapters.map(_0x5d9a73 => _0x5d9a73.id),
      assetRefs: _0x40e1e5.map(_0x22ab2c => _0x22ab2c.ref)
    }),
    outputContract: "episodes (1-" + _0xdd7886.episodeCount + ") [{ref,title,synopsis,sourceChapterIds,assetRefs,estimatedDurationSeconds?}]"
  });
}
function buildStoryEpisodeSplitProjectContext(_0x4222db = {}, _0x1ae1e4 = {}, {
  sourceBeats = null
} = {}) {
  const _0x9313df = Array.isArray(sourceBeats);
  const _0x3fdf61 = new Set((Array.isArray(sourceBeats) ? sourceBeats : []).flatMap(_0x37174d => normalizeStringArray(_0x37174d?.characters)));
  const _0x149c38 = (Array.isArray(sourceBeats) ? sourceBeats : []).flatMap(_0x4f3bf9 => [_0x4f3bf9?.heading, _0x4f3bf9?.body]).map(normalizeText).filter(Boolean).join("\n");
  return {
    title: _0x1ae1e4.title,
    storyType: _0x1ae1e4.storyType,
    targetAudience: normalizeText(_0x4222db?.targetAudience),
    summary: _0x1ae1e4.summary,
    background: _0x1ae1e4.background,
    setting: _0x1ae1e4.setting,
    coreHook: normalizeText(_0x4222db?.coreHook),
    logline: _0x1ae1e4.logline,
    scriptMode: _0x1ae1e4.scriptMode,
    aspectRatio: _0x1ae1e4.aspectRatio,
    visualStyle: _0x1ae1e4.visualStyle,
    characters: Array.isArray(_0x4222db?.characters) ? _0x4222db.characters.map((_0x33677f, _0x43e253) => {
      const _0x3e41a9 = normalizeStorySummaryCharacter(_0x33677f, _0x43e253);
      if (!_0x3e41a9) {
        return null;
      }
      if (_0x9313df && !_0x3fdf61.has(_0x3e41a9.name) && !_0x149c38.includes(_0x3e41a9.name)) {
        return null;
      }
      const _0x5e6022 = {
        ref: _0x3e41a9.ref,
        name: _0x3e41a9.name,
        roleType: _0x3e41a9.roleType
      };
      return {
        ..._0x5e6022,
        coreTags: _0x3e41a9.coreTags,
        profile: _0x3e41a9.profile,
        motivation: _0x3e41a9.motivation,
        relationships: _0x3e41a9.relationships,
        personality: _0x3e41a9.personality,
        arc: _0x3e41a9.arc
      };
    }).filter(Boolean) : [],
    planning: _0x1ae1e4.planning
  };
}
function selectStoryEpisodeSplitAssets(_0x1e7f50 = [], _0x92d9a = {}) {
  const _0x2b2c77 = (Array.isArray(_0x1e7f50) ? _0x1e7f50 : []).map((_0x214be4, _0x4c8917) => ({
    asset: _0x214be4,
    normalized: normalizePlanningAssetSummary(_0x214be4, _0x4c8917)
  })).filter(({
    normalized: _0x2a8e6c
  }) => _0x2a8e6c.name);
  if (!_0x2b2c77.length) {
    return [];
  }
  const _0x33f727 = new Set([...normalizeStringArray(_0x92d9a?.assetRefs), ...normalizeStringArray(_0x92d9a?.assetIds)].map(_0x2a943a => a173_0x3e308f(_0x2a943a, "")).filter(Boolean));
  const _0x4699c6 = new Set((Array.isArray(_0x92d9a?.script?.scenes) ? _0x92d9a.script.scenes : []).map(_0x1c9d9d => a173_0x3e308f(_0x1c9d9d?.ref || _0x1c9d9d?.id, "")).filter(Boolean));
  const _0x4125ec = [_0x92d9a?.title, _0x92d9a?.synopsis, _0x92d9a?.hook, _0x92d9a?.script?.fullText, _0x92d9a?.fullScript, _0x92d9a?.scriptText, ...(Array.isArray(_0x92d9a?.script?.scenes) ? _0x92d9a.script.scenes.flatMap(_0x22f629 => [_0x22f629?.heading, ...(Array.isArray(_0x22f629?.characters) ? _0x22f629.characters : []), _0x22f629?.body]) : [])].map(normalizeText).filter(Boolean).join("\n");
  const _0x206fef = _0x2b2c77.filter(({
    asset: _0x2d9bee,
    normalized: _0x59ff7a
  }) => {
    const _0x2d9ff1 = [_0x2d9bee?.ref, _0x2d9bee?.planningRef, _0x2d9bee?.id, _0x59ff7a.ref].map(_0x55d841 => a173_0x3e308f(_0x55d841, "")).filter(Boolean);
    return _0x2d9ff1.some(_0x528c4b => _0x33f727.has(_0x528c4b)) || _0x59ff7a.name && _0x4125ec.includes(_0x59ff7a.name);
  });
  const _0x207686 = getStoryEpisodeReferenceAliases(_0x92d9a);
  const _0x38c382 = (_0x2bd7fd, _0x2128cb) => normalizeStringArray([...normalizeStringArray(_0x2bd7fd?.[_0x2128cb]), ...(Array.isArray(_0x2bd7fd?.appearances) ? _0x2bd7fd.appearances.flatMap(_0xe94d88 => normalizeStringArray(_0xe94d88?.[_0x2128cb])) : [])]);
  const _0x38baf3 = _0x2b2c77.filter(({
    normalized: _0x2a4bf8
  }) => _0x38c382(_0x2a4bf8, "sourceSceneRefs").some(_0x5469b8 => [..._0x4699c6].some(_0x519e10 => storyEpisodeSourceSceneRefsMatch(_0x5469b8, _0x519e10, _0x207686))));
  const _0x5556f6 = _0x2b2c77.filter(({
    normalized: _0x42162a
  }) => _0x38c382(_0x42162a, "sourceEpisodeRefs").some(_0x17f4f1 => _0x207686.includes(_0x17f4f1)));
  const _0x4b0644 = new Set();
  return [..._0x206fef, ..._0x38baf3, ..._0x5556f6].map(({
    normalized: _0x45e70b
  }) => _0x45e70b).filter(_0x1c5ee3 => {
    if (_0x4b0644.has(_0x1c5ee3.ref)) {
      return false;
    }
    _0x4b0644.add(_0x1c5ee3.ref);
    return true;
  });
}
function getStoryEpisodeReferenceAliases(_0x1643cc = {}) {
  return [...new Set([_0x1643cc?.id, _0x1643cc?.ref, _0x1643cc?.planningRef, _0x1643cc?.script?.episodeRef].map(_0x202ccd => a173_0x3e308f(_0x202ccd, "")).filter(Boolean))];
}
function storyEpisodeSourceSceneRefsMatch(_0xe5e392 = "", _0x2afcee = "", _0x55ab30 = []) {
  const _0x4fd284 = normalizeText(_0xe5e392);
  const _0x262934 = normalizeText(_0x2afcee);
  if (!_0x4fd284 || !_0x262934) {
    return false;
  }
  if (_0x4fd284 === _0x262934) {
    return true;
  }
  const _0x1439f5 = normalizeStringArray(_0x55ab30);
  const _0x1fcf15 = _0x258bd6 => {
    for (const _0x533917 of _0x1439f5) {
      const _0x52c928 = _0x533917 + ":";
      if (_0x258bd6.startsWith(_0x52c928)) {
        return _0x258bd6.slice(_0x52c928.length);
      }
    }
    return _0x258bd6;
  };
  return _0x1fcf15(_0x4fd284) === _0x1fcf15(_0x262934);
}
function storyAssetMatchesEpisode(_0x4feb5e = {}, _0x535c13 = []) {
  const _0x497e04 = normalizeStringArray(_0x4feb5e?.sourceEpisodeRefs);
  if (!_0x497e04.length) {
    return true;
  }
  const _0x1c44a3 = new Set(normalizeStringArray(_0x535c13));
  return _0x497e04.some(_0x22cee6 => _0x1c44a3.has(_0x22cee6));
}
function getStoryEpisodeSceneAssetCandidates(_0x3a488f = {}, _0x43e333 = [], {
  episodeRefs = []
} = {}) {
  return (Array.isArray(_0x43e333) ? _0x43e333 : []).filter(_0x468b1b => {
    if (_0x468b1b?.kind !== "scene") {
      return false;
    }
    if (!storyAssetMatchesEpisode(_0x468b1b, episodeRefs)) {
      return false;
    }
    const _0x176073 = normalizeStringArray(_0x468b1b?.sourceSceneRefs);
    return _0x176073.some(_0xc50fda => storyEpisodeSourceSceneRefsMatch(_0xc50fda, _0x3a488f?.ref, episodeRefs));
  });
}
function getStoryEpisodeBlueprintSceneAssetRefs(_0x218b35 = [], _0x45b757 = [], _0x71a66b = [], {
  episodeRefs = []
} = {}) {
  const _0x43f96f = new Map((Array.isArray(_0x45b757) ? _0x45b757 : []).map(_0x40ecd3 => [normalizeText(_0x40ecd3?.ref), _0x40ecd3]));
  const _0xb48745 = new Map();
  normalizeStringArray(_0x218b35).forEach(_0x449a06 => {
    const _0x16d2a3 = getStoryEpisodeSceneAssetCandidates(_0x43f96f.get(_0x449a06), _0x71a66b, {
      episodeRefs: episodeRefs
    });
    if (_0x16d2a3.length === 1) {
      _0xb48745.set(_0x449a06, normalizeText(_0x16d2a3[0]?.ref));
    }
  });
  return _0xb48745;
}
function assertStoryEpisodeSceneAssetCoverage(_0x32d771 = [], _0x2770ab = [], {
  episodeRefs = []
} = {}) {
  const _0x2f1f50 = (Array.isArray(_0x2770ab) ? _0x2770ab : []).filter(_0x3867dd => _0x3867dd?.kind === "scene");
  if (!_0x2f1f50.some(_0x5b5a06 => normalizeStringArray(_0x5b5a06?.sourceSceneRefs).length)) {
    return;
  }
  const _0xcfec51 = _0x32d771.filter(_0x4576b8 => !getStoryEpisodeSceneAssetCandidates(_0x4576b8, _0x2f1f50, {
    episodeRefs: episodeRefs
  }).length);
  if (_0xcfec51.length) {
    const _0x323f96 = _0xcfec51.map(_0x428b16 => normalizeStorySceneHeadingIdentity(_0x428b16?.heading) || normalizeText(_0x428b16?.heading)).filter(Boolean).join("、");
    throw new Error("场景资产未完整覆盖当前分集正文：" + (_0x323f96 || "存在未绑定场景") + "。请先重新提取场景资产；本次未调用模型。");
  }
  const _0x48a81b = _0x32d771.filter(_0x2fdbfe => getStoryEpisodeSceneAssetCandidates(_0x2fdbfe, _0x2f1f50, {
    episodeRefs: episodeRefs
  }).length > 1);
  if (_0x48a81b.length) {
    const _0x417e73 = _0x48a81b.map(_0x1a9163 => normalizeStorySceneHeadingIdentity(_0x1a9163?.heading) || normalizeText(_0x1a9163?.heading)).filter(Boolean).join("、");
    throw new Error("场景资产存在重复绑定：" + (_0x417e73 || "存在多重绑定场景") + "。请先重新提取场景资产；本次未调用模型。");
  }
}
function normalizeStoryEpisodeSplitContinuityEpisode(_0x155528 = null, {
  includeEnding = false
} = {}) {
  if (!_0x155528 || typeof _0x155528 !== "object") {
    return null;
  }
  const _0x17d0d7 = Array.isArray(_0x155528?.script?.scenes) ? _0x155528.script.scenes : [];
  const _0xfb8755 = _0x17d0d7.at(-1);
  const _0x403bb6 = normalizeText(_0x155528?.script?.fullText || _0x155528?.fullScript || _0x155528?.scriptText);
  return {
    number: Math.max(1, Math.trunc(Number(_0x155528?.number) || 1)),
    title: normalizeText(_0x155528?.title),
    synopsis: normalizeText(_0x155528?.synopsis),
    hook: normalizeText(_0x155528?.hook),
    ...(includeEnding && _0xfb8755 ? {
      endingScene: {
        heading: normalizeText(_0xfb8755?.heading),
        characters: normalizeStringArray(_0xfb8755?.characters),
        body: normalizeText(_0xfb8755?.body)
      }
    } : includeEnding && _0x403bb6 ? {
      endingExcerpt: _0x403bb6.slice(-1200)
    } : {})
  };
}
function normalizeStoryEpisodeClipDurationConstraints(_0x141b24 = null) {
  if (!_0x141b24 || typeof _0x141b24 !== "object") {
    return null;
  }
  const _0x301b4b = [...new Set((Array.isArray(_0x141b24.allowedSeconds) ? _0x141b24.allowedSeconds : []).map(_0x13a803 => normalizePositiveNumber(_0x13a803)).filter(Boolean))].sort((_0x4873f3, _0x558819) => _0x4873f3 - _0x558819);
  const _0x54ab41 = normalizePositiveNumber(_0x141b24.minSeconds) || _0x301b4b[0] || 0;
  const _0x2ee54d = normalizePositiveNumber(_0x141b24.maxSeconds) || _0x301b4b.at(-1) || 0;
  const _0x42b6cd = normalizePositiveNumber(_0x141b24.stepSeconds) || 0;
  if (!_0x54ab41 && !_0x2ee54d && !_0x42b6cd && !_0x301b4b.length) {
    return null;
  }
  return {
    minSeconds: _0x54ab41,
    maxSeconds: _0x2ee54d,
    stepSeconds: _0x42b6cd,
    allowedSeconds: _0x301b4b
  };
}
export function buildStoryEpisodeSplitPrompt({
  project = {},
  episode = {},
  assets = [],
  constraints = {}
} = {}) {
  const _0x37cc01 = normalizeStoryProjectInput(project);
  const _0x5964f3 = getStoryEpisodeSplitSourceSceneMetadata(episode);
  const _0x13a93b = {
    ref: a173_0x3e308f(episode?.ref || episode?.planningRef || episode?.id, "episode-1"),
    title: normalizeText(episode?.title),
    text: sanitizeStoryEpisodeSplitPromptText(episode?.script?.fullText || episode?.fullScript || episode?.scriptText || episode?.synopsis || episode?.content, episode),
    ...(_0x5964f3.length ? {
      sourceScenes: _0x5964f3
    } : {})
  };
  if (!_0x13a93b.title || !_0x13a93b.text) {
    throw new Error("分集缺少标题或正文，无法生成分镜脚本。");
  }
  const _0x50f7d6 = selectStoryEpisodeSplitAssets(assets, episode);
  if (!_0x50f7d6.some(_0x501017 => _0x501017.kind === "scene")) {
    throw new Error("分集缺少可用的场景资产，无法生成必需的片段场景设定。");
  }
  const _0x7b1639 = resolveStoryPlanningConstraints(project, constraints);
  const _0x4ad5c5 = resolveStoryPromptMode(project, constraints);
  const _0x3f3def = resolveStoryPromptModeClipMaxSeconds(_0x4ad5c5, _0x7b1639.sceneMaxSeconds);
  const _0x2b155b = createStoryEpisodeSplitPromptSceneCatalog(_0x50f7d6, _0x4ad5c5);
  const _0x3eb3bf = "每个 clip 的 shots 总时长不超过用户设置的 " + _0x3f3def + " 秒。";
  return JSON.stringify({
    task: "format_story_episode_as_compact_json",
    schemaVersion: STORY_EPISODE_SPLIT_SCHEMA_VERSION,
    scriptMode: _0x37cc01.scriptMode,
    ...(_0x4ad5c5 !== "seedance-2.0" ? {
      promptMode: _0x4ad5c5
    } : {}),
    episode: _0x13a93b,
    assets: _0x50f7d6.map(_0x60f278 => compactStoryEpisodePromptAsset(_0x60f278)),
    scenes: _0x2b155b,
    constraints: {
      clipMaxSeconds: _0x3f3def
    },
    requirements: [_0x3eb3bf, "完整覆盖正文从开头到结尾，对白逐字保留，原剧本明确标注的旁白也逐字保留，并保持剧情事件、因果、人物关系和结尾。整集总时长、片段数量与每片段的镜头数量由正文实际结构决定。" + STORY_EPISODE_SPLIT_GROUPING_GUIDANCE, STORY_EPISODE_SPLIT_ADAPTIVE_TIMING_GUIDANCE, STORY_EPISODE_SPLIT_DIALOGUE_SPEAKER_GUIDANCE, "assets 只包含本集已确认出场的角色、场景和道具；仅在当前镜头实际可见时使用对应资产，不得调用或编造其他集资产。", "" + STORY_EPISODE_SPLIT_VISUAL_GUIDANCE + STORY_EPISODE_SPLIT_CAMERA_GUIDANCE + "a 记录与当前画面同步的环境声、动作声和表演声。", _0x37cc01.scriptMode === STORY_SCRIPT_MODE_NARRATION ? STORY_EPISODE_SPLIT_NARRATION_MODE_GUIDANCE : STORY_EPISODE_SPLIT_PLOT_MODE_GUIDANCE, ...getStoryEpisodeTimelinePlanningRequirements(_0x4ad5c5)],
    outputFormat: isStoryContinuousTimelinePromptMode(_0x4ad5c5) ? "{\"clips\":[{\"s\":\"sceneCode\",\"shots\":[{\"d\":integerSeconds,\"startSec\":0,\"endSec\":integerSeconds,\"v\":\"visual\",\"c\":\"camera\",\"q\":\"dialogueOrEmpty\",\"o\":\"voiceoverOrEmpty\",\"a\":\"audioOrEmpty\"},{\"d\":integerSeconds,\"startSec\":previousEndSec,\"endSec\":integerSeconds,\"v\":\"nextVisual\",\"c\":\"nextCamera\",\"q\":\"dialogueOrEmpty\",\"o\":\"voiceoverOrEmpty\",\"a\":\"audioOrEmpty\"}]}]}" : "{\"clips\":[{\"s\":\"sceneCode\",\"shots\":[{\"d\":seconds,\"v\":\"visual\",\"c\":\"camera\",\"q\":\"dialogueOrEmpty\",\"o\":\"voiceoverOrEmpty\",\"a\":\"audioOrEmpty\"},{\"d\":seconds,\"v\":\"nextVisual\",\"c\":\"nextCamera\",\"q\":\"dialogueOrEmpty\",\"o\":\"voiceoverOrEmpty\",\"a\":\"audioOrEmpty\"}]}]}"
  });
}
function buildStoryEpisodeMinimalSplitPrompt({
  project = {},
  episode = {},
  assets = [],
  constraints = {}
} = {}) {
  const _0x900199 = normalizeStoryProjectInput(project);
  const _0x558782 = resolveStoryPlanningConstraints(project, constraints);
  const _0x5da712 = resolveStoryPromptMode(project, constraints);
  const _0x59640b = resolveStoryPromptModeClipMaxSeconds(_0x5da712, _0x558782.sceneMaxSeconds);
  const _0x31c367 = a173_0x3e308f(episode?.ref || episode?.planningRef || episode?.id, "episode-1");
  const _0x3a9b37 = normalizeText(episode?.title) || "本集";
  const _0x18790a = sanitizeStoryEpisodeSplitPromptText(episode?.script?.fullText || episode?.fullScript || episode?.scriptText || episode?.synopsis || episode?.content, episode);
  if (!_0x18790a) {
    throw new Error("分集缺少正文，无法生成分镜脚本。");
  }
  const _0x2b8b28 = selectStoryEpisodeSplitAssets(assets, episode);
  const _0x3928b9 = createStoryEpisodeSplitPromptSceneCatalog(_0x2b8b28, _0x5da712);
  if (!_0x3928b9.length) {
    throw new Error("分集缺少可用的场景资产，无法生成分镜脚本。");
  }
  return JSON.stringify({
    task: "split_story_episode",
    scriptMode: _0x900199.scriptMode,
    ...(_0x5da712 !== "seedance-2.0" ? {
      promptMode: _0x5da712
    } : {}),
    episode: {
      ref: _0x31c367,
      title: _0x3a9b37,
      text: _0x18790a,
      scenes: _0x3928b9
    },
    assets: _0x2b8b28.map(_0x38c1d1 => compactStoryEpisodePromptAsset(_0x38c1d1)),
    clipMaxSeconds: _0x59640b,
    instruction: ["按正文顺序完整拆分，场景变化时切换 s，原对白放 q。" + (_0x900199.scriptMode === STORY_SCRIPT_MODE_NARRATION ? STORY_EPISODE_SPLIT_NARRATION_MODE_GUIDANCE : STORY_EPISODE_SPLIT_PLOT_MODE_GUIDANCE) + STORY_EPISODE_SPLIT_DIALOGUE_SPEAKER_GUIDANCE + STORY_EPISODE_SPLIT_ADAPTIVE_TIMING_GUIDANCE + STORY_EPISODE_SPLIT_GROUPING_GUIDANCE + STORY_EPISODE_SPLIT_VISUAL_GUIDANCE + STORY_EPISODE_SPLIT_CAMERA_GUIDANCE, "assets 只包含本集已确认出场的角色、场景和道具；不得调用或编造其他集资产。", ...getStoryEpisodeTimelinePlanningRequirements(_0x5da712)].join("\n"),
    output: isStoryContinuousTimelinePromptMode(_0x5da712) ? "{\"clips\":[{\"s\":\"sceneCode\",\"shots\":[{\"d\":integerSeconds,\"startSec\":0,\"endSec\":integerSeconds,\"v\":\"cameraVisibleAction\",\"c\":\"cameraViewAndMovement\",\"q\":\"dialogueOrEmpty\",\"o\":\"voiceoverOrEmpty\",\"a\":\"audioOrEmpty\"},{\"d\":integerSeconds,\"startSec\":previousEndSec,\"endSec\":integerSeconds,\"v\":\"nextCameraVisibleAction\",\"c\":\"nextCameraViewAndMovement\",\"q\":\"dialogueOrEmpty\",\"o\":\"voiceoverOrEmpty\",\"a\":\"audioOrEmpty\"}]}]}" : "{\"clips\":[{\"s\":\"sceneCode\",\"shots\":[{\"d\":seconds,\"v\":\"cameraVisibleAction\",\"c\":\"cameraViewAndMovement\",\"q\":\"dialogueOrEmpty\",\"o\":\"voiceoverOrEmpty\",\"a\":\"audioOrEmpty\"},{\"d\":seconds,\"v\":\"nextCameraVisibleAction\",\"c\":\"nextCameraViewAndMovement\",\"q\":\"dialogueOrEmpty\",\"o\":\"voiceoverOrEmpty\",\"a\":\"audioOrEmpty\"}]}]}"
  });
}
export function buildStoryEpisodesSplitPrompt({
  project = {},
  episodes = [],
  assets = [],
  constraints = {}
} = {}) {
  const _0x9348aa = normalizeStoryProjectInput(project);
  const _0x249f84 = resolveStoryPlanningConstraints(project, constraints);
  const _0x1350f2 = resolveStoryPromptMode(project, constraints);
  const _0x56da34 = resolveStoryPromptModeClipMaxSeconds(_0x1350f2, _0x249f84.sceneMaxSeconds);
  const _0x31cd21 = (Array.isArray(episodes) ? episodes : []).map((_0x2a0aab, _0x8dcae3) => {
    const _0x19ffb3 = a173_0x3e308f(_0x2a0aab?.ref || _0x2a0aab?.planningRef || _0x2a0aab?.id, "episode-" + (_0x8dcae3 + 1));
    const _0x244e35 = normalizeText(_0x2a0aab?.title) || "第 " + (_0x8dcae3 + 1) + " 集";
    const _0x183f45 = sanitizeStoryEpisodeSplitPromptText(_0x2a0aab?.script?.fullText || _0x2a0aab?.fullScript || _0x2a0aab?.scriptText || _0x2a0aab?.synopsis || _0x2a0aab?.content, _0x2a0aab);
    if (!_0x183f45) {
      throw new Error("第 " + (_0x8dcae3 + 1) + " 集缺少正文，无法生成分镜脚本。");
    }
    const _0x58ba81 = selectStoryEpisodeSplitAssets(assets, _0x2a0aab);
    const _0x11dad1 = createStoryEpisodeSplitPromptSceneCatalog(_0x58ba81, _0x1350f2);
    if (!_0x11dad1.length) {
      throw new Error("第 " + (_0x8dcae3 + 1) + " 集缺少可用的场景资产，无法生成分镜脚本。");
    }
    return {
      ref: _0x19ffb3,
      title: _0x244e35,
      text: _0x183f45,
      assets: _0x58ba81.map(_0x4c176f => compactStoryEpisodePromptAsset(_0x4c176f)),
      scenes: _0x11dad1
    };
  });
  if (!_0x31cd21.length) {
    throw new Error("没有可生成分镜的分集。");
  }
  return JSON.stringify({
    task: "split_story_episodes",
    scriptMode: _0x9348aa.scriptMode,
    ...(_0x1350f2 !== "seedance-2.0" ? {
      promptMode: _0x1350f2
    } : {}),
    episodes: _0x31cd21,
    clipMaxSeconds: _0x56da34,
    instruction: ["按正文顺序完整拆分，场景变化时切换 s，原对白放 q。" + (_0x9348aa.scriptMode === STORY_SCRIPT_MODE_NARRATION ? STORY_EPISODE_SPLIT_NARRATION_MODE_GUIDANCE : STORY_EPISODE_SPLIT_PLOT_MODE_GUIDANCE) + STORY_EPISODE_SPLIT_DIALOGUE_SPEAKER_GUIDANCE + STORY_EPISODE_SPLIT_ADAPTIVE_TIMING_GUIDANCE + STORY_EPISODE_SPLIT_GROUPING_GUIDANCE + STORY_EPISODE_SPLIT_VISUAL_GUIDANCE + STORY_EPISODE_SPLIT_CAMERA_GUIDANCE, "每个 episode.assets 只包含该集已确认出场的角色、场景和道具；不得跨集调用资产。", ...getStoryEpisodeTimelinePlanningRequirements(_0x1350f2)].join("\n"),
    output: isStoryContinuousTimelinePromptMode(_0x1350f2) ? "{\"episodes\":[{\"episodeRef\":\"episodeRef\",\"clips\":[{\"s\":\"sceneCode\",\"shots\":[{\"d\":integerSeconds,\"startSec\":0,\"endSec\":integerSeconds,\"v\":\"cameraVisibleAction\",\"c\":\"cameraViewAndMovement\",\"q\":\"dialogueOrEmpty\",\"o\":\"voiceoverOrEmpty\",\"a\":\"audioOrEmpty\"},{\"d\":integerSeconds,\"startSec\":previousEndSec,\"endSec\":integerSeconds,\"v\":\"nextCameraVisibleAction\",\"c\":\"nextCameraViewAndMovement\",\"q\":\"dialogueOrEmpty\",\"o\":\"voiceoverOrEmpty\",\"a\":\"audioOrEmpty\"}]}]}]}" : "{\"episodes\":[{\"episodeRef\":\"episodeRef\",\"clips\":[{\"s\":\"sceneCode\",\"shots\":[{\"d\":seconds,\"v\":\"cameraVisibleAction\",\"c\":\"cameraViewAndMovement\",\"q\":\"dialogueOrEmpty\",\"o\":\"voiceoverOrEmpty\",\"a\":\"audioOrEmpty\"},{\"d\":seconds,\"v\":\"nextCameraVisibleAction\",\"c\":\"nextCameraViewAndMovement\",\"q\":\"dialogueOrEmpty\",\"o\":\"voiceoverOrEmpty\",\"a\":\"audioOrEmpty\"}]}]}]}"
  });
}
function buildStoryEpisodesSplitValidationPrompt({
  episodeRefs = [],
  result = "",
  promptMode = "seedance-2.0"
} = {}) {
  return ["任务：检查下面的批量分镜返回，并修复 JSON 语法、外层包装或字段名称。", "必须完整保留已有剧集、片段以及每个镜头原本所属的 clip，只修复格式，不改变 shots 数量或归属；不要重新创作。", "剧集引用：" + normalizeStringArray(episodeRefs).join("、"), isStoryContinuousTimelinePromptMode(promptMode) ? "必须保留每个 shot 的 startSec、endSec 和 d，只修复字段包装；不得删除或重算时间轴。" : "", isStoryContinuousTimelinePromptMode(promptMode) ? "返回格式：{\"episodes\":[{\"episodeRef\":\"episodeRef\",\"clips\":[{\"s\":\"sceneCode\",\"shots\":[{\"d\":integerSeconds,\"startSec\":0,\"endSec\":integerSeconds,\"v\":\"visual\",\"c\":\"camera\",\"q\":\"dialogueOrEmpty\",\"o\":\"voiceoverOrEmpty\",\"a\":\"audioOrEmpty\"}]}]}]}。" : "返回格式：{\"episodes\":[{\"episodeRef\":\"episodeRef\",\"clips\":[{\"s\":\"sceneCode\",\"shots\":[{\"d\":seconds,\"v\":\"visual\",\"c\":\"camera\",\"q\":\"dialogueOrEmpty\",\"o\":\"voiceoverOrEmpty\",\"a\":\"audioOrEmpty\"},{\"d\":seconds,\"v\":\"nextVisual\",\"c\":\"nextCamera\",\"q\":\"dialogueOrEmpty\",\"o\":\"voiceoverOrEmpty\",\"a\":\"audioOrEmpty\"}]}]}]}。示意中的两个 shot 只说明同一 clip 可以承载连续镜头，不代表固定数量。", "待检查结果：", String(result || "")].join("\n");
}
function buildStoryEpisodeSplitValidationPrompt({
  episodeRef = "",
  result = "",
  promptMode = "seedance-2.0"
} = {}) {
  return ["任务：检查下面这一集的分镜返回，并修复 JSON 语法、外层包装或字段名称。", "必须完整保留已有片段以及每个镜头原本所属的 clip，只修复格式，不改变 shots 数量或归属；不要重新创作。", "剧集引用：" + normalizeText(episodeRef), isStoryContinuousTimelinePromptMode(promptMode) ? "必须保留每个 shot 的 startSec、endSec 和 d，只修复字段包装；不得删除或重算时间轴。" : "", isStoryContinuousTimelinePromptMode(promptMode) ? "返回格式：{\"clips\":[{\"s\":\"sceneCode\",\"shots\":[{\"d\":integerSeconds,\"startSec\":0,\"endSec\":integerSeconds,\"v\":\"visual\",\"c\":\"camera\",\"q\":\"dialogueOrEmpty\",\"o\":\"voiceoverOrEmpty\",\"a\":\"audioOrEmpty\"}]}]}。" : "返回格式：{\"clips\":[{\"s\":\"sceneCode\",\"shots\":[{\"d\":seconds,\"v\":\"visual\",\"c\":\"camera\",\"q\":\"dialogueOrEmpty\",\"o\":\"voiceoverOrEmpty\",\"a\":\"audioOrEmpty\"},{\"d\":seconds,\"v\":\"nextVisual\",\"c\":\"nextCamera\",\"q\":\"dialogueOrEmpty\",\"o\":\"voiceoverOrEmpty\",\"a\":\"audioOrEmpty\"}]}]}。示意中的两个 shot 只说明同一 clip 可以承载连续镜头，不代表固定数量。", "待检查结果：", String(result || "")].join("\n");
}
function normalizeStoryEpisodeSplitSourceScenes(_0x5ce065 = {}) {
  const _0x586455 = getStoryEpisodeReferenceAliases(_0x5ce065)[0] || "episode-1";
  const _0x4b6bd9 = (Array.isArray(_0x5ce065?.script?.scenes) ? _0x5ce065.script.scenes : []).map((_0x5ea2a3, _0x4cf5a1) => ({
    ref: a173_0x3e308f(_0x5ea2a3?.ref || _0x5ea2a3?.id, _0x586455 + "-scene-" + (_0x4cf5a1 + 1)),
    heading: normalizeText(_0x5ea2a3?.heading),
    characters: normalizeStringArray(_0x5ea2a3?.characters),
    body: normalizeText(_0x5ea2a3?.body)
  })).filter(_0xe698c9 => _0xe698c9.heading || _0xe698c9.body);
  if (_0x4b6bd9.length) {
    return _0x4b6bd9;
  }
  const _0x1fc1a7 = normalizeText(_0x5ce065?.script?.fullText || _0x5ce065?.fullScript || _0x5ce065?.scriptText || _0x5ce065?.synopsis || _0x5ce065?.content);
  return splitStorySourceText(_0x1fc1a7, 4000).map((_0x222201, _0x2717f0) => ({
    ref: _0x586455 + "-source-section-" + (_0x2717f0 + 1),
    heading: (normalizeText(_0x5ce065?.title) || "本集") + "·文本段" + (_0x2717f0 + 1),
    characters: [],
    body: _0x222201
  }));
}
function splitStoryEpisodeSourceBeatLine(_0x2c6dff = "", _0x587a74 = 240) {
  const _0x58a771 = normalizeText(_0x2c6dff);
  if (!_0x58a771) {
    return [];
  }
  const _0xe11ac1 = Math.max(80, Math.trunc(Number(_0x587a74) || 240));
  if (_0x58a771.length <= _0xe11ac1) {
    return [_0x58a771];
  }
  const _0x17136c = _0x58a771.match(/^[^：:\r\n]{1,24}[：:]\s*/u)?.[0] || "";
  const _0x3bc626 = [];
  let _0x3d1a25 = _0x17136c ? _0x58a771.slice(_0x17136c.length).trim() : _0x58a771;
  const _0x4d3fc3 = Math.max(60, _0xe11ac1 - _0x17136c.length);
  while (_0x3d1a25.length > _0x4d3fc3) {
    const _0x1e1eaa = _0x3d1a25.slice(0, _0x4d3fc3 + 1);
    const _0x287538 = [..._0x1e1eaa.matchAll(/[。！？；.!?;]/gu)];
    const _0x12fb29 = _0x287538.map(_0x3d0cf1 => Number(_0x3d0cf1.index) + 1).filter(_0x180e90 => _0x180e90 >= Math.floor(_0x4d3fc3 * 0.45) && _0x180e90 <= _0x4d3fc3).at(-1);
    const _0x27a976 = _0x12fb29 || _0x4d3fc3;
    _0x3bc626.push("" + _0x17136c + _0x3d1a25.slice(0, _0x27a976).trim());
    _0x3d1a25 = _0x3d1a25.slice(_0x27a976).trim();
  }
  if (_0x3d1a25) {
    _0x3bc626.push("" + _0x17136c + _0x3d1a25);
  }
  return _0x3bc626.filter(Boolean);
}
function extractStoryEpisodeDialogueUnits(_0x47111c = "", _0x3f7119 = "source-beat", _0x2a1f98 = []) {
  const _0x291096 = [];
  const _0x334654 = normalizeStringArray(_0x2a1f98);
  const _0x341af6 = new Set(["旁白", "出场人物", "人物", "时间", "地点", "场景", "音效"]);
  String(_0x47111c || "").split(/\r?\n/u).forEach(_0x2e3edf => {
    const _0x24a0c4 = _0x2e3edf.trim();
    if (!_0x24a0c4) {
      return;
    }
    const _0x45145d = _0x24a0c4.match(/^([^：:\n]{1,20})[：:]\s*(.+)$/u);
    const _0x303321 = normalizeText(_0x45145d?.[1]).replace(/\s*[（(][^）)]*[）)]\s*$/u, "");
    const _0x299cdb = _0x24a0c4.search(/[“「『"]/u);
    const _0x44200c = _0x299cdb >= 0 ? _0x24a0c4.slice(0, _0x299cdb) : "";
    const _0x370466 = _0x334654.filter(_0x72973d => _0x72973d && _0x44200c.includes(_0x72973d));
    const _0xeff259 = _0x334654.includes(_0x303321) ? _0x303321 : _0x370466.length === 1 ? _0x370466[0] : _0x303321 && !_0x341af6.has(_0x303321) && !/(?:说道|问道|答道|喊道|叫道|叫住[他她]|开口|低声道|高声道|轻声道|冷声道|厉声道|喃喃道|嘀咕道)$/u.test(_0x303321) ? _0x303321 : "";
    const _0x42b1f9 = [];
    const _0x3e09ff = /“([^”\n]+)”|「([^」\n]+)」|『([^』\n]+)』|"([^"\n]+)"/gu;
    for (const _0x414ea9 of _0x24a0c4.matchAll(_0x3e09ff)) {
      const _0x363deb = normalizeText(_0x414ea9[1] || _0x414ea9[2] || _0x414ea9[3] || _0x414ea9[4]);
      if (_0x363deb) {
        _0x42b1f9.push({
          text: _0x363deb,
          sourceOffset: Number(_0x414ea9.index) || 0
        });
      }
    }
    if (_0x42b1f9.length) {
      _0x291096.push(..._0x42b1f9.map(_0x8b6334 => ({
        ..._0x8b6334,
        ...(_0xeff259 ? {
          speaker: _0xeff259
        } : {})
      })));
      return;
    }
    if (!_0x45145d) {
      return;
    }
    const _0x50e2d4 = _0xeff259;
    const _0x585774 = normalizeText(_0x45145d[2]).replace(/^(?:(?:（[^）]*）|\([^)]*\))\s*)+/u, "").trim();
    if (!_0x50e2d4 || !_0x585774 || _0x341af6.has(_0x50e2d4)) {
      return;
    }
    _0x291096.push({
      speaker: _0x50e2d4,
      text: _0x585774,
      sourceOffset: 0
    });
  });
  return _0x291096.map((_0x1fd030, _0x3335e5) => ({
    ref: _0x3f7119 + "-dialogue-" + (_0x3335e5 + 1),
    ...(_0x1fd030.speaker ? {
      speaker: _0x1fd030.speaker
    } : {}),
    text: _0x1fd030.text
  }));
}
function createStoryEpisodeSourceBeat({
  ref = "",
  sourceSceneRef = "",
  order = 0,
  heading = "",
  characters = [],
  body = ""
} = {}) {
  const _0x534f5a = normalizeText(ref);
  const _0x4d108c = normalizeText(body);
  return {
    ref: _0x534f5a,
    sourceSceneRef: sourceSceneRef,
    order: order,
    heading: heading,
    characters: characters,
    body: _0x4d108c,
    dialogueUnits: extractStoryEpisodeDialogueUnits(_0x4d108c, _0x534f5a, characters)
  };
}
export function normalizeStoryEpisodeSplitSourceBeats(_0x104800 = {}) {
  const _0x5437b8 = normalizeStoryEpisodeSplitSourceScenes(_0x104800);
  const _0x379342 = [];
  _0x5437b8.forEach(_0x1c860a => {
    const _0x10a010 = normalizeText(_0x1c860a.body).split(/\r?\n/u).map(normalizeText).filter(Boolean).flatMap(_0x3640a4 => splitStoryEpisodeSourceBeatLine(_0x3640a4));
    const _0x516c64 = _0x10a010.length ? _0x10a010 : [normalizeText(_0x1c860a.heading)].filter(Boolean);
    _0x516c64.forEach((_0x54344e, _0x17362d) => {
      _0x379342.push(createStoryEpisodeSourceBeat({
        ref: _0x1c860a.ref + "-beat-" + (_0x17362d + 1),
        sourceSceneRef: _0x1c860a.ref,
        order: _0x379342.length + 1,
        heading: _0x1c860a.heading,
        characters: _0x1c860a.characters,
        body: _0x54344e
      }));
    });
  });
  if (!_0x379342.length) {
    throw new Error("实验分批拆分没有找到可用的原文块。");
  }
  const _0x5f24ba = _0x379342.map(_0x3bbf98 => _0x3bbf98.ref);
  if (new Set(_0x5f24ba).size !== _0x5f24ba.length) {
    throw new Error("实验分批拆分生成了重复的原文块引用。");
  }
  return _0x379342;
}
export function normalizeStoryEpisodeExperimentalSourceBeats(_0x46860b = {}) {
  const _0x5ecdcc = normalizeStoryEpisodeSplitSourceBeats(_0x46860b);
  if (_0x5ecdcc.length <= STORY_EPISODE_EXPERIMENTAL_MAX_PLANS_PER_BATCH * 2) {
    return _0x5ecdcc;
  }
  const _0x3ea185 = normalizeStoryEpisodeSplitSourceScenes(_0x46860b);
  const _0x20a360 = [];
  _0x3ea185.forEach(_0x28563c => {
    const _0x7a3ee8 = normalizeText(_0x28563c.body).split(/\r?\n/u).map(normalizeText).filter(Boolean).flatMap(_0x2f0835 => splitStoryEpisodeSourceBeatLine(_0x2f0835, STORY_EPISODE_EXPERIMENTAL_SOURCE_BEAT_MAX_CHARACTERS));
    const _0x522ba9 = _0x7a3ee8.length ? _0x7a3ee8 : [normalizeText(_0x28563c.heading)].filter(Boolean);
    let _0x182090 = [];
    let _0x10983d = 0;
    const _0x273b47 = () => {
      if (!_0x182090.length) {
        return;
      }
      const _0x5980a0 = _0x20a360.filter(_0x224e52 => _0x224e52.sourceSceneRef === _0x28563c.ref).length + 1;
      const _0x396468 = _0x28563c.ref + "-semantic-beat-" + _0x5980a0;
      _0x20a360.push(createStoryEpisodeSourceBeat({
        ref: _0x396468,
        sourceSceneRef: _0x28563c.ref,
        order: _0x20a360.length + 1,
        heading: _0x28563c.heading,
        characters: _0x28563c.characters,
        body: _0x182090.join("\n")
      }));
      _0x182090 = [];
      _0x10983d = 0;
    };
    _0x522ba9.forEach(_0x520d55 => {
      const _0x5341fb = _0x10983d + (_0x182090.length ? 1 : 0) + _0x520d55.length;
      if (_0x182090.length && _0x5341fb > STORY_EPISODE_EXPERIMENTAL_SOURCE_BEAT_MAX_CHARACTERS) {
        _0x273b47();
      }
      _0x182090.push(_0x520d55);
      _0x10983d += (_0x182090.length > 1 ? 1 : 0) + _0x520d55.length;
      if (_0x10983d >= STORY_EPISODE_EXPERIMENTAL_SOURCE_BEAT_TARGET_CHARACTERS) {
        _0x273b47();
      }
    });
    _0x273b47();
  });
  if (!_0x20a360.length) {
    throw new Error("实验分批拆分没有找到可用的语义原文块。");
  }
  return _0x20a360;
}
function normalizeStoryEpisodeSplitBlueprintAssetRefs(_0x50fd3d, {
  assetsByRef = new Map(),
  kind = "",
  label = "片段计划"
} = {}) {
  return normalizeStringArray(_0x50fd3d).map(_0x1db64c => {
    const _0x47c5b9 = assetsByRef.get(_0x1db64c);
    if (!_0x47c5b9 || kind && _0x47c5b9.kind !== kind) {
      throw new Error(label + " 引用了无效的" + (kind === "character" ? "角色" : kind === "prop" ? "道具" : "") + "资产“" + _0x1db64c + "”。");
    }
    return _0x1db64c;
  });
}
export function parseStoryEpisodeSplitBlueprint(_0x244b7d, {
  episodeRef = "",
  episodeRefs = [],
  sourceScenes = [],
  sourceBeats = [],
  assets = [],
  constraints = {},
  enforceMaxDuration = true,
  includeDirectorContinuity = false
} = {}) {
  const _0xddfa6e = parseStrictJson(getResultText(_0x244b7d), "Agent 未返回分镜蓝图。");
  const _0x212eec = a173_0x3e308f(episodeRef, "episode-1");
  if (a173_0x3e308f(_0xddfa6e?.episodeRef, "") !== _0x212eec) {
    throw new Error("Agent 返回的分镜蓝图与当前分集不一致。");
  }
  const _0x48c34d = normalizeStoryPlanningConstraints(constraints);
  const _0x499679 = new Set((Array.isArray(sourceScenes) ? sourceScenes : []).map(_0x447ce9 => normalizeText(_0x447ce9?.ref)));
  const _0x3824f9 = new Map((Array.isArray(sourceScenes) ? sourceScenes : []).map(_0x18362a => [normalizeText(_0x18362a?.ref), _0x18362a]));
  const _0x131a15 = Array.isArray(sourceBeats) ? sourceBeats : [];
  const _0x3fb778 = new Map(_0x131a15.map(_0x3757fc => [normalizeText(_0x3757fc?.ref), _0x3757fc]));
  if (!_0x3fb778.size || _0x3fb778.size !== _0x131a15.length) {
    throw new Error("实验分批拆分缺少唯一、有效的原文块引用。");
  }
  const _0x2cb24d = new Map((Array.isArray(assets) ? assets : []).map(_0x5a8096 => [normalizeText(_0x5a8096?.ref), _0x5a8096]));
  const _0x3a6f55 = (Array.isArray(_0xddfa6e?.clipPlans) ? _0xddfa6e.clipPlans : []).map((_0x4b3a5b, _0x4368c3) => {
    const _0x32707c = "片段计划 " + (_0x4368c3 + 1);
    const _0x4e054d = a173_0x3e308f(_0x4b3a5b?.ref, _0x212eec + "-plan-" + (_0x4368c3 + 1));
    const _0x204dbe = (Array.isArray(_0x4b3a5b?.sourceBeatRefs) ? _0x4b3a5b.sourceBeatRefs : []).map(normalizeText).filter(Boolean);
    const _0x2bfcd2 = normalizeText(_0x4b3a5b?.beat);
    const _0x44bc0b = normalizeText(_0x4b3a5b?.time);
    const _0x279e41 = normalizeText(_0x4b3a5b?.entryState);
    const _0x4e8c23 = normalizeText(_0x4b3a5b?.exitState);
    const _0x49181a = normalizeText(_0x4b3a5b?.openingShotIntent);
    const _0x14c060 = normalizeText(_0x4b3a5b?.closingShotIntent);
    const _0x5ba32a = normalizeText(_0x4b3a5b?.continuityNotes) || "以相邻计划的 exitState 和 entryState 保持连续。";
    const _0xbc321 = normalizePositiveNumber(_0x4b3a5b?.targetDurationSec);
    if (!_0x204dbe.length || new Set(_0x204dbe).size !== _0x204dbe.length) {
      throw new Error(_0x32707c + " 缺少唯一、有效的 sourceBeatRefs。");
    }
    const _0x3bb608 = _0x204dbe.find(_0x156f6c => !_0x3fb778.has(_0x156f6c));
    if (_0x3bb608) {
      throw new Error(_0x32707c + " 引用了不存在的原文块“" + _0x3bb608 + "”。");
    }
    const _0x491474 = [...new Set(_0x204dbe.map(_0x4ad289 => normalizeText(_0x3fb778.get(_0x4ad289)?.sourceSceneRef)))];
    if (_0x491474.length !== 1 || !_0x499679.has(_0x491474[0])) {
      throw new Error(_0x32707c + " 的 sourceBeatRefs 跨越或缺少有效场景。");
    }
    const _0x2468e3 = normalizeText(_0x4b3a5b?.sourceSceneRef);
    const _0x518ff1 = _0x2468e3 || _0x491474[0];
    if (_0x518ff1 !== _0x491474[0]) {
      throw new Error(_0x32707c + " 的 sourceSceneRef 与 sourceBeatRefs 不一致。");
    }
    const _0x463e35 = getStoryEpisodeSceneAssetCandidates(_0x3824f9.get(_0x518ff1), assets, {
      episodeRefs: episodeRefs
    });
    const _0x8f0abb = normalizeText(_0x4b3a5b?.sceneAssetRef) || (_0x463e35.length === 1 ? normalizeText(_0x463e35[0]?.ref) : "");
    const _0x457020 = _0x2cb24d.get(_0x8f0abb);
    if (!_0x4e054d) {
      throw new Error(_0x32707c + " 缺少有效的 ref。");
    }
    if (!_0x457020 || _0x457020.kind !== "scene") {
      throw new Error(_0x32707c + " 缺少有效的 sceneAssetRef。");
    }
    const _0x2621de = normalizeStringArray((Array.isArray(_0x457020?.appearances) ? _0x457020.appearances : []).map(_0x4cebfb => _0x4cebfb?.ref));
    const _0x428da5 = normalizeText(_0x4b3a5b?.sceneAppearanceRef);
    const _0x117951 = _0x2621de.length ? _0x428da5 : "";
    if (_0x2621de.length && !_0x2621de.includes(_0x117951)) {
      throw new Error(_0x32707c + " 缺少有效的 sceneAppearanceRef。");
    }
    if (!_0x2bfcd2 || !_0x279e41 || !_0x4e8c23) {
      throw new Error(_0x32707c + " 缺少 beat、entryState 或 exitState。");
    }
    if (includeDirectorContinuity && (!_0x49181a || !_0x14c060)) {
      throw new Error(_0x32707c + " 缺少 openingShotIntent 或 closingShotIntent。");
    }
    if (!_0xbc321 || enforceMaxDuration && _0xbc321 > _0x48c34d.sceneMaxSeconds) {
      throw new Error(enforceMaxDuration ? _0x32707c + " 的 targetDurationSec 必须大于 0 且不超过 " + _0x48c34d.sceneMaxSeconds + " 秒。" : _0x32707c + " 的 targetDurationSec 必须大于 0。");
    }
    const _0x581890 = _0x204dbe.flatMap(_0x45656f => {
      const _0x53d523 = _0x3fb778.get(_0x45656f);
      if (Array.isArray(_0x53d523?.dialogueUnits)) {
        return _0x53d523.dialogueUnits;
      } else {
        return [];
      }
    }).map(_0x4f8f39 => ({
      ref: normalizeText(_0x4f8f39?.ref),
      ...(normalizeText(_0x4f8f39?.speaker) ? {
        speaker: normalizeText(_0x4f8f39.speaker)
      } : {}),
      text: normalizeText(_0x4f8f39?.text)
    })).filter(_0x1130d0 => _0x1130d0.ref && _0x1130d0.text);
    return {
      ref: _0x4e054d,
      sourceSceneRef: _0x518ff1,
      sourceBeatRefs: _0x204dbe,
      beat: _0x2bfcd2,
      sceneAssetRef: _0x8f0abb,
      sceneAppearanceRef: _0x117951,
      time: _0x44bc0b,
      entryState: _0x279e41,
      exitState: _0x4e8c23,
      ...(includeDirectorContinuity ? {
        openingShotIntent: _0x49181a,
        closingShotIntent: _0x14c060
      } : {}),
      continuityNotes: _0x5ba32a,
      characterAssetRefs: normalizeStoryEpisodeSplitBlueprintAssetRefs(_0x4b3a5b?.characterAssetRefs, {
        assetsByRef: _0x2cb24d,
        kind: "character",
        label: _0x32707c
      }),
      propAssetRefs: normalizeStoryEpisodeSplitBlueprintAssetRefs(_0x4b3a5b?.propAssetRefs, {
        assetsByRef: _0x2cb24d,
        kind: "prop",
        label: _0x32707c
      }),
      dialogueUnits: _0x581890,
      targetDurationSec: _0xbc321
    };
  });
  if (!_0x3a6f55.length) {
    throw new Error("Agent 返回的分镜蓝图没有可用片段计划。");
  }
  const _0x2164c4 = _0x3a6f55.map(_0x6bc958 => _0x6bc958.ref);
  if (new Set(_0x2164c4).size !== _0x2164c4.length) {
    throw new Error("Agent 返回了重复的片段计划引用。");
  }
  const _0xd821a2 = _0x131a15.map(_0x3a0e65 => normalizeText(_0x3a0e65?.ref));
  const _0x23a48c = _0x3a6f55.flatMap(_0x106a6e => _0x106a6e.sourceBeatRefs);
  if (_0xd821a2.length !== _0x23a48c.length || _0xd821a2.some((_0x42e2db, _0x2137b3) => _0x42e2db !== _0x23a48c[_0x2137b3])) {
    throw new Error("Agent 分镜蓝图未按原文顺序完整且唯一地覆盖全部 sourceBeats。");
  }
  return {
    episodeRef: _0x212eec,
    clipPlans: _0x3a6f55
  };
}
function createLocalStoryEpisodeSplitBlueprint({
  episodeRef = "",
  episodeRefs = [],
  sourceScenes = [],
  sourceBeats = [],
  assets = [],
  includeDirectorContinuity = false
} = {}) {
  const _0x5d330d = a173_0x3e308f(episodeRef, "episode-1");
  const _0x5ce0f8 = new Map((Array.isArray(sourceScenes) ? sourceScenes : []).map(_0x404f56 => [normalizeText(_0x404f56?.ref), _0x404f56]));
  const _0x4c49d9 = (Array.isArray(assets) ? assets : []).filter(_0x2e7517 => _0x2e7517?.kind === "scene");
  const _0x33d0c7 = (Array.isArray(assets) ? assets : []).filter(_0x3d2d71 => _0x3d2d71?.kind === "character");
  const _0x16eed5 = (Array.isArray(assets) ? assets : []).filter(_0x581f89 => _0x581f89?.kind === "prop");
  const _0x12cf7c = _0x4c49d9.some(_0x4af3b0 => normalizeStringArray(_0x4af3b0?.sourceSceneRefs).length);
  const _0x3346c9 = (Array.isArray(sourceBeats) ? sourceBeats : []).map((_0x1cac5c, _0x70fa5b) => {
    const _0x117fdf = normalizeText(_0x1cac5c?.sourceSceneRef);
    const _0x63535b = _0x5ce0f8.get(_0x117fdf) || {};
    const _0x5b7897 = _0x12cf7c ? getStoryEpisodeSceneAssetCandidates(_0x63535b, _0x4c49d9, {
      episodeRefs: episodeRefs
    })[0] : _0x4c49d9.find(_0x23483a => storySceneIdentitiesOverlap(_0x23483a?.name, _0x63535b?.heading)) || _0x4c49d9[0];
    if (!_0x5b7897) {
      throw new Error("无法为场景“" + (normalizeText(_0x63535b?.heading) || _0x117fdf) + "”建立本地分镜蓝图。");
    }
    const _0x1c2c47 = Array.isArray(_0x5b7897?.appearances) ? _0x5b7897.appearances : [];
    const _0x4f7901 = _0x1c2c47.find(_0x375130 => normalizeStringArray(_0x375130?.sourceSceneRefs).some(_0x58ab0d => storyEpisodeSourceSceneRefsMatch(_0x58ab0d, _0x117fdf, episodeRefs))) || _0x1c2c47.find(_0x7fca71 => normalizeText(_0x7fca71?.ref) === normalizeText(_0x5b7897?.baseAppearanceRef)) || _0x1c2c47[0];
    const _0x4683b1 = normalizeText(_0x1cac5c?.body || _0x63535b?.body || _0x63535b?.heading);
    const _0x17f599 = new Set([...normalizeStringArray(_0x63535b?.characters), ...normalizeStringArray(_0x1cac5c?.characters)]);
    const _0x53dcee = _0x33d0c7.filter(_0x543212 => _0x17f599.has(_0x543212.name) || _0x4683b1.includes(_0x543212.name)).map(_0x586dd3 => _0x586dd3.ref);
    const _0x350bd3 = _0x16eed5.filter(_0x302fcb => _0x302fcb.name && _0x4683b1.includes(_0x302fcb.name)).map(_0x55b37a => _0x55b37a.ref);
    const _0xf6a935 = normalizeText(_0x63535b?.heading || _0x1cac5c?.heading);
    const _0x5a7d64 = _0x4683b1.slice(0, 120) || _0xf6a935 || "原文块 " + (_0x70fa5b + 1);
    return {
      ref: _0x5d330d + "-local-plan-" + (_0x70fa5b + 1),
      sourceSceneRef: _0x117fdf,
      sourceBeatRefs: [normalizeText(_0x1cac5c?.ref)],
      beat: _0x4683b1,
      sceneAssetRef: _0x5b7897.ref,
      sceneAppearanceRef: normalizeText(_0x4f7901?.ref),
      entryState: "从原文动作起点进入：" + _0x5a7d64,
      exitState: "完整呈现该原文块后结束：" + _0x5a7d64,
      ...(includeDirectorContinuity ? {
        openingShotIntent: "根据当前剧情、表演重点和相邻画面自主选择开场镜头。",
        closingShotIntent: "根据当前动作结果与情绪落点自主选择结束镜头。"
      } : {}),
      continuityNotes: "严格保持原文顺序、人物状态、场景方位和动作承接。",
      characterAssetRefs: _0x53dcee,
      propAssetRefs: _0x350bd3,
      dialogueUnits: Array.isArray(_0x1cac5c?.dialogueUnits) ? _0x1cac5c.dialogueUnits.map(_0x3cea8b => ({
        ..._0x3cea8b
      })) : [],
      targetDurationSec: Math.max(4, Math.ceil([..._0x4683b1].length / 8))
    };
  });
  if (!_0x3346c9.length) {
    throw new Error("无法从原文建立本地分镜蓝图。");
  }
  return {
    episodeRef: _0x5d330d,
    clipPlans: _0x3346c9
  };
}
function distributeStoryEpisodePlanDurationTargets(_0x29a258 = [], _0x5b1280 = 0) {
  const _0x574375 = Array.isArray(_0x29a258) ? _0x29a258 : [];
  const _0x12a1de = normalizePositiveNumber(_0x5b1280);
  if (!_0x574375.length || !_0x12a1de) {
    return _0x574375;
  }
  const _0xaf3df4 = _0x574375.map(_0x5baba2 => normalizePositiveNumber(_0x5baba2?.targetDurationSec) || 1);
  const _0x13aeba = _0xaf3df4.reduce((_0x205b8c, _0x43693a) => _0x205b8c + _0x43693a, 0);
  let _0x16a306 = 0;
  return _0x574375.map((_0x10459e, _0x173ea2) => {
    const _0x298cb8 = _0x173ea2 === _0x574375.length - 1 ? Number((_0x12a1de - _0x16a306).toFixed(1)) : Number((_0x12a1de * (_0xaf3df4[_0x173ea2] / _0x13aeba)).toFixed(1));
    _0x16a306 = Number((_0x16a306 + _0x298cb8).toFixed(1));
    return {
      ..._0x10459e,
      targetDurationSec: Math.max(0.1, _0x298cb8)
    };
  });
}
function reconcileStoryEpisodeSplitBlueprintTiming(_0x21df5c = {}, _0x172308 = {}) {
  const _0x4cd275 = resolveStoryEpisodeSplitTimingBudget(_0x172308);
  const _0x45da6a = Array.isArray(_0x21df5c?.clipPlans) ? _0x21df5c.clipPlans : [];
  if (!_0x4cd275 || !_0x45da6a.length) {
    return _0x21df5c;
  }
  const _0x325ac2 = _0x45da6a.reduce((_0x1411b4, _0x5dae5c) => _0x1411b4 + (normalizePositiveNumber(_0x5dae5c?.targetDurationSec) || 0), 0);
  const _0xa6910a = _0x4cd275.allowedProductionRangeSeconds;
  if (_0x325ac2 >= _0xa6910a.minimum && _0x325ac2 <= _0xa6910a.maximum) {
    return _0x21df5c;
  }
  const _0x2e8520 = new Map(_0x4cd275.sceneTimings.map(_0x391c35 => [normalizeText(_0x391c35?.sceneRef), _0x391c35]));
  const _0x44fc83 = [...new Set(_0x45da6a.map(_0x47a1d6 => normalizeText(_0x47a1d6?.sourceSceneRef)))];
  const _0x2d58cf = _0x44fc83.length && _0x44fc83.every(_0x8ab6e8 => _0x2e8520.has(_0x8ab6e8));
  let _0x5922a1;
  if (_0x2d58cf) {
    const _0x4752da = new Map();
    _0x45da6a.forEach(_0x2d80f6 => {
      const _0x438fcb = normalizeText(_0x2d80f6?.sourceSceneRef);
      const _0x3fe77f = _0x4752da.get(_0x438fcb) || [];
      _0x3fe77f.push(_0x2d80f6);
      _0x4752da.set(_0x438fcb, _0x3fe77f);
    });
    const _0x1dc848 = new Map();
    _0x4752da.forEach((_0xb241cf, _0x478a2d) => {
      distributeStoryEpisodePlanDurationTargets(_0xb241cf, _0x2e8520.get(_0x478a2d)?.totalSeconds).forEach(_0x4779f8 => _0x1dc848.set(_0x4779f8.ref, _0x4779f8));
    });
    _0x5922a1 = _0x45da6a.map(_0x11cd18 => _0x1dc848.get(_0x11cd18.ref) || _0x11cd18);
  } else {
    _0x5922a1 = distributeStoryEpisodePlanDurationTargets(_0x45da6a, _0x4cd275.targetDurationSeconds);
  }
  return {
    ..._0x21df5c,
    clipPlans: _0x5922a1
  };
}
export function buildStoryEpisodeSplitBlueprintPrompt({
  project = {},
  episode = {},
  previousEpisode = null,
  nextEpisode = null,
  assets = [],
  constraints = {},
  enforceMaxDuration = true,
  sourceBeatsOverride = null,
  promptExperiment = false,
  promptMode = ""
} = {}) {
  const _0x4bd8fc = normalizeStoryProjectInput(project);
  assertStoryProjectInput(_0x4bd8fc);
  const _0x19465d = selectStoryEpisodeSplitAssets(assets, episode);
  if (!_0x19465d.some(_0x536bc0 => _0x536bc0.kind === "scene")) {
    throw new Error("分集缺少可用的场景资产，无法规划分镜蓝图。");
  }
  const _0x4b1175 = normalizeStoryEpisodeSplitSourceScenes(episode);
  const _0x3e1870 = Array.isArray(sourceBeatsOverride) && sourceBeatsOverride.length ? sourceBeatsOverride : normalizeStoryEpisodeSplitSourceBeats(episode);
  if (!_0x4b1175.length || !_0x3e1870.length || !normalizeText(episode?.title)) {
    throw new Error("分集缺少标题或剧本正文，无法规划分镜蓝图。");
  }
  const _0x491065 = resolveStoryPlanningConstraints(project, constraints);
  const _0xaaf306 = normalizeText(promptMode).toLowerCase() || resolveStoryPromptMode(project, constraints);
  const _0x1510c1 = resolveStoryPromptModeClipMaxSeconds(_0xaaf306, _0x491065.sceneMaxSeconds);
  const _0x9bc512 = a173_0x3e308f(episode?.ref || episode?.planningRef || episode?.id, "episode-1");
  const _0x2346a5 = getStoryEpisodeReferenceAliases(episode);
  const _0x3fad31 = normalizeStringArray(_0x3e1870.map(_0x1b5237 => normalizeText(_0x1b5237?.sourceSceneRef)));
  const _0x37d0f4 = getStoryEpisodeBlueprintSceneAssetRefs(_0x3fad31, _0x4b1175, _0x19465d, {
    episodeRefs: _0x2346a5
  });
  const _0x3f1f01 = _0x3fad31.some(_0x4f65a0 => !_0x37d0f4.has(_0x4f65a0));
  const _0x1fe3ef = resolveStoryEpisodeSplitTimingBudget(episode);
  return JSON.stringify({
    task: "plan_story_episode_split_blueprint",
    schemaVersion: STORY_EPISODE_BATCHED_SPLIT_SCHEMA_VERSION,
    scriptMode: _0x4bd8fc.scriptMode,
    project: buildStoryEpisodeSplitProjectContext(project, _0x4bd8fc, {
      sourceBeats: _0x3e1870
    }),
    episode: {
      ref: _0x9bc512,
      title: normalizeText(episode?.title),
      synopsis: normalizeText(episode?.synopsis),
      sourceBeats: _0x3e1870,
      ...(_0x1fe3ef ? {
        timingBudget: _0x1fe3ef
      } : {})
    },
    assets: _0x19465d.map(_0x56c43d => compactStoryEpisodeBlueprintAsset(_0x56c43d, {
      episodeRefs: _0x2346a5,
      sourceSceneRefs: _0x3fad31
    })),
    continuity: {
      previousEpisode: normalizeStoryEpisodeSplitContinuityEpisode(previousEpisode, {
        includeEnding: true
      }),
      nextEpisode: normalizeStoryEpisodeSplitContinuityEpisode(nextEpisode)
    },
    constraints: enforceMaxDuration ? _0x491065 : {
      episodeCount: _0x491065.episodeCount
    },
    requirements: ["先只规划整集片段蓝图，不要返回 shots、camera、dialogue、voiceover 或 audio。", "按 sourceBeats 原顺序完整覆盖剧情；每个 sourceBeats[].ref 必须且只能在一个 clipPlan.sourceBeatRefs 中出现一次。", "sourceBeat 用于跟踪原文覆盖，不直接决定片段边界；一个 clipPlan 可以承载多个相互关联的动作、对白、表情和反应。", STORY_EPISODE_SPLIT_GROUPING_GUIDANCE, STORY_EPISODE_SPLIT_CONTINUITY_CHAIN_GUIDANCE, enforceMaxDuration ? "targetDurationSec 体现当前连续叙事自然完成所需，并在视频模型的 " + _0x1510c1 + " 秒能力内安排。" + STORY_EPISODE_SPLIT_ADAPTIVE_TIMING_GUIDANCE : "targetDurationSec 体现当前连续叙事自然完成所需。" + STORY_EPISODE_SPLIT_ADAPTIVE_TIMING_GUIDANCE, ...(_0x1fe3ef ? ["episode.timingBudget 是正文完成后的独立逐场审时账本，不是大纲目标。全部 clipPlans.targetDurationSec 合计应接近 " + _0x1fe3ef.targetDurationSeconds + " 秒，并且必须落在制作允许区间 " + _0x1fe3ef.allowedProductionRangeSeconds.minimum + "-" + _0x1fe3ef.allowedProductionRangeSeconds.maximum + " 秒。", "按 episode.timingBudget.sceneTimings 为对应 sourceSceneRef 分配时间；必须呈现账本中已经存在的对白、动作、等待、反应和转场，不得靠重复动作、空镜、慢动作或新增剧情凑时长。"] : []), "客户端会按 clipPlans 顺序本地生成 ref，并从 sourceBeatRefs 推导 sourceSceneRef；不要返回 ref、sourceSceneRef 或 continuityNotes。", _0x3f1f01 ? "每个 clipPlan 必须返回一个与 sourceBeatRefs 所属场景匹配的 kind=scene 的 assets[].ref。" : "当前 sourceSceneRef 均有唯一场景资产绑定，客户端会本地推导 sceneAssetRef；不要返回 sceneAssetRef。", "每个 clipPlan 必须返回该场景有效的 sceneAppearanceRef；场景没有形象时返回空字符串，多候选时不得猜测。", "entryState 和 exitState 必须写成可观察状态，记录人物站位、动作、情绪、视线、道具和空间方向，供相邻计划直接承接。", "同一 sourceSceneRef 的相邻 clipPlan 必须组成一条连续状态链：后一项 entryState 完整继承前一项 exitState，再描述当前 beat 如何从该状态继续；15 秒等单片时长上限不得被理解成重新入场、重新走位或重新执行动作。", ...(promptExperiment ? ["场景图片是空间锚点；entryState 与 exitState 必须使用可见地标描述人物相对位置、朝向和移动结果，禁止只写抽象情绪或‘原地’。", "openingShotIntent 与 closingShotIntent 规划镜头叙事意图，由 Agent 根据剧情自主选择关注主体、景别层级和构图变化。", "相邻计划保持人物状态连续，画面衔接体现当前动作、视线或情绪关系。"] : []), "beat、entryState、exitState 各只写一句必要信息，不复述原文，不展开镜头语言。", "characterAssetRefs 与 propAssetRefs 只列当前计划实际出现的已登记资产；不得编造引用。", ...getStoryEpisodeTimelinePlanningRequirements(_0xaaf306).filter(_0x4e0a59 => !isStoryEpisodeTimelineGuidance(_0x4e0a59))],
    outputSchema: {
      episodeRef: _0x9bc512,
      clipPlans: [{
        sourceBeatRefs: ["按原顺序逐字使用一个或多个连续 sourceBeats[].ref"],
        beat: "概括当前连续片段内相互关联的动作、对白推进与情绪变化，不展开镜头细节",
        ...(_0x3f1f01 ? {
          sceneAssetRef: "逐字使用一个 kind=scene 的 assets[].ref"
        } : {}),
        sceneAppearanceRef: "该场景有效的 appearances[].ref；没有形象时为空字符串",
        entryState: "片段开头可观察的人物、动作、视线、道具与空间状态",
        exitState: "片段结束可观察的人物、动作、视线、道具与空间状态",
        ...(promptExperiment ? {
          openingShotIntent: "AI 自主决定的开场镜头叙事意图，不写固定模板",
          closingShotIntent: "AI 自主决定的结束镜头叙事意图，并考虑相邻计划衔接"
        } : {}),
        characterAssetRefs: ["当前片段实际出现的角色 assets[].ref"],
        propAssetRefs: ["当前片段实际出现的道具 assets[].ref"],
        targetDurationSec: enforceMaxDuration ? "正数且不超过 " + _0x491065.sceneMaxSeconds : "按剧情内容如实估算的正数秒数，无硬上限"
      }]
    }
  });
}
export function createStoryEpisodeSplitBlueprintBatches(_0x25689d = [], {
  minSize = 1,
  maxSize = STORY_EPISODE_EXPERIMENTAL_MAX_PLANS_PER_BATCH
} = {}) {
  const _0x39784a = Array.isArray(_0x25689d) ? _0x25689d : [];
  if (!_0x39784a.length) {
    return [];
  }
  const _0x45f573 = Math.max(1, Math.trunc(Number(minSize) || 1));
  const _0x55c89d = Math.max(_0x45f573, Math.trunc(Number(maxSize) || STORY_EPISODE_EXPERIMENTAL_MAX_PLANS_PER_BATCH));
  if (_0x39784a.length <= _0x55c89d) {
    return [_0x39784a.slice()];
  }
  const _0x447fc4 = Math.ceil(_0x39784a.length / _0x55c89d);
  const _0x4bfc9e = Math.floor(_0x39784a.length / _0x447fc4);
  const _0x24f277 = _0x39784a.length % _0x447fc4;
  const _0x2fe473 = [];
  let _0x3184a1 = 0;
  for (let _0x2aec44 = 0; _0x2aec44 < _0x447fc4; _0x2aec44 += 1) {
    const _0x486d24 = _0x4bfc9e + (_0x2aec44 < _0x24f277 ? 1 : 0);
    _0x2fe473.push(_0x39784a.slice(_0x3184a1, _0x3184a1 + Math.max(_0x45f573, _0x486d24)));
    _0x3184a1 += Math.max(_0x45f573, _0x486d24);
  }
  if (_0x3184a1 < _0x39784a.length) {
    _0x2fe473.at(-1).push(..._0x39784a.slice(_0x3184a1));
  }
  return _0x2fe473.filter(_0x561aef => _0x561aef.length);
}
export function createStoryEpisodeExperimentalConcurrentBatches(_0x2758bb = [], {
  maxPlansPerBatch = STORY_EPISODE_EXPERIMENTAL_MAX_PLANS_PER_BATCH,
  targetDurationSeconds = STORY_EPISODE_EXPERIMENTAL_BATCH_TARGET_DURATION_SECONDS
} = {}) {
  const _0x381149 = Array.isArray(_0x2758bb) ? _0x2758bb : [];
  if (!_0x381149.length) {
    return [];
  }
  const _0x5334a1 = Math.max(1, Math.trunc(Number(maxPlansPerBatch) || STORY_EPISODE_EXPERIMENTAL_MAX_PLANS_PER_BATCH));
  const _0x151529 = Math.max(1, normalizePositiveNumber(targetDurationSeconds) || STORY_EPISODE_EXPERIMENTAL_BATCH_TARGET_DURATION_SECONDS);
  const _0x10cd3d = [];
  let _0x55e99e = [];
  let _0x1b5de = 0;
  const _0x5032f8 = () => {
    if (!_0x55e99e.length) {
      return;
    }
    _0x10cd3d.push(_0x55e99e);
    _0x55e99e = [];
    _0x1b5de = 0;
  };
  _0x381149.forEach(_0x357109 => {
    const _0x2155cc = normalizePositiveNumber(_0x357109?.targetDurationSec) || STORY_EPISODE_EXPERIMENTAL_FALLBACK_PLAN_DURATION_SECONDS;
    if (_0x55e99e.length && (_0x55e99e.length >= _0x5334a1 || _0x1b5de + _0x2155cc > _0x151529)) {
      _0x5032f8();
    }
    _0x55e99e.push(_0x357109);
    _0x1b5de += _0x2155cc;
  });
  _0x5032f8();
  return _0x10cd3d;
}
function selectStoryEpisodeSplitBatchAssets(_0x326d47 = [], _0x5ef926 = [], _0x3c023e = [], _0x2f63f1 = []) {
  const _0x317732 = new Set(_0x5ef926.flatMap(_0x316e62 => [_0x316e62?.sceneAssetRef, ...(Array.isArray(_0x316e62?.characterAssetRefs) ? _0x316e62.characterAssetRefs : []), ...(Array.isArray(_0x316e62?.propAssetRefs) ? _0x316e62.propAssetRefs : [])]).map(normalizeText).filter(Boolean));
  const _0x189611 = _0x3c023e.flatMap(_0x2a247a => [_0x2a247a?.heading, ...(Array.isArray(_0x2a247a?.characters) ? _0x2a247a.characters : []), _0x2a247a?.body]).map(normalizeText).filter(Boolean).join("\n");
  const _0x1df737 = _0x3c023e.map(_0x2fbee4 => normalizeText(_0x2fbee4?.ref));
  return (Array.isArray(_0x326d47) ? _0x326d47 : []).filter(_0x24a729 => _0x317732.has(normalizeText(_0x24a729?.ref)) || storyAssetMatchesEpisode(_0x24a729, _0x2f63f1) && _0x24a729.sourceSceneRefs.some(_0x1b13ea => _0x1df737.some(_0x9569d2 => storyEpisodeSourceSceneRefsMatch(_0x1b13ea, _0x9569d2, _0x2f63f1))) || normalizeText(_0x24a729?.name) && _0x189611.includes(normalizeText(_0x24a729.name)));
}
export function buildStoryEpisodeSplitBatchPrompt({
  project = {},
  episode = {},
  assets = [],
  constraints = {},
  blueprint = {},
  batchIndex = 0,
  batches = [],
  planBatch = null,
  batchNumber = 0,
  batchTotal = 0,
  enforceMaxDuration = true,
  sourceBeatsOverride = null,
  promptExperiment = false,
  promptMode = "",
  timingCorrection = null
} = {}) {
  const _0x2d3a0b = normalizeStoryProjectInput(project);
  const _0x2c6600 = resolveStoryPlanningConstraints(project, constraints);
  const _0x59ce0f = normalizeText(promptMode).toLowerCase() || resolveStoryPromptMode(project, constraints);
  const _0x2cb12e = resolveStoryPromptModeClipMaxSeconds(_0x59ce0f, _0x2c6600.sceneMaxSeconds);
  const _0x4648bf = (Array.isArray(assets) ? assets : []).map((_0x143308, _0x5dfff4) => normalizePlanningAssetSummary(_0x143308, _0x5dfff4)).filter(_0x5779c5 => _0x5779c5.name);
  const _0x4105de = Array.isArray(blueprint?.clipPlans) ? blueprint.clipPlans : [];
  const _0x30824f = Array.isArray(planBatch) && planBatch.length ? planBatch : Array.isArray(batches?.[batchIndex]) ? batches[batchIndex] : [];
  if (!_0x30824f.length) {
    throw new Error("实验分批拆分缺少当前批次计划。");
  }
  const _0x10f540 = a173_0x3e308f(episode?.ref || episode?.planningRef || episode?.id, "episode-1");
  const _0x5cccfb = Array.isArray(sourceBeatsOverride) && sourceBeatsOverride.length ? sourceBeatsOverride : normalizeStoryEpisodeSplitSourceBeats(episode);
  const _0x1b8261 = new Set(_0x30824f.flatMap(_0x266e49 => Array.isArray(_0x266e49?.sourceBeatRefs) ? _0x266e49.sourceBeatRefs : []));
  const _0x125af8 = _0x5cccfb.filter(_0x1b9c28 => _0x1b8261.has(_0x1b9c28.ref));
  if (_0x125af8.length !== _0x1b8261.size) {
    throw new Error("实验分批拆分当前批次缺少蓝图引用的原文块。");
  }
  const _0x24c590 = selectStoryEpisodeSplitBatchAssets(_0x4648bf, _0x30824f, _0x125af8, getStoryEpisodeReferenceAliases(episode)).map(_0x4d29cb => compactStoryEpisodePromptAsset(_0x4d29cb, {
    includeVisualDetails: true,
    includeBindings: Array.isArray(sourceBeatsOverride)
  }));
  const _0x4abdc6 = new Set(_0x24c590.filter(_0x3da704 => _0x3da704?.kind === "scene").map(_0x490dc0 => normalizeText(_0x490dc0?.ref)));
  const _0x40839d = _0x30824f.map(_0x5ebdd1 => normalizeText(_0x5ebdd1?.sceneAssetRef)).find(_0x39f27f => !_0x4abdc6.has(_0x39f27f));
  if (_0x40839d) {
    throw new Error("实验分批拆分缺少场景资产“" + _0x40839d + "”。");
  }
  const _0x108b68 = _0x4105de.findIndex(_0x4f6431 => _0x4f6431?.ref === _0x30824f[0]?.ref);
  const _0x52e2f7 = _0x4105de.findIndex(_0x253079 => _0x253079?.ref === _0x30824f.at(-1)?.ref);
  const _0x25dc32 = _0x108b68 > 0 ? _0x4105de[_0x108b68 - 1] : null;
  const _0x42ea59 = _0x52e2f7 >= 0 ? _0x4105de[_0x52e2f7 + 1] || null : null;
  return JSON.stringify({
    task: "expand_story_episode_split_batch",
    schemaVersion: STORY_EPISODE_BATCHED_SPLIT_SCHEMA_VERSION,
    scriptMode: _0x2d3a0b.scriptMode,
    episode: {
      ref: _0x10f540,
      title: normalizeText(episode?.title)
    },
    batch: {
      index: Math.max(1, Math.trunc(Number(batchNumber) || batchIndex + 1)),
      total: Math.max(1, Math.trunc(Number(batchTotal) || batches.length || 1)),
      clipPlans: _0x30824f
    },
    sourceBeats: _0x125af8,
    assets: _0x24c590,
    continuityLedger: {
      previousBoundary: _0x25dc32 ? {
        ref: _0x25dc32.ref,
        exitState: _0x25dc32.exitState,
        continuityNotes: _0x25dc32.continuityNotes,
        ...(promptExperiment ? {
          closingShotIntent: normalizeText(_0x25dc32.closingShotIntent)
        } : {})
      } : null,
      currentEntry: {
        ref: _0x30824f[0].ref,
        entryState: _0x30824f[0].entryState,
        ...(promptExperiment ? {
          openingShotIntent: normalizeText(_0x30824f[0].openingShotIntent)
        } : {})
      },
      nextBoundary: _0x42ea59 ? {
        ref: _0x42ea59.ref,
        entryState: _0x42ea59.entryState,
        continuityNotes: _0x42ea59.continuityNotes,
        ...(promptExperiment ? {
          openingShotIntent: normalizeText(_0x42ea59.openingShotIntent)
        } : {})
      } : null
    },
    constraints: enforceMaxDuration ? _0x2c6600 : {
      episodeCount: _0x2c6600.episodeCount
    },
    visualDirection: {
      aspectRatio: _0x2d3a0b.aspectRatio || "16:9",
      style: _0x2d3a0b.visualStyle
    },
    timingBudget: {
      ...(!enforceMaxDuration ? {
        preserveSourceDialogueUnits: true
      } : {}),
      singleActionBeatPerShot: true,
      singleContinuousCameraPerShot: true
    },
    durationBudgets: _0x30824f.map(_0x4d29ae => ({
      ref: _0x4d29ae.ref,
      targetDurationSec: _0x4d29ae.targetDurationSec,
      ...(enforceMaxDuration ? {
        maxDurationSec: _0x2cb12e
      } : {})
    })),
    ...(timingCorrection ? {
      timingCorrection: timingCorrection
    } : {}),
    requirements: ["只展开 batch.clipPlans；按给定顺序为每个计划准确返回一个同 ref 的 clip，不得增加、合并、遗漏或重排。", "只依据当前 sourceBeats 写剧情、对白和旁白；不得补写未提供的整集内容，也不得遗漏 clipPlan.sourceBeatRefs 对应的信息。", "返回的 clips 是按计划分开的中间展开容器，不直接提交给视频模型；按当前剧情和表演节拍展开原子分镜，客户端会依据用户设置的单片段最大时长重新分组。", enforceMaxDuration ? "根据当前连续叙事与表演节拍自主决定分镜组织方式；durationBudgets.targetDurationSec 用于安排参考，shots.durationSec 总和在视频模型的 " + _0x2cb12e + " 秒能力内。" : "把每个 clip 展开为自然连贯的原子分镜流，每镜时长按当前表演需要判断，并在视频模型的 " + _0x2cb12e + " 秒能力内。", ...(resolveStoryEpisodeSplitTimingBudget(episode) ? ["durationBudgets.targetDurationSec 来自正文逐场审时账本。每个计划全部 shots.durationSec 的合计必须落在对应 targetDurationSec 的 80%-120% 内；通过补全原文已有的动作过程、等待、反应和转场实现，不得重复内容或新增剧情。"] : []), ...(timingCorrection ? ["这是自动时长复检后的定点重做。先根据 timingCorrection.previousFailure 修正上一轮时长缺口，再逐项自算每个计划 shots.durationSec 合计，确认达到 durationBudgets 后才返回。"] : []), "batch.clipPlans[].dialogueUnits 是客户端从故事正文逐字提取的完整发言。每个 dialogueUnits[].text 必须且只能完整出现在一个 shot.dialogue 中；不得改写、删减、按逗号拆开或分散到多个 shots。正文通过动作、停顿、他人插话或独立引号形成的不同 dialogueUnits 才是允许的发言边界。", "每个 clip 只能使用其 clipPlan.sceneAssetRef 指定的一个场景；至少一个 shot.assetUsages 必须引用该场景及指定 sceneAppearanceRef。", "把 entryState 直接写入首镜可观察画面，把 exitState 落到末镜可观察结果；不得用‘承接上一片段’等外部上下文表达。", "把 batch.clipPlans 和 continuityLedger 视为同一场景时间线的连续部分。每个计划的首镜必须从给定 entryState 直接续演，计划内每个后续镜头必须从前一镜头的动作落点继续；不得因为进入新计划或新的 15 秒技术切片而重新建立人物、位置、道具、车辆、设备或场景。", ...(promptExperiment ? ["场景参考图是固定空间锚点。镜头变化只能改变观察方式，不得改变建筑、家具、出入口、固定地标和光线方向的相对关系，不得镜像场景。", "由 Agent 根据剧情、对白、人物反应、动作连续性和情绪变化自主决定镜头数量、景别、机位、构图、运镜和剪辑方式。", "侧脸、双人镜头、过肩、正反打、特写、一镜到底或静止观察都可以，选择服务当前剧情的表达方式。", "每个 shot.transitionFromPrevious 说明与前一原子分镜的衔接方式和叙事原因，可选择切镜、动作匹配、视线匹配、反应镜头、道具插入或连续长镜。", "相邻 shot 的观察方式根据动作连续性和情绪发展决定，可变化，也可有意保持。", "每个 shot.visual 都要写清当前可观察的人物位置、朝向、动作、视线和道具状态；人物换位必须通过连续移动完成，禁止瞬移、镜像换位和无动作的位置重置。"] : []), STORY_EPISODE_SPLIT_VISUAL_GUIDANCE, STORY_EPISODE_SPLIT_CAMERA_GUIDANCE, "每个分镜中，画面实际出现的已登记角色必须来自对应 clipPlan.characterAssetRefs，并逐个把具体 appearanceRef 写入 shot.assetRefs；资产没有形象时才写 assetRef。角色只在首次出现时使用 assets[].name，后续优先使用他/她/该角色；有指代歧义时继续使用普通姓名。dialogue 说话人标签使用普通姓名，任何文本字段都不要输出 @。", STORY_EPISODE_SPLIT_ADAPTIVE_TIMING_GUIDANCE, "听者反应、说话人的表情落点和动作结果，根据当前表演节拍安排在口播镜头内或独立反应镜头中。", "每个分镜围绕清晰的表演节拍组织；连续动作可以在镜头内完成，也可以在有叙事动机时切换观察方式。", "由 Agent 根据正文已存在的动作完成、发言结束和情绪落点判断每镜 cutAfter：完整 dialogueUnit 结束后用 preferred 或 allowed；不得在 dialogueUnit 内建立切点。场景变化由客户端强制换片段。", "不要返回 script、creativeIntent、transition 或 shot.time，这些字段由客户端依据蓝图本地补全。visual、camera 只写当前分镜必需信息，不复述 clipPlan、资产描述或前后镜头。", "visual、camera 和 audio 保持紧凑完整，选择当前分镜真正有表达价值的信息；dialogue、voiceover、audio 没有内容时省略字段。", "audio 记录与当前画面相配的环境声、动作音效和可听见的表演声。", "不要返回 title 或已拼接 prompt；客户端会统一命名并构建最终视频提示词。", ...getStoryEpisodeTimelinePlanningRequirements(_0x59ce0f)],
    outputSchema: {
      episodeRef: _0x10f540,
      clips: [{
        ref: "必须逐字使用对应 batch.clipPlans[].ref",
        shots: [{
          durationSec: "当前原子分镜精确秒数；结合口播内容、人物语速、情绪、句式、呼吸、动作、停顿与反应判断，并在视频模型的 " + _0x2cb12e + " 秒能力内",
          ...(isStoryContinuousTimelinePromptMode(_0x59ce0f) ? {
            startSec: "当前 clip 内的整数开始秒数；首镜必须为 0，后续等于上一镜 endSec",
            endSec: "当前 clip 内的整数结束秒数；必须大于 startSec，且 endSec-startSec 等于 durationSec"
          } : {}),
          assetRefs: ["画面实际使用的 appearanceRef；资产没有形象时使用 assetRef"],
          visual: "可直接交给 AI 视频模型执行的正向画面提示词；写清摄像机实际可见的主体、人物位置与朝向、具体动作或状态变化、表情与视线、环境层次、道具互动、光影变化和动作落点，不写抽象心理或气氛结论",
          camera: "根据剧情、动作和情绪选择观察方式；写对本镜头有意义的景别、机位与角度、构图、运镜、焦点和落点，静止或运动均可",
          ...(promptExperiment ? {
            transitionFromPrevious: "AI 自主决定与前一原子分镜的衔接方式及叙事原因；首镜说明开场选择"
          } : {}),
          dialogue: "角色名：正文中的一条完整 dialogueUnit 原文；禁止自行断句或改写；没有则为空字符串",
          voiceover: "画外音或旁白；没有则为空字符串",
          audio: "必要环境声、动作音效或可听见的表演声；允许呼吸、喘息、啜泣、衣物摩擦，禁止固定人物音色、对白复述与脱离剧情的配乐说明",
          cutAfter: "preferred、allowed 或 forbidden；可省略，客户端按 allowed 处理"
        }]
      }]
    }
  });
}
function parseStoryEpisodeSplitBatchResult(_0x1f64a8, {
  episodeRef = "",
  clipPlans = [],
  constraints = {},
  assets = [],
  promptMode = "seedance-2.0"
} = {}) {
  const _0x41ed5d = parseStoryEpisodeSplitResult(_0x1f64a8, {
    episodeRef: episodeRef,
    constraints: isStoryMinimaxH3PromptMode(promptMode) ? {
      ...constraints,
      sceneMaxSeconds: 15
    } : constraints,
    assets: assets,
    clipPlans: clipPlans,
    promptMode: promptMode
  });
  const _0xffd69a = clipPlans.map(_0x11060c => normalizeText(_0x11060c?.ref));
  const _0x463d1c = _0x41ed5d.clips.map(_0x4dae43 => normalizeText(_0x4dae43?.ref));
  if (_0xffd69a.length !== _0x463d1c.length || _0xffd69a.some((_0x27674b, _0x20dd9d) => _0x27674b !== _0x463d1c[_0x20dd9d])) {
    throw new Error("Agent 未按当前批次计划逐项返回同 ref 的片段。");
  }
  return _0x41ed5d;
}
function stripStoryShotSpeakerLabels(_0x3fea0f = "") {
  return normalizeText(_0x3fea0f).replace(/(^|[\n；;。！？!?])\s*[\p{Script=Han}A-Za-z0-9·_-]{1,16}\s*[：:]\s*/gu, "$1");
}
function normalizeStoryDialogueComparisonText(_0x3f93e8 = "") {
  return (stripStoryShotSpeakerLabels(_0x3f93e8).match(/[\p{Script=Han}\p{L}\p{N}]/gu) || []).join("").toLowerCase();
}
function getStoryDialogueSpeakerPrefix(_0x3567f5 = "") {
  return String(_0x3567f5 || "").trim().match(/^([\p{Script=Han}A-Za-z0-9·_-]{1,16}\s*[：:]\s*)/u)?.[1] || "";
}
function completeStoryEpisodeSplitDialogueSpeaker(_0x1d7088 = "", _0x52bf88 = []) {
  const _0x154ae4 = normalizeText(_0x1d7088);
  if (!_0x154ae4 || getStoryDialogueSpeakerPrefix(_0x154ae4)) {
    return _0x154ae4;
  }
  const _0x31dfd = normalizeStoryDialogueComparisonText(_0x154ae4);
  if (!_0x31dfd) {
    return _0x154ae4;
  }
  const _0x553990 = [...new Set((Array.isArray(_0x52bf88) ? _0x52bf88 : []).filter(_0x432788 => normalizeStoryDialogueComparisonText(_0x432788?.text) === _0x31dfd).map(_0x573ef6 => normalizeText(_0x573ef6?.speaker)).filter(Boolean))];
  if (_0x553990.length === 1) {
    return _0x553990[0] + "：" + _0x154ae4;
  } else {
    return _0x154ae4;
  }
}
function mergeStoryEpisodeSplitDialogueFragments(_0x2cc1c2 = [], _0x257798 = []) {
  const _0x9e623a = Array.isArray(_0x2cc1c2) ? _0x2cc1c2 : [];
  const _0x41ae70 = (Array.isArray(_0x257798) ? _0x257798 : []).map(_0x8178b9 => ({
    ..._0x8178b9,
    text: normalizeText(_0x8178b9?.text),
    comparisonText: normalizeStoryDialogueComparisonText(_0x8178b9?.text)
  })).filter(_0x563554 => _0x563554.text && _0x563554.comparisonText);
  if (!_0x9e623a.length || !_0x41ae70.length) {
    return _0x9e623a;
  }
  const _0x10c739 = new Map();
  let _0x2d53ac = 0;
  _0x41ae70.forEach(_0x13e3e7 => {
    let _0x276f76 = -1;
    let _0x758440 = -1;
    let _0x22e2c6 = "";
    for (let _0x2ce98a = _0x2d53ac; _0x2ce98a < _0x9e623a.length; _0x2ce98a += 1) {
      const _0x4a25b0 = normalizeStoryDialogueComparisonText(_0x9e623a[_0x2ce98a]?.dialogue);
      if (!_0x4a25b0) {
        continue;
      }
      if (_0x276f76 < 0) {
        if (!_0x13e3e7.comparisonText.startsWith(_0x4a25b0)) {
          continue;
        }
        _0x276f76 = _0x2ce98a;
        _0x22e2c6 = _0x4a25b0;
      } else {
        const _0x3d9121 = "" + _0x22e2c6 + _0x4a25b0;
        if (!_0x13e3e7.comparisonText.startsWith(_0x3d9121)) {
          break;
        }
        _0x22e2c6 = _0x3d9121;
      }
      if (_0x22e2c6 === _0x13e3e7.comparisonText) {
        _0x758440 = _0x2ce98a;
        break;
      }
    }
    if (_0x276f76 < 0 || _0x758440 < _0x276f76) {
      return;
    }
    const _0x12cada = _0x9e623a.slice(_0x276f76, _0x758440 + 1);
    const _0x4a22a2 = _0x12cada[0];
    const _0x310921 = _0x12cada.at(-1);
    const _0x5789d3 = getStoryDialogueSpeakerPrefix(_0x4a22a2?.dialogue) || (normalizeText(_0x13e3e7?.speaker) ? normalizeText(_0x13e3e7.speaker) + "：" : "");
    const _0x47e647 = [...new Map(_0x12cada.flatMap(_0x2a976f => Array.isArray(_0x2a976f?.assetUsages) ? _0x2a976f.assetUsages : []).map(_0x40699e => [normalizeText(_0x40699e?.assetRef) + "|" + normalizeText(_0x40699e?.appearanceRef), _0x40699e])).values()];
    const _0x2064cc = [...new Set(_0x12cada.map(_0x471f18 => normalizeText(_0x471f18?.audio)).filter(Boolean))].join("；");
    _0x10c739.set(_0x276f76, {
      endIndex: _0x758440,
      shot: {
        ..._0x4a22a2,
        durationSec: Number(_0x12cada.reduce((_0x1717e5, _0x5abfdb) => _0x1717e5 + Number(_0x5abfdb?.durationSec || 0), 0).toFixed(1)),
        ...(Number.isInteger(Number(_0x4a22a2?.startSec)) && Number.isInteger(Number(_0x310921?.endSec)) ? {
          startSec: Number(_0x4a22a2.startSec),
          endSec: Number(_0x310921.endSec)
        } : {}),
        assetUsages: _0x47e647,
        assetRefs: [...new Set(_0x47e647.map(_0x4a630c => normalizeText(_0x4a630c?.assetRef)).filter(Boolean))],
        dialogue: "" + _0x5789d3 + _0x13e3e7.text,
        audio: _0x2064cc,
        cutAfter: normalizeText(_0x310921?.cutAfter) === "forbidden" ? "allowed" : normalizeText(_0x310921?.cutAfter) || "preferred"
      }
    });
    _0x2d53ac = _0x758440 + 1;
  });
  if (!_0x10c739.size) {
    return _0x9e623a;
  }
  const _0x3882b5 = [];
  for (let _0x189274 = 0; _0x189274 < _0x9e623a.length; _0x189274 += 1) {
    const _0x11eb07 = _0x10c739.get(_0x189274);
    if (!_0x11eb07) {
      _0x3882b5.push(_0x9e623a[_0x189274]);
      continue;
    }
    _0x3882b5.push(_0x11eb07.shot);
    _0x189274 = _0x11eb07.endIndex;
  }
  return _0x3882b5;
}
function normalizeStoryEpisodeSplitShotCamera(_0x491bc1 = "") {
  const _0x4a367f = normalizeText(_0x491bc1);
  return _0x4a367f.replace(/再切(?:至|到)/gu, "，随后镜头连续调整构图至").replace(/再切/gu, "，随后镜头连续调整构图").replace(/转场(?:至|到)/gu, "，镜头平滑衔接至").replace(/转场/gu, "，镜头平滑衔接").replace(/镜头切换(?:至|到)|镜头切(?:至|到)/gu, "镜头连续调整构图至").replace(/切至|切到/gu, "，镜头连续调整构图至").replace(/镜头切换/gu, "镜头连续调整构图").replace(/，{2,}/gu, "，").replace(/^，/u, "");
}
function normalizeStoryEpisodeSplitShot(_0x37513c = {}, {
  clipTitle = "片段",
  index = 0,
  assetCatalog = buildStoryEpisodeSplitAssetCatalog(),
  fallbacks = {},
  allowEmptyAudio = true,
  includeCutAfter = false,
  includeTimeline = false
} = {}) {
  const _0x213808 = normalizePositiveNumber(_0x37513c?.durationSec || _0x37513c?.durationSeconds) || normalizePositiveNumber(fallbacks?.durationSec);
  const _0x3e03c0 = normalizeText(_0x37513c?.time) || normalizeText(fallbacks?.time);
  const _0x992428 = normalizeText(_0x37513c?.visual) || normalizeText(fallbacks?.visual);
  const _0x14973b = normalizeText(_0x37513c?.camera) || normalizeText(fallbacks?.camera);
  const _0x23297a = normalizeText(_0x37513c?.audio) || normalizeText(fallbacks?.audio);
  if (!_0x213808 || !_0x992428 || !_0x14973b || !allowEmptyAudio && !_0x23297a) {
    throw new Error("片段“" + clipTitle + "”的分镜 " + (index + 1) + " 缺少 durationSec、visual、camera 或 audio。");
  }
  const _0x5d7150 = "片段“" + clipTitle + "”的分镜 " + (index + 1);
  const _0x5d0770 = normalizeStoryEpisodeSplitShotCamera(_0x14973b);
  const _0x30ea4c = normalizeText(_0x37513c?.transitionFromPrevious || fallbacks?.transitionFromPrevious);
  const _0x4c4e0b = normalizeText(_0x37513c?.dialogue);
  const _0x3233a2 = normalizeText(_0x37513c?.voiceover);
  const _0x578403 = normalizeText(_0x37513c?.cutAfter || fallbacks?.cutAfter).toLowerCase();
  const _0x2f326f = ["preferred", "allowed", "forbidden"].includes(_0x578403) ? _0x578403 : "allowed";
  const _0x59726d = Number(_0x213808);
  const _0x38689a = Number(_0x37513c?.startSec);
  const _0x3938a8 = Number(_0x37513c?.endSec);
  if (includeTimeline && (!Number.isInteger(_0x38689a) || _0x38689a < 0 || !Number.isInteger(_0x3938a8) || _0x3938a8 <= _0x38689a || _0x3938a8 - _0x38689a !== _0x59726d)) {
    throw new Error("片段“" + clipTitle + "”的分镜 " + (index + 1) + " 必须提供连续整数 startSec/endSec，且 durationSec 等于二者之差。");
  }
  const _0x2ee351 = Array.isArray(_0x37513c?.assetUsages) ? _0x37513c.assetUsages : normalizeStringArray(_0x37513c?.assetRefs).map(_0x13cbfd => {
    const _0x101a2d = assetCatalog.assetByRef.get(_0x13cbfd);
    if (_0x101a2d) {
      return {
        assetRef: _0x13cbfd,
        appearanceRef: _0x101a2d.appearanceRefs[0] || ""
      };
    }
    const _0x366980 = assetCatalog.appearanceOwnerRefsByRef.get(_0x13cbfd);
    if (_0x366980?.size === 1) {
      return {
        assetRef: [..._0x366980][0],
        appearanceRef: _0x13cbfd
      };
    }
    if (_0x366980?.size > 1) {
      const _0x5602e0 = resolveStoryEpisodeSplitLegacyAppearanceOwner(_0x13cbfd, _0x366980, assetCatalog, _0x37513c);
      if (_0x5602e0) {
        return {
          assetRef: _0x5602e0,
          appearanceRef: _0x13cbfd
        };
      }
      throw new Error(_0x5d7150 + "的旧形象引用“" + _0x13cbfd + "”存在多个所属资产；请同时提供 assetRef 和 appearanceRef。");
    }
    const _0x47cb08 = resolveStoryEpisodeSplitUnknownLegacyAppearance(_0x13cbfd, assetCatalog, _0x37513c);
    if (_0x47cb08) {
      return {
        assetRef: _0x47cb08.assetRef,
        appearanceRef: _0x47cb08.defaultAppearanceRef
      };
    }
    return {
      assetRef: _0x13cbfd,
      appearanceRef: ""
    };
  });
  const _0x3e20f3 = _0x2ee351.map(_0x4b0ce8 => normalizeStoryEpisodeSplitAssetUsage(_0x4b0ce8, assetCatalog, _0x5d7150));
  const _0x1f936b = [...new Set(_0x3e20f3.map(_0x59f381 => _0x59f381.assetRef))];
  return {
    durationSec: _0x59726d,
    ...(includeTimeline ? {
      startSec: _0x38689a,
      endSec: _0x3938a8
    } : {}),
    time: _0x3e03c0,
    assetUsages: _0x3e20f3,
    assetRefs: _0x1f936b,
    visual: _0x992428,
    camera: _0x5d0770,
    ...(_0x30ea4c ? {
      transitionFromPrevious: _0x30ea4c
    } : {}),
    dialogue: _0x4c4e0b,
    voiceover: _0x3233a2,
    audio: _0x23297a,
    ...(includeCutAfter ? {
      cutAfter: _0x2f326f
    } : {})
  };
}
const STORY_EPISODE_CHARACTER_SINGULAR_REFERENCE_PATTERN = /(?:他|她|此人|那人|对方|来者|男人|女人|男孩|女孩|少年|少女|老人|老者|人物|角色|人影|身影)/u;
const STORY_EPISODE_CHARACTER_GROUP_REFERENCE_PATTERN = /(?:他们|她们|两人|二人|双方|众人|人群|一行人)/u;
const STORY_EPISODE_CHARACTER_ACTION_PATTERN = /(?:面部|脸上|眼神|目光|手部|双手|手指|脚步|背影|呼吸|喘息|开口|说(?:道|话)?|回答|走|跑|转身|回头|抬头|低头|俯身|起身|检查|观察|看向|望向|握住|伸手|跪|站|坐)/u;
const STORY_EPISODE_EXPLICIT_ENVIRONMENT_SHOT_PATTERN = /(?:空镜|无人|纯环境镜头)/u;
const STORY_EPISODE_AUDIO_ONLY_CHARACTER_REFERENCE_PATTERN = /(?:O\.?S\.?|V\.?O\.?|画外音|旁白|声音|语音|录音|音频|电话|通话|广播|扬声器|耳机|对讲机|传声器)/iu;
const STORY_EPISODE_CHARACTER_VISUAL_PRESENCE_PATTERN = /(?:本人|本尊|出镜|入镜|现身|身影|面部|脸上|眼神|目光|手部|双手|手指|脚步|背影|走|跑|转身|回头|抬头|低头|俯身|起身|检查|观察|看向|望向|握住|伸手|跪|站|坐|躺|进入|离开)/u;
const STORY_EPISODE_INDIRECT_CHARACTER_REFERENCE_PATTERN = /(?:回忆|提到|提及|说起|谈及|复述|指出|说明|承认|表示|交代|声称|听见|得知|想到|想起|记得|名单|记录|编号|权限|办公室|命令|委托)/u;
const STORY_EPISODE_CHARACTER_VISIBLE_SUBJECT_PATTERN = /^(?:(?:本人|正|正在|随即|缓慢|突然|仍|继续|立刻|艰难|猛地|轻轻)\s*)?(?:盯|看|望|走|跑|站|坐|躺|跪|转身|回头|抬头|低头|俯身|起身|检查|观察|握住|伸手|扶住|抓住|推开|拉住|抱住|哭|笑|点头|摇头|开口|指向|面对|递出|接过|拿起|放下|冲向|进入|离开)/u;
const STORY_EPISODE_CHARACTER_VISIBLE_OBJECT_PATTERN = /(?:面对|看向|望向|盯着|扶住|抓住|推开|拉住|抱住|递给|靠近|转向|照片中的|屏幕中的)$/u;
function getStoryEpisodeSplitShotCharacterText(_0x77a467 = {}) {
  return [_0x77a467?.visual, _0x77a467?.camera].map(normalizeText).filter(Boolean).join(" ");
}
function hasStoryEpisodeSplitVisualCharacterReference(_0x572cfc, _0x37433c) {
  if (normalizeText(_0x572cfc?.camera).includes(_0x37433c)) {
    return true;
  }
  const _0x540ba7 = normalizeText(_0x572cfc?.visual).split(/[，,。；;！？!?：:\r\n]+/u).map(_0xf2a370 => _0xf2a370.trim()).filter(_0x5e785f => _0x5e785f.includes(_0x37433c));
  return _0x540ba7.some(_0x29570c => {
    const _0x1ab0b3 = _0x29570c.indexOf(_0x37433c);
    const _0x574db2 = _0x29570c.slice(0, _0x1ab0b3);
    const _0x2463f2 = _0x29570c.slice(_0x1ab0b3 + _0x37433c.length);
    const _0x20a933 = STORY_EPISODE_CHARACTER_VISIBLE_SUBJECT_PATTERN.test(_0x2463f2) || STORY_EPISODE_CHARACTER_VISIBLE_OBJECT_PATTERN.test(_0x574db2) || STORY_EPISODE_CHARACTER_VISUAL_PRESENCE_PATTERN.test(_0x2463f2.slice(0, 12));
    if (_0x20a933) {
      return true;
    }
    if (STORY_EPISODE_AUDIO_ONLY_CHARACTER_REFERENCE_PATTERN.test(_0x29570c)) {
      return false;
    }
    return !STORY_EPISODE_INDIRECT_CHARACTER_REFERENCE_PATTERN.test(_0x29570c);
  });
}
function completeStoryEpisodeSplitCharacterAssetUsages(_0x5943e6 = [], {
  clipPlan = null,
  assetCatalog = buildStoryEpisodeSplitAssetCatalog(),
  clipTitle = "片段",
  requireAllPlanCharacters = true
} = {}) {
  const _0x4ff8cf = [...new Set(normalizeStringArray(clipPlan?.characterAssetRefs).filter(_0x4880b9 => assetCatalog.assetByRef.get(_0x4880b9)?.kind === "character"))];
  const _0xe0e155 = [...assetCatalog.assetByRef.values()].filter(_0x50f905 => _0x50f905.kind === "character").map(_0x22244b => _0x22244b.assetRef);
  if (!_0xe0e155.length) {
    return _0x5943e6;
  }
  const _0x2cd24e = new Set();
  let _0x18525d = [];
  const _0x486108 = _0x5943e6.map((_0x3d86ac, _0xe603ca) => {
    const _0x5ee840 = getStoryEpisodeSplitShotCharacterText(_0x3d86ac);
    const _0x51f8fd = new Set(_0x3d86ac.assetUsages.map(_0x5bc7e2 => _0x5bc7e2.assetRef));
    const _0x3fc595 = _0xe0e155.filter(_0x3b274e => _0x51f8fd.has(_0x3b274e));
    const _0x503d76 = _0xe0e155.filter(_0x21c4f0 => {
      const _0x446ab8 = assetCatalog.assetByRef.get(_0x21c4f0)?.name;
      return _0x446ab8 && hasStoryEpisodeSplitVisualCharacterReference(_0x3d86ac, _0x446ab8);
    });
    let _0x38fa86 = [...new Set([..._0x3fc595, ..._0x503d76])];
    if (!_0x38fa86.length) {
      const _0x12c323 = STORY_EPISODE_EXPLICIT_ENVIRONMENT_SHOT_PATTERN.test(_0x5ee840);
      if (!_0x12c323 && _0x4ff8cf.length === 1 && (STORY_EPISODE_CHARACTER_SINGULAR_REFERENCE_PATTERN.test(_0x5ee840) || STORY_EPISODE_CHARACTER_ACTION_PATTERN.test(_0x5ee840) || normalizeText(_0x3d86ac?.dialogue) || normalizeText(_0x3d86ac?.voiceover))) {
        _0x38fa86 = [..._0x4ff8cf];
      } else if (!_0x12c323 && _0x18525d.length && STORY_EPISODE_CHARACTER_GROUP_REFERENCE_PATTERN.test(_0x5ee840)) {
        _0x38fa86 = [..._0x18525d];
      } else if (!_0x12c323 && _0x18525d.length === 1 && STORY_EPISODE_CHARACTER_SINGULAR_REFERENCE_PATTERN.test(_0x5ee840)) {
        _0x38fa86 = [..._0x18525d];
      }
    }
    const _0x5e306c = [..._0x3d86ac.assetUsages];
    for (const _0x18f97b of _0x38fa86) {
      _0x2cd24e.add(_0x18f97b);
      if (_0x51f8fd.has(_0x18f97b)) {
        continue;
      }
      const _0x38d078 = assetCatalog.assetByRef.get(_0x18f97b)?.name || _0x18f97b;
      _0x5e306c.push(normalizeStoryEpisodeSplitAssetUsage({
        assetRef: _0x18f97b,
        appearanceRef: ""
      }, assetCatalog, "片段“" + clipTitle + "”的分镜 " + (_0xe603ca + 1) + " 自动补全人物“" + _0x38d078 + "”"));
      _0x51f8fd.add(_0x18f97b);
    }
    if (_0x38fa86.length) {
      _0x18525d = _0x38fa86;
    }
    return {
      ..._0x3d86ac,
      assetUsages: _0x5e306c,
      assetRefs: [...new Set(_0x5e306c.map(_0x326561 => _0x326561.assetRef))]
    };
  });
  const _0x1ababe = _0x4ff8cf.filter(_0x3dcca9 => !_0x2cd24e.has(_0x3dcca9));
  if (requireAllPlanCharacters && _0x1ababe.length) {
    const _0x46f8eb = _0x1ababe.map(_0x27e603 => assetCatalog.assetByRef.get(_0x27e603)?.name || _0x27e603);
    throw new Error("片段“" + clipTitle + "”人物资产引用不完整：蓝图人物“" + _0x46f8eb.join("、") + "”未出现在任何分镜的 assetUsages 中。");
  }
  return _0x486108;
}
function completeStoryEpisodeSplitSceneAssetUsage(_0x4ec43c = [], {
  clipPlan = null,
  assetCatalog = buildStoryEpisodeSplitAssetCatalog(),
  clipTitle = "片段"
} = {}) {
  if (!_0x4ec43c.length) {
    return _0x4ec43c;
  }
  const _0x1c7b41 = normalizeText(clipPlan?.sceneAssetRef);
  if (!_0x1c7b41 || assetCatalog.assetByRef.get(_0x1c7b41)?.kind !== "scene") {
    return _0x4ec43c;
  }
  const _0x40a266 = _0x4ec43c.some(_0x1ca041 => _0x1ca041.assetUsages.some(_0x325767 => _0x325767.assetRef === _0x1c7b41));
  if (_0x40a266) {
    return _0x4ec43c;
  }
  const _0x5327e8 = normalizeStoryEpisodeSplitAssetUsage({
    assetRef: _0x1c7b41,
    appearanceRef: normalizeText(clipPlan?.sceneAppearanceRef)
  }, assetCatalog, "片段“" + clipTitle + "”自动补全场景");
  return _0x4ec43c.map((_0x35049f, _0x8c28d8) => {
    if (_0x8c28d8 !== 0) {
      return _0x35049f;
    }
    const _0x9fcfda = [_0x5327e8, ..._0x35049f.assetUsages];
    return {
      ..._0x35049f,
      assetUsages: _0x9fcfda,
      assetRefs: [...new Set(_0x9fcfda.map(_0x5ebf60 => _0x5ebf60.assetRef))]
    };
  });
}
function formatStoryEpisodeClipTitle(_0x352bd6 = 0) {
  return "片段" + String(_0x352bd6 + 1).padStart(2, "0");
}
function validateStoryEpisodeSplitClipIndependence({
  clipLabel = "片段",
  script = "",
  creativeIntent = "",
  transition = ""
} = {}) {
  const _0x1ad68c = [script, creativeIntent, transition].join(" ");
  const _0x5e6184 = _0x1ad68c.match(/当前为原片段第\s*\d+\s*\/\s*\d+\s*段|原片段第\s*\d+\s*\/\s*\d+\s*段|承接(?:上一|下一)片段|参见(?:上一|下一)片段/u);
  if (_0x5e6184) {
    throw new Error(clipLabel + " 包含依赖其他视频上下文的描述“" + _0x5e6184[0] + "”，每个片段必须独立完整。");
  }
}
function normalizeStoryEpisodeExperimentalStandaloneText(_0x361698 = "") {
  return normalizeText(_0x361698).replace(/当前为原片段第\s*\d+\s*\/\s*\d+\s*段/gu, "当前剧情段落").replace(/原片段第\s*\d+\s*\/\s*\d+\s*段/gu, "当前剧情段落").replace(/承接(?:上一|下一)片段/gu, "从当前可观察状态开始").replace(/参见(?:上一|下一)片段/gu, "以当前画面状态为准").replace(/(?:上一|下一)片段/gu, "相邻剧情");
}
function getStoryEpisodeSplitShotsDuration(_0x9abc26 = []) {
  return _0x9abc26.reduce((_0x21f72a, _0x159e0f) => _0x21f72a + Number(_0x159e0f?.durationSec || 0), 0);
}
function tokenizeStoryEpisodeExperimentalShotText(_0x2ea13e = "", {
  preserveSpeaker = false
} = {}) {
  const _0x2ae44f = String(_0x2ea13e || "").trim();
  if (!_0x2ae44f) {
    return [];
  }
  const _0x776532 = [];
  const _0x196bbe = preserveSpeaker ? _0x2ae44f.split(/\n+/u) : [_0x2ae44f];
  _0x196bbe.forEach(_0x2ed04a => {
    const _0x3f8915 = _0x2ed04a.trim();
    if (!_0x3f8915) {
      return;
    }
    const _0xdd33ee = preserveSpeaker ? _0x3f8915.match(/^([^：:\n]{1,20}[：:])\s*(.*)$/u) : null;
    const _0x5ca32b = _0xdd33ee?.[1] || "";
    const _0x42fb76 = _0xdd33ee?.[2] || _0x3f8915;
    const _0x1fad59 = _0x42fb76.match(preserveSpeaker ? /[^。！？!?\n]+(?:[。！？!?]+|$)/gu : /[^。！？!?；;，,\n]+(?:[。！？!?；;，,]+|$)/gu) || [_0x42fb76];
    _0x1fad59.map(_0xae2a90 => _0xae2a90.trim()).filter(Boolean).forEach(_0x588910 => {
      _0x776532.push("" + _0x5ca32b + _0x588910);
    });
  });
  return _0x776532;
}
function splitStoryEpisodeExperimentalClause(_0x558920 = "", _0x12a97b = false) {
  const _0x3b4b46 = _0x12a97b ? _0x558920.match(/^([^：:\n]{1,20}[：:])(.*)$/u) : null;
  const _0x2d22ca = _0x3b4b46?.[1] || "";
  const _0x5443e1 = _0x3b4b46?.[2] || _0x558920;
  const _0x2ffb32 = [..._0x5443e1];
  if (_0x2ffb32.length < 2) {
    return [_0x558920];
  }
  const _0x188ed1 = Math.ceil(_0x2ffb32.length / 2);
  return ["" + _0x2d22ca + _0x2ffb32.slice(0, _0x188ed1).join(""), "" + _0x2d22ca + _0x2ffb32.slice(_0x188ed1).join("")];
}
function splitStoryEpisodeExperimentalShotText(_0x9fac0b = "", _0x122a2f = 1, {
  preserveSpeaker = false,
  splitFragments = true
} = {}) {
  const _0x20032e = Math.max(1, Math.trunc(Number(_0x122a2f) || 1));
  const _0x5aa824 = tokenizeStoryEpisodeExperimentalShotText(_0x9fac0b, {
    preserveSpeaker: preserveSpeaker
  });
  while (splitFragments && _0x5aa824.length && _0x5aa824.length < _0x20032e) {
    let _0x2a5637 = 0;
    for (let _0x496089 = 1; _0x496089 < _0x5aa824.length; _0x496089 += 1) {
      if ([..._0x5aa824[_0x496089]].length > [..._0x5aa824[_0x2a5637]].length) {
        _0x2a5637 = _0x496089;
      }
    }
    const _0x14d844 = splitStoryEpisodeExperimentalClause(_0x5aa824[_0x2a5637], preserveSpeaker);
    if (_0x14d844.length < 2) {
      break;
    }
    _0x5aa824.splice(_0x2a5637, 1, ..._0x14d844);
  }
  if (!_0x5aa824.length) {
    return Array.from({
      length: _0x20032e
    }, () => "");
  }
  if (!splitFragments && _0x5aa824.length < _0x20032e) {
    const _0x471491 = Array.from({
      length: _0x20032e
    }, () => "");
    _0x5aa824.forEach((_0x1127d9, _0x44d34b) => {
      const _0x3bc51d = Math.min(_0x20032e - 1, Math.floor(_0x44d34b * _0x20032e / _0x5aa824.length));
      _0x471491[_0x3bc51d] = _0x471491[_0x3bc51d] ? _0x471491[_0x3bc51d] + "\n" + _0x1127d9 : _0x1127d9;
    });
    return _0x471491;
  }
  const _0x4c4423 = [];
  let _0x5efef4 = 0;
  for (let _0x198772 = 0; _0x198772 < _0x20032e; _0x198772 += 1) {
    const _0x28e37f = _0x20032e - _0x198772;
    const _0x5cba5c = _0x5aa824.length - _0x5efef4;
    if (_0x5cba5c <= 0) {
      _0x4c4423.push("");
      continue;
    }
    if (_0x28e37f === 1) {
      _0x4c4423.push(_0x5aa824.slice(_0x5efef4).join(preserveSpeaker ? "\n" : ""));
      _0x5efef4 = _0x5aa824.length;
      continue;
    }
    const _0xc4f6f = Math.max(1, _0x5cba5c - (_0x28e37f - 1));
    const _0x35bbff = _0x5aa824.slice(_0x5efef4).reduce((_0x367c41, _0x245a50) => _0x367c41 + [..._0x245a50].length, 0);
    const _0x40b9d6 = _0x35bbff / _0x28e37f;
    let _0x483639 = 1;
    let _0x262420 = [..._0x5aa824[_0x5efef4]].length;
    while (_0x483639 < _0xc4f6f && _0x262420 < _0x40b9d6) {
      _0x262420 += [..._0x5aa824[_0x5efef4 + _0x483639]].length;
      _0x483639 += 1;
    }
    _0x4c4423.push(_0x5aa824.slice(_0x5efef4, _0x5efef4 + _0x483639).join(preserveSpeaker ? "\n" : ""));
    _0x5efef4 += _0x483639;
  }
  return _0x4c4423;
}
function splitStoryEpisodeExperimentalOverlongEntry(_0x47cf82 = {}, {
  maximum = 15,
  targetMaximum = maximum,
  entryIndex = 0
} = {}) {
  const _0x3225ab = _0x47cf82?.shot || {};
  const _0x59865e = normalizePositiveNumber(_0x3225ab?.durationSec);
  if (!_0x59865e || _0x59865e <= maximum + 0.001) {
    return [_0x47cf82];
  }
  const _0x238d54 = Math.max(1, normalizePositiveNumber(targetMaximum) || maximum);
  const _0x23413a = Math.max(2, Math.ceil(_0x59865e / _0x238d54));
  const _0x19ce64 = splitStoryEpisodeExperimentalShotText(_0x3225ab.visual, _0x23413a, {
    splitFragments: false
  });
  const _0x523649 = splitStoryEpisodeExperimentalShotText(_0x3225ab.dialogue, _0x23413a, {
    preserveSpeaker: true,
    splitFragments: false
  });
  const _0x3870c8 = splitStoryEpisodeExperimentalShotText(_0x3225ab.voiceover, _0x23413a, {
    preserveSpeaker: true,
    splitFragments: false
  });
  const _0x557dba = splitStoryEpisodeExperimentalShotText(_0x3225ab.audio, _0x23413a, {
    splitFragments: false
  });
  let _0x2815f8 = Number(_0x59865e.toFixed(1));
  const _0x4f7e08 = normalizeText(_0x47cf82?.sourceClip?.ref) || "clip-" + (entryIndex + 1);
  return Array.from({
    length: _0x23413a
  }, (_0x43a41b, _0x37ea3e) => {
    const _0xba103e = _0x23413a - _0x37ea3e;
    const _0x5d251f = _0x37ea3e === _0x23413a - 1 ? _0x2815f8 : Number((_0x2815f8 / _0xba103e).toFixed(1));
    _0x2815f8 = Number((_0x2815f8 - _0x5d251f).toFixed(1));
    const _0x457d0c = _0x19ce64[_0x37ea3e] || normalizeText(_0x3225ab.visual);
    const _0x418e2c = _0x523649[_0x37ea3e] || "";
    const _0x45cb33 = _0x3870c8[_0x37ea3e] || "";
    const _0x2305ec = _0x557dba[_0x37ea3e] || "";
    return {
      ..._0x47cf82,
      sourceClip: {
        ..._0x47cf82.sourceClip,
        ref: _0x4f7e08 + "-local-part-" + (entryIndex + 1) + "-" + (_0x37ea3e + 1),
        script: [_0x457d0c, _0x418e2c, _0x45cb33].filter(Boolean).join(" "),
        transition: _0x37ea3e === _0x23413a - 1 ? normalizeText(_0x47cf82?.sourceClip?.transition) : "当前动作在下一镜中连续完成。"
      },
      shot: {
        ..._0x3225ab,
        durationSec: _0x5d251f,
        visual: _0x457d0c,
        dialogue: _0x418e2c,
        voiceover: _0x45cb33,
        audio: _0x2305ec,
        cutAfter: _0x37ea3e === _0x23413a - 1 ? normalizeText(_0x3225ab?.cutAfter) || "allowed" : "allowed"
      }
    };
  });
}
function compareStoryEpisodeExperimentalPartitionCandidate(_0x2847b2, _0x38b958) {
  if (!_0x38b958) {
    return -1;
  }
  if (_0x2847b2.groupCount !== _0x38b958.groupCount) {
    return _0x2847b2.groupCount - _0x38b958.groupCount;
  }
  return _0x2847b2.penalty - _0x38b958.penalty;
}
function partitionStoryEpisodeExperimentalSceneShots(_0x36cdbe = [], {
  maxDurationSeconds = 15,
  minDurationSeconds = STORY_EPISODE_EXPERIMENTAL_MIN_CLIP_DURATION_SECONDS
} = {}) {
  if (!_0x36cdbe.length) {
    return [];
  }
  const _0x4f4bab = Math.max(1, normalizePositiveNumber(maxDurationSeconds) || 15);
  const _0x31f559 = Math.max(0, normalizePositiveNumber(minDurationSeconds) || 0);
  _0x36cdbe = _0x36cdbe.flatMap((_0x3e65aa, _0x48071e) => splitStoryEpisodeExperimentalOverlongEntry(_0x3e65aa, {
    maximum: _0x4f4bab,
    targetMaximum: _0x4f4bab,
    entryIndex: _0x48071e
  }));
  const _0x3fd712 = Math.max(_0x31f559, _0x4f4bab * 0.68);
  const _0xe5c627 = new Map();
  const _0x245847 = _0x113e5d => {
    if (_0x113e5d >= _0x36cdbe.length) {
      return {
        groupCount: 0,
        penalty: 0,
        groups: []
      };
    }
    if (_0xe5c627.has(_0x113e5d)) {
      return _0xe5c627.get(_0x113e5d);
    }
    let _0x2001e7 = 0;
    let _0x52b8a3 = null;
    for (let _0x180566 = _0x113e5d; _0x180566 < _0x36cdbe.length; _0x180566 += 1) {
      const _0x3301fb = _0x180566 - _0x113e5d + 1;
      if (_0x3301fb > STORY_EPISODE_EXPERIMENTAL_MAX_FINAL_SHOTS_PER_CLIP) {
        break;
      }
      _0x2001e7 += Number(_0x36cdbe[_0x180566]?.shot?.durationSec || 0);
      if (_0x2001e7 > _0x4f4bab + 0.001) {
        break;
      }
      const _0x4f584a = _0x245847(_0x180566 + 1);
      if (!_0x4f584a) {
        continue;
      }
      const _0x14be8 = normalizeText(_0x36cdbe[_0x180566]?.shot?.cutAfter).toLowerCase();
      const _0x1fa68b = _0x180566 === _0x36cdbe.length - 1 || _0x14be8 === "preferred" ? 0 : _0x14be8 === "forbidden" ? 2500 : 25;
      const _0x121ead = _0x2001e7 < _0x31f559 ? (_0x31f559 - _0x2001e7) * 300 : 0;
      const _0x3c681e = (_0x2001e7 - _0x3fd712) ** 2;
      const _0x3bb802 = (_0x3301fb - STORY_EPISODE_EXPERIMENTAL_PREFERRED_SHOTS_PER_CLIP) ** 2 * 75 + (_0x3301fb < 3 ? (3 - _0x3301fb) * 500 : 0);
      const _0x20a649 = {
        groupCount: _0x4f584a.groupCount + 1,
        penalty: _0x4f584a.penalty + _0x1fa68b + _0x121ead + _0x3c681e + _0x3bb802,
        groups: [_0x36cdbe.slice(_0x113e5d, _0x180566 + 1), ..._0x4f584a.groups]
      };
      if (compareStoryEpisodeExperimentalPartitionCandidate(_0x20a649, _0x52b8a3) < 0) {
        _0x52b8a3 = _0x20a649;
      }
    }
    _0xe5c627.set(_0x113e5d, _0x52b8a3);
    return _0x52b8a3;
  };
  const _0x269389 = _0x245847(0);
  if (!_0x269389) {
    const _0x189e81 = _0x36cdbe.find(_0x1f0195 => Number(_0x1f0195?.shot?.durationSec || 0) > _0x4f4bab + 0.001);
    const _0x21b770 = Number(_0x189e81?.shot?.durationSec || 0);
    throw new Error(_0x21b770 ? "实验分镜存在单镜 " + _0x21b770.toFixed(1) + " 秒，超过 " + _0x4f4bab + " 秒上限；单镜必须由 Agent 拆成连续镜头。" : "实验分镜无法在场景内组成有效视频片段。");
  }
  return _0x269389.groups;
}
function joinStoryEpisodeExperimentalClipText(_0x762bcd = []) {
  return [...new Set(_0x762bcd.map(normalizeText).filter(Boolean))].join("；");
}
export function repackStoryEpisodeExperimentalClips({
  episodeRef = "",
  clipPlans = [],
  completedPlanResults = [],
  maxDurationSeconds = 15,
  minDurationSeconds = STORY_EPISODE_EXPERIMENTAL_MIN_CLIP_DURATION_SECONDS,
  promptExperiment = false,
  preserveSourceGroups = false
} = {}) {
  const _0x1b7d52 = a173_0x3e308f(episodeRef, "episode-1");
  const _0x4483ac = new Map((Array.isArray(clipPlans) ? clipPlans : []).map(_0xff3704 => [normalizeText(_0xff3704?.ref), _0xff3704]));
  const _0x1e1684 = new Map((Array.isArray(completedPlanResults) ? completedPlanResults : []).map(_0x263cab => [normalizeText(_0x263cab?.sourcePlanRef), _0x263cab]));
  const _0x1fd2ea = [];
  for (const _0xdd45a3 of _0x4483ac.values()) {
    const _0x262782 = _0x1e1684.get(normalizeText(_0xdd45a3?.ref));
    for (const _0x4f0d12 of Array.isArray(_0x262782?.clips) ? _0x262782.clips : []) {
      const _0x24c93b = Array.isArray(_0x4f0d12?.shots) ? _0x4f0d12.shots : [];
      _0x24c93b.forEach((_0x3f5b11, _0x1d5e39) => {
        _0x1fd2ea.push({
          plan: _0xdd45a3,
          sourceClip: _0x4f0d12,
          shot: {
            ..._0x3f5b11,
            cutAfter: normalizeText(_0x3f5b11?.cutAfter) || (_0x1d5e39 === _0x24c93b.length - 1 ? "preferred" : "allowed")
          }
        });
      });
    }
  }
  if (!_0x1fd2ea.length) {
    throw new Error("实验分批没有可用于重组的分镜。");
  }
  if (preserveSourceGroups) {
    const _0x43f43b = [];
    for (const _0x262fac of _0x4483ac.values()) {
      const _0x576b0d = _0x1e1684.get(normalizeText(_0x262fac?.ref));
      for (const _0x3d9ae4 of Array.isArray(_0x576b0d?.clips) ? _0x576b0d.clips : []) {
        const _0x31631b = Array.isArray(_0x3d9ae4?.shots) ? _0x3d9ae4.shots : [];
        if (!_0x31631b.length) {
          continue;
        }
        _0x43f43b.push({
          ..._0x3d9ae4,
          ref: _0x1b7d52 + "-experimental-clip-" + (_0x43f43b.length + 1),
          title: formatStoryEpisodeClipTitle(_0x43f43b.length),
          shots: _0x31631b,
          contentDurationSec: Number(getStoryEpisodeSplitShotsDuration(_0x31631b).toFixed(1)),
          durationSec: Number(getStoryEpisodeSplitShotsDuration(_0x31631b).toFixed(1)),
          assetRefs: [...new Set(_0x31631b.flatMap(_0x318f14 => _0x318f14?.assetRefs || []))],
          sourcePlanRefs: [normalizeText(_0x262fac?.ref)].filter(Boolean)
        });
      }
    }
    if (promptExperiment) {
      return addStoryEpisodeDirectorContinuityHandoffs(_0x43f43b);
    } else {
      return _0x43f43b;
    }
  }
  const _0x55fe0b = [];
  let _0x37ab67 = [];
  let _0x1fe922 = "";
  _0x1fd2ea.forEach(_0x35d9db => {
    const _0x57fe00 = [normalizeText(_0x35d9db.plan?.sourceSceneRef), normalizeText(_0x35d9db.plan?.sceneAssetRef), normalizeText(_0x35d9db.plan?.sceneAppearanceRef)].join("|");
    if (_0x37ab67.length && _0x57fe00 !== _0x1fe922) {
      _0x55fe0b.push(_0x37ab67);
      _0x37ab67 = [];
    }
    _0x1fe922 = _0x57fe00;
    _0x37ab67.push(_0x35d9db);
  });
  if (_0x37ab67.length) {
    _0x55fe0b.push(_0x37ab67);
  }
  const _0x385543 = _0x55fe0b.flatMap(_0x5b68fb => partitionStoryEpisodeExperimentalSceneShots(_0x5b68fb, {
    maxDurationSeconds: maxDurationSeconds,
    minDurationSeconds: minDurationSeconds
  }));
  const _0x2f7ffe = _0x385543.map((_0x5221c2, _0x3f7858) => {
    const _0x4122d9 = [...new Map(_0x5221c2.map(_0x596044 => [normalizeText(_0x596044.sourceClip?.ref), _0x596044.sourceClip])).values()];
    const _0x4da58b = [...new Set(_0x5221c2.map(_0x417928 => normalizeText(_0x417928.plan?.ref)))];
    const _0x594027 = _0x5221c2.map(_0xd57d2f => _0xd57d2f.shot);
    const _0x4e0eb6 = Number(getStoryEpisodeSplitShotsDuration(_0x594027).toFixed(1));
    const _0x5cb4ae = Number(Math.max(normalizePositiveNumber(minDurationSeconds) || 0, _0x4e0eb6).toFixed(1));
    return {
      ref: _0x1b7d52 + "-experimental-clip-" + (_0x3f7858 + 1),
      title: formatStoryEpisodeClipTitle(_0x3f7858),
      script: joinStoryEpisodeExperimentalClipText(_0x4122d9.map(_0x235c8e => _0x235c8e?.script)),
      creativeIntent: joinStoryEpisodeExperimentalClipText(_0x4122d9.map(_0x48684a => _0x48684a?.creativeIntent)),
      transition: joinStoryEpisodeExperimentalClipText(_0x4122d9.map(_0x26f83c => _0x26f83c?.transition)),
      shots: _0x594027,
      contentDurationSec: _0x4e0eb6,
      durationSec: _0x5cb4ae,
      assetRefs: [...new Set(_0x594027.flatMap(_0x33c248 => _0x33c248?.assetRefs || []))],
      sourcePlanRefs: _0x4da58b
    };
  });
  if (!promptExperiment) {
    return _0x2f7ffe;
  }
  return addStoryEpisodeDirectorContinuityHandoffs(_0x2f7ffe);
}
function addStoryEpisodeDirectorContinuityHandoffs(_0x331a58 = []) {
  return _0x331a58.map((_0x1ee52a, _0x2b3597) => {
    const _0x2ef3e3 = _0x2b3597 > 0 ? _0x331a58[_0x2b3597 - 1] : null;
    const _0xfa6246 = _0x2ef3e3?.shots?.at(-1) || null;
    const _0x4be709 = _0x1ee52a?.shots?.[0] || null;
    return {
      ..._0x1ee52a,
      directorContinuityTest: true,
      continuityHandoff: {
        previousExitState: normalizeText(_0xfa6246?.visual),
        previousEndCamera: normalizeText(_0xfa6246?.camera),
        currentEntryState: normalizeText(_0x4be709?.visual),
        currentOpeningCamera: normalizeText(_0x4be709?.camera),
        transitionFromPrevious: normalizeText(_0x4be709?.transitionFromPrevious)
      }
    };
  });
}
function createStoryEpisodeClipDurationError({
  clip = {},
  clipIndex = 0,
  clipCount = 0,
  sourceShots = [],
  shots = [],
  durationSec = 0,
  maxDurationSeconds = 15
} = {}) {
  const _0x49252c = formatStoryEpisodeClipTitle(clipIndex);
  const _0x2f6c92 = Number(durationSec.toFixed(1));
  const _0x3d722b = new Error("片段“" + _0x49252c + "”片段总时长 " + _0x2f6c92 + " 秒超过 " + maxDurationSeconds + " 秒上限；需要由 Agent 按完整动作节拍、对白轮次或情绪转折重新规划。");
  _0x3d722b.validationDetails = {
    type: "clip_duration_overflow",
    clip: {
      index: clipIndex + 1,
      count: clipCount,
      ref: a173_0x3e308f(clip?.ref, "clip-" + (clipIndex + 1)),
      correctedDurationSec: _0x2f6c92,
      maxDurationSec: maxDurationSeconds,
      overflowSeconds: Number((durationSec - maxDurationSeconds).toFixed(1)),
      shots: shots.map((_0x30e934, _0x4ba281) => ({
        index: _0x4ba281 + 1,
        providedDurationSec: normalizePositiveNumber(sourceShots[_0x4ba281]?.durationSec || sourceShots[_0x4ba281]?.durationSeconds),
        correctedDurationSec: Number(Number(_0x30e934.durationSec).toFixed(1)),
        time: _0x30e934.time,
        visual: _0x30e934.visual,
        dialogue: _0x30e934.dialogue,
        voiceover: _0x30e934.voiceover
      }))
    }
  };
  return _0x3d722b;
}
function createStoryEpisodeClipDurationConstraintError({
  clip = {},
  clipIndex = 0,
  clipCount = 0,
  durationSec = 0,
  durationConstraints = {}
} = {}) {
  const _0x393407 = formatStoryEpisodeClipTitle(clipIndex);
  const _0x4f17cc = Number(Number(durationSec).toFixed(1));
  const _0x2e5004 = Array.isArray(durationConstraints.allowedSeconds) ? durationConstraints.allowedSeconds : [];
  const _0x18ff65 = _0x2e5004.length ? "只允许 " + _0x2e5004.join("、") + " 秒" : (durationConstraints.minSeconds || 0) + " 至 " + (durationConstraints.maxSeconds || "不限") + " 秒" + (durationConstraints.stepSeconds ? "、步进 " + durationConstraints.stepSeconds + " 秒" : "");
  const _0x111225 = new Error("片段“" + _0x393407 + "”总时长 " + _0x4f17cc + " 秒不符合当前视频模型时长约束（" + _0x18ff65 + "）；必须由 Agent 重新分组，客户端未修改原始时长。");
  _0x111225.validationDetails = {
    type: "clip_duration_unsupported",
    clip: {
      index: clipIndex + 1,
      count: clipCount,
      ref: a173_0x3e308f(clip?.ref, "clip-" + (clipIndex + 1)),
      durationSec: _0x4f17cc,
      minDurationSec: durationConstraints.minSeconds || 0,
      maxDurationSec: durationConstraints.maxSeconds || 0,
      stepDurationSec: durationConstraints.stepSeconds || 0,
      allowedDurationSeconds: _0x2e5004
    }
  };
  return _0x111225;
}
function isStoryEpisodeClipDurationSupported(_0x115c5a, _0x51731d = null) {
  if (!_0x51731d) {
    return true;
  }
  const _0x5e0303 = Number(_0x115c5a);
  if (!Number.isFinite(_0x5e0303) || _0x5e0303 <= 0) {
    return false;
  }
  const _0x2e0ff5 = Array.isArray(_0x51731d.allowedSeconds) ? _0x51731d.allowedSeconds : [];
  if (_0x2e0ff5.length) {
    return _0x2e0ff5.some(_0x3015be => Math.abs(Number(_0x3015be) - _0x5e0303) < 0.000001);
  }
  if (_0x51731d.minSeconds && _0x5e0303 < _0x51731d.minSeconds) {
    return false;
  }
  if (_0x51731d.maxSeconds && _0x5e0303 > _0x51731d.maxSeconds) {
    return false;
  }
  if (_0x51731d.stepSeconds) {
    const _0x1845f0 = _0x51731d.minSeconds || 0;
    const _0x4778e3 = (_0x5e0303 - _0x1845f0) / _0x51731d.stepSeconds;
    if (Math.abs(_0x4778e3 - Math.round(_0x4778e3)) >= 0.000001) {
      return false;
    }
  }
  return true;
}
function tokenizeStorySpokenTextAtAuthoredPauses(_0x538348 = "") {
  const _0x5123ae = normalizeText(_0x538348);
  if (!_0x5123ae) {
    return {
      speakerPrefix: "",
      units: []
    };
  }
  const _0x12424b = getStoryDialogueSpeakerPrefix(_0x5123ae);
  const _0x32bded = _0x12424b ? _0x5123ae.slice(_0x12424b.length) : _0x5123ae;
  const _0x279ca8 = /(?:…{2,}|\.{3,}|—{2,}|[。！？!?；;])(?:[”"’']+)?/gu;
  const _0x5c8c1b = [];
  let _0x4e5d8d = 0;
  let _0xe0813c;
  while ((_0xe0813c = _0x279ca8.exec(_0x32bded)) !== null) {
    const _0x493cb8 = _0xe0813c.index + _0xe0813c[0].length;
    const _0x5ed5f5 = _0x32bded.slice(_0x4e5d8d, _0x493cb8);
    if (_0x5ed5f5.trim()) {
      _0x5c8c1b.push(_0x5ed5f5);
    }
    _0x4e5d8d = _0x493cb8;
  }
  const _0x4a9f67 = _0x32bded.slice(_0x4e5d8d);
  if (_0x4a9f67.trim()) {
    _0x5c8c1b.push(_0x4a9f67);
  }
  const _0x3e2805 = [];
  _0x5c8c1b.forEach(_0x1af957 => {
    if (/^[\s“”"'‘’…—.]+$/u.test(_0x1af957) && _0x3e2805.length) {
      _0x3e2805[_0x3e2805.length - 1] += _0x1af957;
      return;
    }
    _0x3e2805.push(_0x1af957);
  });
  return {
    speakerPrefix: _0x12424b,
    units: _0x3e2805
  };
}
function getStorySpokenSegmentMinimumSeconds(_0x225c04 = {}, _0x427c2 = "", _0x1c68e6 = "") {
  return countStorySpokenUnits(_0x1c68e6) / STORY_MAX_SPOKEN_UNITS_PER_SECOND;
}
function getStorySpokenChunkText(_0x2e7e68 = {}, _0x5e3ed2 = "") {
  const _0x554d16 = (Array.isArray(_0x2e7e68.units) ? _0x2e7e68.units : []).join("");
  if (_0x5e3ed2 && _0x554d16.startsWith(_0x5e3ed2)) {
    return _0x554d16;
  } else {
    return "" + _0x5e3ed2 + _0x554d16;
  }
}
function getStorySpokenChunkMinimumSeconds(_0x7296d2, _0x2e1645, _0x30024d, _0xa219b9) {
  return getStorySpokenSegmentMinimumSeconds(_0x7296d2, _0x2e1645, getStorySpokenChunkText(_0x30024d, _0xa219b9));
}
function getStoryAuthoredPauseBoundaryPriority(_0x2f1e3f = {}) {
  const _0x4d2b94 = (Array.isArray(_0x2f1e3f?.units) ? _0x2f1e3f.units : []).join("");
  if (/[。！？!?；;][”"’']?$/u.test(_0x4d2b94)) {
    return 100;
  }
  if (/[”"’']—{2,}$/u.test(_0x4d2b94)) {
    return 90;
  }
  if (/—{2,}[”"’']?$/u.test(_0x4d2b94)) {
    return 50;
  }
  if (/(?:…{2,}|\.{3,})[”"’']?$/u.test(_0x4d2b94)) {
    return 40;
  }
  return 0;
}
function splitStoryEpisodeOverlongSpokenShot(_0x3410d5 = {}, {
  maximum = 15
} = {}) {
  const _0xa6d292 = normalizePositiveNumber(_0x3410d5?.durationSec);
  if (!_0xa6d292 || _0xa6d292 <= maximum + 0.001) {
    return [_0x3410d5];
  }
  const _0x4a4a98 = ["dialogue", "voiceover"].filter(_0x3c555e => normalizeText(_0x3410d5?.[_0x3c555e]));
  if (_0x4a4a98.length !== 1) {
    return [_0x3410d5];
  }
  const _0x3c28af = _0x4a4a98[0];
  const {
    speakerPrefix: _0x551304,
    units: _0x5b46e4
  } = tokenizeStorySpokenTextAtAuthoredPauses(_0x3410d5[_0x3c28af]);
  if (_0x5b46e4.length < 2) {
    return [_0x3410d5];
  }
  let _0x2cdf54 = _0x5b46e4.map(_0x457e4c => ({
    units: [_0x457e4c]
  }));
  for (const _0x22f70c of _0x2cdf54) {
    const _0x4089ce = getStorySpokenChunkMinimumSeconds(_0x3410d5, _0x3c28af, _0x22f70c, _0x551304);
    if (_0x4089ce > maximum + 0.001) {
      return [_0x3410d5];
    }
  }
  while (_0x2cdf54.length > 1) {
    let _0x315198 = null;
    for (let _0x3cc659 = 0; _0x3cc659 < _0x2cdf54.length - 1; _0x3cc659 += 1) {
      const _0x3d70cc = {
        units: [..._0x2cdf54[_0x3cc659].units, ..._0x2cdf54[_0x3cc659 + 1].units]
      };
      const _0x5f00b2 = getStorySpokenChunkMinimumSeconds(_0x3410d5, _0x3c28af, _0x3d70cc, _0x551304);
      if (_0x5f00b2 > maximum + 0.001) {
        continue;
      }
      const _0x3254db = [..._0x2cdf54.slice(0, _0x3cc659), _0x3d70cc, ..._0x2cdf54.slice(_0x3cc659 + 2)];
      const _0x1de6ef = _0x3254db.reduce((_0x2d402d, _0x5b58bd) => _0x2d402d + getStorySpokenChunkMinimumSeconds(_0x3410d5, _0x3c28af, _0x5b58bd, _0x551304), 0);
      const _0x8140f = Math.max(_0xa6d292, _0x1de6ef);
      if (_0x8140f > _0x3254db.length * maximum + 0.001) {
        continue;
      }
      const _0x236394 = getStoryAuthoredPauseBoundaryPriority(_0x2cdf54[_0x3cc659]);
      if (!_0x315198 || _0x236394 < _0x315198.removedBoundaryPriority || _0x236394 === _0x315198.removedBoundaryPriority && _0x5f00b2 < _0x315198.mergedMinimumSeconds) {
        _0x315198 = {
          chunks: _0x3254db,
          mergedMinimumSeconds: _0x5f00b2,
          removedBoundaryPriority: _0x236394
        };
      }
    }
    if (!_0x315198) {
      break;
    }
    _0x2cdf54 = _0x315198.chunks;
  }
  const _0x14e158 = _0x2cdf54.map(_0x2bbbd2 => Math.ceil(getStorySpokenChunkMinimumSeconds(_0x3410d5, _0x3c28af, _0x2bbbd2, _0x551304) * 10 - 0.001));
  const _0x114430 = Math.round(maximum * 10);
  const _0x28ae59 = Math.max(Math.round(_0xa6d292 * 10), _0x14e158.reduce((_0x250aaa, _0xb01c0d) => _0x250aaa + _0xb01c0d, 0));
  if (_0x28ae59 > _0x2cdf54.length * _0x114430) {
    return [_0x3410d5];
  }
  const _0x480943 = [..._0x14e158];
  let _0x2b34d5 = _0x28ae59 - _0x480943.reduce((_0x2658f2, _0x46b047) => _0x2658f2 + _0x46b047, 0);
  while (_0x2b34d5 > 0) {
    let _0x47d428 = false;
    for (let _0x12cd67 = 0; _0x12cd67 < _0x480943.length && _0x2b34d5 > 0; _0x12cd67 += 1) {
      if (_0x480943[_0x12cd67] >= _0x114430) {
        continue;
      }
      _0x480943[_0x12cd67] += 1;
      _0x2b34d5 -= 1;
      _0x47d428 = true;
    }
    if (!_0x47d428) {
      break;
    }
  }
  return _0x2cdf54.map((_0x154884, _0x14f780) => ({
    ..._0x3410d5,
    durationSec: _0x480943[_0x14f780] / 10,
    [_0x3c28af]: getStorySpokenChunkText(_0x154884, _0x551304)
  }));
}
function repackStoryEpisodeSplitClipsLocally(_0x47c9e1 = [], {
  maxDurationSeconds = 15
} = {}) {
  const _0x547058 = normalizePositiveNumber(maxDurationSeconds) || 15;
  return (Array.isArray(_0x47c9e1) ? _0x47c9e1 : []).flatMap((_0xfd2195, _0x562bc5) => {
    const _0x16f440 = [];
    let _0x59e5a2 = [];
    let _0x37818b = 0;
    const _0x6547d7 = (Array.isArray(_0xfd2195?.shots) ? _0xfd2195.shots : []).flatMap(_0x3964ca => splitStoryEpisodeOverlongSpokenShot(_0x3964ca, {
      maximum: _0x547058
    }));
    for (const _0x10e7f4 of _0x6547d7) {
      const _0x5eb99f = normalizePositiveNumber(_0x10e7f4?.durationSec);
      if (!_0x5eb99f) {
        throw createStoryEpisodeClipDurationError({
          clip: _0xfd2195,
          clipIndex: _0x562bc5,
          clipCount: _0x47c9e1.length,
          sourceShots: [_0x10e7f4],
          shots: [_0x10e7f4],
          durationSec: _0x5eb99f || 0,
          maxDurationSeconds: _0x547058
        });
      }
      if (_0x5eb99f > _0x547058) {
        if (_0x59e5a2.length) {
          _0x16f440.push(_0x59e5a2);
          _0x59e5a2 = [];
          _0x37818b = 0;
        }
        _0x16f440.push([_0x10e7f4]);
        continue;
      }
      if (_0x59e5a2.length && _0x37818b + _0x5eb99f > _0x547058) {
        _0x16f440.push(_0x59e5a2);
        _0x59e5a2 = [];
        _0x37818b = 0;
      }
      _0x59e5a2.push(_0x10e7f4);
      _0x37818b += _0x5eb99f;
    }
    if (_0x59e5a2.length) {
      _0x16f440.push(_0x59e5a2);
    }
    if (_0x16f440.length <= 1) {
      return [_0xfd2195];
    }
    return _0x16f440.map((_0x1b5661, _0x5ca4a8) => {
      const _0x4f5794 = _0x1b5661.flatMap(_0x481ad9 => [normalizeText(_0x481ad9?.visual), normalizeText(_0x481ad9?.dialogue), normalizeText(_0x481ad9?.voiceover)]).filter(Boolean).join("；");
      return {
        ..._0xfd2195,
        ref: _0xfd2195.ref + "-part-" + (_0x5ca4a8 + 1),
        script: _0x4f5794 || _0xfd2195.script,
        shots: _0x1b5661,
        durationSec: Number(getStoryEpisodeSplitShotsDuration(_0x1b5661).toFixed(1)),
        assetRefs: [...new Set(_0x1b5661.flatMap(_0x1dbfb3 => _0x1dbfb3.assetRefs || []))]
      };
    });
  });
}
function hasExplicitStoryEpisodeVoiceover(_0x3f8b5a = {}) {
  const _0x1ca116 = [_0x3f8b5a?.script?.fullText, _0x3f8b5a?.fullScript, _0x3f8b5a?.scriptText, ...(Array.isArray(_0x3f8b5a?.script?.scenes) ? _0x3f8b5a.script.scenes.map(_0x1a8821 => _0x1a8821?.body) : [])].map(_0x257382 => String(_0x257382 || "")).filter(Boolean);
  return _0x1ca116.some(_0x17a868 => /^\s*(?:旁白|画外音|VO|V\.O\.?|OS|O\.S\.?)\s*[：:]/imu.test(_0x17a868));
}
export function parseStoryEpisodeSplitResult(_0x21894a, {
  episodeRef = "",
  episode = {},
  scriptMode = "",
  constraints = {},
  assets = [],
  assetRefs = [],
  clipPlans = [],
  minimumShotsPerClip = 2,
  maximumShotsPerClip = 5,
  enforceMaxDuration = true,
  repairMissingShotFields = false,
  allowEmptyAudio = true,
  requireAllPlanCharacters = true,
  completeCharacterAssetUsages = true,
  completePlanSceneUsage = false,
  includeCutAfter = false,
  repackOverlongClips = false,
  enforceSingleSceneAssetUsage = true,
  clipDurationConstraints = null,
  rejectUnsupportedClipDuration = true,
  promptMode = "seedance-2.0"
} = {}) {
  const _0x5ba468 = normalizeText(scriptMode) === STORY_SCRIPT_MODE_PLOT && !hasExplicitStoryEpisodeVoiceover(episode);
  const _0xde8810 = createStoryEpisodeSplitCompactDialogueCatalog(episode, assets);
  const _0x1d6021 = normalizeStoryPlanningConstraints(constraints);
  const _0x4fdead = isStoryContinuousTimelinePromptMode(promptMode);
  const _0x476fa9 = normalizeStoryEpisodeClipDurationConstraints(clipDurationConstraints);
  const _0x3d88c1 = Math.max(1, Math.min(5, Math.trunc(Number(minimumShotsPerClip) || 2)));
  const _0x324311 = Math.max(0, Math.trunc(Number(maximumShotsPerClip) || 0));
  const _0x10d729 = parseStrictJson(getResultText(_0x21894a), "Agent 未返回片段拆分结果。");
  const _0x2f4623 = expandStoryEpisodeSplitCompactData(_0x10d729, {
    episodeRef: episodeRef,
    episode: episode,
    assets: assets
  });
  const _0x1a22fb = buildStoryEpisodeSplitAssetCatalog(assets, assetRefs);
  const _0x34bc12 = new Map((Array.isArray(clipPlans) ? clipPlans : []).map(_0x1a8de3 => [a173_0x3e308f(_0x1a8de3?.ref, ""), _0x1a8de3]));
  const _0x13fab4 = Array.isArray(_0x2f4623.clips) ? _0x2f4623.clips.map((_0x45a45b, _0x5ced13) => {
    const _0x3440de = formatStoryEpisodeClipTitle(_0x5ced13);
    const _0x10c0c1 = a173_0x3e308f(_0x45a45b?.ref, "clip-" + (_0x5ced13 + 1));
    const _0x219442 = _0x34bc12.get(_0x10c0c1) || null;
    const _0x241d84 = repairMissingShotFields ? normalizeStoryEpisodeExperimentalStandaloneText : normalizeText;
    const _0x5f6a01 = Array.isArray(_0x45a45b?.shots) ? _0x45a45b.shots : [];
    const _0x513258 = _0x5f6a01.flatMap(_0x1a8917 => [normalizeText(_0x1a8917?.visual), normalizeText(_0x1a8917?.dialogue), _0x5ba468 ? "" : normalizeText(_0x1a8917?.voiceover)]).filter(Boolean).join("；");
    const _0x1811a0 = _0x241d84(_0x45a45b?.script) || (repairMissingShotFields ? normalizeText(_0x219442?.beat) || _0x241d84(_0x513258) : "");
    const _0x5a0699 = _0x241d84(_0x45a45b?.creativeIntent);
    const _0x5bdcc2 = _0x241d84(_0x45a45b?.transition);
    if (!_0x1811a0 || !repairMissingShotFields && (!_0x5a0699 || !_0x5bdcc2)) {
      throw new Error(_0x3440de + " 缺少 script、creativeIntent 或 transition。");
    }
    validateStoryEpisodeSplitClipIndependence({
      clipLabel: _0x3440de,
      script: _0x1811a0,
      creativeIntent: _0x5a0699,
      transition: _0x5bdcc2
    });
    if (_0x5f6a01.length < _0x3d88c1) {
      throw new Error("片段“" + _0x3440de + "”至少包含 " + _0x3d88c1 + " 个分镜。");
    }
    if (_0x324311 && _0x5f6a01.length > _0x324311) {
      throw new Error("片段“" + _0x3440de + "”最多包含 " + _0x324311 + " 个分镜。");
    }
    const _0x2786c1 = _0x5f6a01.map((_0x52d199, _0x317ff3) => {
      const _0x51ec5d = _0x317ff3 === 0;
      const _0x1f4533 = _0x317ff3 === _0x5f6a01.length - 1;
      const _0x473a41 = [...new Set([_0x51ec5d ? normalizeText(_0x219442?.entryState) : "", _0x1f4533 ? normalizeText(_0x219442?.exitState) : ""].filter(Boolean))].join("；") || _0x1811a0;
      const _0x561b4c = normalizeStoryEpisodeSplitShot(_0x52d199, {
        clipTitle: _0x3440de,
        index: _0x317ff3,
        assetCatalog: _0x1a22fb,
        fallbacks: repairMissingShotFields ? {
          time: normalizeText(_0x219442?.time),
          visual: _0x473a41,
          camera: "中景，平视机位，固定拍摄，主体居中构图，50mm标准镜头。",
          audio: allowEmptyAudio ? "" : normalizeText(_0x52d199?.dialogue || _0x52d199?.voiceover) ? "对白与环境底噪。" : "环境音。",
          cutAfter: _0x1f4533 ? "preferred" : "allowed"
        } : {},
        allowEmptyAudio: allowEmptyAudio,
        includeCutAfter: includeCutAfter,
        includeTimeline: _0x4fdead
      });
      const _0x26f51e = completeStoryEpisodeSplitDialogueSpeaker(_0x561b4c.dialogue, _0xde8810);
      const _0x424ebe = _0x26f51e === _0x561b4c.dialogue ? _0x561b4c : {
        ..._0x561b4c,
        dialogue: _0x26f51e
      };
      if (_0x5ba468) {
        return {
          ..._0x424ebe,
          voiceover: ""
        };
      } else {
        return _0x424ebe;
      }
    });
    const _0x580fcd = mergeStoryEpisodeSplitDialogueFragments(_0x2786c1, _0x219442?.dialogueUnits);
    if (_0x4fdead) {
      _0x580fcd.forEach((_0x193761, _0x5e87e1) => {
        const _0x48f0f0 = _0x5e87e1 === 0 ? 0 : _0x580fcd[_0x5e87e1 - 1].endSec;
        if (_0x193761.startSec !== _0x48f0f0) {
          throw new Error("片段“" + _0x3440de + "”的时间轴不连续：分镜 " + (_0x5e87e1 + 1) + " 应从 " + _0x48f0f0 + " 秒开始。");
        }
      });
    }
    const _0x175953 = completeCharacterAssetUsages ? completeStoryEpisodeSplitCharacterAssetUsages(_0x580fcd, {
      clipPlan: _0x219442,
      assetCatalog: _0x1a22fb,
      clipTitle: _0x3440de,
      requireAllPlanCharacters: requireAllPlanCharacters
    }) : _0x580fcd;
    const _0x2567b1 = completePlanSceneUsage ? completeStoryEpisodeSplitSceneAssetUsage(_0x175953, {
      clipPlan: _0x219442,
      assetCatalog: _0x1a22fb,
      clipTitle: _0x3440de
    }) : _0x175953;
    const _0x57ac39 = _0x5f6a01.some(_0x29e271 => Array.isArray(_0x29e271?.assetUsages));
    const _0x30e30b = new Set([..._0x1a22fb.assetByRef.values()].filter(_0x223973 => _0x223973.kind === "scene").map(_0x49c9a3 => _0x49c9a3.assetRef));
    if (enforceSingleSceneAssetUsage && _0x57ac39 && _0x30e30b.size) {
      const _0x14b7d5 = [...new Set(_0x2567b1.flatMap(_0x27d0a0 => _0x27d0a0.assetUsages).map(_0x1309ff => _0x1309ff.assetRef).filter(_0x3bb119 => _0x30e30b.has(_0x3bb119)))];
      if (_0x14b7d5.length !== 1) {
        throw new Error(_0x14b7d5.length ? "片段“" + _0x3440de + "”引用了多个场景资产；每个片段只能设定在一个场景。" : "片段“" + _0x3440de + "”缺少场景资产；每个片段必须设定在一个场景。");
      }
    }
    const _0x40eb49 = Number(getStoryEpisodeSplitShotsDuration(_0x2567b1).toFixed(1));
    const _0x59cfe5 = !isStoryEpisodeClipDurationSupported(_0x40eb49, _0x476fa9) ? createStoryEpisodeClipDurationConstraintError({
      clip: _0x45a45b,
      clipIndex: _0x5ced13,
      clipCount: _0x2f4623.clips.length,
      durationSec: _0x40eb49,
      durationConstraints: _0x476fa9
    }) : null;
    if (_0x59cfe5 && rejectUnsupportedClipDuration) {
      throw _0x59cfe5;
    }
    if (enforceMaxDuration && _0x40eb49 > _0x1d6021.sceneMaxSeconds) {
      throw createStoryEpisodeClipDurationError({
        clip: _0x45a45b,
        clipIndex: _0x5ced13,
        clipCount: _0x2f4623.clips.length,
        sourceShots: _0x5f6a01,
        shots: _0x2567b1,
        durationSec: _0x40eb49,
        maxDurationSeconds: _0x1d6021.sceneMaxSeconds
      });
    }
    const _0x567028 = [...new Set(_0x2567b1.flatMap(_0x143a36 => _0x143a36.assetRefs))];
    return {
      ref: _0x10c0c1,
      title: _0x3440de,
      script: _0x1811a0,
      creativeIntent: _0x5a0699,
      transition: _0x5bdcc2,
      shots: _0x2567b1,
      durationSec: _0x40eb49,
      assetRefs: _0x567028,
      ...(_0x59cfe5 ? {
        durationValidation: {
          status: "unsupported",
          message: _0x59cfe5.message,
          details: _0x59cfe5.validationDetails
        }
      } : {})
    };
  }).filter(Boolean) : [];
  const _0x51bfdb = repackOverlongClips ? repackStoryEpisodeSplitClipsLocally(_0x13fab4, {
    maxDurationSeconds: _0x1d6021.sceneMaxSeconds
  }) : _0x13fab4;
  const _0x4fd4f4 = _0x51bfdb.map((_0x292172, _0x3dc2bf) => ({
    ..._0x292172,
    title: formatStoryEpisodeClipTitle(_0x3dc2bf)
  }));
  if (!_0x4fd4f4.length) {
    throw new Error("Agent 返回结果没有可用片段。");
  }
  const _0x357996 = _0x4fd4f4.reduce((_0x1aacbf, _0xacc7c0) => _0x1aacbf + _0xacc7c0.durationSec, 0);
  const _0x5031b5 = _0x4fd4f4.map(_0x70ce55 => _0x70ce55.ref);
  if (new Set(_0x5031b5).size !== _0x5031b5.length) {
    throw new Error("Agent 返回了重复的片段引用。");
  }
  const _0xb98477 = a173_0x3e308f(_0x2f4623.episodeRef || episodeRef, "episode-1");
  if (episodeRef && _0xb98477 !== a173_0x3e308f(episodeRef, "episode-1")) {
    throw new Error("Agent 返回的分集引用与当前分集不一致。");
  }
  return {
    schemaVersion: STORY_EPISODE_SPLIT_SCHEMA_VERSION,
    episodeRef: _0xb98477,
    totalDurationSeconds: _0x357996,
    clips: _0x4fd4f4
  };
}
function serializeStoryEpisodeSplitValidationError(_0x1b0754, {
  clipIndex = 0,
  clipCount = 0
} = {}) {
  const _0x5ef8ef = _0x1b0754?.validationDetails ? JSON.parse(JSON.stringify(_0x1b0754.validationDetails)) : null;
  if (_0x5ef8ef?.clip) {
    _0x5ef8ef.clip.index = clipIndex + 1;
    _0x5ef8ef.clip.count = clipCount;
  }
  return {
    message: normalizeText(_0x1b0754?.message || _0x1b0754) || "片段校验失败。",
    ...(_0x5ef8ef ? {
      validationDetails: _0x5ef8ef
    } : {})
  };
}
function normalizeStoryEpisodeSplitDraft(_0x37cbef, {
  episodeRef = "",
  episode = {},
  scriptMode = "",
  constraints = {},
  assets = [],
  clipPlans = [],
  minimumShotsPerClip = 2,
  maximumShotsPerClip = 5,
  enforceMaxDuration = true,
  repairMissingShotFields = false,
  allowEmptyAudio = true,
  requireAllPlanCharacters = true,
  completePlanSceneUsage = false,
  includeCutAfter = false,
  repackOverlongClips = false,
  enforceSingleSceneAssetUsage = true,
  clipDurationConstraints = null,
  rejectUnsupportedClipDuration = true,
  promptMode = "seedance-2.0"
} = {}) {
  const _0x45d2bb = getResultText(_0x37cbef);
  let _0x2d7f20;
  let _0x5e19aa = null;
  try {
    _0x2d7f20 = parseStrictJson(_0x45d2bb, "Agent 未返回片段拆分结果。");
  } catch (_0x368b23) {
    _0x5e19aa = _0x368b23;
  }
  if (!Array.isArray(_0x2d7f20?.clips)) {
    const _0xf0ad47 = extractCompleteJsonArrayItems(_0x45d2bb, "clips");
    if (_0xf0ad47.length) {
      _0x2d7f20 = {
        episodeRef: extractJsonStringProperty(_0x45d2bb, "episodeRef") || episodeRef,
        clips: _0xf0ad47
      };
    } else if (_0x5e19aa) {
      throw _0x5e19aa;
    }
  }
  if (!Array.isArray(_0x2d7f20.clips) || !_0x2d7f20.clips.length) {
    throw new Error("Agent 返回结果没有可用片段。");
  }
  const _0x2d74f7 = a173_0x3e308f(_0x2d7f20.episodeRef || episodeRef, "episode-1");
  if (episodeRef && _0x2d74f7 !== a173_0x3e308f(episodeRef, "episode-1")) {
    throw new Error("Agent 返回的分集引用与当前分集不一致。");
  }
  const _0x4320e8 = new Set();
  const _0x2e710c = _0x2d7f20.clips.map((_0x1d4ed5, _0x43418a) => {
    const _0x3393a0 = a173_0x3e308f(_0x1d4ed5?.ref, "clip-" + (_0x43418a + 1));
    const _0x2aa9fc = normalizeText(_0x1d4ed5?.ref) ? _0x1d4ed5 : {
      ..._0x1d4ed5,
      ref: _0x3393a0
    };
    try {
      const _0x1e3228 = parseStoryEpisodeSplitResult({
        episodeRef: _0x2d74f7,
        clips: [_0x2aa9fc]
      }, {
        episodeRef: _0x2d74f7,
        episode: episode,
        scriptMode: scriptMode,
        constraints: constraints,
        assets: assets,
        clipPlans: clipPlans,
        minimumShotsPerClip: minimumShotsPerClip,
        maximumShotsPerClip: maximumShotsPerClip,
        enforceMaxDuration: enforceMaxDuration,
        repairMissingShotFields: repairMissingShotFields,
        allowEmptyAudio: allowEmptyAudio,
        requireAllPlanCharacters: requireAllPlanCharacters,
        completePlanSceneUsage: completePlanSceneUsage,
        includeCutAfter: includeCutAfter,
        repackOverlongClips: repackOverlongClips,
        enforceSingleSceneAssetUsage: enforceSingleSceneAssetUsage,
        clipDurationConstraints: clipDurationConstraints,
        rejectUnsupportedClipDuration: rejectUnsupportedClipDuration,
        promptMode: promptMode
      });
      const _0x214145 = _0x1e3228.clips.find(_0x30d58f => _0x4320e8.has(_0x30d58f.ref));
      if (_0x214145) {
        throw new Error("Agent 返回了重复的片段引用“" + _0x214145.ref + "”。");
      }
      _0x1e3228.clips.forEach(_0x3bd01f => _0x4320e8.add(_0x3bd01f.ref));
      return {
        status: "valid",
        sourceIndex: _0x43418a,
        sourceClipRef: _0x3393a0,
        clips: _0x1e3228.clips
      };
    } catch (_0x437750) {
      return {
        status: "invalid",
        sourceIndex: _0x43418a,
        sourceClipRef: _0x3393a0,
        rawClips: [_0x2aa9fc],
        error: serializeStoryEpisodeSplitValidationError(_0x437750, {
          clipIndex: _0x43418a,
          clipCount: _0x2d7f20.clips.length
        })
      };
    }
  });
  return {
    schemaVersion: STORY_EPISODE_SPLIT_SCHEMA_VERSION,
    status: "draft",
    episodeRef: _0x2d74f7,
    items: _0x2e710c,
    attempts: 1
  };
}
function restoreStoryEpisodeSplitDraft(_0x3ff4ee = {}, {
  episodeRef = ""
} = {}) {
  const _0x462637 = a173_0x3e308f(_0x3ff4ee?.episodeRef || episodeRef, "episode-1");
  if (episodeRef && _0x462637 !== a173_0x3e308f(episodeRef, "episode-1")) {
    throw new Error("保存的分集草稿与当前分集不一致。");
  }
  const _0x22c6a5 = Array.isArray(_0x3ff4ee?.items) ? _0x3ff4ee.items : [];
  if (!_0x22c6a5.length) {
    throw new Error("没有可继续修复的分集草稿。");
  }
  return {
    schemaVersion: STORY_EPISODE_SPLIT_SCHEMA_VERSION,
    status: "draft",
    episodeRef: _0x462637,
    items: _0x22c6a5.map((_0x29d6ed, _0x394237) => ({
      ..._0x29d6ed,
      status: _0x29d6ed?.status === "valid" ? "valid" : "invalid",
      sourceIndex: Number.isInteger(_0x29d6ed?.sourceIndex) ? _0x29d6ed.sourceIndex : _0x394237,
      sourceClipRef: a173_0x3e308f(_0x29d6ed?.sourceClipRef, "clip-" + (_0x394237 + 1)),
      clips: _0x29d6ed?.status === "valid" && Array.isArray(_0x29d6ed?.clips) ? _0x29d6ed.clips : [],
      rawClips: _0x29d6ed?.status === "valid" ? [] : Array.isArray(_0x29d6ed?.rawClips) ? _0x29d6ed.rawClips : [],
      error: _0x29d6ed?.status === "valid" ? null : {
        message: normalizeText(_0x29d6ed?.error?.message) || "片段仍需修复。",
        ...(_0x29d6ed?.error?.validationDetails ? {
          validationDetails: _0x29d6ed.error.validationDetails
        } : {})
      }
    })),
    attempts: Math.max(1, Math.trunc(Number(_0x3ff4ee?.attempts) || 1))
  };
}
function getStoryEpisodeSplitDraftCounts(_0x445e06 = {}) {
  const _0x1cd7f3 = Array.isArray(_0x445e06?.items) ? _0x445e06.items : [];
  return {
    validClipCount: _0x1cd7f3.reduce((_0x18697d, _0x4b5493) => _0x18697d + (_0x4b5493?.status === "valid" && Array.isArray(_0x4b5493?.clips) ? _0x4b5493.clips.length : 0), 0),
    invalidItemCount: _0x1cd7f3.filter(_0x2af15c => _0x2af15c?.status !== "valid").length
  };
}
function finalizeStoryEpisodeSplitDraft(_0x3f100a = {}) {
  const {
    invalidItemCount: _0x25f44
  } = getStoryEpisodeSplitDraftCounts(_0x3f100a);
  if (_0x25f44) {
    return null;
  }
  const _0x2774c6 = _0x3f100a.items.flatMap(_0x1e018b => _0x1e018b.clips || []).map((_0x5d8375, _0x3118d7) => ({
    ..._0x5d8375,
    title: formatStoryEpisodeClipTitle(_0x3118d7)
  }));
  if (!_0x2774c6.length) {
    throw new Error("Agent 返回结果没有可用片段。");
  }
  const _0x3b0e66 = _0x2774c6.map(_0x2fd83d => _0x2fd83d.ref);
  if (new Set(_0x3b0e66).size !== _0x3b0e66.length) {
    throw new Error("Agent 返回了重复的片段引用。");
  }
  return {
    schemaVersion: STORY_EPISODE_SPLIT_SCHEMA_VERSION,
    episodeRef: _0x3f100a.episodeRef,
    totalDurationSeconds: _0x2774c6.reduce((_0x4dd388, _0x56679b) => _0x4dd388 + _0x56679b.durationSec, 0),
    clips: _0x2774c6,
    ...(typeof _0x3f100a?.rawResponse === "string" ? {
      rawResponse: _0x3f100a.rawResponse
    } : {})
  };
}
function createStoryEpisodeSplitPartialResult(_0x41ba4b = {}) {
  const _0x5769eb = _0x41ba4b.items.flatMap(_0x270966 => _0x270966?.status === "valid" && Array.isArray(_0x270966?.clips) ? _0x270966.clips : []).map((_0x1a89ce, _0x2af4cd) => ({
    ..._0x1a89ce,
    title: formatStoryEpisodeClipTitle(_0x2af4cd)
  }));
  const _0x306bbc = _0x41ba4b.items.filter(_0x1dcfeb => _0x1dcfeb?.status !== "valid").map(_0x189394 => ({
    sourceIndex: _0x189394.sourceIndex,
    sourceClipRef: _0x189394.sourceClipRef,
    message: normalizeText(_0x189394?.error?.message) || "片段仍需修复。",
    ...(_0x189394?.error?.validationDetails ? {
      validationDetails: _0x189394.error.validationDetails
    } : {})
  }));
  return {
    schemaVersion: STORY_EPISODE_SPLIT_SCHEMA_VERSION,
    status: "partial",
    episodeRef: _0x41ba4b.episodeRef,
    items: _0x41ba4b.items,
    clips: _0x5769eb,
    rejectedClips: _0x306bbc,
    totalDurationSeconds: _0x5769eb.reduce((_0x1d59ea, _0x3d4000) => _0x1d59ea + _0x3d4000.durationSec, 0),
    attempts: Math.max(1, Math.trunc(Number(_0x41ba4b?.attempts) || 1)),
    ...(typeof _0x41ba4b?.rawResponse === "string" ? {
      rawResponse: _0x41ba4b.rawResponse
    } : {})
  };
}
function throwStoryEpisodeSplitPartialResult(_0x40614e = {}) {
  const _0x5ee922 = createStoryEpisodeSplitPartialResult(_0x40614e);
  const _0x3362fa = _0x5ee922.clips.length;
  const _0x471fe9 = _0x5ee922.rejectedClips.length;
  const _0x2c1cc8 = _0x471fe9 === 1 ? normalizeText(_0x5ee922.rejectedClips[0]?.message) : "";
  const _0x841abc = new Error("分集拆分未完全通过：已保留 " + _0x3362fa + " 个合格片段，" + _0x471fe9 + " 个片段仍需修复。" + (_0x2c1cc8 ? " " + _0x2c1cc8 : ""));
  _0x841abc.name = "StoryEpisodeSplitPartialError";
  _0x841abc.partialResult = _0x5ee922;
  throw _0x841abc;
}
function reportStoryEpisodeSplitRequestDiagnostics(_0x232432, {
  phase = "full-generation",
  prompt = "",
  systemPrompt = "",
  failedClipCount = 0,
  carriesFullEpisodeContext = phase !== "targeted-repair",
  automaticCallLimit = 2,
  details = {}
} = {}) {
  const _0x1c1efe = _0x232432?.info || _0x232432?.log;
  if (typeof _0x1c1efe !== "function") {
    return null;
  }
  const _0x3d345a = String(prompt || "");
  const _0x5b3369 = String(systemPrompt || "");
  const _0x39f869 = typeof TextEncoder === "function" ? new TextEncoder().encode(_0x3d345a).length : _0x3d345a.length;
  const _0x1fbb0c = typeof TextEncoder === "function" ? new TextEncoder().encode(_0x5b3369).length : _0x5b3369.length;
  return _0x1c1efe.call(_0x232432, "[storyWorkspace][episode-split-request]", {
    phase: phase,
    ...(details && typeof details === "object" ? details : {}),
    promptCharacters: [..._0x3d345a].length,
    promptBytes: _0x39f869,
    systemPromptCharacters: [..._0x5b3369].length,
    systemPromptBytes: _0x1fbb0c,
    inputCharacters: [..._0x3d345a].length + [..._0x5b3369].length,
    inputBytes: _0x39f869 + _0x1fbb0c,
    failedClipCount: Math.max(0, Math.trunc(Number(failedClipCount) || 0)),
    carriesFullEpisodeContext: Boolean(carriesFullEpisodeContext),
    automaticCallLimit: Math.max(1, Math.trunc(Number(automaticCallLimit) || 1))
  });
}
function getStoryEpisodeSplitSerializedMetrics(_0x522a9c) {
  let _0x41c49b = "";
  try {
    _0x41c49b = typeof _0x522a9c === "string" ? _0x522a9c : JSON.stringify(_0x522a9c);
  } catch {
    _0x41c49b = String(_0x522a9c || "");
  }
  const _0x2caf44 = typeof TextEncoder === "function" ? new TextEncoder().encode(_0x41c49b).length : _0x41c49b.length;
  return {
    characters: [..._0x41c49b].length,
    bytes: _0x2caf44
  };
}
function getStoryEpisodeSplitResponseTiming(_0x3f6654 = {}) {
  const _0x2cdd58 = _0x3f6654?.transportTiming && typeof _0x3f6654.transportTiming === "object" ? _0x3f6654.transportTiming : {};
  const _0x163961 = _0x2c85cd => {
    const _0x4030a4 = _0x2cdd58[_0x2c85cd];
    if (_0x4030a4 === null || _0x4030a4 === undefined || _0x4030a4 === "") {
      return null;
    }
    const _0x3383a5 = Number(_0x4030a4);
    if (Number.isFinite(_0x3383a5) && _0x3383a5 >= 0) {
      return _0x3383a5;
    } else {
      return null;
    }
  };
  return {
    responseHeadersMs: _0x163961("responseHeadersMs"),
    responseBodyMs: _0x163961("responseBodyMs"),
    transportTotalMs: _0x163961("totalMs"),
    firstByteMs: _0x163961("firstByteMs"),
    firstTokenMs: _0x163961("firstTokenMs")
  };
}
function getStoryEpisodeExperimentalPromptSectionCharacters(_0x142163) {
  if (!_0x142163 || typeof _0x142163 !== "object") {
    return {};
  }
  return Object.fromEntries(Object.entries(_0x142163).map(([_0x369dfc, _0x1a1530]) => [_0x369dfc, getStoryEpisodeSplitSerializedMetrics(_0x1a1530).characters]));
}
function reportStoryEpisodeSplitRequestDiagnosticsInBackground(_0x5d91b2, _0x11a4f0) {
  try {
    const _0x382273 = reportStoryEpisodeSplitRequestDiagnostics(_0x5d91b2, _0x11a4f0);
    if (_0x382273 && typeof _0x382273.then === "function") {
      Promise.resolve(_0x382273).catch(() => undefined);
    }
  } catch {}
}
function createStoryEpisodeExperimentalDiagnosticRequest({
  request: _0x5eef84,
  diagnostics: _0x5aeee7,
  runId: _0x529f17,
  phase: _0x487528,
  nextRequestSequence: _0x4800ae,
  carriesFullEpisodeContext = false,
  context = {}
} = {}) {
  let _0x58d343 = 0;
  return async (_0x3e81c0 = {}) => {
    _0x58d343 += 1;
    const _0x317c59 = Math.max(1, Math.trunc(Number(_0x4800ae?.()) || _0x58d343));
    const _0x252f7d = _0x529f17 + ":" + _0x317c59;
    const _0x29c985 = getStoryEpisodeSplitSerializedMetrics(_0x3e81c0);
    const _0x4d2e13 = {
      status: "started",
      countsTowardRequestTotal: true,
      runId: _0x529f17,
      requestId: _0x252f7d,
      requestSequence: _0x317c59,
      phaseAttempt: _0x58d343,
      model: normalizeText(_0x3e81c0?.model),
      provider: normalizeText(_0x3e81c0?.provider),
      structuredOutputRequested: Boolean(_0x3e81c0?.structuredOutput),
      timeoutMs: Math.max(0, Math.trunc(Number(_0x3e81c0?.timeoutMs) || 0)),
      requestPayloadCharacters: _0x29c985.characters,
      requestPayloadBytes: _0x29c985.bytes,
      strictAttemptLimit: 1,
      transportAttemptLimit: STORY_EPISODE_EXPERIMENTAL_TRANSPORT_ATTEMPTS,
      maximumActualCallsForPhase: STORY_EPISODE_EXPERIMENTAL_TRANSPORT_ATTEMPTS,
      ...(context && typeof context === "object" ? context : {})
    };
    return enqueueStoryEpisodeExperimentalRequest(async () => {
      const _0xfb5800 = Date.now();
      reportStoryEpisodeSplitRequestDiagnosticsInBackground(_0x5aeee7, {
        phase: _0x487528,
        prompt: _0x3e81c0?.prompt,
        systemPrompt: _0x3e81c0?.systemPrompt,
        carriesFullEpisodeContext: carriesFullEpisodeContext,
        automaticCallLimit: _0x4d2e13.maximumActualCallsForPhase,
        details: _0x4d2e13
      });
      try {
        const _0x2ecd6a = await _0x5eef84(_0x3e81c0);
        const _0x4594fc = getStoryEpisodeSplitSerializedMetrics(getResultText(_0x2ecd6a));
        reportStoryEpisodeSplitRequestDiagnosticsInBackground(_0x5aeee7, {
          phase: _0x487528,
          prompt: _0x3e81c0?.prompt,
          systemPrompt: _0x3e81c0?.systemPrompt,
          carriesFullEpisodeContext: carriesFullEpisodeContext,
          automaticCallLimit: _0x4d2e13.maximumActualCallsForPhase,
          details: {
            ..._0x4d2e13,
            status: "succeeded",
            countsTowardRequestTotal: false,
            elapsedMs: Math.max(0, Date.now() - _0xfb5800),
            responseCharacters: _0x4594fc.characters,
            responseBytes: _0x4594fc.bytes,
            ...getStoryEpisodeSplitResponseTiming(_0x2ecd6a),
            ...(_0x2ecd6a?.structuredOutputFallback ? {
              structuredOutputFallbackMode: normalizeText(_0x2ecd6a.structuredOutputFallback.mode),
              structuredOutputFallbackStatus: Math.max(0, Math.trunc(Number(_0x2ecd6a.structuredOutputFallback.status) || 0))
            } : {})
          }
        });
        return _0x2ecd6a;
      } catch (_0x1fbdea) {
        reportStoryEpisodeSplitRequestDiagnosticsInBackground(_0x5aeee7, {
          phase: _0x487528,
          prompt: _0x3e81c0?.prompt,
          systemPrompt: _0x3e81c0?.systemPrompt,
          carriesFullEpisodeContext: carriesFullEpisodeContext,
          automaticCallLimit: _0x4d2e13.maximumActualCallsForPhase,
          details: {
            ..._0x4d2e13,
            status: "failed",
            countsTowardRequestTotal: false,
            elapsedMs: Math.max(0, Date.now() - _0xfb5800),
            errorType: normalizeText(_0x1fbdea?.type || _0x1fbdea?.name),
            errorStatus: Math.max(0, Math.trunc(Number(_0x1fbdea?.status || _0x1fbdea?.statusCode) || 0)),
            errorMessage: normalizeText(_0x1fbdea?.message || _0x1fbdea),
            retryable: Boolean(_0x1fbdea?.retryable || isStoryEpisodeExperimentalRetryable(_0x1fbdea))
          }
        });
        throw _0x1fbdea;
      }
    });
  };
}
function createStoryEpisodeDefaultSplitParseContext({
  episodeRef = "",
  episode = {},
  scriptMode = "",
  constraints = {},
  assets = [],
  clipDurationConstraints = null,
  promptMode = "seedance-2.0"
} = {}) {
  const _0x20ff79 = isStoryContinuousTimelinePromptMode(promptMode);
  const _0x587046 = isStoryMinimaxH3PromptMode(promptMode) ? {
    ...constraints,
    sceneMaxSeconds: 15
  } : constraints;
  return {
    episodeRef: episodeRef,
    episode: episode,
    scriptMode: scriptMode,
    constraints: _0x587046,
    assets: assets,
    minimumShotsPerClip: 1,
    maximumShotsPerClip: 0,
    enforceMaxDuration: false,
    repairMissingShotFields: true,
    allowEmptyAudio: true,
    requireAllPlanCharacters: false,
    completePlanSceneUsage: false,
    repackOverlongClips: Boolean(clipDurationConstraints) && !_0x20ff79,
    enforceSingleSceneAssetUsage: false,
    clipDurationConstraints: clipDurationConstraints,
    rejectUnsupportedClipDuration: false,
    promptMode: promptMode
  };
}
function createStoryEpisodeSplitRawResponsePartialResult({
  episodeRef = "",
  rawResponse = "",
  attempts = 1,
  error = null
} = {}) {
  const _0x3942f4 = serializeStoryEpisodeSplitValidationError(error);
  return {
    schemaVersion: STORY_EPISODE_SPLIT_SCHEMA_VERSION,
    status: "partial",
    episodeRef: episodeRef,
    items: [{
      status: "invalid",
      sourceIndex: 0,
      sourceClipRef: "raw-response",
      rawClips: [],
      rawResponse: rawResponse,
      error: _0x3942f4
    }],
    clips: [],
    rejectedClips: [{
      sourceIndex: 0,
      sourceClipRef: "raw-response",
      message: _0x3942f4.message
    }],
    totalDurationSeconds: 0,
    attempts: Math.max(1, Math.trunc(Number(attempts) || 1)),
    rawResponse: rawResponse
  };
}
function serializeStoryEpisodeSplitTransportRaw(_0x55d20e) {
  const _0x152da5 = _0x55d20e?.raw;
  if (typeof _0x152da5 === "string") {
    return _0x152da5;
  }
  if (_0x152da5 === undefined || _0x152da5 === null) {
    return "";
  }
  try {
    return JSON.stringify(_0x152da5);
  } catch {
    return String(_0x152da5 || "");
  }
}
function hasStoryEpisodeSplitTransportModelOutput(_0x2a3c54) {
  if (!_0x2a3c54) {
    return false;
  }
  if (typeof _0x2a3c54 === "string") {
    const _0x4ee5f3 = normalizeText(_0x2a3c54);
    if (!_0x4ee5f3) {
      return false;
    }
    try {
      return hasStoryEpisodeSplitTransportModelOutput(JSON.parse(_0x4ee5f3));
    } catch {
      return false;
    }
  }
  if (Array.isArray(_0x2a3c54)) {
    return _0x2a3c54.some(_0x17c3fd => hasStoryEpisodeSplitTransportModelOutput(_0x17c3fd));
  }
  if (typeof _0x2a3c54 !== "object") {
    return false;
  }
  if (Array.isArray(_0x2a3c54.clips) && _0x2a3c54.clips.length) {
    return true;
  }
  const _0x5b143e = [_0x2a3c54.text, _0x2a3c54.outputText, _0x2a3c54.content, _0x2a3c54.reasoning_content, _0x2a3c54.reasoningContent].map(normalizeText).find(Boolean);
  if (_0x5b143e) {
    return true;
  }
  const _0x9cc364 = Array.isArray(_0x2a3c54.choices) ? _0x2a3c54.choices : [];
  if (_0x9cc364.some(_0x1dc5d6 => hasStoryEpisodeSplitTransportModelOutput(_0x1dc5d6?.message || _0x1dc5d6?.delta || _0x1dc5d6))) {
    return true;
  }
  return [_0x2a3c54.data, _0x2a3c54.result, _0x2a3c54.response, _0x2a3c54.output].some(_0x5cb2c5 => _0x5cb2c5 && _0x5cb2c5 !== _0x2a3c54 && hasStoryEpisodeSplitTransportModelOutput(_0x5cb2c5));
}
export function recoverStoryEpisodeSplitDraftLocally({
  project = {},
  episode = {},
  assets = [],
  constraints = {},
  draft = episode?.splitDraft
} = {}) {
  const _0xf1915c = Array.isArray(draft?.items) ? [...draft.items] : [];
  if (!_0xf1915c.length) {
    throw new Error("没有可在本地恢复的分镜结果。");
  }
  const _0x9a9a38 = Array.isArray(assets) ? assets : [];
  const _0x16a56c = resolveStoryPlanningConstraints(project, constraints);
  const _0x1df01f = a173_0x3e308f(draft?.episodeRef || episode?.ref || episode?.planningRef || episode?.id, "episode-1");
  const _0x302915 = createStoryEpisodeDefaultSplitParseContext({
    episodeRef: _0x1df01f,
    episode: episode,
    scriptMode: normalizeStoryScriptMode(project?.scriptMode),
    constraints: _0x16a56c,
    assets: _0x9a9a38,
    promptMode: resolveStoryPromptMode(project, constraints)
  });
  const _0x1cfc62 = _0xf1915c.sort((_0x537d3e, _0x512386) => Number(_0x537d3e?.sourceIndex || 0) - Number(_0x512386?.sourceIndex || 0)).flatMap(_0x5e0475 => {
    if (_0x5e0475?.status === "valid" && Array.isArray(_0x5e0475?.clips)) {
      return _0x5e0475.clips;
    }
    const _0x56f612 = (Array.isArray(_0x5e0475?.rawClips) ? _0x5e0475.rawClips : []).map((_0x1f69b1, _0x4e6b26) => normalizeText(_0x1f69b1?.ref) ? _0x1f69b1 : {
      ..._0x1f69b1,
      ref: a173_0x3e308f(_0x5e0475?.sourceClipRef, "clip-" + (Number(_0x5e0475?.sourceIndex || 0) + _0x4e6b26 + 1))
    });
    if (!_0x56f612.length) {
      return [];
    }
    const _0x27f585 = normalizeStoryEpisodeSplitDraft({
      episodeRef: _0x1df01f,
      clips: _0x56f612
    }, _0x302915);
    const _0x53fe95 = finalizeStoryEpisodeSplitDraft(_0x27f585);
    if (_0x53fe95) {
      return _0x53fe95.clips;
    }
    throwStoryEpisodeSplitPartialResult(_0x27f585);
  }).map((_0x2e12ec, _0x40fb75) => ({
    ..._0x2e12ec,
    title: formatStoryEpisodeClipTitle(_0x40fb75)
  }));
  if (!_0x1cfc62.length) {
    throw new Error("保存的分镜结果中没有可恢复片段。");
  }
  const _0x1bbaa1 = _0x1cfc62.map(_0x79ef42 => _0x79ef42.ref);
  if (new Set(_0x1bbaa1).size !== _0x1bbaa1.length) {
    throw new Error("保存的分镜结果包含重复片段引用。");
  }
  return {
    schemaVersion: STORY_EPISODE_SPLIT_SCHEMA_VERSION,
    episodeRef: _0x1df01f,
    totalDurationSeconds: _0x1cfc62.reduce((_0x386bf5, _0x4929bb) => _0x386bf5 + _0x4929bb.durationSec, 0),
    clips: _0x1cfc62
  };
}
function getStoryEpisodesSplitResponseEntries(_0x57e57e) {
  const _0x1fcd91 = [_0x57e57e];
  const _0x128327 = new Set();
  while (_0x1fcd91.length) {
    const _0x371214 = _0x1fcd91.shift();
    if (Array.isArray(_0x371214)) {
      return _0x371214;
    }
    if (!_0x371214 || typeof _0x371214 !== "object" || _0x128327.has(_0x371214)) {
      continue;
    }
    _0x128327.add(_0x371214);
    for (const _0x4b29f3 of ["episodes", "results", "items"]) {
      if (Array.isArray(_0x371214[_0x4b29f3])) {
        return _0x371214[_0x4b29f3];
      }
    }
    if (Array.isArray(_0x371214.clips)) {
      return [_0x371214];
    }
    for (const _0x35ba6d of ["result", "data", "output", "response"]) {
      if (_0x371214[_0x35ba6d] && typeof _0x371214[_0x35ba6d] === "object") {
        _0x1fcd91.push(_0x371214[_0x35ba6d]);
      }
    }
  }
  return [];
}
function getStoryEpisodesSplitEntryRef(_0x261eea = {}) {
  return a173_0x3e308f(_0x261eea?.episodeRef || _0x261eea?.episode_ref || _0x261eea?.ref || _0x261eea?.id || _0x261eea?.episode?.ref || _0x261eea?.episode?.id, "");
}
function parseStoryEpisodesSplitEntry({
  entry = {},
  episode = {},
  scriptMode = "",
  assets = [],
  constraints = {},
  clipDurationConstraints = null,
  promptMode = "seedance-2.0"
} = {}) {
  const _0x33f78a = getStoryEpisodeReferenceAliases(episode)[0] || "episode-1";
  const _0x40f65f = Array.isArray(entry?.clips) ? entry.clips : Array.isArray(entry?.segments) ? entry.segments : [];
  if (!_0x40f65f.length) {
    throw new Error("Agent 返回结果没有可用镜头。");
  }
  const _0x4e5235 = expandStoryEpisodeSplitCompactData({
    ...entry,
    episodeRef: _0x33f78a,
    clips: _0x40f65f
  }, {
    episodeRef: _0x33f78a,
    episode: episode,
    assets: assets
  });
  const _0x24ac11 = JSON.stringify(entry);
  const _0x2c1e7e = {
    ...normalizeStoryEpisodeSplitDraft({
      text: JSON.stringify(_0x4e5235)
    }, createStoryEpisodeDefaultSplitParseContext({
      episodeRef: _0x33f78a,
      episode: episode,
      scriptMode: scriptMode,
      constraints: constraints,
      assets: assets,
      clipDurationConstraints: clipDurationConstraints,
      promptMode: promptMode
    })),
    rawResponse: _0x24ac11
  };
  const _0x4ca76a = finalizeStoryEpisodeSplitDraft(_0x2c1e7e);
  if (_0x4ca76a) {
    return assertStoryEpisodeSplitTiming(_0x4ca76a, episode);
  }
  throwStoryEpisodeSplitPartialResult(_0x2c1e7e);
}
async function splitStoryEpisodesCombinedRequest({
  project = {},
  episodes = [],
  assets = [],
  constraints = {},
  model = "",
  provider = "",
  providerProfileId = "",
  request = generateText,
  onProgress = null,
  diagnostics = null,
  clipDurationConstraints = null
} = {}) {
  assertPlanningModel(model, provider);
  const _0x5b2b53 = Array.isArray(episodes) ? episodes.filter(Boolean) : [];
  if (!_0x5b2b53.length) {
    throw new Error("没有可生成分镜的分集。");
  }
  const _0x293ad0 = resolveStoryPlanningConstraints(project, constraints);
  const _0x5f1381 = resolveStoryPromptMode(project, constraints);
  const _0x24fcc3 = normalizeStoryEpisodeClipDurationConstraints(clipDurationConstraints);
  const _0x48b7bf = buildStoryEpisodesSplitPrompt({
    project: project,
    episodes: _0x5b2b53,
    assets: assets,
    constraints: {
      ..._0x293ad0,
      promptMode: _0x5f1381
    },
    clipDurationConstraints: _0x24fcc3
  });
  const _0x181eb7 = {
    model: normalizeText(model),
    provider: normalizeText(provider),
    ...buildStoryTextProviderProfilePayload(providerProfileId),
    prompt: _0x48b7bf,
    systemPrompt: getStoryEpisodeSplitRequestSystemPrompt({
      compactPrompt: true,
      promptMode: _0x5f1381
    }),
    thinking: {
      type: "disabled"
    },
    temperature: STORY_EPISODE_SPLIT_TEMPERATURE,
    maxOutputTokens: STORY_EPISODE_SPLIT_MAX_OUTPUT_TOKENS,
    timeoutMs: STORY_EPISODE_SPLIT_REQUEST_TIMEOUT_MS
  };
  onProgress?.({
    stage: "splitting-episodes",
    current: 1,
    total: 2,
    message: "正在一次生成 " + _0x5b2b53.length + " 集分镜"
  });
  reportStoryEpisodeSplitRequestDiagnostics(diagnostics, {
    phase: "batch-generation",
    prompt: _0x48b7bf,
    systemPrompt: _0x181eb7.systemPrompt,
    automaticCallLimit: 2,
    details: {
      status: "started",
      requestIndex: 1,
      requestCount: 2,
      episodeCount: _0x5b2b53.length,
      outputTokenLimitMode: "provider-default",
      requestTimeoutMode: "provider-default",
      assetDetailsIncluded: false
    }
  });
  const _0x524824 = Date.now();
  let _0x8caf8e;
  try {
    _0x8caf8e = await request(_0x181eb7);
    const _0x2fe5a1 = getStoryEpisodeSplitSerializedMetrics(getResultText(_0x8caf8e));
    reportStoryEpisodeSplitRequestDiagnosticsInBackground(diagnostics, {
      phase: "batch-generation",
      prompt: _0x48b7bf,
      systemPrompt: _0x181eb7.systemPrompt,
      automaticCallLimit: 2,
      details: {
        status: "succeeded",
        requestIndex: 1,
        requestCount: 2,
        episodeCount: _0x5b2b53.length,
        elapsedMs: Math.max(0, Date.now() - _0x524824),
        responseCharacters: _0x2fe5a1.characters,
        responseBytes: _0x2fe5a1.bytes,
        ...getStoryEpisodeSplitResponseTiming(_0x8caf8e)
      }
    });
  } catch (_0x6b1a2) {
    reportStoryEpisodeSplitRequestDiagnosticsInBackground(diagnostics, {
      phase: "batch-generation",
      prompt: _0x48b7bf,
      systemPrompt: _0x181eb7.systemPrompt,
      automaticCallLimit: 2,
      details: {
        status: "failed",
        requestIndex: 1,
        requestCount: 2,
        episodeCount: _0x5b2b53.length,
        elapsedMs: Math.max(0, Date.now() - _0x524824),
        errorType: normalizeText(_0x6b1a2?.type || _0x6b1a2?.name),
        errorMessage: normalizeText(_0x6b1a2?.message || _0x6b1a2)
      }
    });
    _0x6b1a2.message = (normalizeText(_0x6b1a2?.message) || "批量分镜生成请求失败。") + "（生成请求失败，未执行结果检查。）";
    if (hasStoryEpisodeSplitTransportModelOutput(_0x6b1a2?.raw)) {
      const _0x522bb1 = getStoryEpisodeReferenceAliases(_0x5b2b53[0])[0] || "episode-1";
      _0x6b1a2.partialResults = [createStoryEpisodeSplitRawResponsePartialResult({
        episodeRef: _0x522bb1,
        rawResponse: serializeStoryEpisodeSplitTransportRaw(_0x6b1a2),
        attempts: 1,
        error: _0x6b1a2
      })];
    }
    throw _0x6b1a2;
  }
  const _0x31f5b6 = getResultText(_0x8caf8e);
  const _0x1a4557 = _0x5b2b53.map((_0x1e90ed, _0x3afd93) => getStoryEpisodeReferenceAliases(_0x1e90ed)[0] || "episode-" + (_0x3afd93 + 1));
  const _0x589ee1 = buildStoryEpisodesSplitValidationPrompt({
    episodeRefs: _0x1a4557,
    result: _0x31f5b6,
    promptMode: _0x5f1381
  });
  const _0x369246 = {
    model: normalizeText(model),
    provider: normalizeText(provider),
    ...buildStoryTextProviderProfilePayload(providerProfileId),
    prompt: _0x589ee1,
    systemPrompt: STORY_EPISODES_SPLIT_VALIDATION_SYSTEM_PROMPT,
    temperature: 0.1
  };
  onProgress?.({
    stage: "validating-episodes",
    current: 2,
    total: 2,
    message: "正在检查并修复分镜返回格式"
  });
  reportStoryEpisodeSplitRequestDiagnostics(diagnostics, {
    phase: "batch-validation",
    prompt: _0x589ee1,
    systemPrompt: STORY_EPISODES_SPLIT_VALIDATION_SYSTEM_PROMPT,
    automaticCallLimit: 2,
    details: {
      status: "started",
      requestIndex: 2,
      requestCount: 2,
      episodeCount: _0x5b2b53.length,
      outputTokenLimitMode: "provider-default",
      requestTimeoutMode: "provider-default",
      includesOriginalScripts: false
    }
  });
  const _0x44ec68 = Date.now();
  let _0x32b4e7 = null;
  let _0x5ef74c = null;
  try {
    _0x32b4e7 = await request(_0x369246);
    const _0x14b39d = getStoryEpisodeSplitSerializedMetrics(getResultText(_0x32b4e7));
    reportStoryEpisodeSplitRequestDiagnosticsInBackground(diagnostics, {
      phase: "batch-validation",
      prompt: _0x589ee1,
      systemPrompt: STORY_EPISODES_SPLIT_VALIDATION_SYSTEM_PROMPT,
      automaticCallLimit: 2,
      details: {
        status: "succeeded",
        requestIndex: 2,
        requestCount: 2,
        episodeCount: _0x5b2b53.length,
        elapsedMs: Math.max(0, Date.now() - _0x44ec68),
        responseCharacters: _0x14b39d.characters,
        responseBytes: _0x14b39d.bytes,
        ...getStoryEpisodeSplitResponseTiming(_0x32b4e7)
      }
    });
  } catch (_0x1a5392) {
    _0x5ef74c = _0x1a5392;
    reportStoryEpisodeSplitRequestDiagnosticsInBackground(diagnostics, {
      phase: "batch-validation",
      prompt: _0x589ee1,
      systemPrompt: STORY_EPISODES_SPLIT_VALIDATION_SYSTEM_PROMPT,
      automaticCallLimit: 2,
      details: {
        status: "failed",
        requestIndex: 2,
        requestCount: 2,
        episodeCount: _0x5b2b53.length,
        elapsedMs: Math.max(0, Date.now() - _0x44ec68),
        errorType: normalizeText(_0x1a5392?.type || _0x1a5392?.name),
        errorMessage: normalizeText(_0x1a5392?.message || _0x1a5392)
      }
    });
  }
  const _0x22eeb6 = _0x32b4e7 ? getResultText(_0x32b4e7) : hasStoryEpisodeSplitTransportModelOutput(_0x5ef74c?.raw) ? serializeStoryEpisodeSplitTransportRaw(_0x5ef74c) : "";
  const _0x4293af = [...(normalizeText(_0x22eeb6) ? [{
    phase: "validation",
    rawResponse: _0x22eeb6
  }] : []), {
    phase: "generation",
    rawResponse: _0x31f5b6
  }];
  let _0x592709 = [];
  let _0x1b182f = "";
  let _0x6f0cfd = null;
  for (const _0x285757 of _0x4293af) {
    try {
      const _0x35c5db = getStoryEpisodesSplitResponseEntries(parseStrictJson(_0x285757.rawResponse, "Agent 未返回批量分镜结果。"));
      if (!_0x35c5db.length) {
        throw new Error("Agent 返回结果没有可用分集。");
      }
      _0x592709 = _0x35c5db;
      _0x1b182f = _0x285757.rawResponse;
      break;
    } catch (_0x9600b7) {
      _0x6f0cfd = _0x9600b7;
    }
  }
  if (!_0x592709.length) {
    const _0x14668f = _0x6f0cfd || _0x5ef74c || new Error("批量分镜返回无法解析。");
    const _0x5068ec = getStoryEpisodeReferenceAliases(_0x5b2b53[0])[0] || "episode-1";
    const _0x1af65b = ["首次生成返回：", _0x31f5b6, ...(normalizeText(_0x22eeb6) ? ["", "检查修复返回：", _0x22eeb6] : [])].join("\n");
    _0x14668f.partialResults = [createStoryEpisodeSplitRawResponsePartialResult({
      episodeRef: _0x5068ec,
      rawResponse: _0x1af65b,
      attempts: _0x32b4e7 || _0x5ef74c ? 2 : 1,
      error: _0x14668f
    })];
    _0x14668f.message = (normalizeText(_0x14668f?.message) || "批量分镜返回无法解析。") + "（生成和检查结果均无法解析，已保存原始返回；未发起第三次请求。）";
    throw _0x14668f;
  }
  const _0x247923 = new Set(_0x592709.map((_0x2fb82e, _0xc0a259) => _0xc0a259));
  const _0x54f9d7 = _0x5b2b53.map((_0x493d21, _0x2b52f3) => {
    const _0xba10b4 = new Set(getStoryEpisodeReferenceAliases(_0x493d21));
    let _0x3a180f = _0x592709.findIndex((_0x4d58af, _0x5552cd) => _0x247923.has(_0x5552cd) && _0xba10b4.has(getStoryEpisodesSplitEntryRef(_0x4d58af)));
    if (_0x3a180f < 0 && _0x247923.has(_0x2b52f3)) {
      _0x3a180f = _0x2b52f3;
    }
    if (_0x3a180f < 0) {
      _0x3a180f = [..._0x247923][0] ?? -1;
    }
    const _0x245931 = getStoryEpisodeReferenceAliases(_0x493d21)[0] || "episode-" + (_0x2b52f3 + 1);
    if (_0x3a180f < 0) {
      return {
        episodeRef: _0x245931,
        status: "rejected",
        error: new Error("Agent 未返回该分集的分镜结果。")
      };
    }
    _0x247923.delete(_0x3a180f);
    const _0x17c2c1 = _0x592709[_0x3a180f];
    const _0x37778f = selectStoryEpisodeSplitAssets(assets, _0x493d21);
    try {
      return {
        episodeRef: _0x245931,
        status: "fulfilled",
        result: parseStoryEpisodesSplitEntry({
          entry: _0x17c2c1,
          episode: _0x493d21,
          scriptMode: normalizeStoryScriptMode(project?.scriptMode),
          assets: _0x37778f,
          constraints: _0x293ad0,
          clipDurationConstraints: _0x24fcc3,
          promptMode: _0x5f1381
        })
      };
    } catch (_0x28fc56) {
      return {
        episodeRef: _0x245931,
        status: "rejected",
        error: _0x28fc56,
        partialResult: _0x28fc56?.partialResult || createStoryEpisodeSplitRawResponsePartialResult({
          episodeRef: _0x245931,
          rawResponse: JSON.stringify(_0x17c2c1),
          attempts: 1,
          error: _0x28fc56
        })
      };
    }
  });
  return {
    rawResponse: _0x1b182f,
    items: _0x54f9d7
  };
}
export function splitStoryEpisodeChecked(_0x1b8406 = {}) {
  return splitStoryEpisode({
    ..._0x1b8406,
    compactPrompt: true,
    skipRequestQueue: true
  });
}
export async function splitStoryEpisodesBatch({
  episodes = [],
  onProgress = null,
  ..._0x4287ac
} = {}) {
  const _0x44c091 = Array.isArray(episodes) ? episodes.filter(Boolean) : [];
  if (!_0x44c091.length) {
    throw new Error("没有可生成分镜的分集。");
  }
  const _0x1a0a2e = await Promise.all(_0x44c091.map(async (_0x530c19, _0x204572) => {
    const _0x262406 = getStoryEpisodeReferenceAliases(_0x530c19)[0] || "episode-" + (_0x204572 + 1);
    try {
      const _0x1b8e2f = await splitStoryEpisodeChecked({
        ..._0x4287ac,
        episode: _0x530c19,
        onInvocation: _0x6d80ec => _0x4287ac.onInvocation?.({
          ..._0x6d80ec,
          episodeRef: _0x262406,
          episodeIndex: _0x204572
        }),
        onProgress: (_0x5ed161 = {}) => onProgress?.({
          ..._0x5ed161,
          episodeRef: _0x262406,
          episodeIndex: _0x204572,
          episodeCount: _0x44c091.length
        })
      });
      return {
        episodeRef: _0x262406,
        status: "fulfilled",
        result: _0x1b8e2f
      };
    } catch (_0x5f0934) {
      return {
        episodeRef: _0x262406,
        status: "rejected",
        error: _0x5f0934,
        ...(_0x5f0934?.partialResult ? {
          partialResult: _0x5f0934.partialResult
        } : {})
      };
    }
  }));
  return {
    items: _0x1a0a2e
  };
}
export async function splitStoryEpisode({
  project = {},
  episode = {},
  assets = [],
  constraints = {},
  model = "",
  provider = "",
  providerProfileId = "",
  request = generateText,
  onProgress = null,
  repairDraft = null,
  diagnostics = null,
  clipDurationConstraints = null,
  compactPrompt = false,
  skipRequestQueue = false,
  onInvocation = null
} = {}) {
  assertPlanningModel(model, provider);
  const _0x3a58f7 = selectStoryEpisodeSplitAssets(assets, episode);
  const _0xd2c295 = resolveStoryPlanningConstraints(project, constraints);
  const _0x5a8c8c = resolveStoryPromptMode(project, constraints);
  const _0x5314a3 = normalizeStoryEpisodeClipDurationConstraints(clipDurationConstraints);
  const _0x3376bf = a173_0x3e308f(episode?.ref || episode?.planningRef || episode?.id, "episode-1");
  const _0x1cf67e = [episode];
  const _0x760475 = _0x1cf67e.length;
  const _0x5e5b02 = STORY_EPISODE_SPLIT_MAX_OUTPUT_TOKENS;
  const _0x2de668 = getStoryEpisodeSplitRequestSystemPrompt({
    compactPrompt: compactPrompt,
    promptMode: _0x5a8c8c
  });
  const _0x4c8306 = createStoryEpisodeDefaultSplitParseContext({
    episodeRef: _0x3376bf,
    episode: episode,
    scriptMode: normalizeStoryScriptMode(project?.scriptMode),
    constraints: _0xd2c295,
    assets: _0x3a58f7,
    clipDurationConstraints: _0x5314a3,
    promptMode: _0x5a8c8c
  });
  const _0x2908c8 = [];
  for (let _0x186519 = 0; _0x186519 < _0x760475; _0x186519 += 1) {
    const _0x1488bc = _0x1cf67e[_0x186519];
    const _0x215ba7 = selectStoryEpisodeSplitAssets(_0x3a58f7, _0x1488bc);
    onProgress?.({
      stage: "splitting-episode",
      current: _0x186519 + 1,
      total: _0x760475,
      message: repairDraft ? "正在重新生成整集分镜" : "正在生成分镜脚本"
    });
    const _0x7b9dc9 = (compactPrompt ? buildStoryEpisodeMinimalSplitPrompt : buildStoryEpisodeSplitPrompt)({
      project: project,
      episode: _0x1488bc,
      assets: _0x215ba7,
      constraints: {
        ..._0xd2c295,
        promptMode: _0x5a8c8c
      },
      clipDurationConstraints: _0x5314a3
    });
    const _0x636374 = {
      model: normalizeText(model),
      provider: normalizeText(provider),
      ...buildStoryTextProviderProfilePayload(providerProfileId),
      prompt: _0x7b9dc9,
      systemPrompt: _0x2de668,
      thinking: {
        type: "disabled"
      },
      temperature: STORY_EPISODE_SPLIT_TEMPERATURE,
      maxOutputTokens: _0x5e5b02,
      timeoutMs: STORY_EPISODE_SPLIT_REQUEST_TIMEOUT_MS
    };
    const _0x386ea7 = Date.now();
    reportStoryEpisodeSplitRequestDiagnostics(diagnostics, {
      phase: repairDraft ? "manual-regeneration" : "full-generation",
      prompt: _0x7b9dc9,
      systemPrompt: _0x2de668,
      automaticCallLimit: _0x760475,
      details: {
        status: "queued",
        requestIndex: _0x186519 + 1,
        requestCount: _0x760475,
        outputTokenLimitMode: "explicit",
        maxOutputTokens: _0x5e5b02,
        requestTimeoutMode: "bounded",
        requestTimeoutMs: STORY_EPISODE_SPLIT_REQUEST_TIMEOUT_MS,
        assetCount: _0x3a58f7.length,
        includesAdjacentEpisodes: false,
        blueprintRequestCount: 0
      }
    });
    let _0x6118ef;
    try {
      const _0x29fbb9 = async () => {
        const _0x4d7fca = Date.now();
        const _0x57f445 = Math.max(0, _0x4d7fca - _0x386ea7);
        reportStoryEpisodeSplitRequestDiagnosticsInBackground(diagnostics, {
          phase: repairDraft ? "manual-regeneration" : "full-generation",
          prompt: _0x7b9dc9,
          systemPrompt: _0x2de668,
          automaticCallLimit: _0x760475,
          details: {
            status: "started",
            requestIndex: _0x186519 + 1,
            requestCount: _0x760475,
            queueWaitMs: _0x57f445,
            maxOutputTokens: _0x5e5b02,
            requestTimeoutMs: STORY_EPISODE_SPLIT_REQUEST_TIMEOUT_MS
          }
        });
        try {
          const _0x117289 = await invokeStoryGenerationRequest({
            request: request,
            requestPayload: _0x636374,
            stepId: repairDraft ? "manual-regeneration" : "generation",
            attempt: _0x186519 + 1,
            onInvocation: onInvocation,
            serializeResponse: getResultText
          });
          const _0x11eac6 = getStoryEpisodeSplitSerializedMetrics(getResultText(_0x117289));
          reportStoryEpisodeSplitRequestDiagnosticsInBackground(diagnostics, {
            phase: repairDraft ? "manual-regeneration" : "full-generation",
            prompt: _0x7b9dc9,
            systemPrompt: _0x2de668,
            automaticCallLimit: _0x760475,
            details: {
              status: "succeeded",
              requestIndex: _0x186519 + 1,
              requestCount: _0x760475,
              queueWaitMs: _0x57f445,
              elapsedMs: Math.max(0, Date.now() - _0x4d7fca),
              responseCharacters: _0x11eac6.characters,
              responseBytes: _0x11eac6.bytes,
              ...getStoryEpisodeSplitResponseTiming(_0x117289),
              maxOutputTokens: _0x5e5b02,
              requestTimeoutMs: STORY_EPISODE_SPLIT_REQUEST_TIMEOUT_MS
            }
          });
          return _0x117289;
        } catch (_0x52c22c) {
          reportStoryEpisodeSplitRequestDiagnosticsInBackground(diagnostics, {
            phase: repairDraft ? "manual-regeneration" : "full-generation",
            prompt: _0x7b9dc9,
            systemPrompt: _0x2de668,
            automaticCallLimit: _0x760475,
            details: {
              status: "failed",
              requestIndex: _0x186519 + 1,
              requestCount: _0x760475,
              queueWaitMs: _0x57f445,
              elapsedMs: Math.max(0, Date.now() - _0x4d7fca),
              errorType: normalizeText(_0x52c22c?.type || _0x52c22c?.name),
              errorMessage: normalizeText(_0x52c22c?.message || _0x52c22c),
              maxOutputTokens: _0x5e5b02,
              requestTimeoutMs: STORY_EPISODE_SPLIT_REQUEST_TIMEOUT_MS
            }
          });
          throw _0x52c22c;
        }
      };
      _0x6118ef = skipRequestQueue ? await _0x29fbb9() : await enqueueStoryEpisodeRequest(_0x29fbb9);
    } catch (_0x3fdcff) {
      _0x3fdcff.message = (normalizeText(_0x3fdcff?.message) || "分镜生成请求失败。") + "（未自动重试，未生成本地替代分镜。）";
      if (hasStoryEpisodeSplitTransportModelOutput(_0x3fdcff?.raw)) {
        _0x3fdcff.partialResult = createStoryEpisodeSplitRawResponsePartialResult({
          episodeRef: _0x3376bf,
          rawResponse: serializeStoryEpisodeSplitTransportRaw(_0x3fdcff),
          attempts: _0x186519 + 1,
          error: _0x3fdcff
        });
      }
      throw _0x3fdcff;
    }
    try {
      const _0x545137 = parseStrictJson(getResultText(_0x6118ef), "Agent 未返回片段拆分结果。");
      if (!Array.isArray(_0x545137?.clips) || !_0x545137.clips.length) {
        throw new Error("Agent 返回结果没有可用镜头。");
      }
      _0x2908c8.push({
        response: _0x6118ef,
        requestEpisode: _0x1488bc,
        requestAssets: _0x215ba7,
        responseData: _0x545137
      });
    } catch (_0x211d6e) {
      _0x211d6e.partialResult = createStoryEpisodeSplitRawResponsePartialResult({
        episodeRef: _0x3376bf,
        rawResponse: getResultText(_0x6118ef),
        attempts: _0x186519 + 1,
        error: _0x211d6e
      });
      _0x211d6e.message = (normalizeText(_0x211d6e?.message) || "当前返回无法解析。") + "（已保留原始返回；未用本地内容替换，未自动重试。）";
      throw _0x211d6e;
    }
  }
  let _0xda11b7;
  try {
    const _0x5c4ebf = _0x2908c8.flatMap(({
      response: _0x21d09c,
      requestEpisode: _0x50e7ce,
      requestAssets: _0x46b8bc,
      responseData: _0x5909a3
    }) => {
      return expandStoryEpisodeSplitCompactData(_0x5909a3, {
        episodeRef: _0x3376bf,
        episode: _0x50e7ce,
        assets: _0x46b8bc
      }).clips || [];
    });
    const _0x5732c2 = _0x760475 > 1 ? _0x5c4ebf.map((_0xbac12c, _0x2cdc75) => ({
      ..._0xbac12c,
      ref: "clip-" + (_0x2cdc75 + 1)
    })) : _0x5c4ebf;
    _0xda11b7 = {
      ...normalizeStoryEpisodeSplitDraft({
        text: JSON.stringify({
          episodeRef: _0x3376bf,
          clips: _0x5732c2
        })
      }, _0x4c8306),
      rawResponse: _0x2908c8.map(({
        response: _0x1ea7e0
      }) => getResultText(_0x1ea7e0)).join("\n\n")
    };
  } catch (_0x40857) {
    const _0x446e2d = _0x2908c8.map(({
      response: _0xa62291
    }) => getResultText(_0xa62291)).join("\n\n");
    _0x40857.partialResult = createStoryEpisodeSplitRawResponsePartialResult({
      episodeRef: _0x3376bf,
      rawResponse: _0x446e2d,
      attempts: _0x760475,
      error: _0x40857
    });
    _0x40857.message = (normalizeText(_0x40857?.message) || "Agent 返回格式无法解析。") + "（已保存本次原始返回；未自动发起第二次请求。）";
    throw _0x40857;
  }
  let _0x4dc306 = finalizeStoryEpisodeSplitDraft(_0xda11b7);
  if (_0x4dc306) {
    return _0x4dc306;
  }
  if (canRepairStoryEpisodeSplitPartialDraft(_0xda11b7)) {
    const _0x21c3d9 = _0xda11b7.items.filter(_0x1588d4 => _0x1588d4?.status !== "valid").length;
    const _0x5b4054 = buildStoryEpisodeSplitPartialRepairPrompt({
      draft: _0xda11b7,
      episode: episode,
      assets: _0x3a58f7,
      constraints: _0xd2c295,
      schemaVersion: STORY_EPISODE_SPLIT_SCHEMA_VERSION,
      clipMaxSeconds: resolveStoryPromptModeClipMaxSeconds(_0x5a8c8c, _0xd2c295.sceneMaxSeconds),
      timingGuidance: STORY_EPISODE_SPLIT_ADAPTIVE_TIMING_GUIDANCE,
      dialogueSpeakerGuidance: STORY_EPISODE_SPLIT_DIALOGUE_SPEAKER_GUIDANCE,
      groupingGuidance: STORY_EPISODE_SPLIT_GROUPING_GUIDANCE,
      timelineRequirements: getStoryEpisodeTimelinePlanningRequirements(_0x5a8c8c),
      continuousTimeline: isStoryContinuousTimelinePromptMode(_0x5a8c8c)
    });
    onProgress?.({
      stage: "repairing-episode-split",
      current: 0,
      total: _0x21c3d9,
      message: "正在定点修复 " + _0x21c3d9 + " 个格式或校验未通过的片段"
    });
    reportStoryEpisodeSplitRequestDiagnostics(diagnostics, {
      phase: "targeted-repair",
      prompt: _0x5b4054,
      systemPrompt: _0x2de668,
      failedClipCount: _0x21c3d9,
      carriesFullEpisodeContext: false,
      automaticCallLimit: 1,
      details: {
        status: "queued",
        requestIndex: 1,
        requestCount: 1
      }
    });
    let _0x1244da = null;
    try {
      const _0x1e3bf0 = () => invokeStoryGenerationRequest({
        request: request,
        requestPayload: {
          model: normalizeText(model),
          provider: normalizeText(provider),
          ...buildStoryTextProviderProfilePayload(providerProfileId),
          prompt: _0x5b4054,
          systemPrompt: _0x2de668,
          thinking: {
            type: "disabled"
          },
          temperature: STORY_EPISODE_SPLIT_TEMPERATURE,
          maxOutputTokens: STORY_EPISODE_SPLIT_MAX_OUTPUT_TOKENS,
          timeoutMs: STORY_EPISODE_SPLIT_REQUEST_TIMEOUT_MS
        },
        stepId: "generation-repair",
        attempt: 2,
        onInvocation: onInvocation,
        serializeResponse: getResultText
      });
      _0x1244da = skipRequestQueue ? await _0x1e3bf0() : await enqueueStoryEpisodeRequest(_0x1e3bf0);
      const _0x428ab2 = parseStrictJson(getResultText(_0x1244da), "Agent 未返回片段局部修复结果。");
      _0xda11b7 = applyStoryEpisodeSplitPartialRepairs(_0x428ab2, _0xda11b7, {
        parseReplacementClips: _0x3e8b54 => parseStoryEpisodeSplitResult({
          episodeRef: _0xda11b7.episodeRef,
          clips: _0x3e8b54
        }, _0x4c8306).clips,
        serializeValidationError: (_0x36a92d, _0x537da2) => serializeStoryEpisodeSplitValidationError(_0x36a92d, {
          clipIndex: _0x537da2.sourceIndex,
          clipCount: _0xda11b7.items.length
        })
      });
    } catch (_0x2a039f) {
      _0xda11b7 = appendStoryEpisodeSplitPartialRepairFailure(_0xda11b7, _0x2a039f);
    }
    const _0x214bb4 = getResultText(_0x1244da);
    if (_0x214bb4) {
      _0xda11b7.rawResponse = [_0xda11b7.rawResponse, "局部修复返回：", _0x214bb4].filter(Boolean).join("\n\n");
    }
    _0x4dc306 = finalizeStoryEpisodeSplitDraft(_0xda11b7);
    if (_0x4dc306) {
      return assertStoryEpisodeSplitTiming(_0x4dc306, episode);
    }
  }
  throwStoryEpisodeSplitPartialResult(_0xda11b7);
}
const STORY_EPISODE_EXPERIMENTAL_DRAFT_STRATEGY = "semantic-shot-batches-v3";
const STORY_EPISODE_EXPERIMENTAL_TRANSPORT_ATTEMPTS = 2;
const STORY_EPISODE_EXPERIMENTAL_RETRY_DELAY_MS = 600;
function cloneStoryEpisodeExperimentalValue(_0x2faf99) {
  if (!_0x2faf99 || typeof _0x2faf99 !== "object") {
    return null;
  }
  try {
    return JSON.parse(JSON.stringify(_0x2faf99));
  } catch {
    return null;
  }
}
function hashStoryEpisodeExperimentalValue(_0x4c5a78) {
  const _0x23b246 = JSON.stringify(_0x4c5a78);
  let _0x2968c8 = 2166136261;
  for (let _0x531c39 = 0; _0x531c39 < _0x23b246.length; _0x531c39 += 1) {
    _0x2968c8 ^= _0x23b246.charCodeAt(_0x531c39);
    _0x2968c8 = Math.imul(_0x2968c8, 16777619);
  }
  return STORY_EPISODE_BATCHED_SPLIT_SCHEMA_VERSION + "-" + (_0x2968c8 >>> 0).toString(16).padStart(8, "0") + "-" + _0x23b246.length;
}
function createStoryEpisodeExperimentalFingerprint({
  project = {},
  episodeRef = "",
  sourceBeats = [],
  assets = [],
  constraints = {},
  model = "",
  provider = "",
  providerProfileId = "",
  promptExperiment = false,
  promptMode = "seedance-2.0",
  timingBudget = null
} = {}) {
  const _0x3d5655 = normalizeStoryProjectInput(project);
  return hashStoryEpisodeExperimentalValue({
    episodeRef: episodeRef,
    sourceBeats: sourceBeats,
    assets: assets,
    constraints: constraints,
    model: normalizeText(model),
    provider: normalizeText(provider),
    providerProfileId: normalizeText(providerProfileId),
    promptExperiment: promptExperiment === true,
    promptMode: normalizeText(promptMode).toLowerCase() || "seedance-2.0",
    timingBudget: timingBudget,
    scriptMode: _0x3d5655.scriptMode,
    aspectRatio: _0x3d5655.aspectRatio,
    visualStyle: _0x3d5655.visualStyle
  });
}
function isStoryEpisodeExperimentalTimeout(_0x8003b) {
  const _0x23fb8b = normalizeText(_0x8003b?.type).toUpperCase();
  const _0x343de6 = normalizeText(_0x8003b?.name).toLowerCase();
  const _0x316783 = normalizeText(_0x8003b?.message).toLowerCase();
  return _0x23fb8b === "TIMEOUT" || _0x343de6 === "aborterror" || /timeout|timed out|超时/u.test(_0x316783);
}
function isStoryEpisodeExperimentalPromptTooLong(_0x5f15ea) {
  const _0x387fff = Number(_0x5f15ea?.status || _0x5f15ea?.statusCode || 0);
  const _0xace83 = normalizeText(_0x5f15ea?.message).toLowerCase();
  return _0x387fff === 413 || /提示词过长|prompt.{0,24}too long|context.{0,24}(length|limit)|request entity too large/u.test(_0xace83);
}
function isStoryEpisodeExperimentalBatchShrinkable(_0x4b9e3d) {
  return isStoryEpisodeExperimentalTimeout(_0x4b9e3d) || isStoryEpisodeExperimentalPromptTooLong(_0x4b9e3d);
}
function isStoryEpisodeExperimentalRetryable(_0x22681c) {
  const _0x88da2b = Number(_0x22681c?.status || _0x22681c?.statusCode || 0);
  return _0x22681c?.retryable === true || isStoryEpisodeExperimentalTimeout(_0x22681c) || _0x88da2b === 429 || _0x88da2b >= 500;
}
function waitForStoryEpisodeExperimentalRetry(_0x217a59) {
  return new Promise(_0x72d3de => setTimeout(_0x72d3de, _0x217a59));
}
async function settleStoryEpisodeExperimentalBatches(_0x1840a2 = [], _0x48b723, _0x33f126 = STORY_EPISODE_EXPERIMENTAL_MAX_CONCURRENT_BATCHES) {
  const _0xcf6c6c = Array.isArray(_0x1840a2) ? _0x1840a2 : [];
  const _0x2a77a2 = new Array(_0xcf6c6c.length);
  let _0x2c8c45 = 0;
  const _0x17927e = Math.min(_0xcf6c6c.length, Math.max(1, Math.trunc(Number(_0x33f126) || 1)));
  const _0xe6b136 = Array.from({
    length: _0x17927e
  }, async () => {
    while (_0x2c8c45 < _0xcf6c6c.length) {
      const _0x5793c8 = _0x2c8c45;
      _0x2c8c45 += 1;
      try {
        _0x2a77a2[_0x5793c8] = {
          status: "fulfilled",
          value: await _0x48b723(_0xcf6c6c[_0x5793c8], _0x5793c8)
        };
      } catch (_0x427c10) {
        _0x2a77a2[_0x5793c8] = {
          status: "rejected",
          reason: _0x427c10
        };
      }
    }
  });
  await Promise.all(_0xe6b136);
  return _0x2a77a2;
}
async function requestStoryEpisodeExperimentalWithRetry(_0x30fa32, {
  maxAttempts = STORY_EPISODE_EXPERIMENTAL_TRANSPORT_ATTEMPTS,
  retryWait = waitForStoryEpisodeExperimentalRetry,
  splitOversizedBatch = false
} = {}) {
  const _0x56e9af = Math.max(1, Math.trunc(Number(maxAttempts) || 1));
  let _0x18bf77 = null;
  for (let _0x190c10 = 1; _0x190c10 <= _0x56e9af; _0x190c10 += 1) {
    try {
      return await _0x30fa32(_0x190c10, _0x18bf77);
    } catch (_0x31df1a) {
      if (splitOversizedBatch && isStoryEpisodeExperimentalBatchShrinkable(_0x31df1a)) {
        throw _0x31df1a;
      }
      if (!isStoryEpisodeExperimentalRetryable(_0x31df1a) || _0x190c10 >= _0x56e9af) {
        throw _0x31df1a;
      }
      _0x18bf77 = _0x31df1a;
      await retryWait(STORY_EPISODE_EXPERIMENTAL_RETRY_DELAY_MS * 2 ** (_0x190c10 - 1), _0x31df1a, _0x190c10);
    }
  }
  throw new Error("实验分批请求重试失败。");
}
function restoreStoryEpisodeExperimentalDraft(_0x336d85, {
  episodeRef = "",
  sourceFingerprint = "",
  sourceScenes = [],
  sourceBeats = [],
  assets = [],
  constraints = {},
  promptExperiment = false,
  promptMode = "seedance-2.0"
} = {}) {
  const _0x1d951a = cloneStoryEpisodeExperimentalValue(_0x336d85);
  if (!_0x1d951a || _0x1d951a.strategy !== STORY_EPISODE_EXPERIMENTAL_DRAFT_STRATEGY || _0x1d951a.schemaVersion !== STORY_EPISODE_BATCHED_SPLIT_SCHEMA_VERSION || normalizeText(_0x1d951a.episodeRef) !== episodeRef || normalizeText(_0x1d951a.sourceFingerprint) !== sourceFingerprint) {
    return null;
  }
  try {
    const _0x358fab = parseStoryEpisodeSplitBlueprint(_0x1d951a.blueprint, {
      episodeRef: episodeRef,
      sourceScenes: sourceScenes,
      sourceBeats: sourceBeats,
      assets: assets,
      constraints: constraints,
      enforceMaxDuration: false,
      includeDirectorContinuity: promptExperiment === true
    });
    const _0x2a7e99 = new Map(_0x358fab.clipPlans.map(_0x2a3e0d => [normalizeText(_0x2a3e0d?.ref), _0x2a3e0d]));
    const _0x1bef96 = Array.isArray(_0x1d951a.completedClips) ? _0x1d951a.completedClips : [];
    const _0x4c6fee = Array.isArray(_0x1d951a.completedPlanResults) ? _0x1d951a.completedPlanResults : _0x1bef96.filter(_0x2e76f7 => _0x2a7e99.has(normalizeText(_0x2e76f7?.ref))).map(_0x18a10e => ({
      sourcePlanRef: normalizeText(_0x18a10e?.ref),
      clips: [_0x18a10e]
    }));
    const _0x5977f6 = new Map(_0x4c6fee.map(_0x369e65 => [normalizeText(_0x369e65?.sourcePlanRef), _0x369e65]));
    if (_0x5977f6.size !== _0x4c6fee.length || _0x4c6fee.some(_0x2ed2af => !_0x2a7e99.has(normalizeText(_0x2ed2af?.sourcePlanRef)))) {
      return null;
    }
    const _0x26f4cd = [];
    const _0x3f6d8b = new Set();
    _0x358fab.clipPlans.forEach(_0x240ee0 => {
      const _0x3316be = _0x5977f6.get(_0x240ee0.ref);
      if (!_0x3316be) {
        return;
      }
      const _0x15986f = parseStoryEpisodeSplitResult({
        episodeRef: episodeRef,
        clips: Array.isArray(_0x3316be.clips) ? _0x3316be.clips : []
      }, {
        episodeRef: episodeRef,
        constraints: constraints,
        assets: assets,
        clipPlans: [_0x240ee0],
        minimumShotsPerClip: 1,
        maximumShotsPerClip: STORY_EPISODE_EXPERIMENTAL_MAX_SHOTS_PER_CLIP,
        enforceMaxDuration: false,
        repairMissingShotFields: true,
        allowEmptyAudio: true,
        requireAllPlanCharacters: false,
        completePlanSceneUsage: true,
        includeCutAfter: true,
        promptMode: promptMode
      });
      if (_0x15986f.clips.some(_0x251ed0 => _0x3f6d8b.has(_0x251ed0.ref))) {
        throw new Error("实验分批断点包含重复的片段引用。");
      }
      _0x15986f.clips.forEach(_0x25fab4 => _0x3f6d8b.add(_0x25fab4.ref));
      _0x26f4cd.push({
        sourcePlanRef: _0x240ee0.ref,
        clips: _0x15986f.clips
      });
    });
    const _0x35808e = new Set(_0x26f4cd.map(_0x68f6df => _0x68f6df.sourcePlanRef));
    const _0xbe4990 = _0x26f4cd.flatMap(_0xa9b2c2 => _0xa9b2c2.clips);
    return {
      ..._0x1d951a,
      blueprint: _0x358fab,
      completedPlanResults: _0x26f4cd,
      completedClips: _0xbe4990,
      failedBatchRefs: normalizeStringArray(_0x1d951a.failedBatchRefs).filter(_0x4615be => !_0x35808e.has(_0x4615be) && _0x2a7e99.has(_0x4615be)),
      attempts: Math.max(0, Math.trunc(Number(_0x1d951a.attempts) || 0))
    };
  } catch {
    return null;
  }
}
async function saveStoryEpisodeExperimentalCheckpoint(_0x7bd9c0, _0x57e696) {
  _0x7bd9c0.updatedAt = Date.now();
  if (typeof _0x57e696 === "function") {
    await _0x57e696(cloneStoryEpisodeExperimentalValue(_0x7bd9c0));
  }
  return _0x7bd9c0;
}
function createStoryEpisodeExperimentalBatchDraft(_0x5384e4, {
  episodeRef = "",
  clipPlans = [],
  constraints = {},
  assets = [],
  promptMode = "seedance-2.0"
} = {}) {
  const _0x5b65e4 = normalizeStoryEpisodeSplitDraft(_0x5384e4, {
    episodeRef: episodeRef,
    constraints: constraints,
    assets: assets,
    clipPlans: clipPlans,
    minimumShotsPerClip: 1,
    maximumShotsPerClip: STORY_EPISODE_EXPERIMENTAL_MAX_SHOTS_PER_CLIP,
    enforceMaxDuration: false,
    repairMissingShotFields: true,
    allowEmptyAudio: true,
    requireAllPlanCharacters: false,
    completePlanSceneUsage: true,
    includeCutAfter: true,
    promptMode: promptMode
  });
  const _0xca825c = clipPlans.map(_0xe198c0 => normalizeText(_0xe198c0?.ref));
  const _0x298f3e = new Set(_0xca825c);
  const _0xa0dee4 = new Map();
  _0x5b65e4.items.forEach(_0x339080 => {
    const _0xfe5ff6 = normalizeText(_0x339080?.sourceClipRef);
    if (!_0xfe5ff6 || !_0x298f3e.has(_0xfe5ff6)) {
      return;
    }
    if (_0xa0dee4.has(_0xfe5ff6)) {
      _0xa0dee4.set(_0xfe5ff6, {
        status: "invalid",
        sourceIndex: _0xca825c.indexOf(_0xfe5ff6),
        sourceClipRef: _0xfe5ff6,
        rawClips: [],
        error: {
          message: "Agent 重复返回了计划“" + _0xfe5ff6 + "”。"
        }
      });
      return;
    }
    _0xa0dee4.set(_0xfe5ff6, _0x339080);
  });
  const _0x3be538 = _0xca825c.map((_0x580986, _0x21edfa) => {
    const _0xf30f98 = _0xa0dee4.get(_0x580986);
    if (_0xf30f98) {
      return {
        ..._0xf30f98,
        sourceIndex: _0x21edfa,
        sourceClipRef: _0x580986
      };
    }
    return {
      status: "invalid",
      sourceIndex: _0x21edfa,
      sourceClipRef: _0x580986,
      rawClips: [],
      error: {
        message: "Agent 未完整返回计划“" + _0x580986 + "”。"
      }
    };
  });
  return {
    ..._0x5b65e4,
    items: _0x3be538
  };
}
function finalizeStoryEpisodeExperimentalBatchDraft(_0x2c71d4 = {}) {
  const _0x43c69d = finalizeStoryEpisodeSplitDraft(_0x2c71d4);
  if (!_0x43c69d) {
    return null;
  }
  return {
    ..._0x43c69d,
    planResults: _0x2c71d4.items.map(_0x50125c => ({
      sourcePlanRef: _0x50125c.sourceClipRef,
      clips: _0x50125c.clips
    }))
  };
}
function assertStoryEpisodeExperimentalPlanTiming(_0x730162 = {}, _0x3d65c5 = []) {
  const _0x386804 = new Map((Array.isArray(_0x730162?.planResults) ? _0x730162.planResults : []).map(_0x37800e => [normalizeText(_0x37800e?.sourcePlanRef), _0x37800e]));
  const _0x5647dd = (Array.isArray(_0x3d65c5) ? _0x3d65c5 : []).flatMap(_0x1c58f5 => {
    const _0x2706a4 = normalizeText(_0x1c58f5?.ref);
    const _0x351843 = normalizePositiveNumber(_0x1c58f5?.targetDurationSec);
    const _0x4d4118 = _0x386804.get(_0x2706a4);
    if (!_0x2706a4 || !_0x351843 || !_0x4d4118) {
      return [];
    }
    const _0x11eeb8 = (Array.isArray(_0x4d4118?.clips) ? _0x4d4118.clips : []).reduce((_0x37e55e, _0x507a86) => _0x37e55e + (normalizePositiveNumber(_0x507a86?.durationSec) || 0), 0);
    const _0x2c17ad = Number((_0x351843 * 0.8).toFixed(1));
    const _0x379488 = Number((_0x351843 * 1.2).toFixed(1));
    if (_0x11eeb8 >= _0x2c17ad && _0x11eeb8 <= _0x379488) {
      return [];
    }
    return [{
      planRef: _0x2706a4,
      totalDurationSeconds: _0x11eeb8,
      targetDurationSec: _0x351843,
      minimum: _0x2c17ad,
      maximum: _0x379488
    }];
  });
  if (!_0x5647dd.length) {
    return _0x730162;
  }
  const _0x22ce96 = _0x5647dd.slice(0, 4).map(_0x8270cb => "计划“" + _0x8270cb.planRef + "”分镜合计 " + _0x8270cb.totalDurationSeconds + " 秒，审时预算 " + _0x8270cb.targetDurationSec + " 秒（允许 " + _0x8270cb.minimum + "-" + _0x8270cb.maximum + " 秒）").join("；");
  const _0x2de0d8 = new Error("实验分批时长自检未通过：" + _0x22ce96 + "。");
  _0x2de0d8.code = "STORY_EPISODE_EXPERIMENTAL_PLAN_TIMING_MISMATCH";
  _0x2de0d8.retryable = true;
  _0x2de0d8.timingMismatches = _0x5647dd;
  throw _0x2de0d8;
}
async function requestStoryEpisodeExperimentalBatchResult({
  request: _0x35e1a8,
  requestPayload: _0x3d6a12,
  episodeRef = "",
  clipPlans = [],
  constraints = {},
  assets = [],
  promptMode = "seedance-2.0",
  enforcePlanDurationTargets = false
} = {}) {
  const _0x4f20cf = {
    episodeRef: episodeRef,
    clipPlans: clipPlans,
    constraints: constraints,
    assets: assets,
    promptMode: promptMode
  };
  const _0x380eec = await _0x35e1a8(_0x3d6a12);
  const _0x57eaa5 = createStoryEpisodeExperimentalBatchDraft(_0x380eec, _0x4f20cf);
  const _0x1835f5 = getStoryEpisodeScriptFinishReason(_0x380eec);
  const _0x4a4dd2 = finalizeStoryEpisodeExperimentalBatchDraft(_0x57eaa5);
  if (_0x4a4dd2) {
    if (enforcePlanDurationTargets) {
      return assertStoryEpisodeExperimentalPlanTiming(_0x4a4dd2, clipPlans);
    } else {
      return _0x4a4dd2;
    }
  }
  const _0x79f129 = _0x57eaa5.items.filter(_0x2ee695 => _0x2ee695?.status === "valid").map(_0x356120 => ({
    sourcePlanRef: _0x356120.sourceClipRef,
    clips: _0x356120.clips
  }));
  const _0x55ce42 = _0x57eaa5.items.find(_0x47ea8d => _0x47ea8d?.status !== "valid");
  const _0x3f7f5f = new Error(["length", "max_tokens", "max_output_tokens"].includes(_0x1835f5) ? "实验分批输出被截断（finish reason: " + _0x1835f5 + "）。" : normalizeText(_0x55ce42?.error?.message) || "实验分批仍有片段未通过校验。");
  if (["length", "max_tokens", "max_output_tokens"].includes(_0x1835f5)) {
    _0x3f7f5f.type = "OUTPUT_LENGTH";
    _0x3f7f5f.finishReason = _0x1835f5;
  }
  if (_0x55ce42?.error?.validationDetails) {
    _0x3f7f5f.validationDetails = _0x55ce42.error.validationDetails;
  }
  _0x3f7f5f.partialPlanResults = _0x79f129;
  throw _0x3f7f5f;
}
export async function splitStoryEpisodeExperimental({
  project = {},
  episode = {},
  previousEpisode = null,
  nextEpisode = null,
  assets = [],
  constraints = {},
  model = "",
  provider = "",
  providerProfileId = "",
  promptExperiment = false,
  request = generateText,
  onProgress = null,
  onCheckpoint = null,
  onInvocation = null,
  resumeDraft = null,
  retryWait = waitForStoryEpisodeExperimentalRetry,
  diagnostics = null
} = {}) {
  assertPlanningModel(model, provider);
  const _0x4f0238 = normalizeText(model);
  const _0x335423 = normalizeText(provider);
  const _0x4255e8 = selectStoryEpisodeSplitAssets(assets, episode);
  const _0x181300 = [...new Map((Array.isArray(assets) ? assets : []).map((_0x458362, _0x11e7ee) => normalizePlanningAssetSummary(_0x458362, _0x11e7ee)).filter(_0xc35d22 => _0xc35d22.name).map(_0x4c0d16 => [_0x4c0d16.ref, _0x4c0d16])).values()];
  const _0x3912a4 = resolveStoryPlanningConstraints(project, constraints);
  const _0x350064 = resolveStoryPromptMode(project, constraints);
  const _0x264944 = normalizeStoryEpisodeSplitSourceScenes(episode);
  const _0x399a3b = normalizeStoryEpisodeExperimentalSourceBeats(episode);
  const _0x281995 = getStoryEpisodeReferenceAliases(episode);
  assertStoryEpisodeSceneAssetCoverage(_0x264944, _0x4255e8, {
    episodeRefs: _0x281995
  });
  const _0x3ac82d = a173_0x3e308f(episode?.ref || episode?.planningRef || episode?.id, "episode-1");
  const _0x3ef2da = resolveStoryEpisodeSplitTimingBudget(episode);
  const _0x2a1793 = createStoryEpisodeExperimentalFingerprint({
    project: project,
    episodeRef: _0x3ac82d,
    sourceBeats: _0x399a3b,
    assets: _0x4255e8,
    constraints: _0x3912a4,
    model: _0x4f0238,
    provider: _0x335423,
    providerProfileId: providerProfileId,
    promptExperiment: promptExperiment === true,
    promptMode: _0x350064,
    timingBudget: _0x3ef2da
  });
  const _0x520437 = "episode-split-" + Date.now().toString(36) + "-" + _0x2a1793.slice(-12);
  let _0x4abb59 = 0;
  let _0x1777d5 = 0;
  const _0x4f5051 = (_0x27a417, _0x499e5f, _0x445760) => {
    _0x1777d5 += 1;
    return invokeStoryGenerationRequest({
      request: _0x27a417,
      requestPayload: _0x499e5f,
      stepId: _0x445760,
      attempt: _0x1777d5,
      onInvocation: onInvocation,
      serializeResponse: getResultText
    });
  };
  const _0x243423 = () => {
    _0x4abb59 += 1;
    return _0x4abb59;
  };
  const _0x2b070c = {
    projectId: normalizeText(project?.id),
    episodeId: normalizeText(episode?.id),
    episodeRef: _0x3ac82d,
    episodeNumber: Math.max(1, Math.trunc(Number(episode?.number) || 1)),
    sourceBeatCount: _0x399a3b.length,
    selectedAssetCount: _0x4255e8.length,
    resumed: Boolean(resumeDraft)
  };
  let _0xd38e5 = restoreStoryEpisodeExperimentalDraft(resumeDraft, {
    episodeRef: _0x3ac82d,
    sourceFingerprint: _0x2a1793,
    sourceScenes: _0x264944,
    sourceBeats: _0x399a3b,
    assets: _0x181300,
    constraints: _0x3912a4,
    promptExperiment: promptExperiment === true,
    promptMode: _0x350064
  });
  let _0x8e7a7a = _0xd38e5?.blueprint ? reconcileStoryEpisodeSplitBlueprintTiming(_0xd38e5.blueprint, episode) : null;
  if (_0xd38e5 && _0x8e7a7a) {
    _0xd38e5.blueprint = _0x8e7a7a;
  }
  if (!_0x8e7a7a) {
    onProgress?.({
      stage: "planning-episode-split-blueprint",
      current: 1,
      total: 1,
      message: "正在规划整集分镜蓝图"
    });
    const _0x1369e8 = buildStoryEpisodeSplitBlueprintPrompt({
      project: project,
      episode: episode,
      previousEpisode: previousEpisode,
      nextEpisode: nextEpisode,
      assets: _0x4255e8,
      constraints: _0x3912a4,
      enforceMaxDuration: false,
      sourceBeatsOverride: _0x399a3b,
      promptExperiment: promptExperiment === true,
      promptMode: _0x350064
    });
    const _0x432f50 = JSON.parse(_0x1369e8);
    const _0x238512 = createStoryEpisodeExperimentalDiagnosticRequest({
      request: request,
      diagnostics: diagnostics,
      runId: _0x520437,
      phase: "experimental-blueprint",
      nextRequestSequence: _0x243423,
      carriesFullEpisodeContext: true,
      context: {
        ..._0x2b070c,
        promptSectionCharacters: getStoryEpisodeExperimentalPromptSectionCharacters(_0x432f50)
      }
    });
    _0x8e7a7a = await requestStoryEpisodeExperimentalWithRetry(() => requestStrictResult({
      request: _0x209b3c => _0x4f5051(_0x238512, _0x209b3c, "experimental-blueprint"),
      requestPayload: {
        model: _0x4f0238,
        provider: _0x335423,
        ...buildStoryTextProviderProfilePayload(providerProfileId),
        prompt: _0x1369e8,
        systemPrompt: promptExperiment ? STORY_EPISODE_DIRECTOR_CONTINUITY_BLUEPRINT_SYSTEM_PROMPT : STORY_EPISODE_BATCHED_BLUEPRINT_SYSTEM_PROMPT,
        thinking: {
          type: "disabled"
        },
        allowOversizedPrompt: true,
        structuredOutput: createStoryEpisodeExperimentalStructuredOutput("story_episode_split_blueprint_v3", buildStoryEpisodeSplitBlueprintResponseSchema({
          ..._0x3912a4,
          enforceMaxDuration: false,
          includeSceneAssetRef: Object.prototype.hasOwnProperty.call(_0x432f50?.outputSchema?.clipPlans?.[0] || {}, "sceneAssetRef"),
          includeDirectorContinuity: promptExperiment === true
        })),
        temperature: STORY_EPISODE_SPLIT_TEMPERATURE,
        timeoutMs: STORY_TEXT_REQUEST_TIMEOUT_MS,
        maxOutputTokens: STORY_EPISODE_SPLIT_MAX_OUTPUT_TOKENS
      },
      parse: _0x5232ae => {
        try {
          const _0xbcd222 = getStoryEpisodeScriptFinishReason(_0x5232ae);
          if (["length", "max_tokens", "max_output_tokens"].includes(_0xbcd222)) {
            throw Object.assign(new Error("实验分批蓝图输出被截断（finish reason: " + _0xbcd222 + "）。"), {
              type: "OUTPUT_LENGTH",
              finishReason: _0xbcd222
            });
          }
          return parseStoryEpisodeSplitBlueprint(_0x5232ae, {
            episodeRef: _0x3ac82d,
            episodeRefs: _0x281995,
            sourceScenes: _0x264944,
            sourceBeats: _0x399a3b,
            assets: _0x4255e8,
            constraints: _0x3912a4,
            enforceMaxDuration: false,
            includeDirectorContinuity: promptExperiment === true
          });
        } catch (_0x5707fd) {
          if (_0x5707fd?.type === "OUTPUT_LENGTH") {
            throw _0x5707fd;
          }
          reportStoryEpisodeSplitRequestDiagnostics(diagnostics, {
            phase: "experimental-blueprint-local-fallback",
            carriesFullEpisodeContext: false,
            automaticCallLimit: 1,
            details: {
              status: "recovered-locally",
              countsTowardRequestTotal: false,
              runId: _0x520437,
              errorCode: normalizeText(_0x5707fd?.code),
              errorMessage: normalizeText(_0x5707fd?.message || _0x5707fd),
              responsePreview: normalizeText(_0x5707fd?.responsePreview)
            }
          });
          return createLocalStoryEpisodeSplitBlueprint({
            episodeRef: _0x3ac82d,
            episodeRefs: _0x281995,
            sourceScenes: _0x264944,
            sourceBeats: _0x399a3b,
            assets: _0x4255e8,
            includeDirectorContinuity: promptExperiment === true
          });
        }
      },
      outputContract: promptExperiment ? "episodeRef and ordered clipPlans[{sourceBeatRefs,beat,optional sceneAssetRef,sceneAppearanceRef,entryState,exitState,openingShotIntent,closingShotIntent,characterAssetRefs,propAssetRefs,targetDurationSec}] covering every sourceBeat exactly once; local code derives plan refs, source scenes, continuity notes, and uniquely bound scene assets" : "episodeRef and ordered clipPlans[{sourceBeatRefs,beat,optional sceneAssetRef,sceneAppearanceRef,entryState,exitState,characterAssetRefs,propAssetRefs,targetDurationSec}] covering every sourceBeat exactly once; local code derives plan refs, source scenes, continuity notes, and uniquely bound scene assets",
      maxAttempts: 1
    }), {
      retryWait: retryWait
    });
    _0x8e7a7a = reconcileStoryEpisodeSplitBlueprintTiming(_0x8e7a7a, episode);
    _0xd38e5 = {
      schemaVersion: STORY_EPISODE_BATCHED_SPLIT_SCHEMA_VERSION,
      strategy: STORY_EPISODE_EXPERIMENTAL_DRAFT_STRATEGY,
      episodeRef: _0x3ac82d,
      sourceFingerprint: _0x2a1793,
      status: "expanding",
      blueprint: _0x8e7a7a,
      completedPlanResults: [],
      completedClips: [],
      failedBatchRefs: [],
      attempts: 0,
      error: "",
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    await saveStoryEpisodeExperimentalCheckpoint(_0xd38e5, onCheckpoint);
  } else {
    const _0x2645f0 = Array.isArray(_0xd38e5.completedPlanResults) ? _0xd38e5.completedPlanResults.length : 0;
    onProgress?.({
      stage: "resuming-episode-split-batches",
      current: _0x2645f0,
      total: _0x8e7a7a.clipPlans.length,
      message: "正在从断点继续，已完成 " + _0x2645f0 + "/" + _0x8e7a7a.clipPlans.length + " 个蓝图计划"
    });
  }
  const _0x5eddb9 = new Map((Array.isArray(_0xd38e5.completedPlanResults) ? _0xd38e5.completedPlanResults : []).map(_0x44ebbd => [normalizeText(_0x44ebbd?.sourcePlanRef), _0x44ebbd]));
  const _0x2843a8 = _0x8e7a7a.clipPlans.filter(_0x261894 => !_0x5eddb9.has(_0x261894.ref));
  const _0x2c28cb = createStoryEpisodeExperimentalConcurrentBatches(_0x2843a8);
  let _0x5d0080 = 0;
  const _0x593055 = async _0x266bec => {
    _0x266bec.planResults.forEach(_0x535f4e => {
      _0x5eddb9.set(_0x535f4e.sourcePlanRef, _0x535f4e);
    });
    _0xd38e5.completedPlanResults = _0x8e7a7a.clipPlans.map(_0x1e9a3f => _0x5eddb9.get(_0x1e9a3f.ref)).filter(Boolean);
    _0xd38e5.completedClips = _0xd38e5.completedPlanResults.flatMap(_0x5c2368 => _0x5c2368.clips);
    _0xd38e5.status = "expanding";
    _0xd38e5.failedBatchRefs = [];
    _0xd38e5.error = "";
    await saveStoryEpisodeExperimentalCheckpoint(_0xd38e5, onCheckpoint);
  };
  const _0x37192b = async (_0x2daad6, {
    previousError = null
  } = {}) => {
    _0x5d0080 += 1;
    _0xd38e5.attempts += 1;
    onProgress?.({
      stage: "expanding-episode-split-batch",
      current: _0x5eddb9.size,
      total: _0x8e7a7a.clipPlans.length,
      message: "正在展开 " + _0x2daad6.length + " 个蓝图计划，已完成 " + _0x5eddb9.size + "/" + _0x8e7a7a.clipPlans.length
    });
    const _0xc4c55 = buildStoryEpisodeSplitBatchPrompt({
      project: project,
      episode: episode,
      assets: _0x4255e8,
      constraints: _0x3912a4,
      blueprint: _0x8e7a7a,
      planBatch: _0x2daad6,
      batchNumber: _0x5d0080,
      batchTotal: _0x2c28cb.length,
      enforceMaxDuration: false,
      sourceBeatsOverride: _0x399a3b,
      promptExperiment: promptExperiment === true,
      promptMode: _0x350064,
      timingCorrection: previousError?.code === "STORY_EPISODE_EXPERIMENTAL_PLAN_TIMING_MISMATCH" ? {
        previousFailure: normalizeText(previousError?.message),
        instruction: "重新分配原文已有动作、等待、反应与转场的镜头时长，逐项验算后返回。"
      } : null
    });
    const _0x5084b7 = JSON.parse(_0xc4c55);
    const _0x13a762 = Array.isArray(_0x5084b7?.assets) ? _0x5084b7.assets : [];
    const _0x4c3b16 = createStoryEpisodeExperimentalDiagnosticRequest({
      request: request,
      diagnostics: diagnostics,
      runId: _0x520437,
      phase: "experimental-batch-" + _0x5d0080,
      nextRequestSequence: _0x243423,
      carriesFullEpisodeContext: false,
      context: {
        ..._0x2b070c,
        batchSequence: _0x5d0080,
        batchClipCount: _0x2daad6.length,
        batchClipRefs: _0x2daad6.map(_0x3dccfe => _0x3dccfe.ref),
        completedPlanCount: _0x5eddb9.size,
        completedClipCount: _0xd38e5.completedClips.length,
        plannedClipCount: _0x8e7a7a.clipPlans.length,
        promptSectionCharacters: getStoryEpisodeExperimentalPromptSectionCharacters(_0x5084b7)
      }
    });
    return await requestStoryEpisodeExperimentalBatchResult({
      request: _0x1d04ab => _0x4f5051(_0x4c3b16, _0x1d04ab, "experimental-batch:" + _0x2daad6.map(_0x8a8db6 => _0x8a8db6.ref).join(",")),
      requestPayload: {
        model: _0x4f0238,
        provider: _0x335423,
        ...buildStoryTextProviderProfilePayload(providerProfileId),
        prompt: _0xc4c55,
        systemPrompt: getStoryEpisodeExperimentalExpansionSystemPrompt({
          promptExperiment: promptExperiment,
          promptMode: _0x350064
        }),
        thinking: {
          type: "disabled"
        },
        allowOversizedPrompt: true,
        structuredOutput: createStoryEpisodeExperimentalStructuredOutput("story_episode_split_batch_v3", buildStoryEpisodeSplitBatchResponseSchema({
          clipCount: _0x2daad6.length,
          maxDurationSeconds: _0x3912a4.sceneMaxSeconds,
          minimumShotsPerClip: 1,
          maximumShotsPerClip: STORY_EPISODE_EXPERIMENTAL_MAX_SHOTS_PER_CLIP,
          requiredClipFields: ["ref", "shots"],
          requiredShotFields: ["durationSec", ...(isStoryContinuousTimelinePromptMode(_0x350064) ? ["startSec", "endSec"] : []), "assetRefs", "visual", "camera", ...(promptExperiment ? ["transitionFromPrevious"] : [])],
          compactExperimental: true,
          includeDirectorContinuity: promptExperiment === true,
          includeTimeline: isStoryContinuousTimelinePromptMode(_0x350064)
        })),
        temperature: STORY_EPISODE_SPLIT_TEMPERATURE,
        timeoutMs: STORY_TEXT_REQUEST_TIMEOUT_MS,
        maxOutputTokens: STORY_EPISODE_SPLIT_MAX_OUTPUT_TOKENS
      },
      episodeRef: _0x3ac82d,
      clipPlans: _0x2daad6,
      constraints: _0x3912a4,
      assets: _0x13a762,
      promptMode: _0x350064,
      enforcePlanDurationTargets: Boolean(_0x3ef2da)
    });
  };
  const _0xc94efb = async _0x4db467 => {
    let _0x167488 = null;
    try {
      _0x167488 = await requestStoryEpisodeExperimentalWithRetry((_0x5ac0ff, _0x1cac05) => _0x37192b(_0x4db467, {
        previousError: _0x1cac05
      }), {
        retryWait: retryWait,
        splitOversizedBatch: _0x4db467.length > 1
      });
    } catch (_0x356972) {
      if (Array.isArray(_0x356972?.partialPlanResults) && _0x356972.partialPlanResults.length) {
        await _0x593055({
          planResults: _0x356972.partialPlanResults,
          clips: _0x356972.partialPlanResults.flatMap(_0x3f5d => _0x3f5d.clips)
        });
      }
      if (isStoryEpisodeExperimentalBatchShrinkable(_0x356972) && _0x4db467.length > 1) {
        const _0x2f6c63 = _0x4db467.filter(_0x4646fb => !_0x5eddb9.has(_0x4646fb.ref));
        const _0x3d0a1f = Math.floor(_0x2f6c63.length / 2);
        const _0x48a15d = _0x2f6c63.slice(0, _0x3d0a1f);
        const _0x261206 = _0x2f6c63.slice(_0x3d0a1f);
        onProgress?.({
          stage: "shrinking-episode-split-batch",
          current: _0x5eddb9.size,
          total: _0x8e7a7a.clipPlans.length,
          message: "当前批次内容较多，正在缩小为 " + _0x48a15d.length + "+" + _0x261206.length + " 个片段继续生成"
        });
        if (_0x48a15d.length) {
          await _0xc94efb(_0x48a15d);
        }
        if (_0x261206.length) {
          await _0xc94efb(_0x261206);
        }
        return;
      }
      throw _0x356972;
    }
    await _0x593055(_0x167488);
  };
  const _0x459702 = await settleStoryEpisodeExperimentalBatches(_0x2c28cb, _0x5b2bb7 => _0xc94efb(_0x5b2bb7), STORY_EPISODE_EXPERIMENTAL_MAX_CONCURRENT_BATCHES);
  const _0x45043c = _0x459702.find(_0x1a97fb => _0x1a97fb.status === "rejected");
  if (_0x45043c) {
    const _0x129be2 = _0x45043c.reason instanceof Error ? _0x45043c.reason : new Error(normalizeText(_0x45043c.reason) || "实验分批生成失败。");
    _0xd38e5.status = "failed";
    _0xd38e5.failedBatchRefs = _0x2843a8.map(_0x3cf38d => _0x3cf38d.ref).filter(_0x2bf7aa => !_0x5eddb9.has(_0x2bf7aa));
    _0xd38e5.error = normalizeText(_0x129be2?.message || _0x129be2) || "实验分批生成失败。";
    await saveStoryEpisodeExperimentalCheckpoint(_0xd38e5, onCheckpoint);
    _0x129be2.experimentalDraft = cloneStoryEpisodeExperimentalValue(_0xd38e5);
    if (_0x5eddb9.size) {
      _0x129be2.message = _0xd38e5.error + "（已完成 " + _0x5eddb9.size + "/" + _0x8e7a7a.clipPlans.length + " 个蓝图计划，保留 " + _0xd38e5.completedClips.length + " 个片段；再次点击实验分批可继续。）";
    }
    throw _0x129be2;
  }
  const _0x30ef3a = _0x8e7a7a.clipPlans.map(_0x1964ef => _0x5eddb9.get(_0x1964ef.ref)).filter(Boolean);
  if (_0x30ef3a.length !== _0x8e7a7a.clipPlans.length) {
    throw new Error("实验分批拆分未完整覆盖整集蓝图。");
  }
  const _0x3ba4cb = repackStoryEpisodeExperimentalClips({
    episodeRef: _0x3ac82d,
    clipPlans: _0x8e7a7a.clipPlans,
    completedPlanResults: _0x30ef3a,
    maxDurationSeconds: resolveStoryPromptModeClipMaxSeconds(_0x350064, _0x3912a4.sceneMaxSeconds),
    minDurationSeconds: STORY_EPISODE_EXPERIMENTAL_MIN_CLIP_DURATION_SECONDS,
    promptExperiment: promptExperiment === true,
    preserveSourceGroups: isStoryContinuousTimelinePromptMode(_0x350064)
  });
  _0xd38e5.status = "completed";
  _0xd38e5.completedPlanResults = _0x30ef3a;
  _0xd38e5.completedClips = _0x3ba4cb;
  _0xd38e5.failedBatchRefs = [];
  _0xd38e5.error = "";
  await saveStoryEpisodeExperimentalCheckpoint(_0xd38e5, onCheckpoint);
  return assertStoryEpisodeSplitTiming({
    episodeRef: _0x3ac82d,
    clips: _0x3ba4cb
  }, episode);
}