import { shouldAlwaysShowImageRefBar } from "./imageNodeManifestPolicies.js";
export function createAIGenerateNodeSelectionStateModule({
  store: _0x557cad
} = {}) {
  class _0x73c16 {
    syncSelectionState({
      selected = false,
      visible = true
    } = {}) {
      const _0x50623f = typeof _0x557cad?.getStateRaw === "function" ? _0x557cad.getStateRaw() : _0x557cad?.getState?.() || {};
      const _0x17b0fb = _0x50623f?.pickConnectMode || {};
      const _0x891bf5 = selected === true || _0x17b0fb.active && _0x17b0fb.sourceNodeId === this.nodeId || shouldAlwaysShowImageRefBar(this._data?.model);
      if (visible !== true || this._rendererMediaDeferred === true || !_0x891bf5) {
        this._renderRefBarPendingWhenVisible = true;
        return false;
      }
      if (this._renderRefBarPendingWhenVisible !== true) {
        return false;
      }
      this._renderRefBarPendingWhenVisible = false;
      this._renderRefBar();
      return true;
    }
  }
  return _0x73c16.prototype;
}