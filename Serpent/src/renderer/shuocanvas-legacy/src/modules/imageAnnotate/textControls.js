export const TEXT_CONTROL_BUTTON_RADIUS = 9;
export const TEXT_CONTROL_SIDE_HANDLE_RADIUS = 7;
export const TEXT_CONTROL_HIT_RADIUS = 13;
export const TEXT_CONTROL_MIN_SCALE = 0.1;
export const TEXT_CONTROL_MAX_SCALE = 20;
export const TEXT_COPY_OFFSET_WORLD = 16;
export const TEXT_LINE_HEIGHT_RATIO = 1.2;
export const TEXT_ROTATE_HANDLE_OFFSET = 24;
export const TEXT_ROTATE_HIT_RADIUS = 13;
export const clampTextScale = _0x14ae66 => {
  const _0x3b7e85 = Number(_0x14ae66);
  if (!Number.isFinite(_0x3b7e85)) {
    return 1;
  }
  return Math.max(TEXT_CONTROL_MIN_SCALE, Math.min(TEXT_CONTROL_MAX_SCALE, _0x3b7e85));
};
export const getTextScalePair = (_0x509cd5 = {}) => {
  const _0x5dbe60 = clampTextScale(_0x509cd5.scale);
  return {
    scaleX: clampTextScale(_0x509cd5.scaleX === undefined || _0x509cd5.scaleX === null ? _0x5dbe60 : _0x509cd5.scaleX),
    scaleY: clampTextScale(_0x509cd5.scaleY === undefined || _0x509cd5.scaleY === null ? _0x5dbe60 : _0x509cd5.scaleY)
  };
};
const getViewportZoom = _0x15166e => {
  const _0x56d280 = Number(_0x15166e?.zoom);
  if (Number.isFinite(_0x56d280) && _0x56d280 > 0) {
    return _0x56d280;
  } else {
    return 1;
  }
};
const getScreenX = (_0x5529b2, _0x33c5db) => ((Number(_0x5529b2) || 0) - (Number(_0x33c5db?.x) || 0)) * getViewportZoom(_0x33c5db);
const getScreenY = (_0x5c68fb, _0x22dfb4) => ((Number(_0x5c68fb) || 0) - (Number(_0x22dfb4?.y) || 0)) * getViewportZoom(_0x22dfb4);
export const getTextLayout = ({
  canvasEl: _0x385edd,
  cmd: _0x24bb67,
  viewport: _0x1866b1,
  layoutVariant = "annotate",
  context = null
} = {}) => {
  if (!_0x385edd || !_0x24bb67) {
    return null;
  }
  const _0x1b36a1 = getViewportZoom(_0x1866b1);
  const _0x475f0e = Math.max(1, Number(_0x24bb67.sizeWorld || 0) * _0x1b36a1);
  const _0x4f7d91 = getScreenX(_0x24bb67.x, _0x1866b1);
  const _0x3216fa = getScreenY(_0x24bb67.y, _0x1866b1);
  const _0x2c0f7d = context || _0x385edd.getContext?.("2d");
  const _0x2b718c = _0x24bb67.font === "serif" ? "serif" : _0x24bb67.font === "mono" ? "monospace" : "sans-serif";
  _0x2c0f7d?.save?.();
  if (_0x2c0f7d) {
    _0x2c0f7d.font = _0x475f0e + "px " + _0x2b718c;
  }
  const _0x3195d7 = String(_0x24bb67.text || "").split("\n");
  const _0x4e7b32 = _0x3195d7.length > 0 ? _0x3195d7 : [""];
  const _0x52d799 = _0x4e7b32.map(_0xe4f786 => typeof _0x2c0f7d?.measureText === "function" ? _0x2c0f7d.measureText(_0xe4f786 || " ") : {
    width: Math.max(1, String(_0xe4f786 || " ").length) * _0x475f0e * 0.6,
    actualBoundingBoxAscent: _0x475f0e * 0.8,
    actualBoundingBoxDescent: _0x475f0e * 0.2
  });
  _0x2c0f7d?.restore?.();
  const _0xfa20ee = Math.max(16, ..._0x52d799.map(_0x38cd1b => Number(_0x38cd1b.width) || _0x475f0e));
  const _0xef9efb = Math.max(1, ..._0x52d799.map(_0x378b6f => {
    const _0x26e4ce = Number(_0x378b6f.actualBoundingBoxAscent) || _0x475f0e * 0.8;
    const _0x278da6 = Number(_0x378b6f.actualBoundingBoxDescent) || _0x475f0e * 0.2;
    return _0x26e4ce + _0x278da6;
  }));
  const _0x3fe63f = layoutVariant === "whiteboard" ? Math.max(1, _0x475f0e * TEXT_LINE_HEIGHT_RATIO) : _0xef9efb;
  const _0x4f55c6 = Math.max(_0x475f0e, _0x4e7b32.length * _0x3fe63f);
  return {
    x: _0x4f7d91,
    y: _0x3216fa,
    width: _0xfa20ee,
    height: _0x4f55c6,
    fontSize: _0x475f0e,
    lineHeight: _0x3fe63f,
    lines: _0x4e7b32
  };
};
export const getTextGeometry = ({
  canvasEl: _0x5eebf3,
  cmd: _0x32cc2d,
  viewport: _0x2a9c72,
  layoutVariant = "annotate"
} = {}) => {
  const _0x33924b = getTextLayout({
    canvasEl: _0x5eebf3,
    cmd: _0x32cc2d,
    viewport: _0x2a9c72,
    layoutVariant: layoutVariant
  });
  if (!_0x33924b) {
    return null;
  }
  const {
    scaleX: _0x4fd4ae,
    scaleY: _0x4a3ba6
  } = getTextScalePair(_0x32cc2d);
  const _0x495948 = Number(_0x32cc2d?.rotation) || 0;
  const _0x3d6064 = _0x33924b.width * _0x4fd4ae;
  const _0x122562 = _0x33924b.height * _0x4a3ba6;
  const _0x499124 = _0x33924b.x;
  const _0x360ce8 = _0x33924b.y;
  const _0x3427a6 = (_0x22e978, _0x54af75) => {
    const _0x4d20ba = _0x22e978 - _0x499124;
    const _0x5be2f1 = _0x54af75 - _0x360ce8;
    const _0x173804 = Math.cos(_0x495948);
    const _0x48973c = Math.sin(_0x495948);
    return {
      x: _0x499124 + _0x4d20ba * _0x173804 - _0x5be2f1 * _0x48973c,
      y: _0x360ce8 + _0x4d20ba * _0x48973c + _0x5be2f1 * _0x173804
    };
  };
  const _0x33deef = _0x3427a6(_0x499124, _0x360ce8);
  const _0x11c7f2 = _0x3427a6(_0x499124 + _0x3d6064, _0x360ce8);
  const _0x244703 = _0x3427a6(_0x499124 + _0x3d6064, _0x360ce8 + _0x122562);
  const _0x432cb4 = _0x3427a6(_0x499124, _0x360ce8 + _0x122562);
  return {
    ..._0x33924b,
    scale: Math.max(_0x4fd4ae, _0x4a3ba6),
    scaleX: _0x4fd4ae,
    scaleY: _0x4a3ba6,
    rotation: _0x495948,
    corners: [_0x33deef, _0x11c7f2, _0x244703, _0x432cb4],
    center: {
      x: (_0x33deef.x + _0x244703.x) / 2,
      y: (_0x33deef.y + _0x244703.y) / 2
    },
    anchor: {
      x: _0x499124,
      y: _0x360ce8
    },
    handles: {
      corners: [_0x33deef, _0x11c7f2, _0x244703, _0x432cb4],
      top: {
        x: (_0x33deef.x + _0x11c7f2.x) / 2,
        y: (_0x33deef.y + _0x11c7f2.y) / 2
      },
      right: {
        x: (_0x11c7f2.x + _0x244703.x) / 2,
        y: (_0x11c7f2.y + _0x244703.y) / 2
      },
      bottom: {
        x: (_0x244703.x + _0x432cb4.x) / 2,
        y: (_0x244703.y + _0x432cb4.y) / 2
      },
      left: {
        x: (_0x432cb4.x + _0x33deef.x) / 2,
        y: (_0x432cb4.y + _0x33deef.y) / 2
      }
    }
  };
};
export const getTextRotationHandles = _0x41358a => {
  const _0x166738 = Array.isArray(_0x41358a?.corners) ? _0x41358a.corners : [];
  if (_0x166738.length < 2) {
    return [];
  }
  const [_0x2c1a7f, _0x1c3286] = _0x166738;
  const _0x30da6b = _0x1c3286.x - _0x2c1a7f.x;
  const _0x1ff2d1 = _0x1c3286.y - _0x2c1a7f.y;
  const _0x367cbd = Math.hypot(_0x30da6b, _0x1ff2d1) || 1;
  const _0x5cf120 = {
    x: (_0x2c1a7f.x + _0x1c3286.x) / 2,
    y: (_0x2c1a7f.y + _0x1c3286.y) / 2
  };
  return [{
    point: {
      x: _0x5cf120.x + _0x1ff2d1 / _0x367cbd * TEXT_ROTATE_HANDLE_OFFSET,
      y: _0x5cf120.y - _0x30da6b / _0x367cbd * TEXT_ROTATE_HANDLE_OFFSET
    },
    handle: "rotate"
  }];
};
export const getTextRotationHandle = _0x2433dc => getTextRotationHandles(_0x2433dc)[0]?.point || null;
export const distanceToPoint = (_0x558d15, _0x213e74) => Math.hypot(Number(_0x558d15?.x || 0) - Number(_0x213e74?.x || 0), Number(_0x558d15?.y || 0) - Number(_0x213e74?.y || 0));
export const toTextLocalTransformSpace = (_0x1e4f80, _0x4def08, _0x42da98) => {
  const _0x2773fb = Number(_0x1e4f80?.x || 0) - Number(_0x4def08?.x || 0);
  const _0x3dbc37 = Number(_0x1e4f80?.y || 0) - Number(_0x4def08?.y || 0);
  const _0x1ceb5f = Math.cos(-(Number(_0x42da98) || 0));
  const _0x3777f3 = Math.sin(-(Number(_0x42da98) || 0));
  return {
    x: _0x2773fb * _0x1ceb5f - _0x3dbc37 * _0x3777f3,
    y: _0x2773fb * _0x3777f3 + _0x3dbc37 * _0x1ceb5f
  };
};
export const rotateTextLocalPoint = (_0x32d948, _0x4fe0f2) => {
  const _0xf2951e = Math.cos(Number(_0x4fe0f2) || 0);
  const _0x3da63d = Math.sin(Number(_0x4fe0f2) || 0);
  const _0x53d6ac = Number(_0x32d948?.x || 0);
  const _0x2b22ef = Number(_0x32d948?.y || 0);
  return {
    x: _0x53d6ac * _0xf2951e - _0x2b22ef * _0x3da63d,
    y: _0x53d6ac * _0x3da63d + _0x2b22ef * _0xf2951e
  };
};
export const getTextAnchorForCenter = ({
  centerPx: _0x447458,
  layoutWidth: _0x569e99,
  layoutHeight: _0x27b788,
  scaleX: _0x280340,
  scaleY: _0x2df2d9,
  rotation: _0x47c2a8
} = {}) => {
  const _0x2539dd = rotateTextLocalPoint({
    x: (Number(_0x569e99) || 0) * (Number(_0x280340) || 0) / 2,
    y: (Number(_0x27b788) || 0) * (Number(_0x2df2d9) || 0) / 2
  }, _0x47c2a8);
  return {
    x: Number(_0x447458?.x || 0) - _0x2539dd.x,
    y: Number(_0x447458?.y || 0) - _0x2539dd.y
  };
};
export const resolveAxisTextScale = (_0x1aa37a, _0x4df113) => {
  const _0x459881 = toTextLocalTransformSpace(_0x4df113, _0x1aa37a.anchorPx, _0x1aa37a.rotation);
  let _0x3dd7af = _0x1aa37a.baseScaleX;
  let _0x1b99ce = _0x1aa37a.baseScaleY;
  let _0x4a9199 = {
    x: 0,
    y: 0
  };
  if (_0x1aa37a.handle === "right") {
    _0x3dd7af = clampTextScale(_0x459881.x / _0x1aa37a.layoutWidth);
  } else if (_0x1aa37a.handle === "left") {
    _0x3dd7af = clampTextScale(-_0x459881.x / _0x1aa37a.layoutWidth);
    _0x4a9199 = {
      x: -_0x1aa37a.layoutWidth * _0x3dd7af,
      y: 0
    };
  } else if (_0x1aa37a.handle === "bottom") {
    _0x1b99ce = clampTextScale(_0x459881.y / _0x1aa37a.layoutHeight);
  } else if (_0x1aa37a.handle === "top") {
    _0x1b99ce = clampTextScale(-_0x459881.y / _0x1aa37a.layoutHeight);
    _0x4a9199 = {
      x: 0,
      y: -_0x1aa37a.layoutHeight * _0x1b99ce
    };
  }
  const _0x164ccf = rotateTextLocalPoint(_0x4a9199, _0x1aa37a.rotation);
  return {
    scaleX: _0x3dd7af,
    scaleY: _0x1b99ce,
    originPx: {
      x: _0x1aa37a.anchorPx.x + _0x164ccf.x,
      y: _0x1aa37a.anchorPx.y + _0x164ccf.y
    }
  };
};
export const isPointInPolygon = (_0x46e9af, _0x2d33b1) => {
  let _0x370fa2 = false;
  for (let _0x109ba7 = 0, _0x416175 = _0x2d33b1.length - 1; _0x109ba7 < _0x2d33b1.length; _0x416175 = _0x109ba7++) {
    const _0x1b2e50 = _0x2d33b1[_0x109ba7].x;
    const _0x23d0c0 = _0x2d33b1[_0x109ba7].y;
    const _0x14868f = _0x2d33b1[_0x416175].x;
    const _0x54009f = _0x2d33b1[_0x416175].y;
    const _0x1d9df4 = _0x23d0c0 > _0x46e9af.y !== _0x54009f > _0x46e9af.y && _0x46e9af.x < (_0x14868f - _0x1b2e50) * (_0x46e9af.y - _0x23d0c0) / (_0x54009f - _0x23d0c0 || 0.000001) + _0x1b2e50;
    if (_0x1d9df4) {
      _0x370fa2 = !_0x370fa2;
    }
  }
  return _0x370fa2;
};
export const findTextHit = ({
  commands: _0x5c20af,
  selectedTextCommandIndex: _0x1e40c1,
  local: _0x5d94fa,
  viewport: _0x5cb717,
  canvasEl: _0x468538,
  controlVariant = "annotate"
} = {}) => {
  const _0xaa3b05 = {
    x: getScreenX(_0x5d94fa?.x, _0x5cb717),
    y: getScreenY(_0x5d94fa?.y, _0x5cb717)
  };
  const _0x524b1d = Number(_0x1e40c1);
  if (Number.isInteger(_0x524b1d) && _0x524b1d >= 0 && _0x524b1d < _0x5c20af.length && _0x5c20af[_0x524b1d]?.type === "text") {
    const _0x2c4c99 = getTextGeometry({
      canvasEl: _0x468538,
      cmd: _0x5c20af[_0x524b1d],
      viewport: _0x5cb717,
      layoutVariant: controlVariant
    });
    if (_0x2c4c99) {
      const [_0x5f2b8d, _0x4a09a5, _0x4cfa98, _0x529576] = _0x2c4c99.corners;
      const _0x519981 = controlVariant === "whiteboard";
      const _0x460852 = _0x519981 ? _0x2c4c99.corners.map((_0x4f02a7, _0x4fcf7e) => ({
        point: _0x4f02a7,
        mode: "scale-uniform",
        handle: ["top-left", "top-right", "bottom-right", "bottom-left"][_0x4fcf7e]
      })) : [{
        point: _0x5f2b8d,
        mode: "delete"
      }, {
        point: _0x529576,
        mode: "copy"
      }, {
        point: _0x4a09a5,
        mode: "rotate"
      }, {
        point: _0x4cfa98,
        mode: "scale-uniform"
      }];
      const _0xd12436 = _0x519981 ? [] : [{
        point: _0x2c4c99.handles.top,
        mode: "scale-y",
        handle: "top"
      }, {
        point: _0x2c4c99.handles.right,
        mode: "scale-x",
        handle: "right"
      }, {
        point: _0x2c4c99.handles.bottom,
        mode: "scale-y",
        handle: "bottom"
      }, {
        point: _0x2c4c99.handles.left,
        mode: "scale-x",
        handle: "left"
      }];
      const _0x5116de = _0x519981 ? getTextRotationHandles(_0x2c4c99) : [];
      const _0x218c53 = [..._0x460852.map(_0x521dc0 => ({
        ..._0x521dc0,
        distance: distanceToPoint(_0xaa3b05, _0x521dc0.point),
        radius: TEXT_CONTROL_HIT_RADIUS
      })), ..._0xd12436.map(_0x4cb636 => ({
        ..._0x4cb636,
        distance: distanceToPoint(_0xaa3b05, _0x4cb636.point),
        radius: TEXT_CONTROL_SIDE_HANDLE_RADIUS + 4
      })), ..._0x5116de.map(_0x20221e => ({
        ..._0x20221e,
        mode: "rotate",
        distance: distanceToPoint(_0xaa3b05, _0x20221e.point),
        radius: TEXT_ROTATE_HIT_RADIUS
      }))].filter(_0x1d7fac => _0x1d7fac.distance <= _0x1d7fac.radius).sort((_0x5dc966, _0x7a45a6) => _0x5dc966.distance - _0x7a45a6.distance);
      if (_0x218c53.length > 0) {
        const _0x45a5f2 = _0x218c53[0];
        return {
          index: _0x524b1d,
          mode: _0x45a5f2.mode,
          handle: _0x45a5f2.handle,
          geom: _0x2c4c99
        };
      }
      if (isPointInPolygon(_0xaa3b05, _0x2c4c99.corners)) {
        return {
          index: _0x524b1d,
          mode: "move",
          geom: _0x2c4c99
        };
      }
    }
  }
  for (let _0x2a8672 = _0x5c20af.length - 1; _0x2a8672 >= 0; _0x2a8672 -= 1) {
    const _0x5d50df = _0x5c20af[_0x2a8672];
    if (_0x5d50df?.type !== "text") {
      continue;
    }
    const _0x3fe64f = getTextGeometry({
      canvasEl: _0x468538,
      cmd: _0x5d50df,
      viewport: _0x5cb717,
      layoutVariant: controlVariant
    });
    if (!_0x3fe64f) {
      continue;
    }
    if (isPointInPolygon(_0xaa3b05, _0x3fe64f.corners)) {
      return {
        index: _0x2a8672,
        mode: "move",
        geom: _0x3fe64f
      };
    }
  }
  return null;
};
export const createTextTransformState = ({
  commands: _0x2db832,
  hit: _0xc0f318,
  local: _0x15fe60,
  viewport: _0x26d0c7,
  canvasEl: _0x13b2a7,
  layoutVariant = "annotate"
} = {}) => {
  const _0x41d0d5 = {
    x: getScreenX(_0x15fe60?.x, _0x26d0c7),
    y: getScreenY(_0x15fe60?.y, _0x26d0c7)
  };
  const _0x5063a7 = _0x2db832[_0xc0f318.index];
  const _0x538ed9 = _0xc0f318.geom || getTextGeometry({
    canvasEl: _0x13b2a7,
    cmd: _0x5063a7,
    viewport: _0x26d0c7,
    layoutVariant: layoutVariant
  });
  if (!_0x538ed9) {
    return null;
  }
  if (_0xc0f318.mode === "move") {
    return {
      index: _0xc0f318.index,
      mode: "move",
      offsetWorldX: Number(_0x15fe60?.x || 0) - Number(_0x5063a7?.x || 0),
      offsetWorldY: Number(_0x15fe60?.y || 0) - Number(_0x5063a7?.y || 0)
    };
  }
  if (_0xc0f318.mode === "scale") {
    return null;
  }
  if (_0xc0f318.mode === "scale-x" || _0xc0f318.mode === "scale-y") {
    const _0x5c4bca = String(_0xc0f318.handle || "");
    const _0x42c5fa = {
      right: _0x538ed9.corners[0],
      bottom: _0x538ed9.corners[0],
      left: _0x538ed9.corners[1],
      top: _0x538ed9.corners[3]
    };
    const _0x3b481a = _0x42c5fa[_0x5c4bca] || _0x538ed9.corners[0];
    return {
      index: _0xc0f318.index,
      mode: _0xc0f318.mode,
      handle: _0x5c4bca,
      anchorPx: {
        x: _0x3b481a.x,
        y: _0x3b481a.y
      },
      baseScaleX: _0x538ed9.scaleX,
      baseScaleY: _0x538ed9.scaleY,
      layoutWidth: Math.max(1, Number(_0x538ed9.width) || 1),
      layoutHeight: Math.max(1, Number(_0x538ed9.height) || 1),
      rotation: Number(_0x5063a7?.rotation) || 0
    };
  }
  if (_0xc0f318.mode === "scale-uniform") {
    if (layoutVariant === "whiteboard") {
      return {
        index: _0xc0f318.index,
        mode: "scale-uniform",
        centerBased: true,
        centerPx: {
          x: _0x538ed9.center.x,
          y: _0x538ed9.center.y
        },
        startDistance: Math.max(0.001, Math.hypot(_0x41d0d5.x - _0x538ed9.center.x, _0x41d0d5.y - _0x538ed9.center.y)),
        layoutWidth: Math.max(1, Number(_0x538ed9.width) || 1),
        layoutHeight: Math.max(1, Number(_0x538ed9.height) || 1),
        baseScaleX: _0x538ed9.scaleX,
        baseScaleY: _0x538ed9.scaleY,
        handle: _0xc0f318.handle,
        rotation: Number(_0x5063a7?.rotation) || 0
      };
    }
    return {
      index: _0xc0f318.index,
      mode: "scale-uniform",
      originPx: {
        x: _0x538ed9.anchor.x,
        y: _0x538ed9.anchor.y
      },
      baseWidthPx: Math.max(1, Number(_0x538ed9.width) || 1) * _0x538ed9.scaleX,
      baseHeightPx: Math.max(1, Number(_0x538ed9.height) || 1) * _0x538ed9.scaleY,
      baseScaleX: _0x538ed9.scaleX,
      baseScaleY: _0x538ed9.scaleY,
      handle: _0xc0f318.handle,
      rotation: Number(_0x5063a7?.rotation) || 0
    };
  }
  if (_0xc0f318.mode === "rotate") {
    return {
      index: _0xc0f318.index,
      mode: "rotate",
      centerPx: {
        x: _0x538ed9.center.x,
        y: _0x538ed9.center.y
      },
      baseAngle: Math.atan2(_0x41d0d5.y - _0x538ed9.center.y, _0x41d0d5.x - _0x538ed9.center.x),
      baseRotation: Number(_0x5063a7?.rotation) || 0,
      layoutWidth: Math.max(1, Number(_0x538ed9.width) || 1),
      layoutHeight: Math.max(1, Number(_0x538ed9.height) || 1),
      baseScaleX: _0x538ed9.scaleX,
      baseScaleY: _0x538ed9.scaleY
    };
  }
  return null;
};
export const buildCopiedTextCommand = (_0x59fc77, _0xbc3a1e) => {
  const _0x58c032 = getViewportZoom(_0xbc3a1e);
  const _0x3bbbcb = TEXT_COPY_OFFSET_WORLD / _0x58c032;
  return {
    ..._0x59fc77,
    x: Number(_0x59fc77.x || 0) + _0x3bbbcb,
    y: Number(_0x59fc77.y || 0) + _0x3bbbcb
  };
};