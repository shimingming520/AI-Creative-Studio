import { renderModelUiSchemaControls } from "../aigenImage/uiSchemaRenderer.js";
import { getModelManifest } from "../../manifests/index.js";
import { RH_AI_APP_PERSISTENT_ADVANCED_CLASS, isCustomAiAppManifest, isRunningHubAiAppManifest, resolveCustomAiAppNodeManifest } from "../shared/rhAiAppNodeBehavior.js";
import { buildAudioModelMenuHtml, buildAudioModelTriggerHtml } from "./audioModelMenuHelpers.js";
export function isRunningHubAudioWorkflowItem(_0x75e61c = {}) {
  const _0x67a73f = String(_0x75e61c?.provider || "").trim().toLowerCase();
  const _0x5d3791 = String(_0x75e61c?.adapterType || "").trim().toLowerCase();
  return _0x67a73f === "runninghubwf" && _0x5d3791 === "workflow";
}
function getAudioWorkflowManifest(_0x140d0c = {}, _0x5f2a74 = {}) {
  const _0x1dbd38 = String(_0x140d0c?.key || _0x140d0c?.modelId || "").trim();
  return resolveCustomAiAppNodeManifest({
    ..._0x5f2a74,
    model: _0x1dbd38,
    provider: _0x140d0c?.provider || _0x5f2a74?.provider
  }) || getModelManifest(_0x1dbd38);
}
function renderAudioWorkflowSchemaControl(_0x32322f, _0x1b3392, _0x1705cb = {}) {
  const _0x3446b2 = String(_0x32322f?.key || _0x32322f?.modelId || "").trim();
  if (!_0x3446b2) {
    return "";
  }
  return renderModelUiSchemaControls(_0x3446b2, _0x1b3392, _0x1705cb);
}
export function isRhAiAppAudioWorkflow(_0x52ecf3 = {}, _0x20c899 = {}) {
  return isRunningHubAiAppManifest(getAudioWorkflowManifest(_0x52ecf3, _0x20c899));
}
function isCustomAiAppAudioWorkflow(_0x3b58da = {}, _0x4f019f = {}) {
  return isCustomAiAppManifest(getAudioWorkflowManifest(_0x3b58da, _0x4f019f));
}
export function renderAudioWorkflowFooterSchemaControls(_0x174a0f, _0x5abd8c = {}) {
  return {
    mode: renderAudioWorkflowSchemaControl(_0x174a0f, _0x5abd8c, {
      placement: "mode"
    }),
    advanced: renderAudioWorkflowSchemaControl(_0x174a0f, _0x5abd8c, {
      placement: "advanced"
    }),
    instance: isRunningHubAudioWorkflowItem(_0x174a0f) ? renderAudioWorkflowSchemaControl(_0x174a0f, _0x5abd8c, {
      placement: "instance",
      variant: "instanceToggle"
    }) : ""
  };
}
export function buildAudioWorkflowFooterHtml({
  workflow: _0x3163dc,
  nodeData = {},
  workflowItems = [],
  labels = {},
  debugIconHtml = ""
} = {}) {
  const {
    mode: _0x283855,
    advanced: _0x6f603,
    instance: _0x568915
  } = renderAudioWorkflowFooterSchemaControls(_0x3163dc, nodeData);
  const _0x50543c = isRhAiAppAudioWorkflow(_0x3163dc, nodeData);
  const _0xc5b583 = isCustomAiAppAudioWorkflow(_0x3163dc, nodeData);
  const _0x62051b = buildAudioModelMenuHtml({
    activeModel: _0x3163dc?.key,
    workflowItems: workflowItems
  });
  return "\n          <div class=\"img-model-pills\">\n            <div class=\"img-model-wrap\" style=\"position:relative;\">\n              " + buildAudioModelTriggerHtml({
    label: _0x3163dc?.label,
    activeProvider: _0x3163dc?.provider || "",
    icon: _0x3163dc?.icon || "",
    iconAlt: _0x3163dc?.iconAlt || "",
    iconHtml: _0x3163dc?.iconHtml || ""
  }) + "\n              " + _0x62051b + "\n            </div>\n            <div class=\"ui-schema-placement ui-schema-mode-slot\" style=\"" + (_0x283855 ? "" : "display:none;") + "\">\n              " + _0x283855 + "\n            </div>\n          </div>\n          <div class=\"prompt-actions\">\n            <div class=\"rh-adv-wrap\" style=\"position:relative;" + (_0x6f603 && !_0x50543c ? "" : "display:none;") + "\">\n              <button type=\"button\" class=\"img-pill-btn rh-adv-btn\">\n                <span class=\"rh-adv-btn-label\">" + (labels.advanced || "高级设置") + "</span>\n              </button>\n            </div>\n            <button type=\"button\" class=\"prompt-submit debug-wrench-btn\" title=\"" + (labels.debugTitle || "") + "\">\n              " + debugIconHtml + "\n            </button>\n            <div class=\"ui-schema-placement ui-schema-instance-slot\" style=\"" + (_0x568915 ? "" : "display:none;") + "\">\n              " + _0x568915 + "\n            </div>\n            <button type=\"button\" class=\"prompt-submit img-gen-btn\" title=\"" + (labels.generateTitle || "") + "\">\n              <svg width=\"14\" height=\"14\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><line x1=\"12\" y1=\"19\" x2=\"12\" y2=\"5\"/><polyline points=\"5 12 12 5 19 12\"/></svg>\n            </button>\n          </div>\n          <div class=\"rh-adv-panel" + (_0xc5b583 && _0x6f603 ? " show " + RH_AI_APP_PERSISTENT_ADVANCED_CLASS : "") + "\">\n            " + _0x6f603 + "\n          </div>";
}
function updateHtmlSlot(_0x287270, _0x51c3e1) {
  if (!_0x287270) {
    return;
  }
  _0x287270.innerHTML = _0x51c3e1 || "";
  _0x287270.style.display = _0x51c3e1 ? "" : "none";
}
function setClassState(_0x1c484f, _0x23141d, _0xb416eb) {
  if (!_0x1c484f?.classList) {
    return;
  }
  if (typeof _0x1c484f.classList.toggle === "function") {
    _0x1c484f.classList.toggle(_0x23141d, _0xb416eb);
    return;
  }
  if (_0xb416eb) {
    _0x1c484f.classList.add?.(_0x23141d);
  } else {
    _0x1c484f.classList.remove?.(_0x23141d);
  }
}
export function applyAudioWorkflowFooterSchemaControls({
  workflow: _0x4ec6d1,
  nodeData = {},
  modeSlot: _0x1927c9,
  advancedPanel: _0x1629f8,
  advancedWrap: _0x81b300,
  advancedButton: _0x4e8360,
  instanceSlot: _0x323f87
} = {}) {
  const _0x5585ed = renderAudioWorkflowFooterSchemaControls(_0x4ec6d1, nodeData);
  const _0x483a3d = isRhAiAppAudioWorkflow(_0x4ec6d1, nodeData);
  const _0x160ab4 = isCustomAiAppAudioWorkflow(_0x4ec6d1, nodeData);
  updateHtmlSlot(_0x1927c9, _0x5585ed.mode);
  updateHtmlSlot(_0x323f87, _0x5585ed.instance);
  if (_0x1629f8) {
    _0x1629f8.innerHTML = _0x5585ed.advanced || "";
  }
  if (_0x1629f8) {
    setClassState(_0x1629f8, RH_AI_APP_PERSISTENT_ADVANCED_CLASS, _0x160ab4 && Boolean(_0x5585ed.advanced));
    if (_0x160ab4) {
      setClassState(_0x1629f8, "show", Boolean(_0x5585ed.advanced));
    } else if (_0x483a3d) {
      setClassState(_0x1629f8, "show", false);
    }
  }
  if (_0x81b300) {
    _0x81b300.style.display = _0x5585ed.advanced && !_0x483a3d ? "" : "none";
  }
  if (!_0x5585ed.advanced) {
    _0x1629f8?.classList?.remove?.("show");
    _0x4e8360?.classList?.remove?.("active");
  } else if (_0x483a3d) {
    _0x4e8360?.classList?.remove?.("active");
  }
  return _0x5585ed;
}
export function updateAudioModelTriggerIcon(_0x3b5313, _0x5d3068 = {}) {
  const _0x26d40d = String(_0x5d3068?.iconHtml || "").trim();
  if (_0x26d40d && _0x3b5313 && typeof document !== "undefined") {
    const _0x1381b7 = _0x3b5313?.querySelector?.(".img-model-label") || null;
    const _0x4896de = _0x3b5313?.querySelector?.(".node-menu-icon, .node-menu-icon-small, img");
    const _0xae0b40 = document.createElement("template");
    _0xae0b40.innerHTML = _0x26d40d;
    const _0x355b89 = _0xae0b40.content.firstElementChild;
    if (_0x355b89 && _0x1381b7) {
      _0x4896de?.remove?.();
      _0x3b5313.insertBefore(_0x355b89, _0x1381b7);
    }
    return;
  }
  const _0x4df370 = _0x3b5313?.querySelector?.("img");
  if (!_0x4df370) {
    return;
  }
  const _0x1abfd5 = String(_0x5d3068?.provider || "").trim();
  const _0x5c4dd8 = String(_0x5d3068?.icon || "").trim() || (_0x1abfd5 === "volcengine-speech" ? "images/volcengine.svg" : "images/RH.png");
  const _0x588c2c = String(_0x5d3068?.iconAlt || "").trim() || (_0x1abfd5 === "volcengine-speech" ? "volcengine-speech" : "runninghub");
  _0x4df370.setAttribute?.("src", _0x5c4dd8);
  _0x4df370.setAttribute?.("alt", _0x588c2c);
  _0x4df370.src = _0x5c4dd8;
  _0x4df370.alt = _0x588c2c;
}