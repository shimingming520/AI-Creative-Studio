import { selectGraphState } from "./domainSlices.js";
const GRAPH_ACTION_NAMES = Object.freeze(["batch", "requestRender", "invalidateUi", "addNode", "updateNodePosition", "moveNodes", "moveNodesByOffsets", "deleteNodes", "updateNodeData", "updateNodesData", "swapStoryboardCells", "addEdge", "removeEdge", "updateEdgesBatch", "updateViewport", "setViewportScreenOrigin", "setViewportPersistPolicy", "markViewportPersist", "loadState", "loadHistorySnapshot", "getHistorySnapshot", "getSourcesForNode", "setSelectionBox", "setSelectionMeta", "setSelectedNodes", "groupNodes", "getIncomingEdges", "renameNode", "clearSelection", "setConnOverlay", "clearConnOverlay", "serialize", "hydrate", "hydrateTrustedSnapshot"]);
function bindCoreAction(_0x129270, _0x269af6) {
  const _0x31e850 = _0x129270?.[_0x269af6];
  if (typeof _0x31e850 !== "function") {
    return undefined;
  }
  return (..._0x5d1ab7) => _0x31e850(..._0x5d1ab7);
}
function createGraphStore(_0x58cd60) {
  if (!_0x58cd60 || typeof _0x58cd60 !== "object") {
    throw new TypeError("[graphStore] createGraphStore() 需要传入有效的 coreStore");
  }
  const _0xcbd73b = {
    subscribe(_0x5b2d36) {
      if (typeof _0x5b2d36 !== "function") {
        throw new TypeError("[graphStore] subscribe() 的参数必须是函数");
      }
      return _0x58cd60.subscribe(_0x466cbd => _0x5b2d36(selectGraphState(_0x466cbd)));
    },
    subscribeRaw(_0x50fa06) {
      if (typeof _0x50fa06 !== "function") {
        throw new TypeError("[graphStore] subscribeRaw() 的参数必须是函数");
      }
      return _0x58cd60.subscribeRaw(_0x14db35 => _0x50fa06(selectGraphState(_0x14db35)));
    },
    subscribeSelector(_0x244857, _0x22668d, _0x568848 = {}) {
      if (typeof _0x244857 !== "function") {
        throw new TypeError("[graphStore] subscribeSelector() 的 selector 必须是函数");
      }
      if (typeof _0x22668d !== "function") {
        throw new TypeError("[graphStore] subscribeSelector() 的 callback 必须是函数");
      }
      return _0x58cd60.subscribeSelector(_0x3a19bd => _0x244857(selectGraphState(_0x3a19bd)), _0x22668d, _0x568848);
    },
    getState() {
      return selectGraphState(_0x58cd60.getState());
    },
    getStateRaw() {
      return selectGraphState(_0x58cd60.getStateRaw());
    }
  };
  for (const _0x7c4fcc of GRAPH_ACTION_NAMES) {
    const _0x3ad97a = bindCoreAction(_0x58cd60, _0x7c4fcc);
    if (_0x3ad97a) {
      _0xcbd73b[_0x7c4fcc] = _0x3ad97a;
    }
  }
  return _0xcbd73b;
}
export { GRAPH_ACTION_NAMES, createGraphStore };