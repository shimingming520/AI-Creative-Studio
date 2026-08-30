import { BrowserWindow, desktopCapturer, globalShortcut, screen } from "electron";
import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import a275_0xe56974 from "node:path";
export function createScreenshotOverlayController({
  appRoot: _0x162dcd,
  dirname: _0x34995c,
  accelerator: _0x471646,
  getMainWindow: _0x5f0232,
  logDiagnosticEvent: _0x48a384
}) {
  function _0x5d264c(_0x18719f) {
    const _0x39b9f2 = String(_0x18719f || "").trim();
    if (!_0x39b9f2) {
      return "";
    }
    const _0x51f9c1 = _0x39b9f2.toLowerCase();
    if (_0x51f9c1 === "ctrl" || _0x51f9c1 === "control" || _0x51f9c1 === "cmdorctrl" || _0x51f9c1 === "commandorcontrol" || _0x51f9c1 === "commandorctrl") {
      return "CommandOrControl";
    }
    if (_0x51f9c1 === "shift") {
      return "Shift";
    }
    if (_0x51f9c1 === "alt" || _0x51f9c1 === "option") {
      return "Alt";
    }
    if (_0x51f9c1 === "space") {
      return "Space";
    }
    if (_0x51f9c1 === "backquote" || _0x39b9f2 === "`" || _0x39b9f2 === "~") {
      return "`";
    }
    if (/^f([1-9]|1[0-9]|2[0-4])$/i.test(_0x39b9f2)) {
      return _0x39b9f2.toUpperCase();
    }
    if (/^[a-z]$/i.test(_0x39b9f2)) {
      return _0x39b9f2.toUpperCase();
    }
    if (/^[0-9]$/.test(_0x39b9f2)) {
      return _0x39b9f2;
    }
    const _0x109691 = new Map([["enter", "Enter"], ["return", "Enter"], ["tab", "Tab"], ["escape", "Escape"], ["esc", "Escape"], ["backspace", "Backspace"], ["delete", "Delete"], ["del", "Delete"], ["insert", "Insert"], ["ins", "Insert"], ["home", "Home"], ["end", "End"], ["pageup", "PageUp"], ["pagedown", "PageDown"], ["up", "Up"], ["down", "Down"], ["left", "Left"], ["right", "Right"], ["+", "Plus"], ["=", "Plus"], ["-", "Minus"], [",", "Comma"], [".", "Period"], ["/", "Slash"], ["\\", "Backslash"], [";", "Semicolon"], ["'", "Quote"], ["[", "BracketLeft"], ["]", "BracketRight"]]);
    return _0x109691.get(_0x51f9c1) || "";
  }
  function _0x2f7b05(_0x4b1b74) {
    const _0x1cda19 = (Array.isArray(_0x4b1b74) ? _0x4b1b74 : []).map(_0x1ee18e => _0x5d264c(_0x1ee18e)).filter(Boolean);
    const _0x563e89 = [];
    if (_0x1cda19.includes("CommandOrControl")) {
      _0x563e89.push("CommandOrControl");
    }
    if (_0x1cda19.includes("Shift")) {
      _0x563e89.push("Shift");
    }
    if (_0x1cda19.includes("Alt")) {
      _0x563e89.push("Alt");
    }
    const _0x5bc65f = _0x1cda19.filter(_0x5c4432 => _0x5c4432 !== "CommandOrControl" && _0x5c4432 !== "Shift" && _0x5c4432 !== "Alt");
    if (_0x5bc65f.length !== 1) {
      return null;
    }
    return [..._0x563e89, _0x5bc65f[0]];
  }
  function _0x4d3fd0(_0x8313b2 = {}) {
    const _0x16781c = Array.isArray(_0x8313b2?.keys) ? _0x8313b2.keys : typeof _0x8313b2?.accelerator === "string" ? _0x8313b2.accelerator.split("+") : [];
    const _0x51cdb8 = _0x2f7b05(_0x16781c);
    if (!_0x51cdb8) {
      return {
        ok: false,
        reason: "invalid-shortcut"
      };
    }
    return {
      ok: true,
      accelerator: _0x51cdb8.join("+"),
      keys: _0x51cdb8
    };
  }
  const _0x42ee55 = _0x4d3fd0({
    accelerator: _0x471646 || "Alt+Q"
  });
  const _0x42cba2 = _0x42ee55.ok ? _0x42ee55.accelerator : "Alt+Q";
  let _0xb5b98c = _0x42cba2;
  let _0x5aa63f = null;
  let _0x32e436 = null;
  let _0x2074d5 = null;
  let _0x10d68f = "";
  let _0x2ce6e4 = false;
  let _0x5c1925 = "";
  let _0x5b17f7 = null;
  const _0x2521d3 = [];
  let _0x31e44f = {
    ok: false,
    registered: false,
    accelerator: _0xb5b98c,
    reason: "not-registered"
  };
  function _0x23eeb2(_0x566ebf, _0x595b4e, _0x517368 = 20) {
    _0x566ebf.push(_0x595b4e);
    while (_0x566ebf.length > _0x517368) {
      _0x566ebf.shift();
    }
  }
  function _0x2b11fd(_0x102665, _0x256fd8, _0x526e9f) {
    const _0x56d1dc = Number(_0x102665);
    if (!Number.isFinite(_0x56d1dc)) {
      return _0x256fd8;
    }
    return Math.min(_0x526e9f, Math.max(_0x256fd8, _0x56d1dc));
  }
  async function _0x5d3e0c() {
    const _0x39668a = screen.getCursorScreenPoint();
    const _0x7348d2 = screen.getDisplayNearestPoint(_0x39668a);
    const _0x2a5e85 = Number(_0x7348d2?.scaleFactor || 1) || 1;
    const _0x548d2f = _0x7348d2?.bounds || {
      x: 0,
      y: 0,
      width: 0,
      height: 0
    };
    const _0x1be5c0 = {
      width: Math.max(1, Math.round(Number(_0x548d2f.width || 1) * _0x2a5e85)),
      height: Math.max(1, Math.round(Number(_0x548d2f.height || 1) * _0x2a5e85))
    };
    const _0x186497 = await desktopCapturer.getSources({
      types: ["screen"],
      thumbnailSize: _0x1be5c0
    });
    const _0x5b52ed = _0x186497.find(_0xef75e9 => String(_0xef75e9.display_id || "") === String(_0x7348d2.id)) || _0x186497[0];
    const _0x301259 = _0x5b52ed?.thumbnail;
    if (!_0x301259 || _0x301259.isEmpty()) {
      return {
        ok: false,
        reason: "no-image"
      };
    }
    return {
      ok: true,
      mimeType: "image/png",
      dataUrl: _0x301259.toDataURL(),
      display: {
        id: String(_0x7348d2.id),
        scaleFactor: _0x2a5e85,
        bounds: {
          x: _0x548d2f.x,
          y: _0x548d2f.y,
          width: _0x548d2f.width,
          height: _0x548d2f.height
        },
        imageSize: _0x301259.getSize()
      },
      cursor: {
        screenX: Math.round(_0x39668a.x),
        screenY: Math.round(_0x39668a.y),
        x: Math.round(_0x2b11fd(_0x39668a.x - _0x548d2f.x, 0, Math.max(0, _0x548d2f.width))),
        y: Math.round(_0x2b11fd(_0x39668a.y - _0x548d2f.y, 0, Math.max(0, _0x548d2f.height)))
      }
    };
  }
  function _0x73f802(_0x32afe1 = _0x31e44f) {
    const _0xb8d117 = _0x5f0232();
    if (!_0xb8d117 || _0xb8d117.isDestroyed()) {
      return;
    }
    if (_0xb8d117.webContents.isDestroyed()) {
      return;
    }
    _0xb8d117.webContents.send("screenshot:globalShortcutStatus", {
      accelerator: _0xb5b98c,
      ..._0x32afe1
    });
  }
  function _0x3e3d5c(_0x2fd728 = {}) {
    _0x31e44f = {
      accelerator: _0xb5b98c,
      ..._0x31e44f,
      ..._0x2fd728,
      accelerator: _0xb5b98c
    };
    _0x73f802();
  }
  function _0x43282e() {
    if (!_0x5aa63f || _0x5aa63f.isDestroyed()) {
      return;
    }
    _0x5aa63f.webContents.executeJavaScript("window.__resetScreenshotOverlay?.()");
    _0x5aa63f.setOpacity(1);
    _0x5aa63f.setAlwaysOnTop(false);
    _0x5aa63f.hide();
  }
  function _0x2d9540() {
    _0x32e436 = null;
    if (!_0x5aa63f || _0x5aa63f.isDestroyed()) {
      return;
    }
    _0x5aa63f.destroy();
  }
  function _0x506cd7(_0x123e97 = {}) {
    const _0x56f6bc = _0x123e97?.display?.bounds;
    if (_0x56f6bc && _0x56f6bc.width > 0 && _0x56f6bc.height > 0) {
      return {
        x: Math.round(_0x56f6bc.x),
        y: Math.round(_0x56f6bc.y),
        width: Math.round(_0x56f6bc.width),
        height: Math.round(_0x56f6bc.height)
      };
    }
    const _0x132473 = screen.getDisplayNearestPoint(screen.getCursorScreenPoint())?.bounds;
    return _0x132473 || {
      x: 0,
      y: 0,
      width: 1280,
      height: 720
    };
  }
  function _0x3a901b() {
    return {
      x: -32000,
      y: -32000,
      width: 1,
      height: 1
    };
  }
  async function _0x58920b(_0x356543 = null) {
    if (_0x5aa63f && !_0x5aa63f.isDestroyed()) {
      if (_0x32e436) {
        await _0x32e436;
      }
      return _0x5aa63f;
    }
    const _0x156cc8 = _0x356543 ? _0x506cd7(_0x356543) : _0x3a901b();
    _0x5aa63f = new BrowserWindow({
      ..._0x156cc8,
      title: "Screenshot Overlay",
      show: false,
      frame: false,
      transparent: true,
      paintWhenInitiallyHidden: true,
      fullscreen: false,
      fullscreenable: false,
      alwaysOnTop: false,
      skipTaskbar: true,
      resizable: false,
      movable: false,
      minimizable: false,
      maximizable: false,
      backgroundColor: "#00000000",
      webPreferences: {
        preload: a275_0xe56974.join(_0x34995c, "screenshotOverlayPreload.cjs"),
        contextIsolation: true,
        nodeIntegration: false,
        sandbox: true
      }
    });
    _0x5aa63f.on("closed", () => {
      _0x5aa63f = null;
      _0x32e436 = null;
    });
    _0x32e436 = _0x5aa63f.loadFile(a275_0xe56974.join(_0x34995c, "screenshotOverlay.html")).catch(_0x5595f9 => {
      _0x32e436 = null;
      throw _0x5595f9;
    });
    await _0x32e436;
    return _0x5aa63f;
  }
  function _0x182618() {
    if (_0x5b17f7) {
      return _0x5b17f7;
    }
    _0x5b17f7 = _0x58920b().catch(_0x1efdc3 => {
      _0x48a384({
        type: "screenshot.global_overlay_prewarm_failed",
        level: "warn",
        source: "main",
        message: "Global screenshot overlay prewarm failed",
        error: _0x1efdc3
      });
    }).finally(() => {
      _0x5b17f7 = null;
    });
    return _0x5b17f7;
  }
  async function _0x47708d(_0x547259) {
    const _0x30c0e2 = await _0x58920b();
    if (!_0x30c0e2 || _0x30c0e2.isDestroyed()) {
      return false;
    }
    _0x30c0e2.setOpacity(1);
    _0x30c0e2.setBounds(_0x547259 || _0x506cd7());
    await _0x30c0e2.webContents.executeJavaScript("window.__prepareScreenshotOverlay ? window.__prepareScreenshotOverlay() : window.__resetScreenshotOverlay?.()");
    _0x30c0e2.setAlwaysOnTop(true, "screen-saver");
    _0x30c0e2.setVisibleOnAllWorkspaces(true, {
      visibleOnFullScreen: true
    });
    _0x30c0e2.show();
    _0x30c0e2.focus();
    return true;
  }
  async function _0x46afbc(_0x21929b) {
    if (!_0x5aa63f || _0x5aa63f.isDestroyed()) {
      return false;
    }
    const _0x5f221f = await _0x5aa63f.webContents.executeJavaScript("window.__startScreenshotOverlay(" + JSON.stringify(_0x21929b) + ")");
    if (!_0x5f221f) {
      return false;
    }
    return true;
  }
  async function _0x59bd90() {
    if (_0x5aa63f && !_0x5aa63f.isDestroyed() && _0x5aa63f.isVisible()) {
      _0x5aa63f.show();
      _0x5aa63f.focus();
      return;
    }
    try {
      const _0x59c827 = _0x506cd7();
      const _0x103ee3 = await _0x47708d(_0x59c827);
      if (!_0x103ee3) {
        _0x3e3d5c({
          ok: false,
          registered: _0x31e44f.registered === true,
          reason: "overlay-start-failed"
        });
        return;
      }
      const _0x37e75b = await _0x5d3e0c();
      if (!_0x37e75b?.ok) {
        _0x43282e();
        _0x3e3d5c({
          ok: false,
          registered: _0x31e44f.registered === true,
          reason: _0x37e75b?.reason || "capture-failed"
        });
        _0x48a384({
          type: "screenshot.global_capture_failed",
          level: "warn",
          source: "main",
          message: "Global screenshot capture failed",
          context: _0x37e75b || {}
        });
        return;
      }
      const _0xf238f5 = await _0x46afbc(_0x37e75b);
      if (!_0xf238f5) {
        _0x43282e();
        _0x3e3d5c({
          ok: false,
          registered: _0x31e44f.registered === true,
          reason: "overlay-start-failed"
        });
        _0x48a384({
          type: "screenshot.global_overlay_start_failed",
          level: "warn",
          source: "main",
          message: "Global screenshot overlay failed to start",
          context: {
            display: _0x37e75b.display,
            cursor: _0x37e75b.cursor
          }
        });
      }
    } catch (_0x399e1e) {
      _0x43282e();
      _0x3e3d5c({
        ok: false,
        registered: _0x31e44f.registered === true,
        reason: "capture-failed",
        error: String(_0x399e1e?.message || _0x399e1e)
      });
      _0x48a384({
        type: "screenshot.global_overlay_failed",
        level: "error",
        source: "main",
        message: "Global screenshot overlay failed",
        error: _0x399e1e
      });
    }
  }
  function _0x11fad9() {
    if (_0x2ce6e4 && _0x5c1925 === _0xb5b98c) {
      return;
    }
    _0x5c0691();
    let _0x8945ad = false;
    try {
      _0x8945ad = globalShortcut.register(_0xb5b98c, () => {
        _0x59bd90();
      });
    } catch (_0x525c0a) {
      _0x48a384({
        type: "screenshot.global_shortcut_register_failed",
        level: "error",
        source: "main",
        message: "Global screenshot shortcut registration threw",
        error: _0x525c0a
      });
    }
    _0x2ce6e4 = _0x8945ad;
    _0x5c1925 = _0x8945ad ? _0xb5b98c : "";
    _0x3e3d5c({
      ok: _0x8945ad,
      registered: _0x8945ad,
      reason: _0x8945ad ? "registered" : "registration-failed"
    });
    if (_0x8945ad) {
      _0x182618();
    }
    _0x48a384({
      type: _0x8945ad ? "screenshot.global_shortcut_registered" : "screenshot.global_shortcut_register_failed",
      level: _0x8945ad ? "info" : "warn",
      source: "main",
      message: _0x8945ad ? "Global screenshot shortcut registered" : "Global screenshot shortcut registration failed",
      context: {
        accelerator: _0xb5b98c
      }
    });
  }
  function _0x3b5380() {
    if (_0x46f1e1() && _0x5725af()) {
      _0x3e3d5c({
        ok: false,
        registered: false,
        reason: "native-helper-starting"
      });
      return;
    }
    _0x11fad9();
  }
  function _0x5c0691() {
    if (!_0x2ce6e4 && !_0x5c1925) {
      return;
    }
    try {
      globalShortcut.unregister(_0x5c1925 || _0xb5b98c);
    } catch {}
    _0x2ce6e4 = false;
    _0x5c1925 = "";
  }
  function _0x1b9873() {
    _0x3e1c2f();
    _0x5c0691();
  }
  function _0xf95843(_0x48d378 = {}) {
    const _0x1aaa5a = _0x4d3fd0(_0x48d378);
    if (!_0x1aaa5a.ok) {
      _0x3e3d5c({
        ok: false,
        registered: _0x31e44f.registered === true,
        reason: _0x1aaa5a.reason || "invalid-shortcut"
      });
      return {
        ok: false,
        registered: _0x31e44f.registered === true,
        accelerator: _0xb5b98c,
        reason: _0x1aaa5a.reason || "invalid-shortcut"
      };
    }
    if (_0x1aaa5a.accelerator === _0xb5b98c) {
      _0x73f802();
      return {
        ..._0x31e44f,
        ok: _0x31e44f.ok === true,
        accelerator: _0xb5b98c
      };
    }
    _0x1b9873();
    _0xb5b98c = _0x1aaa5a.accelerator;
    _0x31e44f = {
      ok: false,
      registered: false,
      accelerator: _0xb5b98c,
      reason: "not-registered"
    };
    _0x3b5380();
    return {
      ..._0x31e44f,
      accelerator: _0xb5b98c
    };
  }
  async function _0x5a2927(_0x38780e = {}) {
    const _0x11f2f8 = String(_0x38780e?.pngBase64 || "").trim();
    if (!_0x11f2f8) {
      return {
        ok: false,
        reason: "empty-payload"
      };
    }
    _0x43282e();
    _0x3013d1({
      pngBase64: _0x11f2f8,
      mimeType: String(_0x38780e?.mimeType || "image/png") || "image/png",
      source: "globalShortcut"
    });
    return {
      ok: true
    };
  }
  async function _0xd879f2() {
    _0x43282e();
    return {
      ok: true
    };
  }
  function _0x2643ec() {
    return a275_0xe56974.join(_0x162dcd, "native", "screenshot-helper", "bin", "screenshot-helper.exe");
  }
  function _0x221390() {
    return a275_0xe56974.join(_0x162dcd, "images", "cursors", "windows11-concept-v2", "light");
  }
  function _0x46f1e1() {
    return true;
  }
  function _0x3013d1(_0x22ae16 = {}) {
    const _0x567595 = String(_0x22ae16?.pngBase64 || "").trim();
    if (!_0x567595) {
      return false;
    }
    const _0x7b26d8 = {
      pngBase64: _0x567595,
      mimeType: String(_0x22ae16?.mimeType || "image/png") || "image/png",
      source: _0x22ae16?.source || "nativeHelper",
      createdAt: Date.now()
    };
    _0x23eeb2(_0x2521d3, _0x7b26d8, 8);
    const _0x4991f2 = _0x5f0232();
    if (_0x4991f2 && !_0x4991f2.isDestroyed() && !_0x4991f2.webContents.isDestroyed()) {
      _0x4991f2.webContents.send("screenshot:globalCaptureReady", _0x7b26d8);
    }
    return true;
  }
  function _0x350990() {
    return _0x2521d3.splice(0, _0x2521d3.length);
  }
  function _0x4687e8() {
    return {
      ..._0x31e44f,
      accelerator: _0xb5b98c
    };
  }
  function _0x58a080(_0x4118d8) {
    if (!_0x46f1e1()) {
      return;
    }
    const _0x326d94 = String(_0x4118d8 || "").trim();
    if (!_0x326d94) {
      return;
    }
    let _0x5dbcc4 = null;
    try {
      _0x5dbcc4 = JSON.parse(_0x326d94);
    } catch (_0x9adbbf) {
      _0x48a384({
        type: "screenshot.native_helper_bad_message",
        level: "warn",
        source: "main",
        message: "Native screenshot helper sent an invalid message",
        context: {
          raw: _0x326d94.slice(0, 160)
        },
        error: _0x9adbbf
      });
      return;
    }
    if (_0x5dbcc4?.type === "status") {
      const _0x512a66 = _0x5dbcc4.registered === true;
      _0x3e3d5c({
        ok: _0x512a66,
        registered: _0x512a66,
        reason: _0x512a66 ? "registered-native" : "native-registration-failed"
      });
      if (!_0x512a66) {
        _0x3e1c2f();
        _0x11fad9();
      }
      return;
    }
    if (_0x5dbcc4?.type === "capture") {
      _0x3013d1({
        pngBase64: _0x5dbcc4.pngBase64,
        mimeType: _0x5dbcc4.mimeType || "image/png",
        source: "nativeHelper"
      });
    }
  }
  function _0x5725af() {
    if (process.platform !== "win32") {
      return false;
    }
    if (_0x2074d5 && !_0x2074d5.killed) {
      return true;
    }
    const _0x2c1fa9 = _0x2643ec();
    if (!existsSync(_0x2c1fa9)) {
      _0x48a384({
        type: "screenshot.native_helper_missing",
        level: "warn",
        source: "main",
        message: "Native screenshot helper executable is missing",
        context: {
          helperPath: _0x2c1fa9
        }
      });
      return false;
    }
    try {
      _0x10d68f = "";
      _0x2074d5 = spawn(_0x2c1fa9, [], {
        env: {
          ...process.env,
          AICANVAS_CURSOR_DIR: _0x221390(),
          AICANVAS_SCREENSHOT_ACCELERATOR: _0xb5b98c
        },
        stdio: ["ignore", "pipe", "pipe"],
        windowsHide: true
      });
    } catch (_0xecdfaa) {
      _0x48a384({
        type: "screenshot.native_helper_start_failed",
        level: "error",
        source: "main",
        message: "Native screenshot helper failed to start",
        error: _0xecdfaa,
        context: {
          helperPath: _0x2c1fa9
        }
      });
      _0x2074d5 = null;
      return false;
    }
    _0x2074d5.stdout?.setEncoding("utf8");
    _0x2074d5.stdout?.on("data", _0xb8a5d2 => {
      _0x10d68f += String(_0xb8a5d2 || "");
      let _0x29819c = _0x10d68f.indexOf("\n");
      while (_0x29819c >= 0) {
        const _0x5a29df = _0x10d68f.slice(0, _0x29819c);
        _0x10d68f = _0x10d68f.slice(_0x29819c + 1);
        _0x58a080(_0x5a29df);
        _0x29819c = _0x10d68f.indexOf("\n");
      }
    });
    _0x2074d5.stderr?.setEncoding("utf8");
    _0x2074d5.stderr?.on("data", _0x2f0b67 => {
      _0x48a384({
        type: "screenshot.native_helper_stderr",
        level: "warn",
        source: "main",
        message: "Native screenshot helper stderr",
        context: {
          text: String(_0x2f0b67 || "").slice(0, 1000)
        }
      });
    });
    _0x2074d5.on("exit", (_0x9104ad, _0x31f376) => {
      _0x2074d5 = null;
      _0x10d68f = "";
      if (_0x46f1e1()) {
        _0x3e3d5c({
          ok: false,
          registered: false,
          reason: "native-helper-exited"
        });
      }
      _0x48a384({
        type: "screenshot.native_helper_exited",
        level: _0x9104ad === 0 ? "info" : "warn",
        source: "main",
        message: "Native screenshot helper exited",
        context: {
          code: _0x9104ad,
          signal: _0x31f376
        }
      });
    });
    _0x2074d5.on("error", _0x3412bc => {
      _0x2074d5 = null;
      if (_0x46f1e1()) {
        _0x3e3d5c({
          ok: false,
          registered: false,
          reason: "native-helper-error",
          error: String(_0x3412bc?.message || _0x3412bc)
        });
      }
    });
    return true;
  }
  function _0x3e1c2f() {
    if (!_0x2074d5 || _0x2074d5.killed) {
      return;
    }
    try {
      _0x2074d5.kill();
    } catch {} finally {
      _0x2074d5 = null;
      _0x10d68f = "";
    }
  }
  return {
    captureDesktopDisplay: _0x5d3e0c,
    configureGlobalScreenshotShortcut: _0xf95843,
    consumeGlobalScreenshotCaptureEvents: _0x350990,
    destroyScreenshotOverlayWindow: _0x2d9540,
    getGlobalScreenshotShortcutStatus: _0x4687e8,
    handleScreenshotOverlayCancel: _0xd879f2,
    handleScreenshotOverlayConfirm: _0x5a2927,
    installGlobalScreenshotShortcut: _0x3b5380,
    sendGlobalScreenshotShortcutStatus: _0x73f802,
    uninstallGlobalScreenshotShortcut: _0x1b9873
  };
}