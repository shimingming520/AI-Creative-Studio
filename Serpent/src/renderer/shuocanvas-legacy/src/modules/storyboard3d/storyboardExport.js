export const STORYBOARD_EXPORT_ASPECT_RATIOS = Object.freeze({
  "16:9": 16 / 9,
  "9:16": 9 / 16,
  "1:1": 1,
  "2.39:1": 2.39
});
export const STORYBOARD_EXPORT_RESOLUTIONS = Object.freeze({
  "720p": 720,
  "1080p": 1080,
  "2K": 1440,
  "4K": 2160
});
const DEFAULT_PALETTE = Object.freeze({
  background: "#0b0c10",
  cellBackground: "#171922",
  text: "#f4f6fb",
  mutedText: "#9ba3b4",
  line: "#42485a",
  guide: "rgba(255,255,255,0.38)"
});
function toPositiveInteger(_0x303bbc, _0x1115ef, {
  min = 1,
  max = Number.MAX_SAFE_INTEGER
} = {}) {
  const _0x41079d = Math.round(Number(_0x303bbc));
  if (!Number.isFinite(_0x41079d)) {
    return _0x1115ef;
  }
  return Math.min(max, Math.max(min, _0x41079d));
}
function normalizeAspectRatio(_0x2ad975) {
  const _0x22ba5b = String(_0x2ad975 || "16:9");
  if (Object.hasOwn(STORYBOARD_EXPORT_ASPECT_RATIOS, _0x22ba5b)) {
    return {
      key: _0x22ba5b,
      value: STORYBOARD_EXPORT_ASPECT_RATIOS[_0x22ba5b]
    };
  }
  const _0x522cd2 = Number(_0x2ad975);
  if (Number.isFinite(_0x522cd2) && _0x522cd2 > 0) {
    return {
      key: _0x522cd2 + ":1",
      value: _0x522cd2
    };
  }
  return {
    key: "16:9",
    value: STORYBOARD_EXPORT_ASPECT_RATIOS["16:9"]
  };
}
export function resolveStoryboardExportDimensions({
  aspectRatio = "16:9",
  resolution = "1080p"
} = {}) {
  const _0x4df086 = normalizeAspectRatio(aspectRatio);
  const _0x3f802f = STORYBOARD_EXPORT_RESOLUTIONS[resolution] || toPositiveInteger(resolution, STORYBOARD_EXPORT_RESOLUTIONS["1080p"], {
    min: 240,
    max: 4320
  });
  const _0x108d01 = _0x4df086.value >= 1 ? Math.round(_0x3f802f * _0x4df086.value) : _0x3f802f;
  const _0x12e1d7 = _0x4df086.value >= 1 ? _0x3f802f : Math.round(_0x3f802f / _0x4df086.value);
  return {
    aspectRatio: _0x4df086.key,
    ratio: _0x4df086.value,
    resolution: String(resolution),
    width: _0x108d01,
    height: _0x12e1d7
  };
}
export function calculateStoryboardGridLayout({
  count: _0x482149,
  columns = 3,
  frameWidth: _0x2ce48c,
  frameHeight: _0x5dae15,
  metadataHeight = 160,
  gap = 24,
  padding = 32,
  maxSide = 16384,
  maxPixels = 120000000
} = {}) {
  const _0x5b7e8a = toPositiveInteger(_0x482149, 1, {
    max: 1000
  });
  const _0x38c5a1 = toPositiveInteger(columns, 3, {
    max: _0x5b7e8a
  });
  const _0x1195b9 = Math.ceil(_0x5b7e8a / _0x38c5a1);
  const _0x27f1b0 = toPositiveInteger(_0x2ce48c, 1920, {
    min: 64,
    max: 8192
  });
  const _0x5e70cf = toPositiveInteger(_0x5dae15, 1080, {
    min: 64,
    max: 8192
  });
  const _0x2316a7 = toPositiveInteger(metadataHeight, 160, {
    min: 0,
    max: 800
  });
  const _0xa8c84a = toPositiveInteger(gap, 24, {
    min: 0,
    max: 256
  });
  const _0x5d8af1 = toPositiveInteger(padding, 32, {
    min: 0,
    max: 512
  });
  const _0xfee0eb = _0x5e70cf + _0x2316a7;
  const _0x495850 = _0x5d8af1 * 2 + _0x38c5a1 * _0x27f1b0 + Math.max(0, _0x38c5a1 - 1) * _0xa8c84a;
  const _0x398884 = _0x5d8af1 * 2 + _0x1195b9 * _0xfee0eb + Math.max(0, _0x1195b9 - 1) * _0xa8c84a;
  if (_0x495850 > maxSide || _0x398884 > maxSide || _0x495850 * _0x398884 > maxPixels) {
    throw new RangeError("Storyboard export is too large (" + _0x495850 + "×" + _0x398884 + "). Reduce resolution or grid size.");
  }
  return {
    count: _0x5b7e8a,
    columns: _0x38c5a1,
    rows: _0x1195b9,
    cellWidth: _0x27f1b0,
    cellHeight: _0xfee0eb,
    frameWidth: _0x27f1b0,
    frameHeight: _0x5e70cf,
    metadataHeight: _0x2316a7,
    gap: _0xa8c84a,
    padding: _0x5d8af1,
    width: _0x495850,
    height: _0x398884,
    getCellRect(_0x20c88a) {
      const _0x1643ea = toPositiveInteger(Number(_0x20c88a) + 1, 1, {
        max: _0x5b7e8a
      }) - 1;
      const _0x36e272 = _0x1643ea % _0x38c5a1;
      const _0x4fdee5 = Math.floor(_0x1643ea / _0x38c5a1);
      return {
        x: _0x5d8af1 + _0x36e272 * (_0x27f1b0 + _0xa8c84a),
        y: _0x5d8af1 + _0x4fdee5 * (_0xfee0eb + _0xa8c84a),
        width: _0x27f1b0,
        height: _0xfee0eb,
        frameHeight: _0x5e70cf,
        metadataHeight: _0x2316a7
      };
    }
  };
}
function createDefaultCanvas(_0x40b101, _0x193a0d, {
  documentObject = globalThis.document
} = {}) {
  const _0x529f93 = globalThis.OffscreenCanvas;
  if (typeof _0x529f93 === "function") {
    return new _0x529f93(_0x40b101, _0x193a0d);
  }
  const _0x25ed81 = documentObject?.createElement?.("canvas");
  if (!_0x25ed81) {
    throw new Error("Canvas export is unavailable in this runtime.");
  }
  _0x25ed81.width = _0x40b101;
  _0x25ed81.height = _0x193a0d;
  return _0x25ed81;
}
async function canvasToBlob(_0x3a1c27, {
  mimeType = "image/png",
  quality = 0.92
} = {}) {
  if (typeof _0x3a1c27?.convertToBlob === "function") {
    return _0x3a1c27.convertToBlob({
      type: mimeType,
      quality: quality
    });
  }
  if (typeof _0x3a1c27?.toBlob === "function") {
    return new Promise((_0x5f1a83, _0xc26c89) => {
      _0x3a1c27.toBlob(_0x3904b6 => _0x3904b6 ? _0x5f1a83(_0x3904b6) : _0xc26c89(new Error("Canvas encoding failed.")), mimeType, quality);
    });
  }
  throw new Error("Canvas blob encoding is unavailable in this runtime.");
}
function getFrameSize(_0x4af3d2) {
  const _0x11432c = _0x4af3d2?.image || _0x4af3d2;
  return {
    source: _0x11432c,
    width: Number(_0x4af3d2?.width || _0x11432c?.videoWidth || _0x11432c?.naturalWidth || _0x11432c?.width || 0),
    height: Number(_0x4af3d2?.height || _0x11432c?.videoHeight || _0x11432c?.naturalHeight || _0x11432c?.height || 0)
  };
}
function drawFrameCover(_0x43cc79, _0x28b575, _0x4e3cd4, _0x3a396f) {
  _0x43cc79.fillStyle = _0x3a396f.cellBackground;
  _0x43cc79.fillRect(_0x4e3cd4.x, _0x4e3cd4.y, _0x4e3cd4.width, _0x4e3cd4.height);
  const {
    source: _0x2791b9,
    width: _0x4924e4,
    height: _0x580c79
  } = getFrameSize(_0x28b575);
  if (!_0x2791b9 || _0x4924e4 <= 0 || _0x580c79 <= 0) {
    return;
  }
  const _0x5beba8 = _0x4924e4 / _0x580c79;
  const _0x326ab3 = _0x4e3cd4.width / _0x4e3cd4.height;
  let _0x4d317b = 0;
  let _0x1c4613 = 0;
  let _0x33c214 = _0x4924e4;
  let _0x2805f8 = _0x580c79;
  if (_0x5beba8 > _0x326ab3) {
    _0x33c214 = _0x580c79 * _0x326ab3;
    _0x4d317b = (_0x4924e4 - _0x33c214) / 2;
  } else if (_0x5beba8 < _0x326ab3) {
    _0x2805f8 = _0x4924e4 / _0x326ab3;
    _0x1c4613 = (_0x580c79 - _0x2805f8) / 2;
  }
  _0x43cc79.drawImage(_0x2791b9, _0x4d317b, _0x1c4613, _0x33c214, _0x2805f8, _0x4e3cd4.x, _0x4e3cd4.y, _0x4e3cd4.width, _0x4e3cd4.height);
}
function drawThirdsGuide(_0x12d9c3, _0x1b7a2b, _0x35e5cc) {
  _0x12d9c3.save();
  _0x12d9c3.strokeStyle = _0x35e5cc.guide;
  _0x12d9c3.lineWidth = Math.max(1, Math.round(_0x1b7a2b.width / 960));
  _0x12d9c3.beginPath();
  for (const _0x7d617a of [1 / 3, 2 / 3]) {
    _0x12d9c3.moveTo(_0x1b7a2b.x + _0x1b7a2b.width * _0x7d617a, _0x1b7a2b.y);
    _0x12d9c3.lineTo(_0x1b7a2b.x + _0x1b7a2b.width * _0x7d617a, _0x1b7a2b.y + _0x1b7a2b.height);
    _0x12d9c3.moveTo(_0x1b7a2b.x, _0x1b7a2b.y + _0x1b7a2b.height * _0x7d617a);
    _0x12d9c3.lineTo(_0x1b7a2b.x + _0x1b7a2b.width, _0x1b7a2b.y + _0x1b7a2b.height * _0x7d617a);
  }
  _0x12d9c3.stroke();
  _0x12d9c3.restore();
}
function buildShotMetaLines(_0x2bbd98, _0x5d1360, _0x5e5ae8) {
  const _0x11a8f8 = _0x2bbd98?.camera || {};
  const _0x5697a6 = [];
  if (_0x5e5ae8.includeShotNumber !== false) {
    _0x5697a6.push("SHOT " + String(_0x5d1360 + 1).padStart(2, "0") + " · " + (_0x2bbd98?.shotSize || "MED"));
  }
  const _0x329a20 = [_0x5e5ae8.includeShotAngle !== false ? _0x2bbd98?.shotAngle : "", _0x5e5ae8.includeFocalLength !== false && _0x11a8f8.focalLength ? _0x11a8f8.focalLength + "mm" : ""].filter(Boolean).join(" · ");
  if (_0x329a20) {
    _0x5697a6.push(_0x329a20);
  }
  if (_0x5e5ae8.includeDescription !== false && _0x2bbd98?.description) {
    _0x5697a6.push(String(_0x2bbd98.description));
  }
  return _0x5697a6;
}
function drawMetadata(_0x5c1041, _0x3b93ab, _0x1b7ae4, _0x4e96bb, _0x3c0f6f, _0x5a3e9b) {
  if (_0x4e96bb.metadataHeight <= 0) {
    return;
  }
  const _0x59265a = _0x4e96bb.y + _0x4e96bb.frameHeight;
  _0x5c1041.fillStyle = _0x5a3e9b.cellBackground;
  _0x5c1041.fillRect(_0x4e96bb.x, _0x59265a, _0x4e96bb.width, _0x4e96bb.metadataHeight);
  _0x5c1041.fillStyle = _0x5a3e9b.text;
  const _0x56325c = Math.max(18, Math.round(_0x4e96bb.width / 42));
  const _0x14ae32 = Math.round(_0x56325c * 1.35);
  _0x5c1041.font = "600 " + _0x56325c + "px system-ui, sans-serif";
  _0x5c1041.textBaseline = "top";
  const _0x522035 = buildShotMetaLines(_0x3b93ab, _0x1b7ae4, _0x3c0f6f);
  _0x522035.slice(0, 3).forEach((_0x572935, _0x5caac6) => {
    if (_0x5caac6 > 0) {
      _0x5c1041.fillStyle = _0x5a3e9b.mutedText;
      _0x5c1041.font = "400 " + Math.max(16, Math.round(_0x56325c * 0.78)) + "px system-ui, sans-serif";
    }
    const _0x316f8d = Math.max(12, Math.floor(_0x4e96bb.width / Math.max(12, _0x56325c * 0.55)));
    const _0x154cb3 = String(_0x572935).slice(0, _0x316f8d);
    _0x5c1041.fillText(_0x154cb3, _0x4e96bb.x + _0x56325c, _0x59265a + _0x56325c + _0x5caac6 * _0x14ae32);
  });
}
export async function renderStoryboardGrid({
  shots = [],
  renderFrame: _0x10f2d0,
  aspectRatio = "16:9",
  resolution = "1080p",
  columns = 3,
  metadataHeight: _0x49b0b0,
  gap: _0x106d30,
  padding: _0x2c58f1,
  includeThirds = false,
  includeShotNumber = true,
  includeShotAngle = true,
  includeFocalLength = true,
  includeDescription = true,
  mimeType = "image/png",
  quality = 0.92,
  palette = DEFAULT_PALETTE,
  canvasFactory = createDefaultCanvas,
  onProgress: _0x34e3e8
} = {}) {
  if (!Array.isArray(shots) || shots.length === 0 || !shots.some(Boolean)) {
    throw new Error("At least one shot is required for storyboard export.");
  }
  if (typeof _0x10f2d0 !== "function") {
    throw new TypeError("renderFrame must be a function.");
  }
  const _0x42690d = resolveStoryboardExportDimensions({
    aspectRatio: aspectRatio,
    resolution: resolution
  });
  const _0x50ed8e = calculateStoryboardGridLayout({
    count: shots.length,
    columns: columns,
    frameWidth: _0x42690d.width,
    frameHeight: _0x42690d.height,
    metadataHeight: _0x49b0b0 ?? Math.max(96, Math.round(Math.min(_0x42690d.width, _0x42690d.height) * 0.15)),
    gap: _0x106d30,
    padding: _0x2c58f1
  });
  const _0x1d190a = canvasFactory(_0x50ed8e.width, _0x50ed8e.height);
  const _0x42c578 = _0x1d190a?.getContext?.("2d");
  if (!_0x42c578) {
    throw new Error("2D canvas context is unavailable.");
  }
  const _0x89f7f7 = {
    ...DEFAULT_PALETTE,
    ...(palette || {})
  };
  _0x42c578.fillStyle = _0x89f7f7.background;
  _0x42c578.fillRect(0, 0, _0x50ed8e.width, _0x50ed8e.height);
  for (let _0x59e11a = 0; _0x59e11a < shots.length; _0x59e11a += 1) {
    const _0x38f79f = shots[_0x59e11a];
    _0x34e3e8?.({
      stage: "rendering",
      current: _0x59e11a + 1,
      total: shots.length,
      shotId: _0x38f79f?.id
    });
    const _0x5c58a1 = _0x50ed8e.getCellRect(_0x59e11a);
    const _0x280e39 = {
      x: _0x5c58a1.x,
      y: _0x5c58a1.y,
      width: _0x5c58a1.width,
      height: _0x5c58a1.frameHeight
    };
    if (!_0x38f79f) {
      _0x42c578.fillStyle = _0x89f7f7.cellBackground;
      _0x42c578.fillRect(_0x5c58a1.x, _0x5c58a1.y, _0x5c58a1.width, _0x5c58a1.height);
      continue;
    }
    const _0x5c9e64 = await _0x10f2d0(_0x38f79f, {
      width: _0x42690d.width,
      height: _0x42690d.height,
      index: _0x59e11a,
      total: shots.length
    });
    drawFrameCover(_0x42c578, _0x5c9e64, _0x280e39, _0x89f7f7);
    if (includeThirds) {
      drawThirdsGuide(_0x42c578, _0x280e39, _0x89f7f7);
    }
    drawMetadata(_0x42c578, _0x38f79f, _0x59e11a, _0x5c58a1, {
      includeShotNumber: includeShotNumber,
      includeShotAngle: includeShotAngle,
      includeFocalLength: includeFocalLength,
      includeDescription: includeDescription
    }, _0x89f7f7);
    _0x5c9e64?.close?.();
    _0x5c9e64?.image?.close?.();
  }
  _0x34e3e8?.({
    stage: "encoding",
    current: shots.length,
    total: shots.length
  });
  const _0x1479b6 = await canvasToBlob(_0x1d190a, {
    mimeType: mimeType,
    quality: quality
  });
  _0x34e3e8?.({
    stage: "complete",
    current: shots.length,
    total: shots.length
  });
  return {
    blob: _0x1479b6,
    mimeType: mimeType,
    width: _0x50ed8e.width,
    height: _0x50ed8e.height,
    layout: _0x50ed8e,
    frame: _0x42690d
  };
}
export async function renderStoryboardSequence({
  shots = [],
  renderFrame: _0x21a6b7,
  ..._0x399d93
} = {}) {
  if (!Array.isArray(shots) || shots.length === 0) {
    throw new Error("At least one shot is required for storyboard export.");
  }
  const _0x540477 = [];
  for (let _0x154db2 = 0; _0x154db2 < shots.length; _0x154db2 += 1) {
    const _0x2b3afd = shots[_0x154db2];
    const _0x1e4104 = await renderStoryboardGrid({
      ..._0x399d93,
      shots: [_0x2b3afd],
      columns: 1,
      renderFrame: (_0x5790d3, _0x3ef3ef) => _0x21a6b7(_0x5790d3, {
        ..._0x3ef3ef,
        index: _0x154db2,
        total: shots.length
      }),
      onProgress: _0x259e9a => _0x399d93.onProgress?.({
        ..._0x259e9a,
        current: _0x154db2 + (_0x259e9a.stage === "complete" ? 1 : 0),
        total: shots.length,
        shotId: _0x2b3afd?.id
      })
    });
    _0x540477.push({
      ..._0x1e4104,
      shotId: _0x2b3afd?.id || "",
      index: _0x154db2
    });
  }
  return _0x540477;
}