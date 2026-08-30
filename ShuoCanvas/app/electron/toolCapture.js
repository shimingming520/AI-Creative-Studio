import { spawn } from "node:child_process";
function createTimeoutError(_0x884d87, _0x3e38ca) {
  const _0x8631d5 = new Error(_0x884d87 + " timed out after " + _0x3e38ca + "ms");
  _0x8631d5.name = "ToolCaptureTimeoutError";
  _0x8631d5.code = "TOOL_CAPTURE_TIMEOUT";
  _0x8631d5.timeoutMs = _0x3e38ca;
  return _0x8631d5;
}
export function runToolCapture(_0x91a2d1, _0x1ff86d, {
  cwd = process.cwd(),
  input = null,
  timeoutMs = 0,
  windowsHide = true
} = {}) {
  return new Promise((_0x407d4c, _0x23ed8c) => {
    const _0x2e0ef9 = input !== null && input !== undefined;
    const _0x465a4f = spawn(_0x91a2d1, _0x1ff86d, {
      cwd: cwd,
      stdio: _0x2e0ef9 ? ["pipe", "pipe", "pipe"] : ["ignore", "pipe", "pipe"],
      windowsHide: windowsHide
    });
    const _0xde39b9 = [];
    const _0x4330f4 = [];
    let _0x421e5f = false;
    let _0x68dcff = null;
    const _0x2ce227 = (_0x2fa77d, _0x3a8ac0) => {
      if (_0x421e5f) {
        return;
      }
      _0x421e5f = true;
      if (_0x68dcff) {
        clearTimeout(_0x68dcff);
      }
      _0x2fa77d(_0x3a8ac0);
    };
    _0x465a4f.stdout?.on("data", _0x25dd3f => _0xde39b9.push(Buffer.from(_0x25dd3f)));
    _0x465a4f.stderr?.on("data", _0xb9acbf => _0x4330f4.push(Buffer.from(_0xb9acbf)));
    _0x465a4f.once("error", _0x31dc88 => _0x2ce227(_0x23ed8c, _0x31dc88));
    _0x465a4f.once("close", (_0xb213c6, _0x1b88a2) => {
      if (_0xb213c6 === 0) {
        _0x2ce227(_0x407d4c, Buffer.concat(_0xde39b9));
        return;
      }
      const _0x39601b = Buffer.concat(_0x4330f4).toString("utf8").trim();
      _0x2ce227(_0x23ed8c, new Error(_0x39601b || _0x91a2d1 + " exited with " + (_0xb213c6 ?? "unknown") + (_0x1b88a2 ? " (" + _0x1b88a2 + ")" : "")));
    });
    const _0x3dc2bb = Math.max(0, Math.trunc(Number(timeoutMs) || 0));
    if (_0x3dc2bb > 0) {
      _0x68dcff = setTimeout(() => {
        const _0x32fcb3 = createTimeoutError(_0x91a2d1, _0x3dc2bb);
        try {
          _0x465a4f.kill();
        } catch {}
        _0x2ce227(_0x23ed8c, _0x32fcb3);
      }, _0x3dc2bb);
      _0x68dcff.unref?.();
    }
    if (_0x2e0ef9 && _0x465a4f.stdin) {
      _0x465a4f.stdin.on("error", _0x3130a6 => {
        if (_0x3130a6?.code !== "EPIPE") {
          _0x2ce227(_0x23ed8c, _0x3130a6);
        }
      });
      _0x465a4f.stdin.end(input);
    }
  });
}