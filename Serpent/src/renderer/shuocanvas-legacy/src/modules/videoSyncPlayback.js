import { getVideoCurrentSource, playVideoWithRecovery } from "../components/video-node/mediaPlaybackRecovery.js";
import { attachMediaElementPlaybackSource, isMediaElementPlaybackSource } from "../services/desktopMediaBlobSource.js";
import { claimExternalVideoPlayback, releaseExternalVideoPlayback } from "../components/shared/hoverVideoPlaybackLifecycle.js";
import { localPathToUrl } from "../utils/localMediaPath.js";
import { t } from "../i18n/index.js";
const PLAYABLE_VIDEO_TYPES = new Set(["source-video", "video", "ai-video"]);
const GROUP_NODE_TYPE = "group";
const SYNC_PLAYBACK_CLASS = "is-sync-video-playing";
let activeSyncVideoPlaybackSession = null;
let syncVideoPlaybackSessionSequence = 0;
const syncVideoPlaybackStateListeners = new Set();
export function getSyncVideoPlaybackState() {
  const _0x1aa2d8 = activeSyncVideoPlaybackSession?.isCurrent?.() === true;
  return {
    active: _0x1aa2d8,
    loop: _0x1aa2d8 && activeSyncVideoPlaybackSession?.loop === true
  };
}
function notifySyncVideoPlaybackState() {
  const _0x51f711 = getSyncVideoPlaybackState();
  for (const _0xab7b0 of syncVideoPlaybackStateListeners) {
    try {
      _0xab7b0(_0x51f711);
    } catch {}
  }
}
export function subscribeSyncVideoPlaybackState(_0x136fd1) {
  if (typeof _0x136fd1 !== "function") {
    return () => {};
  }
  syncVideoPlaybackStateListeners.add(_0x136fd1);
  try {
    _0x136fd1(getSyncVideoPlaybackState());
  } catch {}
  return () => syncVideoPlaybackStateListeners.delete(_0x136fd1);
}
function syncPlaybackText(_0x47c099, _0x2f2352 = {}) {
  return t("videoSyncPlayback." + _0x47c099, _0x2f2352);
}
function normalizeText(_0x1e3d29) {
  return String(_0x1e3d29 || "").trim();
}
function toNodeList(_0x4b734e) {
  if (!_0x4b734e || typeof _0x4b734e !== "object") {
    return [];
  }
  return Object.values(_0x4b734e).filter(_0x593921 => _0x593921 && typeof _0x593921 === "object");
}
function compareCanvasOrder(_0x3ae805, _0x27ca0f) {
  const _0x5be034 = Number(_0x3ae805?.y) || 0;
  const _0xb5a97 = Number(_0x27ca0f?.y) || 0;
  if (_0x5be034 !== _0xb5a97) {
    return _0x5be034 - _0xb5a97;
  }
  const _0x51b16d = Number(_0x3ae805?.x) || 0;
  const _0x46d302 = Number(_0x27ca0f?.x) || 0;
  if (_0x51b16d !== _0x46d302) {
    return _0x51b16d - _0x46d302;
  }
  return normalizeText(_0x3ae805?.id).localeCompare(normalizeText(_0x27ca0f?.id));
}
function normalizePlayableUrl(_0x383621) {
  const _0x40a7b2 = normalizeText(_0x383621);
  if (!_0x40a7b2) {
    return "";
  }
  if (_0x40a7b2.startsWith("http://") || _0x40a7b2.startsWith("https://") || _0x40a7b2.startsWith("blob:") || _0x40a7b2.startsWith("data:")) {
    return _0x40a7b2;
  }
  const _0x4b63cf = localPathToUrl(_0x40a7b2);
  if (_0x4b63cf) {
    return _0x4b63cf;
  }
  if (_0x40a7b2.startsWith("/")) {
    return _0x40a7b2;
  }
  return "";
}
function resolveVideoSource(_0xcf5257 = {}) {
  for (const _0x47700c of ["displayLocalPath", "localPath", "originalLocalPath", "src", "videoUrl", "url", "resultUrl", "sourceUrl"]) {
    const _0x86c3c = normalizePlayableUrl(_0xcf5257?.[_0x47700c]);
    if (_0x86c3c) {
      return _0x86c3c;
    }
  }
  return "";
}
function isUnavailableVideoRecord(_0x54d66f = {}) {
  return !!normalizeText(_0x54d66f?.error) || _0x54d66f?.mediaUnavailable === true || _0x54d66f?.videoUnavailable === true;
}
function getMainVideoRecord(_0x4540e9) {
  const _0x34a5cd = Array.isArray(_0x4540e9?.videos) ? _0x4540e9.videos : [];
  if (_0x34a5cd.length === 0) {
    return null;
  }
  const _0xced8df = Number(_0x4540e9?.mainVideoIndex);
  const _0x439886 = Number.isFinite(_0xced8df) ? Math.max(0, Math.min(_0x34a5cd.length - 1, Math.trunc(_0xced8df))) : 0;
  return {
    record: _0x34a5cd[_0x439886],
    index: _0x439886
  };
}
function collectVideoEntriesForNode(_0x205050) {
  if (!PLAYABLE_VIDEO_TYPES.has(normalizeText(_0x205050?.type))) {
    return [];
  }
  if (isUnavailableVideoRecord(_0x205050)) {
    return [];
  }
  if (normalizeText(_0x205050?.type) === "ai-video") {
    const _0x2b6178 = getMainVideoRecord(_0x205050);
    if (_0x2b6178?.record) {
      if (isUnavailableVideoRecord(_0x2b6178.record)) {
        return [];
      }
      const _0x116f7b = resolveVideoSource(_0x2b6178.record) || resolveVideoSource(_0x205050);
      if (_0x116f7b) {
        return [{
          nodeId: normalizeText(_0x205050.id),
          videoIndex: _0x2b6178.index,
          source: _0x116f7b,
          node: _0x205050
        }];
      } else {
        return [];
      }
    }
  }
  const _0x13aa05 = resolveVideoSource(_0x205050);
  if (_0x13aa05) {
    return [{
      nodeId: normalizeText(_0x205050.id),
      videoIndex: 0,
      source: _0x13aa05,
      node: _0x205050
    }];
  } else {
    return [];
  }
}
function buildChildrenByParent(_0x105fe2) {
  const _0x2b2dcc = new Map();
  for (const _0x5c3dd7 of toNodeList(_0x105fe2)) {
    const _0x45dcf8 = normalizeText(_0x5c3dd7?.parentId);
    if (!_0x45dcf8) {
      continue;
    }
    if (!_0x2b2dcc.has(_0x45dcf8)) {
      _0x2b2dcc.set(_0x45dcf8, []);
    }
    _0x2b2dcc.get(_0x45dcf8).push(_0x5c3dd7);
  }
  for (const _0x57c6d2 of _0x2b2dcc.values()) {
    _0x57c6d2.sort(compareCanvasOrder);
  }
  return _0x2b2dcc;
}
function pushUniqueEntry(_0x47760c, _0x37d013, _0x2fcc8a) {
  const _0x130441 = normalizeText(_0x2fcc8a?.nodeId);
  if (!_0x130441) {
    return;
  }
  const _0x4dd225 = _0x130441 + ":" + (Number(_0x2fcc8a?.videoIndex) || 0);
  if (_0x37d013.has(_0x4dd225)) {
    return;
  }
  _0x37d013.add(_0x4dd225);
  _0x47760c.push({
    ..._0x2fcc8a,
    key: _0x4dd225
  });
}
function collectGroupEntriesInto({
  nodes: _0x44d7b7,
  groupId: _0x838a5a,
  childrenByParent: _0x4592b3,
  result: _0x30bbdf,
  seen: _0xeb41b5,
  visitedGroups: _0x5cd4fc
}) {
  const _0x3ec07a = normalizeText(_0x838a5a);
  if (!_0x3ec07a || _0x5cd4fc.has(_0x3ec07a)) {
    return;
  }
  _0x5cd4fc.add(_0x3ec07a);
  const _0x5ef6f0 = _0x4592b3.get(_0x3ec07a) || [];
  for (const _0xbfce1b of _0x5ef6f0) {
    const _0x4faa20 = normalizeText(_0xbfce1b?.id);
    if (!_0x4faa20) {
      continue;
    }
    if (normalizeText(_0xbfce1b?.type) === GROUP_NODE_TYPE) {
      collectGroupEntriesInto({
        nodes: _0x44d7b7,
        groupId: _0x4faa20,
        childrenByParent: _0x4592b3,
        result: _0x30bbdf,
        seen: _0xeb41b5,
        visitedGroups: _0x5cd4fc
      });
      continue;
    }
    for (const _0x1d6c47 of collectVideoEntriesForNode(_0x44d7b7?.[_0x4faa20] || _0xbfce1b)) {
      pushUniqueEntry(_0x30bbdf, _0xeb41b5, _0x1d6c47);
    }
  }
}
export function collectGroupSyncPlayableVideoEntries(_0x41a91e, _0x4131a3) {
  const _0x43962c = _0x41a91e?.[_0x4131a3];
  if (!_0x43962c || normalizeText(_0x43962c?.type) !== GROUP_NODE_TYPE) {
    return [];
  }
  const _0x506f37 = [];
  const _0x592468 = new Set();
  collectGroupEntriesInto({
    nodes: _0x41a91e,
    groupId: _0x4131a3,
    childrenByParent: buildChildrenByParent(_0x41a91e),
    result: _0x506f37,
    seen: _0x592468,
    visitedGroups: new Set()
  });
  return _0x506f37;
}
export function collectSelectedSyncPlayableVideoEntries(_0x1f40c8, _0x229bb7 = []) {
  const _0x48d020 = new Set((Array.isArray(_0x229bb7) ? _0x229bb7 : []).map(_0x1d41f9 => normalizeText(_0x1d41f9)).filter(Boolean));
  if (_0x48d020.size === 0) {
    return [];
  }
  const _0x1cc188 = [];
  const _0x463e0d = new Set();
  const _0x393553 = buildChildrenByParent(_0x1f40c8);
  const _0x309ac8 = toNodeList(_0x1f40c8).filter(_0x4bba4c => _0x48d020.has(normalizeText(_0x4bba4c?.id))).sort(compareCanvasOrder);
  for (const _0x12933e of _0x309ac8) {
    const _0x5288aa = normalizeText(_0x12933e?.type);
    if (_0x5288aa === GROUP_NODE_TYPE) {
      collectGroupEntriesInto({
        nodes: _0x1f40c8,
        groupId: _0x12933e.id,
        childrenByParent: _0x393553,
        result: _0x1cc188,
        seen: _0x463e0d,
        visitedGroups: new Set()
      });
      continue;
    }
    for (const _0x1900e6 of collectVideoEntriesForNode(_0x12933e)) {
      pushUniqueEntry(_0x1cc188, _0x463e0d, _0x1900e6);
    }
  }
  return _0x1cc188;
}
export function getSelectedSyncPlayableVideoCount(_0x182475, _0x492fa5 = []) {
  return collectSelectedSyncPlayableVideoEntries(_0x182475, _0x492fa5).length;
}
function findVideoElementForEntry(_0x347696, _0x59c03a) {
  const _0x4578a2 = _0x347696 || globalThis.document;
  if (!_0x4578a2 || typeof _0x4578a2.getElementById !== "function") {
    return null;
  }
  const _0x584b4b = _0x4578a2.getElementById(normalizeText(_0x59c03a?.nodeId));
  if (!_0x584b4b || typeof _0x584b4b.querySelector !== "function") {
    return null;
  }
  const _0x58c46e = Math.max(0, Math.trunc(Number(_0x59c03a?.videoIndex) || 0));
  return _0x584b4b.querySelector("video[data-idx=\"" + _0x58c46e + "\"]") || _0x584b4b.querySelector(".video-player") || _0x584b4b.querySelector("video");
}
function findWrapperForEntry(_0x477330, _0xefb5b8) {
  const _0x5234b7 = _0x477330 || globalThis.document;
  if (!_0x5234b7 || typeof _0x5234b7.getElementById !== "function") {
    return null;
  }
  return _0x5234b7.getElementById(normalizeText(_0xefb5b8?.nodeId));
}
function safePause(_0x572bcb) {
  try {
    _0x572bcb?.pause?.();
  } catch {}
}
function setSyncPlaybackChromeHidden(_0x39f495, _0x3e1c1c) {
  _0x39f495?.classList?.toggle?.(SYNC_PLAYBACK_CLASS, !!_0x3e1c1c);
}
function restoreSyncPlaybackChrome(_0x1c3ac5) {
  setSyncPlaybackChromeHidden(_0x1c3ac5, false);
}
function installSyncPlaybackChromeRestore(_0x47efe7, _0x4614a1, {
  restoreOnEnded = true
} = {}) {
  if (!_0x47efe7 || !_0x4614a1) {
    return () => {};
  }
  let _0x3bb8bf = false;
  const _0x5083ea = restoreOnEnded ? ["pause", "ended", "error"] : ["pause", "error"];
  const _0x1d8026 = () => {
    if (_0x3bb8bf) {
      return;
    }
    _0x3bb8bf = true;
    for (const _0x2d8bb6 of _0x5083ea) {
      _0x47efe7.removeEventListener?.(_0x2d8bb6, _0x1d8026);
    }
    restoreSyncPlaybackChrome(_0x4614a1);
  };
  for (const _0x1a759b of _0x5083ea) {
    _0x47efe7.addEventListener?.(_0x1a759b, _0x1d8026);
  }
  return _0x1d8026;
}
function isSpaceInteraction(_0x2e645d) {
  return _0x2e645d?.code === "Space" || _0x2e645d?.key === " " || _0x2e645d?.key === "Space";
}
function beginSyncVideoPlaybackSession({
  targets: _0x2dd51c,
  loop = false,
  documentObject: _0x5b004e,
  windowObject: _0xa14108,
  shouldStopOnPointerEvent: _0x3949c5
}) {
  const _0x292bd0 = loop === true;
  const _0x1e7145 = Object.freeze({
    kind: "sync-video-playback",
    id: ++syncVideoPlaybackSessionSequence
  });
  let _0x14df12 = "preparing";
  let _0x4b9ccc = false;
  let _0x19f788 = _0x2dd51c.filter(_0x472ca5 => _0x472ca5.videoEl);
  const _0xa49100 = new Map();
  const _0x4c7e20 = _0x4da535 => {
    const _0x3158c8 = _0xa49100.get(_0x4da535) || [];
    _0xa49100.delete(_0x4da535);
    while (_0x3158c8.length > 0) {
      _0x3158c8.pop()?.();
    }
  };
  const _0x3cfb05 = (_0x28ac90, {
    pause = false
  } = {}) => {
    _0x4c7e20(_0x28ac90);
    releaseExternalVideoPlayback(_0x28ac90.videoEl, _0x1e7145);
    _0x28ac90.cleanupChrome?.();
    _0x28ac90.videoEl.loop = false;
    if (pause) {
      safePause(_0x28ac90.videoEl);
    }
    _0x19f788 = _0x19f788.filter(_0x394e47 => _0x394e47 !== _0x28ac90);
  };
  const _0x2a47f9 = ({
    pauseTargets = true
  } = {}) => {
    if (_0x4b9ccc) {
      return false;
    }
    _0x4b9ccc = true;
    _0x14df12 = "stopped";
    const _0x333b57 = activeSyncVideoPlaybackSession === _0x6e182b;
    if (_0x333b57) {
      activeSyncVideoPlaybackSession = null;
    }
    _0x5b004e?.removeEventListener?.("pointerdown", _0x3e094c, true);
    _0xa14108?.removeEventListener?.("keydown", _0xe85850, true);
    for (const _0x735a22 of [..._0x19f788]) {
      _0x3cfb05(_0x735a22, {
        pause: pauseTargets
      });
    }
    if (_0x333b57) {
      notifySyncVideoPlaybackState();
    }
    return true;
  };
  const _0x265b8b = (_0x1654ec, _0x148bbb, _0x2d3fff) => {
    _0x1654ec.videoEl.addEventListener?.(_0x148bbb, _0x2d3fff);
    const _0x12b2a6 = _0xa49100.get(_0x1654ec) || [];
    _0x12b2a6.push(() => _0x1654ec.videoEl.removeEventListener?.(_0x148bbb, _0x2d3fff));
    _0xa49100.set(_0x1654ec, _0x12b2a6);
  };
  const _0x6e182b = {
    owner: _0x1e7145,
    loop: _0x292bd0,
    isCurrent() {
      return !_0x4b9ccc && activeSyncVideoPlaybackSession === _0x6e182b;
    },
    activate(_0x515d7e) {
      if (!_0x6e182b.isCurrent()) {
        return false;
      }
      const _0x3d6fdb = new Set(_0x515d7e);
      for (const _0x18018e of [..._0x19f788]) {
        if (_0x3d6fdb.has(_0x18018e)) {
          continue;
        }
        _0x3cfb05(_0x18018e, {
          pause: true
        });
      }
      const _0x271762 = _0x292bd0 ? 2 : 1;
      if (_0x19f788.length < _0x271762) {
        return false;
      }
      _0x14df12 = "active";
      for (const _0x7fd8b1 of _0x19f788) {
        const _0xd67d = () => {
          if (_0x14df12 !== "active" || !_0x6e182b.isCurrent()) {
            return;
          }
          if (_0x292bd0) {
            _0x6e182b.stop();
            return;
          }
          _0x3cfb05(_0x7fd8b1);
          if (_0x19f788.length === 0) {
            _0x2a47f9({
              pauseTargets: false
            });
          }
        };
        const _0x42892e = _0x292bd0 ? ["pause", "error"] : ["pause", "ended", "error"];
        for (const _0x5c7f59 of _0x42892e) {
          _0x265b8b(_0x7fd8b1, _0x5c7f59, _0xd67d);
        }
      }
      const _0x227922 = _0x19f788.filter(_0x502f83 => _0x502f83.videoEl?.paused === true || _0x502f83.videoEl?.isConnected === false);
      if (_0x292bd0 && _0x227922.length > 0) {
        _0x6e182b.stop();
        return false;
      }
      for (const _0x16b3e3 of _0x227922) {
        _0x3cfb05(_0x16b3e3);
      }
      if (_0x19f788.length === 0) {
        _0x2a47f9({
          pauseTargets: false
        });
        return false;
      }
      return _0x6e182b.isCurrent();
    },
    stop() {
      return _0x2a47f9({
        pauseTargets: true
      });
    }
  };
  const _0x3e094c = _0x20d9b1 => {
    if (typeof _0x3949c5 === "function") {
      try {
        if (_0x3949c5(_0x20d9b1) === false) {
          return;
        }
      } catch {}
    }
    _0x6e182b.stop();
  };
  const _0xe85850 = _0x518d79 => {
    if (isSpaceInteraction(_0x518d79)) {
      _0x6e182b.stop();
    }
  };
  activeSyncVideoPlaybackSession = _0x6e182b;
  for (const _0x5f0f16 of _0x19f788) {
    claimExternalVideoPlayback(_0x5f0f16.videoEl, _0x1e7145);
  }
  if (_0x292bd0) {
    _0x5b004e?.addEventListener?.("pointerdown", _0x3e094c, true);
    _0xa14108?.addEventListener?.("keydown", _0xe85850, true);
  }
  notifySyncVideoPlaybackState();
  return _0x6e182b;
}
export function stopActiveSyncVideoPlayback() {
  return activeSyncVideoPlaybackSession?.stop?.() === true;
}
export function stopActiveSyncVideoLoopPlayback() {
  if (activeSyncVideoPlaybackSession?.loop !== true) {
    return false;
  }
  return stopActiveSyncVideoPlayback();
}
function pauseOutsideTargetVideos(_0x79b4d8, _0x38c420) {
  const _0x2ca026 = _0x79b4d8 || globalThis.document;
  if (!_0x2ca026 || typeof _0x2ca026.querySelectorAll !== "function") {
    return;
  }
  const _0x40db37 = new Set(_0x38c420.filter(Boolean));
  _0x2ca026.querySelectorAll("video").forEach(_0x14181e => {
    if (_0x40db37.has(_0x14181e)) {
      return;
    }
    safePause(_0x14181e);
  });
}
function waitForMetadata(_0x315aa1, _0x3c11df = 500) {
  if (!_0x315aa1 || Number(_0x315aa1.readyState || 0) >= 1) {
    return Promise.resolve(true);
  }
  return new Promise(_0x22cf73 => {
    let _0x3a3cb7 = false;
    const _0x59ba06 = _0x459be6 => {
      if (_0x3a3cb7) {
        return;
      }
      _0x3a3cb7 = true;
      clearTimeout(_0x22cf3a);
      _0x315aa1.removeEventListener?.("loadedmetadata", _0x3d5d3b);
      _0x315aa1.removeEventListener?.("loadeddata", _0x3d5d3b);
      _0x315aa1.removeEventListener?.("error", _0x513b69);
      _0x22cf73(_0x459be6);
    };
    const _0x3d5d3b = () => _0x59ba06(true);
    const _0x513b69 = () => _0x59ba06(false);
    const _0x22cf3a = setTimeout(() => _0x59ba06(false), _0x3c11df);
    _0x315aa1.addEventListener?.("loadedmetadata", _0x3d5d3b);
    _0x315aa1.addEventListener?.("loadeddata", _0x3d5d3b);
    _0x315aa1.addEventListener?.("error", _0x513b69);
  });
}
async function ensureVideoSource(_0x2c6b97, _0x2af50c, _0xb603e0, {
  shouldAssign: _0x45fb52
} = {}) {
  if (!_0x2c6b97) {
    return false;
  }
  if (typeof _0x45fb52 === "function" && _0x45fb52() !== true) {
    return false;
  }
  const _0x597b6e = getVideoCurrentSource(_0x2c6b97);
  const _0x5f1216 = normalizeText(_0x2af50c);
  if (!_0x5f1216) {
    return !!_0x597b6e;
  }
  if (_0x597b6e === _0x5f1216 || isMediaElementPlaybackSource(_0x2c6b97, _0x5f1216)) {
    return true;
  }
  await _0xb603e0(_0x2c6b97, _0x5f1216, {
    preload: "auto",
    warmRanges: false,
    load: false,
    shouldAssign: _0x45fb52
  });
  if (typeof _0x45fb52 === "function" && _0x45fb52() !== true) {
    return false;
  }
  return !!getVideoCurrentSource(_0x2c6b97);
}
async function prepareVideoForSync(_0x4bf334, _0x2c72c2, _0x2a8032, {
  loop = false,
  shouldContinue: _0x5bcd47
} = {}) {
  safePause(_0x4bf334);
  const _0x1ee1e5 = () => typeof _0x5bcd47 !== "function" || _0x5bcd47() === true;
  if (!_0x1ee1e5()) {
    return false;
  }
  const _0x390b7b = await ensureVideoSource(_0x4bf334, _0x2c72c2, _0x2a8032, {
    shouldAssign: _0x5bcd47
  });
  if (!_0x390b7b) {
    return false;
  }
  await waitForMetadata(_0x4bf334);
  if (!_0x1ee1e5()) {
    return false;
  }
  try {
    _0x4bf334.currentTime = 0;
  } catch {}
  _0x4bf334.loop = loop === true;
  return true;
}
export async function syncPlayVideoEntries({
  entries = [],
  root = globalThis.document,
  showToast = globalThis.window?.showToast,
  playWithRecovery = playVideoWithRecovery,
  attachSource = attachMediaElementPlaybackSource,
  loop = false,
  documentObject = root || globalThis.document,
  windowObject = documentObject?.defaultView || globalThis.window,
  shouldStopOnPointerEvent: _0x25620b
} = {}) {
  stopActiveSyncVideoPlayback();
  const _0x4f6874 = Array.isArray(entries) ? entries : [];
  if (_0x4f6874.length < 2) {
    showToast?.(syncPlaybackText("fewerThanTwo"), "warn");
    return {
      played: 0,
      total: _0x4f6874.length,
      missing: 0,
      failed: 0
    };
  }
  const _0x2276fd = _0x4f6874.map(_0x364a0f => {
    const _0x402714 = findWrapperForEntry(root, _0x364a0f);
    return {
      entry: _0x364a0f,
      wrapper: _0x402714,
      videoEl: findVideoElementForEntry(root, _0x364a0f)
    };
  });
  const _0x23822e = _0x2276fd.map(_0x3a3ada => _0x3a3ada.videoEl).filter(Boolean);
  const _0x2d1a80 = loop === true;
  const _0x150445 = beginSyncVideoPlaybackSession({
    targets: _0x2276fd,
    loop: _0x2d1a80,
    documentObject: documentObject,
    windowObject: windowObject,
    shouldStopOnPointerEvent: _0x25620b
  });
  const _0x58cb62 = () => _0x150445.isCurrent();
  pauseOutsideTargetVideos(root, _0x23822e);
  let _0x2f900e = 0;
  let _0x26bd4b = 0;
  const _0x12de00 = [];
  await Promise.all(_0x2276fd.map(async _0x4d1228 => {
    const {
      entry: _0xd700ea,
      videoEl: _0x3c2145
    } = _0x4d1228;
    if (!_0x3c2145) {
      _0x2f900e += 1;
      return;
    }
    const _0x491037 = await prepareVideoForSync(_0x3c2145, _0xd700ea.source, attachSource, {
      loop: _0x2d1a80,
      shouldContinue: _0x58cb62
    });
    if (!_0x491037) {
      _0x26bd4b += 1;
      return;
    }
    _0x12de00.push(_0x4d1228);
  }));
  if (!_0x150445.isCurrent()) {
    return {
      played: 0,
      total: _0x4f6874.length,
      missing: _0x2f900e,
      failed: _0x26bd4b
    };
  }
  if (_0x12de00.length < 2) {
    _0x150445.stop();
    const _0x49b8a6 = _0x2f900e > 0 ? syncPlaybackText("selectedUnmounted") : syncPlaybackText("fewerThanTwo");
    showToast?.(_0x49b8a6, "warn");
    return {
      played: 0,
      total: _0x4f6874.length,
      missing: _0x2f900e,
      failed: _0x26bd4b
    };
  }
  const _0x1eb7a1 = _0x12de00.map(_0x4c6ec1 => {
    const {
      videoEl: _0x75a95,
      wrapper: _0x5ae428
    } = _0x4c6ec1;
    setSyncPlaybackChromeHidden(_0x5ae428, true);
    const _0x25b1bf = installSyncPlaybackChromeRestore(_0x75a95, _0x5ae428, {
      restoreOnEnded: !_0x2d1a80
    });
    _0x4c6ec1.cleanupChrome = _0x25b1bf;
    return _0x25b1bf;
  });
  const _0x2ce14c = await Promise.all(_0x12de00.map(({
    entry: _0x4a8735,
    videoEl: _0x2eeacc
  }, _0x45bc99) => playWithRecovery(_0x2eeacc, {
    label: "sync-video:" + _0x4a8735.nodeId + ":" + _0x4a8735.videoIndex,
    ensureSrc: () => ensureVideoSource(_0x2eeacc, _0x4a8735.source, attachSource, {
      shouldAssign: _0x58cb62
    }),
    allowConcurrent: true,
    shouldContinue: _0x58cb62,
    shouldRecover: () => _0x2eeacc.isConnected !== false && !_0x2eeacc.paused
  }).catch(() => {
    _0x1eb7a1[_0x45bc99]?.();
    return false;
  })));
  _0x2ce14c.forEach((_0x40d381, _0x14d1d2) => {
    if (!_0x40d381) {
      _0x1eb7a1[_0x14d1d2]?.();
    }
  });
  const _0x7fb5be = _0x2ce14c.filter(Boolean).length;
  _0x26bd4b += _0x2ce14c.length - _0x7fb5be;
  if (!_0x150445.isCurrent()) {
    _0x1eb7a1.forEach(_0x4f385b => _0x4f385b?.());
    _0x12de00.forEach(({
      videoEl: _0x50d3f2
    }) => {
      _0x50d3f2.loop = false;
      safePause(_0x50d3f2);
    });
    return {
      played: 0,
      total: _0x4f6874.length,
      missing: _0x2f900e,
      failed: _0x26bd4b
    };
  }
  if (_0x2d1a80) {
    const _0x2b6b5a = _0x12de00.filter((_0x1a2b83, _0x4f5bb5) => _0x2ce14c[_0x4f5bb5]);
    if (_0x2b6b5a.length < 2) {
      _0x150445.stop();
      showToast?.(syncPlaybackText("fewerThanTwo"), "warn");
      return {
        played: 0,
        total: _0x4f6874.length,
        missing: _0x2f900e,
        failed: _0x26bd4b
      };
    }
    if (_0x150445.activate(_0x2b6b5a) !== true) {
      _0x150445.stop();
      return {
        played: 0,
        total: _0x4f6874.length,
        missing: _0x2f900e,
        failed: _0x26bd4b
      };
    }
  } else {
    const _0x19bea5 = _0x12de00.filter((_0x4feb7a, _0x3db788) => _0x2ce14c[_0x3db788]);
    if (_0x19bea5.length === 0) {
      _0x150445.stop();
    } else {
      _0x150445.activate(_0x19bea5);
    }
  }
  if (_0x7fb5be > 0) {
    showToast?.(syncPlaybackText("playedCount", {
      count: _0x7fb5be
    }), "success");
  } else if (_0x2f900e > 0) {
    showToast?.(syncPlaybackText("selectedUnmounted"), "warn");
  } else {
    showToast?.(syncPlaybackText("none"), "warn");
  }
  return {
    played: _0x7fb5be,
    total: _0x4f6874.length,
    missing: _0x2f900e,
    failed: _0x26bd4b
  };
}
export function syncPlaySelectedVideos({
  selectedIds: _0xbf46b5,
  state: _0x4b7649,
  root = globalThis.document,
  showToast = globalThis.window?.showToast,
  ..._0x26d19d
} = {}) {
  const _0x43276c = _0x4b7649?.nodes || {};
  return syncPlayVideoEntries({
    entries: collectSelectedSyncPlayableVideoEntries(_0x43276c, _0xbf46b5),
    root: root,
    showToast: showToast,
    ..._0x26d19d
  });
}
export function syncPlayGroupVideos({
  groupId: _0x4ef500,
  state: _0x228dfb,
  root = globalThis.document,
  showToast = globalThis.window?.showToast,
  ..._0x4c18e1
} = {}) {
  const _0x323bc6 = _0x228dfb?.nodes || {};
  return syncPlayVideoEntries({
    entries: collectGroupSyncPlayableVideoEntries(_0x323bc6, _0x4ef500),
    root: root,
    showToast: showToast,
    ..._0x4c18e1
  });
}