"use strict";
/**
 * 主进程侧：把 serpent-sidebar-inject.js 注入 YUH main renderer。
 * 注入时机：mainWindow webContents 'did-finish-load'（首屏完成）后。
 * 注入脚本运行于页面主世界（window.h3 由 preload contextBridge 暴露）。
 */
const path = require("node:path");
const fs = require("node:fs");

let cachedScript = null;

function getScript() {
  if (cachedScript) return cachedScript;
  cachedScript = fs.readFileSync(
    path.join(__dirname, "serpent-sidebar-inject.js"),
    "utf8",
  );
  return cachedScript;
}

function inject(webContents) {
  if (!webContents || webContents.isDestroyed()) return;
  webContents
    .executeJavaScript(getScript(), true)
    .catch((error) =>
      console.error("[serpent-sidebar] inject failed:", error),
    );
  // 诊断：2.5s 后检查入口按钮是否已出现（React 首屏渲染通常 < 2s）。
  setTimeout(() => {
    if (webContents.isDestroyed()) return;
    webContents
      .executeJavaScript(
        "Boolean(document.querySelector('aside.left-rail nav .yuh-serpent-entry'))",
        true,
      )
      .then((ok) =>
        console.log(
          ok
            ? "[serpent-sidebar] entry button present"
            : "[serpent-sidebar] entry button MISSING",
        ),
      )
      .catch(() => {});
  }, 2500);
}

module.exports = { inject };
