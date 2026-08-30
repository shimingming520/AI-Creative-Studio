import { agnesImage, agnesVideo } from "./agnesResolvers.js";
import { apimartSeedanceVideo, apimartOmniFlashVideo, apimartVeo3Video, apimartHappyHorseVideo, apimartHailuo02Video, apimartHailuo23Video, apimartMinimaxH3Video, apimartViduQ3Video, apimartKlingO1Video, apimartKlingV3OmniVideo, apimartWan27Video } from "./apimartVideoResolvers.js";
import { minimaxH3Video } from "./minimaxVideoResolvers.js";
import { apimartMidjourneyImage, apimartGrokImagineImage, apimartGrokImagineImageEndpoint, apimartGptImage2Image, customProviderGeminiImage, customProviderGeminiImageEndpoint, ppioImageSize, grsaiImage, grsaiGptImage2Image, runninghubImage, runninghubImageEndpoint } from "./imageResolvers.js";
import { runninghubHappyHorseVideo, runninghubSeedance2Video, runninghubKlingO1Video, runninghubKlingV3Video, runninghubKlingO3Video, runninghubHailuo02Video, runninghubHailuo23Video, runninghubVeo3Video, runninghubWan27Video, runninghubKlingO1VideoEndpoint, runninghubHappyHorseVideoEndpoint, runninghubSeedance2VideoEndpoint, runninghubKlingV3VideoEndpoint, runninghubKlingO3VideoEndpoint, runninghubHailuo02VideoEndpoint, runninghubHailuo23VideoEndpoint, runninghubVeo3VideoEndpoint, runninghubWan27VideoEndpoint } from "./runningHubVideoResolvers.js";
import { runninghubHailuoH3Video, runninghubHailuoH3VideoEndpoint } from "./runningHubHailuoH3VideoResolvers.js";
import { runninghubLlmChatEndpoint } from "./textResolvers.js";
import { volcengineSeedance2Video } from "./volcengineVideoResolvers.js";
import { binghuoVideo } from "./binghuoVideoResolvers.js";
import { volcengineDoubaoAudioGeneration } from "./volcengineAudioResolvers.js";
const BODY_RESOLVERS = Object.freeze({
  agnesImage: agnesImage,
  agnesVideo: agnesVideo,
  apimartMidjourneyImage: apimartMidjourneyImage,
  apimartGrokImagineImage: apimartGrokImagineImage,
  apimartGptImage2Image: apimartGptImage2Image,
  customProviderGeminiImage: customProviderGeminiImage,
  ppioImageSize: ppioImageSize,
  grsaiImage: grsaiImage,
  grsaiGptImage2Image: grsaiGptImage2Image,
  runninghubImage: runninghubImage,
  apimartSeedanceVideo: apimartSeedanceVideo,
  apimartOmniFlashVideo: apimartOmniFlashVideo,
  apimartVeo3Video: apimartVeo3Video,
  apimartHappyHorseVideo: apimartHappyHorseVideo,
  runninghubHappyHorseVideo: runninghubHappyHorseVideo,
  runninghubSeedance2Video: runninghubSeedance2Video,
  volcengineSeedance2Video: volcengineSeedance2Video,
  volcengineDoubaoAudioGeneration: volcengineDoubaoAudioGeneration,
  apimartHailuo02Video: apimartHailuo02Video,
  apimartHailuo23Video: apimartHailuo23Video,
  apimartMinimaxH3Video: apimartMinimaxH3Video,
  minimaxH3Video: minimaxH3Video,
  apimartViduQ3Video: apimartViduQ3Video,
  apimartKlingO1Video: apimartKlingO1Video,
  runninghubKlingO1Video: runninghubKlingO1Video,
  runninghubKlingV3Video: runninghubKlingV3Video,
  runninghubKlingO3Video: runninghubKlingO3Video,
  runninghubHailuo02Video: runninghubHailuo02Video,
  runninghubHailuo23Video: runninghubHailuo23Video,
  runninghubHailuoH3Video: runninghubHailuoH3Video,
  runninghubVeo3Video: runninghubVeo3Video,
  runninghubWan27Video: runninghubWan27Video,
  apimartKlingV3OmniVideo: apimartKlingV3OmniVideo,
  apimartWan27Video: apimartWan27Video,
  binghuoVideo: binghuoVideo
});
const ENDPOINT_RESOLVERS = Object.freeze({
  apimartGrokImagineImageEndpoint: apimartGrokImagineImageEndpoint,
  customProviderGeminiImageEndpoint: customProviderGeminiImageEndpoint,
  runninghubImageEndpoint: runninghubImageEndpoint,
  runninghubKlingO1VideoEndpoint: runninghubKlingO1VideoEndpoint,
  runninghubHappyHorseVideoEndpoint: runninghubHappyHorseVideoEndpoint,
  runninghubSeedance2VideoEndpoint: runninghubSeedance2VideoEndpoint,
  runninghubKlingV3VideoEndpoint: runninghubKlingV3VideoEndpoint,
  runninghubKlingO3VideoEndpoint: runninghubKlingO3VideoEndpoint,
  runninghubHailuo02VideoEndpoint: runninghubHailuo02VideoEndpoint,
  runninghubHailuo23VideoEndpoint: runninghubHailuo23VideoEndpoint,
  runninghubHailuoH3VideoEndpoint: runninghubHailuoH3VideoEndpoint,
  runninghubVeo3VideoEndpoint: runninghubVeo3VideoEndpoint,
  runninghubWan27VideoEndpoint: runninghubWan27VideoEndpoint,
  runninghubLlmChatEndpoint: runninghubLlmChatEndpoint
});
export function getModelApiBodyResolver(_0x1fcc2a) {
  return BODY_RESOLVERS[String(_0x1fcc2a || "").trim()] || null;
}
export function getModelApiEndpointResolver(_0x4aa7b9) {
  return ENDPOINT_RESOLVERS[String(_0x4aa7b9 || "").trim()] || null;
}