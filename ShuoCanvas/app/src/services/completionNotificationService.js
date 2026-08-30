import { loadCompletionSoundSettings } from "./completionSoundService.js";
import { desktopBridge } from "./desktopBridge.js";
import { t } from "../i18n/index.js";
import { ensureVideoResultThumbnail } from "../../api/videoResultThumbnailApi.js";
import { normalizeLocalPath } from "../utils/localMediaPath.js";
const IMAGE_FILE_EXTENSION_RE = /\.(?:png|jpe?g|webp|gif|bmp|avif)$/i;
function getNotificationApi() {
  return desktopBridge.notification;
}
function normalizeText(_0x3bfc67) {
  return String(_0x3bfc67 || "").replace(/\s+/g, " ").trim();
}
function normalizeMediaKind(_0x4116d3) {
  const _0x9a0ca0 = normalizeText(_0x4116d3).toLowerCase();
  if (_0x9a0ca0 === "video" || _0x9a0ca0.includes("video")) {
    return "video";
  }
  if (_0x9a0ca0 === "image" || _0x9a0ca0.includes("image")) {
    return "image";
  }
  return "";
}
function getPrimaryMediaItem(_0x50e22b = {}, _0x1721ee = "") {
  const _0x301b1e = _0x1721ee === "video" ? "videos" : "images";
  const _0x1edca8 = _0x1721ee === "video" ? "mainVideoIndex" : "mainImageIndex";
  const _0x5ea686 = Array.isArray(_0x50e22b?.[_0x301b1e]) ? _0x50e22b[_0x301b1e] : [];
  if (_0x5ea686.length === 0) {
    return _0x50e22b;
  }
  const _0x371c88 = Math.max(0, Math.trunc(Number(_0x50e22b?.[_0x1edca8]) || 0));
  const _0x56bb3b = _0x5ea686[_0x371c88] || _0x5ea686.find(_0x1ebb52 => _0x1ebb52 && !_0x1ebb52.error);
  if (_0x56bb3b && typeof _0x56bb3b === "object") {
    return {
      ..._0x50e22b,
      ..._0x56bb3b
    };
  } else {
    return _0x50e22b;
  }
}
function resolveMediaKind(_0x298d35 = {}, _0x9ba71b = {}) {
  const _0x428713 = [_0x298d35?.mediaKind, _0x9ba71b?.outputType, _0x9ba71b?.taskType, _0x9ba71b?.type];
  for (const _0x408cad of _0x428713) {
    const _0x2e4024 = normalizeMediaKind(_0x408cad);
    if (_0x2e4024) {
      return _0x2e4024;
    }
  }
  if (Array.isArray(_0x9ba71b?.videos) || normalizeText(_0x9ba71b?.videoUrl || _0x9ba71b?.outputVideoUrl)) {
    return "video";
  }
  if (Array.isArray(_0x9ba71b?.images) || normalizeText(_0x9ba71b?.imageUrl || _0x9ba71b?.outputUrl)) {
    return "image";
  }
  return "";
}
function resolveImageThumbnailLocalPath(_0x56e10a = {}) {
  const _0xb504c9 = [_0x56e10a?.thumbLocalPath, _0x56e10a?.thumbnailLocalPath, _0x56e10a?.posterLocalPath, _0x56e10a?.displayLocalPath, _0x56e10a?.localPath, _0x56e10a?.originalLocalPath, _0x56e10a?.thumbUrl, _0x56e10a?.thumbnailUrl, _0x56e10a?.posterUrl, _0x56e10a?.imageUrl, _0x56e10a?.sourceUrl, _0x56e10a?.outputUrl];
  for (const _0x4be68d of _0xb504c9) {
    const _0x14a801 = normalizeLocalPath(_0x4be68d);
    if (_0x14a801 && IMAGE_FILE_EXTENSION_RE.test(_0x14a801)) {
      return _0x14a801;
    }
  }
  return "";
}
export async function buildGenerationCompleteNotificationRequest(_0x3d23df = {}, {
  ensureVideoThumbnail = ensureVideoResultThumbnail
} = {}) {
  const _0x1af190 = _0x3d23df?.node && typeof _0x3d23df.node === "object" && !Array.isArray(_0x3d23df.node) ? _0x3d23df.node : {};
  const _0x554985 = normalizeText(_0x3d23df?.nodeName || _0x1af190?.name || _0x1af190?.title);
  const _0x58e687 = resolveMediaKind(_0x3d23df, _0x1af190);
  let _0x4441b4 = getPrimaryMediaItem(_0x1af190, _0x58e687);
  if (_0x58e687 === "video" && typeof ensureVideoThumbnail === "function") {
    try {
      _0x4441b4 = await ensureVideoThumbnail(_0x4441b4);
    } catch {}
  }
  const _0x16a072 = _0x58e687 === "image" || _0x58e687 === "video" ? resolveImageThumbnailLocalPath(_0x4441b4) : "";
  const _0x1beb8b = _0x554985 ? t("coreServices.completion.notificationNodeBody", {
    name: _0x554985
  }) : t("coreServices.completion.notificationBody");
  return {
    title: normalizeText(_0x3d23df?.title) || "SHUO Canvas",
    body: normalizeText(_0x3d23df?.body) || _0x1beb8b,
    ...(_0x16a072 ? {
      thumbnailLocalPath: _0x16a072
    } : {}),
    ...(_0x3d23df?.navigation && typeof _0x3d23df.navigation === "object" ? {
      navigation: {
        ..._0x3d23df.navigation
      }
    } : {})
  };
}
export function subscribeGenerationCompleteNotificationClicks(_0x1ae79b) {
  if (typeof _0x1ae79b !== "function") {
    return () => {};
  }
  return getNotificationApi()?.onGenerationCompleteClick?.(_0x1ae79b) || (() => {});
}
export function showGenerationCompleteNotification(_0x54957d = {}) {
  const _0x30882c = getNotificationApi();
  const _0x4b20ee = _0x30882c?.showGenerationComplete;
  if (_0x30882c?.isAvailable?.() === false || typeof _0x4b20ee !== "function") {
    return Promise.resolve({
      success: true,
      shown: false,
      reason: "unavailable"
    });
  }
  const _0x3a6d85 = (async () => {
    const _0x1ba53f = await loadCompletionSoundSettings();
    if (_0x1ba53f.notificationEnabled === false) {
      return {
        success: true,
        shown: false,
        reason: "disabled"
      };
    }
    const _0x412aac = await buildGenerationCompleteNotificationRequest(_0x54957d);
    return _0x4b20ee(_0x412aac);
  })();
  if (_0x3a6d85 && typeof _0x3a6d85.catch === "function") {
    _0x3a6d85.catch(_0x38216f => {
      console.warn("[completionNotification] show failed:", _0x38216f);
    });
  }
  return _0x3a6d85;
}