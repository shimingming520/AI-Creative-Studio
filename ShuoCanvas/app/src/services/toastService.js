import { inferProviderIdFromApiKeyMessage, isApiKeyConfigurationMessage, openProviderApiKeySettings } from "../modules/providerApiKeyMissingToast.js";
import { logDiagnosticEvent } from "./diagnosticsService.js";
const DEFAULT_DURATION = 2900;
const ALERT_DURATION = 5000;
const SETTINGS_ACTION_LABEL = "去设置";
const ICONS = {
  ok: "",
  warn: "⚠️",
  error: "✕",
  success: "✓"
};
function resolveToastActionOptions(_0x325d1c, _0x361a5c = {}) {
  if (_0x361a5c?.actionLabel || typeof _0x361a5c?.onAction === "function") {
    return _0x361a5c || {};
  }
  if (isApiKeyConfigurationMessage(_0x325d1c)) {
    const _0x9f71c = inferProviderIdFromApiKeyMessage(_0x325d1c);
    return {
      ...(_0x361a5c || {}),
      actionLabel: SETTINGS_ACTION_LABEL,
      onAction: () => {
        openProviderApiKeySettings({
          providerId: _0x9f71c,
          message: _0x325d1c
        });
      }
    };
  }
  return _0x361a5c || {};
}
export function showToast(_0x5b96ad, _0x461531 = "ok", _0x3eb83d, _0x51c700 = {}) {
  const _0x15597e = _0x461531 === "warning" ? "warn" : _0x461531;
  if (_0x15597e === "error" || _0x15597e === "warn") {
    logDiagnosticEvent({
      type: "ui.alert_presented",
      level: _0x15597e,
      source: "renderer",
      message: String(_0x5b96ad || "User-visible alert"),
      context: {
        toastType: _0x15597e
      }
    });
  }
  const _0x4e9a23 = document.getElementById("v2-toast-wrap");
  if (!_0x4e9a23) {
    console.warn("[Toast]", _0x5b96ad);
    return;
  }
  const _0x229adc = _0x15597e === "error" || _0x15597e === "warn";
  const _0xfce79d = _0x229adc ? ALERT_DURATION : DEFAULT_DURATION;
  const _0x1fedbe = Number.isFinite(Number(_0x3eb83d)) ? Math.max(0, Number(_0x3eb83d)) : _0xfce79d;
  const _0x3caac3 = _0x229adc ? Math.max(ALERT_DURATION, _0x1fedbe) : _0x1fedbe;
  const _0x1e3740 = ICONS[_0x15597e] ?? "";
  const _0x2c30c5 = document.createElement("div");
  _0x2c30c5.className = "v2-toast" + (_0x15597e !== "ok" ? " " + _0x15597e : "");
  if (_0x3caac3 > DEFAULT_DURATION && !_0x229adc) {
    _0x2c30c5.classList.add("is-long");
  }
  if (_0x1e3740) {
    const _0xec7b16 = document.createElement("span");
    _0xec7b16.className = "v2-toast-icon";
    _0xec7b16.textContent = _0x1e3740;
    _0x2c30c5.appendChild(_0xec7b16);
  }
  const _0x39c1ea = document.createElement("span");
  _0x39c1ea.textContent = _0x5b96ad;
  _0x2c30c5.appendChild(_0x39c1ea);
  const _0x393cbd = resolveToastActionOptions(_0x5b96ad, _0x51c700);
  if (typeof _0x393cbd?.onClick === "function") {
    const _0x5e63e9 = _0x293a34 => {
      if (_0x293a34?.type === "keydown" && !["Enter", " "].includes(_0x293a34.key)) {
        return;
      }
      _0x293a34?.preventDefault?.();
      try {
        _0x393cbd.onClick();
      } finally {
        _0x2c30c5.remove();
      }
    };
    _0x2c30c5.classList.add("is-clickable");
    _0x2c30c5.setAttribute("role", "button");
    _0x2c30c5.setAttribute("tabindex", "0");
    _0x2c30c5.setAttribute("aria-label", String(_0x393cbd.ariaLabel || _0x5b96ad + "，点击查看").trim());
    _0x2c30c5.addEventListener("click", _0x5e63e9);
    _0x2c30c5.addEventListener("keydown", _0x5e63e9);
  }
  const _0x2122f9 = String(_0x393cbd?.actionLabel || "").trim();
  if (_0x2122f9 && typeof _0x393cbd?.onAction === "function") {
    const _0x261d70 = document.createElement("button");
    _0x261d70.type = "button";
    _0x261d70.className = "v2-toast-action";
    _0x261d70.textContent = _0x2122f9;
    _0x261d70.addEventListener("click", _0x39d30e => {
      _0x39d30e.preventDefault();
      _0x39d30e.stopPropagation();
      try {
        _0x393cbd.onAction();
      } finally {
        _0x2c30c5.remove();
      }
    });
    _0x2c30c5.appendChild(_0x261d70);
  }
  _0x4e9a23.appendChild(_0x2c30c5);
  setTimeout(() => {
    _0x2c30c5.remove();
  }, _0x3caac3);
}
export function showSuccess(_0x37e375, _0x1af64e) {
  showToast(_0x37e375, "success", _0x1af64e);
}
export function showError(_0x12039e, _0x1c2223) {
  showToast(_0x12039e, "error", _0x1c2223);
}
export function showWarning(_0xfabca6, _0x3254e4) {
  showToast(_0xfabca6, "warn", _0x3254e4);
}
export function initToastService() {
  window.showToast = showToast;
  window.showSuccess = showSuccess;
  window.showError = showError;
  window.showWarning = showWarning;
}
