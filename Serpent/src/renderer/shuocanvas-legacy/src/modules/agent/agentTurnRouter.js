const NEGATED_CANVAS_ACTION_PATTERNS = Object.freeze([/\b(?:do not|don't|dont|please don't)\s+(?:change|edit|modify|touch|move|create|generate|alter)(?:\s+the)?\s+(?:canvas|nodes?)\b/i, /(?:不要|别|先不|不用|无需).{0,8}(?:动|修改|改变|编辑|操作|调整).{0,6}(?:画布|节点)/]);
const CANVAS_TARGET_PATTERN = /\b(?:canvas|nodes?|selection|selected|layout|grid|collage|task)\b|画布|节点|选中|连线|连接|排列|对齐|网格|拼贴|副本|任务/iu;
const CANVAS_TARGET_ACTION_PATTERN = /\b(?:create|generate|draw|render|add|insert|put|place|save|write|modify|change|edit|rename|label|arrange|align|connect|delete|duplicate|select|export|download|run|start|continue|execute)\b|生成|创建|新建|添加|插入|放到|放进|写入|保存到|修改|改成|调整|重排|排列|对齐|连接|删除|复制|选中|选择|导出|下载|运行|开始|继续|执行/iu;
const MEDIA_GENERATION_PATTERN = /(?:\b(?:create|generate|draw|render|make)\b.{0,24}\b(?:image|picture|photo|poster|video(?!\s+(?:copy|script))|animation|audio|voice|music)\b)|(?:(?:生成|创建|新建|制作|做|画|出).{0,16}(?:图片|图像|海报|产品图|商品图|视频(?!文案|脚本)|动画|音频|配音|音乐))/iu;
const MODEL_CHANGE_PATTERN = /(?:\b(?:change|switch|set|use)\b.{0,24}\bmodel\b)|(?:(?:改成|改用|换成|更换|切换|设置|使用).{0,24}模型)/iu;
const TEXT_CREATION_PATTERN = /\b(?:copywriting|copy|slogan|tagline|headline|article|paragraph|script|prompt|caption|description|outline|proposal)\b|文案|广告语|宣传语|标题|脚本|提示词|简介|介绍|口播|文章|段落|大纲|方案|策划/iu;
const CONVERSATIONAL_CONTINUATION_PATTERN = /^(?:继续(?:写|改|润色|优化)?|再来(?:一版|一个|一些)?|换(?:一版|一个|一种)|更.{0,16}(?:一点|一些))\s*[。.!！]?$/iu;
const IMPLICIT_CANVAS_OPERATION_PATTERN = /\b(?:arrange|align|connect|delete|duplicate|select|export|download)\b|重排|横向排列|纵向排列|网格排列|对齐|连线|删除|复制.{0,8}(?:份|个|张)|选中|批量下载|批量导出/iu;
const GENERAL_ACTION_PATTERN = Object.freeze([/\b(create|generate|draw|render|add|insert|modify|change|edit|rename|label|arrange|align|connect|delete|duplicate|select|run|start|continue|execute)\b/i, /\bmake\s+(?:an?|the|this|that|it|image|picture|video|clip|node|canvas)\b/i, /生成|创建|新建|添加|插入|画图|画(?:一|个|张|幅)|制作|做(?:一个|一张|一段|一版|成|出)|出图|出视频/, /修改|改成|调整|重排|排列|对齐|连接|删除|复制|选中|选择|运行|开始|继续|执行/]);
export function routeAgentTurn({
  message = "",
  intent = null,
  clarificationAnswer = false,
  pendingPlan = false
} = {}) {
  if (clarificationAnswer || pendingPlan) {
    return {
      channel: "canvas.tool",
      reason: "continuation"
    };
  }
  if (intent?.canvasAction === true || intent?.mutatesCanvas === true) {
    return {
      channel: "canvas.tool",
      reason: "explicit-intent"
    };
  }
  const _0x41029c = String(message || "").trim();
  if (!_0x41029c) {
    return {
      channel: "assistant.message",
      reason: "empty"
    };
  }
  if (NEGATED_CANVAS_ACTION_PATTERNS.some(_0x2d78dd => _0x2d78dd.test(_0x41029c))) {
    return {
      channel: "assistant.message",
      reason: "canvas-action-negated"
    };
  }
  if (CANVAS_TARGET_PATTERN.test(_0x41029c) && CANVAS_TARGET_ACTION_PATTERN.test(_0x41029c)) {
    return {
      channel: "canvas.tool",
      reason: "canvas-target"
    };
  }
  if (MEDIA_GENERATION_PATTERN.test(_0x41029c)) {
    return {
      channel: "canvas.tool",
      reason: "media-generation"
    };
  }
  if (MODEL_CHANGE_PATTERN.test(_0x41029c)) {
    return {
      channel: "canvas.tool",
      reason: "model-change"
    };
  }
  if (TEXT_CREATION_PATTERN.test(_0x41029c)) {
    return {
      channel: "assistant.message",
      reason: "text-creation"
    };
  }
  if (CONVERSATIONAL_CONTINUATION_PATTERN.test(_0x41029c)) {
    return {
      channel: "assistant.message",
      reason: "conversation-continuation"
    };
  }
  if (IMPLICIT_CANVAS_OPERATION_PATTERN.test(_0x41029c)) {
    return {
      channel: "canvas.tool",
      reason: "canvas-operation"
    };
  }
  if (GENERAL_ACTION_PATTERN.some(_0x6c712 => _0x6c712.test(_0x41029c))) {
    return {
      channel: "canvas.tool",
      reason: "general-action"
    };
  }
  return {
    channel: "assistant.message",
    reason: "conversation"
  };
}
export function hasAgentCanvasActionIntent(_0x19ea1d = "", _0x48063d = {}) {
  return routeAgentTurn({
    message: _0x19ea1d,
    intent: _0x48063d?.intent,
    clarificationAnswer: Boolean(_0x48063d?.clarificationAnswer),
    pendingPlan: Boolean(_0x48063d?.pendingPlan)
  }).channel === "canvas.tool";
}