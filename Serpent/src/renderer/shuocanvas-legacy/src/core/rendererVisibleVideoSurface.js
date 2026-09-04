import { acquireLocalVideoPlaybackObjectUrl, releaseLocalVideoPlaybackObjectUrlOwner } from "../services/localVideoPlaybackObjectUrlService.js";
import { attachMediaElementPlaybackSource } from "../services/desktopMediaBlobSource.js";
import { watchVideoFramePresentation } from "../services/videoFramePresentation.js";
import { isRendererRuntimeDiagnosticsEnabled, recordRendererRuntimeDiagnostic } from "./rendererRuntimeDiagnostics.js";
function nowMs() {
  if (typeof performance !== "undefined" && typeof performance.now === "function") {
    return performance.now();
  } else {
    return Date.now();
  }
}
function createSurfaceVideo(_0x5a22af) {
  const _0x169c52 = document.createElement("video");
  _0x169c52.className = "v2-renderer-visible-video-surface";
  _0x169c52.dataset.nodeId = _0x5a22af;
  _0x169c52.autoplay = false;
  _0x169c52.loop = false;
  _0x169c52.muted = true;
  _0x169c52.playsInline = true;
  _0x169c52.preload = "auto";
  _0x169c52.draggable = false;
  _0x169c52.setAttribute("playsinline", "");
  return _0x169c52;
}
function syncSurfaceGeometry(_0x41a709, _0x39d556) {
  const _0x1702d1 = _0x39d556.x + "," + _0x39d556.y + "," + _0x39d556.width + "," + _0x39d556.height;
  if (_0x41a709.dataset.geometryKey === _0x1702d1) {
    return;
  }
  _0x41a709.dataset.geometryKey = _0x1702d1;
  Object.assign(_0x41a709.style, {
    width: _0x39d556.width + "px",
    height: _0x39d556.height + "px",
    transform: "translate(" + _0x39d556.x + "px, " + _0x39d556.y + "px)"
  });
}
export function createRendererVisibleVideoSurfaceController({
  resolveSource: _0x406c06,
  acquireObjectUrl = acquireLocalVideoPlaybackObjectUrl,
  releaseOwner = releaseLocalVideoPlaybackObjectUrlOwner,
  attachSource = attachMediaElementPlaybackSource
} = {}) {
  const _0xd74bf3 = new Map();
  const _0x88e728 = isRendererRuntimeDiagnosticsEnabled();
  let _0x509a74 = null;
  function _0x4b73ed(_0x5663e7) {
    if (!_0x5663e7) {
      return null;
    }
    if (!_0x509a74) {
      _0x509a74 = document.createElement("div");
      _0x509a74.className = "v2-renderer-visible-video-surface-layer";
      _0x509a74.dataset.role = "renderer-visible-video-surface-layer";
    }
    if (_0x509a74.parentNode !== _0x5663e7) {
      _0x5663e7.appendChild(_0x509a74);
    }
    return _0x509a74;
  }
  function _0x1db80b(_0x5cc7b7) {
    const _0x5c22a5 = _0xd74bf3.get(_0x5cc7b7);
    if (!_0x5c22a5) {
      return false;
    }
    const _0xa65cb5 = _0x88e728 ? nowMs() : 0;
    _0xd74bf3.delete(_0x5cc7b7);
    if (_0x5c22a5.handedOff !== true) {
      _0x5c22a5.videoEl.remove?.();
    }
    releaseOwner(_0x5c22a5.ownerId);
    if (_0x88e728) {
      recordRendererRuntimeDiagnostic({
        kind: "visible-video-surface-forget",
        nodeId: _0x5cc7b7,
        handedOff: _0x5c22a5.handedOff === true,
        durationMs: nowMs() - _0xa65cb5
      });
    }
    return true;
  }
  function _0x4e40d7(_0x29d62a, _0x598dc0) {
    const _0x5e5da3 = String(_0x29d62a?.id || "").trim();
    const _0x1b6dea = String(_0x406c06?.(_0x29d62a) || "").trim();
    if (!_0x5e5da3 || !_0x1b6dea) {
      return null;
    }
    const _0x3b0914 = _0x4b73ed(_0x598dc0);
    if (!_0x3b0914) {
      return null;
    }
    const _0x380725 = createSurfaceVideo(_0x5e5da3);
    syncSurfaceGeometry(_0x380725, _0x29d62a);
    _0x3b0914.appendChild(_0x380725);
    const _0x4ae3b7 = "renderer-visible-video:" + _0x5e5da3;
    const _0x827ade = {
      nodeId: _0x5e5da3,
      sourceUrl: _0x1b6dea,
      ownerId: _0x4ae3b7,
      videoEl: _0x380725,
      handedOff: false,
      acquireState: "pending",
      ready: null
    };
    _0xd74bf3.set(_0x5e5da3, _0x827ade);
    if (_0x88e728) {
      recordRendererRuntimeDiagnostic({
        kind: "visible-video-surface-create",
        nodeId: _0x5e5da3,
        sourceUrl: _0x1b6dea
      });
    }
    const _0x3aff2f = () => {
      if (_0xd74bf3.get(_0x5e5da3) === _0x827ade) {
        _0x827ade.acquireState = "failed";
        if (_0x827ade.handedOff !== true) {
          _0x827ade.videoEl.remove?.();
        }
      }
      return false;
    };
    _0x827ade.ready = Promise.resolve(acquireObjectUrl(_0x1b6dea, _0x4ae3b7, {
      urgent: true
    })).then(async _0x2b3c9e => {
      if (_0xd74bf3.get(_0x5e5da3) !== _0x827ade) {
        return false;
      }
      if (!_0x2b3c9e) {
        return _0x3aff2f();
      }
      let _0x576c77 = false;
      const _0x297680 = () => {
        _0x576c77 = watchVideoFramePresentation(_0x380725) || _0x576c77;
      };
      const _0x4335e0 = _0x88e728 ? nowMs() : 0;
      try {
        await attachSource(_0x380725, _0x1b6dea, {
          playbackUrl: _0x2b3c9e,
          preload: "auto",
          load: true,
          onSourceAssigned: _0x297680,
          shouldAssign: () => _0xd74bf3.get(_0x5e5da3) === _0x827ade && _0x827ade.cancelled !== true
        });
        if (_0x88e728) {
          recordRendererRuntimeDiagnostic({
            kind: "visible-video-surface-attach",
            nodeId: _0x5e5da3,
            sourceUrl: _0x1b6dea,
            status: "fulfilled",
            durationMs: nowMs() - _0x4335e0
          });
        }
      } catch (_0x35bdc2) {
        if (_0x88e728) {
          recordRendererRuntimeDiagnostic({
            kind: "visible-video-surface-attach",
            nodeId: _0x5e5da3,
            sourceUrl: _0x1b6dea,
            status: "rejected",
            durationMs: nowMs() - _0x4335e0,
            error: String(_0x35bdc2?.message || _0x35bdc2 || "unknown")
          });
        }
        throw _0x35bdc2;
      }
      if (!_0x576c77) {
        _0x297680();
      }
      if (_0xd74bf3.get(_0x5e5da3) === _0x827ade) {
        _0x827ade.acquireState = "ready";
      }
      return true;
    }).catch(_0x3aff2f);
    return _0x827ade;
  }
  function _0x4a87ab(_0x210436, _0xd53c89, _0x33e19c) {
    const _0x59095b = new Set(_0x33e19c || []);
    for (const [_0x53572c, _0x3b07bf] of _0xd74bf3) {
      if (_0x3b07bf.handedOff === true || _0x59095b.has(_0x53572c)) {
        continue;
      }
      _0x1db80b(_0x53572c);
    }
    for (const _0xbbf03f of _0x59095b) {
      const _0x2a927d = _0xd53c89?.[_0xbbf03f];
      const _0x5357e0 = String(_0x406c06?.(_0x2a927d) || "").trim();
      const _0x4596fb = _0xd74bf3.get(_0xbbf03f);
      if (_0x4596fb && _0x4596fb.sourceUrl !== _0x5357e0) {
        _0x1db80b(_0xbbf03f);
      }
      const _0x208e6a = _0xd74bf3.get(_0xbbf03f) || _0x4e40d7(_0x2a927d, _0x210436);
      if (_0x208e6a && _0x208e6a.handedOff !== true) {
        syncSurfaceGeometry(_0x208e6a.videoEl, _0x2a927d);
      }
    }
  }
  function _0x20dfe1(_0x2834c1, _0x26adc6) {
    const _0x1db694 = _0xd74bf3.get(_0x2834c1);
    if (_0x1db694?.acquireState === "failed") {
      _0x1db80b(_0x2834c1);
      return false;
    }
    if (!_0x1db694 || _0x1db694.handedOff === true || _0x1db694.videoEl.isConnected === false) {
      return false;
    }
    const _0x8706d4 = _0x88e728 ? nowMs() : 0;
    if (_0x26adc6?.adoptRendererVisibleVideoSurface?.(_0x1db694) !== true) {
      if (_0x88e728) {
        recordRendererRuntimeDiagnostic({
          kind: "visible-video-surface-handoff",
          nodeId: _0x2834c1,
          adopted: false,
          durationMs: nowMs() - _0x8706d4
        });
      }
      return false;
    }
    _0x1db694.handedOff = true;
    if (_0x88e728) {
      recordRendererRuntimeDiagnostic({
        kind: "visible-video-surface-handoff",
        nodeId: _0x2834c1,
        adopted: true,
        durationMs: nowMs() - _0x8706d4
      });
    }
    return true;
  }
  function _0x53762c() {
    for (const _0x11a4ca of Array.from(_0xd74bf3.keys())) {
      _0x1db80b(_0x11a4ca);
    }
    _0x509a74?.remove?.();
    _0x509a74 = null;
  }
  return {
    sync: _0x4a87ab,
    handoff: _0x20dfe1,
    forget: _0x1db80b,
    reset: _0x53762c,
    hasPendingHandoff(_0x22ee2f) {
      const _0x2d93f1 = _0xd74bf3.get(_0x22ee2f);
      return !!_0x2d93f1 && _0x2d93f1.handedOff !== true;
    }
  };
}