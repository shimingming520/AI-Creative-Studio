import { t } from "../../i18n/index.js";
const DREAMINA_LOGIN_PAGE_URL = "https://jimeng.jianying.com/";
const DREAMINA_I18N_PREFIX = "settings.apiInput.providers.dreamina";
function trTemplate(_0x52514f, _0x406d0f = {}) {
  let _0x3fa2f3 = t(_0x52514f);
  Object.entries(_0x406d0f || {}).forEach(([_0x1cad94, _0x91cc90]) => {
    _0x3fa2f3 = _0x3fa2f3.split("{" + _0x1cad94 + "}").join(String(_0x91cc90 ?? ""));
  });
  return _0x3fa2f3;
}
function trDreamina(_0x3670f2, _0x15e609 = {}) {
  return trTemplate(DREAMINA_I18N_PREFIX + "." + _0x3670f2, _0x15e609);
}
function normalizeDreaminaManualUrlCandidate(_0x203944) {
  const _0x493504 = String(_0x203944 || "").trim();
  if (!_0x493504) {
    return "";
  }
  const _0x9aeb2d = _0x493504.replace(/^[<（(【\["'“‘]+/, "").replace(/[>）)】\]"'”’]+$/, "").replace(/[，。；;、]+$/, "");
  if (/^https?:\/\//.test(_0x9aeb2d)) {
    return _0x9aeb2d;
  } else {
    return "";
  }
}
export function extractDreaminaManualLinksFromOutputLines(_0x2f6538) {
  const _0x3f039b = Array.isArray(_0x2f6538) ? _0x2f6538 : [];
  const _0x20d045 = [];
  let _0x1af3c3 = "";
  _0x3f039b.forEach(_0x46e065 => {
    const _0x4e6c10 = String(_0x46e065 || "");
    if (!_0x1af3c3 && _0x4e6c10.includes("请在浏览器中打开以下链接")) {
      _0x1af3c3 = "__PENDING__";
    } else if (_0x1af3c3 === "__PENDING__") {
      _0x1af3c3 = _0x4e6c10.trim();
    }
    const _0x33af5d = _0x4e6c10.match(/https?:\/\/[^\s]+/g);
    if (!_0x33af5d) {
      return;
    }
    _0x33af5d.forEach(_0x489f7a => {
      const _0x15ea8c = normalizeDreaminaManualUrlCandidate(_0x489f7a);
      if (_0x15ea8c && !_0x20d045.includes(_0x15ea8c)) {
        _0x20d045.push(_0x15ea8c);
      }
    });
  });
  const _0x1012bb = _0x1af3c3 && _0x1af3c3 !== "__PENDING__" ? normalizeDreaminaManualUrlCandidate(_0x1af3c3) : "";
  const _0x50c56f = _0x1012bb || _0x20d045.find(_0x26da33 => _0x26da33.includes("/passport/web_login")) || _0x20d045.find(_0x4e9826 => _0x4e9826.includes("/passport/web/web_login")) || "";
  const _0x19da93 = _0x20d045.find(_0x2b3f9d => _0x2b3f9d.includes("/dreamina/cli/v1/dreamina_cli_login")) || "";
  const _0x1d4737 = _0x19da93 || _0x20d045.find(_0x12cf35 => _0x12cf35 !== DREAMINA_LOGIN_PAGE_URL) || "";
  return {
    authorizeUrl: _0x19da93 || _0x50c56f || _0x1d4737 || "",
    strictAuthorizeUrl: _0x50c56f,
    callbackUrl: _0x19da93
  };
}
export function getDreaminaWebLoginButtonText(_0x146660) {
  const _0x15ffe5 = _0x146660?.runtime || {};
  const _0x21d63a = !!_0x146660?.loggedIn;
  const _0x35f959 = !!_0x15ffe5?.active;
  if (_0x35f959) {
    return trDreamina("viewLogin");
  }
  if (_0x21d63a) {
    return trDreamina("relogin");
  } else {
    return trDreamina("login");
  }
}
export function getDreaminaQrLoginButtonText(_0x15b5f7) {
  const _0x572f92 = _0x15b5f7?.runtime || {};
  const _0x142ba1 = !!_0x572f92?.active;
  if (_0x142ba1) {
    return trDreamina("viewLogin");
  }
  return trDreamina("login");
}
export function getDreaminaStatusSessionKey(_0x5d9349) {
  const _0x10afba = _0x5d9349?.runtime || {};
  const _0x26be81 = Number(_0x10afba?.startedAt || 0);
  if (_0x26be81 > 0) {
    return "login:" + _0x26be81;
  }
  const _0x75b0f9 = Number(_0x10afba?.qrVersion || 0);
  if (_0x75b0f9 > 0) {
    return "qr:" + _0x75b0f9;
  }
  return "";
}
export function mergeDreaminaLoginRuntimeStatus(_0x364d18 = {}, _0x14f9bf = {}) {
  const _0x55eabf = String(_0x14f9bf?.phase || "");
  const _0x47d6dc = ["success", "reused", "done"].includes(_0x55eabf);
  return {
    ...(_0x364d18 || {}),
    loggedIn: _0x47d6dc ? true : !!_0x364d18?.loggedIn,
    message: String(_0x14f9bf?.message || "").trim() || String(_0x364d18?.message || "").trim(),
    runtime: _0x14f9bf || {}
  };
}
export function reconcileDreaminaSessionUiState(_0x49921e, _0x44d0e2 = {}) {
  const _0x41011f = getDreaminaStatusSessionKey(_0x49921e);
  const _0x1c8a97 = !!_0x49921e?.runtime?.active;
  const _0x3f839f = !!_0x44d0e2.manualGuideOpen && Number(_0x44d0e2.loginLaunchRequestedAt || 0) > 0;
  if (_0x41011f && _0x41011f !== _0x44d0e2.currentSessionKey) {
    _0x44d0e2.currentSessionKey = _0x41011f;
    _0x44d0e2.dismissedSessionKey = "";
    if (!_0x3f839f) {
      _0x44d0e2.manualGuideOpen = false;
      _0x44d0e2.loginLaunchRequestedAt = 0;
    }
    return true;
  }
  if (!_0x1c8a97 && !_0x41011f && !_0x3f839f) {
    _0x44d0e2.currentSessionKey = "";
    _0x44d0e2.dismissedSessionKey = "";
    _0x44d0e2.manualGuideOpen = false;
    _0x44d0e2.loginLaunchRequestedAt = 0;
    return true;
  }
  return false;
}
export function shouldDreaminaManualGuideOpenByDefault(_0x5a1920, _0x52bb83 = "") {
  const _0x544b08 = _0x5a1920?.runtime || {};
  const _0x4a7cb5 = String(_0x544b08?.loginMode || "");
  if (!_0x544b08?.active || !["oauth", "web", "headless"].includes(_0x4a7cb5)) {
    return false;
  }
  const _0x4e0315 = getDreaminaStatusSessionKey(_0x5a1920);
  return !_0x4e0315 || String(_0x52bb83 || "") !== _0x4e0315;
}