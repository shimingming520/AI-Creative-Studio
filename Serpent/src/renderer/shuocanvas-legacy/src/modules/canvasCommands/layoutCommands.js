import { buildNodeOffsetPlan, computeAlignTargets, computeArrangeColumnTargets, computeArrangeGridTargets, computeArrangeRowTargets, computeDistributeTargets, computeMoveNearNodeTargets, computeSelectionBounds, getAlignableSelectionNodes, resolveArrangeGridColumns } from "../../core/math.js";
import { createCanvasCommandError } from "./commandRegistry.js";
const ALIGN_MODES = new Set(["left", "h-center", "right", "top", "v-center", "bottom"]);
const DISTRIBUTE_AXES = new Set(["horizontal", "vertical"]);
const MOVE_NEAR_PLACEMENTS = new Set(["left", "right", "top", "bottom"]);
function getState(_0x4b61d0) {
  return _0x4b61d0.store?.getStateRaw?.() || _0x4b61d0.store?.getState?.() || {};
}
function normalizeNodeIds(_0x43c23f = {}, _0x3a9c21 = {}, {
  min = 2
} = {}) {
  const _0x508080 = getState(_0x3a9c21);
  const _0x48ee04 = _0x508080.nodes || {};
  const _0xe6bac9 = Array.isArray(_0x43c23f.ids) && _0x43c23f.ids.length > 0 ? _0x43c23f.ids : _0x508080.selectedNodeIds || [];
  const _0x3e5592 = [];
  const _0x8a2d58 = new Set();
  for (const _0x30fb03 of _0xe6bac9) {
    const _0x4dfcd7 = String(_0x30fb03 || "").trim();
    if (!_0x4dfcd7 || _0x8a2d58.has(_0x4dfcd7)) {
      continue;
    }
    if (!_0x48ee04[_0x4dfcd7]) {
      throw createCanvasCommandError("NODE_NOT_FOUND", "Canvas node not found: " + _0x4dfcd7, {
        nodeId: _0x4dfcd7
      });
    }
    _0x3e5592.push(_0x4dfcd7);
    _0x8a2d58.add(_0x4dfcd7);
  }
  if (_0x3e5592.length < min) {
    throw createCanvasCommandError("INSUFFICIENT_NODES", "At least " + min + " canvas node(s) are required.");
  }
  return _0x3e5592;
}
function normalizeGap(_0x167d7c, _0x26b777) {
  if (_0x167d7c === undefined || _0x167d7c === null || _0x167d7c === "") {
    const _0x46bcfc = Number(_0x26b777.ui?.alignDistributeGap);
    if (Number.isFinite(_0x46bcfc) && _0x46bcfc >= 0) {
      return _0x46bcfc;
    } else {
      return undefined;
    }
  }
  const _0x276025 = Number(_0x167d7c);
  if (!Number.isFinite(_0x276025) || _0x276025 < 0) {
    throw createCanvasCommandError("INVALID_DISTRIBUTE_GAP", "layout.distribute gap must be a non-negative number.");
  }
  return _0x276025;
}
function normalizeOptionalGap(_0x12888c, _0x40789e = 40) {
  if (_0x12888c === undefined || _0x12888c === null || _0x12888c === "") {
    return _0x40789e;
  }
  const _0x30373a = Number(_0x12888c);
  if (!Number.isFinite(_0x30373a) || _0x30373a < 0) {
    throw createCanvasCommandError("INVALID_LAYOUT_GAP", "Layout gap must be a non-negative number.");
  }
  return _0x30373a;
}
function normalizePositiveInteger(_0x2cb96c, _0x10e061) {
  if (_0x2cb96c === undefined || _0x2cb96c === null || _0x2cb96c === "") {
    return _0x10e061;
  }
  const _0x22c077 = Number(_0x2cb96c);
  if (!Number.isFinite(_0x22c077) || _0x22c077 <= 0) {
    throw createCanvasCommandError("INVALID_LAYOUT_COLUMNS", "layout.arrangeGrid columns must be a positive number.");
  }
  return Math.trunc(_0x22c077);
}
function applyTargetPositions(_0x18b371, _0x37270f) {
  const _0x2c708c = getState(_0x18b371);
  const _0x2d1b44 = Object.fromEntries(Object.entries(_0x37270f || {}).filter(([_0x159e4f, _0x47ac77]) => _0x2c708c.nodes?.[_0x159e4f] && _0x47ac77).map(([_0x153e09, _0x42963d]) => [_0x153e09, {
    x: Number(_0x42963d.x),
    y: Number(_0x42963d.y)
  }]));
  const _0x5ab637 = buildNodeOffsetPlan(_0x2c708c.nodes || {}, _0x37270f);
  const _0x2d2045 = Object.keys(_0x5ab637);
  if (_0x2d2045.length === 0) {
    return {
      movedIds: _0x2d2045,
      positions: _0x2d1b44
    };
  }
  const _0x232928 = _0x18b371.store || _0x18b371.graphStore;
  const _0x1457d8 = () => _0x232928?.moveNodesByOffsets?.(_0x5ab637);
  if (typeof _0x232928?.batch === "function") {
    _0x232928.batch(_0x1457d8);
  } else {
    _0x1457d8();
  }
  _0x18b371.commit?.();
  return {
    movedIds: _0x2d2045,
    positions: _0x2d1b44
  };
}
function getAlignableItems(_0x4ca2e5, _0x1095ef) {
  const _0x2b0d6a = getState(_0x4ca2e5);
  const _0x75ba9f = getAlignableSelectionNodes(_0x2b0d6a.nodes || {}, _0x1095ef);
  if (_0x75ba9f.length < 2) {
    throw createCanvasCommandError("INSUFFICIENT_ALIGNABLE_NODES", "At least two alignable canvas nodes are required.");
  }
  return _0x75ba9f;
}
export function registerLayoutCommands(_0xf8cf2d) {
  _0xf8cf2d.register({
    id: "layout.align",
    description: "Align canvas nodes.",
    riskLevel: "safe",
    argsSchema: {
      required: ["mode"],
      properties: {
        ids: {
          type: "array",
          items: {
            type: "string"
          }
        },
        mode: {
          type: "string",
          enum: Array.from(ALIGN_MODES)
        }
      },
      selectionFallback: true
    },
    capabilitySchema: {
      reads: ["nodes", "selection"],
      writes: ["nodes"],
      selectionFallback: true
    },
    returnSchema: {
      aliasFields: ["ids", "movedIds", "mode"]
    },
    validate(_0x339b74 = {}, _0x5eb095 = {}) {
      const _0x201fcb = String(_0x339b74.mode || "").trim();
      if (!ALIGN_MODES.has(_0x201fcb)) {
        return {
          ok: false,
          errorCode: "INVALID_ALIGN_MODE",
          message: "Unsupported layout.align mode: " + (_0x201fcb || "(empty)")
        };
      }
      try {
        return {
          args: {
            ids: normalizeNodeIds(_0x339b74, _0x5eb095),
            mode: _0x201fcb
          }
        };
      } catch (_0xe1d1c8) {
        return {
          ok: false,
          errorCode: _0xe1d1c8.errorCode || "INVALID_ALIGN_SELECTION",
          message: _0xe1d1c8.message
        };
      }
    },
    execute(_0x11e0c5, _0x2a30f9) {
      const _0x140e02 = getAlignableItems(_0x2a30f9, _0x11e0c5.ids);
      const _0x54363f = computeSelectionBounds(_0x140e02);
      const _0x5197b8 = computeAlignTargets(_0x140e02, _0x11e0c5.mode, _0x54363f);
      const _0x5bb0a7 = applyTargetPositions(_0x2a30f9, _0x5197b8);
      return {
        ids: _0x11e0c5.ids,
        movedIds: _0x5bb0a7.movedIds,
        positions: _0x5bb0a7.positions,
        mode: _0x11e0c5.mode
      };
    }
  });
  _0xf8cf2d.register({
    id: "layout.distribute",
    description: "Distribute canvas nodes.",
    riskLevel: "safe",
    argsSchema: {
      required: ["axis"],
      properties: {
        ids: {
          type: "array",
          items: {
            type: "string"
          }
        },
        axis: {
          type: "string",
          enum: Array.from(DISTRIBUTE_AXES)
        },
        gap: {
          type: "number"
        }
      },
      defaults: {
        gap: "ui.alignDistributeGap"
      },
      selectionFallback: true
    },
    capabilitySchema: {
      reads: ["nodes", "selection", "ui.alignDistributeGap"],
      writes: ["nodes"],
      selectionFallback: true
    },
    returnSchema: {
      aliasFields: ["ids", "movedIds", "axis", "gap"]
    },
    validate(_0x36f900 = {}, _0x2ecd1a = {}) {
      const _0x512386 = String(_0x36f900.axis || "").trim();
      if (!DISTRIBUTE_AXES.has(_0x512386)) {
        return {
          ok: false,
          errorCode: "INVALID_DISTRIBUTE_AXIS",
          message: "Unsupported layout.distribute axis: " + (_0x512386 || "(empty)")
        };
      }
      try {
        const _0x57e959 = getState(_0x2ecd1a);
        return {
          args: {
            ids: normalizeNodeIds(_0x36f900, _0x2ecd1a),
            axis: _0x512386,
            gap: normalizeGap(_0x36f900.gap, _0x57e959)
          }
        };
      } catch (_0x2aae82) {
        return {
          ok: false,
          errorCode: _0x2aae82.errorCode || "INVALID_DISTRIBUTE_SELECTION",
          message: _0x2aae82.message
        };
      }
    },
    execute(_0x584fdc, _0x214bec) {
      const _0x7c8916 = getAlignableItems(_0x214bec, _0x584fdc.ids);
      const _0x1b654b = computeDistributeTargets(_0x7c8916, _0x584fdc.axis, _0x584fdc.gap);
      const _0x53da04 = applyTargetPositions(_0x214bec, _0x1b654b);
      return {
        ids: _0x584fdc.ids,
        movedIds: _0x53da04.movedIds,
        positions: _0x53da04.positions,
        axis: _0x584fdc.axis,
        gap: _0x584fdc.gap
      };
    }
  });
  _0xf8cf2d.register({
    id: "layout.arrangeRow",
    description: "Arrange canvas nodes in a row.",
    riskLevel: "safe",
    argsSchema: {
      properties: {
        ids: {
          type: "array",
          items: {
            type: "string"
          }
        },
        gap: {
          type: "number"
        },
        align: {
          type: "string"
        }
      },
      defaults: {
        gap: 40,
        align: "top"
      },
      selectionFallback: true
    },
    capabilitySchema: {
      reads: ["nodes", "selection"],
      writes: ["nodes"],
      selectionFallback: true
    },
    returnSchema: {
      aliasFields: ["ids", "movedIds", "gap"]
    },
    validate(_0x540a52 = {}, _0x4d3e58 = {}) {
      try {
        return {
          args: {
            ids: normalizeNodeIds(_0x540a52, _0x4d3e58),
            gap: normalizeOptionalGap(_0x540a52.gap, 40),
            align: String(_0x540a52.align || "top").trim()
          }
        };
      } catch (_0x5c0e2f) {
        return {
          ok: false,
          errorCode: _0x5c0e2f.errorCode || "INVALID_ARRANGE_ROW",
          message: _0x5c0e2f.message
        };
      }
    },
    execute(_0x3882ad, _0x2d71a8) {
      const _0x412a11 = getAlignableItems(_0x2d71a8, _0x3882ad.ids);
      const _0x3982b0 = computeArrangeRowTargets(_0x412a11, {
        gap: _0x3882ad.gap,
        align: _0x3882ad.align
      });
      const _0x19df3c = applyTargetPositions(_0x2d71a8, _0x3982b0);
      return {
        ids: _0x3882ad.ids,
        movedIds: _0x19df3c.movedIds,
        positions: _0x19df3c.positions,
        gap: _0x3882ad.gap,
        align: _0x3882ad.align
      };
    }
  });
  _0xf8cf2d.register({
    id: "layout.arrangeColumn",
    description: "Arrange canvas nodes in a column.",
    riskLevel: "safe",
    argsSchema: {
      properties: {
        ids: {
          type: "array",
          items: {
            type: "string"
          }
        },
        gap: {
          type: "number"
        },
        align: {
          type: "string"
        }
      },
      defaults: {
        gap: 40,
        align: "left"
      },
      selectionFallback: true
    },
    capabilitySchema: {
      reads: ["nodes", "selection"],
      writes: ["nodes"],
      selectionFallback: true
    },
    returnSchema: {
      aliasFields: ["ids", "movedIds", "gap"]
    },
    validate(_0x4f0ee1 = {}, _0x7faa8b = {}) {
      try {
        return {
          args: {
            ids: normalizeNodeIds(_0x4f0ee1, _0x7faa8b),
            gap: normalizeOptionalGap(_0x4f0ee1.gap, 40),
            align: String(_0x4f0ee1.align || "left").trim()
          }
        };
      } catch (_0x36bb72) {
        return {
          ok: false,
          errorCode: _0x36bb72.errorCode || "INVALID_ARRANGE_COLUMN",
          message: _0x36bb72.message
        };
      }
    },
    execute(_0x364867, _0x4578b4) {
      const _0x11243e = getAlignableItems(_0x4578b4, _0x364867.ids);
      const _0x54cc1f = computeArrangeColumnTargets(_0x11243e, {
        gap: _0x364867.gap,
        align: _0x364867.align
      });
      const _0x494ce2 = applyTargetPositions(_0x4578b4, _0x54cc1f);
      return {
        ids: _0x364867.ids,
        movedIds: _0x494ce2.movedIds,
        positions: _0x494ce2.positions,
        gap: _0x364867.gap,
        align: _0x364867.align
      };
    }
  });
  _0xf8cf2d.register({
    id: "layout.arrangeGrid",
    description: "Arrange canvas nodes in a grid.",
    riskLevel: "safe",
    argsSchema: {
      properties: {
        ids: {
          type: "array",
          items: {
            type: "string"
          }
        },
        columns: {
          type: "number"
        },
        gap: {
          type: "number"
        },
        gapX: {
          type: "number"
        },
        gapY: {
          type: "number"
        }
      },
      defaults: {
        gapX: 40,
        gapY: 40
      },
      selectionFallback: true
    },
    capabilitySchema: {
      reads: ["nodes", "selection", "edges"],
      writes: ["nodes"],
      selectionFallback: true
    },
    returnSchema: {
      aliasFields: ["ids", "movedIds", "columns", "gapX", "gapY"]
    },
    validate(_0x32121e = {}, _0x2794e2 = {}) {
      try {
        return {
          args: {
            ids: normalizeNodeIds(_0x32121e, _0x2794e2),
            columns: normalizePositiveInteger(_0x32121e.columns, undefined),
            gapX: normalizeOptionalGap(_0x32121e.gapX ?? _0x32121e.gap, 40),
            gapY: normalizeOptionalGap(_0x32121e.gapY ?? _0x32121e.gap, 40)
          }
        };
      } catch (_0x512fff) {
        return {
          ok: false,
          errorCode: _0x512fff.errorCode || "INVALID_ARRANGE_GRID",
          message: _0x512fff.message
        };
      }
    },
    execute(_0x30e4f0, _0x3dd5f7) {
      const _0x3c8e8c = getState(_0x3dd5f7);
      const _0x4a73c5 = getAlignableItems(_0x3dd5f7, _0x30e4f0.ids);
      const _0xd55e44 = Object.values(_0x3c8e8c.edges || {});
      const _0x48e589 = resolveArrangeGridColumns(_0x4a73c5, {
        columns: _0x30e4f0.columns,
        gapX: _0x30e4f0.gapX,
        gapY: _0x30e4f0.gapY,
        relations: _0xd55e44
      });
      const _0x4201f9 = computeArrangeGridTargets(_0x4a73c5, {
        columns: _0x48e589,
        gapX: _0x30e4f0.gapX,
        gapY: _0x30e4f0.gapY,
        relations: _0xd55e44
      });
      const _0x23fa90 = applyTargetPositions(_0x3dd5f7, _0x4201f9);
      return {
        ids: _0x30e4f0.ids,
        movedIds: _0x23fa90.movedIds,
        positions: _0x23fa90.positions,
        columns: _0x48e589,
        gapX: _0x30e4f0.gapX,
        gapY: _0x30e4f0.gapY
      };
    }
  });
  _0xf8cf2d.register({
    id: "layout.moveNearNode",
    description: "Move canvas nodes near another node.",
    riskLevel: "safe",
    argsSchema: {
      required: ["anchorId"],
      properties: {
        ids: {
          type: "array",
          items: {
            type: "string"
          }
        },
        anchorId: {
          type: "string"
        },
        targetId: {
          type: "string"
        },
        placement: {
          type: "string",
          enum: Array.from(MOVE_NEAR_PLACEMENTS)
        },
        gap: {
          type: "number"
        }
      },
      defaults: {
        placement: "right",
        gap: 40
      },
      selectionFallback: true
    },
    capabilitySchema: {
      reads: ["nodes", "selection"],
      writes: ["nodes"],
      selectionFallback: true
    },
    returnSchema: {
      aliasFields: ["ids", "anchorId", "movedIds", "placement", "gap"]
    },
    validate(_0x43d830 = {}, _0x29e62b = {}) {
      const _0x1ef07 = String(_0x43d830.anchorId || _0x43d830.targetId || "").trim();
      const _0x46f4df = String(_0x43d830.placement || "right").trim();
      if (!MOVE_NEAR_PLACEMENTS.has(_0x46f4df)) {
        return {
          ok: false,
          errorCode: "INVALID_MOVE_NEAR_PLACEMENT",
          message: "Unsupported layout.moveNearNode placement: " + (_0x46f4df || "(empty)")
        };
      }
      try {
        const _0x4f6ba4 = normalizeNodeIds(_0x43d830, _0x29e62b, {
          min: 1
        }).filter(_0x990c29 => _0x990c29 !== _0x1ef07);
        if (!_0x1ef07) {
          throw createCanvasCommandError("MISSING_ANCHOR_NODE_ID", "layout.moveNearNode requires anchorId.");
        }
        if (!getState(_0x29e62b).nodes?.[_0x1ef07]) {
          throw createCanvasCommandError("NODE_NOT_FOUND", "Canvas node not found: " + _0x1ef07);
        }
        if (_0x4f6ba4.length === 0) {
          throw createCanvasCommandError("INSUFFICIENT_NODES", "layout.moveNearNode requires at least one movable node.");
        }
        return {
          args: {
            ids: _0x4f6ba4,
            anchorId: _0x1ef07,
            placement: _0x46f4df,
            gap: normalizeOptionalGap(_0x43d830.gap, 40)
          }
        };
      } catch (_0x56dc53) {
        return {
          ok: false,
          errorCode: _0x56dc53.errorCode || "INVALID_MOVE_NEAR_NODE",
          message: _0x56dc53.message
        };
      }
    },
    execute(_0x50fd30, _0x192aa0) {
      const _0x524d8f = getState(_0x192aa0);
      const _0x31ce4c = getAlignableSelectionNodes(_0x524d8f.nodes || {}, _0x50fd30.ids);
      const [_0x4d9000] = getAlignableSelectionNodes(_0x524d8f.nodes || {}, [_0x50fd30.anchorId]);
      if (!_0x4d9000 || _0x31ce4c.length === 0) {
        throw createCanvasCommandError("INSUFFICIENT_ALIGNABLE_NODES", "layout.moveNearNode requires alignable nodes.");
      }
      const _0x1ffdc4 = computeMoveNearNodeTargets(_0x31ce4c, _0x4d9000, {
        placement: _0x50fd30.placement,
        gap: _0x50fd30.gap
      });
      const _0x13bac0 = applyTargetPositions(_0x192aa0, _0x1ffdc4);
      return {
        ids: _0x50fd30.ids,
        anchorId: _0x50fd30.anchorId,
        movedIds: _0x13bac0.movedIds,
        positions: _0x13bac0.positions,
        placement: _0x50fd30.placement,
        gap: _0x50fd30.gap
      };
    }
  });
}