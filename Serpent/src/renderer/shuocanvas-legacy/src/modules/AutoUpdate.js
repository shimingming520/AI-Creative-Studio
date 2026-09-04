import { applyUpdateFromServer, checkLocalUpdatePreviewFromServer, checkUpdateFromServer, pingUpdateCheckFromServer } from "../../api/updateApi.js";
import { getLocale, t } from "../i18n/index.js";
import { desktopBridge } from "../services/desktopBridge.js";
import { createLatestStartupVisualTaskQueue, isStartupVisualComplete, waitForStartupVisualComplete } from "../services/startupVisualReadiness.js";
import { AUTO_UPDATE_PRIMARY_ACTIONS, ensureDesktopUpdateAvailable, resolveAutoUpdatePrimaryAction } from "./autoUpdatePolicy.js";
const CHECK_INTERVAL = 3600000;
const _NS = "http://www.w3.org/2000/svg";
let _dismissedSignature = "";
let _activeBannerInfo = null;
let _desktopUpdateInfo = null;
let _desktopUpdateUnsubscribe = null;
let _desktopUpdaterActive = false;
let _desktopInstallAfterDownload = false;
let _desktopBannerRequestSequence = 0;
const _startupBannerQueue = createLatestStartupVisualTaskQueue();
const _startupAutomaticToastQueue = createLatestStartupVisualTaskQueue();
function autoUpdateText(_0x48e1f6, _0x37b728 = {}) {
  return t("autoUpdate." + _0x48e1f6, _0x37b728);
}
function _getUpdateSignature(_0x57b3c5) {
  if (!_0x57b3c5 || typeof _0x57b3c5 !== "object") {
    return "";
  }
  return [_0x57b3c5.previewOnly ? "preview" : "update", _0x57b3c5.localVersion || "", _0x57b3c5.remoteVersion || "", _0x57b3c5.downloadUrl || "", _0x57b3c5.previewVideoUrl || "", _0x57b3c5.notes || ""].join("|");
}
function _removeBanner() {
  _startupBannerQueue.clear();
  const _0xea2e16 = document.getElementById("update-banner");
  const _0x544ed5 = document.getElementById("update-banner-backdrop");
  _0xea2e16?.classList?.remove?.("open");
  _0x544ed5?.classList?.remove?.("open");
  _0xea2e16?.remove?.();
  _0x544ed5?.remove?.();
  _activeBannerInfo = null;
  document.removeEventListener("keydown", _handleBannerKeydown);
}
function _dismissBanner(_0x2be9f8) {
  _removeBanner();
  _dismissedSignature = _getUpdateSignature(_0x2be9f8);
}
function _handleBannerKeydown(_0x5430f0) {
  if (_0x5430f0.key !== "Escape" || !document.getElementById("update-banner")) {
    return;
  }
  _0x5430f0.preventDefault();
  if (typeof _activeBannerInfo?.closeAction === "function") {
    _activeBannerInfo.closeAction(_activeBannerInfo);
    return;
  }
  _removeBanner();
}
function _createSvgIcon(_0x24aaba, _0xd23e71 = {}) {
  const _0x9478 = document.createElementNS(_NS, "svg");
  if (_0xd23e71.spin) {
    _0x9478.classList.add("spin");
  }
  _0x9478.setAttribute("viewBox", "0 0 24 24");
  _0x9478.setAttribute("fill", "none");
  _0x9478.setAttribute("stroke", "currentColor");
  _0x9478.setAttribute("stroke-width", "2.2");
  _0x9478.setAttribute("stroke-linecap", "round");
  _0x9478.setAttribute("stroke-linejoin", "round");
  const _0x3ea0f5 = document.createElementNS(_NS, "path");
  _0x3ea0f5.setAttribute("d", _0x24aaba);
  _0x9478.appendChild(_0x3ea0f5);
  return _0x9478;
}
function _createSpinSvg(_0x57d5a6) {
  const _0x59a7b6 = _createSvgIcon("M21 12a9 9 0 1 1-6.219-8.56", {
    spin: _0x57d5a6
  });
  const _0x48778d = document.createElementNS(_NS, "polyline");
  _0x48778d.setAttribute("points", "16 3 21 3 21 8");
  _0x59a7b6.appendChild(_0x48778d);
  return _0x59a7b6;
}
function _createDownloadSvg() {
  const _0x5f1885 = document.createElementNS(_NS, "svg");
  _0x5f1885.setAttribute("viewBox", "0 0 24 24");
  _0x5f1885.setAttribute("fill", "none");
  _0x5f1885.setAttribute("stroke", "currentColor");
  _0x5f1885.setAttribute("stroke-width", "2.2");
  _0x5f1885.setAttribute("stroke-linecap", "round");
  _0x5f1885.setAttribute("stroke-linejoin", "round");
  ["M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4", "M7 10l5 5 5-5", "M12 15V3"].forEach(_0x313ac0 => {
    const _0x3f11fa = document.createElementNS(_NS, "path");
    _0x3f11fa.setAttribute("d", _0x313ac0);
    _0x5f1885.appendChild(_0x3f11fa);
  });
  return _0x5f1885;
}
function _createUpdateSvg() {
  const _0x41c2e2 = document.createElementNS(_NS, "svg");
  _0x41c2e2.setAttribute("viewBox", "0 0 24 24");
  _0x41c2e2.setAttribute("fill", "none");
  _0x41c2e2.setAttribute("stroke", "currentColor");
  _0x41c2e2.setAttribute("stroke-width", "2.2");
  _0x41c2e2.setAttribute("stroke-linecap", "round");
  _0x41c2e2.setAttribute("stroke-linejoin", "round");
  ["M12 16V4", "M7 9l5-5 5 5", "M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"].forEach(_0x2ee1e5 => {
    const _0x262c5b = document.createElementNS(_NS, "path");
    _0x262c5b.setAttribute("d", _0x2ee1e5);
    _0x41c2e2.appendChild(_0x262c5b);
  });
  return _0x41c2e2;
}
function _setBtnContent(_0x10d465, _0x3c4d08, _0x57ea54) {
  if (!_0x10d465) {
    return;
  }
  _0x10d465.replaceChildren();
  _0x10d465.appendChild(_0x3c4d08 ? _createSpinSvg(true) : _createDownloadSvg());
  _0x10d465.appendChild(document.createTextNode(" " + _0x57ea54));
}
function _formatPercent(_0x567017) {
  const _0x1b31fc = Math.max(0, Math.min(100, Number(_0x567017 || 0)));
  return Math.round(_0x1b31fc) + "%";
}
function _formatBannerVersion(_0x9e9c95) {
  return String(_0x9e9c95 || "").trim().replace(/^[vV](?=\d)/, "");
}
function _formatPubDate(_0x11eba7) {
  if (!_0x11eba7) {
    return "";
  }
  const _0x56acfb = new Date(_0x11eba7);
  if (Number.isNaN(_0x56acfb.getTime())) {
    return String(_0x11eba7);
  }
  return _0x56acfb.toLocaleString(getLocale(), {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  });
}
function _decodeHtmlText(_0x247214) {
  const _0x3307bd = String(_0x247214 || "");
  if (!_0x3307bd) {
    return "";
  }
  const _0x5171e4 = document.createElement("textarea");
  _0x5171e4.innerHTML = _0x3307bd;
  return _0x5171e4.value;
}
function _htmlNotesToText(_0x528d3f) {
  let _0x5e0fa0 = String(_0x528d3f || "").trim();
  if (!/<\/?[a-z][\s\S]*>/i.test(_0x5e0fa0)) {
    return _0x5e0fa0;
  }
  _0x5e0fa0 = _0x5e0fa0.replace(/<br\s*\/?>/gi, "\n").replace(/<\/(?:p|div|h[1-6]|li|ul|ol|section|article|blockquote)>/gi, "\n").replace(/<li[^>]*>/gi, "- ").replace(/<[^>]+>/g, "");
  return _decodeHtmlText(_0x5e0fa0);
}
function _buildNotesText(_0xd05501) {
  const _0x4d0e3a = _htmlNotesToText(_0xd05501).split(/\r?\n/).map(_0x10d2c3 => _0x10d2c3.trim()).filter(Boolean);
  if (!_0x4d0e3a.length) {
    return autoUpdateText("notes.empty");
  }
  return _0x4d0e3a.join("\n");
}
function _cleanNotesHeading(_0x489357) {
  return String(_0x489357 || "").replace(/^[\s#*>\-•]+/, "").replace(/^[🎉✨🐛🔧✅⚠️📌]+\s*/u, "").replace(/[：:]\s*$/, "").trim();
}
function _isVersionTitleLine(_0x5e9acd) {
  return /^(?:🎉\s*)?v?\d+(?:\.\d+){1,3}\s*版本更新/u.test(String(_0x5e9acd || "").trim().toLowerCase());
}
function _isReleaseFooterLine(_0x440c24) {
  const _0x3f1617 = String(_0x440c24 || "").trim();
  if (!_0x3f1617) {
    return false;
  }
  return /^AI-CanvasPro[！!]/u.test(_0x3f1617) || /^注[：:]/u.test(_0x3f1617) || /^BUG问题/u.test(_0x3f1617) || /^https?:\/\//i.test(_0x3f1617) || /反馈文档[：:]/u.test(_0x3f1617);
}
function _isReleaseMetaLine(_0x467c59) {
  return /^\[[a-zA-Z][a-zA-Z0-9_-]*\]\s*:/u.test(String(_0x467c59 || "").trim());
}
function _parseUpdateNotes(_0x31c93a) {
  const _0x2cd525 = _buildNotesText(_0x31c93a).split(/\r?\n/).map(_0x42bcd5 => _0x42bcd5.trim()).filter(Boolean).filter(_0xac02a0 => !_isVersionTitleLine(_0xac02a0)).filter(_0x7977ee => !_isReleaseMetaLine(_0x7977ee));
  const _0xb718d5 = [];
  const _0x11c88b = [];
  const _0x318086 = [];
  let _0x20401c = null;
  let _0x41a021 = false;
  const _0x3ed3d4 = (_0x52ef9e = autoUpdateText("notes.defaultSectionTitle")) => {
    if (!_0x20401c) {
      _0x20401c = {
        title: _0x52ef9e,
        items: [],
        paragraphs: []
      };
      _0x11c88b.push(_0x20401c);
    }
    return _0x20401c;
  };
  _0x2cd525.forEach(_0x5ce4c9 => {
    if (_0x41a021 || _isReleaseFooterLine(_0x5ce4c9)) {
      _0x41a021 = true;
      _0x318086.push(_0x5ce4c9);
      return;
    }
    const _0x54f3bc = /^[-*•]\s+/.test(_0x5ce4c9);
    const _0x26f105 = _0x5ce4c9.replace(/^[-*•]\s+/, "").trim();
    const _0x297754 = _cleanNotesHeading(_0x5ce4c9);
    const _0xe0dd4c = !_0x54f3bc && /[：:]$/.test(_0x5ce4c9) && /新增|修复|优化|更新|说明|注意|已知|内容/u.test(_0x297754);
    if (_0xe0dd4c && _0x297754) {
      _0x20401c = {
        title: _0x297754,
        items: [],
        paragraphs: []
      };
      _0x11c88b.push(_0x20401c);
      return;
    }
    if (!_0x20401c && !_0x54f3bc) {
      _0xb718d5.push(_0x5ce4c9);
      return;
    }
    const _0x228002 = _0x3ed3d4();
    if (_0x54f3bc && _0x26f105) {
      _0x228002.items.push(_0x26f105);
      return;
    }
    _0x228002.paragraphs.push(_0x5ce4c9);
  });
  return {
    intro: _0xb718d5,
    sections: _0x11c88b.length ? _0x11c88b : [{
      title: autoUpdateText("notes.defaultSectionTitle"),
      items: [autoUpdateText("notes.empty")],
      paragraphs: []
    }],
    footer: _0x318086
  };
}
function _appendTextWithLinks(_0x138125, _0x5d8a77) {
  const _0x17c32a = String(_0x5d8a77 || "");
  const _0x29feaa = /(https?:\/\/[^\s]+)/gi;
  let _0x467160 = 0;
  let _0x408e2f = _0x29feaa.exec(_0x17c32a);
  while (_0x408e2f) {
    if (_0x408e2f.index > _0x467160) {
      _0x138125.appendChild(document.createTextNode(_0x17c32a.slice(_0x467160, _0x408e2f.index)));
    }
    const _0x489664 = _0x408e2f[0].replace(/[),.;，。；）]+$/u, "");
    const _0x31404c = _0x408e2f[0].slice(_0x489664.length);
    const _0x52d9c5 = document.createElement("a");
    _0x52d9c5.className = "update-banner-note-link";
    _0x52d9c5.href = _0x489664;
    _0x52d9c5.dataset.externalUrl = _0x489664;
    _0x52d9c5.textContent = _0x489664;
    _0x138125.appendChild(_0x52d9c5);
    if (_0x31404c) {
      _0x138125.appendChild(document.createTextNode(_0x31404c));
    }
    _0x467160 = _0x408e2f.index + _0x408e2f[0].length;
    _0x408e2f = _0x29feaa.exec(_0x17c32a);
  }
  if (_0x467160 < _0x17c32a.length) {
    _0x138125.appendChild(document.createTextNode(_0x17c32a.slice(_0x467160)));
  }
}
function _createNotesPanel(_0x5e2fdd) {
  const _0x59921b = _parseUpdateNotes(_0x5e2fdd);
  const _0x1b040e = document.createElement("div");
  _0x1b040e.className = "update-banner-notes";
  _0x1b040e.id = "update-banner-notes";
  const _0x41ee5c = document.createElement("div");
  _0x41ee5c.className = "update-banner-section-title";
  _0x41ee5c.textContent = autoUpdateText("notes.defaultSectionTitle");
  const _0x3d5bea = document.createElement("div");
  _0x3d5bea.className = "update-banner-notes-scroll";
  if (_0x59921b.intro.length) {
    const _0x4df466 = document.createElement("div");
    _0x4df466.className = "update-banner-note-intro";
    _0x59921b.intro.forEach(_0x244ed4 => {
      const _0x5daf7e = document.createElement("p");
      _0x5daf7e.className = "update-banner-note-paragraph";
      _appendTextWithLinks(_0x5daf7e, _0x244ed4);
      _0x4df466.appendChild(_0x5daf7e);
    });
    _0x3d5bea.appendChild(_0x4df466);
  }
  _0x59921b.sections.forEach(_0x5abd2d => {
    const _0x3a8660 = document.createElement("section");
    _0x3a8660.className = "update-banner-note-section";
    const _0x4f5fda = document.createElement("div");
    _0x4f5fda.className = "update-banner-note-heading";
    _0x4f5fda.textContent = _0x5abd2d.title;
    _0x3a8660.appendChild(_0x4f5fda);
    _0x5abd2d.paragraphs.forEach(_0x15c0f3 => {
      const _0x5d2060 = document.createElement("p");
      _0x5d2060.className = "update-banner-note-paragraph";
      _appendTextWithLinks(_0x5d2060, _0x15c0f3);
      _0x3a8660.appendChild(_0x5d2060);
    });
    if (_0x5abd2d.items.length) {
      const _0x233639 = document.createElement("ul");
      _0x233639.className = "update-banner-note-list";
      _0x5abd2d.items.forEach(_0x2c3dfb => {
        const _0x13bf7f = document.createElement("li");
        _appendTextWithLinks(_0x13bf7f, _0x2c3dfb);
        _0x233639.appendChild(_0x13bf7f);
      });
      _0x3a8660.appendChild(_0x233639);
    }
    _0x3d5bea.appendChild(_0x3a8660);
  });
  if (_0x59921b.footer.length) {
    const _0xdad513 = document.createElement("section");
    _0xdad513.className = "update-banner-note-footer";
    const _0x90ea3d = document.createElement("div");
    _0x90ea3d.className = "update-banner-note-footer-title";
    _0x90ea3d.textContent = autoUpdateText("notes.releaseFooterTitle");
    _0xdad513.appendChild(_0x90ea3d);
    _0x59921b.footer.forEach(_0x5f0694 => {
      const _0x33f9ff = document.createElement("p");
      _0x33f9ff.className = "update-banner-note-paragraph";
      _appendTextWithLinks(_0x33f9ff, _0x5f0694);
      _0xdad513.appendChild(_0x33f9ff);
    });
    _0x3d5bea.appendChild(_0xdad513);
  }
  _0x1b040e.appendChild(_0x41ee5c);
  _0x1b040e.appendChild(_0x3d5bea);
  return _0x1b040e;
}
function _normalizeHttpUrl(_0x42bfe3) {
  const _0x47a2b0 = String(_0x42bfe3 || "").trim();
  if (!_0x47a2b0) {
    return "";
  }
  const _0x4d2c19 = _0x47a2b0.startsWith("//") ? "https:" + _0x47a2b0 : _0x47a2b0;
  if (!/^https?:\/\//i.test(_0x4d2c19)) {
    return "";
  }
  try {
    const _0x231fd2 = new URL(_0x4d2c19);
    if (_0x231fd2.protocol !== "http:" && _0x231fd2.protocol !== "https:") {
      return "";
    }
    return _0x231fd2.toString();
  } catch (_0x418278) {
    return "";
  }
}
function _isDirectVideoUrl(_0x227b31) {
  try {
    return /\.(mp4|webm|ogg|m4v|mov)$/i.test(new URL(_0x227b31).pathname);
  } catch (_0x3271d8) {
    return false;
  }
}
function _isBilibiliHost(_0x4ec522) {
  const _0x3df9ec = String(_0x4ec522 || "").toLowerCase();
  return _0x3df9ec === "bilibili.com" || _0x3df9ec.endsWith(".bilibili.com");
}
function _buildBilibiliPlayerUrl(_0x514152) {
  try {
    const _0x51f9e7 = new URL(_0x514152);
    if (!_isBilibiliHost(_0x51f9e7.hostname)) {
      return "";
    }
    if (_0x51f9e7.hostname.toLowerCase() === "player.bilibili.com") {
      _0x51f9e7.searchParams.set("autoplay", "0");
      return _0x51f9e7.toString();
    }
    const _0x1c403d = _0x51f9e7.pathname.match(/\/video\/(BV[a-zA-Z0-9]+)/);
    const _0x48aeb6 = _0x51f9e7.pathname.match(/\/video\/av(\d+)/i);
    if (!_0x1c403d && !_0x48aeb6) {
      return "";
    }
    const _0x226e68 = new URL("https://player.bilibili.com/player.html");
    if (_0x1c403d) {
      _0x226e68.searchParams.set("bvid", _0x1c403d[1]);
    } else {
      _0x226e68.searchParams.set("aid", _0x48aeb6[1]);
    }
    _0x226e68.searchParams.set("page", _0x51f9e7.searchParams.get("p") || "1");
    _0x226e68.searchParams.set("autoplay", "0");
    return _0x226e68.toString();
  } catch (_0x467a8f) {
    return "";
  }
}
function _createPreviewVideo(_0x2f7b24) {
  const _0x1b6537 = _normalizeHttpUrl(_0x2f7b24?.previewVideoUrl || _0x2f7b24?.preview_video_url);
  if (!_0x1b6537) {
    return null;
  }
  const _0x1bc66a = document.createElement("div");
  _0x1bc66a.className = "update-banner-video-wrap";
  const _0x38f64b = document.createElement("div");
  _0x38f64b.className = "update-banner-video-shell";
  if (_isDirectVideoUrl(_0x1b6537)) {
    const _0x1334f0 = document.createElement("video");
    _0x1334f0.className = "update-banner-video";
    _0x1334f0.controls = true;
    _0x1334f0.playsInline = true;
    _0x1334f0.preload = "metadata";
    _0x1334f0.src = _0x1b6537;
    _0x38f64b.appendChild(_0x1334f0);
    _0x1bc66a.appendChild(_0x38f64b);
    return _0x1bc66a;
  }
  const _0x13072e = document.createElement("iframe");
  _0x13072e.className = "update-banner-video-frame";
  _0x13072e.src = _buildBilibiliPlayerUrl(_0x1b6537) || _0x1b6537;
  _0x13072e.loading = "lazy";
  _0x13072e.allow = "autoplay; fullscreen; picture-in-picture";
  _0x13072e.allowFullscreen = true;
  _0x13072e.referrerPolicy = "no-referrer-when-downgrade";
  _0x38f64b.appendChild(_0x13072e);
  _0x1bc66a.appendChild(_0x38f64b);
  return _0x1bc66a;
}
function _createTutorialVideoList(_0x5a89a7) {
  const _0x33ca2a = Array.isArray(_0x5a89a7) ? _0x5a89a7 : [];
  const _0xde0781 = _0x33ca2a.map(_0x3fd9d3 => ({
    title: String(_0x3fd9d3?.title || "").trim(),
    url: String(_0x3fd9d3?.url || "").trim()
  })).filter(_0x4d29ab => _0x4d29ab.title && _normalizeHttpUrl(_0x4d29ab.url));
  if (!_0xde0781.length) {
    return null;
  }
  const _0x4721fa = document.createElement("div");
  _0x4721fa.className = "update-banner-video-list";
  _0xde0781.forEach(_0x45d565 => {
    const _0x507245 = document.createElement("section");
    _0x507245.className = "update-banner-video-item";
    const _0x40c990 = document.createElement("div");
    _0x40c990.className = "update-banner-video-item-title";
    _0x40c990.textContent = _0x45d565.title;
    const _0x3647eb = _createPreviewVideo({
      previewVideoUrl: _0x45d565.url
    });
    _0x507245.appendChild(_0x40c990);
    if (_0x3647eb) {
      _0x507245.appendChild(_0x3647eb);
    }
    _0x4721fa.appendChild(_0x507245);
  });
  return _0x4721fa;
}
function _createTutorialLinkList(_0xb4d0e1) {
  const _0x50d9b4 = Array.isArray(_0xb4d0e1) ? _0xb4d0e1 : [];
  const _0x42ff18 = _0x50d9b4.map(_0x522be1 => ({
    title: String(_0x522be1?.title || "").trim(),
    url: _normalizeHttpUrl(_0x522be1?.url)
  })).filter(_0xa57285 => _0xa57285.title && _0xa57285.url);
  if (!_0x42ff18.length) {
    return null;
  }
  const _0x3c0b36 = document.createElement("div");
  _0x3c0b36.className = "update-banner-tutorial-links";
  _0x42ff18.forEach(_0x223680 => {
    const _0x5c7eb5 = document.createElement("div");
    _0x5c7eb5.className = "update-banner-tutorial-link";
    const _0x23032b = document.createElement("span");
    _0x23032b.className = "update-banner-tutorial-link-label";
    _0x23032b.textContent = autoUpdateText("tutorial.linkLabel", {
      title: _0x223680.title
    });
    const _0x3b877d = document.createElement("a");
    _0x3b877d.className = "update-banner-note-link";
    _0x3b877d.href = _0x223680.url;
    _0x3b877d.dataset.externalUrl = _0x223680.url;
    _0x3b877d.textContent = _0x223680.url;
    _0x5c7eb5.appendChild(_0x23032b);
    _0x5c7eb5.appendChild(_0x3b877d);
    _0x3c0b36.appendChild(_0x5c7eb5);
  });
  return _0x3c0b36;
}
function _isDesktopProgramUpdateAvailable(_0x49ed81 = {}) {
  return _0x49ed81.desktopUpdaterUnavailable !== true && desktopBridge.app.isAvailable();
}
function _setProgramUpdateFallback(_0x509775, _0x5eb8bb) {
  const _0x279514 = document.getElementById("update-banner-btn");
  const _0x340629 = document.getElementById("update-banner-sub");
  if (_0x340629 && _0x5eb8bb) {
    _0x340629.hidden = false;
    _0x340629.textContent = _0x5eb8bb;
    _0x340629.classList.add("is-error");
  }
  _0x279514?.classList?.remove?.("is-download");
  if (!_0x279514) {
    return;
  }
  const _0x50a049 = _isDesktopProgramUpdateAvailable(_0x509775);
  _setBtnContent(_0x279514, false, _0x50a049 ? autoUpdateText("buttons.downloadInstall") : autoUpdateText("buttons.programUpdateUnavailable"));
  _0x279514.disabled = !_0x50a049;
  _0x279514.onclick = _0x50a049 ? () => _downloadDesktopUpdate(_0x279514, {
    ensureAvailable: true
  }) : null;
}
function _setUpdateProgress(_0x2c534b, _0xcd336b = "") {
  const _0x1a987c = document.getElementById("update-banner-progress");
  const _0x2f97ca = document.getElementById("update-banner-progress-bar");
  const _0x3335de = document.getElementById("update-banner-progress-text");
  if (!_0x1a987c || !_0x2f97ca || !_0x3335de) {
    return;
  }
  const _0x472761 = _formatPercent(_0x2c534b);
  _0x1a987c.hidden = false;
  _0x2f97ca.style.width = _0x472761;
  _0x3335de.textContent = _0xcd336b || autoUpdateText("progress.downloading", {
    percent: _0x472761
  });
}
function _setDesktopDownloadInPlace(_0x3396c8 = {}, {
  retrying = false
} = {}) {
  const _0x7d9aeb = document.getElementById("update-banner");
  if (!_0x7d9aeb) {
    return false;
  }
  const _0x275971 = document.getElementById("update-banner-sub");
  const _0x449837 = document.getElementById("update-banner-btn");
  const _0x533e06 = document.getElementById("update-banner-close");
  const _0x223a6b = document.getElementById("update-banner-cancel");
  const _0xd72913 = Number(_0x3396c8.retryCount || 0);
  const _0x33a5d4 = retrying ? autoUpdateText("progress.retrying", {
    count: _0xd72913
  }) : autoUpdateText("progress.downloading", {
    percent: "0%"
  });
  if (_0x275971) {
    _0x275971.hidden = false;
    _0x275971.classList.remove("is-error");
    _0x275971.textContent = retrying ? autoUpdateText("status.autoRetry") : autoUpdateText("status.downloadingAutoInstall");
  }
  _setUpdateProgress(0, _0x33a5d4);
  _setBtnContent(_0x449837, true, retrying ? autoUpdateText("buttons.retrying") : autoUpdateText("buttons.downloading"));
  if (_0x449837) {
    _0x449837.disabled = true;
  }
  if (_0x223a6b) {
    _0x223a6b.onclick = _cancelDesktopUpdateDownload;
  }
  if (_0x533e06) {
    _0x533e06.disabled = false;
    _0x533e06.onclick = _cancelDesktopUpdateDownload;
  }
  _activeBannerInfo = {
    ...(_activeBannerInfo || {}),
    closeAction: _cancelDesktopUpdateDownload
  };
  return true;
}
function _showBanner(_0x1f0699, _0x47a995 = {}) {
  if (_startupBannerQueue.defer(() => _showBanner(_0x1f0699, _0x47a995))) {
    return;
  }
  if (_0x47a995.replace) {
    _removeBanner();
  }
  if (!_0x47a995.ignoreDismissed && _dismissedSignature === _getUpdateSignature(_0x1f0699)) {
    return;
  }
  if (document.getElementById("update-banner")) {
    return;
  }
  const _0xdc324d = _0x1f0699.hasUpdate !== false;
  const _0x5ce968 = _formatBannerVersion(_0x1f0699.remoteVersion || autoUpdateText("versions.newVersion"));
  const _0x5746a3 = _formatBannerVersion(_0x1f0699.localVersion || autoUpdateText("versions.currentVersion"));
  const _0x5e98e1 = _formatPubDate(_0x1f0699.pubDate);
  const _0x5a3c2c = Boolean(_0x1f0699.previewOnly);
  const _0x287435 = document.createElement("div");
  _0x287435.id = "update-banner";
  _0x287435.className = "update-banner";
  const _0x422dd6 = document.createElement("div");
  _0x422dd6.id = "update-banner-backdrop";
  _0x422dd6.className = "update-banner-backdrop";
  _0x422dd6.setAttribute("aria-hidden", "true");
  const _0x5b65d8 = document.createElement("div");
  _0x5b65d8.className = "update-banner-header";
  const _0x2a5275 = document.createElement("span");
  _0x2a5275.className = "update-banner-icon";
  _0x2a5275.setAttribute("aria-hidden", "true");
  _0x2a5275.appendChild(_createUpdateSvg());
  const _0x48da48 = document.createElement("div");
  _0x48da48.className = "update-banner-header-title";
  if (_0x1f0699.titleText) {
    _0x48da48.textContent = _0x1f0699.titleText;
  } else {
    const _0x55b6f8 = document.createElement("span");
    _0x55b6f8.textContent = autoUpdateText("banner.versionUpdateTitle", {
      version: _0x5ce968
    });
    _0x48da48.appendChild(_0x55b6f8);
    if (_0x5746a3) {
      const _0xd56a14 = document.createElement("span");
      _0xd56a14.className = "update-banner-header-current";
      _0xd56a14.textContent = autoUpdateText("banner.currentVersionSuffix", {
        version: _0x5746a3
      });
      _0x48da48.appendChild(_0xd56a14);
    }
  }
  const _0x138cd8 = document.createElement("button");
  _0x138cd8.type = "button";
  _0x138cd8.className = "update-banner-close";
  _0x138cd8.id = "update-banner-close";
  _0x138cd8.setAttribute("aria-label", autoUpdateText("banner.closeAria"));
  _0x138cd8.title = autoUpdateText("buttons.close");
  _0x138cd8.textContent = "×";
  _0x5b65d8.appendChild(_0x2a5275);
  _0x5b65d8.appendChild(_0x48da48);
  _0x5b65d8.appendChild(_0x138cd8);
  const _0x25ad0b = document.createElement("div");
  _0x25ad0b.className = "update-banner-text";
  const _0x5d7f5f = document.createElement("div");
  _0x5d7f5f.className = "update-banner-sub";
  _0x5d7f5f.id = "update-banner-sub";
  const _0x34fd1a = _0x5a3c2c ? "" : _0x5e98e1 ? autoUpdateText("banner.subtitleWithDate", {
    localVersion: _0x5746a3,
    pubDate: _0x5e98e1
  }) : _0xdc324d ? "" : autoUpdateText("banner.subtitleNoUpdate", {
    localVersion: _0x5746a3,
    remoteVersion: _0x5ce968
  });
  const _0x21851d = _0x1f0699.subtitleText || _0x34fd1a;
  _0x5d7f5f.textContent = _0x21851d;
  _0x5d7f5f.hidden = !_0x21851d;
  const _0x448b6c = document.createElement("div");
  _0x448b6c.className = "update-banner-progress";
  _0x448b6c.id = "update-banner-progress";
  _0x448b6c.hidden = !_0x1f0699.showProgress;
  const _0x1f509f = document.createElement("div");
  _0x1f509f.className = "update-banner-progress-track";
  const _0x8bc0f8 = document.createElement("div");
  _0x8bc0f8.className = "update-banner-progress-bar";
  _0x8bc0f8.id = "update-banner-progress-bar";
  _0x8bc0f8.style.width = _formatPercent(_0x1f0699.progressPercent);
  const _0x179e2e = document.createElement("div");
  _0x179e2e.className = "update-banner-progress-text";
  _0x179e2e.id = "update-banner-progress-text";
  _0x179e2e.textContent = _0x1f0699.progressText || autoUpdateText("progress.downloading", {
    percent: _formatPercent(_0x1f0699.progressPercent)
  });
  _0x1f509f.appendChild(_0x8bc0f8);
  _0x448b6c.appendChild(_0x1f509f);
  _0x448b6c.appendChild(_0x179e2e);
  const _0x19ef7d = _createNotesPanel(_0x1f0699.notes);
  const _0x109048 = _createPreviewVideo(_0x1f0699);
  const _0x5e5af6 = _createTutorialLinkList(_0x1f0699.tutorialLinks);
  const _0x51bf21 = _createTutorialVideoList(_0x1f0699.tutorialVideos);
  if (_0x5e5af6) {
    _0x25ad0b.appendChild(_0x5e5af6);
  }
  if (!_0x1f0699.hideSubtitle) {
    _0x25ad0b.appendChild(_0x5d7f5f);
  }
  _0x25ad0b.appendChild(_0x448b6c);
  if (_0x109048) {
    _0x25ad0b.appendChild(_0x109048);
  }
  if (_0x51bf21) {
    _0x25ad0b.appendChild(_0x51bf21);
  }
  if (!_0x1f0699.hideNotes) {
    _0x25ad0b.appendChild(_0x19ef7d);
  }
  const _0x5cad6b = document.createElement("div");
  _0x5cad6b.className = "update-banner-actions";
  if ((_0xdc324d || _0x5a3c2c) && !_0x1f0699.hideCancelButton) {
    const _0x1cb9a0 = document.createElement("button");
    _0x1cb9a0.type = "button";
    _0x1cb9a0.className = "update-banner-btn update-banner-btn-secondary";
    _0x1cb9a0.id = "update-banner-cancel";
    _0x1cb9a0.textContent = _0x1f0699.cancelText || (_0x5a3c2c ? autoUpdateText("buttons.close") : autoUpdateText("buttons.cancel"));
    _0x1cb9a0.onclick = () => {
      if (typeof _0x1f0699.cancelAction === "function") {
        _0x1f0699.cancelAction(_0x1f0699);
        return;
      }
      _removeBanner();
    };
    _0x5cad6b.appendChild(_0x1cb9a0);
  }
  if (!_0x5a3c2c && _0xdc324d && !_0x1f0699.disableSkip) {
    const _0x4d787a = document.createElement("button");
    _0x4d787a.type = "button";
    _0x4d787a.className = "update-banner-btn update-banner-btn-secondary";
    _0x4d787a.textContent = autoUpdateText("buttons.skipVersion");
    _0x4d787a.onclick = () => _dismissBanner(_0x1f0699);
    _0x5cad6b.appendChild(_0x4d787a);
  }
  const _0x507a2f = document.createElement("button");
  _0x507a2f.type = "button";
  _0x507a2f.className = "update-banner-btn";
  _0x507a2f.id = "update-banner-btn";
  const _0x3143b6 = resolveAutoUpdatePrimaryAction(_0x1f0699, {
    desktopUpdaterAvailable: _isDesktopProgramUpdateAvailable(_0x1f0699)
  });
  if (_0x5a3c2c) {
    _0x507a2f.classList.add("is-primary");
    _setBtnContent(_0x507a2f, false, _0x1f0699.previewCloseText || autoUpdateText("buttons.gotIt"));
    _0x507a2f.onclick = () => _removeBanner();
  } else if (_0x3143b6 === AUTO_UPDATE_PRIMARY_ACTIONS.INSTALL_DESKTOP) {
    _0x507a2f.classList.add("is-primary");
    _setBtnContent(_0x507a2f, false, autoUpdateText("buttons.restartInstall"));
    _0x507a2f.onclick = () => _installDownloadedDesktopUpdate(_0x507a2f);
  } else if (_0x3143b6 === AUTO_UPDATE_PRIMARY_ACTIONS.RETRY_DESKTOP) {
    _0x507a2f.classList.add("is-primary");
    _setBtnContent(_0x507a2f, false, autoUpdateText("buttons.retryDownloadInstall"));
    _0x507a2f.onclick = () => _downloadDesktopUpdate(_0x507a2f);
  } else if (_0x3143b6 === AUTO_UPDATE_PRIMARY_ACTIONS.DOWNLOAD_DESKTOP) {
    _0x507a2f.classList.add("is-primary");
    _setBtnContent(_0x507a2f, false, autoUpdateText("buttons.downloadInstall"));
    _0x507a2f.onclick = () => _downloadDesktopUpdate(_0x507a2f, {
      ensureAvailable: !_0x1f0699.startDesktopDownload
    });
  } else if (_0x3143b6 === AUTO_UPDATE_PRIMARY_ACTIONS.HOT_APPLY) {
    _0x507a2f.classList.add("is-primary");
    _setBtnContent(_0x507a2f, false, autoUpdateText("buttons.updateNow"));
    _0x507a2f.onclick = () => _doApply(_0x1f0699);
  } else if (_0x3143b6 === AUTO_UPDATE_PRIMARY_ACTIONS.CLOSE) {
    _0x507a2f.classList.add("is-primary");
    _setBtnContent(_0x507a2f, false, autoUpdateText("buttons.gotIt"));
    _0x507a2f.onclick = () => _removeBanner();
  } else {
    _setBtnContent(_0x507a2f, false, autoUpdateText("buttons.programUpdateUnavailable"));
    _0x507a2f.disabled = true;
  }
  _0x5cad6b.appendChild(_0x507a2f);
  _0x287435.appendChild(_0x5b65d8);
  _0x287435.appendChild(_0x25ad0b);
  _0x287435.appendChild(_0x5cad6b);
  document.body.appendChild(_0x422dd6);
  document.body.appendChild(_0x287435);
  _0x422dd6.classList.add("open");
  _0x287435.classList.add("open");
  _activeBannerInfo = _0x1f0699;
  document.addEventListener("keydown", _handleBannerKeydown);
  _0x138cd8.onclick = () => {
    if (typeof _0x1f0699.closeAction === "function") {
      _0x1f0699.closeAction(_0x1f0699);
      return;
    }
    _removeBanner();
  };
}
async function _cancelDesktopUpdateDownload() {
  const _0x26e092 = desktopBridge.app;
  _desktopInstallAfterDownload = false;
  _removeBanner();
  if (!_0x26e092.isAvailable()) {
    return;
  }
  try {
    const _0x5c3405 = await _0x26e092.cancelUpdateDownload();
    if (_0x5c3405?.ok === false) {
      window.showToast?.(autoUpdateText("toasts.cancelDownloadFailed"), "error");
      return;
    }
    if (_0x5c3405?.cancelled !== false) {
      window.showToast?.(autoUpdateText("toasts.downloadCancelled"));
    }
  } catch (_0x165716) {
    window.showToast?.(autoUpdateText("toasts.cancelDownloadFailed"), "error");
  }
}
async function _downloadDesktopUpdate(_0x152b23, {
  ensureAvailable = false
} = {}) {
  const _0x503d7c = desktopBridge.app;
  if (!_0x503d7c.isAvailable()) {
    return;
  }
  _setBtnContent(_0x152b23, true, autoUpdateText("buttons.preparingDownload"));
  _0x152b23.disabled = true;
  _desktopInstallAfterDownload = true;
  try {
    if (ensureAvailable) {
      const _0x430c64 = await ensureDesktopUpdateAvailable(_0x503d7c);
      if (_0x430c64?.state === "downloaded") {
        await _installDownloadedDesktopUpdate(_0x152b23);
        return;
      }
    }
    const _0x2afc47 = await _0x503d7c.downloadUpdate();
    if (_0x2afc47?.ok === false && !_0x2afc47?.cancelled) {
      throw new Error("desktop update download failed");
    }
  } catch (_0x174ede) {
    _desktopInstallAfterDownload = false;
    _0x152b23.disabled = false;
    _setBtnContent(_0x152b23, false, autoUpdateText("buttons.downloadInstall"));
    window.showToast?.(autoUpdateText("toasts.programUpdateFailed"), "error");
  }
}
async function _installDownloadedDesktopUpdate(_0x1dcbec) {
  const _0x55d33e = desktopBridge.app;
  if (!_0x55d33e.isAvailable()) {
    return;
  }
  _setBtnContent(_0x1dcbec, true, autoUpdateText("buttons.restarting"));
  if (_0x1dcbec) {
    _0x1dcbec.disabled = true;
  }
  try {
    await _0x55d33e.installDownloadedUpdate();
  } catch (_0xb20d6e) {
    if (_0x1dcbec) {
      _0x1dcbec.disabled = false;
    }
    _setBtnContent(_0x1dcbec, false, autoUpdateText("buttons.restartInstall"));
    window.showToast?.(autoUpdateText("toasts.restartInstallFailed"));
  }
}
async function _doApply(_0x213038) {
  if (_0x213038?.previewOnly) {
    window.showToast?.(autoUpdateText("toasts.previewOnly"));
    return;
  }
  if (!_0x213038?.canHotApply) {
    _setProgramUpdateFallback(_0x213038, autoUpdateText("errors.programUpdateRequired"));
    return;
  }
  const _0x4c27a2 = document.getElementById("update-banner-btn");
  const _0x4c0a32 = document.getElementById("update-banner-sub");
  _0x4c0a32?.classList?.remove?.("is-error");
  _0x4c27a2?.classList?.remove?.("is-download");
  _setBtnContent(_0x4c27a2, true, autoUpdateText("buttons.updating"));
  if (_0x4c27a2) {
    _0x4c27a2.disabled = true;
  }
  try {
    const _0x3a2504 = await applyUpdateFromServer();
    if (_0x3a2504.success) {
      _setBtnContent(_0x4c27a2, true, autoUpdateText("buttons.restartingWait"));
      const _0x4002e9 = Date.now() + 30000;
      const _0x23db9d = async () => {
        if (Date.now() > _0x4002e9) {
          location.reload();
          return;
        }
        try {
          const _0x38d5cc = await pingUpdateCheckFromServer();
          if (_0x38d5cc) {
            location.reload();
            return;
          }
        } catch (_0x112a3a) {}
        setTimeout(_0x23db9d, 800);
      };
      setTimeout(_0x23db9d, 2000);
      return;
    }
    _setProgramUpdateFallback(_0x213038, autoUpdateText("errors.hotApplyFailed", {
      error: _0x3a2504.error || autoUpdateText("errors.unknownProgramUpdate")
    }));
  } catch (_0x3a9328) {
    _setProgramUpdateFallback(_0x213038, autoUpdateText("errors.networkProgramUpdate"));
  }
}
async function _checkUpdate() {
  if (desktopBridge.isElectron || _desktopUpdaterActive) {
    return;
  }
  try {
    const _0x227f14 = await checkUpdateFromServer();
    if (_0x227f14?.hasUpdate) {
      _showBanner(_0x227f14);
    }
  } catch (_0x376ef2) {}
}
function _normalizeDesktopUpdateInfo(_0x241bc7) {
  const _0x3c1922 = _0x241bc7 && typeof _0x241bc7 === "object" ? _0x241bc7 : {};
  return {
    version: String(_0x3c1922.version || "").trim(),
    releaseDate: _0x3c1922.releaseDate || "",
    releaseNotes: String(_0x3c1922.releaseNotes || "").trim(),
    previewVideoUrl: String(_0x3c1922.previewVideoUrl || _0x3c1922.preview_video_url || "").trim()
  };
}
function _formatDesktopRemoteVersion(_0x2ad12c) {
  const _0x560c8c = String(_0x2ad12c || "").trim();
  if (!_0x560c8c || _0x560c8c === autoUpdateText("versions.newVersion")) {
    return autoUpdateText("versions.newVersion");
  }
  if (_0x560c8c.startsWith("V")) {
    return _0x560c8c;
  } else {
    return "V" + _0x560c8c;
  }
}
function _getPageLocalVersion() {
  const _0x5cbd74 = document.querySelector("meta[name=\"app-version\"]")?.getAttribute("content");
  return String(_0x5cbd74 || "").trim();
}
function _isRemoteVersionNewer(_0x3e600a, _0x56ad86, _0x1616b3 = false) {
  const _0xdc4279 = _0x187d4a => String(_0x187d4a || "").replace(/^[vV]/, "").match(/\d+/g)?.map(Number) || [];
  const _0x17bbe7 = _0xdc4279(_0x3e600a);
  const _0x3a0202 = _0xdc4279(_0x56ad86);
  if (!_0x17bbe7.length || !_0x3a0202.length) {
    return Boolean(_0x1616b3);
  }
  const _0x119646 = Math.max(_0x17bbe7.length, _0x3a0202.length);
  for (let _0x366e8e = 0; _0x366e8e < _0x119646; _0x366e8e += 1) {
    const _0x17c2ee = _0x17bbe7[_0x366e8e] || 0;
    const _0x29834b = _0x3a0202[_0x366e8e] || 0;
    if (_0x29834b !== _0x17c2ee) {
      return _0x29834b > _0x17c2ee;
    }
  }
  return false;
}
async function _getDesktopLocalVersion() {
  try {
    const _0xd7458 = await desktopBridge.app.getAppVersion();
    if (_0xd7458) {
      return "V" + _0xd7458;
    } else {
      return autoUpdateText("versions.unknownVersion");
    }
  } catch (_0x374837) {
    return autoUpdateText("versions.unknownVersion");
  }
}
async function _showManualUpdateResult(_0x1c5ae9 = {}, _0x53b1a2 = "") {
  const _0x545bab = _0x1c5ae9 && typeof _0x1c5ae9 === "object" ? _0x1c5ae9 : {};
  const _0x43ff58 = _normalizeDesktopUpdateInfo(_0x545bab);
  const _0x245ba8 = _getPageLocalVersion() || _0x545bab.localVersion || (await _getDesktopLocalVersion());
  const _0x55c1ba = _0x545bab.remoteVersion || (_0x43ff58.version ? _formatDesktopRemoteVersion(_0x43ff58.version) : autoUpdateText("versions.unknownVersion"));
  _showBanner({
    ..._0x545bab,
    hasUpdate: false,
    previewOnly: false,
    localVersion: _0x245ba8,
    remoteVersion: _0x55c1ba,
    pubDate: _0x545bab.pubDate || _0x43ff58.releaseDate || "",
    subtitleText: _0x53b1a2 || _0x545bab.subtitleText || autoUpdateText("toasts.alreadyLatest"),
    notes: _0x545bab.notes || _0x43ff58.releaseNotes || "",
    canHotApply: false
  }, {
    replace: true,
    ignoreDismissed: true
  });
}
async function _showDesktopUpdateBanner(_0x412c0b, _0x2b4c82 = {}) {
  const _0x45bcf0 = ++_desktopBannerRequestSequence;
  const _0x52d402 = _normalizeDesktopUpdateInfo(_0x2b4c82.info || _desktopUpdateInfo);
  if (_0x52d402.version) {
    _desktopUpdateInfo = _0x52d402;
  }
  const _0x51306e = _0x52d402.version || autoUpdateText("versions.newVersion");
  const _0x47d066 = await _getDesktopLocalVersion();
  if (_0x45bcf0 !== _desktopBannerRequestSequence) {
    return;
  }
  const _0x3820fe = _formatDesktopRemoteVersion(_0x51306e);
  const _0x4dbaca = _0x52d402.releaseNotes || autoUpdateText("desktop.downloadedNotes");
  const _0x54f8f1 = _0x412c0b === "downloaded";
  const _0x4262e0 = _0x412c0b === "downloading";
  const _0x366171 = _0x412c0b === "retrying";
  const _0xb8d983 = Number(_0x2b4c82.percent || 0);
  const _0x1b0d6d = _0x366171 ? autoUpdateText("progress.retrying", {
    count: Number(_0x2b4c82.retryCount || 0)
  }) : autoUpdateText("progress.downloading", {
    percent: _formatPercent(_0xb8d983)
  });
  _showBanner({
    hasUpdate: true,
    localVersion: _0x47d066,
    remoteVersion: _0x3820fe,
    pubDate: _0x52d402.releaseDate || "",
    subtitleText: _0x54f8f1 ? autoUpdateText("desktop.subtitleDownloaded", {
      localVersion: _0x47d066,
      remoteVersion: _0x3820fe
    }) : _0x4262e0 || _0x366171 ? autoUpdateText("desktop.subtitleDownloading", {
      localVersion: _0x47d066,
      remoteVersion: _0x3820fe
    }) : autoUpdateText("desktop.subtitleAvailable", {
      localVersion: _0x47d066,
      remoteVersion: _0x3820fe
    }),
    notes: _0x4dbaca,
    previewVideoUrl: _0x54f8f1 ? "" : _0x52d402.previewVideoUrl,
    canHotApply: false,
    startDesktopDownload: !_0x54f8f1 && !_0x4262e0 && !_0x366171,
    installDownloadedUpdate: _0x54f8f1,
    showProgress: _0x4262e0 || _0x366171,
    hideNotes: _0x54f8f1,
    progressPercent: _0xb8d983,
    progressText: _0x1b0d6d,
    cancelText: _0x54f8f1 ? autoUpdateText("buttons.later") : autoUpdateText("buttons.cancel"),
    cancelAction: _0x4262e0 || _0x366171 ? _cancelDesktopUpdateDownload : null,
    closeAction: _0x4262e0 || _0x366171 ? _cancelDesktopUpdateDownload : null,
    disableSkip: true,
    hideSubtitle: false
  }, {
    replace: true,
    ignoreDismissed: true
  });
}
async function _showDesktopDownloadFailedBanner(_0x246189 = {}) {
  const _0x33d3ed = ++_desktopBannerRequestSequence;
  const _0x20fb49 = _normalizeDesktopUpdateInfo(_0x246189.info || _desktopUpdateInfo);
  if (_0x20fb49.version) {
    _desktopUpdateInfo = _0x20fb49;
  }
  const _0x2c6f03 = _0x20fb49.version || autoUpdateText("versions.newVersion");
  const _0x49da8d = await _getDesktopLocalVersion();
  if (_0x33d3ed !== _desktopBannerRequestSequence) {
    return;
  }
  const _0x1c3a8d = _formatDesktopRemoteVersion(_0x2c6f03);
  const _0x100501 = Number(_0x246189.retryCount || 0);
  const _0x2756fa = Number(_0x246189.maxRetries || 0);
  const _0xd5a3fc = autoUpdateText("desktop.downloadFailedMessage");
  _showBanner({
    hasUpdate: true,
    localVersion: _0x49da8d,
    remoteVersion: _0x1c3a8d,
    pubDate: _0x20fb49.releaseDate || "",
    subtitleText: _0x2756fa ? autoUpdateText("desktop.downloadFailedWithRetries", {
      message: _0xd5a3fc,
      retryCount: _0x100501,
      maxRetries: _0x2756fa
    }) : _0xd5a3fc,
    notes: _0x20fb49.releaseNotes || autoUpdateText("desktop.downloadFailedNotes"),
    previewVideoUrl: "",
    canHotApply: false,
    retryDesktopDownload: true,
    showProgress: false,
    hideNotes: true,
    cancelText: autoUpdateText("buttons.later"),
    disableSkip: true,
    hideSubtitle: false
  }, {
    replace: true,
    ignoreDismissed: true
  });
}
function _desktopEventFromState(_0x241bd9 = {}) {
  if (_0x241bd9.latestEvent) {
    return _0x241bd9.latestEvent;
  }
  if (!_0x241bd9.state || _0x241bd9.state === "idle") {
    return null;
  }
  const _0x6ea6c2 = {
    checking: "checking",
    available: "available",
    downloading: "download-started",
    downloaded: "downloaded",
    error: "download-failed",
    installing: "installing"
  };
  const _0x72e56b = _0x6ea6c2[_0x241bd9.state];
  if (!_0x72e56b) {
    return null;
  }
  return {
    type: _0x72e56b,
    state: _0x241bd9.state,
    info: _0x241bd9.latestInfo || null,
    retryCount: _0x241bd9.retryCount || 0,
    maxRetries: _0x241bd9.maxRetries || 0
  };
}
function _handleDesktopUpdaterEvent(_0x26a46c) {
  if (!_0x26a46c || typeof _0x26a46c !== "object") {
    return;
  }
  if (_0x26a46c.type === "checking") {
    _desktopBannerRequestSequence += 1;
    _startupBannerQueue.clear();
    _desktopUpdaterActive = true;
    return;
  }
  if (_0x26a46c.type === "available") {
    _desktopUpdaterActive = true;
    _startupAutomaticToastQueue.clear();
    _showDesktopUpdateBanner("available", _0x26a46c);
    return;
  }
  if (_0x26a46c.type === "download-started") {
    _desktopBannerRequestSequence += 1;
    _desktopUpdaterActive = true;
    if (_setDesktopDownloadInPlace(_0x26a46c)) {
      return;
    }
    _showDesktopUpdateBanner("downloading", _0x26a46c);
    return;
  }
  if (_0x26a46c.type === "download-retry") {
    _desktopBannerRequestSequence += 1;
    _desktopUpdaterActive = true;
    if (_setDesktopDownloadInPlace(_0x26a46c, {
      retrying: true
    })) {
      return;
    }
    _showDesktopUpdateBanner("retrying", _0x26a46c);
    return;
  }
  if (_0x26a46c.type === "download-progress") {
    _desktopBannerRequestSequence += 1;
    _desktopUpdaterActive = true;
    if (!document.getElementById("update-banner-progress")) {
      _showDesktopUpdateBanner("downloading", _0x26a46c);
      return;
    }
    _setUpdateProgress(_0x26a46c.percent, autoUpdateText("progress.downloading", {
      percent: _formatPercent(_0x26a46c.percent)
    }));
    return;
  }
  if (_0x26a46c.type === "downloaded") {
    _desktopUpdaterActive = true;
    if (_desktopInstallAfterDownload) {
      _desktopBannerRequestSequence += 1;
      _desktopInstallAfterDownload = false;
      const _0x6384e9 = document.getElementById("update-banner-btn");
      const _0x28f54c = document.getElementById("update-banner-sub");
      if (_0x28f54c) {
        _0x28f54c.classList.remove("is-error");
        _0x28f54c.textContent = autoUpdateText("status.downloadedRestarting");
      }
      _setBtnContent(_0x6384e9, true, autoUpdateText("buttons.restartingInstall"));
      if (_0x6384e9) {
        _0x6384e9.disabled = true;
      }
      _installDownloadedDesktopUpdate(_0x6384e9);
      return;
    }
    _showDesktopUpdateBanner("downloaded", _0x26a46c);
    return;
  }
  if (_0x26a46c.type === "download-failed") {
    _desktopUpdaterActive = true;
    _desktopInstallAfterDownload = false;
    _showDesktopDownloadFailedBanner(_0x26a46c);
    return;
  }
  if (_0x26a46c.type === "download-cancelled") {
    _desktopBannerRequestSequence += 1;
    _desktopUpdaterActive = true;
    _desktopInstallAfterDownload = false;
    _removeBanner();
    return;
  }
  if (_0x26a46c.type === "not-available") {
    _desktopBannerRequestSequence += 1;
    _startupBannerQueue.clear();
    _desktopUpdaterActive = false;
    _startupAutomaticToastQueue.clear();
    if (_0x26a46c.manual) {
      _showManualUpdateResult(_0x26a46c.info, autoUpdateText("toasts.alreadyLatest"));
    }
    return;
  }
  if (_0x26a46c.type === "installing") {
    _desktopBannerRequestSequence += 1;
    _desktopUpdaterActive = true;
    window.showToast?.(autoUpdateText("toasts.installing"));
    return;
  }
  if (_0x26a46c.type === "error") {
    if (_0x26a46c.skipped) {
      return;
    }
    _desktopBannerRequestSequence += 1;
    _startupBannerQueue.clear();
    _desktopInstallAfterDownload = false;
    const _0x20d7a5 = autoUpdateText("toasts.updateFailed");
    if (_0x26a46c.manual) {
      _showManualUpdateResult(_0x26a46c.info, _0x20d7a5);
      return;
    }
    _showAutomaticUpdateToast(_0x20d7a5);
  }
}
function _showAutomaticUpdateToast(_0x50aed9) {
  const _0x49056b = () => window.showToast?.(_0x50aed9);
  if (isStartupVisualComplete()) {
    _0x49056b();
    return;
  }
  if (_startupAutomaticToastQueue.defer(_0x49056b)) {
    return;
  }
  waitForStartupVisualComplete().then(_0x49056b);
}
function _bindDesktopUpdaterEvents() {
  const _0x36f243 = desktopBridge.app;
  if (!_0x36f243.isAvailable() || _desktopUpdateUnsubscribe) {
    return;
  }
  _desktopUpdateUnsubscribe = _0x36f243.onUpdaterEvent(_handleDesktopUpdaterEvent);
  _0x36f243.getUpdateState().then(_0x5a4168 => {
    const _0x79096c = _desktopEventFromState(_0x5a4168);
    if (_0x79096c) {
      _handleDesktopUpdaterEvent(_0x79096c);
    }
  }).catch(() => {});
}
export function initAutoUpdate() {
  _bindDesktopUpdaterEvents();
  setTimeout(_checkUpdate, 5000);
  setTimeout(_checkUpdate, 20000);
  setInterval(_checkUpdate, CHECK_INTERVAL);
}
export async function showManualUpdateCheck() {
  window.showToast?.(autoUpdateText("toasts.checkingUpdate"));
  let _0x5f4f1f = false;
  if (desktopBridge.app.isAvailable()) {
    try {
      const _0x1ce812 = await desktopBridge.app.checkForUpdates();
      const _0x2b6429 = _0x1ce812?.skipped === true && _0x1ce812?.reason === "not-packaged";
      _0x5f4f1f = _0x2b6429;
      if (!_0x2b6429) {
        if (_0x1ce812?.state === "idle" && !document.getElementById("update-banner")) {
          await _showManualUpdateResult({}, autoUpdateText("toasts.alreadyLatest"));
        }
        return;
      }
    } catch (_0x332b7a) {
      await _showManualUpdateResult({}, autoUpdateText("toasts.desktopCheckFailed"));
      return;
    }
  }
  try {
    let _0xd08aad = await checkUpdateFromServer({
      force: true,
      includeCurrent: true
    });
    if (!_0xd08aad?.remoteVersion && !_0xd08aad?.notes && !_0xd08aad?.releaseUrl) {
      try {
        const _0x575b43 = await checkLocalUpdatePreviewFromServer();
        if (_0x575b43?.remoteVersion || _0x575b43?.notes || _0x575b43?.releaseUrl) {
          _0xd08aad = _0x575b43;
        }
      } catch (_0x4a27c8) {}
    }
    if (_0xd08aad?.remoteVersion || _0xd08aad?.notes || _0xd08aad?.releaseUrl) {
      const _0x1c3ee7 = _getPageLocalVersion() || _0xd08aad.localVersion;
      const _0x5a5d88 = _isRemoteVersionNewer(_0x1c3ee7, _0xd08aad.remoteVersion, _0xd08aad.hasUpdate === true);
      const _0x2b903a = {
        ..._0xd08aad,
        hasUpdate: _0x5a5d88,
        previewOnly: false,
        localVersion: _0x1c3ee7,
        desktopUpdaterUnavailable: _0x5f4f1f
      };
      if (_0x5a5d88) {
        _showBanner(_0x2b903a, {
          replace: true,
          ignoreDismissed: true
        });
      } else {
        await _showManualUpdateResult(_0x2b903a, autoUpdateText("toasts.alreadyLatest"));
      }
      return;
    }
    await _showManualUpdateResult(_0xd08aad, autoUpdateText("toasts.noRemoteInfo"));
  } catch (_0x3c8ede) {
    await _showManualUpdateResult({}, autoUpdateText("toasts.remoteCheckFailed"));
  }
}
export async function showLocalUpdatePreview() {
  try {
    window.showToast?.(autoUpdateText("toasts.generatingPreview"));
    const _0x4e6761 = await checkLocalUpdatePreviewFromServer();
    if (_0x4e6761?.previewOnly && (_0x4e6761?.remoteVersion || _0x4e6761?.notes)) {
      _showBanner(_0x4e6761, {
        replace: true,
        ignoreDismissed: true
      });
      return;
    }
    window.showToast?.(autoUpdateText("toasts.noLocalPreview"));
  } catch (_0x1b4d08) {
    window.showToast?.(autoUpdateText("toasts.localPreviewFailed"));
  }
}
export function showTutorialVideoPanel(_0x1050ae, _0x4b4bd3 = []) {
  const _0x59fbe4 = Array.isArray(_0x1050ae) ? _0x1050ae : [{
    title: autoUpdateText("tutorial.defaultTitle"),
    url: _0x1050ae
  }];
  const _0x12dd87 = _formatBannerVersion(_getPageLocalVersion());
  const _0x134c5b = _0x12dd87 ? autoUpdateText("tutorial.versionedTitle", {
    version: _0x12dd87
  }) : autoUpdateText("tutorial.title");
  _showBanner({
    previewOnly: true,
    hasUpdate: false,
    localVersion: "",
    remoteVersion: _0x134c5b,
    titleText: _0x134c5b,
    subtitleText: autoUpdateText("tutorial.subtitle"),
    notes: "",
    tutorialLinks: _0x4b4bd3,
    tutorialVideos: _0x59fbe4,
    canHotApply: false,
    hideNotes: true,
    hideCancelButton: true,
    previewCloseText: autoUpdateText("buttons.close")
  }, {
    replace: true,
    ignoreDismissed: true
  });
}