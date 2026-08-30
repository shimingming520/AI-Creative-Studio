function escapeHtml(_0x2787e1) {
  return String(_0x2787e1 ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
function renderAttributes(_0x355567 = {}) {
  return Object.entries(_0x355567 || {}).filter(([, _0x1b76e9]) => _0x1b76e9 !== false && _0x1b76e9 != null).map(([_0x1922b7, _0x39af3d]) => _0x39af3d === true ? escapeHtml(_0x1922b7) : escapeHtml(_0x1922b7) + "=\"" + escapeHtml(_0x39af3d) + "\"").join(" ");
}
const PLAY_ICON = "<svg class=\"story-video-play-icon\" width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" fill=\"currentColor\" aria-hidden=\"true\"><path d=\"M8 5v14l11-7z\"></path></svg>";
const PAUSE_ICON = "<svg class=\"story-video-pause-icon\" width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" fill=\"currentColor\" aria-hidden=\"true\"><path d=\"M6 5h4v14H6zm8 0h4v14h-4z\"></path></svg>";
const HIGH_VOLUME_ICON = "<svg width=\"17\" height=\"17\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" aria-hidden=\"true\"><path d=\"M11 5 6 9H2v6h4l5 4z\"></path><path d=\"M15.5 8.5a5 5 0 0 1 0 7\"></path><path d=\"M18 6a8.5 8.5 0 0 1 0 12\"></path></svg>";
export function renderWorkspaceVideoPlaybackControls({
  className = "",
  label = "视频",
  disabled = false,
  controlsAttributes = {},
  playAttributes = {},
  currentTimeAttributes = {},
  progressAttributes = {},
  progressFillAttributes = {},
  totalTimeAttributes = {},
  volumeAttributes = {},
  volumeToggleAttributes = {},
  playLabel = "播放" + label,
  playTitle = "",
  progressLabel = label + "播放进度",
  volumeLabel = label + "音量",
  volumeToggleLabel = "静音" + label,
  slots = {}
} = {}) {
  const _0x180dad = ["video-controls", "story-video-controls", className].filter(Boolean).join(" ");
  const _0x4c443c = renderAttributes(controlsAttributes);
  const _0x3b848a = renderAttributes(playAttributes);
  const _0x36c7b1 = renderAttributes(currentTimeAttributes);
  const _0x3c3eae = renderAttributes(progressAttributes);
  const _0xbafddc = renderAttributes(progressFillAttributes);
  const _0x197fcb = renderAttributes(totalTimeAttributes);
  const _0x1a55e1 = renderAttributes(volumeAttributes);
  const _0x5c880d = renderAttributes(volumeToggleAttributes);
  const _0x26c99d = disabled ? " disabled" : "";
  const _0x3db0d2 = disabled ? "-1" : "0";
  const _0x1bc805 = playTitle ? " title=\"" + escapeHtml(playTitle) + "\"" : "";
  return "<div class=\"" + escapeHtml(_0x180dad) + "\"" + (_0x4c443c ? " " + _0x4c443c : "") + ">\n    <button type=\"button\" class=\"video-play-btn story-video-play-btn\"" + (_0x3b848a ? " " + _0x3b848a : "") + " aria-label=\"" + escapeHtml(playLabel) + "\"" + _0x1bc805 + _0x26c99d + ">\n      " + PLAY_ICON + "\n      " + PAUSE_ICON + "\n    </button>\n    " + (slots.afterPlay || "") + "\n    <span class=\"video-time-current\"" + (_0x36c7b1 ? " " + _0x36c7b1 : "") + ">0:00</span>\n    <div class=\"media-progress-bar\"" + (_0x3c3eae ? " " + _0x3c3eae : "") + " role=\"slider\" aria-disabled=\"" + disabled + "\" tabindex=\"" + _0x3db0d2 + "\" aria-label=\"" + escapeHtml(progressLabel) + "\" aria-valuemin=\"0\" aria-valuemax=\"100\" aria-valuenow=\"0\">\n      <div class=\"media-progress-fill\"" + (_0xbafddc ? " " + _0xbafddc : "") + "><div class=\"media-progress-knob\"></div></div>\n    </div>\n    <span class=\"video-time-total\"" + (_0x197fcb ? " " + _0x197fcb : "") + ">0:00</span>\n    " + (slots.beforeVolume || "") + "\n    <div class=\"story-video-volume-control\">\n      <button type=\"button\" class=\"story-video-volume-toggle\"" + (_0x5c880d ? " " + _0x5c880d : "") + " aria-label=\"" + escapeHtml(volumeToggleLabel) + "\" aria-pressed=\"false\"" + _0x26c99d + ">\n        " + HIGH_VOLUME_ICON + "\n      </button>\n      <input type=\"range\" class=\"story-video-volume-slider\"" + (_0x1a55e1 ? " " + _0x1a55e1 : "") + " min=\"0\" max=\"100\" step=\"1\" value=\"100\" aria-label=\"" + escapeHtml(volumeLabel) + "\" aria-valuetext=\"100%\"" + _0x26c99d + ">\n    </div>\n    " + (slots.afterVolume || "") + "\n  </div>";
}