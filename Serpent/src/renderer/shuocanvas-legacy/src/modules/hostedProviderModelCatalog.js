import {
  buildManifestDraftBundle,
  registerManifestBundle,
  unregisterManifestBundle,
} from "../manifests/index.js";

const SOURCE_PREFIX = "yuh-hosted-provider";
let registeredBundle = null;

function text(value, fallback = "") {
  const result = String(value ?? "").trim();
  return result || fallback;
}

function isImageModel(model) {
  const value = model.toLowerCase();
  // “flash” is also used by Gemini text models (for example gemini-3.5-flash).
  // Only classify explicit image/vision variants as image models so ordinary
  // LLMs remain available in the text model menu.
  return /(image|banana|seedream|gemini.*(?:image|vision)|qwen[-_ ]?image|flux|recraft|dall|midjourney|grok[-_ ]?imagine)/i.test(value)
    && !/(video|audio|tts|speech|music)/i.test(value);
}

function isVideoModel(model) {
  return /(video|wan|seedance|kling|veo|hailuo|vidu|sora|ltx|grok[-_ ]?video)/i.test(model.toLowerCase());
}

function isAudioModel(model) {
  return /(audio|tts|speech|music|voice|eleven)/i.test(model.toLowerCase());
}

function normalizeModelId(providerId, model) {
  const raw = text(model);
  if (!raw) return "";
  const prefix = `${providerId}/`;
  return raw.startsWith(prefix) ? raw : `${prefix}${raw}`;
}

function buildDraft({ provider, model, kind, index }) {
  const providerId = text(provider?.id);
  const modelName = text(model);
  const modelId = normalizeModelId(providerId, modelName);
  if (!providerId || !modelName || !modelId) return null;
  const displayName = modelName.includes("/") ? modelName.slice(modelName.lastIndexOf("/") + 1) : modelName;
  const providerName = text(provider?.name, "自定义中转站");
  const customProvider = {
    displayName: providerName,
    badge: text(providerName).slice(0, 2) || "CP",
  };
  const menu = kind === "image"
    ? {
        group: providerId,
        title: displayName,
        subtitle: "来自当前配置的自定义中转站",
        order: index,
        badge: "CP",
        iconKind: "customProviderBadge",
      }
    : kind === "video"
      ? {
        group: providerId,
        label: displayName,
        subtitle: "来自当前配置的自定义中转站",
        order: index,
        role: "customProviderModel",
        badge: "CP",
      }
      : {
        group: providerId,
        title: displayName,
        subtitle: "来自当前配置的自定义中转站",
        order: index,
        badge: "CP",
      };
  const inputSlots = kind === "image"
    ? {
        allowedKinds: ["text", "image"],
        minByKind: { image: 0 },
        maxByKind: { image: 4, video: 0, audio: 0 },
      }
    : kind === "video"
      ? {
        allowedKinds: ["text", "image", "video", "audio"],
        minByKind: { image: 0, video: 0, audio: 0 },
        maxByKind: { image: 4, video: 1, audio: 1 },
      }
      : {
        allowedKinds: ["text"],
        minByKind: {},
        maxByKind: { image: 0, video: 0, audio: 0 },
      };
  return buildManifestDraftBundle({
    sourceId: `${SOURCE_PREFIX}:${providerId}:${kind}:${modelName}`,
    modelId,
    provider: providerId,
    kind,
    adapterType: "modelApi",
    executionId: `${SOURCE_PREFIX}.${providerId}.${kind}.${index}`,
    displayName,
    description: `由 ${providerName} 提供的 ${displayName}`,
    uiSchema: { fields: [] },
    inputSlots,
    outputType: kind,
    prompt: { required: true },
    modelExtensions: {
      customProvider,
      ...(kind === "image"
        ? { imageMenu: menu }
        : kind === "video"
          ? { videoMenu: menu }
          : { textMenu: menu }),
    },
    endpoint:
      kind === "image"
        ? "/v1/images/generations"
        : kind === "video"
          ? "/v1/videos/generations"
          : "/v1/chat/completions",
    model: modelName,
    bodyMapping: [],
    responseMapping:
      kind === "image"
        ? { resultPaths: ["data[].url", "data.url", "images[].url", "url"] }
        : kind === "video"
          ? { resultPaths: ["data[].url", "data.url", "video_url", "url"] }
          : { resultPaths: ["choices[].message.content", "choices[0].message.content", "content", "text"] },
  });
}

/**
 * 将 YUH 设置中启用的自定义中转模型注册到 ShuoCanvas 的动态模型菜单。
 * 菜单仍由原始 ShuoCanvas 组件渲染，故布局、样式和点击行为保持一致。
 */
export async function syncHostedProviderModelCatalog(host) {
  const providerResult = await Promise.resolve(host?.listProviders?.() ?? []).catch(() => []);
  const providers = Array.isArray(providerResult)
    ? providerResult
    : (Array.isArray(providerResult?.providers) ? providerResult.providers : []);
  const customProviders = providers.filter((provider) => {
    const id = text(provider?.id).toLowerCase();
    return id.startsWith("custom-") && provider?.enabled !== false && provider?.hasApiKey;
  });
  const drafts = [];
  for (const provider of customProviders) {
    let result = null;
    // The hosted bridge can come up a moment before the provider cache/API.
    // Retry briefly so startup races cannot produce an empty catalog.
    for (let attempt = 0; attempt < 3 && !result; attempt += 1) {
      result = await Promise.resolve(host?.listModels?.(provider.id) ?? null).catch(() => null);
      const hasModels = Array.isArray(result)
        ? result.length > 0
        : Array.isArray(result?.models) && result.models.length > 0;
      if (hasModels) break;
      result = null;
      await new Promise((resolve) => setTimeout(resolve, 150 * (attempt + 1)));
    }
    const rawModels = Array.isArray(result)
      ? result
      : (Array.isArray(result?.models) ? result.models : []);
    const models = rawModels
      .map((model) => typeof model === "string" ? model : model?.id || model?.name)
      .map(text)
      .filter(Boolean);
    let imageIndex = 0;
    let videoIndex = 0;
    let textIndex = 0;
    for (const model of models) {
      const kind = isVideoModel(model)
        ? "video"
        : isImageModel(model)
          ? "image"
          : isAudioModel(model)
            ? null
            : "text";
      if (!kind) continue;
      const draft = buildDraft({
        provider,
        model,
        kind,
        index:
          kind === "image"
            ? imageIndex++
            : kind === "video"
              ? videoIndex++
              : textIndex++,
      });
      if (draft) drafts.push(draft);
    }
  }
  if (registeredBundle) {
    try { unregisterManifestBundle(registeredBundle); } catch { /* 动态清单清理应保持幂等 */ }
    registeredBundle = null;
  }
  if (!drafts.length) {
    globalThis.__yuhHostedCatalog = { providers: customProviders.map((provider) => provider.id), models: [] };
    return { providers: customProviders.length, models: 0 };
  }
  const executions = [];
  const models = [];
  for (const draft of drafts) {
    executions.push(...draft.executions);
    models.push(...draft.models);
  }
  registeredBundle = {
    sourceId: `${SOURCE_PREFIX}:session`,
    executions,
    models,
  };
  registerManifestBundle(registeredBundle);
  return { providers: customProviders.length, models: models.length };
}
