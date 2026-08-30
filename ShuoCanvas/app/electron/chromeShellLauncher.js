import { spawn } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import a208_0x324e56 from "node:path";
import { identifyChromeShellBrowser } from "./chromeShellBrowserVersion.js";
import { prepareWindowsChromeShellTaskbarIdentity } from "./windowsTaskbarIdentity.js";
const TRUE_RE = /^(1|true|yes|on)$/i;
const FALSE_RE = /^(0|false|no|off)$/i;
const DEFAULT_EARLY_EXIT_GRACE_MS = 5000;
const CHROME_SHELL_SPAWN_ERROR_CODE = "CHROME_SHELL_SPAWN_ERROR";
const WINDOWS_ACTIVATION_TIMEOUT_MS = 6000;
const TRACKED_CLOSE_GRACE_MS = 1500;
const TRACKED_CLOSE_FORCE_MS = 2500;
const BACKGROUND_RESPONSIVENESS_ARGS = Object.freeze(["--disable-background-timer-throttling", "--disable-renderer-backgrounding", "--disable-backgrounding-occluded-windows"]);
function envFlag(_0x1b4ed6, _0x6d4129) {
  const _0x6cbc28 = String(_0x1b4ed6?.[_0x6d4129] || "").trim();
  if (!_0x6cbc28) {
    return null;
  }
  if (TRUE_RE.test(_0x6cbc28)) {
    return true;
  }
  if (FALSE_RE.test(_0x6cbc28)) {
    return false;
  }
  return null;
}
export function shouldUseChromeShellRuntime(_0x1ade36 = process.env, {
  appIsPackaged = false,
  platform = process.platform
} = {}) {
  appIsPackaged;
  if (envFlag(_0x1ade36, "AIC_USE_ELECTRON_CANVAS") === true) {
    return false;
  }
  const _0x2704cc = String(_0x1ade36?.AIC_CANVAS_RUNTIME || "").trim().toLowerCase();
  if (_0x2704cc === "electron" || _0x2704cc === "browser-window") {
    return false;
  }
  if (_0x2704cc === "chrome-shell" || _0x2704cc === "edge-shell") {
    return true;
  }
  if (envFlag(_0x1ade36, "AIC_USE_CHROME_SHELL") === true) {
    return true;
  }
  if (platform === "darwin") {
    return false;
  }
  return true;
}
export function shouldQuitWhenAllElectronWindowsClosed({
  platform = process.platform,
  useChromeShellRuntime = false
} = {}) {
  if (useChromeShellRuntime) {
    return false;
  }
  return platform !== "darwin";
}
export function isChromeShellLaunchActive(_0x251324) {
  const _0xbedd11 = _0x251324?.process;
  if (!_0xbedd11) {
    return false;
  }
  return _0xbedd11.exitCode == null && _0xbedd11.signalCode == null && _0xbedd11.killed !== true;
}
export function buildChromeShellAppUrl(_0x211b7e, {
  appIsPackaged = false
} = {}) {
  const _0x53830a = new URL(String(_0x211b7e || "http://127.0.0.1:8777/"));
  _0x53830a.searchParams.set("aicRuntime", "chrome-shell");
  if (appIsPackaged) {
    _0x53830a.searchParams.set("aicPackaged", "1");
  } else {
    _0x53830a.searchParams.delete("aicPackaged");
  }
  return _0x53830a.href;
}
export function resolveChromeShellAppIdentity(_0x2106d9) {
  try {
    const _0x24308c = new URL(String(_0x2106d9 || ""));
    if (_0x24308c.protocol !== "http:" && _0x24308c.protocol !== "https:" || _0x24308c.username || _0x24308c.password || _0x24308c.searchParams.get("aicRuntime") !== "chrome-shell") {
      return "";
    }
    return _0x24308c.protocol + "//" + _0x24308c.host + _0x24308c.pathname;
  } catch {
    return "";
  }
}
function candidatePathsForPlatform(_0x38f83d = process.env, _0x583f5b = process.platform) {
  if (_0x583f5b === "win32") {
    const _0x355789 = _0x38f83d.ProgramFiles || _0x38f83d.PROGRAMFILES || "";
    const _0x5ba8e6 = _0x38f83d["ProgramFiles(x86)"] || _0x38f83d.PROGRAMFILES_X86 || "";
    const _0x19e1f1 = _0x38f83d.LOCALAPPDATA || "";
    return [a208_0x324e56.join(_0x355789, "Google", "Chrome", "Application", "chrome.exe"), a208_0x324e56.join(_0x5ba8e6, "Google", "Chrome", "Application", "chrome.exe"), a208_0x324e56.join(_0x19e1f1, "Google", "Chrome", "Application", "chrome.exe"), a208_0x324e56.join(_0x355789, "Microsoft", "Edge", "Application", "msedge.exe"), a208_0x324e56.join(_0x5ba8e6, "Microsoft", "Edge", "Application", "msedge.exe"), a208_0x324e56.join(_0x19e1f1, "Microsoft", "Edge", "Application", "msedge.exe")].filter(Boolean);
  }
  if (_0x583f5b === "darwin") {
    return ["/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge"];
  }
  return ["/usr/bin/google-chrome", "/usr/bin/google-chrome-stable", "/usr/bin/chromium", "/usr/bin/chromium-browser", "/usr/bin/microsoft-edge", "/usr/bin/microsoft-edge-stable"];
}
export function resolveChromeShellBrowserExecutable({
  env = process.env,
  platform = process.platform,
  exists = existsSync,
  preferredBrowser = "auto"
} = {}) {
  const _0x4094a5 = ["chrome", "edge"].includes(String(preferredBrowser).toLowerCase()) ? String(preferredBrowser).toLowerCase() : "auto";
  const _0x5b9bb2 = _0x152ff6 => {
    if (_0x4094a5 === "auto") {
      return true;
    }
    const _0x209f93 = a208_0x324e56.basename(String(_0x152ff6 || "")).toLowerCase();
    if (_0x4094a5 === "chrome") {
      return ["chrome.exe", "chrome", "google chrome", "google-chrome", "google-chrome-stable"].includes(_0x209f93);
    } else {
      return ["msedge.exe", "msedge", "microsoft edge", "microsoft-edge", "microsoft-edge-stable"].includes(_0x209f93);
    }
  };
  const _0x120b03 = String(env.AIC_CHROME_SHELL_BROWSER || "").trim();
  if (_0x120b03 && _0x5b9bb2(_0x120b03)) {
    const _0x4bb4b1 = /[\\/]/.test(_0x120b03) || a208_0x324e56.isAbsolute(_0x120b03);
    if (!_0x4bb4b1 || exists(_0x120b03)) {
      return _0x120b03;
    }
  }
  return candidatePathsForPlatform(env, platform).filter(_0x5b9bb2).find(_0x170d1b => exists(_0x170d1b)) || "";
}
export function resolveChromeShellProfileDir({
  app: _0x58bc08,
  env = process.env,
  browserPath = ""
} = {}) {
  const _0x371595 = String(env.AIC_CHROME_SHELL_PROFILE_DIR || "").trim();
  if (_0x371595) {
    return a208_0x324e56.resolve(_0x371595);
  }
  const _0x49d77a = _0x58bc08?.getPath?.("sessionData") || _0x58bc08?.getPath?.("userData") || process.cwd();
  const _0x5acaf6 = identifyChromeShellBrowser(browserPath || env.AIC_CHROME_SHELL_BROWSER);
  const _0x1a605c = _0x5acaf6 === "edge" ? "edge-shell-profile" : _0x5acaf6 === "chromium" ? "chromium-shell-profile" : "chrome-shell-profile";
  return a208_0x324e56.join(_0x49d77a, _0x1a605c);
}
export function prepareChromeShellTaskbarIdentity({
  app: _0x2a45d5,
  env = process.env,
  platform = process.platform,
  windowsTaskbarIdentity = null,
  exists = existsSync,
  spawnProcess = spawn,
  logEvent = null
} = {}) {
  if (!windowsTaskbarIdentity) {
    return Promise.resolve(null);
  }
  const _0x489ad3 = resolveChromeShellBrowserExecutable({
    env: env,
    platform: platform,
    exists: exists
  });
  if (!_0x489ad3) {
    return Promise.resolve(null);
  }
  const _0x1bc902 = resolveChromeShellProfileDir({
    app: _0x2a45d5,
    env: env,
    browserPath: _0x489ad3
  });
  return prepareWindowsChromeShellTaskbarIdentity({
    browserPath: _0x489ad3,
    profileDir: _0x1bc902,
    platform: platform,
    spawnProcess: spawnProcess,
    logEvent: logEvent,
    ...windowsTaskbarIdentity
  });
}
function resolveRemoteDebuggingPort(_0x34e713 = process.env) {
  const _0x184ebb = String(_0x34e713.AIC_CHROME_SHELL_REMOTE_DEBUGGING_PORT || "").trim();
  if (!/^\d+$/.test(_0x184ebb)) {
    return "";
  }
  const _0x5077ae = Number.parseInt(_0x184ebb, 10);
  if (_0x5077ae > 0 && _0x5077ae <= 65535) {
    return String(_0x5077ae);
  } else {
    return "";
  }
}
function shouldActivateChromeShellWindow({
  env = process.env,
  platform = process.platform
} = {}) {
  if (platform !== "win32" && platform !== "darwin") {
    return false;
  }
  return envFlag(env, "AIC_CHROME_SHELL_ACTIVATE_WINDOW") !== false;
}
function resolveBackgroundResponsivenessArgs(_0x2501d1 = process.env) {
  if (envFlag(_0x2501d1, "AIC_CHROME_SHELL_PREVENT_BACKGROUND_THROTTLING") === false) {
    return [];
  }
  return [...BACKGROUND_RESPONSIVENESS_ARGS];
}
function resolveBackgroundModeArgs(_0xa4d0d0 = process.env) {
  if (envFlag(_0xa4d0d0, "AIC_CHROME_SHELL_DISABLE_BACKGROUND_MODE") === false) {
    return [];
  }
  return ["--disable-background-mode"];
}
function isPlainObject(_0x716732) {
  return _0x716732 && typeof _0x716732 === "object" && !Array.isArray(_0x716732);
}
function readJsonObject(_0x6f68cd, _0x168a38 = readFileSync) {
  try {
    const _0x13f7dc = _0x168a38(_0x6f68cd, "utf8");
    const _0x1ecc9a = JSON.parse(String(_0x13f7dc || "{}"));
    if (isPlainObject(_0x1ecc9a)) {
      return _0x1ecc9a;
    } else {
      return {};
    }
  } catch {
    return {};
  }
}
function readChromePreferences(_0x299280, _0x36c762 = readFileSync) {
  return readJsonObject(_0x299280, _0x36c762);
}
export function writeChromeShellPreferences({
  profileDir: _0x9619a0,
  disableDevTools = false,
  mkdir = mkdirSync,
  readFile = readFileSync,
  writeFile = writeFileSync
} = {}) {
  const _0x42904c = a208_0x324e56.join(String(_0x9619a0 || ""), "Default");
  mkdir(_0x42904c, {
    recursive: true
  });
  const _0xa3c1ec = a208_0x324e56.join(_0x42904c, "Preferences");
  const _0x120079 = readChromePreferences(_0xa3c1ec, readFile);
  const _0x2f6122 = isPlainObject(_0x120079.devtools) ? _0x120079.devtools : {};
  const _0x4e6f65 = {
    ..._0x2f6122
  };
  delete _0x4e6f65.availability;
  const _0x2843d1 = {
    ..._0x120079,
    credentials_enable_service: false,
    autofill: {
      ...(_0x120079.autofill && typeof _0x120079.autofill === "object" ? _0x120079.autofill : {}),
      credit_card_enabled: false,
      profile_enabled: false
    },
    profile: {
      ...(_0x120079.profile && typeof _0x120079.profile === "object" ? _0x120079.profile : {}),
      password_manager_enabled: false
    },
    devtools: disableDevTools ? {
      ..._0x2f6122,
      availability: 2
    } : _0x4e6f65
  };
  writeFile(_0xa3c1ec, JSON.stringify(_0x2843d1, null, 2) + "\n", "utf8");
  return {
    preferencesPath: _0xa3c1ec,
    preferences: _0x2843d1
  };
}
function readPositiveInteger(_0x502e31) {
  const _0x1678f7 = Number(_0x502e31);
  if (Number.isFinite(_0x1678f7) && _0x1678f7 > 0) {
    return Math.round(_0x1678f7);
  } else {
    return 0;
  }
}
function readFiniteInteger(_0x1e85df) {
  const _0x39cc61 = Number(_0x1e85df);
  if (Number.isFinite(_0x39cc61)) {
    return Math.round(_0x39cc61);
  } else {
    return null;
  }
}
function readNonNegativeInteger(_0x1576ee, _0x426065 = 0) {
  const _0x348782 = Number(_0x1576ee);
  if (!Number.isFinite(_0x348782) || _0x348782 < 0) {
    return _0x426065;
  }
  return Math.round(_0x348782);
}
function resolveEarlyExitGraceMs(_0x3e8d1f = process.env) {
  const _0x450f69 = String(_0x3e8d1f.AIC_CHROME_SHELL_EARLY_EXIT_GRACE_MS || "").trim();
  if (!_0x450f69) {
    return DEFAULT_EARLY_EXIT_GRACE_MS;
  }
  return readNonNegativeInteger(_0x450f69, DEFAULT_EARLY_EXIT_GRACE_MS);
}
function isCleanEarlyChromeShellExit({
  code: _0x3682a6,
  signal: _0x4ad0ee,
  runtimeMs: _0x4287a0,
  graceMs: _0x1f23c9
}) {
  return _0x3682a6 === 0 && !_0x4ad0ee && _0x1f23c9 > 0 && _0x4287a0 >= 0 && _0x4287a0 < _0x1f23c9;
}
export function normalizeChromeShellSpawnError(_0x6990b2) {
  if (_0x6990b2?.code === CHROME_SHELL_SPAWN_ERROR_CODE) {
    return _0x6990b2;
  }
  const _0x5b188a = String(_0x6990b2?.message || "").trim();
  const _0x1d24a9 = new Error(_0x5b188a ? "Chrome shell process failed to start: " + _0x5b188a : "Chrome shell process failed to start");
  _0x1d24a9.name = "ChromeShellSpawnError";
  _0x1d24a9.code = CHROME_SHELL_SPAWN_ERROR_CODE;
  _0x1d24a9.cause = _0x6990b2;
  _0x1d24a9.details = {
    originalCode: String(_0x6990b2?.code || ""),
    errno: _0x6990b2?.errno ?? null,
    syscall: String(_0x6990b2?.syscall || ""),
    path: String(_0x6990b2?.path || "")
  };
  return _0x1d24a9;
}
function buildWindowsActivationScript(_0x5cb737) {
  const _0x2a9f0e = readPositiveInteger(_0x5cb737);
  if (!_0x2a9f0e) {
    return "";
  }
  return ("\n$targetPid = " + _0x2a9f0e + "\n$deadline = [DateTime]::UtcNow.AddMilliseconds(" + WINDOWS_ACTIVATION_TIMEOUT_MS + ")\n$typeDefinition = @'\nusing System;\nusing System.Text;\nusing System.Runtime.InteropServices;\npublic static class AicChromeShellWindowActivator {\n  public delegate bool EnumWindowsProc(IntPtr hWnd, IntPtr lParam);\n  [DllImport(\"user32.dll\")] public static extern bool EnumWindows(EnumWindowsProc lpEnumFunc, IntPtr lParam);\n  [DllImport(\"user32.dll\")] public static extern int GetWindowText(IntPtr hWnd, StringBuilder text, int count);\n  [DllImport(\"user32.dll\")] public static extern int GetWindowTextLength(IntPtr hWnd);\n  [DllImport(\"user32.dll\")] public static extern uint GetWindowThreadProcessId(IntPtr hWnd, out uint processId);\n  [DllImport(\"user32.dll\")] public static extern bool GetWindowRect(IntPtr hWnd, out RECT rect);\n  [DllImport(\"user32.dll\")] public static extern bool ShowWindow(IntPtr hWnd, int nCmdShow);\n  [DllImport(\"user32.dll\")] public static extern bool SetForegroundWindow(IntPtr hWnd);\n  public struct RECT { public int Left; public int Top; public int Right; public int Bottom; }\n}\n'@\nAdd-Type -TypeDefinition $typeDefinition -ErrorAction SilentlyContinue\nwhile ([DateTime]::UtcNow -lt $deadline) {\n  $script:shown = $false\n  [AicChromeShellWindowActivator]::EnumWindows({\n    param($hWnd, $lParam)\n    $windowProcessId = [uint32]0\n    [void][AicChromeShellWindowActivator]::GetWindowThreadProcessId($hWnd, [ref]$windowProcessId)\n    if ([int]$windowProcessId -ne $targetPid) { return $true }\n    $len = [AicChromeShellWindowActivator]::GetWindowTextLength($hWnd)\n    $text = New-Object System.Text.StringBuilder ([Math]::Max(256, $len + 1))\n    [void][AicChromeShellWindowActivator]::GetWindowText($hWnd, $text, $text.Capacity)\n    $title = $text.ToString()\n    $rect = New-Object AicChromeShellWindowActivator+RECT\n    [void][AicChromeShellWindowActivator]::GetWindowRect($hWnd, [ref]$rect)\n    $width = $rect.Right - $rect.Left\n    $height = $rect.Bottom - $rect.Top\n    $looksLikeAppWindow = $title -like '*SHUO Canvas*' -or $title -like '*AI Canvas*' -or ($width -gt 300 -and $height -gt 300 -and $title -notmatch 'IME')\n    if (-not $looksLikeAppWindow) { return $true }\n    [void][AicChromeShellWindowActivator]::ShowWindow($hWnd, 9)\n    [void][AicChromeShellWindowActivator]::SetForegroundWindow($hWnd)\n    $script:shown = $true\n    return $false\n  }, [IntPtr]::Zero) | Out-Null\n  if ($script:shown) { exit 0 }\n  Start-Sleep -Milliseconds 200\n}\nexit 0\n").trim();
}
function buildMacActivationScript(_0x511b18) {
  const _0x2836d0 = readPositiveInteger(_0x511b18);
  if (!_0x2836d0) {
    return "";
  }
  return ["ObjC.import(\"AppKit\");", "const app = $.NSRunningApplication.runningApplicationWithProcessIdentifier(" + _0x2836d0 + ");", "if (app) {", "  app.activateWithOptions($.NSApplicationActivateAllWindows | $.NSApplicationActivateIgnoringOtherApps);", "}"].join("\n");
}
export function activateChromeShellWindowSoon({
  child: _0x277ef2,
  env = process.env,
  platform = process.platform,
  spawnProcess = spawn
} = {}) {
  if (!shouldActivateChromeShellWindow({
    env: env,
    platform: platform
  })) {
    return null;
  }
  const _0x22a255 = readPositiveInteger(_0x277ef2?.pid);
  if (!_0x22a255) {
    return null;
  }
  try {
    const _0x57feef = platform === "darwin" ? spawnProcess("osascript", ["-l", "JavaScript", "-e", buildMacActivationScript(_0x22a255)], {
      stdio: "ignore",
      detached: true
    }) : spawnProcess("powershell.exe", ["-NoLogo", "-NoProfile", "-ExecutionPolicy", "Bypass", "-Command", buildWindowsActivationScript(_0x22a255)], {
      stdio: "ignore",
      windowsHide: true,
      detached: true
    });
    _0x57feef?.unref?.();
    return _0x57feef || null;
  } catch {
    return null;
  }
}
function buildWindowsChromeShellFocusScript() {
  return ("\n$focusMode = [Environment]::GetEnvironmentVariable(\"AIC_CHROME_SHELL_FOCUS_MODE\")\n$windowAction = [Environment]::GetEnvironmentVariable(\"AIC_CHROME_SHELL_WINDOW_ACTION\")\n$targetPidText = [Environment]::GetEnvironmentVariable(\"AIC_CHROME_SHELL_TARGET_PID\")\n$expectedBrowserPath = [Environment]::GetEnvironmentVariable(\"AIC_CHROME_SHELL_EXPECTED_BROWSER_PATH\")\n$expectedProfileDir = [Environment]::GetEnvironmentVariable(\"AIC_CHROME_SHELL_EXPECTED_PROFILE_DIR\")\n$expectedAppBaseUrl = [Environment]::GetEnvironmentVariable(\"AIC_CHROME_SHELL_EXPECTED_APP_BASE_URL\")\n$timeoutText = [Environment]::GetEnvironmentVariable(\"AIC_CHROME_SHELL_FOCUS_TIMEOUT_MS\")\n$targetPid = 0\n$timeoutMs = " + WINDOWS_ACTIVATION_TIMEOUT_MS + "\n[void][int]::TryParse($targetPidText, [ref]$targetPid)\n[void][int]::TryParse($timeoutText, [ref]$timeoutMs)\n$typeDefinition = @'\nusing System;\nusing System.Text;\nusing System.Runtime.InteropServices;\npublic static class AicChromeShellFocus {\n  public delegate bool EnumWindowsProc(IntPtr hWnd, IntPtr lParam);\n  [DllImport(\"user32.dll\")] public static extern bool EnumWindows(EnumWindowsProc lpEnumFunc, IntPtr lParam);\n  [DllImport(\"user32.dll\")] public static extern bool IsWindowVisible(IntPtr hWnd);\n  [DllImport(\"user32.dll\", CharSet = CharSet.Unicode)] public static extern int GetWindowText(IntPtr hWnd, StringBuilder text, int count);\n  [DllImport(\"user32.dll\")] public static extern int GetWindowTextLength(IntPtr hWnd);\n  [DllImport(\"user32.dll\")] public static extern uint GetWindowThreadProcessId(IntPtr hWnd, out uint processId);\n  [DllImport(\"user32.dll\")] public static extern bool ShowWindow(IntPtr hWnd, int nCmdShow);\n  [DllImport(\"user32.dll\")] public static extern bool SetForegroundWindow(IntPtr hWnd);\n  [DllImport(\"user32.dll\")] public static extern bool IsWindow(IntPtr hWnd);\n  [DllImport(\"user32.dll\", SetLastError = true)] public static extern bool PostMessage(IntPtr hWnd, uint message, IntPtr wParam, IntPtr lParam);\n  [DllImport(\"kernel32.dll\", SetLastError = true)] public static extern IntPtr OpenProcess(uint access, bool inheritHandle, uint processId);\n  [DllImport(\"kernel32.dll\", CharSet = CharSet.Unicode, SetLastError = true)] public static extern bool QueryFullProcessImageName(IntPtr process, uint flags, StringBuilder path, ref uint size);\n  [DllImport(\"kernel32.dll\")] public static extern bool CloseHandle(IntPtr handle);\n  [DllImport(\"shell32.dll\", CharSet = CharSet.Unicode, SetLastError = true)] public static extern IntPtr CommandLineToArgvW(string commandLine, out int argumentCount);\n  [DllImport(\"kernel32.dll\", SetLastError = true)] public static extern IntPtr LocalFree(IntPtr memory);\n  public static string GetProcessPath(uint processId) {\n    IntPtr process = OpenProcess(0x1000, false, processId);\n    if (process == IntPtr.Zero) return \"\";\n    try {\n      StringBuilder path = new StringBuilder(32768);\n      uint size = (uint)path.Capacity;\n      return QueryFullProcessImageName(process, 0, path, ref size) ? path.ToString() : \"\";\n    } finally {\n      CloseHandle(process);\n    }\n  }\n  public static string[] SplitCommandLine(string commandLine) {\n    if (String.IsNullOrWhiteSpace(commandLine)) return new string[0];\n    int argumentCount = 0;\n    IntPtr argumentList = CommandLineToArgvW(commandLine, out argumentCount);\n    if (argumentList == IntPtr.Zero || argumentCount <= 0) return new string[0];\n    try {\n      string[] arguments = new string[argumentCount];\n      for (int index = 0; index < argumentCount; index++) {\n        IntPtr argument = Marshal.ReadIntPtr(argumentList, index * IntPtr.Size);\n        arguments[index] = Marshal.PtrToStringUni(argument) ?? \"\";\n      }\n      return arguments;\n    } finally {\n      LocalFree(argumentList);\n    }\n  }\n}\n'@\ntry { Add-Type -TypeDefinition $typeDefinition -ErrorAction Stop } catch { exit 2 }\n$expectedFullPath = \"\"\n$expectedFullProfileDir = \"\"\n$expectedAppUri = $null\nif (-not [String]::IsNullOrWhiteSpace($expectedBrowserPath)) {\n  try { $expectedFullPath = [IO.Path]::GetFullPath($expectedBrowserPath) } catch { exit 2 }\n}\nif (-not [String]::IsNullOrWhiteSpace($expectedProfileDir)) {\n  try { $expectedFullProfileDir = [IO.Path]::GetFullPath($expectedProfileDir) } catch { exit 2 }\n}\nif (-not [String]::IsNullOrWhiteSpace($expectedAppBaseUrl)) {\n  try {\n    $expectedAppUri = [Uri]$expectedAppBaseUrl\n  } catch { exit 2 }\n}\nif ($focusMode -eq \"detached\" -and (\n  [String]::IsNullOrWhiteSpace($expectedFullPath) -or\n  [String]::IsNullOrWhiteSpace($expectedFullProfileDir) -or\n  $null -eq $expectedAppUri\n)) { exit 2 }\nfunction Test-AicChromeShellLaunchIdentity([uint32]$processId) {\n  try {\n    $record = Get-CimInstance Win32_Process -Filter (\"ProcessId = \" + $processId) -ErrorAction Stop\n  } catch {\n    return $false\n  }\n  if ($null -eq $record) { return $false }\n  $hasExpectedProfile = $false\n  $hasExpectedApp = $false\n  foreach ($argument in [AicChromeShellFocus]::SplitCommandLine([string]$record.CommandLine)) {\n    if ($argument.StartsWith(\"--user-data-dir=\", [StringComparison]::OrdinalIgnoreCase)) {\n      try {\n        $candidateProfile = [IO.Path]::GetFullPath($argument.Substring(16))\n        $hasExpectedProfile = [String]::Equals(\n          $candidateProfile,\n          $expectedFullProfileDir,\n          [StringComparison]::OrdinalIgnoreCase\n        )\n      } catch {\n        $hasExpectedProfile = $false\n      }\n    }\n    if ($argument.StartsWith(\"--app=\", [StringComparison]::OrdinalIgnoreCase)) {\n      try {\n        $candidateAppUri = [Uri]$argument.Substring(6)\n        $hasExpectedApp = (\n          [String]::Equals($candidateAppUri.Scheme, $expectedAppUri.Scheme, [StringComparison]::OrdinalIgnoreCase) -and\n          [String]::Equals($candidateAppUri.Host, $expectedAppUri.Host, [StringComparison]::OrdinalIgnoreCase) -and\n          $candidateAppUri.Port -eq $expectedAppUri.Port -and\n          [String]::Equals($candidateAppUri.AbsolutePath, $expectedAppUri.AbsolutePath, [StringComparison]::Ordinal) -and\n          $candidateAppUri.Query -match '(?:^|[?&])aicRuntime=chrome-shell(?:&|$)'\n        )\n      } catch {\n        $hasExpectedApp = $false\n      }\n    }\n  }\n  return $hasExpectedProfile -and $hasExpectedApp\n}\n$deadline = [DateTime]::UtcNow.AddMilliseconds($timeoutMs)\n$script:targetWindow = [IntPtr]::Zero\nwhile ([DateTime]::UtcNow -lt $deadline) {\n  if ($windowAction -eq \"close\" -and $script:targetWindow -ne [IntPtr]::Zero) {\n    if (-not [AicChromeShellFocus]::IsWindow($script:targetWindow)) { exit 0 }\n    Start-Sleep -Milliseconds 100\n    continue\n  }\n  $script:succeeded = $false\n  [AicChromeShellFocus]::EnumWindows({\n    param($hWnd, $lParam)\n    if (-not [AicChromeShellFocus]::IsWindowVisible($hWnd)) { return $true }\n    $windowProcessId = [uint32]0\n    [void][AicChromeShellFocus]::GetWindowThreadProcessId($hWnd, [ref]$windowProcessId)\n    if ($focusMode -eq \"tracked\" -and [int]$windowProcessId -ne $targetPid) { return $true }\n    $len = [AicChromeShellFocus]::GetWindowTextLength($hWnd)\n    $text = New-Object System.Text.StringBuilder ([Math]::Max(256, $len + 1))\n    [void][AicChromeShellFocus]::GetWindowText($hWnd, $text, $text.Capacity)\n    $title = $text.ToString()\n    if ($focusMode -eq \"detached\" -and $title -notlike \"*SHUO Canvas*\" -and $title -notlike \"*AI Canvas*\") { return $true }\n    if (-not [String]::IsNullOrWhiteSpace($expectedFullPath)) {\n      $processPath = [AicChromeShellFocus]::GetProcessPath($windowProcessId)\n      if ([String]::IsNullOrWhiteSpace($processPath)) { return $true }\n      try { $processPath = [IO.Path]::GetFullPath($processPath) } catch { return $true }\n      if (-not [String]::Equals($processPath, $expectedFullPath, [StringComparison]::OrdinalIgnoreCase)) { return $true }\n    }\n    if ($focusMode -eq \"detached\" -and -not (Test-AicChromeShellLaunchIdentity $windowProcessId)) { return $true }\n    if ($windowAction -eq \"close\") {\n      if ([AicChromeShellFocus]::PostMessage($hWnd, 0x0010, [IntPtr]::Zero, [IntPtr]::Zero)) {\n        $script:targetWindow = $hWnd\n        return $false\n      }\n      return $true\n    }\n    [void][AicChromeShellFocus]::ShowWindow($hWnd, 9)\n    [void][AicChromeShellFocus]::SetForegroundWindow($hWnd)\n    $script:succeeded = $true\n    return $false\n  }, [IntPtr]::Zero) | Out-Null\n  if ($script:succeeded) { exit 0 }\n  Start-Sleep -Milliseconds 150\n}\nexit 1\n").trim();
}
function encodePowerShellCommand(_0x9ee656) {
  return Buffer.from(String(_0x9ee656 || ""), "utf16le").toString("base64");
}
function resolveChromeShellFocusTarget(_0x326a99) {
  const _0x1893f8 = _0x326a99?.detached === true;
  const _0x200314 = String(_0x326a99?.browserPath || "").trim();
  const _0x56f173 = String(_0x326a99?.profileDir || "").trim();
  const _0xed6cd5 = resolveChromeShellAppIdentity(_0x326a99?.appUrl);
  if (_0x1893f8) {
    if (!a208_0x324e56.win32.isAbsolute(_0x200314) || !a208_0x324e56.win32.isAbsolute(_0x56f173) || !_0xed6cd5) {
      return null;
    }
    return {
      mode: "detached",
      targetPid: 0,
      expectedBrowserPath: _0x200314,
      expectedProfileDir: _0x56f173,
      expectedAppIdentity: _0xed6cd5
    };
  }
  const _0x48aa15 = readPositiveInteger(_0x326a99?.process?.pid);
  if (!_0x48aa15 || !isChromeShellLaunchActive(_0x326a99)) {
    return null;
  }
  return {
    mode: "tracked",
    targetPid: _0x48aa15,
    expectedBrowserPath: a208_0x324e56.win32.isAbsolute(_0x200314) ? _0x200314 : "",
    expectedProfileDir: "",
    expectedAppIdentity: ""
  };
}
export async function controlChromeShellLaunchWindow({
  launch: _0x7022bd,
  action = "focus",
  env = process.env,
  platform = process.platform,
  spawnProcess = spawn,
  timeoutMs = WINDOWS_ACTIVATION_TIMEOUT_MS,
  setTimeoutFn = setTimeout,
  clearTimeoutFn = clearTimeout
} = {}) {
  if (platform !== "win32") {
    return false;
  }
  const _0x3528b4 = String(action || "").trim().toLowerCase();
  if (_0x3528b4 !== "focus" && _0x3528b4 !== "close") {
    return false;
  }
  const _0x5f2f9b = resolveChromeShellFocusTarget(_0x7022bd);
  if (!_0x5f2f9b) {
    return false;
  }
  const _0x3a8cfa = Math.max(100, Math.min(10000, readNonNegativeInteger(timeoutMs, WINDOWS_ACTIVATION_TIMEOUT_MS)));
  let _0x4f50b1;
  try {
    _0x4f50b1 = spawnProcess("powershell.exe", ["-NoLogo", "-NoProfile", "-NonInteractive", "-ExecutionPolicy", "Bypass", "-EncodedCommand", encodePowerShellCommand(buildWindowsChromeShellFocusScript())], {
      stdio: "ignore",
      windowsHide: true,
      env: {
        ...env,
        AIC_CHROME_SHELL_FOCUS_MODE: _0x5f2f9b.mode,
        AIC_CHROME_SHELL_WINDOW_ACTION: _0x3528b4,
        AIC_CHROME_SHELL_TARGET_PID: String(_0x5f2f9b.targetPid),
        AIC_CHROME_SHELL_EXPECTED_BROWSER_PATH: _0x5f2f9b.expectedBrowserPath,
        AIC_CHROME_SHELL_EXPECTED_PROFILE_DIR: _0x5f2f9b.expectedProfileDir,
        AIC_CHROME_SHELL_EXPECTED_APP_BASE_URL: _0x5f2f9b.expectedAppIdentity,
        AIC_CHROME_SHELL_FOCUS_TIMEOUT_MS: String(_0x3a8cfa)
      }
    });
  } catch {
    return false;
  }
  if (typeof _0x4f50b1?.once !== "function") {
    return false;
  }
  return new Promise(_0x4cb226 => {
    let _0x5bbf70 = false;
    let _0x3c879c = null;
    const _0x513cfc = _0x4ba738 => {
      if (_0x5bbf70) {
        return;
      }
      _0x5bbf70 = true;
      if (_0x3c879c !== null) {
        clearTimeoutFn(_0x3c879c);
      }
      _0x4cb226(_0x4ba738 === true);
    };
    _0x4f50b1.once("error", () => _0x513cfc(false));
    _0x4f50b1.once("exit", _0x31c361 => _0x513cfc(_0x31c361 === 0));
    _0x3c879c = setTimeoutFn(() => {
      try {
        _0x4f50b1.kill?.();
      } catch {}
      _0x513cfc(false);
    }, _0x3a8cfa + 1000);
  });
}
export function focusChromeShellLaunchWindow(_0x531402 = {}) {
  return controlChromeShellLaunchWindow({
    ..._0x531402,
    action: "focus"
  });
}
function waitForChromeShellProcessExit({
  child: _0x2c7b1c,
  timeoutMs: _0x5d137b,
  setTimeoutFn: _0x34858a,
  clearTimeoutFn: _0x555d8b
}) {
  const _0xf9c8b9 = () => _0x2c7b1c?.exitCode !== null && _0x2c7b1c?.exitCode !== undefined || _0x2c7b1c?.signalCode !== null && _0x2c7b1c?.signalCode !== undefined;
  if (_0xf9c8b9()) {
    return Promise.resolve(true);
  }
  return new Promise(_0x48e772 => {
    let _0x39be77 = false;
    let _0x1f684e = null;
    let _0xe691f2 = null;
    const _0x48b791 = _0x110f54 => {
      if (_0x39be77) {
        return;
      }
      _0x39be77 = true;
      if (_0x1f684e !== null) {
        _0x555d8b(_0x1f684e);
      }
      _0x2c7b1c?.off?.("exit", _0xe691f2);
      _0x48e772(_0x110f54 === true);
    };
    _0xe691f2 = () => _0x48b791(true);
    _0x2c7b1c?.once?.("exit", _0xe691f2);
    const _0x1ea24b = _0x34858a(() => _0x48b791(_0xf9c8b9()), Math.max(0, Number(_0x5d137b) || 0));
    if (_0x39be77) {
      _0x555d8b(_0x1ea24b);
    } else {
      _0x1f684e = _0x1ea24b;
    }
  });
}
function runWindowsTaskkill({
  pid: _0x300b3b,
  force: _0x811f58,
  spawnProcess: _0x36e1b8,
  timeoutMs: _0x1379ce,
  setTimeoutFn: _0x50b651,
  clearTimeoutFn: _0x4f6dc6
}) {
  return new Promise(_0x40c0f0 => {
    let _0x3bc62e = null;
    let _0x313abd = false;
    let _0x109159 = null;
    const _0x58962b = _0x1eadd5 => {
      if (_0x313abd) {
        return;
      }
      _0x313abd = true;
      if (_0x109159 !== null) {
        _0x4f6dc6(_0x109159);
      }
      _0x40c0f0(_0x1eadd5 === true);
    };
    const _0x2215cc = ["/PID", String(_0x300b3b), "/T"];
    if (_0x811f58) {
      _0x2215cc.push("/F");
    }
    try {
      _0x3bc62e = _0x36e1b8("taskkill.exe", _0x2215cc, {
        windowsHide: true,
        stdio: "ignore"
      });
    } catch {
      _0x58962b(false);
      return;
    }
    if (typeof _0x3bc62e?.once !== "function") {
      _0x58962b(false);
      return;
    }
    _0x3bc62e.once("error", () => _0x58962b(false));
    _0x3bc62e.once("exit", _0x4e6840 => _0x58962b(_0x4e6840 === 0));
    const _0x16e4b9 = _0x50b651(() => {
      try {
        _0x3bc62e.kill?.();
      } catch {}
      _0x58962b(false);
    }, Math.max(100, Number(_0x1379ce) || 0));
    if (_0x313abd) {
      _0x4f6dc6(_0x16e4b9);
    } else {
      _0x109159 = _0x16e4b9;
    }
  });
}
export async function closeChromeShellLaunchForUpdate({
  launch: _0x531756,
  env = process.env,
  platform = process.platform,
  spawnProcess = spawn,
  controlWindow = controlChromeShellLaunchWindow,
  setTimeoutFn = setTimeout,
  clearTimeoutFn = clearTimeout,
  gracefulTimeoutMs = TRACKED_CLOSE_GRACE_MS,
  forceTimeoutMs = TRACKED_CLOSE_FORCE_MS
} = {}) {
  if (!_0x531756) {
    return true;
  }
  if (_0x531756.detached === true) {
    return controlWindow({
      launch: _0x531756,
      action: "close",
      env: env,
      platform: platform,
      spawnProcess: spawnProcess,
      setTimeoutFn: setTimeoutFn,
      clearTimeoutFn: clearTimeoutFn
    });
  }
  const _0x45ee7d = _0x531756.process;
  if (!_0x45ee7d || _0x45ee7d.exitCode !== null && _0x45ee7d.exitCode !== undefined || _0x45ee7d.signalCode !== null && _0x45ee7d.signalCode !== undefined) {
    return true;
  }
  if (platform === "win32" && readPositiveInteger(_0x45ee7d.pid)) {
    await runWindowsTaskkill({
      pid: _0x45ee7d.pid,
      force: false,
      spawnProcess: spawnProcess,
      timeoutMs: gracefulTimeoutMs,
      setTimeoutFn: setTimeoutFn,
      clearTimeoutFn: clearTimeoutFn
    });
    if (await waitForChromeShellProcessExit({
      child: _0x45ee7d,
      timeoutMs: gracefulTimeoutMs,
      setTimeoutFn: setTimeoutFn,
      clearTimeoutFn: clearTimeoutFn
    })) {
      return true;
    }
    await runWindowsTaskkill({
      pid: _0x45ee7d.pid,
      force: true,
      spawnProcess: spawnProcess,
      timeoutMs: forceTimeoutMs,
      setTimeoutFn: setTimeoutFn,
      clearTimeoutFn: clearTimeoutFn
    });
    return waitForChromeShellProcessExit({
      child: _0x45ee7d,
      timeoutMs: forceTimeoutMs,
      setTimeoutFn: setTimeoutFn,
      clearTimeoutFn: clearTimeoutFn
    });
  }
  try {
    _0x45ee7d.kill?.();
  } catch {
    return _0x45ee7d.exitCode !== null && _0x45ee7d.exitCode !== undefined || _0x45ee7d.signalCode !== null && _0x45ee7d.signalCode !== undefined;
  }
  return waitForChromeShellProcessExit({
    child: _0x45ee7d,
    timeoutMs: gracefulTimeoutMs,
    setTimeoutFn: setTimeoutFn,
    clearTimeoutFn: clearTimeoutFn
  });
}
function normalizeWindowMode(_0x582223 = {}) {
  const _0x506c0e = String(_0x582223.show_state || _0x582223.state || "").toLowerCase();
  const _0x5815fd = _0x582223.fullscreen === true || _0x582223.isFullscreen === true || _0x582223.is_fullscreen === true || _0x506c0e.includes("fullscreen");
  const _0x4c5995 = _0x582223.maximized === true || _0x582223.isMaximized === true || _0x582223.is_maximized === true || _0x506c0e.includes("maximized");
  return {
    fullscreen: _0x5815fd,
    maximized: _0x4c5995
  };
}
function normalizeChromeWindowPlacement(_0x209b8e = {}) {
  if (!isPlainObject(_0x209b8e)) {
    return null;
  }
  const _0x32086f = readFiniteInteger(_0x209b8e.left);
  const _0x5e4dcb = readFiniteInteger(_0x209b8e.top);
  const _0x2f9015 = readFiniteInteger(_0x209b8e.right);
  const _0x55d9c2 = readFiniteInteger(_0x209b8e.bottom);
  const _0x457bc7 = readPositiveInteger(_0x209b8e.width) || (_0x32086f !== null && _0x2f9015 !== null ? Math.max(0, _0x2f9015 - _0x32086f) : 0);
  const _0x283c13 = readPositiveInteger(_0x209b8e.height) || (_0x5e4dcb !== null && _0x55d9c2 !== null ? Math.max(0, _0x55d9c2 - _0x5e4dcb) : 0);
  const {
    fullscreen: _0x26894e,
    maximized: _0x34f0d0
  } = normalizeWindowMode(_0x209b8e);
  if (!_0x26894e && !_0x34f0d0 && (!_0x457bc7 || !_0x283c13)) {
    return null;
  }
  return {
    fullscreen: _0x26894e,
    maximized: _0x34f0d0,
    x: _0x32086f,
    y: _0x5e4dcb,
    width: _0x457bc7,
    height: _0x283c13
  };
}
function collectChromeAppWindowPlacements(_0x4d5174, _0x513f6f = []) {
  if (!isPlainObject(_0x4d5174)) {
    return _0x513f6f;
  }
  const _0x16fe09 = normalizeChromeWindowPlacement(_0x4d5174);
  if (_0x16fe09) {
    _0x513f6f.push(_0x16fe09);
  }
  Object.values(_0x4d5174).forEach(_0x1282f5 => {
    collectChromeAppWindowPlacements(_0x1282f5, _0x513f6f);
  });
  return _0x513f6f;
}
function pickChromeAppWindowPlacement(_0x261eaf = {}) {
  const _0x4198ca = collectChromeAppWindowPlacements(_0x261eaf?.browser?.app_window_placement);
  if (_0x4198ca.length <= 0) {
    return null;
  }
  return [..._0x4198ca].sort((_0x2c7c8c, _0xd2b1e7) => {
    const _0x4689e9 = _0x3a27bc => (_0x3a27bc.fullscreen ? 1000000000 : 0) + (_0x3a27bc.maximized ? 100000000 : 0) + _0x3a27bc.width * _0x3a27bc.height;
    return _0x4689e9(_0xd2b1e7) - _0x4689e9(_0x2c7c8c);
  })[0];
}
function readLegacyElectronWindowState(_0x11f0e4, _0x16492d = readFileSync) {
  const _0x2bcc6c = a208_0x324e56.join(a208_0x324e56.dirname(String(_0x11f0e4 || "")), "window-state.json");
  const _0x573487 = readJsonObject(_0x2bcc6c, _0x16492d);
  const _0x5e94f3 = readPositiveInteger(_0x573487.width);
  const _0x34ddad = readPositiveInteger(_0x573487.height);
  const {
    fullscreen: _0x29778a,
    maximized: _0x280633
  } = normalizeWindowMode(_0x573487);
  if (!_0x29778a && !_0x280633 && (!_0x5e94f3 || !_0x34ddad)) {
    return null;
  }
  return {
    fullscreen: _0x29778a,
    maximized: _0x280633,
    x: null,
    y: null,
    width: _0x5e94f3,
    height: _0x34ddad
  };
}
function normalizeDisplayWorkArea(_0x3c6913) {
  const _0x3e3c60 = isPlainObject(_0x3c6913?.workArea) ? _0x3c6913.workArea : _0x3c6913;
  if (!isPlainObject(_0x3e3c60)) {
    return null;
  }
  const _0x51cf3a = readFiniteInteger(_0x3e3c60.x);
  const _0x381865 = readFiniteInteger(_0x3e3c60.y);
  const _0x557706 = readPositiveInteger(_0x3e3c60.width);
  const _0x3dc444 = readPositiveInteger(_0x3e3c60.height);
  if (_0x51cf3a === null || _0x381865 === null || !_0x557706 || !_0x3dc444) {
    return null;
  }
  return {
    x: _0x51cf3a,
    y: _0x381865,
    width: _0x557706,
    height: _0x3dc444
  };
}
function hasReasonableDisplayIntersection(_0x3144de, _0x1f44b9) {
  const _0x303e84 = Math.max(0, Math.min(_0x3144de.x + _0x3144de.width, _0x1f44b9.x + _0x1f44b9.width) - Math.max(_0x3144de.x, _0x1f44b9.x));
  const _0x34e59d = Math.max(0, Math.min(_0x3144de.y + _0x3144de.height, _0x1f44b9.y + _0x1f44b9.height) - Math.max(_0x3144de.y, _0x1f44b9.y));
  const _0x58041a = Math.min(240, Math.max(1, _0x3144de.width * 0.2));
  const _0x3d5348 = Math.min(120, Math.max(1, _0x3144de.height * 0.2));
  return _0x303e84 >= _0x58041a && _0x34e59d >= _0x3d5348;
}
function distanceFromWindowCenterToWorkArea(_0x327e0d, _0x5eb921) {
  const _0x4d094c = _0x327e0d.x + _0x327e0d.width / 2;
  const _0x4de166 = _0x327e0d.y + _0x327e0d.height / 2;
  const _0x47bb89 = Math.min(Math.max(_0x4d094c, _0x5eb921.x), _0x5eb921.x + _0x5eb921.width);
  const _0x3f18af = Math.min(Math.max(_0x4de166, _0x5eb921.y), _0x5eb921.y + _0x5eb921.height);
  return (_0x4d094c - _0x47bb89) ** 2 + (_0x4de166 - _0x3f18af) ** 2;
}
function constrainWindowStateToDisplayWorkAreas(_0x44ff27, _0x1e7ab3) {
  if (!Array.isArray(_0x1e7ab3) || !_0x44ff27 || _0x44ff27.fullscreen || _0x44ff27.maximized || _0x44ff27.x === null || _0x44ff27.y === null) {
    return _0x44ff27;
  }
  const _0x7723d7 = _0x1e7ab3.map(_0x8868f7 => normalizeDisplayWorkArea(_0x8868f7)).filter(Boolean);
  if (_0x7723d7.length <= 0) {
    return {
      ..._0x44ff27,
      x: null,
      y: null
    };
  }
  if (_0x7723d7.some(_0xc7c2d2 => hasReasonableDisplayIntersection(_0x44ff27, _0xc7c2d2))) {
    return _0x44ff27;
  }
  const _0x4fcda1 = [..._0x7723d7].sort((_0x505642, _0x28afd0) => distanceFromWindowCenterToWorkArea(_0x44ff27, _0x505642) - distanceFromWindowCenterToWorkArea(_0x44ff27, _0x28afd0))[0];
  const _0xce5bed = Math.min(_0x44ff27.width, _0x4fcda1.width);
  const _0x41e508 = Math.min(_0x44ff27.height, _0x4fcda1.height);
  return {
    ..._0x44ff27,
    x: _0x4fcda1.x + Math.round((_0x4fcda1.width - _0xce5bed) / 2),
    y: _0x4fcda1.y + Math.round((_0x4fcda1.height - _0x41e508) / 2),
    width: _0xce5bed,
    height: _0x41e508
  };
}
function buildWindowStartupArgs(_0x3a6d19) {
  if (!_0x3a6d19) {
    return [];
  }
  if (_0x3a6d19.fullscreen) {
    return ["--start-fullscreen"];
  }
  if (_0x3a6d19.maximized) {
    return ["--start-maximized"];
  }
  if (!_0x3a6d19.width || !_0x3a6d19.height) {
    return [];
  }
  const _0x52027b = ["--window-size=" + _0x3a6d19.width + "," + _0x3a6d19.height];
  if (_0x3a6d19.x !== null && _0x3a6d19.y !== null) {
    _0x52027b.unshift("--window-position=" + _0x3a6d19.x + "," + _0x3a6d19.y);
  }
  return _0x52027b;
}
export function resolveChromeShellWindowStartupArgs({
  profileDir: _0x352432,
  readFile = readFileSync,
  displayWorkAreas = null
} = {}) {
  const _0x1da769 = a208_0x324e56.join(String(_0x352432 || ""), "Default", "Preferences");
  const _0x1aae65 = readChromePreferences(_0x1da769, readFile);
  return buildWindowStartupArgs(constrainWindowStateToDisplayWorkAreas(pickChromeAppWindowPlacement(_0x1aae65) || readLegacyElectronWindowState(_0x352432, readFile), displayWorkAreas));
}
export async function launchChromeShell({
  app: _0x323167,
  appUrl: _0xa4fa8a,
  env = process.env,
  platform = process.platform,
  windowsTaskbarIdentity = null,
  windowsTaskbarIdentityPreparation = null,
  exists = existsSync,
  mkdir = mkdirSync,
  readFile = readFileSync,
  writeFile = writeFileSync,
  spawnProcess = spawn,
  logEvent = null,
  onExit = null,
  onError = null,
  now = () => Date.now(),
  displayWorkAreas = null
} = {}) {
  const _0x556c0e = resolveChromeShellBrowserExecutable({
    env: env,
    platform: platform,
    exists: exists
  });
  if (!_0x556c0e) {
    throw new Error("Chrome or Edge executable not found");
  }
  const _0x5104c9 = resolveChromeShellProfileDir({
    app: _0x323167,
    env: env,
    browserPath: _0x556c0e
  });
  mkdir(_0x5104c9, {
    recursive: true
  });
  const _0x303da5 = _0x323167?.isPackaged === true;
  writeChromeShellPreferences({
    profileDir: _0x5104c9,
    disableDevTools: _0x303da5,
    mkdir: mkdir,
    readFile: readFile,
    writeFile: writeFile
  });
  const _0x227fe5 = buildChromeShellAppUrl(_0xa4fa8a, {
    appIsPackaged: _0x303da5
  });
  const _0x8e14a = resolveRemoteDebuggingPort(env);
  const _0x342469 = resolveChromeShellWindowStartupArgs({
    profileDir: _0x5104c9,
    readFile: readFile,
    displayWorkAreas: displayWorkAreas
  });
  const _0x5a9e48 = ["--user-data-dir=" + _0x5104c9, "--no-first-run", "--no-default-browser-check", "--autoplay-policy=no-user-gesture-required", ...resolveBackgroundModeArgs(env), ...resolveBackgroundResponsivenessArgs(env), ..._0x342469, ...(_0x8e14a ? ["--remote-debugging-port=" + _0x8e14a] : []), "--app=" + _0x227fe5];
  const _0x2f0538 = windowsTaskbarIdentityPreparation ? await windowsTaskbarIdentityPreparation : await prepareWindowsChromeShellTaskbarIdentity({
    browserPath: _0x556c0e,
    profileDir: _0x5104c9,
    platform: platform,
    spawnProcess: spawnProcess,
    logEvent: logEvent,
    ...windowsTaskbarIdentity
  });
  let _0x44a44b;
  let _0x449212 = 0;
  try {
    _0x449212 = now();
    _0x44a44b = spawnProcess(_0x556c0e, _0x5a9e48, {
      stdio: "ignore",
      windowsHide: false
    });
  } catch (_0x24835a) {
    _0x2f0538?.cancel?.();
    throw normalizeChromeShellSpawnError(_0x24835a);
  }
  const _0x519f27 = {
    browserPath: _0x556c0e,
    profileDir: _0x5104c9,
    appUrl: _0x227fe5,
    process: _0x44a44b,
    spawnedAt: _0x449212,
    detached: false,
    spawnError: null
  };
  _0x44a44b?.once?.("error", _0x4247eb => {
    const _0x385d86 = normalizeChromeShellSpawnError(_0x4247eb);
    _0x519f27.spawnError = _0x385d86;
    _0x2f0538?.cancel?.();
    onError?.(_0x385d86);
  });
  if (typeof onExit === "function") {
    _0x44a44b?.once?.("exit", (_0x4ed00f, _0x345c62) => onExit({
      code: _0x4ed00f,
      signal: _0x345c62,
      spawnedAt: _0x449212
    }));
  }
  _0x2f0538?.attach(_0x44a44b);
  activateChromeShellWindowSoon({
    child: _0x44a44b,
    env: env,
    platform: platform,
    spawnProcess: spawnProcess
  });
  return _0x519f27;
}
function shouldQuitWhenChromeShellExits(_0xee7319 = process.env) {
  return envFlag(_0xee7319, "AIC_CHROME_SHELL_KEEP_LAUNCHER") !== true;
}
export async function launchChromeShellWithLifecycle({
  app: _0x4b4951,
  appUrl: _0x34337e,
  env = process.env,
  platform = process.platform,
  windowsTaskbarIdentity = null,
  windowsTaskbarIdentityPreparation = null,
  exists = existsSync,
  mkdir = mkdirSync,
  readFile = readFileSync,
  writeFile = writeFileSync,
  spawnProcess = spawn,
  logEvent = null,
  onClosed = null,
  onLaunchError = null,
  now = () => Date.now(),
  displayWorkAreas = null
} = {}) {
  const _0x4ca867 = resolveEarlyExitGraceMs(env);
  let _0x10d816 = null;
  _0x10d816 = await launchChromeShell({
    app: _0x4b4951,
    appUrl: _0x34337e,
    env: env,
    platform: platform,
    windowsTaskbarIdentity: windowsTaskbarIdentity,
    windowsTaskbarIdentityPreparation: windowsTaskbarIdentityPreparation,
    exists: exists,
    mkdir: mkdir,
    readFile: readFile,
    writeFile: writeFile,
    spawnProcess: spawnProcess,
    logEvent: logEvent,
    now: now,
    displayWorkAreas: displayWorkAreas,
    onExit: ({
      code: _0x219f6e,
      signal: _0x4ba80b,
      spawnedAt: _0x2463f4
    }) => {
      const _0x29474a = Math.max(0, now() - _0x2463f4);
      const _0x338b8c = {
        code: _0x219f6e,
        signal: _0x4ba80b,
        runtimeMs: _0x29474a
      };
      if (isCleanEarlyChromeShellExit({
        ..._0x338b8c,
        graceMs: _0x4ca867
      })) {
        if (_0x10d816) {
          _0x10d816.detached = true;
        }
        logEvent?.({
          type: "chrome_shell.early_exit_ignored",
          level: "warn",
          source: "main",
          message: "Chrome shell process exited before the app-window grace period elapsed",
          context: {
            ..._0x338b8c,
            graceMs: _0x4ca867,
            profileDir: _0x10d816?.profileDir || "",
            appUrl: _0x10d816?.appUrl || ""
          }
        });
        onClosed?.({
          ..._0x338b8c,
          detached: true
        });
        return;
      }
      if (_0x10d816) {
        _0x10d816.detached = false;
      }
      logEvent?.({
        type: "chrome_shell.exited",
        level: "info",
        source: "main",
        message: "Chrome shell process exited",
        context: _0x338b8c
      });
      const _0xa364df = onClosed?.({
        ..._0x338b8c,
        detached: false
      }) !== false;
      if (_0xa364df && shouldQuitWhenChromeShellExits(env)) {
        _0x4b4951?.quit?.();
      }
    },
    onError: _0x4cf5d0 => {
      const _0x430ce9 = normalizeChromeShellSpawnError(_0x4cf5d0);
      if (_0x10d816) {
        _0x10d816.spawnError = _0x430ce9;
      }
      logEvent?.({
        type: "chrome_shell.spawn_error",
        level: "error",
        source: "main",
        message: "Chrome shell process failed",
        error: _0x430ce9
      });
      onLaunchError?.(_0x430ce9);
    }
  });
  logEvent?.({
    type: "chrome_shell.launched",
    level: "info",
    source: "main",
    message: "Chrome shell launched",
    context: {
      browserPath: _0x10d816.browserPath,
      profileDir: _0x10d816.profileDir,
      appUrl: _0x10d816.appUrl
    }
  });
  return _0x10d816;
}
export const __chromeShellLauncherForTest = {
  candidatePathsForPlatform: candidatePathsForPlatform,
  envFlag: envFlag,
  resolveRemoteDebuggingPort: resolveRemoteDebuggingPort,
  shouldQuitWhenChromeShellExits: shouldQuitWhenChromeShellExits
};