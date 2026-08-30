import { selectWorkspaceState } from "./domainSlices.js";
const WORKSPACE_ACTION_NAMES = Object.freeze(["batch", "requestRender", "invalidateUi", "setSubscriptionState", "setModelCatalogState", "addAsset", "deleteAsset", "updateAsset", "upsertStoryboard3DProject", "deleteStoryboard3DProject", "setWorkflowsLoading", "setWorkflows", "upsertWorkflow", "updateWorkflowLocal", "markWorkflowUsed", "setWorkflowUi", "setWorkflowDraft", "resetWorkflowDraft", "openWorkflowModal", "closeWorkflowModal", "setWorkflowSaving", "setWorkflowApplying"]);
function bindCoreAction(_0x256185, _0x25e97d) {
  const _0x2bdd32 = _0x256185?.[_0x25e97d];
  if (typeof _0x2bdd32 !== "function") {
    return undefined;
  }
  return (..._0xfefcbe) => _0x2bdd32(..._0xfefcbe);
}
function createWorkspaceStore(_0x5dee73) {
  if (!_0x5dee73 || typeof _0x5dee73 !== "object") {
    throw new TypeError("[workspaceStore] createWorkspaceStore() 需要传入有效的 coreStore");
  }
  const _0x4d6655 = {
    subscribe(_0x329b39) {
      if (typeof _0x329b39 !== "function") {
        throw new TypeError("[workspaceStore] subscribe() 的参数必须是函数");
      }
      return _0x5dee73.subscribe(_0x227c9e => _0x329b39(selectWorkspaceState(_0x227c9e)));
    },
    subscribeRaw(_0x47c68b) {
      if (typeof _0x47c68b !== "function") {
        throw new TypeError("[workspaceStore] subscribeRaw() 的参数必须是函数");
      }
      return _0x5dee73.subscribeRaw(_0x1e9a69 => _0x47c68b(selectWorkspaceState(_0x1e9a69)));
    },
    subscribeSelector(_0x49d6d4, _0x5ae1c9, _0x1a0834 = {}) {
      if (typeof _0x49d6d4 !== "function") {
        throw new TypeError("[workspaceStore] subscribeSelector() 的 selector 必须是函数");
      }
      if (typeof _0x5ae1c9 !== "function") {
        throw new TypeError("[workspaceStore] subscribeSelector() 的 callback 必须是函数");
      }
      return _0x5dee73.subscribeSelector(_0x2f2d91 => _0x49d6d4(selectWorkspaceState(_0x2f2d91)), _0x5ae1c9, _0x1a0834);
    },
    getState() {
      return selectWorkspaceState(_0x5dee73.getState());
    },
    getStateRaw() {
      return selectWorkspaceState(_0x5dee73.getStateRaw());
    }
  };
  for (const _0x404bc0 of WORKSPACE_ACTION_NAMES) {
    const _0x3c2060 = bindCoreAction(_0x5dee73, _0x404bc0);
    if (_0x3c2060) {
      _0x4d6655[_0x404bc0] = _0x3c2060;
    }
  }
  return _0x4d6655;
}
export { WORKSPACE_ACTION_NAMES, createWorkspaceStore };