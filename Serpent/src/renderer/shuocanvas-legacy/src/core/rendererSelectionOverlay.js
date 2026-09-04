import { isNodeType } from "../modules/registry.js";
import { getMediaComposeButtonLabel, getSelectedMediaComposeKind } from "../modules/mediaComposeSelection.js";
import { hasBatchExportableSelection } from "../modules/nodeBatchExport.js";
import { getSelectedSyncPlayableVideoCount, getSyncVideoPlaybackState as a698_0x4433ee, subscribeSyncVideoPlaybackState as a698_0xc8ff6 } from "../modules/videoSyncPlayback.js";
import { t } from "../i18n/index.js";
import { computeSelectionBounds, getAlignableSelectionNodes } from "./math.js";
const SVG_NS = "http://www.w3.org/2000/svg";
function createSvg(_0xe4db68 = "2") {
  const _0x2c9bb7 = document.createElementNS(SVG_NS, "svg");
  _0x2c9bb7.setAttribute("viewBox", "0 0 24 24");
  _0x2c9bb7.setAttribute("fill", "none");
  _0x2c9bb7.setAttribute("stroke", "currentColor");
  _0x2c9bb7.setAttribute("stroke-width", _0xe4db68);
  _0x2c9bb7.setAttribute("stroke-linecap", "round");
  _0x2c9bb7.setAttribute("stroke-linejoin", "round");
  return _0x2c9bb7;
}
function appendPath(_0x26ca6a, _0x3a357e) {
  const _0x1d7480 = document.createElementNS(SVG_NS, "path");
  _0x1d7480.setAttribute("d", _0x3a357e);
  _0x26ca6a.appendChild(_0x1d7480);
  return _0x1d7480;
}
function createIconButton(_0x5f5b26, _0x146c9d, _0x4213a5) {
  const _0xa142c1 = document.createElement("button");
  _0xa142c1.type = "button";
  _0xa142c1.className = "v2-multi-select-btn";
  _0xa142c1.dataset.uiAction = _0x5f5b26;
  _0xa142c1.title = _0x146c9d;
  _0xa142c1.setAttribute("aria-label", _0x146c9d);
  _0xa142c1.replaceChildren(_0x4213a5);
  return _0xa142c1;
}
function syncVideoPlaybackButtonPresentation(_0x310809, _0x4e51a8 = {}) {
  if (!_0x310809) {
    return false;
  }
  const _0x2a1b08 = _0x4e51a8?.active === true;
  const _0x1927a2 = t(_0x2a1b08 ? "coreUi.renderer.multiSelect.syncVideoPause" : "coreUi.renderer.multiSelect.syncVideoPlay");
  const _0x2e9210 = _0x2a1b08 ? "playing" : "idle";
  if (_0x310809.dataset.syncPlaybackState === _0x2e9210 && _0x310809.getAttribute("aria-label") === _0x1927a2) {
    return _0x2a1b08;
  }
  _0x310809.classList.toggle("is-playing", _0x2a1b08);
  _0x310809.setAttribute("aria-pressed", _0x2a1b08 ? "true" : "false");
  _0x310809.setAttribute("aria-label", _0x1927a2);
  if (_0x310809.hasAttribute?.("title")) {
    _0x310809.setAttribute("title", _0x1927a2);
  }
  _0x310809.dataset.tooltip = _0x1927a2;
  _0x310809.dataset.syncPlaybackState = _0x2e9210;
  const _0x23f941 = _0x310809.querySelector("[data-sync-video-icon=\"play\"]");
  const _0x1e0e79 = _0x310809.querySelector("[data-sync-video-icon=\"pause\"]");
  if (_0x23f941?.style) {
    _0x23f941.style.display = _0x2a1b08 ? "none" : "";
  }
  if (_0x1e0e79?.style) {
    _0x1e0e79.style.display = _0x2a1b08 ? "" : "none";
  }
  return _0x2a1b08;
}
function createMultiSelectBoxEl() {
  const _0x1241b0 = document.createElement("div");
  _0x1241b0.id = "v2-multi-select-box";
  _0x1241b0.className = "v2-multi-select-box";
  const _0x114780 = document.createElement("div");
  _0x114780.className = "v2-multi-select-tab";
  _0x114780.dataset.uiStop = "1";
  const _0x3a3076 = createSvg("2.5");
  _0x3a3076.dataset.syncVideoIcon = "play";
  const _0xf967db = document.createElementNS(SVG_NS, "polygon");
  _0xf967db.setAttribute("points", "5 3 19 12 5 21 5 3");
  _0x3a3076.appendChild(_0xf967db);
  const _0x48c9f2 = createIconButton("ms-sync-video-play", t("coreUi.renderer.multiSelect.syncVideoPlay"), _0x3a3076);
  const _0x5b0977 = createSvg("2.5");
  _0x5b0977.dataset.syncVideoIcon = "pause";
  for (const _0x41d4e1 of [6, 14]) {
    const _0x5b6c92 = document.createElementNS(SVG_NS, "rect");
    _0x5b6c92.setAttribute("x", String(_0x41d4e1));
    _0x5b6c92.setAttribute("y", "4");
    _0x5b6c92.setAttribute("width", "4");
    _0x5b6c92.setAttribute("height", "16");
    _0x5b6c92.setAttribute("rx", "1");
    _0x5b0977.appendChild(_0x5b6c92);
  }
  _0x5b0977.style.display = "none";
  _0x48c9f2.appendChild(_0x5b0977);
  syncVideoPlaybackButtonPresentation(_0x48c9f2, {
    active: false
  });
  _0x48c9f2.style.display = "none";
  const _0xee93a = createSvg("2");
  ["M12 3l1.2 4.1L17 8.3l-3.8 1.2L12 13.5l-1.2-4-3.8-1.2 3.8-1.2L12 3z", "M18 14l.7 2.3L21 17l-2.3.7L18 20l-.7-2.3L15 17l2.3-.7L18 14z", "M6 13l.8 2.7L9.5 16.5l-2.7.8L6 20l-.8-2.7-2.7-.8 2.7-.8L6 13z"].forEach(_0x48b450 => appendPath(_0xee93a, _0x48b450));
  const _0x343bb2 = createIconButton("ms-run-selected", t("coreUi.renderer.multiSelect.runSelected"), _0xee93a);
  const _0xb037a0 = createSvg("1.8");
  const _0xbec76f = document.createElementNS(SVG_NS, "polygon");
  _0xbec76f.setAttribute("points", "12 2 20 12 16 12 16 22 8 22 8 12 4 12 12 2");
  _0xb037a0.appendChild(_0xbec76f);
  const _0x943055 = createIconButton("ms-asset", t("coreUi.renderer.multiSelect.createAsset"), _0xb037a0);
  const _0x2dce25 = createSvg("2");
  ["M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4", "M7 10l5 5 5-5", "M12 15V3"].forEach(_0x46fd0c => appendPath(_0x2dce25, _0x46fd0c));
  const _0x102141 = createIconButton("ms-batch-download", t("coreUi.renderer.multiSelect.batchDownload"), _0x2dce25);
  const _0x14eed3 = createSvg("2");
  for (const [_0x4886d0, _0x328ae3] of [[3, 3], [14, 3], [14, 14], [3, 14]]) {
    const _0x3b2e29 = document.createElementNS(SVG_NS, "rect");
    _0x3b2e29.setAttribute("x", String(_0x4886d0));
    _0x3b2e29.setAttribute("y", String(_0x328ae3));
    _0x3b2e29.setAttribute("width", "7");
    _0x3b2e29.setAttribute("height", "7");
    _0x14eed3.appendChild(_0x3b2e29);
  }
  const _0x5d47f3 = createIconButton("ms-group", t("coreUi.renderer.multiSelect.group"), _0x14eed3);
  const _0x5bdba3 = createSvg("2");
  appendPath(_0x5bdba3, "M3 12a9 9 0 0 1 15.36-6.36");
  appendPath(_0x5bdba3, "M21 12a9 9 0 0 1-15.36 6.36");
  const _0x43ee9e = document.createElementNS(SVG_NS, "polyline");
  _0x43ee9e.setAttribute("points", "21 3 21 9 15 9");
  const _0x491708 = document.createElementNS(SVG_NS, "polyline");
  _0x491708.setAttribute("points", "3 21 3 15 9 15");
  _0x5bdba3.appendChild(_0x43ee9e);
  _0x5bdba3.appendChild(_0x491708);
  const _0x10e19c = createIconButton("ms-reset-image-size", t("coreUi.renderer.multiSelect.resetDefaultSize"), _0x5bdba3);
  _0x10e19c.style.display = "none";
  const _0x548514 = createSvg("2");
  const _0xb015a1 = document.createElementNS(SVG_NS, "rect");
  _0xb015a1.setAttribute("x", "3");
  _0xb015a1.setAttribute("y", "5");
  _0xb015a1.setAttribute("width", "18");
  _0xb015a1.setAttribute("height", "14");
  _0xb015a1.setAttribute("rx", "2");
  _0x548514.appendChild(_0xb015a1);
  appendPath(_0x548514, "M3 9h18");
  appendPath(_0x548514, "M7 5l4 4");
  appendPath(_0x548514, "M13 5l4 4");
  const _0x2074cc = createIconButton("ms-compose-video", t("coreUi.renderer.multiSelect.composeVideo"), _0x548514);
  _0x2074cc.style.display = "none";
  const _0x3aa6a1 = createSvg("2");
  ["M5 4h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z", "M3 10h18", "M12 10v10"].forEach(_0x2a1097 => appendPath(_0x3aa6a1, _0x2a1097));
  const _0x246e24 = createIconButton("ms-create-collage", t("coreUi.renderer.multiSelect.createCollage"), _0x3aa6a1);
  _0x246e24.style.display = "none";
  const _0x58555c = document.createElement("span");
  _0x58555c.className = "v2-multi-select-separator";
  _0x58555c.setAttribute("aria-hidden", "true");
  _0x58555c.textContent = "|";
  _0x114780.appendChild(_0x343bb2);
  _0x114780.appendChild(_0x48c9f2);
  _0x114780.appendChild(_0x943055);
  _0x114780.appendChild(_0x5d47f3);
  _0x114780.appendChild(_0x246e24);
  _0x114780.appendChild(_0x2074cc);
  _0x114780.appendChild(_0x58555c);
  _0x114780.appendChild(_0x10e19c);
  _0x114780.appendChild(_0x102141);
  _0x1241b0.appendChild(_0x114780);
  return _0x1241b0;
}
function createAlignCenterPanelEl() {
  const _0x143480 = document.createElement("div");
  _0x143480.id = "v2-align-center-panel";
  _0x143480.className = "v2-align-center-panel";
  _0x143480.dataset.uiStop = "1";
  _0x143480.style.display = "none";
  const _0x4214ef = {
    "ms-align-left": ["M4 4v16", "M8 7h10", "M8 12h7", "M8 17h9"],
    "ms-align-h-center": ["M12 4v16", "M7 7h10", "M9 12h6", "M8 17h8"],
    "ms-align-right": ["M20 4v16", "M6 7h10", "M9 12h7", "M7 17h9"],
    "ms-align-top": ["M4 4h16", "M7 8v10", "M12 8v7", "M17 8v9"],
    "ms-align-v-center": ["M4 12h16", "M7 7v10", "M12 9v6", "M17 8v8"],
    "ms-align-bottom": ["M4 20h16", "M7 6v10", "M12 9v7", "M17 7v9"],
    "ms-distribute-h": ["M3 20h18", "M5 8h3v8H5z", "M11 5h3v11h-3z", "M17 10h3v6h-3z"],
    "ms-distribute-v": ["M20 3v18", "M8 5h8v3H8z", "M5 11h11v3H5z", "M10 17h6v3h-6z"],
    "ms-arrange-grid": ["M4 4h5v5H4z", "M15 4h5v5h-5z", "M4 15h5v5H4z", "M15 15h5v5h-5z"]
  };
  const _0x4efdc6 = [{
    action: "ms-align-left",
    tooltip: t("coreUi.renderer.align.left"),
    slot: "slot-1"
  }, {
    action: "ms-align-h-center",
    tooltip: t("coreUi.renderer.align.hCenter"),
    slot: "slot-2"
  }, {
    action: "ms-align-right",
    tooltip: t("coreUi.renderer.align.right"),
    slot: "slot-3"
  }, {
    action: "ms-align-top",
    tooltip: t("coreUi.renderer.align.top"),
    slot: "slot-4"
  }, {
    action: "ms-arrange-grid",
    tooltip: t("coreUi.renderer.align.arrangeGridHint"),
    slot: "slot-5"
  }, {
    action: "ms-align-bottom",
    tooltip: t("coreUi.renderer.align.bottom"),
    slot: "slot-6"
  }, {
    action: "ms-distribute-h",
    tooltip: t("coreUi.renderer.align.distributeH"),
    slot: "slot-7"
  }, {
    action: "ms-align-v-center",
    tooltip: t("coreUi.renderer.align.vCenter"),
    slot: "slot-8"
  }, {
    action: "ms-distribute-v",
    tooltip: t("coreUi.renderer.align.distributeV"),
    slot: "slot-9"
  }];
  for (const _0x3bdb62 of _0x4efdc6) {
    const _0x1d6380 = document.createElement("button");
    _0x1d6380.type = "button";
    _0x1d6380.className = "v2-align-center-btn " + _0x3bdb62.slot;
    _0x1d6380.dataset.uiAction = _0x3bdb62.action;
    _0x1d6380.dataset.tooltip = _0x3bdb62.tooltip;
    _0x1d6380.setAttribute("aria-label", _0x3bdb62.tooltip);
    if (_0x3bdb62.action === "ms-arrange-grid") {
      _0x1d6380.setAttribute("aria-haspopup", "menu");
      _0x1d6380.setAttribute("aria-expanded", "false");
    }
    const _0x5bf69d = createSvg("2");
    _0x5bf69d.setAttribute("width", "16");
    _0x5bf69d.setAttribute("height", "16");
    for (const _0x1ece4c of _0x4214ef[_0x3bdb62.action] || []) {
      appendPath(_0x5bf69d, _0x1ece4c);
    }
    _0x1d6380.appendChild(_0x5bf69d);
    _0x143480.appendChild(_0x1d6380);
  }
  return _0x143480;
}
function restoreNodeOverlays(_0x392ecb) {
  if (!_0x392ecb) {
    return;
  }
  const _0x1a9d3f = _0x392ecb.querySelector(".node-floating-toolbar");
  const _0xa3bdb = _0x392ecb.querySelector(".group-toolbar");
  const _0x79da33 = _0x392ecb.querySelector(".text-prompt-panel");
  if (_0x1a9d3f) {
    _0x1a9d3f.style.display = "";
  }
  if (_0xa3bdb) {
    _0xa3bdb.style.display = "";
  }
  if (_0x79da33) {
    _0x79da33.style.display = "";
  }
}
function hideNodeOverlays(_0x4a0532) {
  if (!_0x4a0532) {
    return;
  }
  const _0x4cfa9a = _0x4a0532.querySelector(".node-floating-toolbar");
  const _0x436666 = _0x4a0532.querySelector(".group-toolbar");
  const _0x439788 = _0x4a0532.querySelector(".text-prompt-panel");
  if (_0x4cfa9a) {
    _0x4cfa9a.style.display = "none";
  }
  if (_0x436666) {
    _0x436666.style.display = "none";
  }
  if (_0x439788) {
    _0x439788.style.display = "none";
  }
}
export function createRendererSelectionOverlay({
  getWrapper: _0x235c75,
  isMounted: _0x572feb,
  getSyncPlaybackState = a698_0x4433ee,
  subscribeSyncPlaybackState = a698_0xc8ff6
}) {
  let _0x2a0a87 = null;
  let _0x128752 = null;
  let _0x4c9f17 = null;
  let _0x32d5de = getSyncPlaybackState?.() || {
    active: false,
    loop: false
  };
  let _0x5253ec = new Set();
  const _0x39db18 = {
    geometrySig: "",
    resetBtnVisible: null,
    composeBtnVisible: null,
    composeBtnKind: ""
  };
  const _0x5ae17d = {
    centerSig: "",
    buttonStateSig: ""
  };
  const _0x3ee5c2 = (_0x1116f3, {
    mountedOnly = false
  } = {}) => {
    if (!_0x1116f3) {
      return null;
    }
    if (mountedOnly && !_0x572feb(_0x1116f3)) {
      return null;
    }
    return _0x235c75(_0x1116f3) || null;
  };
  const _0x100fa4 = () => {
    _0x39db18.geometrySig = "";
    _0x39db18.resetBtnVisible = null;
    _0x39db18.composeBtnVisible = null;
    _0x39db18.composeBtnKind = "";
    _0x5ae17d.centerSig = "";
    _0x5ae17d.buttonStateSig = "";
  };
  const _0x249bbf = () => {
    for (const _0x4c9153 of _0x5253ec) {
      restoreNodeOverlays(_0x3ee5c2(_0x4c9153));
    }
    _0x5253ec = new Set();
  };
  const _0x2b3b88 = (_0x5d246e, _0x17386d, _0x66142a) => {
    if (!_0x2a0a87) {
      return;
    }
    const _0x586df0 = Array.isArray(_0x5d246e) && _0x5d246e.length >= 2;
    if (!_0x586df0) {
      _0x249bbf();
    } else {
      const _0x143873 = new Set(_0x5d246e);
      const _0x554f5b = new Set();
      for (const _0x17ca56 of _0x5253ec) {
        if (_0x143873.has(_0x17ca56)) {
          continue;
        }
        restoreNodeOverlays(_0x3ee5c2(_0x17ca56));
      }
      for (const _0x461bc5 of _0x143873) {
        const _0x2767d3 = _0x3ee5c2(_0x461bc5, {
          mountedOnly: true
        });
        if (!_0x2767d3) {
          continue;
        }
        hideNodeOverlays(_0x2767d3);
        _0x554f5b.add(_0x461bc5);
      }
      _0x5253ec = _0x554f5b;
    }
    if (!_0x586df0) {
      if (_0x2a0a87.style.display !== "none") {
        _0x2a0a87.style.display = "none";
      }
      _0x39db18.geometrySig = "";
      _0x39db18.resetBtnVisible = null;
      _0x39db18.composeBtnVisible = null;
      _0x39db18.composeBtnKind = "";
      return;
    }
    const _0x236d3a = _0x2a0a87.querySelector(".v2-multi-select-tab button[data-ui-action=\"ms-sync-video-play\"]");
    const _0x13efa6 = _0x2a0a87.querySelector(".v2-multi-select-tab button[data-ui-action=\"ms-run-selected\"]");
    const _0x5a5bd7 = _0x2a0a87.querySelector(".v2-multi-select-tab button[data-ui-action=\"ms-batch-download\"]");
    const _0x4ca11e = _0x2a0a87.querySelector(".v2-multi-select-tab button[data-ui-action=\"ms-compose-video\"]");
    const _0x172548 = _0x2a0a87.querySelector(".v2-multi-select-tab button[data-ui-action=\"ms-reset-image-size\"]");
    const _0x4d6f4e = _0x2a0a87.querySelector(".v2-multi-select-tab button[data-ui-action=\"ms-create-collage\"]");
    if (_0x236d3a) {
      _0x236d3a.style.display = getSelectedSyncPlayableVideoCount(_0x17386d, _0x5d246e) >= 2 ? "" : "none";
      syncVideoPlaybackButtonPresentation(_0x236d3a, _0x32d5de);
    }
    if (_0x13efa6) {
      _0x13efa6.style.display = "";
      const _0x42e7e4 = _0x5d246e.some(_0x5c139c => isNodeType(_0x17386d[_0x5c139c], ["ai-text", "ai-image", "ai-video", "ai-audio"]));
      const _0x25e366 = _0x13efa6.dataset.batchActive === "true" || _0x5d246e.some(_0x386db7 => isNodeType(_0x17386d[_0x386db7], ["ai-text", "ai-image", "ai-video", "ai-audio"]) && _0x17386d[_0x386db7]?.isGenerating === true);
      const _0xda400c = _0x25e366 ? t("groupExecution.stopSelected") : t("coreUi.renderer.multiSelect.runSelected");
      _0x13efa6.dataset.tooltip = _0xda400c;
      _0x13efa6.setAttribute("aria-label", _0xda400c);
      _0x13efa6.setAttribute("aria-busy", String(_0x25e366));
      _0x13efa6.classList.toggle("is-active", _0x25e366);
      _0x13efa6.disabled = !_0x42e7e4 && !_0x25e366;
      _0x13efa6.classList.toggle("is-disabled", !_0x42e7e4 && !_0x25e366);
    }
    if (_0x5a5bd7) {
      _0x5a5bd7.style.display = "";
      const _0x9e184b = !hasBatchExportableSelection(_0x17386d, _0x5d246e);
      _0x5a5bd7.disabled = _0x9e184b;
      _0x5a5bd7.classList.toggle("is-disabled", _0x9e184b);
    }
    if (_0x172548) {
      const _0x50499f = _0x5d246e.some(_0x47801f => isNodeType(_0x17386d[_0x47801f], ["source-image", "source-video", "ai-image", "ai-video"]));
      const _0x101e07 = _0x66142a && _0x50499f;
      if (_0x39db18.resetBtnVisible !== _0x101e07) {
        _0x39db18.resetBtnVisible = _0x101e07;
        _0x172548.style.display = _0x101e07 ? "" : "none";
      }
    }
    if (_0x4d6f4e) {
      const _0x4a1be8 = _0x5d246e.filter(_0x336397 => isNodeType(_0x17386d[_0x336397], ["source-image", "ai-image", "storyboard"])).length;
      _0x4d6f4e.style.display = _0x4a1be8 >= 2 ? "" : "none";
    }
    if (_0x4ca11e) {
      const _0x5a4034 = getSelectedMediaComposeKind(_0x17386d, _0x5d246e);
      const _0xfb03d8 = !!_0x5a4034;
      if (_0x39db18.composeBtnVisible !== _0xfb03d8) {
        _0x39db18.composeBtnVisible = _0xfb03d8;
        _0x4ca11e.style.display = _0xfb03d8 ? "" : "none";
      }
      if (_0x39db18.composeBtnKind !== _0x5a4034) {
        _0x39db18.composeBtnKind = _0x5a4034;
        const _0x1b2ad8 = getMediaComposeButtonLabel(_0x5a4034);
        _0x4ca11e.dataset.composeKind = _0x5a4034;
        _0x4ca11e.dataset.tooltip = _0x1b2ad8;
        _0x4ca11e.setAttribute("aria-label", _0x1b2ad8);
      }
    }
    let _0x688415 = Infinity;
    let _0x2141b5 = Infinity;
    let _0x200b14 = -Infinity;
    let _0x230b72 = -Infinity;
    let _0x4ef183 = 0;
    for (const _0x3c09b6 of _0x5d246e) {
      const _0x81852a = _0x17386d[_0x3c09b6];
      if (!_0x81852a) {
        continue;
      }
      _0x4ef183 += 1;
      const _0x5340e8 = _0x81852a.width || 260;
      const _0x14f948 = _0x81852a.height || 100;
      const _0x23483a = _0x81852a.type === "group" ? _0x81852a.y : _0x81852a.y - 30;
      _0x688415 = Math.min(_0x688415, _0x81852a.x);
      _0x2141b5 = Math.min(_0x2141b5, _0x23483a);
      _0x200b14 = Math.max(_0x200b14, _0x81852a.x + _0x5340e8);
      _0x230b72 = Math.max(_0x230b72, _0x81852a.y + _0x14f948);
    }
    if (_0x4ef183 < 2) {
      if (_0x2a0a87.style.display !== "none") {
        _0x2a0a87.style.display = "none";
      }
      _0x39db18.geometrySig = "";
      return;
    }
    if (_0x2a0a87.style.display !== "block") {
      _0x2a0a87.style.display = "block";
    }
    const _0x291081 = 18;
    const _0x202efd = _0x688415 - _0x291081;
    const _0x2f1a4a = _0x2141b5 - _0x291081;
    const _0x29c228 = _0x200b14 - _0x688415 + _0x291081 * 2;
    const _0x8a862d = _0x230b72 - _0x2141b5 + _0x291081 * 2;
    const _0x1b0f49 = _0x202efd.toFixed(2) + "|" + _0x2f1a4a.toFixed(2) + "|" + _0x29c228.toFixed(2) + "|" + _0x8a862d.toFixed(2);
    if (_0x39db18.geometrySig !== _0x1b0f49) {
      _0x39db18.geometrySig = _0x1b0f49;
      _0x2a0a87.style.left = _0x202efd + "px";
      _0x2a0a87.style.top = _0x2f1a4a + "px";
      _0x2a0a87.style.width = _0x29c228 + "px";
      _0x2a0a87.style.height = _0x8a862d + "px";
    }
  };
  const _0x282758 = (_0xb0fb3, _0x96e568, _0x48ce5a = {}) => {
    if (!_0x128752) {
      return;
    }
    const _0xf89b8f = String(_0x48ce5a?.alignFeatureTriggerMode || "click");
    const _0x28b4b0 = _0x48ce5a?.alignFeatureEnabled !== false && _0xf89b8f !== "off";
    const _0x66898e = Array.isArray(_0xb0fb3) ? _0xb0fb3 : [];
    const _0x46e0b6 = getAlignableSelectionNodes(_0x96e568 || {}, _0x66898e);
    const _0x381719 = _0x28b4b0 && _0x48ce5a?.alignPanelVisible === true && _0x66898e.length >= 2 && _0x46e0b6.length >= 2;
    if (!_0x381719) {
      if (_0x128752.style.display !== "none") {
        _0x128752.style.display = "none";
      }
      _0x5ae17d.centerSig = "";
      _0x5ae17d.buttonStateSig = "";
      return;
    }
    const _0x1d2e9f = _0x48ce5a?.alignPanelAnchorWorld;
    const _0x13bd1b = !!_0x1d2e9f && Number.isFinite(_0x1d2e9f.x) && Number.isFinite(_0x1d2e9f.y);
    const _0x40a197 = _0x13bd1b ? null : computeSelectionBounds(_0x46e0b6);
    if (!_0x13bd1b && !_0x40a197) {
      if (_0x128752.style.display !== "none") {
        _0x128752.style.display = "none";
      }
      _0x5ae17d.centerSig = "";
      _0x5ae17d.buttonStateSig = "";
      return;
    }
    const _0x50cabe = _0x13bd1b ? Number(_0x1d2e9f.x) : _0x40a197.centerX;
    const _0x5ebf79 = _0x13bd1b ? Number(_0x1d2e9f.y) : _0x40a197.centerY;
    if (_0x128752.style.display !== "block") {
      _0x128752.style.display = "block";
    }
    const _0x25b6d6 = _0x50cabe.toFixed(2) + "|" + _0x5ebf79.toFixed(2);
    if (_0x5ae17d.centerSig !== _0x25b6d6) {
      _0x5ae17d.centerSig = _0x25b6d6;
      _0x128752.style.left = _0x50cabe + "px";
      _0x128752.style.top = _0x5ebf79 + "px";
    }
    const _0x145dc7 = _0x46e0b6.length >= 2;
    const _0x538bca = _0x145dc7 ? "1" : "0";
    if (_0x5ae17d.buttonStateSig !== _0x538bca) {
      _0x5ae17d.buttonStateSig = _0x538bca;
      const _0x5be02b = _0x128752._actionButtons || Array.from(_0x128752.querySelectorAll("button[data-ui-action]"));
      _0x128752._actionButtons = _0x5be02b;
      for (const _0x56a456 of _0x5be02b) {
        const _0xfbcae = _0x56a456.dataset.uiAction;
        const _0x4fe202 = _0xfbcae === "ms-distribute-h" || _0xfbcae === "ms-distribute-v";
        const _0xb7fad2 = _0x4fe202 ? !_0x145dc7 : false;
        _0x56a456.disabled = _0xb7fad2;
        _0x56a456.classList.toggle("is-disabled", _0xb7fad2);
      }
    }
  };
  const _0x1dc5d7 = _0x3a1f14 => {
    _0x4c9f17?.();
    _0x4c9f17 = null;
    _0x533ae5({
      restoreNodeChrome: true
    });
    _0x2a0a87?.remove?.();
    _0x128752?.remove?.();
    _0x2a0a87 = createMultiSelectBoxEl();
    _0x128752 = createAlignCenterPanelEl();
    _0x3a1f14.appendChild(_0x2a0a87);
    _0x3a1f14.appendChild(_0x128752);
    _0x4c9f17 = subscribeSyncPlaybackState?.(_0x44ff20 => {
      _0x32d5de = _0x44ff20 || {
        active: false,
        loop: false
      };
      syncVideoPlaybackButtonPresentation(_0x2a0a87?.querySelector?.(".v2-multi-select-tab button[data-ui-action=\"ms-sync-video-play\"]"), _0x32d5de);
    });
  };
  const _0x2ace2c = (_0x3a1963 = {}) => {
    _0x2b3b88(_0x3a1963.selectedNodeIds, _0x3a1963.nodes || {}, _0x3a1963.ui?.imageVideoNodeResizeEnabled === true);
    _0x282758(_0x3a1963.selectedNodeIds, _0x3a1963.nodes || {}, _0x3a1963.ui);
  };
  const _0x533ae5 = ({
    restoreNodeChrome = false
  } = {}) => {
    if (restoreNodeChrome) {
      _0x249bbf();
    } else {
      _0x5253ec = new Set();
    }
    _0x100fa4();
    if (_0x2a0a87) {
      _0x2a0a87.style.display = "none";
    }
    if (_0x128752) {
      _0x128752.style.display = "none";
    }
  };
  const _0x4d12e9 = () => {
    _0x4c9f17?.();
    _0x4c9f17 = null;
    _0x533ae5({
      restoreNodeChrome: true
    });
    _0x2a0a87?.remove?.();
    _0x128752?.remove?.();
    _0x2a0a87 = null;
    _0x128752 = null;
  };
  return Object.freeze({
    mount: _0x1dc5d7,
    render: _0x2ace2c,
    reset: _0x533ae5,
    unmount: _0x4d12e9
  });
}