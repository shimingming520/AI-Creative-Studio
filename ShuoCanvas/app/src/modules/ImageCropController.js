import a996_0x4e3419 from "../core/stores/appStore.js";
import { onLocaleChange, t } from "../i18n/index.js";
import { saveOutputBlob } from "./project.js";
import { generateId, screenToWorld, worldToScreen } from "../core/math.js";
import { calcSafeSpawnPosNearNode } from "./nodeSpawn.js";
import { buildSourceMediaNodePayload, getAutoMediaSizeByShortSide } from "../services/fileService.js";
import { buildCanvasLocalImageFields } from "../services/canvasMediaLocalService.js";
import { localPathToUrl, pickResultLocalPath } from "../utils/localMediaPath.js";
import { buildGenerationStartPatch } from "../core/generationTaskLifecycle.js";
import { buildImageGenerationFailurePatch, buildImageGenerationResultPatch } from "../components/aigenImage/imageGenerationResultRenderer.js";
import { addToolbarPendingResultNodes, persistToolbarResultNodes, updateToolbarResultNode } from "./toolbarPendingResultNodes.js";
import { resolveImageCropSourceUrl } from "./imageCropSourceUrl.js";
export const IMAGE_CROP_MIN_SIZE = 20;
export const IMAGE_CROP_EXPORT_MAX_EDGE = 1280;
function imageCropText(_0x2a5f5f, _0x35ae73 = {}) {
  return t("imageCrop." + _0x2a5f5f, _0x35ae73);
}
function toFiniteNumber(_0x5ee757, _0x4d2988 = 0) {
  const _0x2cce51 = Number(_0x5ee757);
  if (Number.isFinite(_0x2cce51)) {
    return _0x2cce51;
  } else {
    return _0x4d2988;
  }
}
function clamp(_0x3fb94b, _0x156bd7, _0x245380) {
  return Math.max(_0x156bd7, Math.min(_0x245380, _0x3fb94b));
}
function waitForCropBackgroundFrame() {
  return new Promise(_0x496531 => {
    const _0x2685ec = globalThis.window?.requestAnimationFrame || globalThis.requestAnimationFrame;
    if (typeof _0x2685ec === "function") {
      _0x2685ec(() => _0x496531());
      return;
    }
    setTimeout(_0x496531, 0);
  });
}
export function buildImageCropOutputSize(_0x54b60d, _0x5ebed8, {
  maxEdge = IMAGE_CROP_EXPORT_MAX_EDGE
} = {}) {
  const _0x27d622 = Math.max(1, Math.round(Number(_0x54b60d) || 0));
  const _0x59629e = Math.max(1, Math.round(Number(_0x5ebed8) || 0));
  const _0x4f1102 = Math.max(1, Math.round(Number(maxEdge) || 0));
  const _0x58e037 = Math.max(_0x27d622, _0x59629e);
  if (_0x58e037 <= _0x4f1102) {
    return {
      width: _0x27d622,
      height: _0x59629e
    };
  }
  const _0x2bedc9 = _0x4f1102 / _0x58e037;
  return {
    width: Math.max(1, Math.round(_0x27d622 * _0x2bedc9)),
    height: Math.max(1, Math.round(_0x59629e * _0x2bedc9))
  };
}
export function isLoadedCropImageElement(_0x3943fb) {
  if (!_0x3943fb || String(_0x3943fb.tagName || "").toUpperCase() !== "IMG") {
    return false;
  }
  if (_0x3943fb.complete === false) {
    return false;
  }
  if (String(_0x3943fb.style?.display || "").toLowerCase() === "none") {
    return false;
  }
  const _0x5f1400 = String(_0x3943fb.dataset?.lodSrc || "").trim();
  if (_0x5f1400 === "thumb" || _0x5f1400 === "placeholder") {
    return false;
  }
  return Math.max(0, Math.round(Number(_0x3943fb.naturalWidth || _0x3943fb.width || 0))) > 0 && Math.max(0, Math.round(Number(_0x3943fb.naturalHeight || _0x3943fb.height || 0))) > 0;
}
export function findLoadedCropImageElement(_0x56b1ae, _0x51b5ee = globalThis.document) {
  const _0x2d99ea = String(_0x56b1ae || "").trim();
  if (!_0x2d99ea || !_0x51b5ee?.getElementById) {
    return null;
  }
  const _0x4e951a = _0x51b5ee.getElementById(_0x2d99ea);
  if (!_0x4e951a?.querySelector) {
    return null;
  }
  for (const _0x291881 of [".node-img", "img"]) {
    const _0x4da9e2 = _0x4e951a.querySelector(_0x291881);
    if (isLoadedCropImageElement(_0x4da9e2)) {
      return _0x4da9e2;
    }
  }
  return null;
}
function normalizeCropNodeBounds(_0x99e31b) {
  if (!_0x99e31b || typeof _0x99e31b !== "object") {
    return null;
  }
  const _0x289ea4 = toFiniteNumber(_0x99e31b.x);
  const _0x4bc8b3 = toFiniteNumber(_0x99e31b.y);
  const _0x482b80 = Math.max(0, toFiniteNumber(_0x99e31b.width ?? _0x99e31b.w));
  const _0x555968 = Math.max(0, toFiniteNumber(_0x99e31b.height ?? _0x99e31b.h));
  if (!(_0x482b80 > 0) || !(_0x555968 > 0)) {
    return null;
  }
  return {
    x: _0x289ea4,
    y: _0x4bc8b3,
    width: _0x482b80,
    height: _0x555968,
    right: _0x289ea4 + _0x482b80,
    bottom: _0x4bc8b3 + _0x555968
  };
}
function normalizeCropAspectRatio(_0x490731) {
  const _0x912b10 = Number(_0x490731);
  if (Number.isFinite(_0x912b10) && _0x912b10 > 0) {
    return _0x912b10;
  } else {
    return null;
  }
}
function clampPointToNode(_0x5357df, _0x35eeeb) {
  return {
    x: clamp(toFiniteNumber(_0x5357df?.x), _0x35eeeb.x, _0x35eeeb.right),
    y: clamp(toFiniteNumber(_0x5357df?.y), _0x35eeeb.y, _0x35eeeb.bottom)
  };
}
export function buildImageCropDragRect({
  startPoint: _0x377bcd,
  currentPoint: _0x5e69cd,
  node: _0x130c04,
  aspectRatio = null,
  minSize = IMAGE_CROP_MIN_SIZE
} = {}) {
  const _0x2be230 = normalizeCropNodeBounds(_0x130c04);
  if (!_0x2be230) {
    return null;
  }
  const _0x19c8b9 = clampPointToNode(_0x377bcd, _0x2be230);
  const _0x5bc70c = clampPointToNode(_0x5e69cd, _0x2be230);
  const _0x16c14c = _0x5bc70c.x - _0x19c8b9.x;
  const _0x19c10c = _0x5bc70c.y - _0x19c8b9.y;
  const _0x6b4d26 = _0x16c14c < 0 ? -1 : 1;
  const _0x48a1e9 = _0x19c10c < 0 ? -1 : 1;
  let _0x4ae1b5 = Math.abs(_0x16c14c);
  let _0xf00612 = Math.abs(_0x19c10c);
  const _0x3cd43a = normalizeCropAspectRatio(aspectRatio);
  if (_0x3cd43a) {
    const _0x3c3a88 = _0x6b4d26 < 0 ? _0x19c8b9.x - _0x2be230.x : _0x2be230.right - _0x19c8b9.x;
    const _0x497bb9 = _0x48a1e9 < 0 ? _0x19c8b9.y - _0x2be230.y : _0x2be230.bottom - _0x19c8b9.y;
    if (_0x4ae1b5 > 0 && _0xf00612 > 0) {
      if (_0x4ae1b5 / _0xf00612 > _0x3cd43a) {
        _0x4ae1b5 = _0xf00612 * _0x3cd43a;
      } else {
        _0xf00612 = _0x4ae1b5 / _0x3cd43a;
      }
    } else if (_0x4ae1b5 > 0) {
      _0xf00612 = _0x4ae1b5 / _0x3cd43a;
    } else if (_0xf00612 > 0) {
      _0x4ae1b5 = _0xf00612 * _0x3cd43a;
    }
    if (_0x4ae1b5 > _0x3c3a88) {
      _0x4ae1b5 = _0x3c3a88;
      _0xf00612 = _0x4ae1b5 / _0x3cd43a;
    }
    if (_0xf00612 > _0x497bb9) {
      _0xf00612 = _0x497bb9;
      _0x4ae1b5 = _0xf00612 * _0x3cd43a;
    }
  }
  if (!(_0x4ae1b5 > 0) || !(_0xf00612 > 0)) {
    return null;
  }
  const _0x17ba08 = {
    x: _0x6b4d26 < 0 ? _0x19c8b9.x - _0x4ae1b5 : _0x19c8b9.x,
    y: _0x48a1e9 < 0 ? _0x19c8b9.y - _0xf00612 : _0x19c8b9.y,
    w: _0x4ae1b5,
    h: _0xf00612
  };
  const _0x785246 = Math.max(0, toFiniteNumber(minSize, IMAGE_CROP_MIN_SIZE));
  return {
    rect: _0x17ba08,
    isValid: _0x17ba08.w >= _0x785246 && _0x17ba08.h >= _0x785246
  };
}
const ImageCropController = {
  active: false,
  nodeData: null,
  cropRect: {
    x: 0,
    y: 0,
    w: 0,
    h: 0
  },
  aspectRatio: null,
  overlayEl: null,
  boxEl: null,
  toolbarEl: null,
  ratioMenuEl: null,
  _unsubscribe: null,
  _unsubscribeLocale: null,
  _view: null,
  _redrawSelection: null,
  _isProcessingCrop: false,
  init(_0x2efcdc) {
    if (this.active) {
      return;
    }
    const _0x37379c = a996_0x4e3419.getStateRaw();
    const _0x10fdc3 = _0x37379c.nodes?.[_0x2efcdc];
    if (!_0x10fdc3) {
      return;
    }
    this.active = true;
    this.nodeData = _0x10fdc3;
    this._isProcessingCrop = false;
    this.aspectRatio = null;
    this._view = {
      viewport: _0x37379c.viewport,
      node: _0x10fdc3
    };
    this._redrawSelection = null;
    const _0x310bd4 = 0.1;
    this.cropRect = {
      x: _0x10fdc3.x + _0x10fdc3.width * _0x310bd4 / 2,
      y: _0x10fdc3.y + _0x10fdc3.height * _0x310bd4 / 2,
      w: _0x10fdc3.width * (1 - _0x310bd4),
      h: _0x10fdc3.height * (1 - _0x310bd4)
    };
    const _0x4a2c86 = () => {
      this._createUI();
      this._bindEvents();
      this._unsubscribe = a996_0x4e3419.subscribeSelector(_0x4fba2d => {
        const _0x33ba00 = _0x4fba2d.nodes?.[_0x2efcdc];
        const _0x4fd70b = _0x4fba2d.viewport || {
          x: 0,
          y: 0,
          zoom: 1
        };
        return {
          hasNode: !!_0x33ba00,
          nx: _0x33ba00 ? _0x33ba00.x : 0,
          ny: _0x33ba00 ? _0x33ba00.y : 0,
          nw: _0x33ba00 ? _0x33ba00.width : 0,
          nh: _0x33ba00 ? _0x33ba00.height : 0,
          vx: _0x4fd70b.x,
          vy: _0x4fd70b.y,
          vz: _0x4fd70b.zoom || 1,
          vox: _0x4fd70b._screenOriginX || 0,
          voy: _0x4fd70b._screenOriginY || 0
        };
      }, _0x43ae84 => {
        if (!_0x43ae84?.hasNode) {
          return;
        }
        const _0x220056 = a996_0x4e3419.getStateRaw().nodes?.[_0x2efcdc];
        if (!_0x220056) {
          return;
        }
        this._view = {
          viewport: {
            x: _0x43ae84.vx,
            y: _0x43ae84.vy,
            zoom: _0x43ae84.vz,
            _screenOriginX: _0x43ae84.vox,
            _screenOriginY: _0x43ae84.voy
          },
          node: _0x220056
        };
        this._updateView(this._view);
      });
      requestAnimationFrame(() => {
        if (this.overlayEl) {
          this.overlayEl.classList.add("visible");
        }
        if (this.dimMaskEl) {
          this.dimMaskEl.classList.add("visible");
        }
      });
    };
    if (typeof requestIdleCallback !== "undefined") {
      requestIdleCallback(_0x4a2c86, {
        timeout: 50
      });
    } else {
      setTimeout(_0x4a2c86, 0);
    }
  },
  _createUI() {
    const _0x4dcdfc = document.createDocumentFragment();
    const _0x2ad63c = document.createElement("div");
    _0x2ad63c.className = "v2-crop-overlay";
    _0x2ad63c.style.willChange = "opacity";
    const _0x2dd410 = document.createElement("div");
    _0x2dd410.className = "v2-crop-dim-mask";
    const _0x2e80ae = document.createElement("div");
    _0x2e80ae.className = "v2-crop-container";
    _0x2e80ae.style.transform = "translateZ(0)";
    const _0x58bd43 = document.createElement("div");
    _0x58bd43.className = "v2-crop-box";
    _0x58bd43.style.willChange = "transform, width, height";
    _0x58bd43.style.transform = "translateZ(0)";
    const _0xb10130 = document.createElement("div");
    _0xb10130.className = "v2-crop-grid";
    _0xb10130.replaceChildren();
    for (let _0x27ed4a = 0; _0x27ed4a < 9; _0x27ed4a++) {
      _0xb10130.appendChild(document.createElement("div"));
    }
    _0x58bd43.appendChild(_0xb10130);
    const _0x194e3c = ["tl", "tm", "tr", "rm", "br", "bm", "bl", "lm"];
    _0x194e3c.forEach(_0x5d2566 => {
      const _0x1de166 = document.createElement("div");
      _0x1de166.className = "v2-crop-handle " + _0x5d2566;
      _0x1de166.dataset.handle = _0x5d2566;
      _0x58bd43.appendChild(_0x1de166);
    });
    _0x2e80ae.appendChild(_0x58bd43);
    _0x2ad63c.appendChild(_0x2e80ae);
    _0x4dcdfc.appendChild(_0x2dd410);
    _0x4dcdfc.appendChild(_0x2ad63c);
    const _0x547560 = document.createElement("div");
    _0x547560.className = "v2-crop-size-label";
    _0x547560.textContent = "-- x --";
    _0x4dcdfc.appendChild(_0x547560);
    this.sizeLabelEl = _0x547560;
    this.dimMaskEl = _0x2dd410;
    const _0x22cdc1 = document.createElement("div");
    _0x22cdc1.className = "v2-crop-toolbar";
    _0x22cdc1.style.willChange = "opacity, transform";
    const _0xaf9eef = "http://www.w3.org/2000/svg";
    const _0x49a622 = (_0x353fab, _0x56204d, _0xfe384e) => {
      const _0x33f06e = document.createElementNS(_0xaf9eef, "svg");
      _0x33f06e.setAttribute("width", String(_0x353fab));
      _0x33f06e.setAttribute("height", String(_0x56204d));
      _0x33f06e.setAttribute("viewBox", "0 0 24 24");
      _0x33f06e.setAttribute("fill", "none");
      _0x33f06e.setAttribute("stroke", "currentColor");
      _0x33f06e.setAttribute("stroke-width", String(_0xfe384e));
      return _0x33f06e;
    };
    const _0x214857 = document.createElement("button");
    _0x214857.className = "v2-crop-toolbar-btn exit";
    _0x214857.title = imageCropText("actions.exit");
    const _0x41a4a2 = _0x49a622(18, 18, 2);
    const _0x1be413 = document.createElementNS(_0xaf9eef, "path");
    _0x1be413.setAttribute("d", "M18 6L6 18");
    const _0x26ab6b = document.createElementNS(_0xaf9eef, "path");
    _0x26ab6b.setAttribute("d", "M6 6l12 12");
    _0x41a4a2.appendChild(_0x1be413);
    _0x41a4a2.appendChild(_0x26ab6b);
    _0x214857.appendChild(_0x41a4a2);
    const _0x3194e7 = document.createElement("div");
    _0x3194e7.className = "v2-crop-divider";
    const _0x2502fc = document.createElement("div");
    _0x2502fc.className = "v2-expand-wrap";
    const _0x2b437c = document.createElement("button");
    _0x2b437c.className = "v2-crop-toolbar-btn ratio-toggle";
    const _0x1830f3 = _0x49a622(16, 16, 2);
    const _0x33065e = document.createElementNS(_0xaf9eef, "rect");
    _0x33065e.setAttribute("x", "3");
    _0x33065e.setAttribute("y", "3");
    _0x33065e.setAttribute("width", "18");
    _0x33065e.setAttribute("height", "18");
    _0x33065e.setAttribute("rx", "2");
    const _0x1a8021 = document.createElementNS(_0xaf9eef, "path");
    _0x1a8021.setAttribute("d", "M3 9h18M9 21V9");
    _0x1830f3.appendChild(_0x33065e);
    _0x1830f3.appendChild(_0x1a8021);
    const _0x573bb8 = document.createElement("span");
    _0x573bb8.className = "ratio-text";
    _0x573bb8.textContent = imageCropText("ratios.free");
    _0x2b437c.appendChild(_0x1830f3);
    _0x2b437c.appendChild(_0x573bb8);
    const _0x38e436 = document.createElement("div");
    _0x38e436.className = "floating-menu v2-expand-menu v2-crop-ratio-menu";
    const _0x2cd2e9 = [{
      v: "free",
      key: "free",
      active: true
    }, {
      v: "original",
      key: "original"
    }, {
      v: "21:9",
      t: "21:9"
    }, {
      v: "16:9",
      t: "16:9"
    }, {
      v: "9:16",
      t: "9:16"
    }, {
      v: "4:3",
      t: "4:3"
    }, {
      v: "3:4",
      t: "3:4"
    }, {
      v: "1:1",
      t: "1:1"
    }];
    _0x2cd2e9.forEach(_0x391d52 => {
      const _0x54c01b = document.createElement("div");
      _0x54c01b.className = "floating-menu-item v2-expand-menu-item v2-crop-ratio-item" + (_0x391d52.active ? " active" : "");
      _0x54c01b.dataset.ratio = _0x391d52.v;
      if (_0x391d52.key) {
        _0x54c01b.dataset.ratioLabelKey = _0x391d52.key;
      }
      const _0x33dfad = document.createElement("span");
      _0x33dfad.className = "floating-menu-label";
      _0x33dfad.textContent = _0x391d52.key ? imageCropText("ratios." + _0x391d52.key) : _0x391d52.t;
      _0x54c01b.appendChild(_0x33dfad);
      _0x38e436.appendChild(_0x54c01b);
    });
    _0x2502fc.appendChild(_0x2b437c);
    _0x2502fc.appendChild(_0x38e436);
    const _0x45d83a = document.createElement("div");
    _0x45d83a.className = "v2-crop-divider";
    const _0x31ef72 = document.createElement("button");
    _0x31ef72.className = "v2-crop-toolbar-btn confirm";
    const _0x5193dd = _0x49a622(18, 18, 2);
    const _0x5e61e1 = document.createElementNS(_0xaf9eef, "polyline");
    _0x5e61e1.setAttribute("points", "20 6 9 17 4 12");
    _0x5193dd.appendChild(_0x5e61e1);
    _0x31ef72.appendChild(_0x5193dd);
    _0x31ef72.appendChild(document.createTextNode(" " + imageCropText("actions.confirm")));
    _0x22cdc1.appendChild(_0x214857);
    _0x22cdc1.appendChild(_0x3194e7);
    _0x22cdc1.appendChild(_0x2502fc);
    _0x22cdc1.appendChild(_0x45d83a);
    _0x22cdc1.appendChild(_0x31ef72);
    document.body.appendChild(_0x4dcdfc);
    document.body.appendChild(_0x22cdc1);
    this.overlayEl = _0x2ad63c;
    this.boxEl = _0x58bd43;
    this.toolbarEl = _0x22cdc1;
    this.ratioMenuEl = _0x38e436;
    this._subscribeLocaleChanges();
    this._syncLocaleTexts();
    requestAnimationFrame(() => {
      if (this._containerEl) {
        this._containerEl._lastTransform = null;
      }
      if (this.boxEl) {
        this.boxEl._lastTransform = null;
      }
      this._updateView();
    });
  },
  _updateView(_0x3611e4 = this._view) {
    if (!this.active) {
      return;
    }
    const _0x226ac4 = _0x3611e4?.node;
    const _0x5a51d0 = _0x3611e4?.viewport;
    if (!_0x226ac4) {
      return;
    }
    this.nodeData = _0x226ac4;
    const _0xfd6bcb = worldToScreen(this.nodeData.x, this.nodeData.y, _0x5a51d0);
    const _0x1c4f3c = {
      w: Math.round(this.nodeData.width * _0x5a51d0.zoom),
      h: Math.round(this.nodeData.height * _0x5a51d0.zoom)
    };
    if (!this._containerEl) {
      this._containerEl = this.overlayEl.querySelector(".v2-crop-container");
    }
    const _0x80fa7e = this._containerEl;
    const _0x53f93a = "translate(" + Math.round(_0xfd6bcb.x) + "px, " + Math.round(_0xfd6bcb.y) + "px) translateZ(0)";
    if (_0x80fa7e._lastTransform !== _0x53f93a) {
      _0x80fa7e.style.transform = _0x53f93a;
      _0x80fa7e._lastTransform = _0x53f93a;
    }
    _0x80fa7e.style.width = _0x1c4f3c.w + "px";
    _0x80fa7e.style.height = _0x1c4f3c.h + "px";
    _0x80fa7e.style.position = "fixed";
    const _0x4eb000 = {
      x: Math.max(0, Math.round((this.cropRect.x - this.nodeData.x) * _0x5a51d0.zoom)),
      y: Math.max(0, Math.round((this.cropRect.y - this.nodeData.y) * _0x5a51d0.zoom)),
      w: Math.round(this.cropRect.w * _0x5a51d0.zoom),
      h: Math.round(this.cropRect.h * _0x5a51d0.zoom)
    };
    if (_0x4eb000.x + _0x4eb000.w > _0x1c4f3c.w) {
      _0x4eb000.w = _0x1c4f3c.w - _0x4eb000.x;
    }
    if (_0x4eb000.y + _0x4eb000.h > _0x1c4f3c.h) {
      _0x4eb000.h = _0x1c4f3c.h - _0x4eb000.y;
    }
    const _0x496e36 = "translate(" + _0x4eb000.x + "px, " + _0x4eb000.y + "px) translateZ(0)";
    if (this.boxEl._lastTransform !== _0x496e36) {
      this.boxEl.style.transform = _0x496e36;
      this.boxEl._lastTransform = _0x496e36;
    }
    this.boxEl.style.width = _0x4eb000.w + "px";
    this.boxEl.style.height = _0x4eb000.h + "px";
    this.boxEl.style.left = "0";
    this.boxEl.style.top = "0";
    if (this.sizeLabelEl) {
      const _0x4bc256 = Math.round(this.cropRect.w);
      const _0x2f0a13 = Math.round(this.cropRect.h);
      this.sizeLabelEl.textContent = _0x4bc256 + " × " + _0x2f0a13;
      const _0x5a7f74 = _0xfd6bcb.y + _0x4eb000.y - 32;
      const _0x3f2237 = _0xfd6bcb.x + _0x4eb000.x + _0x4eb000.w / 2;
      this.sizeLabelEl.style.top = _0x5a7f74 + "px";
      this.sizeLabelEl.style.left = _0x3f2237 + "px";
    }
    if (this.toolbarEl) {
      const _0x35d1b1 = _0xfd6bcb.y + _0x1c4f3c.h + _0x5a51d0.zoom * 14;
      const _0x4437af = _0xfd6bcb.x + _0x1c4f3c.w / 2;
      this.toolbarEl.style.top = _0x35d1b1 + "px";
      this.toolbarEl.style.left = _0x4437af + "px";
      this.toolbarEl.style.transform = "translateX(-50%)";
    }
    if (this.dimMaskEl) {
      const _0x129b4c = _0xfd6bcb.x + _0x4eb000.x;
      const _0x5c18c6 = _0xfd6bcb.y + _0x4eb000.y;
      const _0x2b49ef = _0x4eb000.w;
      const _0x260951 = _0x4eb000.h;
      const _0xc8f513 = "polygon(\n        0% 0%, 100% 0%, 100% 100%, 0% 100%,\n        0% 0%,\n        " + _0x129b4c + "px " + _0x5c18c6 + "px,\n        " + _0x129b4c + "px " + (_0x5c18c6 + _0x260951) + "px,\n        " + (_0x129b4c + _0x2b49ef) + "px " + (_0x5c18c6 + _0x260951) + "px,\n        " + (_0x129b4c + _0x2b49ef) + "px " + _0x5c18c6 + "px,\n        " + _0x129b4c + "px " + _0x5c18c6 + "px\n      )";
      this.dimMaskEl.style.clipPath = _0xc8f513;
    }
  },
  _applyRedrawVisualState() {
    const _0x87eb90 = this._redrawSelection?.mode || "";
    const _0x22978a = _0x87eb90 === "armed" || _0x87eb90 === "dragging";
    const _0x1b716d = _0x87eb90 === "dragging";
    for (const _0x5a4ee3 of [this.overlayEl, this.dimMaskEl, this.sizeLabelEl]) {
      _0x5a4ee3?.classList?.toggle("is-redraw-armed", _0x22978a);
      _0x5a4ee3?.classList?.toggle("is-redraw-dragging", _0x1b716d);
    }
  },
  _isPointInsideNode(_0x4655b7) {
    if (!this.nodeData || !_0x4655b7) {
      return false;
    }
    return _0x4655b7.x >= this.nodeData.x && _0x4655b7.x <= this.nodeData.x + this.nodeData.width && _0x4655b7.y >= this.nodeData.y && _0x4655b7.y <= this.nodeData.y + this.nodeData.height;
  },
  _getWorldPointFromEvent(_0x154948) {
    const _0xc75cc7 = this._view?.viewport || {
      x: 0,
      y: 0,
      zoom: 1
    };
    return screenToWorld(_0x154948.clientX, _0x154948.clientY, _0xc75cc7);
  },
  _enterRedrawSelectionMode() {
    if (!this.active) {
      return;
    }
    const _0xb1c200 = this._redrawSelection?.mode || "";
    if (_0xb1c200 === "dragging") {
      return;
    }
    if (_0xb1c200 !== "armed") {
      this._redrawSelection = {
        mode: "armed",
        previousRect: {
          ...this.cropRect
        },
        pointerId: null,
        startPoint: null
      };
    }
    this._applyRedrawVisualState();
  },
  _exitRedrawSelectionMode({
    restore = true
  } = {}) {
    const _0x5dd835 = this._redrawSelection?.previousRect;
    this._redrawSelection = null;
    if (restore && _0x5dd835) {
      this.cropRect = {
        ..._0x5dd835
      };
      this._updateView(this._view);
    }
    this._applyRedrawVisualState();
  },
  _beginRedrawSelection(_0x424f44) {
    const _0x47925f = this._getWorldPointFromEvent(_0x424f44);
    if (!this._isPointInsideNode(_0x47925f)) {
      return false;
    }
    const _0x418abf = this._redrawSelection?.previousRect || {
      ...this.cropRect
    };
    this._redrawSelection = {
      mode: "dragging",
      previousRect: _0x418abf,
      pointerId: _0x424f44.pointerId,
      startPoint: _0x47925f,
      lastResult: null
    };
    this.cropRect = {
      x: _0x47925f.x,
      y: _0x47925f.y,
      w: 0,
      h: 0
    };
    this._applyRedrawVisualState();
    this._updateView(this._view);
    this.overlayEl?.setPointerCapture?.(_0x424f44.pointerId);
    return true;
  },
  _updateRedrawSelection(_0xd903c4) {
    const _0x3349a9 = this._redrawSelection;
    if (_0x3349a9?.mode !== "dragging") {
      return;
    }
    const _0x3c78f8 = this._getWorldPointFromEvent(_0xd903c4);
    const _0x2a366c = buildImageCropDragRect({
      startPoint: _0x3349a9.startPoint,
      currentPoint: _0x3c78f8,
      node: this.nodeData,
      aspectRatio: this.aspectRatio,
      minSize: IMAGE_CROP_MIN_SIZE
    });
    _0x3349a9.lastResult = _0x2a366c;
    if (_0x2a366c?.rect) {
      this.cropRect = {
        ..._0x2a366c.rect
      };
      this._updateView(this._view);
    }
  },
  _finishRedrawSelection(_0x20cf03, {
    cancel = false
  } = {}) {
    const _0xd2c622 = this._redrawSelection;
    if (_0xd2c622?.mode !== "dragging") {
      return;
    }
    if (!cancel) {
      this._updateRedrawSelection(_0x20cf03);
    }
    const _0xf57bbd = _0xd2c622.lastResult;
    const _0x4ade3f = _0xd2c622.previousRect;
    const _0x36f02a = !cancel && _0xf57bbd?.isValid && _0xf57bbd?.rect ? {
      ..._0xf57bbd.rect
    } : _0x4ade3f;
    this._redrawSelection = null;
    if (_0x36f02a) {
      this.cropRect = {
        ..._0x36f02a
      };
    }
    try {
      this.overlayEl?.releasePointerCapture?.(_0xd2c622.pointerId);
    } catch {}
    this._applyRedrawVisualState();
    this._updateView(this._view);
  },
  _bindEvents() {
    const _0xaf1a61 = _0x4dda0c => _0x4dda0c.stopPropagation();
    this.overlayEl.addEventListener("wheel", _0xaf1a61, {
      passive: false
    });
    const _0x407299 = () => this._updateView(this._view);
    window.addEventListener("resize", _0x407299);
    let _0xe27c8b = false;
    let _0x5d7db2 = {
      x: 0,
      y: 0
    };
    let _0x5162a5 = {
      ...this.cropRect
    };
    let _0x56a2f9 = null;
    const _0x1ac86c = _0x15192d => {
      if (_0x15192d.key === "Escape") {
        if (this._redrawSelection?.mode === "dragging") {
          this._finishRedrawSelection(_0x15192d, {
            cancel: true
          });
          return;
        }
        this.exit();
        return;
      }
      if (_0x15192d.key === "Control" && !_0xe27c8b && !_0x56a2f9) {
        this._enterRedrawSelectionMode();
      }
    };
    window.addEventListener("keydown", _0x1ac86c);
    const _0xa3daa3 = _0x8006f => {
      if (_0x8006f.key !== "Control") {
        return;
      }
      if (this._redrawSelection?.mode === "armed") {
        this._exitRedrawSelectionMode({
          restore: true
        });
      }
    };
    window.addEventListener("keyup", _0xa3daa3);
    const _0xca3a57 = _0x476c91 => {
      if (!_0x476c91.ctrlKey || _0xe27c8b || _0x56a2f9) {
        return;
      }
      if (!this._beginRedrawSelection(_0x476c91)) {
        return;
      }
      _0x476c91.preventDefault();
      _0x476c91.stopPropagation();
    };
    const _0x125821 = _0x1da656 => {
      if (this._redrawSelection?.mode !== "dragging" || this._redrawSelection.pointerId !== _0x1da656.pointerId) {
        return;
      }
      _0x1da656.preventDefault();
      _0x1da656.stopPropagation();
      this._updateRedrawSelection(_0x1da656);
    };
    const _0x142b8a = _0x3b5822 => {
      if (this._redrawSelection?.mode !== "dragging" || this._redrawSelection.pointerId !== _0x3b5822.pointerId) {
        return;
      }
      _0x3b5822.preventDefault();
      _0x3b5822.stopPropagation();
      this._finishRedrawSelection(_0x3b5822);
    };
    const _0x506ef0 = _0x16ef09 => {
      if (this._redrawSelection?.mode !== "dragging" || this._redrawSelection.pointerId !== _0x16ef09.pointerId) {
        return;
      }
      _0x16ef09.preventDefault();
      _0x16ef09.stopPropagation();
      this._finishRedrawSelection(_0x16ef09, {
        cancel: true
      });
    };
    this.overlayEl.addEventListener("pointerdown", _0xca3a57, true);
    this.overlayEl.addEventListener("pointermove", _0x125821, true);
    this.overlayEl.addEventListener("pointerup", _0x142b8a, true);
    this.overlayEl.addEventListener("pointercancel", _0x506ef0, true);
    this.boxEl.addEventListener("pointerdown", _0x1c5057 => {
      if (_0x1c5057.target.classList.contains("v2-crop-handle")) {
        return;
      }
      if (_0x1c5057.ctrlKey) {
        return;
      }
      _0x1c5057.stopPropagation();
      _0xe27c8b = true;
      _0x5d7db2 = {
        x: _0x1c5057.clientX,
        y: _0x1c5057.clientY
      };
      _0x5162a5 = {
        ...this.cropRect
      };
      this.boxEl.setPointerCapture(_0x1c5057.pointerId);
    });
    this.boxEl.addEventListener("pointermove", _0x23701b => {
      if (!_0xe27c8b) {
        return;
      }
      const _0x20b06a = this._view?.viewport?.zoom || 1;
      const _0x124afb = (_0x23701b.clientX - _0x5d7db2.x) / _0x20b06a;
      const _0x1bbdca = (_0x23701b.clientY - _0x5d7db2.y) / _0x20b06a;
      let _0x3e5fc9 = _0x5162a5.x + _0x124afb;
      let _0x4aa47d = _0x5162a5.y + _0x1bbdca;
      const _0x5bbaed = IMAGE_CROP_MIN_SIZE;
      const _0xbd1e3a = IMAGE_CROP_MIN_SIZE;
      _0x3e5fc9 = Math.max(this.nodeData.x, Math.min(_0x3e5fc9, this.nodeData.x + this.nodeData.width - this.cropRect.w));
      _0x4aa47d = Math.max(this.nodeData.y, Math.min(_0x4aa47d, this.nodeData.y + this.nodeData.height - this.cropRect.h));
      this.cropRect.x = _0x3e5fc9;
      this.cropRect.y = _0x4aa47d;
      this._updateView(this._view);
    });
    const _0x5f0bf8 = () => {
      _0xe27c8b = false;
    };
    this.boxEl.addEventListener("pointerup", _0x5f0bf8);
    this.boxEl.addEventListener("pointercancel", _0x5f0bf8);
    this.boxEl.addEventListener("pointerdown", _0x2df8e1 => {
      const _0x61beb8 = _0x2df8e1.target.closest(".v2-crop-handle");
      if (!_0x61beb8) {
        return;
      }
      if (_0x2df8e1.ctrlKey) {
        return;
      }
      _0x2df8e1.stopPropagation();
      _0x56a2f9 = _0x61beb8.dataset.handle;
      _0x5d7db2 = {
        x: _0x2df8e1.clientX,
        y: _0x2df8e1.clientY
      };
      _0x5162a5 = {
        ...this.cropRect
      };
      _0x61beb8.setPointerCapture(_0x2df8e1.pointerId);
    });
    this.boxEl.addEventListener("pointermove", _0xa4f10 => {
      if (!_0x56a2f9) {
        return;
      }
      const _0x26a5f2 = this._view?.viewport?.zoom || 1;
      const _0x1fe9f0 = (_0xa4f10.clientX - _0x5d7db2.x) / _0x26a5f2;
      const _0x594dd0 = (_0xa4f10.clientY - _0x5d7db2.y) / _0x26a5f2;
      let {
        x: _0x4771de,
        y: _0x5d7668,
        w: _0x3f2efc,
        h: _0x329fb5
      } = _0x5162a5;
      const _0x35561e = (_0x461f54, _0x1a5bac) => {
        const _0x11ed2b = IMAGE_CROP_MIN_SIZE;
        if (_0x1a5bac) {
          const _0x1e235a = _0x5162a5.x + _0x5162a5.w - _0x11ed2b;
          _0x4771de = Math.max(this.nodeData.x, Math.min(_0x5162a5.x + _0x1fe9f0, _0x1e235a));
          _0x3f2efc = _0x5162a5.w - (_0x4771de - _0x5162a5.x);
        } else {
          _0x3f2efc = Math.max(_0x11ed2b, Math.min(_0x461f54, this.nodeData.x + this.nodeData.width - _0x4771de));
        }
      };
      const _0x5cf06c = (_0x34f01e, _0x59c47b) => {
        const _0x4d98af = IMAGE_CROP_MIN_SIZE;
        if (_0x59c47b) {
          const _0x4d13c1 = _0x5162a5.y + _0x5162a5.h - _0x4d98af;
          _0x5d7668 = Math.max(this.nodeData.y, Math.min(_0x5162a5.y + _0x594dd0, _0x4d13c1));
          _0x329fb5 = _0x5162a5.h - (_0x5d7668 - _0x5162a5.y);
        } else {
          _0x329fb5 = Math.max(_0x4d98af, Math.min(_0x34f01e, this.nodeData.y + this.nodeData.height - _0x5d7668));
        }
      };
      if (_0x56a2f9.includes("r")) {
        _0x35561e(_0x5162a5.w + _0x1fe9f0, false);
      }
      if (_0x56a2f9.includes("l")) {
        _0x35561e(_0x5162a5.w - _0x1fe9f0, true);
      }
      if (_0x56a2f9.includes("b")) {
        _0x5cf06c(_0x5162a5.h + _0x594dd0, false);
      }
      if (_0x56a2f9.includes("t")) {
        _0x5cf06c(_0x5162a5.h - _0x594dd0, true);
      }
      if (this.aspectRatio) {
        if (_0x56a2f9 === "tm" || _0x56a2f9 === "bm" || _0x56a2f9 === "lm" || _0x56a2f9 === "rm") {
          if (_0x56a2f9.includes("m")) {
            if (_0x56a2f9 === "tm" || _0x56a2f9 === "bm") {
              _0x3f2efc = _0x329fb5 * this.aspectRatio;
              _0x4771de = _0x5162a5.x + (_0x5162a5.w - _0x3f2efc) / 2;
            } else {
              _0x329fb5 = _0x3f2efc / this.aspectRatio;
              _0x5d7668 = _0x5162a5.y + (_0x5162a5.h - _0x329fb5) / 2;
            }
          }
        } else {
          const _0x90fda7 = _0x3f2efc / _0x329fb5;
          if (_0x90fda7 > this.aspectRatio) {
            _0x329fb5 = _0x3f2efc / this.aspectRatio;
          } else {
            _0x3f2efc = _0x329fb5 * this.aspectRatio;
          }
          if (_0x56a2f9.includes("t")) {
            _0x5d7668 = _0x5162a5.y + _0x5162a5.h - _0x329fb5;
          }
          if (_0x56a2f9.includes("l")) {
            _0x4771de = _0x5162a5.x + _0x5162a5.w - _0x3f2efc;
          }
        }
        if (_0x4771de < this.nodeData.x) {
          _0x4771de = this.nodeData.x;
          _0x3f2efc = _0x329fb5 * this.aspectRatio;
        }
        if (_0x5d7668 < this.nodeData.y) {
          _0x5d7668 = this.nodeData.y;
          _0x329fb5 = _0x3f2efc / this.aspectRatio;
        }
        if (_0x4771de + _0x3f2efc > this.nodeData.x + this.nodeData.width) {
          _0x3f2efc = this.nodeData.x + this.nodeData.width - _0x4771de;
          _0x329fb5 = _0x3f2efc / this.aspectRatio;
        }
        if (_0x5d7668 + _0x329fb5 > this.nodeData.y + this.nodeData.height) {
          _0x329fb5 = this.nodeData.y + this.nodeData.height - _0x5d7668;
          _0x3f2efc = _0x329fb5 * this.aspectRatio;
        }
      }
      this.cropRect = {
        x: _0x4771de,
        y: _0x5d7668,
        w: _0x3f2efc,
        h: _0x329fb5
      };
      this._updateView();
    });
    const _0x1b2640 = () => {
      _0x56a2f9 = null;
    };
    this.boxEl.addEventListener("pointerup", _0x1b2640);
    this.boxEl.addEventListener("pointercancel", _0x1b2640);
    this.toolbarEl.querySelector(".exit").onclick = () => this.exit();
    const _0x1207fc = this.toolbarEl.querySelector(".ratio-toggle");
    _0x1207fc.onclick = _0x42cfd2 => {
      _0x42cfd2.stopPropagation();
      this.ratioMenuEl.classList.toggle("open");
    };
    this.ratioMenuEl.onclick = _0x4e1834 => {
      const _0x383f3f = _0x4e1834.target.closest(".v2-crop-ratio-item");
      if (!_0x383f3f) {
        return;
      }
      this.ratioMenuEl.querySelectorAll(".v2-crop-ratio-item").forEach(_0x160d19 => _0x160d19.classList.remove("active"));
      _0x383f3f.classList.add("active");
      this.ratioMenuEl.classList.remove("open");
      const _0x25679b = _0x383f3f.dataset.ratio;
      const _0x63d866 = _0x383f3f.querySelector(".floating-menu-label")?.textContent || _0x383f3f.textContent;
      this.toolbarEl.querySelector(".ratio-text").textContent = _0x63d866;
      if (_0x25679b === "free") {
        this.aspectRatio = null;
        this._updateView(this._view);
        return;
      }
      if (_0x25679b === "original") {
        this.aspectRatio = this.nodeData.width / this.nodeData.height;
      } else {
        const [_0x4dccaa, _0x2854a2] = _0x25679b.split(":").map(Number);
        if (!Number.isFinite(_0x4dccaa) || !Number.isFinite(_0x2854a2) || _0x4dccaa <= 0 || _0x2854a2 <= 0) {
          this.aspectRatio = null;
          this._updateView(this._view);
          return;
        }
        this.aspectRatio = _0x4dccaa / _0x2854a2;
      }
      let _0x22c313 = this.cropRect.w;
      let _0x4b02e5 = _0x22c313 / this.aspectRatio;
      if (_0x4b02e5 > this.nodeData.height) {
        _0x4b02e5 = this.nodeData.height;
        _0x22c313 = _0x4b02e5 * this.aspectRatio;
      }
      if (_0x22c313 > this.nodeData.width) {
        _0x22c313 = this.nodeData.width;
        _0x4b02e5 = _0x22c313 / this.aspectRatio;
      }
      this.cropRect.w = _0x22c313;
      this.cropRect.h = _0x4b02e5;
      this.cropRect.x = this.nodeData.x + (this.nodeData.width - _0x22c313) / 2;
      this.cropRect.y = this.nodeData.y + (this.nodeData.height - _0x4b02e5) / 2;
      this._updateView(this._view);
    };
    this.toolbarEl.querySelector(".confirm").onclick = () => this.confirm();
    const _0x233da3 = _0xcc3527 => {
      if (!this.ratioMenuEl.contains(_0xcc3527.target) && !_0x1207fc.contains(_0xcc3527.target)) {
        this.ratioMenuEl.classList.remove("open");
      }
    };
    document.addEventListener("pointerdown", _0x233da3);
    this.cleanup = () => {
      window.removeEventListener("resize", _0x407299);
      window.removeEventListener("keydown", _0x1ac86c);
      window.removeEventListener("keyup", _0xa3daa3);
      document.removeEventListener("pointerdown", _0x233da3);
      this.overlayEl.removeEventListener("wheel", _0xaf1a61);
      this.overlayEl.removeEventListener("pointerdown", _0xca3a57, true);
      this.overlayEl.removeEventListener("pointermove", _0x125821, true);
      this.overlayEl.removeEventListener("pointerup", _0x142b8a, true);
      this.overlayEl.removeEventListener("pointercancel", _0x506ef0, true);
    };
  },
  _subscribeLocaleChanges() {
    if (this._unsubscribeLocale) {
      return;
    }
    this._unsubscribeLocale = onLocaleChange(() => this._syncLocaleTexts());
  },
  _setButtonText(_0x5e4357, _0x2b925c) {
    if (!_0x5e4357) {
      return;
    }
    const _0x420e75 = Array.from(_0x5e4357.childNodes).find(_0x2c13b9 => _0x2c13b9.nodeType === 3);
    if (_0x420e75) {
      _0x420e75.textContent = " " + _0x2b925c;
      return;
    }
    _0x5e4357.appendChild(document.createTextNode(" " + _0x2b925c));
  },
  _syncLocaleTexts() {
    if (!this.toolbarEl) {
      return;
    }
    const _0x34afd6 = this.toolbarEl.querySelector(".exit");
    if (_0x34afd6) {
      _0x34afd6.title = imageCropText("actions.exit");
    }
    this.ratioMenuEl?.querySelectorAll(".v2-crop-ratio-item[data-ratio-label-key]").forEach(_0x43087f => {
      const _0x367e73 = _0x43087f.dataset.ratioLabelKey;
      const _0x166875 = _0x43087f.querySelector(".floating-menu-label");
      if (_0x367e73 && _0x166875) {
        _0x166875.textContent = imageCropText("ratios." + _0x367e73);
      }
    });
    const _0x3fbd27 = this.ratioMenuEl?.querySelector(".v2-crop-ratio-item.active .floating-menu-label");
    const _0x1c1faa = this.toolbarEl.querySelector(".ratio-text");
    if (_0x3fbd27 && _0x1c1faa) {
      _0x1c1faa.textContent = _0x3fbd27.textContent;
    }
    const _0x17e1c0 = this.toolbarEl.querySelector(".confirm");
    if (_0x17e1c0 && !this._isProcessingCrop) {
      this._setButtonText(_0x17e1c0, imageCropText("actions.confirm"));
    }
  },
  exit() {
    if (!this.active) {
      return;
    }
    this.active = false;
    this._isProcessingCrop = false;
    if (this._unsubscribe) {
      this._unsubscribe();
      this._unsubscribe = null;
    }
    if (this._unsubscribeLocale) {
      this._unsubscribeLocale();
      this._unsubscribeLocale = null;
    }
    this._containerEl = null;
    if (this.boxEl) {
      this.boxEl._lastTransform = null;
    }
    if (this.overlayEl) {
      this.overlayEl.classList.remove("visible");
    }
    if (this.dimMaskEl) {
      this.dimMaskEl.classList.remove("visible");
    }
    setTimeout(() => {
      if (this.overlayEl) {
        this.overlayEl.remove();
      }
      if (this.toolbarEl) {
        this.toolbarEl.remove();
      }
      if (this.dimMaskEl) {
        this.dimMaskEl.remove();
      }
      if (this.sizeLabelEl) {
        this.sizeLabelEl.remove();
      }
      this.cleanup?.();
      this.overlayEl = null;
      this.boxEl = null;
      this.toolbarEl = null;
      this.ratioMenuEl = null;
      this.dimMaskEl = null;
      this.sizeLabelEl = null;
      this._view = null;
      this._redrawSelection = null;
    }, 300);
  },
  async confirm() {
    const _0x53aa45 = this.nodeData;
    if (!_0x53aa45) {
      return;
    }
    const _0x9a235b = this.toolbarEl?.querySelector(".confirm");
    if (!_0x9a235b) {
      return;
    }
    const _0x439f2a = Array.from(_0x9a235b.childNodes).map(_0x4deead => _0x4deead.cloneNode(true));
    this._isProcessingCrop = true;
    _0x9a235b.textContent = imageCropText("actions.processing");
    _0x9a235b.style.pointerEvents = "none";
    const _0x32746f = Date.now();
    let _0x3351e6 = "";
    let _0x20fab5 = false;
    let _0x4e4056 = false;
    let _0xe0af8c = "";
    let _0x584ede = null;
    try {
      const _0x5608a1 = {
        ...this.cropRect
      };
      const _0x3e6645 = _0x53aa45.id;
      const _0x2e3676 = _0x53aa45.name || imageCropText("output.imageFallback");
      const _0x12fd3d = imageCropText("output.nodeName", {
        name: _0x2e3676
      });
      const _0x2015be = getAutoMediaSizeByShortSide(_0x5608a1.w, _0x5608a1.h);
      const _0x399a93 = calcSafeSpawnPosNearNode(a996_0x4e3419.getStateRaw().nodes, _0x53aa45, _0x2015be.width, _0x2015be.height);
      _0x3351e6 = generateId("source-image-crop");
      addToolbarPendingResultNodes({
        nodes: [buildSourceMediaNodePayload({
          id: _0x3351e6,
          type: "source-image",
          x: _0x399a93.x,
          y: _0x399a93.y,
          width: _0x2015be.width,
          height: _0x2015be.height,
          name: _0x12fd3d,
          src: "",
          outputText: imageCropText("actions.processing"),
          ...buildGenerationStartPatch({
            startedAt: _0x32746f
          }),
          needsAutoResize: false,
          fixedSize: true
        })],
        persist: false
      });
      const _0x50fc82 = resolveImageCropSourceUrl(_0x53aa45);
      const _0x331ff9 = findLoadedCropImageElement(_0x3e6645);
      this.exit();
      _0x20fab5 = true;
      await waitForCropBackgroundFrame();
      if (!_0x331ff9 && !_0x50fc82) {
        throw new Error(imageCropText("errors.sourceLoadFailed"));
      }
      const _0x3457c3 = _0x331ff9 || (await this._loadImage(_0x50fc82));
      const _0x1bc963 = _0x3457c3.naturalWidth / _0x53aa45.width;
      const _0x1c15c8 = _0x3457c3.naturalHeight / _0x53aa45.height;
      const _0x563d50 = (_0x5608a1.x - _0x53aa45.x) * _0x1bc963;
      const _0x35a5f9 = (_0x5608a1.y - _0x53aa45.y) * _0x1c15c8;
      const _0x28b3f = _0x5608a1.w * _0x1bc963;
      const _0x5427cc = _0x5608a1.h * _0x1c15c8;
      const _0x89612d = buildImageCropOutputSize(_0x28b3f, _0x5427cc);
      const _0x225292 = document.createElement("canvas");
      _0x225292.width = _0x89612d.width;
      _0x225292.height = _0x89612d.height;
      const _0x143989 = _0x225292.getContext("2d");
      _0x143989.drawImage(_0x3457c3, _0x563d50, _0x35a5f9, _0x28b3f, _0x5427cc, 0, 0, _0x89612d.width, _0x89612d.height);
      const _0x48b307 = await new Promise(_0x5dd862 => _0x225292.toBlob(_0x5dd862, "image/jpeg", 0.9));
      if (!_0x48b307) {
        throw new Error(imageCropText("errors.sourceLoadFailed"));
      }
      const _0x2a260d = new File([_0x48b307], "crop_" + Date.now() + ".jpg", {
        type: "image/jpeg"
      });
      _0xe0af8c = URL.createObjectURL(_0x48b307);
      _0x584ede = Math.max(0, Date.now() - _0x32746f);
      const _0x525de4 = buildImageGenerationResultPatch({
        imageUrl: _0xe0af8c,
        sourceUrl: _0xe0af8c,
        fileName: _0x2a260d.name
      }, {
        duration: _0x584ede
      }) || {};
      const _0x4f90f6 = {
        outputType: "image",
        url: _0xe0af8c,
        imageUrl: _0xe0af8c,
        sourceUrl: _0xe0af8c,
        thumbUrl: "",
        localPath: "",
        fileName: _0x2a260d.name
      };
      updateToolbarResultNode(_0x3351e6, {
        name: _0x12fd3d,
        ..._0x525de4,
        images: [_0x4f90f6],
        src: _0xe0af8c,
        imageUrl: _0xe0af8c,
        sourceUrl: _0xe0af8c,
        thumbUrl: "",
        capturePreviewUrl: _0xe0af8c,
        captureSavePending: true,
        captureSaveError: null,
        localPath: "",
        fileName: _0x2a260d.name,
        outputText: "",
        needsAutoResize: false,
        fixedSize: true
      });
      _0x4e4056 = true;
      await waitForCropBackgroundFrame();
      const _0x3b3b8d = await saveOutputBlob(_0x2a260d, {
        ext: "jpg"
      });
      const _0x58a9da = pickResultLocalPath(_0x3b3b8d);
      const _0x43cdb8 = _0x3b3b8d.filename || _0x2a260d.name;
      const _0x42e749 = buildCanvasLocalImageFields({
        ..._0x3b3b8d,
        localPath: _0x58a9da,
        imageUrl: _0x3b3b8d.displayUrl || _0x3b3b8d.thumbUrl || localPathToUrl(_0x58a9da) || String(_0x3b3b8d.url || "").trim(),
        sourceUrl: _0x3b3b8d.originalUrl || _0x3b3b8d.url || localPathToUrl(_0x58a9da),
        thumbUrl: _0x3b3b8d.thumbUrl,
        fileName: _0x43cdb8
      }, {
        includeSrc: true
      });
      const _0x34916a = _0x42e749.src || _0x42e749.imageUrl || localPathToUrl(_0x58a9da) || String(_0x3b3b8d.url || "").trim();
      updateToolbarResultNode(_0x3351e6, {
        name: _0x12fd3d,
        ...(buildImageGenerationResultPatch({
          ..._0x3b3b8d,
          ..._0x42e749,
          imageUrl: _0x42e749.imageUrl || _0x34916a,
          sourceUrl: _0x42e749.sourceUrl || _0x34916a,
          thumbUrl: _0x42e749.thumbUrl || _0x34916a,
          localPath: _0x42e749.localPath || _0x58a9da,
          fileName: _0x43cdb8
        }, {
          duration: _0x584ede
        }) || {}),
        ..._0x42e749,
        src: _0x34916a,
        localPath: _0x42e749.localPath || _0x58a9da,
        capturePreviewUrl: "",
        captureSavePending: false,
        captureSaveError: null,
        fileName: _0x43cdb8,
        outputText: "",
        needsAutoResize: false,
        fixedSize: true
      });
      persistToolbarResultNodes();
      if (_0xe0af8c) {
        URL.revokeObjectURL(_0xe0af8c);
        _0xe0af8c = "";
      }
      window.showToast?.(imageCropText("toasts.success"), "success");
    } catch (_0x2de503) {
      console.error("[Crop] Failed:", _0x2de503);
      const _0x5183d4 = _0x2de503 instanceof Error ? _0x2de503.message : String(_0x2de503 || "");
      if (_0x3351e6) {
        updateToolbarResultNode(_0x3351e6, {
          ...(buildImageGenerationFailurePatch({
            error: _0x5183d4,
            startedAt: _0x32746f,
            clearMediaFields: !_0x4e4056
          }) || {}),
          captureSavePending: false,
          captureSaveError: _0x5183d4,
          ...(_0x4e4056 ? {} : {
            capturePreviewUrl: ""
          })
        });
        persistToolbarResultNodes();
      }
      window.showToast?.(imageCropText("toasts.failed", {
        error: _0x5183d4
      }), "error");
      this._isProcessingCrop = false;
      if (!_0x20fab5 && _0x9a235b.isConnected) {
        _0x9a235b.replaceChildren(..._0x439f2a.map(_0x5707ff => _0x5707ff.cloneNode(true)));
        _0x9a235b.style.pointerEvents = "auto";
      }
    }
  },
  _loadImage(_0x2766e5) {
    return new Promise((_0x1d1778, _0x5615ef) => {
      const _0x9cfe11 = new Image();
      _0x9cfe11.crossOrigin = "anonymous";
      _0x9cfe11.onload = () => _0x1d1778(_0x9cfe11);
      _0x9cfe11.onerror = () => _0x5615ef(new Error(imageCropText("errors.sourceLoadFailed")));
      _0x9cfe11.src = _0x2766e5;
    });
  }
};
export default ImageCropController;