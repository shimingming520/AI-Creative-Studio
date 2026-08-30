import { Buffer } from "node:buffer";
import { spawnSync } from "node:child_process";
import a202_0x5ec7c6 from "node:path";
const WINDOWS_PID_ENV_NAME = "AIC_BACKEND_IDENTITY_PIDS_BASE64";
const PROCESS_QUERY_TIMEOUT_MS = 5000;
const WINDOWS_PROCESS_QUERY_SCRIPT = ("\n$encodedPids = [Environment]::GetEnvironmentVariable(\"" + WINDOWS_PID_ENV_NAME + "\")\nif ([String]::IsNullOrWhiteSpace($encodedPids)) { exit 2 }\n$pidJson = [Text.Encoding]::UTF8.GetString([Convert]::FromBase64String($encodedPids))\n$requestedPids = @(ConvertFrom-Json $pidJson)\n$rows = @()\nforeach ($requestedPid in $requestedPids) {\n  $numericPid = 0\n  if (-not [int]::TryParse([string]$requestedPid, [ref]$numericPid)) { continue }\n  try {\n    $record = Get-CimInstance Win32_Process -Filter (\"ProcessId = \" + $numericPid) -ErrorAction Stop\n  } catch {\n    continue\n  }\n  if ($null -eq $record) { continue }\n  $rows += [pscustomobject]@{\n    pid = [int]$record.ProcessId\n    executablePath = [string]$record.ExecutablePath\n    commandLine = [string]$record.CommandLine\n  }\n}\n$json = ConvertTo-Json -InputObject @($rows) -Compress\n$encodedRows = [Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes($json))\n[Console]::Out.Write($encodedRows)\n").trim();
const WINDOWS_PROCESS_QUERY_ENCODED_COMMAND = Buffer.from(WINDOWS_PROCESS_QUERY_SCRIPT, "utf16le").toString("base64");
function normalizePids(_0x1133b8 = []) {
  return [...new Set((Array.isArray(_0x1133b8) ? _0x1133b8 : []).map(_0x183474 => Number(_0x183474)).filter(_0x247dd1 => Number.isInteger(_0x247dd1) && _0x247dd1 > 0))];
}
function createIdentityError(_0x1977d9, _0x53de98 = null) {
  const _0xe5d938 = new Error(_0x1977d9);
  _0xe5d938.code = "AIC_STARTUP_PORT_IDENTITY_CHECK_FAILED";
  if (_0x53de98) {
    _0xe5d938.cause = _0x53de98;
  }
  return _0xe5d938;
}
function normalizeExecutablePath(_0xdadd3e, _0x3b97e5) {
  const _0x4475dc = String(_0xdadd3e || "").trim().replace(/^"|"$/g, "");
  if (!_0x4475dc) {
    return "";
  }
  if (_0x3b97e5 === "win32") {
    return a202_0x5ec7c6.win32.normalize(_0x4475dc).toLowerCase();
  } else {
    return a202_0x5ec7c6.posix.normalize(_0x4475dc);
  }
}
function normalizeCommandLine(_0xe0d430, _0x32d7d1) {
  const _0x5d311d = String(_0xe0d430 || "").trim();
  if (_0x32d7d1 === "win32") {
    return _0x5d311d.replace(/\\/g, "/").toLowerCase();
  } else {
    return _0x5d311d;
  }
}
function hasBackendLaunchArguments(_0x3240b3, {
  host: _0x4c9da5,
  port: _0x25f5ba
}) {
  return _0x3240b3.includes("--host=" + String(_0x4c9da5 || "")) && _0x3240b3.includes("--port=" + Number(_0x25f5ba));
}
export function isExpectedBackendProcess(_0x69e01e = {}, _0x159eab = {}) {
  const _0x2489af = _0x159eab.platform || process.platform;
  const _0x333e98 = _0x2489af === "win32" ? a202_0x5ec7c6.win32 : a202_0x5ec7c6.posix;
  const _0x3dadbe = normalizeExecutablePath(_0x69e01e.executablePath, _0x2489af);
  const _0x2ef7d0 = normalizeExecutablePath(_0x159eab.backendCommand, _0x2489af);
  const _0x479986 = normalizeCommandLine(_0x69e01e.commandLine, _0x2489af);
  if (!_0x2ef7d0 || !_0x479986 || !hasBackendLaunchArguments(_0x479986, _0x159eab)) {
    return false;
  }
  if (_0x159eab.appIsPackaged) {
    if (_0x2489af === "win32") {
      return _0x3dadbe === _0x2ef7d0;
    }
    return _0x3dadbe === _0x2ef7d0 || _0x479986.includes(_0x2ef7d0);
  }
  if (_0x333e98.isAbsolute(String(_0x159eab.backendCommand || ""))) {
    if (_0x3dadbe !== _0x2ef7d0) {
      return false;
    }
    return true;
  } else {
    const _0x1b12fc = _0x333e98.basename(_0x3dadbe || _0x479986).toLowerCase();
    if (!/^python(?:3(?:\.\d+)?)?(?:\.exe)?$/.test(_0x1b12fc)) {
      return false;
    }
  }
  const _0x196623 = normalizeCommandLine(_0x333e98.join(String(_0x159eab.appRoot || ""), "server.py"), _0x2489af);
  return _0x479986.includes(_0x196623) || /(?:^|[\s"'])server\.py(?:[\s"']|$)/i.test(_0x479986);
}
function inspectWindowsBackendProcesses({
  pids: _0x40d897,
  env: _0x310c1b,
  spawnProcess: _0x55bb57
}) {
  const _0xaa9c52 = _0x55bb57("powershell.exe", ["-NoLogo", "-NoProfile", "-NonInteractive", "-ExecutionPolicy", "Bypass", "-EncodedCommand", WINDOWS_PROCESS_QUERY_ENCODED_COMMAND], {
    encoding: "utf8",
    env: {
      ..._0x310c1b,
      [WINDOWS_PID_ENV_NAME]: Buffer.from(JSON.stringify(_0x40d897), "utf8").toString("base64")
    },
    timeout: PROCESS_QUERY_TIMEOUT_MS,
    windowsHide: true
  });
  if (_0xaa9c52?.status !== 0 || _0xaa9c52?.error || _0xaa9c52?.signal) {
    throw createIdentityError("Failed to inspect Windows processes that own the startup port", _0xaa9c52?.error || null);
  }
  try {
    const _0x1222ea = Buffer.from(String(_0xaa9c52.stdout || "").trim(), "base64").toString("utf8");
    const _0x4a99a3 = JSON.parse(_0x1222ea || "[]");
    if (Array.isArray(_0x4a99a3)) {
      return _0x4a99a3;
    } else {
      return [];
    }
  } catch (_0x55d182) {
    throw createIdentityError("Windows process identity output was invalid", _0x55d182);
  }
}
function inspectPosixBackendProcesses({
  pids: _0x526d29,
  spawnProcess: _0x13c135
}) {
  const _0x4574c7 = [];
  for (const _0x4e36bb of _0x526d29) {
    const _0x5c7908 = _0x13c135("ps", ["-p", String(_0x4e36bb), "-o", "comm=", "-o", "args="], {
      encoding: "utf8",
      timeout: PROCESS_QUERY_TIMEOUT_MS
    });
    if (_0x5c7908?.status === 1) {
      continue;
    }
    if (_0x5c7908?.status !== 0 || _0x5c7908?.error || _0x5c7908?.signal) {
      throw createIdentityError("Failed to inspect process " + _0x4e36bb + " that owns the startup port", _0x5c7908?.error || null);
    }
    const _0x31648e = String(_0x5c7908.stdout || "").trim();
    if (_0x31648e) {
      _0x4574c7.push({
        pid: _0x4e36bb,
        executablePath: "",
        commandLine: _0x31648e
      });
    }
  }
  return _0x4574c7;
}
export function inspectBackendProcesses({
  pids: _0x2e2f9a,
  platform = process.platform,
  env = process.env,
  spawnProcess = spawnSync
} = {}) {
  const _0x4162f5 = normalizePids(_0x2e2f9a);
  if (_0x4162f5.length === 0) {
    return [];
  }
  if (platform === "win32") {
    return inspectWindowsBackendProcesses({
      pids: _0x4162f5,
      env: env,
      spawnProcess: spawnProcess
    });
  } else {
    return inspectPosixBackendProcesses({
      pids: _0x4162f5,
      spawnProcess: spawnProcess
    });
  }
}
export function findVerifiedBackendProcessPids({
  pids: _0x42d957,
  appIsPackaged: _0x536140,
  appRoot: _0x4e1dea,
  backendCommand: _0xd85248,
  host: _0x53cb1a,
  port: _0xfa7c8e,
  platform = process.platform,
  inspectProcesses = _0x2b6244 => inspectBackendProcesses({
    pids: _0x2b6244,
    platform: platform
  })
} = {}) {
  const _0x181f99 = normalizePids(_0x42d957);
  const _0x22f76f = new Set(_0x181f99);
  const _0x49f24c = {
    appIsPackaged: _0x536140,
    appRoot: _0x4e1dea,
    backendCommand: _0xd85248,
    host: _0x53cb1a,
    port: _0xfa7c8e,
    platform: platform
  };
  return normalizePids(inspectProcesses(_0x181f99).filter(_0x54b2ae => _0x22f76f.has(Number(_0x54b2ae?.pid)) && isExpectedBackendProcess(_0x54b2ae, _0x49f24c)).map(_0x2b5cd0 => _0x2b5cd0.pid));
}
export const __backendProcessIdentityForTest = {
  WINDOWS_PROCESS_QUERY_SCRIPT: WINDOWS_PROCESS_QUERY_SCRIPT,
  normalizeExecutablePath: normalizeExecutablePath
};
