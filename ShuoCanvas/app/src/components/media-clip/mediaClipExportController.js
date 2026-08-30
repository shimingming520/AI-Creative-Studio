import { runLocalMediaClipExport } from "../../../api/localMediaTaskApi.js";
import a395_0x51c334 from "../../core/stores/appStore.js";
import { generateId } from "../../core/math.js";
import { commit } from "../../modules/history.js";
import { t } from "../../i18n/index.js";
import { calcSafeSpawnPosNearNode } from "../../modules/nodeSpawn.js";
import { saveMediaDownload } from "../../services/downloadSaveService.js";
import { buildSourceAudioNodePayload, buildSourceMediaNodePayload, getAutoMediaSizeByShortSide } from "../../services/fileService.js";
import { localPathToUrl, pickResultLocalPath } from "../../utils/localMediaPath.js";
import { buildMediaClipExportPayload, resolveMediaClipDimensions, resolveMediaClipSourceKey } from "./mediaClipState.js";
import { resolveMediaClipImageUrl, resolveMediaClipLocalPath, resolveMediaClipOutputVideoDimensions, resolveMediaClipPosterImageFields, resolveMediaClipThumbUrl } from "./mediaClipSourceResolver.js";
import { firstNonEmpty, normalizeText, stopPointer, toNumber } from "./mediaClipUtils.js";
import { makeButton } from "./mediaClipViewUtils.js";
function mediaClipText(_0x2bc5f9, _0x49cd23 = {}) {
  return t("mediaClip." + _0x2bc5f9, _0x49cd23);
}
export function singleVisualClipExportTrack(_0x21d8e = {}) {
  return {
    sourceKey: _0x21d8e.sourceKey,
    startSec: _0x21d8e.startSec,
    endSec: _0x21d8e.endSec,
    durationSec: _0x21d8e.durationSec
  };
}
export function exportVisualClips(_0xe07d2, _0xbd9cc9 = _0xe07d2._mediaClip.tracks?.video) {
  return _0xe07d2._videoTimelineClips(_0xbd9cc9).map((_0x36faf5, _0x5aa444) => {
    const _0x2361ef = _0xe07d2._videoClipSource(_0x36faf5, _0x5aa444);
    const _0x2dab1a = firstNonEmpty(resolveMediaClipSourceKey(_0x2361ef), _0x36faf5?.sourceKey, resolveMediaClipLocalPath(_0x2361ef));
    if (!_0x2dab1a) {
      return null;
    }
    return {
      source: _0x2361ef,
      sourceKey: _0x2dab1a,
      kind: _0xe07d2._visualClipKind(_0x36faf5, _0x2361ef),
      startSec: _0x36faf5.startSec,
      endSec: _0x36faf5.endSec,
      durationSec: _0x36faf5.durationSec,
      timelineStartSec: _0x36faf5.timelineStartSec,
      timelineEndSec: _0x36faf5.timelineEndSec
    };
  }).filter(Boolean);
}
export function firstExportVideoSource(_0x316d41, _0x302336 = []) {
  return _0x302336.find(_0x4b271b => _0x4b271b.kind === "video")?.source || _0x302336[0]?.source || _0x316d41._firstVideoSource();
}
export function exportVisualDurationSec(_0x9e35cc = []) {
  return _0x9e35cc.reduce((_0x2e8112, _0x4db03c) => {
    const _0x57dd90 = toNumber(_0x4db03c?.startSec, 0);
    const _0x5d6f39 = Math.max(_0x57dd90, toNumber(_0x4db03c?.endSec, _0x57dd90));
    return _0x2e8112 + Math.max(0, _0x5d6f39 - _0x57dd90);
  }, 0);
}
export function exportAudioClips(_0x3b375d, _0x107b8e = _0x3b375d._mediaClip.tracks?.audio) {
  return _0x3b375d._audioTimelineClips(_0x107b8e).map((_0x1b54e0, _0x2607bd) => {
    const _0x237568 = _0x3b375d._audioClipSource(_0x1b54e0, _0x2607bd);
    const _0x46ed87 = firstNonEmpty(resolveMediaClipSourceKey(_0x237568), _0x1b54e0?.sourceKey, resolveMediaClipLocalPath(_0x237568));
    if (!_0x46ed87) {
      return null;
    }
    return {
      source: _0x237568,
      sourceKey: _0x46ed87,
      startSec: _0x1b54e0.startSec,
      endSec: _0x1b54e0.endSec,
      durationSec: _0x1b54e0.durationSec,
      timelineStartSec: _0x1b54e0.timelineStartSec,
      timelineEndSec: _0x1b54e0.timelineEndSec,
      laneIndex: _0x1b54e0.laneIndex,
      muted: _0x1b54e0.muted === true,
      disabled: _0x1b54e0.disabled === true
    };
  }).filter(Boolean);
}
export function exportLoadingTargetElement(_0x3e7a44) {
  return _0x3e7a44.el?.querySelector?.(".media-clip-preview") || _0x3e7a44.el?.querySelector?.(".media-clip-compact-body") || _0x3e7a44.el || null;
}
export function startExportLoading(_0x57bbc4, _0x352a19 = mediaClipText("export.loading")) {
  if (typeof document === "undefined") {
    return;
  }
  const _0x4d0aaf = _0x57bbc4._exportLoadingTargetElement();
  if (!_0x4d0aaf) {
    return;
  }
  if (_0x57bbc4._exportLoadingTarget && _0x57bbc4._exportLoadingTarget !== _0x4d0aaf) {
    _0x57bbc4._stopExportLoading();
  }
  _0x57bbc4._exportLoadingTarget = _0x4d0aaf;
  _0x4d0aaf.classList?.add("is-exporting-material");
  const _0x3a550e = _0x4d0aaf.querySelector?.(".media-clip-export-loading-overlay");
  if (_0x3a550e) {
    const _0xce89f9 = _0x3a550e.querySelector?.(".media-clip-export-loading-label");
    if (_0xce89f9) {
      _0xce89f9.textContent = _0x352a19;
    }
    return;
  }
  const _0x20bad1 = document.createElement("div");
  _0x20bad1.className = "media-clip-export-loading-overlay";
  _0x20bad1.setAttribute("role", "status");
  _0x20bad1.setAttribute("aria-live", "polite");
  const _0x2567d3 = document.createElement("div");
  _0x2567d3.className = "media-clip-export-loading-spinner";
  const _0x3f2988 = document.createElement("div");
  _0x3f2988.className = "media-clip-export-loading-label";
  _0x3f2988.textContent = _0x352a19;
  const _0x4a395d = document.createElement("div");
  _0x4a395d.className = "media-clip-export-loading-bar";
  const _0x45f7ef = document.createElement("div");
  _0x45f7ef.className = "media-clip-export-loading-bar-fill";
  _0x4a395d.appendChild(_0x45f7ef);
  _0x20bad1.append(_0x2567d3, _0x3f2988, _0x4a395d);
  _0x4d0aaf.appendChild(_0x20bad1);
}
export function stopExportLoading(_0x13431d) {
  const _0x5461d5 = _0x13431d._exportLoadingTarget;
  _0x5461d5?.classList?.remove("is-exporting-material");
  _0x5461d5?.querySelectorAll?.(".media-clip-export-loading-overlay")?.forEach(_0x31e793 => {
    if (typeof _0x31e793.remove === "function") {
      _0x31e793.remove();
      return;
    }
    _0x31e793.parentNode?.removeChild?.(_0x31e793);
  });
  _0x13431d._exportLoadingTarget = null;
}
export function waitForExportLoadingFrame() {
  return new Promise(_0x2f450e => {
    if (typeof requestAnimationFrame === "function") {
      requestAnimationFrame(() => _0x2f450e());
      return;
    }
    setTimeout(_0x2f450e, 0);
  });
}
export async function exportMaterialToCanvas(_0x472e76, _0x20bf0d = "video", _0x1a0c5a = 0) {
  if (_0x472e76._exporting) {
    return;
  }
  const _0x3755b2 = _0x20bf0d === "audio" ? "audio" : "video";
  let _0xabeeb5 = null;
  let _0x1dd6f2 = null;
  let _0x306580 = "";
  let _0xf0b827 = {};
  let _0x373355 = null;
  if (_0x3755b2 === "audio") {
    const _0x2ccb6b = _0x472e76._mediaClip.tracks?.audio || null;
    const _0x5d24df = _0x472e76._audioTimelineClips(_0x2ccb6b);
    const _0xf7fcef = Math.max(0, Math.min(_0x5d24df.length - 1, Math.trunc(toNumber(_0x1a0c5a, 0))));
    const _0x17946c = _0x5d24df[_0xf7fcef] || null;
    const _0x26aedf = _0x17946c ? {
      sourceKey: _0x17946c.sourceKey,
      startSec: _0x17946c.startSec,
      endSec: _0x17946c.endSec,
      durationSec: _0x17946c.durationSec
    } : _0x2ccb6b;
    _0x1dd6f2 = _0x17946c ? _0x472e76._audioClipSource(_0x17946c, _0xf7fcef) : _0x472e76._sources.audio;
    _0xabeeb5 = buildMediaClipExportPayload({
      audioSource: _0x1dd6f2,
      audioTrack: _0x26aedf
    });
    _0x306580 = "audio";
    _0xf0b827 = {
      source: _0x1dd6f2,
      name: mediaClipText("outputNames.audio"),
      durationSec: Math.max(0, toNumber(_0x26aedf?.endSec, 0) - toNumber(_0x26aedf?.startSec, 0))
    };
  } else {
    const _0x2c7fd4 = _0x472e76._videoTimelineClips(_0x472e76._mediaClip.tracks?.video);
    const _0x24593f = Math.max(0, Math.min(_0x2c7fd4.length - 1, Math.trunc(toNumber(_0x1a0c5a, 0))));
    const _0x5a751f = _0x2c7fd4[_0x24593f];
    if (!_0x5a751f) {
      return;
    }
    _0x1dd6f2 = _0x472e76._videoClipSource(_0x5a751f, _0x24593f);
    const _0x5978ca = _0x472e76._visualClipKind(_0x5a751f, _0x1dd6f2);
    if (_0x5978ca === "image") {
      _0x373355 = _0x1dd6f2;
      _0xf0b827 = {
        name: mediaClipText("outputNames.image")
      };
    } else {
      _0xabeeb5 = buildMediaClipExportPayload({
        videoSource: _0x1dd6f2,
        videoTrack: _0x472e76._singleVisualClipExportTrack(_0x5a751f)
      });
      _0x306580 = "video";
      _0xf0b827 = {
        source: _0x1dd6f2,
        name: mediaClipText("outputNames.video"),
        durationSec: Math.max(0, toNumber(_0x5a751f.endSec, 0) - toNumber(_0x5a751f.startSec, 0))
      };
    }
  }
  if (!_0xabeeb5 && !_0x373355) {
    window.showToast?.(mediaClipText("export.noMaterial"));
    return;
  }
  _0x472e76._exporting = true;
  _0x472e76.el?.classList?.add("is-exporting");
  _0x472e76._startExportLoading();
  try {
    await _0x472e76._waitForExportLoadingFrame();
    if (_0x373355) {
      _0x472e76._addImageOutputNodeFromSource(_0x373355, _0xf0b827);
    } else {
      const _0x24aeb3 = await runLocalMediaClipExport(_0xabeeb5, {
        timeout: 600000
      });
      _0x472e76._addOutputNode(_0x306580 || _0xabeeb5.outputType, _0x24aeb3, _0xf0b827);
    }
    window.showToast?.(mediaClipText("export.materialAdded"));
  } catch (_0x4c2dab) {
    window.showToast?.(_0x4c2dab?.message || mediaClipText("export.materialFailed"));
  } finally {
    _0x472e76._exporting = false;
    _0x472e76.el?.classList?.remove("is-exporting");
    _0x472e76._stopExportLoading();
    _0x472e76._render();
  }
}
export function renderDownloadMenu(_0x234fc6) {
  const _0x28700c = document.createElement("div");
  _0x28700c.className = "v2-canvas-ctx-menu media-clip-menu";
  const _0x1ae097 = mediaClipText("menu.addToCanvas");
  const _0x35b76e = makeButton("v2-menu-row media-clip-menu-item", _0x1ae097, _0x1ae097);
  _0x35b76e.addEventListener("click", async _0x53add4 => {
    stopPointer(_0x53add4);
    _0x234fc6._setDownloadMenuOpen(false);
    await _0x234fc6._exportAndUse("canvas");
  });
  const _0x406f9d = mediaClipText("menu.export");
  const _0x541552 = makeButton("v2-menu-row media-clip-menu-item", _0x406f9d, _0x406f9d);
  _0x541552.addEventListener("click", async _0x2e180c => {
    stopPointer(_0x2e180c);
    _0x234fc6._setDownloadMenuOpen(false);
    await _0x234fc6._exportAndUse("download");
  });
  _0x28700c.append(_0x35b76e, _0x541552);
  return _0x28700c;
}
export async function exportAndUse(_0x424cfa, _0x123c85) {
  if (_0x424cfa._exporting) {
    return;
  }
  const _0x469821 = _0x424cfa._mediaClip.tracks?.video || null;
  const _0x4f5991 = _0x424cfa._mediaClip.tracks?.audio || null;
  const _0x1e2e18 = _0x424cfa._exportVisualClips(_0x469821);
  const _0x312875 = _0x424cfa._exportAudioClips(_0x4f5991);
  const _0x3fce4c = _0x424cfa._firstExportVideoSource(_0x1e2e18);
  const _0x35a2e3 = _0x424cfa._exportVisualDurationSec(_0x1e2e18);
  const _0x23fb79 = buildMediaClipExportPayload({
    videoSource: _0x3fce4c,
    videoTrack: _0x469821,
    audioTrack: _0x4f5991,
    videoClips: _0x1e2e18,
    audioClips: _0x312875
  });
  if (!_0x23fb79) {
    window.showToast?.(mediaClipText("export.noClips"));
    return;
  }
  _0x424cfa._exporting = true;
  _0x424cfa.el.classList.add("is-exporting");
  _0x424cfa._startExportLoading();
  try {
    await _0x424cfa._waitForExportLoadingFrame();
    let _0x2baf4b = null;
    if (_0x424cfa._mediaClip.lastOutput?.signature === _0x23fb79.signature && _0x424cfa._mediaClip.lastOutput?.localPath) {
      _0x2baf4b = {
        ..._0x424cfa._mediaClip.lastOutput
      };
    } else {
      _0x2baf4b = await runLocalMediaClipExport(_0x23fb79, {
        timeout: 600000
      });
      const _0x5c7d42 = pickResultLocalPath(_0x2baf4b) || _0x2baf4b?.localPath || _0x2baf4b?.path || "";
      const _0x4d3987 = {
        ..._0x2baf4b,
        outputType: _0x23fb79.outputType,
        signature: _0x23fb79.signature,
        localPath: _0x5c7d42
      };
      _0x424cfa._setMediaClip({
        ..._0x424cfa._mediaClip,
        lastOutput: _0x4d3987
      }, true, {
        render: false
      });
      _0x2baf4b = _0x4d3987;
    }
    if (_0x123c85 === "download") {
      const _0x71fdf3 = await saveMediaDownload({
        kind: _0x23fb79.outputType,
        localPath: _0x2baf4b.localPath,
        filename: _0x2baf4b.filename
      });
      if (_0x71fdf3?.canceled) {
        return;
      }
    } else {
      _0x424cfa._addOutputNode(_0x23fb79.outputType, _0x2baf4b, {
        source: _0x3fce4c,
        durationSec: _0x35a2e3 || Math.max(0, toNumber(_0x469821?.endSec, 0) - toNumber(_0x469821?.startSec, 0))
      });
    }
    window.showToast?.(mediaClipText("export.clipExported"));
  } catch (_0x33c895) {
    window.showToast?.(_0x33c895?.message || mediaClipText("export.clipFailed"));
  } finally {
    _0x424cfa._exporting = false;
    _0x424cfa.el.classList.remove("is-exporting");
    _0x424cfa._stopExportLoading();
  }
}
export function resolveOutputNodePosition(_0x1dbfbf, _0x5a45d9, _0x702c7b) {
  return calcSafeSpawnPosNearNode(a395_0x51c334.getState()?.nodes || {}, _0x1dbfbf.nodeData || {}, _0x5a45d9, _0x702c7b);
}
export function addImageOutputNodeFromSource(_0x447554, _0x11bfa1 = {}, _0x56788d = {}) {
  const _0x3eaf9b = resolveMediaClipImageUrl(_0x11bfa1);
  const _0x3ae64c = resolveMediaClipLocalPath(_0x11bfa1);
  if (!_0x3eaf9b && !_0x3ae64c) {
    return;
  }
  const _0x53ebba = resolveMediaClipDimensions(_0x11bfa1);
  const _0x2db4e6 = getAutoMediaSizeByShortSide(_0x53ebba.width, _0x53ebba.height);
  const _0x376da7 = _0x447554._resolveOutputNodePosition(_0x2db4e6.width, _0x2db4e6.height);
  const _0xc1a44d = generateId("source-image");
  const _0x3ef2b3 = buildSourceMediaNodePayload({
    id: _0xc1a44d,
    type: "source-image",
    x: _0x376da7.x,
    y: _0x376da7.y,
    width: _0x2db4e6.width,
    height: _0x2db4e6.height,
    name: _0x56788d.name || mediaClipText("outputNames.image"),
    src: _0x3eaf9b,
    imageUrl: _0x3eaf9b,
    sourceUrl: normalizeText(_0x11bfa1?.sourceUrl || _0x3eaf9b),
    thumbUrl: normalizeText(_0x11bfa1?.thumbUrl || resolveMediaClipThumbUrl(_0x11bfa1)),
    localPath: _0x3ae64c,
    originalLocalPath: normalizeText(_0x11bfa1?.originalLocalPath || _0x3ae64c),
    displayLocalPath: normalizeText(_0x11bfa1?.displayLocalPath || _0x3ae64c),
    naturalWidth: _0x53ebba.width,
    naturalHeight: _0x53ebba.height,
    fileName: _0x11bfa1?.fileName || "",
    needsAutoResize: false
  });
  a395_0x51c334.addNode(_0x3ef2b3);
  a395_0x51c334.setSelectedNodes([_0xc1a44d]);
  commit();
}
export function addOutputNode(_0x4148bf, _0x50afe0, _0x23306f = {}, _0x35754b = {}) {
  const _0x508f45 = pickResultLocalPath(_0x23306f) || normalizeText(_0x23306f.localPath || _0x23306f.path);
  if (!_0x508f45) {
    return;
  }
  const _0x95e845 = localPathToUrl(_0x508f45);
  if (_0x50afe0 === "audio") {
    const _0x376fa1 = generateId("source-audio");
    const _0x1acf62 = _0x4148bf._resolveOutputNodePosition(320, 140);
    const _0x1b6a09 = buildSourceAudioNodePayload({
      id: _0x376fa1,
      type: "source-audio",
      x: _0x1acf62.x,
      y: _0x1acf62.y,
      width: 320,
      height: 140,
      name: _0x35754b.name || mediaClipText("outputNames.audio"),
      src: _0x95e845,
      audioUrl: _0x95e845,
      localPath: _0x508f45,
      audioDuration: toNumber(_0x23306f.audioDuration, _0x35754b.durationSec || 0),
      fileName: _0x23306f.filename || ""
    });
    a395_0x51c334.addNode(_0x1b6a09);
    a395_0x51c334.setSelectedNodes([_0x376fa1]);
    commit();
    return;
  }
  const _0x32ba92 = _0x35754b.source || _0x4148bf._sources.video;
  const _0x5883b6 = resolveMediaClipOutputVideoDimensions(_0x32ba92, _0x23306f);
  const _0x19edd9 = getAutoMediaSizeByShortSide(_0x5883b6.width, _0x5883b6.height);
  const _0x48278e = _0x4148bf._resolveOutputNodePosition(_0x19edd9.width, _0x19edd9.height);
  const _0x57462c = generateId("source-video");
  const _0x492f16 = resolveMediaClipPosterImageFields(_0x32ba92, _0x23306f, _0x35754b);
  const _0x2808d1 = _0x492f16.isOutputPoster === true;
  const _0x289981 = {
    ...buildSourceMediaNodePayload({
      id: _0x57462c,
      type: "source-video",
      x: _0x48278e.x,
      y: _0x48278e.y,
      width: _0x19edd9.width,
      height: _0x19edd9.height,
      name: _0x35754b.name || mediaClipText("outputNames.video"),
      src: _0x95e845,
      videoUrl: _0x95e845,
      localPath: _0x508f45,
      originalLocalPath: _0x508f45,
      displayLocalPath: _0x508f45,
      thumbUrl: _0x2808d1 ? _0x492f16.thumbUrl : "",
      posterUrl: _0x2808d1 ? _0x492f16.posterUrl : "",
      thumbLocalPath: _0x2808d1 ? _0x492f16.thumbLocalPath : "",
      posterLocalPath: _0x2808d1 ? _0x492f16.posterLocalPath : "",
      videoThumbSrc: _0x95e845,
      naturalWidth: _0x5883b6.width,
      naturalHeight: _0x5883b6.height,
      videoWidth: _0x5883b6.width,
      videoHeight: _0x5883b6.height,
      videoDuration: toNumber(_0x23306f.videoDuration, _0x35754b.durationSec || _0x4148bf._mediaClip.tracks?.video?.endSec || 0),
      fileName: _0x23306f.filename || "",
      needsAutoResize: false
    }),
    naturalWidth: _0x5883b6.width,
    naturalHeight: _0x5883b6.height,
    videoWidth: _0x5883b6.width,
    videoHeight: _0x5883b6.height,
    needsAutoResize: false
  };
  a395_0x51c334.addNode(_0x289981);
  a395_0x51c334.setSelectedNodes([_0x57462c]);
  commit();
}