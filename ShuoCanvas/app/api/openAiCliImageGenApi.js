import { generateImageWithCliProvider } from "./cliProviderApi.js";
import { localPathToUrl, normalizeLocalPath } from "../src/utils/localMediaPath.js";
function resolveCliProvider(_0x108001 = {}) {
  const _0x1b3225 = String(_0x108001?.extensions?.cliProvider || "").trim().toLowerCase();
  if (!_0x1b3225) {
    throw new Error("OpenAI CLI 图片执行配置缺少 cliProvider");
  }
  return _0x1b3225;
}
function resolveReferenceInputUrls(_0x36fbad = {}) {
  const _0x5aad2b = Array.isArray(_0x36fbad?.inputUrls) ? _0x36fbad.inputUrls : [];
  return Array.from(new Set(_0x5aad2b.map(_0x73ba8d => String(_0x73ba8d || "").trim()).filter(Boolean))).slice(0, 1);
}
export function buildOpenAiCliImageSubmitRequest(_0x475016 = {}, _0x4e9e97 = "", _0x529b39 = {}) {
  const _0xba1f13 = resolveReferenceInputUrls(_0x475016);
  return {
    url: "/api/v2/cli-providers/generate-image",
    headers: {
      "Content-Type": "application/json"
    },
    body: {
      provider: resolveCliProvider(_0x529b39),
      prompt: String(_0x4e9e97 || _0x475016?.prompt || "").trim(),
      ...(_0xba1f13.length > 0 ? {
        inputUrls: _0xba1f13
      } : {})
    }
  };
}
export async function runOpenAiCliImageGeneration(_0x2d5df3 = {}, _0x376b63 = {}) {
  const _0x348000 = String(_0x2d5df3?.prompt || "").trim();
  if (!_0x348000) {
    throw new Error("OpenAI CLI 图像生成需要提示词");
  }
  const _0x5e0acc = resolveReferenceInputUrls(_0x2d5df3);
  const _0x580afc = await generateImageWithCliProvider({
    provider: resolveCliProvider(_0x376b63),
    prompt: _0x348000,
    timeoutMs: _0x2d5df3?.timeoutMs,
    ...(_0x5e0acc.length > 0 ? {
      inputUrls: _0x5e0acc
    } : {})
  });
  const _0x182b53 = Array.isArray(_0x580afc?.images) ? _0x580afc.images : [];
  if (!_0x182b53.length) {
    throw new Error("OpenAI CLI 图像生成完成，但没有可用输出");
  }
  return _0x182b53.map(_0x154716 => {
    const _0x74bfc0 = normalizeLocalPath(_0x154716?.localPath || _0x154716?.imageUrl || _0x154716?.url);
    const _0x4ad04d = localPathToUrl(_0x74bfc0);
    if (!_0x74bfc0 || !_0x4ad04d) {
      throw new Error("OpenAI CLI 返回了不安全的本地图片路径");
    }
    return {
      sourceId: null,
      thumbId: null,
      sourceUrl: _0x4ad04d,
      thumbUrl: _0x4ad04d,
      imageUrl: _0x4ad04d,
      localPath: _0x74bfc0
    };
  });
}