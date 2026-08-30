import { canUseLocalAssetCleanup, formatCleanupBytes, scanLegacyLocalAssetCleanup, scanLocalAssetCleanup, summarizeLocalAssetCleanupScan, trashLocalAssetCleanup } from "../../services/localAssetCleanupService.js";
import { t } from "../../i18n/index.js";
import { showError, showSuccess } from "../../services/toastService.js";
const MAX_RENDERED_ITEMS = 120;
const CURRENT_CLEANUP_IDS = Object.freeze({
  card: "localAssetCleanupCard",
  scanBtn: "btnLocalAssetCleanupScan",
  trashBtn: "btnLocalAssetCleanupTrash",
  status: "localAssetCleanupStatus",
  count: "localAssetCleanupCount",
  size: "localAssetCleanupSize",
  list: "localAssetCleanupList"
});
const LEGACY_CLEANUP_IDS = Object.freeze({
  card: "legacyAssetCleanupCard",
  scanBtn: "btnLegacyAssetCleanupScan",
  trashBtn: "btnLegacyAssetCleanupTrash",
  status: "legacyAssetCleanupStatus",
  count: "legacyAssetCleanupCount",
  size: "legacyAssetCleanupSize",
  list: "legacyAssetCleanupList"
});
function fileSaveText(_0x44891e, _0x4e63cb = {}) {
  return t("settings.fileSave." + _0x44891e, _0x4e63cb);
}
function cleanupText(_0x159332, _0x2d30f8 = {}) {
  return fileSaveText("cleanupRuntime." + _0x159332, _0x2d30f8);
}
function errorMessage(_0x504166) {
  return _0x504166?.message || fileSaveText("runtime.unknownError");
}
function getElements(_0xc00fd6) {
  return {
    card: document.getElementById(_0xc00fd6.card),
    scanBtn: document.getElementById(_0xc00fd6.scanBtn),
    trashBtn: document.getElementById(_0xc00fd6.trashBtn),
    status: document.getElementById(_0xc00fd6.status),
    count: document.getElementById(_0xc00fd6.count),
    size: document.getElementById(_0xc00fd6.size),
    list: document.getElementById(_0xc00fd6.list)
  };
}
function setButtonBusy(_0x37f02a, _0x153aa4, _0x13df11) {
  if (!_0x37f02a) {
    return;
  }
  _0x37f02a.disabled = !!_0x153aa4;
  if (_0x13df11) {
    _0x37f02a.textContent = _0x13df11;
  }
}
function setStatus(_0x2389c2, _0x343dd8, _0x255dd6 = "") {
  if (!_0x2389c2) {
    return;
  }
  _0x2389c2.textContent = _0x343dd8 || "";
  _0x2389c2.classList.toggle("is-error", _0x255dd6 === "error");
  _0x2389c2.classList.toggle("is-success", _0x255dd6 === "success");
}
function createItemRow(_0x5f37ba) {
  const _0x148c8b = document.createElement("div");
  _0x148c8b.className = "settings-local-cleanup-item";
  const _0x23e797 = document.createElement("div");
  _0x23e797.className = "settings-local-cleanup-path";
  const _0x4fb622 = _0x5f37ba?.localPath || "";
  _0x23e797.textContent = _0x4fb622;
  _0x23e797.dataset.tooltip = _0x4fb622;
  _0x23e797.dataset.tooltipOverflow = "true";
  const _0xd1d440 = document.createElement("div");
  _0xd1d440.className = "settings-local-cleanup-meta";
  _0xd1d440.textContent = formatCleanupBytes(_0x5f37ba?.size) + " · " + (_0x5f37ba?.kind || cleanupText("mediaKind"));
  _0x148c8b.appendChild(_0x23e797);
  _0x148c8b.appendChild(_0xd1d440);
  return _0x148c8b;
}
function renderScanResult(_0x1a03c8, _0x3d29cf) {
  const _0x4541cb = Array.isArray(_0x1a03c8?.items) ? _0x1a03c8.items : [];
  if (_0x3d29cf.count) {
    _0x3d29cf.count.textContent = String(Number(_0x1a03c8?.orphanCount || 0));
  }
  if (_0x3d29cf.size) {
    _0x3d29cf.size.textContent = formatCleanupBytes(_0x1a03c8?.orphanBytes || 0);
  }
  setStatus(_0x3d29cf.status, summarizeLocalAssetCleanupScan(_0x1a03c8), _0x4541cb.length > 0 ? "" : "success");
  if (_0x3d29cf.list) {
    _0x3d29cf.list.replaceChildren();
    _0x3d29cf.list.hidden = _0x4541cb.length === 0;
    _0x4541cb.slice(0, MAX_RENDERED_ITEMS).forEach(_0x4d4113 => {
      _0x3d29cf.list.appendChild(createItemRow(_0x4d4113));
    });
    if (_0x4541cb.length > MAX_RENDERED_ITEMS) {
      const _0x3267e7 = document.createElement("div");
      _0x3267e7.className = "settings-local-cleanup-more";
      _0x3267e7.textContent = cleanupText("moreFiles", {
        count: _0x4541cb.length - MAX_RENDERED_ITEMS
      });
      _0x3d29cf.list.appendChild(_0x3267e7);
    }
  }
  if (_0x3d29cf.trashBtn) {
    _0x3d29cf.trashBtn.disabled = _0x4541cb.length === 0;
  }
}
function resetScanResult(_0x44676c) {
  if (_0x44676c.count) {
    _0x44676c.count.textContent = "0";
  }
  if (_0x44676c.size) {
    _0x44676c.size.textContent = "0 B";
  }
  if (_0x44676c.list) {
    _0x44676c.list.hidden = true;
    _0x44676c.list.replaceChildren();
  }
  if (_0x44676c.trashBtn) {
    _0x44676c.trashBtn.disabled = true;
  }
}
function initCleanupCard({
  ids: _0x3b751b,
  scan: _0x3fba81,
  textScope: _0x220389
}) {
  const _0x144897 = getElements(_0x3b751b);
  if (!_0x144897.card || !_0x144897.scanBtn || !_0x144897.trashBtn) {
    return;
  }
  const _0x645503 = (_0x3cf7af, _0x115005 = {}) => fileSaveText(_0x220389 + "." + _0x3cf7af, _0x115005);
  const _0xc0272 = canUseLocalAssetCleanup();
  _0x144897.card.hidden = !_0xc0272;
  if (!_0xc0272) {
    return;
  }
  let _0x3a4b3b = null;
  resetScanResult(_0x144897);
  setStatus(_0x144897.status, _0x645503("idle"));
  _0x144897.scanBtn.addEventListener("click", async () => {
    _0x3a4b3b = null;
    resetScanResult(_0x144897);
    setStatus(_0x144897.status, _0x645503("scanning"));
    setButtonBusy(_0x144897.scanBtn, true, _0x645503("scanBusy"));
    _0x144897.trashBtn.disabled = true;
    try {
      const _0x24d62e = await _0x3fba81();
      const _0x29d8c7 = {
        ..._0x24d62e,
        items: Array.isArray(_0x24d62e?.items) ? _0x24d62e.items : []
      };
      _0x3a4b3b = _0x29d8c7;
      renderScanResult(_0x29d8c7, _0x144897);
      if (Number(_0x29d8c7?.orphanCount || 0) > 0) {
        window.showToast?.(_0x645503("scanSuccess"), "success");
      } else {
        showSuccess(_0x645503("scanEmpty"));
      }
    } catch (_0xbb2241) {
      console.error("[Settings] 本地素材清理扫描失败:", _0xbb2241);
      setStatus(_0x144897.status, _0xbb2241?.message || cleanupText("scanFailed"), "error");
      showError(cleanupText("scanFailedDetail", {
        error: errorMessage(_0xbb2241)
      }));
    } finally {
      setButtonBusy(_0x144897.scanBtn, false, _0x645503("scan"));
      _0x144897.trashBtn.disabled = !_0x3a4b3b?.items?.length;
    }
  });
  _0x144897.trashBtn.addEventListener("click", async () => {
    const _0x3f2b73 = Array.isArray(_0x3a4b3b?.items) ? _0x3a4b3b.items : [];
    if (_0x3f2b73.length === 0) {
      return;
    }
    const _0x4bb622 = typeof window.confirm === "function" && window.confirm(cleanupText("confirmTrash", {
      prefix: _0x645503("confirmPrefix"),
      count: _0x3f2b73.length,
      bytes: formatCleanupBytes(_0x3a4b3b.orphanBytes)
    }));
    if (!_0x4bb622) {
      return;
    }
    setStatus(_0x144897.status, _0x645503("trashing"));
    setButtonBusy(_0x144897.trashBtn, true, _0x645503("trashBusy"));
    _0x144897.scanBtn.disabled = true;
    try {
      const _0x2e23ac = await trashLocalAssetCleanup(_0x3a4b3b, _0x3f2b73.map(_0xef387f => _0xef387f.localPath));
      const _0x10e8a9 = Array.isArray(_0x2e23ac?.skipped) ? _0x2e23ac.skipped.length : 0;
      const _0x346e7e = Array.isArray(_0x2e23ac?.errors) ? _0x2e23ac.errors.length : 0;
      const _0x27f355 = cleanupText("trashedMessage", {
        count: _0x2e23ac?.trashedCount || 0,
        bytes: formatCleanupBytes(_0x2e23ac?.trashedBytes || 0)
      });
      const _0x1c37df = await _0x3fba81();
      _0x3a4b3b = {
        ..._0x1c37df,
        items: Array.isArray(_0x1c37df?.items) ? _0x1c37df.items : []
      };
      renderScanResult(_0x3a4b3b, _0x144897);
      setStatus(_0x144897.status, _0x10e8a9 || _0x346e7e ? cleanupText("trashPartial", {
        message: _0x27f355,
        skipped: _0x10e8a9,
        failed: _0x346e7e
      }) : _0x27f355, _0x346e7e ? "error" : "success");
      if (_0x346e7e) {
        showError(cleanupText("trashPartialToast"));
      } else {
        showSuccess(_0x645503("success"));
      }
    } catch (_0x59cdf1) {
      console.error("[Settings] 本地素材清理失败:", _0x59cdf1);
      setStatus(_0x144897.status, _0x59cdf1?.message || cleanupText("trashFailed"), "error");
      showError(cleanupText("trashFailedDetail", {
        error: errorMessage(_0x59cdf1)
      }));
    } finally {
      setButtonBusy(_0x144897.trashBtn, false, _0x645503("trash"));
      _0x144897.scanBtn.disabled = false;
      _0x144897.trashBtn.disabled = !_0x3a4b3b?.items?.length;
    }
  });
}
export function initLocalAssetCleanupSettings() {
  initCleanupCard({
    ids: CURRENT_CLEANUP_IDS,
    scan: scanLocalAssetCleanup,
    textScope: "localCleanup"
  });
  initCleanupCard({
    ids: LEGACY_CLEANUP_IDS,
    scan: scanLegacyLocalAssetCleanup,
    textScope: "legacyCleanup"
  });
}