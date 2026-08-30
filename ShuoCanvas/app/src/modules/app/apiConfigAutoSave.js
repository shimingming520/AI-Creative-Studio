export function createApiConfigAutoSaveController({
  collectConfig: _0x14e3b7,
  saveConfig: _0x3f60ae,
  onSaved: _0x5bf46e,
  onError: _0x1a93b5,
  timerHost = globalThis.window || globalThis,
  delay = 600
} = {}) {
  let _0x4b4b29 = null;
  function _0x54c20d() {
    if (_0x4b4b29 === null) {
      return;
    }
    timerHost.clearTimeout(_0x4b4b29);
    _0x4b4b29 = null;
  }
  async function _0xb59f86(_0x2b913a = {}) {
    _0x54c20d();
    const _0x40f599 = _0x14e3b7();
    try {
      await _0x3f60ae(_0x40f599);
      _0x5bf46e?.(_0x40f599, _0x2b913a);
      return _0x40f599;
    } catch (_0x568f2f) {
      _0x1a93b5?.(_0x568f2f, _0x2b913a);
      return null;
    }
  }
  function _0x170667() {
    _0x54c20d();
    _0x4b4b29 = timerHost.setTimeout(() => {
      _0x4b4b29 = null;
      _0xb59f86().catch(() => {});
    }, delay);
  }
  function _0x1329e2() {
    if (_0x4b4b29 === null) {
      return Promise.resolve(null);
    } else {
      return _0xb59f86();
    }
  }
  return {
    persist: _0xb59f86,
    schedule: _0x170667,
    flush: _0x1329e2
  };
}