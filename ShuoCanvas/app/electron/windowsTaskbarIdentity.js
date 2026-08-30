import { spawn } from "node:child_process";
const WINDOWS_CHROME_SHELL_IDENTITY_TIMEOUT_MS = 6000;
export function configureWindowsTaskbarIdentity({
  window: _0x1850ae,
  platform = process.platform,
  appId: _0x40f32f,
  iconPath: _0x3499de,
  executablePath: _0x40ffeb,
  displayName: _0xfa5d33
} = {}) {
  if (platform !== "win32" || typeof _0x1850ae?.setIcon !== "function" || typeof _0x1850ae?.setAppDetails !== "function") {
    return false;
  }
  if (!_0x40f32f || !_0x3499de || !_0x40ffeb || !_0xfa5d33) {
    return false;
  }
  try {
    _0x1850ae.setIcon(_0x3499de);
    _0x1850ae.setAppDetails({
      appId: _0x40f32f,
      appIconPath: _0x3499de,
      appIconIndex: 0,
      relaunchCommand: _0x40ffeb,
      relaunchDisplayName: _0xfa5d33
    });
    return true;
  } catch {
    return false;
  }
}
export function installWindowsTaskbarIdentity(_0x420142 = {}) {
  const {
    window: _0x24b6d1,
    platform = process.platform
  } = _0x420142;
  if (platform !== "win32" || typeof _0x24b6d1?.on !== "function" || typeof _0x24b6d1?.setIcon !== "function" || typeof _0x24b6d1?.setAppDetails !== "function") {
    return false;
  }
  const _0x1d3b3f = () => configureWindowsTaskbarIdentity({
    ..._0x420142,
    platform: platform
  });
  _0x1d3b3f();
  _0x24b6d1.on("show", _0x1d3b3f);
  return true;
}
function encodePowerShellValue(_0x4ea339) {
  return Buffer.from(String(_0x4ea339 || ""), "utf8").toString("base64");
}
function readPositiveInteger(_0x7ca050) {
  const _0x5493d8 = Number(_0x7ca050);
  if (Number.isFinite(_0x5493d8) && _0x5493d8 > 0) {
    return Math.round(_0x5493d8);
  } else {
    return 0;
  }
}
function readNonNegativeInteger(_0x37da1c, _0x398bd4) {
  const _0x5a4d34 = Number(_0x37da1c);
  if (!Number.isFinite(_0x5a4d34) || _0x5a4d34 < 0) {
    return _0x398bd4;
  }
  return Math.round(_0x5a4d34);
}
export function buildWindowsChromeShellTaskbarIdentityScript({
  browserPath: _0x51ea00,
  profileDir: _0x50d9bc,
  appId: _0x16a555,
  iconPath: _0x3e0b68,
  executablePath: _0x104303,
  displayName: _0x572447,
  timeoutMs = WINDOWS_CHROME_SHELL_IDENTITY_TIMEOUT_MS
} = {}) {
  if (!_0x51ea00 || !_0x50d9bc || !_0x16a555 || !_0x3e0b68 || !_0x104303 || !_0x572447) {
    return "";
  }
  const _0x136384 = readNonNegativeInteger(timeoutMs, WINDOWS_CHROME_SHELL_IDENTITY_TIMEOUT_MS);
  return ("\n$timeoutMs = " + _0x136384 + "\nfunction Decode-TaskbarIdentityValue([string]$encodedValue) {\n  return [System.Text.Encoding]::UTF8.GetString(\n    [System.Convert]::FromBase64String($encodedValue)\n  )\n}\n$browserPath = Decode-TaskbarIdentityValue \"" + encodePowerShellValue(_0x51ea00) + "\"\n$profileDir = Decode-TaskbarIdentityValue \"" + encodePowerShellValue(_0x50d9bc) + "\"\n$appId = Decode-TaskbarIdentityValue \"" + encodePowerShellValue(_0x16a555) + "\"\n$iconPath = Decode-TaskbarIdentityValue \"" + encodePowerShellValue(_0x3e0b68) + "\"\n$executablePath = Decode-TaskbarIdentityValue \"" + encodePowerShellValue(_0x104303) + "\"\n$displayName = Decode-TaskbarIdentityValue \"" + encodePowerShellValue(_0x572447) + "\"\n$relaunchCommand = '\"' + $executablePath + '\"'\n$relaunchIconResource = $iconPath + ',0'\n$profileSwitch = '--user-data-dir=' + $profileDir\n$browserName = [System.IO.Path]::GetFileName($browserPath)\n$browserPathIsRooted = [System.IO.Path]::IsPathRooted($browserPath)\n$typeDefinition = @'\nusing System;\nusing System.Collections.Concurrent;\nusing System.Collections.Generic;\nusing System.Runtime.InteropServices;\nusing System.Text;\n\nnamespace ShuoCanvas {\n  [StructLayout(LayoutKind.Sequential, Pack = 4)]\n  public struct PropertyKey {\n    public Guid formatId;\n    public UInt32 propertyId;\n\n    public PropertyKey(Guid formatId, UInt32 propertyId) {\n      this.formatId = formatId;\n      this.propertyId = propertyId;\n    }\n  }\n\n  [StructLayout(LayoutKind.Explicit, Size = 24)]\n  public struct PropVariant {\n    [FieldOffset(0)]\n    public UInt16 valueType;\n\n    [FieldOffset(8)]\n    public IntPtr pointerValue;\n  }\n\n  [ComImport]\n  [Guid(\"886D8EEB-8CF2-4446-8D02-CDBA1DBDCF99\")]\n  [InterfaceType(ComInterfaceType.InterfaceIsIUnknown)]\n  public interface IPropertyStore {\n    [PreserveSig]\n    Int32 GetCount(out UInt32 propertyCount);\n\n    [PreserveSig]\n    Int32 GetAt(UInt32 propertyIndex, out PropertyKey key);\n\n    [PreserveSig]\n    Int32 GetValue(ref PropertyKey key, out PropVariant value);\n\n    [PreserveSig]\n    Int32 SetValue(ref PropertyKey key, ref PropVariant value);\n\n    [PreserveSig]\n    Int32 Commit();\n  }\n\n  public static class ChromeShellTaskbarIdentity {\n    public delegate bool EnumWindowsProc(IntPtr windowHandle, IntPtr parameter);\n    private delegate void WinEventDelegate(\n      IntPtr hook,\n      UInt32 eventType,\n      IntPtr windowHandle,\n      Int32 objectId,\n      Int32 childId,\n      UInt32 eventThread,\n      UInt32 eventTime\n    );\n\n    [DllImport(\"user32.dll\")]\n    [return: MarshalAs(UnmanagedType.Bool)]\n    public static extern bool EnumWindows(EnumWindowsProc callback, IntPtr parameter);\n\n    [DllImport(\"user32.dll\")]\n    public static extern UInt32 GetWindowThreadProcessId(\n      IntPtr windowHandle,\n      out UInt32 processId\n    );\n\n    [DllImport(\"user32.dll\")]\n    [return: MarshalAs(UnmanagedType.Bool)]\n    public static extern bool IsWindowVisible(IntPtr windowHandle);\n\n    [DllImport(\"user32.dll\")]\n    private static extern bool IsWindow(IntPtr windowHandle);\n\n    [DllImport(\"user32.dll\")]\n    private static extern IntPtr GetAncestor(IntPtr windowHandle, UInt32 flags);\n\n    [DllImport(\"user32.dll\")]\n    private static extern IntPtr GetWindow(IntPtr windowHandle, UInt32 command);\n\n    [DllImport(\"user32.dll\", CharSet = CharSet.Unicode)]\n    private static extern IntPtr LoadImage(\n      IntPtr instance,\n      string name,\n      UInt32 type,\n      Int32 width,\n      Int32 height,\n      UInt32 loadFlags\n    );\n\n    [DllImport(\"user32.dll\", CharSet = CharSet.Auto)]\n    private static extern IntPtr SendMessageTimeout(\n      IntPtr windowHandle,\n      UInt32 message,\n      UIntPtr wParam,\n      IntPtr lParam,\n      UInt32 flags,\n      UInt32 timeout,\n      out UIntPtr result\n    );\n\n    [DllImport(\"user32.dll\", CharSet = CharSet.Unicode)]\n    public static extern Int32 GetWindowText(\n      IntPtr windowHandle,\n      StringBuilder text,\n      Int32 count\n    );\n\n    [DllImport(\"user32.dll\")]\n    public static extern Int32 GetWindowTextLength(IntPtr windowHandle);\n\n    [DllImport(\"user32.dll\")]\n    [return: MarshalAs(UnmanagedType.Bool)]\n    public static extern bool GetWindowRect(IntPtr windowHandle, out WindowRect rect);\n\n    [StructLayout(LayoutKind.Sequential)]\n    public struct WindowRect {\n      public Int32 left;\n      public Int32 top;\n      public Int32 right;\n      public Int32 bottom;\n    }\n\n    [StructLayout(LayoutKind.Sequential)]\n    private struct Message {\n      public IntPtr windowHandle;\n      public UInt32 message;\n      public UIntPtr wParam;\n      public IntPtr lParam;\n      public UInt32 time;\n      public Int32 x;\n      public Int32 y;\n    }\n\n    [DllImport(\"user32.dll\")]\n    private static extern IntPtr SetWinEventHook(\n      UInt32 eventMin,\n      UInt32 eventMax,\n      IntPtr eventHookModule,\n      WinEventDelegate callback,\n      UInt32 processId,\n      UInt32 threadId,\n      UInt32 flags\n    );\n\n    [DllImport(\"user32.dll\")]\n    [return: MarshalAs(UnmanagedType.Bool)]\n    private static extern bool UnhookWinEvent(IntPtr hook);\n\n    [DllImport(\"user32.dll\")]\n    [return: MarshalAs(UnmanagedType.Bool)]\n    private static extern bool PeekMessage(\n      out Message message,\n      IntPtr windowHandle,\n      UInt32 messageFilterMin,\n      UInt32 messageFilterMax,\n      UInt32 removeMessage\n    );\n\n    [DllImport(\"user32.dll\")]\n    [return: MarshalAs(UnmanagedType.Bool)]\n    private static extern bool TranslateMessage(ref Message message);\n\n    [DllImport(\"user32.dll\")]\n    private static extern IntPtr DispatchMessage(ref Message message);\n\n    [DllImport(\"shell32.dll\", PreserveSig = true)]\n    private static extern Int32 SHGetPropertyStoreForWindow(\n      IntPtr windowHandle,\n      ref Guid interfaceId,\n      [MarshalAs(UnmanagedType.Interface)] out IPropertyStore propertyStore\n    );\n\n    [DllImport(\"ole32.dll\", PreserveSig = true)]\n    private static extern Int32 PropVariantClear(ref PropVariant propVariant);\n\n    private static readonly Guid AppUserModelFormatId =\n      new Guid(\"9F4C2855-9F79-4B39-A8D0-E1D42DE1D5F3\");\n    private const UInt32 RelaunchCommandPropertyId = 2;\n    private const UInt32 RelaunchIconResourcePropertyId = 3;\n    private const UInt32 RelaunchDisplayNameResourcePropertyId = 4;\n    private const UInt32 AppUserModelIdPropertyId = 5;\n    private const UInt16 VariantTypeUnicodeString = 31;\n    private const UInt32 EventObjectCreate = 0x8000;\n    private const UInt32 EventObjectShow = 0x8002;\n    private const UInt32 WineventOutOfContext = 0;\n    private const Int32 ObjectIdWindow = 0;\n    private const UInt32 GetAncestorRoot = 2;\n    private const UInt32 GetWindowOwner = 4;\n    private const UInt32 PeekMessageRemove = 1;\n    private const UInt32 ImageIcon = 1;\n    private const UInt32 LoadIconFromFile = 0x10;\n    private const UInt32 LoadIconDefaultSize = 0x40;\n    private const UInt32 LoadIconShared = 0x8000;\n    private const UInt32 WindowMessageSetIcon = 0x80;\n    private const UInt32 IconSmall = 0;\n    private const UInt32 IconBig = 1;\n    private const UInt32 SendMessageAbortIfHung = 0x2;\n    private static readonly object CandidateProcessLock = new object();\n    private static readonly HashSet<UInt32> CandidateProcessIds =\n      new HashSet<UInt32>();\n    private static readonly ConcurrentQueue<IntPtr> ObservedWindows =\n      new ConcurrentQueue<IntPtr>();\n    private static readonly WinEventDelegate WindowEventCallback =\n      HandleWindowEvent;\n    private static IntPtr windowEventHook = IntPtr.Zero;\n    private static string configuredAppId = \"\";\n    private static string configuredRelaunchCommand = \"\";\n    private static string configuredDisplayName = \"\";\n    private static string configuredIconResource = \"\";\n    private static IntPtr configuredIconHandle = IntPtr.Zero;\n\n    private static void SetString(\n      IPropertyStore propertyStore,\n      UInt32 propertyId,\n      string value\n    ) {\n      PropVariant propVariant = new PropVariant();\n      propVariant.valueType = VariantTypeUnicodeString;\n      propVariant.pointerValue = Marshal.StringToCoTaskMemUni(value);\n      try {\n        PropertyKey key = new PropertyKey(AppUserModelFormatId, propertyId);\n        Int32 result = propertyStore.SetValue(ref key, ref propVariant);\n        Marshal.ThrowExceptionForHR(result);\n      } finally {\n        PropVariantClear(ref propVariant);\n      }\n    }\n\n    private static void Apply(\n      IntPtr windowHandle,\n      string appId,\n      string relaunchCommand,\n      string displayName,\n      string relaunchIconResource\n    ) {\n      Guid interfaceId = new Guid(\"886D8EEB-8CF2-4446-8D02-CDBA1DBDCF99\");\n      IPropertyStore propertyStore = null;\n      Int32 result = SHGetPropertyStoreForWindow(\n        windowHandle,\n        ref interfaceId,\n        out propertyStore\n      );\n      Marshal.ThrowExceptionForHR(result);\n      try {\n        SetString(propertyStore, RelaunchCommandPropertyId, relaunchCommand);\n        SetString(\n          propertyStore,\n          RelaunchDisplayNameResourcePropertyId,\n          displayName\n        );\n        SetString(\n          propertyStore,\n          RelaunchIconResourcePropertyId,\n          relaunchIconResource\n        );\n        SetString(propertyStore, AppUserModelIdPropertyId, appId);\n      } finally {\n        if (propertyStore != null && Marshal.IsComObject(propertyStore)) {\n          Marshal.FinalReleaseComObject(propertyStore);\n        }\n      }\n    }\n\n    public static void Configure(\n      string appId,\n      string relaunchCommand,\n      string displayName,\n      string relaunchIconResource,\n      string iconPath\n    ) {\n      configuredAppId = appId;\n      configuredRelaunchCommand = relaunchCommand;\n      configuredDisplayName = displayName;\n      configuredIconResource = relaunchIconResource;\n      configuredIconHandle = LoadImage(\n        IntPtr.Zero,\n        iconPath,\n        ImageIcon,\n        0,\n        0,\n        LoadIconFromFile | LoadIconDefaultSize | LoadIconShared\n      );\n    }\n\n    public static void AddCandidateProcessId(UInt32 processId) {\n      if (processId == 0) return;\n      lock (CandidateProcessLock) {\n        CandidateProcessIds.Add(processId);\n      }\n    }\n\n    private static bool IsCandidateProcess(UInt32 processId) {\n      lock (CandidateProcessLock) {\n        return CandidateProcessIds.Contains(processId);\n      }\n    }\n\n    private static bool IsTopLevelCandidateWindow(IntPtr windowHandle) {\n      if (windowHandle == IntPtr.Zero || !IsWindow(windowHandle)) return false;\n      if (GetAncestor(windowHandle, GetAncestorRoot) != windowHandle) return false;\n      if (GetWindow(windowHandle, GetWindowOwner) != IntPtr.Zero) return false;\n      UInt32 processId;\n      GetWindowThreadProcessId(windowHandle, out processId);\n      return IsCandidateProcess(processId);\n    }\n\n    private static bool LooksLikeVisibleAppWindow(IntPtr windowHandle) {\n      if (!IsWindowVisible(windowHandle)) return false;\n      WindowRect rect;\n      if (!GetWindowRect(windowHandle, out rect)) return false;\n      Int32 width = rect.right - rect.left;\n      Int32 height = rect.bottom - rect.top;\n      Int32 titleLength = GetWindowTextLength(windowHandle);\n      return width > 300 && height > 300 && titleLength > 0;\n    }\n\n    private static bool TryApply(IntPtr windowHandle, bool requireVisibleApp) {\n      if (!IsTopLevelCandidateWindow(windowHandle)) return false;\n      if (requireVisibleApp && !LooksLikeVisibleAppWindow(windowHandle)) {\n        return false;\n      }\n      bool iconApplied = false;\n      if (configuredIconHandle != IntPtr.Zero) {\n        UIntPtr messageResult;\n        SendMessageTimeout(\n          windowHandle,\n          WindowMessageSetIcon,\n          new UIntPtr(IconBig),\n          configuredIconHandle,\n          SendMessageAbortIfHung,\n          100,\n          out messageResult\n        );\n        SendMessageTimeout(\n          windowHandle,\n          WindowMessageSetIcon,\n          new UIntPtr(IconSmall),\n          configuredIconHandle,\n          SendMessageAbortIfHung,\n          100,\n          out messageResult\n        );\n        iconApplied = true;\n      }\n      try {\n        Apply(\n          windowHandle,\n          configuredAppId,\n          configuredRelaunchCommand,\n          configuredDisplayName,\n          configuredIconResource\n        );\n        return true;\n      } catch {\n        return iconApplied;\n      }\n    }\n\n    private static void HandleWindowEvent(\n      IntPtr hook,\n      UInt32 eventType,\n      IntPtr windowHandle,\n      Int32 objectId,\n      Int32 childId,\n      UInt32 eventThread,\n      UInt32 eventTime\n    ) {\n      if (\n        objectId != ObjectIdWindow\n        || childId != 0\n        || windowHandle == IntPtr.Zero\n      ) {\n        return;\n      }\n      ObservedWindows.Enqueue(windowHandle);\n      TryApply(windowHandle, false);\n    }\n\n    public static bool StartWatching() {\n      if (windowEventHook != IntPtr.Zero) return true;\n      windowEventHook = SetWinEventHook(\n        EventObjectCreate,\n        EventObjectShow,\n        IntPtr.Zero,\n        WindowEventCallback,\n        0,\n        0,\n        WineventOutOfContext\n      );\n      return windowEventHook != IntPtr.Zero;\n    }\n\n    public static void StopWatching() {\n      if (windowEventHook == IntPtr.Zero) return;\n      UnhookWinEvent(windowEventHook);\n      windowEventHook = IntPtr.Zero;\n    }\n\n    public static void PumpMessages() {\n      Message message;\n      while (\n        PeekMessage(\n          out message,\n          IntPtr.Zero,\n          0,\n          0,\n          PeekMessageRemove\n        )\n      ) {\n        TranslateMessage(ref message);\n        DispatchMessage(ref message);\n      }\n      IntPtr observedWindow;\n      while (ObservedWindows.TryDequeue(out observedWindow)) {\n        TryApply(observedWindow, false);\n      }\n    }\n\n    public static bool ApplyVisibleCandidateWindows() {\n      bool identityApplied = false;\n      EnumWindows(delegate(IntPtr windowHandle, IntPtr parameter) {\n        if (TryApply(windowHandle, true)) identityApplied = true;\n        return true;\n      }, IntPtr.Zero);\n      return identityApplied;\n    }\n  }\n}\n'@\nAdd-Type -TypeDefinition $typeDefinition -ErrorAction Stop\nfunction Register-TaskbarIdentityBrowserProcesses {\n  try {\n    $escapedBrowserName = $browserName.Replace(\"'\", \"''\")\n    $browserProcesses = Get-CimInstance Win32_Process -Filter \"Name = '$escapedBrowserName'\" -ErrorAction Stop\n    foreach ($browserProcess in $browserProcesses) {\n      $matchesExecutable = -not $browserPathIsRooted -or [string]::Equals(\n        [string]$browserProcess.ExecutablePath,\n        $browserPath,\n        [StringComparison]::OrdinalIgnoreCase\n      )\n      $commandLine = [string]$browserProcess.CommandLine\n      $matchesProfile = $commandLine.IndexOf(\n        $profileSwitch,\n        [StringComparison]::OrdinalIgnoreCase\n      ) -ge 0\n      if ($matchesExecutable -and $matchesProfile) {\n        [ShuoCanvas.ChromeShellTaskbarIdentity]::AddCandidateProcessId(\n          [uint32]$browserProcess.ProcessId\n        )\n      }\n    }\n  } catch {}\n}\n[ShuoCanvas.ChromeShellTaskbarIdentity]::Configure(\n  $appId,\n  $relaunchCommand,\n  $displayName,\n  $relaunchIconResource,\n  $iconPath\n)\nRegister-TaskbarIdentityBrowserProcesses\nif (-not [ShuoCanvas.ChromeShellTaskbarIdentity]::StartWatching()) {\n  exit 3\n}\ntry {\n  [Console]::Out.WriteLine('READY')\n  [Console]::Out.Flush()\n  $targetPid = [int][Console]::In.ReadLine()\n  if ($targetPid -le 0) {\n    exit 4\n  }\n  [ShuoCanvas.ChromeShellTaskbarIdentity]::AddCandidateProcessId(\n    [uint32]$targetPid\n  )\n  $deadline = [DateTime]::UtcNow.AddMilliseconds($timeoutMs)\n  $nextProcessRefresh = [DateTime]::UtcNow.AddMilliseconds(500)\n  $stableDeadline = $null\n  while ([DateTime]::UtcNow -le $deadline) {\n    [ShuoCanvas.ChromeShellTaskbarIdentity]::PumpMessages()\n    if ($null -eq $stableDeadline -and [DateTime]::UtcNow -ge $nextProcessRefresh) {\n      Register-TaskbarIdentityBrowserProcesses\n      $nextProcessRefresh = [DateTime]::UtcNow.AddMilliseconds(150)\n    }\n    $visibleIdentityApplied =\n      [ShuoCanvas.ChromeShellTaskbarIdentity]::ApplyVisibleCandidateWindows()\n    if ($visibleIdentityApplied -and $null -eq $stableDeadline) {\n      $stableDeadline = [DateTime]::UtcNow.AddMilliseconds(750)\n    }\n    if ($null -ne $stableDeadline -and [DateTime]::UtcNow -ge $stableDeadline) {\n      exit 0\n    }\n    Start-Sleep -Milliseconds 15\n  }\n  exit 2\n} finally {\n  [ShuoCanvas.ChromeShellTaskbarIdentity]::StopWatching()\n}\n").trim();
}
function logTaskbarIdentityFailure(_0x29a7d1, _0x5966df, _0x15a695, _0x1cad6f = {}) {
  _0x29a7d1?.({
    type: _0x5966df,
    level: "warn",
    source: "main",
    message: _0x15a695,
    ..._0x1cad6f
  });
}
function waitForTaskbarIdentityHelperReady(_0x52364b, _0x4c4123 = WINDOWS_CHROME_SHELL_IDENTITY_TIMEOUT_MS) {
  return new Promise(_0x20d4c6 => {
    let _0x21007b = false;
    let _0x2023ab = "";
    const _0x2cd3fd = _0x4dd143 => {
      if (_0x21007b) {
        return;
      }
      _0x21007b = true;
      clearTimeout(_0x2cc639);
      _0x52364b?.stdout?.removeListener?.("data", _0x34a6f3);
      _0x52364b?.removeListener?.("error", _0x497757);
      _0x52364b?.removeListener?.("exit", _0x122107);
      _0x20d4c6(_0x4dd143);
    };
    const _0x34a6f3 = _0x177b91 => {
      _0x2023ab += String(_0x177b91 || "");
      if (/(^|\r?\n)READY\r?\n/.test(_0x2023ab + "\n")) {
        _0x2cd3fd(true);
      }
    };
    const _0x497757 = () => _0x2cd3fd(false);
    const _0x122107 = () => _0x2cd3fd(false);
    const _0x2cc639 = setTimeout(() => _0x2cd3fd(false), _0x4c4123);
    _0x2cc639.unref?.();
    _0x52364b?.stdout?.on?.("data", _0x34a6f3);
    _0x52364b?.once?.("error", _0x497757);
    _0x52364b?.once?.("exit", _0x122107);
  });
}
export async function prepareWindowsChromeShellTaskbarIdentity({
  browserPath: _0x32f02f,
  profileDir: _0x1692a3,
  platform = process.platform,
  spawnProcess = spawn,
  logEvent = null,
  ..._0x12adb5
} = {}) {
  if (platform !== "win32") {
    return null;
  }
  const _0x4542e0 = buildWindowsChromeShellTaskbarIdentityScript({
    browserPath: _0x32f02f,
    profileDir: _0x1692a3,
    ..._0x12adb5
  });
  if (!_0x4542e0) {
    return null;
  }
  try {
    const _0x5d0a65 = spawnProcess("powershell.exe", ["-NoLogo", "-NoProfile", "-ExecutionPolicy", "Bypass", "-Command", _0x4542e0], {
      stdio: ["pipe", "pipe", "ignore"],
      windowsHide: true,
      detached: true
    });
    const _0x3c2edc = await waitForTaskbarIdentityHelperReady(_0x5d0a65);
    if (!_0x3c2edc) {
      _0x5d0a65?.kill?.();
      logTaskbarIdentityFailure(logEvent, "chrome_shell.taskbar_identity_not_ready", "Windows Chrome shell taskbar identity helper was not ready before launch");
      return null;
    }
    _0x5d0a65?.once?.("exit", (_0x45a8e4, _0x3eb060) => {
      if (_0x45a8e4 === 0) {
        return;
      }
      logTaskbarIdentityFailure(logEvent, "chrome_shell.taskbar_identity_timeout", "Windows Chrome shell taskbar identity was not applied", {
        context: {
          code: _0x45a8e4,
          signal: _0x3eb060
        }
      });
    });
    return {
      helper: _0x5d0a65,
      cancel() {
        _0x5d0a65?.stdin?.end?.();
        _0x5d0a65?.kill?.();
      },
      attach(_0x1c4981) {
        const _0x1d2f7b = readPositiveInteger(_0x1c4981?.pid);
        if (!_0x1d2f7b || typeof _0x5d0a65?.stdin?.write !== "function") {
          this.cancel();
          return false;
        }
        _0x5d0a65.stdin.write(_0x1d2f7b + "\n");
        _0x5d0a65.stdin.end?.();
        _0x5d0a65.unref?.();
        return true;
      }
    };
  } catch (_0x53fea3) {
    logTaskbarIdentityFailure(logEvent, "chrome_shell.taskbar_identity_spawn_error", "Windows Chrome shell taskbar identity helper could not start", {
      error: _0x53fea3
    });
    return null;
  }
}