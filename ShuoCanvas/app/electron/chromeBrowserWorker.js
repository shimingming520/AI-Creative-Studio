import { spawn } from "node:child_process";
import { mkdirSync } from "node:fs";
import a205_0x506181 from "node:path";
function terminateProcessTree(_0x3f0f0e, _0x20d3b8 = process.platform) {
  if (!_0x3f0f0e) {
    return;
  }
  if (_0x20d3b8 === "win32" && Number.isInteger(_0x3f0f0e.pid) && _0x3f0f0e.pid > 0) {
    try {
      const _0x51ac4d = spawn("taskkill.exe", ["/pid", String(_0x3f0f0e.pid), "/T", "/F"], {
        stdio: "ignore",
        windowsHide: true
      });
      _0x51ac4d.unref?.();
      return;
    } catch {}
  }
  try {
    _0x3f0f0e.kill?.();
  } catch {}
}
export function resolveChromeBrowserWorkerProfileDir({
  mainProfileDir: _0x51826e,
  env = process.env
} = {}) {
  const _0x5b5a85 = String(env.AIC_CHROME_BROWSER_NODE_PROFILE_DIR || "").trim();
  if (_0x5b5a85) {
    return a205_0x506181.resolve(_0x5b5a85);
  }
  const _0x2d5a0a = a205_0x506181.resolve(String(_0x51826e || process.cwd()));
  return a205_0x506181.join(a205_0x506181.dirname(_0x2d5a0a), "chrome-browser-node-profile");
}
export function launchChromeBrowserWorker({
  browserPath: _0x25ada3,
  mainProfileDir: _0x27d2d5,
  env = process.env,
  platform = process.platform,
  mkdir = mkdirSync,
  spawnProcess = spawn,
  terminateProcess = terminateProcessTree,
  onExit = null,
  onError = null
} = {}) {
  const _0x3bffbe = String(_0x25ada3 || "").trim();
  if (!_0x3bffbe) {
    throw new Error("Chrome browser worker executable is required");
  }
  const _0x3b13b5 = resolveChromeBrowserWorkerProfileDir({
    mainProfileDir: _0x27d2d5,
    env: env
  });
  mkdir(_0x3b13b5, {
    recursive: true
  });
  const _0x571d98 = ["--user-data-dir=" + _0x3b13b5, "--headless=new", "--no-first-run", "--no-default-browser-check", "--autoplay-policy=no-user-gesture-required", "--remote-debugging-pipe", "about:blank"];
  const _0x12b130 = spawnProcess(_0x3bffbe, _0x571d98, {
    stdio: ["ignore", "ignore", "ignore", "pipe", "pipe"],
    windowsHide: true
  });
  _0x12b130?.once?.("exit", (_0xaf1b32, _0x22d9c3) => onExit?.({
    code: _0xaf1b32,
    signal: _0x22d9c3
  }));
  _0x12b130?.once?.("error", _0x69ae4e => onError?.(_0x69ae4e));
  let _0x19d4a3 = false;
  return {
    browserPath: _0x3bffbe,
    profileDir: _0x3b13b5,
    process: _0x12b130,
    devToolsPipe: _0x12b130?.stdio?.[3] && _0x12b130?.stdio?.[4] ? {
      writable: _0x12b130.stdio[3],
      readable: _0x12b130.stdio[4]
    } : null,
    dispose() {
      if (_0x19d4a3) {
        return;
      }
      _0x19d4a3 = true;
      terminateProcess(_0x12b130, platform);
    }
  };
}
export const __chromeBrowserWorkerForTest = {
  terminateProcessTree: terminateProcessTree
};