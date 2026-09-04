import a941_0x2f10ab from "../../core/nodeRuntimeRegistry.js";
import { createCanvasCommandError } from "./commandRegistry.js";
const TASK_ID_KEYS = new Set(["taskId", "task_id", "rhTaskId", "asyncTaskId", "dreaminaSubmitId", "submitId"]);
function getState(_0x545b59) {
  return _0x545b59.store?.getStateRaw?.() || _0x545b59.store?.getState?.() || {};
}
function getNode(_0x167ab8, _0x531861) {
  const _0x3b06b6 = String(_0x531861 || "").trim();
  if (_0x3b06b6) {
    return getState(_0x167ab8).nodes?.[_0x3b06b6] || null;
  } else {
    return null;
  }
}
function getNodeRuntime(_0x27c2b0, _0x3e445d) {
  const _0x4bb78d = _0x27c2b0.nodeRuntimeRegistry || a941_0x2f10ab;
  return _0x4bb78d?.get?.(_0x3e445d) || null;
}
function trimString(_0x4a3752) {
  if (typeof _0x4a3752 === "string") {
    return _0x4a3752.trim();
  } else {
    return "";
  }
}
function positiveNumber(_0x26f65d, _0x4d8a95) {
  const _0x13175e = Number(_0x26f65d);
  if (Number.isFinite(_0x13175e) && _0x13175e >= 0) {
    return _0x13175e;
  } else {
    return _0x4d8a95;
  }
}
function collectTaskIds(_0xb20c74, _0xf9bea4, _0x48bc20 = 0) {
  if (!_0xb20c74 || typeof _0xb20c74 !== "object" || _0x48bc20 > 4) {
    return;
  }
  if (Array.isArray(_0xb20c74)) {
    for (const _0x32b5e0 of _0xb20c74) {
      collectTaskIds(_0x32b5e0, _0xf9bea4, _0x48bc20 + 1);
    }
    return;
  }
  for (const [_0x218c32, _0xbf2538] of Object.entries(_0xb20c74)) {
    if (TASK_ID_KEYS.has(_0x218c32)) {
      const _0x39a64c = trimString(_0xbf2538);
      if (_0x39a64c) {
        _0xf9bea4.add(_0x39a64c);
      }
    }
    if (_0xbf2538 && typeof _0xbf2538 === "object") {
      collectTaskIds(_0xbf2538, _0xf9bea4, _0x48bc20 + 1);
    }
  }
}
function nodeHasTaskId(_0x42e1fa = {}, _0x38cc14 = "") {
  const _0x4eab46 = trimString(_0x38cc14);
  if (!_0x4eab46) {
    return false;
  }
  const _0x2b91c5 = new Set();
  collectTaskIds(_0x42e1fa, _0x2b91c5);
  return _0x2b91c5.has(_0x4eab46);
}
function getSelectedNodeIds(_0x77fe96) {
  const _0x1f73a7 = getState(_0x77fe96).selectedNodeIds;
  if (Array.isArray(_0x1f73a7)) {
    return _0x1f73a7.map(_0x26cbd5 => trimString(_0x26cbd5)).filter(Boolean);
  } else {
    return [];
  }
}
function pushExistingNodeId(_0x47af3e, _0xfd2c63, _0x2d9c2a, _0x1c3093) {
  const _0xe47774 = trimString(_0x1c3093);
  if (!_0xe47774 || _0xfd2c63.has(_0xe47774)) {
    return;
  }
  if (!getNode(_0x2d9c2a, _0xe47774)) {
    throw createCanvasCommandError("NODE_NOT_FOUND", "Canvas node not found: " + _0xe47774, {
      nodeId: _0xe47774
    });
  }
  _0x47af3e.push(_0xe47774);
  _0xfd2c63.add(_0xe47774);
}
function resolveTaskTargetNodeIds(_0x3c375e = {}, _0x534503 = {}) {
  const _0x1c7bfe = [];
  const _0x16330d = new Set();
  if (Array.isArray(_0x3c375e.ids) && _0x3c375e.ids.length > 0) {
    for (const _0x261807 of _0x3c375e.ids) {
      pushExistingNodeId(_0x1c7bfe, _0x16330d, _0x534503, _0x261807);
    }
  }
  pushExistingNodeId(_0x1c7bfe, _0x16330d, _0x534503, _0x3c375e.nodeId);
  pushExistingNodeId(_0x1c7bfe, _0x16330d, _0x534503, _0x3c375e.targetNodeId);
  pushExistingNodeId(_0x1c7bfe, _0x16330d, _0x534503, _0x3c375e.resultNodeId);
  const _0x2f64a9 = trimString(_0x3c375e.taskId);
  if (_0x2f64a9) {
    for (const [_0x84ed3d, _0xa34b09] of Object.entries(getState(_0x534503).nodes || {})) {
      if (nodeHasTaskId(_0xa34b09, _0x2f64a9)) {
        pushExistingNodeId(_0x1c7bfe, _0x16330d, _0x534503, _0x84ed3d);
      }
    }
  }
  if (_0x1c7bfe.length === 0 && !_0x2f64a9) {
    for (const _0x271905 of getSelectedNodeIds(_0x534503)) {
      pushExistingNodeId(_0x1c7bfe, _0x16330d, _0x534503, _0x271905);
    }
  }
  if (_0x1c7bfe.length === 0) {
    throw createCanvasCommandError("TASK_TARGET_NOT_FOUND", "Task target node was not found. Provide nodeId, ids, resultNodeId, or taskId.", {
      taskId: _0x2f64a9
    });
  }
  return _0x1c7bfe;
}
function normalizeStatus(_0xfc2b27 = {}, _0x3a73c6 = {}) {
  const _0x405cff = _0xfc2b27?.status || _0xfc2b27?.jobStatus || _0xfc2b27?.result?.status || _0x3a73c6.jobStatus || _0x3a73c6.rhTaskStatus || _0x3a73c6.asyncTaskStatus || "";
  const _0x3b3991 = trimString(_0x405cff).toLowerCase();
  if (_0x3b3991) {
    return _0x3b3991;
  }
  if (_0xfc2b27?.ok === false) {
    return "failed";
  }
  if (_0xfc2b27?.ok === true) {
    return "success";
  }
  return "";
}
function pickTaskId(_0x2474a2 = {}, _0x4b251f = {}, _0x164209 = "") {
  return trimString(_0x2474a2?.taskId || _0x2474a2?.targetTaskId || _0x2474a2?.result?.taskId || _0x4b251f.taskId || _0x4b251f.rhTaskId || _0x4b251f.asyncTaskId || _0x164209);
}
export function registerTaskCommands(_0x331b25) {
  _0x331b25.register({
    id: "task.focusResult",
    description: "Focus the canvas viewport on a task result node.",
    riskLevel: "safe",
    argsSchema: {
      properties: {
        taskId: {
          type: "string"
        },
        nodeId: {
          type: "string"
        },
        targetNodeId: {
          type: "string"
        },
        resultNodeId: {
          type: "string"
        },
        ids: {
          type: "array",
          items: {
            type: "string"
          }
        },
        padding: {
          type: "number"
        },
        durationMs: {
          type: "number"
        },
        options: {
          type: "object"
        }
      },
      defaults: {
        padding: 80,
        durationMs: 800
      },
      selectionFallback: true
    },
    capabilitySchema: {
      reads: ["nodes", "selection"],
      writes: ["viewport"],
      selectionFallback: true,
      requiresMountedRuntime: false
    },
    returnSchema: {
      aliasFields: ["taskId", "nodeIds", "focused"]
    },
    validate(_0x3f5505 = {}, _0x4f872b = {}) {
      if (typeof _0x4f872b.focusNodes !== "function") {
        return {
          ok: false,
          errorCode: "VIEWPORT_FOCUS_UNAVAILABLE",
          message: "task.focusResult requires a viewport focus service."
        };
      }
      try {
        return {
          args: {
            ..._0x3f5505,
            nodeIds: resolveTaskTargetNodeIds(_0x3f5505, _0x4f872b),
            taskId: trimString(_0x3f5505.taskId),
            padding: positiveNumber(_0x3f5505.padding, 80),
            durationMs: positiveNumber(_0x3f5505.durationMs, 800),
            options: _0x3f5505.options && typeof _0x3f5505.options === "object" && !Array.isArray(_0x3f5505.options) ? _0x3f5505.options : {}
          }
        };
      } catch (_0x1b691d) {
        return {
          ok: false,
          errorCode: _0x1b691d.errorCode || "TASK_TARGET_NOT_FOUND",
          message: _0x1b691d.message,
          details: _0x1b691d.details
        };
      }
    },
    execute(_0x2ca73b, _0x340b4d) {
      const _0x882522 = _0x340b4d.focusNodes(_0x2ca73b.nodeIds, _0x2ca73b.padding, _0x2ca73b.durationMs, {
        source: "task.focusResult",
        taskId: _0x2ca73b.taskId,
        ..._0x2ca73b.options
      });
      return {
        taskId: _0x2ca73b.taskId,
        nodeIds: _0x2ca73b.nodeIds,
        focused: _0x882522 !== false
      };
    }
  });
  _0x331b25.register({
    id: "task.retry",
    description: "Retry generation for a task result node through its mounted runtime.",
    riskLevel: "confirm",
    argsSchema: {
      properties: {
        taskId: {
          type: "string"
        },
        nodeId: {
          type: "string"
        },
        targetNodeId: {
          type: "string"
        },
        resultNodeId: {
          type: "string"
        },
        options: {
          type: "object"
        }
      },
      selectionFallback: true
    },
    capabilitySchema: {
      reads: ["nodes", "selection", "nodeRuntimeRegistry"],
      writes: ["nodes", "generationTasks"],
      selectionFallback: true,
      requiresMountedRuntime: true
    },
    returnSchema: {
      aliasFields: ["nodeId", "targetNodeId", "status", "taskId", "value"]
    },
    validate(_0x5e37da = {}, _0x400022 = {}) {
      try {
        const _0x17d7b2 = resolveTaskTargetNodeIds(_0x5e37da, _0x400022);
        if (_0x17d7b2.length !== 1) {
          return {
            ok: false,
            errorCode: "AMBIGUOUS_TASK_TARGET",
            message: "task.retry requires exactly one target node.",
            details: {
              nodeIds: _0x17d7b2
            }
          };
        }
        return {
          args: {
            ..._0x5e37da,
            nodeId: _0x17d7b2[0],
            taskId: trimString(_0x5e37da.taskId),
            options: _0x5e37da.options && typeof _0x5e37da.options === "object" && !Array.isArray(_0x5e37da.options) ? _0x5e37da.options : {}
          }
        };
      } catch (_0x5007fb) {
        return {
          ok: false,
          errorCode: _0x5007fb.errorCode || "TASK_TARGET_NOT_FOUND",
          message: _0x5007fb.message,
          details: _0x5007fb.details
        };
      }
    },
    async execute(_0x31c1c5, _0x32d8ca) {
      const _0x50b177 = getNodeRuntime(_0x32d8ca, _0x31c1c5.nodeId);
      if (typeof _0x50b177?.runGeneration !== "function") {
        throw createCanvasCommandError("TASK_RETRY_UNAVAILABLE", "task.retry did not find a registered runGeneration() entry for the node.", {
          nodeId: _0x31c1c5.nodeId
        });
      }
      const _0x5e30c9 = {
        ..._0x31c1c5.options,
        source: _0x31c1c5.options.source || "task.retry",
        retry: true
      };
      if (_0x31c1c5.taskId && !_0x5e30c9.taskId) {
        _0x5e30c9.taskId = _0x31c1c5.taskId;
      }
      const _0x18b5fd = await _0x50b177.runGeneration(_0x5e30c9);
      const _0x386cd0 = getNode(_0x32d8ca, _0x31c1c5.nodeId) || {};
      return {
        nodeId: _0x31c1c5.nodeId,
        targetNodeId: trimString(_0x18b5fd?.targetNodeId) || _0x31c1c5.nodeId,
        status: normalizeStatus(_0x18b5fd, _0x386cd0),
        taskId: pickTaskId(_0x18b5fd, _0x386cd0, _0x31c1c5.taskId),
        value: _0x18b5fd
      };
    }
  });
}