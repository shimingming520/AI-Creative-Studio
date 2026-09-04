import { registerStaticInnerHTML } from "../../utils/dom.js";
import { createToolbarHtml, createToolbarIconButton } from "./buttonFactory.js";
import { t } from "../../i18n/index.js";
function toolbarText(_0xdb54b3) {
  return t("nodeToolbar." + _0xdb54b3);
}
const CLIP_ICON = "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" width=\"16\" height=\"16\"><circle cx=\"6\" cy=\"6\" r=\"3\"/><circle cx=\"6\" cy=\"18\" r=\"3\"/><line x1=\"20\" y1=\"4\" x2=\"8.12\" y2=\"15.88\"/><line x1=\"14.47\" y1=\"14.48\" x2=\"20\" y2=\"20\"/><line x1=\"8.12\" y1=\"8.12\" x2=\"12\" y2=\"12\"/></svg>";
const SEPARATE_ICON = "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" width=\"16\" height=\"16\"><path d=\"M4 15v-6\"/><path d=\"M8 18V6\"/><path d=\"M12 4v16\"/><path d=\"M16 6v12\"/><path d=\"M20 9v6\"/><path d=\"M12 3v18\"/></svg>";
const VOICE_STUDIO_ICON = "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" width=\"16\" height=\"16\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M4 10v4\"/><path d=\"M8 7v10\"/><path d=\"M12 4v16\"/><path d=\"M16 8v8\"/><path d=\"M20 11v2\"/></svg>";
const SPEED_ICON = "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" width=\"16\" height=\"16\"><circle cx=\"12\" cy=\"12\" r=\"10\"/><polyline points=\"12 6 12 12 16 14\"/></svg>";
const UPLOAD_ICON = "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" width=\"16\" height=\"16\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4\"/><polyline points=\"17 8 12 3 7 8\"/><line x1=\"12\" y1=\"3\" x2=\"12\" y2=\"15\"/></svg>";
const DOWNLOAD_ICON = "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" width=\"16\" height=\"16\"><path d=\"M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4\"/><polyline points=\"7 10 12 15 17 10\"/><line x1=\"12\" y1=\"15\" x2=\"12\" y2=\"3\"/></svg>";
function createAudioToolbarItems() {
  const _0x1a6123 = [createToolbarIconButton({
    action: "clip",
    tooltip: toolbarText("audio.clip"),
    label: toolbarText("audio.clip"),
    iconSvg: CLIP_ICON
  }), createToolbarIconButton({
    action: "separate",
    tooltip: toolbarText("audio.separate"),
    label: toolbarText("audio.separate"),
    iconSvg: SEPARATE_ICON
  }), createToolbarIconButton({
    action: "voice-studio",
    tooltip: toolbarText("audio.voiceStudio"),
    label: toolbarText("audio.voiceStudio"),
    iconSvg: VOICE_STUDIO_ICON
  }), createToolbarIconButton({
    action: "speed",
    tooltip: toolbarText("audio.speed"),
    label: toolbarText("audio.speed"),
    iconSvg: SPEED_ICON
  })];
  _0x1a6123.push(createToolbarIconButton({
    action: "upload",
    tooltip: toolbarText("common.upload"),
    label: toolbarText("common.upload"),
    iconSvg: UPLOAD_ICON
  }), createToolbarIconButton({
    action: "download",
    tooltip: toolbarText("common.download"),
    label: toolbarText("common.download"),
    iconSvg: DOWNLOAD_ICON
  }));
  return _0x1a6123;
}
export const SOURCE_AUDIO_TOOLBAR_HTML = createToolbarHtml({
  toolbarClass: "audio-toolbar",
  items: createAudioToolbarItems()
});
export const AUDIO_TOOLBAR_HTML = createToolbarHtml({
  toolbarClass: "audio-toolbar",
  items: createAudioToolbarItems()
});
registerStaticInnerHTML("toolbar:audio", AUDIO_TOOLBAR_HTML);
registerStaticInnerHTML("toolbar:source-audio", SOURCE_AUDIO_TOOLBAR_HTML);