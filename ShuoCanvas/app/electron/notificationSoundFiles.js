import { spawn } from "node:child_process";
import { mkdirSync, realpathSync, readdirSync, statSync } from "node:fs";
import a264_0x40526d from "node:path";
import { pathToFileURL } from "node:url";
function normalizeText(_0x100500, _0x312b6d = 1024) {
  return String(_0x100500 || "").replace(/\0/g, "").trim().slice(0, _0x312b6d);
}
export async function listNotificationSoundMp3Files(_0x509719 = {}) {
  const _0x2fef77 = normalizeText(_0x509719?.directory);
  if (!_0x2fef77) {
    return {
      success: true,
      files: []
    };
  }
  if (!a264_0x40526d.isAbsolute(_0x2fef77)) {
    throw new Error("提示音目录必须是绝对路径");
  }
  const _0x5160da = realpathSync(_0x2fef77);
  const _0x56cac7 = statSync(_0x5160da);
  if (!_0x56cac7.isDirectory()) {
    throw new Error("提示音目录不存在或不是文件夹");
  }
  const _0x47dfde = readdirSync(_0x5160da, {
    withFileTypes: true
  }).filter(_0x3b4636 => _0x3b4636.isFile() && /\.mp3$/i.test(_0x3b4636.name)).map(_0x586576 => ({
    name: _0x586576.name,
    path: a264_0x40526d.join(_0x5160da, _0x586576.name)
  })).sort((_0x55739f, _0x325bce) => _0x55739f.name.localeCompare(_0x325bce.name, "zh-Hans-CN")).slice(0, 200);
  return {
    success: true,
    directory: _0x5160da,
    files: _0x47dfde
  };
}
function clampVolume(_0x214413) {
  const _0x5dc6ac = Number(_0x214413);
  if (!Number.isFinite(_0x5dc6ac)) {
    return 0.7;
  }
  return Math.max(0, Math.min(1, _0x5dc6ac));
}
function escapePowerShellSingleQuoted(_0x4c0fdf) {
  return String(_0x4c0fdf || "").replace(/'/g, "''");
}
function pathToFileUri(_0x22543c) {
  return pathToFileURL(a264_0x40526d.resolve(_0x22543c)).href;
}
function resolveNotificationSoundPath(_0x8e76de, _0x36c636) {
  const _0x2d065a = normalizeText(_0x8e76de);
  if (!_0x2d065a) {
    throw new Error("提示音文件不能为空");
  }
  const _0x121419 = !a264_0x40526d.isAbsolute(_0x2d065a);
  const _0x42b453 = a264_0x40526d.resolve(_0x36c636 || ".");
  const _0x59bb9d = _0x121419 ? a264_0x40526d.resolve(_0x42b453, _0x2d065a) : a264_0x40526d.resolve(_0x2d065a);
  if (_0x121419 && _0x59bb9d !== _0x42b453 && !_0x59bb9d.startsWith("" + _0x42b453 + a264_0x40526d.sep)) {
    throw new Error("提示音相对路径超出应用目录");
  }
  const _0x20d125 = statSync(_0x59bb9d);
  if (!_0x20d125.isFile()) {
    throw new Error("提示音文件不存在或不是文件");
  }
  return _0x59bb9d;
}
export async function playNotificationSoundFile(_0x242b66 = {}, {
  appRoot = ".",
  platform = process.platform,
  spawnProcess = spawn,
  logEvent = null
} = {}) {
  const _0x4fa6b1 = resolveNotificationSoundPath(_0x242b66?.filePath || _0x242b66?.path || _0x242b66?.selectedFilePath, appRoot);
  const _0xb2b105 = clampVolume(_0x242b66?.volume);
  if (platform !== "win32") {
    return {
      success: false,
      played: false,
      reason: "unsupported-platform",
      path: _0x4fa6b1
    };
  }
  const _0x1bffd1 = ["$ErrorActionPreference='Stop'", "Add-Type -AssemblyName PresentationCore", "$player=New-Object System.Windows.Media.MediaPlayer", "$player.Open([Uri]'" + escapePowerShellSingleQuoted(pathToFileUri(_0x4fa6b1)) + "')", "$player.Volume=" + _0xb2b105.toFixed(3), "$player.Play()", "Start-Sleep -Milliseconds 750", "if (-not $player.NaturalDuration.HasTimeSpan -and $player.Position.TotalMilliseconds -le 0) { $player.Close(); throw 'Notification sound failed to start' }", "$durationMs=1750", "if ($player.NaturalDuration.HasTimeSpan) { $durationMs=[Math]::Ceiling($player.NaturalDuration.TimeSpan.TotalMilliseconds-$player.Position.TotalMilliseconds)+100 }", "$durationMs=[Math]::Min(30000,[Math]::Max(100,$durationMs))", "Start-Sleep -Milliseconds $durationMs", "$player.Close()"].join("; ");
  const _0x3e2b18 = (_0x5e12dc, _0x2687a1 = {}) => {
    const _0x26a678 = _0x2687a1.error;
    logEvent?.({
      type: "notification_sound.play_failed",
      level: "warn",
      source: "main",
      message: "Notification sound playback failed",
      error: _0x26a678 ? String(_0x26a678?.message || _0x26a678) : "",
      context: {
        filePath: _0x4fa6b1,
        reason: _0x5e12dc,
        ..._0x2687a1,
        error: undefined
      }
    });
    return {
      success: false,
      played: false,
      reason: _0x5e12dc,
      path: _0x4fa6b1,
      volume: _0xb2b105,
      ..._0x2687a1,
      ...(_0x26a678 ? {
        error: String(_0x26a678?.message || _0x26a678)
      } : {})
    };
  };
  let _0x22458f;
  try {
    _0x22458f = spawnProcess("powershell.exe", ["-NoProfile", "-ExecutionPolicy", "Bypass", "-Command", _0x1bffd1], {
      stdio: "ignore",
      windowsHide: true
    });
  } catch (_0x5c2ddd) {
    return _0x3e2b18("spawn-error", {
      error: _0x5c2ddd
    });
  }
  if (!_0x22458f || typeof _0x22458f.once !== "function") {
    return _0x3e2b18("invalid-player-process");
  }
  return await new Promise(_0x36e9da => {
    let _0x4ae05c = false;
    const _0x4ec0f2 = _0x30dd57 => {
      if (_0x4ae05c) {
        return;
      }
      _0x4ae05c = true;
      _0x36e9da(_0x30dd57);
    };
    _0x22458f.once("error", _0x183fe7 => {
      _0x4ec0f2(_0x3e2b18("spawn-error", {
        error: _0x183fe7
      }));
    });
    _0x22458f.once("exit", (_0x457480, _0x4f3226) => {
      if (_0x457480 === 0) {
        _0x4ec0f2({
          success: true,
          played: true,
          path: _0x4fa6b1,
          volume: _0xb2b105
        });
        return;
      }
      _0x4ec0f2(_0x3e2b18("player-exit", {
        exitCode: _0x457480,
        signal: _0x4f3226 || ""
      }));
    });
  });
}
export function createSystemNotificationSoundFileService({
  appRoot: _0xa90672,
  openPath: _0x142ccf,
  platform = process.platform,
  spawnProcess = spawn,
  logEvent = null
} = {}) {
  const _0x4d3245 = () => a264_0x40526d.join(_0xa90672 || ".", "assets", "sounds");
  return {
    async listSystemNotificationSoundFiles() {
      const _0x10509f = await listNotificationSoundMp3Files({
        directory: _0x4d3245()
      });
      return {
        ..._0x10509f,
        files: _0x10509f.files.map(_0x35a8cd => ({
          ..._0x35a8cd,
          playbackUrl: "/assets/sounds/" + encodeURIComponent(_0x35a8cd.name)
        }))
      };
    },
    async openSystemNotificationSoundFolder() {
      const _0x2a6982 = _0x4d3245();
      mkdirSync(_0x2a6982, {
        recursive: true
      });
      if (typeof _0x142ccf === "function") {
        await _0x142ccf(_0x2a6982);
      }
      return {
        success: true,
        path: _0x2a6982
      };
    },
    playNotificationSound(_0x4cf671 = {}) {
      return playNotificationSoundFile(_0x4cf671, {
        appRoot: _0xa90672,
        platform: platform,
        spawnProcess: spawnProcess,
        logEvent: logEvent
      });
    }
  };
}