import { showContextMenu } from "./interaction/contextMenuPresenter.js";
import { TEXT_CONTEXT_MENU_TARGET_SELECTOR } from "./textInputContextMenu.js";
export function buildAudioVoiceSegmentMenuEntries({
  hasConverted = false,
  hasSource = false,
  usingConverted = false,
  text: _0xb9cc95
} = {}) {
  return [{
    action: "use-converted",
    label: _0xb9cc95("menu.useGenerated"),
    disabled: !hasConverted,
    checked: usingConverted
  }, {
    action: "use-source",
    label: _0xb9cc95("menu.useSource"),
    disabled: !hasSource,
    checked: !usingConverted
  }, {
    action: "download-source",
    label: _0xb9cc95("menu.downloadSource"),
    disabled: !hasSource
  }, {
    action: "download-converted",
    label: _0xb9cc95("menu.downloadConverted"),
    disabled: !hasConverted
  }, {
    action: "remove",
    label: _0xb9cc95("menu.remove"),
    disabled: false,
    danger: true
  }];
}
export function buildAudioVoiceSegmentContextMenuItems({
  entries = [],
  modelOptions = [],
  selectedModelId = "",
  imitateToneAvailable = false,
  imitateToneEnabled = false,
  text: _0x228bc0,
  onAction = null
} = {}) {
  const _0x19d2b2 = (_0x4f1d31, _0x3f26a5 = {}) => () => onAction?.(_0x4f1d31, _0x3f26a5);
  const _0x52192a = [];
  if (imitateToneAvailable) {
    _0x52192a.push({
      label: _0x228bc0("actions.imitateTone"),
      checked: imitateToneEnabled,
      action: _0x19d2b2("toggle-imitate-tone")
    });
  }
  _0x52192a.push({
    label: _0x228bc0("actions.segmentModel"),
    subItems: [{
      label: _0x228bc0("actions.useGlobalModel"),
      checked: !selectedModelId,
      action: _0x19d2b2("select-segment-model", {
        modelId: ""
      })
    }, ...modelOptions.map(_0x138a9b => ({
      label: _0x138a9b.label || _0x138a9b.id,
      checked: _0x138a9b.id === selectedModelId,
      action: _0x19d2b2("select-segment-model", {
        modelId: _0x138a9b.id
      })
    }))]
  });
  entries.forEach(_0x1e9563 => {
    if (_0x1e9563.action === "remove") {
      _0x52192a.push("sep");
    }
    _0x52192a.push({
      label: _0x1e9563.label,
      checked: _0x1e9563.checked,
      disabled: _0x1e9563.disabled === true,
      danger: _0x1e9563.danger,
      action: _0x19d2b2(_0x1e9563.action)
    });
  });
  return _0x52192a;
}
export function createAudioVoiceSegmentContextMenuController({
  panel: _0x143afe,
  getSegment: _0x45b0c7,
  buildItems: _0x3d566f,
  onAction: _0x4c9354,
  closeInlineMenus: _0x1ffb89
} = {}) {
  let _0x507a69 = null;
  const _0x245eca = () => {
    _0x507a69?.close?.();
    _0x507a69 = null;
  };
  const _0x3d53e0 = _0x505c32 => {
    if (_0x505c32.defaultPrevented || _0x505c32.target?.closest?.(TEXT_CONTEXT_MENU_TARGET_SELECTOR + ", .audio-voice-more-menu, .audio-voice-model-submenu")) {
      return;
    }
    const _0x232b2a = _0x505c32.target?.closest?.(".audio-voice-segment-card");
    const _0xe42f2f = _0x232b2a ? _0x45b0c7?.(_0x232b2a.dataset.segmentId || "") : null;
    const _0x32dcb2 = String(_0xe42f2f?.id || "").trim();
    if (!_0x32dcb2) {
      return;
    }
    const _0x30dad6 = _0x3d566f(_0xe42f2f, (_0x259c1f, _0xcec1bd = {}) => {
      _0x4c9354?.(_0x259c1f, _0x32dcb2, {
        dataset: _0xcec1bd,
        closest: () => null,
        setAttribute: () => {}
      }, _0x505c32);
    });
    _0x505c32.preventDefault?.();
    _0x505c32.stopPropagation?.();
    _0x1ffb89?.();
    _0x245eca();
    _0x507a69 = showContextMenu(Number(_0x505c32.clientX) || 0, Number(_0x505c32.clientY) || 0, _0x30dad6, {
      className: "v2-canvas-ctx-menu audio-voice-segment-context-menu",
      ownerElement: _0x232b2a,
      ownerRoot: _0x143afe
    });
  };
  _0x143afe?.addEventListener?.("contextmenu", _0x3d53e0);
  return {
    close: _0x245eca,
    destroy() {
      _0x245eca();
      _0x143afe?.removeEventListener?.("contextmenu", _0x3d53e0);
    }
  };
}