import { ipcMain } from "electron";
import { registerAppIpcHandlers } from "./appIpc.js";
import { registerCanvasVisualSnapshotIpcHandlers } from "./canvasVisualSnapshotIpc.js";
import { registerClipboardIpcHandlers } from "./clipboardIpc.js";
import { registerCustomAiAppIpcHandlers } from "./customAiAppIpc.js";
import { registerDiagnosticsIpcHandlers } from "./diagnosticsIpc.js";
import { registerFileIpcHandlers } from "./fileIpc.js";
import { registerLocalAssetCleanupIpcHandlers } from "./localAssetCleanupIpc.js";
import { registerMediaTaskIpcHandlers } from "./mediaTaskIpc.js";
import { registerNodeExportIpcHandlers } from "./nodeExportIpc.js";
import { registerProjectIpcHandlers } from "./projectIpc.js";
import { registerScreenshotIpcHandlers } from "./screenshotIpc.js";
import { registerSecureSettingsIpcHandlers } from "./secureSettingsIpc.js";
import { registerWebPreviewIpcHandlers } from "./webPreviewIpc.js";
export function registerIpcHandlers(_0x4bfd92) {
  const _0x57c0b6 = {
    ipcMain: ipcMain,
    ..._0x4bfd92
  };
  registerAppIpcHandlers(_0x57c0b6);
  registerCanvasVisualSnapshotIpcHandlers(_0x57c0b6);
  registerCustomAiAppIpcHandlers(_0x57c0b6);
  registerSecureSettingsIpcHandlers(_0x57c0b6);
  registerClipboardIpcHandlers(_0x57c0b6);
  registerScreenshotIpcHandlers(_0x57c0b6);
  registerProjectIpcHandlers(_0x57c0b6);
  registerFileIpcHandlers(_0x57c0b6);
  registerNodeExportIpcHandlers(_0x57c0b6);
  registerMediaTaskIpcHandlers(_0x57c0b6);
  registerLocalAssetCleanupIpcHandlers(_0x57c0b6);
  registerDiagnosticsIpcHandlers(_0x57c0b6);
  registerWebPreviewIpcHandlers(_0x57c0b6);
}