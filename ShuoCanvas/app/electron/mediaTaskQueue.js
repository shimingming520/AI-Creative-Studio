import { spawn } from "node:child_process";
import a252_0x5f2733 from "node:path";
const TERMINAL_STATUSES = new Set(["complete", "failed", "cancelled"]);
const RETRYABLE_SPAWN_ERROR_CODES = new Set(["UNKNOWN", "EBUSY", "EACCES"]);
const DEFAULT_SPAWN_RETRY_DELAY_MS = 180;
const DEFAULT_SPAWN_MAX_ATTEMPTS = 2;
const MIN_TASK_PRIORITY = -100;
const MAX_TASK_PRIORITY = 100;
function clampProgress(_0xa5f886) {
  const _0x1a7fc6 = Number(_0xa5f886);
  if (!Number.isFinite(_0x1a7fc6)) {
    return 0;
  }
  return Math.max(0, Math.min(1, _0x1a7fc6));
}
function normalizeTaskPriority(_0x48c7e8) {
  const _0x4a2275 = Number(_0x48c7e8);
  if (!Number.isFinite(_0x4a2275)) {
    return 0;
  }
  return Math.max(MIN_TASK_PRIORITY, Math.min(MAX_TASK_PRIORITY, Math.trunc(_0x4a2275)));
}
function buildActiveMigrationIdentity(_0x1e21f3, _0x2b740b = {}) {
  const _0x17a113 = String(_0x2b740b?.migrationKey || "").trim();
  if (!_0x17a113) {
    return "";
  }
  return JSON.stringify([String(_0x1e21f3 || "").trim(), String(_0x2b740b?.purpose || "").trim(), _0x17a113]);
}
function createDefaultTaskId() {
  return "media-task-" + Date.now() + "-" + Math.random().toString(16).slice(2);
}
function parseFfmpegTimeSeconds(_0x540b3e) {
  const _0x37497a = String(_0x540b3e || "").match(/time=(\d{2}):(\d{2}):(\d{2})(?:[.,](\d+))?/);
  if (!_0x37497a) {
    return null;
  }
  const _0x3d5628 = Number(_0x37497a[1]) || 0;
  const _0x4e0087 = Number(_0x37497a[2]) || 0;
  const _0x1a94ec = Number(_0x37497a[3]) || 0;
  const _0x22508d = Number("0." + (_0x37497a[4] || "0")) || 0;
  return _0x3d5628 * 3600 + _0x4e0087 * 60 + _0x1a94ec + _0x22508d;
}
function delay(_0xb3b2) {
  return new Promise(_0x18e242 => {
    setTimeout(_0x18e242, _0xb3b2);
  });
}
function getCommandLabel(_0x27a436) {
  const _0x2e9096 = String(_0x27a436 || "").trim();
  if (!_0x2e9096) {
    return "media tool";
  }
  const _0x425df3 = a252_0x5f2733.basename(_0x2e9096);
  return _0x425df3 || _0x2e9096;
}
function shouldRetrySpawnError(_0x5d4a45, _0x2e5089, _0x377111) {
  if (_0x2e5089 >= _0x377111) {
    return false;
  }
  const _0x57c841 = String(_0x5d4a45?.code || "").toUpperCase();
  return RETRYABLE_SPAWN_ERROR_CODES.has(_0x57c841);
}
export function createProcessStartError(_0x14b61a, _0x533fa9, _0x15be0b, _0x458116, _0xc4cc66) {
  const _0x156fea = getCommandLabel(_0x14b61a);
  const _0x16965d = String(_0x458116?.message || _0x458116 || "unknown error");
  const _0x3ca495 = new Error("Failed to start " + _0x156fea + ": " + _0x16965d, {
    cause: _0x458116 instanceof Error ? _0x458116 : undefined
  });
  _0x3ca495.name = "MediaTaskProcessStartError";
  _0x3ca495.command = String(_0x14b61a || "");
  _0x3ca495.commandLabel = _0x156fea;
  _0x3ca495.args = Array.isArray(_0x533fa9) ? _0x533fa9.map(_0x3d4ec6 => String(_0x3d4ec6)) : [];
  _0x3ca495.cwd = String(_0x15be0b?.cwd || "");
  _0x3ca495.attempt = _0xc4cc66;
  if (_0x458116?.code != null) {
    _0x3ca495.code = _0x458116.code;
  }
  if (_0x458116?.errno != null) {
    _0x3ca495.errno = _0x458116.errno;
  }
  if (_0x458116?.syscall != null) {
    _0x3ca495.syscall = _0x458116.syscall;
  }
  if (_0x458116?.path != null) {
    _0x3ca495.path = _0x458116.path;
  }
  return _0x3ca495;
}
export class MediaTaskCancelledError extends Error {
  constructor(_0x2372bb = "Media task cancelled") {
    super(_0x2372bb);
    this.name = "MediaTaskCancelledError";
  }
}
export class MediaTaskProcessTimeoutError extends Error {
  constructor(_0x56503b, _0x3d00f4) {
    super(getCommandLabel(_0x56503b) + " timed out after " + _0x3d00f4 + "ms");
    this.name = "MediaTaskProcessTimeoutError";
    this.code = "MEDIA_TASK_PROCESS_TIMEOUT";
    this.command = String(_0x56503b || "");
    this.commandLabel = getCommandLabel(_0x56503b);
    this.timeoutMs = _0x3d00f4;
  }
}
export class MediaTaskQueue {
  constructor({
    concurrency = 2,
    handlers = {},
    onUpdate = null,
    onActivity = null,
    idFactory = createDefaultTaskId,
    spawnImpl = spawn
  } = {}) {
    this.concurrency = Math.max(1, Math.trunc(Number(concurrency) || 1));
    this.handlers = {
      ...handlers
    };
    this.onUpdate = typeof onUpdate === "function" ? onUpdate : () => {};
    this.onActivity = typeof onActivity === "function" ? onActivity : () => {};
    this.idFactory = typeof idFactory === "function" ? idFactory : createDefaultTaskId;
    this.spawnImpl = typeof spawnImpl === "function" ? spawnImpl : spawn;
    this.tasks = new Map();
    this.waiting = [];
    this.activeMigrationTasks = new Map();
    this.active = 0;
  }
  setHandler(_0x390f54, _0x4ec137) {
    const _0x12e4a4 = String(_0x390f54 || "").trim();
    if (!_0x12e4a4 || typeof _0x4ec137 !== "function") {
      return;
    }
    this.handlers[_0x12e4a4] = _0x4ec137;
  }
  enqueue(_0x2726ff = {}) {
    const _0x172b8a = String(_0x2726ff?.kind || "").trim();
    if (!_0x172b8a) {
      throw new Error("Missing media task kind");
    }
    const _0x58bda8 = this.handlers[_0x172b8a];
    if (typeof _0x58bda8 !== "function") {
      throw new Error("Unsupported media task kind: " + _0x172b8a);
    }
    const _0x17b283 = buildActiveMigrationIdentity(_0x172b8a, _0x2726ff);
    if (_0x17b283) {
      const _0x52ea99 = this.activeMigrationTasks.get(_0x17b283);
      if (_0x52ea99 && !TERMINAL_STATUSES.has(_0x52ea99.status)) {
        return this._snapshot(_0x52ea99);
      }
      this.activeMigrationTasks.delete(_0x17b283);
    }
    const _0x5d2be3 = String(_0x2726ff?.taskId || "").trim() || this.idFactory();
    const _0x57a046 = {
      id: _0x5d2be3,
      taskId: _0x5d2be3,
      kind: _0x172b8a,
      nodeId: String(_0x2726ff?.nodeId || "").trim(),
      payload: {
        ..._0x2726ff,
        kind: _0x172b8a,
        taskId: _0x5d2be3
      },
      priority: normalizeTaskPriority(_0x2726ff?.priority),
      status: "waiting",
      progress: 0,
      stage: "",
      message: "",
      error: "",
      result: null,
      child: null,
      cancelRequested: false,
      migrationIdentity: _0x17b283,
      createdAt: Date.now(),
      startedAt: 0,
      finishedAt: 0
    };
    this.tasks.set(_0x5d2be3, _0x57a046);
    if (_0x17b283) {
      this.activeMigrationTasks.set(_0x17b283, _0x57a046);
    }
    this.waiting.push(_0x57a046);
    this._emit(_0x57a046);
    this._pump();
    return this._snapshot(_0x57a046);
  }
  cancel(_0x2fa784, _0x1270d5 = {}) {
    const _0x1c3854 = String(_0x2fa784 || "").trim();
    const _0x423b42 = this.tasks.get(_0x1c3854);
    if (!_0x423b42) {
      return {
        ok: false,
        error: "Task not found"
      };
    }
    if (_0x1270d5?.onlyIfWaiting === true && _0x423b42.status !== "waiting") {
      return {
        ok: true,
        skipped: true,
        reason: TERMINAL_STATUSES.has(_0x423b42.status) ? "task-already-finished" : "task-already-started",
        task: this._snapshot(_0x423b42)
      };
    }
    if (TERMINAL_STATUSES.has(_0x423b42.status)) {
      return {
        ok: true,
        task: this._snapshot(_0x423b42)
      };
    }
    _0x423b42.cancelRequested = true;
    if (_0x423b42.status === "waiting") {
      this.waiting = this.waiting.filter(_0x4d5c74 => _0x4d5c74.id !== _0x1c3854);
      this._finish(_0x423b42, "cancelled", {
        progress: _0x423b42.progress,
        message: "Cancelled"
      });
      this._pump();
      return {
        ok: true,
        task: this._snapshot(_0x423b42)
      };
    }
    if (_0x423b42.child && typeof _0x423b42.child.kill === "function") {
      try {
        _0x423b42.child.kill();
      } catch {}
    }
    this._emit(_0x423b42, {
      message: "Cancelling"
    });
    return {
      ok: true,
      task: this._snapshot(_0x423b42)
    };
  }
  get(_0xa3ac17) {
    const _0x4aaf12 = this.tasks.get(String(_0xa3ac17 || "").trim());
    if (_0x4aaf12) {
      return this._snapshot(_0x4aaf12);
    } else {
      return null;
    }
  }
  list({
    limit = 100
  } = {}) {
    const _0x537eee = Math.max(1, Math.min(500, Math.trunc(Number(limit) || 100)));
    return [...this.tasks.values()].sort((_0x3547ba, _0xba12df) => Number(_0xba12df.createdAt || 0) - Number(_0x3547ba.createdAt || 0)).slice(0, _0x537eee).map(_0x2df8d0 => this._snapshot(_0x2df8d0));
  }
  getActivity() {
    return this._activitySnapshot();
  }
  emitProgress(_0x44fd51, _0x48192b, _0x160d87 = "", _0x35aa59 = {}) {
    if (!_0x44fd51 || TERMINAL_STATUSES.has(_0x44fd51.status)) {
      return;
    }
    _0x44fd51.progress = clampProgress(_0x48192b);
    if (_0x35aa59.stage != null) {
      _0x44fd51.stage = String(_0x35aa59.stage || "");
    }
    if (_0x160d87) {
      _0x44fd51.message = String(_0x160d87);
    }
    this._emit(_0x44fd51);
  }
  isCancelled(_0x4c13e8) {
    return _0x4c13e8?.cancelRequested === true;
  }
  throwIfCancelled(_0x334388) {
    if (this.isCancelled(_0x334388)) {
      throw new MediaTaskCancelledError();
    }
  }
  runProcess(_0x525337, _0x441b9e, _0x209c79 = [], _0x1ac5b9 = {}) {
    this.throwIfCancelled(_0x525337);
    return new Promise((_0x1e8a7d, _0x4b001c) => {
      const _0x436085 = [];
      const _0x3c1763 = [];
      const _0x56c4a1 = Number(_0x1ac5b9.durationSec || 0);
      const _0x1bc41e = _0x1ac5b9.input !== null && _0x1ac5b9.input !== undefined;
      let _0x88dc5c = clampProgress(_0x1ac5b9.initialProgress || _0x525337.progress || 0);
      let _0x5f0b27 = false;
      const _0x24ebae = (_0x2d2f37, _0x42fb3f) => {
        if (_0x5f0b27) {
          return;
        }
        _0x5f0b27 = true;
        _0x525337.child = null;
        _0x2d2f37(_0x42fb3f);
      };
      const _0x39c239 = Math.max(1, Math.trunc(Number(_0x1ac5b9.spawnMaxAttempts || DEFAULT_SPAWN_MAX_ATTEMPTS) || 1));
      const _0xe481e8 = Math.max(0, Math.trunc(Number(_0x1ac5b9.spawnRetryDelayMs ?? DEFAULT_SPAWN_RETRY_DELAY_MS) || 0));
      const _0x4b239a = Math.max(0, Math.trunc(Number(_0x1ac5b9.timeoutMs || 0) || 0));
      const _0x2d44f3 = async (_0x3e789c = 1) => {
        if (_0x5f0b27) {
          return;
        }
        try {
          this.throwIfCancelled(_0x525337);
        } catch (_0x2809e0) {
          _0x24ebae(_0x4b001c, _0x2809e0);
          return;
        }
        let _0x2cf2ff = null;
        try {
          _0x2cf2ff = this.spawnImpl(_0x441b9e, _0x209c79, {
            cwd: _0x1ac5b9.cwd,
            env: _0x1ac5b9.env,
            stdio: _0x1bc41e ? ["pipe", "pipe", "pipe"] : ["ignore", "pipe", "pipe"],
            windowsHide: true
          });
        } catch (_0x8c5540) {
          if (shouldRetrySpawnError(_0x8c5540, _0x3e789c, _0x39c239)) {
            await delay(_0xe481e8);
            await _0x2d44f3(_0x3e789c + 1);
            return;
          }
          _0x24ebae(_0x4b001c, createProcessStartError(_0x441b9e, _0x209c79, _0x1ac5b9, _0x8c5540, _0x3e789c));
          return;
        }
        _0x525337.child = _0x2cf2ff;
        let _0x49820d = false;
        let _0x5d354f = null;
        const _0x2d8dac = () => {
          if (_0x5d354f) {
            clearTimeout(_0x5d354f);
          }
          _0x5d354f = null;
        };
        const _0x560a6d = (_0x120696, _0x5966c5) => {
          if (_0x49820d || _0x5f0b27) {
            return;
          }
          _0x49820d = true;
          if (_0x525337.child === _0x2cf2ff) {
            _0x525337.child = null;
          }
          _0x2d8dac();
          _0x24ebae(_0x120696, _0x5966c5);
        };
        const _0x516345 = async _0x1325da => {
          if (_0x49820d || _0x5f0b27) {
            return;
          }
          _0x49820d = true;
          _0x2d8dac();
          if (_0x525337.child === _0x2cf2ff) {
            _0x525337.child = null;
          }
          if (shouldRetrySpawnError(_0x1325da, _0x3e789c, _0x39c239) && !this.isCancelled(_0x525337)) {
            await delay(_0xe481e8);
            await _0x2d44f3(_0x3e789c + 1);
            return;
          }
          _0x24ebae(_0x4b001c, createProcessStartError(_0x441b9e, _0x209c79, _0x1ac5b9, _0x1325da, _0x3e789c));
        };
        _0x2cf2ff.stdout?.on("data", _0x2ea58e => _0x436085.push(Buffer.from(_0x2ea58e)));
        _0x2cf2ff.stderr?.on("data", _0x2594a1 => {
          const _0x3eafe8 = Buffer.from(_0x2594a1);
          _0x3c1763.push(_0x3eafe8);
          if (_0x56c4a1 > 0) {
            const _0x569b50 = parseFfmpegTimeSeconds(_0x3eafe8.toString("utf8"));
            if (_0x569b50 != null) {
              const _0x49ad6f = clampProgress(_0x569b50 / _0x56c4a1);
              if (_0x49ad6f >= _0x88dc5c + 0.01) {
                _0x88dc5c = _0x49ad6f;
                this.emitProgress(_0x525337, _0x49ad6f, _0x1ac5b9.progressMessage || "");
              }
            }
          }
        });
        _0x2cf2ff.once("error", _0x595355 => {
          _0x516345(_0x595355);
        });
        _0x2cf2ff.once("exit", (_0xb99846, _0x200087) => {
          if (_0x49820d || _0x5f0b27) {
            return;
          }
          if (this.isCancelled(_0x525337)) {
            _0x560a6d(_0x4b001c, new MediaTaskCancelledError());
            return;
          }
          if (_0xb99846 === 0) {
            _0x560a6d(_0x1e8a7d, {
              stdout: Buffer.concat(_0x436085),
              stderr: Buffer.concat(_0x3c1763),
              code: _0xb99846,
              signal: _0x200087
            });
            return;
          }
          const _0x3b975a = Buffer.concat(_0x3c1763).toString("utf8").trim() || _0x441b9e + " exited with " + (_0xb99846 ?? _0x200087 ?? "unknown");
          _0x560a6d(_0x4b001c, new Error(_0x3b975a));
        });
        if (_0x4b239a > 0) {
          _0x5d354f = setTimeout(() => {
            if (_0x49820d || _0x5f0b27) {
              return;
            }
            const _0x517b58 = new MediaTaskProcessTimeoutError(_0x441b9e, _0x4b239a);
            try {
              _0x2cf2ff.kill();
            } catch {}
            _0x560a6d(_0x4b001c, _0x517b58);
          }, _0x4b239a);
          _0x5d354f.unref?.();
        }
        if (_0x1bc41e && _0x2cf2ff.stdin) {
          _0x2cf2ff.stdin.end(_0x1ac5b9.input);
        }
      };
      _0x2d44f3();
    });
  }
  _pump() {
    while (this.active < this.concurrency && this.waiting.length > 0) {
      let _0x406919 = 0;
      for (let _0x22837f = 1; _0x22837f < this.waiting.length; _0x22837f += 1) {
        const _0x372c97 = normalizeTaskPriority(this.waiting[_0x22837f]?.priority);
        const _0x8040ba = normalizeTaskPriority(this.waiting[_0x406919]?.priority);
        if (_0x372c97 > _0x8040ba) {
          _0x406919 = _0x22837f;
        }
      }
      const [_0x3d8894] = this.waiting.splice(_0x406919, 1);
      if (!_0x3d8894 || TERMINAL_STATUSES.has(_0x3d8894.status)) {
        continue;
      }
      this._run(_0x3d8894);
    }
  }
  async _run(_0x13aafe) {
    this.active += 1;
    _0x13aafe.status = "processing";
    _0x13aafe.startedAt = Date.now();
    _0x13aafe.progress = Math.max(_0x13aafe.progress, 0.01);
    this._emit(_0x13aafe);
    try {
      const _0x1561a7 = await this.handlers[_0x13aafe.kind](_0x13aafe, this);
      this.throwIfCancelled(_0x13aafe);
      this._finish(_0x13aafe, "complete", {
        progress: 1,
        message: "Complete",
        result: _0x1561a7 && typeof _0x1561a7 === "object" ? _0x1561a7 : {}
      });
    } catch (_0x5361f3) {
      if (_0x5361f3 instanceof MediaTaskCancelledError || this.isCancelled(_0x13aafe)) {
        this._finish(_0x13aafe, "cancelled", {
          message: "Cancelled",
          error: ""
        });
      } else {
        this._finish(_0x13aafe, "failed", {
          message: "Failed",
          error: String(_0x5361f3?.message || _0x5361f3)
        });
      }
    } finally {
      this.active -= 1;
      this._pump();
    }
  }
  _finish(_0x4278c7, _0x1f2890, _0x143f00 = {}) {
    _0x4278c7.status = _0x1f2890;
    if (_0x4278c7.migrationIdentity && this.activeMigrationTasks.get(_0x4278c7.migrationIdentity) === _0x4278c7) {
      this.activeMigrationTasks.delete(_0x4278c7.migrationIdentity);
    }
    _0x4278c7.finishedAt = Date.now();
    _0x4278c7.child = null;
    if (_0x143f00.progress != null) {
      _0x4278c7.progress = clampProgress(_0x143f00.progress);
    }
    if (_0x143f00.stage != null) {
      _0x4278c7.stage = String(_0x143f00.stage || "");
    }
    if (_0x143f00.message != null) {
      _0x4278c7.message = String(_0x143f00.message || "");
    }
    if (_0x143f00.error != null) {
      _0x4278c7.error = String(_0x143f00.error || "");
    }
    if (_0x143f00.result != null) {
      _0x4278c7.result = _0x143f00.result;
    }
    this._emit(_0x4278c7);
  }
  _emit(_0x1b9c6d, _0x3428a0 = {}) {
    if (!_0x1b9c6d) {
      return;
    }
    if (_0x3428a0.progress != null) {
      _0x1b9c6d.progress = clampProgress(_0x3428a0.progress);
    }
    if (_0x3428a0.message != null) {
      _0x1b9c6d.message = String(_0x3428a0.message || "");
    }
    if (_0x3428a0.error != null) {
      _0x1b9c6d.error = String(_0x3428a0.error || "");
    }
    if (_0x3428a0.result != null) {
      _0x1b9c6d.result = _0x3428a0.result;
    }
    this.onUpdate(this._snapshot(_0x1b9c6d));
    this._emitActivity();
  }
  _emitActivity() {
    this.onActivity(this._activitySnapshot());
  }
  _activitySnapshot() {
    const _0x4ffd9f = [...this.tasks.values()].filter(_0x22158e => _0x22158e.status === "processing").map(_0x228660 => this._snapshot(_0x228660));
    const _0x157d1c = this.waiting.filter(_0x463afd => _0x463afd.status === "waiting").length;
    const _0x259ac1 = _0x4ffd9f.length > 0 ? _0x4ffd9f.reduce((_0x7431cc, _0x3babc4) => _0x7431cc + clampProgress(_0x3babc4.progress), 0) / _0x4ffd9f.length : 0;
    return {
      activeCount: _0x4ffd9f.length,
      waitingCount: _0x157d1c,
      totalCount: _0x4ffd9f.length + _0x157d1c,
      progress: clampProgress(_0x259ac1),
      activeTasks: _0x4ffd9f
    };
  }
  _snapshot(_0x1db43c) {
    return {
      taskId: _0x1db43c.id,
      nodeId: _0x1db43c.nodeId,
      assetId: _0x1db43c.payload?.assetId || "",
      kind: _0x1db43c.kind,
      purpose: String(_0x1db43c.payload?.purpose || ""),
      priority: normalizeTaskPriority(_0x1db43c.priority),
      status: _0x1db43c.status,
      progress: clampProgress(_0x1db43c.progress),
      stage: _0x1db43c.stage || "",
      message: _0x1db43c.message || "",
      error: _0x1db43c.error || "",
      result: _0x1db43c.result || null,
      createdAt: _0x1db43c.createdAt,
      startedAt: _0x1db43c.startedAt,
      finishedAt: _0x1db43c.finishedAt
    };
  }
}
export function __parseFfmpegTimeSecondsForTest(_0xc20308) {
  return parseFfmpegTimeSeconds(_0xc20308);
}