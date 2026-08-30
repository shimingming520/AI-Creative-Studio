const TRUE_RE = /^(1|true|yes|on)$/i;
export function assertStartupPortCanBeReclaimed({
  port: _0x1e1a20,
  pids = [],
  verifiedPids = [],
  env = process.env
} = {}) {
  const _0x44c0f9 = [...new Set(pids.map(_0x41e2e7 => Number(_0x41e2e7)).filter(_0x156238 => Number.isInteger(_0x156238) && _0x156238 > 0))];
  if (_0x44c0f9.length === 0) {
    return;
  }
  if (TRUE_RE.test(String(env?.AICANVAS_TEST_FAIL_IF_PORT_BUSY || "").trim())) {
    throw new Error("Test port " + _0x1e1a20 + " is busy; refusing to terminate listener PIDs " + _0x44c0f9.join(", "));
  }
  const _0x465cb6 = new Set(verifiedPids.map(_0xf1da97 => Number(_0xf1da97)).filter(_0x247a47 => Number.isInteger(_0x247a47) && _0x247a47 > 0));
  const _0x49579b = _0x44c0f9.filter(_0x491019 => !_0x465cb6.has(_0x491019));
  if (_0x49579b.length > 0) {
    const _0x3a67df = new Error("Port " + _0x1e1a20 + " is owned by an unverified process; refusing to terminate listener PIDs " + _0x49579b.join(", "));
    _0x3a67df.code = "AIC_STARTUP_PORT_OWNERSHIP_UNVERIFIED";
    _0x3a67df.details = {
      port: _0x1e1a20,
      pids: _0x44c0f9,
      unverifiedPids: _0x49579b
    };
    throw _0x3a67df;
  }
}