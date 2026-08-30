import { spawnSync } from "node:child_process";
import { Buffer } from "node:buffer";
import { unlinkSync } from "node:fs";
import a207_0x1925f1 from "node:path";
export const DEFAULT_MIN_CHROME_VERSION = "148.0.7778.280";
export const DEFAULT_MIN_EDGE_VERSION = "148.0.0.0";
export const DEFAULT_MIN_CHROMIUM_VERSION = DEFAULT_MIN_CHROME_VERSION;
const VERSION_CHECK_TIMEOUT_MS = 5000;
const SUPPORTED_BROWSER_KINDS = new Set(["chrome", "edge", "chromium"]);
const WINDOWS_BROWSER_PATH_ENV_NAME = "AIC_CHROME_SHELL_BROWSER_PATH_BASE64";
const WINDOWS_VERSION_SCRIPT = ["$encodedTarget = $env:" + WINDOWS_BROWSER_PATH_ENV_NAME, "if (-not $encodedTarget) { exit 2 }", "$target = [Text.Encoding]::UTF8.GetString([Convert]::FromBase64String($encodedTarget))", "if (-not $target) { exit 2 }", "$item = Get-Item -LiteralPath $target -ErrorAction Stop", "[Console]::Out.Write($item.VersionInfo.ProductVersion)"].join("; ");
const WINDOWS_VERSION_ENCODED_COMMAND = Buffer.from(WINDOWS_VERSION_SCRIPT, "utf16le").toString("base64");
function parseVersionParts(_0x14501e) {
  const _0x40faa3 = String(_0x14501e || "").match(/\b(\d+(?:\.\d+){1,3})\b/);
  if (!_0x40faa3) {
    return null;
  }
  const _0x2116a2 = _0x40faa3[1].split(".").map(_0x170421 => Number.parseInt(_0x170421, 10));
  if (_0x2116a2.some(_0x33e239 => !Number.isFinite(_0x33e239) || _0x33e239 < 0)) {
    return null;
  }
  while (_0x2116a2.length < 4) {
    _0x2116a2.push(0);
  }
  return {
    text: _0x40faa3[1],
    parts: _0x2116a2
  };
}
export function compareBrowserVersions(_0x2966e7, _0xb16d10) {
  const _0x321c1a = parseVersionParts(_0x2966e7);
  const _0x76ddcb = parseVersionParts(_0xb16d10);
  if (!_0x321c1a || !_0x76ddcb) {
    return null;
  }
  for (let _0x54984c = 0; _0x54984c < 4; _0x54984c += 1) {
    if (_0x321c1a.parts[_0x54984c] < _0x76ddcb.parts[_0x54984c]) {
      return -1;
    }
    if (_0x321c1a.parts[_0x54984c] > _0x76ddcb.parts[_0x54984c]) {
      return 1;
    }
  }
  return 0;
}
export function identifyChromeShellBrowser(_0x7f4a9) {
  const _0x19387a = a207_0x1925f1.basename(String(_0x7f4a9 || "")).toLowerCase();
  if (_0x19387a === "chrome.exe" || _0x19387a === "chrome" || _0x19387a === "google chrome" || _0x19387a === "google-chrome" || _0x19387a === "google-chrome-stable") {
    return "chrome";
  }
  if (_0x19387a === "msedge.exe" || _0x19387a === "msedge" || _0x19387a === "microsoft edge" || _0x19387a === "microsoft-edge" || _0x19387a === "microsoft-edge-stable") {
    return "edge";
  }
  if (_0x19387a === "chromium" || _0x19387a === "chromium-browser") {
    return "chromium";
  }
  return "unknown";
}
function extractVersionFromProcessResult(_0x1975b6) {
  if (_0x1975b6?.status !== 0 || _0x1975b6?.error || _0x1975b6?.signal) {
    return "";
  }
  return parseVersionParts(_0x1975b6?.stdout)?.text || "";
}
export function readBrowserExecutableVersion({
  browserPath: _0x1d5405,
  platform = process.platform,
  spawnProcess = spawnSync
} = {}) {
  const _0x2e4317 = String(_0x1d5405 || "").trim();
  if (!_0x2e4317) {
    return "";
  }
  try {
    if (platform === "win32") {
      const _0x26e8b2 = spawnProcess("powershell.exe", ["-NoLogo", "-NoProfile", "-NonInteractive", "-ExecutionPolicy", "Bypass", "-EncodedCommand", WINDOWS_VERSION_ENCODED_COMMAND], {
        encoding: "utf8",
        env: {
          ...process.env,
          [WINDOWS_BROWSER_PATH_ENV_NAME]: Buffer.from(_0x2e4317, "utf8").toString("base64")
        },
        timeout: VERSION_CHECK_TIMEOUT_MS,
        windowsHide: true
      });
      return extractVersionFromProcessResult(_0x26e8b2);
    }
    const _0x121021 = spawnProcess(_0x2e4317, ["--version"], {
      encoding: "utf8",
      timeout: VERSION_CHECK_TIMEOUT_MS,
      windowsHide: true
    });
    return extractVersionFromProcessResult(_0x121021);
  } catch {
    return "";
  }
}
function resolveMinimumBrowserVersion(_0x5a8df5, _0x1af40a = process.env) {
  const _0x5ae5f6 = _0x5a8df5 === "edge" ? "AIC_CHROME_SHELL_MIN_EDGE_VERSION" : _0x5a8df5 === "chromium" ? "AIC_CHROME_SHELL_MIN_CHROMIUM_VERSION" : "AIC_CHROME_SHELL_MIN_CHROME_VERSION";
  const _0x3a93a8 = parseVersionParts(_0x1af40a?.[_0x5ae5f6])?.text;
  if (_0x3a93a8) {
    return _0x3a93a8;
  }
  if (_0x5a8df5 === "edge") {
    return DEFAULT_MIN_EDGE_VERSION;
  }
  if (_0x5a8df5 === "chromium") {
    return DEFAULT_MIN_CHROMIUM_VERSION;
  }
  return DEFAULT_MIN_CHROME_VERSION;
}
function clearRememberedBrowserChoice(_0x2cbe17, _0x53b6b6 = unlinkSync) {
  if (!_0x2cbe17) {
    return;
  }
  try {
    _0x53b6b6(_0x2cbe17);
  } catch {}
}
export function inspectChromeShellBrowserVersion({
  browserPath: _0xb3cc2f,
  env = process.env,
  platform = process.platform,
  spawnProcess = spawnSync
} = {}) {
  const _0x2a8d89 = identifyChromeShellBrowser(_0xb3cc2f);
  const _0x2c1fc7 = resolveMinimumBrowserVersion(_0x2a8d89, env);
  if (!SUPPORTED_BROWSER_KINDS.has(_0x2a8d89)) {
    return {
      browserKind: _0x2a8d89,
      browserPath: String(_0xb3cc2f || ""),
      version: "",
      minimumVersion: _0x2c1fc7,
      checked: false,
      outdated: true,
      reason: "unsupported-browser"
    };
  }
  const _0x46949a = readBrowserExecutableVersion({
    browserPath: _0xb3cc2f,
    platform: platform,
    spawnProcess: spawnProcess
  });
  const _0x308fb4 = compareBrowserVersions(_0x46949a, _0x2c1fc7);
  if (_0x308fb4 === null) {
    return {
      browserKind: _0x2a8d89,
      browserPath: String(_0xb3cc2f || ""),
      version: "",
      minimumVersion: _0x2c1fc7,
      checked: false,
      outdated: true,
      reason: "version-unavailable"
    };
  }
  return {
    browserKind: _0x2a8d89,
    browserPath: String(_0xb3cc2f || ""),
    version: _0x46949a,
    minimumVersion: _0x2c1fc7,
    checked: true,
    outdated: _0x308fb4 < 0,
    reason: _0x308fb4 < 0 ? "version-too-old" : "supported"
  };
}
export async function checkChromeShellBrowserVersionBeforeLaunch({
  browserPath: _0x40763b,
  edgeBrowserPath = "",
  preferencePath = "",
  env = process.env,
  platform = process.platform,
  spawnProcess = spawnSync,
  logEvent = null,
  unlink = unlinkSync
} = {}) {
  clearRememberedBrowserChoice(preferencePath, unlink);
  const _0x580473 = inspectChromeShellBrowserVersion({
    browserPath: _0x40763b,
    env: env,
    platform: platform,
    spawnProcess: spawnProcess
  });
  logEvent?.({
    type: "chrome_shell.browser_version_checked",
    level: _0x580473.outdated ? "warn" : "info",
    source: "main",
    message: _0x580473.reason === "version-unavailable" ? "Browser version could not be verified" : _0x580473.outdated ? "Browser version is below the supported minimum" : "Browser version check completed",
    context: _0x580473
  });
  if (_0x580473.checked && !_0x580473.outdated) {
    return {
      continueLaunch: true,
      action: "continue",
      browserPath: _0x580473.browserPath,
      inspection: _0x580473
    };
  }
  let _0x4a447a = null;
  if (edgeBrowserPath && a207_0x1925f1.resolve(edgeBrowserPath) !== a207_0x1925f1.resolve(_0x580473.browserPath)) {
    _0x4a447a = inspectChromeShellBrowserVersion({
      browserPath: edgeBrowserPath,
      env: env,
      platform: platform,
      spawnProcess: spawnProcess
    });
    logEvent?.({
      type: "chrome_shell.fallback_browser_version_checked",
      level: _0x4a447a.checked && !_0x4a447a.outdated ? "info" : "warn",
      source: "main",
      message: "Fallback browser version check completed",
      context: _0x4a447a
    });
    if (_0x4a447a.checked && !_0x4a447a.outdated) {
      logEvent?.({
        type: "chrome_shell.safe_browser_fallback_selected",
        level: "warn",
        source: "main",
        message: "Unsafe primary browser was replaced with a validated Edge fallback",
        context: {
          primary: _0x580473,
          fallback: _0x4a447a
        }
      });
      return {
        continueLaunch: true,
        action: "edge-fallback",
        browserPath: _0x4a447a.browserPath,
        inspection: _0x580473,
        fallbackInspection: _0x4a447a
      };
    }
  }
  logEvent?.({
    type: "chrome_shell.electron_fallback_required",
    level: "error",
    source: "main",
    message: "No validated external browser is available; Electron fallback is required",
    context: {
      primary: _0x580473,
      fallback: _0x4a447a
    }
  });
  return {
    continueLaunch: false,
    action: "electron-fallback",
    browserPath: _0x580473.browserPath,
    inspection: _0x580473,
    fallbackInspection: _0x4a447a
  };
}
export const __chromeShellBrowserVersionForTest = {
  WINDOWS_VERSION_SCRIPT: WINDOWS_VERSION_SCRIPT,
  clearRememberedBrowserChoice: clearRememberedBrowserChoice,
  parseVersionParts: parseVersionParts,
  resolveMinimumBrowserVersion: resolveMinimumBrowserVersion
};