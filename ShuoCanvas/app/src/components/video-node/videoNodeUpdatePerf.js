function isPerfProbeEnabled() {
  return typeof window !== "undefined" && window.__perfProbeEnabled === true;
}
function nowMs() {
  if (typeof performance !== "undefined" && typeof performance.now === "function") {
    return performance.now();
  } else {
    return Date.now();
  }
}
export function createVideoNodeUpdatePerf() {
  if (!isPerfProbeEnabled()) {
    return null;
  }
  const _0x492670 = nowMs();
  let _0x13eb48 = _0x492670;
  const _0x32cba1 = [];
  const _0x4be404 = {};
  return {
    detail(_0x5aa2e6, _0x3ceb2b) {
      _0x4be404[String(_0x5aa2e6 || "")] = String(_0x3ceb2b ?? "").slice(0, 500);
    },
    mark(_0x413847) {
      const _0x36b2e1 = nowMs();
      const _0x13cf78 = _0x36b2e1 - _0x13eb48;
      _0x13eb48 = _0x36b2e1;
      if (Number.isFinite(_0x13cf78) && _0x13cf78 >= 0) {
        _0x32cba1.push({
          name: String(_0x413847 || ""),
          durationMs: _0x13cf78
        });
      }
    },
    finish() {
      const _0x107a92 = nowMs() - _0x492670;
      return {
        totalMs: Number.isFinite(_0x107a92) ? _0x107a92 : 0,
        details: _0x4be404,
        sections: _0x32cba1.filter(_0x15dc40 => _0x15dc40.durationMs >= 0.05).sort((_0x4da545, _0x41000d) => _0x41000d.durationMs - _0x4da545.durationMs).slice(0, 12)
      };
    }
  };
}