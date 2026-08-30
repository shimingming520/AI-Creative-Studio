const FLOAT_PATTERN = "[-+]?(?:\\d*\\.\\d+|\\d+\\.?)(?:[eE][-+]?\\d+)?";
function finiteNumber(_0x2dafaf, _0xbc88db = 0) {
  const _0x4d681a = Number(_0x2dafaf);
  if (Number.isFinite(_0x4d681a)) {
    return _0x4d681a;
  } else {
    return _0xbc88db;
  }
}
function emptyBounds() {
  return {
    min: {
      x: Infinity,
      y: Infinity,
      z: Infinity
    },
    max: {
      x: -Infinity,
      y: -Infinity,
      z: -Infinity
    }
  };
}
function expandBounds(_0x1c2e0c, _0x44b7d1, _0xa175a7, _0x4a71ba) {
  _0x1c2e0c.min.x = Math.min(_0x1c2e0c.min.x, _0x44b7d1);
  _0x1c2e0c.min.y = Math.min(_0x1c2e0c.min.y, _0xa175a7);
  _0x1c2e0c.min.z = Math.min(_0x1c2e0c.min.z, _0x4a71ba);
  _0x1c2e0c.max.x = Math.max(_0x1c2e0c.max.x, _0x44b7d1);
  _0x1c2e0c.max.y = Math.max(_0x1c2e0c.max.y, _0xa175a7);
  _0x1c2e0c.max.z = Math.max(_0x1c2e0c.max.z, _0x4a71ba);
}
function finalizeBounds(_0x5025d1) {
  const _0x31ce9d = [_0x5025d1.min.x, _0x5025d1.min.y, _0x5025d1.min.z, _0x5025d1.max.x, _0x5025d1.max.y, _0x5025d1.max.z];
  if (_0x31ce9d.every(Number.isFinite)) {
    return _0x5025d1;
  } else {
    return null;
  }
}
function floatAttribute(_0x255168, _0x5ccc9d) {
  if (!_0x255168?.length) {
    return null;
  }
  const _0x5cad04 = new Float32Array(_0x255168);
  return {
    array: _0x5cad04.buffer,
    itemSize: _0x5ccc9d,
    count: _0x5cad04.length / _0x5ccc9d
  };
}
function createMeshPayload({
  name: _0x20a84a,
  materialName: _0xc89c2f,
  positions: _0x3b2b24,
  normals: _0x256dd9,
  uvs: _0x33c30b,
  colors: _0x27dac7
}) {
  const _0x26a3a6 = {
    position: floatAttribute(_0x3b2b24, 3)
  };
  const _0x4d14c3 = floatAttribute(_0x256dd9, 3);
  const _0x2f870e = floatAttribute(_0x33c30b, 2);
  const _0x1b2361 = floatAttribute(_0x27dac7, 3);
  if (_0x4d14c3) {
    _0x26a3a6.normal = _0x4d14c3;
  }
  if (_0x2f870e) {
    _0x26a3a6.uv = _0x2f870e;
  }
  if (_0x1b2361) {
    _0x26a3a6.color = _0x1b2361;
  }
  return {
    name: String(_0x20a84a || "Mesh"),
    materialName: String(_0xc89c2f || ""),
    attributes: _0x26a3a6,
    triangleCount: Math.floor(_0x3b2b24.length / 9)
  };
}
function resolveObjIndex(_0x542502, _0x333d74) {
  const _0x1886e4 = Number.parseInt(_0x542502, 10);
  if (!Number.isInteger(_0x1886e4) || _0x1886e4 === 0) {
    return -1;
  }
  const _0x2f6785 = _0x1886e4 > 0 ? _0x1886e4 - 1 : _0x333d74 + _0x1886e4;
  if (_0x2f6785 >= 0 && _0x2f6785 < _0x333d74) {
    return _0x2f6785;
  } else {
    return -1;
  }
}
function objVertex(_0x310b14, _0x22490d) {
  const [_0x5b0b82, _0x4b9b57, _0x4e5dfb] = String(_0x310b14 || "").split("/");
  return {
    position: resolveObjIndex(_0x5b0b82, _0x22490d.positions),
    uv: _0x4b9b57 ? resolveObjIndex(_0x4b9b57, _0x22490d.uvs) : -1,
    normal: _0x4e5dfb ? resolveObjIndex(_0x4e5dfb, _0x22490d.normals) : -1
  };
}
function pushTuple(_0x2021df, _0x59cba4, _0xb415ac, _0x29c85b, _0x203820 = 0) {
  for (let _0x1f90f1 = 0; _0x1f90f1 < _0x29c85b; _0x1f90f1 += 1) {
    _0x2021df.push(finiteNumber(_0x59cba4[_0xb415ac * _0x29c85b + _0x1f90f1], _0x203820));
  }
}
export function parseStoryboard3DObjGeometry(_0x59ed4c, {
  name = "OBJ model",
  onProgress: _0x23e7f3
} = {}) {
  const _0x12c37e = new TextDecoder().decode(_0x59ed4c);
  const _0x1a41d9 = _0x12c37e.split(/\r?\n/);
  const _0x996894 = [];
  const _0x5f0d6e = [];
  const _0x1782b4 = [];
  const _0x46cf8c = [];
  const _0x1c88b2 = [];
  const _0x127b43 = emptyBounds();
  let _0x5c474b = String(name || "OBJ model").replace(/\.obj$/i, "");
  let _0x4689ed = "";
  let _0x485d6e = null;
  const _0x41231f = () => {
    if (!_0x485d6e) {
      _0x485d6e = {
        name: _0x5c474b,
        materialName: _0x4689ed,
        positions: [],
        normals: [],
        uvs: [],
        hasNormals: true,
        hasUvs: true
      };
    }
    return _0x485d6e;
  };
  const _0x2651ab = () => {
    if (!_0x485d6e?.positions.length) {
      _0x485d6e = null;
      return;
    }
    _0x46cf8c.push(createMeshPayload({
      ..._0x485d6e,
      normals: _0x485d6e.hasNormals ? _0x485d6e.normals : [],
      uvs: _0x485d6e.hasUvs ? _0x485d6e.uvs : []
    }));
    _0x485d6e = null;
  };
  _0x23e7f3?.(0.08);
  for (let _0xf26087 = 0; _0xf26087 < _0x1a41d9.length; _0xf26087 += 1) {
    const _0x8d5560 = _0x1a41d9[_0xf26087].trim();
    if (!_0x8d5560 || _0x8d5560.startsWith("#")) {
      continue;
    }
    const _0x5bfe0 = _0x8d5560.search(/\s/);
    const _0xec5335 = _0x5bfe0 < 0 ? _0x8d5560 : _0x8d5560.slice(0, _0x5bfe0);
    const _0x45c772 = _0x5bfe0 < 0 ? "" : _0x8d5560.slice(_0x5bfe0).trim();
    if (_0xec5335 === "v") {
      const _0x40a616 = _0x45c772.split(/\s+/).slice(0, 3).map(Number);
      if (_0x40a616.length === 3 && _0x40a616.every(Number.isFinite)) {
        _0x996894.push(..._0x40a616);
      }
    } else if (_0xec5335 === "vn") {
      const _0x52cfd0 = _0x45c772.split(/\s+/).slice(0, 3).map(Number);
      if (_0x52cfd0.length === 3 && _0x52cfd0.every(Number.isFinite)) {
        _0x5f0d6e.push(..._0x52cfd0);
      }
    } else if (_0xec5335 === "vt") {
      const _0x4f9fdd = _0x45c772.split(/\s+/).slice(0, 2).map(Number);
      if (_0x4f9fdd.length >= 2 && _0x4f9fdd.every(Number.isFinite)) {
        _0x1782b4.push(..._0x4f9fdd);
      }
    } else if (_0xec5335 === "o" || _0xec5335 === "g") {
      _0x2651ab();
      _0x5c474b = _0x45c772 || _0x5c474b;
    } else if (_0xec5335 === "usemtl") {
      _0x2651ab();
      _0x4689ed = _0x45c772;
    } else if (_0xec5335 === "mtllib") {
      if (_0x45c772) {
        _0x1c88b2.push(_0x45c772);
      }
    } else if (_0xec5335 === "f") {
      const _0x2d15b0 = _0x45c772.split(/\s+/).filter(Boolean).map(_0x4497ce => objVertex(_0x4497ce, {
        positions: _0x996894.length / 3,
        normals: _0x5f0d6e.length / 3,
        uvs: _0x1782b4.length / 2
      }));
      if (_0x2d15b0.length < 3 || _0x2d15b0.some(_0x48732e => _0x48732e.position < 0)) {
        continue;
      }
      const _0xc343b3 = _0x41231f();
      for (let _0x107263 = 1; _0x107263 < _0x2d15b0.length - 1; _0x107263 += 1) {
        for (const _0x1d4379 of [_0x2d15b0[0], _0x2d15b0[_0x107263], _0x2d15b0[_0x107263 + 1]]) {
          pushTuple(_0xc343b3.positions, _0x996894, _0x1d4379.position, 3);
          const _0x14fa09 = _0xc343b3.positions.length - 3;
          expandBounds(_0x127b43, _0xc343b3.positions[_0x14fa09], _0xc343b3.positions[_0x14fa09 + 1], _0xc343b3.positions[_0x14fa09 + 2]);
          if (_0x1d4379.normal >= 0) {
            pushTuple(_0xc343b3.normals, _0x5f0d6e, _0x1d4379.normal, 3);
          } else {
            _0xc343b3.hasNormals = false;
          }
          if (_0x1d4379.uv >= 0) {
            pushTuple(_0xc343b3.uvs, _0x1782b4, _0x1d4379.uv, 2);
          } else {
            _0xc343b3.hasUvs = false;
          }
        }
      }
    }
    if (_0xf26087 > 0 && _0xf26087 % 4096 === 0) {
      _0x23e7f3?.(0.08 + _0xf26087 / Math.max(1, _0x1a41d9.length) * 0.82);
    }
  }
  _0x2651ab();
  if (!_0x46cf8c.length) {
    throw new Error("OBJ did not contain any triangle faces.");
  }
  _0x23e7f3?.(1);
  return {
    format: "obj",
    name: String(name || "OBJ model").replace(/\.obj$/i, ""),
    meshes: _0x46cf8c,
    bounds: finalizeBounds(_0x127b43),
    triangleCount: _0x46cf8c.reduce((_0x34faff, _0x42be0c) => _0x34faff + _0x42be0c.triangleCount, 0),
    materialLibraries: _0x1c88b2
  };
}
function isBinaryStl(_0x463d21) {
  if (_0x463d21.byteLength < 84) {
    return false;
  }
  const _0x3f8da5 = new DataView(_0x463d21.buffer, _0x463d21.byteOffset, _0x463d21.byteLength).getUint32(80, true);
  return 84 + _0x3f8da5 * 50 <= _0x463d21.byteLength;
}
function parseBinaryStl(_0xdfef42, _0x42cca2) {
  const _0x27f180 = new DataView(_0xdfef42.buffer, _0xdfef42.byteOffset, _0xdfef42.byteLength);
  const _0x1ad5b3 = _0x27f180.getUint32(80, true);
  const _0x2c73fe = new Float32Array(_0x1ad5b3 * 9);
  const _0xd101dc = new Float32Array(_0x1ad5b3 * 9);
  const _0x5f021e = emptyBounds();
  let _0x1ebb2b = 0;
  let _0x219980 = 84;
  _0x42cca2?.(0.08);
  for (let _0x33ddf4 = 0; _0x33ddf4 < _0x1ad5b3; _0x33ddf4 += 1) {
    const _0x19ccf9 = _0x27f180.getFloat32(_0x219980, true);
    const _0x1d7b1a = _0x27f180.getFloat32(_0x219980 + 4, true);
    const _0x5aec07 = _0x27f180.getFloat32(_0x219980 + 8, true);
    _0x219980 += 12;
    for (let _0x6dbef1 = 0; _0x6dbef1 < 3; _0x6dbef1 += 1) {
      const _0x3ee81e = _0x27f180.getFloat32(_0x219980, true);
      const _0x364dc9 = _0x27f180.getFloat32(_0x219980 + 4, true);
      const _0x16f81c = _0x27f180.getFloat32(_0x219980 + 8, true);
      _0x2c73fe[_0x1ebb2b] = _0x3ee81e;
      _0x2c73fe[_0x1ebb2b + 1] = _0x364dc9;
      _0x2c73fe[_0x1ebb2b + 2] = _0x16f81c;
      _0xd101dc[_0x1ebb2b] = _0x19ccf9;
      _0xd101dc[_0x1ebb2b + 1] = _0x1d7b1a;
      _0xd101dc[_0x1ebb2b + 2] = _0x5aec07;
      expandBounds(_0x5f021e, _0x3ee81e, _0x364dc9, _0x16f81c);
      _0x1ebb2b += 3;
      _0x219980 += 12;
    }
    _0x219980 += 2;
    if (_0x33ddf4 > 0 && _0x33ddf4 % 8192 === 0) {
      _0x42cca2?.(0.08 + _0x33ddf4 / Math.max(1, _0x1ad5b3) * 0.82);
    }
  }
  return {
    positions: _0x2c73fe,
    normals: _0xd101dc,
    bounds: finalizeBounds(_0x5f021e),
    triangleCount: _0x1ad5b3
  };
}
function parseAsciiStl(_0x46897f, _0x233c5e) {
  const _0x40184b = new TextDecoder().decode(_0x46897f);
  const _0x272193 = new RegExp("facet\\s+normal\\s+(" + FLOAT_PATTERN + ")\\s+(" + FLOAT_PATTERN + ")\\s+(" + FLOAT_PATTERN + ")\\s+outer\\s+loop([\\s\\S]*?)endloop", "gi");
  const _0x1d2395 = new RegExp("vertex\\s+(" + FLOAT_PATTERN + ")\\s+(" + FLOAT_PATTERN + ")\\s+(" + FLOAT_PATTERN + ")", "gi");
  const _0x2cda6f = [];
  const _0x56acab = [];
  const _0xb17793 = emptyBounds();
  let _0x28def6;
  let _0x3ec4c3 = 0;
  _0x233c5e?.(0.08);
  while (_0x28def6 = _0x272193.exec(_0x40184b)) {
    const _0x74e019 = _0x28def6.slice(1, 4).map(Number);
    const _0x3e55f1 = [..._0x28def6[4].matchAll(_0x1d2395)].slice(0, 3);
    if (_0x3e55f1.length !== 3) {
      continue;
    }
    for (const _0x566a8f of _0x3e55f1) {
      const _0x31e1ba = _0x566a8f.slice(1, 4).map(Number);
      _0x2cda6f.push(..._0x31e1ba);
      _0x56acab.push(..._0x74e019);
      expandBounds(_0xb17793, _0x31e1ba[0], _0x31e1ba[1], _0x31e1ba[2]);
    }
    _0x3ec4c3 += 1;
    if (_0x3ec4c3 % 4096 === 0) {
      _0x233c5e?.(Math.min(0.9, _0x272193.lastIndex / Math.max(1, _0x40184b.length)));
    }
  }
  if (!_0x3ec4c3) {
    throw new Error("STL did not contain any triangle facets.");
  }
  return {
    positions: new Float32Array(_0x2cda6f),
    normals: new Float32Array(_0x56acab),
    bounds: finalizeBounds(_0xb17793),
    triangleCount: _0x3ec4c3
  };
}
export function parseStoryboard3DStlGeometry(_0x214341, {
  name = "STL model",
  onProgress: _0xb25776
} = {}) {
  const _0x388af7 = _0x214341 instanceof Uint8Array ? _0x214341 : new Uint8Array(_0x214341);
  const _0x49e64a = isBinaryStl(_0x388af7) ? parseBinaryStl(_0x388af7, _0xb25776) : parseAsciiStl(_0x388af7, _0xb25776);
  _0xb25776?.(1);
  return {
    format: "stl",
    name: String(name || "STL model").replace(/\.stl$/i, ""),
    meshes: [{
      name: String(name || "STL model").replace(/\.stl$/i, ""),
      materialName: "",
      attributes: {
        position: {
          array: _0x49e64a.positions.buffer,
          itemSize: 3,
          count: _0x49e64a.positions.length / 3
        },
        normal: {
          array: _0x49e64a.normals.buffer,
          itemSize: 3,
          count: _0x49e64a.normals.length / 3
        }
      },
      triangleCount: _0x49e64a.triangleCount
    }],
    bounds: _0x49e64a.bounds,
    triangleCount: _0x49e64a.triangleCount,
    materialLibraries: []
  };
}
export function parseStoryboard3DWorkerGeometry({
  format: _0x4471ea,
  buffer: _0x4da9f3,
  name: _0xb7b555,
  onProgress: _0x22d314
} = {}) {
  if (!(_0x4da9f3 instanceof ArrayBuffer)) {
    throw new TypeError("Worker geometry import requires an ArrayBuffer.");
  }
  if (_0x4471ea === "obj") {
    return parseStoryboard3DObjGeometry(_0x4da9f3, {
      name: _0xb7b555,
      onProgress: _0x22d314
    });
  }
  if (_0x4471ea === "stl") {
    return parseStoryboard3DStlGeometry(_0x4da9f3, {
      name: _0xb7b555,
      onProgress: _0x22d314
    });
  }
  throw new Error("Worker geometry import does not support " + String(_0x4471ea || "unknown").toUpperCase() + ".");
}
export function collectStoryboard3DGeometryTransferables(_0x139f4b) {
  const _0x4a0e7c = [];
  for (const _0x43a8d6 of _0x139f4b?.meshes || []) {
    for (const _0x525534 of Object.values(_0x43a8d6?.attributes || {})) {
      if (_0x525534?.array instanceof ArrayBuffer) {
        _0x4a0e7c.push(_0x525534.array);
      }
    }
    if (_0x43a8d6?.index?.array instanceof ArrayBuffer) {
      _0x4a0e7c.push(_0x43a8d6.index.array);
    }
  }
  return _0x4a0e7c;
}