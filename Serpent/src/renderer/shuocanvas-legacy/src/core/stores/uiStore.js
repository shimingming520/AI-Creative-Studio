import { selectUiState } from "./domainSlices.js";
const UI_ACTION_NAMES = Object.freeze(["batch", "requestRender", "invalidateUi", "showPicker", "hidePicker", "showContextMenu", "hideContextMenu", "setPickConnectMode", "setPickConnectHover", "setServerConnection", "setAnnotateState", "setMattingState", "setVideoKeyingState", "setVideoClipState", "setTheme", "toggleTheme", "initTheme", "setFeatureSelection", "getFeatureSelection", "initFeatureSelections", "setShowVideoMeta", "setShowSelectionMediaProperties", "setTitleFollowsCanvasZoom", "setPromptBoxResizeEnabled", "setPromptEnterBehavior", "setPromptAttachmentButtonHidden", "setVideoAudioDefaultEnabled", "setCanvasToolbarPlacement", "setNodeManagerPlacement", "setLeftSidebarAutoHideEnabled", "setBottomLeftBarAutoHideEnabled", "setImageVideoNodeResizeEnabled", "setImageToolbarLayout", "setVideoToolbarLayout", "setAlignFeatureEnabled", "setAlignFeatureTriggerMode", "setAlignDistributeGap", "setAlignPanelVisible", "setAlignPanelAnchorWorld", "setSnapGuidesEnabled", "setSelectionRelatedHighlightEnabled", "setSelectionRelatedHighlightColor", "setConnectionLinesVisible", "setConnectionLineStyle", "initUiPrefs"]);
function bindCoreAction(_0x1b0fca, _0xc19e8f) {
  const _0x53eccb = _0x1b0fca?.[_0xc19e8f];
  if (typeof _0x53eccb !== "function") {
    return undefined;
  }
  return (..._0x3e4983) => _0x53eccb(..._0x3e4983);
}
function createUiStore(_0x192313) {
  if (!_0x192313 || typeof _0x192313 !== "object") {
    throw new TypeError("[uiStore] createUiStore() 需要传入有效的 coreStore");
  }
  const _0xc84f99 = {
    subscribe(_0x1a00ac) {
      if (typeof _0x1a00ac !== "function") {
        throw new TypeError("[uiStore] subscribe() 的参数必须是函数");
      }
      return _0x192313.subscribe(_0x7cbb22 => _0x1a00ac(selectUiState(_0x7cbb22)));
    },
    subscribeRaw(_0x542706) {
      if (typeof _0x542706 !== "function") {
        throw new TypeError("[uiStore] subscribeRaw() 的参数必须是函数");
      }
      return _0x192313.subscribeRaw(_0x28c8ee => _0x542706(selectUiState(_0x28c8ee)));
    },
    subscribeSelector(_0x3daf7, _0x168750, _0x979b3d = {}) {
      if (typeof _0x3daf7 !== "function") {
        throw new TypeError("[uiStore] subscribeSelector() 的 selector 必须是函数");
      }
      if (typeof _0x168750 !== "function") {
        throw new TypeError("[uiStore] subscribeSelector() 的 callback 必须是函数");
      }
      return _0x192313.subscribeSelector(_0x2eae76 => _0x3daf7(selectUiState(_0x2eae76)), _0x168750, _0x979b3d);
    },
    getState() {
      return selectUiState(_0x192313.getState());
    },
    getStateRaw() {
      return selectUiState(_0x192313.getStateRaw());
    }
  };
  for (const _0x229d5e of UI_ACTION_NAMES) {
    const _0x50c2a6 = bindCoreAction(_0x192313, _0x229d5e);
    if (_0x50c2a6) {
      _0xc84f99[_0x229d5e] = _0x50c2a6;
    }
  }
  return _0xc84f99;
}
export { UI_ACTION_NAMES, createUiStore };