import a924_0x21449d from "../../core/stores/appStore.js";
import * as a924_0x3d6365 from "../../core/generationTaskRuntime.js";
import a924_0x5989de from "../../core/nodeRuntimeRegistry.js";
function resolveWindowObject(_0x4d8fc5) {
  if (_0x4d8fc5) {
    return _0x4d8fc5;
  }
  if (typeof window !== "undefined") {
    return window;
  }
  return null;
}
export function createCanvasCommandContext({
  store: _0x363d17 = a924_0x21449d,
  graphStore = _0x363d17,
  canvasNodeFlows = null,
  createNodeAtCursor = canvasNodeFlows?.createNodeAtCursor,
  buildNodeData = null,
  executeCommand = null,
  focusNodes = null,
  commit = null,
  getNodeDefaultSize = null,
  getAIGenerationDefaultSizeByType = null,
  getAIGenerationNodeSize = null,
  connectNodes = null,
  generationRuntime = a924_0x3d6365,
  nodeRuntimeRegistry: _0x2b1286 = a924_0x5989de,
  windowObject = undefined,
  nodeExport = null,
  mediaTools = null,
  clipboard = null,
  translate = null,
  showToast = null,
  scheduleFrame = null,
  commandRegistry = null,
  recordCommand = null,
  history = null
} = {}) {
  return {
    store: _0x363d17,
    graphStore: graphStore,
    canvasNodeFlows: canvasNodeFlows,
    createNodeAtCursor: createNodeAtCursor,
    buildNodeData: buildNodeData,
    executeCommand: executeCommand,
    focusNodes: focusNodes,
    commit: commit,
    getNodeDefaultSize: getNodeDefaultSize,
    getAIGenerationDefaultSizeByType: getAIGenerationDefaultSizeByType,
    getAIGenerationNodeSize: getAIGenerationNodeSize,
    connectNodes: connectNodes,
    generationRuntime: generationRuntime,
    nodeRuntimeRegistry: _0x2b1286,
    windowObject: resolveWindowObject(windowObject),
    nodeExport: nodeExport,
    mediaTools: mediaTools,
    clipboard: clipboard,
    translate: translate,
    showToast: showToast,
    scheduleFrame: scheduleFrame,
    commandRegistry: commandRegistry,
    recordCommand: recordCommand,
    history: history
  };
}