import { generateText } from "./aiTextApi.js";
import { VIDEO_REPLICATION_PROMPT_MODEL_ID, buildVideoReplicationPromptAnalysisPrompt, createVideoReplicationPromptStructuredOutput, parseVideoReplicationPromptAnalysisResult } from "../src/modules/videoReplication/videoReplicationPromptAnalysis.js";
const VIDEO_REPLICATION_MAX_OUTPUT_TOKENS = 16384;
export async function analyzeVideoReplicationClip({
  videoRef = "",
  durationSec = 0,
  modelId = VIDEO_REPLICATION_PROMPT_MODEL_ID,
  provider = "",
  providerProfileId = "",
  targetLocale = "zh-CN",
  targetLocaleLabel = "中国 · 中文",
  visualStyle = "",
  request = generateText
} = {}) {
  const _0x55ce0d = String(videoRef || "").trim();
  if (!_0x55ce0d) {
    throw new Error("待反推片段缺少视频地址");
  }
  if (typeof request !== "function") {
    throw new Error("视频理解请求不可用");
  }
  const _0x1723ef = await request({
    model: modelId,
    prompt: buildVideoReplicationPromptAnalysisPrompt({
      durationSec: durationSec,
      targetLocale: targetLocale,
      targetLocaleLabel: targetLocaleLabel,
      visualStyle: visualStyle
    }),
    systemPrompt: "You analyze short videos, preserve their story and dialogue, localize them to the requested language and visual style, and return strict JSON.",
    inputVideoUrls: [_0x55ce0d],
    mediaPolicy: "image-video",
    allowVideo: true,
    structuredOutput: createVideoReplicationPromptStructuredOutput(),
    thinking: {
      type: "disabled"
    },
    temperature: 0.2,
    maxOutputTokens: VIDEO_REPLICATION_MAX_OUTPUT_TOKENS,
    timeoutMs: 300000,
    ...(providerProfileId ? {
      providerProfileId: providerProfileId
    } : {}),
    ...(provider ? {
      provider: provider
    } : {})
  });
  return parseVideoReplicationPromptAnalysisResult(_0x1723ef, {
    durationSec: durationSec
  });
}