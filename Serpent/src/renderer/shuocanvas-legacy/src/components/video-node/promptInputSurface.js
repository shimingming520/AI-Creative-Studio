import { createReferenceInputThumbnailHtml } from "../../modules/referenceInputThumbnail.js";
import { sanitizePromptHtml } from "../../utils/dom.js";
import { createPromptAttachmentButtonHTML } from "../refAttachmentButton.js";
import { formatInputSlotLabelHtml } from "../shared/inputSlotLabelFormatter.js";
import { t } from "../../i18n/index.js";
const FIXED_REF_KIND_LABEL_KEYS = Object.freeze({
  text: "kind.text",
  image: "kind.image",
  video: "kind.video",
  audio: "kind.audio"
});
const FIXED_REF_SLOT_FALLBACK_LABEL_KEYS = Object.freeze({
  sourceVideo: "slots.sourceVideo",
  refImage: "slots.refImage",
  firstFrame: "slots.firstFrame",
  videoMask: "slots.videoMask",
  maskImage: "slots.maskImage",
  audio: "slots.audio"
});
function referenceInputText(_0x245c9d, _0x3629aa = {}) {
  return t("videoNode.referenceInput." + _0x245c9d, _0x3629aa);
}
function escapeHtmlText(_0x3cc24e) {
  return String(_0x3cc24e ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
function escapeHtmlAttr(_0x44263d) {
  return escapeHtmlText(_0x44263d).replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
function normalizeInputUrl(_0x12e78e = {}) {
  return String(_0x12e78e?.thumbUrl || _0x12e78e?.url || _0x12e78e?.displayUrl || _0x12e78e?.imageUrl || _0x12e78e?.videoUrl || _0x12e78e?.audioUrl || _0x12e78e?.localUrl || _0x12e78e?.localPath || "").trim();
}
export function getVideoFixedInputSlotLabelText(_0x193b14, _0x2fb3b2) {
  const _0x1a35b7 = String(_0x2fb3b2 || "").trim();
  const _0x3a566b = _0x193b14?.slotById?.[_0x1a35b7] || null;
  const _0x53543c = String(_0x193b14?.slotKindById?.[_0x1a35b7] || "").trim();
  const _0x1dfc93 = FIXED_REF_KIND_LABEL_KEYS[_0x53543c];
  const _0x436254 = FIXED_REF_SLOT_FALLBACK_LABEL_KEYS[_0x1a35b7];
  return String(_0x3a566b?.label || "").trim() || (_0x436254 ? referenceInputText(_0x436254) : "") || (_0x1dfc93 ? referenceInputText(_0x1dfc93) : "") || _0x1a35b7;
}
export function createVideoPromptEditorElements({
  documentObject = globalThis.document,
  promptHtml = "",
  placeholder = ""
} = {}) {
  const _0x2cffcc = documentObject.createElement("div");
  _0x2cffcc.className = "prompt-input-wrapper";
  _0x2cffcc.classList.add("is-resizable");
  const _0x457d30 = documentObject.createElement("div");
  _0x457d30.className = "prompt-textarea custom-textarea";
  _0x457d30.contentEditable = "true";
  _0x457d30.spellcheck = false;
  _0x457d30.dataset.placeholder = String(placeholder || "");
  _0x457d30.innerHTML = String(promptHtml || "");
  _0x2cffcc.appendChild(_0x457d30);
  return {
    inputWrap: _0x2cffcc,
    promptEl: _0x457d30
  };
}
export function renderVideoPromptEditorMarkup({
  promptHtml = "",
  placeholder = "",
  attributes = ""
} = {}) {
  const _0x4c98c0 = sanitizePromptHtml(String(promptHtml || ""));
  const _0x2a339b = String(attributes || "").trim();
  return "<div class=\"prompt-input-wrapper is-resizable\"><div class=\"prompt-textarea custom-textarea\" contenteditable=\"true\" spellcheck=\"false\" data-placeholder=\"" + escapeHtmlAttr(placeholder) + "\"" + (_0x2a339b ? " " + _0x2a339b : "") + ">" + _0x4c98c0 + "</div></div>";
}
function createReferenceMediaMarkup(_0x139ee8, _0x288825) {
  const _0x364567 = normalizeInputUrl(_0x288825);
  if (_0x139ee8 === "image" && _0x364567) {
    return createReferenceInputThumbnailHtml({
      kind: _0x139ee8,
      thumbnailUrl: _0x364567
    });
  }
  if (_0x139ee8 === "video" && _0x364567) {
    const _0x5ed6c0 = String(_0x288825?.thumbUrl || "").trim();
    if (_0x5ed6c0) {
      return createReferenceInputThumbnailHtml({
        kind: _0x139ee8,
        thumbnailUrl: _0x5ed6c0
      });
    }
  }
  return createReferenceInputThumbnailHtml({
    kind: _0x139ee8 || "image"
  });
}
function createReferenceDeleteButtonMarkup(_0x49f8c9, {
  action = "",
  value = "",
  showTitle = true
} = {}) {
  const _0xd9a552 = String(action || "").trim();
  const _0x14b613 = _0xd9a552 ? " data-ref-remove-action=\"" + escapeHtmlAttr(_0xd9a552) + "\" data-ref-remove-value=\"" + escapeHtmlAttr(value) + "\"" : "";
  const _0x30e3ce = showTitle ? " title=\"" + escapeHtmlAttr(referenceInputText("removeReference")) + "\"" : "";
  return "<button type=\"button\" class=\"ref-thumb-delete\"" + _0x14b613 + _0x30e3ce + " aria-label=\"" + escapeHtmlAttr(referenceInputText("removeReference") + " " + _0x49f8c9) + "\">&times;</button>";
}
export function renderVideoFixedInputSlotMarkup({
  fixedInputConfig: _0x3add38,
  slot: _0xefb708,
  input = null,
  readOnly = false,
  showTitle = true
} = {}) {
  const _0x29b9c0 = String(_0xefb708 || "").trim();
  const _0x27d5eb = String(_0x3add38?.slotKindById?.[_0x29b9c0] || "").trim();
  const _0x199655 = getVideoFixedInputSlotLabelText(_0x3add38, _0x29b9c0);
  const _0x4fd2f6 = showTitle ? " title=\"" + escapeHtmlAttr(_0x199655) + "\"" : "";
  const _0x3a65e7 = "data-slot=\"" + escapeHtmlAttr(_0x29b9c0) + "\" data-kind=\"" + escapeHtmlAttr(_0x27d5eb) + "\"" + _0x4fd2f6;
  if (!input || !normalizeInputUrl(input)) {
    if (readOnly) {
      return "<div class=\"ref-thumb-wrap ref-upload-slot rh-v5-ref-box ref-thumb-wrap--readonly is-empty\" " + _0x3a65e7 + " role=\"img\" aria-label=\"" + escapeHtmlAttr(_0x199655) + "\"><span class=\"ref-upload-label\">" + formatInputSlotLabelHtml(_0x199655) + "</span></div>";
    }
    return "<button type=\"button\" class=\"ref-thumb-wrap ref-upload-slot rh-v5-ref-box\" " + _0x3a65e7 + "><span class=\"ref-upload-label\">" + formatInputSlotLabelHtml(_0x199655) + "</span></button>";
  }
  if (readOnly) {
    return renderReadOnlyReferenceItem({
      ...input,
      kind: _0x27d5eb,
      slotId: _0x29b9c0,
      name: _0x199655,
      showTitle: showTitle
    });
  }
  return "<div class=\"ref-thumb-wrap rh-v5-ref-box\" " + _0x3a65e7 + " data-ref-origin=\"asset\">" + createReferenceMediaMarkup(_0x27d5eb, input) + createReferenceDeleteButtonMarkup(_0x199655, {
    showTitle: showTitle
  }) + "</div>";
}
export function renderVideoFixedInputSlotsMarkup({
  fixedInputConfig: _0x3025e7,
  inputsBySlot = {},
  readOnly = false,
  readOnlySlots = [],
  showTitles = true
} = {}) {
  const _0x221461 = new Set(Array.isArray(readOnlySlots) ? readOnlySlots.map(_0x51d1ad => String(_0x51d1ad || "").trim()).filter(Boolean) : []);
  return (Array.isArray(_0x3025e7?.visibleSlots) ? _0x3025e7.visibleSlots : []).map(_0x4bbcd9 => renderVideoFixedInputSlotMarkup({
    fixedInputConfig: _0x3025e7,
    slot: _0x4bbcd9,
    input: inputsBySlot?.[_0x4bbcd9] || null,
    readOnly: readOnly || _0x221461.has(String(_0x4bbcd9 || "").trim()),
    showTitle: showTitles
  })).join("");
}
function renderGenericReferenceItem(_0x106c4e, _0x2fb2ca, {
  showTitle = true
} = {}) {
  const _0x2f05dd = String(_0x106c4e?.kind || "image").trim();
  const _0x2df481 = String(_0x106c4e?.name || _0x106c4e?.label || _0x2f05dd + " " + (_0x2fb2ca + 1)).trim();
  const _0x107391 = String(_0x106c4e?.slotId || _0x2f05dd + "-" + (_0x2fb2ca + 1)).trim();
  return "<div class=\"ref-thumb-wrap\" data-slot=\"" + escapeHtmlAttr(_0x107391) + "\" data-kind=\"" + escapeHtmlAttr(_0x2f05dd) + "\" data-ref-origin=\"asset\">" + createReferenceMediaMarkup(_0x2f05dd, _0x106c4e) + createReferenceDeleteButtonMarkup(_0x2df481, {
    showTitle: showTitle
  }) + "</div>";
}
function renderReadOnlyReferenceItem(_0x52936a, _0x59d046) {
  const _0x375cf6 = String(_0x52936a?.kind || _0x52936a?.type || "image").trim();
  const _0x5025eb = String(_0x52936a?.name || _0x52936a?.label || _0x375cf6 + " " + (_0x59d046 + 1)).trim();
  const _0x5dd4a6 = String(_0x52936a?.slotId || _0x52936a?.slot || "").trim();
  const _0x23d4ac = String(_0x52936a?.removeAction || "").trim();
  const _0x4b7d05 = String(_0x52936a?.removeValue || "");
  const _0x4d79ac = _0x52936a?.showTitle !== false;
  const _0x24655f = _0x375cf6 + ":" + String(_0x52936a?.url || normalizeInputUrl(_0x52936a)).trim();
  const _0x45be58 = _0x4d79ac ? " title=\"" + escapeHtmlAttr(_0x5025eb) + "\"" : "";
  return "<div class=\"ref-thumb-wrap ref-thumb-wrap--readonly\"" + (_0x5dd4a6 ? " data-slot=\"" + escapeHtmlAttr(_0x5dd4a6) + "\"" : "") + " data-kind=\"" + escapeHtmlAttr(_0x375cf6) + "\" data-ref-origin=\"asset\" data-ref-readonly-key=\"" + escapeHtmlAttr(_0x24655f) + "\" role=\"" + (_0x23d4ac ? "group" : "img") + "\" aria-label=\"" + escapeHtmlAttr(_0x5025eb) + "\"" + _0x45be58 + ">" + createReferenceMediaMarkup(_0x375cf6, _0x52936a) + (_0x23d4ac ? createReferenceDeleteButtonMarkup(_0x5025eb, {
    action: _0x23d4ac,
    value: _0x4b7d05,
    showTitle: _0x4d79ac
  }) : "") + "</div>";
}
function renderReadOnlyReferenceInputsMarkup(_0x340964 = [], {
  showTitles = true
} = {}) {
  const _0x5f23ce = Array.isArray(_0x340964) ? _0x340964.filter(_0x1d7a06 => normalizeInputUrl(_0x1d7a06)) : [];
  if (!_0x5f23ce.length) {
    return "";
  }
  return "<div class=\"ref-thumb-container ref-thumb-container--readonly\">" + _0x5f23ce.map((_0x5a45be, _0x26251d) => renderReadOnlyReferenceItem({
    ..._0x5a45be,
    showTitle: showTitles && _0x5a45be?.showTitle !== false
  }, _0x26251d)).join("") + "</div>";
}
export function renderVideoReferenceBarContentMarkup({
  fixedInputConfig = null,
  inputsBySlot = {},
  readOnlyFixedInputs = false,
  readOnlyFixedInputSlots = [],
  inputs = [],
  readOnlyInputs = [],
  showItemTitles = true,
  attachmentButtonHtml = createPromptAttachmentButtonHTML({
    stroke: "var(--white-90)"
  })
} = {}) {
  const _0x4fae8c = renderReadOnlyReferenceInputsMarkup(readOnlyInputs, {
    showTitles: showItemTitles
  });
  if (fixedInputConfig?.visibleSlots?.length) {
    const _0x1fdf2f = String(fixedInputConfig?.manifest?.displayName || "").trim() || String(fixedInputConfig?.manifest?.label || "").trim() || referenceInputText("fixedInputs");
    return attachmentButtonHtml + " <div class=\"ref-thumb-container rh-v5-ref-container\" aria-label=\"" + escapeHtmlAttr(referenceInputText("fixedInputsAria", {
      label: _0x1fdf2f
    })) + "\">" + renderVideoFixedInputSlotsMarkup({
      fixedInputConfig: fixedInputConfig,
      inputsBySlot: inputsBySlot,
      readOnly: readOnlyFixedInputs,
      readOnlySlots: readOnlyFixedInputSlots,
      showTitles: showItemTitles
    }) + "</div>" + _0x4fae8c;
  }
  const _0x2f5271 = Array.isArray(inputs) ? inputs.filter(_0x4539fb => normalizeInputUrl(_0x4539fb)) : [];
  if (!_0x2f5271.length) {
    return "" + attachmentButtonHtml + _0x4fae8c;
  }
  return attachmentButtonHtml + " <div class=\"ref-thumb-container\">" + _0x2f5271.map((_0x295561, _0x2a67b5) => renderGenericReferenceItem(_0x295561, _0x2a67b5, {
    showTitle: showItemTitles
  })).join("") + "</div>" + _0x4fae8c;
}
export function renderVideoReferenceBarMarkup(_0x220827 = {}) {
  const _0x4fdc69 = Boolean(_0x220827?.fixedInputConfig?.visibleSlots?.length);
  const _0x5c4ac9 = Array.isArray(_0x220827?.inputs) && _0x220827.inputs.some(_0x1084f9 => normalizeInputUrl(_0x1084f9));
  const _0x59287c = Array.isArray(_0x220827?.readOnlyInputs) && _0x220827.readOnlyInputs.some(_0x3890b7 => normalizeInputUrl(_0x3890b7));
  const _0x279e67 = _0x4fdc69 ? "node-ref-bar active rh-v5-refbar" : _0x5c4ac9 || _0x59287c ? "node-ref-bar active" : "node-ref-bar";
  return "<div class=\"" + _0x279e67 + "\">" + renderVideoReferenceBarContentMarkup(_0x220827) + "</div>";
}