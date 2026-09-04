import { calcWorldBounds, getViewportScreenBounds } from "../core/math.js";
import { readViewportInteractionState } from "../core/viewportInteractionState.js";
import { recordMinimapUpdateSample } from "./perf/perfProbe.js";
import { isNodeType } from "./registry.js";
const PAN_PREVIEW_MIN_INTERVAL_MS = 96;
const PAN_NODE_UPDATE_DELAY_MS = 180;
export function initMinimap(_0x49e51a, _0x108018) {
  const _0x2ed0b0 = document.getElementById("minimapViewport");
  const _0x443341 = document.getElementById("minimapWrapper");
  if (!_0x49e51a || !_0x2ed0b0 || !_0x443341) {
    return;
  }
  const _0x10eb47 = new Map();
  let _0x3a98ed = null;
  let _0x35b866 = 1;
  let _0x1e07ec = 0;
  let _0x5b765d = 0;
  let _0x5a26d8 = 0;
  let _0x48d9ca = 0;
  let _0x24e024 = -1;
  let _0x37e31b = false;
  let _0x4e7157 = 0;
  let _0xdd638b = 0;
  let _0x48db7d = 1;
  let _0x29b43f = "";
  let _0x12ff9e = Number(_0x49e51a.clientWidth) || 200;
  let _0x17e4b2 = Number(_0x49e51a.clientHeight) || 140;
  let _0x369e07 = null;
  let _0x23117c = null;
  let _0x37d092 = null;
  let _0x299c96 = null;
  let _0x245134 = null;
  let _0x46121e = null;
  let _0x1af3f5 = null;
  let _0x41c4c5 = 0;
  let _0x37ff2e = 0;
  let _0x32389e = false;
  function _0xfd56f5() {
    if (typeof performance !== "undefined" && performance && typeof performance.now === "function") {
      return performance.now();
    } else {
      return Date.now();
    }
  }
  function _0x3a9067(_0x4ac54e) {
    const _0x1d0209 = Number(_0x4ac54e?._nodeCount);
    if (Number.isFinite(_0x1d0209)) {
      return _0x1d0209;
    }
    return Object.keys(_0x4ac54e?.nodes || {}).length;
  }
  function _0x21f54e() {
    return readViewportInteractionState().isPanning;
  }
  function _0x4ea1ef(_0x48532e) {
    if (typeof requestAnimationFrame === "function") {
      return requestAnimationFrame(_0x48532e);
    }
    return setTimeout(_0x48532e, 16);
  }
  function _0x2dc146(_0x446bd3) {
    if (!_0x446bd3) {
      return;
    }
    if (typeof cancelAnimationFrame === "function") {
      cancelAnimationFrame(_0x446bd3);
      return;
    }
    clearTimeout(_0x446bd3);
  }
  function _0x5764d9() {
    return {
      mapW: _0x12ff9e,
      mapH: _0x17e4b2
    };
  }
  function _0x1e8409(_0x33e10c) {
    const _0x4b0b75 = Array.isArray(_0x33e10c?.contentBoxSize) ? _0x33e10c.contentBoxSize[0] : _0x33e10c?.contentBoxSize;
    return {
      width: Number(_0x4b0b75?.inlineSize) || Number(_0x33e10c?.contentRect?.width),
      height: Number(_0x4b0b75?.blockSize) || Number(_0x33e10c?.contentRect?.height)
    };
  }
  function _0x350d4d(_0xdf5c4f, _0x4b4b5a) {
    const _0x50f87c = Number(_0xdf5c4f);
    const _0x16d9ac = Number(_0x4b4b5a);
    if (!(_0x50f87c > 0) || !(_0x16d9ac > 0)) {
      return;
    }
    if (_0x50f87c === _0x12ff9e && _0x16d9ac === _0x17e4b2) {
      return;
    }
    _0x12ff9e = _0x50f87c;
    _0x17e4b2 = _0x16d9ac;
    _0x3a98ed = null;
    _0x2a035c("both");
  }
  function _0x21520f(_0x2e6124) {
    if (_0x2e6124 && _0x2e6124.width !== 0) {
      return _0x2e6124;
    }
    return {
      minX: -1000,
      minY: -1000,
      maxX: 1000,
      maxY: 1000,
      width: 2000,
      height: 2000
    };
  }
  function _0x3debe3(_0x46a9b5) {
    const _0x1ddd62 = Number(_0x46a9b5?._nodeCount);
    if (Number.isFinite(_0x1ddd62)) {
      return _0x1ddd62 <= 0;
    }
    return !_0x46a9b5?.nodes || Object.keys(_0x46a9b5.nodes).length === 0;
  }
  function _0x3b8617(_0x558967) {
    return {
      x: Number.isFinite(Number(_0x558967?.x)) ? Number(_0x558967.x) : 0,
      y: Number.isFinite(Number(_0x558967?.y)) ? Number(_0x558967.y) : 0,
      zoom: Number.isFinite(Number(_0x558967?.zoom)) ? Number(_0x558967.zoom) : 1
    };
  }
  function _0x3e3c31(_0x59a17a) {
    const _0x5b09b5 = Number(_0x59a17a);
    if (Number.isFinite(_0x5b09b5)) {
      return Math.round(_0x5b09b5 * 100) / 100;
    } else {
      return 0;
    }
  }
  function _0x7db9e7(_0x16848e = {}) {
    let _0x3a95f6 = "";
    for (const _0x1af385 of Object.values(_0x16848e || {})) {
      if (!_0x1af385 || isNodeType(_0x1af385, "group")) {
        continue;
      }
      _0x3a95f6 += [_0x1af385.id || "", _0x1af385.type || "", _0x3e3c31(_0x1af385.x), _0x3e3c31(_0x1af385.y), _0x3e3c31(_0x1af385.width || 200), _0x3e3c31(_0x1af385.height || 100)].join(":");
      _0x3a95f6 += "|";
    }
    return _0x3a95f6;
  }
  function _0x4b6988(_0x41879e, _0x4dd8a8, _0x3ca9e2 = {}) {
    const _0x1792c6 = _0x21520f(_0x41879e);
    const {
      mapW: _0x231eac,
      mapH: _0x45b0f6
    } = _0x5764d9();
    const _0x981186 = Math.max(_0x1792c6.width, 1000);
    const _0x52948f = Math.max(_0x1792c6.height, 1000);
    const _0x59296c = Math.min(_0x231eac / _0x981186, _0x45b0f6 / _0x52948f);
    const _0x689f02 = (_0x231eac - _0x981186 * _0x59296c) / 2;
    const _0x32ba0d = (_0x45b0f6 - _0x52948f * _0x59296c) / 2;
    _0x3a98ed = _0x1792c6;
    _0x35b866 = _0x59296c;
    _0x1e07ec = _0x689f02;
    _0x5b765d = _0x32ba0d;
    _0x5a26d8 = _0x231eac;
    _0x48d9ca = _0x45b0f6;
    _0x24e024 = Number.isFinite(_0x4dd8a8) ? _0x4dd8a8 : -1;
    _0x37e31b = _0x3ca9e2.trackViewport === true;
    const _0x5a77b8 = _0x3b8617(_0x3ca9e2.viewport);
    _0x4e7157 = _0x5a77b8.x;
    _0xdd638b = _0x5a77b8.y;
    _0x48db7d = _0x5a77b8.zoom;
    window._v2MinimapScale = _0x59296c;
    return {
      bounds: _0x1792c6,
      scale: _0x59296c,
      offsetX: _0x689f02,
      offsetY: _0x32ba0d,
      mapW: _0x231eac,
      mapH: _0x45b0f6
    };
  }
  function _0x193d5e(_0x1c8d9a) {
    const _0x38fc30 = _0x3debe3(_0x1c8d9a);
    const _0x4360b2 = calcWorldBounds(_0x1c8d9a?.nodes || {}, _0x1c8d9a?.viewport);
    return _0x4b6988(_0x4360b2, _0x1c8d9a?._persistRev, {
      trackViewport: _0x38fc30,
      viewport: _0x38fc30 ? _0x1c8d9a?.viewport : null
    });
  }
  function _0x3d4186(_0x3357d9, {
    allowCached = true
  } = {}) {
    const _0x26242f = Number.isFinite(_0x3357d9?._persistRev) ? _0x3357d9._persistRev : -1;
    const _0x500e99 = _0x3debe3(_0x3357d9);
    const _0x4a8c4c = _0x3b8617(_0x3357d9?.viewport);
    const {
      mapW: _0x2da201,
      mapH: _0x1ac92d
    } = _0x5764d9();
    const _0x5c8430 = !!_0x3a98ed;
    const _0x13ab20 = _0x5c8430 && _0x24e024 === _0x26242f;
    const _0x48c8b6 = _0x5c8430 && _0x5a26d8 === _0x2da201 && _0x48d9ca === _0x1ac92d;
    const _0x446697 = _0x5c8430 && _0x37e31b === true && _0x500e99 === true && _0x4e7157 === _0x4a8c4c.x && _0xdd638b === _0x4a8c4c.y && _0x48db7d === _0x4a8c4c.zoom;
    if (allowCached && _0x13ab20 && (!_0x500e99 && !_0x37e31b || _0x446697)) {
      if (_0x48c8b6) {
        window._v2MinimapScale = _0x35b866;
        return {
          bounds: _0x3a98ed,
          scale: _0x35b866,
          offsetX: _0x1e07ec,
          offsetY: _0x5b765d,
          mapW: _0x2da201,
          mapH: _0x1ac92d
        };
      }
      return _0x4b6988(_0x3a98ed, _0x26242f, {
        trackViewport: _0x500e99,
        viewport: _0x500e99 ? _0x4a8c4c : null
      });
    }
    return _0x193d5e(_0x3357d9);
  }
  function _0x495527(_0xcb2290) {
    const _0x55459e = Number.isFinite(_0xcb2290?._persistRev) ? _0xcb2290._persistRev : -1;
    const _0x44b174 = _0x3debe3(_0xcb2290);
    if (_0x3a98ed && _0x24e024 === _0x55459e && !_0x44b174 && !_0x37e31b) {
      window._v2MinimapScale = _0x35b866;
      return {
        bounds: _0x3a98ed,
        scale: _0x35b866,
        offsetX: _0x1e07ec,
        offsetY: _0x5b765d,
        mapW: _0x5a26d8,
        mapH: _0x48d9ca
      };
    }
    return _0x3d4186(_0xcb2290, {
      allowCached: true
    });
  }
  function _0x15749a() {
    _0x299c96 = null;
    if (_0x21f54e()) {
      _0x299c96 = setTimeout(_0x15749a, PAN_NODE_UPDATE_DELAY_MS);
      return;
    }
    if (!_0x23117c) {
      _0x23117c = _0x4ea1ef(_0x14e29a);
    }
  }
  function _0x2a035c(_0x4db682) {
    if (!_0x37d092) {
      _0x37d092 = _0x4db682;
    } else if (_0x37d092 === "both" || _0x4db682 === "both") {
      _0x37d092 = "both";
    } else if (_0x37d092 !== _0x4db682) {
      _0x37d092 = "both";
    } else {
      _0x37d092 = _0x4db682;
    }
    if (_0x21f54e() && (_0x37d092 === "nodes" || _0x37d092 === "both")) {
      if (!_0x299c96) {
        _0x299c96 = setTimeout(_0x15749a, PAN_NODE_UPDATE_DELAY_MS);
      }
      return;
    }
    if (!_0x23117c) {
      _0x23117c = _0x4ea1ef(_0x14e29a);
    }
  }
  function _0x14e29a() {
    _0x23117c = null;
    const _0x3496ca = _0x37d092;
    _0x37d092 = null;
    if (!_0x3496ca) {
      return;
    }
    const _0xa07052 = _0x108018.getStateRaw();
    if (_0x3496ca === "nodes" || _0x3496ca === "both") {
      _0x2202c3(_0xa07052);
    } else {
      _0x3cdd97(_0xa07052);
    }
  }
  function _0x2202c3(_0x1df928) {
    const _0x4b1354 = _0xfd56f5();
    const _0x54339b = _0x1df928?.nodes || {};
    const _0x528932 = _0x1df928?.viewport || {
      x: 0,
      y: 0,
      zoom: 1
    };
    const _0x119095 = _0x7db9e7(_0x54339b);
    const _0x386042 = Number.isFinite(_0x1df928?._persistRev) ? _0x1df928._persistRev : -1;
    if (_0x3a98ed && _0x29b43f === _0x119095 && !_0x3debe3(_0x1df928)) {
      _0x24e024 = _0x386042;
      _0x10eb47.forEach(_0x343d6b => {
        if (_0x343d6b?.style?.transform) {
          _0x343d6b.style.transform = "";
        }
      });
      _0x63b56c(_0x528932, _0x3a98ed, _0x35b866, _0x1e07ec, _0x5b765d);
      recordMinimapUpdateSample("viewport", _0xfd56f5() - _0x4b1354, {
        nodeCount: _0x3a9067(_0x1df928),
        dotCount: _0x10eb47.size,
        viewportOnly: true
      });
      return;
    }
    const {
      bounds: _0x31c3e4,
      scale: _0x441a1e,
      offsetX: _0x507d10,
      offsetY: _0x22cfa9
    } = _0x193d5e(_0x1df928);
    const _0x45eec7 = new Set();
    let _0x40002c = 0;
    let _0x59269c = 0;
    let _0x2f800f = 0;
    window._v2MinimapDotMap = _0x10eb47;
    Object.values(_0x54339b).forEach(_0x5e9bce => {
      if (isNodeType(_0x5e9bce, "group")) {
        return;
      }
      _0x45eec7.add(_0x5e9bce.id);
      let _0x566933 = _0x10eb47.get(_0x5e9bce.id);
      const _0x8cff79 = _0x507d10 + (_0x5e9bce.x - _0x31c3e4.minX) * _0x441a1e;
      const _0x2904df = _0x22cfa9 + (_0x5e9bce.y - _0x31c3e4.minY) * _0x441a1e;
      const _0x48a63f = Math.max((_0x5e9bce.width || 200) * _0x441a1e, 2);
      const _0x371cde = Math.max((_0x5e9bce.height || 100) * _0x441a1e, 2);
      if (!_0x566933) {
        _0x566933 = document.createElement("div");
        _0x566933.id = "minimap-node-" + _0x5e9bce.id;
        _0x10eb47.set(_0x5e9bce.id, _0x566933);
        _0x49e51a.appendChild(_0x566933);
        _0x40002c += 1;
      } else {
        _0x59269c += 1;
      }
      let _0x18b60a = "default";
      const _0x4303da = _0x5e9bce.type || "";
      if (_0x4303da.includes("text")) {
        _0x18b60a = "text";
      } else if (_0x4303da.includes("image")) {
        _0x18b60a = "image";
      } else if (_0x4303da.includes("video")) {
        _0x18b60a = "video";
      } else if (_0x4303da.includes("audio")) {
        _0x18b60a = "audio";
      }
      if (_0x566933.className !== "minimap-node " + _0x18b60a) {
        _0x566933.className = "minimap-node " + _0x18b60a;
      }
      if (_0x566933.style.left !== _0x8cff79 + "px") {
        _0x566933.style.left = _0x8cff79 + "px";
      }
      if (_0x566933.style.top !== _0x2904df + "px") {
        _0x566933.style.top = _0x2904df + "px";
      }
      if (_0x566933.style.width !== _0x48a63f + "px") {
        _0x566933.style.width = _0x48a63f + "px";
      }
      if (_0x566933.style.height !== _0x371cde + "px") {
        _0x566933.style.height = _0x371cde + "px";
      }
      if (_0x566933.style.transform) {
        _0x566933.style.transform = "";
      }
    });
    _0x10eb47.forEach((_0x444223, _0x4fd012) => {
      if (!_0x45eec7.has(_0x4fd012)) {
        _0x444223.remove();
        _0x10eb47.delete(_0x4fd012);
        _0x2f800f += 1;
      }
    });
    _0x63b56c(_0x528932, _0x31c3e4, _0x441a1e, _0x507d10, _0x22cfa9);
    recordMinimapUpdateSample("nodes", _0xfd56f5() - _0x4b1354, {
      nodeCount: _0x3a9067(_0x1df928),
      dotCount: _0x10eb47.size,
      createdCount: _0x40002c,
      updatedCount: _0x59269c,
      removedCount: _0x2f800f,
      viewportOnly: false
    });
    _0x29b43f = _0x119095;
  }
  function _0x3cdd97(_0x57330d) {
    const _0x3fe139 = _0xfd56f5();
    const _0x23db29 = _0x57330d?.viewport || {
      x: 0,
      y: 0,
      zoom: 1
    };
    if (!_0x3a98ed) {
      _0x2202c3(_0x108018.getStateRaw());
      return;
    }
    const _0x343044 = Number.isFinite(_0x57330d?._persistRev) ? _0x57330d._persistRev : -1;
    if (_0x24e024 !== _0x343044) {
      _0x2202c3(_0x108018.getStateRaw());
      return;
    }
    const {
      bounds: _0x467735,
      scale: _0x555d12,
      offsetX: _0x160b21,
      offsetY: _0x2d4133
    } = _0x495527(_0x57330d);
    _0x63b56c(_0x23db29, _0x467735, _0x555d12, _0x160b21, _0x2d4133);
    recordMinimapUpdateSample("viewport", _0xfd56f5() - _0x3fe139, {
      nodeCount: _0x3a9067(_0x57330d),
      dotCount: _0x10eb47.size,
      viewportOnly: true
    });
  }
  function _0x63b56c(_0x2158b9, _0x23686b, _0x22e7d8, _0x2dbd9b, _0x134de9) {
    const _0x299c82 = getViewportScreenBounds(_0x2158b9, window.innerWidth, window.innerHeight);
    const _0x2644fd = _0x299c82.width / _0x2158b9.zoom;
    const _0xeb6645 = _0x299c82.height / _0x2158b9.zoom;
    const _0x22f920 = -_0x2158b9.x / _0x2158b9.zoom;
    const _0x46694d = -_0x2158b9.y / _0x2158b9.zoom;
    const _0x5348ce = _0x2dbd9b + (_0x22f920 - _0x23686b.minX) * _0x22e7d8;
    const _0x6690ca = _0x134de9 + (_0x46694d - _0x23686b.minY) * _0x22e7d8;
    const _0x6ad647 = _0x2644fd * _0x22e7d8;
    const _0x4138b6 = _0xeb6645 * _0x22e7d8;
    if (_0x2ed0b0.style.left !== _0x5348ce + "px") {
      _0x2ed0b0.style.left = _0x5348ce + "px";
    }
    if (_0x2ed0b0.style.top !== _0x6690ca + "px") {
      _0x2ed0b0.style.top = _0x6690ca + "px";
    }
    if (_0x2ed0b0.style.width !== _0x6ad647 + "px") {
      _0x2ed0b0.style.width = _0x6ad647 + "px";
    }
    if (_0x2ed0b0.style.height !== _0x4138b6 + "px") {
      _0x2ed0b0.style.height = _0x4138b6 + "px";
    }
  }
  function _0x548a5b() {
    if (_0x245134) {
      return;
    }
    _0x245134 = _0x4ea1ef(_0x5170d7);
  }
  function _0x5170d7() {
    _0x245134 = null;
    if (!_0x1af3f5) {
      return;
    }
    const _0xf84427 = _0x1af3f5;
    _0x1af3f5 = null;
    const _0x2a7f7d = _0x108018.getStateRaw();
    const _0x2f6d83 = {
      ..._0x2a7f7d,
      viewport: _0xf84427
    };
    const _0x39fff8 = _0xfd56f5();
    const {
      bounds: _0x171d06,
      scale: _0x1018cb,
      offsetX: _0x3d8bc4,
      offsetY: _0x2ca0e3
    } = _0x3d4186(_0x2f6d83, {
      allowCached: true
    });
    _0x63b56c(_0xf84427, _0x171d06, _0x1018cb, _0x3d8bc4, _0x2ca0e3);
    _0x41c4c5 = _0xfd56f5();
    _0x37ff2e += 1;
    recordMinimapUpdateSample("pan-preview", _0x41c4c5 - _0x39fff8, {
      nodeCount: _0x3a9067(_0x2a7f7d),
      dotCount: _0x10eb47.size,
      viewportOnly: true,
      delayed: _0x32389e
    });
    _0x32389e = false;
  }
  function _0x102329(_0x2aa969, _0x1b03c1 = {}) {
    _0x1af3f5 = _0x3b8617(_0x2aa969);
    const _0x147f8d = _0x1b03c1.force === true;
    const _0x21e429 = _0xfd56f5() - _0x41c4c5;
    const _0x287528 = _0x147f8d ? 0 : Math.max(0, PAN_PREVIEW_MIN_INTERVAL_MS - _0x21e429);
    if (_0x287528 <= 0) {
      if (_0x46121e) {
        clearTimeout(_0x46121e);
        _0x46121e = null;
      }
      _0x32389e = false;
      _0x548a5b();
      return;
    }
    if (!_0x46121e) {
      _0x32389e = true;
      _0x46121e = setTimeout(() => {
        _0x46121e = null;
        _0x548a5b();
      }, _0x287528);
    }
  }
  function _0x894438(_0xa9e80a = null) {
    if (_0xa9e80a) {
      _0x1af3f5 = _0x3b8617(_0xa9e80a);
    }
    if (_0x46121e) {
      clearTimeout(_0x46121e);
      _0x46121e = null;
    }
    if (_0x245134) {
      _0x2dc146(_0x245134);
      _0x245134 = null;
    }
    _0x5170d7();
    return _0x37ff2e;
  }
  const _0xc49c83 = (_0x30dec9, _0x424457 = {}) => _0x102329(_0x30dec9, _0x424457);
  const _0x41910d = (_0x445ef1 = null) => _0x894438(_0x445ef1);
  const _0x53906b = () => _0x37ff2e;
  const _0x4f577f = () => _0x2a035c("nodes");
  window._v2ScheduleMinimapViewportPreview = _0xc49c83;
  window._v2FlushMinimapViewportPreview = _0x41910d;
  window._v2GetMinimapPreviewFlushCount = _0x53906b;
  window._v2ScheduleMinimapNodeRefresh = _0x4f577f;
  const _0x295afc = _0x108018.subscribeSelector(_0x9e8107 => _0x9e8107._persistRev || 0, () => _0x2a035c("nodes"));
  const _0x2ccb4e = _0x108018.subscribeSelector(_0x1ed343 => _0x1ed343.viewport, () => _0x2a035c("viewport"));
  const _0x4ddf94 = window.ResizeObserver;
  if (typeof _0x4ddf94 === "function") {
    _0x369e07 = new _0x4ddf94(_0x1cdcbd => {
      const _0xcf7f60 = _0x1cdcbd?.find?.(_0x2f0e88 => _0x2f0e88?.target === _0x49e51a) || _0x1cdcbd?.[0];
      if (!_0xcf7f60) {
        return;
      }
      const {
        width: _0x151772,
        height: _0x51a3ec
      } = _0x1e8409(_0xcf7f60);
      _0x350d4d(_0x151772, _0x51a3ec);
    });
    _0x369e07.observe(_0x49e51a);
  }
  _0x2a035c("both");
  const _0x442f81 = document.getElementById("v2-wrap");
  if (_0x442f81) {
    _0x442f81.style.removeProperty("--bg-x");
    _0x442f81.style.removeProperty("--bg-y");
    _0x442f81.style.removeProperty("--bg-zoom");
  }
  let _0x5239c1 = false;
  const _0x22ba5e = _0x5b30da => {
    const _0x635d5f = _0x108018.getStateRaw();
    const {
      viewport: _0x144f8a
    } = _0x635d5f;
    const {
      bounds: _0x1c3ce6,
      scale: _0x4c440b,
      offsetX: _0x1880ec,
      offsetY: _0x2c46ad
    } = _0x3d4186(_0x635d5f, {
      allowCached: true
    });
    const _0x6681fd = _0x49e51a.getBoundingClientRect();
    const _0x2678a8 = _0x5b30da.clientX - _0x6681fd.left - _0x1880ec;
    const _0x45073e = _0x5b30da.clientY - _0x6681fd.top - _0x2c46ad;
    const _0x102074 = _0x1c3ce6.minX + _0x2678a8 / _0x4c440b;
    const _0x20f425 = _0x1c3ce6.minY + _0x45073e / _0x4c440b;
    const _0x5bec26 = getViewportScreenBounds(_0x144f8a, window.innerWidth, window.innerHeight);
    const _0x488801 = _0x5bec26.width / 2 - _0x102074 * _0x144f8a.zoom;
    const _0x730863 = _0x5bec26.height / 2 - _0x20f425 * _0x144f8a.zoom;
    _0x108018.updateViewport(_0x488801, _0x730863, _0x144f8a.zoom);
  };
  _0x443341.addEventListener("pointerdown", _0x1d7985 => {
    _0x1d7985.stopPropagation();
    _0x5239c1 = true;
    _0x443341.setPointerCapture(_0x1d7985.pointerId);
    _0x22ba5e(_0x1d7985);
  });
  _0x443341.addEventListener("pointermove", _0x5089c3 => {
    if (!_0x5239c1) {
      return;
    }
    _0x22ba5e(_0x5089c3);
  });
  _0x443341.addEventListener("pointerup", _0x2bc813 => {
    _0x5239c1 = false;
    _0x443341.releasePointerCapture(_0x2bc813.pointerId);
  });
  return function _0xf5a4b0() {
    _0x295afc();
    _0x2ccb4e();
    if (_0x23117c) {
      _0x2dc146(_0x23117c);
      _0x23117c = null;
    }
    if (_0x299c96) {
      clearTimeout(_0x299c96);
      _0x299c96 = null;
    }
    if (_0x245134) {
      _0x2dc146(_0x245134);
      _0x245134 = null;
    }
    if (_0x46121e) {
      clearTimeout(_0x46121e);
      _0x46121e = null;
    }
    _0x369e07?.disconnect?.();
    _0x369e07 = null;
    if (window._v2ScheduleMinimapViewportPreview === _0xc49c83) {
      delete window._v2ScheduleMinimapViewportPreview;
    }
    if (window._v2FlushMinimapViewportPreview === _0x41910d) {
      delete window._v2FlushMinimapViewportPreview;
    }
    if (window._v2GetMinimapPreviewFlushCount === _0x53906b) {
      delete window._v2GetMinimapPreviewFlushCount;
    }
    if (window._v2ScheduleMinimapNodeRefresh === _0x4f577f) {
      delete window._v2ScheduleMinimapNodeRefresh;
    }
    _0x10eb47.forEach(_0x4c379e => _0x4c379e.remove());
    _0x10eb47.clear();
  };
}