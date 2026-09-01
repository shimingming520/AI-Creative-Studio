import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type {
  BackendStatus,
  TaskItem,
  WorkflowInspect,
  WorkflowListItem,
  WorkflowValidation,
  WorkspaceSettings,
} from "./types";

type SelectedFile = { path: string; kind: string };

export function App() {
  const [backend, setBackend] = useState<BackendStatus | null>(null);
  const [workspace, setWorkspace] = useState<WorkspaceSettings | null>(null);
  const [library, setLibrary] = useState<{ root: string; items: WorkflowListItem[] }>({ root: "", items: [] });
  const [selected, setSelected] = useState<WorkflowListItem | null>(null);
  const [inspect, setInspect] = useState<WorkflowInspect | null>(null);
  const [validation, setValidation] = useState<WorkflowValidation | null>(null);
  const [params, setParams] = useState<Record<string, string | number>>({});
  const [randomizeSeed, setRandomizeSeed] = useState(false);
  const [modelFiles, setModelFiles] = useState<Record<string, string>>({});
  const [files, setFiles] = useState<SelectedFile[]>([]);
  const [activeTask, setActiveTask] = useState<TaskItem | null>(null);
  const [history, setHistory] = useState<TaskItem[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const autoStartTried = useRef(false);
  const loadSeq = useRef(0);

  const refresh = useCallback(async () => {
    setError("");
    try {
      const [nextBackend, nextWorkspace, nextLibrary] = await Promise.all([
        window.h3.backend.status(),
        window.h3.workspace.get(),
        window.h3.workflows.list().catch(() => ({ root: "", items: [] })),
      ]);
      setBackend(nextBackend);
      setWorkspace(nextWorkspace);
      setLibrary({ root: nextLibrary.root, items: nextLibrary.items || [] });
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : String(reason));
    }
  }, []);

  useEffect(() => {
    void refresh();
    const unsubscribeStatus = window.h3.backend.onStatus(setBackend);
    const unsubscribeTask = window.h3.tasks.onUpdate((task) => {      if (task.kind === "custom-workflow") {
        setActiveTask((current) => (current && current.id === task.id ? task : current));
        setHistory((current) => {
          const rest = current.filter((item) => item.id !== task.id);
          return [task, ...rest].slice(0, 60);
        });
        if (task.status === "succeeded" || task.status === "failed" || task.status === "cancelled") {
          setActiveTask(null);
        }
      }
    });
    void window.h3.tasks
      .list()
      .then((items) => {
        const list = Array.isArray(items) ? items : (items as { items: TaskItem[] }).items || [];
        setHistory(list.filter((item) => item.kind === "custom-workflow"));
        const active = list.find(
          (item) => item.kind === "custom-workflow" && (item.status === "queued" || item.status === "running"),
        );
        if (active) setActiveTask(active);
      })
      .catch(() => void 0);
    return () => {
      unsubscribeStatus();
      unsubscribeTask();
    };
  }, [refresh]);

  // 与旧版一致：已配置的本地引擎在进入页面时自动启动
  useEffect(() => {
    if (autoStartTried.current) return;
    if (!workspace || !workspace.configured) return;
    if (backend?.state === "ready" || backend?.state === "starting") return;
    autoStartTried.current = true;
    setBusy(true);
    window.h3.backend
      .start()
      .then((status) => setBackend(status as BackendStatus))
      .catch((reason) => {
        autoStartTried.current = false;
        setError(reason instanceof Error ? reason.message : String(reason));
      })
      .finally(() => setBusy(false));
  }, [workspace?.configured, backend?.state]);

  const startEngine = useCallback(async () => {
    setBusy(true);
    setError("");
    try {
      const status = await window.h3.backend.start();
      setBackend(status as BackendStatus);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : String(reason));
    } finally {
      setBusy(false);
    }
  }, []);

  const unloadGpu = useCallback(async () => {
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
  }, [refresh]);

  const selectWorkflow = useCallback(async (item: WorkflowListItem) => {
    setSelected(item);
    setInspect(null);
    setValidation(null);
    setParams({});
    setRandomizeSeed(false);
    setModelFiles({});
    setFiles([]);
    setActiveTask(null);
    setError("");
    const seq = ++loadSeq.current;
    setBusy(true);
    try {
      const [info, check] = await Promise.all([
        window.h3.workflows.inspect(item.path).catch(() => null),
        window.h3.workflows.validate(item.path).catch(() => null),
      ]);
      if (seq !== loadSeq.current) return;
      setInspect(info);
      setValidation(check);
      if (info) {
        const initial: Record<string, string | number> = {};
        for (const key of ["prompt", "width", "height", "length", "steps", "seed", "cfg", "fps"]) {
          const value = info.slotValues[key];
          if (value !== undefined && value !== null) initial[key] = value as string | number;
        }
        setParams(initial);
        const modelOverrides: Record<string, string> = {};
        for (const slot of info.modelSlots) {
          modelOverrides[`${slot.nodeId}::${slot.input}`] = slot.value;
        }
        setModelFiles(modelOverrides);
      }
    } finally {
      if (seq === loadSeq.current) setBusy(false);
    }
  }, []);

  const pickFiles = useCallback(async () => {
    if (!inspect) return;
    const kinds = [...new Set(inspect.fileSlots.map((slot) => slot.kind))];
    const picked: SelectedFile[] = [];
    for (const kind of kinds) {
      const items = (await window.h3.files.pick(kind).catch((reason) => {
        setError(reason instanceof Error ? reason.message : String(reason));
        return [] as { path: string; kind?: string }[];
      })) as { path: string; kind?: string }[];
      for (const item of items) {
        picked.push({ path: item.path, kind: item.kind || kind });
      }
    }
    setFiles(picked);
  }, [inspect]);

  const run = useCallback(async () => {
    if (!selected || !inspect) return;
    setBusy(true);
    setError("");
    try {
      const task = await window.h3.workflows.run({
        path: selected.path,
        prompt: typeof params.prompt === "string" ? params.prompt : undefined,
        width: typeof params.width === "number" ? params.width : undefined,
        height: typeof params.height === "number" ? params.height : undefined,
        length: typeof params.length === "number" ? params.length : undefined,
        steps: typeof params.steps === "number" ? params.steps : undefined,
        cfg: typeof params.cfg === "number" ? params.cfg : undefined,
        fps: typeof params.fps === "number" ? params.fps : undefined,
        seed: typeof params.seed === "number" ? params.seed : undefined,
        randomizeSeed,
        duration: typeof params.length === "number" ? Math.round(params.length / 24) : undefined,
        modelFiles,
        files: files.map((f) => ({ path: f.path, kind: f.kind })),
      });
      setActiveTask(task);
      setHistory((current) => [task, ...current.filter((item) => item.id !== task.id)].slice(0, 60));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : String(reason));
    } finally {
      setBusy(false);
    }
  }, [selected, inspect, params, randomizeSeed, modelFiles, files]);

  const cancel = useCallback(async () => {
    if (!activeTask) return;
    setBusy(true);
    try {
      await window.h3.workflows.cancel(activeTask.id);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : String(reason));
    } finally {
      setBusy(false);
    }
  }, [activeTask]);

  const groups = useMemo(() => {
    const map = new Map<string, WorkflowListItem[]>();
    for (const item of library.items) {
      const folder = item.relName.includes("/") ? item.relName.split("/")[0] : "（根目录）";
      if (!map.has(folder)) map.set(folder, []);
      map.get(folder)!.push(item);
    }
    return [...map.entries()];
  }, [library.items]);

  const backendReady = backend?.state === "ready";
  const slotKeys = ["prompt", "width", "height", "length", "steps", "cfg", "fps", "seed"] as const;

  return (
    <main className="shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">YUH STUDIO / 自定义工作流</p>
          <h1>ComfyUI 工作流直连</h1>
          <p className="subtitle">
            直接运行 ComfyUI 网页里保存的工作流（user/default/workflows 自动同步），参数自动识别、模型可更换。
          </p>
        </div>
        <div className="topbar-actions">
          <span className={`status-dot ${backendReady ? "ready" : ""}`} />
          <span>{backend?.message || backend?.state || "读取中"}</span>
          <button
            className="ghost"
            onClick={() => void startEngine()}
            disabled={busy || backend?.state === "ready" || backend?.state === "starting"}
          >
            启动引擎
          </button>
          <button className="ghost" onClick={() => void unloadGpu()} disabled={busy || backend?.state !== "ready"}>
            释放 GPU
          </button>
          <button className="ghost" onClick={() => void refresh()} disabled={busy}>
            刷新
          </button>
        </div>
      </header>

      {error && <div className="error">{error}</div>}

      <section className="workflow-grid">
        <aside className="card workflows-panel">
          <div className="card-heading">
            <div>
              <p className="eyebrow">WORKFLOWS</p>
              <h2>工作流库</h2>
            </div>
            <span className="pill">{library.items.length} 个</span>
          </div>
          <p className="muted break-all">{library.root || "未配置 ComfyUI 目录"}</p>
          <div className="workflow-tree">
            {groups.map(([folder, items]) => (
              <div className="tree-group" key={folder}>
                <div className="tree-folder">{folder}</div>
                {items.map((item) => (
                  <button
                    key={item.path}
                    className={`tree-item ${selected?.path === item.path ? "selected" : ""}`}
                    onClick={() => void selectWorkflow(item)}
                    title={item.path}
                  >
                    <span className="tree-name">{item.relName.includes("/") ? item.relName.split("/").slice(1).join("/") : item.relName}</span>
                    <span className="tree-meta">
                      {item.format === "invalid" ? "解析失败" : `${item.nodeCount ?? 0} 节点 · ${item.format === "api" ? "API" : item.format === "ui" ? "UI" : item.format || "?"}`}
                    </span>
                  </button>
                ))}
              </div>
            ))}
            {groups.length === 0 && (
              <p className="muted">没有找到工作流。请在 ComfyUI 网页里保存工作流（会写入 user/default/workflows）。</p>
            )}
          </div>
        </aside>

        <section className="card params-panel">
          <div className="card-heading">
            <div>
              <p className="eyebrow">PARAMS</p>
              <h2>{selected ? selected.relName.split("/").pop() : "选择一个工作流"}</h2>
            </div>
            {inspect && <span className="pill">{inspect.nodeCount} 节点</span>}
          </div>
          {!inspect && <p className="muted">点击左侧工作流以载入并识别参数。识别不完整的工作流仍可运行，其余设置保持工作流内原值。</p>}

          {inspect && (
            <div className="param-form">
              {slotKeys.map((key) => {
                const slots = inspect.slots[key] || [];
                if (!slots.length) return null;
                const first = slots[0];
                const label = key === "prompt" ? "提示词" : key === "width" ? "宽度" : key === "height" ? "高度" : key === "length" ? "时长(帧)" : key === "steps" ? "步数" : key === "cfg" ? "CFG" : key === "fps" ? "FPS" : "种子";
                return (
                  <label className="field" key={key}>
                    <span>
                      {label}
                      <small title={`节点 ${first.nodeId} · ${first.label} · 输入 ${first.input}`}>→ {first.label}</small>
                    </span>
                    {key === "prompt" ? (
                      <textarea
                        rows={5}
                        value={typeof params[key] === "string" ? params[key] : ""}
                        onChange={(event) => setParams((p) => ({ ...p, [key]: event.target.value }))}
                      />
                    ) : (
                      <input
                        type="number"
                        value={typeof params[key] === "number" ? params[key] : ""}
                        onChange={(event) =>
                          setParams((p) => ({ ...p, [key]: event.target.value === "" ? "" : Number(event.target.value) }))
                        }
                      />
                    )}
                    {key === "seed" && (
                      <label className="inline-check">
                        <input type="checkbox" checked={randomizeSeed} onChange={(event) => setRandomizeSeed(event.target.checked)} />
                        每次随机
                      </label>
                    )}
                  </label>
                );
              })}

              {inspect.modelSlots.length > 0 && (
                <div className="section-title">模型文件（校验通过后提交）</div>
              )}
              {inspect.modelSlots.map((slot) => {
                const meta = validation?.modelSlots.find((item) => item.nodeId === slot.nodeId && item.input === slot.input);
                const key = `${slot.nodeId}::${slot.input}`;
                const options = meta?.candidates || [];
                const current = modelFiles[key] || slot.value;
                return (
                  <label className="field" key={key}>
                    <span>
                      {slot.input}
                      <small title={`节点 ${slot.nodeId} · ${slot.nodeTitle}`}>
                        {meta ? (meta.found ? "已找到" : "缺失") : "未校验"}
                      </small>
                    </span>
                    <select value={current} onChange={(event) => setModelFiles((m) => ({ ...m, [key]: event.target.value }))}>
                      {!options.includes(current) && <option value={current}>{current}</option>}
                      {options.map((name) => (
                        <option key={name} value={name}>
                          {name.replace(/\\/g, "/").split("/").pop()}
                        </option>
                      ))}
                    </select>
                  </label>
                );
              })}

              {inspect.fileSlots.length > 0 && (
                <div className="section-title">素材（按类型依次填入 LoadImage/LoadVideo/LoadAudio）</div>
              )}
              {inspect.fileSlots.map((slot) => {
                const matched = files.find((f) => f.kind === slot.kind);
                return (
                  <div className="field readonly" key={`${slot.nodeId}::${slot.input}`}>
                    <span>
                      {slot.nodeTitle} · {slot.input}
                      <small>{slot.kind === "image" ? "图片" : slot.kind === "video" ? "视频" : "音频"}</small>
                    </span>
                    <div className="file-row">
                      <code>{matched ? matched.path : `未选择（原: ${slot.value}）`}</code>
                    </div>
                  </div>
                );
              })}
              {inspect.fileSlots.length > 0 && (
                <button className="ghost" onClick={() => void pickFiles()}>
                  选择素材…
                </button>
              )}

              {validation && validation.nodeIssues.length > 0 && (
                <div className="issues">
                  <div className="section-title">校验问题</div>
                  {validation.nodeIssues.map((issue, index) => (
                    <p className="warn" key={index}>
                      {issue.message}
                    </p>
                  ))}
                </div>
              )}
              {validation && !validation.backendReachable && (
                <p className="warn">无法连接引擎校验，请确认本地引擎已就绪后重启本页。</p>
              )}
              {inspect.outputNodes.length > 0 && (
                <div className="section-title">
                  输出节点：{inspect.outputNodes.map((o) => o.title).join("、")}
                </div>
              )}
            </div>
          )}

          {selected && inspect && (
            <div className="button-row sticky-actions">
              <button onClick={() => void run()} disabled={busy || backend?.state !== "ready" || activeTask !== null}>
                {activeTask ? `运行中 ${activeTask.progress ?? 0}%` : "运行工作流"}
              </button>
              {activeTask && (
                <button className="secondary" onClick={() => void cancel()} disabled={busy}>
                  停止
                </button>
              )}
            </div>
          )}
        </section>

        <section className="card output-panel">
          <div className="card-heading">
            <div>
              <p className="eyebrow">OUTPUT</p>
              <h2>结果</h2>
            </div>
            {activeTask && <span className="pill">{activeTask.progress ?? 0}%</span>}
          </div>
          {activeTask && (
            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${activeTask.progress ?? 0}%` }} />
            </div>
          )}
          <OutputViewer task={activeTask} />
          <div className="section-title">历史（自定义工作流）</div>
          <div className="history-list">
            {history.map((task) => (
              <div className={`history-item status-${task.status}`} key={task.id}>
                <div>
                  <strong>{task.workflowName || task.id.slice(0, 8)}</strong>
                  <small>
                    {task.status} · {task.progress ?? 0}%{(task.error ? ` · ${task.error}` : "")}
                  </small>
                </div>
              </div>
            ))}
            {history.length === 0 && <p className="muted">还没有运行记录。</p>}
          </div>
        </section>
      </section>
    </main>
  );
}

function OutputViewer({ task }: { task: TaskItem | null }) {
  const paths = task?.outputPaths || [];
  if (!paths.length) return <p className="muted">没有输出（完成任务后显示）。</p>;
  return (
    <div className="output-grid">
      {paths.map((p) => {
        const url = "file:///" + p.replace(/\\/g, "/");
        return /\.(mp4|webm|mov|mkv)$/i.test(p) ? (
          <video key={p} src={url} controls className="output-media" />
        ) : /\.(mp3|wav|flac|m4a|ogg)$/i.test(p) ? (
          <audio key={p} src={url} controls />
        ) : (
          <img key={p} src={url} className="output-media" />
        );
      })}
    </div>
  );
}
