const BACKGROUND_NODE_LIMIT = 520;
const MEDIA_LIMIT = 520;
const LOW_ZOOM_THRESHOLD = 0.45;
const LOW_ZOOM_MEDIA_LIMIT = 128;
const VERY_LOW_ZOOM_THRESHOLD = 0.32;
const VERY_LOW_ZOOM_MEDIA_LIMIT = 96;
const BUSY_LOW_ZOOM_MEDIA_LIMIT = 32;
const REFERENCE_VIEWPORT_AREA = 1382400;
const SCALED_MEDIA_LIMIT_MAX = 240;
const MEDIUM_PREFETCH_MIN = 180;
const MEDIUM_PREFETCH_MAX = 260;
const MEDIUM_PREFETCH_MEDIA_LIMIT = 32;
const NON_MEDIA_LIMIT = 48;
const LOW_PRIORITY_IMMEDIATE_SRC_LIMIT = 24;
const LOW_PRIORITY_LARGE_IMMEDIATE_SRC_LIMIT = 12;
const NORMAL_IMMEDIATE_SRC_LIMIT = 32;
const NODE_CREATE_IMMEDIATE_LIMIT = 8;
const NODE_CREATE_BATCH_SIZE = 8;
const LARGE_CANDIDATE_COUNT = 180;
const HUGE_CANDIDATE_COUNT = 360;
const LARGE_NODE_CREATE_IMMEDIATE_LIMIT = 8;
const HUGE_NODE_CREATE_IMMEDIATE_LIMIT = 8;
const LARGE_NODE_CREATE_BATCH_SIZE = 8;
const HUGE_NODE_CREATE_BATCH_SIZE = 8;
const BUSY_IMMEDIATE_SRC_LIMIT = 16;
const BUSY_MOTION_AHEAD_MEDIA_LIMIT = 6;
const VIDEO_IMMEDIATE_SRC_LIMIT = 16;
const LARGE_VIDEO_IMMEDIATE_SRC_LIMIT = 10;
const HUGE_VIDEO_IMMEDIATE_SRC_LIMIT = 8;
const BUSY_VIDEO_IMMEDIATE_SRC_LIMIT = 2;
const MOTION_LOOKAHEAD_FACTOR = 1.5;
const MOTION_AHEAD_PADDING = 160;
const VIDEO_EDGE_PREFETCH_PADDING = 240;
const LOW_ZOOM_EDGE_PREFETCH_MIN_ZOOM = 0.38;
const LOW_ZOOM_EDGE_PREFETCH_PADDING = 720;
function normalizeViewport(_0x1bc865 = {}) {
  const _0x10ec15 = Number(_0x1bc865?.zoom);
  return {
    x: Number.isFinite(Number(_0x1bc865?.x)) ? Number(_0x1bc865.x) : 0,
    y: Number.isFinite(Number(_0x1bc865?.y)) ? Number(_0x1bc865.y) : 0,
    zoom: Number.isFinite(_0x10ec15) && _0x10ec15 > 0 ? _0x10ec15 : 1
  };
}
function getViewportContainerSize(_0x470c08 = {}) {
  return {
    width: Math.max(1, Number(_0x470c08.containerWidth ?? _0x470c08.containerW) || (typeof window !== "undefined" ? Number(window.innerWidth) : 0) || 1600),
    height: Math.max(1, Number(_0x470c08.containerHeight ?? _0x470c08.containerH) || (typeof window !== "undefined" ? Number(window.innerHeight) : 0) || 900)
  };
}
function getViewportWorldRect(_0x3ec676 = {}) {
  const _0x46fa22 = normalizeViewport(_0x3ec676.viewport);
  const {
    width: _0x51ff50,
    height: _0x224974
  } = getViewportContainerSize(_0x3ec676);
  return {
    left: (0 - _0x46fa22.x) / _0x46fa22.zoom,
    top: (0 - _0x46fa22.y) / _0x46fa22.zoom,
    right: (_0x51ff50 - _0x46fa22.x) / _0x46fa22.zoom,
    bottom: (_0x224974 - _0x46fa22.y) / _0x46fa22.zoom
  };
}
function getViewportWorldCenter(_0x54749e = {}) {
  const _0x2ea324 = normalizeViewport(_0x54749e.viewport);
  const {
    width: _0x4837a7,
    height: _0x26bb20
  } = getViewportContainerSize(_0x54749e);
  return {
    x: ((0 - _0x2ea324.x) / _0x2ea324.zoom + (_0x4837a7 - _0x2ea324.x) / _0x2ea324.zoom) / 2,
    y: ((0 - _0x2ea324.y) / _0x2ea324.zoom + (_0x26bb20 - _0x2ea324.y) / _0x2ea324.zoom) / 2
  };
}
function getPreviewDistanceSq(_0x3f62fc, _0x516324) {
  if (!_0x3f62fc || !_0x516324) {
    return 0;
  }
  const _0x57fa80 = _0x3f62fc.x + _0x3f62fc.width / 2 - _0x516324.x;
  const _0x1f5b01 = _0x3f62fc.y + _0x3f62fc.height / 2 - _0x516324.y;
  return _0x57fa80 * _0x57fa80 + _0x1f5b01 * _0x1f5b01;
}
function getMotionAdjustedPreviewDistanceSq(_0xbbf7b7, _0x41037c, _0x2cc73f = {}) {
  const _0x10af05 = _0x41037c || _0x2cc73f?.previewMotion?.center;
  if (!_0xbbf7b7 || !_0x10af05) {
    return getPreviewDistanceSq(_0xbbf7b7, _0x10af05);
  }
  const _0x2a402f = _0x2cc73f?.previewMotion;
  if (!_0x2a402f?.active) {
    return getPreviewDistanceSq(_0xbbf7b7, _0x10af05);
  }
  const _0x2f9c27 = {
    x: _0x10af05.x + _0x2a402f.dx * MOTION_LOOKAHEAD_FACTOR,
    y: _0x10af05.y + _0x2a402f.dy * MOTION_LOOKAHEAD_FACTOR
  };
  return getPreviewDistanceSq(_0xbbf7b7, _0x2f9c27);
}
function getPreviewViewportDistanceSq(_0x49ac75, _0x4d5467 = {}) {
  if (!_0x49ac75) {
    return 0;
  }
  const _0x14b859 = getViewportWorldRect(_0x4d5467);
  const _0x30dfaa = Number(_0x49ac75.x) || 0;
  const _0x300887 = Number(_0x49ac75.y) || 0;
  const _0x38bf6b = _0x30dfaa + Math.max(1, Number(_0x49ac75.width) || 0);
  const _0x511549 = _0x300887 + Math.max(1, Number(_0x49ac75.height) || 0);
  const _0x107a1f = _0x38bf6b < _0x14b859.left ? _0x14b859.left - _0x38bf6b : _0x30dfaa > _0x14b859.right ? _0x30dfaa - _0x14b859.right : 0;
  const _0x189f73 = _0x511549 < _0x14b859.top ? _0x14b859.top - _0x511549 : _0x300887 > _0x14b859.bottom ? _0x300887 - _0x14b859.bottom : 0;
  return _0x107a1f * _0x107a1f + _0x189f73 * _0x189f73;
}
function getMotionAheadViewportOptions(_0x2f8ec7 = {}) {
  const _0x415184 = _0x2f8ec7?.previewMotion;
  if (!_0x415184?.active) {
    return null;
  }
  const _0x5f1e7a = normalizeViewport(_0x2f8ec7.viewport);
  return {
    ..._0x2f8ec7,
    viewport: {
      ..._0x5f1e7a,
      x: _0x5f1e7a.x - _0x415184.dx * _0x5f1e7a.zoom * MOTION_LOOKAHEAD_FACTOR,
      y: _0x5f1e7a.y - _0x415184.dy * _0x5f1e7a.zoom * MOTION_LOOKAHEAD_FACTOR
    }
  };
}
function getPreviewMediaPriorityDistanceSq(_0xfde5c7, _0x23abc0, _0x5737e9 = {}) {
  if (isRendererFastPreviewGeometryVisible(_0xfde5c7, _0x5737e9)) {
    return getMotionAdjustedPreviewDistanceSq(_0xfde5c7, _0x23abc0 || getViewportWorldCenter(_0x5737e9), _0x5737e9);
  }
  const _0x1f3f4f = Number(_0x5737e9?.viewport?.zoom);
  const _0x325139 = _0x5737e9?.viewportBusy === true || Number.isFinite(_0x1f3f4f) && _0x1f3f4f <= LOW_ZOOM_THRESHOLD;
  if (!_0x325139) {
    return getMotionAdjustedPreviewDistanceSq(_0xfde5c7, _0x23abc0, _0x5737e9);
  }
  const _0x5e8a0c = getMotionAheadViewportOptions(_0x5737e9);
  return getPreviewViewportDistanceSq(_0xfde5c7, _0x5e8a0c || _0x5737e9);
}
export function isRendererFastPreviewGeometryVisible(_0x2e285a, _0x20a0b9 = {}, _0x157488 = 0) {
  if (!_0x2e285a) {
    return false;
  }
  const _0x53d21e = normalizeViewport(_0x20a0b9.viewport);
  const {
    width: _0x165134,
    height: _0x262b54
  } = getViewportContainerSize(_0x20a0b9);
  const _0xef258e = _0x2e285a.x * _0x53d21e.zoom + _0x53d21e.x;
  const _0x418373 = _0x2e285a.y * _0x53d21e.zoom + _0x53d21e.y;
  const _0x22868b = _0x2e285a.width * _0x53d21e.zoom;
  const _0xb049ce = _0x2e285a.height * _0x53d21e.zoom;
  const _0x2abd26 = Math.max(0, Number(_0x157488) || 0);
  return _0xef258e + _0x22868b > -_0x2abd26 && _0xef258e < _0x165134 + _0x2abd26 && _0x418373 + _0xb049ce > -_0x2abd26 && _0x418373 < _0x262b54 + _0x2abd26;
}
function isGeometryMotionAhead(_0x42af72, _0x18ef71 = {}) {
  const _0x4e75ea = getMotionAheadViewportOptions(_0x18ef71);
  return !!_0x4e75ea && !!isRendererFastPreviewGeometryVisible(_0x42af72, _0x4e75ea, MOTION_AHEAD_PADDING);
}
function isGeometryInMotionDirection(_0x2e7f17, _0x14d7e9 = {}) {
  const _0x4892d2 = _0x14d7e9?.previewMotion;
  if (!_0x2e7f17 || !_0x4892d2?.active) {
    return false;
  }
  const _0x38f9a4 = getViewportWorldRect(_0x14d7e9);
  const _0x3042b4 = (Number(_0x2e7f17.x) || 0) + Math.max(1, Number(_0x2e7f17.width) || 0) / 2;
  const _0x58f27e = (Number(_0x2e7f17.y) || 0) + Math.max(1, Number(_0x2e7f17.height) || 0) / 2;
  if (Math.abs(_0x4892d2.dx) >= Math.abs(_0x4892d2.dy)) {
    if (_0x4892d2.dx >= 0) {
      return _0x3042b4 > _0x38f9a4.right;
    } else {
      return _0x3042b4 < _0x38f9a4.left;
    }
  }
  if (_0x4892d2.dy >= 0) {
    return _0x58f27e > _0x38f9a4.bottom;
  } else {
    return _0x58f27e < _0x38f9a4.top;
  }
}
function isGeometryAtMotionFront(_0x4532f9, _0x1ea2a7 = {}) {
  return isGeometryInMotionDirection(_0x4532f9, _0x1ea2a7) && isRendererFastPreviewGeometryVisible(_0x4532f9, _0x1ea2a7, MOTION_AHEAD_PADDING);
}
function isGeometryAtVideoPrefetchEdge(_0xd6518c, _0xe2ebec = {}) {
  if (_0xe2ebec?.viewportBusy === true) {
    return false;
  }
  return isRendererFastPreviewGeometryVisible(_0xd6518c, _0xe2ebec, VIDEO_EDGE_PREFETCH_PADDING);
}
function isGeometryNearViewport(_0x4cf99d, _0x5d710e = {}) {
  const _0x26eb58 = Number(_0x5d710e?.viewport?.zoom);
  if (!Number.isFinite(_0x26eb58) || _0x26eb58 < LOW_ZOOM_EDGE_PREFETCH_MIN_ZOOM || _0x26eb58 > LOW_ZOOM_THRESHOLD) {
    return false;
  }
  return isRendererFastPreviewGeometryVisible(_0x4cf99d, _0x5d710e, LOW_ZOOM_EDGE_PREFETCH_PADDING);
}
function resolveImmediateCreateLimit(_0x4d76fe) {
  if (_0x4d76fe >= HUGE_CANDIDATE_COUNT) {
    return HUGE_NODE_CREATE_IMMEDIATE_LIMIT;
  }
  if (_0x4d76fe >= LARGE_CANDIDATE_COUNT) {
    return LARGE_NODE_CREATE_IMMEDIATE_LIMIT;
  }
  return NODE_CREATE_IMMEDIATE_LIMIT;
}
function resolveCreateBatchSize(_0x21dc25) {
  if (_0x21dc25 >= HUGE_CANDIDATE_COUNT) {
    return HUGE_NODE_CREATE_BATCH_SIZE;
  }
  if (_0x21dc25 >= LARGE_CANDIDATE_COUNT) {
    return LARGE_NODE_CREATE_BATCH_SIZE;
  }
  return NODE_CREATE_BATCH_SIZE;
}
function getCandidateUserRank(_0x4a1b42 = {}) {
  if (_0x4a1b42.selected || _0x4a1b42.retained || _0x4a1b42.continuationPending) {
    return 0;
  }
  if (_0x4a1b42.visible || _0x4a1b42.motionFront || _0x4a1b42.motionAhead) {
    return 1;
  }
  if (_0x4a1b42.mounted) {
    return 2;
  }
  return 3;
}
export function resolveRendererFastPreviewMediaQueuePriority(_0x155812 = {}, _0x5c4012 = {}) {
  const _0x17e3a2 = _0x5c4012?.previewMotion?.center || getViewportWorldCenter(_0x5c4012);
  return {
    userRank: getCandidateUserRank(_0x155812),
    distanceSq: getPreviewMediaPriorityDistanceSq(_0x155812.geometry, _0x17e3a2, _0x5c4012),
    order: Number(_0x155812.order || 0)
  };
}
function shouldPrioritizeMediaOrder(_0x51da7b, _0x7bb61 = {}) {
  if (!Array.isArray(_0x51da7b) || _0x51da7b.length === 0) {
    return false;
  }
  const _0x58c54c = _0x51da7b.filter(_0x76cd33 => Array.isArray(_0x76cd33.sources) && _0x76cd33.sources.length > 0).length;
  if (_0x58c54c === 0) {
    return false;
  }
  const _0x1c52b7 = Number(_0x7bb61?.viewport?.zoom);
  const _0x3339a0 = _0x51da7b.some(_0x33da8e => _0x33da8e.visible && Array.isArray(_0x33da8e.sources) && _0x33da8e.sources.length > 0);
  const _0x31662b = _0x51da7b.some(_0x2c326f => !_0x2c326f.visible && Array.isArray(_0x2c326f.sources) && _0x2c326f.sources.length > 0);
  if (_0x58c54c > NORMAL_IMMEDIATE_SRC_LIMIT && _0x3339a0 && _0x31662b) {
    return true;
  }
  return _0x7bb61.viewportBusy === true || Number.isFinite(_0x1c52b7) && _0x1c52b7 <= LOW_ZOOM_THRESHOLD;
}
function compareCandidatesForPriority(_0x302c06, _0x4eeb9a, _0x13635e, _0x35c94d) {
  const _0x1472ad = getCandidateUserRank(_0x302c06) - getCandidateUserRank(_0x4eeb9a);
  if (_0x1472ad !== 0) {
    return _0x1472ad;
  }
  const _0x1ae2f1 = Array.isArray(_0x302c06.sources) && _0x302c06.sources.length > 0 ? 0 : 1;
  const _0x349908 = Array.isArray(_0x4eeb9a.sources) && _0x4eeb9a.sources.length > 0 ? 0 : 1;
  if (_0x1ae2f1 !== _0x349908) {
    return _0x1ae2f1 - _0x349908;
  }
  const _0x143fbe = getPreviewMediaPriorityDistanceSq(_0x302c06.geometry, _0x13635e, _0x35c94d);
  const _0x556d7b = getPreviewMediaPriorityDistanceSq(_0x4eeb9a.geometry, _0x13635e, _0x35c94d);
  if (_0x143fbe !== _0x556d7b) {
    return _0x143fbe - _0x556d7b;
  }
  return _0x302c06.order - _0x4eeb9a.order;
}
function orderCandidates(_0x3532b7, _0x71435e = {}) {
  const _0x127f6f = _0x3532b7.length > resolveImmediateCreateLimit(_0x3532b7.length);
  const _0xc830cf = shouldPrioritizeMediaOrder(_0x3532b7, _0x71435e);
  if (!_0x127f6f && !_0xc830cf) {
    return _0x3532b7;
  }
  const _0xbfaeb2 = _0x71435e?.previewMotion?.center || getViewportWorldCenter(_0x71435e);
  return [..._0x3532b7].sort((_0x15d25a, _0x24c8b8) => compareCandidatesForPriority(_0x15d25a, _0x24c8b8, _0xbfaeb2, _0x71435e));
}
function resolveImmediateMediaSrcLimit(_0x2f591c, _0x3b065d, _0x42d1ca = {}) {
  if (_0x42d1ca.viewportBusy === true) {
    return BUSY_IMMEDIATE_SRC_LIMIT;
  }
  if (_0x2f591c?.lowPriority) {
    if (_0x3b065d >= LARGE_CANDIDATE_COUNT) {
      return LOW_PRIORITY_LARGE_IMMEDIATE_SRC_LIMIT;
    }
    return LOW_PRIORITY_IMMEDIATE_SRC_LIMIT;
  }
  return NORMAL_IMMEDIATE_SRC_LIMIT;
}
function resolveImmediateVideoMediaSrcLimit(_0x30cc15, _0xdcb6cb = {}) {
  if (_0xdcb6cb.viewportBusy === true) {
    return BUSY_VIDEO_IMMEDIATE_SRC_LIMIT;
  }
  if (_0x30cc15 >= HUGE_CANDIDATE_COUNT) {
    return HUGE_VIDEO_IMMEDIATE_SRC_LIMIT;
  }
  if (_0x30cc15 >= LARGE_CANDIDATE_COUNT) {
    return LARGE_VIDEO_IMMEDIATE_SRC_LIMIT;
  }
  return VIDEO_IMMEDIATE_SRC_LIMIT;
}
function resolveMediaLimit({
  candidateCount: _0x40c5a0,
  isLowZoom: _0x5987b6,
  isVeryLowZoom: _0x4add9a,
  options: _0x38eefd,
  suppressNewMedia: _0x5b7e86
}) {
  if (_0x5b7e86) {
    return 0;
  }
  if (!_0x5987b6) {
    return MEDIA_LIMIT;
  }
  if (_0x38eefd?.viewportBusy === true) {
    return BUSY_LOW_ZOOM_MEDIA_LIMIT;
  }
  const _0x9afe41 = _0x4add9a ? VERY_LOW_ZOOM_MEDIA_LIMIT : LOW_ZOOM_MEDIA_LIMIT;
  const _0x3fee92 = Number(_0x40c5a0) || 0;
  const _0x35a0c7 = Math.max(1, Number(_0x38eefd.containerWidth ?? _0x38eefd.containerW) || 0);
  const _0xbc3d53 = Math.max(1, Number(_0x38eefd.containerHeight ?? _0x38eefd.containerH) || 0);
  const _0x4a62a0 = _0x35a0c7 * _0xbc3d53;
  const _0x5c9dc2 = Number.isFinite(_0x4a62a0) && _0x4a62a0 > 1 ? Math.max(1, _0x4a62a0 / REFERENCE_VIEWPORT_AREA) : 1;
  if (!_0x4add9a && _0x3fee92 >= MEDIUM_PREFETCH_MIN && _0x3fee92 <= MEDIUM_PREFETCH_MAX) {
    return Math.min(SCALED_MEDIA_LIMIT_MAX, Math.ceil(MEDIUM_PREFETCH_MEDIA_LIMIT * _0x5c9dc2), _0x3fee92);
  }
  if (!Number.isFinite(_0x4a62a0) || _0x4a62a0 <= 1) {
    return _0x9afe41;
  }
  return Math.min(SCALED_MEDIA_LIMIT_MAX, Math.max(_0x9afe41, Math.ceil(_0x9afe41 * _0x5c9dc2)));
}
function resolveMediaPlan(_0x3b4b21, _0x41ea4e = {}) {
  const _0x27107e = Number(_0x41ea4e?.viewport?.zoom);
  const _0x50babe = Number.isFinite(_0x27107e) && _0x27107e <= LOW_ZOOM_THRESHOLD;
  const _0x2dd85d = Number.isFinite(_0x27107e) && _0x27107e <= VERY_LOW_ZOOM_THRESHOLD;
  const _0x364d5d = _0x41ea4e?.mediaSourceOwnerIds != null && typeof _0x41ea4e.mediaSourceOwnerIds?.[Symbol.iterator] === "function" ? new Set(Array.from(_0x41ea4e.mediaSourceOwnerIds, _0x55acd7 => String(_0x55acd7 || "")).filter(Boolean)) : null;
  const _0x540b40 = _0x41ea4e?.suppressNewMedia === true;
  const _0x5e9e41 = resolveMediaLimit({
    candidateCount: _0x3b4b21.length,
    isLowZoom: _0x50babe,
    isVeryLowZoom: _0x2dd85d,
    options: _0x41ea4e,
    suppressNewMedia: _0x540b40
  });
  const _0x12722a = _0x3b4b21.filter(_0x175d00 => Array.isArray(_0x175d00.sources) && _0x175d00.sources.length > 0 && (_0x364d5d === null || _0x364d5d.has(_0x175d00.nodeId) || _0x175d00.fullEligibleVisible || _0x175d00.visible || _0x175d00.kind === "video" && _0x175d00.motionFront));
  if (!_0x540b40 && _0x12722a.length <= _0x5e9e41) {
    return {
      nodeIdsWithMedia: new Set(_0x12722a.map(_0x534525 => _0x534525.nodeId)),
      explicitMediaSourceOwnerIds: _0x364d5d,
      lowPriority: _0x50babe,
      prefetchAhead: false
    };
  }
  const _0x48bba4 = _0x41ea4e?.previewMotion?.center;
  const _0x316ec3 = new Set(_0x12722a.filter(_0x8cf016 => _0x8cf016.fullEligibleVisible || _0x8cf016.fullEligibleMotionAhead || _0x8cf016.visible || _0x8cf016.kind === "video" && _0x8cf016.motionFront || _0x8cf016.selected || _0x8cf016.retained || _0x8cf016.mounted).map(_0x226a1c => _0x226a1c.nodeId));
  if (_0x50babe && _0x41ea4e?.viewportBusy === true) {
    _0x12722a.filter(_0x5d460f => !_0x316ec3.has(_0x5d460f.nodeId) && !_0x5d460f.visible && _0x5d460f.motionFront).map(_0x45c22f => ({
      ..._0x45c22f,
      distanceSq: getPreviewViewportDistanceSq(_0x45c22f.geometry, _0x41ea4e)
    })).sort((_0x41911a, _0x1b2bb5) => {
      if (_0x41911a.distanceSq !== _0x1b2bb5.distanceSq) {
        return _0x41911a.distanceSq - _0x1b2bb5.distanceSq;
      }
      return _0x41911a.order - _0x1b2bb5.order;
    }).slice(0, BUSY_MOTION_AHEAD_MEDIA_LIMIT).forEach(_0x2324fa => _0x316ec3.add(_0x2324fa.nodeId));
  }
  const _0x3131e3 = _0x50babe && _0x41ea4e?.viewportBusy === true && _0x316ec3.size > 0;
  const _0x44fd5f = _0x3131e3 ? 0 : Math.max(0, _0x5e9e41 - _0x316ec3.size);
  const _0x106139 = _0x12722a.filter(_0x48b587 => !_0x316ec3.has(_0x48b587.nodeId)).map(_0x2f6364 => ({
    ..._0x2f6364,
    priorityRank: _0x2f6364.mounted ? 0 : 1,
    distanceSq: getPreviewMediaPriorityDistanceSq(_0x2f6364.geometry, _0x48bba4, _0x41ea4e)
  })).sort((_0xb725cf, _0x335598) => {
    if (_0xb725cf.priorityRank !== _0x335598.priorityRank) {
      return _0xb725cf.priorityRank - _0x335598.priorityRank;
    }
    if (_0xb725cf.distanceSq !== _0x335598.distanceSq) {
      return _0xb725cf.distanceSq - _0x335598.distanceSq;
    }
    return _0xb725cf.order - _0x335598.order;
  }).slice(0, _0x44fd5f);
  return {
    nodeIdsWithMedia: new Set([..._0x316ec3, ..._0x106139.map(_0x9a109 => _0x9a109.nodeId)]),
    explicitMediaSourceOwnerIds: _0x364d5d,
    lowPriority: _0x50babe,
    prefetchAhead: false
  };
}
function isRequiredCandidate(_0x208d94) {
  return !!_0x208d94.fullEligibleVisible || !!_0x208d94.fullEligibleMotionAhead || !!_0x208d94.motionFront || !!_0x208d94.visible || !!_0x208d94.selected || !!_0x208d94.retained || !!_0x208d94.continuationPending || !!_0x208d94.mounted;
}
function isRequiredImmediateCandidate(_0x34f965) {
  return !!_0x34f965.fullEligibleVisible || !!_0x34f965.fullEligibleMotionAhead || !!_0x34f965.motionFront || !!_0x34f965.visible || !!_0x34f965.selected || !!_0x34f965.retained || !!_0x34f965.continuationPending;
}
function classifyCandidates(_0x127911, _0x346572) {
  const _0x5e7b9f = [];
  const _0x5a67ec = [];
  let _0x921fa0 = NON_MEDIA_LIMIT;
  let _0xf3ea5b = 0;
  for (const _0x49cbdb of _0x127911) {
    if (!_0x49cbdb) {
      continue;
    }
    const _0x479aa1 = _0x49cbdb.geometry;
    const _0x5d1a67 = isGeometryMotionAhead(_0x479aa1, _0x346572);
    const _0x4f5bf7 = isGeometryAtMotionFront(_0x479aa1, _0x346572) || _0x49cbdb.kind === "video" && isGeometryAtVideoPrefetchEdge(_0x479aa1, _0x346572);
    const _0x48cde7 = _0x49cbdb;
    _0x48cde7.fullEligibleMotionAhead = _0x49cbdb.fullEligiblePreview && _0x5d1a67;
    _0x48cde7.motionAhead = _0x5d1a67;
    _0x48cde7.motionFront = _0x4f5bf7;
    _0x48cde7.nearViewport = isGeometryNearViewport(_0x479aa1, _0x346572);
    _0x48cde7.visible = isRendererFastPreviewGeometryVisible(_0x479aa1, _0x346572);
    _0x48cde7.order = _0xf3ea5b;
    _0xf3ea5b += 1;
    if (isRequiredCandidate(_0x48cde7)) {
      _0x5e7b9f.push(_0x48cde7);
    } else if (_0x5a67ec.length < BACKGROUND_NODE_LIMIT) {
      if (_0x49cbdb.kind !== "image" && _0x49cbdb.kind !== "video") {
        if (_0x921fa0 <= 0) {
          continue;
        }
        _0x921fa0 -= 1;
      }
      _0x5a67ec.push(_0x48cde7);
    }
  }
  const _0x4be01a = Math.max(0, BACKGROUND_NODE_LIMIT - _0x5e7b9f.length);
  return [..._0x5e7b9f, ..._0x5a67ec.slice(0, _0x4be01a)];
}
export function planRendererFastPreviewAdmission({
  candidateSeeds = [],
  existingPreviewNodeIds = null,
  options = {}
} = {}) {
  const _0x372a0e = orderCandidates(classifyCandidates(Array.isArray(candidateSeeds) ? candidateSeeds : Array.from(candidateSeeds), options), options);
  const _0x549ec5 = resolveMediaPlan(_0x372a0e, options);
  const _0x5048ab = _0x2f7d8b => existingPreviewNodeIds?.has?.(_0x2f7d8b) === true;
  const _0x424297 = _0x372a0e.reduce((_0x50d4d5, _0x1f8a4a) => !_0x5048ab(_0x1f8a4a.nodeId) && isRequiredImmediateCandidate(_0x1f8a4a) ? _0x50d4d5 + 1 : _0x50d4d5, 0);
  let _0x39b788 = Math.max(resolveImmediateCreateLimit(_0x372a0e.length), Math.min(_0x424297, NODE_CREATE_IMMEDIATE_LIMIT));
  const _0x461d5b = [];
  const _0x5a35a5 = [];
  for (const _0x48c02a of _0x372a0e) {
    const _0x3ae6e3 = _0x5048ab(_0x48c02a.nodeId);
    if (!_0x3ae6e3 && _0x39b788 <= 0) {
      _0x5a35a5.push(_0x48c02a);
      continue;
    }
    if (!_0x3ae6e3) {
      _0x39b788 -= 1;
    }
    _0x461d5b.push(_0x48c02a);
  }
  return {
    candidates: _0x372a0e,
    createBatchSize: resolveCreateBatchSize(_0x372a0e.length),
    deferredCandidates: _0x5a35a5,
    immediateCandidates: _0x461d5b,
    immediateMediaSrcLimit: resolveImmediateMediaSrcLimit(_0x549ec5, _0x372a0e.length, options),
    immediateVideoMediaSrcLimit: resolveImmediateVideoMediaSrcLimit(_0x372a0e.length, options),
    liveIds: new Set(_0x372a0e.map(_0x126163 => _0x126163.nodeId)),
    mediaPlan: _0x549ec5,
    visibleMediaCandidateCount: _0x372a0e.filter(_0x4e5d29 => (_0x4e5d29.fullEligibleVisible || _0x4e5d29.visible) && Array.isArray(_0x4e5d29.sources) && _0x4e5d29.sources.length > 0).length
  };
}