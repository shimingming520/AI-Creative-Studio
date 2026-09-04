import a981_0x4fce83 from "../core/stores/appStore.js";
export function createHistory({
  store: _0x3d706d,
  max = 50
} = {}) {
  const _0x85f8a9 = _0x3d706d && (typeof _0x3d706d.getHistorySnapshot === "function" || typeof _0x3d706d.getState === "function");
  const _0x43c31c = _0x3d706d && (typeof _0x3d706d.loadHistorySnapshot === "function" || typeof _0x3d706d.loadState === "function");
  if (!_0x85f8a9 || !_0x43c31c) {
    throw new TypeError("[history] createHistory() 需要传入具备 history snapshot/loadState 能力的 store");
  }
  const _0x43ee89 = Number.isFinite(max) && max > 0 ? Math.floor(max) : 50;
  const _0x1d3184 = [];
  const _0x13ee35 = [];
  const _0x3b1a99 = [];
  let _0x400b89 = 0;
  function _0x38580a(_0x4be774 = _0x148530()) {
    return {
      id: "history-" + ++_0x400b89,
      snapshot: _0x4be774
    };
  }
  function _0x148530() {
    if (typeof _0x3d706d.getHistorySnapshot === "function") {
      return _0x3d706d.getHistorySnapshot();
    }
    const _0xd72d49 = _0x3d706d.getState();
    return {
      nodes: _0xd72d49.nodes,
      edges: _0xd72d49.edges
    };
  }
  function _0x4c0bd2(_0x341598) {
    if (typeof _0x3d706d.loadHistorySnapshot === "function") {
      _0x3d706d.loadHistorySnapshot(_0x341598);
      return;
    }
    const _0xdc41c0 = typeof _0x3d706d.getState === "function" ? _0x3d706d.getState()?.viewport : undefined;
    _0x3d706d.loadState(_0xdc41c0 ? {
      ..._0x341598,
      viewport: _0xdc41c0
    } : _0x341598);
  }
  function _0x49e0ba() {
    const _0xad76cd = _0x38580a();
    _0x1d3184.push(_0xad76cd);
    if (_0x1d3184.length > _0x43ee89) {
      _0x1d3184.shift();
    }
    _0x13ee35.length = 0;
    _0x3b1a99.forEach(_0x6e9b99 => {
      try {
        _0x6e9b99();
      } catch (_0x2574e0) {
        console.error("[history] 存档回调执行异常:", _0x2574e0);
      }
    });
    return {
      id: _0xad76cd.id
    };
  }
  function _0x2dafb9(_0x209364) {
    if (typeof _0x209364 === "function") {
      _0x3b1a99.push(_0x209364);
    }
  }
  function _0x44d884() {
    _0x1d3184.length = 0;
    _0x13ee35.length = 0;
    _0x1d3184.push(_0x38580a());
  }
  function _0x1e46b3() {
    if (_0x1d3184.length < 2) {
      console.log("[history] 已到达最早的历史记录，无法继续撤销");
      return;
    }
    const _0x662a89 = _0x1d3184.pop();
    _0x13ee35.push(_0x662a89);
    const _0x2a97d4 = _0x1d3184[_0x1d3184.length - 1];
    _0x4c0bd2(_0x2a97d4.snapshot);
    console.log("[history] undo ← undoStack:" + _0x1d3184.length + " redoStack:" + _0x13ee35.length);
  }
  function _0x41faa2() {
    if (_0x13ee35.length === 0) {
      console.log("[history] 没有可重做的操作");
      return;
    }
    const _0x59a86e = _0x13ee35.pop();
    _0x1d3184.push(_0x59a86e);
    _0x4c0bd2(_0x59a86e.snapshot);
    console.log("[history] redo → undoStack:" + _0x1d3184.length + " redoStack:" + _0x13ee35.length);
  }
  function _0x2e854e() {
    return {
      undoCount: _0x1d3184.length,
      redoCount: _0x13ee35.length
    };
  }
  function _0x3adb87() {
    const _0x4b2a92 = _0x1d3184.at(-1) || null;
    if (_0x4b2a92) {
      return {
        id: _0x4b2a92.id
      };
    } else {
      return null;
    }
  }
  function _0x2ecdb8(_0x2ab8c8, {
    expectedHead = null
  } = {}) {
    const _0x1fe302 = String(_0x2ab8c8?.id || _0x2ab8c8 || "").trim();
    const _0x2d4ede = String(expectedHead?.id || expectedHead || "").trim();
    const _0x1d4cb0 = _0x1d3184.at(-1) || null;
    if (!_0x1fe302 || !_0x1d4cb0) {
      return {
        ok: false,
        errorCode: "HISTORY_CHECKPOINT_MISSING",
        undone: 0
      };
    }
    if (_0x2d4ede && _0x1d4cb0.id !== _0x2d4ede) {
      return {
        ok: false,
        errorCode: "HISTORY_HEAD_CHANGED",
        undone: 0
      };
    }
    const _0x13b4fe = _0x1d3184.findIndex(_0x87dcf1 => _0x87dcf1.id === _0x1fe302);
    if (_0x13b4fe < 0) {
      return {
        ok: false,
        errorCode: "HISTORY_CHECKPOINT_EXPIRED",
        undone: 0
      };
    }
    const _0x31b1ca = _0x1d3184.length - 1 - _0x13b4fe;
    if (_0x31b1ca <= 0) {
      return {
        ok: false,
        errorCode: "HISTORY_NO_CHANGES",
        undone: 0
      };
    }
    for (let _0x2fdd76 = 0; _0x2fdd76 < _0x31b1ca; _0x2fdd76 += 1) {
      _0x1e46b3();
    }
    return {
      ok: true,
      checkpoint: {
        id: _0x1fe302
      },
      undone: _0x31b1ca
    };
  }
  return {
    commit: _0x49e0ba,
    reset: _0x44d884,
    onCommit: _0x2dafb9,
    undo: _0x1e46b3,
    redo: _0x41faa2,
    getHistoryInfo: _0x2e854e,
    createCheckpoint: _0x3adb87,
    undoToCheckpoint: _0x2ecdb8
  };
}
const _defaultHistory = createHistory({
  store: a981_0x4fce83,
  max: 50
});
export function commit() {
  return _defaultHistory.commit();
}
export function resetHistory() {
  return _defaultHistory.reset();
}
export function onCommit(_0x62c43b) {
  return _defaultHistory.onCommit(_0x62c43b);
}
export function undo() {
  return _defaultHistory.undo();
}
export function redo() {
  return _defaultHistory.redo();
}
export function getHistoryInfo() {
  return _defaultHistory.getHistoryInfo();
}
export function createHistoryCheckpoint() {
  return _defaultHistory.createCheckpoint();
}
export function undoToHistoryCheckpoint(_0x162854, _0x12b36c = {}) {
  return _defaultHistory.undoToCheckpoint(_0x162854, _0x12b36c);
}