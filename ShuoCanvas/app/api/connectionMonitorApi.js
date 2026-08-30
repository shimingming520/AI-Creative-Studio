import a62_0x1b951 from "../src/core/stores/appStore.js";
import { buildApiUrl } from "./apiBase.js";
const HEARTBEAT_PATH = "/api/v2/heartbeat_stream";
const INITIAL_CONNECT_DELAY_MS = 1000;
const RECONNECT_DELAY_MS = 2000;
const DISCONNECT_GRACE_MS = 5000;
export function createServerConnectionMonitor({
  EventSourceClass = globalThis.EventSource,
  resolveHeartbeatUrl = () => buildApiUrl(HEARTBEAT_PATH),
  setServerConnection = _0xedd692 => a62_0x1b951.setServerConnection(_0xedd692),
  setTimeoutFn = globalThis.setTimeout,
  clearTimeoutFn = globalThis.clearTimeout,
  initialConnectDelayMs = INITIAL_CONNECT_DELAY_MS,
  reconnectDelayMs = RECONNECT_DELAY_MS,
  disconnectGraceMs = DISCONNECT_GRACE_MS
} = {}) {
  let _0x1a1f01 = null;
  let _0x5c6bf2 = null;
  let _0x5d9bb4 = null;
  let _0x407d28 = null;
  let _0x18f17c = false;
  function _0x480bbe() {
    if (_0x407d28 === null) {
      return;
    }
    clearTimeoutFn(_0x407d28);
    _0x407d28 = null;
  }
  function _0x475b06() {
    if (_0x407d28 !== null) {
      return;
    }
    _0x407d28 = setTimeoutFn(() => {
      _0x407d28 = null;
      setServerConnection(false);
    }, disconnectGraceMs);
  }
  function _0x4d8098() {
    if (!_0x18f17c || _0x5d9bb4 !== null) {
      return;
    }
    _0x5d9bb4 = setTimeoutFn(() => {
      _0x5d9bb4 = null;
      _0x1481f7();
    }, reconnectDelayMs);
  }
  function _0x1481f7() {
    if (!_0x18f17c) {
      return;
    }
    _0x1a1f01?.close?.();
    let _0x1a7d0b;
    try {
      _0x1a7d0b = new EventSourceClass(resolveHeartbeatUrl());
    } catch {
      _0x1a1f01 = null;
      _0x475b06();
      _0x4d8098();
      return;
    }
    _0x1a1f01 = _0x1a7d0b;
    _0x1a7d0b.onopen = () => {
      if (!_0x18f17c || _0x1a1f01 !== _0x1a7d0b) {
        return;
      }
      _0x480bbe();
      setServerConnection(true);
    };
    _0x1a7d0b.onerror = () => {
      if (!_0x18f17c || _0x1a1f01 !== _0x1a7d0b) {
        return;
      }
      _0x1a7d0b.close();
      _0x1a1f01 = null;
      _0x475b06();
      _0x4d8098();
    };
  }
  function _0x2075b9() {
    if (_0x18f17c) {
      return;
    }
    _0x18f17c = true;
    _0x5c6bf2 = setTimeoutFn(() => {
      _0x5c6bf2 = null;
      _0x1481f7();
    }, initialConnectDelayMs);
  }
  function _0x1c7d49() {
    _0x18f17c = false;
    if (_0x5c6bf2 !== null) {
      clearTimeoutFn(_0x5c6bf2);
    }
    if (_0x5d9bb4 !== null) {
      clearTimeoutFn(_0x5d9bb4);
    }
    _0x480bbe();
    _0x5c6bf2 = null;
    _0x5d9bb4 = null;
    _0x1a1f01?.close?.();
    _0x1a1f01 = null;
  }
  return {
    start: _0x2075b9,
    stop: _0x1c7d49
  };
}
const serverConnectionMonitor = createServerConnectionMonitor();
export function startServerConnectionMonitor() {
  serverConnectionMonitor.start();
}