import { addEdgeWithPolicies } from "./EdgeController.js";
import { beginSelectionBoxPreview, cancelSelectionBoxPreview, updateSelectionBoxPreview } from "../../core/selectionBoxPreview.js";
import { createNodeSpatialIndex, queryNodeSpatialIndexInRect } from "../../core/math.js";
export function createSelectionController({
  store: _0x463af9,
  screenToWorld: _0xd98ebc,
  isNodeType: _0x1c9148,
  isValidConnection: _0x34e9ea
}) {
  const _0x43b5b7 = {
    nodes: null,
    persistRev: -1,
    index: null
  };
  function _0x321d7c() {
    if (typeof _0x463af9.getStateRaw === "function") {
      return _0x463af9.getStateRaw();
    } else {
      return _0x463af9.getState();
    }
  }
  function _0x2b3b9d(_0x57559f) {
    const _0x13baad = _0x57559f?.nodes;
    if (!_0x13baad || typeof _0x13baad !== "object") {
      return null;
    }
    const _0x2d42f0 = Number.isFinite(_0x57559f?._persistRev) ? _0x57559f._persistRev : -1;
    if (_0x43b5b7.nodes === _0x13baad && _0x43b5b7.persistRev === _0x2d42f0) {
      return _0x43b5b7.index;
    }
    const _0x5da53d = createNodeSpatialIndex(_0x13baad, {
      resolveRect(_0x60ae7f) {
        if (!_0x60ae7f || typeof _0x60ae7f !== "object") {
          return null;
        }
        return {
          x: _0x60ae7f.x,
          y: _0x60ae7f.y,
          width: _0x60ae7f.width || 260,
          height: _0x60ae7f.height || 100
        };
      }
    });
    _0x43b5b7.nodes = _0x13baad;
    _0x43b5b7.persistRev = _0x2d42f0;
    _0x43b5b7.index = _0x5da53d;
    return _0x5da53d;
  }
  function _0x107d16(_0x24f970, _0xc2a1a1) {
    const _0x11b1eb = _0x24f970?.nodes || {};
    const _0x51c99c = _0x2b3b9d(_0x24f970);
    if (!_0x51c99c) {
      return Object.values(_0x11b1eb);
    }
    const _0x51bb60 = queryNodeSpatialIndexInRect(_0x51c99c, _0xc2a1a1);
    return _0x51bb60.map(_0x26c0eb => _0x11b1eb[_0x26c0eb]).filter(Boolean);
  }
  function _0x413f7f(_0x1acc1f, _0x523732, _0x22402d) {
    _0x1acc1f.isBoxSelecting = true;
    _0x1acc1f.boxStartX = _0x523732;
    _0x1acc1f.boxStartY = _0x22402d;
    _0x1acc1f._boxSelectionActivated = false;
    cancelSelectionBoxPreview();
  }
  function _0x1670a2(_0x98034a, _0x153347, _0x379205) {
    const _0x2b310c = {
      x1: Math.min(_0x98034a.boxStartX, _0x153347),
      y1: Math.min(_0x98034a.boxStartY, _0x379205),
      x2: Math.max(_0x98034a.boxStartX, _0x153347),
      y2: Math.max(_0x98034a.boxStartY, _0x379205)
    };
    if (!_0x98034a._boxSelectionActivated) {
      const _0x387c04 = Math.hypot(_0x153347 - _0x98034a.boxStartX, _0x379205 - _0x98034a.boxStartY);
      if (_0x387c04 > 3) {
        _0x98034a._boxSelectionActivated = true;
        beginSelectionBoxPreview({
          active: true,
          ..._0x2b310c
        });
      }
    }
    if (_0x98034a._boxSelectionActivated) {
      updateSelectionBoxPreview({
        active: true,
        ..._0x2b310c
      });
    }
  }
  function _0x386f95(_0x228674, _0x49accb, _0xd91668) {
    cancelSelectionBoxPreview();
    const _0x4365ff = _0x321d7c();
    const _0x4dfc66 = _0x4365ff.pickConnectMode;
    const {
      viewport: _0x2da8ce,
      nodes: _0x152bfe
    } = _0x4365ff;
    const {
      boxStartX: _0x123776,
      boxStartY: _0x45bba8
    } = _0x228674;
    if (!Number.isFinite(_0x123776) || !Number.isFinite(_0x45bba8) || !Number.isFinite(_0x49accb) || !Number.isFinite(_0xd91668)) {
      _0x463af9.setSelectionBox({
        active: false
      });
      _0x228674.isBoxSelecting = false;
      return {
        earlyReturn: false,
        didAct: false
      };
    }
    const _0x403801 = Math.min(_0x123776, _0x49accb);
    const _0x49861c = Math.max(_0x123776, _0x49accb);
    const _0x3d1567 = Math.min(_0x45bba8, _0xd91668);
    const _0x49af58 = Math.max(_0x45bba8, _0xd91668);
    const {
      x: _0x101b7b,
      y: _0x4b58eb
    } = _0xd98ebc(_0x403801, _0x3d1567, _0x2da8ce);
    const {
      x: _0x124e9d,
      y: _0x108885
    } = _0xd98ebc(_0x49861c, _0x49af58, _0x2da8ce);
    if (!Number.isFinite(_0x101b7b) || !Number.isFinite(_0x4b58eb) || !Number.isFinite(_0x124e9d) || !Number.isFinite(_0x108885)) {
      _0x463af9.setSelectionBox({
        active: false
      });
      _0x228674.isBoxSelecting = false;
      return {
        earlyReturn: false,
        didAct: false
      };
    }
    if (!_0x4dfc66?.active && _0x4365ff.connOverlay?.srcId) {
      _0x463af9.setSelectionBox({
        active: false
      });
      _0x228674.isBoxSelecting = false;
      return {
        earlyReturn: false,
        didAct: false
      };
    }
    if (_0x4dfc66 && _0x4dfc66.active) {
      const _0x5a58f9 = () => {
        for (const _0x200710 of _0x107d16(_0x4365ff, {
          x: _0x101b7b,
          y: _0x4b58eb,
          width: _0x124e9d - _0x101b7b,
          height: _0x108885 - _0x4b58eb
        })) {
          if (_0x200710.id === _0x4dfc66.sourceNodeId || _0x1c9148(_0x200710, "group")) {
            continue;
          }
          const _0x4a79a3 = _0x200710.x + (_0x200710.width || 260) / 2;
          const _0x38bee6 = _0x200710.y + (_0x200710.height || 100) / 2;
          if (_0x4a79a3 >= _0x101b7b && _0x4a79a3 <= _0x124e9d && _0x38bee6 >= _0x4b58eb && _0x38bee6 <= _0x108885) {
            const _0x13b2c4 = _0x4dfc66.handleDirection === "left";
            const _0x2c74e4 = _0x13b2c4 ? _0x200710.id : _0x4dfc66.sourceNodeId;
            const _0x30ce91 = _0x13b2c4 ? _0x4dfc66.sourceNodeId : _0x200710.id;
            if (_0x152bfe[_0x2c74e4] && _0x152bfe[_0x2c74e4].type === "group") {
              continue;
            }
            if (!_0x34e9ea(_0x152bfe[_0x2c74e4], _0x152bfe[_0x30ce91])) {
              continue;
            }
            addEdgeWithPolicies({
              sourceId: _0x2c74e4,
              targetId: _0x30ce91
            });
          }
        }
      };
      if (typeof _0x463af9.batch === "function") {
        _0x463af9.batch(_0x5a58f9);
      } else {
        _0x5a58f9();
      }
      _0x463af9.setSelectionBox({
        active: false
      });
      _0x228674.isBoxSelecting = false;
      return {
        earlyReturn: true,
        didAct: true
      };
    }
    const _0x43bdcd = [];
    for (const _0x21d850 of _0x107d16(_0x4365ff, {
      x: _0x101b7b,
      y: _0x4b58eb,
      width: _0x124e9d - _0x101b7b,
      height: _0x108885 - _0x4b58eb
    })) {
      const _0x5b4320 = _0x21d850.x + (_0x21d850.width || 260);
      const _0x1c071e = _0x21d850.y + (_0x21d850.height || 100);
      if (_0x1c9148(_0x21d850, "group")) {
        const _0x68019d = _0x21d850.x >= _0x101b7b && _0x5b4320 <= _0x124e9d && _0x21d850.y >= _0x4b58eb && _0x1c071e <= _0x108885;
        if (_0x68019d) {
          _0x43bdcd.push(_0x21d850.id);
        }
      } else {
        const _0x146f10 = !(_0x21d850.x > _0x124e9d) && !(_0x5b4320 < _0x101b7b) && !(_0x21d850.y > _0x108885) && !(_0x1c071e < _0x4b58eb);
        if (_0x146f10) {
          _0x43bdcd.push(_0x21d850.id);
        }
      }
    }
    _0x463af9.setSelectionMeta({
      source: "box"
    });
    _0x463af9.setSelectedNodes(_0x43bdcd);
    _0x463af9.setSelectionBox({
      active: false
    });
    _0x228674.isBoxSelecting = false;
    return {
      earlyReturn: false,
      didAct: true
    };
  }
  return {
    startBoxSelecting: _0x413f7f,
    updateBoxSelecting: _0x1670a2,
    finishBoxSelecting: _0x386f95
  };
}