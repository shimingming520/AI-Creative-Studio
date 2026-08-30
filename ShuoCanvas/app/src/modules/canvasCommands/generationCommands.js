import { createCanvasCommandError } from "./commandRegistry.js";
import a929_0x1455f0 from "../../core/nodeRuntimeRegistry.js";
function getState(_0x4caeaf) {
  return _0x4caeaf.store?.getStateRaw?.() || _0x4caeaf.store?.getState?.() || {};
}
function getNode(_0x281832, _0x4dfc1f) {
  const _0x351546 = String(_0x4dfc1f || "").trim();
  if (_0x351546) {
    return getState(_0x281832).nodes?.[_0x351546] || null;
  } else {
    return null;
  }
}
function getNodeRuntime(_0x21637b, _0x5b6161) {
  const _0x333031 = _0x21637b.nodeRuntimeRegistry || a929_0x1455f0;
  return _0x333031?.get?.(_0x5b6161) || null;
}
function validateNodeId(_0x18abf9 = {}, _0x452569 = {}, _0x5632d7 = "generation command", {
  allowOptions = false
} = {}) {
  const _0x28c8b6 = String(_0x18abf9.nodeId || "").trim();
  if (!_0x28c8b6) {
    return {
      ok: false,
      errorCode: "MISSING_NODE_ID",
      message: _0x5632d7 + " requires nodeId."
    };
  }
  if (!getNode(_0x452569, _0x28c8b6)) {
    return {
      ok: false,
      errorCode: "NODE_NOT_FOUND",
      message: "Canvas node not found: " + _0x28c8b6
    };
  }
  return {
    args: {
      nodeId: _0x28c8b6,
      options: allowOptions && _0x18abf9.options && typeof _0x18abf9.options === "object" ? _0x18abf9.options : {}
    }
  };
}
async function cancelViaRuntime(_0x1164c7, _0x3ea45d) {
  const _0x14bffc = _0x3ea45d.generationRuntime || {};
  if (typeof _0x14bffc.cancelTask !== "function") {
    throw createCanvasCommandError("GENERATION_CANCEL_UNAVAILABLE", "generation.cancel did not find public cancelGeneration() or a task runtime cancel entry.");
  }
  const _0x19fdf3 = await _0x14bffc.cancelTask(_0x1164c7.nodeId, {
    store: _0x3ea45d.store,
    abortLocal: true
  });
  if (!_0x19fdf3?.ok) {
    throw createCanvasCommandError("GENERATION_CANCEL_UNAVAILABLE", "generation.cancel did not find a cancellable public generation task.", _0x19fdf3 || null);
  }
  return _0x19fdf3;
}
function getStoreStatus(_0x224c3e = {}) {
  return {
    jobStatus: String(_0x224c3e.jobStatus || _0x224c3e.storyboardScript?.jobStatus || (_0x224c3e.isGenerating ? "running" : "idle")),
    isGenerating: _0x224c3e.isGenerating === true || _0x224c3e.storyboardScript?.isGenerating === true || String(_0x224c3e.storyboardScript?.jobStatus || "") === "running",
    taskId: String(_0x224c3e.taskId || _0x224c3e.rhTaskId || _0x224c3e.asyncTaskId || "")
  };
}
function pickGenerationTaskId(_0x54f292 = {}, _0x598a03 = {}) {
  return String(_0x54f292?.taskId || _0x54f292?.targetTaskId || _0x54f292?.result?.taskId || _0x598a03.taskId || _0x598a03.rhTaskId || _0x598a03.asyncTaskId || "").trim();
}
function normalizeGenerationStatus(_0x1f70ac = {}, _0x3e6d1b = {}) {
  const _0xd40af1 = _0x1f70ac?.status || _0x1f70ac?.jobStatus || _0x1f70ac?.result?.status || _0x3e6d1b.jobStatus || _0x3e6d1b.rhTaskStatus || _0x3e6d1b.asyncTaskStatus || "";
  const _0x1bd8ac = String(_0xd40af1 || "").trim().toLowerCase();
  if (_0x1bd8ac) {
    return _0x1bd8ac;
  }
  if (_0x1f70ac?.ok === false) {
    return "failed";
  }
  if (_0x1f70ac?.ok === true) {
    return "success";
  }
  return "";
}
const GENERATION_FAILURE_STATUSES = new Set(["failed", "fail", "error", "cancelled", "canceled"]);
const GENERATION_NOT_STARTED_STATUSES = new Set(["", "idle", "ready"]);
function isGenerationFailureStatus(_0x3f77b4 = "") {
  return GENERATION_FAILURE_STATUSES.has(String(_0x3f77b4 || "").trim().toLowerCase());
}
function summarizeGenerationRunResult(_0x3b1e99, _0x2a2234, _0x1d1188 = {}) {
  const _0x58c60c = getNode(_0x1d1188, _0x3b1e99) || {};
  const _0x5124f9 = pickGenerationTaskId(_0x2a2234, _0x58c60c);
  const _0x53f295 = normalizeGenerationStatus(_0x2a2234, _0x58c60c);
  const _0x2a5e8e = String(_0x53f295 || "").trim().toLowerCase();
  const _0x1ac37a = getStoreStatus(_0x58c60c);
  const _0x21022e = GENERATION_NOT_STARTED_STATUSES.has(_0x2a5e8e) && !_0x5124f9 && _0x1ac37a.isGenerating !== true;
  const _0xc217ff = _0x2a2234?.ok === false || isGenerationFailureStatus(_0x2a5e8e) || _0x21022e;
  return {
    nodeId: _0x3b1e99,
    targetNodeId: String(_0x2a2234?.targetNodeId || _0x3b1e99),
    status: _0xc217ff ? "failed" : _0x2a5e8e,
    taskId: _0x5124f9,
    ...(_0xc217ff ? {
      errorCode: String(_0x2a2234?.errorCode || (_0x21022e ? "GENERATION_NOT_STARTED" : "GENERATION_RUN_FAILED")),
      message: String(_0x2a2234?.message || (_0x21022e ? "Generation did not start. Check the node prompt, required inputs, and credentials." : "Generation failed."))
    } : {}),
    value: _0x2a2234
  };
}
function validateBatchNodeIds(_0x4dc1bc = {}, _0x4df9f6 = {}) {
  const _0xae5768 = Array.isArray(_0x4dc1bc.nodeIds) ? [...new Set(_0x4dc1bc.nodeIds.map(_0x3f3bb1 => String(_0x3f3bb1 || "").trim()).filter(Boolean))] : [];
  if (_0xae5768.length === 0) {
    return {
      ok: false,
      errorCode: "MISSING_NODE_IDS",
      message: "generation.runBatch requires nodeIds."
    };
  }
  if (_0xae5768.length > 12) {
    return {
      ok: false,
      errorCode: "GENERATION_BATCH_TOO_LARGE",
      message: "generation.runBatch supports at most 12 nodes per batch."
    };
  }
  for (const _0x5a4fec of _0xae5768) {
    if (!getNode(_0x4df9f6, _0x5a4fec)) {
      return {
        ok: false,
        errorCode: "NODE_NOT_FOUND",
        message: "Canvas node not found: " + _0x5a4fec
      };
    }
  }
  return {
    args: {
      nodeIds: _0xae5768,
      options: _0x4dc1bc.options && typeof _0x4dc1bc.options === "object" ? _0x4dc1bc.options : {}
    }
  };
}
function summarizeBatchStatus(_0x559061 = []) {
  const _0x5bd357 = _0x559061.map(_0x1d4b1e => String(_0x1d4b1e.status || "").toLowerCase());
  if (_0x5bd357.length === 0) {
    return "";
  }
  if (_0x5bd357.every(_0x259601 => _0x259601 === _0x5bd357[0])) {
    return _0x5bd357[0];
  }
  if (_0x5bd357.some(_0x546fac => _0x546fac === "failed" || _0x546fac === "error")) {
    return "partial_failed";
  }
  if (_0x5bd357.some(_0x230193 => ["submitted", "pending", "running"].includes(_0x230193))) {
    return "pending";
  }
  return "mixed";
}
export function registerGenerationCommands(_0x4979ac) {
  _0x4979ac.register({
    id: "generation.runBatch",
    description: "Run generation for multiple prepared canvas nodes as one confirmed batch. Prefer this when two or more nodes should start generation together.",
    riskLevel: "confirm",
    argsSchema: {
      required: ["nodeIds"],
      properties: {
        nodeIds: {
          type: "array",
          items: {
            type: "string"
          },
          maxItems: 12
        },
        options: {
          type: "object"
        }
      },
      defaults: {
        options: {}
      }
    },
    capabilitySchema: {
      reads: ["nodes", "nodeRuntimeRegistry"],
      writes: ["nodes", "generationTasks"],
      requiresMountedRuntime: true
    },
    returnSchema: {
      aliasFields: ["nodeIds", "status", "results"]
    },
    validate(_0x43c6a3 = {}, _0x1ac877 = {}) {
      return validateBatchNodeIds(_0x43c6a3, _0x1ac877);
    },
    async execute(_0x5ea81, _0x5b4998) {
      for (const _0x2732ed of _0x5ea81.nodeIds) {
        const _0x57e8ca = getNodeRuntime(_0x5b4998, _0x2732ed);
        if (!_0x57e8ca) {
          throw createCanvasCommandError("GENERATION_NODE_NOT_MOUNTED", "Canvas node generation runtime is not registered: " + _0x2732ed, {
            nodeId: _0x2732ed
          });
        }
        if (typeof _0x57e8ca.runGeneration !== "function") {
          throw createCanvasCommandError("GENERATION_RUN_UNAVAILABLE", "generation.runBatch did not find runGeneration() for node: " + _0x2732ed, {
            nodeId: _0x2732ed
          });
        }
      }
      const _0x4375ec = await Promise.all(_0x5ea81.nodeIds.map(async _0x3c2168 => {
        try {
          const _0x56fdec = await getNodeRuntime(_0x5b4998, _0x3c2168).runGeneration(_0x5ea81.options);
          return summarizeGenerationRunResult(_0x3c2168, _0x56fdec, _0x5b4998);
        } catch (_0x3d23a0) {
          return {
            nodeId: _0x3c2168,
            targetNodeId: _0x3c2168,
            status: "failed",
            taskId: "",
            errorCode: String(_0x3d23a0?.errorCode || "GENERATION_RUN_FAILED"),
            message: String(_0x3d23a0?.message || "Generation failed.")
          };
        }
      }));
      const _0xda34e3 = _0x4375ec.filter(_0x4c472c => isGenerationFailureStatus(_0x4c472c.status));
      if (_0xda34e3.length === _0x4375ec.length) {
        throw createCanvasCommandError("GENERATION_BATCH_NOT_STARTED", _0xda34e3[0]?.message || "No generation task in the batch was started.", {
          nodeIds: [..._0x5ea81.nodeIds],
          results: _0x4375ec
        });
      }
      return {
        nodeIds: [..._0x5ea81.nodeIds],
        status: summarizeBatchStatus(_0x4375ec),
        results: _0x4375ec
      };
    }
  });
  _0x4979ac.register({
    id: "generation.run",
    description: "Run generation for a canvas node.",
    riskLevel: "confirm",
    argsSchema: {
      required: ["nodeId"],
      properties: {
        nodeId: {
          type: "string"
        },
        options: {
          type: "object"
        }
      },
      defaults: {
        options: {}
      }
    },
    capabilitySchema: {
      reads: ["nodes", "nodeRuntimeRegistry"],
      writes: ["nodes", "generationTasks"],
      requiresMountedRuntime: true
    },
    returnSchema: {
      aliasFields: ["nodeId", "targetNodeId", "status", "taskId", "value"]
    },
    validate(_0x152737 = {}, _0x3fb9d4 = {}) {
      return validateNodeId(_0x152737, _0x3fb9d4, "generation.run", {
        allowOptions: true
      });
    },
    async execute(_0x2d9d23, _0x39fda7) {
      const _0x396180 = getNodeRuntime(_0x39fda7, _0x2d9d23.nodeId);
      if (!_0x396180) {
        throw createCanvasCommandError("GENERATION_NODE_NOT_MOUNTED", "Canvas node generation runtime is not registered: " + _0x2d9d23.nodeId, {
          nodeId: _0x2d9d23.nodeId
        });
      }
      if (typeof _0x396180.runGeneration !== "function") {
        throw createCanvasCommandError("GENERATION_RUN_UNAVAILABLE", "generation.run did not find a registered runGeneration() entry for the node.", {
          nodeId: _0x2d9d23.nodeId
        });
      }
      const _0x1b2cac = await _0x396180.runGeneration(_0x2d9d23.options);
      const _0x47e4aa = summarizeGenerationRunResult(_0x2d9d23.nodeId, _0x1b2cac, _0x39fda7);
      if (isGenerationFailureStatus(_0x47e4aa.status)) {
        throw createCanvasCommandError(_0x47e4aa.errorCode || "GENERATION_RUN_FAILED", _0x47e4aa.message || "Generation failed.", _0x47e4aa);
      }
      return _0x47e4aa;
    }
  });
  _0x4979ac.register({
    id: "generation.cancel",
    description: "Cancel generation for a canvas node.",
    riskLevel: "confirm",
    argsSchema: {
      required: ["nodeId"],
      properties: {
        nodeId: {
          type: "string"
        },
        options: {
          type: "object"
        }
      },
      defaults: {
        options: {}
      }
    },
    capabilitySchema: {
      reads: ["nodes", "nodeRuntimeRegistry", "generationRuntime"],
      writes: ["nodes", "generationTasks"],
      requiresMountedRuntime: false
    },
    returnSchema: {
      aliasFields: ["nodeId", "value", "source"]
    },
    validate(_0x608ffc = {}, _0x3045c7 = {}) {
      return validateNodeId(_0x608ffc, _0x3045c7, "generation.cancel", {
        allowOptions: true
      });
    },
    async execute(_0x1886ef, _0x15646b) {
      const _0x1b0c39 = getNodeRuntime(_0x15646b, _0x1886ef.nodeId);
      if (typeof _0x1b0c39?.cancelGeneration === "function") {
        const _0x46def5 = await _0x1b0c39.cancelGeneration(_0x1886ef.options);
        if (_0x46def5?.ok === false) {
          throw createCanvasCommandError("GENERATION_CANCEL_UNAVAILABLE", _0x46def5.message || "generation.cancel was rejected by the node.", _0x46def5);
        }
        return {
          nodeId: _0x1886ef.nodeId,
          value: _0x46def5,
          source: "node"
        };
      }
      const _0x2c30a4 = await cancelViaRuntime(_0x1886ef, _0x15646b);
      return {
        nodeId: _0x1886ef.nodeId,
        value: _0x2c30a4,
        source: "runtime"
      };
    }
  });
  _0x4979ac.register({
    id: "generation.resume",
    description: "Resume generation for a canvas node.",
    riskLevel: "confirm",
    argsSchema: {
      required: ["nodeId"],
      properties: {
        nodeId: {
          type: "string"
        },
        options: {
          type: "object"
        }
      },
      defaults: {
        options: {}
      }
    },
    capabilitySchema: {
      reads: ["nodes", "nodeRuntimeRegistry"],
      writes: ["nodes", "generationTasks"],
      requiresMountedRuntime: true
    },
    returnSchema: {
      aliasFields: ["nodeId", "value"]
    },
    validate(_0x146640 = {}, _0x5e24f6 = {}) {
      return validateNodeId(_0x146640, _0x5e24f6, "generation.resume", {
        allowOptions: true
      });
    },
    async execute(_0x34b38e, _0x2b4f2d) {
      const _0xf91899 = getNodeRuntime(_0x2b4f2d, _0x34b38e.nodeId);
      if (typeof _0xf91899?.resumeGeneration !== "function") {
        throw createCanvasCommandError("GENERATION_RESUME_UNAVAILABLE", "generation.resume did not find a registered resumeGeneration() entry for the node.", {
          nodeId: _0x34b38e.nodeId
        });
      }
      const _0x260a54 = await _0xf91899.resumeGeneration(_0x34b38e.options);
      return {
        nodeId: _0x34b38e.nodeId,
        value: _0x260a54
      };
    }
  });
  _0x4979ac.register({
    id: "generation.getStatus",
    description: "Get generation status for a canvas node.",
    riskLevel: "safe",
    argsSchema: {
      required: ["nodeId"],
      properties: {
        nodeId: {
          type: "string"
        }
      }
    },
    capabilitySchema: {
      reads: ["nodes", "nodeRuntimeRegistry"],
      writes: []
    },
    returnSchema: {
      aliasFields: ["nodeId", "status", "source"]
    },
    validate(_0x562ca4 = {}, _0x5a315a = {}) {
      return validateNodeId(_0x562ca4, _0x5a315a, "generation.getStatus");
    },
    execute(_0x1d10d7, _0x36ff3b) {
      const _0x225389 = getNodeRuntime(_0x36ff3b, _0x1d10d7.nodeId);
      if (typeof _0x225389?.getGenerationStatus === "function") {
        return {
          nodeId: _0x1d10d7.nodeId,
          status: _0x225389.getGenerationStatus(),
          source: "node"
        };
      }
      return {
        nodeId: _0x1d10d7.nodeId,
        status: getStoreStatus(getNode(_0x36ff3b, _0x1d10d7.nodeId) || {}),
        source: "store"
      };
    }
  });
}