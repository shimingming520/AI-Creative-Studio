const DEFAULT_ANALYSIS_MAX_DIMENSION = 512;
function clamp(_0x1a834e, _0x3b52db, _0x56bbe9) {
  return Math.max(_0x3b52db, Math.min(_0x56bbe9, _0x1a834e));
}
function finite(_0x5ab6e2, _0x2efd11 = 0) {
  const _0x307540 = Number(_0x5ab6e2);
  if (Number.isFinite(_0x307540)) {
    return _0x307540;
  } else {
    return _0x2efd11;
  }
}
function luminance(_0x1de222, _0x440506) {
  return _0x1de222[_0x440506] * 0.2126 + _0x1de222[_0x440506 + 1] * 0.7152 + _0x1de222[_0x440506 + 2] * 0.0722;
}
function normalizedVerticalFov(_0x144c99, _0x28a2f9) {
  const _0x3752de = clamp(finite(_0x144c99, 60), 10, 170) * Math.PI / 180;
  return Math.atan(Math.tan(_0x3752de / 2) / Math.max(0.1, _0x28a2f9)) * 2 * 180 / Math.PI;
}
function collectRowFeatures(_0x1368d6) {
  const {
    data: _0x5922ed,
    width: _0x41f066,
    height: _0xc5b6a4
  } = _0x1368d6;
  const _0x25e732 = new Float64Array(_0xc5b6a4);
  const _0x261ec2 = new Float64Array(_0xc5b6a4);
  const _0xc30b02 = new Float64Array(_0xc5b6a4);
  for (let _0x27ccb5 = 0; _0x27ccb5 < _0xc5b6a4; _0x27ccb5 += 1) {
    let _0x5d03eb = 0;
    let _0x507e4c = 0;
    let _0x3ecbca = 0;
    let _0x47b6e0 = 0;
    for (let _0x210ff3 = 0; _0x210ff3 < _0x41f066; _0x210ff3 += 1) {
      const _0x3126bd = (_0x27ccb5 * _0x41f066 + _0x210ff3) * 4;
      const _0x48b3cb = luminance(_0x5922ed, _0x3126bd);
      _0x5d03eb += _0x48b3cb;
      if (_0x210ff3 > 0) {
        _0x507e4c += Math.abs(_0x48b3cb - _0x47b6e0);
      }
      if (_0x27ccb5 > 0) {
        _0x3ecbca += Math.abs(_0x48b3cb - luminance(_0x5922ed, _0x3126bd - _0x41f066 * 4));
      }
      _0x47b6e0 = _0x48b3cb;
    }
    _0x25e732[_0x27ccb5] = _0x5d03eb / Math.max(1, _0x41f066);
    _0x261ec2[_0x27ccb5] = _0x507e4c / Math.max(1, _0x41f066 - 1);
    _0xc30b02[_0x27ccb5] = _0x3ecbca / Math.max(1, _0x41f066);
  }
  return {
    means: _0x25e732,
    textures: _0x261ec2,
    verticalEdges: _0xc30b02
  };
}
function windowMean(_0x14154f, _0x88edc, _0x3a8133) {
  let _0x1cf418 = 0;
  let _0x5a6224 = 0;
  for (let _0x4b301b = Math.max(0, _0x88edc); _0x4b301b < Math.min(_0x14154f.length, _0x3a8133); _0x4b301b += 1) {
    _0x1cf418 += _0x14154f[_0x4b301b];
    _0x5a6224 += 1;
  }
  if (_0x5a6224 > 0) {
    return _0x1cf418 / _0x5a6224;
  } else {
    return 0;
  }
}
function estimateHorizon(_0x411506) {
  const {
    height: _0x36852a
  } = _0x411506;
  const _0x3647f2 = collectRowFeatures(_0x411506);
  const _0x50487b = Math.max(2, Math.round(_0x36852a * 0.018));
  const _0x386870 = Math.max(_0x50487b, Math.round(_0x36852a * 0.16));
  const _0x5d3d1e = Math.min(_0x36852a - _0x50487b, Math.round(_0x36852a * 0.8));
  const _0x4d8050 = [];
  for (let _0xb44c8b = _0x386870; _0xb44c8b < _0x5d3d1e; _0xb44c8b += 1) {
    const _0x37a191 = Math.abs(windowMean(_0x3647f2.means, _0xb44c8b - _0x50487b, _0xb44c8b) - windowMean(_0x3647f2.means, _0xb44c8b, _0xb44c8b + _0x50487b));
    const _0x132fdc = Math.abs(windowMean(_0x3647f2.textures, _0xb44c8b - _0x50487b, _0xb44c8b) - windowMean(_0x3647f2.textures, _0xb44c8b, _0xb44c8b + _0x50487b));
    const _0x11f77d = _0xb44c8b / _0x36852a;
    const _0x2f48e1 = 0.62 + Math.exp(-Math.pow((_0x11f77d - 0.48) / 0.3, 2)) * 0.38;
    const _0x65b58a = (_0x37a191 * 0.58 + _0x132fdc * 0.22 + _0x3647f2.verticalEdges[_0xb44c8b] * 0.2) * _0x2f48e1;
    _0x4d8050.push({
      y: _0xb44c8b,
      score: _0x65b58a
    });
  }
  _0x4d8050.sort((_0x41d840, _0xfb25ab) => _0xfb25ab.score - _0x41d840.score);
  const _0x213c0a = _0x4d8050[0];
  if (!_0x213c0a || _0x213c0a.score < 0.5) {
    return {
      horizonY: 0.5,
      confidence: 0.2
    };
  }
  const _0x2afc95 = _0x4d8050[Math.floor(_0x4d8050.length / 2)]?.score || 0;
  const _0x5278 = _0x213c0a.score / Math.max(0.1, _0x2afc95);
  return {
    horizonY: clamp(_0x213c0a.y / _0x36852a, 0.12, 0.88),
    confidence: clamp(0.28 + (_0x5278 - 1) * 0.12 + _0x213c0a.score / 220, 0.25, 0.82)
  };
}
function estimateVanishingPointX(_0x247fcb, _0x1a8c30) {
  const {
    data: _0x50aee8,
    width: _0x154682,
    height: _0x27a3a0
  } = _0x247fcb;
  const _0x31cb1c = _0x1a8c30 * _0x27a3a0;
  const _0x429ace = 96;
  const _0x4018ee = new Float64Array(_0x429ace);
  let _0x4b1c31 = 0;
  for (let _0x153ce0 = Math.max(2, Math.round(_0x31cb1c + _0x27a3a0 * 0.025)); _0x153ce0 < _0x27a3a0 - 2; _0x153ce0 += 2) {
    for (let _0xd2a87b = 2; _0xd2a87b < _0x154682 - 2; _0xd2a87b += 2) {
      const _0x41d2fc = (_0x153ce0 * _0x154682 + _0xd2a87b) * 4;
      const _0x3411c1 = luminance(_0x50aee8, _0x41d2fc + 4) - luminance(_0x50aee8, _0x41d2fc - 4);
      const _0x50a0d3 = luminance(_0x50aee8, _0x41d2fc + _0x154682 * 4) - luminance(_0x50aee8, _0x41d2fc - _0x154682 * 4);
      const _0x423479 = Math.hypot(_0x3411c1, _0x50a0d3);
      if (_0x423479 < 38 || Math.abs(_0x3411c1) < 0.00001) {
        continue;
      }
      const _0x16375b = -_0x50a0d3 / _0x3411c1;
      const _0x584f0a = Math.abs(_0x16375b);
      if (_0x584f0a < 0.08 || _0x584f0a > 3.5) {
        continue;
      }
      const _0x464457 = _0xd2a87b + (_0x31cb1c - _0x153ce0) * _0x16375b;
      if (_0x464457 < -_0x154682 * 0.35 || _0x464457 > _0x154682 * 1.35) {
        continue;
      }
      const _0xd73ada = clamp(_0x464457 / _0x154682, 0, 0.999999);
      const _0x160c05 = Math.floor(_0xd73ada * _0x429ace);
      const _0x40e191 = Math.min(255, _0x423479);
      _0x4018ee[_0x160c05] += _0x40e191;
      _0x4b1c31 += _0x40e191;
    }
  }
  if (_0x4b1c31 <= 0) {
    return {
      vanishingPointX: 0.5,
      confidence: 0.12
    };
  }
  const _0xcb2047 = Array.from(_0x4018ee, (_0x139677, _0xb55a33) => (_0x4018ee[_0xb55a33 - 1] || 0) * 0.25 + _0x4018ee[_0xb55a33] + (_0x4018ee[_0xb55a33 + 1] || 0) * 0.25);
  let _0x577cc6 = 0;
  for (let _0x581f50 = 1; _0x581f50 < _0xcb2047.length; _0x581f50 += 1) {
    if (_0xcb2047[_0x581f50] > _0xcb2047[_0x577cc6]) {
      _0x577cc6 = _0x581f50;
    }
  }
  const _0x251c54 = _0xcb2047[_0x577cc6] / Math.max(1, _0x4b1c31);
  return {
    vanishingPointX: clamp((_0x577cc6 + 0.5) / _0x429ace, 0.05, 0.95),
    confidence: clamp(_0x251c54 * 5, 0.12, 0.7)
  };
}
export function extractStoryboard3DFocalLength35mmFromExif(_0x473eb) {
  const _0xe31974 = _0x473eb instanceof Uint8Array ? _0x473eb : new Uint8Array(_0x473eb || 0);
  if (_0xe31974.length < 16 || _0xe31974[0] !== 255 || _0xe31974[1] !== 216) {
    return null;
  }
  const _0x2e201a = new DataView(_0xe31974.buffer, _0xe31974.byteOffset, _0xe31974.byteLength);
  let _0x43d8ef = 2;
  while (_0x43d8ef + 4 <= _0xe31974.length) {
    if (_0xe31974[_0x43d8ef] !== 255) {
      break;
    }
    const _0x29997e = _0xe31974[_0x43d8ef + 1];
    if (_0x29997e === 218 || _0x29997e === 217) {
      break;
    }
    const _0x53d3ed = _0x2e201a.getUint16(_0x43d8ef + 2, false);
    if (_0x53d3ed < 2 || _0x43d8ef + 2 + _0x53d3ed > _0xe31974.length) {
      break;
    }
    if (_0x29997e === 225 && _0x53d3ed >= 14 && String.fromCharCode(..._0xe31974.subarray(_0x43d8ef + 4, _0x43d8ef + 10)) === "Exif\0\0") {
      const _0x5a0fbf = _0x43d8ef + 10;
      const _0x155e07 = String.fromCharCode(_0xe31974[_0x5a0fbf], _0xe31974[_0x5a0fbf + 1]);
      const _0x3ca370 = _0x155e07 === "II";
      if (!_0x3ca370 && _0x155e07 !== "MM") {
        return null;
      }
      const _0x17d0d2 = _0x261d8e => _0x2e201a.getUint16(_0x261d8e, _0x3ca370);
      const _0x4e13c3 = _0x1af141 => _0x2e201a.getUint32(_0x1af141, _0x3ca370);
      const _0x2a4f1f = (_0xac5e06, _0x40177f) => {
        if (_0xac5e06 < _0x5a0fbf || _0xac5e06 + 2 > _0xe31974.length) {
          return null;
        }
        const _0x19dc67 = _0x17d0d2(_0xac5e06);
        for (let _0x253d1e = 0; _0x253d1e < _0x19dc67; _0x253d1e += 1) {
          const _0x4b7657 = _0xac5e06 + 2 + _0x253d1e * 12;
          if (_0x4b7657 + 12 > _0xe31974.length) {
            break;
          }
          if (_0x17d0d2(_0x4b7657) === _0x40177f) {
            return _0x4b7657;
          }
        }
        return null;
      };
      const _0x53f21a = _0x5a0fbf + _0x4e13c3(_0x5a0fbf + 4);
      const _0x2f44f3 = _0x2a4f1f(_0x53f21a, 34665);
      if (!_0x2f44f3) {
        return null;
      }
      const _0x3ec361 = _0x5a0fbf + _0x4e13c3(_0x2f44f3 + 8);
      const _0x548576 = _0x2a4f1f(_0x3ec361, 41989);
      if (!_0x548576) {
        return null;
      }
      const _0x387500 = _0x17d0d2(_0x548576 + 2);
      const _0x3b9bf4 = _0x4e13c3(_0x548576 + 4);
      if (_0x3b9bf4 < 1) {
        return null;
      }
      const _0x18cacf = _0x387500 === 3 ? _0x17d0d2(_0x548576 + 8) : _0x387500 === 4 ? _0x4e13c3(_0x548576 + 8) : 0;
      if (_0x18cacf > 0) {
        return _0x18cacf;
      } else {
        return null;
      }
    }
    _0x43d8ef += 2 + _0x53d3ed;
  }
  return null;
}
export function estimateStoryboard3DBackgroundPerspective(_0x2e5333, {
  sourceWidth = _0x2e5333?.width,
  sourceHeight = _0x2e5333?.height,
  focalLength35mm = null
} = {}) {
  const _0x51db18 = Math.max(1, Math.round(finite(_0x2e5333?.width, 1)));
  const _0x1d2c96 = Math.max(1, Math.round(finite(_0x2e5333?.height, 1)));
  if (!_0x2e5333?.data || _0x2e5333.data.length < _0x51db18 * _0x1d2c96 * 4) {
    throw new TypeError("Background perspective estimation requires RGBA image data.");
  }
  const _0x599212 = estimateHorizon(_0x2e5333);
  const _0x11acce = estimateVanishingPointX(_0x2e5333, _0x599212.horizonY);
  const _0x5d18d1 = Math.max(1, Math.round(finite(sourceWidth, _0x51db18)));
  const _0x4ecfab = Math.max(1, Math.round(finite(sourceHeight, _0x1d2c96)));
  const _0x404c1a = _0x5d18d1 / _0x4ecfab;
  const _0x56abba = focalLength35mm > 0 ? Math.atan(36 / (focalLength35mm * 2)) * 2 * 180 / Math.PI : 60;
  const _0x4a4d48 = clamp(_0x599212.confidence * 0.7 + _0x11acce.confidence * 0.3, 0.2, focalLength35mm > 0 ? 0.9 : 0.78);
  const _0x491193 = clamp(_0x599212.horizonY, 0, 1);
  return {
    horizontalFov: clamp(_0x56abba, 10, 170),
    verticalFov: clamp(normalizedVerticalFov(_0x56abba, _0x404c1a), 10, 170),
    horizonY: _0x491193,
    horizonSlope: 0,
    vanishingPoint: [_0x11acce.vanishingPointX, _0x491193],
    cameraHeight: 1.6,
    imageWidth: _0x5d18d1,
    imageHeight: _0x4ecfab,
    groundRegion: [[0, _0x491193], [1, _0x491193], [1, 1], [0, 1]],
    calibrationMethod: focalLength35mm > 0 ? "exif-local-estimate" : "local-image-estimate",
    calibrationConfidence: _0x4a4d48
  };
}
async function readFocalLength35mm(_0x2babac) {
  if (!/^image\/jpe?g$/i.test(String(_0x2babac?.type || ""))) {
    return null;
  }
  if (typeof _0x2babac?.arrayBuffer !== "function") {
    return null;
  }
  try {
    return extractStoryboard3DFocalLength35mmFromExif(await _0x2babac.arrayBuffer());
  } catch {
    return null;
  }
}
export async function analyzeStoryboard3DBackgroundImage(_0x4917f2, {
  documentObject = globalThis.document,
  imageBitmapFactory = typeof globalThis.createImageBitmap === "function" ? globalThis.createImageBitmap.bind(globalThis) : null,
  maxDimension = DEFAULT_ANALYSIS_MAX_DIMENSION
} = {}) {
  if (!_0x4917f2) {
    throw new TypeError("Background image file is required.");
  }
  if (typeof imageBitmapFactory !== "function") {
    throw new Error("当前浏览器不支持本地背景透视分析。");
  }
  const _0x5e5330 = await imageBitmapFactory(_0x4917f2);
  try {
    const _0x4f05b6 = Math.max(1, Number(_0x5e5330?.width) || 1);
    const _0x2e6373 = Math.max(1, Number(_0x5e5330?.height) || 1);
    const _0xff0204 = Math.min(1, Math.max(64, Number(maxDimension) || DEFAULT_ANALYSIS_MAX_DIMENSION) / Math.max(_0x4f05b6, _0x2e6373));
    const _0x12cfb7 = Math.max(1, Math.round(_0x4f05b6 * _0xff0204));
    const _0x3e19e8 = Math.max(1, Math.round(_0x2e6373 * _0xff0204));
    const _0x49b8ec = documentObject?.createElement?.("canvas");
    const _0x2580f4 = _0x49b8ec?.getContext?.("2d", {
      willReadFrequently: true
    });
    if (!_0x49b8ec || !_0x2580f4) {
      throw new Error("无法创建背景透视分析画布。");
    }
    _0x49b8ec.width = _0x12cfb7;
    _0x49b8ec.height = _0x3e19e8;
    _0x2580f4.drawImage(_0x5e5330, 0, 0, _0x12cfb7, _0x3e19e8);
    const _0x8935b1 = _0x2580f4.getImageData(0, 0, _0x12cfb7, _0x3e19e8);
    return estimateStoryboard3DBackgroundPerspective(_0x8935b1, {
      sourceWidth: _0x4f05b6,
      sourceHeight: _0x2e6373,
      focalLength35mm: await readFocalLength35mm(_0x4917f2)
    });
  } finally {
    _0x5e5330?.close?.();
  }
}