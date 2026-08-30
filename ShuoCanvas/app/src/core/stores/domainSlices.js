const GRAPH_STATE_KEYS = Object.freeze(["viewport", "nodes", "_nodeCount", "_nodesRev", "_nodeGeometryRev", "_sourceVideoRev", "_renderRequestRev", "_persistRev", "_edgesRev", "_parentToChildren", "edges", "selectionBox", "selectionMeta", "selectedNodeIds", "connOverlay"]);
const UI_STATE_KEYS = Object.freeze(["isServerConnected", "picker", "contextMenu", "pickConnectMode", "annotate", "matting", "videoKeying", "videoClip", "theme", "ui"]);
const WORKSPACE_STATE_KEYS = Object.freeze(["subscription", "modelCatalog", "assets", "storyboard3dProjects", "workflows", "workflowUi"]);
function pickStateKeys(_0x40f940, _0x175541) {
  if (!_0x40f940 || typeof _0x40f940 !== "object") {
    return {};
  }
  const _0x1f6ae6 = {};
  for (const _0x1946ae of _0x175541) {
    if (Object.prototype.hasOwnProperty.call(_0x40f940, _0x1946ae)) {
      _0x1f6ae6[_0x1946ae] = _0x40f940[_0x1946ae];
    }
  }
  return _0x1f6ae6;
}
function selectGraphState(_0x572a3f) {
  return pickStateKeys(_0x572a3f, GRAPH_STATE_KEYS);
}
function selectUiState(_0x4d6ff4) {
  return pickStateKeys(_0x4d6ff4, UI_STATE_KEYS);
}
function selectWorkspaceState(_0x4b84d3) {
  return pickStateKeys(_0x4b84d3, WORKSPACE_STATE_KEYS);
}
export { GRAPH_STATE_KEYS, UI_STATE_KEYS, WORKSPACE_STATE_KEYS, selectGraphState, selectUiState, selectWorkspaceState };