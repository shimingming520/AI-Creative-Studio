function normalizeText(_0x393ade, _0x561a1b = "", _0x2b669e = 160) {
  const _0x262362 = String(_0x393ade || _0x561a1b || "").replace(/\s+/g, " ").trim();
  return _0x262362.slice(0, _0x2b669e);
}
const IMAGE_ICON_EXTENSION_RE = /\.(?:png|jpe?g|webp|gif|bmp|avif)$/i;
function normalizeThumbnailLocalPath(_0x4be67b) {
  const _0x495c61 = String(_0x4be67b || "").trim().slice(0, 512);
  const _0x1d536d = _0x495c61.split(/[?#]/, 1)[0];
  if (IMAGE_ICON_EXTENSION_RE.test(_0x1d536d)) {
    return _0x1d536d;
  } else {
    return "";
  }
}
function resolveNotificationIcon(_0x3b676e, _0x39f1d5) {
  if (typeof _0x39f1d5 !== "function") {
    return "";
  }
  const _0x4f8021 = normalizeThumbnailLocalPath(_0x3b676e?.thumbnailLocalPath);
  if (!_0x4f8021) {
    return "";
  }
  try {
    const _0xc0043b = String(_0x39f1d5(_0x4f8021) || "").trim();
    if (IMAGE_ICON_EXTENSION_RE.test(_0xc0043b)) {
      return _0xc0043b;
    } else {
      return "";
    }
  } catch {
    return "";
  }
}
function isWindowFocused(_0x96065f) {
  try {
    return !!_0x96065f && !_0x96065f.isDestroyed?.() && _0x96065f.isFocused?.() === true;
  } catch {
    return false;
  }
}
function normalizeNavigation(_0x41dbb6 = {}) {
  if (!_0x41dbb6 || typeof _0x41dbb6 !== "object" || Array.isArray(_0x41dbb6)) {
    return null;
  }
  const _0x31029f = normalizeText(_0x41dbb6.source, "", 40);
  const _0x26e63d = normalizeText(_0x41dbb6.projectId, "", 120);
  if (!_0x31029f || !_0x26e63d) {
    return null;
  }
  const _0xe53fec = Math.max(1, Math.min(3, Math.trunc(Number(_0x41dbb6.step) || 1)));
  return {
    source: _0x31029f,
    projectId: _0x26e63d,
    step: _0xe53fec,
    outlineSectionId: normalizeText(_0x41dbb6.outlineSectionId, "", 120),
    assetId: normalizeText(_0x41dbb6.assetId, "", 120),
    episodeId: normalizeText(_0x41dbb6.episodeId, "", 120),
    clipId: normalizeText(_0x41dbb6.clipId, "", 120)
  };
}
export function createBackgroundCompletionNotifier({
  Notification: _0x1a125c,
  getMainWindow: _0xc7b472,
  focusMainWindow: _0x35a621,
  onClick: _0x4bd9e2,
  logEvent: _0x2277bf,
  resolveNotificationIconPath: _0x4fa7b7,
  appName = "SHUO Canvas"
} = {}) {
  const _0x29bd48 = [];
  let _0x44f7b9 = 0;
  return {
    showGenerationComplete(_0x3dd971 = {}) {
      const _0x52f548 = typeof _0xc7b472 === "function" ? _0xc7b472() : null;
      if (isWindowFocused(_0x52f548)) {
        return {
          success: true,
          shown: false,
          reason: "window-focused"
        };
      }
      if (typeof _0x1a125c?.isSupported === "function" && !_0x1a125c.isSupported()) {
        return {
          success: true,
          shown: false,
          reason: "unsupported"
        };
      }
      const _0x14b769 = normalizeText(_0x3dd971?.title, appName, 80);
      const _0x47bc58 = normalizeText(_0x3dd971?.body, "生成任务已完成。", 180);
      const _0x392e0d = normalizeNavigation(_0x3dd971?.navigation);
      const _0x15d702 = resolveNotificationIcon(_0x3dd971, _0x4fa7b7);
      try {
        const _0x396fd7 = new _0x1a125c({
          title: _0x14b769,
          body: _0x47bc58,
          silent: true,
          ...(_0x15d702 ? {
            icon: _0x15d702
          } : {})
        });
        _0x396fd7.on?.("failed", (_0x3d1cac, _0x2fc945) => {
          const _0x510df1 = String(_0x2fc945?.message || _0x2fc945 || "Unknown notification error");
          console.warn("[electron] completion notification failed:", _0x510df1);
          _0x2277bf?.({
            type: "notification.generation_complete_failed",
            level: "warn",
            source: "main",
            message: "Generation completion notification failed",
            error: _0x510df1,
            context: {
              title: _0x14b769
            }
          });
        });
        _0x396fd7.on?.("click", () => {
          if (typeof _0x35a621 === "function") {
            _0x35a621();
          }
          if (_0x392e0d) {
            _0x44f7b9 += 1;
            const _0xef9383 = {
              ..._0x392e0d,
              eventId: "completion-" + Date.now() + "-" + _0x44f7b9,
              createdAt: Date.now()
            };
            _0x29bd48.push(_0xef9383);
            while (_0x29bd48.length > 40) {
              _0x29bd48.shift();
            }
            if (typeof _0x4bd9e2 === "function") {
              _0x4bd9e2(_0xef9383);
            }
          }
        });
        _0x396fd7.show?.();
        return {
          success: true,
          shown: true
        };
      } catch (_0x500c31) {
        console.warn("[electron] failed to show completion notification:", _0x500c31);
        _0x2277bf?.({
          type: "notification.generation_complete_failed",
          level: "warn",
          source: "main",
          message: "Generation completion notification failed",
          error: String(_0x500c31?.message || _0x500c31),
          context: {
            title: _0x14b769
          }
        });
        return {
          success: false,
          shown: false,
          error: String(_0x500c31?.message || _0x500c31)
        };
      }
    },
    consumeClickEvents() {
      return _0x29bd48.splice(0, _0x29bd48.length);
    }
  };
}
export const __backgroundCompletionNotificationForTest = {
  isWindowFocused: isWindowFocused,
  normalizeNavigation: normalizeNavigation,
  normalizeThumbnailLocalPath: normalizeThumbnailLocalPath,
  resolveNotificationIcon: resolveNotificationIcon,
  normalizeText: normalizeText
};