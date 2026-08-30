import { randomUUID } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import a215_0x3a54a4 from "node:path";
const DEVICE_IDENTITY_FILENAME = "device-identity.json";
function readJsonFileSyncSafe(_0x5e39f8) {
  try {
    return JSON.parse(readFileSync(_0x5e39f8, "utf8").replace(/^\uFEFF/, ""));
  } catch {
    return {};
  }
}
function writeJsonFileSyncSafe(_0x3696c9, _0x4b995e) {
  const _0x54b285 = a215_0x3a54a4.dirname(_0x3696c9);
  if (_0x54b285) {
    mkdirSync(_0x54b285, {
      recursive: true
    });
  }
  writeFileSync(_0x3696c9, JSON.stringify(_0x4b995e || {}, null, 2), "utf8");
}
function normalizeDeviceIdentityValue(_0x534dc1) {
  const _0x1df5a4 = String(_0x534dc1 || "").trim();
  if (!_0x1df5a4 || _0x1df5a4.length > 256) {
    return "";
  }
  if (/^[A-Za-z0-9._:-]+$/.test(_0x1df5a4)) {
    return _0x1df5a4;
  } else {
    return "";
  }
}
function readDeviceIdFromFile(_0x501f92) {
  const _0x3dff62 = readJsonFileSyncSafe(_0x501f92);
  return normalizeDeviceIdentityValue(_0x3dff62.deviceId || _0x3dff62.device_id);
}
function readInstallIdFromFile(_0x47187e) {
  const _0x24a6d9 = readJsonFileSyncSafe(_0x47187e);
  return normalizeDeviceIdentityValue(_0x24a6d9.installId || _0x24a6d9.install_id);
}
export function createDeviceIdentityManager({
  app: _0x1ab722,
  appRoot: _0x101d2a,
  getUserRoot: _0x46c385,
  logEvent = () => {}
}) {
  function _0x2dddc4() {
    const _0x2f27d7 = "AI-CanvasPro";
    if (process.platform === "win32") {
      const _0x5c2476 = process.env.LOCALAPPDATA || process.env.APPDATA || _0x1ab722.getPath("userData");
      return a215_0x3a54a4.join(_0x5c2476, _0x2f27d7);
    }
    if (process.platform === "darwin") {
      return a215_0x3a54a4.join(_0x1ab722.getPath("appData"), _0x2f27d7);
    }
    const _0x279174 = process.env.XDG_STATE_HOME || a215_0x3a54a4.join(_0x1ab722.getPath("home"), ".local", "state");
    return a215_0x3a54a4.join(_0x279174, _0x2f27d7);
  }
  function _0x11e9c9() {
    return [a215_0x3a54a4.join(_0x1ab722.getPath("userData"), DEVICE_IDENTITY_FILENAME), a215_0x3a54a4.join(_0x2dddc4(), DEVICE_IDENTITY_FILENAME)];
  }
  function _0x345ce2() {
    return [a215_0x3a54a4.join(_0x46c385(), "settings.json"), a215_0x3a54a4.join(_0x2dddc4(), "settings.json"), a215_0x3a54a4.join(_0x101d2a, "user", "settings.json")];
  }
  function _0xa73ebb(_0x2fa72d) {
    const _0x284f6a = normalizeDeviceIdentityValue(_0x2fa72d);
    if (!_0x284f6a) {
      return;
    }
    for (const _0x8913b4 of _0x11e9c9()) {
      try {
        writeJsonFileSyncSafe(_0x8913b4, {
          deviceId: _0x284f6a,
          updatedAt: new Date().toISOString()
        });
      } catch (_0x5bcdb2) {
        logEvent({
          type: "device_identity.write_failed",
          level: "warn",
          source: "main",
          message: "Failed to persist device identity",
          error: _0x5bcdb2,
          context: {
            target: a215_0x3a54a4.basename(_0x8913b4)
          }
        });
      }
    }
    for (const _0x1c734d of _0x345ce2().slice(0, 2)) {
      try {
        const _0x46d3f3 = readJsonFileSyncSafe(_0x1c734d);
        if (normalizeDeviceIdentityValue(_0x46d3f3.deviceId) === _0x284f6a) {
          continue;
        }
        writeJsonFileSyncSafe(_0x1c734d, {
          ..._0x46d3f3,
          deviceId: _0x284f6a
        });
      } catch (_0x4996c2) {
        logEvent({
          type: "device_identity.settings_write_failed",
          level: "warn",
          source: "main",
          message: "Failed to mirror device identity into settings",
          error: _0x4996c2,
          context: {
            target: a215_0x3a54a4.basename(_0x1c734d)
          }
        });
      }
    }
  }
  function _0x1e10d5(_0x8fcd63 = {}) {
    const _0xb786bf = normalizeDeviceIdentityValue(_0x8fcd63?.installId || _0x8fcd63?.seedInstallId);
    const _0x1f3465 = _0x11e9c9();
    const _0x3ffb56 = _0x345ce2();
    const _0x3e4aff = [..._0x1f3465.map(_0x3bfa4c => readDeviceIdFromFile(_0x3bfa4c)), ..._0x3ffb56.map(_0x108c8a => readDeviceIdFromFile(_0x108c8a)), ..._0x3ffb56.map(_0x7452d6 => readInstallIdFromFile(_0x7452d6)), _0xb786bf];
    const _0x1779ed = _0x3e4aff.find(Boolean);
    const _0x7b566a = _0x1779ed || randomUUID();
    _0xa73ebb(_0x7b566a);
    return _0x7b566a;
  }
  return {
    getStableDeviceId: _0x1e10d5
  };
}