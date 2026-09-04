import * as a1086_0x34997f from "./threeRuntime.js";
import { createSelectionRing } from "./scene3dTheme.js";
function createSceneAssetGeometry(_0x4d40e2) {
  if (_0x4d40e2?.primitive === "cylinder") {
    return new a1086_0x34997f.CylinderGeometry(Number(_0x4d40e2.radiusTop) || 0.5, Number(_0x4d40e2.radiusBottom) || 0.5, Number(_0x4d40e2.height) || 1, 18);
  }
  if (_0x4d40e2?.primitive === "sphere") {
    return new a1086_0x34997f.SphereGeometry(Number(_0x4d40e2.radius) || 0.5, 18, 12);
  }
  if (_0x4d40e2?.primitive === "torus") {
    return new a1086_0x34997f.TorusGeometry(Number(_0x4d40e2.radius) || 0.5, Number(_0x4d40e2.tube) || 0.08, 10, 24);
  }
  const _0x19e3c1 = _0x4d40e2?.size || {};
  return new a1086_0x34997f.BoxGeometry(Number(_0x19e3c1.x) || 1, Number(_0x19e3c1.y) || 1, Number(_0x19e3c1.z) || 1);
}
export function createSceneAssetVisual(_0x3cf364, _0x2fda76, _0x1787a5) {
  const _0x7a75f6 = new a1086_0x34997f.Group();
  const _0xa60b5f = new a1086_0x34997f.Group();
  _0x7a75f6.add(_0xa60b5f);
  const _0x142e91 = new Map();
  const _0x1ae58d = new Map();
  const _0x3fe0df = "__default";
  const _0x24218a = _0x2cbbab => {
    const _0x2e18ec = _0x2cbbab || _0x3fe0df;
    if (!_0x142e91.has(_0x2e18ec)) {
      const _0x3708e9 = _0x2cbbab ? _0x1787a5(_0x2cbbab) : _0x2fda76;
      _0x142e91.set(_0x2e18ec, new a1086_0x34997f.MeshStandardMaterial({
        color: _0x3708e9,
        roughness: 0.55,
        metalness: _0x3cf364?.category === "stage" ? 0.14 : 0.04
      }));
      _0x1ae58d.set(_0x2e18ec, new a1086_0x34997f.LineBasicMaterial({
        color: new a1086_0x34997f.Color(_0x3708e9).clone().offsetHSL(0, 0, -0.18),
        transparent: true,
        opacity: 0.78
      }));
    }
    return {
      material: _0x142e91.get(_0x2e18ec),
      edgeMaterial: _0x1ae58d.get(_0x2e18ec)
    };
  };
  const _0x427d13 = Array.isArray(_0x3cf364?.parts) && _0x3cf364.parts.length > 0 ? _0x3cf364.parts : [{
    primitive: "box",
    size: {
      x: 1,
      y: 1,
      z: 1
    },
    position: {
      x: 0,
      y: 0.5,
      z: 0
    },
    rotation: {
      x: 0,
      y: 0,
      z: 0
    }
  }];
  _0x427d13.forEach(_0x126661 => {
    const _0x4163ac = createSceneAssetGeometry(_0x126661);
    const {
      material: _0x332a18,
      edgeMaterial: _0x3625ab
    } = _0x24218a(_0x126661.colorKey);
    const _0x30f08a = new a1086_0x34997f.Mesh(_0x4163ac, _0x332a18);
    _0x30f08a.position.set(Number(_0x126661?.position?.x) || 0, Number(_0x126661?.position?.y) || 0, Number(_0x126661?.position?.z) || 0);
    _0x30f08a.rotation.set(Number(_0x126661?.rotation?.x) || 0, Number(_0x126661?.rotation?.y) || 0, Number(_0x126661?.rotation?.z) || 0);
    _0xa60b5f.add(_0x30f08a);
    const _0x1a4806 = new a1086_0x34997f.LineSegments(new a1086_0x34997f.EdgesGeometry(_0x4163ac), _0x3625ab);
    _0x1a4806.position.copy(_0x30f08a.position);
    _0x1a4806.rotation.copy(_0x30f08a.rotation);
    _0xa60b5f.add(_0x1a4806);
  });
  const _0x4aea10 = createSelectionRing(8238335);
  _0x7a75f6.add(_0x4aea10);
  const _0x257a14 = _0x142e91.get(_0x3fe0df) || _0x142e91.values().next().value;
  const _0x305ae8 = _0x1ae58d.get(_0x3fe0df) || _0x1ae58d.values().next().value;
  return {
    assetId: _0x3cf364?.id || null,
    group: _0x7a75f6,
    content: _0xa60b5f,
    material: _0x257a14,
    edgeMaterial: _0x305ae8,
    materialsByColorKey: _0x142e91,
    edgeMaterialsByColorKey: _0x1ae58d,
    selectionRing: _0x4aea10
  };
}
export function applySceneAssetColors(_0x215ecb, _0x3679ee, _0x434dc4) {
  _0x215ecb?.materialsByColorKey?.forEach((_0x3c008b, _0x1815ec) => {
    _0x3c008b.color.copy(_0x1815ec === "__default" ? _0x3679ee : _0x434dc4(_0x1815ec));
  });
  _0x215ecb?.edgeMaterialsByColorKey?.forEach((_0x4d3126, _0x2414e5) => {
    const _0x1f08a4 = _0x2414e5 === "__default" ? _0x3679ee : _0x434dc4(_0x2414e5);
    _0x4d3126.color.copy(new a1086_0x34997f.Color(_0x1f08a4).offsetHSL(0, 0, -0.18));
  });
}