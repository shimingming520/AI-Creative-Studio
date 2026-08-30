import { BrowserWindow, screen } from "electron";
import { createForegroundDialogPresenterCore } from "./dialogPresenterCore.js";
export function createForegroundDialogPresenter(_0x39decf = {}) {
  return createForegroundDialogPresenterCore({
    ..._0x39decf,
    BrowserWindowClass: BrowserWindow,
    screenApi: screen
  });
}