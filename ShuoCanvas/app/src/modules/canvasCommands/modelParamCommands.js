import { getModelManifest, resolveModelExecution, sanitizeModelUiSchemaParams } from "../../manifests/index.js";
import { buildGenerationParamDisplayPatch } from "./generationParamDisplay.js";
const MODEL_NODE_KINDS = Object.freeze({
  "ai-text": "text",
  "ai-image": "image",
  "ai-video": "video",
  "ai-audio": "audio",
  "storyboard-script": "text"
});
function getState(_0x305bdd) {
  return _0x305bdd.store?.getStateRaw?.() || _0x305bdd.store?.getState?.() || {};
}
function getNode(_0x23b192, _0xa4124) {
  const _0x44c4b5 = String(_0xa4124 || "").trim();
  if (_0x44c4b5) {
    return getState(_0x23b192).nodes?.[_0x44c4b5] || null;
  } else {
    return null;
  }
}
function getStore(_0x192d0b) {
  return _0x192d0b.graphStore || _0x192d0b.store;
}
function getPlainObject(_0x56493c) {
  if (_0x56493c && typeof _0x56493c === "object" && !Array.isArray(_0x56493c)) {
    return _0x56493c;
  } else {
    return {};
  }
}
function getDeclaredParamIds(_0x4c6b9b) {
  return new Set((Array.isArray(_0x4c6b9b?.uiSchema?.fields) ? _0x4c6b9b.uiSchema.fields : []).map(_0xe48e0 => String(_0xe48e0?.id || "").trim()).filter(Boolean));
}
function normalizeParamsArgs(_0x5eb6b1 = {}) {
  if (_0x5eb6b1.params && typeof _0x5eb6b1.params === "object" && !Array.isArray(_0x5eb6b1.params)) {
    return {
      ..._0x5eb6b1.params
    };
  }
  const _0x381e0e = String(_0x5eb6b1.field || _0x5eb6b1.param || "").trim();
  if (_0x381e0e) {
    return {
      [_0x381e0e]: _0x5eb6b1.value
    };
  }
  return {};
}
function normalizeModelArgs(_0x181b74 = {}) {
  return {
    modelId: String(_0x181b74.model || _0x181b74.modelId || "").trim(),
    providerHint: String(_0x181b74.provider || "").trim(),
    preserveParams: _0x181b74.resetParams === true ? false : _0x181b74.preserveParams !== false,
    params: getPlainObject(_0x181b74.params)
  };
}
function validateModelPatchArgs(_0x55a00c, _0x3b05d8 = {}, _0x28b501 = {}) {
  const _0x5b7da3 = String(_0x3b05d8.nodeId || "").trim();
  if (!_0x5b7da3) {
    return {
      ok: false,
      errorCode: "MISSING_NODE_ID",
      message: _0x55a00c + " requires nodeId."
    };
  }
  const _0x553fbc = getNode(_0x28b501, _0x5b7da3);
  if (!_0x553fbc) {
    return {
      ok: false,
      errorCode: "NODE_NOT_FOUND",
      message: "Canvas node not found: " + _0x5b7da3
    };
  }
  const _0x21e96f = normalizeModelArgs(_0x3b05d8);
  if (!_0x21e96f.modelId) {
    return {
      ok: false,
      errorCode: "MISSING_MODEL_ID",
      message: _0x55a00c + " requires model or modelId."
    };
  }
  const _0x43c931 = resolveModelExecution(_0x21e96f.modelId, {
    providerHint: _0x21e96f.providerHint
  });
  const _0x32f24b = _0x43c931?.modelManifest || null;
  if (!_0x32f24b) {
    return {
      ok: false,
      errorCode: "MODEL_MANIFEST_NOT_FOUND",
      message: "Model manifest not found: " + _0x21e96f.modelId
    };
  }
  const _0xd5f779 = MODEL_NODE_KINDS[String(_0x553fbc.type || "").trim()] || "";
  if (!_0xd5f779) {
    return {
      ok: false,
      errorCode: "MODEL_UNSUPPORTED_NODE",
      message: "Canvas node does not support model selection: " + _0x5b7da3
    };
  }
  if (String(_0x32f24b.kind || "") !== _0xd5f779) {
    return {
      ok: false,
      errorCode: "MODEL_KIND_MISMATCH",
      message: "Model " + _0x32f24b.modelId + " is " + (_0x32f24b.kind || "(unknown)") + ", not " + _0xd5f779 + "."
    };
  }
  const _0xed9ea7 = _0x21e96f.preserveParams ? getPlainObject(_0x553fbc.generationParams) : {};
  const _0x1381f5 = sanitizeModelUiSchemaParams(_0x32f24b.modelId, {
    ..._0xed9ea7,
    ..._0x21e96f.params
  }, {
    includeDefaults: true
  });
  return {
    args: {
      nodeId: _0x5b7da3,
      modelId: _0x32f24b.modelId,
      provider: _0x32f24b.provider || _0x21e96f.providerHint,
      params: _0x1381f5,
      preserveParams: _0x21e96f.preserveParams,
      changedParamIds: Object.keys(_0x21e96f.params)
    }
  };
}
function executeModelPatch(_0xad2945, _0xc46893) {
  const _0x111408 = getNode(_0xc46893, _0xad2945.nodeId) || {};
  const _0x4189bb = getStore(_0xc46893);
  _0x4189bb?.updateNodeData?.(_0xad2945.nodeId, {
    model: _0xad2945.modelId,
    provider: _0xad2945.provider,
    generationParams: _0xad2945.params,
    ...buildGenerationParamDisplayPatch({
      store: _0x4189bb,
      nodeId: _0xad2945.nodeId,
      nodeData: _0x111408,
      modelId: _0xad2945.modelId,
      generationParams: _0xad2945.params,
      force: true
    })
  });
  _0xc46893.commit?.();
  return {
    nodeId: _0xad2945.nodeId,
    modelId: _0xad2945.modelId,
    model: _0xad2945.modelId,
    provider: _0xad2945.provider,
    params: _0xad2945.params,
    changedParamIds: _0xad2945.changedParamIds
  };
}
export function registerModelParamCommands(_0x4be6a3) {
  function _0x11313b(_0xcf3e82, _0x3f45c3) {
    _0x4be6a3.register({
      id: _0xcf3e82,
      description: _0x3f45c3,
      riskLevel: "safe",
      argsSchema: {
        required: ["nodeId", "model"],
        properties: {
          nodeId: {
            type: "string"
          },
          model: {
            type: "string"
          },
          modelId: {
            type: "string"
          },
          provider: {
            type: "string"
          },
          params: {
            type: "object"
          },
          preserveParams: {
            type: "boolean"
          },
          resetParams: {
            type: "boolean"
          }
        },
        defaults: {
          preserveParams: true,
          resetParams: false
        }
      },
      capabilitySchema: {
        reads: ["nodes", "modelRegistry"],
        writes: ["nodes"]
      },
      returnSchema: {
        aliasFields: ["nodeId", "modelId", "model", "provider", "params"]
      },
      validate(_0x3ee4da = {}, _0x2cc162 = {}) {
        return validateModelPatchArgs(_0xcf3e82, _0x3ee4da, _0x2cc162);
      },
      execute: executeModelPatch
    });
  }
  _0x11313b("node.setModel", "Set a manifest-backed model on a generation node.");
  _0x11313b("node.changeModel", "Change a generation node to another manifest-backed model.");
  _0x4be6a3.register({
    id: "node.setParams",
    description: "Set manifest-backed node generation parameters.",
    riskLevel: "safe",
    argsSchema: {
      required: ["nodeId"],
      properties: {
        nodeId: {
          type: "string"
        },
        params: {
          type: "object"
        },
        field: {
          type: "string"
        },
        param: {
          type: "string"
        },
        value: {},
        modelId: {
          type: "string"
        }
      }
    },
    capabilitySchema: {
      reads: ["nodes", "modelRegistry"],
      writes: ["nodes"]
    },
    returnSchema: {
      aliasFields: ["nodeId", "modelId", "params", "changedParamIds"]
    },
    validate(_0xff4acf = {}, _0x406c3d = {}) {
      const _0x5d23ea = String(_0xff4acf.nodeId || "").trim();
      if (!_0x5d23ea) {
        return {
          ok: false,
          errorCode: "MISSING_NODE_ID",
          message: "node.setParams requires nodeId."
        };
      }
      const _0x32542c = getNode(_0x406c3d, _0x5d23ea);
      if (!_0x32542c) {
        return {
          ok: false,
          errorCode: "NODE_NOT_FOUND",
          message: "Canvas node not found: " + _0x5d23ea
        };
      }
      const _0x48741d = String(_0xff4acf.modelId || _0x32542c.model || "").trim();
      if (!_0x48741d) {
        return {
          ok: false,
          errorCode: "MISSING_MODEL_ID",
          message: "node.setParams requires a node model backed by a manifest."
        };
      }
      const _0x4c9f1a = getModelManifest(_0x48741d);
      if (!_0x4c9f1a) {
        return {
          ok: false,
          errorCode: "MODEL_MANIFEST_NOT_FOUND",
          message: "Model manifest not found: " + _0x48741d
        };
      }
      const _0x495991 = getDeclaredParamIds(_0x4c9f1a);
      if (_0x495991.size === 0) {
        return {
          ok: false,
          errorCode: "MODEL_PARAMS_UNSUPPORTED",
          message: "Model has no uiSchema params: " + _0x48741d
        };
      }
      const _0x2903ee = normalizeParamsArgs(_0xff4acf);
      const _0xdf6b5c = Object.keys(_0x2903ee);
      if (_0xdf6b5c.length === 0) {
        return {
          ok: false,
          errorCode: "MISSING_PARAMS",
          message: "node.setParams requires params or field/value."
        };
      }
      const _0x1f1ed0 = _0xdf6b5c.filter(_0x2c9200 => !_0x495991.has(_0x2c9200));
      if (_0x1f1ed0.length > 0) {
        return {
          ok: false,
          errorCode: "UNSUPPORTED_MODEL_PARAM",
          message: "Unsupported model param(s): " + _0x1f1ed0.join(", "),
          details: {
            modelId: _0x48741d,
            unknown: _0x1f1ed0
          }
        };
      }
      const _0x33edbf = getPlainObject(_0x32542c.generationParams);
      const _0x3d9f5c = {
        ..._0x33edbf,
        ..._0x2903ee
      };
      const _0x60d532 = sanitizeModelUiSchemaParams(_0x48741d, _0x3d9f5c, {
        includeDefaults: false
      });
      return {
        args: {
          nodeId: _0x5d23ea,
          modelId: _0x48741d,
          params: _0x60d532,
          changedParamIds: _0xdf6b5c
        }
      };
    },
    execute(_0x50f3ac, _0x598ec6) {
      const _0x178764 = getNode(_0x598ec6, _0x50f3ac.nodeId) || {};
      const _0x305781 = getStore(_0x598ec6);
      _0x305781?.updateNodeData?.(_0x50f3ac.nodeId, {
        generationParams: _0x50f3ac.params,
        ...buildGenerationParamDisplayPatch({
          store: _0x305781,
          nodeId: _0x50f3ac.nodeId,
          nodeData: _0x178764,
          modelId: _0x50f3ac.modelId,
          generationParams: _0x50f3ac.params,
          changedParamIds: _0x50f3ac.changedParamIds
        })
      });
      _0x598ec6.commit?.();
      return {
        nodeId: _0x50f3ac.nodeId,
        modelId: _0x50f3ac.modelId,
        params: _0x50f3ac.params,
        changedParamIds: _0x50f3ac.changedParamIds
      };
    }
  });
}