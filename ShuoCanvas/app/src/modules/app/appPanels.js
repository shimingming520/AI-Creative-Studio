import { showManualUpdateCheck, showTutorialVideoPanel } from "../AutoUpdate.js";
import { t } from "../../i18n/index.js";
import { getViewportScreenCenter, screenToWorld } from "../../core/math.js";
export function isSubscriptionAuthorizationClearAvailable(_0x3e70a3 = globalThis.window) {
  const _0xb709d7 = Boolean(_0x3e70a3?.AI_CANVAS_IS_DEV_BUILD || _0x3e70a3?.LOCAL_DEV_BUILD);
  return _0xb709d7 && _0x3e70a3?.DEV_MODE === true;
}
export function resolveSubscriptionStatusMessageKey(_0x34ddee = {}) {
  if (_0x34ddee.loading) {
    return "settings.subscription.loading";
  }
  if (String(_0x34ddee.status || "").toLowerCase() === "active") {
    if (_0x34ddee.authorizationTier === "annual-vip") {
      return "settings.subscription.annualVipAuthorization";
    } else {
      return "settings.subscription.vipAuthorization";
    }
  }
  if (_0x34ddee.status === "expired") {
    return "settings.subscription.expired";
  }
  return "settings.subscription.inactive";
}
const PINNED_TUTORIAL_VIDEO = Object.freeze({
  titleKey: "appPanels.tutorial.usage",
  url: "https://www.bilibili.com/video/BV1RX5z6gEXq/"
});
const PINNED_TUTORIAL_LINK = Object.freeze({
  titleKey: "appPanels.tutorial.apiOnboarding",
  url: "https://i1etb6xynr.feishu.cn/wiki/Q9fdwIl99iqi4LkkKbQcTpvznQ2?from=from_copylink"
});
const TUTORIAL_VIDEO_ENTRIES = Object.freeze([{
  titleKey: "appPanels.tutorial.storyStudio",
  url: "https://www.bilibili.com/video/BV1stKM6mEXT/"
}, {
  titleKey: "appPanels.tutorial.replacementStudioFullTutorial",
  url: "https://www.bilibili.com/video/BV1xouC64Eux/"
}, {
  titleKey: "appPanels.tutorial.fullAudioReferenceVideoGeneration",
  url: "https://www.bilibili.com/video/BV16wMe6EE3m"
}, {
  titleKey: "appPanels.tutorial.rhAiAppComfyUiIntegration",
  url: "https://www.bilibili.com/video/BV1VqT764E7d"
}, {
  titleKey: "appPanels.tutorial.scail2VoiceStudioFilmRemix",
  url: "https://www.bilibili.com/video/BV1nX7n6uEbi/"
}, {
  titleKey: "appPanels.tutorial.browserNode",
  url: "https://www.bilibili.com/video/BV1Q87u6sEpM/"
}, {
  titleKey: "appPanels.tutorial.seedanceLineCamera",
  url: "https://www.bilibili.com/video/BV1ZzjL6UEoA/"
}, {
  titleKey: "appPanels.tutorial.scail2FullReview",
  url: "https://www.bilibili.com/video/BV16DJH6jEmk/"
}, {
  titleKey: "appPanels.tutorial.bernini",
  url: "https://www.bilibili.com/video/BV1TwEb6gEsC"
}, {
  titleKey: "appPanels.tutorial.latest",
  url: "https://www.bilibili.com/video/BV17soQB7EwB"
}, {
  titleKey: "appPanels.tutorial.characterReplacement",
  url: "https://www.bilibili.com/video/BV1YEDKBwEz7"
}, {
  titleKey: "appPanels.tutorial.panorama",
  url: "https://www.bilibili.com/video/BV1FqdyBwEGx"
}]);
function createTutorialVideo(_0x351ce7) {
  return {
    title: t(_0x351ce7.titleKey),
    url: _0x351ce7.url
  };
}
function createTutorialLink(_0x40db36) {
  return {
    title: t(_0x40db36.titleKey),
    url: _0x40db36.url
  };
}
export function createAppPanels({
  store: _0xe409cb,
  setTextWithLineBreaks: _0x1d0f1b,
  getAIGenerationDefaultSizeByType: _0x4c4432,
  createDefaultSubscriptionState: _0x57243f,
  isModelAllowed: _0xbd4276,
  isSubscriptionActive: _0x5c0f04,
  isActivationRequestAccepted: _0x356784,
  normalizeSubscriptionPayload: _0x1f8982,
  ensureInstallId: _0x472280,
  pullSubscriptionState: _0x421ff2,
  submitCdkey: _0xd7bc09,
  clearSubscriptionAuthorization: _0x36dd58,
  DEFAULT_VIP_GATE_MODEL_ID: _0x5aec7,
  ensureDeviceId: _0x122d92,
  modelCatalogService: _0x51b966,
  refreshManifestModelNodeUis: _0x3784c4,
  subscriptionIdentityTimeoutMs = 15000
} = {}) {
  const _0x9231d3 = "https://api.ashuoai.com/static/contact/wechat.png";
  const _0x4b4520 = "yumengashuo";
  const _0x4c71f1 = "https://api.ashuoai.com/static/contact/fankui.jpg";
  function _0x3de3c7(_0x31ff58) {
    const _0x51f542 = String(_0x31ff58 || "").trim();
    if (!_0x51f542) {
      return "";
    }
    if (/^https?:\/\//i.test(_0x51f542)) {
      return _0x51f542;
    }
    if (_0x51f542.startsWith("/")) {
      return _0x51f542;
    }
    return "";
  }
  function _0xdb96a4() {
    return [PINNED_TUTORIAL_VIDEO, ...TUTORIAL_VIDEO_ENTRIES].map(createTutorialVideo);
  }
  function _0x4946c2() {
    return [PINNED_TUTORIAL_LINK].map(createTutorialLink);
  }
  function _0x28feff() {
    const _0x1ad949 = document.getElementById("subStatusText");
    const _0x26f251 = document.getElementById("subExpireText");
    const _0x263322 = document.getElementById("subscriptionCdkeyInput");
    const _0x39f1ba = document.getElementById("btnSubscriptionActivate");
    const _0x527cb2 = document.getElementById("btnSubscriptionClearAuthorization");
    const _0x7cd0bd = document.getElementById("subscriptionContactLink");
    const _0x2cf35e = document.getElementById("subscriptionContactReveal");
    const _0x14b1e3 = document.getElementById("subscriptionContactWechat");
    const _0x4ad902 = [0, 500, 1200, 2500, 4000];
    const _0x20c6c5 = 700;
    const _0x320fc2 = Math.max(1, Number(subscriptionIdentityTimeoutMs) || 15000);
    let _0x4f2c07 = 0;
    let _0x282690 = 0;
    let _0x1d8ce5 = false;
    let _0x51770c = false;
    function _0x408de7(_0x28a1b8 = "") {
      return t("settings.subscription.contact", {}, _0x28a1b8 ? {
        locale: _0x28a1b8
      } : {});
    }
    function _0x47b4b2(_0x66b76b) {
      const _0x1ac44a = String(_0x66b76b || "").trim();
      if (!_0x1ac44a) {
        return true;
      }
      return _0x1ac44a === _0x408de7("zh-CN") || _0x1ac44a === _0x408de7("en-US");
    }
    function _0x9849bf(_0x7e6c9b) {
      const _0x40cbfd = String(_0x7e6c9b || "").trim();
      if (_0x47b4b2(_0x40cbfd)) {
        return _0x408de7();
      } else {
        return _0x40cbfd;
      }
    }
    function _0x57f08c(_0x3bbc58) {
      return String(_0x3bbc58 ?? "").replace(/[&<>"']/g, _0x4c2898 => {
        switch (_0x4c2898) {
          case "&":
            return "&amp;";
          case "<":
            return "&lt;";
          case ">":
            return "&gt;";
          case "\"":
            return "&quot;";
          case "'":
            return "&#39;";
          default:
            return _0x4c2898;
        }
      });
    }
    function _0xba9047(_0x3ff2b8) {
      const _0x4810b0 = Number(_0x3ff2b8);
      if (!Number.isFinite(_0x4810b0) || _0x4810b0 <= 0) {
        return "-";
      }
      try {
        return new Date(_0x4810b0 * 1000).toLocaleString();
      } catch {
        return "-";
      }
    }
    function _0x42b1a4(_0xb3cf24, _0x443238, _0x3e5279 = true) {
      if (!_0xb3cf24) {
        return;
      }
      _0xb3cf24.replaceChildren();
      if (!_0x443238) {
        _0xb3cf24.hidden = true;
        return;
      }
      _0xb3cf24.hidden = !_0x3e5279;
      const _0xd7b989 = document.createElement("span");
      _0xd7b989.className = "settings-contact-label";
      _0xd7b989.textContent = t("settings.subscription.contactInfo.wechatLabel");
      const _0x8cf5f1 = document.createElement("input");
      _0x8cf5f1.type = "text";
      _0x8cf5f1.className = "settings-contact-copy";
      _0x8cf5f1.value = _0x443238;
      _0x8cf5f1.readOnly = true;
      _0x8cf5f1.setAttribute("aria-label", t("settings.subscription.contactInfo.wechatAria"));
      _0x8cf5f1.addEventListener("focus", () => _0x8cf5f1.select());
      _0x8cf5f1.addEventListener("click", () => {
        _0x8cf5f1.focus();
        _0x8cf5f1.select();
      });
      _0xb3cf24.append(_0xd7b989, _0x8cf5f1);
    }
    function _0x4a4145(_0x6c1a45, _0x154470, _0x3c0c5c) {
      if (!_0x6c1a45) {
        return;
      }
      _0x6c1a45.replaceChildren();
      _0x6c1a45.classList.toggle("has-contact-image", !!_0x154470);
      if (!_0x154470) {
        if (_0x3c0c5c) {
          return;
        }
        const _0x3cd855 = document.createElement("span");
        _0x3cd855.className = "settings-contact-fallback";
        _0x3cd855.textContent = t("settings.subscription.contactInfo.qrNotConfigured");
        _0x6c1a45.appendChild(_0x3cd855);
        return;
      }
      const _0x20b897 = document.createElement("img");
      _0x20b897.className = "settings-contact-qr";
      _0x20b897.alt = t("settings.subscription.contactInfo.qrAlt");
      _0x20b897.loading = "lazy";
      _0x20b897.decoding = "async";
      _0x20b897.referrerPolicy = "no-referrer";
      _0x20b897.src = _0x154470;
      _0x20b897.addEventListener("error", () => {
        _0x20b897.hidden = true;
        const _0x4afafe = document.createElement("div");
        _0x4afafe.className = "settings-contact-hint";
        _0x4afafe.textContent = t("settings.subscription.contactInfo.qrLoadFailed");
        _0x6c1a45.appendChild(_0x4afafe);
        _0x6c1a45.classList.add("has-contact-error");
      });
      _0x6c1a45.appendChild(_0x20b897);
    }
    function _0x47d9df(_0x33a412, _0x17fe82, _0x44a60d, _0x259618 = "", _0x59ce48 = "", _0xe8a389 = null) {
      if (!_0x33a412) {
        return;
      }
      _0x33a412.textContent = _0x9849bf(_0x44a60d);
      const _0x1467f6 = _0x3de3c7(_0x259618 || _0x9231d3);
      const _0x5b4f3b = String(_0x59ce48 || _0x4b4520).trim();
      if (_0xe8a389) {
        _0x42b1a4(_0xe8a389, _0x5b4f3b, _0xe8a389.hidden === false);
      }
      _0x4a4145(_0x17fe82, _0x1467f6, !!_0x5b4f3b);
      if (!_0xe8a389 && _0x17fe82 && _0x5b4f3b) {
        const _0x30de6b = document.createElement("div");
        _0x30de6b.className = "settings-contact-wechat";
        _0x17fe82.appendChild(_0x30de6b);
        _0x42b1a4(_0x30de6b, _0x5b4f3b);
      }
    }
    function _0x261c19(_0x20702d, _0x3db822, _0x512164 = null) {
      if (!_0x20702d || !_0x3db822 || _0x20702d.dataset.contactRevealBound === "1") {
        return;
      }
      _0x20702d.dataset.contactRevealBound = "1";
      _0x20702d.addEventListener("click", () => {
        _0x3db822.hidden = false;
        if (_0x512164?.children?.length) {
          _0x512164.hidden = false;
        }
      });
    }
    function _0x4977f1(_0x41183c) {
      const _0x5114e9 = _0x41183c || _0x57243f();
      if (_0x1ad949) {
        _0x1ad949.textContent = t(resolveSubscriptionStatusMessageKey(_0x5114e9));
      }
      if (_0x26f251) {
        _0x26f251.textContent = "" + t("settings.subscription.expirePrefix") + _0xba9047(_0x5114e9.expiresAt);
      }
      if (_0x7cd0bd) {
        _0x47d9df(_0x7cd0bd, _0x2cf35e, _0x5114e9.contactText, _0x5114e9.contactUrl || "", _0x5114e9.contactWechat || _0x4b4520, _0x14b1e3);
      }
    }
    function _0x16574d() {
      if (!_0x527cb2) {
        return;
      }
      _0x527cb2.hidden = !isSubscriptionAuthorizationClearAvailable(window);
    }
    function _0x101f90() {
      return _0xe409cb.getStateRaw().subscription || _0x57243f();
    }
    function _0x108c72(_0x3e1d5b) {
      const _0xb51736 = _0x1f8982(_0x3e1d5b || {});
      if (!_0x5c0f04(_0xb51736)) {
        return false;
      }
      const _0x4f01d4 = _0x101f90();
      _0xe409cb.setSubscriptionState({
        ..._0x4f01d4,
        ..._0xb51736,
        loading: false,
        error: null,
        lastSyncAt: Date.now()
      });
      return true;
    }
    function _0x497ca6() {
      return !!document.getElementById("subscriptionGateOverlay");
    }
    function _0x3e4e64() {
      if (typeof _0x3784c4 !== "function") {
        return;
      }
      const _0xc61b6 = _0x3784c4();
      if (Array.isArray(_0xc61b6?.remountedNodeIds) && _0xc61b6.remountedNodeIds.length > 0) {
        _0xe409cb.invalidateUi?.();
      }
    }
    async function _0xf509ac(_0x18ea92) {
      const _0x1839ed = String(window.__aicDeviceId || globalThis.__aicDeviceId || "").trim();
      const _0x2f4561 = _0x1839ed || (typeof _0x122d92 === "function" ? await _0x122d92(_0x18ea92) : "");
      return {
        installId: String(_0x18ea92 || "").trim(),
        deviceId: String(_0x2f4561 || window.__aicDeviceId || "").trim()
      };
    }
    function _0x1c17da(_0x5624ed) {
      let _0x3bfb2f = null;
      const _0x24541f = new Promise((_0x562611, _0x1d8190) => {
        _0x3bfb2f = setTimeout(() => {
          _0x1d8190(new Error(t("settings.subscription.syncFailed")));
        }, _0x320fc2);
      });
      return Promise.race([Promise.resolve().then(_0x5624ed), _0x24541f]).finally(() => {
        if (_0x3bfb2f != null) {
          clearTimeout(_0x3bfb2f);
        }
      });
    }
    function _0x395120(_0x518969) {
      return _0x51b966?.loadCachedCatalog?.(_0x518969);
    }
    async function _0x1cacc1(_0x5d4826, _0x5de7a5, {
      force = false
    } = {}) {
      const _0x2d5561 = await _0x51b966?.sync?.({
        subscriptionState: _0x5d4826,
        installId: _0x5de7a5?.installId,
        deviceId: _0x5de7a5?.deviceId,
        force: force
      });
      if (_0x2d5561?.status === "updated" || _0x2d5561?.status === "cache-fallback" || _0x2d5561?.status === "unauthorized") {
        _0x3e4e64();
      }
      return _0x2d5561;
    }
    async function _0x17804c(_0x15bde5 = {}) {
      const _0x20c5ab = ++_0x4f2c07;
      const _0x474c94 = _0x15bde5?.loadModelCatalogCache === true;
      const _0x2dd912 = _0x15bde5?.syncModelCatalog === true;
      const _0x5684ac = _0x15bde5?.forceModelCatalog === true;
      const _0x3d83e7 = _0x101f90();
      _0xe409cb.setSubscriptionState({
        ..._0x3d83e7,
        loading: true,
        error: null
      });
      let _0x2633ce = null;
      let _0x106c53 = null;
      try {
        const _0xc509a2 = await _0x1c17da(() => _0x472280());
        if (_0x20c5ab !== _0x4f2c07) {
          return _0x101f90();
        }
        if (!String(_0xc509a2 || "").trim()) {
          _0xe409cb.setSubscriptionState({
            loading: false,
            status: "none",
            expiresAt: null,
            error: t("settings.subscription.missingInstallIdSync"),
            lastSyncAt: Date.now()
          });
          _0x51b966?.clear?.();
          _0x3e4e64();
          return _0x101f90();
        }
        _0x2633ce = await _0x1c17da(() => _0xf509ac(_0xc509a2));
        if (_0x20c5ab !== _0x4f2c07) {
          return _0x101f90();
        }
        _0x106c53 = _0x474c94 ? _0x395120(_0x2633ce) : null;
        if (_0x106c53?.loaded && _0x5c0f04(_0x106c53.authorization)) {
          _0xe409cb.setSubscriptionState({
            ..._0x101f90(),
            ..._0x106c53.authorization,
            loading: true,
            error: null
          });
          _0x3e4e64();
        }
        const _0x20fac0 = _0x101f90();
        const _0x707733 = await _0x421ff2(_0xc509a2, _0x2633ce?.deviceId);
        if (_0x20c5ab !== _0x4f2c07) {
          return _0x101f90();
        }
        _0xe409cb.setSubscriptionState({
          ..._0x707733,
          expiresAt: _0x707733?.expiresAt ?? _0x20fac0?.expiresAt ?? null,
          loading: false,
          error: null,
          lastSyncAt: Date.now()
        });
        if (_0x2dd912) {
          await _0x1cacc1(_0x101f90(), _0x2633ce, {
            force: _0x5684ac
          });
        }
        if (!_0x2dd912 && !_0x5c0f04(_0x101f90())) {
          _0x51b966?.clear?.();
          _0x3e4e64();
        }
        return _0x101f90();
      } catch (_0x2305d9) {
        if (_0x20c5ab !== _0x4f2c07) {
          return _0x101f90();
        }
        const _0x4271cc = _0x474c94 && _0x2633ce ? _0x51b966?.retainCachedCatalogAfterSubscriptionError?.({
          ..._0x2633ce,
          error: _0x2305d9
        }) : null;
        const _0x8b3f44 = _0x4271cc?.authorization || _0x106c53?.authorization || null;
        const _0x2ec221 = _0x4271cc?.status === "cache-fallback" && _0x5c0f04(_0x8b3f44);
        _0xe409cb.setSubscriptionState({
          ..._0x3d83e7,
          ...(_0x2ec221 ? _0x8b3f44 : {}),
          status: _0x2ec221 ? _0x8b3f44.status : "none",
          expiresAt: _0x2ec221 ? _0x8b3f44.expiresAt : null,
          loading: false,
          error: _0x2305d9?.message || t("settings.subscription.syncFailed"),
          lastSyncAt: Date.now()
        });
        if (!_0x2ec221) {
          _0x51b966?.clear?.();
          _0x3e4e64();
        } else {
          _0x3e4e64();
        }
        return _0x101f90();
      }
    }
    async function _0x42adcb(_0x33b241, _0x191618 = {}) {
      const _0x45f37d = typeof _0x191618?.onProgress === "function" ? _0x191618.onProgress : null;
      const _0x19c570 = Array.isArray(_0x191618?.retryScheduleMs) && _0x191618.retryScheduleMs.length > 0 ? _0x191618.retryScheduleMs : _0x4ad902;
      const _0xc4aa07 = String(_0x33b241 || "").trim();
      if (!_0xc4aa07) {
        window.showToast?.(t("settings.subscription.enterCdkey"), "warn");
        return false;
      }
      const _0x4f9aff = await _0x1c17da(() => _0x472280());
      if (!String(_0x4f9aff || "").trim()) {
        window.showToast?.(t("settings.subscription.missingInstallIdActivate"), "error");
        return false;
      }
      const _0x32e8c0 = await _0x1c17da(() => _0xf509ac(_0x4f9aff));
      let _0x4d9c92 = null;
      let _0x454bae = null;
      for (let _0x31f632 = 0; _0x31f632 < 2; _0x31f632 += 1) {
        try {
          _0x4d9c92 = await _0xd7bc09(_0x4f9aff, _0xc4aa07, _0x32e8c0.deviceId);
          _0x454bae = null;
          break;
        } catch (_0x5b252a) {
          _0x454bae = _0x5b252a;
          if (_0x31f632 >= 1) {
            break;
          }
          await new Promise(_0x49fc87 => setTimeout(_0x49fc87, _0x20c6c5));
        }
      }
      if (_0x454bae) {
        throw _0x454bae;
      }
      if (!_0x356784(_0x4d9c92)) {
        const _0x398514 = _0x4d9c92?.message || t("settings.subscription.activationFailed");
        window.showToast?.(_0x398514, "error");
        return false;
      }
      _0x4f2c07 += 1;
      if (_0x108c72(_0x4d9c92)) {
        await _0x1cacc1(_0x101f90(), _0x32e8c0, {
          force: true
        });
        window.showToast?.(t("settings.subscription.activated"));
        return true;
      }
      window.showToast?.(t("settings.subscription.submitted"));
      for (let _0x49cc99 = 0; _0x49cc99 < _0x19c570.length; _0x49cc99 += 1) {
        const _0x52747a = _0x19c570[_0x49cc99];
        _0x45f37d?.({
          phase: "checking",
          attempt: _0x49cc99 + 1,
          total: _0x19c570.length
        });
        if (_0x52747a > 0) {
          await new Promise(_0x2e9414 => setTimeout(_0x2e9414, _0x52747a));
        }
        const _0x478d65 = await _0x17804c({
          syncModelCatalog: true,
          forceModelCatalog: true
        });
        if (_0x5c0f04(_0x478d65)) {
          window.showToast?.(t("settings.subscription.activated"));
          return true;
        }
      }
      const _0x48d5f6 = _0x101f90();
      const _0xa84034 = String(_0x48d5f6.error || _0x4d9c92?.message || "").trim();
      if (_0xa84034) {
        window.showToast?.(t("settings.subscription.serverNotConfirmed") + " (" + _0xa84034 + ")", "warning");
      } else {
        window.showToast?.(t("settings.subscription.serverNotConfirmed"), "warning");
      }
      return false;
    }
    async function _0x35bd54() {
      if (!isSubscriptionAuthorizationClearAvailable(window) || typeof _0x36dd58 !== "function") {
        return false;
      }
      const _0x2992ce = window.confirm?.(t("settings.subscription.clearConfirm"));
      if (_0x2992ce === false) {
        return false;
      }
      const _0x37fb91 = _0x527cb2?.textContent || t("settings.subscription.clearAuthorization");
      if (_0x527cb2) {
        _0x527cb2.disabled = true;
        _0x527cb2.textContent = t("settings.subscription.clearing");
      }
      try {
        await _0x36dd58();
        _0x4f2c07 += 1;
        const _0x1558f4 = _0x101f90();
        const _0x190a97 = _0x57243f();
        _0xe409cb.setSubscriptionState({
          ..._0x190a97,
          contactText: _0x1558f4.contactText || _0x190a97.contactText,
          contactUrl: _0x1558f4.contactUrl || _0x190a97.contactUrl,
          contactWechat: _0x1558f4.contactWechat || _0x190a97.contactWechat,
          loading: false,
          status: "none",
          expiresAt: null,
          entitledModelKeys: [],
          entitledModelIds: [],
          error: null,
          lastSyncAt: Date.now(),
          deviceId: ""
        });
        _0x51b966?.clear?.();
        _0x3e4e64();
        window.showToast?.(t("settings.subscription.clearSuccess"));
        return true;
      } catch (_0x363b27) {
        window.showToast?.(_0x363b27?.message || t("settings.subscription.clearFailed"), "error");
        return false;
      } finally {
        if (_0x527cb2) {
          _0x527cb2.disabled = false;
          _0x527cb2.textContent = _0x37fb91;
        }
      }
    }
    function _0x24f1ac(_0x4cdaf2 = _0x5aec7, _0x1507db = "", _0x866e5f = null) {
      if (_0x497ca6()) {
        return;
      }
      const _0x5ef3db = document.createElement("div");
      _0x5ef3db.id = "subscriptionGateOverlay";
      _0x5ef3db.className = "subscription-gate-overlay";
      const _0x419242 = _0x101f90();
      _0x5ef3db.innerHTML = "\n        <div class=\"subscription-gate-dialog\" role=\"dialog\" aria-modal=\"true\" aria-label=\"" + _0x57f08c(t("settings.subscription.gate.aria")) + "\">\n          <div class=\"subscription-gate-title\">" + _0x57f08c(t("settings.subscription.gate.title")) + "</div>\n          <div class=\"subscription-gate-desc\">" + _0x57f08c(t("settings.subscription.gate.desc")) + "</div>\n          <input type=\"text\" class=\"settings-input\" id=\"gateCdkeyInput\" placeholder=\"" + _0x57f08c(t("settings.subscription.gate.cdkeyPlaceholder")) + "\">\n          <div class=\"settings-subscription-contact\">\n            <button type=\"button\" id=\"gateContactLink\" class=\"settings-getkey settings-contact-trigger\"></button>\n            <div id=\"gateContactReveal\" class=\"settings-contact-reveal\" hidden></div>\n          </div>\n          <div class=\"subscription-gate-actions\">\n            <button type=\"button\" class=\"subscription-gate-btn\" id=\"gateCancelBtn\">" + _0x57f08c(t("settings.subscription.gate.cancel")) + "</button>\n            <button type=\"button\" class=\"subscription-gate-btn is-primary\" id=\"gateSubmitBtn\">" + _0x57f08c(t("settings.subscription.gate.activate")) + "</button>\n          </div>\n        </div>\n      ";
      document.body.appendChild(_0x5ef3db);
      const _0x4dd82b = () => _0x5ef3db.remove();
      _0x5ef3db.addEventListener("click", _0x1f0f23 => {
        if (_0x1f0f23.target === _0x5ef3db) {
          _0x4dd82b();
        }
      });
      _0x5ef3db.querySelector("#gateCancelBtn")?.addEventListener("click", _0x4dd82b);
      _0x47d9df(_0x5ef3db.querySelector("#gateContactLink"), _0x5ef3db.querySelector("#gateContactReveal"), _0x419242.contactText, _0x419242.contactUrl || "", _0x419242.contactWechat || _0x4b4520);
      _0x261c19(_0x5ef3db.querySelector("#gateContactLink"), _0x5ef3db.querySelector("#gateContactReveal"));
      const _0x15e1a9 = _0x5ef3db.querySelector("#gateSubmitBtn");
      const _0x52380e = _0x5ef3db.querySelector("#gateCdkeyInput");
      let _0x8c00ad = false;
      _0x5ef3db.querySelector("#gateSubmitBtn")?.addEventListener("click", async () => {
        if (_0x8c00ad) {
          return;
        }
        _0x8c00ad = true;
        const _0x393185 = _0x15e1a9?.textContent || t("settings.subscription.gate.activate");
        if (_0x15e1a9) {
          _0x15e1a9.disabled = true;
          _0x15e1a9.textContent = t("settings.subscription.checking") + " 1/4";
        }
        if (_0x52380e) {
          _0x52380e.disabled = true;
        }
        let _0x314199 = false;
        try {
          _0x314199 = await _0x42adcb(_0x52380e?.value, {
            onProgress: ({
              attempt: _0x414e24,
              total: _0x13f321
            }) => {
              if (!_0x15e1a9 || !_0x15e1a9.isConnected) {
                return;
              }
              _0x15e1a9.textContent = t("settings.subscription.checking") + " " + _0x414e24 + "/" + _0x13f321;
            },
            retryScheduleMs: _0x4ad902
          });
        } catch (_0x418683) {
          window.showToast?.(_0x418683?.message || t("settings.subscription.gateFailed"), "error");
          _0x314199 = false;
        }
        if (_0x314199) {
          _0x4dd82b();
          if (typeof _0x866e5f === "function") {
            try {
              _0x866e5f();
            } catch {}
          }
          return;
        }
        _0x8c00ad = false;
        if (_0x15e1a9 && _0x15e1a9.isConnected) {
          _0x15e1a9.disabled = false;
          _0x15e1a9.textContent = _0x393185;
        }
        if (_0x52380e && _0x52380e.isConnected) {
          _0x52380e.disabled = false;
          _0x52380e.focus();
        }
      });
    }
    async function _0xcb83b2(_0x3b44c6 = _0x5aec7, _0x43efff = "", _0x37f996 = null) {
      const _0x395796 = _0x101f90();
      const _0x28950a = typeof _0xbd4276 === "function" ? _0xbd4276(_0x3b44c6, _0x395796, _0x43efff) : _0x5c0f04(_0x395796);
      if (_0x28950a) {
        const _0x147b40 = String(_0x37f996?.message || "").trim();
        window.showToast?.(_0x147b40 || t("settings.subscription.activeSyncTip"), "warning");
        try {
          await _0x17804c({
            syncModelCatalog: true,
            forceModelCatalog: true
          });
        } catch {}
        return;
      }
      if (_0x497ca6()) {
        return;
      }
      _0x24f1ac(_0x3b44c6, _0x43efff);
    }
    window.openSubscriptionDialog = ({
      modelId = _0x5aec7,
      provider = "",
      onSuccess = null
    } = {}) => {
      const _0x4f6665 = _0x101f90();
      if (typeof _0xbd4276 === "function" && _0xbd4276(modelId, _0x4f6665, provider)) {
        return;
      }
      if (_0x497ca6()) {
        return;
      }
      _0x24f1ac(modelId, provider, onSuccess);
    };
    window.isModelAllowedBySubscription = (_0x34184b, _0x4a10cf = "") => _0xbd4276(_0x34184b, _0xe409cb.getStateRaw().subscription || {}, _0x4a10cf);
    window.getSubscriptionState = () => _0x101f90();
    window.ensureSubscriptionInstallId = _0x472280;
    window.refreshSubscriptionState = _0x17804c;
    window.handleSubscriptionRequired = ({
      modelId = _0x5aec7,
      provider = "",
      error = null
    } = {}) => _0xcb83b2(modelId, provider, error);
    if (_0x39f1ba) {
      _0x39f1ba.addEventListener("click", async () => {
        if (_0x39f1ba.disabled) {
          return;
        }
        const _0x18cf0e = _0x39f1ba.textContent || "";
        _0x39f1ba.disabled = true;
        _0x39f1ba.textContent = t("settings.subscription.checking");
        if (_0x263322) {
          _0x263322.disabled = true;
        }
        try {
          const _0x5a70f = await _0x42adcb(_0x263322?.value, {
            onProgress: ({
              attempt: _0x36ca48,
              total: _0x439d80
            }) => {
              _0x39f1ba.textContent = t("settings.subscription.checking") + " " + _0x36ca48 + "/" + _0x439d80;
            }
          });
          if (_0x5a70f && _0x263322) {
            _0x263322.value = "";
          }
        } finally {
          _0x39f1ba.disabled = false;
          _0x39f1ba.textContent = _0x18cf0e;
          if (_0x263322) {
            _0x263322.disabled = false;
          }
        }
      });
    }
    if (_0x527cb2) {
      _0x527cb2.addEventListener("click", () => {
        _0x35bd54();
      });
      _0x16574d();
      window.addEventListener?.("aicanvas:runtime-info", _0x16574d);
      window.addEventListener?.("dev-mode-changed", _0x16574d);
    }
    _0x261c19(_0x7cd0bd, _0x2cf35e, _0x14b1e3);
    _0xe409cb.subscribeSelector(_0x37f6db => _0x37f6db.subscription, _0x5eadbf => _0x4977f1(_0x5eadbf));
    const _0x2e29f2 = () => {
      const _0x514a24 = Date.now();
      if (_0x1d8ce5 || _0x514a24 - _0x282690 < 15000) {
        return;
      }
      _0x282690 = _0x514a24;
      _0x1d8ce5 = true;
      _0x17804c({
        syncModelCatalog: true
      }).catch(() => {}).finally(() => {
        _0x1d8ce5 = false;
      });
    };
    window.addEventListener?.("blur", () => {
      _0x51770c = true;
    });
    window.addEventListener?.("focus", () => {
      if (!_0x51770c) {
        return;
      }
      _0x51770c = false;
      _0x282690 = 0;
      _0x2e29f2();
    });
    window.addEventListener?.("online", _0x2e29f2);
    _0x17804c({
      loadModelCatalogCache: true,
      syncModelCatalog: true
    });
  }
  function _0x48755f() {
    const _0x458253 = document.getElementById("aiPanel");
    const _0x18b635 = document.getElementById("aiPanelToggle");
    if (_0x458253 && _0x18b635) {
      const _0x29ea52 = "http://www.w3.org/2000/svg";
      function _0x580755(_0x25d262) {
        _0x18b635.replaceChildren();
        const _0x1837ae = document.createElementNS(_0x29ea52, "svg");
        _0x1837ae.setAttribute("width", "14");
        _0x1837ae.setAttribute("height", "14");
        _0x1837ae.setAttribute("viewBox", "0 0 24 24");
        _0x1837ae.setAttribute("fill", "none");
        _0x1837ae.setAttribute("stroke", "currentColor");
        _0x1837ae.setAttribute("stroke-width", "2");
        const _0x5d7d19 = document.createElementNS(_0x29ea52, "polyline");
        _0x5d7d19.setAttribute("points", _0x25d262 ? "15 18 9 12 15 6" : "9 18 15 12 9 6");
        _0x1837ae.appendChild(_0x5d7d19);
        _0x18b635.appendChild(_0x1837ae);
      }
      _0x18b635.addEventListener("click", () => {
        _0x458253.classList.toggle("collapsed");
        _0x580755(_0x458253.classList.contains("collapsed"));
      });
    }
    const _0x5c85e1 = document.getElementById("aiTipGot");
    const _0x5a0ef8 = document.getElementById("aiTipCard");
    if (_0x5c85e1 && _0x5a0ef8) {
      _0x5c85e1.addEventListener("click", () => {
        _0x5a0ef8.style.opacity = "0";
        _0x5a0ef8.style.maxHeight = "0px";
        setTimeout(() => _0x5a0ef8.remove(), 320);
      });
    }
    const _0x1c9e96 = document.getElementById("aiTextarea");
    if (_0x1c9e96) {
      _0x1c9e96.addEventListener("input", () => {
        _0x1c9e96.style.height = "auto";
        _0x1c9e96.style.height = Math.min(_0x1c9e96.scrollHeight, 120) + "px";
      });
    }
    const _0x1b382e = document.getElementById("aiMessages");
    const _0x791062 = document.getElementById("aiStartBtn");
    const _0xb7aab8 = document.getElementById("aiStartWrap");
    const _0x305499 = document.getElementById("aiSend");
    function _0x19b542() {
      return [t("appPanels.aiAssistant.responses.idea"), t("appPanels.aiAssistant.responses.prompt"), t("appPanels.aiAssistant.responses.connect"), t("appPanels.aiAssistant.responses.optimize")];
    }
    function _0x46d48d(_0x51fddf) {
      if (!_0x1b382e) {
        return;
      }
      const _0x5df2ba = document.createElement("div");
      _0x5df2ba.className = "ai-msg ai";
      const _0x3d2728 = document.createElement("div");
      _0x3d2728.className = "ai-msg-avatar";
      _0x3d2728.textContent = "A";
      const _0x542fd3 = document.createElement("div");
      _0x542fd3.className = "ai-msg-bubble";
      _0x1d0f1b(_0x542fd3, _0x51fddf);
      _0x5df2ba.appendChild(_0x3d2728);
      _0x5df2ba.appendChild(_0x542fd3);
      _0x1b382e.appendChild(_0x5df2ba);
      _0x1b382e.scrollTop = _0x1b382e.scrollHeight;
    }
    function _0x36b5a5(_0x3e802e) {
      if (!_0x1b382e) {
        return;
      }
      const _0x5275d8 = document.createElement("div");
      _0x5275d8.className = "ai-msg user";
      const _0x5efed4 = document.createElement("div");
      _0x5efed4.className = "ai-msg-avatar";
      _0x5efed4.style.background = "var(--indigo)";
      _0x5efed4.textContent = "U";
      const _0x337289 = document.createElement("div");
      _0x337289.className = "ai-msg-bubble";
      _0x1d0f1b(_0x337289, _0x3e802e);
      _0x5275d8.appendChild(_0x5efed4);
      _0x5275d8.appendChild(_0x337289);
      _0x1b382e.appendChild(_0x5275d8);
      _0x1b382e.scrollTop = _0x1b382e.scrollHeight;
    }
    function _0x5915e4() {
      if (!_0x1c9e96) {
        return;
      }
      const _0x29376c = _0x1c9e96.value.trim();
      if (!_0x29376c) {
        return;
      }
      _0x36b5a5(_0x29376c);
      _0x1c9e96.value = "";
      _0x1c9e96.style.height = "auto";
      if (_0xb7aab8) {
        _0xb7aab8.style.display = "none";
      }
      const _0x344e11 = document.createElement("div");
      _0x344e11.className = "ai-msg ai loading";
      const _0x5021bd = document.createElement("div");
      _0x5021bd.className = "ai-msg-avatar";
      _0x5021bd.textContent = "A";
      const _0x4bc373 = document.createElement("div");
      _0x4bc373.className = "ai-msg-bubble";
      for (let _0x59a4f7 = 0; _0x59a4f7 < 3; _0x59a4f7 += 1) {
        const _0x5d4a4c = document.createElement("span");
        _0x5d4a4c.className = "dot";
        _0x4bc373.appendChild(_0x5d4a4c);
      }
      _0x344e11.appendChild(_0x5021bd);
      _0x344e11.appendChild(_0x4bc373);
      _0x1b382e.appendChild(_0x344e11);
      _0x1b382e.scrollTop = _0x1b382e.scrollHeight;
      setTimeout(() => {
        _0x344e11.remove();
        const _0x110aa0 = _0x19b542();
        const _0x2c8aca = _0x110aa0[Math.floor(Math.random() * _0x110aa0.length)];
        _0x46d48d(_0x2c8aca);
      }, 1200);
    }
    if (_0x791062) {
      _0x791062.addEventListener("click", () => {
        if (_0xb7aab8) {
          _0xb7aab8.style.display = "none";
        }
        _0x46d48d(t("appPanels.aiAssistant.greeting"));
        if (_0x1c9e96) {
          _0x1c9e96.focus();
        }
      });
    }
    if (_0x305499) {
      _0x305499.addEventListener("click", _0x5915e4);
    }
    if (_0x1c9e96) {
      _0x1c9e96.addEventListener("keydown", _0xcf8ac0 => {
        if (_0xcf8ac0.key === "Enter" && !_0xcf8ac0.shiftKey) {
          _0xcf8ac0.preventDefault();
          _0x5915e4();
        }
      });
    }
  }
  function _0x57525e() {
    const _0x422e15 = document.getElementById("emptyHint");
    if (!_0x422e15) {
      return;
    }
    function _0x24de9f(_0x3f9bae) {
      if (!window._isAppLoaded) {
        _0x422e15.classList.add("hidden");
        return;
      }
      if (_0x3f9bae === 0) {
        _0x422e15.classList.remove("hidden");
      } else {
        _0x422e15.classList.add("hidden");
      }
    }
    window._checkEmptyHint = () => _0x24de9f(_0xe409cb.getStateRaw()._nodeCount || 0);
    _0xe409cb.subscribeSelector(_0x1808e7 => _0x1808e7._nodeCount || 0, _0x24de9f);
    _0x24de9f(_0xe409cb.getStateRaw()._nodeCount || 0);
    const _0xbe365a = {
      text: "ai-text",
      image: "ai-image",
      video: "ai-video",
      "test-video": "test-video"
    };
    _0x422e15.querySelectorAll(".pill-btn").forEach(_0x284de7 => {
      _0x284de7.addEventListener("click", _0x117d6a => {
        _0x117d6a.stopPropagation();
        const _0x1b9ee8 = _0x284de7.dataset.type;
        const _0x2ff4ec = _0xbe365a[_0x1b9ee8];
        if (!_0x2ff4ec) {
          return;
        }
        const _0x1dfb0e = _0xe409cb.getState().viewport;
        const _0x581a1a = getViewportScreenCenter(_0x1dfb0e, window.innerWidth, window.innerHeight);
        const {
          x: _0x22b565,
          y: _0x378ebe
        } = screenToWorld(_0x581a1a.x, _0x581a1a.y, _0x1dfb0e);
        const _0x1de1fb = "node-" + Date.now() + "-" + Math.random().toString(36).slice(2, 7);
        const _0x4d3574 = typeof _0x4c4432 === "function" ? _0x4c4432(_0x2ff4ec) : {
          width: 300,
          height: 300
        };
        const _0x253dc6 = _0x4d3574.width;
        const _0x260f82 = _0x4d3574.height;
        _0xe409cb.addNode({
          id: _0x1de1fb,
          type: _0x2ff4ec,
          x: _0x22b565 - _0x253dc6 / 2,
          y: _0x378ebe - _0x260f82 / 2,
          width: _0x253dc6,
          height: _0x260f82,
          name: _0x1b9ee8 === "text" ? t("appPanels.emptyHint.textNode") : _0x1b9ee8 === "image" ? t("appPanels.emptyHint.imageNode") : t("appPanels.emptyHint.videoNode"),
          needsAutoResize: _0x2ff4ec === "ai-image" || _0x2ff4ec === "ai-video"
        });
        _0xe409cb.setSelectedNodes([_0x1de1fb]);
      });
    });
  }
  function _0x283d9f() {
    const _0x1cc3c9 = document.getElementById("aboutOverlay");
    const _0x4fdc8b = document.getElementById("aboutClose");
    const _0x23c290 = document.querySelector("meta[name=\"app-version\"]")?.getAttribute("content") || "V0.0.1";
    const _0x307223 = document.getElementById("aboutVersion");
    if (_0x307223) {
      _0x307223.innerText = _0x23c290;
    }
    function _0x47c45f() {
      if (_0x1cc3c9) {
        _0x1cc3c9.style.display = "flex";
      }
    }
    function _0x4ca4f1() {
      if (_0x1cc3c9) {
        _0x1cc3c9.style.display = "none";
      }
    }
    function _0x499621() {
      document.getElementById("avatarMenu")?.classList.remove("open");
    }
    document.getElementById("btnAbout")?.addEventListener("click", _0x3c1443 => {
      _0x3c1443.stopPropagation();
      _0x499621();
      _0x47c45f();
    });
    document.getElementById("btnTutorial")?.addEventListener("click", _0x5069ce => {
      _0x5069ce.stopPropagation();
      _0x499621();
      showTutorialVideoPanel(_0xdb96a4(), _0x4946c2());
    });
    document.getElementById("btnCheckForUpdates")?.addEventListener("click", _0xa3b53c => {
      _0xa3b53c.stopPropagation();
      _0x499621();
      showManualUpdateCheck();
    });
    document.querySelectorAll("#btnGithubOfficial, #btnFeatureFeedback").forEach(_0x42af8e => {
      _0x42af8e.addEventListener("click", () => {
        _0x499621();
      });
    });
    _0x4fdc8b?.addEventListener("click", _0x4ca4f1);
    _0x1cc3c9?.addEventListener("click", _0x467a63 => {
      if (_0x467a63.target === _0x1cc3c9) {
        _0x4ca4f1();
      }
    });
    let _0x2aff76 = 0;
    let _0x47c251 = null;
    _0x307223?.addEventListener("click", () => {
      _0x2aff76++;
      clearTimeout(_0x47c251);
      if (_0x2aff76 >= 7) {
        _0x2aff76 = 0;
        window.DEV_MODE = !window.DEV_MODE;
        document.body.classList.toggle("dev-mode", window.DEV_MODE);
        window.dispatchEvent(new CustomEvent("dev-mode-changed", {
          detail: {
            enabled: window.DEV_MODE
          }
        }));
        _0x4ca4f1();
        window.showToast?.(window.DEV_MODE ? t("appPanels.devMode.entered") : t("appPanels.devMode.exited"));
      } else if (_0x2aff76 >= 4) {
        window.showToast?.(t("appPanels.devMode.clickHint", {
          count: 7 - _0x2aff76,
          action: window.DEV_MODE ? t("appPanels.devMode.exitAction") : t("appPanels.devMode.enterAction")
        }));
      }
      _0x47c251 = setTimeout(() => {
        _0x2aff76 = 0;
      }, 2000);
    });
  }
  function _0x780e02() {
    const _0x566f71 = document.getElementById("feedbackGroupOverlay");
    const _0x5f569b = document.getElementById("btnFeedbackGroup");
    const _0x54782c = document.getElementById("feedbackGroupClose");
    const _0x144c4e = document.getElementById("feedbackGroupQrImage");
    const _0x109e45 = document.getElementById("feedbackGroupQrError");
    function _0x4f593d() {
      document.getElementById("avatarMenu")?.classList.remove("open");
    }
    function _0x460392() {
      return _0x4c71f1;
    }
    function _0xdb2391() {
      _0x4f593d();
      if (!_0x566f71) {
        return;
      }
      if (_0x109e45) {
        _0x109e45.hidden = true;
      }
      if (_0x144c4e) {
        _0x144c4e.hidden = false;
        _0x144c4e.loading = "lazy";
        _0x144c4e.decoding = "async";
        _0x144c4e.referrerPolicy = "no-referrer";
        _0x144c4e.src = _0x460392();
      }
      _0x566f71.hidden = false;
      _0x54782c?.focus?.({
        preventScroll: true
      });
    }
    function _0x180eaf() {
      if (_0x566f71) {
        _0x566f71.hidden = true;
      }
    }
    _0x5f569b?.addEventListener("click", _0x218f78 => {
      _0x218f78.stopPropagation();
      _0xdb2391();
    });
    _0x54782c?.addEventListener("click", _0x180eaf);
    _0x566f71?.addEventListener("click", _0x2a419a => {
      if (_0x2a419a.target === _0x566f71) {
        _0x180eaf();
      }
    });
    _0x144c4e?.addEventListener("error", () => {
      _0x144c4e.hidden = true;
      if (_0x109e45) {
        _0x109e45.hidden = false;
      }
    });
    document.addEventListener("keydown", _0x3383c6 => {
      if (_0x3383c6.key === "Escape" && _0x566f71 && !_0x566f71.hidden) {
        _0x180eaf();
      }
    });
  }
  function _0x5d6fae() {
    // 订阅/CDKEY UI 已移除，保留兼容 API 以确保旧模块不会触发授权弹窗。
    window.isModelAllowedBySubscription = () => true;
    window.openSubscriptionDialog = ({
      onSuccess = null
    } = {}) => {
      if (typeof onSuccess === "function") {
        onSuccess();
      }
    };
    window.handleSubscriptionRequired = () => {};
    window.getSubscriptionState = () => ({
      status: "active",
      authorizationTier: "unlimited"
    });
    window.refreshSubscriptionState = async () => window.getSubscriptionState();
    _0x48755f();
    _0x57525e();
    _0x780e02();
    _0x283d9f();
  }
  return {
    init: _0x5d6fae
  };
}
