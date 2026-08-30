import { assertStartupPortCanBeReclaimed } from "./startupPortPolicy.js";
function normalizeListenerPids(_0xbdb11f = []) {
  return [...new Set((Array.isArray(_0xbdb11f) ? _0xbdb11f : []).map(_0x2a5624 => Number(_0x2a5624)).filter(_0x724049 => Number.isInteger(_0x724049) && _0x724049 > 0))];
}
function samePidSet(_0x454298, _0x3a4f58) {
  return _0x454298.length === _0x3a4f58.length && _0x454298.every(_0x110a8f => _0x3a4f58.includes(_0x110a8f));
}
function createPortRecoveryError(_0x422004, _0x487f22, _0x2e7c84) {
  const _0x5f45b2 = new Error(_0x422004);
  _0x5f45b2.code = _0x487f22;
  _0x5f45b2.details = _0x2e7c84;
  return _0x5f45b2;
}
export async function reclaimStartupPort({
  port: _0x14faab,
  env = process.env,
  collectListeningPortPids: _0x4e35f5,
  confirmRuntimeIdentity: _0xcd3970,
  terminateProcess: _0x4c7b3d,
  delayFn: _0x291469,
  settleDelayMs = 800,
  onReclaim = null
} = {}) {
  if (typeof _0x4e35f5 !== "function") {
    throw new TypeError("Startup port listener collector is required");
  }
  if (typeof _0x4c7b3d !== "function") {
    throw new TypeError("Startup port process terminator is required");
  }
  const _0x5e3cdc = normalizeListenerPids(await _0x4e35f5(_0x14faab));
  if (_0x5e3cdc.length === 0) {
    return {
      reclaimed: false,
      pids: []
    };
  }
  const _0x2039a4 = async _0x5994b2 => normalizeListenerPids(typeof _0xcd3970 === "function" ? await _0xcd3970({
    port: _0x14faab,
    pids: _0x5994b2
  }) : []);
  const _0x244b6c = await _0x2039a4(_0x5e3cdc);
  assertStartupPortCanBeReclaimed({
    port: _0x14faab,
    pids: _0x5e3cdc,
    verifiedPids: _0x244b6c,
    env: env
  });
  const _0x51cdd9 = normalizeListenerPids(await _0x4e35f5(_0x14faab));
  if (_0x51cdd9.length === 0) {
    return {
      reclaimed: true,
      pids: []
    };
  }
  if (!samePidSet(_0x5e3cdc, _0x51cdd9)) {
    throw createPortRecoveryError("Port " + _0x14faab + " listener ownership changed before termination", "AIC_STARTUP_PORT_OWNERSHIP_CHANGED", {
      port: _0x14faab,
      expectedPids: _0x5e3cdc,
      currentPids: _0x51cdd9
    });
  }
  assertStartupPortCanBeReclaimed({
    port: _0x14faab,
    pids: _0x51cdd9,
    verifiedPids: await _0x2039a4(_0x51cdd9),
    env: env
  });
  onReclaim?.({
    port: _0x14faab,
    pids: _0x5e3cdc
  });
  const _0x116036 = [];
  for (const _0x29418b of _0x5e3cdc) {
    try {
      await _0x4c7b3d(_0x29418b);
    } catch (_0x37e243) {
      _0x116036.push({
        pid: _0x29418b,
        error: String(_0x37e243?.message || _0x37e243)
      });
    }
  }
  if (_0x116036.length > 0) {
    throw createPortRecoveryError("Failed to stop the verified stale runtime on port " + _0x14faab, "AIC_STARTUP_PORT_RECLAIM_FAILED", {
      port: _0x14faab,
      pids: _0x116036.map(_0x29ba35 => _0x29ba35.pid),
      failures: _0x116036
    });
  }
  await _0x291469?.(Math.max(0, Number(settleDelayMs) || 0));
  const _0x4764ee = normalizeListenerPids(await _0x4e35f5(_0x14faab));
  if (_0x4764ee.length > 0) {
    throw createPortRecoveryError("Port " + _0x14faab + " is still busy after stopping the verified stale runtime", "AIC_STARTUP_PORT_STILL_BUSY", {
      port: _0x14faab,
      pids: _0x4764ee
    });
  }
  return {
    reclaimed: true,
    pids: _0x5e3cdc
  };
}