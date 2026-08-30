import { t } from "../i18n/index.js";
import { showGenerationCompleteNotification } from "../services/completionNotificationService.js";
import { playCompletionSound } from "../services/completionSoundService.js";
function panelText(_0xe00e42, _0x3cc100 = {}) {
  return t("audioVoicePanel." + _0xe00e42, _0x3cc100);
}
export function summarizeAudioVoiceGenerationResults(_0x13c39c = [], _0x47eb1c = 0) {
  const _0x4e2775 = Array.isArray(_0x13c39c) ? _0x13c39c : [];
  const _0x142662 = Math.max(_0x4e2775.length, Math.max(0, Math.trunc(Number(_0x47eb1c) || 0)));
  const _0x495b4e = _0x4e2775.filter(_0x1523bc => {
    if (_0x1523bc?.status !== "fulfilled") {
      return false;
    }
    const _0x457733 = String(_0x1523bc?.value?.status || "").trim().toLowerCase();
    return !_0x457733 || _0x457733 === "success";
  }).length;
  return {
    total: _0x142662,
    succeeded: _0x495b4e,
    incomplete: Math.max(0, _0x142662 - _0x495b4e)
  };
}
export function buildAudioVoiceGenerationCompletionMessage(_0x5883a8 = {}) {
  const _0x2022cb = Math.max(1, Math.trunc(Number(_0x5883a8?.total) || 0));
  const _0x11f063 = Math.max(0, Math.min(_0x2022cb, Math.trunc(Number(_0x5883a8?.succeeded) || 0)));
  const _0x2f2d7c = Math.max(0, Math.min(_0x2022cb, Number.isFinite(Number(_0x5883a8?.incomplete)) ? Math.trunc(Number(_0x5883a8.incomplete)) : _0x2022cb - _0x11f063));
  if (_0x2f2d7c > 0) {
    return panelText("toasts.generationBatchSettled", {
      succeeded: _0x11f063,
      incomplete: _0x2f2d7c
    });
  }
  if (_0x2022cb === 1) {
    return panelText("toasts.generationCompleteSingle");
  } else {
    return panelText("toasts.generationCompleteBatch", {
      count: _0x2022cb
    });
  }
}
export function notifyAudioVoiceGenerationComplete(_0x566dfe = {}, {
  playSound = playCompletionSound,
  showNotification = showGenerationCompleteNotification
} = {}) {
  const _0x227a12 = buildAudioVoiceGenerationCompletionMessage(_0x566dfe);
  const _0x59aaae = [];
  if (Math.max(0, Number(_0x566dfe?.succeeded) || 0) > 0) {
    _0x59aaae.push(Promise.resolve().then(() => playSound?.("generation-success")));
  }
  _0x59aaae.push(Promise.resolve().then(() => showNotification?.({
    body: _0x227a12
  })));
  return Promise.allSettled(_0x59aaae);
}