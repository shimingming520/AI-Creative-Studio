import { t } from "../i18n/index.js";
import { desktopBridge } from "../services/desktopBridge.js";
const MIN_SELECTION_SIZE = 8;
const ACTION_BAR_WIDTH = 92;
const ACTION_BAR_HEIGHT = 38;
const ACTION_BAR_MARGIN = 10;
const MAGNIFIER_SIZE = 172;
const MAGNIFIER_SAMPLE_SIZE = 56;
const MAGNIFIER_SCALE = 3;
const RESIZE_HANDLES = ["nw", "n", "ne", "e", "se", "s", "sw", "w"];
function normalizeNumber(_0x22864d, _0x2ac9c0 = 0) {
  const _0x36069d = Number(_0x22864d);
  if (Number.isFinite(_0x36069d)) {
    return _0x36069d;
  } else {
    return _0x2ac9c0;
  }
}
function clamp(_0x94fef5, _0x4989a7, _0x57deae) {
  return Math.min(Math.max(_0x94fef5, _0x4989a7), _0x57deae);
}
function getViewportSize() {
  return {
    width: Math.max(1, normalizeNumber(globalThis.window?.innerWidth, 1)),
    height: Math.max(1, normalizeNumber(globalThis.window?.innerHeight, 1))
  };
}
function getWindowScreenOrigin() {
  const _0x1e60f9 = globalThis.window || {};
  return {
    x: normalizeNumber(_0x1e60f9.screenX ?? _0x1e60f9.screenLeft, 0),
    y: normalizeNumber(_0x1e60f9.screenY ?? _0x1e60f9.screenTop, 0)
  };
}
function getScreenOriginFromPointerEvent(_0xa5435c, _0x44616e = getWindowScreenOrigin()) {
  const _0x50b8e4 = Number(_0xa5435c?.clientX);
  const _0xb95a53 = Number(_0xa5435c?.clientY);
  const _0x3e9fdf = Number(_0xa5435c?.screenX);
  const _0x4a7fe7 = Number(_0xa5435c?.screenY);
  if (Number.isFinite(_0x50b8e4) && Number.isFinite(_0xb95a53) && Number.isFinite(_0x3e9fdf) && Number.isFinite(_0x4a7fe7)) {
    return {
      x: _0x3e9fdf - _0x50b8e4,
      y: _0x4a7fe7 - _0xb95a53
    };
  }
  return _0x44616e;
}
function getCssTokenValue(_0x2dd9bf, _0x17e547 = "") {
  const _0x2858da = globalThis.document;
  const _0x5b1c65 = String(_0x2dd9bf || "").trim();
  if (!_0x2858da?.documentElement || !_0x5b1c65) {
    return _0x17e547;
  }
  const _0x20c0a6 = globalThis.getComputedStyle?.(_0x2858da.documentElement)?.getPropertyValue(_0x5b1c65)?.trim();
  return _0x20c0a6 || _0x17e547;
}
function normalizeRect(_0x5effe6) {
  const _0x439d59 = normalizeNumber(_0x5effe6?.left, 0);
  const _0x432fda = normalizeNumber(_0x5effe6?.top, 0);
  const _0x45045a = Math.max(0, normalizeNumber(_0x5effe6?.width, 0));
  const _0x34354f = Math.max(0, normalizeNumber(_0x5effe6?.height, 0));
  return {
    left: _0x439d59,
    top: _0x432fda,
    width: _0x45045a,
    height: _0x34354f
  };
}
function rectFromPoints(_0x141a80, _0x48b341) {
  return normalizeRect({
    left: Math.min(_0x141a80.x, _0x48b341.x),
    top: Math.min(_0x141a80.y, _0x48b341.y),
    width: Math.abs(_0x48b341.x - _0x141a80.x),
    height: Math.abs(_0x48b341.y - _0x141a80.y)
  });
}
function clampRectToViewport(_0x5aa189) {
  const _0x2f4c52 = getViewportSize();
  const _0x31e4df = Math.min(Math.max(MIN_SELECTION_SIZE, _0x5aa189.width), _0x2f4c52.width);
  const _0x50f42d = Math.min(Math.max(MIN_SELECTION_SIZE, _0x5aa189.height), _0x2f4c52.height);
  return {
    left: clamp(_0x5aa189.left, 0, Math.max(0, _0x2f4c52.width - _0x31e4df)),
    top: clamp(_0x5aa189.top, 0, Math.max(0, _0x2f4c52.height - _0x50f42d)),
    width: _0x31e4df,
    height: _0x50f42d
  };
}
function applySelectionRect(_0x468f75, _0x1fe703) {
  const _0x477372 = normalizeRect(_0x1fe703);
  _0x468f75.style.left = _0x477372.left + "px";
  _0x468f75.style.top = _0x477372.top + "px";
  _0x468f75.style.width = _0x477372.width + "px";
  _0x468f75.style.height = _0x477372.height + "px";
  _0x468f75.classList.add("is-active");
  return _0x477372;
}
function positionActionBar(_0x2208c9, _0x56a625) {
  const _0x2b3c08 = getViewportSize();
  const _0x38ea2f = Math.min(Math.max(ACTION_BAR_MARGIN, _0x56a625.left + _0x56a625.width - ACTION_BAR_WIDTH), Math.max(ACTION_BAR_MARGIN, _0x2b3c08.width - ACTION_BAR_WIDTH - ACTION_BAR_MARGIN));
  const _0x485aa8 = _0x56a625.top + _0x56a625.height + ACTION_BAR_MARGIN;
  const _0x4dec64 = _0x485aa8 + ACTION_BAR_HEIGHT <= _0x2b3c08.height - ACTION_BAR_MARGIN ? _0x485aa8 : Math.max(ACTION_BAR_MARGIN, _0x56a625.top - ACTION_BAR_HEIGHT - ACTION_BAR_MARGIN);
  _0x2208c9.style.left = _0x38ea2f + "px";
  _0x2208c9.style.top = _0x4dec64 + "px";
}
function positionMagnifier(_0xe9e68a, _0x216eb8, _0x26686d) {
  const _0x19a4e0 = getViewportSize();
  const _0x2ea221 = 18;
  let _0x27b9fe = _0x216eb8 + _0x2ea221;
  let _0x54ddd8 = _0x26686d + _0x2ea221;
  if (_0x27b9fe + MAGNIFIER_SIZE > _0x19a4e0.width - 8) {
    _0x27b9fe = _0x216eb8 - MAGNIFIER_SIZE - _0x2ea221;
  }
  if (_0x54ddd8 + MAGNIFIER_SIZE > _0x19a4e0.height - 8) {
    _0x54ddd8 = _0x26686d - MAGNIFIER_SIZE - _0x2ea221;
  }
  _0xe9e68a.style.left = clamp(_0x27b9fe, 8, Math.max(8, _0x19a4e0.width - MAGNIFIER_SIZE - 8)) + "px";
  _0xe9e68a.style.top = clamp(_0x54ddd8, 8, Math.max(8, _0x19a4e0.height - MAGNIFIER_SIZE - 8)) + "px";
}
function loadImage(_0x8f017) {
  return new Promise((_0x38edd8, _0xb5c635) => {
    const _0x2e4335 = new Image();
    _0x2e4335.onload = () => _0x38edd8(_0x2e4335);
    _0x2e4335.onerror = () => _0xb5c635(new Error("screenshot image failed to load"));
    _0x2e4335.src = _0x8f017;
  });
}
function canvasToBlob(_0x74927) {
  return new Promise(_0x21a164 => {
    _0x74927.toBlob(_0x5fbaf6 => _0x21a164(_0x5fbaf6), "image/png");
  });
}
function mapClientPointToImage(_0x136295, _0x421641, _0x22fe7a, _0x3aa16c, _0x3ef707 = getWindowScreenOrigin()) {
  const _0x20c297 = _0x136295.display || {};
  const _0x357417 = _0x20c297.bounds || {};
  const _0x9e38fb = _0x20c297.imageSize || {};
  const _0x3421ec = normalizeNumber(_0x9e38fb.width, _0x421641.naturalWidth || _0x421641.width);
  const _0x3d7abf = normalizeNumber(_0x9e38fb.height, _0x421641.naturalHeight || _0x421641.height);
  const _0x302986 = _0x3421ec / Math.max(1, normalizeNumber(_0x357417.width, globalThis.window?.innerWidth || 1));
  const _0x3ee816 = _0x3d7abf / Math.max(1, normalizeNumber(_0x357417.height, globalThis.window?.innerHeight || 1));
  const _0x5716cb = _0x3ef707 || getWindowScreenOrigin();
  const _0x538edb = Math.round((_0x5716cb.x + _0x22fe7a - normalizeNumber(_0x357417.x, 0)) * _0x302986);
  const _0x57ebf0 = Math.round((_0x5716cb.y + _0x3aa16c - normalizeNumber(_0x357417.y, 0)) * _0x3ee816);
  return {
    x: clamp(_0x538edb, 0, Math.max(0, _0x3421ec - 1)),
    y: clamp(_0x57ebf0, 0, Math.max(0, _0x3d7abf - 1)),
    screenX: Math.round(_0x5716cb.x + _0x22fe7a),
    screenY: Math.round(_0x5716cb.y + _0x3aa16c)
  };
}
async function cropScreenshotToBlob(_0x3701dc, _0x569962, _0x5252d7 = null, _0x1291a5 = getWindowScreenOrigin()) {
  const _0xcc5d14 = _0x5252d7 || (await loadImage(_0x3701dc.dataUrl));
  const _0x351f4f = mapClientPointToImage(_0x3701dc, _0xcc5d14, _0x569962.left, _0x569962.top, _0x1291a5);
  const _0x316fc9 = mapClientPointToImage(_0x3701dc, _0xcc5d14, _0x569962.left + _0x569962.width, _0x569962.top + _0x569962.height, _0x1291a5);
  const _0x36a2a4 = _0x351f4f.x;
  const _0x163e46 = _0x351f4f.y;
  const _0x10eb40 = Math.max(1, _0x316fc9.x - _0x351f4f.x);
  const _0x5b57b7 = Math.max(1, _0x316fc9.y - _0x351f4f.y);
  const _0x4761cb = document.createElement("canvas");
  _0x4761cb.width = _0x10eb40;
  _0x4761cb.height = _0x5b57b7;
  const _0x1791ba = _0x4761cb.getContext("2d");
  if (!_0x1791ba) {
    return null;
  }
  _0x1791ba.drawImage(_0xcc5d14, _0x36a2a4, _0x163e46, _0x10eb40, _0x5b57b7, 0, 0, _0x10eb40, _0x5b57b7);
  return await canvasToBlob(_0x4761cb);
}
function getPixelRgb(_0x35efed, _0x45dddc) {
  const _0x297a5c = document.createElement("canvas");
  _0x297a5c.width = 1;
  _0x297a5c.height = 1;
  const _0x1e1dde = _0x297a5c.getContext("2d", {
    willReadFrequently: true
  });
  if (!_0x1e1dde) {
    return [0, 0, 0];
  }
  _0x1e1dde.drawImage(_0x35efed, _0x45dddc.x, _0x45dddc.y, 1, 1, 0, 0, 1, 1);
  return Array.from(_0x1e1dde.getImageData(0, 0, 1, 1).data.slice(0, 3));
}
function drawMagnifier({
  magnifier: _0x253cf1,
  canvas: _0x3df523,
  meta: _0x256ffa,
  image: _0x5e082a,
  capture: _0x4a0486,
  event: _0x57df1f,
  screenOrigin: _0x4eff24
}) {
  if (!_0x5e082a) {
    return;
  }
  const _0xffaf86 = mapClientPointToImage(_0x4a0486, _0x5e082a, _0x57df1f.clientX, _0x57df1f.clientY, _0x4eff24);
  const _0x490a41 = _0x3df523.getContext("2d");
  if (!_0x490a41) {
    return;
  }
  const _0x3b36ff = MAGNIFIER_SAMPLE_SIZE;
  const _0x43a5e7 = Math.floor(_0x3b36ff / 2);
  const _0xbe2261 = clamp(_0xffaf86.x - _0x43a5e7, 0, Math.max(0, (_0x5e082a.naturalWidth || _0x5e082a.width) - _0x3b36ff));
  const _0x1ae172 = clamp(_0xffaf86.y - _0x43a5e7, 0, Math.max(0, (_0x5e082a.naturalHeight || _0x5e082a.height) - _0x3b36ff));
  const _0x2e9087 = _0x3b36ff * MAGNIFIER_SCALE;
  _0x490a41.imageSmoothingEnabled = false;
  _0x490a41.clearRect(0, 0, _0x3df523.width, _0x3df523.height);
  _0x490a41.drawImage(_0x5e082a, _0xbe2261, _0x1ae172, _0x3b36ff, _0x3b36ff, 0, 0, _0x2e9087, _0x2e9087);
  const _0x4c2fe8 = Math.floor(_0x2e9087 / 2);
  _0x490a41.strokeStyle = getCssTokenValue("--green", "limegreen");
  _0x490a41.lineWidth = 1;
  _0x490a41.beginPath();
  _0x490a41.moveTo(_0x4c2fe8, 0);
  _0x490a41.lineTo(_0x4c2fe8, _0x2e9087);
  _0x490a41.moveTo(0, _0x4c2fe8);
  _0x490a41.lineTo(_0x2e9087, _0x4c2fe8);
  _0x490a41.stroke();
  const [_0xd26143, _0x139523, _0x249b2a] = getPixelRgb(_0x5e082a, _0xffaf86);
  _0x256ffa.textContent = "POS: (" + _0xffaf86.screenX + ", " + _0xffaf86.screenY + ")\nRGB: (" + _0xd26143 + "," + _0x139523 + "," + _0x249b2a + ")";
  positionMagnifier(_0x253cf1, _0x57df1f.clientX, _0x57df1f.clientY);
}
function buildResizeHandles() {
  return RESIZE_HANDLES.map(_0x57dceb => {
    const _0x409271 = document.createElement("div");
    _0x409271.className = "canvas-screenshot-handle canvas-screenshot-handle--" + _0x57dceb;
    _0x409271.dataset.handle = _0x57dceb;
    return _0x409271;
  });
}
function resizeRectFromHandle(_0x2e9842, _0x48c893, _0x4ce69d, _0x5f30cf) {
  let _0x29b403 = _0x2e9842.left;
  let _0x1383db = _0x2e9842.top;
  let _0x29ad66 = _0x2e9842.width;
  let _0xa9b35a = _0x2e9842.height;
  if (_0x48c893.includes("w")) {
    _0x29b403 = _0x2e9842.left + _0x4ce69d;
    _0x29ad66 = _0x2e9842.width - _0x4ce69d;
  }
  if (_0x48c893.includes("e")) {
    _0x29ad66 = _0x2e9842.width + _0x4ce69d;
  }
  if (_0x48c893.includes("n")) {
    _0x1383db = _0x2e9842.top + _0x5f30cf;
    _0xa9b35a = _0x2e9842.height - _0x5f30cf;
  }
  if (_0x48c893.includes("s")) {
    _0xa9b35a = _0x2e9842.height + _0x5f30cf;
  }
  const _0x41966b = _0x2e9842.left + _0x2e9842.width;
  const _0x2fca24 = _0x2e9842.top + _0x2e9842.height;
  if (_0x29ad66 < MIN_SELECTION_SIZE) {
    if (_0x48c893.includes("w")) {
      _0x29b403 = _0x41966b - MIN_SELECTION_SIZE;
    }
    _0x29ad66 = MIN_SELECTION_SIZE;
  }
  if (_0xa9b35a < MIN_SELECTION_SIZE) {
    if (_0x48c893.includes("n")) {
      _0x1383db = _0x2fca24 - MIN_SELECTION_SIZE;
    }
    _0xa9b35a = MIN_SELECTION_SIZE;
  }
  return clampRectToViewport({
    left: _0x29b403,
    top: _0x1383db,
    width: _0x29ad66,
    height: _0xa9b35a
  });
}
function removeOverlay(_0x1b89c0) {
  _0x1b89c0?.remove?.();
}
export async function startCanvasScreenshot({
  createImageNodeFromBlob: _0x1917fe,
  showToast: _0x4c0d06
} = {}) {
  const _0x49068d = desktopBridge.screenshot.isAvailable() ? desktopBridge.screenshot : null;
  if (typeof _0x49068d?.captureDisplay !== "function") {
    _0x4c0d06?.(t("canvasScreenshot.unsupported"), "warn");
    return false;
  }
  if (typeof _0x1917fe !== "function") {
    _0x4c0d06?.(t("canvasScreenshot.entryNotReady"), "error");
    return false;
  }
  let _0x1ec53d = null;
  try {
    _0x1ec53d = await _0x49068d.captureDisplay();
  } catch {
    _0x1ec53d = null;
  }
  if (!_0x1ec53d?.ok || !_0x1ec53d.dataUrl) {
    _0x4c0d06?.(t("canvasScreenshot.captureFailed"), "error");
    return false;
  }
  const _0x304b05 = document.createElement("div");
  _0x304b05.className = "canvas-screenshot-overlay is-idle";
  _0x304b05.tabIndex = -1;
  const _0x28a558 = document.createElement("div");
  _0x28a558.className = "canvas-screenshot-backdrop";
  const _0x1816d6 = document.createElement("div");
  _0x1816d6.className = "canvas-screenshot-hint";
  _0x1816d6.textContent = t("canvasScreenshot.hints.selectArea");
  const _0xf08fbf = document.createElement("div");
  _0xf08fbf.className = "canvas-screenshot-selection";
  _0xf08fbf.append(...buildResizeHandles());
  const _0x18dc36 = document.createElement("div");
  _0x18dc36.className = "canvas-screenshot-actions";
  const _0x340612 = document.createElement("button");
  _0x340612.type = "button";
  _0x340612.className = "canvas-screenshot-action canvas-screenshot-action--confirm";
  _0x340612.setAttribute("aria-label", t("canvasScreenshot.confirmAria"));
  _0x340612.textContent = "✓";
  const _0x580775 = document.createElement("button");
  _0x580775.type = "button";
  _0x580775.className = "canvas-screenshot-action canvas-screenshot-action--cancel";
  _0x580775.setAttribute("aria-label", t("canvasScreenshot.cancelAria"));
  _0x580775.textContent = "×";
  _0x18dc36.append(_0x340612, _0x580775);
  const _0x37bb4a = document.createElement("div");
  _0x37bb4a.className = "canvas-screenshot-magnifier";
  const _0x5c8152 = document.createElement("canvas");
  _0x5c8152.width = MAGNIFIER_SAMPLE_SIZE * MAGNIFIER_SCALE;
  _0x5c8152.height = MAGNIFIER_SAMPLE_SIZE * MAGNIFIER_SCALE;
  const _0x3152ad = document.createElement("div");
  _0x3152ad.className = "canvas-screenshot-magnifier-meta";
  _0x37bb4a.append(_0x5c8152, _0x3152ad);
  _0x304b05.append(_0x28a558, _0x1816d6, _0xf08fbf, _0x18dc36, _0x37bb4a);
  document.body.appendChild(_0x304b05);
  _0x304b05.focus?.();
  let _0x34ef3d = "idle";
  let _0x5887c1 = null;
  let _0xeec90d = null;
  let _0x2c260f = null;
  let _0x688268 = false;
  let _0x307574 = null;
  let _0x42503b = getWindowScreenOrigin();
  const _0x438c2f = loadImage(_0x1ec53d.dataUrl).then(_0x2c7c98 => {
    _0x307574 = _0x2c7c98;
    return _0x2c7c98;
  }).catch(() => null);
  const _0x2d9238 = _0x35a371 => {
    _0x34ef3d = _0x35a371;
    _0x304b05.classList.toggle("is-idle", _0x35a371 === "idle");
    _0x304b05.classList.toggle("is-selecting", _0x35a371 === "selecting");
    _0x304b05.classList.toggle("is-selected", _0x35a371 === "selected");
    _0x304b05.classList.toggle("is-busy", _0x35a371 === "busy");
  };
  const _0x5c8c2a = () => {
    if (!_0x5887c1) {
      return;
    }
    _0x5887c1 = applySelectionRect(_0xf08fbf, _0x5887c1);
    positionActionBar(_0x18dc36, _0x5887c1);
    _0x18dc36.classList.add("is-active");
    _0x1816d6.textContent = t("canvasScreenshot.hints.adjustArea");
  };
  const _0x2ca725 = () => {
    globalThis.window?.removeEventListener?.("keydown", _0x46ae72, true);
    _0x304b05.removeEventListener("contextmenu", _0x34283a, true);
    removeOverlay(_0x304b05);
  };
  const _0x39c9c5 = () => {
    _0x5887c1 = null;
    _0x2c260f = null;
    _0xf08fbf.classList.remove("is-active");
    _0x18dc36.classList.remove("is-active", "is-busy");
    _0x1816d6.textContent = t("canvasScreenshot.hints.selectArea");
    _0x2d9238("idle");
  };
  const _0x2fdbce = () => _0x2ca725();
  const _0xf3f031 = _0x55dec9 => {
    _0x42503b = getScreenOriginFromPointerEvent(_0x55dec9, _0x42503b);
    return _0x42503b;
  };
  const _0xc435a5 = () => {
    if (_0xeec90d != null) {
      try {
        _0x304b05.releasePointerCapture?.(_0xeec90d);
      } catch {}
    }
    _0xeec90d = null;
    _0x304b05.removeEventListener("pointermove", _0x2e5a76);
    _0x304b05.removeEventListener("pointerup", _0x2496b0);
    if (!_0x5887c1 || _0x5887c1.width < MIN_SELECTION_SIZE || _0x5887c1.height < MIN_SELECTION_SIZE) {
      _0x39c9c5();
      _0x4c0d06?.(t("canvasScreenshot.areaTooSmall"), "warn");
      return;
    }
    _0x5887c1 = clampRectToViewport(_0x5887c1);
    _0x2d9238("selected");
    _0x5c8c2a();
  };
  const _0x2e5a76 = _0x1d99b0 => {
    if (!_0x2c260f || _0x688268) {
      return;
    }
    _0xf3f031(_0x1d99b0);
    const _0x4446b9 = _0x1d99b0.clientX - _0x2c260f.startX;
    const _0x322ac2 = _0x1d99b0.clientY - _0x2c260f.startY;
    if (_0x2c260f.type === "select") {
      _0x5887c1 = rectFromPoints({
        x: _0x2c260f.startX,
        y: _0x2c260f.startY
      }, {
        x: _0x1d99b0.clientX,
        y: _0x1d99b0.clientY
      });
      applySelectionRect(_0xf08fbf, _0x5887c1);
      return;
    }
    if (_0x2c260f.type === "move") {
      _0x5887c1 = clampRectToViewport({
        ..._0x2c260f.startRect,
        left: _0x2c260f.startRect.left + _0x4446b9,
        top: _0x2c260f.startRect.top + _0x322ac2
      });
      _0x5c8c2a();
      return;
    }
    if (_0x2c260f.type === "resize") {
      _0x5887c1 = resizeRectFromHandle(_0x2c260f.startRect, _0x2c260f.handle, _0x4446b9, _0x322ac2);
      _0x5c8c2a();
    }
  };
  const _0x2496b0 = () => {
    _0xc435a5();
  };
  const _0x176453 = (_0x226a02, _0x49aa22) => {
    _0x226a02.preventDefault();
    _0xf3f031(_0x226a02);
    _0xeec90d = _0x226a02.pointerId;
    _0x2c260f = {
      ..._0x49aa22,
      startX: _0x226a02.clientX,
      startY: _0x226a02.clientY
    };
    _0x304b05.setPointerCapture?.(_0x226a02.pointerId);
    _0x304b05.addEventListener("pointermove", _0x2e5a76);
    _0x304b05.addEventListener("pointerup", _0x2496b0, {
      once: true
    });
  };
  const _0x4fb98a = async () => {
    if (_0x688268 || _0x34ef3d !== "selected" || !_0x5887c1) {
      return;
    }
    _0x688268 = true;
    _0x2d9238("busy");
    _0x18dc36.classList.add("is-busy");
    try {
      const _0xf67a2d = _0x307574 || (await _0x438c2f);
      const _0x466717 = await cropScreenshotToBlob(_0x1ec53d, _0x5887c1, _0xf67a2d, _0x42503b);
      if (!_0x466717) {
        throw new Error("empty screenshot crop");
      }
      await _0x1917fe(_0x466717, "image/png", {
        name: t("canvasScreenshot.nodeName"),
        typeSlug: "screenshot"
      });
      _0x2ca725();
      _0x4c0d06?.(t("canvasScreenshot.added"), "success");
    } catch (_0x43856e) {
      console.warn("[canvasScreenshot] crop failed:", _0x43856e);
      _0x2ca725();
      _0x4c0d06?.(t("canvasScreenshot.addFailed"), "error");
    }
  };
  function _0x46ae72(_0x27e799) {
    if (_0x27e799.key !== "Escape") {
      return;
    }
    _0x27e799.preventDefault();
    _0x27e799.stopPropagation();
    _0x2fdbce();
  }
  function _0x34283a(_0x51f9ea) {
    _0x51f9ea.preventDefault();
    _0x51f9ea.stopPropagation();
    if (_0x34ef3d === "idle") {
      _0x2fdbce();
      return;
    }
    _0x39c9c5();
  }
  _0x304b05.addEventListener("pointermove", _0xbcfcb9 => {
    if (_0x34ef3d !== "idle" || !_0x307574) {
      return;
    }
    drawMagnifier({
      magnifier: _0x37bb4a,
      canvas: _0x5c8152,
      meta: _0x3152ad,
      image: _0x307574,
      capture: _0x1ec53d,
      event: _0xbcfcb9,
      screenOrigin: _0xf3f031(_0xbcfcb9)
    });
  });
  _0x304b05.addEventListener("pointerdown", _0x3ce6b3 => {
    if (_0x3ce6b3.button === 2) {
      _0x3ce6b3.preventDefault();
      if (_0x34ef3d === "idle") {
        _0x2fdbce();
      } else {
        _0x39c9c5();
      }
      return;
    }
    if (_0x3ce6b3.button !== 0 || _0x688268) {
      return;
    }
    const _0x55f078 = _0x3ce6b3.target?.dataset?.handle || "";
    if (_0x34ef3d === "selected" && _0x55f078 && _0x5887c1) {
      _0x176453(_0x3ce6b3, {
        type: "resize",
        handle: _0x55f078,
        startRect: {
          ..._0x5887c1
        }
      });
      return;
    }
    if (_0x34ef3d === "selected" && _0x3ce6b3.target === _0xf08fbf && _0x5887c1) {
      _0x176453(_0x3ce6b3, {
        type: "move",
        startRect: {
          ..._0x5887c1
        }
      });
      return;
    }
    if (_0x3ce6b3.target !== _0x304b05 && _0x3ce6b3.target !== _0x28a558) {
      return;
    }
    _0x18dc36.classList.remove("is-active");
    _0x2d9238("selecting");
    _0x5887c1 = applySelectionRect(_0xf08fbf, {
      left: _0x3ce6b3.clientX,
      top: _0x3ce6b3.clientY,
      width: 0,
      height: 0
    });
    _0x176453(_0x3ce6b3, {
      type: "select"
    });
  });
  _0x18dc36.addEventListener("pointerdown", _0xc79b7d => {
    _0xc79b7d.stopPropagation();
  });
  _0x340612.addEventListener("click", _0x590070 => {
    _0x590070.preventDefault();
    _0x590070.stopPropagation();
    _0x4fb98a();
  });
  _0x580775.addEventListener("click", _0x1e4449 => {
    _0x1e4449.preventDefault();
    _0x1e4449.stopPropagation();
    _0x2fdbce();
  });
  globalThis.window?.addEventListener?.("keydown", _0x46ae72, true);
  _0x304b05.addEventListener("contextmenu", _0x34283a, true);
  return true;
}