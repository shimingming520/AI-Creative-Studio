import { executeCanvasCommandPlan } from "../canvasCommands/index.js";
import { worldToScreen } from "../../core/math.js";
import { createAgentActionPostconditionHandler } from "./agentActionPostconditions.js";
import { normalizeAgentPrecreatedNode } from "./agentPrecreatedNode.js";
const NODE_CREATING_COMMANDS = new Set(["node.create", "node.createConnected", "node.duplicate", "collage.createFromSelection"]);
function normalizeAgentActionArgs(_0x44ca9e = {}, _0x5eabea = null, {
  precreateReservation = false
} = {}) {
  const _0x5d7cbb = _0x44ca9e.args && typeof _0x44ca9e.args === "object" && !Array.isArray(_0x44ca9e.args) ? {
    ..._0x44ca9e.args
  } : {};
  if (String(_0x44ca9e.type || _0x44ca9e.commandId || "").trim() !== "node.create") {
    if (String(_0x44ca9e.type || _0x44ca9e.commandId || "").trim() === "node.duplicate") {
      delete _0x5d7cbb.dx;
      delete _0x5d7cbb.dy;
      return {
        ..._0x5d7cbb,
        placement: "spawn-preferences"
      };
    }
    return _0x5d7cbb;
  }
  delete _0x5d7cbb.x;
  delete _0x5d7cbb.y;
  delete _0x5d7cbb.sequenceKey;
  delete _0x5d7cbb.reuseNodeId;
  delete _0x5d7cbb.agentReservation;
  const _0x20be41 = normalizeAgentPrecreatedNode(_0x5eabea);
  const _0x134507 = _0x20be41 && String(_0x5d7cbb.type || "").trim() === _0x20be41.type ? _0x20be41.nodeId : "";
  return {
    ..._0x5d7cbb,
    placement: "viewport-center-sequence",
    ...(_0x134507 ? {
      reuseNodeId: _0x134507
    } : {}),
    ...(precreateReservation ? {
      agentReservation: true
    } : {})
  };
}
function readCanvasState(_0x5b3c57 = {}) {
  const _0x1a5a6a = _0x5b3c57.store || _0x5b3c57.graphStore;
  return _0x1a5a6a?.getStateRaw?.() ?? _0x1a5a6a?.getState?.() ?? null;
}
function collectCreatedNodeResult(_0x521ebc = [], _0x3bde5a = []) {
  const _0x4b76cf = new Set();
  const _0x1670c8 = new Set();
  const _0x68f298 = new Set();
  const _0x1e4d72 = [];
  _0x521ebc.forEach((_0x2ebd78, _0x4bfa1a) => {
    const _0x3e75d3 = String(_0x2ebd78?.type || _0x2ebd78?.commandId || "").trim();
    if (!NODE_CREATING_COMMANDS.has(_0x3e75d3)) {
      return;
    }
    const _0x3e9b12 = _0x3bde5a[_0x4bfa1a];
    if (_0x3e9b12?.ok !== true) {
      return;
    }
    const _0xadedf7 = _0x3e9b12.result || {};
    if (_0xadedf7.reused === true) {
      const _0x38e4b0 = String(_0xadedf7.nodeId || _0xadedf7.node?.id || "").trim();
      if (_0x38e4b0) {
        _0x68f298.add(_0x38e4b0);
      }
    }
    const _0x214979 = _0x3e75d3 === "node.duplicate" ? [...(Array.isArray(_0xadedf7.nodeIds) ? _0xadedf7.nodeIds : []), ...(Array.isArray(_0xadedf7.ids) ? _0xadedf7.ids : [])] : [_0xadedf7.nodeId, _0xadedf7.node?.id];
    const _0x10686a = _0x4b76cf.size;
    _0x214979.forEach(_0x1bba6f => {
      const _0x494a9f = String(_0x1bba6f || "").trim();
      if (!_0x494a9f) {
        return;
      }
      _0x4b76cf.add(_0x494a9f);
      if (_0x3e75d3 !== "node.create") {
        _0x1670c8.add(_0x494a9f);
      }
    });
    if (_0x3e75d3 === "node.duplicate") {
      (Array.isArray(_0xadedf7.sourceIds) ? _0xadedf7.sourceIds : []).forEach(_0x425dd7 => {
        const _0x409923 = String(_0x425dd7 || "").trim();
        if (_0x409923) {
          _0x1670c8.add(_0x409923);
        }
      });
    }
    if (_0x4b76cf.size === _0x10686a) {
      _0x1e4d72.push(_0x3e75d3);
    }
  });
  return {
    nodeIds: [..._0x4b76cf],
    revealNodeIds: [..._0x1670c8],
    reusedNodeIds: [..._0x68f298],
    unresolvedCommandIds: _0x1e4d72
  };
}
function getAgentSidebarViewportInsets(_0x3af82f = {}) {
  const _0x37309d = _0x3af82f.windowObject || globalThis.window;
  const _0x53ec68 = _0x37309d?.document?.body;
  if (!_0x53ec68?.classList?.contains?.("agent-sidebar-open") || _0x53ec68.classList.contains("agent-sidebar-collapsed")) {
    return null;
  }
  const _0xb95ef = _0x37309d.document.querySelector?.(".agent-sidebar.is-open");
  const _0x142ad9 = Number(_0xb95ef?.getBoundingClientRect?.()?.width);
  if (Number.isFinite(_0x142ad9) && _0x142ad9 > 0) {
    return {
      right: _0x142ad9
    };
  } else {
    return null;
  }
}
function revealCreatedNodes(_0xb5107c = {}, _0x1fd29c = []) {
  if (typeof _0xb5107c.focusNodes !== "function" || _0x1fd29c.length === 0) {
    return;
  }
  const _0x3c8212 = getAgentSidebarViewportInsets(_0xb5107c);
  const _0x45e3a3 = () => _0xb5107c.focusNodes(_0x1fd29c, 96, 500, {
    maxZoom: 1,
    ...(_0x3c8212 ? {
      viewportInsets: _0x3c8212
    } : {})
  });
  if (typeof _0xb5107c.scheduleFrame === "function") {
    _0xb5107c.scheduleFrame(_0x45e3a3);
  } else {
    _0x45e3a3();
  }
}
function collectCreatedNodesOutsideVisibleCanvas(_0x47f5c8 = {}, _0x14868e = {}, _0x5301c1 = []) {
  const _0x932095 = _0x47f5c8.windowObject || globalThis.window;
  const _0x5aa4cc = Number(_0x932095?.innerWidth);
  const _0x1308f9 = Number(_0x932095?.innerHeight);
  if (!(_0x5aa4cc > 0) || !(_0x1308f9 > 0)) {
    return [];
  }
  const _0x649dd2 = getAgentSidebarViewportInsets(_0x47f5c8) || {};
  const _0xaa40c7 = Math.max(1, _0x5aa4cc - Math.max(0, Number(_0x649dd2.right) || 0));
  const _0x34cdbf = _0x14868e?.viewport || {
    x: 0,
    y: 0,
    zoom: 1
  };
  const _0x7bf4fd = Math.max(0.0001, Number(_0x34cdbf.zoom) || 1);
  const _0x3f5c25 = 16;
  return _0x5301c1.filter(_0x16cc91 => {
    const _0x535786 = _0x14868e?.nodes?.[_0x16cc91];
    if (!_0x535786) {
      return false;
    }
    const _0x3327ed = worldToScreen(Number(_0x535786.x) || 0, Number(_0x535786.y) || 0, _0x34cdbf);
    const _0x4a9280 = Math.max(1, Number(_0x535786.width) || 160) * _0x7bf4fd;
    const _0x4cb73b = Math.max(1, Number(_0x535786.height) || 120) * _0x7bf4fd;
    return _0x3327ed.x < _0x3f5c25 || _0x3327ed.y < _0x3f5c25 || _0x3327ed.x + _0x4a9280 > _0xaa40c7 - _0x3f5c25 || _0x3327ed.y + _0x4cb73b > _0x1308f9 - _0x3f5c25;
  });
}
export async function executeAgentActions(_0x1791ef = [], {
  commandContext = {},
  executePlan = executeCanvasCommandPlan,
  executeCommand: _0x10924f,
  initialScope = {},
  shouldContinue = null,
  createNodeSequenceKey = "",
  precreatedNode = null,
  precreateReservation = false
} = {}) {
  if (!Array.isArray(_0x1791ef)) {
    return {
      ok: false,
      status: "failed",
      errorCode: "INVALID_AGENT_ACTIONS",
      message: "Agent actions must be an array.",
      results: []
    };
  }
  const _0x2edb4a = _0x1791ef.map(_0x5866c8 => ({
    type: _0x5866c8.type,
    ...(_0x5866c8.alias || _0x5866c8.resultAlias || _0x5866c8.as ? {
      alias: _0x5866c8.alias || _0x5866c8.resultAlias || _0x5866c8.as
    } : {}),
    args: normalizeAgentActionArgs(_0x5866c8, precreatedNode, {
      precreateReservation: precreateReservation
    })
  }));
  const _0x663477 = await executePlan(_0x2edb4a, commandContext, {
    initialScope: initialScope,
    ...(typeof shouldContinue === "function" ? {
      shouldContinue: shouldContinue
    } : {}),
    ...(createNodeSequenceKey ? {
      createNodeSequenceKey: createNodeSequenceKey
    } : {}),
    afterAction: createAgentActionPostconditionHandler({
      commandContext: commandContext,
      ...(typeof _0x10924f === "function" ? {
        executeCommand: _0x10924f
      } : {}),
      shouldContinue: shouldContinue
    })
  });
  const _0x3601c1 = _0x663477?.result?.actions || [];
  const _0x391c9e = collectCreatedNodeResult(_0x2edb4a, _0x3601c1);
  const _0x400224 = _0x391c9e.nodeIds;
  const _0x21c21f = readCanvasState(commandContext);
  const _0x2941c5 = _0x21c21f?.nodes ? _0x400224.filter(_0xd16b78 => !_0x21c21f.nodes[_0xd16b78]) : [];
  if (_0x663477.ok === true && (_0x391c9e.unresolvedCommandIds.length > 0 || _0x2941c5.length > 0)) {
    return {
      ok: false,
      status: "failed",
      errorCode: "AGENT_CREATED_NODE_MISSING",
      message: "Agent node creation returned success, but the new node was not committed to the canvas store.",
      results: _0x3601c1,
      raw: _0x663477,
      createdNodeIds: _0x400224,
      missingNodeIds: _0x2941c5,
      unresolvedCommandIds: _0x391c9e.unresolvedCommandIds
    };
  }
  const _0xc8a01d = collectCreatedNodesOutsideVisibleCanvas(commandContext, _0x21c21f, _0x400224.filter(_0x35a634 => !_0x391c9e.reusedNodeIds.includes(_0x35a634)));
  revealCreatedNodes(commandContext, [...new Set([..._0x391c9e.revealNodeIds, ..._0xc8a01d])]);
  return {
    ok: _0x663477.ok === true,
    status: _0x663477.ok === true ? "success" : "failed",
    errorCode: _0x663477.errorCode || "",
    message: _0x663477.message || "",
    results: _0x3601c1,
    raw: _0x663477,
    createdNodeIds: _0x400224
  };
}