import { mkdirSync } from "node:fs";
import a232_0x2e8e00 from "electron";
import { openShellFolder, revealShellItemInFolder } from "../shellItemRevealer.js";
const {
  shell = {}
} = typeof a232_0x2e8e00 === "object" && a232_0x2e8e00 ? a232_0x2e8e00 : {};
function isDragImportProfilingEnabled() {
  return /^(1|true|yes|on)$/i.test(String(process.env.AIC_DRAG_IMPORT_PROFILING || "").trim());
}
function logDragImportProfile(_0x1c64e, _0x35465c = {}) {
  if (!isDragImportProfilingEnabled()) {
    return;
  }
  console.log("[drag-import-prof] " + _0x1c64e, _0x35465c);
}
export function registerFileIpcHandlers({
  ipcMain: _0x3aecd2,
  importAssetToLibrary: _0x13d4a1,
  importRemoteAssetToLibrary: _0x2d6758,
  createLocalPreviewUrl: _0xdb2253,
  resolveLocalVirtualPath: _0x8f8e3a,
  resolveKnownFolder: _0x11d8ad,
  openExternalUrl: _0x5aa1d4,
  selectDirectory: _0x43132c,
  listNotificationSoundMp3Files: _0x3eb13e,
  listSystemNotificationSoundFiles: _0x23b765,
  openSystemNotificationSoundFolder: _0x299a29,
  playNotificationSound: _0x2f8818,
  logDiagnosticEvent: _0x2ef30d,
  revealItemInFolder = _0x1818c5 => revealShellItemInFolder(_0x1818c5, {
    shellApi: shell,
    logEvent: _0x2ef30d
  }),
  openFolder = _0x155204 => openShellFolder(_0x155204, {
    shellApi: shell,
    logEvent: _0x2ef30d
  })
}) {
  _0x3aecd2.handle("asset:import", async (_0xf26dff, _0x17ec24) => {
    return await _0x13d4a1(_0x17ec24 || {});
  });
  _0x3aecd2.handle("asset:importRemote", async (_0xb53d13, _0xb7d4bd) => {
    if (typeof _0x2d6758 !== "function") {
      throw new Error("当前环境不支持远程素材导入");
    }
    return await _0x2d6758(_0xb7d4bd || {});
  });
  _0x3aecd2.handle("file:importLocalFile", async (_0x4bf160, _0x3913d0) => {
    return await _0x13d4a1(_0x3913d0 || {});
  });
  _0x3aecd2.handle("file:getLocalPreviewUrl", (_0x4d670f, _0x26b0b8) => {
    const _0x3f98ba = _0xdb2253(_0x26b0b8 || {});
    logDragImportProfile("main:preview-url:created", {
      t: Date.now(),
      name: _0x26b0b8?.name || "",
      url: _0x3f98ba
    });
    return {
      url: _0x3f98ba
    };
  });
  _0x3aecd2.handle("dialog:selectDirectory", async (_0x5e3553, _0x4300da) => {
    if (typeof _0x43132c !== "function") {
      throw new Error("当前环境不支持选择目录");
    }
    return await _0x43132c(_0x4300da || {});
  });
  _0x3aecd2.handle("notificationSound:listMp3Files", async (_0x12f342, _0x1f078f) => {
    if (typeof _0x3eb13e !== "function") {
      throw new Error("当前环境不支持读取提示音目录");
    }
    return await _0x3eb13e(_0x1f078f || {});
  });
  _0x3aecd2.handle("notificationSound:listSystemSounds", async () => {
    if (typeof _0x23b765 !== "function") {
      throw new Error("当前环境不支持读取系统提示音目录");
    }
    return await _0x23b765();
  });
  _0x3aecd2.handle("notificationSound:openSystemSoundFolder", async () => {
    if (typeof _0x299a29 !== "function") {
      throw new Error("当前环境不支持打开系统提示音目录");
    }
    return await _0x299a29();
  });
  _0x3aecd2.handle("notificationSound:play", async (_0x151912, _0x283995) => {
    if (typeof _0x2f8818 !== "function") {
      throw new Error("当前环境不支持播放提示音");
    }
    return await _0x2f8818(_0x283995 || {});
  });
  _0x3aecd2.handle("shell:showItemInFolder", (_0x4a11a3, _0x28f581) => {
    const _0xfbb487 = _0x8f8e3a(_0x28f581?.localPath || "");
    if (!_0xfbb487) {
      throw new Error("不允许定位该路径");
    }
    revealItemInFolder(_0xfbb487);
    return {
      ok: true
    };
  });
  _0x3aecd2.handle("shell:openKnownFolder", (_0x21da28, _0x4ecdbb) => {
    const _0x5d61e5 = _0x11d8ad(_0x4ecdbb?.kind || "");
    if (!_0x5d61e5) {
      throw new Error("不允许打开该目录");
    }
    mkdirSync(_0x5d61e5, {
      recursive: true
    });
    openFolder(_0x5d61e5);
    return {
      ok: true
    };
  });
  _0x3aecd2.handle("shell:openExternal", (_0x384174, _0x4a7a53) => {
    const _0x5e5312 = _0x5aa1d4(_0x4a7a53?.url || _0x4a7a53);
    if (!_0x5e5312.ok) {
      throw new Error(_0x5e5312.error || "不允许打开该外部链接");
    }
    return _0x5e5312;
  });
}