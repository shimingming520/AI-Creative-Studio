import { submitApimartSeedance2PrivateAvatar } from "../../../api/apimartPrivateAvatarApi.js";
import { APIMART_PRIVATE_AVATAR_ASSET_KEY, buildApimartPrivateAvatarPatch, readApimartPrivateAvatarAsset } from "../../modules/apimartPrivateAvatarAssets.js";
import { DEFAULT_APIMART_API_URL } from "../../modules/providers.js";
import { showProviderApiKeyMissingToast } from "../../modules/providerApiKeyMissingToast.js";
import { t } from "../../i18n/index.js";
const ACTION_CLASS = ".act-apimart-face-detect";
function faceDetectText(_0x11cee2, _0x37e56e = {}) {
  return t("nodeToolbar.faceDetect." + _0x11cee2, _0x37e56e);
}
function getNodeId(_0x37f07b = {}) {
  return String(_0x37f07b.nodeId || _0x37f07b.nodeData?.id || "").trim();
}
function getLatestNodeData(_0x1acf85 = {}) {
  const _0x97df07 = getNodeId(_0x1acf85);
  const _0x91aa86 = typeof _0x1acf85.getStateSnapshot === "function" ? _0x1acf85.getStateSnapshot() : {};
  return _0x91aa86?.nodes?.[_0x97df07] || _0x1acf85.getNodeData?.() || _0x1acf85.nodeData || {};
}
function basenameFromUrl(_0x126372) {
  const _0x4a4b0d = String(_0x126372 || "").split(/[?#]/, 1)[0];
  const _0x365ef7 = _0x4a4b0d.split(/[\\/]/).filter(Boolean);
  return _0x365ef7[_0x365ef7.length - 1] || "";
}
function resolveLocalPathUrl(_0x4c2879, _0x50949d) {
  const _0x4dfddf = String(_0x50949d || "").trim();
  if (!_0x4dfddf) {
    return "";
  }
  if (/^(https?:|blob:|data:|asset:\/\/)/i.test(_0x4dfddf)) {
    return _0x4dfddf;
  }
  if (_0x4dfddf.startsWith("/")) {
    return _0x4dfddf;
  }
  return _0x4c2879.localPathToUrl?.(_0x4dfddf) || _0x4dfddf;
}
function resolveImageSourceUrl(_0x19d797, _0x4c3f27 = {}) {
  const _0xbba16c = [_0x19d797.resolveCanvasImagePreviewUrl?.(_0x4c3f27), _0x4c3f27.originalLocalPath, _0x4c3f27.displayLocalPath, _0x4c3f27.localPath, _0x4c3f27.imageUrl, _0x4c3f27.sourceUrl, _0x4c3f27.src, _0x4c3f27.url];
  for (const _0x4b358d of _0xbba16c) {
    const _0x42aaa7 = resolveLocalPathUrl(_0x19d797, _0x4b358d);
    if (_0x42aaa7) {
      return _0x42aaa7;
    }
  }
  return "";
}
function resolveVideoSourceUrl(_0x122d5f, _0x2d43ae = {}) {
  const _0x2fc1ea = _0x122d5f._getCurrentVideoUrl?.();
  if (_0x2fc1ea) {
    return _0x2fc1ea;
  }
  const _0x2a4cbd = Array.isArray(_0x2d43ae.videos) ? _0x2d43ae.videos : [];
  const _0x16fc45 = Number.isFinite(Number(_0x2d43ae.mainVideoIndex)) ? Math.max(0, Math.trunc(Number(_0x2d43ae.mainVideoIndex))) : 0;
  const _0x119e48 = _0x2a4cbd[_0x16fc45] || _0x2a4cbd[0] || {};
  const _0x42c365 = [_0x119e48.originalLocalPath, _0x119e48.displayLocalPath, _0x119e48.localPath, _0x119e48.videoUrl, _0x2d43ae.originalLocalPath, _0x2d43ae.displayLocalPath, _0x2d43ae.localPath, _0x2d43ae.videoLocalPath, _0x2d43ae.videoUrl, _0x2d43ae.sourceUrl, _0x2d43ae.src, _0x2d43ae.url];
  for (const _0x1210d2 of _0x42c365) {
    const _0x4a1208 = resolveLocalPathUrl(_0x122d5f, _0x1210d2);
    if (_0x4a1208) {
      return _0x4a1208;
    }
  }
  return "";
}
function resolveSource(_0x2b759b, _0x4840e8 = {}) {
  const _0x1fe4af = String(_0x2b759b.mediaKind || "").toLowerCase();
  if (_0x1fe4af === "video") {
    const _0x10db75 = resolveVideoSourceUrl(_0x2b759b, _0x4840e8);
    return {
      url: _0x10db75,
      assetType: "Video",
      sourceKind: "video"
    };
  }
  const _0x13761d = resolveImageSourceUrl(_0x2b759b, _0x4840e8);
  return {
    url: _0x13761d,
    assetType: "Image",
    sourceKind: "image"
  };
}
function applyButtonState(_0x97989c, _0x4808a9) {
  const _0x48f7cd = String(_0x4808a9?.status || "").trim().toLowerCase();
  const _0x1deee5 = _0x48f7cd === "processing";
  const _0x537122 = _0x97989c.querySelector?.("svg");
  _0x97989c.classList.toggle("is-provider-asset-pass", _0x48f7cd === "passed");
  _0x97989c.classList.toggle("is-provider-asset-fail", _0x48f7cd === "failed");
  _0x97989c.classList.toggle("is-provider-asset-running", _0x1deee5);
  _0x537122?.classList?.toggle?.("v2-spinning", _0x1deee5);
  _0x97989c.dataset.loading = _0x1deee5 ? "true" : "false";
  _0x97989c.disabled = _0x1deee5;
  _0x97989c.setAttribute("aria-busy", _0x1deee5 ? "true" : "false");
  if (_0x48f7cd === "passed") {
    _0x97989c.dataset.tooltip = faceDetectText("passedTooltip");
  } else if (_0x48f7cd === "failed") {
    _0x97989c.dataset.tooltip = _0x4808a9?.error ? faceDetectText("failedTooltipWithError", {
      error: _0x4808a9.error
    }) : faceDetectText("failedTooltip");
  } else if (_0x48f7cd === "processing") {
    _0x97989c.dataset.tooltip = faceDetectText("processingTooltip");
  } else {
    _0x97989c.dataset.tooltip = faceDetectText("defaultTooltip");
  }
}
function persistAsset(_0x342eba, _0x5b316b, _0x32433d) {
  const _0x5e812a = getNodeId(_0x342eba);
  if (!_0x5e812a) {
    return;
  }
  const _0x42f2c9 = buildApimartPrivateAvatarPatch(_0x5b316b, _0x32433d);
  _0x342eba.store?.updateNodeData?.(_0x5e812a, _0x42f2c9);
  if (_0x5b316b && typeof _0x5b316b === "object") {
    _0x5b316b.providerAssetRefs = _0x42f2c9.providerAssetRefs;
  }
}
export function bindApimartPrivateAvatarAction(_0x4d69d3 = {}) {
  const _0x3212cd = _0x4d69d3.toolbarEl?.querySelector?.(ACTION_CLASS);
  if (!_0x3212cd) {
    return;
  }
  const _0xee82b = getNodeId(_0x4d69d3);
  if (!_0xee82b) {
    return;
  }
  const _0x590522 = () => {
    applyButtonState(_0x3212cd, readApimartPrivateAvatarAsset(getLatestNodeData(_0x4d69d3)));
  };
  _0x590522();
  const _0x3bd671 = typeof _0x4d69d3.store?.subscribeSelector === "function" ? _0x4d69d3.store.subscribeSelector(_0x5d49bc => _0x5d49bc.nodes?.[_0xee82b]?.providerAssetRefs?.[APIMART_PRIVATE_AVATAR_ASSET_KEY], () => _0x590522()) : null;
  _0x3212cd._cleanupApimartPrivateAvatarState?.();
  _0x3212cd._cleanupApimartPrivateAvatarState = () => _0x3bd671?.();
  _0x3212cd.addEventListener("click", async _0x193ab5 => {
    _0x193ab5.preventDefault();
    _0x193ab5.stopPropagation();
    if (_0x3212cd.dataset.loading === "true") {
      return;
    }
    const _0x421f9f = getLatestNodeData(_0x4d69d3);
    const {
      url: _0x21558f,
      assetType: _0x5cb084,
      sourceKind: _0x4144e4
    } = resolveSource(_0x4d69d3, _0x421f9f);
    if (!_0x21558f) {
      persistAsset(_0x4d69d3, _0x421f9f, {
        provider: "apimart",
        capability: "seedance2PrivateAvatar",
        status: "failed",
        error: faceDetectText("missingUrlError")
      });
      window.showToast?.(faceDetectText("missingUrlToast"), "error");
      _0x590522();
      return;
    }
    persistAsset(_0x4d69d3, _0x421f9f, {
      provider: "apimart",
      capability: "seedance2PrivateAvatar",
      status: "processing",
      sourceUrl: _0x21558f,
      sourceKind: _0x4144e4,
      assetType: _0x5cb084,
      checkedAt: new Date().toISOString()
    });
    _0x590522();
    const _0x1cfcd9 = _0x4d69d3.ensureConfig;
    const _0x19aac7 = _0x4d69d3.getProviderConfig;
    try {
      await _0x1cfcd9?.();
      const _0x3fe584 = _0x19aac7?.("apimart") || {};
      const _0x11fbdd = _0x19aac7?.("runninghub") || {};
      const _0x4d9fc4 = String(_0x3fe584.apiKey || "").trim();
      const _0x45ce09 = String(_0x3fe584.apiUrl || DEFAULT_APIMART_API_URL).trim();
      const _0x4e05ab = String(_0x11fbdd.modelApiKey || _0x11fbdd.apiKey || "").trim();
      const _0xa4b5be = String(_0x11fbdd.apiUrl || "").trim();
      if (!_0x4d9fc4) {
        throw new Error(faceDetectText("apiKeyMissing"));
      }
      window.showToast?.(faceDetectText("running"), "info");
      const _0x463214 = await submitApimartSeedance2PrivateAvatar({
        apiKey: _0x4d9fc4,
        apiUrl: _0x45ce09,
        runningHubApiKey: _0x4e05ab,
        runningHubApiUrl: _0xa4b5be,
        url: _0x21558f,
        assetType: _0x5cb084,
        name: basenameFromUrl(_0x21558f) || _0x4144e4 + "-asset"
      });
      persistAsset(_0x4d69d3, getLatestNodeData(_0x4d69d3), {
        provider: "apimart",
        capability: "seedance2PrivateAvatar",
        status: "passed",
        assetUrl: _0x463214.assetUrl,
        sourceUrl: _0x21558f,
        uploadedSourceUrl: _0x463214.sourceUrl || "",
        sourceKind: _0x4144e4,
        assetType: _0x463214.assetType || _0x5cb084,
        taskId: _0x463214.taskId || "",
        checkedAt: new Date().toISOString()
      });
      window.showToast?.(faceDetectText("passedToast"), "success");
    } catch (_0x37e16a) {
      const _0x120e05 = _0x37e16a?.message || faceDetectText("failedFallback");
      persistAsset(_0x4d69d3, getLatestNodeData(_0x4d69d3), {
        provider: "apimart",
        capability: "seedance2PrivateAvatar",
        status: "failed",
        sourceUrl: _0x21558f,
        sourceKind: _0x4144e4,
        assetType: _0x5cb084,
        checkedAt: new Date().toISOString(),
        error: _0x120e05
      });
      if (_0x120e05 === faceDetectText("apiKeyMissing")) {
        showProviderApiKeyMissingToast(_0x120e05, {
          providerId: "apimart",
          type: "error"
        });
      } else {
        window.showToast?.(faceDetectText("failedToastWithError", {
          error: _0x120e05
        }), "error");
      }
    } finally {
      _0x590522();
    }
  });
}