import { cloneStoryboard3DProject, syncStoryboard3DShotFromCameraObject } from "./projectModel.js";
function isPromise(_0x3d0688) {
  return _0x3d0688 && typeof _0x3d0688.then === "function";
}
function commandMethod(_0x2659b0, _0x519d80) {
  if (_0x519d80 === "execute") {
    return _0x2659b0?.execute || _0x2659b0?.do;
  }
  if (_0x519d80 === "redo") {
    return _0x2659b0?.redo || _0x2659b0?.execute || _0x2659b0?.do;
  }
  return _0x2659b0?.undo;
}
function invoke(_0x3618d6, _0x1093dc, _0x3b2fe8) {
  const _0x47fd90 = commandMethod(_0x3618d6, _0x1093dc);
  if (typeof _0x47fd90 !== "function") {
    throw new TypeError("Command " + (_0x3618d6?.type || "unknown") + " has no " + _0x1093dc + " handler");
  }
  return _0x47fd90.call(_0x3618d6, _0x3b2fe8);
}
function createCompositeCommand(_0x5aabe3, _0x58fb38) {
  const _0x21b090 = [..._0x58fb38];
  return {
    type: "transaction",
    label: _0x5aabe3,
    commands: _0x21b090,
    execute(_0x18fa40) {
      let _0x38a0ae = null;
      _0x21b090.forEach(_0x6c2eaa => {
        if (_0x38a0ae) {
          _0x38a0ae = _0x38a0ae.then(() => invoke(_0x6c2eaa, "redo", _0x18fa40));
          return;
        }
        const _0x3b9c12 = invoke(_0x6c2eaa, "redo", _0x18fa40);
        if (isPromise(_0x3b9c12)) {
          _0x38a0ae = Promise.resolve(_0x3b9c12);
        }
      });
      return _0x38a0ae;
    },
    undo(_0x4f4fc9) {
      let _0x300ca3 = null;
      [..._0x21b090].reverse().forEach(_0x3e667a => {
        if (_0x300ca3) {
          _0x300ca3 = _0x300ca3.then(() => invoke(_0x3e667a, "undo", _0x4f4fc9));
          return;
        }
        const _0x1de7ac = invoke(_0x3e667a, "undo", _0x4f4fc9);
        if (isPromise(_0x1de7ac)) {
          _0x300ca3 = Promise.resolve(_0x1de7ac);
        }
      });
      return _0x300ca3;
    }
  };
}
export class CommandHistory {
  constructor({
    context: _0xebfa49,
    limit = 100,
    onChange: _0x25831f
  } = {}) {
    this.context = _0xebfa49;
    this.limit = Math.max(1, Math.round(Number(limit) || 100));
    this.onChange = typeof _0x25831f === "function" ? _0x25831f : null;
    this.undoStack = [];
    this.redoStack = [];
    this.transaction = null;
    this.busy = false;
  }
  _notify(_0x18293a, _0x50b3fe = null) {
    this.onChange?.(this.getSnapshot(), {
      reason: _0x18293a,
      command: _0x50b3fe
    });
  }
  _record(_0x1bb487) {
    if (this.transaction) {
      this.transaction.commands.push(_0x1bb487);
      this._notify("execute-in-transaction", _0x1bb487);
      return;
    }
    const _0x23d014 = this.undoStack[this.undoStack.length - 1];
    const _0x303d63 = _0x23d014 && _0x23d014.mergeKey && _0x23d014.mergeKey === _0x1bb487.mergeKey && typeof _0x23d014.mergeWith === "function" && _0x23d014.mergeWith(_0x1bb487) === true;
    if (!_0x303d63) {
      this.undoStack.push(_0x1bb487);
    }
    if (this.undoStack.length > this.limit) {
      this.undoStack.splice(0, this.undoStack.length - this.limit);
    }
    this.redoStack = [];
    this._notify(_0x303d63 ? "merge" : "execute", _0x303d63 ? _0x23d014 : _0x1bb487);
  }
  _run(_0x54fddc, _0x592c1a, _0x2f6379, _0x108f52) {
    if (this.busy) {
      throw new Error("Command history is busy");
    }
    let _0x41105b;
    try {
      _0x41105b = invoke(_0x54fddc, _0x592c1a, this.context);
    } catch (_0x232959) {
      _0x108f52?.(_0x232959);
      throw _0x232959;
    }
    if (!isPromise(_0x41105b)) {
      _0x2f6379?.(_0x41105b);
      return _0x41105b;
    }
    this.busy = true;
    this._notify("busy", _0x54fddc);
    return Promise.resolve(_0x41105b).then(_0x238fea => {
      this.busy = false;
      _0x2f6379?.(_0x238fea);
      return _0x238fea;
    }, _0x14c4f8 => {
      this.busy = false;
      _0x108f52?.(_0x14c4f8);
      this._notify("error", _0x54fddc);
      throw _0x14c4f8;
    });
  }
  execute(_0x2d8c61) {
    if (!_0x2d8c61 || typeof _0x2d8c61 !== "object") {
      throw new TypeError("A command is required");
    }
    return this._run(_0x2d8c61, "execute", _0x25a742 => {
      if (_0x25a742 !== false) {
        this._record(_0x2d8c61);
      }
    });
  }
  undo() {
    if (this.transaction) {
      throw new Error("Cannot undo during a transaction");
    }
    if (this.busy || this.undoStack.length === 0) {
      return false;
    }
    const _0x461ef8 = this.undoStack.pop();
    return this._run(_0x461ef8, "undo", () => {
      this.redoStack.push(_0x461ef8);
      this._notify("undo", _0x461ef8);
    }, () => this.undoStack.push(_0x461ef8));
  }
  redo() {
    if (this.transaction) {
      throw new Error("Cannot redo during a transaction");
    }
    if (this.busy || this.redoStack.length === 0) {
      return false;
    }
    const _0x1ea077 = this.redoStack.pop();
    return this._run(_0x1ea077, "redo", () => {
      this.undoStack.push(_0x1ea077);
      this._notify("redo", _0x1ea077);
    }, () => this.redoStack.push(_0x1ea077));
  }
  beginTransaction(_0x5ec014 = "Transaction") {
    if (this.busy) {
      throw new Error("Command history is busy");
    }
    if (this.transaction) {
      throw new Error("Nested command transactions are not supported");
    }
    this.transaction = {
      label: String(_0x5ec014 || "Transaction"),
      commands: []
    };
    this._notify("begin-transaction");
  }
  commitTransaction() {
    if (!this.transaction) {
      return false;
    }
    const _0xc829d9 = this.transaction;
    this.transaction = null;
    if (_0xc829d9.commands.length === 0) {
      this._notify("empty-transaction");
      return false;
    }
    const _0x429892 = createCompositeCommand(_0xc829d9.label, _0xc829d9.commands);
    this.undoStack.push(_0x429892);
    if (this.undoStack.length > this.limit) {
      this.undoStack.splice(0, this.undoStack.length - this.limit);
    }
    this.redoStack = [];
    this._notify("commit-transaction", _0x429892);
    return _0x429892;
  }
  cancelTransaction() {
    if (!this.transaction) {
      return false;
    }
    const _0x103412 = this.transaction;
    this.transaction = null;
    const _0x451842 = createCompositeCommand(_0x103412.label, _0x103412.commands);
    if (_0x103412.commands.length === 0) {
      this._notify("cancel-transaction", _0x451842);
      return true;
    }
    return this._run(_0x451842, "undo", () => this._notify("cancel-transaction", _0x451842));
  }
  runTransaction(_0x406241, _0x171cdd) {
    this.beginTransaction(_0x406241);
    let _0x179e63;
    try {
      _0x179e63 = _0x171cdd(this);
    } catch (_0x46c16f) {
      const _0x4f3e9a = this.cancelTransaction();
      if (isPromise(_0x4f3e9a)) {
        return _0x4f3e9a.then(() => {
          throw _0x46c16f;
        });
      }
      throw _0x46c16f;
    }
    if (!isPromise(_0x179e63)) {
      this.commitTransaction();
      return _0x179e63;
    }
    return Promise.resolve(_0x179e63).then(_0x5bb3cd => {
      this.commitTransaction();
      return _0x5bb3cd;
    }, _0xa0cc6c => Promise.resolve(this.cancelTransaction()).then(() => {
      throw _0xa0cc6c;
    }));
  }
  clear() {
    if (this.busy) {
      throw new Error("Command history is busy");
    }
    this.undoStack = [];
    this.redoStack = [];
    this.transaction = null;
    this._notify("clear");
  }
  getSnapshot() {
    return {
      canUndo: !this.busy && !this.transaction && this.undoStack.length > 0,
      canRedo: !this.busy && !this.transaction && this.redoStack.length > 0,
      undoCount: this.undoStack.length,
      redoCount: this.redoStack.length,
      busy: this.busy,
      transactionActive: this.transaction !== null,
      transactionSize: this.transaction?.commands.length || 0,
      nextUndoLabel: this.undoStack[this.undoStack.length - 1]?.label || null,
      nextRedoLabel: this.redoStack[this.redoStack.length - 1]?.label || null
    };
  }
}
export function createCommandHistory(_0x122fef) {
  return new CommandHistory(_0x122fef);
}
function normalizeVector(_0x3595eb, _0x2d315e, _0x4cb37a = -Infinity) {
  const _0x59f75c = Array.isArray(_0x3595eb) ? _0x3595eb : [];
  return _0x2d315e.map((_0x5bc571, _0x4beb25) => Math.max(_0x4cb37a, Number.isFinite(Number(_0x59f75c[_0x4beb25])) ? Number(_0x59f75c[_0x4beb25]) : _0x5bc571));
}
function normalizeTransform(_0x3b0535, _0x245a05) {
  return {
    position: normalizeVector(_0x3b0535?.position, _0x245a05.position),
    rotation: normalizeVector(_0x3b0535?.rotation, _0x245a05.rotation),
    scale: normalizeVector(_0x3b0535?.scale, _0x245a05.scale, 0.001)
  };
}
function getScene(_0x550d7f, _0x4973d3) {
  return _0x550d7f?.scenes?.find(_0xdb2aab => _0xdb2aab.id === _0x4973d3) || null;
}
export function applyStoryboard3DObjectTransforms(_0x23caf4, {
  sceneId: _0x3e8d40,
  transforms: _0x4f2093,
  respectLocks = true
} = {}) {
  const _0x48db99 = _0x4f2093 && typeof _0x4f2093 === "object" ? _0x4f2093 : {};
  const _0x2bde75 = cloneStoryboard3DProject(_0x23caf4);
  const _0x5a9400 = getScene(_0x2bde75, _0x3e8d40);
  if (!_0x5a9400) {
    return {
      project: _0x2bde75,
      changedObjectIds: []
    };
  }
  const _0x3d1b9f = [];
  _0x5a9400.objects.forEach(_0x1bad7c => {
    if (!Object.prototype.hasOwnProperty.call(_0x48db99, _0x1bad7c.id)) {
      return;
    }
    if (respectLocks && _0x1bad7c.locked === true) {
      return;
    }
    const _0x3d4c0a = normalizeTransform(_0x48db99[_0x1bad7c.id], _0x1bad7c.transform);
    if (JSON.stringify(_0x3d4c0a) === JSON.stringify(_0x1bad7c.transform)) {
      return;
    }
    const _0x2be8ce = cloneStoryboard3DProject(_0x1bad7c.transform);
    _0x1bad7c.transform = _0x3d4c0a;
    if (_0x1bad7c.type === "camera") {
      syncStoryboard3DShotFromCameraObject(_0x5a9400, _0x1bad7c.id, {
        previousTransform: _0x2be8ce
      });
    }
    _0x3d1b9f.push(_0x1bad7c.id);
  });
  if (_0x3d1b9f.length > 0) {
    _0x2bde75.updatedAt = Date.now();
  }
  return {
    project: _0x2bde75,
    changedObjectIds: _0x3d1b9f
  };
}
function readTransforms(_0x451180, _0x216743, _0x421b1a) {
  const _0x23cdd4 = new Set(_0x421b1a);
  const _0x3bb516 = getScene(_0x451180, _0x216743);
  const _0x4d21e6 = {};
  (_0x3bb516?.objects || []).forEach(_0x22364f => {
    if (_0x23cdd4.has(_0x22364f.id)) {
      _0x4d21e6[_0x22364f.id] = cloneStoryboard3DProject(_0x22364f.transform);
    }
  });
  return _0x4d21e6;
}
export function createStoryboard3DTransformCommand({
  sceneId: _0x2a144a,
  transforms: _0x3058a5,
  label = "Transform objects",
  mergeKey: _0x3b3481
} = {}) {
  const _0x5f465a = cloneStoryboard3DProject(_0x3058a5 || {});
  const _0x18851d = Object.keys(_0x5f465a).sort();
  let _0x59fa95 = null;
  let _0x162657 = _0x5f465a;
  const _0x261417 = _0x2a144a + ":" + _0x18851d.join(",");
  const _0x29d23a = {
    type: "transform-objects",
    label: label,
    mergeKey: _0x3b3481 === false ? null : String(_0x3b3481 || "transform:" + _0x261417),
    execute(_0x228427) {
      const _0x3f16dc = _0x228427.getProject();
      if (!_0x59fa95) {
        _0x59fa95 = readTransforms(_0x3f16dc, _0x2a144a, _0x18851d);
      }
      const _0x89fa34 = applyStoryboard3DObjectTransforms(_0x3f16dc, {
        sceneId: _0x2a144a,
        transforms: _0x162657
      });
      if (_0x89fa34.changedObjectIds.length === 0) {
        return false;
      }
      return _0x228427.replaceProject(_0x89fa34.project, {
        reason: "transform-objects"
      });
    },
    undo(_0x43c7e6) {
      if (!_0x59fa95) {
        return false;
      }
      const _0x48e08b = applyStoryboard3DObjectTransforms(_0x43c7e6.getProject(), {
        sceneId: _0x2a144a,
        transforms: _0x59fa95,
        respectLocks: false
      });
      return _0x43c7e6.replaceProject(_0x48e08b.project, {
        reason: "undo-transform-objects"
      });
    },
    redo(_0x4640c1) {
      const _0x260024 = applyStoryboard3DObjectTransforms(_0x4640c1.getProject(), {
        sceneId: _0x2a144a,
        transforms: _0x162657,
        respectLocks: false
      });
      return _0x4640c1.replaceProject(_0x260024.project, {
        reason: "redo-transform-objects"
      });
    },
    mergeWith(_0x74be8b) {
      if (_0x74be8b?.type !== "transform-objects") {
        return false;
      }
      if (_0x74be8b._signature !== _0x261417) {
        return false;
      }
      _0x162657 = cloneStoryboard3DProject(_0x74be8b._afterTransforms);
      return true;
    },
    _signature: _0x261417,
    _afterTransforms: _0x162657
  };
  return _0x29d23a;
}
export function createStoryboard3DProjectMutationCommand({
  type = "update-project",
  label = "Update project",
  mutate: _0x29f688
} = {}) {
  if (typeof _0x29f688 !== "function") {
    throw new TypeError("A project mutation function is required");
  }
  let _0x341991 = null;
  let _0x481d73 = null;
  return {
    type: String(type || "update-project"),
    label: String(label || "Update project"),
    execute(_0xc4b26a) {
      _0x341991 = cloneStoryboard3DProject(_0xc4b26a.getProject());
      const _0x5bb59a = cloneStoryboard3DProject(_0x341991);
      const _0x38ad21 = _0x29f688(_0x5bb59a);
      _0x481d73 = cloneStoryboard3DProject(_0x38ad21 || _0x5bb59a);
      if (JSON.stringify(_0x341991) === JSON.stringify(_0x481d73)) {
        return false;
      }
      return _0xc4b26a.replaceProject(_0x481d73, {
        reason: type
      });
    },
    undo(_0x35bb37) {
      if (!_0x341991) {
        return false;
      }
      return _0x35bb37.replaceProject(cloneStoryboard3DProject(_0x341991), {
        reason: "undo-" + type
      });
    },
    redo(_0x2bbe90) {
      if (!_0x481d73) {
        return false;
      }
      return _0x2bbe90.replaceProject(cloneStoryboard3DProject(_0x481d73), {
        reason: "redo-" + type
      });
    }
  };
}