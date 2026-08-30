import * as a1236_0x5e6c14 from "../panoramaSceneNode/threeRuntime.js";
import { resolveSceneAsset } from "../panoramaSceneNode/sceneAssetCatalog.js";
import { createSceneAssetVisual } from "../panoramaSceneNode/scene3dProceduralAssetVisual.js";
const DEFAULT_CACHE_LIMIT = 512;
const DEFAULT_WIDTH = 240;
const DEFAULT_HEIGHT = 150;
const PREVIEW_COLORS = Object.freeze({
  blue: 7252223,
  red: 15693687,
  green: 7327639,
  yellow: 15911277,
  purple: 11834357,
  white: 15265269
});
function normalizeText(_0x37140c) {
  return String(_0x37140c || "").trim();
}
function createCacheKey(_0x1cd451) {
  const _0x2a29db = normalizeText(_0x1cd451?.id);
  const _0x529c15 = normalizeText(_0x1cd451?.source?.url || _0x1cd451?.url);
  if (_0x2a29db) {
    return _0x2a29db + "::" + _0x529c15;
  } else {
    return "";
  }
}
export function createStoryboard3DAssetThumbnailCache({
  limit = DEFAULT_CACHE_LIMIT
} = {}) {
  const _0xa49c80 = new Map();
  const _0xa33ecf = Math.max(1, Math.floor(Number(limit) || DEFAULT_CACHE_LIMIT));
  return {
    get(_0xea2c60) {
      const _0x4b8fc7 = createCacheKey(_0xea2c60);
      if (!_0x4b8fc7 || !_0xa49c80.has(_0x4b8fc7)) {
        return "";
      }
      const _0x260d18 = _0xa49c80.get(_0x4b8fc7);
      _0xa49c80.delete(_0x4b8fc7);
      _0xa49c80.set(_0x4b8fc7, _0x260d18);
      return _0x260d18;
    },
    set(_0x365999, _0x2e1ca1) {
      const _0x126a1c = createCacheKey(_0x365999);
      const _0x2cca96 = normalizeText(_0x2e1ca1);
      if (!_0x126a1c || !_0x2cca96) {
        return "";
      }
      _0xa49c80.delete(_0x126a1c);
      _0xa49c80.set(_0x126a1c, _0x2cca96);
      while (_0xa49c80.size > _0xa33ecf) {
        _0xa49c80.delete(_0xa49c80.keys().next().value);
      }
      return _0x2cca96;
    },
    clear() {
      _0xa49c80.clear();
    },
    get size() {
      return _0xa49c80.size;
    }
  };
}
export const storyboard3DAssetThumbnailCache = createStoryboard3DAssetThumbnailCache();
export function createStoryboard3DBuiltinAssetThumbnailModel(_0x3c4cfe, {
  clayColor = ""
} = {}) {
  const _0x280579 = resolveSceneAsset(_0x3c4cfe, "");
  if (!_0x280579 || _0x280579.id !== _0x3c4cfe) {
    return null;
  }
  const _0x548024 = normalizeText(clayColor);
  const _0x78d50e = _0x7790f6 => new a1236_0x5e6c14.Color(_0x548024 || PREVIEW_COLORS[_0x7790f6] || PREVIEW_COLORS.blue);
  const _0xaa275 = createSceneAssetVisual(_0x280579, _0x78d50e(_0x280579.colorKey), _0x78d50e);
  if (_0xaa275.selectionRing) {
    _0xaa275.selectionRing.visible = false;
  }
  return _0xaa275.group;
}
export function disposeStoryboard3DAssetThumbnailModel(_0x5142bc) {
  _0x5142bc?.traverse?.(_0x27ba16 => {
    _0x27ba16.geometry?.dispose?.();
    const _0x94bce1 = Array.isArray(_0x27ba16.material) ? _0x27ba16.material : [_0x27ba16.material];
    _0x94bce1.filter(Boolean).forEach(_0x3143df => _0x3143df.dispose?.());
  });
}
function createPreviewScene(_0x2bcaa3) {
  const _0x35d3b0 = new a1236_0x5e6c14.Scene();
  _0x35d3b0.background = new a1236_0x5e6c14.Color(1513760);
  _0x35d3b0.add(new a1236_0x5e6c14.HemisphereLight(15922943, 3159101, 1.7));
  const _0x3ab831 = new a1236_0x5e6c14.DirectionalLight(16777215, 2.2);
  _0x3ab831.position.set(4, 7, 5);
  const _0x841477 = new a1236_0x5e6c14.DirectionalLight(9156863, 1.1);
  _0x841477.position.set(-5, 3, -4);
  _0x35d3b0.add(_0x3ab831, _0x841477, _0x2bcaa3);
  return _0x35d3b0;
}
export function createStoryboard3DAssetThumbnailFraming(_0x2dba22, {
  aspect = DEFAULT_WIDTH / DEFAULT_HEIGHT
} = {}) {
  _0x2dba22?.updateMatrixWorld?.(true);
  const _0x3a3449 = new a1236_0x5e6c14.Box3().setFromObject(_0x2dba22, true);
  if (_0x3a3449.isEmpty()) {
    throw new Error("模型没有可渲染的几何体。");
  }
  const _0x2d3693 = _0x3a3449.getCenter(new a1236_0x5e6c14.Vector3());
  const _0xe5e14f = _0x3a3449.getBoundingSphere(new a1236_0x5e6c14.Sphere());
  const _0xd0640b = Math.max(0.08, Number(_0xe5e14f.radius) || 0.08);
  const _0x3275ab = new a1236_0x5e6c14.PerspectiveCamera(32, Math.max(0.1, Number(aspect) || 1), 0.01, _0xd0640b * 30);
  const _0x57a19a = new a1236_0x5e6c14.Vector3(1.35, 0.85, 1.35).normalize();
  const _0x1b1dfc = a1236_0x5e6c14.MathUtils.degToRad(_0x3275ab.fov * 0.5);
  const _0x44de6e = Math.max(_0xd0640b * 2.4, _0xd0640b / Math.sin(_0x1b1dfc) * 1.12);
  _0x3275ab.position.copy(_0x2d3693).addScaledVector(_0x57a19a, _0x44de6e);
  _0x3275ab.near = Math.max(0.01, _0x44de6e - _0xd0640b * 2.2);
  _0x3275ab.far = _0x44de6e + _0xd0640b * 4;
  _0x3275ab.lookAt(_0x2d3693);
  _0x3275ab.updateProjectionMatrix();
  return {
    bounds: _0x3a3449,
    camera: _0x3275ab,
    center: _0x2d3693,
    distance: _0x44de6e,
    radius: _0xd0640b
  };
}
export function createStoryboard3DAssetThumbnailRenderer({
  documentObject = globalThis.document,
  rendererFactory = _0x2b64f8 => new a1236_0x5e6c14.WebGLRenderer(_0x2b64f8),
  width = DEFAULT_WIDTH,
  height = DEFAULT_HEIGHT
} = {}) {
  const _0x2dcfd2 = Math.max(96, Math.floor(Number(width) || DEFAULT_WIDTH));
  const _0x368b62 = Math.max(72, Math.floor(Number(height) || DEFAULT_HEIGHT));
  let _0x508c8e = null;
  function _0x598aef() {
    if (_0x508c8e) {
      return _0x508c8e;
    }
    const _0x53c703 = documentObject?.createElement?.("canvas");
    if (!_0x53c703) {
      throw new Error("当前环境无法创建模型缩略图画布。");
    }
    _0x508c8e = rendererFactory({
      canvas: _0x53c703,
      antialias: true,
      alpha: false,
      preserveDrawingBuffer: true,
      powerPreference: "low-power"
    });
    _0x508c8e.setPixelRatio?.(1);
    _0x508c8e.setSize?.(_0x2dcfd2, _0x368b62, false);
    if ("outputColorSpace" in _0x508c8e) {
      _0x508c8e.outputColorSpace = a1236_0x5e6c14.SRGBColorSpace;
    }
    return _0x508c8e;
  }
  return {
    render(_0x3a5958) {
      if (!_0x3a5958?.clone) {
        throw new Error("模型场景不可用于生成缩略图。");
      }
      const _0x497bdc = _0x3a5958.clone(true);
      const _0x3a3f88 = createPreviewScene(_0x497bdc);
      const {
        camera: _0x33cba1
      } = createStoryboard3DAssetThumbnailFraming(_0x497bdc, {
        aspect: _0x2dcfd2 / _0x368b62
      });
      const _0x17d4a3 = _0x598aef();
      _0x17d4a3.render(_0x3a3f88, _0x33cba1);
      const _0x59a116 = normalizeText(_0x17d4a3.domElement?.toDataURL?.("image/jpeg", 0.82));
      if (!_0x59a116) {
        throw new Error("模型缩略图渲染失败。");
      }
      _0x3a3f88.remove(_0x497bdc);
      return _0x59a116;
    },
    dispose() {
      _0x508c8e?.dispose?.();
      _0x508c8e?.forceContextLoss?.();
      _0x508c8e = null;
    }
  };
}