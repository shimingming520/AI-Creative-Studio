import a925_0x1f0eb2, { CanvasCommandError } from "./commandRegistry.js";
import { createCanvasCommandFailure, createCanvasCommandSuccess, isCanvasCommandFailure } from "./commandResult.js";
function normalizeCommandId(_0x578c9c) {
  return String(_0x578c9c || "").trim();
}
const PLAN_ALIAS_PATTERN = /^[A-Za-z_][A-Za-z0-9_]*$/;
const SIMPLE_VARIABLE_SOURCE = String.raw`\$([A-Za-z_][A-Za-z0-9_]*(?:\.(?:[A-Za-z_][A-Za-z0-9_]*|\d+))*)`;
const EXACT_VARIABLE_PATTERN = new RegExp(String.raw`^(?:\$\{([^}]+)\}|\{\{\s*([^}]+?)\s*\}\}|${SIMPLE_VARIABLE_SOURCE})$`);
const VARIABLE_PATTERN = new RegExp(String.raw`\$\{([^}]+)\}|\{\{\s*([^}]+?)\s*\}\}|${SIMPLE_VARIABLE_SOURCE}`, "g");
const VARIABLE_TEST_PATTERN = new RegExp(String.raw`\$\{[^}]+\}|\{\{\s*[^}]+?\s*\}\}|${SIMPLE_VARIABLE_SOURCE}`);
const PLAN_ACTION_CONTROL_KEYS = new Set(["commandId", "type", "id", "alias", "resultAlias", "as", "args", "riskLevel", "riskReason", "label"]);
function getRegistry(_0x896407 = {}) {
  return _0x896407.commandRegistry || _0x896407.registry || a925_0x1f0eb2;
}
function normalizeValidation(_0x4cfcb2, _0x185026, _0x4715f1) {
  if (_0x185026 === undefined || _0x185026 === null || _0x185026 === true) {
    return {
      ok: true,
      args: _0x4715f1
    };
  }
  if (typeof _0x185026 === "string") {
    return {
      ok: false,
      commandId: _0x4cfcb2,
      errorCode: "VALIDATION_FAILED",
      message: _0x185026
    };
  }
  if (isCanvasCommandFailure(_0x185026)) {
    return {
      ok: false,
      commandId: _0x4cfcb2,
      errorCode: _0x185026.errorCode || "VALIDATION_FAILED",
      message: _0x185026.message || "Canvas command validation failed.",
      details: _0x185026.details
    };
  }
  if (_0x185026 && typeof _0x185026 === "object") {
    return {
      ok: true,
      args: Object.prototype.hasOwnProperty.call(_0x185026, "args") ? _0x185026.args : _0x4715f1
    };
  }
  if (_0x185026 === false) {
    return {
      ok: false,
      commandId: _0x4cfcb2,
      errorCode: "VALIDATION_FAILED",
      message: "Canvas command validation failed."
    };
  }
  return {
    ok: true,
    args: _0x4715f1
  };
}
function buildFailure(_0x1ee1d7, _0x521d58, _0x4d5c42, _0x1f218e = undefined) {
  return createCanvasCommandFailure({
    commandId: _0x1ee1d7,
    errorCode: _0x521d58,
    message: _0x4d5c42,
    details: _0x1f218e
  });
}
function normalizeThrownError(_0x29f78b, _0x478c44) {
  if (_0x478c44 instanceof CanvasCommandError) {
    return buildFailure(_0x29f78b, _0x478c44.errorCode, _0x478c44.message, _0x478c44.details);
  }
  return buildFailure(_0x29f78b, "COMMAND_EXECUTION_FAILED", _0x478c44?.message || "Canvas command execution failed.");
}
function normalizeActionAlias(_0x23298 = {}) {
  const _0xacc64e = _0x23298.alias ?? _0x23298.resultAlias ?? _0x23298.as ?? "";
  const _0x32498a = String(_0xacc64e || "").trim();
  if (!_0x32498a) {
    return {
      ok: true,
      alias: ""
    };
  }
  if (!PLAN_ALIAS_PATTERN.test(_0x32498a)) {
    return {
      ok: false,
      errorCode: "INVALID_ACTION_ALIAS",
      message: "Canvas command plan action alias is invalid: " + _0x32498a
    };
  }
  return {
    ok: true,
    alias: _0x32498a
  };
}
function normalizePlanActionArgs(_0x2464d4 = {}) {
  const _0x484642 = {};
  for (const [_0x3a8528, _0x257805] of Object.entries(_0x2464d4)) {
    if (!PLAN_ACTION_CONTROL_KEYS.has(_0x3a8528) && _0x257805 !== undefined) {
      _0x484642[_0x3a8528] = _0x257805;
    }
  }
  const _0x2fecb8 = _0x2464d4.args && typeof _0x2464d4.args === "object" && !Array.isArray(_0x2464d4.args) ? _0x2464d4.args : {};
  return {
    ..._0x484642,
    ..._0x2fecb8
  };
}
function readPathSegment(_0xabc3cc, _0x2f05f7) {
  if (_0xabc3cc == null) {
    return undefined;
  }
  if (Array.isArray(_0xabc3cc) && /^\d+$/.test(_0x2f05f7)) {
    return _0xabc3cc[Number(_0x2f05f7)];
  }
  return _0xabc3cc?.[_0x2f05f7];
}
function resolveVariable(_0x29e5a3, _0x603502) {
  const _0x2c4440 = String(_0x29e5a3 || "").trim().split(".").map(_0x2a9011 => _0x2a9011.trim()).filter(Boolean);
  const _0x1ed01a = _0x2c4440.shift();
  if (!_0x1ed01a || !_0x603502.has(_0x1ed01a)) {
    return {
      ok: false,
      expression: _0x29e5a3
    };
  }
  let _0x52a8bf = _0x603502.get(_0x1ed01a);
  for (const _0x38398c of _0x2c4440) {
    _0x52a8bf = readPathSegment(_0x52a8bf, _0x38398c);
    if (_0x52a8bf === undefined) {
      return {
        ok: false,
        expression: _0x29e5a3
      };
    }
  }
  return {
    ok: true,
    value: _0x52a8bf
  };
}
function stringifyInterpolatedValue(_0x265a56) {
  if (_0x265a56 == null) {
    return "";
  }
  if (typeof _0x265a56 === "string") {
    return _0x265a56;
  }
  if (typeof _0x265a56 === "number" || typeof _0x265a56 === "boolean") {
    return String(_0x265a56);
  }
  return JSON.stringify(_0x265a56);
}
function interpolateString(_0x2cb0e3, _0x74c14a) {
  const _0x257b68 = _0x2cb0e3.match(EXACT_VARIABLE_PATTERN);
  if (_0x257b68) {
    const _0x45b6fd = resolveVariable(_0x257b68[1] || _0x257b68[2] || _0x257b68[3], _0x74c14a);
    if (!_0x45b6fd.ok) {
      throw new CanvasCommandError("UNRESOLVED_PLAN_VARIABLE", "Canvas command plan variable is not available: " + _0x45b6fd.expression, {
        expression: _0x45b6fd.expression
      });
    }
    return _0x45b6fd.value;
  }
  return _0x2cb0e3.replace(VARIABLE_PATTERN, (_0x287ae2, _0x4da5ac, _0x36fc68, _0x42a19e) => {
    const _0x312160 = _0x4da5ac || _0x36fc68 || _0x42a19e;
    const _0x575835 = resolveVariable(_0x312160, _0x74c14a);
    if (!_0x575835.ok) {
      throw new CanvasCommandError("UNRESOLVED_PLAN_VARIABLE", "Canvas command plan variable is not available: " + _0x575835.expression, {
        expression: _0x575835.expression
      });
    }
    return stringifyInterpolatedValue(_0x575835.value);
  });
}
function interpolatePlanValue(_0x1dcd46, _0xd42808) {
  if (typeof _0x1dcd46 === "string") {
    return interpolateString(_0x1dcd46, _0xd42808);
  }
  if (Array.isArray(_0x1dcd46)) {
    return _0x1dcd46.map(_0x1906c3 => interpolatePlanValue(_0x1906c3, _0xd42808));
  }
  if (_0x1dcd46 && typeof _0x1dcd46 === "object") {
    const _0x4d9bbb = {};
    for (const [_0x22a19b, _0x5cc1eb] of Object.entries(_0x1dcd46)) {
      _0x4d9bbb[_0x22a19b] = interpolatePlanValue(_0x5cc1eb, _0xd42808);
    }
    return _0x4d9bbb;
  }
  return _0x1dcd46;
}
function interpolatePlanArgs(_0x405626, _0x32a324) {
  try {
    return {
      ok: true,
      args: interpolatePlanValue(_0x405626 || {}, _0x32a324)
    };
  } catch (_0x31f471) {
    if (_0x31f471 instanceof CanvasCommandError) {
      return {
        ok: false,
        errorCode: _0x31f471.errorCode,
        message: _0x31f471.message,
        details: _0x31f471.details
      };
    }
    return {
      ok: false,
      errorCode: "PLAN_INTERPOLATION_FAILED",
      message: _0x31f471?.message || "Canvas command plan argument interpolation failed."
    };
  }
}
function snapshotVariables(_0x3ccee4) {
  const _0x2928da = {};
  for (const [_0x1c0b15, _0x5c9a36] of _0x3ccee4.entries()) {
    _0x2928da[_0x1c0b15] = _0x5c9a36;
  }
  return _0x2928da;
}
function createPlanScope(_0x5454ba = {}) {
  const _0x45e15e = new Map();
  if (_0x5454ba instanceof Map) {
    for (const [_0x2ae512, _0x42891a] of _0x5454ba.entries()) {
      const _0x379b1b = String(_0x2ae512 || "").trim();
      if (PLAN_ALIAS_PATTERN.test(_0x379b1b)) {
        _0x45e15e.set(_0x379b1b, _0x42891a);
      }
    }
    return _0x45e15e;
  }
  if (_0x5454ba && typeof _0x5454ba === "object") {
    for (const [_0x4594c3, _0x5240d2] of Object.entries(_0x5454ba)) {
      const _0x45061d = String(_0x4594c3 || "").trim();
      if (PLAN_ALIAS_PATTERN.test(_0x45061d)) {
        _0x45e15e.set(_0x45061d, _0x5240d2);
      }
    }
  }
  return _0x45e15e;
}
function createCommandPlanExecutionContext(_0x5d6c37 = {}, _0x4426cd = {}) {
  if (_0x5d6c37?.createNodeSequenceKey) {
    return _0x5d6c37;
  }
  const _0x2228c9 = String(_0x4426cd.createNodeSequenceKey || _0x4426cd.sequenceKey || "").trim();
  const _0x55a85e = _0x2228c9 || "canvas-command-plan-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 8);
  return {
    ..._0x5d6c37,
    createNodeSequenceKey: _0x55a85e
  };
}
export function hasCanvasCommandPlanVariableReference(_0xcf21db) {
  if (typeof _0xcf21db === "string") {
    return VARIABLE_TEST_PATTERN.test(_0xcf21db);
  }
  if (Array.isArray(_0xcf21db)) {
    return _0xcf21db.some(_0x32f230 => hasCanvasCommandPlanVariableReference(_0x32f230));
  }
  if (_0xcf21db && typeof _0xcf21db === "object") {
    return Object.values(_0xcf21db).some(_0x35a135 => hasCanvasCommandPlanVariableReference(_0x35a135));
  }
  return false;
}
export async function executeCanvasCommand(_0x75331b, _0x5170e0 = {}, _0x56f5f5 = {}) {
  const _0x243369 = normalizeCommandId(_0x75331b);
  if (!_0x243369) {
    return buildFailure("", "MISSING_COMMAND_ID", "Canvas command id is required.");
  }
  const _0x764afb = getRegistry(_0x56f5f5);
  const _0x2a7cbd = _0x764afb?.get?.(_0x243369) || null;
  if (!_0x2a7cbd) {
    return buildFailure(_0x243369, "UNKNOWN_COMMAND", "Unknown canvas command: " + _0x243369);
  }
  try {
    const _0x251df2 = normalizeValidation(_0x243369, _0x2a7cbd.validate?.(_0x5170e0, _0x56f5f5), _0x5170e0);
    if (!_0x251df2.ok) {
      return _0x251df2;
    }
    const _0x21aa08 = await _0x2a7cbd.execute(_0x251df2.args, _0x56f5f5);
    const _0x2557fd = createCanvasCommandSuccess({
      commandId: _0x243369,
      result: _0x21aa08,
      message: _0x2a7cbd.description || _0x243369,
      riskLevel: _0x2a7cbd.riskLevel || "safe"
    });
    _0x56f5f5.recordCommand?.({
      commandId: _0x243369,
      args: _0x251df2.args,
      result: _0x2557fd,
      riskLevel: _0x2a7cbd.riskLevel || "safe",
      ts: Date.now()
    });
    return _0x2557fd;
  } catch (_0xe2d3f) {
    const _0x31af82 = normalizeThrownError(_0x243369, _0xe2d3f);
    _0x56f5f5.recordCommand?.({
      commandId: _0x243369,
      args: _0x5170e0,
      result: _0x31af82,
      ts: Date.now()
    });
    return _0x31af82;
  }
}
export function executeCanvasCommandSync(_0x5c7b0b, _0x379df3 = {}, _0x57cc49 = {}) {
  const _0x22c92c = normalizeCommandId(_0x5c7b0b);
  if (!_0x22c92c) {
    return buildFailure("", "MISSING_COMMAND_ID", "Canvas command id is required.");
  }
  const _0x581ef1 = getRegistry(_0x57cc49);
  const _0x1d8bb0 = _0x581ef1?.get?.(_0x22c92c) || null;
  if (!_0x1d8bb0) {
    return buildFailure(_0x22c92c, "UNKNOWN_COMMAND", "Unknown canvas command: " + _0x22c92c);
  }
  try {
    const _0xf532ab = normalizeValidation(_0x22c92c, _0x1d8bb0.validate?.(_0x379df3, _0x57cc49), _0x379df3);
    if (!_0xf532ab.ok) {
      return _0xf532ab;
    }
    if (_0x1d8bb0.execute?.constructor?.name === "AsyncFunction") {
      return buildFailure(_0x22c92c, "ASYNC_COMMAND_UNSUPPORTED", _0x22c92c + " cannot run through a synchronous command entry.");
    }
    const _0x31f49a = _0x1d8bb0.execute(_0xf532ab.args, _0x57cc49);
    if (_0x31f49a && typeof _0x31f49a.then === "function") {
      Promise.resolve(_0x31f49a).catch(() => {});
      return buildFailure(_0x22c92c, "ASYNC_COMMAND_UNSUPPORTED", _0x22c92c + " cannot run through a synchronous command entry.");
    }
    const _0x1b5b25 = createCanvasCommandSuccess({
      commandId: _0x22c92c,
      result: _0x31f49a,
      message: _0x1d8bb0.description || _0x22c92c,
      riskLevel: _0x1d8bb0.riskLevel || "safe"
    });
    _0x57cc49.recordCommand?.({
      commandId: _0x22c92c,
      args: _0xf532ab.args,
      result: _0x1b5b25,
      riskLevel: _0x1d8bb0.riskLevel || "safe",
      ts: Date.now()
    });
    return _0x1b5b25;
  } catch (_0x56883e) {
    const _0x547202 = normalizeThrownError(_0x22c92c, _0x56883e);
    _0x57cc49.recordCommand?.({
      commandId: _0x22c92c,
      args: _0x379df3,
      result: _0x547202,
      ts: Date.now()
    });
    return _0x547202;
  }
}
function normalizePlanAction(_0xfbb72d, _0x49a52a) {
  if (!_0xfbb72d || typeof _0xfbb72d !== "object" || Array.isArray(_0xfbb72d)) {
    return {
      ok: false,
      errorCode: "INVALID_PLAN_ACTION",
      message: "Canvas command plan action at index " + _0x49a52a + " must be an object."
    };
  }
  const _0x4f502a = normalizeCommandId(_0xfbb72d.commandId || _0xfbb72d.type || _0xfbb72d.id);
  if (!_0x4f502a) {
    return {
      ok: false,
      errorCode: "MISSING_COMMAND_ID",
      message: "Canvas command plan action at index " + _0x49a52a + " is missing commandId or type."
    };
  }
  return {
    ok: true,
    commandId: _0x4f502a,
    args: normalizePlanActionArgs(_0xfbb72d),
    alias: ""
  };
}
export async function executeCanvasCommandPlan(_0x1f9baa = [], _0x215cb8 = {}, _0x53b3d7 = {}) {
  if (!Array.isArray(_0x1f9baa)) {
    return buildFailure("plan", "INVALID_COMMAND_PLAN", "Canvas command plan must be an array.");
  }
  const _0x496009 = [];
  const _0x3f74db = createPlanScope(_0x53b3d7.initialScope || _0x53b3d7.scope);
  const _0x15f5d1 = createCommandPlanExecutionContext(_0x215cb8, _0x53b3d7);
  for (let _0x48e8f4 = 0; _0x48e8f4 < _0x1f9baa.length; _0x48e8f4 += 1) {
    if (typeof _0x53b3d7.shouldContinue === "function" && _0x53b3d7.shouldContinue({
      index: _0x48e8f4,
      action: _0x1f9baa[_0x48e8f4]
    }) === false) {
      return {
        ...buildFailure("plan", "PLAN_EXECUTION_ABORTED", "Canvas command plan execution was superseded or stopped."),
        result: {
          actions: _0x496009,
          failedIndex: _0x48e8f4,
          aliases: snapshotVariables(_0x3f74db),
          aborted: true
        }
      };
    }
    const _0x102be0 = normalizePlanAction(_0x1f9baa[_0x48e8f4], _0x48e8f4);
    if (!_0x102be0.ok) {
      return {
        ...buildFailure("plan", _0x102be0.errorCode, _0x102be0.message),
        result: {
          actions: _0x496009,
          failedIndex: _0x48e8f4
        }
      };
    }
    const _0x20eff5 = normalizeActionAlias(_0x1f9baa[_0x48e8f4]);
    if (!_0x20eff5.ok) {
      return {
        ...buildFailure("plan", _0x20eff5.errorCode, _0x20eff5.message),
        result: {
          actions: _0x496009,
          failedIndex: _0x48e8f4,
          aliases: snapshotVariables(_0x3f74db)
        }
      };
    }
    const _0x2a890b = interpolatePlanArgs(_0x102be0.args, _0x3f74db);
    if (!_0x2a890b.ok) {
      return {
        ...buildFailure("plan", _0x2a890b.errorCode, _0x2a890b.message, _0x2a890b.details),
        result: {
          actions: _0x496009,
          failedIndex: _0x48e8f4,
          aliases: snapshotVariables(_0x3f74db)
        }
      };
    }
    const _0x237399 = await executeCanvasCommand(_0x102be0.commandId, _0x2a890b.args, _0x15f5d1);
    let _0x8d0bd7 = _0x237399;
    if (typeof _0x53b3d7.afterAction === "function") {
      try {
        const _0x59f0d3 = await _0x53b3d7.afterAction({
          index: _0x48e8f4,
          commandId: _0x102be0.commandId,
          args: _0x2a890b.args,
          response: _0x237399,
          context: _0x15f5d1
        });
        if (_0x59f0d3 && typeof _0x59f0d3 === "object") {
          _0x8d0bd7 = _0x59f0d3;
        }
      } catch (_0xc854f7) {
        _0x8d0bd7 = buildFailure(_0x102be0.commandId, "COMMAND_POSTCONDITION_FAILED", _0xc854f7?.message || "Canvas command postcondition check failed.");
      }
    }
    const _0x2270e3 = _0x20eff5.alias ? {
      ..._0x8d0bd7,
      alias: _0x20eff5.alias
    } : _0x8d0bd7;
    _0x496009.push(_0x2270e3);
    if (!_0x8d0bd7.ok) {
      return {
        ...buildFailure("plan", _0x8d0bd7.errorCode, _0x8d0bd7.message),
        result: {
          actions: _0x496009,
          failedIndex: _0x48e8f4,
          aliases: snapshotVariables(_0x3f74db)
        }
      };
    }
    if (_0x20eff5.alias) {
      _0x3f74db.set(_0x20eff5.alias, _0x8d0bd7.result);
    }
  }
  return {
    ok: true,
    commandId: "plan",
    result: {
      actions: _0x496009,
      aliases: snapshotVariables(_0x3f74db)
    },
    message: "Canvas command plan executed."
  };
}