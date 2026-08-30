const fs = require("node:fs");
const path = require("node:path");

const localRuntimeSource = path.resolve(__dirname, ".electron-runtime", "runtime");
const installedRuntime = "D:\\Program_Files\\SHUO Canvas\\resources\\runtime";
const runtimeSource = path.resolve(
  process.env.AIC_RUNTIME_SOURCE ||
    (fs.existsSync(path.join(localRuntimeSource, "backend", "aicanvas-backend.exe"))
      ? localRuntimeSource
      : installedRuntime)
);

if (!fs.existsSync(path.join(runtimeSource, "backend", "aicanvas-backend.exe"))) {
  throw new Error(`未找到 SHUO Canvas 运行时：${runtimeSource}`);
}

module.exports = {
  appId: "com.ashuo.shuocanvas.recovered",
  productName: "SHUO Canvas Recovered",
  electronVersion: "43.4.0",
  electronDist: path.resolve(__dirname, ".electron-shell"),
  artifactName: "SHUO-Canvas-Recovered-${version}-${arch}.${ext}",
  asar: false,
  directories: {
    buildResources: "build",
    output: "../dist"
  },
  files: ["**/*", "!node_modules/.cache/**", "!.electron-runtime/**", "!.electron-shell/**"],
  extraResources: [{ from: runtimeSource, to: "runtime" }],
  win: {
    executableName: "SHUO Canvas Recovered",
    icon: "build/app-icon.ico",
    signAndEditExecutable: false,
    target: ["nsis"]
  },
  nsis: {
    oneClick: false,
    allowToChangeInstallationDirectory: true,
    createDesktopShortcut: true,
    createStartMenuShortcut: true,
    shortcutName: "SHUO Canvas Recovered"
  }
};
