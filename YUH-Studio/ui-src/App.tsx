import { useCallback, useEffect, useMemo, useState } from "react";
import type { BackendStatus, SystemUsage, WorkspaceSettings } from "./types";

export function App() {
  const [backend, setBackend] = useState<BackendStatus | null>(null);
  const [usage, setUsage] = useState<SystemUsage | null>(null);
  const [workspace, setWorkspace] = useState<WorkspaceSettings | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    setError("");
    try {
      const [nextBackend, nextUsage, nextWorkspace] = await Promise.all([
        window.h3.backend.status(),
        window.h3.system.usage(),
        window.h3.workspace.get(),
      ]);
      setBackend(nextBackend);
      setUsage(nextUsage);
      setWorkspace(nextWorkspace);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : String(reason));
    }
  }, []);

  useEffect(() => {
    void refresh();
    const unsubscribeStatus = window.h3.backend.onStatus(setBackend);
    const unsubscribeLog = window.h3.backend.onLog((line) => {
      setLogs((current) => [...current.slice(-79), line]);
    });
    return () => {
      unsubscribeStatus();
      unsubscribeLog();
    };
  }, [refresh]);

  const startBackend = async () => {
    setBusy(true);
    setError("");
    try {
      await window.h3.backend.start();
      await refresh();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : String(reason));
    } finally {
      setBusy(false);
    }
  };

  const stopBackend = async () => {
    setBusy(true);
    setError("");
    try {
      await window.h3.backend.unloadGpu();
      await refresh();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : String(reason));
    } finally {
      setBusy(false);
    }
  };

  const statusLabel = useMemo(() => {
    if (!backend) return "读取中";
    return backend.state || backend.status || "未知";
  }, [backend]);

  return (
    <main className="shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">YUH STUDIO / TSX WORKSPACE</p>
          <h1>可组合的创作工作台</h1>
          <p className="subtitle">这是新的 React + TypeScript 迁移入口，复用原 Electron IPC 能力。</p>
        </div>
        <div className="topbar-actions">
          <span className={`status-dot ${backend?.state === "ready" ? "ready" : ""}`} />
          <span>{statusLabel}</span>
          <button className="ghost" onClick={() => void refresh()} disabled={busy}>刷新</button>
        </div>
      </header>

      {error && <div className="error">{error}</div>}

      <section className="grid">
        <article className="card hero-card">
          <div className="card-heading">
            <div>
              <p className="eyebrow">BACKEND</p>
              <h2>本地生成引擎</h2>
            </div>
            <span className="pill">IPC 已连接</span>
          </div>
          <p className="metric">{statusLabel}</p>
          <p className="muted">模型目录：{workspace?.modelsDir || "尚未配置"}</p>
          <p className="muted">ComfyUI：{workspace?.comfyuiDir || "尚未配置"}</p>
          <div className="button-row">
            <button onClick={() => void startBackend()} disabled={busy}>启动后端</button>
            <button className="secondary" onClick={() => void stopBackend()} disabled={busy}>释放 GPU</button>
          </div>
        </article>

        <article className="card">
          <div className="card-heading"><h2>系统资源</h2><span className="pill">实时</span></div>
          <div className="stats">
            <div><span>CPU</span><strong>{formatPercent(usage?.cpuPercent)}</strong></div>
            <div><span>内存</span><strong>{formatPercent(usage?.memoryPercent)}</strong></div>
            <div><span>GPU</span><strong>{formatPercent(usage?.gpuPercent)}</strong></div>
          </div>
          <p className="muted">工作区输出：{workspace?.outputDir || "尚未配置"}</p>
        </article>

        <article className="card logs-card">
          <div className="card-heading"><h2>引擎日志</h2><button className="ghost" onClick={() => setLogs([])}>清空</button></div>
          <pre>{logs.length ? logs.join("\n") : "等待引擎事件…"}</pre>
        </article>
      </section>

      <footer>
        <span>源码：ui-src/</span>
        <span>旧版 UI：dev-src/renderer/</span>
        <span>运行命令：npm run ui:dev</span>
      </footer>
    </main>
  );
}

function formatPercent(value: number | undefined) {
  return typeof value === "number" ? `${Math.round(value)}%` : "—";
}
