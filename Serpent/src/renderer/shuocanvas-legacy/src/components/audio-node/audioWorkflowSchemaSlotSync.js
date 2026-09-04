import { RH_AI_APP_PERSISTENT_ADVANCED_CLASS } from "../shared/rhAiAppNodeBehavior.js";
import { bindModelUiSchemaControls, syncModelUiSchemaControls } from "../aigenImage/uiSchemaRenderer.js";
import { applyAudioWorkflowFooterSchemaControls, updateAudioModelTriggerIcon } from "./audioFooterSchemaSlots.js";
function getWorkflowKey(_0x3b56b8 = {}) {
  return String(_0x3b56b8?.key || _0x3b56b8?.modelId || "").trim();
}
export function collectAudioWorkflowSchemaSlotElements(_0x50bb79) {
  return {
    modelTrigger: _0x50bb79?.querySelector?.(".img-model-btn-trigger") || null,
    modeSlot: _0x50bb79?.querySelector?.(".ui-schema-mode-slot") || null,
    instanceSlot: _0x50bb79?.querySelector?.(".ui-schema-instance-slot") || null,
    advancedPanel: _0x50bb79?.querySelector?.(".rh-adv-panel") || null,
    advancedWrap: _0x50bb79?.querySelector?.(".rh-adv-wrap") || null,
    advancedButton: _0x50bb79?.querySelector?.(".rh-adv-btn") || null
  };
}
export function closeAudioWorkflowAdvancedPanel(_0x1db5e5 = {}) {
  if (_0x1db5e5?.advancedPanel?.classList?.contains?.(RH_AI_APP_PERSISTENT_ADVANCED_CLASS)) {
    _0x1db5e5.advancedPanel.classList.add("show");
    _0x1db5e5?.advancedButton?.classList?.remove?.("active");
    return;
  }
  _0x1db5e5?.advancedPanel?.classList?.remove?.("show");
  _0x1db5e5?.advancedButton?.classList?.remove?.("active");
}
export function bindAudioWorkflowSchemaSlotControls({
  footer: _0x3b9a10,
  nodeId: _0xcf61e9,
  nodeData: _0x413924,
  store: _0x455994
} = {}) {
  return bindModelUiSchemaControls(_0x3b9a10, {
    nodeId: _0xcf61e9,
    nodeData: _0x413924,
    store: _0x455994
  });
}
export function syncAudioWorkflowSchemaSlots({
  root: _0x19e25e,
  workflow: _0xfc7f7a,
  nodeData = {},
  elements = {},
  lastRenderedWorkflowKey = ""
} = {}) {
  const _0x109578 = getWorkflowKey(_0xfc7f7a);
  const _0xc970b9 = !!_0x109578 && lastRenderedWorkflowKey !== _0x109578;
  if (_0xc970b9) {
    applyAudioWorkflowFooterSchemaControls({
      workflow: _0xfc7f7a,
      nodeData: nodeData,
      modeSlot: elements?.modeSlot,
      advancedPanel: elements?.advancedPanel,
      advancedWrap: elements?.advancedWrap,
      advancedButton: elements?.advancedButton,
      instanceSlot: elements?.instanceSlot
    });
    updateAudioModelTriggerIcon(elements?.modelTrigger, _0xfc7f7a);
  }
  syncModelUiSchemaControls(_0x19e25e, nodeData);
  return {
    rebuilt: _0xc970b9,
    lastRenderedWorkflowKey: _0xc970b9 ? _0x109578 : lastRenderedWorkflowKey
  };
}