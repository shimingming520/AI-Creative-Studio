import a1464_0x2373e9 from "../core/stores/appStore.js";
import { getViewportScreenBounds, worldToScreen } from "../core/math.js";
import { fetchVideoFirstFrameThumbFromServer } from "../../api/videoThumbApi.js";
import { localPathToUrl, urlToLocalPath } from "../utils/localMediaPath.js";
let _token = 0;
let _scheduled = false;
let _rerunRequested = false;
const _VISIBLE_BACKFILL_GROUP_CONCURRENCY = 1;
const _BACKGROUND_BACKFILL_GROUP_CONCURRENCY = 1;
const _BACKGROUND_BACKFILL_DELAY_MS = 2500;
const _BACKGROUND_BATCH_SIZE = 4;
const _BACKGROUND_BATCH_GAP_MS = 450;
const _PLAYBACK_IDLE_POLL_MS = 750;
const _PLAYBACK_IDLE_MAX_WAIT_MS = 12000;
function _resolveLocalVideoPathFromUrl(_0x528166) {
  return localPathToUrl(urlToLocalPath(_0x528166));
}
function _resolveVideoSrcPath(_0xbe4f81, _0x2125b6) {
  const _0x2d2972 = localPathToUrl(_0x2125b6?.localPath || _0xbe4f81?.localPath);
  if (_0x2d2972) {
    return _0x2d2972;
  }
  const _0x587d2d = String(_0x2125b6?.videoUrl || _0xbe4f81?.videoUrl || _0xbe4f81?.src || "").trim();
  return _resolveLocalVideoPathFromUrl(_0x587d2d);
}
function _videoSourceKey(_0x2d66ae) {
  if (!_0x2d66ae || typeof _0x2d66ae !== "object") {
    return "";
  }
  return String(_0x2d66ae.localPath || "").trim() || String(_0x2d66ae.videoUrl || "").trim() || String(_0x2d66ae.src || "").trim() || String(_0x2d66ae.thumbId || "").trim();
}
function _isUnavailableVideoRecord(_0x814264) {
  const _0xb6c26a = _videoSourceKey(_0x814264);
  if (!_0xb6c26a) {
    return false;
  }
  return _0x814264?.mediaUnavailable === true && String(_0x814264?.mediaUnavailableSource || "").trim() === _0xb6c26a;
}
function _isAllowedSrcPath(_0x15442d) {
  const _0x387b02 = String(_0x15442d || "");
  return _0x387b02.startsWith("/output/") || _0x387b02.startsWith("/data/");
}
function _isNodeVisible(_0x48732b, _0x108795) {
  const _0x3f2440 = _0x48732b || {};
  const _0x362b9a = _0x108795 || {
    x: 0,
    y: 0,
    zoom: 1
  };
  const _0x4fa201 = Number(_0x362b9a.zoom) || 1;
  const _0x37c177 = worldToScreen(Number(_0x3f2440.x) || 0, Number(_0x3f2440.y) || 0, _0x362b9a);
  const _0x1aa9db = _0x37c177.x;
  const _0x52853f = _0x37c177.y;
  const _0x2f5b2c = (Number(_0x3f2440.width) || 0) * _0x4fa201;
  const _0x1d9585 = (Number(_0x3f2440.height) || 0) * _0x4fa201;
  const _0x4648e8 = 200;
  const _0xa76914 = getViewportScreenBounds(_0x362b9a, window.innerWidth, window.innerHeight);
  return _0x1aa9db + _0x2f5b2c > _0xa76914.left - _0x4648e8 && _0x1aa9db < _0xa76914.right + _0x4648e8 && _0x52853f + _0x1d9585 > _0xa76914.top - _0x4648e8 && _0x52853f < _0xa76914.bottom + _0x4648e8;
}
function _collectJobs(_0x3a7c87, _0x116646) {
  const _0x2d9acf = _0x3a7c87?.nodes || {};
  const _0x192964 = _0x3a7c87?.viewport || {
    x: 0,
    y: 0,
    zoom: 1
  };
  const _0x1b0611 = [];
  for (const _0x53b7a1 of Object.values(_0x2d9acf)) {
    if (!_0x53b7a1 || typeof _0x53b7a1 !== "object") {
      continue;
    }
    if (_0x116646 === "visible" && !_isNodeVisible(_0x53b7a1, _0x192964)) {
      continue;
    }
    const _0x1ee67c = String(_0x53b7a1.type || "");
    if (_0x1ee67c === "ai-video") {
      const _0x44d224 = Array.isArray(_0x53b7a1.videos) ? _0x53b7a1.videos : [];
      if (_0x44d224.length === 0) {
        continue;
      }
      const _0x540ce7 = Number(_0x53b7a1.mainVideoIndex);
      const _0x2a0619 = Number.isFinite(_0x540ce7) ? Math.max(0, Math.trunc(_0x540ce7)) : 0;
      const _0x35ba47 = [];
      if (_0x2a0619 >= 0 && _0x2a0619 < _0x44d224.length) {
        _0x35ba47.push(_0x2a0619);
      }
      for (let _0x53ebc8 = 0; _0x53ebc8 < _0x44d224.length; _0x53ebc8++) {
        if (_0x53ebc8 !== _0x2a0619) {
          _0x35ba47.push(_0x53ebc8);
        }
      }
      for (const _0x28bda2 of _0x35ba47) {
        const _0x73badd = _0x44d224[_0x28bda2];
        if (!_0x73badd || typeof _0x73badd !== "object") {
          continue;
        }
        if (_isUnavailableVideoRecord(_0x73badd)) {
          continue;
        }
        if (String(_0x73badd.thumbUrl || "").trim()) {
          continue;
        }
        const _0x40aa66 = _resolveVideoSrcPath(_0x53b7a1, _0x73badd);
        if (!_0x40aa66 || !_isAllowedSrcPath(_0x40aa66)) {
          continue;
        }
        _0x1b0611.push({
          nodeId: _0x53b7a1.id,
          idx: _0x28bda2,
          srcPath: _0x40aa66,
          kind: "ai-video"
        });
      }
      continue;
    }
    if (_0x1ee67c === "source-video") {
      if (_isUnavailableVideoRecord(_0x53b7a1)) {
        continue;
      }
      if (String(_0x53b7a1.thumbUrl || "").trim()) {
        continue;
      }
      const _0x4ce3a9 = _resolveVideoSrcPath(_0x53b7a1, null);
      if (!_0x4ce3a9 || !_isAllowedSrcPath(_0x4ce3a9)) {
        continue;
      }
      _0x1b0611.push({
        nodeId: _0x53b7a1.id,
        idx: -1,
        srcPath: _0x4ce3a9,
        kind: "source-video"
      });
    }
  }
  return _0x1b0611;
}
function _groupJobsBySrcPath(_0x3b5cc2) {
  const _0xcfe91b = [];
  const _0x568217 = new Map();
  for (const _0x4376ec of _0x3b5cc2 || []) {
    const _0x2b70d8 = String(_0x4376ec?.srcPath || "").trim();
    if (!_0x2b70d8) {
      continue;
    }
    let _0x19aac4 = _0x568217.get(_0x2b70d8);
    if (!_0x19aac4) {
      _0x19aac4 = {
        srcPath: _0x2b70d8,
        jobs: []
      };
      _0x568217.set(_0x2b70d8, _0x19aac4);
      _0xcfe91b.push(_0x19aac4);
    }
    _0x19aac4.jobs.push(_0x4376ec);
  }
  return _0xcfe91b;
}
async function _runWithConcurrency(_0x287d97, _0x2c1add, _0x5e89e6) {
  const _0x127e9f = Array.isArray(_0x287d97) ? _0x287d97 : [];
  const _0x39c554 = Math.max(1, Math.trunc(Number(_0x2c1add) || 1));
  if (_0x127e9f.length === 0) {
    return;
  }
  let _0xa3b71d = 0;
  const _0x1441e5 = Math.min(_0x39c554, _0x127e9f.length);
  const _0x16df1a = Array.from({
    length: _0x1441e5
  }, async () => {
    while (true) {
      const _0x64a235 = _0xa3b71d++;
      if (_0x64a235 >= _0x127e9f.length) {
        return;
      }
      await _0x5e89e6(_0x127e9f[_0x64a235], _0x64a235);
    }
  });
  await Promise.all(_0x16df1a);
}
function _delay(_0x184b50) {
  return new Promise(_0x193976 => setTimeout(_0x193976, Math.max(0, Number(_0x184b50) || 0)));
}
function _hasActiveMediaPlayback() {
  const _0x3c48df = typeof document !== "undefined" ? document : null;
  if (!_0x3c48df || typeof _0x3c48df.querySelectorAll !== "function") {
    return false;
  }
  const _0x400017 = _0x3c48df.querySelectorAll("video, audio") || [];
  for (const _0x31287f of _0x400017) {
    if (!_0x31287f) {
      continue;
    }
    if (_0x31287f.paused === false && _0x31287f.ended !== true) {
      return true;
    }
  }
  return false;
}
async function _waitForPlaybackIdle(_0x35afcd) {
  let _0x121558 = 0;
  while (_0x35afcd === _token && _hasActiveMediaPlayback()) {
    if (_0x121558 >= _PLAYBACK_IDLE_MAX_WAIT_MS) {
      return false;
    }
    await _delay(_PLAYBACK_IDLE_POLL_MS);
    _0x121558 += _PLAYBACK_IDLE_POLL_MS;
  }
  return _0x35afcd === _token;
}
async function _fetchThumbUrl(_0x560ff0, _0x308cbc, _0xa6fc5 = {}) {
  if (_0x308cbc !== _token) {
    return "";
  }
  const _0x300f4b = String(_0x560ff0 || "").trim();
  if (!_0x300f4b) {
    return "";
  }
  let _0x137855 = null;
  try {
    _0x137855 = await fetchVideoFirstFrameThumbFromServer(_0x300f4b, _0xa6fc5);
  } catch {
    _0x137855 = null;
  }
  if (_0x308cbc !== _token) {
    return "";
  }
  return String(_0x137855?.url || "").trim();
}
async function _applyJob(_0x5733e9, _0x531aed, _0x27af55, _0x4ba690) {
  if (_0x4ba690 !== _token) {
    return false;
  }
  const _0x484c23 = String(_0x5733e9?.nodeId || "");
  if (!_0x484c23) {
    return false;
  }
  const _0x412ad1 = String(_0x531aed || _0x5733e9?.srcPath || "").trim();
  const _0x460831 = String(_0x27af55 || "").trim();
  if (!_0x412ad1 || !_0x460831) {
    return false;
  }
  const _0x20aeb8 = a1464_0x2373e9.getStateRaw();
  const _0x36be02 = _0x20aeb8.nodes?.[_0x484c23];
  if (!_0x36be02) {
    return false;
  }
  if (_0x5733e9.kind === "source-video") {
    if (String(_0x36be02.thumbUrl || "").trim()) {
      return false;
    }
    a1464_0x2373e9.updateNodeData(_0x484c23, {
      videoThumbSrc: _0x412ad1,
      thumbUrl: _0x460831
    });
    return true;
  }
  if (_0x5733e9.kind === "ai-video") {
    const _0x3f946e = Array.isArray(_0x36be02.videos) ? _0x36be02.videos : [];
    const _0xee4e1e = Number(_0x5733e9.idx);
    if (!(_0xee4e1e >= 0) || !(_0xee4e1e < _0x3f946e.length)) {
      return false;
    }
    const _0x416106 = _0x3f946e[_0xee4e1e];
    if (!_0x416106 || typeof _0x416106 !== "object") {
      return false;
    }
    if (String(_0x416106.thumbUrl || "").trim()) {
      return false;
    }
    const _0x580d6b = {
      ..._0x416106,
      thumbUrl: _0x460831
    };
    const _0x3f6e8e = _0x3f946e.slice();
    _0x3f6e8e[_0xee4e1e] = _0x580d6b;
    const _0x120879 = {
      videos: _0x3f6e8e
    };
    const _0x1047ec = Number(_0x36be02.mainVideoIndex);
    const _0x31d7cc = Number.isFinite(_0x1047ec) ? Math.max(0, Math.trunc(_0x1047ec)) : 0;
    if (_0xee4e1e === _0x31d7cc && !String(_0x36be02.thumbUrl || "").trim()) {
      _0x120879.thumbUrl = _0x460831;
    }
    a1464_0x2373e9.updateNodeData(_0x484c23, _0x120879);
    return true;
  }
  return false;
}
async function _runPass(_0x265261, _0x474947) {
  if (_0x474947 !== _token) {
    return;
  }
  const _0x5ee649 = a1464_0x2373e9.getStateRaw();
  const _0xeb715d = _collectJobs(_0x5ee649, _0x265261);
  const _0x2aa235 = _groupJobsBySrcPath(_0xeb715d);
  const _0x18774c = _0x265261 === "visible" ? _VISIBLE_BACKFILL_GROUP_CONCURRENCY : _BACKGROUND_BACKFILL_GROUP_CONCURRENCY;
  const _0x5b09bf = _0x265261 === "visible" ? _0x2aa235.length || 1 : _BACKGROUND_BATCH_SIZE;
  for (let _0x1bba2e = 0; _0x1bba2e < _0x2aa235.length; _0x1bba2e += _0x5b09bf) {
    if (_0x474947 !== _token) {
      return;
    }
    if (_0x265261 !== "visible" && !(await _waitForPlaybackIdle(_0x474947))) {
      return;
    }
    const _0x18e728 = _0x2aa235.slice(_0x1bba2e, _0x1bba2e + _0x5b09bf);
    await _runWithConcurrency(_0x18e728, _0x18774c, async _0x2e492e => {
      if (_0x474947 !== _token) {
        return;
      }
      const _0x395f72 = Array.isArray(_0x2e492e.jobs) ? _0x2e492e.jobs[0] : null;
      const _0x12bd70 = await _fetchThumbUrl(_0x2e492e.srcPath, _0x474947, {
        nodeId: String(_0x395f72?.nodeId || ""),
        assetId: String(_0x395f72?.idx ?? "")
      });
      if (_0x474947 !== _token || !_0x12bd70) {
        return;
      }
      for (const _0x144097 of _0x2e492e.jobs) {
        if (_0x474947 !== _token) {
          return;
        }
        await _applyJob(_0x144097, _0x2e492e.srcPath, _0x12bd70, _0x474947);
      }
      await _delay(0);
    });
    if (_0x265261 !== "visible" && _0x1bba2e + _0x5b09bf < _0x2aa235.length) {
      await _delay(_BACKGROUND_BATCH_GAP_MS);
    }
  }
}
export function startVideoThumbBackfill() {
  _token++;
  const _0x31cb76 = _token;
  if (_scheduled) {
    _rerunRequested = true;
    return;
  }
  _scheduled = true;
  setTimeout(async () => {
    try {
      await _runPass("visible", _0x31cb76);
      if (_0x31cb76 !== _token) {
        return;
      }
      await _delay(_BACKGROUND_BACKFILL_DELAY_MS);
      if (_0x31cb76 !== _token) {
        return;
      }
      await _runPass("all", _0x31cb76);
    } finally {
      _scheduled = false;
      if (_rerunRequested) {
        _rerunRequested = false;
        startVideoThumbBackfill();
      }
    }
  }, 60);
}
export function __groupBackfillJobsBySrcPathForTest(_0x2c73df) {
  return _groupJobsBySrcPath(_0x2c73df);
}
export async function __runWithConcurrencyForTest(_0x2b9ab8, _0x277534, _0x21c495) {
  return _runWithConcurrency(_0x2b9ab8, _0x277534, _0x21c495);
}
export function __hasActiveMediaPlaybackForTest() {
  return _hasActiveMediaPlayback();
}