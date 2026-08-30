export const CHROME_DOWNLOAD_URL = "https://www.google.com/chrome/";
async function openChromeDownload(_0x314d23) {
  try {
    await _0x314d23?.openExternal?.(CHROME_DOWNLOAD_URL);
  } catch {}
}
export async function promptForMissingChromeShellBrowser({
  dialogApi: _0x3a64ed,
  shellApi: _0x3cca3b,
  appName = "SHUO Canvas"
} = {}) {
  if (typeof _0x3a64ed?.showMessageBox !== "function") {
    return "quit";
  }
  try {
    const _0x672f90 = await _0x3a64ed.showMessageBox({
      type: "warning",
      title: appName + " 需要 Chrome 或 Edge",
      message: "未检测到 Google Chrome 或 Microsoft Edge",
      detail: ["可下载安装 Chrome，或暂时使用 Electron 兼容模式启动画布。", "兼容模式下部分功能可能无法使用，包括部分视频截帧和关键帧功能。"].join("\n"),
      buttons: ["下载 Chrome", "使用 Electron 兼容模式", "退出"],
      defaultId: 0,
      cancelId: 2,
      noLink: true
    });
    if (Number(_0x672f90?.response) === 0) {
      await openChromeDownload(_0x3cca3b);
      return "download";
    }
    if (Number(_0x672f90?.response) === 1) {
      return "electron";
    } else {
      return "quit";
    }
  } catch {
    return "quit";
  }
}
export async function promptForChromeShellStartupFailure({
  dialogApi: _0x241b40,
  shellApi: _0x262051,
  appName = "SHUO Canvas",
  error: _0x4cfc40
} = {}) {
  if (typeof _0x241b40?.showMessageBox !== "function") {
    return "quit";
  }
  try {
    const _0xbc805a = await _0x241b40.showMessageBox({
      type: "error",
      title: appName + " 浏览器窗口启动失败",
      message: "Chrome / Edge 应用窗口未能启动",
      detail: [String(_0x4cfc40?.message || _0x4cfc40 || "未知错误"), "", "可以改用 Electron 兼容模式继续工作。", "兼容模式下部分功能可能无法使用，包括部分视频截帧和关键帧功能。"].join("\n"),
      buttons: ["使用 Electron 兼容模式", "下载 Chrome", "退出"],
      defaultId: 2,
      cancelId: 2,
      noLink: true
    });
    if (Number(_0xbc805a?.response) === 1) {
      await openChromeDownload(_0x262051);
      return "download";
    }
    if (Number(_0xbc805a?.response) === 0) {
      return "electron";
    } else {
      return "quit";
    }
  } catch {
    return "quit";
  }
}