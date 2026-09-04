const finiteNumberOr = (_0x48f3c8, _0x13b900 = 0) => {
  const _0x4cd12b = Number(_0x48f3c8);
  if (Number.isFinite(_0x4cd12b)) {
    return _0x4cd12b;
  } else {
    return _0x13b900;
  }
};
const addPolygon = (_0x448d05, _0x5b1b0b) => {
  if (!_0x5b1b0b.length) {
    return;
  }
  _0x448d05.moveTo(_0x5b1b0b[0].x, _0x5b1b0b[0].y);
  _0x5b1b0b.slice(1).forEach(_0x1481eb => _0x448d05.lineTo(_0x1481eb.x, _0x1481eb.y));
  _0x448d05.closePath();
};
export function getWhiteboardShapeBounds(_0x30ef80) {
  const _0x4beb01 = finiteNumberOr(_0x30ef80?.x1);
  const _0x47f0aa = finiteNumberOr(_0x30ef80?.y1);
  const _0x44b21f = finiteNumberOr(_0x30ef80?.x2);
  const _0x2fe0c5 = finiteNumberOr(_0x30ef80?.y2);
  return {
    x: Math.min(_0x4beb01, _0x44b21f),
    y: Math.min(_0x47f0aa, _0x2fe0c5),
    width: Math.abs(_0x44b21f - _0x4beb01),
    height: Math.abs(_0x2fe0c5 - _0x47f0aa)
  };
}
export function isClosedWhiteboardShape(_0x4a4310) {
  return _0x4a4310 !== "line" && _0x4a4310 !== "frame";
}
export function traceWhiteboardShapePath(_0x2ad5b4, _0x272879, _0x3663df) {
  if (!_0x2ad5b4) {
    return false;
  }
  const _0x3805ed = finiteNumberOr(_0x3663df?.x);
  const _0x342912 = finiteNumberOr(_0x3663df?.y);
  const _0x206382 = Math.max(0, finiteNumberOr(_0x3663df?.width));
  const _0x4db3f7 = Math.max(0, finiteNumberOr(_0x3663df?.height));
  const _0x4f33f8 = _0x3805ed + _0x206382;
  const _0x50cc71 = _0x342912 + _0x4db3f7;
  const _0x558b3a = _0x3805ed + _0x206382 / 2;
  const _0x4319b2 = _0x342912 + _0x4db3f7 / 2;
  switch (_0x272879) {
    case "circle":
      _0x2ad5b4.ellipse(_0x558b3a, _0x4319b2, _0x206382 / 2, _0x4db3f7 / 2, 0, 0, Math.PI * 2);
      _0x2ad5b4.closePath();
      return true;
    case "triangle":
      addPolygon(_0x2ad5b4, [{
        x: _0x558b3a,
        y: _0x342912
      }, {
        x: _0x4f33f8,
        y: _0x50cc71
      }, {
        x: _0x3805ed,
        y: _0x50cc71
      }]);
      return true;
    case "diamond":
      addPolygon(_0x2ad5b4, [{
        x: _0x558b3a,
        y: _0x342912
      }, {
        x: _0x4f33f8,
        y: _0x4319b2
      }, {
        x: _0x558b3a,
        y: _0x50cc71
      }, {
        x: _0x3805ed,
        y: _0x4319b2
      }]);
      return true;
    case "hexagon":
      addPolygon(_0x2ad5b4, [{
        x: _0x3805ed + _0x206382 * 0.25,
        y: _0x342912
      }, {
        x: _0x3805ed + _0x206382 * 0.75,
        y: _0x342912
      }, {
        x: _0x4f33f8,
        y: _0x4319b2
      }, {
        x: _0x3805ed + _0x206382 * 0.75,
        y: _0x50cc71
      }, {
        x: _0x3805ed + _0x206382 * 0.25,
        y: _0x50cc71
      }, {
        x: _0x3805ed,
        y: _0x4319b2
      }]);
      return true;
    case "pill":
      {
        const _0x5e6d3d = Math.min(_0x206382 / 2, _0x4db3f7 / 2);
        _0x2ad5b4.moveTo(_0x3805ed + _0x5e6d3d, _0x342912);
        _0x2ad5b4.lineTo(_0x4f33f8 - _0x5e6d3d, _0x342912);
        _0x2ad5b4.quadraticCurveTo(_0x4f33f8, _0x342912, _0x4f33f8, _0x342912 + _0x5e6d3d);
        _0x2ad5b4.lineTo(_0x4f33f8, _0x50cc71 - _0x5e6d3d);
        _0x2ad5b4.quadraticCurveTo(_0x4f33f8, _0x50cc71, _0x4f33f8 - _0x5e6d3d, _0x50cc71);
        _0x2ad5b4.lineTo(_0x3805ed + _0x5e6d3d, _0x50cc71);
        _0x2ad5b4.quadraticCurveTo(_0x3805ed, _0x50cc71, _0x3805ed, _0x50cc71 - _0x5e6d3d);
        _0x2ad5b4.lineTo(_0x3805ed, _0x342912 + _0x5e6d3d);
        _0x2ad5b4.quadraticCurveTo(_0x3805ed, _0x342912, _0x3805ed + _0x5e6d3d, _0x342912);
        _0x2ad5b4.closePath();
        return true;
      }
    case "parallelogram":
      addPolygon(_0x2ad5b4, [{
        x: _0x3805ed + _0x206382 * 0.2,
        y: _0x342912
      }, {
        x: _0x4f33f8,
        y: _0x342912
      }, {
        x: _0x3805ed + _0x206382 * 0.8,
        y: _0x50cc71
      }, {
        x: _0x3805ed,
        y: _0x50cc71
      }]);
      return true;
    case "star":
      {
        const _0x3c1030 = [];
        const _0x5ec442 = Math.min(_0x206382, _0x4db3f7) / 2;
        const _0x183f19 = _0x5ec442 * 0.46;
        for (let _0x1ad158 = 0; _0x1ad158 < 10; _0x1ad158 += 1) {
          const _0x205115 = _0x1ad158 % 2 === 0 ? _0x5ec442 : _0x183f19;
          const _0x1ed4a9 = -Math.PI / 2 + _0x1ad158 * Math.PI / 5;
          _0x3c1030.push({
            x: _0x558b3a + Math.cos(_0x1ed4a9) * _0x205115,
            y: _0x4319b2 + Math.sin(_0x1ed4a9) * _0x205115
          });
        }
        addPolygon(_0x2ad5b4, _0x3c1030);
        return true;
      }
    case "cloud":
      _0x2ad5b4.moveTo(_0x3805ed + _0x206382 * 0.22, _0x50cc71);
      _0x2ad5b4.bezierCurveTo(_0x3805ed, _0x50cc71, _0x3805ed, _0x342912 + _0x4db3f7 * 0.52, _0x3805ed + _0x206382 * 0.2, _0x342912 + _0x4db3f7 * 0.5);
      _0x2ad5b4.bezierCurveTo(_0x3805ed + _0x206382 * 0.18, _0x342912 + _0x4db3f7 * 0.22, _0x3805ed + _0x206382 * 0.48, _0x342912 + _0x4db3f7 * 0.12, _0x3805ed + _0x206382 * 0.62, _0x342912 + _0x4db3f7 * 0.35);
      _0x2ad5b4.bezierCurveTo(_0x3805ed + _0x206382 * 0.86, _0x342912 + _0x4db3f7 * 0.28, _0x4f33f8, _0x342912 + _0x4db3f7 * 0.48, _0x4f33f8, _0x342912 + _0x4db3f7 * 0.67);
      _0x2ad5b4.bezierCurveTo(_0x4f33f8, _0x50cc71, _0x3805ed + _0x206382 * 0.76, _0x50cc71, _0x3805ed + _0x206382 * 0.6, _0x50cc71);
      _0x2ad5b4.closePath();
      return true;
    case "heart":
      _0x2ad5b4.moveTo(_0x558b3a, _0x50cc71);
      _0x2ad5b4.bezierCurveTo(_0x3805ed + _0x206382 * 0.1, _0x342912 + _0x4db3f7 * 0.65, _0x3805ed, _0x342912 + _0x4db3f7 * 0.35, _0x3805ed + _0x206382 * 0.22, _0x342912 + _0x4db3f7 * 0.16);
      _0x2ad5b4.bezierCurveTo(_0x3805ed + _0x206382 * 0.38, _0x342912, _0x558b3a, _0x342912 + _0x4db3f7 * 0.14, _0x558b3a, _0x342912 + _0x4db3f7 * 0.28);
      _0x2ad5b4.bezierCurveTo(_0x558b3a, _0x342912 + _0x4db3f7 * 0.14, _0x3805ed + _0x206382 * 0.62, _0x342912, _0x3805ed + _0x206382 * 0.78, _0x342912 + _0x4db3f7 * 0.16);
      _0x2ad5b4.bezierCurveTo(_0x4f33f8, _0x342912 + _0x4db3f7 * 0.35, _0x3805ed + _0x206382 * 0.9, _0x342912 + _0x4db3f7 * 0.65, _0x558b3a, _0x50cc71);
      _0x2ad5b4.closePath();
      return true;
    case "crossed-box":
      _0x2ad5b4.rect(_0x3805ed, _0x342912, _0x206382, _0x4db3f7);
      _0x2ad5b4.moveTo(_0x3805ed, _0x342912);
      _0x2ad5b4.lineTo(_0x4f33f8, _0x50cc71);
      _0x2ad5b4.moveTo(_0x4f33f8, _0x342912);
      _0x2ad5b4.lineTo(_0x3805ed, _0x50cc71);
      return true;
    case "checkbox":
      _0x2ad5b4.rect(_0x3805ed, _0x342912, _0x206382, _0x4db3f7);
      _0x2ad5b4.moveTo(_0x3805ed + _0x206382 * 0.2, _0x4319b2);
      _0x2ad5b4.lineTo(_0x3805ed + _0x206382 * 0.42, _0x342912 + _0x4db3f7 * 0.75);
      _0x2ad5b4.lineTo(_0x3805ed + _0x206382 * 0.82, _0x342912 + _0x4db3f7 * 0.22);
      return true;
    case "arrow-left":
    case "arrow-right":
    case "arrow-up":
    case "arrow-down":
      {
        const _0x552a85 = _0x272879 === "arrow-left" || _0x272879 === "arrow-right";
        const _0x2fe3ee = _0x552a85 ? [{
          x: _0x3805ed,
          y: _0x4319b2
        }, {
          x: _0x3805ed + _0x206382 * 0.42,
          y: _0x342912
        }, {
          x: _0x3805ed + _0x206382 * 0.42,
          y: _0x342912 + _0x4db3f7 * 0.28
        }, {
          x: _0x4f33f8,
          y: _0x342912 + _0x4db3f7 * 0.28
        }, {
          x: _0x4f33f8,
          y: _0x342912 + _0x4db3f7 * 0.72
        }, {
          x: _0x3805ed + _0x206382 * 0.42,
          y: _0x342912 + _0x4db3f7 * 0.72
        }, {
          x: _0x3805ed + _0x206382 * 0.42,
          y: _0x50cc71
        }] : [{
          x: _0x558b3a,
          y: _0x342912
        }, {
          x: _0x4f33f8,
          y: _0x342912 + _0x4db3f7 * 0.42
        }, {
          x: _0x3805ed + _0x206382 * 0.72,
          y: _0x342912 + _0x4db3f7 * 0.42
        }, {
          x: _0x3805ed + _0x206382 * 0.72,
          y: _0x50cc71
        }, {
          x: _0x3805ed + _0x206382 * 0.28,
          y: _0x50cc71
        }, {
          x: _0x3805ed + _0x206382 * 0.28,
          y: _0x342912 + _0x4db3f7 * 0.42
        }, {
          x: _0x3805ed,
          y: _0x342912 + _0x4db3f7 * 0.42
        }];
        const _0x31c25c = _0x272879 === "arrow-right";
        const _0x2d1291 = _0x272879 === "arrow-down";
        addPolygon(_0x2ad5b4, _0x2fe3ee.map(_0x34d39a => ({
          x: _0x31c25c ? _0x4f33f8 - (_0x34d39a.x - _0x3805ed) : _0x34d39a.x,
          y: _0x2d1291 ? _0x50cc71 - (_0x34d39a.y - _0x342912) : _0x34d39a.y
        })));
        return true;
      }
    case "line":
      _0x2ad5b4.moveTo(_0x3805ed, _0x50cc71);
      _0x2ad5b4.lineTo(_0x4f33f8, _0x342912);
      return true;
    case "frame":
      {
        const _0x40540a = Math.min(_0x206382, _0x4db3f7) * 0.25;
        _0x2ad5b4.moveTo(_0x3805ed, _0x342912 + _0x40540a);
        _0x2ad5b4.lineTo(_0x3805ed, _0x342912);
        _0x2ad5b4.lineTo(_0x3805ed + _0x40540a, _0x342912);
        _0x2ad5b4.moveTo(_0x4f33f8 - _0x40540a, _0x342912);
        _0x2ad5b4.lineTo(_0x4f33f8, _0x342912);
        _0x2ad5b4.lineTo(_0x4f33f8, _0x342912 + _0x40540a);
        _0x2ad5b4.moveTo(_0x4f33f8, _0x50cc71 - _0x40540a);
        _0x2ad5b4.lineTo(_0x4f33f8, _0x50cc71);
        _0x2ad5b4.lineTo(_0x4f33f8 - _0x40540a, _0x50cc71);
        _0x2ad5b4.moveTo(_0x3805ed + _0x40540a, _0x50cc71);
        _0x2ad5b4.lineTo(_0x3805ed, _0x50cc71);
        _0x2ad5b4.lineTo(_0x3805ed, _0x50cc71 - _0x40540a);
        return true;
      }
    default:
      _0x2ad5b4.rect(_0x3805ed, _0x342912, _0x206382, _0x4db3f7);
      return true;
  }
}