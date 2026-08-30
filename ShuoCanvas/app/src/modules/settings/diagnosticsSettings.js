import { canUseDiagnostics, createDiagnosticsPackage, openDiagnosticsLogsFolder, logDiagnosticEvent, logPerformanceSnapshot } from "../../services/diagnosticsService.js";
import { createAiDiagnosticsReport } from "../../services/aiDiagnosticsReport.js";
import { t } from "../../i18n/index.js";
function diagnosticsText(_0x5bf88, _0x1f9d04 = {}) {
  return t("settings.fileSave.diagnostics." + _0x5bf88, _0x1f9d04);
}
function setButtonBusy(_0x4e230d, _0x2937ad, _0x5cab34) {
  if (!_0x4e230d) {
    return;
  }
  _0x4e230d.disabled = Boolean(_0x2937ad);
  if (_0x5cab34) {
    _0x4e230d.textContent = _0x5cab34;
  }
}
export function initDiagnosticsSettings({
  graphStore = null
} = {}) {
  const _0x17f6df = document.getElementById("diagnosticsSettingsCard");
  const _0xa763f3 = document.getElementById("btnCreateDiagnosticsPackage");
  const _0x402b22 = document.getElementById("btnOpenDiagnosticsLogs");
  const _0xefc566 = document.getElementById("diagnosticsStatusText");
  if (!_0x17f6df || !_0xa763f3 || !_0x402b22) {
    return;
  }
  const _0x12bdbe = canUseDiagnostics();
  _0x17f6df.hidden = !_0x12bdbe;
  if (!_0x12bdbe) {
    return;
  }
  _0xa763f3.addEventListener("click", async () => {
    setButtonBusy(_0xa763f3, true, diagnosticsText("creating"));
    if (_0xefc566) {
      _0xefc566.textContent = diagnosticsText("collecting");
      _0xefc566.classList.remove("is-error");
    }
    try {
      const _0x55d9d4 = createAiDiagnosticsReport({
        graphStore: graphStore,
        reason: "settings_diagnostics_package"
      });
      await logDiagnosticEvent({
        type: "ai_diagnostics.report",
        level: "info",
        source: "renderer",
        message: "AI-readable diagnostics report captured",
        context: {
          report: _0x55d9d4
        }
      });
      await logPerformanceSnapshot("diagnostics_package");
      const _0x510b2d = await createDiagnosticsPackage({
        aiAnalysisReport: _0x55d9d4
      });
      if (_0x510b2d?.canceled) {
        if (_0xefc566) {
          _0xefc566.textContent = "";
        }
        return;
      }
      if (_0xefc566) {
        _0xefc566.textContent = _0x510b2d?.filename ? diagnosticsText("createdWithFile", {
          filename: _0x510b2d.filename
        }) : diagnosticsText("created");
      }
      window.showToast?.(diagnosticsText("created"), "success");
    } catch (_0x4540a2) {
      const _0x5d0e5a = _0x4540a2?.message || diagnosticsText("createFailed");
      await logDiagnosticEvent({
        type: "diagnostics.ui_create_failed",
        level: "error",
        source: "renderer",
        message: _0x5d0e5a,
        error: _0x4540a2
      });
      if (_0xefc566) {
        _0xefc566.textContent = _0x5d0e5a;
        _0xefc566.classList.add("is-error");
      }
      window.showToast?.(_0x5d0e5a, "error");
    } finally {
      setButtonBusy(_0xa763f3, false, diagnosticsText("create"));
    }
  });
  _0x402b22.addEventListener("click", async () => {
    try {
      await openDiagnosticsLogsFolder();
    } catch (_0x58481c) {
      await logDiagnosticEvent({
        type: "diagnostics.ui_open_logs_failed",
        level: "error",
        source: "renderer",
        message: _0x58481c?.message || diagnosticsText("openLogsFailed"),
        error: _0x58481c
      });
      window.showToast?.(_0x58481c?.message || diagnosticsText("openLogsFailed"), "error");
    }
  });
}